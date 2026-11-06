import { describe, expect, it } from 'vitest';
import { rationalLinksEvidence, rationalLinksSpecs } from '../src/content/rational-links';
import {
  checkRationalLink, shareHundredths, solutionRationalLink, wrongRationalLinkResponses,
  type RationalFormat, type RationalLinkResponse, type RationalLinkTask,
} from '../src/content/models/rational-links';
import { catalogNode } from '../src/engine/catalog';
import { createJourney } from '../src/engine/journey';
import { rng } from '../src/engine/rng';
import type { Phase } from '../src/engine/types';

type Rational = readonly [bigint, bigint];
const oracle = (format: RationalFormat, label: string): Rational => {
  if (format === 'fraction') {
    const [a, b] = label.split('/').map(BigInt);
    return [a!, b!];
  }
  const [whole, remainder = ''] = label.replace('%', '').trim().split(/[,.]/);
  const scale = 10n ** BigInt(remainder.length);
  return [BigInt(whole!) * scale + BigInt(remainder || '0'), format === 'percent' ? scale * 100n : scale];
};
const same = ([a, b]: Rational, [c, d]: Rational) => a * d === b * c;

function allMarks([n, d]: Rational): Required<RationalLinkResponse['values']> {
  expect(1000n * n % d).toBe(0n);
  const thousandths = n * 1000n / d;
  return {
    fraction: `${3n * n}/${3n * d}`,
    decimal: `${thousandths / 1000n}.${String(thousandths % 1000n).padStart(3, '0')}0`,
    percent: `${thousandths / 10n},${thousandths % 10n} %`,
  };
}
const forms: RationalFormat[] = ['fraction', 'decimal', 'percent'];
const triplet: RationalLinkTask = { kind: 'rational-link', expectedHundredths: 125, labels: forms.map(format => ({ format })) };
const answer = (values: RationalLinkResponse['values']): RationalLinkResponse => ({ kind: 'rational-link', values });

