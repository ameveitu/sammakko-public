import type { Paint } from '../../engine/types';
import { C, arrow, figure, pill, seeded, tx } from './kit';

/** A small thermometer: bulb at the bottom, filled to `value` in [min, max]. */
export function thermo(x: number, y: number, value: number, min = -30, max = 130, h = 70) {
  const f = Math.max(0.05, Math.min(1, (value - min) / (max - min))), top = y - h;
  return `<rect x="${x - 5}" y="${top}" width="10" height="${h}" rx="5" fill="#fff" stroke="${C.ink}" stroke-width="1.5"/>` +
    `<rect x="${x - 2.5}" y="${y - h * f}" width="5" height="${h * f}" fill="${C.red}"/><circle cx="${x}" cy="${y + 5}" r="8" fill="${C.red}" stroke="${C.ink}" stroke-width="1.5"/>`;
}
const warmth = (t: number) => t >= 40 ? '#f6b39f' : t >= 25 ? C.warm : t >= 12 ? '#eef2f3' : C.cool;

/** Two bodies joined by a rod: energy moves from the warmer to the cooler one. */
export function heatFlow(o: { a: { t: number; name: string }; b: { t: number; name: string }; rod?: boolean; end?: number; label: string; note?: string }): Paint {
  const ta = o.end ?? o.a.t, tb = o.end ?? o.b.t;
  let s = `<rect x="24" y="48" width="110" height="96" rx="14" fill="${warmth(ta)}" stroke="${C.ink}" stroke-width="2.5"/>` +
    `<rect x="266" y="48" width="110" height="96" rx="14" fill="${warmth(tb)}" stroke="${C.ink}" stroke-width="2.5"/>`;
  s += tx(79, 36, o.a.name, { size: 14 }) + tx(321, 36, o.b.name, { size: 14 });
  s += thermo(60, 124, ta) + tx(98, 104, `${ta} °C`, { size: 15 }) + thermo(302, 124, tb) + tx(340, 104, `${tb} °C`, { size: 15 });
  if (o.rod !== false) s += `<rect x="134" y="88" width="132" height="16" fill="${C.metal}" stroke="${C.ink}" stroke-width="1.5"/>`;
  if (o.end === undefined) {
    s += `<path d="M140 70H258" stroke="${C.red}" stroke-width="6" stroke-linecap="round" stroke-dasharray="0.1 16" class="bf-flow"/>` + arrow(236, 70, 262, 70, { color: C.red, width: 3 });
    s += pill(200, 166, 'energiaa siirtyy', { size: 12, stroke: C.red });
  } else s += pill(200, 166, 'yhtä lämpimät: siirto loppuu', { size: 12, stroke: C.leaf });
  if (o.note) s += tx(200, 200, o.note, { size: 13, fill: C.soft });
  return figure(400, o.note ? 210 : 182, s, o.label);
}

/** Water in two beakers heated by the same amount. */
export function beakers(o: { items: { name: string; mass: string; level: number; t0: number; t1: number; energy?: string }[]; label: string }): Paint {
  let s = '';
  o.items.forEach((it, i) => {
    const x = 60 + i * 180, top = 150 - 90 * it.level;
    s += `<path d="M${x} 50v100q0 10 10 10h80q10 0 10-10v-100" fill="#fff" stroke="${C.ink}" stroke-width="2.5"/>` +
      `<rect x="${x + 2}" y="${top}" width="96" height="${158 - top}" fill="#cfe6f6"/>` +
      thermo(x + 82, 140, it.t1, 0, 40, 74) +
      tx(x + 50, 36, `${it.name}: ${it.mass}`, { size: 14 }) + tx(x + 40, 180, `${it.t0} °C → ${it.t1} °C`, { size: 13, fill: C.soft });
    if (it.energy) s += pill(x + 50, 204, it.energy, { size: 14, stroke: C.red });
  });
  return figure(400, o.items.some(i => i.energy) ? 214 : 190, s, o.label);
}

