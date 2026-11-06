import type { Verdict } from '../../engine/types';

export type Point = readonly [x: number, y: number];
export type Cell = readonly [x: number, y: number, layer: number];
export interface SpatialVolumeScene {
  kind: 'spatial-volume';
  title: string;
  grid: readonly [columns: number, rows: number, layers: number];
  cells: readonly Cell[];
}
export interface AnglePicture { vertex: Point; start: number; opening: number; clockwise: boolean; lengths: readonly [number, number]; id?: string; names?: readonly [string, string, string]; showDegrees?: boolean }
export type SpatialBoard =
  | { kind: 'grid'; size: number; shown: readonly Point[]; path?: readonly Point[]; motifs?: readonly (readonly Point[])[]; largePin?: boolean; legend?: string }
  | { kind: 'angles'; angles: readonly AnglePicture[]; tool?: 'draw' | 'protractor'; legend?: string }
  | { kind: 'lines'; lines: readonly { id: string; style: 'segment' | 'ray' | 'line' | 'arc'; bearing: number }[] }
  | { kind: 'cells'; grid: readonly [columns: number, rows: number, layers: number]; cells: readonly Cell[]; unit: string; legend?: string }
  | { kind: 'rotation'; center: Point; spokes: readonly number[]; allowed: readonly number[]; labelOffset: number }
  | { kind: 'measure'; givens: readonly { label: string; value: string }[]; divisions?: number; legend?: string };
export type SpatialField =
  | { id: string; label: string; kind: 'choice'; options: readonly { id: string; label: string }[]; answer: string }
  | { id: string; label: string; kind: 'number'; answer: string };
export type SpatialAction =
  | { kind: 'points'; expected: readonly Point[]; ordered?: boolean; count: number }
  | { kind: 'cells'; expected: readonly Cell[] }
  | { kind: 'degree'; opening: number; tolerance: number }
  | { kind: 'protractor'; vertex: Point; heading: number; opening: number; scale: 'a' | 'b' }
  | { kind: 'rotation'; center: Point; spokes: readonly number[]; allowed: readonly number[] }
  | { kind: 'partition'; cells: readonly Cell[]; cuts: readonly { id: string; axis: 0 | 1; at: number; label: string }[]; avoid?: string };

export interface SpatialMeasureTask {
  kind: 'spatial-measures';
  board: SpatialBoard;
  fields: readonly SpatialField[];
  action?: SpatialAction;
  why: string;
}
export interface SpatialMeasureResponse {
  kind: 'spatial-measures';
  values: Record<string, string>;
  points: Point[];
  cells: Cell[];
  degrees: number | null;
  tested: number[];
}

const key = (point: readonly number[]) => point.join(',');
const safeCoordinates = (points: readonly (readonly number[])[], size: number) =>
  points.every(point => point.length === size && point.every(Number.isSafeInteger));
function samePlaces(given: readonly (readonly number[])[], expected: readonly (readonly number[])[], ordered = false) {
  if (given.length !== expected.length) return false;
  const values = given.map(key);
  return new Set(values).size === values.length && expected.every((point, i) => ordered ? values[i] === key(point) : values.includes(key(point)));
}
type Exact = readonly [bigint, bigint];
export function parseMeasure(value: string): Exact | undefined {
  const text = value.trim().replace('−', '-');
  const ratio = /^([+-]?\d{1,9})\s*[:/]\s*([+-]?\d{1,9})$/.exec(text);
  if (ratio) {
    const n = BigInt(ratio[1]!), d = BigInt(ratio[2]!);
    return d !== 0n ? d < 0n ? [-n, -d] : [n, d] : undefined;
  }
  const decimal = /^([+-]?)(\d{1,9})(?:[,.](\d{1,8}))?$/.exec(text);
  if (!decimal) return;
  return [(decimal[1] === '-' ? -1n : 1n) * BigInt(decimal[2]! + (decimal[3] ?? '')), 10n ** BigInt(decimal[3]?.length ?? 0)];
}
export function sameMeasure(a: string, b: string) {
  const left = parseMeasure(a), right = parseMeasure(b);
  return !!left && !!right && left[0] * right[1] === right[0] * left[1];
}

export function hasRotation(spokes: readonly number[], degrees: number) {
  if (!Number.isSafeInteger(degrees) || degrees <= 0 || degrees >= 360 || !spokes.length) return false;
  const shift = degrees * spokes.length / 360;
  return Number.isInteger(shift) && spokes.every((value, i) => value === spokes[(i + shift) % spokes.length]);
}
export function translated(points: readonly Point[], [dx, dy]: Point): Point[] {
  return points.map(([x, y]) => [x + dx, y + dy]);
}
export function scaled(points: readonly Point[], [x0, y0]: Point, [x1, y1]: Point, n: number, d: number): Point[] {
  return points.map(([x, y]) => [x1 + (x - x0) * n / d, y1 + (y - y0) * n / d]);
}
export function classifyOpening(degrees: number) {
  if (!Number.isSafeInteger(degrees) || degrees < 0 || degrees > 180) return;
  return degrees === 0 ? 'zero' : degrees < 90 ? 'acute' : degrees === 90 ? 'right' : degrees < 180 ? 'obtuse' : 'straight';
}
export function partitions(action: Extract<SpatialAction, { kind: 'partition' }>, key: string) {
  const cut = action.cuts.find(candidate => candidate.id === key);
  if (!cut || key === action.avoid) return;
  const a = action.cells.filter(cell => cell[cut.axis] < cut.at);
  const b = action.cells.filter(cell => cell[cut.axis] >= cut.at);
  const isRectangle = (part: readonly Cell[]) => {
    const xs = part.map(p => p[0]), ys = part.map(p => p[1]);
    return part.length > 0 && (Math.max(...xs) - Math.min(...xs) + 1) * (Math.max(...ys) - Math.min(...ys) + 1) === part.length;
  };
  return isRectangle(a) && isRectangle(b) ? { a, b } : undefined;
}

