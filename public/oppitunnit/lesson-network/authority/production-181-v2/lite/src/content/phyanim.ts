// Pond laboratory animations: an instrument measures for real (the stopwatch runs real seconds, the
// tape unrolls, the scale settles), then the result is split into quantity, number and unit.
import { anim, ease, type AnimPaint } from '../ui/anim';
import { fmt } from './fi';
import { thermoInner } from './pics';
import { stopwatch } from './timeanim';

export type MeasKind = 'pituus' | 'massa' | 'aika' | 'lämpötila';
const UNIT: Record<MeasKind, string> = { pituus: 'm', massa: 'kg', aika: 's', lämpötila: '°C' };
const TOOL: Record<MeasKind, string> = { pituus: 'Mittanauha', massa: 'Vaaka', aika: 'Sekuntikello', lämpötila: 'Lämpömittari' };
const PART_COL = { q: 'var(--pond)', n: 'var(--sun)', u: 'var(--red, #d9534f)' };
type Part = 'q' | 'n' | 'u';
const PART_NAME: Record<Part, string> = { q: 'suure', n: 'lukuarvo', u: 'yksikkö' };

/** Result chips "massa = 0,4 kg" with coloured brackets and part names under them. `g` = per-part
 *  appearance (0..1); `hi` = the part to emphasise. */
function resultChips(y: number, W: number, q: string, num: string, unit: string, g: Record<Part, number>, hi?: Part) {
  const cw = 11.5, wq = Math.max(q.length * cw + 14, 48), wn = Math.max(num.length * cw + 14, 66), wu = Math.max(unit.length * cw + 14, 62), eq = 26;
  let x = (W - (wq + eq + wn + 10 + wu)) / 2;
  const box = (p: Part, text: string, w: number) => {
    const a = g[p], X = x; x += w;
    if (a <= 0) return '';
    const strong = !hi || hi === p;
    return `<g opacity="${a * (strong ? 1 : 0.55)}"><rect x="${X}" y="${y - 22}" width="${w}" height="32" rx="8" fill="var(--card)" stroke="${PART_COL[p]}" stroke-width="${hi === p ? 4 : 2.5}"/>` +
      `<text x="${X + w / 2}" y="${y}" text-anchor="middle" font-size="20" font-weight="900" fill="currentColor">${text}</text>` +
      `<text x="${X + w / 2}" y="${y + 28}" text-anchor="middle" font-size="12" font-weight="800" fill="${PART_COL[p]}">${PART_NAME[p]}</text></g>`;
  };
  let s = box('q', q, wq);
  if (g.q > 0) s += `<text x="${x + eq / 2}" y="${y}" text-anchor="middle" font-size="20" font-weight="900" fill="var(--soft)" opacity="${g.n}">=</text>`;
  x += eq;
  s += box('n', num, wn); x += 10;
  s += box('u', unit, wu);
  return s;
}

/** The instrument at work, read at value `cur` of final `v`. Drawn in the band y 10…140. */
function instrument(k: MeasKind, v: number, cur: number, running: boolean, W: number) {
  if (k === 'aika') {
    const fx = 30 + (W - 150) * Math.min(1, cur / v);
    return `<line x1="20" y1="112" x2="${W - 110}" y2="112" stroke="var(--line)" stroke-width="3"/><text x="${fx}" y="${104 - (running ? Math.abs(Math.sin(cur * Math.PI * 2)) * 18 : 0)}" text-anchor="middle" font-size="26">🐸</text>` +
      stopwatch(W - 56, 60, Math.floor(cur + 1e-6), running) +
      `<rect x="${W - 92}" y="104" width="72" height="24" rx="6" fill="#1b2a22"/><text x="${W - 56}" y="121" text-anchor="middle" font-size="14" font-weight="900" fill="#9be08a">${fmt(Math.floor(cur * 10) / 10)} s</text>`;
  }
  if (k === 'lämpötila') {
    const max = v > 30 ? 40 : 30;
    return `<path d="M40 76 h160 v52 a8 8 0 0 1 -8 8 h-144 a8 8 0 0 1 -8 -8 z" fill="#8ec9ef" opacity=".55" stroke="currentColor" stroke-width="2"/><text x="150" y="112" text-anchor="middle" font-size="13" font-weight="800" fill="currentColor">vesi</text>` +
      `<g transform="translate(50 4) scale(0.62)">${thermoInner(cur, 0, max)}</g>` +
      `<rect x="${W - 96}" y="40" width="80" height="28" rx="6" fill="#1b2a22"/><text x="${W - 56}" y="59" text-anchor="middle" font-size="15" font-weight="900" fill="#9be08a">${fmt(Math.round(cur * 10) / 10)} °C</text>`;
  }
  if (k === 'massa') {
    const drop = Math.min(1, cur / v * 3);
    return `<text x="${W / 2}" y="${30 + 52 * drop}" text-anchor="middle" font-size="34">${v >= 20 ? '🧑' : '🐸'}</text>` +
      `<rect x="${W / 2 - 60}" y="92" width="120" height="10" rx="4" fill="#7c8a96"/><rect x="${W / 2 - 70}" y="102" width="140" height="34" rx="8" fill="var(--card)" stroke="currentColor" stroke-width="2.5"/>` +
      `<rect x="${W / 2 - 40}" y="108" width="80" height="22" rx="5" fill="#1b2a22"/><text x="${W / 2}" y="124" text-anchor="middle" font-size="15" font-weight="900" fill="#9be08a">${fmt(Math.round(cur * 10) / 10)} kg</text>`;
  }
  // pituus: a tape unrolls along a log
  const L = W - 60, px = (m: number) => 30 + (L * m) / v;
  let s = `<rect x="30" y="54" width="${L}" height="26" rx="12" fill="#b07b4f" stroke="#6b4423" stroke-width="2"/><text x="${30 + L / 2}" y="44" text-anchor="middle" font-size="12" font-weight="800" fill="var(--soft)">tukki</text>`;
  s += `<rect x="30" y="86" width="${px(cur) - 30}" height="20" fill="#f6d65b" stroke="currentColor" stroke-width="1.5"/>`;
  const step = v > 6 ? 2 : v > 2.5 ? 1 : 0.5;
  for (let m = 0; m <= cur + 1e-6; m += step) s += `<line x1="${px(m)}" y1="86" x2="${px(m)}" y2="96" stroke="currentColor" stroke-width="1.5"/><text x="${px(m)}" y="120" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor">${fmt(m)}</text>`;
  s += `<rect x="${px(cur) - 3}" y="82" width="10" height="28" rx="3" fill="#555"/>`;
  return s;
}

/** An instrument measures for real, then the reading is written as "suure = luku yksikkö", one part at a
 *  time. Time is measured in real seconds. */
export function measureScene(k: MeasKind, v: number, hi?: Part): AnimPaint {
  const W = 320, H = 210, t0 = 0.5, MD = k === 'aika' ? v : 2.6, tM = t0 + MD, P = 1.1, tC = tM + 0.5, tEnd = tC + 3 * P;
  const unit = UNIT[k];
  return anim({
    dur: tEnd + 2.6, w: W, h: H, label: `${k} = ${fmt(v)} ${unit}`,
    frame: (t) => {
      const m = Math.min(1, Math.max(0, (t - t0) / MD)), cur = k === 'aika' ? v * m : v * (k === 'massa' ? 1 - Math.pow(1 - m, 3) : ease(t, t0, tM));
      let s = instrument(k, v, cur, t >= t0 && t < tM, W);
      const g = { q: ease(t, tC, tC + 0.4), n: ease(t, tC + P, tC + P + 0.4), u: ease(t, tC + 2 * P, tC + 2 * P + 0.4) };
      s += resultChips(170, W, k, fmt(v), unit, g, t >= tEnd ? hi : undefined);
      return s;
    },
    caption: (t) => {
      if (t < t0) return `${TOOL[k]} on valmiina.`;
      if (t < tM) return k === 'aika' ? `Sammakko loikkii, ja sekuntikello käy: ${Math.floor(t - t0)} s.` : `${TOOL[k]} mittaa…`;
      if (t < tC + P) return `Mitattiin suuretta ${k}. Suure on ominaisuus, jonka voi mitata.`;
      if (t < tC + 2 * P) return `Lukuarvo ${fmt(v)} kertoo, kuinka paljon.`;
      if (t < tEnd) return `Yksikkö ${unit} kertoo, mihin verrattiin.`;
      return hi === 'n' ? `Lukuarvo on pelkkä luku ${fmt(v)}, ilman yksikköä.` : hi === 'u' ? `Yksikkö on ${unit}. Ilman sitä luku ${fmt(v)} ei kerro mitään.` : `${k[0]!.toUpperCase() + k.slice(1)} = ${fmt(v)} ${unit}: suure, lukuarvo ja yksikkö.`;
    },
  });
}

/** Every instrument tries to measure the frog's colour and gives up with "?". */
export function notQtyScene(): AnimPaint {
  const W = 320, H = 206, tools: [string, string][] = [['📏', 'mittanauha'], ['⚖️', 'vaaka'], ['⏱️', 'sekuntikello'], ['🌡️', 'lämpömittari']], t0 = 0.8, P = 1.4, tEnd = t0 + tools.length * P;
  return anim({
    dur: tEnd + 3, w: W, h: H, label: 'Väri ei ole suure',
    frame: (t) => {
      let s = `<circle cx="${W / 2}" cy="64" r="34" fill="#4caf6a" stroke="currentColor" stroke-width="2"/><text x="${W / 2}" y="76" text-anchor="middle" font-size="34">🐸</text><text x="${W / 2}" y="118" text-anchor="middle" font-size="13" font-weight="800" fill="currentColor">väri: vihreä</text>`;
      tools.forEach(([e], i) => {
        const a = t0 + i * P, x = 40 + i * 80, mv = ease(t, a, a + 0.5), q = ease(t, a + 0.5, a + 0.8);
        if (t < a) { s += `<text x="${x}" y="176" text-anchor="middle" font-size="26">${e}</text>`; return; }
        const live = t < a + P;
        const cx = x + (W / 2 + 56 - x) * mv * (live ? 1 : 0), cy = 176 - 110 * mv * (live ? 1 : 0);
        s += `<text x="${cx}" y="${cy}" text-anchor="middle" font-size="26" opacity="${live ? 1 : 0.6}">${e}</text>`;
        if (q > 0) s += `<text x="${x}" y="198" text-anchor="middle" font-size="16" font-weight="900" fill="var(--bad)" opacity="${q}">? ✗</text>`;
      });
      const g = ease(t, tEnd + 0.2, tEnd + 0.7);
      if (g > 0) s += `<rect x="${W / 2 - 120}" y="128" width="240" height="26" rx="8" fill="var(--bad)" opacity="${0.15 * g}"/><text x="${W / 2}" y="146" text-anchor="middle" font-size="14" font-weight="900" fill="var(--bad)" opacity="${g}">ei lukua, ei yksikköä → ei suure ✗</text>`;
      return s;
    },
    caption: (t) => {
      if (t < t0) return 'Voiko sammakon värin mitata?';
      if (t >= tEnd) return 'Väriä ei ilmaista luvulla ja yksiköllä. Väri ei ole suure.';
      const i = Math.min(tools.length - 1, Math.floor((t - t0) / P));
      return `Kokeillaan: ${tools[i]![1]}. Se ei anna väristä mitään lukua.`;
    },
  });
}

/** The same number with two units, drawn to scale: first v small units, then v big units, one big unit
 *  at a time. */