describe('Tarkkuusaseman yhteiset viestit', () => {
  it('accepts exact equivalents for all three representations above one whole', () => {
    for (const values of [
      { fraction: '5/4', decimal: '1,25', percent: '125' },
      { fraction: '125 / 100', decimal: '1.250', percent: '125,00 %' },
      { fraction: '10/8', decimal: '01,2500', percent: '0125.0%' },
    ]) expect(checkRationalLink(triplet, answer(values)).ok).toBe(true);
    for (const values of [
      { fraction: '5/4', decimal: '1,25' },
      { fraction: '5/4', decimal: '1,25', percent: '12,5' },
      { fraction: '1/4', decimal: '1,25', percent: '125' },
      { fraction: '5/4', decimal: '125', percent: '125' },
    ]) expect(checkRationalLink(triplet, answer(values)).ok).toBe(false);
  });

  it('rejects a misleading digit match, a misplaced percent sign and malformed labels', () => {
    const quarter = { ...triplet, expectedHundredths: 25 };
    const correct = { fraction: '25/100', decimal: '0,25', percent: '25' };
    expect(checkRationalLink(quarter, answer(correct)).ok).toBe(true);
    for (const values of [
      { fraction: '25/1' }, { decimal: '25' }, { percent: '0,25%' }, { fraction: '1/0' },
      { percent: '25%%' }, { decimal: '2.5e-1' }, { decimal: 'NaN' }, { percent: '-25' },
    ]) expect(checkRationalLink(quarter, answer({ ...correct, ...values })).ok).toBe(false);
    const oneFifth = { ...triplet, expectedHundredths: 20, labels: [{ format: 'fraction', given: '1/5' }, { format: 'decimal' }] as const };
    expect(checkRationalLink(oneFifth, answer({ decimal: '0,5' })).ok).toBe(false);
    expect(checkRationalLink(oneFifth, answer({ decimal: '0,20' })).ok).toBe(true);
    expect(checkRationalLink(oneFifth, answer({ decimal: '0,20', fraction: '1/5' })).ok).toBe(false);
    expect(() => shareHundredths(1, 3)).toThrow(RangeError);
    expect(() => shareHundredths(3, 0)).toThrow(RangeError);
  });

  it('checks each seeded form against the visible reference, not another island’s whole', () => {
    const transferRates = new Map<string, Set<number>>();
    for (const spec of rationalLinksSpecs) {
      expect(catalogNode(spec.id)).toMatchObject({ scope: 'new_509_content', familyId: 'LM09' });
      expect(spec.validRevs).toEqual([spec.rev]);
      expect(rationalLinksEvidence[spec.id]?.limit).toBeTruthy();
      const tags = new Set<string>();
      const distinct = new Set<number>();
      transferRates.set(spec.id, distinct);
      for (const phase of ['guided', 'independent', 'transfer', 'retrieval'] as const) {
        for (let seed = 0; seed < 48; seed++) {
          const item = spec.item(rng(seed), phase);
          expect(item.task).toEqual(spec.item(rng(seed), phase).task);
          const locked = item.task.labels.find(label => label.given !== undefined);
          const part = item.quantityModel.rows[0]?.value;
          const full = item.quantityModel.whole.match(/(?:on|vetää) (\d+) /)![1]!;
          const target: Rational = locked ? oracle(locked.format, locked.given!)
            : [BigInt(part!.split(' ')[0]!), BigInt(full)];
          const expected = allMarks(target);
          const values = Object.fromEntries(item.task.labels.filter(label => label.given === undefined)
            .map(label => [label.format, expected[label.format]]));
          expect(checkRationalLink(item.task, answer(values)).ok).toBe(true);
          expect(checkRationalLink(item.task, solutionRationalLink(item.task)).ok).toBe(true);
          expect(wrongRationalLinkResponses(item.task).every(wrong => !checkRationalLink(item.task, wrong).ok)).toBe(true);
          expect(item.task.labels).toHaveLength(spec.id === 'M-RATREP-01' ? 3 : 2);
          expect(item.quantityModel.whole).toContain('100 %');
          if (phase === 'independent') tags.add(item.tag);
          if (locked) {
            const proposals = item.task.labels.filter(label => label.proposed !== undefined);
            expect(proposals.filter(label => !same(oracle(label.format, label.proposed!), target))).toHaveLength(1);
          }
          if (phase === 'transfer') {
            expect(item.tag).toBe('transfer');
            distinct.add(item.task.expectedHundredths);
            const comparison = item.quantityModel.rows[1]!.value.match(/(\d+) m \/ (\d+) m/)!;
            expect(BigInt(comparison[2]!)).toBe(2n * BigInt(full));
            expect(BigInt(comparison[1]!)).toBe(2n * target[0]);
            const wrongWhole = allMarks([target[0], 2n * target[1]]);
            const wrong = Object.fromEntries(Object.keys(values).map(key => [key, wrongWhole[key as RationalFormat]]));
            expect(checkRationalLink(item.task, answer(wrong)).ok).toBe(false);
          }
        }
      }
      expect(tags).toEqual(new Set(rationalLinksEvidence[spec.id]?.families));
    }
    expect([...transferRates.get('M-RATREP-DEC-PCT')!].some(value => value < 10)).toBe(true);
    expect([...transferRates.get('M-RATREP-DEC-PCT')!].some(value => value > 100)).toBe(true);
    expect([...transferRates.get('M-RATREP-01')!].every(value => value > 100)).toBe(true);
  });

  it('requires fresh evidence in repair and construction and leaves all three pairwise states alone', () => {
    const spec = rationalLinksSpecs.find(spec => spec.id === 'M-RATREP-01')!;
    const group = rationalLinksEvidence[spec.id]!.families;
    const journey = createJourney(null);
    const record = (at: number, phase: Phase, tag: string) => {
      const { task } = spec.item(rng(at), phase);
      journey.record({ node: spec.id, at, phase, tag, ok: checkRationalLink(task, solutionRationalLink(task)).ok, rev: spec.rev });
    };
    record(1, 'guided', group[0]!);
    record(2, 'guided', group[1]!);
    expect(journey.observation(spec.id, spec, group).state).toMatchObject({ helped: true, checked: false });
    expect(journey.resolve(spec.id, true)).toBe(true);
    for (const at of [3, 4, 5]) record(at, 'independent', group[0]!);
    expect(journey.observation(spec.id, spec, group).readyTransfer).toBe(false);
    record(6, 'independent', group[1]!);
    expect(journey.observation(spec.id, spec, group).readyTransfer).toBe(true);
    record(7, 'transfer', 'transfer');
    expect(journey.observation(spec.id, spec, group).state.checked).toBe(true);
    expect(journey.resolve(spec.id, false)).toBe(false);
    expect(journey.get().events).toEqual([expect.objectContaining({ node: spec.id, assisted: true })]);
    expect(catalogNode(spec.id)?.integrationOf).toEqual(['M-RATREP-FRAC-DEC', 'M-RATREP-FRAC-PCT', 'M-RATREP-DEC-PCT']);
    for (const atom of rationalLinksSpecs.filter(node => node !== spec)) {
      expect(journey.state(atom.id, atom)).toMatchObject({ checked: false, helped: false, streak: 0 });
    }
  });
});
