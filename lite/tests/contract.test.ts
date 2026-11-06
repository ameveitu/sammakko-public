// Counting contract, procedure-neutral evidence, save recovery, tester isolation and revisions.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { check, solution, wrongs } from '../src/engine/check';
import { nodeState, type Attempt } from '../src/engine/evidence';
import { rng } from '../src/engine/rng';
import { BACKUP_KEY, SAVE_KEY, store } from '../src/engine/store';
import type { Task } from '../src/engine/types';
import { CONTENT_REV, NODES, revOf } from '../src/content';

const objs = (n: number) => Array.from({ length: n }, (_, i) => ({ x: i * 10, y: 0, thing: 'kivi' }));
const total = (n: number): Extract<Task, { kind: 'tapcount' }> => ({ kind: 'tapcount', objects: objs(n), w: 100, h: 100, ask: true, mode: 'total' });
const marking = (n: number): Extract<Task, { kind: 'tapcount' }> => ({ ...total(n), mode: 'marking' });

describe('direct total counting (UF1)', () => {
  const t = total(6);
  it('accepts the right total with no, partial or repeated marks', () => {
    for (const taps of [[], [0, 1], [0, 0, 1, 2, 2, 5], [0, 1, 2, 3, 4, 5]]) expect(check(t, { kind: 'tapcount', taps, count: 6 }).ok).toBe(true);
  });
  it('rejects a wrong total even when every object is marked once', () => {
    const v = check(t, { kind: 'tapcount', taps: [0, 1, 2, 3, 4, 5], count: 7 });
    expect(v.ok).toBe(false);
    expect(v.math).toBe(false);
  });
  it('M-NUM-01 independent seed 2 (circle, 6 objects) accepts 6 without clicks', () => {
    const it = NODES['M-NUM-01']!.item(rng(2), 'independent');
    expect(it.task.kind).toBe('tapcount');
    const task = it.task as Extract<Task, { kind: 'tapcount' }>;
    expect(task.mode ?? 'total').toBe('total');
    const n = task.objects.length;
    expect(check(task, { kind: 'tapcount', taps: [], count: n }).ok).toBe(true);
    expect(check(task, { kind: 'tapcount', taps: task.objects.map((_, i) => i), count: n + 1 }).ok).toBe(false);
  });
  it('wrongs() are all wrong totals', () => {
    for (const w of wrongs(t)) { const v = check(t, w); expect(v.ok).toBe(false); expect(v.math).toBe(false); }
  });
});

describe('explicit marking practice (UF2)', () => {
  const t = marking(5);
  it('right total, incomplete marks: math right, procedure not done, wording about taps only', () => {
    for (const taps of [[0, 1, 2], [0, 0, 1, 2, 3, 4]]) {
      const v = check(t, { kind: 'tapcount', taps, count: 5 });
      expect(v).toMatchObject({ ok: false, math: true, proc: false });
      expect(v.why).toMatch(/Lukumäärä 5 on oikein/);
      expect(v.why).toMatch(/merkitsemättä|napautit yhtä esinettä kahdesti/i);
      expect(v.why).not.toMatch(/laskit|laskettiin|laskematta/i);
    }
  });
  it('complete marks and the right total pass; wrong total fails', () => {
    expect(check(t, solution(t)).ok).toBe(true);
    expect(check(t, { kind: 'tapcount', taps: [0, 1, 2, 3, 4], count: 4 })).toMatchObject({ ok: false, math: false });
  });
  it('the marking lessons say that marking is required', () => {
    for (const s of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const it = NODES['M-NUM-1TO1']!.item(rng(s), 'independent');
      if (it.task.kind !== 'tapcount') continue;
      expect(it.task.mode).toBe('marking');
      expect(it.say).toMatch(/Merkitse jokainen/);
    }
  });
});

describe('procedure omission is neutral evidence', () => {
  const A = (ok: boolean, tag: string, at: number, extra: Partial<Attempt> = {}): Attempt => ({ node: 'X', phase: 'independent', ok, tag, at, ...extra });
  it('does not reset the streak or count as recent difficulty', () => {
    const st = nodeState([A(true, 'a', 1), A(true, 'b', 2), A(false, 'a', 3, { math: true, proc: false }), A(false, 'a', 4, { math: true, proc: false }), A(true, 'a', 5)]);
    expect(st.streak).toBe(3);
    expect(st.difficulty).toBe(false);
  });
  it('an exact replay neither extends nor resets', () => {
    const st = nodeState([A(true, 'a', 1), A(true, 'b', 2), A(true, 'a', 3, { replay: true }), A(false, 'a', 4, { replay: true })]);
    expect(st.streak).toBe(2);
  });
});

// ---------------------------------------------------------------- storage
class FakeStorage {
  data = new Map<string, string>();
  failWrites = false;
  getItem(k: string) { return this.data.has(k) ? this.data.get(k)! : null; }
  setItem(k: string, v: string) { if (this.failWrites) throw new Error('quota'); this.data.set(k, v); }
  removeItem(k: string) { if (this.failWrites) throw new Error('quota'); this.data.delete(k); }
}
const g = globalThis as { localStorage?: unknown };
const att = (node: string, at: number, extra: Partial<Attempt> = {}): Attempt => ({ node, phase: 'quick', ok: true, tag: 'a', at, ...extra });

