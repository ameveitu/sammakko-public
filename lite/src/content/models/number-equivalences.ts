import { parseMeasure } from './spatial-measures';

export type PlacePrecision = 2 | 3;
export type Operation = 'add' | 'sub';
type Context = { title: string; skills: readonly string[] };
type Line = { mode: 'line'; skill: 'absolute' | 'opposite'; step: number; extent: number; reference: number;
  unit: string; focus?: number; distanceGiven?: number; draft?: number; setting: string };
type Place = { mode: 'place'; goal: 'add' | 'sub' | 'both'; precision: PlacePrecision; unit: string; start: number;
  changes: readonly { name: string; amount: number; operation: Operation; short: boolean }[];
  startShort: boolean; allowNegative: boolean; setting: string };
type Multiply = { mode: 'multiply'; left: number; right: number; places: readonly [1 | 2, 1 | 2]; outputUnit: string;
  contextType: 'area' | 'travel'; setting: string };
export type ProportionTerm = string | 'x';
export type ProportionPair = readonly [ProportionTerm, ProportionTerm];
type Proportion = { mode: 'proportion'; pairs: readonly [ProportionPair, ProportionPair]; modelNames: readonly [string, string];
  measureNames: readonly [string, string]; method: 'scale' | 'algebra' | 'either'; unit: string; setting: string };
export type NumberEquivalencesTask = (Line | Place | Multiply | Proportion) & { kind: 'number-equivalences'; context: Context };

export type NumberSide = 'left' | 'right' | 'zero';
type LineAnswer = { mode: 'line'; location: string; distance: string; positions: string[];
  opposite: string; side: NumberSide | null; sum: string; draftWorks: boolean | null };
export type PlaceRow = { operation: Operation | null; left: string[]; right: string[]; moves: string[]; result: string; inverse: string };
type PlaceAnswer = { mode: 'place'; rows: PlaceRow[]; estimate: { lower: string; upper: string; locked: boolean } };
export type Magnitude = 'smaller' | 'same' | 'larger';
type MultiplyAnswer = { mode: 'multiply'; prediction: Magnitude | null; locked: boolean; left: string; right: string; product: string;
  divisor: string; result: string; unit: string };
export type ProportionWork = { method: 'scale'; direction: 'forward' | 'backward' | null; factor: string }
  | { method: 'algebra'; coefficient: string; constant: string };
type ProportionAnswer = { mode: 'proportion'; relation: [ProportionPair, ProportionPair]; work: ProportionWork | null; unknown: string;
  leftCheck: string; rightCheck: string };
export type NumberEquivalencesResponse = (LineAnswer | PlaceAnswer | MultiplyAnswer | ProportionAnswer) & { kind: 'number-equivalences' };
type Task<M extends NumberEquivalencesTask['mode']> = Extract<NumberEquivalencesTask, { mode: M }>;

type Q = readonly [bigint, bigint];
const kind = 'number-equivalences' as const;
const pass = { ok: true };
const fail = (why: string) => ({ ok: false, why });
const integer = (n: number): Q => [BigInt(n), 1n];
const times = ([a, b]: Q, [c, d]: Q): Q => [a * c, b * d];
const divide = ([a, b]: Q, [c, d]: Q): Q => c < 0n ? [-a * d, -b * c] : [a * d, b * c];
const same = ([a, b]: Q, [c, d]: Q) => a * d === b * c;
const nonzero = (q: Q) => q[0] !== 0n;
export function equivalenceNumber(raw: unknown): Q | undefined {
  return typeof raw === 'string' && raw.length <= 32 ? parseMeasure(raw) : undefined;
}
const has = (raw: unknown, target: Q) => {
  const value = equivalenceNumber(raw);
  return !!value && same(value, target);
};
function exact([n, d]: Q) {
  let a = n < 0n ? -n : n, b = d;
  while (b) [a, b] = [b, a % b];
  return d === a ? String(n / a) : `${n / a}/${d / a}`;
}
export function placeText(ticks: number, places: number, shorten = false) {
  const scale = 10 ** places, absolute = Math.abs(ticks);
  const tail = String(absolute % scale).padStart(places, '0');
  const shown = shorten ? tail.replace(/0+$/, '') : tail;
  return `${ticks < 0 ? '−' : ''}${Math.floor(absolute / scale)}${shown ? ',' + shown : ''}`;
}

