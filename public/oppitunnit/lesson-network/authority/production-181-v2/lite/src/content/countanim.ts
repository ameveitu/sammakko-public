// Counting that happens in time: Loikka hops from stone to stone and says one word per hop.
// A stone without a word is a word that was skipped.
import { duck, frog, THINGS } from '../ui/art';
import { word } from './fi';
import { lineLayout } from './kit';
import { balanceBody } from './pics';
import { anim, ease, type AnimPaint } from '../ui/anim';

const HOP = 0.9;

/** Stones in a row; Loikka lands on them one by one and each stone shows its word on landing.
 *  `labels[i] === ''` leaves a stone without a word (Loikka jumped over it). */
export function hopWords(labels: string[], opts: { say?: (t: number, shown: number) => string; jumpOver?: number } = {}): AnimPaint {
  const n = labels.length, W = 320, gap = (W - 64) / Math.max(1, n - 1);
  const xs = labels.map((_, i) => 32 + i * gap);
  // Landing order: every stone, except one jumped over.
  const stops = xs.map((_, i) => i).filter((i) => i !== opts.jumpOver);
  const end = 0.6 + stops.length * HOP + 0.8;
  const at = (t: number) => {
    const k = Math.floor((t - 0.6) / HOP);
    if (t < 0.6) return { from: -1, to: 0, p: 0, landed: 0 };
    const p = ease(t - 0.6 - k * HOP, 0, HOP * 0.7);
    return { from: stops[k - 1] ?? -1, to: stops[Math.min(k, stops.length - 1)]!, p: k >= stops.length ? 1 : p, landed: Math.min(stops.length, k + (p >= 1 ? 1 : 0)) };
  };
  return anim({
    dur: end, w: W, h: 130, label: 'Loikka hyppii kiveltä kivelle ja laskee',
    frame: (t) => {
      const s = at(t);
      const x0 = s.from < 0 ? xs[0]! - 26 : xs[s.from]!, x1 = xs[s.to]!;
      const fx = x0 + (x1 - x0) * s.p, fy = 70 - Math.sin(Math.PI * s.p) * (s.to - Math.max(0, s.from) > 1 ? 46 : 26);
      const done = new Set(stops.slice(0, s.landed));
      const stones = xs.map((x, i) => {
        const lit = done.has(i), missed = i === opts.jumpOver && s.landed > 0 && stops[s.landed - 1]! > i;
        return `<ellipse cx="${x}" cy="96" rx="${Math.min(22, gap / 2 - 3)}" ry="10" fill="${lit ? '#9fc5a8' : missed ? '#f3c4c0' : '#c9c9c9'}" stroke="#555" stroke-width="2"/>` +
          (lit ? `<text x="${x}" y="124" text-anchor="middle" font-size="${n > 7 ? 11 : 13}" font-weight="800" fill="currentColor">${labels[i]}</text>` : '') +
          (missed ? `<text x="${x}" y="124" text-anchor="middle" font-size="16" font-weight="800" fill="#d9534f">?</text>` : '');
      }).join('');
      return `<rect x="0" y="92" width="${W}" height="38" fill="#7fb8e0" opacity=".35"/>` + stones + frog(fx, fy, 24);
    },
    caption: (t) => opts.say ? opts.say(t, at(t).landed) : labels.filter((_, i) => stops.slice(0, at(t).landed).includes(i)).join(', '),
  });
}

const STEP = 0.85;

/** Someone counts objects by pointing: the hand moves to one object at a time and the number
 *  appears on it. `labels[i]` are the numbers object i gets: [] = skipped, two = counted twice. */
export function countAlong(kind: string, labels: number[][], opts: { w?: number; h?: number; caption?: boolean; mark?: boolean; circle?: boolean; total?: boolean; cover?: boolean } = {}): AnimPaint {
  const W = opts.w ?? 320, H = opts.h ?? 150, size = 38;
  const n = labels.length;
  const pts = opts.circle
    ? labels.map((_, i) => ({ x: W / 2 + Math.cos((i / n) * 2 * Math.PI - Math.PI / 2) * (H / 2 - 30) * 1.2, y: H / 2 + 8 + Math.sin((i / n) * 2 * Math.PI - Math.PI / 2) * (H / 2 - 30) }))
    : lineLayout(n, W, H - 30, size * 1.45).map((p) => ({ x: p.x, y: p.y + 30 }));
  const ev = labels.flatMap((ls, i) => ls.map((l) => ({ i, l }))).sort((a, b) => a.l - b.l);
  const fin = 0.6 + ev.length * STEP, end = fin + (opts.cover ? 2.2 : opts.total ? 1.6 : 1);
  const said = (t: number) => Math.max(0, Math.min(ev.length, Math.floor((t - 0.6) / STEP) + 1));
  return anim({
    dur: end, w: W, h: H, label: `Laskeminen osoittamalla, ${labels.length} esinettä`,
    frame: (t) => {
      const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
      const bx = Math.min(...xs) - size * 0.75, by = Math.min(...ys) - size * 0.95, bw = Math.max(...xs) - Math.min(...xs) + size * 1.5, bh = Math.max(...ys) - Math.min(...ys) + size * 1.6;
      // The whole group gets one name: its last word.
      const ring = (u: number) => opts.total && u > fin + 0.3 ? `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="18" fill="none" stroke="#f4c542" stroke-width="4" opacity="${ease(u, fin + 0.3, fin + 0.9)}"/>` : '';
      // A box comes down over the counted things: the count stays even when they are hidden.
      const box = (u: number) => {
        if (!opts.cover || u < fin + 0.4) return '';
        const d = ease(u, fin + 0.4, fin + 1.4), y = -bh + (by + bh) * d;
        return `<rect x="${bx}" y="${y}" width="${bw}" height="${bh}" rx="10" fill="#c99a5b" stroke="#8a6532" stroke-width="3"/><text x="${bx + bw / 2}" y="${y + bh / 2 + 10}" text-anchor="middle" font-size="30" font-weight="800" fill="#fff">?</text>`;
      };
      const k = said(t), cur = ev[k - 1];
      const p = cur ? ease(t - 0.6 - (k - 1) * STEP, 0, STEP * 0.45) : 0;
      const prev = ev[k - 2] ? pts[ev[k - 2]!.i]! : { x: pts[0]!.x - 30, y: pts[0]!.y };
      const tgt = cur ? pts[cur.i]! : prev;
      const hx = prev.x + (tgt.x - prev.x) * p, hy = prev.y + (tgt.y - prev.y) * p - 30;
      const shown = ev.slice(0, k);
      const past = (i: number) => opts.mark && !labels[i]!.length && shown.some((e) => e.i > i);
      const flag = opts.circle && opts.mark ? `<text x="${pts[0]!.x}" y="${pts[0]!.y + 32}" text-anchor="middle" font-size="12" font-weight="800" fill="#d9534f">▲ alku</text>` : '';
      return flag + pts.map((q, i) => THINGS[kind]!.draw(q.x, q.y, size) + (past(i) ? `<circle cx="${q.x}" cy="${q.y}" r="${size * 0.7}" fill="none" stroke="#d9534f" stroke-width="3" stroke-dasharray="5 4"/>` : '') + shown.filter((e) => e.i === i).map((e, j) =>
        `<circle cx="${q.x + 16 + j * 20}" cy="${q.y - 20}" r="10" fill="${j && opts.mark ? '#d9534f' : 'var(--pond)'}"/><text x="${q.x + 16 + j * 20}" y="${q.y - 15}" text-anchor="middle" fill="#fff" font-weight="800" font-size="13">${e.l}</text>`).join('')).join('') +
        (t < fin + 0.3 ? `<text x="${hx}" y="${hy}" text-anchor="middle" font-size="26">👇</text>` : '') + ring(t) + box(t);
    },
    caption: opts.caption === false ? undefined : (t) => ev.slice(0, said(t)).map((e) => word(e.l)).join(', ') + (opts.total && t > fin + 0.3 ? `. Niitä on ${word(ev.length)}!` : ''),
  });
}

/** The numerals from `from` to `to` light up one by one while their names are said. */
export function numeralTrain(from: number, to: number): AnimPaint {
  const n = to - from + 1, W = 320, cw = Math.min(46, (W - 8) / Math.min(n, 6)), perRow = Math.min(n, 6), rows = Math.ceil(n / perRow);
  const H = rows * 64 + 10, STEPT = 0.8, end = 0.5 + n * STEPT + 0.8;
  const pos = (i: number) => ({ x: (W - perRow * cw) / 2 + (i % perRow) * cw + cw / 2, y: 10 + Math.floor(i / perRow) * 64 });
  const on = (t: number) => Math.max(0, Math.min(n, Math.floor((t - 0.5) / STEPT) + 1));
  return anim({
    dur: end, w: W, h: H, label: `Numerot ${from}–${to} yksi kerrallaan`,
    frame: (t) => Array.from({ length: n }, (_, i) => {
      const p = pos(i), lit = i < on(t), now = i === on(t) - 1 && t < end - 0.8;
      return `<rect x="${p.x - cw / 2 + 3}" y="${p.y}" width="${cw - 6}" height="54" rx="10" fill="${now ? '#f4c542' : lit ? 'var(--pond)' : 'none'}" stroke="currentColor" stroke-width="${lit ? 0 : 1.5}" opacity="${lit ? 1 : 0.35}"/>` +
        `<text x="${p.x}" y="${p.y + 40}" text-anchor="middle" font-size="${from + i > 9 ? 25 : 32}" font-weight="800" fill="${lit ? '#fff' : 'currentColor'}" opacity="${lit ? 1 : 0.35}">${from + i}</text>`;
    }).join(''),
    caption: (t) => { const k = on(t); return k ? `${from + k - 1}: ${word(from + k - 1)}` : ''; },
  });
}

/** Things drop into a box one at a time; the label on the box follows the count. */
export function fillBox(kind: string, n: number): AnimPaint {
  const W = 300, H = 170, size = n > 6 ? 24 : 28, STEPT = 0.9, end = 0.5 + n * STEPT + 1.2;
  const cols = Math.min(n, 5), slot = (i: number) => ({ x: 150 - ((cols - 1) * size * 1.15) / 2 + (i % cols) * size * 1.15, y: 108 - Math.floor(i / cols) * size * 1.05 });
  const inBox = (t: number) => Math.max(0, Math.min(n, Math.floor((t - 0.5) / STEPT)));
  return anim({
    dur: end, w: W, h: H, label: `${n} esinettä putoaa rasiaan`,
    frame: (t) => {
      const k = inBox(t), p = ease(t - 0.5 - k * STEPT, 0, STEPT * 0.6);
      const falling = k < n && t >= 0.5 ? (() => { const q = slot(k); return THINGS[kind]!.draw(q.x, -10 + (q.y + 10) * p, size); })() : '';
      return `<rect x="60" y="40" width="180" height="${H - 70}" rx="12" fill="none" stroke="currentColor" stroke-opacity=".45" stroke-width="3"/>` +
        Array.from({ length: k }, (_, i) => { const q = slot(i); return THINGS[kind]!.draw(q.x, q.y, size); }).join('') + falling +
        `<rect x="122" y="${H - 26}" width="56" height="24" rx="6" fill="#fff6c8" stroke="#8a6532" stroke-width="2"/><text x="150" y="${H - 8}" text-anchor="middle" font-size="19" font-weight="800" fill="#333">${k}</text>`;
    },
    caption: (t) => { const k = inBox(t); return k ? `${word(k)[0]!.toUpperCase()}${word(k).slice(1)}${k === n && t > end - 1 ? `. Lappuun tulee ${n}.` : ''}` : ''; },
  });
}

/** Conservation: a tight row of things slides apart (or together). Nothing is added or taken. */
export function spreadRow(kind: string, n: number, apart = true): AnimPaint {
  const W = 320, H = 90, size = 30, tight = size * 1.05, wide = Math.min((W - 40) / Math.max(1, n - 1), size * 2.4);
  const [g0, g1] = apart ? [tight, wide] : [wide, tight];
  return anim({
    dur: 4, w: W, h: H, label: `${n} esinettä siirtyy ${apart ? 'kauemmas' : 'lähemmäs'} toisistaan`,
    frame: (t) => {
      const g = g0 + (g1 - g0) * ease(t, 1, 3), x0 = W / 2 - ((n - 1) * g) / 2;
      return Array.from({ length: n }, (_, i) => THINGS[kind]!.draw(x0 + i * g, 48, size)).join('');
    },
  });
}

/** One amount, three ways: the things are counted, then the numeral and the word slide in. */
export function threeWays(kind: string, n: number): AnimPaint {
  const W = 320, H = 170, size = 30, STEPT = 0.7, fin = 0.5 + n * STEPT;
  const xs = Array.from({ length: n }, (_, i) => W / 2 - ((n - 1) * size * 1.2) / 2 + i * size * 1.2);
  const said = (t: number) => Math.max(0, Math.min(n, Math.floor((t - 0.5) / STEPT) + 1));
  const card = (x: number, txt: string, fs: number, a: number) => `<g opacity="${a}" transform="translate(0 ${(1 - a) * 30})"><rect x="${x - 60}" y="96" width="120" height="58" rx="12" fill="var(--card, #fff)" stroke="currentColor" stroke-opacity=".4" stroke-width="2"/><text x="${x}" y="${136 + (fs > 30 ? 4 : 0)}" text-anchor="middle" font-size="${fs}" font-weight="800" fill="currentColor">${txt}</text></g>`;
  return anim({
    dur: fin + 3, w: W, h: H, label: `${n} esinettä, numero ${n} ja sana ${word(n)}`,
    frame: (t) => {
      const k = said(t);
      return xs.map((x, i) => THINGS[kind]!.draw(x, 44, size) + (i < k ? `<circle cx="${x + 14}" cy="22" r="10" fill="var(--pond)"/><text x="${x + 14}" y="27" text-anchor="middle" fill="#fff" font-weight="800" font-size="13">${i + 1}</text>` : '')).join('') +
        card(85, String(n), 44, ease(t, fin + 0.2, fin + 0.9)) + card(235, word(n), word(n).length > 6 ? 22 : 28, ease(t, fin + 1.2, fin + 1.9));
    },
    caption: (t) => t < fin ? Array.from({ length: said(t) }, (_, i) => word(i + 1)).join(', ') : t < fin + 1.1 ? `Esineitä on ${word(n)}. Numero: ${n}.` : `Esineet, ${n} ja ${word(n)} kertovat saman määrän.`,
  });
}

/** Take-away in time: Loikka eats things from the plate one at a time; the count of what is
 *  left goes down with each one. `zero` shows the numeral 0 on an empty plate at the end. */
export function takeAway(kind: string, n: number, take: number, opts: { zero?: boolean; counter?: boolean } = {}): AnimPaint {
  const counter = opts.counter !== false;
  const W = 320, H = 150, size = n > 6 ? 22 : 28, STEPT = 1.1, fin = 0.8 + take * STEPT;
  const half = (n * size * 1.15) / 2, cx = Math.max(120, half + 24);
  const xs = Array.from({ length: n }, (_, i) => cx - ((n - 1) * size * 1.15) / 2 + i * size * 1.15);
  const eaten = (t: number) => Math.max(0, Math.min(take, Math.floor((t - 0.8) / STEPT)));
  const fx = 270, fy = 70;
  return anim({
    dur: fin + 1.6, w: W, h: H, label: `${n} esinettä, joista Loikka syö ${take}`,
    frame: (t) => {
      const e = eaten(t), moving = e < take && t >= 0.8 ? ease(t - 0.8 - e * STEPT, 0, STEPT * 0.6) : 0;
      // Eat from the right end, nearest to Loikka.
      const things = xs.map((x, i) => {
        const order = n - 1 - i;
        if (order < e) return '';
        if (order === e && moving > 0) return `<g opacity="${1 - moving * 0.8}">${THINGS[kind]!.draw(x + (fx - 24 - x) * moving, 70 - Math.sin(Math.PI * moving) * 30, size * (1 - moving * 0.4))}</g>`;
        return THINGS[kind]!.draw(x, 76, size);
      }).join('');
      const left = n - e;
      return `<ellipse cx="${cx}" cy="90" rx="${Math.max(70, half + 20)}" ry="16" fill="#e8e1d4" stroke="#b9ad97" stroke-width="2"/>` + things +
        frog(fx, fy, moving > 0.5 && moving < 0.95 ? 40 : 34) +
        (!counter ? '' : `<text x="${cx}" y="138" text-anchor="middle" font-size="18" font-weight="800" fill="currentColor">${opts.zero && left === 0 && t > fin + 0.3 ? 'Jäljellä 0' : `Jäljellä ${left}`}</text>`);
    },
    caption: !counter ? (t) => (eaten(t) ? `Loikka söi ${word(eaten(t))}.` : `Lautasella on ${word(n)}.`) : (t) => { const e = eaten(t); return e ? `Loikka söi ${word(e)}. Jäljellä ${word(n - e)}.` : `Lautasella on ${word(n)}.`; },
  });
}

/** Two numbers built from reed bundles side by side: tens first, one bundle at a time on both
 *  rows, then ones. The comparison is decided where the rows first differ. */
