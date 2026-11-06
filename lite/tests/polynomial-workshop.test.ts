import { describe, expect, it } from 'vitest';
import { polynomialWorkshopEvidence, polynomialWorkshopSpecs, type PolynomialWorkshopItem } from '../src/content/polynomial-workshop';
import { checkWorkshopPolynomial, type WorkshopTerm } from '../src/content/models/polynomial-workshop';
import { check, solution, wrongs } from '../src/engine/check';
import { rng } from '../src/engine/rng';
import type { Paint, Phase } from '../src/engine/types';

const ids = [
  'M79-EXPR-SIMPLIFY', 'M79-POLY-CONCEPT', 'M79-TERM-01', 'M79-POLY-01', 'M79-POLY-ADD',
  'M79-POLY-MUL-MONO', 'M79-POLY-MUL', 'M79-POLY-SUBTRACT', 'M79-SIGN-PARENS', 'M79-POLY-SUB',
] as const;
type Id = typeof ids[number];
const specFor = (id: Id) => polynomialWorkshopSpecs.find((spec) => spec.id === id)!;
const get = (id: Id, seed: number, phase: Phase) => specFor(id).item(rng(seed), phase) as PolynomialWorkshopItem;
const render = (paint: Paint) => {
  const host = { innerHTML: '' } as HTMLElement;
  paint(host);
  return host.innerHTML;
};

type Coefficients = [number, number, number, number];
function coefficients(terms: readonly WorkshopTerm[]): Coefficients {
  return [0, 1, 2, 3].map(power => terms.filter(part => part.power === power).reduce((sum, part) => sum + part.coefficient, 0)) as Coefficients;
}

const powers = ['', '', '²', '³'];
function termsFor(entries: readonly { coefficient: number; power: number }[], variable: string) {
  let expression = '';
  for (const { coefficient, power } of entries) {
    const n = Math.abs(coefficient);
    const prefix = coefficient < 0 ? '−' : expression ? '+' : '';
    expression += prefix + (power === 0 ? n : (n === 1 ? '' : String(n)) + variable + powers[power]);
  }
  return expression || '0';
}
function statement(vector: Coefficients, variable: string) {
  return termsFor(vector.flatMap((coefficient, power) => coefficient ? [{ coefficient, power }] : []), variable);
}

function convolution(a: Coefficients, b: Coefficients): Coefficients {
  return [0, 1, 2, 3].map(k => a.reduce((sum, coefficient, i) => sum + (i > k ? 0 : coefficient * b[k - i]!), 0)) as Coefficients;
}

