// Measuring shown in time: unit pieces laid and counted, one length in two units, a ruler's gaps
// counted one by one, and a metre filled by ten 10 cm pieces. Shared by the measuring lessons.
import { anim, ease, type AnimPaint } from '../ui/anim';
import { word } from './fi';
import { VESSELS } from './pics';

export /** Unit pieces drop under a ribbon one at a time and are counted (with a gap: the count comes out wrong). */
function layScene(n: number, gapAt = -1): AnimPaint {
  const U = 28, len = gapAt >= 0 ? n + 1 : n, step = 0.8, X = (300 - len * U) / 2;
  const end = 1 + n * step;
  return anim({
    dur: end + 1.5, w: 300, h: 100, label: gapAt >= 0 ? 'Paloja ladotaan nauhan alle, välissä rako' : 'Paloja ladotaan nauhan alle peräkkäin',
    frame: (t) => {
      let s = `<rect x="${X}" y="10" width="${len * U}" height="26" rx="7" fill="var(--blue)"/>`;
      let x = X;
      for (let k = 0; k < n; k++) {
        const at = 1 + k * step, k1 = ease(t, at, at + 0.35);
        if (t >= at) s += `<g opacity="${k1}"><rect x="${x + 2}" y="${46 - (1 - k1) * 24}" width="${U - 4}" height="22" rx="4" fill="var(--sun)" stroke="#b08a10"/>` +
          `<text x="${x + U / 2}" y="${62 - (1 - k1) * 24}" text-anchor="middle" font-size="13" font-weight="800" fill="#3a2a00">${k + 1}</text></g>`;
        x += U;
        if (k === gapAt) {
          if (t >= end) s += `<rect x="${x + 1}" y="44" width="${U - 2}" height="26" rx="4" fill="none" stroke="var(--red)" stroke-width="2.5" stroke-dasharray="4 3"/><text x="${x + U / 2}" y="88" text-anchor="middle" font-size="12" font-weight="700" fill="var(--red)">rako</text>`;
          x += U;
        }
      }
      return s;
    },
    caption: (t) => {
      const c = Math.min(n, Math.max(0, Math.floor((t - 1) / step) + 1));
      if (t < 1) return 'Palat laitetaan nauhan alkupäästä alkaen.';
      if (t < end) return `${c}…`;
      return gapAt >= 0 ? `Paloja on ${word(n)}, mutta rakoon mahtuisi vielä yksi. Nauha on oikeasti ${word(n + 1)} palaa pitkä.` : `Palat yltävät nauhan loppuun. Nauha on ${word(n)} palaa pitkä.`;
    },
  });
}

export /** One ribbon measured twice: small pieces in the first row, then big pieces (f times as long) in the second. */
function twoUnitScene(small: number, f: number): AnimPaint {
  const U = Math.min(28, 260 / small), L = small * U, X = (300 - L) / 2, big = small / f, step = 0.6;
  const t2 = 1.5 + small * step;
  const row = (t: number, at0: number, n: number, w: number, y: number, col: string) => {
    let s = '';
    for (let k = 0; k < n; k++) {
      const at = at0 + k * step, e = ease(t, at, at + 0.3);
      if (t >= at) s += `<g opacity="${e}"><rect x="${X + k * w + 2}" y="${y - (1 - e) * 20}" width="${w - 4}" height="20" rx="4" fill="${col}" stroke="#7a6a3a"/><text x="${X + k * w + w / 2}" y="${y + 15 - (1 - e) * 20}" text-anchor="middle" font-size="12" font-weight="800" fill="#2a2000">${k + 1}</text></g>`;
    }
    return s;
  };
  return anim({
    dur: t2 + big * step + 1.5, w: 300, h: 120, label: 'Sama nauha mitataan pienillä ja isoilla paloilla',
    frame: (t) => `<rect x="${X}" y="8" width="${L}" height="24" rx="7" fill="var(--blue)"/>` +
      row(t, 1, small, U, 42, 'var(--sun)') + row(t, t2, big, U * f, 78, '#f29a52') +
      (t >= t2 + big * step + 0.3 ? `<text x="${X + L + 4}" y="57" font-size="13" font-weight="800" fill="currentColor">${small}</text><text x="${X + L + 4}" y="93" font-size="13" font-weight="800" fill="currentColor">${big}</text>` : ''),
    caption: (t) => t < 1 ? 'Mitataan sama nauha kahdesti.' : t < t2 ? 'Pienillä paloilla…' : t < t2 + big * step + 0.3 ? 'Isoilla paloilla…' : `${small} pientä palaa tai ${big} isoa palaa. Nauha ei muuttunut, vain pala.`,
  });
}

