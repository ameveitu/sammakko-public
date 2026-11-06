import { expect, it } from 'vitest';
import { geometryCriterion, pairGeometry, sameTriangleFacts, validDiagonals,
  type GeoPoint, type GeoShape } from '../src/content/models/geometry-relations';

it('preserves reflected similarities and rejects directional stretching across independent shapes', () => {
  for (let width = 2; width < 8; width++) for (let height = 2; height < 7; height++) {
    const shape = [{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width + 1, y: height }, { x: 1, y: height + 1 }];
    for (const scale of [1, 2, 3]) for (const mirror of [-1, 1]) {
      const transformed = shape.map(({ x, y }) => ({ x: 17 - scale * y, y: -9 + scale * mirror * x }));
      expect(pairGeometry(shape, transformed, 'similar')).toBe(true);
      expect(pairGeometry(shape, transformed, 'congruent')).toBe(scale === 1);
    }
    expect(pairGeometry(shape, shape.map(({ x, y }) => ({ x: x * 2, y })), 'similar')).toBe(false);
  }
});

it('distinguishes included angles, angle-only similarity and supplementary angles', () => {
  const side = (a: number, b: number) => ({ kind: 'side' as const, a, b });
  const angle = (at: number) => ({ kind: 'angle' as const, at });
  expect(geometryCriterion([side(0, 1), side(0, 2), angle(0)], 'congruent')).toBe('SAS');
  expect(geometryCriterion([side(0, 1), side(0, 2), angle(1)], 'congruent')).toBeUndefined();
  expect(geometryCriterion([angle(0), angle(1), angle(2)], 'congruent')).toBeUndefined();
  expect(geometryCriterion([angle(0), angle(1)], 'similar')).toBe('AA');
  expect(geometryCriterion([side(0, 1), angle(0), angle(1)], 'congruent')).toBe('ASA');
  expect(geometryCriterion([side(0, 1), angle(0), angle(2)], 'congruent')).toBe('AAS');
  const acute = [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }];
  const obtuse = [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 1 }];
  expect(sameTriangleFacts(acute, obtuse, [angle(0)], 'similar')).toBe(false);
});

// Enumerate triangulations by recursively choosing the triangle on one boundary
// edge. This is independent of the checker’s pairwise diagonal-crossing test.
function triangulations(vertices: string[]): string[][][] {
  if (vertices.length < 3) return [[]];
  const result: string[][][] = [];
  for (let k = 1; k < vertices.length - 1; k++) {
    for (const left of triangulations(vertices.slice(0, k + 1)))
      for (const right of triangulations(vertices.slice(k))) {
        result.push([...left, ...right,
          ...(k > 1 ? [[vertices[0]!, vertices[k]!]] : []),
          ...(k < vertices.length - 2 ? [[vertices[k]!, vertices.at(-1)!]] : []),
        ]);
      }
  }
  return result;
}
it('accepts every Catalan triangulation and its reversed drawing order', () => {
  const positions: GeoPoint[] = [[0, 0], [3, -1], [6, 1], [7, 4], [5, 7], [1, 8], [-2, 5]].map(([x, y]) => ({ x: x!, y: y! }));
  const expected = [1, 2, 5, 14, 42];
  for (let n = 3; n <= 7; n++) {
    const shape: GeoShape = { id: 'P', label: 'Kupera kuvio', vertices: positions.slice(0, n).map((p, i) => ({ ...p, id: String(i) })) };
    const alternatives = triangulations(shape.vertices.map(v => v.id));
    expect(alternatives).toHaveLength(expected[n - 3]!);
    for (const pairs of alternatives) {
      expect(validDiagonals(shape, pairs)).toBe(true);
      expect(validDiagonals(shape, pairs.slice().reverse().map(pair => pair.slice().reverse()))).toBe(true);
      if (pairs.length) expect(validDiagonals(shape, [...pairs.slice(1), ['0', '1']])).toBe(false);
    }
  }
});
