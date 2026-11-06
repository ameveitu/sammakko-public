// Collecting data live: observations arrive one by one and each becomes a tally stroke in its row;
// every fifth stroke closes the group diagonally. At the end each row is counted in fives.
import { anim, ease, type AnimPaint } from '../ui/anim';

/** Strokes for `k` marks (k ≤ n drawn so far) starting at x, the 5th of each group drawn diagonally. */
function strokes(x0: number, y: number, h: number, k: number, part = 1, glow = -1): string {
  let s = '';
  for (let i = 0; i < k; i++) {
    const g = Math.floor(i / 5), j = i % 5, x = x0 + g * 42, last = i === k - 1, p = last ? part : 1;
    const col = g === glow ? 'var(--pond)' : 'currentColor';
    if (j < 4) s += `<line x1="${x + j * 7}" y1="${y}" x2="${x + j * 7}" y2="${y + h * p}" stroke="${col}" stroke-width="3" stroke-linecap="round"/>`;
    else s += `<line x1="${x - 4}" y1="${y + h - 4}" x2="${x - 4 + 32 * p}" y2="${y + h - 4 - (h - 8) * p}" stroke="${col}" stroke-width="3" stroke-linecap="round"/>`;
  }
  return s;
}

/** `kinds` are [emoji, name] rows; `seq` lists the observed row index in arrival order. */
export function tallyScene(kinds: [string, string][], seq: number[], question = ''): AnimPaint {
  const W = 320, RH = 46, top = question ? 70 : 44, H = top + kinds.length * RH + 34, ST = 0.75, T0 = 0.8, TE = T0 + seq.length * ST + 0.4, CS = 0.6;
  const totals = kinds.map((_, i) => seq.filter((x) => x === i).length);
  return anim({
    dur: TE + kinds.length * 2.2 + 2.5, w: W, h: H, label: 'Viivamerkintä',
    frame: (t) => {
      let s = question ? `<text x="${W / 2}" y="20" text-anchor="middle" font-size="14" font-weight="800" fill="currentColor">${question}</text>` : '';
      const done = Math.max(0, Math.min(seq.length, Math.floor((t - T0) / ST) + 1)), cur = Math.floor((t - T0) / ST), part = t < T0 ? 0 : ease(t, T0 + cur * ST + 0.35, T0 + cur * ST + 0.6);
      // The current observation flies across the top strip.
      if (t >= T0 && t < TE - 0.4 && cur < seq.length) {
        const k = seq[cur]!, f = ease(t, T0 + cur * ST, T0 + cur * ST + 0.35), y = top + k * RH + RH / 2;
        const y0 = question ? 46 : 26;
        s += `<text x="${W - 34 - (W - 150) * f}" y="${y0 + (y + 6 - y0) * f}" font-size="22" opacity="${1 - f * 0.7}">${kinds[k]![0]}</text>`;
      }
      kinds.forEach(([e, name], i) => {
        const y = top + i * RH, k = seq.slice(0, done).filter((x) => x === i).length, isCur = cur < seq.length && seq[cur] === i && t >= T0;
        const ci = Math.floor((t - TE) / 2.2), counting = t >= TE && ci === i, glow = counting ? Math.floor((t - TE - i * 2.2) / CS) : -1;
        s += `<rect x="4" y="${y}" width="${W - 8}" height="${RH - 6}" rx="8" fill="${isCur || counting ? 'color-mix(in srgb, var(--pond) 14%, var(--card))' : 'var(--card)'}" stroke="currentColor" stroke-opacity=".3"/>`;
        s += `<text x="12" y="${y + 27}" font-size="18">${e}</text><text x="38" y="${y + 26}" font-size="13" font-weight="800" fill="currentColor">${name}</text>`;
        s += strokes(118, y + 8, RH - 22, k, isCur ? part : 1, glow);
        if (k > 0 && k % 5 === 0 && isCur && part >= 1) s += `<text x="${118 + (k / 5 - 1) * 42 + 12}" y="${y + 6}" text-anchor="middle" font-size="11" font-weight="900" fill="var(--pond)">5!</text>`;
        if (t >= TE && ci >= i) {
          const marks = [...Array.from({ length: Math.floor(totals[i]! / 5) }, (_, g) => 5 * (g + 1))];
          if (totals[i]! % 5) marks.push(totals[i]!);
          const say = ci > i ? `${totals[i]}` : marks.slice(0, Math.max(1, glow + 1)).join(', ');
          s += `<text x="${W - 12}" y="${y + 26}" text-anchor="end" font-size="${ci > i ? 18 : 13}" font-weight="900" fill="var(--pond)">${say}</text>`;
        }
      });
      if (t >= TE + kinds.length * 2.2) {
        const b = totals.indexOf(Math.max(...totals));
        s += `<text x="${W / 2}" y="${H - 10}" text-anchor="middle" font-size="14" font-weight="800" fill="var(--pond)">Eniten: ${kinds[b]![0]} ${kinds[b]![1]} (${totals[b]})</text>`;
      }
      return s;
    },
    caption: (t) => {
      if (t < T0) return question ? `Kysymys: ${question} Jokaisesta vastauksesta yksi viiva.` : 'Jokaisesta havainnosta piirretään yksi viiva oikealle riville.';
      if (t < TE) {
        const cur = Math.min(seq.length - 1, Math.floor((t - T0) / ST)), k = seq[cur]!, cnt = seq.slice(0, cur + 1).filter((x) => x === k).length;
        return cnt % 5 === 0 ? `${kinds[k]![1]}: viides viiva vedetään vinoon. Valmis viisiryhmä!` : `${kinds[k]![1]}: yksi viiva lisää (${cnt}).`;
      }
      const i = Math.min(kinds.length - 1, Math.floor((t - TE) / 2.2));
      return `${kinds[i]![1]}: lasketaan viisiryhmät ensin ja sitten loput viivat. Yhteensä ${totals[i]}.`;
    },
  });
}