export /** A stick slides onto a ruler at a; then the gaps from a to b are counted one by one. */
function rulerScene(a: number, b: number): AnimPaint {
  const len = 10, U = 27, X = (v: number) => 15 + v * U, n = b - a, step = 0.7, t0 = 1.8;
  const end = t0 + n * step;
  return anim({
    dur: end + 1.6, w: 300, h: 112, label: `Keppi viivoittimella kohdasta ${a} kohtaan ${b}`,
    frame: (t) => {
      let s = `<rect x="6" y="58" width="288" height="40" rx="5" fill="color-mix(in srgb, var(--sun) 50%, var(--card))" stroke="currentColor" stroke-width="2"/>`;
      for (let v = 0; v <= len; v++) s += `<line x1="${X(v)}" y1="58" x2="${X(v)}" y2="${v % 5 === 0 ? 76 : 70}" stroke="currentColor" stroke-width="1.8"/><text x="${X(v)}" y="93" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor">${v}</text>`;
      const k = ease(t, 0.3, 1.5), dx = (1 - k) * 60, dy = (1 - k) * -26;
      s += `<rect x="${X(a) + dx}" y="${38 + dy}" width="${n * U}" height="14" rx="6" fill="#8a5a33"/>`;
      for (let i = 0; i < n; i++) {
        const at = t0 + i * step;
        if (t < at) break;
        s += `<path d="M${X(a + i) + 2} 62 Q${X(a + i) + U / 2} 50 ${X(a + i + 1) - 2} 62" fill="none" stroke="var(--red)" stroke-width="2"/><circle cx="${X(a + i) + U / 2}" cy="24" r="9" fill="var(--red)"/><text x="${X(a + i) + U / 2}" y="28" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">${i + 1}</text>`;
      }
      return s;
    },
    caption: (t) => t < t0 ? (a === 0 ? 'Keppi asetetaan nollan kohdalle.' : `Keppi alkaa kohdasta ${a}.`)
      : t < end ? `Lasketaan välit: ${Math.min(n, Math.floor((t - t0) / step) + 1)}…`
        : a === 0 ? `${n} väliä: keppi on ${n} cm.` : `Loppukohta on ${b}, mutta välejä on ${n}. Keppi on ${n} cm.`,
  });
}

export /** Ten 10 cm pieces fill a metre stick while the count goes 10, 20, … 100. */
function metreScene(): AnimPaint {
  const X = 15, U = 27, step = 0.55, t0 = 0.8, end = t0 + 10 * step;
  return anim({
    dur: end + 1.6, w: 300, h: 90, label: 'Kymmenen kymmenen sentin palaa täyttää metrin',
    frame: (t) => {
      let s = `<rect x="${X}" y="40" width="${10 * U}" height="22" rx="4" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 3"/><text x="${X + 5 * U}" y="80" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor">1 metri</text>`;
      for (let i = 0; i < 10; i++) {
        const at = t0 + i * step, e = ease(t, at, at + 0.3);
        if (t >= at) s += `<g opacity="${e}"><rect x="${X + i * U + 1}" y="${41 - (1 - e) * 22}" width="${U - 2}" height="20" rx="3" fill="${i % 2 ? '#f29a52' : 'var(--sun)'}"/><text x="${X + i * U + U / 2}" y="${55 - (1 - e) * 22}" text-anchor="middle" font-size="10" font-weight="800" fill="#2a2000">10</text></g>`;
      }
      const c = Math.max(0, Math.min(10, Math.floor((t - t0) / step) + 1)) * 10;
      return s + `<text x="150" y="24" text-anchor="middle" font-size="18" font-weight="800" fill="currentColor">${t < t0 ? '' : t >= end ? '100 cm = 1 m' : `${c} cm`}</text>`;
    },
    caption: (t) => t < end ? 'Kymmenen senttiä kerrallaan…' : 'Sata senttimetriä on yksi metri.',
  });
}

