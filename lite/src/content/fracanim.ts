// Fractions as motion: a pie is cut one knife stroke at a time, then each slice is lifted onto
// the first one. Equal slices cover it exactly; unequal ones stick out or leave a gap.
import { anim, ease, type AnimPaint } from '../ui/anim';
import { frog } from '../ui/art';

const NAMES: Record<number, string> = { 2: 'puolikas', 3: 'kolmasosa', 4: 'neljäsosa', 5: 'viidesosa', 6: 'kuudesosa', 8: 'kahdeksasosa' };

const wedge = (cx: number, cy: number, R: number, a0: number, a1: number) => {
  const p = (t: number) => `${cx + R * Math.cos(t)} ${cy + R * Math.sin(t)}`;
  return `M${cx} ${cy} L${p(a0)} A${R} ${R} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p(a1)} Z`;
};

/** Cut a pie into `n` pieces (equal unless `sizes` given) and test every piece against the first. */
export function cutScene(n: number, sizes?: number[]): AnimPaint {
  const f = sizes ?? Array(n).fill(1 / n), W = 320, H = 270, PX = 86, PY = 118, R = 66, RX = 236, RY = 118;
  const starts: number[] = []; let acc = -Math.PI / 2; for (const x of f) { starts.push(acc); acc += x * 2 * Math.PI; }
  const fair = f.every((x) => Math.abs(x - f[0]!) < 1e-6);
  const T0 = 0.8, CT = 0.6, T1 = T0 + n * CT, T2 = T1 + 0.8, ST = 1.5, fin = T2 + (n - 1) * ST;
  const cmp = (i: number) => Math.abs(f[i]! - f[0]!) < 1e-6;
  return anim({
    dur: fin + 2.4, w: W, h: H, label: `Piirakka ${n} osaan`,
    frame: (t) => {
      let s = `<circle cx="${PX}" cy="${PY}" r="${R + 3}" fill="#d9a55b"/>`;
      const ex = ease(t, T1, T1 + 0.5) * 5;
      const cur = t >= T2 ? Math.min(n - 1, Math.floor((t - T2) / ST) + 1) : -1;
      f.forEach((x, i) => {
        const a0 = starts[i]!, a1 = a0 + x * 2 * Math.PI, mid = (a0 + a1) / 2;
        const dx = Math.cos(mid) * ex, dy = Math.sin(mid) * ex;
        const hl = i === cur && t < fin + 0.1 ? '#f6c46a' : i === 0 && t >= T2 ? '#f0a4ae' : '#f3dcaa';
        s += `<path d="${wedge(PX + dx, PY + dy, R, a0, a1)}" fill="${hl}" stroke="${t >= T1 ? 'currentColor' : 'none'}" stroke-width="2"/>`;
      });
      // Knife strokes appear one by one before the slices separate.
      if (t < T1 + 0.5) for (let i = 0; i < n; i++) {
        const o = ease(t, T0 + i * CT, T0 + i * CT + CT * 0.6); if (o <= 0) continue;
        const a = starts[i]!; s += `<line x1="${PX}" y1="${PY}" x2="${PX + Math.cos(a) * R * o}" y2="${PY + Math.sin(a) * R * o}" stroke="#5a3a1a" stroke-width="3" stroke-linecap="round"/>`;
      }
      // Reference: the first slice copied to the comparison plate.
      if (t >= T2 - 0.6) {
        const o = ease(t, T2 - 0.6, T2);
        s += `<circle cx="${RX}" cy="${RY}" r="${R + 8}" fill="none" stroke="currentColor" stroke-opacity="0.25" stroke-dasharray="4 4"/>`;
        s += `<path d="${wedge(RX, RY, R, -Math.PI / 2, -Math.PI / 2 + f[0]! * 2 * Math.PI)}" fill="#f0a4ae" opacity="${o * 0.85}" stroke="currentColor" stroke-width="2"/>`;
        s += `<text x="${RX}" y="${RY + R + 26}" text-anchor="middle" font-size="12" fill="currentColor" opacity="${o}">1. pala vertailulautasella</text>`;
      }
      // Flying copies: each later slice rotates onto the reference.
      for (let i = 1; i < n; i++) {
        const c0 = T2 + (i - 1) * ST; if (t < c0) continue;
        const k = ease(t, c0, c0 + 0.7), gone = t > c0 + ST && i < n - 1 ? 1 : 0;
        if (gone) continue;
        const a0 = starts[i]! + (-Math.PI / 2 - starts[i]!) * k, a1 = a0 + f[i]! * 2 * Math.PI;
        const cx = PX + (RX - PX) * k, cy = PY + (RY - PY) * k;
        const ok = cmp(i), v = t > c0 + 0.8;
        s += `<path d="${wedge(cx, cy, R, a0, a1)}" fill="#f6c46a" opacity="0.7" stroke="${v ? (ok ? 'var(--ok)' : '#c0392b') : 'currentColor'}" stroke-width="${v ? 3.5 : 2}"/>`;
        if (v) s += `<text x="${RX}" y="${RY - R - 18}" text-anchor="middle" font-size="15" font-weight="800" fill="${ok ? 'var(--ok)' : '#c0392b'}">${i + 1}. pala: ${ok ? '✓ täsmälleen sama' : f[i]! > f[0]! ? '✗ isompi' : '✗ pienempi'}</text>`;
      }
      // Tally of checks.
      for (let i = 1; i < n; i++) if (t > T2 + (i - 1) * ST + 0.8) s += `<text x="${PX - (n - 2) * 11 + (i - 1) * 22}" y="${H - 46}" text-anchor="middle" font-size="18" font-weight="800" fill="${cmp(i) ? 'var(--ok)' : '#c0392b'}">${cmp(i) ? '✓' : '✗'}</text>`;
      if (t >= fin + 0.4) s += `<text x="${W / 2}" y="${H - 14}" text-anchor="middle" font-size="16" font-weight="800" fill="${fair ? 'var(--ok)' : '#c0392b'}" opacity="${ease(t, fin + 0.4, fin + 0.9)}">${fair ? `Reilu: ${n} yhtä suurta palaa${NAMES[n] ? `, jokainen ${NAMES[n]}` : ''}` : `${n} palaa, mutta eri kokoisia: ei reilu`}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < T0) return `Piirakka jaetaan ${n} palaan. Katso leikkauksia.`;
      if (t < T1) return `${Math.min(n, Math.floor((t - T0) / CT) + 1)}. leikkaus.`;
      if (t < T2) return 'Palat irti toisistaan. Ovatko ne yhtä suuria? Testataan nostamalla palat päällekkäin.';
      if (t < fin + 0.4) { const i = Math.min(n - 1, Math.floor((t - T2) / ST) + 1); return `${i + 1}. pala nostetaan ensimmäisen päälle: ${cmp(i) ? 'se peittää sen täsmälleen.' : f[i]! > f[0]! ? 'se on isompi.' : 'se jää pienemmäksi.'}`; }
      return fair ? `Kaikki palat peittävät toisensa: jako on reilu.${NAMES[n] ? ` Jokainen pala on ${NAMES[n]}.` : ''}` : 'Palojen määrä ei riitä: reilussa jaossa palat ovat yhtä suuria.';
    },
  });
}

const NUM = ['nolla', 'yksi', 'kaksi', 'kolme', 'neljä', 'viisi', 'kuusi', 'seitsemän', 'kahdeksan', 'yhdeksän'];
const PART: Record<number, [string, string]> = { 2: ['puolikas', 'puolikasta'], 3: ['kolmasosa', 'kolmasosaa'], 4: ['neljäsosa', 'neljäsosaa'], 5: ['viidesosa', 'viidesosaa'], 6: ['kuudesosa', 'kuudesosaa'], 7: ['seitsemäsosa', 'seitsemäsosaa'], 8: ['kahdeksasosa', 'kahdeksasosaa'], 9: ['yhdeksäsosa', 'yhdeksäsosaa'], 10: ['kymmenesosa', 'kymmenesosaa'] };
/** "kaksi viidesosaa" */
export const fracWords = (a: number, b: number) => `${NUM[a] ?? a} ${PART[b]?.[a === 1 ? 0 : 1] ?? `${b}:sosaa`}`;

/** Count all parts (→ denominator), then colour the taken ones (→ numerator); the fraction assembles on the right. */
export function nameScene(b: number, a: number, shape: 'pie' | 'bar' = 'pie', trap = false): AnimPaint {
  const W = 320, H = 260, PX = 90, PY = 116, R = 70, BX = 14, BY = 92, BW = 170, BH = 50;
  const T0 = 0.8, CT = 0.5, T1 = T0 + b * CT + 0.4, AT = 0.8, T2 = T1 + a * AT + 0.3;
  const seg = (i: number, fill: string, sw: number, stroke = 'currentColor') => shape === 'pie'
    ? `<path d="${wedge(PX, PY, R, -Math.PI / 2 + (i * 2 * Math.PI) / b, -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / b)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`
    : `<rect x="${BX + (i * BW) / b}" y="${BY}" width="${BW / b}" height="${BH}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  const lab = (i: number) => shape === 'pie'
    ? [PX + Math.cos(-Math.PI / 2 + ((i + 0.5) * 2 * Math.PI) / b) * R * 0.62, PY + Math.sin(-Math.PI / 2 + ((i + 0.5) * 2 * Math.PI) / b) * R * 0.62 + 5]
    : [BX + ((i + 0.5) * BW) / b, BY + BH / 2 + 5];
  return anim({
    dur: T2 + 3, w: W, h: H, label: `${a}/${b}`,
    frame: (t) => {
      let s = shape === 'pie' ? `<circle cx="${PX}" cy="${PY}" r="${R + 3}" fill="#d9a55b"/>` : '';
      const counted = t < T0 ? 0 : Math.min(b, Math.floor((t - T0) / CT) + 1), taken = t < T1 ? 0 : Math.min(a, Math.floor((t - T1) / AT) + 1);
      let top = '';
      for (let i = 0; i < b; i++) {
        const isNew = t >= T0 + i * CT && t < T0 + (i + 1) * CT && t < T1;
        if (isNew) top = seg(i, i < taken ? '#d65a6f' : '#f3dcaa', 4, '#2a7de1');
        else s += seg(i, i < taken ? '#d65a6f' : '#f3dcaa', 2);
      }
      s += top;
      for (let i = 0; i < b; i++) {
        const [x, y] = lab(i);
        if (t < T1 && i < counted) s += `<text x="${x}" y="${y}" text-anchor="middle" font-size="14" font-weight="800" fill="#2a7de1">${i + 1}</text>`;
        else if (t >= T1 && i < taken) s += `<text x="${x}" y="${y}" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">${i + 1}</text>`;
      }
      // Fraction on the right.
      const FX = 254;
      s += `<line x1="${FX - 30}" x2="${FX + 30}" y1="${PY}" y2="${PY}" stroke="currentColor" stroke-width="3" opacity="${ease(t, 0.2, 0.7)}"/>`;
      if (counted) s += `<text x="${FX}" y="${PY + 42}" text-anchor="middle" font-size="38" font-weight="800" fill="#2a7de1">${counted}</text>`;
      if (taken) s += `<text x="${FX}" y="${PY - 12}" text-anchor="middle" font-size="38" font-weight="800" fill="#d65a6f">${taken}</text>`;
      s += `<text x="${FX}" y="${PY + 64}" text-anchor="middle" font-size="11" fill="#2a7de1" opacity="${ease(t, T0, T0 + 0.4)}">osia yhteensä</text>`;
      s += `<text x="${FX}" y="${PY - 56}" text-anchor="middle" font-size="11" fill="#d65a6f" opacity="${ease(t, T1, T1 + 0.4)}">väritetty</text>`;
      if (t >= T2) s += `<text x="${W / 2}" y="${H - 16}" text-anchor="middle" font-size="18" font-weight="800" fill="var(--ok)" opacity="${ease(t, T2, T2 + 0.5)}">${a}/${b} = ${fracWords(a, b)}</text>`;
      if (trap && t >= T2 + 1) s += `<text x="${W - 30}" y="${36}" text-anchor="middle" font-size="22" font-weight="800" fill="#c0392b" opacity="${ease(t, T2 + 1, T2 + 1.5)}"><tspan text-decoration="line-through">${a}/${b - a}</tspan> ✗</text>`;
      return s;
    },
    caption: (t) => {
      if (t < T0) return `Kokonainen on jaettu yhtä suuriin osiin. Lasketaan ensin kaikki osat.`;
      if (t < T1) return `Osia: ${Math.min(b, Math.floor((t - T0) / CT) + 1)}. Kaikkien osien määrä menee alas.`;
      if (t < T2) return `Väritetään ${Math.min(a, Math.floor((t - T1) / AT) + 1)}. osa. Väritettyjen määrä menee ylös.`;
      return `${a} ${a === 1 ? 'osa' : 'osaa'} kaikkiaan ${b} yhtä suuresta osasta: ${a}/${b}, ${fracWords(a, b)}.${trap ? ` Ei ${a}/${b - a}: alas tulevat kaikki osat.` : ''}`;
    },
  });
}