export function tensRace(a: number, b: number): AnimPaint {
  const W = 320, H = 190, rowY = [20, 108], STEPT = 0.6;
  const parts = [a, b].map((v) => ({ t: Math.floor(v / 10), o: v % 10 }));
  const maxT = Math.max(parts[0]!.t, parts[1]!.t), maxO = Math.max(parts[0]!.o, parts[1]!.o);
  const tEnd = 0.6 + maxT * STEPT, oEnd = tEnd + 0.8 + maxO * STEPT * 0.6;
  const decidedByTens = parts[0]!.t !== parts[1]!.t;
  const end = (decidedByTens ? tEnd + 1.6 : oEnd + 1.4);
  const bw = Math.min(22, 150 / Math.max(1, maxT)), ow = Math.min(9, 110 / Math.max(1, maxO));
  const bundle = (x: number, y: number) => Array.from({ length: 6 }, (_, k) => `<rect x="${x + k * (bw - 4) / 6}" y="${y}" width="${Math.max(2, (bw - 4) / 6 - 0.6)}" height="64" rx="1" fill="#8fae5d"/>`).join('') + `<rect x="${x - 1}" y="${y + 28}" width="${bw - 2}" height="7" rx="3" fill="var(--red)"/>`;
  const reed = (x: number, y: number) => `<rect x="${x}" y="${y}" width="3.5" height="64" rx="1.5" fill="#8fae5d"/><ellipse cx="${x + 1.8}" cy="${y}" rx="2.8" ry="5" fill="#8a5a33"/>`;
  const win = a > b ? 0 : 1;
  return anim({
    dur: end, w: W, h: H, label: `Luvut ${a} ja ${b} kaislanippuina`,
    frame: (t) => {
      const nt = Math.max(0, Math.floor((t - 0.6) / STEPT) + 1), no = decidedByTens ? 0 : Math.max(0, Math.floor((t - tEnd - 0.8) / (STEPT * 0.6)) + 1);
      return parts.map((p, r) => {
        const y = rowY[r]!;
        let x = 52, g = '';
        for (let i = 0; i < Math.min(p.t, nt); i++) { g += bundle(x, y); x += bw; }
        x += 8;
        for (let i = 0; i < Math.min(p.o, no); i++) { g += reed(x, y); x += ow; }
        const glow = t > end - 1.2 && r === win ? `<rect x="2" y="${y - 8}" width="${W - 4}" height="80" rx="10" fill="none" stroke="#f4c542" stroke-width="3"/>` : '';
        return glow + `<text x="24" y="${y + 40}" text-anchor="middle" font-size="18" font-weight="800" fill="currentColor">${[a, b][r]}</text>` + g;
      }).join('');
    },
    caption: (t) => t < tEnd ? 'Ensin kympit…' : decidedByTens ? `Kymppejä: ${parts[0]!.t} ja ${parts[1]!.t}. ${Math.max(a, b)} on suurempi.` : t < oEnd ? `Kymppejä on yhtä monta. Sitten ykköset…` : `Ykkösiä: ${parts[0]!.o} ja ${parts[1]!.o}. ${Math.max(a, b)} on suurempi.`,
  });
}

// ---------------------------------------------------------------- halving by dealing
const SIDE = (W: number) => [W * 0.25, W * 0.75];
function sideRows(kind: string, cnt: number, cx: number, size: number) {
  return Array.from({ length: cnt }, (_, i) => THINGS[kind]!.draw(cx - size * 1.1 + (i % 3) * size * 1.1, 112 - Math.floor(i / 3) * size * 1.0 + 26, size)).join('');
}
const sides = (W: number, H: number, a: number, b: number) => {
  const [L, R] = SIDE(W);
  return frog(L!, 30, 18) + duck(R!, 30, 16) +
    `<text x="${L}" y="${H - 6}" text-anchor="middle" font-size="18" font-weight="800" fill="currentColor">${a}</text>` +
    `<text x="${R}" y="${H - 6}" text-anchor="middle" font-size="18" font-weight="800" fill="currentColor">${b}</text>`;
};

/** n things in a pile in the middle; one at a time they fly to Loikka (left) and Aava (right) in turn. */
export function dealScene(kind: string, n: number): AnimPaint {
  const W = 320, H = 200, size = 24, ST = 0.8, fin = 0.6 + n * ST, half = Math.floor(n / 2);
  const dealt = (t: number) => Math.max(0, Math.min(n, Math.floor((t - 0.6) / ST)));
  const pile = (i: number) => ({ x: W / 2 + ((i % 2) - 0.5) * size * 0.9, y: 60 + Math.floor(i / 2) * size * 0.75 });
  return anim({
    dur: fin + 2.4, w: W, h: H, label: `${n} esinettä jaetaan vuorotellen Loikalle ja Aavalle`,
    frame: (t) => {
      const k = dealt(t), p = ease(t - 0.6 - k * ST, 0, ST * 0.7);
      const a = Math.ceil(k / 2), b = Math.floor(k / 2);
      let s = sides(W, H, a, b) + sideRows(kind, a, SIDE(W)[0]!, size) + sideRows(kind, b, SIDE(W)[1]!, size);
      for (let i = n - 1; i > k; i--) { const q = pile(n - 1 - i); s += THINGS[kind]!.draw(q.x, q.y, size); }
      if (k < n && t >= 0.6) {
        const q = pile(n - 1 - k), toL = k % 2 === 0, cnt = toL ? a : b, cx = SIDE(W)[toL ? 0 : 1]!;
        const tx = cx - size * 1.1 + (cnt % 3) * size * 1.1, ty = 138 - Math.floor(cnt / 3) * size;
        s += THINGS[kind]!.draw(q.x + (tx - q.x) * p, q.y + (ty - q.y) * p - Math.sin(Math.PI * p) * 24, size);
      }
      return s;
    },
    caption: (t) => {
      const k = dealt(t);
      if (t < 0.6) return `${word(n)[0]!.toUpperCase()}${word(n).slice(1)}: annetaan vuorotellen.`;
      if (k < n) return k % 2 === 0 ? 'Yksi Loikalle…' : '…yksi Aavalle.';
      return `Kumpikin sai ${word(half)}. ${half} ja ${half} on ${n}: puolet luvusta ${n} on ${half}.`;
    },
  });
}

/** An unfair split a/b (a > b): one thing at a time moves across until both have the same. */
export function evenOut(kind: string, a: number, b: number): AnimPaint {
  const W = 320, H = 200, size = 24, moves = (a - b) / 2, ST = 1.4, fin = 1.8 + moves * ST;
  const moved = (t: number) => Math.max(0, Math.min(moves, Math.floor((t - 1.8) / ST)));
  return anim({
    dur: fin + 2, w: W, h: H, label: `Jako ${a} ja ${b} tasataan: ${(a + b) / 2} ja ${(a + b) / 2}`,
    frame: (t) => {
      const k = moved(t), p = k < moves ? ease(t - 1.8 - k * ST, 0, ST * 0.6) : 0;
      const [L, R] = SIDE(W);
      const ca = a - k - (p > 0 ? 1 : 0), cb = b + k;
      let s = sides(W, H, a - k, b + k) + sideRows(kind, ca, L!, size) + sideRows(kind, cb, R!, size);
      if (p > 0) {
        const fx = L! - size * 1.1 + ((a - k - 1) % 3) * size * 1.1, fy = 138 - Math.floor((a - k - 1) / 3) * size;
        const tx = R! - size * 1.1 + (cb % 3) * size * 1.1, ty = 138 - Math.floor(cb / 3) * size;
        s += THINGS[kind]!.draw(fx + (tx - fx) * p, fy + (ty - fy) * p - Math.sin(Math.PI * p) * 30, size);
      }
      return s;
    },
    caption: (t) => moved(t) === 0 && t < 1.8 ? `Loikalla ${a}, Aavalla ${b}. Se ei ole reilua.`
      : moved(t) < moves ? 'Loikka antaa yhden Aavalle…' : `Nyt kummallakin on ${(a + b) / 2}. Se on puoliksi.`,
  });
}

// ---------------------------------------------------------------- joining into one basket
/** Loikka's a things and Aava's b things fly into one basket, one at a time; the count goes on
 *  from a (it does not start again), and at the end the number sentence a + b = a+b appears. */
export function joinScene(kind: string, a: number, b: number): AnimPaint {
  const W = 320, H = 210, S = 22, ST = 0.75, n = a + b, t0 = 1.2, fin = t0 + n * ST + 0.4;
  const inB = (t: number) => Math.max(0, Math.min(n, Math.floor((t - t0) / ST)));
  const home = (i: number) => i < a ? { x: 40 + (i % 3) * S * 1.05, y: 62 + Math.floor(i / 3) * S } : { x: W - 40 - ((i - a) % 3) * S * 1.05, y: 62 + Math.floor((i - a) / 3) * S };
  const slot = (i: number) => ({ x: W / 2 - 2 * S * 1.05 + (i % 5) * S * 1.05, y: 168 - Math.floor(i / 5) * S * 0.9 });
  const basket = `<path d="M${W / 2 - 74} 140 h148 l-12 54 h-124 z" fill="#e8d7b0" stroke="#b79b62" stroke-width="3"/><path d="M${W / 2 - 60} 140 q60 -60 120 0" fill="none" stroke="#b79b62" stroke-width="4"/>`;
  return anim({
    dur: fin + 2.6, w: W, h: H, label: `${a} ja ${b} laitetaan samaan koriin`,
    frame: (t) => {
      const k = inB(t), p = k < n ? ease(t - t0 - k * ST, 0, ST * 0.7) : 0;
      let s = frog(64, 24, 16) + duck(W - 64, 24, 14) + basket;
      for (let i = k + (p > 0 ? 1 : 0); i < n; i++) { const q = home(i); s += THINGS[kind]!.draw(q.x, q.y, S); }
      for (let i = 0; i < k; i++) { const q = slot(i); s += THINGS[kind]!.draw(q.x, q.y, S) + `<text x="${q.x}" y="${q.y - 12}" text-anchor="middle" font-size="10" font-weight="800" fill="${i < a ? 'var(--pond)' : '#c98a00'}">${i + 1}</text>`; }
      if (p > 0) { const f = home(k), q = slot(k); s += THINGS[kind]!.draw(f.x + (q.x - f.x) * p, f.y + (q.y - f.y) * p - Math.sin(Math.PI * p) * 30, S); }
      if (t > fin) s += `<text x="${W / 2}" y="${60 + Math.min(1, (t - fin) * 2) * 30}" text-anchor="middle" font-size="30" font-weight="800" fill="currentColor" opacity="${Math.min(1, (t - fin) * 2)}">${a} + ${b} = ${n}</text>`;
      return s;
    },
    caption: (t) => {
      const k = inB(t);
      if (t < t0) return `Loikalla on ${word(a)}, Aavalla ${word(b)}.`;
      if (k === 0) return 'Loikan eväät koriin…';
      if (k < a) return Cap(word(k));
      if (k === a && k < n) return `${Cap(word(a))}. Nyt Aavan eväät: laskeminen jatkuu, ei ala alusta.`;
      if (k < n) return Cap(word(k));
      return t > fin ? `Korissa on ${word(n)}. ${a} plus ${b} on ${n}.` : Cap(word(n));
    },
  });
}
const Cap = (w: string) => w[0]!.toUpperCase() + w.slice(1);

// ---------------------------------------------------------------- equal groups: packing bags
/** Bag outline and the spot of the j-th thing in bag i (shared by the animation and the pack game). */
export function bagGeo(k: number, W = 320) {
  const bw = Math.min(84, (W - 12) / k - 10), x0 = (i: number) => (W - k * (bw + 10) + 10) / 2 + i * (bw + 10);
  return {
    bw, x0,
    bag: (i: number, lit = false) => `<path d="M${x0(i)} 70 h${bw} l-6 92 h-${bw - 12} z" fill="${lit ? '#f6e7b8' : '#e8d7b0'}" stroke="#b79b62" stroke-width="2"/>`,
    spot: (i: number, j: number) => ({ x: x0(i) + bw / 2 + ((j % 2) - 0.5) * 24, y: 146 - Math.floor(j / 2) * 22 }),
  };
}
/** k bags fill up one at a time with g things each; the running total counts in g's,
 *  then the repeated addition and the multiplication appear. */
export function packScene(kind: string, k: number, g: number): AnimPaint {
  const W = 320, H = 230, S = 20, ST = 0.5, BAG = g * ST + 0.7, t0 = 0.8, fin = t0 + k * BAG, G = bagGeo(k, W);
  const state = (t: number) => {
    const u = Math.max(0, t - t0), b = Math.min(k, Math.floor(u / BAG)), j = b < k ? Math.min(g, Math.floor((u - b * BAG) / ST)) : 0;
    return { b, j };
  };
  return anim({
    dur: fin + 3.4, w: W, h: H, label: `${k} pussia, jokaiseen ${g}`,
    frame: (t) => {
      const { b, j } = state(t);
      let s = '';
      for (let i = 0; i < k; i++) {
        s += G.bag(i, i === b && t < fin);
        const cnt = i < b ? g : i === b ? j : 0;
        for (let q = 0; q < cnt; q++) { const p = G.spot(i, q); s += THINGS[kind]!.draw(p.x, p.y, S); }
        if (i < b) s += `<text x="${G.x0(i) + G.bw / 2}" y="60" text-anchor="middle" font-size="16" font-weight="800" fill="var(--pond)">${(i + 1) * g}</text>`;
      }
      if (t > fin) {
        const a = Math.min(1, (t - fin) * 1.5), m = Math.min(1, Math.max(0, (t - fin - 1.4) * 1.5));
        s += `<text x="${W / 2}" y="200" text-anchor="middle" font-size="22" font-weight="800" fill="currentColor" opacity="${a}">${Array(k).fill(g).join(' + ')} = ${k * g}</text>` +
          `<text x="${W / 2}" y="226" text-anchor="middle" font-size="22" font-weight="800" fill="var(--pond)" opacity="${m}">${k} × ${g} = ${k * g}</text>`;
      }
      return s;
    },
    caption: (t) => {
      const { b } = state(t);
      if (t < t0) return `${k} pussia. Jokaiseen laitetaan ${g}.`;
      if (t < fin) return b === 0 ? `Ensimmäiseen pussiin ${g}…` : `${b * g} on jo pusseissa. Seuraavaan pussiin ${g}…`;
      return t < fin + 1.4 ? `${k} kertaa ${g}: ${Array.from({ length: k }, (_, i) => (i + 1) * g).join(', ')}.` : `Sama lyhyesti: ${k} kertaa ${g} on ${k * g}. ${k} ryhmää, jokaisessa ${g}.`;
    },
  });
}

// ---------------------------------------------------------------- quotition: how many bags of g?
/** Shared picture: a pile of n things on top, bags of g below. `bags` are full, `p` (0..1) is the
 *  next bag being filled, `over` marks a bag that could not be filled. */
export function bagupFrame(kind: string, n: number, g: number, bags: number, p = 0, over = false, maxBags = Math.ceil(n / g) + 1) {
  const W = 320, S = 18, G = bagGeo(Math.max(maxBags, 3), W);
  const pile = lineLayout(n, W - 20, 60, S).map((q) => ({ x: q.x + 10, y: q.y + 4 }));
  const taken = Math.min(n, bags * g);
  let s = '';
  for (let i = taken + (p > 0 ? Math.min(g, n - taken) : 0); i < n; i++) s += THINGS[kind]!.draw(pile[i]!.x, pile[i]!.y, S);
  const shown = bags + (p > 0 || over ? 1 : 0);
  for (let b = 0; b < shown; b++) {
    const red = over && b === bags;
    s += G.bag(b).replace('fill="#e8d7b0"', `fill="${red ? '#f3c4c0' : '#e8d7b0'}"`);
    const cnt = b < bags ? g : red ? n - taken : 0;
    for (let j = 0; j < cnt; j++) { const q = G.spot(b, j); s += THINGS[kind]!.draw(q.x, q.y, S); }
    if (b < bags) s += `<text x="${G.x0(b) + G.bw / 2}" y="186" text-anchor="middle" font-size="15" font-weight="800" fill="var(--pond)">${b + 1}</text>`;
  }
  if (p > 0) for (let j = 0; j < Math.min(g, n - taken); j++) {
    const f = pile[taken + j]!, q = G.spot(bags, j);
    s += THINGS[kind]!.draw(f.x + (q.x - f.x) * p, f.y + (q.y - f.y) * p - Math.sin(Math.PI * p) * 20, S);
  }
  return s;
}
/** n things are packed g at a time; the bags are counted. */
export function bagupScene(kind: string, n: number, g: number): AnimPaint {
  const q = n / g, ST = 1.3, t0 = 1, fin = t0 + q * ST;
  const st = (t: number) => { const u = Math.max(0, t - t0), b = Math.min(q, Math.floor(u / ST)); return { b, p: b < q && t >= t0 ? ease(u - b * ST, 0, ST * 0.6) : 0 }; };
  return anim({
    dur: fin + 2.4, w: 320, h: 200, label: `${n} pakataan ${g} kerrallaan pusseihin`,
    frame: (t) => { const { b, p } = st(t); return bagupFrame(kind, n, g, b, p, false, q); },
    caption: (t) => {
      const { b } = st(t);
      if (t < t0) return `${Cap(word(n))}. Yhteen pussiin mahtuu ${word(g)}.`;
      if (b < q) return b === 0 ? `${Cap(word(g))} ensimmäiseen pussiin…` : `${b} ${b === 1 ? 'pussi' : 'pussia'}, kasassa vielä ${n - b * g}…`;
      return `Kasa loppui. Pusseja tuli ${word(q)}: ${Array(q).fill(g).join(' + ')} = ${n}.`;
    },
  });
}

