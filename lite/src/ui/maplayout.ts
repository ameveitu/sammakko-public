// Layout of a world map: places are graph nodes, roads are required
// prerequisite relations. Pure geometry (no DOM), so it can be tested.
//
// Rows run top to bottom (prerequisites always above, at most `perRow` places
// per row). A long road runs through waypoints between the places of the rows
// it passes. Each row-to-row section of a road that would cross another road,
// or run over a place, becomes a curved dashed tunnel section.

export interface Pt { x: number; y: number }
export interface MapNode extends Pt { id: string; row: number }
export interface Section { kind: 'path' | 'tunnel' | 'ferry'; d: string; pts: Pt[] }
/** `route`: the road's points (start, waypoints, end), for other renderings. */
export interface MapEdge { from: string; to: string; sections: Section[]; portals: Pt[]; route: Pt[] }
/** A footpath for a soft (supporting) relation: drawn for places that have no road otherwise. */
export interface FootPath { from: string; to: string; d: string }
export interface Region { id: string; x: number; y: number; w: number; h: number }
export interface MapLayout { w: number; h: number; nodes: Map<string, MapNode>; edges: MapEdge[]; paths: FootPath[]; regions?: Region[] }

export const MAP = { w: 360, perRow: 3, rowH: 116, top: 56, r: 27, slot: 84, wp: 24, label: { w: 80, h: 30 }, x0: 0, y0: 0, rowBase: 0 };
export type MapOpts = typeof MAP;
const DEFAULTS = MAP;

const cubic = (a: Pt, c1: Pt, c2: Pt, b: Pt, t: number): Pt => {
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * b.x,
    y: u * u * u * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * b.y,
  };
};
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
const f = (n: number) => Math.round(n * 10) / 10;

function segCross(p1: Pt, p2: Pt, p3: Pt, p4: Pt) {
  const d = (a: Pt, b: Pt, c: Pt) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  const d1 = d(p3, p4, p1), d2 = d(p3, p4, p2), d3 = d(p1, p2, p3), d4 = d(p1, p2, p4);
  return d1 * d2 < 0 && d3 * d4 < 0;
}

/** Deterministic small jitter from an id, so the world looks hand-drawn but stable. */
const jitter = (id: string, amp: number) => {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0;
  return ((Math.abs(h) % 1000) / 1000 - 0.5) * 2 * amp;
};

/** One road section between consecutive rows; `bulge` > 0 bends it into a tunnel arc. */
function section(a: Pt, b: Pt, bulge = 0) {
  const k = Math.max(26, (b.y - a.y) * 0.5);
  const c1 = { x: a.x + bulge, y: a.y + k }, c2 = { x: b.x + bulge, y: b.y - k };
  const pts = Array.from({ length: 17 }, (_, i) => cubic(a, c1, c2, b, i / 16));
  return { pts, d: `C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(b.x)} ${f(b.y)}` };
}

/**
 * @param ids   places of this world, in topological order
 * @param preds required prerequisites of a place (only those inside `ids` are used)
 */
