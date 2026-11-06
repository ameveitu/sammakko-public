// Shared helpers for writing node content compactly.
import type { Rng } from '../engine/rng';
import type { Item, Option, Paint, Phase, Task } from '../engine/types';
import { scatter, svg, THING_KEYS, THINGS } from '../ui/art';
import { word } from './fi';
import { rememberItemReadiness, type ItemReadinessContext } from '../engine/item-readiness';

export type Choice = Extract<Task, { kind: 'choice' }>;

/** Preserve the exact item/task JSON while retaining the author's local prerequisite context. */
export function withItemReadiness<T extends { task: object }>(nodeId: string, item: T, context: ItemReadinessContext): T {
  rememberItemReadiness(nodeId, item.task, context);
  return item;
}

/** Static scene from SVG/HTML markup. */
export const paint = (html: string): Paint => (el) => { el.innerHTML = html; };

/** Shuffle one correct option among distractors. why[i] explains distractor i. */
export function choose(r: Rng, correct: Option, wrong: Option[], why: (string | undefined)[] = [], cols?: number): Choice {
  const all = r.shuffle([{ o: correct, ok: true, w: undefined as string | undefined }, ...wrong.map((o, i) => ({ o, ok: false, w: why[i] }))]);
  return { kind: 'choice', options: all.map((e) => e.o), answer: all.findIndex((e) => e.ok), why: all.map((e) => e.w), cols };
}

/** Choice where the options are fixed in a meaningful order (e.g. yes/no); answer is an index. */
export const fixed = (options: Option[], answer: number, why: (string | undefined)[] = [], cols?: number): Choice =>
  ({ kind: 'choice', options, answer, why, cols });

/** k distinct numbers near n within [lo, hi], excluding n. */
export function near(r: Rng, n: number, k: number, lo: number, hi: number, spread = 2): number[] {
  const pool: number[] = [];
  for (let d = 1; pool.length < 40 && d <= Math.max(spread, hi - lo); d++) {
    if (n - d >= lo) pool.push(n - d);
    if (n + d <= hi) pool.push(n + d);
    if (d >= spread && pool.length >= k) break;
  }
  return r.shuffle(pool).slice(0, k);
}

export const num = (n: number): Option => ({ big: String(n) });
export const spoken = (n: number): Option => ({ text: word(n), speak: word(n) });
export const txt = (t: string, speak = true): Option => ({ text: t, speak: speak ? t : undefined });

/** Pick a case tag; transfer phase uses its own generator. */
export function tagged<T extends string>(r: Rng, tags: readonly T[]): T { return r.pick(tags); }

/** A node's item() built from per-tag generators plus a transfer generator. */
export function cases(gen: Record<string, (r: Rng, phase: Phase) => Omit<Item, 'tag'>>, transfer: (r: Rng, phase: Phase) => Omit<Item, 'tag'>, guidedTags?: string[]) {
  const tags = Object.keys(gen);
  return (r: Rng, phase: Phase): Item => {
    if (phase === 'transfer') return { ...transfer(r, phase), tag: 'transfer' };
    const pool = phase === 'guided' && guidedTags ? guidedTags : tags;
    const tag = r.pick(pool);
    return { ...gen[tag]!(r, phase), tag };
  };
}

// ---------------------------------------------------------------- pictures

export const thing = (r: Rng) => r.pick(THING_KEYS);

/** n objects of one kind; layout 'line' or 'scatter'. */
export function groupArt(r: Rng, kind: string, n: number, layout: 'line' | 'scatter' = 'scatter', w = 200, h = 120, size = 30) {
  const pts = layout === 'line' ? lineLayout(n, w, h, size) : scatter(n, w, h, size, r.next);
  return svg(w, h, pts.map((p) => THINGS[kind]!.draw(p.x, p.y, size)).join(''), `${n} ${n === 1 ? THINGS[kind]!.one : THINGS[kind]!.many}`);
}

export function lineLayout(n: number, w: number, h: number, size: number) {
  const perRow = Math.max(1, Math.floor((w - size * 0.4) / (size * 1.25)));
  const rows = Math.ceil(n / perRow);
  return Array.from({ length: n }, (_, i) => {
    const row = Math.floor(i / perRow), col = i % perRow;
    const inRow = Math.min(perRow, n - row * perRow);
    const x0 = (w - inRow * size * 1.25) / 2 + size * 0.62;
    return { x: x0 + col * size * 1.25, y: h / 2 + (row - (rows - 1) / 2) * size * 1.25 };
  });
}

/** A box (rasia) containing n things, optional label under it. */
export function boxArt(r: Rng, kind: string, n: number, label = '', w = 150, h = 120) {
  const size = n > 6 ? 22 : 26;
  const pts = scatter(n, w - 20, h - 34, size, r.next);
  return svg(w, h, `<rect x="4" y="4" width="${w - 8}" height="${h - 30}" rx="12" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="3"/>` +
    pts.map((p) => THINGS[kind]!.draw(p.x + 10, p.y + 2, size)).join('') +
    (label ? `<text x="${w / 2}" y="${h - 6}" text-anchor="middle" font-size="20" font-weight="800" fill="currentColor">${label}</text>` : ''));
}

