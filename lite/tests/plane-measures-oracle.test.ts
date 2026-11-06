import { describe, expect, it } from 'vitest';
import { planeMeasuresSpecs } from '../src/content/plane-measures';
import { checkPlaneMeasures, planeFaces, type PlaneMeasuresResponse, type PlaneMeasuresTask, type PlanePoint,
  type PlanePolygon, type PlaneSegment, type TriangleBoard } from '../src/content/models/plane-measures';
import { rng } from '../src/engine/rng';

const kind = 'plane-measures' as const;
const acceptable = (task: PlaneMeasuresTask, response: PlaneMeasuresResponse) => checkPlaneMeasures(task, response).ok;
const at = (points: PlanePolygon, id: string) => points.find(p => p.id === id)!;
const loop = (points: PlanePolygon) => points.map((p, i) => [p, points[(i + 1) % points.length]!] as const);
const area2 = (points: PlanePolygon) => loop(points).reduce((area, [a, b]) => area + (a.x + b.x) * (b.y - a.y), 0);
const length = (a: PlanePoint, b: PlanePoint) => Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
const name = (points: PlanePolygon) => points.map(p => p.id).sort().join('');
const numberText = (n: number) => String(n * 3) + '/3';
const shapeText = (face: PlanePolygon) => `${Math.abs(area2(face)) * 3}/6`;
const orient = (a: PlanePoint, b: PlanePoint, c: PlanePoint) => (a.x - c.x) * (b.y - c.y) - (b.x - c.x) * (a.y - c.y);

function onSegment(a: PlanePoint, b: PlanePoint, p: PlanePoint, open = false) {
  if (orient(a, b, p) !== 0) return false;
  const useX = a.x !== b.x;
  const [x, y, q] = useX ? [a.x, b.x, p.x] : [a.y, b.y, p.y];
  return open ? q > Math.min(x, y) && q < Math.max(x, y) : q >= Math.min(x, y) && q <= Math.max(x, y);
}
function crosses(a: PlanePoint, b: PlanePoint, c: PlanePoint, d: PlanePoint) {
  return orient(a, b, c) * orient(a, b, d) < 0 && orient(c, d, a) * orient(c, d, b) < 0;
}
function enclosed(points: PlanePolygon, point: PlanePoint) {
  let crossings = 0;
  for (const [a, b] of loop(points)) {
    if (onSegment(a, b, point)) return false;
    if ((a.x > point.x) !== (b.x > point.x) && a.y + (point.x - a.x) * (b.y - a.y) / (b.x - a.x) > point.y) crossings++;
  }
  return crossings % 2 === 1;
}

function validChords(points: PlanePolygon, cuts: readonly PlaneSegment[]) {
  const added: (readonly [PlanePoint, PlanePoint])[] = [];
  for (const [u, v] of cuts) {
    const a = at(points, u), b = at(points, v);
    if (!a || !b || a === b) return false;
    if (loop(points).some(([c, d]) => crosses(a, b, c, d))) return false;
    if (points.some(p => p !== a && p !== b && onSegment(a, b, p, true))) return false;
    const sample = { id: '', x: (a.x * 3 + b.x) / 4, y: (a.y * 3 + b.y) / 4 };
    if (!enclosed(points, sample)) return false;
    if (added.some(([c, d]) => (a === c && b === d) || (a === d && b === c) ||
      crosses(a, b, c, d) || onSegment(a, b, c, true) || onSegment(a, b, d, true) ||
      onSegment(c, d, a, true) || onSegment(c, d, b, true))) return false;
    added.push([a, b]);
  }
  return true;
}

