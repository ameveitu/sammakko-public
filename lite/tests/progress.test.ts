import { beforeEach, describe, expect, it } from 'vitest';
import { allOf, allOfDescendants, ancestors, isUnlocked, ORDER, requiredOf } from '../src/engine/graph';
import { exportData, migrate, store, type Save } from '../src/engine/store';
import type { Attempt } from '../src/engine/evidence';
import { NODES } from '../src/content';
import { CHAPTERS, chaptersFor, nextNode, openIn, PRIZES, supportFor, WORLDS } from '../src/content/world';

const H = 3600e3;
const quick = (node: string, at: number): Attempt[] => [
  { node, phase: 'quick', ok: true, tag: 'a', at },
  { node, phase: 'quick', ok: true, tag: 'b', at: at + 1 },
];
const guided = (node: string, at: number): Attempt[] => [
  { node, phase: 'guided', ok: true, tag: 'a', at, help: ['demo'] },
  { node, phase: 'guided', ok: true, tag: 'b', at: at + 1, help: ['demo'] },
];
// Answers given to the lesson as it is now (revised lessons count only their current revision).
const load = (s: Partial<Save>) => store.load({ world: 'ranta', ...s, attempts: s.attempts?.map((a) => ({ rev: NODES[a.node]?.rev, ...a })) });
// A node deep in the graph with several layers of all_of prerequisites.
const deep = ORDER.find((id) => ancestors(id).length >= 4 && allOf(id).length >= 2 && requiredOf(id).length === allOf(id).length)!;

describe('inference', () => {
  beforeEach(() => store.reset());

  it('a checked node makes its all_of ancestors inferred, never checked or lit', () => {
    load({ attempts: quick(deep, Date.now()) });
    expect(store.checked(deep)).toBe(true);
    const inferred = ORDER.filter((x) => allOfDescendants(x).includes(deep));
    expect(inferred.length).toBeGreaterThanOrEqual(4);
    for (const a of inferred) {
      expect(store.checked(a)).toBe(false);
      expect(store.lit(a)).toBe(false);
      expect(store.inferredFrom(a)).toEqual([deep]);
      expect(store.known(a)).toBe(true);
    }
  });

  it('any_of prerequisites are not inferred', () => {
    const any = ORDER.find((id) => requiredOf(id).length > allOf(id).length)!;
    load({ attempts: quick(any, Date.now()) });
    for (const p of requiredOf(any).filter((p) => !allOf(any).includes(p) && !allOfDescendants(p).includes(any))) expect(store.inferred(p)).toBe(false);
  });

  it('inferred prerequisites unlock the next places', () => {
    load({ attempts: quick(deep, Date.now()) });
    const next = ORDER.filter((id) => requiredOf(id).includes(deep) && requiredOf(id).every((p) => p === deep || ancestors(deep).includes(p)));
    for (const d of next) expect(isUnlocked(d, store.known)).toBe(true);
  });
});

describe('progress semantics', () => {
  beforeEach(() => store.reset());

  it('opening, deferring or skipping never counts', () => {
    const id = ORDER[0]!;
    load({ events: [{ type: 'defer', node: id, at: Date.now() }] });
    expect(store.deferred(id)).toBe(true);
    expect(store.known(id)).toBe(false);
    expect(store.lit(id)).toBe(false);
  });

  it('deferred topics go to the end of the queue, but are never lost', () => {
    const first = nextNode('ranta')!.node;
    load({ events: [{ type: 'defer', node: first, at: Date.now() }] });
    expect(nextNode('ranta')!.node).not.toBe(first);
    // A new attempt after deferring clears it.
    load({ events: [{ type: 'defer', node: first, at: 1 }], attempts: [{ node: first, phase: 'guided', ok: false, tag: 'a', at: 2 }] });
    expect(store.deferred(first)).toBe(false);
  });

  it('guided completion lights the place and earns progress, with the help recorded', () => {
    const id = ORDER[0]!;
    load({ attempts: guided(id, Date.now()) });
    expect(store.lit(id)).toBe(true);
    expect(store.helped(id)).toBe(true);
    expect(store.checked(id)).toBe(false);
    expect(store.attemptsOf(id).every((a) => a.help?.includes('demo'))).toBe(true);
  });

  it('tester answers stay apart from the learner', () => {
    const id = ORDER[0]!;
    load({ attempts: quick(id, Date.now()).map((a) => ({ ...a, syn: true })) });
    expect(store.checked(id)).toBe(false);
    expect(store.attemptsOf(id)).toHaveLength(0);
    store.update((s) => { s.tester = true; });
    store.record({ node: id, phase: 'independent', ok: true, tag: 'a' });
    expect(store.get().attempts.at(-1)!.syn).toBe(true);
  });

  it('records what is needed to reproduce an item', () => {
    const id = ORDER[0]!;
    store.record({ node: id, phase: 'independent', ok: false, tag: 'a', seed: 42, resp: '"3"', help: ['hint'], mode: 'learn' });
    const at = store.get().attempts.at(-1)!;
    expect(at).toMatchObject({ node: id, seed: 42, resp: '"3"', help: ['hint'], mode: 'learn', phase: 'independent' });
    expect(at.rev).toBeTruthy();
    expect(at.sess).toBeTruthy();
    expect(at.at).toBeGreaterThan(0);
  });

  it('due recalls come first in the queue', () => {
    const id = chaptersFor('ranta')[0]!.nodes[0]!;
    load({ attempts: quick(id, Date.now() - 30 * H) });
    expect(nextNode('ranta')).toEqual({ node: id, retrieval: true });
  });
});

