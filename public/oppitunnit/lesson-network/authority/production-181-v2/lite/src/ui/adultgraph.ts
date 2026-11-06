// Adult view: the whole implemented subgraph as a technical layered graph,
// in the visual language of the STEM KC overview (subject colours, relation
// type colours, strength dashes). Stars mark what has been checked.
import { KCS, kc, ORDER, requiredOf, type KC } from '../engine/graph';
import { store } from '../engine/store';
import { NODES } from '../content';
import { btn, h } from './dom';
import { layoutWorld, type Pt } from './maplayout';

const SUBJECT: Record<string, { fill: string; stroke: string; name: string }> = {
  mathematics: { fill: '#4F83FF', stroke: '#1F4DB8', name: 'Matematiikka' },
  physics: { fill: '#FF9F43', stroke: '#C56A00', name: 'Fysiikka' },
  science: { fill: '#7BC8A4', stroke: '#2A7D5B', name: 'Ympäristöoppi' },
};
const TYPE: Record<string, { color: string; name: string }> = {
  prerequisite: { color: '#D62828', name: 'esitieto' },
  representation_support: { color: '#1B9AAA', name: 'esitystavan tuki' },
  process_support: { color: '#2A9D8F', name: 'prosessin tuki' },
};
const DASH: Record<string, string> = { required: '', strong: '7 3', helpful: '2 4' };
const STRENGTH: Record<string, string> = { required: 'pakollinen', strong: 'vahva', helpful: 'hyödyllinen' };

const RX = 80, RY = 25, COL = 250, OUT_X = 90;
const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const short = (t: string, n: number) => (t.length > n ? `${t.slice(0, n - 1)}…` : t);
const f = (n: number) => Math.round(n);

/** Bezier with horizontal tangents through route points. */
function curve(pts: Pt[]) {
  let d = `M${f(pts[0]!.x)} ${f(pts[0]!.y)}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!, b = pts[i]!, k = (b.x - a.x) * 0.45;
    d += `C${f(a.x + k)} ${f(a.y)} ${f(b.x - k)} ${f(b.y)} ${f(b.x)} ${f(b.y)}`;
  }
  return d;
}

function layout() {
  const L = layoutWorld(ORDER, requiredOf, { w: 1600, perRow: 99, rowH: COL, slot: 64, wp: 14, r: 26, top: 0 }, (id) => kc(id).soft);
  const ys = [...L.nodes.values()].map((n) => n.x);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const T = (p: Pt): Pt => ({ x: p.y + RX + 30 + OUT_X * 2, y: p.x - minY + RY + 60 });
  const pos = new Map([...L.nodes.values()].map((n) => [n.id, T(n)]));
  const routes = new Map(L.edges.map((e) => [`${e.from}>${e.to}`, e.route.map(T)]));
  const width = Math.max(...[...pos.values()].map((p) => p.x)) + RX + 30;
  return { pos, routes, width, height: maxY - minY + 2 * RY + 120 };
}
let cached: ReturnType<typeof layout> | undefined;

/** Everything a node builds on, through every relation in the subgraph, down to the roots. */
function lineage(id: string) {
  const up = new Set<string>(), down = new Set<string>();
  const walkUp = (x: string) => { for (const r of kc(x).rel) if (!up.has(r.id)) { up.add(r.id); walkUp(r.id); } };
  const walkDown = (x: string) => { for (const k of KCS) if (k.rel.some((r) => r.id === x) && !down.has(k.id)) { down.add(k.id); walkDown(k.id); } };
  walkUp(id); walkDown(id);
  const roots = [...up].filter((x) => kc(x).rel.length === 0);
  return { up, down, roots };
}

function stars(k: KC, p: Pt) {
  const st = store.state(k.id);
  const star = (x: number, fill: string, stroke: string) =>
    `<path transform="translate(${x} ${p.y - RY + 3}) scale(.85)" d="M0-11l3.2 6.6 7.2.9-5.3 5 1.4 7.2L0 4.3l-6.5 3.4 1.4-7.2-5.3-5 7.2-.9z" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
  const x = p.x + RX - 26;
  if (st.checked) return star(x, '#F4C542', '#9a6b00') + (st.retained !== undefined ? star(x + 17, '#F4C542', '#9a6b00') : '');
  if (st.helped) return star(x, '#9fd8b8', '#2a7d5b');
  if (store.inferred(k.id)) return star(x, '#fff', '#7a5cc2');
  return '';
}

