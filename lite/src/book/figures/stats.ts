import type { Paint } from '../../engine/types';
import { C, figure, pill, tx } from './kit';
import { wedge } from './circle';

const num = (v: number) => String(v).replace('.', ',').replace('-', '−');

/** Raw observations as chips, wrapped into centred rows; `hot` chips are framed. */
export function chips(o: { items: { text: string; color?: string; hot?: boolean; dim?: boolean }[]; label: string; note?: string; title?: string }): Paint {
  const w = (t: string) => t.length * 8.6 + 22, gap = 8, rows: (typeof o.items)[] = [[]];
  let used = 0;
  for (const it of o.items) {
    if (used + w(it.text) > 370 && rows[rows.length - 1]!.length) { rows.push([]); used = 0; }
    rows[rows.length - 1]!.push(it); used += w(it.text) + gap;
  }
  const top = o.title ? 44 : 18;
  let s = o.title ? tx(200, 26, o.title, { size: 14, fill: C.soft }) : '';
  rows.forEach((row, r) => {
    const total = row.reduce((a, it) => a + w(it.text) + gap, -gap);
    let x = 200 - total / 2;
    for (const it of row) {
      const y = top + r * 44;
      s += `<rect x="${x}" y="${y}" width="${w(it.text)}" height="32" rx="16" fill="${it.color ?? '#fff'}" stroke="${it.hot ? C.red : C.line}" stroke-width="${it.hot ? 3 : 1.5}"${it.dim ? ' stroke-dasharray="5 4" opacity="0.55"' : ''}/>`
        + tx(x + w(it.text) / 2, y + 21, it.text, { size: 15 });
      x += w(it.text) + gap;
    }
  });
  let h = top + rows.length * 44;
  if (o.note) { s += pill(200, h + 18, o.note, { size: 15, stroke: C.pond }); h += 42; }
  return figure(400, h + 8, s, o.label);
}

/**
 * Observations as dots over a number line, one row per data set. Repeated values stack.
 * Options mark the range of each row, a band (e.g. "the middle area") and a mean line.
 */
export function dotPlot(o: {
  rows: { name: string; values: number[]; color?: string; note?: string }[]; from: number; to: number;
  band?: { from: number; to: number; text?: string }; mean?: number; ranges?: boolean; unit?: string; callouts?: { at: number; text: string }[]; label: string;
}): Paint {
  const X = (v: number) => 106 + ((v - o.from) / (o.to - o.from)) * 272, rowH = o.ranges ? 100 : 74, top = o.callouts || o.band?.text ? 22 : 0;
  let s = '';
  o.rows.forEach((row, i) => {
    const base = 62 + top + i * rowH, color = row.color ?? (i ? C.sun : C.pond);
    if (o.band) s += `<rect x="${X(o.band.from) - 8}" y="${base - 46}" width="${X(o.band.to) - X(o.band.from) + 16}" height="50" rx="8" fill="${C.glow}" opacity="0.55"/>`;
    s += `<line x1="${X(o.from) - 6}" y1="${base}" x2="${X(o.to) + 6}" y2="${base}" stroke="${C.ink}" stroke-width="2"/>`;
    for (let v = o.from; v <= o.to; v++) s += `<line x1="${X(v)}" y1="${base}" x2="${X(v)}" y2="${base + 5}" stroke="${C.ink}" stroke-width="1.4"/>` + tx(X(v), base + 19, num(v), { size: 11, fill: C.soft });
    const seen: Record<number, number> = {};
    for (const v of row.values) {
      const k = (seen[v] = (seen[v] ?? 0) + 1), inBand = !o.band || (v >= o.band.from && v <= o.band.to);
      s += `<circle cx="${X(v)}" cy="${base - 10 - (k - 1) * 17}" r="7.5" fill="${color}" stroke="${inBand ? C.ink : C.red}" stroke-width="${inBand ? 1.2 : 2.5}"/>`;
    }
    s += tx(84, base - 8, row.name, { size: 13, anchor: 'end' });
    if (o.ranges) {
      const lo = Math.min(...row.values), hi = Math.max(...row.values), y = base - 44;
      s += `<path d="M${X(lo)} ${y + 6} V${y} H${X(hi)} V${y + 6}" fill="none" stroke="${C.red}" stroke-width="2"/>` + tx((X(lo) + X(hi)) / 2, y - 5, row.note ?? `leveys ${num(hi - lo)}${o.unit ? ` ${o.unit}` : ''}`, { size: 12, fill: C.red });
    } else if (row.note) s += tx(84, base + 10, row.note, { size: 12, anchor: 'end', fill: C.red });
  });
  const bottom = 62 + top + (o.rows.length - 1) * rowH + 28;
  if (o.band?.text) s += tx((X(o.band.from) + X(o.band.to)) / 2, 20, o.band.text, { size: 12, fill: C.soft });
  for (const c of o.callouts ?? []) s += tx(X(c.at), 20, c.text, { size: 12, fill: C.red });
  if (o.mean !== undefined) s += `<line x1="${X(o.mean)}" y1="14" x2="${X(o.mean)}" y2="${bottom - 6}" stroke="${C.blue}" stroke-width="2" stroke-dasharray="5 4"/>` + tx(X(o.mean) + 6, 14, `keskiarvo ${num(o.mean)}`, { size: 11, fill: C.blue, anchor: 'start' });
  return figure(400, bottom + 4, s, o.label);
}

