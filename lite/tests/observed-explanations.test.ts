import { describe, expect, it } from 'vitest';
import { observedExplanationEvidence, observedExplanationSpecs } from '../src/content/observed-explanations';
import { checkObservedExplanation, solutionObservedExplanation, wrongObservedExplanationResponses, type ObservedExplanationResponse, type ObservedExplanationTask } from '../src/content/models/observed-explanations';
import { rng } from '../src/engine/rng';

function humanFixture(task: ObservedExplanationTask, edits?: Partial<ObservedExplanationResponse>): ObservedExplanationResponse {
  return {
    kind: 'observed-explanation', channel: task.channel,
    ...(task.channel === 'written' ? { text: 'Oma perustelu.' } : {}),
    observations: Object.fromEntries(task.rubric.map(({ id }) => [id, 'met'])),
    confirmedByAdult: true, assistance: 'none', ...edits,
  };
}

describe('adult observation of an original explanation', () => {
  it('separates pending, a confirmed unsuccessful observation, and assisted or independent success', () => {
    for (const spec of observedExplanationSpecs) {
      const { task } = spec.item(rng(7), 'independent');
      const complete = humanFixture(task);
      const first = task.rubric[0]!.id;
      expect(checkObservedExplanation(task, complete)).toEqual({ ok: true, observedByAdult: true });
      expect(checkObservedExplanation(task, { ...complete, assistance: 'helped' })).toEqual({ ok: true, observedByAdult: true, assisted: true });
      for (const changes of [
        { confirmedByAdult: false },
        { observations: { ...complete.observations, [first]: 'unobserved' } } as const,
        { observations: { ...complete.observations, [first]: undefined } },
        { observations: { ...complete.observations, extra: 'met' } } as const,
      ]) {
        const pending = checkObservedExplanation(task, { ...complete, ...changes });
        expect(pending).toMatchObject({ ok: false, pendingReview: true });
        expect(pending.observedByAdult).toBeUndefined();
      }
      expect(checkObservedExplanation(task, {
        ...complete, assistance: 'helped', observations: { ...complete.observations, [first]: 'not-yet' },
      })).toMatchObject({ ok: false, observedByAdult: true, assisted: true, why: expect.stringContaining(task.rubric[0]!.label) });
    }
  });

  it('keeps REP03 spoken and treats written text as a handoff to a person', () => {
    const spoken = observedExplanationSpecs.find(spec => spec.id === 'M-REP-03')!.item(rng(1), 'independent').task;
    expect(spoken.channel).toBe('spoken');
    expect(checkObservedExplanation(spoken, humanFixture(spoken, { channel: 'written', text: spoken.model })).ok).toBe(false);
    expect(checkObservedExplanation(spoken, humanFixture(spoken, { text: spoken.model })).ok).toBe(false);
    const written = observedExplanationSpecs[0]!.item(rng(1), 'independent').task;
    expect(checkObservedExplanation(written, humanFixture(written, { text: '  \n  ' })).pendingReview).toBe(true);
    expect(checkObservedExplanation(written, humanFixture(written, { text: '2' })).ok).toBe(true);
    expect(checkObservedExplanation(written, humanFixture(written, { text: written.model, confirmedByAdult: false })).ok).toBe(false);
  });

  it('model answer and plausible non-observations cannot create accepted evidence', () => {
    for (const spec of observedExplanationSpecs) {
      for (const phase of ['guided', 'independent', 'transfer', 'retrieval'] as const) {
        const { task } = spec.item(rng(2), phase);
        const example = solutionObservedExplanation(task);
        expect(example).toMatchObject({ confirmedByAdult: false, observations: {} });
        expect(example.text).toBeUndefined();
        expect(checkObservedExplanation(task, example)).toMatchObject({ ok: false, pendingReview: true });
        for (const wrong of wrongObservedExplanationResponses(task)) expect(checkObservedExplanation(task, wrong).ok).toBe(false);
      }
    }
  });

  it('covers two authored families, scoped criteria and fresh-context transfer per skill', () => {
    const expected = {
      'M-PS-04': ['compare-compensation', 'compare-difference-directions'],
      'M-REP-03': ['speak-combine-groups', 'speak-explain-missing-part'],
      'M-REP-05': ['choose-measuring-message', 'choose-sharing-message'],
    } as const;
    for (const spec of observedExplanationSpecs) {
      const independent = Array.from({ length: 24 }, (_, seed) => spec.item(rng(seed), 'independent'));
      const families = expected[spec.id as keyof typeof expected];
      expect(new Set(independent.map(item => item.tag))).toEqual(new Set(families));
      expect(observedExplanationEvidence[spec.id]?.families).toEqual(families);
      expect(spec.validRevs).toEqual([spec.rev]);
      for (const seed of [1, 2, 3, 7, 8]) {
        const transfer = spec.item(rng(seed), 'transfer');
        expect(transfer.tag).toBe('transfer');
        expect(independent.every(item => item.task.prompt !== transfer.task.prompt ||
          JSON.stringify(item.task.givens) !== JSON.stringify(transfer.task.givens))).toBe(true);
        expect(new Set(transfer.task.rubric.map(({ id }) => id)).size).toBe(transfer.task.rubric.length);
        expect(transfer.task.rubric.every(({ label, guide }) => !!label.trim() && !!guide.trim())).toBe(true);
      }
    }
  });

  it('presents valid strategies and compares their answers against independently parsed givens', () => {
    const spec = observedExplanationSpecs.find(spec => spec.id === 'M-PS-04')!;
    for (const phase of ['independent', 'transfer'] as const) {
      for (let seed = 1; seed <= 24; seed++) {
        const { task, tag } = spec.item(rng(seed), phase);
        const numbers = (s: string) => [...s.matchAll(/\d+(?:,\d)?/g)].map(([v]) => Number(v.replace(',', '.')));
        const [a, b] = numbers(task.givens[0]!.value);
        const expected = tag === 'compare-difference-directions' ? a! - b! : a! + b!;
        for (const strategy of task.givens.slice(1)) {
          expect(numbers(strategy.value).at(-1)).toBeCloseTo(expected, 9);
        }
      }
    }
  });
});
