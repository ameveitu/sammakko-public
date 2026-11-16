import type { PageDraw } from '../pages';
import { bars, C, cards, circleMap, figure, formula, pill, polar, table, tx, wedge } from '../figures';


/** The same 96° wedge in a small and a big circle: the share of the circle does not depend on size. */
const sameShare = () => {
  let s = '';
  for (const [cx, r] of [[110, 52], [285, 86]] as const) {
    s += `<circle cx="${cx}" cy="112" r="${r}" fill="#eef5f1" stroke="${C.ink}" stroke-width="2"/>` + wedge(cx, 112, r, 195, 96, '#f6dc8a', C.sun);
    s += `<path d="M${polar(cx, 112, r, 195).join(' ')} A${r} ${r} 0 0 1 ${polar(cx, 112, r, 291).join(' ')}" fill="none" stroke="${C.sun}" stroke-width="6" stroke-linecap="round"/>`;
    s += tx(cx, 112 + r + 24, '96° = 4/15 kehästä', { size: 13 });
  }
  return figure(400, 228, s, 'Pieni ja iso ympyrä: 96° on aina 4/15 kehästä');
};

/** Sectors of a circle laid side by side, tips up and down: almost a rectangle r high and πr long. */
const sectorsRow = () => {
  const n = 12, r = 70, w = (Math.PI * r) / (n / 2), y0 = 40, x0 = 200 - (Math.PI * r) / 2 - w / 4;
  let s = '';
  for (let i = 0; i < n; i++) {
    const up = i % 2 === 0, x = x0 + (i * w) / 2, tip = up ? y0 : y0 + r, base = up ? y0 + r : y0, bulge = up ? 6 : -6;
    s += `<path d="M${x + w / 2} ${tip} L${x} ${base} Q${x + w / 2} ${base + bulge} ${x + w} ${base}Z" fill="${up ? '#f6dc8a' : '#bfe0d2'}" stroke="${C.ink}" stroke-width="1.2"/>`;
  }
  const xr = x0 + (n / 2) * w + w / 2 + 10;
  s += `<line x1="${xr}" y1="${y0}" x2="${xr}" y2="${y0 + r}" stroke="${C.red}" stroke-width="2.5"/>` + tx(xr + 8, y0 + r / 2 + 5, 'r', { size: 16, fill: C.red, anchor: 'start', italic: true });
  s += `<line x1="${x0}" y1="${y0 + r + 22}" x2="${x0 + (n / 2) * w}" y2="${y0 + r + 22}" stroke="${C.blue}" stroke-width="2.5"/>` + tx(200, y0 + r + 42, 'πr = puolet kehästä', { size: 14, fill: C.blue });
  s += pill(200, y0 + r + 76, 'ala ≈ πr · r = πr²', { size: 16, stroke: C.pond });
  return figure(400, 206, s, 'Sektorit rinnakkain: lähes suorakulmio, korkeus r ja pituus πr');
};

/** Two circles, radius 8 cm and 16 cm: the bigger one has four times the area. */
const twoDisks = () => {
  let s = `<circle cx="110" cy="112" r="42" fill="#bfe0d2" stroke="${C.ink}" stroke-width="2"/><circle cx="280" cy="112" r="84" fill="#f6dc8a" stroke="${C.ink}" stroke-width="2"/>`;
  s += `<line x1="110" y1="112" x2="152" y2="112" stroke="${C.red}" stroke-width="2.5"/>` + tx(131, 106, '8 cm', { size: 12, fill: C.red });
  s += `<line x1="280" y1="112" x2="364" y2="112" stroke="${C.red}" stroke-width="2.5"/>` + tx(322, 106, '16 cm', { size: 12, fill: C.red });
  s += tx(110, 182, '64π cm²', { size: 15 }) + tx(280, 140, '256π cm²', { size: 15 });
  s += pill(110, 30, 'säde × 2 → ala × 4', { size: 13, stroke: C.pond });
  return figure(400, 210, s, 'Säde 8 cm ja 16 cm: ala 64π cm² ja 256π cm²');
};

const radius16 = (fill: string, text: string, label: string) => circleMap({
  points: [], cx: 140, fill, lines: [{ from: "O", to: "H", text: "r = 16 cm", color: C.red, side: -1, off: 30 }],
  pills: text.split('\n').map((t, i) => ({ x: 318, y: 92 + i * 34, text: t, size: 14 })), label,
});

