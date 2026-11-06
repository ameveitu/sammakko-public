import { describe, expect, it } from 'vitest';
import { sailShapeEvidence, sailShapeSpecs } from '../src/content/sail-shapes';
import { checkSailShape, equilateral, isConcave, isPolygon, path, polygonProperties, quadrilateralTypes, solutionSailShape, transform, triangleTypes,
  type BuildShapeTask, type CircleShapeTask, type NameShapeTask, type PathShape, type Point } from '../src/content/models/sail-shapes';
import { check, solution, wrongs } from '../src/engine/check';
import { rng } from '../src/engine/rng';

const ids = ['M-GEO-06', 'M-GEO-10', 'M-GEO-2D-CLASSIFY', 'M-GEO-2D-PROP-NAME', 'M-GEO-CIRCLE-ID', 'M-GEO-CIRCLE-PROP',
  'M-GEO-13', 'M-GEO-QUAD-CLASS', 'M-GEO-QUAD-PROP', 'M-GEO-12', 'M-GEO-TRI-CLASS', 'M-GEO-TRI-PROP', 'M-GEO-11'];
const find = (id: string) => sailShapeSpecs.find(node => node.id === id)!;
const rotated = (shape: PathShape) => transform(shape, 1, 2, 15, -5);
const vertex = (x: number, y: number): Point => [x, y];

