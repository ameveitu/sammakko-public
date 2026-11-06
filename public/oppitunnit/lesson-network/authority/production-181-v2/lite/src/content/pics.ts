// Pictures for the 3–6 grade and extended lessons. Plain SVG strings, CSS-variable colours.
import { svg, THINGS } from '../ui/art';

const T = (x: number, y: number, s: string | number, size = 14, w = 700, anchor = 'middle', fill = 'currentColor') =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-weight="${w}" fill="${fill}">${String(s).replace(/(\d)\.(\d)/g, '$1,$2').replace(/^-/, '−')}</text>`;
export const neg = (n: number) => String(n).replace('-', '−');

// ---------------------------------------------------------------- fractions

/** A whole cut into parts; `shaded` parts filled. `cuts` gives unequal parts (fractions of the whole, sum 1). */
/** A pie (or bar) cut into parts; the first `shaded` parts are coloured with berry filling. */
export function fracArt(parts: number, shaded: number, shape: 'pie' | 'bar' = 'pie', cuts?: number[], size = 120, color = '#d65a6f') {
  const sizes = cuts ?? Array(parts).fill(1 / parts);
  if (shape === 'bar') {
    const W = size * 1.6, H = size * 0.42;
    let x = 4, s = '';
    sizes.forEach((f, i) => {
      s += `<rect x="${x}" y="4" width="${f * (W - 8)}" height="${H}" fill="${i < shaded ? color : 'var(--card)'}" stroke="currentColor" stroke-width="2.5"/>`;
      x += f * (W - 8);
    });
    return svg(W, H + 8, s, `${shaded}/${parts}`);
  }
  const c = size / 2, R = size / 2 - 4, dough = '#f3dcaa';
  let a = -Math.PI / 2, s = `<circle cx="${c}" cy="${c}" r="${R + 2}" fill="#d9a55b"/>`;
  if (sizes.length === 1) s += `<circle cx="${c}" cy="${c}" r="${R}" fill="${shaded ? color : dough}" stroke="currentColor" stroke-width="2.5"/>`;
  else sizes.forEach((f, i) => {
    const b = a + f * 2 * Math.PI;
    const p = (t: number) => `${c + R * Math.cos(t)} ${c + R * Math.sin(t)}`;
    s += `<path d="M${c} ${c} L${p(a)} A${R} ${R} 0 ${f > 0.5 ? 1 : 0} 1 ${p(b)} Z" fill="${i < shaded ? color : dough}" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>`;
    a = b;
  });
  return svg(size, size, s, `${shaded}/${parts}`);
}

/** Several equal wholes side by side (for n × a/b). */
export const fracRow = (count: number, parts: number, shaded: number, shape: 'pie' | 'bar' = 'pie') =>
  `<div class="pics">${Array.from({ length: count }, () => fracArt(parts, shaded, shape, undefined, 84)).join('')}</div>`;

/** A fraction written as a stacked number (HTML). */
export const fracText = (a: number | string, b: number | string) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;

/** Area model for a/b × c/d: unit square, columns c/d one way, rows a/b the other. */
export function areaModel(a: number, b: number, c: number, d: number, size = 170) {
  const S = size - 10;
  let s = '';
  for (let i = 0; i < d; i++) for (let j = 0; j < b; j++) {
    const inCol = i < c, inRow = j < a;
    const fill = inCol && inRow ? 'var(--pond)' : inCol ? 'color-mix(in srgb, var(--blue) 35%, var(--card))' : inRow ? 'color-mix(in srgb, var(--sun) 45%, var(--card))' : 'var(--card)';
    s += `<rect x="${5 + (i * S) / d}" y="${5 + (j * S) / b}" width="${S / d}" height="${S / b}" fill="${fill}" stroke="currentColor" stroke-width="1.5"/>`;
  }
  s += `<rect x="5" y="5" width="${S}" height="${S}" fill="none" stroke="currentColor" stroke-width="3"/>`;
  return svg(size, size, s, `${a}/${b} kertaa ${c}/${d}`);
}

// ---------------------------------------------------------------- coordinates

export interface Pin { x: number; y: number; label?: string; icon?: 'x' | 'ship' | 'dot' | 'palm' | 'flag'; color?: string }

/** Treasure map grid. Range xMin..xMax, yMin..yMax (step 1). */
export type GridOpts = { xMin?: number; xMax: number; yMin?: number; yMax: number; pins: Pin[]; sea?: boolean; w?: number; labels?: boolean; poly?: [number, number][]; lines?: { pts: [number, number][]; color?: string; label?: string }[] };
export function gridArt(o: GridOpts) { const g = gridParts(o); return svg(g.W, g.H, g.s); }
/** The grid drawing plus its geometry (for animations drawn on top of it). */
export function gridParts(o: GridOpts) {
  const x0 = o.xMin ?? 0, y0 = o.yMin ?? 0;
  const four = x0 < 0 || y0 < 0;
  const W = o.w ?? 300;
  const cell = Math.min((W - 40) / (o.xMax - x0), 30);
  const L = four ? 16 : 30, B = four ? 16 : 26, Tp = 18;
  const gw = cell * (o.xMax - x0), gh = cell * (o.yMax - y0);
  const H = gh + B + Tp;
  const px = (x: number) => L + (x - x0) * cell, py = (y: number) => Tp + gh - (y - y0) * cell;
  let s = o.sea === false ? '' : `<rect x="${L}" y="${Tp}" width="${gw}" height="${gh}" rx="6" fill="color-mix(in srgb, var(--blue) 16%, var(--card))"/>`;
  for (let x = x0; x <= o.xMax; x++) s += `<line x1="${px(x)}" y1="${py(y0)}" x2="${px(x)}" y2="${py(o.yMax)}" stroke="var(--line)"/>`;
  for (let y = y0; y <= o.yMax; y++) s += `<line x1="${px(x0)}" y1="${py(y)}" x2="${px(o.xMax)}" y2="${py(y)}" stroke="var(--line)"/>`;
  const ax = four ? py(0) : py(y0), ay = four ? px(0) : px(x0);
  s += `<line x1="${px(x0)}" y1="${ax}" x2="${px(o.xMax) + 8}" y2="${ax}" stroke="currentColor" stroke-width="2.2"/><path d="M${px(o.xMax) + 12} ${ax}l-7 -4v8z" fill="currentColor"/>`;
  s += `<line x1="${ay}" y1="${py(y0)}" x2="${ay}" y2="${py(o.yMax) - 8}" stroke="currentColor" stroke-width="2.2"/><path d="M${ay} ${py(o.yMax) - 12}l-4 7h8z" fill="currentColor"/>`;
  if (o.labels !== false) {
    for (let x = x0; x <= o.xMax; x++) if (!(four ? x === 0 : x === x0)) s += T(px(x), ax + 14, neg(x), 11, 600);
    for (let y = y0; y <= o.yMax; y++) if (!(four ? y === 0 : y === y0)) s += T(ay - 5, py(y) + 4, neg(y), 11, 600, 'end');
    s += T(four ? px(0) - 5 : px(x0) - 5, (four ? py(0) : py(y0)) + 14, 0, 11, 600, 'end');
  }
  s += T(px(o.xMax) + 10, ax - 6, 'x', 13, 800, 'end') + T(ay + 8, py(o.yMax) - 4, 'y', 13, 800, 'start');
  if (o.poly) s += `<polygon points="${o.poly.map(([x, y]) => `${px(x)},${py(y)}`).join(' ')}" fill="color-mix(in srgb, var(--sun) 35%, transparent)" stroke="var(--sun)" stroke-width="2.5"/>`;
  for (const l of o.lines ?? []) {
    const c = l.color ?? 'var(--pond)';
    s += `<polyline points="${l.pts.map(([x, y]) => `${px(x)},${py(y)}`).join(' ')}" fill="none" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>`;
    if (l.label) { const [x, y] = l.pts[l.pts.length - 1]!; s += T(px(x) - 4, py(y) + (y > (y0 + o.yMax) / 2 ? 16 : -8), l.label, 13, 800, 'end', c); }
  }
  for (const p of o.pins) {
    const X = px(p.x), Y = py(p.y), c = p.color ?? 'var(--red)';
    if (p.icon === 'x') s += `<path d="M${X - 7} ${Y - 7}L${X + 7} ${Y + 7}M${X + 7} ${Y - 7}L${X - 7} ${Y + 7}" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`;
    else if (p.icon === 'ship') s += `<path d="M${X - 10} ${Y + 1}h20l-4 6h-12z" fill="#8a5a33"/><path d="M${X} ${Y + 1}V${Y - 13}l9 9z" fill="var(--card)" stroke="currentColor"/>`;
    else if (p.icon === 'palm') s += `<path d="M${X} ${Y}v-12" stroke="#8a5a33" stroke-width="3"/><path d="M${X} ${Y - 12}q-9 -4 -11 3M${X} ${Y - 12}q9 -4 11 3M${X} ${Y - 12}q-2 -8 -9 -9M${X} ${Y - 12}q2 -8 9 -9" stroke="#3e9b54" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    else if (p.icon === 'flag') s += `<path d="M${X} ${Y}v-16" stroke="currentColor" stroke-width="2.5"/><path d="M${X} ${Y - 16}h11l-3 4 3 4h-11z" fill="${c}"/>`;
    else s += `<circle cx="${X}" cy="${Y}" r="6" fill="${c}"/>`;
    if (p.label) s += T(X + 9, Y - 7, p.label, 13, 800, 'start', c);
  }
  return { s, W, H, px, py, cell };
}

