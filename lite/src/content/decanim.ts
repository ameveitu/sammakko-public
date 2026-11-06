// Decimals as motion: a whole strip is cut into ten equal parts and the parts are coloured one by
// one while a marker walks along a number line, so 0,1 is seen as "one part of ten".
import { anim, ease, type AnimPaint } from '../ui/anim';

const FILL = 'var(--sun)', MARK = 'var(--red)';
const dec = (k: number) => (k / 10).toFixed(1).replace('.', ',');

/** n tenths: cut the strip(s), colour n parts, follow on the number line. */
export function tenthsScene(n: number): AnimPaint {
  const bars = Math.max(1, Math.ceil(n / 10)), W = 320, BX = 20, U = 28, BH = 30, BY = 34, BG = 44;
  const LY = BY + bars * BG + 36, LU = (W - 40) / bars / 10, LX = 20, H = LY + 74;
  const cutT = 0.9, CT = 0.16, cut = cutT + 9 * CT + 0.4, FT = n > 10 ? 0.42 : 0.55;
  const fillAt = (k: number) => cut + k * FT + (k >= 10 ? 1.4 : 0); // pause after a whole strip
  const filled = fillAt(n - 1) + FT, fin = filled + 1.0;
  return anim({
    dur: fin + 3, w: W, h: H, label: `${n} kymmenesosaa = ${dec(n)}`,
    frame: (t) => {
      let s = '';
      for (let b = 0; b < bars; b++) {
        const y = BY + b * BG, show = b === 0 ? ease(t, 0.1, 0.5) : ease(t, fillAt(10) - 0.5, fillAt(10));
        s += `<rect x="${BX}" y="${y}" width="${10 * U}" height="${BH}" rx="3" fill="var(--card)" stroke="currentColor" stroke-width="1.5" opacity="${show}"/>`;
        for (let i = 0; i < 10; i++) {
          const k = b * 10 + i;
          if (k < n) { const f = ease(t, fillAt(k), fillAt(k) + FT * 0.7); if (f > 0) s += `<rect x="${BX + i * U}" y="${y + BH * (1 - f)}" width="${U}" height="${BH * f}" fill="${FILL}" opacity="${show}"/>`; }
        }
        for (let i = 1; i < 10; i++) {
          const c = b === 0 ? ease(t, cutT + (i - 1) * CT, cutT + (i - 1) * CT + 0.2) : show;
          s += `<line x1="${BX + i * U}" y1="${y}" x2="${BX + i * U}" y2="${y + BH * c}" stroke="currentColor" stroke-width="1.5" opacity="${show}"/>`;
        }
        s += `<rect x="${BX}" y="${y}" width="${10 * U}" height="${BH}" rx="3" fill="none" stroke="${b === 0 && n >= 10 && t >= fillAt(9) + FT ? 'var(--ok)' : 'currentColor'}" stroke-width="${b === 0 && n >= 10 && t >= fillAt(9) + FT ? 3 : 1.5}" opacity="${show}"/>`;
        if (b === 0 && n >= 10 && t >= fillAt(9) + FT) s += `<text x="${BX + 10 * U + 6}" y="${y + 21}" font-size="14" font-weight="800" fill="var(--ok)" opacity="${ease(t, fillAt(9) + FT, fillAt(9) + FT + 0.4)}">1</text>`;
      }
      // Number line.
      s += `<line x1="${LX}" y1="${LY}" x2="${LX + bars * 10 * LU}" y2="${LY}" stroke="currentColor" stroke-width="2"/>`;
      for (let k = 0; k <= bars * 10; k++) {
        const x = LX + k * LU, big = k % 10 === 0;
        s += `<line x1="${x}" y1="${LY - (big ? 8 : 5)}" x2="${x}" y2="${LY + (big ? 8 : 5)}" stroke="currentColor" stroke-width="${big ? 2 : 1.2}"/>`;
        if (big || k % 5 === 0) s += `<text x="${x}" y="${LY + 24}" text-anchor="middle" font-size="${big ? 13 : 11}" font-weight="${big ? 800 : 600}" fill="currentColor" opacity="${big ? 1 : 0.6}">${big ? k / 10 : dec(k)}</text>`;
      }
      let pos = 0; for (let k = 0; k < n; k++) pos += ease(t, fillAt(k), fillAt(k) + FT * 0.7);
      if (t >= cut) {
        const x = LX + pos * LU;
        s += `<path d="M${x} ${LY - 10} l-6 -10 h12 z" fill="${MARK}"/>`;
        const cnt = Math.round(pos);
        s += `<text x="${Math.min(W - 30, Math.max(30, x))}" y="${LY - 26}" text-anchor="middle" font-size="15" font-weight="800" fill="${MARK}">${dec(cnt)}</text>`;
      }
      if (t >= filled) s += `<text x="${W / 2}" y="${H - 8}" text-anchor="middle" font-size="18" font-weight="800" fill="currentColor" opacity="${ease(t, filled, fin)}">${n}/10 = ${dec(n)}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < cutT) return 'Tämä nauha on yksi kokonainen.';
      if (t < cut) return 'Leikataan se kymmeneen yhtä suureen osaan. Yksi osa on 0,1.';
      if (t < filled) {
        let k = 0; while (k < n && t >= fillAt(k)) k++;
        if (n > 10 && k === 10 && t >= fillAt(9) + FT) return 'Kymmenen kymmenesosaa on yksi kokonainen. Otetaan uusi nauha.';
        return `${k} ${k === 1 ? 'osa' : 'osaa'}: ${dec(k)}.`;
      }
      return n > 10 ? `${Math.floor(n / 10)} kokonainen ja ${n % 10} kymmenesosaa: ${dec(n)}.` : `${n} kymmenesosaa: ${dec(n)}.`;
    },
  });
}

/** n hundredths on a 10 × 10 grid. 'build': whole columns (tenths) fill first, then single cells.
 *  'same': n = a·10 whole columns, then the cell lines appear so a tenths = 10a hundredths. */
export function hundredsScene(n: number, mode: 'build' | 'same' = 'build'): AnimPaint {
  const W = 320, G = 160, U = G / 10, GX = 14, GY = 24, H = GY + G + 50;
  const cols = Math.floor(n / 10), ones = n % 10, COL = '#4f8fd6', ONE = 'var(--sun)';
  const t0 = 0.8, CT = 0.7, colsDone = t0 + cols * CT, OT = 0.35, onesStart = colsDone + 0.6, onesDone = onesStart + ones * OT;
  const split = colsDone + 0.6, splitDone = split + 1.6, fin = (mode === 'same' ? splitDone : onesDone) + 0.8;
  const RX = GX + G + 18;
  return anim({
    dur: fin + 3, w: W, h: H, label: `${n} sadasosaa`,
    frame: (t) => {
      let s = `<rect x="${GX}" y="${GY}" width="${G}" height="${G}" fill="var(--card)"/>`;
      for (let c = 0; c < cols; c++) { const f = ease(t, t0 + c * CT, t0 + c * CT + CT * 0.8); if (f > 0) s += `<rect x="${GX + c * U}" y="${GY}" width="${U}" height="${G * f}" fill="${COL}" opacity="0.85"/>`; }
      if (mode === 'build') for (let i = 0; i < ones; i++) { const f = ease(t, onesStart + i * OT, onesStart + i * OT + 0.25); if (f > 0) s += `<rect x="${GX + cols * U + 1}" y="${GY + i * U + 1}" width="${U - 2}" height="${U - 2}" fill="${ONE}" opacity="${f}"/>`; }
      // Grid lines: column lines always; cell lines inside filled columns appear only in 'same' after the split.
      const cellOp = mode === 'same' ? 0.35 * ease(t, split, split + 0.6) : 0.35;
      for (let c = 1; c < 10; c++) s += `<line x1="${GX + c * U}" y1="${GY}" x2="${GX + c * U}" y2="${GY + G}" stroke="currentColor" stroke-opacity="0.35"/>`;
      for (let r = 1; r < 10; r++) {
        s += `<line x1="${GX + cols * U}" y1="${GY + r * U}" x2="${GX + G}" y2="${GY + r * U}" stroke="currentColor" stroke-opacity="0.35"/>`;
        if (cols) s += `<line x1="${GX}" y1="${GY + r * U}" x2="${GX + cols * U}" y2="${GY + r * U}" stroke="#fff" stroke-opacity="${cellOp * 2}"/>`;
      }
      s += `<rect x="${GX}" y="${GY}" width="${G}" height="${G}" fill="none" stroke="currentColor" stroke-width="2.5"/>`;
      // Column tags under the grid.
      for (let c = 0; c < cols; c++) if (t >= t0 + c * CT + CT * 0.8) s += `<text x="${GX + c * U + U / 2}" y="${GY + G + 14}" text-anchor="middle" font-size="9" font-weight="700" fill="${COL}">0,1</text>`;
      // Right-hand readout.
      const cNow = Math.min(cols, Math.max(0, Math.floor((t - t0) / CT + 0.2)));
      const oNow = mode === 'build' ? Math.min(ones, Math.max(0, Math.floor((t - onesStart) / OT + 0.7))) : 0;
      s += `<text x="${RX}" y="${GY + 14}" font-size="12" font-weight="700" fill="currentColor" opacity="0.6">sata ruutua = 1</text>`;
      if (t >= t0) s += `<text x="${RX}" y="${GY + 46}" font-size="14" font-weight="800" fill="${COL}">${cNow} saraketta = ${(cNow / 10).toFixed(1).replace('.', ',')}</text>`;
      if (mode === 'build' && t >= onesStart) s += `<text x="${RX}" y="${GY + 72}" font-size="14" font-weight="800" fill="#b98a10">${oNow} ruutua = 0,0${oNow}</text>`;
      if (mode === 'same' && t >= split) s += `<text x="${RX}" y="${GY + 72}" font-size="14" font-weight="800" fill="#b98a10" opacity="${ease(t, split + 0.4, split + 1.0)}">= ${n} ruutua</text><text x="${RX}" y="${GY + 94}" font-size="14" font-weight="800" fill="#b98a10" opacity="${ease(t, split + 0.8, split + 1.4)}">= ${n} sadasosaa</text>`;
      if (t >= fin - 0.8) {
        const op = ease(t, fin - 0.8, fin);
        s += mode === 'same'
          ? `<text x="${RX}" y="${GY + 136}" font-size="22" font-weight="800" fill="currentColor" opacity="${op}">${(n / 100).toFixed(1).replace('.', ',')} = ${(n / 100).toFixed(2).replace('.', ',')}</text>`
          : `<text x="${RX}" y="${GY + 136}" font-size="26" font-weight="800" opacity="${op}"><tspan fill="currentColor">0,</tspan><tspan fill="${COL}">${cols}</tspan><tspan fill="#b98a10">${ones}</tspan></text><text x="${RX}" y="${GY + 156}" font-size="9" font-weight="700" fill="currentColor" opacity="${op * 0.6}">kymmenes- ja sadasosat</text>`;
      }
      return s;
    },
    caption: (t) => {
      if (t < t0) return 'Ruudukossa on sata ruutua. Koko ruudukko on yksi.';
      if (t < colsDone) return 'Yksi sarake on kymmenen ruutua: kymmenesosa, 0,1.';
      if (mode === 'build') {
        if (t < onesStart) return `${cols} täyttä saraketta: ${(cols / 10).toFixed(1).replace('.', ',')}.`;
        if (t < onesDone) return 'Yksi ruutu on sadasosa, 0,01.';
        return `${cols} saraketta ja ${ones} ruutua: ${(n / 100).toFixed(2).replace('.', ',')}.`;
      }
      if (t < split) return `${cols} saraketta: ${(n / 100).toFixed(1).replace('.', ',')}.`;
      if (t < splitDone) return `Katso ruutuja: jokaisessa sarakkeessa on 10, yhteensä ${n}.`;
      return `${cols} kymmenesosaa on yhtä paljon kuin ${n} sadasosaa: ${(n / 100).toFixed(1).replace('.', ',')} = ${(n / 100).toFixed(2).replace('.', ',')}.`;
    },
  });
}

/** Zooming into a metre: 0–1 in tenths, then the tenth that holds the target in hundredths, then the
 *  hundredth in thousandths. A marker walks each level so 0,375 is built digit by digit. */
export function zoomScene(n: number): AnimPaint {
  const a = Math.floor(n / 100), b = Math.floor(n / 10) % 10, c = n % 10;
  const W = 320, X0 = 22, L = 276, U = L / 10, YS = [44, 122, 200], H = 282;
  const dg = [a, b, c], COLS = ['#4f8fd6', '#3e9b54', '#d9822b'], NAME = ['kymmenesosat (dm)', 'sadasosat (cm)', 'tuhannesosat (mm)'];
  const lo = [0, a / 10, a / 10 + b / 100], step = [0.1, 0.01, 0.001];
  const fmt = (x: number, p: number) => x.toFixed(p).replace('.', ',');
  const T: { show: number; walk: number; walked: number; zoom: number }[] = []; let t = 0.4;
  for (let l = 0; l < 3; l++) { const show = t, walk = show + 0.6, walked = walk + Math.max(0.4, dg[l]! * 0.32); T.push({ show, walk, walked, zoom: walked + 0.5 }); t = walked + 1.4; }
  const fin = T[2]!.walked + 0.8;
  const digitsAt = (tt: number) => T.filter((x) => tt >= x.walked).length;
  return anim({
    dur: fin + 3, w: W, h: H, label: `${n} mm = ${fmt(n / 1000, 3)} m`,
    frame: (tt) => {
      let s = '';
      for (let l = 0; l < 3; l++) {
        const P = T[l]!, y = YS[l]!, op = ease(tt, P.show, P.show + 0.5);
        if (op <= 0) continue;
        s += `<text x="${W / 2}" y="${y + 34}" text-anchor="middle" font-size="10" font-weight="700" fill="${COLS[l]}" opacity="${op}">${NAME[l]}</text>`;
        const mx = X0 + dg[l]! * U, near = tt >= P.walked ? mx : -99;
        s += `<rect x="${X0}" y="${y - 6}" width="${L}" height="12" rx="2" fill="color-mix(in srgb, ${COLS[l]} 12%, transparent)" stroke="currentColor" stroke-width="1.3" opacity="${op}"/>`;
        for (let i = 1; i < 10; i++) s += `<line x1="${X0 + i * U}" y1="${y - 6}" x2="${X0 + i * U}" y2="${y + 6}" stroke="currentColor" stroke-width="1" opacity="${op * 0.7}"/>`;
        if (Math.abs(near - X0) > 30) s += `<text x="${X0}" y="${y + 20}" text-anchor="middle" font-size="10" font-weight="700" fill="currentColor" opacity="${op}">${fmt(lo[l]!, l)}</text>`;
        if (Math.abs(near - X0 - L) > 30) s += `<text x="${X0 + L}" y="${y + 20}" text-anchor="middle" font-size="10" font-weight="700" fill="currentColor" opacity="${op}">${l === 0 ? '1 m' : fmt(lo[l]! + step[l]! * 10, l)}</text>`;
        // Marker walking dg[l] steps.
        if (tt >= P.walk) {
          const k = Math.min(dg[l]!, (tt - P.walk) / 0.32), x = X0 + k * U;
          s += `<path d="M${x} ${y - 8} l-5 -8 h10 z" fill="var(--red)"/>`;
          if (tt >= P.walked) s += `<text x="${Math.max(X0 + 14, Math.min(X0 + L - 14, x))}" y="${y + 20}" text-anchor="middle" font-size="11" font-weight="800" fill="var(--red)">${fmt(lo[l]! + dg[l]! * step[l]!, l + 1)}</text>`;
        }
        // Highlight the part we zoom into, and draw the zoom funnel.
        if (l < 2 && tt >= P.zoom) {
          const z = ease(tt, P.zoom, P.zoom + 0.6), x = X0 + dg[l]! * U;
          s += `<rect x="${x}" y="${y - 6}" width="${U}" height="12" fill="${COLS[l + 1]}" opacity="${0.55 * z}"/>`;
          s += `<path d="M${x} ${y + 6} L${X0} ${YS[l + 1]! - 6} M${x + U} ${y + 6} L${X0 + L} ${YS[l + 1]! - 6}" stroke="${COLS[l + 1]}" stroke-width="1.2" stroke-dasharray="3 3" fill="none" opacity="${z}"/>`;
        }
      }
      const k = digitsAt(tt);
      if (k > 0) {
        s += `<text x="${W / 2}" y="${H - 14}" text-anchor="middle" font-size="24" font-weight="800"><tspan fill="currentColor">0,</tspan>${dg.slice(0, k).map((d, i) => `<tspan fill="${COLS[i]}">${d}</tspan>`).join('')}<tspan fill="currentColor"> m</tspan>${tt >= fin ? `<tspan fill="currentColor" font-size="16"> = ${n} mm</tspan>` : ''}</text>`;
      }
      return s;
    },
    caption: (tt) => {
      if (tt < T[0]!.walked) return `Metri jaetaan kymmeneen osaan. Montako kymmenesosaa? ${a}.`;
      if (tt < T[1]!.show) return `${a === 0 ? 'Ei yhtään kokonaista kymmenesosaa: nolla on tärkeä paikanpitäjä.' : `${a} kymmenesosaa: 0,${a}.`} Suurennetaan seuraava väli.`;
      if (tt < T[1]!.walked) return 'Tämäkin väli jaetaan kymmeneen: sadasosat.';
      if (tt < T[2]!.show) return `${b} sadasosaa: ${fmt(a / 10 + b / 100, 2)}. Suurennetaan vielä kerran.`;
      if (tt < T[2]!.walked) return 'Taas kymmeneen osaan: tuhannesosat eli millimetrit.';
      return `${a} kymmenesosaa, ${b} sadasosaa ja ${c} tuhannesosaa: ${fmt(n / 1000, 3)} m = ${n} mm.`;
    },
  });
}

/** How a decimal is read aloud: whole part, then the decimal digits as one number, named by the
 *  place of the LAST digit. "3,07" → "3 kokonaista 7 sadasosaa". */
export function readScene(str: string): AnimPaint {
  const [wp, dp] = str.split(',') as [string, string];
  const chars = [...str], W = 320, FS = 52, Y = 82, H = 250;
  const wid = chars.map((c) => (c === ',' ? 22 : 54)), tot = wid.reduce((a, b) => a + b, 0), XS = wid.map((w, i) => (W - tot) / 2 + wid.slice(0, i).reduce((a, b) => a + b, 0) + w / 2);
  const PL = ['kymmenes-osat', 'sadas-osat', 'tuhannes-osat'], PC = ['#4f8fd6', '#3e9b54', '#d9822b'], UNIT = ['kymmenesosaa', 'sadasosaa', 'tuhannesosaa'];
  const ci = chars.indexOf(','), last = dp.length - 1, val = Number(dp), KOK = wp === '1' ? 'kokonainen' : 'kokonaista';
  const t0 = 0.6, wholeAt = t0 + 0.4, labels = wholeAt + 1.4, lastAt = labels + dp.length * 0.6 + 0.6, numAt = lastAt + 1.6, fin = numAt + 1.6;
  const cx = (i: number) => XS[i]!;
  return anim({
    dur: fin + 3, w: W, h: H, label: `${str} luetaan ääneen`,
    frame: (t) => {
      let s = '';
      chars.forEach((ch, i) => {
        const p = i - ci - 1, col = p >= 0 && t >= labels + p * 0.6 ? PC[p]! : 'currentColor';
        s += `<text x="${cx(i)}" y="${Y}" text-anchor="middle" font-size="${FS}" font-weight="800" fill="${col}" opacity="${ease(t, 0.1, t0)}">${ch}</text>`;
      });
      // Whole part bracket.
      if (t >= wholeAt) { const a = ease(t, wholeAt, wholeAt + 0.4), x1 = cx(0) - 14, x2 = cx(ci - 1) + 14; s += `<path d="M${x1} ${Y - 50} v-6 h${x2 - x1} v6" fill="none" stroke="currentColor" stroke-width="2" opacity="${a}"/><text x="${(x1 + x2) / 2}" y="${Y - 62}" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" opacity="${a}">kokonaiset</text>`; }
      // Place labels under the decimal digits.
      for (let p = 0; p < dp.length; p++) {
        const a = ease(t, labels + p * 0.6, labels + p * 0.6 + 0.4), x = cx(ci + 1 + p);
        const [l1, l2] = PL[p]!.split('-');
        s += `<text x="${x}" y="${Y + 22}" text-anchor="middle" font-size="9" font-weight="700" fill="${PC[p]}" opacity="${a}">${l1}</text><text x="${x}" y="${Y + 32}" text-anchor="middle" font-size="9" font-weight="700" fill="${PC[p]}" opacity="${a}">${l2}</text>`;
      }
      // The last digit names the unit.
      if (t >= lastAt) { const a = ease(t, lastAt, lastAt + 0.4), x = cx(ci + 1 + last); s += `<circle cx="${x}" cy="${Y - 18}" r="${26 + 3 * Math.sin(t * 5)}" fill="none" stroke="${PC[last]}" stroke-width="3" opacity="${a}"/>`; }
      // The decimal digits read as one number.
      if (t >= numAt) { const a = ease(t, numAt, numAt + 0.4), x1 = cx(ci + 1) - 14, x2 = cx(chars.length - 1) + 14; s += `<path d="M${x1} ${Y + 40} v6 h${x2 - x1} v-6" fill="none" stroke="var(--red)" stroke-width="2" opacity="${a}"/><text x="${(x1 + x2) / 2}" y="${Y + 62}" text-anchor="middle" font-size="14" font-weight="800" fill="var(--red)" opacity="${a}">${dp === String(val) ? val : `${dp} → ${val}`}</text>`; }
      // Phrase builds up.
      const parts: [number, string, string][] = [[wholeAt, `${wp} ${KOK}`, 'currentColor'], [lastAt, t >= numAt ? String(val) : '?', 'var(--red)'], [lastAt, UNIT[last]!, PC[last]!]];
      const shown = parts.filter((x) => t >= x[0]);
      if (shown.length) {
        const ordered = parts.filter((x) => t >= x[0]);
        s += `<text x="${W / 2}" y="${H - 22}" text-anchor="middle" font-size="19" font-weight="800">${ordered.map((x) => `<tspan fill="${x[2]}">${x[1]} </tspan>`).join('')}</text>`;
      }
      return s;
    },
    caption: (t) => {
      if (t < wholeAt) return `Miten ${str} luetaan?`;
      if (t < labels) return `Pilkun edessä on kokonaiset: ${wp} ${KOK}.`;
      if (t < lastAt) return 'Pilkun jälkeen paikat ovat kymmenesosat, sadasosat, tuhannesosat.';
      if (t < numAt) return `Viimeinen numero on ${UNIT[last]!.replace(/aa$/, 'ien')} paikalla. Siitä tulee osien nimi: ${UNIT[last]}.`;
      if (t < fin) return dp.length > 1 ? `Pilkun jälkeiset numerot luetaan yhtenä lukuna: ${dp} on ${val}.` : `Pilkun jälkeen on ${val}.`;
      return `${str} = ${wp} ${KOK} ${val} ${UNIT[last]}.`;
    },
  });
}

