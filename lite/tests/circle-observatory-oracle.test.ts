import { describe, expect, it } from 'vitest';
import { circleObservatorySpecs } from '../src/content/circle-observatory';
import { checkCircleObservatory, circleArc, type CircleArc, type CircleBoard, type CircleObservatoryResponse,
  type CircleObservatoryTask, type Segment } from '../src/content/models/circle-observatory';
import { rng } from '../src/engine/rng';

const kind = 'circle-observatory' as const;
const rim = (board: CircleBoard) => board.points.filter(point => point.place === 'rim');
const bearing = (board: CircleBoard, id: string) => board.points.find(point => point.id === id)!.angle;
const turn = (angle: number) => ((angle % 360) + 360) % 360;
const inside = (board: CircleBoard, [a, b]: Segment, id: string) =>
  turn(bearing(board, id) - bearing(board, a)) < turn(bearing(board, b) - bearing(board, a));
function arcs(board: CircleBoard, ends: Segment) {
  return rim(board).filter(point => !ends.includes(point.id)).map(({ id }) => ({
    ends: [ends[1], ends[0]] as const, via: id,
    sweep: inside(board, ends, id) ? turn(bearing(board, ends[1]) - bearing(board, ends[0]))
      : turn(bearing(board, ends[0]) - bearing(board, ends[1])),
  }));
}
function angleAt(board: CircleBoard, ends: Segment, vertex: string) {
  const xy = (id: string) => {
    const theta = bearing(board, id) * Math.PI / 180;
    return [Math.cos(theta), Math.sin(theta)];
  };
  const [x, y] = xy(vertex);
  const [a, b] = xy(ends[0]), [c, d] = xy(ends[1]);
  const u = [a - x, b - y], v = [c - x, d - y];
  return Math.atan2(Math.abs(u[0] * v[1] - u[1] * v[0]), u[0] * v[0] + u[1] * v[1]) * 180 / Math.PI;
}
const opposite = (board: CircleBoard, a: string, b: string) =>
  Math.abs(bearing(board, a) - bearing(board, b)) === 180;
function routes(board: CircleBoard, prefix?: readonly string[]) {
  const sequence = rim(board).sort((a,b) => a.angle - b.angle).map(point => point.id);
  const count = sequence.length;
  return sequence.flatMap((_, start) => [-1,1].map(step => Array.from({ length: count + 1 }, (_, i) => sequence[(start + step * i + count) % count]!)))
    .filter(route => !prefix || prefix.every((point, index) => point === route[index]));
}

function independentReplies(task: CircleObservatoryTask): CircleObservatoryResponse[] {
  const { board } = task;
  const around = rim(board).map(point => point.id);
  const centre = board.points.find(point => point.place === 'centre')!.id;
  switch (task.mode) {
    case 'parts': {
      const route = routes(board, task.prefix);
      const validArcs = arcs(board, task.arcEnds).filter(arc => task.arcRequest === 'short' ? arc.sweep < 180
        : task.arcRequest === 'long' ? arc.sweep > 180 : inside(board, task.arcEnds, arc.via) === inside(board, task.arcEnds, task.through));
      const diameter = around.flatMap((a, i) => around.slice(i + 1).filter(b => opposite(board, a, b)).map(b => [b, a] as const))[0]!;
      const radii: Segment[] = [[around[0]!, centre], [centre, around[1]!]];
      const values = task.part === 'radius' ? [task.radius, task.radius] : task.part === 'diameter' || task.part === 'basic'
        ? [task.radius, task.radius, task.radius * 2] : [];
      const draft = task.draft;
      const draftWorks = !draft ? null : draft.kind === 'radius' ? draft.segment.includes(centre) && draft.segment.some(id => around.includes(id))
        : draft.kind === 'diameter' ? draft.segment.every(id => around.includes(id)) && opposite(board, ...draft.segment)
          : draft.kind === 'circumference' ? routes(board).some(valid => valid.length === draft.route.length && valid.every((v,i) => v === draft.route[i])) : false;
      return validArcs.map((arc, i) => ({ kind, mode: 'parts', radii: task.part === 'radius' ? radii : task.part === 'basic' ? radii.slice(0,1) : [],
        diameter, circumference: route[i % route.length]!, arc, values: values.map(value => `${5 * value}/5`), draftWorks }));
    }
    case 'angles':
    case 'thales': {
      const sameSide = (id: string) => inside(board, task.ends, id) === inside(board, task.ends, task.through);
      const candidates = around.filter(id => !task.ends.includes(id) && !sameSide(id));
      const alternatives = arcs(board, task.ends).filter(arc => sameSide(arc.via));
      const empty: CircleArc = { ends: task.ends, via: '' };
      return alternatives.map((arc, i) => {
        const vertex = candidates[i % candidates.length]!;
        const observed = Math.round(2 * angleAt(board, task.ends, vertex));
        const moved = candidates.find(id => id !== vertex)!;
        if (task.mode === 'angles') {
          const other = task.otherSide ? arcs(board, task.ends).find(x => !sameSide(x.via)) : undefined;
          return { kind, mode: 'angles', vertex: task.skill === 'central' ? centre : vertex, moved, rays: [task.ends[1], task.ends[0]],
            arc, central: String(observed), inscribed: `${observed}/2`, resized: String(observed), auditWorks: candidates.includes(task.audit ?? ''),
            otherArc: other ?? empty, otherInscribed: other ? `${Math.round(2 * angleAt(board, task.ends, task.otherSide!))}/2` : '' };
        }
        const other = Math.round(2 * angleAt(board, task.compare, task.compareVertex));
        const compareArc = arcs(board, task.compare).find(arc => arc.sweep === other)!;
        return { kind, mode: 'thales', vertices: [vertex, moved], arc, central: String(observed), inscribed: `${observed}/2`, locked: true,
          compareArc, compareCentral: String(other), compareInscribed: `${other}/2`, candidateWorks: candidates.includes(task.candidate ?? '') };
      });
    }
    case 'measure': {
      const radius = task.given.length / (task.given.kind === 'radius' ? 1 : 2);
      const isArea = ['area','sector'].includes(task.measure);
      const angle = task.angle === undefined ? 360 : task.remainder ? 360 - task.angle : task.angle;
      const scaled = (isArea ? 4 * radius ** 2 : 8 * radius) * angle;
      const numerator = Math.round(scaled);
      const variants = task.result === 'either' ? ['exact','approx'] as const : [task.result];
      return variants.map(notation => ({ kind, mode: 'measure', radius: String(radius), share: `${angle}/360`,
        coefficient: `${numerator}/1440`, result: (Math.PI * numerator / 1440).toFixed(task.decimals),
        unit: task.unit + (isArea ? '²' : ''), notation, lower: '3', upper: '4',
        prediction: task.compareRadius ? String((task.compareRadius / radius) ** 2) : '', locked: !!task.compareRadius,
        enlargedCoefficient: task.compareRadius ? String(task.compareRadius ** 2) : '' }));
    }
  }
}

