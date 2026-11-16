import { describe, expect, it } from 'vitest';
import { cameraStep, mapJourney, pointOnJourney, sampleMapPath, visibleCameraStep } from '../src/ui/map-travel';
import { layoutRegions, type MapLayout } from '../src/ui/maplayout';
import { ORDER, kc, requiredOf } from '../src/engine/graph';
import { chaptersFor } from '../src/content/world';

describe('D3 drawn map travel', () => {
  it('camera easing uses elapsed time rather than a per-frame displacement', () => {
    const first = cameraStep(100, 800, 1000 / 60);
    const twoFrames = first + cameraStep(100 - first, 800, 1000 / 60);
    expect(twoFrames).toBeCloseTo(cameraStep(100, 800, 1000 / 30), 10);
    expect(cameraStep(10000, 800, 1000 / 30)).toBeCloseTo(cameraStep(10000, 800, 1000 / 60) * 2, 10);
  });
  it('retains eased movement whenever the rendered span remains in the viewport', () => {
    const step = cameraStep(100, 800, 1000 / 60);
    expect(visibleCameraStep(step, 300, 420, 800)).toBe(step);
    expect(visibleCameraStep(-step, 300, 420, 800)).toBe(-step);
  });
  it('keeps the rendered portrait and road target visible across long frame gaps in either direction', () => {
    for (const [top, bottom, delta] of [[-720, -615, -1000], [1500, 1610, 2000]] as const) {
      const eased = cameraStep(delta, 768, 700);
      expect(top - eased < 8 || bottom - eased > 760).toBe(true);
      const visible = visibleCameraStep(eased, top, bottom, 768);
      expect(top - visible).toBeGreaterThanOrEqual(8);
      expect(bottom - visible).toBeLessThanOrEqual(760);
    }
  });
  it('samples the cubic tunnel rather than its endpoint line', () => {
    const points = sampleMapPath('M0 0C30 50 130 50 100 100');
    expect(points[12]).toEqual({ x: 72.5, y: 50 });
    expect(points[0]).toEqual({ x: 0, y: 0 });
    expect(points.at(-1)).toEqual({ x: 100, y: 100 });
  });
  it('samples rounded ferry corners as quadratics', () => {
    const points = sampleMapPath('M100 0V50Q100 60 90 60H20Q10 60 10 70V200');
    expect(points).toContainEqual({ x: 97.5, y: 57.5 });
    expect(points).not.toContainEqual({ x: 100, y: 60 });
    expect(points.at(-1)).toEqual({ x: 10, y: 200 });
  });
  for (const world of ['ranta', 'saari', 'lab'] as const) {
    const L = layoutRegions(chaptersFor(world).map(c => ({ id: c.id, nodes: ORDER.filter(n => c.nodes.includes(n)) })), requiredOf, id => kc(id).soft);
    it(`${world}: every drawn link can be followed in either direction without jumping a curve`, () => {
      for (const link of [...L.edges, ...L.paths]) {
        for (const [from, to] of [[link.from, link.to], [link.to, link.from]]) {
          const route = mapJourney(L, from!, to!)!;
          expect(route.nodes[0]).toBe(from); expect(route.nodes.at(-1)).toBe(to);
          expect(Math.hypot(route.points[0]!.x - L.nodes.get(from!)!.x, route.points[0]!.y - L.nodes.get(from!)!.y)).toBeLessThan(.15);
          const end = pointOnJourney(route, 1);
          expect(Math.hypot(end.x - L.nodes.get(to!)!.x, end.y - L.nodes.get(to!)!.y)).toBeLessThan(.15);
          expect(route.points.every(p => Number.isFinite(p.x) && Number.isFinite(p.y))).toBe(true);
          for (let i = 1; i < route.nodes.length; i++) expect([...L.edges, ...L.paths].some(e => [e.from, e.to].includes(route.nodes[i - 1]!) && [e.from, e.to].includes(route.nodes[i]!))).toBe(true);
        }
      }
    });
    it(`${world}: drawn tunnels and ferries remain sampled in the route`, () => {
      for (const edge of L.edges.filter(e => e.sections.some(s => s.kind === 'tunnel' || s.kind === 'ferry'))) {
        const curve = edge.sections.flatMap(s => sampleMapPath(s.d));
        expect(curve.length).toBeGreaterThan(edge.route.length);
      }
    });
  }
  it('keeps intermediate actual stops in a connected multi-link journey', () => {
    const L = layoutRegions(chaptersFor('ranta').map(c => ({ id: c.id, nodes: ORDER.filter(n => c.nodes.includes(n)) })), requiredOf, id => kc(id).soft);
    const route = mapJourney(L, 'M-NUM-02', 'M-NUM-STABLE-ORDER')!;
    expect(route.nodes.length).toBeGreaterThan(2);
    expect(route.length).toBeGreaterThan(100);
    for (const id of route.nodes.slice(1, -1)) expect(route.points.some(p => Math.hypot(p.x - L.nodes.get(id)!.x, p.y - L.nodes.get(id)!.y) < .15)).toBe(true);
  });
  it('returns no fictitious line for disconnected or missing destinations', () => {
    const L: MapLayout = { w: 100, h: 100, nodes: new Map([['a', { id: 'a', x: 0, y: 0, row: 0 }], ['b', { id: 'b', x: 90, y: 90, row: 1 }]]), edges: [], paths: [] };
    expect(mapJourney(L, 'a', 'b')).toBeUndefined();
    expect(mapJourney(L, 'a', 'missing')).toBeUndefined();
    expect(mapJourney(L, 'a', 'a')?.length).toBe(0);
  });
});