// ---------------------------------------------------------------- "k times as many": towers
const TU = 14, TB = 214;
/** n blocks stacked at x; every group of `a` gets its own shade so the copies of Aava's tower show. */
export function stackBlocks(n: number, x: number, a: number, col = 'var(--pond)', alt = '#7fc59a', y0 = TB) {
  return Array.from({ length: n }, (_, i) => `<rect x="${x}" y="${y0 - (i + 1) * TU}" width="40" height="${TU - 2}" rx="3" fill="${Math.floor(i / a) % 2 ? alt : col}"/>`).join('');
}
const bracket = (x: number, i: number, a: number, label: string) => {
  const y1 = TB - i * a * TU, y0 = y1 - a * TU + 2;
  return `<path d="M${x} ${y0} h6 v${a * TU - 4} h-6" fill="none" stroke="currentColor" stroke-width="2"/><text x="${x + 10}" y="${(y0 + y1) / 2 + 5}" font-size="13" font-weight="800" fill="currentColor">${label}</text>`;
};
/** Aava's tower of a blocks is copied k times onto Loikka's tower. */
export function timesTower(a: number, k: number): AnimPaint {
  const W = 260, H = 230, ST = 1.4, t0 = 1, fin = t0 + k * ST;
  const st = (t: number) => { const u = Math.max(0, t - t0), c = Math.min(k, Math.floor(u / ST)); return { c, p: c < k && t >= t0 ? ease(u - c * ST, 0, ST * 0.7) : 0 }; };
  return anim({
    dur: fin + 2.2, w: W, h: H, label: `Aavan ${a} palikan torni kopioidaan ${k} kertaa`,
    frame: (t) => {
      const { c, p } = st(t);
      let s = `<line x1="0" y1="${TB}" x2="${W}" y2="${TB}" stroke="currentColor" opacity=".4"/>` + stackBlocks(a, 30, a, 'var(--sun)', 'var(--sun)') + duck(50, TB + 4 - a * TU - 18, 12) +
        stackBlocks(c * a, 150, a) + (c ? frog(170, TB - c * a * TU - 20, 12) : frog(170, TB - 16, 12));
      for (let i = 0; i < c; i++) s += bracket(194, i, a, `${i + 1}×`);
      if (p > 0) {
        const tx = 150, ty = -c * a * TU, x = 30 + (tx - 30) * p, y = ty * p - Math.sin(Math.PI * p) * 30;
        s += `<g transform="translate(${x - 30} ${y})" opacity=".85">${stackBlocks(a, 30, a, c % 2 ? '#7fc59a' : 'var(--pond)', c % 2 ? '#7fc59a' : 'var(--pond)')}</g>`;
      }
      return s;
    },
    caption: (t) => {
      const { c } = st(t);
      if (t < t0) return `Aavan tornissa on ${word(a)}. Loikan torni on ${word(k)} kertaa niin korkea.`;
      if (c < k) return `${c + 1}. kerta Aavan torni…`;
      return `${Cap(word(k))} kertaa ${word(a)}: ${Array(k).fill(a).join(' + ')} = ${a * k} palikkaa.`;
    },
  });
}
/** The trap side by side: "k more" adds k blocks once, "k times" adds whole towers. */
export function moreVsTimes(a: number, k: number): AnimPaint {
  const W = 300, H = 236, t0 = 0.8, ST = 0.35, nP = k, nT = a * k - a, fin = t0 + Math.max(nP, nT) * ST;
  const grown = (t: number, m: number) => Math.max(0, Math.min(m, Math.floor((t - t0) / ST)));
  return anim({
    dur: fin + 2.6, w: W, h: H, label: `${a} + ${k} ja ${k} × ${a} rinnakkain`,
    frame: (t) => {
      const p = grown(t, nP), q = grown(t, nT);
      return `<line x1="0" y1="${TB}" x2="${W}" y2="${TB}" stroke="currentColor" opacity=".4"/>` +
        stackBlocks(a, 20, a, 'var(--sun)', 'var(--sun)') + `<text x="40" y="232" text-anchor="middle" font-size="13" font-weight="800" fill="currentColor">Aava ${a}</text>` +
        stackBlocks(a, 120, 99, 'var(--sun)', 'var(--sun)') + Array.from({ length: p }, (_, i) => `<rect x="120" y="${TB - (a + i + 1) * TU}" width="40" height="${TU - 2}" rx="3" fill="#d9534f"/>`).join('') +
        `<text x="140" y="232" text-anchor="middle" font-size="13" font-weight="800" fill="currentColor">${a} + ${k} = ${a + p}</text>` +
        stackBlocks(a + q, 220, a) + `<text x="240" y="232" text-anchor="middle" font-size="13" font-weight="800" fill="var(--pond)">${k} × ${a} = ${a + q}</text>`;
    },
    caption: (t) => t < t0 ? `Kaksi eri asiaa: ${k} enemmän ja ${k} kertaa niin paljon.`
      : t < fin ? 'Plus lisää palikat vain kerran. Kertaa lisää kokonaisia torneja.'
        : `${a} + ${k} = ${a + k}, mutta ${k} × ${a} = ${a * k}. "${Cap(word(k))} kertaa niin paljon" ei ole plus.`,
  });
}

// ---------------------------------------------------------------- partition: one to each, round by round
/** n things are given out one at a time to k bags in turn until the pile is empty. */
export function roundRobin(kind: string, n: number, k: number): AnimPaint {
  const W = 320, S = 18, ST = 0.6, t0 = 1, fin = t0 + n * ST, per = n / k, G = bagGeo(Math.max(k, 3), W);
  const pile = lineLayout(n, W - 20, 60, S).map((q) => ({ x: q.x + 10, y: q.y + 4 }));
  const st = (t: number) => { const u = Math.max(0, t - t0), d = Math.min(n, Math.floor(u / ST)); return { d, p: d < n && t >= t0 ? ease(u - d * ST, 0, ST * 0.7) : 0 }; };
  return anim({
    dur: fin + 2.4, w: W, h: 200, label: `${n} jaetaan yksi kerrallaan ${k} pussiin`,
    frame: (t) => {
      const { d, p } = st(t);
      let s = '';
      for (let i = d + (p > 0 ? 1 : 0); i < n; i++) s += THINGS[kind]!.draw(pile[i]!.x, pile[i]!.y, S);
      for (let b = 0; b < k; b++) {
        s += G.bag(b, p > 0 && d % k === b);
        const cnt = Math.floor(d / k) + (b < d % k ? 1 : 0);
        for (let j = 0; j < cnt; j++) { const q = G.spot(b, j); s += THINGS[kind]!.draw(q.x, q.y, S); }
        s += `<text x="${G.x0(b) + G.bw / 2}" y="186" text-anchor="middle" font-size="15" font-weight="800" fill="currentColor">${cnt}</text>`;
      }
      if (p > 0) { const f = pile[d]!, b = d % k, q = G.spot(b, Math.floor(d / k)); s += THINGS[kind]!.draw(f.x + (q.x - f.x) * p, f.y + (q.y - f.y) * p - Math.sin(Math.PI * p) * 20, S); }
      return s;
    },
    caption: (t) => {
      const { d } = st(t);
      if (t < t0) return `${Cap(word(n))} jaetaan ${k} pussiin. Annetaan yksi kerrallaan jokaiseen vuorotellen.`;
      if (d < n) return `Kierros ${Math.floor(d / k) + 1}: yksi jokaiseen…`;
      return `Kasa loppui. Jokaisessa on ${word(per)}: ${n} jaettuna ${k}:lle on ${per}.`;
    },
  });
}

// ---------------------------------------------------------------- hopping along a number line
/** Loikka hops `k` single steps from `from` on a number line (negative k = backwards); each hop
 *  leaves an arc labelled +1 or −1 and the number he lands on is said. */
export function lineHops(from: number, k: number, min: number, max: number, step = 1, labelEvery = 1): AnimPaint {
  const W = 320, H = 120, X = (v: number) => 16 + ((v - min) / (max - min)) * (W - 32), d = Math.sign(k), n = Math.abs(k);
  const HOPT = 1, t0 = 0.8, fin = t0 + n * HOPT;
  const st = (t: number) => { const u = Math.max(0, t - t0), j = Math.min(n, Math.floor(u / HOPT)); return { j, p: j < n && t >= t0 ? ease(u - j * HOPT, 0, HOPT * 0.7) : 0 }; };
  const ticks = Array.from({ length: max - min + 1 }, (_, i) => min + i).map((v) =>
    `<line x1="${X(v)}" y1="${v % labelEvery ? 88 : 84}" x2="${X(v)}" y2="${v % labelEvery ? 94 : 98}" stroke="currentColor"/>` + (v % labelEvery ? '' : `<text x="${X(v)}" y="112" text-anchor="middle" font-size="${(max - min) / labelEvery > 12 ? 9 : 12}" font-weight="700" fill="currentColor">${v}</text>`)).join('');
  return anim({
    dur: fin + 1.8, w: W, h: H, label: `Loikka hyppää ${n} kertaa ${d < 0 ? 'taaksepäin' : 'eteenpäin'} luvusta ${from}`,
    frame: (t) => {
      const { j, p } = st(t);
      let s = `<line x1="8" y1="91" x2="${W - 8}" y2="91" stroke="currentColor" stroke-width="2"/>` + ticks;
      for (let i = 0; i < j; i++) {
        const a = X(from + d * step * i), b = X(from + d * step * (i + 1));
        s += `<path d="M${a} 84 Q${(a + b) / 2} 50 ${b} 84" fill="none" stroke="var(--pond)" stroke-width="2.5"/><text x="${(a + b) / 2}" y="56" text-anchor="middle" font-size="11" font-weight="800" fill="var(--pond)">${d < 0 ? '−' : '+'}${step}</text>`;
      }
      const a = X(from + d * step * j), b = X(from + d * step * Math.min(n, j + 1)), fx = a + (b - a) * p, fy = 70 - Math.sin(Math.PI * p) * 30;
      return s + `<circle cx="${X(from)}" cy="91" r="5" fill="var(--sun)"/>` + frog(fx, fy, 14);
    },
    caption: (t) => {
      const { j } = st(t);
      if (t < t0) return `Loikka on luvussa ${from}. Hän hyppää ${word(n)} kertaa ${d < 0 ? 'taaksepäin' : 'eteenpäin'}.`;
      const seq = Array.from({ length: j + 1 }, (_, i) => from + d * step * i).join(', ');
      return j < n ? seq + '…' : `${seq}. ${Cap(word(n))} hyppyä${step > 1 ? `, joka hypyllä ${step}` : ''}: Loikka on luvussa ${from + d * step * n}.`;
    },
  });
}

/** Numbered stones; arcs with the difference appear one at a time, so the hop length is read off. */
export function diffArcs(vals: number[]): AnimPaint {
  const W = 320, H = 120, n = vals.length, gap = (W - 60) / (n - 1), X = (i: number) => 30 + i * gap, ST = 1.2, t0 = 0.8, fin = t0 + (n - 1) * ST;
  const shown = (t: number) => Math.max(0, Math.min(n - 1, Math.floor((t - t0) / ST) + (t >= t0 ? 1 : 0)));
  return anim({
    dur: fin + 2, w: W, h: H, label: `Jono ${vals.join(', ')}: hyppyjen pituus`,
    frame: (t) => {
      const k = shown(t);
      let s = `<rect x="0" y="80" width="${W}" height="40" fill="#7fb8e0" opacity=".3"/>`;
      vals.forEach((v, i) => { s += `<ellipse cx="${X(i)}" cy="94" rx="22" ry="11" fill="#c9c9c9" stroke="#555" stroke-width="2"/><text x="${X(i)}" y="99" text-anchor="middle" font-size="14" font-weight="800" fill="#222">${v}</text>`; });
      for (let i = 0; i < k; i++) {
        const a = X(i), b = X(i + 1);
        s += `<path d="M${a + 8} 82 Q${(a + b) / 2} 40 ${b - 8} 82" fill="none" stroke="var(--pond)" stroke-width="2.5"/><text x="${(a + b) / 2}" y="50" text-anchor="middle" font-size="14" font-weight="800" fill="var(--pond)">+${vals[i + 1]! - vals[i]!}</text>`;
      }
      return s;
    },
    caption: (t) => {
      const k = shown(t);
      if (!k) return 'Paljonko luku kasvaa kiveltä seuraavalle?';
      const i = k - 1;
      return t < fin ? `${vals[i + 1]} − ${vals[i]} = ${vals[i + 1]! - vals[i]!}` : `Joka hyppy on ${vals[1]! - vals[0]!}.`;
    },
  });
}
/** Loikka hops a at a time and Aava b at a time from 0; stones both land on light up. */
export function twoHoppers(a: number, b: number, max: number): AnimPaint {
  const W = 320, H = 150, X = (v: number) => 14 + (v / max) * (W - 28), ST = 0.9, t0 = 0.8, na = Math.floor(max / a), nb = Math.floor(max / b), n = Math.max(na, nb), fin = t0 + n * ST;
  const pos = (t: number, k: number, m: number) => { const u = Math.max(0, t - t0) / ST, j = Math.min(m, Math.floor(u)); return { j, p: j < m && t >= t0 ? ease(u - j, 0, 0.7) : 0, v: k * j }; };
  return anim({
    dur: fin + 2.4, w: W, h: H, label: `Loikka hyppää ${a} ja Aava ${b} kerrallaan`,
    frame: (t) => {
      const A = pos(t, a, na), B = pos(t, b, nb);
      let s = `<line x1="8" y1="92" x2="${W - 8}" y2="92" stroke="currentColor" stroke-width="2"/>`;
      for (let v = 0; v <= max; v++) {
        const both = v > 0 && v % a === 0 && v % b === 0 && v <= A.v && v <= B.v;
        s += `<line x1="${X(v)}" y1="87" x2="${X(v)}" y2="97" stroke="currentColor"/><text x="${X(v)}" y="112" text-anchor="middle" font-size="10" font-weight="${both ? 900 : 600}" fill="${both ? '#d9534f' : 'currentColor'}">${v}</text>` + (both ? `<circle cx="${X(v)}" cy="92" r="8" fill="none" stroke="#d9534f" stroke-width="3"/>` : '');
      }
      for (let i = 1; i <= A.j; i++) s += `<path d="M${X(a * (i - 1))} 86 Q${X(a * (i - 0.5))} 56 ${X(a * i)} 86" fill="none" stroke="var(--pond)" stroke-width="2"/>`;
      for (let i = 1; i <= B.j; i++) s += `<path d="M${X(b * (i - 1))} 98 Q${X(b * (i - 0.5))} 132 ${X(b * i)} 98" fill="none" stroke="#c98a00" stroke-width="2"/>`;
      const fa = X(A.v + a * A.p), fb = X(B.v + b * B.p);
      return s + frog(fa, 66 - Math.sin(Math.PI * A.p) * 16, 11) + duck(fb, 128 + Math.sin(Math.PI * B.p) * 6, 10);
    },
    caption: (t) => t < t0 ? `Loikka hyppää ${word(a)} kerrallaan (ylhäällä), Aava ${word(b)} kerrallaan (alhaalla).`
      : t < fin ? 'Kummankin kivet: missä he osuvat samaan?' : `Yhteiset kivet: ${Array.from({ length: Math.floor(max / (a * b / gcd(a, b))) }, (_, i) => (i + 1) * a * b / gcd(a, b)).join(', ')}. Ensimmäinen on ${a * b / gcd(a, b)}.`,
  });
}
const gcd = (x: number, y: number): number => (y ? gcd(y, x % y) : x);
/** Things arrive (+) or leave (−) one by one; then the sign appears between the groups and the
 *  sentence is written under them. With `reveal` false the scene stops before the sign. */
export function signScene(kind: string, a: number, b: number, op: '+' | '−', reveal = true): AnimPaint {
  const W = 320, H = reveal ? 170 : 116, S = 24, ST = 0.8, t0 = 1, fin = t0 + b * ST + 0.3, tSign = fin + 0.6, tSent = tSign + 1.2;
  const cell = (i: number, cx: number) => ({ x: cx + ((i % 3) - 1) * S * 1.1, y: 58 + Math.floor(i / 3) * S * 1.05 });
  const L = 80, R = 240;
  const c = op === '+' ? a + b : a - b;
  return anim({
    dur: reveal ? tSent + 3 : fin + 2, w: W, h: H, label: op === '+' ? `${a} ja tulee lisää ${b}` : `${a} ja ${b} otetaan pois`,
    frame: (t) => {
      const k = Math.max(0, Math.min(b, Math.floor((t - t0) / ST))), p = k < b && t >= t0 ? ease(t - t0 - k * ST, 0, ST * 0.75) : 0;
      let s = `<rect x="0" y="34" width="${W}" height="76" rx="14" fill="#7fb8e0" opacity=".18"/>`;
      if (op === '+') {
        for (let i = 0; i < a; i++) { const q = cell(i, L); s += THINGS[kind]!.draw(q.x, q.y, S); }
        for (let i = 0; i < b; i++) {
          const q = cell(i, R);
          if (i < k) s += THINGS[kind]!.draw(q.x, q.y, S);
          else if (i === k && p > 0) s += THINGS[kind]!.draw(W + 20 + (q.x - W - 20) * p, q.y, S);
        }
        s += `<text x="${L}" y="26" text-anchor="middle" font-size="16" font-weight="800" fill="var(--pond)">${a}</text>`;
        if (k > 0) s += `<text x="${R}" y="26" text-anchor="middle" font-size="16" font-weight="800" fill="#c98a00">tulee ${k}</text>`;
      } else {
        for (let i = 0; i < a; i++) {
          const q = cell(i, L + 40), gone = i >= a - b ? i - (a - b) : -1;
          if (gone < 0 || gone > k || (gone === k && p === 0)) s += THINGS[kind]!.draw(q.x, q.y, S);
          else if (gone === k) s += `<g opacity="${1 - p * 0.6}">${THINGS[kind]!.draw(q.x + (W - 30 - q.x) * p, q.y - 20 * p, S)}</g>`;
          else s += `<circle cx="${q.x}" cy="${q.y}" r="${S * 0.45}" fill="none" stroke="#d9534f" stroke-width="2" stroke-dasharray="4 3"/>`;
        }
        s += `<text x="${L + 40}" y="26" text-anchor="middle" font-size="16" font-weight="800" fill="var(--pond)">${a}</text>`;
        if (k > 0) s += `<text x="${W - 40}" y="26" text-anchor="middle" font-size="16" font-weight="800" fill="#d9534f">pois ${k}</text>`;
      }
      if (reveal && t >= tSign) {
        const g = ease(t - tSign, 0, 0.5), sx = op === '+' ? 160 : W - 40;
        s += `<g transform="translate(${sx} 70) scale(${0.3 + 0.7 * g})"><circle r="22" fill="#fff" stroke="${op === '+' ? 'var(--pond)' : '#d9534f'}" stroke-width="3"/><text y="12" text-anchor="middle" font-size="34" font-weight="900" fill="${op === '+' ? 'var(--pond)' : '#d9534f'}">${op}</text></g>`;
      }
      if (reveal && t >= tSent) {
        const toks = [String(a), op, String(b), '=', String(c)], m = Math.min(5, Math.floor((t - tSent) / 0.45) + 1);
        s += `<text x="${W / 2}" y="152" text-anchor="middle" font-size="30" font-weight="900" fill="currentColor">${toks.slice(0, m).join(' ')}</text>`;
      }
      return s;
    },
    caption: (t) => t < t0 ? (op === '+' ? `Aluksi ${word(a)}.` : `Aluksi ${word(a)}.`)
      : t < fin ? (op === '+' ? 'Tulee lisää…' : 'Otetaan pois…')
      : !reveal ? (op === '+' ? `Tuli ${word(b)} lisää.` : `${Cap(word(b))} otettiin pois.`)
      : t < tSent ? (op === '+' ? 'Tuli lisää: plusmerkki +' : 'Otettiin pois: miinusmerkki −')
      : `${a} ${op === '+' ? 'plus' : 'miinus'} ${b} on ${c}.`,
  });
}
/** Loikka's a things (top) and Aava's b things (bottom) are paired one by one; the unpaired ones
 *  are circled and the difference is written as a − b. */
