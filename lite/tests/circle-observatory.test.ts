import { describe, expect, it } from 'vitest';
import { circleObservatoryEvidence, circleObservatorySpecs } from '../src/content/circle-observatory';
import { rng } from '../src/engine/rng';
import { checkCircleObservatory, solutionCircleObservatory, wrongCircleObservatoryResponses,
  type CircleArc, type CircleBoard, type CircleObservatoryResponse, type CircleObservatoryTask, type Segment } from '../src/content/models/circle-observatory';

const k = 'circle-observatory' as const;
const accept = (t: CircleObservatoryTask, a: CircleObservatoryResponse) => expect(checkCircleObservatory(t, a)).toEqual({ ok: true });
const reject = (t: CircleObservatoryTask, a: CircleObservatoryResponse) => expect(checkCircleObservatory(t, a).ok).toBe(false);
type Vec = [number, number];
const direction = (deg: number): Vec => [Math.cos(deg * Math.PI / 180), Math.sin(deg * Math.PI / 180)];
const subtract = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1]];
const cross = (a: Vec, b: Vec) => a[0] * b[1] - a[1] * b[0];
const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1];
const same = (a: number, b: number) => Math.abs(a - b) < 1e-9;
const root = (b: CircleBoard) => b.points.find(p => p.place === 'centre')!.id;
const rim = (b: CircleBoard) => b.points.filter(p => p.place === 'rim').map(p => p.id);
const at = (b: CircleBoard, id: string) => direction(b.points.find(p => p.id === id)!.angle);
const angle = (a: Vec, b: Vec) => Math.round(Math.atan2(Math.abs(cross(a, b)), dot(a, b)) * 180 / Math.PI * 2) / 2;
const chordSide = (b: CircleBoard, [a, c]: Segment, v: string) => Math.sign(cross(subtract(at(b, c), at(b, a)), subtract(at(b, v), at(b, a))));
const oppositeSide = (b: CircleBoard, ends: Segment, p: string, q: string) => chordSide(b, ends, p) !== chordSide(b, ends, q);
const minor = (b: CircleBoard, ends: Segment) => angle(at(b, ends[0]), at(b, ends[1]));
function onMinor(b: CircleBoard, ends: Segment, id: string) {
  return same(angle(at(b, ends[0]), at(b, id)) + angle(at(b, id), at(b, ends[1])), minor(b, ends));
}
function intercepted(b: CircleBoard, ends: Segment, p: string) {
  const from = at(b, p);
  return angle(subtract(at(b, ends[0]), from), subtract(at(b, ends[1]), from));
}
function arcOtherThan(b: CircleBoard, ends: Segment, p: string): CircleArc {
  const via = rim(b).filter(id => !ends.includes(id) && id !== p && oppositeSide(b, ends, id, p)).at(-1)!;
  return { ends: [ends[1], ends[0]], via };
}