// ---------------------------------------------------------------- negative numbers

/** Thermometer showing temperature t on a scale min..max. */
export function thermoArt(t: number, min = -10, max = 10, label = '') {
  return svg(96, label ? 228 : 210, thermoInner(t, min, max, label), `${neg(t)} astetta`);
}
/** Thermometer drawing (96 × 210) without the svg wrapper, for animations. */
export function thermoInner(t: number, min = -10, max = 10, label = '') {
  const H = 210, top = 16, bot = 170, x = 46;
  const py = (v: number) => bot - ((v - min) / (max - min)) * (bot - top);
  let s = `<rect x="${x - 9}" y="${top - 8}" width="18" height="${bot - top + 16}" rx="9" fill="var(--card)" stroke="currentColor" stroke-width="2"/>`;
  s += `<circle cx="${x}" cy="${bot + 18}" r="16" fill="var(--red)" stroke="currentColor" stroke-width="2"/>`;
  s += `<rect x="${x - 5}" y="${py(t)}" width="10" height="${bot + 10 - py(t)}" fill="var(--red)"/>`;
  for (let v = min; v <= max; v++) {
    const big = v % 5 === 0;
    s += `<line x1="${x + 10}" y1="${py(v)}" x2="${x + (big ? 22 : 16)}" y2="${py(v)}" stroke="currentColor" stroke-width="${v === 0 ? 3 : 1.5}"/>`;
    if (big) s += T(x + 38, py(v) + 5, neg(v), 14, v === 0 ? 800 : 600);
  }
  if (label) s += T(x, H + 14, label, 13, 800);
  return s;
}
export const thermoY = (v: number, min = -10, max = 10) => 170 - ((v - min) / (max - min)) * 154;

