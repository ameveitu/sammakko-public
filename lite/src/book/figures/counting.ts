import type { Paint } from '../../engine/types';
import { arrow, C, figure, pill, tx } from './kit';

type Thing = 'dot' | 'leaf' | 'stone' | 'cookie' | 'reed';
const THING: Record<Thing, (x: number, y: number, color?: string) => string> = {
  dot: (x, y, c) => `<circle cx="${x}" cy="${y}" r="7.5" fill="${c ?? C.blue}" stroke="${C.ink}" stroke-width="1.2"/>`,
  leaf: (x, y, c) => `<ellipse cx="${x}" cy="${y}" rx="8.5" ry="4.8" transform="rotate(-32 ${x} ${y})" fill="${c ?? C.leaf}" stroke="${C.ink}" stroke-width="1.1"/>`,
  stone: (x, y, c) => `<ellipse cx="${x}" cy="${y}" rx="8.5" ry="6.5" fill="${c ?? C.grey}" stroke="${C.ink}" stroke-width="1.1"/>`,
  cookie: (x, y, c) => `<circle cx="${x}" cy="${y}" r="7.5" fill="${c ?? '#d9a35b'}" stroke="${C.ink}" stroke-width="1.1"/><circle cx="${x - 2}" cy="${y - 2}" r="1.3" fill="${C.ink}"/><circle cx="${x + 2.5}" cy="${y + 1.5}" r="1.3" fill="${C.ink}"/>`,
  reed: (x, y, c) => `<line x1="${x}" y1="${y + 9}" x2="${x}" y2="${y - 9}" stroke="${c ?? C.leaf}" stroke-width="4" stroke-linecap="round"/><ellipse cx="${x}" cy="${y - 6}" rx="2.6" ry="5" fill="#8a5a33"/>`,
};

/**
 * Sets of things side by side, each in its own box, with signs between and a result below:
 * for "4 and 2 make 6", fair shares, full baskets and pairs.
 */
export function groups(o: {
  sets: { n: number; name?: string; color?: string; cols?: number; tone?: 'cool' | 'warm' | 'plain'; mark?: boolean }[];
  thing?: Thing; between?: string[]; result?: string; label: string; height?: number;
}): Paint {
  const step = 21, thing = THING[o.thing ?? 'dot'];
  const sizes = o.sets.map(set => {
    const cols = set.cols ?? Math.min(Math.max(set.n, 1), 5), rows = Math.max(1, Math.ceil(set.n / cols));
    return { cols, rows, w: cols * step + 22, h: rows * step + 22 };
  });
  const gap = o.between ? 40 : 22, total = sizes.reduce((a, s) => a + s.w, 0) + gap * (sizes.length - 1);
  const W = Math.max(400, total + 30), H = o.height ?? Math.max(...sizes.map(s => s.h)) + (o.result ? 104 : 70);
  const boxH = Math.max(...sizes.map(s => s.h)), top = 18;
  let x = (W - total) / 2, s = '';
  o.sets.forEach((set, i) => {
    const z = sizes[i], y0 = top + (boxH - z.h) / 2;
    const fill = set.tone === 'warm' ? C.warm : set.tone === 'plain' ? '#fff' : C.cool;
    s += `<rect x="${x}" y="${y0}" width="${z.w}" height="${z.h}" rx="14" fill="${fill}" stroke="${set.mark ? C.pond : C.line}" stroke-width="${set.mark ? 3 : 1.5}"/>`;
    for (let k = 0; k < set.n; k++) s += thing(x + 21 + (k % z.cols) * step, y0 + 21 + Math.floor(k / z.cols) * step, set.color);
    if (set.name) s += tx(x + z.w / 2, top + boxH + 22, set.name, { size: 14 });
    if (o.between?.[i] && i < o.sets.length - 1) s += tx(x + z.w + gap / 2, top + boxH / 2 + 8, o.between[i], { size: 24, fill: C.pond });
    x += z.w + gap;
  });
  if (o.result) s += pill(W / 2, top + boxH + 62, o.result, { size: 17, stroke: C.pond });
  return figure(W, H, s, o.label);
}