// ---------------------------------------------------------------- grams and kilograms: a kitchen scale
/** Weight packet (a small sack) labelled with its grams, standing at (x, y = bottom). */
export function packetArt(x: number, y: number, g: number) {
  const w = g >= 1000 ? 40 : g >= 500 ? 36 : 30, hh = g >= 1000 ? 34 : g >= 500 ? 30 : 24;
  return `<path d="M${x - w / 2} ${y} l3 -${hh} h${w - 6} l3 ${hh} z" fill="${g >= 1000 ? '#c98a00' : g >= 500 ? '#e0a96d' : '#f1d3a6'}" stroke="#8a5a33" stroke-width="1.6"/>` +
    `<text x="${x}" y="${y - hh / 2 + 4}" text-anchor="middle" font-size="${g >= 1000 ? 11 : 9}" font-weight="900" fill="#3d2610">${g >= 1000 ? `${g / 1000} kg` : `${g} g`}</text>`;
}
/** Kitchen scale with a round dial 0…max g (a tick every 100 g, numbers every 500 g); `needle` in grams.
 *  Things on the platform are drawn by the caller above y = 132. */
export function dialBody(needle: number, max = 2000, W = 300, readout = true) {
  const cx = W / 2, cy = 194, R = 50, ang = (g: number) => (-135 + (270 * Math.min(g, max * 1.03)) / max) * (Math.PI / 180);
  let s = `<rect x="${cx - 70}" y="132" width="140" height="8" rx="3" fill="#7c8a96"/><rect x="${cx - 6}" y="140" width="12" height="10" fill="#7c8a96"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${R + 6}" fill="var(--card, #fff)" stroke="currentColor" stroke-width="3"/>`;
  for (let g = 0; g <= max; g += 100) {
    const a = ang(g), big = g % 500 === 0, r1 = big ? R - 10 : R - 5;
    s += `<line x1="${cx + Math.sin(a) * r1}" y1="${cy - Math.cos(a) * r1}" x2="${cx + Math.sin(a) * R}" y2="${cy - Math.cos(a) * R}" stroke="currentColor" stroke-width="${big ? 2.4 : 1.2}"/>`;
    if (g % 1000 === 0) s += `<text x="${cx + Math.sin(a) * (R - 20)}" y="${cy - Math.cos(a) * (R - 20) + 4}" text-anchor="middle" font-size="10" font-weight="900" fill="currentColor">${g / 1000} kg</text>`;
  }
  const a = ang(needle);
  s += `<line x1="${cx}" y1="${cy}" x2="${cx + Math.sin(a) * (R - 4)}" y2="${cy - Math.cos(a) * (R - 4)}" stroke="var(--red, #d9534f)" stroke-width="3" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="4" fill="currentColor"/>`;
  if (readout) s += `<rect x="${cx + 64}" y="${cy - 16}" width="${W - cx - 70}" height="30" rx="6" fill="#1b2a22"/><text x="${(cx + 64 + W - 6) / 2}" y="${cy + 5}" text-anchor="middle" font-size="16" font-weight="900" fill="#9be08a">${Math.round(needle)} g</text>`;
  return s;
}
/** Ten 100 g packets drop onto a kitchen scale one at a time; the needle sweeps 100 g per packet
 *  until 1000 g, which is one kilogram; then the ten packets are swapped for one 1 kg packet. */
