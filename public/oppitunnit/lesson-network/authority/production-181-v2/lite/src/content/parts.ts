// Shared pieces for the lessons added in the 177-node MVP: option builders,
// distractor pickers and a few pictures (ten frame, arrays, shapes, column sums).
import type { Rng } from '../engine/rng';
import type { Item, Option, Task } from '../engine/types';
import { svg, THINGS } from '../ui/art';
import { fmt, word } from './fi';
import { choose, fixed, paint, txt } from './kit';
import { fracText } from './pics';

export type Q = Omit<Item, 'tag'>;

/** Plain written option (not read aloud separately). */
export const t = (s: string): Option => txt(s, false);
/** A number shown big and spoken as a word when small. */
export const n$ = (n: number): Option => ({ big: d(n), speak: Number.isInteger(n) && n >= 0 && n < 100 ? word(n) : undefined });
/** An expression option shown with symbols. */
export const ex = (s: string): Option => ({ big: s });
/** A fraction option. */
export const fr = (a: number, b: number): Option => ({ art: `<div class="big-frac">${fracText(a, b)}</div>`, speak: `${a}/${b}` });
/** Formula card scene. */
export const card = (...lines: string[]) => paint(`<div class="formula">${lines.join('<br>')}</div>`);
export const numeric = (answer: number, unit?: string, label?: string): Task => ({ kind: 'numeric', answer: round(answer), unit, label });
export const round = (x: number) => Math.round(x * 1e6) / 1e6;
/** Decimal number with a decimal comma (and a proper minus sign). */
export const d = (x: number) => fmt(round(x)).replace('-', '−');
export const ask = (say: string, answer: number, explain: string, o: { unit?: string; scene?: string; hint?: string; whyAt?: Record<number, string> } = {}): Q =>
  ({ say, task: o.whyAt ? { ...numeric(answer, o.unit), whyAt: o.whyAt } as Q['task'] : numeric(answer, o.unit), explain, hint: o.hint, scene: o.scene ? paint(o.scene) : undefined });
export const YESNO = (yes: boolean, whyNo?: string, whyYes?: string) =>
  fixed([t('Kyllä'), t('Ei')], yes ? 0 : 1, yes ? [undefined, whyNo] : [whyYes, undefined], 2);
export const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));

/** k distinct wrong numbers: the given candidates first (kept if different from the answer
 *  and inside [lo, hi]), then nearby numbers. */
export function alts(r: Rng, ans: number, cands: number[], k = 2, lo = 0, hi = Infinity, step = 1): number[] {
  const out: number[] = [];
  const ok = (x: number) => Number.isFinite(x) && round(x) !== round(ans) && x >= lo && x <= hi && !out.some((y) => round(y) === round(x));
  for (const c of cands) if (out.length < k && ok(c)) out.push(round(c));
  for (let dd = 1; out.length < k && dd < 50; dd++) for (const c of r.shuffle([ans + dd * step, ans - dd * step])) if (out.length < k && ok(c)) out.push(round(c));
  return out;
}

/** Choice between the right number and wrong ones; why[i] belongs to cands[i]. */
export function pickNum(r: Rng, ans: number, cands: number[], why: (string | undefined)[] = [], o: { k?: number; lo?: number; hi?: number; step?: number; opt?: (n: number) => Option } = {}) {
  const ws = alts(r, ans, cands, o.k ?? 2, o.lo ?? 0, o.hi ?? Infinity, o.step ?? 1);
  const whyOf = (w: number) => why[cands.findIndex((c) => round(c) === w)];
  const opt = o.opt ?? n$;
  return choose(r, opt(ans), ws.map(opt), ws.map(whyOf));
}

/** Choice between written statements: the first is right. */
export const pickText = (r: Rng, right: string, wrong: string[], why: (string | undefined)[] = [], cols = 1) =>
  choose(r, t(right), wrong.map(t), why, cols);

/** Distinct random integers in [lo, hi]. */
export const distinct = (r: Rng, k: number, lo: number, hi: number) => r.shuffle(Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)).slice(0, k);

// ---------------------------------------------------------------- pictures

