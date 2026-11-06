// Aarresaaristo, part 1: positions and coordinates (treasure map), negative numbers
// (frozen bay), place value and unit conversions (island market). Grades 3–6:
// children read, so options may be short texts.
import type { Rng } from '../engine/rng';
import type { Item, NodeSpec, Option, Task } from '../engine/types';
import { svg, THINGS } from '../ui/art';
import { iceHops, thermoScene } from './neganim';
import { exchangeScene, money, tillScene } from './placeanim';
import { fmt } from './fi';
import { cases, choose, fixed, paint, txt, withItemReadiness } from './kit';
import { anim, ease, type AnimPaint } from '../ui/anim';
import { AUDIT_REV, LAUNCH_REV } from './audit-rev';
import { clockScene, hoursScene, packScene, pourScene, stairsScene } from './unitanim';
type Paint = ReturnType<typeof paint>;
import { blocksArt, gridArt, gridParts, neg, numberLineArt, stairsArt, thermoArt, type Pin } from './pics';

type Q = Omit<Item, 'tag'>;
const t = (s: string): Option => txt(s, false);
const P = (x: number, y: number) => `(${neg(x)}, ${neg(y)})`;
const pt = (x: number, y: number): Option => ({ big: P(x, y) });
const card = (...lines: string[]) => paint(`<div class="formula">${lines.join('<br>')}</div>`);
/** Conversion nodes whose audit round is done. */
const CONV_AUDITED = ['M-UNIT-02', 'M-UNIT-03', 'M-UNIT-04'];
/** Attach wrong-answer feedback (task.whyAt) and a hint to a numeric question. */
const wq = (q: Q, hint: string, whyAt: Record<number, string>): Q => ({ ...q, hint, task: { ...q.task, whyAt } as Task });
const ask = (say: string, answer: number, unit: string, explain: string, scene?: string | Paint, label?: string): Q =>
  ({ say, scene: typeof scene === 'string' ? paint(scene) : scene, task: { kind: 'numeric', answer, unit, label }, explain });
const plot = (xs: number[], ys: number[], n = 6, min = 0): Task => ({ kind: 'plot', xs, ys, xMax: n, yMax: n, xMin: min, yMin: min, xStep: 1, yStep: 1, xLabel: 'x', yLabel: 'y' });
const line = (answer: number, min = -8, max = 8, step = 1, labelEvery = 2): Task => ({ kind: 'line', min, max, step, answer, labelEvery });
const deg = (n: number) => `${neg(n)} °C`;

// ---------------------------------------------------------------- coordinate walk
type Walk = { x: number; y: number; from?: [number, number]; icon?: 'x' | 'flag' | 'ship' | 'palm' | 'dot'; say?: string; color?: string };
/** A marker walks from the origin (or `from`) first along x, counting each step (blue), then up
 *  along y (orange); the pin drops and the point is written with the parts coloured to match. */
function coordWalk(o: { xMax: number; yMax: number; xMin?: number; yMin?: number; pins?: Pin[]; trace?: boolean; quads?: boolean }, walks: Walk[]): AnimPaint {
  const g = gridParts({ xMax: o.xMax, yMax: o.yMax, xMin: o.xMin, yMin: o.yMin, pins: o.pins ?? [] });
  if (o.quads) {
    const q = (x: number, y: number, n: string) => `<text x="${g.px(x)}" y="${g.py(y) + 12}" text-anchor="middle" font-size="26" font-weight="900" fill="currentColor" opacity=".3">${n}</text>`;
    const ex = (v: number) => v * 0.8;
    g.s += q(ex(o.xMax), ex(o.yMax), 'I') + q(ex(o.xMin ?? 0), ex(o.yMax), 'II') + q(ex(o.xMin ?? 0), ex(o.yMin ?? 0), 'III') + q(ex(o.xMax), ex(o.yMin ?? 0), 'IV');
  }
  const HOP = 0.45, XC = 'var(--blue)', YC = '#d9822b';
  const lens = walks.map((w) => { const [fx, fy] = w.from ?? [0, 0]; return 0.6 + HOP * (Math.abs(w.x - fx) + Math.abs(w.y - fy)) + 2.2; });
  const starts = lens.map((_, k) => 0.5 + lens.slice(0, k).reduce((a, b) => a + b, 0));
  const dur = starts[starts.length - 1]! + lens[lens.length - 1]! + 0.3;
  const kAt = (t: number) => Math.max(0, starts.filter((s0) => t >= s0).length - 1);
  const pinSvg = (x: number, y: number, icon: Walk['icon'], c: string) => {
    const X = g.px(x), Y = g.py(y);
    if (icon === 'flag') return `<path d="M${X} ${Y}v-16" stroke="currentColor" stroke-width="2.5"/><path d="M${X} ${Y - 16}h11l-3 4 3 4h-11z" fill="${c}"/>`;
    if (icon === 'ship') return `<path d="M${X - 10} ${Y + 1}h20l-4 6h-12z" fill="#8a5a33"/><path d="M${X} ${Y + 1}V${Y - 13}l9 9z" fill="var(--card)" stroke="currentColor"/>`;
    if (icon === 'dot') return `<circle cx="${X}" cy="${Y}" r="6" fill="${c}"/>`;
    return `<path d="M${X - 7} ${Y - 7}L${X + 7} ${Y + 7}M${X + 7} ${Y - 7}L${X - 7} ${Y + 7}" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`;
  };
  const label = (w: Walk, op: number) => {
    const X = g.px(w.x), Y = g.py(w.y), right = X > g.W - 90;
    return `<g opacity="${op}"><rect x="${right ? X - 72 : X + 8}" y="${Y - 30}" width="64" height="20" rx="6" fill="var(--card)" stroke="var(--line)"/><text x="${right ? X - 40 : X + 40}" y="${Y - 15}" text-anchor="middle" font-size="14" font-weight="900">(<tspan fill="${XC}">${neg(w.x)}</tspan>, <tspan fill="${YC}">${neg(w.y)}</tspan>)</text></g>`;
  };
  return anim({
    dur, w: g.W, h: g.H, label: 'Koordinaatisto',
    frame: (t) => {
      const k = kAt(t);
      let s = g.s;
      if (o.trace) {
        const done = walks.slice(0, k + (t >= starts[k]! + lens[k]! - 1.6 ? 1 : 0));
        if (done.length > 1) s += `<polyline points="${done.map((w) => `${g.px(w.x)},${g.py(w.y)}`).join(' ')}" fill="none" stroke="var(--sun)" stroke-width="3"/>`;
        const close = ease(t, dur - 1.2, dur - 0.6);
        if (close > 0) s += `<polygon points="${walks.map((w) => `${g.px(w.x)},${g.py(w.y)}`).join(' ')}" fill="color-mix(in srgb, var(--sun) 35%, transparent)" stroke="var(--sun)" stroke-width="3" opacity="${close}"/>`;
      }
      walks.slice(0, k).forEach((w) => { s += `<g opacity=".45">${pinSvg(w.x, w.y, w.icon, w.color ?? 'var(--red)')}</g>` + label(w, 0.6); });
      const w = walks[k]!, t0 = starts[k]!, [fx, fy] = w.from ?? [0, 0];
      if (t < t0) return s;
      const nx = Math.abs(w.x - fx), ny = Math.abs(w.y - fy), sx = Math.sign(w.x - fx), sy = Math.sign(w.y - fy);
      const tm = Math.max(0, t - t0 - 0.5) / HOP;
      const ux = Math.min(nx, tm), uy = Math.max(0, Math.min(ny, tm - nx));
      const cx = fx + sx * ux, cy = fy + sy * uy;
      // legs
      s += `<path d="M${g.px(fx)} ${g.py(fy)}H${g.px(cx)}" stroke="${XC}" stroke-width="5" stroke-linecap="round" opacity=".8"/>`;
      if (uy > 0) s += `<path d="M${g.px(fx + sx * nx)} ${g.py(fy)}V${g.py(cy)}" stroke="${YC}" stroke-width="5" stroke-linecap="round" opacity=".8"/>`;
      // From a labelled point the counts go below / left so they do not hide the labels.
      for (let i = 1; i <= Math.floor(ux + 1e-6); i++) s += `<text x="${g.px(fx + sx * (i - 0.5))}" y="${g.py(fy) + (w.from ? 15 : -6)}" text-anchor="middle" font-size="11" font-weight="900" fill="${XC}">${i}</text>`;
      for (let i = 1; i <= Math.floor(uy + 1e-6); i++) s += `<text x="${g.px(fx + sx * nx) + (w.from ? -9 : 9)}" y="${g.py(fy + sy * (i - 0.5)) + 4}" text-anchor="${w.from ? 'end' : 'start'}" font-size="11" font-weight="900" fill="${YC}">${i}</text>`;
      s += `<circle cx="${g.px(cx)}" cy="${g.py(cy)}" r="7" fill="var(--sun)" stroke="currentColor" stroke-width="1.5"/>`;
      const tEnd = t0 + 0.5 + HOP * (nx + ny), p = ease(t, tEnd, tEnd + 0.35);
      if (p > 0) s += `<g opacity="${p}">${pinSvg(w.x, w.y, w.icon, w.color ?? 'var(--red)')}</g>` + label(w, ease(t, tEnd + 0.3, tEnd + 0.7));
      return s;
    },
    caption: (t) => {
      if (t < starts[0]!) return 'Lähde liikkeelle nollasta.';
      const k = kAt(t), w = walks[k]!, t0 = starts[k]!, [fx, fy] = w.from ?? [0, 0];
      const nx = Math.abs(w.x - fx), ny = Math.abs(w.y - fy), tm = (t - t0 - 0.5) / HOP;
      if (tm < 0) return w.from ? `Lähtöpaikka ${P(fx, fy)}.` : 'Lähde nollasta.';
      const upTo = (m: number) => (m < 1 ? '' : ': ' + Array.from({ length: m }, (_, i) => i + 1).join(', '));
      if (tm < nx) return `Ensin ${w.x < fx ? 'vasemmalle' : 'oikealle'}${upTo(Math.floor(tm))}…`;
      if (tm < nx + ny) return `Sitten ${w.y < fy ? 'alas' : 'ylös'}${upTo(Math.floor(tm - nx))}…`;
      return w.say ?? `${Math.abs(w.x)} ${w.x < 0 ? 'vasemmalle' : 'oikealle'} ja ${Math.abs(w.y)} ${w.y < 0 ? 'alas' : 'ylös'}: ${P(w.x, w.y)}.`;
    },
  });
}

/** Three corners of a rectangle are known; a dashed guide drops from the corner with the same x
 *  and another runs from the corner with the same y. They meet at the missing corner. */
