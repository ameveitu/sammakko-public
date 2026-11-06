import { describe, expect, it } from 'vitest';
import { itemIdentity } from '../src/engine/item-identity';
import { createJourney } from '../src/engine/journey';
import { EXPEDITION_ADDITIONS } from '../src/content/expedition';
import { rng } from '../src/engine/rng';
import type { Item } from '../src/engine/types';

const item: Item = { tag: 'first-family', say: 'Laske määrä.', explain: 'Selitys.', task: { kind: 'numeric', answer: 12 } };
describe('exact authored item identity', () => {
  it('ignores rendering functions, family labels and object insertion order, but distinguishes changed givens', () => {
    const copy: Item = { ...item, tag: 'another-family', scene: () => {}, task: { answer: 12, kind: 'numeric' } };
    expect(itemIdentity(copy)).toBe(itemIdentity(item));
    expect(itemIdentity({ ...item, task: { kind: 'numeric', answer: 13 } })).not.toBe(itemIdentity(item));
    const a = { ...item, sceneModel: { kind: 'example', given: [2, 6] } };
    const b = { ...item, sceneModel: { given: [3, 4], kind: 'example' } };
    expect(itemIdentity(a)).not.toBe(itemIdentity(b));
    expect(itemIdentity(item)).toMatch(/^item1:\d+:[0-9a-f]{16}$/);
  });

  it('does not turn another seed or family tag into a fresh assessment, including after reload', () => {
    const values = new Map<string, string>();
    const storage = { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => { values.set(k, v); } };
    const first = createJourney(storage);
    const base = { node: 'M-FRAC-13', phase: 'independent' as const, ok: true, rev: 'identity-test', tag: 'a' };
    first.record({ ...base, seed: 1, at: 1, itemKey: itemIdentity(item) });
    const reloaded = createJourney(storage);
    reloaded.record({ ...base, seed: 97, at: 2, tag: 'b', itemKey: itemIdentity({ ...item, tag: 'b' }) });
    expect(reloaded.get().attempts.map(a => a.replay ?? false)).toEqual([false, true]);
    reloaded.record({ ...base, seed: 98, at: 3, itemKey: itemIdentity({ ...item, task: { kind: 'numeric', answer: 19 } }) });
    expect(reloaded.get().attempts.at(-1)?.replay).toBeUndefined();
    // Older records without an identity remain valid and retain their seed-based rule.
    reloaded.record({ ...base, seed: 101, at: 4 });
    reloaded.record({ ...base, seed: 102, at: 5 });
    expect(reloaded.get().attempts.slice(-2).some(a => a.replay)).toBe(false);
  });

  it('has enough distinct structured independent items for guided practice, a three-item check and recall', () => {
    const shortages: string[] = [];
    for (const spec of EXPEDITION_ADDITIONS) {
      const identities = new Set(Array.from({ length: 160 }, (_, seed) => itemIdentity(spec.item(rng(seed), 'independent'))));
      if (identities.size < 6) shortages.push(`${spec.id}: ${identities.size}`);
    }
    expect(shortages).toEqual([]);
  }, 30000); // generates 160 items per lesson; slow when the whole suite runs in parallel
});
