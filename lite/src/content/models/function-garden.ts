import { parseMeasure } from './spatial-measures';

export type GardenPoint = readonly [x: number, y: number];
export type GardenAxis = { x: readonly [number, number]; y: readonly [number, number]; xStep: number; yStep: number; xName: string; yName: string };
export type GardenDirection = 'rising' | 'falling' | 'constant';
export type GardenSign = 'positive' | 'zero' | 'negative';
export type GardenCurve = { type: 'parabola' | 'quartic' | 'line' | 'absolute'; a: number; h: number; k: number };
type GardenContext = { title: string; skills: readonly string[] };
type Mono = { mode: 'mono'; points: readonly GardenPoint[]; axis: GardenAxis; signAt: number;
  draft?: { from: number; to: number; direction: GardenDirection }; setting: string };
type Parabola = { mode: 'parabola'; curve: GardenCurve; choices: readonly { id: string; curve: GardenCurve }[];
  view: 'formula' | 'samples'; samples: readonly GardenPoint[]; checkX: number; axis: GardenAxis; setting: string };
type ParabolaGraph = { mode: 'parabola-graph'; curve: GardenCurve; table: readonly { x: number; y?: number }[];
  axis: GardenAxis; setting: string };
export type GardenPattern = 'difference' | 'ratio';
export type GardenTerm = { index: number; value: number };
type Sequence = { mode: 'sequence'; target: 'structure' | 'rule' | 'integration'; pattern?: GardenPattern;
  start: number; observed: readonly GardenTerm[]; testIndex: number; view: 'windows' | 'numbers'; setting: string };
export type FunctionGardenTask = (Mono | Parabola | ParabolaGraph | Sequence) & { kind: 'function-garden'; context: GardenContext };
export type GardenCoordinate = { x: string; y: string };
export type GardenInterval = { from: string; to: string; direction: GardenDirection | null };
export type GardenRule = { form: 'anchored' | 'recursive'; anchor: string; value: string; step: string };
type MonoResponse = { mode: 'mono'; intervals: GardenInterval[]; value: string; sign: GardenSign | null; draftWorks: boolean | null };
type ParabolaResponse = { mode: 'parabola'; choice: string; pair: GardenCoordinate };
type ParabolaGraphResponse = { mode: 'parabola-graph'; points: GardenCoordinate[]; vertex: GardenCoordinate; mirror: string[];
  path: 'smooth' | 'segments' | 'line' | null; locked: boolean };
type SequenceResponse = { mode: 'sequence'; pattern: GardenPattern | null; steps: string[]; firstIndex: string;
  rule: GardenRule | null; checkTerm: string; testTerm: string };
export type FunctionGardenResponse = (MonoResponse | ParabolaResponse | ParabolaGraphResponse | SequenceResponse) & { kind: 'function-garden' };
type Task<M extends FunctionGardenTask['mode']> = Extract<FunctionGardenTask, { mode: M }>;
type Q = readonly [bigint, bigint];
const kind = 'function-garden' as const;
const fail = (why: string) => ({ ok: false, why });
const pass = { ok: true };
export function gardenNumber(raw: unknown): Q | undefined {
  return typeof raw === 'string' && raw.length <= 32 ? parseMeasure(raw) : undefined;
}
const integer = (n: number): Q => [BigInt(n), 1n];
const same = (a: Q, b: Q) => a[0] * b[1] === a[1] * b[0];
const compare = (a: Q, b: Q) => {
  const left = a[0] * b[1], right = b[0] * a[1];
  return left < right ? -1 : left > right ? 1 : 0;
};
const has = (raw: unknown, target: Q) => { const parsed = gardenNumber(raw); return !!parsed && same(parsed, target); };
const times = (a: Q, b: Q): Q => [a[0] * b[0], a[1] * b[1]];
const plus = (a: Q, b: Q): Q => [a[0] * b[1] + b[0] * a[1], a[1] * b[1]];
const coordinate = (x: number, y: number): GardenCoordinate => ({ x: String(x), y: String(y) });
const matches = (p: GardenCoordinate | undefined, [x, y]: GardenPoint) => has(p?.x, integer(x)) && has(p?.y, integer(y));