function cornerScene(c: [number, number][], miss: number, n = 6): AnimPaint {
  const g = gridParts({ xMax: n, yMax: n, pins: c.filter((_, i) => i !== miss).map(([x, y]) => ({ x, y, label: P(x, y) })) });
  const [mx, my] = c[miss]!;
  const vx = c.find(([x, y], i) => i !== miss && x === mx)!, hy = c.find(([x, y], i) => i !== miss && y === my)!;
  const XC = 'var(--blue)', YC = '#d9822b';
  return anim({
    dur: 7.5, w: g.W, h: g.H, label: 'Puuttuva kulma',
    frame: (t) => {
      let s = g.s;
      const a = ease(t, 1.0, 2.6), b = ease(t, 3.0, 4.6);
      if (t > 0.6) s += `<circle cx="${g.px(vx[0])}" cy="${g.py(vx[1])}" r="9" fill="none" stroke="${XC}" stroke-width="3" opacity="${ease(t, 0.6, 1)}"/>`;
      if (a > 0) s += `<path d="M${g.px(vx[0])} ${g.py(vx[1])}V${g.py(vx[1] + (my - vx[1]) * a)}" stroke="${XC}" stroke-width="3.5" stroke-dasharray="6 4"/>`;
      if (t > 2.7) s += `<circle cx="${g.px(hy[0])}" cy="${g.py(hy[1])}" r="9" fill="none" stroke="${YC}" stroke-width="3" opacity="${ease(t, 2.7, 3)}"/>`;
      if (b > 0) s += `<path d="M${g.px(hy[0])} ${g.py(hy[1])}H${g.px(hy[0] + (mx - hy[0]) * b)}" stroke="${YC}" stroke-width="3.5" stroke-dasharray="6 4"/>`;
      const p = ease(t, 4.8, 5.2);
      if (p > 0) {
        const X = g.px(mx), Y = g.py(my), right = X > g.W - 90;
        s += `<g opacity="${p}"><path d="M${X - 7} ${Y - 7}L${X + 7} ${Y + 7}M${X + 7} ${Y - 7}L${X - 7} ${Y + 7}" stroke="var(--red)" stroke-width="4" stroke-linecap="round"/><rect x="${right ? X - 72 : X + 8}" y="${Y - 30}" width="64" height="20" rx="6" fill="var(--card)" stroke="var(--line)"/><text x="${right ? X - 40 : X + 40}" y="${Y - 15}" text-anchor="middle" font-size="14" font-weight="900">(<tspan fill="${XC}">${mx}</tspan>, <tspan fill="${YC}">${my}</tspan>)</text></g>`;
      }
      const f = ease(t, 5.6, 6.4);
      if (f > 0) s += `<polygon points="${c.map(([x, y]) => `${g.px(x)},${g.py(y)}`).join(' ')}" fill="color-mix(in srgb, var(--sun) 30%, transparent)" stroke="var(--sun)" stroke-width="2.5" opacity="${f}"/>`;
      return s;
    },
    caption: (t) => t < 0.6 ? 'Kolme kulmaa on merkitty. Missä on neljäs?'
      : t < 2.7 ? `Kulmassa ${P(vx[0], vx[1])} on sama x kuin puuttuvassa: kuljetaan suoraan ${my > vx[1] ? 'ylös' : 'alas'}.`
      : t < 4.8 ? `Kulmassa ${P(hy[0], hy[1])} on sama y: kuljetaan suoraan ${mx > hy[0] ? 'oikealle' : 'vasemmalle'}.`
      : `Viivat kohtaavat: puuttuva kulma on ${P(mx, my)}.`,
  });
}
/** Two markers step towards each other from A and B, one square at a time, and meet in the middle. */
function midScene(A: [number, number], B: [number, number], n = 6): AnimPaint {
  const g = gridParts({ xMax: n, yMax: n, pins: [{ x: A[0], y: A[1], icon: 'palm' }, { x: B[0], y: B[1], icon: 'palm' }] });
  const steps = (Math.abs(B[0] - A[0]) + Math.abs(B[1] - A[1])) / 2, STEP = 0.9, t0 = 0.8;
  const dx = Math.sign(B[0] - A[0]), dy = Math.sign(B[1] - A[1]);
  const M: [number, number] = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], tEnd = t0 + steps * STEP;
  return anim({
    dur: tEnd + 2.4, w: g.W, h: g.H, label: 'Puoliväli',
    frame: (t) => {
      let s = g.s;
      const u = Math.max(0, Math.min(steps, (t - t0) / STEP));
      const a = [A[0] + dx * u, A[1] + dy * u], b = [B[0] - dx * u, B[1] - dy * u];
      for (let i = 1; i <= Math.floor(u + 1e-6); i++) {
        s += `<text x="${g.px(A[0] + dx * (i - 0.5)) + (dy ? 10 : 0)}" y="${g.py(A[1] + dy * (i - 0.5)) - (dx ? 7 : -4)}" text-anchor="middle" font-size="11" font-weight="900" fill="var(--blue)">${i}</text>`;
        s += `<text x="${g.px(B[0] - dx * (i - 0.5)) + (dy ? 10 : 0)}" y="${g.py(B[1] - dy * (i - 0.5)) - (dx ? 7 : -4)}" text-anchor="middle" font-size="11" font-weight="900" fill="#d9822b">${i}</text>`;
      }
      s += `<path d="M${g.px(A[0])} ${g.py(A[1])}L${g.px(a[0]!)} ${g.py(a[1]!)}" stroke="var(--blue)" stroke-width="4" opacity=".7"/><path d="M${g.px(B[0])} ${g.py(B[1])}L${g.px(b[0]!)} ${g.py(b[1]!)}" stroke="#d9822b" stroke-width="4" opacity=".7"/>`;
      s += `<circle cx="${g.px(a[0]!)}" cy="${g.py(a[1]!)}" r="6" fill="var(--blue)"/><circle cx="${g.px(b[0]!)}" cy="${g.py(b[1]!)}" r="6" fill="#d9822b"/>`;
      const p = ease(t, tEnd + 0.2, tEnd + 0.6);
      if (p > 0) { const X = g.px(M[0]), Y = g.py(M[1]); s += `<g opacity="${p}"><path d="M${X - 8} ${Y - 8}L${X + 8} ${Y + 8}M${X + 8} ${Y - 8}L${X - 8} ${Y + 8}" stroke="var(--red)" stroke-width="4" stroke-linecap="round"/>${T2(X, Y - 14, P(M[0], M[1]))}</g>`; }
      return s;
    },
    caption: (t) => t < t0 ? 'Palmuista lähdetään yhtä aikaa toisiaan kohti.'
      : t < tEnd ? `Askel kerrallaan kummaltakin puolelta${Math.floor((t - t0) / STEP) ? `: ${Array.from({ length: Math.floor((t - t0) / STEP) }, (_, i) => i + 1).join(', ')}` : ''}…`
      : `Kumpikin otti ${steps} askelta. Ne kohtaavat puolivälissä ${P(M[0], M[1])}.`,
  });
}
const T2 = (x: number, y: number, s: string) => `<rect x="${x - 30}" y="${y - 15}" width="60" height="19" rx="6" fill="var(--card)" stroke="var(--line)"/><text x="${x}" y="${y}" text-anchor="middle" font-size="13" font-weight="900">${s}</text>`;

// ---------------------------------------------------------------- shelf scenes for location words
const ITEMS = ['kivi', 'kala', 'kukka', 'simpukka', 'kapy', 'tahti', 'marja', 'lehti'];
const SC = 64;
const shelfInner = (rows: string[][]) => {
  const w = Math.max(...rows.map((r) => r.length)) * SC + 12;
  return { w, h: rows.length * SC + 10, inner: rows.map((row, j) =>
    `<line x1="4" y1="${j * SC + SC + 2}" x2="${w - 4}" y2="${j * SC + SC + 2}" stroke="#8a5a33" stroke-width="4"/>` +
    row.map((k, i) => (k ? THINGS[k]!.draw(6 + i * SC + SC / 2, j * SC + SC / 2 + 2, 44) : '')).join('')).join('') };
};
const shelf = (rows: string[][]) => { const { w, h, inner } = shelfInner(rows); return svg(w, h, inner); };
type Cell = [number, number];
const cellXY = ([j, i]: Cell) => [6 + i * SC + SC / 2, j * SC + SC / 2 + 2] as const;
/** Animated shelf: in each step the reference things get a blue ring, a sun marker travels along
 *  `path` cell by cell (leaving a trail), and the location word pops up over the target. */
function shelfScene(rows: string[][], steps: { path: Cell[]; refs?: Cell[]; word: string; say: string }[]): AnimPaint {
  const { w, h, inner } = shelfInner(rows), TOP = 22, HOP = 0.6;
  const lens = steps.map((st) => 0.7 + HOP * (st.path.length - 1) + 1.8);
  const starts = lens.map((_, k) => 0.4 + lens.slice(0, k).reduce((a, b) => a + b, 0));
  const dur = starts[starts.length - 1]! + lens[lens.length - 1]! + 0.4;
  const stepAt = (t: number) => Math.max(0, starts.filter((s0) => t >= s0).length - 1);
  return anim({
    dur, w, h: h + TOP, label: 'Hylly',
    frame: (t) => {
      const k = stepAt(t), st = steps[k]!, t0 = starts[k]!, refs = st.refs ?? [st.path[0]!];
      let s = `<g transform="translate(0 ${TOP})">${inner}`;
      if (t >= t0) {
        refs.forEach((c) => { const [x, y] = cellXY(c); s += `<circle cx="${x}" cy="${y}" r="27" fill="none" stroke="var(--pond)" stroke-width="3" stroke-dasharray="5 4" opacity="${ease(t, t0, t0 + 0.3)}"/>`; });
        const tm = t - t0 - 0.5, n = st.path.length;
        const pos = Math.max(0, Math.min(n - 1, tm / HOP));
        const a = Math.floor(pos), f = pos - a, b = Math.min(n - 1, a + 1);
        const [ax, ay] = cellXY(st.path[a]!), [bx, by] = cellXY(st.path[b]!);
        const mx = ax + (bx - ax) * f, my = ay + (by - ay) * f;
        const [sx, sy] = cellXY(st.path[0]!);
        let d = `M${sx} ${sy}`; for (let i = 1; i <= a; i++) { const [x, y] = cellXY(st.path[i]!); d += ` L${x} ${y}`; }
        if (n > 1 && tm > 0) s += `<path d="${d} L${mx} ${my}" fill="none" stroke="var(--sun)" stroke-width="5" stroke-linecap="round" opacity=".7"/>`;
        if (tm > -0.2) s += `<circle cx="${mx}" cy="${my}" r="27" fill="var(--sun)" fill-opacity=".18" stroke="var(--sun)" stroke-width="4" opacity="${ease(t, t0 + 0.3, t0 + 0.5)}"/>`;
        const tw = t0 + 0.7 + HOP * (n - 1), g = ease(t, tw, tw + 0.3);
        if (g > 0) {
          const [x, y] = cellXY(st.path[n - 1]!), pw = st.word.length * 7 + 16, px = Math.max(2, Math.min(w - pw - 2, x - pw / 2));
          s += `<g opacity="${g}"><rect x="${px}" y="${y - 50}" width="${pw}" height="18" rx="9" fill="var(--sun)" stroke="var(--line)"/><text x="${px + pw / 2}" y="${y - 37}" text-anchor="middle" font-size="12" font-weight="900" fill="var(--ink)">${st.word}</text></g>`;
        }
      }
      return s + '</g>';
    },
    caption: (t) => (t < starts[0]! ? 'Katso hyllyä.' : steps[stepAt(t)]!.say),
  });
}
const thingOpt = (k: string): Option => ({ art: svg(54, 54, THINGS[k]!.draw(27, 27, 46)), text: THINGS[k]!.one });
const GEN: Record<string, string> = { kivi: 'kiven', kala: 'kalan', kukka: 'kukan', simpukka: 'simpukan', kapy: 'kävyn', tahti: 'meritähden', marja: 'marjan', lehti: 'lehden' };
const ONE = (k: string) => THINGS[k]!.one;
const CAP = (k: string) => ONE(k)[0]!.toUpperCase() + ONE(k).slice(1);
const thingTok = (k: string) => ({ id: k, art: svg(48, 48, THINGS[k]!.draw(24, 24, 40)), text: ONE(k), speak: ONE(k) });

