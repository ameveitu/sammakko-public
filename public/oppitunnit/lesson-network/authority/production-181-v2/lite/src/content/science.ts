// Observation notebook (havaintovihko) and observing motion (grades 1–2, one 3–6 node).
import type { Rng } from '../engine/rng';
import type { NodeSpec, Option } from '../engine/types';
import { duck, frog, svg, THINGS } from '../ui/art';
import { cases, choose, fixed, paint, table, txt } from './kit';
import { anim, ease, type AnimPaint } from '../ui/anim';
import { AUDIT_REV } from './audit-rev';

// ---------------------------------------------------------------- observed objects
type Kind = 'lehti' | 'simpukka' | 'sieni';
interface Obs { kind: Kind; color: number; mark: boolean }
const PALETTE: Record<Kind, string[]> = {
  lehti: ['#6cb85c', '#e8b33a', '#d4553a'],
  simpukka: ['#f2b58e', '#d9d2c5', '#c78fd0'],
  sieni: ['#d0533b', '#b07a45', '#e6c44a'],
};
const COLOR_NAME: Record<Kind, string[]> = { lehti: ['vihreä', 'keltainen', 'punainen'], simpukka: ['oranssi', 'harmaa', 'violetti'], sieni: ['punainen', 'ruskea', 'keltainen'] };
const MARK: Record<Kind, [string, string]> = { lehti: ['Lehdessä on reikä.', 'Lehti on ehjä.'], simpukka: ['Simpukassa on raitoja.', 'Simpukassa ei ole raitoja.'], sieni: ['Sienen hatussa on pilkkuja.', 'Sienen hattu on sileä.'] };
const EXPL: Record<Kind, [string, string]> = { lehti: ['Toukka söi lehden.', 'Lehti putosi eilen.'], simpukka: ['Simpukka on hyvin vanha.', 'Aalto toi simpukan rantaan.'], sieni: ['Sieni on myrkyllinen.', 'Sieni kasvoi yhdessä yössä.'] };

function obsBody(o: Obs) {
  const c = PALETTE[o.kind][o.color]!;
  let body = '';
  if (o.kind === 'lehti') body = `<path d="M15 75 Q10 15 75 12 Q80 70 15 75Z" fill="${c}"/><path d="M18 72 L70 16" stroke="#0003" stroke-width="2"/>` + (o.mark ? `<circle cx="52" cy="42" r="8" fill="var(--card)"/>` : '');
  if (o.kind === 'simpukka') body = `<path d="M10 70 Q45 -5 80 70Z" fill="${c}" stroke="#0004" stroke-width="2"/>` + (o.mark ? [25, 35, 45, 55, 65].map((x) => `<path d="M45 68 L${x} 26" stroke="#7a4a2a" stroke-width="3"/>`).join('') : '');
  if (o.kind === 'sieni') body = `<rect x="38" y="45" width="14" height="32" rx="5" fill="#efe6d2"/><path d="M12 50 Q45 0 78 50Z" fill="${c}"/>` + (o.mark ? `<circle cx="32" cy="34" r="5" fill="#fff"/><circle cx="50" cy="24" r="5" fill="#fff"/><circle cx="60" cy="40" r="4" fill="#fff"/>` : '');
  return body;
}
function obsArt(o: Obs, s = 90) {
  return svg(s, s, `<g transform="scale(${s / 90})">${obsBody(o)}</g>`);
}
const MARK_AT: Record<Kind, [number, number]> = { lehti: [52, 42], simpukka: [45, 46], sieni: [46, 32] };
const COLOR_AT: Record<Kind, [number, number]> = { lehti: [34, 56], simpukka: [26, 60], sieni: [24, 44] };
/** Split a sentence into lines of at most n characters. */
function wrap(t: string, n = 20) {
  const out: string[] = [];
  for (const w of t.split(' ')) { const l = out[out.length - 1]; if (l !== undefined && (l + ' ' + w).length <= n) out[out.length - 1] = l + ' ' + w; else out.push(w); }
  return out;
}

/** The magnifier looks at the colour, then at the mark; each finding is written in the notebook.
 *  Then a guess floats up, is stamped "ei näy kuvasta" and drifts away. */
function lookScene(o: Obs, guess = EXPL[o.kind][0]): AnimPaint {
  const W = 320, H = 210, S = 130, OX = 14, OY = 40, k = S / 90;
  const at = ([x, y]: [number, number]) => [OX + x * k, OY + y * k] as const;
  const [cx, cy] = at(COLOR_AT[o.kind]), [mx, my] = at(MARK_AT[o.kind]);
  const notes = [`Väri: ${COLOR_NAME[o.kind][o.color]}`, MARK[o.kind][o.mark ? 0 : 1]];
  const TN = [1.6, 3.6], tG = 5.0, tX = 6.4;
  return anim({
    dur: 10, w: W, h: H, label: 'Havainto ja arvaus',
    frame: (t) => {
      let s = `<g transform="translate(${OX} ${OY}) scale(${k})">${obsBody(o)}</g>`;
      // notebook
      s += `<rect x="168" y="18" width="146" height="176" rx="8" fill="var(--card)" stroke="var(--line)" stroke-width="2"/><text x="180" y="38" font-size="12" font-weight="900" fill="var(--pond)">Havaintovihko</text>`;
      for (let i = 0; i < 7; i++) s += `<line x1="176" y1="${56 + i * 18}" x2="306" y2="${56 + i * 18}" stroke="var(--line)" stroke-width="1"/>`;
      let row = 0;
      notes.forEach((n, i) => {
        const g = ease(t, TN[i]! + 0.4, TN[i]! + 1.2);
        wrap(n).forEach((ln, j) => {
          if (g > 0) s += `<text x="180" y="${52 + (row + j) * 18}" font-size="12" font-weight="800" fill="currentColor" clip-path="inset(0 ${100 - 100 * g}% 0 0)" opacity="${Math.min(1, g * 3)}">${j === 0 ? '✓ ' : '  '}${ln}</text>`;
        });
        row += wrap(n).length;
      });
      if (o.mark && t > TN[1]! + 0.2) { const g = ease(t, TN[1]! + 0.2, TN[1]! + 0.6); s += `<circle cx="${mx}" cy="${my}" r="${18 * g + 2}" fill="none" stroke="var(--sun)" stroke-width="3" stroke-dasharray="5 3"/>`; }
      // magnifier path: in → colour → mark → away
      const p1 = ease(t, 0.3, 1.5), p2 = ease(t, 2.6, 3.5), p3 = ease(t, 4.6, 5.0);
      if (p3 < 1) {
        const x0 = 150, y0 = 190;
        let x = x0 + (cx - x0) * p1, y = y0 + (cy - y0) * p1;
        x += (mx - cx) * p2; y += (my - cy) * p2;
        x += (x0 - mx) * p3; y += (y0 - my) * p3;
        s += `<g opacity="${1 - p3}"><circle cx="${x}" cy="${y}" r="20" fill="rgba(255,255,255,.25)" stroke="currentColor" stroke-width="3.5"/><line x1="${x + 14}" y1="${y + 14}" x2="${x + 28}" y2="${y + 28}" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></g>`;
      }
      // the guess
      const gi = ease(t, tG, tG + 0.5), go = ease(t, tX + 1.0, tX + 1.8);
      if (gi > 0 && go < 1) {
        const lines = wrap(guess, 22), y = 6, wb = 150, hb = 14 + lines.length * 15;
        s += `<g opacity="${gi * (1 - go)}"><rect x="10" y="${y}" width="${wb}" height="${14 + lines.length * 15}" rx="14" fill="var(--soft)" opacity=".18"/><rect x="10" y="${y}" width="${wb}" height="${14 + lines.length * 15}" rx="14" fill="none" stroke="var(--soft)" stroke-width="2" stroke-dasharray="4 3"/>`;
        lines.forEach((ln, j) => { s += `<text x="${10 + wb / 2}" y="${y + 18 + j * 15}" text-anchor="middle" font-size="12" font-weight="700" font-style="italic" fill="currentColor">${ln}</text>`; });
        const st = ease(t, tX, tX + 0.3);
        if (st > 0) s += `<g transform="translate(${10 + wb / 2} ${y + hb + 14}) rotate(-6) scale(${1.6 - 0.6 * st})" opacity="${st}"><rect x="-58" y="-12" width="116" height="22" rx="4" fill="none" stroke="var(--bad)" stroke-width="2.5"/><text x="0" y="4" text-anchor="middle" font-size="12" font-weight="900" fill="var(--bad)">EI NÄY KUVASTA</text></g>`;
        s += `</g>`;
      }
      return s;
    },
    caption: (t) => t < TN[0]! ? 'Katsotaan tarkasti suurennuslasilla.'
      : t < TN[1]! ? `Väri näkyy: ${COLOR_NAME[o.kind][o.color]}. Se kirjataan vihkoon.`
      : t < tG ? `${MARK[o.kind][o.mark ? 0 : 1]} Sekin näkyy, joten kirjataan.`
      : t < tX ? `Entä ”${guess.replace(/\.$/, '')}”? Näkyykö se kuvasta?`
      : t < tX + 1.8 ? 'Ei näy! Se on arvaus, ei havainto.'
      : 'Havaintoon kirjataan vain se, mikä näkyy.',
  });
}
const randObs = (r: Rng, kind?: Kind): Obs => ({ kind: kind ?? r.pick(['lehti', 'simpukka', 'sieni'] as const), color: r.int(0, 2), mark: r.chance(0.5) });

// ---------------------------------------------------------------- places
const PLACES = {
  ranta: { name: 'ranta', art: '<rect width="80" height="56" rx="8" fill="#f1dca7"/><path d="M0 34 Q20 26 40 34 T80 34 V56 H0Z" fill="#6aaee0"/>' },
  metsa: { name: 'metsä', art: '<rect width="80" height="56" rx="8" fill="#cfe8c2"/><path d="M18 50 L28 14 L38 50Z M44 50 L56 8 L68 50Z" fill="#2f7a3d"/>' },
  kallio: { name: 'kallio', art: '<rect width="80" height="56" rx="8" fill="#d8e7f2"/><path d="M4 52 Q20 16 44 24 Q66 12 78 52Z" fill="#8f979b"/>' },
  niitty: { name: 'niitty', art: '<rect width="80" height="56" rx="8" fill="#e6f2c4"/><circle cx="20" cy="36" r="6" fill="#f28cb1"/><circle cx="44" cy="28" r="6" fill="#f4c542"/><circle cx="62" cy="40" r="6" fill="#9b7be0"/>' },
} as const;
type Place = keyof typeof PLACES;
const placeArt = (p: Place, w = 80) => svg(80, 56, PLACES[p].art).replace('width="100%"', `width="${w}"`);
const ITEMS = ['simpukka', 'kapy', 'kukka', 'kala', 'kivi', 'lehti', 'tahti'];
const itemArt = (k: string, s = 40) => svg(40, 40, THINGS[k]!.draw(20, 20, 30)).replace('width="100%"', `width="${s}"`);

