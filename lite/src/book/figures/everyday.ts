import type { Paint } from '../../engine/types';
import { C, arrow, figure, pill, tx } from './kit';
import { mark } from './charts';

/* Safety, living things and measuring: the book's everyday figures. */

const GLYPH: Record<string, string> = {
  flame: `<path d="M0 22 c-16 0 -20 -14 -12 -26 c2 8 6 10 8 8 c-4 -14 4 -24 10 -30 c0 12 14 16 12 32 c4 -2 6 -6 6 -10 c6 12 0 26 -24 26z" fill="#111"/><rect x="-18" y="24" width="36" height="5" fill="#111"/>`,
  gas: `<rect x="-24" y="-6" width="44" height="22" rx="10" fill="#111" transform="rotate(-24)"/><rect x="18" y="-24" width="8" height="12" fill="#111" transform="rotate(-24)"/>`,
  skull: `<circle cx="0" cy="-6" r="15" fill="#111"/><rect x="-9" y="4" width="18" height="10" rx="3" fill="#111"/><circle cx="-6" cy="-7" r="4.5" fill="#fff"/><circle cx="6" cy="-7" r="4.5" fill="#fff"/><path d="M-22 18 L22 30 M22 18 L-22 30" stroke="#111" stroke-width="5" stroke-linecap="round"/>`,
  corrosive: `<path d="M-22 -26 l10 0 l-2 10 M8 -26 l10 0 l-2 10" stroke="#111" stroke-width="5" fill="none"/><circle cx="-14" cy="-6" r="3" fill="#111"/><circle cx="12" cy="-6" r="3" fill="#111"/><path d="M-26 10 h22 l-4 6 h-18z M2 10 q6 -6 10 0 q6 6 14 0 v8 h-24z" fill="#111"/><rect x="-28" y="22" width="56" height="5" fill="#111"/>`,
  env: `<path d="M-24 18 q10 -14 24 0 q-14 12 -24 0z M-2 18 l8 -6 v12z" fill="#111"/><path d="M14 -24 v34 M14 -18 l-10 8 M14 -10 l10 -8" stroke="#111" stroke-width="4"/><path d="M-26 28 h52" stroke="#111" stroke-width="3"/>`,
  radiation: `<circle r="6" fill="#111"/><path d="M0 -10 L-10 -26 A28 28 0 0 1 10 -26Z M8.7 5 L27.5 4.3 A28 28 0 0 1 17.5 21.6Z M-8.7 5 L-17.5 21.6 A28 28 0 0 1 -27.5 4.3Z" fill="#111"/>`,
};
const HAZARD_NAME: Record<string, string> = { flame: 'syttyvä', gas: 'paineen alainen kaasu', skull: 'myrkyllinen', corrosive: 'syövyttävä', env: 'ympäristövaara', radiation: 'säteilyvaara' };
/** Warning pictograms: a red-bordered diamond with a black picture, or the yellow radiation sign. */
export function hazards(o: { kinds: string[]; mark?: string; label: string; names?: boolean }): Paint {
  const n = o.kinds.length, slot = 400 / n;
  let s = '';
  o.kinds.forEach((k, i) => {
    const x = slot * (i + 0.5), y = 66, hot = o.mark === k;
    s += k === 'radiation'
      ? `<path d="M${x} ${y - 46} L${x + 50} ${y + 38} H${x - 50}Z" fill="#f4c542" stroke="#111" stroke-width="4" stroke-linejoin="round"/><g transform="translate(${x} ${y + 12}) scale(.62)">${GLYPH[k]}</g>`
      : `<rect x="${x - 34}" y="${y - 34}" width="68" height="68" fill="#fff" stroke="#d81e1e" stroke-width="7" transform="rotate(45 ${x} ${y})"/><g transform="translate(${x} ${y}) scale(.8)">${GLYPH[k]}</g>`;
    if (hot) s += `<circle cx="${x}" cy="${y}" r="58" fill="none" stroke="${C.sun}" stroke-width="4"/>`;
    if (o.names !== false) s += tx(x, 142, HAZARD_NAME[k] ?? k, { size: 12, weight: hot ? 900 : 700 });
  });
  return figure(400, 152, s, o.label);
}

