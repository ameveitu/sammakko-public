// @ts-nocheck: node-only test with stubbed browser globals (the project has no DOM test env)
// Audio lifecycle and isolation: no context before a gesture, a hidden tab silences everything and
// nothing resumes by itself, leaving the page releases the context, timers never outlive a line,
// and the adult's mute/calm settings hold. Each test loads a fresh copy of the player.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class FakeCtx {
  static made: FakeCtx[] = [];
  state = 'suspended'; destination = {}; started = 0; decodeMs = 0;
  constructor() { FakeCtx.made.push(this); }
  createGain() { return { gain: { value: 1 }, connect: (x) => x, disconnect() {} }; }
  createBufferSource() {
    const c = this;
    return { buffer: null, onended: null, connect: (x) => x, start() { c.started++; } };
  }
  resume() { this.state = 'running'; return Promise.resolve(); }
  suspend() { this.state = 'suspended'; return Promise.resolve(); }
  close() { this.state = 'closed'; return Promise.resolve(); }
  decodeAudioData() { return new Promise((r) => setTimeout(() => r({ length: 4800, numberOfChannels: 1 }), this.decodeMs)); }
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

let win, doc, store: Record<string, string>, P, K;
const fire = (target, type) => (target.l[type] ?? []).forEach((f) => f({ type }));
const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));