/** Two rods between a hot and a cold end; the better conductor warms further in the same time. */
export function conduction(o: { rods: { name: string; reach: number }[]; hot: string; cold: string; label: string }): Paint {
  let s = `<rect x="20" y="30" width="44" height="${o.rods.length * 56 + 10}" rx="8" fill="#f6b39f" stroke="${C.ink}" stroke-width="2"/>` +
    `<rect x="336" y="30" width="44" height="${o.rods.length * 56 + 10}" rx="8" fill="${C.cool}" stroke="${C.ink}" stroke-width="2"/>` +
    tx(42, 22, o.hot, { size: 13, fill: C.red }) + tx(358, 22, o.cold, { size: 13, fill: C.blue });
  s += `<defs><linearGradient id="bf-heat" x1="0" x2="1"><stop offset="0" stop-color="${C.red}"/><stop offset="1" stop-color="${C.sun}" stop-opacity=".2"/></linearGradient></defs>`;
  o.rods.forEach((r, i) => {
    const y = 46 + i * 56;
    s += `<rect x="64" y="${y}" width="272" height="20" fill="#eceff0" stroke="${C.ink}" stroke-width="1.5"/>` +
      `<rect x="64" y="${y}" width="${(272 * r.reach).toFixed(0)}" height="20" fill="url(#bf-heat)"/>` + tx(200, y + 40, r.name, { size: 13 });
    for (let k = 0; k < 9; k++) s += `<circle class="bf-jiggle" style="animation-delay:-${(k * 0.13).toFixed(2)}s;animation-duration:${k / 9 < r.reach ? 0.25 : 0.8}s" cx="${78 + k * 31}" cy="${y + 10}" r="4" fill="${C.ink}" opacity=".55"/>`;
  });
  return figure(400, 50 + o.rods.length * 56, s, o.label);
}

/** Air circulating in a closed room: up on the warm side, down on the cool side. */
export function convection(o: { warm: string; cool: string; label: string; heater?: string }): Paint {
  let s = `<rect x="30" y="20" width="340" height="160" rx="10" fill="#fbfcfd" stroke="${C.ink}" stroke-width="2.5"/>` +
    `<rect x="32" y="22" width="168" height="156" fill="${C.warm}" opacity=".6"/><rect x="200" y="22" width="168" height="156" fill="${C.cool}" opacity=".6"/>`;
  s += `<path d="M90 160 C70 90 90 50 200 50 C320 50 330 90 310 160 C290 170 110 170 90 160Z" fill="none" stroke="${C.pond}" stroke-width="3" stroke-dasharray="10 8" class="bf-flow-slow"/>`;
  s += arrow(84, 120, 82, 90, { color: C.red, width: 3.5 }) + arrow(316, 90, 318, 122, { color: C.blue, width: 3.5 });
  const heater = o.heater ?? 'lämmin', hw = Math.max(60, heater.length * 7 + 14);
  s += `<rect x="${84 - hw / 2}" y="150" width="${hw}" height="22" rx="4" fill="${C.red}" opacity=".85"/>` + tx(84, 166, heater, { size: 12, fill: '#fff' });
  s += tx(112, 100, o.warm, { size: 14, fill: C.red, anchor: 'start' }) + tx(112, 118, 'nousee', { size: 13, fill: C.red, anchor: 'start' }) +
    tx(288, 100, o.cool, { size: 14, fill: C.blue, anchor: 'end' }) + tx(288, 118, 'laskee', { size: 13, fill: C.blue, anchor: 'end' });
  return figure(400, 192, s, o.label);
}

/** A source radiates to two stones; a screen blocks the straight path to one of them. */
export function radiation(o: { label: string; source?: 'sun' | 'fire'; space?: boolean }): Paint {
  let s = o.space ? `<rect x="0" y="0" width="400" height="190" rx="12" fill="#0f2233"/>` : '';
  s += `<circle cx="56" cy="95" r="30" fill="${C.sun}" class="bf-glow"/><circle cx="56" cy="95" r="22" fill="#f8d65a"/>`;
  s += `<path d="M90 80 L300 46" stroke="${C.red}" stroke-width="3" stroke-dasharray="8 7" class="bf-flow"/><path d="M90 112 L196 136" stroke="${C.red}" stroke-width="3" stroke-dasharray="8 7" class="bf-flow"/>`;
  s += `<ellipse cx="320" cy="48" rx="26" ry="18" fill="#f6b39f" stroke="${C.ink}" stroke-width="2"/><ellipse cx="320" cy="146" rx="26" ry="18" fill="${C.cool}" stroke="${C.ink}" stroke-width="2"/>`;
  s += `<rect x="200" y="114" width="12" height="62" fill="${C.grey}" stroke="${C.ink}" stroke-width="1.5"/>`;
  const ink = o.space ? '#fff' : C.ink;
  s += tx(320, 82, 'lämpenee', { size: 12, fill: o.space ? '#ffb4a3' : C.red }) + tx(320, 180, 'ei saa säteilyä', { size: 12, fill: o.space ? '#9cc6ff' : C.blue }) + tx(206, 106, 'varjostin', { size: 12, fill: ink });
  return figure(400, 190, s, o.label);
}