/** The fire triangle: fuel, oxygen and heat; removing one side stops the fire. */
export function fireTriangle(o: { remove?: 'fuel' | 'oxygen' | 'heat'; label: string; how?: string }): Paint {
  const A = [200, 26], B = [80, 186], D = [320, 186];
  const side = (p: number[], q: number[], gone: boolean) => `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="${gone ? C.line : C.red}" stroke-width="${gone ? 4 : 10}" stroke-linecap="round" ${gone ? 'stroke-dasharray="8 8"' : ''}/>`;
  let s = side(A, B, o.remove === 'fuel') + side(A, D, o.remove === 'oxygen') + side(B, D, o.remove === 'heat');
  s += tx(110, 100, 'palava aine', { size: 13, anchor: 'end' }) + tx(290, 100, 'happi', { size: 13, anchor: 'start' }) + tx(200, 210, 'korkea lämpötila', { size: 13 });
  s += o.remove ? tx(200, 140, '💨', { size: 34, weight: 400 }) + tx(200, 166, 'palaminen loppuu', { size: 12, fill: C.leaf }) : `<g class="bf-glow">${tx(200, 150, '🔥', { size: 46, weight: 400 })}</g>`;
  if (o.how) s += pill(o.remove === 'oxygen' ? 330 : o.remove === 'heat' ? 200 : 70, o.remove === 'heat' ? 236 : 60, o.how, { size: 12, stroke: C.leaf });
  return figure(400, o.how && o.remove === 'heat' ? 246 : 220, s, o.label);
}

/** Paths from the start to the meeting point; one is smoky, the safe one is marked. */
export function escape(o: { label: string; paths?: { name: string; smoke?: boolean }[] }): Paint {
  const paths = o.paths ?? [{ name: 'Kivipolku', smoke: true }, { name: 'Metsäpolku' }, { name: 'Rantapolku' }];
  const ys = [50, 110, 170];
  let s = `<rect x="14" y="88" width="66" height="44" rx="10" fill="#fff" stroke="${C.ink}" stroke-width="2"/>` + tx(47, 115, 'lähtö', { size: 13 });
  s += `<rect x="308" y="84" width="88" height="52" rx="10" fill="#e1f3e3" stroke="${C.leaf}" stroke-width="2.5"/>` + tx(352, 106, '🚩', { size: 18, weight: 400 }) + tx(352, 126, 'kokoontuminen', { size: 10 });
  const safe = paths.findIndex(p => !p.smoke && /Ranta/.test(p.name)), pick = safe >= 0 ? safe : paths.findIndex(p => !p.smoke);
  paths.forEach((p, i) => {
    const y = ys[i]!, d = `M80 110 C130 110 140 ${y} 200 ${y} S262 110 308 110`;
    s += `<path d="${d}" fill="none" stroke="${p.smoke ? C.grey : i === pick ? C.leaf : '#c8bfa8'}" stroke-width="${i === pick ? 6 : 4}" stroke-linecap="round"${i === pick ? ' stroke-dasharray="1 12" class="bf-flow"' : ''}/>`;
    s += tx(200, y + (y < 110 ? -12 : 22), p.name, { size: 12, fill: p.smoke ? C.soft : C.ink });
    if (p.smoke) s += `<g class="bf-rise" style="animation-duration:3s">${tx(200, y + 6, '💨', { size: 26, weight: 400 })}</g>` + tx(232, y + 6, '🔥', { size: 18, weight: 400 });
  });
  return figure(400, 200, s, o.label);
}