export function pairScene(kind: string, a: number, b: number, reveal: boolean | 'cmp' = true): AnimPaint {
  const W = 320, H = 180, n = Math.max(a, b), gap = Math.min(40, (W - 80) / n), X = (i: number) => 64 + i * gap, ST = 0.6, t0 = 0.9, m = Math.min(a, b), fin = t0 + m * ST, tEnd = fin + 0.8;
  return anim({
    dur: tEnd + 3.2, w: W, h: reveal ? H : 140, label: `${a} ja ${b} pareiksi`,
    frame: (t) => {
      const k = Math.max(0, Math.min(m, Math.floor((t - t0) / ST) + (t >= t0 ? 1 : 0)));
      let s = frog(22, 46, 12) + duck(22, 114, 11);
      for (let i = 0; i < k; i++) s += `<line x1="${X(i)}" y1="60" x2="${X(i)}" y2="100" stroke="var(--pond)" stroke-width="2.5"/>`;
      for (let i = 0; i < a; i++) s += THINGS[kind]!.draw(X(i), 46, 22) + (t >= fin && i >= m ? `<circle cx="${X(i)}" cy="46" r="15" fill="none" stroke="#d9534f" stroke-width="3"/>` : '');
      for (let i = 0; i < b; i++) s += THINGS[kind]!.draw(X(i), 114, 22) + (t >= fin && i >= m ? `<circle cx="${X(i)}" cy="114" r="15" fill="none" stroke="#d9534f" stroke-width="3"/>` : '');
      if (reveal && t >= tEnd) s += `<text x="${W / 2}" y="164" text-anchor="middle" font-size="28" font-weight="900" fill="currentColor">${reveal === 'cmp' ? `${a} ${a > b ? '>' : a < b ? '<' : '='} ${b}` : `${Math.max(a, b)} − ${m} = ${Math.abs(a - b)}`}</text>`;
      return s;
    },
    caption: (t) => t < t0 ? `Loikalla ${word(a)}, Aavalla ${word(b)}. Kummalla on enemmän?` : t < fin ? 'Tehdään pareja…' : t < tEnd ? `Ilman paria jäi ${word(Math.abs(a - b))}.` : reveal === 'cmp' ? `${a > b ? 'Loikalla on enemmän' : 'Aavalla on enemmän'}: ${a} ${a > b ? '>' : '<'} ${b}. Kärki osoittaa pienempää.` : reveal ? `${a > b ? 'Loikalla' : 'Aavalla'} on ${word(Math.abs(a - b))} enemmän. Miinus kertoo eron.` : 'Kummalla on enemmän?',
  });
}

/** A balance: `left` on the left pan, `right` on the right; then `add` stones drop onto the right
 *  pan one by one and the beam settles. Ends with = (level) or ≠ (tipped). */
export function balanceScene(left: number[], right: number[], add: number): AnimPaint {
  const W = 300, H = 250, L = left.reduce((x, y) => x + y, 0), R = right.reduce((x, y) => x + y, 0), ST = 0.8, t0 = 1.4, fin = t0 + add * ST + 0.5, tEnd = fin + 0.6;
  const k = (t: number) => Math.max(0, Math.min(add, Math.floor((t - t0) / ST) + (t >= t0 ? 1 : 0)));
  const sum = (xs: number[]) => xs.join(' + ');
  const tiltAt = (t: number) => {
    const j = k(t), prev = Math.sign(R + Math.max(0, j - 1) - L), cur = Math.sign(R + j - L);
    const p = j > 0 ? Math.min(1, (t - t0 - (j - 1) * ST) / 0.4) : 1;
    return prev + (cur - prev) * (1 - (1 - p) ** 2);
  };
  const ok = R + add === L;
  return anim({
    dur: tEnd + 3, w: W, h: H, label: `Vaaka: ${sum(left)} ja ${sum(right)}`,
    frame: (t) => {
      const j = k(t), stones = (n: number) => Array.from({ length: n }, () => 'kivi');
      let s = balanceBody(stones(L), stones(R + j), tiltAt(t), W);
      s += `<text x="40" y="214" font-size="17" font-weight="800" fill="currentColor">${sum(left)}</text><text x="${W - 40}" y="214" text-anchor="end" font-size="17" font-weight="800" fill="currentColor">${sum(j ? right.concat([j]) : right)}</text>`;
      if (t >= fin) s += `<text x="${W / 2}" y="216" text-anchor="middle" font-size="24" font-weight="900" fill="${ok ? 'var(--pond)' : '#d9534f'}">${ok ? '=' : '≠'}</text>`;
      if (t >= tEnd) s += `<text x="${W / 2}" y="244" text-anchor="middle" font-size="22" font-weight="900" fill="${ok ? 'currentColor' : '#d9534f'}">${sum(left)} ${ok ? '=' : '≠'} ${sum(right.concat([add]))}</text>`;
      return s;
    },
    caption: (t) => t < t0 ? (R < L ? `Vasemmalla ${L}, oikealla ${R}. Vasen puoli painaa enemmän.` : `Vasemmalla ${L}, oikealla ${R}.`)
      : t < fin ? 'Lisätään kiviä oikealle…'
      : ok ? `Vaaka on suorassa: ${sum(left)} on yhtä paljon kuin ${sum(right.concat([add]))}.`
      : `Liikaa! Oikealla on ${R + add}, vasemmalla ${L}. Vaaka kallistuu.`,
  });
}

/** Words are turned into symbols one chunk at a time: each word group gets its symbol under it. */
export function translateScene(chunks: [string, string][]): AnimPaint {
  const W = 320, H = 150, n = chunks.length, ST = 1.3, t0 = 0.8, fin = t0 + n * ST, gap = (W - 20) / n, X = (i: number) => 10 + gap * (i + 0.5);
  const k = (t: number) => Math.max(0, Math.min(n, Math.floor((t - t0) / ST) + (t >= t0 ? 1 : 0)));
  return anim({
    dur: fin + 3, w: W, h: H, label: chunks.map((c) => c[0]).join(' '),
    frame: (t) => {
      const j = k(t);
      let s = '';
      chunks.forEach(([w, sym], i) => {
        const on = i < j, now = i === j - 1;
        s += `<rect x="${X(i) - gap / 2 + 3}" y="8" width="${gap - 6}" height="48" rx="10" fill="${now ? 'color-mix(in srgb, var(--sun) 45%, var(--card))' : 'var(--card)'}" stroke="currentColor" stroke-opacity=".3"/>`;
        const ls = w.split(' ').reduce<string[]>((acc, x) => { const l = acc[acc.length - 1]; if (l !== undefined && (l + ' ' + x).length <= Math.max(9, (gap - 14) / 8)) acc[acc.length - 1] = l + ' ' + x; else acc.push(x); return acc; }, []);
        const fs = Math.min(14, (gap - 14) / (Math.max(...ls.map((x) => x.length)) * 0.64));
        ls.forEach((x, li) => { s += `<text x="${X(i)}" y="${38 - (ls.length - 1) * 7 + li * 14}" text-anchor="middle" font-size="${fs.toFixed(1)}" font-weight="700" fill="currentColor">${x}</text>`; });
        if (on) {
          const p = Math.min(1, (t - t0 - i * ST) / 0.5);
          s += `<path d="M${X(i)} 58 v${12 * p}" stroke="currentColor" stroke-opacity=".4" stroke-width="2"/><text x="${X(i)}" y="${82 + 12 * p}" text-anchor="middle" font-size="30" font-weight="900" fill="var(--pond)" opacity="${p}">${sym}</text>`;
        }
      });
      if (t >= fin + 0.3) s += `<text x="${W / 2}" y="140" text-anchor="middle" font-size="16" font-weight="700" fill="currentColor" opacity=".7">${chunks.map((c) => c[1]).join(' ')}</text>`;
      return s;
    },
    caption: (t) => { const j = k(t); return !j ? 'Sanat muutetaan merkeiksi pala kerrallaan.' : j < n || t < fin ? `"${chunks[j - 1]![0]}" → ${chunks[j - 1]![1]}` : `Merkkikielellä: ${chunks.map((c) => c[1]).join(' ')}`; },
  });
}
/** A ten-frame fills with n things one by one; then the empty cells are counted: n + (10 − n) = 10. */
export function tenFillScene(kind: string, n: number): AnimPaint {
  const W = 300, H = 160, C = 46, x0 = (W - 5 * C) / 2, y0 = 20, ST = 0.45, t0 = 0.6, f1 = t0 + n * ST, ST2 = 0.7, f2 = f1 + 0.5 + (10 - n) * ST2;
  const cell = (i: number) => ({ x: x0 + (i % 5) * C + C / 2, y: y0 + Math.floor(i / 5) * C + C / 2 });
  return anim({
    dur: f2 + 2.6, w: W, h: H, label: `Kympin ruudukko: ${n} ja ${10 - n}`,
    frame: (t) => {
      const k = Math.max(0, Math.min(n, Math.floor((t - t0) / ST) + (t >= t0 ? 1 : 0))), e = t < f1 + 0.5 ? 0 : Math.min(10 - n, Math.floor((t - f1 - 0.5) / ST2) + 1);
      let s = '';
      for (let i = 0; i < 10; i++) { const q = cell(i); s += `<rect x="${q.x - C / 2}" y="${q.y - C / 2}" width="${C}" height="${C}" fill="${i >= n && i - n < e ? 'color-mix(in srgb, var(--sun) 45%, var(--card))' : 'var(--card)'}" stroke="currentColor" stroke-width="2"/>`; }
      for (let i = 0; i < k; i++) { const q = cell(i); s += THINGS[kind]!.draw(q.x, q.y, 28); }
      for (let i = 0; i < e; i++) { const q = cell(n + i); s += `<text x="${q.x}" y="${q.y + 7}" text-anchor="middle" font-size="20" font-weight="900" fill="#c98a00">${i + 1}</text>`; }
      if (t >= f2) s += `<text x="${W / 2}" y="150" text-anchor="middle" font-size="22" font-weight="900" fill="currentColor">${n} + ${10 - n} = 10</text>`;
      return s;
    },
    caption: (t) => t < f1 ? `${Cap(word(n))} ruutuun tulee ${THINGS[kind]!.one}.` : t < f2 ? 'Lasketaan tyhjät ruudut…' : `Tyhjiä on ${word(10 - n)}: ${n} ja ${10 - n} on yhdessä kymmenen.`,
  });
}
/** n things in a row; a divider slides to make each split a + b in turn. */
export function splitScene(kind: string, n: number, splits: number[]): AnimPaint {
  const W = 320, H = 130, S = 26, gap = Math.min(30, (W - 40) / (n + 1)), ST = 2.2, t0 = 0.6;
  const fin = t0 + splits.length * ST;
  const at = (t: number) => { const j = Math.max(0, Math.min(splits.length - 1, Math.floor((t - t0) / ST))); const prev = j ? splits[j - 1]! : n; const p = t < t0 ? 0 : ease(t - t0 - j * ST, 0, 0.7); return { j, a: prev + (splits[j]! - prev) * p, p }; };
  return anim({
    dur: fin + 1.5, w: W, h: H, label: `${n} kahteen osaan`,
    frame: (t) => {
      const { j, a } = at(t), split = Math.round(a);
      const L0 = W / 2 - ((n - 1) * gap) / 2 - gap * 0.4, X = (i: number) => L0 + i * gap + (i >= a ? gap * 0.8 : 0);
      let s = '';
      for (let i = 0; i < n; i++) s += THINGS[kind]!.draw(X(i), 50, S) + `<circle cx="${X(i)}" cy="50" r="${gap * 0.46}" fill="none" stroke="${i < split ? 'var(--pond)' : '#c98a00'}" stroke-width="2.5"/>`;
      const dx = L0 + (a - 0.5) * gap + gap * 0.4;
      s += `<line x1="${dx}" y1="26" x2="${dx}" y2="74" stroke="#d9534f" stroke-width="3" stroke-dasharray="5 4"/>`;
      if (t >= t0) s += `<text x="${W / 2}" y="112" text-anchor="middle" font-size="24" font-weight="900" fill="currentColor">${n} = <tspan fill="var(--pond)">${splits[j]}</tspan> + <tspan fill="#c98a00">${n - splits[j]!}</tspan></text>`;
      return s;
    },
    caption: (t) => t < t0 ? `${Cap(word(n))}: jaetaan kahteen osaan.` : (() => { const s0 = splits[at(t).j]!; return `${Cap(word(s0))} ja ${word(n - s0)}.`; })(),
  });
}
/** n things; a cup comes down over the last n − a; the learner sees a and the total, then the cup lifts. */
export function cupScene(kind: string, n: number, a: number, reveal = true): AnimPaint {
  const W = 320, H = 150, S = 26, gap = Math.min(30, (W - 40) / n), X = (i: number) => W / 2 - ((n - 1) * gap) / 2 + i * gap;
  const hid = n - a, cx = (X(a) + X(n - 1)) / 2, cw = (hid - 1) * gap + S * 1.15, tDown = 1.6, tAsk = 3, tUp = reveal ? 6 : 1e9;
  return anim({
    dur: reveal ? tUp + 3 : tAsk + 2, w: W, h: H, label: `${n} simpukkaa, kupin alla osa`,
    frame: (t) => {
      let s = '';
      for (let i = 0; i < n; i++) s += THINGS[kind]!.draw(X(i), 70, S);
      const y = t < 0.8 ? -60 : t < tDown ? -60 + 100 * ease(t - 0.8, 0, 0.8) : t < tUp ? 40 : 40 - 100 * ease(t - tUp, 0, 0.8);
      s += `<path d="M${cx - cw / 2} ${y + 46} L${cx - cw / 2 + 8} ${y} H${cx + cw / 2 - 8} L${cx + cw / 2} ${y + 46} Z" fill="#b5651d" stroke="#6b3a10" stroke-width="3"/>`;
      if (t >= tAsk && t < tUp) s += `<text x="${cx}" y="${y + 32}" text-anchor="middle" font-size="22" font-weight="900" fill="#fff">?</text>`;
      if (t >= tAsk) s += `<text x="${W / 2}" y="136" text-anchor="middle" font-size="20" font-weight="900" fill="currentColor">${n} = ${a} + ${t >= tUp + 0.8 ? hid : '□'}</text>`;
      return s;
    },
    caption: (t) => t < 0.8 ? `Simpukoita on ${word(n)}.` : t < tAsk ? 'Kuppi peittää osan.' : t < tUp ? `Näkyvissä ${word(a)}. ${Cap(word(a))} ja montako on ${word(n)}?` : `Kupin alla oli ${word(hid)}.`,
  });
}
/** A number family with things: a and b join into c, then b leaves (c − b = a), then a leaves
 *  (c − a = b). The four sentences collect under the picture. */
export function familyScene(kind: string, a: number, b: number): AnimPaint {
  const W = 320, H = 200, c = a + b, S = 22, gap = Math.min(26, (W - 40) / c), L0 = W / 2 - ((c - 1) * gap) / 2;
  const P = [0.6, 2.4, 4.6, 6.8, 9], lines = [`${a} + ${b} = ${c}`, `${b} + ${a} = ${c}`, `${c} − ${b} = ${a}`, `${c} − ${a} = ${b}`];
  return anim({
    dur: P[4]! + 3, w: W, h: H, label: `Lukuperhe ${a}, ${b}, ${c}`,
    frame: (t) => {
      const ph = P.filter((x) => t >= x).length; // 0..5
      const join = ph < 1 ? 0 : ease(t - P[0]!, 0, 1);
      const outB = ph >= 3 && ph < 4 ? ease(t - P[2]!, 0, 0.9) : 0, outA = ph >= 4 && ph < 5 ? ease(t - P[3]!, 0, 0.9) : 0;
      let s = '';
      for (let i = 0; i < c; i++) {
        const isA = i < a, home = isA ? 30 + i * gap * 0.9 : W - 30 - (c - 1 - i) * gap * 0.9, x = home + (L0 + i * gap - home) * join;
        const lift = isA ? outA : outB;
        s += `<g opacity="${1 - lift * 0.75}">${THINGS[kind]!.draw(x, 50 - lift * 26, S)}</g><circle cx="${x}" cy="${50 - lift * 26}" r="${gap * 0.46}" fill="none" stroke="${isA ? 'var(--pond)' : '#c98a00'}" stroke-width="2.5"/>`;
      }
      const shown = Math.min(4, ph >= 5 ? 4 : ph >= 4 ? 4 : ph >= 3 ? 3 : ph >= 2 ? 2 : ph >= 1 ? 1 : 0);
      lines.slice(0, shown).forEach((l, i) => { s += `<text x="${i % 2 ? 236 : 84}" y="${112 + Math.floor(i / 2) * 36}" text-anchor="middle" font-size="22" font-weight="900" fill="${i < 2 ? 'var(--pond)' : '#c98a00'}">${l}</text>`; });
      s += `<text x="${W / 2}" y="190" text-anchor="middle" font-size="14" font-weight="700" fill="currentColor" opacity=".7">Osat ${a} ja ${b}, koko ${c}</text>`;
      return s;
    },
    caption: (t) => {
      const ph = P.filter((x) => t >= x).length;
      return ph <= 1 ? `${Cap(word(a))} ja ${word(b)} tulevat yhteen: ${c}.` : ph === 2 ? 'Järjestyksen voi vaihtaa.' : ph === 3 ? `Otetaan ${word(b)} pois: jää ${word(a)}.` : `Otetaan ${word(a)} pois: jää ${word(b)}. Neljä laskua samasta perheestä.`;
    },
  });
}

/** Race on two number lines: Loikka starts from the smaller number, Aava from the bigger.
 *  Both land on the same stone, but Aava needs far fewer hops. */
