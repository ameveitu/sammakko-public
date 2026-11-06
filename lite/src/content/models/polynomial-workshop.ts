import type { Verdict } from '../../engine/types';

export type Power = 0 | 1 | 2 | 3;
export interface WorkshopTerm { coefficient: number; power: Power }
export interface WorkshopRow { label: string; terms: readonly WorkshopTerm[] }
export interface WorkshopModel {
  kind: 'polynomial-workbench';
  variable: 'x' | 'a' | 't';
  layout: 'terms' | 'collect' | 'return' | 'product' | 'classify';
  rows: readonly WorkshopRow[];
  examples?: readonly string[];
  note?: string;
}

export type WorkshopPolynomialForm = 'collected' | 'expanded' | 'expanded-then-collected';

export const term = (coefficient: number, power: Power): WorkshopTerm => ({ coefficient, power });
export const variablePart = (variable: string, power: Power): string => ['1', variable, variable + '²', variable + '³'][power]!;
export function termText({ coefficient, power }: WorkshopTerm, variable: string): string {
  const size = Math.abs(coefficient);
  const body = power === 0 ? String(size) : `${size === 1 ? '' : size}${variablePart(variable, power)}`;
  return (coefficient < 0 ? '−' : '') + body;
}
export function polynomialText(terms: readonly WorkshopTerm[], variable: string): string {
  return terms.map((part, i) => {
    const text = termText(part, variable);
    return i === 0 ? text : part.coefficient < 0 ? ` − ${text.slice(1)}` : ` + ${text}`;
  }).join('') || '0';
}

export function collectTerms(terms: readonly WorkshopTerm[]): WorkshopTerm[] {
  const sums = [0, 0, 0, 0];
  for (const { coefficient, power } of terms) sums[power]! += coefficient;
  return ([3, 2, 1, 0] as const).filter(power => sums[power] !== 0).map(power => term(sums[power]!, power));
}
export const oppositeTerms = (terms: readonly WorkshopTerm[]) => terms.map(({ coefficient, power }) => term(-coefficient, power));
export function crossTerms(left: readonly WorkshopTerm[], right: readonly WorkshopTerm[]) {
  return left.flatMap(a => right.map(b => {
    const power = a.power + b.power;
    if (power > 3) throw new RangeError('The workshop models terms through degree three');
    return term(a.coefficient * b.coefficient, power as Power);
  }));
}
export const valueAt = (terms: readonly WorkshopTerm[], x: number) =>
  terms.reduce((sum, { coefficient, power }) => sum + coefficient * x ** power, 0);

interface ParsedTerm extends WorkshopTerm { variable: string }
function parseTermRow(source: string): ParsedTerm[] | undefined {
  const text = source.replace(/[−–]/g, '-').replace(/\s+/g, '');
  if (!text) return;
  const parts = text.match(/(?:^|[+-])(?:\d*[a-z](?:[²³]|\^[123])?|\d+)/gi);
  if (!parts || parts.join('') !== text) return;
  const parsed: ParsedTerm[] = [];
  for (const part of parts) {
    const match = /^([+-]?)(\d*)([a-z])?([²³]|\^[123])?$/i.exec(part)!;
    const [, sign, size, variable, exponent] = match;
    const magnitude = size ? Number(size) : 1;
    if (!Number.isSafeInteger(magnitude)) return;
    const power = !variable ? 0 : exponent === '²' ? 2 : exponent === '³' ? 3 : exponent ? Number(exponent[1]) : 1;
    parsed.push({ coefficient: sign === '-' ? -magnitude : magnitude, power: power as Power, variable: variable ?? '' });
  }
  return parsed;
}
const termKey = (entry: ParsedTerm) => `${entry.variable}${entry.power}`;
const bag = (entries: readonly ParsedTerm[]) =>
  entries.map((entry) => `${termKey(entry)}:${entry.coefficient}`).sort().join('|');

function rowMatches(target: string, source: string, form: 'expanded' | 'collected'): boolean {
  const expected = parseTermRow(target), got = parseTermRow(source);
  if (!expected || !got) return false;
  if (form === 'collected' && (
    new Set(got.map(termKey)).size !== got.length ||
    (got.length > 1 && got.some(({ coefficient }) => coefficient === 0))
  )) return false;
  return bag(got) === bag(expected);
}

function vector(row: readonly ParsedTerm[]): string {
  const coefficients = new Map<string, bigint>();
  for (const entry of row) {
    const key = termKey(entry);
    coefficients.set(key, (coefficients.get(key) ?? 0n) + BigInt(entry.coefficient));
  }
  return [...coefficients].filter(([, n]) => n !== 0n).sort(([a], [b]) => a.localeCompare(b)).join('|');
}

function samePolynomial(target: string, source: string): boolean {
  const expected = parseTermRow(target), got = parseTermRow(source);
  return !!expected && !!got && vector(expected) === vector(got);
}

/** These authored output rows use explicit signed integer terms. Equality is exact and term order is free. */
export function checkWorkshopPolynomial(form: WorkshopPolynomialForm, target: string, source: string, specific?: string): Verdict {
  if (form === 'expanded-then-collected') {
    const [expanded, collected, extra] = source.split('→');
    const [expectedExpansion, expectedResult] = target.split('→');
    if (!expectedExpansion || !expectedResult) return { ok: false };
    const incomplete = (why: string, candidate: string): Verdict => ({
      ok: false, why, ...(samePolynomial(expectedResult, candidate) ? { math: true, proc: false } : {}),
    });
    if (collected === undefined || extra !== undefined) {
      return incomplete('Kirjoita ensin avattu rivi, lisää nuoli ja rakenna sitten koottu tulos.', expanded!);
    }
    if (!rowMatches(expectedExpansion, expanded!, 'expanded')) {
      const count = parseTermRow(expanded!)?.length;
      const needed = parseTermRow(expectedExpansion)?.length;
      const why = count !== undefined && needed !== undefined && count !== needed
        ? `Ensimmäisellä rivillä on ${count} termiä. Tarvitaan ${needed}, jotta kaikki avatut termit tai osatulot ovat mukana.`
        : 'Tarkista, että ensimmäisen rivin jokainen termi on mukana oman etumerkkinsä kanssa.';
      return incomplete(specific ?? why, collected);
    }
    if (!rowMatches(expectedResult, collected, 'collected')) {
      return incomplete('Avattu rivi on oikein. Yhdistä nuolen jälkeen vain saman muuttujaosan termit, ja jätä nollaksi kumoutuvat pois.', collected);
    }
    return { ok: true };
  }
  if (rowMatches(target, source, form)) return { ok: true };
  return {
    ok: false,
    ...(samePolynomial(target, source) ? { math: true, proc: false } : {}),
    why: specific ?? (form === 'expanded'
      ? 'Kirjoita jokainen avattu termi omana terminään ja tarkista sen etumerkki.'
      : 'Kirjoita yksi termi kutakin muuttujaosaa kohti. Yhdistä kertoimet ja jätä nollaksi kumoutuvat termit pois.'),
  };
}
