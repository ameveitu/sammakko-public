import type { Verdict } from '../../engine/types';

export type Point = readonly [x: number, y: number];
export type PathShape = { kind: 'path'; points: readonly Point[]; closed: boolean; straight: boolean };
export interface EquilateralShape { kind: 'equilateral'; side: number; a: number; b: number }
export type TriangleShape = PathShape | EquilateralShape;
export type Shape = TriangleShape
  | { kind: 'circle'; radius: number; frame?: boolean }
  | { kind: 'ellipse'; rx: number; ry: number }
  | { kind: 'sphere'; radius: number };
export const path = (points: readonly Point[], closed = true, straight = true): PathShape => ({ kind: 'path', points, closed, straight });
export const distance2 = (a: Point, b: Point) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
const vector = (a: Point, b: Point): Point => [b[0] - a[0], b[1] - a[1]];
const cross = (a: Point, b: Point) => a[0] * b[1] - a[1] * b[0];
const dot = (a: Point, b: Point) => a[0] * b[0] + a[1] * b[1];
const turn = (a: Point, b: Point, c: Point) => cross(vector(a, b), vector(a, c));
const onSegment = (a: Point, b: Point, p: Point) => turn(a, b, p) === 0 && dot(vector(p, a), vector(p, b)) <= 0;
const pointKey = (p: Point) => p.join(',');
const spans = (points: readonly Point[]) => points.map((p, i) => [p, points[(i + 1) % points.length]!] as const);

function intersect(a: Point, b: Point, c: Point, d: Point) {
  return onSegment(a, b, c) || onSegment(a, b, d) || onSegment(c, d, a) || onSegment(c, d, b) ||
    (Math.sign(turn(a, b, c)) * Math.sign(turn(a, b, d)) < 0 &&
     Math.sign(turn(c, d, a)) * Math.sign(turn(c, d, b)) < 0);
}

export function isPolygon(shape: Shape): boolean {
  if (shape.kind === 'equilateral') return Number.isSafeInteger(shape.side) && shape.side > 0 && (shape.a !== 0 || shape.b !== 0);
  if (shape.kind !== 'path' || !shape.closed || !shape.straight) return false;
  const { points } = shape;
  if (points.length < 3 || new Set(points.map(pointKey)).size !== points.length) return false;
  const edges = spans(points);
  if (edges.reduce((sum, [a, b]) => sum + cross(a, b), 0) === 0) return false;
  for (let i = 0; i < points.length; i++) {
    const a = points[(i + points.length - 1) % points.length]!, b = points[i]!, c = points[(i + 1) % points.length]!;
    if (turn(a, b, c) === 0 && !onSegment(a, c, b)) return false;
    for (let j = i + 2; j < edges.length; j++) {
      if (i === 0 && j === edges.length - 1) continue;
      if (intersect(...edges[i]!, ...edges[j]!)) return false;
    }
  }
  return true;
}

