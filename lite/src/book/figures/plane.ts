import type { Paint } from '../../engine/types';
import { C, figure, pill, tx } from './kit';

const num = (v: number) => String(Math.round(v * 1000) / 1000).replace('.', ',').replace('-', '−');

type PlaneLine = { k: number; b: number; color?: string; dash?: boolean; text?: string; at?: number; dy?: number };
type PlanePoint = { x: number; y: number; text?: string; color?: string; dx?: number; dy?: number };

/**
 * A coordinate plane with a grid, straight lines y = kx + b clipped to the view and marked points.
 * `xStep`/`yStep` set the grid, `xLabel`/`yLabel` how often the axes are numbered.
 */
export function plane(o: {
  x: [number, number]; y: [number, number]; xStep?: number; yStep?: number; xLabel?: number; yLabel?: number; square?: boolean;
  lines?: PlaneLine[]; points?: PlanePoint[]; xName?: string; yName?: string; note?: string; label: string;
}): Paint {
  const [x0, x1] = o.x, [y0, y1] = o.y, xs = o.xStep ?? 1, ys = o.yStep ?? 1, xl = o.xLabel ?? xs, yl = o.yLabel ?? ys;
  let ux = 300 / (x1 - x0), uy = 186 / (y1 - y0);
  if (o.square) ux = uy = Math.min(ux, uy);
  const left = 212 - (ux * (x1 - x0)) / 2, top = 22;
  const X = (v: number) => Math.round((left + (v - x0) * ux) * 10) / 10, Y = (v: number) => Math.round((top + (y1 - v) * uy) * 10) / 10;
  const ax = x0 <= 0 && x1 >= 0 ? 0 : x0, ay = y0 <= 0 && y1 >= 0 ? 0 : y0, eps = 1e-9;
  let s = '';
  for (let v = x0; v <= x1 + eps; v += xs) s += `<line x1="${X(v)}" y1="${Y(y0)}" x2="${X(v)}" y2="${Y(y1)}" stroke="${C.line}" stroke-width="0.7"/>`;
  for (let v = y0; v <= y1 + eps; v += ys) s += `<line x1="${X(x0)}" y1="${Y(v)}" x2="${X(x1)}" y2="${Y(v)}" stroke="${C.line}" stroke-width="0.7"/>`;
  s += `<line x1="${X(x0)}" y1="${Y(ay)}" x2="${X(x1) + 10}" y2="${Y(ay)}" stroke="${C.ink}" stroke-width="2"/><line x1="${X(ax)}" y1="${Y(y0)}" x2="${X(ax)}" y2="${Y(y1) - 10}" stroke="${C.ink}" stroke-width="2"/>`;
  for (let v = Math.ceil(x0 / xl) * xl; v <= x1 + eps; v += xl) if (Math.abs(v - ax) > eps || ay !== 0) s += tx(X(v), Y(ay) + 16, num(v), { size: 11, fill: C.soft });
  for (let v = Math.ceil(y0 / yl) * yl; v <= y1 + eps; v += yl) if (Math.abs(v - ay) > eps || ax !== 0) s += tx(X(ax) - 6, Y(v) + 4, num(v), { size: 11, fill: C.soft, anchor: 'end' });
  // The origin is numbered only when it is a corner of the view; inside the view it is obvious.
  if (ax === 0 && ay === 0 && (x0 === 0 || y0 === 0)) s += tx(X(0) - 6, Y(0) + 16, '0', { size: 11, fill: C.soft, anchor: 'end' });
  s += tx(X(x1) + 12, Y(ay) + 5, o.xName ?? 'x', { size: 13, anchor: 'start', italic: !o.xName });
  s += tx(X(ax) + 8, Y(y1) - 4, o.yName ?? 'y', { size: 13, anchor: 'start', italic: !o.yName });
  for (const l of o.lines ?? []) {
    let lo = x0, hi = x1;
    if (l.k) { const a = (y0 - l.b) / l.k, b = (y1 - l.b) / l.k; lo = Math.max(x0, Math.min(a, b)); hi = Math.min(x1, Math.max(a, b)); }
    const color = l.color ?? C.pond;
    s += `<line x1="${X(lo)}" y1="${Y(l.k * lo + l.b)}" x2="${X(hi)}" y2="${Y(l.k * hi + l.b)}" stroke="${color}" stroke-width="3.5" stroke-linecap="round"${l.dash ? ' stroke-dasharray="9 6"' : ''}/>`;
    if (l.text) { const at = l.at ?? lo + (hi - lo) * 0.82; s += pill(X(at), Y(l.k * at + l.b) + (l.dy ?? -12), l.text, { size: 13, stroke: color }); }
  }
  for (const p of o.points ?? []) {
    const color = p.color ?? C.red;
    s += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="6.5" fill="${color}" stroke="#fff" stroke-width="2"/>`;
    if (p.text) s += pill(X(p.x) + (p.dx ?? 0), Y(p.y) + (p.dy ?? -14), p.text, { size: 13, stroke: color });
  }
  let h = Y(y0) + 26;
  if (o.note) { s += pill(200, h + 10, o.note, { size: 14, stroke: C.pond }); h += 32; }
  return figure(400, h, s, o.label);
}