/** A notebook presentation: columns of place + n item icons. */
function presentArt(cols: { place: Place | null; item: string; n: number }[]) {
  const W = 92;
  return svg(cols.length * W, 170, cols.map((c, i) => {
    const x = i * W + 6;
    return (c.place ? `<g transform="translate(${x} 4)">${PLACES[c.place].art}</g>` : `<rect x="${x}" y="4" width="80" height="56" rx="8" fill="none" stroke="var(--line)" stroke-dasharray="4 4"/>`) +
      Array.from({ length: c.n }, (_, j) => THINGS[c.item]!.draw(x + 40, 82 + j * 28, 24)).join('');
  }).join(''));
}

// ---------------------------------------------------------------- motion strips
/** Multi-exposure strip: positions over equal time steps, faded earlier frames. */
function stripArt(xs: number[], thing: 'duck' | 'lehti' = 'duck', ref = true) {
  const W = 320;
  let s = `<path d="M0 78 H${W}" stroke="#6aaee0" stroke-width="6"/>`;
  if (ref) s += THINGS.kivi!.draw(W - 26, 64, 34);
  xs.forEach((x, i) => {
    const op = 0.25 + (0.75 * (i + 1)) / xs.length;
    const art = thing === 'duck' ? duck(x, 46, 15) : THINGS.lehti!.draw(x, 60, 28);
    s += `<g opacity="${op.toFixed(2)}">${art}</g><text x="${x}" y="${100 + 12 * stackAt(xs, i)}" text-anchor="middle" font-size="12" fill="currentColor">${i + 1}</text>`;
  });
  return svg(W, 106 + 12 * Math.max(0, ...xs.map((_, i) => stackAt(xs, i))), s);
}
type Change = 'stop' | 'turn' | 'faster' | 'steady';
function motion(r: Rng, c: Change): number[] {
  const x0 = r.int(20, 40), d = r.int(36, 44);
  if (c === 'steady') return [0, 1, 2, 3, 4].map((i) => x0 + i * d * 0.9);
  if (c === 'stop') return [0, 1, 2, 2, 2].map((i) => x0 + i * d);
  if (c === 'turn') return [0, 1, 2, 1, 0].map((i) => x0 + 20 + i * d * 1.2);
  return [0, 24, 62, 120, 200].map((v) => x0 + v * 1.1);
}
const CHANGE_OPT: Record<Change, Option> = {
  stop: { text: '⏹ Pysähtyi', speak: 'Pysähtyi' },
  turn: { text: '↩️ Kääntyi takaisin', speak: 'Kääntyi takaisin' },
  faster: { text: '⏩ Nopeutui', speak: 'Nopeutui' },
  steady: { text: '➡️ Liikkui koko ajan samalla tavalla', speak: 'Liikkui koko ajan samalla tavalla' },
};
const CHANGES: Change[] = ['stop', 'turn', 'faster', 'steady'];
const CHANGE_EXPLAIN: Record<Change, string> = {
  stop: 'Viimeisissä kuvissa ankka on samassa paikassa: se pysähtyi.',
  turn: 'Ankka meni ensin oikealle ja sitten takaisin vasemmalle.',
  faster: 'Välit kasvavat: samassa ajassa ankka meni yhä pidemmälle. Se nopeutui.',
  steady: 'Välit ovat yhtä pitkiä ja suunta sama: liike ei muuttunut.',
};

/** How many earlier snapshots sit at (almost) the same spot: their labels are stacked. */
const stackAt = (xs: number[], i: number) => xs.slice(0, i).filter((x) => Math.abs(x - xs[i]!) < 8).length;

/** Why a picked change is wrong (true whenever the picked change differs from the real one). */
const CHANGE_WHY: Record<Change, string> = {
  stop: 'Katso viimeisiä kuvia: ankka ei ole niissä samassa kohdassa, joten se ei pysähtynyt.',
  turn: 'Ankka ei palannut takaisin: se ui koko ajan samaan suuntaan.',
  faster: 'Välit eivät kasva. Ankka ei nopeutunut.',
  steady: 'Katso välejä ja suuntaa tarkasti: jokin niistä muuttui.',
};

/** The duck swims for real; at every equal tick a snapshot stays behind and is numbered, so the
 *  strip is built while you watch. With `reveal` the gaps are then compared one by one. */
function swimScene(xs: number[], c: Change | null, reveal = true): AnimPaint {
  const W = 320, H = 182, GY = 78, STEP = 1.1, t0 = 0.6, tN = t0 + (xs.length - 1) * STEP;
  const tV = tN + 0.7, GAP = 0.7, dur = reveal && c ? tV + (xs.length - 1) * GAP + 2.2 : tN + 1.0;
  const xAt = (t: number) => {
    if (t <= t0) return xs[0]!;
    const k = Math.min(xs.length - 2, Math.floor((t - t0) / STEP)), f = Math.min(1, (t - t0 - k * STEP) / STEP);
    return xs[k]! + (xs[k + 1]! - xs[k]!) * f;
  };
  const dirAt = (t: number) => { const a = xAt(t - 0.05), b = xAt(t + 0.05); return b < a - 0.01 ? -1 : 1; };
  const duckAt = (x: number, dir: number, op = 1) => `<g opacity="${op}"${dir < 0 ? ` transform="translate(${2 * x} 0) scale(-1 1)"` : ''}>${duck(x, GY - 32, 15)}</g>`;
  return anim({
    dur, w: W, h: H, label: 'Ankka ui',
    frame: (t) => {
      let s = `<path d="M0 ${GY} H${W}" stroke="#6aaee0" stroke-width="6"/>`;
      // snapshots
      xs.forEach((x, i) => {
        const ti = t0 + i * STEP;
        if (t < ti) return;
        const flash = 1 - ease(t, ti, ti + 0.35);
        if (flash > 0) s += `<circle cx="${x}" cy="${GY - 30}" r="${30 - 10 * flash}" fill="var(--sun)" opacity="${0.5 * flash}"/>`;
        const dir = i > 0 && xs[i]! < xs[i - 1]! ? -1 : i === 0 ? 1 : (xs[i] === xs[i - 1] ? (i > 1 && xs[i - 1]! < xs[i - 2]! ? -1 : 1) : 1);
        s += duckAt(x, dir, 0.35);
        s += `<text x="${x}" y="${GY + 22 + 13 * stackAt(xs, i)}" text-anchor="middle" font-size="12" font-weight="800" fill="currentColor">${i + 1}</text>`;
      });
      if (t < tN + 0.4) s += duckAt(xAt(t), dirAt(Math.min(t, tN - 0.06)));
      // compare gaps
      if (reveal && c) {
        for (let i = 0; i < xs.length - 1; i++) {
          const g = ease(t, tV + i * GAP, tV + i * GAP + 0.4);
          if (g <= 0) continue;
          const a = xs[i]!, b = xs[i + 1]!, y = GY + 62 + i * 11;
          if (Math.abs(b - a) < 2) { s += `<circle cx="${a}" cy="${y}" r="3.5" fill="var(--bad)" opacity="${g}"/><text x="${a + 8}" y="${y + 4}" font-size="10" font-weight="900" fill="var(--bad)" opacity="${g}">ei liikettä</text>`; continue; }
          s += `<path d="M${a} ${y} H${a + (b - a) * g}" stroke="${b < a ? 'var(--bad)' : 'var(--sun)'}" stroke-width="5" stroke-linecap="round"/>`;
          if (g >= 1) s += `<path d="M${b} ${y - 5} L${b + (b > a ? 6 : -6)} ${y} L${b} ${y + 5}" fill="${b < a ? 'var(--bad)' : 'var(--sun)'}"/>`;
        }
      }
      return s;
    },
    caption: (t) => {
      if (t < t0) return 'Ankka lähtee uimaan. Kuva otetaan aina yhtä pitkän ajan välein.';
      const k = Math.floor((t - t0) / STEP) + 1;
      if (t < tN + 0.2) return `Klik! Kuva ${Math.min(k, xs.length)}.`;
      if (!reveal || !c) return 'Vertaa välejä: mikä muuttui?';
      if (t < tV + (xs.length - 1) * GAP + 0.4) return 'Verrataan välejä: kuinka pitkälle ankka ehti kuvasta seuraavaan?';
      return CHANGE_EXPLAIN[c];
    },
  });
}

const VERDICT: Record<Change, string> = { stop: 'pysähtyi', turn: 'kääntyi takaisin', faster: 'nopeutui', steady: 'ei muuttunut' };

/** Two ducks swim at the same time; one camera snaps both at the same ticks. With `reveal` each
 *  lane gets its verdict (or, with `speed`, the faster duck is pointed out). */