/** Static number line with marks and optional jump arrows. */
export function numberLineArt(o: { min: number; max: number; step?: number; labelEvery?: number; marks?: { v: number; label?: string; color?: string; icon?: 'frog' | 'dot' | 'fish' }[]; jumps?: { from: number; to: number; label?: string; color?: string }[]; w?: number }) {
  const step = o.step ?? 1;
  const W = o.w ?? 330, L = 16, R = 16, Y = 70;
  // Thin out the numbers when they would touch (negative numbers are wider).
  let every = o.labelEvery ?? step;
  while ((W - L - R) / ((o.max - o.min) / every) < (o.min < 0 ? 24 : 15)) every *= 2;
  const px = (v: number) => L + ((v - o.min) / (o.max - o.min)) * (W - L - R);
  let s = `<line x1="${L - 8}" y1="${Y}" x2="${W - R + 8}" y2="${Y}" stroke="currentColor" stroke-width="2.5"/><path d="M${W - R + 12} ${Y}l-8 -5v10z" fill="currentColor"/>`;
  const n = Math.round((o.max - o.min) / step);
  for (let i = 0; i <= n; i++) {
    const v = o.min + i * step;
    const big = Math.abs(v / every - Math.round(v / every)) < 1e-9;
    s += `<line x1="${px(v)}" y1="${Y - (big ? 9 : 5)}" x2="${px(v)}" y2="${Y + (big ? 9 : 5)}" stroke="currentColor" stroke-width="${v === 0 ? 3 : 1.8}"/>`;
    if (big) s += T(px(v), Y + 26, neg(Math.round(v * 100) / 100), 13, v === 0 ? 800 : 600);
  }
  for (const j of o.jumps ?? []) {
    const a = px(j.from), b = px(j.to), c = j.color ?? 'var(--pond)';
    const hgt = Math.min(48, 14 + Math.abs(b - a) * 0.3);
    s += `<path d="M${a} ${Y - 6} Q${(a + b) / 2} ${Y - 6 - hgt * 1.6} ${b} ${Y - 6}" fill="none" stroke="${c}" stroke-width="2.5"/><path d="M${b} ${Y - 5}l${a < b ? -8 : 8} -5 ${a < b ? 1 : -1} 7z" fill="${c}"/>`;
    if (j.label) s += T((a + b) / 2, Y - 10 - hgt * 0.8, j.label, 12, 800, 'middle', c);
  }
  for (const m of o.marks ?? []) {
    const c = m.color ?? 'var(--red)';
    if (m.icon === 'frog') s += `<circle cx="${px(m.v)}" cy="${Y - 14}" r="9" fill="#5cbf6c"/><circle cx="${px(m.v) - 4}" cy="${Y - 20}" r="3" fill="#fff"/><circle cx="${px(m.v) + 4}" cy="${Y - 20}" r="3" fill="#fff"/>`;
    else s += `<circle cx="${px(m.v)}" cy="${Y}" r="7" fill="${c}"/>`;
    if (m.label) s += T(px(m.v), Y - 18 - (m.icon === 'frog' ? 12 : 0), m.label, 14, 800, 'middle', c);
  }
  return svg(W, 104, s);
}