/** A leaf making sugar from carbon dioxide and water with the energy of light. */
export function photosynthesis(o: { label: string; dark?: boolean; carbon?: string }): Paint {
  let s = o.dark ? `<rect x="0" y="0" width="400" height="210" rx="14" fill="#26323a"/>` : `<circle cx="40" cy="36" r="24" fill="${C.sun}" class="bf-glow"/>` +
    `<path d="M64 46 L150 86" stroke="${C.sun}" stroke-width="3" stroke-dasharray="6 6" class="bf-flow"/>` + tx(96, 44, 'valo = energia', { size: 12, anchor: 'start', fill: '#a86a10' });
  s += `<path d="M200 190 V120" stroke="#5c8a3a" stroke-width="6"/><path d="M200 120 C140 120 130 60 200 40 C270 60 260 120 200 120Z" fill="${o.dark ? '#4c6b3c' : '#5cb85c'}" stroke="#2f6b2f" stroke-width="2.5"/><path d="M200 116 V52" stroke="#2f6b2f" stroke-width="2"/>`;
  s += `<path d="M170 190 q-20 10 -40 6 M230 190 q20 10 40 6 M200 190 v14" stroke="#8c6a42" stroke-width="3" fill="none"/><rect x="100" y="188" width="200" height="4" fill="#8c6a42"/>`;
  s += arrow(330, 60, 262, 76, { color: C.soft, width: 3 }) + pill(350, 54, 'CO₂ ilmasta', { size: 12 });
  s += arrow(140, 200, 186, 168, { color: C.blue, width: 3 }) + pill(84, 204, 'vesi maasta', { size: 12, stroke: C.blue });
  if (!o.dark) s += arrow(250, 100, 330, 120, { color: C.leaf, width: 3 }) + pill(350, 132, 'O₂ ilmaan', { size: 12, stroke: C.leaf }) + pill(200, 88, o.carbon ?? 'sokeria', { size: 12, bg: '#fff3c4', stroke: C.sun });
  else s += pill(200, 88, 'ei valoa: ei sokeria', { size: 12, stroke: C.red });
  return figure(400, 214, s, o.label);
}

/** A chain of building blocks: starch from glucose units, a protein from amino acids. */
export function chain(o: { kind: 'starch' | 'protein' | 'sugar'; label: string; n?: number }): Paint {
  const n = o.n ?? (o.kind === 'sugar' ? 1 : 9), colors = ['#e0533f', '#3b7fd6', '#2f9e5b', '#f4c542', '#7a5bc7', '#e98bb8'];
  let s = '';
  const w = 36, x0 = 200 - (n - 1) * w / 2;
  for (let i = 0; i < n; i++) {
    const x = x0 + i * w, y = 76 + (o.kind === 'protein' ? Math.sin(i * 0.9) * 16 : 0);
    if (i) s += `<line x1="${x - w}" y1="${76 + (o.kind === 'protein' ? Math.sin((i - 1) * 0.9) * 16 : 0)}" x2="${x}" y2="${y}" stroke="${C.ink}" stroke-width="3"/>`;
    s += o.kind === 'protein'
      ? `<circle cx="${x}" cy="${y}" r="14" fill="${colors[(i * 7) % 6]}" stroke="${C.ink}" stroke-width="2"/>`
      : `<path d="M${x - 14} ${y} l7 -12 h14 l7 12 l-7 12 h-14z" fill="${o.kind === 'sugar' ? C.sun : '#f2e6c8'}" stroke="${C.ink}" stroke-width="2"/>`;
  }
  const legend = o.kind === 'protein' ? 'yksi pallo = yksi aminohappo' : o.kind === 'starch' ? 'yksi kuusikulmio = yksi glukoosiosa' : 'yksi sokeriosa';
  s += tx(200, 136, legend, { size: 13, fill: C.soft });
  return figure(400, 148, s, o.label);
}

/** A fat molecule: glycerol with three fatty-acid tails. */
export function triglyceride(label: string): Paint {
  let s = `<rect x="70" y="30" width="44" height="120" rx="10" fill="${C.sun}" stroke="${C.ink}" stroke-width="2"/>` + tx(92, 170, 'glyseroli', { size: 12 });
  for (let k = 0; k < 3; k++) {
    const y = 50 + k * 40;
    let d = `M114 ${y}`;
    for (let i = 1; i <= 12; i++) d += ` L${114 + i * 20} ${y + (i % 2 ? -8 : 8)}`;
    s += `<path d="${d}" fill="none" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/>`;
  }
  s += tx(270, 170, 'kolme rasvahappotähdettä', { size: 12 });
  return figure(400, 180, s, label);
}

