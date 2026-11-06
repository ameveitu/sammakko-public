// Unit stairs as motion: a frog hops from one prefix step to the next; each hop down multiplies
// the number by ten, each hop up divides it, and the running equation grows underneath.
import { anim, ease, type AnimPaint } from '../ui/anim';
import { frog } from '../ui/art';

const STAIR = ['k', 'h', 'da', '', 'd', 'c', 'm'];
const fi = (v: number) => String(+v.toPrecision(12)).replace('.', ',');

export function stairsScene(base: 'm' | 'g' | 'l', from: string, to: string, v = 1): AnimPaint {
  const W = 320, SW = 40, SH = 26, TOP = 34, H = TOP + STAIR.length * SH + 70;
  const iFrom = STAIR.indexOf(from.slice(0, -base.length)), iTo = STAIR.indexOf(to.slice(0, -base.length));
  const dir = iTo > iFrom ? 1 : -1, n = Math.abs(iTo - iFrom);
  const used = (p: string) => (base === 'g' ? ['k', '', 'm'].includes(p) : base === 'l' ? ['', 'd', 'c', 'm'].includes(p) : ['k', '', 'd', 'c', 'm'].includes(p));
  const T0 = 1.0, HT = 1.1, fin = T0 + n * HT + 0.3;
  const val = (k: number) => v * 10 ** (dir * k);
  const sx = (i: number) => 6 + i * SW, sy = (i: number) => TOP + i * SH;
  const fx = (i: number) => sx(i) + SW + 14, fy = (i: number) => sy(i) + SH / 2 - 2;
  const res = val(n);
  return anim({
    dur: fin + 3, w: W, h: H, label: `${fi(v)} ${from} = ${fi(res)} ${to}`,
    frame: (t) => {
      let s = '';
      const k = Math.min(n, Math.max(0, Math.floor((t - T0) / HT))), part = t < T0 ? 0 : Math.min(1, ((t - T0) % HT) / (HT * 0.7));
      const done = t >= T0 + n * HT ? n : k;
      STAIR.forEach((p, i) => {
        const u = p + base, on = i === iFrom ? 'var(--sun)' : i === iTo ? 'color-mix(in srgb, var(--ok) 35%, var(--card))' : 'var(--card)';
        s += `<rect x="${sx(i)}" y="${sy(i)}" width="${W - sx(i) - 6}" height="${SH}" fill="${on}" stroke="currentColor" stroke-width="1.4"/>`;
        s += `<text x="${sx(i) + SW / 2}" y="${sy(i) + 18}" text-anchor="middle" font-size="${used(p) ? 14 : 11}" font-weight="800" fill="currentColor" opacity="${used(p) ? 1 : 0.45}">${u}</text>`;
      });
      // Hop arrows with ×10 / :10 labels for the hops already made.
      for (let j = 0; j < Math.min(n, done + (t >= T0 ? 1 : 0)); j++) {
        const a = j < done ? 1 : ease(part, 0, 0.6);
        const i0 = iFrom + dir * j, i1 = i0 + dir;
        const ax = W - 34;
        s += `<path d="M${ax} ${sy(i0) + SH / 2} C${ax + 22} ${sy(i0) + SH / 2} ${ax + 22} ${sy(i1) + SH / 2} ${ax} ${sy(i1) + SH / 2}" fill="none" stroke="var(--red)" stroke-width="2" opacity="${a}"/>`;
        s += `<text x="${ax - 4}" y="${(sy(i0) + sy(i1)) / 2 + SH / 2 + 4}" text-anchor="end" font-size="11" font-weight="800" fill="var(--red)" opacity="${a}">${dir > 0 ? '×10' : ':10'}</text>`;
      }
      // Frog.
      const pos = t < T0 ? 0 : Math.min(n, k + ease(part, 0, 1));
      const i0 = iFrom + dir * Math.floor(pos), fr = pos - Math.floor(pos);
      const x = fx(i0) + dir * SW * fr, y = fy(i0) + dir * SH * fr - Math.sin(fr * Math.PI) * 14;
      s += frog(x, y, 8);
      // Value tag next to the frog.
      const shown = val(Math.round(pos));
      // Big readout in the empty corner under the stairs.
      s += `<rect x="10" y="${sy(4) + 4}" width="140" height="44" rx="10" fill="#fffbe6" stroke="#8a6d00" stroke-width="1.5"/>`;
      s += `<text x="80" y="${sy(4) + 34}" text-anchor="middle" font-size="22" font-weight="800" fill="#1b2a22">${fi(shown)} ${STAIR[iFrom + dir * Math.round(pos)]}${base}</text>`;
      // Running equation.
      const chain = [`${fi(v)} ${from}`];
      for (let j = 1; j <= done; j++) { const p = STAIR[iFrom + dir * j]!; if (used(p) || j === n) chain.push(`${fi(val(j))} ${p}${base}`); }
      s += `<text x="${W / 2}" y="${H - 40}" text-anchor="middle" font-size="14" font-weight="700" fill="currentColor">${chain.join(' = ')}</text>`;
      if (t >= fin) s += `<text x="${W / 2}" y="${H - 12}" text-anchor="middle" font-size="19" font-weight="800" fill="var(--ok)" opacity="${ease(t, fin, fin + 0.4)}">${fi(v)} ${from} = ${fi(res)} ${to}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < T0) return `Muunnetaan ${fi(v)} ${from} → ${to}. ${dir > 0 ? 'Alaspäin' : 'Ylöspäin'} on ${n} ${n === 1 ? 'porras' : 'porrasta'}.`;
      if (t < fin) { const j = Math.min(n, Math.floor((t - T0) / HT) + 1); return `${j}. porras ${dir > 0 ? 'alas: kerro kymmenellä' : 'ylös: jaa kymmenellä'} → ${fi(val(j))}.`; }
      return `${n} ${n === 1 ? 'porras' : 'porrasta'} ${dir > 0 ? `alas, eli kerro luvulla ${10 ** n}` : `ylös, eli jaa luvulla ${10 ** n}`}. ${fi(v)} ${from} = ${fi(res)} ${to}.`;
    },
  });
}

/** A sack of `kg` kilograms is first renamed in grams, then poured into bags of `bag` grams one by one. */
export function packScene(kg: number, bag: number): AnimPaint {
  const W = 320, H = 300, g = kg * 1000, n = Math.round(g / bag), cols = 5, BW = 30, BH = 40;
  const T0 = 2.2, PT = Math.min(0.6, 8 / n), fin = T0 + n * PT + 0.3;
  const bx = (i: number) => 138 + (i % cols) * (BW + 6), by = (i: number) => 24 + Math.floor(i / cols) * (BH + 16);
  return anim({
    dur: fin + 2, w: W, h: H, label: `${fi(kg)} kg jaetaan ${bag} g:n pusseihin`,
    frame: (t) => {
      const filled = Math.max(0, Math.min(n, (t - T0) / PT));
      const left = g - filled * bag, sw = ease(t, 0.8, 1.6);
      let s = '';
      // Sack: level drops as bags fill.
      const lv = left / g;
      s += `<path d="M22 70 Q20 50 40 46 L92 46 Q112 50 110 70 L114 200 Q114 214 100 214 L32 214 Q18 214 18 200 Z" fill="#f2e6cc" stroke="#8a6d00" stroke-width="2"/>`;
      s += `<rect x="24" y="${214 - 162 * lv}" width="84" height="${162 * lv}" fill="#e3c98c" opacity="0.8"/>`;
      s += `<text x="66" y="${120}" text-anchor="middle" font-size="16" font-weight="800" fill="#1b2a22" opacity="${1 - sw}">${fi(kg)} kg</text>`;
      s += `<text x="66" y="${120}" text-anchor="middle" font-size="16" font-weight="800" fill="#1b2a22" opacity="${sw}">${g - Math.floor(filled + 1e-6) * bag} g</text>`;
      s += `<text x="66" y="236" text-anchor="middle" font-size="12" fill="currentColor" opacity="${sw}">1 kg = 1000 g</text>`;
      for (let i = 0; i < n; i++) {
        const f = Math.max(0, Math.min(1, filled - i)), x = bx(i), y = by(i);
        s += `<rect x="${x}" y="${y}" width="${BW}" height="${BH}" rx="4" fill="none" stroke="currentColor" stroke-opacity="0.5"/>`;
        if (f > 0) s += `<rect x="${x + 1}" y="${y + BH - (BH - 2) * f}" width="${BW - 2}" height="${(BH - 2) * f}" rx="3" fill="#e3c98c"/>`;
        if (f >= 1) s += `<text x="${x + BW / 2}" y="${y + BH + 12}" text-anchor="middle" font-size="10" fill="currentColor">${bag} g</text>`;
        if (f > 0 && f < 1) s += `<path d="M110 60 Q${x - 10} ${y - 20} ${x + BW / 2} ${y + 4}" fill="none" stroke="#c9a85a" stroke-width="3" stroke-dasharray="4 3"/>`;
      }
      const k = Math.floor(filled + 1e-6);
      s += `<text x="${W / 2}" y="${H - 34}" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">${t < T0 ? `${fi(kg)} kg = ${g} g` : `${k} pussia × ${bag} g = ${k * bag} g`}</text>`;
      if (t >= fin) s += `<text x="${W / 2}" y="${H - 10}" text-anchor="middle" font-size="18" font-weight="800" fill="var(--ok)" opacity="${ease(t, fin, fin + 0.4)}">${g} g : ${bag} g = ${n} pussia</text>`;
      return s;
    },
    caption: (t) => {
      if (t < 0.8) return `Säkissä on ${fi(kg)} kg, pussiin mahtuu ${bag} g. Yksiköt eivät ole samat.`;
      if (t < T0) return `Muunnetaan ensin: ${fi(kg)} kg = ${g} g.`;
      if (t < fin) return `Täytetään pusseja: ${Math.min(n, Math.floor((t - T0) / PT) + 1)}. pussi, säkissä jäljellä ${Math.max(0, g - Math.min(n, Math.floor((t - T0) / PT) + 1) * bag)} g.`;
      return `${g} g : ${bag} g = ${n}. Pusseja tulee ${n}.`;
    },
  });
}

