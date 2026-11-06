// Pond laboratory, mathematics (grades 7–9): integers, fraction × fraction, equations,
// proportion, unit conversion, dependence, functions, lines and slope.
import type { Item, NodeSpec, Option, Task } from '../engine/types';
import type { Operation } from '../engine/item-readiness';
import { fmt } from './fi';
import { cases, chart, choose, fixed, paint, table, txt, withItemReadiness } from './kit';
import { areaModel, balanceArt, clipLine, fracText, gridArt, neg, numberLineArt } from './pics';
import { AUDIT_REV, LAUNCH_REV, LIGHT_REV } from './audit-rev';
import { stairScene } from './phyanim';
import { iceHops, lineSortScene, midScene, takeNegScene, thermoScene } from './neganim';
import { balanceSolveScene, dependScene, funcMachineScene, graphPlotScene, kbScene, mixScene, partOfPartScene, slopeScene } from './alg79anim';

type Q = Omit<Item, 'tag'>;
const t = (s: string): Option => txt(s, false);
const card = (...lines: string[]) => paint(`<div class="formula">${lines.join('<br>')}</div>`);
const ask = (say: string, answer: number, unit: string, explain: string, scene?: string, hint?: string): Q =>
  ({ say, scene: scene ? paint(scene) : undefined, task: { kind: 'numeric', answer, unit }, explain, hint });
const N = neg;
/** Adds whyAt feedback to a numeric item; keys are rounded and keys equal to the answer dropped. */
const cap = (x: string) => x[0]!.toUpperCase() + x.slice(1);
const DEP_PAIRS: [string, boolean, string][] = [
  ['taksimatkan hinta ja ajettu matka', true, 'Pidempi matka maksaa enemmän.'],
  ['kynttilän pituus ja palamisaika', true, 'Mitä kauemmin kynttilä palaa, sitä lyhyempi se on.'],
  ['ostettujen jäätelöiden määrä ja hinta', true, 'Jokainen jäätelö lisää hintaa.'],
  ['kävelty matka ja kävelyaika', true, 'Mitä kauemmin kävelet, sitä pidemmälle pääset.'],
  ['sammakon nimi ja sen hypyn pituus', false, 'Nimen vaihtaminen ei muuta hyppyä.'],
  ['oppilaan pituus ja hänen puhelinnumeronsa', false, 'Puhelinnumero ei muutu, vaikka oppilas kasvaa.'],
  ['viikonpäivä ja veden kiehumislämpötila', false, 'Vesi kiehuu samassa lämpötilassa joka päivä.'],
  ['kengän väri ja juoksunopeus', false, 'Värin vaihtaminen ei muuta nopeutta.'],
];
const wy = (q: Q, whyAt: Record<number, string>): Q => {
  if (q.task.kind !== 'numeric') return q;
  const ans = q.task.answer, w: Record<number, string> = {};
  for (const [k, v] of Object.entries(whyAt)) { const x = +(+k).toFixed(6); if (Math.abs(x - ans) > 1e-9) w[x] = v; }
  return { ...q, task: { ...q.task, whyAt: w } };
};
const STAIR_OPS = ['· 10', '· 100', '· 1000', ': 10', ': 100', ': 1000'];
const STAIR_PAIRS: [string, string, string][] = [
  ['m → cm', '· 100', 'm → dm → cm: kaksi askelta alas, · 100.'],
  ['m → mm', '· 1000', 'm → dm → cm → mm: kolme askelta alas, · 1000.'],
  ['km → m', '· 1000', 'km → hm → dam → m: kolme askelta alas, · 1000.'],
  ['cm → mm', '· 10', 'Yksi askel alas: · 10.'],
  ['dm → cm', '· 10', 'Yksi askel alas: · 10.'],
  ['cm → m', ': 100', 'cm → dm → m: kaksi askelta ylös, : 100.'],
  ['mm → m', ': 1000', 'mm → cm → dm → m: kolme askelta ylös, : 1000.'],
  ['m → km', ': 1000', 'm → dam → hm → km: kolme askelta ylös, : 1000.'],
  ['mm → cm', ': 10', 'Yksi askel ylös: : 10.'],
  ['mm → dm', ': 100', 'mm → cm → dm: kaksi askelta ylös, : 100.'],
];
const P = (x: number, y: number) => `(${N(x)}, ${N(y)})`;
const fr = (a: number, b: number): Option => ({ art: `<div class="big-frac">${fracText(a, b)}</div>`, speak: `${a}/${b}` });
const line = (answer: number, min = -10, max = 10, labelEvery = 5): Task => ({ kind: 'line', min, max, step: 1, answer, labelEvery });
const YESNO = (yes: boolean, whyNo?: string, whyYes?: string) => fixed([t('Kyllä'), t('Ei')], yes ? 0 : 1, yes ? [undefined, whyNo] : [whyYes, undefined], 2);
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
/** Fraction multiple choice; wrong fractions equal (as text) to the right one or to each other are dropped with their whys. */
const fracChoice = (r: Parameters<typeof choose>[0], n: number, d: number, wrongs: [number, number, string][]): Task => {
  const seen = new Set([`${n}/${d}`]), ok = wrongs.filter(([p, q]) => { const k = `${p}/${q}`; if (seen.has(k)) return false; seen.add(k); return true; });
  return choose(r, fr(n, d), ok.map(([p, q]) => fr(p, q)), ok.map((w) => w[2]));
};
const lin = (k: number, b: number) => `y = ${k === 1 ? '' : k === -1 ? '−' : N(k)}x${b ? ` ${b < 0 ? '−' : '+'} ${Math.abs(b)}` : ''}`;
const box = { xMin: -5, xMax: 5, yMin: -4, yMax: 4 };
const graph = (ls: { k: number; b: number; label?: string; color?: string }[], pins: { x: number; y: number; label?: string }[] = []) =>
  gridArt({ ...box, sea: false, w: 300, pins: pins.map((p) => ({ ...p, icon: 'dot' as const })), lines: ls.map((l) => ({ pts: clipLine(l.k, l.b, box.xMin, box.xMax, box.yMin, box.yMax), color: l.color, label: l.label })) });
const plot4 = (xs: number[], ys: number[]): Task => ({ kind: 'plot', xs, ys, ...box, xStep: 1, yStep: 1, xLabel: 'x', yLabel: 'y' });