/** Writing a decimal from words: "w kokonaista v sadasosaa". The whole part goes before the comma,
 *  the unit name points at the LAST box, the digits of v are written ending there, and any empty
 *  place before them is filled with a zero. */
export function writeScene(w: number, v: number, p: number): AnimPaint {
  const UNIT = ['kymmenesosaa', 'sadasosaa', 'tuhannesosaa'], PL = ['kymmenes-osat', 'sadas-osat', 'tuhannes-osat'], PC = ['#4f8fd6', '#3e9b54', '#d9822b'];
  const vd = String(v), zeros = p - vd.length, digits = '0'.repeat(zeros) + vd;
  const W = 320, H = 250, BW = 46, CWD = 20, BY = 96, BH = 56;
  const widths = [BW, CWD, ...Array(p).fill(BW)], tot = widths.reduce((a, b) => a + b + 6, -6);
  const bx = widths.map((_, i) => (W - tot) / 2 + widths.slice(0, i).reduce((a, b) => a + b + 6, 0));
  const box = (i: number) => bx[i + 2]!; // decimal box i (0-based)
  const KOK = w === 1 ? 'kokonainen' : 'kokonaista';
  const phrase = `${w} ${KOK} ${v} ${UNIT[p - 1]}`;
  const t0 = 0.5, wholeAt = 1.2, commaAt = 2.3, unitAt = 2.9, digAt = 4.2, zeroAt = digAt + 1.3, fin = (zeros ? zeroAt + 1.4 : digAt + 1.2) + 0.4;
  const fly = (x0: number, y0: number, x1: number, y1: number, a: number) => [x0 + (x1 - x0) * a, y0 + (y1 - y0) * a - Math.sin(a * Math.PI) * 26] as const;
  return anim({
    dur: fin + 3, w: W, h: H, label: `${phrase} = ${w},${digits}`,
    frame: (t) => {
      let s = '';
      const hw = t >= wholeAt && t < commaAt, hv = t >= digAt && t < zeroAt, hu = t >= unitAt && t < digAt + 0.6;
      s += `<text x="${W / 2}" y="30" text-anchor="middle" font-size="17" font-weight="800" opacity="${ease(t, 0.1, t0)}"><tspan fill="${hw ? 'var(--red)' : 'currentColor'}">${w} ${KOK} </tspan><tspan fill="${hv ? 'var(--red)' : 'currentColor'}">${v} </tspan><tspan fill="${hu ? PC[p - 1] : 'currentColor'}" text-decoration="${hu ? 'underline' : 'none'}">${UNIT[p - 1]}</tspan></text>`;
      // Boxes.
      s += `<rect x="${bx[0]}" y="${BY}" width="${BW}" height="${BH}" rx="6" fill="color-mix(in srgb, currentColor 5%, transparent)" stroke="currentColor" stroke-width="1.5"/>`;
      s += `<text x="${bx[0]! + BW / 2}" y="${BY + BH + 16}" text-anchor="middle" font-size="9" font-weight="700" fill="currentColor" opacity="0.7">kokonaiset</text>`;
      for (let i = 0; i < p; i++) {
        const glow = i === p - 1 && t >= unitAt;
        s += `<rect x="${box(i)}" y="${BY}" width="${BW}" height="${BH}" rx="6" fill="color-mix(in srgb, ${PC[i]} ${glow ? 22 : 8}%, transparent)" stroke="${glow ? PC[i] : 'currentColor'}" stroke-width="${glow ? 3 : 1.5}"/>`;
        const [l1, l2] = PL[i]!.split('-');
        s += `<text x="${box(i) + BW / 2}" y="${BY + BH + 14}" text-anchor="middle" font-size="9" font-weight="700" fill="${PC[i]}">${l1}</text><text x="${box(i) + BW / 2}" y="${BY + BH + 24}" text-anchor="middle" font-size="9" font-weight="700" fill="${PC[i]}">${l2}</text>`;
      }
      if (t >= unitAt) { const a = ease(t, unitAt, unitAt + 0.6), x = box(p - 1) + BW / 2; s += `<path d="M${x} ${42 + 30 * a} L${x} ${BY - 6}" stroke="${PC[p - 1]}" stroke-width="2.5" stroke-dasharray="4 3" opacity="${a * (1 - ease(t, digAt + 0.6, digAt + 1.2))}"/><path d="M${x - 6} ${BY - 12} L${x} ${BY - 4} L${x + 6} ${BY - 12}" fill="none" stroke="${PC[p - 1]}" stroke-width="2.5" opacity="${a * (1 - ease(t, digAt + 0.6, digAt + 1.2))}"/>`; }
      // Whole digit.
      if (t >= wholeAt) { const [x, y] = fly(W / 2 - 70, 30, bx[0]! + BW / 2, BY + 42, ease(t, wholeAt, wholeAt + 0.8)); s += `<text x="${x}" y="${y}" text-anchor="middle" font-size="36" font-weight="800" fill="currentColor">${w}</text>`; }
      // Comma.
      if (t >= commaAt) s += `<text x="${bx[1]! + CWD / 2}" y="${BY + 44}" text-anchor="middle" font-size="40" font-weight="800" fill="currentColor" opacity="${ease(t, commaAt, commaAt + 0.3)}">,</text>`;
      // Value digits, ending in the last box.
      [...vd].forEach((ch, j) => {
        const i = zeros + j, a = ease(t, digAt + j * 0.2, digAt + j * 0.2 + 0.8);
        if (a <= 0) return;
        const [x, y] = fly(W / 2 + 30 + j * 10, 30, box(i) + BW / 2, BY + 42, a);
        s += `<text x="${x}" y="${y}" text-anchor="middle" font-size="36" font-weight="800" fill="${PC[i]}">${ch}</text>`;
      });
      // Empty places get zeros.
      for (let i = 0; i < zeros; i++) {
        if (t < zeroAt) continue;
        const warn = ease(t, zeroAt, zeroAt + 0.3) * (1 - ease(t, zeroAt + 0.7, zeroAt + 1.0)), z = ease(t, zeroAt + 0.7, zeroAt + 1.1);
        s += `<rect x="${box(i) + 2}" y="${BY + 2}" width="${BW - 4}" height="${BH - 4}" rx="5" fill="none" stroke="var(--red)" stroke-width="3" opacity="${warn}"/>`;
        s += `<text x="${box(i) + BW / 2}" y="${BY + 42 - 14 * (1 - z)}" text-anchor="middle" font-size="36" font-weight="800" fill="var(--ok)" opacity="${z}">0</text>`;
      }
      if (t >= fin - 0.4) s += `<text x="${W / 2}" y="${H - 14}" text-anchor="middle" font-size="22" font-weight="800" fill="currentColor" opacity="${ease(t, fin - 0.4, fin + 0.2)}">= ${w},${digits}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < wholeAt) return `Kirjoita numeroin: ${phrase}.`;
      if (t < commaAt) return `Kokonaiset ensin: ${w}.`;
      if (t < unitAt) return 'Sitten pilkku.';
      if (t < digAt) return `"${UNIT[p - 1]}": viimeinen numero menee ${UNIT[p - 1]!.replace(/aa$/, 'ien')} paikalle.`;
      if (t < zeroAt || !zeros) return t < fin ? `${v} kirjoitetaan niin, että se päättyy ${UNIT[p - 1]!.replace(/aa$/, 'ien')} paikalle.` : `${phrase} = ${w},${digits}.`;
      if (t < fin) return `Tyhjä paikka ei saa jäädä tyhjäksi: siihen tulee nolla.`;
      return `${phrase} = ${w},${digits}.`;
    },
  });
}

/**
 * Decompose (split) or compose (build) a number w,ab: each digit travels between its place in the
 * number and its own part box, where the part's value and a small picture appear.
 */
export function decomposeScene(w: number, a: number, b: number, mode: 'split' | 'build' = 'split'): AnimPaint {
  const W = 320, H = 280, PC = ['currentColor', '#4f8fd6', '#3e9b54'], NAME = ['kokonaiset', 'kymmenesosat', 'sadasosat'];
  const dig = [w, a, b], val = [String(w), a ? `0,${a}` : '0', `0,0${b}`], num = `${w},${a}${b}`;
  const parts = dig.map((d, i) => (i === 0 || d ? val[i] : null)).filter((x): x is string => !!x);
  // Number on top: three digit slots and a comma.
  const NY = 62, dx = [W / 2 - 52, W / 2 + 4, W / 2 + 44], cx = W / 2 - 24;
  const CX = [56, 160, 264], BY = 104, BW = 78, BH = 52;
  const split = mode === 'split', T0 = 0.8, ST = 1.5, fin = T0 + 3 * ST + (split ? 0.4 : 1.0);
  const at = (i: number) => T0 + i * ST;
  const fly = (x0: number, y0: number, x1: number, y1: number, k: number) => [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k - Math.sin(k * Math.PI) * 22] as const;
  const pic = (i: number, op: number) => {
    let s = '';
    const n = dig[i]!, x0 = CX[i]! - 40, y0 = BY + BH + 28;
    for (let k = 0; k < n; k++) {
      if (i === 0) s += `<rect x="${x0 + (k % 5) * 16}" y="${y0 + Math.floor(k / 5) * 16}" width="13" height="13" rx="2" fill="var(--sun)" stroke="currentColor" stroke-width="1"/>`;
      else if (i === 1) s += `<rect x="${x0 + (k % 9) * 9}" y="${y0}" width="6" height="26" rx="1" fill="${PC[1]}"/>`;
      else s += `<rect x="${x0 + (k % 9) * 9}" y="${y0 + 10}" width="6" height="6" rx="1" fill="${PC[2]}"/>`;
    }
    const lab = i === 0 ? (n === 1 ? '1 kokonainen' : `${n} kokonaista`) : i === 1 ? `${n} kymmenesosaa` : `${n} sadasosaa`;
    s += `<text x="${CX[i]}" y="${y0 + 52}" text-anchor="middle" font-size="10" font-weight="700" fill="${PC[i]}">${n === 0 ? 'ei yhtään' : lab}</text>`;
    return `<g opacity="${op}">${s}</g>`;
  };
  return anim({
    dur: fin + 3, w: W, h: H, label: split ? `${num} = ${parts.join(' + ')}` : `${parts.join(' + ')} = ${num}`,
    frame: (t) => {
      let s = '';
      // Number slots on top (dashed frames in build mode).
      for (let i = 0; i < 3; i++) if (!split) s += `<rect x="${dx[i]! - 18}" y="${NY - 38}" width="36" height="48" rx="5" fill="none" stroke="${PC[i]}" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.7"/>`;
      s += `<text x="${cx}" y="${NY}" text-anchor="middle" font-size="40" font-weight="800" fill="currentColor">,</text>`;
      // Part boxes.
      for (let i = 0; i < 3; i++) {
        const on = t >= at(i) && t < at(i) + ST;
        s += `<text x="${CX[i]}" y="${BY - 8}" text-anchor="middle" font-size="11" font-weight="800" fill="${PC[i]}">${NAME[i]}</text>`;
        s += `<rect x="${CX[i]! - BW / 2}" y="${BY}" width="${BW}" height="${BH}" rx="7" fill="color-mix(in srgb, ${PC[i]} ${on ? 18 : 6}%, transparent)" stroke="${on ? PC[i] : 'currentColor'}" stroke-width="${on ? 3 : 1.5}"/>`;
        if (i < 2) s += `<text x="${(CX[i]! + CX[i + 1]!) / 2}" y="${BY + 35}" text-anchor="middle" font-size="22" font-weight="800" fill="currentColor" opacity="${ease(t, at(3) - 0.2, at(3) + 0.3)}">+</text>`;
      }
      for (let i = 0; i < 3; i++) {
        const k = ease(t, at(i), at(i) + 0.9), zero = dig[i] === 0;
        if (split) {
          // Digit drops from the number into its box, the value grows around it.
          s += `<text x="${dx[i]}" y="${NY}" text-anchor="middle" font-size="40" font-weight="800" fill="${PC[i]}" opacity="${t >= at(i) && t < at(i) + 0.9 ? 0.35 : 1}">${dig[i]}</text>`;
          if (k > 0 && k < 1) { const [x, y] = fly(dx[i]!, NY, CX[i]!, BY + 36, k); s += `<text x="${x}" y="${y}" text-anchor="middle" font-size="30" font-weight="800" fill="${PC[i]}">${dig[i]}</text>`; }
          if (k >= 1) s += `<text x="${CX[i]}" y="${BY + 36}" text-anchor="middle" font-size="24" font-weight="800" fill="${PC[i]}">${val[i]}</text>`;
          s += pic(i, ease(t, at(i) + 0.8, at(i) + 1.2));
        } else {
          // Part sits in its box from the start; its last digit flies up into the number.
          s += `<text x="${CX[i]}" y="${BY + 36}" text-anchor="middle" font-size="24" font-weight="800" fill="${PC[i]}" opacity="${zero ? 0.35 : 1}">${zero ? '–' : val[i]}</text>`;
          s += pic(i, ease(t, 0.1, 0.6));
          if (!zero) {
            if (k > 0 && k < 1) { const [x, y] = fly(CX[i]!, BY + 36, dx[i]!, NY, k); s += `<text x="${x}" y="${y}" text-anchor="middle" font-size="30" font-weight="800" fill="${PC[i]}">${dig[i]}</text>`; }
            if (k >= 1) s += `<text x="${dx[i]}" y="${NY}" text-anchor="middle" font-size="40" font-weight="800" fill="${PC[i]}">${dig[i]}</text>`;
          } else if (t >= at(i)) {
            const warn = ease(t, at(i), at(i) + 0.3) * (1 - ease(t, at(i) + 0.8, at(i) + 1.1)), z = ease(t, at(i) + 0.8, at(i) + 1.2);
            s += `<rect x="${dx[i]! - 18}" y="${NY - 38}" width="36" height="48" rx="5" fill="none" stroke="var(--red)" stroke-width="3" opacity="${warn}"/>`;
            s += `<text x="${dx[i]}" y="${NY - 14 * (1 - z)}" text-anchor="middle" font-size="40" font-weight="800" fill="var(--ok)" opacity="${z}">0</text>`;
          }
        }
      }
      if (t >= fin - 0.6) s += `<text x="${W / 2}" y="${H - 10}" text-anchor="middle" font-size="18" font-weight="800" fill="currentColor" opacity="${ease(t, fin - 0.6, fin)}">${split ? `${num} = ${parts.join(' + ')}` : `${parts.join(' + ')} = ${num}`}</text>`;
      return s;
    },
    caption: (t) => {
      const zi = dig.indexOf(0);
      if (t < T0) return split ? `Puretaan luku ${num} osiin.` : `Kootaan luku osista ${parts.join(', ')}.`;
      for (let i = 0; i < 3; i++) if (t < at(i) + ST) {
        if (!split && i === zi) return `${['Kokonaisia', 'Kymmenesosia', 'Sadasosia'][i]} ei ole. Paikka ei saa jäädä tyhjäksi: siihen tulee nolla.`;
        if (i === 0) return split ? `${w} on ennen pilkkua: ${w} ${w === 1 ? 'kokonainen' : 'kokonaista'}.` : `Kokonaiset ${w} tulevat ennen pilkkua.`;
        if (i === 1) return split ? `${a} on ensimmäinen pilkun jälkeen: ${a} kymmenesosaa = ${val[1]}.` : `${val[1]}: numero ${a} menee ensimmäiseksi pilkun jälkeen.`;
        return split ? `${b} on toinen pilkun jälkeen: ${b} sadasosaa = ${val[2]}.` : `${val[2]}: numero ${b} menee toiseksi pilkun jälkeen.`;
      }
      return split ? `${num} = ${parts.join(' + ')}.` : `${parts.join(' + ')} = ${num}.`;
    },
  });
}

