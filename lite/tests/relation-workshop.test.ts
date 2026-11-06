import { describe, expect, it } from 'vitest';
import { relationWorkshopEvidence, relationWorkshopSpecs } from '../src/content/relation-workshop';
import { checkRelationWorkshop, evaluateRelationFunction, relationLineSamples, relationSystem, solutionRelationWorkshop, wrongRelationWorkshopResponses,
  type LinearEquation, type PlottedFunction, type RelationAxis, type RelationPoint, type RelationWorkshopResponse, type RelationWorkshopTask,
  type SystemWork } from '../src/content/models/relation-workshop';
import { catalogNode } from '../src/engine/catalog';
import { itemIdentity } from '../src/engine/item-identity';
import { rng } from '../src/engine/rng';

const kind = 'relation-workshop' as const;
const context = { title: 'Testi', skills: ['M79-SYSTEM-01'] };
const base = { kind, context, setting: '' };
const plot: RelationAxis = { x: [-5, 5], y: [-6, 6], xStep: .5, yStep: 1 };
type F = readonly [bigint, bigint];
type System = readonly [LinearEquation, LinearEquation];
const f = (v: number): F => [BigInt(v), 1n];
const intText = (v: string): F => {
  const s = v.replaceAll('−', '-');
  if (s.includes('/')) {
    const [n, d] = s.split('/').map(BigInt);
    return d! < 0n ? [-n!, -d!] : [n!, d!];
  }
  const [first, rest = ''] = s.replace(',', '.').split('.');
  return [BigInt(first + rest), 10n ** BigInt(rest.length)];
};
const FText = ([a, b]: F) => b < 0n ? `${-a}/${-b}` : `${a}/${b}`;
const mul = ([a, b]: F, [c, d]: F): F => [a * c, b * d];
const sub = ([a, b]: F, [c, d]: F): F => [a * d - c * b, b * d];
const sum = (a: F, b: F): F => sub(a, [-b[0], b[1]]);
const div = ([a, b]: F, [c, d]: F): F => [a * d, b * c];
const equal = ([a, b]: F, [c, d]: F) => a * d === b * c;
const lhs = ([a, b]: LinearEquation, p: RelationPoint) => sum(mul(f(a), intText(p.x)), mul(f(b), intText(p.y)));
const on = (e: LinearEquation, p: RelationPoint) => equal(lhs(e, p), f(e[2]));
const ok = (task: RelationWorkshopTask, answer: RelationWorkshopResponse) => checkRelationWorkshop(task, answer).ok;

