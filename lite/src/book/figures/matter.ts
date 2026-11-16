import type { Paint } from '../../engine/types';
import { C, arrow, figure, packed, pill, seeded, tx } from './kit';

/** Atom colours (close to the usual model-kit colours). */
const COLOR: Record<string, string> = {
  H: '#ffffff', C: '#4a4a4a', N: '#3b7fd6', O: '#e0533f', F: '#8fcf5a', Cl: '#4fb04f', Na: '#8b6fd6', Mg: '#5cb88a',
  Ar: '#5fc4c9', Ne: '#f29ad8', S: '#f4c542', K: '#a77ad6', Li: '#c792ea', Al: '#b9c4c9', He: '#9fe3e8', Ca: '#d9c27a',
};
const dark = (el: string) => ['C', 'N', 'O', 'Na', 'Cl', 'K', 'Mg'].includes(el);

export function atomBall(x: number, y: number, el: string, r = 13, charge = '') {
  const fill = COLOR[el] ?? '#c9b98a';
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${C.ink}" stroke-width="1.6"/>` +
    tx(x, y + r * 0.36, el + charge, { size: Math.round(r * ((el + charge).length > 3 ? 0.7 : 0.92)), fill: dark(el) ? '#fff' : C.ink, weight: 800 });
}

/** Bohr model: protons (+) and neutrons in the nucleus, electrons (−) on shells. */
export function atom(o: { symbol: string; name: string; p: number; n: number; shells: number[]; label: string; zoomNucleus?: boolean; note?: string; lose?: boolean }): Paint {
  const cx = 120, cy = 112, radii = [48, 76, 102];
  let s = '';
  o.shells.forEach((_, k) => { s += `<circle cx="${cx}" cy="${cy}" r="${radii[k]}" fill="none" stroke="${C.line}" stroke-width="1.5" stroke-dasharray="4 5"/>`; });
  const parts = Array.from({ length: o.p + o.n }, (_, i) => (i % 2 === 0 && i / 2 < o.p) || i >= 2 * o.n ? 'p' : 'n');
  // Keep the exact counts whatever the mix.
  let pc = parts.filter(x => x === 'p').length;
  for (let i = 0; pc > o.p && i < parts.length; i++) if (parts[i] === 'p') { parts[i] = 'n'; pc--; }
  for (let i = 0; pc < o.p && i < parts.length; i++) if (parts[i] === 'n') { parts[i] = 'p'; pc++; }
  packed(parts.length, cx, cy, 10).forEach(([x, y], i) => {
    const proton = parts[i] === 'p';
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="${proton ? C.red : C.grey}" stroke="#fff" stroke-width="1"/>`;
    if (proton) s += `<path d="M${x - 3} ${y}h6M${x} ${y - 3}v6" stroke="#fff" stroke-width="1.6"/>`;
  });
  o.shells.forEach((count, k) => {
    let g = '';
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + k * 0.4, x = cx + radii[k]! * Math.cos(a), y = cy + radii[k]! * Math.sin(a);
      // The outermost electron leaves the atom.
      if (o.lose && k === o.shells.length - 1 && i === count - 1) continue;
      g += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6.5" fill="${C.blue}" stroke="#fff" stroke-width="1"/><path d="M${(x - 3).toFixed(1)} ${y.toFixed(1)}h6" stroke="#fff" stroke-width="1.8"/>`;
    }
    s += `<g class="bf-orbit" style="transform-origin:${cx}px ${cy}px;animation-duration:${8 + k * 5}s">${g}</g>`;
  });
  const lx = 248;
  s += tx(lx + 56, 46, o.symbol, { size: 34, weight: 900 }) + tx(lx + 56, 66, o.name, { size: 13, fill: C.soft });
  const row = (y: number, color: string, sign: string, text: string) =>
    `<circle cx="${lx + 8}" cy="${y - 5}" r="7" fill="${color}"/>` + (sign ? tx(lx + 8, y - 1, sign, { size: 11, fill: '#fff', weight: 900 }) : '') + tx(lx + 22, y, text, { anchor: 'start', size: 13 });
  const e = o.shells.reduce((a, b) => a + b, 0) - (o.lose ? 1 : 0);
  s += row(102, C.red, '+', `${o.p} protonia`) + row(128, C.grey, '', `${o.n} neutronia`) + row(154, C.blue, '−', `${e} elektronia`);
  if (o.lose) {
    const r = radii[o.shells.length - 1]!;
    s += `<g class="bf-shoot"><circle cx="${cx + r + 14}" cy="${cy - 30}" r="6.5" fill="${C.blue}" stroke="#fff"/><path d="M${cx + r + 11} ${cy - 30}h6" stroke="#fff" stroke-width="1.8"/></g>`;
  }
  if (o.note) s += pill(lx + 72, 192, o.note, { size: 13, stroke: C.pond });
  if (o.zoomNucleus) s += pill(cx, 216, 'ydin on oikeasti paljon pienempi', { size: 12, stroke: C.line, fill: C.soft });
  return figure(400, 224, s, o.label);
}

