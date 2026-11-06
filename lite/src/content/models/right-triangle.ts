import { sameMeasure } from './spatial-measures';

export type TriangleIndex = 0 | 1 | 2;
export type Point2 = readonly [number, number];
export type TrianglePair = readonly [TriangleIndex, TriangleIndex];
export type TrigRatio = 'sin' | 'cos' | 'tan';
export type TriangleClass = 'acute' | 'right' | 'obtuse';
export type TriangleRule = 'sqrt-sum' | 'sqrt-difference' | 'times' | 'divide' | 'inverse';

export interface RightTriangleDiagram {
  /** Side i is opposite vertex i. */
  labels: readonly [string, string, string];
  points: readonly [Point2, Point2, Point2];
  known: Readonly<Partial<Record<TriangleIndex, number>>>;
  right?: TriangleIndex;
  focus?: TriangleIndex;
  markedAngle?: number;
  target?: TriangleIndex;
  unit: 'm' | 'cm';
  name: string;
}

export type TriangleJob =
  | { kind: 'identity'; board: number; comparison: number }
  | { kind: 'converse'; board: number }
  | { kind: 'pyth-length'; board: number; target: TriangleIndex }
  | { kind: 'ratio'; board: number; focus: TriangleIndex; taught?: TrigRatio; offered?: TrianglePair; calculate?: boolean }
  | { kind: 'trig-side'; board: number; focus: TriangleIndex; taught: TrigRatio; target: TriangleIndex; given: TriangleIndex; degrees: number }
  | { kind: 'trig-angle'; board: number; focus: TriangleIndex; taught: TrigRatio };

export interface RightTriangleTask {
  kind: 'right-triangle';
  diagrams: readonly RightTriangleDiagram[];
  jobs: readonly TriangleJob[];
  setting?: RightTriangleScene['mode'];
  context?: { kind: 'trig'; ratio: TrigRatio };
}
export interface TriangleWork {
  pair?: readonly TriangleIndex[];
  single?: TriangleIndex;
  judgment?: TriangleClass;
  sum?: string;
  square?: string;
  ratio?: TrigRatio;
  rule?: TriangleRule;
  value?: string;
}
export interface RightTriangleResponse {
  kind: 'right-triangle';
  work: readonly TriangleWork[];
}
export interface RightTriangleScene {
  kind: 'right-triangle';
  mode: 'rope' | 'height' | 'sighting' | 'relay';
  title: string;
  vertices: readonly (readonly [number, number, number])[];
  focus?: TriangleIndex;
  right?: TriangleIndex;
  shownSides: readonly TriangleIndex[];
}

export const TRIANGLE_INDICES = [0, 1, 2] as const;
export const ratioName: Readonly<Record<TrigRatio, string>> = { sin: 'sini', cos: 'kosini', tan: 'tangentti' };
export const className: Readonly<Record<TriangleClass, string>> = { acute: 'teräväkulmainen', right: 'suorakulmainen', obtuse: 'tylppäkulmainen' };
export function sideVertices(side: TriangleIndex): TrianglePair {
  return TRIANGLE_INDICES.filter(vertex => vertex !== side) as unknown as TrianglePair;
}
export function sideSquared(diagram: RightTriangleDiagram, side: TriangleIndex): number {
  const [a, b] = sideVertices(side).map(i => diagram.points[i]) as [Point2, Point2];
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
}
export function sideName(diagram: RightTriangleDiagram, side: TriangleIndex): string {
  return sideVertices(side).map(vertex => diagram.labels[vertex]).join('');
}
export function trigPair(right: TriangleIndex, focus: TriangleIndex, ratio: TrigRatio): TrianglePair {
  const adjacent = TRIANGLE_INDICES.find(side => side !== right && side !== focus)!;
  return ratio === 'sin' ? [focus, right] : ratio === 'cos' ? [adjacent, right] : [focus, adjacent];
}
const ordered = (actual: unknown, expected: TrianglePair) => Array.isArray(actual) && actual.length === 2
  && actual[0] === expected[0] && actual[1] === expected[1];
const unordered = (actual: unknown, expected: TrianglePair) =>
  ordered(actual, expected) || ordered(actual, [expected[1], expected[0]]);