export function evaluateGardenCurve(curve: GardenCurve, x: number) {
  const d = x - curve.h;
  switch (curve.type) {
    case 'parabola': return curve.a * d * d + curve.k;
    case 'quartic': return curve.a * d ** 4 / 4 + curve.k;
    case 'absolute': return 2 * curve.a * Math.abs(d) + curve.k;
    case 'line': return curve.a * d + curve.k;
  }
}
export function gardenIntervals(points: readonly GardenPoint[]) {
  const sections: { from: number; to: number; direction: GardenDirection }[] = [];
  for (let i = 1; i < points.length; i++) {
    const [a, y] = points[i - 1]!, [b, z] = points[i]!;
    const direction = z === y ? 'constant' : z > y ? 'rising' : 'falling';
    const last = sections.at(-1);
    if (last?.direction === direction) last.to = b;
    else sections.push({ from: a, to: b, direction });
  }
  return sections;
}
function checkMonotonicity(task: Task<'mono'>, answer: MonoResponse) {
  const expected = gardenIntervals(task.points);
  const intervals = Array.isArray(answer.intervals) ? Array.from(answer.intervals) : [];
  if (intervals.length !== expected.length || !intervals.every(s => s && gardenNumber(s.from) && gardenNumber(s.to)))
    return fail('Merkitse kaikki mahdollisimman pitkät yhtenäiset jaksot. Liitä mukaan myös vakiojaksot.');
  intervals.sort((a, b) => compare(gardenNumber(a.from)!, gardenNumber(b.from)!));
  if (!expected.every((s, i) => {
    const a = intervals[i]!;
    return a.direction === s.direction && has(a.from, integer(s.from)) && has(a.to, integer(s.to));
  })) return fail('Lue kuvaajaa vasemmalta oikealle. Sama suunta voi jatkua taitteen yli, ja suunta vaihtuu vain käännekohdassa.');
  const value = task.points.find(([x]) => x === task.signAt)![1];
  const sign = value === 0 ? 'zero' : value < 0 ? 'negative' : 'positive';
  if (!has(answer.value, integer(value)) || answer.sign !== sign)
    return fail('Arvon merkki kertoo sijainnin x-akseliin nähden. Se ei kerro, mihin suuntaan kuvaaja kulkee.');
  if (task.draft) {
    const { from, to, direction } = task.draft;
    const correct = expected.some(s => s.from <= from && s.to >= to && s.direction === direction);
    if (answer.draftWorks !== correct) return fail('Tarkista luonnoksen jakso vertaamalla sen alku- ja loppupään korkeuksia.');
  }
  return pass;
}
function checkParabola(task: Task<'parabola'>, answer: ParabolaResponse) {
  const expected = task.choices.find(v => v.curve.type === 'parabola')!;
  if (!matches(answer.pair, [task.checkX, evaluateGardenCurve(task.curve, task.checkX)]))
    return fail('Tuota pyydetty arvopari. Samanmuotoisilta näyttävät kuvaajat voivat antaa eri tuloksen tällä x-arvolla.');
  if (answer.choice !== expected.id) return fail('Vertaa valittua kuvaajaa omaan arvopariisi ja muihin annettuihin tietoihin.');
  return pass;
}
function graphPoints(task: Task<'parabola-graph'>): GardenPoint[] {
  return task.table.map(({ x }) => [x, evaluateGardenCurve(task.curve, x)]);
}
function checkGraph(task: Task<'parabola-graph'>, answer: ParabolaGraphResponse) {
  const points = graphPoints(task);
  if (answer.locked !== true || !Array.isArray(answer.points) || answer.points.length !== points.length ||
      !points.every(p => answer.points.filter(a => matches(a, p)).length === 1))
    return fail('Sijoita ja lukitse kaikki eri arvoparit. Tarkista puuttuva arvo huipun vastakkaiselta puolelta.');
  if (!matches(answer.vertex, [task.curve.h, task.curve.k]))
    return fail('Huippu on paraabelin kääntymiskohta. Kirjaa sen molemmat koordinaatit.');
  const mirror = Array.isArray(answer.mirror) && answer.mirror.length === 2 ? Array.from(answer.mirror, gardenNumber) : [];
  if (!mirror[0] || !mirror[1] || same(mirror[0], mirror[1]) ||
      !same(plus(mirror[0], mirror[1]), integer(2 * task.curve.h)) ||
      !mirror.every(x => x && points.some(p => same(x, integer(p[0])))))
    return fail('Valitse kaksi eri taulukon x-arvoa yhtä kaukaa huipun kummaltakin puolelta.');
  if (answer.path !== 'smooth') return fail('Jatkuva paraabeli on sileä kaari. Pisteiden kautta vedetty jana tai taittoviiva ei ole sama kuvaaja.');
  return pass;
}
function observedStep(task: Task<'sequence'>) {
  const terms = task.observed;
  const d = terms[1]!.value - terms[0]!.value;
  const r: Q = [BigInt(terms[1]!.value), BigInt(terms[0]!.value)];
  const arithmetic = terms.every((term, i) => i === 0 || term.value - terms[i - 1]!.value === d);
  return arithmetic ? { pattern: 'difference' as const, step: integer(d) } : { pattern: 'ratio' as const, step: r };
}
export function gardenRuleValue(pattern: GardenPattern, rule: GardenRule, index: number): Q | undefined {
  if (!rule || !['anchored', 'recursive'].includes(rule.form)) return;
  const a = gardenNumber(rule.anchor), value = gardenNumber(rule.value), step = gardenNumber(rule.step);
  if (!a || !value || !step || a[0] % a[1] !== 0n || a[0] < 0n || a[0] > 20n * a[1] || !Number.isSafeInteger(index)) return;
  const n = BigInt(index) - a[0] / a[1];
  if (n < -20n || n > 20n || rule.form === 'recursive' && n < 0n) return;
  if (pattern === 'difference') return plus(value, times(step, [n, 1n]));
  if (step[0] <= 0n || value[0] === 0n) return;
  return n < 0n ? times(value, [step[1] ** -n, step[0] ** -n]) : times(value, [step[0] ** n, step[1] ** n]);
}
export function gardenWitness(task: Task<'sequence'>) {
  return task.observed[Math.floor(task.observed.length / 2)]!;
}
function sequenceStep(pattern: GardenPattern, current: number, prev: number): Q {
  return pattern === 'difference' ? integer(current - prev) : [BigInt(current), BigInt(prev)];
}
function checkSequence(task: Task<'sequence'>, answer: SequenceResponse) {
  const expected = observedStep(task), pattern = expected.pattern;
  if (answer.pattern !== pattern || task.pattern && answer.pattern !== task.pattern)
    return fail('Vertaa peräkkäisiä havaintoja. Tässä aineistossa joko erotus tai suhde säilyy samana.');
  if (task.target !== 'rule') {
    if (!Array.isArray(answer.steps) || answer.steps.length !== task.observed.length - 1 || !task.observed.slice(1).every(({ value }, i) =>
        has(answer.steps[i], sequenceStep(pattern, value, task.observed[i]!.value))))
      return fail('Tuota jokaisesta näkyvästä siirtymästä oma erotus tai suhde. Yksi oikea seuraava termi ei osoita rakennetta.');
  }
  const ref = task.observed[0]!;
  const expectedRule: GardenRule = { form: 'anchored', anchor: String(ref.index), value: String(ref.value), step: exactText(expected.step) };
  if (task.target === 'structure') {
    return has(answer.testTerm, gardenRuleValue(pattern, expectedRule, task.testIndex)!)
      ? pass : fail('Käytä juuri tarkistamaasi siirtymäsääntöä puuttuvan vaiheen laskemiseen.');
  }
  if (!has(answer.firstIndex, integer(task.start)) || !answer.rule ||
      answer.rule.form === 'recursive' && !has(answer.rule.anchor, integer(task.start)))
    return fail('Merkitse jonon ensimmäinen indeksi. Rekursion aloitustermi kuuluu siihen, kun taas kaavan ankkurin saa valita.');
  const rule = answer.rule;
  if (!task.observed.every(({ index, value }) => {
    const prediction = gardenRuleValue(pattern, rule, index);
    return prediction && same(prediction, integer(value));
  })) return fail('Kokeile omaa sääntöä kaikkiin näkyviin vaiheisiin. Tarkista aloitusarvo, siirtymä ja se, montako askelta kuljetaan.');
  const witness = gardenWitness(task);
  const target = gardenRuleValue(pattern, rule, task.testIndex);
  if (!target || !has(answer.checkTerm, integer(witness.value)) || !has(answer.testTerm, target))
    return fail('Laske säännöstä tarkistusvaihe ja uusi vaihe. Vaiheen indeksi ja termin arvo ovat eri lukuja.');
  return pass;
}

