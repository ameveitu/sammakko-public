// Animated money scenes for place value: ten notes are swapped for one of the next size, and a
// sum is sorted into the till's compartments so each place gets its digit (an empty one gets 0).
import { anim, ease, type AnimPaint } from '../ui/anim';

const COL: Record<number, string> = { 1: '#e0b84a', 10: '#7fb8e0', 100: '#8fc58f', 1000: '#b79ad6' };
/** A note (or a coin for 1) centred at x, y. */
export function money(v: number, x: number, y: number, op = 1) {
  if (v === 1) return `<g opacity="${op}"><circle cx="${x}" cy="${y}" r="9" fill="${COL[1]}" stroke="currentColor" stroke-width="1.2"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="10" font-weight="900" fill="#222">1</text></g>`;
  return `<g opacity="${op}"><rect x="${x - 25}" y="${y - 8}" width="50" height="16" rx="3" fill="${COL[v] ?? '#ccc'}" stroke="currentColor" stroke-width="1.2"/><text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="11" font-weight="900" fill="#222">${v}</text></g>`;
}

/** Ten notes of `unit` arrive one by one (running total), then slide together and turn into one
 *  note of ten times the value. Several stages run in a row. */
export function exchangeScene(units: number[]): AnimPaint {
  const W = 320, H = 150, ST = 0.45, MERGE = 1.4, STAGE = 0.5 + 10 * ST + MERGE + 1.6;
  const dur = 0.6 + units.length * STAGE + 0.4;
  const pos = (i: number) => ({ x: 40 + (i % 5) * 60, y: 34 + Math.floor(i / 5) * 30 });
  return anim({
    dur, w: W, h: H, label: 'Kymmenen seteliä vaihdetaan yhteen isompaan',
    frame: (t) => {
      const k = Math.min(units.length - 1, Math.max(0, Math.floor((t - 0.6) / STAGE))), u = units[k]!, t0 = 0.6 + k * STAGE;
      const n = Math.max(0, Math.min(10, Math.floor((t - t0 - 0.5) / ST) + 1)), tm = t0 + 0.5 + 10 * ST, m = ease(t, tm, tm + MERGE * 0.6);
      let s = '';
      if (m < 1) for (let i = 0; i < n; i++) {
        const p = pos(i), a = ease(t, t0 + 0.5 + i * ST, t0 + 0.5 + i * ST + 0.25);
        s += money(u, p.x + (W / 2 - p.x) * m, p.y - (1 - a) * 12 + (60 - p.y) * m, a);
        if (m === 0) s += `<text x="${p.x}" y="${p.y + 22}" text-anchor="middle" font-size="10" font-weight="800" fill="currentColor" opacity="${a * 0.7}">${(i + 1) * u}</text>`;
      }
      const big = ease(t, tm + MERGE * 0.55, tm + MERGE);
      if (big > 0) s += `<g transform="translate(${W / 2} 60) scale(${1 + big * 0.6}) translate(${-W / 2} -60)">${money(u * 10, W / 2, 60, big)}</g>`;
      if (big > 0) s += `<text x="${W / 2}" y="${126}" text-anchor="middle" font-size="18" font-weight="900" fill="currentColor" opacity="${big}">10 × ${u} = ${u * 10}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < 0.6) return `Kerätään ${units[0]} euron seteleitä.`;
      const k = Math.min(units.length - 1, Math.floor((t - 0.6) / STAGE)), u = units[k]!, t0 = 0.6 + k * STAGE, tm = t0 + 0.5 + 10 * ST;
      const n = Math.max(0, Math.min(10, Math.floor((t - t0 - 0.5) / ST) + 1));
      if (t < tm) return n ? `${Array.from({ length: n }, (_, i) => (i + 1) * u).join(', ')}…` : `Nyt ${u} euron seteleitä.`;
      return `Kymmenen ${u}:n seteliä vaihdetaan yhteen ${u * 10}:n seteliin.`;
    },
  });
}

/** The amount n (< 10000) arrives in the till: thousands first, then hundreds, tens and ones, each
 *  piece counted into its own compartment; the digit appears under each one, and an empty
 *  compartment gets a highlighted 0. */
export function tillScene(n: number): AnimPaint {
  const W = 320, H = 236, CW = 80, ST = 0.38, PAUSE = 0.7;
  const vals = [1000, 100, 10, 1], names = ['tuhannet', 'sadat', 'kymmenet', 'ykköset'];
  const ds = vals.map((v) => Math.floor(n / v) % 10);
  const starts: number[] = []; let tt = 0.6;
  ds.forEach((d) => { starts.push(tt); tt += Math.max(1, d) * ST + PAUSE; });
  const fin = tt, dur = fin + 3;
  return anim({
    dur, w: W, h: H, label: `Kassa: ${n}`,
    frame: (t) => {
      let s = '';
      vals.forEach((v, c) => {
        const cx = c * CW + CW / 2;
        s += `<rect x="${c * CW + 4}" y="22" width="${CW - 8}" height="164" rx="8" fill="color-mix(in srgb, ${COL[v]} 18%, var(--card))" stroke="var(--line)"/><text x="${cx}" y="15" text-anchor="middle" font-size="11" font-weight="800" fill="currentColor">${names[c]}</text>`;
        const shown = Math.max(0, Math.min(ds[c]!, Math.floor((t - starts[c]!) / ST) + 1));
        for (let i = 0; i < shown; i++) {
          const a = ease(t, starts[c]! + i * ST, starts[c]! + i * ST + 0.25);
          s += money(v, cx, 176 - i * 17 - (1 - a) * 20, a);
        }
        const dEnd = starts[c]! + Math.max(1, ds[c]!) * ST + 0.1, p = ease(t, dEnd, dEnd + 0.4);
        if (p > 0) {
          const zero = ds[c] === 0;
          if (zero) s += `<text x="${cx}" y="110" text-anchor="middle" font-size="11" font-weight="800" fill="var(--red)" opacity="${p}">tyhjä</text>`;
          s += `<text x="${cx}" y="222" text-anchor="middle" font-size="34" font-weight="900" fill="${zero ? 'var(--red)' : 'currentColor'}" opacity="${p}">${ds[c]}</text>`;
          if (zero) s += `<circle cx="${cx}" cy="210" r="${20 + 3 * Math.sin(t * 5)}" fill="none" stroke="var(--red)" stroke-width="2.5" opacity="${p}"/>`;
        }
      });
      return s;
    },
    caption: (t) => {
      if (t < starts[0]!) return `Kassaan tulee ${n} euroa.`;
      if (t >= fin) return ds.includes(0) ? `${n}: tyhjä lokero merkitään nollalla, muuten numerot liukuisivat väärille paikoille.` : `Numerot lokeroista: ${n}.`;
      const c = starts.filter((s0) => t >= s0).length - 1, v = vals[c]!, d = ds[c]!;
      const k = Math.max(0, Math.min(d, Math.floor((t - starts[c]!) / ST) + 1));
      return d ? `${names[c]![0]!.toUpperCase() + names[c]!.slice(1)}: ${Array.from({ length: k }, (_, i) => (i + 1) * v).join(', ')}` : `${names[c]![0]!.toUpperCase() + names[c]!.slice(1)}: ei yhtään → 0.`;
    },
  });
}

/** The digits of n fly down one at a time into their place and grow their zeros (3 → 3000);
 *  a 0 digit fades out (nothing to add), then the expanded sum is written. */
export function expandScene(n: number): AnimPaint {
  const W = 320, H = 170, ds = String(n).split('').map(Number), L = ds.length, DT = 1.7, t0 = 0.8, fin = t0 + L * DT;
  const top = (i: number) => W / 2 + (i - (L - 1) / 2) * 34, slot = (i: number) => 40 + i * (240 / Math.max(1, L - 1));
  const parts = ds.map((d, i) => d * 10 ** (L - 1 - i)).filter(Boolean);
  return anim({
    dur: fin + 3, w: W, h: H, label: `${n} puretaan osiin`,
    frame: (t) => {
      let s = '';
      ds.forEach((d, i) => {
        const a = t0 + i * DT, p = ease(t, a, a + 0.6), z = L - 1 - i;
        s += `<text x="${top(i)}" y="44" text-anchor="middle" font-size="40" font-weight="900" fill="currentColor" opacity="${t >= a && t < a + DT ? 1 : 0.55}">${d}</text>`;
        if (t >= a && t < a + DT) s += `<rect x="${top(i) - 17}" y="10" width="34" height="44" rx="6" fill="none" stroke="var(--sun)" stroke-width="3"/>`;
        if (p <= 0) return;
        const zs = d ? Math.max(0, Math.min(z, Math.floor((t - a - 0.6) / 0.22) + 1)) : 0;
        const x = top(i) + (slot(i) - top(i)) * p, y = 44 + 56 * p;
        const txt = d ? String(d) + '0'.repeat(zs) : '0';
        s += `<text x="${x}" y="${y}" text-anchor="middle" font-size="20" font-weight="900" fill="${d ? 'var(--blue)' : 'var(--red)'}" opacity="${d ? 1 : 1 - 0.7 * ease(t, a + 0.8, a + 1.4)}">${txt}</text>`;
        if (!d && t > a + 0.8) s += `<text x="${slot(i)}" y="${y + 20}" text-anchor="middle" font-size="10" font-weight="800" fill="var(--red)" opacity="${ease(t, a + 0.8, a + 1.2)}">ei mitään</text>`;
        if (i > 0 && t > a + 0.6) s += `<text x="${(slot(i) + slot(i - 1)) / 2}" y="100" text-anchor="middle" font-size="20" font-weight="900" fill="currentColor" opacity="${ds[i] && ds.slice(0, i).some(Boolean) ? 1 : 0.25}">+</text>`;
      });
      const f = ease(t, fin, fin + 0.6);
      if (f > 0) s += `<text x="${W / 2}" y="156" text-anchor="middle" font-size="20" font-weight="900" fill="currentColor" opacity="${f}">${n} = ${parts.join(' + ')}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < t0) return `Puretaan luku ${n} numero kerrallaan.`;
      if (t >= fin) return `${n} = ${parts.join(' + ')}.`;
      const i = Math.min(L - 1, Math.floor((t - t0) / DT)), d = ds[i]!, z = L - 1 - i, v = d * 10 ** z;
      const place = ['ykkösten', 'kymppien', 'satojen', 'tuhansien'][z];
      return d ? `${d} on ${place} paikalla: ${d}${z ? ' ja ' + z + ' nolla' + (z > 1 ? 'a' : '') : ''} → ${v}.` : `${place![0]!.toUpperCase() + place!.slice(1)} paikalla on 0: siitä ei tule mitään lisättävää, mutta luvussa nolla pitää paikkaa.`;
    },
  });
}

