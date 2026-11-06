// @ts-nocheck: node-only test (the project has no @types/node)
// Regressions for GitHub review 1 (main 1d6799d):
//   G01 two open tabs must not overwrite each other's answers, notes, tester split or game items;
//   G02 optional typed fields are validated, bad rows are quarantined (never coerced), the rest stays;
//   G03 a failed canonical-title load is a load failure with retry, never "unknown id".
// Each "tab" is its own copy of the store module (vi.resetModules) over one shared localStorage,
// which is what two documents of the same origin see.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class FakeStorage {
  data = new Map<string, string>();
  afterNextSaveRead?: () => void;
  getItem(k: string) {
    const captured = this.data.has(k) ? this.data.get(k)! : null;
    if (k === 'sammakko-lite-2' && this.afterNextSaveRead) {
      const otherTab = this.afterNextSaveRead;
      this.afterNextSaveRead = undefined;
      otherTab();
    }
    return captured;
  }
  setItem(k: string, v: string) { this.data.set(k, v); }
  removeItem(k: string) { this.data.delete(k); }
}
const g = globalThis as { localStorage?: unknown };
let fs: FakeStorage;
let clock = 1_800_000_000_000;
const tick = () => vi.setSystemTime(++clock);

async function tab() {
  vi.resetModules();
  const s = await import('../src/engine/store');
  const game = await import('../src/game/index');
  return { store: s.store, SAVE_KEY: s.SAVE_KEY, BACKUP_KEY: s.BACKUP_KEY, game };
}
const stored = () => JSON.parse(fs.data.get('sammakko-lite-2')!);
const ans = (node: string, ok = true) => ({ node, phase: 'independent' as const, tag: 'a', ok });

beforeEach(() => {
  fs = new FakeStorage(); g.localStorage = fs;
  vi.useFakeTimers({ toFake: ['Date'] }); tick();
});
afterEach(() => { vi.useRealTimers(); delete g.localStorage; vi.resetModules(); });