export function unitSizeScene(v: number, big: string, small: string, ratio: number, name: string): AnimPaint {
  const W = 320, H = 190, L = 280, X0 = 20, per = L / v, t0 = 0.6, tB = t0 + 2, P = 0.8, tEnd = tB + v * P;
  const sw = Math.max(2, per / ratio * v);
  return anim({
    dur: tEnd + 3, w: W, h: H, label: `${v} ${big} ja ${v} ${small}`,
    frame: (t) => {
      let s = '';
      const g1 = ease(t, t0, t0 + 0.8);
      if (g1 > 0) {
        s += `<text x="${X0}" y="40" font-size="15" font-weight="900" fill="currentColor">${v} ${small}</text>`;
        s += `<rect x="${X0}" y="50" width="${sw * g1}" height="18" fill="var(--sun)" stroke="currentColor" stroke-width="1.5"/>`;
        if (t > t0 + 1) s += `<text x="${X0 + sw + 10}" y="64" font-size="13" font-weight="800" fill="var(--soft)">← näin pieni</text>`;
      }
      if (t >= tB - 0.4) s += `<text x="${X0}" y="104" font-size="15" font-weight="900" fill="currentColor">${v} ${big}</text>`;
      for (let i = 0; i < v; i++) {
        const g = ease(t, tB + i * P, tB + i * P + 0.5);
        if (g <= 0) continue;
        s += `<rect x="${X0 + i * per}" y="114" width="${per * g}" height="18" fill="${i % 2 ? '#7fc59a' : 'var(--pond)'}" stroke="currentColor" stroke-width="1.5"/>`;
        if (g >= 1) s += `<text x="${X0 + i * per + per / 2}" y="150" text-anchor="middle" font-size="11" font-weight="800" fill="currentColor">1 ${big}</text>`;
      }
      const g = ease(t, tEnd + 0.2, tEnd + 0.7);
      if (g > 0) s += `<text x="${W / 2}" y="180" text-anchor="middle" font-size="16" font-weight="900" fill="var(--bad)" opacity="${g}">${v} ${big} ≠ ${v} ${small}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < tB) return `${name} ${v} ${small}: pätkä on pikkuruinen.`;
      if (t < tEnd) return `${v} ${big}: ${Math.min(v, Math.floor((t - tB) / P) + 1)} ${big}…`;
      return `Sama luku ${v}, mutta ${big} on ${ratio} kertaa ${small}. Yksikkö kertoo, mihin verrattiin.`;
    },
  });
}

/** Unit conversion on a bar of `total` small units cut into blocks of `factor` (= 1 big unit). For
 *  'mul' the big units are labelled first and each opens into `factor` small units; for 'div' the
 *  small units are bundled into big ones, the leftover becoming a decimal. */
export function convScene(total: number, factor: number, big: string, small: string, dir: 'mul' | 'div'): AnimPaint {
  const W = 320, H = 200, X0 = 16, L = 288, bigV = total / factor, n = Math.ceil(bigV - 1e-9), bw = L / Math.max(bigV, 1) , t0 = 0.6, P = 1.1, tEnd = t0 + 0.8 + n * P;
  const fromTxt = dir === 'mul' ? `${fmt(bigV)} ${big}` : `${fmt(total)} ${small}`, toTxt = dir === 'mul' ? `${fmt(total)} ${small}` : `${fmt(bigV)} ${big}`;
  return anim({
    dur: tEnd + 3.4, w: W, h: H, label: `${fromTxt} = ${toTxt}`,
    frame: (t) => {
      let s = `<text x="${W / 2}" y="26" text-anchor="middle" font-size="18" font-weight="900" fill="currentColor">${fromTxt} = ${t >= tEnd ? toTxt : '?'}</text>`;
      s += `<text x="${W / 2}" y="42" text-anchor="middle" font-size="12" font-weight="800" fill="var(--soft)">1 ${big} = ${fmt(factor)} ${small}</text>`;
      const g = ease(t, t0, t0 + 0.6), barW = Math.min(L, bw * bigV);
      s += `<rect x="${X0}" y="78" width="${barW * g}" height="26" rx="4" fill="var(--pond-soft)" stroke="currentColor" stroke-width="2"/>`;
      let cum = 0;
      for (let i = 0; i < n; i++) {
        const a = t0 + 0.8 + i * P, gg = ease(t, a, a + 0.5);
        if (gg <= 0) break;
        const part = Math.min(1, bigV - i), x = X0 + i * bw, w = bw * part;
        cum = Math.min(total, (i + part) * factor);
        s += `<rect x="${x}" y="78" width="${w}" height="26" fill="${i % 2 ? '#7fc59a' : 'var(--pond)'}" opacity="${0.85 * gg}" stroke="currentColor" stroke-width="1.5"/>`;
        s += `<path d="M${x + 2} 112 v6 h${w - 4} v-6" fill="none" stroke="currentColor" stroke-width="1.5" opacity="${gg}"/>`;
        const top = part < 1 ? `${fmt(part)} ${big}` : `1 ${big}`, bot = `${fmt(part * factor)} ${small}`;
        s += `<text x="${x + w / 2}" y="70" text-anchor="middle" font-size="11" font-weight="900" fill="currentColor" opacity="${gg}">${dir === 'mul' ? top : bot}</text>`;
        s += `<text x="${x + w / 2}" y="134" text-anchor="middle" font-size="11" font-weight="900" fill="var(--pond)" opacity="${gg}">${dir === 'mul' ? bot : top}</text>`;
      }
      if (t >= t0 + 0.8) {
        const k = Math.min(n, Math.floor((t - t0 - 0.8) / P) + 1);
        const run = dir === 'mul' ? `${fmt(Math.min(total, Math.min(k, bigV) * factor))} ${small}` : `${fmt(Math.min(k, bigV))} ${big}`;
        s += `<text x="${W / 2}" y="162" text-anchor="middle" font-size="16" font-weight="900" fill="var(--pond)">${t >= tEnd ? '' : run}</text>`;
      }
      const e = ease(t, tEnd, tEnd + 0.5);
      if (e > 0) s += `<text x="${W / 2}" y="164" text-anchor="middle" font-size="16" font-weight="900" fill="var(--ok)" opacity="${e}">${dir === 'mul' ? `${fmt(bigV)} · ${fmt(factor)} ${small} = ${fmt(total)} ${small}` : `${fmt(total)} / ${fmt(factor)} ${big} = ${fmt(bigV)} ${big}`}</text>` +
        `<text x="${W / 2}" y="188" text-anchor="middle" font-size="12" font-weight="800" fill="var(--soft)" opacity="${e}">${dir === 'mul' ? 'isosta pieneen: kerro' : 'pienestä isoon: jaa'}</text>`;
      void cum;
      return s;
    },
    caption: (t) => {
      if (t < t0 + 0.8) return `Muunnetaan ${fromTxt}. Yksi ${big} on ${fmt(factor)} ${small}.`;
      if (t < tEnd) {
        const k = Math.min(n, Math.floor((t - t0 - 0.8) / P) + 1), part = Math.min(1, bigV - (k - 1));
        return dir === 'mul' ? (part < 1 ? `Vielä ${fmt(part)} ${big} = ${fmt(part * factor)} ${small}.` : `${k}. ${big}: ${fmt(factor)} ${small} lisää.`) : (part < 1 ? `Jäljelle jää ${fmt(part * factor)} ${small}. Se on ${fmt(part)} ${big}.` : `${fmt(factor)} ${small} on 1 ${big}. Nyt ${k} ${big}.`);
      }
      return dir === 'mul' ? `Isosta yksiköstä pieneen kerrotaan: ${fromTxt} = ${toTxt}.` : `Pienestä yksiköstä isoon jaetaan: ${fromTxt} = ${toTxt}.`;
    },
  });
}

export type Role = 'q' | 's' | 'n' | 'u';
const ROLE_COL: Record<Role, string> = { q: 'var(--pond)', s: '#9b6bd6', n: 'var(--sun)', u: 'var(--red, #d9534f)' };
const ROLE_NAME: Record<Role, string> = { q: 'suure', s: 'tunnus', n: 'lukuarvo', u: 'yksikkö' };

/** A written result such as "s = 12,5 km" is taken apart: each piece in turn gets a coloured frame and
 *  its role name. With `trap` a wrong reading of the number (e.g. "12") is tried first and crossed out. */
export function partsScene(pieces: { text: string; role?: Role }[], opts: { trap?: string; focus?: Role } = {}): AnimPaint {
  const W = 320, H = 170, cw = 13, gap = 8, Y = 70;
  const ws = pieces.map((p) => Math.max(p.text.length * cw + 16, p.role ? ROLE_NAME[p.role].length * 7.4 + 8 : 0));
  const total = ws.reduce((a, b) => a + b, 0) + gap * (pieces.length - 1);
  const xs: number[] = []; let x = (W - total) / 2; ws.forEach((w) => { xs.push(x); x += w + gap; });
  const roles = pieces.map((p, i) => [p, i] as const).filter(([p]) => p.role);
  const t0 = 1.0, P = 1.3, tR = t0 + roles.length * P, trapI = pieces.findIndex((p) => p.role === 'n');
  const tT = tR + 0.3, tEnd = opts.trap ? tT + 2.6 : tR, k = Math.min(1, (W - 12) / total);
  return anim({
    dur: tEnd + 2.6, w: W, h: H, label: pieces.map((p) => p.text).join(' '),
    frame: (t) => {
      let s = k < 1 ? `<g transform="translate(${W / 2} ${Y}) scale(${k}) translate(${-W / 2} ${-Y})">` : '';
      pieces.forEach((p, i) => {
        const a = ease(t, 0.1 + i * 0.15, 0.4 + i * 0.15);
        const k = roles.findIndex(([, j]) => j === i), on = k >= 0 ? ease(t, t0 + k * P, t0 + k * P + 0.4) : 0;
        const dim = opts.focus && t >= tEnd && p.role !== opts.focus;
        if (on > 0 && p.role) s += `<rect x="${xs[i]}" y="${Y - 30}" width="${ws[i]}" height="42" rx="9" fill="var(--card)" stroke="${ROLE_COL[p.role]}" stroke-width="${opts.focus === p.role && t >= tEnd ? 4.5 : 3}" opacity="${on * (dim ? 0.45 : 1)}"/>` +
          `<text x="${xs[i]! + ws[i]! / 2}" y="${Y + 34}" text-anchor="middle" font-size="12" font-weight="900" fill="${ROLE_COL[p.role]}" opacity="${on * (dim ? 0.45 : 1)}">${ROLE_NAME[p.role]}</text>`;
        s += `<text x="${xs[i]! + ws[i]! / 2}" y="${Y}" text-anchor="middle" font-size="24" font-weight="900" fill="${p.role ? 'currentColor' : 'var(--soft)'}" opacity="${a * (dim ? 0.45 : 1)}">${p.text}</text>`;
      });
      if (opts.trap && trapI >= 0 && t >= tT) {
        const num = pieces[trapI]!.text, i = trapI, x0 = xs[i]! + ws[i]! / 2 - (num.length * cw) / 2;
        const g1 = ease(t, tT, tT + 0.4), g2 = ease(t, tT + 1.2, tT + 1.6), tw = opts.trap.length * cw;
        if (t < tT + 2.4) {
          s += `<rect x="${x0 - 3}" y="${Y - 26}" width="${tw + 6}" height="34" rx="6" fill="none" stroke="var(--bad)" stroke-width="3" stroke-dasharray="5 3" opacity="${g1}"/>`;
          if (g2 > 0) s += `<line x1="${x0}" y1="${Y + 8}" x2="${x0 + tw}" y2="${Y - 24}" stroke="var(--bad)" stroke-width="3" opacity="${g2}"/><text x="${x0 + tw / 2}" y="${Y - 38}" text-anchor="middle" font-size="13" font-weight="900" fill="var(--bad)" opacity="${g2}">${opts.trap}? ✗</text>`;
        }
        const g3 = ease(t, tT + 2.2, tT + 2.6);
        if (g3 > 0) s += `<text x="${xs[i]! + ws[i]! / 2}" y="${Y - 40}" text-anchor="middle" font-size="13" font-weight="900" fill="var(--ok)" opacity="${g3}">koko ${num} ✓</text>`;
      }
      return k < 1 ? s + '</g>' : s;
    },
    caption: (t) => {
      if (t < t0) return `Tulos: ${pieces.map((p) => p.text).join(' ')}.`;
      if (t < tR) {
        const [p] = roles[Math.min(roles.length - 1, Math.floor((t - t0) / P))]!;
        return { q: `${p.text}: suure, eli mitä mitattiin.`, s: `${p.text}: suureen tunnus, lyhyt merkki suureelle.`, n: `${p.text}: lukuarvo, eli kuinka paljon.`, u: `${p.text}: yksikkö, eli mihin verrattiin.` }[p.role!];
      }
      if (opts.trap && t < tEnd) return t < tT + 2.2 ? `Onko lukuarvo vain ${opts.trap}? Ei: desimaaliosa kuuluu lukuun.` : `Lukuarvo on koko luku ${pieces[trapI]!.text}.`;
      const f = opts.focus ? pieces.find((p) => p.role === opts.focus) : undefined;
      return f ? `${ROLE_NAME[opts.focus!][0]!.toUpperCase() + ROLE_NAME[opts.focus!].slice(1)} on ${f.text}.` : 'Jokaisella osalla on oma tehtävänsä.';
    },
  });
}

const STAIR = ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'];

/** Unit staircase km … mm: the frog hops from `from` to `to`, one step = ×10 (down) or :10 (up).
 *  The digits stay in their cells while the comma slides one cell per hop; needed zeros fade in
 *  green and trailing decimal zeros fade out. `v` must be exact in the smaller unit. */
export function stairScene(v: number, from: string, to: string): AnimPaint {
  const a = STAIR.indexOf(from), b = STAIR.indexOf(to), k = b - a, dir = Math.sign(k), steps = Math.abs(k);
  const lo = Math.max(a, b), N = Math.round(v * 10 ** (lo - a)), ds = String(N), L = ds.length;
  const dec = (j: number) => lo - (a + dir * j); // decimals at state j
  const P = Math.max(L, dec(0) + 1, dec(steps) + 1), dig = (p: number) => (p < L ? ds[L - 1 - p]! : '0');
  const vis = (p: number, j: number) => {
    const d = dec(j);
    if (p >= L) return p <= d;
    if (p < d) for (let q = 0; q <= p; q++) if (dig(q) !== '0') return true; else if (q === p) return false;
    return true;
  };
  const valTxt = (j: number) => fmt(N / 10 ** dec(j));
  const W = 320, H = 274, CW = 26, RX = W / 2 + (P * CW) / 2 - 20, cx = (p: number) => RX - p * CW - CW / 2;
  const SX = 13, SW = 42, sy = (i: number) => 116 + i * 16, scx = (i: number) => SX + i * SW + SW / 2;
  const t0 = 1.2, HP = 1.3, tEnd = t0 + steps * HP;
  const state = (t: number) => Math.max(0, Math.min(steps, (t - t0) / HP));
  return anim({
    dur: tEnd + 3.6, w: W, h: H, label: `${valTxt(0)} ${from} = ${valTxt(steps)} ${to}`,
    frame: (t) => {
      const m = state(t), j = Math.floor(m), f = ease(m - j, 0.15, 0.85), done = t >= tEnd;
      let s = `<text x="${W / 2}" y="24" text-anchor="middle" font-size="18" font-weight="900" fill="currentColor">${valTxt(0)} ${from} = ${done ? valTxt(steps) : '?'} ${to}</text>`;
      // Digit cells.
      for (let p = 0; p < P; p++) {
        s += `<rect x="${cx(p) - CW / 2 + 1}" y="44" width="${CW - 2}" height="38" rx="4" fill="var(--pond-soft)" opacity="0.5"/>`;
        const o0 = vis(p, j) ? 1 : 0, o1 = vis(p, Math.min(steps, j + 1)) ? 1 : 0, o = o0 + (o1 - o0) * f;
        if (o <= 0.01) continue;
        const fresh = p >= L || (o0 === 0 && !vis(p, 0));
        s += `<text x="${cx(p)}" y="73" text-anchor="middle" font-size="26" font-weight="900" fill="${fresh ? 'var(--ok)' : 'currentColor'}" opacity="${o}">${dig(p)}</text>`;
      }
      // Comma between cells (hidden when there are no decimals).
      const d0 = dec(j), d1 = dec(Math.min(steps, j + 1)), dd = d0 + (d1 - d0) * f, cxm = cx(dd) + CW / 2;
      const co = Math.min(1, dd * 1.5);
      if (co > 0.02) s += `<text x="${cxm}" y="78" text-anchor="middle" font-size="30" font-weight="900" fill="var(--red, #d9534f)" opacity="${co}">,</text>`;
      const uNow = STAIR[a + dir * Math.round(m)]!;
      s += `<text x="${RX + 8}" y="73" font-size="20" font-weight="900" fill="var(--pond)">${uNow}</text>`;
      // Stairs.
      for (let i = 0; i < STAIR.length; i++) {
        const on = (i - a) * dir >= 0 && (i - a) * dir <= steps;
        s += `<rect x="${SX + i * SW}" y="${sy(i)}" width="${SW}" height="${H - 18 - sy(i)}" fill="${on ? 'var(--sun)' : 'var(--pond-soft)'}" opacity="${on ? 0.55 : 0.4}" stroke="currentColor" stroke-width="1.2"/>`;
        s += `<text x="${scx(i)}" y="${sy(i) + 18}" text-anchor="middle" font-size="13" font-weight="900" fill="currentColor">${STAIR[i]}</text>`;
      }
      // Hop labels ×10 / :10 for the hops already started.
      for (let h = 0; h < steps; h++) {
        const g = ease(t, t0 + h * HP, t0 + h * HP + 0.4);
        if (g <= 0) continue;
        const i0 = a + dir * h, i1 = i0 + dir, mx = SX + Math.max(i0, i1) * SW, my = Math.min(sy(Math.max(i0, i1)) + 44, H - 24);
        s += `<g opacity="${g}"><rect x="${mx - 17}" y="${my - 13}" width="34" height="18" rx="9" fill="${dir > 0 ? 'var(--ok)' : 'var(--red, #d9534f)'}"/><text x="${mx}" y="${my}" text-anchor="middle" font-size="12" font-weight="900" fill="#fff">${dir > 0 ? '·10' : ':10'}</text></g>`;
      }
      // Frog.
      const i0 = a + dir * j, i1 = Math.min(STAIR.length - 1, Math.max(0, i0 + (j < steps ? dir : 0)));
      const fx = scx(i0) + (scx(i1) - scx(i0)) * f, fy = sy(i0) + (sy(i1) - sy(i0)) * f - Math.sin(f * Math.PI) * 26 - 6;
      s += `<text x="${fx}" y="${fy}" text-anchor="middle" font-size="22">🐸</text>`;
      const e = ease(t, tEnd, tEnd + 0.5);
      if (e > 0) s += `<text x="${W / 2}" y="104" text-anchor="middle" font-size="13" font-weight="900" fill="var(--ok)" opacity="${e}">${steps} ${steps === 1 ? 'askel' : 'askelta'} ${dir > 0 ? 'alas' : 'ylös'} → pilkku ${steps} ${steps === 1 ? 'paikka' : 'paikkaa'} ${dir > 0 ? 'oikealle' : 'vasemmalle'}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < t0) return `Yksikköportaat: askel alas kertoo kymmenellä, askel ylös jakaa kymmenellä. Lähdetään portaalta ${from}.`;
      if (t < tEnd) { const j = Math.min(steps, Math.floor((t - t0) / HP) + 1); return `Askel ${dir > 0 ? 'alas' : 'ylös'} ${STAIR[a + dir * (j - 1)]} → ${STAIR[a + dir * j]}: ${valTxt(j)} ${STAIR[a + dir * j]}.`; }
      return `${steps} ${steps === 1 ? 'askel' : 'askelta'} ${dir > 0 ? 'alas' : 'ylös'}, pilkku siirtyi ${steps} ${steps === 1 ? 'paikan' : 'paikkaa'} ${dir > 0 ? 'oikealle' : 'vasemmalle'}: ${valTxt(0)} ${from} = ${valTxt(steps)} ${to}.`;
    },
  });
}