export function checkFunctionGarden(task: FunctionGardenTask, answer: FunctionGardenResponse) {
  if (answer?.kind === kind) {
    if (task.mode === 'mono' && answer.mode === 'mono') return checkMonotonicity(task, answer);
    if (task.mode === 'parabola' && answer.mode === 'parabola') return checkParabola(task, answer);
    if (task.mode === 'parabola-graph' && answer.mode === 'parabola-graph') return checkGraph(task, answer);
    if (task.mode === 'sequence' && answer.mode === 'sequence') return checkSequence(task, answer);
  }
  return fail('Täydennä kasvihuoneen tämän havaintopöydän merkinnät.');
}
function exactText([n, d]: Q) {
  let a = n < 0n ? -n : n, b = d;
  while (b) [a, b] = [b, a % b];
  return d === a ? String(n / a) : `${n / a}/${d / a}`;
}
export function solutionFunctionGarden(task: FunctionGardenTask): FunctionGardenResponse {
  switch (task.mode) {
    case 'mono': {
      const intervals = gardenIntervals(task.points);
      const value = task.points.find(([x]) => x === task.signAt)![1];
      return { kind, mode: 'mono', intervals: intervals.map(({ from, to, direction }) => ({ from: String(from), to: String(to), direction })),
        value: String(value), sign: value === 0 ? 'zero' : value > 0 ? 'positive' : 'negative',
        draftWorks: task.draft ? intervals.some(s => s.from <= task.draft!.from && s.to >= task.draft!.to && s.direction === task.draft!.direction) : null };
    }
    case 'parabola':
      return { kind, mode: 'parabola', choice: task.choices.find(v => v.curve.type === 'parabola')!.id,
        pair: coordinate(task.checkX, evaluateGardenCurve(task.curve, task.checkX)) };
    case 'parabola-graph': {
      const { h, k } = task.curve;
      return { kind, mode: 'parabola-graph', points: graphPoints(task).map(([x, y]) => coordinate(x, y)),
        vertex: coordinate(h, k), mirror: [String(h - 1), String(h + 1)], path: 'smooth', locked: true };
    }
    case 'sequence': {
      const { pattern, step } = observedStep(task), first = task.observed[0]!;
      const rule: GardenRule = { form: 'anchored', anchor: String(first.index), value: String(first.value), step: exactText(step) };
      return { kind, mode: 'sequence', pattern, steps: task.observed.slice(1).map(({ value }, i) => exactText(sequenceStep(pattern, value, task.observed[i]!.value))),
        firstIndex: String(task.start), rule, checkTerm: String(gardenWitness(task).value), testTerm: exactText(gardenRuleValue(pattern, rule, task.testIndex)!) };
    }
  }
}
export function wrongFunctionGardenResponses(task: FunctionGardenTask): FunctionGardenResponse[] {
  const answer = solutionFunctionGarden(task);
  switch (answer.mode) {
    case 'mono': return [{ ...answer, intervals: answer.intervals.slice(0, -1) }, { ...answer, sign: null }];
    case 'parabola': return [{ ...answer, choice: '' }, { ...answer, pair: { x: answer.pair.x, y: '' } }];
    case 'parabola-graph': return [{ ...answer, path: 'segments' }, { ...answer, locked: false }];
    case 'sequence': return [{ ...answer, pattern: null }, { ...answer, testTerm: '' }];
  }
}
