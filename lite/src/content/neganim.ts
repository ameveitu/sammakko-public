// Animated scenes for negative numbers: a thermometer whose liquid really moves, and Loikka
// hopping one step at a time along a number line that goes below zero.
import { anim, ease, type AnimPaint } from '../ui/anim';
import { frog } from '../ui/art';
import { neg, thermoInner, thermoY } from './pics';

const deg = (n: number) => `${neg(n)} °C`;

// ---------------------------------------------------------------- thermometers that really change
/** Thermometers side by side; one at a time the liquid moves from `from` to `to`, one degree per
 *  tick, with a live reading next to the level. Ends with `say` for each. */
export function thermoScene(ms: { from: number; to: number; label?: string; say: string }[], end?: string): AnimPaint {
  const TICK = 0.38, UW = 150;
  const lens = ms.map((m) => 0.6 + Math.abs(m.to - m.from) * TICK + 1.8);
  const starts = lens.map((_, k) => 0.6 + lens.slice(0, k).reduce((a, b) => a + b, 0));
  const dur = starts[starts.length - 1]! + lens[lens.length - 1]! + (end ? 2.2 : 0.4);
  const levelAt = (k: number, t: number) => {
    const m = ms[k]!, n = Math.abs(m.to - m.from), u = Math.max(0, Math.min(n, (t - starts[k]! - 0.6) / TICK));
    return m.from + Math.sign(m.to - m.from) * u;
  };
  return anim({
    dur, w: ms.length * UW, h: 230, label: 'Lämpömittari',
    frame: (t) => ms.map((m, k) => {
      const v = t < starts[k]! ? m.from : levelAt(k, t), shown = Math.round(v), y = thermoY(v);
      const active = t >= starts[k]! && t < starts[k]! + lens[k]!;
      return `<g transform="translate(${k * UW + 44} 0)">${thermoInner(v, -10, 10, '')}<text x="46" y="226" text-anchor="middle" font-size="13" font-weight="800" fill="currentColor">${m.label ?? ''}</text>`
        + `<g opacity="${active ? 1 : 0.75}"><rect x="-40" y="${y - 11}" width="64" height="22" rx="7" fill="${shown < 0 ? 'color-mix(in srgb, var(--blue) 22%, var(--card))' : shown > 0 ? 'color-mix(in srgb, var(--sun) 40%, var(--card))' : 'var(--card)'}" stroke="currentColor" stroke-width="1.5"/><text x="-8" y="${y + 5}" text-anchor="middle" font-size="13" font-weight="900">${deg(shown)}</text><path d="M24 ${y}h11" stroke="currentColor" stroke-width="1.5"/></g></g>`;
    }).join(''),
    caption: (t) => {
      if (t < starts[0]!) return 'Katso mittarin pintaa.';
      const k = Math.max(0, starts.filter((s0) => t >= s0).length - 1), m = ms[k]!;
      if (end && t >= starts[k]! + lens[k]! && k === ms.length - 1) return end;
      const moving = t < starts[k]! + 0.6 + Math.abs(m.to - m.from) * TICK;
      if (!moving) return m.say;
      const v = Math.round(levelAt(k, t));
      return `${m.to < m.from ? 'Pinta laskee' : 'Pinta nousee'}: ${deg(v)}${v === 0 ? ' — nolla, raja!' : v < 0 ? ' (pakkasta)' : ''}`;
    },
  });
}

// ---------------------------------------------------------------- hops on the ice number line
/** Loikka hops one step at a time along a number line with negative numbers; each hop leaves its
 *  arcs and a labelled landing dot. Hops run one after another. */
