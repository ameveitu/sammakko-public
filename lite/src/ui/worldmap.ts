// The child's world map: one area per chapter, places joined by roads made of
// prerequisite relations. Known places glow; unexplored land lies under fog.
import { artUrl, spriteSvg } from './sprite';
import { ancestors, isUnlocked, kc, ORDER, requiredOf } from '../engine/graph';
import { store, type World } from '../engine/store';
import { NODES } from '../content';
import { chapterIn, chaptersFor, openIn, worldInfo } from '../content/world';
import { ICON, sulka, svg } from './art';
import { btn, h } from './dom';
import { layoutRegions, MAP, type MapLayout } from './maplayout';
import { say } from './speech';
import { placesLeaving, routeLines, routesOf, SHORT, type Crossing } from './worldlinks';
import type { Mode } from './lesson';

export const CHAPTER_COLOR: Record<string, string> = {
  loru: '#e0533f', mitat: '#3b7fd6', evaat: '#e39a1b', kivet: '#2f8f6b', merkit: '#c2457a', simpukat: '#d06a8a', kympit: '#1f8fa3', kertopaja: '#6a8f2f',
  kauppa: '#b7791f', lajittelu: '#4a6fa5', vihko: '#8a5cc2',
  pohja: '#8d8a7c',
  aarre: '#c0392b', talvi: '#3a86c8', veistamo: '#8a5a2b', majakka: '#d0443a', helmet: '#3a9a9a', tori: '#d9822b', piirakka: '#c2457a', vaaka: '#2f8f6b', asema: '#6a5acd',
  suureet: '#3b7fd6', nopeus: '#e0533f', lauseke: '#b0569a', yhtalot: '#2f8f6b', funktiot: '#c2457a', kuvaajat: '#1f8fa3', luvut: '#4a6fa5', kiihtyvyys: '#8a5cc2',
};

const layouts = new Map<World, MapLayout>();
export function worldIds(w: World) {
  const inWorld = new Set(chaptersFor(w).flatMap((c) => c.nodes));
  return ORDER.filter((id) => inWorld.has(id));
}
const soft = (id: string) => kc(id).soft;
function layout(w: World) {
  let L = layouts.get(w);
  if (!L) {
    L = layoutRegions(chaptersFor(w).map((c) => ({ id: c.id, nodes: ORDER.filter((n) => c.nodes.includes(n)) })), requiredOf, soft);
    layouts.set(w, L);
  }
  return L;
}

/** How a place opens when tapped (and how the green button opens it). */
export function modeFor(w: World, id: string): Mode {
  const known = store.known(id);
  if (store.due(id)) return 'retrieval';
  if (store.checked(id)) return 'practice';
  if (chapterIn(w, id)?.quick && !known) return 'quick';
  if (!known && !isUnlocked(id, store.known)) return 'leap';
  return 'learn';
}

let sceneryId = 0;

