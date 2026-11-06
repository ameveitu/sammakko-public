import { expect, it } from 'vitest';
import { rightTriangleSpecs } from '../src/content/right-triangle';
import { resolveItemReadinessContext } from '../src/content/item-readiness-context';
import { evaluateItemReadiness } from '../src/engine/item-readiness';
import { rng } from '../src/engine/rng';

it('keeps each atomic calculation on its taught ratio through independent and transfer work', () => {
  for (const [nodeId, ratio, prerequisite] of [
    ['M79-TRIG-ANGLE', 'cos', 'M79-COS'], ['M79-TRIG-SIDE', 'tan', 'M79-TAN'],
  ] as const) {
    const spec = rightTriangleSpecs.find(node => node.id === nodeId)!;
    for (const phase of ['independent', 'transfer'] as const) for (let seed = 0; seed < 64; seed++) {
      const item = spec.item(rng(seed), phase);
      const context = resolveItemReadinessContext(nodeId, item);
      expect(context).toEqual({ kind: 'trig', ratio });
      const input = { nodeId, itemAvailable: true, staticGroups: [], context };
      expect(evaluateItemReadiness({ ...input, knownChecked: id => id === prerequisite }).dynamic.status).toBe('ready');
      const wrongRatio = evaluateItemReadiness({ ...input, knownChecked: id => id === 'M79-SIN' });
      expect(wrongRatio.dynamic.status).toBe('missing');
      expect(wrongRatio.dynamic.missing).toEqual([[prerequisite]]);
    }
  }
});

it('does not trust a ratio label that disagrees with the actual authored calculation', () => {
  const task = { kind: 'right-triangle', context: { kind: 'trig', ratio: 'cos' }, jobs: [{ kind: 'trig-angle', taught: 'sin' }] };
  expect(resolveItemReadinessContext('M79-TRIG-ANGLE', { task })).toBeUndefined();
  expect(resolveItemReadinessContext('M79-TRIG-SIDE', { task: { ...task, jobs: [{ kind: 'trig-angle', taught: 'cos' }] } })).toBeUndefined();
  expect(resolveItemReadinessContext('M79-TRIG-ANGLE', { task: { ...task, jobs: new Array(1) } })).toBeUndefined();
  expect(resolveItemReadinessContext('M79-TRIG-CALC', { task })).toBeUndefined();
});
