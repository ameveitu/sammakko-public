// Pond laboratory (grades 7–9 physics). Text and charts; every conversion factor is shown.
import type { Rng } from '../engine/rng';
import type { Item, NodeSpec, Option } from '../engine/types';
import { eqv, fmt } from './fi';
import { cases, chart, choose, fixed, paint, sample, table, txt, type Axes, withItemReadiness } from './kit';
import { AUDIT_REV, LAUNCH_REV } from './audit-rev';
import { ANIM, anim } from '../ui/anim';
import { avgScene, convScene, hourScene, logScene, measureScene, plotDataScene, notQtyScene, stLiveScene, vtLiveScene, accelTableScene, dualLiveScene, partsScene, perSecondScene, raceScene, refScene, triangleScene, unitBuildScene, unitSizeScene } from './phyanim';

type Q = Omit<Item, 'tag'>;
const card = (...lines: string[]) => paint(`<div class="formula">${lines.join('<br>')}</div>`);
const ask = (say: string, answer: number, unit: string, explain: string, scene?: string, tolerance?: number): Q =>
  ({ say, scene: scene ? paint(scene) : undefined, task: { kind: 'numeric', answer, unit, tolerance }, explain });
const t = (s: string) => txt(s, false);
/** Adds a hint and wrong-answer feedback to a numeric question; whyAt keys equal to the answer are dropped. */
const wq = (q: Q, hint: string, whyAt: Record<number, string> = {}): Q => {
  if (q.task.kind !== 'numeric') return { ...q, hint };
  const ans = q.task.answer, w = Object.fromEntries(Object.entries(whyAt).filter(([k]) => Math.abs(+k - ans) > 1e-9));
  return { ...q, hint, task: { ...q.task, whyAt: w } };
};

// ---------------------------------------------------------------- quantities
interface Qty { name: string; sym: string; unit: string; unitName: string; vals: number[]; tool: string }
const QTYS: Qty[] = [
  { name: 'pituus', sym: 'l', unit: 'm', unitName: 'metri', vals: [1.2, 2, 3.5, 12], tool: 'mittanauha' },
  { name: 'massa', sym: 'm', unit: 'kg', unitName: 'kilogramma', vals: [0.4, 2.5, 4, 60], tool: 'vaaka' },
  { name: 'aika', sym: 't', unit: 's', unitName: 'sekunti', vals: [3, 12.5, 40, 90], tool: 'sekuntikello' },
  { name: 'lämpötila', sym: 'T', unit: '°C', unitName: 'celsiusaste', vals: [4, 18, 21.5, 37] , tool: 'lämpömittari' },
];
/** [thing, number, unit, why] for unit-filling: only one unit gives a sensible size. */
const UNIT_FILL: [string, string, string, string][] = [
  ['Pöydän pituus', '120', 'cm', 'Pöytä on 120 cm eli reilu metri. 120 m olisi jalkapallokenttää pidempi.'],
  ['Sammakon massa', '0,4', 'kg', 'Massa ilmaistaan kilogrammoina: 0,4 kg.'],
  ['Loikkakisan aika', '12', 's', 'Aika ilmaistaan sekunteina: 12 s.'],
  ['Uimaveden lämpötila', '21', '°C', 'Lämpötila ilmaistaan celsiusasteina: 21 °C.'],
  ['Järven pituus', '3', 'km', 'Järvi on kilometrien mittainen: 3 km.'],
];
/** [amount, equal amount, a tempting wrong amount, why] for the matching game. */
const CONV_MATCH: [string, string, string, string, 'length' | 'time'][] = [
  ['3 km', '3000 m', '300 m', '1 km = 1000 m, joten 3 · 1000 m = 3000 m.', 'length'],
  ['2 min', '120 s', '200 s', '1 min = 60 s, joten 2 · 60 s = 120 s.', 'time'],
  ['1,5 h', '90 min', '150 min', '1 h = 60 min, joten 1,5 · 60 min = 90 min.', 'time'],
  ['250 cm', '2,5 m', '25 m', '1 m = 100 cm, joten 250 / 100 = 2,5 m.', 'length'],
  ['0,5 km', '500 m', '50 m', '0,5 · 1000 m = 500 m.', 'length'],
];
const REF_SORT: [string, number, string][] = [
  ['Loikka rantaan verrattuna', 0, 'Etäisyys rantaan muuttuu, kun vene kulkee.'],
  ['Vene laituriin verrattuna', 0, 'Vene etääntyy laiturista.'],
  ['Rantapuu veneestä katsoen', 0, 'Veneestä katsoen puu liukuu taaksepäin: etäisyys muuttuu.'],
  ['Laituri Loikasta katsoen', 0, 'Loikka kulkee veneen mukana, joten laituri jää taakse.'],
  ['Loikka veneeseen verrattuna', 1, 'Loikka istuu veneessä: etäisyys veneeseen ei muutu.'],
  ['Masto Loikkaan verrattuna', 1, 'Masto ja Loikka kulkevat samassa veneessä.'],
  ['Rantapuu laituriin verrattuna', 1, 'Molemmat ovat rannassa kiinni.'],
  ['Veneen airo veneeseen verrattuna', 1, 'Airo on veneessä ja kulkee sen mukana.'],
];
const SPEED_WORD: Record<string, [string, string, string]> = { m: ['metriä', 'metri', 'metriä'], km: ['kilometriä', 'kilometri', 'kilometriä'], cm: ['senttimetriä', 'senttimetri', 'senttimetriä'], s: ['sekuntia', 'sekunti', 'sekuntia'], h: ['tuntia', 'tunti', 'tuntia'], min: ['minuuttia', 'minuutti', 'minuuttia'] };
const UNIT_FACTORY: [string, string, string, string][] = [
  ['matka m', 'aika s', 'm/s', 's/m'],
  ['matka km', 'aika h', 'km/h', 'h/km'],
  ['matka cm', 'aika min', 'cm/min', 'min/cm'],
  ['matka km', 'aika min', 'km/min', 'km · min'],
  ['matka m', 'aika min', 'm/min', 'm · min'],
  ['matka cm', 'aika s', 'cm/s', 's/cm'],
];
const MIXED_READY: [string, number, string][] = [
  ['120 m, 8 s', 0, 'Metrit ja sekunnit: jaa heti.'],
  ['45 m, 9 s', 0, 'Metrit ja sekunnit: jaa heti.'],
  ['300 m, 60 s', 0, 'Metrit ja sekunnit: jaa heti.'],
  ['1,2 km, 60 s', 1, 'Matka on kilometreinä: 1,2 km = 1200 m ensin.'],
  ['300 m, 5 min', 1, 'Aika on minuutteina: 5 min = 300 s ensin.'],
  ['2 km, 4 min', 1, 'Molemmat pitää muuntaa: metreiksi ja sekunneiksi.'],
  ['600 m, 2 min', 1, 'Aika on minuutteina: 2 min = 120 s ensin.'],
];
// Labels in this model are not measurement results; colour/shape properties may be measurable.
const NOT_QTY = ['nimi', 'suosikkiväri', 'tunnus'];
const result = (q: Qty, v: number) => `${fmt(v)} ${q.unit}`;

// ---------------------------------------------------------------- speed / graphs
const ST: Axes = { xMax: 10, yMax: 40, xStep: 2, yStep: 10, xLabel: 't (s)', yLabel: 's (m)' };
const VT: Axes = { xMax: 10, yMax: 20, xStep: 2, yStep: 5, xLabel: 't (s)', yLabel: 'v (m/s)' };
const A_B: Option[] = [t('A'), t('B'), t('Yhtä nopeat')];
const A_B_ACC: Option[] = [t('A'), t('B'), t('Yhtä suuri')];

type Shape = 'rest' | 'steady' | 'accel' | 'decel';
const SHAPE_TEXT: Record<Shape, string> = { rest: 'Kappale on paikallaan.', steady: 'Kappale liikkuu tasaisella nopeudella.', accel: 'Kappaleen nopeus kasvaa.', decel: 'Kappaleen nopeus pienenee.' };
const SHAPES: Shape[] = ['rest', 'steady', 'accel', 'decel'];
const VT_WHY: Record<Shape, Record<Shape, string>> = {
  rest: { steady: 'Tasaisessa liikkeessä nopeus on yli 0. Tässä viiva kulkee nollassa.', accel: 'Viiva ei nouse: nopeus ei kasva.', decel: 'Viiva ei laske: nopeus ei pienene.', rest: '' },
  steady: { rest: 'Paikallaan olevan nopeus on 0. Tässä nopeus on 10 m/s.', accel: 'Viiva ei nouse: nopeus pysyy 10 m/s.', decel: 'Viiva ei laske: nopeus pysyy 10 m/s.', steady: '' },
  accel: { rest: 'Nopeus ei ole 0, se kasvaa.', steady: 'Viiva ei ole vaakasuora: nopeus muuttuu.', decel: 'Viiva nousee oikealle mentäessä, joten nopeus kasvaa eikä pienene.', accel: '' },
  decel: { rest: 'Nopeus ei ole 0, se pienenee.', steady: 'Viiva ei ole vaakasuora: nopeus muuttuu.', accel: 'Viiva laskee oikealle mentäessä, joten nopeus pienenee eikä kasva.', decel: '' },
};
const ST_WHY: Record<Shape, Record<Shape, string>> = {
  rest: { steady: 'Tasaisessa liikkeessä matka kasvaa. Tässä viiva on vaakasuora: matka ei kasva.', accel: 'Viiva ei nouse lainkaan: kappale ei liiku.', decel: 'Viiva ei nouse lainkaan: kappale ei liiku.', rest: '' },
  steady: { rest: 'Viiva nousee: matka kasvaa, joten kappale liikkuu.', accel: 'Viiva on suora, ei jyrkkene: joka sekunti sama matka.', decel: 'Viiva on suora, ei loivene: joka sekunti sama matka.', steady: '' },
  accel: { rest: 'Viiva nousee: kappale liikkuu.', steady: 'Viiva ei ole suora vaan jyrkkenee: joka sekunti kuljetaan enemmän.', decel: 'Viiva jyrkkenee oikealle mentäessä, ei loivene: nopeus kasvaa.', accel: '' },
  decel: { rest: 'Viiva nousee: kappale liikkuu.', steady: 'Viiva ei ole suora vaan loivenee: joka sekunti kuljetaan vähemmän.', accel: 'Viiva loivenee oikealle mentäessä, ei jyrkkene: nopeus pienenee.', decel: '' },
};
/** Three-part v–t stories: [kind, v at start, v at end, end time]; each kind at most once. */
const VT_PHASES: [Shape, number, number, number][][] = [
  [['accel', 0, 12, 4], ['steady', 12, 12, 6], ['decel', 12, 0, 10]],
  [['steady', 10, 10, 4], ['accel', 10, 18, 6], ['decel', 18, 4, 10]],
  [['rest', 0, 0, 2], ['accel', 0, 12, 6], ['steady', 12, 12, 10]],
  [['decel', 16, 6, 4], ['steady', 6, 6, 8], ['accel', 6, 14, 10]],
  [['steady', 8, 8, 4], ['decel', 8, 0, 8], ['rest', 0, 0, 10]],
];
const stCurve = (s: Shape) => sample({ rest: () => 20, steady: (x: number) => 3.5 * x, accel: (x: number) => 0.36 * x * x, decel: (x: number) => 7.2 * x - 0.36 * x * x }[s], 10);
const vtCurve = (s: Shape): [number, number][] => ({ rest: [[0, 0], [10, 0]], steady: [[0, 10], [10, 10]], accel: [[0, 2], [10, 18]], decel: [[0, 18], [10, 2]] } as Record<Shape, [number, number][]>)[s];
const stArt = (s: Shape, w = 200) => chart({ ...ST, w, h: 140, ticks: false }, [{ pts: stCurve(s) }]);
const vtArt = (s: Shape, w = 200) => chart({ ...VT, w, h: 140, ticks: false }, [{ pts: vtCurve(s), color: 'var(--red)' }]);

function speedPair(r: Rng, mode: 'sameS' | 'sameT' | 'ratio' | 'equal'): Q {
  let a: [number, number], b: [number, number];
  if (mode === 'sameS') { const s = r.pick([20, 30, 60]); const [x, y] = r.shuffle([4, 5, 6]); a = [s, x!]; b = [s, y!]; }
  else if (mode === 'sameT') { const tt = r.pick([4, 5, 10]); const [x, y] = r.shuffle([20, 25, 30]); a = [x!, tt]; b = [y!, tt]; }
  else if (mode === 'equal') { const v = r.int(2, 5); a = [v * 4, 4]; b = [v * 6, 6]; if (r.chance(0.5)) [a, b] = [b, a]; }
  else { const [v1, v2] = r.shuffle([3, 4, 5]); const t1 = r.pick([6, 8]), t2 = r.pick([4, 10]); a = [v1! * t1, t1]; b = [v2! * t2, t2]; }
  const va = a[0] / a[1], vb = b[0] / b[1];
  const ans = va > vb ? 0 : vb > va ? 1 : 2;
  const rate = `Metrejä sekunnissa: A ${fmt(va)} ja B ${fmt(vb)}.`;
  const slowWhy = (n: 'A' | 'B') => {
    const me = n === 'A' ? a : b;
    if (mode === 'sameS') return `${n} käytti saman ${me[0]} metrin matkaan enemmän aikaa, ${me[1]} s. Se oli hitaampi.`;
    if (mode === 'sameT') return `${n} pääsi samassa ajassa vain ${me[0]} m. Se oli hitaampi.`;
    if (mode === 'equal') return `${rate} Ne ovat yhtä suuret, joten kumpikaan ei ollut nopeampi.`;
    return `Suurempi matka ei yksin ratkaise. ${rate}`;
  };
  const eqWhy = mode === 'sameS' ? 'Matka on sama, mutta ajat eroavat. Vähemmän aikaa käyttänyt on nopeampi.' : mode === 'sameT' ? 'Aika on sama, mutta matkat eroavat. Pidemmälle päässyt on nopeampi.' : `${rate} Ne eivät ole samat.`;
  const why = [0, 1, 2].map((i) => (i === ans ? undefined : i === 2 ? eqWhy : slowWhy(i === 0 ? 'A' : 'B')));
  const hint = mode === 'sameS' ? 'Matka on sama. Kumpi tarvitsi vähemmän aikaa?' : mode === 'sameT' ? 'Aika on sama. Kumpi pääsi pidemmälle?' : 'Laske kummallekin: montako metriä yhdessä sekunnissa?';
  return {
    say: `Sammakko A loikki ${a[0]} m ajassa ${a[1]} s. Sammakko B loikki ${b[0]} m ajassa ${b[1]} s. Kumpi oli nopeampi?`,
    scene: mode === 'sameS' || mode === 'sameT' ? raceScene([{ name: 'A', s: a[0], t: a[1], col: 'var(--pond)' }, { name: 'B', s: b[0], t: b[1], col: '#c98b4e' }]) : undefined,
    task: fixed(A_B, ans, why, 3),
    hint,
    explain: `Nopeus on matka jaettuna ajalla: A ${a[0]} m / ${a[1]} s ${eqv(va)} m/s, B ${b[0]} m / ${b[1]} s ${eqv(vb)} m/s.`,
  };
}

/** Rank three frogs by speed: slots fastest / middle / slowest. */
function speedRank(r: Rng): Q {
  const vs = r.shuffle([2, 3, 4, 5, 6]).slice(0, 3), ts = r.shuffle([3, 4, 5, 6, 8]).slice(0, 3);
  const fr = ['A', 'B', 'C'].map((n, i) => ({ n, v: vs[i]!, t: ts[i]!, s: vs[i]! * ts[i]! }));
  const order = [...fr].sort((x, y) => y.v - x.v), names = ['Nopein 🥇', 'Keskimmäinen 🥈', 'Hitain 🥉'];
  return {
    say: `Kolme sammakkoa loikki: ${fr.map((f) => `${f.n} ${f.s} m ajassa ${f.t} s`).join(', ')}. Järjestä nopeimmasta hitaimpaan.`,
    task: { kind: 'place', slots: names.map((x, i) => ({ id: `s${i}`, text: x })), tokens: fr.map((f) => ({ id: f.n, text: `${f.n}: ${f.s} m, ${f.t} s` })), answer: Object.fromEntries(order.map((f, i) => [`s${i}`, f.n])), why: Object.fromEntries(order.map((f, i) => [`s${i}`, `${f.n}: ${f.s} m / ${f.t} s = ${f.v} m joka sekunti.`])) } as Q['task'],
    hint: 'Pisin matka ei välttämättä ole nopein. Laske jokaiselle metrit sekunnissa.',
    explain: order.map((f) => `${f.n} ${f.v} m/s`).join(' > ') + '.',
  };
}