/** Bars over a value axis that may start above zero: shows how a cut axis exaggerates a difference. */
export function axisBars(o: { bars: { label: string; value: number; mark?: boolean }[]; from: number; to: number; step: number; label: string; note?: string }): Paint {
  const X0 = 74, Y0 = 170, H = 140, Y = (v: number) => Y0 - ((v - o.from) / (o.to - o.from)) * H;
  let s = '';
  for (let v = o.from; v <= o.to; v += o.step) s += `<line x1="${X0}" y1="${Y(v)}" x2="${X0 + 230}" y2="${Y(v)}" stroke="${C.line}" stroke-width="1" stroke-dasharray="${v === o.from ? '' : '3 4'}"/>` + tx(X0 - 8, Y(v) + 4, num(v), { size: 11, anchor: 'end', fill: C.soft });
  o.bars.forEach((b, i) => {
    const x = X0 + 40 + i * 110;
    s += `<rect x="${x}" y="${Y(b.value)}" width="64" height="${Y0 - Y(b.value)}" rx="3" fill="${b.mark ? C.sun : C.pond}" stroke="${b.mark ? C.ink : 'none'}" stroke-width="2"/>`
      + tx(x + 32, Y(b.value) - 7, num(b.value), { size: 13 }) + tx(x + 32, Y0 + 18, b.label, { size: 12 });
  });
  s += `<line x1="${X0}" y1="${Y0}" x2="${X0}" y2="${Y0 - H - 8}" stroke="${C.ink}" stroke-width="2"/><line x1="${X0}" y1="${Y0}" x2="${X0 + 230}" y2="${Y0}" stroke="${C.ink}" stroke-width="2"/>`;
  if (o.note) s += pill(388, 22, o.note, { size: 12, stroke: C.red, anchor: "end" });
  return figure(400, Y0 + 30, s, o.label);
}