/** Walk bounded regions in the planar graph of boundary edges plus cuts. */
function boundedFaces(points: PlanePolygon, cuts: readonly PlaneSegment[]): PlanePolygon[] | undefined {
  if (!validChords(points, cuts)) return;
  const neighbors = new Map(points.map(p => [p, [] as PlanePoint[]]));
  for (const [a, b] of [...loop(points), ...cuts.map(([a, b]) => [at(points, a), at(points, b)] as const)]) {
    neighbors.get(a)!.push(b); neighbors.get(b)!.push(a);
  }
  for (const [p, options] of neighbors)
    options.sort((a, b) => Math.atan2(a.y - p.y, a.x - p.x) - Math.atan2(b.y - p.y, b.x - p.x));
  const used = new Set<string>(), result: PlanePolygon[] = [];
  for (const [start, next] of neighbors) for (const head of next) {
    let [a, b] = [start, head];
    const ring: PlanePoint[] = [];
    while (!used.has(`${a.id},${b.id}`)) {
      used.add(`${a.id},${b.id}`); ring.push(a);
      const options = neighbors.get(b)!;
      [a, b] = [b, options[(options.indexOf(a) + options.length - 1) % options.length]!];
    }
    if (area2(ring) > 0) result.push(ring.filter((p, i) =>
      orient(ring[(i + ring.length - 1) % ring.length]!, p, ring[(i + 1) % ring.length]!) !== 0));
  }
  expect(result.reduce((a, ring) => a + area2(ring), 0)).toBe(Math.abs(area2(points)));
  return result;
}
function height(polygon: PlanePolygon, line: TriangleBoard['lines'][number]) {
  const [a, b] = line.base.map(id => at(polygon, id));
  const tip = at(polygon, line.apex);
  const dx = b!.x - a!.x, dy = b!.y - a!.y;
  const projection = ((tip.x - a!.x) * dx + (tip.y - a!.y) * dy) / (dx * dx + dy * dy);
  const foot = [...polygon, ...line.feet].find(p => p.x === a!.x + projection * dx && p.y === a!.y + projection * dy)!;
  expect(foot).toBeDefined();
  return { base: [b!.id, a!.id] as const, apex: tip.id, foot: foot.id,
    baseLength: numberText(length(a!, b!)), height: numberText(length(tip, foot)), area: shapeText(polygon),
    outside: projection < 0 || projection > 1 };
}
const units = { 'mm²': 1, 'cm²': 100, 'dm²': 10000, 'm²': 1000000 };