describe('Lehtipurjeiden kuviopoukama', () => {
  it('exports exactly the work order with distinct versions and evidence limits', () => {
    expect(sailShapeSpecs.map(({ id }) => id)).toEqual(ids);
    expect(Object.keys(sailShapeEvidence)).toEqual(ids);
    expect(new Set(sailShapeSpecs.map(({ rev }) => rev)).size).toBe(ids.length);
    for (const node of sailShapeSpecs) {
      expect(node.validRevs).toEqual(node.id === 'M-GEO-06' ? ['exp690-sail-build-v1', 'exp690-sail-build-v2'] : [node.rev]);
      expect(sailShapeEvidence[node.id]!.limit.length).toBeGreaterThan(40);
      for (const demo of node.demo(rng(1))) {
        const host = { innerHTML: '' } as HTMLElement;
        demo.scene(host);
        expect(host.innerHTML).toContain('sail-shape-workbench');
      }
    }
  });
  it.each(ids)('%s has deterministic valid families, graded misconceptions and transfer', id => {
    const seen = new Set<string>();
    for (const phase of ['guided', 'independent', 'transfer', 'retrieval'] as const) {
      for (let seed = 0; seed < 32; seed++) {
        const item = find(id).item(rng(seed), phase);
        expect(item.task).toEqual(find(id).item(rng(seed), phase).task);
        expect(check(item.task, solution(item.task)).ok).toBe(true);
        for (const wrong of wrongs(item.task)) expect(check(item.task, wrong).ok).toBe(false);
        if (phase === 'independent') seen.add(item.tag);
        if (phase === 'transfer') expect(item.tag).toBe('transfer');
      }
    }
    expect([...seen].sort()).toEqual([...sailShapeEvidence[id]!.families].sort());
  });
  it('rejects a nonzero-area crossing, doubling back, open edge and arc, accepting concave and straight-edge seams', () => {
    const notch = path([[0, 0], [4, 0], [1, 1], [4, 4], [0, 4]]);
    expect(isPolygon(notch)).toBe(true);
    expect(isConcave(notch)).toBe(true);
    expect(isConcave(rotated(notch))).toBe(true);
    expect(polygonProperties(notch).angles[2]).toBe('reflex');
    expect(polygonProperties(path([...notch.points].reverse())).angles[2]).toBe('reflex');
    expect(polygonProperties(rotated(notch)).angles[2]).toBe('reflex');
    expect(isPolygon({ ...notch, closed: false })).toBe(false);
    expect(isPolygon({ ...notch, straight: false })).toBe(false);
    expect(isPolygon(path([[0, 0], [5, 3], [5, 0], [1, 3]]))).toBe(false);
    expect(isPolygon(path([[0, 0], [5, 0], [4, 0], [2, 2]]))).toBe(false);
    const seam = path([[0, 0], [2, 0], [4, 0], [4, 4], [0, 4]]);
    expect(isPolygon(seam)).toBe(true);
    expect(polygonProperties(seam).count).toBe(4);
  });
  it('keeps side and angle classifications independent under rotation and size changes', () => {
    for (const [points, sides] of [
      [[[0, 0], [4, 0], [0, 4]], 'isosceles'], [[[0, 0], [5, 0], [2, 5]], 'scalene'], [[[0, 0], [10, 0], [1, 2]], 'scalene'],
    ] as const) {
      const triangle = path(points);
      const [a, b, c] = points;
      const squared = (p: Point, q: Point) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2;
      const [small, middle, large] = [squared(a, b), squared(b, c), squared(c, a)].sort((l, r) => l - r);
      const angles = large === small + middle ? 'right' : large > small + middle ? 'obtuse' : 'acute';
      expect(triangleTypes(triangle)).toEqual({ sides: [sides], angles });
      expect(triangleTypes(rotated(triangle))).toEqual({ sides: [sides], angles });
    }
  });
  it('grades a rotated exact equilateral triangle as both isosceles and equilateral', () => {
    const regular = equilateral(4, 1, -2);
    expect(isPolygon(regular)).toBe(true);
    expect(polygonProperties(regular).lengths).toEqual([80, 80, 80]);
    expect(triangleTypes(regular)).toEqual({ sides: ['isosceles', 'equilateral'], angles: 'acute' });
    const task = find('M-GEO-TRI-CLASS').item(rng(3), 'transfer').task;
    if (task.kind !== 'sail-shapes' || task.activity !== 'inspect') throw new Error('Expected the transfer sort');
    const response = { kind: task.kind, activity: task.activity, sets: { class: ['isosceles', 'equilateral'], reason: ['equilateral'] } };
    expect(check(task, response).ok).toBe(true);
    expect(check(task, { ...response, sets: { ...response.sets, class: ['equilateral'] } }).ok).toBe(false);
  });
  it('preserves the inclusive memberships of a tilted square, long rectangle, slanted parallelogram and trapezoid', () => {
    for (const [points, expected] of [
      [[[0, 0], [2, 0], [2, 2], [0, 2]], ['quadrilateral', 'trapezoid', 'parallelogram', 'rectangle', 'square']],
      [[[0, 0], [5, 0], [5, 2], [0, 2]], ['quadrilateral', 'trapezoid', 'parallelogram', 'rectangle']],
      [[[0, 0], [4, 0], [5, 2], [1, 2]], ['quadrilateral', 'trapezoid', 'parallelogram']],
      [[[0, 0], [4, 0], [3, 2], [1, 2]], ['quadrilateral', 'trapezoid']],
    ] as const) expect(quadrilateralTypes(rotated(path(points)))).toEqual(expected);
  });
  it('transfers overlapping groups and distinguishes both rotated quadrilateral memberships', () => {
    const sort = find('M-GEO-2D-CLASSIFY').item(rng(2), 'transfer').task;
    const classify = find('M-GEO-QUAD-CLASS').item(rng(2), 'transfer').task;
    if (sort.kind !== 'sail-shapes' || sort.activity !== 'inspect' || classify.kind !== 'sail-shapes' || classify.activity !== 'inspect') {
      throw new Error('Expected two inspections');
    }
    const triangles = sort.figures.filter(({ shape }) => shape.kind === 'equilateral'
      || (shape.kind === 'path' && shape.points.length === 3)).map(({ id }) => id);
    const regular = sort.figures.find(({ shape }) => shape.kind === 'equilateral')!.id;
    const square = sort.figures.find(({ shape }) => shape.kind === 'path'
      && shape.points.length === 4
      && Math.hypot(shape.points[0]![0] - shape.points[1]![0], shape.points[0]![1] - shape.points[1]![1])
      === Math.hypot(shape.points[1]![0] - shape.points[2]![0], shape.points[1]![1] - shape.points[2]![1]))!.id;
    expect(check(sort, { kind: sort.kind, activity: sort.activity, sets: { triangle: triangles, equal: [regular, square], boundary: ['unequal'] } }).ok).toBe(true);
    const shared = ['quadrilateral', 'rectangle', 'parallelogram', 'trapezoid'];
    const sets = Object.fromEntries(classify.figures.map(({ id, shape }) => {
      if (shape.kind !== 'path') throw new Error('Expected a quadrilateral');
      const [a, b, c] = shape.points;
      const equal = Math.hypot(a![0] - b![0], a![1] - b![1]) === Math.hypot(b![0] - c![0], b![1] - c![1]);
      return [id, equal ? [...shared, 'square'] : shared];
    }));
    expect(Object.values(sets).map(group => group.length).sort()).toEqual([4, 5]);
    expect(check(classify, { kind: classify.kind, activity: classify.activity, sets }).ok).toBe(true);
  });
  it('checks all build distances and scale despite rotation, reversed traversal, shift and starting corner', () => {
    const task: BuildShapeTask = { kind: 'sail-shapes', activity: 'build', reference: path([[0, 0], [4, 0], [3, 2], [1, 2]]), scale: 2, grid: 12 };
    const valid = [vertex(4, 3), vertex(4, 7), vertex(8, 9), vertex(8, 1)];
    const respond = (vertices: Point[], closed = true) => checkSailShape(task, { kind: task.kind, activity: task.activity, vertices, closed });
    expect(respond(valid).ok).toBe(true);
    expect(respond(valid, false).ok).toBe(false);
    expect(respond(valid.map(([x, y]) => [x / 2, y / 2])).ok).toBe(false);
    expect(respond([vertex(4, 2), ...valid.slice(1)]).ok).toBe(false);
    expect(respond([valid[0]!, valid[2]!, valid[1]!, valid[3]!]).ok).toBe(false);
    expect(respond(valid.map(([x, y]) => [x + 10, y])).ok).toBe(false);
  });
  it('accepts controlled Finnish inflection and requires both the feature and the learner name', () => {
    const task: NameShapeTask = { kind: 'sail-shapes', activity: 'name', shape: path([[0, 0], [2, 0], [1, 1]]),
      name: 'kärki', target: 'P', features: [{ id: 'P', index: 0, kind: 'vertex' }] };
    const respond = (text: string, feature = 'P') => checkSailShape(task, { kind: task.kind, activity: task.activity, text, feature });
    expect(respond(' KÄRJEN. ').ok).toBe(true);
    expect(respond('kulmapiste').ok).toBe(true);
    expect(respond('kulma').ok).toBe(false);
    expect(respond('sininen').ok).toBe(false);
    expect(respond('kärki', 'Q').ok).toBe(false);
  });
  it('requires different circumference points and rejects a chord missing the center', () => {
    const task: CircleShapeTask = { kind: 'sail-shapes', activity: 'circle', figures: [
      { id: 'X', shape: { kind: 'ellipse', rx: 7, ry: 5 } }, { id: 'Y', shape: { kind: 'circle', radius: 5 } },
    ], points: [{ id: 'O', at: [0, 0] }, { id: 'P', at: [3, 4] }, { id: 'Q', at: [-3, -4] }, { id: 'R', at: [-4, 3] }],
    segments: [{ id: '1', a: 'O', b: 'P' }, { id: '2', a: 'R', b: 'O' }, { id: '3', a: 'P', b: 'Q' }, { id: '4', a: 'R', b: 'Q' }, { id: '5', a: 'P', b: 'O' }] };
    const answer = { kind: task.kind, activity: task.activity, figure: 'Y', center: 'O', radii: ['1', '2'], diameter: '3' };
    expect(checkSailShape(task, answer).ok).toBe(true);
    expect(checkSailShape(task, { ...answer, diameter: '4' }).ok).toBe(false);
    expect(checkSailShape(task, { ...answer, radii: ['1', '5'] }).ok).toBe(false);
    expect(checkSailShape(task, { ...answer, figure: 'X' }).ok).toBe(false);
  });
  it.each(['M-GEO-12', 'M-GEO-11'])('rejects a correct %s class without its figure and observation', id => {
    const task = find(id).item(rng(1), 'transfer').task;
    if (task.kind !== 'sail-shapes') throw new Error('Expected geometric inspection');
    const result = solutionSailShape(task);
    if (result.activity !== 'inspect') throw new Error('Expected several integrated observations');
    expect(checkSailShape(task, { ...result, sets: { class: result.sets.class! } }).ok).toBe(false);
    expect(checkSailShape(task, result).ok).toBe(true);
  });
});