export function corners(shape: PathShape): Point[] {
  return shape.points.filter((b, i, p) => turn(p[(i + p.length - 1) % p.length]!, b, p[(i + 1) % p.length]!) !== 0);
}
export function isConcave(shape: TriangleShape) {
  if (shape.kind === 'equilateral') return false;
  if (!isPolygon(shape)) return false;
  const points = corners(shape);
  return new Set(points.map((_, i) => Math.sign(turn(points[i]!, points[(i + 1) % points.length]!, points[(i + 2) % points.length]!)))).size > 1;
}
type InteriorAngle = 'right' | 'obtuse' | 'acute' | 'reflex';
export function polygonProperties(shape: TriangleShape) {
  if (shape.kind === 'equilateral') {
    const length2 = shape.side ** 2 * (shape.a ** 2 + shape.b ** 2);
    return { count: 3, lengths: [length2, length2, length2], angles: ['acute', 'acute', 'acute'] as InteriorAngle[],
      parallelPairs: 0, allEqual: true, equalPair: true };
  }
  const points = corners(shape), edges = spans(points);
  const lengths = edges.map(([a, b]) => distance2(a, b));
  const orientation = Math.sign(edges.reduce((sum, [a, b]) => sum + cross(a, b), 0));
  const angles = points.map((b, i): InteriorAngle => {
    const previous = points[(i + points.length - 1) % points.length]!, next = points[(i + 1) % points.length]!;
    if (Math.sign(turn(previous, b, next)) !== orientation) return 'reflex';
    const product = dot(vector(b, previous), vector(b, next));
    return product < 0 ? 'obtuse' : product > 0 ? 'acute' : 'right';
  });
  const parallelPairs = points.length === 4 ? [0, 1].filter(i => cross(vector(...edges[i]!), vector(...edges[i + 2]!)) === 0).length : 0;
  return { count: points.length, lengths, angles, parallelPairs, allEqual: new Set(lengths).size === 1, equalPair: new Set(lengths).size < lengths.length };
}
export function triangleTypes(shape: TriangleShape) {
  const prop = polygonProperties(shape);
  if (!isPolygon(shape) || prop.count !== 3) throw new Error('Expected a triangle');
  return {
    sides: prop.allEqual ? ['isosceles', 'equilateral'] : prop.equalPair ? ['isosceles'] : ['scalene'],
    angles: prop.angles.includes('right') ? 'right' : prop.angles.includes('obtuse') ? 'obtuse' : 'acute',
  } as const;
}
export function quadrilateralTypes(shape: PathShape): string[] {
  const prop = polygonProperties(shape);
  if (!isPolygon(shape) || prop.count !== 4) return [];
  const rectangle = prop.angles.every(angle => angle === 'right');
  return ['quadrilateral', ...(prop.parallelPairs >= 1 ? ['trapezoid'] : []),
    ...(prop.parallelPairs === 2 ? ['parallelogram'] : []), ...(rectangle ? ['rectangle'] : []),
    ...(rectangle && prop.allEqual ? ['square'] : [])];
}
export function transform(shape: PathShape, a: number, b: number, dx = 0, dy = 0): PathShape {
  return { ...shape, points: shape.points.map(([x, y]) => [a * x - b * y + dx, b * x + a * y + dy]) };
}
export const equilateral = (side: number, a = 1, b = 0): EquilateralShape => ({ kind: 'equilateral', side, a, b });
export const square = () => path([[0, 0], [3, 0], [3, 3], [0, 3]]);
export const rectangle = () => path([[0, 0], [5, 0], [5, 2], [0, 2]]);
export const trapezoid = () => path([[0, 0], [6, 0], [4, 3], [1, 3]]);
export const parallelogram = () => path([[0, 0], [4, 0], [6, 3], [2, 3]]);
export const oddQuad = () => path([[0, 0], [5, 1], [4, 4], [1, 3]]);
export const concave = () => path([[0, 0], [5, 0], [3, 2], [5, 4], [0, 4]]);
export const acuteTriangle = () => path([[0, 0], [6, 0], [2, 4]]);
export const rightTriangle = () => path([[0, 0], [5, 0], [0, 2]]);
export const obtuseTriangle = () => path([[0, 0], [6, 0], [1, 1]]);
export const isoscelesTriangle = () => path([[0, 0], [4, 0], [2, 3]]);