export function iceHops(min: number, max: number, hops: { from: number; to: number; color?: string; say: string }[], end?: string): AnimPaint {
  const W = 330, H = 140, Y = 104, ST = 0.55, X = (v: number) => 18 + ((v - min) / (max - min)) * (W - 36);
  const lens = hops.map((h) => 0.5 + Math.abs(h.to - h.from) * ST + 1.6);
  const starts = lens.map((_, k) => 0.7 + lens.slice(0, k).reduce((a, b) => a + b, 0));
  const dur = starts[starts.length - 1]! + lens[lens.length - 1]! + (end ? 2.4 : 0.4);
  const every = max - min > 12 ? 2 : 1;
  let base = `<line x1="8" y1="${Y}" x2="${W - 8}" y2="${Y}" stroke="currentColor" stroke-width="2.5"/>`;
  for (let v = min; v <= max; v++) {
    base += `<line x1="${X(v)}" y1="${Y - (v === 0 ? 10 : 6)}" x2="${X(v)}" y2="${Y + (v === 0 ? 10 : 6)}" stroke="currentColor" stroke-width="${v === 0 ? 3 : 1.6}"/>`;
    if (v % every === 0) base += `<text x="${X(v)}" y="${Y + 26}" text-anchor="middle" font-size="12" font-weight="${v === 0 ? 900 : 600}" fill="currentColor">${neg(v)}</text>`;
  }
  const state = (k: number, t: number) => {
    const h = hops[k]!, n = Math.abs(h.to - h.from), d = Math.sign(h.to - h.from), u = Math.max(0, t - starts[k]! - 0.5) / ST;
    const j = Math.min(n, Math.floor(u)), p = j < n && t >= starts[k]! + 0.5 ? ease(u - j, 0, 0.75) : 0;
    return { h, n, d, j, p, pos: h.from + d * (j + p) };
  };
  return anim({
    dur, w: W, h: H, label: 'Hypyt jään lukusuoralla',
    frame: (t) => {
      let s = base, fx = X(hops[0]!.from), fy = Y - 16;
      hops.forEach((h0, k) => {
        if (t < starts[k]!) return;
        const { h, n, d, j, p, pos } = state(k, t), c = h.color ?? 'var(--red)', cur = t < starts[k]! + lens[k]!;
        let g = `<circle cx="${X(h.from)}" cy="${Y}" r="4" fill="var(--sun)"/>`;
        for (let i = 0; i < j; i++) { const a = X(h.from + d * i), b = X(h.from + d * (i + 1)); g += `<path d="M${a} ${Y - 5} Q${(a + b) / 2} ${Y - 30} ${b} ${Y - 5}" fill="none" stroke="${c}" stroke-width="2.2"/>`; }
        if (j === n) g += `<circle cx="${X(h.to)}" cy="${Y}" r="7" fill="${c}"/><text x="${X(h.to)}" y="${Y - 54}" text-anchor="middle" font-size="16" font-weight="900" fill="${c}">${neg(h.to)}</text>`;
        else if (j > 0) g += `<text x="${X(h.from + d * j)}" y="${Y - 54}" text-anchor="middle" font-size="12" font-weight="800" fill="${c}">${neg(h.from + d * j)}</text>`;
        s += cur ? g : `<g opacity="0.55">${g}</g>`;
        if (cur || k === hops.length - 1) { fx = X(pos); fy = Y - 16 - Math.sin(Math.PI * p) * 14; }
        void h0;
      });
      return s + frog(fx, fy, 14);
    },
    caption: (t) => {
      if (t < starts[0]!) return `Loikka lähtee kohdasta ${neg(hops[0]!.from)}.`;
      const k = starts.filter((s0) => t >= s0).length - 1;
      if (end && k === hops.length - 1 && t >= starts[k]! + lens[k]!) return end;
      const { h, n, d, j } = state(k, t);
      if (j < n) return `${d < 0 ? 'Vasemmalle' : 'Oikealle'}: ${Array.from({ length: j + 1 }, (_, i) => neg(h.from + d * i)).join(', ')}…`;
      return h.say;
    },
  });
}


// ---------------------------------------------------------------- sorting on the ice number line
/** Number cards fly one at a time from a shuffled row onto their places on the number line; then a
 *  lamp sweeps from left to right and copies each number, in that order, into a "<" chain. */