export function kiloScene(): AnimPaint {
  const W = 300, H = 252, cx = W / 2, DT = 0.9, t0 = 0.8, fin = t0 + 10 * DT, tS = fin + 1.4;
  const px = (i: number) => cx - 64 + (i % 5) * 32, py = (i: number) => 132 - Math.floor(i / 5) * 25;
  return anim({
    dur: tS + 4, w: W, h: H, label: 'Kymmenen 100 gramman pussia painaa kilon',
    frame: (t) => {
      let s = '', g = 0;
      const swap = ease(t - tS, 0, 0.8);
      for (let i = 0; i < 10; i++) {
        const at = t0 + i * DT, p = ease(t - at, 0, 0.4);
        if (p <= 0) break;
        g += 100 * ease(t - at - 0.3, 0, 0.4);
        if (swap < 1) s += `<g opacity="${1 - swap}">${packetArt(px(i), py(i) - (1 - p) * 60, 100)}</g>`;
      }
      if (swap > 0) s += `<g opacity="${swap}">${packetArt(cx, 132, 1000)}</g>`;
      s += dialBody(g, 2000, W);
      if (t > fin) s += `<text x="${W / 2}" y="22" text-anchor="middle" font-size="20" font-weight="900" fill="var(--pond)" opacity="${ease(t - fin, 0, 0.5)}">1000 g = 1 kg</text>`;
      return s;
    },
    caption: (t) => {
      if (t < t0) return 'Tyhjä vaaka näyttää nollaa.';
      if (t < fin) { const i = Math.min(10, Math.floor((t - t0) / DT) + 1); return `${i}. pussi: ${i * 100} grammaa.`; }
      if (t < tS) return 'Kymmenen sadan gramman pussia: tuhat grammaa.';
      return 'Tuhat grammaa on yksi kilogramma. Yksi kilon pussi painaa saman verran.';
    },
  });
}
/** A single thing on the kitchen scale; the needle swings up to `g` grams. */
export function onScaleScene(art: string, g: number, label: string): AnimPaint {
  const W = 300, H = 252, t0 = 0.8, fin = t0 + 1.6;
  return anim({
    dur: fin + 2.6, w: W, h: H, label,
    frame: (t) => {
      const p = ease(t - t0, 0, 0.5), q = ease(t - t0 - 0.4, 0, 1.2), wob = t > t0 + 0.4 ? Math.exp(-3 * (t - t0 - 1.6)) * Math.sin((t - t0) * 12) * 0.04 * (t > t0 + 1.6 ? 1 : 0) : 0;
      return `<g transform="translate(0 ${-(1 - p) * 60})" opacity="${p}">${art}</g>` + dialBody(g * q * (1 + wob), g > 2000 ? Math.ceil(g / 1000) * 1000 : 2000, W) +
        (t > fin ? `<text x="${W / 2}" y="22" text-anchor="middle" font-size="18" font-weight="900" fill="var(--pond)" opacity="${ease(t - fin, 0, 0.5)}">${label}</text>` : '');
    },
    caption: (t) => (t < t0 ? 'Laitetaan vaa\'alle…' : t < fin ? 'Osoitin kääntyy…' : label),
  });
}

// ---------------------------------------------------------------- capacity: pouring between vessels
type VKind = 'kannu' | 'muki' | 'lasi' | 'pullo' | 'ampari';
const WATER = 'color-mix(in srgb, var(--blue) 60%, transparent)';
let clipSeq = 0;
/** Vessel `kind` with its own frame placed at (x, y) (frame is 90 × 120), rotated `ang` degrees about
 *  its spout corner; `vol` (0…1 of the vessel) of water whose surface stays level. */
function vesselAt(kind: VKind, x: number, y: number, vol: number, ang = 0, label = '') {
  const sh = VESSELS[kind]!, id = `pv${clipSeq++}`, outline = sh.d.split(' M')[0]!;
  const px = x + sh.rx, py = y + sh.top, depth = sh.bot - sh.top;
  // world y of the water surface: upright it follows the level; tilted it sinks below the spout as the vessel empties
  const k = Math.min(1, Math.abs(ang) / 60), upright = y + sh.bot - vol * depth, tilted = py - vol * depth * 0.85 + 3;
  const wy = upright + (tilted - upright) * k;
  const tr = `rotate(${ang} ${px} ${py}) translate(${x} ${y})`;
  let s = `<defs><clipPath id="${id}"><path d="${outline}" transform="${tr}"/></clipPath></defs>`;
  if (vol > 0.002) s += `<rect x="${x - 120}" y="${wy}" width="${330}" height="${240}" fill="${WATER}" clip-path="url(#${id})"/>`;
  s += `<path d="${sh.d}" transform="${tr}" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>`;
  if (label) s += `<text x="${x + 45}" y="${y + 124}" text-anchor="middle" font-size="13" font-weight="800" fill="currentColor">${label}</text>`;
  return s;
}
/** A full (or `fill`) vessel a is poured into the empty vessel b. Capacities capA, capB in any unit:
 *  b fills up to capB and the rest spills over into a puddle; whatever is left stays in a. */