/** Ten frame with n counters (n ≤ 10), or two frames for n ≤ 20. */
export function tenFrame(n: number, kind = 'simpukka', second?: number) {
  const U = 30, frames = second === undefined ? (n > 10 ? 2 : 1) : 2;
  const counts = second === undefined ? [Math.min(10, n), Math.max(0, n - 10)] : [n, second];
  let s = '';
  for (let f = 0; f < frames; f++) {
    const y0 = 4 + f * (2 * U + 12);
    for (let i = 0; i < 10; i++) {
      const x = 4 + (i % 5) * U, y = y0 + Math.floor(i / 5) * U;
      s += `<rect x="${x}" y="${y}" width="${U}" height="${U}" fill="var(--card)" stroke="currentColor" stroke-width="2"/>`;
      if (i < counts[f]!) s += THINGS[kind]!.draw(x + U / 2, y + U / 2, U * 0.8);
    }
  }
  return svg(5 * U + 8, frames * (2 * U + 12), s, `${n}`);
}

/** rows × cols array of things. */
export function arrayArt(rows: number, cols: number, kind = 'marja', size = 24) {
  const U = size * 1.15;
  let s = '';
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) s += THINGS[kind]!.draw(6 + U / 2 + j * U, 6 + U / 2 + i * U, size);
  return svg(cols * U + 12, rows * U + 12, s, `${rows} riviä, ${cols} jokaisessa`);
}

/** Column calculation: numbers right-aligned, operator on the last line, optional result and carries. */
export function column(nums: (number | string)[], op: string, result?: number | string, carry?: string) {
  const rows = nums.map((n) => String(n));
  const width = Math.max(...rows.map((x) => x.length), result === undefined ? 0 : String(result).length) + 2;
  const pad = (s: string) => s.padStart(width, ' ');
  const lines = [
    ...(carry ? [`<span class="carry">${pad(carry)}</span>`] : []),
    ...rows.map((x, i) => (i === rows.length - 1 ? op + pad(x).slice(1) : pad(x))),
    `<span class="rule">${pad(result === undefined ? '' : String(result))}</span>`,
  ];
  return `<div class="formula column">${lines.join('\n')}</div>`;
}

const SH = {
  ympyra: (x: number, y: number, s: number, c: string) => `<circle cx="${x}" cy="${y}" r="${s * 0.45}" fill="${c}" stroke="currentColor" stroke-width="2"/>`,
  nelio: (x: number, y: number, s: number, c: string) => `<rect x="${x - s * 0.4}" y="${y - s * 0.4}" width="${s * 0.8}" height="${s * 0.8}" fill="${c}" stroke="currentColor" stroke-width="2"/>`,
  kolmio: (x: number, y: number, s: number, c: string) => `<path d="M${x} ${y - s * 0.45} L${x + s * 0.48} ${y + s * 0.4} L${x - s * 0.48} ${y + s * 0.4}Z" fill="${c}" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
  suorakulmio: (x: number, y: number, s: number, c: string) => `<rect x="${x - s * 0.5}" y="${y - s * 0.28}" width="${s}" height="${s * 0.56}" fill="${c}" stroke="currentColor" stroke-width="2"/>`,
};
export type ShapeKind = keyof typeof SH;
export const SHAPE_KINDS = Object.keys(SH) as ShapeKind[];
/** Inclusive classification: every square is also a rectangle. */
export const isA = (x: ShapeKind, k: ShapeKind) => x === k || (k === 'suorakulmio' && x === 'nelio');
/** Kinds that are clearly not a k (a square is never offered as "not a rectangle"). */
export const notA = (k: ShapeKind) => SHAPE_KINDS.filter((x) => !isA(x, k) && !isA(k, x));
export const SHAPE_NAME: Record<ShapeKind, [string, string]> = { ympyra: ['ympyrä', 'ympyrät'], nelio: ['neliö', 'neliöt'], kolmio: ['kolmio', 'kolmiot'], suorakulmio: ['suorakulmio', 'suorakulmiot'] };
export const COLOR = { punainen: '#d9534f', sininen: '#3f7fd6', keltainen: '#f2c230', vihreä: '#4caf6a' } as const;
export type ColorName = keyof typeof COLOR;
export const COLOR_NAMES = Object.keys(COLOR) as ColorName[];
export const COLOR_PL: Record<ColorName, string> = { punainen: 'punaiset', sininen: 'siniset', keltainen: 'keltaiset', vihreä: 'vihreät' };

/** One flat shape, optionally rotated (degrees). */
export function shapeSvg(kind: ShapeKind, color: ColorName | string = 'sininen', size = 56, rot = 0) {
  const c = (COLOR as Record<string, string>)[color] ?? color;
  return svg(size + 8, size + 8, `<g data-size="${size}" transform="rotate(${rot} ${size / 2 + 4} ${size / 2 + 4})">${SH[kind](size / 2 + 4, size / 2 + 4, size, c)}</g>`, SHAPE_NAME[kind][0]);
}

/** Solid (3D) objects drawn with shading. */
export const SOLID = {
  pallo: (s = 60) => svg(s + 8, s + 8, `<defs><radialGradient id="pg${s}" cx=".35" cy=".35"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#d9534f"/></radialGradient></defs><circle cx="${s / 2 + 4}" cy="${s / 2 + 4}" r="${s / 2}" fill="url(#pg${s})" stroke="currentColor" stroke-width="2"/>`, 'pallo'),
  kuutio: (s = 60) => { const a = s * 0.62, o = s * 0.3; return svg(s + 8, s + 8, `<path d="M4 ${4 + o} h${a} v${a} h-${a}z" fill="#f2c230" stroke="currentColor" stroke-width="2"/><path d="M4 ${4 + o} l${o} -${o} h${a} l-${o} ${o}z" fill="#f7da78" stroke="currentColor" stroke-width="2"/><path d="M${4 + a} ${4 + o} l${o} -${o} v${a} l-${o} ${o}z" fill="#c99a1a" stroke="currentColor" stroke-width="2"/>`, 'kuutio'); },
  tolkki: (s = 60) => svg(s + 8, s + 8, `<path d="M${s * 0.2} ${s * 0.18} v${s * 0.64} a${s * 0.3} ${s * 0.12} 0 0 0 ${s * 0.6} 0 v-${s * 0.64}" fill="#3f7fd6" stroke="currentColor" stroke-width="2"/><ellipse cx="${s / 2}" cy="${s * 0.18}" rx="${s * 0.3}" ry="${s * 0.12}" fill="#8fb3ea" stroke="currentColor" stroke-width="2"/>`, 'tölkki'),
  kartio: (s = 60) => svg(s + 8, s + 8, `<path d="M${s / 2 + 4} 4 L${s * 0.85} ${s * 0.82} a${s * 0.35} ${s * 0.12} 0 0 1 -${s * 0.7} 0z" fill="#4caf6a" stroke="currentColor" stroke-width="2"/><path d="M${s * 0.15} ${s * 0.82} a${s * 0.35} ${s * 0.12} 0 0 0 ${s * 0.7} 0" fill="none" stroke="currentColor" stroke-width="2"/>`, 'kartio'),
};
export type SolidKind = keyof typeof SOLID;
export const SOLID_NAME: Record<SolidKind, string> = { pallo: 'pallo', kuutio: 'kuutio', tolkki: 'lieriö', kartio: 'kartio' };
/** The flat print each solid leaves when pressed into sand (one face). */
export const SOLID_PRINT: Record<SolidKind, ShapeKind> = { pallo: 'ympyra', kuutio: 'nelio', tolkki: 'ympyra', kartio: 'ympyra' };