export function lineSortScene(cards: number[], min: number, max: number): AnimPaint {
  const W = 330, H = 200, Y = 112, X = (v: number) => 20 + ((v - min) / (max - min)) * (W - 40);
  const FLY = 1.1, t0 = 0.8, sweepAt = t0 + cards.length * FLY + 0.6, SW = 3.2, dur = sweepAt + SW + 2.6;
  const sorted = [...cards].sort((a, b) => a - b), every = max - min > 12 ? 5 : 1;
  const cx = (i: number) => W / 2 + (i - (cards.length - 1) / 2) * 62;
  let base = `<line x1="10" y1="${Y}" x2="${W - 10}" y2="${Y}" stroke="currentColor" stroke-width="2.5"/>`;
  for (let v = min; v <= max; v++) {
    base += `<line x1="${X(v)}" y1="${Y - (v === 0 ? 9 : 4)}" x2="${X(v)}" y2="${Y + (v === 0 ? 9 : 4)}" stroke="currentColor" stroke-width="${v === 0 ? 3 : 1.2}"/>`;
    if (v % every === 0) base += `<text x="${X(v)}" y="${Y + 22}" text-anchor="middle" font-size="11" font-weight="${v === 0 ? 900 : 600}" fill="currentColor" opacity=".8">${neg(v)}</text>`;
  }
  base += `<text x="14" y="${Y + 38}" font-size="10" fill="currentColor" opacity=".7">◀ pienempi</text><text x="${W - 14}" y="${Y + 38}" text-anchor="end" font-size="10" fill="currentColor" opacity=".7">suurempi ▶</text>`;
  const sweepX = (t: number) => 10 + ease((t - sweepAt) / SW, 0, 1) * (W - 20);
  return anim({
    dur, w: W, h: H, label: 'Luvut lukusuoralle ja järjestykseen',
    frame: (t) => {
      let s = base;
      cards.forEach((v, i) => {
        const st = t0 + i * FLY, p = ease((t - st) / (FLY * 0.8), 0, 1), x = cx(i) + (X(v) - cx(i)) * p, y = 26 + (Y - 14 - 26) * p - Math.sin(Math.PI * p) * 18;
        const col = v < 0 ? 'var(--blue)' : v > 0 ? 'var(--red)' : 'currentColor';
        if (p >= 1) s += `<circle cx="${X(v)}" cy="${Y}" r="5" fill="${col}"/>`;
        s += `<rect x="${x - 19}" y="${y - 12}" width="38" height="22" rx="6" fill="var(--card)" stroke="${col}" stroke-width="2"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="13" font-weight="900" fill="${col}">${neg(v)}</text>`;
      });
      if (t >= sweepAt) {
        const sx = sweepX(t);
        s += `<rect x="${sx - 3}" y="${Y - 40}" width="6" height="56" rx="3" fill="var(--sun)" opacity=".8"/>`;
        const got = sorted.filter((v) => X(v) <= sx);
        s += `<text x="${W / 2}" y="${H - 14}" text-anchor="middle" font-size="16" font-weight="900" fill="currentColor">${got.map(neg).join('  <  ')}</text>`;
      }
      return s;
    },
    caption: (t) => {
      if (t < t0) return 'Jokainen luku saa paikkansa lukusuoralla.';
      if (t < sweepAt) { const i = Math.min(cards.length - 1, Math.floor((t - t0) / FLY)), v = cards[i]!; return v < 0 ? `${neg(v)} menee ${-v} askelta nollasta vasemmalle.` : v > 0 ? `${v} menee ${v} askelta nollasta oikealle.` : '0 on keskellä.'; }
      if (t < sweepAt + SW) return 'Lamppu kulkee vasemmalta oikealle ja poimii luvut siinä järjestyksessä: pienin ensin.';
      return sorted[0]! < 0 ? `Järjestys on valmis. ${neg(sorted[0]!)} on pienin, koska se on vasemmalla, vaikka ${-sorted[0]!} näyttää isolta luvulta.` : 'Järjestys on valmis: vasemmalta oikealle.';
    },
  });
}