/** A ruler and the thing measured: zero at the edge, or zero off by mistake. */
export function ruler(o: { length: number; max?: number; zeroOff?: number; label: string; reading?: string }): Paint {
  const max = o.max ?? 15, x0 = 30, W = 340, px = (cm: number) => x0 + W * cm / max, off = o.zeroOff ?? 0;
  let s = `<rect x="${px(off)}" y="34" width="${px(off + o.length) - px(off)}" height="36" rx="4" fill="${C.sky}" stroke="${C.ink}" stroke-width="2"/>`;
  s += `<rect x="${x0 - 10}" y="72" width="${W + 20}" height="40" rx="4" fill="#f4e3b6" stroke="${C.ink}" stroke-width="2"/>`;
  for (let mm = 0; mm <= max * 10; mm++) {
    const x = px(mm / 10), h = mm % 10 === 0 ? 14 : mm % 5 === 0 ? 10 : 6;
    s += `<line x1="${x.toFixed(1)}" y1="72" x2="${x.toFixed(1)}" y2="${72 + h}" stroke="${C.ink}" stroke-width="${mm % 10 ? 0.8 : 1.4}"/>`;
    if (mm % 10 === 0) s += tx(x, 102, String(mm / 10), { size: 11, weight: 600 });
  }
  s += `<line x1="${px(off)}" y1="28" x2="${px(off)}" y2="90" stroke="${off ? C.red : C.leaf}" stroke-width="2"/><line x1="${px(off + o.length)}" y1="28" x2="${px(off + o.length)}" y2="90" stroke="${C.ink}" stroke-width="1.5" stroke-dasharray="3 3"/>`;
  if (o.reading) s += pill(px(off + o.length), 136, o.reading, { size: 13, stroke: off ? C.red : C.leaf });
  if (off) s += tx(px(off) - 4, 22, 'nolla sivussa', { size: 12, fill: C.red, anchor: 'start' });
  return figure(400, o.reading ? 146 : 120, s, o.label);
}

/** Repeated readings on a scale whose marks are one resolution step apart. */
export function readings(o: { from: number; to: number; step: number; values: number[]; diff?: [number, number]; label: string; unit?: string; stepName?: string }): Paint {
  const n = Math.round((o.to - o.from) / o.step), x0 = 40, W = 320, px = (v: number) => x0 + W * (v - o.from) / (o.to - o.from);
  let s = `<line x1="${x0}" y1="90" x2="${x0 + W}" y2="90" stroke="${C.ink}" stroke-width="2"/>`;
  for (let i = 0; i <= n; i++) {
    const v = o.from + i * o.step, x = px(v);
    s += `<line x1="${x}" y1="82" x2="${x}" y2="98" stroke="${C.ink}" stroke-width="1.5"/>` + tx(x, 116, v.toFixed(o.step < 1 ? (o.step < 0.1 ? 2 : 1) : 0).replace('.', ','), { size: 11, weight: 600, fill: C.soft });
  }
  const seen: Record<string, number> = {};
  o.values.forEach(v => { const k = v.toFixed(3); seen[k] = (seen[k] ?? 0) + 1; s += `<circle cx="${px(v)}" cy="${78 - (seen[k]! - 1) * 16}" r="7" fill="${C.pond}" stroke="#fff" stroke-width="1.5"/>`; });
  if (o.diff) {
    const [a, b] = o.diff;
    s += `<path d="M${px(a)} 136 V146 H${px(b)} V136" fill="none" stroke="${C.red}" stroke-width="2"/>` + tx((px(a) + px(b)) / 2, 164, `ero ${(b - a).toFixed(1).replace('.', ',')} ${o.unit ?? 'cm'}`, { size: 13, fill: C.red });
  }
  s += tx(x0, 30, `${o.stepName ?? 'jakoväli'} ${String(o.step).replace('.', ',')} ${o.unit ?? 'cm'}`, { size: 12, anchor: 'start', fill: C.soft });
  return figure(400, o.diff ? 172 : 126, s, o.label);
}