/** Frame of reference. Phase 1 films from the shore: the boat glides past a tree. Phase 2 films from
 *  the boat: the boat stays put and the shore slides backwards. Two distance lines show what changes:
 *  frog → mast stays the same, frog → tree grows. With `twin` a second boat runs alongside and its
 *  distance to the first never changes. */
export function refScene(twin = false): AnimPaint {
  const W = 320, H = 236, SH = 96, WY = 112, T1 = 0.8, D = 4.6, T2 = T1 + D + 1.2, T3 = T2 + D, V = 34; // px/s
  const boat = (x: number, y: number, who: string, col: string) =>
    `<path d="M${x - 46} ${y} h92 l-14 18 h-64 z" fill="${col}" stroke="currentColor" stroke-width="1.5"/>` +
    `<line x1="${x + 22}" y1="${y}" x2="${x + 22}" y2="${y - 44}" stroke="currentColor" stroke-width="2"/><path d="M${x + 22} ${y - 44} l16 6 l-16 6 z" fill="var(--red, #d9534f)"/>` +
    `<text x="${x - 14}" y="${y - 2}" text-anchor="middle" font-size="22">${who}</text>`;
  const shore = (off: number) => {
    let s = `<rect x="0" y="${SH - 22}" width="${W}" height="${WY - SH + 22}" fill="#6aa55a" opacity="0.6"/>`;
    for (let i = -2; i < 9; i++) { const x = ((i * 70 - off) % 630 + 630) % 630 - 70; s += `<text x="${x}" y="${SH}" text-anchor="middle" font-size="${i % 2 ? 18 : 24}">${i % 3 ? '🌲' : '🪨'}</text>`; }
    return s;
  };
  const TREE0 = 30;
  return anim({
    dur: T3 + 3, w: W, h: H, label: twin ? 'Kaksi venettä rinnakkain' : 'Vene ja ranta',
    frame: (t) => {
      const p2 = t >= T2 - 0.6, run = p2 ? Math.max(0, Math.min(D, t - T2)) : Math.max(0, Math.min(D, t - T1));
      const by = twin ? 150 : 166, bx = p2 ? 150 : 70 + run * V, off = p2 ? run * V : 0, treeX = TREE0 - off;
      let s = `<rect x="0" y="${WY}" width="${W}" height="${H - WY}" fill="var(--pond-soft)"/>`;
      s += `<rect x="0" y="0" width="${W}" height="${SH - 22}" fill="color-mix(in srgb, #8ec5ff 25%, transparent)"/>`;
      // The marked tree is drawn separately so its distance can be followed.
      s += shore(off) + `<text x="${treeX}" y="${SH + 2}" text-anchor="middle" font-size="28">🌳</text>`;
      // Water ripples drift past in the boat view.
      for (let i = 0; i < 6; i++) { const x = ((i * 60 - off * 1.0) % 360 + 360) % 360 - 20; s += `<path d="M${x} ${H - 14} q8 -6 16 0" fill="none" stroke="currentColor" stroke-width="1" opacity="0.35"/>`; }
      if (twin) s += boat(bx, by + 52, '🐸', '#f3c66b');
      s += boat(bx, by, '🐸', '#c98b4e');
      // Distance lines from the frog.
      const fx = bx - 14, fy = by - 22;
      const dTree = Math.round(Math.abs(fx - treeX) / 10);
      s += `<line x1="${fx}" y1="${fy}" x2="${treeX}" y2="${SH - 6}" stroke="var(--red, #d9534f)" stroke-width="2" stroke-dasharray="5 4"/>`;
      const badge = (y: number, col: string, txt: string) => `<rect x="6" y="${y}" width="138" height="22" rx="11" fill="${col}"/><text x="75" y="${y + 16}" text-anchor="middle" font-size="12" font-weight="900" fill="#fff">${txt}</text>`;
      s += badge(6, 'var(--red, #d9534f)', `🐸 → 🌳 ${dTree} m`) + badge(34, 'var(--ok)', twin ? 'vene A → B 5 m' : '🐸 → masto 4 m');
      if (twin) s += `<line x1="${fx - 34}" y1="${fy + 6}" x2="${fx - 34}" y2="${fy + 52}" stroke="var(--ok)" stroke-width="3"/>`;
      else s += `<line x1="${fx + 10}" y1="${by - 6}" x2="${bx + 21}" y2="${by - 6}" stroke="var(--ok)" stroke-width="3"/>`;
      // Camera badge.
      const cam = p2 ? (twin ? '📷 kuvaaja veneessä A' : '📷 kuvaaja veneessä') : '📷 kuvaaja rannalla';
      s += `<rect x="${W - 168}" y="6" width="162" height="24" rx="12" fill="var(--sun)"/><text x="${W - 87}" y="23" text-anchor="middle" font-size="13" font-weight="900" fill="#222">${cam}</text>`;
      if (t > T2 - 1.2 && t < T2 - 0.2) s += `<rect x="0" y="0" width="${W}" height="${H}" fill="#000" opacity="${0.5 - Math.abs(t - (T2 - 0.7)) }"/>`;
      return s;
    },
    caption: (t) => {
      if (t < T1) return twin ? 'Kaksi venettä lähtee rinnakkain yhtä nopeasti. Kuvaaja seisoo rannalla.' : 'Loikka istuu veneessä. Kuvaaja seisoo rannalla.';
      if (t < T2 - 0.6) return twin ? 'Rannalta katsoen molemmat veneet liikkuvat. Matka puuhun kasvaa, mutta veneiden väli pysyy 5 metrissä.' : 'Rannalta katsoen Loikka liikkuu: matka puuhun kasvaa. Matka mastoon pysyy samana.';
      if (t < T3) return twin ? 'Nyt kuvataan veneestä A. Vene B pysyy kuvassa paikallaan, ranta liukuu taaksepäin.' : 'Nyt kuvataan veneestä. Loikka pysyy paikallaan, ja ranta liukuu taaksepäin.';
      return twin ? 'Veneestä A katsoen vene B on paikallaan, koska niiden välinen etäisyys ei muutu.' : 'Liikkuuko Loikka? Veneeseen verrattuna ei, rantaan verrattuna kyllä. Vastaus riippuu vertailukohdasta.';
    },
  });
}

