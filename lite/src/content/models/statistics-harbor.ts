import { rng } from '../../engine/rng';
import { checkObservedExplanation, type CriterionObservation, type ObservedExplanationTask } from './observed-explanations';
import { parseMeasure } from './spatial-measures';

export type HarborContext = { title: string; skills: readonly string[] };
export type HarborRubric = Pick<ObservedExplanationTask, 'prompt' | 'rubric' | 'model'>;
export interface HarborReview {
  observations: Partial<Record<string, CriterionObservation>>;
  confirmedByAdult: boolean;
  assistance: 'none' | 'helped';
}
export type Variable = 'visits' | 'wind' | 'temperature';
export interface HarborSite { id: string; label: string; x: number; z: number }
export interface HarborTime { id: string; label: string }
export interface HarborCoverage { id: string; label: string; points: readonly string[]; minimum: number }
export interface HarborSlip { id: string; log: string; site: string; time: string; value: number | null }
export interface HarborRow { id: string; label: string; value: number }
export interface HarborSeries { label: string; values: readonly number[] }
export type HarborChartType = 'bar' | 'line';
export interface ChartDraft {
  type: HarborChartType | null; axis: string; unit: string; start: string; step: string; top: string;
  values: Record<string, string>;
}
type StructuredRow = { receipt: string; value: string; condition: 'reading' | 'missing' | 'check' | null };
type PairedSpace = { variant: 'ordered' | 'unordered'; symbols: readonly string[] };
type ProductSpace = { variant: 'product'; first: readonly string[]; second: readonly string[] };
export type HarborSpace = PairedSpace | ProductSpace;
export type HarborEvent = { test: 'first' | 'contains' | 'excludes' | 'equal'; symbol?: string; grouped?: boolean };
export interface HarborExperiment { id: string; count: number; seed: number }
type Comparison = 'a' | 'b' | 'equal';

export type HarborMode =
  | { mode: 'collect'; question: string; variable: Variable; sites: readonly HarborSite[]; times: readonly HarborTime[];
      coverage: readonly HarborCoverage[]; budget: number; seed: number; review: HarborRubric }
  | { mode: 'structure'; variable: Variable; unit: string; slips: readonly HarborSlip[]; usual: readonly [number, number] }
  | { mode: 'freq'; name: string; categories: readonly string[]; values: readonly string[] }
  | { mode: 'relative'; groups: readonly [HarborRow & { total: number }, HarborRow & { total: number }]; format: 'fraction' | 'percent' }
  | { mode: 'mean'; values: readonly number[]; addition: number; unit: string }
  | { mode: 'median'; rows: readonly HarborRow[]; unit: string; previous?: HarborRow }
  | { mode: 'mode'; values: readonly string[]; categories: readonly string[] }
  | { mode: 'spread'; series: readonly [HarborSeries, HarborSeries]; centre: number; radius: number; unit: string }
  | { mode: 'interpret'; issue: 'axis' | 'population'; rows: readonly [HarborRow, HarborRow];
      totals?: readonly [number, number]; firstChart: HarborChartType; firstStart: number; firstTop: number; firstStep: number; compareCharts: boolean; review: HarborRubric }
  | { mode: 'chart'; rows: readonly HarborRow[]; order: 'time' | 'category'; question: string; axis: string; unit: string; review: HarborRubric }
  | { mode: 'space'; space: HarborSpace }
  | { mode: 'classic'; space: ProductSpace; event: HarborEvent }
  | { mode: 'empirical'; sectors: readonly string[]; target: string; experiments: readonly HarborExperiment[] };