function duoScene(lanes: { xs: number[]; c: Change }[], reveal = true, speed = false): AnimPaint {
  const W = 320, LH = 88, H = lanes.length * LH + 2, STEP = 1.1, t0 = 0.6, n = lanes[0]!.xs.length, tN = t0 + (n - 1) * STEP;
  const tV = tN + 0.6, dur = reveal ? tV + lanes.length * 1.4 + 1.6 : tN + 1.0;
  const xAt = (xs: number[], t: number) => {
    if (t <= t0) return xs[0]!;
    const k = Math.min(xs.length - 2, Math.floor((t - t0) / STEP)), f = Math.min(1, (t - t0 - k * STEP) / STEP);
    return xs[k]! + (xs[k + 1]! - xs[k]!) * f;
  };
  const gapOf = (xs: number[]) => xs[1]! - xs[0]!;
  const fast = speed ? (gapOf(lanes[0]!.xs) > gapOf(lanes[1]!.xs) ? 0 : 1) : -1;
  const duckAt = (x: number, y: number, dir: number, op = 1) => `<g opacity="${op}"${dir < 0 ? ` transform="translate(${2 * x} 0) scale(-1 1)"` : ''}>${duck(x, y, 13)}</g>`;
  return anim({
    dur, w: W, h: H, label: 'Kaksi ankkaa',
    frame: (t) => {
      let s = '';
      const k = t < t0 ? -1 : Math.min(n - 1, Math.floor((t - t0) / STEP + 1e-6));
      if (k >= 0) { const f = 1 - ease(t, t0 + k * STEP, t0 + k * STEP + 0.3); if (f > 0) s += `<rect x="0" y="0" width="${W}" height="${H}" rx="10" fill="var(--sun)" opacity="${0.18 * f}"/>`; }
      lanes.forEach((L, li) => {
        const GY = 62 + li * LH;
        s += `<text x="6" y="${GY - 48}" font-size="11" font-weight="900" fill="var(--pond)">${li ? 'Alempi ankka' : 'Ylempi ankka'}</text><path d="M0 ${GY} H${W}" stroke="#6aaee0" stroke-width="5"/>`;
        L.xs.forEach((x, i) => {
          if (t < t0 + i * STEP) return;
          const dir = i > 0 && L.xs[i]! < L.xs[i - 1]! ? -1 : (i > 1 && L.xs[i] === L.xs[i - 1] && L.xs[i - 1]! < L.xs[i - 2]! ? -1 : 1);
          s += duckAt(x, GY - 26, dir, 0.35);
          if (L.xs.indexOf(x) === i) {
            const seen = L.xs.map((v, j) => (v === x && t >= t0 + j * STEP ? j + 1 : 0)).filter(Boolean);
            s += `<text x="${x}" y="${GY + 16}" text-anchor="middle" font-size="11" font-weight="800" fill="currentColor">${seen.join('·')}</text>`;
          }
        });
        if (t < tN + 0.4) { const x = xAt(L.xs, t), d = xAt(L.xs, Math.min(t, tN - 0.06) + 0.05) < xAt(L.xs, Math.min(t, tN - 0.06) - 0.05) ? -1 : 1; s += duckAt(x, GY - 26, d); }
        if (reveal) {
          const g = ease(t, tV + li * 1.4, tV + li * 1.4 + 0.4);
          if (g > 0) {
            const txt = speed ? (li === fast ? 'nopeampi: pidemmät välit' : 'hitaampi: lyhyemmät välit') : `liike ${VERDICT[L.c]}`;
            const hot = speed ? li === fast : L.c !== 'steady';
            s += `<g opacity="${g}"><rect x="${W - 168}" y="${GY - 61}" width="162" height="17" rx="8.5" fill="${hot ? 'var(--sun)' : 'var(--card)'}" stroke="var(--line)"/><text x="${W - 87}" y="${GY - 49}" text-anchor="middle" font-size="11" font-weight="900" fill="var(--ink)">${txt}</text></g>`;
          }
        }
      });
      return s;
    },
    caption: (t) => {
      if (t < t0) return 'Kaksi ankkaa lähtee yhtä aikaa. Sama kamera kuvaa molemmat.';
      if (t < tN + 0.2) return `Klik! Kuva ${Math.min(n, Math.floor((t - t0) / STEP) + 1)} molemmista.`;
      if (!reveal) return speed ? 'Kumpi ankka ui nopeammin?' : 'Kumman ankan liike muuttui?';
      if (t < tV) return 'Vertaa ankkoja yksi kerrallaan.';
      const i = Math.min(lanes.length - 1, Math.floor((t - tV) / 1.4));
      if (t < tV + lanes.length * 1.4) {
        const L = lanes[i]!;
        if (speed) return i === fast ? `${i ? 'Alempi' : 'Ylempi'} ankka ehtii kuvasta toiseen pidemmälle: se on nopeampi.` : `${i ? 'Alempi' : 'Ylempi'} ankka ehtii samassa ajassa lyhyemmän matkan.`;
        return `${i ? 'Alempi' : 'Ylempi'} ankka: ${CHANGE_EXPLAIN[L.c].toLowerCase()}`;
      }
      return speed ? 'Samassa ajassa pidemmälle = nopeampi.' : 'Liike muuttui, kun välit tai suunta muuttuivat.';
    },
  });
}
const UPDOWN: Option[] = [{ text: 'Ylempi ankka', speak: 'Ylempi ankka' }, { text: 'Alempi ankka', speak: 'Alempi ankka' }];

/** Before / after frames with a fixed stone as reference. */
function framesArt(frames: { x: number; color?: number }[]) {
  const FW = 150;
  return svg(frames.length * (FW + 8), 110, frames.map((f, i) => {
    const ox = i * (FW + 8);
    const leaf = `<g transform="translate(${ox + f.x - 20} 34) scale(.45)">${obsArt({ kind: 'lehti', color: f.color ?? 0, mark: false }).replace(/<\/?svg[^>]*>/g, '')}</g>`;
    return `<rect x="${ox}" y="0" width="${FW}" height="96" rx="10" fill="#d8eef9" stroke="var(--line)"/><path d="M${ox} 70 H${ox + FW}" stroke="#6aaee0" stroke-width="4"/>` +
      THINGS.kivi!.draw(ox + 120, 72, 32) + leaf + `<text x="${ox + FW / 2}" y="110" text-anchor="middle" font-size="12" fill="currentColor">${frames.length === 2 ? (i ? 'jälkeen' : 'ennen') : i + 1}</text>`;
  }).join(''));
}
type LeafAct = 'drift' | 'back' | 'colour' | 'still';
const LEAF_SAY: Record<LeafAct, string> = {
  drift: 'ajelehti toiseen kohtaan: se liikkui',
  back: 'kävi kauempana ja palasi: se liikkui',
  colour: 'vain vaihtoi väriä: se ei liikkunut',
  still: 'pysyi paikallaan: se ei liikkunut',
};
const leafMoves = (a: LeafAct) => a === 'drift' || a === 'back';

/** Three leaves float in their own lanes, each next to a fixed stone. Some drift, some go and come
 *  back, some only change colour. With `reveal`, ghosts of the start positions appear and every
 *  lane gets its verdict. */
function pondScene(acts: LeafAct[], x0s: number[], reveal = true): AnimPaint {
  const W = 320, LH = 54, H = 14 + acts.length * LH + 6, SX = 286;
  const dx = (i: number) => (x0s[i]! > 120 ? -70 : 70);
  const tV = 5.2, dur = reveal ? tV + 1.0 + acts.length * 1.3 + 1.2 : 5.4;
  const leafAt = (i: number, t: number) => {
    const a = acts[i]!, x0 = x0s[i]!;
    if (a === 'drift') return x0 + dx(i) * ease(t, 1.0, 3.6);
    if (a === 'back') return x0 + dx(i) * (ease(t, 1.0, 2.4) - ease(t, 2.8, 4.2));
    return x0;
  };
  const leaf = (x: number, y: number, col: number, op = 1, ghost = false) => ghost
    ? `<path transform="translate(${x - 18} ${y - 18}) scale(.4)" d="M15 75 Q10 15 75 12 Q80 70 15 75Z" fill="none" stroke="currentColor" stroke-width="5" stroke-dasharray="8 6" opacity="${op}"/>`
    : `<g transform="translate(${x - 18} ${y - 18}) scale(.4)" opacity="${op}">${obsBody({ kind: 'lehti', color: col, mark: false })}</g>`;
  return anim({
    dur, w: W, h: H, label: 'Lehdet lammessa',
    frame: (t) => {
      let s = `<rect x="0" y="0" width="${W}" height="${H}" rx="12" fill="#d8eef9"/>`;
      acts.forEach((a, i) => {
        const y = 14 + i * LH + LH / 2, bob = Math.sin(t * 2.2 + i) * 1.5;
        s += `<path d="M6 ${y + 14} Q80 ${y + 10 + bob} 160 ${y + 14} T${W - 6} ${y + 14}" stroke="#6aaee0" stroke-width="3" fill="none"/>`;
        s += THINGS.kivi!.draw(SX, y + 6, 30);
        const x = leafAt(i, t), cg = a === 'colour' ? ease(t, 1.4, 3.2) : 0;
        if (reveal && t > tV) {
          const g = ease(t, tV, tV + 0.6);
          s += leaf(x0s[i]!, y + bob, 0, g * 0.7, true);
          if (leafMoves(a) && Math.abs(x - x0s[i]!) > 2) s += `<path d="M${x0s[i]} ${y + 22} H${x}" stroke="var(--sun)" stroke-width="3" stroke-dasharray="4 3" opacity="${g}"/>`;
        }
        s += leaf(x, y + bob, 0, 1 - cg);
        if (cg > 0) s += leaf(x, y + bob, 1, cg);
        s += `<circle cx="${x - 22}" cy="${y - 14 + bob}" r="9" fill="var(--card)" stroke="var(--line)"/><text x="${x - 22}" y="${y - 10 + bob}" text-anchor="middle" font-size="11" font-weight="900" fill="currentColor">${i + 1}</text>`;
        if (reveal) {
          const tl = tV + 1.0 + i * 1.3, g = ease(t, tl, tl + 0.4);
          if (g > 0) { const ok = leafMoves(a); s += `<g opacity="${g}"><rect x="${SX - 62}" y="${y - 25}" width="84" height="18" rx="9" fill="${ok ? 'var(--sun)' : 'var(--card)'}" stroke="var(--line)"/><text x="${SX - 20}" y="${y - 12}" text-anchor="middle" font-size="11" font-weight="900" fill="var(--ink)">${ok ? 'liikkui' : 'ei liikkunut'}</text></g>`; }
        }
      });
      return s;
    },
    caption: (t) => {
      if (t < 1.0) return 'Katso tarkasti jokaista lehteä ja sen kiveä.';
      if (t < 4.4) return 'Lehdet kelluvat…';
      if (!reveal || t < tV + 1.0) return reveal ? 'Katkoviiva näyttää, missä kukin lehti oli alussa.' : 'Mitkä lehdet liikkuivat?';
      const i = Math.floor((t - tV - 1.0) / 1.3);
      if (i < acts.length) return `Lehti ${i + 1} ${LEAF_SAY[acts[i]!]}.`;
      return 'Liike on paikan muuttumista. Pelkkä värin muutos ei ole liikettä.';
    },
  });
}

const MOVED: Option = { text: 'Liikkui', speak: 'Liikkui' };
const STILL: Option = { text: 'Ei liikkunut', speak: 'Ei liikkunut' };

const DAYS = ['maanantai', 'tiistai', 'keskiviikko', 'torstai'];
const DAY_ESS = (d: string) => d + 'na';
const DAY_GEN: Record<string, string> = { maanantai: 'maanantain', tiistai: 'tiistain', keskiviikko: 'keskiviikon', torstai: 'torstain' };

/** Each day's notebook page is counted dot by dot; the count flies into the table row.
 *  At the end the biggest row lights up. */
