import { expect, it } from 'vitest';
import { EXPEDITION_ADDITIONS, EXPEDITION_NODES } from '../src/content/expedition';
import { NODES } from '../src/content/index';
import { correctionModelSpecs } from '../src/content/correction-models';
import { createJourney } from '../src/engine/journey';

it('registers one implementation per canonical ID and preserves all original 181 specs', () => {
  const ids = EXPEDITION_ADDITIONS.map(s => s.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const [id, spec] of Object.entries(NODES)) expect(EXPEDITION_NODES[id]).toBe(spec);
});

it('retains earlier graph evidence as history without extending its scope to the expanded workshop', () => {
  const id = 'M79-SYSTEM-GRAPH', earlier = correctionModelSpecs.find(s => s.id === id)!, current = EXPEDITION_NODES[id]!;
  expect(current).not.toBe(earlier);
  expect(current.rev).not.toBe(earlier.rev);
  const journey = createJourney(null);
  for (let i = 1; i <= 4; i++) journey.record({ node: id, seed: i, at: i, rev: earlier.rev,
    phase: i === 4 ? 'transfer' : 'independent', tag: i === 4 ? 'transfer' : i === 2 ? 'relation' : 'intersection', ok: true });
  expect(journey.observation(id, earlier, ['intersection', 'relation']).state.checked).toBe(true);
  expect(journey.observation(id, current, ['read-a-shared-intersection', 'distinguish-parallel-and-coincident-lines'])).toMatchObject({
    streak: 0, readyTransfer: false, state: { checked: false },
  });
  expect(journey.get().attempts).toHaveLength(4);
  expect(journey.get().attempts.every(a => a.rev === earlier.rev)).toBe(true);
});
