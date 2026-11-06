import { describe, expect, it } from 'vitest';
import { rng } from '../src/engine/rng';
import { solutionLabSpecs } from '../src/content/solution-lab';
import { checkSolutionLab, solutionMassState, type SolutionLabTask, type SolutionLabResponse,
  type IndicatorReading } from '../src/content/models/solution-lab';

const kind = 'solution-lab' as const;
const bounds = { 'methyl-orange': [32, 44], 'bromothymol-blue': [60, 76], phenolphthalein: [82, 100] } as const;
/** Half-tenth witness grid, including all given endpoints and neutral pH. No production interval helper. */
function witnesses(readings: readonly IndicatorReading[]) {
  return Array.from({ length: 281 }, (_, i) => i).filter(point => readings.every(reading => {
    const [lo, hi] = bounds[reading.indicator];
    return reading.band === 'low' ? point < lo * 2 : reading.band === 'high' ? point > hi * 2 : point >= lo * 2 && point <= hi * 2;
  }));
}
function indicatorAnswer(task: Extract<SolutionLabTask, { mode: 'indicator' }>): Extract<SolutionLabResponse, { mode: 'indicator' }> {
  const points = witnesses(task.readings), first = points[0], last = points.at(-1);
  const lower = first === undefined ? 0 : Math.floor(first / 2), upper = last === undefined ? 0 : Math.ceil(last / 2);
  return { kind, mode: 'indicator', consistent: points.length > 0, lower: `${lower}/10`, upper: `${upper}/10`,
    includeLower: first !== undefined && first % 2 === 0, includeUpper: last !== undefined && last % 2 === 0,
    classes: [...(points.some(p => p < 140) ? ['acidic'] : []), ...(points.includes(140) ? ['neutral'] : []), ...(points.some(p => p > 140) ? ['basic'] : [])],
    review: { confirmedByAdult: true, assistance: 'none', observations: Object.fromEntries(task.review!.rubric.map(c => [c.id, 'met'])) } };
}
function independentAnswer(task: SolutionLabTask): SolutionLabResponse {
  if (task.mode === 'indicator') return indicatorAnswer(task);
  if (task.mode === 'concentration') {
    const original = BigInt(task.sample.solute + task.sample.solvent), solute = BigInt(task.sample.solute);
    const operation = task.operation;
    const whole = operation?.kind === 'aliquot' ? BigInt(operation.amount) : original + BigInt(operation?.amount ?? 0);
    const numerator = operation?.kind === 'aliquot' ? `${solute * whole * 7n}/${original * 7n}` : String(solute);
    const percent = operation?.kind === 'aliquot' ? `${solute * 100n}/${original}` : `${solute * 100n}/${whole}`;
    return { kind, mode: 'concentration', numerator, denominator: `${whole * 3n}/3`, basis: 'mass-mass', percent,
      ...(operation ? { operation: { kind: operation.kind, amount: `${BigInt(operation.amount) * 5n}/5`, locked: true, applied: true } } : {}) };
  }
  if (task.mode === 'compare') {
    const [first, second] = task.samples;
    const a = BigInt(first.solute) * BigInt(second.solute + second.solvent);
    const b = BigInt(second.solute) * BigInt(first.solute + first.solvent);
    return { kind, mode: 'compare', rows: [...task.samples].reverse().map(s => ({ id: s.id, numerator: `${s.solute * 2}/2`, denominator: String(s.solute + s.solvent) })),
      cross: [`${a * 11n}/11`, `${b * 11n}/11`], relation: a === b ? 'same' : a > b ? 'left' : 'right' };
  }
  const values = task.samples.map(s => ({ ...s, value: s.ph10 ?? (s.requested === 'acidic' ? 69 : s.requested === 'basic' ? 71 : 70) }));
  const pair = task.pair?.map(id => values.find(s => s.id === id)!);
  const order = [...values].sort((a, b) => a.value - b.value || b.id.localeCompare(a.id)).map(s => s.id);
  return { kind, mode: 'ph', rows: [...values].reverse().map(s => ({ id: s.id, ph: `${s.value * 7}/70`, classification: s.value < 70 ? 'acidic' : s.value > 70 ? 'basic' : 'neutral' })),
    order: task.skill === 'scale' ? order : [], moreAcidic: !pair ? '' : pair[0]!.value === pair[1]!.value ? 'same' : pair[0]!.value < pair[1]!.value ? pair[0]!.id : pair[1]!.id,
    factor: pair ? String(10n ** BigInt(Math.abs(pair[0]!.value - pair[1]!.value) / 10)) : '' };
}