function dataScene(ns: number[]): AnimPaint {
  const W = 320, H = 34 + ns.length * 62, days = DAYS.slice(0, ns.length);
  const PY = (i: number) => 30 + i * 62, TX = 178;
  const S: number[] = [0.6];
  ns.forEach((n, i) => S.push(S[i]! + n * 0.45 + 1.3));
  const tEnd = S[ns.length]!, best = ns.indexOf(Math.max(...ns)), dur = tEnd + 2.6;
  return anim({
    dur, w: W, h: H, label: 'Havainnot taulukkoon',
    frame: (t) => {
      let s = `<text x="8" y="18" font-size="12" font-weight="900" fill="var(--pond)">Vihkon sivut</text>`;
      s += `<rect x="${TX}" y="6" width="${W - TX - 6}" height="${H - 12}" rx="8" fill="var(--card)" stroke="var(--line)" stroke-width="2"/>`;
      s += `<text x="${TX + 8}" y="22" font-size="11" font-weight="900" fill="currentColor">päivä</text><text x="${W - 14}" y="22" text-anchor="end" font-size="11" font-weight="900" fill="currentColor">sammakoita</text><line x1="${TX}" y1="28" x2="${W - 6}" y2="28" stroke="var(--line)" stroke-width="2"/>`;
      ns.forEach((n, i) => {
        const y = PY(i), on = ease(t, 0.1 + i * 0.15, 0.4 + i * 0.15);
        s += `<g opacity="${on}"><rect x="8" y="${y}" width="158" height="54" rx="6" fill="var(--card)" stroke="var(--line)" stroke-width="1.5"/><text x="16" y="${y + 15}" font-size="11" font-weight="800" fill="currentColor">${days[i]}</text>`;
        for (let j = 0; j < n; j++) {
          const tc = S[i]! + j * 0.45, hit = t >= tc;
          const cx = 22 + j * 24, cy = y + 36;
          s += `<circle cx="${cx}" cy="${cy}" r="8" fill="${hit ? 'var(--sun)' : 'var(--pond)'}"/>`;
          if (hit && t < S[i + 1]! - 0.2) s += `<text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="10" font-weight="900" fill="var(--ink)">${j + 1}</text>`;
        }
        s += `</g>`;
        const ry = y + 31;
        s += `<line x1="${TX}" y1="${ry + 17}" x2="${W - 6}" y2="${ry + 17}" stroke="var(--line)" stroke-width="1"/><text x="${TX + 8}" y="${ry + 4}" font-size="11" font-weight="700" fill="currentColor" opacity="${on}">${days[i]}</text>`;
        const tf = S[i]! + n * 0.45, fly = ease(t, tf, tf + 0.7);
        if (fly > 0) {
          const x0 = 22 + n * 24 + 4, y0 = y + 40, x1 = W - 30, y1 = ry + 5;
          const x = x0 + (x1 - x0) * fly, yy = y0 + (y1 - y0) * fly - 8 * Math.sin(Math.PI * fly);
          s += `<text x="${x}" y="${yy}" text-anchor="middle" font-size="${18 - 3 * fly}" font-weight="900" fill="var(--pond)">${n}</text>`;
        }
        if (i === best && t > tEnd + 0.3) s += `<rect x="${TX + 3}" y="${ry - 12}" width="${W - TX - 12}" height="24" rx="6" fill="none" stroke="var(--sun)" stroke-width="3" opacity="${ease(t, tEnd + 0.3, tEnd + 0.7)}"/>`;
      });
      return s;
    },
    caption: (t) => {
      for (let i = ns.length - 1; i >= 0; i--) {
        if (t >= S[i]!) {
          if (i === ns.length - 1 && t >= tEnd) return t < tEnd + 0.3 ? 'Kaikki päivät ovat taulukossa.' : `Taulukosta näkee heti: eniten ${DAY_ESS(days[best]!)} (${ns[best]}).`;
          const k = Math.min(ns[i]!, Math.floor((t - S[i]!) / 0.45) + 1);
          return t < S[i]! + ns[i]! * 0.45 ? `${cap1(days[i]!)}: ${Array.from({ length: k }, (_, j) => j + 1).join(', ')}…` : `${cap1(days[i]!)}: ${ns[i] === 1 ? '1 sammakko' : `${ns[i]} sammakkoa`}. Luku taulukkoon.`;
        }
      }
      return 'Jokainen sivu lasketaan vuorollaan.';
    },
  });
}

