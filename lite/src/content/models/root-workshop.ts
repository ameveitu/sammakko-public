import { parseMeasure } from './spatial-measures';

export type RootContext = { title: string; skills: readonly string[] };
export type RootView = 'garden' | 'tiles' | 'symbol' | 'repair';
export type Relation = '=' | '≈';
export type Ordering = '<' | '=' | '>';
export type NumberClass = 'rational' | 'irrational' | 'undetermined';
export type NumberBasis = 'ratio' | 'finite' | 'periodic' | 'known-irrational' | 'fragment';
export type RoundGoal = 'decimal' | 'pieces' | 'significant';

export type RealCard = {
  id: string; label: string; detail: string; basis: NumberBasis;
};
type RationalMarker = { id: string; label: string; value: string };
type IrrationalMarker = { id: string; label: string; range: readonly [string, string] };
export type RootMarker = RationalMarker | IrrationalMarker;
type RootEstimate = { radicand: number; tenths: boolean };
type RootMode =
  | { mode: 'principal' | 'exact'; radicand: number; view: RootView; negativeProbe?: number }
  | ({ mode: 'estimate'; view: RootView } & RootEstimate)
  | ({ mode: 'paired'; exactRadicand: number; view: RootView } & RootEstimate)
  | { mode: 'operation'; operation: '+' | '−' | '×'; left: number; right: number; radicand: number; rightRadicand: number }
  | { mode: 'classify'; cards: readonly RealCard[] }
  | { mode: 'line'; markers: readonly RootMarker[]; first: number; last: number; step: number; overview?: readonly [number, number] }
  | { mode: 'exact-approx'; source: { kind: 'ratio'; value: string } | { kind: 'root'; radicand: number }; report: string; places: number }
  | { mode: 'round'; value: string; goal: RoundGoal; places: number; figures?: number; unit: string };

export type RootWorkshopTask = RootMode & { kind: 'root-workshop'; context: RootContext };
export type RootWorkshopMode = RootMode['mode'];

type Bounds = { low: string; high: string; refinedLow: string; refinedHigh: string; nearest: string };
type ResponseMode =
  | { mode: 'principal' | 'exact'; status: 'exists' | 'undefined' | null; value: string; squared: string; negativeProbe?: 'exists' | 'undefined' | null }
  | ({ mode: 'estimate' } & Bounds)
  | ({ mode: 'paired'; exact: string; exactSquared: string; exactRelation: Relation | null; estimateRelation: Relation | null } & Bounds)
  | { mode: 'operation'; exact: string; report: string; relation: Relation | null }
  | { mode: 'classify'; cards: Record<string, { classification: NumberClass | null; basis: NumberBasis | null }> }
  | { mode: 'line'; markers: Record<string, { value: string; relation: Relation | null }> }
  | { mode: 'exact-approx'; relation: Relation | null; order: Ordering | null; low: string; high: string }
  | { mode: 'round'; result: string; low: string; high: string };

export type RootWorkshopResponse = ResponseMode & { kind: 'root-workshop' };

type Rational = readonly [bigint, bigint];
function rational(value: unknown): Rational | undefined {
  return typeof value === 'string' && value.length < 40 ? parseMeasure(value.replaceAll('−', '-')) : undefined;
}
const integer = (n: bigint): Rational => [n, 1n];
const compare = ([an, ad]: Rational, [bn, bd]: Rational) => {
  const difference = an * bd - bn * ad;
  return difference < 0n ? -1 : difference > 0n ? 1 : 0;
};
const is = (candidate: unknown, target: Rational) => {
  const value = rational(candidate);
  return !!value && compare(value, target) === 0;
};
const square = ([n, d]: Rational): Rational => [n * n, d * d];
const power = (digits: number) => 10n ** BigInt(digits);

export function integerRoot(n: bigint): bigint {
  let lo = 0n, hi = 1n;
  while (hi * hi <= n) hi *= 2n;
  while (hi - lo > 1n) {
    const middle = (lo + hi) / 2n;
    if (middle * middle > n) hi = middle;
    else lo = middle;
  }
  return lo;
}