describe('Solution6 independent peer oracle', () => {
  it('accepts 1536 generated cases using independent mass, ratio and pH witnesses, and rejects wrong quantities', () => {
    let cases = 0;
    for (const spec of solutionLabSpecs) for (const phase of ['independent', 'transfer'] as const) for (let seed = 0; seed < 128; seed++) {
      const task = spec.item(rng(seed), phase).task as SolutionLabTask, answer = independentAnswer(task);
      expect(checkSolutionLab(task, answer), `${spec.id}/${phase}/${seed}`).toMatchObject({ ok: true }); cases++;
      if (answer.mode === 'concentration') {
        expect(checkSolutionLab(task, { ...answer, denominator: '0' }).ok).toBe(false);
        expect(checkSolutionLab(task, { ...answer, basis: 'volume-volume' }).ok).toBe(false);
        if (task.mode === 'concentration' && !task.operation) expect(checkSolutionLab(task, { ...answer, denominator: String(task.sample.solvent) }).ok).toBe(false);
        if (answer.operation) expect(checkSolutionLab(task, { ...answer, operation: { ...answer.operation, applied: false } }).ok).toBe(false);
      } else if (answer.mode === 'compare') {
        expect(checkSolutionLab(task, { ...answer, cross: ['1', '0'] }).ok).toBe(false);
        expect(checkSolutionLab(task, { ...answer, relation: answer.relation === 'same' ? 'left' : 'same' }).ok).toBe(false);
      } else if (answer.mode === 'ph') {
        expect(checkSolutionLab(task, { ...answer, rows: answer.rows.map(s => ({ ...s, classification: s.classification === 'neutral' ? 'acidic' : 'neutral' })) }).ok).toBe(false);
      } else {
        expect(checkSolutionLab(task, { ...answer, consistent: !answer.consistent }).ok).toBe(false);
        expect(checkSolutionLab(task, { ...answer, review: { ...answer.review!, confirmedByAdult: false } })).toMatchObject({ pendingReview: true });
      }
    }
    expect(cases).toBe(1536);
  });
  it('every possible named indicator pair preserves open boundaries and all possible acidity classes', () => {
    const observations = Object.keys(bounds).flatMap(indicator => (['low', 'transition', 'high'] as const).map(band => ({ indicator: indicator as IndicatorReading['indicator'], band })));
    for (const a of observations) for (const b of observations) {
      const task: SolutionLabTask = { kind, mode: 'indicator', title: 'Independent interval witnesses', readings: [a, b], temperatureC: 25, neutral10: 70,
        review: { prompt: 'Own range explanation', rubric: [{ id: 'range', label: 'Own meaning', guide: 'Heard by adult' }], model: 'Model only' } };
      const answer = indicatorAnswer(task), points = witnesses([a, b]);
      expect(checkSolutionLab(task, answer)).toMatchObject({ ok: true, observedByAdult: true });
      if (points.length) {
        expect(checkSolutionLab(task, { ...answer, includeLower: !answer.includeLower }).ok).toBe(false);
        expect(checkSolutionLab(task, { ...answer, includeUpper: !answer.includeUpper }).ok).toBe(false);
        expect(checkSolutionLab(task, { ...answer, lower: '7', upper: '7', classes: ['neutral'] }).ok).toBe(false);
      }
    }
  });
  it('aliquots retain the source, while dilution adds only solvent and lowers the same mass fraction', () => {
    for (let solute = 0; solute <= 11; solute++) for (const solvent of [7, 13, 29]) for (const amount of ['1/3', '2/3', '5/2']) {
      const sample = { id: 'a', label: 'Virtual sample', solute, solvent, unit: 'g' as const, basis: 'mass-mass' as const };
      const whole = BigInt(solute + solvent), [portion, denominator] = amount.split('/').map(BigInt) as [bigint, bigint];
      const part = solutionMassState(sample, { kind: 'aliquot', amount })!;
      const [n, d] = part.target.solute, [retained, retainedDen] = part.source.solute;
      expect(n * denominator * whole).toBe(BigInt(solute) * portion * d);
      expect(n * retainedDen + retained * d).toBe(BigInt(solute) * d * retainedDen);
      expect(part.target.total[0] * denominator).toBe(portion * part.target.total[1]);
      expect(part.source.total[0] * denominator).toBe((whole * denominator - portion) * part.source.total[1]);
      const diluted = solutionMassState(sample, { kind: 'dilute', amount })!;
      expect(diluted.target.solute[0]).toBe(BigInt(solute) * diluted.target.solute[1]);
      expect(diluted.target.total[0] * denominator).toBe((whole * denominator + portion) * diluted.target.total[1]);
    }
  });
  it('adult review is required before evidence and adult/help provenance survives a wrong mathematical result', () => {
    const task = solutionLabSpecs.find(s => s.id === 'CHEM79-INDICATOR')!.item(rng(0), 'independent').task as SolutionLabTask;
    if (task.mode !== 'indicator') throw Error('Indicator fixture');
    const answer = indicatorAnswer(task), wrong = { ...answer, consistent: !answer.consistent };
    expect(checkSolutionLab(task, { ...wrong, review: undefined })).toMatchObject({ ok: false, pendingReview: true });
    expect(checkSolutionLab(task, { ...wrong, review: { ...answer.review!, assistance: 'helped' } })).toMatchObject({ ok: false, observedByAdult: true, assisted: true });
  });
});