/** Decorations: the ground, one area per chapter, and small details in the gaps. */
function scenery(w: World, L: MapLayout) {
  const out: string[] = [];
  const prefix = `launch-art-${w}-${sceneryId++}`;
  const texture = (name: 'water' | 'sand' | 'grass') => `url(#${prefix}-${name})`;
  if (w !== 'lab') {
    const colors = { water: w === 'saari' ? '#7cc4dd' : '#9fd0e3', sand: '#f2e2b6', grass: '#cfe6b4' };
    out.push(`<defs>${(['water', 'sand', 'grass'] as const).map((name) => `<pattern id="${prefix}-${name}" width="128" height="128" patternUnits="userSpaceOnUse"><rect width="128" height="128" fill="${colors[name]}"/><image href="${artUrl(`textures/${name}.webp`)}" width="128" height="128" opacity="${name === 'grass' ? '.16' : '.24'}"/></pattern>`).join('')}</defs>`);
  }
  const R = L.regions ?? [];
  const gaps = R.slice(0, -1).map((r) => r.y + r.h + 20);
  if (w === 'ranta') {
    // a sandy shore with a lake on both sides; chapters are meadows, joined by boardwalks
    out.push(`<rect width="${L.w}" height="${L.h}" fill="${texture('sand')}"/>`);
    out.push(`<path d="M0 0H22C12 ${L.h * 0.25} 26 ${L.h * 0.5} 14 ${L.h * 0.75}S20 ${L.h} 22 ${L.h}H0z" fill="${texture('water')}"/><path d="M${L.w} 0H${L.w - 22}C${L.w - 10} ${L.h * 0.3} ${L.w - 26} ${L.h * 0.55} ${L.w - 14} ${L.h * 0.8}S${L.w - 20} ${L.h} ${L.w - 22} ${L.h}H${L.w}z" fill="${texture('water')}"/>`);
    for (const r of R) {
      out.push(`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="40" fill="#bcdc9b"/>`);
      out.push(`<rect x="${r.x + 7}" y="${r.y + 7}" width="${r.w - 14}" height="${r.h - 14}" rx="34" fill="${texture('grass')}"/>`);
      for (let i = 0; i < r.h / 90; i++) {
        const x = r.x + 18 + ((i * 97) % (r.w - 36)), y = r.y + 30 + ((i * 61) % (r.h - 50));
        out.push(`<path d="M${x} ${y}l3 -8M${x + 5} ${y}l0 -10M${x + 10} ${y}l-3 -8" stroke="#9cc77e" stroke-width="2" stroke-linecap="round"/>`);
      }
      out.push(`<path d="M${r.x + 6} ${r.y + r.h - 20}q-2 -16 3 -26M${r.x + 12} ${r.y + r.h - 18}q2 -14 -1 -22M${r.x + r.w - 8} ${r.y + 34}q2 -16 -3 -24" stroke="#5f9e4a" stroke-width="3" fill="none" stroke-linecap="round"/>`);
    }
    gaps.forEach((y, i) => out.push(`<g transform="translate(${i % 2 ? 250 : 110} ${y})"><circle r="4" fill="#fff" opacity=".8"/><circle cx="14" cy="5" r="3" fill="#f5c9a8"/><path d="M-30 4q6 -5 12 0" stroke="#d8c08a" stroke-width="2" fill="none"/></g>`));
  } else if (w === 'saari') {
    out.push(`<rect width="${L.w}" height="${L.h}" fill="${texture('water')}"/>`);
    for (const r of R) {
      const quick = r.id === 'pohja';
      out.push(`<rect x="${r.x - 7}" y="${r.y - 7}" width="${r.w + 14}" height="${r.h + 14}" rx="60" fill="#bfe8f2" opacity=".8"/>`);
      out.push(`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="54" fill="${texture('sand')}"/>`);
      out.push(`<rect x="${r.x + 11}" y="${r.y + 11}" width="${r.w - 22}" height="${r.h - 22}" rx="44" fill="${quick ? '#d8e6b8' : texture('grass')}"/>`);
      for (const [px, py, flip] of [[r.x + 20, r.y + r.h - 26, 1], [r.x + r.w - 20, r.y + 30, -1]] as const) {
        out.push(`<path d="M${px} ${py}q${3 * flip} -14 ${-2 * flip} -26" stroke="#8a6a44" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M${px - 2 * flip} ${py - 26}q-12 -6 -18 4M${px - 2 * flip} ${py - 26}q12 -8 18 2M${px - 2 * flip} ${py - 26}q-2 -12 -10 -14" stroke="#3f9b54" stroke-width="5" fill="none" stroke-linecap="round"/>`);
      }
      if (quick) out.push(`<path d="M${r.x + r.w / 2 - 30} ${r.y + r.h}v16M${r.x + r.w / 2 + 30} ${r.y + r.h}v16M${r.x + r.w / 2 - 36} ${r.y + r.h + 4}h72" stroke="#8a6a44" stroke-width="5" stroke-linecap="round"/>`);
    }
    gaps.forEach((y, i) => out.push(`<g transform="translate(${i % 2 ? 250 : 100} ${y})"><path d="M-12 0h24l-5 6h-14z" fill="#8a5a3c"/><path d="M0 -1v-16l9 13z" fill="#fff"/></g>`));
  } else {
    // the lab: tiled floor, one room per chapter, joined by pipes along the walls
    out.push(`<defs><pattern id="tiles" width="30" height="30" patternUnits="userSpaceOnUse"><rect width="30" height="30" fill="#d3dde1"/><path d="M30 0H0V30" fill="none" stroke="#c2cfd4" stroke-width="1.5"/></pattern></defs>`);
    out.push(`<rect width="${L.w}" height="${L.h}" fill="url(#tiles)"/>`);
    for (const r of R) {
      out.push(`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="18" fill="#f4f7f8" stroke="#9fb2ba" stroke-width="6"/>`);
      out.push(`<rect x="${r.x + r.w - 54}" y="${r.y + r.h - 40}" width="40" height="24" rx="5" fill="#dfe7ea"/><circle cx="${r.x + r.w - 44}" cy="${r.y + r.h - 28}" r="6" fill="#7fc6b3"/><rect x="${r.x + r.w - 32}" y="${r.y + r.h - 36}" width="8" height="16" rx="3" fill="#f0b45c"/>`);
    }
  }
  return out.join('');
}