/** Circle parts on one map: radius, diameter, arc, circumference, central and inscribed angles. */
export const DRAW: Record<string, () => PageDraw> = {
  'M79-CIRCLE-RADIUS': () => ({ beats: [
    circleMap({ lines: [{ from: "O", to: "E", text: "15 cm", side: -1 }, { from: "O", to: "F", text: "15 cm" }], hot: ['E', 'F'], label: 'Janat OE ja OF, kumpikin 15 cm' }),
    circleMap({ lines: ['C', 'D', 'B', 'H', 'E', 'F'].map(p => ({ from: 'O', to: p, width: 2.5 })), pills: [{ x: 84, y: 22, text: "säteet yhtä pitkiä" }], label: 'Säteet keskipisteestä kehälle ovat yhtä pitkiä' }),
  ] }),
  'M79-CIRCLE-DIAMETER': () => ({ beats: [
    circleMap({ lines: [{ from: 'A', to: 'O', text: '15 cm', color: C.blue }, { from: 'O', to: 'H', text: '15 cm', color: C.pond }], hot: ['A', 'H'], pills: [{ x: 330, y: 26, text: 'AH = 30 cm' }], label: 'Halkaisija AH: 15 cm + 15 cm = 30 cm' }),
    circleMap({ lines: [{ from: "A", to: "H", text: "d", color: C.pond, side: -1, at: 0.25 }, { from: "O", to: "D", text: "r", color: C.red, at: 0.6 }], pills: [{ x: 345, y: 26, text: 'd = 2r' }], label: 'Halkaisija on kaksi sädettä: d = 2r' }),
  ] }),
  'M79-CIRCLE-CIRCUMFERENCE-CONCEPT': () => ({ beats: [
    circleMap({ route: 'E', hot: ['E'], label: 'Kierros E:stä kehää pitkin takaisin E:hen' }),
    circleMap({ rim: { color: C.sun, width: 9 }, points: [], centre: false, pills: [{ x: 200, y: 122, text: 'kehä = koko reunaviiva' }], label: 'Kehä on ympyrän koko reunaviiva' }),
  ] }),
  'M79-CIRCLE-ARC': () => ({ beats: [
    circleMap({ arcs: [{ from: "A", to: "B", color: C.leaf, text: "lyhyempi", textAt: [62, 36] }, { from: "B", to: "A", color: C.sun, dash: true, width: 5, text: "pidempi", textAt: [340, 214] }], hot: ['A', 'B'], label: 'Kaksi reittiä A:sta B:hen kehää pitkin' }),
    circleMap({ arcs: [{ from: "A", to: "B", color: C.leaf, text: "kaari A–C–B", textAt: [62, 36] }, { from: "B", to: "A", color: C.sun, width: 5, text: "kaari A–F–B", textAt: [335, 214] }], hot: ['C', 'F'], label: 'Kaari nimetään välipisteen avulla' }),
  ] }),
  'M79-CIRCLE-BASIC': () => ({ beats: [
    circleMap({ lines: [{ from: "A", to: "H", color: C.pond, text: "d = 30 cm", width: 3, at: 0.78, off: 22 }, { from: "A", to: "O", color: C.blue, text: "r = 15 cm", width: 5, side: -1, off: 22 }], arcs: [{ from: "A", to: "B", text: "kaari A–C–B", textAt: [62, 36] }], label: 'Säde OA, halkaisija AH, kaari A–C–B ja kehä' }),
    table({ head: ['osa', 'mistä mihin'], rows: [['säde', 'keskipisteestä kehälle'], ['halkaisija', 'kehältä kehälle O:n kautta'], ['kaari', 'osa kehää'], ['kehä', 'koko reunaviiva']], label: 'Ympyrän osat' }),
  ] }),
  'M79-CENTRAL-ANGLE': () => ({ beats: [
    circleMap({ lines: [{ from: 'O', to: 'A' }, { from: 'O', to: 'B' }], arcs: [{ from: 'A', to: 'B' }], angles: [{ at: 'O', a: 'A', b: 'B', text: '96°' }], label: 'Kulman kärki O, kyljet A:han ja B:hen: 96°' }),
    circleMap({ lines: [{ from: 'O', to: 'A' }, { from: 'O', to: 'B' }], arcs: [{ from: "A", to: "B", text: "kaari 96°", textAt: [62, 36] }], angles: [{ at: 'O', a: 'A', b: 'B', text: '96°' }], pills: [{ x: 70, y: 210, text: 'keskuskulma' }], label: 'Keskuskulma 96° ja sen kaari 96°' }),
    sameShare(),
  ] }),
  'M79-CIRCLE-CIRC': () => ({ beats: [
    radius16('#eef5f1', 'C = 2πr = 32π cm\n≈ 100,53 cm', 'Säde 16 cm: kehä 32π cm'),
    bars({ bars: [{ label: '3 · d', value: 96, text: '96 cm' }, { label: 'kehä', value: 100.53, text: '≈ 100,53 cm', mark: true }, { label: '4 · d', value: 128, text: '128 cm' }], horizontal: true, max: 130, note: 'd = 32 cm · kehä = π · d', label: 'Kehä on vähän yli 3 halkaisijaa' }),
  ] }),
  'M79-ARC': () => ({ beats: [
    circleMap({ points: [], cx: 140, sector: { from: 'A', to: 'B', color: '#fbefc4' }, arcs: [{ from: 'A', to: 'B' }], angles: [{ at: 'O', a: 'A', b: 'B', text: '96°' }],
      pills: [{ x: 318, y: 92, text: '4/15 · 32π cm' }, { x: 318, y: 126, text: '≈ 26,81 cm' }], label: 'Kaari 96° on 4/15 kehästä' }),
    bars({ bars: [{ label: '96°', value: 26.81, text: '≈ 26,81 cm' }, { label: '192°', value: 53.62, text: '≈ 53,62 cm', mark: true }], horizontal: true, max: 60, note: 'b = α/360° · 2πr', label: 'Kaksinkertainen keskuskulma, kaksinkertainen kaari' }),
  ] }),
  'M79-CIRCLE-AREA': () => ({ beats: [
    radius16('#f6dc8a', 'A = πr² = 256π cm²\n≈ 804,25 cm²', 'Säde 16 cm: ala 256π cm²'),
    sectorsRow(),
    twoDisks(),
  ] }),
  'M79-INSCRIBED-ANGLE-CONCEPT': () => ({ beats: [
    circleMap({ lines: [{ from: 'E', to: 'A' }, { from: 'E', to: 'B' }], arcs: [{ from: 'A', to: 'B' }], angles: [{ at: 'E', a: 'A', b: 'B' }], hot: ['E'], label: 'Kärki E kehällä, kyljet A:han ja B:hen' }),
    circleMap({ lines: [{ from: 'E', to: 'A', text: 'jänne', side: -1 }, { from: 'E', to: 'B', text: 'jänne' }], arcs: [{ from: 'A', to: 'B' }], angles: [{ at: 'E', a: 'A', b: 'B' }], hot: ['E'], pills: [{ x: 70, y: 26, text: 'kehäkulma' }], label: 'Kehäkulma: kärki kehällä, kyljet jänteitä' }),
  ] }),
  'M79-SECTOR': () => ({ beats: [
    circleMap({ points: [], cx: 140, sector: { from: 'A', to: 'B' }, angles: [{ at: 'O', a: 'A', b: 'B', text: '96°' }],
      pills: [{ x: 318, y: 92, text: '4/15 · 256π cm²' }, { x: 318, y: 126, text: '≈ 214,47 cm²' }], label: 'Sektori 96° on 4/15 ympyrästä' }),
    circleMap({ points: [], cx: 140, sector: { from: 'A', to: 'B' }, lines: [{ from: 'O', to: 'A', text: 'r', color: C.red, side: -1 }, { from: 'O', to: 'B', text: 'r', color: C.red }], arcs: [{ from: 'A', to: 'B', text: 'kaari', color: C.sun }],
      angles: [{ at: 'O', a: 'A', b: 'B', text: 'α', color: C.ink }], pills: [{ x: 318, y: 110, text: 'A = α/360° · πr²' }], label: 'Sektori: kaksi sädettä ja kaari' }),
  ] }),
  'M79-INSCRIBED-CENTRAL-REL': () => ({ beats: [
    circleMap({ lines: [{ from: 'O', to: 'A', color: C.pond }, { from: 'O', to: 'B', color: C.pond }, { from: 'E', to: 'A', color: C.red }, { from: 'E', to: 'B', color: C.red }], arcs: [{ from: 'A', to: 'B' }],
      angles: [{ at: 'O', a: 'A', b: 'B', text: '96°', color: C.pond }, { at: 'E', a: 'A', b: 'B', text: '48°' }], hot: ['E'], label: 'Keskuskulma 96° ja kehäkulma 48° samalle kaarelle' }),
    formula({ lines: ['keskuskulma = 2 · kehäkulma', '2 · 48° = 96°'], note: 'kun molemmat vastaavat samaa kaarta', label: 'Keskuskulma on kaksi kertaa kehäkulma' }),
    circleMap({ lines: [["E", C.red], ["F", C.blue]].flatMap(([p, c]) => [{ from: p!, to: "A", color: c, width: 2.5 }, { from: p!, to: "B", color: c, width: 2.5 }]), arcs: [{ from: 'A', to: 'B' }],
      angles: [{ at: "E", a: "A", b: "B", text: "48°" }, { at: "F", a: "A", b: "B", text: "48°", color: C.blue }], hot: ["E", "F"], label: "Kärki E tai F: kulma on aina 48°" }),
  ] }),
  'M79-INSCRIBED-ANGLE': () => ({ beats: [
    circleMap({ lines: [{ from: 'O', to: 'A', color: C.pond, width: 2.5 }, { from: 'O', to: 'B', color: C.pond, width: 2.5 }, { from: 'E', to: 'A', color: C.red }, { from: 'E', to: 'B', color: C.red }], arcs: [{ from: 'A', to: 'B' }],
      angles: [{ at: 'O', a: 'A', b: 'B', text: '96°', color: C.pond }, { at: 'E', a: 'A', b: 'B', text: '?' }], hot: ['E'], label: 'Keskuskulma 96°, kehäkulma AEB kysytään' }),
    circleMap({ lines: [{ from: 'E', to: 'A', color: C.red }, { from: 'E', to: 'B', color: C.red }], arcs: [{ from: "A", to: "B" }], angles: [{ at: "E", a: "A", b: "B", text: "48°" }], hot: ['E'],
      pills: [{ x: 70, y: 26, text: '96° : 2 = 48°' }], label: 'Kehäkulma on puolet: 48°' }),
    cards({ cards: [{ icon: '📍', title: 'kärki kehällä', mark: 'ok', tone: 'cool' }, { icon: '📐', title: 'kyljet kaaren päihin', mark: 'ok', tone: 'cool' }, { icon: '↔️', title: 'kärki toisella kaarella', mark: 'ok', tone: 'cool' }], label: 'Kolme tarkistusta ennen puolitussääntöä' }),
  ] }),
  'M79-THALES': () => ({ beats: [
    circleMap({ lines: [{ from: 'A', to: 'H', color: C.pond }, { from: 'E', to: 'A', color: C.red, width: 2.5 }, { from: 'E', to: 'H', color: C.red, width: 2.5 }, { from: 'F', to: 'A', color: C.blue, width: 2.5 }, { from: 'F', to: 'H', color: C.blue, width: 2.5 }],
      angles: [{ at: 'E', a: 'A', b: 'H', right: true }, { at: 'F', a: 'A', b: 'H', right: true, color: C.blue }], hot: ['E', 'F'], pills: [{ x: 345, y: 26, text: '90° ja 90°' }], label: 'Halkaisija AH: kehäkulmat E:ssä ja F:ssä ovat 90°' }),
    circleMap({ lines: [{ from: 'A', to: 'H', color: C.pond }, { from: 'E', to: 'A', color: C.red, width: 2.5 }, { from: 'E', to: 'H', color: C.red, width: 2.5 }], arcs: [{ from: 'A', to: 'H', color: C.sun, width: 6 }],
      angles: [{ at: 'O', a: 'A', b: 'H', text: '180°', color: C.pond, cw: true }, { at: 'E', a: 'A', b: 'H', right: true }], hot: ['E'], pills: [{ x: 70, y: 210, text: '180° : 2 = 90°' }], label: 'Keskuskulma 180°, kehäkulma 90°' }),
    circleMap({ lines: [{ from: 'O', to: 'A', color: C.pond, width: 2.5 }, { from: 'O', to: 'B', color: C.pond, width: 2.5 }, { from: 'E', to: 'A', color: C.red }, { from: 'E', to: 'B', color: C.red }, { from: 'A', to: 'B', color: C.grey, width: 2.5, dash: true }],
      angles: [{ at: 'O', a: 'A', b: 'B', text: '96°', color: C.pond }, { at: 'E', a: 'A', b: 'B', text: '48°' }], hot: ['E'], pills: [{ x: 70, y: 26, text: 'AB ei ole halkaisija' }], label: 'Jänne AB: keskuskulma 96°, kehäkulma 48°' }),
  ] }),
};
