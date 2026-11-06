// Procedural effect candidates for the first palette. Deterministic: the same recipe version and
// seed give byte-identical files, so the recipe and its parameters are the master.
// These are candidates for a listening review, not approved sound design.

export const RECIPE_VERSION = 'sfx-synth/1';
export const RATE = 48000;

function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/** RBJ biquad, run in place. */
function biquad(x, type, f0, q = 0.707) {
  const w = (2 * Math.PI * f0) / RATE, c = Math.cos(w), al = Math.sin(w) / (2 * q);
  let b0, b1, b2;
  if (type === 'lp') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2; }
  else if (type === 'hp') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; }
  else { b0 = al; b1 = 0; b2 = -al; } // band-pass, 0 dB peak
  const a0 = 1 + al, a1 = -2 * c, a2 = 1 - al;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const y = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = y; x[i] = y;
  }
  return x;
}

const buf = (sec) => new Float32Array(Math.round(sec * RATE));
const env = (t, a, d) => (t < a ? t / a : Math.exp(-(t - a) / d));
function add(dst, src, at = 0, g = 1) { const o = Math.round(at * RATE); for (let i = 0; i < src.length && o + i < dst.length; i++) dst[o + i] += src[i] * g; return dst; }

/** Sine with a frequency glide and an attack/decay envelope. */
function tone(sec, f0, f1, a, d, harm = 0) {
  const x = buf(sec); let ph = 0;
  for (let i = 0; i < x.length; i++) {
    const t = i / RATE, f = f0 * (f1 / f0) ** (t / sec);
    ph += (2 * Math.PI * f) / RATE;
    x[i] = (Math.sin(ph) + harm * Math.sin(2 * ph)) * env(t, a, d);
  }
  return x;
}
function noise(sec, r, a, d) { const x = buf(sec); for (let i = 0; i < x.length; i++) x[i] = (r() * 2 - 1) * env(i / RATE, a, d); return x; }

/** Nasal duck-like call: a buzzy source through two formants. */
function quack(sec, f0, f1, r) {
  const x = buf(sec); let ph = 0;
  for (let i = 0; i < x.length; i++) {
    const t = i / RATE, f = f0 + (f1 - f0) * Math.sin(Math.PI * Math.min(1, t / sec));
    ph += f / RATE; const saw = 2 * (ph % 1) - 1;
    x[i] = (saw + (r() - 0.5) * 0.15) * env(t, 0.012, sec * 0.35);
  }
  const a = biquad(Float32Array.from(x), 'bp', 1050 + r() * 100, 3), b = biquad(Float32Array.from(x), 'bp', 2400 + r() * 200, 4);
  for (let i = 0; i < x.length; i++) x[i] = a[i] * 1.2 + b[i] * 0.6;
  return x;
}

/** Rounded frog croak: a low pulse train with a slow rasp, through two soft formants. */
function croak(sec, f0, rasp, r) {
  const x = buf(sec); let ph = 0;
  for (let i = 0; i < x.length; i++) {
    const t = i / RATE, f = f0 * (1 + 0.08 * Math.sin(2 * Math.PI * 3 * t));
    ph += f / RATE;
    const pulse = Math.exp(-((ph % 1) * 9)) - 0.2;
    const am = 0.6 + 0.4 * Math.sin(2 * Math.PI * rasp * t);
    x[i] = (pulse + (r() - 0.5) * 0.05) * am * env(t, 0.03, sec * 0.45);
  }
  const a = biquad(Float32Array.from(x), 'bp', 420, 2.5), b = biquad(Float32Array.from(x), 'bp', 1150, 4);
  for (let i = 0; i < x.length; i++) x[i] = a[i] + b[i] * 0.5;
  return biquad(x, 'lp', 2500);
}

/** Feather flutter: band-passed air with a fast wing-beat envelope. */
function wing(sec, beat, center, r) {
  const x = noise(sec, r, 0.02, sec * 0.5);
  biquad(x, 'bp', center, 0.9); biquad(x, 'lp', 3500);
  for (let i = 0; i < x.length; i++) { const t = i / RATE; x[i] *= 0.35 + 0.65 * Math.max(0, Math.sin(2 * Math.PI * beat * t)) ** 2; }
  return x;
}

function finish(x, peakDb) {
  // 5 ms fades against clicks, then a fixed peak per family (mixed under speech).
  const f = Math.round(0.005 * RATE);
  for (let i = 0; i < f && i < x.length; i++) { x[i] *= i / f; x[x.length - 1 - i] *= i / f; }
  let p = 0; for (const s of x) p = Math.max(p, Math.abs(s));
  const g = p ? 10 ** (peakDb / 20) / p : 0;
  for (let i = 0; i < x.length; i++) x[i] *= g;
  return x;
}

