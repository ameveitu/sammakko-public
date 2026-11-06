import { describe, expect, it } from 'vitest';
import { functionGardenEvidence, functionGardenSpecs } from '../src/content/function-garden';
import { checkFunctionGarden, solutionFunctionGarden, wrongFunctionGardenResponses,
  type FunctionGardenResponse, type FunctionGardenTask, type GardenDirection, type GardenRule } from '../src/content/models/function-garden';
import { rng } from '../src/engine/rng';

const kind = 'function-garden' as const;
const accept = (t: FunctionGardenTask, a: FunctionGardenResponse) => expect(checkFunctionGarden(t, a)).toEqual({ ok: true });
const reject = (t: FunctionGardenTask, a: FunctionGardenResponse) => expect(checkFunctionGarden(t, a).ok).toBe(false);
const dir = (difference: number): GardenDirection => difference > 0 ? 'rising' : difference < 0 ? 'falling' : 'constant';
const point = (x: number, y: number) => ({ x: String(x * 2) + '/2', y: String(y * 3) + '/3' });

function oracle(task: FunctionGardenTask): FunctionGardenResponse {
  switch (task.mode) {
    case 'mono': {
      const intervals = [];
      for (const [i, [start, startY]] of task.points.entries()) for (const [end, endY] of task.points.slice(i + 1)) {
        const j = task.points.findIndex(([x]) => x === end);
        const sign = dir(endY - startY);
        if (!task.points.slice(i + 1, j + 1).every((p, offset) => dir(p[1] - task.points[i + offset]![1]) === sign)) continue;
        if (i > 0 && dir(startY - task.points[i - 1]![1]) === sign) continue;
        if (j < task.points.length - 1 && dir(task.points[j + 1]![1] - endY) === sign) continue;
        intervals.push({ from: String(start), to: String(end), direction: sign });
      }
      const v = task.points.find(([x]) => x === task.signAt)![1];
      const a = task.draft;
      const draftWorks = a ? intervals.some(s => +s.from <= a.from && +s.to >= a.to && s.direction === a.direction) : null;
      return { kind, mode: 'mono', intervals: intervals.reverse(), value: String(v), sign: v > 0 ? 'positive' : v === 0 ? 'zero' : 'negative', draftWorks };
    }
    case 'parabola': {
      const [left, centre, edge] = [task.samples[0]!, task.samples.find(([x]) => x === task.curve.h)!, task.samples.at(-1)!];
      const curvature = (left[1] + edge[1] - 2 * centre[1]) / 8;
      const y = centre[1] + curvature;
      const choice = task.choices.find(({ curve }) => {
        const value = curve.type === 'quartic' ? curve.k + curve.a / 4 : curve.type === 'absolute' ? curve.k + 2 * curve.a :
          curve.type === 'line' ? curve.k + curve.a * (task.checkX - curve.h) : curve.k + curve.a;
        // The line can match one interior sample; the two end values exclude it.
        return value === y && curve.type !== 'line';
      })!;
      return { kind, mode: 'parabola', choice: choice.id, pair: point(task.checkX, y) };
    }
    case 'parabola-graph': {
      const h = task.table[2]!.x, k = task.table[2]!.y!;
      const points = task.table.map(({ x, y }) => point(x, y ?? task.table.find(row => row.x === 2 * h - x)!.y!));
      return { kind, mode: 'parabola-graph', points: points.reverse(), vertex: point(h, k),
        mirror: [String(h + 2), String(h - 2)], path: 'smooth', locked: true };
    }
    case 'sequence': {
      const a = task.observed.map(t => BigInt(t.value)), [p, q] = a;
      const differences = a.slice(1).map((v, i) => v - a[i]!);
      const pattern = differences.every(d => d === differences[0]) ? 'difference' : 'ratio';
      const step = pattern === 'difference' ? q! - p! : q! / p!;
      const source = task.observed[0]!.index;
      const valueAt = (target: number) => {
        let value = p!;
        for (let i = source; i < target; i++) value = pattern === 'difference' ? value + step : value * step;
        for (let i = source; i > target; i--) value = pattern === 'difference' ? value - step : value / step;
        return value;
      };
      const rule: GardenRule = { form: 'recursive', anchor: String(task.start), value: String(valueAt(task.start)), step: `${step * 3n}/3` };
      return { kind, mode: 'sequence', pattern, steps: a.slice(1).map((v, i) => pattern === 'difference' ? String(v - a[i]!) : `${v}/${a[i]}`),
        firstIndex: String(task.start), rule, checkTerm: String(valueAt(task.observed[2]!.index)), testTerm: String(valueAt(task.testIndex)) };
    }
  }
}

