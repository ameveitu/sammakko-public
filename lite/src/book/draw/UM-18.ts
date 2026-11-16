import type { PageDraw } from '../pages';
import { arrow, axisBars, bars, C, cards, chips, dotPlot, figure, formula, lineChart, pill, spinners, strips, table, tx } from '../figures';

const CARD = (x: number, y: number, t: string, o: { hot?: boolean; dim?: boolean } = {}) =>
  `<rect x="${x - 20}" y="${y - 28}" width="40" height="56" rx="6" fill="#fff" stroke="${o.hot ? C.red : C.ink}" stroke-width="${o.hot ? 3 : 2}"${o.dim ? ' opacity="0.45"' : ''}/>` + tx(x, y + 8, t, { size: 22, fill: o.dim ? C.grey : C.ink });

/** A deck of three cards; two are drawn in turn and the first is not put back. */
const deck = () => {
  let s = CARD(70, 70, 'A') + CARD(120, 70, 'B') + CARD(170, 70, 'C');
  s += arrow(200, 70, 246, 70, { color: C.pond, width: 3 }) + CARD(280, 70, 'A', { hot: true }) + tx(280, 122, '1. nosto', { size: 12, fill: C.soft });
  s += CARD(340, 70, 'C', { hot: true }) + tx(340, 122, '2. nosto', { size: 12, fill: C.soft });
  s += pill(200, 160, 'A·C ja C·A ovat eri tuloksia', { size: 14, stroke: C.pond });
  return figure(400, 180, s, 'Kaksi korttia peräkkäin, ensimmäistä ei palauteta');
};

/** Tree of ordered draws: 3 first cards, each with 2 second cards = 6 outcomes. */
const drawTree = () => {
  const first = ['A', 'B', 'C'];
  let s = tx(40, 116, 'alku', { size: 12, fill: C.soft });
  first.forEach((a, i) => {
    const y1 = 46 + i * 70, rest = first.filter(b => b !== a);
    s += `<line x1="64" y1="112" x2="128" y2="${y1}" stroke="${C.line}" stroke-width="2"/>` + pill(144, y1 + 5, a, { size: 15, stroke: C.pond });
    rest.forEach((b, k) => {
      const y2 = y1 - 16 + k * 32;
      s += `<line x1="162" y1="${y1}" x2="222" y2="${y2}" stroke="${C.line}" stroke-width="2"/>` + pill(238, y2 + 5, b, { size: 13 }) + tx(300, y2 + 5, `${a}·${b}`, { size: 14, fill: C.pond });
    });
  });
  s += tx(144, 18, '3 tapaa', { size: 12, fill: C.soft }) + tx(238, 18, '2 tapaa', { size: 12, fill: C.soft }) + pill(352, 18, '3 · 2 = 6', { size: 14, stroke: C.pond });
  return figure(400, 232, s, 'Puu: 3 ensimmäistä korttia, kullekin 2 toista: 6 tulosta');
};

/** Ordered results joined into unordered pairs: A·C and C·A are the same pair. */
const samePairs = () => {
  let s = '';
  [['A·B', 'B·A'], ['A·C', 'C·A'], ['B·C', 'C·B']].forEach(([p, q], i) => {
    const x = 70 + i * 130;
    s += `<rect x="${x - 54}" y="22" width="108" height="86" rx="14" fill="${C.cool}" stroke="${C.line}" stroke-width="1.5"/>` + tx(x, 52, p!, { size: 16 }) + tx(x, 88, q!, { size: 16 });
  });
  s += pill(200, 140, 'järjestys ei merkitse: 3 paria', { size: 15, stroke: C.pond });
  return figure(400, 160, s, 'Jos järjestys ei merkitse, 6 tulosta on 3 paria');
};