// ---------------------------------------------------------------- meeting in the middle
/** Two frogs start at a and b and hop towards each other one step per tick; where they meet is the midpoint. */
export function midScene(a: number, b: number, min: number, max: number): AnimPaint {
  const W = 330, H = 140, Y = 100, ST = 0.6, t0 = 0.8, X = (v: number) => 18 + ((v - min) / (max - min)) * (W - 36);
  const n = Math.abs(b - a) / 2, m = (a + b) / 2, dur = t0 + n * ST + 3.2, every = max - min > 12 ? 2 : 1;
  let base = `<line x1="8" y1="${Y}" x2="${W - 8}" y2="${Y}" stroke="currentColor" stroke-width="2.5"/>`;
  for (let v = min; v <= max; v++) {
    base += `<line x1="${X(v)}" y1="${Y - (v === 0 ? 10 : 6)}" x2="${X(v)}" y2="${Y + (v === 0 ? 10 : 6)}" stroke="currentColor" stroke-width="${v === 0 ? 3 : 1.6}"/>`;
    if (v % every === 0) base += `<text x="${X(v)}" y="${Y + 26}" text-anchor="middle" font-size="12" font-weight="${v === 0 ? 900 : 600}" fill="currentColor">${neg(v)}</text>`;
  }
  base += `<circle cx="${X(a)}" cy="${Y}" r="4" fill="var(--sun)"/><circle cx="${X(b)}" cy="${Y}" r="4" fill="var(--sun)"/>`;
  const st = (t: number) => { const u = Math.max(0, (t - t0) / ST), j = Math.min(n, Math.floor(u)), p = j < n && t >= t0 ? ease(u - j, 0, 0.75) : 0; return { j, p }; };
  return anim({
    dur, w: W, h: H, label: 'Puoliväli',
    frame: (t) => {
      const { j, p } = st(t);
      let s = base;
      for (let i = 0; i < j; i++) {
        for (const [from, d, c] of [[a, 1, 'var(--red)'], [b, -1, 'var(--blue)']] as [number, number, string][]) {
          const x1 = X(from + d * i), x2 = X(from + d * (i + 1));
          s += `<path d="M${x1} ${Y - 5} Q${(x1 + x2) / 2} ${Y - 28} ${x2} ${Y - 5}" fill="none" stroke="${c}" stroke-width="2.2"/>`;
        }
      }
      s += `<text x="${X(a)}" y="${Y - 44}" text-anchor="middle" font-size="11" font-weight="800" fill="var(--red)">${j} askelta</text><text x="${X(b)}" y="${Y - 44}" text-anchor="middle" font-size="11" font-weight="800" fill="var(--blue)">${j} askelta</text>`;
      const fa = a + j + p, fb = b - j - p, hop = Math.sin(Math.PI * p) * 12;
      if (j >= n) s += `<circle cx="${X(m)}" cy="${Y}" r="7" fill="var(--sun)"/><text x="${X(m)}" y="${Y - 60}" text-anchor="middle" font-size="16" font-weight="900" fill="currentColor">puoliväli ${neg(m)}</text>`;
      return s + frog(X(fa) - (j >= n ? 9 : 0), Y - 16 - hop, 12) + frog(X(fb) + (j >= n ? 9 : 0), Y - 16 - hop, 12);
    },
    caption: (t) => {
      const { j } = st(t);
      if (t < t0) return `Kaksi sammakkoa lähtee kohdista ${neg(a)} ja ${neg(b)} toisiaan kohti, askel kerrallaan.`;
      if (j < n) return `Kumpikin on hypännyt ${j} askelta. Ne hyppäävät yhtä monta askelta.`;
      return `Ne kohtaavat kohdassa ${neg(m)}: kumpikin hyppäsi ${n} askelta, eli puolet ${2 * n} askeleen välistä.`;
    },
  });
}

// ---------------------------------------------------------------- zero pairs
/** Chips: a plus-chip and a minus-chip together make zero. The chips for a and b drop in, then
 *  opposite chips pair up and vanish one pair at a time; what is left is the sum. */
