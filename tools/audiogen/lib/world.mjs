// World sound kit (audio/library/world.json): cut, shape, level, loop and check effects and ambience
// for the pond world (Saariston /saaristo/ page, later Lite). Pure functions; file I/O lives in cli.mjs.

/** RBJ biquad, applied in place. type: 'hp' | 'lp' | 'shelf' (high shelf, gainDb). */
export function biquad(x, rate, type, f, q = Math.SQRT1_2, gainDb = 0) {
  const w = (2 * Math.PI * f) / rate, c = Math.cos(w), al = Math.sin(w) / (2 * q);
  let b0, b1, b2, a0, a1, a2;
  if (type === 'hp') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = b0; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; }
  else if (type === 'lp') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; }
  else if (type === 'shelf') {
    const A = 10 ** (gainDb / 40), s = 2 * Math.sqrt(A) * al;
    b0 = A * ((A + 1) + (A - 1) * c + s); b1 = -2 * A * ((A - 1) + (A + 1) * c); b2 = A * ((A + 1) + (A - 1) * c - s);
    a0 = (A + 1) - (A - 1) * c + s; a1 = 2 * ((A - 1) - (A + 1) * c); a2 = (A + 1) - (A - 1) * c - s;
  } else throw new Error(`biquad: ${type}`);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) { const v = x[i], o = (b0 * v + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = v; y2 = y1; y1 = o; x[i] = o; }
  return x;
}

/** ITU-R BS.1770 K-weighting (pre-filter shelf + RLB high-pass). */
export const kWeight = (x, rate) => biquad(biquad(Float32Array.from(x), rate, 'shelf', 1681.974, 0.7071752, 3.99984), rate, 'hp', 38.13547, 0.5003270);

// A clip shorter than the window counts as padded with silence: a 140 ms wing stroke and the same
// stroke inside a longer clip measure the same, which also follows the ear's ~200 ms integration.
const blockPowers = (k, rate, win = 0.4, step = 0.1) => {
  const n = Math.round(win * rate), hop = Math.round(step * rate), out = [];
  if (k.length < n) { let e = 0; for (const v of k) e += v * v; return [e / n]; }
  for (let s = 0; s + n <= k.length; s += hop) { let e = 0; for (let i = s; i < s + n; i++) e += k[i] * k[i]; out.push(e / n); }
  return out;
};
const lk = (z) => -0.691 + 10 * Math.log10(Math.max(z, 1e-12));

/** Loudness in LUFS. 'integrated': BS.1770 gated (loops). 'oneshot': loudest 400 ms window (effects are
 *  short events; their loudest moment is what the ear compares). */
export function loudness(x, rate, mode = 'oneshot') {
  const z = blockPowers(kWeight(x, rate), rate, 0.4, mode === 'oneshot' ? 0.01 : 0.1);
  if (mode === 'oneshot') return lk(Math.max(...z));
  const abs = z.filter((v) => lk(v) > -70);
  if (!abs.length) return -70;
  const rel = lk(abs.reduce((a, b) => a + b, 0) / abs.length) - 10;
  const g = abs.filter((v) => lk(v) > rel);
  return lk(g.reduce((a, b) => a + b, 0) / g.length);
}

export const peakDb = (x) => { let p = 0; for (const v of x) p = Math.max(p, Math.abs(v)); return 20 * Math.log10(Math.max(p, 1e-9)); };
export const gain = (x, db) => { const g = 10 ** (db / 20); for (let i = 0; i < x.length; i++) x[i] *= g; return x; };

/** Linear interpolation resample by playback rate (pitch shift with duration change, like a tape). */
export function vari(x, semitones) {
  if (!semitones) return Float32Array.from(x);
  const r = 2 ** (semitones / 12), n = Math.floor(x.length / r), y = new Float32Array(n);
  for (let i = 0; i < n; i++) { const t = i * r, a = Math.floor(t), f = t - a; y[i] = (x[a] ?? 0) * (1 - f) + (x[a + 1] ?? 0) * f; }
  return y;
}

/** Fades in seconds (raised cosine) at both ends. */
export function fades(x, rate, inS = 0.012, outS = 0.012) {
  const a = Math.round(inS * rate), b = Math.round(outS * rate);
  for (let i = 0; i < a && i < x.length; i++) x[i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / a);
  for (let i = 0; i < b && i < x.length; i++) x[x.length - 1 - i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / b);
  return x;
}

/** Amplitude envelope from [[t, gain], …] points, smoothstep between points. */
export function envelope(x, rate, pts) {
  for (let i = 0; i < x.length; i++) {
    const t = i / rate; let k = 0; while (k < pts.length - 2 && t > pts[k + 1][0]) k++;
    const [t0, g0] = pts[k], [t1, g1] = pts[k + 1], u = Math.max(0, Math.min(1, (t - t0) / Math.max(1e-6, t1 - t0)));
    x[i] *= g0 + (g1 - g0) * u * u * (3 - 2 * u);
  }
  return x;
}