export function bigFirstScene(small: number, big: number, max = 10): AnimPaint {
  const W = 320, H = 196, X = (v: number) => 16 + (v / max) * (W - 32), HOPT = 0.75, t0 = 1, c = small + big;
  const fin = t0 + big * HOPT;
  const pos = (t: number, from: number, n: number) => { const u = Math.max(0, t - t0), j = Math.min(n, Math.floor(u / HOPT)), p = j < n && t >= t0 ? ease(u - j * HOPT, 0, HOPT * 0.7) : 0; return { j, x: X(from + j) + (X(from + Math.min(n, j + 1)) - X(from + j)) * p, lift: Math.sin(Math.PI * p) * 22 }; };
  const line = (y: number, from: number, j: number, col: string) => {
    let s = `<line x1="8" y1="${y}" x2="${W - 8}" y2="${y}" stroke="currentColor" stroke-width="2"/>`;
    for (let v = 0; v <= max; v++) s += `<line x1="${X(v)}" y1="${y - 5}" x2="${X(v)}" y2="${y + 5}" stroke="currentColor"/><text x="${X(v)}" y="${y + 18}" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor">${v}</text>`;
    for (let i = 0; i < j; i++) { const a = X(from + i), b = X(from + i + 1); s += `<path d="M${a} ${y - 6} Q${(a + b) / 2} ${y - 28} ${b} ${y - 6}" fill="none" stroke="${col}" stroke-width="2.5"/>`; }
    return s + `<circle cx="${X(from)}" cy="${y}" r="5" fill="var(--sun)"/>`;
  };
  return anim({
    dur: fin + 3, w: W, h: H, label: `${small} + ${big}: aloitus pienemmästä tai isommasta`,
    frame: (t) => {
      const A = pos(t, small, big), B = pos(t, big, small);
      let s = line(66, small, A.j, 'var(--pond)') + line(146, big, B.j, '#c98a00');
      s += frog(A.x, 46 - A.lift, 13) + duck(B.x, 126 - B.lift, 12);
      s += `<text x="10" y="18" font-size="12" font-weight="800" fill="var(--pond)">Loikka: ${small} + ${big} → ${A.j} hyppyä</text>`;
      s += `<text x="10" y="102" font-size="12" font-weight="800" fill="#c98a00">Aava: ${big} + ${small} → ${B.j} hyppyä${B.j === small && t > t0 + small * HOPT ? ' ✓ valmis!' : ''}</text>`;
      if (t > fin + 0.3) s += `<text x="${W / 2}" y="190" text-anchor="middle" font-size="18" font-weight="900" fill="currentColor" opacity="${Math.min(1, (t - fin - 0.3) * 2)}">${small} + ${big} = ${big} + ${small} = ${c}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < t0) return `Kumpi pääsee nopeammin? Loikka aloittaa luvusta ${small}, Aava luvusta ${big}.`;
      if (t < t0 + small * HOPT + 0.2) return 'Molemmat hyppäävät…';
      if (t < fin) return `Aava on jo perillä ${word(small)} hypyllä. Loikka hyppää vielä…`;
      return `Sama vastaus ${c}, mutta isommasta aloittaen riittää ${word(small)} hyppyä.`;
    },
  });
}

/** Mirror doubles: each thing on the left gets its twin on the right. With `near`, one more joins. */
export function doubleScene(kind: string, a: number, near = false, reveal = true): AnimPaint {
  const W = 320, H = 170, S = 22, G = 24, ST = 0.8, t0 = 0.8, fin = t0 + a * ST + 0.3, t1 = fin + 1.6;
  const L = (j: number) => W / 2 - 22 - j * G, R = (j: number) => W / 2 + 22 + j * G;
  return anim({
    dur: (near ? t1 + 1.2 : fin) + 2.4, w: W, h: H, label: near ? `${a} + ${a + 1}: tupla ja yksi lisää` : `Tupla ${a} + ${a}`,
    frame: (t) => {
      const k = Math.max(0, Math.min(a, Math.floor((t - t0) / ST) + (t >= t0 ? 1 : 0)));
      let s = `<line x1="${W / 2}" y1="20" x2="${W / 2}" y2="84" stroke="#7fb3d5" stroke-width="3" stroke-dasharray="5 4"/>`;
      for (let j = 0; j < k; j++) {
        const p = j === k - 1 ? ease(t - t0 - j * ST, 0, 0.5) : 1;
        s += THINGS[kind]!.draw(L(j), 52, S) + `<g opacity="${p}">${THINGS[kind]!.draw(R(j), 52, S)}</g>`;
        s += `<text x="${L(j)}" y="${30}" text-anchor="middle" font-size="10" font-weight="800" fill="var(--pond)">${j + 1}</text><text x="${R(j)}" y="${30}" text-anchor="middle" font-size="10" font-weight="800" fill="var(--pond)" opacity="${p}">${j + 1}</text>`;
      }
      if (t > fin) s += `<text x="${W / 2}" y="124" text-anchor="middle" font-size="26" font-weight="900" fill="var(--pond)" opacity="${Math.min(1, (t - fin) * 2)}">${a} + ${a} = ${2 * a}</text>`;
      if (near && t > t1) {
        const p = ease(t - t1, 0, 0.6);
        s += `<g transform="translate(0 ${-(1 - p) * 30})" opacity="${p}">${THINGS[kind]!.draw(R(a), 52, S)}<circle cx="${R(a)}" cy="52" r="14" fill="none" stroke="#c98a00" stroke-width="2.5"/></g><text x="${R(a)}" y="30" text-anchor="middle" font-size="12" font-weight="900" fill="#c98a00" opacity="${p}">+1</text>`;
        if (reveal && t > t1 + 1) s += `<text x="${W / 2}" y="158" text-anchor="middle" font-size="22" font-weight="900" fill="#c98a00" opacity="${Math.min(1, (t - t1 - 1) * 2)}">${a} + ${a + 1} = ${2 * a + 1}</text>`;
      }
      return s;
    },
    caption: (t) => {
      const k = Math.max(0, Math.min(a, Math.floor((t - t0) / ST) + (t >= t0 ? 1 : 0)));
      if (t < t0) return 'Peili tekee jokaiselle simpukalle kaksosen.';
      if (t < fin) return `${Cap(word(k))} paria`;
      if (!near || t < t1) return `Tupla: ${word(a)} ja ${word(a)} on ${word(2 * a)}.`;
      return reveal ? `Yksi lisää: ${a} + ${a + 1} on tupla ja yksi, ${2 * a + 1}.` : `Ja vielä yksi lisää. Montako yhteensä?`;
    },
  });
}

/** Subtraction as counting up: Loikka sits on b and hops to c; the hops are numbered.
 *  The hop count is the answer to c − b. With `reveal = false` the hops are not counted. */
export function countUpScene(b: number, c: number, reveal = true, max = 10): AnimPaint {
  const W = 320, H = 160, X = (v: number) => 16 + (v / max) * (W - 32), HOPT = 0.9, t0 = 1.4, n = c - b, fin = t0 + n * HOPT;
  const st = (t: number) => { const u = Math.max(0, t - t0), j = Math.min(n, Math.floor(u / HOPT)); return { j, p: j < n && t >= t0 ? ease(u - j * HOPT, 0, HOPT * 0.7) : 0 }; };
  return anim({
    dur: fin + 2.6, w: W, h: H, label: `${c} − ${b}: ajattele ${b} + ? = ${c}`,
    frame: (t) => {
      const { j, p } = st(t);
      let s = `<text x="${W / 2}" y="22" text-anchor="middle" font-size="20" font-weight="900" fill="currentColor">${c} − ${b} = ?  →  ${b} + ? = ${c}</text>`;
      s += `<line x1="8" y1="104" x2="${W - 8}" y2="104" stroke="currentColor" stroke-width="2"/>`;
      for (let v = 0; v <= max; v++) s += `<line x1="${X(v)}" y1="98" x2="${X(v)}" y2="110" stroke="currentColor"/><text x="${X(v)}" y="126" text-anchor="middle" font-size="12" font-weight="700" fill="${v === c ? '#c98a00' : 'currentColor'}">${v}</text>`;
      s += `<circle cx="${X(c)}" cy="104" r="9" fill="none" stroke="#c98a00" stroke-width="3"/><circle cx="${X(b)}" cy="104" r="5" fill="var(--sun)"/>`;
      for (let i = 0; i < j; i++) {
        const a = X(b + i), e = X(b + i + 1);
        s += `<path d="M${a} 97 Q${(a + e) / 2} 64 ${e} 97" fill="none" stroke="var(--pond)" stroke-width="2.5"/>` + (reveal ? `<text x="${(a + e) / 2}" y="68" text-anchor="middle" font-size="13" font-weight="900" fill="#c98a00">${i + 1}</text>` : '');
      }
      const a = X(b + j), e = X(b + Math.min(n, j + 1));
      s += frog(a + (e - a) * p, 84 - Math.sin(Math.PI * p) * 30, 13);
      if (reveal && t > fin + 0.3) s += `<text x="${W / 2}" y="152" text-anchor="middle" font-size="16" font-weight="900" fill="var(--pond)" opacity="${Math.min(1, (t - fin - 0.3) * 2)}">${b} + ${n} = ${c}, joten ${c} − ${b} = ${n}</text>`;
      return s;
    },
    caption: (t) => {
      const { j } = st(t);
      if (t < t0) return `${Cap(word(c))} miinus ${word(b)}. Ajattele: ${word(b)} ja montako on ${word(c)}?`;
      if (!reveal) return j < n ? 'Loikka hyppää kohti maalia…' : `Loikka on maalissa ${c}. Montako hyppyä?`;
      if (j < n) return j ? `${Cap(word(j))}…` : 'Lasketaan hypyt…';
      return `${Cap(word(n))} hyppyä. ${b} ja ${n} on ${c}, joten ${c} − ${b} = ${n}.`;
    },
  });
}

/** Bridging ten: a things wait in the first ten-frame, b things fly in one by one.
 *  The first frame fills to ten (pause), the rest spill into the second frame. */
export function bridgeScene(kind: string, a: number, b: number, reveal = true): AnimPaint {
  const W = 320, C = 26, Y = 34, F = [24, 166], ST = 0.7, t0 = 1, fill = Math.max(0, 10 - a), rest = b - fill, sum = a + b;
  const PAUSE = 1.2, at = (j: number) => t0 + j * ST + (j >= fill ? PAUSE : 0), fin = at(b - 1) + ST + 0.3;
  const H = reveal ? 168 : 150;
  const cell = (i: number) => { const f = i < 10 ? 0 : 1, k = i % 10; return { x: F[f]! + (k % 5) * C + C / 2, y: Y + Math.floor(k / 5) * C + C / 2 }; };
  const park = (j: number) => ({ x: W / 2 - ((b - 1) * 22) / 2 + j * 22, y: 130 });
  const arrived = (t: number) => { let k = 0; while (k < b && t >= at(k) + ST * 0.7) k++; return k; };
  return anim({
    dur: fin + 2.6, w: W, h: H, label: `${a} + ${b} kympin yli`,
    frame: (t) => {
      let s = '';
      for (const f of [0, 1]) { const x0 = F[f]!; s += `<rect x="${x0}" y="${Y}" width="${5 * C}" height="${2 * C}" fill="#fffdf4" stroke="#9c8b6a" stroke-width="2"/>`; for (let c = 1; c < 5; c++) s += `<line x1="${x0 + c * C}" y1="${Y}" x2="${x0 + c * C}" y2="${Y + 2 * C}" stroke="#cfc3a6"/>`; s += `<line x1="${x0}" y1="${Y + C}" x2="${x0 + 5 * C}" y2="${Y + C}" stroke="#cfc3a6"/>`; }
      for (let i = 0; i < a; i++) { const q = cell(i); s += THINGS[kind]!.draw(q.x, q.y, C * 0.8); }
      for (let j = 0; j < b; j++) {
        const p = ease(t - at(j), 0, ST * 0.7), from = park(j), to = cell(a + j);
        const x = from.x + (to.x - from.x) * p, y = from.y + (to.y - from.y) * p - Math.sin(Math.PI * p) * 20;
        s += `<g>${THINGS[kind]!.draw(x, y, C * 0.8)}</g>` + (p >= 1 ? `<rect x="${to.x - C / 2 + 2}" y="${to.y - C / 2 + 2}" width="${C - 4}" height="${C - 4}" fill="none" stroke="#c98a00" stroke-width="1.6" rx="4"/>` : '');
      }
      const k = arrived(t);
      if (k >= fill && fill > 0) s += `<rect x="${F[0]! - 4}" y="${Y - 4}" width="${5 * C + 8}" height="${2 * C + 8}" fill="none" stroke="var(--pond)" stroke-width="3" rx="6"/><text x="${F[0]! + 2.5 * C}" y="${Y - 10}" text-anchor="middle" font-size="13" font-weight="900" fill="var(--pond)">10 ✓</text>`;
      if (k > fill) s += `<text x="${F[1]! + 2.5 * C}" y="${Y - 10}" text-anchor="middle" font-size="13" font-weight="900" fill="#c98a00">${k - fill}</text>`;
      s += `<text x="${W / 2}" y="${Y + 2 * C + 22}" text-anchor="middle" font-size="15" font-weight="800" fill="currentColor">${a} + ${b}${k >= fill ? ` = ${a} + ${fill} + ${rest}` : ''}</text>`;
      if (reveal && t > fin) s += `<text x="${W / 2}" y="150" text-anchor="middle" font-size="24" font-weight="900" fill="var(--pond)" opacity="${Math.min(1, (t - fin) * 2)}">10 + ${rest} = ${sum}</text>`;
      return s;
    },
    caption: (t) => {
      const k = arrived(t);
      if (t < t0) return `${Cap(word(a))} on jo ruudukossa. ${Cap(word(b))} tulee lisää.`;
      if (k < fill) return `Täytetään kymppi: ${a + k}…`;
      if (k === fill && t < at(fill)) return `Kymppi täynnä! ${a} ja ${word(fill)} on kymmenen. Tulijoista on vielä ${word(rest)} jäljellä.`;
      if (k < b) return `Loput seuraavaan ruudukkoon: ${k - fill}…`;
      return reveal ? `Kymmenen ja ${word(rest)} on ${sum}.` : 'Montako yhteensä?';
    },
  });
}

/** Big labelled jumps on a number line, one after another; landmark (e.g. 10) is circled. */
export function jumpsScene(min: number, max: number, start: number, steps: number[], landmark?: number, hide = false): AnimPaint {
  const W = 320, H = 130, X = (v: number) => 16 + ((v - min) / (max - min)) * (W - 32), JT = 1.5, t0 = 1;
  const pts = steps.reduce<number[]>((acc, d) => [...acc, acc[acc.length - 1]! + d], [start]), n = steps.length, fin = t0 + n * JT;
  const every = max - min > 12 ? 2 : 1;
  return anim({
    dur: fin + 2.2, w: W, h: H, label: hide ? `Kaksi hyppyä luvusta ${start}` : `Hypyt ${steps.map((d) => (d > 0 ? '+' : '−') + Math.abs(d)).join(' ')} luvusta ${start}`,
    frame: (t) => {
      const u = Math.max(0, t - t0), j = Math.min(n, Math.floor(u / JT)), p = j < n && t >= t0 ? ease(u - j * JT, 0, JT * 0.7) : 0;
      let s = `<line x1="8" y1="96" x2="${W - 8}" y2="96" stroke="currentColor" stroke-width="2"/>`;
      for (let v = min; v <= max; v++) s += `<line x1="${X(v)}" y1="${v % 5 ? 92 : 88}" x2="${X(v)}" y2="${v % 5 ? 100 : 104}" stroke="currentColor"/>` + ((v - min) % every && v !== landmark ? '' : `<text x="${X(v)}" y="120" text-anchor="middle" font-size="11" font-weight="${v === landmark ? 900 : 700}" fill="${v === landmark ? 'var(--pond)' : 'currentColor'}">${v}</text>`);
      if (landmark !== undefined) s += `<circle cx="${X(landmark)}" cy="96" r="8" fill="none" stroke="var(--pond)" stroke-width="2.5"/>`;
      s += `<circle cx="${X(start)}" cy="96" r="5" fill="var(--sun)"/>`;
      const draw = (i: number, q: number) => {
        const a = X(pts[i]!), b = X(pts[i + 1]!), m = (a + b) / 2, hgt = Math.min(62, 28 + Math.abs(b - a) * 0.25);
        const col = i ? '#c98a00' : 'var(--pond)', d = steps[i]!;
        const path = `M${a} 90 Q${m} ${90 - hgt * 2} ${b} 90`;
        return `<path d="${path}" fill="none" stroke="${col}" stroke-width="3" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1 - q}"/>` + (q > 0.6 && !hide ? `<text x="${m}" y="${90 - hgt - 6}" text-anchor="middle" font-size="14" font-weight="900" fill="${col}">${d > 0 ? '+' : '−'}${Math.abs(d)}</text>` : '');
      };
      for (let i = 0; i < j; i++) s += draw(i, 1);
      if (p > 0) s += draw(j, p);
      const xa = X(pts[j]!), xb = X(pts[Math.min(n, j + 1)]!);
      return s + frog(xa + (xb - xa) * p, 76 - Math.sin(Math.PI * p) * 12, 12);
    },
    caption: (t) => {
      const j = Math.min(n, Math.max(0, Math.floor((t - t0) / JT)));
      if (t < t0) return `Loikka on luvussa ${start}.`;
      const d = steps[Math.min(n - 1, j)]!;
      if (hide) return j < n ? (pts[j + 1] === landmark ? 'Ensin tasakymppiin…' : 'Sitten loput…') : 'Montako oli kumpikin hyppy?';
      if (j < n) return `${d > 0 ? 'Hyppy eteenpäin' : 'Hyppy taaksepäin'} ${Math.abs(d)}: luvusta ${pts[j]} lukuun ${pts[j + 1]}${pts[j + 1] === landmark ? ' – tasakymppi!' : '.'}`;
      return `Perillä luvussa ${pts[n]}.`;
    },
  });
}

/** Subtracting across ten: a full ten-frame plus (a − 10) loose ones; b things fly away one by one.
 *  First the loose ones go (pause at ten), then the rest leave the full frame. */