/** Samples in jars: each item is one particle (an atom, or bonded atoms in a row). */
export function samples(o: { jars: { name: string; items: string[][]; note?: string; mark?: 'ok' | 'no' }[]; label: string }): Paint {
  const n = o.jars.length, w = Math.min(150, 380 / n), left = 200 - (n * w) / 2;
  let s = '';
  o.jars.forEach((jar, j) => {
    const x0 = left + j * w, cx = x0 + w / 2;
    s += `<rect x="${x0 + 6}" y="24" width="${w - 12}" height="150" rx="16" fill="#fff" stroke="${jar.mark === 'ok' ? C.leaf : C.line}" stroke-width="${jar.mark === 'ok' ? 3 : 1.5}"/>` +
      tx(cx, 18, jar.name, { size: 14 });
    const rows = jar.items.length, rr = 12;
    jar.items.forEach((mol, i) => {
      const y = 24 + 150 * (i + 0.5) / rows, dx = rr * 1.55, x = cx - (mol.length - 1) * dx / 2 + (rows > 3 ? ((i % 2) - 0.5) * 18 : 0);
      if (mol.length > 1) s += `<line x1="${x}" y1="${y}" x2="${x + (mol.length - 1) * dx}" y2="${y}" stroke="${C.ink}" stroke-width="3"/>`;
      mol.forEach((el, k) => { s += atomBall(x + k * dx, y, el, rr); });
    });
    if (jar.note) s += tx(cx, 194, jar.note, { size: 13, fill: jar.mark === 'ok' ? C.leaf : C.soft });
  });
  return figure(400, 204, s, o.label);
}