/** Ribbons on a unit grid, for demos (static). lens in units, offs in units. */
export function ribbonArt(lens: number[], offs: number[], colors = ['var(--red)', 'var(--blue)'], units = 0) {
  const U = 22, W = 14 * U;
  let s = '';
  lens.forEach((l, i) => {
    const y = 10 + i * 46;
    s += `<rect x="${offs[i]! * U}" y="${y}" width="${l * U}" height="28" rx="7" fill="${colors[i]}"/>`;
    if (units && i === 0) for (let k = 0; k < l; k++) s += `<rect x="${offs[i]! * U + k * U + 2}" y="${y + 32}" width="${U - 4}" height="10" rx="3" fill="var(--sun)"/>`;
  });
  return svg(W, 20 + lens.length * 46, s);
}

/** A row of n equal unit blocks (paperclip-like), with optional object above. */
export function unitsArt(n: number, opts: { gapAt?: number; overlapAt?: number; mixed?: boolean; len?: number } = {}) {
  const U = 26;
  const len = opts.len ?? n;
  let x = 6, s = `<rect x="6" y="8" width="${len * U}" height="24" rx="6" fill="var(--blue)"/>`;
  for (let k = 0; k < n; k++) {
    const w = opts.mixed && k % 2 ? U * 1.6 : U;
    s += `<rect x="${x + 2}" y="40" width="${w - 4}" height="14" rx="4" fill="var(--sun)" stroke="#b08a10"/>`;
    x += w;
    if (opts.gapAt === k) x += U * 0.7;
    if (opts.overlapAt === k) x -= U * 0.45;
  }
  return svg(Math.max(len * U, x) + 14, 62, s);
}

// ---------------------------------------------------------------- lab charts

export interface Series { pts: [number, number][]; color?: string; label?: string; dots?: boolean }
export interface Axes { xMax: number; yMax: number; xStep: number; yStep: number; xLabel: string; yLabel: string; w?: number; h?: number; ticks?: boolean }

export function chart(ax: Axes, series: Series[]) {
  const W = ax.w ?? 300, H = ax.h ?? 200, L = 38, B = 30, T = 24, R = 12;
  const px = (x: number) => L + (x / ax.xMax) * (W - L - R);
  const py = (y: number) => H - B - (y / ax.yMax) * (H - B - T);
  let s = '';
  const ticks = ax.ticks ?? true;
  for (let x = 0; x <= ax.xMax + 1e-9; x += ax.xStep) s += `<line x1="${px(x)}" y1="${py(0)}" x2="${px(x)}" y2="${py(ax.yMax)}" stroke="var(--line)"/>` + (ticks ? `<text x="${px(x)}" y="${H - B + 16}" text-anchor="middle" font-size="11" fill="currentColor">${x}</text>` : '');
  for (let y = 0; y <= ax.yMax + 1e-9; y += ax.yStep) s += `<line x1="${px(0)}" y1="${py(y)}" x2="${px(ax.xMax)}" y2="${py(y)}" stroke="var(--line)"/>` + (ticks ? `<text x="${L - 5}" y="${py(y) + 4}" text-anchor="end" font-size="11" fill="currentColor">${y}</text>` : '');
  s += `<path d="M${px(0)} ${py(ax.yMax)} V${py(0)} H${px(ax.xMax)}" stroke="currentColor" stroke-width="2" fill="none"/>`;
  s += `<text x="${W - R}" y="${H - 3}" text-anchor="end" font-size="12" font-weight="700" fill="currentColor">${ax.xLabel}</text>`;
  s += `<text x="${L + 4}" y="${T - 2}" font-size="12" font-weight="700" fill="currentColor">${ax.yLabel}</text>`;
  for (const se of series) {
    const c = se.color ?? 'var(--pond)';
    s += `<polyline points="${se.pts.map(([x, y]) => `${px(x)},${py(y)}`).join(' ')}" fill="none" stroke="${c}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>`;
    if (se.dots) s += se.pts.map(([x, y]) => `<circle cx="${px(x)}" cy="${py(y)}" r="4.5" fill="${c}"/>`).join('');
    if (se.label) { const [x, y] = se.pts[se.pts.length - 1]!; s += `<text x="${px(x) - 4}" y="${py(y) - 8}" text-anchor="end" font-size="13" font-weight="800" fill="${c}">${se.label}</text>`; }
  }
  return svg(W, H, s);
}

/** Sample a function into chart points. */
export const sample = (f: (t: number) => number, t1: number, n = 24): [number, number][] =>
  Array.from({ length: n + 1 }, (_, i) => { const t = (t1 * i) / n; return [t, f(t)]; });

export function table(head: (string | number)[], rows: (string | number)[][]) {
  return `<div class="table-wrap"><table class="data"><thead><tr>${head.map((x) => `<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${typeof c === 'number' ? String(c).replace('.', ',') : c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
