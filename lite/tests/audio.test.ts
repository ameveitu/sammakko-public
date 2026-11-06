// @ts-nocheck: node-only test (the project has no @types/node)
// Audio layer: lookup keys, event → effect mapping, the speech channel's cancel/queue rules
// and the packed files. Runs in node with a fake <audio> element; no real sound is played.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fnv64, normText, speechKey } from '../src/audio/key';
import { flightSounds } from '../src/audio/events';
import { _state, play, setManifest, stopSpeech, type AudioManifest } from '../src/audio/player';
// The generator's copy of the key functions (plain .mjs).
import * as gen from '../../tools/audiogen/lib/text.mjs';

const root = fileURLToPath(new URL('../..', import.meta.url));

describe('speech key', () => {
  const samples = ['Oikein!', '  Hyvä   työ\n', 'Ääkköset: åäö ÅÄÖ', 'Kolme ja puoli', 'é vs é', ''];
  it('matches the generator byte for byte', () => {
    for (const t of samples) for (const s of ['narrator', 'Aava', 'Loikka']) {
      expect(speechKey(s, t)).toBe(gen.speechKey(s, t));
      expect(normText(t)).toBe(gen.normText(t));
    }
  });
  it('is the FNV-1a 64 reference value', () => {
    expect(fnv64('')).toBe('cbf29ce484222325');
    expect(fnv64('a')).toBe('af63dc4c8601ec8c');
  });
  it('ignores whitespace and Unicode form, not the speaker', () => {
    expect(speechKey('narrator', 'Hyvä  työ ')).toBe(speechKey('narrator', 'Hyvä työ'));
    expect(speechKey('narrator', 'é')).toBe(speechKey('narrator', 'é'));
    expect(speechKey('Aava', 'Hei')).not.toBe(speechKey('Loikka', 'Hei'));
  });
});

describe('flight effects', () => {
  const s = (splashes: number, rings: boolean[], done = false) => ({ splashes, rings, done });
  it('one change gives one sound', () => {
    expect(flightSounds(s(0, [false]), s(0, [false]))).toEqual([]);
    expect(flightSounds(s(0, [false]), s(1, [false]))).toEqual(['water.splash']);
    expect(flightSounds(s(0, [false, false]), s(0, [true, false]))).toEqual(['ui.confirm']);
    expect(flightSounds(s(0, [true]), s(0, [true], true))).toEqual(['land.dry']);
  });
  it('an already passed ring does not ring again', () => {
    expect(flightSounds(s(1, [true]), s(1, [true]))).toEqual([]);
  });
});

// ------------------------------------------------------------ speech channel
class FakeAudio {
  static all: FakeAudio[] = [];
  src: string; preload = ''; paused = false;
  private on: Record<string, (() => void)[]> = {};
  constructor(src: string) { this.src = src; FakeAudio.all.push(this); }
  addEventListener(t: string, f: () => void) { (this.on[t] ??= []).push(f); }
  emit(t: string) { (this.on[t] ?? []).forEach((f) => f()); }
  play() { queueMicrotask(() => this.emit('playing')); return Promise.resolve(); }
  pause() { this.paused = true; }
  removeAttribute() { /* fake */ }
  load() { /* fake */ }
}
const g = globalThis as unknown as { Audio?: unknown };

const LINES = ['Yksi.', 'Kaksi.', 'Kolme.', 'Neljä.', 'Viisi.', 'Kuusi.'];
const manifest: AudioManifest = {
  schema: 'sammakko-audio-manifest/1',
  speech: Object.fromEntries(LINES.map((t, i) => [speechKey('narrator', t), { id: `t${i}`, src: `speech/t${i}.0000000000.mp3`, ms: 500 }])),
  sfx: {},
};
const req = (text: string, after = false) => ({ speaker: 'narrator' as const, text, spoken: text, after });