export const PHYSICS_NODES: NodeSpec[] = [
  // ============================================================ suureet
  {
    id: 'PHY79-QTY-CONCEPT', rev: LAUNCH_REV, validRevs: [LAUNCH_REV, AUDIT_REV], stop: 'Mitattava ominaisuus', icon: '📏',
    goal: 'Opit tunnistamaan suureen: ominaisuuden, jonka voi mitata ja ilmaista luvulla ja yksiköllä.',
    intro: 'Laboratoriossa kaikki alkaa mittaamisesta. Mitä ylipäätään voi mitata?',
    reward: 'Tunnistat suureet!',
    demo: () => [
      { say: 'Sammakko hyppää vaa’alle. Vaaka näyttää 0,4 kg. Massa on suure: sen voi mitata, ja tulos on luku ja yksikkö.', scene: measureScene('massa', 0.4) },
      { say: 'Sammakko loikkii, ja sekuntikello näyttää kolme sekuntia. Aikakin on suure: 3 s.', scene: measureScene('aika', 3) },
      { say: 'Suosikkiväri: vihreä on tässä mallissa nimilappu, ei mittaustulos. Valon ja värin ominaisuuksia voidaan mitata sopivilla välineillä.', scene: notQtyScene() },
    ],
    item: cases({
      pick: (r) => {
        const q = r.pick(QTYS);
        const no = r.shuffle(NOT_QTY).slice(0, 2);
        return { say: 'Mikä näistä on tässä mallissa mitattava suure?', task: choose(r, t(q.name), no.map(t), no.map((x) => `”${x}” on tässä mallissa nimilappu, ei mittaustulos luvulla ja yksiköllä.`)), hint: 'Mikä näistä voidaan mitata mittarilla ja kirjoittaa luvulla ja yksiköllä?', explain: `${q.name[0]!.toUpperCase() + q.name.slice(1)} voidaan mitata, esimerkiksi ${result(q, q.vals[1]!)}.` };
      },
      tool: (r) => {
        const [q, ...rest] = r.shuffle(QTYS);
        const w = rest.slice(0, 2);
        return { say: `Mitä suuretta ${q!.tool} mittaa?`, task: choose(r, t(q!.name), w.map((x) => t(x.name)), w.map((x) => `Suuretta ${x.name} mitataan välineellä ${x.tool}.`)), hint: `Mitä ${q!.tool} näyttää: metrejä, kilogrammoja, sekunteja vai asteita?`, explain: `${q!.tool[0]!.toUpperCase() + q!.tool.slice(1)} mittaa suuretta ${q!.name}.` };
      },
      unitVs: (r) => {
        const q = r.pick(QTYS);
        return { say: `Mikä näistä on suure, ei yksikkö eikä mittaväline?`, task: choose(r, t(q.name), [t(q.unitName), t(q.tool)], [`${q.unitName[0]!.toUpperCase() + q.unitName.slice(1)} on yksikkö, jolla suuretta ${q.name} ilmaistaan.`, `${q.tool[0]!.toUpperCase() + q.tool.slice(1)} on väline, jolla mitataan.`]), hint: 'Suure on se ominaisuus, jota mitataan. Yksikkö ja väline auttavat mittaamaan sitä.', explain: `${q.name}: suure. ${q.unitName}: yksikkö. ${q.tool}: väline.` };
      },
      sort: (r) => {
        const qs = r.shuffle(QTYS).slice(0, 3), no = r.shuffle(NOT_QTY).slice(0, 2);
        const all = r.shuffle([...qs.map((q) => ({ v: q.name, c: 0, why: `${q.name[0]!.toUpperCase() + q.name.slice(1)}: ${q.tool} antaa luvun ja yksikön, esim. ${result(q, q.vals[1]!)}.` })), ...no.map((x) => ({ v: x, c: 1, why: `${x[0]!.toUpperCase() + x.slice(1)} on tässä mallissa nimilappu, ei mittaustulos.` }))]);
        return {
          say: 'Lajittele tämän mallin suureet ja nimilaput.',
          task: { kind: 'sort' as const, items: all.map((x) => t(x.v)), cats: [{ label: 'Suure 📏' }, { label: 'Nimilappu tässä mallissa' }], answer: all.map((x) => x.c), why: all.map((x) => x.why) },
          hint: 'Kysy jokaisesta: millä välineellä sen voisi mitata, ja missä yksikössä?',
          explain: 'Pituus, massa, aika ja lämpötila ovat tämän mallin suureita. Nimi, suosikkiväri ja tunnus ovat tässä nimilappuja. Valon ja värin ominaisuuksia voidaan myös mitata.',
        };
      },
    }, (r) => {
      const q = r.pick(QTYS);
      const v = r.pick(q.vals);
      return { say: `${q.tool[0]!.toUpperCase() + q.tool.slice(1)} näyttää ${result(q, v)}. Mikä suure mitattiin?`, task: choose(r, t(q.name), [t(q.unitName), t(fmt(v))], [`${q.unitName[0]!.toUpperCase() + q.unitName.slice(1)} on yksikkö, ei suure.`, `${fmt(v)} on lukuarvo, ei suure.`]), hint: `Mitä ominaisuutta ${q.tool} mittaa?`, explain: `Mitattiin suuretta ${q.name}; tulos on ${result(q, v)}.` };
    }),
  },
  {
    id: 'PHY79-NUMVALUE', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Lukuarvo', icon: '🔢',
    goal: 'Opit erottamaan mittaustuloksesta lukuarvon: koko luvun, desimaaliosa mukaan lukien.',
    intro: 'Mittaustuloksessa on luku ja yksikkö. Erotetaan luku.',
    reward: 'Löydät lukuarvon mistä tahansa tuloksesta!',
    demo: () => [
      { say: 'Vaaka punnitsee: 2,5 kg. Tuloksen keskellä on lukuarvo 2,5. Se kertoo, kuinka paljon. Yksikkö kg kertoo, mihin verrattiin.', scene: measureScene('massa', 2.5, 'n') },
      { say: 'Merkinnässä s = 12,5 km on neljä osaa: tunnus s, yhtäsuuruusmerkki, lukuarvo 12,5 ja yksikkö km. Onko lukuarvo pelkkä 12? Ei, desimaaliosa kuuluu lukuun.', scene: partsScene([{ text: 's', role: 's' }, { text: '=' }, { text: '12,5', role: 'n' }, { text: 'km', role: 'u' }], { trap: '12', focus: 'n' }) },
    ],
    item: cases({
      plain: (r) => {
        const q = r.pick(QTYS); const v = r.pick(q.vals);
        return { say: `Mittaustulos on ${result(q, v)}. Mikä on lukuarvo?`, task: choose(r, t(fmt(v)), [t(q.unit), t(q.name)], [`${q.unit} on yksikkö: se kertoo, mihin verrattiin.`, `${q.name[0]!.toUpperCase() + q.name.slice(1)} on suure: se kertoo, mitä mitattiin.`]), hint: 'Lukuarvo on tuloksen luku.', explain: `Lukuarvo on ${fmt(v)}.` };
      },
      symbol: (r) => {
        const q = r.pick(QTYS); const v = r.pick(q.vals);
        return { say: `Merkintä ${q.sym} = ${result(q, v)}. Mikä on lukuarvo?`, task: choose(r, t(fmt(v)), [t(q.sym), t(q.unit)], [`${q.sym} on suureen ${q.name} tunnus, ei luku.`, `${q.unit} on yksikkö.`]), hint: 'Yhtäsuuruusmerkin jälkeen tulee ensin luku, sitten yksikkö.', explain: `${q.sym} on suureen tunnus, ${fmt(v)} lukuarvo ja ${q.unit} yksikkö.` };
      },
      type: (r) => {
        const q = r.pick(QTYS); const v = r.pick(q.vals.filter((x) => !Number.isInteger(x)).concat(q.vals.slice(0, 1)));
        const whyAt: Record<number, string> = {};
        if (!Number.isInteger(v)) whyAt[Math.floor(v)] = `Desimaaliosa kuuluu lukuarvoon: koko luku on ${fmt(v)}.`;
        return { ...ask(`Mittauksen tulos on ${q.sym} = ${result(q, v)}. Kirjoita pelkkä lukuarvo.`, v, '', `Lukuarvo on ${fmt(v)}; yksikkö ${q.unit} jää pois.`, undefined, 0.001), task: { kind: 'numeric', answer: v, tolerance: 0.001, whyAt }, hint: 'Kirjoita luku sellaisenaan, desimaaliosa mukaan lukien. Yksikköä ei kirjoiteta.' };
      },
      sort: (r) => {
        const [a, b] = r.shuffle(QTYS); const va = r.pick(a!.vals), vb = r.pick(b!.vals.filter((x) => x !== va));
        const all = r.shuffle([
          { v: fmt(va), c: 0, why: `${fmt(va)} on luku: lukuarvo.` }, { v: fmt(vb), c: 0, why: `${fmt(vb)} on luku: lukuarvo.` },
          { v: a!.unit, c: 1, why: `${a!.unit} on yksikkö.` }, { v: b!.unit, c: 1, why: `${b!.unit} on yksikkö.` }, { v: a!.name, c: 1, why: `${a!.name[0]!.toUpperCase() + a!.name.slice(1)} on suure.` },
        ]);
        return {
          say: `Tulokset: ${a!.name} ${result(a!, va)} ja ${b!.name} ${result(b!, vb)}. Lajittele palat: mitkä ovat lukuarvoja?`,
          task: { kind: 'sort' as const, items: all.map((x) => t(x.v)), cats: [{ label: 'Lukuarvo 🔢' }, { label: 'Muu osa' }], answer: all.map((x) => x.c), why: all.map((x) => x.why) },
          hint: 'Lukuarvo on luku. Yksikkö ja suure ovat sanoja tai merkkejä.',
          explain: `Lukuarvot ovat ${fmt(va)} ja ${fmt(vb)}.`,
        };
      },
    }, (r) => {
      const v = r.pick([0.25, 1.75, 12.5]);
      return { say: `Matka s = ${fmt(v)} km. Mikä on lukuarvo?`, task: choose(r, t(fmt(v)), [t(String(Math.floor(v))), t('km')], [`${Math.floor(v)} on vain kokonaisosa. Desimaaliosa kuuluu lukuarvoon.`, 'km on yksikkö.']), hint: 'Katso koko luku pilkun molemmin puolin.', explain: `Koko luku ${fmt(v)} on lukuarvo.` };
    }),
  },
  {
    id: 'PHY79-UNIT-CONCEPT', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Yksikkö', icon: '📐',
    goal: 'Opit, että yksikkö kertoo, mihin mittausta verrattiin, eikä tulos ole valmis ilman sitä.',
    intro: 'Pelkkä luku ei kerro mittaustulosta. Mitä vielä tarvitaan?',
    reward: 'Yksiköt hallussa!',
    demo: () => [
      { say: 'Ensin piirretään 5 senttimetriä: pikkuruinen pätkä. Sitten 5 metriä, metri kerrallaan. Luku on sama, mutta pituudet ovat aivan eri. Metri on sata senttimetriä.', scene: unitSizeScene(5, 'm', 'cm', 100, 'Pätkä') },
      { say: 'Merkinnässä t = 40 s yksikkö on s, sekunti. Se kertoo, että aikaa verrattiin sekuntiin. Ilman sitä 40 voisi olla minuutteja tai tunteja.', scene: partsScene([{ text: 't', role: 's' }, { text: '=' }, { text: '40', role: 'n' }, { text: 's', role: 'u' }], { focus: 'u' }) },
    ],
    item: cases({
      pick: (r) => {
        const q = r.pick(QTYS); const v = r.pick(q.vals);
        return { say: `Mikä on yksikkö tuloksessa ${result(q, v)}?`, task: choose(r, t(q.unit), [t(fmt(v)), t(q.name)], [`${fmt(v)} on lukuarvo: kuinka paljon.`, `${q.name[0]!.toUpperCase() + q.name.slice(1)} on suure: mitä mitattiin.`]), hint: 'Yksikkö tulee luvun perään.', explain: `Yksikkö on ${q.unit} (${q.unitName}).` };
      },
      fit: (r) => {
        const [q, ...rest] = r.shuffle(QTYS);
        const w = rest.slice(0, 2);
        return { say: `Millä yksiköllä ilmaistaan suure ${q!.name}?`, task: choose(r, t(q!.unit), w.map((x) => t(x.unit)), w.map((x) => `${x.unit} on suureen ${x.name} yksikkö.`)), hint: `Mitä ${q!.tool} näyttää?`, explain: `${q!.name}: ${q!.unit}.` };
      },
      fill: (r) => {
        const rows = r.shuffle(UNIT_FILL).slice(0, 3);
        const decoy = r.pick(UNIT_FILL.filter((x) => !rows.some((y) => y[2] === x[2])))!;
        return {
          say: 'Tuloksista puuttuvat yksiköt. Vedä jokaiseen järkevä yksikkö.',
          task: { kind: 'place', slots: rows.map((x, i) => ({ id: `s${i}`, text: `${x[0]}: ${x[1]} ▢` })), tokens: r.shuffle([...rows.map((x, i) => ({ id: `u${i}`, text: x[2] })), { id: 'x', text: decoy[2] }]), answer: Object.fromEntries(rows.map((_, i) => [`s${i}`, `u${i}`])), why: Object.fromEntries(rows.map((x, i) => [`s${i}`, x[3]])) } as Q['task'],
          hint: 'Mieti ensin suure: pituus, massa, aika vai lämpötila? Sitten järkevä koko.',
          explain: rows.map((x) => `${x[0]} ${x[1]} ${x[2]}`).join(', ') + '.',
        };
      },
    }, (r) => {
      const v = r.pick([120, 45, 8]);
      return { say: `Lassi kirjoitti: "Pöydän pituus on ${v}." Mitä tuloksesta puuttuu?`, task: choose(r, t('yksikkö'), [t('lukuarvo'), t('suure')], [`Lukuarvo ${v} on mukana.`, 'Suure (pituus) on mukana.']), hint: `Onko pöytä ${v} senttiä vai ${v} metriä? Mikä sen kertoisi?`, explain: `Ilman yksikköä ei tiedä, onko pöytä ${v} cm vai ${v} m.` };
    }),
  },
  {
    id: 'PHY79-QTY-01', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Suure, luku, yksikkö', icon: '🧩',
    goal: 'Opit purkamaan mittaustuloksen osiin ja kirjoittamaan sen kokonaisena: suure, lukuarvo ja yksikkö.',
    intro: 'Pura mittaustulos osiin: suure, lukuarvo ja yksikkö.',
    reward: 'Puret jokaisen mittaustuloksen!',
    demo: () => [
      { say: 'Lämpömittari laitetaan veteen, ja punainen pylväs nousee 18 asteeseen. Tulos kootaan: suure lämpötila, lukuarvo 18, yksikkö °C.', scene: measureScene('lämpötila', 18) },
      { say: 'Nopeus kirjoitetaan usein tunnuksella: v = 6 m/s. Suure on nopeus, tunnus v, lukuarvo 6 ja yksikkö m/s. Yksikössäkin voi olla kaksi osaa.', scene: partsScene([{ text: 'nopeus', role: 'q' }, { text: 'v', role: 's' }, { text: '=' }, { text: '6', role: 'n' }, { text: 'm/s', role: 'u' }]) },
    ],
    item: cases({
      sort: (r) => {
        const [q, other] = r.shuffle(QTYS); const v = r.pick(q!.vals);
        return {
          say: `Mittaus: ${q!.name} on ${result(q!, v)}. Laita osat oikeille paikoille.`,
          task: { kind: 'place', slots: [{ id: 'q', text: 'Suure' }, { id: 'n', text: 'Lukuarvo' }, { id: 'u', text: 'Yksikkö' }], tokens: r.shuffle([{ id: 'name', text: q!.name }, { id: 'val', text: fmt(v) }, { id: 'unit', text: q!.unit }, { id: 'x', text: other!.unit }]), answer: { q: 'name', n: 'val', u: 'unit' }, why: { q: `Suure on se, mitä mitattiin: ${q!.name}.`, n: `Lukuarvo on luku ${fmt(v)}.`, u: `${q!.name[0]!.toUpperCase() + q!.name.slice(1)} ilmaistaan yksikössä ${q!.unit}, ei ${other!.unit}.` } },
          hint: 'Sana on suure, luku on lukuarvo ja lyhenne luvun perässä on yksikkö.',
          explain: `Suure ${q!.name}, lukuarvo ${fmt(v)}, yksikkö ${q!.unit}.`,
        };
      },
      whole: (r) => {
        const [q, other] = r.shuffle(QTYS); const v = r.pick(q!.vals);
        return {
          say: `Mikä tulos on kirjoitettu kokonaan ja oikein?`,
          task: choose(r, t(`${q!.name} ${result(q!, v)}`), [t(`${q!.name} ${fmt(v)}`), t(`${q!.name} ${q!.unit}`), t(`${q!.name} ${fmt(v)} ${other!.unit}`)], ['Yksikkö puuttuu: luku yksin ei kerro, mihin verrattiin.', 'Lukuarvo puuttuu: ei tiedä, kuinka paljon.', `Väärä yksikkö: ${other!.unit} on suureen ${other!.name} yksikkö.`]),
          hint: 'Kokonaisessa tuloksessa on suure, lukuarvo ja oikea yksikkö.',
          explain: `${q!.name[0]!.toUpperCase() + q!.name.slice(1)} ${result(q!, v)}: kaikki kolme osaa ovat mukana.`,
        };
      },
      which: (r) => {
        const q = r.pick(QTYS); const v = r.pick(q.vals);
        const part = r.pick(['suure', 'lukuarvo', 'yksikkö'] as const);
        const opts = { suure: q.name, lukuarvo: fmt(v), yksikkö: q.unit };
        const others = (Object.keys(opts) as (keyof typeof opts)[]).filter((k) => k !== part);
        const role: Record<string, string> = { suure: 'mitä mitattiin', lukuarvo: 'kuinka paljon', yksikkö: 'mihin verrattiin' };
        return { say: `Tulos: ${q.name} ${result(q, v)}. Mikä on ${part}?`, task: choose(r, t(opts[part]), others.map((k) => t(opts[k])), others.map((k) => `${opts[k]} on ${k}: se kertoo, ${role[k]}.`)), hint: `${part[0]!.toUpperCase() + part.slice(1)} kertoo, ${role[part]}.`, explain: `${part[0]!.toUpperCase() + part.slice(1)} on ${opts[part]}.` };
      },
    }, (r) => {
      const v = r.int(2, 9);
      return {
        say: `Merkintä v = ${v} m/s tarkoittaa nopeutta. Laita osat paikoilleen.`,
        task: { kind: 'place', slots: [{ id: 'q', text: 'Suure' }, { id: 'n', text: 'Lukuarvo' }, { id: 'u', text: 'Yksikkö' }], tokens: r.shuffle([{ id: 'name', text: 'nopeus (v)' }, { id: 'val', text: String(v) }, { id: 'unit', text: 'm/s' }, { id: 'x', text: 'm' }]), answer: { q: 'name', n: 'val', u: 'unit' }, why: { q: 'Suure on nopeus, tunnuksena v.', n: `Lukuarvo on ${v}.`, u: 'Nopeuden yksikkö on m/s, ei pelkkä metri.' } },
        hint: 'Nopeuden yksikössä on sekä matkan että ajan yksikkö.',
        explain: `Suure nopeus (tunnus v), lukuarvo ${v}, yksikkö m/s.`,
      };
    }),
  },
  {
    id: 'PHY79-UNIT-CONV', rev: LAUNCH_REV, validRevs: [LAUNCH_REV, AUDIT_REV], stop: 'Yksikkömuunnos', icon: '🔁',
    goal: 'Opit muuntamaan yksiköitä annetulla kertoimella: isosta pieneen kerrotaan, pienestä isoon jaetaan.',
    intro: 'Ennen laskua kaikki yksiköt pitää saada samoiksi. Muunnoskerroin on aina annettu.',
    reward: 'Muunnat yksiköt varmasti!',
    demo: () => [
      { say: 'Kolme kilometriä metreiksi. Yksi kilometri on tuhat metriä: tuhat, kaksituhatta, kolmetuhatta. Isosta yksiköstä pieneen kerrotaan.', scene: convScene(3000, 1000, 'km', 'm', 'mul') },
      { say: '250 senttimetriä metreiksi. Sata senttiä niputetaan yhdeksi metriksi: yksi, kaksi, ja jäljelle jää 50 senttiä eli puoli metriä. Pienestä isoon jaetaan: 2,5 m.', scene: convScene(250, 100, 'm', 'cm', 'div') },
      { say: 'Kolme minuuttia sekunneiksi. Minuutissa on 60 sekuntia, ei sataa. 3 · 60 s = 180 s.', scene: convScene(180, 60, 'min', 's', 'mul') },
    ],
    item: cases({
      kmM: (r) => { const k = r.pick([2, 3, 4.5, 1.2, 0.8]); return wq(ask(`1 km = 1000 m. Muunna ${fmt(k)} km metreiksi.`, k * 1000, 'm', `${fmt(k)} · 1000 m = ${fmt(k * 1000)} m.`, undefined, 0.001), 'Kilometri on iso yksikkö, metri pieni. Metrejä tulee paljon: kerro.', { [k / 1000]: 'Jaoit, mutta isosta pieneen kerrotaan: metrejä tulee enemmän.', [k * 100]: 'Kilometrissä on 1000 metriä, ei 100.' }); },
      minS: (r) => { const m = r.int(2, 6); return wq(ask(`1 min = 60 s. Muunna ${m} min sekunneiksi.`, m * 60, 's', `${m} · 60 s = ${m * 60} s.`), 'Jokaisessa minuutissa on 60 sekuntia.', { [m * 100]: 'Minuutissa on 60 sekuntia, ei 100.', [m + 60]: 'Laskit yhteen. Jokaisessa minuutissa on 60 s: kerro.' }); },
      hMin: (r) => { const h = r.pick([2, 1.5, 3, 0.5]); return wq(ask(`1 h = 60 min. Muunna ${fmt(h)} h minuuteiksi.`, h * 60, 'min', `${fmt(h)} · 60 min = ${h * 60} min.`), 'Tunti on 60 minuuttia. Kerro tuntien määrä 60:llä.', { [h * 100]: 'Tunnissa on 60 minuuttia, ei 100.', [Math.floor(h) * 60]: 'Desimaaliosa puuttuu: puoli tuntia on 30 min.' }); },
      cmM: (r) => { const c = r.pick([250, 120, 75, 340]); return wq(ask(`1 m = 100 cm. Muunna ${c} cm metreiksi.`, c / 100, 'm', `${c} / 100 m = ${fmt(c / 100)} m.`, undefined, 0.001), 'Senttimetri on pieni yksikkö, metri iso. Metrejä tulee vähemmän: jaa.', { [c * 100]: 'Kerroit, mutta pienestä isoon jaetaan: metrejä tulee vähemmän.', [c / 10]: 'Metrissä on 100 cm, joten jaa 100:lla, ei 10:llä.', [c / 1000]: 'Metrissä on 100 cm, ei 1000.' }); },
      match: (r) => {
        const rows = r.shuffle(CONV_MATCH).slice(0, 3);
        const decoy = r.pick(rows)[2];
        return withItemReadiness('PHY79-UNIT-CONV', {
          say: 'Yhdistä jokaiseen määrään sama määrä toisessa yksikössä.',
          task: { kind: 'place', slots: rows.map((x, i) => ({ id: `s${i}`, text: `${x[0]} =` })), tokens: r.shuffle([...rows.map((x, i) => ({ id: `v${i}`, text: x[1] })), { id: 'x', text: decoy }]), answer: Object.fromEntries(rows.map((_, i) => [`s${i}`, `v${i}`])), why: Object.fromEntries(rows.map((x, i) => [`s${i}`, x[3]])) } as Q['task'],
          hint: 'Isosta pieneen kerrotaan, pienestä isoon jaetaan. Tarkista kerroin: 1000, 100 vai 60?',
          explain: rows.map((x) => `${x[0]} = ${x[1]}`).join(', ') + '.',
        }, { kind: 'conversions', quantities: [...new Set(rows.map(row => row[4]))] });
      },
    }, (r) => {
      const k = r.pick([1.5, 1.2, 0.9]); const m = r.pick([1200, 1400, 1000].filter((x) => x !== k * 1000));
      const kBig = k * 1000 > m;
      return { say: `1 km = 1000 m. Kumpi matka on pidempi: ${fmt(k)} km vai ${m} m?`, task: fixed([t(`${fmt(k)} km`), t(`${m} m`), t('Yhtä pitkät')], kBig ? 0 : 1, [kBig ? undefined : `${fmt(k)} km = ${k * 1000} m, ja se on alle ${m} m.`, kBig ? `${m} m on alle ${fmt(k)} km = ${k * 1000} m.` : undefined, `${fmt(k)} km = ${k * 1000} m, ei ${m} m.`], 3), hint: `Muunna ensin ${fmt(k)} km metreiksi, sitten vertaa.`, explain: `${fmt(k)} km = ${k * 1000} m, joten ${kBig ? `${fmt(k)} km` : `${m} m`} on pidempi.` };
    }),
  },
  // ============================================================ liike ja nopeus
  {
    id: 'PHY79-MOTION-REF', rev: LAUNCH_REV, validRevs: [LAUNCH_REV, AUDIT_REV], stop: 'Mistä katsoen?', icon: '🚤',
    goal: 'Opit päättelemään, liikkuuko kappale, katsomalla muuttuuko sen paikka valittuun vertailukohtaan nähden.',
    intro: 'Liikkuuko kappale? Vastaus riippuu siitä, mihin sitä verrataan.',
    reward: 'Valitset aina vertailukohdan!',
    demo: () => [
      { say: 'Loikka istuu veneessä. Katso ensin rannalta: Loikan matka puuhun kasvaa, joten Loikka liikkuu. Sitten kuvataan veneestä: Loikka pysyy paikallaan ja ranta liukuu taaksepäin. Matka mastoon ei muutu koko aikana.', scene: refScene() },
      { say: 'Kaksi venettä ajaa rinnakkain yhtä nopeasti. Rannalta katsoen molemmat liikkuvat. Veneestä A katsoen vene B on paikallaan, koska veneiden väli pysyy viidessä metrissä.', scene: refScene(true) },
    ],
    item: cases({
      boat: (r) => {
        const ref = r.pick(['vene', 'ranta'] as const);
        return { say: `Loikka istuu veneessä, joka kulkee järvellä. Liikkuuko Loikka ${ref === 'vene' ? 'veneeseen' : 'rantaan'} verrattuna?`, task: fixed([t('Liikkuu'), t('On paikallaan')], ref === 'vene' ? 1 : 0, ref === 'vene' ? ['Loikan etäisyys veneen mastoon ja penkkiin ei muutu. Vene kulkee Loikan mukana.', undefined] : [undefined, 'Etäisyys rannan puuhun kasvaa koko ajan, joten rantaan verrattuna Loikka liikkuu.']), hint: `Kuvittele kuvaaja ${ref === 'vene' ? 'veneeseen' : 'rannalle'}. Muuttuuko etäisyys Loikkaan?`, explain: ref === 'vene' ? 'Etäisyys veneen osiin ei muutu: veneeseen verrattuna Loikka on paikallaan.' : 'Etäisyys rantaan muuttuu: rantaan verrattuna Loikka liikkuu.' };
      },
      train: (r) => {
        const ref = r.pick(['seat', 'station'] as const);
        return { say: `Matkustaja istuu junassa, joka ajaa asemalta. Liikkuuko matkustaja ${ref === 'seat' ? 'junan penkkiin' : 'asemaan'} verrattuna?`, task: fixed([t('Liikkuu'), t('On paikallaan')], ref === 'seat' ? 1 : 0, ref === 'seat' ? ['Penkki kulkee junan mukana, joten etäisyys penkkiin ei muutu.', undefined] : [undefined, 'Juna vie matkustajaa pois asemalta: etäisyys asemaan kasvaa.']), hint: 'Muuttuuko etäisyys matkustajasta vertailukohtaan?', explain: ref === 'seat' ? 'Penkki liikkuu matkustajan mukana.' : 'Etäisyys asemaan kasvaa.' };
      },
      walk: (r) => {
        const ref = r.pick(['deck', 'shore'] as const);
        return { say: `Laivan kannella kävelijä kulkee keulaa kohti. Laiva on laiturissa kiinni. Liikkuuko kävelijä ${ref === 'deck' ? 'kanteen' : 'rantaan'} verrattuna?`, task: fixed([t('Liikkuu'), t('On paikallaan')], 0, [undefined, ref === 'deck' ? 'Kävelijä astelee kannella: etäisyys keulaan pienenee, joten kanteen verrattuna hän liikkuu.' : 'Laiva ei liiku, mutta kävelijä liikkuu laivalla. Siksi etäisyys rantaankin muuttuu.']), hint: 'Laiva on paikallaan, mutta kävelijä ei seiso paikallaan.', explain: 'Laiva on paikallaan rantaan nähden, joten kävelijä liikkuu sekä kanteen että rantaan verrattuna.' };
      },
      sort: (r) => {
        const rows = [...r.shuffle(REF_SORT.filter((x) => x[1] === 0)).slice(0, 2), ...r.shuffle(REF_SORT.filter((x) => x[1] === 1)).slice(0, 2)];
        const all = r.shuffle(rows);
        return {
          say: 'Loikan vene kulkee järvellä. Lajittele: liikkuuko kohde valittuun vertailukohtaan nähden?',
          task: { kind: 'sort' as const, items: all.map((x) => t(x[0])), cats: [{ label: 'Liikkuu ➡️' }, { label: 'Paikallaan ⏸️' }], answer: all.map((x) => x[1]), why: all.map((x) => x[2]) },
          hint: 'Katso jokaisesta parista: muuttuuko niiden välinen etäisyys?',
          explain: 'Sama kohde voi liikkua yhteen kohteeseen nähden ja olla paikallaan toiseen nähden.',
        };
      },
    }, (r) => ({
      say: 'Kaksi venettä kulkee rinnakkain yhtä nopeasti samaan suuntaan. Miltä toinen vene näyttää ensimmäisestä katsoen?',
      task: choose(r, t('Se on paikallaan.'), [t('Se liikkuu eteenpäin.'), t('Se liikkuu taaksepäin.')], ['Rantaan verrattuna liikkuu, mutta ei toiseen veneeseen verrattuna.', 'Etäisyys veneiden välillä ei muutu, joten se ei jää jälkeen.']),
      hint: 'Ajattele kuvaajaa ensimmäisessä veneessä. Muuttuuko etäisyys toiseen veneeseen?',
      explain: 'Veneiden välinen etäisyys ei muutu, joten toisesta veneestä katsoen toinen on paikallaan.',
    })),
  },
  {
    id: 'PHY79-DIST-TIME', rev: LAUNCH_REV, validRevs: [LAUNCH_REV, AUDIT_REV], stop: 'Matka ja aika', icon: '⏱️',
    goal: 'Opit erottamaan matkan (kuinka pitkälle, m tai km) ja ajan (kuinka kauan, s, min tai h) sekä niiden mittavälineet.',
    intro: 'Loikkakisassa mitataan kaksi asiaa: kuinka pitkälle ja kuinka kauan.',
    reward: 'Erotat matkan ja ajan!',
    demo: () => [
      { say: 'Loikka loikkii radan. Mittanauha kulkee mukana ja näyttää matkan: 12 metriä. Sekuntikello käy samaan aikaan ja pysähtyy maalissa: 4 sekuntia. Matka s kertoo, kuinka pitkälle. Aika t kertoo, kuinka kauan.', scene: raceScene([{ name: 'Loikka', s: 12, t: 4, col: 'var(--pond)' }]) },
      { say: 'Nyt Loikka ja Aava. Loikka kulkee 12 metriä 4 sekunnissa, Aava 8 metriä 6 sekunnissa. Aava loikki kauemmin, mutta lyhyemmän matkan. Pidempi aika ei tarkoita pidempää matkaa.', scene: raceScene([{ name: 'Loikka', s: 12, t: 4, col: 'var(--pond)' }, { name: 'Aava', s: 8, t: 6, col: '#c98b4e' }]) },
    ],
    item: cases({
      dist: (r) => multiPick(r, 'dist'),
      time: (r) => multiPick(r, 'time'),
      tool: (r) => {
        const which = r.pick(['matkan', 'ajan'] as const);
        return { say: `Millä välineellä mittaat loikkakisassa ${which}?`, task: choose(r, t(which === 'matkan' ? 'mittanauha' : 'sekuntikello'), [t(which === 'matkan' ? 'sekuntikello' : 'mittanauha'), t('vaaka')], [which === 'matkan' ? 'Sekuntikello mittaa aikaa, ei matkaa.' : 'Mittanauha mittaa matkaa, ei aikaa.', 'Vaaka mittaa massaa.']), hint: which === 'matkan' ? 'Matka on pituus: kuinka pitkälle.' : 'Aika kertoo, kuinka kauan.', explain: which === 'matkan' ? 'Matka mitataan mittanauhalla.' : 'Aika mitataan sekuntikellolla.' };
      },
      read: (r) => {
        const sv = r.int(4, 8), tv = r.pick([2, 3, 5, 6, 7, 9].filter((x) => x !== sv)), want = r.pick(['s', 't'] as const);
        const race = raceScene([{ name: 'Loikka', s: sv, t: tv, col: 'var(--pond)' }], want);
        const scene = anim({ ...race[ANIM]!, label: 'Loikan kisa: mittanauha ja sekuntikello' });
        return want === 's'
          ? wq({ ...ask('Katso kisa. Kuinka pitkän matkan sammakko loikki?', sv, 'm', `Mittanauha näyttää ${sv} m. Sekuntikellon lukema ${tv} s on aika.`), scene }, 'Matka luetaan mittanauhasta lipun kohdalta.', { [tv]: `${tv} on sekuntikellon lukema eli aika. Matka luetaan nauhasta.` })
          : wq({ ...ask('Katso kisa. Kuinka kauan loikkiminen kesti?', tv, 's', `Sekuntikello pysähtyi lukemaan ${tv} s. Matka oli ${sv} m.`), scene }, 'Seuraa sekuntikelloa: se pysähtyy, kun sammakko on maalissa. Voit katsoa kisan uudelleen.', { [sv]: `${sv} on mittanauhan lukema eli matka. Aika luetaan sekuntikellosta.` });
      },
    }, (r) => {
      const s = r.int(2, 9), tt = r.int(2, 9);
      return { say: `"Sammakko hyppäsi ${s} m ja siihen kului ${tt} s." Mikä on hypyn aika?`, task: choose(r, t(`${tt} s`), [t(`${s} m`), t(`${s + tt}`)], ['Tämä on matka: yksikkö m kertoo pituudesta.', 'Matkaa ja aikaa ei lasketa yhteen: ne ovat eri suureita.']), hint: 'Ajan yksikkö on s, min tai h.', explain: `Aika on ${tt} s; matka on ${s} m.` };
    }),
  },
  {
    id: 'PHY79-SPEED-CONCEPT', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Kumpi nopeampi?', icon: '🐸',
    goal: 'Opit vertaamaan nopeuksia: sama matka lyhyemmässä ajassa tai pidempi matka samassa ajassa on nopeampi, ja yleisesti nopeus on metrejä sekunnissa.',
    intro: 'Kisan voittaa nopein. Mutta miten nopeus määritetään?',
    reward: 'Ymmärrät, mitä nopeus tarkoittaa!',
    demo: () => [
      { say: 'Sama 20 metrin matka. A on maalissa 4 sekunnissa, B vasta 5 sekunnissa. Kun matka on sama, nopeampi on se, joka käyttää vähemmän aikaa.', scene: raceScene([{ name: 'A', s: 20, t: 4, col: 'var(--pond)' }, { name: 'B', s: 20, t: 5, col: '#c98b4e' }]) },
      { say: 'Sama aika, 5 sekuntia. A pääsee 15 metriä, B 25 metriä. Kun aika on sama, nopeampi on se, joka pääsee pidemmälle.', scene: raceScene([{ name: 'A', s: 15, t: 5, col: 'var(--pond)' }, { name: 'B', s: 25, t: 5, col: '#c98b4e' }]) },
      { say: 'Jos matkat ja ajat ovat eri, katsotaan, kuinka monta metriä kuljetaan joka sekunti. 20 metriä 4 sekunnissa on 5 metriä joka sekunti: nopeus on 5 m/s.', scene: perSecondScene(20, 4) },
    ],
    item: cases({ sameS: (r) => speedPair(r, 'sameS'), sameT: (r) => speedPair(r, 'sameT'), equal: (r) => speedPair(r, 'equal'), rank: (r) => speedRank(r) }, (r) => speedPair(r, 'ratio')),
  },
  {
    id: 'PHY79-SPEED-CALC', rev: LAUNCH_REV, validRevs: [LAUNCH_REV, AUDIT_REV], stop: 'Laske nopeus', icon: '🧮',
    goal: 'Opit laskemaan keskinopeuden kaavalla v = s / t: koko matka jaetaan koko ajalla, tauot mukaan lukien.',
    intro: 'Lasketaan, montako metriä sammakko etenee sekunnissa.',
    reward: 'Lasket keskinopeuden!',
    demo: () => [
      { say: 'Sammakko etenee 12 metriä 4 sekunnissa. Joka sekunti tulee 3 metrin pala. v = s / t = 12 m / 4 s = 3 m/s.', scene: perSecondScene(12, 4) },
      { say: 'Keskinopeus: Loikka loikkii 12 metriä 3 sekunnissa ja lepää sitten 3 sekuntia. Haamusammakko kulkee koko ajan samaa vauhtia ja on maalissa yhtä aikaa. Keskinopeus on koko matka jaettuna koko ajalla: 12 m / 6 s = 2 m/s.', scene: avgScene([[12, 3], [0, 3]], 'm', 's', 1) },
    ],
    item: cases({
      ms: (r) => { const v = r.int(2, 9), tt = r.int(2, 8); return wq(ask(`Sammakko eteni ${v * tt} m ajassa ${tt} s. Laske keskinopeus.`, v, 'm/s', `v = ${v * tt} m / ${tt} s = ${v} m/s.`), 'v = s / t: jaa matka ajalla.', { [v * tt * tt]: `Kerroit matkan ja ajan. Nopeus on matka jaettuna ajalla: ${v * tt} / ${tt}.`, [v * tt + tt]: 'Laskit matkan ja ajan yhteen. Nopeus saadaan jakamalla.', [v * tt - tt]: 'Vähensit ajan matkasta. Nopeus saadaan jakamalla.', [tt / (v * tt)]: 'Jaoit ajan matkalla. Matka jaetaan ajalla: s / t.' }); },
      kmh: (r) => { const v = r.pick([40, 50, 60, 80]), tt = r.pick([2, 3]); return wq(ask(`Vene kulki ${v * tt} km ajassa ${tt} h. Laske keskinopeus.`, v, 'km/h', `v = ${v * tt} km / ${tt} h = ${v} km/h.`), 'Montako kilometriä tunnissa? Jaa matka tuntien määrällä.', { [v * tt * tt]: `Kerroit. Nopeus on matka jaettuna ajalla: ${v * tt} / ${tt}.`, [v * tt]: `${v * tt} km on koko matka. Kysytään, montako kilometriä yhdessä tunnissa.` }); },
      slot: (r) => {
        const v = r.int(2, 9), tt = r.pick([3, 4, 5, 6].filter((x) => x !== v)), s = v * tt;
        return {
          say: `Loikka eteni ${s} m ajassa ${tt} s. Sijoita luvut kaavaan v = s / t.`,
          task: { kind: 'place', slots: [{ id: 's', text: 'matka s (jaettava)' }, { id: 't', text: 'aika t (jakaja)' }, { id: 'v', text: 'nopeus v (tulos)' }], tokens: r.shuffle([{ id: 'S', text: `${s} m` }, { id: 'T', text: `${tt} s` }, { id: 'V', text: `${v} m/s` }, { id: 'X', text: `${s * tt} m/s` }]), answer: { s: 'S', t: 'T', v: 'V' }, why: { s: `Matka on ${s} m: se jaetaan.`, t: `Aika on ${tt} s: sillä jaetaan.`, v: `${s} / ${tt} = ${v}, yksikkö m/s.` } } as Q['task'],
          hint: 'Matkan yksikkö on m, ajan s ja nopeuden m/s.',
          explain: `v = ${s} m / ${tt} s = ${v} m/s.`,
        };
      },
    }, (r) => {
      const s = r.pick([6, 8, 10]), t1 = 0.5, stop = 0.5;
      const trip = avgScene([[s, 0.5], [0, 0.5]], 'km', 'h', 6, '🐸', false);
      const scene = anim({ ...trip[ANIM]!, label: 'Pyörämatka ja tauko: matka ja koko aika' });
      return wq({ ...ask(`Pyöräilijä ajoi ${s} km ajassa 0,5 h ja piti sitten 0,5 h tauon. Mikä oli keskinopeus koko ajalta?`, s / (t1 + stop), 'km/h', `Keskinopeus = koko matka / koko aika = ${s} km / 1 h = ${s} km/h. Myös tauko kuuluu aikaan.`), scene }, 'Laske ensin koko aika: ajo ja tauko yhteensä.', { [s / t1]: `${s * 2} km/h oli vauhti ajon aikana. Keskinopeuteen lasketaan myös tauko: koko aika on 1 h.`, [s / 2]: 'Jaoit kahdella. Koko aika on 0,5 h + 0,5 h = 1 h, joten jaa yhdellä.' });
    }),
  },
  {
    id: 'PHY79-SPEED-UNIT', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Nopeuden yksikkö', icon: '📎',
    goal: 'Opit muodostamaan nopeuden yksikön: matkan yksikkö jaettuna ajan yksiköllä, esim. m/s, km/h tai cm/min.',
    intro: 'Nopeuden yksikkö syntyy matkan ja ajan yksiköistä.',
    reward: 'Johdat nopeuden yksikön!',
    demo: () => [
      { say: 'Nopeus on matka jaettuna ajalla. 12 metriä jaettuna 4 sekunnilla: luvuista tulee 12 / 4 = 3, yksiköistä metri per sekunti. Vastaus on 3 m/s, eli 3 metriä joka sekunti.', scene: unitBuildScene(12, 'm', 4, 's') },
      { say: 'Sama sääntö toimii kaikilla yksiköillä. 120 kilometriä 2 tunnissa: 120 / 2 = 60 ja km per h. Nopeus on 60 km/h.', scene: unitBuildScene(120, 'km', 2, 'h') },
      { say: 'Etana ryömii 30 senttimetriä 5 minuutissa. 30 / 5 = 6 ja cm per min: 6 cm/min.', scene: unitBuildScene(30, 'cm', 5, 'min') },
    ],
    item: cases({
      ms: (r) => ({ say: 'Matka mitattiin metreinä ja aika sekunteina. Mikä on nopeuden yksikkö?', task: choose(r, t('m/s'), [t('m · s'), t('s/m')], ['Matkaa ja aikaa ei kerrota, vaan jaetaan.', 'Väärin päin: matka on jaettavana, aika jakajana.']), hint: 'v = s / t: matkan yksikkö ylös, ajan yksikkö alas.', explain: 'v = s / t, joten yksikkö on m/s.' }),
      kmh: (r) => ({ say: 'Matka mitattiin kilometreinä ja aika tunteina. Mikä on nopeuden yksikkö?', task: choose(r, t('km/h'), [t('h/km'), t('km')], ['Väärin päin: matka on jaettavana, aika jakajana.', 'Pelkkä km on matkan yksikkö. Nopeuteen tarvitaan myös aika.']), hint: 'Nopeuden yksikössä on sekä matka että aika.', explain: 'v = s / t, joten yksikkö on km/h.' }),
      meaning: (r) => {
        const v = r.int(2, 9), [su, tu] = r.pick([['m', 's'], ['km', 'h'], ['cm', 'min']] as const), w = SPEED_WORD[su]!, wt = SPEED_WORD[tu]!;
        return { say: `Mitä tarkoittaa nopeus ${v} ${su}/${tu}?`, task: choose(r, t(`${v} ${w[0]} joka ${wt[1]}`), [t(`${v} ${wt[2]} joka ${w[1]}`), t(`${v} ${w[0]} ja ${v} ${wt[2]}`)], ['Väärin päin: kauttaviivan yläpuolella on matka, alapuolella aika.', 'Luku kertoo matkan yhtä aikayksikköä kohti, ei kahta erillistä määrää.']), hint: 'Kauttaviiva luetaan "joka" tai "per".', explain: `${v} ${su}/${tu}: joka ${wt[1]} kuljetaan ${v} ${su}.` };
      },
      factory: (r) => {
        const rows = r.shuffle(UNIT_FACTORY).slice(0, 3), decoy = r.pick(rows.map((x) => x[3]));
        return {
          say: 'Yksikkötehdas: mikä nopeuden yksikkö syntyy näistä mittauksista?',
          task: { kind: 'place', slots: rows.map((x, i) => ({ id: `s${i}`, text: `${x[0]}, ${x[1]}` })), tokens: r.shuffle([...rows.map((x, i) => ({ id: `v${i}`, text: x[2] })), { id: 'x', text: decoy }]), answer: Object.fromEntries(rows.map((_, i) => [`s${i}`, `v${i}`])), why: Object.fromEntries(rows.map((x, i) => [`s${i}`, `Matkan yksikkö jaettuna ajan yksiköllä: ${x[2]}.`])) } as Q['task'],
          hint: 'Matkan yksikkö ensin, sitten kauttaviiva, sitten ajan yksikkö.',
          explain: rows.map((x) => x[2]).join(', ') + '.',
        };
      },
    }, (r) => ({ say: 'Etanan matka mitattiin senttimetreinä ja aika minuutteina. Mikä on nopeuden yksikkö?', task: choose(r, t('cm/min'), [t('m/s'), t('min/cm')], ['Tässä ei käytetty metrejä eikä sekunteja.', 'Väärin päin: matka on jaettavana, aika jakajana.']), hint: 'Käytä niitä yksiköitä, joilla mitattiin.', explain: 'Yksikkö on matkan yksikkö jaettuna ajan yksiköllä: cm/min.' })),
  },
  {
    id: 'PHY79-SPEED-REARR', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Matka tai aika', icon: '↔️',
    goal: 'Opit laskemaan matkan (s = v · t) tai ajan (t = s / v), kun nopeus tunnetaan.',
    intro: 'Kun nopeus tiedetään, voidaan laskea matka tai aika.',
    reward: 'Käännät nopeuden kaavan!',
    demo: () => [
      { say: 'Loikka etenee 3 metriä joka sekunti. Kuinka pitkälle se pääsee 5 sekunnissa? Joka sekunti tulee 3 metrin pala, ja paloja on viisi: s = v · t = 3 · 5 = 15 m.', scene: perSecondScene(15, 5, 'Loikka', 's') },
      { say: 'Kuinka kauan kestää 16 metriä, kun vauhti on 4 m/s? Kello käy, kunnes maali tulee: 4 metrin paloja mahtuu neljä. t = s / v = 16 / 4 = 4 s.', scene: perSecondScene(16, 4, 'Loikka', 't') },
      { say: 'Kaavakolmio auttaa muistamaan. Peitä se suure, jonka haluat laskea. Vierekkäiset kerrotaan, päällekkäiset jaetaan.', scene: triangleScene() },
    ],
    item: cases({
      dist: (r) => { const v = r.int(2, 9), tt = r.int(3, 9); return wq(ask(`Sammakko etenee ${v} m/s. Kuinka pitkälle se etenee ajassa ${tt} s?`, v * tt, 'm', `s = v · t = ${v} m/s · ${tt} s = ${v * tt} m.`), 'Joka sekunti tulee yhtä monta metriä. Kerro nopeus ajalla.', { [v + tt]: `Laskit yhteen. Joka sekunti ${v} m, ja sekunteja on ${tt}: kerro.`, [tt / v]: 'Jaoit. Matka saadaan kertomalla: s = v · t.', [v / tt]: 'Jaoit. Matka saadaan kertomalla: s = v · t.' }); },
      time: (r) => { const v = r.int(2, 6), tt = r.int(3, 9); return wq(ask(`Vene kulkee ${v} m/s. Kuinka kauan kestää ${v * tt} m matka?`, tt, 's', `t = s / v = ${v * tt} m / ${v} m/s = ${tt} s.`), `Montako ${v} metrin palaa mahtuu ${v * tt} metriin? Jaa matka nopeudella.`, { [v * tt * v]: `Kerroit. Aika saadaan jakamalla: t = s / v = ${v * tt} / ${v}.`, [v * tt - v]: 'Vähensit. Aika saadaan jakamalla matka nopeudella.', [v / (v * tt)]: 'Jaoit väärin päin. Matka jaetaan nopeudella: t = s / v.' }); },
      which: (r) => {
        const rows = r.shuffle([0, 1, 2, 3]).map((k) => { const v = r.int(2, 9), tt = r.int(2, 9); return k < 2 ? { x: `${v} m/s, ${tt} s: kuinka pitkälle?`, c: 0, why: `Matka kysytään: s = v · t = ${v} · ${tt}.` } : { x: `${v} m/s, ${v * tt} m: kuinka kauan?`, c: 1, why: `Aika kysytään: t = s / v = ${v * tt} / ${v}.` }; });
        const uniq = rows.filter((x, i) => rows.findIndex((y) => y.x === x.x) === i);
        return {
          say: 'Lajittele: kerrotaanko vai jaetaanko?',
          task: { kind: 'sort' as const, items: uniq.map((x) => t(x.x)), cats: [{ label: 'Kerro: s = v · t' }, { label: 'Jaa: t = s / v' }], answer: uniq.map((x) => x.c), why: uniq.map((x) => x.why) },
          hint: 'Kysytäänkö matkaa (kerro) vai aikaa (jaa)?',
          explain: 'Matka = nopeus · aika. Aika = matka / nopeus.',
        };
      },
    }, (r) => {
      const v = r.pick([40, 80]), s = v * 2.5;
      return wq(ask(`Juna kulkee ${v} km/h. Kuinka kauan kestää ${s} km matka?`, 2.5, 'h', `t = s / v = ${s} km / ${v} km/h = 2,5 h.`, undefined, 0.001), 'Montako kertaa nopeus mahtuu matkaan? Jaa matka nopeudella; vastaus voi olla desimaaliluku.', { [s * v]: 'Kerroit. Aika saadaan jakamalla: t = s / v.', 2: 'Vastaus jäi kokonaislukuun. Laske loppuun: 2,5 h.', 3: `${v} km/h · 3 h = ${v * 3} km, liikaa. Laske tarkasti: 2,5 h.`, [v / s]: 'Jaoit väärin päin. t = s / v.' });
    }),
  },
  {
    id: 'PHY79-SPEED-MIXED', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Sekayksiköt', icon: '⚖️',
    goal: 'Opit muuntamaan matkan ja ajan sopiviin yksiköihin ennen nopeuden laskemista sekä vaihtamaan m/s ja km/h kertoimella 3,6.',
    intro: 'Mittaukset tulivat eri yksiköissä. Ensin yhtenäistetään, sitten lasketaan.',
    reward: 'Yksiköt ensin, sitten lasku. Hienoa!',
    demo: () => [
      { say: 'Juoksija kulki 1,2 km ajassa 4 min. Nopeus halutaan yksikössä m/s, joten ensin matka metreiksi: 1,2 km on 1200 m.', scene: convScene(1200, 1000, 'km', 'm', 'mul') },
      { say: 'Sitten aika sekunneiksi: jokaisessa minuutissa on 60 sekuntia. 4 min = 240 s.', scene: convScene(240, 60, 'min', 's', 'mul') },
      { say: 'Nyt yksiköt sopivat yhteen. 1200 m jaettuna 240 s: luvuista 5, yksiköistä m/s. Juoksijan nopeus on 5 m/s.', scene: unitBuildScene(1200, 'm', 240, 's') },
      { say: 'Miksi 1 m/s on 3,6 km/h? Loikka etenee metrin joka sekunti. Tunnissa on 3600 sekuntia, joten tunnissa kertyy 3600 metriä eli 3,6 kilometriä.', scene: hourScene() },
    ],
    item: cases({
      kmMin: (r) => {
        const v = r.int(2, 6), m = r.int(2, 5), s = v * m * 60;
        return wq(ask(`1 km = 1000 m, 1 min = 60 s. Juoksija kulki ${fmt(s / 1000)} km ajassa ${m} min. Laske nopeus yksikössä m/s.`, v, 'm/s', `${fmt(s / 1000)} km = ${s} m ja ${m} min = ${m * 60} s. v = ${s} m / ${m * 60} s = ${v} m/s.`), 'Muunna ensin matka metreiksi ja aika sekunneiksi, sitten jaa.', { [v * 60]: `Minuutit jäivät muuntamatta: ${s} m / ${m} = ${v * 60}. Muunna ${m} min sekunneiksi.`, [s / (m * 100)]: 'Minuutissa on 60 sekuntia, ei 100.', [s / 1000 / (m * 60)]: 'Kilometrit jäivät muuntamatta. Muunna matka ensin metreiksi.', [s / 1000 / m]: 'Kumpikaan yksikkö ei ole muunnettu. Tulos olisi km/min, ei m/s.' });
      },
      mMin: (r) => {
        const v = r.int(2, 5), m = r.int(2, 5), s = v * m * 60;
        return wq(ask(`1 min = 60 s. Pyöräilijä kulki ${s} m ajassa ${m} min. Laske nopeus yksikössä m/s.`, v, 'm/s', `${m} min = ${m * 60} s. v = ${s} m / ${m * 60} s = ${v} m/s.`), `Muunna ensin ${m} min sekunneiksi.`, { [v * 60]: `Jaoit minuuteilla: tulos on metriä minuutissa. Muunna ${m} min = ${m * 60} s.`, [s / (m * 100)]: 'Minuutissa on 60 sekuntia, ei 100.' });
      },
      kmh: (r) => {
        const v = r.pick([5, 10, 15, 20]);
        return wq(ask(`1 m/s = 3,6 km/h. Muunna ${fmt(v * 3.6)} km/h yksikköön m/s.`, v, 'm/s', `${fmt(v * 3.6)} / 3,6 = ${v}, joten nopeus on ${v} m/s.`), 'km/h-luku on 3,6 kertaa suurempi kuin m/s-luku. Jaa 3,6:lla.', { [+(v * 3.6 * 3.6).toFixed(2)]: 'Kerroit 3,6:lla. Kohti m/s:ää luku pienenee: jaa.', [v * 3.6]: 'Luku on vielä km/h-yksikössä. Jaa 3,6:lla.' });
      },
      ready: (r) => {
        const pool = r.shuffle(MIXED_READY), rows = [...pool.filter((x) => x[1] === 0).slice(0, 2), ...pool.filter((x) => x[1] === 1).slice(0, 2)], all = r.shuffle(rows);
        return {
          say: 'Nopeus lasketaan yksikössä m/s. Lajittele mittaukset: voiko heti jakaa, vai pitääkö ensin muuntaa?',
          task: { kind: 'sort' as const, items: all.map((x) => t(x[0])), cats: [{ label: 'Valmis: jaa heti ✓' }, { label: 'Muunna ensin 🔁' }], answer: all.map((x) => x[1]), why: all.map((x) => x[2]) },
          hint: 'm/s vaatii matkan metreinä ja ajan sekunteina.',
          explain: 'Vain metrit ja sekunnit voi jakaa suoraan, kun tulos halutaan yksikössä m/s.',
        };
      },
    }, (r) => {
      const ms = r.pick([10, 15, 20]), kmh = r.pick([36, 54, 72].filter((x) => x !== Math.round(ms * 3.6)));
      const msFaster = Math.round(ms * 3.6) > kmh, conv = `${ms} m/s = ${fmt(ms * 3.6)} km/h`;
      return { say: `1 m/s = 3,6 km/h. Kumpi on nopeampi: ${ms} m/s vai ${kmh} km/h?`, task: fixed([t(`${ms} m/s`), t(`${kmh} km/h`), t('Yhtä nopeat')], msFaster ? 0 : 1, [msFaster ? undefined : `${conv}, ja se on vähemmän kuin ${kmh} km/h.`, msFaster ? `${conv}, ja se on enemmän kuin ${kmh} km/h. Suurempi luku ei kerro mitään, jos yksiköt ovat eri.` : undefined, `${conv}, ei ${kmh} km/h.`], 3), hint: `Muunna ${ms} m/s ensin km/h:ksi: kerro 3,6:lla.`, explain: `${conv}, joten ${msFaster ? `${ms} m/s` : `${kmh} km/h`} on nopeampi.` };
    }),
  },
  // ============================================================ data ja kuvaajat
  {
    id: 'PHY79-DATA-01', stop: 'Mittaustaulukko', icon: '🗒️', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    goal: 'Opit kirjaamaan mittaukset taulukkoon: otsikkoon suure, tunnus ja yksikkö, jokainen mittaus omalle rivilleen.',
    intro: 'Kisan mittaukset kirjataan taulukkoon, jotta niitä voi verrata.',
    reward: 'Taulukko on selkeä ja oikein!',
    demo: () => [
      { say: 'Ensin kirjoitetaan otsikkorivi: aika t sekunteina ja matka s metreinä. Sitten sammakko lähtee. Kello käy, ja joka toinen sekunti merkitään lippu. Aika ja matka kirjataan samalle riville.', scene: logScene(3, [0, 2, 4, 6]) },
      { say: 'Yksikkö kirjoitetaan kerran otsikkoon sulkeisiin. Silloin riveille riittävät pelkät luvut.', scene: card('aika t (s) | matka s (m)', '2 | 6', '4 | 12') },
    ],
    item: cases({
      table: (r) => {
        const v = r.int(2, 4); const ts = [0, 2, 4, 6];
        const log = ts.map((x) => `${x} s: ${v * x} m`).join(', ');
        const right = table(['aika t (s)', 'matka s (m)'], ts.map((x) => [x, v * x]));
        const shifted = table(['aika t (s)', 'matka s (m)'], ts.map((x, i) => [x, v * (ts[i + 1] ?? 8)]));
        const noUnits = table(['aika', 'matka'], ts.map((x) => [x, v * x]));
        return { say: `Mittauspäiväkirja: ${log}. Mikä taulukko kokoaa mittaukset oikein?`, task: choose(r, { art: right }, [{ art: shifted }, { art: noUnits }], [`Matkat ovat siirtyneet väärille riveille: hetkellä 0 s matka on 0 m, ei ${v * 2} m.`, 'Otsikoista puuttuvat yksiköt: onko matka metreinä vai senttimetreinä?'], 1), hint: 'Tarkista kaksi asiaa: yksiköt otsikossa ja sama hetki samalla rivillä.', explain: 'Otsikoissa suure ja yksikkö, ja jokainen aika samalla rivillä oman matkansa kanssa.' };
      },
      header: (r) => ({ say: 'Mitattiin aika sekunteina ja matka metreinä. Mikä on oikea otsikkorivi?', task: choose(r, t('aika t (s) | matka s (m)'), [t('aika t (m) | matka s (s)'), t('aika | matka'), t('aika t (s) | matka s')], ['Yksiköt ovat vaihtaneet paikkaa: aika mitataan sekunteina.', 'Yksiköt puuttuvat.', 'Matkan yksikkö puuttuu.'], 1), hint: 'Jokaiseen sarakkeeseen: suure, tunnus ja yksikkö sulkeissa.', explain: 'Aika sekunteina, matka metreinä: aika t (s), matka s (m).' }),
      fill: (r) => {
        const v = r.int(2, 5), ts = [1, 2, 3, 4];
        const log = r.shuffle([...ts, 5].map((x) => `${x} s: ${v * x} m`));
        return {
          say: `Mittauspäiväkirja on sekaisin: ${log.join('; ')}. Kirjaa matkat taulukon riveille. Taulukossa on rivit vain hetkille 1–4 s, joten yksi lappu jää yli.`,
          task: {
            kind: 'place',
            slots: ts.map((x) => ({ id: `s${x}`, text: `t = ${x} s → s = ▢ m` })),
            tokens: r.shuffle([...ts.map((x) => ({ id: `v${x}`, text: fmt(v * x) })), { id: 'x', text: fmt(v * 5) }]),
            answer: Object.fromEntries(ts.map((x) => [`s${x}`, `v${x}`])),
            why: Object.fromEntries(ts.map((x) => [`s${x}`, `Päiväkirjassa ${x} s: ${v * x} m. Sama hetki samalle riville.`])),
          },
          hint: 'Etsi päiväkirjasta jokaisen rivin aika ja kirjaa sen matka samalle riville.',
          explain: `Rivit: ${ts.map((x) => `${x} s → ${v * x} m`).join(', ')}. ${v * 5} m mitattiin hetkellä 5 s, jolle ei ole riviä.`,
        };
      },
    }, (r) => {
      const v = r.int(2, 5); const ts = [0, 1, 2, 3, 4]; const k = r.int(1, 4);
      return wq(ask(`Mikä oli matka hetkellä ${k} s?`, v * k, 'm', `Rivi ${k} s: matka ${v * k} m.`, table(['aika t (s)', 'matka s (m)'], ts.map((x) => [x, v * x]))), 'Etsi aikasarakkeesta rivi, sitten lue matka samalta riviltä.',
        { [v * (k + 1)]: `Tämä on seuraavan rivin (${k + 1} s) matka.`, [v * (k - 1)]: `Tämä on edellisen rivin (${k - 1} s) matka.`, [k]: `${k} on aika, ei matka. Lue luku matka-sarakkeesta.` });
    }),
  },
  {
    id: 'PHY79-GRAPH-01', stop: 'Pisteet kuvaajaan', icon: '📈', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    goal: 'Opit siirtämään mittaustaulukon pisteiksi kuvaajaan: aika vaaka-akselille, matka pystyakselille.',
    intro: 'Taulukosta tehdään kuvaaja: jokainen rivi on yksi piste.',
    reward: 'Kuvaaja on valmis!',
    demo: () => [
      { say: 'Ensin piirretään akselit: aika vaakaan, matka pystyyn, ja kumpaankin tasainen asteikko. Sitten jokainen taulukon rivi siirretään pisteeksi: ensin aika vaakasuunnassa, sitten matka ylöspäin.', scene: plotDataScene([[0, 0], [2, 10], [4, 20], [6, 30]], 10, 40, 2, 5) },
      { say: 'Kun pisteet ovat paikallaan, niistä näkee kerralla koko mittauksen.', scene: paint(chart(ST, [{ pts: [[0, 0], [2, 10], [4, 20], [6, 30]], dots: true }])) },
    ],
    item: cases({
      plot: (r) => {
        const v = r.pick([2.5, 5]); const xs = [2, 4, 6, 8].slice(r.int(0, 1));
        const ys = xs.map((x) => v * x);
        return { say: 'Merkitse taulukon mittaukset kuvaajaan.', scene: paint(table(['aika t (s)', 'matka s (m)'], xs.map((x, i) => [x, ys[i]!]))), task: { kind: 'plot', xs, ys, xMax: 10, yMax: 40, xStep: 2, yStep: 5, xLabel: 't (s)', yLabel: 's (m)' }, hint: 'Aika vaaka-akselilta, matka pystyakselilta. Katso, kuinka paljon yksi ruutu on kummallakin akselilla.', explain: `Pisteet: ${xs.map((x, i) => `(${x}, ${ys[i]})`).join(', ')}.` };
      },
      pick: (r) => {
        const ys = r.shuffle([10, 20, 30, 15, 25]).slice(0, 3).sort((a, b) => a - b); const xs = [2, 4, 6];
        const pts = xs.map((x, i) => [x, ys[i]!] as [number, number]);
        const g = (p: [number, number][]) => ({ art: chart({ ...ST, w: 220, h: 150 }, [{ pts: p, dots: true }]) });
        return { say: 'Mikä kuvaaja esittää taulukon mittaukset?', scene: paint(table(['aika t (s)', 'matka s (m)'], pts)), task: choose(r, g(pts), [g(pts.map(([x, y]) => [x, y + 5])), g(pts.map(([x, y], i) => [x, ys[2 - i]!]))], ['Pisteet ovat 5 m liian ylhäällä.', 'Matkat ovat väärässä järjestyksessä: ensimmäisellä rivillä matka on pienin.'], 1), hint: 'Tarkista ensimmäinen rivi: missä sen pisteen pitäisi olla?', explain: `Pisteet ${pts.map(([x, y]) => `(${x}, ${y})`).join(', ')}.` };
      },
      rows: (r) => {
        const v = r.pick([2, 3, 4, 5]), xs = r.shuffle([1, 2, 3, 4, 5, 6]).slice(0, 3).sort((a, b) => a - b), sw = xs[r.int(0, 2)]!;
        return {
          say: 'Yhdistä jokainen taulukon rivi oikeaan pisteeseen. Yksi lappu jää yli.',
          task: {
            kind: 'place',
            slots: xs.map((x, i) => ({ id: `s${i}`, text: `${x} s, ${v * x} m → ▢` })),
            tokens: r.shuffle([...xs.map((x, i) => ({ id: `p${i}`, text: `${x} oikealle, ${v * x} ylös` })), { id: 'x', text: `${v * sw} oikealle, ${sw} ylös` }]),
            answer: Object.fromEntries(xs.map((_, i) => [`s${i}`, `p${i}`])),
            why: Object.fromEntries(xs.map((x, i) => [`s${i}`, `Aika ${x} s vaaka-akselilla, matka ${v * x} m pystyakselilla.`])),
          },
          hint: 'Aika kulkee vaakaan (oikealle), matka pystyyn (ylös).',
          explain: `Lappu ”${v * sw} oikealle, ${sw} ylös” on väärin päin: siinä matka on vaaka-akselilla.`,
        };
      },
    }, (r) => {
      const pts: [number, number][] = [[2, 10], [4, 20], [6, 30]];
      const swapped = chart({ xMax: 40, yMax: 10, xStep: 10, yStep: 2, xLabel: 's (m)', yLabel: 't (s)', w: 220, h: 150 }, [{ pts: pts.map(([a, b]) => [b, a]), dots: true }]);
      const right = chart({ ...ST, w: 220, h: 150 }, [{ pts, dots: true }]);
      return { say: 'Aika valitaan vaaka-akselille. Mikä kuvaaja on piirretty sovitulla tavalla?', scene: paint(table(['aika t (s)', 'matka s (m)'], pts)), task: choose(r, { art: right }, [{ art: swapped }], ['Tässä akselit ovat vaihtaneet paikkaa: matka on vaaka-akselilla.'], 1), hint: 'Lue akselien nimet: kumman akselin nimi on t (s)?', explain: 'Aika t vaaka-akselilla, matka s pystyakselilla.' };
    }),
  },
  {
    id: 'PHY79-ST-GRAPH', stop: 'Matka–aika-kuvaaja', icon: '📉', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    goal: 'Opit lukemaan matka–aika-kuvaajasta, kuka liikkuu nopeammin, milloin kappale lepää ja kuinka suuri nopeus on.',
    intro: 'Matka–aika-kuvaajasta näkee, kuinka nopeasti kappale liikkuu.',
    reward: 'Luet matka–aika-kuvaajaa!',
    demo: () => [
      { say: 'Katso kisaa. Loikka loikkii koko ajan samaa vauhtia. Sulka lähtee kovaa, lepää hetken ja jatkaa sitten hitaammin. Kynä piirtää kummankin matkan ajan funktiona.', scene: stLiveScene([{ name: 'Loikka', col: '#2b6cb0', pts: [[0, 0], [10, 30]] }, { name: 'Sulka', col: '#d9534f', pts: [[0, 0], [4, 20], [6, 20], [10, 28]] }], 10, 40) },
      { say: 'Nopeus luetaan kuvaajasta näin: valitse aikaväli ja katso, paljonko matka kasvoi. Loikka kulki 10 sekunnissa 30 m, joten v = 30 m / 10 s = 3 m/s.', scene: stLiveScene([{ name: 'Loikka', col: '#2b6cb0', pts: [[0, 0], [10, 30]] }], 10, 40) },
    ],
    item: cases({
      steeper: (r) => {
        const [va, vb] = r.shuffle([1, 2, 3, 4]).slice(0, 2) as [number, number];
        const fast = va > vb ? 'A' : 'B', slow = va > vb ? 'B' : 'A';
        return {
          say: 'Kumpi sammakoista liikkuu nopeammin?',
          scene: paint(chart(ST, [{ pts: [[0, 0], [10, va * 10]], label: 'A' }, { pts: [[0, 0], [10, vb * 10]], color: 'var(--red)', label: 'B' }])),
          task: fixed(A_B, va > vb ? 0 : 1, [0, 1, 2].map((i) => (i === (va > vb ? 0 : 1) ? undefined : i === 2 ? 'Suorat eivät ole päällekkäin: samassa ajassa ne ehtivät eri matkat.' : `${slow}:n suora on loivempi: 10 sekunnissa se pääsee vain ${(slow === 'A' ? va : vb) * 10} m.`)), 3),
          hint: 'Katso hetkeä 10 s: kumpi on silloin päässyt pidemmälle?',
          explain: `Jyrkempi suora tarkoittaa suurempaa nopeutta. ${fast} kulkee 10 sekunnissa ${(fast === 'A' ? va : vb) * 10} m, ${slow} vain ${(slow === 'A' ? va : vb) * 10} m.`,
        };
      },
      flat: (r) => {
        const a = r.pick([2, 4]);
        const kind = r.pick(['stop', 'move'] as const);
        const pts: [number, number][] = kind === 'stop' ? [[0, 0], [a, 20], [a + 4, 20], [10, 30]] : [[0, 0], [a, 10], [a + 4, 26], [10, 36]];
        return {
          say: `Mitä tapahtui välillä ${a}–${a + 4} s?`, scene: paint(chart(ST, [{ pts }])),
          task: fixed([t('Kappale oli paikallaan.'), t('Kappale liikkui.')], kind === 'stop' ? 0 : 1, kind === 'stop' ? [undefined, 'Matka pysyi samana koko välin ajan, joten kappale ei liikkunut.'] : ['Viiva nousee koko välin ajan: matka kasvaa, joten kappale liikkuu.', undefined], 1),
          hint: 'Kasvaako matka tällä välillä? Vertaa välin alun ja lopun korkeutta.',
          explain: kind === 'stop' ? 'Matka ei kasvanut: kuvaaja on vaakasuora.' : `Matka kasvoi ${a} s:n kohdalla olleesta 10 m:stä 26 m:iin.`,
        };
      },
      read: (r) => {
        const v = r.pick([2, 3, 4]);
        return wq(ask('Lue kuvaajasta ja laske nopeus.', v, 'm/s', `Esimerkiksi 10 s aikana matka kasvaa ${v * 10} m: v = ${v * 10} m / 10 s = ${v} m/s.`, chart(ST, [{ pts: [[0, 0], [10, v * 10]], dots: false }])), 'Valitse aikaväli, esimerkiksi 0–10 s. Paljonko matka kasvoi? Jaa ajalla.',
          { [v * 10]: `${v * 10} m on matka 10 sekunnissa. Nopeus on matka yhtä sekuntia kohden: jaa ajalla.`, [10]: '10 on aika, ei nopeus.', [v * 2]: `${v * 2} m on matka 2 sekunnissa, ei yhdessä sekunnissa.` });
      },
      story: (r) => {
        const kinds = r.shuffle(['fast', 'rest', 'slow'] as const), lens = r.shuffle([4, 2, 4]);
        const vOf = { fast: 5, rest: 0, slow: 2 } as const, lab = { fast: 'Loikkii nopeasti', rest: 'Lepää paikallaan', slow: 'Loikkii hitaasti' } as const;
        const pts: [number, number][] = [[0, 0]]; const ivs: [number, number][] = [];
        let x = 0, y = 0;
        kinds.forEach((k, i) => { const nx = x + lens[i]!; y += vOf[k] * lens[i]!; ivs.push([x, nx]); pts.push([nx, y]); x = nx; });
        return {
          say: 'Sammakon matka–aika-kuvaajassa on kolme osaa. Mitä sammakko tekee kussakin osassa? Yksi lappu jää yli.',
          scene: paint(chart(ST, [{ pts, dots: true }])),
          task: {
            kind: 'place',
            slots: ivs.map(([a, b], i) => ({ id: `s${i}`, text: `${a}–${b} s → ▢` })),
            tokens: r.shuffle([...(['fast', 'rest', 'slow'] as const).map((k) => ({ id: k, text: lab[k] })), { id: 'back', text: 'Palaa kohti lähtöä' }]),
            answer: Object.fromEntries(kinds.map((k, i) => [`s${i}`, k])),
            why: Object.fromEntries(kinds.map((k, i) => [`s${i}`, k === 'rest' ? 'Viiva on vaakasuora: matka ei kasva.' : k === 'fast' ? `Jyrkin osa: matka kasvaa ${vOf.fast} m sekunnissa.` : `Loiva nousu: matka kasvaa vain ${vOf.slow} m sekunnissa.`])),
          },
          hint: 'Vaakasuora viiva = lepo. Jyrkkä nousu = nopea. Loiva nousu = hidas.',
          explain: 'Lappu ”Palaa kohti lähtöä” jää yli: kuljettu matka ei koskaan pienene, joten viiva ei laske.',
        };
      },
    }, (r) => {
      const a = r.pick([4, 6]);
      // Position (distance from the start), not distance travelled: travelled distance never decreases.
      return { say: `Tässä kuvaajassa on kappaleen etäisyys lähtöpaikasta. Mitä tapahtuu ${a} sekunnin jälkeen?`, scene: paint(chart({ ...ST, yLabel: 'etäisyys lähdöstä (m)' }, [{ pts: [[0, 0], [a, 30], [10, 30 - (10 - a) * 5]] }])), task: choose(r, t('Kappale palaa kohti lähtöpaikkaa.'), [t('Kappale hidastuu ja pysähtyy.'), t('Kappale menee alamäkeen.')], ['Kuvaaja on suora: nopeus ei muutu.', 'Kuvaaja ei ole kuva maastosta.'], 1), hint: 'Mitä pystyakselilla on? Kasvaako vai pieneneekö se lopussa?', explain: 'Etäisyys lähtöpaikasta pienenee, joten kappale liikkuu takaisin. Kuljettu matka kasvaa silti koko ajan.' };
    }),
  },
  {
    id: 'PHY79-VT-GRAPH', stop: 'Nopeus–aika-kuvaaja', icon: '🚀', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    goal: 'Opit lukemaan nopeus–aika-kuvaajasta, kasvaako, pysyykö vai pieneneekö nopeus, ja mikä nopeus on tiettynä hetkenä.',
    intro: 'Nopeus–aika-kuvaaja näyttää suoraan nopeuden joka hetki.',
    reward: 'Luet nopeus–aika-kuvaajaa!',
    demo: () => [
      { say: 'Seuraa sammakkoa, nopeusmittaria ja kynää. Ensin nopeus kasvaa, sitten se pysyy samana ja lopuksi pienenee nollaan. Vihreät pisteet näyttävät, kuinka pitkälle sammakko pääsee joka sekunti.', scene: vtLiveScene([[0, 0], [4, 12], [7, 12], [10, 0]], 10, 20, 5) },
      { say: 'Tärkeä ansa: vaakasuora viiva ei tarkoita paikallaan oloa. Tässä nopeus pysyy 10 m/s, joten sammakko liikkuu tasaisesti koko ajan. Paikallaan ollessa viiva kulkisi nollan kohdalla.', scene: vtLiveScene([[0, 10], [10, 10]], 10, 20, 5) },
    ],
    item: cases({
      ...Object.fromEntries(SHAPES.map((s) => [s, (_r: Rng) => ({
        say: 'Mitä kuvaaja kertoo liikkeestä?', scene: paint(chart(VT, [{ pts: vtCurve(s), color: 'var(--red)' }])),
        task: fixed(SHAPES.map((k) => t(SHAPE_TEXT[k])), SHAPES.indexOf(s), SHAPES.map((k) => (k === s ? undefined : VT_WHY[s][k])), 1),
        hint: 'Lue pystyakselia: mikä nopeus on alussa ja mikä lopussa?',
        explain: { rest: 'Nopeus on koko ajan 0: kappale on paikallaan.', steady: 'Nopeus pysyy 10 m/s: tasainen liike.', accel: 'Viiva nousee: nopeus kasvaa 2 m/s:sta 18 m/s:iin.', decel: 'Viiva laskee: nopeus pienenee 18 m/s:sta 2 m/s:iin.' }[s],
      })])),
      phases: (r: Rng) => {
        const tpl = r.pick(VT_PHASES);
        const pts: [number, number][] = [[0, tpl[0]![1]]]; tpl.forEach(([, , v1, t1]) => pts.push([t1, v1]));
        const ivs = tpl.map(([, , , t1], i) => [i ? tpl[i - 1]![3] : 0, t1] as [number, number]);
        return {
          say: 'Nopeus–aika-kuvaajassa on kolme osaa. Mitä kappaleelle tapahtuu kussakin osassa? Yksi lappu jää yli.',
          scene: paint(chart({ ...VT, yStep: 2, h: 230 }, [{ pts, color: 'var(--red)', dots: true }])),
          task: {
            kind: 'place',
            slots: ivs.map(([a, b], i) => ({ id: `s${i}`, text: `${a}–${b} s → ▢` })),
            tokens: r.shuffle(SHAPES.map((k) => ({ id: k, text: SHAPE_TEXT[k] }))),
            answer: Object.fromEntries(tpl.map(([k], i) => [`s${i}`, k])),
            why: Object.fromEntries(tpl.map(([k, v0, v1], i) => [`s${i}`, k === 'steady' ? `Nopeus pysyy ${v0} m/s: vaakaviiva nollan yläpuolella.` : k === 'rest' ? 'Nopeus on 0 koko välin ajan.' : `Nopeus ${k === 'accel' ? 'kasvaa' : 'pienenee'} ${v0} m/s:sta ${v1} m/s:iin.`])),
          },
          hint: 'Nouseva = kasvaa, laskeva = pienenee, vaakasuora = pysyy. Vaakasuora nollassa = paikallaan.',
          explain: `Ylimääräinen lappu: ”${SHAPE_TEXT[SHAPES.find((k) => !tpl.some(([x]) => x === k))!]}”.`,
        };
      },
    }, (r) => {
      // Grid every 2 m/s and even values: the answer sits on a grid crossing, read without a ruler.
      const v0 = r.pick([0, 4]), k = v0 === 0 ? r.int(1, 2) : 1, tt = r.pick([2, 4, 6]);
      return wq(ask(`Mikä on nopeus hetkellä ${tt} s?`, v0 + k * tt, 'm/s', `Kuvaajasta: hetkellä ${tt} s nopeus on ${v0 + k * tt} m/s.`, chart({ ...VT, yStep: 2, h: 230 }, [{ pts: [[0, v0], [10, Math.min(20, v0 + k * 10)]], color: 'var(--red)' }])), `Etsi vaaka-akselilta ${tt} s, nouse viivalle asti ja lue nopeus pystyakselilta.`,
        { [tt]: `${tt} on aika, ei nopeus. Lue luku pystyakselilta.`, [v0]: `${v0} m/s on nopeus alussa (0 s), ei hetkellä ${tt} s.`, [Math.min(20, v0 + k * 10)]: 'Tämä on nopeus lopussa (10 s).' });
    }),
  },
  {
    id: 'PHY79-ACCEL-CONCEPT', stop: 'Kiihtyvyys', icon: '🛥️', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    goal: 'Opit, että kiihtyvyys kertoo, kuinka paljon nopeus muuttuu joka sekunti – ja että myös jarrutus on kiihtyvyyttä.',
    intro: 'Moottorivene lähtee laiturista. Sen nopeus muuttuu. Tätä kutsutaan kiihtyvyydeksi.',
    reward: 'Ymmärrät kiihtyvyyden!',
    demo: () => [
      { say: 'Katso venettä. Joka sekunti sen nopeus kasvaa 2 m/s. Taulukkoon tulee rivi sekunnin välein. Kiihtyvyys on 2 m/s²: nopeus kasvaa 2 m/s joka sekunti.', scene: accelTableScene(0, 2, 4) },
      { say: 'Pyöräilijä jarruttaa. Nyt nopeus pienenee 3 m/s joka sekunti. Sekin on kiihtyvyyttä, koska nopeus muuttuu. Hidastuvassa liikkeessä kiihtyvyys on negatiivinen: −3 m/s².', scene: accelTableScene(12, -3, 4, '🚲') },
    ],
    item: cases({
      which: (r) => ({ say: 'Missä tilanteessa on kiihtyvyyttä?', task: choose(r, t('Vene lähtee laiturista liikkeelle.'), [t('Vene ajaa tasaisesti 5 m/s.'), t('Vene on kiinni laiturissa.')], ['Nopeus pysyy koko ajan 5 m/s: se ei muutu, joten kiihtyvyyttä ei ole.', 'Nopeus on koko ajan 0 eikä muutu.'], 1), hint: 'Etsi tilanne, jossa nopeus muuttuu.', explain: 'Kiihtyvyys = nopeuden muutos. Lähtiessä nopeus kasvaa.' }),
      meaning: (r) => {
        const a = r.int(2, 5);
        return { say: `Veneen kiihtyvyys on ${a} m/s². Mitä se tarkoittaa?`, task: choose(r, t(`Nopeus kasvaa ${a} m/s joka sekunti.`), [t(`Vene kulkee ${a} m joka sekunti.`), t(`Veneen nopeus on ${a} m/s.`)], ['Tämä kuvaa nopeutta (m/s), ei nopeuden muutosta.', 'Tämä on nopeus, ei kiihtyvyys. Kiihtyvyys kertoo, paljonko nopeus muuttuu.'], 1), hint: 'Yksikkö m/s² = (m/s) sekunnissa: kuinka monta m/s nopeus muuttuu yhdessä sekunnissa.', explain: `${a} m/s² = nopeus muuttuu ${a} m/s sekunnissa.` };
      },
      table: (r) => {
        const a = r.int(1, 3);
        const tab = (vs: number[]) => ({ art: table(['t (s)', 'v (m/s)'], vs.map((v, i) => [i, v])) });
        return { say: 'Missä taulukossa on kiihtyvää liikettä?', task: choose(r, tab([0, a, 2 * a, 3 * a]), [tab([4, 4, 4, 4]), tab([0, 0, 0, 0])], ['Nopeus on joka hetki 4 m/s: se ei muutu.', 'Nopeus on koko ajan 0: kappale on paikallaan.'], 3), hint: 'Katso v-saraketta: missä taulukossa luvut muuttuvat rivi riviltä?', explain: 'Kiihtyvässä liikkeessä nopeus muuttuu ajan kuluessa.' };
      },
      gain: (r) => {
        const a = r.int(2, 4), v0 = r.pick([0, 1, 3]);
        const vs = [0, 1, 2, 3].map((i) => v0 + a * i);
        return wq(ask('Kuinka monta m/s veneen nopeus kasvaa joka sekunti?', a, 'm/s', `Nopeus kasvaa ${vs[0]} → ${vs[1]} → ${vs[2]} → ${vs[3]}: joka sekunti ${a} m/s. Kiihtyvyys on ${a} m/s².`, table(['t (s)', 'v (m/s)'], vs.map((v, i) => [i, v]))), 'Vähennä seuraavan rivin nopeudesta edellisen rivin nopeus.',
          { [vs[3]!]: `${vs[3]} m/s on nopeus hetkellä 3 s, ei nopeuden kasvu sekunnissa.`, [vs[3]! - vs[0]!]: `${vs[3]! - vs[0]!} m/s on kasvu kolmessa sekunnissa. Jaa kolmella.`, ...(v0 > 0 ? { [vs[1]!]: `${vs[1]} m/s on nopeus hetkellä 1 s. Vähennä alkunopeus ${v0} m/s.` } : {}) });
      },
      change: (r) => {
        const rows = r.shuffle([
          ['Auto lähtee liikennevaloista.', 0, 'Nopeus kasvaa nollasta: nopeus muuttuu.'],
          ['Pyöräilijä jarruttaa ennen risteystä.', 0, 'Nopeus pienenee – sekin on nopeuden muutos.'],
          ['Hissi lähtee liikkeelle.', 0, 'Hissi on aluksi paikallaan ja saa sitten nopeuden: nopeus muuttuu.'],
          ['Vene hidastaa laituria lähestyessään.', 0, 'Nopeus pienenee: hidastuminen on negatiivista kiihtyvyyttä.'],
          ['Juna kulkee suoraa rataa koko ajan 20 m/s.', 1, 'Nopeus pysyy 20 m/s:ssa: se ei muutu.'],
          ['Kivi makaa maassa.', 1, 'Nopeus on koko ajan 0 eikä muutu.'],
          ['Sammakko lepää lumpeenlehdellä.', 1, 'Sammakko on paikallaan: nopeus 0 ei muutu.'],
          ['Pyöräilijä polkee tasaisesti 5 m/s.', 1, 'Tasainen nopeus ei muutu, joten kiihtyvyyttä ei ole.'],
        ] as [string, number, string][]).slice(0, 6);
        if (!rows.some((q) => q[1] === 0) || !rows.some((q) => q[1] === 1)) rows.reverse();
        return {
          say: 'Lajittele tilanteet: onko liikkeessä kiihtyvyyttä?',
          task: { kind: 'sort' as const, items: rows.map((q) => t(q[0])), cats: [{ label: 'Kiihtyvyyttä – nopeus muuttuu 🚀' }, { label: 'Ei kiihtyvyyttä – nopeus pysyy ⏸️' }], answer: rows.map((q) => q[1]), why: rows.map((q) => q[2]) },
          hint: 'Kysy jokaisesta: muuttuuko nopeus? Myös hidastuminen on muutos.',
          explain: 'Kiihtyvyyttä on aina, kun nopeus muuttuu – kasvaa tai pienenee. Tasainen liike ja paikallaan olo ovat ilman kiihtyvyyttä.',
        };
      },
    }, (r) => ({ say: 'Pyöräilijä jarruttaa ja hidastaa. Onko liikkeessä kiihtyvyyttä?', task: choose(r, t('On, koska nopeus muuttuu.'), [t('Ei, koska nopeus pienenee.'), t('Ei, koska pyöräilijä liikkuu.')], ['Myös nopeuden pieneneminen on muutos.', 'Kiihtyvyys ei riipu siitä, liikkuuko kappale, vaan muuttuuko nopeus.'], 1), hint: 'Kiihtyvyys = nopeuden muutos. Muuttuuko pyöräilijän nopeus?', explain: 'Hidastuva liike on myös kiihtyvyyttä: nopeus muuttuu (pienenee).' })),
  },
  {
    id: 'PHY79-ACCEL-CALC', stop: 'Laske kiihtyvyys', icon: '🧮', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    goal: 'Opit laskemaan kiihtyvyyden: nopeuden muutos jaettuna ajalla, a = (v_loppu − v_alku) / t – myös jarrutuksessa, jolloin tulos on negatiivinen.',
    intro: 'Lasketaan, kuinka nopeasti veneen vauhti kasvaa.',
    reward: 'Lasket kiihtyvyyden!',
    demo: () => [
      { say: 'Vene kulkee aluksi 2 m/s ja kiihdyttää 3 sekuntia. Katso taulukkoa: nopeus kasvaa 2 → 4 → 6 → 8 m/s. Joka sekunti +2 m/s.', scene: accelTableScene(2, 2, 3) },
      { say: 'Sama laskulla: nopeuden muutos on loppunopeus miinus alkunopeus, 8 − 2 = 6 m/s. Muutos tapahtui 3 sekunnissa, joten a = 6 m/s / 3 s = 2 m/s².', scene: card('a = (v<sub>loppu</sub> − v<sub>alku</sub>) / t', '= (8 − 2) m/s / 3 s = 2 m/s²') },
      { say: 'Jarrutuksessa loppunopeus on pienempi kuin alkunopeus, joten muutos on negatiivinen: (0 − 12) m/s / 3 s = −4 m/s².', scene: accelTableScene(12, -4, 3, '🚲') },
    ],
    item: cases({
      rest: (r) => {
        const a = r.int(1, 5), tt = r.int(2, 6);
        return wq(ask(`Vene lähtee levosta ja sen nopeus on ${a * tt} m/s ajan ${tt} s kuluttua. Laske kiihtyvyys.`, a, 'm/s²', `a = (${a * tt} − 0) m/s / ${tt} s = ${a} m/s².`), 'Levosta = alkunopeus 0. Nopeuden muutos jaetaan ajalla.',
          { [a * tt]: `${a * tt} m/s on koko nopeuden muutos ${tt} sekunnissa. Jaa ajalla ${tt} s.`, [a * tt * tt]: 'Kerroit ajalla – kiihtyvyydessä jaetaan ajalla.', [tt]: `${tt} s on aika, ei kiihtyvyys.` });
      },
      moving: (r) => {
        const a = r.int(1, 4), tt = r.int(2, 5), v0 = r.int(2, 6), v1 = v0 + a * tt;
        const w: Record<number, string> = { [a * tt]: `${a * tt} m/s on nopeuden muutos. Jaa vielä ajalla ${tt} s.`, [v1]: `${v1} m/s on loppunopeus. Vähennä ensin alkunopeus.` };
        if (v1 % tt === 0 && v1 / tt !== a) w[v1 / tt] = `Jaoit loppunopeuden ajalla. Vähennä ensin alkunopeus ${v0} m/s.`;
        return wq(ask(`Veneen nopeus kasvaa ${v0} m/s → ${v1} m/s ajassa ${tt} s. Laske kiihtyvyys.`, a, 'm/s²', `a = (${v1} − ${v0}) m/s / ${tt} s = ${a} m/s².`), 'Laske ensin nopeuden muutos: loppunopeus − alkunopeus. Jaa se ajalla.', w);
      },
      build: (r) => {
        const a = r.int(2, 4), tt = r.int(2, 4), v0 = r.int(2, 5), dv = a * tt, v1 = v0 + dv;
        return {
          say: `Veneen nopeus kasvaa ${v0} m/s → ${v1} m/s ajassa ${tt} s. Rakenna lasku: vedä oikea arvo jokaiseen kohtaan. Yksi lappu jää yli.`,
          task: { kind: 'place', slots: [{ id: 'dv', text: 'Nopeuden muutos v_loppu − v_alku' }, { id: 't', text: 'Aika t' }, { id: 'a', text: 'Kiihtyvyys a = muutos / aika' }], tokens: r.shuffle([{ id: 'd', text: `${dv} m/s` }, { id: 'tt', text: `${tt} s` }, { id: 'aa', text: `${a} m/s²` }, { id: 'x', text: `${v1} m/s` }]), answer: { dv: 'd', t: 'tt', a: 'aa' }, why: { dv: `${v1} − ${v0} = ${dv} m/s. Loppunopeus ${v1} m/s yksinään ei ole muutos.`, t: `Muutos tapahtui ${tt} sekunnissa.`, a: `${dv} m/s / ${tt} s = ${a} m/s².` } } as Q['task'],
          hint: 'Muutos = loppunopeus − alkunopeus. Kiihtyvyys saadaan, kun muutos jaetaan ajalla.',
          explain: `a = (${v1} − ${v0}) m/s / ${tt} s = ${dv} m/s / ${tt} s = ${a} m/s².`,
        };
      },
    }, (r) => {
      const a = r.int(2, 4), tt = r.int(2, 4);
      return wq(ask(`Pyöräilijän nopeus putoaa ${a * tt} m/s → 0 m/s ajassa ${tt} s. Laske kiihtyvyys.`, -a, 'm/s²', `a = (0 − ${a * tt}) m/s / ${tt} s = −${a} m/s². Miinus: nopeus pienenee.`), 'Loppunopeus − alkunopeus = 0 − alkunopeus. Onko muutos positiivinen vai negatiivinen?',
        { [a]: 'Suuruus on oikein, mutta nopeus pienenee: kiihtyvyys on negatiivinen.', [-a * tt]: `${-a * tt} m/s on koko muutos. Jaa ajalla ${tt} s.`, [a * tt]: `Nopeus pieneni ${a * tt} m/s – jaa ajalla ja muista miinusmerkki.` });
    }),
  },
  {
    id: 'PHY79-ACCEL-MOTION-GRAPH', stop: 'Kaareva kuvaaja', icon: '〰️', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    goal: 'Opit tunnistamaan matka–aika-kuvaajasta, kasvaako vai pieneneekö nopeus: jyrkkenevä kaari = nopeus kasvaa, loivenevä kaari = nopeus pienenee.',
    intro: 'Matka–aika-kuvaaja kaartuu, kun nopeus muuttuu.',
    reward: 'Tunnistat muuttuvan liikkeen matka–aika-kuvaajasta!',
    demo: () => [
      { say: 'Kaksi sammakkoa. Tasa loikkii koko ajan samaa vauhtia, Kiito kiihdyttää. Radalle jää merkki joka sekunti: Tasan merkit ovat tasavälein, Kiidon merkit harvenevat.', scene: stLiveScene([{ name: 'Tasa', col: '#2b6cb0', pts: stCurve('steady') }, { name: 'Kiito', col: '#d9534f', pts: stCurve('accel') }], 10, 40, 2, 10, { marks: true, mid: 'Katso sekuntimerkkejä: Kiidon välit kasvavat joka sekunti, joten sen viiva jyrkkenee.', end: 'Tasainen nopeus → suora. Nopeus kasvaa → kaari jyrkkenee ylöspäin.' }) },
      { say: 'Nyt Hiipu hidastaa. Joka sekunti se ehtii lyhyemmän matkan, joten merkit tihenevät ja kuvaaja loivenee.', scene: stLiveScene([{ name: 'Tasa', col: '#2b6cb0', pts: stCurve('steady') }, { name: 'Hiipu', col: '#7a4fbf', pts: stCurve('decel') }], 10, 40, 2, 10, { marks: true, mid: 'Hiipun sekuntivälit lyhenevät: nopeus pienenee ja viiva loivenee.', end: 'Nopeus pienenee → kaari loivenee kohti vaakasuoraa.' }) },
    ],
    item: cases({
      ...Object.fromEntries(SHAPES.map((s) => [s, (_r: Rng) => ({
        say: 'Mitä matka–aika-kuvaaja kertoo liikkeestä?', scene: paint(chart(ST, [{ pts: stCurve(s) }])),
        task: fixed(SHAPES.map((k) => t(SHAPE_TEXT[k])), SHAPES.indexOf(s), SHAPES.map((k) => (k === s ? undefined : ST_WHY[s][k])), 1),
        hint: 'Onko viiva vaakasuora, suora vai kaareva? Jos kaareva: jyrkkeneekö vai loiveneeko se oikealle mentäessä?',
        explain: { rest: 'Matka ei muutu: paikallaan.', steady: 'Suora: matka kasvaa joka sekunti yhtä paljon.', accel: 'Kuvaaja jyrkkenee: joka sekunti kuljetaan enemmän.', decel: 'Kuvaaja loivenee: joka sekunti kuljetaan vähemmän.' }[s],
      })])),
      steps: (r) => {
        const pool = r.shuffle([
          ['1 m, 3 m, 5 m, 7 m', 0, 'Matka sekunnissa kasvaa: nopeus kasvaa ja kuvaaja jyrkkenee.'],
          ['2 m, 4 m, 6 m, 8 m', 0, 'Joka sekunti pidempi matka: nopeus kasvaa.'],
          ['0,5 m, 1 m, 2 m, 4 m', 0, 'Sekuntimatkat kasvavat: nopeus kasvaa.'],
          ['8 m, 6 m, 4 m, 2 m', 1, 'Joka sekunti lyhyempi matka: nopeus pienenee ja kuvaaja loivenee.'],
          ['9 m, 5 m, 2 m, 1 m', 1, 'Sekuntimatkat lyhenevät: nopeus pienenee.'],
          ['7 m, 5 m, 3 m, 1 m', 1, 'Matka sekunnissa pienenee: nopeus pienenee.'],
          ['3 m, 3 m, 3 m, 3 m', 2, 'Joka sekunti sama matka: nopeus on tasainen ja kuvaaja suora.'],
          ['5 m, 5 m, 5 m, 5 m', 2, 'Sama matka joka sekunti: tasainen nopeus.'],
        ] as [string, number, string][]);
        const rows = [0, 1, 2].flatMap((c) => pool.filter((q) => q[1] === c).slice(0, 2));
        const items = r.shuffle(rows);
        return {
          say: 'Sammakon matka jokaisen sekunnin aikana on mitattu. Lajittele: millainen matka–aika-kuvaajasta tulee?',
          task: { kind: 'sort' as const, items: items.map((q) => t(q[0])), cats: [{ label: 'Jyrkkenee ⤴ (nopeus kasvaa)' }, { label: 'Loivenee ⤵ (nopeus pienenee)' }, { label: 'Suora ↗ (tasainen)' }], answer: items.map((q) => q[1]), why: items.map((q) => q[2]) },
          hint: 'Kasvavatko, pienenevätkö vai pysyvätkö sekuntimatkat samoina?',
          explain: 'Kun joka sekunti kuljetaan pidempi matka, kuvaaja jyrkkenee. Kun lyhyempi, se loivenee. Sama matka joka sekunti = suora viiva.',
        };
      },
    }, (r) => {
      const shape = r.pick(['accel', 'decel'] as const), other = shape === 'accel' ? 'decel' : 'accel';
      return { say: `Mikä kuvaaja näyttää liikettä, jossa nopeus ${shape === 'accel' ? 'kasvaa' : 'pienenee'}?`, task: choose(r, { art: stArt(shape) }, [{ art: stArt(other) }, { art: stArt('steady') }], [other === 'decel' ? 'Tämä kuvaaja loivenee: nopeus pienenee.' : 'Tämä kuvaaja jyrkkenee: nopeus kasvaa.', 'Suora viiva tarkoittaa tasaista nopeutta.'], 3), hint: shape === 'accel' ? 'Nopeus kasvaa → joka sekunti pidempi matka → kuvaaja jyrkkenee.' : 'Nopeus pienenee → joka sekunti lyhyempi matka → kuvaaja loivenee.', explain: shape === 'accel' ? 'Kuvaaja jyrkkenee.' : 'Kuvaaja loivenee.' };
    }),
  },
  {
    id: 'PHY79-ACCEL-VT-GRAPH', stop: 'Kiihtyvyys kuvaajasta', icon: '📐', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    goal: 'Opit lukemaan kiihtyvyyden nopeus–aika-kuvaajasta: viivan jyrkkyys = nopeuden muutos jaettuna ajalla. Nouseva viiva → a > 0, vaakasuora → a = 0, laskeva → a < 0.',
    intro: 'Nopeus–aika-kuvaajan jyrkkyys on kiihtyvyys.',
    reward: 'Luet kiihtyvyyden kuvaajasta!',
    demo: () => [
      { say: 'Sammakko kiihdyttää tasaisesti. Mittari ja kynä näyttävät nopeuden joka hetki. Lopuksi piirretään kolmio: välillä 2–6 s nopeus kasvaa 8 m/s. a = 8 m/s / 4 s = 2 m/s².', scene: vtLiveScene([[0, 0], [10, 20]], 10, 20, 5, { tri: [2, 6], end: 'Jyrkkyys = Δv / Δt = 8 m/s / 4 s = 2 m/s². Sama tulos millä tahansa välillä, koska viiva on suora.' }) },
      { say: 'Nyt vaiheita on useampi: kiihdytys, tasainen vauhti, jarrutus ja taas tasainen vauhti. Seuraa, miten viivan suunta kertoo kiihtyvyyden merkin.', scene: vtLiveScene([[0, 0], [3, 12], [5, 12], [8, 3], [10, 3]], 10, 20, 5, { tri: [5, 7], end: 'Nousu: a > 0. Vaakasuora: a = 0. Lasku: a < 0 – välillä 5–7 s nopeus pienenee 6 m/s, joten a = −6 m/s / 2 s = −3 m/s².' }) },
    ],
    item: cases({
      steeper: (r) => {
        const [ka, kb] = r.shuffle([1, 2]) as [number, number];
        const best = ka > kb ? 0 : 1, lo = ka > kb ? 'B' : 'A';
        return { say: 'Kummalla veneellä on suurempi kiihtyvyys?', scene: paint(chart(VT, [{ pts: [[0, 0], [10, ka * 10]], color: 'var(--pond)', label: 'A' }, { pts: [[0, 0], [10, kb * 10]], color: 'var(--red)', label: 'B' }])), task: fixed(A_B_ACC, best, [0, 1, 2].map((i) => (i === best ? undefined : i === 2 ? 'Viivat eivät ole yhtä jyrkkiä: 10 sekunnissa nopeudet kasvavat eri verran.' : `${lo}:n viiva on loivempi: sen nopeus kasvaa 10 sekunnissa vain 10 m/s.`)), 3), hint: 'Katso hetkeä 10 s: kumman nopeus on kasvanut enemmän samassa ajassa?', explain: 'Jyrkempi nopeus–aika-viiva tarkoittaa suurempaa kiihtyvyyttä.' };
      },
      read: (r) => {
        const k = r.pick([1, 2]), v0 = k === 1 ? r.pick([0, 5]) : 0, v1 = v0 + k * 10;
        const w: Record<number, string> = { [k * 10]: `${k * 10} m/s on nopeuden muutos 10 sekunnissa. Jaa ajalla 10 s.` };
        if (v1 !== k * 10) w[v1] = `${v1} m/s on loppunopeus. Laske ensin muutos: ${v1} − ${v0}.`;
        if (k !== 1) w[1] = 'Yksi ruutu ylöspäin on 5 m/s, ei 1 m/s. Lue arvot asteikolta.';
        return wq(ask('Laske kiihtyvyys kuvaajasta.', k, 'm/s²', `10 s aikana nopeus kasvaa ${v0} → ${v1} m/s eli ${k * 10} m/s: a = ${k * 10} m/s / 10 s = ${k} m/s².`, chart(VT, [{ pts: [[0, v0], [10, v1]], color: 'var(--red)' }])), 'Lue nopeus alussa ja hetkellä 10 s. Muutos jaetaan ajalla.', w);
      },
      sign: (r) => {
        const s = r.pick(['accel', 'decel', 'steady'] as const), keys = ['accel', 'decel', 'steady'] as const;
        const why = { accel: 'Viiva nousee: nopeus kasvaa, joten a > 0.', decel: 'Viiva laskee: nopeus pienenee, joten a < 0.', steady: 'Viiva on vaakasuora: nopeus ei muutu, joten a = 0.' };
        return { say: 'Millainen on kiihtyvyys?', scene: paint(chart(VT, [{ pts: vtCurve(s), color: 'var(--red)' }])), task: fixed([t('Positiivinen (nopeus kasvaa)'), t('Negatiivinen (nopeus pienenee)'), t('Nolla (nopeus ei muutu)')], keys.indexOf(s), keys.map((k) => (k === s ? undefined : `Ei: ${why[s]}`)), 1), hint: 'Nouseeko, laskeeko vai pysyykö viiva vaakasuorana oikealle mentäessä?', explain: { accel: 'Viiva nousee: a > 0.', decel: 'Viiva laskee: a < 0.', steady: 'Vaakasuora: a = 0.' }[s] };
      },
      slopes: (r) => {
        const as = r.shuffle([0, r.pick([1, -2]), 3]);
        const pts: [number, number][] = [[0, 6]];
        as.forEach((a, i) => pts.push([(i + 1) * 2, pts[i]![1] + a * 2]));
        const lab = (a: number) => `${fmt(a)} m/s²`, segs = ['0–2 s', '2–4 s', '4–6 s'];
        return {
          say: 'Nopeus–aika-kuvaajassa on kolme osaa. Vedä jokaiselle välille sen kiihtyvyys. Yksi lappu jää yli.',
          scene: paint(chart({ ...VT, xMax: 6, xStep: 2, yMax: 15, yStep: 5 }, [{ pts, color: 'var(--red)', dots: true }])),
          task: { kind: 'place', slots: segs.map((x, i) => ({ id: `s${i}`, text: x })), tokens: r.shuffle([...as.map((a, i) => ({ id: `a${i}`, text: lab(a) })), { id: 'x', text: lab(6) }]), answer: Object.fromEntries(segs.map((_, i) => [`s${i}`, `a${i}`])), why: Object.fromEntries(as.map((a, i) => [`s${i}`, `Nopeus ${pts[i]![1]} → ${pts[i + 1]![1]} m/s eli muutos ${fmt(a * 2)} m/s ajassa 2 s: a = ${fmt(a * 2)} / 2 = ${fmt(a)} m/s².`])) } as Q['task'],
          hint: 'Jokainen väli kestää 2 s. Lue nopeus välin alussa ja lopussa, laske muutos ja jaa kahdella.',
          explain: `Ylimääräinen lappu 6 m/s² syntyy, jos nopeuden muutosta 6 m/s ei jaa ajalla 2 s.`,
        };
      },
    }, (r) => {
      const order = r.shuffle([0, 1, 2]);
      const slopes = [0, 1, 3];
      let v = 0; const pts: [number, number][] = [[0, 0]];
      order.forEach((o, i) => { v += slopes[o]! * 2; pts.push([(i + 1) * 3, v]); });
      const best = order.indexOf(2), lbl = ['0–3 s', '3–6 s', '6–9 s'];
      return { say: 'Millä välillä kiihtyvyys on suurin?', scene: paint(chart({ ...VT, xMax: 9, xStep: 3 }, [{ pts, color: 'var(--red)', dots: true }])), task: fixed(lbl.map((x) => t(x)), best, order.map((o, i) => (i === best ? undefined : `Välillä ${lbl[i]} nopeus muuttuu vain ${slopes[o]! * 2} m/s, kun jyrkimmällä välillä muutos on 6 m/s.`)), 3), hint: 'Missä viiva nousee jyrkimmin eli nopeus muuttuu eniten samassa ajassa?', explain: 'Suurin kiihtyvyys on siellä, missä nopeus–aika-viiva on jyrkin.' };
    }),
  },
  {
    id: 'PHY79-ACCEL-GRAPH', stop: 'Kaksi kuvaajaa', icon: '🔗', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    goal: 'Opit yhdistämään saman liikkeen matka–aika- ja nopeus–aika-kuvaajan: vaakasuora s–t ↔ v = 0, suora s–t ↔ vaakasuora v–t, jyrkkenevä s–t ↔ nouseva v–t, loivenevä s–t ↔ laskeva v–t.',
    intro: 'Sama liike voidaan näyttää matka–aika- ja nopeus–aika-kuvaajana. Yhdistä ne.',
    reward: 'Yhdistät liikkeen kuvaajat. Laboratorio on valmis!',
    demo: () => [
      { say: 'Katso sammakkoa ja kahta kynää yhtä aikaa. Ensin sammakko lepää, sitten kiihdyttää, loikkii tasaisesti ja lopuksi hidastaa. Vasen kuvaaja näyttää matkan, oikea nopeuden.', scene: dualLiveScene([[0, 0], [2, 0], [5, 6], [8, 6], [10, 2]], 10, 40, 8) },
      { say: 'Muistisääntö: nopeus–aika-kuvaajan korkeus kertoo, kuinka jyrkkä matka–aika-kuvaaja on. Tasainen liike: matka–aika on nouseva suora, nopeus–aika vaakasuora viiva.', scene: paint(`<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">${stArt('steady', 180)}${vtArt('steady', 180)}</div>`) },
    ],
    item: cases({
      ...Object.fromEntries((['rest', 'steady', 'accel'] as Shape[]).map((s) => [s, (r: Rng) => {
        const wrong = SHAPES.filter((k) => k !== s && k !== 'decel');
        return {
          say: 'Mikä nopeus–aika-kuvaaja kuuluu samaan liikkeeseen?', scene: paint(stArt(s, 260)),
          task: choose(r, { art: vtArt(s) }, wrong.map((k) => ({ art: vtArt(k) })), wrong.map((k) => `Tämä nopeus–aika-kuvaaja tarkoittaa: ${SHAPE_TEXT[k].toLowerCase()} Matka–aika-kuvaajasta näkyy kuitenkin: ${SHAPE_TEXT[s].toLowerCase()}`), 3),
          hint: 'Mitä matka–aika-kuvaaja kertoo: onko kappale paikallaan, tasaisessa liikkeessä vai kiihtyykö se? Etsi nopeus–aika-kuvaaja, joka kertoo saman.',
          explain: { rest: 'Matka ei muutu → nopeus on 0.', steady: 'Matka kasvaa tasaisesti → nopeus pysyy samana.', accel: 'Matka kasvaa yhä nopeammin → nopeus kasvaa.' }[s as 'rest' | 'steady' | 'accel'],
        };
      }])),
      pairs: (r) => {
        const pool = r.shuffle([
          ['Matka–aika: vaakasuora viiva', 0, 'Matka ei kasva: kappale on paikallaan, joten nopeus on 0.'],
          ['Matka pysyy 20 metrissä', 0, 'Paikka ei muutu: nopeus on 0.'],
          ['Matka–aika: nouseva suora', 1, 'Joka sekunti sama matka: nopeus pysyy samana, joten v–t on vaakasuora.'],
          ['Matka kasvaa joka sekunti 3 m', 1, 'Tasainen 3 m/s: nopeus–aika-kuvaaja on vaakasuora viiva korkeudella 3.'],
          ['Matka–aika: kaari jyrkkenee', 2, 'Joka sekunti pidempi matka: nopeus kasvaa, joten v–t nousee.'],
          ['Sekuntimatkat 1 m, 3 m, 5 m', 2, 'Sekuntimatkat kasvavat: nopeus kasvaa.'],
          ['Matka–aika: kaari loivenee', 3, 'Joka sekunti lyhyempi matka: nopeus pienenee, joten v–t laskee.'],
          ['Sekuntimatkat 6 m, 4 m, 2 m', 3, 'Sekuntimatkat lyhenevät: nopeus pienenee.'],
        ] as [string, number, string][]);
        const pick = [0, 1, 2, 3].map((c) => pool.find((q) => q[1] === c)!);
        const extra = pool.filter((q) => !pick.includes(q)).slice(0, 1);
        const items = r.shuffle([...pick, ...extra]);
        return {
          say: 'Lajittele: millainen nopeus–aika-kuvaaja kuuluu kuhunkin liikkeeseen?',
          task: { kind: 'sort' as const, items: items.map((q) => t(q[0])), cats: [{ label: 'v–t: nollassa ➖' }, { label: 'v–t: vaakasuora ➡️' }, { label: 'v–t: nousee ↗' }, { label: 'v–t: laskee ↘' }], answer: items.map((q) => q[1]), why: items.map((q) => q[2]) },
          hint: 'Mieti ensin, mitä nopeudelle tapahtuu: onko se 0, pysyykö se samana, kasvaako vai pieneneekö?',
          explain: 'Matka–aika-kuvaajan jyrkkyys on nopeus. Kun jyrkkyys kasvaa, v–t nousee; kun se pienenee, v–t laskee.',
        };
      },
    }, (r) => {
      const s = r.pick(['steady', 'accel', 'decel'] as const), wrong = (['steady', 'accel', 'decel'] as Shape[]).filter((k) => k !== s);
      return { say: 'Mikä matka–aika-kuvaaja kuuluu samaan liikkeeseen?', scene: paint(vtArt(s, 260)), task: choose(r, { art: stArt(s) }, wrong.map((k) => ({ art: stArt(k) })), wrong.map((k) => `Tämä matka–aika-kuvaaja tarkoittaa: ${SHAPE_TEXT[k].toLowerCase()} Nopeus–aika-kuvaajasta näkyy kuitenkin: ${SHAPE_TEXT[s].toLowerCase()}`), 3), hint: 'Lue ensin nopeus–aika-kuvaajasta, kasvaako, pieneneekö vai pysyykö nopeus. Nopeus on matka–aika-kuvaajan jyrkkyys.', explain: { steady: 'Vakionopeus → matka–aika on suora.', accel: 'Nopeus kasvaa → matka–aika jyrkkenee.', decel: 'Nopeus pienenee → matka–aika loivenee.' }[s] };
    }),
  },
];