export function zeroPairScene(a: number, b: number): AnimPaint {
  const W = 330, H = 190, R = 12, t0 = 0.6, DROP = 0.25, PAIR = 0.75;
  const chips = [...Array(Math.abs(a))].map(() => Math.sign(a)).concat([...Array(Math.abs(b))].map(() => Math.sign(b)));
  const pos = chips.map((s) => s), nP = pos.filter((s) => s > 0).length, nN = pos.length - nP, pairs = Math.min(nP, nN);
  const dropEnd = t0 + chips.length * DROP + 0.5, pairEnd = dropEnd + pairs * PAIR, dur = pairEnd + 3;
  // row 1: plus chips, row 2: minus chips, laid out by column
  const plusIdx: number[] = [], minusIdx: number[] = [];
  chips.forEach((s, i) => (s > 0 ? plusIdx : minusIdx).push(i));
  const slot = (i: number) => { const s = chips[i]!, col = (s > 0 ? plusIdx : minusIdx).indexOf(i); return { x: 30 + col * 28, y: s > 0 ? 62 : 118 }; };
  const sum = a + b;
  return anim({
    dur, w: W, h: H, label: 'Nollaparit',
    frame: (t) => {
      let o = `<text x="10" y="${66}" font-size="11" font-weight="800" fill="var(--red)">+</text><text x="10" y="${122}" font-size="11" font-weight="800" fill="var(--blue)">−</text>`;
      chips.forEach((s, i) => {
        const st = t0 + i * DROP, p = ease((t - st) / 0.4, 0, 1);
        if (p <= 0) return;
        const { x, y } = slot(i), col = (s > 0 ? plusIdx : minusIdx).indexOf(i);
        let cy = y - (1 - p) * 40, op = p, cx = x;
        if (col < pairs) {
          const ps = dropEnd + col * PAIR, q = ease((t - ps) / (PAIR * 0.6), 0, 1), fade = ease((t - ps - PAIR * 0.55) / (PAIR * 0.4), 0, 1);
          cy = cy + (90 - y) * q; op = p * (1 - fade);
          if (q > 0.95 && fade < 1 && s > 0) o += `<text x="${cx}" y="${90 - 18}" text-anchor="middle" font-size="11" font-weight="900" fill="currentColor" opacity="${1 - fade}">0</text>`;
        }
        if (op > 0.01) o += `<g opacity="${op.toFixed(2)}"><circle cx="${cx}" cy="${cy}" r="${R}" fill="${s > 0 ? 'var(--red)' : 'var(--blue)'}"/><text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="15" font-weight="900" fill="#fff">${s > 0 ? '+' : '−'}</text></g>`;
      });
      o += `<text x="${W / 2}" y="${H - 16}" text-anchor="middle" font-size="17" font-weight="900" fill="currentColor">${t >= pairEnd + 0.4 ? `${neg(a)} + ${b < 0 ? `(${neg(b)})` : b} = ${neg(sum)}` : `${neg(a)} + ${b < 0 ? `(${neg(b)})` : b}`}</text>`;
      return o;
    },
    caption: (t) => {
      if (t < dropEnd) return `${neg(a)} on ${Math.abs(a)} ${a < 0 ? 'miinus' : 'plus'}nappia, ${neg(b)} on ${Math.abs(b)} ${b < 0 ? 'miinus' : 'plus'}nappia.`;
      if (t < pairEnd) return pairs ? 'Plus ja miinus kumoavat toisensa: nollapari häviää.' : 'Kaikki napit ovat samanmerkkisiä: nollapareja ei synny.';
      return sum === 0 ? 'Kaikki napit kumosivat toisensa: summa on 0.' : `Jäljelle jäi ${Math.abs(sum)} ${sum < 0 ? 'miinus' : 'plus'}nappia: summa on ${neg(sum)}.`;
    },
  });
}

/** Subtracting a negative with chips: a's chips drop in; if there are not enough minus chips to take away,
 *  zero pairs (+ and − together = 0) are added; then the |b| minus chips are lifted away one by one. */
