// Divisibility as motion: items are packed into boxes of k (does anything stay over?), and a frog
// jumps k at a time across a 1–50 board so the last-digit pattern of the landing squares shows.
import { anim, ease, type AnimPaint } from '../ui/anim';
import { frog } from '../ui/art';

const DOT = '#4f8fd6', OK = 'var(--ok)', BAD = 'var(--red)';

/** n items packed into boxes of k, one at a time. */
export function packScene(n: number, k: number): AnimPaint {
  const W = 320, q = Math.floor(n / k), rem = n % k, B = Math.ceil(n / k);
  const pileRows = Math.ceil(n / 10), PY = 34;
  const SD = 12, bw = k * SD + 8, perRow = Math.max(1, Math.floor((W - 16) / (bw + 8))), BY0 = PY + pileRows * 14 + 22;
  const RG = 42, boxRows = Math.ceil(B / perRow), H = BY0 + boxRows * RG + 30;
  const rowW = Math.min(B, perRow) * (bw + 8) - 8, BX0 = (W - rowW) / 2;
  const boxXY = (b: number): [number, number] => [BX0 + (b % perRow) * (bw + 8), BY0 + Math.floor(b / perRow) * RG];
  const pile = (i: number): [number, number] => [W / 2 - 63 + (i % 10) * 14, PY + Math.floor(i / 10) * 14];
  const slot = (i: number): [number, number] => { const [x, y] = boxXY(Math.floor(i / k)); return [x + 10 + (i % k) * SD, y + 12]; };
  const t0 = 1.0, STEP = Math.min(0.22, 5 / n), FLY = 0.35, packed = t0 + n * STEP + FLY, judge = packed + 0.6, fin = judge + 1.6;
  return anim({
    dur: fin + 3, w: W, h: H, label: `${n} pakataan ${k} kerrallaan`,
    frame: (t) => {
      let s = `<text x="${W / 2}" y="18" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor" opacity="0.6">${n} palloa, laatikkoon mahtuu ${k}</text>`;
      for (let b = 0; b < B; b++) {
        const [x, y] = boxXY(b), full = b < q, show = ease(t, t0 + b * k * STEP - 0.2, t0 + b * k * STEP);
        const col = t >= judge ? (full ? OK : BAD) : 'currentColor';
        s += `<rect x="${x}" y="${y}" width="${bw}" height="24" rx="6" fill="color-mix(in srgb, var(--pond) 16%, transparent)" stroke="${col}" stroke-width="${t >= judge ? 2.2 : 1.4}" opacity="${show}"/>`;
        for (let j = 0; j < k; j++) s += `<circle cx="${x + 10 + j * SD}" cy="${y + 12}" r="4.5" fill="none" stroke="currentColor" stroke-opacity="0.18" opacity="${show}"/>`;
      }
      for (let i = 0; i < n; i++) {
        const a = ease(t, t0 + i * STEP, t0 + i * STEP + FLY), [px, py] = pile(i), [sx, sy] = slot(i);
        const x = px + (sx - px) * a, y = py + (sy - py) * a - Math.sin(a * Math.PI) * 18;
        const left = Math.floor(i / k) >= q;
        const fill = t >= judge && left ? BAD : DOT;
        s += `<circle cx="${x}" cy="${y}" r="5" fill="${fill}"/>`;
      }
      if (t >= packed) {
        let c = 0; for (let b = 0; b < q; b++) { const [x, y] = boxXY(b); c = b + 1; s += `<text x="${x + bw / 2}" y="${y + 36}" text-anchor="middle" font-size="10" font-weight="700" fill="currentColor" opacity="${ease(t, packed + b * 0.04, packed + 0.3 + b * 0.04) * 0.7}">${c}</text>`; }
      }
      if (t >= fin) {
        const ok = rem === 0;
        s += `<text x="${W / 2}" y="${H - 10}" text-anchor="middle" font-size="18" font-weight="800" fill="${ok ? OK : BAD}" opacity="${ease(t, fin, fin + 0.5)}">${n} : ${k} = ${q}${ok ? ' ✓ jaollinen' : `, jää ${rem} ✗`}</text>`;
      }
      return s;
    },
    caption: (t) => {
      if (t < t0) return `Pakataan ${n} palloa laatikoihin, joihin mahtuu ${k}.`;
      if (t < packed) return `Pallot menevät laatikkoon ${Math.min(Math.floor((t - t0) / STEP / k) + 1, B)}…`;
      if (t < judge) return `${q} täyttä laatikkoa.`;
      if (t < fin) return rem ? `Mutta ${rem} ${rem === 1 ? 'pallo jää' : 'palloa jää'} yli: viimeinen laatikko on vajaa.` : 'Kaikki laatikot ovat täynnä, mitään ei jää yli.';
      return rem ? `${n} ei ole jaollinen luvulla ${k}: jakojäännös ${rem}.` : `${n} on jaollinen luvulla ${k}: jakojäännös 0.`;
    },
  });
}