/** A cabin with the three ways energy moves: conduction, convection and radiation. */
export function heatRoutes(label: string): Paint {
  let s = `<path d="M40 80 L200 20 L360 80 V184 H40Z" fill="#fffaf0" stroke="${C.ink}" stroke-width="2.5"/>` +
    `<rect x="340" y="80" width="20" height="104" fill="${C.metal}"/>`;
  s += `<rect x="62" y="134" width="56" height="50" rx="4" fill="#9b5b3c"/><path d="M76 168 q14 -40 28 0z" fill="${C.sun}" class="bf-glow"/>`;
  s += `<path d="M150 170 C130 120 160 96 220 96 C280 96 300 120 280 170" fill="none" stroke="${C.pond}" stroke-width="2.5" stroke-dasharray="8 7" class="bf-flow-slow"/>`;
  s += `<path d="M122 150 L200 150" stroke="${C.red}" stroke-width="3" stroke-dasharray="5 6" class="bf-flow"/>`;
  s += arrow(300, 130, 372, 130, { color: C.red, width: 3 });
  s += pill(160, 140, 'säteily', { size: 12, stroke: C.red }) + pill(220, 88, 'kuljettuminen', { size: 12, stroke: C.pond }) + pill(330, 116, 'johtuminen', { size: 12, stroke: C.ink });
  s += tx(90, 106, '25 °C', { size: 13, fill: C.red }) + tx(384, 60, '10 °C', { size: 13, fill: C.blue, anchor: 'end' });
  return figure(400, 196, s, label);
}

/** A cart moving with speed v: kinetic energy ½mv². */
export function carts(o: { items: { m: string; v: string; e: string; long?: number }[]; label: string }): Paint {
  let s = '';
  o.items.forEach((it, i) => {
    const y = 26 + i * 62, len = 50 + 50 * (it.long ?? 1);
    s += `<line x1="20" y1="${y + 40}" x2="380" y2="${y + 40}" stroke="${C.line}" stroke-width="2"/>` +
      `<rect x="30" y="${y + 6}" width="70" height="26" rx="5" fill="${C.sun}" stroke="${C.ink}" stroke-width="2"/>` +
      `<circle cx="46" cy="${y + 34}" r="6" fill="${C.ink}"/><circle cx="84" cy="${y + 34}" r="6" fill="${C.ink}"/>` + tx(65, y + 24, it.m, { size: 13 });
    s += arrow(106, y + 19, 106 + len, y + 19, { color: C.pond, width: 3.5 }) + tx(112 + len, y + 24, it.v, { size: 13, anchor: 'start', fill: C.pond });
    s += pill(330, y + 24, it.e, { size: 14, stroke: C.red });
  });
  return figure(400, 30 + o.items.length * 62, s, o.label);
}

/** A load above a reference level: potential energy mgh. */
export function heights(o: { items: { m: string; h: number; e: string }[]; zero?: { at: number; text: string }; label: string; scale?: number }): Paint {
  const base = 190, k = o.scale ?? 28;
  let s = `<line x1="20" y1="${base}" x2="380" y2="${base}" stroke="${C.ink}" stroke-width="2.5"/>` + tx(24, base + 16, 'maa 0 m', { size: 11, anchor: 'start', fill: C.soft });
  for (let m = 1; m <= 6; m++) s += `<line x1="40" y1="${base - m * k}" x2="48" y2="${base - m * k}" stroke="${C.soft}" stroke-width="1.5"/>` + tx(36, base - m * k + 4, `${m} m`, { size: 10, anchor: 'end', fill: C.soft, weight: 600 });
  s += `<line x1="44" y1="${base}" x2="44" y2="${base - 6 * k}" stroke="${C.soft}" stroke-width="1.5"/>`;
  if (o.zero) s += `<line x1="50" y1="${base - o.zero.at * k}" x2="380" y2="${base - o.zero.at * k}" stroke="${C.purple}" stroke-width="2" stroke-dasharray="6 4"/>` + tx(378, base - o.zero.at * k - 6, o.zero.text, { size: 12, anchor: 'end', fill: C.purple });
  o.items.forEach((it, i) => {
    const x = 110 + i * 130, y = base - it.h * k;
    s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${base}" stroke="${C.line}" stroke-width="1.5" stroke-dasharray="4 4"/>` +
      `<path d="M${x - 22} ${y - 26}h44l-6 26h-32z" fill="#c99b62" stroke="${C.ink}" stroke-width="2"/>` + tx(x, y - 10, it.m, { size: 12 }) +
      pill(x + 34, y - 8, it.e, { size: 13, stroke: C.red, anchor: 'start' });
  });
  return figure(400, base + 22, s, o.label);
}