export function adultGraph(onOpen: (id: string) => void) {
  const G = (cached ??= layout());
  let zoom = 0.55;
  let selected: string | null = null;
  let lin: ReturnType<typeof lineage> | null = null;
  const holder = h('div', { class: 'graph-wrap' });
  const info = h('div', { class: 'graph-info card small' }, 'Valitse noodi nähdäksesi tiedot.');

  function edgesSvg() {
    const out: string[] = [];
    for (const k of KCS) {
      for (const r of k.rel) {
        const from = G.pos.get(r.id), to = G.pos.get(k.id);
        if (!from || !to) continue;
        const route = G.routes.get(`${r.id}>${k.id}`);
        const pts = route ? [...route] : [from, to];
        pts[0] = { x: pts[0]!.x + RX, y: pts[0]!.y };
        pts[pts.length - 1] = { x: pts.at(-1)!.x - RX - 6, y: pts.at(-1)!.y };
        // the whole lineage of the selected node stands out: its ancestry fully, what builds on it lightly
        const upE = lin && (k.id === selected || lin.up.has(k.id)) && lin.up.has(r.id);
        const downE = lin && (r.id === selected || lin.down.has(r.id)) && lin.down.has(k.id);
        const op = !selected ? 0.85 : upE ? 0.95 : downE ? 0.5 : 0.07;
        out.push(`<path d="${curve(pts)}" stroke="${TYPE[r.type]?.color ?? '#888'}" stroke-width="${upE ? 3.4 : downE ? 2.2 : 1.8}" stroke-dasharray="${DASH[r.strength] ?? ''}" opacity="${op}" marker-end="url(#arr-${r.type})"/>`);
      }
    }
    return `<g fill="none">${out.join('')}</g>`;
  }

  function nodesSvg() {
    const out: string[] = [];
    for (const k of KCS) {
      const p = G.pos.get(k.id)!, c = SUBJECT[k.subject] ?? SUBJECT.science!;
      const known = store.known(k.id);
      const inUp = !!lin && lin.up.has(k.id), inDown = !!lin && lin.down.has(k.id);
      const op = !selected || selected === k.id || inUp ? (known || selected ? 1 : 0.8) : inDown ? 0.55 : 0.15;
      const root = inUp && k.rel.length === 0;
      out.push(`<g class="gnode" data-id="${k.id}" opacity="${op}" tabindex="0" role="button" aria-label="${esc(k.id)} ${esc(k.title)}">
        ${inUp || selected === k.id ? `<ellipse cx="${p.x}" cy="${p.y}" rx="${RX + 7}" ry="${RY + 7}" fill="${selected === k.id ? '#ffe27a' : '#fff3b0'}" stroke="${root ? '#b8860b' : 'none'}" stroke-width="2.5" stroke-dasharray="${root ? '5 3' : ''}"/>` : ''}
        <ellipse cx="${p.x}" cy="${p.y}" rx="${RX}" ry="${RY}" fill="${c.fill}" fill-opacity="${known ? 0.95 : 0.4}" stroke="${selected === k.id ? '#111' : c.stroke}" stroke-width="${selected === k.id ? 3.5 : 2}"/>
        <text x="${p.x}" y="${p.y - 4}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#0f1720">${esc(short(k.id, 26))}</text>
        <text x="${p.x}" y="${p.y + 10}" text-anchor="middle" font-size="9.5" fill="#0f1720">${esc(short(k.title, 30))}</text>
        ${stars(k, p)}</g>`);
    }
    return out.join('');
  }

  function draw() {
    const markers = Object.entries(TYPE).map(([t, v]) => `<marker id="arr-${t}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${v.color}"/></marker>`).join('');
    holder.innerHTML = `<svg viewBox="0 0 ${G.width} ${G.height}" width="${G.width * zoom}" height="${G.height * zoom}" role="img" aria-label="Toteutuksen aligraafi: ${KCS.length} noodia">
      <defs>${markers}</defs><rect width="${G.width}" height="${G.height}" fill="#fbfcfe"/>
      ${edgesSvg()}${nodesSvg()}</svg>`;
    holder.querySelectorAll<SVGGElement>('.gnode').forEach((g) => {
      const pick = () => { if (!justDragged) select(g.dataset.id!); };
      g.addEventListener('click', pick);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
  }

  function select(id: string, center = false) {
    selected = selected === id ? null : id;
    lin = selected ? lineage(selected) : null;
    draw();
    if (!selected) { info.replaceChildren('Valitse noodi nähdäksesi tiedot.'); return; }
    if (center) centerOn(id);
    const k = kc(id), st = store.state(id), spec = NODES[id]!;
    const src = store.inferredFrom(id);
    const state = st.checked ? `tarkistettu ★${st.retained !== undefined ? '★ (muistettu tauon jälkeen)' : ''}${st.quick ? ' (pikatarkistus)' : ''}`
      : st.helped ? 'harjoiteltu avun kanssa 🤝'
      : src.length ? `päätelty ☆ (lähde: ${src.join(', ')}; ei kysytty erikseen)` : store.deferred(id) ? 'jätetty myöhemmäksi' : 'ei vielä tarkistettu';
    const line = (label: string, rels: KC['rel'], inside: boolean) => rels.length
      ? h('div', {}, h('b', {}, label), ' ', ...rels.flatMap((r, i) => [i ? ', ' : '', inside
        ? h('a', { href: '#aikuiselle', onclick: (e: Event) => { e.preventDefault(); select(r.id, true); } }, r.id)
        : r.id, ` (${TYPE[r.type]?.name ?? r.type}, ${STRENGTH[r.strength] ?? r.strength})`]))
      : null;
    const out = KCS.filter((x) => x.rel.some((r) => r.id === id)).map((x) => ({ ...x.rel.find((r) => r.id === id)!, id: x.id }));
    info.replaceChildren(...[
      h('div', { class: 'row' }, h('code', {}, id), h('span', { class: 'muted' }, `${SUBJECT[k.subject]?.name ?? k.subject} · ${k.grade} lk · ${k.kind}`)),
      h('div', { style: 'font-weight:700;margin:4px 0' }, k.title),
      h('div', {}, `Lapselle: ${spec.icon} ${spec.stop}. Tila: ${state}${st.difficulty ? ' · viime aikoina vaikeaa' : ''}`),
      line('Tulevat:', k.rel, true),
      line('Lähtevät:', out, true),
      h('div', {}, h('b', {}, 'Esihistoria: '), `${lin!.up.size} noodia (kaikki suhteet juuriin asti, korostettu keltaisella).`,
        lin!.roots.length ? h('span', {}, ' Juuret: ', ...lin!.roots.flatMap((r, i) => [i ? ', ' : '', h('a', { href: '#aikuiselle', onclick: (e: Event) => { e.preventDefault(); select(r, true); } }, r)])) : ' Tämä on itse juuri.'),
      h('div', {}, h('b', {}, 'Rakentuu tämän päälle: '), `${lin!.down.size} noodia (himmeämmin).`),
      h('div', { class: 'row', style: 'margin-top:8px' }, btn('', 'Näytä koko esihistoria', () => fit([id, ...lin!.up]), 'small-btn'), btn('', 'Avaa oppitunti', () => onOpen(id), 'small-btn')),
    ].filter((x) => x !== null));
  }

  const legend = h('div', { class: 'graph-legend small' },
    ...Object.values(SUBJECT).map((s) => h('span', {}, h('i', { style: `background:${s.fill};border-color:${s.stroke}` }), s.name)),
    ...Object.entries(TYPE).filter(([t]) => t !== 'process_support').map(([, t]) => h('span', {}, h('b', { style: `background:${t.color}` }), t.name)),
    h('span', { html: '<svg width="34" height="8"><path d="M0 4H34" stroke="currentColor" stroke-width="2"/></svg>' }, 'pakollinen'),
    h('span', { html: '<svg width="34" height="8"><path d="M0 4H34" stroke="currentColor" stroke-width="2" stroke-dasharray="7 3"/></svg>' }, 'vahva'),
    h('span', {}, '★ tarkistettu · ★★ muistettu · 🤝 avulla · ☆ päätelty'));

  /** Zoom around a point of the visible area (default: its centre), keeping that point still. */
  const zoomBy = (z: number, cx = holder.clientWidth / 2, cy = holder.clientHeight / 2) => {
    const next = Math.min(1.6, Math.max(0.2, zoom * z));
    const gx = (holder.scrollLeft + cx) / zoom, gy = (holder.scrollTop + cy) / zoom;
    zoom = next;
    draw();
    holder.scrollLeft = gx * zoom - cx;
    holder.scrollTop = gy * zoom - cy;
  };
  /** Zoom and scroll so that all the given nodes fit in view. */
  function fit(ids: string[]) {
    const ps = ids.map((i) => G.pos.get(i)!);
    const x0 = Math.min(...ps.map((p) => p.x)) - RX - 20, x1 = Math.max(...ps.map((p) => p.x)) + RX + 20;
    const y0 = Math.min(...ps.map((p) => p.y)) - RY - 20, y1 = Math.max(...ps.map((p) => p.y)) + RY + 20;
    zoom = Math.min(1.2, Math.max(0.2, Math.min(holder.clientWidth / (x1 - x0), holder.clientHeight / (y1 - y0))));
    draw();
    holder.scrollTo({ left: ((x0 + x1) / 2) * zoom - holder.clientWidth / 2, top: ((y0 + y1) / 2) * zoom - holder.clientHeight / 2 });
  }
  function centerOn(id: string) {
    const p = G.pos.get(id)!;
    holder.scrollTo({ left: p.x * zoom - holder.clientWidth / 2, top: p.y * zoom - holder.clientHeight / 2, behavior: 'smooth' });
  }

  // Pan by dragging with the mouse or pen (touch already scrolls natively); a drag is not a click.
  let justDragged = false;
  let drag: { x: number; y: number; l: number; t: number; moved: boolean } | null = null;
  holder.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch' || e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, l: holder.scrollLeft, t: holder.scrollTop, moved: false };
  });
  holder.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 5) return;
    if (!drag.moved) { drag.moved = true; holder.setPointerCapture(e.pointerId); holder.classList.add('dragging'); }
    holder.scrollLeft = drag.l - dx;
    holder.scrollTop = drag.t - dy;
  });
  const endDrag = () => {
    if (drag?.moved) { holder.classList.remove('dragging'); justDragged = true; setTimeout(() => { justDragged = false; }, 0); }
    drag = null;
  };
  holder.addEventListener('pointerup', endDrag);
  holder.addEventListener('pointercancel', endDrag);
  // Ctrl/⌘ + wheel or a trackpad pinch zooms around the pointer; a plain wheel scrolls.
  holder.addEventListener('wheel', (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const r = holder.getBoundingClientRect();
    zoomBy(Math.exp(-e.deltaY * 0.0025), e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
  draw();
  return h('section', { class: 'stack' },
    h('h2', {}, 'Toteutuksen aligraafi'),
    h('p', { class: 'small muted' }, `${KCS.length} noodia ja ${KCS.reduce((s, k) => s + k.rel.length, 0)} suhdetta STEM-KC-graafista. Vasemmalta oikealle esitiedoista eteenpäin. Väri = oppiaine, viivan väri = suhteen tyyppi, katkoviiva = vahva (ei pakollinen) suhde. Himmeä noodi = ei vielä tarkistettu.`),
    legend,
    h('div', { class: 'row' }, btn('', '−', () => zoomBy(1 / 1.25), 'small-btn'), btn('', '+', () => zoomBy(1.25), 'small-btn'),
      h('span', { class: 'small muted' }, 'Vedä hiirellä siirtääksesi, Ctrl/⌘ + rulla zoomaa. Valitse noodi: sen koko esihistoria juuriin asti korostuu.')),
    holder, info);
}