describe('speech channel', () => {
  afterEach(() => { stopSpeech(); setManifest(null); FakeAudio.all = []; delete g.Audio; });

  it('without a file or a voice the line is unavailable, never pretended', async () => {
    const p = play(req('Ei tiedostoa.'));
    expect(await p.started).toBe(false);
    expect(await p.finished).toBe('unavailable');
  });

  it('falls back when a number is missing one of its recorded words', async () => {
    g.Audio = FakeAudio;
    setManifest(manifest);
    const p = play(req('322'));
    expect(await p.finished).toBe('unavailable');
    expect(FakeAudio.all).toHaveLength(0);
  });

  it('plays an approved file and reports a clean end', async () => {
    g.Audio = FakeAudio; setManifest(manifest);
    const p = play(req('Yksi.'));
    expect(await p.started).toBe(true);
    expect(FakeAudio.all[0]!.src).toContain('audio/speech/t0.0000000000.mp3');
    FakeAudio.all[0]!.emit('ended');
    expect(await p.finished).toBe('ended');
    expect(_state().current).toBe(false);
  });

  it('a new line cancels the old one (no overlap)', async () => {
    g.Audio = FakeAudio; setManifest(manifest);
    const a = play(req('Yksi.'));
    const b = play(req('Kaksi.'));
    expect(await a.finished).toBe('cancelled');
    expect(FakeAudio.all[0]!.paused).toBe(true);
    expect(await b.started).toBe(true);
  });

  it('after-lines wait their turn and the queue stays short', async () => {
    g.Audio = FakeAudio; setManifest(manifest);
    const first = play(req('Yksi.'));
    const rest = LINES.slice(1).map((t) => play(req(t, true)));
    expect(_state().queued).toBe(3);
    // The two oldest queued lines were dropped, not read late.
    expect(await rest[0]!.finished).toBe('cancelled');
    expect(await rest[1]!.finished).toBe('cancelled');
    FakeAudio.all[0]!.emit('ended');
    expect(await first.finished).toBe('ended');
    expect(await rest[2]!.started).toBe(true);
    expect(FakeAudio.all[1]!.src).toContain('t3.');
  });

  it('hush (stopSpeech) ends the line and the whole queue', async () => {
    g.Audio = FakeAudio; setManifest(manifest);
    const a = play(req('Yksi.'));
    const b = play(req('Kaksi.', true));
    stopSpeech();
    expect(await a.finished).toBe('cancelled');
    expect(await b.finished).toBe('cancelled');
    expect(_state()).toMatchObject({ current: false, queued: 0 });
  });

  it('a line without its own file plays from its pieces, back to back', async () => {
    g.Audio = FakeAudio; setManifest(manifest);
    const p = play(req('Yksi.\nKaksi. Kolme.'));
    expect(await p.started).toBe(true);
    expect(FakeAudio.all.map((a) => a.src)).toHaveLength(1);
    FakeAudio.all[0]!.emit('ended');
    await Promise.resolve();
    expect(FakeAudio.all[1]!.src).toContain('t1.');
    FakeAudio.all[1]!.emit('ended');
    FakeAudio.all[2]!.emit('ended');
    expect(await p.finished).toBe('ended');
    expect(FakeAudio.all).toHaveLength(3);
  });

  it('a line with a missing piece is never part file, part voice', async () => {
    g.Audio = FakeAudio; setManifest(manifest);
    const p = play(req('Yksi. Ei tiedostoa.'));
    expect(await p.finished).toBe('unavailable');
    expect(FakeAudio.all).toHaveLength(0);
  });

  it('stopping a pieced line stops the piece that plays and never starts the next', async () => {
    g.Audio = FakeAudio; setManifest(manifest);
    const p = play(req('Yksi. Kaksi.'));
    await p.started;
    stopSpeech();
    expect(await p.finished).toBe('cancelled');
    expect(FakeAudio.all[0]!.paused).toBe(true);
    expect(FakeAudio.all).toHaveLength(1);
  });

  it('a blocked autoplay is reported as blocked', async () => {
    class Blocked extends FakeAudio { play() { return Promise.reject(Object.assign(new Error('no'), { name: 'NotAllowedError' })); } }
    g.Audio = Blocked; setManifest(manifest);
    const p = play(req('Yksi.'));
    expect(await p.started).toBe(false);
    expect(await p.finished).toBe('blocked');
  });
});

// Astra's review, technical queue T-01, T-02, T-04 (docs/audio/YLEISET_VIRHEET_JA_KORJAUKSET_690_FI.md).
class FakeSynth {
  spoken: { text: string; onstart?: () => void; onend?: () => void }[] = [];
  cancels = 0;
  speak(u) { this.spoken.push(u); queueMicrotask(() => u.onstart?.()); }
  cancel() { this.cancels++; }
}
const gs = globalThis as unknown as { speechSynthesis?: unknown; SpeechSynthesisUtterance?: unknown };
const voice = { lang: 'fi-FI', name: 'Testi' } as unknown as SpeechSynthesisVoice;
const withVoice = (text: string) => ({ ...req(text), voice });

