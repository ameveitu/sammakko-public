import type { Paint } from '../../engine/types';
import { C, arrow, esc, figure, pill, tx } from './kit';

/** Splits a text into lines of about `chars` characters. */
export function wrap(text: string, chars: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if (line && (line + ' ' + word).length > chars) { lines.push(line); line = word; } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines;
}
/** Lines of text centred on (x, y). */
export function lines(x: number, y: number, text: string, chars: number, o: { size?: number; fill?: string; weight?: number; anchor?: 'start' | 'middle' | 'end'; gap?: number } = {}) {
  const size = o.size ?? 13, gap = o.gap ?? size * 1.22;
  return wrap(text, chars).map((l, i) => tx(x, y + i * gap, l, { size, fill: o.fill, weight: o.weight, anchor: o.anchor })).join('');
}

const MARK = {
  ok: (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="11" fill="${C.leaf}"/><path d="M${x - 5} ${y}l3.5 4 6.5-8" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  no: (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="11" fill="${C.red}"/><path d="M${x - 4.5} ${y - 4.5}l9 9M${x + 4.5} ${y - 4.5}l-9 9" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>`,
};
export const mark = (kind: 'ok' | 'no', x: number, y: number) => MARK[kind](x, y);

export interface Bar { label: string; value: number | null; text?: string; mark?: boolean; color?: string; sub?: string }
/** A bar chart that starts from zero. `value: null` is a missing reading (a dashed bar with "?"). */
export function bars(o: { bars: Bar[]; max?: number; axis?: string; horizontal?: boolean; label: string; note?: string; line?: { at: number; text: string } }): Paint {
  const max = o.max ?? Math.max(...o.bars.map(b => b.value ?? 0)) * 1.15;
  let s = '';
  if (o.horizontal) {
    const X0 = 118, W = 230, rowH = 34, Y0 = 18;
    o.bars.forEach((b, i) => {
      const y = Y0 + i * rowH, w = b.value === null ? 60 : W * b.value / max;
      s += tx(X0 - 10, y + 20, b.label, { anchor: 'end', size: 13 });
      s += b.value === null
        ? `<rect x="${X0}" y="${y + 4}" width="${w}" height="22" rx="4" fill="none" stroke="${C.grey}" stroke-width="2" stroke-dasharray="5 4"/>` + tx(X0 + w / 2, y + 20, '?', { size: 15 })
        : `<rect x="${X0}" y="${y + 4}" width="${w.toFixed(1)}" height="22" rx="4" fill="${b.color ?? (b.mark ? C.sun : C.pond)}" stroke="${b.mark ? C.ink : 'none'}" stroke-width="2"/>`;
      if (b.text) s += tx(X0 + w + 8, y + 20, b.text, { anchor: 'start', size: 13 });
    });
    s += `<line x1="${X0}" y1="${Y0}" x2="${X0}" y2="${Y0 + o.bars.length * rowH}" stroke="${C.ink}" stroke-width="2"/>`;
    const h = Y0 + o.bars.length * rowH + (o.axis || o.note ? 26 : 8);
    if (o.axis) s += tx(X0 + W / 2, h - 8, o.axis, { size: 12, fill: C.soft });
    if (o.note) s += tx(200, h - 8, o.note, { size: 12, fill: C.pond });
    return figure(400, h, s, o.label);
  }
  const X0 = 70, Y0 = 176, W = 300, H = 140, n = o.bars.length, slot = W / n, bw = Math.min(64, slot * 0.6);
  for (let k = 0; k <= 2; k++) {
    const v = max * k / 2, y = Y0 - H * k / 2;
    s += `<line x1="${X0}" y1="${y}" x2="${X0 + W}" y2="${y}" stroke="${C.line}" stroke-width="1" stroke-dasharray="${k ? '3 4' : ''}"/>` +
      tx(X0 - 8, y + 4, String(Math.round(v)), { size: 11, anchor: 'end', fill: C.soft, weight: 600 });
  }
  const lineY = o.line ? Y0 - H * o.line.at / max : 0;
  if (o.line) s += `<line x1="${X0}" y1="${lineY}" x2="${X0 + W}" y2="${lineY}" stroke="${C.red}" stroke-width="2" stroke-dasharray="6 4"/>`;
  o.bars.forEach((b, i) => {
    const x = X0 + slot * (i + 0.5);
    if (b.value === null) {
      s += `<rect x="${x - bw / 2}" y="${Y0 - 50}" width="${bw}" height="50" fill="none" stroke="${C.grey}" stroke-width="2" stroke-dasharray="5 4"/>` + tx(x, Y0 - 20, '?', { size: 18 });
    } else {
      const h = H * b.value / max;
      s += `<rect x="${x - bw / 2}" y="${(Y0 - h).toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" rx="3" fill="${b.color ?? (b.mark ? C.sun : C.pond)}" stroke="${b.mark ? C.ink : 'none'}" stroke-width="2"/>`;
      if (b.text) s += tx(x, Y0 - h - 7, b.text, { size: 13 });
    }
    s += lines(x, Y0 + 18, b.label, Math.max(8, Math.floor(slot / 7.5)), { size: 12 });
    if (b.sub) s += tx(x, Y0 + 46, b.sub, { size: 11, fill: C.soft, weight: 600 });
  });
  s += `<line x1="${X0}" y1="${Y0}" x2="${X0}" y2="${Y0 - H - 10}" stroke="${C.ink}" stroke-width="2"/><line x1="${X0}" y1="${Y0}" x2="${X0 + W}" y2="${Y0}" stroke="${C.ink}" stroke-width="2"/>`;
  // The limit's label sits on a pill above the bars, so a tall bar never hides it.
  if (o.line) s += pill(X0 + W, lineY - 6, o.line.text, { size: 12, fill: C.red, stroke: C.red, anchor: 'end' });
  if (o.axis) s += tx(X0 - 4, 18, o.axis, { size: 12, anchor: 'start', fill: C.soft });
  const h = Y0 + (o.bars.some(b => b.sub) ? 54 : 38) + (o.note ? 16 : 0);
  if (o.note) s += tx(200, h - 6, o.note, { size: 12, fill: C.pond });
  return figure(400, h, s, o.label);
}

/** A small table. `mark` highlights a row; cells starting or ending with ✓ or ✗ are coloured. */
export function table(o: { head: string[]; rows: string[][]; mark?: number; label: string; widths?: number[] }): Paint {
  const size = 13, rowH = 28;
  const widths = o.widths ?? o.head.map((h, c) => Math.max(h.length, ...o.rows.map(r => (r[c] ?? '').length)) * size * 0.56 + 22);
  const total = widths.reduce((a, b) => a + b, 0), W = Math.max(total + 8, 300), x0 = (W - total) / 2;
  let s = '';
  const row = (cells: string[], y: number, headRow: boolean, hot: boolean) => {
    let x = x0, out = `<rect x="${x0}" y="${y}" width="${total}" height="${rowH}" fill="${headRow ? '#dbe9e1' : hot ? '#fff3c4' : '#fff'}" stroke="${C.line}" stroke-width="1"/>`;
    cells.forEach((cell, c) => {
      const w = widths[c]!;
      const fill = /^✓|✓$/.test(cell) ? C.leaf : /^✗|✗$/.test(cell) ? C.red : headRow ? C.pond : C.ink;
      out += tx(x + w / 2, y + 19, cell, { size, fill, weight: headRow ? 800 : 650 });
      if (c) out += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + rowH}" stroke="${C.line}" stroke-width="1"/>`;
      x += w;
    });
    return out;
  };
  s += row(o.head, 6, true, false);
  o.rows.forEach((r, i) => { s += row(r, 6 + rowH * (i + 1), false, o.mark === i); });
  return figure(W, 12 + rowH * (o.rows.length + 1), s, o.label);
}

