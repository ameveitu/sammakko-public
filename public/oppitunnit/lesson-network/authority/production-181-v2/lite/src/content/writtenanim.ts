// Written (column) calculation, animated one column at a time: the column lights up, its sum is
// shown, the ones digit drops into the answer and a carried ten flies to the next column.
import { anim, ease, type AnimPaint } from '../ui/anim';

const XC = 'var(--blue)', CC = 'var(--red)';
const PLACE = ['Ykköset', 'Kymmenet', 'Sadat', 'Tuhannet'];

export function addColumnScene(a: number, b: number): AnimPaint {
  const sum = a + b, L = String(sum).length, W = 320, H = 222, CWD = 42, RX = 236;
  const cx = (i: number) => RX - i * CWD; // i = 0 ones, 1 tens, …
  const dig = (n: number, i: number) => Math.floor(n / 10 ** i) % 10;
  const la = String(a).length, lb = String(b).length, cols = Math.max(la, lb);
  // Per column: carry in, column sum, digit out, carry out.
  const steps: { cin: number; s: number; d: number; cout: number }[] = [];
  let c = 0;
  for (let i = 0; i < cols; i++) { const s = dig(a, i) + dig(b, i) + c; steps.push({ cin: c, s, d: s % 10, cout: s >= 10 ? 1 : 0 }); c = s >= 10 ? 1 : 0; }
  const ST = 3.6, t0 = 0.8, fin = t0 + cols * ST + (c ? 1.2 : 0);
  const Y = { carry: 34, a: 76, b: 118, rule: 132, res: 172, bubble: 208 };
  const num = (x: number, y: number, v: string | number, col = 'currentColor', size = 32, op = 1) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="800" font-family="ui-monospace, Menlo, monospace" fill="${col}" opacity="${op}">${v}</text>`;
  return anim({
    dur: fin + 3, w: W, h: H, label: `${a} + ${b} allekkain`,
    frame: (t) => {
      let s = '';
      const k = Math.min(cols - 1, Math.max(0, Math.floor((t - t0) / ST))), active = t >= t0 && t < t0 + cols * ST;
      if (active) s += `<rect x="${cx(k) - 19}" y="${Y.carry - 26}" width="38" height="${Y.res - Y.carry + 34}" rx="8" fill="color-mix(in srgb, var(--sun) 30%, transparent)" stroke="var(--sun)" stroke-width="2"/>`;
      for (let i = 0; i < la; i++) s += num(cx(i), Y.a, dig(a, i));
      for (let i = 0; i < lb; i++) s += num(cx(i), Y.b, dig(b, i));
      s += num(cx(Math.max(la, lb)) + 6, Y.b, '+') + `<line x1="${cx(L - 1) - 34}" y1="${Y.rule}" x2="${RX + 22}" y2="${Y.rule}" stroke="currentColor" stroke-width="3"/>`;
      steps.forEach((st, i) => {
        const ti = t0 + i * ST;
        if (t < ti) return;
        const pB = ease(t, ti + 0.5, ti + 0.9), pD = ease(t, ti + 1.5, ti + 2.1), pC = ease(t, ti + 2.2, ti + 3.0);
        if (i === k && active && pB > 0) {
          const parts = [dig(a, i), dig(b, i), ...(st.cin ? [st.cin] : [])];
          s += `<text x="${W / 2 - 30}" y="${Y.bubble}" text-anchor="middle" font-size="16" font-weight="800" fill="currentColor" opacity="${pB}">${PLACE[i]}: ${parts.join(' + ')} = <tspan fill="${st.cout ? CC : XC}">${st.s}</tspan></text>`;
        }
        if (pD > 0) s += num(cx(i), Y.bubble - 20 + (Y.res - Y.bubble + 20) * pD, st.d, XC, 32, Math.min(1, pD * 2));
        if (st.cout && pC > 0) {
          const x0 = cx(i) + 14, y0 = Y.bubble - 20, x1 = cx(i + 1), y1 = Y.carry;
          const x = x0 + (x1 - x0) * pC, y = y0 + (y1 - y0) * pC - Math.sin(Math.PI * pC) * 30;
          if (i === cols - 1 && t >= ti + 3.2) {
            const pN = ease(t, ti + 3.2, ti + 3.2 + 0.8);
            s += num(x1, Y.carry + (Y.res - Y.carry) * pN, 1, pN < 1 ? CC : XC, pN < 1 ? 20 + 12 * pN : 32);
          } else s += num(x, y, 1, CC, 20);
        }
      });
      if (t >= fin) s += `<rect x="${cx(L - 1) - 22}" y="${Y.res - 30}" width="${RX - cx(L - 1) + 44}" height="40" rx="8" fill="none" stroke="var(--ok)" stroke-width="3" opacity="${ease(t, fin, fin + 0.4)}"/>`;
      return s;
    },
    caption: (t) => {
      if (t < t0) return `${a} + ${b}: aloitetaan ykkösistä, oikealta.`;
      if (t >= t0 + cols * ST) return c ? `Viimeinen muistinumero 1 kirjoitetaan vastaukseen uudeksi numeroksi: ${a} + ${b} = ${sum}.` : `Valmis: ${a} + ${b} = ${sum}.`;
      const k = Math.floor((t - t0) / ST), st = steps[k]!, tk = t0 + k * ST;
      const parts = [dig(a, k), dig(b, k), ...(st.cin ? [st.cin] : [])];
      if (t < tk + 0.5) return `${PLACE[k]}${st.cin ? ' — muista muistinumero 1!' : '.'}`;
      if (t < tk + 1.5) return `${PLACE[k]}: ${parts.join(' + ')} = ${st.s}.`;
      if (!st.cout) return `${st.s} mahtuu yhteen paikkaan: kirjoitetaan ${st.d}.`;
      return `${st.s} = 1 ${['kymppi', 'sata', 'tuhat', 'kymppitonni'][k]} ja ${st.d}. Kirjoitetaan ${st.d}, 1 muistiin seuraavaan sarakkeeseen.`;
    },
  });
}

/** Column subtraction with exchanges shown: when the top digit is too small, the next column's
 *  digit is crossed out and lowered by one (a 0 becomes 10 and then 9), and the column gets ten
 *  more. Then the difference digit drops into the answer. */
export function subColumnScene(a: number, b: number): AnimPaint {
  const W = 320, H = 232, CWD = 42, RX = 236, L = String(a).length, diff = a - b, LD = String(diff).length;
  const cx = (i: number) => RX - i * CWD;
  const dig = (n: number, i: number) => Math.floor(n / 10 ** i) % 10;
  const Y = { mark: 46, a: 88, b: 130, rule: 144, res: 184, bubble: 218 };
  const top = Array.from({ length: L }, (_, i) => dig(a, i));
  // Plan: per column, the exchanges it needs and the resulting subtraction.
  type Ev = { col: number; v: number; dt: number };
  const cols: { start: number; len: number; evs: Ev[]; tv: number; bv: number; d: number; why: string }[] = [];
  let t = 0.8;
  for (let i = 0; i < L; i++) {
    const bv = dig(b, i), evs: Ev[] = [];
    let why = '';
    if (top[i]! < bv) {
      let j = i + 1;
      while (top[j] === 0) j++;
      // Lend from j down to i.
      let dt = 1.2;
      evs.push({ col: j, v: top[j]! - 1, dt }); top[j] = top[j]! - 1;
      for (let m = j - 1; m > i; m--) { dt += 0.7; evs.push({ col: m, v: 10, dt }); dt += 0.6; evs.push({ col: m, v: 9, dt }); top[m] = 9; }
      dt += 0.7; evs.push({ col: i, v: top[i]! + 10, dt }); top[i] = top[i]! + 10;
      why = j > i + 1 ? `${PLACE[i]}: ${dig(a, i)} − ${bv} ei onnistu, ja viereinen sarake on 0. Vaihdetaan ensin ${['', 'kymppi', 'sata', 'tuhat'][j]} kymmeneksi ${['', 'ykköseksi', 'kympiksi', 'sadaksi'][j]}, sitten yksi kymppi ykkösiksi.` : `${PLACE[i]}: ${top[i]! - 10} − ${bv} ei onnistu. Vaihdetaan yksi ${['kymppi', 'sata', 'tuhat'][i]} kymmeneksi ${['ykköseksi', 'kympiksi', 'sadaksi'][i]}.`;
    }
    const last = evs.length ? evs[evs.length - 1]!.dt : 0;
    const len = (evs.length ? last + 0.9 : 0.7) + 2.1;
    cols.push({ start: t, len, evs, tv: top[i]!, bv, d: top[i]! - bv, why });
    t += len;
  }
  const fin = t;
  const num = (x: number, y: number, v: string | number, col = 'currentColor', size = 32, op = 1) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="800" font-family="ui-monospace, Menlo, monospace" fill="${col}" opacity="${op}">${v}</text>`;
  return anim({
    dur: fin + 3, w: W, h: H, label: `${a} − ${b} allekkain`,
    frame: (tt) => {
      let s = '';
      const k = cols.filter((c) => tt >= c.start).length - 1, active = k >= 0 && tt < fin;
      if (active) s += `<rect x="${cx(k) - 19}" y="${Y.mark - 24}" width="38" height="${Y.res - Y.mark + 32}" rx="8" fill="color-mix(in srgb, var(--sun) 30%, transparent)" stroke="var(--sun)" stroke-width="2"/>`;
      // Top digits with their latest exchanges.
      const latest: (number | undefined)[] = [];
      cols.forEach((c) => c.evs.forEach((e) => { if (tt >= c.start + e.dt) latest[e.col] = e.v; }));
      for (let i = 0; i < L; i++) {
        s += num(cx(i), Y.a, dig(a, i));
        if (latest[i] !== undefined) {
          s += `<line x1="${cx(i) - 13}" y1="${Y.a - 4}" x2="${cx(i) + 13}" y2="${Y.a - 20}" stroke="${CC}" stroke-width="3"/>`;
          s += num(cx(i), Y.mark, latest[i]!, CC, latest[i]! >= 10 ? 18 : 20);
        }
      }
      for (let i = 0; i < String(b).length; i++) s += num(cx(i), Y.b, dig(b, i));
      s += num(cx(L) + 6, Y.b, '−') + `<line x1="${cx(L - 1) - 34}" y1="${Y.rule}" x2="${RX + 22}" y2="${Y.rule}" stroke="currentColor" stroke-width="3"/>`;
      cols.forEach((c, i) => {
        if (tt < c.start) return;
        const tc = c.start + (c.evs.length ? c.evs[c.evs.length - 1]!.dt + 0.9 : 0.7), pB = ease(tt, tc, tc + 0.4), pD = ease(tt, tc + 1.0, tc + 1.6);
        if (i === k && active && pB > 0) s += `<text x="${W / 2 - 30}" y="${Y.bubble}" text-anchor="middle" font-size="16" font-weight="800" fill="currentColor" opacity="${pB}">${PLACE[i]}: ${c.tv} − ${c.bv} = <tspan fill="${XC}">${c.d}</tspan></text>`;
        const lead = i >= LD && c.d === 0;
        if (pD > 0 && !lead) s += num(cx(i), Y.bubble - 20 + (Y.res - Y.bubble + 20) * pD, c.d, XC, 32, Math.min(1, pD * 2));
      });
      if (tt >= fin) s += `<rect x="${cx(LD - 1) - 22}" y="${Y.res - 30}" width="${RX - cx(LD - 1) + 44}" height="40" rx="8" fill="none" stroke="var(--ok)" stroke-width="3" opacity="${ease(tt, fin, fin + 0.4)}"/>`;
      return s;
    },
    caption: (tt) => {
      if (tt < cols[0]!.start) return `${a} − ${b}: aloitetaan ykkösistä. Aina ylhäältä alhaalta pois.`;
      if (tt >= fin) return `Valmis: ${a} − ${b} = ${diff}. Tarkistus: ${diff} + ${b} = ${a}.`;
      const k = cols.filter((c) => tt >= c.start).length - 1, c = cols[k]!, rel = tt - c.start;
      const tc = c.evs.length ? c.evs[c.evs.length - 1]!.dt + 0.9 : 0.7;
      if (rel < tc) return c.evs.length ? (rel < 1.2 ? `${PLACE[k]}: ylempi on pienempi kuin ${c.bv}. Pitää vaihtaa!` : c.why) : `${PLACE[k]}: ${c.tv} − ${c.bv} onnistuu suoraan.`;
      return `${PLACE[k]}: ${c.tv} − ${c.bv} = ${c.d}.`;
    },
  });
}

