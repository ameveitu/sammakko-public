// One managed audio layer under say()/hush(): pre-produced speech files first, the browser's
// Finnish voice second, silence (the text stays on screen) last. Short effects use decoded
// Web Audio buffers; speech uses a media element so long lines stream.
// Nothing here knows the learner model or the task RNG.
import { speechKey } from './key';
import { piecePlan } from './pieces';
import { spoken } from './spoken';

export type Speaker = 'Aava' | 'Loikka' | 'Sulka' | 'narrator';
export type SpeechEnd = 'ended' | 'cancelled' | 'blocked' | 'unavailable' | 'failed';
export interface Playback { started: Promise<boolean>; finished: Promise<SpeechEnd>; stop(): void }

export interface SpeechAsset { id: string; src: string; ms?: number }
export interface SfxAsset { src: string; ms?: number }
/** A soundscape loop: a new copy starts every `period` s and crossfades over `xfade` s (audio/ambient.ts). */
export interface AmbientAsset { src: string; ms?: number; loop: { period: number; xfade: number } }
export interface AudioManifest { schema: string; speech: Record<string, SpeechAsset>; sfx: Record<string, SfxAsset[]>; ambient?: Record<string, AmbientAsset> }

const hasWindow = typeof window !== 'undefined';
const base = (): string => { try { return (import.meta as any).env?.BASE_URL ?? './'; } catch { return './'; } };
export const audioUrl = (src: string) => `${base()}audio/${src}`;

// ------------------------------------------------------------ manifest
let manifest: AudioManifest | null = null;
let loading: Promise<AudioManifest | null> | null = null;
const changed = new Set<() => void>();
/** Availability changed (manifest arrived): screens drawn before that may redraw. */
export const onAudioChange = (f: () => void) => { changed.add(f); return () => changed.delete(f); };

/** The light index only; no audio file is fetched before a sound is actually wanted. */
export function loadManifest(fetchImpl: typeof fetch | undefined = globalThis.fetch): Promise<AudioManifest | null> {
  if (loading) return loading;
  if (!fetchImpl || !hasWindow) return (loading = Promise.resolve(null));
  loading = fetchImpl(audioUrl('manifest.json'), { cache: 'no-cache' })
    .then((r) => (r.ok ? r.json() : null))
    .then((m: AudioManifest | null) => {
      if (m && m.schema === 'sammakko-audio-manifest/1' && m.speech && m.sfx) { setManifest(m); return m; }
      return null;
    })
    .catch(() => null);
  return loading;
}
/** Tests and the audition page set the index directly. */
export function setManifest(m: AudioManifest | null) { manifest = m; changed.forEach((f) => f()); }

export const speechAsset = (speaker: Speaker, text: string): SpeechAsset | undefined => manifest?.speech[speechKey(speaker, text)];
/** Files that together say this text: one file for the whole line, or else consecutive pieces (split at
 *  line breaks and sentence ends, longest piece first) that each have a file. A line is never part file,
 *  part browser voice: if any piece is missing, the answer is undefined. */