/** A line chart over named moments; with `empty` only the named axes are drawn. */
export function lineChart(o: { xs: string[]; ys: number[]; max: number; step: number; xName: string; yName: string; empty?: boolean; label: string }): Paint {
  const X0 = 70, Y0 = 182, W = 290, H = 132, X = (i: number) => X0 + 30 + (i * (W - 50)) / Math.max(1, o.xs.length - 1), Y = (v: number) => Y0 - (v / o.max) * H;
  let s = '';
  for (let v = 0; v <= o.max; v += o.step) s += `<line x1="${X0}" y1="${Y(v)}" x2="${X0 + W}" y2="${Y(v)}" stroke="${C.line}" stroke-width="1" stroke-dasharray="${v ? '3 4' : ''}"/>` + (o.empty ? '' : tx(X0 - 8, Y(v) + 4, num(v), { size: 11, anchor: 'end', fill: C.soft }));
  o.xs.forEach((x, i) => { s += tx(X(i), Y0 + 18, x, { size: 12, fill: o.empty ? C.line : C.ink }); });
  if (!o.empty) {
    s += `<polyline points="${o.ys.map((v, i) => `${X(i)},${Y(v)}`).join(' ')}" fill="none" stroke="${C.pond}" stroke-width="3.5" stroke-linejoin="round"/>`;
    o.ys.forEach((v, i) => { s += `<circle cx="${X(i)}" cy="${Y(v)}" r="5.5" fill="${C.sun}" stroke="${C.ink}" stroke-width="1.5"/>` + tx(X(i), Y(v) - 11, num(v), { size: 12 }); });
  }
  s += `<line x1="${X0}" y1="${Y0}" x2="${X0}" y2="${Y0 - H - 12}" stroke="${C.ink}" stroke-width="2"/><line x1="${X0}" y1="${Y0}" x2="${X0 + W}" y2="${Y0}" stroke="${C.ink}" stroke-width="2"/>`;
  s += tx(X0 - 4, 18, o.yName, { size: 12, anchor: 'start', fill: o.empty ? C.red : C.soft }) + tx(X0 + W, Y0 + 38, o.xName, { size: 12, anchor: 'end', fill: o.empty ? C.red : C.soft });
  return figure(400, Y0 + 46, s, o.label);
}

/** Spinners with equal sectors and a pointer; signs between them and a result below. */
export function spinners(o: { wheels: { text: string; color: string }[][]; between?: string; result?: string; label: string }): Paint {
  const n = o.wheels.length, r = 62, gapX = 400 / n;
  let s = '';
  o.wheels.forEach((wheel, i) => {
    const cx = gapX * (i + 0.5), cy = 92, sweep = 360 / wheel.length;
    wheel.forEach((sec, k) => {
      const from = -90 + k * sweep, mid = ((from + sweep / 2) * Math.PI) / 180;
      s += wedge(cx, cy, r, from, sweep, sec.color, C.ink) + tx(cx + Math.cos(mid) * r * 0.6, cy + Math.sin(mid) * r * 0.6 + 6, sec.text, { size: 17, fill: '#fff' });
    });
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.ink}" stroke-width="2.5"/><path d="M${cx - 7} ${cy - r - 14} L${cx + 7} ${cy - r - 14} L${cx} ${cy - r + 4}Z" fill="${C.ink}"/>`;
    if (o.between && i < n - 1) s += tx(gapX * (i + 1), cy + 8, o.between, { size: 22, fill: C.pond });
  });
  if (o.result) s += pill(200, 194, o.result, { size: 16, stroke: C.pond });
  return figure(400, o.result ? 212 : 172, s, o.label);
}

/** Part of a whole as a strip of equal cells: k of n coloured, one strip per data set. */
export function strips(o: { rows: { name: string; n: number; k: number; text: string }[]; label: string; note?: string }): Paint {
  const X0 = 96, W = 230;
  let s = '';
  o.rows.forEach((row, i) => {
    const y = 22 + i * 58, cw = W / row.n;
    for (let c = 0; c < row.n; c++) s += `<rect x="${X0 + c * cw}" y="${y}" width="${cw}" height="30" fill="${c < row.k ? C.sun : '#fff'}" stroke="${C.ink}" stroke-width="1"/>`;
    s += tx(X0 - 10, y + 20, row.name, { size: 13, anchor: 'end' }) + tx(X0 + W + 10, y + 20, row.text, { size: 14, anchor: 'start', fill: C.pond });
  });
  let h = 22 + o.rows.length * 58;
  if (o.note) { s += pill(200, h + 6, o.note, { size: 14, stroke: C.pond }); h += 34; }
  return figure(400, h, s, o.label);
}