export function bridgeDownScene(kind: string, a: number, b: number, reveal = true): AnimPaint {
  const W = 320, C = 26, Y = 34, F = [24, 166], ST = 0.7, t0 = 1, o = a - 10, first = Math.min(o, b), rest = b - first, left = a - b;
  const PAUSE = rest > 0 ? 1.2 : 0, at = (j: number) => t0 + j * ST + (j >= first ? PAUSE : 0), fin = at(b - 1) + ST + 0.3;
  const H = reveal ? 168 : 150;
  const cell = (i: number) => { const f = i < 10 ? 0 : 1, k = i % 10; return { x: F[f]! + (k % 5) * C + C / 2, y: Y + Math.floor(k / 5) * C + C / 2 }; };
  const gone = (t: number) => { let k = 0; while (k < b && t >= at(k) + ST * 0.7) k++; return k; };
  return anim({
    dur: fin + 2.6, w: W, h: H, label: `${a} − ${b} kympin ali`,
    frame: (t) => {
      let s = '';
      for (const f of [0, 1]) { const x0 = F[f]!; s += `<rect x="${x0}" y="${Y}" width="${5 * C}" height="${2 * C}" fill="#fffdf4" stroke="#9c8b6a" stroke-width="2"/>`; for (let c = 1; c < 5; c++) s += `<line x1="${x0 + c * C}" y1="${Y}" x2="${x0 + c * C}" y2="${Y + 2 * C}" stroke="#cfc3a6"/>`; s += `<line x1="${x0}" y1="${Y + C}" x2="${x0 + 5 * C}" y2="${Y + C}" stroke="#cfc3a6"/>`; }
      for (let i = 0; i < a; i++) {
        const j = a - 1 - i; // the j-th to leave (from the end)
        const q = cell(i);
        if (j >= b) { s += THINGS[kind]!.draw(q.x, q.y, C * 0.8); continue; }
        const p = ease(t - at(j), 0, ST * 0.7);
        if (p >= 1) { s += `<line x1="${q.x - 8}" y1="${q.y - 8}" x2="${q.x + 8}" y2="${q.y + 8}" stroke="#d0574b" stroke-width="2" opacity=".5"/>`; continue; }
        s += `<g opacity="${1 - p}">${THINGS[kind]!.draw(q.x + p * 40, q.y + p * 90, C * 0.8)}</g>`;
      }
      const k = gone(t);
      if (k >= first && rest > 0) s += `<text x="${F[0]! + 2.5 * C}" y="${Y - 10}" text-anchor="middle" font-size="13" font-weight="900" fill="var(--pond)">tasan 10!</text>`;
      s += `<text x="${W / 2}" y="${Y + 2 * C + 22}" text-anchor="middle" font-size="15" font-weight="800" fill="currentColor">${a} − ${b}${k >= first && rest > 0 ? ` = ${a} − ${first} − ${rest}` : ''}</text>`;
      if (reveal && t > fin) s += `<text x="${W / 2}" y="150" text-anchor="middle" font-size="24" font-weight="900" fill="var(--pond)" opacity="${Math.min(1, (t - fin) * 2)}">${rest > 0 ? `10 − ${rest} = ${left}` : `${a} − ${b} = ${left}`}</text>`;
      return s;
    },
    caption: (t) => {
      const k = gone(t);
      if (t < t0) return `${Cap(word(a))}: täysi kymppi ja ${word(o)}. ${Cap(word(b))} lähtee pois.`;
      if (k < first) return `Ensin irralliset pois: ${k}…`;
      if (rest > 0 && k === first && t < at(first)) return `Tasan kymmenen! ${Cap(word(first))} on lähtenyt, vielä ${word(rest)} lähtee.`;
      if (k < b) return `Kympistä pois: ${k - first}…`;
      return reveal ? `Jäljellä ${word(left)}.` : 'Montako jäi?';
    },
  });
}

/** Reeds appear one by one and are counted; every tenth one triggers tying: the ten slide together
 *  and a red band binds them into one bundle. Leftovers stay loose. */
export function bundleScene(n: number, reveal = true): AnimPaint {
  const W = 320, H = 170, RT = 0.42, TIE = 1.6, t0 = 0.8, Y = 30, LEN = 84;
  const appear: number[] = []; let tt = t0;
  for (let i = 0; i < n; i++) { appear.push(tt); tt += RT; if ((i + 1) % 10 === 0) tt += TIE; }
  const tieAt = (b: number) => appear[b * 10 + 9]! + RT; // start of tie phase of bundle b
  const fin = tt + 0.3, tens = Math.floor(n / 10);
  const bx = (b: number) => 26 + b * 44;
  const looseX = (tiedSoFar: number, j: number) => bx(tiedSoFar) + 30 + j * 12;
  const reedS = (x: number, y: number, len: number, col = '#8fae5d') => `<rect x="${x - 2}" y="${y}" width="4" height="${len}" rx="2" fill="${col}"/><ellipse cx="${x}" cy="${y}" rx="3" ry="6" fill="#8a5a33"/>`;
  return anim({
    dur: fin + 2.4, w: W, h: H, label: `${n} kaislaa niputetaan kymmenittäin`,
    frame: (t) => {
      let s = '';
      const done = Array.from({ length: tens }, (_, b) => t >= tieAt(b)).filter(Boolean).length; // bundles whose tying started
      for (let b = 0; b < done; b++) {
        const p = ease(t - tieAt(b), 0, 0.8), from0 = b; // this group was laid out after b earlier bundles
        for (let k = 0; k < 10; k++) {
          const fx = looseX(from0, k), tx = bx(b) - 9 + (k % 5) * 4.4 + (k > 4 ? 2 : 0);
          s += reedS(fx + (tx - fx) * p, Y + (k > 4 ? 3 * p : 0), LEN);
        }
        if (t >= tieAt(b) + 0.8) s += `<rect x="${bx(b) - 11}" y="${Y + 40}" width="26" height="9" rx="3" fill="var(--red)" opacity="${Math.min(1, (t - tieAt(b) - 0.8) * 3)}"/><text x="${bx(b) + 2}" y="${Y + LEN + 22}" text-anchor="middle" font-size="12" font-weight="900" fill="var(--red)">10</text>`;
      }
      for (let i = done * 10; i < n; i++) {
        if (t < appear[i]!) break;
        const j = i - done * 10, p = ease(t - appear[i]!, 0, 0.25);
        s += `<g opacity="${p}">${reedS(looseX(done, j), Y - (1 - p) * 14, LEN)}</g><text x="${looseX(done, j)}" y="${Y + LEN + 18}" text-anchor="middle" font-size="10" font-weight="800" fill="var(--pond)" opacity="${p}">${j + 1}</text>`;
      }
      if (reveal && t > fin) s += `<text x="${W / 2}" y="160" text-anchor="middle" font-size="20" font-weight="900" fill="currentColor" opacity="${Math.min(1, (t - fin) * 2)}">${n} = ${[...Array(tens).fill(10), ...(n % 10 ? [n % 10] : [])].join(' + ')}</text>`;
      return s;
    },
    caption: (t) => {
      const shown = appear.filter((a) => t >= a).length, done = Array.from({ length: tens }, (_, b) => t >= tieAt(b)).filter(Boolean).length;
      if (t < t0) return 'Lasketaan kaislat yksi kerrallaan.';
      if (done && t < tieAt(done - 1) + TIE - 0.2) return reveal ? `Kymmenen! Ne sidotaan yhdeksi nipuksi. Nippuja: ${done}.` : 'Kymmenen! Ne sidotaan nipuksi.';
      if (shown < n) return `${shown - done * 10}…`;
      const o = n - tens * 10;
      if (!reveal) return 'Montako nippua ja montako irrallista?';
      return `${tens ? `${Cap(word(tens))} ${tens === 1 ? 'nippu' : 'nippua'}` : 'Ei nippua'}${o ? ` ja ${word(o)} irrallista` : ''}.`;
    },
  });
}

const reedOne = (x: number, y: number, len: number) => `<rect x="${x - 2}" y="${y}" width="4" height="${len}" rx="2" fill="#8fae5d"/><ellipse cx="${x}" cy="${y}" rx="3" ry="6" fill="#8a5a33"/>`;
const reedBundle = (x: number, y: number, len: number) => Array.from({ length: 10 }, (_, k) => `<rect x="${x - 11 + (k % 5) * 4.4 + (k > 4 ? 2 : 0)}" y="${y + (k > 4 ? 3 : 0)}" width="3.4" height="${len}" rx="1.6" fill="#8fae5d"/>`).join('') + `<rect x="${x - 13}" y="${y + len / 2 - 4}" width="26" height="9" rx="3" fill="var(--red)"/>`;

/** Multiplication as rows: each row of b pops in and the running total is skip-counted (b, 2b, …). */
export function rowsScene(a: number, b: number, reveal = true, kind = 'marja'): AnimPaint {
  const U = 28, X0 = 20, Y0 = 16, RT = 1.1, t0 = 0.6, fin = t0 + a * RT + 0.3;
  const W = Math.max(300, X0 + b * U + 110), H = Y0 + a * U + 52;
  return anim({
    dur: fin + 2.6, w: W, h: H, label: `${a} riviä, joissa ${b}`,
    frame: (t) => {
      let s = '';
      for (let i = 0; i < a; i++) {
        const at = t0 + i * RT; if (t < at) break;
        for (let j = 0; j < b; j++) { const p = ease(t - at - j * 0.07, 0, 0.18); if (p > 0) s += `<g opacity="${p}">${THINGS[kind]!.draw(X0 + U / 2 + j * U, Y0 + U / 2 + i * U - (1 - p) * 6, 24)}</g>`; }
        const q = ease(t - at - b * 0.07, 0, 0.3);
        s += `<text x="${X0 + b * U + 14}" y="${Y0 + U / 2 + i * U + 5}" font-size="15" font-weight="900" fill="var(--pond)" opacity="${q}">${reveal ? (i + 1) * b : ''}</text>`;
      }
      if (t > fin) s += `<text x="${W / 2}" y="${H - 12}" text-anchor="middle" font-size="22" font-weight="900" fill="currentColor" opacity="${ease(t - fin, 0, 0.5)}">${a} × ${b} = ${reveal ? a * b : '?'}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < t0) return `Rivistö: jokaisessa rivissä on ${word(b)}.`;
      if (t < fin) { const i = Math.min(a, Math.floor((t - t0) / RT) + 1); return reveal ? `Rivi ${i}: ${word(i * b)}…` : `Rivi ${i}…`; }
      return reveal ? `${Cap(word(a))} riviä, joissa jokaisessa ${word(b)}: ${a} × ${b} = ${a * b}.` : 'Montako yhteensä?';
    },
  });
}

/** The same array turned a quarter turn: a rows of b become b rows of a, the total stays. */
export function turnScene(a: number, b: number, kind = 'marja'): AnimPaint {
  const U = 28, M = Math.max(a, b) * U, W = Math.max(300, M + 60), H = M + 56, cx = W / 2, cy = 14 + M / 2;
  const tT = 2.2, TD = 1.6;
  return anim({
    dur: tT + TD + 3.4, w: W, h: H, label: `${a} × ${b} käännetään ${b} × ${a}`,
    frame: (t) => {
      const p = ease(t - tT, 0, TD), ang = 90 * p;
      let g = '';
      for (let i = 0; i < a; i++) for (let j = 0; j < b; j++) g += THINGS[kind]!.draw(cx - (b * U) / 2 + U / 2 + j * U, cy - (a * U) / 2 + U / 2 + i * U, 24);
      let s = `<g transform="rotate(${ang} ${cx} ${cy})">${g}</g>`;
      const r = p < 0.5 ? a : b, c = p < 0.5 ? b : a;
      s += `<text x="${W / 2}" y="${H - 10}" text-anchor="middle" font-size="20" font-weight="900" fill="currentColor" opacity="${p > 0.05 && p < 0.95 ? 0.25 : 1}">${r} × ${c} = ${a * b}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < tT) return `${Cap(word(a))} riviä, joissa jokaisessa ${word(b)}: ${a * b}.`;
      if (t < tT + TD) return 'Käännetään rivistö…';
      return `Nyt ${word(b)} riviä, joissa ${word(a)}: yhä ${a * b}. ${a} × ${b} = ${b} × ${a}.`;
    },
  });
}

