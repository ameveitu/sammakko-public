// @ts-nocheck: node-only test with stubbed browser globals (the project has no DOM test env)
// Soundscape (audio/ambient.ts): off by default and never before a tap; once on, each loop's copies
// crossfade every period like the packed seam check; speech ducks it, lessons soften it, quiet mode,
// a hidden tab, switching off and leaving the page stop it. Each test loads fresh modules.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class Param {
  value: number; target: number; log: unknown[][] = [];
  constructor(v = 1) { this.value = v; this.target = v; }
  setValueAtTime(v, t) { this.log.push(['set', v, t]); this.value = v; }
  linearRampToValueAtTime(v, t) { this.log.push(['ramp', v, t]); this.target = v; }
  setTargetAtTime(v, t, tau) { this.log.push(['target', v, t, tau]); this.target = v; }
  cancelScheduledValues(t) { this.log.push(['cancel', t]); }
  setValueCurveAtTime(c, t, d) { this.log.push(['curve', c[0] < 0.5 ? 'up' : 'down', t, d]); }
}
class Node_ { to = null; gone = false; connect(x) { this.to = x; return x; } disconnect() { this.gone = true; } }
class FakeCtx {
  static made: FakeCtx[] = [];
  state = 'suspended'; destination = new Node_(); currentTime = 0;
  gains = []; sources = [];
  constructor() { FakeCtx.made.push(this); }
  createGain() { const g = Object.assign(new Node_(), { gain: new Param(1) }); this.gains.push(g); return g; }
  createBufferSource() {
    const s = Object.assign(new Node_(), { buffer: null, onended: null, at: null, offset: null, stopAt: null,
      start(t, o) { this.at = t ?? 0; this.offset = o ?? 0; }, stop(t) { this.stopAt = t; } });
    this.sources.push(s); return s;
  }
  resume() { this.state = 'running'; return Promise.resolve(); }
  suspend() { this.state = 'suspended'; return Promise.resolve(); }
  close() { this.state = 'closed'; return Promise.resolve(); }
  // 96 silent samples of encoder delay, then sound.
  decodeAudioData() { return Promise.resolve({ length: 48000, numberOfChannels: 1, sampleRate: 48000, getChannelData: () => Float32Array.from({ length: 200 }, (_, i) => (i < 96 ? 0 : 0.3)) }); }
}
class FakeAudio {
  static all: FakeAudio[] = [];
  src: string; paused = false; on = {};
  constructor(src) { this.src = src; FakeAudio.all.push(this); }
  addEventListener(t, f) { (this.on[t] ??= []).push(f); }
  emit(t) { (this.on[t] ?? []).forEach((f) => f()); }
  play() { queueMicrotask(() => this.emit('playing')); return Promise.resolve(); }
  pause() { this.paused = true; }
  removeAttribute() {}
  load() {}
}

let win, doc, loc, store: Record<string, string>, P, A, K;
const fire = (target, type) => (target.l[type] ?? []).forEach((f) => f({ type }));
const tick = (ms = 5) => new Promise((r) => setTimeout(r, ms));
const WIND = 'amb/amb.wind-2.0823f03e7f.mp3', LAP = 'amb/amb.lap-2.8ba7781cc0.mp3';
const ctx = () => FakeCtx.made.at(-1);
const fetched = () => fetch.mock.calls.map((c) => String(c[0])).filter((u) => u.includes('/amb/')).map((u) => u.replace(/^.*audio\//, ''));
/** Copies of one loop, told apart by their crossfade length. */
const copies = (xfade) => ctx().sources.filter((s) => s.to.gain.log.some((e) => e[3] === xfade));
/** The soundscape's own gains: duck feeds the effects bus, bus feeds duck. */
const nodes = () => {
  const c = ctx(), sfxBus = c.gains[0];
  const duck = c.gains.filter((g) => g.to === sfxBus && !g.gone).at(-1);
  return { duck, bus: c.gains.find((g) => g.to === duck) };
};
const live = () => ctx().sources.filter((s) => s.stopAt === null || s.stopAt > ctx().currentTime + 1);

beforeEach(async () => {
  vi.resetModules();
  FakeCtx.made = []; FakeAudio.all = [];
  store = {};
  win = { l: {}, addEventListener(t, f) { (this.l[t] ??= []).push(f); }, AudioContext: FakeCtx };
  doc = { l: {}, visibilityState: 'visible', addEventListener(t, f) { (this.l[t] ??= []).push(f); }, documentElement: { classList: { toggle() {} } } };
  loc = { hash: '' };
  vi.stubGlobal('window', win);
  vi.stubGlobal('document', doc);
  vi.stubGlobal('location', loc);
  vi.stubGlobal('Audio', FakeAudio);
  vi.stubGlobal('localStorage', { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } });
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)), json: () => Promise.resolve(null) })));
  P = await import('../src/audio/player');
  A = await import('../src/audio/ambient');
  K = await import('../src/audio/key');
  P.setManifest({
    schema: 'sammakko-audio-manifest/1',
    speech: { [K.speechKey('narrator', 'Hei.')]: { id: 'h', src: 'speech/h.0000000000.mp3', ms: 400 } },
    sfx: {},
    ambient: { 'amb.wind': { src: WIND, ms: 17500, loop: { period: 16, xfade: 1.5 } }, 'amb.lap': { src: LAP, ms: 15200, loop: { period: 14, xfade: 1.2 } } },
  });
});
afterEach(() => { fire(win, 'pagehide'); vi.useRealTimers(); vi.unstubAllGlobals(); });

