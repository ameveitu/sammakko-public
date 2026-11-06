import type { Verdict } from '../../engine/types';
import type { Geometry, SolidPoint, SolidPose, SolidView } from './solid-workshop';

export type SolidCell = readonly [x: number, y: number, z: number];
export type SolidGrid = readonly [width: number, height: number, depth: number];

export interface SolidConstructionScene {
  kind: 'solid-construction';
  title: string;
  view: SolidView;
  grid: SolidGrid;
  referenceCells: readonly SolidCell[];
  previewCells: readonly SolidCell[];
  pose: SolidPose;
}

export type SolidTerm = 'sivu' | 'tahko' | 'särmä' | 'kärki' | 'pohja';
export interface NameSolidField {
  id: string;
  label: string;
  options: readonly string[];
  mark: string;
  term: SolidTerm;
}

export type SolidConstructionTask =
  | { kind: 'solid-construction'; activity: 'build'; scene: SolidConstructionScene }
  | { kind: 'solid-construction'; activity: 'name'; fields: readonly NameSolidField[] };
export type SolidConstructionResponse =
  | { kind: 'solid-construction'; activity: 'build'; cells: SolidCell[] }
  | { kind: 'solid-construction'; activity: 'name'; entries: Record<string, { mark: string; term: string }> };

export const cellKey = (cell: SolidCell) => cell.join(',');
export function validCell(cell: SolidCell, grid: SolidGrid) {
  return cell.length === 3 && cell.every((value, i) => Number.isSafeInteger(value) && value >= 0 && value < grid[i]!);
}
export function unsupportedCells(cells: readonly SolidCell[]) {
  const occupied = new Set(cells.map(cellKey));
  return cells.filter(([x, y, z]) => y > 0 && !occupied.has(cellKey([x, y - 1, z])));
}
export const solidTerms: Readonly<Record<SolidTerm, readonly string[]>> = {
  sivu: ['sivu', 'sivun', 'sivua', 'sivulla', 'reunajana', 'reunajanan'],
  tahko: ['tahko', 'tahkon', 'tahkoa', 'tahkolla', 'tasotahko', 'tasotahkon'],
  särmä: ['särmä', 'särmän', 'särmää', 'särmällä'],
  kärki: ['kärki', 'kärjen', 'kärkeä', 'kärjessä', 'kulmapiste', 'kulmapisteen'],
  pohja: ['pohja', 'pohjan', 'pohjaa', 'pohjalla', 'pohjatahko', 'pohjatahkon'],
};

const normalizedTerm = (text: string) => text.normalize('NFC').toLocaleLowerCase('fi').trim().replace(/[.!?]+$/, '');

export function recordSolidConstruction(response: SolidConstructionResponse) {
  if (response.activity === 'build') return response;
  return { kind: response.kind, activity: response.activity,
    entries: Object.fromEntries(Object.entries(response.entries).map(([id, { mark, term }]) => {
      const match = (Object.keys(solidTerms) as SolidTerm[]).find(word => solidTerms[word].includes(normalizedTerm(term)));
      return [id, { mark, termKnown: match ?? null }];
    })) };
}

const fail = (why: string): Verdict => ({ ok: false, why });
export function checkSolidConstruction(task: SolidConstructionTask, answer: SolidConstructionResponse): Verdict {
  if (task.activity === 'build' && answer.activity === 'build') {
    const cells = new Set(answer.cells.map(cellKey));
    if (cells.size !== answer.cells.length || answer.cells.some(cell => !validCell(cell, task.scene.grid))) {
      return fail('Aseta kuhunkin ruutuun enintään yksi palikka. Pysy mallin rajojen sisällä.');
    }
    if (unsupportedCells(answer.cells).length) return fail('Yksi palikka jää ilmaan. Vertaa kerroksia alhaalta ylöspäin.');
    if (cells.size !== task.scene.referenceCells.length || !task.scene.referenceCells.every(cell => cells.has(cellKey(cell)))) {
      return fail('Vertaa mallia kerros kerrallaan. Tarkista myös takarivi, joka voi peittyä etukuvassa.');
    }
    return { ok: true };
  }
  if (task.activity === 'name' && answer.activity === 'name') {
    for (const field of task.fields) {
      const entry = answer.entries[field.id];
      if (entry?.mark !== field.mark) return fail(`Seuraa korostusta kohdassa ”${field.label}” ja valitse sitä vastaava merkki.`);
      const term = normalizedTerm(entry.term);
      if (!solidTerms[field.term].includes(term)) return fail(`Kohdista sana juuri merkittyyn osaan. Mieti, kuvaako se pintaa, viivaa, pistettä vai pohjaa.`);
    }
    return { ok: true };
  }
  return fail('Täydennä tämän työpöydän merkinnät.');
}
export function solutionSolidConstruction(task: SolidConstructionTask): SolidConstructionResponse {
  if (task.activity === 'build') return { kind: task.kind, activity: 'build', cells: [...task.scene.referenceCells] };
  return { kind: task.kind, activity: 'name', entries: Object.fromEntries(task.fields.map(({ id, mark, term }) => [id, { mark, term }])) };
}
export function wrongSolidConstructionResponses(task: SolidConstructionTask): SolidConstructionResponse[] {
  const answer = solutionSolidConstruction(task);
  if (answer.activity === 'build') return [{ ...answer, cells: answer.cells.slice(1) }];
  const id = Object.keys(answer.entries)[0]!;
  return [{ ...answer, entries: { ...answer.entries, [id]: { ...answer.entries[id]!, term: 'sininen' } } }];
}

type Polyhedron = Extract<Geometry, { base: readonly unknown[]; height: number }>;
export const isPolyhedron = (geometry: Geometry): geometry is Polyhedron =>
  geometry.kind === 'prism' || geometry.kind === 'pyramid';
export const centerOf = (positions: readonly SolidPoint[]): SolidPoint => [
  positions.reduce((sum, p) => sum + p[0], 0) / positions.length,
  positions.reduce((sum, p) => sum + p[1], 0) / positions.length,
  positions.reduce((sum, p) => sum + p[2], 0) / positions.length,
];

export function polyhedronStructure(shape: Polyhedron) {
  const { base, height } = shape, n = base.length;
  const bottom = base.map(([x, z]): SolidPoint => [x, -height / 2, z]);
  const vertices: SolidPoint[] = [...bottom, ...(shape.kind === 'prism' ? base.map(([x, z]): SolidPoint => [x, height / 2, z]) : [[0, height / 2, 0] as const])];
  const ring = base.map((_, index) => index);
  const bases = shape.kind === 'prism' ? [ring, ring.map(i => n + i)] : [ring];
  const faces = [...bases, ...ring.map(i => {
    const j = (i + 1) % n;
    return shape.kind === 'prism' ? [i, j, n + j, n + i] : [i, j, n];
  })];
  const edges = new Map<string, readonly [number, number]>();
  for (const face of faces) {
    face.forEach((i, index) => {
      const j = face[(index + 1) % face.length]!;
      edges.set(`${Math.min(i, j)}:${Math.max(i, j)}`, [i, j]);
    });
  }
  return { vertices, faces, edges: [...edges.values()], bases: bases.length };
}
