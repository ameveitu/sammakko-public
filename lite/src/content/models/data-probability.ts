import type { Verdict } from '../../engine/types';
import { sameMeasure } from './spatial-measures';

export interface DataOption { id: string; label: string }
export interface DataRow extends DataOption { value: number }
export type DataChartKind = 'bar' | 'line' | 'picture';
export interface DataChart {
  type: DataChartKind;
  rows: readonly DataRow[];
  title: string;
  horizontalAxis: string;
  verticalAxis: string;
  step: number;
  top: number;
  key?: number;
  horizontal?: boolean;
}
export interface DataBag { name: string; tokens: readonly DataOption[] }
export type DataBoard =
  | { kind: 'table'; rows: readonly DataRow[]; columns: readonly [string, string]; note?: string }
  | { kind: 'chart'; chart: DataChart; note?: string }
  | { kind: 'bags'; bags: readonly DataBag[]; note: string }
  | { kind: 'product'; groups: readonly [readonly DataOption[], readonly DataOption[]]; labels: readonly [string, string]; note?: string };

export type DataField =
  | { kind: 'number'; id: string; label: string; answer: string }
  | { kind: 'choice'; id: string; label: string; options: readonly DataOption[]; answer: string }
  | { kind: 'set'; id: string; label: string; options: readonly DataOption[]; answer: readonly string[] };
export interface DataChartAction {
  kind: 'chart';
  rows: readonly DataRow[];
  types: readonly { type: DataChartKind; reasons: readonly string[] }[];
  reasonOptions?: readonly DataOption[];
  titleOptions: readonly DataOption[];
  categoryOptions: readonly DataOption[];
  valueOptions: readonly DataOption[];
  labels: { title: string; category: string; value: string };
  initialScale: { step: number; top: number; key: number };
}
export type DataAction = DataChartAction | {
  kind: 'tuples'; groups: readonly [readonly DataOption[], readonly DataOption[]]; labels: readonly [string, string];
};
export interface DataProbabilityTask {
  kind: 'data-probability';
  board: DataBoard;
  fields: readonly DataField[];
  action?: DataAction;
  why: string;
}
export interface DataChartResponse {
  type: DataChartKind | null;
  reason: string;
  title: string;
  category: string;
  value: string;
  baseline: number | null;
  step: number | null;
  top: number | null;
  key: number | null;
  heights: Record<string, number | null>;
}
export interface DataProbabilityResponse {
  kind: 'data-probability';
  values: Record<string, string>;
  sets: Record<string, string[]>;
  tuples: string[][];
  chart: DataChartResponse | null;
}

export function extremes(rows: readonly DataRow[], direction: 'min' | 'max') {
  const value = direction === 'min' ? Math.min(...rows.map(row => row.value)) : Math.max(...rows.map(row => row.value));
  return { value, ids: rows.filter(row => row.value === value).map(row => row.id) };
}
export function frequencies(rows: readonly DataRow[]) {
  const counts = new Map<number, number>();
  for (const { value } of rows) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort(([a], [b]) => a - b);
}
export function modes(rows: readonly DataRow[]) {
  const counts = frequencies(rows), max = Math.max(...counts.map(([, count]) => count));
  if (counts.length > 1 && counts.every(([, count]) => count === max)) return [];
  return counts.filter(([, count]) => count === max).map(([value]) => value);
}
export const cartesian = (groups: readonly [readonly DataOption[], readonly DataOption[]]) =>
  groups[0].flatMap(a => groups[1].map(b => [a.id, b.id]));
export const complementary = (all: readonly DataOption[], selected: readonly string[]) =>
  all.filter(item => !selected.includes(item.id)).map(item => item.id);
export function compareChances(a: number, n: number, b: number, m: number) {
  if (![a, n, b, m].every(Number.isSafeInteger) || n <= 0 || m <= 0 || a < 0 || b < 0 || a > n || b > m) return;
  const left = BigInt(a) * BigInt(m), right = BigInt(b) * BigInt(n);
  return left > right ? 'a' : left < right ? 'b' : 'equal';
}
const sameSet = (actual: readonly string[], required: readonly string[]) =>
  actual.length === required.length && new Set(actual).size === actual.length && required.every(id => actual.includes(id));
