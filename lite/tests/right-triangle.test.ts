import { describe, expect, it } from 'vitest';
import { rightTriangleSpecs } from '../src/content/right-triangle';
import {
  checkRightTriangle, recordedRightTriangleWork, solutionRightTriangle, type RightTriangleDiagram, type RightTriangleResponse,
  type RightTriangleTask, type TriangleIndex, type TriangleWork, type TrigRatio,
} from '../src/content/models/right-triangle';
import { rightTriangleScene } from '../src/content/scenes/right-triangle';
import { rng } from '../src/engine/rng';

const indexes = [0, 1, 2] as const;
const excluding = (i: TriangleIndex) => indexes.filter(n => n !== i) as [TriangleIndex, TriangleIndex];
const delta = (a: readonly [number, number], b: readonly [number, number]) => [b[0] - a[0], b[1] - a[1]] as const;
function geometry(diagram: RightTriangleDiagram) {
  const sides = indexes.map(i => {
    const [j, k] = excluding(i);
    return Math.hypot(...delta(diagram.points[j], diagram.points[k]));
  });
  const angles = indexes.map(i => {
    const [j, k] = excluding(i);
    const [ax, ay] = delta(diagram.points[i], diagram.points[j]);
    const [bx, by] = delta(diagram.points[i], diagram.points[k]);
    return Math.atan2(Math.abs(ax * by - ay * bx), ax * bx + ay * by) * 180 / Math.PI;
  });
  return { sides, angles };
}
function angleClass(angle: number) {
  return Math.abs(angle - 90) < 1e-7 ? 'right' : angle > 90 ? 'obtuse' : 'acute';
}
function theoreticalPair(board: RightTriangleDiagram, focus: TriangleIndex, ratio: TrigRatio): [TriangleIndex, TriangleIndex] {
  const { sides } = geometry(board);
  const hypotenuse = indexes.reduce((longest, index) => sides[index]! > sides[longest]! ? index : longest);
  const around = indexes.find(i => i !== focus && i !== hypotenuse)!;
  const role: Record<TrigRatio, [TriangleIndex, TriangleIndex]> = {
    sin: [focus, hypotenuse], cos: [around, hypotenuse], tan: [focus, around],
  };
  return role[ratio];
}
function independentlySolve(task: RightTriangleTask): RightTriangleResponse {
  const work = task.jobs.map((job): TriangleWork => {
    const diagram = task.diagrams[job.board]!, { angles, sides } = geometry(diagram);
    for (const index of indexes) if (diagram.known[index] !== undefined)
      expect(sides[index]).toBeCloseTo(diagram.known[index]!, 8);
    if (diagram.right !== undefined) expect(angles[diagram.right]).toBeCloseTo(90, 8);

    if (job.kind === 'identity') {
      const longest = angles.findIndex(angle => Math.abs(angle - 90) < 1e-7) as TriangleIndex;
      const [a, b] = excluding(longest);
      expect(sides[a]! ** 2 + sides[b]! ** 2).toBeCloseTo(sides[longest]! ** 2, 8);
      const other = geometry(task.diagrams[job.comparison]!);
      return { single: longest, pair: [b, a], judgment: angleClass(Math.max(...other.angles)) };
    }
    if (job.kind === 'converse') {
      const longest = indexes.find(i => diagram.known[i] === Math.max(...Object.values(diagram.known)))!;
      const [a, b] = excluding(longest);
      return { single: longest, sum: String(diagram.known[a]! ** 2 + diagram.known[b]! ** 2),
        square: String(diagram.known[longest]! ** 2), judgment: angleClass(Math.max(...angles)) };
    }
    if (job.kind === 'pyth-length') {
      const hypotenuse = angles.findIndex(angle => Math.abs(angle - 90) < 1e-7) as TriangleIndex;
      const rest = excluding(job.target);
      const pair = job.target === hypotenuse ? rest.reverse() : rest.sort((a, b) => sides[b]! - sides[a]!);
      const square = Math.round(sides[job.target]! ** 2);
      return { pair, rule: job.target === hypotenuse ? 'sqrt-sum' : 'sqrt-difference',
        square: String(square), value: `√${square}` };
    }
    if (job.kind === 'ratio') {
      const ratio = job.taught ?? (['sin', 'cos', 'tan'] as const).find(kind => theoreticalPair(diagram, job.focus, kind)
        .every(side => job.offered!.includes(side)))!;
      const pair = theoreticalPair(diagram, job.focus, ratio);
      return { ratio, pair, ...(job.taught || job.calculate
        ? { value: `${diagram.known[pair[0]]! * 5}/${diagram.known[pair[1]]! * 5}` } : {}) };
    }
    const pair = theoreticalPair(diagram, job.focus, job.taught);
    if (job.kind === 'trig-side') {
      expect(angles[job.focus]).toBeCloseTo(job.degrees, 8);
      const value = sides[job.target]!.toFixed(1).replace('.', ',');
      return { ratio: job.taught, pair, rule: job.target === pair[0] ? 'times' : 'divide', value };
    }
    return { ratio: job.taught, pair, rule: 'inverse', value: angles[job.focus]!.toFixed(1).replace('.', ',') };
  });
  return { kind: 'right-triangle', work };
}
const taskAt = (id: string, seed: number, transfer = false) => rightTriangleSpecs.find(s => s.id === id)!
  .item(rng(seed), transfer ? 'transfer' : 'independent').task as unknown as RightTriangleTask;