export function fixedText(n: number | bigint, digits: number): string {
  if (digits < 0) return fixedText(BigInt(n) * power(-digits), 0);
  const value = BigInt(n), negative = value < 0n;
  const text = (negative ? -value : value).toString().padStart(digits + 1, '0');
  return `${negative ? '−' : ''}${digits ? `${text.slice(0, -digits)},${text.slice(-digits)}` : text}`;
}
const decimals = (value: unknown) => {
  if (typeof value !== 'string') return -1;
  const match = /^[−+-]?\d+(?:[,.](\d+))?$/.exec(value.trim());
  return match ? (match[1]?.length ?? 0) : -1;
};
function rootCompare(n: bigint, bound: Rational): number {
  if (bound[0] < 0n) return 1;
  return compare(integer(n), square(bound));
}
const principal = (candidate: string, radicand: number) => {
  const number = rational(candidate);
  return !!number && number[0] >= 0n && compare(square(number), integer(BigInt(radicand))) === 0;
};
const floor = ([n, d]: Rational): bigint => n >= 0n || n % d === 0n ? n / d : n / d - 1n;
function reportAsRational(report: string, places: number) {
  return decimals(report) === places ? rational(report) : undefined;
}
export function estimateSquare(radicand: number, places: number) {
  const unit = power(places), n = BigInt(radicand) * unit * unit;
  const low = integerRoot(n);
  return { low, high: low + 1n, nearest: 4n * n < (2n * low + 1n) ** 2n ? low : low + 1n };
}
export function squaredText(candidate: string): string {
  const value = rational(candidate);
  if (!value) return '';
  const [n, d] = square(value);
  if (n % d === 0n) return String(n / d);
  if (/^[−+-]?\d+[,.]\d{1,3}$/.test(candidate)) return fixedText(n, 2 * decimals(candidate));
  return `${n}/${d}`;
}

function checkBounds(task: RootEstimate, answer: Bounds): boolean {
  const bounds = (lowText: string, highText: string, places: number) => {
    const low = rational(lowText), high = rational(highText);
    const step = power(places);
    return !!low && !!high && low[0] >= 0n &&
      low[0] * step % low[1] === 0n && high[0] * step % high[1] === 0n &&
      high[0] * step / high[1] - low[0] * step / low[1] === 1n &&
      rootCompare(BigInt(task.radicand), low) > 0 && rootCompare(BigInt(task.radicand), high) < 0;
  };
  const nearest = estimateSquare(task.radicand, 0).nearest;
  return bounds(answer.low, answer.high, 0) && is(answer.nearest, integer(nearest)) &&
    (!task.tenths || bounds(answer.refinedLow, answer.refinedHigh, 1));
}
function estimateSolution(task: RootEstimate): Bounds {
  const { low, high, nearest } = estimateSquare(task.radicand, 0);
  const tenths = estimateSquare(task.radicand, 1);
  return { low: String(low), high: String(high), nearest: String(nearest),
    refinedLow: task.tenths ? fixedText(tenths.low, 1) : '', refinedHigh: task.tenths ? fixedText(tenths.high, 1) : '' };
}