export interface Step { icon?: string; text: string; sub?: string; mark?: 'ok' | 'no' | 'hot' }
function box(x: number, y: number, w: number, h: number, st: Step) {
  const hot = st.mark === 'hot', stroke = st.mark === 'no' ? C.red : st.mark === 'ok' || hot ? C.pond : C.line;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${hot ? '#fff3c4' : '#fff'}" stroke="${stroke}" stroke-width="${st.mark ? 2.5 : 1.5}"/>`;
  const chars = Math.max(7, Math.floor((w - 10) / 7.2));
  let ty = y + 22;
  if (st.icon) { s += tx(x + w / 2, y + 34, st.icon, { size: 26, weight: 400 }); ty = y + 58; }
  const textLines = wrap(st.text, chars);
  if (!st.icon) ty = y + h / 2 - (textLines.length - 1) * 8 + (st.sub ? -6 : 5);
  // A single long word (generaattori) shrinks the text instead of running over the box.
  const longWord = Math.max(...st.text.split(/\s+/).map(word => word.length));
  s += lines(x + w / 2, ty, st.text, chars, { size: longWord > chars ? Math.max(10, (13 * chars) / longWord) : 13, gap: 16 });
  if (st.sub) s += lines(x + w / 2, ty + textLines.length * 16 + 1, st.sub, chars + 2, { size: 11.5, fill: C.soft, weight: 600, gap: 14 });
  if (st.mark === 'ok' || st.mark === 'no') s += mark(st.mark, x + w - 6, y + 6);
  return s;
}

