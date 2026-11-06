// Perimeter as a walk: Loikka hops round the edge of a shape, a red tape is laid behind it and
// each side is added to the running sum. At the end the tape is pulled straight: the perimeter
// is one length.
import { anim, ease, type AnimPaint } from '../ui/anim';
import { frog } from '../ui/art';

type Pt = [number, number];

/** The boundary of a set of grid cells as a closed clockwise list of unit steps. */
export function cellBoundary(cells: Pt[]): Pt[] {
  const set = new Set(cells.map(([c, r]) => `${c},${r}`));
  const next = new Map<string, Pt>();
  for (const [c, r] of cells) {
    if (!set.has(`${c},${r - 1}`)) next.set(`${c},${r}`, [c + 1, r]);
    if (!set.has(`${c + 1},${r}`)) next.set(`${c + 1},${r}`, [c + 1, r + 1]);
    if (!set.has(`${c},${r + 1}`)) next.set(`${c + 1},${r + 1}`, [c, r + 1]);
    if (!set.has(`${c - 1},${r}`)) next.set(`${c},${r + 1}`, [c, r]);
  }
  const start = [...cells].sort((p, q) => p[1] - q[1] || p[0] - q[0])[0]!;
  const out: Pt[] = [[start[0], start[1]]];
  let cur: Pt = next.get(`${start[0]},${start[1]}`)!;
  for (let g = 0; g < 200 && !(cur[0] === start[0] && cur[1] === start[1]); g++) { out.push(cur); cur = next.get(`${cur[0]},${cur[1]}`)!; }
  return out;
}

/** Walk round the polygon `pts` (grid units, clockwise). `count`: number every unit side (grid
 *  shapes); otherwise each side gets its length and is added to the sum. */
