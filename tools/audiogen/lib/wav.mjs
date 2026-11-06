// PCM16 mono WAV read/write and simple level analysis. No dependencies.

export function encodeWav(samples, rate) {
  const n = samples.length, buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(rate, 24); buf.writeUInt32LE(rate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(samples[i] * 32767))), 44 + i * 2);
  return buf;
}

export function decodeWav(buf) {
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') throw new Error('not a WAV file');
  let p = 12, fmt = null, data = null;
  while (p + 8 <= buf.length) {
    const id = buf.toString('ascii', p, p + 4), size = buf.readUInt32LE(p + 4);
    if (id === 'fmt ') fmt = { format: buf.readUInt16LE(p + 8), channels: buf.readUInt16LE(p + 10), rate: buf.readUInt32LE(p + 12), bits: buf.readUInt16LE(p + 22) };
    if (id === 'data') data = buf.subarray(p + 8, p + 8 + size);
    p += 8 + size + (size & 1);
  }
  if (!fmt || !data || fmt.format !== 1 || fmt.bits !== 16) throw new Error('only PCM16 WAV is supported');
  const frames = data.length / 2 / fmt.channels, out = new Float32Array(frames);
  for (let i = 0; i < frames; i++) out[i] = data.readInt16LE(i * 2 * fmt.channels) / 32768;
  return { rate: fmt.rate, channels: fmt.channels, samples: out };
}

/** Raw 16-bit little-endian PCM (Realtime audio/pcm) to floats. */
export const pcm16ToFloat = (buf) => { const out = new Float32Array(buf.length >> 1); for (let i = 0; i < out.length; i++) out[i] = buf.readInt16LE(i * 2) / 32768; return out; };

/** Windowed-sinc resampler (Hann window, 32 taps per side, lowpass just under the lower Nyquist).
 *  Used before MP3 encoding: lamejs's own resampler can turn 24 kHz speech into pure silence. */
export function resample(xs, from, to) {
  if (from === to) return Float32Array.from(xs);
  const ratio = to / from, n = Math.floor(xs.length * ratio), out = new Float32Array(n), fc = Math.min(1, ratio) * 0.97, H = 32;
  for (let i = 0; i < n; i++) {
    const t = i / ratio, c = Math.floor(t); let acc = 0, wsum = 0;
    for (let k = c - H + 1; k <= c + H; k++) {
      if (k < 0 || k >= xs.length) continue;
      const x = t - k, s = x === 0 ? 1 : Math.sin(Math.PI * fc * x) / (Math.PI * fc * x), w = 0.5 + 0.5 * Math.cos((Math.PI * x) / H);
      acc += xs[k] * s * w; wsum += s * w;
    }
    out[i] = wsum ? acc / wsum : 0;
  }
  return out;
}

const db = (x) => (x > 0 ? 20 * Math.log10(x) : -Infinity);
export function analyze(samples, rate) {
  let peak = 0, sum = 0;
  for (const s of samples) { const a = Math.abs(s); if (a > peak) peak = a; sum += s * s; }
  const rms = Math.sqrt(sum / Math.max(1, samples.length));
  return { ms: Math.round((samples.length / rate) * 1000), peakDb: +db(peak).toFixed(2), rmsDb: +db(rms).toFixed(2) };
}

/** Speech finishing: trim silent edges, approximate level (RMS proxy for about -18 LUFS),
 *  limit the peak to -1 dBFS, short fades against clicks. Listening still decides. */
export function finishSpeech(samples, rate, { targetRmsDb = -20, ceilingDb = -1, gate = 0.01 } = {}) {
  let a = 0, b = samples.length;
  while (a < b && Math.abs(samples[a]) < gate) a++;
  while (b > a && Math.abs(samples[b - 1]) < gate) b--;
  const pad = Math.round(rate * 0.06);
  const s = Float32Array.from(samples.subarray(Math.max(0, a - pad), Math.min(samples.length, b + pad)));
  const { rmsDb, peakDb } = analyze(s, rate);
  let gainDb = targetRmsDb - rmsDb;
  if (peakDb + gainDb > ceilingDb) gainDb = ceilingDb - peakDb;
  const g = 10 ** (gainDb / 20);
  const f = Math.min(s.length >> 1, Math.round(rate * 0.005));
  for (let i = 0; i < s.length; i++) {
    const env = i < f ? i / f : i > s.length - 1 - f ? (s.length - 1 - i) / f : 1;
    s[i] *= g * env;
  }
  return { samples: s, gainDb: +gainDb.toFixed(2) };
}