/** Four times as tuplan tupla: 2 rows of b are counted, then the same block is copied below. */
export function doubleRowsScene(b: number, kind = 'marja'): AnimPaint {
  const U = 26, X0 = 20, Y0 = 14, W = Math.max(300, X0 + b * U + 120), H = Y0 + 4 * U + 70;
  const tA = 0.6, tC = 2.6, tF = tC + 1.6;
  const row = (i: number, dy: number, op: number) => `<g opacity="${op}">${Array.from({ length: b }, (_, j) => THINGS[kind]!.draw(X0 + U / 2 + j * U, Y0 + U / 2 + i * U + dy, 22)).join('')}</g>`;
  return anim({
    dur: tF + 3, w: W, h: H, label: `4 × ${b} on tuplan tupla`,
    frame: (t) => {
      const p = ease(t - tA, 0, 0.6), q = ease(t - tC, 0, 1.0);
      let s = row(0, 0, p) + row(1, 0, p);
      s += `<rect x="${X0 - 4}" y="${Y0 - 3}" width="${b * U + 8}" height="${2 * U + 6}" rx="8" fill="none" stroke="var(--pond)" stroke-width="2" opacity="${p}"/><text x="${X0 + b * U + 14}" y="${Y0 + U + 5}" font-size="14" font-weight="900" fill="var(--pond)" opacity="${p}">2 × ${b} = ${2 * b}</text>`;
      if (q > 0) {
        const dy = (2 * U + 8) * q;
        s += row(0, dy, q) + row(1, dy, q) + `<rect x="${X0 - 4}" y="${Y0 - 3 + dy}" width="${b * U + 8}" height="${2 * U + 6}" rx="8" fill="none" stroke="#c98a00" stroke-width="2" opacity="${q}"/><text x="${X0 + b * U + 14}" y="${Y0 + U + 5 + dy}" font-size="14" font-weight="900" fill="#c98a00" opacity="${q}">+ ${2 * b}</text>`;
      }
      if (t > tF) s += `<text x="${W / 2}" y="${H - 10}" text-anchor="middle" font-size="20" font-weight="900" fill="currentColor" opacity="${ease(t - tF, 0, 0.5)}">4 × ${b} = ${2 * b} + ${2 * b} = ${4 * b}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < tC) return `Kaksi riviä, joissa ${word(b)}: tupla, ${word(2 * b)}.`;
      if (t < tF) return 'Sama uudestaan: tuplan tupla.';
      return `Neljä riviä on kaksi kertaa kaksi riviä: ${2 * b} + ${2 * b} = ${4 * b}.`;
    },
  });
}

/** Two-digit subtraction with reeds: if the loose reeds are not enough, one bundle is opened
 *  first; then the ones are taken away one by one and the bundles ten by ten. */
export function subReedsScene(x: number, y: number, reveal = true): AnimPaint {
  const a = Math.floor(x / 10), c = x % 10, b = Math.floor(y / 10), e = y % 10, borrow = c < e, L = 56, Y = 54;
  const bx = (k: number) => 22 + k * 30, ox = (j: number) => bx(a) + 4 + j * 9, ones = c + (borrow ? 10 : 0);
  const W = Math.max(320, ox(ones - 1) + 20), H = 200, op = a - 1;
  const t0 = 1.6, tW = t0, tS = t0 + 1.2, tO = borrow ? tS + 1.4 : t0, OT = 0.38, tB = tO + e * OT + 0.5, BT = 0.6, fin = tB + b * BT + 0.5;
  const gone = (t: number, at: number) => ease(t - at, 0, 0.45);
  return anim({
    dur: fin + 2.6, w: W, h: H, label: `${x} − ${y} kaisloilla`,
    frame: (t) => {
      let s = `<text x="${W / 2}" y="22" text-anchor="middle" font-size="18" font-weight="900" fill="currentColor">${x} − ${y}</text>`;
      const lastB = borrow ? a - 1 : a;
      for (let k = 0; k < lastB; k++) {
        const rm = k >= lastB - b ? gone(t, tB + (lastB - 1 - k) * BT) : 0;
        s += `<g opacity="${1 - rm}">${reedBundle(bx(k), Y - rm * 26, L)}</g>`;
      }
      // ones (original c, then the 10 from the opened bundle); the last e are taken away from the right
      for (let j = 0; j < ones; j++) {
        const rm = j >= ones - e ? gone(t, tO + (ones - 1 - j) * OT) : 0;
        let X = ox(j), YY = Y;
        if (j >= c) { const k = j - c, kx = bx(op) - 11 + (k % 5) * 4.4 + (k > 4 ? 2 : 0) + (t > tW && t < tS ? Math.sin((t - tW) * 26) * 2.5 : 0), p = ease(t - tS - 0.3 - k * 0.06, 0, 0.5); X = kx + (ox(j) - kx) * p; YY = Y + (k > 4 ? 3 : 0) * (1 - p) - Math.sin(p * Math.PI) * 18; if (p <= 0) { s += `<rect x="${kx}" y="${Y + (k > 4 ? 3 : 0)}" width="3.4" height="${L}" rx="1.6" fill="#8fae5d"/>`; continue; } }
        s += `<g opacity="${1 - rm}">${reedOne(X, YY - rm * 26, L)}</g>`;
      }
      if (borrow && t < tS + 0.4) s += `<rect x="${bx(op) - 13}" y="${Y + L / 2 - 4 - (t > tS ? (t - tS) * 40 : 0)}" width="26" height="9" rx="3" fill="var(--red)" opacity="${t > tS ? 1 - (t - tS) / 0.4 : 1}"/>`;
      if (t > tO && t < fin) s += `<text x="${W - 14}" y="${Y + L + 30}" text-anchor="end" font-size="13" font-weight="800" fill="var(--red)">pois: ${t < tB ? Math.min(e, Math.floor((t - tO) / OT) + 1) : e + Math.min(b, Math.floor((t - tB) / BT) + 1) * 10}</text>`;
      if (t > fin) {
        const p = ease(t - fin, 0, 0.6), d = x - y;
        if (reveal) s += `<text x="22" y="${Y + L + 30}" font-size="12" font-weight="900" opacity="${p}"><tspan fill="var(--red)">${Math.floor(d / 10)} ${Math.floor(d / 10) === 1 ? 'nippu' : 'nippua'}</tspan><tspan fill="currentColor"> ja </tspan><tspan fill="#4f7a2b">${d % 10} ${d % 10 === 1 ? 'irtokaisla' : 'irtokaislaa'}</tspan></text>`;
        s += `<text x="${W / 2}" y="${H - 8}" text-anchor="middle" font-size="22" font-weight="900" fill="currentColor" opacity="${p}">${x} − ${y} = ${reveal ? d : '?'}</text>`;
      }
      return s;
    },
    caption: (t) => {
      if (t < t0) return `${x} − ${y}: otetaan pois ${b === 1 ? 'yksi nippu' : `${word(b)} nippua`} ja ${word(e)} irtokaislaa.`;
      if (borrow && t < tO) return `Irtokaisloja on vain ${c}, mutta pois pitää ottaa ${e}. Avataan nippu: ${reveal ? `irtokaisloja on nyt ${c + 10}` : 'irtokaisloja tulee kymmenen lisää'}.`;
      if (t < tB) { const k = Math.min(e, Math.floor((t - tO) / OT) + 1); return `Ykköset pois: ${word(k)}…`; }
      if (t < fin) { const k = Math.min(b, Math.floor((t - tB) / BT) + 1); return `Niput pois: ${word(k * 10)}…`; }
      return reveal ? `Jäljelle jäi ${x - y}.${borrow ? ' Avattu nippu teki sen mahdolliseksi.' : ''}` : 'Montako kaislaa jäi?';
    },
  });
}

/** Two-digit addition with reeds: both numbers' bundles fly onto the raft (counted by tens),
 *  then the loose reeds (counted by ones); ten loose ones are tied into a new bundle. */
export function addReedsScene(x: number, y: number, reveal = true): AnimPaint {
  const a = Math.floor(x / 10), c = x % 10, b = Math.floor(y / 10), e = y % 10, tot = x + y, carry = c + e >= 10;
  const T = Math.floor(tot / 10), L = 44, BW = 28, OW = 8;
  const rowX = (k: number) => 22 + k * BW, rowO = (tn: number, j: number) => 22 + tn * BW + 6 + j * OW;
  const rx = (k: number) => 22 + k * BW, ox = (j: number) => 22 + T * BW + 6 + j * OW;
  const W = Math.max(320, ox(c + e - 1) + 20, rowO(Math.max(a, b), Math.max(c, e)) + 20), H = 244, RY = 134;
  const t0 = 1.2, BT = 0.6, OT = 0.32, tO = t0 + (a + b) * BT + 0.4, tK = tO + (c + e) * OT + 0.5, fin = tK + (carry ? 2 : 0.3);
  const fly = (t: number, at: number, x0: number, y0: number, x1: number, y1: number) => { const p = ease(t - at, 0, 0.5); return [x0 + (x1 - x0) * p, y0 + (y1 - y0) * p - Math.sin(p * Math.PI) * 14] as const; };
  return anim({
    dur: fin + 2.6, w: W, h: H, label: `${x} + ${y} kaisloilla`,
    frame: (t) => {
      let s = `<rect x="10" y="${RY - 8}" width="${W - 20}" height="${L + 16}" rx="8" fill="#c9a26b" opacity="0.25"/><text x="14" y="${RY - 12}" font-size="10" font-weight="700" fill="#8a7444">lautta</text>`;
      s += `<text x="${W - 12}" y="${14 + L / 2}" text-anchor="end" font-size="15" font-weight="900" fill="currentColor">${x}</text><text x="${W - 12}" y="${70 + L / 2}" text-anchor="end" font-size="15" font-weight="900" fill="currentColor">+ ${y}</text>`;
      // bundles: A first, then B
      const bundles = [...Array(a)].map((_, k) => [rowX(k), 8]).concat([...Array(b)].map((_, k) => [rowX(k), 64]));
      bundles.forEach(([bx0, by0], k) => { const [X, Y] = fly(t, t0 + k * BT, bx0!, by0!, rx(k), RY); s += reedBundle(X, Y, L); });
      const ones = [...Array(c)].map((_, j) => [rowO(a, j), 8]).concat([...Array(e)].map((_, j) => [rowO(b, j), 64]));
      const tieP = carry ? ease(t - tK, 0, 0.6) : 0, moveAt = tK + 0.9;
      ones.forEach(([x0, y0], j) => {
        let [X, Y] = fly(t, tO + j * OT, x0!, y0!, ox(j), RY);
        if (carry && j < 10) { const p = ease(t - moveAt, 0, 0.7); X = X + (rx(a + b) - 11 + (j % 5) * 4.4 + (j > 4 ? 2 : 0) - X) * p; }
        s += reedOne(X, Y, L);
      });
      if (carry && tieP > 0) { const p = ease(t - moveAt, 0, 0.7), bx = ox(0) - 4 + (rx(a + b) - 13 - ox(0) + 4) * p, bw = 10 * OW - 2 + (26 - 10 * OW + 2) * p; s += `<rect x="${bx}" y="${RY + L / 2 - 4}" width="${bw}" height="9" rx="3" fill="var(--red)" opacity="${tieP}"/>`; }
      if (t > fin) {
        const p = ease(t - fin, 0, 0.6);
        if (reveal) s += `<text x="${(rx(0) + rx(T - 1)) / 2}" y="${RY + L + 26}" text-anchor="middle" font-size="12" font-weight="900" fill="var(--red)" opacity="${p}">${T} ${T === 1 ? 'nippu' : 'nippua'}</text>` + (tot % 10 ? `<text x="${(ox(carry ? 10 : 0) + ox(c + e - 1)) / 2}" y="${RY + L + 26}" text-anchor="middle" font-size="12" font-weight="900" fill="#4f7a2b" opacity="${p}">${tot % 10}</text>` : '');
        s += `<text x="${W / 2}" y="${H - 6}" text-anchor="middle" font-size="22" font-weight="900" fill="currentColor" opacity="${p}">${x} + ${y} = ${reveal ? tot : '?'}</text>`;
      }
      return s;
    },
    caption: (t) => {
      if (t < t0) return `${x} + ${y}. Viedään kaislat lautalle.`;
      if (t < tO) { const k = Math.min(a + b, Math.floor((t - t0) / BT) + 1); return reveal ? `Ensin niput: ${word(k * 10)}…` : 'Ensin niput…'; }
      if (t < tK) { const j = Math.min(c + e, Math.floor((t - tO) / OT) + 1); return reveal ? `Sitten irtokaislat: ${word(j)}…` : 'Sitten irtokaislat…'; }
      if (t < fin) return carry ? `Irtokaisloja on ${reveal ? word(c + e) : 'yli kymmenen'}! Kymmenestä sidotaan uusi nippu.` : 'Irtokaisloja on alle kymmenen: ei uutta nippua.';
      return reveal ? `${Cap(word(T))} ${T === 1 ? 'nippu' : 'nippua'} ja ${word(tot % 10)} irtokaislaa: ${x} + ${y} = ${tot}.` : 'Montako kaislaa lautalla on?';
    },
  });
}

/** Smart split: b pebbles appear, then a cut falls where the first part takes a to a whole ten;
 *  the two parts slide apart and the two easy steps are written out. */
export function cutScene(a: number, b: number, op: '+' | '-' = '+'): AnimPaint {
  const W = 320, H = 176, G = 28, fill = op === '+' ? (10 - (a % 10)) % 10 : a % 10, rest = b - fill;
  const ten = op === '+' ? a + fill : a - fill, res = op === '+' ? a + b : a - b, sg = op === '+' ? '+' : '−';
  const t0 = 0.8, PT = 0.3, tC = t0 + b * PT + 0.6, tS = tC + 1.4, tR = tS + 1.6;
  const px = (i: number, sh: number) => W / 2 - ((b - 1) * G) / 2 + i * G + (i < fill ? -sh : sh);
  return anim({
    dur: tR + 2.6, w: W, h: H, label: `${a} ${sg} ${b}: ${b} jaetaan ${fill} ja ${rest}`,
    frame: (t) => {
      const sh = ease(t - tC - 0.5, 0, 0.5) * 12, cut = t > tC;
      let s = `<text x="${W / 2}" y="32" text-anchor="middle" font-size="24" font-weight="900" fill="currentColor">${a} ${sg} ${b}</text>`;
      for (let i = 0; i < b; i++) {
        const p = ease(t - (t0 + i * PT), 0, 0.25); if (p <= 0) break;
        const col = !cut ? '#9aa3a8' : i < fill ? 'var(--red)' : '#4f7a2b';
        s += `<circle cx="${px(i, sh)}" cy="${76 - (1 - p) * 10}" r="10" fill="${col}" opacity="${p}"/>`;
      }
      if (cut) {
        const x = W / 2 - ((b - 1) * G) / 2 + (fill - 0.5) * G, d = ease(t - tC, 0, 0.45);
        s += `<line x1="${x}" y1="52" x2="${x}" y2="${52 + 48 * d}" stroke="currentColor" stroke-width="2.5" stroke-dasharray="5 4"/><text x="${x}" y="48" text-anchor="middle" font-size="16">✂</text>`;
        const q = ease(t - tC - 0.6, 0, 0.4);
        s += `<text x="${(px(0, sh) + px(fill - 1, sh)) / 2}" y="110" text-anchor="middle" font-size="15" font-weight="900" fill="var(--red)" opacity="${q}">${fill}</text><text x="${(px(fill, sh) + px(b - 1, sh)) / 2}" y="110" text-anchor="middle" font-size="15" font-weight="900" fill="#4f7a2b" opacity="${q}">${rest}</text>`;
      }
      if (t > tS) s += `<text x="${W / 2}" y="140" text-anchor="middle" font-size="18" font-weight="800" opacity="${ease(t - tS, 0, 0.5)}"><tspan fill="currentColor">${a} ${sg} </tspan><tspan fill="var(--red)">${fill}</tspan><tspan fill="currentColor"> = ${ten}</tspan></text>`;
      if (t > tR) s += `<text x="${W / 2}" y="166" text-anchor="middle" font-size="18" font-weight="800" opacity="${ease(t - tR, 0, 0.5)}"><tspan fill="currentColor">${ten} ${sg} </tspan><tspan fill="#4f7a2b">${rest}</tspan><tspan fill="currentColor"> = ${res}</tspan></text>`;
      return s;
    },
    caption: (t) => {
      if (t < tC) return `${Cap(word(b))} kiveä: tämä luku jaetaan kahteen osaan.`;
      if (t < tS) return `Leikataan niin, että ensimmäinen osa vie tasakymppiin: ${word(fill)} ja ${word(rest)}.`;
      if (t < tR) return `${a} ${op === '+' ? 'plus' : 'miinus'} ${fill} on tasan ${ten}.`;
      return `Sitten loput ${rest}: ${res}. Kaksi helppoa askelta!`;
    },
  });
}

/** Regrouping: one bundle loses its band and its ten reeds fly over to the loose ones,
 *  counted one by one. The number stays the same: t tens + o ones = (t−1) tens + (o+10) ones. */
export function unbundleScene(t: number, o: number, reveal = true): AnimPaint {
  const Y = 26, LEN = 70, n = t * 10 + o, last = t - 1, FLY = 0.42;
  const bx = (b: number) => 24 + b * 32, ox = (j: number) => bx(t) + 2 + j * 9;
  const W = Math.max(320, ox(o + 9) + 16), H = 206;
  const tW = 2.2, tB = 3.2, tF = 3.9, fin = tF + 10 * FLY + 0.6;
  const np = (k: number) => `${Cap(word(k))} ${k === 1 ? 'nippu' : 'nippua'}`;
  const ip = (k: number) => `${word(k)} ${k === 1 ? 'irtokaisla' : 'irtokaislaa'}`;
  return anim({
    dur: fin + 2.6, w: W, h: H, label: `${n}: nippu avataan, ${t - 1} nippua ja ${o + 10} irtokaislaa`,
    frame: (tt) => {
      const a0 = ease(tt, 0, 0.6);
      let s = '';
      for (let b = 0; b < last; b++) s += `<g opacity="${a0}">${reedBundle(bx(b), Y, LEN)}</g>`;
      const lab = (j: number, op: number) => reveal ? `<text x="${ox(j)}" y="${Y + LEN + (j % 2 ? 28 : 16)}" text-anchor="middle" font-size="10" font-weight="800" fill="#4f7a2b" opacity="${op}">${j + 1}</text>` : '';
      for (let j = 0; j < o; j++) s += `<g opacity="${a0}">${reedOne(ox(j), Y, LEN)}</g>${lab(j, a0)}`;
      // the bundle that will be opened: wiggle, lose its band, then its reeds fly one by one
      const x = bx(last), wig = tt > tW && tt < tB ? Math.sin((tt - tW) * 26) * 2.5 : 0;
      for (let k = 0; k < 10; k++) {
        const kx = x - 11 + (k % 5) * 4.4 + (k > 4 ? 2 : 0) + wig, ky = Y + (k > 4 ? 3 : 0);
        const p = ease(tt - (tF + k * FLY), 0, FLY * 0.9);
        const X = kx + (ox(o + k) - kx) * p, YY = ky + (Y - ky) * p - Math.sin(p * Math.PI) * 26;
        s += p > 0 ? `<g opacity="${a0}">${reedOne(X, YY, LEN)}</g>` : `<rect x="${kx}" y="${ky}" width="3.4" height="${LEN}" rx="1.6" fill="#8fae5d" opacity="${a0}"/>`;
        if (p >= 1) s += lab(o + k, 1);
      }
      if (tt < tB + 0.4) s += `<rect x="${x - 13 + wig}" y="${Y + LEN / 2 - 4 - (tt > tB ? (tt - tB) * 40 : 0)}" width="26" height="9" rx="3" fill="var(--red)" opacity="${a0 * (tt > tB ? 1 - (tt - tB) / 0.4 : 1)}"/>`;
      if (tt > tW && tt < tF + 1) s += `<path d="M${x} ${Y + LEN + 8} l0 10" stroke="var(--red)" stroke-width="2"/><text x="${x}" y="${Y + LEN + 30}" text-anchor="middle" font-size="11" font-weight="800" fill="var(--red)">avataan</text>`;
      if (tt > fin) {
        const p = ease(tt - fin, 0, 0.6);
        s += `<text x="${W / 2}" y="${H - 34}" text-anchor="middle" font-size="12" font-weight="800" opacity="${p}"><tspan fill="var(--red)">${t - 1} ${t - 1 === 1 ? 'nippu' : 'nippua'}</tspan><tspan fill="currentColor"> ja </tspan><tspan fill="#4f7a2b">${reveal ? o + 10 : '?'} irtokaislaa</tspan></text>`;
        s += `<text x="${W / 2}" y="${H - 8}" text-anchor="middle" font-size="22" font-weight="900" fill="currentColor" opacity="${p}">${n} = ${(t - 1) * 10} + ${reveal ? o + 10 : '□'}</text>`;
      }
      return s;
    },
    caption: (tt) => {
      if (tt < tW) return `${n}: ${np(t).toLowerCase()} ja ${ip(o)}.`;
      if (tt < tF) return 'Avataan yksi nippu: side pois!';
      if (tt < fin) { const k = Math.min(10, Math.floor((tt - tF) / FLY) + 1); return reveal ? `Kaislat irtokaislojen luo: ${word(o + k)}…` : 'Kaislat irtokaislojen luo…'; }
      return reveal ? `${np(t - 1)} ja ${ip(o + 10)}. Luku on yhä ${n}, kaisloja ei kadonnut yhtään.` : 'Montako irtokaislaa nyt on?';
    },
  });
}

/** Place value: bundles are counted by tens, loose reeds by ones, then each group sends
 *  its count to its own digit: tens digit (red) and ones digit (green). */
export function placeScene(t: number, o: number, reveal = true): AnimPaint {
  const W = 320, H = 200, Y = 26, LEN = 70, BT = 0.9, OT = 0.6, t0 = 0.8, n = t * 10 + o;
  const bx = (b: number) => 24 + b * 32, ox = (j: number) => bx(t) + 14 + j * 11;
  const tO = t0 + t * BT, tD = tO + o * OT + 0.5, fin = tD + 1.6;
  return anim({
    dur: fin + 2.2, w: W, h: H, label: `${t} nippua ja ${o} irtokaislaa: ${n}`,
    frame: (tt) => {
      let s = '';
      for (let b = 0; b < t; b++) {
        const a = t0 + b * BT; if (tt < a) break;
        const p = ease(tt - a, 0, 0.35);
        s += `<g opacity="${p}">${reedBundle(bx(b), Y - (1 - p) * 12, LEN)}</g><text x="${bx(b)}" y="${Y + LEN + 18}" text-anchor="middle" font-size="12" font-weight="900" fill="var(--red)" opacity="${p}">${(b + 1) * 10}</text>`;
      }
      for (let j = 0; j < o; j++) {
        const a = tO + j * OT; if (tt < a) break;
        const p = ease(tt - a, 0, 0.3);
        s += `<g opacity="${p}">${reedOne(ox(j), Y - (1 - p) * 12, LEN)}</g><text x="${ox(j)}" y="${Y + LEN + (j % 2 ? 28 : 16)}" text-anchor="middle" font-size="10" font-weight="800" fill="#4f7a2b" opacity="${p}">${t * 10 + j + 1}</text>`;
      }
      if (tt > tD) {
        const p = ease(tt - tD, 0, 0.8), dx = W / 2, dy = 178;
        const gT = t ? (bx(0) + bx(t - 1)) / 2 : dx - 22, gO = o ? (ox(0) + ox(o - 1)) / 2 : dx + 22;
        s += `<path d="M${gT} ${Y + LEN + 24} L${dx - 22} ${dy - 34}" stroke="var(--red)" stroke-width="2.5" stroke-dasharray="4 3" opacity="${p}"/><path d="M${gO} ${Y + LEN + 24} L${dx + 22} ${dy - 34}" stroke="#4f7a2b" stroke-width="2.5" stroke-dasharray="4 3" opacity="${p}"/>`;
        if (reveal) s += `<text x="${dx - 22}" y="${dy}" text-anchor="middle" font-size="44" font-weight="900" fill="var(--red)" opacity="${p}">${t}</text><text x="${dx + 22}" y="${dy}" text-anchor="middle" font-size="44" font-weight="900" fill="#4f7a2b" opacity="${p}">${o}</text>`;
        else s += `<rect x="${dx - 42}" y="${dy - 36}" width="38" height="44" rx="6" fill="none" stroke="var(--red)" stroke-width="2.5" opacity="${p}"/><rect x="${dx + 4}" y="${dy - 36}" width="38" height="44" rx="6" fill="none" stroke="#4f7a2b" stroke-width="2.5" opacity="${p}"/>`;
        s += `<text x="${dx - 70}" y="${dy - 8}" text-anchor="end" font-size="11" font-weight="800" fill="var(--red)" opacity="${p}">kymmenet</text><text x="${dx + 70}" y="${dy - 8}" text-anchor="start" font-size="11" font-weight="800" fill="#4f7a2b" opacity="${p}">ykköset</text>`;
      }
      return s;
    },
    caption: (tt) => {
      if (tt < t0) return 'Ensin niput, kymmenen kerrallaan.';
      if (tt < tO) { const b = Math.min(t, Math.floor((tt - t0) / BT) + 1); return `${Cap(word(b * 10))}…`; }
      if (tt < tD) { const j = Math.min(o, Math.floor((tt - tO) / OT) + 1); return o ? `Sitten irtokaislat: ${word(t * 10 + j)}…` : 'Irtokaisloja ei ole.'; }
      return reveal ? `${Cap(word(t))} ${t === 1 ? 'nippu' : 'nippua'} → kymmenten numero ${t}. ${Cap(word(o))} irtokaislaa → ykkösten numero ${o}. Luku on ${n}.` : 'Mitkä numerot tulevat ruutuihin?';
    },
  });
}

/** Repeated addition becomes multiplication: k bags of g appear one by one, each adding "+ g"
 *  under it; a brace then gathers the terms ("k kertaa") and the sum is rewritten as k × g. */
export function sumToTimesScene(k: number, g: number, reveal = true, kind = 'marja'): AnimPaint {
  const S = 17, cols = Math.ceil(g / 2), GW = cols * S + 14, GAP = 22, X0 = 16;
  const W = Math.max(320, X0 * 2 + k * GW + (k - 1) * GAP), H = 200;
  const gx = (i: number) => X0 + i * (GW + GAP) + (W - X0 * 2 - k * GW - (k - 1) * GAP) / 2;
  const t0 = 0.5, GT = 1.0, tB = t0 + k * GT + 0.4, tM = tB + 1.6, fin = tM + 1.4;
  return anim({
    dur: fin + 2.6, w: W, h: H, label: `${Array(k).fill(g).join(' + ')} = ${k} × ${g}`,
    frame: (t) => {
      let s = '';
      const fade = reveal ? 1 - 0.5 * ease(t - tM, 0, 0.6) : 1;
      for (let i = 0; i < k; i++) {
        const at = t0 + i * GT, p = ease(t - at, 0, 0.35); if (p <= 0) break;
        const x = gx(i), cx = x + GW / 2;
        s += `<g opacity="${p}" transform="translate(0 ${(1 - p) * -10})"><rect x="${x}" y="14" width="${GW}" height="${2 * S + 14}" rx="12" fill="var(--pond)" fill-opacity="0.10" stroke="var(--pond)" stroke-width="2"/>`;
        for (let j = 0; j < g; j++) s += THINGS[kind]!.draw(x + 7 + S / 2 + Math.floor(j / 2) * S, 21 + S / 2 + (j % 2) * S, 15);
        s += '</g>';
        const q = ease(t - at - 0.4, 0, 0.3);
        s += `<text x="${cx}" y="96" text-anchor="middle" font-size="22" font-weight="900" fill="currentColor" opacity="${q * fade}">${g}</text>`;
        if (i > 0) s += `<text x="${x - GAP / 2}" y="96" text-anchor="middle" font-size="20" font-weight="900" fill="currentColor" opacity="${q * fade}">+</text>`;
      }
      const b = ease(t - tB, 0, 0.6);
      if (b > 0) {
        const L = gx(0) + 4, R = gx(k - 1) + GW - 4, M = (L + R) / 2, w = (R - L) * b;
        s += `<path d="M${M - w / 2} 106 q0 8 8 8 H${M - 8} q8 0 8 8 q0 -8 8 -8 H${M + w / 2 - 8} q8 0 8 -8" fill="none" stroke="#c98a00" stroke-width="2.5" opacity="${b}"/>`;
        s += `<text x="${M}" y="142" text-anchor="middle" font-size="15" font-weight="900" fill="#c98a00" opacity="${b}">${reveal ? k : '?'} kertaa luku ${g}</text>`;
      }
      const m = ease(t - tM, 0, 0.7);
      if (m > 0 && reveal) s += `<text x="${W / 2}" y="${186 - (1 - m) * 10}" text-anchor="middle" font-size="26" font-weight="900" fill="var(--pond)" opacity="${m}">${k} × ${g}${reveal && t > fin ? ` = ${k * g}` : ''}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < t0) return `Pussit, joissa jokaisessa on ${word(g)}.`;
      if (t < tB) { const i = Math.min(k, Math.floor((t - t0) / GT) + 1); return reveal ? `${Cap(word(i))}${i === 1 ? ' pussi' : ' pussia'}: ${Array(i).fill(g).join(' + ')}` : `Pussi ${i}…`; }
      if (!reveal && t >= tB) return `Montako kertaa luku ${g} toistuu? Kirjoita se kertolaskuna.`;
      if (t < tM) return `Luku ${g} toistuu ${word(k)} kertaa.`;
      if (t < fin) return `Lyhyesti: ${k} × ${g}. Ensin ryhmien määrä, sitten ryhmän koko.`;
      return reveal ? `${Array(k).fill(g).join(' + ')} = ${k} × ${g} = ${k * g}.` : `${Array(k).fill(g).join(' + ')} = ${k} × ${g}.`;
    },
  });
}

