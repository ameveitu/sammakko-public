// Ordering shown in time: the learner watches the shortest (or smallest) being searched for among
// the ones still left, one look at a time, and then moved to the next place in the line.
import { anim, ease, type AnimPaint } from '../ui/anim';
import { flatAt, fillOf } from './geoanim';
import { SHAPE_NAME, type ShapeKind } from './parts';

const ELA: Record<number, string> = { 3: 'kolmesta', 4: 'neljästä', 5: 'viidestä', 6: 'kuudesta' };

export interface OrderOpts {
  /** Shown on each bar (numbers). Without labels the bars are plain sticks. */
  labels?: string[];
  /** Largest first instead of smallest first. */
  down?: boolean;
  /** Pixels per unit of height. */
  unit?: number;
}

/** Bars of heights `vals` stand in a row; selection by eye: scan the rest, find the smallest, swap it
 *  into the next place. Ends with the staircase that shows the order. */
export function orderScene(vals: number[], o: OrderOpts = {}): AnimPaint {
  const n = vals.length, W = 300, H = 222, BASE = 176, gap = (W - 40) / n, bw = Math.min(34, gap * 0.55);
  const unit = o.unit ?? Math.min(16, 140 / Math.max(...vals));
  const better = (a: number, b: number) => (o.down ? vals[a]! > vals[b]! : vals[a]! < vals[b]!);
  const LOOK = 0.42, MOVE = 0.9, t0 = 0.9;
  // Precompute the steps of a selection by eye.
  type Step = { k: number; looks: number[]; best: number[]; m: number; at: number; scan: number; before: number[] };
  const arr = vals.map((_, i) => i), steps: Step[] = [];
  let tt = t0;
  for (let k = 0; k < n - 1; k++) {
    const looks: number[] = [], best: number[] = [];
    let m = k;
    for (let j = k; j < n; j++) { looks.push(arr[j]!); if (j > k && better(arr[j]!, arr[m]!)) m = j; best.push(arr[m]!); }
    steps.push({ k, looks, best, m, at: tt, scan: looks.length * LOOK, before: [...arr] });
    tt += looks.length * LOOK + (m !== k ? MOVE : 0.35);
    [arr[k], arr[m]] = [arr[m]!, arr[k]!];
  }
  const end = tt, final = [...arr];
  const name = (i: number) => (o.labels ? o.labels[i]! : 'tämä keppi');
  const word = o.labels ? (o.down ? 'suurin' : 'pienin') : o.down ? 'pisin' : 'lyhyin';
  const xOf = (p: number) => 20 + gap * (p + 0.5);
  const bar = (i: number, x: number, y: number, hi: string, op = 1) => {
    const h = vals[i]! * unit;
    return `<g opacity="${op}"><rect x="${x - bw / 2}" y="${y - h}" width="${bw}" height="${h}" rx="${Math.min(8, bw / 2)}" fill="#8a5a33" stroke="${hi || 'none'}" stroke-width="4"/>` +
      (o.labels ? `<text x="${x}" y="${y - h - 6}" text-anchor="middle" font-size="16" font-weight="800" fill="currentColor">${o.labels[i]}</text>` : '') + '</g>';
  };
  return anim({
    dur: end + 2.8, w: W, h: H, label: `Järjestys: ${word} ensin`,
    frame: (t) => {
      let s = `<line x1="10" y1="${BASE}" x2="${W - 10}" y2="${BASE}" stroke="var(--pond)" stroke-width="3"/>`;
      const cur = steps.find((st, i) => t >= st.at && (i === steps.length - 1 || t < steps[i + 1]!.at));
      const done = !cur ? (t < t0 ? 0 : n) : t >= end ? n : cur.k;
      for (let p = 0; p < n; p++) s += `<text x="${xOf(p)}" y="${BASE + 22}" text-anchor="middle" font-size="13" font-weight="800" fill="${p < done || t >= end ? 'var(--ok)' : 'var(--soft)'}">${p + 1}.</text>`;
      if (done > 0 && t < end) s += `<rect x="${20}" y="${BASE + 4}" width="${gap * done}" height="4" rx="2" fill="var(--ok)"/>`;
      if (!cur || t >= end) {
        const order = t >= end ? final : vals.map((_, i) => i);
        order.forEach((i, p) => { s += bar(i, xOf(p), BASE, ''); });
        if (t >= end) {
          const g = ease(t, end, end + 1.2), pts = order.map((i, p) => `${xOf(p)},${BASE - vals[i]! * unit}`);
          s += `<polyline points="${pts.join(' ')}" fill="none" stroke="var(--sun)" stroke-width="4" stroke-dasharray="6 5" stroke-linecap="round" opacity="${g}"/>`;
        }
        return s;
      }
      const ts = t - cur.at, li = Math.min(cur.looks.length - 1, Math.floor(ts / LOOK)), scanning = ts < cur.scan;
      const best = cur.best[scanning ? li : cur.looks.length - 1]!, look = cur.looks[li]!;
      const mv = cur.m === cur.k ? 1 : ease(ts, cur.scan, cur.scan + MOVE);
      let top = '';
      cur.before.forEach((i, p) => {
        let x = xOf(p), y = BASE, op = 1;
        if (!scanning && cur.m !== cur.k && (p === cur.k || p === cur.m)) {
          const q = p === cur.k ? cur.m : cur.k;
          x = xOf(p) + (xOf(q) - xOf(p)) * mv;
          if (p === cur.m) y = BASE - 22 * Math.sin(Math.PI * mv); // the chosen one hops over
          else op = 1 - 0.55 * Math.sin(Math.PI * mv);
        }
        const hi = i === best ? 'var(--sun)' : scanning && i === look ? 'var(--pond)' : '';
        if (i === best && !scanning) top = bar(i, x, y, hi); else s += bar(i, x, y, hi, op);
      });
      s += top;
      if (scanning) { const px = xOf(cur.k + li); s += `<path d="M${px - 8} ${BASE + 34} L${px + 8} ${BASE + 34} L${px} ${BASE + 26}Z" fill="var(--pond)"/>`; }
      return s;
    },
    caption: (t) => {
      if (t < t0) return o.labels ? `Luvut jonossa sekaisin. Laitetaan ne järjestykseen: ${word} ensin.` : `Kepit sekaisin. Laitetaan ne järjestykseen: ${word} ensin.`;
      if (t >= end) return o.labels ? `Valmis: ${final.map((i) => o.labels![i]).join(', ')}. Portaat ${o.down ? 'laskevat' : 'nousevat'} koko ajan.` : `Valmis! Kepit muodostavat ${o.down ? 'laskevat' : 'nousevat'} portaat.`;
      const cur = [...steps].reverse().find((st) => t >= st.at)!;
      const ts = t - cur.at, left = n - cur.k;
      if (ts < cur.scan) return left === 2 ? `Enää kaksi jäljellä. Kumpi on ${word}?` : `Etsitään ${word} ${ELA[left] ?? left} jäljellä olevasta.`;
      const b = cur.best[cur.best.length - 1]!;
      return o.labels ? `${name(b)} on ${word}. Se menee paikalle ${cur.k + 1}.` : `Löytyi ${word} keppi. Se menee paikalle ${cur.k + 1}.`;
    },
  });
}

