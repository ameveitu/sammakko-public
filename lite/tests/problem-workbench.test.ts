import { describe, expect, it } from 'vitest';
import { problemWorkbenchEvidence, problemWorkbenchSpecs } from '../src/content/problem-workbench';
import { checkProblemWorkbench, solutionProblemWorkbench, wrongProblemWorkbenchResponses, type ProblemWorkbenchResponse } from '../src/content/models/problem-workbench';
import { catalogNode } from '../src/engine/catalog';
import { rng } from '../src/engine/rng';

const spec = (id: string) => problemWorkbenchSpecs.find(node => node.id === id)!;
const kind = 'problem-workbench' as const;
const integers = (text: string) => [...text.matchAll(/\d+/g)].map(match => Number(match[0]));

describe('Telttakylän workbench domain', () => {
  it('has a stable local revision and two actual families with separately authored transfer', () => {
    expect(problemWorkbenchSpecs).toHaveLength(7);
    for (const node of problemWorkbenchSpecs) {
      const families = new Set(Array.from({ length: 40 }, (_, seed) => node.item(rng(seed), 'independent').tag));
      expect(families).toEqual(new Set(problemWorkbenchEvidence[node.id]?.families));
      expect(families.size).toBe(2);
      expect(node.validRevs).toEqual([node.rev]);
      for (const phase of ['independent', 'guided', 'transfer'] as const) {
        for (let seed = 0; seed < 20; seed++) {
          const { task, tag } = node.item(rng(seed), phase);
          expect(task.context.skills.length).toBeGreaterThan(0);
          expect(task.context.skills.every(id => catalogNode(id))).toBe(true);
          expect(tag === 'transfer').toBe(phase === 'transfer');
          expect(checkProblemWorkbench(task, solutionProblemWorkbench(task)).ok, `${node.id} ${tag} ${seed}`).toBe(true);
          for (const wrong of wrongProblemWorkbenchResponses(task)) expect(checkProblemWorkbench(task, wrong).ok).toBe(false);
        }
      }
    }
  });

  it('sorts the question apart from usable quantities and parks irrelevant transfer data', () => {
    for (let seed = 1; seed < 10; seed++) {
      const { task } = spec('M-PS-01').item(rng(seed), 'transfer');
      if (task.mode !== 'sort') throw new Error('Expected a sort task');
      const roles = task.cards.map(card => card.text.includes('?') ? 'question' : card.text.includes('haarukkaa') ? 'unused' : 'given');
      const unknown = task.unknowns.findIndex(text => /jäävien/.test(text));
      expect(checkProblemWorkbench(task, { kind, mode: 'sort', roles, unknown }).ok).toBe(true);
      expect(checkProblemWorkbench(task, { kind, mode: 'sort', roles: roles.map(role => role === 'unused' ? 'given' : role), unknown }).ok).toBe(false);
      expect(checkProblemWorkbench(task, { kind, mode: 'sort', roles, unknown: task.unknowns.findIndex(text => text.includes('Haarukoiden')) }).ok).toBe(false);
    }
  });

  it('requires first construction, measured comparison, and a new exact fit', () => {
    for (let seed = 0; seed < 30; seed++) {
      const { task } = spec('M-PS-02').item(rng(seed), seed % 3 ? 'independent' : 'transfer');
      if (task.mode !== 'trial') throw new Error('Expected a trial');
      const [target] = integers(task.givens[0]!.value);
      const [base, perPiece] = integers(task.givens[1]!.value);
      const first = task.startingCount;
      const measured = base! + perPiece! * first;
      const second = (target! - base!) / perPiece!;
      const finding = measured < target! ? 'short' : 'surplus';
      const correct: ProblemWorkbenchResponse = { kind, mode: 'trial', first, finding, second };
      expect(second).not.toBe(first);
      expect(checkProblemWorkbench(task, correct).ok).toBe(true);
      expect(checkProblemWorkbench(task, { ...correct, first: second }).ok).toBe(false);
      expect(checkProblemWorkbench(task, { ...correct, finding: finding === 'short' ? 'surplus' : 'short' }).ok).toBe(false);
      expect(checkProblemWorkbench(task, { ...correct, second: first }).ok).toBe(false);
    }
  });

  it('checks the strategy-specific calculation and stated delivery constraint', () => {
    for (let seed = 1; seed < 18; seed++) {
      const { task, tag } = spec('M-PS-03').item(rng(seed), seed % 3 ? 'independent' : 'transfer');
      if (task.mode !== 'strategy') throw new Error('Expected a strategy');
      const [a, b] = integers(task.givens[0]!.value);
      const packing = tag.includes('pack');
      const methodLabel = packing ? 'Tee täysiä ryhmiä' : tag === 'transfer' ? 'Laske jäljelle jäävä määrä' : 'Täydennä tavoitteeseen';
      const method = task.methods.findIndex(option => option.label === methodLabel);
      const reason = task.reasons.findIndex(reason => reason.startsWith(packing ? 'Täydet' : tag === 'transfer' ? 'Otan' : 'Löydän'));
      const amount = packing ? a! / b! : a! - b!;
      if (packing) expect(amount).toBeLessThan(integers(task.givens[1]!.value)[0]!);
      const correct: ProblemWorkbenchResponse = { kind, mode: 'strategy', method, reason, steps: [amount] };
      expect(checkProblemWorkbench(task, correct).ok).toBe(true);
      expect(checkProblemWorkbench(task, { ...correct, steps: [amount + 1] }).ok).toBe(false);
      expect(checkProblemWorkbench(task, { ...correct, reason: (reason + 1) % 3 }).ok).toBe(false);
    }
  });

  it('derives justified estimate bounds from only anchor ranges, then checks the proposal', () => {
    const coverage = new Set<string>();
    for (let seed = 0; seed < 30; seed++) {
      const { task, tag } = spec('M-PS-05').item(rng(seed), seed % 3 ? 'independent' : 'transfer');
      if (task.mode !== 'estimate') throw new Error('Expected estimate bounds');
      const [a, b] = integers(task.givens[0]!.value);
      const [c, d] = integers(tag === 'estimate-equal-containers' ? task.anchors : task.givens[1]!.value);
      const lo = b === undefined ? a! * c! : a! + c!;
      const hi = b === undefined ? a! * d! : b + d!;
      const range = task.ranges.findIndex(pair => pair[0] === lo && pair[1] === hi);
      const comparison = task.proposed < lo ? 'short' : task.proposed > hi ? 'surplus' : 'fits';
      coverage.add(comparison);
      expect(checkProblemWorkbench(task, { kind, mode: 'estimate', range, comparison }).ok).toBe(true);
      expect(checkProblemWorkbench(task, { kind, mode: 'estimate', range: (range + 1) % 3, comparison }).ok).toBe(false);
    }
    expect(coverage).toEqual(new Set(['short', 'fits', 'surplus']));
  });

  it('requires repairing the first flawed step even when the end of the chain happens to be right', () => {
    for (let seed = 0; seed < 18; seed++) {
      const { task, tag } = spec('M-PS-06').item(rng(seed), seed % 3 ? 'independent' : 'transfer');
      if (task.mode !== 'repair') throw new Error('Expected a chain');
      const [a, b] = integers(task.givens[0]!.value);
      const groups = tag === 'repair-equal-groups';
      const value = groups ? a! * b! : a! - b!;
      const sign = groups ? '×' : '−';
      const first = groups ? 2 : 1;
      if (tag === 'transfer') expect(integers(task.chain.at(-1)!).at(-1)).toBe(value);
      expect(checkProblemWorkbench(task, { kind, mode: 'repair', step: first, sign, value }).ok).toBe(true);
      expect(checkProblemWorkbench(task, { kind, mode: 'repair', step: 0, sign, value }).ok).toBe(false);
      expect(checkProblemWorkbench(task, { kind, mode: 'repair', step: first, sign: '+', value }).ok).toBe(false);
    }
  });

  it('assesses part mappings independently of mark placement and accepts swapped group order', () => {
    for (const id of ['M-REP-01', 'M-REP-02']) {
      for (let seed = 0; seed < 18; seed++) {
        const { task, tag } = spec(id).item(rng(seed), seed % 3 ? 'independent' : 'transfer');
        if (task.mode !== 'represent') throw new Error('Expected a drawing or objects');
        const [a, b] = integers(task.givens[0]!.value);
        const parts = b === undefined ? [a! / 2, a! / 2] : [a!, b];
        const groups = parts.map((marks, part) => ({ part, marks }));
        expect(checkProblemWorkbench(task, { kind, mode: 'represent', groups: [...groups].reverse() }).ok).toBe(true);
        expect(checkProblemWorkbench(task, { kind, mode: 'represent', groups: [{ ...groups[0]!, part: 1 }, groups[1]!] }).ok).toBe(false);
        expect(checkProblemWorkbench(task, { kind, mode: 'represent', groups: [{ ...groups[0]!, marks: 0 }, groups[1]!] }).ok).toBe(false);
        if (tag === 'transfer') expect(task.medium).toBe(id === 'M-REP-01' ? 'tile' : 'square');
      }
    }
  });
});