/** Order of operations, written as a notebook: the part to calculate first lights up, becomes its
 *  value, and the shorter expression is written on the next line ("= …"). Expression tokens are
 *  separated by spaces, e.g. '20 − 2 × ( 3 + 1 )'. */
export function exprScene(expr: string): AnimPaint {
  const calc = (a: number, o: string, b: number) => (o === '+' ? a + b : o === '−' ? a - b : o === '×' ? a * b : a / b);
  const rows: string[][] = [expr.split(' ')];
  const steps: { l: number; r: number; val: number; why: string; sub: string }[] = [];
  for (let guard = 0; guard < 8; guard++) {
    const tk = rows[rows.length - 1]!;
    if (tk.length === 1) break;
    let lo = 0, hi = tk.length - 1, inPar = false;
    const close = tk.indexOf(')');
    if (close >= 0) { hi = close - 1; lo = tk.lastIndexOf('(', close) + 1; inPar = true; }
    let o = -1;
    for (let i = lo; i <= hi; i++) if (tk[i] === '×' || tk[i] === ':') { o = i; break; }
    const hasMul = o >= 0;
    if (o < 0) for (let i = lo; i <= hi; i++) if (tk[i] === '+' || tk[i] === '−') { o = i; break; }
    let l = o - 1, r = o + 1;
    const val = calc(Number(tk[l]), tk[o]!, Number(tk[r]));
    const sub = tk.slice(l, r + 1).join(' ');
    if (tk[l - 1] === '(' && tk[r + 1] === ')') { l--; r++; }
    const rest = tk.slice(lo, hi + 1).length > 3;
    const why = inPar ? `Sulut ensin: ${sub} = ${val}.` : hasMul ? (tk.some((x) => x === '+' || x === '−') ? `${tk[o] === '×' ? 'Kertolasku' : 'Jakolasku'} ennen yhteen- ja vähennyslaskua: ${sub} = ${val}.` : `${tk[o] === '×' ? 'Kertolasku' : 'Jakolasku'}: ${sub} = ${val}.`) : rest ? `Vasemmalta oikealle: ${sub} = ${val}.` : `Lopuksi: ${sub} = ${val}.`;
    steps.push({ l, r, val, why, sub });
    rows.push([...tk.slice(0, l), String(val), ...tk.slice(r + 1)]);
  }
  const W = 320, RY = 44, DY = 40, H = RY + (rows.length - 1) * DY + 26;
  const text = (tk: string[]) => { // character offsets of each token
    const pos: { s: number; n: number }[] = []; let c = 0;
    tk.forEach((x, i) => { if (i > 0 && x !== ')' && tk[i - 1] !== '(') c++; pos.push({ s: c, n: x.length }); c += x.length; });
    return { pos, len: c };
  };
  const CW = Math.min(15.6, (W - 24) / (text(rows[0]!).len + 2)), FS = Math.round(CW / 0.6);
  const X0 = (W - (text(rows[0]!).len + 2) * CW) / 2 + 2 * CW;
  const ST = 3.4, t0 = 1.0, fin = t0 + steps.length * ST;
  const row = (tk: string[], y: number, op: number, i: number, hl?: [number, number], blue?: number, fade = 1) => {
    const { pos } = text(tk);
    let s = i > 0 ? `<text x="${X0 - CW}" y="${y}" text-anchor="middle" font-size="${FS}" font-weight="800" font-family="ui-monospace, Menlo, monospace" fill="currentColor" opacity="${op}">=</text>` : '';
    tk.forEach((x, j) => {
      const inHl = hl && j >= hl[0] && j <= hl[1];
      const col = j === blue ? XC : 'currentColor';
      s += `<text x="${X0 + (pos[j]!.s + pos[j]!.n / 2) * CW}" y="${y}" text-anchor="middle" font-size="${FS}" font-weight="800" font-family="ui-monospace, Menlo, monospace" fill="${col}" opacity="${op * (inHl ? fade : 1)}">${x}</text>`;
    });
    return s;
  };
  return anim({
    dur: fin + 3, w: W, h: H, label: `Laskujärjestys: ${expr.replace(/\( /g, '(').replace(/ \)/g, ')')}`,
    frame: (t) => {
      let s = '';
      const k = Math.min(steps.length, Math.max(0, Math.floor((t - t0) / ST)));
      if (t >= t0 && t < fin) { // highlight behind the current row
        const st = steps[k]!, rel = t - (t0 + k * ST), { pos } = text(rows[k]!), y = RY + k * DY;
        const x1 = X0 + pos[st.l]!.s * CW - 4, x2 = X0 + (pos[st.r]!.s + pos[st.r]!.n) * CW + 4;
        s += `<rect x="${x1}" y="${y - FS + 2}" width="${x2 - x1}" height="${FS + 8}" rx="7" fill="color-mix(in srgb, var(--sun) 35%, transparent)" stroke="var(--sun)" stroke-width="2" opacity="${ease(rel, 0.2, 0.7)}"/>`;
      }
      rows.forEach((tk, i) => {
        if (i === 0) { s += row(tk, RY, 1, 0); return; }
        const p = ease(t - (t0 + (i - 1) * ST), 2.2, 3.0);
        if (p > 0) s += row(tk, RY + i * DY - DY * 0.6 * (1 - p), p, i, undefined, steps[i - 1]!.l);
      });
      if (t >= t0 && t < fin) { // the value of the highlighted part, under it
        const st = steps[k]!, rel = t - (t0 + k * ST), { pos } = text(rows[k]!), y = RY + k * DY;
        const x1 = X0 + pos[st.l]!.s * CW, x2 = X0 + (pos[st.r]!.s + pos[st.r]!.n) * CW, pV = ease(rel, 1.2, 1.8) * (1 - ease(rel, 2.0, 2.4));
        if (pV > 0) s += `<path d="M ${x1} ${y + 7} Q ${(x1 + x2) / 2} ${y + 17} ${x2} ${y + 7}" fill="none" stroke="${XC}" stroke-width="2.5" opacity="${pV}"/><rect x="${(x1 + x2) / 2 - 20}" y="${y + 14}" width="40" height="22" rx="11" fill="var(--card, #fff)" stroke="${XC}" stroke-width="2" opacity="${pV}"/><text x="${(x1 + x2) / 2}" y="${y + 31}" text-anchor="middle" font-size="16" font-weight="800" fill="${XC}" opacity="${pV}">${st.val}</text>`;
      }
      if (t >= fin) s += `<rect x="${X0 - 2 * CW}" y="${RY + steps.length * DY - FS}" width="${(text(rows[rows.length - 1]!).len + 2) * CW + 8}" height="${FS + 10}" rx="8" fill="none" stroke="var(--ok)" stroke-width="3" opacity="${ease(t, fin, fin + 0.4)}"/>`;
      return s;
    },
    caption: (t) => {
      if (t < t0) return `${expr.replace(/\( /g, '(').replace(/ \)/g, ')')}: mikä lasketaan ensin?`;
      if (t >= fin) return `Valmis: ${expr.replace(/\( /g, '(').replace(/ \)/g, ')')} = ${rows[rows.length - 1]![0]}. Sulut, sitten × ja :, lopuksi + ja −.`;
      const k = Math.floor((t - t0) / ST), st = steps[k]!;
      return (t - t0 - k * ST) < 1.2 ? st.why.split(':')[0] + ': ' + st.sub + '.' : st.why;
    },
  });
}

