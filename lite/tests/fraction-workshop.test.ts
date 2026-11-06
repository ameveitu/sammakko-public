import { describe, expect, it } from 'vitest';
import { fractionWorkshopEvidence, fractionWorkshopSpecs, type FractionWorkshopItem } from '../src/content/fraction-workshop';
import { subtractionPartition, type Fraction } from '../src/content/models/fraction-workshop';
import { check, solution, wrongs } from '../src/engine/check';
import { rng } from '../src/engine/rng';
import type { Paint, Phase, Task } from '../src/engine/types';

const ids = ['M-FRAC-04', 'M-FRAC-07', 'M-FRAC-09', 'M-FRAC-10', 'M-FRAC-14'] as const;
const specFor = (id: typeof ids[number]) => fractionWorkshopSpecs.find((spec) => spec.id === id)!;
const get = (id: typeof ids[number], seed: number, phase: Phase) => specFor(id).item(rng(seed), phase) as FractionWorkshopItem;
const make = (task: Task, seq: string[]) => check(task, { kind: 'build', seq });
const write = ({ n, d }: Fraction) => [...String(n), '/', ...String(d)];
const relation = (a: number, b: number) => a < b ? '<' : a > b ? '>' : '=';
const render = (scene: Paint) => {
  const host = { innerHTML: '' } as HTMLElement;
  scene(host);
  return host.innerHTML;
};