export const SCIENCE_NODES: NodeSpec[] = [
  {
    id: 'SCI-ENV-OBSERVE-01', stop: 'Tarkka silmä', icon: '🔎',
    intro: 'Aava tutkii rantaa. Katso tarkasti, mitä näet.',
    reward: 'Huomasit tarkasti. Havainto vihkoon!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Katso, miten Aava tutkii lehteä. Ensin väri, sitten tarkka katse: onko siinä jotain erityistä?', scene: lookScene({ kind: 'lehti', color: 0, mark: true }) },
      { say: 'Nyt sieni. Hattu on sileä. Onko sieni myrkyllinen? Sitä kuva ei kerro.', scene: lookScene({ kind: 'sieni', color: 1, mark: false }, 'Sieni on myrkyllinen.') },
    ],
    item: cases({
      match: (r) => {
        const o = randObs(r);
        const recolor = { ...o, color: (o.color + r.int(1, 2)) % 3 };
        const markSay = MARK[o.kind][o.mark ? 0 : 1].toLowerCase().replace(/\.$/, '');
        return {
          say: 'Aava näki tämän. Mikä kuva on täsmälleen samanlainen?', scene: paint(obsArt(o, 120)),
          task: choose(r, { art: obsArt(o) }, [{ art: obsArt(recolor) }, { art: obsArt({ ...o, mark: !o.mark }) }],
            [`Väri on eri: tässä se on ${COLOR_NAME[o.kind][recolor.color]}, Aavan kuvassa ${COLOR_NAME[o.kind][o.color]}.`, `Väri on sama, mutta katso tarkasti: Aavan kuvassa ${markSay}.`]),
          hint: 'Vertaa ensin väriä. Katso sitten tarkasti pieniä merkkejä.',
          explain: `Oikeassa kuvassa on sama väri, ja ${markSay}.`,
        };
      },
      feature: (r) => {
        const o = randObs(r);
        return {
          say: 'Mikä näistä näkyy kuvasta?', scene: paint(obsArt(o, 120)),
          task: choose(r, txt(MARK[o.kind][o.mark ? 0 : 1]), [txt(MARK[o.kind][o.mark ? 1 : 0])], [o.mark ? 'Katso uudestaan: merkki näkyy kuvassa selvästi.' : 'Katso uudestaan: kuvassa ei ole sellaista merkkiä.'], 1),
          hint: 'Katso kuvaa kauan ennen kuin valitset.',
          explain: MARK[o.kind][o.mark ? 0 : 1],
        };
      },
      colour: (r) => {
        const o = randObs(r);
        const others = [0, 1, 2].filter((c) => c !== o.color);
        const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1);
        const name = { lehti: 'Lehti', simpukka: 'Simpukka', sieni: 'Sieni' }[o.kind];
        return {
          say: 'Minkä värinen se on?', scene: paint(obsArt(o, 120)),
          task: choose(r, txt(`${name} on ${COLOR_NAME[o.kind][o.color]}.`), others.map((c) => txt(`${name} on ${COLOR_NAME[o.kind][c]}.`)), others.map(() => `Katso kuvaa: väri on ${COLOR_NAME[o.kind][o.color]}.`), 1),
          hint: 'Katso kuvan väriä, älä sitä, minkä värinen se yleensä on.',
          explain: `${cap(COLOR_NAME[o.kind][o.color]!)} näkyy kuvasta.`,
        };
      },
      sort: (r) => {
        const o = randObs(r);
        const name = { lehti: 'Lehti', simpukka: 'Simpukka', sieni: 'Sieni' }[o.kind];
        const seen = [`${name} on ${COLOR_NAME[o.kind][o.color]}.`, MARK[o.kind][o.mark ? 0 : 1]];
        const all = r.shuffle([
          ...seen.map((t) => ({ t, c: 0, w: 'Tämän näkee kuvasta. Se on havainto.' })),
          ...EXPL[o.kind].map((t) => ({ t, c: 1, w: 'Kuvasta ei näe tätä. Se on arvaus.' })),
        ]);
        return {
          say: 'Lajittele lauseet. Mikä näkyy kuvasta ja mikä on arvaus?', scene: paint(obsArt(o, 120)),
          task: { kind: 'sort' as const, items: all.map((x) => ({ text: x.t, speak: x.t })), cats: [{ label: '🔎 Näkyy kuvasta' }, { label: '💭 Arvaus' }], answer: all.map((x) => x.c), why: all.map((x) => x.w) },
          hint: 'Kysy jokaisesta lauseesta: näenkö tämän kuvassa?',
          explain: `Kuvasta näkyy: ${seen.join(' ')} Muut ovat arvauksia.`,
        };
      },
    }, (r) => {
      const o = { ...randObs(r), mark: true };
      return {
        say: 'Mikä näistä näkyy kuvasta? Toiset ovat arvauksia, joita kuva ei näytä.',
        scene: paint(obsArt(o, 120)),
        task: choose(r, txt(MARK[o.kind][0]), EXPL[o.kind].map((e) => txt(e)), ['Se voi olla totta, mutta kuvasta sitä ei näe.', 'Se voi olla totta, mutta kuvasta sitä ei näe.'], 1),
        hint: 'Havainto on se, minkä näet. Arvaus kertoo, mitä ehkä tapahtui.',
        explain: `${MARK[o.kind][0]} Sen näkee kuvasta. Muut ovat arvauksia.`,
      };
    }),
  },
  {
    id: 'SCI-ENV-RECORD-DATA-01', stop: 'Havainto talteen', icon: '📒',
    intro: 'Aava haluaa muistaa, mitä missäkin näkyi. Merkitään vihkoon.',
    reward: 'Havainnot ovat tallessa vihkossa!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Katso Aavan retkeä. Jokainen löytö merkitään heti oman paikkansa kohdalle.', scene: tripScene(['ranta', 'metsa'], ['simpukka', 'kapy']) },
      { say: 'Kolme paikkaa, kolme löytöä. Rivi kertoo paikan, kuva kertoo löydön.', scene: tripScene(['niitty', 'kallio', 'ranta'], ['kukka', 'kivi', 'kala']) },
    ],
    item: cases({ two: (r) => recordTask(r, 2), three: (r) => recordTask(r, 3), fix: (r) => recordTask(r, 2, true) }, (r) => recordTask(r, 3, true)),
  },
  {
    id: 'SCI-ENV-PRESENT-DATA-01', stop: 'Kerro kuvalla', icon: '🖼️',
    intro: 'Aava näyttää havainnot Loikalle kuvana. Kuvan pitää kertoa oikein.',
    reward: 'Loikka ymmärsi kuvasta kaiken!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Katso, miten havainnoista tehdään kuva: paikat ylös, löydöt niiden alle. Loikka osaa lukea sen.', scene: presentScene([{ place: 'ranta', item: 'simpukka', n: 3 }, { place: 'metsa', item: 'kapy', n: 1 }]) },
      { say: 'Kolme paikkaa. Laske, montako löytöä kunkin alla on.', scene: presentScene([{ place: 'niitty', item: 'kukka', n: 2 }, { place: 'kallio', item: 'kivi', n: 1 }, { place: 'ranta', item: 'tahti', n: 3 }]) },
    ],
    item: cases({
      pick: (r) => {
        const [p1, p2] = r.shuffle(Object.keys(PLACES) as Place[]);
        const [i1, i2] = r.shuffle(ITEMS);
        const a = r.int(1, 3), b = r.int(1, 3);
        const right = presentArt([{ place: p1!, item: i1!, n: a }, { place: p2!, item: i2!, n: b }]);
        const swapped = presentArt([{ place: p1!, item: i2!, n: b }, { place: p2!, item: i1!, n: a }]);
        const count = presentArt([{ place: p1!, item: i1!, n: a === 3 ? 1 : a + 1 }, { place: p2!, item: i2!, n: b }]);
        const said = `${AT[p1!].toLowerCase()} ${cnt(a, i1!)} ja ${AT[p2!].toLowerCase()} ${cnt(b, i2!)}`;
        return {
          say: `Aava näki: ${said}. Mikä kuva kertoo sen oikein?`,
          scene: paint(placeArt(p1!, 70) + `<span style="display:inline-flex">${Array.from({ length: a }, () => itemArt(i1!, 30)).join('')}</span>` + placeArt(p2!, 70) + `<span style="display:inline-flex">${Array.from({ length: b }, () => itemArt(i2!, 30)).join('')}</span>`),
          task: choose(r, { art: right }, [{ art: swapped }, { art: count }], [`Löydöt ovat väärien paikkojen alla: ${THINGS[i1!]!.one} kuuluu paikan ${PLACES[p1!].name} alle.`, `Laske: ${AT[p1!].toLowerCase()} nähtiin ${cnt(a, i1!)}, ei ${a === 3 ? 1 : a + 1}.`], 1),
          hint: 'Tarkista kaksi asiaa: onko löytö oikean paikan alla, ja onko määrä oikea.',
          explain: 'Oikeassa kuvassa jokainen löytö on oman paikkansa alla oikea määrä.',
        };
      },
      read: (r) => {
        const ps = r.shuffle(Object.keys(PLACES) as Place[]).slice(0, 3);
        const is = r.shuffle(ITEMS).slice(0, 3);
        const ns = r.shuffle([1, 2, 3]);
        const cols = ps.map((p, i) => ({ place: p, item: is[i]!, n: ns[i]! }));
        const q = r.int(0, 2), c = cols[q]!;
        const others = cols.filter((_, i) => i !== q);
        return {
          say: `Lue kuvasta: montako ${THINGS[c.item]!.many} ${AT[c.place].toLowerCase()} nähtiin?`,
          scene: presentScene(cols, false),
          task: choose(r, { big: String(c.n) }, others.map((o) => ({ big: String(o.n) })), others.map((o) => `${o.n} on paikan ${PLACES[o.place].name} määrä. Katso paikan ${PLACES[c.place].name} alle.`)),
          hint: 'Etsi ensin paikka. Laske sitten löydöt sen alta.',
          explain: `${AT[c.place]} nähtiin ${cnt(c.n, c.item)}.`,
        };
      },
      most: (r) => {
        const ps = r.shuffle(Object.keys(PLACES) as Place[]).slice(0, 3);
        const is = r.shuffle(ITEMS).slice(0, 3);
        const ns = r.shuffle([1, 2, 3]);
        const cols = ps.map((p, i) => ({ place: p, item: is[i]!, n: ns[i]! }));
        const best = cols.find((c) => c.n === 3)!, rest = cols.filter((c) => c !== best);
        const opt = (c: Col) => ({ art: placeArt(c.place, 80), text: cap1(PLACES[c.place].name), speak: PLACES[c.place].name });
        return {
          say: 'Missä paikassa nähtiin eniten löytöjä?',
          scene: presentScene(cols, false),
          task: choose(r, opt(best), rest.map(opt), rest.map((c) => `${AT[c.place]} nähtiin vain ${c.n}. Etsi pisin jono.`)),
          hint: 'Pisin jono paikan alla tarkoittaa eniten löytöjä.',
          explain: `${AT[best.place]} nähtiin ${cnt(3, best.item)}. Se on eniten.`,
        };
      },
      complete: (r) => {
        const [p1, p2] = r.shuffle(Object.keys(PLACES) as Place[]);
        const [i1, i2, i3] = r.shuffle(ITEMS);
        return {
          say: `Kuvasta puuttuu yksi havainto. ${AT[p2!]} nähtiin ${THINGS[i2!]!.one}. Laita se oikeaan kohtaan.`,
          task: {
            kind: 'place',
            slots: [{ id: 'p1', art: placeArt(p1!, 70) + itemArt(i1!, 34) }, { id: 'p2', art: placeArt(p2!, 70) }],
            tokens: r.shuffle([{ id: i2!, art: itemArt(i2!), speak: THINGS[i2!]!.one }, { id: i3!, art: itemArt(i3!), speak: THINGS[i3!]!.one }]),
            start: { p1: null, p2: null },
            answer: { p1: null, p2: i2! },
            why: { p1: `Tämän paikan havainto on jo kuvassa. Puuttuva löytö nähtiin paikassa ${PLACES[p2!].name}.`, p2: `${AT[p2!]} nähtiin ${THINGS[i2!]!.one}, ei ${THINGS[i3!]!.one}.` },
          },
          hint: 'Kuuntele tarkasti: mikä löytö ja missä paikassa?',
          explain: `${cap1(THINGS[i2!]!.one)} kuuluu paikan ${PLACES[p2!].name} alle.`,
        };
      },
    }, (r) => {
      const [p1, p2] = r.shuffle(Object.keys(PLACES) as Place[]);
      const [i1, i2] = r.shuffle(ITEMS);
      const good = presentArt([{ place: p1!, item: i1!, n: 2 }, { place: p2!, item: i2!, n: 1 }]);
      const noPlace = presentArt([{ place: null, item: i1!, n: 2 }, { place: null, item: i2!, n: 1 }]);
      return {
        say: `Loikka haluaa löytää ${THINGS[i1!]!.many} samasta paikasta. Kummasta kuvasta hän näkee, minne mennä?`,
        task: choose(r, { art: good }, [{ art: noPlace }], ['Tästä kuvasta puuttuu paikka. Loikka ei tiedä, minne mennä.'], 1),
        hint: 'Kuvan pitää kertoa myös, missä löydöt olivat.',
        explain: 'Esityksessä pitää näkyä myös paikka, jotta toinen voi käyttää sitä.',
      };
    }),
  },
  {
    id: 'SCI-ENV-RECORD-01', stop: 'Retkivihko', icon: '📓',
    intro: 'Koko retken havainnot kirjataan ja näytetään vihkossa.',
    reward: 'Retkivihko on valmis!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Koko retki: Aava laskee jokaisessa paikassa löydöt ja merkitsee ne heti vihkoon.', scene: tripScene(['niitty', 'kallio', 'ranta'], ['kukka', 'kivi', 'kala'], true, [2, 1, 3]) },
      { say: 'Kotona vihkosta tehdään kuva. Nyt Loikkakin tietää, mitä retkellä nähtiin.', scene: presentScene([{ place: 'niitty', item: 'kukka', n: 2 }, { place: 'kallio', item: 'kivi', n: 1 }, { place: 'ranta', item: 'kala', n: 3 }]) },
    ],
    item: cases({
      build: (r) => recordTask(r, 3),
      count: (r) => {
        const ps = r.shuffle(Object.keys(PLACES) as Place[]).slice(0, 3);
        const is = r.shuffle(ITEMS).slice(0, 3);
        const ns = [r.int(1, 3), r.int(1, 3), r.int(1, 3)];
        const d = r.int(0, 2), dn = ns[d] === 3 ? 2 : ns[d]! + 1;
        const SPOT: [number, number][][] = [[[24, 24]], [[13, 24], [35, 24]], [[13, 14], [35, 14], [24, 35]]];
        const group = (k: string, m: number) => svg(48, 48, SPOT[m - 1]!.map(([x, y]) => THINGS[k]!.draw(x, y, m === 1 ? 32 : 20)).join(''));
        const tok = (k: string, m: number) => ({ id: `${k}${m}`, art: group(k, m), speak: cnt(m, k) });
        return {
          say: 'Katso retki. Laita vihkoon jokaisen paikan kohdalle oikea määrä löytöjä.',
          scene: tripScene(ps, is, false, ns),
          task: {
            kind: 'place' as const,
            slots: ps.map((p) => ({ id: p, art: placeArt(p, 70), text: PLACES[p].name })),
            tokens: r.shuffle([...ps.map((_, i) => tok(is[i]!, ns[i]!)), tok(is[d]!, dn)]),
            answer: Object.fromEntries(ps.map((p, i) => [p, `${is[i]}${ns[i]}`])),
            why: Object.fromEntries(ps.map((p, i) => [p, `${AT[p]} Aava näki ${cnt(ns[i]!, is[i]!)}.`])),
          },
          hint: 'Laske jokaisen paikan löydöt. Yksi korteista on väärä määrä.',
          explain: ps.map((p, i) => `${AT[p]} ${cnt(ns[i]!, is[i]!)}`).join(', ') + '.',
        };
      },
      check: (r) => {
        const ps = r.shuffle(Object.keys(PLACES) as Place[]).slice(0, 3);
        const is = r.shuffle(ITEMS).slice(0, 3);
        const ns = [r.int(1, 3), r.int(1, 3), r.int(1, 3)];
        const cols = ps.map((p, i) => ({ place: p, item: is[i]!, n: ns[i]! }));
        const wrong1 = cols.map((c, i) => ({ ...c, item: is[(i + 1) % 3]! }));
        const wrong2 = cols.map((c, i) => (i === 0 ? { ...c, n: c.n === 3 ? 1 : c.n + 1 } : c));
        return {
          say: 'Katso retki. Mikä vihkon sivu kertoo havainnot oikein?',
          scene: tripScene(ps, is, false, ns),
          task: choose(r, { art: presentArt(cols) }, [{ art: presentArt(wrong1) }, { art: presentArt(wrong2) }], [`Löydöt ovat väärien paikkojen alla: ${THINGS[is[0]!]!.one} kuuluu paikan ${PLACES[ps[0]!].name} alle.`, `Yksi määrä ei täsmää: ${AT[ps[0]!].toLowerCase()} nähtiin ${cnt(ns[0]!, is[0]!)}.`], 1),
          hint: 'Tarkista jokaisesta sarakkeesta paikka, löytö ja määrä.',
          explain: 'Oikealla sivulla jokainen havainto on oman paikkansa alla oikea määrä.',
        };
      },
    }, (r) => recordTask(r, 4, true)),
  },
  {
    id: 'SCI-ENV-DATA-01', stop: 'Havaintoaineisto', icon: '📊',
    intro: 'Aava laski sammakoita lammella monena päivänä. Kootaan havainnot yhteen.',
    reward: 'Havainnot on koottu aineistoksi!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Jokaisen päivän sivulta lasketaan sammakot. Luku siirtyy taulukkoon oikean päivän riville.', scene: dataScene([3, 5, 2]) },
      { say: 'Taulukosta näkee kaikki päivät kerralla. Katso, mikä rivi syttyy lopuksi.', scene: dataScene([4, 1, 6]) },
    ],
    item: cases({
      fill: (r) => {
        const ns = r.shuffle([1, 2, 3, 4, 5, 6]).slice(0, 3);
        const extra = [1, 2, 3, 4, 5, 6].filter((v) => !ns.includes(v)).find((v) => Math.abs(v - ns[0]!) === 1) ?? [1, 2, 3, 4, 5, 6].find((v) => !ns.includes(v))!;
        const days = DAYS.slice(0, 3);
        const pages = days.map((d, i) => `<div style="text-align:center"><div class="small">${d}</div>${svg(150, 40, Array.from({ length: ns[i]! }, (_, j) => `<circle cx="${14 + j * 24}" cy="20" r="9" fill="var(--pond)"/>`).join('')).replace('width="100%"', 'width="150"')}</div>`).join('');
        return {
          say: 'Täytä taulukko. Laske jokaisen päivän sammakot ja vie luku oikealle riville.',
          scene: paint(`<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">${pages}</div>`),
          task: {
            kind: 'place' as const,
            slots: days.map((d) => ({ id: d, text: d })),
            tokens: r.shuffle([...ns, extra].map((v) => ({ id: `n${v}`, text: String(v), speak: String(v) }))),
            answer: Object.fromEntries(days.map((d, i) => [d, `n${ns[i]}`])),
            why: Object.fromEntries(days.map((d, i) => [d, `Laske ${DAY_GEN[d]} pisteet: niitä on ${ns[i]}.`])),
          },
          hint: 'Yksi päivä kerrallaan: laske pisteet ja etsi sama luku.',
          explain: days.map((d, i) => `${d} ${ns[i]}`).join(', ') + '.',
        };
      },
      table: (r) => {
        const ns = [r.int(1, 5), r.int(1, 5), r.int(1, 5)];
        const days = DAYS.slice(0, 3);
        const pages = days.map((d, i) => `<div style="text-align:center"><div class="small">${d}</div>${svg(120, 40, Array.from({ length: ns[i]! }, (_, j) => `<circle cx="${14 + j * 22}" cy="20" r="9" fill="var(--pond)"/>`).join('')).replace('width="100%"', 'width="120"')}</div>`).join('');
        const wi = r.int(0, 2), wrongNs = [...ns]; wrongNs[wi] += 1;
        const swapped = [ns[1]!, ns[0]!, ns[2]!];
        const tbl = (v: number[]) => ({ art: table(['päivä', 'sammakoita'], days.map((d, i) => [d, v[i]!])) });
        const opts = [tbl(wrongNs)], whys = [`Laske ${DAY_GEN[days[wi]!]} pisteet uudelleen: niitä on ${ns[wi]}, ei ${wrongNs[wi]}.`];
        if (ns[0] !== ns[1]) { opts.push(tbl(swapped)); whys.push('Maanantain ja tiistain luvut ovat vaihtaneet paikkaa.'); }
        return { say: 'Aava merkitsi joka päivä sammakot pisteinä. Mikä taulukko kokoaa havainnot oikein?', scene: paint(`<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">${pages}</div>`), task: choose(r, tbl(ns), opts, whys, 1), hint: 'Tarkista taulukon jokainen rivi: onko luku sama kuin pisteiden määrä?', explain: `Lasketaan pisteet päivä kerrallaan: ${days.map((d, i) => `${d} ${ns[i]}`).join(', ')}.` };
      },
      most: (r) => {
        const ns = r.shuffle([1, 2, 3, 4, 5, 6]).slice(0, 3);
        const days = DAYS.slice(0, 3);
        const best = ns.indexOf(Math.max(...ns));
        return { say: 'Minä päivänä sammakoita nähtiin eniten?', scene: paint(table(['päivä', 'sammakoita'], days.map((d, i) => [d, ns[i]!]))), task: fixed(days.map((d) => txt(d)), best, days.map((d, i) => i === best ? undefined : `${cap1(DAY_ESS(d))} nähtiin ${ns[i]}, mutta ${ns[best]} on suurempi.`), 3), hint: 'Etsi sammakot-sarakkeesta suurin luku.', explain: `Suurin luku on ${ns[best]}: ${days[best]}.` };
      },
      total: (r) => {
        const ns = [r.int(1, 4), r.int(1, 4), r.int(1, 4)];
        const s = ns[0]! + ns[1]! + ns[2]!;
        return { say: 'Montako sammakkoa nähtiin kaikkina päivinä yhteensä?', scene: paint(table(['päivä', 'sammakoita'], DAYS.slice(0, 3).map((d, i) => [d, ns[i]!]))), task: choose(r, { big: String(s) }, [{ big: String(Math.max(...ns)) }, { big: String(s + 1) }], ['Se on vain yhden päivän luku. Laske kaikki päivät yhteen.', `Laske uudelleen: ${ns.join(' + ')}.`]), hint: 'Lisää kaikkien päivien luvut yhteen.', explain: `${ns.join(' + ')} = ${s}.` };
      },
    }, (r) => {
      // Values two apart (1-3-5 or 2-4-6): the right chart is told apart by which bar is
      // tallest and shortest, never by measuring a one-step height difference.
      const lo = r.int(1, 2);
      const ns = r.shuffle([lo, lo + 2, lo + 4]);
      const days = DAYS.slice(0, 3);
      const bars = (v: number[]) => svg(180, 120, v.map((n, i) => `<rect x="${20 + i * 55}" y="${100 - n * 15}" width="36" height="${n * 15}" rx="3" fill="var(--pond)"/><text x="${38 + i * 55}" y="116" text-anchor="middle" font-size="11" fill="currentColor">${days[i]!.slice(0, 2)}</text>`).join('') + '<path d="M10 100 H175" stroke="currentColor"/>');
      const hi = ns.indexOf(Math.max(...ns)), low = ns.indexOf(Math.min(...ns));
      return {
        say: 'Mikä pylväskuva näyttää saman kuin taulukko?',
        scene: paint(table(['päivä', 'sammakoita'], days.map((d, i) => [d, ns[i]!]))),
        task: choose(r, { art: bars(ns) }, [{ art: bars([...ns].reverse()) }, { art: bars([ns[1]!, ns[2]!, ns[0]!]) }], ['Samat pylväät, mutta väärässä järjestyksessä. Katso, minkä päivän pylväs on korkein ja minkä matalin.', 'Samat pylväät, mutta väärässä järjestyksessä. Katso, minkä päivän pylväs on korkein ja minkä matalin.'], 3),
        hint: 'Etsi taulukosta suurin ja pienin luku. Niiden päivien pylväät ovat korkein ja matalin.',
        explain: `Eniten sammakoita oli ${days[hi]}na, joten sen pylväs on korkein. Vähiten ${days[low]}na, joten sen pylväs on matalin.`,
      };
    }),
  },
  {
    id: 'ENV-PHY-MOTION-OBS-01', stop: 'Liikkuiko?', icon: '🍃',
    intro: 'Lehti kelluu lammessa. Kivi pysyy paikallaan. Liikkuiko lehti?',
    reward: 'Huomaat liikkeen!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: () => [
      { say: 'Katso kolmea lehteä. Liikkuiko lehti? Vertaa sen paikkaa kiveen.', scene: pondScene(['drift', 'colour', 'still'], [70, 150, 110]) },
      { say: 'Lehti 1 tekee tempun. Seuraa sitä koko ajan, älä vain alussa ja lopussa.', scene: pondScene(['back', 'still', 'drift'], [80, 120, 170]) },
      { say: 'Valokuvista näkee saman: ennen lehti oli kaukana kivestä, jälkeen lähellä. Se liikkui.', scene: paint(framesArt([{ x: 30 }, { x: 85 }])) },
    ],
    item: cases({
      moved: (r) => { const a = r.int(20, 50), b = a + r.int(30, 50); return obsMove(r.chance(0.5) ? [{ x: a }, { x: b }] : [{ x: b }, { x: a }], 0, 'Lehden paikka kiveen nähden muuttui.', 'Katso etäisyyttä kiveen: se on eri ennen ja jälkeen. Lehti liikkui.'); },
      still: (r) => { const a = r.int(25, 80); return obsMove([{ x: a }, { x: a }], 1, 'Lehti on samassa kohdassa kiveen nähden.', 'Lehti on yhtä kaukana kivestä molemmissa kuvissa. Se ei liikkunut.'); },
      colour: (r) => { const a = r.int(25, 80); return obsMove([{ x: a }, { x: a, color: r.int(1, 2) }], 1, 'Väri muuttui, mutta paikka ei. Lehti ei liikkunut.', 'Väri muuttui, mutta katso paikkaa: se on sama. Värin muutos ei ole liikettä.'); },
      spot: (r) => {
        const acts = r.shuffle<LeafAct>([r.pick(['drift', 'back'] as const), r.pick(['colour', 'still'] as const), r.pick(['drift', 'back', 'colour', 'still'] as const)]);
        const x0s = acts.map(() => r.int(60, 170));
        const options = acts.map((_, i) => txt(`Lehti ${i + 1}`));
        return {
          say: 'Katso lehtiä. Valitse kaikki lehdet, jotka liikkuivat.',
          scene: pondScene(acts, x0s, false),
          task: { kind: 'multi' as const, options, answer: acts.map((a, i) => (leafMoves(a) ? i : -1)).filter((i) => i >= 0), cols: 3, why: acts.map((a, i) => `Lehti ${i + 1} ${LEAF_SAY[a]}.`) },
          hint: 'Seuraa yhtä lehteä kerrallaan. Muuttuuko sen etäisyys kiveen?',
          explain: acts.map((a, i) => `Lehti ${i + 1} ${LEAF_SAY[a]}`).join('. ') + '.',
        };
      },
    }, (r) => {
      const a = r.int(20, 40);
      return {
        say: 'Katso kolme kuvaa. Ensimmäisessä ja viimeisessä lehti on samassa paikassa. Liikkuiko lehti?',
        scene: paint(framesArt([{ x: a }, { x: a + 50 }, { x: a }])),
        task: fixed([MOVED, STILL], 0, [undefined, 'Keskimmäisessä kuvassa lehti oli toisessa paikassa.']),
        explain: 'Lehti kävi kauempana ja palasi. Se liikkui, vaikka alku ja loppu ovat samat.',
      };
    }),
  },
  {
    id: 'ENV-PHY-MOTION-CHANGE-01', stop: 'Mikä muuttui?', icon: '🔄',
    intro: 'Ankka ui lammessa. Kuvat on otettu yhtä pitkin välein. Mikä ankan liikkeessä muuttui?',
    reward: 'Näet, miten liike muuttuu!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: (r) => [
      { say: 'Katso, miten kuvasarja syntyy: ankka ui, ja aina yhtä pitkän ajan päästä otetaan kuva. Tässä ankka pysähtyy.', scene: swimScene(motion(r, 'stop'), 'stop') },
      { say: 'Tässä välit kasvavat. Samassa ajassa ankka ehtii yhä pidemmälle: se nopeutuu.', scene: swimScene(motion(r, 'faster'), 'faster') },
      { say: 'Ja tässä ankka kääntyy takaisin. Punainen nuoli näyttää paluun.', scene: swimScene(motion(r, 'turn'), 'turn') },
    ],
    item: cases({
      ...Object.fromEntries(CHANGES.map((c) => [c, (r: Rng) => ({
        say: 'Katso ankan uintia. Mikä sen liikkeessä muuttui?',
        scene: swimScene(motion(r, c), c, false),
        task: fixed(CHANGES.map((k) => CHANGE_OPT[k]), CHANGES.indexOf(c), CHANGES.map((k) => (k === c ? undefined : CHANGE_WHY[k])), 1),
        hint: 'Vertaa peräkkäisten kuvien välejä: ovatko ne yhtä pitkiä, ja meneekö ankka samaan suuntaan?',
        explain: CHANGE_EXPLAIN[c],
      })])),
      next: (r: Rng) => {
        const x0 = r.int(20, 40), d = r.int(40, 46), xs = [0, 1, 2, 3].map((i) => x0 + i * d);
        const k = r.pick(['steady', 'stop', 'turn'] as const);
        const five = { steady: xs[3]! + d, stop: xs[3]!, turn: xs[2]! };
        const say = { steady: 'Ankka ui koko ajan samalla tavalla.', stop: 'Ankka pysähtyy.', turn: 'Ankka kääntyy takaisin.' }[k];
        const wrongs = (['steady', 'stop', 'turn'] as const).filter((o) => o !== k);
        const whyOf = { steady: 'Tässä ankka jatkaa samalla välillä eteenpäin.', stop: 'Tässä ankka on kuvassa 5 samassa kohdassa kuin kuvassa 4: se pysähtyi.', turn: 'Tässä ankka on palannut taaksepäin.' };
        return {
          say: `${say} Missä se on kuvassa 5?`,
          scene: swimScene(xs, null, false),
          task: choose(r, { art: stripArt([...xs, five[k]]) }, wrongs.map((o) => ({ art: stripArt([...xs, five[o]]) })), wrongs.map((o) => whyOf[o]), 1),
          hint: 'Katso kuvien 4 ja 5 väliä.',
          explain: { steady: 'Sama väli kuin ennen: ankka jatkaa yhtä pitkän matkan eteenpäin.', stop: 'Pysähtynyt ankka on kuvassa 5 samassa kohdassa kuin kuvassa 4.', turn: 'Takaisin kääntynyt ankka on kuvassa 5 taaempana kuin kuvassa 4.' }[k],
        };
      },
    }, (r) => {
      const right = (x0: number) => [x0, x0 + 40, x0 + 80];
      const tokens = [
        { id: 'go', art: stripArt(right(30), 'lehti', false), text: '' },
        { id: 'stop', art: stripArt([110, 110, 110], 'lehti', false), text: '' },
        { id: 'back', art: stripArt([190, 150, 110], 'lehti', false), text: '' },
      ];
      return {
        say: 'Lehti liikkui, pysähtyi ja lähti takaisin. Järjestä kuvasarjat oikeaan järjestykseen.',
        task: { kind: 'place', slots: [{ id: '1', text: 'Ensin' }, { id: '2', text: 'Sitten' }, { id: '3', text: 'Lopuksi' }], tokens: r.shuffle(tokens).map((t) => ({ id: t.id, art: t.art })), answer: { 1: 'go', 2: 'stop', 3: 'back' }, why: { 1: 'Ensin lehti liikkui eteenpäin: välit ovat pitkiä ja menevät oikealle.', 2: 'Sitten lehti pysähtyi: kaikki kuvat ovat samassa kohdassa.', 3: 'Lopuksi lehti lähti takaisin: se menee vasemmalle.' } },
        hint: 'Etsi ensin kuvasarja, jossa lehti on paikallaan. Se on keskellä.',
        explain: 'Ensin lehti liikkuu eteenpäin, sitten se on paikallaan, lopuksi se liikkuu takaisin.',
      };
    }),
  },
  {
    id: 'ENV-PHY-MOTION-01', stop: 'Liikkeen tarkkailija', icon: '🦆',
    intro: 'Nyt tarkkaillaan kahta ankkaa yhtä aikaa.',
    reward: 'Olet tarkka liikkeen tarkkailija!',
    rev: AUDIT_REV, validRevs: [AUDIT_REV],
    demo: (r) => [
      { say: 'Kaksi ankkaa ui yhtä aikaa. Ylempi ui samalla tavalla koko ajan. Alempi pysähtyy: sen liike muuttui.', scene: duoScene([{ xs: motion(r, 'steady'), c: 'steady' }, { xs: motion(r, 'stop'), c: 'stop' }]) },
      { say: 'Nyt molemmat uivat tasaisesti. Kumpi on nopeampi? Katso, kumpi ehtii kuvasta toiseen pidemmälle.', scene: duoScene([{ xs: [20, 50, 80, 110, 140], c: 'steady' }, { xs: [20, 75, 130, 185, 240], c: 'steady' }], true, true) },
    ],
    item: cases({
      which: (r) => {
        const c = r.pick(['stop', 'turn', 'faster'] as const);
        const lanes = r.shuffle([{ xs: motion(r, c), c }, { xs: motion(r, 'steady'), c: 'steady' as Change }]);
        const ans = lanes.findIndex((l) => l.c !== 'steady');
        return {
          say: 'Katso molempia ankkoja. Kumman ankan liike muuttui?', scene: duoScene(lanes, false),
          task: fixed(UPDOWN, ans, UPDOWN.map((_, i) => (i === ans ? undefined : 'Tämän ankan välit ovat yhtä pitkät ja suunta sama: sen liike ei muuttunut.')), 2),
          hint: 'Seuraa ensin toista ankkaa, sitten toista.',
          explain: `${ans ? 'Alempi' : 'Ylempi'} ankka: ${CHANGE_EXPLAIN[c].toLowerCase()}`,
        };
      },
      faster: (r) => {
        const a = r.int(26, 32), b = a + r.int(18, 24);
        const top = r.chance(0.5);
        const lane = (d: number) => ({ xs: [0, 1, 2, 3, 4].map((i) => 20 + i * d), c: 'steady' as Change });
        const lanes = top ? [lane(b), lane(a)] : [lane(a), lane(b)];
        const ans = top ? 0 : 1;
        return {
          say: 'Molemmat ankat uivat tasaisesti. Kumpi ui nopeammin?', scene: duoScene(lanes, false, true),
          task: fixed(UPDOWN, ans, UPDOWN.map((_, i) => (i === ans ? undefined : 'Tämän ankan välit ovat lyhyemmät: samassa ajassa se ehtii lyhyemmän matkan.')), 2),
          hint: 'Kuvat otetaan yhtä aikaa. Kumpi ehtii kuvasta toiseen pidemmälle?',
          explain: 'Nopeampi ankka ehtii samassa ajassa pidemmälle, joten sen välit ovat pidemmät.',
        };
      },
      still: (r) => {
        const x = r.int(60, 200);
        const moving = r.chance(0.5);
        const xs = moving ? motion(r, 'steady') : [x, x, x, x, x];
        return {
          say: 'Liikkuiko ankka kuvien aikana?', scene: swimScene(xs, null, false),
          task: fixed([MOVED, STILL], moving ? 0 : 1, moving ? [undefined, 'Kuvissa ankka on eri kohdissa: se liikkui.'] : ['Kaikki kuvat ovat samassa kohdassa: ankka ei liikkunut.', undefined]),
          hint: 'Ovatko kuvat eri kohdissa vai päällekkäin?',
          explain: moving ? 'Ankan paikka muuttui kuvasta toiseen.' : 'Kaikissa kuvissa ankka on samassa kohdassa.',
        };
      },
      describe: (r) => {
        const c = r.pick(CHANGES);
        return {
          say: 'Mikä kuvaa ankan liikettä?', scene: swimScene(motion(r, c), c, false),
          task: fixed(CHANGES.map((k) => CHANGE_OPT[k]), CHANGES.indexOf(c), CHANGES.map((k) => (k === c ? undefined : CHANGE_WHY[k])), 1),
          hint: 'Vertaa välejä ja suuntaa.',
          explain: CHANGE_EXPLAIN[c],
        };
      },
    }, (r) => {
      const opts = { start: [60, 60, 100, 160, 230], stop: [60, 110, 160, 160, 160], steady: [60, 100, 140, 180, 220] };
      return {
        say: 'Lehti lepää vedessä. Sitten tuuli puhaltaa ja lehti lähtee liikkeelle. Mikä kuvasarja näyttää sen?',
        task: choose(r, { art: stripArt(opts.start, 'lehti') }, [{ art: stripArt(opts.stop, 'lehti') }, { art: stripArt(opts.steady, 'lehti') }], ['Tässä lehti liikkuu ensin ja pysähtyy lopuksi: järjestys on väärin päin.', 'Tässä lehti liikkuu koko ajan. Se ei lepää alussa.'], 1),
        hint: 'Etsi sarja, jossa ensimmäiset kuvat ovat päällekkäin.',
        explain: 'Ensimmäisissä kuvissa lehti on paikallaan, sitten se alkaa liikkua.',
      };
    }),
  },
];