function independentlyBuild(t: CircleObservatoryTask): CircleObservatoryResponse {
  const { board: b } = t, points = rim(b);
  switch (t.mode) {
    case 'parts': {
      const radiusCount = t.part === 'basic' ? 1 : t.part === 'radius' ? 2 : 0;
      const diameters = points.flatMap(a => points.filter(c => same(dot(at(b, a), at(b, c)), -1)).map(c => [a, c] as const));
      const diameter = diameters.at(-1)!;
      const values = t.part === 'radius' ? [t.radius, t.radius] : t.part === 'basic' || t.part === 'diameter' ? [t.radius, t.radius, 2 * t.radius] : [];
      const via = points.filter(id => !t.arcEnds.includes(id) && (t.arcRequest === 'via' ? chordSide(b, t.arcEnds, id) === chordSide(b, t.arcEnds, t.through)
        : onMinor(b, t.arcEnds, id) === (t.arcRequest === 'short'))).at(-1)!;
      const order = points.sort((a, c) => Math.atan2(at(b, a)[1], at(b, a)[0]) - Math.atan2(at(b, c)[1], at(b, c)[0]));
      const index = t.prefix ? order.indexOf(t.prefix[0]!) : order.length - 2;
      const traversal = [...order.slice(index), ...order.slice(0, index)];
      if (!t.prefix || t.prefix[1] !== traversal[1]) traversal.splice(1, traversal.length - 1, ...traversal.slice(1).reverse());
      const draftWorks = t.draft ? (t.draft.kind === 'radius' ? t.draft.segment.includes(root(b)) &&
        t.draft.segment.some(id => points.includes(id)) : t.draft.kind === 'diameter' ? diameters.some(pair =>
          pair[0] === (t.draft as { segment: Segment }).segment[0] && pair[1] === (t.draft as { segment: Segment }).segment[1]) : false) : null;
      return { kind: k, mode: 'parts', radii: radiusCount ? points.slice(-radiusCount).map(id => [id, root(b)] as const) : [],
        diameter, arc: { ends: [t.arcEnds[1], t.arcEnds[0]], via }, circumference: [...traversal, traversal[0]!], values: values.map(String), draftWorks };
    }
    case 'angles': {
      const eligible = points.filter(id => !t.ends.includes(id) && id !== t.through && oppositeSide(b, t.ends, id, t.through));
      const v = eligible.at(-1)!, inscribed = intercepted(b, t.ends, v);
      const { via, ends } = arcOtherThan(b, t.ends, v);
      return { kind: k, mode: 'angles', vertex: t.skill === 'central' ? root(b) : v, moved: eligible[0]!, rays: [t.ends[1], t.ends[0]],
        arc: { via, ends }, central: String(2 * inscribed), resized: String(2 * inscribed), inscribed: String(inscribed),
        auditWorks: t.audit ? eligible.includes(t.audit) : null,
        otherArc: t.otherSide ? arcOtherThan(b, t.ends, t.otherSide) : { ends: t.ends, via: '' },
        otherInscribed: t.otherSide ? String(intercepted(b, t.ends, t.otherSide)) : '' };
    }
    case 'measure': {
      const diameter = t.given.kind === 'diameter' ? t.given.length : t.given.length * 2;
      const square = t.measure === 'area' || t.measure === 'sector';
      const sweep = t.remainder ? 360 - t.angle! : t.angle ?? 360;
      const units = square ? t.unit + '²' : t.unit;
      const numerator = (square ? diameter * diameter : diameter) * sweep;
      const denominator = square ? 1440 : 360;
      const notation = t.result === 'exact' ? 'exact' : 'approx';
      return { kind: k, mode: 'measure', notation, radius: `${diameter * 3}/6`, share: `${sweep}/360`, coefficient: `${numerator}/${denominator}`,
        result: (numerator / denominator * Math.PI).toFixed(t.decimals).replace('.', ','), unit: units, lower: '3', upper: '4',
        locked: !!t.compareRadius, prediction: t.compareRadius ? `${4 * t.compareRadius ** 2}/${diameter ** 2}` : '',
        enlargedCoefficient: t.compareRadius ? String(t.compareRadius ** 2) : '' };
    }
    case 'thales': {
      const valid = points.filter(id => !t.ends.includes(id) && id !== t.through && oppositeSide(b, t.ends, id, t.through));
      const vertices = valid.slice(-2).reverse() as [string, string];
      const compare = intercepted(b, t.compare, t.compareVertex);
      expect(intercepted(b, t.ends, vertices[0])).toBe(90);
      expect(intercepted(b, t.ends, vertices[1])).toBe(90);
      expect(compare).not.toBe(90);
      return { kind: k, mode: 'thales', vertices, arc: arcOtherThan(b, t.ends, vertices[0]), central: '180', inscribed: '90',
        locked: true, compareArc: arcOtherThan(b, t.compare, t.compareVertex), compareCentral: String(2 * compare),
        compareInscribed: String(compare), candidateWorks: t.candidate ? valid.includes(t.candidate) : null };
    }
  }
}