type Dir = 'left' | 'right' | 'up' | 'down';
/** An object with force arrows (and optionally the direction it moves). */
export function forces(o: { thing: 'raft' | 'box' | 'cart' | 'basket' | 'puck' | 'foot'; forces: { dir: Dir; text: string; color?: string; long?: number }[]; moves?: Dir; net?: { dir: 'left' | 'right'; text: string }; surface?: 'water' | 'floor' | 'rough' | 'none'; label: string; note?: string }): Paint {
  const cx = 200, cy = 100;
  let s = '';
  if (o.surface === 'water') s += `<path d="M0 132 q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0V170H0Z" fill="#cfe6f6"/>`;
  if (o.surface === 'floor' || o.surface === 'rough') s += `<rect x="20" y="130" width="360" height="12" fill="${o.surface === 'rough' ? '#b49a7a' : '#d9d2c3'}"/>` + (o.surface === 'rough' ? Array.from({ length: 30 }, (_, i) => `<path d="M${24 + i * 12} 130l4 -4 4 4" fill="#b49a7a"/>`).join('') : '');
  const body: Record<string, string> = {
    raft: `<rect x="150" y="108" width="100" height="24" rx="4" fill="#c99b62" stroke="${C.ink}" stroke-width="2"/><path d="M160 108v24M180 108v24M200 108v24M220 108v24M240 108v24" stroke="#8c6a42" stroke-width="2"/>`,
    box: `<rect x="160" y="76" width="80" height="54" rx="4" fill="#d9a865" stroke="${C.ink}" stroke-width="2"/>`,
    cart: `<rect x="156" y="78" width="88" height="40" rx="5" fill="#7fb3a0" stroke="${C.ink}" stroke-width="2"/><circle cx="176" cy="121" r="9" fill="${C.grey}" stroke="${C.ink}" stroke-width="2"/><circle cx="224" cy="121" r="9" fill="${C.grey}" stroke="${C.ink}" stroke-width="2"/>`,
    basket: `<path d="M168 82h64l-8 46h-48z" fill="#c99b62" stroke="${C.ink}" stroke-width="2"/>`,
    puck: `<ellipse cx="200" cy="120" rx="40" ry="12" fill="${C.purple}" stroke="${C.ink}" stroke-width="2"/>`,
    foot: `<path d="M162 128 q-4 -26 14 -30 l28 -2 q10 -30 20 -30 h10 v40 q30 4 32 22z" fill="#f2c9a5" stroke="${C.ink}" stroke-width="2"/>`,
  };
  s += body[o.thing];
  const end = (d: Dir, len: number) => d === 'left' ? [cx - 60 - len, cy + 6] : d === 'right' ? [cx + 60 + len, cy + 6] : d === 'up' ? [cx, cy - 34 - len] : [cx, cy + 50 + len];
  const start = (d: Dir) => d === 'left' ? [cx - 54, cy + 6] : d === 'right' ? [cx + 54, cy + 6] : d === 'up' ? [cx, cy - 26] : [cx, cy + 34];
  o.forces.forEach(f => {
    const [x1, y1] = start(f.dir), [x2, y2] = end(f.dir, 50 * (f.long ?? 1));
    s += arrow(x1!, y1!, x2!, y2!, { color: f.color ?? C.red, width: 4, head: 12 });
    // Side labels start at the body and run outwards, so a long label never covers the thing.
    const lx = f.dir === 'left' ? x1! - 2 : f.dir === 'right' ? x1! + 2 : x2! + 10, ly = f.dir === 'up' ? y2! + 6 : f.dir === 'down' ? y2! - 4 : y2! - 12;
    s += tx(lx, ly, f.text, { size: 13, fill: f.color ?? C.red, anchor: f.dir === 'left' ? 'end' : 'start' });
  });
  if (o.moves) {
    const sign = o.moves === 'left' ? -1 : 1;
    s += arrow(cx - sign * 40, 160, cx + sign * 40, 160, { color: C.pond, width: 3, dash: '6 5' }) + tx(cx, 182, 'liike', { size: 12, fill: C.pond });
  }
  if (o.net) {
    // The net force sits under the floor, in its own colour, so it never mixes with the separate forces.
    const sign = o.net.dir === 'left' ? -1 : 1;
    s += arrow(cx - sign * 30, 164, cx + sign * 40, 164, { color: C.pond, width: 5, head: 13 }) + tx(cx, 190, o.net.text, { size: 13, fill: C.pond });
  }
  if (o.note) s += tx(200, 24, o.note, { size: 13, fill: C.soft });
  return figure(400, o.moves || o.net ? 198 : 170, s, o.label);
}