describe('speech channel, review fixes', () => {
  let synth: FakeSynth;
  const setup = () => {
    synth = new FakeSynth(); gs.speechSynthesis = synth;
    gs.SpeechSynthesisUtterance = class { text: string; constructor(t: string) { this.text = t; } };
  };
  afterEach(() => { vi.useRealTimers(); stopSpeech(); setManifest(null); FakeAudio.all = []; delete g.Audio; delete gs.speechSynthesis; delete gs.SpeechSynthesisUtterance; });

  it('T-01: a new line that cannot be heard still silences the old one', async () => {
    g.Audio = FakeAudio; setManifest(manifest);
    const old = play(req('Yksi.'));
    await old.started;
    const next = play(req('Ei tiedostoa.'));
    expect(await next.finished).toBe('unavailable');
    expect(await old.finished).toBe('cancelled');
    expect(FakeAudio.all[0]!.paused).toBe(true);
    expect(_state().current).toBe(false);
  });

  it('T-01: an unavailable after-line leaves the current line alone', async () => {
    g.Audio = FakeAudio; setManifest(manifest);
    const cur = play(req('Yksi.'));
    await cur.started;
    expect(await play(req('Ei tiedostoa.', true)).finished).toBe('unavailable');
    expect(FakeAudio.all[0]!.paused).toBe(false);
    expect(_state().current).toBe(true);
  });

  it('T-02: the watchdog stops the media element before the channel moves on', async () => {
    vi.useFakeTimers();
    g.Audio = FakeAudio; setManifest(manifest);
    const p = play(req('Yksi.'));
    await p.started;
    vi.advanceTimersByTime(500 + 5001);
    expect(await p.finished).toBe('failed');
    expect(FakeAudio.all[0]!.paused).toBe(true);
    expect(_state().current).toBe(false);
  });

  it('T-02: the browser-voice watchdog cancels the voice', async () => {
    vi.useFakeTimers(); setup();
    const p = play(withVoice('Ei tiedostoa.'));
    await p.started;
    vi.advanceTimersByTime(4000 + 13 * 120 + 1);
    expect(await p.finished).toBe('failed');
    expect(synth.cancels).toBeGreaterThan(0);
  });

  it('T-04: a file that fails before any sound falls back to the browser voice', async () => {
    class Broken extends FakeAudio { play() { queueMicrotask(() => this.emit('error')); return Promise.resolve(); } }
    g.Audio = Broken; setManifest(manifest); setup();
    const p = play(withVoice('Yksi.'));
    expect(await p.started).toBe(true);
    expect(synth.spoken.map((u) => u.text)).toEqual(['Yksi.']);
    synth.spoken[0]!.onend!();
    expect(await p.finished).toBe('ended');
  });

  it('T-04: a file that breaks mid-line ends the line; the voice never finishes it', async () => {
    g.Audio = FakeAudio; setManifest(manifest); setup();
    const p = play(withVoice('Yksi.'));
    expect(await p.started).toBe(true);
    FakeAudio.all[0]!.emit('error');
    expect(await p.finished).toBe('failed');
    expect(synth.spoken).toHaveLength(0);
  });

  it('T-04: a blocked file is not read by the voice either (autoplay rules apply to both)', async () => {
    class Blocked extends FakeAudio { play() { return Promise.reject(Object.assign(new Error('no'), { name: 'NotAllowedError' })); } }
    g.Audio = Blocked; setManifest(manifest); setup();
    const p = play(withVoice('Yksi.'));
    expect(await p.finished).toBe('blocked');
    expect(synth.spoken).toHaveLength(0);
  });
});

