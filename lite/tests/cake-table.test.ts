import { describe, expect, it } from 'vitest';
import { CAKE_NODE } from '../src/content/fractions/cake-node';
import { check, solution } from '../src/engine/check';
import { nodeState, RULES, type Attempt } from '../src/engine/evidence';
import { rng } from '../src/engine/rng';
import {
  cakeCutSentence, cakeExplanation, cakeFactors, cakeNotation, cakePartition, cakePieceCount, cakePrompt, cakeQuestion,
  checkCake, makeCakeTask, solutionCake, wrongCakeResponses,
} from '../src/content/fractions/cake-table';

const party = makeCakeTask(0, 'guided');

describe('picture-led cake table', () => {
  it('guides with a half and two thirds that make seven sixths', () => {
    expect(party).toMatchObject({ family: 'count-pieces', shape: 'cake', left: { kept: 1, parts: 2 }, right: { kept: 2, parts: 3 } });
    expect(cakeFactors(party)).toEqual([3, 2]);
    expect(cakePieceCount(party)).toBe(7);
    expect(solutionCake(party)).toEqual({ kind: 'cake', count: 7 });
    expect(party.options).toContain(7);
    expect(cakeNotation(party)).toBe('1/2 + 2/3 = 3/6 + 4/6 = 7/6 = 1 1/6');
    expect(cakePrompt(party)).toContain('kahteen');
    expect(cakeCutSentence(party)).toContain('Jokainen puolikas leikataan kolmeen osaan.');
    expect(cakeExplanation(party)).toContain('1 kuudesosa jää yli');
    expect(cakeQuestion(party)).toBe('Kuinka monta kuudesosaa on yhteensä?');
  });

  it('uses no fraction vocabulary in the learner-facing texts', () => {
    for (let seed = 0; seed < 60; seed++) {
      for (const phase of ['guided', 'independent', 'transfer'] as const) {
        const task = makeCakeTask(seed, phase);
        const texts = [cakePrompt(task), cakeQuestion(task), cakeCutSentence(task), cakeExplanation(task)].join(' ');
        expect(texts).not.toMatch(/osoittaja|nimittäjä|murtoluku/i);
      }
    }
  });

  it('names the counting mistakes and rejects every other offered count', () => {
    expect(checkCake(party, { kind: 'cake', count: 3 })).toMatchObject({ ok: false, why: expect.stringContaining('ennen leikkaamista') });
    expect(checkCake(party, { kind: 'cake', count: 6 })).toMatchObject({ ok: false, why: expect.stringContaining('täyden') });
    const rest = makeCakeTask(0, 'guided', 'whole-and-rest');
    expect(solutionCake(rest).count).toBe(1);
    expect(checkCake(rest, { kind: 'cake', count: 7 })).toMatchObject({ ok: false, why: expect.stringContaining('kaikki palat') });
    for (const bad of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) expect(checkCake(party, { kind: 'cake', count: bad }).ok).toBe(false);
  });

  it('keeps every seeded task consistent: one answer among four options, sum above one whole', () => {
    const cases = new Set<string>();
    for (let seed = 0; seed < 120; seed++) {
      for (const phase of ['independent', 'transfer'] as const) {
        const task = makeCakeTask(seed, phase);
        expect(task).toEqual(makeCakeTask(seed, phase));
        expect(task.shape).toBe(phase === 'transfer' ? 'strip' : 'cake');
        cases.add(`${phase}:${task.family}:${task.left.parts}+${task.right.parts}`);
        const [fl, fr] = cakeFactors(task);
        const d = task.left.parts * fl;
        expect(task.right.parts * fr).toBe(d);
        const n = cakePieceCount(task);
        expect(n).toBeGreaterThan(d);
        expect(n).toBeLessThan(2 * d);
        expect(task.options).toHaveLength(4);
        expect([...task.options].sort((a, b) => a - b)).toEqual(task.options);
        expect(task.options.filter((value) => checkCake(task, { kind: 'cake', count: value }).ok)).toHaveLength(1);
        expect(checkCake(task, solutionCake(task)).ok).toBe(true);
        for (const wrong of wrongCakeResponses(task)) expect(checkCake(task, wrong).ok).toBe(false);
        const [left, right] = cakePartition(task, fl, fr);
        expect(left.pieces.length + right.pieces.length).toBe(n);
      }
    }
    expect([...cases].filter((c) => c.startsWith('independent')).length).toBeGreaterThanOrEqual(12);
    expect(() => cakePartition(party, 0, 2)).toThrow(RangeError);
  });

  it('submits both families and a transfer through the Lite evidence path', () => {
    let at = 0;
    const answer = (phase: 'guided' | 'independent' | 'transfer', seed: number): Attempt => {
      const item = CAKE_NODE.item(rng(seed), phase);
      expect(item.task.kind).toBe('cake');
      expect(Boolean(item.hint)).toBe(phase === 'guided');
      const verdict = check(item.task, solution(item.task));
      return { node: CAKE_NODE.id, at: ++at, phase, tag: item.tag, ok: verdict.ok, rev: CAKE_NODE.rev };
    };
    const guided = [answer('guided', 1), answer('guided', 2)];
    expect(nodeState(guided)).toMatchObject({ helped: true, checked: false, streak: 0 });
    const independent = Array.from({ length: 20 }, (_, seed) => answer('independent', seed));
    const count = independent.find((a) => a.tag === 'count-pieces')!;
    const rest = independent.find((a) => a.tag === 'whole-and-rest')!;
    expect(count.ok && rest.ok).toBe(true);
    const complete = [...guided, count, rest, { ...count, at: ++at }, answer('transfer', 10)];
    expect(nodeState(complete)).toMatchObject({ checked: true, dueAt: at + RULES.delayMs });
  });
});
