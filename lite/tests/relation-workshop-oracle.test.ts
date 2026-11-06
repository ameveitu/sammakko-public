import { expect, it } from 'vitest';
import { relationSystem, evaluateRelationFunction, type LinearEquation } from '../src/content/models/relation-workshop';

const number = (text: string) => {
  const parts = text.split('/').map(Number);
  return parts.length === 1 ? parts[0]! : parts[0]! / parts[1]!;
};

it('recovers constructed rational intersections after row exchange and negative rescaling', () => {
  let checked = 0;
  for (const x of [-2.5, -1, 0, 1.5, 3]) for (const y of [-3, -.5, 0, 2.5])
    for (const a of [-4, -2, 0, 2, 4]) for (const b of [-4, -2, 2, 4]) {
      // Two distinct directions with a known intersection; one may be horizontal/vertical.
      const c = -b, d = a;
      const first: LinearEquation = [a, b, a * x + b * y];
      const second: LinearEquation = [c, d, c * x + d * y];
      for (const lines of [[first, second], [second, first],
        [first.map(v => -3 * v), second.map(v => 2 * v)]] as [LinearEquation, LinearEquation][]) {
        const result = relationSystem(lines);
        expect(result.type).toBe('one');
        if (result.type !== 'one') throw new Error('Expected a single intersection');
        expect(number(result.point.x)).toBe(x);
        expect(number(result.point.y)).toBe(y);
        checked++;
      }
    }
  expect(checked).toBe(1200);
});

it('distinguishes a redundant equation from an inconsistent equation, including zero rows', () => {
  for (const a of [-3, -1, 0, 2]) for (const b of [-2, 1, 3]) for (const scale of [-4, -2, 3]) {
    const first: LinearEquation = [a, b, 7];
    expect(relationSystem([first, [a * scale, b * scale, 7 * scale]]).type).toBe('many');
    expect(relationSystem([first, [a * scale, b * scale, 7 * scale + 1]]).type).toBe('none');
  }
  expect(relationSystem([[0, 0, 0], [1, 2, 3]]).type).toBe('many');
  expect(relationSystem([[0, 0, 1], [1, 2, 3]]).type).toBe('none');
  expect(relationSystem([[1, 2, 3], [0, 0, -1]]).type).toBe('none');
});

it('evaluates factored functions like their independently expanded polynomial', () => {
  for (const a of [-3, -1, 2]) for (const b of [-4, 0, 3]) for (const c of [-2, 1, 3]) for (const d of [-3, 0, 4])
    for (const x of [-2.5, -1, 0, .5, 3]) {
      const actual = evaluateRelationFunction({ kind: 'factored', a, b, c, d }, String(x));
      expect(actual).toBeDefined();
      const expected = a * c * x * x + (a * d + b * c) * x + b * d;
      expect(number(actual!)).toBe(expected === 0 ? 0 : expected);
    }
});