type Operation = Extract<RootWorkshopTask, { mode: 'operation' }>;
type Radical = { sign: number; squared: Rational };
function operationValue(task: Operation): Radical {
  const coefficient = task.operation === '×' ? BigInt(task.left * task.right) :
    BigInt(task.operation === '+' ? task.left + task.right : task.left - task.right);
  const product = BigInt(task.radicand) * BigInt(task.operation === '×' ? task.rightRadicand : 1);
  return { sign: coefficient === 0n || product === 0n ? 0 : coefficient < 0n ? -1 : 1,
    squared: integer(coefficient * coefficient * product) };
}
function parseRadical(value: unknown): Radical | undefined {
  const number = rational(value);
  if (number) return { sign: number[0] === 0n ? 0 : number[0] < 0n ? -1 : 1, squared: square(number) };
  if (typeof value !== 'string' || value.length > 40) return;
  const source = value.trim().replace(/\s+/g, '').replaceAll('−', '-').toLowerCase();
  const match = /^([+-]?)(\d{0,5})(?:\*|·)?(?:√(?:(\d{1,8})|\((\d{1,8})\))|sqrt\((\d{1,8})\))$/.exec(source);
  if (!match) return;
  const [, sign, coefficient, direct, inParens, ascii] = match;
  if (coefficient === '' && /[*·]/.test(source)) return;
  const magnitude = BigInt(coefficient || 1) ** 2n * BigInt(direct ?? inParens ?? ascii!);
  return { sign: magnitude === 0n ? 0 : sign === '-' ? -1 : 1, squared: integer(magnitude) };
}
function radicalText(value: Radical): string {
  let base = value.squared[0], coefficient = 1n;
  if (base === 0n) return '0';
  for (let factor = 2n; factor * factor <= base; factor++) {
    while (base % (factor * factor) === 0n) {
      base /= factor * factor; coefficient *= factor;
    }
  }
  return `${value.sign < 0 ? '−' : ''}${base === 1n || coefficient > 1n ? coefficient : ''}${base === 1n ? '' : `√${base}`}`;
}
function reportRadical(value: Radical) {
  const scaled = value.squared[0] * 100n, divisor = value.squared[1];
  const bottom = integerRoot(scaled / divisor);
  const nearest = 4n * scaled < divisor * (2n * bottom + 1n) ** 2n ? bottom : bottom + 1n;
  return { nearest: BigInt(value.sign) * nearest,
    relation: nearest * nearest * divisor === scaled ? '=' as const : '≈' as const };
}
export function radicalTerm(coefficient: number, radicand: number): string {
  return `${coefficient === 1 ? '' : coefficient}√${radicand}`;
}
export function numberClass(basis: NumberBasis): NumberClass {
  return basis === 'fragment' ? 'undetermined' : basis === 'known-irrational' ? 'irrational' : 'rational';
}

type Display = Extract<RootWorkshopTask, { mode: 'exact-approx' }>;
function displayInfo(task: Display) {
  const display = rational(task.report)!;
  const equality = task.source.kind === 'ratio' ? compare(rational(task.source.value)!, display) : rootCompare(BigInt(task.source.radicand), display);
  const unit = power(task.places);
  const mid = display[0] * unit / display[1];
  return { relation: equality === 0 ? '=' as const : '≈' as const, order: equality < 0 ? '<' as const : equality > 0 ? '>' as const : '=' as const,
    low: [mid * 2n - 1n, unit * 2n] as Rational, high: [mid * 2n + 1n, unit * 2n] as Rational };
}

type Rounding = Extract<RootWorkshopTask, { mode: 'round' }>;
export function roundingPlaces(task: Rounding): number {
  if (task.goal !== 'significant') return task.places;
  const whole = task.value.replace(/^[−+-]/, '').split(/[,.]/)[0]!;
  const digit = whole.replace(/^0+/, '').length;
  const first = digit ? digit - 1 : -1 - (task.value.split(/[,.]/)[1]?.search(/[1-9]/) ?? 0);
  return task.figures! - 1 - first;
}
function rounding(task: Rounding) {
  const digits = roundingPlaces(task);
  const divisor = power(Math.max(0, digits)), multiplier = power(Math.max(0, -digits));
  const value = rational(task.value)!;
  const at: Rational = [value[0] * divisor, value[1] * multiplier];
  const low = floor(at), high = low + 1n;
  const comparison = compare(at, [2n * low + 1n, 2n]);
  const result = task.goal === 'pieces' ? (at[0] % at[1] === 0n ? low : high)
    : comparison < 0 || (comparison === 0 && at[0] < 0n) ? low : high;
  const carry = task.goal === 'significant' && (result < 0n ? -result : result) === power(task.figures!);
  const reportDigits = Math.max(0, digits - Number(carry));
  return { low, high, result, digits, divisor, multiplier, reportDigits };
}

const fail = (why: string) => ({ ok: false, why });
const pass = { ok: true };

