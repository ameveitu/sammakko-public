import type { Verdict } from '../../engine/types';

export interface LinearSide { a: number; b: number }
export type Comparison = '<' | '≤' | '>' | '≥';
export type Direction = 'lower' | 'higher';
export type Domain = 'real' | 'nonnegative';
export type QuadraticSide = readonly [a: number, b: number, c: number];
export interface QuadraticCandidate { left: QuadraticSide; right: QuadraticSide }

export interface SubstitutionTask {
  kind: 'equation-workshop';
  activity: 'substitute';
  left: LinearSide;
  right: LinearSide;
  candidate: number;
}
export interface InequalityTask {
  kind: 'equation-workshop';
  activity: 'inequality-interpret' | 'inequality-solve';
  left: LinearSide;
  relation: Comparison;
  right: number;
  variable: 'x' | 'm' | 'p';
  domain: Domain;
  samples: readonly number[];
  label: string;
}
export interface SquareRootsTask {
  kind: 'equation-workshop';
  activity: 'square-roots';
  radicand: number;
  context: 'gate' | 'abstract';
}
export type EquationWorkshopTask = SubstitutionTask | InequalityTask | SquareRootsTask;

export type EquationWorkshopResponse =
  | { kind: 'equation-workshop'; activity: 'substitute'; left: number; right: number; equal: boolean }
  | { kind: 'equation-workshop'; activity: 'inequality-interpret'; boundary: number; direction: Direction; inclusive: boolean; members: boolean[] }
  | { kind: 'equation-workshop'; activity: 'inequality-solve'; boundary: number; direction: Direction; inclusive: boolean; divisor: number }
  | { kind: 'equation-workshop'; activity: 'square-roots'; roots: string[]; principal: string | null };

export const signedText = (n: number) => String(n).replace('-', '−');
export const evaluateSide = ({ a, b }: LinearSide, x: number) => a * x + b;
export function linearText({ a, b }: LinearSide, variable = 'x') {
  if (a === 0) return signedText(b);
  const lead = a === 1 ? variable : a === -1 ? '−' + variable : signedText(a) + variable;
  return lead + (b < 0 ? ' − ' + Math.abs(b) : b > 0 ? ' + ' + b : '');
}
const lower = (relation: Comparison) => relation === '<' || relation === '≤';
const inclusive = (relation: Comparison) => relation === '≤' || relation === '≥';

export function inequalitySet(task: InequalityTask) {
  return {
    boundary: (task.right - task.left.b) / task.left.a,
    direction: (lower(task.relation) === (task.left.a > 0) ? 'lower' : 'higher') as Direction,
    inclusive: inclusive(task.relation),
  };
}
export function inequalityMember(task: InequalityTask, x: number): boolean {
  if (task.domain === 'nonnegative' && x < 0) return false;
  const left = evaluateSide(task.left, x);
  if (left === task.right) return inclusive(task.relation);
  return lower(task.relation) ? left < task.right : left > task.right;
}
export function setText(boundary: number, direction: Direction, closed: boolean, variable = 'x', domain: Domain = 'real') {
  if (domain === 'nonnegative' && direction === 'lower') return `0 ≤ ${variable} ${closed ? '≤' : '<'} ${signedText(boundary)}`;
  return `${variable} ${direction === 'lower' ? closed ? '≤' : '<' : closed ? '≥' : '>'} ${signedText(boundary)}`;
}

export function zeroForm({ left, right }: QuadraticCandidate): QuadraticSide {
  return [left[0] - right[0], left[1] - right[1], left[2] - right[2]];
}
export function isIncompleteQuadratic(candidate: QuadraticCandidate) {
  const [a, b, c] = zeroForm(candidate);
  return a !== 0 && (b === 0 || c === 0);
}
export function quadraticText(coefficients: QuadraticSide, order: readonly (0 | 1 | 2)[] = [0, 1, 2]) {
  const symbols = ['x²', 'x', ''];
  let result = '';
  for (const i of order) {
    const coefficient = coefficients[i];
    if (coefficient === 0) continue;
    const magnitude = Math.abs(coefficient);
    const amount = i === 2 || magnitude !== 1 ? String(magnitude) : '';
    const sign = result ? coefficient < 0 ? ' − ' : ' + ' : coefficient < 0 ? '−' : '';
    result += sign + amount + symbols[i];
  }
  return result || '0';
}

interface ExactRoot { sign: -1 | 0 | 1; square: bigint; divisor: bigint }
function parseRoot(value: string): ExactRoot | undefined {
  if (typeof value !== 'string' || value.length > 32) return;
  const source = value.trim().toLowerCase().replace(/[−–]/g, '-').replace(/\s+/g, '').replace(',', '.');
  const radical = /^([+-]?)(\d*)(?:√\(?([0-9]+)\)?|sqrt\(([0-9]+)\))$/.exec(source);
  if (radical) {
    const [, sign, coefficient, a, b] = radical;
    // Match both opening and closing parentheses when they are present.
    if (source.includes('(') !== source.includes(')')) return;
    const square = BigInt(coefficient || 1) ** 2n * BigInt(a ?? b!);
    return { sign: square === 0n ? 0 : sign === '-' ? -1 : 1, square, divisor: 1n };
  }
  const decimal = /^([+-]?)(\d+)(?:\.(\d+))?$/.exec(source);
  if (!decimal) return;
  const [, sign, before, after = ''] = decimal;
  const square = BigInt(before! + after) ** 2n;
  return { sign: square === 0n ? 0 : sign === '-' ? -1 : 1, square, divisor: 10n ** BigInt(2 * after.length) };
}