function lineResult(task: Task<'line'>) {
  const distance = task.distanceGiven ?? Math.abs(task.focus!);
  const opposite = -task.focus!;
  return { distance, positions: distance === 0 ? [0] : [-distance, distance], opposite,
    side: opposite === 0 ? 'zero' as const : opposite < 0 ? 'left' as const : 'right' as const };
}
function checkLine(task: Task<'line'>, answer: LineAnswer) {
  const result = lineResult(task);
  if (task.focus !== undefined && !has(answer.location, integer(task.focus)))
    return fail('Lue merkin paikka nollasta ja käytä lukusuoran mittaväliä.');
  if (!has(answer.distance, integer(result.distance)))
    return fail('Etäisyys nollasta on aina vähintään nolla. Se ilmoittaa matkan pituuden ilman suuntaa.');
  if (task.skill === 'absolute') {
    if (!Array.isArray(answer.positions) || answer.positions.length !== result.positions.length ||
        !result.positions.every(p => answer.positions.filter(v => has(v, integer(p))).length === 1))
      return fail('Sama nollasta mitattu matka löytyy kummaltakin puolelta. Nollan etäisyydellä on vain yksi paikka.');
  } else if (!has(answer.opposite, integer(result.opposite)) || answer.side !== result.side || !has(answer.sum, integer(0))) {
    return fail('Peilaa paikka nollan toiselle puolelle. Matka säilyy, ja paikkalukujen summa on nolla. Nolla peilautuu itseensä.');
  }
  if (task.draft !== undefined && answer.draftWorks !== (task.draft === result.opposite))
    return fail('Tarkista, että luonnoksella on sama etäisyys ja vastakkainen suunta. Nollalla ei ole vastakkaista puolta.');
  return pass;
}
function digits(ticks: number, precision: number) {
  return [Math.floor(ticks / 10 ** precision), ...Array.from({ length: precision }, (_, i) =>
    Math.floor(ticks / 10 ** (precision - i - 1)) % 10)];
}
export function placeWork(start: number, amount: number, operation: Operation, precision: PlacePrecision) {
  const result = start + (operation === 'add' ? amount : -amount);
  const a = operation === 'sub' && result < 0 ? amount : start;
  const b = operation === 'sub' && result < 0 ? start : amount;
  const left = digits(a, precision), right = digits(b, precision), moves = Array<number>(precision).fill(0);
  let inward = 0;
  for (let i = precision; i > 0; i--) {
    const raw = operation === 'add' ? left[i]! + right[i]! + inward : left[i]! - right[i]! - inward;
    inward = operation === 'add' ? Number(raw >= 10) : Number(raw < 0);
    moves[i - 1] = inward;
  }
  return { operation, left, right, moves, result, inverse: start };
}
export function placeRows(task: Task<'place'>) {
  let current = task.start;
  return task.changes.map(event => {
    const row = placeWork(current, event.amount, event.operation, task.precision);
    current = row.result;
    return row;
  });
}
function equalRow(raw: readonly string[] | undefined, wanted: readonly number[]) {
  return Array.isArray(raw) && raw.length === wanted.length && wanted.every((value, i) => has(raw[i], integer(value)));
}
function checkPlace(task: Task<'place'>, answer: PlaceAnswer) {
  const rows = placeRows(task), scale = 10 ** task.precision;
  if (task.goal === 'both') {
    const result = rows.at(-1)!.result;
    if (answer.estimate?.locked !== true || !has(answer.estimate.lower, integer(Math.floor(result / scale))) ||
        !has(answer.estimate.upper, integer(Math.ceil(result / scale))))
      return fail('Lukitse ensin lopputuloksen suuruusväli. Jos tulos on tasan kokonainen, molemmat rajat ovat samat.');
  }
  if (!Array.isArray(answer.rows) || answer.rows.length !== rows.length) return fail('Merkitse kummankin tapahtuman oma laskurivi.');
  for (const [i, expected] of rows.entries()) {
    const given = answer.rows[i];
    if (!given || given.operation !== expected.operation) return fail('Päätä tapahtuman perusteella lisätäänkö vai vähennetäänkö määrää.');
    if (!equalRow(given.left, expected.left) || !equalRow(given.right, expected.right))
      return fail('Kohdista kokonaiset, kymmenykset ja muut desimaaliosat samanarvoisiin sarakkeisiin. Täydennä puuttuvat paikat nollalla.');
    if (!equalRow(given.moves, expected.moves))
      return fail(expected.operation === 'add' ? 'Merkitse jokaisen sarakkeen vaihto vasemmalle. Kymmenestä pienemmästä tulee yksi suurempi.'
        : 'Merkitse jokaisen sarakkeen lainaus vasemmalta. Yhdestä suuremmasta tulee kymmenen pienempää.');
    if (!has(given.result, [BigInt(expected.result), BigInt(scale)])) return fail('Kirjaa lopputulos oikeine paikkoineen ja etumerkkeineen.');
    if (expected.operation === 'sub' && !has(given.inverse, [BigInt(expected.inverse), BigInt(scale)]))
      return fail('Tarkista erotus lisäämällä vähennetty määrä takaisin. Summan tulee palauttaa vähennettävä.');
  }
  return pass;
}
function multiplication(task: Task<'multiply'>) {
  const [p, q] = task.places;
  const unitCount = 10 ** (p + q), product = task.left * task.right, one = 10 ** q;
  return { unitCount, product, prediction: task.left === 0 || task.right === one ? 'same' as const : task.right < one ? 'smaller' as const : 'larger' as const };
}
function checkMultiply(task: Task<'multiply'>, answer: MultiplyAnswer) {
  const { unitCount, product, prediction } = multiplication(task);
  if (answer.locked !== true || answer.prediction !== prediction)
    return fail('Lukitse vertailu ensin. Verrataan samaan ensimmäiseen mittaan, kun toinen kerroin on täsmälleen yksi.');
  if (!has(answer.left, integer(task.left)) || !has(answer.right, integer(task.right)) || !has(answer.product, integer(product)))
    return fail('Kirjoita kummankin mitan osien määrät ja kerro ne keskenään. Pidä niiden desimaalipaikat erillään.');
  if (!has(answer.divisor, integer(unitCount)) || !has(answer.result, [BigInt(product), BigInt(unitCount)]) || answer.unit !== task.outputUnit)
    return fail('Kerro myös yksikkökokonaisen jaot. Jaa kokonaislukutulo näin saadulla yksikkömäärällä ja merkitse sovittu yksikkö.');
  return pass;
}