export type StatisticsHarborTask = HarborMode & { kind: 'statistics-harbor'; context: HarborContext };
type HarborResponseMode =
  | { mode: 'collect'; variable: Variable | null; method: string; plan: string[]; visits: Record<string, string>; review?: HarborReview }
  | { mode: 'structure'; variable: string; unit: string; rows: Record<string, StructuredRow>; copies: string[] }
  | { mode: 'freq'; counts: Record<string, string>; total: string }
  | { mode: 'relative'; frequencies: [string, string]; ratios: [string, string]; comparison: Comparison | null }
  | { mode: 'mean'; count: string; total: string; mean: string; newCount: string; newMean: string; change: 'rose' | 'fell' | 'equal' | null; meaning: string }
  | { mode: 'median'; order: string[]; middle: string[]; median: string; previous: string }
  | { mode: 'mode'; counts: Record<string, string>; modes: string[]; status: 'none' | 'one' | 'many' | null }
  | { mode: 'spread'; ranges: [string, string]; near: [string, string]; moreCentral: Comparison | null }
  | { mode: 'interpret'; issue: string; compared: boolean; change: string; ratios: [string, string]; comparison: Comparison | null; review?: HarborReview }
  | { mode: 'chart'; draft: ChartDraft; review?: HarborReview }
  | { mode: 'space'; pairs: string[]; count: string }
  | { mode: 'classic'; members: string[]; favorable: string; total: string; probability: string; condition: string }
  | { mode: 'empirical'; run: string[]; counts: Record<string, string>; ratios: Record<string, string>; closest: string[];
      next: string; inference: string };
export type StatisticsHarborResponse = HarborResponseMode & { kind: 'statistics-harbor' };

interface HarborVerdict { ok: boolean; why?: string; pendingReview?: true; observedByAdult?: true; assisted?: true }
const pass = { ok: true };
const fail = (why: string) => ({ ok: false, why });
const kind = 'statistics-harbor' as const;
type Task<M extends HarborMode['mode']> = Extract<StatisticsHarborTask, { mode: M }>;
type Answer<M extends HarborMode['mode']> = Extract<StatisticsHarborResponse, { mode: M }>;

export const variableNames = { visits: 'Laiturikäynnit', wind: 'Tuulen tulosuunta', temperature: 'Lämpötila' };
export const methods = { visits: 'count', wind: 'vane', temperature: 'thermometer' } as const;
export const methodNames = { count: 'Laske käynnit yhtä pitkässä havaintoikkunassa', vane: 'Lue tuuliviirin näyttämä tulosuunta', thermometer: 'Lue lämpömittari samassa varjokohdassa' };
export const pointId = (site: string, time: string) => `${site}-${time}`;

export function harborVisit(task: Task<'collect'>, point: string, variable: Variable): string | undefined {
  const i = task.sites.findIndex(site => task.times.some(time => pointId(site.id, time.id) === point));
  if (i < 0) return;
  const j = task.times.findIndex(time => pointId(task.sites[i]!.id, time.id) === point);
  const random = rng((task.seed ^ Math.imul(i + 1, 1597334677) ^ Math.imul(j + 1, 122949829)) >>> 0);
  if (variable === 'wind') return random.pick(['Pohjoinen', 'Itä', 'Etelä', 'Länsi']);
  return variable === 'temperature' ? String(random.int(2, 18)) : String(random.int(0, 12));
}
function completeCoverage(task: Task<'collect'>, plan: readonly string[]): boolean {
  return plan.length === task.budget && new Set(plan).size === plan.length
    && task.coverage.every(({ points, minimum }) => plan.filter(id => points.includes(id)).length >= minimum);
}
function planExample(task: Task<'collect'>) {
  const points = task.sites.flatMap(site => task.times.map(time => pointId(site.id, time.id)));
  const find = (start: number, picked: string[]): string[] | undefined => {
    if (picked.length === task.budget) return completeCoverage(task, picked) ? picked : undefined;
    for (let i = start; i < points.length; i++) {
      const found = find(i + 1, [...picked, points[i]!]);
      if (found) return found;
    }
    return undefined;
  };
  return find(0, []) ?? [];
}
export function harborCounts(values: readonly string[], categories: readonly string[]): Record<string, number> {
  return Object.fromEntries(categories.map(category => [category, values.filter(value => value === category).length]));
}
export function harborModes(values: readonly string[], categories: readonly string[]): string[] {
  const frequencies = Object.entries(harborCounts(values, categories)).filter(([, n]) => n > 0);
  const highest = Math.max(...frequencies.map(([, n]) => n));
  if (frequencies.length > 1 && frequencies.every(([, n]) => n === highest)) return [];
  return frequencies.filter(([, n]) => n === highest).map(([label]) => label);
}
const sameSet = (actual: readonly string[] | undefined, expected: readonly string[]) => Array.isArray(actual)
  && actual.length === expected.length && new Set(actual).size === actual.length && expected.every(id => actual.includes(id));