/** Winches lifting baskets; with times, the faster lift moves faster on screen. */
let liftClips = 0;
export function lifts(o: { items: { name: string; force: string; s: string; t?: number; hold?: boolean; work?: string }[]; label: string }): Paint {
  let s = '';
  const n = o.items.length, slot = 400 / n;
  o.items.forEach((it, i) => {
    const x = slot * (i + 0.5);
    s += `<rect x="${x - 40}" y="14" width="80" height="12" fill="${C.grey}"/><circle cx="${x}" cy="32" r="10" fill="${C.metal}" stroke="${C.ink}" stroke-width="2"/>`;
    const anim = it.hold || !it.t ? '' : ` class="bf-lift" style="animation-duration:${it.t * 1.2}s"`;
    // Only the rope is clipped below the pulley, so it never pokes out above it while the basket rises.
    const clip = `bf-lift-clip${++liftClips}`;
    s += `<clipPath id="${clip}"><rect x="${x - 10}" y="42" width="20" height="130"/></clipPath>` +
      `<g clip-path="url(#${clip})"><g${anim}><line x1="${x}" y1="42" x2="${x}" y2="122" stroke="${C.ink}" stroke-width="2"/></g></g>` +
      `<g${anim}><path d="M${x - 22} 122h44l-6 28h-32z" fill="#c99b62" stroke="${C.ink}" stroke-width="2"/>` +
      arrow(x + 30, 146, x + 30, 108, { color: C.red, width: 3.5 }) + tx(x + 36, 102, it.force, { size: 12, fill: C.red, anchor: 'start' }) + `</g>`;
    if (!it.hold) s += `<path d="M${x - 40} 154 V100" stroke="${C.pond}" stroke-width="2" stroke-dasharray="4 4"/>` + tx(x - 44, 132, it.s, { size: 12, fill: C.pond, anchor: 'end' });
    else s += tx(x - 34, 136, '0 m', { size: 12, fill: C.pond, anchor: 'end' });
    s += `<line x1="${x - 50}" y1="170" x2="${x + 50}" y2="170" stroke="${C.ink}" stroke-width="2"/>` + tx(x, 190, it.name + (it.t ? `: ${it.t} s` : ''), { size: 13 });
    if (it.work) s += pill(x, 214, it.work, { size: 13, stroke: C.pond });
  });
  return figure(400, o.items.some(i => i.work) ? 224 : 200, s, o.label);
}

