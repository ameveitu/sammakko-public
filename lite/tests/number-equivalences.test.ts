import { describe, expect, it } from 'vitest';
import { numberEquivalencesEvidence, numberEquivalencesSpecs } from '../src/content/number-equivalences';
import { checkNumberEquivalences, solutionNumberEquivalences, wrongNumberEquivalencesResponses,
  type NumberEquivalencesResponse, type NumberEquivalencesTask, type ProportionPair } from '../src/content/models/number-equivalences';
import { rng } from '../src/engine/rng';

type Q = readonly [bigint, bigint];
const kind = 'number-equivalences' as const;
const accept = (t: NumberEquivalencesTask, a: NumberEquivalencesResponse) => expect(checkNumberEquivalences(t, a)).toEqual({ ok: true });
const reject = (t: NumberEquivalencesTask, a: NumberEquivalencesResponse) => expect(checkNumberEquivalences(t, a).ok).toBe(false);
const q = (text: string): Q => {
  const [n, d = '1'] = text.split('/');
  return [BigInt(n!), BigInt(d)];
};
const divide = ([a, b]: Q, [c, d]: Q): Q => [a * d, b * c];
const multiply = ([a, b]: Q, [c, d]: Q): Q => [a * c, b * d];
const show = ([a, b]: Q) => `${a * 2n}/${b * 2n}`;
function digits(value: number, base: number, size: number) {
  return [String(Math.floor(value / base)), ...String(value % base).padStart(size, '0').split('')];
}
function ordinary(t: NumberEquivalencesTask): NumberEquivalencesResponse {
  switch (t.mode) {
    case 'line': {
      const n = t.focus, dist = t.distanceGiven ?? Math.hypot(n!);
      const all = Array.from({ length: 2 * t.extent / t.step + 1 }, (_, i) => i * t.step - t.extent)
        .filter(a => a * a === dist * dist).reverse();
      const opposite = n === undefined ? 0 : all.find(a => a + n === 0)!;
      return { kind, mode: 'line', location: n === undefined ? '' : show([BigInt(n), 1n]), distance: String(dist),
        positions: t.skill === 'absolute' ? all.map(String) : [], opposite: String(opposite),
        side: opposite < 0 ? 'left' : opposite > 0 ? 'right' : 'zero', sum: '0,00',
        draftWorks: t.draft === undefined ? null : t.draft + n! === 0 };
    }
    case 'place': {
      let total = t.start;
      const base = 10 ** t.precision;
      const rows = t.changes.map(event => {
        const first = total, second = event.amount;
        total += event.operation === 'add' ? second : -second;
        const [a, b] = event.operation === 'sub' && total < 0 ? [second, first] : [first, second];
        const moves = Array.from({ length: t.precision }, (_, i) => {
          // A carry or a borrow is determined by the entire suffix below the boundary.
          const modulus = base / 10 ** i;
          const x = a % modulus, y = b % modulus;
          return String(Number(event.operation === 'add' ? x + y >= modulus : x < y));
        });
        return { operation: event.operation, left: digits(a, base, t.precision), right: digits(b, base, t.precision), moves,
          result: show([BigInt(total), BigInt(base)]), inverse: show([BigInt(first), BigInt(base)]) };
      });
      return { kind, mode: 'place', rows, estimate: { lower: String(Math.floor(total / base)),
        upper: String(Math.ceil(total / base)), locked: true } };
    }
    case 'multiply': {
      const scale = t.places.map(p => BigInt(10 ** p));
      const product = multiply([BigInt(t.left), scale[0]!], [BigInt(t.right), scale[1]!]);
      const compared = product[0] - BigInt(t.left) * scale[1]!;
      return { kind, mode: 'multiply', left: String(t.left), right: String(t.right), product: String(product[0]), divisor: String(product[1]),
        result: show(product), unit: t.outputUnit, locked: true,
        prediction: compared === 0n ? 'same' : compared > 0n ? 'larger' : 'smaller' };
    }
    case 'proportion': {
      const [left, right] = t.pairs;
      const row = right[0] === 'x' ? 1 : 0;
      const factor = divide(q(right[row]), q(left[row])), x = multiply(q(left[1 - row]!), factor);
      const invert = ([a, b]: ProportionPair): ProportionPair => [b, a];
      const check = show(divide(q(left[1]), q(left[0])));
      return { kind, mode: 'proportion', relation: [invert(right), invert(left)], unknown: show(x), leftCheck: check, rightCheck: check,
        work: t.method === 'algebra' ? { method: 'algebra', coefficient: show([-x[1], 1n]), constant: show([-x[0], 1n]) }
          : { method: 'scale', direction: 'backward', factor: show([factor[1], factor[0]]) } };
    }
  }
}
const spec = (id: string) => numberEquivalencesSpecs.find(s => s.id === id)!;
describe('Number equivalences independent arithmetic and construction', () => {
  it('covers seven nodes, meaningful variants, correct alternatives and independent transfer', () => {
    let total = 0, negative = 0, denominator = 0, zero = 0;
    for (const spec of numberEquivalencesSpecs) {
      const distinct = new Set<string>(), tags = new Set<string>();
      for (let seed = 0; seed < 64; seed++) for (const phase of ['guided', 'independent', 'transfer'] as const) {
        const item = spec.item(rng(seed), phase), task = item.task, correct = ordinary(task);
        tags.add(item.tag!);
        if (phase === 'independent') {
          const signature = task.mode === 'line' ? [task.step, task.focus, task.distanceGiven, task.draft] :
            task.mode === 'place' ? [task.start, task.precision, ...task.changes.map(c => [c.amount, c.operation])] :
            task.mode === 'multiply' ? [task.left, task.right, task.places] : task.pairs;
          distinct.add(JSON.stringify(signature));
        }
        accept(task, correct);
        accept(task, solutionNumberEquivalences(task));
        for (const wrong of wrongNumberEquivalencesResponses(task)) reject(task, wrong);
        if (task.mode === 'line' && (task.focus === 0 || task.distanceGiven === 0)) zero++;
        if (task.mode === 'place' && task.allowNegative && task.start < task.changes[0]!.amount) negative++;
        if (task.mode === 'proportion' && task.pairs[1][1] === 'x') denominator++;
        total++;
      }
      expect(distinct.size, spec.id).toBeGreaterThanOrEqual(8);
      expect([...tags].sort()).toEqual([...numberEquivalencesEvidence[spec.id]!.families, 'transfer'].sort());
    }
    expect(total).toBe(1344);
    expect(negative).toBeGreaterThan(0);
    expect(zero).toBeGreaterThan(0);
    expect(denominator).toBe(64);
  });

  it('separates the sign of an opposite, the common distance and the single zero', () => {
    const line = spec('M79-OPPOSITE-01').item(rng(7), 'independent').task;
    if (line.mode !== 'line') throw new Error('Expected a line');
    const negative = { ...line, focus: -line.step, draft: line.step };
    const positive = { ...line, focus: line.step, draft: line.step };
    const a = ordinary(positive);
    if (a.mode !== 'line') throw new Error('Expected a line response');
    reject(positive, { ...a, opposite: String(line.step), side: 'right' });
    accept(negative, ordinary(negative));
    const t = { ...line, skill: 'absolute' as const, focus: 0, draft: undefined };
    const b = ordinary(t);
    if (b.mode !== 'line') throw new Error('Expected a line response');
    accept(t, b); reject(t, { ...b, positions: ['0', '−0'] });
  });

  it('requires cascading borrows, inverse check and both authored events', () => {
    const sub = spec('M79-DEC-SUB').item(rng(7), 'independent').task;
    if (sub.mode !== 'place') throw new Error('Expected a subtraction');
    const t = { ...sub, start: 300, changes: [{ ...sub.changes[0]!, amount: 127 }] };
    const a = ordinary(t);
    if (a.mode !== 'place') throw new Error('Expected place work');
    expect(a.rows[0]!.moves).toEqual(['1', '1']);
    accept(t, { ...a, rows: [{ ...a.rows[0]!, result: '1,7300' }] });
    reject(t, { ...a, rows: [{ ...a.rows[0]!, moves: ['0', '1'] }] });
    reject(t, { ...a, rows: [{ ...a.rows[0]!, inverse: '1,73' }] });
    reject(t, { ...a, rows: [{ ...a.rows[0]!, left: new Array(3) }] });
    const both = spec('M79-DEC-ADD-SUB').item(rng(5), 'transfer').task;
    const b = ordinary(both);
    if (b.mode !== 'place') throw new Error('Expected place work');
    reject(both, { ...b, rows: [b.rows[1]!] });
    reject(both, { ...b, estimate: { ...b.estimate, locked: false } });
    reject(both, { ...b, rows: [b.rows[0]!, { ...b.rows[1]!, operation: 'add' }] });
  });

  it('requires both factor scales and multiplication magnitude before reveal', () => {
    const t = spec('M79-DEC-MUL').item(rng(6), 'transfer').task;
    const a = ordinary(t);
    if (a.mode !== 'multiply' || t.mode !== 'multiply') throw new Error('Expected multiplication');
    reject(t, { ...a, left: '1/0' });
    reject(t, { ...a, unit: 'km/h' });
    reject(t, { ...a, prediction: a.prediction === 'same' ? 'smaller' : 'same' });
    reject(t, { ...a, divisor: String(Number(a.divisor) / 10) });
  });

  it('accepts alternative algebra and scale for the denominator while rejecting non-equivalent ratios', () => {
    const t = spec('M79-PROP-SOLVE').item(rng(5), 'transfer').task;
    const a = ordinary(t);
    if (t.mode !== 'proportion' || a.mode !== 'proportion') throw new Error('Expected a proportion');
    accept(t, a);
    const [x, d] = q(a.unknown);
    accept(t, { ...a, work: { method: 'algebra', coefficient: String(7n * d), constant: String(7n * x) } });
    reject(t, { ...a, work: { method: 'algebra', coefficient: '0', constant: '0' } });
    reject(t, { ...a, unknown: '0' });
    reject(t, { ...a, unknown: '1/0' });
    reject(t, { ...a, rightCheck: '' });
    reject(t, { ...a, relation: [[a.relation[0][1], a.relation[0][0]], a.relation[1]] });
  });
});