/**
 * Compare two decimals: they are lined up at the comma, the shorter one gets zeros, a spotlight
 * walks place by place to the first difference, then both land on a number line.
 */
export function compareScene(A: string, B: string): AnimPaint {
  const W = 320, H = 292, CW = 32, cxC = 120, YA = 64, YB = 116;
  const [wa, da = ''] = A.split(','), [wb, db = ''] = B.split(','), L = Math.max(da.length, db.length);
  const pa = da.padEnd(L, '0'), pb = db.padEnd(L, '0'), va = Number(`${wa}.${da}`), vb = Number(`${wb}.${db}`);
  const colsA = [wa!, ...pa], colsB = [wb!, ...pb];
  let diff = colsA.findIndex((c, i) => c !== colsB[i]); if (wa !== wb) diff = 0;
  const NAME = ['kokonaiset', 'kymmenesosat', 'sadasosat', 'tuhannesosat'];
  const colX = (i: number) => (i === 0 ? cxC - 24 : cxC + 4 + i * CW - CW / 2 + 4);
  const padAt = da.length !== db.length ? 1.6 : -1, scanAt = padAt > 0 ? 3.0 : 1.8, ST = 1.0;
  const stop = diff < 0 ? colsA.length - 1 : diff, lineAt = scanAt + (stop + 1) * ST + 0.6, fin = lineAt + 1.8;
  const sym = diff < 0 ? '=' : va > vb ? '>' : '<';
  // Zoom to a 0,2-wide window with hundredth ticks when both values fit; otherwise whole units.
  const zlo = Math.floor(Math.min(va, vb) * 10 - 1e-6) / 10, zoom = Math.max(va, vb) <= zlo + 0.2 + 1e-9;
  const lo = zoom ? zlo : Math.floor(Math.min(va, vb)), hi = zoom ? zlo + 0.2 : Math.floor(Math.max(va, vb)) + 1, LX = 24, LW = W - 48, LY = 210;
  const px = (v: number) => LX + ((v - lo) / (hi - lo)) * LW;
  const fmt = (v: number) => String(v).replace('.', ',');
  return anim({
    dur: fin + 3, w: W, h: H, label: `${A} ${sym} ${B}`,
    frame: (t) => {
      let s = '';
      const cur = t < scanAt ? -1 : Math.min(stop, Math.floor((t - scanAt) / ST));
      // Spotlight column.
      if (cur >= 0 && t < lineAt + 0.6) s += `<rect x="${colX(cur) - 17}" y="${YA - 34}" width="34" height="${YB - YA + 46}" rx="6" fill="color-mix(in srgb, var(--sun) 35%, transparent)" stroke="var(--sun)" stroke-width="2"/>`;
      if (cur >= 0 && t < lineAt + 0.6) s += `<text x="${colX(cur)}" y="${YA - 40}" text-anchor="middle" font-size="10" font-weight="800" fill="currentColor" opacity="0.75">${NAME[cur]}</text>`;
      for (const [cols, y, real] of [[colsA, YA, da.length], [colsB, YB, db.length]] as const) {
        cols.forEach((c, i) => {
          const pad = i > real, op = pad ? ease(t, padAt, padAt + 0.5) : ease(t, 0.1, 0.5);
          if (op <= 0) return;
          const win = diff === i && t >= scanAt + i * ST + 0.4, big = (y === YA) === va > vb;
          const fill = pad ? 'var(--ok)' : win ? (big ? 'var(--ok)' : 'var(--red)') : 'currentColor';
          s += `<text x="${colX(i)}" y="${y}" text-anchor="middle" font-size="34" font-weight="800" fill="${fill}" opacity="${op}">${c}</text>`;
        });
        s += `<text x="${cxC + 2}" y="${y}" text-anchor="middle" font-size="34" font-weight="800" fill="currentColor" opacity="${ease(t, 0.1, 0.5)}">,</text>`;
      }
      // Verdict per scanned column.
      for (let i = 0; i <= cur; i++) {
        const k = ease(t, scanAt + i * ST + 0.4, scanAt + i * ST + 0.7);
        s += `<text x="${colX(i)}" y="${YB + 34}" text-anchor="middle" font-size="16" font-weight="800" fill="${i === diff ? 'var(--ok)' : 'currentColor'}" opacity="${k * (i === diff ? 1 : 0.55)}">${i === diff ? (va > vb ? '▲' : '▼') : '='}</text>`;
      }
      if (diff >= 0 && t >= scanAt + diff * ST + 0.5) { const o = ease(t, scanAt + diff * ST + 0.5, scanAt + diff * ST + 0.9), x = colX(L) + 24; s += `<text x="${x}" y="${(YA + YB) / 2 - 12}" font-size="15" font-weight="800" fill="var(--ok)" opacity="${o}">${va > vb ? A : B}</text><text x="${x}" y="${(YA + YB) / 2 + 6}" font-size="12" font-weight="800" fill="var(--ok)" opacity="${o}">on suurempi</text>`; }
      // Number line.
      const lo2 = ease(t, lineAt, lineAt + 0.5);
      if (lo2 > 0) {
        s += `<g opacity="${lo2}"><line x1="${LX}" y1="${LY}" x2="${LX + LW}" y2="${LY}" stroke="currentColor" stroke-width="2"/>`;
        const steps = Math.round((hi - lo) * (zoom ? 100 : 10)), unit = zoom ? 100 : 10;
        for (let k = 0; k <= steps; k++) { const x = LX + (k / steps) * LW, big = k % 10 === 0; s += `<line x1="${x}" y1="${LY - (big ? 7 : 4)}" x2="${x}" y2="${LY + (big ? 7 : 4)}" stroke="currentColor" stroke-width="${big ? 2 : 1}"/>`; if (big || (k % 5 === 0 && steps <= 20)) s += `<text x="${x}" y="${LY + 22}" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" opacity="0.7">${fmt(Math.round((lo + k / unit) * 100) / 100)}</text>`; }
        s += '</g>';
        const m = ease(t, lineAt + 0.4, lineAt + 1.4);
        for (const [v, lab, up] of [[va, A, true], [vb, B, false]] as const) {
          const x = LX + (px(v) - LX) * m, col = sym === '=' ? 'var(--ok)' : (v === Math.max(va, vb) ? 'var(--ok)' : 'var(--blue)');
          s += `<circle cx="${x}" cy="${LY}" r="6" fill="${col}"/>`;
          s += `<text x="${x}" y="${up ? LY - 14 : LY - 30}" text-anchor="middle" font-size="12" font-weight="800" fill="${col}">${lab}</text>`;
        }
      }
      if (t >= fin - 0.5) s += `<text x="${W / 2}" y="${H - 8}" text-anchor="middle" font-size="20" font-weight="800" fill="currentColor" opacity="${ease(t, fin - 0.5, fin)}">${A} ${sym} ${B}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < (padAt > 0 ? padAt : scanAt)) return `Kumpi on suurempi, ${A} vai ${B}? Laitetaan pilkut kohdakkain.`;
      if (padAt > 0 && t < scanAt) return 'Lyhyempään lisätään nolla loppuun. Arvo ei muutu, mutta nyt numeroita on yhtä monta.';
      if (t < lineAt) {
        const i = Math.min(stop, Math.floor((t - scanAt) / ST));
        if (i === diff) return `${NAME[i]![0]!.toUpperCase()}${NAME[i]!.slice(1)}: ${colsA[i]} ja ${colsB[i]}. Tässä ero, joten ${va > vb ? A : B} on suurempi.`;
        return `${NAME[i]![0]!.toUpperCase()}${NAME[i]!.slice(1)}: ${colsA[i]} ja ${colsB[i]} ovat samat. Siirrytään seuraavaan paikkaan.`;
      }
      if (t < fin) return sym === '=' ? 'Lukusuoralla ne ovat samassa kohdassa.' : `Lukusuoralla ${va > vb ? A : B} on oikeammalla.`;
      return sym === '=' ? `${A} = ${B}: lopun nolla ei muuta arvoa.` : `${A} ${sym} ${B}.`;
    },
  });
}

/**
 * Column addition/subtraction of decimals: first the tempting wrong layout (last digits aligned),
 * then the numbers slide so the commas line up, zeros fill the gap, and the columns are worked
 * right to left with carries or borrows.
 */
export function decColumnScene(A: string, B: string, op: '+' | '−' = '+'): AnimPaint {
  const decs = (x: string) => (x.split(',')[1] ?? '').length, num = (x: string) => Number(x.replace(',', '.'));
  const pA = decs(A), pB = decs(B), p = Math.max(pA, pB), sc = 10 ** p;
  const ia = Math.round(num(A) * sc), ib = Math.round(num(B) * sc), ir = op === '+' ? ia + ib : ia - ib;
  const intLen = (v: number) => String(Math.floor(v / sc)).length;
  const IW = Math.max(intLen(ia), intLen(ib), intLen(ir)), N = IW + p;
  const dig = (v: number, k: number) => Math.floor(v / 10 ** k) % 10;
  const shown = (v: number, k: number) => k < p || k < p + intLen(v); // hide leading blanks
  // Per column (k = 0 rightmost): result digit, carry/borrow out, effective top digit.
  const res: number[] = [], out: number[] = [], top: number[] = [];
  let c = 0;
  for (let k = 0; k < N; k++) {
    if (op === '+') { const s = dig(ia, k) + dig(ib, k) + c; res.push(s % 10); out.push(s >= 10 ? 1 : 0); top.push(dig(ia, k)); c = s >= 10 ? 1 : 0; }
    else { let t = dig(ia, k) - c, o = 0; if (t < dig(ib, k)) { t += 10; o = 1; } top.push(t); res.push(t - dig(ib, k)); out.push(o); c = o; }
  }
  const lastK = Math.max(p, intLen(ir) + p - 1); // columns worked: all decimals and result's whole digits
  const W = 320, CW = 30, CMW = 16, tot = N * CW + CMW, x0 = (W - tot) / 2 + 12;
  const cx = (k: number) => { const col = N - 1 - k; return x0 + col * CW + (col >= IW ? CMW : 0) + CW / 2; };
  const commaX = x0 + IW * CW + CMW / 2;
  const YA = 82, YB = 124, YR = 176, H = 236;
  const differ = pA !== pB, wrongEnd = differ ? 2.6 : 0.6, alignEnd = differ ? 3.4 : 0.6, padEnd = alignEnd + (differ ? 0.8 : 0.2);
  const C0 = padEnd + 0.4, ST = 1.5, at = (k: number) => C0 + k * ST, fin = at(lastK + 1) + 0.2;
  const NAME = (k: number) => k < p ? (p - k === 1 ? 'Kymmenesosat' : p - k === 2 ? 'Sadasosat' : 'Tuhannesosat') : (['Ykköset', 'Kympit', 'Sadat'][k - p] ?? 'Tuhannet');
  const sh = (pX: number) => (p - pX) * CW + (pX === 0 && p > 0 ? CMW : 0); // wrong-layout shift right
  const fmt = (v: number) => { const s = String(v).padStart(p + 1, '0'); return p ? `${s.slice(0, -p)},${s.slice(-p)}` : s; };
  const R = fmt(ir);
  return anim({
    dur: fin + 3, w: W, h: H, label: `${A} ${op} ${B} = ${R}`,
    frame: (t) => {
      let s = '';
      const slide = 1 - ease(t, wrongEnd, alignEnd);
      const cur = t >= C0 && t < fin - 0.2 ? Math.min(lastK, Math.floor((t - C0) / ST)) : -1;
      if (cur >= 0) s += `<rect x="${cx(cur) - CW / 2 + 1}" y="${YA - 50}" width="${CW - 2}" height="${YR - YA + 62}" rx="6" fill="color-mix(in srgb, var(--sun) 30%, transparent)" stroke="var(--sun)" stroke-width="2"/>`;
      for (const [v, y, pX, isTop] of [[ia, YA, pA, true], [ib, YB, pB, false]] as const) {
        const dx = sh(pX) * slide, col = differ && t < alignEnd ? 'var(--red)' : 'currentColor';
        for (let k = 0; k < N; k++) {
          if (!shown(v, k)) continue;
          const pad = k < p - pX;
          if (pad) { const o = ease(t, alignEnd, padEnd); if (o > 0) s += `<text x="${cx(k)}" y="${y}" text-anchor="middle" font-size="28" font-weight="800" fill="var(--ok)" opacity="${o}">0</text>`; continue; }
          const struck = op === '−' && isTop && k > 0 && out[k - 1] === 1 && t >= at(k - 1) + 0.5;
          s += `<text x="${cx(k) + dx}" y="${y}" text-anchor="middle" font-size="28" font-weight="800" fill="${col}" opacity="${ease(t, 0.1, 0.5)}">${dig(v, k)}</text>`;
          if (struck) s += `<line x1="${cx(k) - 10}" y1="${y - 4}" x2="${cx(k) + 10}" y2="${y - 18}" stroke="var(--red)" stroke-width="2.5"/>`;
        }
        if (pX > 0) s += `<text x="${commaX + dx}" y="${y}" text-anchor="middle" font-size="28" font-weight="800" fill="${col}" opacity="${ease(t, 0.1, 0.5)}">,</text>`;
        else if (t >= alignEnd && p > 0) s += `<text x="${commaX}" y="${y}" text-anchor="middle" font-size="28" font-weight="800" fill="var(--ok)" opacity="${ease(t, alignEnd, padEnd)}">,</text>`;
      }
      s += `<text x="${x0 - 14}" y="${YB}" text-anchor="middle" font-size="26" font-weight="800" fill="currentColor">${op}</text>`;
      s += `<line x1="${x0 - 26}" y1="${YB + 12}" x2="${x0 + tot + 4}" y2="${YB + 12}" stroke="currentColor" stroke-width="2.5"/>`;
      if (differ && t > 0.6 && t < alignEnd) s += `<text x="${W - 10}" y="${YA - 30}" text-anchor="end" font-size="13" font-weight="800" fill="var(--red)" opacity="${ease(t, 0.8, 1.2) * slide}">✗ pilkut eivät ole kohdakkain</text>`;
      // Carries / borrows above the top row.
      for (let k = 0; k <= lastK; k++) {
        if (t < at(k) + 0.6) continue;
        const o = ease(t, at(k) + 0.6, at(k) + 1.0);
        if (op === '+' && out[k] && k + 1 < N) s += `<text x="${cx(k + 1)}" y="${YA - 32}" text-anchor="middle" font-size="15" font-weight="800" fill="var(--red)" opacity="${o}">1</text>`;
        if (op === '−' && top[k] !== dig(ia, k)) s += `<text x="${cx(k)}" y="${YA - 32}" text-anchor="middle" font-size="14" font-weight="800" fill="var(--red)" opacity="${ease(t, at(k), at(k) + 0.4)}">${top[k]}</text>`;
      }
      // Result digits.
      for (let k = 0; k <= lastK; k++) {
        if (t < at(k) + 0.4) continue;
        s += `<text x="${cx(k)}" y="${YR - 10 * (1 - ease(t, at(k) + 0.4, at(k) + 0.8))}" text-anchor="middle" font-size="30" font-weight="800" fill="var(--ok)" opacity="${ease(t, at(k) + 0.4, at(k) + 0.8)}">${res[k]}</text>`;
      }
      if (p > 0 && t >= at(p) - 0.3) s += `<text x="${commaX}" y="${YR}" text-anchor="middle" font-size="30" font-weight="800" fill="var(--ok)" opacity="${ease(t, at(p) - 0.3, at(p))}">,</text>`;
      if (t >= fin - 0.2) s += `<text x="${W / 2}" y="${H - 10}" text-anchor="middle" font-size="18" font-weight="800" fill="currentColor" opacity="${ease(t, fin - 0.2, fin + 0.3)}">${A} ${op} ${B} = ${R}</text>`;
      return s;
    },
    caption: (t) => {
      if (differ && t < wrongEnd) {
        const [sh2, lg, ps, pl] = pA < pB ? [A, B, pA, pB] : [B, A, pB, pA];
        const NOM = ['ykköset', 'kymmenesosat', 'sadasosat', 'tuhannesosat'], GEN = ['ykkösten', 'kymmenesosien', 'sadasosien', 'tuhannesosien'];
        return `Ansa: jos numerot laitetaan oikeaan reunaan, ${sh2}:n ${NOM[ps]} osuvat ${lg}:n ${GEN[pl]} kohdalle.`;
      }
      if (differ && t < alignEnd) return 'Siirretään niin, että pilkut ovat kohdakkain.';
      if (t < C0) return differ ? 'Tyhjä paikka täytetään nollalla. Arvo ei muutu.' : `Pilkut ovat valmiiksi kohdakkain: ${A} ${op} ${B}.`;
      if (t < fin) {
        const k = Math.min(lastK, Math.floor((t - C0) / ST)), a = dig(ia, k), b = dig(ib, k);
        if (op === '+') { const cin = k > 0 ? out[k - 1]! : 0, sum = a + b + cin; return `${NAME(k)}: ${a} + ${b}${cin ? ' + 1' : ''} = ${sum}${sum >= 10 ? `. Kirjoita ${sum % 10}, muistiin 1.` : '.'}`; }
        const tk = top[k]!, bin = k > 0 ? out[k - 1]! : 0;
        if (out[k]) return `${NAME(k)}: ${bin ? `${a} − 1 lainattu = ${a - 1}, ` : ''}${tk - 10} − ${b} ei onnistu. Lainataan 1 seuraavasta: ${tk} − ${b} = ${res[k]}.`;
        return `${NAME(k)}: ${bin ? `lainattu yksi pois, ${tk}` : tk} − ${b} = ${res[k]}.`;
      }
      return `${A} ${op} ${B} = ${R}.`;
    },
  });
}

/** k × 0,a: k groups of a tenths fill tenth-strips one group at a time. */
export function timesTenthsScene(k: number, a: number): AnimPaint {
  const n = k * a, bars = Math.max(1, Math.ceil(n / 10)), W = 320, U = 26, BX = (W - 10 * U) / 2, BY = 70, BG = 44, BH = 30;
  const GC = ['#4f8fd6', '#e0a526', '#3e9b54', '#d9822b', '#9b59b6', '#2bb3b3', '#c0392b', '#7f8c8d', '#16a085'];
  const T0 = 1.0, GT = 1.0, fin = T0 + k * GT + 0.6, H = BY + bars * BG + 70;
  const dec = (v: number) => (v / 10).toFixed(1).replace('.', ',').replace(',0', '');
  return anim({
    dur: fin + 3, w: W, h: H, label: `${k} × ${dec(a)} = ${dec(n)}`,
    frame: (t) => {
      let s = `<text x="${W / 2}" y="30" text-anchor="middle" font-size="20" font-weight="800" fill="currentColor">${k} × ${dec(a)}</text>`;
      const g = t < T0 ? 0 : Math.min(k, Math.floor((t - T0) / GT) + 1);
      for (let b = 0; b < bars; b++) {
        const y = BY + b * BG;
        for (let i = 0; i < 10; i++) {
          const c = b * 10 + i, grp = Math.floor(c / a);
          if (c < n && grp < g) { const f = ease(t, T0 + grp * GT, T0 + grp * GT + 0.5); s += `<rect x="${BX + i * U}" y="${y + BH * (1 - f)}" width="${U}" height="${BH * f}" fill="${GC[grp % GC.length]}" opacity="0.85"/>`; }
          s += `<rect x="${BX + i * U}" y="${y}" width="${U}" height="${BH}" fill="none" stroke="currentColor" stroke-width="1"/>`;
        }
        const full = n >= (b + 1) * 10 && g * a >= (b + 1) * 10;
        s += `<rect x="${BX}" y="${y}" width="${10 * U}" height="${BH}" rx="2" fill="none" stroke="${full ? 'var(--ok)' : 'currentColor'}" stroke-width="${full ? 3 : 1.6}"/>`;
        if (full) s += `<text x="${BX + 10 * U + 8}" y="${y + 21}" font-size="14" font-weight="800" fill="var(--ok)">= 1</text>`;
      }
      const sofar = Math.min(g, k) * a;
      if (g > 0) s += `<text x="${W / 2}" y="${BY + bars * BG + 18}" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">${g} × ${a} kymmenesosaa = ${sofar} kymmenesosaa</text>`;
      if (t >= fin - 0.4) s += `<text x="${W / 2}" y="${H - 12}" text-anchor="middle" font-size="20" font-weight="800" fill="var(--ok)" opacity="${ease(t, fin - 0.4, fin + 0.2)}">${k} × ${dec(a)} = ${dec(n)}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < T0) return `${dec(a)} on ${a} kymmenesosaa. Otetaan se ${k} kertaa.`;
      if (t < fin) { const g = Math.min(k, Math.floor((t - T0) / GT) + 1); return `${g}. ryhmä: yhteensä ${g * a} kymmenesosaa.${g * a >= 10 ? ' Kymmenen kymmenesosaa on yksi kokonainen.' : ''}`; }
      return `${n} kymmenesosaa = ${dec(n)}.`;
    },
  });
}

/**
 * × or ÷ by 10/100/1000 on a place-value chart: the comma stays put and every digit slides the
 * same number of places; empty places that are needed get zeros.
 */
export function shiftScene(x: string, p: number, op: '×' | '÷' = '×'): AnimPaint {
  const steps = String(p).length - 1, dir = op === '×' ? 1 : -1;
  const [ip, dp = ''] = x.split(','), digits = [...ip!, ...dp];
  // Column index: 0 = thousands … 3 = ones, 4.. = decimals. Start position of each digit:
  const start = digits.map((_, i) => 3 - (ip!.length - 1) + i);
  const NAMES = ['tuhannet', 'sadat', 'kympit', 'ykköset', 'kymmenes-osat', 'sadas-osat', 'tuhannes-osat'];
  const W = 320, CWd = 42, NC = 7, X0 = (W - NC * CWd) / 2, Y0 = 70, RH = 56, H = 250;
  const colX = (c: number) => X0 + c * CWd + CWd / 2;
  const endPos = start.map((c) => c - dir * steps);
  const res = (() => {
    const lo = Math.min(...endPos, 3), hi = Math.max(...endPos, 3);
    const cell = new Map(endPos.map((c, i) => [c, digits[i]!]));
    let s = '';
    for (let c = lo; c <= hi; c++) { s += cell.get(c) ?? '0'; if (c === 3 && c < hi) s += ','; }
    // Trim leading zeros of the whole part and trailing decimal zeros.
    s = s.replace(/^0+(?=\d)/, '');
    if (s.includes(',')) s = s.replace(/0+$/, '').replace(/,$/, '');
    return s;
  })();
  // Leading zeros of the whole part (as in 0,7) carry no value: they fade away instead of moving.
  const lead = digits.map((ch, i) => i < ip!.length - 1 || (ip === '0' && i === 0) ? digits.slice(0, i + 1).every((q) => q === '0') : false);
  const live = endPos.filter((_, i) => !lead[i]);
  const zeroCols = (() => { const lo = Math.min(...live, 3), hi = Math.max(...live, 3), out: number[] = []; for (let c = lo; c <= hi; c++) if (!live.includes(c) && (c === 3 || (c < 3 ? c > Math.min(...live) : c < Math.max(...live)))) out.push(c); return out; })();
  const T0 = 1.6, MT = 1.0, zAt = T0 + steps * MT + 0.3, fin = zAt + (zeroCols.length ? 1.0 : 0.2);
  return anim({
    dur: fin + 3, w: W, h: H, label: `${x} ${op} ${p} = ${res}`,
    frame: (t) => {
      let s = `<text x="${W / 2}" y="30" text-anchor="middle" font-size="20" font-weight="800" fill="currentColor">${x} ${op} ${p}</text>`;
      for (let c = 0; c < NC; c++) {
        const dc = c >= 4;
        s += `<rect x="${X0 + c * CWd}" y="${Y0}" width="${CWd}" height="${RH}" fill="color-mix(in srgb, ${dc ? '#4f8fd6' : 'var(--sun)'} ${c === 3 ? 22 : 10}%, transparent)" stroke="currentColor" stroke-width="1"/>`;
        const [l1, l2] = NAMES[c]!.split('-');
        s += `<text x="${colX(c)}" y="${Y0 - (l2 ? 18 : 8)}" text-anchor="middle" font-size="9" font-weight="700" fill="currentColor" opacity="0.7">${l1}${l2 ? '' : ''}</text>`;
        if (l2) s += `<text x="${colX(c)}" y="${Y0 - 7}" text-anchor="middle" font-size="9" font-weight="700" fill="currentColor" opacity="0.7">${l2}</text>`;
      }
      // Fixed comma.
      s += `<circle cx="${X0 + 4 * CWd}" cy="${Y0 + RH - 8}" r="4.5" fill="var(--red)"/>`;
      const m = steps === 0 ? 1 : Math.min(steps, Math.max(0, (t - T0) / MT));
      const whole = Math.floor(m), frac = ease(m - whole, 0, 1);
      const shift = (whole + frac) * dir;
      digits.forEach((d, i) => {
        const x = colX(start[i]!) - shift * CWd;
        s += `<text x="${x}" y="${Y0 + 38}" text-anchor="middle" font-size="28" font-weight="800" fill="currentColor" opacity="${lead[i] ? 1 - ease(t, T0 - 0.8, T0) : 1}">${d}</text>`;
      });
      for (const c of zeroCols) { const o = ease(t, zAt, zAt + 0.5); if (o > 0) s += `<text x="${colX(c)}" y="${Y0 + 38}" text-anchor="middle" font-size="28" font-weight="800" fill="var(--ok)" opacity="${o}">0</text>`; }
      // Arrow showing direction.
      if (t >= T0 - 0.6 && t < zAt) s += `<text x="${W / 2}" y="${Y0 + RH + 34}" text-anchor="middle" font-size="15" font-weight="800" fill="var(--red)" opacity="${ease(t, T0 - 0.6, T0)}">${dir > 0 ? '⟵' : '⟶'} ${steps} ${steps === 1 ? 'paikka' : 'paikkaa'} ${dir > 0 ? 'suuremmaksi' : 'pienemmäksi'}</text>`;
      if (t >= fin - 0.3) s += `<text x="${W / 2}" y="${H - 18}" text-anchor="middle" font-size="22" font-weight="800" fill="var(--ok)" opacity="${ease(t, fin - 0.3, fin + 0.3)}">${x} ${op} ${p} = ${res}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < T0) return `Pilkku (punainen piste) pysyy paikallaan. ${op === '×' ? 'Kertominen' : 'Jakaminen'} luvulla ${p} siirtää jokaista numeroa ${steps} ${steps === 1 ? 'paikan' : 'paikkaa'} ${dir > 0 ? 'vasemmalle' : 'oikealle'}.`;
      if (t < zAt) return `Joka siirrolla numero tulee kymmenen kertaa ${dir > 0 ? 'suuremmaksi' : 'pienemmäksi'}.`;
      if (t < fin && zeroCols.length) return 'Pilkun ja numeroiden väliin jääneet tyhjät paikat täytetään nollilla.';
      return `${x} ${op} ${p} = ${res}.`;
    },
  });
}

