import { describe, expect, it } from 'vitest';
import { powerRuleEvidence, powerRuleSpecs } from '../src/content/power-rules';
import { checkPowerRule, divisionParts, power, powerValue, solutionPowerRule, wrongPowerRuleResponses, type FactorTree, type PowerRuleResponse, type PowerRuleTask } from '../src/content/models/power-rules';
import { catalogNode } from '../src/engine/catalog';
import { rng } from '../src/engine/rng';

const kind = 'power-rules' as const;
const spec = (id: string) => powerRuleSpecs.find(node => node.id === id)!;
const context = { title: 'Koetehtävä', skills: [], rules: [] };
const baseTask = { kind, context, givens: [] };
const leaf = (value: number) => ({ value });
const node = (value: number, a: FactorTree, b: FactorTree): FactorTree => ({ value, children: [a, b] });
const factorReply = (tree: FactorTree, product = 36): PowerRuleResponse => ({ kind, mode: 'factor-tree', tree, product });

describe('Kivien tähtitorni', () => {
  it('has stable evidence revisions, two families, canonical content context and distinct transfers', () => {
    expect(powerRuleSpecs).toHaveLength(11);
    for (const spec of powerRuleSpecs) {
      const seen = new Set<string>();
      expect(spec.validRevs).toEqual([spec.rev]);
      for (const phase of ['independent', 'guided', 'transfer', 'retrieval'] as const) for (let seed = 0; seed < 25; seed++) {
        const { task, tag } = spec.item(rng(seed), phase);
        expect(task).toEqual(spec.item(rng(seed), phase).task);
        expect(task.context.skills.length).toBeGreaterThan(0);
        expect(task.context.skills.every(id => catalogNode(id))).toBe(true);
        expect(tag === 'transfer').toBe(phase === 'transfer');
        if (phase === 'independent') seen.add(tag);
        expect(checkPowerRule(task, solutionPowerRule(task)).ok, `${spec.id} ${phase} ${seed}`).toBe(true);
        for (const wrong of wrongPowerRuleResponses(task)) expect(checkPowerRule(task, wrong).ok).toBe(false);
      }
      expect(seen.size).toBe(2);
      expect(seen).toEqual(new Set(powerRuleEvidence[spec.id]!.families));
    }
  });

  it('enforces the Euclidean remainder and sign across positive and negative dividends and divisors', () => {
    for (let n = -23; n <= 23; n++) for (let d = -7; d <= 7; d++) {
      if (!d) continue;
      // Brute force on the integer lattice is independent of the production remainder formula.
      const q = Array.from({ length: 51 }, (_, k) => k - 25).find(k => d * k <= n && n < d * k + Math.abs(d))!;
      const r = n - d * q;
      const task: PowerRuleTask = { ...baseTask, mode: 'division', dividend: n, divisor: d };
      expect(checkPowerRule(task, { kind, mode: 'division', quotient: q, remainder: r, divisible: r === 0 }).ok).toBe(true);
      expect(checkPowerRule(task, { kind, mode: 'division', quotient: q + Math.sign(d), remainder: r - Math.abs(d), divisible: false }).ok).toBe(false);
    }
    expect(divisionParts(0, 0)).toBeUndefined();
    expect(checkPowerRule({ ...baseTask, mode: 'division', dividend: 4, divisor: 0 }, { kind, mode: 'division', quotient: 0, remainder: 4, divisible: false }).ok).toBe(false);
  });

  it('distinguishes 1, 2, odd composites, and accepts any actual nontrivial divisor', () => {
    const task: PowerRuleTask = { ...baseTask, mode: 'prime', numbers: [1, 2, 45] };
    const rows = [{ classification: 'one', divisor: null, divisorCount: 1 }, { classification: 'prime', divisor: null, divisorCount: null },
      { classification: 'composite', divisor: 15, divisorCount: null }] as const;
    const answer: PowerRuleResponse = { kind, mode: 'prime', rows: [...rows] };
    expect(checkPowerRule(task, answer).ok).toBe(true);
    expect(checkPowerRule(task, { ...answer, rows: [{ ...rows[0], classification: 'prime' }, rows[1], rows[2]] }).ok).toBe(false);
    expect(checkPowerRule(task, { ...answer, rows: [{ ...rows[0], divisorCount: 2 }, rows[1], rows[2]] }).ok).toBe(false);
    expect(checkPowerRule(task, { ...answer, rows: [rows[0], rows[1], { ...rows[2], divisor: 4 }] }).ok).toBe(false);
  });

  it('accepts different trees for 36 and rejects incomplete, bogus and repeated transfer roots', () => {
    const task: PowerRuleTask = { ...baseTask, mode: 'factor-tree', number: 36 };
    const six = () => node(6, leaf(2), leaf(3));
    const sixes = node(36, six(), six());
    const fourAndNine = node(36, node(4, leaf(2), leaf(2)), node(9, leaf(3), leaf(3)));
    const eighteen = node(36, leaf(2), node(18, leaf(2), node(9, leaf(3), leaf(3))));
    for (const valid of [sixes, fourAndNine, eighteen]) expect(checkPowerRule(task, factorReply(valid)).ok).toBe(true);
    const transfer = { ...task, avoidPair: [6, 6] as const };
    expect(checkPowerRule(transfer, factorReply(sixes)).ok).toBe(false);
    expect(checkPowerRule(transfer, factorReply(fourAndNine)).ok).toBe(true);
    const continuation = { ...task, givenPair: [9, 4] as const };
    expect(checkPowerRule(continuation, factorReply(sixes)).ok).toBe(false);
    expect(checkPowerRule(continuation, factorReply(fourAndNine)).ok).toBe(true);
    expect(checkPowerRule(task, factorReply(node(36, leaf(1), six()))).ok).toBe(false);
    expect(checkPowerRule(task, factorReply(node(36, leaf(4), leaf(9)))).ok).toBe(false);
    expect(checkPowerRule(task, factorReply(fourAndNine, 18)).ok).toBe(false);
  });

  it('separates exponent, base, repeated factors, and the outside sign', () => {
    const task: PowerRuleTask = { ...baseTask, mode: 'expansion', base: '2', exponent: 3, view: 'symbol', identify: true };
    const answer: PowerRuleResponse = { kind, mode: 'expansion', base: '2', exponent: 3, factors: ['2', '2', '2'], value: '16/2', comparison: null };
    expect(checkPowerRule(task, answer).ok).toBe(true);
    expect(checkPowerRule(task, { ...answer, base: '3', exponent: 2 }).ok).toBe(false);
    expect(checkPowerRule(task, { ...answer, factors: ['2', '3'], value: '6' }).ok).toBe(false);
    const signed = { ...task, view: 'signed' as const, exponent: 2, outsideMinus: true, compareBase: '-2', compareExponent: 2 };
    const signedAnswer = { ...answer, exponent: 2, factors: ['2', '2'], value: '−4', comparison: 'less' as const };
    expect(checkPowerRule(signed, signedAnswer).ok).toBe(true);
    expect(checkPowerRule(signed, { ...signedAnswer, factors: ['-2', '-2'], value: '4' }).ok).toBe(false);
    expect(powerValue('-2', 2)).toBe('4');
    expect(powerValue('2', 2, true)).toBe('-4');
  });

  it('uses reciprocal powers exactly, including a base between zero and one and the zero restriction', () => {
    const negative: PowerRuleTask = { ...baseTask, mode: 'exponent-table', base: '1/2', exponent: -3, view: 'symbol', comparisonBase: '2' };
    const answer: PowerRuleResponse = { kind, mode: 'exponent-table', value: '8', divisor: '', reciprocalBase: '0,50', positiveExponent: 3,
      otherValue: '2/16', restriction: 'nonzero', comparison: 'greater' };
    expect(checkPowerRule(negative, answer).ok).toBe(true);
    expect(checkPowerRule(negative, { ...answer, value: '-8' }).ok).toBe(false);
    expect(checkPowerRule(negative, { ...answer, otherValue: '8' }).ok).toBe(false);
    expect(checkPowerRule(negative, { ...answer, positiveExponent: -3 }).ok).toBe(false);
    expect(checkPowerRule(negative, { ...answer, comparison: 'less' }).ok).toBe(false);
    expect(powerValue('0', 0)).toBeUndefined();
    expect(powerValue('0', -2)).toBeUndefined();
    expect(powerValue('0', 2)).toBe('0');
    const zero = { ...negative, base: '-2', exponent: 0, view: 'quotient' as const, comparisonBase: undefined };
    expect(checkPowerRule(zero, { ...answer, value: '1', divisor: '4' }).ok).toBe(true);
    expect(checkPowerRule(zero, { ...answer, value: '1', divisor: '-2' }).ok).toBe(false);
    expect(checkPowerRule({ ...zero, base: '0' }, { ...answer, value: '1', divisor: '0' }).ok).toBe(false);
  });

  it('requires actual counterexample values, not only the right named rule', () => {
    const task: PowerRuleTask = { ...baseTask, mode: 'rewrite', source: { kind: 'product', left: power('2', 2), right: power('3', 3) },
      focuses: [[]], counterexample: power('2', 5) };
    const answer: PowerRuleResponse = { kind, mode: 'rewrite', steps: [{ rule: 'keep', exponent: null }], actions: 0,
      finalBase: '', finalExponent: null, restriction: 'any', sourceValue: '108', proposedValue: '32' };
    expect(checkPowerRule(task, answer).ok).toBe(true);
    expect(checkPowerRule(task, { ...answer, sourceValue: '' }).ok).toBe(false);
    expect(checkPowerRule(task, { ...answer, sourceValue: '32' }).ok).toBe(false);
    expect(checkPowerRule(task, { ...answer, steps: [{ rule: 'sum', exponent: 5 }] }).ok).toBe(false);
  });

  it('checks symbolic exponent steps and the original restriction even if all factors cancel', () => {
    const atom: PowerRuleTask = { ...baseTask, mode: 'rewrite', source: { kind: 'quotient', left: power('a', 3), right: power('a', 3) },
      focuses: [[]], visual: 'cancel' };
    const answer: PowerRuleResponse = { kind, mode: 'rewrite', steps: [{ rule: 'difference', exponent: 0 }], actions: 3,
      finalBase: 'a', finalExponent: 0, restriction: 'nonzero', sourceValue: '', proposedValue: '' };
    expect(checkPowerRule(atom, answer).ok).toBe(true);
    expect(checkPowerRule(atom, { ...answer, actions: 2 }).ok).toBe(false);
    expect(checkPowerRule(atom, { ...answer, restriction: 'any' }).ok).toBe(false);
    expect(checkPowerRule({ ...atom, source: { kind: 'quotient', left: power('0', 3), right: power('0', 3) } }, { ...answer, finalBase: '0' }).ok).toBe(false);

    // Independent symbolic exponents from the two authored integer coefficients.
    for (let seed = 0; seed < 48; seed++) {
      const { task } = spec('M79-POWER-SIMPLIFY').item(rng(seed), 'transfer');
      if (task.mode !== 'rewrite' || task.source.kind !== 'quotient' || task.source.left.kind !== 'power' || task.source.right.kind !== 'nested') throw Error('Unexpected transfer');
      const { left, right } = task.source;
      const expanded = Array(right.exponent).fill(right.inner.exponent).reduce((sum, count) => sum + count, 0);
      const valid = { ...answer, actions: 0, finalBase: left.base, finalExponent: left.exponent - expanded,
        steps: [{ rule: 'multiply', exponent: expanded }, { rule: 'difference', exponent: left.exponent - expanded }] } satisfies PowerRuleResponse;
      expect(checkPowerRule(task, valid).ok).toBe(true);
      expect(checkPowerRule(task, { ...valid, steps: valid.steps.slice(1) }).ok).toBe(false);
      expect(checkPowerRule(task, { ...valid, finalExponent: expanded - left.exponent }).ok).toBe(valid.finalExponent === 0);
    }
  });
});