function correctRoot(value: string, radicand: number, sign: ExactRoot['sign']): boolean {
  const parsed = parseRoot(value);
  return !!parsed && parsed.sign === sign && parsed.square === BigInt(radicand) * parsed.divisor;
}
const wrong = (why: string): Verdict => ({ ok: false, why });

export function checkEquationWorkshop(task: EquationWorkshopTask, response: EquationWorkshopResponse): Verdict {
  if (task.activity !== response.activity) return { ok: false };
  switch (response.activity) {
    case 'substitute': {
      if (task.activity !== 'substitute') return { ok: false };
      const left = evaluateSide(task.left, task.candidate), right = evaluateSide(task.right, task.candidate);
      if (response.left !== left || response.right !== right) {
        return wrong('Sijoita sama ehdokas alkuperäisen yhtälön kumpaankin puoleen. Laske vasen ja oikea puoli erikseen.');
      }
      return response.equal === (left === right) ? { ok: true }
        : wrong('Arvot ratkaisevat: yhtälö toteutuu vain silloin, kun molemmat puolet ovat yhtä suuret.');
    }
    case 'inequality-interpret':
    case 'inequality-solve': {
      if (task.activity !== 'inequality-interpret' && task.activity !== 'inequality-solve') return { ok: false };
      const expected = inequalitySet(task);
      if (response.activity === 'inequality-solve' && response.divisor !== task.left.a) {
        return wrong('Siirrä ensin vakiotermi. Jaa molemmat puolet muuttujan etumerkillisellä kertoimella.');
      }
      if (response.boundary !== expected.boundary) return wrong('Etsi rajakohta: siinä vasen ja oikea puoli ovat yhtä suuret.');
      if (response.direction !== expected.direction) {
        return wrong(task.left.a < 0 ? 'Negatiivisella luvulla jakaminen kääntää epäyhtälömerkin suunnan.'
          : 'Kokeile yhtä lukua rajan kummaltakin puolelta. Koko kelpaava puoli kuuluu ratkaisuun.');
      }
      if (response.inclusive !== expected.inclusive) {
        return wrong(expected.inclusive ? 'Raja-arvossa puolet ovat samat. Tässä merkissä myös yhtäsuuruus sallitaan.'
          : 'Raja-arvossa puolet ovat samat. Tiukka epäyhtälö jättää rajakohdan pois.');
      }
      if (response.activity === 'inequality-interpret' && (response.members.length !== task.samples.length ||
        !task.samples.every((x, i) => response.members[i] === inequalityMember(task, x)))) {
        return wrong(task.domain === 'nonnegative'
          ? 'Tarkista koearvot myös lähtöjoukosta. Negatiivinen määrä ei kuulu tähän kuorma- tai pituusmalliin.'
          : 'Tarkista jokainen koearvo. Ratkaisu voi sisältää monta lukua, ja rajapisteellä on oma ehtonsa.');
      }
      return { ok: true };
    }
    case 'square-roots': {
      if (task.activity !== 'square-roots') return { ok: false };
      const { radicand } = task;
      const signs: ExactRoot['sign'][] = radicand < 0 ? [] : radicand === 0 ? [0] : [-1, 1];
      if (response.roots.length !== signs.length || !signs.every(sign =>
        response.roots.some(root => correctRoot(root, radicand, sign)))) {
        return wrong(radicand < 0 ? 'Reaaliluvun neliö on aina vähintään nolla. Tähän ehtoon ei ole reaaliratkaisua.'
          : radicand === 0 ? 'Vain nollan neliö on nolla. Nolla on yksi ratkaisu.'
          : 'Etsi kaksi eri reaalilukua: positiivinen juuri ja sen vastaluku. Kummankin neliön pitää olla annettu luku.');
      }
      const principalOk = radicand < 0 ? response.principal === null
        : response.principal !== null && correctRoot(response.principal, radicand, radicand === 0 ? 0 : 1);
      return principalOk ? { ok: true }
        : wrong('Neliöjuurimerkki √ tarkoittaa yhtä epänegatiivista pääarvoa, kun sellainen on olemassa.');
    }
  }
}

export function solutionEquationWorkshop(task: EquationWorkshopTask): EquationWorkshopResponse {
  if (task.activity === 'substitute') {
    const left = evaluateSide(task.left, task.candidate), right = evaluateSide(task.right, task.candidate);
    return { kind: task.kind, activity: task.activity, left, right, equal: left === right };
  }
  if (task.activity === 'inequality-interpret') {
    return { kind: task.kind, activity: task.activity, ...inequalitySet(task), members: task.samples.map(x => inequalityMember(task, x)) };
  }
  if (task.activity === 'inequality-solve') {
    return { kind: task.kind, activity: task.activity, ...inequalitySet(task), divisor: task.left.a };
  }
  if (task.activity !== 'square-roots') throw new Error('Unknown equation exercise');
  const { radicand } = task;
  const principal = radicand < 0 ? null : radicand === 0 ? '0' : `√${radicand}`;
  return { kind: task.kind, activity: task.activity,
    roots: principal === null ? [] : radicand === 0 ? ['0'] : ['−' + principal, principal], principal };
}

export function wrongEquationWorkshopResponses(task: EquationWorkshopTask): EquationWorkshopResponse[] {
  const right = solutionEquationWorkshop(task);
  if (right.activity === 'substitute') return [{ ...right, left: right.left + 1 }, { ...right, equal: !right.equal }];
  if (right.activity === 'square-roots') return [
    { ...right, roots: right.roots.length ? right.roots.slice(1) : ['0'] },
    { ...right, principal: right.principal === null ? '0' : null },
  ];
  return [{ ...right, boundary: right.boundary + 1 }, { ...right, inclusive: !right.inclusive },
    { ...right, direction: right.direction === 'lower' ? 'higher' : 'lower' }];
}