/** A row of sticks with the given lengths (units), for ordering. */
export const stick = (len: number, color = '#8a5a33', max = 10) =>
  svg(max * 18 + 12, 26, `<rect x="6" y="6" width="${len * 18}" height="14" rx="7" fill="${color}"/>`, `${len}`);

/** 10 × 10 grid with the first n small squares shaded (hundredths). */
export function hundredGrid(n: number, size = 150) {
  const U = (size - 8) / 10;
  let s = '';
  for (let i = 0; i < 100; i++) {
    const col = Math.floor(i / 10), row = i % 10;
    s += `<rect x="${4 + col * U}" y="${4 + row * U}" width="${U}" height="${U}" fill="${i < n ? 'var(--pond)' : 'var(--card)'}" stroke="currentColor" stroke-opacity=".35"/>`;
  }
  s += `<rect x="4" y="4" width="${10 * U}" height="${10 * U}" fill="none" stroke="currentColor" stroke-width="2.5"/>`;
  return svg(size, size, s, `${n} sadasosaa`);
}

/** A bar cut into 10 equal parts with n shaded (tenths). n may exceed 10: several bars. */
export function tenthsBar(n: number, w = 260) {
  const bars = Math.max(1, Math.ceil(n / 10));
  const U = (w - 8) / 10;
  let s = '';
  for (let b = 0; b < bars; b++) for (let i = 0; i < 10; i++) {
    const k = b * 10 + i;
    s += `<rect x="${4 + i * U}" y="${4 + b * 40}" width="${U}" height="30" fill="${k < n ? 'var(--sun)' : 'var(--card)'}" stroke="currentColor" stroke-width="1.5"/>`;
  }
  return svg(w, bars * 40 + 4, s, `${n} kymmenesosaa`);
}

export const many = (k: string, n: number) => (n === 1 ? THINGS[k]!.one : THINGS[k]!.many);
