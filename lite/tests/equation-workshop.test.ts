import { describe, expect, it } from 'vitest';
import { equationWorkshopEvidence, equationWorkshopSpecs } from '../src/content/equation-workshop';
import { checkEquationWorkshop, type EquationWorkshopResponse, type InequalityTask, type SquareRootsTask } from '../src/content/models/equation-workshop';
import { check, solution, wrongs } from '../src/engine/check';
import { rng } from '../src/engine/rng';
import type { Paint, Phase } from '../src/engine/types';

const ids = ['M79-EQ1-CHECK', 'M79-INEQ-01', 'M79-INEQ-SOLVE', 'M79-QUAD-INCOMP-01', 'M79-QUAD-INCOMP-02'] as const;
type Id = typeof ids[number];
const spec = (id: Id) => equationWorkshopSpecs.find(node => node.id === id)!;
const item = (id: Id, seed: number, phase: Phase) => spec(id).item(rng(seed), phase);
const render = (paint: Paint) => {
  const host = { innerHTML: '' } as HTMLElement;
  paint(host);
  return host.innerHTML;
};
function compare(a: number, relation: InequalityTask['relation'], b: number) {
  return relation === '<' ? a < b : relation === '≤' ? a <= b : relation === '>' ? a > b : a >= b;
}
function rootTask(radicand: number): SquareRootsTask {
  return { kind: 'equation-workshop', activity: 'square-roots', radicand, context: 'abstract' };
}
const roots = (radicand: number, values: string[], principal: string | null) => checkEquationWorkshop(rootTask(radicand), {
  kind: 'equation-workshop', activity: 'square-roots', roots: values, principal,
});
function readQuadratic(source: string) {
  const vector = [0, 0, 0];
  for (const [, sign, coefficient, power] of source.replace(/\s+/g, '').matchAll(/([+−]?)(\d*)(x²|x)?/gu)) {
    if (!coefficient && !power) continue;
    const i = power === 'x²' ? 0 : power === 'x' ? 1 : 2;
    vector[i]! += Number(coefficient || 1) * (sign === '−' ? -1 : 1);
  }
  return vector;
}