/**
 * Sharing a decimal (w wholes + t tenths) equally between k plates: wholes first, a leftover
 * whole is exchanged for ten tenths, then the tenths are dealt. Assumes the tenths divide evenly.
 */
export function shareDecScene(w: number, t: number, k: number): AnimPaint {
  const q1 = Math.floor(w / k), r1 = w - q1 * k, T = t + 10 * r1, q2 = Math.floor(T / k);
  const W = 320, H = 290, SY1 = 60, SY2 = 112, PY = 240, DT = 0.45, DT2 = Math.max(0.12, Math.min(0.3, 4 / T));
  const tW = 1.2, tX = tW + q1 * k * DT + 0.5, xDur = r1 ? 1.6 : 0, tT = tX + xDur, fin = tT + T * DT2 + 0.8;
  const pw = W / k, pcx = (i: number) => pw / 2 + i * pw;
  const fmt = (a: number, b: number) => (b ? `${a},${b}` : `${a}`);
  const total = fmt(w, t), each = fmt(q1, q2);
  const sx1 = (j: number) => 20 + j * 26, sx2 = (j: number) => 20 + j * 9;
  const fly = (x0: number, y0: number, x1: number, y1: number, a: number) => [x0 + (x1 - x0) * a, y0 + (y1 - y0) * a - Math.sin(a * Math.PI) * 30] as const;
  const sq = (x: number, y: number, op = 1, stroke = 'currentColor') => `<rect x="${x - 10}" y="${y - 10}" width="20" height="20" rx="2" fill="var(--sun)" stroke="${stroke}" stroke-width="1.2" opacity="${op}"/>`;
  const bar = (x: number, y: number, op = 1) => `<rect x="${x - 2.5}" y="${y - 10}" width="5" height="20" rx="1" fill="#4f8fd6" opacity="${op}"/>`;
  return anim({
    dur: fin + 3, w: W, h: H, label: `${total} : ${k} = ${each}`,
    frame: (tt) => {
      let s = `<text x="${W / 2}" y="22" text-anchor="middle" font-size="18" font-weight="800" fill="currentColor">${total} : ${k}</text>`;
      for (let i = 0; i < k; i++) s += `<ellipse cx="${pcx(i)}" cy="${PY}" rx="${Math.min(52, pw / 2 - 6)}" ry="9" fill="color-mix(in srgb, currentColor 8%, transparent)" stroke="currentColor" stroke-width="1.5"/>`;
      // Wholes.
      for (let j = 0; j < w; j++) {
        if (j < q1 * k) {
          const a = ease(tt, tW + j * DT, tW + j * DT + DT * 0.9), i = j % k, slot = Math.floor(j / k);
          const [x, y] = fly(sx1(j), SY1, pcx(i) - (q1 - 1) * 12 + slot * 24, PY - 52, a);
          s += sq(x, y);
        } else {
          const glow = tt >= tX && tt < tT, gone = ease(tt, tX + 0.6, tX + 1.0);
          s += sq(sx1(j), SY1, 1 - gone, glow ? 'var(--red)' : 'currentColor');
          if (glow) s += `<text x="${sx1(j)}" y="${SY1 + 24}" text-anchor="middle" font-size="10" font-weight="800" fill="var(--red)" opacity="${1 - gone}">=10</text>`;
        }
      }
      // Tenths: original ones, then the exchanged ones appear.
      for (let j = 0; j < T; j++) {
        const born = j < t ? ease(tt, 0.1, 0.5) : ease(tt, tX + 0.7, tX + 1.3);
        if (born <= 0) continue;
        const a = ease(tt, tT + j * DT2, tT + j * DT2 + 0.35);
        // Exchanged tenths spring out of the whole they came from.
        const sxj = j < t ? sx2(j) : sx1(q1 * k + Math.floor((j - t) / 10)) + (sx2(j) - sx1(q1 * k + Math.floor((j - t) / 10))) * born;
        const syj = j < t ? SY2 : SY1 + (SY2 - SY1) * born;
        if (j < q2 * k) {
          const i = j % k, slot = Math.floor(j / k);
          const [x, y] = fly(sxj, syj, pcx(i) - (q2 - 1) * 4 + slot * 8, PY - 22, a);
          s += bar(x, y, Math.max(born, 0.3));
        } else s += bar(sxj, syj, Math.max(born, 0.3));
      }
      if (tt >= fin - 0.6) for (let i = 0; i < k; i++) s += `<text x="${pcx(i)}" y="${PY + 30}" text-anchor="middle" font-size="16" font-weight="800" fill="var(--ok)" opacity="${ease(tt, fin - 0.6, fin)}">${each}</text>`;
      if (tt >= fin) s += `<text x="${W / 2}" y="${PY - 90}" text-anchor="middle" font-size="16" font-weight="800" fill="currentColor" opacity="${ease(tt, fin, fin + 0.4)}">${total} : ${k} = ${each}</text>`;
      return s;
    },
    caption: (tt) => {
      if (tt < tW) return `${total} on ${w} kokonaista ja ${t} kymmenesosaa. Jaetaan ${k} lautaselle.`;
      if (tt < tX) return `Ensin kokonaiset: ${w} : ${k} → jokainen saa ${q1}.`;
      if (tt < tT) return r1 === 1 ? `1 kokonainen jää yli. Se vaihdetaan kymmeneksi kymmenesosaksi: nyt kymmenesosia on ${T}.` : `${r1} kokonaista jää yli. Kukin vaihdetaan kymmeneksi kymmenesosaksi: nyt kymmenesosia on ${T}.`;
      if (tt < fin) return `Sitten kymmenesosat: ${T} : ${k} → jokainen saa ${q2}.`;
      return `Jokainen saa ${q1} ${q1 === 1 ? 'kokonaisen' : 'kokonaista'} ja ${q2} kymmenesosaa: ${each}. Tarkistus: ${k} × ${each} = ${total}.`;
    },
  });
}