/** Chapter name banners, drawn above the roads. */
function banners(w: World, L: MapLayout) {
  return (L.regions ?? []).map((r) => {
    const ch = chaptersFor(w).find((c) => c.id === r.id)!;
    const label = `${ch.quick ? (w === 'saari' ? '⚓ ' : '✓ ') : ''}${ch.name}`, bw = label.length * 7.2 + 26;
    return `<g><rect x="${r.x + r.w / 2 - bw / 2}" y="${r.y - 12}" width="${bw}" height="24" rx="12" fill="${CHAPTER_COLOR[ch.id]}" stroke="#fff" stroke-width="2.5"/><text x="${r.x + r.w / 2}" y="${r.y + 5}" text-anchor="middle" font-size="13" font-weight="800" fill="#fff" font-family="system-ui, sans-serif">${label}</text></g>`;
  }).join('');
}

function roads(w: World, L: MapLayout) {
  const sand = w === 'ranta' ? ['#c39a5c', '#f1dfb0'] : ['#8fa1aa', '#f6f8f9'];
  const under: string[] = [], over: string[] = [], tunnels: string[] = [], portals: string[] = [];
  const boats = new Set<string>();
  const trailsU: string[] = [], trailsO: string[] = [];
  for (const e of L.edges) {
    const lit = store.known(e.from);
    const op = lit ? 1 : 0.55;
    const trail = e.route.length - 2 >= 3;
    for (const s of e.sections) {
      if (s.kind === 'ferry') {
        tunnels.push(w === 'saari'
          ? `<path d="${s.d}" stroke="#2f7fa3" stroke-width="6" opacity="${0.15 + 0.15 * op}"/><path d="${s.d}" stroke="#fff" stroke-width="3.2" stroke-dasharray="1 7" opacity="${0.55 + 0.45 * op}"/>`
          : w === 'ranta'
            ? `<path d="${s.d}" stroke="#8a6a44" stroke-width="8" opacity="${0.45 + 0.4 * op}"/><path d="${s.d}" stroke="#d9b77c" stroke-width="6" stroke-dasharray="4 2.5" stroke-linecap="butt" opacity="${0.6 + 0.4 * op}"/>`
            : `<path d="${s.d}" stroke="#7f97a2" stroke-width="7" opacity="${0.5 + 0.4 * op}"/><path d="${s.d}" stroke="#d6e4e9" stroke-width="2.5" opacity="${0.6 + 0.4 * op}"/>`);
        if (w !== 'saari') continue;
        const lane = s.pts[2]!, mid = (s.pts[2]!.y + s.pts[3]!.y) / 2, key = `${lane.x}:${Math.round(mid / 120)}`;
        if (!boats.has(key)) {
          boats.add(key);
          portals.push(`<g transform="translate(${lane.x} ${mid})"><path d="M-9 0h18l-4 5.5h-10z" fill="#8a5a3c"/><path d="M0 -1v-12l7 10z" fill="#fff" stroke="#2f7fa3" stroke-width=".8"/></g>`);
        }
      } else if (s.kind === 'path') {
        // Short links are main roads; long-distance links are narrow trails, so the map stays readable.
        const [wu, wo] = trail ? [8, 4.5] : [15, 10];
        (trail ? trailsU : under).push(`<path d="${s.d}" stroke="${sand[0]}" stroke-width="${wu}" opacity="${op}"/>`);
        (trail ? trailsO : over).push(`<path d="${s.d}" stroke="${sand[1]}" stroke-width="${wo}" opacity="${op}"/>`);
      } else {
        tunnels.push(`<path d="${s.d}" stroke="#6f5a3e" stroke-width="5" stroke-dasharray="2 9" opacity="${0.45 + 0.4 * op}"/>`);
      }
    }
    for (const p of e.portals) portals.push(`<ellipse cx="${p.x}" cy="${p.y}" rx="10" ry="7" fill="#3d2f20" stroke="#8a6a44" stroke-width="3"/>`);
  }
  // stepping stones for supporting relations of places that have no road otherwise
  const stones = L.paths.map((p) => `<path d="${p.d}" stroke="${w === 'lab' ? '#8fa1aa' : '#b08a55'}" stroke-width="8" stroke-dasharray="0.1 12" opacity="${store.known(p.from) ? 1 : 0.6}"/>`);
  return `<g fill="none" stroke-linecap="round">${tunnels.join('')}${trailsU.join('')}${trailsO.join('')}${under.join('')}${over.join('')}${stones.join('')}</g>${portals.join('')}`;
}

