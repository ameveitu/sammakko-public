// Effects cut from free-library recordings (audio/library/sfx.json). The source must already be in
// <state>/library/ and match its sha256: this code never downloads. Decoding uses macOS afconvert.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { decodeWav } from './wav.mjs';

const sha256 = (b) => createHash('sha256').update(b).digest('hex');

/** Mono float samples of a verified source at `rate`. */
export function loadSource(src, libDir, tmpDir, rate) {
  const file = path.join(libDir, src.download.file);
  if (!fs.existsSync(file)) throw new Error(`lähde puuttuu: ${file} (lataa ${src.download.url})`);
  if (sha256(fs.readFileSync(file)) !== src.download.sha256) throw new Error(`lähteen SHA256 ei täsmää: ${file}`);
  fs.mkdirSync(tmpDir, { recursive: true });
  const out = path.join(tmpDir, `${path.basename(file)}.${rate}.wav`);
  execFileSync('afconvert', ['-f', 'WAVE', '-d', `LEI16@${rate}`, '-c', '1', file, out]);
  const d = decodeWav(fs.readFileSync(out));
  if (d.rate !== rate) throw new Error('afconvert: väärä näytetaajuus');
  return d.samples;
}

/** Cut, remove rumble (2nd-order high-pass 180 Hz), 12 ms fades, peak-normalize. */
export function cutClip(x, rate, { start, dur, peakDb }) {
  const a = Math.round(start * rate), n = Math.round(dur * rate);
  const y = Float32Array.from(x.subarray(a, a + n));
  const w = (2 * Math.PI * 180) / rate, c = Math.cos(w), al = Math.sin(w) / (2 * Math.SQRT1_2);
  const b0 = (1 + c) / 2, b1 = -(1 + c), b2 = (1 + c) / 2, a0 = 1 + al, a1 = -2 * c, a2 = 1 - al;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < y.length; i++) { const v = y[i], o = (b0 * v + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = v; y2 = y1; y1 = o; y[i] = o; }
  const f = Math.round(0.012 * rate);
  for (let i = 0; i < f && i < y.length; i++) { y[i] *= i / f; y[y.length - 1 - i] *= i / f; }
  let peak = 0; for (const v of y) peak = Math.max(peak, Math.abs(v));
  const g = peak > 0 ? 10 ** (peakDb / 20) / peak : 0;
  for (let i = 0; i < y.length; i++) y[i] *= g;
  return y;
}