/** A chain of steps with arrows: what leads to what. `rows: 2` folds a long chain onto two rows. */
export function flow(o: { steps: Step[]; label: string; arrows?: string[]; rows?: 1 | 2; back?: { from: number; to: number; text: string } }): Paint {
  const n = o.steps.length, perRow = o.rows === 2 ? Math.ceil(n / 2) : n;
  const gap = 26, w = Math.max(76, Math.min(120, (380 - (perRow - 1) * gap) / perRow));
  const hasIcon = o.steps.some(st => st.icon), longest = Math.max(...o.steps.map(st => wrap(st.text, Math.floor((w - 10) / 7.2)).length + (st.sub ? wrap(st.sub, Math.floor((w - 10) / 7.2) + 2).length : 0)));
  const h = Math.max(hasIcon ? 84 : 56, (hasIcon ? 52 : 18) + longest * 16 + 8);
  const rowW = perRow * w + (perRow - 1) * gap, W = Math.max(400, rowW + 20), x0 = (W - rowW) / 2;
  const rowGap = 34, top = 10;
  let s = '';
  const pos = (i: number) => {
    const r = Math.floor(i / perRow), c = i % perRow;
    return { x: x0 + c * (w + gap), y: top + r * (h + rowGap), r };
  };
  o.steps.forEach((st, i) => {
    const p = pos(i);
    s += box(p.x, p.y, w, h, st);
    if (i < n - 1) {
      const q = pos(i + 1);
      if (q.r === p.r) {
        s += arrow(p.x + w + 3, p.y + h / 2, q.x - 3, q.y + h / 2, { width: 2.5, head: 8, color: C.pond });
        if (o.arrows?.[i]) s += tx(p.x + w + gap / 2, p.y + h / 2 - 9, o.arrows[i]!, { size: 11, fill: C.pond });
      } else {
        s += `<path d="M${p.x + w / 2} ${p.y + h + 2}V${p.y + h + rowGap / 2}H${q.x + w / 2}" fill="none" stroke="${C.pond}" stroke-width="2.5"/>` +
          arrow(q.x + w / 2, p.y + h + rowGap / 2 - 1, q.x + w / 2, q.y - 2, { width: 2.5, head: 8, color: C.pond });
      }
    }
  });
  let H = top + (o.rows === 2 ? 2 : 1) * h + (o.rows === 2 ? rowGap : 0) + 10;
  if (o.back) {
    const a = pos(o.back.from), b = pos(o.back.to), y = Math.max(a.y, b.y) + h + 14;
    s += `<path d="M${a.x + w / 2} ${a.y + h + 2}V${y}H${b.x + w / 2}" fill="none" stroke="${C.leaf}" stroke-width="2.5" stroke-dasharray="6 4"/>` +
      arrow(b.x + w / 2, y, b.x + w / 2, b.y + h + 3, { width: 2.5, head: 8, color: C.leaf }) + pill((a.x + b.x + w) / 2, y + 5, o.back.text, { size: 12, stroke: C.leaf, fill: C.leaf });
    H = y + 16;
  }
  return figure(W, H, s, o.label);
}