const fail = (why: string): Verdict => ({ ok: false, why });

function checkChart(action: DataChartAction, chart: DataChartResponse | null): Verdict {
  const type = action.types.find(option => option.type === chart?.type);
  if (!chart || !type || (action.reasonOptions && !type.reasons.includes(chart.reason))) {
    return fail('Valitse aineistoon sopiva kuva ja sitä tukeva peruste. Mieti, vertaillaanko luokkia vai seurataanko ajassa tapahtuvaa muutosta.');
  }
  if (chart.title !== action.labels.title || chart.category !== action.labels.category || chart.value !== action.labels.value) {
    return fail('Valitse diagrammille aineistoa kuvaava otsikko ja akselien nimet. Merkitse myös arvojen yksikkö.');
  }
  if (chart.type === 'picture') {
    if (!Number.isSafeInteger(chart.key) || chart.key! <= 0 ||
      action.rows.some(row => row.value % chart.key! !== 0 || row.value / chart.key! > 18)) {
      return fail('Käytä samankokoisille kuvioille samaa avainta. Jokaisen pylvään tai kuvarivin on annettava aineiston tarkka määrä.');
    }
  } else if (chart.baseline !== 0 || !Number.isSafeInteger(chart.step) || !Number.isSafeInteger(chart.top) ||
    chart.step! <= 0 || chart.top! < Math.max(...action.rows.map(row => row.value)) ||
    chart.top! % chart.step! !== 0 || chart.top! / chart.step! < 2 || chart.top! / chart.step! > 12) {
    return fail('Aloita asteikko nollasta. Tee tasaväliset jaot ja valitse yläraja, joka kattaa kaikki arvot.');
  }
  return Object.keys(chart.heights).length === action.rows.length && action.rows.every(row => chart.heights[row.id] === row.value)
    ? { ok: true } : fail('Siirrä jokainen aineiston arvo oman luokkansa kohdalle.');
}

export function checkDataProbability(task: DataProbabilityTask, response: DataProbabilityResponse): Verdict {
  if (task.action?.kind === 'chart') {
    const verdict = checkChart(task.action, response.chart);
    if (!verdict.ok) return verdict;
  }
  if (task.action?.kind === 'tuples') {
    if (response.tuples.some(tuple => tuple.length !== 2)) return fail(task.why);
    const key = (values: string[]) => JSON.stringify(values);
    if (!sameSet(response.tuples.map(key), cartesian(task.action.groups).map(key))) return fail(task.why);
  }
  for (const field of task.fields) {
    const value = response.values[field.id] ?? '';
    const correct = field.kind === 'set' ? sameSet(response.sets[field.id] ?? [], field.answer)
      : field.kind === 'number' ? sameMeasure(value, field.answer) : value === field.answer;
    if (!correct) return fail(task.why);
  }
  return { ok: true };
}

export function solutionDataProbability(task: DataProbabilityTask): DataProbabilityResponse {
  const answer: DataProbabilityResponse = { kind: task.kind, values: {}, sets: {}, tuples: [], chart: null };
  for (const field of task.fields) {
    if (field.kind === 'set') answer.sets[field.id] = [...field.answer];
    else answer.values[field.id] = field.answer;
  }
  if (task.action?.kind === 'tuples') answer.tuples = cartesian(task.action.groups);
  if (task.action?.kind === 'chart') {
    const { types, labels, initialScale, rows } = task.action;
    answer.chart = { type: types[0]!.type, reason: types[0]!.reasons[0] ?? '', ...labels,
      baseline: 0, ...initialScale, heights: Object.fromEntries(rows.map(row => [row.id, row.value])) };
  }
  return answer;
}

export function wrongDataProbabilityResponses(task: DataProbabilityTask): DataProbabilityResponse[] {
  const answer = solutionDataProbability(task);
  if (task.action?.kind === 'chart') return [{ ...answer, chart: null }];
  if (task.action?.kind === 'tuples') return [{ ...answer, tuples: answer.tuples.slice(1) }];
  const field = task.fields[0]!;
  return field.kind === 'set'
    ? [{ ...answer, sets: { ...answer.sets, [field.id]: field.answer.length ? [] : ['incorrect'] } }]
    : [{ ...answer, values: { ...answer.values, [field.id]: '' } }];
}