type StateBox = { state: 'solid' | 'liquid' | 'gas'; title: string; note?: string };
/** Particles in a solid, a liquid and a gas: order, sliding, free flight. */
export function states(o: { boxes?: StateBox[]; label: string; n?: number; arrow?: string }): Paint {
  const boxes = o.boxes ?? [{ state: 'solid', title: 'kiinteä' }, { state: 'liquid', title: 'neste' }, { state: 'gas', title: 'kaasu' }];
  const rnd = seeded(7);
  let s = '';
  const step = boxes.length === 2 ? 190 : 126, left = 200 - (step * (boxes.length - 1) + 112) / 2;
  if (boxes.length === 2 && o.arrow) s += arrow(left + 122, 84, left + step - 10, 84, { color: C.red, width: 3 }) + tx(200, 72, o.arrow, { size: 13, fill: C.red });
  const count = o.n ?? 12;
  boxes.forEach((b, j) => {
    const x0 = left + j * step, w = 112, y0 = 20, h = 128;
    s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="10" fill="#fff" stroke="${C.ink}" stroke-width="2"/>`;
    const dots: [number, number][] = [];
    if (b.state === 'solid') for (let i = 0; i < count; i++) dots.push([x0 + 22 + (i % 4) * 23, y0 + h - 22 - Math.floor(i / 4) * 23]);
    else if (b.state === 'liquid') for (let i = 0; i < count; i++) dots.push([x0 + 16 + (i % 5) * 20 + (Math.floor(i / 5) % 2) * 10 + rnd() * 4, y0 + h - 16 - Math.floor(i / 5) * 19 - rnd() * 3]);
    else {
      // Spread out: one particle per cell of a 4 × 4 grid, cells picked evenly, a little jitter.
      const n = Math.min(16, o.n ?? 8);
      for (let i = 0; i < n; i++) {
        const cell = Math.floor(i * 16 / n), cx = cell % 4, cy = Math.floor(cell / 4);
        dots.push([x0 + 16 + cx * 26 + rnd() * 8, y0 + 16 + cy * 30 + rnd() * 8]);
      }
    }
    dots.forEach(([x, y], i) => {
      const cls = b.state === 'solid' ? 'bf-jiggle' : b.state === 'liquid' ? 'bf-slide' : 'bf-fly';
      s += `<g class="${cls}" style="animation-delay:-${(i * 0.37).toFixed(2)}s"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="${C.blue}" stroke="${C.ink}" stroke-width="1.2"/></g>`;
    });
    s += tx(x0 + w / 2, 170, b.title, { size: 14 });
    if (b.note) s += tx(x0 + w / 2, 188, b.note, { size: 13, fill: C.soft, weight: 600 });
  });
  return figure(400, 196, s, o.label);
}

/** The names of the changes between the three states. */
export function stateChanges(label: string): Paint {
  const node = (x: number, y: number, t: string, fill: string) => `<rect x="${x - 50}" y="${y - 20}" width="100" height="40" rx="20" fill="${fill}" stroke="${C.ink}" stroke-width="2"/>` + tx(x, y + 5, t, { size: 14 });
  const K = [70, 160], N = [200, 50], G = [330, 160];
  let s = node(K[0]!, K[1]!, 'kiinteä', C.cool) + node(N[0]!, N[1]!, 'neste', '#d7eefa') + node(G[0]!, G[1]!, 'kaasu', '#f3f6fb');
  // Each label runs along its own arrow, on the outer or inner side, so the two inner ones never meet.
  const along = (x: number, y: number, deg: number, t: string, fill: string) =>
    `<text x="${x}" y="${y}" font-size="12" text-anchor="middle" dominant-baseline="middle" fill="${fill}" font-weight="700" transform="rotate(${deg} ${x} ${y})">${t}</text>`;
  s += arrow(88, 138, 160, 72, { color: C.red }) + along(114, 94, -42.5, 'sulaminen', C.red);
  s += arrow(176, 78, 110, 142, { color: C.blue }) + along(153, 121, -42.5, 'jäätyminen', C.blue);
  s += arrow(240, 72, 312, 138, { color: C.red }) + along(286, 94, 42.5, 'haihtuminen', C.red);
  s += arrow(290, 142, 224, 78, { color: C.blue }) + along(247, 121, 42.5, 'tiivistyminen', C.blue);
  s += tx(200, 204, 'punainen: lämpöä sisään · sininen: lämpöä ulos', { size: 12, fill: C.soft, weight: 600 });
  return figure(400, 212, s, label);
}

/** Main-group part of the periodic table (periods 1–5), with optional highlights. */
const MAIN: (string | null)[][] = [
  ['H', null, null, null, null, null, null, 'He'],
  ['Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne'],
  ['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar'],
  ['K', 'Ca', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr'],
  ['Rb', 'Sr', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe'],
];
const Z: Record<string, number> = { H: 1, He: 2, Li: 3, Be: 4, B: 5, C: 6, N: 7, O: 8, F: 9, Ne: 10, Na: 11, Mg: 12, Al: 13, Si: 14, P: 15, S: 16, Cl: 17, Ar: 18, K: 19, Ca: 20, Ga: 31, Ge: 32, As: 33, Se: 34, Br: 35, Kr: 36, Rb: 37, Sr: 38, In: 49, Sn: 50, Sb: 51, Te: 52, I: 53, Xe: 54 };
const GROUPS = [1, 2, 13, 14, 15, 16, 17, 18];
export function periodic(o: { group?: number; period?: number; mark?: string[]; notes?: Record<string, string>; periods?: number; label: string; order?: boolean }): Paint {
  const rows = o.periods ?? 4, cw = 38, ch = 36, x0 = 56, y0 = 34;
  let s = '';
  GROUPS.forEach((g, c) => { s += tx(x0 + c * cw + cw / 2 + (c >= 2 ? 22 : 0), y0 - 10, String(g), { size: 12, fill: o.group === g ? C.pond : C.soft }); });
  for (let r = 0; r < rows; r++) {
    s += tx(x0 - 14, y0 + r * ch + ch / 2 + 5, String(r + 1), { size: 12, fill: o.period === r + 1 ? C.pond : C.soft, anchor: 'end' });
    MAIN[r]!.forEach((el, c) => {
      if (!el) return;
      const x = x0 + c * cw + (c >= 2 ? 22 : 0), y = y0 + r * ch;
      const hot = o.mark?.includes(el), band = o.group === GROUPS[c] || o.period === r + 1;
      s += `<rect x="${x + 1}" y="${y + 1}" width="${cw - 2}" height="${ch - 2}" rx="5" fill="${hot ? C.sun : band ? '#d9efe4' : '#fff'}" stroke="${hot ? C.ink : C.line}" stroke-width="${hot ? 2 : 1}"/>` +
        tx(x + cw / 2, y + 23, el, { size: 14, weight: 800 }) + tx(x + 5, y + 11, String(Z[el]), hot ? { size: 11, anchor: 'start', fill: C.ink, weight: 900 } : { size: 9, anchor: 'start', fill: C.soft, weight: 600 });
      const note = o.notes?.[el];
      if (note) s += tx(x + cw / 2, y + ch + 12, note, { size: 11, fill: C.pond });
    });
  }
  // Gap where the transition metals sit (period 4 onwards).
  if (rows >= 4) s += tx(x0 + 2 * cw + 11, y0 + 3 * ch + ch / 2 + 4, '…', { size: 14, fill: C.soft });
  s += tx(x0 - 34, y0 + rows * ch / 2, 'jakso', { size: 11, fill: C.soft, anchor: 'middle' }).replace('<text', `<text transform="rotate(-90 ${x0 - 34} ${y0 + rows * ch / 2})"`);
  s += tx(x0 + 4 * cw + 11, 12, 'ryhmä', { size: 11, fill: C.soft });
  if (o.order) {
    // Reading order: left to right along a period, then the next period starts on the left.
    for (let r = 0; r < Math.min(rows, 3); r++) {
      const y = y0 + r * ch + ch - 6;
      s += arrow(x0 + 8, y, x0 + 7 * cw + 22 + 28, y, { color: C.red, width: 2, head: 7, cls: 'bf-glow' });
      if (r < Math.min(rows, 3) - 1) s += `<path d="M${x0 + 7 * cw + 50} ${y} q14 ${ch / 2} -10 ${ch / 2} H${x0 + 2}" fill="none" stroke="${C.red}" stroke-width="1.5" stroke-dasharray="4 4" opacity=".7"/>`;
    }
  }
  return figure(400, y0 + rows * ch + (o.notes ? 22 : 10), s, o.label);
}

/** A salt crystal model: Na⁺ and Cl⁻ alternate in every direction. */
export function crystal(o: { a?: [string, string]; label: string; charges?: [string, string] }): Paint {
  const [pa, pb] = o.a ?? ['Na', 'Cl'], [qa, qb] = o.charges ?? ['⁺', '⁻'];
  let s = '';
  const x0 = 70, y0 = 30, d = 34;
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
    const x = x0 + c * d, y = y0 + r * d;
    if (c < 4) s += `<line x1="${x}" y1="${y}" x2="${x + d}" y2="${y}" stroke="${C.line}" stroke-width="2"/>`;
    if (r < 4) s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + d}" stroke="${C.line}" stroke-width="2"/>`;
  }
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
    const plus = (r + c) % 2 === 0;
    s += atomBall(x0 + c * d, y0 + r * d, plus ? pa : pb, plus ? 11 : 14, plus ? qa : qb);
  }
  s += atomBall(300, 60, pa, 11, qa) + tx(320, 64, `${pa}${qa}`, { anchor: 'start', size: 13 }) +
    atomBall(300, 100, pb, 14, qb) + tx(320, 104, `${pb}${qb}`, { anchor: 'start', size: 13 });
  s += pill(310, 150, '+ ja − vetävät', { size: 13, stroke: C.pond });
  return figure(400, 196, s, o.label);
}