/** A lamp, an obstacle and a wall: light travels in straight lines, the shadow is where it cannot reach. */
export function shadow(o: { at?: number; moved?: number; label: string; source?: 'lamp' | 'torch' }): Paint {
  const L = [46, 100], px = 170, half = 18, wall = 360;
  const at = o.at ?? 100;
  const proj = (y: number) => L[1]! + (y - L[1]!) * (wall - L[0]!) / (px - L[0]!);
  const draw = (y: number, ghost: boolean) => {
    const top = y - half, bot = y + half, st = proj(top), sb = proj(bot);
    const op = ghost ? ' opacity=".35"' : '';
    return `<g${op}><path d="M${L[0]} ${L[1]} L${wall} ${st}" stroke="${C.sun}" stroke-width="2"/><path d="M${L[0]} ${L[1]} L${wall} ${sb}" stroke="${C.sun}" stroke-width="2"/>` +
      `<rect x="${wall - 2}" y="${st}" width="10" height="${sb - st}" fill="#3a4a52"/>` +
      `<rect x="${px - 4}" y="${top}" width="8" height="${half * 2}" fill="${C.purple}" stroke="${C.ink}" stroke-width="1.5"/></g>`;
  };
  let s = `<path d="M${L[0]} ${L[1]} L${wall} 6 L${wall} 194Z" fill="${C.glow}" opacity=".45"/>`;
  s += `<rect x="${wall}" y="4" width="14" height="192" fill="#e9e4d8" stroke="${C.ink}" stroke-width="1.5"/>`;
  if (o.moved !== undefined) s += draw(o.moved, true);
  s += draw(at, false);
  s += `<circle cx="${L[0]}" cy="${L[1]}" r="16" fill="${C.sun}" stroke="${C.ink}" stroke-width="2" class="bf-glow"/><circle cx="${L[0]}" cy="${L[1]}" r="9" fill="#fff6c8"/>`;
  if (o.moved !== undefined) s += arrow(px + 20, o.moved, px + 20, at, { color: C.pond, width: 3 }) + arrow(wall - 16, proj(o.moved), wall - 16, proj(at), { color: C.pond, width: 3 });
  s += tx(L[0]!, 140, 'lamppu', { size: 12 }) + tx(px, 196, 'este', { size: 12 }) + tx(wall - 8, 214, 'seinä', { size: 12, anchor: 'end' });
  return figure(400, 220, s, o.label);
}

/** Two waves for comparing pitch (how often) and loudness (how wide). */
export function waves(o: { items: { title: string; f: number; a: number; note?: string }[]; label: string }): Paint {
  let s = '';
  o.items.forEach((w, i) => {
    const y = 50 + i * 84, x0 = 120, W = 260;
    let d = `M${x0} ${y}`;
    for (let x = 0; x <= W; x += 2) d += ` L${x0 + x} ${(y - w.a * 26 * Math.sin((x / W) * Math.PI * 2 * w.f)).toFixed(1)}`;
    s += `<line x1="${x0}" y1="${y}" x2="${x0 + W}" y2="${y}" stroke="${C.line}" stroke-width="1"/><path d="${d}" fill="none" stroke="${i ? C.purple : C.pond}" stroke-width="3"/>`;
    s += tx(10, y - 4, w.title, { size: 13, anchor: 'start' });
    if (w.note) s += tx(10, y + 14, w.note, { size: 12, anchor: 'start', fill: C.soft, weight: 600 });
  });
  return figure(400, 30 + o.items.length * 84, s, o.label);
}

/** A vibrating drum pushes the air: the vibration travels to the ear, the air stays put. */
export function soundPath(o: { label: string; vacuum?: boolean; hz?: string }): Paint {
  const rnd = seeded(3);
  let s = `<rect x="22" y="70" width="58" height="56" rx="6" fill="#d9705a" stroke="${C.ink}" stroke-width="2"/><ellipse cx="80" cy="98" rx="6" ry="28" fill="#f6e7d2" stroke="${C.ink}" stroke-width="2" class="bf-jiggle" style="animation-duration:.08s"/>`;
  if (o.vacuum) {
    s += `<path d="M100 40 h200 v116 h-200z" fill="#eef1f4" stroke="${C.grey}" stroke-width="2" stroke-dasharray="6 5"/>` + tx(200, 104, 'tyhjiö: ei ilmaa', { size: 14, fill: C.soft });
    s += tx(350, 100, '🔇', { size: 34, weight: 400 });
  } else {
    for (let c = 0; c < 9; c++) for (let r = 0; r < 5; r++) {
      const x = 104 + c * 24 + rnd() * 6, y = 50 + r * 24 + rnd() * 6;
      s += `<circle class="bf-wobble" style="animation-delay:-${(c * 0.12).toFixed(2)}s" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="${C.blue}" opacity=".75"/>`;
    }
    s += `<path d="M110 160 H300" stroke="${C.pond}" stroke-width="3" stroke-dasharray="10 8" class="bf-flow"/>` + arrow(290, 160, 316, 160, { color: C.pond, width: 3 }) + tx(206, 182, 'värähtely kulkee, ilma jää paikalleen', { size: 12, fill: C.pond });
    s += tx(352, 110, '👂', { size: 36, weight: 400 });
  }
  if (o.hz) s += pill(52, 150, o.hz, { size: 12 });
  s += tx(52, 58, 'lähde', { size: 12 }) + tx(200, 30, o.vacuum ? '' : 'väliaine: ilma', { size: 12 }) + tx(352, 58, 'kuulija', { size: 12 });
  return figure(400, 192, s, o.label);
}