/** Five note slips; slip 5 copies slip 3. */
const slips = () => {
  const notes: [string, string, string, boolean?][] = [['1 · A', 'Kallio aamu', '0'], ['2 · B', 'Kallio ilta', 'puuttuu'], ['3 · C', 'Ruovikko aamu', '15'], ['4 · D', 'Ruovikko ilta', '3'], ['5 · C', 'Ruovikko aamu', '15', true]];
  let s = '';
  notes.forEach(([id, where, v, copy], i) => {
    const x = 8 + i * 78, tilt = (i % 2 ? 2 : -2);
    s += `<g transform="rotate(${tilt} ${x + 36} 70)"><rect x="${x}" y="22" width="72" height="96" rx="4" fill="${copy ? '#f4f0e4' : '#fffbe8'}" stroke="${copy ? C.red : C.line}" stroke-width="${copy ? 2.5 : 1.5}"${copy ? ' stroke-dasharray="5 4"' : ''}/>`
      + tx(x + 36, 44, id, { size: 13 }) + tx(x + 36, 66, where.split(' ')[0]!, { size: 11, fill: C.soft }) + tx(x + 36, 81, where.split(' ')[1]!, { size: 11, fill: C.soft })
      + tx(x + 36, 106, v, { size: v.length > 3 ? 12 : 17, fill: v === 'puuttuu' ? C.red : C.ink }) + '</g>';
  });
  s += pill(320, 146, 'lappu 5 = lappu 3', { size: 13, stroke: C.red });
  return figure(400, 166, s, 'Viisi lappua: lappu 5 on lapun 3 kaksoiskappale');
};

const bird = (t: string) => ({ text: t, color: t === 'sorsa' ? '#dbe9f8' : t === 'tiira' ? '#fbe2db' : '#e3f1df' });