/** A multiplication undone: a full bags of b are emptied into one pile of c, then the pile is
 *  packed back b at a time and the bags are counted (c : b = a), and finally c : a = b. */
export function unpackScene(a: number, b: number, reveal = true, kind = 'marja'): AnimPaint {
  const c = a * b, W = 320, H = 256, S = 15, G = bagGeo(a, W);
  const pile = lineLayout(c, W - 20, 52, S).map((q) => ({ x: q.x + 10, y: q.y + 4 }));
  const spot = (i: number, j: number) => ({ x: G.x0(i) + G.bw / 2 + ((j % 2) - 0.5) * 18, y: 150 - Math.floor(j / 2) * 18 });
  const tA = 0.3, tP = 3.0, tR = 4.8, ST = 1.1, fR = tR + a * ST + 0.3, tL = fR + 2.0, fin = tL + 0.6;
  const line = (y: number, txt: string, col: string, o: number) => `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="21" font-weight="900" fill="${col}" opacity="${o}">${txt}</text>`;
  return anim({
    dur: fin + 3, w: W, h: H, label: `${a} × ${b} = ${c} puretaan: ${c} : ${b} = ${a}`,
    frame: (t) => {
      let s = '';
      const show = ease(t - tA, 0, 0.6), out = ease(t - tP, 0, 1.0);
      for (let i = 0; i < a; i++) {
        const back = ease(t - tR - i * ST, 0, ST * 0.7);
        s += `<g opacity="${show}">${G.bag(i, t > tR && back > 0 && back < 1)}</g>`;
        for (let j = 0; j < b; j++) {
          const n = i * b + j, P = pile[n]!, B = spot(i, j);
          const p = back > 0 ? 1 - back : out;          // 0 = in the bag, 1 = in the pile
          const x = B.x + (P.x - B.x) * p, y = B.y + (P.y - B.y) * p - Math.sin(Math.PI * p) * 14;
          s += `<g opacity="${show}">${THINGS[kind]!.draw(x, y, S)}</g>`;
        }
        if (back >= 1 && reveal) s += `<text x="${G.x0(i) + G.bw / 2}" y="182" text-anchor="middle" font-size="15" font-weight="900" fill="var(--pond)">${i + 1}</text>`;
      }
      s += line(206, `${a} × ${b} = ${c}`, 'currentColor', ease(t - tA - 0.8, 0, 0.5) * (t > tR ? 0.45 : 1));
      if (t > fR) s += line(230, `${c} : ${b} = ${reveal ? a : '?'}`, 'var(--pond)', ease(t - fR, 0, 0.5));
      if (t > tL && reveal) s += line(254, `${c} : ${a} = ${b}`, '#c98a00', ease(t - tL, 0, 0.5));
      return s;
    },
    caption: (t) => {
      if (t < tP) return `${Cap(word(a))} pussia, joissa jokaisessa ${word(b)}: ${a} × ${b} = ${c}.`;
      if (t < tR) return `Puretaan pussit yhteen kasaan: ${word(c)}.`;
      if (t < fR) { const i = Math.min(a, Math.floor((t - tR) / ST) + 1); return reveal ? `Pakataan taas ${word(b)} kerrallaan. Pussi ${i}…` : `Pakataan taas ${word(b)} kerrallaan…`; }
      if (!reveal) return `Montako pussia tuli?`;
      if (t < tL) return `Pusseja tuli ${word(a)}: ${c} : ${b} = ${a}. Jakolasku purki kertolaskun.`;
      return `Ja kun ${c} jaetaan ${word(a)} pussiin, jokaiseen tulee ${word(b)}: ${c} : ${a} = ${b}.`;
    },
  });
}

/** Division as skip counting: the frog hops a at a time from 0 to c and the hops are counted. */
export function skipDivScene(c: number, a: number, reveal = true): AnimPaint {
  const b = c / a, W = 320, H = 176, LY = 120, X = (v: number) => 18 + (v / c) * (W - 36), JT = 1.0, t0 = 1.2, fin = t0 + b * JT;
  return anim({
    dur: fin + 3, w: W, h: H, label: `${c} : ${a} hyppimällä ${a} kerrallaan`,
    frame: (t) => {
      const u = Math.max(0, t - t0), j = Math.min(b, Math.floor(u / JT)), p = j < b && t >= t0 ? ease(u - j * JT, 0, JT * 0.7) : 0;
      let s = `<text x="${W / 2}" y="24" text-anchor="middle" font-size="20" font-weight="900" fill="currentColor">${c} : ${a} = ${t > fin + 0.8 && reveal ? b : '?'}</text>`;
      s += `<line x1="10" y1="${LY}" x2="${W - 10}" y2="${LY}" stroke="currentColor" stroke-width="2"/>`;
      for (let v = 0; v <= c; v++) if (c <= 30 || v % a === 0) s += `<line x1="${X(v)}" y1="${LY - (v % a ? 3 : 6)}" x2="${X(v)}" y2="${LY + (v % a ? 3 : 6)}" stroke="currentColor" opacity="${v % a ? 0.5 : 1}"/>`;
      s += `<text x="${X(0)}" y="${LY + 22}" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor">0</text>`;
      const hgt = Math.min(44, 10 + (X(a) - X(0)) * 0.6);
      for (let i = 0; i < Math.min(b, j + (p > 0 ? 1 : 0)); i++) {
        const q = i < j ? 1 : p, x0 = X(i * a), x1 = X((i + 1) * a), m = (x0 + x1) / 2;
        s += `<path d="M${x0} ${LY - 6} Q${m} ${LY - 6 - hgt * 2} ${x1} ${LY - 6}" fill="none" stroke="${i % 2 ? '#c98a00' : 'var(--pond)'}" stroke-width="3" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1 - q}"/>`;
        if (q > 0.6) s += `<text x="${m}" y="${LY - 10 - hgt}" text-anchor="middle" font-size="14" font-weight="900" fill="${i % 2 ? '#c98a00' : 'var(--pond)'}">${reveal || i < 1 ? i + 1 : ''}</text>` +
          `<text x="${x1}" y="${LY + 22}" text-anchor="middle" font-size="12" font-weight="800" fill="currentColor">${(i + 1) * a}</text>`;
      }
      const xa = X(j * a), xb = X(Math.min(b, j + 1) * a);
      s += frog(xa + (xb - xa) * p, LY - 20 - Math.sin(Math.PI * p) * 12, 11);
      if (t > fin && reveal) s += `<text x="${W / 2}" y="${H - 8}" text-anchor="middle" font-size="15" font-weight="900" fill="var(--pond)" opacity="${ease(t - fin, 0, 0.5)}">${b} hyppyä: ${a} × ${b} = ${c}, joten ${c} : ${a} = ${b}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < t0) return `${c} jaettuna ${a}:llä. Montako ${a}:n hyppyä on nollasta lukuun ${c}?`;
      const j = Math.min(b, Math.floor((t - t0) / JT) + 1);
      if (t < fin) return reveal ? `${j}. hyppy: ${a} × ${j} = ${a * j}` : `Hyppy…`;
      return reveal ? `Perillä ${b} hypyn jälkeen: ${c} : ${a} = ${b}.` : 'Montako hyppyä?';
    },
  });
}

/** Fair sharing: c things are dealt round by round, one to each of a friends' bags. */
export function shareRoundScene(kind: string, c: number, a: number, reveal = true): AnimPaint {
  const b = c / a, W = 320, H = 232, S = 15, G = bagGeo(a, W), ST = Math.min(0.42, 10 / c), t0 = 1, RP = 0.35;
  const pile = lineLayout(c, W - 20, 52, S).map((q) => ({ x: q.x + 10, y: q.y + 4 }));
  const spot = (i: number, j: number) => ({ x: G.x0(i) + G.bw / 2 + ((j % 2) - 0.5) * 18, y: 150 - Math.floor(j / 2) * 18 });
  const at = (n: number) => t0 + n * ST + Math.floor(n / a) * RP, fin = at(c) + 0.2;
  return anim({
    dur: fin + 3, w: W, h: H, label: `${c} jaetaan tasan ${a} ystävälle`,
    frame: (t) => {
      let s = '';
      for (let i = 0; i < a; i++) s += G.bag(i) + frog(G.x0(i) + G.bw / 2, 190, 10);
      for (let n = c - 1; n >= 0; n--) {
        const P = pile[c - 1 - n]!, B = spot(n % a, Math.floor(n / a)), p = ease(t - at(n), 0, ST * 0.9);
        s += THINGS[kind]!.draw(P.x + (B.x - P.x) * p, P.y + (B.y - P.y) * p - Math.sin(Math.PI * p) * 16, S);
      }
      if (t > fin) s += `<text x="${W / 2}" y="${H - 6}" text-anchor="middle" font-size="20" font-weight="900" fill="var(--pond)" opacity="${ease(t - fin, 0, 0.5)}">${c} : ${a} = ${reveal ? b : '?'}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < t0) return `${Cap(word(c))} jaetaan tasan ${word(a)} ystävälle.`;
      if (t < fin) { let n = 0; while (n < c - 1 && at(n + 1) <= t) n++; const r = Math.floor(n / a) + 1; return `Kierros ${r}: jokainen saa yhden.`; }
      return reveal ? `Kasa loppui. Jokaisella on ${word(b)}: ${c} : ${a} = ${b}, koska ${a} × ${b} = ${c}.` : 'Montako kukin sai?';
    },
  });
}

/** Damped swing of a balance beam: starts at v0 and settles at target. */
const swing = (v0: number, target: number, u: number) => target + (v0 - target) * Math.exp(-2.6 * u) * Math.cos(7 * u);
/** Things drop one by one onto a balance, left pan first; the beam swings and settles after each
 *  drop. `tilt` is the final result (−1 left down, 0 level, 1 right down). */
export function weighScene(left: string[], right: string[], tilt: -1 | 0 | 1, verdict: string, intro?: string): AnimPaint {
  const W = 300, H = 200, cx = W / 2, arm = W * 0.28, DT = 0.7, t0 = 0.8, tR = t0 + left.length * DT + 1.4, fin = tR + right.length * DT + 2.0;
  // beam targets after each drop
  const ev: { at: number; to: number }[] = [];
  left.forEach((_, i) => ev.push({ at: t0 + i * DT + 0.35, to: -1 }));
  right.forEach((_, j) => ev.push({ at: tR + j * DT + 0.35, to: j === right.length - 1 ? tilt : -1 }));
  const tiltAt = (t: number) => { let v = 0, from = 0, at = 0, to = 0; for (const e of ev) { if (t < e.at) break; from = swing(from, to, e.at - at); at = e.at; to = e.to; } v = swing(from, to, Math.max(0, t - at)); return ev.length && t >= ev[0]!.at ? v : 0; };
  return anim({
    dur: fin + 2.4, w: W, h: H, label: `Vaaka: vasemmalla ${left.join(', ')}, oikealla ${right.join(', ')}`,
    frame: (t) => {
      const nl = left.filter((_, i) => t >= t0 + i * DT + 0.35).length, nr = right.filter((_, j) => t >= tR + j * DT + 0.35).length, v = tiltAt(t);
      let s = balanceBody(left.slice(0, nl), right.slice(0, nr), v, W);
      const d = Math.max(-1, Math.min(1, v)) * 14;
      const drop = (k: string, x: number, yEnd: number, p: number) => THINGS[k] ? THINGS[k]!.draw(x, yEnd - 12 - (1 - p * p) * 70, 22) : '';
      if (nl < left.length && t >= t0 + nl * DT) s += drop(left[nl]!, cx - arm, 52 - d + 60, (t - t0 - nl * DT) / 0.35);
      if (nr < right.length && t >= tR + nr * DT) s += drop(right[nr]!, cx + arm, 52 + d + 60, (t - tR - nr * DT) / 0.35);
      return s;
    },
    caption: (t) => {
      if (t < t0) return intro ?? 'Tyhjä vaaka on suorassa.';
      const what = (xs: string[]) => xs.length > 1 ? `${word(xs.length)} ${THINGS[xs[0]!]?.many ?? ''}` : THINGS[xs[0]!]?.one ?? xs[0];
      if (t < tR) return `Vasemmalle ${what(left)}: vasen puoli painuu alas.`;
      if (t < fin - 1.2) return `Oikealle ${what(right)}…`;
      return verdict;
    },
  });
}