export function takeNegScene(a: number, b: number): AnimPaint {
  const W = 330, H = 200, R = 11, t0 = 0.6, DROP = 0.22, ADD = 0.55, TAKE = 0.5, nb = -b;
  const avail = a < 0 ? -a : 0, k = Math.max(0, nb - avail);
  const plusA = a > 0 ? a : 0, minusA = avail;
  const addAt = t0 + Math.abs(a) * DROP + 0.5, takeAt = addAt + k * ADD + (k ? 0.6 : 0), endAt = takeAt + nb * TAKE + 0.3, dur = endAt + 3;
  const px = (i: number) => 30 + i * 22;
  return anim({
    dur, w: W, h: H, label: 'Negatiivisen vähentäminen napeilla',
    frame: (t) => {
      let o = `<text x="10" y="66" font-size="12" font-weight="900" fill="var(--red)">+</text><text x="10" y="122" font-size="12" font-weight="900" fill="var(--blue)">−</text>`;
      const chip = (x: number, y: number, s: number, op = 1) => `<g opacity="${op.toFixed(2)}"><circle cx="${x}" cy="${y}" r="${R}" fill="${s > 0 ? 'var(--red)' : 'var(--blue)'}"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-size="14" font-weight="900" fill="#fff">${s > 0 ? '+' : '−'}</text></g>`;
      for (let i = 0; i < Math.abs(a); i++) { const p = ease((t - t0 - i * DROP) / 0.35, 0, 1); if (p > 0) o += chip(px(i), (a > 0 ? 62 : 118) - (1 - p) * 30, Math.sign(a), p); }
      for (let j = 0; j < k; j++) {
        const p = ease((t - addAt - j * ADD) / 0.4, 0, 1); if (p <= 0) continue;
        const x = px((a > 0 ? plusA : 0) + j);
        o += chip(x, 62, 1, p);
        if (t < takeAt + 0.2) o += `<text x="${x}" y="92" text-anchor="middle" font-size="10" font-weight="900" fill="currentColor" opacity="${p.toFixed(2)}">0</text>`;
      }
      // minus chips: a's own (if a < 0) then the added halves; the first nb of them are taken away
      const minusX = (m: number) => (m < minusA ? px(m) : px((a > 0 ? plusA : 0) + (m - minusA)));
      for (let m = 0; m < minusA + k; m++) {
        const appear = m < minusA ? ease((t - t0 - m * DROP) / 0.35, 0, 1) : ease((t - addAt - (m - minusA) * ADD) / 0.4, 0, 1);
        if (appear <= 0) continue;
        let y = m < minusA ? 118 - (1 - appear) * 30 : 118, op = appear;
        if (m < nb) { const q = ease((t - takeAt - m * TAKE) / 0.45, 0, 1); y -= q * 110; op *= 1 - q; }
        if (op > 0.01) o += chip(minusX(m), y, -1, op);
      }
      const bs = `(${neg(b)})`;
      o += `<text x="${W / 2}" y="${H - 14}" text-anchor="middle" font-size="17" font-weight="900" fill="currentColor">${neg(a)} − ${bs}${t >= endAt ? ` = ${neg(a - b)}` : ''}</text>`;
      return o;
    },
    caption: (t) => {
      if (t < addAt) return `Aloitetaan luvusta ${neg(a)}: ${Math.abs(a)} ${a < 0 ? 'miinus' : 'plus'}nappia.`;
      if (t < takeAt) return `Pitäisi ottaa pois ${nb} miinusnappia, mutta niitä ${avail ? `on vain ${avail}` : 'ei ole'}. Lisätään nollapareja: plus ja miinus yhdessä on 0, joten luku ei muutu.`;
      if (t < endAt) return `Nyt otetaan pois ${nb} miinusnappia.`;
      return `Jäljelle jäi ${neg(a - b)}. Miinusten poistaminen teki saman kuin ${nb} plussan lisääminen: ${neg(a)} − ${`(${neg(b)})`} = ${neg(a)} + ${nb}.`;
    },
  });
}

// ---------------------------------------------------------------- the sign rule as a pattern
/** k · m for m = ms[0], ms[1], … (stepping down by one): each row appears, and on the number line below
 *  the product jumps by −k from the previous one, so the pattern carries on past zero. */