function exact(value: unknown, n: number | bigint, d: number | bigint = 1) {
  const actual = typeof value === 'string' ? parseMeasure(value) : undefined;
  return !!actual && actual[0] * BigInt(d) === BigInt(n) * actual[1];
}
const total = (values: readonly number[]) => values.reduce((a, b) => a + b, 0);
const numericCompare = (a: bigint, b: bigint): Comparison => a > b ? 'a' : a < b ? 'b' : 'equal';
const ratioCompare = (a: number, n: number, b: number, m: number) => numericCompare(BigInt(a) * BigInt(m), BigInt(b) * BigInt(n));
function percentRatio(value: number, base: number) {
  const n = value * 100;
  return n % base === 0 ? String(n / base) : `${n}/${base}`;
}
const asRatio = (value: number, base: number) => `${value}/${base}`;
const asStrings = (values: Record<string, number>) => Object.fromEntries(Object.entries(values).map(([id, value]) => [id, String(value)]));
const exactCounts = (response: Record<string, string> | undefined, expected: Record<string, number>) => !!response &&
  Object.keys(response).length === Object.keys(expected).length && Object.entries(expected).every(([id, count]) => exact(response[id], count));
export function harborMedian(values: readonly number[]): readonly [number, number] {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? [sorted[index]!, 1] : [sorted[index - 1]! + sorted[index]!, 2];
}
const middleIndices = (length: number) => length % 2 ? [Math.floor(length / 2)] : [length / 2 - 1, length / 2];
const range = (values: readonly number[]) => Math.max(...values) - Math.min(...values);
const countNear = (values: readonly number[], centre: number, radius: number) => values.filter(value => Math.abs(value - centre) <= radius).length;
const pairId = (a: string, b: string) => `${a}|${b}`;
export function harborPairs(space: HarborSpace): string[] {
  if (space.variant === 'product') return space.first.flatMap(a => space.second.map(b => pairId(a, b)));
  return space.symbols.flatMap((a, i) => space.symbols.flatMap((b, j) =>
    i === j || (space.variant === 'unordered' && j < i) ? [] : [pairId(a, b)]));
}
function normalizedPairs(space: HarborSpace, values: readonly string[]) {
  if (space.variant !== 'unordered') return values;
  return values.map(pair => {
    const [a, b, extra] = pair.split('|');
    if (!a || !b || extra !== undefined) return pair;
    return space.symbols.indexOf(a) < space.symbols.indexOf(b) ? pair : pairId(b, a);
  });
}
export function harborEventMembers(task: Task<'classic'>): string[] {
  return harborPairs(task.space).filter(pair => {
    const [a, b] = pair.split('|');
    if (task.event.test === 'equal') return a === b;
    const matches = (outcome: string | undefined) => task.event.grouped ? outcome?.startsWith(`${task.event.symbol} `) : outcome === task.event.symbol;
    if (task.event.test === 'first') return matches(a);
    const has = matches(a) || matches(b);
    return task.event.test === 'contains' ? has : !has;
  });
}
export function runHarborExperiment(task: Task<'empirical'>, id: string): { hits: number; sample: readonly string[] } | undefined {
  const experiment = task.experiments.find(test => test.id === id);
  if (!experiment) return;
  const random = rng(experiment.seed);
  const sample = Array.from({ length: experiment.count }, () => random.pick(task.sectors));
  return { hits: sample.filter(item => item === task.target).length, sample };
}
function closestExperiments(task: Task<'empirical'>) {
  const model = task.sectors.filter(sector => sector === task.target).length;
  const size = task.sectors.length;
  const comparisons = task.experiments.map(experiment => {
    const deviation = BigInt(runHarborExperiment(task, experiment.id)!.hits * size - model * experiment.count);
    return { id: experiment.id, n: deviation < 0n ? -deviation : deviation, d: BigInt(experiment.count) };
  });
  return comparisons.filter(a => comparisons.every(b => a.n * b.d <= b.n * a.d)).map(x => x.id);
}