/** Particles that started in one corner spread through the whole box. */
export function diffusion(o: { n?: number; label: string; gas?: string }): Paint {
  const n = o.n ?? 12, rnd = seeded(11);
  let s = `<rect x="30" y="20" width="340" height="150" rx="12" fill="#fff" stroke="${C.ink}" stroke-width="2"/>` +
    `<line x1="200" y1="20" x2="200" y2="70" stroke="${C.ink}" stroke-width="3"/><line x1="200" y1="120" x2="200" y2="170" stroke="${C.ink}" stroke-width="3"/>`;
  for (let i = 0; i < n; i++) {
    const fx = 50 + rnd() * 130, fy = 36 + rnd() * 118, x = 50 + rnd() * 300, y = 36 + rnd() * 118;
    s += `<g class="bf-spread" style="--fx:${(fx - x).toFixed(0)}px;--fy:${(fy - y).toFixed(0)}px;animation-delay:${(rnd() * 0.6).toFixed(2)}s">${atomBall(x, y, o.gas ?? 'Ar', 10)}</g>`;
  }
  s += tx(200, 192, 'samat hiukkaset leviävät koko tilaan', { size: 13, fill: C.soft });
  return figure(400, 200, s, o.label);
}

/** From what the eye sees to the particle model. */
export function scaleLevels(label: string, focus?: 0 | 1 | 2): Paint {
  let s = '', k = 0;
  const box = (x: number, title: string, inner: string) => { const hot = focus === k++; return `<rect x="${x}" y="24" width="110" height="110" rx="12" fill="${hot ? '#fff8dc' : '#fff'}" stroke="${hot ? C.sun : C.ink}" stroke-width="${hot ? 4 : 2}"/>${inner}` + tx(x + 55, 156, title, { size: 13 }); };
  s += box(14, 'silmällä', `<rect x="54" y="64" width="30" height="30" fill="#eef4f6" stroke="${C.grey}" stroke-width="2" transform="rotate(12 69 79)"/>` + tx(69, 120, '5 mm', { size: 12, fill: C.soft }));
  s += box(145, 'suurennos', `<path d="M160 110h24v-18h24v-18h24v-18h20" fill="none" stroke="${C.grey}" stroke-width="4"/><path d="M160 110h92v-54" fill="#eef4f6" opacity=".6"/>`);
  let model = '';
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) model += atomBall(296 + c * 24, 44 + r * 24, (r + c) % 2 ? 'Cl' : 'Na', (r + c) % 2 ? 10 : 8);
  s += box(276, 'hiukkasmalli', model);
  s += arrow(128, 79, 142, 79, { width: 2.5 }) + arrow(259, 79, 273, 79, { width: 2.5 });
  s += tx(76, 184, 'havainto', { size: 12, fill: C.leaf }) + tx(200, 184, 'havainto', { size: 12, fill: C.leaf }) + tx(331, 184, 'selitysmalli', { size: 12, fill: C.purple });
  return figure(400, 194, s, label);
}

