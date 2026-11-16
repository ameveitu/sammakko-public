import type { Paint } from '../../engine/types';
import type { PageDraw } from '../pages';
import { atomBall, C, esc, figure, formula, groups, pill, table, tx } from '../figures';

const TINT: Record<string, string> = { C: '#e6e6e6', H: '#ffffff', O: '#fbe2db', Al: '#e3e9ec', Zn: '#dfe7f0', Ne: '#fde3f4', Co: '#dbe9f8' };
type Tile = { t: string; name?: string; el?: string };

/** Runs of element tiles, like cards of a periodic table; a name under each tile and a caption under each run. */
function tileRuns(o: { runs: { tiles: Tile[]; caption?: string }[]; between?: string; note?: string; label: string }): Paint {
  const tw = (t: Tile) => Math.max(66, t.t.length * 19 + 24, (t.name?.length ?? 0) * 7.6 + 10), gap = o.between ? 54 : 26, y = 14, h = 70;
  const runW = o.runs.map(r => r.tiles.reduce((a, t) => a + tw(t), 0) + (r.tiles.length - 1) * 4);
  let x = 200 - (runW.reduce((a, w) => a + w, 0) + gap * (o.runs.length - 1)) / 2, s = '';
  const hasName = o.runs.some(r => r.tiles.some(t => t.name)), capY = y + h + (hasName ? 46 : 24);
  o.runs.forEach((run, i) => {
    const start = x;
    for (const t of run.tiles) {
      const w = tw(t), el = t.el ?? t.t.replace(/[^A-Za-z]/g, '');
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${TINT[el] ?? '#fff'}" stroke="${C.ink}" stroke-width="2"/>` + tx(x + w / 2, y + 47, t.t, { size: 32, weight: 800 });
      if (t.name) s += tx(x + w / 2, y + h + 20, t.name, { size: 13, fill: C.soft });
      x += w + 4;
    }
    if (run.caption) s += tx((start + x - 4) / 2, capY, run.caption, { size: 13, fill: C.pond });
    if (o.between && i < o.runs.length - 1) s += tx(x - 4 + gap / 2, y + 46, o.between, { size: 28, fill: C.red });
    x += gap - 4;
  });
  let H = capY + (o.runs.some(r => r.caption) ? 14 : -8);
  if (o.note) { s += pill(200, H + 22, o.note, { size: 14, stroke: C.pond }); H += 40; }
  return figure(400, H + 8, s, o.label);
}

/** A ball-and-stick model; the note sums the atoms up. */
function ballStick(atoms: [string, number, number][], bonds: [number, number][], note: string, label: string): Paint {
  let s = '';
  for (const [a, b] of bonds) s += `<line x1="${atoms[a]![1]}" y1="${atoms[a]![2]}" x2="${atoms[b]![1]}" y2="${atoms[b]![2]}" stroke="${C.ink}" stroke-width="4"/>`;
  for (const [el, x, y] of atoms) s += atomBall(x, y, el, el === 'H' ? 14 : 21);
  s += pill(200, 194, note, { size: 15, stroke: C.pond });
  return figure(400, 206, s, label);
}
const ETHANOL: [string, number, number][] = [['C', 140, 100], ['C', 220, 100], ['O', 300, 100], ['H', 140, 46], ['H', 140, 154], ['H', 86, 100], ['H', 220, 46], ['H', 220, 154], ['H', 344, 70]];
const ETHANE: [string, number, number][] = [['C', 160, 100], ['C', 240, 100], ['H', 160, 46], ['H', 160, 154], ['H', 106, 100], ['H', 240, 46], ['H', 240, 154], ['H', 294, 100]];

/** A reaction equation with the substance names under it; options add the side brackets, the arrow word and coloured coefficients. */
function equation(o: { parts: { t: string; name?: string }[]; sides?: boolean; words?: boolean; coef?: boolean; note?: string; label: string }): Paint {
  const size = 28, wOf = (t: string) => [...t].reduce((a, ch) => a + ('₀₁₂₃₄₅₆₇₈₉'.includes(ch) ? 0.42 : /[A-Z]/.test(ch) ? 0.72 : 0.6), 0) * size;
  const widths = o.parts.map(p => wOf(p.t)), gap = 18, total = widths.reduce((a, w) => a + w, 0) + gap * (o.parts.length - 1), y = o.words ? 64 : 48;
  let x = 200 - total / 2, s = '';
  const centre: number[] = [];
  o.parts.forEach((p, i) => {
    const cx = x + widths[i]! / 2, isOp = p.t === '+' || p.t === '→';
    centre.push(cx);
    const m = o.coef ? /^(\d+)(.*)$/.exec(p.t) : null;
    const body = m ? `<tspan fill="${C.red}">${m[1]}</tspan>${esc(m[2]!)}` : esc(p.t);
    s += `<text x="${cx}" y="${y}" font-size="${size}" text-anchor="middle" fill="${isOp ? C.pond : C.ink}" font-weight="800">${body}</text>`;
    if (p.name) s += tx(cx, y + 28, p.name, { size: 13, fill: C.soft });
    if (o.words && isOp) s += pill(cx, y - 38, p.t === '→' ? 'muodostuu' : 'ja', { size: 13, stroke: C.red });
    x += widths[i]! + gap;
  });
  let h = y + 42;
  if (o.sides) {
    const arrowAt = o.parts.findIndex(p => p.t === '→'), l0 = centre[0]! - widths[0]! / 2, l1 = centre[arrowAt - 1]! + widths[arrowAt - 1]! / 2;
    const r0 = centre[arrowAt + 1]! - widths[arrowAt + 1]! / 2, r1 = centre[o.parts.length - 1]! + widths[o.parts.length - 1]! / 2, by = y + 44;
    s += `<path d="M${l0} ${by} V${by + 8} H${l1} V${by}" fill="none" stroke="${C.blue}" stroke-width="2"/>` + tx((l0 + l1) / 2, by + 28, 'lähtöaineet', { size: 14, fill: C.blue });
    s += `<path d="M${r0} ${by} V${by + 8} H${r1} V${by}" fill="none" stroke="${C.leaf}" stroke-width="2"/>` + tx((r0 + r1) / 2, by + 28, 'tuote', { size: 14, fill: C.leaf });
    h = by + 40;
  }
  if (o.note) { s += pill(200, h + 16, o.note, { size: 14, stroke: C.pond }); h += 34; }
  return figure(400, h + 6, s, o.label);
}
const ALOX = [{ t: '3O₂', name: 'happi' }, { t: '+' }, { t: '4Al', name: 'alumiini' }, { t: '→' }, { t: '2Al₂O₃', name: 'alumiinioksidi' }];