/** One clip from a source: cut [start, start+dur), optional pitch (semitones), high-pass (default 150 Hz),
 *  low-pass, envelope and fades. Several `parts` are mixed at their `at` offsets (seconds). */
export function renderClip(sources, rate, c) {
  const parts = c.parts ?? [c];
  const pieces = parts.map((p) => {
    if (c.parts) p = { ...c, parts: undefined, env: undefined, gainDb: undefined, ...p }; // parts inherit filters
    const x = sources(p.source ?? c.source), a = Math.round(p.start * rate);
    let y = Float32Array.from(x.subarray(a, a + Math.round(p.dur * rate)));
    y = vari(y, p.semitones ?? 0);
    biquad(y, rate, 'hp', p.hp ?? c.hp ?? 150);
    if (p.hp2 ?? c.hp2) biquad(y, rate, 'hp', p.hp2 ?? c.hp2);
    if (p.lp ?? c.lp) biquad(biquad(y, rate, 'lp', p.lp ?? c.lp), rate, 'lp', p.lp ?? c.lp);
    if (p.env) envelope(y, rate, p.env);
    if (p.gainDb) gain(y, p.gainDb);
    return { at: Math.round((p.at ?? 0) * rate), y: fades(y, rate, p.fadeIn ?? 0.006, p.fadeOut ?? 0.03) };
  });
  const n = Math.max(...pieces.map((p) => p.at + p.y.length)), out = new Float32Array(n);
  for (const p of pieces) for (let i = 0; i < p.y.length; i++) out[p.at + i] += p.y[i];
  if (c.env) envelope(out, rate, c.env);
  return out;
}

/** Brings a clip to `target` LUFS, but never above `ceilingDb` peak. Returns the applied gain and limit. */
export function level(x, rate, target, mode, ceilingDb = -3) {
  const L = loudness(x, rate, mode), want = target - L, room = ceilingDb - peakDb(x), g = Math.min(want, room);
  gain(x, g);
  return { gainDb: +g.toFixed(2), limitedDb: +(want - g).toFixed(2), lufs: +loudness(x, rate, mode).toFixed(2) };
}

// ------------------------------------------------------------------ loops
// A loop file holds period P plus an overlap X. The player starts a new copy every P seconds and
// crossfades the overlap with equal power. The tail [P, P+X) and the head [0, X) are different moments
// of the same recording (uncorrelated noise), so constant power holds and the MP3 encoder delay only
// shifts both copies equally: the seam has no gap, click or bump in any browser.

/** Mixes `copies` consecutive runs of a loop exactly as the player does. */
export function simulateLoop(x, rate, period, xfade, copies = 3, delay = 0) {
  const P = Math.round(period * rate), X = Math.round(xfade * rate), out = new Float32Array(P * copies + X);
  for (let k = 0; k < copies; k++) {
    for (let i = 0; i < P + X; i++) {
      const v = x[i + delay] ?? 0;
      const g = i < X ? (k === 0 ? 1 : Math.sin((Math.PI / 2) * (i / X))) : i >= P ? Math.cos((Math.PI / 2) * ((i - P) / X)) : 1;
      out[k * P + i] += v * g;
    }
  }
  return out.subarray(0, P * copies);
}

const winDb = (x, rate, w) => { const n = Math.round(w * rate), out = []; for (let s = 0; s + n <= x.length; s += n) { let e = 0; for (let i = s; i < s + n; i++) e += x[i] * x[i]; out.push(10 * Math.log10(e / n + 1e-12)); } return out; };
const median = (a) => { const s = [...a].sort((p, q) => p - q); return s[Math.floor(s.length / 2)]; };
const pct = (a, p) => { const s = [...a].sort((u, v) => u - v); return s[Math.min(s.length - 1, Math.floor(s.length * p))]; };

/** Seam check on a simulated run: around each seam (±xfade) no 100 ms window louder than the loop's own
 *  95th percentile + 2 dB (no bump or pop), none quieter than its 5th percentile − 3 dB (no gap), and the
 *  largest sample step at the seam within the loop's own 99.9th percentile (no click). */
export function seamReport(x, rate, period, xfade, delay = 0) {
  const run = simulateLoop(x, rate, period, xfade, 3, delay), w = winDb(run, rate, 0.1), P = Math.round(period * rate);
  const inner = w.slice(Math.round((period + xfade + 0.2) / 0.1), Math.round((2 * period - 0.2) / 0.1));
  const hi = pct(inner, 0.95) + 2, lo = pct(inner, 0.05) - 3;
  const seams = [P, 2 * P], bad = [];
  let worstHi = -Infinity, worstLo = Infinity;
  for (const s of seams) {
    for (let k = Math.floor((s / rate - xfade) / 0.1); k <= Math.ceil((s / rate + xfade) / 0.1); k++) {
      if (w[k] === undefined) continue;
      worstHi = Math.max(worstHi, w[k] - hi); worstLo = Math.min(worstLo, w[k] - lo);
      if (w[k] > hi) bad.push(`kohouma ${(k * 0.1).toFixed(1)} s`); if (w[k] < lo) bad.push(`kuoppa ${(k * 0.1).toFixed(1)} s`);
    }
  }
  const steps = []; for (let i = 1; i < run.length; i++) steps.push(Math.abs(run[i] - run[i - 1]));
  const lim = pct(steps.filter((_, i) => i % 7 === 0), 0.999);
  let seamStep = 0; for (const s of seams) for (let i = s - 64; i < s + 64; i++) seamStep = Math.max(seamStep, steps[i] ?? 0);
  if (seamStep > lim * 1.5) bad.push(`näytehyppy ${seamStep.toFixed(4)} > ${(lim * 1.5).toFixed(4)}`);
  return { ok: !bad.length, problems: [...new Set(bad)], medianDb: +median(inner).toFixed(1), marginHiDb: +(-worstHi).toFixed(1), marginLoDb: +worstLo.toFixed(1) };
}