/** Tap, turn on, let the loops load. */
async function playing() {
  fire(win, 'pointerdown'); await tick();
  A.setAmbientOn(true); await tick();
}

describe('opt-in', () => {
  it('is off by default: a tap opens audio, but no loop is fetched or played', async () => {
    fire(win, 'pointerdown'); await tick();
    expect(P._state().ctx).toBe('running');
    expect(A.ambientOn()).toBe(false);
    expect(fetched()).toEqual([]);
    expect(ctx().sources.length).toBe(0);
    expect(A._ambient()).toMatchObject({ playing: false, watching: false });
  });
  it('turned on before any tap, it waits: nothing is fetched until a tap opens audio', async () => {
    A.setAmbientOn(true); await tick();
    expect(store['sammakko-lite-ambient']).toBe('on');
    expect(FakeCtx.made.length).toBe(0);
    expect(fetched()).toEqual([]);
    fire(win, 'pointerdown'); await tick();
    expect(A._ambient().playing).toBe(true);
    expect(fetched().sort()).toEqual([LAP, WIND].sort());
  });
  it('the choice is remembered in its own key, apart from effects', async () => {
    store['sammakko-lite-ambient'] = 'on';
    fire(win, 'pointerdown'); await tick();
    expect(A._ambient().playing).toBe(true);
    expect(store['sammakko-lite-sfx']).toBeUndefined();
  });
  it('fades in over the effects bus and never draws random numbers', async () => {
    const rnd = vi.spyOn(Math, 'random');
    await playing();
    const { bus } = nodes();
    expect(bus.gain.log.slice(0, 2)).toEqual([['set', 0, 0], ['ramp', 1, 2.5]]);
    expect(rnd).not.toHaveBeenCalled();
    rnd.mockRestore();
  });
});

describe('seamless loops', () => {
  it('each copy starts at its first sound and crossfades with equal power every period', async () => {
    await playing();
    const c = ctx(), { bus } = nodes();
    const wind = copies(1.5);
    expect(wind.every((s) => s.to.to === bus)).toBe(true);
    // Scheduled one period ahead: copies at 0.05 and 16.05 for the 16 s wind loop.
    expect(wind.length).toBe(2);
    expect(wind[0].at).toBeCloseTo(0.05, 9); expect(wind[1].at).toBeCloseTo(16.05, 9);
    expect(wind[0].offset).toBeCloseTo((96 - 8) / 48000, 9);
    // The first copy starts under the bus fade-in; every later one fades up as the previous fades down.
    expect(wind[0].to.gain.log.map((e) => e[1])).toEqual(['down']);
    expect(wind[0].to.gain.log[0][2]).toBeCloseTo(16.05, 9);
    expect(wind[1].to.gain.log.map((e) => e[1])).toEqual(['up', 'down']);
    expect(wind[1].to.gain.log[0][2]).toBeCloseTo(16.05, 9);
    expect(wind[1].to.gain.log[1][2]).toBeCloseTo(32.05, 9);
    expect(wind[1].stopAt).toBeCloseTo(16.05 + 16 + 1.5, 9);
    // The check once a second schedules the next copy in time.
    c.currentTime = 16;
    A.syncAmbient();
    expect(copies(1.5).map((s) => s.at)).toHaveLength(3);
    expect(copies(1.5)[2].at).toBeCloseTo(32.05, 9);
    expect(copies(1.2).map((s) => Math.round(s.at * 100) / 100)).toEqual([0.05, 14.05, 28.05]);
  });
  it('a stalled clock picks up from now with a crossfade instead of a burst of late copies', async () => {
    await playing();
    const c = ctx(), before = c.sources.length;
    c.currentTime = 100;
    A.syncAmbient();
    const added = c.sources.slice(before);
    expect(added.length).toBeLessThanOrEqual(4);
    expect(added.every((s) => s.at >= 100)).toBe(true);
    const fresh = added.filter((s) => Math.abs(s.at - 100.05) < 1e-9);
    expect(fresh.length).toBe(2);
    expect(fresh.every((s) => s.to.gain.log[0][1] === 'up')).toBe(true);
  });
});