/** The same pie is cut finer and finer (denominators `ns`); the highlighted piece shrinks and a size meter records it. */
export function shrinkScene(ns: number[] = [2, 4, 8]): AnimPaint {
  const W = 320, H = 260, PX = 86, PY = 116, R = 70, ST = 2.4, T0 = 0.6, fin = T0 + ns.length * ST;
  return anim({
    dur: fin + 2.2, w: W, h: H, label: `1/${ns.join(', 1/')}`,
    frame: (t) => {
      const k = Math.max(0, Math.min(ns.length - 1, Math.floor((t - T0) / ST))), n = ns[k]!, prev = k ? ns[k - 1]! : 1;
      const local = t - T0 - k * ST, cut = ease(local, 0.1, 0.9);
      let s = `<circle cx="${PX}" cy="${PY}" r="${R + 3}" fill="#d9a55b"/><circle cx="${PX}" cy="${PY}" r="${R}" fill="#f3dcaa" stroke="currentColor" stroke-width="2"/>`;
      // Highlighted piece: shrinks from 1/prev to 1/n as the new cut lands.
      const span = t < T0 ? 0 : (2 * Math.PI) / prev + ((2 * Math.PI) / n - (2 * Math.PI) / prev) * ease(local, 0.9, 1.4);
      if (span > 0) s += `<path d="${wedge(PX, PY, R, -Math.PI / 2, -Math.PI / 2 + span)}" fill="#d65a6f" stroke="currentColor" stroke-width="2"/>`;
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / n, old = (i * prev) % n === 0;
        const o = t < T0 ? 0 : old ? 1 : cut;
        if (o > 0) s += `<line x1="${PX}" y1="${PY}" x2="${PX + Math.cos(a) * R * o}" y2="${PY + Math.sin(a) * R * o}" stroke="#5a3a1a" stroke-width="2.5"/>`;
      }
      // Size meter rows.
      ns.forEach((m, j) => {
        const o = ease(t, T0 + j * ST + 1.2, T0 + j * ST + 1.7); if (o <= 0) return;
        const y = 50 + j * 46;
        s += `<text x="186" y="${y + 6}" font-size="20" font-weight="800" fill="currentColor">1/${m}</text>`;
        s += `<rect x="226" y="${y - 8}" width="${(160 / m) * o}" height="18" rx="3" fill="#d65a6f"/>`;
      });
      if (t >= fin) s += `<text x="${W / 2}" y="${H - 14}" text-anchor="middle" font-size="16" font-weight="800" fill="var(--ok)" opacity="${ease(t, fin, fin + 0.5)}">Suurempi nimittäjä → pienempi pala</text>`;
      return s;
    },
    caption: (t) => {
      if (t < T0) return 'Yksi piirakka. Leikataan sitä yhä pienemmiksi paloiksi.';
      if (t < fin) { const k = Math.min(ns.length - 1, Math.floor((t - T0) / ST)); return `Nimittäjä ${ns[k]}: kokonainen jaetaan ${ns[k]} osaan, joten yksi pala on 1/${ns[k]}.${k ? ` Se on pienempi kuin 1/${ns[k - 1]}.` : ''}`; }
      return `Mitä useampaan osaan jaetaan, sitä pienempi yksi pala: 1/${ns[0]} > ${ns.slice(1).map((m) => `1/${m}`).join(' > ')}.`;
    },
  });
}

