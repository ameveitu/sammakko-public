// Times-table tricks as a dot array that changes: rows of k dots are laid one at a time, then
// one row is taken away (9×), added (6×, 7×) or the whole block is copied (8×).
import { anim, ease, type AnimPaint } from '../ui/anim';

const BASE = '#4f8fd6', MINUS = 'var(--red)', PLUS = '#3e9b54', COPY = '#d9822b';

/** a × k shown with the trick for a = 6, 7, 8 or 9. */
export function trickScene(a: number, k: number): AnimPaint {
  const plan = a === 9 ? { base: 10, mode: 'minus' as const, d: 1 } : a === 8 ? { base: 4, mode: 'double' as const, d: 4 } : { base: 5, mode: 'plus' as const, d: a - 5 };
  const W = 320, DX = 16, DY = 15, X0 = 26, Y0 = 26, R = 5.5, rowsMax = Math.max(plan.base, a);
  const H = Y0 + rowsMax * DY + 34;
  const RT = 0.32, t0 = 0.8, built = t0 + plan.base * RT, change = built + 1.4, changed = change + (plan.mode === 'double' ? 1.6 : 1.0 + 0.5 * plan.d), fin = changed + 0.8;
  const LX = X0 + k * DX + 14;
  const row = (y: number, col: string, op = 1, dx = 0) => Array.from({ length: k }, (_, c) => `<circle cx="${X0 + c * DX + dx}" cy="${y}" r="${R}" fill="${col}" opacity="${op}"/>`).join('');
  const txt = (y: number, s: string, col = 'currentColor', op = 1, size = 15) => `<text x="${LX}" y="${y}" font-size="${size}" font-weight="800" fill="${col}" opacity="${op}">${s}</text>`;
  const V = plan.base * k;
  return anim({
    dur: fin + 3, w: W, h: H, label: `${a} × ${k} = ${a * k}`,
    frame: (t) => {
      let s = '';
      const shown = Math.min(plan.base, Math.floor((t - t0) / RT) + 1);
      for (let i = 0; i < shown && t >= t0; i++) {
        const y = Y0 + i * DY, p = ease(t, t0 + i * RT, t0 + i * RT + 0.25);
        if (plan.mode === 'minus' && i === plan.base - 1) {
          const q = ease(t, change, change + 1.0);
          s += row(y, q > 0 ? MINUS : BASE, p * (1 - 0.85 * ease(t, change + 0.5, change + 1.0)), 70 * ease(t, change + 0.3, change + 1.0));
        } else s += row(y, BASE, p);
      }
      if (t >= t0 && t < built + 0.2) s += txt(Y0 + (shown - 1) * DY + 5, `${shown} × ${k} = ${shown * k}`, BASE);
      if (t >= built + 0.2) {
        s += `<path d="M ${LX - 6} ${Y0 - 6} L ${LX - 2} ${Y0 - 6} L ${LX - 2} ${Y0 + (plan.base - 1) * DY + 6} L ${LX - 6} ${Y0 + (plan.base - 1) * DY + 6}" fill="none" stroke="${BASE}" stroke-width="2"/>`;
        s += txt(Y0 + (plan.base - 1) * DY / 2 + 5, `${plan.base} × ${k} = ${V}`, BASE, ease(t, built + 0.2, built + 0.6) * (1 - 0.6 * ease(t, changed, fin)));
      }
      if (plan.mode === 'plus') for (let j = 0; j < plan.d; j++) {
        const ts = change + j * 0.5, p = ease(t, ts, ts + 0.7);
        if (p > 0) s += row(Y0 + (plan.base + j) * DY + 30 * (1 - p), PLUS, p);
      }
      if (plan.mode === 'double') {
        const p = ease(t, change, change + 1.4);
        if (p > 0) for (let i = 0; i < plan.base; i++) s += row(Y0 + i * DY + plan.base * DY * p, COPY, 0.4 + 0.6 * p);
      }
      if (t >= change + 0.3 && plan.mode !== 'minus') {
        const yy = Y0 + (plan.base + (plan.mode === 'double' ? plan.base : plan.d) / 2 - 0.5) * DY + 5;
        s += txt(yy, plan.mode === 'double' ? `+ ${V}` : `+ ${plan.d * k}`, plan.mode === 'double' ? COPY : PLUS, ease(t, change + 0.3, change + 0.8));
      }
      if (plan.mode === 'minus' && t >= change + 0.3) s += `<text x="${X0 + k * DX + 80}" y="${Y0 + (plan.base - 1) * DY + 5}" font-size="15" font-weight="800" fill="${MINUS}" opacity="${ease(t, change + 0.3, change + 0.8)}">− ${k}</text>`;
      if (t >= changed) {
        const rowsNow = a;
        s += `<rect x="${X0 - 10}" y="${Y0 - 10}" width="${k * DX + 4}" height="${(rowsNow - 1) * DY + 20}" rx="6" fill="none" stroke="var(--ok)" stroke-width="2.5" opacity="${ease(t, changed, changed + 0.4)}"/>`;
        s += `<text x="${W / 2}" y="${H - 8}" text-anchor="middle" font-size="18" font-weight="800" fill="currentColor" opacity="${ease(t, changed + 0.2, fin)}">${a} × ${k} = ${plan.mode === 'minus' ? `${V} − ${k}` : `${V} + ${plan.mode === 'double' ? V : plan.d * k}`} = ${a * k}</text>`;
      }
      return s;
    },
    caption: (t) => {
      if (t < t0) return `${a} × ${k}: ${a} riviä, joissa kussakin ${k}. Käytetään helpompaa taulua.`;
      if (t < built + 0.2) return `Ensin ${plan.base} riviä: ${plan.base} × ${k} on helppo.`;
      if (t < change) return `${plan.base} × ${k} = ${V}.`;
      if (t < changed) return plan.mode === 'minus' ? `Mutta rivejä pitää olla ${a}, ei 10: yksi rivi pois, ${V} − ${k}.` : plan.mode === 'double' ? `Kahdeksan riviä on kaksi kertaa neljä riviä: tuplataan ${V}.` : `Rivejä pitää olla ${a}: lisätään ${plan.d === 1 ? 'yksi rivi' : `${plan.d} riviä`}, ${plan.d === 1 ? k : `${plan.d} × ${k} = ${plan.d * k}`}.`;
      return `${a} × ${k} = ${a * k}.`;
    },
  });
}