/** k × n in parts: a strip k high is cut into hundreds, tens and ones; each part is multiplied
 *  and labelled, then the parts are added. */
export function partsMulScene(k: number, n: number): AnimPaint {
  const parts = [100, 10, 1].map((p) => Math.floor(n / p) % 10 * p).filter((x) => x > 0);
  const W = 320, X0 = 34, WW = 268, Y0 = 50, HH = 70;
  // Widths: proportional, but every part at least 54 px.
  const raw = parts.map((p) => Math.max(p, n * 0.24)), tot = raw.reduce((a, b) => a + b, 0);
  const ws = raw.map((x) => (x / tot) * WW);
  const xs = ws.map((_, i) => X0 + ws.slice(0, i).reduce((a, b) => a + b, 0));
  const COL = ['#b79ad6', '#7fb8e0', '#e0b84a'];
  const t0 = 1.6, ST = 1.8, done = t0 + parts.length * ST, fin = done + 1.6, H = 210;
  return anim({
    dur: fin + 3, w: W, h: H, label: `${k} × ${n} osina`,
    frame: (t) => {
      let s = `<text x="${W / 2}" y="22" text-anchor="middle" font-size="20" font-weight="800" fill="currentColor">${k} × ${n}</text>`;
      const pCut = ease(t, 0.5, 1.4);
      parts.forEach((p, i) => {
        const gap = 6 * pCut * i, x = xs[i]! + gap - 6 * pCut * (parts.length - 1) / 2;
        const pF = ease(t, t0 + i * ST, t0 + i * ST + 0.7);
        s += `<rect x="${x}" y="${Y0}" width="${ws[i]!}" height="${HH}" rx="4" fill="${pF > 0 ? COL[3 - String(p).length] : 'var(--card)'}" fill-opacity="${0.25 + 0.6 * pF}" stroke="currentColor" stroke-width="1.5"/>`;
        s += `<text x="${x + ws[i]! / 2}" y="${Y0 - 8}" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor" opacity="${pCut}">${p}</text>`;
        if (pF > 0) s += `<text x="${x + ws[i]! / 2}" y="${Y0 + HH / 2 + 6}" text-anchor="middle" font-size="${ws[i]! < 70 ? 13 : 16}" font-weight="800" fill="currentColor" opacity="${pF}">${k} × ${p}</text><text x="${x + ws[i]! / 2}" y="${Y0 + HH + 24}" text-anchor="middle" font-size="18" font-weight="800" fill="${XC}" opacity="${ease(t, t0 + i * ST + 0.8, t0 + i * ST + 1.3)}">${k * p}</text>`;
      });
      s += `<text x="${X0 - 6}" y="${Y0 + HH / 2 + 5}" text-anchor="end" font-size="14" font-weight="700" fill="currentColor">${k}</text>`;
      if (t >= done) s += `<text x="${W / 2}" y="${Y0 + HH + 66}" text-anchor="middle" font-size="19" font-weight="800" fill="currentColor" opacity="${ease(t, done, done + 0.6)}">${parts.map((p) => k * p).join(' + ')} = <tspan fill="var(--ok)">${k * n}</tspan></text>`;
      return s;
    },
    caption: (t) => {
      if (t < t0) return `${n} = ${parts.join(' + ')}. Kerrotaan jokainen osa erikseen.`;
      if (t < done) { const i = Math.floor((t - t0) / ST), p = parts[i]!; const z = String(p).length - 1, d = p / 10 ** z; return `${k} × ${p} = ${k * p}${z ? ` — ${k} × ${d} = ${k * d}, ja ${z === 1 ? 'nolla' : 'kaksi nollaa'} perään` : ''}.`; }
      return `Osat yhteen: ${parts.map((p) => k * p).join(' + ')} = ${k * n}.`;
    },
  });
}