/** h hundred-notes and t ten-notes; each hundred is broken into ten tens, while the tens are
 *  counted (10, 20, …). Ends with "n = (10h + t) kymppiä". */
export function breakScene(h: number, tn: number): AnimPaint {
  const W = 320, H = 190, BT = 2.0, t0 = 0.8, total = h * 10 + tn, fin = t0 + h * BT + 0.6;
  const tenPos = (k: number) => ({ x: 30 + (k % 6) * 52, y: 60 + Math.floor(k / 6) * 19 });
  return anim({
    dur: fin + 3, w: W, h: H, label: `${h * 100 + tn * 10}: satasia vaihdetaan kympeiksi`,
    frame: (t) => {
      let s = '';
      // Remaining hundreds on the top row.
      for (let b = 0; b < h; b++) {
        const a = t0 + b * BT, p = ease(t, a, a + 0.5);
        if (p < 1) s += money(100, 40 + b * 56, 22, 1 - p);
      }
      // Tens: first those from broken hundreds, then the loose ones.
      const brokenTens = Math.min(h * 10, Math.max(0, Math.floor((t - t0) / BT * 10 + 1e-9)));
      for (let k = 0; k < brokenTens; k++) {
        const b = Math.floor(k / 10), a = t0 + b * BT + (k % 10) * 0.12, p = ease(t, a, a + 0.5), q = tenPos(k);
        s += money(10, 40 + b * 56 + (q.x - 40 - b * 56) * p, 22 + (q.y - 22) * p, Math.min(1, 0.3 + p));
      }
      for (let j = 0; j < tn; j++) { const q = tenPos(h * 10 + j); s += money(10, q.x, q.y); }
      const f = ease(t, fin, fin + 0.6);
      if (f > 0) s += `<text x="${W / 2}" y="${H - 8}" text-anchor="middle" font-size="18" font-weight="900" fill="currentColor" opacity="${f}">${h * 100 + tn * 10} = ${total} kymppiä = ${total} × 10</text>`;
      return s;
    },
    caption: (t) => {
      if (t < t0) return `${h} sataa ja ${tn} kymppiä. Montako kymppiä yhteensä?`;
      if (t >= fin) return `Kymppejä on ${total}: ${h * 10} satasista ja ${tn} irrallista.`;
      const b = Math.min(h, Math.floor((t - t0) / BT) + 1);
      return `Satanen ${b} vaihdetaan kymmeneen kymppiin: kymppejä ${tn + b * 10}.`;
    },
  });
}