const SPECTRUM = [
  { name: 'radio', color: '#8aa1b8' }, { name: 'infrapuna', color: '#c96b5c' }, { name: 'valo', color: 'url(#bf-rainbow)' },
  { name: 'UV', color: '#8f6ad8' }, { name: 'röntgen', color: '#5f6a8a' }, { name: 'gamma', color: '#2f3550' },
];
/** The electromagnetic spectrum from low to high photon energy; optionally the ionising boundary. */
export function spectrum(o: { mark?: string; ionizing?: boolean; label: string }): Paint {
  let s = `<defs><linearGradient id="bf-rainbow" x1="0" x2="1"><stop offset="0" stop-color="#e53935"/><stop offset=".3" stop-color="#fdd835"/><stop offset=".55" stop-color="#43a047"/><stop offset=".8" stop-color="#1e88e5"/><stop offset="1" stop-color="#8e24aa"/></linearGradient></defs>`;
  const w = 60, x0 = 20;
  SPECTRUM.forEach((b, i) => {
    const x = x0 + i * w, hot = o.mark === b.name;
    s += `<rect x="${x}" y="50" width="${w}" height="40" fill="${b.color}" stroke="${hot ? C.ink : '#fff'}" stroke-width="${hot ? 3 : 1}"/>` + tx(x + w / 2, 110, b.name, { size: 12, weight: hot ? 900 : 700 });
  });
  let d = 'M20 32';
  for (let x = 0; x <= 360; x += 2) d += ` L${20 + x} ${(32 - 9 * Math.sin(x * x / 2600)).toFixed(1)}`;
  s += `<path d="${d}" fill="none" stroke="${C.soft}" stroke-width="2"/>`;
  s += arrow(30, 132, 370, 132, { color: C.red, width: 2.5 }) + tx(200, 150, 'fotonin energia kasvaa', { size: 12, fill: C.red });
  if (o.ionizing) s += `<line x1="${x0 + 3 * w + 30}" y1="40" x2="${x0 + 3 * w + 30}" y2="98" stroke="${C.red}" stroke-width="3" stroke-dasharray="6 4"/>` +
    tx(x0 + 1.5 * w, 172, 'ionisoimaton', { size: 13, fill: C.leaf }) + tx(x0 + 4.75 * w, 172, 'ionisoiva', { size: 13, fill: C.red });
  return figure(400, o.ionizing ? 182 : 160, s, o.label);
}

/** Particle radiation: an alpha particle (2p + 2n) or a beta electron leaving a nucleus. */
export function decay(o: { kind: 'alpha' | 'beta' | 'both'; label: string }): Paint {
  let s = '';
  const nucleus = (cx: number, cy: number) => {
    let g = '';
    for (let i = 0; i < 14; i++) { const a = i * 2.4, r = 5 * Math.sqrt(i + 0.5); g += `<circle cx="${(cx + r * Math.cos(a)).toFixed(1)}" cy="${(cy + r * Math.sin(a)).toFixed(1)}" r="6" fill="${i % 2 ? C.grey : C.red}" stroke="#fff"/>`; }
    return g;
  };
  s += nucleus(90, 100) + tx(90, 160, 'ydin muuttuu', { size: 12 });
  if (o.kind !== 'beta') {
    s += `<g class="bf-shoot"><circle cx="230" cy="62" r="6" fill="${C.red}" stroke="#fff"/><circle cx="242" cy="62" r="6" fill="${C.grey}" stroke="#fff"/><circle cx="230" cy="74" r="6" fill="${C.grey}" stroke="#fff"/><circle cx="242" cy="74" r="6" fill="${C.red}" stroke="#fff"/></g>` +
      arrow(130, 86, 214, 70, { color: C.red, width: 2.5 }) + tx(290, 40, 'alfa: 2 p + 2 n', { size: 13 });
  }
  if (o.kind !== 'alpha') s += `<g class="bf-shoot"><circle cx="236" cy="138" r="6" fill="${C.blue}" stroke="#fff"/></g>` + arrow(130, 114, 222, 136, { color: C.blue, width: 2.5 }) + tx(290, 168, 'beeta: elektroni', { size: 13 });
  return figure(400, 176, s, o.label);
}