export interface ShapeFigure { id: string; shape: Shape }
export interface ShapeChoice { id: string; label: string }
export interface ShapeQuestion { id: string; label: string; options: readonly ShapeChoice[]; answer: readonly string[]; many?: boolean; why: string }
export interface ShapeFeature { id: string; kind: 'vertex' | 'side' | 'angle'; index: number }
export interface BuildShapeTask { kind: 'sail-shapes'; activity: 'build'; reference: PathShape; scale: 1 | 2; grid: number }
export interface NameShapeTask {
  kind: 'sail-shapes'; activity: 'name'; shape: PathShape; features: readonly ShapeFeature[];
  target: string; name: 'sivu' | 'kärki' | 'suora kulma' | 'terävä kulma' | 'tylppä kulma';
}
export interface CircleShapeTask {
  kind: 'sail-shapes'; activity: 'circle'; figures: readonly ShapeFigure[];
  points: readonly { id: string; at: Point }[]; segments: readonly { id: string; a: string; b: string }[];
}
export interface InspectShapeTask {
  kind: 'sail-shapes'; activity: 'inspect'; figures: readonly ShapeFigure[];
  questions: readonly ShapeQuestion[]; note?: string; markVertices?: boolean;
}
export type SailShapeTask = BuildShapeTask | NameShapeTask | CircleShapeTask | InspectShapeTask;
export type SailShapeResponse =
  | { kind: 'sail-shapes'; activity: 'build'; vertices: Point[]; closed: boolean }
  | { kind: 'sail-shapes'; activity: 'name'; feature: string; text: string }
  | { kind: 'sail-shapes'; activity: 'circle'; figure: string; center: string; radii: string[]; diameter: string }
  | { kind: 'sail-shapes'; activity: 'inspect'; sets: Record<string, string[]> };

const names: Record<NameShapeTask['name'], readonly string[]> = {
  sivu: ['sivu', 'sivun', 'sivua', 'sivulla', 'jana', 'janan', 'janaa', 'reunajana', 'reunajanan'],
  kärki: ['kärki', 'kärjen', 'kärkeä', 'kärjessä', 'kulmapiste', 'kulmapisteen', 'kulmapistettä'],
  'suora kulma': ['suora kulma', 'suoran kulman', 'suoraa kulmaa', 'suorakulma'],
  'terävä kulma': ['terävä kulma', 'terävän kulman', 'terävää kulmaa', 'teräväkulma'],
  'tylppä kulma': ['tylppä kulma', 'tylpän kulman', 'tylppää kulmaa', 'tylppäkulma'],
};
function matchesBuild(task: BuildShapeTask, vertices: readonly Point[]) {
  const source = task.reference.points, n = source.length;
  return vertices.length === n && [1, -1].some(direction => vertices.some((_, start) => source.every((a, i) =>
    source.every((b, j) => distance2(a, b) * task.scale ** 2 === distance2(
      vertices[(start + direction * i + n) % n]!, vertices[(start + direction * j + n) % n]!,
    )),
  )));
}
const result = (ok: boolean, why: string): Verdict => ok ? { ok } : { ok, why };
const sameSet = (a: readonly string[], b: readonly string[]) => a.length === b.length && new Set(a).size === a.length && b.every(value => a.includes(value));

function circleParts(task: CircleShapeTask, figure: ShapeFigure) {
  if (figure.shape.kind !== 'circle') throw new Error('The figure is not a circle');
  const radius2 = figure.shape.radius ** 2;
  const center = task.points.find(({ at }) => at[0] === 0 && at[1] === 0)!;
  const segments = task.segments.map(segment => ({ ...segment,
    aPoint: task.points.find(({ id }) => id === segment.a)!.at, bPoint: task.points.find(({ id }) => id === segment.b)!.at }));
  const radii = segments.filter(({ a, b, aPoint, bPoint }) =>
    (a === center.id && distance2(center.at, bPoint) === radius2) || (b === center.id && distance2(center.at, aPoint) === radius2));
  const diameters = segments.filter(({ aPoint, bPoint }) =>
    distance2(center.at, aPoint) === radius2 && distance2(center.at, bPoint) === radius2 &&
    aPoint[0] + bPoint[0] === 2 * center.at[0] && aPoint[1] + bPoint[1] === 2 * center.at[1]);
  return { center, radii, diameters };
}

