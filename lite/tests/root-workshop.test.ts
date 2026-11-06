import { describe, expect, it } from 'vitest';
import { rootWorkshopEvidence, rootWorkshopSpecs } from '../src/content/root-workshop';
import { checkRootWorkshop, solutionRootWorkshop, wrongRootWorkshopResponses, type RootWorkshopResponse, type RootWorkshopTask } from '../src/content/models/root-workshop';
import { catalogNode } from '../src/engine/catalog';
import { rng } from '../src/engine/rng';

const kind = 'root-workshop' as const;
const base = { kind, context: { title: 'Testi', skills: ['M79-SQRT-01'] } };
const ok = (task: RootWorkshopTask, answer: RootWorkshopResponse) => checkRootWorkshop(task, answer).ok;
type Pair = [bigint, bigint];
function fraction(text: string): Pair {
  const signed = text.replace('−', '-');
  if (signed.includes('/')) {
    const [n, d] = signed.split('/').map(BigInt);
    return [n!, d!];
  }
  const parts = signed.split(/[,.]/);
  return [BigInt(parts.join('')), 10n ** BigInt(parts[1]?.length ?? 0)];
}
const gt = ([a, b]: Pair, [c, d]: Pair) => a * d > c * b;
function scaledString(n: bigint, places: number) {
  const positive = n < 0n ? -n : n;
  const scale = 10n ** BigInt(places);
  const whole = positive / scale;
  const rest = String(positive % scale).padStart(places, '0');
  return `${n < 0n ? '-' : ''}${whole}${places ? `.${rest}` : ''}`;
}
function findBounds(n: number, scale: number) {
  const target = BigInt(n) * BigInt(scale) ** 2n;
  for (let i = 0n; i <= 9999n; i++) {
    if (i * i === target) return [i, i, i] as const;
    if ((i + 1n) ** 2n > target) {
      // In quarter-square units the midpoint is the odd integer 2i+1.
      const midpointSquared = (2n * i + 1n) ** 2n;
      return [i, i + 1n, midpointSquared > target * 4n ? i : i + 1n] as const;
    }
  }
  throw new Error('out of sample');
}
function estimate(n: number, refined: boolean) {
  const [low, high, nearest] = findBounds(n, 1), [a, b] = findBounds(n, 10);
  return { low: String(low), high: String(high), nearest: String(nearest), refinedLow: refined ? scaledString(a, 1) : '',
    refinedHigh: refined ? scaledString(b, 1) : '' };
}
function independentlySolve(task: RootWorkshopTask): RootWorkshopResponse {
  switch (task.mode) {
    case 'principal':
    case 'exact':
      if (task.radicand < 0) return { kind, mode: task.mode, status: 'undefined', value: '', squared: '' };
      return { kind, mode: task.mode, status: 'exists', value: String(findBounds(task.radicand, 1)[0]), squared: String(task.radicand),
        ...(task.negativeProbe !== undefined ? { negativeProbe: 'undefined' as const } : {}) };
    case 'estimate': return { kind, mode: task.mode, ...estimate(task.radicand, task.tenths) };
    case 'paired': return { kind, mode: task.mode, ...estimate(task.radicand, task.tenths),
      exact: String(findBounds(task.exactRadicand, 1)[0]), exactSquared: String(task.exactRadicand), exactRelation: '=', estimateRelation: '≈' };
    case 'operation': {
      const factor = task.operation === '×' ? task.left * task.right : task.operation === '+' ? task.left + task.right : task.left - task.right;
      const squared = factor ** 2 * task.radicand * (task.operation === '×' ? task.rightRadicand : 1);
      const [low, high, rounded] = findBounds(squared, 10);
      return { kind, mode: task.mode, exact: `${factor < 0 ? '-' : ''}sqrt(${squared})`,
        report: scaledString(factor < 0 ? -rounded : rounded, 1), relation: low === high ? '=' : '≈' };
    }
    case 'classify': {
      const cards: Extract<RootWorkshopResponse, { mode: 'classify' }>['cards'] = {};
      for (const { id, label } of task.cards) {
        cards[id] = label.includes('…') ? { classification: 'undetermined', basis: 'fragment' } :
          label === 'π' || label.startsWith('√') ? { classification: 'irrational', basis: 'known-irrational' } :
            label.includes('(') ? { classification: 'rational', basis: 'periodic' } :
              label.includes('/') ? { classification: 'rational', basis: 'ratio' } : { classification: 'rational', basis: 'finite' };
      }
      return { kind, mode: task.mode, cards };
    }
    case 'line': return { kind, mode: task.mode, markers: Object.fromEntries(task.markers.map(marker => {
      if ('range' in marker) return [marker.id, { value: marker.range[1], relation: '≈' }];
      const [n, d] = fraction(marker.value);
      return [marker.id, { value: `${n * 2n}/${d * 2n}`, relation: '=' }];
    })) };
    case 'exact-approx': {
      const [n, d] = fraction(task.report);
      const original = task.source.kind === 'ratio' ? fraction(task.source.value) : [BigInt(task.source.radicand), 1n] as Pair;
      const display: Pair = task.source.kind === 'ratio' ? [n, d] : [n * n, d * d];
      const order = gt(original, display) ? '>' : gt(display, original) ? '<' : '=';
      return { kind, mode: task.mode, relation: order === '=' ? '=' : '≈', order,
        low: `${n * 2n - 1n}/${d * 2n}`, high: `${n * 2n + 1n}/${d * 2n}` };
    }
    case 'round': {
      const [n, d] = fraction(task.value);
      const source = task.value.replace('−', '-');
      const digits = task.goal === 'significant' ? source.split(',')[1]!.search(/[1-9]/) + task.figures! : task.places;
      const scaled = n * 10n ** BigInt(digits);
      const signed = scaled >= 0n ? 1n : -1n, absolute = scaled * signed;
      const q = absolute / d, r = absolute % d;
      const lower = signed === 1n ? q : r ? -q - 1n : -q;
      const round = task.goal === 'pieces' ? q + (r > 0n ? 1n : 0n) : signed * (q + (2n * r >= d ? 1n : 0n));
      const rollover = task.goal === 'significant' && round === 10n ** BigInt(task.figures!);
      return { kind, mode: task.mode, low: scaledString(lower, digits), high: scaledString(lower + 1n, digits),
        result: rollover ? scaledString(round / 10n, digits - 1) : scaledString(round, digits) };
    }
  }
}