describe('around speech and lessons', () => {
  it('speech ducks it, and it comes back after the line', async () => {
    await playing();
    const { duck } = nodes();
    const line = P.play({ speaker: 'narrator', text: 'Hei.', spoken: 'Hei.' });
    expect(await line.started).toBe(true);
    expect(duck.gain.target).toBe(A.DUCK_LEVEL);
    FakeAudio.all[0].emit('ended');
    expect(await line.finished).toBe('ended');
    expect(duck.gain.target).toBe(1);
  });
  it('lessons play it softer; the map brings it back up', async () => {
    await playing();
    const { bus } = nodes();
    loc.hash = '#kc/x'; fire(win, 'hashchange');
    expect(bus.gain.target).toBe(A.LESSON_LEVEL);
    loc.hash = ''; fire(win, 'hashchange');
    expect(bus.gain.target).toBe(1);
  });
  it('quiet mode silences it at once; it returns when quiet ends', async () => {
    const S = await import('../src/ui/speech');
    const { store: st } = await import('../src/engine/store');
    await playing();
    st.update((x) => { x.quietUntil = Date.now() + 3600e3; });
    S.hush();
    expect(A._ambient().playing).toBe(false);
    expect(live().length).toBe(0);
    st.update((x) => { x.quietUntil = 0; });
    S.hush();
    expect(A._ambient().playing).toBe(true);
  });
});

describe('stopping', () => {
  it('a hidden tab stops it, and nothing resumes until the next tap', async () => {
    await playing();
    doc.visibilityState = 'hidden'; fire(doc, 'visibilitychange');
    expect(A._ambient().playing).toBe(false);
    expect(ctx().state).toBe('suspended');
    doc.visibilityState = 'visible'; fire(doc, 'visibilitychange');
    A.syncAmbient();
    expect(A._ambient().playing).toBe(false);
    fire(win, 'keydown'); await tick();
    expect(A._ambient().playing).toBe(true);
  });
  it('switching off fades out, stops every copy and drops the timer and buffers', async () => {
    await playing();
    expect(A._ambient()).toMatchObject({ playing: true, watching: true, loaded: 2 });
    A.setAmbientOn(false);
    expect(A._ambient()).toMatchObject({ playing: false, watching: false, loaded: 0 });
    expect(store['sammakko-lite-ambient']).toBe('off');
    expect(live().length).toBe(0);
  });
  it('leaving the page releases everything; the next tap starts afresh', async () => {
    await playing();
    fire(win, 'pagehide');
    expect(ctx().state).toBe('closed');
    expect(A._ambient()).toMatchObject({ playing: false, watching: false, loaded: 0 });
    fire(win, 'pointerdown'); await tick();
    expect(FakeCtx.made.length).toBe(2);
    expect(A._ambient().playing).toBe(true);
  });
  it('without loops in the manifest the switch changes nothing audible', async () => {
    P.setManifest({ schema: 'sammakko-audio-manifest/1', speech: {}, sfx: {} });
    await playing();
    expect(A._ambient().playing).toBe(false);
    expect(fetched()).toEqual([]);
  });
});