export type Run = { name: string; s: number; t: number; col?: string };

/** A hopping race measured two ways at once: a tape unrolls behind each frog (distance) while its
 *  stopwatch runs real seconds and stops at the finish (time). `ask` hides one result at the end
 *  ('s' or 't') so the learner reads it from the animation. */
export function raceScene(runs: Run[], ask?: 's' | 't'): AnimPaint {
  const W = 320, LH = 92, H = 40 + runs.length * LH + (ask ? 10 : 34), X0 = 18, L = 214, t0 = 1.0;
  const maxS = Math.max(...runs.map((r) => r.s)), px = (m: number) => X0 + (L * m) / maxS;
  const end = t0 + Math.max(...runs.map((r) => r.t)), tick = maxS > 20 ? 5 : maxS > 8 ? 2 : 1;
  return anim({
    dur: end + 3.5, w: W, h: H, label: runs.map((r) => `${r.name}: ${fmt(r.s)} m, ${fmt(r.t)} s`).join('; '),
    frame: (t) => {
      let s = '';
      runs.forEach((r, i) => {
        const y = 62 + i * LH, el = Math.max(0, Math.min(r.t, t - t0)), m = (r.s * el) / r.t, on = t > t0 && el < r.t;
        const hop = on ? Math.abs(Math.sin(el * Math.PI * 2)) * 16 : 0;
        s += `<text x="${X0}" y="${y - 34}" font-size="13" font-weight="900" fill="${r.col ?? 'currentColor'}">${r.name}</text>`;
        s += `<line x1="${X0}" y1="${y}" x2="${px(maxS) + 6}" y2="${y}" stroke="var(--line, #888)" stroke-width="3"/>`;
        s += `<text x="${px(r.s)}" y="${y - 2}" text-anchor="middle" font-size="16">🏁</text>`;
        s += `<rect x="${X0}" y="${y + 3}" width="${px(m) - X0}" height="11" fill="#f6d65b" stroke="currentColor" stroke-width="1"/>`;
        for (let k = 0; k <= m + 1e-6; k += tick) s += `<line x1="${px(k)}" y1="${y + 3}" x2="${px(k)}" y2="${y + 10}" stroke="currentColor" stroke-width="1.2"/><text x="${px(k)}" y="${y + 26}" text-anchor="middle" font-size="10" font-weight="700" fill="currentColor">${k}</text>`;
        s += `<text x="${px(m)}" y="${y - 4 - hop}" text-anchor="middle" font-size="24">🐸</text>`;
        // Stopwatch: our own compact dial so two fit side by side with their lanes.
        const cx = W - 40, cy = y - 18, sec = el, a = (sec / 10) * 2 * Math.PI;
        s += `<circle cx="${cx}" cy="${cy}" r="17" fill="var(--card, #fff)" stroke="${on ? '#2a9d55' : 'currentColor'}" stroke-width="3"/><rect x="${cx - 3}" y="${cy - 23}" width="6" height="5" fill="currentColor"/>`;
        s += `<line x1="${cx}" y1="${cy}" x2="${cx + 12 * Math.sin(a)}" y2="${cy - 12 * Math.cos(a)}" stroke="#d9534f" stroke-width="3" stroke-linecap="round"/>`;
        const hideT = ask === 't' && el >= r.t, hideS = ask === 's' && el >= r.t;
        s += `<rect x="${cx - 32}" y="${cy + 22}" width="64" height="20" rx="5" fill="#1b2a22"/><text x="${cx}" y="${cy + 37}" text-anchor="middle" font-size="13" font-weight="900" fill="#9be08a">${hideT ? '? s' : `${fmt(Math.floor(sec * 10) / 10)} s`}</text>`;
        const done = ease(t, t0 + r.t, t0 + r.t + 0.5);
        if (done > 0 && !hideS) s += `<text x="${Math.min(px(r.s), W - 110)}" y="${y + 42}" text-anchor="middle" font-size="12" font-weight="900" fill="var(--red, #d9534f)" opacity="${done}">s = ${fmt(r.s)} m</text>`;
      });
      const e = ease(t, end + 0.3, end + 0.8);
      if (e > 0 && !ask) s += `<text x="${W / 2}" y="${H - 12}" text-anchor="middle" font-size="13" font-weight="900" fill="var(--ok)" opacity="${e}">${runs.map((r) => `${r.name}: s = ${fmt(r.s)} m, t = ${fmt(r.t)} s`).join(' · ')}</text>`;
      return s;
    },
    caption: (t) => {
      if (t < t0) return 'Mittanauha mittaa matkan. Sekuntikello mittaa ajan. Valmiina, hep!';
      if (t < end) return `Kello käy: ${fmt(Math.floor((t - t0) * 10) / 10)} s. Nauha kulkee sammakon mukana.`;
      if (ask) return ask === 's' ? 'Lue matka mittanauhasta: mihin kohtaan sammakko pysähtyi?' : 'Kello pysähtyi maaliin. Kuinka kauan loikkiminen kesti?';
      if (runs.length === 1) return `Matka s = ${fmt(runs[0]!.s)} m kertoo, kuinka pitkälle. Aika t = ${fmt(runs[0]!.t)} s kertoo, kuinka kauan.`;
      const [a, b] = runs as [Run, Run];
      return `${a.s > b.s ? a.name : b.name} kulki pidemmän matkan, ${a.t > b.t ? a.name : b.name} loikki pidemmän ajan. Matka ja aika ovat eri suureita.`;
    },
  });
}

/** Speed as "metres every second": the frog covers `s` m in `T` real seconds; at each full second a
 *  new block of v = s/T metres is stamped under the track, so the equal blocks show v m/s. */
export function perSecondScene(s: number, T: number, name = 'Loikka', mode: 'v' | 's' | 't' = 'v'): AnimPaint {
  const W = 320, H = 196, X0 = 16, L = 286, v = s / T, t0 = 1.0, end = t0 + T, px = (m: number) => X0 + (L * m) / s, Y = 74;
  return anim({
    dur: end + 4, w: W, h: H, label: `${name}: ${fmt(s)} m ${fmt(T)} sekunnissa, ${fmt(v)} m/s`,
    frame: (t) => {
      const el = Math.max(0, Math.min(T, t - t0)), m = v * el, on = t > t0 && el < T, k = Math.floor(el + 1e-6);
      const head = mode === 'v' ? `${fmt(s)} m, ${fmt(T)} s` : mode === 's' ? `${fmt(v)} m/s, ${fmt(T)} s` : `${fmt(s)} m, ${fmt(v)} m/s`;
      let o = `<text x="${W / 2}" y="22" text-anchor="middle" font-size="16" font-weight="900" fill="currentColor">${name}: ${head}</text>`;
      o += `<line x1="${X0}" y1="${Y}" x2="${px(s)}" y2="${Y}" stroke="var(--line, #888)" stroke-width="3"/><text x="${px(s)}" y="${Y - 2}" text-anchor="middle" font-size="15">🏁</text>`;
      o += `<text x="${px(m)}" y="${Y - 4 - (on ? Math.abs(Math.sin(el * Math.PI * 2)) * 16 : 0)}" text-anchor="middle" font-size="24">🐸</text>`;
      for (let i = 0; i < k; i++) {
        const g = ease(t, t0 + i + 1, t0 + i + 1.35), x = px(i * v), w = px(v) - X0;
        o += `<g opacity="${g}"><rect x="${x}" y="${Y + 8}" width="${w}" height="20" fill="${i % 2 ? '#7fc59a' : 'var(--pond)'}" stroke="currentColor" stroke-width="1.2"/>` +
          `<text x="${x + w / 2}" y="${Y + 23}" text-anchor="middle" font-size="11" font-weight="900" fill="#fff">${fmt(v)} m</text>` +
          `<text x="${x + w / 2}" y="${Y + 42}" text-anchor="middle" font-size="10" font-weight="800" fill="var(--soft)">${i + 1}. s</text></g>`;
      }
      // Running bar of the current second.
      if (on) o += `<rect x="${px(k * v)}" y="${Y + 8}" width="${Math.max(0, px(m) - px(k * v))}" height="20" fill="#f6d65b" opacity="0.8"/>`;
      o += `<text x="${W / 2}" y="${Y + 72}" text-anchor="middle" font-size="15" font-weight="900" fill="var(--pond)">${t < t0 ? '' : `${fmt(Math.floor(el * 10) / 10)} s → ${fmt(Math.round(m * 10) / 10)} m`}</text>`;
      const e = ease(t, end + 0.4, end + 0.9);
      const [l1, l2] = mode === 'v' ? [`Joka sekunti ${fmt(v)} m: ${fmt(s)} m / ${fmt(T)} s`, `nopeus v = ${fmt(v)} m/s`]
        : mode === 's' ? [`${fmt(T)} palaa · ${fmt(v)} m = ${fmt(s)} m`, `matka s = v · t = ${fmt(s)} m`]
        : [`${fmt(s)} m / ${fmt(v)} m/s = ${fmt(T)} palaa`, `aika t = s / v = ${fmt(T)} s`];
      if (e > 0) o += `<g opacity="${e}"><text x="${W / 2}" y="${Y + 98}" text-anchor="middle" font-size="14" font-weight="900" fill="currentColor">${l1}</text>` +
        `<text x="${W / 2}" y="${Y + 120}" text-anchor="middle" font-size="18" font-weight="900" fill="var(--ok)">${l2}</text></g>`;
      return o;
    },
    caption: (t) => {
      if (t < t0) return mode === 'v' ? `Kuinka monta metriä ${name} etenee joka sekunti?` : mode === 's' ? `${name} etenee ${fmt(v)} m joka sekunti. Kuinka pitkälle ${fmt(T)} sekunnissa?` : `${name} etenee ${fmt(v)} m joka sekunti. Kuinka kauan ${fmt(s)} metriin menee?`;
      if (t < end) { const k = Math.floor(t - t0); return k < 1 ? 'Ensimmäinen sekunti käy…' : `${k} s kulunut: ${k} samanlaista ${fmt(v)} metrin palaa.`; }
      if (mode === 's') return `${fmt(T)} sekuntia, joka sekunti ${fmt(v)} m: matka on nopeus kertaa aika, ${fmt(s)} m.`;
      if (mode === 't') return `${fmt(s)} metriin mahtui ${fmt(T)} kpl ${fmt(v)} metrin paloja: aika on matka jaettuna nopeudella, ${fmt(T)} s.`;
      return `Joka sekunnille tuli yhtä pitkä pala: ${fmt(v)} m. Nopeus on matka jaettuna ajalla, ${fmt(v)} metriä sekunnissa.`;
    },
  });
}

/** Average speed: the real mover follows `segs` ([distance, duration] pieces, distance 0 = a rest)
 *  while a ghost moves steadily at total distance / total time. Both reach the finish together.
 *  `k` = animation seconds per unit of time (so hours can play in seconds). */