describe('root workshop', () => {
  it('uses nine canonical ids, two distinct families and stable item context with an independent oracle', () => {
    expect(rootWorkshopSpecs).toHaveLength(9);
    for (const spec of rootWorkshopSpecs) {
      const families = new Set<string>();
      expect(catalogNode(spec.id)).toBeDefined();
      expect(spec.validRevs).toEqual([spec.rev]);
      for (const phase of ['guided', 'independent', 'transfer', 'retrieval'] as const) for (let seed = 0; seed < 36; seed++) {
        const { task, tag } = spec.item(rng(seed), phase);
        if (phase === 'independent') families.add(tag);
        expect(tag === 'transfer').toBe(phase === 'transfer');
        expect(task).toEqual(spec.item(rng(seed), phase).task);
        expect(task.context.skills.every(id => catalogNode(id))).toBe(true);
        expect(ok(task, independentlySolve(task)), `${spec.id} ${seed} ${phase}`).toBe(true);
        expect(ok(task, solutionRootWorkshop(task))).toBe(true);
        for (const wrong of wrongRootWorkshopResponses(task)) expect(ok(task, wrong)).toBe(false);
      }
      expect(families.size).toBe(2);
      expect(families).toEqual(new Set(rootWorkshopEvidence[spec.id]!.families));
    }
  });

  it('includes zero as a principal root and rejects a sign-pair or negative principal answer', () => {
    const task: RootWorkshopTask = { ...base, mode: 'principal', radicand: 36, view: 'repair' };
    const answer = { kind, mode: 'principal', status: 'exists', value: '6', squared: '36' } as const;
    expect(ok(task, answer)).toBe(true);
    for (const value of ['-6', '±6', '6/0', '18', '0', '√36']) expect(ok(task, { ...answer, value })).toBe(false);
    const boundary = { ...task, negativeProbe: -9 };
    expect(ok(boundary, { ...answer, negativeProbe: 'undefined' })).toBe(true);
    expect(ok(boundary, { ...answer, negativeProbe: 'exists' })).toBe(false);
    expect(ok(boundary, { ...answer, negativeProbe: 'undefined', value: '', squared: '' })).toBe(false);
    expect(ok({ ...task, radicand: 0 }, { ...answer, value: '0', squared: '0' })).toBe(true);
    expect(ok({ ...task, radicand: -36 }, { ...answer, status: 'undefined', value: '', squared: '' })).toBe(true);
    expect(ok({ ...task, radicand: -36 }, { ...answer, status: 'undefined' })).toBe(false);
    expect(ok({ ...task, radicand: -36 }, { ...answer, status: 'undefined', value: null, squared: '' } as unknown as RootWorkshopResponse)).toBe(false);
  });

  it('requires strict square bounds and distinguishes near-lower and near-upper roots', () => {
    const task: RootWorkshopTask = { ...base, mode: 'estimate', radicand: 24, view: 'symbol', tenths: true };
    const answer = { kind, mode: 'estimate', low: '4', high: '5', nearest: '5', refinedLow: '4,8', refinedHigh: '4,9' } as const;
    expect(ok(task, answer)).toBe(true);
    expect(ok(task, { ...answer, nearest: '4' })).toBe(false);
    expect(ok(task, { ...answer, low: '3' })).toBe(false);
    expect(ok(task, { ...answer, refinedLow: '4,89' })).toBe(false);
    expect(ok({ ...task, radicand: 17, tenths: false }, { ...answer, nearest: '4' })).toBe(true);
  });

  it('accepts equivalent one-term radicals and rejects adding the radicands', () => {
    const task: RootWorkshopTask = { ...base, mode: 'operation', operation: '+', left: 1, right: 1, radicand: 5, rightRadicand: 5 };
    const answer = { kind, mode: 'operation', exact: '2√5', report: '4,5', relation: '≈' } as const;
    for (const exact of ['2√5', '√20', '2*sqrt(5)']) expect(ok(task, { ...answer, exact })).toBe(true);
    for (const exact of ['√10', '-√20', '*√20', '√(20', '4,5']) expect(ok(task, { ...answer, exact })).toBe(false);
    expect(ok({ ...task, operation: '×' }, { ...answer, exact: '5', report: '5,0', relation: '=' })).toBe(true);
    expect(ok({ ...task, operation: '−', right: 2 }, { ...answer, exact: '−√5', report: '−2,2' })).toBe(true);
  });

  it('uses given knowledge about a decimal continuation, not its visible digits', () => {
    const task: RootWorkshopTask = { ...base, mode: 'classify', cards: [
      { id: 'A', label: '1,414', detail: 'tarkka', basis: 'finite' },
      { id: 'B', label: '1,414…', detail: 'tuntematon jatko', basis: 'fragment' },
      { id: 'C', label: '1,(414)', detail: 'toistuva jakso', basis: 'periodic' },
      { id: 'D', label: '√2', detail: 'tunnettu irrationaalinen', basis: 'known-irrational' },
    ] };
    const answer = independentlySolve(task);
    if (answer.mode !== 'classify') throw new Error('Wrong mode');
    expect(ok(task, answer)).toBe(true);
    expect(ok(task, { ...answer, cards: { ...answer.cards, B: { classification: 'irrational', basis: 'fragment' } } })).toBe(false);
    expect(ok(task, { ...answer, cards: { ...answer.cards, C: { classification: 'irrational', basis: 'periodic' } } })).toBe(false);
  });

  it('uses the disclosed exact marker interval on either axis and rejects falsely exact approximations', () => {
    const task: RootWorkshopTask = { ...base, mode: 'line', first: 100, last: 200, step: 10, overview: [0, 400],
      markers: [{ id: 'A', label: '5/4', value: '5/4' }, { id: 'B', label: '√2', range: ['1,40', '1,45'] }] };
    const answer = { kind, mode: 'line', markers: { A: { value: '1,250', relation: '=' }, B: { value: '1,4', relation: '≈' } } } as const;
    expect(ok(task, answer)).toBe(true);
    expect(ok(task, { ...answer, markers: { ...answer.markers, B: { value: '1,45', relation: '≈' } } })).toBe(true);
    expect(ok(task, { ...answer, markers: { ...answer.markers, B: { value: '1,45000001', relation: '≈' } } })).toBe(false);
    expect(ok(task, { ...answer, markers: { ...answer.markers, B: { value: '1,415', relation: '=' } } })).toBe(false);
  });

  it('uses exact rational order and reporting cutoffs', () => {
    const task: RootWorkshopTask = { ...base, mode: 'exact-approx', source: { kind: 'ratio', value: '2/3' }, report: '0,67', places: 2 };
    const answer = { kind, mode: 'exact-approx', relation: '≈', order: '<', low: '133/200', high: '0,675' } as const;
    expect(ok(task, answer)).toBe(true);
    expect(ok(task, { ...answer, relation: '=' })).toBe(false);
    expect(ok(task, { ...answer, order: '>' })).toBe(false);
    expect(ok(task, { ...answer, low: '0,66' })).toBe(false);
  });

  it('uses half-away rounding on either side, whole-part ceiling, and significant digit carry', () => {
    const decimal: RootWorkshopTask = { ...base, mode: 'round', goal: 'decimal', value: '−4,25', places: 1, unit: 'km' };
    const answer = { kind, mode: 'round', result: '-4,3', low: '-4,3', high: '-4,2' } as const;
    expect(ok(decimal, answer)).toBe(true);
    expect(ok(decimal, { ...answer, result: '-4,2' })).toBe(false);
    expect(ok({ ...decimal, value: '4,25' }, { ...answer, result: '4,3', low: '4,2', high: '4,3' })).toBe(true);
    expect(ok({ ...decimal, goal: 'pieces', value: '4,01', places: 0 }, { ...answer, result: '5', low: '4', high: '5' })).toBe(true);
    const small = { ...decimal, goal: 'significant' as const, figures: 2, value: '0,00995' };
    const carried = { ...answer, result: '0,010', low: '0,0099', high: '0,0100' };
    expect(ok(small, carried)).toBe(true);
    expect(ok(small, { ...carried, result: '0,0100' })).toBe(false);
    expect(ok({ ...small, value: '12456' }, { ...carried, result: '12000', low: '12000', high: '13000' })).toBe(true);
  });
});