function checkCollection(task: Task<'collect'>, response: Answer<'collect'>) {
  if (response.variable !== task.variable || response.method !== methods[task.variable]) {
    return fail('Valitse tutkimuskysymyksen muuttuja ja tapa, jolla juuri siitä saadaan havainto.');
  }
  if (!Array.isArray(response.plan) || !completeCoverage(task, response.plan)) {
    return fail('Katso havaintokartan paikat ja ajankohdat. Jokaisen kysymyksessä pyydetyn kohdan pitää näkyä suunnitelmassa.');
  }
  return response.visits && Object.keys(response.visits).length === response.plan.length && response.plan.every(point =>
    typeof response.visits[point] === 'string' && Object.hasOwn(response.visits, point) && response.visits[point] === harborVisit(task, point, task.variable))
    ? pass : fail('Käy lukitun suunnitelman jokaisessa havaintopisteessä. Kerää mittaustulos omalta paikaltaan.');
}
function checkStructure(task: Task<'structure'>, response: Answer<'structure'>) {
  if (response.variable !== task.variable || response.unit !== task.unit) return fail('Taulukon otsikon ja yksikön tulee kertoa, mitä mitattiin.');
  const logs = [...new Set(task.slips.map(slip => slip.log))];
  const chosen = new Set<string>();
  if (!response.rows || Object.keys(response.rows).length !== logs.length) return fail('Jokainen eri havainto tarvitsee yhden rivin.');
  for (const log of logs) {
    const row = response.rows[log], source = task.slips.find(slip => slip.id === row?.receipt && slip.log === log);
    if (!row || !source) return fail('Valitse jokaiselle riville saman havainnon lappu. Sama lukuarvo eri aikoina voi olla eri havainto.');
    chosen.add(source.id);
    if (source.value === null) {
      if (row.condition !== 'missing' || typeof row.value !== 'string' || row.value.trim() !== '') return fail('Puuttuvaa havaintoa ei muuteta mitatuksi nollaksi.');
    } else {
      const outlier = source.value < task.usual[0] || source.value > task.usual[1];
      if (!exact(row.value, source.value) || row.condition !== (outlier ? 'check' : 'reading')) {
        return fail('Säilytä mitattu arvo. Tavanomaisen välin ulkopuolinen lukema merkitään tarkistettavaksi.');
      }
    }
  }
  return sameSet(response.copies, task.slips.filter(slip => !chosen.has(slip.id)).map(slip => slip.id)) ? pass
    : fail('Merkitse kaksoiskappaleet, jotka kuuluvat jo valittuun havaintoon.');
}
function chartValues(task: Task<'chart'>, draft: ChartDraft) {
  const start = Number(draft.start), step = Number(draft.step), top = Number(draft.top);
  return /^\d+$/.test(draft.start) && /^\d+$/.test(draft.step) && /^\d+$/.test(draft.top) &&
    Number.isSafeInteger(start) && Number.isSafeInteger(step) && Number.isSafeInteger(top) &&
    start === 0 && step > 0 && top >= Math.max(...task.rows.map(r => r.value)) &&
    top % step === 0 && top / step >= 2 && top / step <= 10;
}