const nm = (k: ShapeKind) => SHAPE_NAME[k][0];

/** A row of shapes is laid one by one; the repeating part is framed, then each repeat gets the same
 *  frame ("taas sama"). The empty place pulses; with `reveal` the next shape slides in. */
export function patternScene(seq: { k: ShapeKind; c: string }[], unitLen: number, next: { k: ShapeKind; c: string }, reveal = true): AnimPaint {
  const n = seq.length, W = 320, H = 130, step = Math.min(40, (W - 20) / (n + 1)), S = step * 0.78, Y = 70;
  const xOf = (i: number) => 10 + step * (i + 0.5);
  const LAY = 0.32, t0 = 0.4, tB = t0 + n * LAY + 0.3, reps = Math.floor(n / unitLen), BR = 0.9, tQ = tB + reps * BR, tN = tQ + 1.2;
  const unitTxt = seq.slice(0, unitLen).map((x) => nm(x.k)).join(', ');
  const pos = n % unitLen;
  return anim({
    dur: (reveal ? tN + 1.2 : tQ + 0.8) + 2, w: W, h: H, label: `Kuvio: ${unitTxt} toistuu`,
    frame: (t) => {
      let s = `<rect x="4" y="${Y + S / 2 + 10}" width="${W - 8}" height="6" rx="3" fill="#ecd49a"/>`;
      for (let r = 0; r < reps; r++) {
        const g = ease(t, tB + r * BR, tB + r * BR + 0.4);
        if (g > 0) s += `<rect x="${xOf(r * unitLen) - step / 2 + 1}" y="${Y - S / 2 - 8}" width="${(step * unitLen - 2) * g}" height="${S + 16}" rx="10" fill="var(--pond-soft)" stroke="var(--pond)" stroke-width="2.5" stroke-dasharray="${r === 0 ? 'none' : '6 4'}"/>`;
      }
      if (t >= tB + reps * BR - 0.5 && n > reps * unitLen) {
        const g = ease(t, tQ - 0.5, tQ);
        s += `<rect x="${xOf(reps * unitLen) - step / 2 + 1}" y="${Y - S / 2 - 8}" width="${(step * (n - reps * unitLen + 1) - 2) * g}" height="${S + 16}" rx="10" fill="none" stroke="var(--sun)" stroke-width="2.5" stroke-dasharray="6 4"/>`;
      }
      seq.forEach((it, i) => {
        const g = ease(t, t0 + i * LAY, t0 + i * LAY + 0.28);
        if (g > 0) s += `<g opacity="${g}">${flatAt(it.k, xOf(i), Y - 18 * (1 - g), S, fillOf(it.c))}</g>`;
      });
      const qx = xOf(n);
      if (!reveal || t < tN) {
        const pulse = t >= tQ ? 1 + 0.12 * Math.sin((t - tQ) * 6) : 1;
        if (t > t0 + n * LAY) s += `<rect x="${qx - S / 2}" y="${Y - S / 2}" width="${S}" height="${S}" rx="8" fill="none" stroke="var(--soft)" stroke-width="2.5" stroke-dasharray="5 4" transform="translate(${qx} ${Y}) scale(${pulse}) translate(${-qx} ${-Y})"/><text x="${qx}" y="${Y + 7}" text-anchor="middle" font-size="20" font-weight="900" fill="var(--soft)">?</text>`;
      } else {
        const g = ease(t, tN, tN + 0.6);
        s += `<g opacity="${g}">${flatAt(next.k, qx, Y + 40 * (1 - g), S, fillOf(next.c))}</g><circle cx="${qx}" cy="${Y}" r="${S * 0.72}" fill="none" stroke="var(--sun)" stroke-width="${3 * g}"/>`;
      }
      return s;
    },
    caption: (t) => {
      if (t < tB) return 'Aava asettaa kuvioita riviin.';
      const r = Math.floor((t - tB) / BR);
      if (t < tQ) return r === 0 ? `Toistuva osa: ${unitTxt}.` : 'Taas sama osa!';
      if (!reveal || t < tN) return pos === 0 ? 'Osa on valmis. Mikä tulee seuraavaksi?' : `Uusi osa on alkanut: ${seq.slice(n - pos).map((x) => nm(x.k)).join(', ')}… Mikä tulee seuraavaksi?`;
      return pos === 0 ? `Uusi osa alkaa alusta: ${nm(next.k)}.` : `Osa jatkuu: seuraavaksi tulee ${nm(next.k)}.`;
    },
  });
}

