import { rng } from '../../engine/rng';
import type { Phase, Verdict } from '../../engine/types';

/**
 * Juhlapöydän kakut: a picture-led introduction to adding unlike fractions.
 * Two equal cakes are cut into different numbers of pieces and one piece is eaten from each.
 * The learner cuts the remaining pieces to one common size, moves them onto plates and counts.
 * No fraction vocabulary or notation input is needed; the notation is shown afterwards.
 */
export type CakeFamily = 'count-pieces' | 'whole-and-rest';
export type CakeSource = { kept: number; parts: number };

export interface CakeTask {
  kind: 'cake';
  family: CakeFamily;
  shape: 'cake' | 'strip';
  left: CakeSource;
  right: CakeSource;
  /** Counts the learner chooses from, in ascending order. */
  options: readonly number[];
}

export interface CakeResponse {
  kind: 'cake';
  count: number;
}

export interface CakePiece {
  id: string;
  parentId: string;
  /** Exact interval [from, to] on a lattice of denominator equal divisions of one whole. */
  from: number;
  to: number;
}

export interface CakePartition {
  source: 'left' | 'right';
  denominator: number;
  originalSeams: number[];
  newSeams: number[];
  pieces: CakePiece[];
}

/** Piece counts per cake. One piece is eaten from each, so the total is always more than one whole. */
const PAIRS: readonly (readonly [number, number])[] = [
  [2, 3], [3, 2], [2, 4], [4, 2], [3, 6], [6, 3], [2, 6], [6, 2],
];
const STRIP_PAIRS: readonly (readonly [number, number])[] = [[2, 3], [3, 2], [2, 4], [3, 6], [2, 6]];

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

export function makeCakeTask(seed: number, phase: Phase, family?: CakeFamily): CakeTask {
  const r = rng(seed);
  const selected = family ?? (phase === 'guided' ? 'count-pieces' : r.pick(['count-pieces', 'whole-and-rest'] as const));
  const [a, b] = phase === 'guided' ? PAIRS[0]! : r.pick(phase === 'transfer' ? STRIP_PAIRS : PAIRS);
  const task: CakeTask = {
    kind: 'cake',
    family: selected,
    shape: phase === 'transfer' ? 'strip' : 'cake',
    left: { kept: a - 1, parts: a },
    right: { kept: b - 1, parts: b },
    options: [],
  };
  task.options = cakeOptions(task);
  return task;
}

/** How many new pieces each original piece is cut into, so that all pieces are equal. */
export function cakeFactors(task: CakeTask): [number, number] {
  const d = commonParts(task);
  return [d / task.left.parts, d / task.right.parts];
}

function commonParts(task: CakeTask): number {
  return task.left.parts / gcd(task.left.parts, task.right.parts) * task.right.parts;
}

/** Total number of equal pieces on the plates. */
export function cakePieceCount(task: CakeTask): number {
  const [fl, fr] = cakeFactors(task);
  return task.left.kept * fl + task.right.kept * fr;
}

function expected(task: CakeTask): number {
  const n = cakePieceCount(task);
  return task.family === 'count-pieces' ? n : n - commonParts(task);
}

function cakeOptions(task: CakeTask): number[] {
  const answer = expected(task);
  const n = cakePieceCount(task), d = commonParts(task);
  const tempting = task.family === 'count-pieces'
    ? [task.left.kept + task.right.kept, d, n + 1, n - 1, n + 2]
    : [n, answer + 1, answer - 1, d, answer + 2];
  const options = [answer];
  for (const value of tempting) if (value >= 0 && !options.includes(value) && options.length < 4) options.push(value);
  return options.sort((x, y) => x - y);
}

function validFactor(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0 && value <= 12;
}

function partition(source: CakePartition['source'], amount: CakeSource, factor: number): CakePartition {
  const denominator = amount.parts * factor;
  const originalSeams = Array.from({ length: amount.parts + 1 }, (_, i) => i * factor);
  const newSeams = Array.from({ length: denominator - 1 }, (_, i) => i + 1).filter((i) => i % factor !== 0);
  const pieces = Array.from({ length: amount.kept * factor }, (_, from) => {
    const parentId = `${source}-${Math.floor(from / factor)}`;
    return { id: `${parentId}-${from % factor}`, parentId, from, to: from + 1 };
  });
  return { source, denominator, originalSeams, newSeams, pieces };
}

/** Both layouts use one source whole as unit. Physical piece identities exist only in the kept portions. */
export function cakePartition(task: CakeTask, leftFactor: number, rightFactor: number): [CakePartition, CakePartition] {
  if (!validFactor(leftFactor) || !validFactor(rightFactor)) throw new RangeError('Invalid cake subdivision');
  return [partition('left', task.left, leftFactor), partition('right', task.right, rightFactor)];
}

const NAMES: Record<number, readonly [string, string, string]> = {
  // singular, plural partitive (osia), singular partitive after a number (osaa)
  2: ['puolikas', 'puolikkaita', 'puolikasta'],
  3: ['kolmasosa', 'kolmasosia', 'kolmasosaa'],
  4: ['neljäsosa', 'neljäsosia', 'neljäsosaa'],
  6: ['kuudesosa', 'kuudesosia', 'kuudesosaa'],
};
const INTO: Record<number, string> = { 2: 'kahteen', 3: 'kolmeen', 4: 'neljään', 6: 'kuuteen' };