describe('Function garden independent construction oracles', () => {
  it('checks every family, actual variation and changed-context transfer with independently produced answers', () => {
    let generated = 0;
    for (const spec of functionGardenSpecs) {
      const tags = new Set<string>(), givens = new Set<string>();
      for (let seed = 0; seed < 64; seed++) for (const phase of ['independent', 'guided', 'transfer'] as const) {
        const item = spec.item(rng(seed), phase), task = item.task;
        tags.add(item.tag!);
        if (phase === 'independent') {
          givens.add(JSON.stringify(task.mode === 'mono' ? [task.points, task.signAt, task.draft] : task.mode === 'parabola' ?
            [task.curve, task.samples, task.checkX] : task.mode === 'parabola-graph' ? task.table : [task.observed, task.testIndex]));
        }
        accept(task, oracle(task));
        accept(task, solutionFunctionGarden(task));
        for (const bad of wrongFunctionGardenResponses(task)) reject(task, bad);
        if (phase === 'transfer') {
          if (task.mode === 'mono') expect(task.points.every(([, y]) => y < 0)).toBe(true);
          if (task.mode === 'parabola-graph') expect(task.table[2]!.y).toBeGreaterThan(task.table[0]!.y!);
          if (task.mode === 'sequence' && task.target === 'structure') expect(task.testIndex).toBeLessThan(task.observed[0]!.index);
          if (task.mode === 'sequence' && task.target !== 'structure') expect(task.testIndex).toBeGreaterThan(task.observed.at(-1)!.index);
        }
        generated++;
      }
      expect([...tags].sort()).toEqual([...functionGardenEvidence[spec.id]!.families, 'transfer'].sort());
      expect(givens.size).toBeGreaterThanOrEqual(8);
    }
    expect(generated).toBe(1152);
  });

  it('distinguishes a rising graph below zero from falling and requires maximal intervals', () => {
    const spec = functionGardenSpecs.find(s => s.id === 'M79-GRAPH-MONO')!;
    const t = spec.item(rng(9), 'transfer').task, a = oracle(t);
    if (t.mode !== 'mono' || a.mode !== 'mono') throw new Error('Expected function graph');
    expect(a.sign).toBe('negative');
    expect(a.intervals.map(s => s.direction)).toEqual(['rising']);
    reject(t, { ...a, intervals: [{ ...a.intervals[0]!, direction: 'falling' }] });
    reject(t, { ...a, intervals: [{ ...a.intervals[0]!, to: String(t.points[1]![0]) },
      { ...a.intervals[0]!, from: String(t.points[1]![0]) }] });
    reject(t, { ...a, intervals: new Array(1) });
  });

  it('rejects the same-looking quartic through the outer points and vertex', () => {
    const spec = functionGardenSpecs.find(s => s.id === 'M79-PARABOLA')!;
    const t = spec.item(rng(11), 'independent').task, a = oracle(t);
    if (t.mode !== 'parabola' || a.mode !== 'parabola') throw new Error('Expected parabola recognition');
    const quartic = t.choices.find(v => v.curve.type === 'quartic')!;
    reject(t, { ...a, choice: quartic.id });
    reject(t, { ...a, choice: quartic.id, pair: { ...a.pair, y: String(quartic.curve.k + quartic.curve.a / 4) } });
  });

  it('rejects a locked polyline, an incorrect vertex and repeated point coordinates', () => {
    const t = functionGardenSpecs.find(s => s.id === 'M79-PARABOLA-GRAPH')!.item(rng(3), 'transfer').task;
    const a = oracle(t);
    if (t.mode !== 'parabola-graph' || a.mode !== 'parabola-graph') throw new Error('Expected plotting task');
    reject(t, { ...a, path: 'segments' });
    reject(t, { ...a, vertex: a.points[0]! });
    reject(t, { ...a, points: [...a.points.slice(0, -1), a.points[0]!] });
    reject(t, { ...a, mirror: [String(t.curve.h), String(t.curve.h)] });
    reject(t, { ...a, points: new Array(5) });
  });

  it('accepts equivalent arithmetic intercepts and geometric fractional anchors while rejecting missing tests', () => {
    const spec = functionGardenSpecs.find(s => s.id === 'M79-SEQ-01')!;
    for (const phase of ['independent', 'transfer'] as const) {
      for (let seed = 0; seed < 32; seed++) {
        const t = spec.item(rng(seed), phase).task, a = oracle(t);
        if (t.mode !== 'sequence' || a.mode !== 'sequence' || !a.rule) throw new Error('Expected sequence integration');
        const first = t.observed[0]!.value, step = a.pattern === 'ratio' ? t.observed[1]!.value / first : t.observed[1]!.value - first;
        const intercept = a.pattern === 'ratio' ? `${first}/${step ** t.start}` : String(first - step * t.start);
        const rule = { form: 'anchored' as const, anchor: '0', value: intercept, step: String(step) };
        accept(t, { ...a, rule });
        reject(t, { ...a, rule: { ...rule, step: '2/0' } });
        reject(t, { ...a, rule: { ...rule, anchor: '10000000' } });
        reject(t, { ...a, firstIndex: String(t.start + 1) });
        reject(t, { ...a, steps: [a.steps[0]!] });
        reject(t, { ...a, checkTerm: '' });
      }
    }
  });
});