export function checkSailShape(task: SailShapeTask, response: SailShapeResponse): Verdict {
  if (task.activity !== response.activity) return { ok: false };
  if (task.activity === 'build' && response.activity === 'build') {
    if (!response.closed) return result(false, 'Sulje kuvio yhdistämällä viimeinen piste ensimmäiseen.');
    if (response.vertices.some(p => p.length !== 2 || p.some(n => !Number.isSafeInteger(n) || n < 0 || n > task.grid)) ||
      !isPolygon(path(response.vertices))) return result(false, 'Valitse eri kärkipisteet reunaa kiertävässä järjestyksessä. Sivut eivät risteä.');
    return result(matchesBuild(task, response.vertices), 'Vertaa mallin sivuja ja kulmia. Tarkista jokainen kärki ja tehtävän koko.');
  }
  if (task.activity === 'name' && response.activity === 'name') {
    if (task.target !== response.feature) return result(false, 'Seuraa kuvion merkittyä kohtaa ja valitse sama merkintä.');
    const normalized = response.text.normalize('NFC').toLocaleLowerCase('fi').trim().replace(/[.!?]+$/, '').replace(/\s+/g, ' ');
    return result(names[task.name].includes(normalized), 'Kirjoita geometrinen nimi. Sivulla, kärjellä ja kulmalla on omat nimensä.');
  }
  if (task.activity === 'circle' && response.activity === 'circle') {
    const figure = task.figures.find(({ id }) => id === response.figure);
    if (figure?.shape.kind !== 'circle') return result(false, 'Valitse ympyrä tasosta. Ellipsin keskeltä matka reunalle vaihtelee. Pallo on kappale.');
    const { center, radii, diameters } = circleParts(task, figure);
    if (center.id !== response.center) return result(false, 'Keskipiste on yhtä kaukana kaikista kehän pisteistä.');
    const selected = response.radii.map(id => radii.find(segment => segment.id === id));
    const circumferencePoints = new Set(selected.flatMap(segment => segment ? [segment.a === center.id ? segment.b : segment.a] : []));
    if (response.radii.length !== 2 || circumferencePoints.size !== 2) {
      return result(false, 'Valitse kaksi eri janaa keskipisteestä kahteen eri kehän pisteeseen. Molemmat ovat yhtä pitkiä säteitä.');
    }
    return result(diameters.some(({ id }) => id === response.diameter), 'Halkaisijan molemmat päät ovat kehällä ja jana kulkee keskipisteen kautta.');
  }
  if (task.activity === 'inspect' && response.activity === 'inspect') {
    const missing = task.questions.find(q => !sameSet(response.sets[q.id] ?? [], q.answer));
    return missing ? result(false, missing.why) : { ok: true };
  }
  return { ok: false };
}

export function solutionSailShape(task: SailShapeTask): SailShapeResponse {
  if (task.activity === 'build') {
    const x = Math.min(...task.reference.points.map(p => p[0])), y = Math.min(...task.reference.points.map(p => p[1]));
    return { kind: task.kind, activity: task.activity, closed: true,
      vertices: task.reference.points.map(p => [(p[0] - x) * task.scale, (p[1] - y) * task.scale]) };
  }
  if (task.activity === 'name') return { kind: task.kind, activity: task.activity, feature: task.target, text: task.name };
  if (task.activity === 'circle') {
    const figure = task.figures.find(({ shape }) => shape.kind === 'circle')!;
    const { center, radii, diameters } = circleParts(task, figure);
    return { kind: task.kind, activity: task.activity, figure: figure.id, center: center.id, radii: radii.slice(0, 2).map(({ id }) => id), diameter: diameters[0]!.id };
  }
  return { kind: task.kind, activity: task.activity, sets: Object.fromEntries(task.questions.map(q => [q.id, [...q.answer]])) };
}

export function wrongSailShapeResponses(task: SailShapeTask): SailShapeResponse[] {
  const answer = solutionSailShape(task);
  if (answer.activity === 'build') return [{ ...answer, closed: false }, { ...answer, vertices: answer.vertices.slice(1) }];
  if (answer.activity === 'name') return [{ ...answer, text: 'sininen' }, { ...answer, feature: 'toinen' }];
  if (answer.activity === 'circle') return [{ ...answer, center: 'toinen' }, { ...answer, radii: [answer.radii[0]!, answer.radii[0]!] }, { ...answer, diameter: answer.radii[0]! }];
  return [{ ...answer, sets: {} }];
}