describe('save recovery', () => {
  let fs: FakeStorage;
  beforeEach(() => { fs = new FakeStorage(); g.localStorage = fs; });
  afterEach(() => { delete g.localStorage; store.reload(); });

  it('E1: a readable save is used even when writes fail, with a warning', () => {
    fs.data.set(SAVE_KEY, JSON.stringify({ v: 2, world: 'ranta', attempts: [att('M-NUM-02', 1), att('M-NUM-02', 2), att('M-ADD-01', 3), att('M-ADD-01', 4)], events: [] }));
    fs.failWrites = true;
    store.reload();
    expect(store.get().attempts.length).toBe(4);
    expect(store.storage()).toBe('memory');
    expect(store.note()).toBe('readonly');
    expect(store.checked('M-NUM-02')).toBe(true);
    // Continuing in memory never destroys the stored copy.
    store.record({ node: 'M-NUM-02', phase: 'practice', ok: true, tag: 'a' });
    expect(JSON.parse(fs.data.get(SAVE_KEY)!).attempts.length).toBe(4);
  });

  it('E3: wrong shapes do not crash; the raw text is kept aside', () => {
    const raw = JSON.stringify({ v: 2, world: 'ranta', attempts: {}, events: [] });
    fs.data.set(SAVE_KEY, raw);
    expect(() => store.reload()).not.toThrow();
    expect(store.note()).toBe('repaired');
    expect(fs.data.get(BACKUP_KEY)).toBe(raw);
    expect(store.get().attempts).toEqual([]);
    expect(store.checked('M-NUM-02')).toBe(false);
  });

  it('E3: malformed JSON is kept aside and the game starts', () => {
    fs.data.set(SAVE_KEY, '{"v":2,"attempts":[');
    expect(() => store.reload()).not.toThrow();
    expect(store.note()).toBe('unreadable');
    expect(fs.data.get(BACKUP_KEY)).toBe('{"v":2,"attempts":[');
  });

  it('keeps well-formed attempts and drops malformed ones', () => {
    fs.data.set(SAVE_KEY, JSON.stringify({ v: 2, world: 'nowhere', attempts: [att('M-NUM-02', 1), { node: 5 }, att('M-NUM-02', 2)], events: 'x' }));
    store.reload();
    expect(store.get().attempts.length).toBe(2);
    expect(store.get().world).toBe(null);
    expect(store.note()).toBe('repaired');
  });
});

describe('tester mode (E4)', () => {
  beforeEach(() => store.reset());
  it('tester answers progress the tester state and leave the learner untouched', () => {
    store.load({ world: 'ranta', attempts: [att('M-NUM-02', 1, { phase: 'guided' })] });
    store.update((s) => { s.tester = true; });
    for (const tag of ['a', 'b', 'a']) store.record({ node: 'M-NUM-02', phase: 'independent', ok: true, tag });
    store.record({ node: 'M-NUM-02', phase: 'transfer', ok: true, tag: 'transfer' });
    expect(store.checked('M-NUM-02')).toBe(true);
    store.update((s) => { s.tester = false; });
    expect(store.checked('M-NUM-02')).toBe(false);
    expect(store.attemptsOf('M-NUM-02').length).toBe(1);
    store.update((s) => { s.tester = true; });
    store.resetTester();
    expect(store.checked('M-NUM-02')).toBe(false);
    expect(store.get().attempts.length).toBe(1);
  });
});

describe('revisions (E5) and legacy contract (E2)', () => {
  beforeEach(() => store.reset());
  it('a lesson revision overrides the global one', () => {
    expect(revOf('M-NUM-01')).toBe(NODES['M-NUM-01']!.rev);
    expect(revOf('M-NUM-01')).not.toBe(CONTENT_REV);
    expect(revOf('M-ADD-01')).toBe(NODES['M-ADD-01']!.rev ?? CONTENT_REV);
  });
  it('old tap-only counting stays as prior progress, not a current check', () => {
    const old: Attempt[] = [
      { node: 'M-NUM-01', phase: 'independent', ok: true, tag: 'line', at: 1, legacy: true, rev: 'v1' },
      { node: 'M-NUM-01', phase: 'independent', ok: true, tag: 'line', at: 2, legacy: true, rev: 'v1' },
      { node: 'M-NUM-01', phase: 'independent', ok: true, tag: 'circle', at: 3, legacy: true, rev: 'v1' },
      { node: 'M-NUM-01', phase: 'transfer', ok: true, tag: 'transfer', at: 4, legacy: true, rev: 'v1' },
    ];
    store.load({ world: 'ranta', attempts: old });
    expect(store.checked('M-NUM-01')).toBe(false);
    expect(store.prior('M-NUM-01')).toBe(true);
    expect(store.known('M-NUM-01')).toBe(true);
    expect(store.historyOf('M-NUM-01').length).toBe(4);
  });
});