describe('Köysisillan measurement oracle', () => {
  it('keeps only number notation from numeric response fields', () => {
    expect(recordedRightTriangleWork({ pair: [0, 1], sum: 'local draft', square: ' √81 ', value: '2:3' }))
      .toEqual({ pair: [0, 1], square: '√81', value: '2:3' });
  });

  it('checks the geometry and independent responses of both authored families and transfer', () => {
    const seen = new Map<string, Set<string>>();
    for (const spec of rightTriangleSpecs) {
      const independentShapes = new Set<string>();
      for (const phase of ['independent', 'transfer'] as const) for (let seed = 0; seed < 72; seed++) {
        const item = spec.item(rng(seed), phase), task = item.task as unknown as RightTriangleTask;
        expect(spec.item(rng(seed), phase).task).toEqual(item.task);
        if (phase === 'independent') {
          if (!seen.has(spec.id)) seen.set(spec.id, new Set());
          seen.get(spec.id)!.add(item.tag);
          independentShapes.add(JSON.stringify([task.diagrams.map(d => [d.known, d.focus, d.target, d.markedAngle]), task.jobs]));
        }
        const independent = independentlySolve(task);
        expect(checkRightTriangle(task, independent), `${spec.id} ${phase} ${seed}`).toEqual({ ok: true });
        expect(checkRightTriangle(task, solutionRightTriangle(task)).ok).toBe(true);
        expect(checkRightTriangle(task, { ...independent, work: Array(task.jobs.length) }).ok).toBe(false);
        expect(checkRightTriangle(task, { ...independent, work: [Object.create(independent.work[0]!), ...independent.work.slice(1)] }).ok).toBe(false);
        if (task.jobs.length > 1)
          expect(checkRightTriangle(task, { ...independent, work: independent.work.slice(0, -1) }).ok).toBe(false);
        const stage = rightTriangleScene(task);
        if (stage) {
          expect(stage.vertices).toHaveLength(3);
          expect(stage.shownSides).toEqual(indexes.filter(i => task.diagrams[0]!.known[i] !== undefined));
          expect(Object.keys(stage).sort()).toEqual(['focus','kind','mode','right','shownSides','title','vertices']);
        }
      }
      expect(independentShapes.size, spec.id).toBeGreaterThanOrEqual(8);
      expect([...seen.get(spec.id)!].sort()).toEqual([...spec.produce!].sort());
    }
  });

  it('rejects wrong-side, inverted-ratio, forward-function and false-precision responses', () => {
    const ratio = taskAt('M79-SIN', 12);
    const exact = independentlySolve(ratio);
    const first = exact.work[0]!;
    const reject = (task: RightTriangleTask, row: Partial<TriangleWork>) => {
      const base = independentlySolve(task);
      expect(checkRightTriangle(task, { ...base, work: [{ ...base.work[0], ...row }, ...base.work.slice(1)] }).ok).toBe(false);
    };
    reject(ratio, { pair: [...first.pair!].reverse() });
    reject(ratio, { value: '1/0' });
    reject(ratio, { value: '1e1' });
    reject(ratio, { ratio: 'cos' });
    reject(taskAt('M79-PYTH-CALC', 7, true), { rule: 'sqrt-sum' });
    reject(taskAt('M79-TRIG-ANGLE', 4), { rule: 'times' });
    reject(taskAt('M79-TRIG-ANGLE', 4), { value: '180' });
    reject(taskAt('M79-TRIG-ANGLE', 4), { value: '0.5' });
    const integration = taskAt('M79-TRIG-CALC', 9);
    const both = independentlySolve(integration);
    expect(checkRightTriangle(integration, { ...both, work: [both.work[0]!, { ...both.work[1], rule: 'times' }] }).why).toContain('Rivi 2');
  });

  it('scopes readiness to the authored ratio across both families and transfer', () => {
    for (const [id, ratio] of [['M79-TRIG-SIDE','tan'],['M79-TRIG-ANGLE','cos']] as const)
      for (let seed = 0; seed < 16; seed++) for (const transfer of [false, true]) {
        const task = taskAt(id, seed, transfer);
        expect(task.context).toEqual({ kind: 'trig', ratio });
        expect(task.jobs[0]).toMatchObject({ taught: ratio });
      }
    const transfer = taskAt('M79-TRIG-SIDE', 1, true);
    const target = transfer.diagrams[0]!.target!;
    expect(target).toBe(2);
  });

  it('uses the changed observation point and allows tied longest sides in a converse comparison', () => {
    const board: RightTriangleDiagram = {
      name: 'Kahden yhtä pitkän sivun vertailu', labels: ['A','B','C'], unit: 'cm',
      points: [[0,0],[4,0],[1.125,Math.sqrt(9 - 1.125 ** 2)]], known: { 0:4, 1:3, 2:4 },
    };
    const t: RightTriangleTask = { kind: 'right-triangle', diagrams: [board], jobs: [{ kind: 'converse', board: 0 }] };
    for (const longest of [0, 2] as const) expect(checkRightTriangle(t, { kind:'right-triangle',
      work: [{ single: longest, sum: '25', square: '16', judgment: 'acute' }],
    }).ok).toBe(true);
    for (const id of ['M79-SIN','M79-COS','M79-TRIG-01']) {
      const training = taskAt(id, 1), transfer = taskAt(id, 1, true);
      expect(training.diagrams[0]!.focus).toBe(1);
      expect(transfer.diagrams[0]!.focus).toBe(2);
    }
    const tanViewpoints = new Set(Array.from({ length: 20 }, (_, seed) => taskAt('M79-TAN', seed).diagrams[0]!.focus));
    expect(tanViewpoints).toEqual(new Set([1, 2]));
    expect(taskAt('M79-TAN', 1, true).diagrams[0]).toMatchObject({ name: 'Luiskan sivukuva', focus: 1 });
  });
});
