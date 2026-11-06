import { describe, expect, it } from 'vitest';
import { decimalWorkshopEvidence, decimalWorkshopSpecs } from '../src/content/decimal-workshop';
import { columnExchanges, decimalLabel, decimalTicks, fractionInHundredths } from '../src/content/models/decimal-workshop';
import type { DecimalWorkbench } from '../src/content/scenes/decimal-workshop';
import { catalogNode } from '../src/engine/catalog';
import { check } from '../src/engine/check';
import { createJourney } from '../src/engine/journey';
import { rng } from '../src/engine/rng';
import type { Item, Phase, Response } from '../src/engine/types';

const byId = new Map(decimalWorkshopSpecs.map(spec => [spec.id, spec]));
const inspect = (id: string, seed: number, phase: Phase = 'independent') =>
  byId.get(id)!.item(rng(seed), phase) as Item & { quantityModel: DecimalWorkbench };

type Rational = readonly [n: bigint, d: bigint];
function decimal(text: string): Rational {
  const match = /^(\d+)(?:,(\d+))?/.exec(text)!;
  const digits = match[2] ?? '';
  return [BigInt(match[1]! + digits), 10n ** BigInt(digits.length)];
}
function fraction(text: string): Rational {
  const [n, d] = text.split('/').map(BigInt);
  return [n!, d!];
}
const scaled = ([n, d]: Rational, scale: bigint) => {
  expect((n * scale) % d).toBe(0n);
  return n * scale / d;
};
const hundredths = (text: string) => scaled(decimal(text), 100n);
const rate = (text: string) => BigInt(text.match(/\d+/)![0]!);
const sign = (a: bigint, b: bigint) => a < b ? '<' : a > b ? '>' : '=';
const samples = (id: string, phase: Phase = 'independent') =>
  Array.from({ length: 64 }, (_, seed) => inspect(id, seed, phase));