describe('Independent audit of Plane Measures geometry', () => {
  it('derives boundary closure, all altitude variants and the exact area units from authored data', () => {
    let count = 0, outside = 0, alternate = 0;
    for (const spec of planeMeasuresSpecs) for (const phase of ['guided', 'independent', 'transfer'] as const) for (let seed = 0; seed < 64; seed++) {
      const task = spec.item(rng(seed), phase).task;
      if (task.kind !== kind || task.mode === 'partition') continue;
      count++;
      if (task.mode === 'perimeter') {
        const sides = loop(task.polygon);
        const others = sides.filter(([a, b]) => !task.missing.includes(a.id) || !task.missing.includes(b.id));
        const dx = others.reduce((a, [b, c]) => a + c.x - b.x, 0);
        const dy = others.reduce((a, [b, c]) => a + c.y - b.y, 0);
        const missing = Math.abs(dx) + Math.abs(dy);
        const total = others.reduce((a, [b, c]) => a + length(b, c), missing);
        const route = task.polygon.map(p => p.id).reverse();
        route.push(route.shift()!); route.push(route[0]!);
        const r: PlaneMeasuresResponse = { kind, mode: 'perimeter', route, unit: task.unit,
          value: numberText(total), missing: numberText(missing) };
        expect(acceptable(task, r)).toBe(true);
        expect(acceptable(task, { ...r, missing: String(missing + 1) })).toBe(false);
        const internal = task.guides[0]!;
        const routeWithSeam = [internal[0], internal[1], ...task.polygon.map(p => p.id).filter(id => !internal.includes(id)), internal[0]];
        expect(acceptable(task, { ...r, route: routeWithSeam })).toBe(false);
        expect(acceptable(task, { ...r, value: String(total + length(at(task.polygon, internal[0]), at(task.polygon, internal[1]))) })).toBe(false);
      } else if (task.mode === 'triangle') {
        const rows = task.boards.map(board => {
          const line = board.lines.at(-1)!;
          const made = height(board.polygon, line);
          outside += Number(made.outside);
          alternate += Number(board.lines.length > 1);
          return made;
        });
        const r: PlaneMeasuresResponse = { kind, mode: 'triangle', unit: task.unit + '²', rows };
        expect(acceptable(task, r)).toBe(true);
        if (task.boards.some(b => b.lines.length > 1))
          expect(acceptable(task, { ...r, rows: task.boards.map(b => height(b.polygon, b.lines[0]!)) })).toBe(true);
        const first = rows[0]!;
        const badFoot = task.boards[0]!.polygon.find(p => p.id !== first.foot && first.base.includes(p.id))!;
        expect(acceptable(task, { ...r, rows: [{ ...first, foot: badFoot.id }, ...rows.slice(1)] })).toBe(false);
        expect(acceptable(task, { ...r, unit: task.unit })).toBe(false);
      } else {
        const a = units[task.from], b = units[task.to], factor = Math.max(a, b) / Math.min(a, b);
        const step = Math.sqrt(factor);
        const [w, decimal = ''] = task.amount.split(',');
        const n = BigInt(w! + decimal), d = 10n ** BigInt(decimal.length);
        const r: PlaneMeasuresResponse = { kind, mode: 'conversion', axes: [numberText(step), numberText(step)],
          factor: numberText(factor), direction: a > b ? 'multiply' : 'divide', value: `${n * BigInt(a)}/${d * BigInt(b)}`, unit: task.to };
        // The text parser bounds each integer to nine digits. Reduce the independently built ratio as needed.
        let x = n * BigInt(a), y = d * BigInt(b);
        let g = x, h = y;
        while (h) [g, h] = [h, g % h];
        x /= g; y /= g;
        r.value = `${x}/${y}`;
        expect(acceptable(task, r)).toBe(true);
        expect(acceptable(task, { ...r, factor: String(step) })).toBe(false);
        expect(acceptable(task, { ...r, axes: [String(step), '1'] })).toBe(false);
      }
    }
    expect(count).toBe(576);
    expect(outside).toBeGreaterThan(0);
    expect(alternate).toBe(64);
  });

  it('agrees with all single and paired cuts from an independent planar half-edge graph', () => {
    let accepted = 0, excluded = 0, generated = 0;
    for (const spec of planeMeasuresSpecs) for (const phase of ['independent', 'transfer'] as const) for (let seed = 0; seed < 32; seed++) {
      const task = spec.item(rng(seed), phase).task;
      if (task.kind !== kind || task.mode !== 'partition') continue;
      generated++;
      const candidates = task.polygon.flatMap((a, i) => task.polygon.slice(i + 1).map(b => [a.id, b.id] as const));
      let legal = 0;
      for (const [i, first] of candidates.entries()) for (const cuts of [[first], ...candidates.slice(i + 1).map(b => [first, b])]) {
        const faces = boundedFaces(task.polygon, cuts);
        const actual = planeFaces(task.polygon, cuts);
        expect(actual?.map(name).sort()).toEqual(faces?.map(name).sort());
        const valid = !!faces && faces.every(face => face.length === 3 || face.length === 4) &&
          (task.shape === 'quad' || faces.some(f => f.length === 3) && faces.some(f => f.length === 4));
        const h = task.altitude && height(task.polygon, task.altitude);
        const hole = task.hole ? Math.abs(area2(task.hole)) : 0;
        const response: PlaneMeasuresResponse = { kind, mode: 'partition', cuts,
          areas: Object.fromEntries((faces ?? []).map(face => [name(face), shapeText(face)])),
          value: `${Math.abs(area2(task.polygon)) - hole}/2`, unit: task.unit + '²', hole: `${hole}/2`,
          ...(h && task.altitude ? { altitude: h, lower: h.baseLength, height: h.height, upper: numberText(length(
            at(task.polygon, task.altitude.upper[0]), at(task.polygon, task.altitude.upper[1]))) } : {}),
        };
        expect(acceptable(task, response)).toBe(valid);
        if (valid) { legal++; accepted++; } else excluded++;
      }
      expect(legal, `${spec.id}/${phase}/${seed}`).toBeGreaterThan(1);
    }
    expect(generated).toBe(128);
    expect(accepted + excluded).toBe(11200);
    expect(accepted).toBeGreaterThan(1000);
    expect(excluded).toBeGreaterThan(9000);
  });
});