export function mulPatternScene(k: number, ms: number[]): AnimPaint {
  const prods = ms.map((m) => k * m), lo = Math.min(...prods, 0) - 1, hi = Math.max(...prods, 0) + 1;
  const W = 330, ROW = 1.3, t0 = 0.6, LY = 40 + ms.length * 22 + 30, H = LY + 40, dur = t0 + ms.length * ROW + 3;
  const X = (v: number) => 20 + ((v - lo) / (hi - lo)) * (W - 40), every = hi - lo > 16 ? 5 : hi - lo > 10 ? 2 : 1;
  const P = (v: number) => (v < 0 ? `(${neg(v)})` : String(v));
  let base = `<line x1="10" y1="${LY}" x2="${W - 10}" y2="${LY}" stroke="currentColor" stroke-width="2.2"/>`;
  for (let v = Math.ceil(lo); v <= hi; v++) {
    base += `<line x1="${X(v)}" y1="${LY - (v === 0 ? 9 : 4)}" x2="${X(v)}" y2="${LY + (v === 0 ? 9 : 4)}" stroke="currentColor" stroke-width="${v === 0 ? 3 : 1.2}"/>`;
    if (v % every === 0) base += `<text x="${X(v)}" y="${LY + 22}" text-anchor="middle" font-size="11" font-weight="${v === 0 ? 900 : 600}" fill="currentColor" opacity=".85">${neg(v)}</text>`;
  }
  return anim({
    dur, w: W, h: H, label: 'Merkkisääntö kaavasta',
    frame: (t) => {
      let s = base;
      const shown = Math.max(0, Math.min(ms.length, Math.floor((t - t0) / ROW) + 1));
      for (let i = 0; i < shown; i++) {
        const p = ease((t - t0 - i * ROW) / 0.4, 0, 1), neg0 = prods[i]! < 0, col = neg0 ? 'var(--blue)' : prods[i]! > 0 ? 'var(--red)' : 'currentColor';
        s += `<g opacity="${p.toFixed(2)}"><text x="${W / 2 - 10}" y="${40 + i * 22}" text-anchor="end" font-size="15" font-weight="800" fill="currentColor">${P(k)} · ${P(ms[i]!)} =</text><text x="${W / 2}" y="${40 + i * 22}" font-size="15" font-weight="900" fill="${col}">${neg(prods[i]!)}</text>`;
        if (i) s += `<text x="${W / 2 + 54}" y="${40 + i * 22}" font-size="11" font-weight="800" fill="currentColor" opacity=".7">${-k > 0 ? '+' : '−'}${Math.abs(k)}</text>`;
        s += `</g>`;
        if (i) {
          const a = X(prods[i - 1]!), b = X(prods[i]!), q = ease((t - t0 - i * ROW - 0.2) / 0.6, 0, 1);
          if (q > 0) { const mx = a + (b - a) * q; s += `<path d="M${a} ${LY - 4} Q${(a + mx) / 2} ${LY - 26} ${mx} ${LY - 4}" fill="none" stroke="var(--sun)" stroke-width="2.4"/>`; }
        }
        s += `<circle cx="${X(prods[i]!)}" cy="${LY}" r="5" fill="${col}" opacity="${p.toFixed(2)}"/>`;
      }
      return s;
    },
    caption: (t) => {
      const i = Math.floor((t - t0) / ROW);
      if (i < 1) return `Kerrotaan luvulla ${neg(k)}. Seuraa tuloa lukusuoralla.`;
      if (i < ms.length) { const m = ms[i]!; return m < 0 ? `Kaava jatkuu nollan ohi: tulo ${k > 0 ? 'pienenee' : 'kasvaa'} taas ${Math.abs(k)}:lla, joten ${P(k)} · ${P(m)} = ${neg(k * m)}.` : `Joka rivillä tulo ${k > 0 ? 'pienenee' : 'kasvaa'} ${Math.abs(k)}:lla.`; }
      return k > 0 ? 'Positiivinen kertaa negatiivinen on negatiivinen.' : 'Negatiivinen kertaa negatiivinen on positiivinen: kaava kasvaa nollan yli.';
    },
  });
}

// ---------------------------------------------------------------- division with chips
/** Same-sign or positive-divisor division with chips. Divisor > 0: the dividend's chips are dealt one at a
 *  time into `divisor` boxes (each box is the quotient). Divisor < 0 (dividend < 0): chips are bundled into
 *  groups of |divisor| minus chips and the groups are counted. */