function obsMove(frames: { x: number; color?: number }[], answer: number, explain: string, why: string) {
  return { say: 'Liikkuiko lehti? Vertaa kiveen.', scene: paint(framesArt(frames)), task: fixed([MOVED, STILL], answer, answer ? [why, undefined] : [undefined, why]), hint: 'Katso, kuinka kaukana lehti on kivestä.', explain };
}

const AT: Record<Place, string> = { ranta: 'Rannalla', metsa: 'Metsässä', kallio: 'Kalliolla', niitty: 'Niityllä' };
const cap1 = (t: string) => t[0]!.toUpperCase() + t.slice(1);

/** Aava walks from place to place. At each stop a finding pops up; with `fill` it flies into the
 *  notebook row of that place at once, otherwise it stays at the place for the learner to record. */
function tripScene(ps: Place[], is: string[], fill = true, ns?: number[]): AnimPaint {
  const n = ps.length, PW = 88, W = Math.max(320, n * (PW + 12) + 12), gap = (W - n * PW) / (n + 1);
  const k = (i: number) => ns?.[i] ?? 1, many = !!ns;
  const px = (i: number) => gap + i * (PW + gap), GY = 100, NY = 128, RH = n === 2 ? 40 : 30, BW = many ? 74 : RH + 14, BX = W - 46 - BW;
  const H = NY + 36 + n * RH;
  const TS: number[] = [0.4];
  for (let i = 0; i < n; i++) TS.push(TS[i]! + 2.6 + 0.35 * (k(i) - 1));
  const T = (i: number) => TS[i]!, dur = T(n) + (fill ? 1.6 : 0.6);
  const what = (i: number) => many ? cnt(k(i), is[i]!) : THINGS[is[i]!]!.one;
  return anim({
    dur, w: W, h: H, label: 'Havaintoretki',
    frame: (t) => {
      let s = '';
      ps.forEach((p, i) => { s += `<g transform="translate(${px(i)} 8) scale(${PW / 80})">${PLACES[p].art}</g>`; });
      s += `<path d="M0 ${GY + 6} H${W}" stroke="var(--line)" stroke-width="3" stroke-dasharray="2 6" stroke-linecap="round"/>`;
      // notebook
      s += `<rect x="40" y="${NY}" width="${W - 80}" height="${n * RH + 30}" rx="8" fill="var(--card)" stroke="var(--line)" stroke-width="2"/><text x="52" y="${NY + 18}" font-size="12" font-weight="900" fill="var(--pond)">Havaintovihko</text>`;
      ps.forEach((p, i) => {
        const y = NY + 26 + i * RH;
        s += `<g transform="translate(52 ${y}) scale(${(RH - 4) / 56})">${PLACES[p].art}</g><text x="${52 + (RH - 4) * 80 / 56 + 8}" y="${y + RH / 2 + 2}" font-size="12" font-weight="800" fill="currentColor">${PLACES[p].name}</text><rect x="${BX}" y="${y}" width="${BW}" height="${RH - 4}" rx="6" fill="none" stroke="var(--line)" stroke-width="1.5" stroke-dasharray="4 3"/>`;
      });
      // walking Aava
      let ax = -20;
      for (let i = 0; i < n; i++) { const g = ease(t, T(i) - (i ? 1.3 : 0.4), T(i)); ax += ((px(i) + PW / 2 - 14) - (i ? px(i - 1) + PW / 2 - 14 : -20)) * g; }
      const walking = ps.some((_, i) => t > T(i) - (i ? 1.3 : 0.4) && t < T(i));
      s += duck(ax, GY - 12 - (walking ? Math.abs(Math.sin(t * 9)) * 4 : 0), 20);
      // findings
      ps.forEach((_, i) => {
        const m = k(i), y = NY + 26 + i * RH, ty = y + (RH - 4) / 2, tF = T(i) + 0.35 * (m - 1);
        const fly = fill ? ease(t, tF + 1.0, tF + 1.8) : 0;
        const ring = ease(t, T(i), T(i) + 0.3);
        if (ring > 0 && fly <= 0) s += `<rect x="${px(i) + 2}" y="${22}" width="${PW - 4}" height="${36}" rx="18" fill="var(--card)" stroke="var(--sun)" stroke-width="3" opacity="${ring}"/>`;
        for (let j = 0; j < m; j++) {
          const pop = ease(t, T(i) + 0.35 * j, T(i) + 0.35 * j + 0.35);
          if (pop <= 0) continue;
          const sz0 = m === 1 ? 30 : 24, fx = px(i) + PW / 2 + (j - (m - 1) / 2) * 26, fy = 40;
          const sz1 = RH - 12, tx = BX + BW / 2 + (j - (m - 1) / 2) * (sz1 + 2);
          const x = fx + (tx - fx) * fly, yy = fy + (ty - fy) * fly - 30 * Math.sin(Math.PI * fly);
          const sz = (sz0 + (sz1 - sz0) * fly) * (pop < 1 ? 0.6 + 0.4 * pop + 0.25 * Math.sin(Math.PI * pop) : 1);
          s += THINGS[is[i]!]!.draw(x, yy, sz);
        }
        if (fill && fly >= 1) s += `<text x="${BX + BW + 6}" y="${ty + 5}" font-size="14" font-weight="900" fill="var(--ok)">✓</text>`;
      });
      return s;
    },
    caption: (t) => {
      for (let i = n - 1; i >= 0; i--) {
        const tF = T(i) + 0.35 * (k(i) - 1);
        if (t >= tF + (fill ? 1.0 : 0.4)) {
          if (i === n - 1 && t >= tF + 1.9) return fill ? 'Jokainen löytö on oman paikkansa kohdalla. Nyt ne eivät unohdu!' : 'Mitä missäkin nähtiin? Merkitse vihkoon.';
          if (fill) return `${cap1(what(i))} merkitään heti rivillä ”${PLACES[ps[i]!].name}”.`;
          return `${AT[ps[i]!]} Aava näkee: ${what(i)}.`;
        }
        if (t >= T(i)) return many && t < tF + 0.4 ? `${AT[ps[i]!]} Aava laskee: ${Array.from({ length: Math.min(k(i), 1 + Math.floor((t - T(i)) / 0.35)) }, (_, j) => j + 1).join(', ')}…` : `${AT[ps[i]!]} Aava näkee: ${what(i)}.`;
      }
      return 'Aava lähtee havaintoretkelle. Vihko on mukana.';
    },
  });
}