/** A queue of named figures with order numbers counted from one end; one place is marked. */
export function queue(o: { names: string[]; from: 'left' | 'right'; hot?: number; label: string }): Paint {
  const n = o.names.length, gapX = 360 / n, x0 = 20 + gapX / 2;
  const tint = ['#f4c542', '#7bc96f', '#c98b5a', '#6fa8dc', '#e39ad1'];
  let s = '';
  o.names.forEach((name, i) => {
    const x = x0 + i * gapX, place = o.from === 'left' ? i + 1 : n - i, hot = i === o.hot;
    s += `<circle cx="${x}" cy="96" r="24" fill="${tint[i % tint.length]}" stroke="${hot ? C.red : C.ink}" stroke-width="${hot ? 4 : 2}"/>`
      + tx(x, 103, name.slice(0, 1), { size: 20, fill: C.ink }) + tx(x, 142, name, { size: 14 })
      + pill(x, 52, `${place}.`, { size: 15, stroke: hot ? C.red : C.line });
  });
  const a = o.from === 'left' ? [x0 - 20, x0 + (n - 1) * gapX + 20] : [x0 + (n - 1) * gapX + 20, x0 - 20];
  s += arrow(a[0], 20, a[1], 20, { color: C.pond, width: 3 }) + tx(200, 172, o.from === 'left' ? 'lasketaan vasemmalta' : 'lasketaan oikealta', { size: 13, fill: C.soft });
  return figure(400, 182, s, o.label);
}

/** Two rows matched one to one: the things left without a partner show the difference. */
export function pairUp(o: { a: { name: string; n: number }; b: { name: string; n: number }; thing?: Thing; result?: string; label: string }): Paint {
  const thing = THING[o.thing ?? 'dot'], n = Math.max(o.a.n, o.b.n), step = Math.min(40, 280 / Math.max(1, n - 1)), x0 = 104;
  let s = tx(70, 58, o.a.name, { size: 14, anchor: 'end' }) + tx(70, 128, o.b.name, { size: 14, anchor: 'end' });
  for (let i = 0; i < Math.min(o.a.n, o.b.n); i++) s += `<line x1="${x0 + i * step}" y1="64" x2="${x0 + i * step}" y2="112" stroke="${C.pond}" stroke-width="2" stroke-dasharray="4 3"/>`;
  for (let i = 0; i < o.a.n; i++) s += thing(x0 + i * step, 52);
  for (let i = 0; i < o.b.n; i++) s += thing(x0 + i * step, 124);
  const extra = Math.abs(o.a.n - o.b.n);
  if (extra) {
    const y = o.a.n > o.b.n ? 52 : 124, from = Math.min(o.a.n, o.b.n);
    s += `<rect x="${x0 + from * step - 16}" y="${y - 20}" width="${(extra - 1) * step + 32}" height="40" rx="12" fill="none" stroke="${C.red}" stroke-width="2.5"/>`
      + tx(x0 + (from + (extra - 1) / 2) * step, o.a.n > o.b.n ? 22 : 166, 'ilman paria', { size: 13, fill: C.red });
  }
  if (o.result) s += pill(200, 198, o.result, { size: 17, stroke: C.pond });
  return figure(400, o.result ? 210 : 176, s, o.label);
}

/**
 * Written column arithmetic: numbers right-aligned digit by digit, small carries above,
 * a rule and the result. Decimal commas line up because every row has the same digit count.
 */
export function columns(o: { rows: string[]; op: '+' | '−'; result: string; carries?: string[]; hot?: number; label: string; note?: string }): Paint {
  const cell = 30, width = Math.max(...[...o.rows, o.result].map(r => r.length)), x1 = 200 + (width * cell) / 2;
  const cx = (i: number, len: number) => x1 - (len - i) * cell + cell / 2;
  let s = '';
  if (o.hot !== undefined) s += `<rect x="${x1 - (o.hot + 1) * cell}" y="14" width="${cell}" height="${46 + o.rows.length * 36 + 40}" rx="8" fill="${C.glow}" opacity="0.55"/>`;
  o.carries?.forEach((c, i) => { if (c) s += tx(cx(i, o.carries!.length), 30, c, { size: 13, fill: C.red }); });
  o.rows.forEach((r, k) => { [...r].forEach((ch, i) => { s += tx(cx(i, r.length), 66 + k * 36, ch, { size: 24, weight: 700 }); }); });
  const yRule = 66 + (o.rows.length - 1) * 36 + 14;
  s += tx(x1 - width * cell - 20, 66 + (o.rows.length - 1) * 36, o.op, { size: 24, fill: C.pond });
  s += `<line x1="${x1 - width * cell - 34}" y1="${yRule}" x2="${x1 + 6}" y2="${yRule}" stroke="${C.ink}" stroke-width="2.5"/>`;
  [...o.result].forEach((ch, i) => { s += tx(cx(i, o.result.length), yRule + 34, ch, { size: 24, weight: 800, fill: C.pond }); });
  if (o.note) s += tx(200, yRule + 66, o.note, { size: 13, fill: C.soft });
  return figure(400, yRule + (o.note ? 78 : 50), s, o.label);
}