export function speechAssets(speaker: Speaker, text: string): SpeechAsset[] | undefined {
  const whole = speechAsset(speaker, text);
  if (whole) return [whole];
  if (!manifest) return undefined;
  const segs = text.split(/\n+|(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean);
  if (segs.length < 2) return undefined;
  const out: SpeechAsset[] = [];
  for (let i = 0; i < segs.length;) {
    let j = segs.length, hit: SpeechAsset | undefined;
    for (; j > i; j--) if ((hit = speechAsset(speaker, segs.slice(i, j).join(' ')))) break;
    if (!hit) return undefined;
    out.push(hit); i = j;
  }
  return out;
}
/** Maths lines (a digit or a maths symbol): recorded pieces can say them when no line file exists. */
const MATHS = /[\d□×÷=<>+−²³%€°≠≈≤≥]/;
/** The narrator's piece clips that together say a maths line (pieces.ts), each with the pause after it. */
export function speechPieces(speaker: Speaker, text: string): { a: SpeechAsset; gapMs: number }[] | undefined {
  if (speaker !== 'narrator' || !manifest || !MATHS.test(text)) return undefined;
  const plan = piecePlan(spoken(text), (k) => !!speechAsset('narrator', k));
  return plan?.map((p) => ({ a: speechAsset('narrator', p.key)!, gapMs: p.gapMs }));
}
export const hasSpeechAssets = () => !!manifest && Object.keys(manifest.speech).length > 0;
export const ambientAssets = (): AmbientAsset[] => Object.values(manifest?.ambient ?? {});

// ------------------------------------------------------------ signals for the soundscape
/** open: a tap opened (or resumed) audio; hidden / gone: the tab was hidden / the page left;
 *  speech-start / speech-end: the speech channel began a line / fell silent. */
export type AudioSignal = 'open' | 'hidden' | 'gone' | 'speech-start' | 'speech-end';
const signals = new Set<(s: AudioSignal) => void>();
export const onAudioSignal = (f: (s: AudioSignal) => void) => { signals.add(f); return () => signals.delete(f); };
const signal = (s: AudioSignal) => signals.forEach((f) => f(s));
let talking = false;
const setTalking = (on: boolean) => { if (on !== talking) { talking = on; signal(on ? 'speech-start' : 'speech-end'); } };
/** A line is being said (or about to be): the soundscape steps aside. */
export const speaking = () => talking;

// ------------------------------------------------------------ backends
interface Deferred<T> { p: Promise<T>; resolve: (v: T) => void }
const deferred = <T,>(): Deferred<T> => { let resolve!: (v: T) => void; const p = new Promise<T>((r) => (resolve = r)); return { p, resolve }; };

/** A backend start: returns a stop function and reports through the two callbacks. */
type Start = (began: (ok: boolean) => void, end: (e: SpeechEnd) => void) => () => void;

function fileStart(a: SpeechAsset): Start {
  return (began, end) => {
    const el = new Audio(audioUrl(a.src));
    el.preload = 'auto';
    let done = false;
    // Every way out (end, error, watchdog, stop) silences and detaches the element before the channel moves on.
    const fin = (e: SpeechEnd) => {
      if (done) return; done = true; clearTimeout(dog);
      try { el.pause(); el.removeAttribute('src'); el.load?.(); } catch { /* element already gone */ }
      began(false); end(e);
    };
    // A missing 'ended' must never hold the lesson: a watchdog closes the line.
    const dog = setTimeout(() => fin('failed'), (a.ms ?? 20000) + 5000);
    el.addEventListener('playing', () => began(true));
    el.addEventListener('ended', () => fin('ended'));
    el.addEventListener('error', () => fin('failed'));
    el.play().catch((err: unknown) => fin((err as { name?: string })?.name === 'NotAllowedError' ? 'blocked' : 'failed'));
    return () => fin('cancelled');
  };
}

/** Several files back to back as one line: one start, one end, one stop. */
function filesStart(as: SpeechAsset[]): Start {
  if (as.length === 1) return fileStart(as[0]!);
  return (began, end) => {
    let i = 0, done = false, heard = false, stop: (() => void) | null = null;
    const next = () => {
      const a = as[i++]!;
      stop = fileStart(a)((ok) => { if (ok && !heard) { heard = true; began(true); } }, (e) => {
        if (done) return;
        if (e === 'ended' && i < as.length) return next();
        done = true; if (!heard) began(false); end(e);
      });
    };
    next();
    return () => { if (!done) stop?.(); };
  };
}

/** Files first; if they fail before a single sound was heard (missing, network, decode), the browser voice
 *  reads the line instead. A line that already began is never finished by the other voice. */
/** Pieces back to back on the audio clock, with short pauses at the punctuation. Before a tap has
 *  opened Web Audio the same files play one after another as media elements. */
function piecesStart(items: { a: SpeechAsset; gapMs: number }[]): Start {
  return (began, end) => {
    const c = ctx;
    if (!c || c.state !== 'running') return filesStart(items.map((x) => x.a))(began, end);
    let done = false, dog: ReturnType<typeof setTimeout>;
    const srcs: AudioBufferSourceNode[] = [];
    const fin = (e: SpeechEnd) => {
      if (done) return; done = true; clearTimeout(dog);
      for (const s of srcs) { s.onended = null; try { s.stop(); } catch { /* not started */ } s.disconnect(); }
      began(false); end(e);
    };
    dog = setTimeout(() => fin('failed'), 4000); // pieces did not load in time: the fallback reads
    void Promise.all(items.map((x) => buffer(x.a.src))).then((bs) => {
      if (done) return;
      if (bs.some((b) => !b) || ctx !== c || c.state !== 'running') return fin('failed');
      clearTimeout(dog);
      let t = c.currentTime + 0.05;
      bs.forEach((b, i) => {
        const s = c.createBufferSource(); s.buffer = b!; s.connect(c.destination); s.start(t); srcs.push(s);
        t += b!.duration + items[i]!.gapMs / 1000;
      });
      srcs[srcs.length - 1]!.onended = () => fin('ended');
      dog = setTimeout(() => fin('ended'), (t - c.currentTime) * 1000 + 3000);
      began(true);
    });
    return () => fin('cancelled');
  };
}

function withFallback(primary: Start, fallback: Start | null): Start {
  if (!fallback) return primary;
  return (began, end) => {
    let heard = false, stop: () => void;
    stop = primary((ok) => { if (ok) heard = true; if (ok) began(true); }, (e) => {
      if (e === 'failed' && !heard) { stop = fallback(began, end); return; }
      began(false); end(e);
    });
    return () => stop();
  };
}

function voiceStart(text: string, voice: SpeechSynthesisVoice, rate: number): Start {
  return (began, end) => {
    const s = speechSynthesis;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'fi-FI'; u.voice = voice; u.rate = rate;
    let done = false;
    const fin = (e: SpeechEnd) => { if (done) return; done = true; clearTimeout(dog); began(false); end(e); };
    const dog = setTimeout(() => { s.cancel(); fin('failed'); }, 4000 + text.length * 120);
    u.onstart = () => began(true);
    u.onend = () => fin('ended');
    u.onerror = (ev) => fin(ev.error === 'not-allowed' ? 'blocked' : ev.error === 'interrupted' || ev.error === 'canceled' ? 'cancelled' : 'failed');
    s.speak(u);
    return () => { fin('cancelled'); s.cancel(); };
  };
}

// ------------------------------------------------------------ the speech channel
interface Line { start: Start; began: Deferred<boolean>; ended: Deferred<SpeechEnd>; stop?: () => void; scope: number }
let current: Line | null = null;
let queue: Line[] = [];
let scope = 0;
const MAX_QUEUE = 3;

function settle(l: Line, e: SpeechEnd) { l.began.resolve(false); l.ended.resolve(e); }

function run(l: Line) {
  if (l.scope !== scope) { settle(l, 'cancelled'); return setTalking(!!current); }
  current = l;
  setTalking(true);
  l.stop = l.start((ok) => l.began.resolve(ok), (e) => {
    l.ended.resolve(e);
    if (current !== l) return;
    current = null;
    const next = queue.shift();
    if (next) run(next); else setTalking(false);
  });
}

export interface PlayRequest { speaker: Speaker; text: string; spoken: string; after?: boolean; voice?: SpeechSynthesisVoice; rate?: number }

/** Resolve and play one line. `after`: wait behind the current line (same view only). */
export function play(req: PlayRequest): Playback {
  const assets = speechAssets(req.speaker, req.text);
  const pieces = assets ? undefined : speechPieces(req.speaker, req.text);
  const voice = req.voice && typeof speechSynthesis !== 'undefined' ? voiceStart(req.spoken, req.voice, req.rate ?? 0.92) : null;
  const start = assets ? withFallback(filesStart(assets), voice) : pieces ? withFallback(piecesStart(pieces), voice) : voice;
  // A new screen's line silences the old one even when the new line itself cannot be heard.
  if (!req.after) stopSpeech();
  if (!start) return { started: Promise.resolve(false), finished: Promise.resolve('unavailable'), stop() {} };
  const l: Line = { start, began: deferred(), ended: deferred(), scope };
  if (current) {
    queue.push(l);
    // Stale queued lines are dropped, never read late over a newer screen.
    while (queue.length > MAX_QUEUE) settle(queue.shift()!, 'cancelled');
  } else run(l);
  return {
    started: l.began.p, finished: l.ended.p,
    stop: () => { if (current === l) l.stop?.(); else { queue = queue.filter((x) => x !== l); settle(l, 'cancelled'); } },
  };
}

/** Stops the line, the queue and anything still loading for the old view. */
export function stopSpeech() {
  scope++;
  const q = queue; queue = [];
  q.forEach((l) => settle(l, 'cancelled'));
  const c = current; current = null;
  c?.stop?.();
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
  setTalking(false);
}

// ------------------------------------------------------------ effects
const SFX_KEY = 'sammakko-lite-sfx';
export function sfxOn(): boolean { try { return localStorage.getItem(SFX_KEY) !== 'off'; } catch { return true; } }
export function setSfxOn(on: boolean) { try { localStorage.setItem(SFX_KEY, on ? 'on' : 'off'); } catch { /* setting stays for this page */ } }

let ctx: AudioContext | null = null;
let sfxBus: GainNode | null = null;
const MAX_VOICES = 4;
const BUFFER_BUDGET = 16 * 1024 * 1024;
let voices = 0;
let sfxScope = 0;
const buffers = new Map<string, AudioBuffer>();
const decoding = new Map<string, Promise<AudioBuffer | null>>();
const lastVariant = new Map<string, number>();

/** Opens audio on a deliberate tap or key press (autoplay rules). Never on load or hover. */
export function unlock() {
  if (!hasWindow) return;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  if (!ctx) {
    ctx = new AC();
    sfxBus = ctx.createGain();
    sfxBus.gain.value = 0.7; // headroom under speech
    sfxBus.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume().then(() => signal('open'), () => undefined);
  else signal('open');
}
if (hasWindow) for (const ev of ['pointerdown', 'keydown']) window.addEventListener(ev, unlock, { capture: true, passive: true });

/** Tab hidden: speech and effects stop and the context is suspended. Nothing resumes by itself;
 *  the next deliberate tap or key press opens audio again. */
export function pageHidden() {
  stopSpeech(); stopSfx(); signal('hidden');
  if (ctx && ctx.state === 'running') void ctx.suspend().catch(() => undefined);
}
/** Page left (or put in the back/forward cache): the context and decoded buffers are released. */
export function pageGone() {
  pageHidden(); signal('gone');
  const c = ctx; ctx = null; sfxBus = null;
  buffers.clear(); decoding.clear(); voices = 0;
  if (c) void c.close().catch(() => undefined);
}
if (hasWindow) {
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') pageHidden(); });
  window.addEventListener('pagehide', pageGone);
}

const bytesOf = (b: AudioBuffer) => b.length * b.numberOfChannels * 4;
function remember(src: string, b: AudioBuffer) {
  buffers.delete(src); buffers.set(src, b);
  let total = 0; buffers.forEach((x) => (total += bytesOf(x)));
  for (const [k, x] of buffers) { if (total <= BUFFER_BUDGET) break; buffers.delete(k); total -= bytesOf(x); }
}
function buffer(src: string): Promise<AudioBuffer | null> {
  const hit = buffers.get(src);
  if (hit) { remember(src, hit); return Promise.resolve(hit); }
  if (!ctx) return Promise.resolve(null);
  const c = ctx;
  let p = decoding.get(src);
  if (!p) {
    p = fetch(audioUrl(src)).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
      .then((ab) => c.decodeAudioData(ab)).then((b) => { remember(src, b); return b; }).catch(() => null)
      .finally(() => decoding.delete(src));
    decoding.set(src, p);
  }
  return p;
}

/** Variant choice has its own state: it never touches the seeded task generators. */
function pick(family: string, n: number): number {
  if (n < 2) return 0;
  const last = lastVariant.get(family) ?? -1;
  let i = Math.floor(Math.random() * (n - 1));
  if (i >= last && last >= 0) i++;
  lastVariant.set(family, i);
  return i;
}

/** Plays one effect for one event. A late decode (>350 ms) is dropped instead of firing out of sync. */
export function playSfx(family: string, gain = 1) {
  if (!sfxOn()) return;
  const vs = manifest?.sfx[family];
  if (!vs?.length || !ctx || !sfxBus || ctx.state !== 'running') return;
  const v = vs[pick(family, vs.length)]!;
  const asked = performance.now(), my = sfxScope, c = ctx, bus = sfxBus;
  void buffer(v.src).then((b) => {
    if (!b || my !== sfxScope || voices >= MAX_VOICES || performance.now() - asked > 350) return;
    const s = c.createBufferSource(); s.buffer = b;
    const g = c.createGain(); g.gain.value = gain;
    s.connect(g).connect(bus);
    voices++;
    s.onended = () => { voices--; g.disconnect(); };
    s.start();
  });
}

/** Warms the decode cache for a view (small, only the families it uses). */
export function preloadSfx(families: string[]) {
  if (!ctx) return;
  for (const f of families) for (const v of manifest?.sfx[f] ?? []) void buffer(v.src);
}

/** The effects mixer for the soundscape (same bus, so loops keep their level against the effects
 *  they were matched to): null until a deliberate tap opened audio, or while it is suspended. */
export const mixer = (): { ctx: AudioContext; out: AudioNode } | null => (ctx && sfxBus && ctx.state === 'running' ? { ctx, out: sfxBus } : null);

/** A view closed: queued or still-decoding effects for it never play. */
export function stopSfx() { sfxScope++; }

/** Test hook: the channel state without reaching into module internals. */
export const _state = () => ({ current: !!current, queued: queue.length, scope, ctx: ctx?.state ?? null, voices, buffers: buffers.size });