describe('Circle Observatory geometry and evidence', () => {
  it('assesses all fourteen nodes in both families and transfer against a separate construction and numerical oracle', () => {
    expect(circleObservatorySpecs).toHaveLength(14);
    let total = 0, positive = 0, rejected = 0;
    for (const spec of circleObservatorySpecs) {
      const tags = new Set<string>(), semantic = new Set<string>();
      for (let seed = 0; seed < 64; seed++) for (const phase of ['independent', 'guided', 'transfer'] as const) {
        const item = spec.item(rng(seed), phase), task = item.task;
        tags.add(item.tag!);
        semantic.add(task.mode === 'measure' ? JSON.stringify([task.given, task.angle, task.remainder]) : JSON.stringify(task.board.points
          .filter(p => p.place === 'rim').map(p => (p.angle - task.board.points[0]!.angle + 360) % 360)));
        expect(new Set(task.board.points.filter(p => p.place === 'rim').map(p => p.angle)).size).toBe(rim(task.board).length);
        accept(task, independentlyBuild(task)); positive++;
        accept(task, solutionCircleObservatory(task)); positive++;
        for (const a of wrongCircleObservatoryResponses(task)) { reject(task, a); rejected++; }
        total++;
      }
      expect([...tags].sort()).toEqual([...circleObservatoryEvidence[spec.id]!.families, 'transfer'].sort());
      expect(semantic.size, spec.id).toBeGreaterThanOrEqual(8);
    }
    expect({ total, positive, rejected }).toEqual({ total: 2688, positive: 5376, rejected: 3648 });
  });

  it('requires a closed ordered path, a real diameter and every output in the integration', () => {
    const t = circleObservatorySpecs.find(s => s.id === 'M79-CIRCLE-BASIC')!.item(rng(7), 'transfer').task;
    if (t.mode !== 'parts') throw new Error('Missing circle map');
    const a = independentlyBuild(t);
    if (a.mode !== 'parts') throw new Error('Missing map construction');
    reject(t, { ...a, radii: [a.diameter] });
    reject(t, { ...a, radii: new Array(1) });
    reject(t, { ...a, diameter: [t.arcEnds[0], a.arc.via] });
    reject(t, { ...a, arc: { ends: t.arcEnds, via: root(t.board) } });
    reject(t, { ...a, circumference: a.circumference.slice(0, -1) });
    reject(t, { ...a, circumference: [...a.circumference].map((id, i) => i === 3 ? a.circumference[1]! : id) });
    reject(t, { ...a, values: [...a.values.slice(0, 2), a.values[0]!] });
    accept(t, { ...a, circumference: [...a.circumference].reverse() });
  });

  it('treats major-arc, minor-arc, opposite-vertex and wrong-edge evidence separately', () => {
    const spec = circleObservatorySpecs.find(s => s.id === 'M79-INSCRIBED-CENTRAL-REL')!;
    const item = Array.from({ length: 50 }, (_, seed) => spec.item(rng(seed), 'independent'))
      .find(i => i.task.mode === 'angles' && i.task.otherSide)!;
    const t = item.task, a = independentlyBuild(t);
    if (t.mode !== 'angles' || a.mode !== 'angles' || !t.otherSide) throw new Error('Missing angle comparison');
    expect(+a.central).toBeGreaterThan(180);
    expect(+a.inscribed + +a.otherInscribed).toBe(180);
    reject(t, { ...a, arc: a.otherArc });
    reject(t, { ...a, vertex: t.otherSide });
    reject(t, { ...a, rays: [a.rays[0], t.through] });
    reject(t, { ...a, inscribed: String(+a.central) });
    reject(t, { ...a, otherInscribed: a.inscribed });
  });

  it('requires separate units, exact ratios and true locked comparisons', () => {
    const spec = circleObservatorySpecs.find(s => s.id === 'M79-CIRCLE-AREA')!;
    const t = spec.item(rng(6), 'transfer').task, a = independentlyBuild(t);
    if (t.mode !== 'measure' || a.mode !== 'measure') throw new Error('Missing area');
    reject(t, { ...a, locked: false });
    reject(t, { ...a, prediction: '2' });
    reject(t, { ...a, unit: t.unit });
    reject(t, { ...a, coefficient: '1/0' });
    reject(t, { ...a, coefficient: 'Infinity' });
    reject(t, { ...a, result: '0' });
    accept(t, { ...a, notation: 'exact', result: '' });
  });

  it('preserves the changed-context contrast in the circle part and circumference transfers', () => {
    const transfer = (id: string, seed: number) => circleObservatorySpecs.find(s => s.id === id)!.item(rng(seed), 'transfer').task;
    for (let seed = 0; seed < 48; seed++) {
      const radius = transfer('M79-CIRCLE-RADIUS', seed);
      const diameter = transfer('M79-CIRCLE-DIAMETER', seed);
      const ring = transfer('M79-CIRCLE-CIRCUMFERENCE-CONCEPT', seed);
      const measure = transfer('M79-CIRCLE-CIRC', seed);
      if (radius.mode !== 'parts' || radius.draft?.kind !== 'radius' ||
          diameter.mode !== 'parts' || diameter.draft?.kind !== 'diameter' ||
          ring.mode !== 'parts' || measure.mode !== 'measure') throw new Error('Missing contrast');
      expect(radius.draft.segment.some(id => radius.board.points.find(p => p.id === id)?.place === 'inside')).toBe(true);
      const near = minor(diameter.board, diameter.draft.segment);
      expect(near).toBeLessThan(180);
      expect(near).toBeGreaterThanOrEqual(162);
      expect(ring.draft).toEqual({ kind: 'area' });
      expect(measure.given.kind).toBe('radius');
    }
  });

  it('requires two distinct valid vertices and a calculated non-diameter counterexample', () => {
    const t = circleObservatorySpecs.find(s => s.id === 'M79-THALES')!.item(rng(5), 'transfer').task;
    const a = independentlyBuild(t);
    if (t.mode !== 'thales' || a.mode !== 'thales') throw new Error('Missing Thales model');
    reject(t, { ...a, locked: false });
    reject(t, { ...a, vertices: [a.vertices[0], a.vertices[0]] });
    reject(t, { ...a, vertices: [t.ends[0], a.vertices[1]] });
    reject(t, { ...a, vertices: [root(t.board), a.vertices[1]] });
    reject(t, { ...a, compareCentral: '180', compareInscribed: '90' });
  });
});
