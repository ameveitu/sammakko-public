import type { Verdict } from '../../engine/types';
import type { Point } from './sail-shapes';

export type SolidPoint = readonly [x: number, y: number, z: number];
export type SolidView = 'angled' | 'ends' | 'side';
export type SolidPose = 'upright' | 'tilted' | 'horizontal';
export type Geometry =
  | { kind: 'disk' | 'sphere'; radius: number }
  | { kind: 'flat-polygon'; base: readonly Point[] }
  | { kind: 'prism' | 'pyramid'; base: readonly Point[]; height: number }
  | { kind: 'cylinder' | 'cone'; radius: number; height: number };

export interface SolidMark { id: string; position: SolidPoint; highlight?: boolean }
export interface SolidFigure { id: string; geometry: Geometry; pose: SolidPose; marks?: readonly SolidMark[] }
export interface SolidWorkshopScene { kind: 'solid-workshop'; title: string; figures: readonly SolidFigure[]; view: SolidView }
export interface SolidWorkshopQuestion {
  id: string;
  label: string;
  options: readonly { id: string; label: string }[];
  answer: readonly string[];
  why: string;
  many?: boolean;
}
export interface SolidWorkshopTask {
  kind: 'solid-workshop';
  scene: SolidWorkshopScene;
  questions: readonly SolidWorkshopQuestion[];
  definitions?: string;
}
export interface SolidWorkshopResponse { kind: 'solid-workshop'; sets: Record<string, string[]> }

export const flat = (geometry: Geometry) => geometry.kind === 'disk' || geometry.kind === 'flat-polygon';

export function baseCount(geometry: Geometry) {
  switch (geometry.kind) {
    case 'prism': case 'cylinder': return 2;
    case 'pyramid': case 'cone': return 1;
    default: return 0;
  }
}

export function solidClass(geometry: Geometry) {
  if (flat(geometry)) return 'figure';
  if (geometry.kind === 'prism' || geometry.kind === 'cylinder') return 'column';
  if (geometry.kind === 'pyramid' || geometry.kind === 'cone') return 'pointed';
  return 'other';
}

export function solidMemberships(geometry: Geometry): string[] {
  const family = solidClass(geometry);
  if (family === 'figure') return ['figure'];
  const classes: string[] = ['solid', family];
  if (geometry.kind === 'prism') {
    classes.push('prism');
    const p = geometry.base;
    const edges = p.map((a, i) => [p[(i + 1) % p.length]![0] - a[0], p[(i + 1) % p.length]![1] - a[1]] as const);
    const right = edges.every(([x, z], i) => x * edges[(i + 1) % edges.length]![0] + z * edges[(i + 1) % edges.length]![1] === 0);
    if (edges.length === 4 && right) {
      classes.push('box');
      if (edges.every(([x, z]) => x * x + z * z === geometry.height ** 2)) classes.push('cube');
    }
  } else if (geometry.kind === 'pyramid' || geometry.kind === 'cylinder' || geometry.kind === 'cone' || geometry.kind === 'sphere') {
    classes.push(geometry.kind);
  }
  return classes;
}

export function rectangleBase(width: number, depth: number): Point[] {
  return [[-width / 2, -depth / 2], [width / 2, -depth / 2], [width / 2, depth / 2], [-width / 2, depth / 2]];
}
export const triangleBase = (): Point[] => [[-3, -2], [3, -2], [-1, 3]];
export const polygonBase = (): Point[] => [[-3, -1], [-1, -3], [2, -3], [3, 1], [0, 3]];
export const cylinder = (radius: number, height: number): Geometry => ({ kind: 'cylinder', radius, height });
export const cone = (radius: number, height: number): Geometry => ({ kind: 'cone', radius, height });
export const prism = (base: readonly Point[], height: number): Geometry => ({ kind: 'prism', base, height });
export const pyramid = (base: readonly Point[], height: number): Geometry => ({ kind: 'pyramid', base, height });

export type SolidPart = 'base-near' | 'base-far' | 'mantle' | 'apex';

export function partAt(geometry: Geometry, position: SolidPoint): SolidPart | undefined {
  if (geometry.kind !== 'cone' && geometry.kind !== 'cylinder') return;
  const [x, y, z] = position;
  const half = geometry.height / 2, radial2 = x * x + z * z;
  if (y === -half && radial2 < geometry.radius ** 2) return 'base-near';
  if (y === half) {
    if (geometry.kind === 'cylinder' && radial2 < geometry.radius ** 2) return 'base-far';
    if (geometry.kind === 'cone' && radial2 === 0) return 'apex';
  }
  if (Math.abs(y) >= half) return;
  const radiusHere = geometry.kind === 'cylinder' ? geometry.radius : geometry.radius * (half - y) / geometry.height;
  return radial2 === radiusHere ** 2 ? 'mantle' : undefined;
}

export function circularMarks(geometry: Geometry, ids: readonly string[]): SolidMark[] {
  if (geometry.kind !== 'cone' && geometry.kind !== 'cylinder') return [];
  const half = geometry.height / 2;
  const locations: SolidPoint[] = [[0, -half, 0], [0, half, 0], [geometry.kind === 'cone' ? geometry.radius / 2 : geometry.radius, 0, 0]];
  return locations.map((position, i) => ({ id: ids[i]!, position }));
}

const sameSet = (expected: readonly string[], marked: readonly string[]) =>
  marked.length === expected.length && new Set(marked).size === marked.length && expected.every(id => marked.includes(id));

export function checkSolidWorkshop(task: SolidWorkshopTask, response: SolidWorkshopResponse): Verdict {
  const missing = task.questions.find(q => !sameSet(q.answer, response.sets[q.id] ?? []));
  return missing ? { ok: false, why: missing.why } : { ok: true };
}
export const solutionSolidWorkshop = (task: SolidWorkshopTask): SolidWorkshopResponse => ({
  kind: task.kind, sets: Object.fromEntries(task.questions.map(q => [q.id, [...q.answer]])),
});
export function wrongSolidWorkshopResponses(task: SolidWorkshopTask): SolidWorkshopResponse[] {
  const solution = solutionSolidWorkshop(task);
  return task.questions.map(q => ({ ...solution, sets: { ...solution.sets, [q.id]:
    q.answer.length ? [] : [q.options[0]!.id] } }));
}

/** World and 2D drawing share the same physical outline; neither evaluates answers. */
export function sizeOf(geometry: Geometry) {
  if ('base' in geometry) {
    return { width: 2 * Math.max(...geometry.base.map(p => Math.abs(p[0]))),
      depth: 2 * Math.max(...geometry.base.map(p => Math.abs(p[1]))), height: 'height' in geometry ? geometry.height : 0 };
  }
  const diameter = 2 * geometry.radius;
  return { width: diameter, depth: diameter, height: 'height' in geometry ? geometry.height : geometry.kind === 'sphere' ? diameter : 0 };
}