describe('G01 two tabs share one save', () => {
  it('A answers, stale B switches world, reload: the answer and the new world are both kept', async () => {
    const A = await tab(), B = await tab();
    A.store.update((s) => { s.world = 'ranta'; }); tick();
    A.store.record(ans('M-NUM-02')); tick();
    A.store.log({ type: 'note', text: 'hyvä päivä' }); tick();
    // B never re-read since it opened; its own change applies to what is stored now.
    B.store.update((s) => { s.world = 'saari'; }); tick();
    const R = await tab();
    expect(R.store.get().world).toBe('saari');
    expect(R.store.get().attempts.map((a) => a.node)).toEqual(['M-NUM-02']);
    expect(R.store.get().events.map((e) => e.text)).toEqual(['hyvä päivä']);
  });

  it('near-simultaneous answers: an overwritten answer is written back by its own tab', async () => {
    const A = await tab(), B = await tab();
    const before = fs.data.get('sammakko-lite-2') ?? null;
    A.store.record(ans('M-NUM-02')); tick();
    // B read before A wrote and writes after it (the classic lost update).
    if (before === null) fs.data.delete('sammakko-lite-2'); else fs.data.set('sammakko-lite-2', before);
    B.store.record(ans('M-ADD-01')); tick();
    expect(stored().attempts.map((a) => a.node)).toEqual(['M-ADD-01']);
    // A's next look at the save (storage event, redraw or its next answer) restores its own row.
    A.store.get();
    expect(stored().attempts.map((a) => a.node).sort()).toEqual(['M-ADD-01', 'M-NUM-02']);
    // Restored once, not twice, and B keeps it.
    B.store.record(ans('M-ADD-01')); tick(); A.store.get(); B.store.get();
    expect(stored().attempts.filter((a) => a.node === 'M-NUM-02')).toHaveLength(1);
    expect(stored().attempts).toHaveLength(3);
    expect(stored().attempts.map((a) => a.at)).toEqual([...stored().attempts.map((a) => a.at)].sort((x, y) => x - y));
  });

  it('"reset all" in one tab is not undone by the other tab', async () => {
    const A = await tab(), B = await tab();
    A.store.record(ans('M-NUM-02')); tick();
    B.store.reset(); tick();
    A.store.get(); A.store.record(ans('M-ADD-01')); tick();
    expect(stored().attempts.map((a) => a.node)).toEqual(['M-ADD-01']);
  });

  it('first notes from fresh tabs opened at different times survive overlapping writes', async () => {
    const A = await tab(); tick();
    const B = await tab(); tick();
    expect(A.store.get().created).not.toBe(B.store.get().created);
    // A captures empty storage; B reads empty and writes; A resumes and writes its own note.
    // This is the first-save interleaving on two direct #aikuiselle visits; no storage rewind.
    fs.afterNextSaveRead = () => { B.store.log({ type: 'note', text: 'B:n muistiinpano' }); tick(); };
    A.store.log({ type: 'note', text: 'A:n muistiinpano' }); tick();
    expect(stored().events.map((e) => e.text)).toEqual(['A:n muistiinpano']);
    B.store.get(); A.store.get();
    const R = await tab();
    expect(R.store.get().events.map((e) => e.text).sort()).toEqual(['A:n muistiinpano', 'B:n muistiinpano']);
    expect(stored().events).toHaveLength(2);
  });

  it('reset all in the same millisecond never restores the preceding answers or notes', async () => {
    const A = await tab(), B = await tab();
    A.store.record(ans('M-NUM-02'));
    A.store.log({ type: 'note', text: 'ennen nollausta' });
    B.store.reset(); // Deliberately no tick: creation and reset timestamps can be equal.
    A.store.get();
    A.store.record(ans('M-ADD-01'));
    expect(stored().attempts.map((a) => a.node)).toEqual(['M-ADD-01']);
    expect(stored().events).toHaveLength(0);
  });

  it('a legacy v2 reset boundary is retained when another tab has older owned rows', async () => {
    fs.data.set('sammakko-lite-2', JSON.stringify({ v: 2, created: 100, world: null, attempts: [], events: [] }));
    const A = await tab();
    A.store.log({ type: 'note', text: 'vanha muistiinpano' });
    // A pre-generation version resets the same save using its created timestamp.
    fs.data.set('sammakko-lite-2', JSON.stringify({ v: 2, created: 200, world: null, attempts: [], events: [] }));
    A.store.get();
    expect(A.store.get().events).toHaveLength(0);
    A.store.log({ type: 'note', text: 'nollauksen jälkeen' });
    expect(stored().events.map((e) => e.text)).toEqual(['nollauksen jälkeen']);
  });

  it('reload starts a new page lifetime and never replays an earlier memory-only answer', async () => {
    fs.data.set('sammakko-lite-2', JSON.stringify({ v: 2, world: 'ranta', attempts: [], events: [] }));
    const T = await tab();
    T.store.setStorageMode('memory');
    T.store.record(ans('M-NUM-02'));
    expect(T.store.get().attempts).toHaveLength(1);
    expect(stored().attempts).toHaveLength(0);
    const raw = JSON.stringify({ v: 2, world: 'ranta', attempts: {}, events: [] });
    fs.data.set('sammakko-lite-2', raw);
    T.store.reload();
    expect(T.store.get().attempts).toHaveLength(0);
    expect(T.store.note()).toBe('repaired');
    expect(fs.data.get(T.BACKUP_KEY)).toBe(raw);
    // The helper must agree with opening an actually fresh module over the same stored text.
    const R = await tab();
    expect(R.store.get().attempts).toHaveLength(0);
  });

  it('"reset tester" keeps the learner rows and does not bring tester rows back', async () => {
    const A = await tab(), B = await tab();
    A.store.record(ans('M-NUM-02')); tick();               // learner
    A.store.update((s) => { s.tester = true; }); tick();
    A.store.record(ans('M-ADD-01')); tick();               // tester (syn)
    B.store.resetTester(); tick();
    A.store.get(); A.store.record(ans('M-ADD-02')); tick();
    const rows = stored().attempts;
    expect(rows.filter((a) => !a.syn).map((a) => a.node)).toEqual(['M-NUM-02']);
    expect(rows.filter((a) => a.syn).map((a) => a.node)).toEqual(['M-ADD-02']);
  });

  it('a same-millisecond tester reset drops old rows but heals answers recorded after the reset', async () => {
    const A = await tab(), B = await tab();
    A.store.record(ans('M-NUM-02'));
    A.store.update((s) => { s.tester = true; });
    A.store.record(ans('M-ADD-01'));
    B.store.resetTester();
    // B captures the reset state; A records a new tester answer; B's note overwrites that answer.
    // The clock remains frozen throughout: timestamp <= reset time cannot distinguish these rows.
    fs.afterNextSaveRead = () => A.store.record(ans('M-ADD-02'));
    B.store.log({ type: 'note', text: 'nollauksen jälkeen' });
    A.store.get(); B.store.get();
    const rows = stored().attempts;
    expect(rows.filter((a) => !a.syn).map((a) => a.node)).toEqual(['M-NUM-02']);
    expect(rows.filter((a) => a.syn).map((a) => a.node)).toEqual(['M-ADD-02']);
    expect(stored().events.map((e) => e.text)).toEqual(['nollauksen jälkeen']);
  });

  it('game items found in two tabs are both kept, and missions are not lost or doubled', async () => {
    const A = await tab(), B = await tab();
    A.game.ensureGame(); tick();
    B.game.ensureGame(); tick();       // B must not replace A's game with a fresh one
    A.game.saveGame((x) => { A.game.find(x, 'simpukka', 1); }); tick();
    B.game.saveGame((x) => { B.game.find(x, 'mittanauha', 2); }); tick();
    const R = await tab();
    expect(Object.keys(R.game.game().inv)).toEqual(expect.arrayContaining(['simpukka', 'mittanauha']));
    const m = R.game.MISSIONS[0];
    A.game.saveGame((x) => { A.game.grant(x, m.id, 'tester', 3); }); tick();
    B.game.saveGame((x) => { B.game.grant(x, m.id, 'tester', 4); }); tick();
    const g2 = (await tab()).game.game();
    expect(g2.missions[m.id].at).toBe(3);
    expect(Object.keys(g2.inv)).toEqual(expect.arrayContaining(['simpukka', 'mittanauha', `part:${m.part}`]));
  });
});