export const SAARI1_NODES: NodeSpec[] = [
  // ============================================================ aarre
  {
    id: 'M-GEO-02', stop: 'Saaren hylly', icon: '🧭',
    intro: 'Aarteenetsijän pitää osata sanat vasen, oikea, ylä, ala ja välissä. Harjoitellaan saaren hyllyllä.',
    reward: 'Osaat kertoa tarkasti, missä jokin on!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Kala on kiven oikealla puolella. Kukka on kiven vasemmalla puolella. Kivi on kukan ja kalan välissä.', scene: shelfScene([['kukka', 'kivi', 'kala']], [
        { path: [[0, 1], [0, 2]], word: 'oikealla', say: 'Lähde kivestä oikealle: siellä on kala. Kala on kiven oikealla puolella.' },
        { path: [[0, 1], [0, 0]], word: 'vasemmalla', say: 'Lähde kivestä vasemmalle: siellä on kukka. Kukka on kiven vasemmalla puolella.' },
        { path: [[0, 1]], refs: [[0, 0], [0, 2]], word: 'välissä', say: 'Kivi on kukan ja kalan välissä: se on kummankin vieressä.' },
      ]) },
      { say: 'Simpukka on ylähyllyllä, kiven yläpuolella. Vasen ja oikea katsotaan aina omasta suunnastasi.', scene: shelfScene([['', 'simpukka', ''], ['kukka', 'kivi', 'kala']], [
        { path: [[1, 1], [0, 1]], word: 'yläpuolella', say: 'Kivestä suoraan ylös: simpukka on kiven yläpuolella.' },
        { path: [[0, 1], [1, 1]], word: 'alapuolella', say: 'Simpukasta suoraan alas: kivi on simpukan alapuolella.' },
      ]) },
      { say: 'Askelilla pääsee mihin tahansa hyllyn kohtaan. Ensin oikealle, sitten ylös.', scene: shelfScene([['kala', 'tahti', 'marja'], ['kapy', 'lehti', 'kukka'], ['kivi', 'simpukka', 'kala']], [
        { path: [[2, 0], [2, 1], [1, 1], [0, 1]], word: 'perillä', say: 'Vasemmasta alakulmasta 1 askel oikealle ja 2 askelta ylös: perillä on meritähti.' },
      ]) },
    ],
    item: cases({
      leftRight: (r) => {
        const row = r.shuffle(ITEMS).slice(0, 4);
        const i = r.int(1, 2), left = r.chance(0.5);
        const ans = row[left ? i - 1 : i + 1]!;
        return {
          say: `Mikä on ${GEN[row[i]!]} ${left ? 'vasemmalla' : 'oikealla'} puolella, aivan vieressä?`,
          scene: paint(shelf([row])),
          task: choose(r, thingOpt(ans), [thingOpt(row[left ? i + 1 : i - 1]!), thingOpt(row[i]!)], [`Tämä on ${GEN[row[i]!]} ${left ? 'oikealla' : 'vasemmalla'} puolella: väärä suunta.`, 'Tämä on itse se, josta kysyttiin.']),
          hint: `Etsi ensin ${ONE(row[i]!)}. Katso sitten ${left ? 'vasemmalle' : 'oikealle'}.`,
          explain: `${THINGS[ans]!.one[0]!.toUpperCase() + THINGS[ans]!.one.slice(1)} on ${GEN[row[i]!]} ${left ? 'vasemmalla' : 'oikealla'} puolella.`,
        };
      },
      aboveBelow: (r) => {
        const pool = r.shuffle(ITEMS);
        const top = pool.slice(0, 3), bot = pool.slice(3, 6);
        const i = r.int(0, 2), up = r.chance(0.5);
        const ref = up ? bot[i]! : top[i]!, ans = up ? top[i]! : bot[i]!;
        return {
          say: `Mikä on ${GEN[ref]} ${up ? 'yläpuolella' : 'alapuolella'}?`,
          scene: paint(shelf([top, bot])),
          task: choose(r, thingOpt(ans), [thingOpt((up ? top : bot)[(i + 1) % 3]!), thingOpt((up ? bot : top)[(i + 1) % 3]!)], [`Tämä on ${up ? 'ylä' : 'ala'}hyllyllä, mutta ei suoraan ${GEN[ref]} kohdalla.`, `Tämä on samalla hyllyllä kuin ${ONE(ref)}.`]),
          hint: `Etsi ${ONE(ref)} ja katso suoraan ${up ? 'ylös' : 'alas'}.`,
          explain: `Suoraan ${up ? 'ylhäällä' : 'alhaalla'} samassa kohdassa on ${THINGS[ans]!.one}.`,
        };
      },
      between: (r) => {
        const row = r.shuffle(ITEMS).slice(0, 5);
        const i = r.int(1, 3);
        return {
          say: `Mikä on ${GEN[row[i - 1]!]} ja ${GEN[row[i + 1]!]} välissä?`,
          scene: paint(shelf([row])),
          task: choose(r, thingOpt(row[i]!), [thingOpt(row[i - 1]!), thingOpt(row[(i + 2) % 5]!)], ['Tämä on itse toinen niistä, joiden välistä etsitään.', `Tämä ei ole ${GEN[row[i - 1]!]} eikä ${GEN[row[i + 1]!]} vieressä.`]),
          hint: 'Etsi molemmat. Mikä on niiden keskellä?',
          explain: `Välissä on se, joka on kummankin vieressä: ${THINGS[row[i]!]!.one}.`,
        };
      },
      build: (r) => {
        const [a, b, c, d] = r.shuffle(ITEMS) as [string, string, string, string];
        // a middle, b right, c left, d is extra
        const v = r.int(0, 2);
        const clues = [
          [`Laita ${ONE(a)} keskelle.`, `${CAP(b)} on ${GEN[a]} oikealla puolella.`, `${CAP(c)} on ${GEN[a]} vasemmalla puolella.`],
          [`${CAP(c)} on vasemmassa reunassa.`, `${CAP(b)} on oikeassa reunassa.`, `${CAP(a)} on ${GEN[c]} ja ${GEN[b]} välissä.`],
          [`${CAP(b)} on oikeassa reunassa.`, `${CAP(a)} on ${GEN[b]} vasemmalla puolella.`, `${CAP(c)} on ${GEN[a]} vasemmalla puolella.`],
        ][v]!;
        const why = [
          { L: `${CAP(c)} on ${GEN[a]} vasemmalla puolella.`, M: `${CAP(a)} kuuluu keskelle.`, R: `${CAP(b)} on ${GEN[a]} oikealla puolella.` },
          { L: `${CAP(c)} on vasemmassa reunassa.`, M: `Välissä on ${ONE(a)}.`, R: `${CAP(b)} on oikeassa reunassa.` },
          { L: `${CAP(c)} on ${GEN[a]} vasemmalla puolella.`, M: `${CAP(a)} on ${GEN[b]} vasemmalla puolella.`, R: `${CAP(b)} on oikeassa reunassa.` },
        ][v]!;
        return {
          say: `Järjestä hylly. ${clues.join(' ')} Yksi tavara jää yli.`,
          task: {
            kind: 'place' as const,
            slots: [{ id: 'L', text: '⬅ vasen' }, { id: 'M', text: 'keski' }, { id: 'R', text: 'oikea ➡' }],
            tokens: r.shuffle([a, b, c, d]).map(thingTok),
            answer: { L: c, M: a, R: b },
            why,
          },
          hint: v === 1 ? 'Laita reunat ensin, sitten välissä oleva.' : v === 2 ? 'Aloita oikeasta reunasta ja etene vasemmalle.' : 'Aloita keskeltä.',
          explain: `Vasemmalta oikealle: ${ONE(c)}, ${ONE(a)}, ${ONE(b)}. ${CAP(d)} ei kuulu hyllyyn.`,
        };
      },
    }, (r) => {
      const pool = r.shuffle(ITEMS);
      const grid = [pool.slice(0, 3), pool.slice(3, 6), [pool[6]!, pool[7]!, pool[0]!]];
      // start bottom-left, move right a, up b
      const a = r.int(1, 2), b = r.int(1, 2);
      const ans = grid[2 - b]![a]!;
      const wrong = [[grid[2 - a]![b]!, 'Ensin oikealle, sitten ylös: askelmäärät menivät ristiin.'], [grid[2]![a]!, 'Muista myös ylös.']].filter(([k], i, all) => k !== ans && all.findIndex(([m]) => m === k) === i);
      return {
        say: `Lähde hyllyn vasemmasta alakulmasta. Siirry ${a} askel${a > 1 ? 'ta' : ''} oikealle ja ${b} askel${b > 1 ? 'ta' : ''} ylös. Mihin päädyt?`,
        scene: paint(shelf(grid)),
        task: choose(r, thingOpt(ans), wrong.map(([k]) => thingOpt(k!)), wrong.map(([, w]) => w)),
        hint: 'Laita sormi vasempaan alakulmaan ja liikuta sitä askel kerrallaan.',
        explain: `Oikealle ${a}, sitten ylös ${b}: siellä on ${THINGS[ans]!.one}. Tällä tavalla luetaan myös aarrekarttaa.`,
      };
    }),
  },
  {
    id: 'M-COORD-READ-Q1', stop: 'Aarrekartta', icon: '🗺️',
    intro: 'Vanhassa kartassa on ruudukko. Aarteen paikka kerrotaan kahdella luvulla.',
    reward: 'Osaat lukea aarrekarttaa!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Paikka luetaan aina samassa järjestyksessä: ensin x eli montako ruutua oikealle, sitten y eli montako ylös.', scene: coordWalk({ xMax: 6, yMax: 5 }, [{ x: 4, y: 2, say: 'Neljä oikealle, kaksi ylös. Aarre on kohdassa (4, 2).' }]) },
      { say: 'Aarre on kohdassa neljä oikealle ja kaksi ylös. Se kirjoitetaan (4, 2). Kohta (2, 4) olisi aivan eri paikka.', scene: coordWalk({ xMax: 6, yMax: 5 }, [
        { x: 4, y: 2, say: 'Aarre: (4, 2). Ensimmäinen luku kertoo oikealle, toinen ylös.' },
        { x: 2, y: 4, icon: 'dot', color: 'var(--blue)', say: 'Väärin päin luettu (2, 4) vie aivan eri paikkaan.' },
      ]) },
    ],
    item: cases({
      read: (r) => {
        const x = r.int(1, 6), y = r.int(1, 5);
        const o = [[y, x], [x, y === 5 ? y - 1 : y + 1], [x === 6 ? x - 1 : x + 1, y]].filter(([a, b]) => !(a === x && b === y) && a! <= 6 && b! <= 5).slice(0, 2);
        return {
          say: 'Missä aarre on?',
          scene: paint(gridArt({ xMax: 6, yMax: 5, pins: [{ x, y, icon: 'x' }] })),
          task: choose(r, pt(x, y), o.map(([a, b]) => pt(a!, b!)), o.map(([a, b]) => (a === y && b === x ? 'Luvut ovat väärin päin. Ensin x (oikealle), sitten y (ylös).' : a !== x ? `Tämä on ruudun liian ${a! > x ? 'oikealla' : 'vasemmalla'}: laske oikealle uudelleen.` : `Tämä on ruudun liian ${b! > y ? 'ylhäällä' : 'alhaalla'}: laske ylös uudelleen.`))),
          hint: 'Lähde nollasta. Laske ensin oikealle, sitten ylös.',
          explain: `${x} oikealle ja ${y} ylös: ${P(x, y)}.`,
        };
      },
      whichPin: (r) => {
        let x = r.int(1, 5), y = r.int(1, 5); if (x === y) y = y === 5 ? 1 : y + 1;
        const pins: Pin[] = r.shuffle([{ x, y }, { x: y, y: x }, { x: x === 5 ? 1 : x + 1, y: y === 1 ? 5 : y - 1 }]).map((p, i) => ({ ...p, label: 'ABC'[i], icon: 'flag' as const }));
        const k = pins.findIndex((p) => p.x === x && p.y === y);
        const sw = pins.findIndex((p) => p.x === y && p.y === x);
        return {
          say: `Mikä lippu on kohdassa ${P(x, y)}?`,
          scene: paint(gridArt({ xMax: 6, yMax: 5, pins })),
          task: fixed(['A', 'B', 'C'].map(t), k, [0, 1, 2].map((i) => (i === k ? undefined : i === sw ? 'Tämä on kohta, jossa luvut ovat väärin päin.' : `Tämä lippu on kohdassa ${P(pins[i]!.x, pins[i]!.y)}.`)), 3),
          hint: `Kulje ensin ${x} oikealle, sitten ${y} ylös.`,
          explain: `Kohta ${P(x, y)}: ${x} oikealle, ${y} ylös. Siellä on lippu ${'ABC'[k]}.`,
        };
      },
      axis: (r) => {
        const onX = r.chance(0.5), v = r.int(1, 5);
        const [x, y] = onX ? [v, 0] : [0, v];
        return {
          say: 'Missä palmu on? Se on akselin päällä.',
          scene: paint(gridArt({ xMax: 6, yMax: 5, pins: [{ x, y, icon: 'palm' }] })),
          task: choose(r, pt(x, y), [pt(y, x), pt(v, v)], ['Väärin päin: ensin x, sitten y.', `${onX ? 'Toinen' : 'Ensimmäinen'} luku on nolla, koska palmu on akselilla.`]),
          hint: onX ? 'Palmu on vaaka-akselilla. Montako ylös?' : 'Palmu on pystyakselilla. Montako oikealle?',
          explain: onX ? `Palmu on ${v} oikealla, mutta ei yhtään ylhäällä: ${P(x, y)}.` : `Palmu ei ole yhtään oikealla, mutta ${v} ylhäällä: ${P(x, y)}.`,
        };
      },
      label: (r) => {
        const pts: [number, number][] = [];
        while (pts.length < 3) { const x = r.int(1, 6), y = r.int(1, 5); if (x !== y && !pts.some(([a, b]) => (a === x && b === y) || (a === y && b === x))) pts.push([x, y]); }
        const icons = ['flag', 'x', 'palm'] as const, names = ['Lippu', 'Rasti', 'Palmu'];
        const pins: Pin[] = pts.map(([x, y], i) => ({ x, y, icon: icons[i], label: 'ABC'[i] }));
        const [sx, sy] = pts[r.int(0, 2)]!;
        const cards = r.shuffle([...pts.map(([x, y]) => ({ id: `${x}-${y}`, text: P(x, y) })), { id: 'swap', text: P(sy, sx) }]);
        return {
          say: 'Kirjoita kartan merkit muistiin. Vie jokaiselle merkille oikea paikka. Yksi kortti jää yli.',
          scene: paint(gridArt({ xMax: 6, yMax: 5, pins })),
          task: {
            kind: 'place' as const,
            slots: pts.map((_, i) => ({ id: 'ABC'[i]!, text: `${'ABC'[i]} ${names[i]}` })),
            tokens: cards,
            answer: Object.fromEntries(pts.map(([x, y], i) => ['ABC'[i]!, `${x}-${y}`])),
            why: Object.fromEntries(pts.map(([x, y], i) => ['ABC'[i]!, `${names[i]} ${'ABC'[i]}: ${x} oikealle ja ${y} ylös, eli ${P(x, y)}.`])),
          },
          hint: 'Yksi merkki kerrallaan: ensin oikealle, sitten ylös. Varo väärin päin olevaa korttia.',
          explain: pts.map(([x, y], i) => `${'ABC'[i]} ${P(x, y)}`).join(', ') + `. Kortti ${P(sy, sx)} on väärin päin.`,
        };
      },
    }, (r) => {
      const x = r.int(0, 3), y = r.int(1, 4), d = r.int(2, 3), right = r.chance(0.5);
      const [nx, ny] = right ? [x + d, y] : [x, y + d];
      return {
        say: `Laiva on kohdassa ${P(x, y)}. Se purjehtii ${d} ruutua ${right ? 'oikealle' : 'ylöspäin'}. Missä laiva on nyt?`,
        scene: paint(gridArt({ xMax: 6, yMax: 7, pins: [{ x, y, icon: 'ship' }] })),
        task: choose(r, pt(nx, ny), [right ? pt(x, y + d) : pt(x + d, y), pt(x + d, y + d)], [right ? 'Oikealle muuttuu x, ei y.' : 'Ylöspäin muuttuu y, ei x.', 'Laiva liikkui vain yhteen suuntaan.']),
        hint: right ? 'Oikealle mennessä muuttuu vain ensimmäinen luku.' : 'Ylös mennessä muuttuu vain toinen luku.',
        explain: right ? `Oikealle muuttuu vain x: ${x} + ${d} = ${nx}. Uusi paikka ${P(nx, ny)}.` : `Ylös muuttuu vain y: ${y} + ${d} = ${ny}. Uusi paikka ${P(nx, ny)}.`,
      };
    }),
  },
  {
    id: 'M-COORD-PLOT-Q1', stop: 'Kätke aarre', icon: '📍',
    intro: 'Nyt sinä kätket aarteita. Merkitse kartalle tarkka paikka.',
    reward: 'Aarteet on kätketty juuri oikeisiin paikkoihin!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Kohta (3, 5): lähde nollasta, kulje kolme oikealle ja sitten viisi ylös. Napauta siihen risteykseen.', scene: coordWalk({ xMax: 6, yMax: 6 }, [{ x: 3, y: 5, say: 'Kolme oikealle, viisi ylös: napauta tähän risteykseen (3, 5).' }]) },
      { say: 'Jos toinen luku on nolla, et nouse ollenkaan: piste jää akselille. Kohta (4, 0) on vaaka-akselilla.', scene: coordWalk({ xMax: 6, yMax: 6 }, [{ x: 4, y: 0, icon: 'dot', say: 'Neljä oikealle, nolla ylös: (4, 0) on vaaka-akselilla.' }, { x: 0, y: 3, icon: 'dot', color: 'var(--blue)', say: 'Nolla oikealle, kolme ylös: (0, 3) on pystyakselilla.' }]) },
      { say: 'Paikan voi kertoa myös toisesta paikasta käsin. Laivasta (1, 2) kolme oikealle ja kaksi ylös päästään kohtaan (4, 4).', scene: coordWalk({ xMax: 6, yMax: 6, pins: [{ x: 1, y: 2, icon: 'ship' }] }, [{ x: 4, y: 4, from: [1, 2], say: 'Laivasta 3 oikealle: x on 1 + 3 = 4. Sitten 2 ylös: y on 2 + 2 = 4. Aarre on kohdassa (4, 4).' }]) },
    ],
    item: cases({
      plot: (r) => {
        let x = r.int(1, 6), y = r.int(1, 6); if (x === y) x = x === 6 ? 2 : x + 1;
        return { say: `Merkitse aarre kohtaan ${P(x, y)}.`, task: plot([x], [y]), hint: `Ensin ${x} oikealle, sitten ${y} ylös.`, explain: `${P(x, y)}: ${x} oikealle ja ${y} ylös.` };
      },
      onAxis: (r) => {
        const onX = r.chance(0.5), v = r.int(1, 6);
        const [x, y] = onX ? [v, 0] : [0, v];
        return { say: `Merkitse palmu kohtaan ${P(x, y)}.`, task: plot([x], [y]), hint: onX ? 'Toinen luku on nolla: et nouse ollenkaan.' : 'Ensimmäinen luku on nolla: et kulje oikealle ollenkaan.', explain: onX ? `Nolla ylös: piste on x-akselilla kohdassa ${v}.` : `Nolla oikealle: piste on y-akselilla kohdassa ${v}.` };
      },
      story: (r) => {
        let x = r.int(1, 6), y = r.int(1, 6); if (x === y) y = y === 1 ? 3 : y - 1;
        return { say: `Kartan ohje: kulje nollasta ${x} ruutua itään (oikealle) ja ${y} ruutua pohjoiseen (ylös). Merkitse paikka.`, task: plot([x], [y]), hint: 'Itä on oikealla ja pohjoinen ylhäällä.', explain: `Itään ${x} ja pohjoiseen ${y}: kohta ${P(x, y)}.` };
      },
      fromShip: (r) => {
        const sx = r.int(0, 3), sy = r.int(0, 3), dx = r.int(1, 6 - sx), dy = r.int(1, 6 - sy);
        return {
          say: `Laiva on kohdassa ${P(sx, sy)}. Aarre on laivasta ${dx} ruutua oikealle ja ${dy} ruutua ylös. Merkitse aarre.`,
          scene: paint(gridArt({ xMax: 6, yMax: 6, pins: [{ x: sx, y: sy, icon: 'ship' }] })),
          task: plot([sx + dx], [sy + dy]),
          hint: 'Lähde nyt laivasta, ei nollasta.',
          explain: `x: ${sx} + ${dx} = ${sx + dx}, y: ${sy} + ${dy} = ${sy + dy}. Aarre on kohdassa ${P(sx + dx, sy + dy)}.`,
        };
      },
    }, (r) => {
      let a = r.int(1, 5), b = r.int(1, 5); if (a === b) b = b === 5 ? 1 : b + 1;
      return { say: `Kaksi aarretta: merkitse kohdat ${P(a, b)} ja ${P(b, a)}.`, task: plot([a, b], [b, a]), hint: 'Merkitse yksi kohta kerrallaan: ensin oikealle, sitten ylös.', explain: `${P(a, b)} ja ${P(b, a)} ovat eri paikat: järjestys ratkaisee.` };
    }),
  },
  {
    id: 'M-COORD-01', stop: 'Saaren rakentaja', icon: '🏝️',
    intro: 'Rakennetaan saari koordinaateilla: ensin kulmat, sitten aarre keskelle.',
    reward: 'Saari on rakennettu tarkasti!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Suorakulmion kulmat ovat (1, 1), (5, 1), (5, 4) ja (1, 4). Saman pystyreunan kulmilla on sama x, saman vaakareunan kulmilla sama y.', scene: coordWalk({ xMax: 6, yMax: 5, trace: true }, [
        { x: 1, y: 1, icon: 'dot', say: 'Ensimmäinen kulma (1, 1).' },
        { x: 5, y: 1, from: [1, 1], icon: 'dot', say: '4 oikealle: (5, 1). Vain x muuttui, joten reuna on vaakasuora.' },
        { x: 5, y: 4, from: [5, 1], icon: 'dot', say: '3 ylös: (5, 4). Vain y muuttui, joten reuna on pystysuora.' },
        { x: 1, y: 4, from: [5, 4], icon: 'dot', say: '4 vasemmalle: (1, 4). Saari sulkeutuu ja on valmis.' },
      ]) },
      { say: 'Jos yksi kulma puuttuu, sen x löytyy kulmasta samalla pystyreunalla ja y kulmasta samalla vaakareunalla.', scene: cornerScene([[1, 1], [5, 1], [5, 5], [1, 5]], 2) },
      { say: 'Puoliväli löytyy, kun kuljetaan molemmista päistä yhtä monta askelta toisiaan kohti.', scene: midScene([1, 3], [5, 3]) },
    ],
    item: cases({
      corner: (r) => {
        const x1 = r.int(0, 2), x2 = r.int(4, 6), y1 = r.int(0, 2), y2 = r.int(4, 6);
        const c: [number, number][] = [[x1, y1], [x2, y1], [x2, y2], [x1, y2]];
        const miss = r.int(0, 3);
        const [mx, my] = c[miss]!;
        return {
          say: `Suorakulmaisen saaren kolme kulmaa on merkitty. Merkitse neljäs kulma.`,
          scene: paint(gridArt({ xMax: 6, yMax: 6, pins: c.filter((_, i) => i !== miss).map(([x, y]) => ({ x, y, label: P(x, y) })) })),
          task: plot([mx], [my]),
          hint: 'Puuttuvalla kulmalla on sama x kuin yhdellä kulmalla ja sama y kuin toisella.',
          explain: `Samalla pystyreunalla oleva kulma antaa x:n (${mx}), samalla vaakareunalla oleva y:n (${my}). Puuttuva kulma on ${P(mx, my)}.`,
        };
      },
      readPoly: (r) => {
        const pts: [number, number][] = [[r.int(0, 2), r.int(0, 2)], [r.int(4, 6), r.int(0, 2)], [r.int(2, 4), r.int(4, 6)]];
        const i = r.int(0, 2);
        const [x, y] = pts[i]!;
        const wrong = [[y, x], [x, y + 1 > 6 ? y - 1 : y + 1]].filter(([a, b]) => !(a === x && b === y));
        return {
          say: `Mitkä ovat kärjen ${'ABC'[i]} koordinaatit?`,
          scene: paint(gridArt({ xMax: 6, yMax: 6, poly: pts, pins: pts.map(([px, py], k) => ({ x: px, y: py, label: 'ABC'[k] })) })),
          task: choose(r, pt(x, y), wrong.map(([a, b]) => pt(a!, b!)), wrong.map(([a, b]) => (a === y && b === x ? 'Väärin päin: ensin x, sitten y.' : `Tämä on ruudun liian ${b! > y ? 'ylhäällä' : 'alhaalla'}: laske ylös uudelleen.`))),
          hint: `Etsi kärki ${'ABC'[i]}. Ensin oikealle, sitten ylös.`,
          explain: `Kärki ${'ABC'[i]}: ${x} oikealle, ${y} ylös, eli ${P(x, y)}.`,
        };
      },
      move: (r) => {
        const x = r.int(1, 5), y = r.int(3, 6), d = r.int(1, 3), down = r.chance(0.5);
        const [nx, ny] = down ? [x, y - d] : [x + d > 6 ? x - d : x + d, y];
        const dir = down ? 'alaspäin' : nx > x ? 'oikealle' : 'vasemmalle';
        return {
          say: `Laiva on kohdassa ${P(x, y)}. Se liikkuu ${d} ruutua ${dir}. Merkitse uusi paikka.`,
          scene: paint(gridArt({ xMax: 6, yMax: 6, pins: [{ x, y, icon: 'ship' }] })),
          task: plot([nx], [ny]),
          hint: down ? 'Alaspäin muuttuu vain toinen luku, ja se pienenee.' : `Sivuttain muuttuu vain ensimmäinen luku. ${nx > x ? 'Oikealle se kasvaa.' : 'Vasemmalle se pienenee.'}`,
          explain: `${down ? `Alaspäin pienenee y: ${y} − ${d} = ${ny}` : nx > x ? `Oikealle kasvaa x: ${x} + ${d} = ${nx}` : `Vasemmalle pienenee x: ${x} − ${d} = ${nx}`}. Uusi paikka ${P(nx, ny)}.`,
        };
      },
      build: (r) => {
        const x1 = r.int(0, 2), y1 = r.int(0, 2), w = r.int(2, 6 - x1), h = r.int(2, 6 - y1);
        const xs = [x1, x1 + w, x1 + w, x1], ys = [y1, y1, y1 + h, y1 + h];
        return {
          say: `Rakenna saari. Sen vasen alakulma on ${P(x1, y1)}. Saari on ${w} ruutua leveä ja ${h} ruutua korkea. Merkitse kaikki neljä kulmaa.`,
          task: plot(xs, ys),
          hint: `Leveys lisätään x:ään, korkeus y:hyn. Oikea alakulma: ${P(x1, y1)} ja ${w} oikealle.`,
          explain: `Kulmat: ${xs.map((x, i) => P(x, ys[i]!)).join(', ')}. Vasemmilla kulmilla x on ${x1}, oikeilla ${x1 + w}. Alakulmilla y on ${y1}, yläkulmilla ${y1 + h}.`,
        };
      },
    }, (r) => {
      const y = r.int(1, 5), x1 = r.int(0, 2), x2 = x1 + 2 * r.int(1, 2);
      const vertical = r.chance(0.5);
      const A: [number, number] = vertical ? [y, x1] : [x1, y], B: [number, number] = vertical ? [y, x2] : [x2, y];
      const M: [number, number] = vertical ? [y, (x1 + x2) / 2] : [(x1 + x2) / 2, y];
      return {
        say: `Palmut ovat kohdissa ${P(...A)} ja ${P(...B)}. Aarre on haudattu täsmälleen niiden puoliväliin. Merkitse aarre.`,
        scene: paint(gridArt({ xMax: 6, yMax: 6, pins: [{ x: A[0], y: A[1], icon: 'palm' }, { x: B[0], y: B[1], icon: 'palm' }] })),
        task: plot([M[0]], [M[1]]),
        hint: 'Kulje kummastakin palmusta yhtä monta askelta toisiaan kohti.',
        explain: `Puoliväli on yhtä kaukana molemmista: ${P(...M)}.`,
      };
    }),
  },

  // ============================================================ talvi: negative numbers
  {
    id: 'M-NEG-01', stop: 'Pakkasaamu', icon: '🌡️',
    intro: 'Jäälahdella on pakkasta. Lämpömittarissa on lukuja myös nollan alapuolella.',
    reward: 'Osaat lukea pakkasasteita: miinus tarkoittaa nollan alapuolta!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Nolla on raja. Nollan yläpuolella on plusasteita, alapuolella pakkasasteita. Mittari näyttää miinus neljä astetta: neljä astetta pakkasta.', scene: thermoScene([
        { from: 0, to: -4, label: 'yöllä', say: 'Neljä astetta nollan alapuolelle: −4 °C eli neljä astetta pakkasta.' },
        { from: 0, to: 4, label: 'päivällä', say: 'Neljä astetta nollan yläpuolelle: 4 °C.' },
      ], 'Sama luku neljä, mutta eri puolella nollaa: −4 °C ja 4 °C.') },
      { say: 'Mitä alempana mittarissa, sitä kylmempää. Miinus kahdeksan on kylmempi kuin miinus kaksi, vaikka kahdeksan on muuten iso luku.', scene: thermoScene([
        { from: 0, to: -8, label: 'lahdella', say: 'Lahdella pinta laski kahdeksan astetta nollan alle: −8 °C.' },
        { from: 0, to: -2, label: 'pihalla', say: 'Pihalla vain kaksi astetta nollan alle: −2 °C.' },
      ], '−8 °C on alempana, joten se on kylmempi kuin −2 °C.') },
      { say: 'Kun lämpötila laskee nollan ohi, pakkasasteet alkavat. Kolmesta asteesta viisi astetta alas: kolme vie nollaan, loput kaksi nollan alle.', scene: thermoScene([
        { from: 3, to: -2, label: 'illalla', say: '3 astetta alas on nolla, ja vielä 2 astetta: −2 °C. Siis 3 − 5 = −2.' },
      ]) },
    ],
    item: cases({
      thermo: (r) => {
        const v = r.int(1, 9) * (r.chance(0.75) ? -1 : 1);
        return {
          say: 'Paljonko lämpömittari näyttää?',
          scene: paint(thermoArt(v)),
          task: choose(r, t(deg(v)), [t(deg(-v)), t(deg(v + (v < 0 ? 1 : -1)))], [v < 0 ? 'Pinta on nollan alapuolella: luku on miinusmerkkinen.' : 'Pinta on nollan yläpuolella.', 'Laske viivat nollasta uudelleen.']),
          hint: 'Katso ensin: onko pinta nollan ylä- vai alapuolella?',
          explain: `Pinta on ${Math.abs(v)} viivaa nollan ${v < 0 ? 'alapuolella' : 'yläpuolella'}: ${deg(v)}.`,
        };
      },
      colder: (r) => {
        const a = -r.int(5, 9), b = -r.int(1, 4);
        const [x, y] = r.shuffle([a, b]);
        return {
          say: `Kumpi on kylmempi: ${deg(x!)} vai ${deg(y!)}?`,
          task: choose(r, t(deg(a)), [t(deg(b))], [`${deg(b)} on lähempänä nollaa, joten se on lämpimämpi.`], 2),
          hint: 'Kumpi on mittarissa alempana, kauempana nollan alapuolella?',
          explain: `${deg(a)} on syvemmällä nollan alapuolella, joten se on kylmempi.`,
        };
      },
      meaning: (r) => {
        const [say, v, unit] = r.pick([
          ['Sukeltaja on {n} metriä merenpinnan alapuolella. Mikä luku kuvaa hänen korkeuttaan?', -1, 'm'],
          ['Lokki lentää {n} metriä merenpinnan yläpuolella. Mikä luku kuvaa sen korkeutta?', 1, 'm'],
          ['Lahdella on {n} astetta pakkasta. Mikä luku kuvaa lämpötilaa?', -1, '°C'],
        ] as [string, number, string][]);
        const n = r.int(2, 9);
        return {
          say: say.replace('{n}', String(n)),
          // Signed form for both: the question is about the sign, so +7 and −7 sit side by side.
          task: choose(r, t(`${v < 0 ? neg(-n) : `+${n}`} ${unit}`), [t(`${v < 0 ? `+${n}` : neg(-n)} ${unit}`), t(`0 ${unit}`)], [v < 0 ? 'Alapuolella ja pakkasella luku on negatiivinen.' : 'Yläpuolella luku on positiivinen.', 'Nolla on merenpinta tai nolla astetta.']),
          hint: 'Onko asia nollan ylä- vai alapuolella?',
          explain: v < 0 ? `Nollan alapuolella: ${neg(-n)} ${unit}.` : `Nollan yläpuolella: +${n} ${unit} eli ${n} ${unit}.`,
        };
      },
      order: (r) => {
        const vs = [-r.int(6, 9), -r.int(1, 5), r.int(0, 8)];
        const days = r.shuffle(['maanantai', 'tiistai', 'keskiviikko']);
        let tok = r.shuffle(vs.map((v, i) => ({ id: `v${i}`, text: deg(v), speak: deg(v) })));
        if (tok[0]!.id === 'v0' && tok[1]!.id === 'v1') tok = [tok[2]!, tok[0]!, tok[1]!];
        const shown = r.shuffle([0, 1, 2]);
        if (shown[0] === 0 && shown[1] === 1) shown.reverse();
        return {
          say: 'Järjestä lämpötilat kylmimmästä lämpimimpään.',
          scene: paint(`<div class="pics">${shown.map((i) => thermoArt(vs[i]!, -10, 10, days[i]!)).join('')}</div>`.replace(/width="100%"/g, 'width="96"')),
          task: {
            kind: 'place' as const,
            slots: [{ id: 'a', text: '🥶 kylmin' }, { id: 'b', text: 'keskellä' }, { id: 'c', text: '🌞 lämpimin' }],
            tokens: tok,
            answer: { a: 'v0', b: 'v1', c: 'v2' },
            why: { a: `Kylmin on alimpana: ${deg(vs[0]!)}.`, b: `${deg(vs[1]!)} on kylmempi kuin ${deg(vs[2]!)}, mutta lämpimämpi kuin ${deg(vs[0]!)}.`, c: `Lämpimin on ylimpänä: ${deg(vs[2]!)}.` },
          },
          hint: 'Mitä alempana pinta, sitä kylmempää. Mitä isompi pakkasluku, sitä kylmempää.',
          explain: `Kylmimmästä lämpimimpään: ${vs.map(deg).join(', ')}.`,
        };
      },
    }, (r) => {
      const a = r.int(1, 4), d = a + r.int(1, 5), e = a - d;
      return {
        say: `Aamulla lämpötila oli ${deg(a)}. Päivällä se laski ${d} astetta. Paljonko lämpötila oli silloin?`,
        scene: paint(thermoArt(a)),
        task: choose(r, t(deg(e)), [t(deg(-e)), t(deg(-(a + d)))], ['Lämpötila laski nollan alapuolelle, joten se on miinusasteita.', `Laske mittarilla: ${a} astetta alas pääsee nollaan, loput ${d - a} nollan alle.`]),
        hint: `Montako astetta pääsee nollaan? Montako jää vielä nollan alle?`,
        explain: `${a} askelta alas on nolla, ja vielä ${d - a} askelta: ${deg(e)}. Siis ${a} − ${d} = ${neg(e)}.`,
      };
    }),
  },
  {
    id: 'M-NEG-02', stop: 'Jään lukusuora', icon: '❄️',
    intro: 'Jäähän on piirretty pitkä lukusuora. Nollan vasemmalla puolella ovat negatiiviset luvut.',
    reward: 'Osaat sijoittaa negatiiviset luvut lukusuoralle!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Lukusuoralla luvut kasvavat oikealle. Nollan vasemmalla ovat negatiiviset luvut: miinus yksi, miinus kaksi ja niin edelleen. Miinus neljä ja neljä ovat yhtä kaukana nollasta, mutta eri puolilla.', scene: iceHops(-6, 6, [
        { from: 0, to: -4, say: 'Neljä hyppyä vasemmalle: −4.' },
        { from: 0, to: 4, color: 'var(--blue)', say: 'Neljä hyppyä oikealle: 4.' },
      ], 'Yhtä kaukana nollasta, eri puolilla: −4 ja 4.') },
      { say: 'Mitä vasemmalla, sitä pienempi. Miinus kuusi on pienempi kuin miinus kaksi, vaikka kuusi on muuten isompi kuin kaksi.', scene: iceHops(-7, 5, [
        { from: 0, to: -6, say: '−6 on kuusi askelta vasemmalla.' },
        { from: 0, to: -2, color: 'var(--blue)', say: '−2 on vain kaksi askelta vasemmalla.' },
        { from: 0, to: 3, color: 'var(--pond)', say: '3 on nollan oikealla puolella.' },
      ], 'Vasemmalta oikealle: −6 < −2 < 3. Vasemmalla on aina pienempi.') },
      { say: 'Sukeltaja on kohdassa miinus kaksi metriä ja sukeltaa kolme metriä syvemmälle. Syvemmälle tarkoittaa lukusuoralla vasemmalle.', scene: iceHops(-7, 3, [
        { from: -2, to: -5, say: 'Kolme askelta vasemmalle: −2 − 3 = −5.' },
      ]) },
    ],
    item: cases({
      place: (r) => {
        const v = -r.int(1, 7);
        return { say: `Napauta lukusuoralta luku ${neg(v)}.`, task: line(v), hint: 'Negatiiviset luvut ovat nollan vasemmalla puolella.', explain: `${neg(v)} on ${-v} askelta nollasta vasemmalle.` };
      },
      read: (r) => {
        const v = r.int(-7, 7) || -3;
        return {
          say: 'Mikä luku sammakon kohdalla on?',
          scene: paint(numberLineArt({ min: -8, max: 8, labelEvery: 4, marks: [{ v, icon: 'frog' }] })),
          task: choose(r, { big: neg(v) }, [{ big: neg(-v) }, { big: neg(v + (v > 0 ? -1 : 1)) }], ['Katso, kummalla puolella nollaa sammakko on.', 'Laske askeleet lähimmästä numerosta.']),
          hint: 'Onko sammakko nollan vasemmalla vai oikealla? Laske askeleet nollasta.',
          explain: `Sammakko on ${Math.abs(v)} askelta nollasta ${v < 0 ? 'vasemmalle' : 'oikealle'}: ${neg(v)}.`,
        };
      },
      order: (r) => {
        const vs = r.shuffle([-r.int(5, 8), -r.int(1, 4), r.int(0, 6)]);
        const min = Math.min(...vs);
        return {
          say: 'Mikä luvuista on pienin?',
          task: choose(r, { big: neg(min) }, vs.filter((v) => v !== min).map((v) => ({ big: neg(v) })), vs.filter((v) => v !== min).map((v) => (v < 0 ? `${neg(v)} on lähempänä nollaa, joten se on suurempi kuin ${neg(min)}.` : 'Positiivinen luku on suurempi kuin negatiivinen.'))),
          hint: 'Pienin on lukusuoralla kauimpana vasemmalla.',
          explain: `Pienin on se, joka on lukusuoralla kauimpana vasemmalla: ${neg(min)}.`,
        };
      },
      sort: (r) => {
        const vs = [-r.int(6, 8), -r.int(3, 5), -r.int(1, 2), r.int(1, 6)];
        let tok = r.shuffle(vs.map((v, i) => ({ id: `v${i}`, text: neg(v), speak: neg(v) })));
        if (tok.every((t0, i) => t0.id === `v${i}`)) tok = [...tok.slice(1), tok[0]!];
        const names = ['pienin', 'toiseksi pienin', 'toiseksi suurin', 'suurin'];
        return {
          say: 'Laita luvut järjestykseen pienimmästä suurimpaan.',
          scene: paint(numberLineArt({ min: -8, max: 8 })),
          task: {
            kind: 'place' as const,
            slots: vs.map((_, i) => ({ id: `s${i}`, text: i === 0 ? '1. pienin' : i === 3 ? '4. suurin' : `${i + 1}.` })),
            tokens: tok,
            answer: Object.fromEntries(vs.map((_, i) => [`s${i}`, `v${i}`])),
            why: Object.fromEntries(vs.map((v, i) => [`s${i}`, `${names[i]![0]!.toUpperCase() + names[i]!.slice(1)} on ${neg(v)}${i === 0 ? ': se on kauimpana vasemmalla.' : i === 3 ? ': se on kauimpana oikealla.' : '.'}`])),
          },
          hint: 'Mitä kauempana nollasta vasemmalla, sitä pienempi luku. −8 on pienempi kuin −2.',
          explain: `Vasemmalta oikealle: ${vs.map(neg).join(' < ')}.`,
        };
      },
    }, (r) => {
      const a = -r.int(1, 4), d = r.int(2, 4);
      return {
        say: `Sukeltaja on kohdassa ${neg(a)} metriä. Hän sukeltaa ${d} metriä syvemmälle. Napauta, missä hän on nyt.`,
        scene: paint(numberLineArt({ min: -8, max: 8, marks: [{ v: a, icon: 'dot', label: neg(a) }] })),
        task: { ...line(a - d), whyAt: { [a + d]: 'Syvemmälle on lukusuoralla vasemmalle, ei oikealle.', [d - a]: 'Sukeltaja on pinnan alla, joten luku on negatiivinen.', [a]: 'Tämä on lähtökohta. Sukella vielä syvemmälle.' } } as Task,
        hint: `Lähde kohdasta ${neg(a)} ja hyppää ${d} askelta vasemmalle.`,
        explain: `Syvemmälle on vasemmalle päin: ${neg(a)} − ${d} = ${neg(a - d)}.`,
      };
    }),
  },
  {
    id: 'M-COORD-02', stop: 'Koko meren kartta', icon: '🧭',
    intro: 'Meri jatkuu saaren joka puolelle. Kartta laajenee myös negatiivisiin lukuihin.',
    reward: 'Hallitset koko kartan, kaikki neljä neljännestä!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Nyt akselit jatkuvat myös vasemmalle ja alas. Kohta (−3, 2): miinus x vie vasemmalle, kolme askelta, ja sitten kaksi ylös.', scene: coordWalk({ xMin: -5, xMax: 5, yMin: -4, yMax: 4 }, [{ x: -3, y: 2 }]) },
      { say: 'Akselit jakavat kartan neljään neljännekseen. Ensimmäinen on oikealla ylhäällä, ja numerointi kiertää vastapäivään. Merkit kertovat neljänneksen.', scene: coordWalk({ xMin: -5, xMax: 5, yMin: -4, yMax: 4, quads: true }, [
        { x: 3, y: 2, icon: 'dot', say: 'I: oikealle ja ylös, (+, +).' },
        { x: -3, y: 2, icon: 'dot', color: 'var(--blue)', say: 'II: vasemmalle ja ylös, (−, +).' },
        { x: -3, y: -2, icon: 'dot', color: 'var(--pond)', say: 'III: vasemmalle ja alas, (−, −).' },
        { x: 3, y: -2, icon: 'dot', color: '#d9822b', say: 'IV: oikealle ja alas, (+, −).' },
      ]) },
      { say: 'Peilikuva y-akselin yli on yhtä kaukana akselin toisella puolella. Majakasta (2, 3) kävellään kaksi askelta akselille ja kaksi vielä yli.', scene: coordWalk({ xMin: -5, xMax: 5, yMin: -4, yMax: 4 }, [
        { x: 2, y: 3, icon: 'flag' },
        { x: -2, y: 3, from: [2, 3], icon: 'flag', color: 'var(--blue)', say: '2 akselille + 2 yli: (−2, 3). y pysyy, x vaihtaa merkkiä.' },
      ]) },
    ],
    item: cases({
      plot: (r) => {
        let x = r.int(-5, 5), y = r.int(-4, 4);
        if (x >= 0 && y >= 0) x = -Math.max(1, x);
        if (x === y || x === 0) y = y === 4 ? -2 : y + 1;
        return { say: `Merkitse kohta ${P(x, y)}.`, task: { kind: 'plot', xs: [x], ys: [y], xMin: -5, xMax: 5, yMin: -4, yMax: 4, xStep: 1, yStep: 1, xLabel: 'x', yLabel: 'y' }, hint: 'Miinus x: vasemmalle. Miinus y: alas.', explain: `${P(x, y)}: ${Math.abs(x)} ${x < 0 ? 'vasemmalle' : 'oikealle'} ja ${Math.abs(y)} ${y < 0 ? 'alas' : 'ylös'}.` };
      },
      read: (r) => {
        const x = r.pick([-4, -3, -2, -1, 2, 3, 4]), y = r.pick([-3, -2, -1, 1, 2, 3]);
        const wrong: [number, number][] = [[-x, y], [x, -y], [y, x]];
        const w = wrong.filter(([a, b]) => !(a === x && b === y)).slice(0, 2);
        return {
          say: 'Missä laiva on?',
          scene: paint(gridArt({ xMin: -5, xMax: 5, yMin: -4, yMax: 4, pins: [{ x, y, icon: 'ship' }] })),
          task: choose(r, pt(x, y), w.map(([a, b]) => pt(a, b)), w.map(([a, b]) => (a === -x && b === y ? 'Katso, onko laiva nollan vasemmalla vai oikealla puolella.' : b === -y && a === x ? 'Katso, onko laiva nollan ylä- vai alapuolella.' : 'Järjestys: ensin x (vaakasuunta), sitten y (pystysuunta).'))),
          hint: 'Ensin x: vasemmalla miinus. Sitten y: alhaalla miinus.',
          explain: `${Math.abs(x)} ${x < 0 ? 'vasemmalle' : 'oikealle'}, ${Math.abs(y)} ${y < 0 ? 'alas' : 'ylös'}: ${P(x, y)}.`,
        };
      },
      quadrant: (r) => {
        const sx = r.pick([1, -1]), sy = r.pick([1, -1]);
        const x = sx * r.int(1, 5), y = sy * r.int(1, 4);
        const q = sx > 0 ? (sy > 0 ? 0 : 3) : sy > 0 ? 1 : 2;
        return {
          say: `Missä neljänneksessä kohta ${P(x, y)} on?`,
          task: fixed(['I', 'II', 'III', 'IV'].map((s) => ({ big: s })), q, [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([a, b], i) => (i === q ? undefined : `Neljänneksessä ${['I', 'II', 'III', 'IV'][i]} x on ${a > 0 ? 'positiivinen' : 'negatiivinen'} ja y ${b > 0 ? 'positiivinen' : 'negatiivinen'}.`)), 4),
          hint: 'I oikealla ylhäällä, sitten vastapäivään II, III ja IV.',
          explain: `x on ${x < 0 ? 'negatiivinen (vasen)' : 'positiivinen (oikea)'}, y ${y < 0 ? 'negatiivinen (alas)' : 'positiivinen (ylös)'}: neljännes ${['I', 'II', 'III', 'IV'][q]}.`,
        };
      },
      sortQ: (r) => {
        const qs = r.shuffle([0, 1, 2, 3, r.int(0, 3)]);
        const sg = [[1, 1], [-1, 1], [-1, -1], [1, -1]] as const, R4 = ['I', 'II', 'III', 'IV'];
        const pts: [number, number][] = [];
        for (const q of qs) {
          let p: [number, number];
          do p = [sg[q]![0] * r.int(1, 5), sg[q]![1] * r.int(1, 4)]; while (pts.some(([a, b]) => a === p[0] && b === p[1]));
          pts.push(p);
        }
        return {
          say: 'Lajittele kohdat oikeaan neljännekseen.',
          task: {
            kind: 'sort' as const,
            items: pts.map(([a, b]) => ({ text: P(a, b) })),
            cats: R4.map((n, i) => ({ label: `${n} (${sg[i]![0] > 0 ? '+' : '−'}, ${sg[i]![1] > 0 ? '+' : '−'})` })),
            answer: qs,
            why: pts.map(([a, b], i) => `${P(a, b)}: x ${a < 0 ? 'miinus (vasen)' : 'plus (oikea)'}, y ${b < 0 ? 'miinus (alas)' : 'plus (ylös)'} → ${R4[qs[i]!]}.`),
          },
          hint: 'Katso vain merkkejä: (+, +) I, (−, +) II, (−, −) III, (+, −) IV.',
          explain: pts.map(([a, b], i) => `${P(a, b)} → ${R4[qs[i]!]}`).join(', ') + '.',
        };
      },
    }, (r) => {
      const x = r.int(1, 4), y = r.pick([-3, -2, -1, 1, 2, 3]), overY = r.chance(0.5);
      const [nx, ny] = overY ? [-x, y] : [x, -y];
      return {
        say: `Majakka on kohdassa ${P(x, y)}. Sen peilikuva on ${overY ? 'y-akselin' : 'x-akselin'} toisella puolella yhtä kaukana. Merkitse peilikuva.`,
        scene: paint(gridArt({ xMin: -5, xMax: 5, yMin: -4, yMax: 4, pins: [{ x, y, icon: 'flag' }] })),
        task: { kind: 'plot', xs: [nx], ys: [ny], xMin: -5, xMax: 5, yMin: -4, yMax: 4, xStep: 1, yStep: 1, xLabel: 'x', yLabel: 'y' },
        hint: overY ? 'y-akselin yli: kävele akselille ja saman verran yli. y pysyy samana.' : 'x-akselin yli: kävele akselille ja saman verran yli. x pysyy samana.',
        explain: overY ? `Peilaus y-akselin yli vaihtaa x:n merkin: ${P(nx, ny)}.` : `Peilaus x-akselin yli vaihtaa y:n merkin: ${P(nx, ny)}.`,
      };
    }),
  },

  // ============================================================ tori: place value and units
  {
    id: 'M-PLACE-04', stop: 'Torin kassa', icon: '💰',
    intro: 'Saaren torilla lasketaan isoja summia: satasia ja tuhansia.',
    reward: 'Kassa täsmää: osaat isojen lukujen paikka-arvon!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Kymmenen kymppiä on sata. Kymmenen satasta on tuhat. Jokainen paikka on kymmenen kertaa edellinen.', scene: exchangeScene([10, 100]) },
      { say: 'Luvussa 3405 on 3 tuhatta, 4 sataa, 0 kymppiä ja 5 ykköstä. Nolla pitää paikkaa, vaikka kymppejä ei ole.', scene: tillScene(3405) },
      { say: 'Kassassa on 2 tuhatta, ei satasia, 6 kymppiä ja 1 euro. Satasten lokero on tyhjä, joten sen paikalle tulee nolla.', scene: tillScene(2061) },
    ],
    item: cases({
      value: (r) => {
        // Four different digits: the question names one place only (never 4 in 4405).
        const [a1, a2, a3, a4] = r.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]) as [number, number, number, number];
        const n = a1 * 1000 + a2 * 100 + a3 * 10 + a4;
        const pos = r.int(0, 2), place = [1000, 100, 10][pos]!;
        const d = Math.floor(n / place) % 10;
        return {
          say: `Mikä on numeron ${d} arvo luvussa ${n}?`,
          task: (() => {
            const ws = [...new Set([d, d * place * 10, d * place / 10])].filter((x) => x !== d * place && x >= 1 && Number.isInteger(x)).slice(0, 2);
            return choose(r, { big: String(d * place) }, ws.map((x) => ({ big: String(x) })), ws.map((x) => (x === d ? `Pelkkä numero ei riitä: ${d} on ${['tuhansien', 'satojen', 'kymppien'][pos]} paikalla, joten se on ${d} × ${place}.` : x > d * place ? 'Kymmenen kertaa liian iso: laske paikat ykkösistä vasemmalle.' : 'Kymmenen kertaa liian pieni: laske paikat ykkösistä vasemmalle.')));
          })(),
          hint: 'Laske oikealta: ykköset, kympit, sadat, tuhannet.',
          explain: `${d} on ${['tuhansien', 'satojen', 'kymppien'][pos]} paikalla: ${d} × ${place} = ${d * place}.`,
        };
      },
      compose: (r) => {
        const th = r.int(1, 4), h = r.int(0, 5), tn = h === 0 ? r.int(1, 5) : r.chance(0.4) ? 0 : r.int(1, 5), o = r.int(1, 5);
        const n = th * 1000 + h * 100 + tn * 10 + o;
        const skip = Number(String(n).replace('0', ''));
        const wrong = [...new Set([skip, th * 1000 + h * 100 + o * 10 + tn, th + h + tn + o])].filter((x) => x !== n).slice(0, 2);
        return {
          say: 'Mikä luku palikoista muodostuu?',
          scene: paint(blocksArt(th, h, tn, o)),
          task: choose(r, { big: String(n) }, wrong.map((x) => ({ big: String(x) })), wrong.map((x) => (x === skip ? 'Nolla puuttuu: tyhjäkin paikka merkitään nollalla.' : x === th + h + tn + o ? 'Palikoita ei lasketa yhteen: jokainen laji saa oman paikkansa luvussa.' : 'Kympit ja ykköset ovat vaihtaneet paikkaa: sauvat ovat kymppejä, pikkukuutiot ykkösiä.'))),
          hint: 'Kuutio = tuhat, levy = sata, sauva = kymppi, pieni kuutio = ykkönen.',
          explain: `${th} tuhatta, ${h} sataa, ${tn} kymppiä ja ${o} ykköstä: ${n}.`,
        };
      },
      compare: (r) => {
        const th = r.int(1, 8), a = th * 1000 + r.int(0, 0) + r.int(0, 9) * 10 + 9, b = th * 1000 + r.int(1, 9) * 100 + r.int(0, 5);
        const [x, y] = r.shuffle([a, b]);
        const big = Math.max(a, b);
        return {
          say: `Kumpi on suurempi: ${x} vai ${y}?`,
          task: choose(r, { big: String(big) }, [{ big: String(Math.min(a, b)) }], ['Vertaa ensin tuhansia, sitten satoja: suurin paikka ratkaisee, ei viimeinen numero.'], 2),
          hint: 'Vertaa vasemmalta: ensin tuhannet, sitten sadat.',
          explain: `Tuhannet ovat samat. Satoja: ${Math.floor(a / 100) % 10} ja ${Math.floor(b / 100) % 10}. Suurempi on ${big}.`,
        };
      },
      till: (r) => {
        // Four different digits including one 0, so every card has one right compartment.
        const zeroAt = r.int(1, 2), [d1, d2, d3, x] = r.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]) as [number, number, number, number];
        const others = [d1, d2, d3];
        const ds = [0, 1, 2, 3].map((i) => (i === zeroAt ? 0 : others.shift()!));
        const n = ds[0]! * 1000 + ds[1]! * 100 + ds[2]! * 10 + ds[3]!;
        const vals = [1000, 100, 10, 1], ids = ['t', 's', 'k', 'y'], names = ['tuhannet', 'sadat', 'kymmenet', 'ykköset'];
        let notes = '';
        vals.forEach((v, c) => { for (let i = 0; i < ds[c]!; i++) notes += money(v, 40 + c * 80, 188 - i * 17); });
        const tokens = r.shuffle([...ds.map((d, i) => ({ id: `d${i}`, text: String(d) })), { id: 'x', text: String(x) }]);
        return {
          say: 'Kassaan tuli tämä raha. Laita numerokortit oikeisiin lokeroihin.',
          scene: paint(svg(320, 200, vals.map((v, c) => `<text x="${40 + c * 80}" y="14" text-anchor="middle" font-size="11" font-weight="800" fill="currentColor">${names[c]}</text>`).join('') + notes).replace('width="100%"', 'width="320"')),
          task: {
            kind: 'place' as const,
            slots: ids.map((id, c) => ({ id, text: names[c]! })),
            tokens,
            answer: Object.fromEntries(ids.map((id, c) => [id, `d${c}`])),
            why: Object.fromEntries(ids.map((id, c) => [id, ds[c] ? `${names[c]![0]!.toUpperCase() + names[c]!.slice(1)}: ${ds[c]} kpl → ${ds[c]}.` : `${names[c]![0]!.toUpperCase() + names[c]!.slice(1)}: lokero on tyhjä, joten paikalle tulee 0.`])),
          },
          hint: 'Laske jokaisen lokeron setelit. Tyhjä lokero saa nollan.',
          explain: `${ds.map((d, c) => `${d} ${names[c]}`).join(', ')}: ${n}.`,
        };
      },
    }, (r) => {
      const n = r.int(12, 48) * 100;
      return {
        say: `Kassassa on ${n} euroa sadan euron seteleinä. Montako seteliä on?`,
        task: choose(r, { big: String(n / 100) }, [{ big: String((n / 100) % 10) }, { big: String(n / 10) }], ['Tämä on vain satojen numero. Satasia on myös tuhansissa: tuhat on kymmenen satasta.', 'Tämä olisi kymppien määrä.']),
        hint: 'Montako satasta on yhdessä tuhannessa? Entä koko summassa?',
        explain: `${n} = ${n / 100} × 100. Jokainen tuhat on kymmenen satasta.`,
      };
    }),
  },
  {
    id: 'M-UNIT-01', stop: 'Yksikkörappuset', icon: '🪜',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    intro: 'Torin mittakepissä on portaat: jokainen askel alaspäin on kymmenen kertaa pienempi yksikkö.',
    reward: 'Rappuset ovat hallussa: kilo, desi, sentti ja milli!',
    demo: () => [
      { say: 'Metrin rappuset: kilometri, metri, desimetri, senttimetri, millimetri. Sammakko hyppää metristä senttimetriin: kaksi porrasta alas. Jokainen porras alas kertoo luvun kymmenellä: 1 m = 10 dm = 100 cm.', scene: stairsScene('m', 'm', 'cm', 1) },
      { say: 'Kilometristä metriin on kolme porrasta. Välissä on harvoin käytetyt hehtometri ja dekametri, mutta nekin lasketaan: 1 km = 1000 m.', scene: stairsScene('m', 'km', 'm', 1) },
      { say: 'Ylöspäin jaetaan. Grammasta kilogrammaan on kolme porrasta ylös: 2500 g on 2,5 kg.', scene: stairsScene('g', 'g', 'kg', 2500) },
    ],
    item: cases({
      prefix: (r) => {
        const [p, right, w1, w2] = r.pick([['kilo', '1000 kertaa', '100 kertaa', 'tuhannesosa'], ['desi', 'kymmenesosa', 'sadasosa', '10 kertaa'], ['sentti', 'sadasosa', 'kymmenesosa', '100 kertaa'], ['milli', 'tuhannesosa', 'sadasosa', '1000 kertaa']]) as string[];
        return {
          say: `Mitä etuliite ${p} tarkoittaa? Esimerkiksi ${p}metri on perusyksikön metri...`,
          scene: paint(stairsArt('m', `${p === 'kilo' ? 'k' : p === 'desi' ? 'd' : p === 'sentti' ? 'c' : 'm'}m`, 'm')),
          task: choose(r, t(right!), [t(w1!), t(w2!)], [`${w1} ei ole oikein: katso, montako porrasta ${p}-portaalta on perusyksikköön.`, `${w2} ei ole oikein: ${p === 'kilo' ? 'kilo on perusyksikön yläpuolella, eli suurempi' : 'tämä porras on perusyksikön alapuolella, eli pienempi'}.`]),
          hint: 'Kilo on rappusten ylhäällä (suuri), desi, sentti ja milli alhaalla (pieniä). Laske portaat perusyksiköstä.',
          explain: `${p[0]!.toUpperCase() + p.slice(1)} = ${right}: ${p === 'kilo' ? '1 km = 1000 m' : p === 'desi' ? '1 dm = 0,1 m' : p === 'sentti' ? '1 cm = 0,01 m' : '1 mm = 0,001 m'}.`,
        };
      },
      steps: (r) => {
        const pairs: [string, string, number][] = [['m', 'cm', 100], ['m', 'mm', 1000], ['dm', 'cm', 10], ['cm', 'mm', 10], ['m', 'dm', 10], ['dm', 'mm', 100]];
        const [a, b, k] = r.pick(pairs);
        return {
          say: `Montako ${b}:ä on yhdessä ${a}:ssä?`.replace('cm:ä', 'senttimetriä').replace('mm:ä', 'millimetriä').replace('dm:ä', 'desimetriä').replace('dm:ssä', 'desimetrissä').replace('cm:ssä', 'senttimetrissä').replace('m:ssä', 'metrissä'),
          scene: paint(stairsArt('m', a, b)),
          task: choose(r, { big: String(k) }, [10, 100, 1000].filter((x) => x !== k).map((x) => ({ big: String(x) })), [10, 100, 1000].filter((x) => x !== k).map(() => 'Laske portaat: jokainen porras on kymmenen kertaa.')),
          hint: 'Laske portaat: yksi porras = 10, kaksi = 100, kolme = 1000.',
          explain: `${a} → ${b} on ${String(k).length - 1} porrasta alas: 1 ${a} = ${k} ${b}.`,
        };
      },
      other: (r) => {
        const base = r.pick(['g', 'l'] as const);
        const [a, b, k] = base === 'g' ? r.pick([['kg', 'g', 1000], ['g', 'mg', 1000]] as [string, string, number][]) : r.pick([['l', 'dl', 10], ['l', 'ml', 1000], ['dl', 'ml', 100]] as [string, string, number][]);
        return {
          say: `Samat rappuset toimivat myös ${base === 'g' ? 'massalle' : 'tilavuudelle'}. 1 ${a} = □ ${b}?`,
          scene: paint(stairsArt(base, a, b)),
          task: choose(r, { big: String(k) }, [10, 100, 1000].filter((x) => x !== k).map((x) => ({ big: String(x) })), [10, 100, 1000].filter((x) => x !== k).map((x) => `${x} olisi ${String(x).length - 1} porrasta. ${a} → ${b} on ${String(k).length - 1}.`)),
          hint: 'Etuliite kertoo portaan samalla tavalla kuin metrillä: kilo, desi, sentti, milli.',
          explain: `Samat etuliitteet, samat portaat: 1 ${a} = ${k} ${b}.`,
        };
      },
      build: (r) => {
        const fam = r.pick([['km', 'm', 'dm', 'cm', 'mm'], ['kg', 'g', 'mg'], ['l', 'dl', 'cl', 'ml']]);
        return {
          say: 'Rakenna rappuset: vedä yksiköt järjestykseen suurimmasta pienimpään.',
          task: {
            kind: 'place',
            slots: fam.map((_, i) => ({ id: `s${i}`, text: i === 0 ? 'ylin (suurin)' : i === fam.length - 1 ? 'alin (pienin)' : `${i + 1}.` })),
            tokens: r.shuffle(fam).map((u) => ({ id: u, text: u })),
            answer: Object.fromEntries(fam.map((u, i) => [`s${i}`, u])),
            why: Object.fromEntries(fam.map((u, i) => [`s${i}`, u.startsWith('k') ? 'kilo = 1000 kertaa: rappusten ylhäällä.' : u.length === 1 ? 'Perusyksikkö on kilon alapuolella.' : u[0] === 'd' ? 'desi = kymmenesosa: yksi porras perusyksikön alla.' : u[0] === 'c' ? 'sentti = sadasosa: kaksi porrasta alas.' : 'milli = tuhannesosa: kolme porrasta alas.'])),
          } as Task,
          hint: 'Kilo ylimpänä, sitten perusyksikkö, sitten desi, sentti, milli.',
          explain: `${fam.join(' > ')}.`,
        };
      },
    }, (r) => {
      const l = r.int(1, 3);
      return {
        say: `Senttilitra (cl) on samalla portaalla kuin senttimetri. Montako senttilitraa on ${l === 1 ? 'yhdessä litrassa' : `${l} litrassa`}?`,
        scene: paint(stairsArt('l', 'l', 'cl')),
        task: choose(r, { big: String(l * 100) }, [{ big: String(l * 10) }, { big: String(l * 1000) }], ['Litrasta senttilitraan on kaksi porrasta, ei yksi.', 'Kolme porrasta veisi millilitroihin.']),
        hint: 'Sentti on kaksi porrasta perusyksikön alla.',
        explain: `Senttimetrejä metrissä on 100, ja samoin senttilitroja litrassa: ${l} l = ${l * 100} cl.`,
      };
    }),
  },
  conv('M-UNIT-02', 'Lankkukauppa', '🪵', 'Torin puuseppä myy lankkuja metreinä, mutta sahaa palat senttimetreinä.', 'Osaat muuntaa pituuksia!', 'm', [
    ['m', 'cm', 100, [1, 9]], ['cm', 'mm', 10, [2, 40]], ['km', 'm', 1000, [1, 9]], ['cm', 'm', 0.01, [1, 9], 100], ['mm', 'cm', 0.1, [2, 30], 10],
  ], (r) => {
    const m = r.int(2, 6), p = r.pick([20, 25, 50]);
    return wq(ask(`Lankku on ${m} m pitkä. Siitä sahataan ${p} cm:n paloja. Montako palaa saadaan?`, (m * 100) / p, 'palaa', `${m} m = ${m * 100} cm. ${m * 100} cm : ${p} cm = ${(m * 100) / p}.`, card(`${m} m = □ cm`, `□ cm : ${p} cm = ?`)), 'Muunna ensin lankku senttimetreiksi, sitten jaa palan pituudella.', { [Math.round((m * 10) / p * 1e6) / 1e6]: 'Metrissä on 100 cm, ei 10 cm.' });
  }),
  conv('M-UNIT-03', 'Jauhopussit', '🌾', 'Leipuri ostaa jauhot säkeittäin ja pakkaa ne pieniin pusseihin.', 'Osaat muuntaa massoja!', 'g', [
    ['kg', 'g', 1000, [1, 9]], ['t', 'kg', 1000, [1, 5]], ['g', 'kg', 0.001, [1, 9], 1000], ['kg', 'g', 1000, [1, 4], 1, 0.5],
  ], (r) => {
    const kg = r.int(2, 5), p = r.pick([250, 500]);
    return wq(ask(`Säkissä on ${kg} kg jauhoja. Ne pakataan ${p} g:n pusseihin. Montako pussia saadaan?`, (kg * 1000) / p, 'pussia', `${kg} kg = ${kg * 1000} g. ${kg * 1000} g : ${p} g = ${(kg * 1000) / p}.`, card(`${kg} kg = □ g`, `□ g : ${p} g = ?`)), 'Muunna ensin kilogrammat grammoiksi, sitten jaa pussin koolla.', { [kg * 1000 * p]: 'Kerroit pussin koolla. Montako pussia: jaa.', [Math.round((kg * 100) / p * 1e6) / 1e6]: 'Kilogrammassa on 1000 g, ei 100 g.' });
  }, [
    { say: 'Leipurin työ: säkki kilogrammoina, pussit grammoina. Muunna ensin samaan yksikköön, sitten jaa.', scene: packScene(2, 250) },
  ]),
  conv('M-UNIT-04', 'Mehuasema', '🧃', 'Mehuasemalla mehu tulee litroina, mutta lasit mitataan desilitroina.', 'Osaat muuntaa tilavuuksia!', 'l', [
    ['l', 'dl', 10, [1, 9]], ['l', 'ml', 1000, [1, 5]], ['dl', 'ml', 100, [1, 9]], ['dl', 'l', 0.1, [1, 9], 10], ['l', 'cl', 100, [1, 5]],
  ], (r) => {
    const [l, g] = r.pick([[1.5, 3], [2, 4], [1, 2], [3, 5], [2.4, 3]] as [number, number][]);
    return wq(ask(`Kannussa on ${fmt(l)} l mehua. Yhteen lasiin mahtuu ${g} dl. Montako lasia saadaan täyteen?`, (l * 10) / g, 'lasia', `${fmt(l)} l = ${l * 10} dl. ${l * 10} dl : ${g} dl = ${(l * 10) / g}.`, card(`1 l = 10 dl`, `${fmt(l)} l = □ dl`)), 'Muunna kannun litrat desilitroiksi (× 10), sitten jaa lasin koolla.', { [Math.round((l / g) * 1e6) / 1e6]: 'Litrat ja desilitrat eivät jakaudu suoraan: muunna ensin litrat desilitroiksi.', [Math.round(l * 10 * g * 1e6) / 1e6]: 'Kerroit lasin koolla. Montako lasia: jaa.' });
  }, [
    { say: 'Mehuaseman kannu: desilitra-asteikko näyttää, että litrassa on 10 dl. Sitten kaadetaan laseihin.', scene: pourScene(1.5, 3) },
  ]),
  {
    id: 'M-UNIT-05', stop: 'Lauttaaikataulu', icon: '⛴️',
    intro: 'Lautta lähtee saarelta tasatunnein. Aika ei ole kymmenjärjestelmässä: tunnissa on 60 minuuttia.',
    reward: 'Ehdit lautalle! Osaat muuntaa aikoja.',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Tunnissa on 60 minuuttia, ei 100. Katso, kun tunnit täyttyvät minuuteiksi.', scene: hoursScene(2, 15) },
      { say: 'Lautta lähtee 9.45 ja matka kestää 30 minuuttia. Seuraa minuuttiviisaria: tasatunnilla tunti vaihtuu.', scene: clockScene(9, 45, 30) },
      { say: 'Pisteen jälkeen tulevat minuutit, joita on korkeintaan 59. Siksi 13.40 + 50 min ei ole 13.90.', scene: clockScene(13, 40, 50) },
    ],
    item: cases({
      hmin: (r) => { const h = r.int(2, 5); return wq(ask(`${h} h = □ min`, h * 60, 'min', `${h} × 60 min = ${h * 60} min.`), 'Yksi tunti on 60 minuuttia. Kerro tuntien määrä 60:llä.', { [h * 100]: 'Tunnissa on 60 minuuttia, ei 100.' }); },
      mins: (r) => { const m = r.int(2, 6); return wq(ask(`${m} min = □ s`, m * 60, 's', `${m} × 60 s = ${m * 60} s.`), 'Minuutissa on 60 sekuntia.', { [m * 100]: 'Minuutissa on 60 sekuntia, ei 100.' }); },
      mixed: (r) => { const h = r.int(1, 3), m = r.pick([10, 15, 20, 30, 45]); return wq(ask(`Lauttamatka kestää ${h} h ${m} min. Montako minuuttia se on?`, h * 60 + m, 'min', `${h} h = ${h * 60} min, ja vielä ${m} min: ${h * 60 + m} min.`), 'Muunna ensin tunnit minuuteiksi, lisää sitten loput minuutit.', { [h * 100 + m]: 'Tunnissa on 60 minuuttia, ei 100.', [h * 60]: `Muunsit tunnit, mutta unohdit lisätä ${m} min.` }); },
      back: (r) => { const h = r.int(2, 4); return wq(ask(`${h * 60} min = □ h`, h, 'h', `${h * 60} : 60 = ${h}.`), 'Montako kertaa 60 minuuttia mahtuu? Jaa 60:llä.', { [Math.round(h * 60 / 100 * 100) / 100]: 'Jaa 60:llä, ei 100:lla: tunnissa on 60 minuuttia.' }); },
      day: (r) => { const d = r.int(2, 4); return wq(ask(`Leiri kestää ${d} vuorokautta. Montako tuntia se on?`, d * 24, 'h', `${d} × 24 h = ${d * 24} h.`), 'Vuorokaudessa on 24 tuntia.', { [d * 12]: 'Kello kiertää kahdesti vuorokaudessa: vuorokausi on 24 h, ei 12 h.', [d * 60]: 'Vuorokaudessa on 24 tuntia; 60 on minuuttien määrä tunnissa.' }); },
      hhmm: (r) => {
        const decoyM = r.pick([75, 90, 105, 135, 150, 165]);
        const lab = (x: number) => `${Math.floor(x / 60)} h ${x % 60} min`;
        const decoy = `${Math.floor(decoyM / 60)} h ${Math.round(((decoyM % 60) / 60) * 100)} min`;
        const ms = r.shuffle([decoyM, ...r.shuffle([70, 75, 80, 90, 100, 105, 110, 135, 150, 165].filter((x) => x !== decoyM && lab(x) !== decoy)).slice(0, 2)]);
        const toks = r.shuffle([...ms.map(lab), decoy]).map((x, i) => ({ id: `t${i}`, text: x }));
        const idOf = (x: string) => toks.find((q) => q.text === x)!.id;
        return {
          say: 'Lauttamatkat minuutteina. Vedä jokaiselle sama aika tunteina ja minuutteina. Yksi kortti jää yli.',
          task: {
            kind: 'place',
            slots: ms.map((x, i) => ({ id: `s${i}`, text: `${x} min` })),
            tokens: toks,
            answer: Object.fromEntries(ms.map((x, i) => [`s${i}`, idOf(lab(x))])),
            why: Object.fromEntries(ms.map((x, i) => [`s${i}`, `${x} min = 60 min + ${x - 60 >= 60 ? `60 min + ${x - 120}` : x - 60} min = ${lab(x)}.`])),
          } as Task,
          hint: 'Ota 60 minuutin palat tunneiksi. Mitä jää yli, ovat minuutit.',
          explain: ms.map((x) => `${x} min = ${lab(x)}`).join(', ') + `. ${decoy} on ansa: ${decoyM} min = ${fmt(decoyM / 60)} h, mutta desimaalit eivät ole minuutteja.`,
        };
      },
    }, (r) => {
      // Clock times as in the clock lessons (hours up to 12), and every option is a real clock time:
      // the traps are "the hour did not change" and "the trip started at the full hour" (review L181-13).
      const h = r.int(8, 11), m = r.pick([35, 40, 45, 50]), d = r.pick([30, 40, 45]);
      const pad = (x: number) => String(x).padStart(2, '0');
      const tot = m + d, right = `${h + 1}.${pad(tot - 60)}`;
      return withItemReadiness('M-UNIT-05', {
        say: `Lautta lähtee kello ${h}.${m}. Matka kestää ${d} minuuttia. Mihin aikaan lautta on perillä?`,
        task: choose(r, t(right), [t(`${h}.${pad(tot - 60)}`), t(`${h + 1}.${pad(d)}`)], [`Minuutit ${tot - 60} ovat oikein, mutta tunti vaihtui: ${m} + ${d} = ${tot} min, ja 60 minuuttia on jo uusi tunti.`, `Matka ei alkanut tasatunnilta: ennen kello ${h + 1}.00 kului jo ${60 - m} min, ja vain loput ${tot - 60} min menevät uudelle tunnille.`]),
        hint: `Montako minuuttia on tasatuntiin kello ${h}.${m}? Loput minuutit menevät uudelle tunnille.`,
        explain: `${m} + ${d} = ${tot} min = 1 h ${tot - 60} min. Perillä ${right}.`,
      }, { kind: 'clock-transfer', rolloverMinutes: 60, operations: ['add', 'subtract'] });
    }),
  },
];

