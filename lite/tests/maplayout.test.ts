import { describe, expect, it } from 'vitest';
import { ORDER, kc, requiredOf } from '../src/engine/graph';
import { chaptersFor } from '../src/content/world';
import { layoutRegions, MAP, type MapLayout } from '../src/ui/maplayout';

const soft = (id: string) => kc(id).soft;
const chapters = chaptersFor;
const layoutFor = (w: 'ranta' | 'saari' | 'lab'): [string[], MapLayout] => {
  const chapters = chaptersFor(w);
  const ids = ORDER.filter((id) => chapters.some((c) => c.nodes.includes(id)));
  return [ids, layoutRegions(chapters.map((c) => ({ id: c.id, nodes: ORDER.filter((n) => c.nodes.includes(n)) })), requiredOf, soft)];
};

describe('world map layout', () => {
  for (const w of ['ranta', 'saari', 'lab'] as const) {
    const [ids, L] = layoutFor(w);
    it(`${w}: every place placed inside the map, prerequisites above`, () => {
      expect(L.nodes.size).toBe(ids.length);
      for (const n of L.nodes.values()) {
        expect(n.x).toBeGreaterThanOrEqual(MAP.r);
        expect(n.x).toBeLessThanOrEqual(MAP.w - MAP.r);
      }
      for (const e of L.edges) expect(L.nodes.get(e.from)!.y, `${e.from}>${e.to}`).toBeLessThan(L.nodes.get(e.to)!.y);
    });
    it(`${w}: every required relation is a road, tunnel or ferry; most are roads`, () => {
      const req = ids.flatMap((id) => requiredOf(id).filter((p) => ids.includes(p)).map((p) => `${p}>${id}`));
      expect(L.edges.map((e) => `${e.from}>${e.to}`).sort()).toEqual(req.sort());
      const secs = L.edges.flatMap((e) => e.sections);
      const paths = secs.filter((s) => s.kind !== 'tunnel').length;
      console.log(w, 'sections', secs.length, 'tunnels', secs.length - paths, 'ferries', secs.filter((s) => s.kind === 'ferry').length, 'height', L.h);
      expect(paths / secs.length).toBeGreaterThan(0.75);
    });
    it(`${w}: no place is left without a road or a footpath`, () => {
      const touched = new Set([...L.edges.flatMap((e) => [e.from, e.to]), ...L.paths.flatMap((p) => [p.from, p.to])]);
      expect(ids.filter((id) => !touched.has(id))).toEqual([]);
    });
    it(`${w}: places stay inside their own area`, () => {
      for (const r of L.regions!) for (const id of chapters(w).find((c) => c.id === r.id)!.nodes) {
        const n = L.nodes.get(id)!;
        expect(n.x - MAP.r >= r.x && n.x + MAP.r <= r.x + r.w && n.y - MAP.r >= r.y && n.y + MAP.r + MAP.label.h <= r.y + r.h, id).toBe(true);
      }
    });
    it(`${w}: places do not overlap`, () => {
      const ns = [...L.nodes.values()];
      for (let i = 0; i < ns.length; i++) for (let j = i + 1; j < ns.length; j++) {
        const a = ns[i]!, b = ns[j]!;
        expect(Math.abs(a.x - b.x) > MAP.label.w - 4 || Math.abs(a.y - b.y) > MAP.rowH / 2, `${a.id} / ${b.id}`).toBe(true);
      }
    });
  }
});