/** a × b as a rows of b dots; then a column is added (up) or taken away: a × (b ± 1) = a × b ± a. */
export function neighbourScene(a: number, b: number, up: boolean): AnimPaint {
  const nb = up ? b + 1 : b - 1, cols = Math.max(b, nb);
  const DX = 16, DY = 15, R = 5.5, X0 = 26, Y0 = 26, W = 320, H = Y0 + a * DY + 40;
  const t0 = 0.6, built = t0 + 1.2, change = built + 1.6, changed = change + 1.4, fin = changed + 0.6;
  const LX = X0 + cols * DX + 16 + (up ? 0 : 40);
  return anim({
    dur: fin + 3, w: W, h: H, label: `${a} × ${nb} = ${a} × ${b} ${up ? '+' : '−'} ${a}`,
    frame: (t) => {
      let s = '';
      const pB = ease(t, t0, built);
      for (let r = 0; r < a; r++) for (let c = 0; c < b; c++) {
        const last = !up && c === b - 1, q = last ? ease(t, change, change + 1.0) : 0;
        s += `<circle cx="${X0 + c * DX + 30 * q}" cy="${Y0 + r * DY}" r="${R}" fill="${q > 0 ? 'var(--red)' : '#4f8fd6'}" opacity="${pB * (1 - 0.85 * q)}"/>`;
      }
      if (up) {
        for (let r = 0; r < a; r++) {
          const p = ease(t, change + r * 0.08, change + r * 0.08 + 0.7);
          if (p > 0) s += `<circle cx="${X0 + b * DX + 40 * (1 - p)}" cy="${Y0 + r * DY}" r="${R}" fill="#3e9b54" opacity="${p}"/>`;
        }
      }
      s += `<text x="${LX}" y="${Y0 + 5}" font-size="15" font-weight="800" fill="#4f8fd6" opacity="${ease(t, built, built + 0.4) * (1 - 0.6 * ease(t, changed, fin))}">${a} × ${b} = ${a * b}</text>`;
      if (t >= change + 0.4) s += `<text x="${LX}" y="${Y0 + 26}" font-size="15" font-weight="800" fill="${up ? '#3e9b54' : 'var(--red)'}" opacity="${ease(t, change + 0.4, change + 0.9)}">${up ? '+' : '−'} ${a}</text>`;
      if (t >= changed) s += `<rect x="${X0 - 10}" y="${Y0 - 10}" width="${(nb - 1) * DX + 20}" height="${(a - 1) * DY + 20}" rx="6" fill="none" stroke="var(--ok)" stroke-width="2.5" opacity="${ease(t, changed, changed + 0.4)}"/><text x="${W / 2}" y="${H - 10}" text-anchor="middle" font-size="18" font-weight="800" fill="currentColor" opacity="${ease(t, changed + 0.2, fin)}">${a} × ${nb} = ${a * b} ${up ? '+' : '−'} ${a} = ${a * nb}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < built) return `${a} × ${b}: ${a} riviä, joissa kussakin ${b}.`;
      if (t < change) return `Tämä tiedetään: ${a} × ${b} = ${a * b}.`;
      if (t < changed) return up ? `${a} × ${nb}: jokaiseen riviin yksi lisää. Uusi sarake on ${a}.` : `${a} × ${nb}: jokaisesta rivistä yksi pois. Pois lähtee ${a}.`;
      return `${a} × ${nb} = ${a * b} ${up ? '+' : '−'} ${a} = ${a * nb}.`;
    },
  });
}

/** ? × b = prod: rows of b are added one at a time with a running total until prod is reached. */
export function factorScene(b: number, prod: number): AnimPaint {
  const n = prod / b, DX = 16, DY = 15, R = 5.5, X0 = 26, Y0 = 26, W = 320, H = Y0 + n * DY + 40;
  const t0 = 1.0, RT = 0.75, done = t0 + n * RT, fin = done + 0.8;
  const LX = X0 + b * DX + 16;
  return anim({
    dur: fin + 3, w: W, h: H, label: `? × ${b} = ${prod}`,
    frame: (t) => {
      let s = '';
      const k = Math.min(n, Math.floor((t - t0) / RT) + 1);
      for (let r = 0; r < k && t >= t0; r++) {
        const p = ease(t, t0 + r * RT, t0 + r * RT + 0.35);
        for (let c = 0; c < b; c++) s += `<circle cx="${X0 + c * DX}" cy="${Y0 + r * DY - 10 * (1 - p)}" r="${R}" fill="#4f8fd6" opacity="${p}"/>`;
        s += `<text x="${LX}" y="${Y0 + r * DY + 5}" font-size="13" font-weight="700" fill="${r === k - 1 ? 'currentColor' : 'var(--muted, #888)'}" opacity="${p}">${r + 1} × ${b} = ${(r + 1) * b}${r === n - 1 ? ' ✓' : ''}</text>`;
      }
      s += `<text x="${W - 12}" y="${Y0 + 5}" text-anchor="end" font-size="16" font-weight="800" fill="var(--red)">tavoite ${prod}</text>`;
      if (t >= done) s += `<rect x="${X0 - 10}" y="${Y0 - 10}" width="${(b - 1) * DX + 20}" height="${(n - 1) * DY + 20}" rx="6" fill="none" stroke="var(--ok)" stroke-width="2.5" opacity="${ease(t, done, done + 0.4)}"/><text x="${W / 2}" y="${H - 10}" text-anchor="middle" font-size="18" font-weight="800" fill="currentColor" opacity="${ease(t, done + 0.2, fin)}">${n} riviä: ${n} × ${b} = ${prod}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < t0) return `? × ${b} = ${prod}: montako ${b}:n riviä tarvitaan, jotta tulee ${prod}?`;
      if (t < done) { const k = Math.min(n, Math.floor((t - t0) / RT) + 1); return `${k} riviä: ${k * b}${k * b < prod ? ` — vielä alle ${prod}.` : '.'}`; }
      return `Puuttuva tekijä on ${n}, koska ${n} × ${b} = ${prod}.`;
    },
  });
}

