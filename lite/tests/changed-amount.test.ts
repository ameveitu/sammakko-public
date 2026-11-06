import { describe, expect, it } from 'vitest';
import { changedAmount, changedAmountSpec, type ChangedAmountItem } from '../src/content/changed-amount';
import { check, solution } from '../src/engine/check';
import { rng } from '../src/engine/rng';

describe('changed whole after a percentage change', () => {
  it('keeps the reference amount and handles zero, complete loss, and more-than-double growth', () => {
    expect(changedAmount(80, 25)).toBe(100);
    expect(changedAmount(80, -25)).toBe(60);
    expect(changedAmount(80, 0)).toBe(80);
    expect(changedAmount(80, -100)).toBe(0);
    expect(changedAmount(80, 150)).toBe(200);
    expect(() => changedAmount(0, 25)).toThrow(RangeError);
    expect(() => changedAmount(80, -101)).toThrow(RangeError);
  });

  it('accepts calculation or a valid construction, never only the change when it differs from the result', () => {
    const seen = new Set<string>();
    const decreases = new Set<string>();
    const growsBeyondDouble = new Set<string>();
    for (let seed = 0; seed < 64; seed++) {
      const item = changedAmountSpec.item(rng(seed), 'independent') as ChangedAmountItem;
      const { before, signedPercent } = item.changeModel;
      // Independent integer oracle: original quantity plus a signed hundredth share.
      const expected = before + (before / 100) * signedPercent;
      seen.add(item.tag);
      if (signedPercent < 0) decreases.add(item.tag);
      if (expected > 2 * before) growsBeyondDouble.add(item.tag);
      expect(item.task).toEqual(changedAmountSpec.item(rng(seed), 'independent').task);
      expect(item.task.kind).toBe(item.tag === 'new-amount' ? 'numeric' : 'build');
      const response = item.task.kind === 'numeric'
        ? { kind: 'numeric' as const, value: expected }
        : { kind: 'build' as const, seq: [String(before), '+', '(', String(before), '*', String(signedPercent), '/', '100', ')'] };
      expect(check(item.task, response).ok).toBe(true);
      const changeOnly = before * Math.abs(signedPercent) / 100;
      expect(changeOnly).not.toBe(expected);
      const misconception = item.task.kind === 'numeric'
        ? { kind: 'numeric' as const, value: changeOnly }
        : { kind: 'build' as const, seq: [String(before), '*', String(Math.abs(signedPercent)), '/', '100'] };
      expect(check(item.task, misconception)).toMatchObject({ ok: false, why: expect.stringContaining('muutoksen määrä') });
      expect(check(item.task, solution(item.task)).ok).toBe(true);
      expect(item.quantityModel.rows[0]).toMatchObject({ amount: before, base: true });
      expect(item.quantityModel.rows.slice(1).map(row => [row.amount, row.extent])).toEqual([[null, undefined], [null, undefined]]);
      const input = { innerHTML: '' } as HTMLElement;
      item.afterCorrect!(input);
      expect(input.innerHTML).toContain('Muutoksen jälkeen');
      expect(input.innerHTML).toContain(String(expected));
    }
    expect(seen).toEqual(new Set(['new-amount', 'new-expression']));
    expect(decreases).toEqual(seen);
    expect(growsBeyondDouble).toEqual(seen);
  });

  it('treats a correct number tile without its calculation as incomplete production', () => {
    const item = changedAmountSpec.item(rng(11), 'independent');
    expect(item.tag).toBe('new-expression');
    expect(check(item.task, { kind: 'build', seq: ['100'] })).toMatchObject({
      ok: false, math: true, proc: false, why: expect.stringContaining('Rakenna'),
    });
  });

  it('changes the situation to material loss without changing the reference rule', () => {
    for (let seed = 0; seed < 12; seed++) {
      const item = changedAmountSpec.item(rng(seed), 'transfer') as ChangedAmountItem;
      expect(item.tag).toBe('transfer');
      expect(item.changeModel.unit).toBe('m');
      expect(item.changeModel.signedPercent).toBeLessThan(0);
      expect(item.task).toMatchObject({ kind: 'numeric', unit: 'm' });
      expect(item.quantityModel.view).toBe('ruler');
      const { before, signedPercent } = item.changeModel;
      expect(check(item.task, { kind: 'numeric', value: before + before * signedPercent / 100 }).ok).toBe(true);
      expect(check(item.task, { kind: 'numeric', value: -before * signedPercent / 100 }).ok).toBe(false);
    }
  });
});