/** Searches a source span for loop starts whose head and tail match best (level and spectrum).
 *  Returns the best eight starts with a mismatch score (lower is better); the caller then checks the
 *  seam of each and keeps the one with the widest margin. */
export function findLoop(x, rate, { from, to, period, xfade, step = 0.25 }) {
  const X = Math.round(xfade * rate), res = [];
  const bands = (a) => { const out = []; for (const [lo, hi] of [[150, 600], [600, 2000], [2000, 6000], [6000, 14000]]) { const y = biquad(biquad(Float32Array.from(a), rate, 'hp', lo), rate, 'lp', Math.min(hi, rate * 0.45)); let e = 0; for (const v of y) e += v * v; out.push(10 * Math.log10(e / y.length + 1e-12)); } return out; };
  for (let s = from; s + period + xfade <= to; s += step) {
    const a = Math.round(s * rate), P = Math.round(period * rate);
    const head = x.subarray(a, a + X), tail = x.subarray(a + P, a + P + X);
    const bh = bands(head), bt = bands(tail);
    const score = bh.reduce((m, v, i) => m + Math.abs(v - bt[i]), 0) / bh.length;
    res.push({ start: +s.toFixed(2), score: +score.toFixed(2) });
  }
  return res.sort((p, q) => p.score - q.score).slice(0, 8);
}

// ------------------------------------------------------------------ packed-file checks
/** Third-octave band energies per 20 ms frame (log10 power), 100 Hz – min(12 kHz, rate/2.2). */
export function bandFrames(x, rate) {
  const edges = []; for (let f = 100; f < Math.min(12000, rate / 2.2); f *= 2 ** (1 / 3)) edges.push(f);
  const hop = Math.round(rate * 0.02), nF = Math.floor(x.length / hop), m = [];
  for (let b = 0; b + 1 < edges.length; b++) {
    const y = biquad(biquad(Float32Array.from(x), rate, 'hp', edges[b], 1.2), rate, 'lp', edges[b + 1], 1.2), row = new Float32Array(nF);
    for (let f = 0; f < nF; f++) { let e = 0; for (let i = f * hop; i < (f + 1) * hop; i++) e += y[i] * y[i]; row[f] = Math.log10(e / hop + 1e-10); }
    m.push(row);
  }
  return m;
}
const corr = (a, b) => { const n = a.length; let ma = 0, mb = 0; for (let i = 0; i < n; i++) { ma += a[i]; mb += b[i]; } ma /= n; mb /= n; let sab = 0, sa = 0, sb = 0; for (let i = 0; i < n; i++) { const u = a[i] - ma, v = b[i] - mb; sab += u * v; sa += u * u; sb += v * v; } return sab / Math.sqrt(sa * sb + 1e-20); };

/** Recognisability of a packed clip against its master: correlation of the band-energy spectrogram
 *  (time × frequency) at the best lag 0–120 ms (encoder delay), and of the average spectrum. */
export function likeness(master, packed, rate) {
  const A = bandFrames(master, rate), B = bandFrames(packed, rate), nF = A[0].length;
  // Only what can be heard counts: band energies more than 50 dB under the master's loudest band-frame
  // are clamped to that floor in both (codec noise in a silent tail is not a change of sound).
  let top = -Infinity; for (const row of A) for (const v of row) top = Math.max(top, v);
  for (const M of [A, B]) for (const row of M) for (let i = 0; i < row.length; i++) row[i] = Math.max(row[i], top - 5);
  let best = { r: -1, lag: 0 };
  for (let lag = 0; lag <= 6; lag++) {
    const a = [], b = [];
    for (let k = 0; k < A.length; k++) for (let f = 0; f + lag < B[k].length && f < nF; f++) { a.push(A[k][f]); b.push(B[k][f + lag]); }
    const r = corr(a, b); if (r > best.r) best = { r, lag };
  }
  const avg = (M) => M.map((row) => Math.log10(row.reduce((s, v) => s + 10 ** v, 0) / row.length + 1e-10));
  return { tf: +best.r.toFixed(3), spectrum: +corr(avg(A), avg(B)).toFixed(3), lagMs: best.lag * 20 };
}