// ---------------------------------------------------------------- balance

/** Two-pan balance. Items: '3' (weight with number), 'x' (bag with ?), 'b' (blank bag), or a THINGS key. tilt: -1 left down, 0 level, 1 right down. */
export function balanceArt(left: string[], right: string[], tilt: number = 0, w = 300) {
  return svg(w, 196, balanceBody(left, right, tilt, w));
}
/** Balance drawing without the svg wrapper; tilt is continuous in −1…1 (positive: right side down). */
export function balanceBody(left: string[], right: string[], tilt: number = 0, w = 300) {
  const cx = w / 2, beamY = 52, arm = w * 0.28, d = Math.max(-1, Math.min(1, tilt)) * 14;
  const ly = beamY - d, ry = beamY + d;
  const item = (k: string, x: number, y: number) => {
    if (k === 'x' || k === 'b') return `<path d="M${x - 14} ${y} l4 -26 h20 l4 26z" fill="#c9a26b" stroke="#8a5a33" stroke-width="2"/><path d="M${x - 8} ${y - 26} q8 -10 16 0" fill="none" stroke="#8a5a33" stroke-width="2"/>${k === 'x' ? T(x, y - 7, '?', 15, 800, 'middle', '#5a3a1e') : ''}`;
    if (THINGS[k]) return THINGS[k].draw(x, y - 12, 22);
    return `<path d="M${x - 13} ${y} l3 -22 h20 l3 22z" fill="#7c8a96" stroke="#4d5963" stroke-width="2"/><rect x="${x - 4}" y="${y - 27}" width="8" height="6" rx="2" fill="#4d5963"/>${T(x, y - 6, k, 13, 800, 'middle', '#fff')}`;
  };
  const pan = (items: string[], x: number, y: number) => {
    const span = Math.min(30, (arm * 1.1) / Math.max(1, items.length));
    const x0 = x - ((items.length - 1) * span) / 2;
    return `<path d="M${x} ${y} L${x - arm * 0.5} ${y + 60} M${x} ${y} L${x + arm * 0.5} ${y + 60}" stroke="currentColor" stroke-opacity=".5" stroke-width="1.5"/>` +
      `<path d="M${x - arm * 0.62} ${y + 60} h${arm * 1.24} q-6 12 -${arm * 0.62} 12 q-${arm * 0.62 - 6} 0 -${arm * 0.62} -12z" fill="color-mix(in srgb, var(--sun) 40%, var(--card))" stroke="currentColor" stroke-width="2"/>` +
      items.map((k, i) => item(k, x0 + i * span, y + 60)).join('');
  };
  let s = `<path d="M${cx - 40} 190 h80 l-12 -14 h-56z" fill="currentColor" opacity=".7"/><rect x="${cx - 5}" y="${beamY}" width="10" height="124" fill="currentColor" opacity=".7"/>`;
  s += `<line x1="${cx - arm}" y1="${ly}" x2="${cx + arm}" y2="${ry}" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><circle cx="${cx}" cy="${beamY}" r="7" fill="var(--sun)" stroke="currentColor" stroke-width="2"/>`;
  s += pan(left, cx - arm, ly) + pan(right, cx + arm, ry);
  return s;
}

