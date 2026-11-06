// Character consistency metrics and reference fitting for sprite frames.
// Measures what keeps a character recognisable between frames: palette,
// body colour, outline colour, line weight and placement.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { decodePng, encodePng, alphaBounds, trim } from './png.mjs';

const OPAQUE = 128;

function hist(img) {
  const h = new Float64Array(512);
  let n = 0;
  for (let i = 0; i < img.data.length; i += 4) {
    if (img.data[i + 3] < OPAQUE) continue;
    h[((img.data[i] >> 5) << 6) | ((img.data[i + 1] >> 5) << 3) | (img.data[i + 2] >> 5)]++;
    n++;
  }
  for (let i = 0; i < 512; i++) h[i] /= n || 1;
  return h;
}

const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** Features of one frame. */
/** Ink (outline) luminance limit: below 62 % of the body's luminance, at most 140.
 *  Keeps a blue-bodied character's darker body speckles out of the outline. */
export function inkMax(bodyColor) { return Math.min(140, 0.62 * lum(...bodyColor)); }

function bodyOf(d) {
  const body = [0, 0, 0, 0];
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < OPAQUE) continue;
    const L = lum(d[i], d[i + 1], d[i + 2]);
    if (L >= 120 && L < 235) { body[0] += d[i]; body[1] += d[i + 1]; body[2] += d[i + 2]; body[3]++; }
  }
  return body;
}

const avg = (a) => a[3] ? a.slice(0, 3).map((v) => Math.round(v / a[3])) : [0, 0, 0];

/** Features of one frame. */
export function features(img) {
  const b = alphaBounds(img, OPAQUE);
  const h = hist(img);
  const d = img.data;
  const body = bodyOf(d);
  const bodyColor = avg(body);
  const tInk = inkMax(bodyColor);
  const line = [0, 0, 0, 0], ink = [0, 0, 0, 0];
  let opaque = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < OPAQUE) continue;
    opaque++;
    const p = [d[i], d[i + 1], d[i + 2]];
    const L = lum(...p);
    if (L < 120) { line[0] += p[0]; line[1] += p[1]; line[2] += p[2]; line[3]++; }
    // Outline ink colour: dark blue-hued pixels only (bill/leg edges are dark orange).
    if (L < tInk && p[2] > p[0] + 15) { ink[0] += p[0]; ink[1] += p[1]; ink[2] += p[2]; ink[3]++; }
  }
  return {
    bounds: b,
    hist: h,
    bodyColor,
    lineColor: avg(ink[3] ? ink : line),
    // Outline pixels relative to sqrt(area): roughly line thickness, independent of scale and pose.
    lineWeight: +(line[3] / Math.sqrt(opaque || 1)).toFixed(2),
    bodyShare: +(body[3] / (opaque || 1)).toFixed(3),
  };
}

const intersect = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += Math.min(a[i], b[i]); return s; };

function meanHist(fs_) {
  const m = new Float64Array(512);
  for (const f of fs_) for (let i = 0; i < 512; i++) m[i] += f.hist[i] / fs_.length;
  return m;
}

/**
 * Score a candidate against reference frames (0-100, higher = closer).
 * Reference frames themselves typically score 85-95 against each other.
 */
export function score(cand, refs) {
  const refH = meanHist(refs);
  const mean = (k) => [0, 1, 2].map((j) => refs.reduce((s, r) => s + r[k][j], 0) / refs.length);
  const refWeight = refs.reduce((s, r) => s + r.lineWeight, 0) / refs.length;
  const palette = intersect(cand.hist, refH); // 0..1
  const bodyD = dist(cand.bodyColor, mean('bodyColor'));
  const lineD = dist(cand.lineColor, mean('lineColor'));
  const weightRatio = cand.lineWeight / (refWeight || 1);
  const parts = {
    palette: Math.round(palette * 100),
    body: Math.round(Math.max(0, 100 - bodyD * 2)),
    outline: Math.round(Math.max(0, 100 - lineD * 2)),
    lineWeight: Math.round(Math.max(0, 100 - Math.abs(Math.log(weightRatio || 1e-3)) * 150)),
  };
  const total = Math.round(parts.palette * 0.35 + parts.body * 0.25 + parts.outline * 0.2 + parts.lineWeight * 0.2);
  return { total, parts, bodyColor: cand.bodyColor, lineColor: cand.lineColor, lineWeight: cand.lineWeight, refLineWeight: +refWeight.toFixed(2) };
}