// ------------------------------------------------------------ light and fog
const SEEN_KEY = 'sammakko-lite-lit';
function seenLit(w: World): Set<string> {
  try { return new Set((JSON.parse(localStorage.getItem(SEEN_KEY) ?? '{}') as Record<string, string[]>)[w] ?? []); } catch { return new Set(); }
}
function rememberLit(w: World, ids: string[]) {
  try {
    const all = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '{}') as Record<string, string[]>;
    all[w] = ids;
    localStorage.setItem(SEEN_KEY, JSON.stringify(all));
  } catch { /* private mode: the glow simply appears without animation next time */ }
}

/**
 * Known places glow warmly; the rest of the world lies under a light fog that
 * lifts around what the child knows (wide) and where they can go next (narrow).
 * Roads are drawn above the fog, so every route stays visible.
 */
function lightAndFog(w: World, L: MapLayout) {
  const ids = [...L.nodes.keys()];
  const known = ids.filter((id) => store.known(id));
  const open = ids.filter((id) => !store.known(id) && openIn(w, id));
  const seen = seenLit(w);
  const calm = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fresh = new Set(calm ? [] : known.filter((id) => !seen.has(id)));
  rememberLit(w, known);
  let order = 0;
  const grow = (id: string, r: number) => {
    if (!fresh.has(id)) return { r, anim: '' };
    const begin = 0.35 + 0.25 * order++;
    return { r: 0, anim: `<animate attributeName="r" from="0" to="${r}" begin="${begin.toFixed(2)}s" dur="1.6s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines=".2 .7 .2 1"/>` };
  };
  const glow: string[] = [], holes: string[] = [];
  for (const id of known) {
    const n = L.nodes.get(id)!;
    const g = grow(id, 92), hole = grow(id, 132);
    glow.push(`<circle cx="${n.x}" cy="${n.y}" r="${g.r}" fill="url(#glow-${w})">${g.anim}</circle>`);
    holes.push(`<circle cx="${n.x}" cy="${n.y}" r="${hole.r}" fill="url(#hole-${w})">${hole.anim}</circle>`);
  }
  for (const id of open) {
    const n = L.nodes.get(id)!;
    holes.push(`<circle cx="${n.x}" cy="${n.y}" r="78" fill="url(#hole-${w})"/>`);
  }
  const fogColor = w === 'lab' ? '#e9eef1' : w === 'saari' ? '#f3f7f9' : '#f4f6ef';
  const puffs: string[] = [];
  for (let i = 0; i < L.h / 46; i++) {
    const x = (i * 157 + 40) % (L.w + 40) - 20, y = (i * 71) % L.h;
    puffs.push(`<g opacity=".55"><circle cx="${x}" cy="${y}" r="26" fill="#fff"/><circle cx="${x + 24}" cy="${y + 6}" r="20" fill="#fff"/><circle cx="${x - 22}" cy="${y + 8}" r="17" fill="#fff"/></g>`);
  }
  return `<defs>
    <radialGradient id="glow-${w}"><stop offset="0" stop-color="#fff7cf" stop-opacity=".95"/><stop offset=".45" stop-color="#ffe27a" stop-opacity=".5"/><stop offset="1" stop-color="#ffd54a" stop-opacity="0"/></radialGradient>
    <radialGradient id="hole-${w}"><stop offset="0" stop-color="#000"/><stop offset=".55" stop-color="#000"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <mask id="fog-${w}" maskUnits="userSpaceOnUse" x="0" y="0" width="${L.w}" height="${L.h}"><rect width="${L.w}" height="${L.h}" fill="#fff"/>${holes.join('')}</mask>
  </defs>
  <g class="fog" mask="url(#fog-${w})"><rect width="${L.w}" height="${L.h}" fill="${fogColor}" opacity=".66"/>${puffs.join('')}</g>
  <g class="glow">${glow.join('')}</g>`;
}