/** Steps around a loop (cycles and life cycles). */
export function cycle(o: { steps: Step[]; label: string; center?: string; hot?: number }): Paint {
  const n = o.steps.length, cx = 200, cy = 116, rx = 140, ry = 82, w = 96, h = 46;
  let s = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${C.line}" stroke-width="2" stroke-dasharray="2 7" class="bf-flow-slow"/>`;
  const at = (i: number) => { const a = -Math.PI / 2 + (i / n) * Math.PI * 2; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)] as const; };
  for (let i = 0; i < n; i++) {
    const [x1, y1] = at(i), [x2, y2] = at((i + 1) % n), mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const ox = (mx - cx) * 0.18, oy = (my - cy) * 0.18, dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    s += arrow(mx + ox - dx / len * 10, my + oy - dy / len * 10, mx + ox + dx / len * 10, my + oy + dy / len * 10, { width: 2.5, head: 8, color: C.pond });
  }
  o.steps.forEach((st, i) => {
    const [x, y] = at(i);
    s += box(x - w / 2, y - h / 2, w, h, { ...st, mark: o.hot === i ? 'hot' : st.mark });
  });
  if (o.center) s += lines(cx, cy, o.center, 16, { size: 13, fill: C.soft });
  return figure(400, 232, s, o.label);
}

export interface Card { icon: string; title: string; text?: string; mark?: 'ok' | 'no'; tone?: 'warm' | 'cool' | 'plain' }
/** Cards side by side: a big icon, a title and a short line (choices, examples, cases). */
export function cards(o: { cards: Card[]; label: string }): Paint {
  const n = o.cards.length, gap = 12, w = Math.min(150, (384 - (n - 1) * gap) / n), W = n * w + (n - 1) * gap, x0 = (400 - W) / 2;
  const chars = Math.max(8, Math.floor((w - 12) / 7));
  const rows = Math.max(...o.cards.map(c => wrap(c.title, chars).length + (c.text ? wrap(c.text, chars + 2).length : 0)));
  const h = 66 + rows * 16 + 8;
  let s = '';
  o.cards.forEach((c, i) => {
    const x = x0 + i * (w + gap), fill = c.tone === 'warm' ? C.warm : c.tone === 'cool' ? C.cool : '#fff';
    const stroke = c.mark === 'ok' ? C.leaf : c.mark === 'no' ? C.red : C.line;
    s += `<rect x="${x}" y="8" width="${w}" height="${h}" rx="14" fill="${fill}" stroke="${stroke}" stroke-width="${c.mark ? 2.5 : 1.5}"/>`;
    s += tx(x + w / 2, 48, c.icon, { size: 30, weight: 400 });
    const t = wrap(c.title, chars), longWord = Math.max(...c.title.split(/\s+/).map(word => word.length));
    s += lines(x + w / 2, 80, c.title, chars, { size: longWord > chars ? Math.max(10, (13 * chars) / longWord) : 13, gap: 16 });
    if (c.text) s += lines(x + w / 2, 80 + t.length * 16, c.text, chars + 2, { size: 11.5, fill: C.soft, weight: 600, gap: 15 });
    if (c.mark) s += mark(c.mark, x + w - 8, 14);
  });
  return figure(400, h + 16, s, o.label);
}

/** A number sequence with the step between neighbours. */
export function sequence(o: { values: (number | string)[]; steps?: string[]; next?: string; label: string; note?: string }): Paint {
  const all = [...o.values, ...(o.next !== undefined ? [o.next] : [])], n = all.length, w = 52, gap = 22;
  const W = n * w + (n - 1) * gap, x0 = Math.max(10, (400 - W) / 2), Wv = Math.max(400, W + 20);
  let s = '';
  all.forEach((v, i) => {
    const x = x0 + i * (w + gap), last = o.next !== undefined && i === n - 1;
    s += `<rect x="${x}" y="56" width="${w}" height="46" rx="10" fill="${last ? '#fff3c4' : '#fff'}" stroke="${last ? C.ink : C.pond}" stroke-width="${last ? 2.5 : 2}" ${last ? 'stroke-dasharray="6 4"' : ''}/>` +
      tx(x + w / 2, 86, String(v), { size: 18, weight: 800 });
    if (i < n - 1 && o.steps?.[i]) {
      const mx = x + w + gap / 2;
      s += `<path d="M${x + w / 2 + 6} 52 Q${mx} 18 ${x + w + gap + w / 2 - 6} 52" fill="none" stroke="${C.leaf}" stroke-width="2"/>` +
        tx(mx, 26, o.steps[i]!, { size: 13, fill: C.leaf });
    }
  });
  if (o.note) s += tx(Wv / 2, 128, o.note, { size: 13, fill: C.soft });
  return figure(Wv, o.note ? 140 : 114, s, o.label);
}