export function pieceName(parts: number): readonly [string, string, string] {
  return NAMES[parts] ?? [`${parts}. osa`, `${parts}. osia`, `${parts}. osaa`];
}

/** "1 kuudesosa", "7 kuudesosaa". */
export function countOf(count: number, parts: number): string {
  const [one, , many] = pieceName(parts);
  return `${count} ${count === 1 ? one : many}`;
}

export function cakeWords(task: CakeTask) {
  return task.shape === 'cake'
    ? { thing: 'kakku', things: 'kakkua', plate: 'lautanen', plateGen: 'lautasen', onto: 'lautaselle', on: 'lautasella' }
    : { thing: 'piirakka', things: 'piirakkaa', plate: 'pelti', plateGen: 'pellin', onto: 'pellille', on: 'pellillä' };
}

export function cakeQuestion(task: CakeTask): string {
  const d = commonParts(task), w = cakeWords(task);
  return task.family === 'count-pieces'
    ? `Kuinka monta ${pieceName(d)[2]} on yhteensä?`
    : `Täysi ${w.plate} on yksi kokonainen ${w.thing}. Kuinka monta ${pieceName(d)[2]} on sen lisäksi?`;
}

export function checkCake(task: CakeTask, response: CakeResponse): Verdict {
  const { count } = response;
  if (!Number.isSafeInteger(count) || count < 0) return { ok: false, why: 'Valitse yksi luvuista.' };
  if (count === expected(task)) return { ok: true };
  const n = cakePieceCount(task), d = commonParts(task), w = cakeWords(task);
  if (task.family === 'count-pieces') {
    if (count === task.left.kept + task.right.kept) return { ok: false, why: 'Laskit palat ennen leikkaamista. Leikatut palat ovat pienempiä, ja niitä on enemmän.' };
    if (count === d) return { ok: false, why: `Se on yhden täyden ${w.plateGen} verran. Laske myös toisella lautasella olevat palat.` };
  } else if (count === n) {
    return { ok: false, why: `Laskit kaikki palat. Kysymys koskee vain niitä, jotka jäivät täyden ${w.plateGen} lisäksi.` };
  }
  return { ok: false, why: 'Laske palat uudelleen. Kun napautat palaa, se saa numeron.' };
}

export function solutionCake(task: CakeTask): CakeResponse {
  return { kind: 'cake', count: expected(task) };
}

export function wrongCakeResponses(task: CakeTask): CakeResponse[] {
  const answer = expected(task);
  return task.options.filter((value) => value !== answer).map((count) => ({ kind: 'cake', count }));
}

/** The situation in everyday words. */
export function cakeStory(task: CakeTask): string {
  const w = cakeWords(task);
  const first = `Kaksi yhtä suurta ${w.things}. Ensimmäinen on leikattu ${INTO[task.left.parts]} ja toinen ${INTO[task.right.parts]} yhtä suureen palaan.`;
  return `${first} Kummastakin on syöty yksi pala.`;
}

export function cakePrompt(task: CakeTask): string {
  return `${cakeStory(task)} Kuinka paljon ${task.shape === 'cake' ? 'kakkua' : 'piirakkaa'} on jäljellä yhteensä?`;
}

export function cakeHint(task: CakeTask): string {
  return `Leikkaa ensin kaikki palat yhtä suuriksi ja siirrä ne sitten ${cakeWords(task).onto}. Kun napautat palaa, se saa numeron, ja laskeminen on helpompaa.`;
}

/** How the cut turns each kept portion into common pieces, in words. */
export function cakeCutSentence(task: CakeTask): string {
  const [fl, fr] = cakeFactors(task);
  const d = commonParts(task);
  const part = (side: CakeSource, factor: number) => factor === 1
    ? `${pieceName(side.parts)[1][0]!.toUpperCase()}${pieceName(side.parts)[1].slice(1)} ei tarvitse leikata: ne ovat jo oikean kokoisia.`
    : `Jokainen ${pieceName(side.parts)[0]} leikataan ${INTO[factor] ?? `${factor}`} osaan.`;
  return `${part(task.left, fl)} ${part(task.right, fr)} Nyt kaikki palat ovat yhtä suuria: ${pieceName(d)[1]}.`;
}

export function cakeExplanation(task: CakeTask): string {
  const [fl, fr] = cakeFactors(task);
  const d = commonParts(task), n = cakePieceCount(task), w = cakeWords(task);
  const same = (side: CakeSource, f: number) => f === 1 ? '' : `${countOf(side.kept, side.parts)} on yhtä paljon kuin ${countOf(side.kept * f, d)}. `;
  return `${same(task.left, fl)}${same(task.right, fr)}Yhteensä ${countOf(n, d)}. ${d} niistä täyttää yhden ${w.plateGen}, eli yhden kokonaisen ${task.shape === 'cake' ? 'kakun' : 'piirakan'}, ja ${countOf(n - d, d)} jää yli.`;
}

/** The written form shown after the picture: 1/2 + 2/3 = 3/6 + 4/6 = 7/6 = 1 1/6. */
export function cakeNotation(task: CakeTask): string {
  const [fl, fr] = cakeFactors(task);
  const d = commonParts(task), n = cakePieceCount(task);
  return `${task.left.kept}/${task.left.parts} + ${task.right.kept}/${task.right.parts} = ${task.left.kept * fl}/${d} + ${task.right.kept * fr}/${d} = ${n}/${d} = 1 ${n - d}/${d}`;
}