describe('Tasapainon sulku', () => {
  it('exports five versioned skills and honest evidence boundaries', () => {
    expect(equationWorkshopSpecs.map(({ id }) => id)).toEqual(ids);
    expect(Object.keys(equationWorkshopEvidence)).toEqual(ids);
    expect(new Set(equationWorkshopSpecs.map(({ rev }) => rev)).size).toBe(ids.length);
    for (const node of equationWorkshopSpecs) {
      expect(node.validRevs).toEqual([node.rev]);
      expect(equationWorkshopEvidence[node.id]?.limit).toBeTruthy();
      for (const demo of node.demo(rng(10))) expect(render(demo.scene)).toContain('equation-workshop');
    }
  });

  it.each(ids)('%s generates deterministic, checkable families and transfer', (id) => {
    const seen = new Set<string>();
    for (const phase of ['guided', 'independent', 'transfer', 'retrieval'] as const) {
      for (let seed = 0; seed < 32; seed++) {
        const task = item(id, seed, phase);
        expect(task.task).toEqual(item(id, seed, phase).task);
        expect(check(task.task, solution(task.task)).ok).toBe(true);
        for (const response of wrongs(task.task)) expect(check(task.task, response).ok).toBe(false);
        if (phase === 'independent') seen.add(task.tag);
        if (phase === 'transfer') expect(task.tag).toBe('transfer');
      }
    }
    expect([...seen].sort()).toEqual([...equationWorkshopEvidence[id]!.families].sort());
  });

  it('computes each substitution side, rejecting a correct same/different guess with a wrong side', () => {
    const cases = new Set<boolean>();
    for (const phase of ['independent', 'transfer'] as const) {
      for (let seed = 0; seed < 64; seed++) {
        const { task } = item('M79-EQ1-CHECK', seed, phase);
        if (task.kind !== 'equation-workshop' || task.activity !== 'substitute') throw new Error('Expected both sides');
        const left = task.left.b + task.candidate * task.left.a;
        const right = task.right.b + task.candidate * task.right.a;
        const response = { kind: task.kind, activity: task.activity, left, right, equal: left === right } as const;
        cases.add(response.equal);
        expect(check(task, response).ok).toBe(true);
        expect(check(task, { ...response, right: right + 1 }).why).toContain('kumpaankin');
        expect(check(task, { ...response, equal: left !== right }).why).toContain('yhtä suuret');
      }
    }
    expect(cases).toEqual(new Set([true, false]));
  });

  it('checks the complete inequality set against direct substitution and the physical domain', () => {
    const cases = new Set<string>();
    for (const id of ['M79-INEQ-01', 'M79-INEQ-SOLVE'] as const) {
      for (const phase of ['independent', 'transfer'] as const) {
        for (let seed = 0; seed < 64; seed++) {
          const { task } = item(id, seed, phase);
          if (task.kind !== 'equation-workshop' || (task.activity !== 'inequality-solve' && task.activity !== 'inequality-interpret')) throw new Error('Expected inequality');
          const { left, relation, right, domain } = task;
          const valid = (x: number) => (domain === 'real' || x >= 0) && compare(left.a * x + left.b, relation, right);
          const boundary = Array.from({ length: 21 }, (_, i) => i - 10).find(x => x * left.a + left.b === right)!;
          const direction = valid(boundary + .125) ? 'higher' : 'lower';
          const inclusive = valid(boundary);
          cases.add(`${left.a < 0}:${inclusive}`);
          const answer: EquationWorkshopResponse = task.activity === 'inequality-solve'
            ? { kind: task.kind, activity: task.activity, boundary, direction, inclusive, divisor: left.a }
            : { kind: task.kind, activity: task.activity, boundary, direction, inclusive, members: task.samples.map(valid) };
          expect(check(task, answer).ok).toBe(true);
          for (let x = -8; x <= 8; x += .25) {
            const inDomain = domain === 'real' || x >= 0;
            expect(inDomain && (x === boundary ? inclusive : direction === 'higher' ? x > boundary : x < boundary)).toBe(valid(x));
          }
          if (answer.activity === 'inequality-interpret' && domain === 'nonnegative') {
            expect(valid(-1)).toBe(false);
            expect(check(task, { ...answer, members: answer.members.map((v, i) => i === 0 ? true : v) }).ok).toBe(false);
          }
          if (answer.activity === 'inequality-solve' && left.a < 0) {
            expect(check(task, { ...answer, direction: direction === 'higher' ? 'lower' : 'higher' }).why).toContain('kääntää');
          }
          if (id === 'M79-INEQ-SOLVE' && phase === 'transfer') expect(inclusive).toBe(true);
        }
      }
    }
    expect(cases).toEqual(new Set(['true:true', 'true:false', 'false:true', 'false:false']));
  });

  it('identifies incomplete equations after moving right-side terms and excludes linear cases', () => {
    let canceledSquare = false;
    for (const phase of ['independent', 'transfer'] as const) {
      for (let seed = 0; seed < 32; seed++) {
        const sample = item('M79-QUAD-INCOMP-01', seed, phase);
        const display = render(sample.scene!);
        const rows = [...display.matchAll(/<tr><td>[A-D]<\/td><td>(.*?)<\/td><\/tr>/g)].map(match => match[1]!);
        expect(rows).toHaveLength(4);
        const expected = rows.flatMap((source, index) => {
          const [a, b] = source.split(' = ').map(readQuadratic);
          const quadratic = a![0]! !== b![0]!;
          if (!quadratic && a![0] !== 0) canceledSquare = true;
          return quadratic && (a![1] === b![1] || a![2] === b![2]) ? [index] : [];
        });
        expect(check(sample.task, { kind: 'multi', indices: expected }).ok).toBe(true);
        expect(render(sample.afterCorrect!)).toContain('Nollamuoto');
      }
    }
    expect(canceledSquare).toBe(true);
  });

  it('accepts exact equivalent radicals and both orders, with one root at zero and no real negative square', () => {
    expect(roots(8, ['−2√2', 'sqrt(8)'], '2√(2)').ok).toBe(true);
    expect(roots(8, ['√8', '-sqrt(8)'], '√8').ok).toBe(true);
    expect(roots(8, ['√8', '2√2'], '√8').ok).toBe(false);
    expect(roots(8, ['−√8', '√8'], '−√8').why).toContain('pääarvoa');
    expect(roots(8, ['−2.828', '2.828'], '√8').ok).toBe(false);
    for (const malformed of ['√(8', '√8)', 'sqrt(8', '8/2', '√−8', 'NaN', '2^^2']) {
      expect(roots(8, ['−√8', malformed], '√8').ok).toBe(false);
    }
    expect(roots(9, ['3', '-3'], '3').ok).toBe(true);
    expect(roots(0, ['-0'], '0').ok).toBe(true);
    expect(roots(0, ['-0', '0'], '0').ok).toBe(false);
    expect(roots(-4, [], null).ok).toBe(true);
    expect(roots(-4, ['−2'], null).ok).toBe(false);
    expect(roots(-4, [], '0').ok).toBe(false);
  });
});