/** Proportional flows: one input splits into parts (energy or material bookkeeping). */
export function sankey(o: { input: { text: string; value: number }; outs: { text: string; value: number; color?: string }[]; label: string; unit?: string; back?: { to: number; text: string } }): Paint {
  const total = o.input.value, H = 120, top = 34, x0 = 20, split = 128, x1 = 232, gap = 20, unit = o.unit ? ` ${o.unit}` : '';
  const k = H / total;
  let s = `<rect x="${x0}" y="${top}" width="${split - x0}" height="${H}" fill="${C.sun}" opacity=".85"/>` +
    tx(x0 + 4, top - 10, o.input.text, { anchor: 'start', size: 13 }) + tx((x0 + split) / 2, top + H / 2 + 7, `${o.input.value}${unit}`, { size: 18 });
  let y = top, outY = top - 8, below = 0;
  const outTop: number[] = [];
  o.outs.forEach((out, i) => {
    const h = out.value * k, color = out.color ?? (i === 0 ? C.leaf : C.red);
    const yo = outY + i * gap;
    outTop.push(yo);
    s += `<path d="M${split} ${y} C${split + 50} ${y}, ${x1 - 50} ${yo}, ${x1} ${yo} V${yo + h} C${x1 - 50} ${yo + h}, ${split + 50} ${y + h}, ${split} ${y + h}Z" fill="${color}" opacity=".8"/>` +
      `<rect x="${x1}" y="${yo}" width="14" height="${h}" fill="${color}"/>`;
    // Name and amount beside the stream; labels of thin streams are pushed down so they never overlap.
    const words = wrap(out.text, 20), rows = words.length + 1;
    const first = Math.max(yo + h / 2 - (rows * 15) / 2 + 12, below + 19);
    s += lines(x1 + 22, first, out.text, 20, { anchor: 'start', size: 13, gap: 15, fill: color === C.leaf ? C.leaf : C.ink });
    s += tx(x1 + 22, first + words.length * 15, `${out.value}${unit}`, { anchor: 'start', size: 13, fill: color === C.leaf ? C.leaf : C.red });
    below = first + words.length * 15;
    y += h; outY += h;
  });
  let bottom = Math.max(top + H, outY + (o.outs.length - 1) * gap - 8, below) + 12;
  if (o.back) {
    const out = o.outs[o.back.to]!, yo = outTop[o.back.to]!;
    s += `<path d="M${x1 + 7} ${yo + out.value * k + 4} Q${x1} ${top + H + 40} ${(x0 + split) / 2} ${top + H + 22}" fill="none" stroke="${C.leaf}" stroke-width="2.5" stroke-dasharray="6 4"/>` +
      arrow((x0 + split) / 2 + 14, top + H + 22, (x0 + split) / 2, top + H + 4, { width: 2.5, color: C.leaf, head: 8 }) + pill(200, Math.max(bottom + 12, top + H + 32), o.back.text, { size: 12, stroke: C.leaf, fill: C.leaf });
    bottom = Math.max(bottom + 12, top + H + 32) + 20;
  }
  return figure(400, bottom, s, o.label);
}

/** A big formula or a short calculation, line by line. */
export function formula(o: { lines: string[]; label: string; note?: string }): Paint {
  let s = '';
  const H = 30 + o.lines.length * 34 + (o.note ? 22 : 0);
  s += `<rect x="20" y="8" width="360" height="${H - 16}" rx="14" fill="#fff" stroke="${C.line}" stroke-width="1.5"/>`;
  o.lines.forEach((l, i) => { s += tx(200, 42 + i * 34, l, { size: i === 0 ? 22 : 17, weight: i === 0 ? 800 : 700, fill: i === 0 ? C.ink : C.pond }); });
  if (o.note) s += tx(200, H - 18, o.note, { size: 12, fill: C.soft });
  return figure(400, H, s, o.label);
}