/** k × g first as a sum of k groups of g in one line, then the groups slide into rows: same dots, two ways to write. */
export function repeatScene(k: number, g: number): AnimPaint {
  const W = 320, GAP = 20, DX = Math.min(13, (W - 24 - (k - 1) * GAP) / (k * g)), R = Math.min(5, DX * 0.4);
  const lineW = k * g * DX + (k - 1) * GAP, LX0 = (W - lineW) / 2 + DX / 2, LY = 40;
  const AX0 = (W - g * 16) / 2 + 8, AY0 = 116, H = AY0 + k * 16 + 50;
  const t0 = 0.6, GT = 0.9, line = t0 + k * GT, move = line + 1.2, moved = move + 1.4, fin = moved + 0.6;
  const C = ['#4f8fd6', '#3e9b54', '#d9822b', '#8a5cc7', '#c94f7c'];
  const lx = (gi: number, j: number) => LX0 + (gi * g + j) * DX + gi * GAP;
  const sum = (m: number) => Array(m).fill(g).join(' + ');
  return anim({
    dur: fin + 3, w: W, h: H, label: `${k} × ${g} = ${sum(k)}`,
    frame: (t) => {
      let s = '';
      for (let gi = 0; gi < k; gi++) {
        const app = ease(t, t0 + gi * GT, t0 + gi * GT + 0.4), m = ease(t, move + gi * 0.15, move + gi * 0.15 + 1.0);
        for (let j = 0; j < g; j++) {
          const x = lx(gi, j) + (AX0 + j * 16 - lx(gi, j)) * m, y = LY + (AY0 + gi * 16 - LY) * m - Math.sin(m * Math.PI) * 10;
          s += `<circle cx="${x}" cy="${y - 12 * (1 - app)}" r="${R + (5 - R) * m}" fill="${C[gi % C.length]}" opacity="${app}"/>`;
        }
        if (gi > 0) s += `<text x="${lx(gi, 0) - GAP / 2 - DX / 2}" y="${LY + 5}" text-anchor="middle" font-size="15" font-weight="800" fill="currentColor" opacity="${app * (1 - m)}">+</text>`;
        s += `<text x="${(lx(gi, 0) + lx(gi, g - 1)) / 2}" y="${LY + 24}" text-anchor="middle" font-size="12" font-weight="700" fill="${C[gi % C.length]}" opacity="${app * (1 - m)}">${g}</text>`;
        s += `<text x="${AX0 - 22}" y="${AY0 + gi * 16 + 4}" text-anchor="end" font-size="11" font-weight="700" fill="${C[gi % C.length]}" opacity="${ease(t, moved - 0.4, moved)}">${gi + 1}.</text>`;
      }
      const done = t < t0 ? 0 : Math.min(k, Math.floor((t - t0) / GT) + 1);
      if (done > 0) s += `<text x="${W / 2}" y="${LY + 48}" text-anchor="middle" font-size="16" font-weight="800" fill="currentColor" opacity="${1 - 0.45 * ease(t, move, move + 0.5)}">${sum(done)} = ${done * g}</text>`;
      if (t >= moved) s += `<rect x="${AX0 - 10}" y="${AY0 - 10}" width="${(g - 1) * 16 + 20}" height="${(k - 1) * 16 + 20}" rx="6" fill="none" stroke="var(--ok)" stroke-width="2.5" opacity="${ease(t, moved, moved + 0.4)}"/><text x="${W / 2}" y="${H - 14}" text-anchor="middle" font-size="18" font-weight="800" fill="currentColor" opacity="${ease(t, moved + 0.2, fin)}">${sum(k)} = ${k} × ${g} = ${k * g}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < line) return `Yhteenlasku: ${g} lisätään yhä uudelleen.`;
      if (t < move) return `${k} kertaa ${g}: kirjoittaminen käy pitkäksi.`;
      if (t < moved) return `Samat ryhmät allekkain: ${k} riviä, joissa kussakin ${g}.`;
      return `Sama määrä, kaksi tapaa: ${sum(k)} = ${k} × ${g} = ${k * g}.`;
    },
  });
}

/** 1/n of whole: the dots are dealt into n equal groups, then one group is lifted out. */
export function fracShareScene(n: number, whole: number): AnimPaint {
  const W = 320, q = whole / n, PY = 34, cols = Math.min(whole, 12), DX = 16;
  const PX0 = (W - (cols - 1) * DX) / 2;
  const GW = Math.min(70, (W - 20) / n - 10), GX0 = (W - (n * (GW + 10) - 10)) / 2, GY = 34 + Math.ceil(whole / 12) * 16 + 30, GH = 30 + Math.ceil(q / 3) * 14, H = GY + GH + 64;
  const t0 = 0.8, ST = Math.min(0.22, 4.5 / whole), dealt = t0 + whole * ST + 0.4, pick = dealt + 1.0, fin = pick + 1.6;
  const pile = (i: number): [number, number] => [PX0 + (i % 12) * DX, PY + Math.floor(i / 12) * 16];
  const dest = (i: number): [number, number] => { const g = i % n, j = Math.floor(i / n); return [GX0 + g * (GW + 10) + GW / 2 - 14 + (j % 3) * 14, GY + 16 + Math.floor(j / 3) * 14]; };
  return anim({
    dur: fin + 3, w: W, h: H, label: `1/${n} luvusta ${whole}`,
    frame: (t) => {
      let s = `<text x="${W / 2}" y="16" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor" opacity="0.6">${whole} kiveä jaetaan ${n} yhtä suureen osaan</text>`;
      for (let g = 0; g < n; g++) {
        const hi = g === 0 && t >= pick;
        s += `<rect x="${GX0 + g * (GW + 10)}" y="${GY}" width="${GW}" height="${GH}" rx="8" fill="${hi ? 'color-mix(in srgb, var(--ok) 22%, transparent)' : 'color-mix(in srgb, var(--pond) 14%, transparent)'}" stroke="${hi ? 'var(--ok)' : 'currentColor'}" stroke-width="${hi ? 2.5 : 1.2}"/>`;
        s += `<text x="${GX0 + g * (GW + 10) + GW / 2}" y="${GY + GH + 16}" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor" opacity="0.6">1/${n}</text>`;
      }
      for (let i = 0; i < whole; i++) {
        const a = ease(t, t0 + i * ST, t0 + i * ST + 0.35), [px, py] = pile(i), [dx, dy] = dest(i);
        const hi = i % n === 0 && t >= pick;
        s += `<circle cx="${px + (dx - px) * a}" cy="${py + (dy - py) * a - Math.sin(a * Math.PI) * 14}" r="5" fill="${hi ? 'var(--ok)' : '#8a7d6b'}"/>`;
      }
      if (t >= pick) s += `<text x="${GX0 + GW / 2}" y="${GY - 8}" text-anchor="middle" font-size="15" font-weight="800" fill="var(--ok)" opacity="${ease(t, pick, pick + 0.4)}">${q}</text>`;
      if (t >= fin) s += `<text x="${W / 2}" y="${H - 14}" text-anchor="middle" font-size="18" font-weight="800" fill="currentColor" opacity="${ease(t, fin, fin + 0.5)}">1/${n} luvusta ${whole} = ${whole} : ${n} = ${q}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < t0) return `${whole} kiveä. Paljonko on 1/${n} niistä?`;
      if (t < dealt) return `Jaetaan vuorotellen ${n} osaan, yksi kerrallaan.`;
      if (t < pick) return `Jokaisessa osassa on yhtä monta: ${q}.`;
      if (t < fin) return `Yksi osa = 1/${n}. Siinä on ${q}.`;
      return `Murto-osa ja jakolasku kertovat saman: ${whole} : ${n} = ${q}.`;
    },
  });
}