export function layoutWorld(ids: string[], preds: (id: string) => string[], opts: Partial<MapOpts> = {}, soft: (id: string) => string[] = () => []): MapLayout {
  const MAP = { ...DEFAULTS, ...opts };
  const inside = new Set(ids);
  const P = new Map(ids.map((id) => [id, preds(id).filter((p) => inside.has(p))]));
  const kidsOf = new Map<string, string[]>(ids.map((id) => [id, []]));
  for (const id of ids) for (const p of P.get(id)!) kidsOf.get(p)!.push(id);
  // A place without any road gets a footpath along a soft relation, and is placed next to it.
  const lonely = ids.filter((id) => !P.get(id)!.length && !kidsOf.get(id)!.length);
  const paths: { from: string; to: string }[] = [];
  const anchorUp = new Map<string, string[]>(), anchorDown = new Map<string, string[]>();
  for (const id of ids) for (const p of soft(id)) {
    if (!inside.has(p) || !(lonely.includes(id) || lonely.includes(p))) continue;
    paths.push({ from: p, to: id });
    (anchorUp.get(id) ?? anchorUp.set(id, []).get(id)!).push(p);
    (anchorDown.get(p) ?? anchorDown.set(p, []).get(p)!).push(id);
  }
  // Still alone (no road, no soft relation here): stepping stones to the neighbouring place.
  for (const id of lonely) {
    if (anchorUp.has(id) || anchorDown.has(id) || ids.length < 2) continue;
    const i = ids.indexOf(id);
    const [from, to] = i > 0 ? [ids[i - 1]!, id] : [id, ids[1]!];
    paths.push({ from, to });
    (anchorUp.get(to) ?? anchorUp.set(to, []).get(to)!).push(from);
    (anchorDown.get(from) ?? anchorDown.set(from, []).get(from)!).push(to);
  }
  const up0 = (id: string) => [...P.get(id)!, ...(lonely.includes(id) ? anchorUp.get(id) ?? [] : [])];
  const down0 = (id: string) => [...kidsOf.get(id)!, ...(lonely.includes(id) ? anchorDown.get(id) ?? [] : [])];

  // 1. rows: earliest row below all prerequisites that still has room ...
  const rowOf = new Map<string, number>();
  const count: number[] = [];
  for (const id of ids) {
    let r = Math.max(-1, ...up0(id).map((p) => rowOf.get(p) ?? -1)) + 1;
    while ((count[r] ?? 0) >= MAP.perRow) r++;
    rowOf.set(id, r);
    count[r] = (count[r] ?? 0) + 1;
  }
  // ... then pull each place down next to the first place that needs it: shorter roads.
  for (const id of [...ids].reverse()) {
    const ks = down0(id);
    if (!ks.length) continue;
    const cur = rowOf.get(id)!;
    for (let r = Math.min(...ks.map((k) => rowOf.get(k)!)) - 1; r > cur; r--) {
      if ((count[r] ?? 0) < MAP.perRow) { count[cur]!--; count[r] = (count[r] ?? 0) + 1; rowOf.set(id, r); break; }
    }
  }
  // drop rows that became empty
  const used = [...new Set(rowOf.values())].sort((a, b) => a - b);
  for (const id of ids) rowOf.set(id, used.indexOf(rowOf.get(id)!));
  const nRows = used.length;

  // 2. waypoints for roads that skip rows
  type Item = { key: string; real: boolean };
  const rows: Item[][] = Array.from({ length: nRows }, () => []);
  for (const id of ids) rows[rowOf.get(id)!]!.push({ key: id, real: true });
  const chains = ids.flatMap((id) => P.get(id)!.map((p) => {
    const keys = [p];
    for (let r = rowOf.get(p)! + 1; r < rowOf.get(id)!; r++) {
      const k = `${p}>${id}@${r}`;
      rows[r]!.push({ key: k, real: false });
      keys.push(k);
    }
    keys.push(id);
    return { from: p, to: id, keys };
  }));
  const up = new Map<string, string[]>(), down = new Map<string, string[]>();
  for (const c of chains) for (let i = 0; i < c.keys.length - 1; i++) {
    const a = c.keys[i]!, b = c.keys[i + 1]!;
    (down.get(a) ?? down.set(a, []).get(a)!).push(b);
    (up.get(b) ?? up.set(b, []).get(b)!).push(a);
  }

  // 3. order inside rows: barycentre sweeps (fewer crossings)
  const pos = new Map<string, number>();
  const reindex = (row: Item[]) => row.forEach((it, i) => pos.set(it.key, (i + 0.5) / row.length));
  rows.forEach(reindex);
  for (let sweep = 0; sweep < 8; sweep++) {
    const goingDown = sweep % 2 === 0;
    for (const row of goingDown ? rows : [...rows].reverse()) {
      const key = new Map(row.map((it) => {
        const nb = (goingDown ? up : down).get(it.key) ?? [];
        return [it.key, nb.length ? nb.reduce((s, x) => s + pos.get(x)!, 0) / nb.length : pos.get(it.key)!];
      }));
      row.sort((a, b) => key.get(a.key)! - key.get(b.key)!);
      reindex(row);
    }
  }

  // 4. coordinates: places take a full slot, waypoints a narrow one
  const xy = new Map<string, Pt>();
  const nodes = new Map<string, MapNode>();
  rows.forEach((row, r) => {
    const room = MAP.w - 16;
    const reals = row.filter((it) => it.real).length, wps = row.length - reals;
    // Waypoints give way first; places keep their slot as long as possible.
    // Waypoints may bundle tightly (roads run side by side); a place never shrinks below its sign.
    const wp = wps ? Math.max(2, Math.min(MAP.wp, (room - reals * MAP.slot) / wps)) : 0;
    const slot = Math.max(MAP.label.w, Math.min(MAP.slot, (room - wps * wp) / Math.max(1, reals)));
    const width = (it: Item) => (it.real ? slot : wp);
    const total = row.reduce((s, it) => s + width(it), 0);
    const squeeze = 1;
    const shift = total < room - 40 ? (r % 2 ? 1 : -1) * Math.min(26, (room - total) / 4) : 0;
    let x = MAP.x0 + (MAP.w - total) / 2 + shift;
    const y = MAP.y0 + MAP.top + r * MAP.rowH;
    for (const it of row) {
      const wdt = width(it) * squeeze;
      const p = { x: x + wdt / 2 + (it.real ? jitter(it.key, Math.min(reals < 3 ? 8 : 3, (slot - MAP.label.w) / 2 - 1)) : 0), y: y + (it.real ? jitter(it.key + 'y', 8) : 0) };
      xy.set(it.key, p);
      if (it.real) nodes.set(it.key, { id: it.key, row: MAP.rowBase + r, ...p });
      x += wdt;
    }
  });
  const h = MAP.top + (nRows - 1) * MAP.rowH + MAP.r + MAP.label.h + 34;

  // 5. roads: short simple roads claim the ground first; crossing sections tunnel
  chains.sort((a, b) => a.keys.length - b.keys.length || dist(xy.get(a.from)!, xy.get(a.to)!) - dist(xy.get(b.from)!, xy.get(b.to)!));
  const ground: { pts: Pt[]; ends: Pt[] }[] = [];
  const hits = (pts: Pt[], ends: string[]) => {
    for (const n of nodes.values()) {
      if (ends.includes(n.id)) continue;
      // Running behind a sign is fine (the sign covers it); over a place is not.
      for (const p of pts) if (dist(p, n) < MAP.r + 6) return true;
    }
    return false;
  };
  const crosses = (pts: Pt[], endPts: Pt[]) => ground.some((g) => {
    const near = (p: Pt) => [...endPts, ...g.ends].some((e) => dist(p, e) < MAP.r + 8);
    for (let i = 0; i < pts.length - 1; i++) {
      if (near(pts[i]!) || near(pts[i + 1]!)) continue;
      for (let j = 0; j < g.pts.length - 1; j++) if (segCross(pts[i]!, pts[i + 1]!, g.pts[j]!, g.pts[j + 1]!)) return true;
    }
    return false;
  });

  const edges: MapEdge[] = chains.map((c) => {
    const sections: Section[] = [];
    const portals: Pt[] = [];
    for (let i = 0; i < c.keys.length - 1; i++) {
      const a = xy.get(c.keys[i]!)!, b = xy.get(c.keys[i + 1]!)!;
      const ends = [c.keys[i]!, c.keys[i + 1]!];
      const plain = section(a, b);
      if (!hits(plain.pts, ends) && !crosses(plain.pts, [a, b])) {
        ground.push({ pts: plain.pts, ends: [a, b] });
        sections.push({ kind: 'path', ...plain });
        continue;
      }
      const side = (a.x + b.x) / 2 > MAP.x0 + MAP.w / 2 ? 1 : -1;
      const arc = section(a, b, side * 30);
      sections.push({ kind: 'tunnel', ...arc });
    }
    // portals where a road goes under ground and comes back up
    sections.forEach((s, i) => {
      if (s.kind !== 'tunnel') return;
      const start = c.keys[i]!, end = c.keys[i + 1]!;
      const startPt = xy.get(start)!, endPt = xy.get(end)!;
      const pad = (k: string) => (nodes.has(k) ? MAP.r + 9 : 0);
      if (sections[i - 1]?.kind !== 'tunnel') portals.push(s.pts.find((p) => dist(p, startPt) > pad(start)) ?? startPt);
      if (sections[i + 1]?.kind !== 'tunnel') portals.push([...s.pts].reverse().find((p) => dist(p, endPt) > pad(end)) ?? endPt);
    });
    const s0 = xy.get(c.from)!;
    sections.forEach((s, i) => { s.d = `M${f((i ? sections[i - 1]!.pts.at(-1)! : s0).x)} ${f((i ? sections[i - 1]!.pts.at(-1)! : s0).y)}${s.d}`; });
    return { from: c.from, to: c.to, sections, portals, route: c.keys.map((k) => xy.get(k)!) };
  });
  const foot = paths.map((p) => {
    const [a, b] = [xy.get(p.from)!, xy.get(p.to)!].sort((m, n) => m.y - n.y) as [Pt, Pt];
    return { ...p, d: `M${f(a.x)} ${f(a.y)}${section(a, b).d}` };
  });
  return { w: MAP.w, h, nodes, edges, paths: foot };
}