function multiPick(r: Rng, want: 'dist' | 'time'): Q {
  const dist = r.shuffle(['200 m', '4 km', '35 cm', '1,5 km']).slice(0, 2);
  const time = r.shuffle(['35 s', '2 min', '1,5 h', '90 s']).slice(0, 2);
  const other = r.shuffle(['3 kg', '18 °C', '0,5 kg']).slice(0, 2);
  const all = r.shuffle([...dist.map((x) => ({ x, k: 'dist' })), ...time.map((x) => ({ x, k: 'time' })), ...other.map((x) => ({ x, k: 'other' }))]);
  return {
    say: `Valitse kaikki ${want === 'dist' ? 'matkat' : 'ajat'}.`,
    task: { kind: 'multi', options: all.map((e) => t(e.x)), answer: all.flatMap((e, i) => (e.k === want ? [i] : [])), cols: 3, why: all.map((e) => e.k === want ? `${e.x} on ${want === 'dist' ? 'matka: m, cm ja km ovat pituuden yksiköitä' : 'aika: s, min ja h ovat ajan yksiköitä'}. Valitse sekin.` : e.k === 'other' ? `${e.x} ei ole matka eikä aika: ${e.x.includes('kg') ? 'kg on massan' : '°C on lämpötilan'} yksikkö.` : `${e.x} on ${want === 'dist' ? 'aika' : 'matka'}, ei ${want === 'dist' ? 'matka' : 'aika'}.`) },
    hint: want === 'dist' ? 'Matkan yksiköitä ovat cm, m ja km.' : 'Ajan yksiköitä ovat s, min ja h.',
    explain: want === 'dist' ? `Matkan yksiköt ovat pituuden yksiköitä: ${dist.join(', ')}.` : `Ajan yksiköitä ovat s, min ja h: ${time.join(', ')}.`,
  };
}