const no = (why: string): Verdict => ({ ok: false, why });
const valid = { ok: true } as const;
export function checkSpatialMeasure(task: SpatialMeasureTask, answer: SpatialMeasureResponse): Verdict {
  const action = task.action;
  if (action?.kind === 'points' &&
    (!safeCoordinates(answer.points, 2) || !samePlaces(answer.points, action.expected, action.ordered))) return no(task.why);
  if (action?.kind === 'cells' &&
    (!safeCoordinates(answer.cells, 3) || !samePlaces(answer.cells, action.expected))) return no(task.why);
  if (action?.kind === 'degree' &&
    (!Number.isSafeInteger(answer.degrees) || answer.degrees! < 0 || answer.degrees! > 180 ||
      Math.abs(answer.degrees! - action.opening) > action.tolerance)) return no(task.why);
  if (action?.kind === 'protractor') {
    if (!safeCoordinates(answer.points, 2) || !samePlaces(answer.points, [action.vertex])) return no('Napsauta kulmamitan keskipiste kulman kärkeen.');
    if (answer.degrees !== action.heading) return no('Käännä mitan pohjaviiva alkukyljelle ja asteikkokaari kulman aukeavalle puolelle.');
    if (answer.values.scale !== action.scale) return no('Valitse asteikko, joka alkaa nollasta alkukyljen kohdalla.');
    if (!sameMeasure(answer.values.read ?? '', String(action.opening))) return no('Lue valitsemasi asteikon arvo toisen kyljen kohdalla.');
  }
  if (action?.kind === 'rotation') {
    if (!safeCoordinates(answer.points, 2) || !samePlaces(answer.points, [action.center])) return no('Merkitse pyörityksen keskipiste.');
    const matches = action.allowed.filter(degrees => hasRotation(action.spokes, degrees));
    const selected = answer.degrees;
    const shown = new Set(answer.tested);
    if (matches.length
      ? selected === null || !matches.includes(selected) || !shown.has(selected)
      : selected !== null || !action.allowed.every(degrees => shown.has(degrees))) return no(task.why);
  }
  if (action?.kind === 'partition') {
    const parts = partitions(action, answer.values.cut ?? '');
    if (!parts) return no('Valitse sallittu leikkaus, josta syntyy kaksi suorakulmiota ilman päällekkäisyyttä.');
    if (!sameMeasure(answer.values.first ?? '', String(parts.a.length)) ||
      !sameMeasure(answer.values.second ?? '', String(parts.b.length)) ||
      !sameMeasure(answer.values.total ?? '', String(parts.a.length + parts.b.length))) return no(task.why);
  }
  return task.fields.every(field => {
    const value = answer.values[field.id] ?? '';
    return field.kind === 'choice' ? value === field.answer : sameMeasure(value, field.answer);
  }) ? valid : no(task.why);
}

export function solutionSpatialMeasure(task: SpatialMeasureTask): SpatialMeasureResponse {
  const answer: SpatialMeasureResponse = { kind: task.kind, values: Object.fromEntries(task.fields.map(field => [field.id, field.answer])),
    points: [], cells: [], degrees: null, tested: [] };
  const a = task.action;
  if (a?.kind === 'points') answer.points = [...a.expected];
  if (a?.kind === 'cells') answer.cells = [...a.expected];
  if (a?.kind === 'degree') answer.degrees = a.opening;
  if (a?.kind === 'protractor') {
    answer.points = [a.vertex]; answer.degrees = a.heading;
    Object.assign(answer.values, { scale: a.scale, read: String(a.opening) });
  }
  if (a?.kind === 'rotation') {
    answer.points = [a.center]; answer.tested = [...a.allowed];
    answer.degrees = a.allowed.find(d => hasRotation(a.spokes, d)) ?? null;
  }
  if (a?.kind === 'partition') {
    const cut = a.cuts.find(c => partitions(a, c.id))!;
    const parts = partitions(a, cut.id)!;
    Object.assign(answer.values, { cut: cut.id, first: String(parts.a.length), second: String(parts.b.length), total: String(parts.a.length + parts.b.length) });
  }
  return answer;
}

export function wrongSpatialMeasureResponses(task: SpatialMeasureTask): SpatialMeasureResponse[] {
  const answer = solutionSpatialMeasure(task);
  if (task.fields.length) {
    const key = task.fields[0]!.id;
    return [{ ...answer, values: { ...answer.values, [key]: '' } }];
  }
  if (task.action?.kind === 'degree') return [{ ...answer, degrees: null }];
  if (task.action?.kind === 'cells') return [{ ...answer, cells: [] }];
  if (task.action?.kind === 'partition') return [{ ...answer, values: {} }];
  return [{ ...answer, points: [] }];
}
