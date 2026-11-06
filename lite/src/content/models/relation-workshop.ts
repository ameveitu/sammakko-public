import { parseMeasure } from './spatial-measures';

type Q = readonly [bigint, bigint];
const z: Q = [0n, 1n];
function normalize(n: bigint, d: bigint): Q {
  if (d === 0n) throw new RangeError('Division by zero');
  const sign = d < 0n ? -1n : 1n;
  let a = n < 0n ? -n : n, b = d * sign;
  while (b) [a, b] = [b, a % b];
  return [sign * n / a, sign * d / a];
}
const int = (n: number): Q => [BigInt(n), 1n];
const q = (value: unknown): Q | undefined => typeof value === 'string' && value.length < 40 ? parseMeasure(value) : undefined;
const eq = (a: Q, b: Q) => a[0] * b[1] === b[0] * a[1];
const cmp = (a: Q, b: Q) => a[0] * b[1] < b[0] * a[1] ? -1 : a[0] * b[1] > b[0] * a[1] ? 1 : 0;
const plus = (a: Q, b: Q): Q => normalize(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
const neg = ([n, d]: Q): Q => [-n, d];
const times = (a: Q, b: Q): Q => normalize(a[0] * b[0], a[1] * b[1]);
const divide = (a: Q, b: Q): Q => normalize(a[0] * b[1], a[1] * b[0]);
const has = (given: unknown, expected: Q) => { const value = q(given); return !!value && eq(value, expected); };
const exactText = (v: Q) => {
  const [n, d] = normalize(...v);
  return d === 1n ? String(n) : `${n}/${d}`;
};

export type LinearEquation = readonly [x: number, y: number, constant: number];
type PairOfEquations = readonly [LinearEquation, LinearEquation];
export type RelationPoint = { x: string; y: string };
export type RelationAxis = { x: readonly [number, number]; y: readonly [number, number]; xStep: number; yStep: number };
export type Affine = { kind: 'affine'; a: number; b: number };
export type Factored = { kind: 'factored'; a: number; b: number; c: number; d: number };
export type CalculableFunction = Affine | Factored;
export type PlottedFunction = CalculableFunction | { kind: 'raised-square'; centre: number; rise: number };
export type RelationContext = { title: string; skills: readonly string[] };
type TableRow = { x: string; y: string };
type FunctionBoard = { fn: CalculableFunction; axis: RelationAxis; setting: string };
type SystemKind = 'one' | 'none' | 'many';
export type RelationMode =
  | { mode: 'direct'; rows: readonly TableRow[]; xName: string; yName: string; setting: string }
  | { mode: 'inverse'; rows: readonly TableRow[]; xName: string; yName: string; setting: string; condition: 'work' | 'area' }
  | { mode: 'system-concept'; equations: PairOfEquations; candidates: readonly RelationPoint[]; setting: string }
  | { mode: 'system-algebra'; equations: PairOfEquations; method: 'eliminate' | 'substitute' | 'either'; setting: string }
  | { mode: 'system-graph'; equations: PairOfEquations; axis: RelationAxis; setting: string }
  | { mode: 'intercept'; fn: Affine; axis: RelationAxis; view: 'graph' | 'formula'; setting: string; unit: string }
  | { mode: 'zero-calc'; fn: CalculableFunction; setting: string }
  | { mode: 'zero-graph'; fn: PlottedFunction; axis: RelationAxis; setting: string }
  | ({ mode: 'zero-integration' } & FunctionBoard);

export type RelationWorkshopTask = RelationMode & { kind: 'relation-workshop'; context: RelationContext };
type Variable = 'x' | 'y';
type Isolation = { method: 'substitute'; original: 0 | 1 | null; isolated: Variable | null; slope: string; offset: string; coefficient: string; rhs: string };
type Elimination = { method: 'eliminate'; canceled: Variable | null; first: string; second: string; coefficient: string; rhs: string };
export type SystemWork = Isolation | Elimination;
export type ZeroWork = { equations: { coefficient: string; rhs: string }[]; roots: string[];
  substitutions: { terms: string[]; value: string }[] };
export type EquationVerification = { ax: string; by: string; lhs: string };
type TableResponse = { values: string[]; proportional: boolean | null };
type RelationResponseMode =
  | ({ mode: 'direct'; y0: string } & TableResponse)
  | ({ mode: 'inverse'; zeroExcluded: boolean | null; condition: string } & TableResponse)
  | { mode: 'system-concept'; rows: { left: [string, string]; fits: boolean | null }[];
      type: SystemKind | null; factor: string; scaledRhs: string }
  | { mode: 'system-algebra'; work: SystemWork | null; point: RelationPoint; checks: [EquationVerification, EquationVerification] }
  | { mode: 'system-graph'; type: SystemKind | null; points: RelationPoint[]; checks: [string, string] }
  | { mode: 'intercept'; value: string; point: RelationPoint; initial: string; interpretation: string }
  | ({ mode: 'zero-calc' } & ZeroWork)
  | { mode: 'zero-graph'; rootType: 'listed' | 'none' | null; roots: string[] }
  | ({ mode: 'zero-integration'; graph: string[]; locked: boolean } & ZeroWork);

export type RelationWorkshopResponse = RelationResponseMode & { kind: 'relation-workshop' };
const kind = 'relation-workshop' as const;
type Task<M extends RelationMode['mode']> = Extract<RelationWorkshopTask, { mode: M }>;
type Answer<M extends RelationMode['mode']> = Extract<RelationWorkshopResponse, { mode: M }>;
type Pair = readonly [Q, Q];
const fail = (why: string) => ({ ok: false, why });
const pass = { ok: true };
const variableIndex = (v: Variable) => v === 'x' ? 0 : 1;
function point(value: RelationPoint | undefined): Pair | undefined {
  const x = q(value?.x), y = q(value?.y);
  return x && y ? [x, y] : undefined;
}
const asPoint = ([x, y]: Pair): RelationPoint => ({ x: exactText(x), y: exactText(y) });
function left(line: LinearEquation, p: Pair): Q {
  return plus(times(int(line[0]), p[0]), times(int(line[1]), p[1]));
}
const satisfies = (line: LinearEquation, p: Pair) => eq(left(line, p), int(line[2]));
const determinant = (a: number, b: number, c: number, d: number) => BigInt(a) * BigInt(d) - BigInt(b) * BigInt(c);
export function relationSystem(equations: PairOfEquations): { type: 'one'; point: RelationPoint } | { type: 'none' | 'many' } {
  const [[a, b, u], [c, d, v]] = equations;
  const emptyFirst = a === 0 && b === 0, emptySecond = c === 0 && d === 0;
  if (emptyFirst || emptySecond) return { type: (emptyFirst && u !== 0) || (emptySecond && v !== 0) ? 'none' : 'many' };
  const det = determinant(a, b, c, d);
  if (det !== 0n) return { type: 'one', point: asPoint([normalize(determinant(u, b, v, d), det), normalize(determinant(a, u, c, v), det)]) };
  return { type: determinant(a, u, c, v) === 0n && determinant(b, u, d, v) === 0n ? 'many' : 'none' };
}

export function evaluateRelationFunction(fn: PlottedFunction, raw: string): string | undefined {
  const x = q(raw);
  if (!x) return;
  const affine = (a: number, b: number) => plus(times(int(a), x), int(b));
  switch (fn.kind) {
    case 'affine': return exactText(affine(fn.a, fn.b));
    case 'factored': return exactText(times(affine(fn.a, fn.b), affine(fn.c, fn.d)));
    case 'raised-square': {
      const shifted = affine(1, -fn.centre);
      return exactText(plus(times(shifted, shifted), int(fn.rise)));
    }
  }
}
function zeroEquations(fn: CalculableFunction) {
  return fn.kind === 'affine' ? [[fn.a, -fn.b] as const] : [[fn.a, -fn.b] as const, [fn.c, -fn.d] as const];
}
function roots(fn: PlottedFunction): Q[] {
  if (fn.kind === 'raised-square') return [];
  const list = zeroEquations(fn).map(([coefficient, rhs]) => divide(int(rhs), int(coefficient)));
  return list.filter((value, i) => !list.slice(0, i).some(v => eq(v, value))).sort(cmp);
}
const visibleRoots = (fn: PlottedFunction, axis: RelationAxis) =>
  roots(fn).filter(x => cmp(x, int(axis.x[0])) >= 0 && cmp(x, int(axis.x[1])) <= 0);
function setOfNumbers(given: readonly string[] | undefined, required: readonly Q[]) {
  if (!Array.isArray(given) || given.length !== required.length) return false;
  const parsed = Array.from(given, q);
  return required.every(target => parsed.filter(value => value && eq(value, target)).length === 1);
}
function zeroTerms(fn: CalculableFunction, x: Q): Q[] {
  const ax = times(int(fn.a), x);
  return fn.kind === 'affine' ? [ax] : [plus(ax, int(fn.b)), plus(times(int(fn.c), x), int(fn.d))];
}
function zeroWork(fn: CalculableFunction, answer: ZeroWork) {
  const expected = zeroEquations(fn);
  if (!Array.isArray(answer.equations) || answer.equations.length !== expected.length) return false;
  const scratch = [...answer.equations];
  for (const [coefficient, rhs] of expected) {
    const i = scratch.findIndex(value => has(value?.coefficient, int(coefficient)) && has(value?.rhs, int(rhs)));
    if (i < 0) return false;
    scratch.splice(i, 1);
  }
  return setOfNumbers(answer.roots, roots(fn)) && Array.isArray(answer.substitutions) && answer.substitutions.length === answer.roots.length &&
    answer.roots.every((root, i) => {
      const x = q(root)!;
      const check = answer.substitutions[i];
      return check && correctTable(check.terms, zeroTerms(fn, x)) && has(check.value, q(evaluateRelationFunction(fn, root))!);
    });
}
function tableValues(task: Task<'direct'> | Task<'inverse'>): Q[] {
  return task.rows.flatMap(row => {
    const x = q(row.x)!, y = q(row.y)!;
    return task.mode === 'inverse' ? [times(x, y)] : x[0] === 0n ? [] : [divide(y, x)];
  });
}
function directZero(task: Task<'direct'>) {
  return task.rows.find(row => has(row.x, z));
}
function constantTable(task: Task<'direct'> | Task<'inverse'>, values: readonly Q[]) {
  if (!values.length || values.some(v => !eq(v, values[0]!))) return false;
  if (task.mode === 'inverse') return values[0]![0] !== 0n && task.rows.every(row => !has(row.x, z));
  const origin = directZero(task);
  return origin ? has(origin.y, z) : true;
}
function correctTable(given: readonly string[], expected: readonly Q[]) {
  return Array.isArray(given) && given.length === expected.length && expected.every((v, i) => has(given[i], v));
}
function equationChecks(equations: PairOfEquations, p: Pair, values: readonly string[]) {
  return Array.isArray(values) && values.length === 2 && equations.every((line, i) => satisfies(line, p) && has(values[i], left(line, p)));
}
function algebraChecks(equations: PairOfEquations, p: Pair, checks: readonly EquationVerification[]) {
  return Array.isArray(checks) && checks.length === 2 && equations.every((line, i) => {
    const check = checks[i];
    return check && satisfies(line, p) && has(check.ax, times(int(line[0]), p[0])) &&
      has(check.by, times(int(line[1]), p[1])) && has(check.lhs, left(line, p));
  });
}
function elimination(lines: PairOfEquations, work: Elimination): boolean {
  const m = q(work.first), n = q(work.second);
  if (!m || !n || !m[0] || !n[0] || (work.canceled !== 'x' && work.canceled !== 'y')) return false;
  const index = variableIndex(work.canceled);
  const combine = (j: number) => plus(times(m, int(lines[0][j]!)), times(n, int(lines[1][j]!)));
  const coefficient = combine(1 - index);
  return eq(combine(index), z) && coefficient[0] !== 0n && has(work.coefficient, coefficient) && has(work.rhs, combine(2));
}
function substitution(lines: PairOfEquations, work: Isolation): boolean {
  if ((work.original !== 0 && work.original !== 1) || (work.isolated !== 'x' && work.isolated !== 'y')) return false;
  const source = lines[work.original], other = lines[work.original === 0 ? 1 : 0];
  const i = variableIndex(work.isolated), j = i === 0 ? 1 : 0;
  if (source[i] === 0) return false;
  const slope = divide(neg(int(source[j])), int(source[i]));
  const offset = divide(int(source[2]), int(source[i]));
  const coefficient = plus(times(int(other[i]), slope), int(other[j]));
  const rhs = plus(int(other[2]), neg(times(int(other[i]), offset)));
  return coefficient[0] !== 0n && has(work.slope, slope) && has(work.offset, offset) &&
    has(work.coefficient, coefficient) && has(work.rhs, rhs);
}
const inside = (p: Pair, axis: RelationAxis) => [axis.x, axis.y].every(([low, high], i) => cmp(p[i]!, int(low)) >= 0 && cmp(p[i]!, int(high)) <= 0);
function checkGraphSystem(task: Task<'system-graph'>, answer: Answer<'system-graph'>) {
  const type = relationSystem(task.equations).type;
  if (answer.type !== type || !Array.isArray(answer.points) || answer.points.length !== (type === 'one' ? 1 : 2)) return false;
  const a = point(answer.points[0]), b = point(answer.points[1]);
  if (!a || !inside(a, task.axis)) return false;
  if (type === 'one') return equationChecks(task.equations, a, answer.checks);
  if (!b || !inside(b, task.axis) || (eq(a[0], b[0]) && eq(a[1], b[1]))) return false;
  if (type === 'many') return [a, b].every(p => task.equations.every(line => satisfies(line, p)));
  const vertical = task.equations[0][1] === 0;
  return eq(a[vertical ? 1 : 0], b[vertical ? 1 : 0]) && satisfies(task.equations[0], a) && satisfies(task.equations[1], b);
}

export function checkRelationWorkshop(task: RelationWorkshopTask, answer: RelationWorkshopResponse): { ok: boolean; why?: string } {
  if (!answer || answer.kind !== kind || task.mode !== answer.mode) return fail('Tämä merkintä kuuluu toiseen työpöytään.');
  switch (task.mode) {
    case 'direct':
    case 'inverse': {
      if (answer.mode !== 'direct' && answer.mode !== 'inverse') break;
      const products = tableValues(task);
      if (!correctTable(answer.values, products) || answer.proportional !== constantTable(task, products)) {
        return fail(task.mode === 'direct' ? 'Laske y/x erikseen kaikilla nollasta poikkeavilla syötteillä. Tarkista myös, lähteekö malli nollasta.'
          : 'Laske x·y jokaisesta parista. Pienenevä y-arvo ei yksin osoita vakiotuloa.');
      }
      if (task.mode === 'direct' && answer.mode === 'direct') {
        const row = directZero(task);
        return !row || has(answer.y0, q(row.y)!) ? pass : fail('Kirjaa nollan syötteen tulos suoraan taulukosta ilman jakolaskua.');
      }
      if (task.mode === 'inverse' && answer.mode === 'inverse') return answer.zeroExcluded === true && answer.condition === task.condition ? pass :
        fail('Mallin x on positiivinen. Tarkista myös, mikä annetuissa oloissa pidetään samana.');
      break;
    }
    case 'system-concept': {
      if (answer.mode !== task.mode) break;
      const system = relationSystem(task.equations);
      if (answer.type !== system.type || !Array.isArray(answer.rows) || answer.rows.length !== task.candidates.length ||
          !task.candidates.every((candidate, i) => {
            const p = point(candidate)!, row = answer.rows[i];
            return row && Array.isArray(row.left) && row.left.length === 2 && task.equations.every((line, j) => has(row.left[j], left(line, p))) &&
              row.fits === task.equations.every(line => satisfies(line, p));
          })) return fail('Sijoita sama pari kumpaankin yhtälöön. Merkitse, täyttyvätkö molemmat ehdot yhtä aikaa.');
      if (system.type === 'one') return pass;
      const [first, second] = task.equations, index = first[0] ? 0 : 1;
      const factor = divide(int(second[index]), int(first[index]));
      return has(answer.factor, factor) && has(answer.scaledRhs, times(factor, int(first[2]))) ? pass :
        fail('Vertaa koko toista yhtälöä skaalattuun ensimmäiseen yhtälöön. Katso myös oikeaa puolta.');
    }
    case 'system-algebra': {
      if (answer.mode !== task.mode) break;
      const work = answer.work, p = point(answer.point);
      if (!work || (task.method !== 'either' && work.method !== task.method) ||
          (work.method === 'eliminate' ? !elimination(task.equations, work) : work.method !== 'substitute' || !substitution(task.equations, work))) {
        return fail('Kirjaa oma yhden tuntemattoman yhtälö. Kerro kokonaiset yhtälöt tai sijoita erotettu lauseke toiseen ehtoon.');
      }
      return p && algebraChecks(task.equations, p, answer.checks) ? pass :
        fail('Kirjoita sama ratkaisupari ja laske sillä kummankin alkuperäisen yhtälön vasen puoli.');
    }
    case 'system-graph':
      if (answer.mode === task.mode) return checkGraphSystem(task, answer) ? pass :
        fail('Vertaa suorien suuntia ja merkittyjä pisteitä. Yhteinen piste kuuluu molempiin ehtoihin.');
      break;
    case 'intercept':
      if (answer.mode === task.mode) return has(answer.value, int(task.fn.b)) && has(answer.point?.x, z) && has(answer.point?.y, int(task.fn.b)) &&
        has(answer.initial, int(task.fn.b)) && answer.interpretation === 'at-zero' ? pass :
        fail('Y-akselilla x on nolla. Funktion arvo siinä kohdassa kertoo tilanteen alkuarvon.');
      break;
    case 'zero-calc':
      if (answer.mode === task.mode) return zeroWork(task.fn, answer) ? pass :
        fail('Aseta funktion arvo nollaksi. Kirjaa yhtälöt ennen jakoa ja tarkista kukin löydetty x sijoittamalla.');
      break;
    case 'zero-graph':
      if (answer.mode === task.mode) {
        const expected = visibleRoots(task.fn, task.axis);
        return answer.rootType === (expected.length ? 'listed' : 'none') && setOfNumbers(answer.roots, expected) ? pass :
          fail('Lue x-koordinaatit niistä kohdista, joissa kuvaajan y-arvo on nolla annetulla välillä.');
      }
      break;
    case 'zero-integration':
      if (answer.mode === task.mode) return answer.locked === true && setOfNumbers(answer.graph, visibleRoots(task.fn, task.axis)) &&
        zeroWork(task.fn, answer) ? pass : fail('Lukitse kuvaajan nollakohdat, ratkaise ne myös laskemalla ja varmista yhteys sijoittamalla.');
      break;
  }
  return fail('Täydennä työpöydän merkinnät.');
}

function solvedZero(fn: CalculableFunction): ZeroWork {
  const answers = roots(fn).map(exactText);
  return { equations: zeroEquations(fn).map(([coefficient, rhs]) => ({ coefficient: String(coefficient), rhs: String(rhs) })),
    roots: answers, substitutions: answers.map(x => ({ terms: zeroTerms(fn, q(x)!).map(exactText), value: evaluateRelationFunction(fn, x)! })) };
}
function solvedAlgebra(task: Task<'system-algebra'>): SystemWork {
  const [a, b] = task.equations;
  if (task.method === 'eliminate') {
    const i = a[0] && b[0] ? 0 : 1, j = i === 0 ? 1 : 0;
    const m = b[i], n = -a[i];
    return { method: 'eliminate', canceled: i === 0 ? 'x' : 'y', first: String(m), second: String(n),
      coefficient: String(m * a[j] + n * b[j]), rhs: String(m * a[2] + n * b[2]) };
  }
  const i = Math.abs(a[0]) === 1 ? 0 : a[1] ? 1 : 0, j = i === 0 ? 1 : 0;
  const slope = divide(neg(int(a[j])), int(a[i])), offset = divide(int(a[2]), int(a[i]));
  return { method: 'substitute', original: 0, isolated: i === 0 ? 'x' : 'y', slope: exactText(slope), offset: exactText(offset),
    coefficient: exactText(plus(times(int(b[i]), slope), int(b[j]))), rhs: exactText(plus(int(b[2]), neg(times(int(b[i]), offset)))) };
}
export function relationLineSamples(line: LinearEquation, axis: RelationAxis): RelationPoint[] {
  const [a, b, c] = line;
  const limits: Pair[] = [];
  if (b) for (const x of axis.x) limits.push([int(x), divide(int(c - a * x), int(b))]);
  if (a) for (const y of axis.y) limits.push([divide(int(c - b * y), int(a)), int(y)]);
  return limits.filter((p, i) => inside(p, axis) && !limits.slice(0, i).some(other => eq(other[0], p[0]) && eq(other[1], p[1]))).map(asPoint);
}
function samplePoint(line: LinearEquation, fixed: number) {
  const [a, b, c] = line;
  return b ? asPoint([int(fixed), divide(int(c - a * fixed), int(b))]) : asPoint([divide(int(c), int(a)), int(fixed)]);
}
export function solutionRelationWorkshop(task: RelationWorkshopTask): RelationWorkshopResponse {
  switch (task.mode) {
    case 'direct': case 'inverse': {
      const v = tableValues(task);
      const summary = { kind, values: v.map(exactText), proportional: constantTable(task, v) };
      return task.mode === 'direct' ? { ...summary, mode: task.mode, y0: directZero(task)?.y ?? '' } :
        { ...summary, mode: task.mode, zeroExcluded: true, condition: task.condition };
    }
    case 'system-concept': {
      const type = relationSystem(task.equations).type;
      const [a, b] = task.equations, i = a[0] ? 0 : 1;
      const factor = divide(int(b[i]), int(a[i]));
      return { kind, mode: task.mode, type, factor: exactText(factor), scaledRhs: exactText(times(factor, int(a[2]))),
        rows: task.candidates.map(candidate => {
          const p = point(candidate)!;
          return { left: task.equations.map(line => exactText(left(line, p))) as [string, string], fits: task.equations.every(line => satisfies(line, p)) };
        }) };
    }
    case 'system-algebra': {
      const answer = relationSystem(task.equations);
      if (answer.type !== 'one') throw new RangeError('An algebra exercise needs one solution');
      const p = point(answer.point)!;
      const checks = task.equations.map(([a, b, c]) => ({ ax: exactText(times(int(a), p[0])), by: exactText(times(int(b), p[1])), lhs: String(c) }));
      return { kind, mode: task.mode, work: solvedAlgebra(task), point: answer.point, checks: [checks[0]!, checks[1]!] };
    }
    case 'system-graph': {
      const answer = relationSystem(task.equations);
      const [first, second] = task.equations;
      const points = answer.type === 'one' ? [answer.point] : [samplePoint(first, 0), samplePoint(answer.type === 'many' ? first : second, answer.type === 'many' ? 1 : 0)];
      return { kind, mode: task.mode, type: answer.type, points, checks: task.equations.map(line => String(line[2])) as [string, string] };
    }
    case 'intercept': return { kind, mode: task.mode, value: String(task.fn.b), initial: String(task.fn.b), point: { x: '0', y: String(task.fn.b) }, interpretation: 'at-zero' };
    case 'zero-calc': return { kind, mode: task.mode, ...solvedZero(task.fn) };
    case 'zero-graph': {
      const values = visibleRoots(task.fn, task.axis).map(exactText);
      return { kind, mode: task.mode, rootType: values.length ? 'listed' : 'none', roots: values };
    }
    case 'zero-integration': return { kind, mode: task.mode, ...solvedZero(task.fn), graph: visibleRoots(task.fn, task.axis).map(exactText), locked: true };
  }
}
export function wrongRelationWorkshopResponses(task: RelationWorkshopTask): RelationWorkshopResponse[] {
  const a = solutionRelationWorkshop(task);
  switch (a.mode) {
    case 'direct': return [{ ...a, proportional: !a.proportional }];
    case 'inverse': return [{ ...a, zeroExcluded: false }, { ...a, values: [] }];
    case 'system-concept': return [{ ...a, rows: [] }, { ...a, type: null }];
    case 'system-algebra': return [{ ...a, work: null }, { ...a, checks: [a.checks[0], { ax: '', by: '', lhs: '' }] }];
    case 'system-graph': return [{ ...a, points: [] }];
    case 'intercept': return [{ ...a, point: { x: '1', y: a.point.y } }];
    case 'zero-calc': return [{ ...a, equations: [] }];
    case 'zero-graph': return [{ ...a, rootType: null }];
    case 'zero-integration': return [{ ...a, locked: false }, { ...a, graph: [] }];
  }
}
