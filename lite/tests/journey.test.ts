import { describe, expect, it } from 'vitest';
import { catalogNode } from '../src/engine/catalog';
import { RULES, type Attempt } from '../src/engine/evidence';
import { canRecall, createJourney, JOURNEY_BACKUP_KEY, JOURNEY_KEY } from '../src/engine/journey';
import type { NodeSpec } from '../src/engine/types';

const cake = catalogNode('M-FRAC-13')!;
const prerequisite = catalogNode('M-FRAC-07')!;
const sibling = catalogNode('M-FRAC-16')!;
const oldKey = 'sammakko-lite-2';
const revision = 'tested-current';
const spec: NodeSpec = {
  id: cake.id, stop: 'Pöytä', icon: '', intro: '', reward: '', rev: revision, validRevs: [revision],
  demo: () => [], item: () => ({
    say: '', explain: '', tag: 'build', task: { kind: 'frac', n: 16, d: 15 },
  }),
};
const answer = (at: number, fields: Partial<Attempt> = {}): Attempt => ({
  node: cake.id, phase: 'independent', tag: 'a', at, ok: true, rev: revision, ...fields,
});

function local(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key: string): string | null { return values.get(key) ?? null; },
    setItem(key: string, value: string) { values.set(key, value); },
  };
}

describe('journey store', () => {
  it('tracks local resolutions once, independently of mastery and event order', () => {
    for (const order of [[cake, sibling, prerequisite], [sibling, prerequisite, cake]]) {
      const journey = createJourney(null);
      expect(canRecall(cake.id, prerequisite.id, journey.hasEvent)).toBe(false);
      for (const node of order) expect(journey.resolve(node.id, node === cake)).toBe(true);
      expect(journey.resolve(cake.id, false)).toBe(false);
      expect(journey.resolve('unknown', false)).toBe(false);
      expect(journey.hasEvent(cake.eventId)).toBe(true);
      expect(journey.hasEvent('story.unknown.resolved')).toBe(false);
      expect(new Set(journey.effectIds())).toEqual(new Set(order.map((node) => node.effectId)));
      expect(journey.get().events.find((event) => event.node === cake.id)?.assisted).toBe(true);
      expect(canRecall(cake.id, prerequisite.id, journey.hasEvent)).toBe(true);
      expect(canRecall(cake.id, sibling.id, journey.hasEvent)).toBe(false);
      expect(canRecall(cake.id, cake.id, journey.hasEvent)).toBe(false);
      expect(journey.state(cake.id, spec)).toMatchObject({ helped: false, checked: false, streak: 0 });
    }
  });

  it('preserves v2 and merges writes across already-open instances', () => {
    const old = '{"v":2,"attempts":[{"historical":true}]}';
    const storage = local({ [oldKey]: old });
    const first = createJourney(storage);
    const second = createJourney(storage);

    first.record(answer(1));
    second.record(answer(2, { tag: 'b' }));
    first.resolve(prerequisite.id, true);
    second.resolve(cake.id, false);
    expect(first.resolve(cake.id, true)).toBe(false);
    expect(first.get().attempts.map((a) => a.at)).toEqual([1, 2]);
    expect(first.get()).toEqual(second.get());
    expect(createJourney(storage).get()).toEqual(second.get());
    expect(storage.getItem(oldKey)).toBe(old);

    const exported = first.export();
    exported.attempts.length = 0;
    exported.effects.length = 0;
    expect(first.get().attempts).toHaveLength(2);
    expect(first.effectIds()).toHaveLength(2);
  });

  it('preserves adult observation provenance across reloads without turning reported help into independent evidence', () => {
    const storage = local();
    const first = createJourney(storage);
    const second = createJourney(storage);
    first.record(answer(1, { assessor: 'adult', seed: 51, help: ['support'] }));
    second.record(answer(2, { assessor: 'adult', seed: 52, tag: 'b', help: ['support'] }));
    const reloaded = createJourney(storage);
    expect(reloaded.get().attempts.map(attempt => attempt.assessor)).toEqual(['adult', 'adult']);
    expect(reloaded.observation(spec.id, spec, ['a', 'b']).state).toMatchObject({
      helped: true, checked: false, streak: 0,
    });
    // Human provenance does not bypass the same fresh-family and transfer requirements.
    for (const [at, tag] of [[3, 'a'], [4, 'b'], [5, 'a']] as const) {
      reloaded.record(answer(at, { assessor: 'adult', seed: at, tag }));
    }
    expect(reloaded.observation(spec.id, spec, ['a', 'b']).state.checked).toBe(false);
    reloaded.record(answer(6, { assessor: 'adult', seed: 6, phase: 'transfer', tag: 'transfer' }));
    expect(reloaded.observation(spec.id, spec, ['a', 'b']).state.checked).toBe(true);
    expect(reloaded.get().events).toEqual([]);
  });

  it('keeps assistance guided, filters prior and synthetic rows, and preserves the 20-hour gate', () => {
    const journey = createJourney(null);
    journey.record(answer(1, { help: ['hint'] }));
    journey.record(answer(2, { phase: 'transfer', help: ['support'] }));
    journey.record(answer(3, { syn: true }));
    journey.record(answer(4, { rev: 'retired' }));
    journey.record(answer(5, { help: ['reveal'] }));
    journey.record(answer(6, { replay: true }));
    expect(journey.state(cake.id, spec)).toMatchObject({ helped: true, checked: false, streak: 0 });

    const fresh = [answer(7), answer(8, { tag: 'b' }), answer(9), answer(10, { phase: 'transfer' })];
    for (const row of fresh) journey.record(row);
    expect(journey.state(cake.id, spec)).toMatchObject({ checked: true, dueAt: 10 + RULES.delayMs });

    const early = createJourney(null);
    for (const row of fresh) early.record(row);
    early.record(answer(9 + RULES.delayMs, { phase: 'retrieval' }));
    expect(early.state(cake.id, spec).retained).toBeUndefined();
    expect(early.observation(cake.id, spec, ['a', 'b']).state.retained).toBeUndefined();
    journey.record(answer(10 + RULES.delayMs, { phase: 'retrieval' }));
    expect(journey.state(cake.id, spec).retained).toBe(10 + RULES.delayMs);
    expect(journey.observation(cake.id, spec, ['a', 'b']).state.retained).toBe(10 + RULES.delayMs);
    journey.record(answer(10 + 2 * RULES.delayMs, { phase: 'retrieval', ok: false }));
    expect(journey.observation(cake.id, spec, ['a', 'b']).state).toMatchObject({
      checked: true, retained: undefined, recallFailed: true,
    });
    expect(journey.get().events).toEqual([]);
  });

  it('requires each declared family in the current independent streak before accepting a transfer', () => {
    const journey = createJourney(null);
    const families = ['size', 'distance', 'day', 'seasons'];
    const read = () => journey.observation(cake.id, spec, families);
    const record = (at: number, tag: string, fields: Partial<Attempt> = {}) => journey.record(answer(at, { tag, seed: at, ...fields }));
    record(1, 'size');
    record(2, 'distance');
    record(3, 'day');
    record(4, 'transfer', { phase: 'transfer' });
    expect(read()).toMatchObject({ state: { checked: false, transfer: 0 }, streak: 3, readyTransfer: false });
    record(5, 'seasons', { ok: false });
    record(6, 'seasons');
    record(7, 'day', { help: ['hint'] });
    record(8, 'size', { help: ['reveal'] });
    record(9, 'distance', { rev: 'retired' });
    record(10, 'day', { syn: true });
    record(11, 'size', { seed: 1 });
    expect(journey.get().attempts.at(-1)?.replay).toBe(true);
    expect(read().streakFamilies).toEqual(new Set(['seasons']));
    expect(read()).toMatchObject({ state: { checked: false, guidedOk: 1 }, streak: 1, readyTransfer: false });
    record(12, 'day');
    record(13, 'size');
    record(14, 'distance');
    expect(read()).toMatchObject({ streak: 4, readyTransfer: true, state: { checked: false } });
    record(15, 'transfer', { phase: 'transfer' });
    expect(read()).toMatchObject({ state: { checked: true, checkedAt: 15 } });
    record(16, 'day', { ok: false });
    expect(read()).toMatchObject({ state: { checked: true }, streak: 0, readyTransfer: false });
  });

  it('requires current-revision production evidence when the spec asks for it', () => {
    const journey = createJourney(null);
    const productionSpec = { ...spec, produce: ['build'] };
    const evidence = [
      answer(1), answer(2, { tag: 'recognise' }), answer(3),
      answer(4, { phase: 'transfer' }), answer(5, { tag: 'build', help: ['words'] }),
    ];
    for (const row of evidence) journey.record(row);
    expect(journey.state(cake.id, productionSpec)).toMatchObject({ checked: false, produced: false });
    journey.record(answer(6, { tag: 'build' }));
    expect(journey.state(cake.id, productionSpec)).toMatchObject({ checked: true, produced: true });
  });

  it('rejects malformed attempts and does not infer an event from an orphan effect', () => {
    const orphan = JSON.stringify({ v: 3, attempts: [], events: [], effects: [cake.effectId] });
    const storage = local({ [JOURNEY_KEY]: orphan });
    const journey = createJourney(storage);
    expect(journey.record(answer(1, { node: 'unknown' }))).toBe(false);
    expect(journey.record(answer(Number.NaN))).toBe(false);
    expect(journey.note()).toEqual({ mode: 'local', issue: 'corrupt', backedUp: true });
    expect(storage.getItem(JOURNEY_BACKUP_KEY)).toBe(orphan);
    expect(journey.hasEvent(cake.eventId)).toBe(false);
    expect(journey.effectIds()).toEqual([]);
  });

  it('preserves corrupt input and continues in memory when backup is unavailable', () => {
    const storage = local({ [JOURNEY_KEY]: '{malformed', [oldKey]: 'original' });
    const readOnly = { ...storage, setItem() { throw new Error('quota'); } };
    const journey = createJourney(readOnly);
    journey.record(answer(1));
    journey.resolve(cake.id, true);
    expect(journey.note()).toEqual({ mode: 'memory', issue: 'corrupt', backedUp: false });
    expect(journey.get().attempts).toHaveLength(1);
    expect(journey.effectIds()).toEqual([cake.effectId]);
    expect(storage.getItem(JOURNEY_KEY)).toBe('{malformed');
    expect(storage.getItem(oldKey)).toBe('original');
  });

  it('retains new entries in memory when ordinary storage fails', () => {
    const journey = createJourney({ getItem: () => null, setItem() { throw new Error('quota'); } });
    expect(journey.record(answer(1))).toBe(true);
    expect(journey.note()).toEqual({ mode: 'memory', issue: 'unavailable' });
    expect(journey.get().attempts.map((a) => a.at)).toEqual([1]);
  });
});