export function checkRootWorkshop(task: RootWorkshopTask, answer: RootWorkshopResponse): { ok: boolean; why?: string } {
  if (!answer || answer.kind !== 'root-workshop' || task.mode !== answer.mode) return fail('Tämä mittalappu kuuluu eri tehtävään.');
  switch (task.mode) {
    case 'principal':
    case 'exact':
      if (answer.mode !== 'principal' && answer.mode !== 'exact') break;
      if (task.radicand < 0) return answer.status === 'undefined' && typeof answer.value === 'string' && typeof answer.squared === 'string' && !answer.value.trim() && !answer.squared.trim()
        ? pass : fail('Reaaliluvun neliö on aina vähintään nolla. Negatiivisella juurrettavalla ei ole reaalista neliöjuurta.');
      if (task.negativeProbe !== undefined && answer.negativeProbe !== 'undefined') {
        return fail('Negatiivisella juurrettavalla ei ole reaalista neliöjuurta. Anna myös toisen luvun ei-negatiivinen pääjuuri.');
      }
      return answer.status === 'exists' && principal(answer.value, task.radicand) && is(answer.squared, integer(BigInt(task.radicand)))
        ? pass : fail('Valitse ei-negatiivinen pääjuuri ja neliöi se. Neliön täytyy olla annettu luku.');
    case 'estimate':
      if (answer.mode !== task.mode) break;
      return checkBounds(task, answer) ? pass : fail('Neliöi välin kaksi päätä. Juurrettavan tulee jäädä neliöiden väliin. Tarkista myös lähin kokonaisluku puolivälillä.');
    case 'paired':
      if (answer.mode !== task.mode) break;
      if (!principal(answer.exact, task.exactRadicand) || !is(answer.exactSquared, integer(BigInt(task.exactRadicand))) || answer.exactRelation !== '=') {
        return fail('Kirjoita täydellisen neliön tarkka pääjuuri ja varmista se neliöimällä.');
      }
      return checkBounds(task, answer) && answer.estimateRelation === '≈' ? pass :
        fail('Arvioitava juuri on kahden neliön välissä. Erota tarkka juurimerkintä ja likimääräinen kokonaislukuarvo.');
    case 'operation': {
      if (answer.mode !== task.mode) break;
      const expected = operationValue(task), result = parseRadical(answer.exact), rounded = reportRadical(expected);
      if (!result || result.sign !== expected.sign || compare(result.squared, expected.squared) !== 0) {
        return fail('Yhtä suurten juuritermien kertoimet voi laskea yhteen tai vähentää. Tulossa käytetään kertolaskua. Säilytä tarkka arvo laskun loppuun asti.');
      }
      const report = reportAsRational(answer.report, 1);
      return !!report && compare(report, [rounded.nearest, 10n]) === 0 && answer.relation === rounded.relation
        ? pass : fail('Pyöristä tarkka tulos vasta lopuksi yhteen desimaaliin. Tarkista, säilyykö arvo samana.');
    }
    case 'classify':
      if (answer.mode !== task.mode) break;
      return !!answer.cards && Object.keys(answer.cards).length === task.cards.length && task.cards.every(card => answer.cards[card.id]?.classification === numberClass(card.basis) && answer.cards[card.id]?.basis === card.basis)
        ? pass : fail('Päättyvä ja jaksollinen desimaali voidaan esittää murtolukuna. Katkelmasta ei yksin voi päätellä jatkoa.');
    case 'line':
      if (answer.mode !== task.mode) break;
      return !!answer.markers && Object.keys(answer.markers).length === task.markers.length && task.markers.every(marker => {
        const placed = answer.markers[marker.id];
        if (!placed) return false;
        const v = rational(placed.value);
        if (!v || compare(v, [BigInt(task.first), 100n]) < 0 || compare(v, [BigInt(task.last), 100n]) > 0) return false;
        return 'range' in marker
          ? placed.relation === '≈' && compare(v, rational(marker.range[0])!) >= 0 && compare(v, rational(marker.range[1])!) <= 0
          : placed.relation === '=' && compare(v, rational(marker.value)!) === 0;
      }) ? pass : fail('Sijoita tarkka luku oikeaan kohtaan. Juuriluvun likimääräinen merkki saa olla ilmoitetun vertailuvälin sisällä.');
    case 'exact-approx': {
      if (answer.mode !== task.mode) break;
      const info = displayInfo(task);
      return answer.relation === info.relation && answer.order === info.order && is(answer.low, info.low) && is(answer.high, info.high)
        ? pass : fail('Vertaa alkuperäistä lukua pyöristettyyn lukemaan. Näytön rajoihin lisätään ja siitä vähennetään puoli viimeisen numeron yksikköä.');
    }
    case 'round': {
      if (answer.mode !== task.mode) break;
      const { result, low, high, divisor, multiplier, reportDigits } = rounding(task);
      const report = reportAsRational(answer.result, reportDigits);
      return !!report && compare(report, [result * multiplier, divisor]) === 0 &&
        is(answer.low, [low * multiplier, divisor]) && is(answer.high, [high * multiplier, divisor])
        ? pass : fail('Aseta alkuperäinen luku viereisten merkkien väliin. Käytä ilmoitettua tarkkuutta ja tilanteen pyöristyssääntöä.');
    }
  }
  return fail('Täydennä mittalappu.');
}
function rationalText([n, d]: Rational): string {
  for (let places = 0; places <= 6; places++) {
    const scaled = n * power(places);
    if (scaled % d === 0n) return fixedText(scaled / d, places);
  }
  return `${n}/${d}`;
}