/** Two eaters take a/b and c/b of the same bar: pieces colour one by one, numerators add, the denominator stays. */
export function eatTwoScene(b: number, a: number, c: number): AnimPaint {
  const W = 320, H = 250, BX = 14, BY = 60, BW = 292, BH = 50, PW = BW / b, T0 = 0.8, PT = 0.6, T1 = T0 + a * PT + 0.4, T2 = T1 + c * PT + 0.4;
  return anim({
    dur: T2 + 4, w: W, h: H, label: `${a}/${b} + ${c}/${b}`,
    frame: (t) => {
      const na = t < T0 ? 0 : Math.min(a, Math.floor((t - T0) / PT) + 1), nc = t < T1 ? 0 : Math.min(c, Math.floor((t - T1) / PT) + 1);
      let s = '';
      for (let i = 0; i < b; i++) {
        const col = i < na ? '#d65a6f' : i >= a && i < a + nc ? '#4caf50' : '#f3dcaa';
        s += `<rect x="${BX + i * PW}" y="${BY}" width="${PW}" height="${BH}" fill="${col}" stroke="currentColor" stroke-width="2"/>`;
      }
      if (na) s += `<text x="${BX + (na * PW) / 2}" y="${BY - 10}" text-anchor="middle" font-size="13" font-weight="700" fill="#d65a6f">Aava ${na}/${b}</text>`;
      if (nc) s += `<text x="${BX + (a + nc / 2) * PW}" y="${BY + BH + 20}" text-anchor="middle" font-size="13" font-weight="700" fill="#4caf50">Loikka ${nc}/${b}</text>`;
      // Equation: numerators add, denominator stays.
      if (t >= T2) {
        const o = ease(t, T2, T2 + 0.6), o2 = ease(t, T2 + 1, T2 + 1.6), y = 178;
        const fr = (x: number, top: string | number, bot: string | number, col: string) => `<text x="${x}" y="${y - 6}" text-anchor="middle" font-size="22" font-weight="800" fill="${col}">${top}</text><line x1="${x - 18}" x2="${x + 18}" y1="${y}" y2="${y}" stroke="currentColor" stroke-width="2.5"/><text x="${x}" y="${y + 24}" text-anchor="middle" font-size="22" font-weight="800" fill="#2a7de1">${bot}</text>`;
        s += `<g opacity="${o}">${fr(60, a, b, '#d65a6f')}<text x="98" y="${y + 8}" text-anchor="middle" font-size="22" font-weight="800" fill="currentColor">+</text>${fr(136, c, b, '#4caf50')}<text x="174" y="${y + 8}" text-anchor="middle" font-size="22" font-weight="800" fill="currentColor">=</text>${fr(214, a + c, b, 'currentColor')}</g>`;
        s += `<text x="${W / 2}" y="${H - 8}" text-anchor="middle" font-size="13" font-weight="700" fill="#2a7de1" opacity="${o2}">Nimittäjä pysyy ${b}: jokainen pala on yhä 1/${b}.</text>`;
        s += `<text x="280" y="${y + 8}" text-anchor="middle" font-size="16" font-weight="800" fill="#c0392b" opacity="${o2}"><tspan text-decoration="line-through">${a + c}/${2 * b}</tspan> ✗</text>`;
      }
      return s;
    },
    caption: (t) => {
      if (t < T0) return `Levyssä on ${b} yhtä suurta palaa.`;
      if (t < T1) return `Aava ottaa ${Math.min(a, Math.floor((t - T0) / PT) + 1)}. palan.`;
      if (t < T2) return `Loikka ottaa ${Math.min(c, Math.floor((t - T1) / PT) + 1)}. palan.`;
      return `Yhteensä ${a} + ${c} = ${a + c} palaa, ja jokainen on 1/${b}. Siis ${a + c}/${b}, ei ${a + c}/${2 * b}: levy ei kasvanut kaksinkertaiseksi.`;
    },
  });
}