// ------------------------------------------------------------ packed files
describe('packed audio', () => {
  const dir = path.join(root, 'lite', 'public', 'audio');
  const m = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8')) as AudioManifest & { pilot?: boolean };
  const prov = JSON.parse(fs.readFileSync(path.join(root, 'audio', 'provenance', 'sfx.json'), 'utf8')) as { assets: { path: string; sha256: string }[] };

  it('every file is listed, hash-named, present and matches its provenance', () => {
    const srcs = [...Object.values(m.speech).map((a) => a.src), ...Object.values(m.sfx).flat().map((a) => a.src)];
    const byPath = new Map(prov.assets.map((a) => [a.path, a.sha256]));
    for (const src of srcs) {
      const hash = /\.([0-9a-f]{10})\.(mp3|wav)$/.exec(src)?.[1];
      expect(hash, src).toBeTruthy();
      const sha = createHash('sha256').update(fs.readFileSync(path.join(dir, src))).digest('hex');
      expect(sha.startsWith(hash!), src).toBe(true);
      if (src.startsWith('sfx/')) expect(byPath.get(src), src).toBe(sha);
    }
  });
  it('no stray audio files outside the manifest', () => {
    const listed = new Set([...Object.values(m.speech).map((a) => a.src), ...Object.values(m.sfx).flat().map((a) => a.src)]);
    const walk = (rel) => fs.readdirSync(path.join(dir, rel), { withFileTypes: true })
      .flatMap((e) => (e.isDirectory() ? walk(`${rel}/${e.name}`) : [`${rel}/${e.name}`]));
    for (const a of Object.values(m.ambient ?? {})) listed.add(a.src);
    for (const sub of ['sfx', 'speech', 'amb']) {
      if (!fs.existsSync(path.join(dir, sub))) continue;
      for (const f of walk(sub)) expect(listed.has(f), f).toBe(true);
    }
  });
  it('produced speech is small MP3 and never marked approved without a listener', () => {
    // Core library at 80 kbps; the lesson expansion (ids lite.*) at 32 kbps, fetched only when a line plays.
    let core = 0, lesson = 0, lessonMs = 0;
    for (const a of Object.values(m.speech)) {
      expect(a.src).toMatch(/^speech\/fi-FI\/[A-Za-z0-9.-]+\.[0-9a-f]{10}\.mp3$/);
      const b = fs.statSync(path.join(dir, a.src)).size;
      if (a.id.startsWith('lite.')) { lesson += b; lessonMs += a.ms ?? 0; expect(b, a.src).toBeLessThan(4600 * ((a.ms ?? 0) / 1000) + 2048); } else core += b;
      if (a.provisional) expect(m.pilot).toBe(true);
    }
    expect(core).toBeLessThan(8 * 1024 * 1024);
    expect(lesson).toBeLessThan(80 * 1024 * 1024);
    if (lessonMs) expect(lesson / (lessonMs / 1000)).toBeLessThan(4300); // about 32 kbps on average
  });
  it('every packed speech file was decoded at pack time and carries the master\'s sound', () => {
    // A silent MP3 hashes and sizes like a good one; only decoding shows it. tools/audiogen pack
    // decodes each file and stores the measured level next to the master's.
    const provDir = path.join(root, 'audio', 'provenance', 'speech');
    const byId = new Map(fs.readdirSync(provDir).map((f) => JSON.parse(fs.readFileSync(path.join(provDir, f), 'utf8')) as {
      id: string; master: { rmsDb: number; ms: number }; asset?: { decoded?: { rmsDb: number; ms: number } } }).map((p) => [p.id, p]));
    for (const a of Object.values(m.speech)) {
      const p = byId.get(a.id), d = p?.asset?.decoded;
      expect(d, a.src).toBeTruthy();
      expect(d!.rmsDb, a.src).toBeGreaterThan(-45);
      expect(Math.abs(d!.rmsDb - p!.master.rmsDb), a.src).toBeLessThanOrEqual(3);
      expect(Math.abs(d!.ms - p!.master.ms), a.src).toBeLessThanOrEqual(300);
    }
  });
  it('the shipped bundle stays small (no masters in the repo build)', () => {
    let bytes = 0;
    for (const a of Object.values(m.sfx).flat()) bytes += fs.statSync(path.join(dir, a.src)).size;
    expect(bytes).toBeLessThan(1.5 * 1024 * 1024);
  });
  it('soundscape loops are approved world-kit loops, byte for byte, with the timing their seams were checked at', () => {
    // Fetched only after the adult or the child turns the soundscape on (audio/ambient.ts).
    const world = JSON.parse(fs.readFileSync(path.join(root, 'audio', 'provenance', 'world.json'), 'utf8')) as {
      assets: { family: string; sha256: string; status: string; ms: number; loop?: { period: number; xfade: number }; packed?: { seam?: { packed?: { ok: boolean } } } }[] };
    const amb = Object.entries(m.ambient ?? {});
    let bytes = 0;
    for (const [family, a] of amb) {
      expect(a.src).toMatch(/^amb\/amb\.[a-z]+-\d+\.[0-9a-f]{10}\.mp3$/);
      const buf = fs.readFileSync(path.join(dir, a.src)), sha = createHash('sha256').update(buf).digest('hex');
      expect(a.src.includes(`.${sha.slice(0, 10)}.`), a.src).toBe(true);
      const p = world.assets.find((x) => x.sha256 === sha);
      expect(p, a.src).toBeTruthy();
      expect(p).toMatchObject({ family, status: 'approved', ms: a.ms, loop: a.loop });
      expect(p!.packed?.seam?.packed?.ok, a.src).toBe(true);
      // A copy every period, crossfaded over xfade: the file must cover both.
      expect(a.ms!).toBeGreaterThanOrEqual((a.loop.period + a.loop.xfade) * 1000 - 50);
      expect(buf.length, a.src).toBeLessThan(160 * 1024);
      bytes += buf.length;
    }
    expect(bytes).toBeLessThan(320 * 1024);
  });
});