export function solutionRootWorkshop(task: RootWorkshopTask): RootWorkshopResponse {
  const kind = task.kind;
  switch (task.mode) {
    case 'principal':
    case 'exact':
      return task.radicand < 0 ? { kind, mode: task.mode, status: 'undefined', value: '', squared: '' }
        : { kind, mode: task.mode, status: 'exists', value: String(integerRoot(BigInt(task.radicand))), squared: String(task.radicand),
          ...(task.negativeProbe !== undefined ? { negativeProbe: 'undefined' as const } : {}) };
    case 'estimate': return { kind, mode: task.mode, ...estimateSolution(task) };
    case 'paired': return { kind, mode: task.mode, ...estimateSolution(task), exact: String(integerRoot(BigInt(task.exactRadicand))),
      exactSquared: String(task.exactRadicand), exactRelation: '=', estimateRelation: '≈' };
    case 'operation': {
      const value = operationValue(task), rounded = reportRadical(value);
      return { kind, mode: task.mode, exact: radicalText(value), report: fixedText(rounded.nearest, 1), relation: rounded.relation };
    }
    case 'classify': return { kind, mode: task.mode, cards: Object.fromEntries(task.cards.map(({ id, basis }) => [id, { classification: numberClass(basis), basis }])) };
    case 'line': return { kind, mode: task.mode, markers: Object.fromEntries(task.markers.map(marker => [marker.id, 'range' in marker
      ? { value: marker.range[0], relation: '≈' } : { value: marker.value, relation: '=' }])) };
    case 'exact-approx': {
      const { relation, order, low, high } = displayInfo(task);
      return { kind, mode: task.mode, relation, order, low: rationalText(low), high: rationalText(high) };
    }
    case 'round': {
      const { result, low, high, digits, reportDigits } = rounding(task);
      const text = fixedText(result, digits);
      const [whole, fraction = ''] = text.split(',');
      const report = reportDigits ? `${whole},${fraction.slice(0, reportDigits)}` : whole!;
      return { kind, mode: task.mode, result: report, low: fixedText(low, digits), high: fixedText(high, digits) };
    }
  }
}

export function wrongRootWorkshopResponses(task: RootWorkshopTask): RootWorkshopResponse[] {
  const answer = solutionRootWorkshop(task);
  switch (answer.mode) {
    case 'principal':
    case 'exact': return [{ ...answer, status: null }, { ...answer, value: `±${answer.value}` }];
    case 'estimate': return [{ ...answer, low: '' }, { ...answer, nearest: '' }];
    case 'paired': return [{ ...answer, exactRelation: '≈' }, { ...answer, estimateRelation: '=' }];
    case 'operation': return [{ ...answer, exact: '±0' }, { ...answer, relation: answer.relation === '=' ? '≈' : '=' }];
    case 'classify': return [{ ...answer, cards: {} }];
    case 'line': return [{ ...answer, markers: {} }];
    case 'exact-approx': return [{ ...answer, relation: answer.relation === '=' ? '≈' : '=' }, { ...answer, low: '' }];
    case 'round': return [{ ...answer, result: 'NaN' }, { ...answer, high: '' }];
  }
}