/** Two bars with the same denominator fill piece by piece in step; the shorter stops, the gap is marked, the sign appears. */
export function raceScene(n: number, a: number, b: number, who: [string, string] = ['Aava', 'Loikka']): AnimPaint {
  const W = 320, H = 250, BX = 70, BW = 236, BH = 38, Y = [46, 112], PW = BW / n, T0 = 0.9, PT = 0.65, T1 = T0 + Math.max(a, b) * PT + 0.3, T2 = T1 + 1.4;
  const sym = a === b ? '=' : a < b ? '<' : '>', lo = Math.min(a, b), hi = Math.max(a, b);
  return anim({
    dur: T2 + 2.6, w: W, h: H, label: `${a}/${n} ${sym} ${b}/${n}`,
    frame: (t) => {
      const k = t < T0 ? 0 : Math.min(hi, Math.floor((t - T0) / PT) + 1);
      let s = '';
      [a, b].forEach((v, r) => {
        const y = Y[r]!, cnt = Math.min(v, k), col = r ? '#4caf50' : '#d65a6f';
        s += `<text x="8" y="${y + 16}" font-size="12" font-weight="700" fill="${col}">${who[r]}</text>`;
        s += `<text x="8" y="${y + 34}" font-size="16" font-weight="800" fill="currentColor">${cnt}/${n}</text>`;
        for (let i = 0; i < n; i++) s += `<rect x="${BX + i * PW}" y="${y}" width="${PW}" height="${BH}" fill="${i < cnt ? col : '#f3dcaa'}" stroke="currentColor" stroke-width="1.8"/>`;
        if (cnt === v && k > v && t < T1) s += `<text x="${BX + v * PW + 4}" y="${y + 25}" font-size="11" font-weight="700" fill="#1b2a22">valmis ✓</text>`;
      });
      if (t >= T1 && lo !== hi) {
        const o = ease(t, T1, T1 + 0.5), x0 = BX + lo * PW, x1 = BX + hi * PW;
        s += `<line x1="${x0}" x2="${x0}" y1="${Y[0]! - 6}" y2="${Y[1]! + BH + 6}" stroke="#2a7de1" stroke-width="2" stroke-dasharray="4 3" opacity="${o}"/>`;
        s += `<path d="M${x0} ${Y[1]! + BH + 14} L${x0} ${Y[1]! + BH + 20} L${x1} ${Y[1]! + BH + 20} L${x1} ${Y[1]! + BH + 14}" fill="none" stroke="#2a7de1" stroke-width="2" opacity="${o}"/>`;
        s += `<text x="${(x0 + x1) / 2}" y="${Y[1]! + BH + 36}" text-anchor="middle" font-size="12" font-weight="700" fill="#2a7de1" opacity="${o}">${hi - lo} ${hi - lo === 1 ? 'pala' : 'palaa'} enemmän</text>`;
      }
      if (t >= T2) s += `<text x="${W / 2}" y="${H - 14}" text-anchor="middle" font-size="26" font-weight="800" fill="var(--ok)" opacity="${ease(t, T2, T2 + 0.5)}">${a}/${n} ${sym} ${b}/${n}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < T0) return `Molemmat levyt on jaettu ${n} yhtä suureen palaan. Palat ovat siis samankokoisia.`;
      if (t < T1) return `Otetaan pala kerrallaan rinnakkain: ${Math.min(hi, Math.floor((t - T0) / PT) + 1)}. pala.`;
      if (t < T2) return lo === hi ? 'Yhtä monta palaa: yhtä paljon.' : `${who[a > b ? 0 : 1]} sai ${hi - lo} palaa enemmän.`;
      return `Sama nimittäjä: vertaa vain osoittajia. ${a} ${sym} ${b}, joten ${a}/${n} ${sym} ${b}/${n}.`;
    },
  });
}

/** Pieces from two plates (a/n and b/n) slide one by one into a shared dish; then the n+n trap is shown as a smaller amount. */
export function mergeScene(n: number, a: number, b: number): AnimPaint {
  const W = 320, H = 300, P = [[58, 62], [262, 62]] as const, PR = 38, DX = 130, DY = 170, DR = 62, T0 = 1, PT = 0.75, T1 = T0 + (a + b) * PT + 0.3, T2 = T1 + 1.6;
  const ang = (i: number, m = n) => -Math.PI / 2 + (i * 2 * Math.PI) / m;
  const pie = (cx: number, cy: number, R: number, m: number, k: number, col: string) => {
    let s = `<circle cx="${cx}" cy="${cy}" r="${R + 2}" fill="#d9a55b"/>`;
    for (let i = 0; i < m; i++) s += `<path d="${wedge(cx, cy, R, ang(i, m), ang(i + 1, m))}" fill="${i < k ? col : '#f3dcaa'}" stroke="currentColor" stroke-width="${m > 10 ? 1 : 1.6}"/>`;
    return s;
  };
  return anim({
    dur: T2 + 4, w: W, h: H, label: `${a}/${n} + ${b}/${n}`,
    frame: (t) => {
      const moved = t < T0 ? 0 : Math.min(a + b, (t - T0) / PT);
      let s = '';
      // Plates with pieces still waiting.
      [[a, '#d65a6f', 0], [b, '#4caf50', a]].forEach(([k, col, off], r) => {
        const [cx, cy] = P[r]!; s += `<ellipse cx="${cx}" cy="${cy + PR + 6}" rx="${PR + 8}" ry="6" fill="currentColor" opacity="0.15"/>`;
        s += `<circle cx="${cx}" cy="${cy}" r="${PR}" fill="none" stroke="currentColor" stroke-opacity="0.3" stroke-dasharray="3 3"/>`;
        for (let i = 0; i < (k as number); i++) if (moved < (off as number) + i + 1 - 1e-6 && moved <= (off as number) + i) s += `<path d="${wedge(cx, cy, PR, ang(i), ang(i + 1))}" fill="${col}" stroke="currentColor" stroke-width="1.6"/>`;
        s += `<text x="${cx}" y="${cy + PR + 26}" text-anchor="middle" font-size="15" font-weight="800" fill="${col}">${k}/${n}</text>`;
      });
      // Dish.
      s += `<circle cx="${DX}" cy="${DY}" r="${DR + 3}" fill="#d9a55b"/>`;
      for (let i = 0; i < n; i++) s += `<path d="${wedge(DX, DY, DR, ang(i), ang(i + 1))}" fill="${i < Math.floor(moved + 1e-6) ? (i < a ? '#d65a6f' : '#4caf50') : '#f3dcaa'}" stroke="currentColor" stroke-width="1.6"/>`;
      // The piece in flight.
      const j = Math.floor(moved); if (moved < a + b && t >= T0) {
        const f = ease(moved - j, 0, 1), src = j < a ? 0 : 1, si = j < a ? j : j - a, [sx, sy] = P[src]!;
        const cx = sx + (DX - sx) * f, cy = sy + (DY - sy) * f, R = PR + (DR - PR) * f, a0 = ang(si) + (ang(j) - ang(si)) * f;
        s += `<path d="${wedge(cx, cy, R, a0, a0 + (2 * Math.PI) / n)}" fill="${src ? '#4caf50' : '#d65a6f'}" stroke="currentColor" stroke-width="2"/>`;
      }
      const k = Math.floor(moved + 1e-6);
      s += `<text x="${DX}" y="${DY + DR + 28}" text-anchor="middle" font-size="18" font-weight="800" fill="currentColor">${t >= T1 ? `${a}/${n} + ${b}/${n} = ${a + b}/${n}` : `${k}/${n}`}</text>`;
      // Trap: what n+n would mean.
      if (t >= T2) {
        const o = ease(t, T2, T2 + 0.6);
        s += `<g opacity="${o}">${pie(272, 204, 34, 2 * n, a + b, '#c0392b')}</g>`;
        s += `<text x="272" y="160" text-anchor="middle" font-size="16" font-weight="800" fill="#c0392b" opacity="${o}">${a + b}/${2 * n} ✗</text>`;
        s += `<text x="${W / 2}" y="${H - 6}" text-anchor="middle" font-size="12" font-weight="700" fill="#c0392b" opacity="${ease(t, T2 + 0.8, T2 + 1.3)}">Nimittäjät yhteen → pienemmät palat ✗</text>`;
      }
      return s;
    },
    caption: (t) => {
      if (t < T0) return `Lautasilla on ${a}/${n} ja ${b}/${n}. Kaikki palat ovat ${n}-osia, samankokoisia.`;
      if (t < T1) return `${Math.min(a + b, Math.floor((t - T0) / PT) + 1)}. pala vatiin. Vadin palat ovat yhä samankokoisia.`;
      if (t < T2) return `Paloja on ${a} + ${b} = ${a + b}, ja palan koko pysyi: ${a + b}/${n}.`;
      return `${a + b}/${2 * n} olisi väärin: ${2 * n} osaan leikatussa piirakassa palat ovat pienempiä. Oikea vastaus on ${a + b}/${n}.`;
    },
  });
}

/** Loikka eats `b` pieces of an `a`/`n` bar one by one. With `whole`, the bar starts uncut (1) and is cut into n/n first. */
export function takeAwayScene(n: number, a: number, b: number, whole = false): AnimPaint {
  const W = 320, H = 210, X0 = 16, BW = 220, BY = 52, BH = 46, sw = BW / n, FX = 282, FY = 72;
  const TC = whole ? 2.2 : 0, T0 = TC + 1.2, PT = 1.1, T1 = T0 + b * PT + 0.4, T2 = T1 + 2.2;
  return anim({
    dur: T2 + 4, w: W, h: H, label: `${a}/${n} − ${b}/${n}`,
    frame: (t) => {
      const eaten = t < T0 ? 0 : Math.min(b, (t - T0) / PT);
      const done = Math.floor(eaten + 1e-6), left = a - done;
      let s = `<rect x="${X0 - 3}" y="${BY - 3}" width="${BW + 6}" height="${BH + 6}" rx="6" fill="#d9a55b"/>`;
      // Remaining pieces (eaten ones leave an empty crumb-coloured gap).
      for (let i = 0; i < n; i++) {
        const gone = i < a && i >= a - done, flying = i === a - done - 1 && eaten < b && t >= T0;
        const fill = i < a && !gone && !flying ? '#e8913a' : gone || flying ? '#fbf1dc' : '#f3dcaa';
        s += `<rect x="${X0 + i * sw}" y="${BY}" width="${sw}" height="${BH}" fill="${fill}" stroke="currentColor" stroke-width="1.6"${gone ? ' stroke-dasharray="4 3" stroke-opacity="0.5"' : ''}/>`;
      }
      if (whole && t < TC) {
        // Uncut bar, then knife strokes appear one after another.
        s += `<rect x="${X0}" y="${BY}" width="${BW}" height="${BH}" fill="#e8913a" stroke="currentColor" stroke-width="1.6"/>`;
        const cuts = Math.floor(ease(t, 0.6, TC - 0.2) * (n - 1) + 1e-6);
        for (let i = 1; i <= cuts; i++) s += `<line x1="${X0 + i * sw}" y1="${BY - 8}" x2="${X0 + i * sw}" y2="${BY + BH + 8}" stroke="currentColor" stroke-width="2"/>`;
        s += `<text x="${X0 + BW / 2}" y="${BY - 18}" text-anchor="middle" font-size="18" font-weight="800" fill="currentColor">1</text>`;
      } else if (whole && t < T0) {
        s += `<text x="${X0 + BW / 2}" y="${BY - 18}" text-anchor="middle" font-size="18" font-weight="800" fill="currentColor">1 = ${n}/${n}</text>`;
      }
      // Piece in flight to the frog's mouth.
      if (t >= T0 && eaten < b) {
        const i = a - done - 1, f = ease(eaten - done, 0, 0.75), x = X0 + i * sw + (FX - 10 - X0 - i * sw) * f, y = BY + (FY - BY) * f - Math.sin(f * Math.PI) * 40, k = 1 - 0.7 * f;
        s += `<rect x="${x}" y="${y}" width="${sw * k}" height="${BH * k}" fill="#e8913a" stroke="currentColor" stroke-width="1.6"/>`;
      }
      const chew = t >= T0 && eaten < b && eaten - done > 0.7;
      s += frog(FX, FY + (chew ? -3 : 0), 24, t >= T1 ? 'happy' : 'think');
      // Counter under the bar.
      if (!(whole && t < TC)) {
        s += `<text x="${X0 + BW / 2}" y="${BY + BH + 34}" text-anchor="middle" font-size="20" font-weight="800" fill="currentColor">${t >= T1 ? `${a}/${n} − ${b}/${n} = ${a - b}/${n}` : `${left}/${n}`}</text>`;
        s += `<text x="${FX}" y="${FY + 50}" text-anchor="middle" font-size="13" font-weight="700" fill="#c0392b">−${done}</text>`;
      }
      if (t >= T2) {
        const o = ease(t, T2, T2 + 0.6);
        s += `<text x="${X0 + BW / 2}" y="${H - 34}" text-anchor="middle" font-size="17" font-weight="800" fill="#c0392b" opacity="${o}"><tspan text-decoration="line-through">${a - b}/${n - n}</tspan> ✗</text>`;
        s += `<text x="${W / 2}" y="${H - 8}" text-anchor="middle" font-size="12" font-weight="700" fill="#c0392b" opacity="${ease(t, T2 + 0.8, T2 + 1.3)}">Nimittäjä ei vähene: palan koko pysyy ${n}-osana.</text>`;
      }
      return s;
    },
    caption: (t) => {
      if (whole && t < TC) return `Kokonainen piirakka on yksi. Leikataan se ${n} samankokoiseen palaan.`;
      if (t < T0) return whole ? `Nyt kokonainen on ${n}/${n}: ${n} palaa, jokainen 1/${n}.` : `Vadissa on ${a}/${n}: ${a} palaa, jokainen 1/${n}.`;
      if (t < T1) { const k = Math.min(b, Math.floor((t - T0) / PT) + 1); return `Loikka syö ${k}. palan. Jäljellä ${a - k} palaa, ja palat ovat yhä ${n}-osia.`; }
      if (t < T2) return `${a} palaa − ${b} palaa = ${a - b} palaa. Nimittäjä pysyy: ${a - b}/${n}.`;
      return `Jos vähentäisi myös nimittäjät, saisi ${n} − ${n} = 0 osaa. Se ei ole palan koko! Oikein on ${a - b}/${n}.`;
    },
  });
}

/** a/b on a bar; every piece is cut into k smaller ones (per step). Shaded length never moves; numbers grow. Ends with the a+1/b+1 trap. */
export function splitScene(a: number, b: number, ks: number[] = [2, 2]): AnimPaint {
  const W = 320, H = 230, X0 = 20, BW = 280, BY = 62, BH = 40, T0 = 1.6, CUT = 2.4, HOLD = 1.4, ST = CUT + HOLD;
  const T1 = T0 + ks.length * ST, T2 = T1 + 1.2;
  const mult = (j: number) => ks.slice(0, j).reduce((p, k) => p * k, 1);
  const end = X0 + (BW * a) / b, ta = a + 1, tb = b + 1;
  return anim({
    dur: T2 + 4.5, w: W, h: H, label: `${a}/${b}`,
    frame: (t) => {
      const j = t < T0 ? 0 : Math.min(ks.length, Math.floor((t - T0) / ST));
      const m = mult(j), cutting = j < ks.length && t >= T0 ? Math.min(1, ((t - T0) - j * ST) / CUT) : 0, k = ks[j] ?? 1;
      const N = b * m;
      let s = `<rect x="${X0}" y="${BY}" width="${BW}" height="${BH}" fill="#f3dcaa" stroke="currentColor" stroke-width="1.6"/>`;
      s += `<rect x="${X0}" y="${BY}" width="${end - X0}" height="${BH}" fill="#e8913a"/>`;
      for (let i = 1; i < N; i++) s += `<line x1="${X0 + (i * BW) / N}" y1="${BY}" x2="${X0 + (i * BW) / N}" y2="${BY + BH}" stroke="currentColor" stroke-width="1.6"/>`;
      // New knife strokes sweep left to right through every old piece.
      if (cutting > 0) {
        const newLines = N * (k - 1), shown = Math.floor(cutting * newLines + 1e-6);
        let c = 0;
        for (let i = 0; i < N && c < shown; i++) for (let q = 1; q < k && c < shown; q++, c++) {
          const x = X0 + ((i + q / k) * BW) / N;
          s += `<line x1="${x}" y1="${BY - 6}" x2="${x}" y2="${BY + BH + 6}" stroke="#2b6cb0" stroke-width="2"/>`;
        }
        if (shown < newLines) { const i = Math.floor(shown / (k - 1)), q = (shown % (k - 1)) + 1, x = X0 + ((i + q / k) * BW) / N; s += `<text x="${x}" y="${BY - 10}" text-anchor="middle" font-size="18">🔪</text>`; }
      }
      s += `<rect x="${X0}" y="${BY}" width="${BW}" height="${BH}" fill="none" stroke="currentColor" stroke-width="2"/>`;
      // Constant shaded length bracket.
      s += `<path d="M${X0} ${BY + BH + 10} v8 H${end} v-8" fill="none" stroke="#e8913a" stroke-width="2"/>`;
      s += `<text x="${(X0 + end) / 2}" y="${BY + BH + 32}" text-anchor="middle" font-size="12" font-weight="700" fill="#e8913a">väritetty osa ei muutu</text>`;
      // Fraction chain.
      const chain = Array.from({ length: j + 1 }, (_, i) => `${a * mult(i)}/${b * mult(i)}`).join(' = ');
      s += `<text x="${W / 2}" y="${BY - 28}" text-anchor="middle" font-size="20" font-weight="800" fill="currentColor">${chain}</text>`;
      if (t >= T2) {
        const o = ease(t, T2, T2 + 0.6), y2 = BY + BH + 62, e2 = X0 + (BW * ta) / tb;
        s += `<g opacity="${o}"><rect x="${X0}" y="${y2}" width="${BW}" height="${BH - 10}" fill="#f3dcaa" stroke="currentColor" stroke-width="1.4"/><rect x="${X0}" y="${y2}" width="${e2 - X0}" height="${BH - 10}" fill="#c0392b" opacity="0.75"/>`;
        for (let i = 1; i < tb; i++) s += `<line x1="${X0 + (i * BW) / tb}" y1="${y2}" x2="${X0 + (i * BW) / tb}" y2="${y2 + BH - 10}" stroke="currentColor" stroke-width="1.4"/>`;
        s += `<line x1="${end}" y1="${BY}" x2="${end}" y2="${y2 + BH - 6}" stroke="currentColor" stroke-dasharray="4 3"/>`;
        s += `<text x="${W / 2}" y="${y2 + BH + 14}" text-anchor="middle" font-size="15" font-weight="800" fill="#c0392b">${a}+1 / ${b}+1 = ${ta}/${tb}: eri pituus ✗</text></g>`;
      }
      return s;
    },
    caption: (t) => {
      if (t < T0) return `Nauhasta on väritetty ${a}/${b}. Katso väritetyn osan pituutta.`;
      if (t < T1) {
        const j = Math.floor((t - T0) / ST), k = ks[j]!, m = mult(j);
        return (t - T0) - j * ST < CUT
          ? `Jokainen pala leikataan ${k} osaan. Palojen määrä ${b * m} → ${b * m * k}.`
          : `Väritettyjä paloja on nyt ${a * m * k}, kaikkia ${b * m * k}: ${a}/${b} = ${a * m * k}/${b * m * k}.`;
      }
      if (t < T2) return `Osoittaja ja nimittäjä kerrottiin samalla luvulla. Arvo pysyi samana.`;
      return `Jos molempiin lisätään 1, saadaan ${ta}/${tb}. Väri ulottuu eri kohtaan: se ei ole sama luku.`;
    },
  });
}

/** A/B on a bar; pieces are grouped k at a time, inner lines fade, numbers shrink. Ends with the "subtract 1" trap. */
export function joinScene(A: number, B: number, ks: number[]): AnimPaint {
  const W = 320, H = 230, X0 = 20, BW = 280, BY = 62, BH = 40, T0 = 1.6, GP = 0.45, FADE = 1.2, HOLD = 1.2;
  const div = (j: number) => ks.slice(0, j).reduce((p, k) => p * k, 1);
  const stepLen = (j: number) => (B / div(j) / ks[j]!) * GP + FADE + HOLD;
  const starts = ks.map((_, j) => T0 + ks.slice(0, j).reduce((p, _k, i) => p + stepLen(i), 0));
  const T1 = T0 + ks.reduce((p, _k, i) => p + stepLen(i), 0), T2 = T1 + 1.2, end = X0 + (BW * A) / B;
  return anim({
    dur: T2 + 4.5, w: W, h: H, label: `${A}/${B}`,
    frame: (t) => {
      let j = 0; while (j < ks.length && t >= starts[j]! + stepLen(j)) j++;
      const d = div(j), N = B / d, k = ks[j] ?? 1, local = j < ks.length && t >= T0 ? t - starts[j]! : -1;
      const groups = N / k, shownG = local < 0 ? 0 : Math.min(groups, Math.floor(local / GP) + 1), fade = local < 0 ? 0 : ease(local, groups * GP, groups * GP + FADE);
      let s = `<rect x="${X0}" y="${BY}" width="${BW}" height="${BH}" fill="#f3dcaa"/><rect x="${X0}" y="${BY}" width="${end - X0}" height="${BH}" fill="#e8913a"/>`;
      for (let i = 1; i < N; i++) {
        const inner = j < ks.length && i % k !== 0;
        s += `<line x1="${X0 + (i * BW) / N}" y1="${BY}" x2="${X0 + (i * BW) / N}" y2="${BY + BH}" stroke="currentColor" stroke-width="${inner ? 1.6 : 2.4}" opacity="${inner ? 1 - fade : 1}"/>`;
      }
      s += `<rect x="${X0}" y="${BY}" width="${BW}" height="${BH}" fill="none" stroke="currentColor" stroke-width="2"/>`;
      // Group brackets appear one at a time.
      for (let g = 0; g < shownG && fade < 1; g++) {
        const x1 = X0 + (g * k * BW) / N + 3, x2 = X0 + ((g + 1) * k * BW) / N - 3;
        s += `<path d="M${x1} ${BY + BH + 8} v6 H${x2} v-6" fill="none" stroke="#2b6cb0" stroke-width="2" opacity="${1 - fade}"/><text x="${(x1 + x2) / 2}" y="${BY + BH + 30}" text-anchor="middle" font-size="13" font-weight="800" fill="#2b6cb0" opacity="${1 - fade}">${g + 1}</text>`;
      }
      const chain = Array.from({ length: j + 1 }, (_, i) => `${A / div(i)}/${B / div(i)}`).join(' = ');
      s += `<text x="${W / 2}" y="${BY - 28}" text-anchor="middle" font-size="20" font-weight="800" fill="currentColor">${chain}</text>`;
      if (j < ks.length && t >= T0) s += `<text x="${W / 2}" y="${BY - 8}" text-anchor="middle" font-size="13" font-weight="700" fill="#2b6cb0">: ${k}</text>`;
      if (t >= T2) {
        const o = ease(t, T2, T2 + 0.6), y2 = BY + BH + 62, ta = A - 1, tb = B - 1, e2 = X0 + (BW * ta) / tb;
        s += `<g opacity="${o}"><rect x="${X0}" y="${y2}" width="${BW}" height="${BH - 10}" fill="#f3dcaa" stroke="currentColor" stroke-width="1.4"/><rect x="${X0}" y="${y2}" width="${e2 - X0}" height="${BH - 10}" fill="#c0392b" opacity="0.75"/>`;
        for (let i = 1; i < tb; i++) s += `<line x1="${X0 + (i * BW) / tb}" y1="${y2}" x2="${X0 + (i * BW) / tb}" y2="${y2 + BH - 10}" stroke="currentColor" stroke-width="1.2"/>`;
        s += `<line x1="${end}" y1="${BY}" x2="${end}" y2="${y2 + BH - 6}" stroke="currentColor" stroke-dasharray="4 3"/>`;
        s += `<text x="${W / 2}" y="${y2 + BH + 14}" text-anchor="middle" font-size="15" font-weight="800" fill="#c0392b">${A}−1 / ${B}−1 = ${ta}/${tb}: eri pituus ✗</text></g>`;
      }
      return s;
    },
    caption: (t) => {
      if (t < T0) return `Nauhasta on väritetty ${A}/${B}. Voisiko palat yhdistää isommiksi?`;
      if (t < T1) {
        let j = 0; while (t >= starts[j]! + stepLen(j)) j++;
        const d = div(j), k = ks[j]!, N = B / d, local = t - starts[j]!;
        if (local < (N / k) * GP) return `Ryhmitellään ${k} palaa kerrallaan: ${N} palaa → ${N / k} ryhmää.`;
        if (local < (N / k) * GP + FADE) return `Väliviivat pois: jokainen ryhmä on nyt yksi iso pala.`;
        return `Väritettyjä ${A / d} : ${k} = ${A / d / k}, kaikkia ${N} : ${k} = ${N / k}. ${A / d}/${N} = ${A / d / k}/${N / k}.`;
      }
      if (t < T2) return `Supistettu: ${A}/${B} = ${A / div(ks.length)}/${B / div(ks.length)}. Väritetty osa ei muuttunut.`;
      return `Jos molemmista vähennetään 1, saadaan ${A - 1}/${B - 1}. Väri ulottuu eri kohtaan: supistaminen on jakamista, ei vähentämistä.`;
    },
  });
}

/** Pie factory: n pies each give `a` pieces of size 1/b; pieces fly into dishes. Full dishes become wholes. */
export function factoryScene(n: number, b: number, a: number): AnimPaint {
  const W = 320, H = 250, SR = 26, DR = 30, T0 = 1.2, PT = 0.6, tot = n * a, T1 = T0 + tot * PT + 0.4, T2 = T1 + 1.8;
  const dishes = Math.ceil(tot / b), ang = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / b;
  const sx = (i: number) => W / 2 + (i - (n - 1) / 2) * Math.min(72, 300 / n), SY = 46;
  const dx = (d: number) => W / 2 + (d - (dishes - 1) / 2) * Math.min(80, 300 / dishes), DY = 150;
  return anim({
    dur: T2 + 4, w: W, h: H, label: `${n} × ${a}/${b}`,
    frame: (t) => {
      const moved = t < T0 ? 0 : Math.min(tot, (t - T0) / PT), done = Math.floor(moved + 1e-6);
      let s = '';
      for (let p = 0; p < n; p++) {
        s += `<circle cx="${sx(p)}" cy="${SY}" r="${SR + 2}" fill="#d9a55b"/>`;
        for (let i = 0; i < b; i++) {
          const idx = p * a + i, isTaken = i < a, gone = isTaken && idx < Math.ceil(moved - 1e-6);
          s += `<path d="${wedge(sx(p), SY, SR, ang(i), ang(i + 1))}" fill="${isTaken ? (gone ? 'none' : '#e8913a') : '#f3dcaa'}" stroke="currentColor" stroke-width="1.3"${gone ? ' stroke-dasharray="3 2" stroke-opacity="0.4"' : ''}/>`;
        }
        s += `<text x="${sx(p)}" y="${SY + SR + 16}" text-anchor="middle" font-size="12" font-weight="800" fill="#e8913a">${a}/${b}</text>`;
      }
      for (let d = 0; d < dishes; d++) {
        const full = done >= (d + 1) * b;
        s += `<circle cx="${dx(d)}" cy="${DY}" r="${DR + 3}" fill="${full ? '#4caf50' : '#d9a55b'}"/>`;
        for (let i = 0; i < b; i++) s += `<path d="${wedge(dx(d), DY, DR, ang(i), ang(i + 1))}" fill="${d * b + i < done ? '#e8913a' : '#f3dcaa'}" stroke="currentColor" stroke-width="1.3" opacity="${d * b + i < done ? 1 : 0.45}"/>`;
        if (full) s += `<text x="${dx(d)}" y="${DY + DR + 18}" text-anchor="middle" font-size="12" font-weight="800" fill="#4caf50">1 kokonainen</text>`;
      }
      if (t >= T0 && moved < tot) {
        const p = Math.floor(done / a), i = done % a, d = Math.floor(done / b), k = done % b, f = ease(moved - done, 0, 1);
        const cx = sx(p) + (dx(d) - sx(p)) * f, cy = SY + (DY - SY) * f, R = SR + (DR - SR) * f, a0 = ang(i) + (ang(k) - ang(i)) * f;
        s += `<path d="${wedge(cx, cy, R, a0, a0 + (2 * Math.PI) / b)}" fill="#e8913a" stroke="currentColor" stroke-width="2"/>`;
      }
      const piesDone = Math.floor(done / a);
      s += `<text x="${W / 2}" y="${H - 22}" text-anchor="middle" font-size="19" font-weight="800" fill="currentColor">${t >= T1 ? `${n} × ${a}/${b} = ${tot}/${b}` : `${piesDone} × ${a}/${b} ${done % a ? `+ ${done % a}/${b} ` : ''}= ${done}/${b}`}</text>`;
      if (t >= T2) s += `<text x="${W / 2}" y="${H - 4}" text-anchor="middle" font-size="13" font-weight="800" fill="#c0392b" opacity="${ease(t, T2, T2 + 0.6)}"><tspan text-decoration="line-through">${tot}/${n * b}</tspan> ✗ palan koko ei muutu</text>`;
      return s;
    },
    caption: (t) => {
      if (t < T0) return `${n} piirakkaa, kustakin otetaan ${a}/${b}. Jokainen pala on 1/${b}.`;
      if (t < T1) { const d = Math.min(tot, Math.floor((t - T0) / PT) + 1); return `${d}. pala vatiin. Palat ovat yhä ${b}-osia.`; }
      if (t < T2) return `${n} kertaa ${a} palaa = ${tot} palaa: ${tot}/${b}${tot >= b ? `. ${b} palaa täyttää yhden vadin` : ''}.`;
      return `Nimittäjää ei kerrota: ${tot}/${n * b} tarkoittaisi pienempiä paloja. Oikein on ${tot}/${b}.`;
    },
  });
}
