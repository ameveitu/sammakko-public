import { describe, expect, it } from 'vitest';
import { advancedSolidsSpecs } from '../src/content/advanced-solids';
import { checkAdvancedSolids, debugAdvancedSolidsScene, type AdvancedFigure, type AdvancedSolidsResponse,
  type AdvancedSolidsTask, type MeasurementField, type SolidBase, type SolidWitness } from '../src/content/models/advanced-solids';
import { advancedSolidsScene } from '../src/content/scenes/advanced-solids';
import { rng } from '../src/engine/rng';

type Q = readonly [bigint, bigint];
const q = (n: number, d = 1): Q => [BigInt(n), BigInt(d)];
const half = (n: number): Q => q(n * 2, 2);
const mul = ([a, b]: Q, [c, d]: Q): Q => [a * c, b * d];
const plus = ([a, b]: Q, [c, d]: Q): Q => [a * d + c * b, b * d];
const div = ([a, b]: Q, [c, d]: Q): Q => [a * d, b * c];
const pow = ([n, d]: Q, e: bigint): Q => [n ** e, d ** e];
const show = ([n, d]: Q) => `${2n * n}/${2n * d}`;
const pi: Q = [3141592653589793238462643383279502884n, 1000000000000000000000000000000000000n];
const k = 'advanced-solids' as const;
const accept = (t: AdvancedSolidsTask, a: AdvancedSolidsResponse) => expect(checkAdvancedSolids(t, a)).toEqual({ ok: true });
const reject = (t: AdvancedSolidsTask, a: AdvancedSolidsResponse) => expect(checkAdvancedSolids(t, a).ok).toBe(false);

function baseMetrics(base: SolidBase) {
  if (base.kind === 'circle') return { coefficient: pow(half(base.radius), 2n), outline: half(2 * base.radius), pi: true };
  if (base.kind === 'right-triangle') {
    expect(base.width ** 2 + base.depth ** 2).toBe(base.diagonal ** 2);
    return { coefficient: q(base.width * base.depth, 2), outline: q(base.width + base.depth + base.diagonal), pi: false };
  }
  return { coefficient: q(base.width * base.depth), outline: q(base.width + base.depth + base.width + base.depth), pi: false };
}
function witness({ shape }: AdvancedFigure, scope: 'all' | SolidWitness['group']): SolidWitness {
  const group = shape.kind === 'ellipsoid' || shape.kind === 'frustum' ? 'other' : shape.kind;
  if (scope !== 'all' && scope !== group) return { group: 'other' };
  switch (shape.kind) {
    case 'column': return { group, bases: '8/4', equalBases: true };
    case 'cone': return { group, bases: '4/4', tips: '10/10' };
    case 'sphere': return { group, radii: Array(3).fill(show(half(shape.radius))) };
    default: return { group };
  }
}
function round([n, d]: Q) {
  const nearest = (n * 200n + d) / (2n * d);
  return `${nearest / 100n},${String(nearest % 100n).padStart(2, '0')}`;
}
const litreScale = { 'mm³': q(1, 1000000), 'cm³': q(1, 1000), 'dm³': q(1), l: q(1), 'm³': q(1000) };
function independentlySolve(task: AdvancedSolidsTask): AdvancedSolidsResponse {
  if (task.mode === 'identify') return { kind: k, mode: 'identify', choices: Object.fromEntries(task.figures.map(f => [f.id, witness(f, task.target)])) };
  if (task.mode === 'convert') {
    const [n, d] = div(litreScale[task.from], litreScale[task.to]);
    const decimal = Number(n) / Number(d);
    const factor = n > d ? [n, d] as const : [d, n] as const;
    const baseScale = Math.round(Math.cbrt(Number(factor[0]) / Number(factor[1])));
    return { kind: k, mode: 'convert', axes: ['1', '1', '1'].map(v => show(q(Number(v) * baseScale))),
      factor: show(factor), operation: decimal === 1 ? 'same' : decimal > 1 ? 'times' : 'divide',
      value: show(mul(half(task.amount), [n, d])), unit: task.to };
  }
  const shape = task.figure.shape, surface = task.target === 'surface', height = task.target === 'height';
  const values: Partial<Record<MeasurementField, string>> = {};
  const put = (id: MeasurementField, value: Q) => { values[id] = show(value); };
  let coefficient: Q;
  let symbolic = true;
  if (shape.kind === 'sphere') {
    const r = half(shape.radius);
    put('radius', r);
    const radiusFactor = pow(r, surface ? 2n : 3n);
    put('power', radiusFactor);
    // A sphere's area is four great circles; its volume is two thirds of the enclosing cylinder.
    coefficient = surface ? mul(q(4), radiusFactor) : mul(mul(pow(r, 2n), mul(q(2), r)), q(2, 3));
  } else {
    const base = baseMetrics(shape.base);
    const h = half(shape.height);
    symbolic = base.pi && !height;
    if (shape.base.kind === 'circle') put('radius', half(shape.base.radius));
    if (!surface || shape.caps > 0) put('baseArea', base.coefficient);
    if (surface) {
      let side: Q;
      if (shape.kind === 'cone' && shape.base.kind === 'circle') {
        const r = shape.base.radius, s = shape.slant!;
        expect(s ** 2).toBe(r ** 2 + shape.height ** 2);
        put('slant', half(s));
        // The open mantle is a sector with arc length 2πr and radius s.
        side = mul(mul(base.outline, half(s)), q(1, 2));
      } else {
        put('perimeter', base.outline);
        side = mul(base.outline, h);
      }
      put('caps', q(shape.caps)); put('lateral', side);
      coefficient = plus(side, mul(q(shape.caps), base.coefficient));
    } else if (height) coefficient = div(half(task.givenVolume!), base.coefficient);
    else {
      const volume = mul(base.coefficient, h);
      coefficient = shape.kind === 'cone' ? div(volume, q(3)) : volume;
      if (shape.kind === 'cone') put('factor', q(1, 3));
    }
  }
  put('total', coefficient);
  let prediction: 'less' | 'same' | 'greater' | undefined;
  if (task.compare) {
    const earlierRadius = task.compare.earlierRadius;
    const oldR = earlierRadius === undefined ? q(1) : half(earlierRadius);
    const newR = earlierRadius === undefined ? q(1) : shape.kind === 'sphere' ? half(shape.radius)
      : shape.base.kind === 'circle' ? half(shape.base.radius) : q(1);
    const oldH = task.compare.earlierHeight === undefined ? q(1) : half(task.compare.earlierHeight);
    const newH = task.compare.earlierHeight === undefined || shape.kind === 'sphere' ? q(1) : half(shape.height);
    const ratio = div(mul(pow(newR, shape.kind === 'sphere' && !surface ? 3n : 2n), newH),
      mul(pow(oldR, shape.kind === 'sphere' && !surface ? 3n : 2n), oldH));
    const [n, d] = ratio;
    prediction = n === d ? 'same' : n > d ? 'greater' : 'less';
    if (task.compare.factor) put('scale', ratio);
  }
  return { kind: k, mode: 'measure', values, unit: task.unit + (height ? '' : surface ? '²' : '³'),
    notation: task.result === 'exact' ? 'exact' : 'approx', rounded: round(symbolic ? mul(coefficient, pi) : coefficient),
    locked: !!prediction, prediction, fillStep: task.demoFill ? 3 : undefined };
}