beforeEach(async () => {
  vi.resetModules();
  FakeCtx.made = []; FakeAudio.all = [];
  store = {};
  win = { l: {}, addEventListener(t, f) { (this.l[t] ??= []).push(f); }, AudioContext: FakeCtx };
  doc = { l: {}, visibilityState: 'visible', addEventListener(t, f) { (this.l[t] ??= []).push(f); }, documentElement: { classList: { toggle() {} } } };
  vi.stubGlobal('window', win);
  vi.stubGlobal('document', doc);
  vi.stubGlobal('Audio', FakeAudio);
  vi.stubGlobal('localStorage', { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } });
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)), json: () => Promise.resolve(null) })));
  P = await import('../src/audio/player');
  K = await import('../src/audio/key');
  P.setManifest({
    schema: 'sammakko-audio-manifest/1',
    speech: { [K.speechKey('narrator', 'Hei.')]: { id: 'h', src: 'speech/h.0000000000.mp3', ms: 400 } },
    sfx: { 'ui.confirm': [{ src: 'sfx/a.1111111111.wav' }, { src: 'sfx/b.2222222222.wav' }], 'aava.joy': [{ src: 'sfx/j.3333333333.wav' }] },
  });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('before any gesture', () => {
  it('no audio context exists and effects stay silent; nothing is fetched', async () => {
    P.playSfx('ui.confirm'); P.preloadSfx(['ui.confirm']);
    await tick(5);
    expect(FakeCtx.made.length).toBe(0);
    expect(P._state().ctx).toBe(null);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('hover or focus does not open audio, a tap does', () => {
    expect(win.l.mouseover).toBeUndefined();
    expect(win.l.focus).toBeUndefined();
    fire(win, 'pointerdown');
    expect(P._state().ctx).toBe('running');
  });
});

describe('effects', () => {
  it('play after a tap, at most four at once', async () => {
    fire(win, 'pointerdown');
    for (let i = 0; i < 6; i++) P.playSfx('ui.confirm');
    await tick(5);
    expect(FakeCtx.made[0].started).toBe(4);
  });
  it('the own sfx setting silences them', async () => {
    fire(win, 'pointerdown');
    P.setSfxOn(false);
    P.playSfx('ui.confirm');
    await tick(5);
    expect(FakeCtx.made[0].started).toBe(0);
    expect(store['sammakko-lite-sfx']).toBe('off');
  });
  it('a decode later than 350 ms is dropped instead of playing out of sync', async () => {
    fire(win, 'pointerdown');
    FakeCtx.made[0].decodeMs = 400;
    P.playSfx('aava.joy');
    await tick(450);
    expect(FakeCtx.made[0].started).toBe(0);
  });
  it('closing a view drops effects still decoding for it', async () => {
    fire(win, 'pointerdown');
    FakeCtx.made[0].decodeMs = 20;
    P.playSfx('aava.joy');
    P.stopSfx();
    await tick(40);
    expect(FakeCtx.made[0].started).toBe(0);
  });
});

describe('hidden tab and leaving the page', () => {
  it('hiding stops speech and effects and suspends; showing again does not resume by itself', async () => {
    fire(win, 'pointerdown');
    const line = P.play({ speaker: 'narrator', text: 'Hei.', spoken: 'Hei.' });
    expect(await line.started).toBe(true);
    doc.visibilityState = 'hidden'; fire(doc, 'visibilitychange');
    expect(await line.finished).toBe('cancelled');
    expect(FakeAudio.all[0].paused).toBe(true);
    expect(P._state().ctx).toBe('suspended');
    doc.visibilityState = 'visible'; fire(doc, 'visibilitychange');
    P.playSfx('ui.confirm');
    await tick(5);
    expect(P._state().ctx).toBe('suspended');
    expect(FakeCtx.made[0].started).toBe(0);
    fire(win, 'keydown');
    expect(P._state().ctx).toBe('running');
  });
  it('pagehide closes the context and frees decoded buffers', async () => {
    fire(win, 'pointerdown');
    P.playSfx('ui.confirm');
    await tick(5);
    expect(P._state().buffers).toBeGreaterThan(0);
    fire(win, 'pagehide');
    expect(FakeCtx.made[0].state).toBe('closed');
    expect(P._state()).toMatchObject({ ctx: null, buffers: 0, voices: 0 });
    fire(win, 'pointerdown');
    expect(FakeCtx.made.length).toBe(2);
  });
});

describe('timers', () => {
  it('a finished line leaves no timer behind', async () => {
    vi.useFakeTimers();
    const line = P.play({ speaker: 'narrator', text: 'Hei.', spoken: 'Hei.' });
    await vi.advanceTimersByTimeAsync(0);
    FakeAudio.all[0].emit('ended');
    expect(await line.finished).toBe('ended');
    expect(vi.getTimerCount()).toBe(0);
  });
  it('a missing ended event never holds the lesson: the watchdog closes the line', async () => {
    vi.useFakeTimers();
    const line = P.play({ speaker: 'narrator', text: 'Hei.', spoken: 'Hei.' });
    await vi.advanceTimersByTimeAsync(400 + 5000);
    expect(await line.finished).toBe('failed');
    expect(P._state().current).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('a cancelled line clears its watchdog', async () => {
    vi.useFakeTimers();
    P.play({ speaker: 'narrator', text: 'Hei.', spoken: 'Hei.' });
    P.stopSpeech();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('adult settings through say()/sfx()', () => {
  const S = () => import('../src/ui/speech');
  it('calm characters stills character sounds but keeps feedback tones', async () => {
    const { sfx, isCharacterSfx } = await S();
    expect(['aava.joy', 'aava.wing', 'loikka.croak', 'loikka.push'].every(isCharacterSfx)).toBe(true);
    expect(['ui.confirm', 'ui.retry', 'water.splash', 'land.dry'].some(isCharacterSfx)).toBe(false);
    fire(win, 'pointerdown');
    store['sammakko.calmCharacters'] = '1';
    sfx('aava.joy'); await tick(5);
    expect(FakeCtx.made[0].started).toBe(0);
    sfx('ui.confirm'); await tick(5);
    expect(FakeCtx.made[0].started).toBe(1);
  });
  it('quiet mode silences speech and effects alike; a forced listen still plays', async () => {
    const { sfx, say } = await S();
    const { store: st } = await import('../src/engine/store');
    st.update((x) => { x.quietUntil = Date.now() + 3600e3; });
    expect(st.quiet()).toBe(true);
    fire(win, 'pointerdown');
    sfx('ui.confirm'); await tick(5);
    expect(FakeCtx.made[0].started).toBe(0);
    expect(await say('Hei.').finished).toBe('unavailable');
    expect(await say('Hei.', true).started).toBe(true);
  });
});