export function avgScene(segs: [number, number][], su: string, tu: string, k: number, who = '🐸', reveal = true): AnimPaint {
  const S = segs.reduce((a, x) => a + x[0], 0), T = segs.reduce((a, x) => a + x[1], 0), v = S / T;
  const W = 320, H = 214, X0 = 22, L = 230, px = (m: number) => X0 + (L * m) / S, t0 = 1.0, end = t0 + T * k;
  const pos = (u: number) => { let d = 0, tt = 0; for (const [ds, dt] of segs) { if (u <= tt + dt) return d + (ds * (u - tt)) / dt; d += ds; tt += dt; } return S; };
  const resting = (u: number) => { let tt = 0; for (const [ds, dt] of segs) { if (u < tt + dt) return ds === 0; tt += dt; } return false; };
  return anim({
    dur: end + 4, w: W, h: H, label: `Keskinopeus ${fmt(S)} ${su} / ${fmt(T)} ${tu} = ${fmt(v)} ${su}/${tu}`,
    frame: (t) => {
      const u = Math.max(0, Math.min(T, (t - t0) / k)), rest = t > t0 && u < T && resting(u);
      let o = '';
      const lane = (y: number, label: string, m: number, icon: string, op: number, col: string) =>
        `<text x="${X0}" y="${y - 30}" font-size="12" font-weight="900" fill="${col}">${label}</text>` +
        `<line x1="${X0}" y1="${y}" x2="${px(S) + 4}" y2="${y}" stroke="var(--line, #888)" stroke-width="3"/><text x="${px(S)}" y="${y - 2}" text-anchor="middle" font-size="15">🏁</text>` +
        `<text x="${px(m)}" y="${y - 4}" text-anchor="middle" font-size="24" opacity="${op}">${icon}</text>` +
        `<text x="${px(m)}" y="${y + 18}" text-anchor="middle" font-size="11" font-weight="800" fill="${col}">${fmt(Math.round(m * 10) / 10)} ${su}</text>`;
      o += lane(62, rest ? 'Todellinen matka: TAUKO ☕' : 'Todellinen matka', pos(u), who, 1, 'currentColor');
      o += lane(132, reveal ? `Keskinopeudella ${fmt(v)} ${su}/${tu}` : 'Tasaisella vauhdilla: ? ' + `${su}/${tu}`, v * u, who, 0.45, 'var(--pond)');
      // Elapsed time.
      o += `<rect x="${W - 70}" y="20" width="62" height="24" rx="6" fill="#1b2a22"/><text x="${W - 39}" y="37" text-anchor="middle" font-size="13" font-weight="900" fill="#9be08a">${fmt(Math.round(u * 100) / 100)} ${tu}</text>`;
      const e = ease(t, end + 0.3, end + 0.8);
      if (e > 0) o += `<g opacity="${e}"><text x="${W / 2}" y="178" text-anchor="middle" font-size="13" font-weight="900" fill="currentColor">koko matka / koko aika (tauko mukana)</text>` +
        `<text x="${W / 2}" y="202" text-anchor="middle" font-size="17" font-weight="900" fill="var(--ok)">${reveal ? `${fmt(S)} ${su} / ${fmt(T)} ${tu} = ${fmt(v)} ${su}/${tu}` : `? ${su} / ? ${tu} = ? ${su}/${tu}`}</text></g>`;
      return o;
    },
    caption: (t) => {
      const u = (t - t0) / k;
      if (t < t0) return 'Ylempi kulkee oikeasti: välillä nopeasti, välillä tauolla. Alempi kulkee koko ajan samaa vauhtia.';
      if (t < end) return resting(u) ? 'Tauko: matka ei kasva, mutta aika kuluu.' : 'Kumpikin liikkuu. Kuka ehtii maaliin ensin?';
      return `Molemmat ovat maalissa yhtä aikaa. Keskinopeus on se tasainen vauhti, jolla sama matka kuljetaan samassa ajassa${reveal ? `: ${fmt(v)} ${su}/${tu}` : '. Laske se'}.`;
    },
  });
}

const UNIT_WORD: Record<string, [string, string]> = { m: ['metriä', 'metri'], km: ['kilometriä', 'kilometri'], cm: ['senttimetriä', 'senttimetri'], s: ['sekunnissa', 'sekunti'], h: ['tunnissa', 'tunti'], min: ['minuutissa', 'minuutti'] };

/** The speed unit is built in front of the learner: "12 m / 4 s" splits into numbers (12 / 4 = 3)
 *  and units (m / s), which travel to their own rows and then meet as "v = 3 m/s". */