/** Two experiments side by side: what changes the rate of a reaction. */
export function rate(o: { vary: 'temp' | 'conc' | 'surface'; a: string; b: string; result?: [string, string]; label: string }): Paint {
  const rnd = seeded(5);
  let s = '';
  [0, 1].forEach(j => {
    const x0 = 40 + j * 190, fast = j === 1;
    s += `<path d="M${x0} 30v120q0 12 12 12h106q12 0 12-12v-120" fill="#eaf4fb" stroke="${C.ink}" stroke-width="2.5"/>` +
      `<rect x="${x0 + 2}" y="62" width="126" height="98" fill="#d3e8f7" opacity=".8"/>`;
    const count = o.vary === 'conc' && fast ? 16 : 8;
    for (let i = 0; i < count; i++) {
      const x = x0 + 14 + rnd() * 100, y = 72 + rnd() * 50;
      s += `<g class="${fast && o.vary === 'temp' ? 'bf-zip' : 'bf-drift'}" style="animation-delay:-${(rnd() * 2).toFixed(2)}s"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="${C.blue}"/></g>`;
    }
    if (o.vary === 'surface' && fast) for (let i = 0; i < 8; i++) s += `<rect x="${x0 + 22 + (i % 4) * 22}" y="${136 + Math.floor(i / 4) * 11}" width="12" height="9" rx="2" fill="#9b8a72"/>`;
    else s += `<rect x="${x0 + 45}" y="132" width="40" height="24" rx="4" fill="#9b8a72"/>`;
    const bubbles = fast ? 6 : 3;
    for (let i = 0; i < bubbles; i++) s += `<circle class="bf-rise" style="animation-delay:-${(i * (fast ? 0.4 : 0.8)).toFixed(1)}s;animation-duration:${fast ? 1.6 : 2.6}s" cx="${x0 + 40 + (i * 23) % 56}" cy="130" r="4" fill="#fff" stroke="${C.blue}" stroke-width="1.2"/>`;
    s += tx(x0 + 65, 20, `${j ? 'B' : 'A'}: ${j ? o.b : o.a}`, { size: 14 });
    if (o.result) s += pill(x0 + 65, 190, o.result[j]!, { size: 13, stroke: fast ? C.pond : C.line });
  });
  return figure(400, 200, s, o.label);
}