describe('support detours', () => {
  beforeEach(() => store.reset());
  it('without a declared family, offer the nearest required parents (never a distant root)', () => {
    const s = supportFor(deep);
    expect(s.length).toBeGreaterThan(0);
    for (const x of s) expect(requiredOf(deep)).toContain(x);
  });
  it('S1: a fresh learner stuck in mixed speed units is offered decimal/unit help', () => {
    const s = supportFor('PHY79-SPEED-MIXED', 'kmh');
    expect(s.length).toBeGreaterThan(0);
    expect(s).not.toContain('M-NUM-STABLE-ORDER');
    expect(s.every((x) => /DEC|UNIT|SPEED/.test(x))).toBe(true);
  });
  it('S2: hours-to-minutes conversion help is time conversion or decimal multiplication', () => {
    expect(supportFor('PHY79-UNIT-CONV', 'hMin')).toEqual(['M-UNIT-05', 'M-DEC-08']);
  });
  it('S3: a signed equation gets signed-arithmetic help', () => {
    const s = supportFor('M79-EQ1-SOLVE', 'two');
    expect(s.every((x) => /M79-INT/.test(x))).toBe(true);
  });
  it('help is directly reachable even when its own prerequisites are open (no lock walk)', () => {
    const s = supportFor('PHY79-UNIT-CONV', 'hMin');
    expect(s.some((x) => !isUnlocked(x, store.known))).toBe(true);
  });
  it('lessons already lit go after fresh ones', () => {
    load({ attempts: quick('M-UNIT-05', Date.now()) });
    expect(supportFor('PHY79-UNIT-CONV', 'hMin')[0]).toBe('M-DEC-08');
  });
  it('a root has no parents to offer', () => {
    expect(supportFor(ORDER.find((id) => requiredOf(id).length === 0)!)).toEqual([]);
  });
});

describe('world', () => {
  beforeEach(() => store.reset());
  it('places every node exactly once and no prerequisite in a later world', () => {
    const on = CHAPTERS.flatMap((c) => c.nodes);
    expect([...on].sort()).toEqual([...ORDER].sort());
    const rank = { ranta: 0, saari: 1, lab: 2 } as const;
    const worldOf = new Map(CHAPTERS.flatMap((c) => c.nodes.map((n) => [n, rank[c.world]] as const)));
    for (const id of ORDER) for (const p of requiredOf(id)) expect(worldOf.get(p)!, `${p} -> ${id}`).toBeLessThanOrEqual(worldOf.get(id)!);
  });
  it('every world starts with a challenge one press away', () => {
    for (const W of WORLDS) {
      const n = nextNode(W.id);
      expect(n, W.id).not.toBeNull();
      expect(openIn(W.id, n!.node)).toBe(true);
      expect(chaptersFor(W.id).slice(0, 2).some((c) => c.nodes.includes(n!.node)), `${W.id}: first challenge in an early chapter`).toBe(true);
    }
  });
  it('no road is all locked: every chapter can be reached by practising open places', () => {
    for (const W of WORLDS) {
      const known = new Set<string>();
      const ids = chaptersFor(W.id).flatMap((c) => c.nodes);
      let grew = true;
      while (grew) {
        grew = false;
        for (const id of ids) if (!known.has(id) && (isUnlocked(id, (x) => known.has(x) || !ids.includes(x)) || chaptersFor(W.id).find((c) => c.nodes.includes(id))!.quick)) { known.add(id); grew = true; }
      }
      expect(ids.filter((x) => !known.has(x)), W.id).toEqual([]);
    }
  });
  it('every chapter leaves a find in the backpack', () => {
    for (const W of WORLDS) for (const c of chaptersFor(W.id)) expect(PRIZES[c.id], c.id).toBeDefined();
  });
});

describe('saving', () => {
  beforeEach(() => { store.reset(); store.setStorageMode('local'); });
  it('migrates a v1 save conservatively: answers kept and marked, state derived again', () => {
    const id = ORDER[0]!;
    const s = migrate({ world: 'saari', quietUntil: 0, attempts: [{ node: id, phase: 'guided', ok: true, tag: 'a', at: 5 }] });
    expect(s.v).toBe(2);
    expect(s.world).toBe('saari');
    expect(s.attempts[0]).toMatchObject({ node: id, legacy: true, rev: 'v1' });
    expect(s.events.some((e) => e.type === 'migrated')).toBe(true);
    expect(migrate(null).attempts).toEqual([]);
  });
  it('keeps working in memory when storage is not available', () => {
    store.setStorageMode('memory');
    expect(store.storage()).toBe('memory');
    store.record({ node: ORDER[0]!, phase: 'guided', ok: true, tag: 'a' });
    expect(store.get().attempts).toHaveLength(1);
  });
  it('exports versions, attempts and events', () => {
    store.log({ type: 'confusing', node: ORDER[0]!, seed: 7, text: 'independent/a' });
    store.log({ type: 'note', text: 'havainto' });
    const d = exportData({ x: 1 });
    expect(d).toMatchObject({ format: 'sammakko-lite-export', version: 2, x: 1 });
    expect(d.graph).toHaveLength(64);
    expect(d.contentRev).not.toBe('unset');
    expect(d.save.events.map((e) => e.type)).toEqual(['confusing', 'note']);
  });
});

describe('quiet mode', () => {
  beforeEach(() => store.reset());
  it('is on until the chosen time and then ends by itself', () => {
    expect(store.quiet()).toBe(false);
    store.update((s) => { s.quietUntil = Date.now() + 3 * H; });
    expect(store.quiet()).toBe(true);
    store.update((s) => { s.quietUntil = Date.now() - 1; });
    expect(store.quiet()).toBe(false);
  });
});