/**
 * A world split into areas (one per chapter), stacked top to bottom so that every
 * relation points downwards. Roads inside an area are laid out as usual and stay short;
 * a relation between areas runs along a shared lane at the side of the map
 * (a ferry route, a boardwalk or a corridor, depending on the world).
 */
export function layoutRegions(groups: { id: string; nodes: string[] }[], preds: (id: string) => string[], soft: (id: string) => string[] = () => [], opts: Partial<MapOpts> = {}): MapLayout {
  const M = { ...DEFAULTS, ...opts };
  const lane = 30, gap = 40, innerW = M.w - 2 * lane;
  const islandOf = new Map(groups.flatMap((g) => g.nodes.map((n) => [n, g.id])));
  // areas in an order where every relation between them points down (stable topological sort)
  const after = new Map(groups.map((g) => [g.id, new Set<string>()]));
  for (const g of groups) for (const n of g.nodes) for (const p of preds(n)) {
    const pg = islandOf.get(p);
    if (pg && pg !== g.id) after.get(g.id)!.add(pg);
  }
  const ordered: typeof groups = [];
  const left = [...groups];
  while (left.length) {
    const i = left.findIndex((g) => [...after.get(g.id)!].every((p) => ordered.some((o) => o.id === p)));
    ordered.push(...left.splice(i < 0 ? 0 : i, 1));
  }
  const nodes = new Map<string, MapNode>();
  const edges: MapEdge[] = [], paths: FootPath[] = [], regions: Region[] = [];
  let y = 22, rowBase = 0;
  for (const g of ordered) {
    const L = layoutWorld(g.nodes, preds, { ...opts, w: innerW, x0: lane, y0: y, rowBase, top: 62 }, soft);
    L.nodes.forEach((n, k) => nodes.set(k, n));
    edges.push(...L.edges);
    paths.push(...L.paths);
    const rh = L.h - 10;
    regions.push({ id: g.id, x: lane, y, w: innerW, h: rh });
    rowBase = Math.max(...[...L.nodes.values()].map((n) => n.row)) + 1;
    y += rh + gap;
  }
  const h = y - gap + 22;
  const cross = ordered.flatMap((g) => g.nodes.flatMap((to) => preds(to).filter((p) => islandOf.has(p) && islandOf.get(p) !== g.id).map((from) => ({ from, to }))));
  // All ferries on one side share a single shipping lane; they only branch off to their docks.
  for (const c of cross) {
    const a = nodes.get(c.from)!, b = nodes.get(c.to)!;
    const left = a.x + b.x < M.w, sx = left ? 1 : -1;
    const lx = left ? 15 : M.w - 15;
    // leave through the gap below the source row, arrive through the gap above the target row
    const y1 = a.y + 62, y2 = b.y - 62, R = 10;
    const pts: Pt[] = [a, { x: a.x, y: y1 }, { x: lx, y: y1 }, { x: lx, y: y2 }, { x: b.x, y: y2 }, b];
    const d = `M${f(a.x)} ${f(a.y)}V${f(y1 - R)}Q${f(a.x)} ${f(y1)} ${f(a.x - sx * R)} ${f(y1)}H${f(lx + sx * R)}Q${f(lx)} ${f(y1)} ${f(lx)} ${f(y1 + R)}V${f(y2 - R)}Q${f(lx)} ${f(y2)} ${f(lx + sx * R)} ${f(y2)}H${f(b.x - sx * R)}Q${f(b.x)} ${f(y2)} ${f(b.x)} ${f(y2 + R)}V${f(b.y)}`;
    edges.push({ from: c.from, to: c.to, sections: [{ kind: 'ferry', d, pts }], portals: [], route: pts });
  }
  // Stepping stones only where a place would otherwise have no road at all.
  const roaded = new Set(edges.flatMap((e) => [e.from, e.to]));
  const stones = paths.filter((p) => !roaded.has(p.from) || !roaded.has(p.to));
  return { w: M.w, h, nodes, edges, paths: stones, regions };
}
