// Geometry shown in time: a solid pressed into sand leaves a flat print (seen first at an angle, then
// from above), and a flat shape turned edge-on shrinks to a line while a solid can be lifted up.
import { anim, ease, type AnimPaint } from '../ui/anim';
import { SHAPE_NAME, SOLID, SOLID_NAME, SOLID_PRINT, type ShapeKind, type SolidKind, COLOR } from './parts';

/** Place one of the SOLID drawings (size s) with its top-left corner at (x, y). */
const solidAt = (k: SolidKind, x: number, y: number, s: number, op = 1) =>
  `<g transform="translate(${x} ${y})" opacity="${op}">${SOLID[k](s).replace('width="100%"', `width="${s + 8}" height="${s + 8}"`)}</g>`;
/** A flat shape centred at (x, y), size s (same geometry as shapeSvg). */
export function flatAt(k: ShapeKind, x: number, y: number, s: number, fill: string, stroke = 'currentColor') {
  switch (k) {
    case 'ympyra': return `<circle cx="${x}" cy="${y}" r="${s * 0.45}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
    case 'nelio': return `<rect x="${x - s * 0.4}" y="${y - s * 0.4}" width="${s * 0.8}" height="${s * 0.8}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
    case 'kolmio': return `<path d="M${x} ${y - s * 0.45} L${x + s * 0.48} ${y + s * 0.4} L${x - s * 0.48} ${y + s * 0.4}Z" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>`;
    default: return `<rect x="${x - s * 0.5}" y="${y - s * 0.28}" width="${s}" height="${s * 0.56}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
  }
}
const SAND = '#ecd49a', DENT = '#c7a65e';
const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1);

/** Solid k is lowered into sand, pressed and lifted away; the print is seen at an angle and then
 *  (when `reveal`) from straight above, where its true shape shows. */
export function pressScene(k: SolidKind, reveal = true): AnimPaint {
  const W = 300, H = 220, CX = 150, CY = 150, S = 76, print = SOLID_PRINT[k], ps = k === 'pallo' ? 34 : 60;
  const tDown = 0.6, tHit = 1.7, tUp = 2.5, tGone = 3.5, tTop = 4.0, tEnd = 5.2;
  return anim({
    dur: (reveal ? tEnd : tGone + 0.6) + 2.6, w: W, h: H, label: `${SOLID_NAME[k]} painetaan hiekkaan`,
    frame: (t) => {
      // the ground squash goes from 0.42 (seen at an angle) to 1 (seen from above)
      const sy = 0.42 + 0.58 * (reveal ? ease(t, tTop, tEnd) : 0);
      const dent = ease(t, tHit, tHit + 0.3);
      let s = `<g transform="translate(0 ${CY}) scale(1 ${sy}) translate(0 ${-CY})">`;
      s += `<rect x="20" y="${CY - 80}" width="260" height="140" rx="18" fill="${SAND}" stroke="#b8975a" stroke-width="2"/>`;
      for (let i = 0; i < 14; i++) s += `<circle cx="${34 + ((i * 53) % 236)}" cy="${CY - 70 + ((i * 37) % 122)}" r="1.6" fill="#b8975a"/>`;
      if (dent > 0) s += `<g opacity="${dent}">${flatAt(print, CX, CY, ps, DENT, '#8a6a2c')}</g>`;
      s += '</g>';
      // the solid: drops, presses a little, then lifts away and fades
      const drop = ease(t, tDown, tHit), press = ease(t, tHit, tHit + 0.3) - ease(t, tUp, tUp + 0.3), lift = ease(t, tUp, tGone);
      // bottom of each drawing (from its top-left) and the x of its base centre
      const bot = { kuutio: 4 + 0.92 * S, pallo: 4 + S, tolkki: 0.94 * S, kartio: 0.94 * S }[k], mid = k === 'kuutio' ? 4 + 0.31 * S : (S + 8) / 2;
      const y = -S - 10 + (CY + 2 - bot + S + 10) * drop + 6 * press - 160 * lift;
      if (lift < 1) s += solidAt(k, CX - mid, y, S, 1 - lift * 0.8);
      if (reveal && t > tEnd) s += `<text x="${CX}" y="34" text-anchor="middle" font-size="20" font-weight="900" fill="var(--pond)" opacity="${ease(t, tEnd, tEnd + 0.5)}">Jälki on ${SHAPE_NAME[print][0]}</text>`;
      if (!reveal && t > tGone) s += `<text x="${CX}" y="34" text-anchor="middle" font-size="22" font-weight="900" fill="var(--pond)" opacity="${ease(t, tGone, tGone + 0.5)}">Millainen jälki?</text>`;
      return s;
    },
    caption: (t) => t < tHit ? `${cap(SOLID_NAME[k])} lasketaan hiekkaan…` : t < tUp ? 'Painetaan…' : t < tGone ? 'Nostetaan pois. Hiekkaan jäi jälki.'
      : !reveal ? 'Millainen jälki hiekkaan jäi? Kuvittele katsovasi suoraan ylhäältä.' : t < tEnd ? 'Katsotaan jälkeä suoraan ylhäältä…' : `Jälki on ${SHAPE_NAME[print][0]}: litteä kuvio. ${cap(SOLID_NAME[k])} on kappale.`,
  });
}

/** A solid is lifted up off the table, while a flat shape drawn on paper is turned edge-on: it
 *  becomes a thin line because it has no thickness. */
export function edgeScene(k: SolidKind, f: ShapeKind, color: keyof typeof COLOR = 'punainen'): AnimPaint {
  const W = 320, H = 200, BASE = 160, LX = 80, RX = 236;
  const l0 = 0.6, l1 = 1.6, l2 = 2.6, r0 = 3.0, r1 = 4.6, r2 = 6.2, r3 = 7.2;
  return anim({
    dur: r3 + 2.4, w: W, h: H, label: `${SOLID_NAME[k]} ja paperille piirretty ${SHAPE_NAME[f][0]}`,
    frame: (t) => {
      let s = `<line x1="10" y1="${BASE}" x2="${W - 10}" y2="${BASE}" stroke="currentColor" stroke-width="2"/>`;
      // left: the solid is lifted up and put back
      const up = 46 * (ease(t, l0, l1) - ease(t, l2 - 0.2, l2 + 0.6)), S = 74;
      s += `<ellipse cx="${LX}" cy="${BASE + 2}" rx="${32 - up * 0.25}" ry="5" fill="currentColor" opacity="${0.18 - up * 0.002}"/>`;
      s += solidAt(k, LX - (S + 8) / 2, BASE - S - 4 - up, S);
      if (up > 30) s += `<text x="${LX}" y="22" text-anchor="middle" font-size="14" font-weight="800" fill="var(--pond)">ylös käteen!</text>`;
      // right: the paper card turns about its vertical axis
      const turn = ease(t, r0, r1) - ease(t, r2, r3), sx = Math.max(0.03, Math.cos(turn * Math.PI / 2));
      s += `<g transform="translate(${RX} 0) scale(${sx} 1) translate(${-RX} 0)">`;
      s += `<rect x="${RX - 48}" y="${BASE - 100}" width="96" height="96" fill="var(--card, #fffdf6)" stroke="currentColor" stroke-width="${2 / sx > 6 ? 6 : 2 / sx}"/>`;
      if (sx > 0.08) s += flatAt(f, RX, BASE - 52, 64, (COLOR as Record<string, string>)[color]!);
      s += '</g>';
      if (turn > 0.95) s += `<text x="${RX}" y="22" text-anchor="middle" font-size="14" font-weight="800" fill="var(--pond)">vain viiva!</text>`;
      return s;
    },
    caption: (t) => t < l0 ? `Vasemmalla ${SOLID_NAME[k]}, oikealla paperille piirretty ${SHAPE_NAME[f][0]}.` : t < r0 ? `${cap(SOLID_NAME[k])} on kappale: sen voi nostaa käteen.`
      : t < r1 ? 'Käännetään paperi sivuttain…' : t < r2 ? `Sivulta katsottuna ${SHAPE_NAME[f][0]} on vain viiva: sillä ei ole paksuutta. Se on litteä kuvio.` : 'Käännetään takaisin.',
  });
}

/** Corners of a flat shape of size s centred at (x, y), rotated rot degrees (empty for a circle). */
function corners(k: ShapeKind, x: number, y: number, s: number, rot = 0): [number, number][] {
  const P: [number, number][] = k === 'kolmio' ? [[0, -0.45], [0.48, 0.4], [-0.48, 0.4]]
    : k === 'nelio' ? [[-0.4, -0.4], [0.4, -0.4], [0.4, 0.4], [-0.4, 0.4]]
    : k === 'suorakulmio' ? [[-0.5, -0.28], [0.5, -0.28], [0.5, 0.28], [-0.5, 0.28]] : [];
  const c = Math.cos((rot * Math.PI) / 180), sn = Math.sin((rot * Math.PI) / 180);
  return P.map(([u, v]) => [x + s * (u * c - v * sn), y + s * (u * sn + v * c)]);
}
export const fillOf = (color: string) => (COLOR as Record<string, string>)[color] ?? color;
const PEN = (x: number, y: number) => `<g transform="translate(${x} ${y})"><circle r="7" fill="var(--sun)" stroke="currentColor" stroke-width="2"/><circle r="2.5" fill="currentColor"/></g>`;

/** A pen traces the outline side by side; each corner it reaches lights up (numbered when `reveal`),
 *  then the shape fills in. A circle is traced round without a single corner. */
export function traceScene(k: ShapeKind, color = 'sininen', rot = 0, reveal = true): AnimPaint {
  const W = 260, H = 210, CX = 130, CY = 112, S = 150, t0 = 0.7, per = 1.1;
  const P = corners(k, CX, CY, S, rot), n = P.length, R = S * 0.45;
  const end = t0 + (n ? n * per : 3.2), name = SHAPE_NAME[k][0];
  return anim({
    dur: end + 3, w: W, h: H, label: `${name} piirretään`,
    frame: (t) => {
      let s = '';
      const u = Math.max(0, t - t0), filled = ease(t, end, end + 0.6);
      if (!n) {
        const a = Math.min(1, u / 3.2) * 2 * Math.PI, a0 = -Math.PI / 2;
        if (filled > 0) s += `<circle cx="${CX}" cy="${CY}" r="${R}" fill="${fillOf(color)}" opacity="${filled}"/>`;
        if (a > 0.01) s += `<path d="M${CX} ${CY - R} A${R} ${R} 0 ${a > Math.PI ? 1 : 0} 1 ${CX + R * Math.cos(a0 + a)} ${CY + R * Math.sin(a0 + a)}" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`;
        if (t < end) s += PEN(CX + R * Math.cos(a0 + a), CY + R * Math.sin(a0 + a));
        return s;
      }
      const side = Math.min(n, Math.floor(u / per)), f = t >= end ? 1 : (u / per) % 1;
      if (filled > 0) s += `<path d="M${P.map((p) => p.join(' ')).join(' L')}Z" fill="${fillOf(color)}" opacity="${filled}"/>`;
      let d = `M${P[0]![0]} ${P[0]![1]}`;
      for (let i = 0; i < side; i++) d += ` L${P[(i + 1) % n]![0]} ${P[(i + 1) % n]![1]}`;
      let px = P[side % n]![0], py = P[side % n]![1];
      if (side < n) { const a = P[side]!, b = P[(side + 1) % n]!, g = ease(f, 0, 0.8); px = a[0] + (b[0] - a[0]) * g; py = a[1] + (b[1] - a[1]) * g; d += ` L${px} ${py}`; }
      s += `<path d="${d}" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>`;
      // corners reached so far: the start corner counts when the pen comes back to it
      for (let i = 1; i <= side; i++) {
        const c = P[i % n]!, pop = ease(t, t0 + i * per - 0.25, t0 + i * per), ox = c[0] - CX, oy = c[1] - CY, L = Math.hypot(ox, oy) || 1;
        s += `<circle cx="${c[0]}" cy="${c[1]}" r="${4 + 4 * pop}" fill="var(--red)"/>`;
        if (reveal) s += `<text x="${c[0] + (ox / L) * 18}" y="${c[1] + (oy / L) * 18 + 6}" text-anchor="middle" font-size="17" font-weight="900" fill="var(--red)" opacity="${pop}">${i}</text>`;
      }
      if (t < end) s += PEN(px, py);
      return s;
    },
    caption: (t) => {
      if (t < t0) return 'Kynä kiertää kuvion reunan.';
      if (!n) return t < end ? 'Kynä kiertää… se ei käänny missään.' : reveal ? 'Kaari kiersi ympäri ilman yhtään kulmaa: ympyrä.' : 'Kääntyikö kynä missään?';
      const side = Math.min(n, Math.floor((t - t0) / 1.1));
      if (t < end) return reveal ? `Sivu ${side + 1}…${side ? ` kulmia ${side}` : ''}` : 'Kynä piirtää sivua…';
      return reveal ? `${cap(word2(n))} suoraa sivua ja ${word2(n)} kulmaa: ${name}.` : 'Montako kulmaa kuviossa on?';
    },
  });
}
const word2 = (n: number) => (['nolla', 'yksi', 'kaksi', 'kolme', 'neljä'][n] ?? String(n));

/** A shape turns slowly; its numbered corners turn with it, and the name stays the same. */
export function turnScene(k: ShapeKind, color = 'sininen', to = 45): AnimPaint {
  const W = 260, H = 214, CX = 130, CY = 100, S = 112, t0 = 0.8, t1 = 3.6, name = SHAPE_NAME[k][0];
  return anim({
    dur: t1 + 3, w: W, h: H, label: `${name} käännetään`,
    frame: (t) => {
      const rot = to * ease(t, t0, t1), P = corners(k, CX, CY, S, rot), P0 = corners(k, CX, CY, S, 0);
      let s = `<path d="M${P0.map((p) => p.join(' ')).join(' L')}Z" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="5 5" opacity="0.35"/>`;
      s += `<path d="M${P.map((p) => p.join(' ')).join(' L')}Z" fill="${fillOf(color)}" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>`;
      P.forEach((c, i) => { const ox = c[0] - CX, oy = c[1] - CY, L = Math.hypot(ox, oy); s += `<circle cx="${c[0]}" cy="${c[1]}" r="6" fill="var(--red)"/><text x="${c[0] + (ox / L) * 18}" y="${c[1] + (oy / L) * 18 + 6}" text-anchor="middle" font-size="16" font-weight="900" fill="var(--red)">${i + 1}</text>`; });
      if (t > t1) s += `<text x="${CX}" y="${H - 4}" text-anchor="middle" font-size="18" font-weight="900" fill="var(--pond)" opacity="${ease(t, t1, t1 + 0.5)}">yhä ${name}</text>`;
      return s;
    },
    caption: (t) => t < t0 ? `Tämä on ${name}.` : t < t1 ? 'Käännetään…' : `Kuvio on vinossa, mutta sivut ja kulmat ovat samat: se on yhä ${name}.`,
  });
}

/** Shapes leave a pile one at a time; each is checked against the rule (caption asks the question)
 *  and slides into its box. Used to show that only the named property decides. */
export function sortScene(items: { k: ShapeKind; c: string }[], bins: string[], binOf: (i: number) => number, ask: (i: number) => string, verdict: string): AnimPaint {
  const W = 320, H = 228, t0 = 0.8, per = 1.3, n = items.length, end = t0 + n * per, S = 34;
  const pile = items.map((_, i) => [30 + (i * (W - 60)) / Math.max(1, n - 1), 40] as [number, number]);
  const bw = (W - 20 - (bins.length - 1) * 10) / bins.length, by = 112;
  const count = bins.map(() => 0), slot: [number, number][] = [];
  items.forEach((_, i) => { const b = binOf(i), k = count[b]!++; slot.push([10 + b * (bw + 10) + 22 + (k % 3) * ((bw - 44) / 2), by + 48 + Math.floor(k / 3) * 42]); });
  return anim({
    dur: end + 2.6, w: W, h: H, label: `Lajittelu: ${bins.join(' ja ')}`,
    frame: (t) => {
      let s = bins.map((b, j) => `<rect x="${10 + j * (bw + 10)}" y="${by}" width="${bw}" height="${H - by - 4}" rx="12" fill="var(--pond-soft)" stroke="var(--pond)" stroke-width="2" stroke-dasharray="6 4"/><text x="${10 + j * (bw + 10) + bw / 2}" y="${by + 18}" text-anchor="middle" font-size="13" font-weight="800" fill="var(--pond)">${b}</text>`).join('');
      items.forEach((it, i) => {
        const a = t0 + i * per, look = ease(t, a, a + 0.35), go = ease(t, a + 0.55, a + per - 0.1);
        const [x0, y0] = pile[i]!, [x1, y1] = slot[i]!, x = x0 + (x1 - x0) * go, y = y0 + (y1 - y0) * go - 26 * Math.sin(go * Math.PI);
        if (look > 0 && go < 1) s += `<circle cx="${x}" cy="${y}" r="${S * 0.72}" fill="none" stroke="var(--sun)" stroke-width="${4 * look}"/>`;
        s += flatAt(it.k, x, y, S, fillOf(it.c));
      });
      return s;
    },
    caption: (t) => {
      if (t < t0) return 'Kasa kuvioita. Lajitellaan ne yksi kerrallaan.';
      if (t >= end) return verdict;
      return ask(Math.min(n - 1, Math.floor((t - t0) / per)));
    },
  });
}