const CLOUD = '<svg viewBox="0 0 80 52"><g fill="#fff" stroke="#b9cbd3" stroke-width="2.5"><circle cx="24" cy="30" r="16"/><circle cx="42" cy="22" r="19"/><circle cx="60" cy="31" r="14"/><rect x="12" y="30" width="58" height="16" rx="8"/></g><g fill="#fff"><circle cx="24" cy="30" r="14.8"/><circle cx="42" cy="22" r="17.8"/><circle cx="60" cy="31" r="12.8"/><rect x="13.2" y="31.2" width="55.6" height="13.6" rx="6.8"/></g></svg>';

export interface MapHooks { open(id: string, mode: Mode): void; refresh(): void; go(w: World, chapter?: string): void }

/** The map element. `next` is the place the green button leads to. */
export function worldMap(w: World, next: string | undefined, hooks: MapHooks, compact = false) {
  const base = layout(w);
  // Sea routes to the other areas sit in the gap below each chapter; the last one needs room.
  const routes = compact ? [] : (base.regions ?? []).map((r) => ({ r, ...routesOf(w, r.id) }));
  const lastHas = routes.length > 0 && (routes.at(-1)!.out.length + routes.at(-1)!.in.length) > 0;
  const L: MapLayout = { ...base, h: base.h + (lastHas ? 24 : 0) };
  const wrap = h('div', { class: `wmap ${w}`, style: `aspect-ratio:${L.w}/${L.h}` });
  const seaLines: string[] = [];
  const pct = (x: number, y: number) => `left:${(x / L.w) * 100}%;top:${(y / L.h) * 100}%`;
  for (const { r, out, in: inn } of routes) {
    const y = r.y + r.h + 20;
    const pills = [...inn.map(([ow, xs]) => ({ ow, xs, incoming: true })), ...out.map(([ow, xs]) => ({ ow, xs, incoming: false }))];
    if (pills.length) seaLines.push(`<path d="M0 ${y}H${L.w}" stroke="#2f7fa3" stroke-width="2.5" stroke-dasharray="3 6" stroke-linecap="round" opacity=".7"/>`);
    pills.forEach((p, i) => {
      const n = placesLeaving(p.xs).length;
      const text = p.incoming ? `⛵ ${SHORT[p.ow].from} ${n}` : `⛵ ${n} → ${SHORT[p.ow].to}`;
      // incoming routes start at the left edge, outgoing ones leave at the right
      const side = p.incoming ? `left:${2 + i * 34}%` : `right:${2 + (pills.length - 1 - i) * 34}%`;
      wrap.append(h('button', {
        type: 'button', class: `sea-route${p.incoming ? ' in' : ''}`, style: `${side};top:${(y / L.h) * 100}%`,
        'aria-label': p.incoming ? `Merireitti: ${n} paikkaa tulee alueelta ${worldInfo(p.ow).name}` : `Merireitti: ${n} paikkaa tarvitaan alueella ${worldInfo(p.ow).name}`,
        onclick: () => routeSheet(w, r.id, p.ow, p.xs, p.incoming, hooks),
      }, text));
    });
  }
  wrap.insertAdjacentHTML('afterbegin', `<svg class="wmap-bg" viewBox="0 0 ${L.w} ${L.h}" preserveAspectRatio="none" aria-hidden="true">${scenery(w, L)}${lightAndFog(w, L)}${roads(w, L)}${seaLines.join('')}${compact ? '' : banners(w, L)}</svg>`);
  for (const n of L.nodes.values()) {
    const id = n.id, spec = NODES[id]!, st = store.state(id);
    const ch = chapterIn(w, id)!;
    const checked = st.checked, helped = store.helped(id), inferred = store.inferred(id), later = store.deferred(id);
    const lit = checked || helped;
    const open = openIn(w, id);
    const cls = ['place', checked ? 'done' : '', helped ? 'helped' : '', inferred && !lit ? 'inferred' : '', !open && !lit && !inferred ? 'locked' : '', id === next ? 'next' : '', ch.quick ? 'quick' : ''].filter(Boolean).join(' ');
    // Recent difficulty stays visible even on a checked place.
    const badge = h('span', { class: 'badges' },
      checked ? h('span', { class: 'stars', html: st.retained !== undefined ? ICON.star + ICON.star : ICON.star }) : null,
      helped ? h('span', { class: 'helpmark', 'aria-hidden': 'true' }, '🤝') : null,
      !lit && inferred ? h('span', { class: 'stars outline', html: ICON.starOutline }) : null,
      st.difficulty ? h('span', { class: 'flag' }, '!') : null,
      later && !lit ? h('span', { class: 'latermark', 'aria-hidden': 'true' }, '🕒') : null,
      !open && !lit && !inferred ? h('span', { class: 'lockmark', html: ICON.lock }) : null);
    const label = [spec.stop, checked ? (st.retained !== undefined ? 'muistettu' : 'tarkistettu') : helped ? 'harjoiteltu avun kanssa' : inferred ? 'päätelty' : !open ? 'polun takana' : '',
      st.difficulty ? 'viime aikoina vaikeaa' : '', later && !lit ? 'jätetty myöhemmäksi' : ''].filter(Boolean).join(', ');
    wrap.append(
      h('button', {
        class: cls, style: `${pct(n.x, n.y)};--ch:${CHAPTER_COLOR[ch.id]}`, 'data-id': id,
        'aria-label': label,
        onclick: () => {
          const mode = modeFor(w, id);
          if (compact && mode !== 'leap') hooks.open(id, mode);
          else sheet(w, id, hooks, compact);
        },
      }, h('span', { class: 'disc' }, spec.icon),
        // unexplored places sit under a light cloud; the frontier's cloud is thinner
        !lit && !inferred && id !== next ? h('span', { class: `cloud${open ? ' thin' : ''}`, 'aria-hidden': 'true', html: CLOUD }) : null,
        badge),
      ...(compact ? [] : [h('span', { class: 'sign', style: pct(n.x, n.y + MAP.r + 3) }, spec.stop)]));
  }
  // scroll targets for the chapter buttons above the map
  for (const r of L.regions ?? []) wrap.append(h('span', { class: 'region-anchor', id: `alue-${r.id}`, style: `top:${((r.y - 30) / L.h) * 100}%` }));
  if (next) {
    const n = L.nodes.get(next)!;
    wrap.append(h('div', { class: 'avatar', style: pct(n.x - 32, n.y - 22), html: svg(60, 56, avatarArt(w)) }));
  }
  return wrap;
}