/** A scale with an empty dish: tare sets the reading to zero, then only the sample is weighed. */
export function tare(o: { reading: string; sample?: boolean; label: string; note?: string }): Paint {
  let s = `<rect x="110" y="110" width="180" height="56" rx="10" fill="#dfe6e8" stroke="${C.ink}" stroke-width="2"/><rect x="140" y="124" width="90" height="28" rx="4" fill="#1d2b30"/>` +
    tx(185, 144, o.reading, { size: 16, fill: '#7dff9a' }) + `<circle cx="258" cy="138" r="11" fill="${C.sun}" stroke="${C.ink}" stroke-width="1.5"/>` + tx(258, 142, 'T', { size: 12 });
  s += `<rect x="130" y="98" width="140" height="10" rx="3" fill="${C.metal}" stroke="${C.ink}" stroke-width="1.5"/><path d="M150 98 l8 -36 h84 l8 36z" fill="#f3f6f8" stroke="${C.ink}" stroke-width="2"/>`;
  if (o.sample) s += `<ellipse cx="200" cy="88" rx="26" ry="10" fill="#c9b98a" stroke="${C.ink}" stroke-width="1.5"/>`;
  s += tx(296, 142, '← taaraus', { size: 11, anchor: 'start', fill: C.soft });
  if (o.note) s += tx(200, 194, o.note, { size: 13, fill: C.soft });
  return figure(400, o.note ? 204 : 176, s, o.label);
}

/**
 * A measuring cylinder or jug: read the bottom of the curved surface with the eye level with it.
 * `scale` numbers the lines (the surface sits on line 3); `mark` is the pill text at the surface.
 */
export function meniscus(label: string, o: { mark?: string; jug?: boolean; scale?: string } = {}): Paint {
  let s = `<path d="M150 20 v150 q0 10 10 10 h40 q10 0 10 -10 v-150" fill="#fff" stroke="${C.ink}" stroke-width="2"/>`;
  if (o.jug) s += `<path d="M211 44 q36 4 36 40 q0 36 -36 40" fill="none" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>`;
  s += `<path d="M152 93 q28 14 56 0 v75 q0 8 -8 8 h-40 q-8 0 -8 -8z" fill="#cfe6f6"/>`;
  for (let v = 1; v <= 6; v++) {
    const y = 172 - v * 24;
    s += `<line x1="150" y1="${y}" x2="${o.scale ? 166 : v % 2 ? 160 : 168}" y2="${y}" stroke="${C.ink}" stroke-width="1.4"/>`;
    if (o.scale) s += tx(171, y + 4, String(v), { size: 12, anchor: 'start' });
  }
  if (o.scale) s += tx(180, 16, o.scale, { size: 12, fill: C.soft });
  s += `<line x1="70" y1="100" x2="300" y2="100" stroke="${C.leaf}" stroke-width="2" stroke-dasharray="5 4"/>` + tx(60, 105, '👁', { size: 22, weight: 400 });
  s += pill(o.jug ? 320 : 300, o.jug ? 72 : 83, o.mark ?? 'meniskin alin kohta', { size: 12, stroke: C.leaf });
  return figure(400, 190, s, label);
}

/** Two measuring tools side by side: capacity and the size of one division. */
export function tools(o: { items: { name: string; cap: string; div: string; ticks: number; ok?: boolean }[]; label: string }): Paint {
  let s = '';
  o.items.forEach((it, i) => {
    const x = 200 + (i - (o.items.length - 1) / 2) * 200;
    s += `<rect x="${x - 18}" y="20" width="36" height="140" rx="6" fill="#fff" stroke="${it.ok ? C.leaf : C.ink}" stroke-width="${it.ok ? 3 : 2}"/>`;
    for (let k = 1; k < it.ticks; k++) s += `<line x1="${x - 18}" y1="${160 - k * 140 / it.ticks}" x2="${x - (k % 5 ? 8 : 2)}" y2="${160 - k * 140 / it.ticks}" stroke="${C.ink}" stroke-width="1"/>`;
    s += tx(x, 182, it.name, { size: 13 }) + tx(x, 200, `${it.cap ? `${it.cap} · ` : ''}jakoväli ${it.div}`, { size: 12, fill: C.soft, weight: 600 });
    if (it.ok !== undefined) s += mark(it.ok ? 'ok' : 'no', x + 30, 24);
  });
  return figure(400, 210, s, o.label);
}
