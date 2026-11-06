import { describe, expect, it } from 'vitest';
import { EXPEDITION_NODES } from '../src/content/expedition';
import { hasAdultReview, withoutAdultReview } from '../src/content/adult-review';
import { check, solution, wrongs } from '../src/engine/check';
import { rng } from '../src/engine/rng';

// Solo play leaves the attached adult review out. The automatic part must still accept the
// reference answer, reject every generated wrong answer, and never claim an adult observation.
describe('adult review off', () => {
  const nodes = Object.entries(EXPEDITION_NODES);
  it('covers attached reviews in many lessons', () => {
    const withReview = nodes.filter(([, spec]) => { const t = spec.item(rng(0), 'independent').task; return hasAdultReview(t) && t.kind !== 'observed-explanation'; });
    // Light (theory book) nodes ask one question without a review, so the count shrinks as families are lightened.
    expect(withReview.length).toBeGreaterThan(40);
  });
  for (const [id, spec] of nodes) it(id, () => {
    for (const phase of ['guided', 'independent', 'transfer'] as const) for (let seed = 0; seed < 6; seed++) {
      const raw = spec.item(rng(seed), phase).task;
      if (!hasAdultReview(raw) || raw.kind === 'observed-explanation') continue;
      const task = withoutAdultReview(raw);
      expect(hasAdultReview(task)).toBe(false);
      const verdict = check(task, solution(task));
      expect(verdict, `${id} ${phase} ${seed}`).toMatchObject({ ok: true });
      expect(verdict.pendingReview || verdict.observedByAdult).toBeFalsy();
      for (const wrong of wrongs(task)) expect(check(task, wrong).ok, `${id} ${phase} ${seed} wrong`).toBe(false);
    }
  });
});