/** The pH scale with marked solutions. */
export function phScale(o: { marks: { at: number; text: string }[]; label: string }): Paint {
  const x0 = 20, w = 360, y = 70, px = (v: number) => x0 + w * v / 14;
  const stops = ['#d7301f', '#f46d43', '#fdae61', '#fee08b', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#3288bd', '#5e4fa2', '#6a3d9a'];
  let s = `<defs><linearGradient id="bf-ph" x1="0" x2="1">${stops.map((c, i) => `<stop offset="${i / (stops.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient></defs>`;
  s += `<rect x="${x0}" y="${y}" width="${w}" height="26" rx="13" fill="url(#bf-ph)"/>`;
  for (let v = 0; v <= 14; v++) s += tx(px(v), y + 44, String(v), { size: 12, fill: v === 7 ? C.ink : C.soft, weight: v === 7 ? 900 : 600 });
  s += tx(px(3.2), y - 12, '← hapan', { size: 13, fill: C.red }) + tx(px(7), y - 12, 'neutraali', { size: 13 }) + tx(px(10.8), y - 12, 'emäksinen →', { size: 13, fill: C.purple });
  o.marks.forEach((m, i) => {
    const x = px(m.at), yy = y + 64 + (i % 2) * 22;
    s += `<line x1="${x}" y1="${y + 26}" x2="${x}" y2="${yy - 12}" stroke="${C.ink}" stroke-width="1.5"/><circle cx="${x}" cy="${y + 13}" r="6" fill="#fff" stroke="${C.ink}" stroke-width="2"/>` +
      pill(x, yy, m.text, { size: 12 });
  });
  return figure(400, 170, s, o.label);
}

/** Bromothymol blue: yellow below pH 6, green between, blue above 7.6. */
export function indicator(o: { label: string; sample?: 'yellow' | 'green' | 'blue' }): Paint {
  const tube = (x: number, color: string, top: string, bottom: string, hot: boolean) =>
    `<path d="M${x - 18} 26v100a18 18 0 0 0 36 0v-100" fill="#fff" stroke="${hot ? C.ink : C.grey}" stroke-width="${hot ? 3 : 2}"/>` +
    `<path d="M${x - 16} 60v66a16 16 0 0 0 32 0v-66z" fill="${color}"/>` + tx(x, 172, top, { size: 13 }) + tx(x, 190, bottom, { size: 12, fill: C.soft, weight: 600 });
  const s = tube(90, '#f2d13a', 'keltainen', 'pH alle 6', o.sample === 'yellow') + tube(200, '#5fae5a', 'vihreä', 'pH 6–7,6', o.sample === 'green') + tube(310, '#2f6fd0', 'sininen', 'pH yli 7,6', o.sample === 'blue');
  return figure(400, 200, s, o.label);
}

/** One molecule taken apart: which atoms and how many. */
export function molecule(o: { atoms: string[]; bonds?: 'line' | 'double'; name: string; formula: string; label: string; count?: string }): Paint {
  const n = o.atoms.length, d = 46, x0 = 120 - (n - 1) * d / 2;
  let s = '';
  for (let i = 0; i < n - 1; i++) {
    const x = x0 + i * d;
    s += o.bonds === 'double' ? `<line x1="${x}" y1="70" x2="${x + d}" y2="70" stroke="${C.ink}" stroke-width="3"/><line x1="${x}" y1="80" x2="${x + d}" y2="80" stroke="${C.ink}" stroke-width="3"/>`
      : `<line x1="${x}" y1="75" x2="${x + d}" y2="75" stroke="${C.ink}" stroke-width="3.5"/>`;
  }
  o.atoms.forEach((el, i) => { s += atomBall(x0 + i * d, 75, el, el === 'H' ? 13 : 20); });
  s += tx(120, 130, o.name, { size: 14 }) + tx(120, 152, o.formula, { size: 18, weight: 900, fill: C.pond });
  const counts = new Map<string, number>(); o.atoms.forEach(el => counts.set(el, (counts.get(el) ?? 0) + 1));
  let y = 52;
  for (const [el, k] of counts) { s += atomBall(270, y, el, 12) + tx(292, y + 5, `${k} × ${el}`, { anchor: 'start', size: 14 }); y += 34; }
  if (o.count) s += pill(300, y + 10, o.count, { size: 13, stroke: C.pond });
  return figure(400, 170, s, o.label);
}

/** How small the nucleus is: a pea in the middle of a stadium. */
export function nucleusScale(label: string): Paint {
  let s = `<ellipse cx="200" cy="96" rx="170" ry="72" fill="#d9efe4" stroke="${C.leaf}" stroke-width="3"/><ellipse cx="200" cy="96" rx="122" ry="44" fill="#bfe3cc" stroke="#fff" stroke-width="2" stroke-dasharray="6 6"/>`;
  s += `<circle class="bf-glow" cx="200" cy="96" r="12" fill="none" stroke="${C.red}" stroke-width="2"/><circle cx="200" cy="96" r="3.5" fill="${C.leaf}" stroke="${C.ink}"/>`;
  s += arrow(250, 40, 208, 88, { color: C.red, width: 2 }) + tx(256, 36, 'herne = ydin', { anchor: 'start', size: 13, fill: C.red });
  s += tx(200, 188, 'jos atomi olisi stadion, ydin olisi herne keskellä', { size: 13, fill: C.soft });
  return figure(400, 198, s, label);
}