/** Sheet for a sea route: which places here are needed in the other area (or come from it). */
function routeSheet(w: World, chapter: string, other: World, xs: Crossing[], incoming: boolean, hooks: MapHooks) {
  document.querySelector('.sheet-back')?.remove();
  const ch = chaptersFor(w).find((c) => c.id === chapter)!;
  const close = () => back.remove();
  const lines = routeLines(xs, incoming);
  const body = h('div', { class: 'sheet stack', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Merireitti' },
    h('h2', {}, incoming ? `⛵ ${SHORT[other].from}: ${ch.name}` : `⛵ ${ch.name} → ${worldInfo(other).name}`),
    h('p', {}, incoming
      ? `Nämä paikat ovat kotoisin alueelta ${worldInfo(other).name}. Täällä ne tarkistetaan nopeasti.`
      : `Näitä taitoja tarvitaan myöhemmin alueella ${worldInfo(other).name}.`),
    h('ul', { class: 'small route-list' }, ...lines.slice(0, 12).map((l) => h('li', {}, l))),
    lines.length > 12 ? h('p', { class: 'small muted' }, `ja ${lines.length - 12} muuta`) : null,
    btn(ICON.next, `Purjehdi: ${worldInfo(other).name}`, () => { close(); hooks.go(other); }, 'primary big wide'),
    btn(ICON.back, 'Jää tänne', close, 'big wide'));
  const back = h('div', { class: 'sheet-back', onclick: (e: Event) => { if (e.target === back) close(); } }, body);
  document.body.append(back);
  say(incoming ? `Nämä paikat tulevat alueelta ${worldInfo(other).name}.` : `Näitä taitoja tarvitaan alueella ${worldInfo(other).name}.`);
}

/** Who walks the map: the frog on the shore, the frog captain in the archipelago, Sulka the heron researcher in the lab. */
export function avatarArt(w: World) {
  if (w === 'lab') return sulka(30, 26, 13);
  if (w === 'ranta') return spriteSvg('loikka', 30, 54, 56);
  // archipelago: Loikka with a small captain's cap resting on the head
  return `${spriteSvg('loikka', 30, 54, 56)}<g transform="translate(28 12) rotate(-8)"><ellipse rx="7" ry="3.2" fill="#fff" stroke="#1d3557" stroke-width="1.2"/><rect x="-6" y="0.6" width="12" height="2.6" rx="1.2" fill="#1d3557"/><circle cy="-0.8" r="1.3" fill="#e9b949"/></g>`;
}

/** Bottom sheet for one place: what is it, and what can I do here? */
function sheet(w: World, id: string, hooks: MapHooks, jumpOnly: boolean) {
  document.querySelector('.sheet-back')?.remove();
  const spec = NODES[id]!, st = store.state(id), ch = chapterIn(w, id)!;
  const mode = modeFor(w, id);
  const missing = ancestors(id).filter((a) => !store.known(a) && worldIds(w).includes(a));
  const close = () => back.remove();
  const body = h('div', { class: 'sheet stack', role: 'dialog', 'aria-modal': 'true', 'aria-label': spec.stop });
  const back = h('div', { class: 'sheet-back', onclick: (e: Event) => { if (e.target === back) close(); } }, body);

  const sources = store.inferredFrom(id).map((s) => NODES[s]!.stop);
  const lines = [
    st.checked ? (st.retained !== undefined ? '⭐⭐ Muistit tämän vielä tauon jälkeen.' : st.produced === false ? '⭐ Tarkistettu: tunnistit oikeat vastaukset.' : `⭐ Tarkistettu: osasit itse${st.quick ? ' (pikatarkistus)' : ''}.`)
      : store.helped(id) ? '🤝 Harjoiteltu avun kanssa. Kokeile itse, niin saat tähden.'
        : store.inferred(id) ? `☆ Päätelty: osasit paikan ${sources.slice(0, 2).join(' ja ')}${sources.length > 2 ? ` ja ${sources.length - 2} muuta` : ''}, ja se käyttää tätä taitoa. Tätä ei ole tarkistettu erikseen.`
          : mode === 'leap' ? `🔒 Polun takana. Ensin: ${missing.slice(0, 3).map((m) => NODES[m]!.stop).join(', ')}${missing.length > 3 ? ` ja ${missing.length - 3} muuta` : ''}.`
            : 'Avoinna.',
    st.recallFailed && st.difficulty ? '❗ Muistihaku ei onnistunut. Harjoittele, niin kysyn tätä taas myöhemmin.'
      : st.difficulty ? '❗ Viime aikoina tässä oli vaikeaa.' : '',
    store.deferred(id) ? '🕒 Jätit tämän myöhemmäksi. Se odottaa täällä.' : '',
  ].filter(Boolean);

  function main() {
    body.replaceChildren(
      h('div', { class: 'row' }, h('span', { class: 'sheet-icon', style: `--ch:${CHAPTER_COLOR[ch.id]}` }, spec.icon),
        h('div', { style: 'flex:1;min-width:0' }, h('h2', {}, spec.stop), h('div', { class: 'small muted' }, h('b', {}, ch.name), ` · ${ch.story}`)),
        h('button', { class: 'icon-btn', 'aria-label': 'Sulje', onclick: close, html: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>' })),
      h('p', {}, spec.intro),
      ...lines.map((l) => h('p', { class: 'small' }, l)),
      h('p', { class: 'small goal' }, h('b', {}, '🎯 '), spec.goal ?? ''),
      mode === 'leap'
        ? h('div', { class: 'stack' },
          btn(ICON.bolt, 'Hyppää tänne', confirm, 'primary big wide'),
          btn(ICON.eye, 'Katso esimerkki', () => { close(); hooks.open(id, 'preview'); }, 'big wide'))
        : btn(ICON.next, mode === 'retrieval' ? 'Muistatko vielä?' : mode === 'quick' ? 'Pikatarkistus' : mode === 'practice' ? 'Harjoittele lisää' : store.helped(id) ? 'Jatka' : store.inferred(id) ? 'Kokeile' : 'Aloita',
          () => { close(); hooks.open(id, mode); }, 'primary big wide'));
    say(`${spec.stop}. ${spec.intro}`);
  }

  function confirm() {
    const names = missing.map((m) => NODES[m]!.stop);
    body.replaceChildren(
      h('h2', {}, `🦘 Hypätäänkö?`),
      h('p', {}, `Hyppäät ${missing.length} paikan yli: ${names.slice(0, 5).join(', ')}${names.length > 5 ? ` ja ${names.length - 5} muuta` : ''}.`),
      h('p', { class: 'small muted' }, 'Jos onnistut, ohitetut pohjapaikat merkitään päätellyiksi ☆, koska tämä paikka käyttää niitä. Niitä ei tarkisteta erikseen. Jos tämä tuntuu liian vaikealta, voit harjoitella pohjaa milloin vain.'),
      btn(ICON.bolt, 'Kyllä, hyppään!', () => { close(); hooks.open(id, 'leap'); }, 'primary big wide'),
      btn(ICON.back, 'Ei sittenkään', jumpOnly ? close : main, 'big wide'));
    say(`Hypätäänkö? Hyppäät ${missing.length} paikan yli.`);
  }

  if (jumpOnly) confirm(); else main();
  document.body.append(back);
  (body.querySelector('.btn.primary') as HTMLElement | null)?.focus();
}
