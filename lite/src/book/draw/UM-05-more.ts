import type { Paint } from '../../engine/types';
import type { PageDraw } from '../pages';
import { C, figure, formula, groups, pill, sequence, table, tx } from '../figures';

type Group = { n: number; color?: string; text?: string; cross?: number };
type Row = { groups: Group[]; lead?: string; tail?: string };

/**
 * Factors of 3 as tiles, in groups with a bracket and a name under each group.
 * With `bar` the first row sits over the second like a fraction; crossed tiles cancel.
 */
function factors(o: { rows: Row[]; bar?: boolean; note?: string; label: string }): Paint {
  const tw = 30, gap = 5, ggap = 18, rowH = o.bar ? 76 : 92;
  const widthOf = (r: Row) => r.groups.reduce((a, g) => a + g.n * tw + (g.n - 1) * gap, 0) + ggap * (r.groups.length - 1);
  let s = '';
  o.rows.forEach((row, r) => {
    const y = 24 + r * rowH;
    let x = 200 - widthOf(row) / 2;
    if (row.lead) s += tx(x - 14, y + 26, row.lead, { size: 20, anchor: 'end', fill: C.pond });
    row.groups.forEach((g, gi) => {
      const color = g.color ?? (gi % 2 ? C.sun : C.cool), start = x;
      for (let k = 0; k < g.n; k++) {
        s += `<rect x="${x}" y="${y}" width="${tw}" height="36" rx="7" fill="${color}" stroke="${C.ink}" stroke-width="1.5"/>` + tx(x + tw / 2, y + 25, '3', { size: 19 });
        if (k < (g.cross ?? 0)) s += `<line x1="${x + 3}" y1="${y + 33}" x2="${x + tw - 3}" y2="${y + 3}" stroke="${C.red}" stroke-width="3" stroke-linecap="round"/>`;
        x += tw + gap;
      }
      const end = x - gap;
      if (g.text) s += `<path d="M${start} ${y + 44} V${y + 50} H${end} V${y + 44}" fill="none" stroke="${C.soft}" stroke-width="1.5"/>` + tx((start + end) / 2, y + 66, g.text, { size: 14, fill: C.soft });
      x += ggap - gap;
    });
    if (row.tail) s += tx(x - ggap + gap + 14, y + 26, row.tail, { size: 20, anchor: 'start', fill: C.pond });
  });
  if (o.bar) s += `<line x1="70" y1="${24 + rowH - 18}" x2="330" y2="${24 + rowH - 18}" stroke="${C.ink}" stroke-width="2.5"/>`;
  let h = 24 + (o.rows.length - 1) * rowH + (o.rows.some(r => r.groups.some(g => g.text)) ? 76 : 48);
  if (o.note) { s += pill(200, h + 14, o.note, { size: 15, stroke: C.pond }); h += 36; }
  return figure(400, h, s, o.label);
}

/** The factor tree of 36: each number splits in two until every leaf is a prime. */
function tree36(label: string): Paint {
  const node = (x: number, y: number, v: string, leaf = false) =>
    `<circle cx="${x}" cy="${y}" r="19" fill="${leaf ? C.sun : '#fff'}" stroke="${leaf ? C.ink : C.pond}" stroke-width="${leaf ? 2.5 : 2}"/>` + tx(x, y + 6, v, { size: 17 });
  const edge = (x1: number, y1: number, x2: number, y2: number) => `<line x1="${x1}" y1="${y1 + 18}" x2="${x2}" y2="${y2 - 18}" stroke="${C.soft}" stroke-width="2"/>`;
  let s = edge(200, 30, 140, 82) + edge(200, 30, 260, 82) + edge(260, 82, 205, 134) + edge(260, 82, 315, 134) + edge(315, 134, 270, 186) + edge(315, 134, 360, 186);
  s += node(200, 30, '36') + node(140, 82, '2', true) + node(260, 82, '18') + node(205, 134, '2', true) + node(315, 134, '9') + node(270, 186, '3', true) + node(360, 186, '3', true);
  s += tx(20, 60, '36 = 2 · 18', { size: 13, anchor: 'start', fill: C.soft }) + tx(20, 112, '18 = 2 · 9', { size: 13, anchor: 'start', fill: C.soft }) + tx(20, 164, '9 = 3 · 3', { size: 13, anchor: 'start', fill: C.soft });
  s += pill(200, 236, 'lehdet ovat alkulukuja', { size: 14, stroke: C.sun });
  return figure(400, 248, s, label);
}