export function divChipScene(dividend: number, divisor: number): AnimPaint {
  const n = Math.abs(dividend), s = Math.sign(dividend), share = divisor > 0, g = share ? divisor : n / -divisor, per = n / g;
  const W = 330, R = 9, t0 = 0.8, DEAL = 0.28, endAt = t0 + n * DEAL + 0.5, dur = endAt + 3.2;
  const BW = Math.min(76, (W - 20) / g - 6), cols = Math.max(2, Math.floor((BW - 8) / (2 * R + 3))), rows = Math.ceil(per / cols);
  const BH = rows * (2 * R + 3) + 12, H = 50 + 30 + BH + 54;
  const bx = (b: number) => 10 + b * ((W - 20) / g) + ((W - 20) / g - BW) / 2;
  const col = s < 0 ? 'var(--blue)' : 'var(--red)', sign = s < 0 ? '−' : '+';
  const q = dividend / divisor, P = (v: number) => (v < 0 ? `(${neg(v)})` : String(v));
  return anim({
    dur, w: W, h: H, label: 'Jakolasku napeilla',
    frame: (t) => {
      const dealt = Math.max(0, Math.min(n, Math.floor((t - t0) / DEAL) + 1));
      let o = '';
      // the pile still waiting
      for (let i = dealt; i < n; i++) { const x = 16 + (i % 15) * 20, y = 18 + Math.floor(i / 15) * 18; o += `<circle cx="${x}" cy="${y}" r="${R - 1}" fill="${col}" opacity=".9"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" font-weight="900" fill="#fff">${sign}</text>`; }
      for (let b = 0; b < g; b++) o += `<rect x="${bx(b)}" y="80" width="${BW}" height="${BH}" rx="8" fill="none" stroke="currentColor" stroke-opacity=".5" stroke-width="1.5" ${share ? '' : 'stroke-dasharray="4 3"'}/>`;
      for (let i = 0; i < dealt; i++) {
        const b = share ? i % g : Math.floor(i / per), k = share ? Math.floor(i / g) : i % per;
        const tx = bx(b) + 4 + R + (k % cols) * (2 * R + 3), ty = 80 + 6 + R + Math.floor(k / cols) * (2 * R + 3);
        const p = ease((t - t0 - i * DEAL) / 0.3, 0, 1), sx = 16 + (i % 15) * 20, sy = 18 + Math.floor(i / 15) * 18;
        const x = sx + (tx - sx) * p, y = sy + (ty - sy) * p - Math.sin(Math.PI * p) * 14;
        o += `<circle cx="${x}" cy="${y}" r="${R}" fill="${col}"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" font-weight="900" fill="#fff">${sign}</text>`;
      }
      if (t >= endAt) {
        for (let b = 0; b < g; b++) o += `<text x="${bx(b) + BW / 2}" y="${80 + BH + 16}" text-anchor="middle" font-size="12" font-weight="900" fill="${col}">${share ? neg(s * per) : neg(divisor)}</text>`;
        o += `<text x="${W / 2}" y="${H - 8}" text-anchor="middle" font-size="16" font-weight="900" fill="currentColor">${P(dividend)} : ${P(divisor)} = ${neg(q)}</text>`;
      }
      return o;
    },
    caption: (t) => {
      if (t < t0) return share ? `Jaetaan ${neg(dividend)} tasan ${divisor} laatikkoon.` : `Montako ${neg(divisor)}:n ryhmää saadaan luvusta ${neg(dividend)}?`;
      if (t < endAt) return share ? 'Napit jaetaan yksi kerrallaan vuorotellen laatikoihin.' : `Kootaan ${-divisor} miinusnapin ryhmiä.`;
      return share ? `Jokaiseen laatikkoon tuli ${neg(s * per)}. Tarkistus: ${divisor} · ${P(q)} = ${neg(dividend)}.` : `Ryhmiä tuli ${q}, siis positiivinen määrä. Tarkistus: ${P(divisor)} · ${q} = ${neg(dividend)}.`;
    },
  });
}