function equivalentTerm(raw: unknown, term: ProportionTerm) {
  return term === 'x' ? raw === 'x' : has(raw, equivalenceNumber(term)!);
}
function equivalentPair(raw: unknown, pair: ProportionPair) {
  return Array.isArray(raw) && raw.length === 2 && equivalentTerm(raw[0], pair[0]) && equivalentTerm(raw[1], pair[1]);
}
function reciprocal(pair: ProportionPair): ProportionPair { return [pair[1], pair[0]]; }
function relate(task: Task<'proportion'>, relation: ProportionAnswer['relation']) {
  if (!Array.isArray(relation) || relation.length !== 2) return false;
  const [a, b] = task.pairs;
  return [[a, b], [b, a], [reciprocal(a), reciprocal(b)], [reciprocal(b), reciprocal(a)]]
    .some(([x, y]) => equivalentPair(relation[0], x!) && equivalentPair(relation[1], y!));
}
function crossEquation(pairs: readonly [ProportionPair, ProportionPair]) {
  const [[a, b], [c, d]] = pairs;
  const product = (a: ProportionTerm, b: ProportionTerm) =>
    a === 'x' ? { variable: true, factor: equivalenceNumber(b)! } :
      b === 'x' ? { variable: true, factor: equivalenceNumber(a)! } :
        { variable: false, factor: times(equivalenceNumber(a)!, equivalenceNumber(b)!) };
  const first = product(a, d), second = product(b, c);
  if (first.variable === second.variable) throw new RangeError('Expected exactly one unknown in the proportion');
  return first.variable ? { coefficient: first.factor, constant: second.factor } : { coefficient: second.factor, constant: first.factor };
}
function substituted(pair: ProportionPair, unknown: Q): Q | undefined {
  const top = pair[0] === 'x' ? unknown : equivalenceNumber(pair[0]);
  const bottom = pair[1] === 'x' ? unknown : equivalenceNumber(pair[1]);
  return top && bottom && nonzero(bottom) ? divide(top, bottom) : undefined;
}
function scaleFactor(task: Task<'proportion'>, direction: 'forward' | 'backward') {
  const [left, right] = task.pairs;
  const row = left[0] !== 'x' && right[0] !== 'x' ? 0 : 1;
  const a = equivalenceNumber(left[row])!, b = equivalenceNumber(right[row])!;
  return direction === 'forward' ? divide(b, a) : divide(a, b);
}
function checkProportion(task: Task<'proportion'>, answer: ProportionAnswer) {
  if (!relate(task, answer.relation)) return fail('Kirjoita molempien mallien vastaavat mitat samassa järjestyksessä. Molemmat suhteet saa myös kääntää.');
  const work = answer.work, equation = crossEquation(task.pairs);
  if (!work || task.method !== 'either' && work.method !== task.method)
    return fail('Näytä pyydetty skaalaus tai algebrallinen yhtälörivi.');
  if (work.method === 'scale') {
    if (work.direction !== 'forward' && work.direction !== 'backward' || !has(work.factor, scaleFactor(task, work.direction)))
      return fail('Laske kerroin saman mittarivin kahdesta tunnetusta arvosta. Valitse käyttämäsi suunta.');
  } else if (work.method === 'algebra') {
    const coefficient = equivalenceNumber(work.coefficient), constant = equivalenceNumber(work.constant);
    if (!coefficient || !nonzero(coefficient) || !constant ||
        !same(times(coefficient, equation.constant), times(constant, equation.coefficient)))
      return fail('Tuota verrannosta pätevä yhtälö kx = c. Molempia puolia saa kertoa samalla nollasta poikkeavalla luvulla.');
  } else return fail('Valitse laskutapa.');
  const x = equivalenceNumber(answer.unknown);
  if (!x || x[0] <= 0n) return fail('Ratkaise puuttuva positiivinen mitta. Nimittäjä ei saa olla nolla.');
  const left = substituted(answer.relation[0], x), right = substituted(answer.relation[1], x);
  if (!left || !right || !same(left, right) || !has(answer.leftCheck, left) || !has(answer.rightCheck, right))
    return fail('Sijoita oma ratkaisusi kumpaankin kirjoittamaasi suhteeseen. Laske molemmat ja tarkista yhtäsuuruus.');
  return pass;
}