function readNumber(text: unknown): number | null {
  if (typeof text !== 'string' || text.length > 50) return null;
  const normalized = text.trim().replaceAll(',', '.').replaceAll('−', '-');
  const decimal = '[+-]?(?:\\d+(?:\\.\\d+)?|\\.\\d+)';
  const fraction = normalized.match(new RegExp(`^(${decimal})\\s*/\\s*(${decimal})$`));
  const root = normalized.match(new RegExp(`^(?:√\\s*(${decimal})|sqrt\\(\\s*(${decimal})\\s*\\))$`, 'i'));
  const value = fraction ? Number(fraction[1]) / Number(fraction[2])
    : root ? Math.sqrt(Number(root[1] ?? root[2])) : new RegExp(`^${decimal}$`).test(normalized) ? Number(normalized) : NaN;
  return Number.isFinite(value) ? value : null;
}
const equalNumber = (value: unknown, expected: number, digits?: number) => {
  const entered = readNumber(value);
  return entered !== null && (Math.abs(entered - expected) <= 1e-9
    || digits !== undefined && Math.abs(entered - Number(expected.toFixed(digits))) <= 1e-9);
};
const equalRatio = (value: unknown, expected: string) => {
  if (typeof value !== 'string' || value.length > 50) return false;
  return sameMeasure(value, expected) || sameMeasure(value, readNumber(expected)!.toFixed(3));
};
/** Numeric response fields retain only recognized number notation. */
export function recordedRightTriangleWork(work: TriangleWork): TriangleWork {
  const { sum, square, value, ...choices } = work;
  const result: TriangleWork = { ...choices };
  for (const [key, text] of [['sum', sum], ['square', square], ['value', value]] as const) {
    if (text && text.length <= 50 && (readNumber(text) !== null || sameMeasure(text, text))) result[key] = text.trim();
  }
  return result;
}

function knownSquared(board: RightTriangleDiagram, side: TriangleIndex): number {
  const length = board.known[side];
  return length === undefined ? sideSquared(board, side) : length ** 2;
}
function largestSide(board: RightTriangleDiagram): TriangleIndex {
  return TRIANGLE_INDICES.reduce((largest, side) => knownSquared(board, side) > knownSquared(board, largest) ? side : largest);
}
function classify(sum: number, square: number): TriangleClass {
  return sum === square ? 'right' : sum > square ? 'acute' : 'obtuse';
}
function rowSolution(task: RightTriangleTask, row: TriangleJob): TriangleWork {
  const board = task.diagrams[row.board]!;
  const right = board.right;
  switch (row.kind) {
    case 'identity': {
      const comparison = task.diagrams[row.comparison]!;
      const largest = largestSide(comparison);
      const [a, b] = sideVertices(largest);
      return { pair: sideVertices(right!), single: right, judgment: classify(knownSquared(comparison, a) + knownSquared(comparison, b), knownSquared(comparison, largest)) };
    }
    case 'converse': {
      const single = largestSide(board);
      const [a, b] = sideVertices(single);
      const sum = knownSquared(board, a) + knownSquared(board, b);
      const square = knownSquared(board, single);
      return { single, sum: String(sum), square: String(square), judgment: classify(sum, square) };
    }
    case 'pyth-length': {
      const [a, b] = sideVertices(row.target);
      const isHypotenuse = row.target === right;
      const pair = isHypotenuse || a === right ? [a, b] as const : [b, a] as const;
      const square = isHypotenuse ? knownSquared(board, a) + knownSquared(board, b) : knownSquared(board, pair[0]) - knownSquared(board, pair[1]);
      return { pair, rule: isHypotenuse ? 'sqrt-sum' : 'sqrt-difference', square: String(square), value: String(Math.sqrt(square)) };
    }
    case 'ratio': {
      const ratio = row.taught ?? (['sin', 'cos', 'tan'] as const).find(r => unordered(row.offered, trigPair(right!, row.focus, r)))!;
      const pair = trigPair(right!, row.focus, ratio);
      const numerator = board.known[pair[0]]!;
      const denominator = board.known[pair[1]]!;
      return { pair, ratio, ...(row.taught || row.calculate ? { value: `${numerator}/${denominator}` } : {}) };
    }
    case 'trig-side': {
      const pair = trigPair(right!, row.focus, row.taught);
      const theta = row.degrees * Math.PI / 180;
      const factor = ({ sin: Math.sin, cos: Math.cos, tan: Math.tan })[row.taught](theta);
      const multiply = pair[0] === row.target;
      const length = board.known[row.given]!;
      return { pair, ratio: row.taught, rule: multiply ? 'times' : 'divide', value: String(multiply ? length * factor : length / factor) };
    }
    case 'trig-angle': {
      const pair = trigPair(right!, row.focus, row.taught);
      const fraction = board.known[pair[0]]! / board.known[pair[1]]!;
      const angle = ({ sin: Math.asin, cos: Math.acos, tan: Math.atan })[row.taught](fraction) * 180 / Math.PI;
      return { pair, ratio: row.taught, rule: 'inverse', value: String(angle) };
    }
  }
}

