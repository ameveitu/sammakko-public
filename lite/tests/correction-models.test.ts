import { describe, expect, it } from 'vitest';
import { correctionModelSpecs, solveLinear } from '../src/content/correction-models';
import { CHANNEL_OBSERVATIONS, matchingRoutes, observedRoute } from '../src/content/models/channel-evidence';
import { diffuse, moveMarked } from '../src/content/models/diffusion-model';
import { rng } from '../src/engine/rng';
import { check } from '../src/engine/check';

describe('corrected model evidence', () => {
  it('solves two independent board conditions and distinguishes coincident and parallel lines', () => {
    expect(solveLinear([1, 1, 12], [2, 1, 17])).toEqual({ kind: 'unique', x: 5, y: 7 });
    expect(5 + 7).toBe(12);
    expect(2 * 5 + 7).toBe(17);
    expect(solveLinear([1, 1, 12], [2, 2, 24])).toEqual({ kind: 'same' });
    expect(solveLinear([1, 1, 12], [2, 2, 26])).toEqual({ kind: 'parallel' });
  });
  it('uses the disclosed observations, not a hydraulic guess', () => {
    expect(matchingRoutes(CHANNEL_OBSERVATIONS)).toEqual(['C']);
    expect(observedRoute('A')).toEqual({ route: 'A', nest: 'quiet', waterfall: false });
    expect(observedRoute('unknown')).toBeUndefined();
    expect(matchingRoutes(CHANNEL_OBSERVATIONS.slice(0, 2))).toEqual([]);
  });
  it('starts revision from the old observation and targets the observed transfer route', () => {
    const spec = correctionModelSpecs.find(item => item.id === 'SCI-ENV-MODEL-02')!;
    const revision = Array.from({length: 100}, (_, i) => spec.item(rng(i), 'independent')).find(item => item.tag === 'revise')!;
    expect(revision.task.kind).toBe('place');
    if (revision.task.kind !== 'place') throw new Error('Expected a repair task');
    expect(revision.task.start).toEqual({nest: 'quiet', fall: 'no'});
    expect(revision.task.answer).toEqual({nest: 'quiet', fall: 'yes'});
    expect(check(revision.task, {kind:'place', map:revision.task.start!}).ok).toBe(false);
    expect(check(revision.task, {kind:'place', map:revision.task.answer}).ok).toBe(true);
    const transfer = spec.item(rng(1), 'transfer');
    expect(transfer.hint).toContain('reitin A');
  });
  it('conserves mass with reflecting boundaries and preserves a uniform distribution', () => {
    expect(diffuse([12, 4, 0, 0], 1)).toEqual([10, 5, 1, 0]);
    expect(diffuse([12, 4, 0, 0], 2)).toEqual([8.75, 5.25, 1.75, 0.25]);
    for (const steps of [0, 1, 2, 10, 100]) {
      const result = diffuse([12, 4, 0, 0], steps);
      expect(result.reduce((a, b) => a + b, 0)).toBeCloseTo(16, 10);
      expect(result.every(n => n >= 0)).toBe(true);
      expect(diffuse([4, 4, 4, 4], steps)).toEqual([4, 4, 4, 4]);
    }
    expect(moveMarked(1, -1, 4)).toBe(0);
    expect(moveMarked(1, 1, 4)).toBe(2);
    expect(moveMarked(0, -1, 4)).toBe(0);
    expect(moveMarked(3, 1, 4)).toBe(3);
    expect(() => diffuse([1, -1], 1)).toThrow();
  });
  it('provides both assessment families and a separate transfer for all three nodes', () => {
    for (const spec of correctionModelSpecs) {
      const tags = new Set(Array.from({ length: 100 }, (_, seed) => spec.item(rng(seed + 1), 'independent').tag));
      expect(tags.size).toBeGreaterThanOrEqual(2);
      expect(spec.item(rng(42), 'transfer').tag).toBe('transfer');
      for (let seed = 1; seed <= 20; seed++) {
        const item = spec.item(rng(seed), 'independent');
        const task = item.task;
        if (task.kind === 'plot') {
          expect(check(task, { kind: 'plot', points: task.xs.map((x, i) => [x, task.ys[i]!]) }).ok).toBe(true);
          expect(check(task, { kind: 'plot', points: [] }).ok).toBe(false);
        } else if (task.kind === 'place') {
          expect(check(task, { kind: 'place', map: task.answer }).ok).toBe(true);
          expect(check(task, { kind: 'place', map: {} }).ok).toBe(false);
        } else if (task.kind === 'choice') {
          expect(check(task, { kind: 'choice', index: task.answer }).ok).toBe(true);
          expect(check(task, { kind: 'choice', index: (task.answer + 1) % task.options.length }).ok).toBe(false);
        } else throw new Error(`Unexpected task: ${task.kind}`);
      }
    }
  });
});