/** Dot figures grow: each figure copies the previous one and `d` new dots pop in (yellow). With
 *  `reveal` the next figure is built too; otherwise its place shows "?". */
export function growScene(s0: number, d: number, shown = 3, reveal = true): AnimPaint {
  const W = 320, H = 200, cols = shown + 1, cw = (W - 20) / cols, R = 6, BASE = 160;
  const t0 = 0.5, PER = 1.6, tEnd = t0 + (reveal ? cols : shown) * PER;
  const dotXY = (c: number, j: number) => [10 + cw * (c + 0.5) + (j % 2 === 0 ? -8 : 8), BASE - 8 - Math.floor(j / 2) * 16] as const;
  const cnt = (c: number) => s0 + c * d;
  return anim({
    dur: tEnd + (reveal ? 2.4 : 1.6), w: W, h: H, label: `Kasvava kuvio: ${d} lisää joka kerta`,
    frame: (t) => {
      let s = `<line x1="8" y1="${BASE + 4}" x2="${W - 8}" y2="${BASE + 4}" stroke="var(--pond)" stroke-width="2"/>`;
      for (let c = 0; c < cols; c++) {
        const a = t0 + c * PER, x = 10 + cw * (c + 0.5);
        const known = c < shown || reveal;
        if (t < a) continue;
        s += `<text x="${x}" y="${BASE + 24}" text-anchor="middle" font-size="13" font-weight="800" fill="var(--soft)">${c + 1}. kuva</text>`;
        if (!known) { s += `<text x="${x}" y="${BASE - 40}" text-anchor="middle" font-size="34" font-weight="900" fill="var(--soft)">?</text>`; continue; }
        const old = c === 0 ? 0 : cnt(c - 1);
        for (let j = 0; j < cnt(c); j++) {
          const [dx, dy] = dotXY(c, j), fresh = j >= old;
          const g = fresh ? ease(t, a + 0.3 + (j - old) * 0.18, a + 0.5 + (j - old) * 0.18) : ease(t, a, a + 0.3);
          if (g <= 0) continue;
          s += `<circle cx="${dx}" cy="${dy}" r="${R * (fresh ? 0.6 + 0.4 * g : 1)}" fill="${fresh && c > 0 ? 'var(--sun)' : 'var(--pond)'}" stroke="currentColor" stroke-width="1.2" opacity="${g}"/>`;
        }
        const g2 = ease(t, a + 0.6 + d * 0.18, a + 0.9 + d * 0.18);
        if (g2 > 0) s += `<text x="${x}" y="${BASE - 22 - Math.ceil(cnt(c) / 2) * 16}" text-anchor="middle" font-size="16" font-weight="900" fill="currentColor" opacity="${g2}">${cnt(c)}</text>`;
      }
      return s;
    },
    caption: (t) => {
      if (t < t0 + 0.6) return `Ensimmäisessä kuvassa on ${s0} ${s0 === 1 ? 'piste' : 'pistettä'}.`;
      const c = Math.min(cols - 1, Math.floor((t - t0) / PER));
      if (t >= tEnd) return reveal ? `Joka kerta tulee ${d} lisää: ${cnt(0)}, ${cnt(1)}, ${cnt(2)}, ${cnt(3)}.` : `Joka kerta tulee ${d} uutta pistettä. Montako pistettä on seuraavassa kuvassa?`;
      if (c === 0) return `Ensimmäisessä kuvassa on ${s0} ${s0 === 1 ? 'piste' : 'pistettä'}.`;
      return `Kuva ${c + 1}: samat pisteet kuin edellisessä ja ${d} uutta (keltaiset).`;
    },
  });
}