function gaussian([one, two]: System) {
  const pivot = one[0] !== 0 ? 0 : 1;
  const next = pivot === 0 ? 1 : 0;
  const scaled = div(f(two[pivot]), f(one[pivot]));
  const coefficient = sub(f(two[next]), mul(scaled, f(one[next])));
  const rhs = sub(f(two[2]), mul(scaled, f(one[2])));
  if (coefficient[0] === 0n) return { type: rhs[0] === 0n ? 'many' as const : 'none' as const, scaled };
  const value = div(rhs, coefficient);
  const first = div(sub(f(one[2]), mul(f(one[next]), value)), f(one[pivot]));
  return { type: 'one' as const, p: { x: FText(pivot === 0 ? first : value), y: FText(pivot === 0 ? value : first) } };
}
function substitute(lines: System, original: 0 | 1, isolated: 'x' | 'y'): SystemWork {
  const from = lines[original], to = lines[1 - original]!;
  const i = isolated === 'x' ? 0 : 1, j = i === 0 ? 1 : 0;
  const slope = div(f(-from[j]), f(from[i])), offset = div(f(from[2]), f(from[i]));
  return { method: 'substitute', original, isolated, slope: FText(slope), offset: FText(offset),
    coefficient: FText(sum(f(to[j]), mul(f(to[i]), slope))), rhs: FText(sub(f(to[2]), mul(f(to[i]), offset))) };
}
function eliminate(lines: System, canceled: 'x' | 'y'): SystemWork {
  const [a, b] = lines, i = canceled === 'x' ? 0 : 1, j = 1 - i;
  const u = 7 * b[i], v = -7 * a[i];
  return { method: 'eliminate', canceled, first: `${u}/3`, second: `${v}/3`,
    coefficient: `${u * a[j]! + v * b[j]!}/3`, rhs: `${u * a[2] + v * b[2]}/3` };
}
function testValue(fn: PlottedFunction, x: number) {
  // Values are measured in quarter units on the authored grids. Square and product denominators are 16.
  const n = BigInt(x);
  if (fn.kind === 'raised-square') return (n - BigInt(fn.centre) * 4n) ** 2n + BigInt(fn.rise) * 16n;
  const first = BigInt(fn.a) * n + 4n * BigInt(fn.b);
  return fn.kind === 'affine' ? first * 4n : first * (BigInt(fn.c) * n + 4n * BigInt(fn.d));
}
function readZeros(fn: PlottedFunction, low = -20, high = 20) {
  const x = Array.from({ length: (high - low) * 4 + 1 }, (_, i) => low * 4 + i);
  return x.filter(candidate => testValue(fn, candidate) === 0n).map(value => `${value}/4`);
}
function independent(task: RelationWorkshopTask): RelationWorkshopResponse {
  switch (task.mode) {
    case 'direct': {
      const origin = task.rows.find(row => intText(row.x)[0] === 0n);
      const values = task.rows.filter(row => intText(row.x)[0] !== 0n).map(row => div(intText(row.y), intText(row.x)));
      return { kind, mode: task.mode, values: values.map(FText), y0: origin?.y ?? '',
        proportional: values.every(r => equal(r, values[0]!)) && (!origin || intText(origin.y)[0] === 0n) };
    }
    case 'inverse': {
      const products = task.rows.map(row => mul(intText(row.x), intText(row.y)));
      return { kind, mode: task.mode, values: products.map(FText), proportional: products.every(p => equal(p, products[0]!)),
        zeroExcluded: true, condition: task.condition };
    }
    case 'system-concept': {
      const rank = gaussian(task.equations);
      return { kind, mode: task.mode, type: rank.type, factor: rank.type === 'one' ? '' : FText(rank.scaled),
        scaledRhs: rank.type === 'one' ? '' : FText(mul(rank.scaled, f(task.equations[0][2]))),
        rows: task.candidates.map(p => ({ left: task.equations.map(e => FText(lhs(e, p))) as [string, string], fits: task.equations.every(e => on(e, p)) })) };
    }
    case 'system-algebra': {
      const rank = gaussian(task.equations);
      if (rank.type !== 'one') throw Error('Unexpected rank');
      const checks = task.equations.map(([a, b, c]) => ({ ax: FText(mul(f(a), intText(rank.p.x))),
        by: FText(mul(f(b), intText(rank.p.y))), lhs: String(c) }));
      return { kind, mode: task.mode, point: rank.p, checks: [checks[0]!, checks[1]!],
        work: task.method === 'substitute' ? substitute(task.equations, 1, 'x') : eliminate(task.equations, 'y') };
    }
    case 'system-graph': {
      const { axis, equations } = task, rank = gaussian(equations);
      const marks = [];
      for (let x = axis.x[0]; x <= axis.x[1]; x += axis.xStep) for (let y = axis.y[0]; y <= axis.y[1]; y += axis.yStep) {
        marks.push({ x: String(x), y: String(y) });
      }
      const first = marks.filter(p => on(equations[0], p)), second = marks.filter(p => on(equations[1], p));
      const shared = first.filter(p => on(equations[1], p));
      const alignment = equations[0][1] === 0 ? 'y' : 'x';
      const a = first.find(p => second.some(s => s[alignment] === p[alignment]))!;
      const points = rank.type === 'one' ? shared : rank.type === 'many' ? shared.slice(0, 2) :
        [a, second.find(p => p[alignment] === a[alignment])!];
      return { kind, mode: task.mode, points, type: rank.type, checks: equations.map(e => String(e[2])) as [string, string] };
    }
    case 'intercept':
      return { kind, mode: task.mode, point: { x: '0/2', y: String(task.fn.b) }, value: String(task.fn.b),
        initial: String(task.fn.b), interpretation: 'at-zero' };
    case 'zero-graph': {
      const roots = readZeros(task.fn, ...task.axis.x).reverse();
      return { kind, mode: task.mode, rootType: roots.length ? 'listed' : 'none', roots };
    }
    case 'zero-calc':
    case 'zero-integration': {
      const calcRoots = readZeros(task.fn).reverse();
      const equation = (a: number, b: number) => ({ coefficient: `${a * 2}/2`, rhs: String(-b) });
      const fn = task.fn;
      const work = { roots: calcRoots, substitutions: calcRoots.map(x => {
        const first = mul(f(fn.a), intText(x));
        return { value: '0/5', terms: (fn.kind === 'affine' ? [first] :
          [sum(first, f(fn.b)), sum(mul(f(fn.c), intText(x)), f(fn.d))]).map(FText) };
      }),
        equations: task.fn.kind === 'affine' ? [equation(task.fn.a, task.fn.b)] :
          [equation(task.fn.c, task.fn.d), equation(task.fn.a, task.fn.b)] };
      return task.mode === 'zero-calc' ? { kind, mode: task.mode, ...work } :
        { kind, mode: task.mode, graph: [...calcRoots].reverse(), locked: true, ...work };
    }
  }
}