/** Everyday objects with a sensible and a silly measure, for the estimation sort. */
const SENSE: Record<'m' | 'g' | 'l', [string, string, string][]> = {
  m: [['Ovi', '2 m', '2 cm'], ['Kynä', '14 cm', '14 m'], ['Koulumatka', '2 km', '2 mm'], ['Muurahainen', '5 mm', '5 m'], ['Kirjan paksuus', '3 cm', '3 km'], ['Pöydän korkeus', '75 cm', '75 m']],
  g: [['Omena', '150 g', '150 kg'], ['Kissa', '4 kg', '4 g'], ['Kirje', '20 g', '20 kg'], ['Sokeripala', '3 g', '3 kg'], ['Polkupyörä', '12 kg', '12 g'], ['Koulureppu', '5 kg', '5 g']],
  l: [['Juomalasi', '2 dl', '2 l'], ['Ämpäri', '10 l', '10 ml'], ['Teelusikka', '5 ml', '5 l'], ['Maitopurkki', '1 l', '1 ml'], ['Kylpyamme', '150 l', '150 ml'], ['Mehupullo', '5 dl', '5 ml']],
};

/** A unit conversion node: each pair [from, to, factor, value range, divisor for small values?, step]. */
function conv(id: string, stop: string, icon: string, intro: string, reward: string, base: 'm' | 'g' | 'l', pairs: [string, string, number, [number, number], number?, number?][], transfer: (r: Rng) => Q, extra: { say: string; scene: Paint }[] = []): NodeSpec {
  const gen: Record<string, (r: Rng) => Q> = {};
  pairs.forEach(([a, b, k, [lo, hi], scale, step], i) => {
    gen[`${a}-${b}-${i}`] = (r) => {
      const v = step ? r.int(lo * 2, hi * 2) * step + (r.chance(0.5) ? 0 : 0) : r.int(lo, hi) * (scale ?? 1);
      const ans = Math.round(v * k * 1e6) / 1e6;
      const up = k < 1;
      return {
        say: `${fmt(v)} ${a} = □ ${b}`,
        scene: paint(stairsArt(base, a, b)),
        task: { kind: 'numeric', answer: ans, unit: b, whyAt: {
          [Math.round((v / k) * 1e6) / 1e6]: up ? 'Pienestä isoon yksikköön luku pienenee: jaa, älä kerro.' : 'Isosta pieneen yksikköön luku kasvaa: kerro, älä jaa.',
          ...(Math.abs(k) !== 10 && Math.abs(1 / k) !== 10 ? { [Math.round((up ? v / 10 : v * 10) * 1e6) / 1e6]: `Kerroin on ${Math.round(up ? 1 / k : k)}, ei 10: ${a} → ${b} on useamman portaan matka.` } : {}),
        } },
        hint: up ? 'Pienemmästä isompaan yksikköön: luku pienenee, joten jaetaan.' : 'Isommasta pienempään yksikköön: luku kasvaa, joten kerrotaan.',
        explain: up ? `1 ${b} = ${Math.round(1 / k)} ${a}, joten ${fmt(v)} ${a} = ${fmt(v)} : ${Math.round(1 / k)} = ${fmt(ans)} ${b}.` : `1 ${a} = ${k} ${b}, joten ${fmt(v)} ${a} = ${fmt(v)} × ${k} = ${fmt(ans)} ${b}.`,
      };
    };
  });
  return {
    id, stop, icon, intro, reward,
    ...(CONV_AUDITED.includes(id) ? { rev: LAUNCH_REV, validRevs: [LAUNCH_REV, AUDIT_REV] } : {}),
    demo: () => {
      const ok = (u: string) => ['k', 'h', 'da', '', 'd', 'c', 'm'].includes(u.slice(0, -base.length)) && u.endsWith(base);
      const down = pairs.find(([a, b, k]) => k > 1 && ok(a) && ok(b)) ?? pairs[0]!, upP = pairs.find(([a, b, k]) => k < 1 && ok(a) && ok(b));
      const out = [
        { say: `Isosta yksiköstä pieneen: luku kasvaa, koska pieniä yksiköitä tarvitaan enemmän. ${down[0]} → ${down[1]}: jokainen porras alas kertoo kymmenellä.`, scene: stairsScene(base, down[0], down[1], 3) },
        { say: `Desimaaliluku muuntuu samalla tavalla: 2,5 ${down[0]} → ${down[1]}. Numerot siirtyvät, pilkku pysyy.`, scene: stairsScene(base, down[0], down[1], 2.5) },
      ];
      if (upP) out.push({ say: `Pienestä isoon: jaetaan. ${upP[0]} → ${upP[1]}: jokainen porras ylös jakaa kymmenellä. Tarkista aina, onko vastaus järkevän kokoinen.`, scene: stairsScene(base, upP[0], upP[1], Math.round(1 / upP[2]) * 3 / 2) });
      return [...out, ...extra];
    },
    item: cases({
      ...gen,
      sense: (r) => {
        const objs = r.shuffle(SENSE[base].slice()).slice(0, 4);
        const ok = r.shuffle([true, true, false, false]);
        const items = objs.map(([o, g, b], i) => ({ big: `${o}: ${ok[i] ? g : b}` }));
        return {
          say: 'Onko mitta järkevä? Lajittele: järkevä tai ei järkevä. Muunnoksen jälkeen tämä arvio paljastaa monta virhettä.',
          task: { kind: 'sort' as const, items, cats: [{ label: 'Järkevä' }, { label: 'Ei järkevä' }], answer: ok.map((x) => (x ? 0 : 1)), why: objs.map(([o, g, b], i) => (ok[i] ? `${o} on noin ${g}.` : `${o} ei voi olla ${b}; järkevä mitta on ${g}.`)) },
          hint: 'Vertaa tuttuun: 1 cm on sormen leveys, 1 kg on maitopurkki, 1 dl on pieni kuppi.',
          explain: objs.map(([o, g], i) => (ok[i] ? `${o} ${g} on järkevä` : `${o} on oikeasti noin ${g}`)).join('; ') + '.',
        };
      },
      match: (r) => {
        const pool = r.shuffle(pairs.slice());
        const rows: { slot: string; tok: string; wrong: string }[] = [];
        for (const [a, b, k, [lo, hi], scale] of pool) {
          if (rows.length === 3) break;
          const v = r.int(lo, hi) * (scale ?? 1), ans = Math.round(v * k * 1e6) / 1e6;
          const slot = `${fmt(v)} ${a}`, tok = `${fmt(ans)} ${b}`, wrong = `${fmt(Math.round((k > 1 ? ans * 10 : ans / 10) * 1e6) / 1e6)} ${b}`;
          if (rows.some((q) => q.slot === slot || q.tok === tok || q.tok === wrong || q.wrong === tok)) continue;
          rows.push({ slot, tok, wrong });
        }
        const decoy = rows.map((q) => q.wrong).find((w) => !rows.some((q) => q.tok === w)) ?? rows[0]!.wrong;
        const toks = r.shuffle([...rows.map((q) => q.tok), decoy]).map((x, i) => ({ id: `t${i}`, text: x }));
        const idOf = (x: string) => toks.find((t) => t.text === x)!.id;
        return {
          say: 'Yhdistä samat määrät: vedä jokaisen määrän alle sama määrä toisessa yksikössä. Yksi kortti jää yli.',
          task: {
            kind: 'place',
            slots: rows.map((q, i) => ({ id: `s${i}`, text: q.slot })),
            tokens: toks,
            answer: Object.fromEntries(rows.map((q, i) => [`s${i}`, idOf(q.tok)])),
            why: Object.fromEntries(rows.map((q, i) => [`s${i}`, `${q.slot} = ${q.tok}. Tarkista tämän rivin molemmat yksiköt ja niiden muunnoskerroin.`])),
          } as Task,
          hint: 'Isosta pieneen kerrotaan, pienestä isoon jaetaan. Laske portaat.',
          explain: rows.map((q) => `${q.slot} = ${q.tok}`).join(', ') + `. ${decoy} jäi yli.`,
        };
      },
    }, transfer),
  };
}