describe('Helmisimpukan tarkkuusasema', () => {
  it('publishes nine distinct new scoped lessons with reproducible families and revisions', () => {
    expect(decimalWorkshopSpecs.map(spec => spec.id)).toEqual([
      'M-DEC-05', 'M-DEC-06', 'M-DEC-07', 'M-DEC-SUB', 'M-FRACDEC-01', 'M-PCT-02', 'M-PCT-03', 'M-PCT-04', 'M-PCT-05',
    ]);
    for (const spec of decimalWorkshopSpecs) {
      expect(catalogNode(spec.id)).toMatchObject({ familyId: 'LM09', scope: 'new_509_content' });
      expect(spec.validRevs).toEqual([spec.rev]);
      const tags = new Set(samples(spec.id).map(item => item.tag));
      expect(tags).toEqual(new Set(decimalWorkshopEvidence[spec.id]!.families));
      expect(tags.size).toBe(2);
      expect(decimalWorkshopEvidence[spec.id]!.limit).toBeTruthy();
      const transfer = inspect(spec.id, 7, 'transfer');
      expect(transfer.tag).toBe('transfer');
      expect(transfer.task).toEqual(inspect(spec.id, 7, 'transfer').task);
      expect(transfer.afterCorrect).toBeTypeOf('function');
    }
  });

  it('compares and orders the printed amounts instead of the lengths of their spellings', () => {
    const examples = new Set<string>();
    for (const item of samples('M-DEC-05')) {
      const task = item.task;
      if (task.kind === 'choice') {
        const [a, b] = item.quantityModel.rows.map(row => row.value);
        const expected = sign(hundredths(a!), hundredths(b!));
        const index = task.options.findIndex(option => option.big === expected);
        expect(check(task, { kind: 'choice', index }).ok).toBe(true);
        expect(check(task, { kind: 'choice', index: (index + 1) % 3 }).ok).toBe(false);
        examples.add([a, expected, b].join(''));
      } else if (task.kind === 'place') {
        const ordered = [...task.tokens].sort((a, b) => Number(hundredths(a.text!) - hundredths(b.text!)));
        const map = Object.fromEntries(task.slots.map((slot, i) => [slot.id, ordered[i]!.id]));
        expect(check(task, { kind: 'place', map }).ok).toBe(true);
        expect(check(task, { kind: 'place', map: { ...map, small: map.large!, large: map.small! } }).ok).toBe(false);
      } else throw new Error('Unexpected comparison task');
    }
    for (const expected of ['0,8>0,75', '0,50=0,5', '0,07<0,7']) expect(examples.has(expected)).toBe(true);
  });

  it('places the decimal on a real tick and keeps the offset scale on transfer', () => {
    for (const phase of ['independent', 'transfer'] as const) {
      for (const item of samples('M-DEC-06', phase)) {
        const task = item.task;
        if (task.kind !== 'line') throw new Error('Missing line');
        const target = Number(hundredths(item.quantityModel.rows[0]!.value));
        const step = Number(hundredths(item.quantityModel.rows[1]!.value));
        const first = Math.round(task.min * 100), last = Math.round(task.max * 100);
        expect((target - first) % step).toBe(0);
        expect((last - first) % step).toBe(0);
        expect(Math.round(task.step * 100)).toBe(step);
        expect(check(task, { kind: 'line', value: target / 100 }).ok).toBe(true);
        expect(check(task, { kind: 'line', value: (target + step) / 100 }).ok).toBe(false);
        if (phase === 'transfer') expect(first).toBeGreaterThan(0);
      }
    }
    expect(() => decimalTicks(30, 40, 2, 35)).toThrow(RangeError);
  });

  it('scores decimal arithmetic from an independent rational ledger and handles borrowing and zeros', () => {
    const spellings = new Set<string>();
    for (const id of ['M-DEC-07', 'M-DEC-SUB']) {
      for (const phase of ['independent', 'transfer'] as const) {
        for (const item of samples(id, phase)) {
          const [start, ...changes] = item.quantityModel.rows;
          const opening = hundredths(start!.value);
          const net = changes.reduce((total, row) => total + (row.label.includes('Saapuu') ? 1n : -1n) * hundredths(row.value), 0n);
          expect(net).not.toBe(0n);
          expect(check(item.task, { kind: 'numeric', value: Number(opening + net) / 100 }).ok).toBe(true);
          expect(check(item.task, { kind: 'numeric', value: Number(opening - net) / 100 }).ok).toBe(false);
          expect(item.task).toMatchObject({ kind: 'numeric', tolerance: 0 });
          if (opening + net === 50n) {
            for (const spelling of ['0.5', '0.50']) {
              expect(check(item.task, { kind: 'numeric', value: Number(spelling) }).ok).toBe(true);
              spellings.add(spelling);
            }
          }
        }
      }
    }
    expect([...spellings]).toEqual(['0.5', '0.50']);
    const wrong = samples('M-DEC-SUB').find(item => item.quantityModel.rows.map(row => row.value).join('|') === '0,8 l|0,36 l')!;
    expect(check(wrong.task, { kind: 'numeric', value: 0.54 })).toMatchObject({ ok: false, why: expect.stringContaining('vähennysjärjestystä') });
    expect(columnExchanges(80, 36)).toEqual({ hundredths: true, tenths: false });
    expect(columnExchanges(105, 68)).toEqual({ hundredths: true, tenths: true });
    expect(decimalLabel(50, 1)).toBe('0,5');
    expect(decimalLabel(50)).toBe('0,50');
  });

  it('converts the visible fractions, decimals and percentages without requiring reduction', () => {
    for (const id of ['M-FRACDEC-01', 'M-PCT-02', 'M-PCT-03']) {
      for (const item of samples(id)) {
        const given = item.quantityModel.rows[0]!.value;
        let response: Response;
        if (item.task.kind === 'frac') {
          const exact = given.endsWith('%') ? rate(given) : hundredths(given);
          response = { kind: 'frac', n: Number(2n * exact), d: 200 };
        } else {
          const exact = given.includes('/') ? scaled(fraction(given), 100n)
            : given.endsWith('%') ? rate(given) : hundredths(given);
          response = { kind: 'numeric', value: Number(exact) / (item.task.kind === 'numeric' && item.task.unit === '%' ? 1 : 100) };
        }
        expect(check(item.task, response).ok, `${id}: ${given}`).toBe(true);
      }
    }
    const transfer = inspect('M-FRACDEC-01', 2, 'transfer');
    const value = transfer.quantityModel.rows[0]!.value;
    expect(value).toMatch(/\/20$/);
    expect(check(transfer.task, { kind: 'numeric', value: Number(scaled(fraction(value), 100n)) / 100 }).ok).toBe(true);
    expect(() => fractionInHundredths(1, 3)).toThrow(RangeError);
  });

  it('checks both conversion directions on transfer, including a second whole', () => {
    for (const id of ['M-PCT-02', 'M-PCT-03']) {
      for (const item of samples(id, 'transfer')) {
        const [left, right] = item.quantityModel.rows.map(row => row.value);
        const leftRate = id === 'M-PCT-02' ? scaled(fraction(left!), 100n) : hundredths(left!);
        const rightRate = rate(right!);
        if (item.task.kind !== 'place') throw new Error('Missing transfer cards');
        const tokens = item.task.tokens;
        const a = tokens.find(token => token.text === `${leftRate} %`)!;
        const b = tokens.find(token => token.text?.includes('/') ? scaled(fraction(token.text), 100n) === rightRate
          : token.text?.includes(',') && hundredths(token.text) === rightRate)!;
        expect(check(item.task, { kind: 'place', map: { a: a.id, b: b.id } }).ok).toBe(true);
        expect(check(item.task, { kind: 'place', map: { a: b.id, b: a.id } }).ok).toBe(false);
        if (id === 'M-PCT-03') {
          expect(leftRate).toBeLessThan(10n);
          expect(rightRate).toBeGreaterThan(100n);
        }
      }
    }
  });

  it('separates the rate, the given reference and the amount in another unit', () => {
    for (const phase of ['independent', 'transfer'] as const) {
      for (const item of samples('M-PCT-05', phase)) {
        const whole = BigInt(item.quantityModel.whole.match(/on (\d+) /)![1]!);
        const percent = rate(item.quantityModel.rows[0]!.value);
        expect((whole * percent) % 100n).toBe(0n);
        expect(check(item.task, { kind: 'numeric', value: Number(whole * percent / 100n) }).ok).toBe(true);
        expect(check(item.task, { kind: 'numeric', value: Number(percent) }).ok).toBe(false);
      }
    }
    for (const item of samples('M-PCT-04', 'transfer')) {
      const [a, b] = item.quantityModel.rows;
      const read = (row: string) => row.match(/(\d+) % eli (\d+) m/)!.slice(1).map(BigInt);
      const [rateA, lengthA] = read(a!.value), [rateB, lengthB] = read(b!.value);
      expect(rateA).toBe(rateB);
      expect(lengthB! > lengthA!).toBe(true);
      if (item.task.kind !== 'choice') throw new Error('Missing role choices');
      const right = item.task.options.findIndex(option => option.text === 'Sama prosentti, suurempi määrä B:ssä');
      const wrong = item.task.options.findIndex(option => option.text === 'Sama prosentti, sama määrä');
      expect(check(item.task, { kind: 'choice', index: right }).ok).toBe(true);
      expect(check(item.task, { kind: 'choice', index: wrong }).ok).toBe(false);
    }
  });

  it('requires incoming and outgoing observations before integration transfer and keeps atomic evidence separate', () => {
    const id = 'M-DEC-07';
    const spec = byId.get(id)!;
    const family = decimalWorkshopEvidence[id]!.families;
    const journey = createJourney(null);
    const record = (at: number, phase: Phase, tag: string) => journey.record({ node: id, at, phase, tag, ok: true, rev: spec.rev });
    expect(catalogNode(id)?.integrationOf).toEqual(['M-DEC-ADD', 'M-DEC-SUB']);
    record(1, 'guided', family[0]!);
    record(2, 'guided', family[1]!);
    expect(journey.resolve(id, true)).toBe(true);
    expect(journey.observation(id, spec, family).state).toMatchObject({ helped: true, checked: false });
    for (const at of [3, 4, 5]) record(at, 'independent', family[0]!);
    expect(journey.observation(id, spec, family).readyTransfer).toBe(false);
    record(6, 'independent', family[1]!);
    expect(journey.observation(id, spec, family).readyTransfer).toBe(true);
    record(7, 'transfer', 'transfer');
    expect(journey.observation(id, spec, family).state.checked).toBe(true);
    expect(journey.state('M-DEC-SUB', byId.get('M-DEC-SUB')!).checked).toBe(false);
    expect(journey.get().events).toHaveLength(1);
    expect(journey.get().events[0]?.assisted).toBe(true);
  });
});