// ---------------------------------------------------------------- measuring

/** A cm ruler from 0 to len with an object (a stick) from a to b. */
export function rulerArt(len: number, a: number, b: number, what: 'stick' | 'worm' | 'pencil' = 'stick') {
  const W = Math.max(300, len * 22 + 30), U = (W - 30) / len, X = (v: number) => 15 + v * U;
  let s = `<rect x="6" y="54" width="${W - 12}" height="40" rx="5" fill="color-mix(in srgb, var(--sun) 50%, var(--card))" stroke="currentColor" stroke-width="2"/>`;
  for (let v = 0; v <= len; v++) s += `<line x1="${X(v)}" y1="54" x2="${X(v)}" y2="${v % 5 === 0 ? 72 : 66}" stroke="currentColor" stroke-width="1.8"/>` + T(X(v), 88, v, 12, 700);
  if (what === 'worm') s += `<path d="M${X(a)} 40 q${(X(b) - X(a)) / 4} -14 ${(X(b) - X(a)) / 2} 0 t${(X(b) - X(a)) / 2} 0" fill="none" stroke="#e58c8c" stroke-width="12" stroke-linecap="round"/><circle cx="${X(b) - 3}" cy="37" r="2" fill="#1b2a22"/>`;
  else if (what === 'pencil') s += `<rect x="${X(a)}" y="32" width="${X(b) - X(a) - 14}" height="14" fill="var(--sun)" stroke="currentColor" stroke-width="1.5"/><path d="M${X(b) - 14} 32 L${X(b)} 39 L${X(b) - 14} 46z" fill="#e8c9a0" stroke="currentColor" stroke-width="1.5"/>`;
  else s += `<rect x="${X(a)}" y="32" width="${X(b) - X(a)}" height="14" rx="6" fill="#8a5a33"/>`;
  s += `<line x1="${X(a)}" y1="26" x2="${X(a)}" y2="54" stroke="var(--red)" stroke-dasharray="3 3"/><line x1="${X(b)}" y1="26" x2="${X(b)}" y2="54" stroke="var(--red)" stroke-dasharray="3 3"/>`;
  return svg(W, 100, s);
}