describe('G02 optional typed fields', () => {
  const good = (k: number, extra = {}) => ({ node: 'M-NUM-02', phase: 'independent', tag: 'a', ok: true, at: 1000 + k, ...extra });
  const BAD = {
    'help:{}': { help: {} },
    'help:1': { help: 1 },
    'help:[1]': { help: [1] },
    'help:"reveal"': { help: 'reveal' },
    'syn:"yes"': { syn: 'yes' },
    'replay:1': { replay: 1 },
    'math:"x"': { math: 'x' },
    'proc:null': { proc: null },
    'seed:"3"': { seed: '3' },
    'at:null': { at: null },
    'at:"5"': { at: '5' },
    'mode:7': { mode: 7 },
  };
  for (const [label, extra] of Object.entries(BAD)) {
    it(`${label} is quarantined, the rest of the history stays`, async () => {
      const raw = JSON.stringify({ v: 2, world: 'ranta', attempts: [good(1), good(2, extra), good(3, { help: ['reveal'] })], events: [{ type: 'note', at: 5, text: 'muistiinpano' }] });
      fs.data.set('sammakko-lite-2', raw);
      const T = await tab();
      const s = T.store.get();
      expect(s.attempts).toHaveLength(2);
      expect(s.attempts.map((a) => a.at)).toEqual([1001, 1003]);
      expect(s.events.map((e) => e.text)).toEqual(['muistiinpano']);
      expect(T.store.note()).toBe('repaired');
      expect(T.store.dropped()).toBe(1);
      expect(T.store.backedUp()).toBe(true);
      expect(fs.data.get(T.BACKUP_KEY)).toBe(raw);
      // A bad help is never read as "no help": it cannot become independent evidence.
      expect(s.attempts.some((a) => a.at === 1002)).toBe(false);
    });
  }
  it('bad event fields are quarantined too', async () => {
    fs.data.set('sammakko-lite-2', JSON.stringify({ v: 2, attempts: [good(1)], events: [{ type: 'note', at: 5, text: 3 }, { type: 'note', at: 6, text: 'ok' }, { type: 'defer', at: 7, node: 'M-NUM-02', seed: 'x' }] }));
    const T = await tab();
    expect(T.store.get().events.map((e) => e.at)).toEqual([6]);
    expect(T.store.dropped()).toBe(2);
  });
  it('an intact save is not marked repaired and keeps every row', async () => {
    fs.data.set('sammakko-lite-2', JSON.stringify({ v: 2, world: null, attempts: [good(1, { help: ['hint'], syn: false, replay: false, seed: 4, mode: 'tap' }), good(2)], events: [] }));
    const T = await tab();
    expect(T.store.get().attempts).toHaveLength(2);
    expect(T.store.note()).toBe(null);
    expect(T.store.dropped()).toBe(0);
    expect(fs.data.has(T.BACKUP_KEY)).toBe(false);
  });
  it('a bad row written by another tab is quarantined on refresh, with a backup', async () => {
    const T = await tab();
    T.store.record(ans('M-NUM-02')); tick();
    const s = stored(); s.attempts.push(good(9, { help: {} }));
    const raw = JSON.stringify(s); fs.data.set('sammakko-lite-2', raw);
    expect(T.store.get().attempts).toHaveLength(1);
    expect(T.store.note()).toBe('repaired');
    expect(fs.data.get(T.BACKUP_KEY)).toBe(raw);
  });
});