export function checkHarborActivity(task: StatisticsHarborTask, response: StatisticsHarborResponse): HarborVerdict {
  if (!response || response.kind !== kind || task.mode !== response.mode) return fail('Tämä havaintolappu kuuluu toiseen tehtävään.');
  switch (task.mode) {
    case 'collect': if (response.mode === task.mode) return checkCollection(task, response); break;
    case 'structure': if (response.mode === task.mode) return checkStructure(task, response); break;
    case 'freq':
      if (response.mode === task.mode) return exactCounts(response.counts, harborCounts(task.values, task.categories)) && exact(response.total, task.values.length)
        ? pass : fail('Laske, montako kertaa kukin luokka esiintyy. Frekvenssien summan pitää olla havaintojen määrä.');
      break;
    case 'relative': {
      if (response.mode !== task.mode) break;
      const [a, b] = task.groups;
      return task.groups.every(({ value, total }, i) => exact(response.frequencies?.[i], value) &&
        (task.format !== 'fraction' || /[:/]/.test(response.ratios?.[i] ?? '')) &&
        exact(response.ratios?.[i], value * (task.format === 'percent' ? 100 : 1), total)) &&
        response.comparison === ratioCompare(a.value, a.total, b.value, b.total)
        ? pass : fail('Suhteuta kunkin aineiston frekvenssi sen omaan havaintomäärään. Prosenttiluku kertoo osuuden sadasta.');
    }
    case 'mean': {
      if (response.mode !== task.mode) break;
      const sum = total(task.values), n = task.values.length;
      const change = task.addition * n > sum ? 'rose' : task.addition * n < sum ? 'fell' : 'equal';
      return exact(response.count, n) && exact(response.total, sum) && exact(response.mean, sum, n) &&
        exact(response.newCount, n + 1) && exact(response.newMean, sum + task.addition, n + 1) &&
        response.change === change && response.meaning === 'equal-share'
        ? pass : fail('Laske myös toistuvat havainnot. Uusi havainto muuttaa sekä summaa että jakajaa. Keskiarvo kuvaa tasattua määrää.');
    }
    case 'median': {
      if (response.mode !== task.mode) break;
      const ids = task.rows.map(row => row.id);
      if (!sameSet(response.order, ids)) return fail('Järjestä jokainen alkuperäinen havainto. Samansuuruisetkin havainnot kuuluvat mukaan.');
      const ordered = response.order.map(id => task.rows.find(row => row.id === id)!);
      const [n, d] = harborMedian(ordered.map(row => row.value));
      const middle = middleIndices(ordered.length).map(i => ordered[i]!.id);
      const before = task.previous && harborMedian(task.rows.map(row => row.id === task.previous!.id ? task.previous!.value : row.value));
      return ordered.every((row, i) => i === 0 || row.value >= ordered[i - 1]!.value) && sameSet(response.middle, middle) &&
        exact(response.median, n, d) && (!before || exact(response.previous, ...before))
        ? pass : fail('Etsi keskimmäiset järjestetystä aineistosta. Parillisessa joukossa mediaani on kahden keskimmäisen keskiarvo.');
    }
    case 'mode': {
      if (response.mode !== task.mode) break;
      const modes = harborModes(task.values, task.categories);
      return exactCounts(response.counts, harborCounts(task.values, task.categories)) && sameSet(response.modes, modes) &&
        response.status === (!modes.length ? 'none' : modes.length === 1 ? 'one' : 'many')
        ? pass : fail('Tyyppiarvot löytyvät suurimmasta frekvenssistä. Käytä taulun tasatilannesääntöä.');
    }
    case 'spread': {
      if (response.mode !== task.mode) break;
      const near = task.series.map(series => countNear(series.values, task.centre, task.radius));
      return task.series.every((series, i) => exact(response.ranges?.[i], range(series.values)) && exact(response.near?.[i], near[i]!)) &&
        response.moreCentral === numericCompare(BigInt(near[0]!), BigInt(near[1]!))
        ? pass : fail('Laske pienimmän ja suurimman ero sekä lähellä keskikohtaa olevat pisteet. Nämä kertovat jakaumasta eri asioita.');
    }
    case 'interpret': {
      if (response.mode !== task.mode) break;
      const [a, b] = task.rows;
      return response.issue === task.issue && (!task.compareCharts || response.compared) && exact(response.change, b.value - a.value) &&
        (task.totals ? task.rows.every((row, i) => exact(response.ratios?.[i], row.value, task.totals![i]!)) &&
          response.comparison === ratioCompare(a.value, task.totals[0], b.value, task.totals[1]) : true)
        ? pass : fail('Lue alkuperäiset luvut ja vähennä ensimmäinen toisesta. Tarkista pystyakselin alku tai laske osuudet omista perusjoukoistaan.');
    }
    case 'chart': {
      if (response.mode !== task.mode) break;
      const draft = response.draft;
      return draft && (draft.type === 'bar' || (task.order === 'time' && draft.type === 'line'))
        && draft.axis === task.axis && draft.unit === task.unit && chartValues(task, draft)
        && exactCounts(draft.values, Object.fromEntries(task.rows.map(row => [row.id, row.value])))
        ? pass : fail('Valitse kysymykseen sopiva kuva, nimeä akselit ja käytä yhteistä asteikkoa. Siirrä jokaiseen kohtaan sen oma havainto.');
    }
    case 'space': {
      if (response.mode !== task.mode) break;
      const pairs = harborPairs(task.space);
      return Array.isArray(response.pairs) && Array.from(response.pairs).every(value => typeof value === 'string') && sameSet(normalizedPairs(task.space, response.pairs), pairs) && exact(response.count, pairs.length)
        ? pass : fail('Muodosta kaikki sallitut parit kerran. Tarkista erikseen, lasketaanko eri järjestykset eri tuloksiksi.');
    }
    case 'classic': {
      if (response.mode !== task.mode) break;
      const members = harborEventMembers(task), all = harborPairs(task.space);
      return sameSet(response.members, members) && exact(response.favorable, members.length) && exact(response.total, all.length) &&
        exact(response.probability, members.length, all.length) && response.condition === 'equal-atomic'
        ? pass : fail('Suhde käy yhtä mahdollisille alkeistuloksille. Laske kaikki yhtä suuret sektoriparit ja valitse niistä ehdon toteuttavat.');
    }
    case 'empirical': {
      if (response.mode !== task.mode) break;
      const modelHits = task.sectors.filter(value => value === task.target).length;
      return sameSet(response.run, task.experiments.map(test => test.id)) && task.experiments.every(test => {
        const result = runHarborExperiment(task, test.id)!;
        return exact(response.counts?.[test.id], result.hits) && exact(response.ratios?.[test.id], result.hits, test.count);
      }) && sameSet(response.closest, closestExperiments(task)) && exact(response.next, modelHits, task.sectors.length)
        && response.inference === 'estimate'
        ? pass : fail('Aja jokainen koe, laske sen oma osuus ja vertaa malliin. Aiempi sarja ei muuta riippumattoman seuraavan pyöräytyksen osuutta.');
    }
  }
  return fail('Täydennä tutkimuslappu.');
}