/** Checking a tally against what was seen: a pointer walks the observations; each `target` is paired with its
 *  stroke. One sighting (index `miss`) has no stroke: it is flagged and the missing stroke is added. */
export function checkTallyScene(seq: string[], target: string, name: string, miss: number): AnimPaint {
  const W = 320, H = 200, n = seq.length, gap = Math.min(30, (W - 24) / n), X = (i: number) => 12 + gap * (i + 0.5), ST = 0.7, T0 = 1.2, TE = T0 + n * ST;
  const hits = seq.map((e, i) => (e === target ? i : -1)).filter((i) => i >= 0), total = hits.length, mi = hits.indexOf(miss);
  const TF = TE + 0.4;
  return anim({
    dur: TF + 4, w: W, h: H, label: `Tarkistus: ${name}`,
    frame: (t) => {
      const cur = t < T0 ? -1 : Math.min(n - 1, Math.floor((t - T0) / ST));
      let s = seq.map((e, i) => `<text x="${X(i)}" y="44" text-anchor="middle" font-size="${Math.min(24, gap - 4)}" opacity="${e === target || cur < i ? 1 : 0.35}">${e}</text>`).join('');
      if (cur >= 0 && t < TE) s += `<path d="M${X(cur)} 56 l-6 9 h12z" fill="var(--blue)"/>`;
      // Tally row: strokes already recorded (all but the missed one), placed left to right.
      const recorded = total - 1, sx = (k: number) => 40 + Math.floor(k / 5) * 46 + (k % 5) * 8;
      s += `<rect x="6" y="104" width="${W - 12}" height="56" rx="8" fill="var(--card)" stroke="currentColor" stroke-opacity=".3"/><text x="16" y="138" font-size="20">${target}</text>`;
      const matched = hits.filter((h, k) => k !== mi && h <= cur).length;
      for (let k = 0; k < recorded + (t >= TF ? 1 : 0); k++) {
        const fifth = k % 5 === 4, x = sx(k), isNew = k === recorded, p = isNew ? ease(t, TF, TF + 0.6) : 1, done = k < matched || isNew;
        const col = isNew ? 'var(--pond)' : done ? 'var(--pond)' : 'currentColor';
        s += fifth ? `<line x1="${x - 36}" y1="150" x2="${x - 36 + 34 * p}" y2="${150 - 36 * p}" stroke="${col}" stroke-width="3" stroke-linecap="round"/>` : `<line x1="${x}" y1="114" x2="${x}" y2="${114 + 36 * p}" stroke="${col}" stroke-width="3" stroke-linecap="round"/>`;
      }
      // Link line from the current sighting to its stroke.
      if (cur >= 0 && t < TE && seq[cur] === target) {
        const k = hits.indexOf(cur);
        if (k === mi) s += `<text x="${X(cur)}" y="88" text-anchor="middle" font-size="13" font-weight="900" fill="#c0392b">ei viivaa! ✗</text><circle cx="${X(cur)}" cy="38" r="15" fill="none" stroke="#c0392b" stroke-width="2.5"/>`;
        else { const kk = k > mi && mi >= 0 ? k - 1 : k; s += `<line x1="${X(cur)}" y1="58" x2="${sx(kk) - (kk % 5 === 4 ? 20 : 0)}" y2="112" stroke="var(--pond)" stroke-width="2" stroke-dasharray="3 3"/>`; }
      }
      if (t >= TE && mi >= 0) s += `<circle cx="${X(miss)}" cy="38" r="15" fill="none" stroke="${t >= TF ? 'var(--pond)' : '#c0392b'}" stroke-width="2.5"/>`;
      if (t >= TF + 0.8) s += `<text x="${W / 2}" y="186" text-anchor="middle" font-size="14" font-weight="800" fill="var(--pond)">Korjattu: ${total} viivaa = ${total} havaintoa ✓</text>`;
      else if (t < T0) s += `<text x="${W / 2}" y="186" text-anchor="middle" font-size="13" font-weight="800" fill="currentColor">Viivoja ${recorded}. Täsmääkö?</text>`;
      return s;
    },
    caption: (t) => {
      if (t < T0) return `Rivillä on ${total - 1} viivaa. Tarkistetaan: käydään havainnot läpi yksi kerrallaan.`;
      if (t < TE) { const cur = Math.min(n - 1, Math.floor((t - T0) / ST)); return seq[cur] === target ? (cur === miss ? 'Tästä havainnosta ei ole viivaa!' : `${target} – tällä on viiva.`) : 'Tämä on eri eläin. Ohitetaan.'; }
      return `Puuttuva viiva lisätään. Nyt viivoja on ${total}, yhtä monta kuin havaintoja.`;
    },
  });
}