describe('Fraction workshop', () => {
  it('exposes exactly the five revised new specs with their own evidence boundaries', () => {
    expect(fractionWorkshopSpecs.map(({ id }) => id)).toEqual(ids);
    expect(Object.keys(fractionWorkshopEvidence)).toEqual(ids);
    expect(new Set(fractionWorkshopSpecs.map(({ rev }) => rev)).size).toBe(ids.length);
    for (const spec of fractionWorkshopSpecs) {
      expect(spec.validRevs).toEqual([spec.rev]);
      expect(spec.intro && spec.goal && spec.reward).toBeTruthy();
      expect(spec.demo(rng(10)).every((step) => step.say && step.scene)).toBe(true);
      expect(fractionWorkshopEvidence[spec.id]!.limit).toBeTruthy();
    }
  });

  it.each(ids)('%s generates deterministic and independently checkable task families', (id) => {
    const observed = new Set<string>();
    for (const phase of ['guided', 'independent', 'transfer', 'retrieval'] as const) {
      for (let seed = 0; seed < 32; seed++) {
        const item = get(id, seed, phase);
        const same = get(id, seed, phase);
        expect(item.task).toEqual(same.task);
        expect(item.fractionWorkshopModel).toEqual(same.fractionWorkshopModel);
        expect(item.say && item.explain && item.hint).toBeTruthy();
        expect(check(item.task, solution(item.task)).ok).toBe(true);
        for (const wrong of wrongs(item.task)) expect(check(item.task, wrong).ok).toBe(false);
        if (phase === 'independent') observed.add(item.tag);
        if (phase === 'transfer') {
          expect(item.tag).toBe('transfer');
          expect(item.fractionWorkshopModel.surface).toBe('rope');
        }
      }
    }
    expect([...observed].sort()).toEqual([...fractionWorkshopEvidence[id]!.families].sort());
  });

  it('aligns every integer interval with denominator ticks and checks points above one', () => {
    for (const phase of ['independent', 'transfer'] as const) {
      for (let seed = 0; seed < 36; seed++) {
        const { task, tag, fractionWorkshopModel: model } = get('M-FRAC-04', seed, phase);
        if (task.kind !== 'line' || model.kind !== 'fraction-line') throw new Error('Expected exact line');
        const { n, d } = model.amount;
        expect(task.step * d).toBeCloseTo(1, 10);
        expect((task.max - task.min) / task.step).toBeCloseTo((task.max - task.min) * d, 10);
        const rightTick = n - task.min * d;
        const widgetValue = Math.round((task.min + rightTick * task.step) * 1e6) / 1e6;
        expect(check(task, { kind: 'line', value: widgetValue }).ok).toBe(true);
        if (tag === 'line-across-one') {
          expect(widgetValue).toBeGreaterThan(1);
          expect(check(task, { kind: 'line', value: (n % d) / d }).why).toContain('kokonaiset');
        }
        if (tag === 'line-within-one') {
          expect(check(task, { kind: 'line', value: widgetValue * task.max }).why).toContain('yksikköväli');
        }
        if (phase === 'transfer') expect(task.min).toBe(1);
      }
    }
  });

  it('requires both expanded numbers and keeps the same filled length', () => {
    for (const phase of ['independent', 'transfer'] as const) {
      for (let seed = 0; seed < 36; seed++) {
        const { task, fractionWorkshopModel: model } = get('M-FRAC-07', seed, phase);
        if (model.kind !== 'fraction-expand') throw new Error('Expected expansion');
        const { n, d } = model.amount;
        const k = model.factor;
        expect(make(task, write({ n: n * k, d: d * k })).ok).toBe(true);
        expect(make(task, write({ n, d: d * k })).why).toContain('siniset');
        expect(make(task, write({ n: n * k, d })).ok).toBe(false);
      }
    }
    const scene = render(specFor('M-FRAC-07').demo(rng(1))[1]!.scene);
    const widths = [...scene.matchAll(/width="([\d.]+)" height="20" fill="#41949e"/g)].map((m) => Number(m[1]));
    expect(widths).toHaveLength(2);
    expect(widths[0]).toBe(widths[1]);
    expect(scene).toContain('stroke-dasharray');
  });

  it('builds a benchmark chain or common comparison, including equality in a shared partition', () => {
    let seenEquality = false;
    for (const phase of ['independent', 'transfer'] as const) {
      for (let seed = 0; seed < 36; seed++) {
        const { task, fractionWorkshopModel: model } = get('M-FRAC-09', seed, phase);
        if (model.kind !== 'fraction-compare') throw new Error('Expected comparison');
        const { left, right, common } = model;
        if (model.method === 'half') {
          const a = relation(2 * left.n, left.d);
          const b = relation(right.d, 2 * right.n);
          expect(make(task, ['A', a, '1/2', b, 'B']).ok).toBe(true);
          expect(make(task, ['A', a === '<' ? '>' : '<', '1/2', b, 'B']).ok).toBe(false);
        } else {
          const a = left.n * (common! / left.d);
          const b = right.n * (common! / right.d);
          expect(Number.isInteger(a) && Number.isInteger(b)).toBe(true);
          const sign = relation(left.n * right.d, right.n * left.d);
          seenEquality ||= sign === '=';
          const pair = [...write({ n: a, d: common! }), sign, ...write({ n: b, d: common! })];
          expect(make(task, pair).ok).toBe(true);
          expect(make(task, [...write(left), sign, ...write(right)]).ok).toBe(false);
        }
      }
    }
    expect(seenEquality).toBe(true);
  });

  it('conserves the number of equal parts in both mixed-number directions', () => {
    for (const phase of ['independent', 'transfer'] as const) {
      for (let seed = 0; seed < 36; seed++) {
        const { task, fractionWorkshopModel: model } = get('M-FRAC-10', seed, phase);
        if (model.kind !== 'fraction-mixed') throw new Error('Expected mixed fraction');
        if (model.direction === 'to-improper') {
          const count = model.whole * model.part.d + model.part.n;
          expect(count).toBeGreaterThan(model.part.d);
          expect(make(task, write({ n: count, d: model.part.d })).ok).toBe(true);
          expect(make(task, write({ n: model.whole + model.part.n, d: model.part.d })).why).toContain('Kokonainen');
        } else {
          expect(model.amount.n).toBeGreaterThan(model.amount.d);
          let remainder = model.amount.n;
          let groups = 0;
          while (remainder >= model.amount.d) { remainder -= model.amount.d; groups++; }
          expect(make(task, [...String(groups), '+', ...write({ n: remainder, d: model.amount.d })]).ok).toBe(true);
          expect(make(task, [...String(groups), '+', ...write(model.amount)]).ok).toBe(false);
        }
      }
    }
  });

  it('validates the shared partition and residual separately, including nonminimal and zero answers', () => {
    let seenZero = false;
    for (const phase of ['independent', 'transfer'] as const) {
      for (let seed = 0; seed < 48; seed++) {
        const { task } = get('M-FRAC-14', seed, phase);
        if (task.kind !== 'fraction-subtract') throw new Error('Expected subtraction workbench');
        const [a, b, c, d] = [task.left.n, task.left.d, task.right.n, task.right.d];
        const product = b * d;
        const numerator = a * d - c * b;
        expect(numerator).toBeGreaterThanOrEqual(0);
        seenZero ||= numerator === 0;
        const common = 3 * product;
        const response = { kind: 'fraction-subtract', common, n: 3 * numerator, d: common } as const;
        expect(check(task, response).ok).toBe(true);
        expect(check(task, { ...response, n: numerator, d: product }).ok).toBe(true);
        expect(check(task, { ...response, common: common + 1 }).why).toContain('jaollinen');
        expect(check(task, { ...response, common: Number.MAX_SAFE_INTEGER + 1 }).ok).toBe(false);
        expect(check(task, { ...response, n: 3 * numerator + 1 }).why).toContain('nimittäjä säilyy');
        const partition = subtractionPartition(task, common);
        expect(partition.removed + partition.remaining).toBe(partition.starting);
        expect(partition.remaining).toBe(3 * numerator);
      }
    }
    expect(seenZero).toBe(true);
  });
});
