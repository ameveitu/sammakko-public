import type { Verdict } from '../../engine/types';
import { decimalLabel } from './decimal-workshop';

export type RationalFormat = 'fraction' | 'decimal' | 'percent';

export interface RationalLinkLabel {
  format: RationalFormat;
  /** An authoritative label from the station or recipient. */
  given?: string;
  /** Editable draft from the station, potentially mismatching the anchor. */
  proposed?: string;
}

export interface RationalLinkTask {
  kind: 'rational-link';
  expectedHundredths: number;
  labels: readonly RationalLinkLabel[];
}

export interface RationalLinkResponse {
  kind: 'rational-link';
  values: Partial<Record<RationalFormat, string>>;
}

export const rationalFormatNames: Readonly<Record<RationalFormat, string>> = {
  fraction: 'Murtoluku', decimal: 'Desimaaliluku', percent: 'Prosentti',
};

type Fraction = readonly [numerator: bigint, denominator: bigint];

function readRational(format: RationalFormat, text: string): Fraction | undefined {
  if (format === 'fraction') {
    const match = /^\s*(\d{1,8})\s*\/\s*(\d{1,8})\s*$/.exec(text);
    if (!match) return undefined;
    const denominator = BigInt(match[2]!);
    return denominator > 0n ? [BigInt(match[1]!), denominator] : undefined;
  }
  const clean = format === 'percent' ? text.trim().replace(/\s*%$/, '') : text.trim();
  const match = /^(\d{1,8})(?:[,.](\d{1,8}))?$/.exec(clean);
  if (!match) return undefined;
  const decimals = match[2] ?? '';
  const numerator = BigInt(match[1]! + decimals);
  const denominator = 10n ** BigInt(decimals.length);
  return [numerator, format === 'percent' ? denominator * 100n : denominator];
}

function sameShare(text: string, format: RationalFormat, expectedHundredths: number): boolean {
  const value = readRational(format, text);
  return !!value && 100n * value[0] === BigInt(expectedHundredths) * value[1];
}

function mismatch(format: RationalFormat): string {
  if (format === 'fraction') return 'Tarkista murtoluku. Nimittäjä kertoo, moneen yhtä suureen osaan yksi kokonainen on jaettu.';
  if (format === 'decimal') return 'Tarkista desimaaliluku. Yksi kokonainen on 1,00 ja yksi sadasosa on 0,01.';
  return 'Tarkista prosenttiluku. Yksi kokonainen on 100 % ja yksi sadasosa on 1 %.';
}

/** The answer scale is one named whole. Equivalent fraction and decimal spellings are accepted exactly. */
export function checkRationalLink(task: RationalLinkTask, response: RationalLinkResponse): Verdict {
  if (!response.values || typeof response.values !== 'object' || Array.isArray(response.values)) return { ok: false };
  if (!Number.isSafeInteger(task.expectedHundredths) || task.expectedHundredths < 0) return { ok: false };
  const expected = task.labels.filter(label => label.given === undefined);
  const formats = new Set<string>(expected.map(label => label.format));
  if (!expected.length || Object.keys(response.values).some(format => !formats.has(format))) return { ok: false };
  for (const label of task.labels) {
    const text = label.given ?? (Object.hasOwn(response.values, label.format) ? response.values[label.format] : undefined);
    if (typeof text !== 'string' || !sameShare(text, label.format, task.expectedHundredths)) {
      return { ok: false, why: mismatch(label.format) };
    }
  }
  return { ok: true };
}

export function rationalMark(format: RationalFormat, hundredths: number): string {
  if (format === 'percent') return String(hundredths);
  if (format === 'decimal') return decimalLabel(hundredths);
  let a = hundredths, b = 100;
  while (b) [a, b] = [b, a % b];
  return `${hundredths / a}/${100 / a}`;
}

export function solutionRationalLink(task: RationalLinkTask): RationalLinkResponse {
  const values: RationalLinkResponse['values'] = {};
  for (const label of task.labels) {
    if (label.given === undefined) values[label.format] = rationalMark(label.format, task.expectedHundredths);
  }
  return { kind: 'rational-link', values };
}

export function wrongRationalLinkResponses(task: RationalLinkTask): RationalLinkResponse[] {
  const answer = solutionRationalLink(task);
  return task.labels.filter(label => label.given === undefined).map(({ format }) => ({
    ...answer, values: { ...answer.values, [format]: rationalMark(format, task.expectedHundredths + 1) },
  }));
}

export function shareHundredths(part: number, whole: number): number {
  if (!Number.isSafeInteger(part) || part < 0 || !Number.isSafeInteger(whole) || whole <= 0 ||
      !Number.isSafeInteger(part * 100) || part * 100 % whole !== 0) {
    throw new RangeError('The ratio must be expressible in exact hundredths');
  }
  return part * 100 / whole;
}