/** family → variant builders. Peak levels leave headroom for four effects plus speech. */
export const RECIPES = {
  'aava.notice': { peakDb: -9, variants: [(r) => quack(0.14, 520, 600, r), (r) => quack(0.12, 560, 640, r)] },
  'aava.joy': { peakDb: -9, variants: [
    (r) => { const x = buf(0.36); add(x, quack(0.12, 560, 650, r)); return add(x, quack(0.14, 620, 720, r), 0.17); },
    (r) => { const x = buf(0.3); add(x, quack(0.1, 600, 680, r)); return add(x, quack(0.12, 660, 760, r), 0.14); },
  ] },
  'aava.wing': { peakDb: -12, variants: [(r) => wing(0.26, 16, 1300, r), (r) => wing(0.22, 19, 1500, r), (r) => wing(0.3, 14, 1150, r)] },
  'loikka.croak': { peakDb: -8, variants: [(r) => croak(0.34, 78, 26, r), (r) => croak(0.3, 86, 30, r), (r) => croak(0.4, 72, 22, r)] },
  'loikka.joy': { peakDb: -8, variants: [
    (r) => { const x = buf(0.42); add(x, croak(0.16, 90, 30, r)); return add(x, croak(0.2, 104, 32, r), 0.2); },
    (r) => { const x = buf(0.38); add(x, croak(0.15, 96, 28, r)); return add(x, croak(0.18, 112, 34, r), 0.18); },
  ] },
  'loikka.push': { peakDb: -12, variants: [
    (r) => add(tone(0.11, 190, 95, 0.004, 0.035), biquad(noise(0.05, r, 0.002, 0.012), 'lp', 1800), 0, 0.25),
    (r) => add(tone(0.1, 210, 105, 0.004, 0.03), biquad(noise(0.05, r, 0.002, 0.012), 'lp', 2000), 0, 0.25),
  ] },
  'land.dry': { peakDb: -11, variants: [0, 1, 2].map((k) => (r) => add(tone(0.12, 140 + 15 * k, 70, 0.002, 0.03), biquad(noise(0.08, r, 0.001, 0.015 + 0.004 * k), 'lp', 1400 + 300 * k), 0, 0.6)) },
  'land.wet': { peakDb: -11, variants: [0, 1, 2].map((k) => (r) => {
    const x = buf(0.24);
    add(x, biquad(noise(0.08, r, 0.001, 0.018), 'bp', 900 + 150 * k, 0.8), 0, 1);
    add(x, tone(0.07, 120, 70, 0.002, 0.02), 0, 0.5);
    return add(x, tone(0.05, 1300 + 200 * k, 2600 + 300 * k, 0.003, 0.015), 0.08 + 0.02 * k, 0.25);
  }) },
  'water.splash': { peakDb: -10, variants: [0, 1, 2].map((k) => (r) => {
    const x = buf(0.5);
    add(x, tone(0.07, 280 + 30 * k, 900 + 80 * k, 0.003, 0.03), 0, 0.8);
    add(x, biquad(biquad(noise(0.4, r, 0.01, 0.09), 'hp', 700), 'lp', 5000), 0.02, 0.5);
    for (let d = 0; d < 3; d++) add(x, tone(0.04, 1500 + 400 * r(), 3000 + 600 * r(), 0.002, 0.012), 0.15 + 0.08 * d + 0.03 * r(), 0.18);
    return x;
  }) },
  'ui.select': { peakDb: -16, variants: [() => tone(0.08, 880, 990, 0.003, 0.025)] },
  'ui.confirm': { peakDb: -14, variants: [
    () => { const x = buf(0.32); add(x, tone(0.15, 660, 660, 0.004, 0.06, 0.15)); return add(x, tone(0.2, 990, 990, 0.004, 0.08, 0.1), 0.09); },
    () => { const x = buf(0.32); add(x, tone(0.15, 587, 587, 0.004, 0.06, 0.15)); return add(x, tone(0.2, 880, 880, 0.004, 0.08, 0.1), 0.09); },
  ] },
  'ui.retry': { peakDb: -17, variants: [() => { const x = buf(0.3); add(x, tone(0.14, 440, 440, 0.006, 0.06)); return add(x, tone(0.16, 392, 392, 0.006, 0.07), 0.11); }] },
};

/** Every candidate: { family, n, seed, samples }. */
export function renderAll() {
  const out = [];
  for (const [family, R] of Object.entries(RECIPES)) R.variants.forEach((v, i) => {
    const seed = [...`${family}#${i}`].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
    out.push({ family, n: i + 1, seed, peakDb: R.peakDb, samples: finish(v(rng(seed)), R.peakDb) });
  });
  return out;
}