/** A jug/cup/glass with fill level 0..1. */
export const VESSELS: Record<string, { d: string; top: number; bot: number; lx: number; rx: number }> = {
    kannu: { d: 'M20 22 h46 l6 86 h-58z M66 36 q20 4 14 30 q-4 12 -12 12', top: 22, bot: 108, lx: 20, rx: 66 },
    muki: { d: 'M22 52 h40 v56 h-40z M62 62 q16 0 14 18 q-2 12 -14 12', top: 52, bot: 108, lx: 22, rx: 62 },
    lasi: { d: 'M30 30 h30 l-3 78 h-24z', top: 30, bot: 108, lx: 30, rx: 60 },
    pullo: { d: 'M38 10 h14 v18 q14 8 14 22 v58 h-42 v-58 q0 -14 14 -22z', top: 30, bot: 108, lx: 24, rx: 66 },
    ampari: { d: 'M10 34 h70 l-8 74 h-54z', top: 34, bot: 108, lx: 10, rx: 80 },
};
export function vesselArt(kind: 'kannu' | 'muki' | 'lasi' | 'pullo' | 'ampari', level: number, label = '', w = 90) {
  const h = 120, base = 108;
  const sh = VESSELS[kind]!;
  const y = sh.bot - level * (sh.bot - sh.top);
  const id = `cl${Math.round(Math.random() * 1e9)}`;
  const outline = sh.d.split(' M')[0]!;
  let s = `<defs><clipPath id="${id}"><path d="${outline}"/></clipPath></defs>`;
  s += `<rect x="0" y="${y}" width="${w}" height="${base - y + 2}" fill="color-mix(in srgb, var(--blue) 60%, transparent)" clip-path="url(#${id})"/>`;
  s += `<path d="${sh.d}" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>`;
  if (label) s += T(w / 2, h - 1, label, 13, 800);
  return svg(w, h + 6, s);
}

// ---------------------------------------------------------------- place value

/** Reed bundles of ten (tied with a band) and single reeds. */
export function reedsArt(tens: number, ones: number, w = 320) {
  const bw = 26, gap = 8, sw = 7;
  let x = 6, s = '';
  for (let i = 0; i < tens; i++) {
    for (let k = 0; k < 10; k++) s += `<rect x="${x + (k % 5) * 4.4 + (k > 4 ? 2 : 0)}" y="${10 + (k > 4 ? 3 : 0)}" width="3.4" height="88" rx="1.6" fill="#8fae5d"/>`;
    s += `<rect x="${x - 2}" y="50" width="${bw}" height="9" rx="3" fill="var(--red)"/>`;
    x += bw + gap;
  }
  if (tens && ones) x += 10;
  for (let i = 0; i < ones; i++) { s += `<rect x="${x}" y="10" width="4" height="88" rx="2" fill="#8fae5d"/><ellipse cx="${x + 2}" cy="10" rx="3" ry="6" fill="#8a5a33"/>`; x += sw + 3; }
  return svg(Math.max(w, x + 6), 106, s, `${tens} nippua ja ${ones} kaislaa`);
}

/** Base-ten blocks: hundreds squares, tens rods, ones cubes; thousands as a cube outline. */
export function blocksArt(th: number, h: number, t: number, o: number) {
  const U = 7;
  let x = 6, s = '';
  for (let i = 0; i < th; i++) {
    s += `<path d="M${x} 30 h${U * 7} l14 -14 h-${U * 7} z" fill="color-mix(in srgb, var(--pond) 55%, var(--card))" stroke="currentColor"/><rect x="${x}" y="30" width="${U * 7}" height="${U * 7}" fill="var(--pond)" stroke="currentColor"/><path d="M${x + U * 7} 30 l14 -14 v${U * 7} l-14 14z" fill="color-mix(in srgb, var(--pond) 70%, black)" stroke="currentColor"/>`;
    s += T(x + U * 3.5, 30 + U * 7 + 16, '1000', 11, 800);
    x += U * 7 + 24;
  }
  for (let i = 0; i < h; i++) {
    s += `<rect x="${x}" y="16" width="${U * 10}" height="${U * 10}" fill="var(--blue)" stroke="currentColor"/>`;
    for (let k = 1; k < 10; k++) s += `<line x1="${x + k * U}" y1="16" x2="${x + k * U}" y2="${16 + U * 10}" stroke="#fff" stroke-opacity=".35"/><line x1="${x}" y1="${16 + k * U}" x2="${x + U * 10}" y2="${16 + k * U}" stroke="#fff" stroke-opacity=".35"/>`;
    x += U * 10 + 8;
  }
  for (let i = 0; i < t; i++) { s += `<rect x="${x}" y="16" width="${U}" height="${U * 10}" fill="var(--sun)" stroke="currentColor"/>`; x += U + 5; }
  if (t) x += 4;
  for (let i = 0; i < o; i++) { s += `<rect x="${x + (i % 3) * (U + 3)}" y="${16 + U * 10 - (Math.floor(i / 3) + 1) * (U + 3)}" width="${U}" height="${U}" fill="var(--red)" stroke="currentColor"/>`; }
  if (o) x += 3 * (U + 3);
  return svg(Math.max(240, x + 6), U * 10 + 40, s);
}