describe('Advanced Solids independent mathematical audit', () => {
  it('solves all eleven nodes across meaningful families and changed contexts with an independent oracle', () => {
    let generated = 0;
    for (const spec of advancedSolidsSpecs) {
      const tags = new Set<string>();
      for (let seed = 0; seed < 64; seed++) for (const phase of ['independent', 'guided', 'transfer'] as const) {
        const item = spec.item(rng(seed), phase), task = item.task;
        if (task.kind !== k) throw new Error('Unexpected task kind');
        tags.add(item.tag!);
        const answer = independentlySolve(task);
        accept(task, answer);
        if (answer.mode === 'identify') {
          const id = Object.keys(answer.choices)[0]!;
          reject(task, { ...answer, choices: { ...answer.choices, [id]: {} } });
        }
        if (task.mode === 'measure' && answer.mode === 'measure') {
          reject(task, { ...answer, values: { ...answer.values, total: '0' } });
          reject(task, { ...answer, unit: task.target === 'height' ? task.unit + '³' : task.unit });
          if (task.demoFill) reject(task, { ...answer, fillStep: 2 });
          if (task.compare) reject(task, { ...answer, locked: false });
          const before = advancedSolidsScene(task), debug = debugAdvancedSolidsScene(before);
          expect(debug.figures.every(f => !('shape' in f))).toBe(true);
          expect(debug.comparisonOpen).toBe(false);
          expect(before.figures.some(f => f.id === 'Ennen')).toBe(false);
          if (task.compare) expect(advancedSolidsScene(task, answer).figures.some(f => f.id === 'Ennen')).toBe(true);
        }
        if (answer.mode === 'convert') {
          reject(task, { ...answer, axes: [answer.axes[0]!, answer.axes[1]!, '1'] });
          reject(task, { ...answer, operation: answer.operation === 'times' ? 'divide' : 'times' });
        }
        generated++;
      }
      expect(tags.size, spec.id).toBe(3);
    }
    expect(generated).toBe(2112);
  });
});
