// Pond sounds (Web Audio). Effects play on interaction; the soundscape (wind in the reeds, lapping
// water) follows the visitor's stored choice, else ambientDefault (on for the homepage, off inside Lite).
// Browsers allow no audio before a gesture, so nothing is fetched or played before the first tap or key.
// The clips, their levels and loop lengths come from tools/audiogen (`cli.mjs world`) via sound-kit.json.
import kit from './sound-kit.json';

const MAX_VOICES = 6;
/** Shortest gap between two clips of a family (s): a burst of skips or wing strokes stays a rhythm. */
const GAP = { 'aava.peep': 0.25, 'aava.joy': 0.4, 'aava.wing': 0.07, 'aava.flutter': 0.5, 'water.skip': 0.05, 'water.dive': 0.3, 'wind.swish': 0.35, 'loikka.croak': 0.4, 'loikka.joy': 0.5, 'loikka.push': 0.1, 'land.wet': 0.1 };
const AMBIENT = ['amb.wind', 'amb.lap'];
const KEY = 'saaristo.aanimaisema';

export function makeSound({ world = '/assets/saaristo', ambientDefault = false } = {}) {
  const controller = new AbortController();
  let disposed = false;
  const timers = new Set();
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); };
  const url = (src) => src.replace('/assets/saaristo', world);
  const AC = window.AudioContext || window.webkitAudioContext;
  const stats = { unlocked: false, played: 0, last: null, ambient: false, loaded: 0, failed: 0 };
  let ctx = null, master = null, voices = 0, ambientOn = false, amb = null;
  const bufs = new Map(), lastAt = new Map(), recent = new Map();
  ambientOn = ambientDefault;
  try { const stored = localStorage.getItem(KEY); if (stored !== null) ambientOn = stored === '1'; } catch { /* private mode */ }

  // MP3 decoders differ in how much encoder delay they keep; start each clip at its first sound.
  const lead = (b) => { const d = b.getChannelData(0); let i = 0; while (i < d.length && Math.abs(d[i]) < 1e-4) i++; return Math.max(0, i - 8) / b.sampleRate; };
  const load = (src) => {
    if (!bufs.has(src)) bufs.set(src, fetch(url(src), { signal: controller.signal }).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(r.status))))
      .then((a) => new Promise((ok, no) => ctx.decodeAudioData(a, ok, no))).then((b) => { stats.loaded++; return { b, at: lead(b) }; }).catch(() => { stats.failed++; return null; }));
    return bufs.get(src);
  };

  function unlock() {
    if (!AC || disposed) return;
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
      for (const [name, f] of Object.entries(kit.families)) if (!f.loop) f.clips.forEach((c) => load(c.src));
      document.addEventListener('visibilitychange', () => { if (!ctx || disposed) return; if (document.hidden) ctx.suspend(); else ctx.resume(); }, { signal: controller.signal });
    }
    if (ctx.state !== 'running' && !document.hidden) ctx.resume();
    stats.unlocked = true;
    if (ambientOn && !amb) startAmbient();
  }

  /** family: kit family; opts.x: screen position −1…1 (pans), gain, rate (playback rate), delay (s). */
  function play(family, opts = {}) {
    const f = kit.families[family];
    if (!ctx || !f || document.hidden || ctx.state !== 'running') return false;
    const now = ctx.currentTime;
    if (now - (lastAt.get(family) ?? -9) < (GAP[family] ?? 0.1) || voices >= MAX_VOICES) return false;
    lastAt.set(family, now);
    // Variation: never the same clip twice in a row when there are several.
    let i = Math.floor(Math.random() * f.clips.length);
    if (f.clips.length > 1 && i === recent.get(family)) i = (i + 1) % f.clips.length;
    recent.set(family, i);
    load(f.clips[i].src).then((c) => {
      if (!c || disposed || !ctx || ctx.state !== 'running') return;
      const s = ctx.createBufferSource(), g = ctx.createGain();
      s.buffer = c.b;
      s.playbackRate.value = (opts.rate ?? 1) * (1 + (Math.random() * 2 - 1) * 0.03);
      g.gain.value = opts.gain ?? 1;
      let node = s.connect(g);
      if (ctx.createStereoPanner && opts.x !== undefined) { const p = ctx.createStereoPanner(); p.pan.value = Math.max(-0.8, Math.min(0.8, opts.x * 0.8)); node = node.connect(p); }
      node.connect(master);
      voices++; s.onended = () => { voices--; };
      s.start(ctx.currentTime + (opts.delay ?? 0), c.at);
      stats.played++; stats.last = family;
    });
    return true;
  }

  // ---- Soundscape: a copy of each loop starts every `period` seconds and crossfades with equal power
  // over `xfade` (sin in, cos out), the same mix tools/audiogen checked for seams after packing.
  const curve = (f) => Float32Array.from({ length: 64 }, (_, i) => f(i / 63));
  const FIN = curve((u) => Math.sin((u * Math.PI) / 2)), FOUT = curve((u) => Math.cos((u * Math.PI) / 2));
  function loopPlayer(family, out) {
    const f = kit.families[family];
    if (!f) return null;
    const { period: P, xfade: X } = f.loop, live = [];
    let t0 = 0, k = 0, timer = 0, buf = null, stopped = false;
    load(f.clips[0].src).then((c) => {
      if (!c || stopped || disposed) return;
      buf = c; t0 = ctx.currentTime + 0.05;
      const tick = () => {
        while (t0 + k * P < ctx.currentTime + P + 1) {
          const t = t0 + k * P, s = ctx.createBufferSource(), g = ctx.createGain();
          s.buffer = buf.b; s.connect(g).connect(out);
          if (k > 0) g.gain.setValueCurveAtTime(FIN, t, X); // the curve starts at 0; the copy is silent before t anyway
          g.gain.setValueCurveAtTime(FOUT, t + P, X);
          s.start(t, buf.at); s.stop(t + P + X);
          live.push(s); s.onended = () => { const i = live.indexOf(s); if (i >= 0) live.splice(i, 1); };
          k++;
        }
      };
      tick(); timer = setInterval(tick, 1000);
    });
    return () => { stopped = true; clearInterval(timer); for (const s of [...live]) { try { s.stop(ctx.currentTime + 0.7); } catch { /* ended */ } } };
  }
  function startAmbient() {
    if (!ctx) return;
    const bus = ctx.createGain(), wind = ctx.createGain(), lap = ctx.createGain();
    bus.gain.setValueAtTime(0, ctx.currentTime); bus.gain.linearRampToValueAtTime(1, ctx.currentTime + 2.5);
    wind.connect(bus); lap.connect(bus); bus.connect(master);
    const stops = [loopPlayer('amb.wind', wind), loopPlayer('amb.lap', lap)].filter(Boolean);
    amb = { bus, wind, stop: () => { bus.gain.cancelScheduledValues(ctx.currentTime); bus.gain.setTargetAtTime(0, ctx.currentTime, 0.2); stops.forEach((s) => s()); later(() => bus.disconnect(), 1200); } };
    stats.ambient = true;
  }
  function setAmbient(on) {
    ambientOn = on;
    try { localStorage.setItem(KEY, on ? '1' : '0'); } catch { /* private mode */ }
    if (on) { unlock(); if (ctx && !amb) startAmbient(); }
    else if (amb) { amb.stop(); amb = null; stats.ambient = false; }
  }

  /** A fast sweep: a whoosh, and the soundscape's wind swells with it. s: 0…1. */
  function gust(s, x) {
    play('wind.swish', { gain: 0.45 + 0.55 * s, rate: 0.9 + 0.25 * s, x });
    if (amb) { const g = amb.wind.gain, t = ctx.currentTime; g.cancelScheduledValues(t); g.setTargetAtTime(1 + 1.6 * s, t, 0.12); g.setTargetAtTime(1, t + 0.5, 0.9); }
  }

  return { dispose() { if (disposed) return; disposed = true; controller.abort(); if (amb) { amb.stop(); amb = null; } for (const id of timers) clearTimeout(id); timers.clear(); if (ctx) { ctx.close(); } }, unlock, play, gust, setAmbient, get ambient() { return ambientOn; }, stats, families: Object.keys(kit.families), ambientFamilies: AMBIENT };
}