export function pourScene(a: VKind, b: VKind, capA: number, capB: number, la: string, lb: string, verdict: string, fill = 1): AnimPaint {
  const W = 320, H = 196, AX = 40, AY = 66, BX = 186, BY = 60, t0 = 0.8, TL = 0.9, P = 3.2, tE = t0 + TL + P, fin = tE + TL;
  const vol0 = capA * fill, rate = vol0 / P, shB = VESSELS[b]!;
  return anim({
    dur: fin + 2.6, w: W, h: H, label: `${la} kaadetaan astiaan ${lb}`,
    frame: (t) => {
      const lift = ease(t - t0, 0, TL) - ease(t - tE, 0, TL), ang = 62 * lift;
      const poured = Math.max(0, Math.min(vol0, (t - t0 - TL) * rate)), inB = Math.min(capB, poured), spill = poured - inB;
      const flowing = t > t0 + TL && t < tE && poured < vol0;
      const ax = AX + 34 * lift, ay = AY - 40 * lift;
      let s = vesselAt(b, BX, BY, inB / capB, 0, lb);
      if (spill > 0) {
        const r = Math.min(46, 8 + Math.sqrt(spill / capB) * 40);
        s += `<ellipse cx="${BX + 72 + r * 0.4}" cy="${BY + 109}" rx="${r}" ry="${r * 0.18 + 2}" fill="${WATER}"/>`;
        if (flowing) s += `<path d="M${BX + shB.rx} ${BY + shB.top} q6 4 6 20 V${BY + 110}" fill="none" stroke="${WATER}" stroke-width="4"/>`;
      }
      if (flowing) {
        const sh = VESSELS[a]!, sx = ax + sh.rx + 4, sy = ay + sh.top + 2, ty = BY + shB.bot - (inB / capB) * (shB.bot - shB.top);
        s += `<path d="M${sx} ${sy} Q${sx + 18} ${sy + 4} ${BX + 40} ${Math.max(sy + 20, ty)}" fill="none" stroke="${WATER}" stroke-width="6" stroke-linecap="round"/>`;
      }
      s += vesselAt(a, ax, ay, (vol0 - poured) / capA, ang, lift < 0.05 ? la : '');
      return s;
    },
    caption: (t) => {
      if (t < t0) return `${la} on ${fill >= 1 ? 'täynnä' : 'osittain täynnä'}. ${lb[0]!.toUpperCase()}${lb.slice(1)} on tyhjä.`;
      if (t < tE) { const poured = (t - t0 - TL) * rate; return poured > capB ? `${lb[0]!.toUpperCase()}${lb.slice(1)} on täynnä, ja vettä valuu yli!` : 'Kaadetaan…'; }
      return verdict;
    },
  });
}

// ---------------------------------------------------------------- litres and decilitres: a measuring jug
/** Text for a volume in decilitres: "7 dl", "1 l", "1 l 5 dl". */
export const dlText = (x: number) => (x >= 10 ? `${Math.floor(x / 10)} l${x % 10 ? ` ${x % 10} dl` : ''}` : `${x} dl`);
/** A measuring jug (cap dl, a mark every dl, litre lines) holding `dl`, with a 1 dl cup above it tilted
 *  by `tilt` (0…1) and holding `cupVol` (0…1). Frame 300 × 230. */