export interface SieveLine { text: string; keep: boolean; chip?: string; say: string }

/** A story is read line by line, then the magnifier visits each line with the question in mind:
 *  needed facts turn green and their number drops into the calculation; the rest are crossed out. */
export function sieveScene(lines: SieveLine[], question: string, calc: string): AnimPaint {
  const W = 320, H = 60 + lines.length * 30 + 92, LY = (i: number) => 34 + i * 30, QY = LY(lines.length) + 6, CY = H - 26;
  const t0 = 0.3, IN = 0.45, tQ = t0 + lines.length * IN + 0.2, tS = tQ + 1.4, PER = 1.7, tC = tS + lines.length * PER, chips = lines.filter((l) => l.chip);
  const chipX = (k: number) => W / 2 - (chips.length - 1) * 34 + k * 68;
  return anim({
    dur: tC + 3, w: W, h: H, label: `Tärkeä tieto: ${calc}`,
    frame: (t) => {
      let s = `<rect x="6" y="8" width="${W - 12}" height="${QY + 14}" rx="12" fill="var(--card)" stroke="var(--line)" stroke-width="2"/>`;
      lines.forEach((l, i) => {
        const a = ease(t, t0 + i * IN, t0 + i * IN + 0.35), y = LY(i), at = tS + i * PER, judged = ease(t, at + 0.5, at + 0.9);
        if (a <= 0) return;
        const col = judged > 0 ? (l.keep ? 'var(--ok)' : 'var(--soft)') : 'currentColor';
        if (judged > 0 && l.keep) s += `<rect x="14" y="${y - 16}" width="${(W - 28) * judged}" height="24" rx="6" fill="var(--ok-soft)"/>`;
        s += `<text x="20" y="${y}" font-size="14" font-weight="${l.keep && judged > 0 ? 800 : 600}" fill="${col}" opacity="${a * (l.keep ? 1 : 1 - 0.45 * judged)}">${l.text}</text>`;
        if (!l.keep && judged > 0) s += `<line x1="16" y1="${y - 5}" x2="${16 + Math.min(W - 40, l.text.length * 8.3 + 6) * judged}" y2="${y - 5}" stroke="var(--bad)" stroke-width="2.5" stroke-linecap="round"/>`;
      });
      const qa = ease(t, tQ, tQ + 0.4);
      if (qa > 0) s += `<text x="20" y="${QY}" font-size="14" font-weight="900" fill="var(--pond)" opacity="${qa}">${question}</text>`;
      // magnifier
      if (t >= tS - 0.4 && t < tC) {
        const i = Math.min(lines.length - 1, Math.max(0, Math.floor((t - tS) / PER))), from = i === 0 ? QY : LY(i - 1), mv = ease(t, tS + i * PER - 0.4, tS + i * PER + 0.2);
        const y = from + (LY(i) - from) * mv - 6;
        s += `<g transform="translate(${W - 34} ${y})"><circle r="12" fill="none" stroke="currentColor" stroke-width="3"/><line x1="8" y1="8" x2="17" y2="17" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></g>`;
      }
      // calculation strip
      s += `<rect x="20" y="${CY - 24}" width="${W - 40}" height="40" rx="12" fill="var(--pond-soft)" stroke="var(--pond)" stroke-width="2" stroke-dasharray="6 4"/>`;
      let k = 0;
      lines.forEach((l, i) => {
        if (!l.chip) return;
        const at = tS + i * PER, g = ease(t, at + 0.7, at + 1.4), x0 = W / 2, y0 = LY(i) - 4, x1 = chipX(k++), y1 = CY + 2;
        if (g <= 0 || t >= tC + 0.6) return;
        s += `<text x="${x0 + (x1 - x0) * g}" y="${y0 + (y1 - y0) * g - 30 * Math.sin(Math.PI * g)}" text-anchor="middle" font-size="20" font-weight="900" fill="var(--ok)">${l.chip}</text>`;
      });
      const cg = ease(t, tC + 0.3, tC + 0.9);
      if (cg > 0) s += `<text x="${W / 2}" y="${CY + 4}" text-anchor="middle" font-size="22" font-weight="900" fill="currentColor" opacity="${cg}">${calc}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < tQ) return 'Aava lukee havainnot.';
      if (t < tS) return `Kysymys: ${question} Mitä tietoa siihen tarvitaan?`;
      if (t >= tC) return `Laskuun tarvitaan vain vihreät tiedot: ${calc}.`;
      return lines[Math.min(lines.length - 1, Math.floor((t - tS) / PER))]!.say;
    },
  });
}

// ---------------------------------------------------------------- systematic listing
const HAT_COL: Record<string, string> = { punainen: '#d9534f', sininen: '#3f7fd6', keltainen: '#f2c230' };
const PAT_GEN: Record<string, string> = { raita: 'raitahuivi', pallo: 'pallohuivi', tähti: 'tähtihuivi' };

/** One outfit: a coloured hat above a scarf with its pattern. (x, y) is the hat's centre top. */
function outfitArt(x: number, y: number, hat: string, pat: string, s = 1, op = 1) {
  const hw = 26 * s, hh = 14 * s, sw = 34 * s, sh = 12 * s, sy = y + hh + 14 * s;
  let p = `<g opacity="${op}"><path d="M${x - hw / 2} ${y + hh} L${x - hw / 3} ${y} L${x + hw / 3} ${y} L${x + hw / 2} ${y + hh} Z" fill="${HAT_COL[hat] ?? '#888'}" stroke="currentColor" stroke-width="1.5"/>`;
  p += `<line x1="${x - hw / 2 - 4 * s}" y1="${y + hh}" x2="${x + hw / 2 + 4 * s}" y2="${y + hh}" stroke="currentColor" stroke-width="2"/>`;
  p += `<circle cx="${x}" cy="${y + hh + 7 * s}" r="${6 * s}" fill="#7fc59a" stroke="currentColor" stroke-width="1.2"/>`;
  p += `<rect x="${x - sw / 2}" y="${sy}" width="${sw}" height="${sh}" rx="${4 * s}" fill="var(--card)" stroke="currentColor" stroke-width="1.5"/>`;
  if (pat === 'raita') for (let k = 1; k < 4; k++) p += `<line x1="${x - sw / 2 + k * sw / 4}" y1="${sy + 1}" x2="${x - sw / 2 + k * sw / 4}" y2="${sy + sh - 1}" stroke="var(--bad)" stroke-width="${2.5 * s}"/>`;
  else if (pat === 'pallo') for (let k = 0; k < 3; k++) p += `<circle cx="${x - sw / 3 + k * sw / 3}" cy="${sy + sh / 2}" r="${2.6 * s}" fill="var(--pond)"/>`;
  else p += `<text x="${x}" y="${sy + sh - 2 * s}" text-anchor="middle" font-size="${11 * s}" fill="var(--sun)" stroke="currentColor" stroke-width="0.4">★★</text>`;
  return p + '</g>';
}

/** Guessing outfits at random: each draw pops up; a repeat is struck out with "jo on!"; after the draws
 *  the shelf shows which outfits were never found (dashed "?"). */
export function guessOutfitsScene(hats: string[], pats: string[], draws: [number, number][]): AnimPaint {
  const W = 320, H = 230, nb = pats.length, t0 = 0.4, PER = 1.3, tEnd = t0 + draws.length * PER;
  const seen = new Set<string>(), first: boolean[] = draws.map(([i, j]) => { const k = `${i},${j}`; const f = !seen.has(k); seen.add(k); return f; });
  const found = seen.size, total = hats.length * nb;
  const cx = (j: number) => 60 + j * ((W - 90) / Math.max(1, nb - 1)), cy = (i: number) => 120 + i * 56;
  return anim({
    dur: tEnd + 3.2, w: W, h: H, label: `Arvaillen löytyi ${found} asua ${total}:sta`,
    frame: (t) => {
      let s = `<text x="${W / 2}" y="18" text-anchor="middle" font-size="13" font-weight="800" fill="var(--soft)">Arvonta</text>`;
      const k = Math.min(draws.length - 1, Math.floor((t - t0) / PER));
      if (t >= t0 && t < tEnd) {
        const [i, j] = draws[k]!, g = ease(t, t0 + k * PER, t0 + k * PER + 0.35);
        s += outfitArt(W / 2, 30, hats[i]!, pats[j]!, 1, g);
        if (!first[k] && g >= 1) s += `<line x1="${W / 2 - 26}" y1="34" x2="${W / 2 + 26}" y2="70" stroke="var(--bad)" stroke-width="4" stroke-linecap="round"/><text x="${W / 2 + 34}" y="56" font-size="15" font-weight="900" fill="var(--bad)">jo on!</text>`;
      }
      s += `<line x1="10" y1="96" x2="${W - 10}" y2="96" stroke="var(--line)" stroke-width="2"/>`;
      for (let i = 0; i < hats.length; i++) for (let j = 0; j < nb; j++) {
        const at = draws.findIndex(([a, b]) => a === i && b === j);
        if (at >= 0 && t >= t0 + at * PER + 0.5) s += outfitArt(cx(j), cy(i) - 18, hats[i]!, pats[j]!, 0.9, ease(t, t0 + at * PER + 0.5, t0 + at * PER + 0.9));
        else if (t >= tEnd + 0.4) {
          const g = ease(t, tEnd + 0.4, tEnd + 0.9);
          s += `<rect x="${cx(j) - 22}" y="${cy(i) - 22}" width="44" height="46" rx="8" fill="none" stroke="var(--bad)" stroke-width="2" stroke-dasharray="5 4" opacity="${g}"/><text x="${cx(j)}" y="${cy(i) + 8}" text-anchor="middle" font-size="22" font-weight="900" fill="var(--bad)" opacity="${g}">?</text>`;
        }
      }
      return s;
    },
    caption: (t) => {
      if (t < t0) return 'Loikka arpoo asuja sattumalta.';
      if (t >= tEnd + 0.4) return `${draws.length} arvausta, mutta löytyi vain ${found} asua. ${total - found} jäi löytymättä. Arvaillen jotain jää pois!`;
      const k = Math.min(draws.length - 1, Math.floor((t - t0) / PER)), [i, j] = draws[k]!;
      return `${k + 1}. arvaus: ${hats[i]} hattu ja ${PAT_GEN[pats[j]!] ?? pats[j]}.${first[k] ? '' : ' Tämä on jo löytynyt!'}`;
    },
  });
}

/** Systematic listing: one hat stays put (pin) while every scarf is tried in turn; each outfit drops
 *  into its row. Row counts appear and the total is written as hats × scarves. */
export function systemOutfitsScene(hats: string[], pats: string[]): AnimPaint {
  const nb = pats.length, na = hats.length, total = na * nb, W = 320, RH = 62, H = 56 + na * RH + 40;
  const t0 = 0.5, PER = 1.15, ROW = 0.6, at = (i: number, j: number) => t0 + i * (nb * PER + ROW) + j * PER, tEnd = at(na - 1, nb - 1) + PER;
  const cx = (j: number) => 112 + j * 62, cy = (i: number) => 50 + i * RH;
  return anim({
    dur: tEnd + 3.4, w: W, h: H, label: `Järjestelmällisesti: ${na} × ${nb} = ${total} asua`,
    frame: (t) => {
      let s = '';
      for (let i = 0; i < na; i++) {
        const a = at(i, 0) - 0.4, g = ease(t, a, a + 0.3);
        if (g <= 0) continue;
        const live = t >= a && t < at(i, nb - 1) + PER;
        s += `<rect x="8" y="${cy(i) - 8}" width="${W - 16}" height="${RH - 6}" rx="10" fill="${live ? 'var(--pond-soft)' : 'var(--card)'}" stroke="var(--line)" stroke-width="1.5" opacity="${g}"/>`;
        s += `<path d="M${30} ${cy(i) + 26} L${38} ${cy(i) + 6} L${58} ${cy(i) + 6} L${66} ${cy(i) + 26} Z" fill="${HAT_COL[hats[i]!]}" stroke="currentColor" stroke-width="1.5" opacity="${g}"/>`;
        if (live) s += `<text x="48" y="${cy(i) + 44}" text-anchor="middle" font-size="10" font-weight="800" fill="var(--pond)">📌 pysyy</text>`;
        for (let j = 0; j < nb; j++) {
          const b = at(i, j), gg = ease(t, b, b + 0.45);
          if (gg <= 0) continue;
          s += outfitArt(cx(j), cy(i) - 2 + 20 * (1 - gg), hats[i]!, pats[j]!, 0.85, gg);
          if (t >= b && t < b + PER && live) s += `<rect x="${cx(j) - 24}" y="${cy(i) - 6}" width="48" height="${RH - 14}" rx="8" fill="none" stroke="var(--sun)" stroke-width="3"/>`;
        }
        const done = ease(t, at(i, nb - 1) + 0.6, at(i, nb - 1) + 1);
        if (done > 0) s += `<text x="${W - 22}" y="${cy(i) + 30}" text-anchor="end" font-size="18" font-weight="900" fill="var(--ok)" opacity="${done}">${nb}</text>`;
      }
      const g = ease(t, tEnd + 0.3, tEnd + 0.9);
      if (g > 0) s += `<text x="${W / 2}" y="${H - 12}" text-anchor="middle" font-size="22" font-weight="900" fill="currentColor" opacity="${g}">${na} × ${nb} = ${total} asua ✓</text>`;
      return s;
    },
    caption: (t) => {
      if (t >= tEnd) return `Jokaisella hatulla ${nb} huivia. ${na} hattua × ${nb} huivia = ${total} asua, eikä yksikään jäänyt pois.`;
      for (let i = na - 1; i >= 0; i--) if (t >= at(i, 0) - 0.4) {
        const j = Math.max(0, Math.min(nb - 1, Math.floor((t - at(i, 0)) / PER)));
        return `${hats[i]![0]!.toUpperCase() + hats[i]!.slice(1)} hattu pysyy paikallaan. Huivi ${j + 1}/${nb}: ${PAT_GEN[pats[j]!] ?? pats[j]}.`;
      }
      return 'Pidetään yksi hattu paikallaan ja vaihdetaan vain huivia.';
    },
  });
}

/** A tree of two-digit numbers: each first digit branches to every digit; the branch to itself is struck
 *  out ("sama"), the others become numbers that join the growing list. */
export function digitTreeScene(ds: number[]): AnimPaint {
  const n = ds.length, RH = 21, GAP = 10, W = 320, H = 34 + n * (n * RH + GAP) + 30;
  const t0 = 0.4, PER = 1.0, GP = 0.5, at = (a: number, b: number) => t0 + a * (n * PER + GP) + b * PER + GP, tEnd = at(n - 1, n - 1) + PER;
  const by = (a: number, b: number) => 34 + a * (n * RH + GAP) + b * RH + RH / 2, ay = (a: number) => by(a, (n - 1) / 2);
  const nums = ds.flatMap((x) => ds.filter((y) => y !== x).map((y) => `${x}${y}`));
  return anim({
    dur: tEnd + 3.4, w: W, h: H, label: `Kaikki luvut: ${nums.join(', ')}`,
    frame: (t) => {
      let s = `<text x="34" y="18" text-anchor="middle" font-size="11" font-weight="800" fill="var(--soft)">kymp.</text><text x="110" y="18" text-anchor="middle" font-size="11" font-weight="800" fill="var(--soft)">ykk.</text><text x="250" y="18" text-anchor="middle" font-size="11" font-weight="800" fill="var(--soft)">luku</text>`;
      ds.forEach((x, a) => {
        const g = ease(t, at(a, 0) - GP, at(a, 0) - GP + 0.3);
        if (g <= 0) return;
        s += `<circle cx="34" cy="${ay(a)}" r="14" fill="var(--pond)" opacity="${g}"/><text x="34" y="${ay(a) + 6}" text-anchor="middle" font-size="17" font-weight="900" fill="#fff" opacity="${g}">${x}</text>`;
        ds.forEach((y, b) => {
          const st = at(a, b), lg = ease(t, st, st + 0.35);
          if (lg <= 0) return;
          const same = x === y, yy = by(a, b);
          s += `<line x1="48" y1="${ay(a)}" x2="${48 + (96 - 48) * lg}" y2="${ay(a) + (yy - ay(a)) * lg}" stroke="${same ? 'var(--bad)' : 'var(--pond)'}" stroke-width="2" ${same ? 'stroke-dasharray="4 3"' : ''}/>`;
          const tg = ease(t, st + 0.3, st + 0.55);
          if (tg <= 0) return;
          s += `<text x="110" y="${yy + 5}" text-anchor="middle" font-size="16" font-weight="900" fill="${same ? 'var(--bad)' : 'currentColor'}" opacity="${tg}">${y}</text>`;
          if (same) s += `<line x1="100" y1="${yy - 7}" x2="120" y2="${yy + 7}" stroke="var(--bad)" stroke-width="3" opacity="${tg}"/><text x="134" y="${yy + 5}" font-size="12" font-weight="800" fill="var(--bad)" opacity="${tg}">sama ✗</text>`;
          else {
            const ng = ease(t, st + 0.5, st + 0.9);
            if (ng > 0) s += `<line x1="128" y1="${yy}" x2="${128 + 90 * ng}" y2="${yy}" stroke="var(--line)" stroke-width="1.5" stroke-dasharray="3 3"/><text x="250" y="${yy + 6}" text-anchor="middle" font-size="18" font-weight="900" fill="var(--ok)" opacity="${ng}">${x}${y}</text>`;
          }
        });
      });
      const g = ease(t, tEnd + 0.3, tEnd + 0.9);
      if (g > 0) s += `<text x="${W / 2}" y="${H - 10}" text-anchor="middle" font-size="16" font-weight="900" fill="currentColor" opacity="${g}">${n} × ${n - 1} = ${nums.length} lukua ✓</text>`;
      return s;
    },
    caption: (t) => {
      if (t >= tEnd) return `Kaikki luvut: ${nums.join(', ')}. Jokaisella alulla ${n - 1} lukua, yhteensä ${nums.length}.`;
      for (let a = n - 1; a >= 0; a--) if (t >= at(a, 0) - GP) {
        const b = Math.max(0, Math.min(n - 1, Math.floor((t - at(a, 0)) / PER)));
        return ds[b] === ds[a] ? `${ds[a]}${ds[b]}? Ei käy: samaa numeroa ei käytetä kahdesti.` : `Alussa ${ds[a]}, perään ${ds[b]}: luku ${ds[a]}${ds[b]}.`;
      }
      return 'Ensin ykkönen kymppien paikalle, sitten vuorotellen muut.';
    },
  });
}

/** Handshakes around a table: the first friend shakes with everyone after them, then the second with
 *  the ones still left, and so on. The running sum shows (n−1) + (n−2) + … + 1. */
export function handshakeScene(n: number): AnimPaint {
  const W = 320, H = 250, CX = 120, CY = 106, R = 80, L = 'ABCDEF';
  const pairs: [number, number][] = [];
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) pairs.push([a, b]);
  const t0 = 0.6, PER = 0.9, GP = 0.5, start = pairs.map(([a], k) => t0 + k * PER + a * GP), tEnd = start[start.length - 1]! + PER;
  const pt = (i: number) => [CX + R * Math.sin((2 * Math.PI * i) / n), CY - R * Math.cos((2 * Math.PI * i) / n)] as const;
  const COLS = ['var(--pond)', 'var(--ok)', 'var(--sun)', 'var(--bad)', '#9b6bd6'];
  const parts = Array.from({ length: n - 1 }, (_, i) => n - 1 - i);
  return anim({
    dur: tEnd + 3.2, w: W, h: H, label: `${n} ystävää: ${pairs.length} kättelyä`,
    frame: (t) => {
      let s = '';
      pairs.forEach(([a, b], k) => {
        const g = ease(t, start[k]!, start[k]! + 0.5);
        if (g <= 0) return;
        const [x1, y1] = pt(a), [x2, y2] = pt(b);
        s += `<line x1="${x1}" y1="${y1}" x2="${x1 + (x2 - x1) * g}" y2="${y1 + (y2 - y1) * g}" stroke="${COLS[a % COLS.length]}" stroke-width="3" stroke-linecap="round"/>`;
      });
      const cur = pairs.findIndex((_, k) => t >= start[k]! && t < start[k]! + PER);
      for (let i = 0; i < n; i++) {
        const [x, y] = pt(i), hot = cur >= 0 && pairs[cur]!.includes(i);
        s += `<circle cx="${x}" cy="${y}" r="${hot ? 17 : 15}" fill="var(--card)" stroke="${COLS[i % COLS.length]}" stroke-width="3"/><text x="${x}" y="${y + 6}" text-anchor="middle" font-size="16" font-weight="900" fill="currentColor">${L[i]}</text>`;
      }
      // running sum on the right
      parts.forEach((p, a) => {
        const last = pairs.findIndex(([x], k) => x === a && (k === pairs.length - 1 || pairs[k + 1]![0] !== a));
        const g = ease(t, start[last]! + 0.5, start[last]! + 0.9);
        if (g <= 0) return;
        s += `<text x="${236}" y="${44 + a * 30}" font-size="16" font-weight="900" fill="${COLS[a % COLS.length]}" opacity="${g}">${L[a]}: ${p}</text>`;
      });
      const g = ease(t, tEnd + 0.3, tEnd + 0.9);
      if (g > 0) s += `<text x="${W / 2}" y="${H - 8}" text-anchor="middle" font-size="17" font-weight="900" fill="currentColor" opacity="${g}">${parts.join(' + ')} = ${pairs.length} kättelyä</text>`;
      return s;
    },
    caption: (t) => {
      if (t < t0) return `${n} ystävää. Jokainen kättelee jokaista kerran.`;
      if (t >= tEnd) return `${parts.join(' + ')} = ${pairs.length}. Vanhaa paria ei kätellä uudestaan.`;
      const k = Math.max(0, pairs.findIndex((_, q) => t < start[q]! + PER)), [a, b] = pairs[k]!;
      const isNew = pairs.findIndex(([x]) => x === a) === k;
      return `${L[a]} ja ${L[b]} kättelevät.${isNew && a > 0 ? ` ${L[a]} on jo kätellyt ${L.slice(0, a).split('').map((c) => c + ':n').join(' ja ')} kanssa, joten vain uudet.` : ''}`;
    },
  });
}