/** A short program on a card: numbered monospace lines, one line can be highlighted, with an optional note. */
export function code(o: { lines: string[]; hot?: number; label: string; note?: string }): Paint {
  const lh = 26, top = 20, H = top + o.lines.length * lh + 18 + (o.note ? 24 : 0);
  // Monospace glyphs are about 0.6 em wide: shrink the font so the longest line fits the card.
  const size = Math.min(15, 310 / (Math.max(...o.lines.map(l => l.length)) * 0.6)), cw = size * 0.6;
  let s = `<rect x="20" y="8" width="360" height="${H - 16}" rx="12" fill="#f7faf8" stroke="${C.line}" stroke-width="1.5"/>`;
  o.lines.forEach((l, i) => {
    const y = top + 18 + i * lh, indent = l.length - l.trimStart().length;
    if (o.hot === i) s += `<rect x="28" y="${y - 18}" width="344" height="${lh - 2}" rx="6" fill="#fff3c4" stroke="${C.sun}" stroke-width="1.5"/>`;
    s += tx(46, y, String(i + 1), { size: 12, fill: C.soft, weight: 600, anchor: 'end' });
    s += `<text x="${(58 + indent * cw).toFixed(1)}" y="${y}" font-size="${size.toFixed(1)}" font-family="ui-monospace, Menlo, Consolas, monospace" font-weight="600" fill="${C.ink}">${esc(l.trimStart())}</text>`;
  });
  if (o.note) s += tx(200, H - 20, o.note, { size: 13, fill: C.pond });
  return figure(400, H, s, o.label);
}

const num = (v: number) => String(Math.round(v * 1000) / 1000).replace('.', ',').replace('-', '−');
/** A number line with marked points and jump arcs above it (rounding distances, steps between numbers). */
export function numberLine(o: { from: number; to: number; step: number; minor?: number; marks?: { at: number; text: string; color?: string }[]; jumps?: { from: number; to: number; text: string }[]; label: string; note?: string }): Paint {
  const x0 = 34, W = 332, y = 104, X = (v: number) => x0 + W * (v - o.from) / (o.to - o.from);
  const n = Math.round((o.to - o.from) / o.step), size = n > 10 ? 11 : 13;
  let s = `<line x1="${x0 - 14}" y1="${y}" x2="${x0 + W + 14}" y2="${y}" stroke="${C.ink}" stroke-width="2.5"/>`;
  for (let i = 0; i <= n; i++) {
    const v = o.from + i * o.step, x = X(v);
    s += `<line x1="${x}" y1="${y - 7}" x2="${x}" y2="${y + 7}" stroke="${C.ink}" stroke-width="2"/>` + tx(x, y + 24, num(v), { size, fill: C.soft });
    // Minor ticks split each step into equal unlabelled parts.
    if (o.minor && i < n) for (let k = 1; k < o.minor; k++) { const mx = X(v + (k * o.step) / o.minor); s += `<line x1="${mx}" y1="${y - 4}" x2="${mx}" y2="${y + 4}" stroke="${C.ink}" stroke-width="1.2"/>`; }
  }
  (o.jumps ?? []).forEach((j, i) => {
    const a = X(j.from), b = X(j.to), top = y - 34 - (i % 2) * 22, mid = (a + b) / 2;
    s += `<path d="M${a} ${y - 10} Q${mid} ${top - 18} ${b} ${y - 10}" fill="none" stroke="${C.leaf}" stroke-width="2.5"/>` +
      arrow(b + (a < b ? -6 : 6), y - 16, b, y - 10, { color: C.leaf, width: 2.5, head: 8 }) + pill(mid, top - 14, j.text, { size: 12, fill: C.leaf, stroke: C.leaf });
  });
  (o.marks ?? []).forEach((m, i) => {
    const x = X(m.at), color = m.color ?? C.red;
    s += `<circle cx="${x}" cy="${y}" r="7" fill="${color}" stroke="#fff" stroke-width="2"/>` + pill(x, y + 50 + (i % 2) * 24, m.text, { size: 13, fill: color, stroke: color });
  });
  // A second row of mark labels pushes the note down so they never overlap.
  const two = (o.marks?.length ?? 0) > 1, noteY = two ? 208 : 186;
  if (o.note) s += tx(200, noteY, o.note, { size: 13, fill: C.soft });
  return figure(400, o.note ? noteY + 10 : two ? 190 : 176, s, o.label);
}
