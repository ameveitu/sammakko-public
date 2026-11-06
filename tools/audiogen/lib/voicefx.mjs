// Voice character layer for produced speech (developer machine only, deterministic, no dependencies).
// - f0Median: rough pitch of a take, so voices can be ordered from high to low.
// - shift: raises pitch *and* formants together (a smaller "creature" voice) while keeping the duration:
//   resample, then WSOLA time-stretch back. Used for Aava's duckling voice; Loikka/narrator stay natural.

/** Median fundamental frequency (Hz) over voiced 40 ms frames, autocorrelation, 70–600 Hz. */
export function f0Median(x, rate) {
  const N = Math.round(0.04 * rate), hop = Math.round(0.01 * rate);
  const minLag = Math.floor(rate / 600), maxLag = Math.ceil(rate / 70);
  let peak = 0; for (const s of x) peak = Math.max(peak, Math.abs(s));
  const out = [];
  for (let i = 0; i + N + maxLag < x.length; i += hop) {
    let e = 0; for (let k = 0; k < N; k++) e += x[i + k] * x[i + k];
    if (Math.sqrt(e / N) < peak * 0.08) continue; // unvoiced or quiet
    const rs = new Float32Array(maxLag + 1);
    let best = 0;
    for (let L = minLag; L <= maxLag; L++) {
      let c = 0, e2 = 0;
      for (let k = 0; k < N; k++) { c += x[i + k] * x[i + k + L]; e2 += x[i + k + L] * x[i + k + L]; }
      rs[L] = c / Math.sqrt(e * e2 + 1e-12);
      if (rs[L] > best) best = rs[L];
    }
    if (best <= 0.6) continue;
    // First local peak close to the best one: avoids octave-down errors on clean periodic frames.
    let lag = 0;
    for (let L = minLag + 1; L < maxLag && !lag; L++) if (rs[L] >= 0.9 * best && rs[L] >= rs[L - 1] && rs[L] >= rs[L + 1]) lag = L;
    if (lag) out.push(rate / lag);
  }
  if (!out.length) return null;
  out.sort((a, b) => a - b);
  return Math.round(out[out.length >> 1]);
}

/** Linear-interpolation resample by `ratio` (>1 = shorter and higher). */
function resample(x, ratio) {
  const n = Math.floor(x.length / ratio), y = new Float32Array(n);
  for (let i = 0; i < n; i++) { const p = i * ratio, j = Math.floor(p), f = p - j; y[i] = (x[j] ?? 0) * (1 - f) + (x[j + 1] ?? 0) * f; }
  return y;
}

/** WSOLA time stretch: output length ≈ x.length * factor, pitch unchanged. */
export function stretch(x, rate, factor) {
  const W = Math.round(0.03 * rate), Hs = W >> 1, tol = Math.round(0.008 * rate);
  const Ha = Hs / factor;
  const outLen = Math.ceil(x.length * factor) + W;
  const y = new Float32Array(outLen), norm = new Float32Array(outLen);
  const win = new Float32Array(W); for (let k = 0; k < W; k++) win[k] = 0.5 - 0.5 * Math.cos((2 * Math.PI * k) / W);
  let prev = 0; // input position of the previously copied frame
  for (let m = 0, out = 0; out + W < outLen; m++, out += Hs) {
    const nominal = Math.round(m * Ha);
    if (nominal + W + tol >= x.length) break;
    let pos = nominal;
    if (m > 0) {
      // Best match to the natural continuation of the previous frame.
      const nat = prev + Hs; let best = -Infinity;
      for (let d = -tol; d <= tol; d++) {
        const p = nominal + d; if (p < 0 || p + W >= x.length || nat + W >= x.length) continue;
        let c = 0; for (let k = 0; k < W; k += 2) c += x[p + k] * x[nat + k];
        if (c > best) { best = c; pos = p; }
      }
    }
    for (let k = 0; k < W; k++) { y[out + k] += x[pos + k] * win[k]; norm[out + k] += win[k]; }
    prev = pos;
  }
  const n = Math.round(x.length * factor), z = new Float32Array(n);
  for (let i = 0; i < n; i++) z[i] = norm[i] > 1e-3 ? y[i] / norm[i] : 0;
  return z;
}

/** Pitch and formants up by `semitones`, duration kept. */
export function shift(x, rate, semitones) {
  if (!semitones) return Float32Array.from(x);
  const r = 2 ** (semitones / 12);
  return stretch(resample(x, r), rate, r);
}
