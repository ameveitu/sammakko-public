import type { Paint } from '../../engine/types';
import { C, figure, pill, tx } from './kit';

/**
 * The circle map of the circle pages: centre O and rim points in the order the pages use
 * (E → F → A → C → D → B → H). A and H are ends of a diameter; arc A–C–B is 96°.
 * Angles are screen degrees, clockwise from the right.
 */
const RIM: Record<string, number> = { H: 15, E: 95, F: 145, A: 195, C: 227, D: 259, B: 291 };
const rad = (d: number) => (d * Math.PI) / 180;
const f1 = (v: number) => Math.round(v * 10) / 10;

export const polar = (cx: number, cy: number, r: number, deg: number): [number, number] => [f1(cx + r * Math.cos(rad(deg))), f1(cy + r * Math.sin(rad(deg)))];

/** Path of an arc that runs clockwise from `from` degrees through `sweep` degrees. */
export function arcPath(cx: number, cy: number, r: number, from: number, sweep: number) {
  const [x1, y1] = polar(cx, cy, r, from), [x2, y2] = polar(cx, cy, r, from + sweep);
  return `M${x1} ${y1} A${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${x2} ${y2}`;
}

/** A filled pie slice from the centre. */
export function wedge(cx: number, cy: number, r: number, from: number, sweep: number, fill: string, stroke = 'none') {
  const [x1, y1] = polar(cx, cy, r, from), [x2, y2] = polar(cx, cy, r, from + sweep);
  return `<path d="M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${x2} ${y2}Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
}

type Line = { from: string; to: string; color?: string; width?: number; text?: string; side?: 1 | -1; dash?: boolean; at?: number; off?: number };
type Arc = { from: string; to: string; color?: string; width?: number; text?: string; dash?: boolean; textAt?: [number, number] };
type Angle = { at: string; a: string; b: string; text?: string; color?: string; right?: boolean; cw?: boolean };

export function circleMap(o: {
  points?: string[]; centre?: boolean; rim?: { color?: string; width?: number; dash?: boolean };
  lines?: Line[]; arcs?: Arc[]; angles?: Angle[]; sector?: { from: string; to: string; color?: string };
  route?: string; pills?: { x: number; y: number; text: string; color?: string; size?: number }[];
  hot?: string[]; cx?: number; fill?: string; label: string;
}): Paint {
  const cx = o.cx ?? 200, cy = 118, r = 84;
  const at = (id: string): [number, number] => (id === 'O' ? [cx, cy] : polar(cx, cy, r, RIM[id]!));
  const deg = (id: string) => RIM[id]!;
  const cwSweep = (a: string, b: string) => (deg(b) - deg(a) + 360) % 360;
  let s = '';
  if (o.sector) s += wedge(cx, cy, r, deg(o.sector.from), cwSweep(o.sector.from, o.sector.to), o.sector.color ?? '#f6dc8a', C.sun);
  else s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${o.fill ?? "#eef5f1"}"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${o.rim?.color ?? C.ink}" stroke-width="${o.rim?.width ?? 2}"${o.rim?.dash ? ' stroke-dasharray="7 5"' : ''}/>`;
  for (const a of o.arcs ?? []) {
    const sweep = cwSweep(a.from, a.to), from = deg(a.from);
    s += `<path d="${arcPath(cx, cy, r, from, sweep)}" fill="none" stroke="${a.color ?? C.sun}" stroke-width="${a.width ?? 7}" stroke-linecap="round"${a.dash ? ' stroke-dasharray="9 7"' : ''}/>`;
    if (a.text) {
      const [x, y] = a.textAt ?? polar(cx, cy, r + 34, from + sweep / 2);
      s += pill(x, y + 4, a.text, { size: 12, stroke: a.color ?? C.sun });
    }
  }
  if (o.route) {
    const start = deg(o.route);
    s += `<path d="${arcPath(cx, cy, r, start + 6, 340)}" fill="none" stroke="${C.sun}" stroke-width="6" stroke-linecap="round"/>`;
    for (let k = 1; k <= 4; k++) {
      const d = start + k * 72, [x, y] = polar(cx, cy, r, d), t = rad(d + 90);
      const hx = Math.cos(t), hy = Math.sin(t);
      s += `<path d="M${f1(x + hx * 9)} ${f1(y + hy * 9)} L${f1(x - hx * 4 - hy * 7)} ${f1(y - hy * 4 + hx * 7)} L${f1(x - hx * 4 + hy * 7)} ${f1(y - hy * 4 - hx * 7)}Z" fill="${C.pond}"/>`;
    }
  }
  for (const l of o.lines ?? []) {
    const [x1, y1] = at(l.from), [x2, y2] = at(l.to);
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${l.color ?? C.blue}" stroke-width="${l.width ?? 3.5}" stroke-linecap="round"${l.dash ? ' stroke-dasharray="6 5"' : ''}/>`;
    if (l.text) {
      const len = Math.hypot(x2 - x1, y2 - y1) || 1, k = (l.off ?? 15) * (l.side ?? 1), t = l.at ?? 0.5;
      const nx = (-(y2 - y1) / len) * k, ny = ((x2 - x1) / len) * k;
      s += pill(f1(x1 + (x2 - x1) * t + nx), f1(y1 + (y2 - y1) * t + ny + 4), l.text, { size: 12, stroke: l.color ?? C.blue });
    }
  }
  for (const g of o.angles ?? []) {
    const [vx, vy] = at(g.at), [ax, ay] = at(g.a), [bx, by] = at(g.b);
    const ta = (Math.atan2(ay - vy, ax - vx) * 180) / Math.PI, tb = (Math.atan2(by - vy, bx - vx) * 180) / Math.PI;
    let from = ta, sweep = (tb - ta + 360) % 360;
    if (!g.cw && sweep > 180) { from = tb; sweep = 360 - sweep; }
    const color = g.color ?? C.red, small = g.at === 'O' ? 20 : 24;
    if (g.right) {
      const u = [Math.cos(rad(from)), Math.sin(rad(from))], v = [Math.cos(rad(from + sweep)), Math.sin(rad(from + sweep))], k = 13;
      s += `<path d="M${f1(vx + u[0]! * k)} ${f1(vy + u[1]! * k)} L${f1(vx + (u[0]! + v[0]!) * k)} ${f1(vy + (u[1]! + v[1]!) * k)} L${f1(vx + v[0]! * k)} ${f1(vy + v[1]! * k)}" fill="none" stroke="${color}" stroke-width="2.5"/>`;
    } else {
      s += wedge(vx, vy, small, from, sweep, `${color}33`) + `<path d="${arcPath(vx, vy, small, from, sweep)}" fill="none" stroke="${color}" stroke-width="2.5"/>`;
    }
    if (g.text) {
      const [x, y] = polar(vx, vy, g.at === 'O' ? 38 : 42, from + sweep / 2);
      s += tx(x, y + 5, g.text, { size: 14, fill: color, weight: 800 });
    }
  }
  const shown = o.points ?? Object.keys(RIM);
  for (const id of shown) {
    const [x, y] = at(id), [lx, ly] = polar(cx, cy, r + 15, deg(id)), hot = o.hot?.includes(id);
    s += `<circle cx="${x}" cy="${y}" r="${hot ? 6 : 4.5}" fill="${hot ? C.red : C.ink}"/>` + tx(lx, ly + 5, id, { size: 15, fill: hot ? C.red : C.ink });
  }
  if (o.centre !== false) s += `<circle cx="${cx}" cy="${cy}" r="4.5" fill="${C.ink}"/>` + tx(cx + 2, cy + 20, 'O', { size: 15 });
  for (const p of o.pills ?? []) s += pill(p.x, p.y, p.text, { size: p.size ?? 14, stroke: p.color ?? C.pond });
  return figure(400, 236, s, o.label);
}