/** Column multiplication k × n: from the right, digit × k plus the carry; the ones digit drops
 *  into the answer and the tens fly up as the next carry. */
export function mulColumnScene(n: number, k: number): AnimPaint {
  const prod = n * k, L = String(n).length, LP = String(prod).length, W = 320, H = 222, CWD = 42, RX = 236;
  const cx = (i: number) => RX - i * CWD, dig = (x: number, i: number) => Math.floor(x / 10 ** i) % 10;
  const Y = { carry: 34, a: 76, b: 118, rule: 132, res: 172, bubble: 208 };
  const steps: { cin: number; p: number; d: number; cout: number }[] = [];
  let c = 0;
  for (let i = 0; i < L; i++) { const p = dig(n, i) * k + c; steps.push({ cin: c, p, d: p % 10, cout: Math.floor(p / 10) }); c = Math.floor(p / 10); }
  const ST = 3.6, t0 = 0.8, fin = t0 + L * ST + (c ? 1.2 : 0);
  const num = (x: number, y: number, v: string | number, col = 'currentColor', size = 32, op = 1) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="800" font-family="ui-monospace, Menlo, monospace" fill="${col}" opacity="${op}">${v}</text>`;
  return anim({
    dur: fin + 3, w: W, h: H, label: `${n} × ${k} allekkain`,
    frame: (t) => {
      let s = '';
      const i0 = Math.min(L - 1, Math.max(0, Math.floor((t - t0) / ST))), active = t >= t0 && t < t0 + L * ST;
      if (active) s += `<rect x="${cx(i0) - 19}" y="${Y.a - 26}" width="38" height="34" rx="8" fill="color-mix(in srgb, var(--sun) 30%, transparent)" stroke="var(--sun)" stroke-width="2"/><rect x="${cx(0) - 19}" y="${Y.b - 26}" width="38" height="34" rx="8" fill="none" stroke="var(--sun)" stroke-width="2"/>`;
      for (let i = 0; i < L; i++) s += num(cx(i), Y.a, dig(n, i));
      s += num(cx(0), Y.b, k) + num(cx(1), Y.b, '×') + `<line x1="${cx(LP - 1) - 24}" y1="${Y.rule}" x2="${RX + 22}" y2="${Y.rule}" stroke="currentColor" stroke-width="3"/>`;
      steps.forEach((st, i) => {
        const ti = t0 + i * ST;
        if (t < ti) return;
        const pB = ease(t, ti + 0.5, ti + 0.9), pD = ease(t, ti + 1.5, ti + 2.1), pC = ease(t, ti + 2.2, ti + 3.0);
        if (i === i0 && active && pB > 0) s += `<text x="${W / 2 - 30}" y="${Y.bubble}" text-anchor="middle" font-size="16" font-weight="800" fill="currentColor" opacity="${pB}">${k} × ${dig(n, i)}${st.cin ? ` + ${st.cin}` : ''} = <tspan fill="${st.cout ? CC : XC}">${st.p}</tspan></text>`;
        if (pD > 0) s += num(cx(i), Y.bubble - 20 + (Y.res - Y.bubble + 20) * pD, st.d, XC, 32, Math.min(1, pD * 2));
        if (st.cout && pC > 0) {
          const x0 = cx(i) + 14, y0 = Y.bubble - 20, x1 = cx(i + 1), y1 = Y.carry;
          const x = x0 + (x1 - x0) * pC, y = y0 + (y1 - y0) * pC - Math.sin(Math.PI * pC) * 30;
          if (i === L - 1 && t >= ti + 3.2) {
            const pN = ease(t, ti + 3.2, ti + 4.0);
            s += num(x1, Y.carry + (Y.res - Y.carry) * pN, st.cout, pN < 1 ? CC : XC, pN < 1 ? 20 + 12 * pN : 32);
          } else if (i < L - 1 && t > ti + ST + 1.0) s += num(x1, y1, st.cout, CC, 20, 0.45);
          else s += num(x, y, st.cout, CC, 20);
        }
      });
      if (t >= fin) s += `<rect x="${cx(LP - 1) - 22}" y="${Y.res - 30}" width="${RX - cx(LP - 1) + 44}" height="40" rx="8" fill="none" stroke="var(--ok)" stroke-width="3" opacity="${ease(t, fin, fin + 0.4)}"/>`;
      return s;
    },
    caption: (t) => {
      if (t < t0) return `${n} × ${k}: kerrotaan jokainen numero ${k}:lla, aloitetaan oikealta.`;
      if (t >= t0 + L * ST) return c ? `Viimeinen muistinumero ${c} kirjoitetaan vastaukseen: ${n} × ${k} = ${prod}.` : `Valmis: ${n} × ${k} = ${prod}.`;
      const i = Math.floor((t - t0) / ST), st = steps[i]!, ti = t0 + i * ST;
      if (t < ti + 0.5) return `${PLACE[i]}${st.cin ? ` — muista muistinumero ${st.cin}!` : '.'}`;
      if (t < ti + 1.5) return `${k} × ${dig(n, i)}${st.cin ? ` + ${st.cin}` : ''} = ${st.p}.`;
      if (!st.cout) return `Kirjoitetaan ${st.d}.`;
      return `${st.p}: kirjoitetaan ${st.d}, ${st.cout} muistiin seuraavaan sarakkeeseen.`;
    },
  });
}

/** n : k by place: hundreds, tens and ones blocks are dealt into k boxes one at a time. A
 *  leftover block turns red and is exchanged for ten blocks of the next place. */
export function dealDivScene(n: number, k: number): AnimPaint {
  const W = 320, H = 272, BW = Math.min(72, (W - 20) / k - 8), BY = 128, BH = 84;
  const d = [Math.floor(n / 100) % 10, Math.floor(n / 10) % 10, n % 10];
  // Per place: pile count, quotient, remainder.
  const pl: { c: number; q: number; r: number; from: number }[] = [];
  let carry = 0;
  for (let p = 0; p < 3; p++) { const c = d[p]! + 10 * carry; pl.push({ c, q: Math.floor(c / k), r: c % k, from: d[p]! }); carry = c % k; }
  const first = pl.findIndex((x) => x.c > 0);
  // Timeline.
  const GAP = 0.2, FLY = 0.45, EX = 1.6;
  const tl: { start: number; dealt: number; end: number; exStart: number }[] = [];
  let t = 1.0;
  for (let p = 0; p < 3; p++) {
    if (p < first) { tl.push({ start: t, dealt: t, end: t, exStart: t }); continue; }
    const dealt = t + 0.6 + pl[p]!.q * k * GAP + FLY;
    const exStart = dealt + 0.3, end = pl[p]!.r && p < 2 ? exStart + EX : dealt + 0.4;
    tl.push({ start: t, dealt, end, exStart });
    t = end + 0.4;
  }
  const fin = t;
  const COLS = ['#8fc58f', '#7fb8e0', '#e0b84a'];
  const piece = (p: number, x: number, y: number, col = COLS[p]!, op = 1) => p === 0
    ? `<rect x="${x}" y="${y}" width="14" height="14" fill="${col}" stroke="currentColor" stroke-width="0.8" opacity="${op}"/><path d="M ${x + 4.7} ${y} v14 M ${x + 9.3} ${y} v14 M ${x} ${y + 4.7} h14 M ${x} ${y + 9.3} h14" stroke="currentColor" stroke-width="0.4" opacity="${op * 0.6}"/>`
    : p === 1 ? `<rect x="${x}" y="${y}" width="4" height="16" fill="${col}" stroke="currentColor" stroke-width="0.6" opacity="${op}"/>`
      : `<rect x="${x}" y="${y}" width="5" height="5" fill="${col}" stroke="currentColor" stroke-width="0.6" opacity="${op}"/>`;
  // Pile layout: three groups side by side, sized for the most pieces each will hold.
  const SP = [18, 6, 8], WRAP = [6, 14, 10], RH = [18, 20, 8];
  const gw = pl.map((x, p) => Math.min(x.c, WRAP[p]!) * SP[p]! );
  const gx = [12, 0, 0]; gx[1] = gx[0]! + (pl[0]!.c ? Math.max(gw[0]!, 36) + 16 : 0); gx[2] = gx[1]! + (pl[1]!.c ? Math.max(gw[1]!, 44) + 16 : 0);
  const pileXY = (p: number, j: number): [number, number] => [gx[p]! + (j % WRAP[p]!) * SP[p]!, 34 + Math.floor(j / WRAP[p]!) * RH[p]!];
  const bx = (b: number) => (W - (k * (BW + 8) - 8)) / 2 + b * (BW + 8);
  const boxXY = (p: number, b: number, i: number): [number, number] => p === 0 ? [bx(b) + 4, BY + 4 + i * 17] : p === 1 ? [bx(b) + 24 + i * 5, BY + 6] : [bx(b) + 24 + (i % 5) * 8, BY + 34 + Math.floor(i / 5) * 8];
  const NAME = ['sata', 'kymppi', 'ykkönen'], NAMES = ['sataa', 'kymppiä', 'ykköstä'], INTO = ['sadaksi', 'kympiksi', 'ykköseksi'], ALL = ['Sadat', 'Kympit', 'Ykköset'];
  return anim({
    dur: fin + 3, w: W, h: H, label: `${n} : ${k} paikka kerrallaan`,
    frame: (tt) => {
      let s = '';
      for (let b = 0; b < k; b++) s += `<rect x="${bx(b)}" y="${BY}" width="${BW}" height="${BH}" rx="8" fill="color-mix(in srgb, var(--pond) 18%, transparent)" stroke="currentColor" stroke-width="1.5"/>`;
      ['sadat', 'kympit', 'ykköset'].forEach((L, p) => { if (pl[p]!.c) s += `<text x="${gx[p]}" y="24" font-size="11" font-weight="700" fill="currentColor" opacity="0.6">${L}</text>`; });
      for (let p = 0; p < 3; p++) {
        if (p < first) continue;
        const T = tl[p]!, P = pl[p]!;
        // Pieces arriving from the exchange of the previous place.
        const exT = p > 0 ? tl[p - 1]!.exStart : 0;
        for (let j = 0; j < P.c; j++) {
          const isEx = j >= P.from;
          const appear = isEx ? ease(tt, exT + 0.7 + (j - P.from) * 0.04, exT + 1.0 + (j - P.from) * 0.04) : 1;
          if (appear <= 0) continue;
          const [px, py] = pileXY(p, j);
          if (j < P.q * k) {
            const ts = T.start + 0.6 + j * GAP, f = ease(tt, ts, ts + FLY);
            const [qx, qy] = boxXY(p, j % k, Math.floor(j / k));
            const x = px + (qx - px) * f, y = py + (qy - py) * f - Math.sin(Math.PI * f) * 24;
            s += piece(p, x, y, COLS[p], appear);
          } else {
            // Leftover: red, then (if not ones) fades as it is exchanged.
            const red = tt >= T.dealt ? 1 : 0, gone = p < 2 ? ease(tt, T.exStart + 0.5, T.exStart + 0.9) : 0;
            if (gone < 1) s += piece(p, px, py, red ? 'var(--red)' : COLS[p], appear * (1 - gone));
          }
        }
      }
      // Box totals.
      for (let b = 0; b < k; b++) {
        let v = 0;
        for (let p = 0; p < 3; p++) if (p >= first) for (let j = b; j < pl[p]!.q * k; j += k) if (tt >= tl[p]!.start + 0.6 + j * GAP + FLY) v += [100, 10, 1][p]!;
        if (v) s += `<text x="${bx(b) + BW / 2}" y="${BY + BH + 20}" text-anchor="middle" font-size="16" font-weight="800" fill="${tt >= fin ? 'var(--ok)' : XC}">${v}</text>`;
      }
      if (tt >= fin) s += `<text x="${W / 2}" y="${H - 6}" text-anchor="middle" font-size="18" font-weight="800" fill="currentColor" opacity="${ease(tt, fin, fin + 0.5)}">${n} : ${k} = ${Math.floor(n / k)}${n % k ? `, jää ${n % k}` : ''}</text>`;
      return s;
    },
    caption: (tt) => {
      if (tt < 1.0) return `${n} : ${k}. Jaetaan ${k} laatikkoon: ensin sadat, sitten kympit, sitten ykköset.`;
      if (tt >= fin) return `Jokainen laatikko sai ${Math.floor(n / k)}. Tarkistus: ${k} × ${Math.floor(n / k)} = ${k * Math.floor(n / k)}.`;
      let p = 0; for (let i = first; i < 3; i++) if (tt >= tl[i]!.start) p = i;
      const P = pl[p]!, T = tl[p]!;
      if (tt < T.dealt) return P.q ? `${P.c} ${P.c === 1 ? NAME[p] : NAMES[p]}: jokainen laatikko saa ${P.q}.` : `${P.c} ${P.c === 1 ? NAME[p] : NAMES[p]}: ei riitä jokaiselle ${k} laatikolle.`;
      if (P.r && p < 2) return tt < T.exStart + 0.6 ? `${P.r} ${P.r === 1 ? NAME[p] : NAMES[p]} jää yli. ${P.r === 1 ? 'Sitä' : 'Niitä'} ei voi jakaa tasan…` : `…joten ${P.r === 1 ? 'se vaihdetaan' : 'ne vaihdetaan'} ${P.r * 10} ${INTO[p + 1]}.`;
      return P.r ? `${P.r} jää yli: se on jakojäännös.` : `${ALL[p]} jaettu tasan.`;
    },
  });
}