describe('Muuttujien telakka', () => {
  it('exports exactly ten individually versioned specs and evidence limits', () => {
    expect(polynomialWorkshopSpecs.map(({ id }) => id)).toEqual(ids);
    expect(Object.keys(polynomialWorkshopEvidence)).toEqual(ids);
    expect(new Set(polynomialWorkshopSpecs.map(({ rev }) => rev)).size).toBe(ids.length);
    for (const spec of polynomialWorkshopSpecs) {
      expect(spec.validRevs).toEqual([spec.rev]);
      expect(spec.demo(rng(7)).every(step => step.say && step.scene)).toBe(true);
      expect(polynomialWorkshopEvidence[spec.id]?.limit).toBeTruthy();
    }
  });

  it.each(ids)('%s deterministically covers both families and a transfer', (id) => {
    const seen = new Set<string>();
    for (const phase of ['guided', 'independent', 'transfer', 'retrieval'] as const) {
      for (let seed = 0; seed < 32; seed++) {
        const item = get(id, seed, phase);
        const same = get(id, seed, phase);
        expect(item.task).toEqual(same.task);
        expect(item.polynomialWorkshopModel).toEqual(same.polynomialWorkshopModel);
        expect(check(item.task, solution(item.task)).ok).toBe(true);
        for (const wrong of wrongs(item.task)) expect(check(item.task, wrong).ok).toBe(false);
        if (phase === 'independent') seen.add(item.tag);
        if (phase === 'transfer') {
          expect(item.tag).toBe('transfer');
          expect(item.polynomialWorkshopModel.variable).not.toBe('x');
        }
      }
    }
    expect([...seen].sort()).toEqual([...polynomialWorkshopEvidence[id]!.families].sort());
  });

  it('checks every generated expression against coefficient or convolution oracles', () => {
    for (const id of ids) {
      for (const phase of ['independent', 'transfer'] as const) {
        for (let seed = 0; seed < 64; seed++) {
          const { task, polynomialWorkshopModel: { rows, variable } } = get(id, seed, phase);
          if (task.kind !== 'build') continue;
          const [a, b] = rows.map(row => coefficients(row.terms));
          let vector: Coefficients;
          if (id === 'M79-POLY-MUL' || id === 'M79-POLY-MUL-MONO') vector = convolution(a!, b!);
          else if (id === 'M79-POLY-SUB' || id === 'M79-POLY-SUBTRACT') vector = a!.map((n, i) => n - b![i]!) as Coefficients;
          else if (id === 'M79-POLY-ADD') vector = a!.map((n, i) => n + b![i]!) as Coefficients;
          else if (id === 'M79-SIGN-PARENS') vector = a!.map(n => -n) as Coefficients;
          else vector = a!;
          const expected = statement(vector, variable);
          if (id === 'M79-POLY-MUL' || id === 'M79-POLY-SUB') {
            // Reversed factor/term iteration differs from the authored target order.
            const expanded = id === 'M79-POLY-MUL' ? rows[1]!.terms.flatMap(right => rows[0]!.terms.map(left => ({
              coefficient: left.coefficient * right.coefficient, power: left.power + right.power,
            }))) : [...rows[1]!.terms.map(entry => ({ ...entry, coefficient: -entry.coefficient })), ...rows[0]!.terms];
            expect(check(task, { kind: 'build', seq: [termsFor(expanded, variable), '→', expected] }).ok).toBe(true);
            expect(check(task, { kind: 'build', seq: [expected] })).toMatchObject({ ok: false, math: true, proc: false });
            expect(check(task, { kind: 'build', seq: [termsFor(expanded.slice(1), variable), '→', expected] }).ok).toBe(false);
          } else {
            expect(check(task, { kind: 'build', seq: [expected] }).ok).toBe(true);
          }
        }
      }
    }
  });

  it('distinguishes value from collected form and preserves zero after cancellation', () => {
    const judge = (expected: string, answer: string) => checkWorkshopPolynomial('collected', expected, answer);
    expect(judge('2x+3', '5x').ok).toBe(false);
    expect(judge('2x+3', '3+2x').ok).toBe(true);
    expect(judge('2x+3', 'x+x+3')).toMatchObject({ ok: false, math: true, proc: false });
    expect(judge('x²−3x+1', '1−3x+x^2').ok).toBe(true);
    expect(judge('x²−3x+1', '1−3x+x^4').ok).toBe(false);
    expect(judge('0', '0').ok).toBe(true);
    expect(judge('0', 'x²−x²')).toMatchObject({ ok: false, math: true, proc: false });
    expect(judge('0', '0x')).toMatchObject({ ok: false, math: true, proc: false });
    for (const malformed of ['x²+','x²+²','x²/1','(x²)','Infinity','9007199254740993x','x+x=2x']) {
      expect(judge('x²', malformed).ok).toBe(false);
    }
  });

  it('requires both cross terms even when their sum cancels', () => {
    const target = 'x²−2x+2x−4 → x²−4';
    const checkBoth = (answer: string) => checkWorkshopPolynomial('expanded-then-collected', target, answer);
    expect(checkBoth('−4+2x+x²−2x → −4+x²').ok).toBe(true);
    expect(checkBoth('x²−4 → x²−4')).toMatchObject({ ok: false, math: true, proc: false });
    expect(checkBoth('x²+2x+2x−4 → x²−4').ok).toBe(false);
    expect(checkBoth('x²−2x+2x−4 → x²−2x+2x−4')).toMatchObject({ ok: false, math: true, proc: false });
    expect(checkWorkshopPolynomial('expanded', '−2x²+3x−4', '−2x²−3x+4').ok).toBe(false);
    expect(checkWorkshopPolynomial('expanded', '−2x²+3x−4', '3x−4−2x²').ok).toBe(true);
  });

  it('requires term labels and whole-structure explanation in both integration families', () => {
    for (const phase of ['independent', 'transfer'] as const) {
      for (let seed = 0; seed < 40; seed++) {
        const { task, polynomialWorkshopModel } = get('M79-POLY-01', seed, phase);
        if (task.kind !== 'place') throw new Error('Expected term and structure placement');
        expect(task.answer).toEqual({ power: 'power-ok', constant: 'constant-ok', rule: 'rule-ok' });
        expect(check(task, { kind: 'place', map: { ...task.answer, power: 'power-wrong' } }).ok).toBe(false);
        expect(check(task, { kind: 'place', map: { ...task.answer, rule: 'rule-wrong' } }).ok).toBe(false);
        if (phase === 'transfer') {
          expect(polynomialWorkshopModel.rows[0]!.terms[0]!.power).toBe(0);
          expect(polynomialWorkshopModel.rows[0]!.terms[1]!.coefficient).toBe(0);
        }
      }
    }
  });

  it('keeps the givens on the completed drawing, including the two sample checks', () => {
    const item = get('M79-EXPR-SIMPLIFY', 1, 'independent');
    const art = render(item.afterCorrect!);
    expect(art).toContain('Alkuperäinen piirustus');
    expect(art).toContain('Valmis rivi');
    expect(art).toContain('Kaksi kokeilua');
    const product = get('M79-POLY-MUL', 1, 'transfer');
    const ready = render(product.afterCorrect!);
    expect(ready).toContain('Kertoja A');
    expect(ready).toContain('Kerrottava B');
    expect(ready).toContain('Avattu rivi');
  });
});