describe('independent circle observatory oracle', () => {
  it('checks all families and transfer from geometric bearings, dot/cross angles and independent measurements', () => {
    let count = 0;
    for (const spec of circleObservatorySpecs) for (const phase of ['independent','transfer'] as const) for (let seed = 0; seed < 96; seed++) {
      const task = spec.item(rng(seed), phase).task;
      const replies = independentReplies(task);
      expect(replies.length, `${spec.id}/${phase}/${seed}`).toBeGreaterThan(0);
      for (const response of replies) {
        expect(checkCircleObservatory(task, response).ok, `${spec.id}/${phase}/${seed}`).toBe(true);
        if (response.mode === 'measure') expect(checkCircleObservatory(task, { ...response, unit: 'wrong' }).ok).toBe(false);
        if (response.mode === 'thales') expect(checkCircleObservatory(task, { ...response, locked: false }).ok).toBe(false);
        if (response.mode === 'parts' && task.mode === 'parts' && task.draft)
          expect(checkCircleObservatory(task, { ...response, draftWorks: !response.draftWorks }).ok).toBe(false);
      }
      count++;
    }
    expect(count).toBe(2688);
  });

  it('preserves the 300°/150° and 60°/30° relations for every integer rotation and reversed endpoints', () => {
    const base = [0,60,30,110,180,275];
    const ends: Segment = ['A','B'];
    for (let rotation = 0; rotation < 360; rotation++) {
      const board: CircleBoard = {
        points: base.map((angle, i) => ({ id: 'ABCDEF'[i]!, angle: (angle + rotation) % 360, place: 'rim' })),
        drawing: { x: 0, y: 0, radius: 1 }, setting: 'Kulmaoraakkeli',
      };
      for (const [via, apex, central, inscribed] of [['D','C',300,150],['C','D',60,30]] as const) {
        expect(angleAt(board, ends, apex)).toBeCloseTo(inscribed, 9);
        const task: CircleObservatoryTask = { kind, mode: 'angles', skill: 'integration', board, ends, through: via, context: { title:'Kulmat', skills: [] } };
        const arc: CircleArc = { ends: ['B','A'], via };
        const reply: CircleObservatoryResponse = { kind, mode:'angles', vertex: apex, moved:'', rays:['B','A'], arc,
          central:String(central), inscribed:String(inscribed), resized:'', auditWorks:null, otherArc:arc, otherInscribed:'' };
        expect(circleArc(board, arc)?.degrees).toBe(central);
        expect(checkCircleObservatory(task, reply).ok).toBe(true);
        expect(checkCircleObservatory(task, { ...reply, central: String(360-central), inscribed: String(180-inscribed) }).ok).toBe(false);
      }
    }
  });
});