/** The Sun lights the half of the Earth that faces it; the island is in day or night. */
export function dayNight(o: { island: 'day' | 'night'; label: string }): Paint {
  const ex = 270, ey = 100, r = 62;
  let s = `<rect x="0" y="0" width="400" height="200" rx="14" fill="#0f2233"/>`;
  s += `<circle cx="10" cy="100" r="58" fill="${C.sun}" class="bf-glow"/>`;
  for (let k = -2; k <= 2; k++) s += `<path d="M76 ${100 + k * 26} H${ex - r - 10}" stroke="${C.glow}" stroke-width="2" stroke-dasharray="6 8" class="bf-flow"/>`;
  s += `<circle cx="${ex}" cy="${ey}" r="${r}" fill="#2f6fd0"/><path d="M${ex} ${ey - r} A${r} ${r} 0 0 0 ${ex} ${ey + r}Z" fill="#7fb8ff"/><path d="M${ex} ${ey - r} A${r} ${r} 0 0 1 ${ex} ${ey + r}Z" fill="#14335c"/>`;
  const ix = o.island === 'day' ? ex - r + 8 : ex + r - 8;
  s += `<circle cx="${ix}" cy="${ey}" r="8" fill="${C.leaf}" stroke="#fff" stroke-width="2"/>` + tx(ix + (o.island === 'day' ? -14 : 14), ey - 14, 'A', { size: 14, fill: '#fff', anchor: o.island === 'day' ? 'end' : 'start' });
  s += `<path d="M${ex - 30} ${ey + r + 14} A40 12 0 0 0 ${ex + 30} ${ey + r + 14}" fill="none" stroke="#fff" stroke-width="2"/>` + arrow(ex + 22, ey + r + 22, ex + 34, ey + r + 12, { color: '#fff', width: 2, head: 7 });
  s += tx(ex - 34, 28, 'päivä', { size: 13, fill: C.glow }) + tx(ex + 34, 28, 'yö', { size: 13, fill: '#9cc6ff' });
  return figure(400, 200, s, o.label);
}

/** From small to large: Moon, Earth–Moon, Solar System, Milky Way. */
export function cosmicAddress(o: { label: string; cluster?: boolean }): Paint {
  let s = `<rect x="0" y="0" width="400" height="210" rx="14" fill="#0f2233"/>`;
  const rnd = seeded(9);
  for (let i = 0; i < 60; i++) s += `<circle cx="${(rnd() * 400).toFixed(0)}" cy="${(rnd() * 210).toFixed(0)}" r="${(rnd() * 1.3 + 0.3).toFixed(1)}" fill="#fff" opacity=".6"/>`;
  s += `<ellipse cx="290" cy="105" rx="100" ry="70" fill="#3b4d7a" opacity=".6"/><ellipse cx="290" cy="105" rx="60" ry="22" fill="#cdd7ff" opacity=".35" transform="rotate(-18 290 105)"/>` + tx(290, 196, 'Linnunrata', { size: 13, fill: '#fff' });
  if (o.cluster) { for (let i = 0; i < 26; i++) s += `<circle cx="${(330 + (rnd() - 0.5) * 22).toFixed(1)}" cy="${(70 + (rnd() - 0.5) * 22).toFixed(1)}" r="1.6" fill="#fff6c8"/>`; s += pill(350, 46, 'tähtijoukko', { size: 11 }); }
  s += `<circle cx="262" cy="118" r="5" fill="${C.sun}"/><path d="M262 118 L180 150" stroke="#fff" stroke-width="1" stroke-dasharray="3 3"/>`;
  s += `<circle cx="140" cy="150" r="44" fill="none" stroke="#9cc6ff" stroke-width="1.5" stroke-dasharray="3 4"/><circle cx="140" cy="150" r="8" fill="${C.sun}"/><circle cx="174" cy="132" r="4" fill="#5aa0ff"/>` + tx(140, 206, 'Aurinkokunta', { size: 12, fill: '#fff' });
  s += `<path d="M174 132 L74 62" stroke="#fff" stroke-width="1" stroke-dasharray="3 3"/><circle cx="56" cy="56" r="30" fill="none" stroke="#9cc6ff" stroke-width="1.5" stroke-dasharray="3 4"/><circle cx="56" cy="56" r="10" fill="#5aa0ff"/><circle class="bf-orbit" style="transform-origin:56px 56px" cx="82" cy="56" r="4" fill="#ddd"/>` + tx(56, 104, 'Maa ja Kuu', { size: 12, fill: '#fff' });
  return figure(400, 210, s, o.label);
}