/** Reading a two-way table: for each query the row lights up, then the column, and the crossing cell pops out. */
export function tableReadScene(rows: string[], cols: string[], vals: number[][], queries: [number, number, string][]): AnimPaint {
  const W = 320, CW0 = 110, CW = (W - 12 - CW0) / cols.length, RH = 36, top = 50, H = top + (rows.length + 1) * RH + 40, QT = 3.6, T0 = 0.6;
  const cx = (c: number) => 6 + CW0 + CW * (c + 0.5), cy = (r: number) => top + RH * (r + 1) + RH / 2;
  return anim({
    dur: T0 + queries.length * QT + 1.5, w: W, h: H, label: 'Taulukon lukeminen',
    frame: (t) => {
      const q = Math.max(0, Math.min(queries.length - 1, Math.floor((t - T0) / QT))), tq = t - T0 - q * QT, [qr, qc, label] = queries[q]!;
      let s = `<text x="${W / 2}" y="24" text-anchor="middle" font-size="15" font-weight="800" fill="currentColor">${t >= T0 ? label : 'Rivit → , sarakkeet ↓'}</text>`;
      const rowOn = t >= T0 ? ease(tq, 0.2, 0.8) : 0, colOn = t >= T0 ? ease(tq, 1.1, 1.7) : 0, hit = t >= T0 ? ease(tq, 2.0, 2.4) : 0;
      if (rowOn > 0) s += `<rect x="6" y="${cy(qr) - RH / 2}" width="${(W - 12) * rowOn}" height="${RH}" fill="color-mix(in srgb, var(--blue) 22%, transparent)"/>`;
      if (colOn > 0) s += `<rect x="${cx(qc) - CW / 2}" y="${top}" width="${CW}" height="${RH * (rows.length + 1) * colOn}" fill="color-mix(in srgb, var(--sun) 30%, transparent)"/>`;
      s += `<rect x="6" y="${top}" width="${W - 12}" height="${RH * (rows.length + 1)}" rx="6" fill="none" stroke="currentColor" stroke-opacity=".5"/>`;
      for (let r = 1; r <= rows.length; r++) s += `<line x1="6" y1="${top + r * RH}" x2="${W - 6}" y2="${top + r * RH}" stroke="currentColor" stroke-opacity="${r === 1 ? 0.6 : 0.25}" stroke-width="${r === 1 ? 2 : 1}"/>`;
      for (let c = 0; c < cols.length; c++) s += `<line x1="${6 + CW0 + CW * c}" y1="${top}" x2="${6 + CW0 + CW * c}" y2="${top + RH * (rows.length + 1)}" stroke="currentColor" stroke-opacity="${c === 0 ? 0.6 : 0.25}" stroke-width="${c === 0 ? 2 : 1}"/>`;
      cols.forEach((c, i) => { s += `<text x="${cx(i)}" y="${top + 24}" text-anchor="middle" font-size="14" font-weight="800" fill="currentColor">${c}</text>`; });
      rows.forEach((rw, r) => {
        s += `<text x="14" y="${cy(r) + 5}" font-size="14" font-weight="800" fill="currentColor">${rw}</text>`;
        vals[r]!.forEach((v, c) => {
          const isHit = r === qr && c === qc && hit > 0;
          if (isHit) s += `<circle cx="${cx(c)}" cy="${cy(r)}" r="${15 + 3 * hit}" fill="var(--pond)" opacity="${0.9 * hit}"/>`;
          s += `<text x="${cx(c)}" y="${cy(r) + 5}" text-anchor="middle" font-size="${isHit ? 16 + 2 * hit : 15}" font-weight="${isHit ? 900 : 600}" fill="${isHit ? '#fff' : 'currentColor'}">${v}</text>`;
        });
      });
      if (t >= T0 && tq >= 2.4) s += `<text x="${W / 2}" y="${H - 12}" text-anchor="middle" font-size="15" font-weight="900" fill="var(--pond)">${rows[qr]}, ${cols[qc]}: ${vals[qr]![qc]} ✓</text>`;
      else if (t >= T0 && tq >= 1.1) s += `<text x="${W / 2}" y="${H - 12}" text-anchor="middle" font-size="13" font-weight="800" fill="currentColor">rivi ${rows[qr]} + sarake ${cols[qc]}</text>`;
      else if (t >= T0) s += `<text x="${W / 2}" y="${H - 12}" text-anchor="middle" font-size="13" font-weight="800" fill="currentColor">rivi ${rows[qr]}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < T0) return 'Taulukossa jokaisella rivillä ja sarakkeella on otsikko.';
      const q = Math.min(queries.length - 1, Math.floor((t - T0) / QT)), tq = t - T0 - q * QT, [qr, qc] = queries[q]!;
      if (tq < 1.1) return `Etsi ensin rivi: ${rows[qr]}.`;
      if (tq < 2.0) return `Sitten sarake: ${cols[qc]}.`;
      return `Risteyksessä on vastaus: ${vals[qr]![qc]}.`;
    },
  });
}

/** Table rows grow into bars: the longest is crowned, then two rows are compared and the gap is measured. */
export function compareBarsScene(rows: [string, number][], a: number, b: number): AnimPaint {
  const W = 320, RH = 40, top = 34, H = top + rows.length * RH + 46, max = Math.max(...rows.map((x) => x[1])), X0 = 112, U = (W - X0 - 40) / max;
  const T0 = 0.6, TG = T0 + 0.5, TB = TG + rows.length * 0.6 + 0.6, TM = TB + 1.6, TD = TM + 1.6;
  const best = rows.findIndex((x) => x[1] === max), [hi, lo] = rows[a]![1] >= rows[b]![1] ? [a, b] : [b, a], d = rows[hi]![1] - rows[lo]![1];
  return anim({
    dur: TD + 4, w: W, h: H, label: 'Vertailu',
    frame: (t) => {
      let s = '';
      rows.forEach(([name, v], i) => {
        const y = top + i * RH, g = ease(t, TG + i * 0.6, TG + i * 0.6 + 0.6), dim = t >= TM && i !== hi && i !== lo ? 0.35 : 1;
        s += `<g opacity="${dim}"><text x="10" y="${y + 24}" font-size="14" font-weight="800" fill="currentColor">${name}</text>`;
        s += `<rect x="${X0}" y="${y + 8}" width="${v * U * g}" height="22" rx="4" fill="${t >= TB && t < TM && i === best ? 'var(--pond)' : 'var(--blue)'}" opacity=".85"/>`;
        s += `<text x="${X0 + v * U * g + 6}" y="${y + 24}" font-size="14" font-weight="900" fill="currentColor">${v}</text></g>`;
      });
      if (t >= TB && t < TM) s += `<text x="${W / 2}" y="${H - 16}" text-anchor="middle" font-size="14" font-weight="800" fill="var(--pond)">Pisin palkki = suurin luku: ${rows[best]![0]} ${max}</text>`;
      if (t >= TM) {
        const yl = top + lo * RH, yh = top + hi * RH, xl = X0 + rows[lo]![1] * U, xh = X0 + rows[hi]![1] * U, p = ease(t, TM, TM + 0.8);
        s += `<line x1="${xl}" y1="${yl + 8}" x2="${xl}" y2="${yl + 8 + (yh + 30 - yl - 8) * p}" stroke="currentColor" stroke-width="1.6" stroke-dasharray="4 3"/>`;
        if (t >= TD) {
          const q = ease(t, TD, TD + 0.6);
          s += `<rect x="${xl}" y="${yh + 8}" width="${(xh - xl) * q}" height="22" fill="var(--sun)" stroke="currentColor" stroke-width="1.5"/>`;
          if (q >= 1) s += `<text x="${(xl + xh) / 2}" y="${yh + 24}" text-anchor="middle" font-size="13" font-weight="900" fill="#1b2a22">${d}</text>`;
          s += `<text x="${W / 2}" y="${H - 16}" text-anchor="middle" font-size="14" font-weight="800" fill="var(--pond)">${rows[hi]![0]} − ${rows[lo]![0]}: ${rows[hi]![1]} − ${rows[lo]![1]} = ${d}</text>`;
        }
      }
      if (t < TB) s += `<text x="${W / 2}" y="20" text-anchor="middle" font-size="13" font-weight="800" fill="currentColor" opacity=".8">Taulukon luvut palkeiksi</text>`;
      return s;
    },
    caption: (t) => {
      if (t < TB) return 'Jokaisen rivin luku muuttuu palkiksi. Suurempi luku, pidempi palkki.';
      if (t < TM) return `Eniten: ${rows[best]![0]}, koska ${max} on suurin luku.`;
      if (t < TD) return `Montako enemmän ${rows[hi]![0]} kuin ${rows[lo]![0]}? Merkitään lyhyemmän palkin pää.`;
      return `Ylijäävä pala on erotus: ${rows[hi]![1]} − ${rows[lo]![1]} = ${d}.`;
    },
  });
}

/** Building a table from a list of sightings: headers, one row per kind, each sighting moves into its row's count,
 *  and finally the counts are checked against the length of the list. */
export function buildTableScene(kinds: [string, string][], seq: number[]): AnimPaint {
  const W = 320, n = seq.length, gap = Math.min(26, (W - 16) / n), RH = 34, top = 78, H = top + (kinds.length + 2) * RH + 20;
  const TH = 0.5, TR = TH + 1.2, T0 = TR + kinds.length * 0.4 + 0.3, ST = 0.55, TE = T0 + n * ST, TS = TE + 0.6;
  const totals = kinds.map((_, i) => seq.filter((x) => x === i).length), C1 = 150;
  return anim({
    dur: TS + 4, w: W, h: H, label: 'Taulukon tekeminen',
    frame: (t) => {
      const cur = t < T0 ? -1 : Math.min(n, Math.floor((t - T0) / ST));
      let s = seq.map((k, i) => `<text x="${8 + gap * (i + 0.5)}" y="30" text-anchor="middle" font-size="${Math.min(22, gap - 3)}" opacity="${i < cur ? 0.2 : 1}">${kinds[k]![0]}</text>`).join('');
      if (cur >= 0 && cur < n) {
        const k = seq[cur]!, f = ease(t, T0 + cur * ST, T0 + cur * ST + 0.45), x0 = 8 + gap * (cur + 0.5), y0 = 30, x1 = C1 + 70, y1 = top + RH * (k + 1) + 23;
        s += `<text x="${x0 + (x1 - x0) * f}" y="${y0 + (y1 - y0) * f}" text-anchor="middle" font-size="20" opacity="${1 - 0.8 * f}">${kinds[k]![0]}</text>`;
      }
      const ho = ease(t, TH, TH + 0.6), rows = kinds.length + 2;
      s += `<rect x="8" y="${top}" width="${W - 16}" height="${RH * rows}" rx="6" fill="none" stroke="currentColor" stroke-opacity="${0.5 * ho}"/><line x1="${C1}" y1="${top}" x2="${C1}" y2="${top + RH * rows}" stroke="currentColor" stroke-opacity="${0.4 * ho}"/>`;
      for (let r = 1; r < rows; r++) s += `<line x1="8" y1="${top + r * RH}" x2="${W - 8}" y2="${top + r * RH}" stroke="currentColor" stroke-opacity="${(r === 1 || r === rows - 1 ? 0.6 : 0.2) * ho}" stroke-width="${r === 1 || r === rows - 1 ? 2 : 1}"/>`;
      s += `<text x="18" y="${top + 23}" font-size="14" font-weight="900" fill="currentColor" opacity="${ho}">Eläin</text><text x="${(C1 + W) / 2}" y="${top + 23}" text-anchor="middle" font-size="14" font-weight="900" fill="currentColor" opacity="${ease(t, TH + 0.5, TH + 1)}">Määrä</text>`;
      kinds.forEach(([e, name], i) => {
        const y = top + RH * (i + 1), o = ease(t, TR + i * 0.4, TR + i * 0.4 + 0.4), k = seq.slice(0, Math.max(0, cur)).filter((x) => x === i).length;
        const bump = cur > 0 && seq[cur - 1] === i && t < T0 + cur * ST + 0.3;
        s += `<text x="18" y="${y + 23}" font-size="14" font-weight="800" fill="currentColor" opacity="${o}">${e} ${name}</text>`;
        if (cur >= 0) s += `<text x="${(C1 + W) / 2}" y="${y + 24}" text-anchor="middle" font-size="${bump ? 20 : 16}" font-weight="900" fill="${bump ? 'var(--pond)' : 'currentColor'}">${k}</text>`;
      });
      const ys = top + RH * (kinds.length + 1);
      if (t >= TS) {
        const sum = totals.reduce((a, b) => a + b, 0);
        s += `<text x="18" y="${ys + 23}" font-size="14" font-weight="900" fill="var(--pond)">Yhteensä</text><text x="${(C1 + W) / 2}" y="${ys + 24}" text-anchor="middle" font-size="15" font-weight="900" fill="var(--pond)">${totals.join(' + ')} = ${sum}</text>`;
        if (t >= TS + 1.2) s += `<text x="${W / 2}" y="${H - 4}" text-anchor="middle" font-size="13" font-weight="800" fill="var(--pond)">${sum} havaintoa ✓ Kaikki mukana.</text>`;
      }
      return s;
    },
    caption: (t) => {
      if (t < TR) return 'Ensin otsikot: mitä riveillä on ja mitä luvut tarkoittavat.';
      if (t < T0) return 'Jokainen eläin saa oman rivin.';
      if (t < TE) return 'Havainnot siirretään yksi kerrallaan oman rivin määrään.';
      return `Tarkistus: rivien summa on yhtä suuri kuin havaintojen määrä (${n}).`;
    },
  });
}

/** Two bird counts at the same visiting rate. First with different durations (5 min vs 60 min): the longer count
 *  "wins" for no reason. Then both last 10 minutes and the counts can be compared fairly. */
export function fairCountScene(): AnimPaint {
  const W = 320, H = 230, T1 = 0.6, A = 5.0, T2 = T1 + A + 1.8, B = 4.0, rate = 0.4;
  const spots = Array.from({ length: 30 }, (_, i) => [(i * 37) % 100 / 100, ((i * 53) % 100) / 100]);
  const panel = (x: number, label: string, mins: number, minsNow: number, count: number, tone: string) => {
    const cx = x + 36, cy = 92, a = (minsNow / 60) * Math.PI * 2;
    let s = `<rect x="${x}" y="40" width="${W / 2 - 12}" height="150" rx="10" fill="var(--card)" stroke="${tone}" stroke-width="2"/><text x="${x + (W / 2 - 12) / 2}" y="60" text-anchor="middle" font-size="13" font-weight="800" fill="currentColor">${label}</text>`;
    s += `<circle cx="${cx}" cy="${cy + 10}" r="24" fill="none" stroke="currentColor" stroke-width="2"/>${minsNow >= 59.9 ? `<circle cx="${cx}" cy="${cy + 10}" r="24" fill="var(--sun)" opacity=".7"/>` : `<path d="M${cx} ${cy + 10} L${cx} ${cy - 14} A24 24 0 ${a > Math.PI ? 1 : 0} 1 ${cx + 24 * Math.sin(a)} ${cy + 10 - 24 * Math.cos(a)} Z" fill="var(--sun)" opacity=".7"/>`}<text x="${cx}" y="${cy + 52}" text-anchor="middle" font-size="12" font-weight="800" fill="currentColor">${Math.round(minsNow)} / ${mins} min</text>`;
    for (let i = 0; i < Math.min(count, 30); i++) s += `<text x="${x + 70 + spots[i]![0]! * 56}" y="${80 + spots[i]![1]! * 64}" font-size="12">🐦</text>`;
    s += `<text x="${x + (W / 2 - 12) / 2}" y="180" text-anchor="middle" font-size="18" font-weight="900" fill="${tone}">${count} lintua</text>`;
    return s;
  };
  return anim({
    dur: T2 + B + 4, w: W, h: H, label: 'Reilu laskenta',
    frame: (t) => {
      let s = '';
      if (t < T2 - 0.4) {
        const m = Math.max(0, Math.min(60, ((t - T1) / A) * 60)), ml = Math.min(5, m), done = t >= T1 + A;
        s += panel(6, 'ma: 5 min', 5, ml, Math.floor(ml * rate), done ? '#c0392b' : 'currentColor') + panel(W / 2 + 6, 'ti: 60 min', 60, m, Math.floor(m * rate), done ? '#c0392b' : 'currentColor');
        s += `<text x="${W / 2}" y="24" text-anchor="middle" font-size="14" font-weight="800" fill="${done ? '#c0392b' : 'currentColor'}">${done ? 'Tiistaina enemmän lintuja? ✗ Ei voi tietää!' : 'Eri pituiset laskennat'}</text>`;
      } else {
        const m = Math.max(0, Math.min(10, ((t - T2) / B) * 10)), done = t >= T2 + B;
        s += panel(6, 'ma: 10 min', 10, m, Math.floor(m * rate), done ? 'var(--pond)' : 'currentColor') + panel(W / 2 + 6, 'ti: 10 min', 10, m, Math.floor(m * rate * 1.25), done ? 'var(--pond)' : 'currentColor');
        s += `<text x="${W / 2}" y="24" text-anchor="middle" font-size="14" font-weight="800" fill="${done ? 'var(--pond)' : 'currentColor'}">${done ? 'Sama kesto: nyt voi verrata ✓' : 'Sama aika, sama kesto'}</text>`;
      }
      if (t >= T2 + B + 0.6) s += `<text x="${W / 2}" y="${H - 14}" text-anchor="middle" font-size="13" font-weight="800" fill="var(--pond)">Tiistaina kävi 1 lintu enemmän.</text>`;
      else if (t >= T1 + A && t < T2) s += `<text x="${W / 2}" y="${H - 14}" text-anchor="middle" font-size="13" font-weight="800" fill="#c0392b">Pidempi laskenta → aina isompi luku.</text>`;
      return s;
    },
    caption: (t) => {
      if (t < T1 + A) return 'Maanantaina lasketaan 5 minuuttia, tiistaina tunti. Linnut käyvät yhtä tiheään.';
      if (t < T2) return 'Tiistain luku on suurempi vain siksi, että laskettiin pidempään.';
      if (t < T2 + B) return 'Uusi suunnitelma: molempina päivinä 10 minuuttia samaan aikaan.';
      return 'Nyt ainoa ero on päivä. Tulokset voi verrata.';
    },
  });
}

/** Research steps light up in order; the wrong order (table before question) is shown first and struck out. */
export function stepsScene(): AnimPaint {
  const W = 320, H = 200, steps: [string, string][] = [['❓', 'kysymys'], ['📝', 'suunnitelma'], ['🔭', 'keruu'], ['📋', 'taulukko']], ST = 1.3, T0 = 3.2;
  return anim({
    dur: T0 + steps.length * ST + 3, w: W, h: H, label: 'Tutkimuksen vaiheet',
    frame: (t) => {
      let s = '';
      if (t < T0) {
        const bad = ['📋 taulukko', '🔭 keruu', '❓ kysymys'];
        bad.forEach((b, i) => { s += `<text x="${60 + i * 100}" y="70" text-anchor="middle" font-size="15" font-weight="800" fill="currentColor" opacity="${ease(t, i * 0.4, i * 0.4 + 0.3)}">${b}</text>${i < 2 ? `<text x="${110 + i * 100}" y="70" text-anchor="middle" font-size="15" fill="currentColor">→</text>` : ''}`; });
        if (t >= 1.6) s += `<line x1="14" y1="64" x2="${14 + 292 * ease(t, 1.6, 2.2)}" y2="64" stroke="#c0392b" stroke-width="3"/><text x="${W / 2}" y="110" text-anchor="middle" font-size="13" font-weight="800" fill="#c0392b">Taulukko ensin? Mitä siihen laitetaan? ✗</text>`;
        return s;
      }
      steps.forEach(([e, name], i) => {
        const on = ease(t, T0 + i * ST, T0 + i * ST + 0.5), x = 40 + i * 80;
        s += `<circle cx="${x}" cy="80" r="${22 + 4 * on}" fill="${on > 0 ? 'color-mix(in srgb, var(--pond) 25%, var(--card))' : 'var(--card)'}" stroke="${on >= 1 ? 'var(--pond)' : 'currentColor'}" stroke-opacity="${0.3 + 0.7 * on}" stroke-width="2"/><text x="${x}" y="88" text-anchor="middle" font-size="22" opacity="${0.3 + 0.7 * on}">${e}</text><text x="${x}" y="44" text-anchor="middle" font-size="13" font-weight="900" fill="currentColor" opacity="${0.4 + 0.6 * on}">${i + 1}.</text><text x="${x}" y="128" text-anchor="middle" font-size="11" font-weight="800" fill="currentColor" opacity="${0.4 + 0.6 * on}">${name}</text>`;
        if (i < steps.length - 1) s += `<path d="M${x + 28} 80 h${24 * ease(t, T0 + i * ST + 0.6, T0 + i * ST + 1.1)}" stroke="var(--pond)" stroke-width="3"/>`;
      });
      if (t >= T0 + steps.length * ST) s += `<text x="${W / 2}" y="170" text-anchor="middle" font-size="14" font-weight="800" fill="var(--pond)">Kysymys ratkaisee, mitä kerätään ✓</text>`;
      return s;
    },
    caption: (t) => {
      if (t < T0) return 'Väärä järjestys: taulukkoa ei voi tehdä, jos ei tiedä, mitä tutkitaan.';
      const i = Math.min(steps.length - 1, Math.floor((t - T0) / ST));
      return ['Ensin kysymys: mitä haluamme tietää?', 'Sitten suunnitelma: missä, milloin ja kuinka kauan.', 'Sitten keruu: havainnot muistiin.', 'Lopuksi taulukko: tulos näkyy yhdellä silmäyksellä.'][i]!;
    },
  });
}

/** A list of "day + animal" sightings is sorted into a two-way table: each chip lights its row and column and drops
 *  into the crossing cell, whose count goes up by one. */
export function twoWayScene(kinds: string[], days: string[], obs: [number, number][]): AnimPaint {
  const W = 320, n = obs.length, CW0 = 90, CW = (W - 12 - CW0) / days.length, RH = 36, top = 92, H = top + (kinds.length + 1) * RH + 34, ST = 0.9, T0 = 1.0, TE = T0 + n * ST;
  const per = Math.min(n, 6), chipW = (W - 12) / per;
  const cell = (k: number, d: number) => [6 + CW0 + CW * (d + 0.5), top + RH * (k + 1) + RH / 2] as const;
  return anim({
    dur: TE + 3.5, w: W, h: H, label: 'Lista kaksiulotteiseksi taulukoksi',
    frame: (t) => {
      const cur = t < T0 ? -1 : Math.min(n, Math.floor((t - T0) / ST)), f = cur >= 0 && cur < n ? ease(t, T0 + cur * ST + 0.3, T0 + cur * ST + 0.75) : 0;
      let s = '';
      obs.forEach(([k, d], i) => {
        if (i < cur || (i === cur && f >= 1)) return;
        const x0 = 6 + chipW * ((i % per) + 0.5), y0 = 22 + Math.floor(i / per) * 30, [x1, y1] = cell(k, d), p = i === cur ? f : 0;
        s += `<g transform="translate(${x0 + (x1 - x0) * p} ${y0 + (y1 - y0) * p})"><rect x="-24" y="-12" width="48" height="24" rx="12" fill="${i === cur ? 'color-mix(in srgb, var(--pond) 30%, var(--card))' : 'var(--card)'}" stroke="currentColor" stroke-opacity=".5"/><text x="0" y="5" text-anchor="middle" font-size="12" font-weight="800" fill="currentColor">${days[d]} ${kinds[k]}</text></g>`;
      });
      if (cur >= 0 && cur < n) {
        const [k, d] = obs[cur]!, [x, y] = cell(k, d), hl = ease(t, T0 + cur * ST, T0 + cur * ST + 0.3);
        s += `<rect x="6" y="${y - RH / 2}" width="${W - 12}" height="${RH}" fill="color-mix(in srgb, var(--blue) 22%, transparent)" opacity="${hl}"/><rect x="${x - CW / 2}" y="${top}" width="${CW}" height="${RH * (kinds.length + 1)}" fill="color-mix(in srgb, var(--sun) 30%, transparent)" opacity="${hl}"/>`;
      }
      s += `<rect x="6" y="${top}" width="${W - 12}" height="${RH * (kinds.length + 1)}" rx="6" fill="none" stroke="currentColor" stroke-opacity=".5"/><line x1="6" y1="${top + RH}" x2="${W - 6}" y2="${top + RH}" stroke="currentColor" stroke-opacity=".6" stroke-width="2"/><line x1="${6 + CW0}" y1="${top}" x2="${6 + CW0}" y2="${top + RH * (kinds.length + 1)}" stroke="currentColor" stroke-opacity=".6" stroke-width="2"/>`;
      days.forEach((d, i) => { s += `<text x="${6 + CW0 + CW * (i + 0.5)}" y="${top + 24}" text-anchor="middle" font-size="14" font-weight="900" fill="currentColor">${d}</text>`; });
      kinds.forEach((e, k) => {
        s += `<text x="${6 + CW0 / 2}" y="${top + RH * (k + 1) + 25}" text-anchor="middle" font-size="20">${e}</text>`;
        days.forEach((_, d) => {
          const done = obs.slice(0, Math.max(0, cur + (f >= 1 ? 1 : 0))).filter(([a, b]) => a === k && b === d).length, [x, y] = cell(k, d), bump = cur >= 0 && cur < n && f >= 1 && obs[cur]![0] === k && obs[cur]![1] === d;
          s += `<text x="${x}" y="${y + 6}" text-anchor="middle" font-size="${bump ? 20 : 16}" font-weight="900" fill="${bump ? 'var(--pond)' : 'currentColor'}" opacity="${cur < 0 ? 0.3 : 1}">${cur < 0 ? '' : done}</text>`;
        });
      });
      if (t >= TE) s += `<text x="${W / 2}" y="${H - 10}" text-anchor="middle" font-size="14" font-weight="800" fill="var(--pond)">Lista on taulukossa: ${n} merkintää ✓</text>`;
      return s;
    },
    caption: (t) => {
      if (t < T0) return 'Jokaisessa merkinnässä on päivä ja eläin. Päivä kertoo sarakkeen, eläin rivin.';
      if (t < TE) { const [k, d] = obs[Math.min(n - 1, Math.floor((t - T0) / ST))]!; return `${days[d]} ${kinds[k]}: rivi ${kinds[k]}, sarake ${days[d]}. Ruutuun yksi lisää.`; }
      return 'Nyt yhdellä silmäyksellä näkyy, montako kutakin eläintä nähtiin kunakin päivänä.';
    },
  });
}
