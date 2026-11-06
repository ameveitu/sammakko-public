// Soundscape: wind in the reeds and lapping water (manifest `ambient`, approved CC0 loops from
// tools/audiogen). Opt-in: silent until the adult page or the workshop switch turns it on, and the
// choice has its own key. It never opens audio by itself: the first deliberate tap does (player.ts).
// It stops with a hidden tab, the page leaving, or the gate (quiet mode, set by ui/speech.ts); it plays
// softer in lessons and steps aside while a line is said. Nothing here reads the learner model or the
// task RNG; the loops use no randomness at all.
import { ambientAssets, audioUrl, mixer, onAudioChange, onAudioSignal, speaking, type AmbientAsset } from './player';

const KEY = 'sammakko-lite-ambient';
/** Level in a lesson (the map and other views play at 1) and under speech, as gain factors. */
export const LESSON_LEVEL = 0.55, DUCK_LEVEL = 0.35;
const FADE_IN = 2.5;

let memory = false; // the choice for this page when storage is unavailable
export function ambientOn(): boolean {
  try { const v = localStorage.getItem(KEY); return v === null ? memory : v === 'on'; } catch { return memory; }
}
export function setAmbientOn(on: boolean) {
  memory = on;
  try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* kept for this page only */ }
  if (!on) bufs.clear();
  syncAmbient();
}

let gate: () => boolean = () => true;
/** What else must allow sound (quiet mode); checked on every sync and once a second while on. */
export function setAmbientGate(f: () => boolean) { gate = f; syncAmbient(); }

const inLesson = () => typeof location !== 'undefined' && location.hash.startsWith('#kc/');
const level = () => (inLesson() ? LESSON_LEVEL : 1);

/** Move a gain smoothly from wherever it is now (a running fade included). */
function glide(c: AudioContext, p: AudioParam, to: number, tau: number, delay = 0) {
  const now = c.currentTime, v = p.value;
  p.cancelScheduledValues(now); p.setValueAtTime(v, now); p.setTargetAtTime(to, now + delay, tau);
}

// ------------------------------------------------------------ loops
interface Decoded { b: AudioBuffer; at: number }
const bufs = new Map<string, Promise<Decoded | null>>();
// MP3 decoders keep different amounts of encoder delay: each copy starts at its first sound.
const lead = (b: AudioBuffer) => { const d = b.getChannelData(0); let i = 0; while (i < d.length && Math.abs(d[i]!) < 1e-4) i++; return Math.max(0, i - 8) / b.sampleRate; };
function load(c: AudioContext, src: string): Promise<Decoded | null> {
  let p = bufs.get(src);
  if (!p) {
    p = fetch(audioUrl(src)).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
      .then((ab) => c.decodeAudioData(ab)).then((b) => ({ b, at: lead(b) })).catch(() => null);
    bufs.set(src, p);
  }
  return p;
}

const curve = (f: (u: number) => number) => Float32Array.from({ length: 64 }, (_, i) => f(i / 63));
const FADE_UP = curve((u) => Math.sin((u * Math.PI) / 2)), FADE_DOWN = curve((u) => Math.cos((u * Math.PI) / 2));

interface Loop { fill(): void; stop(at: number): void }
/** A new copy every `period` s, crossfaded with equal power over `xfade` s (sin in, cos out): the mix
 *  tools/audiogen measured for seams after packing. Copies are scheduled up to one period ahead. */
function loop(c: AudioContext, a: AmbientAsset, out: AudioNode): Loop {
  const { period: P, xfade: X } = a.loop, live: AudioBufferSourceNode[] = [];
  let buf: Decoded | null = null, t0 = 0, k = 0, first = true, stopped = false;
  const fill = () => {
    if (!buf || stopped) return;
    // The next copy's start already passed (a stalled timer): pick up from now with a crossfade.
    if (t0 + k * P < c.currentTime) { t0 = c.currentTime + 0.05; k = 0; }
    while (t0 + k * P < c.currentTime + P + 1) {
      const t = t0 + k * P, s = c.createBufferSource(), g = c.createGain();
      s.buffer = buf.b; s.connect(g).connect(out);
      if (!first) g.gain.setValueCurveAtTime(FADE_UP, t, X);
      g.gain.setValueCurveAtTime(FADE_DOWN, t + P, X);
      s.start(t, buf.at); s.stop(t + P + X);
      live.push(s);
      s.onended = () => { const i = live.indexOf(s); if (i >= 0) live.splice(i, 1); g.disconnect(); };
      first = false; k++;
    }
  };
  void load(c, a.src).then((d) => { if (!d || stopped) return; buf = d; t0 = c.currentTime + 0.05; fill(); });
  return { fill, stop: (at) => { stopped = true; for (const s of [...live]) { try { s.stop(at); } catch { /* already ended */ } } } };
}

// ------------------------------------------------------------ the running soundscape
interface Running { c: AudioContext; bus: GainNode; duck: GainNode; loops: Loop[]; level: number }
let run: Running | null = null;
let watch: ReturnType<typeof setInterval> | 0 = 0;

function start(c: AudioContext, out: AudioNode) {
  const now = c.currentTime, bus = c.createGain(), duck = c.createGain(), to = level();
  duck.gain.value = speaking() ? DUCK_LEVEL : 1;
  bus.gain.setValueAtTime(0, now); bus.gain.linearRampToValueAtTime(to, now + FADE_IN);
  bus.connect(duck).connect(out);
  run = { c, bus, duck, loops: ambientAssets().map((a) => loop(c, a, bus)), level: to };
}

function stop() {
  const r = run; run = null;
  if (!r || r.c.state === 'closed') return;
  glide(r.c, r.bus.gain, 0, 0.2);
  r.loops.forEach((l) => l.stop(r.c.currentTime + 0.7));
  setTimeout(() => r.duck.disconnect(), 1200);
}

/** Bring the soundscape in line with the setting, the gate, the tab and the view. Idempotent. */
export function syncAmbient() {
  const on = ambientOn(), m = on ? mixer() : null;
  const want = !!m && gate() && ambientAssets().length > 0 && (typeof document === 'undefined' || document.visibilityState !== 'hidden');
  if (run && (!want || run.c !== m!.ctx)) stop();
  if (want && !run) start(m!.ctx, m!.out);
  if (run) {
    const to = level();
    if (to !== run.level) { run.level = to; glide(run.c, run.bus.gain, to, 0.6); }
    run.loops.forEach((l) => l.fill());
  }
  // While on and audio is open, a once-a-second check schedules the next copies and notices the gate.
  const keep = on && !!m && ambientAssets().length > 0;
  if (keep && !watch) watch = setInterval(syncAmbient, 1000);
  else if (!keep && watch) { clearInterval(watch); watch = 0; }
}

onAudioSignal((s) => {
  if (s === 'speech-start' || s === 'speech-end') {
    if (run) glide(run.c, run.duck.gain, s === 'speech-start' ? DUCK_LEVEL : 1, s === 'speech-start' ? 0.08 : 0.5, s === 'speech-start' ? 0 : 0.3);
    return;
  }
  if (s === 'gone') {
    // The context closes with everything in it; the next tap's 'open' starts afresh.
    run = null; bufs.clear();
    if (watch) { clearInterval(watch); watch = 0; }
    return;
  }
  syncAmbient();
});
onAudioChange(syncAmbient); // the manifest arrived
if (typeof window !== 'undefined') window.addEventListener('hashchange', syncAmbient);

/** Test hook. */
export const _ambient = () => ({ playing: !!run, level: run?.level ?? 0, watching: !!watch, loaded: bufs.size });