describe('Relation workshop', () => {
  it('has nine canonical nodes, two real families and independent generation with more than eight authored items', () => {
    expect(relationWorkshopSpecs).toHaveLength(9);
    for (const spec of relationWorkshopSpecs) {
      expect(catalogNode(spec.id)).toBeDefined();
      expect(spec.validRevs).toEqual([spec.rev]);
      const identities = new Set(Array.from({ length: 160 }, (_, seed) => itemIdentity(spec.item(rng(seed), 'independent'))));
      expect(identities.size, spec.id).toBeGreaterThanOrEqual(8);
      const families = new Set<string>();
      for (const phase of ['guided', 'independent', 'transfer', 'retrieval'] as const) for (let seed = 0; seed < 30; seed++) {
        const { task, tag } = spec.item(rng(seed), phase);
        if (phase === 'independent') families.add(tag);
        expect(task).toEqual(spec.item(rng(seed), phase).task);
        expect(task.context.skills.every(id => catalogNode(id))).toBe(true);
        expect(tag === 'transfer').toBe(phase === 'transfer');
        expect(ok(task, independent(task)), `${spec.id} ${phase} ${seed}`).toBe(true);
        expect(ok(task, solutionRelationWorkshop(task))).toBe(true);
        if ((task.mode === 'zero-graph' || task.mode === 'zero-integration') && task.fn.kind === 'factored') {
          const x4 = -2 * (task.fn.b / task.fn.a + task.fn.d / task.fn.c);
          const vertex16 = testValue(task.fn, x4);
          expect(vertex16 >= 16n * BigInt(task.axis.y[0]) && vertex16 <= 16n * BigInt(task.axis.y[1])).toBe(true);
        }
        for (const wrong of wrongRelationWorkshopResponses(task)) expect(ok(task, wrong)).toBe(false);
      }
      expect(families).toEqual(new Set(relationWorkshopEvidence[spec.id]!.families));
    }
  });

  it('requires a correct origin as well as a constant nonzero-input ratio', () => {
    const task: RelationWorkshopTask = { ...base, mode: 'direct', xName: 'x', yName: 'y', rows: [{ x: '0', y: '2' }, { x: '-2', y: '-6' }, { x: '1', y: '3' }] };
    const response = { kind, mode: task.mode, values: ['3', '6/2'], y0: '2', proportional: false } as const;
    expect(ok(task, { ...response, values: [...response.values] })).toBe(true);
    expect(ok(task, { ...response, values: [...response.values], proportional: true })).toBe(false);
    expect(ok(task, { ...response, values: ['2/0', '3'] })).toBe(false);
  });

  it('checks both original rows and alternate rational elimination and isolation steps', () => {
    const system: System = [[2, 4, 7], [4, -2, -1]];
    const task: RelationWorkshopTask = { ...base, mode: 'system-algebra', method: 'either', equations: system };
    const rank = gaussian(system);
    if (rank.type !== 'one') throw Error('Expected a point');
    const correct = independent(task);
    if (correct.mode !== 'system-algebra') throw Error('Wrong fixture');
    const a = { kind, mode: task.mode, point: rank.p, checks: correct.checks } as const;
    for (const target of ['x', 'y'] as const) {
      const elimination = eliminate(system, target);
      expect(ok(task, { ...a, work: elimination })).toBe(true);
      expect(ok(task, { ...a, work: substitute(system, 0, target) })).toBe(true);
      expect(ok(task, { ...a, work: substitute(system, 1, target) })).toBe(true);
      expect(ok(task, { ...a, work: { ...elimination, rhs: '0' } })).toBe(false);
      expect(ok(task, { ...a, work: { ...elimination, coefficient: '3/0' } })).toBe(false);
    }
    expect(ok(task, { ...a, work: null })).toBe(false);
    expect(ok(task, { ...a, work: eliminate(system, 'x'), checks: [a.checks[0], { ax: '', by: '', lhs: '' }] })).toBe(false);
    expect(ok(task, { ...a, work: { method: 'eliminate', canceled: 'x', first: '0', second: '0', coefficient: '0', rhs: '0' } })).toBe(false);
    expect(ok(task, { ...a, work: eliminate(system, 'x'), checks: [a.checks[0], { ...a.checks[1], ax: '0' }] })).toBe(false);
  });

  it('recognizes inconsistent zero rows and treats tautologies as unconstraining', () => {
    expect(relationSystem([[0, 0, 1], [1, 1, 2]])).toEqual({ type: 'none' });
    expect(relationSystem([[1, 1, 2], [0, 0, -1]])).toEqual({ type: 'none' });
    expect(relationSystem([[0, 0, 0], [0, 0, 0]])).toEqual({ type: 'many' });
    expect(relationSystem([[0, 0, 0], [1, 1, 2]])).toEqual({ type: 'many' });
  });

  it('supports exact vertical, parallel and coincident coordinate plots', () => {
    for (const equations of [[[1, 0, 2], [1, 1, 5]], [[1, 0, 2], [-2, 0, -6]],
      [[1, 0, 2], [3, 0, 6]], [[2, 1, 2], [4, 2, 4]]] as const) {
      const task: RelationWorkshopTask = { ...base, mode: 'system-graph', axis: plot, equations };
      expect(ok(task, independent(task))).toBe(true);
      for (const line of equations) {
        const ends = relationLineSamples(line, plot);
        expect(ends).toHaveLength(2);
        expect(ends.every(p => on(line, p))).toBe(true);
      }
      const a = independent(task);
      if (a.mode !== 'system-graph') throw Error('Invalid fixture');
      if (a.type !== 'one') expect(ok(task, { ...a, points: [a.points[0]!, a.points[0]!] })).toBe(false);
    }
  });

  it('handles repeated factors, fractional zeros and missing visible zeros without guessing', () => {
    const repeated: RelationWorkshopTask = { ...base, mode: 'zero-calc', fn: { kind: 'factored', a: 2, b: -3, c: 4, d: -6 } };
    const answer = independent(repeated);
    if (answer.mode !== 'zero-calc') throw Error('Invalid fixture');
    expect(answer.roots).toHaveLength(1);
    expect(ok(repeated, answer)).toBe(true);
    expect(ok(repeated, { ...answer, roots: ['1.5', '3/2'], substitutions: [{ terms: ['0', '0'], value: '0' }, { terms: ['0', '0'], value: '0' }] })).toBe(false);
    expect(evaluateRelationFunction(repeated.fn, '3/2')).toBe('0');
    const absent: RelationWorkshopTask = { ...base, mode: 'zero-graph', axis: plot, fn: { kind: 'raised-square', centre: 2, rise: 1 } };
    expect(ok(absent, { kind, mode: 'zero-graph', rootType: 'none', roots: [] })).toBe(true);
    expect(ok(absent, { kind, mode: 'zero-graph', rootType: 'listed', roots: ['2'] })).toBe(false);
    const outOfFrame: RelationWorkshopTask = { ...absent, fn: { kind: 'affine', a: 1, b: -7 } };
    expect(ok(outOfFrame, { kind, mode: 'zero-graph', rootType: 'none', roots: [] })).toBe(true);
  });

  it('checks both constructed representations against the same function', () => {
    const task: RelationWorkshopTask = { ...base, mode: 'zero-integration', axis: plot, fn: { kind: 'affine', a: 4, b: -6 } };
    const a = independent(task);
    if (a.mode !== 'zero-integration') throw Error('Invalid fixture');
    expect(ok(task, { ...a, graph: ['1,5'] })).toBe(true);
    expect(ok(task, { ...a, graph: ['0'] })).toBe(false);
    expect(ok(task, { ...a, graph: ['6'] })).toBe(false);
    expect(ok(task, { ...a, substitutions: [{ terms: ['0'], value: '0' }] })).toBe(false);
    expect(ok(task, { ...a, substitutions: [{ terms: ['6'], value: '1,5' }] })).toBe(false);
    expect(ok(task, { ...a, locked: false })).toBe(false);
  });
});