export function harborExplanation(rubric: HarborRubric): ObservedExplanationTask {
  return { kind: 'observed-explanation', channel: 'spoken', givens: [], ...rubric };
}
export function checkStatisticsHarbor(task: StatisticsHarborTask, response: StatisticsHarborResponse): HarborVerdict {
  const scored = checkHarborActivity(task, response);
  if (!scored.ok || !('review' in task)) return scored;
  const review = 'review' in response ? response.review : undefined;
  if (!review) return { ok: false, pendingReview: true, why: 'Oma perustelu odottaa aikuisen havaintoa.' };
  return checkObservedExplanation(harborExplanation(task.review), {
    kind: 'observed-explanation', channel: 'spoken', observations: review.observations,
    assistance: review.assistance, confirmedByAdult: review.confirmedByAdult,
  });
}

export function solutionStatisticsHarbor(task: StatisticsHarborTask): StatisticsHarborResponse {
  switch (task.mode) {
    case 'collect': {
      const plan = planExample(task);
      return { kind, mode: task.mode, variable: task.variable, method: methods[task.variable], plan,
        visits: Object.fromEntries(plan.map(id => [id, harborVisit(task, id, task.variable)!])) };
    }
    case 'structure': {
      const logs = [...new Set(task.slips.map(slip => slip.log))];
      const unique = logs.map(log => task.slips.find(slip => slip.log === log)!);
      const rows = Object.fromEntries(unique.map(slip => [slip.log, {
        receipt: slip.id, value: String(slip.value ?? ''),
        condition: slip.value === null ? 'missing' as const :
          slip.value < task.usual[0] || slip.value > task.usual[1] ? 'check' as const : 'reading' as const,
      }]));
      return { kind, mode: task.mode, variable: task.variable, unit: task.unit, rows,
        copies: task.slips.filter(slip => !unique.includes(slip)).map(slip => slip.id) };
    }
    case 'freq': return { kind, mode: task.mode, counts: asStrings(harborCounts(task.values, task.categories)), total: String(task.values.length) };
    case 'relative': {
      const [a, b] = task.groups, format = task.format === 'percent' ? percentRatio : asRatio;
      return { kind, mode: task.mode, frequencies: [String(a.value), String(b.value)],
        ratios: [format(a.value, a.total), format(b.value, b.total)], comparison: ratioCompare(a.value, a.total, b.value, b.total) };
    }
    case 'mean': {
      const sum = total(task.values), count = task.values.length;
      return { kind, mode: task.mode, count: String(count), total: String(sum), mean: asRatio(sum, count), newCount: String(count + 1),
        newMean: asRatio(sum + task.addition, count + 1), meaning: 'equal-share',
        change: task.addition * count > sum ? 'rose' : task.addition * count < sum ? 'fell' : 'equal' };
    }
    case 'median': {
      const rows = [...task.rows].sort((a, b) => a.value - b.value);
      const previous = task.previous && harborMedian(rows.map(row => row.id === task.previous!.id ? task.previous!.value : row.value));
      return { kind, mode: task.mode, order: rows.map(row => row.id), middle: middleIndices(rows.length).map(i => rows[i]!.id),
        median: asRatio(...harborMedian(rows.map(row => row.value))), previous: previous ? asRatio(...previous) : '' };
    }
    case 'mode': {
      const modes = harborModes(task.values, task.categories);
      return { kind, mode: task.mode, counts: asStrings(harborCounts(task.values, task.categories)), modes,
        status: !modes.length ? 'none' : modes.length === 1 ? 'one' : 'many' };
    }
    case 'spread': {
      const [a, b] = task.series, an = countNear(a.values, task.centre, task.radius), bn = countNear(b.values, task.centre, task.radius);
      return { kind, mode: task.mode, ranges: [String(range(a.values)), String(range(b.values))], near: [String(an), String(bn)],
        moreCentral: numericCompare(BigInt(an), BigInt(bn)) };
    }
    case 'interpret': {
      const [a, b] = task.rows, totals = task.totals;
      return { kind, mode: task.mode, issue: task.issue, compared: task.compareCharts, change: String(b.value - a.value),
        ratios: totals ? [asRatio(a.value, totals[0]), asRatio(b.value, totals[1])] : ['', ''],
        comparison: totals ? ratioCompare(a.value, totals[0], b.value, totals[1]) : null };
    }
    case 'chart': {
      const step = Math.max(1, Math.ceil(Math.max(...task.rows.map(row => row.value)) / 6));
      return { kind, mode: task.mode, draft: { type: task.order === 'time' ? 'line' : 'bar', axis: task.axis,
        unit: task.unit, start: '0', step: String(step), top: String(6 * step),
        values: Object.fromEntries(task.rows.map(row => [row.id, String(row.value)])) } };
    }
    case 'space': return { kind, mode: task.mode, pairs: harborPairs(task.space), count: String(harborPairs(task.space).length) };
    case 'classic': {
      const members = harborEventMembers(task), all = harborPairs(task.space);
      return { kind, mode: task.mode, members, favorable: String(members.length), total: String(all.length),
        probability: asRatio(members.length, all.length), condition: 'equal-atomic' };
    }
    case 'empirical': {
      const records = task.experiments.map(test => ({ ...test, hits: runHarborExperiment(task, test.id)!.hits }));
      return { kind, mode: task.mode, run: records.map(test => test.id), closest: closestExperiments(task),
        counts: Object.fromEntries(records.map(test => [test.id, String(test.hits)])),
        ratios: Object.fromEntries(records.map(test => [test.id, asRatio(test.hits, test.count)])),
        next: asRatio(task.sectors.filter(value => value === task.target).length, task.sectors.length), inference: 'estimate' };
    }
  }
}

export function wrongStatisticsHarborResponses(task: StatisticsHarborTask): StatisticsHarborResponse[] {
  const answer = solutionStatisticsHarbor(task);
  switch (answer.mode) {
    case 'collect': return [{ ...answer, visits: {} }, { ...answer, plan: [] }];
    case 'structure': return [{ ...answer, unit: '' }, { ...answer, rows: {} }];
    case 'freq': return [{ ...answer, total: '' }];
    case 'relative': return [{ ...answer, ratios: ['', ''] }];
    case 'mean': return [{ ...answer, meaning: 'every' }, { ...answer, newCount: answer.count }];
    case 'median': return [{ ...answer, middle: [] }];
    case 'mode': return [{ ...answer, counts: {} }, { ...answer, status: null }];
    case 'spread': return [{ ...answer, near: ['', ''] }];
    case 'interpret': return [{ ...answer, issue: '' }];
    case 'chart': return [{ ...answer, draft: { ...answer.draft, start: '1' } }];
    case 'space': return [{ ...answer, pairs: answer.pairs.slice(1) }];
    case 'classic': return [{ ...answer, condition: 'equal-categories' }];
    case 'empirical': return [{ ...answer, run: [] }, { ...answer, inference: 'compensation' }];
  }
}