/** Statistics and probability: collecting data, diagrams, frequencies, middle values, spread and chance. */
export const DRAW: Record<string, () => PageDraw> = {
  'M79-DATA-COLLECT': () => ({ beats: [
    table({ head: ['laituri', 'aamu', 'ilta'], rows: [['Pohjoislaituri', '✓', '✓'], ['Kalliolaituri', '✓', '✓'], ['Ruovikkolaituri', '✓', '✓']], label: 'Aineistoon jokainen laituri aamulla ja illalla' }),
    cards({ cards: [{ icon: '🔢', title: 'muuttuja', text: 'laiturikäyntien määrä', tone: 'cool' }, { icon: '⏱️', title: 'yhtä pitkä ikkuna', text: 'joka paikassa ja aikaan', mark: 'ok', tone: 'cool' }], label: 'Sama muuttuja, yhtä pitkä havaintoikkuna' }),
    bars({ bars: [{ label: 'Ruovikko aamu', value: 6, text: '6' }, { label: 'Ruovikko keskipäivä', value: 9, text: '9' }, { label: 'Pohjoinen aamu', value: 4, text: '4' }, { label: 'Kallio ilta', value: 10, text: '10' }], max: 12, note: 'päätelmät koskevat vain näitä käyntejä', label: 'Neljä havaintoikkunaa' }),
  ] }),
  'M79-DIAGRAM-INTERP': () => ({ beats: [
    axisBars({ bars: [{ label: 'aamu', value: 42 }, { label: 'ilta', value: 46, mark: true }], from: 38, to: 48, step: 2, note: 'alkaa 38', label: 'Akseli alkaa 38:sta: ilta näyttää kaksinkertaiselta' }),
    bars({ bars: [{ label: 'aamu', value: 42, text: '42' }, { label: 'ilta', value: 46, text: '46', mark: true }], max: 50, note: 'nollasta alkaen: ero vain 4', label: 'Sama aineisto nollasta alkavalla akselilla' }),
    table({ head: ['', 'havaintoja', 'kaikki', 'osuus'], rows: [['aamu', '16', '48', '1/3'], ['ilta', '13', '26', '1/2']], mark: 1, label: 'Määrä laski, osuus nousi' }),
  ] }),
  'M79-DIAGRAM-PROD': () => ({ beats: [
    table({ head: ['klo', '8.00', '10.00', '12.00', '14.00'], rows: [['havaintoja', '12', '10', '7', '5']], label: 'Havainnot kellonajoittain' }),
    lineChart({ xs: ['8.00', '10.00', '12.00', '14.00'], ys: [], max: 12, step: 2, xName: 'kellonaika →', yName: 'havaintoja (kpl)', empty: true, label: 'Viivadiagrammin akselit: kellonaika ja havaintojen määrä' }),
    lineChart({ xs: ['8.00', '10.00', '12.00', '14.00'], ys: [12, 10, 7, 5], max: 12, step: 2, xName: 'kellonaika →', yName: 'havaintoja (kpl)', label: 'Valmis viivadiagrammi: määrä laskee koko päivän' }),
  ] }),
  'M79-PROB-SPACE': () => ({ beats: [deck(), drawTree(), samePairs()] }),
  'M79-DATA-STRUCT': () => ({ beats: [
    slips(),
    table({ head: ['lappu', 'laituri', 'aika', 'käyntejä'], rows: [['A', 'Kallio', 'aamu', '0'], ['B', 'Kallio', 'ilta', ''], ['C', 'Ruovikko', 'aamu', '15'], ['D', 'Ruovikko', 'ilta', '3']], mark: 1, label: 'Yksi rivi havaintoa kohti; puuttuva solu jää tyhjäksi' }),
    dotPlot({ rows: [{ name: 'käynnit', values: [0, 3, 15] }], from: 0, to: 16, band: { from: 0, to: 10, text: 'tavallinen väli 0–10' }, callouts: [{ at: 15, text: 'tarkista' }], label: 'Tavallinen väli 0–10: lukema 15 merkitään tarkistettavaksi' }),
  ] }),
  'M79-MODE': () => ({ beats: [
    chips({ items: ['Ruovikko', 'Kallio', 'Laituri', 'Kallio', 'Kallio', 'Ruovikko', 'Laituri', 'Ruovikko', 'Kallio', 'Ruovikko'].map(t => ({ text: t, color: t === 'Kallio' ? '#dbe9f8' : t === 'Ruovikko' ? '#e3f1df' : '#fbe2db' })), title: 'kymmenen retkivalintaa', label: 'Kymmenen retkivalintaa' }),
    bars({ bars: [{ label: 'Kallio', value: 4, text: '4', mark: true }, { label: 'Ruovikko', value: 4, text: '4', mark: true }, { label: 'Laituri', value: 2, text: '2' }], max: 5, note: 'kaksi tyyppiarvoa: Kallio ja Ruovikko', label: 'Yleisimmät arvot ovat tyyppiarvoja' }),
    bars({ bars: [{ label: 'Kallio', value: 3, text: '3' }, { label: 'Ruovikko', value: 3, text: '3' }, { label: 'Laituri', value: 3, text: '3' }], max: 5, note: 'kaikki yhtä yleisiä: tyyppiarvoa ei nimetä', label: 'Kun kaikki ovat yhtä yleisiä, tyyppiarvoa ei nimetä' }),
  ] }),
  'M79-PROB-CLASSIC': () => ({ beats: [
    spinners({ wheels: [[{ text: 'A', color: C.pond }, { text: 'B', color: C.blue }, { text: 'C', color: C.purple }], [{ text: '2', color: C.leaf }, { text: '1', color: '#c98b5a' }]], between: 'ja', result: '3 · 2 = 6 paria', label: 'Kaksi kiekkoa: 3 · 2 = 6 mahdollista paria' }),
    table({ head: ['', '2', '1'], rows: [['A', 'A·2 ✓', 'A·1 ✓'], ['B', 'B·2', 'B·1'], ['C', 'C·2', 'C·1']], label: 'Suotuisat A·2 ja A·1: 2/6 = 1/3' }),
    cards({ cards: [{ icon: '🎯', title: 'sektorit yhtä suuret', mark: 'ok', tone: 'cool' }, { icon: '🔀', title: 'pyöräytykset riippumattomia', mark: 'ok', tone: 'cool' }], label: 'Suotuisat / kaikki pätee, kun tulokset ovat yhtä mahdollisia' }),
  ] }),
  'M79-FREQ': () => ({ beats: [
    chips({ items: ['kuikka', 'sorsa', 'tiira', 'sorsa', 'sorsa', 'sorsa', 'tiira', 'kuikka', 'tiira'].map(bird), title: 'havaintovihko: 9 havaintoa', label: 'Yhdeksän lintuhavaintoa' }),
    table({ head: ['laji', 'frekvenssi'], rows: [['sorsa', '4'], ['tiira', '3'], ['kuikka', '2'], ['lokki', '0']], label: 'Frekvenssi: montako kertaa laji esiintyy' }),
    bars({ bars: [{ label: 'sorsa', value: 4, text: '4' }, { label: 'tiira', value: 3, text: '3' }, { label: 'kuikka', value: 2, text: '2' }, { label: 'lokki', value: 0, text: '0' }], max: 5, note: '4 + 3 + 2 + 0 = 9 havaintoa', label: 'Frekvenssien summa on havaintojen määrä' }),
  ] }),
  'M79-MEDIAN': () => ({ beats: [
    chips({ items: ['9', '13', '5', '11', '9'].map(t => ({ text: `${t} mm` })), title: 'viisi havaintoa', label: 'Viisi havaintoa: 9, 13, 5, 11 ja 9 mm' }),
    chips({ items: ['5', '9', '9', '11', '13'].map((t, i) => ({ text: `${t} mm`, hot: i === 2, color: i === 2 ? C.glow : '#fff' })), title: 'pienimmästä suurimpaan', note: 'mediaani 9 mm', label: 'Järjestetyn jonon keskimmäinen: 9 mm' }),
    chips({ items: ['5', '9', '9', '11', '50'].map((t, i) => ({ text: `${t} mm`, hot: i === 2 || i === 4, color: i === 2 ? C.glow : '#fff' })), title: 'jos 13 olisikin 50', note: 'mediaani yhä 9 mm', label: 'Tässä suurimman arvon 13 vaihtaminen 50:ksi ei muuta mediaania 9 mm' }),
  ] }),
  'M79-SPREAD': () => {
    const rows = [{ name: 'Ruovikko', values: [7, 8, 9, 9, 10, 11] }, { name: 'Kallio', values: [5, 7, 9, 9, 11, 13] }];
    return { beats: [
      dotPlot({ rows, from: 5, to: 13, mean: 9, label: 'Kaksi aineistoa, sama keskiarvo 9 mm' }),
      dotPlot({ rows, from: 5, to: 13, ranges: true, unit: 'mm', label: 'Vaihteluväli: leveys 4 mm ja 8 mm' }),
      dotPlot({ rows: [{ ...rows[0]!, note: '6 / 6' }, { ...rows[1]!, note: '4 / 6' }], from: 5, to: 13, band: { from: 7, to: 11 }, label: 'Keskialueella 7–11 mm: 6 ja 4 havaintoa' }),
    ] };
  },
  'M79-RELFREQ': () => ({ beats: [
    table({ head: ['päivä', 'lokkeja', 'kaikki'], rows: [['Ruovikkopäivä', '4', '20'], ['Kalliopäivä', '4', '10']], label: 'Sama frekvenssi, eri määrä havaintoja' }),
    formula({ lines: ['4/20 = 1/5 = 20 %', '4/10 = 2/5 = 40 %'], note: 'suhteellinen frekvenssi = frekvenssi / kaikki', label: 'Suhteellinen frekvenssi' }),
    strips({ rows: [{ name: 'Ruovikko', n: 20, k: 4, text: '20 %' }, { name: 'Kallio', n: 10, k: 4, text: '40 %' }], note: 'osuus kaksinkertainen', label: 'Sama määrä lokkeja, eri osuus' }),
  ] }),
  'M79-PROB-EMP': () => ({ beats: [
    spinners({ wheels: [[{ text: 'S', color: C.blue }, { text: 'P', color: C.red }, { text: 'S', color: C.blue }, { text: 'P', color: C.red }]], result: 'sininen: 2/4 = 1/2', label: 'Neljä yhtä suurta sektoria, kaksi sinistä' }),
    bars({ bars: [{ label: 'koe A · 12', value: 50, text: '6/12 = 50 %' }, { label: 'koe B · 60', value: 37, text: '22/60 ≈ 37 %' }], max: 60, line: { at: 50, text: 'malli 50 %' }, label: 'Kokeissa sinisen osuus 50 % ja 37 %' }),
    cards({ cards: [{ icon: '🎲', title: 'pieni otos', text: 'osuus vaihtelee paljon', tone: 'warm' }, { icon: '📊', title: 'suuri otos', text: 'yleensä vakaampi', tone: 'cool' }], label: 'Kokeellinen todennäköisyys vaihtelee' }),
  ] }),
  'M79-MEAN': () => ({ beats: [
    bars({ bars: [10, 13, 9, 13, 12].map(v => ({ label: `${v} cm`, value: v })), max: 20, line: { at: 11.4, text: 'keskiarvo 11,4' }, note: '57 / 5 = 11,4 cm', label: 'Viisi havaintoa, keskiarvo 11,4 cm' }),
    bars({ bars: [10, 13, 9, 13, 12, 19].map((v, i) => ({ label: `${v} cm`, value: v, mark: i === 5 })), max: 20, line: { at: 12.7, text: 'keskiarvo ≈ 12,7' }, note: '76 / 6 ≈ 12,7 cm', label: 'Uusi havainto 19 cm nostaa keskiarvon' }),
    bars({ bars: [1, 2, 3, 4, 5].map(() => ({ label: '11,4 cm', value: 11.4 })), max: 20, note: '57 cm tasan viidelle: kukin 11,4 cm', label: 'Keskiarvo on tasattu arvo' }),
  ] }),
};