export function solutionRightTriangle(task: RightTriangleTask): RightTriangleResponse {
  return { kind: 'right-triangle', work: task.jobs.map(row => rowSolution(task, row)) };
}
interface TriangleVerdict { ok: boolean; why?: string }
const pass: TriangleVerdict = { ok: true };
const fail = (why: string): TriangleVerdict => ({ ok: false, why });

function checkRow(task: RightTriangleTask, job: TriangleJob, work: TriangleWork): TriangleVerdict {
  const expected = rowSolution(task, job);
  switch (job.kind) {
    case 'identity':
      if (work.single !== expected.single || !unordered(work.pair, expected.pair as TrianglePair))
        return fail('Aseta kateettien neliöt samalle puolelle ja hypotenuusan neliö yksin vastapäätä.');
      return work.judgment === expected.judgment ? pass : fail('Vertaa myös toisen kolmion kulmaa ja neliöaloja.');
    case 'converse':
      if (!TRIANGLE_INDICES.includes(work.single as TriangleIndex)
        || knownSquared(task.diagrams[job.board]!, work.single!) !== Number(expected.square))
        return fail('Etsi ensin pisin sivu näkyvistä mitoista.');
      if (!equalNumber(work.sum, Number(expected.sum)) || !equalNumber(work.square, Number(expected.square)))
        return fail('Vertaa kahden lyhyemmän sivun neliöiden summaa pisimmän sivun neliöön.');
      return work.judgment === expected.judgment ? pass : fail('Yhtäsuuret neliöalat todistavat suoran kulman. Päättele muista vertailuista kulman laji.');
    case 'pyth-length': {
      const correctPair = expected.rule === 'sqrt-sum' ? unordered(work.pair, expected.pair as TrianglePair) : ordered(work.pair, expected.pair as TrianglePair);
      if (work.rule !== expected.rule || !correctPair)
        return fail('Ratkaise tuntemattoman neliö. Hypotenuusaa varten lasketaan yhteen, kateettia varten vähennetään.');
      if (!equalNumber(work.square, Number(expected.square))) return fail('Laske tuntemattoman sivun neliö valitsemillasi mitoilla.');
      return equalNumber(work.value, Number(expected.value), 1) ? pass : fail('Ota sivun neliöstä positiivinen neliöjuuri.');
    }
    case 'ratio':
    case 'trig-side':
    case 'trig-angle':
      if (work.ratio !== expected.ratio || !ordered(work.pair, expected.pair as TrianglePair))
        return fail('Etsi valittu kulma, hypotenuusa ja siihen nähden vastainen sekä viereinen kateetti.');
      if (job.kind === 'ratio') {
        if (!job.taught && !job.calculate) return pass;
        return equalRatio(work.value, expected.value!) ? pass : fail('Laske suhde jakamalla osoittajan sivun pituus nimittäjän pituudella.');
      }
      if (work.rule !== expected.rule)
        return fail(job.kind === 'trig-angle' ? 'Tuntematon on kulma. Käytä sivusuhteen käänteisfunktiota asteina.' : 'Eristä tuntematon sivu suhdeyhtälöstä. Tarkista, onko se osoittajassa vai nimittäjässä.');
      return equalNumber(work.value, Number(expected.value), 1) ? pass : fail('Tarkista sijoitus ja pyöristys. Käytä kulmissa laskimen asteasetusta.');
  }
}
export function checkRightTriangle(task: RightTriangleTask, response: RightTriangleResponse): TriangleVerdict {
  if (!response || response.kind !== 'right-triangle' || !Array.isArray(response.work) || response.work.length !== task.jobs.length)
    return fail('Täytä kaikki mittauskortin rivit.');
  for (const [index, job] of task.jobs.entries()) {
    const work = response.work[index];
    if (!work || typeof work !== 'object' || Array.isArray(work)) return fail('Täytä kaikki mittauskortin rivit.');
    const prototype = Object.getPrototypeOf(work);
    if (prototype !== null && prototype !== Object.prototype) return fail('Täytä kaikki mittauskortin rivit.');
    const verdict = checkRow(task, job, work);
    if (!verdict.ok) return task.jobs.length === 1 ? verdict : fail(`Rivi ${index + 1}. ${verdict.why}`);
  }
  return pass;
}
export function wrongRightTriangleResponses(task: RightTriangleTask): RightTriangleResponse[] {
  const correct = solutionRightTriangle(task);
  const first = correct.work[0]!;
  return [
    { ...correct, work: [] },
    { ...correct, work: [{ ...first, pair: [0, 0], single: undefined }, ...correct.work.slice(1)] },
    { ...correct, work: [{ ...first, judgment: undefined, rule: undefined, ratio: undefined, value: '0' }, ...correct.work.slice(1)] },
  ];
}
