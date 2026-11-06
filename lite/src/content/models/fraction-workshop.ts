import type { Verdict } from '../../engine/types';

export interface Fraction { n: number; d: number }
export type FractionSurface = 'basin' | 'rope';

export interface FractionLine {
  kind: 'fraction-line';
  amount: Fraction;
  min: number;
  max: number;
  surface: FractionSurface;
}
export interface FractionExpand {
  kind: 'fraction-expand';
  amount: Fraction;
  factor: number;
  surface: FractionSurface;
  repair: boolean;
}
export interface FractionCompare {
  kind: 'fraction-compare';
  left: Fraction;
  right: Fraction;
  method: 'half' | 'common';
  common?: number;
  surface: FractionSurface;
}
export type FractionMixed = { kind: 'fraction-mixed'; surface: FractionSurface } & (
  | { direction: 'to-improper'; whole: number; part: Fraction }
  | { direction: 'to-mixed'; amount: Fraction }
);
export interface FractionSubtractTask {
  kind: 'fraction-subtract';
  left: Fraction;
  right: Fraction;
  surface: FractionSurface;
}
export interface FractionSubtractResponse {
  kind: 'fraction-subtract';
  common: number;
  n: number;
  d: number;
}
export type FractionWorkshopModel = FractionLine | FractionExpand | FractionCompare | FractionMixed | FractionSubtractTask;

const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
export const commonDenominator = (a: number, b: number) => a / gcd(a, b) * b;
export const expandFraction = ({ n, d }: Fraction, factor: number): Fraction => ({ n: n * factor, d: d * factor });
export const improperFraction = (whole: number, part: Fraction): Fraction => ({ n: whole * part.d + part.n, d: part.d });
export function mixedFraction({ n, d }: Fraction) {
  return { whole: Math.floor(n / d), part: { n: n % d, d } };
}
export const fractionSymbol = ({ n, d }: Fraction): string => `${n}/${d}`;

export function compareFraction(a: Fraction, b: Fraction): '<' | '=' | '>' {
  const delta = a.n * b.d - b.n * a.d;
  return delta < 0 ? '<' : delta > 0 ? '>' : '=';
}

export function isCommonDenominator(task: FractionSubtractTask, common: number): boolean {
  return Number.isSafeInteger(common) && common > 0 && common % task.left.d === 0 && common % task.right.d === 0;
}

export function subtractionPartition(task: FractionSubtractTask, common: number) {
  if (!isCommonDenominator(task, common)) throw new RangeError('Both fractions must have whole numbers of the common parts');
  const starting = task.left.n * (common / task.left.d);
  const removed = task.right.n * (common / task.right.d);
  return { starting, removed, remaining: starting - removed };
}

export function checkFractionSubtract(task: FractionSubtractTask, response: FractionSubtractResponse): Verdict {
  const { common, n, d } = response;
  if (!isCommonDenominator(task, common)) {
    return { ok: false, why: 'Valitse koko jaolle osamäärä, joka on jaollinen kummallakin alkuperäisellä nimittäjällä. Silloin kummankin osuuden voi jakaa saman kokoisiin paloihin.' };
  }
  if (!Number.isSafeInteger(n) || n < 0 || !Number.isSafeInteger(d) || d < 1) {
    return { ok: false, why: 'Kirjoita jäljelle jäävän määrän osoittaja ja positiivinen nimittäjä kokonaislukuina.' };
  }
  const left = BigInt(task.left.n) * BigInt(task.right.d);
  const right = BigInt(task.right.n) * BigInt(task.left.d);
  const denominator = BigInt(task.left.d) * BigInt(task.right.d);
  return BigInt(n) * denominator === (left - right) * BigInt(d) ? { ok: true } : {
    ok: false, why: 'Yhteinen jako sopii. Vähennä saman kokoisten palojen lukumäärät. Palojen koko eli nimittäjä säilyy, jos kirjoitat tuloksen samassa jaossa.',
  };
}

export function solutionFractionSubtract(task: FractionSubtractTask): FractionSubtractResponse {
  const common = commonDenominator(task.left.d, task.right.d);
  return { kind: 'fraction-subtract', common, n: subtractionPartition(task, common).remaining, d: common };
}

export function wrongFractionSubtract(task: FractionSubtractTask): FractionSubtractResponse[] {
  const answer = solutionFractionSubtract(task);
  return [{ ...answer, common: 1 }, { ...answer, n: answer.n + 1 }, { ...answer, d: 0 }];
}