describe('G03 canonical title lookup', () => {
  const ok = (body: unknown) => async () => ({ ok: true, status: 200, json: async () => body });
  it('a failed load is a failure, and a retry fetches again', async () => {
    const c = await import('../src/canonical');
    c._resetCanonical();
    const calls: string[] = [];
    const down = async (u: string) => { calls.push(u); return { ok: false, status: 503, json: async () => ({}) }; };
    expect(await c.canonicalTitle('M-FOO-01', down)).toEqual({ kind: 'failed', reason: 'HTTP 503' });
    const net = async () => { throw new TypeError('Failed to fetch'); };
    expect(await c.canonicalTitle('M-FOO-01', net)).toEqual({ kind: 'failed', reason: 'verkko' });
    expect(await c.canonicalTitle('M-FOO-01', ok({ nope: 1 }))).toEqual({ kind: 'failed', reason: 'muoto' });
    expect(await c.canonicalTitle('M-FOO-01', ok({ titles: { 'M-FOO-01': 'Foo' } }))).toEqual({ kind: 'ok', title: 'Foo' });
    expect(calls).toEqual([c.CANONICAL_URL]);
    // Known now; an id that is missing from a good list is "unknown", not a failure.
    expect(await c.canonicalTitle('M-BAR-01', down)).toEqual({ kind: 'ok', title: undefined });
  });
  it('the shipped list is a plain public file with titles for every canonical id', async () => {
    const { readFileSync } = await import('node:fs');
    const j = JSON.parse(readFileSync(new URL('../public/canonical-ids.json', import.meta.url), 'utf8'));
    expect(Object.keys(j.titles).length).toBe(690);
    const main = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
    expect(main).not.toMatch(/import\(['"].*canonical-ids/);
    expect(main).toMatch(/Aiheluetteloa ei saatu ladattua/);
  });
});