/** Element symbols, formulas and reaction equations. */
export const DRAW: Record<string, () => PageDraw> = {
  'CHEM79-SYMBOL': () => ({ beats: [
    tileRuns({ runs: [{ tiles: [{ t: 'Zn', name: 'sinkki' }] }, { tiles: [{ t: 'Ne', name: 'neon' }] }, { tiles: [{ t: 'O', name: 'happi' }] }], label: 'Kolme alkuaineen merkkiä' }),
    tileRuns({ runs: [{ tiles: [{ t: 'Co' }], caption: 'koboltti: yksi merkki' }, { tiles: [{ t: 'C' }, { t: 'O' }], caption: 'häkä: kaksi merkkiä' }], between: '≠', note: 'iso kirjain aloittaa merkin, toinen kirjain on pieni', label: 'Co on koboltti, CO on häkä' }),
  ] }),
  'CHEM79-FORMULA-ELEMENTS': () => ({ beats: [
    tileRuns({ runs: [{ tiles: [{ t: 'C₂', name: 'hiili', el: 'C' }, { t: 'H₅', name: 'vety', el: 'H' }, { t: 'O', name: 'happi' }, { t: 'H', name: 'vety' }] }], note: 'kolme eri merkkiä: C, H ja O', label: 'Etanolin kaava C₂H₅OH' }),
    table({ head: ['merkki', 'alkuaine', 'kaavassa'], rows: [['C', 'hiili', 'C₂'], ['H', 'vety', 'H₅ ja OH'], ['O', 'happi', 'OH']], mark: 1, label: 'Vety esiintyy kahdesti, mutta on yksi alkuaine' }),
  ] }),
  'CHEM79-FORMULA-RATIO': () => ({ beats: [
    groups({ sets: [{ n: 6, name: 'H: 5 + 1 = 6', color: '#ffffff', cols: 3 }, { n: 2, name: 'C: 2', color: '#4a4a4a' }, { n: 1, name: 'O: 1', color: '#e0533f' }], label: 'Etanolimolekyylin atomit' }),
    table({ head: ['H', 'C', 'O', 'Co', 'Al'], rows: [['6', '2', '1', '0', '0']], label: 'H : C : O = 6 : 2 : 1' }),
    formula({ lines: ['6 : 2 : 1', '= 12 : 4 : 2'], note: 'kaikki luvut kerrottu samalla luvulla 2', label: 'Sama suhde kahdella tavalla' }),
  ] }),
  'CHEM79-FORMULA': () => ({ beats: [
    table({ head: ['', 'C', 'H', 'O'], rows: [['laji', 'hiili', 'vety', 'happi'], ['määrä', '2', '6', '1']], mark: 1, label: 'Ensin lajit, sitten määrät' }),
    ballStick(ETHANOL, [[0, 1], [1, 2], [2, 8], [0, 3], [0, 4], [0, 5], [1, 6], [1, 7]], 'H × 6, C × 2, O × 1', 'Etanolimolekyylin malli'),
  ] }),
  'CHEM79-SUBSCRIPT': () => ({ beats: [
    tileRuns({ runs: [{ tiles: [{ t: 'C₂', name: 'koskee C:tä', el: 'C' }, { t: 'H₆', name: 'koskee H:ta', el: 'H' }] }], note: 'alaindeksi on merkin perässä', label: 'Etaanin kaava C₂H₆' }),
    ballStick(ETHANE, [[0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [1, 6], [1, 7]], 'C₂ = 2 hiiltä, H₆ = 6 vetyä', 'Etaanimolekyylin malli'),
  ] }),
  'CHEM79-REACTION-EQ-01': () => ({ beats: [
    equation({ parts: ALOX, label: 'Hapesta ja alumiinista syntyy alumiinioksidia' }),
    equation({ parts: ALOX, sides: true, label: 'Lähtöaineet vasemmalla, tuote oikealla' }),
    equation({ parts: ALOX, words: true, label: 'Nuoli: muodostuu. Plus: ja' }),
  ] }),
  'CHEM79-BALANCE': () => ({ beats: [
    table({ head: ['atomi', 'vasen O₂ + Al', 'oikea Al₂O₃', ''], rows: [['O', '2', '3', '✗'], ['Al', '1', '2', '✗']], label: 'Atomeja ei ole yhtä monta' }),
    equation({ parts: ALOX.map(p => ({ t: p.t })), coef: true, note: 'kaavat pysyvät, eteen tulee kertoimet', label: 'Kertoimet tasapainottavat yhtälön' }),
    table({ head: ['atomi', 'vasen', 'oikea', ''], rows: [['O', '3 × 2 = 6', '2 × 3 = 6', '✓'], ['Al', '4', '2 × 2 = 4', '✓']], label: 'Jokainen atomilaji erikseen' }),
  ] }),
};