/** Frog jumps k squares at a time on a 1–50 board; the landing squares' last digits repeat. */
export function skipScene(k: number, max = 50): AnimPaint {
  const W = 320, CW = 28, CH = 24, X0 = (W - 10 * CW) / 2, Y0 = 26, rows = Math.ceil(max / 10), H = Y0 + rows * CH + 46;
  const hits = Array.from({ length: Math.floor(max / k) }, (_, i) => (i + 1) * k);
  const digits = [...new Set(hits.map((h) => h % 10))].sort((a, b) => a - b);
  const cell = (v: number): [number, number] => [X0 + ((v - 1) % 10) * CW, Y0 + Math.floor((v - 1) / 10) * CH];
  const t0 = 0.8, JT = Math.min(0.55, 7 / hits.length), done = t0 + hits.length * JT, cols = done + 0.6, fin = cols + 1.8;
  const fill = k === 2 ? '#4f8fd6' : k === 5 ? '#d9822b' : '#3e9b54';
  return anim({
    dur: fin + 3, w: W, h: H, label: `${k} kerrallaan hyppien`,
    frame: (t) => {
      let s = '';
      // Highlighted last-digit columns.
      if (t >= cols) for (const d of digits) { const [x] = cell(d === 0 ? 10 : d); s += `<rect x="${x + 1}" y="${Y0 - 4}" width="${CW - 2}" height="${rows * CH + 8}" rx="6" fill="none" stroke="${fill}" stroke-width="2.5" opacity="${ease(t, cols, cols + 0.5)}"/>`; }
      const landed = t < t0 ? 0 : Math.min(hits.length, Math.floor((t - t0) / JT) + 1);
      for (let v = 1; v <= max; v++) {
        const [x, y] = cell(v), on = hits.indexOf(v), lit = on >= 0 && on < landed;
        s += `<rect x="${x + 2}" y="${y + 2}" width="${CW - 4}" height="${CH - 4}" rx="4" fill="${lit ? fill : 'currentColor'}" fill-opacity="${lit ? 0.85 : 0.06}"/>`;
        s += `<text x="${x + CW / 2}" y="${y + CH / 2 + 4}" text-anchor="middle" font-size="11" font-weight="${lit ? 800 : 500}" fill="${lit ? '#fff' : 'currentColor'}" opacity="${lit ? 1 : 0.65}">${v}</text>`;
      }
      if (t >= t0 && t < done) {
        const i = Math.min(hits.length - 1, Math.floor((t - t0) / JT)), a = ease(t, t0 + i * JT, t0 + i * JT + JT * 0.7);
        const [fx, fy] = cell(hits[i]!), [px, py] = i > 0 ? cell(hits[i - 1]!) : [X0 - CW, Y0];
        const x = px + (fx - px) * a + CW / 2, y = py + (fy - py) * a - Math.sin(a * Math.PI) * 14 + 2;
        s += frog(x, y, 9);
      }
      if (t >= fin) s += `<text x="${W / 2}" y="${H - 12}" text-anchor="middle" font-size="15" font-weight="800" fill="currentColor" opacity="${ease(t, fin, fin + 0.5)}">${k}:lla jaollinen päättyy: ${digits.join(', ')}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < t0) return `Loikka hyppää ${k} ruutua kerrallaan.`;
      if (t < done) { const i = Math.min(hits.length - 1, Math.floor((t - t0) / JT)); return `${hits.slice(Math.max(0, i - 3), i + 1).join(', ')}…`; }
      if (t < fin) return 'Katso osumien viimeisiä numeroita: ne ovat aina samoissa sarakkeissa.';
      return `Luvulla ${k} jaollinen luku päättyy numeroon ${digits.length > 1 ? digits.slice(0, -1).join(', ') + ' tai ' + digits[digits.length - 1] : digits[0]}.`;
    },
  });
}