export function perimScene(o: { pts: Pt[]; unit: string; count?: boolean; cells?: Pt[]; sideLabels?: number[] }): AnimPaint {
  const n = o.pts.length, W = 320;
  const xs = o.pts.map((p) => p[0]), ys = o.pts.map((p) => p[1]);
  const gw = Math.max(...xs) - Math.min(...xs), gh = Math.max(...ys) - Math.min(...ys);
  const U = Math.min(o.count ? 40 : 30, 220 / gw, 120 / gh), X0 = (W - gw * U) / 2 - Math.min(...xs) * U, Y0 = 30 - Math.min(...ys) * U;
  const P = (p: Pt): Pt => [X0 + p[0] * U, Y0 + p[1] * U];
  const sides = o.pts.map((p, i) => { const q = o.pts[(i + 1) % n]!; return { a: p, b: q, len: o.sideLabels?.[i] ?? Math.hypot(q[0] - p[0], q[1] - p[1]) }; });
  const total = sides.reduce((s, x) => s + x.len, 0);
  // Timing: per unit in count mode, per side otherwise.
  const SPD = o.count ? 0.42 : 0.5, t0 = 1.0;
  const starts: number[] = []; let t = t0;
  sides.forEach((s) => { starts.push(t); t += (o.count ? Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]) * SPD : 1.1 + 0.12 * s.len) + (o.count ? 0 : 0.5); });
  const walkEnd = t, LY = Y0 + gh * U + 66, LU = Math.min(U, 280 / total), LX = (W - total * LU) / 2, fin = walkEnd + 3.2;
  const H = LY + 40;
  const pos = (tt: number): { p: Pt; k: number; f: number } => {
    for (let k = sides.length - 1; k >= 0; k--) if (tt >= starts[k]!) {
      const s = sides[k]!, dur = (k + 1 < n ? starts[k + 1]! : walkEnd) - starts[k]! - (o.count ? 0 : 0.5), f = Math.min(1, (tt - starts[k]!) / dur);
      const A = P(s.a), B = P(s.b); return { p: [A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f], k, f };
    }
    return { p: P(o.pts[0]!), k: -1, f: 0 };
  };
  return anim({
    dur: fin + 2.5, w: W, h: H, label: `Piiri on ${total} ${o.unit}`,
    frame: (tt) => {
      let s = '';
      if (o.cells) {
        for (const [c, r] of o.cells) { const [x, y] = P([c, r]); s += `<rect x="${x}" y="${y}" width="${U}" height="${U}" fill="color-mix(in srgb, var(--sun) 45%, transparent)" stroke="currentColor" stroke-opacity=".2"/>`; }
      } else s += `<polygon points="${o.pts.map((p) => P(p).join(',')).join(' ')}" fill="var(--card)" stroke="currentColor" stroke-width="2"/>`;
      const w = tt >= walkEnd ? { p: P(o.pts[0]!), k: n, f: 1 } : pos(tt);
      // Tape laid so far.
      const path: Pt[] = [P(o.pts[0]!)];
      for (let k = 0; k < Math.min(w.k, n); k++) path.push(P(sides[k]!.b));
      if (w.k >= 0 && w.k < n) path.push(w.p);
      if (path.length > 1) s += `<polyline points="${path.map((p) => p.join(',')).join(' ')}" fill="none" stroke="var(--red)" stroke-width="6" stroke-linejoin="round" stroke-linecap="round" opacity="${1 - 0.5 * ease(tt, walkEnd + 0.4, walkEnd + 1.2)}"/>`;
      // Labels: a number on every unit side, or the length of each finished side.
      sides.forEach((sd, k) => {
        const reached = tt >= walkEnd || k < w.k || (k === w.k && w.f >= 1);
        const A = P(sd.a), B = P(sd.b), dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy), nx = dy / L, ny = -dx / L;
        if (o.count) {
          const before = sides.slice(0, k).reduce((q, x) => q + x.len, 0);
          for (let u = 0; u < sd.len; u++) {
            const shown = tt >= walkEnd || k < w.k || (k === w.k && w.f * sd.len >= u + 1);
            if (!shown) continue;
            const mx = A[0] + dx * (u + 0.5) / sd.len + nx * 9, my = A[1] + dy * (u + 0.5) / sd.len + ny * 10 + 4;
            s += `<text x="${mx}" y="${my}" text-anchor="middle" font-size="12" font-weight="800" fill="var(--red)">${before + u + 1}</text>`;
          }
        } else if (reached) {
          const side = Math.abs(nx) > 0.5, mx = (A[0] + B[0]) / 2 + nx * (side ? 9 : 16), my = (A[1] + B[1]) / 2 + ny * 16 + 5;
          s += `<text x="${mx}" y="${my}" text-anchor="${side ? (nx > 0 ? 'start' : 'end') : 'middle'}" font-size="15" font-weight="800" fill="var(--red)">${sd.len} ${o.unit}</text>`;
        }
      });
      if (tt < walkEnd + 0.3) s += frog(w.p[0], w.p[1] - 6, 9);
      // The tape pulled straight.
      const pS = ease(tt, walkEnd + 0.6, walkEnd + 2.0);
      if (pS > 0) {
        let x = LX;
        sides.forEach((sd, k) => {
          const len = sd.len * LU * Math.min(1, Math.max(0, pS * n - k));
          if (len > 0) s += `<rect x="${x}" y="${LY - 6}" width="${len}" height="12" fill="${k % 2 ? 'var(--red)' : 'color-mix(in srgb, var(--red) 60%, white)'}"/>`;
          if (len >= sd.len * LU - 0.5 && !o.count) s += `<text x="${x + sd.len * LU / 2}" y="${LY - 12}" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor">${sd.len}</text>`;
          x += sd.len * LU;
        });
        const pT = ease(tt, walkEnd + 2.0, walkEnd + 2.6);
        if (pT > 0) s += `<line x1="${LX}" y1="${LY + 12}" x2="${LX + total * LU}" y2="${LY + 12}" stroke="currentColor" stroke-width="1.5" opacity="${pT}"/><text x="${W / 2}" y="${LY + 30}" text-anchor="middle" font-size="16" font-weight="800" fill="var(--red)" opacity="${pT}">${total} ${o.unit}</text>`;
      }
      return s;
    },
    caption: (tt) => {
      if (tt < t0) return 'Loikka kiertää kuvion reunaa pitkin ja vetää nauhaa perässään.';
      if (tt >= walkEnd) return tt < walkEnd + 2.0 ? 'Nauha vedetään suoraksi: piiri on yksi pituus.' : `Piiri on ${total} ${o.unit}. Koko reunaviiva, ei sisäpuoli.`;
      const w = pos(tt);
      if (o.count) {
        const sd = sides[w.k]!, before = sides.slice(0, w.k).reduce((q, x) => q + x.len, 0);
        return `Lasketaan ruudun sivut reunalla: ${before + Math.floor(w.f * sd.len + 1e-9)}…`;
      }
      const doneLens = sides.slice(0, w.f >= 1 ? w.k + 1 : w.k).map((x) => x.len);
      return doneLens.length === 1 ? `Ensimmäinen sivu: ${doneLens[0]} ${o.unit}. Seuraava…` : doneLens.length ? `${doneLens.join(' + ')} = ${doneLens.reduce((a, b) => a + b, 0)} ${o.unit}${doneLens.length < n ? ' …' : ''}` : `Ensimmäinen sivu: ${sides[0]!.len} ${o.unit}.`;
    },
  });
}