/**
 * Pull outline pixels (dark, low luminance) to the reference outline colour,
 * keeping their relative shading. Fixes the most visible frame-to-frame drift.
 */
export function lockLine(img, target) {
  const d = img.data;
  const t = inkMax(avg(bodyOf(d)));
  const isLine = (i) => d[i + 3] >= 16 && d[i + 2] > d[i] + 15 && lum(d[i], d[i + 1], d[i + 2]) < t;
  const acc = [0, 0, 0, 0];
  for (let i = 0; i < d.length; i += 4) if (isLine(i)) { acc[0] += d[i]; acc[1] += d[i + 1]; acc[2] += d[i + 2]; acc[3]++; }
  if (!acc[3]) return img;
  const Ls = lum(acc[0] / acc[3], acc[1] / acc[3], acc[2] / acc[3]) || 1;
  for (let i = 0; i < d.length; i += 4) {
    if (!isLine(i)) continue;
    const L = lum(d[i], d[i + 1], d[i + 2]);
    const w = L < t - 40 ? 1 : (t - L) / 40; // soft edge towards fill colours
    const k = L / Ls;
    for (let j = 0; j < 3; j++) d[i + j] = Math.round(d[i + j] * (1 - w) + Math.min(255, target[j] * k) * w);
  }
  return img;
}

/**
 * Shift fill colours (body band, not outline or highlights) so the body's mean
 * colour matches the reference body colour. Small drift only: shift capped at 24.
 */
export function matchBody(img, target) {
  const d = img.data;
  const src = avg(bodyOf(d));
  const shift = [0, 1, 2].map((j) => Math.max(-24, Math.min(24, target[j] - src[j])));
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 16) continue;
    const L = lum(d[i], d[i + 1], d[i + 2]);
    if (L < 100 || L >= 245) continue;
    const w = L < 120 ? (L - 100) / 20 : 1;
    for (let j = 0; j < 3; j++) d[i + j] = Math.max(0, Math.min(255, Math.round(d[i + j] + shift[j] * w)));
  }
  return img;
}

export function loadFeatures(file) { return features(decodePng(fs.readFileSync(file))); }

/**
 * Fit a generated frame to the house layout: trim, scale so the character has
 * `height` px, and place it on a `canvas`-sized square with its feet at `bottom`
 * and centred at `centerX`. Wider poses are scaled down to fit.
 * `area` (opaque px of the reference) scales by area instead of height.
 */
export function fitToLayout(srcFile, outFile, { canvas = 256, height = 182, bottom = 238, centerX = 140, margin = 4, lineColor = null, bodyColor = null, area = null } = {}) {
  const t = trim(decodePng(fs.readFileSync(srcFile)), { threshold: 8 });
  if (lineColor) lockLine(t, lineColor);
  if (bodyColor) matchBody(t, bodyColor);
  // area: match the reference's opaque pixel count instead of its height, so
  // crouches stay low and stretches stay tall (pose-invariant size).
  let scale = height / t.height;
  if (area) { let n = 0; for (let i = 3; i < t.data.length; i += 4) if (t.data[i] >= 128) n++; scale = Math.sqrt(area / (n || 1)); }
  if (t.width * scale > canvas - margin * 2) scale = (canvas - margin * 2) / t.width;
  if (t.height * scale > bottom - margin) scale = (bottom - margin) / t.height;
  const w = Math.max(1, Math.round(t.width * scale)), h = Math.max(1, Math.round(t.height * scale));
  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'imagegen-fit-')), 't.png');
  fs.writeFileSync(tmp, encodePng(t));
  execFileSync('sips', ['-z', String(h), String(w), tmp, '--out', tmp], { stdio: 'ignore' });
  const s = decodePng(fs.readFileSync(tmp));
  const out = new Uint8Array(canvas * canvas * 4);
  const ox = Math.min(canvas - s.width - margin, Math.max(margin, Math.round(centerX - s.width / 2)));
  const oy = Math.max(0, bottom - s.height);
  for (let y = 0; y < s.height && oy + y < canvas; y++) {
    out.set(s.data.subarray(y * s.width * 4, (y + 1) * s.width * 4), ((oy + y) * canvas + ox) * 4);
  }
  fs.writeFileSync(outFile, encodePng({ width: canvas, height: canvas, data: out }));
  return { width: w, height: h, x: ox, y: oy };
}