const cnt = (n: number, k: string) => n === 1 ? `1 ${THINGS[k]!.one}` : `${n} ${THINGS[k]!.many}`;
type Col = { place: Place; item: string; n: number };

/** The presentation is built: places first, then each finding drops into its column and is counted.
 *  With `read`, Loikka then reads the picture column by column. */
function presentScene(cols: Col[], read = true): AnimPaint {
  const CW = 92, W = Math.max(300, cols.length * CW + (read ? 90 : 20)), H = 200;
  const x0 = read ? 10 : (W - cols.length * CW) / 2;
  const tP = (i: number) => 0.3 + i * 0.5;
  const drops: { c: number; j: number; t: number }[] = [];
  let tt = tP(cols.length) + 0.3;
  cols.forEach((c, i) => { for (let j = 0; j < c.n; j++) { drops.push({ c: i, j, t: tt }); tt += 0.6; } tt += 0.3; });
  const tR = tt + 0.3, RD = 1.6, dur = read ? tR + cols.length * RD + 1.4 : tt + 0.8;
  return anim({
    dur, w: W, h: H, label: 'Havainnot kuvana',
    frame: (t) => {
      let s = '';
      cols.forEach((c, i) => {
        const g = ease(t, tP(i), tP(i) + 0.4), x = x0 + i * CW + 6;
        if (g > 0) s += `<g transform="translate(${x} ${4 - 30 * (1 - g)})" opacity="${g}">${PLACES[c.place].art}</g>`;
        const k = drops.filter((d) => d.c === i && t >= d.t + 0.35).length;
        if (k > 0) s += `<text x="${x + 40}" y="${190}" text-anchor="middle" font-size="16" font-weight="900" fill="var(--pond)">${k}</text>`;
      });
      drops.forEach((d) => {
        const g = ease(t, d.t, d.t + 0.35);
        if (g <= 0) return;
        const x = x0 + d.c * CW + 46, y = 82 + d.j * 28;
        s += `<g opacity="${Math.min(1, g * 2)}">${THINGS[cols[d.c]!.item]!.draw(x, y - 40 * (1 - g), 24)}</g>`;
      });
      if (read && t > tR - 0.3) {
        const fg = ease(t, tR - 0.3, tR);
        s += `<g opacity="${fg}">${frog(W - 42, 150, 34, 'think')}</g>`;
        const i = Math.min(cols.length - 1, Math.floor((t - tR) / RD));
        if (t >= tR && t < tR + cols.length * RD) s += `<rect x="${x0 + i * CW + 2}" y="0" width="88" height="198" rx="10" fill="none" stroke="var(--sun)" stroke-width="3"/>`;
      }
      return s;
    },
    caption: (t) => {
      if (t < tP(cols.length)) return 'Ensin kuvaan tulevat paikat.';
      if (t < tR - 0.3 || !read) {
        const last = [...drops].reverse().find((d) => t >= d.t);
        if (!last) return 'Sitten jokainen löytö oman paikkansa alle.';
        const c = cols[last.c]!;
        return `${AT[c.place]}: ${THINGS[c.item]!.one}… ${last.j + 1}.`;
      }
      if (t < tR) return 'Loikka katsoo kuvaa.';
      const i = Math.floor((t - tR) / RD);
      if (i < cols.length) { const c = cols[i]!; return `Loikka lukee: ”${AT[c.place]} ${cnt(c.n, c.item)}.”`; }
      return 'Kuva kertoo, mitä nähtiin, missä ja kuinka monta.';
    },
  });
}