export function jugBody(dl: number, cap: number, tilt = 0, cupVol = 0, stream = false) {
  const X0 = 112, X1 = 196, BOT = 214, TOP = 76, hh = (BOT - TOP) / cap, ly = BOT - dl * hh;
  let s = '';
  if (dl > 0.01) s += `<path d="M${X0 + 1.5} ${ly} H${X1 - 1.5} V${BOT - 1.5} H${X0 + 1.5}z" fill="${WATER}"/>`;
  for (let k = 1; k <= cap; k++) {
    const y = BOT - k * hh, L = k % 10 === 0;
    s += `<line x1="${X1}" y1="${y}" x2="${X1 - (L ? 26 : k % 5 === 0 ? 16 : 9)}" y2="${y}" stroke="currentColor" stroke-width="${L ? 2.5 : 1.3}"/>`;
    if (L) s += `<line x1="${X0}" y1="${y}" x2="${X1}" y2="${y}" stroke="var(--pond)" stroke-width="1.5" stroke-dasharray="4 4"/><text x="${X0 + 6}" y="${y - 4}" font-size="14" font-weight="900" fill="var(--pond)">${k / 10} l</text>`;
  }
  s += `<path d="M${X0} ${TOP - 10} V${BOT} H${X1} V${TOP - 10}" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>`;
  s += `<path d="M${X1} ${TOP + 4} q24 4 20 40 q-3 16 -20 18" fill="none" stroke="currentColor" stroke-width="3"/>`;
  // the 1 dl cup, pivoting about its spout corner above the jug's left rim
  const px = X0 + 8 - 52 * (1 - tilt), py = 50, ang = 112 * tilt, id = `dl${clipSeq++}`;
  const cup = 'M-30 0 h30 l-4 34 h-22z', tr = `rotate(${ang} ${px} ${py}) translate(${px} ${py})`;
  s += `<defs><clipPath id="${id}"><path d="${cup}" transform="${tr}"/></clipPath></defs>`;
  if (cupVol > 0.01) {
    const k = Math.min(1, ang / 60), wy = (py + 34 - cupVol * 34) * (1 - k) + (py - cupVol * 22 + 3) * k;
    s += `<rect x="${px - 60}" y="${wy}" width="120" height="80" fill="${WATER}" clip-path="url(#${id})"/>`;
  }
  s += `<path d="${cup}" transform="${tr}" fill="var(--paper, #fff)" fill-opacity="0.01" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>`;
  if (tilt < 0.1) s += `<text x="${px - 15}" y="${py + 50}" text-anchor="middle" font-size="11" font-weight="800" fill="currentColor">1 dl</text>`;
  if (stream) s += `<path d="M${px + 1} ${py + 2} Q${px + 6} ${py + 20} ${px + 8} ${ly}" fill="none" stroke="${WATER}" stroke-width="5" stroke-linecap="round"/>`;
  return s;
}
/** n cups of 1 dl are poured one by one into a jug of `cap` dl; the count rises 1 dl, 2 dl, … */
export function dlFillScene(n: number, cap = 10): AnimPaint {
  const t0 = 0.7, per = 1.05, fin = t0 + n * per;
  const phase = (t: number) => { const u = t - t0, k = Math.floor(u / per), f = u / per - k; return { k: Math.min(n, Math.max(0, k)), f: u < 0 ? 0 : k >= n ? 1 : f }; };
  const verdict = n === 10 ? '10 dl = 1 l: kannu täyttyi litran viivaan asti.' : n < 10 ? `${n} dl ei riitä litran viivaan: ${n} dl on vähemmän kuin 1 l.` : `${n} dl meni litran viivan yli: ${n} dl on enemmän kuin 1 l.`;
  return anim({
    dur: fin + 2.8, w: 300, h: 230, label: `${n} desilitraa kaadetaan kannuun`,
    frame: (t) => {
      const { k, f } = phase(t), done = t >= fin;
      // within one pour: tilt in (0–0.3), pour (0.3–0.75), tilt back (0.75–1)
      const tilt = done ? 0 : f < 0.3 ? ease(f, 0, 0.3) : f < 0.75 ? 1 : 1 - ease(f, 0.75, 1);
      const pour = done ? 0 : Math.min(1, Math.max(0, (f - 0.3) / 0.45));
      const dl = done ? n : k + pour, cupVol = done ? 0 : 1 - pour;
      let s = jugBody(dl, cap, tilt, t < t0 ? 1 : cupVol, !done && f > 0.3 && f < 0.75);
      const shown = done ? n : k + (pour >= 1 ? 1 : 0);
      s += `<text x="40" y="150" text-anchor="middle" font-size="26" font-weight="900" fill="currentColor">${shown} dl</text>`;
      if (done) s += `<text x="40" y="180" text-anchor="middle" font-size="15" font-weight="900" fill="var(--pond)" opacity="${ease(t - fin, 0, 0.5)}">${n === 10 ? '= 1 l' : n < 10 ? '< 1 l' : '> 1 l'}</text>`;
      return s;
    },
    caption: (t) => { const { k } = phase(t); return t < t0 ? 'Desilitran mitta on täynnä. Kannu on tyhjä.' : t < fin ? `${k + 1}. desilitra…` : verdict; },
  });
}