/** A jug of `l` litres gets a decilitre scale (1 l = 10 dl) and is poured into glasses of `g` dl. */
export function pourScene(l: number, g: number): AnimPaint {
  const W = 320, H = 300, dl = Math.round(l * 10), n = Math.floor(dl / g), rest = Math.round((dl - n * g) * 10) / 10;
  const JX = 26, JY = 40, JW = 84, JH = 180, full = Math.max(dl, 10);
  const T0 = 2.4, PT = 0.9, fin = T0 + n * PT + 0.3;
  const gx = (i: number) => 140 + (i % 4) * 44, gy = (i: number) => 60 + Math.floor(i / 4) * 92, GW = 30, GH = 56;
  const lvl = (d: number) => JY + JH - (JH * d) / full;
  return anim({
    dur: fin + 2.2, w: W, h: H, label: `${fi(l)} l mehua kaadetaan ${g} dl:n laseihin`,
    frame: (t) => {
      const poured = Math.max(0, Math.min(n, (t - T0) / PT)), left = dl - poured * g, sc = ease(t, 0.9, 1.9);
      let s = '';
      s += `<rect x="${JX}" y="${lvl(left)}" width="${JW}" height="${JY + JH - lvl(left)}" fill="#f0a030" opacity="0.85"/>`;
      s += `<path d="M${JX} ${JY - 8} L${JX} ${JY + JH} L${JX + JW} ${JY + JH} L${JX + JW} ${JY - 8} M${JX + JW} ${JY + 20} Q${JX + JW + 26} ${JY + 40} ${JX + JW} ${JY + 90}" fill="none" stroke="currentColor" stroke-width="2.5"/>`;
      for (let d = 1; d <= dl; d++) {
        const y = lvl(d), big = d % 10 === 0;
        s += `<line x1="${JX}" x2="${JX + (big ? 26 : 12) * sc}" y1="${y}" y2="${y}" stroke="currentColor" stroke-width="${big ? 2 : 1}" opacity="${big ? 1 : sc}"/>`;
        if (big) s += `<text x="${JX - 4}" y="${y + 4}" text-anchor="end" font-size="11" fill="currentColor">${d / 10} l</text>`;
      }
      s += `<text x="${JX + JW / 2}" y="${JY + JH + 22}" text-anchor="middle" font-size="15" font-weight="800" fill="currentColor">${t < 1.4 ? `${fi(l)} l` : `${fi(Math.round((dl - Math.floor(poured + 1e-6) * g) * 10) / 10)} dl`}</text>`;
      if (t > 0.9) s += `<text x="${JX + JW / 2}" y="${JY - 16}" text-anchor="middle" font-size="12" fill="currentColor" opacity="${sc}">1 l = 10 dl</text>`;
      for (let i = 0; i < n; i++) {
        const f = Math.max(0, Math.min(1, poured - i)), x = gx(i), y = gy(i);
        if (f > 0) s += `<rect x="${x + 2}" y="${y + GH - (GH - 4) * f}" width="${GW - 4}" height="${(GH - 4) * f}" fill="#f0a030" opacity="0.85"/>`;
        s += `<path d="M${x} ${y} L${x + 3} ${y + GH} L${x + GW - 3} ${y + GH} L${x + GW} ${y}" fill="none" stroke="currentColor" stroke-width="1.8"/>`;
        if (f >= 1) s += `<text x="${x + GW / 2}" y="${y + GH + 14}" text-anchor="middle" font-size="10" fill="currentColor">${g} dl</text>`;
        if (f > 0 && f < 1) s += `<path d="M${JX + JW + 4} ${JY - 4} Q${x - 6} ${y - 40} ${x + GW / 2} ${y + 6}" fill="none" stroke="#f0a030" stroke-width="4"/>`;
      }
      const k = Math.floor(poured + 1e-6);
      s += `<text x="${W / 2}" y="${H - 34}" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">${t < T0 ? `${fi(l)} l = ${dl} dl` : `${k} lasia × ${g} dl = ${k * g} dl`}</text>`;
      if (t >= fin) s += `<text x="${W / 2}" y="${H - 10}" text-anchor="middle" font-size="18" font-weight="800" fill="var(--ok)" opacity="${ease(t, fin, fin + 0.4)}">${dl} dl : ${g} dl = ${n}${rest ? `, jää ${fi(rest)} dl` : ' lasia'}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < 0.9) return `Kannussa on ${fi(l)} l. Lasiin mahtuu ${g} dl. Eri yksiköt!`;
      if (t < T0) return `Kannun kylkeen desilitra-asteikko: jokainen litra on 10 dl, joten ${fi(l)} l = ${dl} dl.`;
      if (t < fin) { const k = Math.min(n, Math.floor((t - T0) / PT) + 1); return `Kaadetaan ${k}. lasi: kannusta lähtee ${g} dl.`; }
      return `${dl} dl : ${g} dl = ${n}. Täysiä laseja tulee ${n}${rest ? `, ja kannuun jää ${fi(rest)} dl` : ''}.`;
    },
  });
}

const hhmm = (h: number, m: number) => `${h}.${String(m).padStart(2, '0')}`;

/** An analog clock runs from h.m forward d minutes; the elapsed sector grows and the hour flips at 60. */
export function clockScene(h: number, m: number, d: number): AnimPaint {
  const W = 320, H = 300, CX = 100, CY = 130, R = 82, T0 = 1.6, SP = 0.14, run = d * SP, fin = T0 + run + 0.3;
  const tot = m + d, eh = h + Math.floor(tot / 60), em = tot % 60, cross = 60 - m;
  const pt = (deg: number, r: number) => [CX + r * Math.sin((deg * Math.PI) / 180), CY - r * Math.cos((deg * Math.PI) / 180)];
  return anim({
    dur: fin + 3, w: W, h: H, label: `Kello ${hhmm(h, m)} + ${d} min`,
    frame: (t) => {
      const el = Math.max(0, Math.min(d, (t - T0) / SP)), cm = m + el, ch = h + Math.floor(cm / 60), mm = Math.floor(cm % 60);
      let s = `<circle cx="${CX}" cy="${CY}" r="${R}" fill="#fffbe6" stroke="#1b2a22" stroke-width="3"/>`;
      // Elapsed sector.
      if (el > 0) {
        const a0 = m * 6, a1 = cm * 6, [x0, y0] = pt(a0, R - 6), [x1, y1] = pt(a1, R - 6);
        if (el >= 60) s += `<circle cx="${CX}" cy="${CY}" r="${R - 6}" fill="#9fd8a8" opacity="0.7"/>`;
        else s += `<path d="M${CX} ${CY} L${x0} ${y0} A${R - 6} ${R - 6} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1} Z" fill="#9fd8a8" opacity="0.7"/>`;
      }
      for (let i = 0; i < 60; i++) { const [a, b] = pt(i * 6, R - (i % 5 ? 4 : 10)), [c, e] = pt(i * 6, R - 1); s += `<line x1="${a}" y1="${b}" x2="${c}" y2="${e}" stroke="#1b2a22" stroke-width="${i % 5 ? 1 : 2.5}"/>`; }
      for (let i = 1; i <= 12; i++) { const [a, b] = pt(i * 30, R - 22); s += `<text x="${a}" y="${b + 5}" text-anchor="middle" font-size="13" font-weight="700" fill="#1b2a22">${i}</text>`; }
      const [hx, hy] = pt(((ch % 12) + (cm % 60) / 60) * 30, R * 0.5), [mx, my] = pt(cm * 6, R * 0.8);
      s += `<line x1="${CX}" y1="${CY}" x2="${hx}" y2="${hy}" stroke="#1b2a22" stroke-width="6" stroke-linecap="round"/>`;
      s += `<line x1="${CX}" y1="${CY}" x2="${mx}" y2="${my}" stroke="#c0392b" stroke-width="3.5" stroke-linecap="round"/><circle cx="${CX}" cy="${CY}" r="5" fill="#1b2a22"/>`;
      // Digital readout and elapsed counter.
      const flash = el >= cross ? Math.max(0, 1 - (t - (T0 + cross * SP)) / 2) : 0;
      s += `<rect x="200" y="60" width="104" height="48" rx="8" fill="#1b2a22" stroke="${flash > 0 ? '#f0c040' : '#555'}" stroke-width="${2 + flash * 3}"/>`;
      s += `<text x="252" y="94" text-anchor="middle" font-size="26" font-weight="800" fill="#7dffa0" font-family="monospace">${hhmm(ch, mm)}</text>`;
      s += `<text x="252" y="134" text-anchor="middle" font-size="14" font-weight="700" fill="currentColor">+${Math.floor(el)} min</text>`;
      if (flash > 0) s += `<text x="252" y="160" text-anchor="middle" font-size="12" font-weight="700" fill="#e0a800" opacity="${flash}"><tspan x="252">60 min täynnä</tspan><tspan x="252" dy="15">→ tunti vaihtuu</tspan></text>`;
      if (t >= fin) {
        const o = ease(t, fin, fin + 0.5), o2 = ease(t, fin + 1, fin + 1.5);
        s += `<text x="${W / 2}" y="${H - 50}" text-anchor="middle" font-size="18" font-weight="800" fill="var(--ok)" opacity="${o}">${hhmm(h, m)} + ${d} min = ${hhmm(eh, em)}</text>`;
        if (tot >= 60) s += `<text x="${W / 2}" y="${H - 18}" text-anchor="middle" font-size="15" font-weight="700" fill="#c0392b" opacity="${o2}"><tspan text-decoration="line-through">${h}.${tot}</tspan> ✗ minuutteja on enintään 59</text>`;
      }
      return s;
    },
    caption: (t) => {
      if (t < T0) return `Kello on ${hhmm(h, m)}. Matka kestää ${d} min. Minuuttiviisari lähtee kiertämään.`;
      const el = Math.min(d, (t - T0) / SP);
      if (t < fin) return el < cross ? `Kulunut ${Math.floor(el)} min. Tasatuntiin on vielä ${Math.ceil(cross - el)} min.` : `Tasatunti ohitettu: ${cross} min vei tunnin täyteen, loput ${Math.floor(el - cross)} min kuluu uudella tunnilla.`;
      return tot >= 60 ? `${m} + ${d} = ${tot} min = 1 h ${em} min. Kello on ${hhmm(eh, em)}, ei ${h}.${tot}.` : `${m} + ${d} = ${tot} min. Kello on ${hhmm(eh, em)}.`;
    },
  });
}

/** Hour discs fill one by one (each = 60 min), then a part-disc for the extra minutes; the minute total climbs. */
export function hoursScene(h: number, m = 0): AnimPaint {
  const W = 320, n = h + (m ? 1 : 0), RR = n > 4 ? 26 : 32, gap = (W - 20) / n, H = 210, CY = 80, FT = 1.3, T0 = 1, fin = T0 + h * FT + (m ? FT * (m / 60) + 0.3 : 0) + 0.3;
  const sect = (cx: number, f: number, col: string) => {
    if (f <= 0) return '';
    if (f >= 0.999) return `<circle cx="${cx}" cy="${CY}" r="${RR - 3}" fill="${col}"/>`;
    const a = f * 2 * Math.PI, x = cx + (RR - 3) * Math.sin(a), y = CY - (RR - 3) * Math.cos(a);
    return `<path d="M${cx} ${CY} L${cx} ${CY - RR + 3} A${RR - 3} ${RR - 3} 0 ${f > 0.5 ? 1 : 0} 1 ${x} ${y} Z" fill="${col}"/>`;
  };
  return anim({
    dur: fin + 2.2, w: W, h: H, label: `${h} h ${m} min minuuteiksi`,
    frame: (t) => {
      let s = '', total = 0;
      for (let i = 0; i < n; i++) {
        const cx = 10 + gap * (i + 0.5), part = i === h;
        const f = part ? Math.min(m / 60, Math.max(0, (t - T0 - h * FT) / FT)) : Math.max(0, Math.min(1, (t - T0 - i * FT) / FT));
        total += f * 60;
        s += `<circle cx="${cx}" cy="${CY}" r="${RR}" fill="#fffbe6" stroke="#1b2a22" stroke-width="2"/>` + sect(cx, f, part ? '#f0c040' : '#9fd8a8');
        for (let q = 0; q < 12; q++) { const a = (q * Math.PI) / 6; s += `<line x1="${cx + (RR - 5) * Math.sin(a)}" y1="${CY - (RR - 5) * Math.cos(a)}" x2="${cx + RR * Math.sin(a)}" y2="${CY - RR * Math.cos(a)}" stroke="#1b2a22" stroke-width="1.2"/>`; }
        s += `<text x="${cx}" y="${CY + RR + 18}" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor" opacity="${f > 0 ? 1 : 0.4}">${part ? `${m} min` : '60 min'}</text>`;
      }
      s += `<text x="${W / 2}" y="${H - 50}" text-anchor="middle" font-size="22" font-weight="800" fill="currentColor">${Math.round(total)} min</text>`;
      if (t >= fin) s += `<text x="${W / 2}" y="${H - 16}" text-anchor="middle" font-size="17" font-weight="800" fill="var(--ok)" opacity="${ease(t, fin, fin + 0.4)}">${h} h${m ? ` ${m} min` : ''} = ${h} × 60${m ? ` + ${m}` : ''} = ${h * 60 + m} min</text>`;
      return s;
    },
    caption: (t) => {
      if (t < T0) return `Jokainen kiekko on yksi tunti eli 60 minuuttia, ei 100.`;
      const k = Math.floor((t - T0) / FT);
      if (k < h) return `${k + 1}. tunti täyttyy: ${(k + 1) * 60} minuuttia kasassa.`;
      if (t < fin && m) return `Vielä ${m} minuuttia: osa uudesta kiekosta.`;
      return `${h} h${m ? ` ${m} min` : ''} = ${h * 60 + m} min.`;
    },
  });
}