function recordTask(r: Rng, n: number, fix = false) {
  const ps = r.shuffle(Object.keys(PLACES) as Place[]).slice(0, n);
  const is = r.shuffle(ITEMS).slice(0, n);
  const answer = Object.fromEntries(ps.map((p, i) => [p, is[i]!]));
  const start = fix ? Object.fromEntries(ps.map((p, i) => [p, is[(i + 1) % n]!])) : undefined;
  return {
    say: fix ? 'Vihkon merkinnät menivät sekaisin. Korjaa ne vertaamalla havaintoihin.' : 'Katso Aavan retki. Laita jokainen havainto vihkoon oikean paikan kohdalle.',
    scene: tripScene(ps, is, false),
    task: { kind: 'place' as const, slots: ps.map((p) => ({ id: p, art: placeArt(p, 70), text: PLACES[p].name })), tokens: r.shuffle(is.map((k) => ({ id: k, art: itemArt(k), speak: THINGS[k]!.one }))), answer, start, why: Object.fromEntries(ps.map((p, i) => [p, `${AT[p]} Aava näki: ${THINGS[is[i]!]!.one}.`])) },
    hint: fix ? 'Käy rivit läpi yksi kerrallaan: mitä tässä paikassa nähtiin?' : 'Katso retki: missä Aava pysähtyi ja mitä siellä näkyi?',
    explain: ps.map((p, i) => `${PLACES[p].name}: ${THINGS[is[i]!]!.one}`).join(', ') + '.',
  };
}