/** Powers as repeated factors: count the threes and the rules follow. */
export const DRAW: Record<string, () => PageDraw> = {
  'M79-POWER-SIMPLIFY': () => ({ beats: [undefined,
    formula({ lines: ['(a³)³ · a', '= a⁹ · a¹', '= a¹⁰'], note: 'ensin kerrotaan, sitten lasketaan yhteen', label: 'Sievennys vaihe kerrallaan' }),
  ] }),
  'M79-DIVIS-01': () => ({ beats: [
    groups({ sets: [{ n: 16, cols: 4, tone: 'plain' }], thing: 'stone', result: '16 = 4 · 4 + 0', label: '16 kiveä neljässä täydessä rivissä' }),
  ] }),
  'M79-PRIME-01': () => ({ beats: [undefined,
    groups({ sets: [{ n: 15, cols: 5, name: '15 = 3 · 5' }, { n: 18, cols: 9, name: '18 = 2 · 9' }], thing: 'stone', result: 'yhdistettyjä lukuja', label: '15 ja 18 asettuvat suorakulmioiksi' }),
  ] }),
  'M79-POWER-POS': () => ({ beats: [undefined,
    groups({ sets: [{ n: 9, cols: 3, name: '3² = 9' }, { n: 27, cols: 9, name: '3³ = 27', mark: true }], result: '3 · 3 · 3 = 27 > 9', label: 'Yksi tekijä lisää: kolme kertaa enemmän' }),
  ] }),
  'M79-POWER-ZERO': () => ({ beats: [undefined,
    sequence({ values: ['9', '3', '1'], steps: [': 3', ': 3'], note: '3² = 9, 3¹ = 3 ja 3⁰ = 3 : 3 = 1', label: 'Kaava jatkuu nollaan asti' }),
  ] }),
  'M79-POWER-NEG': () => ({ beats: [undefined,
    formula({ lines: ['3⁻² = 1 / 3²', '= 1 / 9'], note: '1/9 on pienempi kuin 1', label: 'Negatiivinen eksponentti on käänteisluku' }),
  ] }),
  'M79-POWER-PROD': () => ({ beats: [undefined,
    factors({ rows: [{ groups: [{ n: 2, text: '3²' }, { n: 4, text: '3⁴' }], tail: '= 3⁶' }], note: '2 + 4 = 6 kolmosta', label: 'Tulossa kolmoset lasketaan yhteen' }),
  ] }),
  'M79-POWER-QUOT': () => ({ beats: [
    factors({ rows: [{ groups: [{ n: 5, cross: 3 }], lead: '3⁵' }, { groups: [{ n: 3, cross: 3, color: C.sun }], lead: '3³' }], bar: true, note: 'kolme paria supistuu: jää 3 · 3', label: 'Viisi kolmosta jaettuna kolmella kolmosella' }),
    formula({ lines: ['3⁵ : 3³ = 3⁵⁻³', '= 3²'], note: 'jaettavan eksponentista vähennetään jakajan eksponentti', label: 'Osamäärässä eksponentit vähennetään' }),
  ] }),
  'M79-POWER-POWER': () => ({ beats: [
    factors({ rows: [{ groups: [{ n: 2, text: '3²' }, { n: 2, text: '3²' }, { n: 2, text: '3²' }, { n: 2, text: '3²' }] }], note: '4 ryhmää · 2 kolmosta = 8 kolmosta', label: 'Ryhmä 3² neljä kertaa' }),
    table({ head: ['', 'esimerkki', 'eksponentit'], rows: [['potenssin potenssi', '(3²)⁴ = 3⁸', '2 · 4 = 8'], ['tulo', '3² · 3⁴ = 3⁶', '2 + 4 = 6']], label: 'Kerrotaanko vai lasketaanko yhteen' }),
  ] }),
  'M79-PRIMEFACT-01': () => ({ beats: [
    tree36('Tekijäpuu luvulle 36'),
    formula({ lines: ['36 = 2 · 2 · 3 · 3', '= 2² · 3²'], note: 'tarkistus: 2 · 2 · 3 · 3 = 4 · 9 = 36', label: 'Lehdistä saadaan alkutekijähajotelma' }),
  ] }),
};