export function checkNumberEquivalences(task: NumberEquivalencesTask, answer: NumberEquivalencesResponse) {
  if (answer?.kind === kind) {
    if (task.mode === 'line' && answer.mode === 'line') return checkLine(task, answer);
    if (task.mode === 'place' && answer.mode === 'place') return checkPlace(task, answer);
    if (task.mode === 'multiply' && answer.mode === 'multiply') return checkMultiply(task, answer);
    if (task.mode === 'proportion' && answer.mode === 'proportion') return checkProportion(task, answer);
  }
  return fail('Täydennä tämän työpöydän merkinnät.');
}
export function solutionNumberEquivalences(task: NumberEquivalencesTask): NumberEquivalencesResponse {
  switch (task.mode) {
    case 'line': {
      const { distance, positions, opposite, side } = lineResult(task);
      return { kind, mode: 'line', location: String(task.focus ?? ''), distance: String(distance),
        positions: task.skill === 'absolute' ? positions.map(String) : [], opposite: task.skill === 'opposite' ? String(opposite) : '',
        side: task.skill === 'opposite' ? side : null, sum: '0', draftWorks: task.draft === undefined ? null : task.draft === opposite };
    }
    case 'place': {
      const rows = placeRows(task), scale = 10 ** task.precision, result = rows.at(-1)!.result;
      return { kind, mode: 'place', rows: rows.map(r => ({ operation: r.operation, left: r.left.map(String), right: r.right.map(String),
        moves: r.moves.map(String), result: placeText(r.result, task.precision, true), inverse: placeText(r.inverse, task.precision, true) })),
        estimate: { lower: String(Math.floor(result / scale)), upper: String(Math.ceil(result / scale)), locked: task.goal === 'both' } };
    }
    case 'multiply': {
      const m = multiplication(task);
      return { kind, mode: 'multiply', prediction: m.prediction, locked: true, left: String(task.left), right: String(task.right),
        product: String(m.product), divisor: String(m.unitCount), result: exact([BigInt(m.product), BigInt(m.unitCount)]), unit: task.outputUnit };
    }
    case 'proportion': {
      const e = crossEquation(task.pairs), x = divide(e.constant, e.coefficient);
      const work: ProportionWork = task.method === 'scale' ? { method: 'scale', direction: 'forward', factor: exact(scaleFactor(task, 'forward')) }
        : { method: 'algebra', coefficient: exact(e.coefficient), constant: exact(e.constant) };
      return { kind, mode: 'proportion', relation: [task.pairs[0], task.pairs[1]], work, unknown: exact(x),
        leftCheck: exact(substituted(task.pairs[0], x)!), rightCheck: exact(substituted(task.pairs[1], x)!) };
    }
  }
}
export function wrongNumberEquivalencesResponses(task: NumberEquivalencesTask): NumberEquivalencesResponse[] {
  const a = solutionNumberEquivalences(task);
  switch (a.mode) {
    case 'line': return [{ ...a, distance: '-1' }, { ...a, ...(a.positions.length ? { positions: [] } : { sum: '1' }) }];
    case 'place': return [{ ...a, rows: [] }, { ...a, rows: a.rows.map((r, i) => i ? r : { ...r, moves: [] }) }];
    case 'multiply': return [{ ...a, locked: false }, { ...a, divisor: '1' }];
    case 'proportion': return [{ ...a, unknown: '0' }, { ...a, leftCheck: '0' }];
  }
}
