import { describe, expect, it } from 'vitest';
import { revisedQuantityEvidence, revisedQuantitySpecs, type RevisedQuantityItem } from '../src/content/revised-quantity';
import { baseOf, fractionShare, levelValues, percentChange, percentOf } from '../src/content/models/quantity';
import { check, solution, wrongs } from '../src/engine/check';
import { rng } from '../src/engine/rng';
import type { Paint, Phase } from '../src/engine/types';

const ids = [
  'M-FRAC-16', 'M-STAT-04', 'M79-PCT-REFBASE', 'M79-PCT-SHARE', 'M79-PCT-AMOUNT',
  'M79-PCT-BASE', 'M79-PCT-CHANGE', 'M79-PCT-COMP', 'M79-PCT-PP',
] as const;
const byId = (id: typeof ids[number]) => revisedQuantitySpecs.find((spec) => spec.id === id)!;
const get = (id: typeof ids[number], seed: number, phase: Phase) => byId(id).item(rng(seed), phase) as RevisedQuantityItem;
const render = (scene: Paint) => {
  const host = { innerHTML: '' } as HTMLElement;
  scene(host);
  return host.innerHTML;
};
const phases: Phase[] = ['guided', 'independent', 'transfer', 'retrieval'];

describe('Revised quantity workbenches', () => {
  it('exports the nine source IDs with independent revisions and declared evidence boundaries', () => {
    expect(revisedQuantitySpecs.map(({ id }) => id)).toEqual(ids);
    expect(Object.keys(revisedQuantityEvidence)).toEqual(ids);
    expect(new Set(revisedQuantitySpecs.map(({ rev }) => rev)).size).toBe(ids.length);
    for (const spec of revisedQuantitySpecs) {
      expect(spec.validRevs).toEqual([spec.rev]);
      expect(spec.intro && spec.goal && spec.reward).toBeTruthy();
      expect(spec.demo(rng(1)).every((step) => step.say && render(step.scene).includes('quantity-workbench'))).toBe(true);
      expect(revisedQuantityEvidence[spec.id]!.limit).toBeTruthy();
    }
  });

  it.each(ids)('%s generates repeatable practice and a distinct transfer representation', (id) => {
    const seen = new Set<string>();
    for (const phase of phases) {
      for (let seed = 0; seed < 48; seed++) {
        const item = get(id, seed, phase);
        const same = get(id, seed, phase);
        expect(item.task).toEqual(same.task);
        expect(item.quantityModel).toEqual(same.quantityModel);
        expect(item.say && item.hint && item.explain).toBeTruthy();
        expect(check(item.task, solution(item.task)).ok).toBe(true);
        for (const wrong of wrongs(item.task)) expect(check(item.task, wrong).ok).toBe(false);
        if (item.task.kind === 'choice') {
          for (const wrong of wrongs(item.task)) expect(check(item.task, wrong).why).toBeTruthy();
        }
        if (phase === 'independent') seen.add(item.tag);
        if (phase === 'transfer') expect(item.tag).toBe('transfer');
        const visual = render(item.scene!);
        expect(visual).toContain('quantity-workbench');
        expect(visual).toContain('<table');
        if (item.quantityModel.kind === 'quantity-board') {
          expect(visual).toContain('100 %:');
          const other = get(id, seed, 'independent').quantityModel;
          if (phase === 'transfer' && other.kind === 'quantity-board') expect(item.quantityModel.view).not.toBe(other.view);
        }
      }
    }
    expect([...seen].sort()).toEqual([...revisedQuantityEvidence[id]!.families].sort());
  });

  it('divides against the unchanged whole and accepts a valid unsimplified fraction', () => {
    for (const phase of ['independent', 'transfer'] as const) {
      for (let seed = 0; seed < 40; seed++) {
        const { quantityModel: model, task } = get('M-FRAC-16', seed, phase);
        if (model.kind !== 'fraction-split' || task.kind !== 'frac') throw new Error('Expected fractional task');
        expect(model.shape).toBe(phase === 'transfer' ? 'strip' : 'cake');
        expect(model.recipients * model.d * task.n).toBe(model.n * task.d);
        expect(check(task, { kind: 'frac', n: model.n * 2, d: model.d * model.recipients * 2 }).ok).toBe(true);
        expect(check(task, { kind: 'frac', n: 1, d: model.recipients }).ok).toBe(false);
      }
    }
    expect(fractionShare({ kind: 'fraction-split', shape: 'strip', n: 7, d: 4, recipients: 1 })).toEqual({ n: 7, d: 4 });
    expect(() => fractionShare({ kind: 'fraction-split', shape: 'cake', n: 1, d: 2, recipients: 0 })).toThrow();
  });

  it('preserves total and sample count, using cuttable lengths for fractional means', () => {
    for (const phase of ['independent', 'transfer'] as const) {
      for (let seed = 0; seed < 40; seed++) {
        const { quantityModel: model, task } = get('M-STAT-04', seed, phase);
        if (model.kind !== 'equal-level') throw new Error('Expected equal-level model');
        const total = model.values.reduce((sum, n) => sum + n, 0);
        const level = levelValues(model);
        expect(level.value * model.values.length).toBe(total);
        if (phase === 'transfer') {
          expect(model.material).toBe('strips');
          expect(task).toMatchObject({ kind: 'numeric', unit: 'cm', answer: total / 2 });
          expect(Number.isInteger(level.value)).toBe(false);
          expect(model.values).not.toContain(level.value);
        } else {
          expect(model.material).toBe('blocks');
          expect(Number.isInteger(level.value)).toBe(true);
        }
      }
    }
    const demo = byId('M-STAT-04').demo(rng(0)).map((step) => render(step.scene));
    expect(demo[1]).toContain('Haamut näyttävät alkuperäisen');
    expect(demo[2]).toContain('12,5 cm');
    expect(() => levelValues({ kind: 'equal-level', values: [2, 3], material: 'blocks' })).toThrow();
  });

  it('calculates the named part, amount, and unknown whole from independent integer relationships', () => {
    for (let seed = 0; seed < 60; seed++) {
      for (const id of ['M79-PCT-SHARE', 'M79-PCT-AMOUNT', 'M79-PCT-BASE'] as const) {
        for (const phase of ['independent', 'transfer'] as const) {
          const { quantityModel: model, task, tag } = get(id, seed, phase);
          if (model.kind !== 'quantity-board') throw new Error('Expected quantity board');
          const [whole, part] = model.rows;
          if (id === 'M79-PCT-SHARE') {
            const counted = model.rows.slice(1).reduce((n, row) => n + row.amount!, 0);
            if (task.kind !== 'numeric') throw new Error('Expected numeric share');
            expect(task.answer * whole!.amount!).toBe(100 * counted);
          } else if (id === 'M79-PCT-AMOUNT') {
            const ratio = tag === 'amount-remaining' ? 100 - model.givenPercent! : model.givenPercent!;
            const amount = whole!.amount! * ratio / 100;
            if (task.kind === 'build') {
              const digits = Array.from(String(amount));
              expect(check(task, { kind: 'build', seq: [...digits, 'm²'] }).ok).toBe(true);
              expect(check(task, { kind: 'build', seq: [...digits, 'm'] }).why).toContain('pituutta');
            } else {
              expect(task).toMatchObject({ kind: 'numeric', answer: amount, unit: 'palaa' });
            }
          } else {
            const ratio = tag === 'base-from-reservation' ? model.givenPercent! : 100 - model.givenPercent!;
            expect(whole!.amount).toBeNull();
            expect(ratio).toBeGreaterThan(0);
            if (task.kind !== 'numeric') throw new Error('Expected numeric base');
            expect(task.answer * ratio).toBe(part!.amount! * 100);
            expect(whole!.extent).toBeUndefined();
          }
        }
      }
    }
    expect(() => percentOf(10, 0)).toThrow();
    expect(() => percentChange(0, 10)).toThrow();
    expect(() => baseOf(0, 0)).toThrow();
  });

  it('reverses the percentage reference and checks signed change without confusing direction', () => {
    const changes = new Set<number>();
    for (let seed = 0; seed < 60; seed++) {
      for (const id of ['M79-PCT-CHANGE', 'M79-PCT-COMP'] as const) {
        for (const phase of ['independent', 'transfer'] as const) {
          const { quantityModel: model, task, tag } = get(id, seed, phase);
          if (model.kind !== 'quantity-board' || task.kind !== 'numeric') throw new Error('Expected numeric comparison');
          const [first, second] = model.rows;
          const delta = second!.amount! - first!.amount!;
          const reference = model.rows.find((row) => row.base)!.amount!;
          expect(reference).toBeGreaterThan(0);
          expect(task.answer * reference).toBeCloseTo(100 * delta, 10);
          if (id === 'M79-PCT-CHANGE') {
            expect(reference).toBe(first!.amount);
            expect(Math.sign(task.answer)).toBe(Math.sign(delta));
            if (phase === 'transfer') expect(task.answer).toBeLessThan(0);
            changes.add(task.answer);
          } else {
            expect(reference).toBe(tag === 'compare-larger' ? first!.amount : second!.amount);
            expect(task.answer).toBeGreaterThan(0);
          }
        }
      }
    }
    expect(changes.size).toBeGreaterThan(5);
  });

  it('keeps the plan fixed at 100 tiles, and requires both units in percentage-point transfer', () => {
    for (let seed = 0; seed < 40; seed++) {
      const { quantityModel: model, task } = get('M79-PCT-PP', seed, 'transfer');
      if (model.kind !== 'quantity-board' || task.kind !== 'build') throw new Error('Expected two-value transfer');
      const [plan, first, second] = model.rows;
      expect(plan!.amount).toBe(100);
      expect(first!.extent).toBe(100);
      expect(second!.extent).toBe(100);
      const delta = second!.amount! - first!.amount!;
      const relative = 100 * delta / first!.amount!;
      const pieces = (value: number) => Array.from(String(value).replace('-', '−'));
      expect(check(task, { kind: 'build', seq: [...pieces(delta), '%-yks.', ...pieces(relative), '%'] }).ok).toBe(true);
      expect(check(task, { kind: 'build', seq: [...pieces(delta), '%', ...pieces(relative), '%-yks.'] }).why).toContain('prosenttiyksikköinä');
    }
  });
});