export const ALGEBRA79_NODES: NodeSpec[] = [
  // ============================================================ luvut: integers
  {
    id: 'M79-INT-ORDER', stop: 'Pakkasjärjestys', icon: '🌡️', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    goal: 'Opit vertaamaan ja järjestämään negatiivisia ja positiivisia kokonaislukuja lukusuoran avulla: oikealla on aina suurempi.',
    intro: 'Talvinen lampi. Negatiiviset luvut järjestetään lukusuoralla: oikealla aina suurempi.',
    reward: 'Järjestät kokonaisluvut varmasti!',
    demo: () => [
      { say: 'Neljä lukua lentää paikoilleen lukusuoralle. Sitten lamppu kulkee vasemmalta oikealle ja poimii ne järjestykseen.', scene: lineSortScene([-3, 5, -8, 0], -10, 10) },
      { say: 'Pakkasella mittarin pinta laskee. −3 °C on lämpimämpi kuin −7 °C: pinta on korkeammalla. Siksi −3 > −7, vaikka 7 on suurempi kuin 3.', scene: thermoScene([{ from: 0, to: -3, label: 'Kuopio', say: '−3 °C' }, { from: 0, to: -7, label: 'Oulu', say: '−7 °C: kylmempi, siis pienempi.' }]) },
    ],
    item: cases({
      compare: (r) => {
        const [a, b] = r.shuffle([-r.int(6, 12), -r.int(1, 5)]);
        return { say: `Kumpi on suurempi: ${N(a!)} vai ${N(b!)}?`, task: choose(r, { big: N(Math.max(a!, b!)) }, [{ big: N(Math.min(a!, b!)) }], [`${N(Math.min(a!, b!))} on kauempana nollasta vasemmalla, joten se on pienempi.`], 2), hint: 'Kumpi on lukusuoralla oikeammalla? Ajattele lämpömittaria: kumpi on lämpimämpi?', explain: `${N(Math.max(a!, b!))} on oikeammalla lukusuoralla.` };
      },
      sign: (r) => {
        const a = r.int(-12, 6), b = a + r.pick([-5, -3, -2, 2, 3, 5]);
        return { say: `Kumpi merkki: ${N(a)} □ ${N(b)}?`, task: fixed([{ big: '<' }, { big: '>' }], a < b ? 0 : 1, a < b ? [undefined, `Kärki osoittaisi lukuun ${N(b)}, mutta pienempi on ${N(a)}: se on vasemmalla.`] : [`Kärki osoittaisi lukuun ${N(a)}, mutta pienempi on ${N(b)}: se on vasemmalla.`, undefined], 2), hint: 'Kärki osoittaa pienempään.', explain: `${N(a)} ${a < b ? '<' : '>'} ${N(b)}: ${N(Math.max(a, b))} on oikeammalla.` };
      },
      order: (r) => {
        const v = [-r.int(7, 12), -r.int(2, 6), r.int(0, 2), r.int(3, 9)];
        const s = (l: number[]) => t(l.map(N).join(', '));
        const byAbs = [v[2]!, v[1]!, v[3]!, v[0]!].sort((x, y) => Math.abs(x) - Math.abs(y));
        const wr = ([[s(byAbs), 'Tässä on järjestetty etäisyyden nollasta mukaan, ei lukusuoran mukaan.'], [s([v[1]!, v[0]!, v[2]!, v[3]!]), `Negatiiviset ovat väärin päin: ${N(v[0]!)} on pienempi kuin ${N(v[1]!)}.`]] as [Option, string][]).filter(([o]) => o.text !== s(v).text);
        return {
          say: 'Mikä on järjestys pienimmästä suurimpaan?',
          scene: paint(`<div class="formula">${r.shuffle(v).map(N).join('   ')}</div>`),
          task: choose(r, s(v), wr.map((w) => w[0]), wr.map((w) => w[1]), 1),
          hint: 'Aloita vasemmanpuoleisimmasta: kumpi negatiivisista on kauempana nollasta?',
          explain: `Lukusuoralla vasemmalta oikealle: ${v.map(N).join(' < ')}.`,
        };
      },
      place: (r) => { const v = -r.int(2, 9); return { say: `Napauta lukusuoralta ${N(v)}.`, task: { ...line(v), whyAt: { [-v]: `Tämä on ${-v}, nollasta oikealle. Miinusmerkkinen luku on vasemmalla.`, [v + 1]: 'Yksi askel liian lähellä nollaa. Laske askeleet nollasta.', [v - 1]: 'Yksi askel liian kauas. Laske askeleet nollasta.' } }, hint: 'Negatiiviset luvut ovat nollasta vasemmalle.', explain: `${N(v)} on ${-v} askelta nollasta vasemmalle.` }; },
      split: (r) => {
        const p = -r.int(3, 6), pool = r.shuffle([p - r.int(1, 5), p - r.int(6, 9), p + r.int(1, 2), p + r.int(3, 6), r.int(1, 8), 0].filter((x, i, a) => a.indexOf(x) === i && x !== p)).slice(0, 5);
        return {
          say: `Lajittele luvut: ovatko ne pienempiä vai suurempia kuin ${N(p)}?`,
          task: { kind: 'sort' as const, items: pool.map((x) => t(N(x))), cats: [{ label: `Pienempi kuin ${N(p)} ❄️` }, { label: `Suurempi kuin ${N(p)} ☀️` }], answer: pool.map((x) => (x < p ? 0 : 1)), why: pool.map((x) => (x < p ? `${N(x)} on lukusuoralla vasemmalla puolella lukua ${N(p)}.` : `${N(x)} on lukusuoralla oikealla puolella lukua ${N(p)}.`)) },
          hint: `Kuvittele lukusuora. Kaikki ${N(p)}:n vasemmalla puolella olevat ovat pienempiä.`,
          explain: `Pienempiä: ${pool.filter((x) => x < p).map(N).join(', ') || 'ei yhtään'}. Suurempia: ${pool.filter((x) => x > p).map(N).join(', ') || 'ei yhtään'}.`,
        };
      },
    }, (r) => {
      const towns = r.shuffle([['Oulu', -r.int(8, 12)], ['Kuopio', -r.int(3, 7)], ['Inari', -r.int(15, 22)]] as [string, number][]);
      const warm = towns.reduce((a, b) => (b[1] > a[1] ? b : a));
      return {
        say: 'Missä kaupungissa oli lämpimintä?',
        scene: paint(table(['Kaupunki', '°C'], towns.map(([n, v]) => [n, N(v)]))),
        task: choose(r, t(warm[0]), towns.filter((x) => x !== warm).map(([n]) => t(n)), towns.filter((x) => x !== warm).map(([, v]) => `${N(v)} on kylmempi kuin ${N(warm[1])}.`)),
        hint: 'Lämpimin on suurin luku: se, joka on lähimpänä nollaa.',
        explain: `Suurin lämpötila on lämpimin: ${N(warm[1])} °C (${warm[0]}).`,
      };
    }),
  },
  {
    id: 'M79-INT-DIST', stop: 'Etäisyys jäällä', icon: '📏', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    goal: 'Opit laskemaan kahden kokonaisluvun etäisyyden lukusuoralla ja luvun itseisarvon: etäisyys on askelten määrä, ei koskaan negatiivinen.',
    intro: 'Kahden luvun etäisyys on askelten määrä lukusuoralla. Etäisyys ei ole koskaan negatiivinen.',
    reward: 'Mittaat etäisyyksiä lukusuoralla!',
    demo: () => [
      { say: 'Lukujen −4 ja 3 etäisyys: Loikka hyppää ensin nollaan ja sitten lukuun 3. Laske hypyt.', scene: iceHops(-6, 6, [{ from: -4, to: 0, say: '4 askelta nollaan.' }, { from: 0, to: 3, color: 'var(--blue)', say: '3 askelta lisää.' }], 'Eri puolilla nollaa askeleet lasketaan yhteen: 4 + 3 = 7.') },
      { say: 'Kun luvut ovat nollan samalla puolella, hypätään suoraan. Lukujen −9 ja −4 etäisyys on 5 askelta.', scene: iceHops(-10, 2, [{ from: -9, to: -4, say: '5 askelta.' }], 'Samalla puolella: 9 − 4 = 5. Nollan kautta ei kuljeta.') },
      { say: 'Luvun etäisyys nollasta on sen itseisarvo. Kumpikin hyppää nollaan.', scene: iceHops(-7, 7, [{ from: -6, to: 0, say: '|−6| = 6' }, { from: 6, to: 0, color: 'var(--blue)', say: '|6| = 6' }], 'Itseisarvo on aina positiivinen tai nolla.') },
    ],
    item: cases({
      across: (r) => {
        const a = -r.int(1, 8), b = r.int(1, 8);
        return wy(ask(`Kuinka kaukana toisistaan ovat ${N(a)} ja ${b}?`, b - a, '', `${-a} askelta nollaan ja ${b} siitä: ${b - a}.`, numberLineArt({ min: -10, max: 10, labelEvery: 5, marks: [{ v: a, label: N(a) }, { v: b, label: String(b), color: 'var(--blue)' }] }), 'Laske askeleet nollaan ja nollasta eteenpäin.'),
          { [Math.abs(b + a)]: 'Vähensit numerot toisistaan. Luvut ovat nollan eri puolilla, joten askeleet lasketaan yhteen.', [a - b]: 'Etäisyys ei ole koskaan negatiivinen.' });
      },
      same: (r) => {
        const a = -r.int(6, 12), b = -r.int(1, 5);
        return wy(ask(`Kuinka kaukana toisistaan ovat ${N(a)} ja ${N(b)}?`, b - a, '', `Molemmat ovat nollan samalla puolella: ${-a} − ${-b} = ${b - a}.`, undefined, 'Molemmat ovat nollan vasemmalla puolella. Kulkeeko matka nollan kautta?'),
          { [-a - b]: 'Laskit yhteen, mutta luvut ovat nollan samalla puolella: matka ei kulje nollan kautta. Vähennä.', [a - b]: 'Etäisyys ei ole koskaan negatiivinen.' });
      },
      abs: (r) => { const a = -r.int(2, 15); return wy(ask(`|${N(a)}| = ?`, -a, '', `${N(a)} on ${-a} askeleen päässä nollasta.`, undefined, 'Itseisarvo on luvun etäisyys nollasta.'), { [a]: 'Itseisarvo on etäisyys, eikä se ole koskaan negatiivinen.' }); },
      pairs: (r) => {
        for (;;) {
          const x = r.int(2, 7), y = r.int(2, 7), p = r.int(7, 12), q = r.int(1, 5), m = r.int(3, 11);
          const ans = [x + y, p - q, m], dec = Math.abs(x - y) || p + q;
          if (new Set([...ans, dec]).size < 4) continue;
          const rows: [string, number, string][] = [[`${N(-x)} ja ${y}`, ans[0]!, `Eri puolilla nollaa: ${x} + ${y} = ${x + y}.`], [`${N(-p)} ja ${N(-q)}`, ans[1]!, `Samalla puolella: ${p} − ${q} = ${p - q}.`], [`|${N(-m)}|`, ans[2]!, `${N(-m)} on ${m} askeleen päässä nollasta.`]];
          return {
            say: 'Yhdistä jokainen pari oikeaan etäisyyteen. Yksi lappu jää yli.',
            task: { kind: 'place', slots: rows.map(([s], i) => ({ id: `s${i}`, text: `${s} → ▢` })), tokens: r.shuffle([...rows.map(([, v], i) => ({ id: `d${i}`, text: String(v) })), { id: 'x', text: String(dec) }]), answer: Object.fromEntries(rows.map((_, i) => [`s${i}`, `d${i}`])), why: Object.fromEntries(rows.map(([, , w], i) => [`s${i}`, w])) },
            hint: 'Ovatko luvut nollan eri puolilla (lisää) vai samalla puolella (vähennä)?',
            explain: `Lappu ${dec} jää yli${dec === Math.abs(x - y) ? `: se tulisi, jos lukujen ${N(-x)} ja ${y} numerot vähennettäisiin toisistaan.` : '.'}`,
          };
        }
      },
    }, (r) => {
      const d = r.int(5, 15), h = r.int(4, 12);
      return wy(ask(`Sukeltaja on ${d} m merenpinnan alapuolella (${N(-d)} m). Lokki lentää ${h} m yläpuolella. Kuinka kaukana ne ovat toisistaan pystysuunnassa?`, d + h, 'm', `${d} m pintaan ja ${h} m siitä ylös: ${d + h} m.`, undefined, 'Merenpinta on nolla. Laske matka pintaan ja pinnasta ylös.'),
        { [Math.abs(d - h)]: 'Merenpinta on niiden välissä, joten matkat lasketaan yhteen.', [h - d]: 'Etäisyys ei ole koskaan negatiivinen.' });
    }),
  },
  {
    id: 'M79-INT-01', stop: 'Lukusuoran mestari', icon: '🎯', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    goal: 'Opit hyppimään lukusuoralla nollan yli, etsimään kahden luvun puolivälin ja päättelemään, kumpi luku on lähempänä.',
    intro: 'Yhdistetään järjestys ja etäisyys: hypitään, verrataan ja etsitään puolivälejä.',
    reward: 'Lukusuora on hallussasi!',
    demo: () => [
      { say: 'Kohdasta −3 seitsemän askelta oikealle: ensin 3 askelta nollaan, sitten 4 lisää.', scene: iceHops(-6, 6, [{ from: -3, to: 0, say: '3 askelta nollaan.' }, { from: 0, to: 4, color: 'var(--blue)', say: '4 askelta lisää.' }], '3 + 4 = 7 askelta: päädytään lukuun 4.') },
      { say: 'Puoliväli: kaksi sammakkoa hyppää yhtä aikaa toisiaan kohti. Missä ne kohtaavat?', scene: midScene(-7, 3, -8, 6) },
    ],
    item: cases({
      jump: (r) => {
        const a = -r.int(2, 8), d = r.int(3, 12), right = r.chance(0.6);
        const e = right ? a + d : a - Math.min(d, 10 + a), s = Math.abs(e - a);
        return { say: `Aloita kohdasta ${N(a)} ja hyppää ${s} askelta ${right ? 'oikealle' : 'vasemmalle'}. Napauta, mihin päädyt.`, task: { ...line(e), whyAt: { [2 * a - e]: `Hyppäsit väärään suuntaan: ${right ? 'oikealle' : 'vasemmalle'} tarkoittaa ${right ? 'suurempia' : 'pienempiä'} lukuja.`, [e + (right ? -1 : 1)]: 'Yksi askel jäi hyppäämättä. Laske askeleet uudelleen.', [e + (right ? 1 : -1)]: 'Yksi askel liikaa. Laske askeleet uudelleen.' } }, hint: right && e > 0 ? `Ensin ${-a} askelta nollaan, sitten loput ${s + a} askelta.` : `Laske ${s} askelta ${right ? 'oikealle' : 'vasemmalle'} kohdasta ${N(a)}.`, explain: `${N(a)} ${right ? '+' : '−'} ${s} = ${N(e)}.` };
      },
      mid: (r) => {
        const m = r.int(-5, 3), h = r.int(2, 5);
        return wy(ask(`Mikä luku on lukujen ${N(m - h)} ja ${N(m + h)} puolivälissä?`, m, '', `Väli on ${2 * h} askelta, puolet siitä ${h}: ${N(m - h)} + ${h} = ${N(m)}.`, undefined, 'Laske välin pituus askelina ja ota siitä puolet. Lähde pienemmästä luvusta.'),
          { [h]: `${h} on puolet välin pituudesta, ei puoliväli. Lisää se pienempään lukuun ${N(m - h)}.`, [2 * h]: `${2 * h} on koko välin pituus.`, [2 * m]: 'Laskit luvut yhteen, mutta et jakanut kahdella.' });
      },
      closer: (r) => {
        const c = r.int(-3, 1), a = c - r.int(2, 6), b0 = c + r.int(1, 7), b = c - a === b0 - c ? b0 + 1 : b0;
        const near = c - a < b - c ? a : b, far = near === a ? b : a;
        return { say: `Kumpi on lähempänä lukua ${N(c)}: ${N(a)} vai ${N(b)}?`, task: choose(r, { big: N(near) }, [{ big: N(far) }], [`${N(far)} on ${Math.abs(far - c)} askeleen päässä, ${N(near)} vain ${Math.abs(near - c)}.`], 2), hint: `Laske askeleet luvusta ${N(c)} kumpaankin lukuun.`, explain: `Etäisyydet: ${c - a} ja ${b - c}. Lähempänä on ${N(near)}.` };
      },
      land: (r) => {
        for (;;) {
          const rows = [0, 1, 2].map(() => { const a = r.int(-8, 4), d = r.int(2, 9), right = r.chance(0.5); return { a, d, right, e: right ? a + d : a - d }; });
          const ends = rows.map((x) => x.e), dec = -rows[0]!.e;
          if (ends.some((e) => e < -12 || e > 12) || new Set([...ends, dec]).size < 4 || rows.every((x) => !((x.a < 0) !== (x.e < 0)))) continue;
          return {
            say: 'Mihin sammakko päätyy? Yhdistä jokainen hyppy oikeaan paikkaan. Yksi lappu jää yli.',
            task: { kind: 'place', slots: rows.map((x, i) => ({ id: `s${i}`, text: `${N(x.a)}, ${x.d} ${x.right ? 'oikealle' : 'vasemmalle'} → ▢` })), tokens: r.shuffle([...rows.map((x, i) => ({ id: `e${i}`, text: N(x.e) })), { id: 'x', text: N(dec) }]), answer: Object.fromEntries(rows.map((_, i) => [`s${i}`, `e${i}`])), why: Object.fromEntries(rows.map((x, i) => [`s${i}`, `${N(x.a)} ${x.right ? '+' : '−'} ${x.d} = ${N(x.e)}.`])) },
            hint: 'Oikealle luvut kasvavat, vasemmalle pienenevät. Kun ylität nollan, laske ensin askeleet nollaan.',
            explain: `Lappu ${N(dec)} jää yli: siinä ensimmäisen hypyn tuloksen etumerkki on väärin.`,
          };
        }
      },
    }, (r) => {
      const a = -r.int(4, 12), b = r.int(1, 8);
      return wy(ask(`Yöllä oli ${N(a)} °C ja iltapäivällä ${b} °C. Kuinka monta astetta lämpötila nousi?`, b - a, '°C', `Nollaan ${-a} astetta ja siitä ${b}: ${b - a} astetta.`, undefined, 'Laske asteet nollaan asti ja nollasta ylöspäin.'),
        { [Math.abs(b + a)]: 'Vähensit numerot toisistaan. Lämpötila nousi nollan yli, joten asteet lasketaan yhteen.', [a - b]: 'Lämpötila nousi, joten muutos on positiivinen.' });
    }),
  },
  {
    id: 'M79-INT-SUB', stop: 'Muutoksen laskija', icon: '➖', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    goal: 'Opit vähentämään kokonaislukuja: muutos on loppu − alku, ja negatiivisen luvun vähentäminen on sama kuin vastaluvun lisääminen.',
    intro: 'Muutos lasketaan aina: loppu − alku. Jos lopussa on vähemmän, muutos on negatiivinen.',
    reward: 'Vähennät kokonaislukuja myös miinuksen puolella!',
    demo: () => [
      { say: 'Lämpötila muuttuu −3 asteesta −10 asteeseen. Katso mittaria: pinta laskee 7 astetta. Muutos on loppu − alku: −10 − (−3) = −7.', scene: thermoScene([{ from: -3, to: -10, label: 'muutos', say: 'Laski 7 astetta: muutos on −7.' }]) },
      { say: 'Miksi 5 − (−3) on 8? Pitää ottaa pois kolme miinusnappia, mutta niitä ei ole. Lisätään ensin nollapareja ja otetaan sitten miinukset pois.', scene: takeNegScene(5, -3) },
      { say: 'Sama toimii negatiivisesta luvusta: −2 − (−5).', scene: takeNegScene(-2, -5) },
    ],
    item: cases({
      subNeg: (r) => { const a = r.int(-6, 9), b = r.int(2, 8); return wy(ask(`${N(a)} − (−${b}) = ?`, a + b, '', `Negatiivisen vähentäminen = vastaluvun lisääminen: ${N(a)} + ${b} = ${N(a + b)}.`, undefined, `Miinus miinus: −(−${b}) on sama kuin +${b}.`), { [a - b]: `Vähensit ${b}. Negatiivisen luvun vähentäminen lisää: ${N(a)} + ${b}.`, [-(a + b)]: 'Etumerkki on väärin päin.' }); },
      down: (r) => { const a = -r.int(1, 8), b = r.int(2, 9); return wy(ask(`${N(a)} − ${b} = ?`, a - b, '', `Lähdetään kohdasta ${N(a)} ja mennään ${b} vasemmalle: ${N(a - b)}.`, undefined, `Lähde kohdasta ${N(a)} ja mene ${b} askelta vasemmalle.`), { [a + b]: 'Menit oikealle. Positiivisen vähentäminen vie vasemmalle.', [-a - b]: `Aloitit kohdasta ${-a}, mutta lähtö on ${N(a)}.`, [b - a]: 'Etumerkki on väärin päin: tulos on nollan vasemmalla puolella.' }); },
      change: (r) => {
        const s = r.int(-8, 3), e = s - r.int(2, 9) * (r.chance(0.5) ? 1 : -1);
        return wy(ask(`Lämpötila muuttui ${N(s)} asteesta ${N(e)} asteeseen. Laske muutos (loppu − alku).`, e - s, '°C', `${N(e)} − (${N(s)}) = ${N(e - s)}. ${e < s ? 'Negatiivinen: kylmeni.' : 'Positiivinen: lämpeni.'}`, undefined, `Loppu − alku: ${N(e)} − (${N(s)}). ${e < s ? 'Kylmenikö?' : 'Lämpenikö?'}`), { [s - e]: `Laskit alku − loppu. Muutos on loppu − alku, joten etumerkki kääntyy.` });
      },
      rewrite: (r) => {
        const a = r.int(2, 9), b = r.int(2, 8), c = -r.int(1, 6), d = r.int(2, 7), e = -r.int(3, 9), f = r.int(1, 5);
        const rows: [string, string, string][] = [[`${a} − (−${b})`, `${a} + ${b}`, `Miinus miinus muuttuu plussaksi: −(−${b}) = +${b}.`], [`${N(c)} − ${d}`, `${N(c)} + (−${d})`, `Positiivisen vähentäminen = negatiivisen lisääminen: −${d} = + (−${d}).`], [`${N(e)} − (−${f})`, `${N(e)} + ${f}`, `−(−${f}) = +${f}.`]];
        return {
          say: 'Muuta jokainen vähennyslasku yhteenlaskuksi. Yksi lappu jää yli.',
          task: { kind: 'place', slots: rows.map(([s], i) => ({ id: `s${i}`, text: `${s} → ▢` })), tokens: r.shuffle([...rows.map(([, v], i) => ({ id: `r${i}`, text: v })), { id: 'x', text: `${a} + (−${b})` }]), answer: Object.fromEntries(rows.map((_, i) => [`s${i}`, `r${i}`])), why: Object.fromEntries(rows.map(([, , w], i) => [`s${i}`, w])) },
          hint: 'Vähentäminen = vastaluvun lisääminen. Vaihda miinus plussaksi ja käännä perässä tulevan luvun etumerkki.',
          explain: `Lappu ”${a} + (−${b})” jää yli: siinä vastaluku jäi ottamatta, joten se olisi sama kuin ${a} − ${b}.`,
        };
      },
    }, (r) => {
      const a = -r.int(5, 12), b = r.int(1, 7);
      return wy(ask(`Aamulla ${N(a)} °C, iltapäivällä ${b} °C. Paljonko lämpötila muuttui? Kirjoita lasku loppu − alku.`, b - a, '°C', `${b} − (${N(a)}) = ${b} + ${-a} = ${b - a}.`, undefined, `Loppu − alku = ${b} − (${N(a)}). Miinus miinus on plus.`), { [b + a]: `Laskit ${b} − ${-a}. Alku on ${N(a)}, ja negatiivisen vähentäminen lisää.`, [a - b]: 'Laskit alku − loppu. Lämpeni, joten muutos on positiivinen.' });
    }),
  },

  // ============================================================ yhtalot
  {
    id: 'M79-FRAC-MUL', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Reseptin pienennys', icon: '🧁',
    goal: 'Opit kertomaan murtoluvun murtoluvulla: a/b · c/d on osa osasta, ja sen saa kertomalla osoittajat ja nimittäjät keskenään.',
    intro: 'Murtoluku kertaa murtoluku: osa osasta. Pinta-alamalli näyttää vastauksen.',
    reward: 'Osaat ottaa osan osasta!',
    demo: () => [
      { say: 'Kaksi kolmasosaa kertaa kolme neljäsosaa: ensin otetaan 3/4 neliöstä, sitten siitä 2/3. Seuraa, miten päällekkäiset ruudut lasketaan.', scene: partOfPartScene(2, 3, 3, 4) },
      { say: 'Puolet kolmesta neljäsosasta: 1/2 · 3/4. Ruutuja on 2 · 4 = 8, ja tummia 1 · 3 = 3. Tulos on 3/8.', scene: partOfPartScene(1, 2, 3, 4, 'kakusta') },
      { say: 'Sääntö: osoittajat kerrotaan keskenään ja nimittäjät keskenään. Yhteenlaskua ei tarvita, eikä samannimisiksi laventamista.', scene: card('a/b · c/d = (a·c)/(b·d)', '2/3 · 3/4 = 6/12 = 1/2') },
    ],
    item: cases({
      area: (r) => {
        const b = r.int(2, 4), d = r.int(3, 5), a = r.int(1, b - 1), c = r.int(1, d - 1);
        return {
          say: `Mikä osa neliöstä on tummimmalla alueella? Se on ${a}/${b} · ${c}/${d}.`,
          scene: paint(areaModel(a, b, c, d)),
          task: fracChoice(r, a * c, b * d, [[a + c, b + d, 'Murtolukuja ei kerrota laskemalla yhteen: laske tummat ruudut ja kaikki ruudut.'], [a * c, b + d, `Nimittäjä on kaikkien ruutujen määrä: ${b} riviä kertaa ${d} saraketta.`]]),
          hint: 'Laske tummimmat ruudut ja kaikki ruudut. Kumpikin on rivit kertaa sarakkeet.',
          explain: `${a} · ${c} = ${a * c} tummaa ruutua, kaikkiaan ${b} · ${d} = ${b * d}: ${a * c}/${b * d}.`,
        };
      },
      calc: (r) => {
        const a = r.int(1, 4), b = r.int(a + 1, 6), c = r.int(1, 4), d = r.int(c + 1, 7);
        return {
          say: `${a}/${b} · ${c}/${d} = ?`,
          task: fracChoice(r, a * c, b * d, [[a * d, b * c, 'Tämä olisi jakolasku: toista murtolukua ei käännetä kertolaskussa.'], [a + c, b * d, 'Osoittajat kerrotaan, ei lasketa yhteen.'], [a * c, b + d, 'Nimittäjät kerrotaan, ei lasketa yhteen.']]),
          hint: 'Osoittaja kertaa osoittaja, nimittäjä kertaa nimittäjä.',
          explain: `Osoittajat ${a} · ${c} = ${a * c}, nimittäjät ${b} · ${d} = ${b * d}.`,
        };
      },
      half: (r) => {
        const b = r.pick([3, 4, 5, 8]), a = r.int(1, b - 1);
        return {
          say: `Paljonko on puolet luvusta ${a}/${b}?`,
          task: fracChoice(r, a, 2 * b, [[2 * a, b, 'Tämä on kaksinkertainen, ei puolet.'], [a, b > 2 ? b - 2 : b + 2, 'Nimittäjää ei muuteta kahdella: jokainen osa puolitetaan, joten osia tulee kaksi kertaa enemmän.']]),
          hint: `Puolet on 1/2 · ${a}/${b}. Kun jokainen ${b}-osa puolitetaan, osia on kaksi kertaa enemmän.`,
          explain: `1/2 · ${a}/${b} = ${a}/${2 * b}.`,
        };
      },
      match: (r) => {
        const rows: [number, number, number, number][] = [];
        while (rows.length < 3) {
          const b = r.int(2, 5), d = r.int(2, 6), a = r.int(1, b - 1), c = r.int(1, d - 1);
          const key = `${a * c}/${b * d}`;
          if (!rows.some(([p, q, u, v]) => `${p * u}/${q * v}` === key || (p === a && q === b && u === c && v === d))) rows.push([a, b, c, d]);
        }
        const [a0, b0, c0, d0] = rows[0];
        let decoy = `${a0 + c0}/${b0 + d0}`;
        if (rows.some(([p, q, u, v]) => `${p * u}/${q * v}` === decoy)) decoy = `${a0 * d0}/${b0 * c0}`;
        if (rows.some(([p, q, u, v]) => `${p * u}/${q * v}` === decoy)) decoy = `${a0 * c0 + 1}/${b0 * d0}`;
        return {
          say: 'Yhdistä jokainen kertolasku tuloonsa. Yksi lappu on houkutus.',
          task: {
            kind: 'place',
            slots: rows.map(([a, b, c, d], i) => ({ id: `s${i}`, text: `${a}/${b} · ${c}/${d}` })),
            tokens: r.shuffle([...rows.map(([a, b, c, d], i) => ({ id: `v${i}`, text: `${a * c}/${b * d}` })), { id: 'x', text: decoy }]),
            answer: Object.fromEntries(rows.map((_, i) => [`s${i}`, `v${i}`])),
            why: Object.fromEntries(rows.map(([a, b, c, d], i) => [`s${i}`, `${a} · ${c} = ${a * c} ja ${b} · ${d} = ${b * d}.`])),
          } as Q['task'],
          hint: 'Kerro osoittajat keskenään ja nimittäjät keskenään. Älä laske yhteen.',
          explain: rows.map(([a, b, c, d]) => `${a}/${b} · ${c}/${d} = ${a * c}/${b * d}`).join(', ') + '.',
        };
      },
    }, (r) => {
      const [a, b] = r.pick([[3, 4], [2, 3], [3, 5]] as [number, number][]);
      return {
        say: `Resepti vaatii ${a}/${b} dl sokeria. Teet puolikkaan annoksen. Paljonko sokeria tarvitaan?`,
        task: fracChoice(r, a, 2 * b, [[2 * a, b, 'Tämä on tuplasti, ei puolet.'], [a, b + 2, 'Nimittäjään ei lisätä kahta: jokainen osa jaetaan kahtia.']]),
        hint: `Puolikas annos on 1/2 · ${a}/${b}.`,
        explain: `1/2 · ${a}/${b} = ${a}/${2 * b} dl.`,
      };
    }),
  },
  {
    id: 'M79-EQ1-SOLVE', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Tasapainoyhtälö', icon: '⚖️',
    goal: 'Opit ratkaisemaan yhtälön tasapainoperiaatteella: sama muutos molemmille puolille, ensin vakio pois, sitten jako kertoimella.',
    intro: 'Yhtälö on vaaka. Kun teet saman muutoksen molemmille puolille, tasapaino säilyy.',
    reward: 'Ratkaiset yhtälöitä tasapainoperiaatteella!',
    demo: () => [
      { say: 'Kolme pussia ja 2 kiloa on yhtä paljon kuin 14 kiloa. Otetaan molemmilta puolilta 2 kiloa, sitten jaetaan kolmeen yhtä suureen osaan. Yhtälö kirjoitetaan rivi riviltä samaan tahtiin.', scene: balanceSolveScene(3, 2, 4) },
      { say: 'Pusseja on molemmilla puolilla. Otetaan ensin kaksi pussia pois molemmilta, sitten 1 kilo, ja lopuksi jaetaan kolmella.', scene: balanceSolveScene(5, 1, 3, 2) },
      { say: 'Jos yhtälössä on miinus, lisätään molemmille puolille. Tasapaino säilyy, kun molemmille puolille tehdään sama.', scene: card('3x − 2 = 10 &nbsp;| + 2', '3x = 12 &nbsp;| : 3', 'x = 4') },
    ],
    item: cases({
      one: (r) => {
        const x = r.int(-6, 12), a = r.int(2, 15);
        return wy(ask(`x + ${a} = ${N(x + a)}`, x, '', `Vähennetään molemmilta puolilta ${a}: x = ${N(x + a)} − ${a} = ${N(x)}.`, undefined, `Vähennä ${a} molemmilta puolilta.`), {
          [x + 2 * a]: `Lisäsit ${a}. Plus ${a} poistetaan vähentämällä ${a}.`,
          [x + a]: `${N(x + a)} on yhtälön oikea puoli. x:n saa yksin vähentämällä ${a} molemmilta puolilta.`,
        });
      },
      two: (r) => {
        const x = r.int(-4, 9), a = r.int(2, 6), b = r.int(1, 12) * (r.chance(0.7) ? 1 : -1), rhs = a * x + b;
        const wrongSign = (rhs + b) % a === 0 ? (rhs + b) / a : NaN;
        return withItemReadiness('M79-EQ1-SOLVE', wy(ask(`${a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${N(rhs)}`, x, '', `${b < 0 ? `Lisätään ${-b}` : `Vähennetään ${b}`}: ${a}x = ${N(a * x)}. Jaetaan ${a}:lla: x = ${N(x)}.`, undefined, 'Poista ensin vakio, sitten jaa kertoimella.'), {
          [rhs]: `${N(rhs)} on yhtälön oikea puoli. Poista ensin vakio ja jaa sitten ${a}:lla.`,
          ...(x !== 0 ? { [-x]: 'Etumerkki vaihtui. Tarkista sijoittamalla vastaus yhtälöön.' } : {}),
          [a * x]: `${N(a * x)} on ${a}x. Jaa vielä molemmat puolet ${a}:lla.`,
          ...(Number.isFinite(wrongSign) ? { [wrongSign]: `${b > 0 ? `Lisäsit ${b}, vaikka plus ${b} poistetaan vähentämällä` : `Vähensit ${-b}, vaikka miinus ${-b} poistetaan lisäämällä`}.` } : {}),
        }), { kind: 'operation', domain: x < 0 || rhs < 0 ? 'integer' : 'natural', operations: [b < 0 ? 'add' : 'subtract', 'divide'] });
      },
      both: (r) => {
        const x = r.int(1, 8), c = r.int(1, 3), a = c + r.int(1, 3), b = r.int(1, 9), d = (a - c) * x + b;
        return withItemReadiness('M79-EQ1-SOLVE', wy(ask(`${a}x + ${b} = ${c === 1 ? '' : c}x + ${d}`, x, '', `Vähennetään ${c === 1 ? '' : c}x: ${a - c === 1 ? '' : a - c}x + ${b} = ${d}. Vähennetään ${b}: ${a - c === 1 ? '' : a - c}x = ${d - b}. x = ${x}.`, balanceArt([...Array(a).fill('x'), String(b)], [...Array(c).fill('x'), String(d)], 0, 320), 'Poista ensin pussit toiselta puolelta.'), {
          [d]: `${d} on oikean puolen vakio. Vähennä vielä ${b} molemmilta puolilta.`,
          [(a - c) * x]: `${(a - c) * x} on ${a - c}x. Jaa vielä ${a - c}:lla.`,
          ...((d - b) % a === 0 ? { [(d - b) / a]: `Oikealla puolella on myös ${c === 1 ? 'pussi' : `${c} pussia`}. Poista ne ensin molemmilta puolilta.` } : {}),
        }), { kind: 'operation', domain: 'natural', operations: ['subtract', ...(a - c > 1 ? ['divide' as const] : [])] });
      },
      moves: (r) => {
        const a = r.int(2, 5), b = r.int(1, 9), x = r.int(1, 6), c = a * x + b, k = r.int(2, 4);
        const good = r.shuffle<[string, string, Operation]>([[`Vähennä ${b} molemmilta puolilta`, 'Sama muutos molemmille puolille: vaaka pysyy suorassa.', 'subtract'], [`Jaa molemmat puolet ${a}:lla`, 'Molemmat puolet jaetaan samalla luvulla: yhtä suuret pysyvät yhtä suurina.', 'divide'], [`Lisää ${k} molemmille puolille`, 'Sama lisäys molemmille puolille säilyttää tasapainon.', 'add'], [`Kerro molemmat puolet ${k}:lla`, 'Molemmat puolet kerrotaan samalla luvulla: tasapaino säilyy.', 'multiply']]).slice(0, 3);
        const bad = r.shuffle<[string, string, Operation]>([[`Vähennä ${b} vain vasemmalta puolelta`, 'Vain toiselta puolelta poistaminen kallistaa vaa’an.', 'subtract'], [`Jaa vain vasen puoli ${a}:lla`, 'Jos vain toinen puoli jaetaan, puolet eivät ole enää yhtä suuret.', 'divide'], [`Lisää ${k} vain oikealle puolelle`, 'Lisäys vain toiselle puolelle kallistaa vaa’an.', 'add'], [`Vähennä ${b} vasemmalta ja ${b + 1} oikealta`, 'Eri muutokset eri puolille rikkovat tasapainon.', 'subtract']]).slice(0, 3);
        const rows = r.shuffle([...good.map(([s, w, operation]) => [s, 0, w, operation] as const), ...bad.map(([s, w, operation]) => [s, 1, w, operation] as const)]);
        return withItemReadiness('M79-EQ1-SOLVE', {
          say: `Yhtälö ${a}x + ${b} = ${c}. Lajittele siirrot: säilyykö tasapaino?`,
          task: { kind: 'sort' as const, items: rows.map((q) => t(q[0])), cats: [{ label: 'Tasapaino säilyy ⚖️' }, { label: 'Vaaka kallistuu ✗' }], answer: rows.map((q) => q[1]), why: rows.map((q) => q[2]) },
          hint: 'Kysy jokaisesta siirrosta: tehdäänkö molemmille puolille täsmälleen sama?',
          explain: 'Yhtälö säilyy tosena, kun molemmille puolille tehdään sama lisäys, vähennys, kerto tai jako.',
        }, { kind: 'operation', domain: 'natural', operations: [...new Set(rows.map(row => row[3]))] });
      },
    }, (r) => {
      const v = r.pick([12, 15, 18, 20]), tt = r.int(2, 6);
      return wy(ask(`Pyöräilijä ajaa ${v} km tunnissa. Kuinka monessa tunnissa hän ajaa ${v * tt} km? Ratkaise yhtälö ${v * tt} = ${v}t.`, tt, 'h', `Jaetaan molemmat puolet ${v}:lla: t = ${v * tt} : ${v} = ${tt}.`, undefined, `Jaa molemmat puolet ${v}:lla, niin t jää yksin.`), {
        [v * tt - v]: `Vähensit ${v}. ${v}t tarkoittaa ${v} · t, joten jaetaan.`,
        [v * tt * v]: `Kerroit. ${v}t tarkoittaa ${v} · t, joten molemmat puolet jaetaan ${v}:lla.`,
      });
    }),
  },
  {
    id: 'M79-PROP-01', rev: LIGHT_REV, validRevs: [AUDIT_REV, LIGHT_REV], stop: 'Verranto', icon: '🔗',
    goal: 'Opit, että verrannossa molemmat jäsenet kerrotaan samalla luvulla, ja ratkaiset puuttuvan jäsenen.',
    intro: 'Verranto sanoo, että kaksi suhdetta ovat yhtä suuret: 2 : 5 = 6 : 15.',
    reward: 'Ratkaiset verrantoja!',
    demo: () => [
      { say: 'Kaksi kuppia mehutiivistettä viittä kuppia vettä kohti. Kolminkertainen määrä kumpaakin antaa saman värin ja maun. Jos kumpaankin lisätään kolme, maku muuttuu.', scene: mixScene(2, 5, 3) },
      { say: 'Taulukossa jokainen rivi on sama suhde: kumpikin luku kerrotaan samalla luvulla.', scene: paint(table(['tiiviste', 'vesi'], [[2, 5], [4, 10], [6, 15]])) },
      { say: 'Verrannossa ristiintulot ovat yhtä suuret: 2 · 15 = 5 · 6.', scene: card('2 : 5 = 6 : 15', '2 · 15 = 30 = 5 · 6') },
    ],
    item: cases({
      missing: (r) => {
        const a = r.int(1, 5), b = r.int(a + 1, 9), k = r.int(2, 5);
        return wy(ask(`${a} : ${b} = ${a * k} : □`, b * k, '', `${a} kerrottiin ${k}:lla, joten myös ${b} kerrotaan: ${b * k}.`, undefined, `Millä luvulla ${a} kerrottiin, kun tuli ${a * k}? Kerro ${b} samalla luvulla.`), {
          [b + a * k - a]: `Lisäsit saman luvun ${a * k - a}. Verrannossa kerrotaan: ${a} · ${k} = ${a * k}, joten ${b} · ${k}.`,
          [b]: `Jälkimmäinen suhde on ${k} kertaa suurempi. Myös ${b} kerrotaan ${k}:lla.`,
          [a * k * b]: `Kerroit luvulla ${a * k}. Kerroin on ${k}, koska ${a} · ${k} = ${a * k}.`,
        });
      },
      recipe: (r) => {
        const f = r.int(2, 4), e = r.int(1, 3), k = r.int(2, 4);
        return wy(ask(`Taikinaan tulee ${f} dl jauhoja jokaista ${e === 1 ? 'yhtä munaa' : `${e} munaa`} kohti. Montako desilitraa jauhoja tarvitaan ${e * k} munalle?`, f * k, 'dl', `Munia on ${k} kertaa enemmän, joten jauhojakin: ${f} · ${k} = ${f * k} dl.`, undefined, `Montako kertaa enemmän munia on? Ota jauhoja yhtä monta kertaa enemmän.`), {
          [f + e * k - e]: `Lisäsit saman määrän kuin munia tuli lisää. Määrät kasvavat samassa suhteessa: kerro.`,
          [f * e * k]: `Kerroit ${e * k}:lla. Munia on ${k} kertaa enemmän, ei ${e * k}.`,
          [f]: `${f} dl riittää ${e === 1 ? 'yhdelle munalle' : `${e} munalle`}. Munia on nyt enemmän.`,
        });
      },
      taste: (r) => {
        const a = r.int(1, 4), b = r.int(a + 1, 7), seen = new Set<string>([`${a} : ${b}`]);
        const rows: [string, number, string][] = [];
        const add = (s: string, c: number, w: string) => { if (!seen.has(s)) { seen.add(s); rows.push([s, c, w]); } };
        for (const k of r.shuffle([2, 3, 4, 5]).slice(0, 3)) add(`${a * k} : ${b * k}`, 0, `Kumpikin kerrottu ${k}:lla: suhde säilyy.`);
        const k = r.int(2, 4);
        add(`${a + k} : ${b + k}`, 1, `Kumpaankin lisätty ${k}: tiivisteen osuus muuttuu.`);
        add(`${b} : ${a}`, 1, 'Luvut vaihtoivat paikkaa: vettä on nyt enemmän tiivisteen paikalla.');
        add(`${a * k} : ${b}`, 1, `Vain tiiviste kerrottu ${k}:lla: mehu on väkevämpää.`);
        add(`${a} : ${b * k}`, 1, `Vain vesi kerrottu ${k}:lla: mehu on laimeampaa.`);
        const pick = r.shuffle([...rows.filter((x) => x[1] === 0).slice(0, 3), ...r.shuffle(rows.filter((x) => x[1] === 1)).slice(0, 3)]);
        return {
          say: `Perusmehu: ${a} kuppia tiivistettä ja ${b} kuppia vettä (${a} : ${b}). Lajittele sekoitukset.`,
          task: { kind: 'sort' as const, items: pick.map((x) => t(x[0])), cats: [{ label: 'Sama maku ✓' }, { label: 'Eri maku ✗' }], answer: pick.map((x) => x[1]), why: pick.map((x) => x[2]) },
          hint: `Onko molemmat luvut ${a} ja ${b} kerrottu samalla luvulla?`,
          explain: 'Suhde säilyy vain, kun molemmat jäsenet kerrotaan samalla luvulla. Lisääminen tai vain toisen kertominen muuttaa makua.',
        };
      },
      check: (r) => {
        const a = r.int(2, 5), b = r.int(a + 1, 9), k = r.int(2, 4), ok = r.chance(0.5), d = ok ? b * k : b * k + r.pick([-1, 1, 2]);
        return { say: `Onko ${a} : ${b} = ${a * k} : ${d} verranto?`, task: YESNO(ok, `${a} · ${d} = ${a * d} ja ${b} · ${a * k} = ${b * a * k}.`, `Ristiintulot: ${a * d} ja ${b * a * k}, eivät ole yhtä suuret.`), hint: 'Vertaa ristiintuloja.', explain: `${a} · ${d} = ${a * d}, ${b} · ${a * k} = ${a * b * k}: ${ok ? 'yhtä suuret' : 'eri suuret'}.` };
      },
    }, (r) => {
      // Light numbers (LIGHT_REV): whole seconds, 2–4 m per second.
      const s = r.pick([6, 9, 12]), tt = 3, T = tt * r.int(2, 3);
      const ans = (s / tt) * T;
      return Number.isInteger(ans)
        ? wy(ask(`Sammakko loikkii ${s} m ${tt} sekunnissa. Kuinka pitkälle se loikkii ${fmt(T)} sekunnissa samalla tahdilla?`, ans, 'm', `${s} : ${tt} = □ : ${fmt(T)} → □ = ${s} · ${fmt(T)} : ${tt} = ${fmt(ans)} m.`, undefined, `Laske ensin, montako metriä sammakko loikkii sekunnissa: ${s} : ${tt}.`), { [s + T - tt]: 'Lisäsit saman määrän kuin aikaa tuli lisää. Matka kasvaa samassa suhteessa kuin aika.', [s * T]: `Unohdit jakaa ${tt}:lla. ${s} m kuluu ${tt} sekuntiin, ei yhteen.` })
        : wy(ask(`Sammakko loikkii ${s} m ${tt} sekunnissa. Kuinka pitkälle se loikkii ${tt * 3} sekunnissa samalla tahdilla?`, s * 3, 'm', `Aika kolminkertaistuu, joten matkakin: ${s * 3} m.`, undefined, `Montako kertaa pidempi aika ${tt * 3} s on kuin ${tt} s?`), { [s + 2 * tt]: 'Lisäsit saman määrän kuin aikaa tuli lisää. Aika kolminkertaistui, joten matkakin.', [s]: 'Tämä on matka ajassa ' + tt + ' s. Aikaa on kolme kertaa enemmän.' });
    }),
  },
  {
    id: 'M79-UNIT-LIN', rev: AUDIT_REV, validRevs: [AUDIT_REV], stop: 'Desimaalimittari', icon: '📐',
    goal: 'Opit muuntamaan pituusyksiköitä desimaaliluvuilla: askel yksikköportaissa siirtää pilkkua yhden paikan.',
    intro: 'Pituusyksiköt desimaaliluvuilla: pilkku siirtyy, kun yksikkö vaihtuu.',
    reward: 'Muunnat pituuksia desimaaleilla!',
    demo: () => [
      { say: 'Yksikköportaat: km, hm, dam, m, dm, cm, mm. Jokainen askel alas kertoo kymmenellä. Metristä senttimetriin on kaksi askelta alas, joten pilkku siirtyy kaksi paikkaa oikealle: 1,25 m = 125 cm.', scene: stairScene(1.25, 'm', 'cm') },
      { say: 'Ylöspäin jaetaan. Millimetristä metriin on kolme askelta ylös: pilkku siirtyy kolme paikkaa vasemmalle, ja eteen tulee nolla: 450 mm = 0,45 m.', scene: stairScene(450, 'mm', 'm') },
      { say: 'Kilometristä metriin on kolme askelta alas. Numeroita ei riitä, joten tyhjiin paikkoihin tulee nollia: 2,3 km = 2300 m.', scene: stairScene(2.3, 'km', 'm') },
    ],
    item: cases({
      mcm: (r) => { const v = r.int(101, 399) / 100; return wy(ask(`${fmt(v)} m = □ cm`, Math.round(v * 100), 'cm', `1 m = 100 cm: ${fmt(v)} × 100 = ${Math.round(v * 100)}.`, undefined, 'Metristä senttimetriin on kaksi askelta alas: pilkku kaksi paikkaa oikealle.'), { [v * 10]: 'Siirsit pilkkua vain yhden paikan. Metristä senttiin on kaksi askelta (m → dm → cm).', [v * 1000]: 'Siirsit pilkkua kolme paikkaa: se on millimetreiksi. Senttimetriin on kaksi askelta.', [v / 100]: 'Pilkku siirtyi väärään suuntaan. Senttimetrejä tulee enemmän kuin metrejä.' }); },
      mmm: (r) => { const v = r.int(12, 95) * 10; return wy(ask(`${v} mm = □ m`, v / 1000, 'm', `1 m = 1000 mm: ${v} : 1000 = ${fmt(v / 1000)}.`, undefined, 'Millimetristä metriin on kolme askelta ylös: pilkku kolme paikkaa vasemmalle.'), { [v / 100]: 'Siirsit pilkkua vain kaksi paikkaa: se on desimetreiksi. Metriin on kolme askelta (mm → cm → dm → m).', [v / 10]: 'Tuo on senttimetreinä. Metriin on vielä kaksi askelta ylös.', [v * 1000]: 'Pilkku siirtyi väärään suuntaan. Metrejä tulee vähemmän kuin millimetrejä.' }); },
      kmm: (r) => { const v = r.int(11, 89) / 10; return wy(ask(`${fmt(v)} km = □ m`, Math.round(v * 1000), 'm', `1 km = 1000 m: ${fmt(v)} × 1000 = ${Math.round(v * 1000)}.`, undefined, 'Kilometristä metriin on kolme askelta alas (km → hm → dam → m). Täytä tyhjät paikat nollilla.'), { [v * 100]: 'Siirsit pilkkua vain kaksi paikkaa. Kilometristä metriin on kolme askelta.', [v * 10]: 'Siirsit pilkkua vain yhden paikan. Kilometrissä on 1000 metriä.', [v / 1000]: 'Pilkku siirtyi väärään suuntaan. Metrejä tulee enemmän kuin kilometrejä.' }); },
      cmm: (r) => { const v = r.int(5, 95); return wy(ask(`${v} cm = □ m`, v / 100, 'm', `${v} : 100 = ${fmt(v / 100)}.`, undefined, 'Senttimetristä metriin on kaksi askelta ylös: pilkku kaksi paikkaa vasemmalle.'), { [v / 10]: 'Tuo on desimetreinä. Metriin on kaksi askelta ylös.', [v / 1000]: 'Siirsit pilkkua kolme paikkaa. Senttimetristä metriin on vain kaksi askelta.', [v * 100]: 'Pilkku siirtyi väärään suuntaan. Metrejä tulee vähemmän kuin senttejä.' }); },
      stairs: (r) => {
        const rows = r.shuffle(STAIR_PAIRS).reduce<typeof STAIR_PAIRS>((acc, x) => (acc.length < 3 && !acc.some((y) => y[1] === x[1]) ? [...acc, x] : acc), []);
        const decoy = r.pick(STAIR_OPS.filter((o) => !rows.some((x) => x[1] === o)));
        return {
          say: 'Porraspeli: millä kertoimella muunnos tehdään? Vedä oikea kerroin jokaiseen muunnokseen.',
          task: { kind: 'place', slots: rows.map((x, i) => ({ id: `s${i}`, text: x[0] })), tokens: r.shuffle([...rows.map((x, i) => ({ id: `v${i}`, text: x[1] })), { id: 'x', text: decoy }]), answer: Object.fromEntries(rows.map((_, i) => [`s${i}`, `v${i}`])), why: Object.fromEntries(rows.map((x, i) => [`s${i}`, x[2]])) } as Q['task'],
          hint: 'Laske askeleet portaissa km, hm, dam, m, dm, cm, mm. Alas kerrotaan, ylös jaetaan; joka askel on 10.',
          explain: rows.map((x) => `${x[0]}: ${x[1]}`).join(', ') + '.',
        };
      },
    }, (r) => {
      const a = r.pick([0.8, 0.6, 1.2]), b = a * 1000 - r.pick([50, 150]);
      return {
        say: `Kumpi matka on pidempi: ${fmt(a)} km vai ${b} m?`,
        task: choose(r, t(`${fmt(a)} km`), [t(`${b} m`), t('Yhtä pitkät')], [`${fmt(a)} km = ${a * 1000} m, joten ${b} m on lyhyempi.`, `${fmt(a)} km = ${a * 1000} m, ei ${b} m.`], 1),
        hint: `Muunna ensin ${fmt(a)} km metreiksi: kolme askelta alas.`,
        explain: `${fmt(a)} km = ${a * 1000} m > ${b} m.`,
      };
    }),
  },

  // ============================================================ funktiot
  {
    id: 'M79-DEP-01', stop: 'Riippuuko?', icon: '🔀', rev: LAUNCH_REV, validRevs: [AUDIT_REV, LAUNCH_REV],
    goal: 'Opit tutkimaan, miten kaksi suuretta liittyvät toisiinsa annetussa tilanteessa.',
    intro: 'Tutki tilanteen sääntöä. Toisen suureen arvo voi liittyä toiseen, vaikka jokainen pieni muutos ei muuttaisi molempia.',
    reward: 'Tunnistat riippuvuuden!',
    demo: () => [
      { say: 'Sama kello käy molemmissa kuvissa. Ämpäriin valuu 4 litraa minuutissa: vesimäärä muuttuu, kun aika kuluu. Viikonpäivä ei yksin määrää veden kiehumislämpötilaa. Puhtaan veden esimerkkilukema 100 astetta olettaa saman normaalipaineen.', scene: dependScene(4) },
      { say: 'Tutki koko sovittua tilannetta ja sen sääntöä. Jos hana suljetaan hetkeksi, vesimäärä pysyy tauolla samana. Yksi muuttumaton väli ei siis todista riippuvuuden puuttumista. Kahden asian yhtäaikainen muutos ei myöskään yksin todista syytä.', scene: card('tutki sovittua sääntöä', 'arvo voi välillä säilyä', 'pelkkä yhteinen muutos ei todista syytä') },
    ],
    item: cases({
      depends: (r) => {
        const [q, yes, why] = r.pick(DEP_PAIRS);
        return { say: `Riippuvatko nämä toisistaan: ${q}?`, task: YESNO(yes, why, why), hint: 'Kuvittele, että ensimmäinen muuttuu. Muuttuuko toinen silloin?', explain: `${yes ? 'Kyllä' : 'Ei'}: ${why}` };
      },
      which: (r) => {
        const [q, a, w1, w2] = r.pick([
          ['Pyöräilijä ajaa tasaista vauhtia. Mikä suure riippuu ajasta?', 'kuljettu matka', 'pyörän väri', 'pyöräilijän pituus'],
          ['Kynttilä palaa. Mikä suure riippuu ajasta?', 'kynttilän pituus', 'kynttilän väri', 'huoneen leveys'],
          ['Ostat omenoita kilohinnalla. Mikä riippuu ostettujen omenoiden massasta?', 'maksettava hinta', 'kaupan nimi', 'omenoiden väri'],
          ['Ämpäriin valuu vettä. Mikä riippuu siitä, kauanko hana on auki?', 'veden määrä ämpärissä', 'ämpärin väri', 'hanan malli'],
        ] as string[][]);
        return { say: q!, task: choose(r, t(a!), [t(w1!), t(w2!)], [`${cap(w1!)} pysyy samana, vaikka toinen suure muuttuu.`, `${cap(w2!)} ei muutu, vaikka toinen suure muuttuu.`]), hint: 'Mikä näistä muuttuisi, jos toinen suure kasvaisi?', explain: `${cap(a!)} muuttuu, kun toinen suure muuttuu.` };
      },
      pattern: (r) => {
        const k = r.int(2, 5), b = r.int(0, 4);
        return {
          say: 'Katso annetut arvoparit järjestyksessä. Miten y:n arvot muuttuvat, kun x kasvaa?',
          scene: paint(table(['x', 0, 1, 2, 3], [['y', ...[0, 1, 2, 3].map((x) => k * x + b)]])),
          task: choose(r, t('y kasvaa'), [t('y pienenee'), t('y pysyy samana')], ['Seuraavat annetut y-arvot ovat edellisiä suurempia.', 'Annetut y-arvot eivät ole samat.']),
          hint: 'Katso, ovatko seuraavat annetut y-arvot suurempia, pienempiä vai samoja. Erotusta ei kysytä.',
          explain: `Annetut y-arvot ${b}, ${k + b}, ${2 * k + b} ja ${3 * k + b} kasvavat tässä järjestyksessä. Tämä kuvaa vain annettua tilannetta.`,
        };
      },
      sort: (r) => {
        const yes = r.shuffle(DEP_PAIRS.filter((x) => x[1])).slice(0, 2), no = r.shuffle(DEP_PAIRS.filter((x) => !x[1])).slice(0, 2);
        const rows = r.shuffle([...yes, ...no]);
        return {
          say: 'Lajittele parit: riippuvatko suureet toisistaan?',
          task: { kind: 'sort' as const, items: rows.map((x) => t(x[0])), cats: [{ label: 'Riippuu 🔗' }, { label: 'Ei riipu ✂️' }], answer: rows.map((x) => (x[1] ? 0 : 1)), why: rows.map((x) => x[2]) },
          hint: 'Muuta mielessäsi ensimmäistä suuretta. Muuttuuko toinen?',
          explain: 'Näissä annetuissa tilanteissa verrataan toisiinsa liittyviä suureita. Tarkastele sovittua sääntöä kokonaisuutena: yksi muuttumaton väli ei yksin todista riippuvuuden puuttumista.',
        };
      },
    }, (r) => {
      const k = r.int(3, 6), n = r.int(5, 8);
      return {
        say: `Annetut tiedot: alussa 0 l, yhden minuutin kohdalla ${k} l ja ${n} minuutin kohdalla ${k * n} l. Mikä annettu vesimäärä kuuluu aikaan ${n} minuuttia?`,
        scene: paint(table(['aika (min)', 0, 1, n], [['vettä (l)', 0, k, k * n]])),
        task: choose(r, { big: `${k * n} l` }, [{ big: '0 l' }, { big: `${k} l` }], ['Tämä määrä kuuluu aloitushetkeen.', 'Tämä määrä kuuluu yhden minuutin hetkeen.']),
        hint: 'Etsi annetusta parista kysytty aika ja siihen kuuluva vesimäärä. Kaikki tarvittavat arvot on annettu.',
        explain: `Annetussa tietueessa ${n} minuuttia vastaa ${k * n} l:aa. Aika ja määrä säilytetään samana parina.`,
      };
    }),
  },
  {
    id: 'M79-FUNC-01', stop: 'Funktiokone', icon: '⚙️', rev: LAUNCH_REV, validRevs: [AUDIT_REV, LAUNCH_REV],
    goal: 'Opit tunnistamaan funktion: jokaiselle sallitulle syötteelle kuuluu täsmälleen yksi arvo.',
    intro: 'Sovitaan ensin sallitut syötteet. Funktiossa jokainen niistä saa täsmälleen yhden arvon; eri syötteet voivat saada saman arvon.',
    reward: 'Ymmärrät funktion koneena!',
    demo: () => [
      { say: 'Kone kertoo kahdella ja lisää yhden. Syötteet kulkevat koneen läpi, ja taulukko täyttyy. Syöte 3 tulee kahdesti, ja molemmilla kerroilla arvo on 7.', scene: funcMachineScene(2, 1, [3, 0, 5, 3]) },
      { say: 'Tämä kone on oikukas: syöte 2 antaa ensin 4, sitten 5. Kun yksi syöte antaa kaksi eri arvoa, kone ei ole funktio.', scene: funcMachineScene(2, 0, [1, 2, 4, 2], true) },
      { say: 'Funktiota merkitään f(x) = 2x + 1. Silloin f(3) tarkoittaa arvoa, joka tulee syötteellä 3: f(3) = 7.', scene: card('f(x) = 2x + 1', 'f(3) = 2 · 3 + 1 = 7') },
    ],
    item: cases({
      run: (r) => {
        const xs = [0, 1, 2], ys = r.shuffle([2, 2, 7]), x = r.pick(xs), y = ys[x]!;
        const wrong = r.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(v => v !== y)).slice(0, 2);
        return {
          say: `Sallitut syötteet ovat 0, 1 ja 2. Taulukko antaa kaikki niiden arvot valmiina. Mikä annettu arvo kuuluu syötteelle ${x}?`,
          scene: paint(table(['Syöte', ...xs], [['Arvo', ...ys]])),
          task: choose(r, { big: String(y) }, wrong.map(v => ({ big: String(v) })), wrong.map(() => 'Etsi kysytty syöte ja lue juuri sille annettu arvo.')),
          hint: 'Lue annetun syötteen ja arvon pari. Arvoa ei tarvitse laskea.',
          explain: `Syötteelle ${x} on annettu arvo ${y}. Eri syötteet saavat antaa saman arvon.`,
        };
      },
      rule: (r) => {
        const kind = r.pick(['missing', 'conflict', 'valid']), u = r.int(2, 5), v = u + 2;
        const pairs = kind === 'missing' ? [[0, u], [1, v]] : kind === 'conflict' ? [[0, u], [1, u], [1, v], [2, u]] : [[0, u], [1, u], [1, u], [2, u]];
        const answer = kind === 'missing' ? 'Syötteeltä 2 puuttuu arvo.' : kind === 'conflict' ? 'Syöte 1 saa kaksi eri arvoa.' : 'Jokaisella sallitulla syötteellä on yksi arvo.';
        const wrong = kind === 'missing' ? ['Jokaisella sallitulla syötteellä on yksi arvo.', 'Syöte 0 saa kaksi eri arvoa.'] : kind === 'conflict' ? ['Jokaisella sallitulla syötteellä on yksi arvo.', 'Syötteeltä 2 puuttuu arvo.'] : ['Eri syötteet eivät saa antaa samaa arvoa.', 'Saman parin toistuminen tekee kaksi eri arvoa.'];
        return {
          say: `Sallitut syötteet ovat 0, 1 ja 2. Tässä on koko ohjetaulu: ${pairs.map(([x, y]) => `${x} → ${y}`).join(', ')}. Mikä väite pitää paikkansa?`,
          task: choose(r, t(answer), wrong.map(t), wrong.map(() => 'Tarkista jokainen sallittu syöte: puuttuuko sen arvo, onko sillä eri arvoja vai yksi arvo? Saman parin toisto ei ole ristiriita.')),
          hint: 'Kaikilla kolmella sallitulla syötteellä pitää olla arvo. Sama syöte ei saa saada kahta eri arvoa.',
          explain: answer + ' Eri syötteet saavat saman arvon, ja sama pari saa toistua.',
        };
      },
      isFunc: (r) => {
        const ok = r.chance(0.5), xs = [1, 2, 3, 4], ys = xs.map((x) => x * r.int(2, 3));
        const x2 = ok ? xs : [1, 2, 2, 4], y2 = ok ? ys : [ys[0]!, ys[1]!, ys[1]! + 1, ys[3]!];
        return { say: 'Sallitut syötteet ovat 1, 2, 3 ja 4. Taulukko antaa koko ohjeen. Määrittääkö se funktion tästä syötejoukosta?', scene: paint(table(['x', ...x2], [['y', ...y2]])), task: YESNO(ok, 'Jokaisella syötteellä on yksi arvo.', `Syötteellä 2 on kaksi eri arvoa: ${y2[1]} ja ${y2[2]}, ja syötteeltä 3 puuttuu arvo.`), hint: 'Tarkista, onko jokaisella sallitulla syötteellä täsmälleen yksi arvo.', explain: ok ? 'Jokaisella sallitulla syötteellä on täsmälleen yksi arvo: funktio tällä joukolla.' : 'Syöte 2 antaa kaksi eri arvoa ja syötteen 3 arvo puuttuu. Taulukko ei määritä funktiota sovitulla syötejoukolla.' };
      },
      pairs: (r) => {
        const p = r.int(1, 3), q = p + r.int(1, 3), u = r.int(2, 6), v = u + r.int(1, 4), w = r.int(2, 9);
        const rows: [string, number, string][] = r.shuffle([
          [`${p} → ${u}, ${q} → ${v}, ${p} → ${u}`, 0, `Syöte ${p} toistuu, mutta arvo on sama ${u}.`],
          [`${p} → ${w}, ${q} → ${w}, ${q + 1} → ${w}`, 0, 'Eri syötteet saavat antaa saman arvon. Jokaisella syötteellä on silti yksi arvo.'],
          [`${p} → ${u}, ${q} → ${v}, ${q + 1} → ${v + 2}`, 0, 'Jokainen syöte esiintyy kerran.'],
          [`${p} → ${u}, ${q} → ${v}, ${p} → ${u + 1}`, 1, `Syöte ${p} antaa kaksi arvoa: ${u} ja ${u + 1}.`],
          [`${q} → ${u}, ${q} → ${v}`, 1, `Syöte ${q} antaa kaksi arvoa: ${u} ja ${v}.`],
        ] as [string, number, string][]);
        return {
          say: 'Lajittele koneet. Kunkin kortin sallitut syötteet ovat juuri siinä nimetyt eri syöteluvut, ja koko ohje on annettu. Määrittääkö ohje funktion tällä joukolla?',
          task: { kind: 'sort' as const, items: rows.map((x) => t(x[0])), cats: [{ label: 'Funktio ✓' }, { label: 'Ei funktio ✗' }], answer: rows.map((x) => x[1]), why: rows.map((x) => x[2]) },
          hint: 'Ratkaisevaa on, antaako sama syöte eri arvoja. Sama arvo eri syötteille on sallittu.',
          explain: 'Funktio: yksi syöte → yksi arvo. Sama arvo saa toistua, mutta sama syöte ei saa antaa kahta eri arvoa.',
        };
      },
    }, (r) => {
      const n = r.int(2, 7);
      return {
        say: `Sallitut syötteet ovat tiistai, keskiviikko ja torstai. Annettu kävijätaulu: tiistai → ${n}, keskiviikko → ${n}, torstai → ${n + 3}. Mikä väite pitää paikkansa?`,
        task: choose(r, t('Päivä määrää yhden kävijämäärän.'), [t(`Luku ${n} määrää yhden ainoan päivän.`), t('Eri päivien pitää antaa eri määrät.')], [`Luku ${n} liittyy sekä tiistaihin että keskiviikkoon. Suhteen kääntäminen ei tässä anna yhtä päivää.`, 'Eri syötteet saavat antaa saman arvon.']),
        hint: 'Lue nuolten suunta päivästä määrään. Sama määrä saa olla usealla päivällä.',
        explain: 'Jokaiselle sallitulle päivälle on annettu yksi määrä. Eri päivillä saa olla sama määrä; käännetty suunta ei tässä määrää yhtä päivää.',
      };
    }),
  },
  {
    id: 'M79-FUNC-GRAPH', stop: 'Funktio kuvaajaksi', icon: '📈', rev: LAUNCH_REV, validRevs: [LAUNCH_REV, AUDIT_REV],
    produce: ['plot', 'transfer'], produceWhat: 'pyydettyjen funktion pisteiden merkitsemistä',
    goal: 'Opit piirtämään funktion kuvaajan arvotaulukosta ja lukemaan kuvaajalta y:n arvon.',
    intro: 'Funktion jokainen pari (x, y) on piste koordinaatistossa. Pisteet yhdessä ovat kuvaaja.',
    reward: 'Piirrät funktion kuvaajan!',
    demo: () => [
      { say: 'Funktio y = 2x − 1. Jokainen taulukon rivi siirtyy koordinaatistoon: ensin x-akselia pitkin kohtaan x, sitten ylös tai alas y:n verran. Lopuksi pisteiden läpi piirretään suora.', scene: graphPlotScene(2, -1, [-1, 0, 1, 2]) },
      { say: 'Funktio y = −x + 2: kun x kasvaa, y pienenee. Pisteet laskevat oikealle, ja kuvaaja on laskeva suora.', scene: graphPlotScene(-1, 2, [-1, 0, 1, 2, 3]) },
    ],
    item: cases({
      plot: (r) => {
        const k = r.pick([-2, -1, 1, 2]), b = r.pick([-1, 0, 1]), xs = [-1, 0, 1];
        const ys = xs.map((x) => k * x + b);
        return { say: `Merkitse funktion ${lin(k, b)} pisteet, kun x on −1, 0 ja 1.`, scene: paint(table(['x', '−1', '0', '1'], [['y', '?', '?', '?']])), task: plot4(xs, ys), hint: 'Laske ensin y jokaiselle x:lle. Piste (x, y): ensin vaakasuunnassa x, sitten pystysuunnassa y.', explain: `Pisteet ${xs.map((x, i) => P(x, ys[i]!)).join(', ')}.` };
      },
      read: (r) => {
        const k = r.pick([-2, -1, 1, 2]), b = r.int(-2, 2), x = r.pick([-2, -1, 1, 2].filter((v) => Math.abs(k * v + b) <= 4)), y = k * x + b;
        return wy(ask(`Kuvaajassa on funktio. Mikä on y:n arvo, kun x = ${N(x)}?`, y, '', `Kohdasta x = ${N(x)} pystysuoraan kuvaajalle: y = ${N(y)}.`, graph([{ k, b }]), `Mene x-akselilla kohtaan ${N(x)} ja siitä suoraan ylös tai alas kuvaajalle.`),
          { [x]: 'Tämä on x:n arvo. Kysytään, millä korkeudella kuvaaja on.', [-y]: 'Tarkista suunta: onko piste x-akselin ylä- vai alapuolella?', [b]: `${N(b)} on y:n arvo kohdassa x = 0, ei kohdassa x = ${N(x)}.` });
      },
      match: (r) => {
        const k = r.pick([2, -2, 1]), b = r.pick([-1, 1]), xs = [0, 1, 2];
        const tb = (ys: number[]) => table(['x', ...xs], [['y', ...ys.map(N)]]);
        const right = xs.map((x) => k * x + b);
        return {
          say: 'Mikä taulukko sopii kuvaajaan?',
          scene: paint(graph([{ k, b }])),
          task: choose(r, { art: tb(right) }, [{ art: tb(xs.map((x) => -k * x + b)) }, { art: tb(xs.map((x) => k * x - b)) }], ['Tässä suora kulkisi toiseen suuntaan.', 'Tässä suora leikkaisi y-akselin eri kohdassa.'], 1),
          hint: 'Katso ensin, missä kuvaaja leikkaa y-akselin (x = 0). Nouseeko vai laskeeko se?',
          explain: `Kuvaajasta: ${xs.map((x, i) => P(x, right[i]!)).join(', ')}.`,
        };
      },
      onIt: (r) => {
        const k = r.pick([2, -2, 3, -1]), b = r.pick([-1, 1, 2]);
        const xs = r.shuffle([-2, -1, 0, 1, 2]).slice(0, 5);
        const rows: [string, number, string][] = [];
        xs.forEach((x, i) => {
          const y = k * x + b;
          if (i < 3) rows.push([P(x, y), 0, `Kun x = ${N(x)}, y = ${N(k)} · ${x < 0 ? `(${N(x)})` : x}${b < 0 ? ' − ' + -b : ' + ' + b} = ${N(y)}. Piste on kuvaajalla.`]);
          else if (i === 3) rows.push([P(x, y + 1), 1, `Kun x = ${N(x)}, y = ${N(y)}, ei ${N(y + 1)}.`]);
          else if (y !== x && k * y + b !== x && !rows.some((q) => q[0] === P(y, x))) rows.push([P(y, x), 1, `Koordinaatit väärin päin: kun x = ${N(y)}, y = ${N(k * y + b)}.`]);
          else rows.push([P(x, y - 1), 1, `Kun x = ${N(x)}, y = ${N(y)}, ei ${N(y - 1)}.`]);
        });
        const sh = r.shuffle(rows);
        return {
          say: `Lajittele pisteet: ovatko ne funktion ${lin(k, b)} kuvaajalla?`,
          task: { kind: 'sort' as const, items: sh.map((x) => t(x[0])), cats: [{ label: 'Kuvaajalla ✓' }, { label: 'Ei kuvaajalla ✗' }], answer: sh.map((x) => x[1]), why: sh.map((x) => x[2]) },
          hint: 'Sijoita pisteen x sääntöön. Tuleeko pisteen y?',
          explain: 'Piste on kuvaajalla täsmälleen silloin, kun sen koordinaatit toteuttavat säännön.',
        };
      },
    }, (r) => {
      const s = r.pick([3, 4]), d = r.pick([2, 3]);
      const ys = [0, 1, 2].map((h) => s - d * h).filter((y) => y >= -4);
      return { say: `Keskiyöllä on ${s} °C, ja lämpötila laskee ${d} astetta tunnissa. Merkitse lämpötila hetkillä 0, 1 ja 2 tuntia (x = tunnit, y = °C).`, task: plot4([0, 1, 2].slice(0, ys.length), ys), hint: `Hetkellä 0 lämpötila on ${s}. Joka tunti vähennä ${d}.`, explain: `Pisteet ${ys.map((y, i) => P(i, y)).join(', ')}.` };
    }),
  },
  {
    id: 'M79-LINE-GRAPH', stop: 'Suoran yhtälö', icon: '📉', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    goal: 'Opit lukemaan suoran yhtälöstä y = kx + b, missä suora leikkaa y-akselin (b) ja miten jyrkästi se nousee tai laskee (k).',
    intro: 'Yhtälö y = kx + b on aina suora. b kertoo, missä suora leikkaa y-akselin.',
    reward: 'Yhdistät suoran yhtälön ja kuvaajan!',
    demo: () => [
      { say: 'Katso, mitä luvut tekevät. Ensin muutetaan vain b:tä: suora liukuu ylös ja alas, ja vihreä leikkauspiste y-akselilla seuraa b:tä. Sitten muutetaan k:ta: suora kääntyy leikkauspisteen ympäri. Oranssi porras näyttää: askel oikealle, k ylös tai alas.', scene: kbScene(2, [0, 3, -2, 1], [3, 1, -1, -2]) },
      { say: 'Suora y = 2x + 1 leikkaa y-akselin kohdassa 1, koska x = 0 antaa y = 1. Kaksi pistettä riittää suoran piirtämiseen.', scene: paint(graph([{ k: 2, b: 1, label: 'y = 2x + 1' }], [{ x: 0, y: 1, label: '(0, 1)' }, { x: 1, y: 3, label: '(1, 3)' }])) },
    ],
    item: cases({
      which: (r) => {
        const k = r.pick([2, 1, -1]), b = r.pick([-1, 1, 2]), k2 = -k, A = r.chance(0.5);
        const wrong = `Tämä suora ${k > 0 ? 'laskee' : 'nousee'} oikealle, joten sen kerroin on ${k > 0 ? 'negatiivinen' : 'positiivinen'}.`;
        return {
          say: `Kumpi suora on ${lin(k, b)}?`,
          scene: paint(graph([{ k: A ? k : k2, b, label: 'A', color: 'var(--pond)' }, { k: A ? k2 : k, b, label: 'B', color: 'var(--red)' }])),
          task: fixed([t('A'), t('B')], A ? 0 : 1, A ? [undefined, wrong] : [wrong, undefined], 2),
          hint: k > 0 ? 'Positiivinen kerroin: suora nousee oikealle.' : 'Negatiivinen kerroin: suora laskee oikealle.',
          explain: `${lin(k, b)} ${k > 0 ? 'nousee' : 'laskee'} vasemmalta oikealle.`,
        };
      },
      intercept: (r) => {
        const k = r.pick([2, 3, -2]), b = r.pick([-3, -1, 2, 4].filter((v) => v !== k));
        return { say: `Missä pisteessä suora ${lin(k, b)} leikkaa y-akselin?`, task: choose(r, { big: P(0, b) }, [{ big: P(b, 0) }, { big: P(0, k) }], ['Väärin päin: y-akselilla x on nolla.', 'k on kulmakerroin, ei leikkauskohta.']), hint: 'y-akselilla x = 0. Sijoita x = 0 yhtälöön.', explain: `x = 0 antaa y = ${N(b)}: piste ${P(0, b)}.` };
      },
      draw: (r) => {
        const k = r.pick([-1, 1, 2, -2]), b = r.pick([-1, 0, 1, 2]);
        const x2 = Math.abs(k * 2 + b) <= 4 ? 2 : 1;
        return { say: `Piirrä suora ${lin(k, b)}: merkitse pisteet, kun x = 0 ja x = ${x2}.`, task: plot4([0, x2], [b, k * x2 + b]), hint: `Kun x = 0, y = b. Toinen piste: sijoita x = ${x2}.`, explain: `x = 0 → y = ${N(b)}, x = ${x2} → y = ${N(k * x2 + b)}.` };
      },
      lines: (r) => {
        const k = r.pick([2, 3]), b1 = r.int(1, 4), b2 = r.pick([-3, -2, -1].filter((v) => v !== -b1));
        const L1 = lin(k, b1), L2 = lin(k, b2), L3 = lin(-k, b1), dec = b1 !== k ? lin(b1, k) : lin(k, -b1);
        return {
          say: 'Yhdistä jokainen kuvaus oikeaan yhtälöön. Yksi yhtälö jää yli.',
          task: {
            kind: 'place',
            slots: [{ id: 's1', text: `nousee ${k} joka askeleella, leikkaa y-akselin kohdassa ${b1} → ▢` }, { id: 's2', text: `yhtä jyrkkä kuin edellinen, leikkaa y-akselin kohdassa ${N(b2)} → ▢` }, { id: 's3', text: `laskee oikealle, leikkaa y-akselin kohdassa ${b1} → ▢` }],
            tokens: r.shuffle([{ id: 'a', text: L1 }, { id: 'b', text: L2 }, { id: 'c', text: L3 }, { id: 'x', text: dec }]),
            answer: { s1: 'a', s2: 'b', s3: 'c' },
            why: { s1: `k = ${k} (nousee ${k}) ja b = ${b1}.`, s2: `Sama k = ${k} tarkoittaa yhtä jyrkkää. b = ${N(b2)}.`, s3: `Negatiivinen k = ${N(-k)} saa suoran laskemaan. b = ${b1}.` },
          } as Task,
          hint: 'x:n kerroin k kertoo nousun, vakio b leikkauskohdan y-akselilla.',
          explain: `${L1}, ${L2} ja ${L3}. Yhtälössä ${dec} k ja b ovat vaihtaneet paikkaa.`,
        };
      },
    }, (r) => {
      const k = r.pick([1, 2, -2, 3]), x0 = r.pick([-2, -1, 1, 2]), b = -k * x0;
      return wy(ask(`Missä kohdassa suora ${lin(k, b)} leikkaa x-akselin? Anna x.`, x0, '', `x-akselilla y = 0: ${k === 1 ? '' : N(k)}x ${b < 0 ? '−' : '+'} ${Math.abs(b)} = 0, joten x = ${N(x0)}.`, undefined, 'x-akselilla y on nolla. Ratkaise yhtälö.'),
        { [b]: `${N(b)} on leikkauskohta y-akselilla. x-akselilla y = 0.`, [-x0]: 'Tarkista merkki: siirrä vakio toiselle puolelle vastaluvuksi.', [-b]: k === 1 ? '' : `Jaa vielä kertoimella ${N(k)}.` });
    }),
  },
  {
    id: 'M79-SLOPE', stop: 'Kulmakerroin', icon: '⛰️', rev: AUDIT_REV, validRevs: [AUDIT_REV],
    goal: 'Opit laskemaan kulmakertoimen kahdesta pisteestä k = Δy / Δx ja tulkitsemaan sen merkin ja suuruuden.',
    intro: 'Kulmakerroin k kertoo, paljonko y muuttuu, kun x kasvaa yhdellä. k = Δy / Δx.',
    reward: 'Ymmärrät kulmakertoimen muutoksen suhteena!',
    demo: () => [
      { say: 'Pisteet (1, 2) ja (3, 8). Kuljetaan ensin vaakasuoraan: x muuttuu 2. Sitten ylös: y muuttuu 6. Porras jaetaan kahteen yhtä suureen askeleeseen, ja jokainen nousee 3. Kulmakerroin on 6 / 2 = 3.', scene: slopeScene(1, 2, 3, 8) },
      { say: 'Pisteet (−1, 3) ja (2, −3): y pienenee 6, kun x kasvaa 3. Muutos on negatiivinen, joten k = −6 / 3 = −2. Suora laskee.', scene: slopeScene(-1, 3, 2, -3) },
      { say: 'Jos suora laskee oikealle, kulmakerroin on negatiivinen. Vaakasuoralla suoralla se on nolla.', scene: paint(graph([{ k: 2, b: 0, label: 'k > 0' }, { k: -1, b: 1, label: 'k < 0', color: 'var(--red)' }, { k: 0, b: -3, label: 'k = 0', color: 'var(--blue)' }])) },
    ],
    item: cases({
      points: (r) => {
        const k = r.pick([-3, -2, 2, 3, 4]), x1 = r.int(-2, 1), dx = r.int(2, 3), y1 = r.int(-3, 3), dy = k * dx;
        return wy(ask(`Suora kulkee pisteiden ${P(x1, y1)} ja ${P(x1 + dx, y1 + dy)} kautta. Mikä on kulmakerroin?`, k, '', `Δy = ${N(dy)}, Δx = ${dx}: k = ${N(dy)} / ${dx} = ${N(k)}.`, undefined, 'Laske ensin y:n muutos ja x:n muutos. Jaa sitten Δy / Δx.'),
          { [dy]: `${N(dy)} on Δy. Se pitää vielä jakaa Δx:llä ${dx}.`, [-k]: 'Tarkista merkki: kasvaako vai pieneneekö y, kun x kasvaa?', [Math.round(dx / dy * 100) / 100]: 'Väärin päin: k = Δy / Δx, y:n muutos jaetaan x:n muutoksella.' });
      },
      table: (r) => {
        const k = r.pick([-2, -1, 2, 3, 5]), b = r.int(-3, 4);
        return wy(ask('Mikä on taulukon suoran kulmakerroin?', k, '', `Kun x kasvaa yhdellä, y muuttuu ${N(k)}.`, table(['x', 0, 1, 2, 3], [['y', ...[0, 1, 2, 3].map((x) => N(k * x + b))]]), 'Paljonko y muuttuu, kun x kasvaa yhdellä?'),
          { [b]: `${N(b)} on y:n arvo, kun x = 0. Kulmakerroin on muutos.`, [k + b]: `${N(k + b)} on y:n arvo, kun x = 1. Laske erotus.`, [-k]: 'Tarkista suunta: kasvaako vai pieneneekö y?' });
      },
      sign: (r) => {
        const s = r.pick([1, -1, 0]), k = s * r.pick([1, 2]), b = r.int(-1, 1);
        const why = (w: number) => (w === 0 ? 'Positiivinen k tarkoittaa, että suora nousee oikealle.' : w === 1 ? 'Negatiivinen k tarkoittaa, että suora laskee oikealle.' : 'Nolla tarkoittaa vaakasuoraa suoraa: y ei muutu.');
        const ans = s > 0 ? 0 : s < 0 ? 1 : 2;
        return { say: 'Millainen on suoran kulmakerroin?', scene: paint(graph([{ k, b }])), task: fixed([t('positiivinen'), t('negatiivinen'), t('nolla')], ans, [0, 1, 2].map((w) => (w === ans ? undefined : why(w))), 3), hint: 'Kulje kuvaajaa vasemmalta oikealle. Nouseeko, laskeeko vai pysyykö se samalla korkeudella?', explain: s > 0 ? 'Suora nousee oikealle: k > 0.' : s < 0 ? 'Suora laskee oikealle: k < 0.' : 'Suora on vaakasuora: y ei muutu, k = 0.' };
      },
      steeper: (r) => {
        const [k1, k2] = r.shuffle([r.pick([1, -1]), r.pick([3, -3, 2, -2])]);
        const A = Math.abs(k1!) > Math.abs(k2!);
        const w = `Tämän kulmakertoimen itseisarvo on pienempi: |${N(A ? k2! : k1!)}| < |${N(A ? k1! : k2!)}|.`;
        return { say: 'Kumpi suora on jyrkempi?', scene: paint(graph([{ k: k1!, b: 0, label: 'A' }, { k: k2!, b: 0, label: 'B', color: 'var(--red)' }])), task: fixed([t('A'), t('B')], A ? 0 : 1, A ? [undefined, w] : [w, undefined], 2), hint: 'Jyrkkyys ei riipu suunnasta. Kumpi muuttuu enemmän yhdellä askeleella?', explain: `Jyrkkyys on kulmakertoimen suuruus: |${N(k1!)}| ja |${N(k2!)}|.` };
      },
      rank: (r) => {
        const mags = r.shuffle([1, 2, 3]).slice(0, 3), ks = mags.map((m) => m * r.pick([1, -1]));
        if (ks.every((k) => k > 0)) ks[r.int(0, 2)]! *= -1;
        const pairs = ks.map((k) => { const x1 = r.int(-2, 1), dx = r.int(1, 3), y1 = r.int(-2, 2); return `${P(x1, y1)} ja ${P(x1 + dx, y1 + k * dx)}`; });
        const order = [0, 1, 2].sort((i, j) => Math.abs(ks[j]!) - Math.abs(ks[i]!));
        const ids = ['s0', 's1', 's2'], names = ['jyrkin', 'keskimmäinen', 'loivin'];
        return {
          say: 'Suorat kulkevat annettujen pisteiden kautta. Järjestä ne jyrkkyyden mukaan.',
          task: {
            kind: 'place',
            slots: ids.map((id, i) => ({ id, text: `${names[i]} → ▢` })),
            tokens: r.shuffle(ks.map((_, i) => ({ id: `p${i}`, text: pairs[i]! }))),
            answer: Object.fromEntries(ids.map((id, i) => [id, `p${order[i]}`])),
            why: Object.fromEntries(ids.map((id, i) => [id, `k = ${N(ks[order[i]!]!)}, ja jyrkkyys on |k| = ${Math.abs(ks[order[i]!]!)}.`])),
          } as Task,
          hint: 'Laske jokaiselle k = Δy / Δx. Jyrkkyys on k:n suuruus ilman merkkiä.',
          explain: `Kulmakertoimet: ${order.map((i) => N(ks[i]!)).join(', ')}. Negatiivinen k voi olla jyrkkä: vain suuruus ratkaisee.`,
        };
      },
    }, (r) => {
      const v = r.pick([2, 3, 4, 5]), T = r.pick([4, 5, 6]);
      return wy(ask(`Matka–aika-kuvaajan suora kulkee pisteiden (0 s, 0 m) ja (${T} s, ${v * T} m) kautta. Mikä on kulmakerroin? Mitä se kertoo?`, v, 'm/s', `k = ${v * T} m / ${T} s = ${v} m/s. Matka–aika-kuvaajan kulmakerroin on nopeus.`, chart({ xMax: 6, yMax: 30, xStep: 1, yStep: 10, xLabel: 't (s)', yLabel: 's (m)', w: 260, h: 170 }, [{ pts: [[0, 0], [T, v * T]], dots: true }]), 'k = Δy / Δx: matkan muutos jaettuna ajan muutoksella.'),
        { [v * T]: `${v * T} m on koko matka. Jaa se ajalla ${T} s.`, [T]: `${T} s on aika. k = matka / aika.` });
    }),
  },
];