it('peer hostile responses cannot replace numeric production, row identity or adult observations', () => {
  const task = solutionLabSpecs.find(s => s.id === 'CHEM79-CONC-COMP')!.item(rng(11), 'transfer').task as SolutionLabTask;
  const answer = independentAnswer(task);
  if (answer.mode !== 'compare') throw Error('Compare');
  for (const invalid of [Object.create(answer), { ...answer, rows: Array(2) }, { ...answer, rows: answer.rows.map(row => Object.create(row)) },
    { ...answer, rows: answer.rows.map(row => ({ ...row, denominator: '1/0' })) }, { ...answer, cross: ['prose', 'NaN'] },
    { ...answer, rows: [answer.rows[0], answer.rows[0]] }, { ...answer, note: 'unstructured text' }]) {
    expect(checkSolutionLab(task, invalid as SolutionLabResponse).ok).toBe(false);
  }
  let calls = 0;
  const accessor = Object.defineProperty({ ...answer }, 'rows', { enumerable: true, get() { calls++; return answer.rows; } });
  expect(checkSolutionLab(task, accessor).ok).toBe(false); expect(calls).toBe(0);
  const indicator = solutionLabSpecs.find(s => s.id === 'CHEM79-INDICATOR')!.item(rng(1), 'independent').task as SolutionLabTask;
  if (indicator.mode !== 'indicator') throw Error('Indicator');
  const correct = indicatorAnswer(indicator);
  expect(checkSolutionLab(indicator, { ...correct, review: Object.create(correct.review!) })).toMatchObject({ pendingReview: true });
  const noAssistance = { ...correct.review } as Record<string, unknown>; delete noAssistance.assistance;
  expect(checkSolutionLab(indicator, { ...correct, review: noAssistance } as SolutionLabResponse)).toMatchObject({ pendingReview: true });
});
