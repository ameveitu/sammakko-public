// Links between the three areas: which places of one area are needed in another.
// Shown on an area map as sea routes leaving each chapter, and on the area chooser
// as a whole-world overview where chapters are joined by sea routes.
import { requiredOf } from '../engine/graph';
import type { World } from '../engine/store';
import { store } from '../engine/store';
import { CHAPTERS, chapterOf, chaptersFor, worldInfo, WORLDS } from '../content/world';
import { NODES } from '../content';
import { h } from './dom';

export const SHORT: Record<World, { to: string; from: string; icon: string }> = {
  ranta: { to: 'Rannalle', from: 'Rannalta', icon: '🏖️' },
  saari: { to: 'Saaristoon', from: 'Saaristosta', icon: '🏝️' },
  lab: { to: 'Labraan', from: 'Labrasta', icon: '🧪' },
};
const RANK: Record<World, number> = { ranta: 0, saari: 1, lab: 2 };

/** One required relation that crosses from one area to another. */
export interface Crossing { from: string; to: string }

const all: Crossing[] = CHAPTERS.flatMap((c) => c.nodes.flatMap((to) =>
  requiredOf(to).filter((p) => chapterOf(p).world !== c.world).map((from) => ({ from, to }))));

/** Sea routes that leave a chapter of area `w` for other areas, or (for the foundation
 *  harbour) arrive from them. Grouped by the other area. */
export function routesOf(w: World, chapterId: string) {
  const ch = chaptersFor(w).find((c) => c.id === chapterId)!;
  const out = new Map<World, Crossing[]>(), inn = new Map<World, Crossing[]>();
  if (ch.quick) {
    // the foundation harbour holds places of earlier areas: show where they come from
    for (const id of ch.nodes) {
      const ow = chapterOf(id).world;
      inn.set(ow, [...(inn.get(ow) ?? []), { from: id, to: id }]);
    }
  } else {
    for (const x of all) if (ch.nodes.includes(x.from)) {
      const ow = chapterOf(x.to).world;
      out.set(ow, [...(out.get(ow) ?? []), x]);
    }
  }
  const sort = (m: Map<World, Crossing[]>) => [...m.entries()].sort((a, b) => RANK[a[0]] - RANK[b[0]]);
  return { out: sort(out), in: sort(inn) };
}

const distinct = (xs: string[]) => [...new Set(xs)];
export const placesLeaving = (xs: Crossing[]) => distinct(xs.map((x) => x.from));

/** Text lines for a sea-route sheet: which place here is needed where. */
export function routeLines(xs: Crossing[], incoming: boolean) {
  if (incoming) return distinct(xs.map((x) => x.from)).map((id) => `${NODES[id]!.icon} ${NODES[id]!.stop} (${chapterOf(id).name})`);
  const by = new Map<string, string[]>();
  for (const x of xs) by.set(x.from, [...(by.get(x.from) ?? []), x.to]);
  return [...by.entries()].map(([from, tos]) =>
    `${NODES[from]!.icon} ${NODES[from]!.stop} → ${distinct(tos).map((t) => `${NODES[t]!.stop} (${chapterOf(t).name})`).join(', ')}`);
}

// ------------------------------------------------------------ whole-world overview
const VW = 420;
const COLX: Record<World, number> = { ranta: 54, saari: 210, lab: 366 };
const PW = 98, PH = 32, ROW = 40, TOP = 48;
const HEAD: Record<World, string> = { ranta: 'Ranta', saari: 'Saaristo', lab: 'Labra' };