export function unitBuildScene(sv: number, su: string, tv: number, tu: string): AnimPaint {
  const W = 320, H = 200, v = sv / tv, FX = 70, NY = 70, DY = 110, t1 = 1.4, t2 = 3.0, t3 = 4.6, t4 = 6.0;
  const lerp = (a: number, b: number, g: number) => a + (b - a) * g;
  const tok = (x: number, y: number, txt: string, col: string, size = 22) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="900" fill="${col}">${txt}</text>`;
  const NUM = 'var(--sun)', UN = 'var(--red, #d9534f)';
  return anim({
    dur: t4 + 4, w: W, h: H, label: `${fmt(sv)} ${su} / ${fmt(tv)} ${tu} = ${fmt(v)} ${su}/${tu}`,
    frame: (t) => {
      let o = tok(FX, 22, 'v = s / t', 'var(--soft)', 15);
      const g0 = ease(t, 0.2, 0.8);
      o += `<line x1="${FX - 44}" y1="${(NY + DY) / 2 - 8}" x2="${FX + 44}" y2="${(NY + DY) / 2 - 8}" stroke="currentColor" stroke-width="3" opacity="${g0 * (1 - ease(t, t2, t2 + 1))}"/>`;
      // Numbers move to row 1 (right), units to row 2 (right).
      const gn = ease(t, t1, t1 + 1), gu = ease(t, t2, t2 + 1);
      o += tok(lerp(FX - 14, 196, gn), lerp(NY, 66, gn), fmt(sv), NUM) + tok(lerp(FX - 14, 196, gn), lerp(DY, 104, gn), fmt(tv), NUM);
      const arc = Math.sin(gu * Math.PI);
      o += tok(lerp(FX + 22, 262, gu), lerp(NY, 66, gu) - arc * 50, su, UN) + tok(lerp(FX + 22, 262, gu), lerp(DY, 104, gu) + arc * 60, tu, UN);
      if (gn > 0.9) o += `<line x1="176" y1="78" x2="216" y2="78" stroke="${NUM}" stroke-width="3"/>` + tok(196, 134, `= ${fmt(v)}`, NUM, 18) + tok(196, 44, 'luvut', NUM, 11);
      if (gu > 0.9) o += `<line x1="240" y1="78" x2="284" y2="78" stroke="${UN}" stroke-width="3"/>` + tok(262, 134, `= ${su}/${tu}`, UN, 18) + tok(262, 44, 'yksiköt', UN, 11);
      const e = ease(t, t3, t3 + 0.6);
      if (e > 0) o += `<g opacity="${e}"><rect x="40" y="148" width="240" height="34" rx="10" fill="var(--card, #fff)" stroke="var(--ok)" stroke-width="3"/>` +
        `<text x="160" y="172" text-anchor="middle" font-size="20" font-weight="900"><tspan fill="currentColor">v = </tspan><tspan fill="${NUM}">${fmt(v)}</tspan><tspan fill="${UN}"> ${su}/${tu}</tspan></text></g>`;
      const r = ease(t, t4, t4 + 0.6), w = UNIT_WORD[su], wt = UNIT_WORD[tu];
      if (r > 0 && w && wt) o += tok(W / 2, 197, `${fmt(v)} ${w[0]} joka ${wt[1]}`, 'var(--ok)', 13).replace('<text', `<text opacity="${r}"`);
      return o;
    },
    caption: (t) => {
      if (t < t1) return `Nopeus on matka jaettuna ajalla: ${fmt(sv)} ${su} jaettuna ${fmt(tv)} ${tu}.`;
      if (t < t2) return `Luvut jaetaan: ${fmt(sv)} / ${fmt(tv)} = ${fmt(v)}.`;
      if (t < t3) return `Yksiköt jaetaan myös: ${su} jaettuna ${tu} on ${su}/${tu}.`;
      return `Luku ja yksikkö yhdessä: ${fmt(v)} ${su}/${tu}. Kauttaviiva luetaan "joka" tai "per": ${fmt(v)} ${UNIT_WORD[su]?.[0] ?? su} ${UNIT_WORD[tu]?.[0] ?? tu}.`;
    },
  });
}

/** Formula triangle s over v · t: a lid covers one letter at a time and the uncovered letters give
 *  the formula for it: s = v · t, t = s / v, v = s / t. */
export function triangleScene(order: ('s' | 'v' | 't')[] = ['s', 't', 'v']): AnimPaint {
  const W = 320, H = 210, CX = 104, TOP = 26, BASE = 168, HW = 84, P = 2.6, t0 = 0.8;
  const pos = { s: [CX, 82], v: [CX - 40, 146], t: [CX + 40, 146] } as const;
  const F = { s: 's = v · t', t: 't = s / v', v: 'v = s / t' }, NAME = { s: 'matka', t: 'aika', v: 'nopeus' };
  return anim({
    dur: t0 + order.length * P + 2.5, w: W, h: H, label: 'Kaavakolmio',
    frame: (t) => {
      let o = `<path d="M${CX} ${TOP} L${CX + HW} ${BASE} L${CX - HW} ${BASE} Z" fill="var(--pond-soft)" stroke="currentColor" stroke-width="2.5"/>`;
      o += `<line x1="${CX - 52}" y1="108" x2="${CX + 52}" y2="108" stroke="currentColor" stroke-width="2.5"/><line x1="${CX}" y1="108" x2="${CX}" y2="${BASE}" stroke="currentColor" stroke-width="2.5"/>`;
      for (const k of ['s', 'v', 't'] as const) o += `<text x="${pos[k][0]}" y="${pos[k][1]}" text-anchor="middle" font-size="30" font-weight="900" fill="currentColor">${k}</text>`;
      o += `<text x="${CX}" y="128" text-anchor="middle" font-size="16" font-weight="900" fill="var(--soft)">·</text>`;
      const i = Math.floor((t - t0) / P), local = t - t0 - i * P;
      order.forEach((k, j) => {
        if (j > i || t < t0) return;
        const g = j === i ? ease(local, 0, 0.6) : 1;
        o += `<text x="${236}" y="${70 + j * 50}" text-anchor="middle" font-size="18" font-weight="900" fill="${j === i ? 'var(--ok)' : 'currentColor'}" opacity="${j === i ? g : 0.6}">${F[k]}</text>`;
      });
      if (t >= t0 && i < order.length) {
        const k = order[i]!, g = ease(local, 0, 0.5) * (1 - ease(local, P - 0.4, P));
        o += `<g opacity="${g}"><circle cx="${pos[k][0]}" cy="${pos[k][1] - 10}" r="22" fill="var(--sun)" stroke="currentColor" stroke-width="2"/><text x="${pos[k][0]}" y="${pos[k][1] - 3}" text-anchor="middle" font-size="18">✋</text></g>`;
      }
      return o;
    },
    caption: (t) => {
      const i = Math.floor((t - t0) / P);
      if (t < t0) return 'Kaavakolmio: s ylhäällä, v ja t alhaalla. Peitä se, minkä haluat laskea.';
      if (i < order.length) { const k = order[i]!; return `Peitetään ${k} (${NAME[k]}). ${k === 's' ? 'v ja t ovat vierekkäin: kerro.' : `${k === 't' ? 's on v:n' : 's on t:n'} päällä: jaa.`} ${F[k]}.`; }
      return 'Vierekkäin: kerro. Päällekkäin: jaa. Kolme kaavaa samasta kolmiosta.';
    },
  });
}

/** Why 1 m/s = 3,6 km/h: a frog moving 1 m every second while the clock fast-forwards from 1 s to a
 *  whole hour (3600 s); the metres keep pace, so in one hour it covers 3600 m = 3,6 km. */
export function hourScene(): AnimPaint {
  const W = 320, H = 206, t0 = 1.0, T = 6.5, end = t0 + T;
  // Exponential fast-forward: seconds shown = 3600^(u) with u from 0 to 1.
  const secAt = (t: number) => (t < t0 ? 0 : Math.min(3600, Math.round(3600 ** Math.min(1, (t - t0) / T))));
  return anim({
    dur: end + 4, w: W, h: H, label: '1 m/s = 3,6 km/h',
    frame: (t) => {
      const sec = secAt(t), m = sec;
      let o = `<text x="${W / 2}" y="22" text-anchor="middle" font-size="16" font-weight="900" fill="currentColor">Loikka: 1 m joka sekunti</text>`;
      const hop = t > t0 && t < end ? Math.abs(Math.sin(t * Math.PI * 3)) * 12 : 0;
      o += `<line x1="20" y1="88" x2="300" y2="88" stroke="var(--line, #888)" stroke-width="3"/><text x="${40 + 230 * Math.log(1 + m) / Math.log(3601)}" y="${84 - hop}" text-anchor="middle" font-size="24">🐸</text>`;
      o += `<rect x="30" y="102" width="120" height="44" rx="8" fill="#1b2a22"/><text x="90" y="120" text-anchor="middle" font-size="11" font-weight="800" fill="#9be08a">aika</text><text x="90" y="139" text-anchor="middle" font-size="17" font-weight="900" fill="#9be08a">${sec} s</text>`;
      o += `<rect x="170" y="102" width="120" height="44" rx="8" fill="var(--card, #fff)" stroke="currentColor" stroke-width="2"/><text x="230" y="120" text-anchor="middle" font-size="11" font-weight="800" fill="var(--pond)">matka</text><text x="230" y="139" text-anchor="middle" font-size="17" font-weight="900" fill="currentColor">${m} m</text>`;
      const fast = t > t0 && t < end ? (sec < 60 ? '▶▶' : sec < 600 ? '▶▶▶' : '▶▶▶▶') : '';
      if (fast) o += `<text x="${W / 2}" y="44" text-anchor="middle" font-size="12" font-weight="900" fill="var(--sun)">${fast} pikakelaus</text>`;
      const e = ease(t, end, end + 0.6);
      if (e > 0) o += `<g opacity="${e}"><text x="${W / 2}" y="170" text-anchor="middle" font-size="14" font-weight="900" fill="currentColor">3600 s = 1 h ja 3600 m = 3,6 km</text><text x="${W / 2}" y="196" text-anchor="middle" font-size="18" font-weight="900" fill="var(--ok)">1 m/s = 3,6 km/h</text></g>`;
      return o;
    },
    caption: (t) => {
      const sec = secAt(t);
      if (t < t0) return 'Loikka etenee yhden metrin joka sekunti. Kelataan kelloa eteenpäin tunnin verran.';
      if (t < end) return sec < 60 ? `${sec} s: ${sec} m.` : sec < 3600 ? `${Math.floor(sec / 60)} min ${sec % 60} s: jo ${sec} m.` : 'Tunti täynnä!';
      return 'Tunnissa on 3600 sekuntia, joten metrejä tulee 3600 eli 3,6 km. Siksi 1 m/s on 3,6 km/h: km/h-luku on 3,6 kertaa suurempi.';
    },
  });
}

/** Logging a race: the frog hops along a measuring tape while a real-time stopwatch runs. At every checkpoint
 *  time a flag drops at the frog, and the pair (time, distance) flies into its own table row under the
 *  header "aika t (s) | matka s (m)". The header is written first: quantity, symbol and unit. */
export function logScene(v: number, ts: number[]): AnimPaint {
  const W = 320, H = 262, X0 = 22, L = 230, Y = 62, t0 = 1.4, T = ts[ts.length - 1]!, S = v * T;
  const px = (m: number) => X0 + (L * m) / S, tick = S > 20 ? 5 : S > 8 ? 2 : 1;
  const TB = 130, RH = 22, C1 = 106, C2 = 214;
  return anim({
    dur: t0 + T + 3.5, w: W, h: H, label: `mittaukset taulukkoon: ${ts.map((x) => `${x} s ${v * x} m`).join(', ')}`,
    frame: (t) => {
      const el = Math.max(0, Math.min(T, t - t0)), m = v * el, on = t > t0 && el < T;
      let s = `<line x1="${X0}" y1="${Y}" x2="${px(S) + 6}" y2="${Y}" stroke="var(--line, #888)" stroke-width="3"/>`;
      for (let k = 0; k <= S + 1e-6; k += tick) s += `<line x1="${px(k)}" y1="${Y + 3}" x2="${px(k)}" y2="${Y + 10}" stroke="currentColor" stroke-width="1.2"/><text x="${px(k)}" y="${Y + 24}" text-anchor="middle" font-size="10" font-weight="700" fill="currentColor">${k}</text>`;
      s += `<rect x="${X0}" y="${Y + 3}" width="${px(m) - X0}" height="7" fill="#f6d65b" opacity=".8"/>`;
      ts.forEach((x) => { if (el >= x - 1e-6 && t > t0 - 0.01) s += `<text x="${px(v * x)}" y="${Y - 2}" text-anchor="middle" font-size="13">🚩</text>`; });
      const hop = on ? Math.abs(Math.sin(el * Math.PI * 2)) * 14 : 0;
      s += `<text x="${px(m)}" y="${Y - 6 - hop}" text-anchor="middle" font-size="22">🐸</text>`;
      s += `<rect x="${W - 74}" y="6" width="66" height="22" rx="5" fill="#1b2a22"/><text x="${W - 41}" y="22" text-anchor="middle" font-size="13" font-weight="900" fill="#9be08a">${fmt(Math.floor(el * 10) / 10)} s</text>`;
      // table
      const eh = ease(t, 0.1, 0.9);
      s += `<g opacity="${eh}"><rect x="${C1 - 70}" y="${TB - 20}" width="${C2 - C1 + 140}" height="${(ts.length + 1) * RH + 8}" rx="6" fill="none" stroke="currentColor" stroke-opacity=".35"/><line x1="${(C1 + C2) / 2}" y1="${TB - 20}" x2="${(C1 + C2) / 2}" y2="${TB - 12 + (ts.length + 1) * RH}" stroke="currentColor" stroke-opacity=".35"/><line x1="${C1 - 70}" y1="${TB + 6}" x2="${C2 + 70}" y2="${TB + 6}" stroke="currentColor" stroke-opacity=".35"/>`;
      s += `<text x="${C1}" y="${TB}" text-anchor="middle" font-size="13" font-weight="900"><tspan fill="currentColor">aika t </tspan><tspan fill="#d9534f">(s)</tspan></text><text x="${C2}" y="${TB}" text-anchor="middle" font-size="13" font-weight="900"><tspan fill="currentColor">matka s </tspan><tspan fill="#d9534f">(m)</tspan></text></g>`;
      ts.forEach((x, i) => {
        const at = t0 + x, e = ease(t, at + 0.05, at + 0.7), ry = TB + 4 + (i + 1) * RH;
        if (e <= 0) return;
        const fx = px(v * x), fy = Y + 8;
        if (e < 1) {
          s += `<text x="${fx + (C1 - fx) * e}" y="${fy + (ry - fy) * e}" text-anchor="middle" font-size="14" font-weight="900" fill="#2b6cb0">${fmt(x)}</text><text x="${fx + 14 + (C2 - fx - 14) * e}" y="${fy + (ry - fy) * e}" text-anchor="middle" font-size="14" font-weight="900" fill="#e8913a">${fmt(v * x)}</text>`;
        } else {
          s += `<text x="${C1}" y="${ry}" text-anchor="middle" font-size="15" font-weight="900" fill="#2b6cb0">${fmt(x)}</text><text x="${C2}" y="${ry}" text-anchor="middle" font-size="15" font-weight="900" fill="#e8913a">${fmt(v * x)}</text>`;
        }
      });
      const ee = ease(t, t0 + T + 0.9, t0 + T + 1.4);
      if (ee > 0) s += `<text x="${W / 2}" y="${H - 8}" text-anchor="middle" font-size="12" font-weight="900" fill="var(--ok, #2f9e44)" opacity="${ee}">yksiköt otsikossa, luvut riveillä, sama hetki samalla rivillä</text>`;
      return s;
    },
    caption: (t) => {
      if (t < t0) return 'Ensin otsikkorivi: suure, tunnus ja yksikkö sulkeissa. Rivit täytetään mittausten mukaan.';
      const el = t - t0, done = ts.filter((x) => x <= el + 1e-6);
      if (el < T + 0.7) { const x = done[done.length - 1]; return x === undefined ? `Kello käy: ${fmt(Math.floor(el * 10) / 10)} s.` : `Hetkellä ${fmt(x)} s sammakko on kohdassa ${fmt(v * x)} m. Pari kirjataan samalle riville.`; }
      return 'Taulukko on valmis. Yksiköt on kirjoitettu kerran otsikkoon, joten riveillä on pelkät luvut.';
    },
  });
}

/** Table → chart with units: the axes are drawn and named first (time across, distance up, with their
 *  scales); then for each row the row lights up, a dot walks along the time axis to t, climbs to s and
 *  stays; dashed guides show both readings. Ends by noting that the dots lie on a line. */
export function plotDataScene(pts: [number, number][], xMax: number, yMax: number, xStep: number, yStep: number, xl = 't (s)', yl = 's (m)'): AnimPaint {
  const W = 320, H = 244, GX = 150, GY = 26, GW = 156, GH = 170, T0 = 1.6, ST = 1.6, TE = T0 + pts.length * ST;
  const px = (x: number) => GX + (GW * x) / xMax, py = (y: number) => GY + GH - (GH * y) / yMax;
  return anim({
    dur: TE + 3.5, w: W, h: H, label: `pisteet ${pts.map(([a, b]) => `(${a}, ${b})`).join(', ')}`,
    frame: (t) => {
      let o = '';
      const eA = ease(t, 0.1, 0.9);
      o += `<g opacity="${eA}">`;
      for (let x = 0; x <= xMax + 1e-9; x += xStep) o += `<line x1="${px(x)}" y1="${py(0)}" x2="${px(x)}" y2="${py(yMax)}" stroke="currentColor" stroke-opacity="${x ? 0.1 : 0.6}"/><text x="${px(x)}" y="${py(0) + 13}" text-anchor="middle" font-size="9" fill="currentColor">${fmt(x)}</text>`;
      for (let y = 0; y <= yMax + 1e-9; y += yStep) o += `<line x1="${px(0)}" y1="${py(y)}" x2="${px(xMax)}" y2="${py(y)}" stroke="currentColor" stroke-opacity="${y ? 0.1 : 0.6}"/><text x="${px(0) - 4}" y="${py(y) + 3}" text-anchor="end" font-size="9" fill="currentColor">${fmt(y)}</text>`;
      o += `</g>`;
      o += `<text x="${px(xMax)}" y="${py(0) + 28}" text-anchor="end" font-size="12" font-weight="900" fill="#2b6cb0" opacity="${ease(t, 0.5, 1.0)}">${xl} →</text>`;
      o += `<text x="${px(0) - 2}" y="${GY - 10}" text-anchor="middle" font-size="12" font-weight="900" fill="#e8913a" opacity="${ease(t, 0.9, 1.4)}">↑ ${yl}</text>`;
      // table
      const TX1 = 30, TX2 = 92, TY = 46, RH = 26;
      o += `<text x="${TX1}" y="${TY}" text-anchor="middle" font-size="12" font-weight="900" fill="#2b6cb0">${xl}</text><text x="${TX2}" y="${TY}" text-anchor="middle" font-size="12" font-weight="900" fill="#e8913a">${yl}</text><line x1="6" y1="${TY + 6}" x2="124" y2="${TY + 6}" stroke="currentColor" stroke-opacity=".35"/>`;
      pts.forEach(([x, y], i) => {
        const s = T0 + i * ST, ry = TY + 26 + i * RH, on = t >= s && t < s + ST;
        if (on) o += `<rect x="6" y="${ry - 17}" width="118" height="23" rx="5" fill="#e8913a" fill-opacity=".18"/>`;
        o += `<text x="${TX1}" y="${ry}" text-anchor="middle" font-size="14" font-weight="900" fill="#2b6cb0">${fmt(x)}</text><text x="${TX2}" y="${ry}" text-anchor="middle" font-size="14" font-weight="900" fill="#e8913a">${fmt(y)}</text>`;
        if (t < s) return;
        const eX = ease(t, s + 0.1, s + 0.6), eY = ease(t, s + 0.65, s + 1.2);
        const cx = px(x * eX), cy = py(y * eY);
        o += `<line x1="${px(0)}" y1="${py(0)}" x2="${cx}" y2="${py(0)}" stroke="#2b6cb0" stroke-width="${on ? 3 : 0}"/>`;
        if (eX >= 1) o += `<line x1="${px(x)}" y1="${py(0)}" x2="${px(x)}" y2="${cy}" stroke="#e8913a" stroke-width="2" stroke-dasharray="${on ? '0' : '3 3'}" opacity="${on ? 1 : 0.35}"/>`;
        if (eY >= 1) o += `<line x1="${px(0)}" y1="${py(y)}" x2="${px(x)}" y2="${py(y)}" stroke="#e8913a" stroke-width="1.5" stroke-dasharray="3 3" opacity="${on ? 0.9 : 0.25}"/>`;
        o += `<circle cx="${cx}" cy="${cy}" r="5.5" fill="${eY >= 1 ? 'var(--ok, #2f9e44)' : '#2b6cb0'}" stroke="#fff" stroke-width="1.5"/>`;
      });
      const eE = ease(t, TE + 0.2, TE + 0.8);
      if (eE > 0) o += `<text x="${W / 2}" y="${H - 6}" text-anchor="middle" font-size="12" font-weight="900" fill="var(--ok, #2f9e44)" opacity="${eE}">jokainen taulukon rivi = yksi piste</text>`;
      return o;
    },
    caption: (t) => {
      if (t < T0) return `Ensin akselit: aika ${xl} vaaka-akselille, matka ${yl} pystyakselille. Asteikko kasvaa tasaisin välein.`;
      if (t < TE) { const i = Math.min(pts.length - 1, Math.floor((t - T0) / ST)), [x, y] = pts[i]!; return `Rivi ${fmt(x)} s, ${fmt(y)} m: ensin vaakasuunnassa kohtaan ${fmt(x)}, sitten ylös korkeudelle ${fmt(y)}.`; }
      return 'Jokainen taulukon rivi on yksi piste. Aika luetaan vaaka-akselilta, matka pystyakselilta.';
    },
  });
}

export type Leg = [number, number][];
/** Live distance–time graph: frogs hop on their lanes in real seconds while a pen draws each one's s–t curve
 *  underneath. A resting frog sits still and its pen runs flat; a fast frog's line climbs steeply. */
export function stLiveScene(runs: { name: string; col: string; pts: Leg }[], tMax: number, sMax: number, tStep = 2, sStep = 10, opts: { marks?: boolean; end?: string; mid?: string } = {}): AnimPaint {
  const W = 320, H = 268, X0 = 20, L = 236, t0 = 1.0, GX = 44, GY = 92, GW = 256, GH = 140;
  const sAt = (p: Leg, x: number) => { for (let i = 1; i < p.length; i++) { const [a, sa] = p[i - 1]!, [b, sb] = p[i]!; if (x <= b) return sa + ((sb - sa) * (x - a)) / (b - a); } return p[p.length - 1]![1]; };
  const gx = (x: number) => GX + (GW * x) / tMax, gy = (y: number) => GY + GH - (GH * y) / sMax;
  return anim({
    dur: t0 + tMax + 3.5, w: W, h: H, label: 'matka–aika-kuvaaja syntyy',
    frame: (t) => {
      const el = Math.max(0, Math.min(tMax, t - t0));
      let o = '';
      runs.forEach((r, i) => {
        const y = 30 + i * 30, m = sAt(r.pts, el), prev = sAt(r.pts, Math.max(0, el - 0.05)), moving = t > t0 && el < tMax && m - prev > 1e-6;
        const hop = moving ? Math.abs(Math.sin(el * Math.PI * 2.5)) * 9 : 0;
        if (opts.marks) for (let k = 0; k <= Math.floor(el + 1e-9); k++) o += `<line x1="${X0 + (L * sAt(r.pts, k)) / sMax}" y1="${y - 4}" x2="${X0 + (L * sAt(r.pts, k)) / sMax}" y2="${y + 5}" stroke="${r.col}" stroke-width="2"/>`;
        o += `<line x1="${X0}" y1="${y}" x2="${X0 + L}" y2="${y}" stroke="var(--line, #888)" stroke-width="2"/><text x="${X0 + (L * m) / sMax}" y="${y - 3 - hop}" text-anchor="middle" font-size="17">🐸</text><text x="${X0 + L + 14}" y="${y + 4}" font-size="11" font-weight="900" fill="${r.col}">${r.name}</text>`;
        if (!moving && t > t0 && el < tMax) o += `<text x="${X0 + (L * m) / sMax + 12}" y="${y - 10}" font-size="10" fill="${r.col}">zZ</text>`;
      });
      for (let x = 0; x <= tMax + 1e-9; x += tStep) o += `<line x1="${gx(x)}" y1="${gy(0)}" x2="${gx(x)}" y2="${gy(sMax)}" stroke="currentColor" stroke-opacity="${x ? 0.1 : 0.6}"/><text x="${gx(x)}" y="${gy(0) + 12}" text-anchor="middle" font-size="9" fill="currentColor">${x}</text>`;
      for (let y = 0; y <= sMax + 1e-9; y += sStep) o += `<line x1="${gx(0)}" y1="${gy(y)}" x2="${gx(tMax)}" y2="${gy(y)}" stroke="currentColor" stroke-opacity="${y ? 0.1 : 0.6}"/><text x="${gx(0) - 4}" y="${gy(y) + 3}" text-anchor="end" font-size="9" fill="currentColor">${y}</text>`;
      o += `<text x="${gx(tMax)}" y="${gy(0) + 26}" text-anchor="end" font-size="11" font-weight="800" fill="currentColor">t (s)</text><text x="${GX - 6}" y="${GY - 8}" font-size="11" font-weight="800" fill="currentColor">s (m)</text>`;
      runs.forEach((r) => {
        const N = 60, pts: string[] = [];
        for (let j = 0; j <= N; j++) { const x = (el * j) / N; pts.push(`${gx(x).toFixed(1)},${gy(sAt(r.pts, x)).toFixed(1)}`); }
        if (el > 0) o += `<polyline points="${pts.join(' ')}" fill="none" stroke="${r.col}" stroke-width="3" stroke-linejoin="round"/>`;
        o += `<circle cx="${gx(el)}" cy="${gy(sAt(r.pts, el))}" r="4.5" fill="${r.col}" stroke="#fff" stroke-width="1.2"/>`;
      });
      o += `<rect x="${W - 66}" y="${GY - 24}" width="58" height="18" rx="4" fill="#1b2a22"/><text x="${W - 37}" y="${GY - 11}" text-anchor="middle" font-size="11" font-weight="900" fill="#9be08a">${fmt(Math.floor(el * 10) / 10)} s</text>`;
      return o;
    },
    caption: (t) => {
      const el = t - t0;
      if (t < t0) return 'Kello lähtee. Seuraa sammakoita ja kynää: kynä piirtää matkan ajan funktiona.';
      if (el >= tMax) return opts.end ?? 'Jyrkempi viiva = nopeampi. Vaakasuora pätkä = paikallaan, matka ei kasva.';
      if (opts.mid) return opts.mid;
      const rest = runs.filter((r) => Math.abs(sAt(r.pts, el) - sAt(r.pts, Math.max(0, el - 0.1))) < 1e-6);
      if (rest.length) return `${rest.map((r) => r.name).join(' ja ')} lepää: matka ei kasva, joten viiva kulkee vaakasuoraan.`;
      return 'Kun sammakko loikkii, matka kasvaa ja viiva nousee. Nopeampi sammakko nostaa viivaa jyrkemmin.';
    },
  });
}

/** Live speed–time graph: a frog moves along a lane with the given speed profile (t, v pairs, piecewise linear),
 *  dropping a footprint every second; a speedometer needle and a pen on the v–t graph follow the same speed. */
export function vtLiveScene(pts: Leg, tMax: number, vMax: number, vStep = 5, opts: { tri?: [number, number]; end?: string } = {}): AnimPaint {
  const W = 320, H = 280, X0 = 16, L = 210, t0 = 1.0, GX = 44, GY = 104, GW = 256, GH = 140;
  const vAt = (x: number) => { for (let i = 1; i < pts.length; i++) { const [a, va] = pts[i - 1]!, [b, vb] = pts[i]!; if (x <= b) return va + ((vb - va) * (x - a)) / (b - a); } return pts[pts.length - 1]![1]; };
  const N = 400, cum: number[] = [0];
  for (let j = 1; j <= N; j++) { const a = (tMax * (j - 1)) / N, b = (tMax * j) / N; cum.push(cum[j - 1]! + ((vAt(a) + vAt(b)) / 2) * (b - a)); }
  const D = Math.max(cum[N]!, 1e-9), posAt = (x: number) => cum[Math.round((Math.max(0, Math.min(tMax, x)) / tMax) * N)]!;
  const lx = (x: number) => X0 + (L * posAt(x)) / D, gx = (x: number) => GX + (GW * x) / tMax, gy = (v: number) => GY + GH - (GH * v) / vMax;
  const phase = (x: number) => { const d = vAt(Math.min(tMax, x + 0.05)) - vAt(Math.max(0, x - 0.05)); return Math.abs(d) < 1e-6 ? (vAt(x) < 1e-6 ? 'rest' : 'steady') : d > 0 ? 'accel' : 'decel'; };
  return anim({
    dur: t0 + tMax + 3.5, w: W, h: H, label: 'nopeus–aika-kuvaaja syntyy',
    frame: (t) => {
      const el = Math.max(0, Math.min(tMax, t - t0)), v = vAt(el), moving = t > t0 && el < tMax && v > 1e-6;
      let o = `<line x1="${X0}" y1="40" x2="${X0 + L}" y2="40" stroke="var(--line, #888)" stroke-width="2"/>`;
      for (let s = 1; s <= Math.floor(el + 1e-9); s++) o += `<circle cx="${lx(s)}" cy="46" r="2.6" fill="#9be08a"/>${s % 2 ? '' : `<text x="${lx(s)}" y="58" text-anchor="middle" font-size="8" fill="currentColor" opacity=".7">${s}</text>`}`;
      o += `<text x="${lx(el)}" y="${36 - (moving ? Math.abs(Math.sin(el * Math.PI * 2.5)) * 8 : 0)}" text-anchor="middle" font-size="18">🐸</text>`;
      o += `<text x="${X0}" y="74" font-size="9.5" fill="currentColor" opacity=".8">vihreä piste = paikka joka sekunti</text>`;
      // speedometer
      const cx = 274, cy = 52, R = 30, ang = Math.PI * (1 - Math.min(1, v / vMax));
      o += `<path d="M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}" fill="none" stroke="currentColor" stroke-opacity=".5" stroke-width="5"/>`;
      o += `<line x1="${cx}" y1="${cy}" x2="${(cx + (R - 4) * Math.cos(ang)).toFixed(1)}" y2="${(cy - (R - 4) * Math.sin(ang)).toFixed(1)}" stroke="#d9534f" stroke-width="3" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="3" fill="#d9534f"/>`;
      o += `<text x="${cx}" y="${cy + 16}" text-anchor="middle" font-size="12" font-weight="900" fill="#d9534f">${fmt(Math.round(v * 10) / 10)} m/s</text>`;
      for (let x = 0; x <= tMax + 1e-9; x += 2) o += `<line x1="${gx(x)}" y1="${gy(0)}" x2="${gx(x)}" y2="${gy(vMax)}" stroke="currentColor" stroke-opacity="${x ? 0.1 : 0.6}"/><text x="${gx(x)}" y="${gy(0) + 12}" text-anchor="middle" font-size="9" fill="currentColor">${x}</text>`;
      for (let y = 0; y <= vMax + 1e-9; y += vStep) o += `<line x1="${gx(0)}" y1="${gy(y)}" x2="${gx(tMax)}" y2="${gy(y)}" stroke="currentColor" stroke-opacity="${y ? 0.1 : 0.6}"/><text x="${gx(0) - 4}" y="${gy(y) + 3}" text-anchor="end" font-size="9" fill="currentColor">${y}</text>`;
      o += `<text x="${gx(tMax)}" y="${gy(0) + 26}" text-anchor="end" font-size="11" font-weight="800" fill="currentColor">t (s)</text><text x="${GX - 6}" y="${GY - 8}" font-size="11" font-weight="800" fill="currentColor">v (m/s)</text>`;
      const P: string[] = []; for (let j = 0; j <= 80; j++) { const x = (el * j) / 80; P.push(`${gx(x).toFixed(1)},${gy(vAt(x)).toFixed(1)}`); }
      if (el > 0) o += `<polyline points="${P.join(' ')}" fill="none" stroke="#d9534f" stroke-width="3" stroke-linejoin="round"/>`;
      if (opts.tri && el >= opts.tri[1]) {
        const [a, b] = opts.tri, va = vAt(a), vb = vAt(b), dv = vb - va;
        o += `<path d="M ${gx(a)} ${gy(va)} H ${gx(b)} V ${gy(vb)}" fill="none" stroke="#f0b429" stroke-width="2.4" stroke-dasharray="5 3"/>`;
        o += `<text x="${(gx(a) + gx(b)) / 2}" y="${gy(va) + (dv >= 0 ? 13 : -5)}" text-anchor="middle" font-size="10.5" font-weight="900" fill="#f0b429">Δt = ${fmt(b - a)} s</text>`;
        o += `<text x="${gx(b) + 4}" y="${(gy(va) + gy(vb)) / 2 + 4}" font-size="10.5" font-weight="900" fill="#f0b429">Δv = ${fmt(dv)} m/s</text>`;
      }
      o += `<circle cx="${gx(el)}" cy="${gy(v)}" r="4.5" fill="#d9534f" stroke="#fff" stroke-width="1.2"/>`;
      o += `<rect x="${W - 66}" y="${GY - 22}" width="58" height="18" rx="4" fill="#1b2a22"/><text x="${W - 37}" y="${GY - 9}" text-anchor="middle" font-size="11" font-weight="900" fill="#9be08a">${fmt(Math.floor(el * 10) / 10)} s</text>`;
      return o;
    },
    caption: (t) => {
      const el = t - t0;
      if (t < t0) return 'Kello lähtee. Mittari näyttää nopeuden, ja kynä piirtää sen kuvaajaan joka hetki.';
      if (el >= tMax && opts.end) return opts.end;
      if (el >= tMax) return 'Nouseva viiva = nopeus kasvaa, vaakaviiva = nopeus pysyy, laskeva = nopeus pienenee. Vaakaviiva nollassa = paikallaan.';
      return { rest: 'Nopeus on 0: sammakko on paikallaan, ja viiva kulkee nollan kohdalla.', steady: 'Nopeus pysyy samana: viiva on vaakasuora, mutta sammakko liikkuu! Pisteet ovat tasavälein.', accel: 'Nopeus kasvaa: viiva nousee, ja pisteiden välit pitenevät.', decel: 'Nopeus pienenee: viiva laskee, ja pisteiden välit lyhenevät.' }[phase(el)];
    },
  });
}

/** Acceleration as "speed changes by a every second": a boat speeds up (or brakes) in real seconds, dropping a
 *  wake mark each second; each whole second a row (t, v) drops into the table with a "+a" arrow beside it. */
export function accelTableScene(v0: number, a: number, T: number, icon = '🛥️'): AnimPaint {
  const W = 320, t0 = 1.0, X0 = 14, L = 290, H = 96 + (T + 1) * 22 + 30;
  const vAt = (x: number) => v0 + a * x, sAt = (x: number) => v0 * x + (a * x * x) / 2, D = Math.max(sAt(T), 1e-9);
  const lx = (x: number) => X0 + (L * sAt(x)) / D;
  return anim({
    dur: t0 + T + 3.4, w: W, h: H, label: 'kiihtyvyys taulukkona',
    frame: (t) => {
      const el = Math.max(0, Math.min(T, t - t0)), v = vAt(el);
      let o = `<rect x="0" y="22" width="${W}" height="30" fill="color-mix(in srgb, var(--pond, #3a7) 25%, transparent)"/><rect x="0" y="16" width="10" height="40" fill="#8a6a4a"/>`;
      for (let s = 1; s <= Math.floor(el + 1e-9); s++) o += `<line x1="${lx(s)}" y1="30" x2="${lx(s)}" y2="46" stroke="#fff" stroke-opacity=".7" stroke-width="2"/><text x="${lx(s)}" y="64" text-anchor="middle" font-size="9" fill="currentColor" opacity=".75">${s} s</text>`;
      o += `<text x="${Math.min(W - 14, lx(el))}" y="46" text-anchor="middle" font-size="24">${icon}</text>`;
      o += `<rect x="${W - 92}" y="66" width="84" height="20" rx="5" fill="#1b2a22"/><text x="${W - 50}" y="80" text-anchor="middle" font-size="11" font-weight="900" fill="#9be08a">v = ${fmt(Math.round(v * 10) / 10)} m/s</text>`;
      const TX = 70, TY = 104;
      o += `<text x="${TX}" y="${TY}" text-anchor="middle" font-size="12" font-weight="900" fill="currentColor">t (s)</text><text x="${TX + 80}" y="${TY}" text-anchor="middle" font-size="12" font-weight="900" fill="currentColor">v (m/s)</text><line x1="${TX - 40}" y1="${TY + 5}" x2="${TX + 120}" y2="${TY + 5}" stroke="currentColor" stroke-opacity=".5"/>`;
      const rows = t < t0 ? 0 : Math.floor(el + 1e-9) + 1;
      for (let i = 0; i < rows; i++) {
        const p = ease((t - t0 - i) / 0.35, 0, 1), y = TY + 22 + i * 22;
        o += `<g opacity="${p.toFixed(2)}"><text x="${TX}" y="${y}" text-anchor="middle" font-size="13" font-weight="700" fill="currentColor">${i}</text><text x="${TX + 80}" y="${y}" text-anchor="middle" font-size="13" font-weight="900" fill="currentColor">${fmt(vAt(i))}</text></g>`;
        if (i) o += `<g opacity="${p.toFixed(2)}"><path d="M${TX + 108} ${y - 26} q14 11 0 22" fill="none" stroke="var(--sun)" stroke-width="2"/><text x="${TX + 126}" y="${y - 11}" font-size="12" font-weight="900" fill="var(--sun)">${a > 0 ? '+' : '−'}${fmt(Math.abs(a))} m/s</text></g>`;
      }
      return o;
    },
    caption: (t) => {
      const el = t - t0;
      if (t < t0) return `Kello lähtee. Alussa nopeus on ${fmt(v0)} m/s.`;
      if (el < T) return a > 0 ? `Joka sekunti nopeus kasvaa ${fmt(a)} m/s. Valkoiset merkit: sekunnin matkat pitenevät.` : `Jarrutus: joka sekunti nopeus pienenee ${fmt(-a)} m/s. Sekunnin matkat lyhenevät.`;
      return a > 0 ? `Kiihtyvyys on ${fmt(a)} m/s²: nopeus kasvaa ${fmt(a)} m/s joka sekunti.` : `Kiihtyvyys on −${fmt(-a)} m/s²: nopeus pienenee ${fmt(-a)} m/s joka sekunti. Hidastuminenkin on kiihtyvyyttä.`;
    },
  });
}

/** One motion, two graphs: a frog follows a speed profile (t, v pairs) while two pens draw its distance–time and
 *  speed–time graphs side by side, so the learner sees both pictures grow from the same seconds. */
export function dualLiveScene(vpts: Leg, tMax: number, sMax: number, vMax: number, end = 'Sama liike, kaksi kuvaajaa: matka–aika näyttää, missä ollaan, nopeus–aika kuinka lujaa mennään.'): AnimPaint {
  const W = 320, H = 236, X0 = 16, L = 288, t0 = 1.0, GY = 78, GW = 118, GH = 118, G1 = 36, G2 = 194;
  const vAt = (x: number) => { for (let i = 1; i < vpts.length; i++) { const [a, va] = vpts[i - 1]!, [b, vb] = vpts[i]!; if (x <= b) return va + ((vb - va) * (x - a)) / (b - a); } return vpts[vpts.length - 1]![1]; };
  const N = 400, cum: number[] = [0];
  for (let j = 1; j <= N; j++) { const a = (tMax * (j - 1)) / N, b = (tMax * j) / N; cum.push(cum[j - 1]! + ((vAt(a) + vAt(b)) / 2) * (b - a)); }
  const sAt = (x: number) => cum[Math.round((Math.max(0, Math.min(tMax, x)) / tMax) * N)]!;
  const phase = (x: number) => { const d = vAt(Math.min(tMax, x + 0.05)) - vAt(Math.max(0, x - 0.05)); return Math.abs(d) < 1e-6 ? (vAt(x) < 1e-6 ? 'rest' : 'steady') : d > 0 ? 'accel' : 'decel'; };
  const graph = (gx0: number, yMax: number, f: (x: number) => number, el: number, yl: string, col: string) => {
    const gx = (x: number) => gx0 + (GW * x) / tMax, gy = (y: number) => GY + GH - (GH * y) / yMax;
    let o = `<rect x="${gx0}" y="${GY}" width="${GW}" height="${GH}" fill="currentColor" fill-opacity=".04"/><line x1="${gx0}" y1="${GY}" x2="${gx0}" y2="${GY + GH}" stroke="currentColor" stroke-opacity=".6"/><line x1="${gx0}" y1="${GY + GH}" x2="${gx0 + GW}" y2="${GY + GH}" stroke="currentColor" stroke-opacity=".6"/>`;
    o += `<text x="${gx0 - 4}" y="${GY - 6}" font-size="10.5" font-weight="800" fill="currentColor">${yl}</text><text x="${gx0 + GW}" y="${GY + GH + 13}" text-anchor="end" font-size="10" font-weight="800" fill="currentColor">t (s)</text>`;
    const P: string[] = []; for (let j = 0; j <= 80; j++) { const x = (el * j) / 80; P.push(`${gx(x).toFixed(1)},${gy(f(x)).toFixed(1)}`); }
    if (el > 0) o += `<polyline points="${P.join(' ')}" fill="none" stroke="${col}" stroke-width="3" stroke-linejoin="round"/>`;
    return o + `<circle cx="${gx(el)}" cy="${gy(f(el))}" r="4" fill="${col}" stroke="#fff" stroke-width="1.2"/>`;
  };
  return anim({
    dur: t0 + tMax + 3.5, w: W, h: H, label: 'matka–aika- ja nopeus–aika-kuvaaja syntyvät yhtä aikaa',
    frame: (t) => {
      const el = Math.max(0, Math.min(tMax, t - t0)), v = vAt(el), moving = t > t0 && el < tMax && v > 1e-6;
      let o = `<line x1="${X0}" y1="34" x2="${X0 + L}" y2="34" stroke="var(--line, #888)" stroke-width="2"/>`;
      for (let s = 1; s <= Math.floor(el + 1e-9); s++) o += `<circle cx="${X0 + (L * sAt(s)) / sMax}" cy="40" r="2.6" fill="#9be08a"/>`;
      o += `<text x="${X0 + (L * sAt(el)) / sMax}" y="${30 - (moving ? Math.abs(Math.sin(el * Math.PI * 2.5)) * 8 : 0)}" text-anchor="middle" font-size="18">🐸</text>`;
      o += `<text x="${X0}" y="56" font-size="10" font-weight="900" fill="#9be08a">t = ${fmt(Math.floor(el * 10) / 10)} s</text><text x="${X0 + L}" y="56" text-anchor="end" font-size="10" font-weight="900" fill="#d9534f">v = ${fmt(Math.round(v * 10) / 10)} m/s</text>`;
      return o + graph(G1, sMax, sAt, el, 's (m)', '#2b6cb0') + graph(G2, vMax, vAt, el, 'v (m/s)', '#d9534f');
    },
    caption: (t) => {
      const el = t - t0;
      if (t < t0) return 'Kello lähtee. Vasen kynä piirtää matkan, oikea nopeuden – samasta liikkeestä.';
      if (el >= tMax) return end;
      return { rest: 'Paikallaan: matka–aika vaakasuora, nopeus–aika nollassa.', steady: 'Tasainen vauhti: matka–aika nousee suorana, nopeus–aika on vaakasuora.', accel: 'Nopeus kasvaa: matka–aika jyrkkenee, nopeus–aika nousee.', decel: 'Nopeus pienenee: matka–aika loivenee, nopeus–aika laskee.' }[phase(el)];
    },
  });
}