/** Place-value chart (HTML table) with the digits of n; `hide` replaces one column by □. */
export function placeChart(n: number, cols: ('t' | 's' | 'k' | 'y')[] = ['t', 's', 'k', 'y'], hide?: 't' | 's' | 'k' | 'y') {
  const head = { t: 'tuhannet', s: 'sadat', k: 'kymmenet', y: 'ykköset' };
  const d = { t: Math.floor(n / 1000) % 10, s: Math.floor(n / 100) % 10, k: Math.floor(n / 10) % 10, y: n % 10 };
  return `<div class="table-wrap"><table class="data place-chart"><thead><tr>${cols.map((c) => `<th>${head[c]}</th>`).join('')}</tr></thead><tbody><tr>${cols.map((c) => `<td class="big">${c === hide ? '□' : d[c]}</td>`).join('')}</tr></tbody></table></div>`;
}

// ---------------------------------------------------------------- data

/** Tally marks for n (groups of five). */
export function tallyArt(n: number, h = 40) {
  let s = '', x = 6;
  for (let g = 0; g < Math.ceil(n / 5); g++) {
    const k = Math.min(5, n - g * 5);
    for (let i = 0; i < Math.min(4, k); i++) s += `<line x1="${x + i * 8}" y1="6" x2="${x + i * 8}" y2="${h - 6}" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`;
    if (k === 5) s += `<line x1="${x - 4}" y1="${h - 10}" x2="${x + 28}" y2="10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`;
    x += 44;
  }
  return svg(Math.max(60, x), h, s, `${n} viivaa`);
}

// ---------------------------------------------------------------- metric staircase

const STAIR = ['k', 'h', 'da', '', 'd', 'c', 'm'];
/** "Yksikkörappuset": the metric staircase for a base unit, with optional highlighted steps. */
export function stairsArt(base: 'm' | 'g' | 'l', from?: string, to?: string) {
  const W = 320, step = 42, h = 26;
  let s = '';
  STAIR.forEach((p, i) => {
    const u = p + base, x = 6 + i * step, y = 10 + i * h;
    const hi = u === from ? 'var(--sun)' : u === to ? 'var(--pond)' : 'var(--card)';
    const show = base === 'g' ? !['da', 'h', 'd', 'c'].includes(p) || p === '' : base === 'l' ? ['', 'd', 'c', 'm'].includes(p) : ['k', '', 'd', 'c', 'm'].includes(p);
    s += `<rect x="${x}" y="${y}" width="${W - x - 6}" height="${h}" fill="${hi}" stroke="currentColor" stroke-width="1.5"/>`;
    s += T(x + step / 2, y + 18, show ? u : '·', 14, 800);
  });
  return svg(W, 10 + STAIR.length * h + 6, s);
}
export const STAIRS = STAIR;

/** Function machine: input → [rule] → output. */
export const machine = (input: string | number, rule: string, output: string | number) =>
  `<div class="machine"><span class="io">${String(input).replace('-', '−')}</span><span class="arrow">→</span><span class="box">${rule}</span><span class="arrow">→</span><span class="io">${String(output).replace('-', '−')}</span></div>`;

/** The part of the line y = k·x + b that lies inside the box (for gridArt lines). */
export function clipLine(k: number, b: number, x0: number, x1: number, y0: number, y1: number): [number, number][] {
  const pts: [number, number][] = [];
  const add = (x: number, y: number) => { if (x >= x0 - 1e-9 && x <= x1 + 1e-9 && y >= y0 - 1e-9 && y <= y1 + 1e-9 && !pts.some(([a, c]) => Math.abs(a - x) < 1e-9 && Math.abs(c - y) < 1e-9)) pts.push([x, y]); };
  add(x0, k * x0 + b); add(x1, k * x1 + b);
  if (k !== 0) { add((y0 - b) / k, y0); add((y1 - b) / k, y1); }
  return pts.sort((a, c) => a[0] - c[0]).filter((_, i, l) => i === 0 || i === l.length - 1);
}