/** All three areas side by side, chapters as stops, and the sea routes between areas. */
export function worldOverview(color: Record<string, string>, onPick: (w: World, chapter: string) => void) {
  const pos = new Map<string, { x: number; y: number; w: World }>();
  for (const W of WORLDS) CHAPTERS.filter((c) => c.world === W.id).forEach((c, i) => pos.set(c.id, { x: COLX[W.id], y: TOP + i * ROW, w: W.id }));
  const H = Math.max(...[...pos.values()].map((p) => p.y)) + PH;
  // chapter → chapter, counted as relations
  const agg = new Map<string, number>();
  for (const x of all) { const k = `${chapterOf(x.from).id}>${chapterOf(x.to).id}`; agg.set(k, (agg.get(k) ?? 0) + 1); }
  let selected: string | null = null;
  const wrap = h('div', { class: 'overview', style: `aspect-ratio:${VW}/${H + 8}` });
  const svgBox = h('div', { class: 'overview-bg' });
  const info = h('div', { class: 'small overview-info', role: 'status' }, 'Paina lukua, niin näet sen merireitit.');

  function draw() {
    const paths: string[] = [];
    for (const [k, n] of agg) {
      const [a, b] = k.split('>') as [string, string];
      const p = pos.get(a)!, q = pos.get(b)!;
      const on = !selected || selected === a || selected === b;
      const x1 = p.x + PW / 2, x2 = q.x - PW / 2, mx = (x1 + x2) / 2;
      // a route that skips the middle area arcs over it
      const skip = RANK[q.w] - RANK[p.w] > 1;
      const d = skip
        ? `M${x1} ${p.y}C${x1 + 30} ${p.y} ${x1 + 10} ${TOP - 22} ${mx} ${TOP - 22}S${x2 - 30} ${q.y} ${x2} ${q.y}`
        : `M${x1} ${p.y}C${mx} ${p.y} ${mx} ${q.y} ${x2} ${q.y}`;
      paths.push(`<path d="${d}" stroke="${color[a] ?? '#2f7fa3'}" stroke-width="${Math.min(6, 1.4 + n * 0.7)}" stroke-dasharray="${skip ? '2 5' : '6 4'}" opacity="${on ? (selected ? 0.95 : 0.55) : 0.08}" fill="none" stroke-linecap="round"/>`);
    }
    const heads = WORLDS.map((W) => `<text x="${COLX[W.id]}" y="16" text-anchor="middle" font-size="12.5" font-weight="800" fill="currentColor">${SHORT[W.id].icon} ${HEAD[W.id]}</text>`).join('');
    svgBox.innerHTML = `<svg viewBox="0 0 ${VW} ${H + 8}" preserveAspectRatio="none" aria-hidden="true"><rect width="${VW}" height="${H + 8}" rx="16" fill="#cfeaf3"/>${WORLDS.map((W) => `<rect x="${COLX[W.id] - PW / 2 - 4}" y="24" width="${PW + 8}" height="${H - 18}" rx="14" fill="${W.id === 'ranta' ? '#f2e2b6' : W.id === 'saari' ? '#e6f2c9' : '#e4ebee'}"/>`).join('')}${paths.join('')}${heads}</svg>`;
    wrap.querySelectorAll<HTMLElement>('.ov-ch').forEach((b) => b.classList.toggle('sel', b.dataset.id === selected));
  }

  function pick(id: string) {
    selected = selected === id ? null : id;
    draw();
    if (!selected) { info.replaceChildren('Paina lukua, niin näet sen merireitit.'); return; }
    const c = CHAPTERS.find((x) => x.id === id)!;
    const outs = [...agg].filter(([k]) => k.startsWith(`${id}>`)).map(([k, n]) => ({ c: CHAPTERS.find((x) => x.id === k.split('>')[1])!, n }));
    const ins = [...agg].filter(([k]) => k.endsWith(`>${id}`)).map(([k, n]) => ({ c: CHAPTERS.find((x) => x.id === k.split('>')[0])!, n }));
    info.replaceChildren(...[
      h('b', {}, `${c.name} (${worldInfo(c.world).name})`),
      outs.length ? h('div', {}, `⛵ Tarvitaan myöhemmin: ${outs.map((o) => `${o.c.name} (${o.n})`).join(', ')}.`) : null,
      ins.length ? h('div', {}, `⛵ Pohjana: ${ins.map((o) => `${o.c.name} (${o.n})`).join(', ')}.`) : null,
      !outs.length && !ins.length ? h('div', {}, 'Tällä luvulla ei ole reittejä muille alueille.') : null,
      h('button', { type: 'button', class: 'small-btn btn', onclick: () => onPick(c.world, c.id) }, `Avaa kartalla: ${c.name}`)].filter((x) => x !== null));
  }

  wrap.append(svgBox);
  for (const c of CHAPTERS) {
    const p = pos.get(c.id)!;
    const lit = c.nodes.filter(store.lit).length;
    wrap.append(h('button', {
      type: 'button', class: `ov-ch${lit === c.nodes.length ? ' done' : ''}`, 'data-id': c.id,
      style: `left:${((p.x - PW / 2) / VW) * 100}%;top:${((p.y - PH / 2) / (H + 8)) * 100}%;width:${(PW / VW) * 100}%;height:${(PH / (H + 8)) * 100}%;--ch:${color[c.id]}`,
      'aria-label': `${c.name}, ${worldInfo(c.world).name}, ${lit}/${c.nodes.length} paikkaa loistaa`,
      onclick: () => pick(c.id),
    }, c.name));
  }
  draw();
  return h('div', { class: 'stack', style: 'gap:6px' }, wrap, info);
}
