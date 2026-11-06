import type { Rng } from '../engine/rng';
import type { DemoStep, Item, NodeSpec, Task } from '../engine/types';
import { cases } from './kit';
import {
  commonDenominator, compareFraction, expandFraction, fractionSymbol, improperFraction, mixedFraction,
  solutionFractionSubtract, subtractionPartition,
  type Fraction, type FractionCompare, type FractionExpand, type FractionLine, type FractionMixed, type FractionSubtractTask,
  type FractionWorkshopModel,
} from './models/fraction-workshop';
import {
  fractionCompareArt, fractionExpandArt, fractionLineArt, fractionMixedArt, fractionSubtractArt,
} from './scenes/fraction-workshop';

export type FractionWorkshopItem = Item & { fractionWorkshopModel: FractionWorkshopModel };
type Question = Omit<FractionWorkshopItem, 'tag'>;
type Family = (r: Rng) => Question;
type Definition = Omit<NodeSpec, 'item' | 'rev' | 'validRevs'> & {
  rev: string;
  families: Record<string, Family>;
  transfer: Family;
  limit: string;
};

function definition({ families, transfer, limit, ...spec }: Definition) {
  return {
    spec: { ...spec, validRevs: [spec.rev], item: cases(families, transfer) } satisfies NodeSpec,
    evidence: { families: Object.keys(families), limit },
  };
}

const digits = '0123456789'.split('');
const writtenFraction = ({ n, d }: Fraction) => [...String(n), '/', ...String(d)];
const sequence = (tokens: string[], target: string[], reasons: [string[], string][] = []): Task => ({
  kind: 'build', mode: 'seq', tokens, target: target.join(' '), max: 13,
  whyAt: Object.fromEntries(reasons.map(([wrong, message]) => [wrong.join(' '), message])),
});
const lineSet = {
  proper: [{ n: 1, d: 4 }, { n: 3, d: 5 }, { n: 3, d: 8 }, { n: 7, d: 8 }],
  improper: [{ n: 5, d: 4 }, { n: 7, d: 4 }, { n: 7, d: 5 }, { n: 11, d: 8 }],
  transfer: [{ n: 9, d: 4 }, { n: 13, d: 5 }, { n: 21, d: 8 }, { n: 19, d: 8 }],
};

function lineQuestion(r: Rng, group: keyof typeof lineSet): Question {
  const amount = r.pick(lineSet[group]);
  const { n, d } = amount;
  const model: FractionLine = {
    kind: 'fraction-line', amount, min: group === 'transfer' ? 1 : 0,
    max: group === 'transfer' ? 4 : group === 'improper' ? 3 : 2,
    surface: group === 'transfer' ? 'rope' : 'basin',
  };
  const answer = n / d;
  return {
    fractionWorkshopModel: model, scene: fractionLineArt(model),
    say: `Siirrä merkki kohtaan ${fractionSymbol(amount)}. Yksi kokonainen on yhden yksikkövälin pituinen.`,
    hint: `Laske ${d} yhtä suurta osaväliä kahden peräkkäisen kokonaisluvun välissä. Mieti, montako kokonaista ja montako osaväliä tarvitaan.`,
    task: {
      kind: 'line', min: model.min, max: model.max, step: 1 / d, labelEvery: 1, answer,
      whyAt: {
        ...(group === 'proper' ? { [answer * model.max]: 'Koko näkyvä suora sisältää kaksi kokonaista. Jaa vain yksi yksikköväli.' } : {}),
        ...(group === 'transfer' ? { [answer + 1]: 'Suoran ensimmäinen näkyvä merkintä on 1. Murtoluvun sijainti ei siirry sen mukana.' } : {}),
        ...(group !== 'proper' ? { [model.min + (n % d) / d]: 'Tuo kohta kuvaa vain ylijääviä osia. Huomioi myös kokonaiset yksikkövälit.' } : {}),
      },
    },
    explain: `${n} osaväliä, joiden pituus on 1/${d}, tarkoittaa ${Math.floor(n / d)} kokonaista ja ${n % d}/${d} seuraavasta kokonaisesta.`,
  };
}

const line = definition({
  id: 'M-FRAC-04', stop: 'Veden osuus lukusuoralla', icon: '📏', rev: 'exp690-fraction-line-v1',
  intro: 'Aava merkitsee mallialtaan osuuden lukuna. Loikka pingottaa lukusuoran ja näyttää, mistä yhden altaan levyinen yksikköväli alkaa.',
  goal: 'Opit sijoittamaan murtoluvun lukusuoralle myös silloin, kun se ylittää yhden kokonaisen.',
  reward: 'Sopimusmerkki löytää saman kohdan mallista ja lukusuoralta.',
  produce: ['line-within-one', 'line-across-one', 'transfer'], produceWhat: 'murtoluvun sijainnin merkitsemistä',
  demo: () => {
    const basin: FractionLine = { kind: 'fraction-line', amount: { n: 5, d: 4 }, min: 0, max: 2, surface: 'basin' };
    const rope: FractionLine = { kind: 'fraction-line', amount: { n: 9, d: 4 }, min: 1, max: 4, surface: 'rope' };
    return [
      { say: 'Yhden altaan väli on nollasta yhteen. Jaa jokainen yksikköväli neljään osaan. Viisi neljäsosaa on neljä askelta yhteen ja vielä yksi askel.', scene: fractionLineArt(basin, true) },
      { say: 'Köysiasteikon näkyvä osa voi alkaa yhdestä. Yhdeksän neljäsosaa on kaksi metriä ja neljäsosa seuraavasta metristä.', scene: fractionLineArt(rope, true) },
    ];
  },
  families: { 'line-within-one': (r) => lineQuestion(r, 'proper'), 'line-across-one': (r) => lineQuestion(r, 'improper') },
  transfer: (r) => lineQuestion(r, 'transfer'),
  limit: 'Oppija merkitsee paikan valmiiksi jaetulla lukusuoralla. Oman asteikon piirtäminen ja perustelu arvioidaan erikseen.',
});

function expandQuestion(r: Rng, repair: boolean, transfer = false): Question {
  const amount = r.pick([{ n: 1, d: 3 }, { n: 2, d: 5 }, { n: 3, d: 4 }, { n: 2, d: 3 }]);
  const factor = transfer ? r.pick([4, 5]) : r.pick([2, 3]);
  const model: FractionExpand = { kind: 'fraction-expand', amount, factor, repair, surface: transfer ? 'rope' : 'basin' };
  const result = expandFraction(amount, factor);
  return {
    fractionWorkshopModel: model, scene: fractionExpandArt(model),
    say: repair ? `Luonnoksessa jaettiin vain siniset osat. Jaa jokainen vanha osa ${factor} osaan myös tyhjällä alueella. Kirjoita uusi osoittaja ja nimittäjä paloin muodossa osoittaja / nimittäjä.`
      : `Jaa jokainen vanha osa ${factor} yhtä suureen osaan. Kirjoita uusi murtoluku paloin muodossa osoittaja / nimittäjä.`,
    hint: 'Uusi jako koskee koko alkuperäistä kokonaista. Kerro sekä sinisten osien että kaikkien osien lukumäärä samalla luvulla.',
    task: sequence([...digits, '/'], writtenFraction(result), [
      [writtenFraction({ n: amount.n, d: result.d }), 'Jaoit kokonaisen hienommin. Laske uudelleen myös siniset osat samassa jaossa.'],
      [writtenFraction({ n: result.n, d: amount.d }), 'Siniset osat ovat nyt pienempiä. Myös kokonaisen osamäärä muuttuu samalla kertoimella.'],
      [writtenFraction(amount), 'Osuus on oikea, mutta tehtävä pyytää merkitsemään sen uudessa hienommassa jaossa.'],
    ]),
    explain: `Alussa sinisiä osia on ${amount.n} ja kaikkia ${amount.d}. Jokainen jaetaan ${factor} osaan, joten uusi merkintä on ${result.n}/${result.d}. Sininen määrä ei muutu.`,
  };
}

const expand = definition({
  id: 'M-FRAC-07', stop: 'Sopimuksen tarkempi ruudukko', icon: '🪟', rev: 'exp690-fraction-expand-v1',
  intro: 'Loikka tihentää mallialtaan jaotusta. Aava huolehtii siitä, että majavan sininen osuus säilyy paikallaan.',
  goal: 'Opit laventamaan murtoluvun kertomalla sekä osoittajan että nimittäjän samalla luvulla.',
  reward: 'Tarkempi ruudukko säilyttää majavan sopiman osuuden.',
  produce: ['expand-every-part', 'expand-repair-cut', 'transfer'], produceWhat: 'uuden osoittajan ja nimittäjän kirjoittamista',
  demo: () => {
    const model: FractionExpand = { kind: 'fraction-expand', amount: { n: 2, d: 3 }, factor: 2, repair: false, surface: 'basin' };
    return [
      { say: 'Sinistä on kaksi osaa kolmesta. Kun jokainen vanha osa jaetaan kahteen, myös tyhjään osaan tulee uusi raja.', scene: fractionExpandArt(model) },
      { say: 'Sinisiä osia on nyt neljä ja kaikkia kuusi. Sama määrä on sekä kaksi kolmasosaa että neljä kuudesosaa.', scene: fractionExpandArt(model, true) },
    ];
  },
  families: { 'expand-every-part': (r) => expandQuestion(r, false), 'expand-repair-cut': (r) => expandQuestion(r, true) },
  transfer: (r) => expandQuestion(r, false, true),
  limit: 'Vastaus osoittaa uuden osoittajan ja nimittäjän valitulla jakokertoimella. Leikkausmalli on käytettävissä, joten laskemista ilman kuvaa ei arvioida.',
});

const half = { n: 1, d: 2 };
const benchmarkPairs = [
  [{ n: 2, d: 5 }, { n: 3, d: 4 }],
  [{ n: 1, d: 3 }, { n: 4, d: 7 }],
  [{ n: 3, d: 7 }, { n: 2, d: 3 }],
] as const;
const sharedPairs = [
  [{ n: 2, d: 3 }, { n: 3, d: 4 }],
  [{ n: 3, d: 4 }, { n: 4, d: 6 }],
  [{ n: 2, d: 3 }, { n: 4, d: 6 }],
] as const;
const ropePairs = [
  [{ n: 4, d: 5 }, { n: 7, d: 10 }],
  [{ n: 5, d: 6 }, { n: 7, d: 9 }],
  [{ n: 3, d: 5 }, { n: 6, d: 10 }],
] as const;

function comparisonQuestion(r: Rng, method: FractionCompare['method'], transfer = false): Question {
  const [a, b] = r.pick<readonly [Fraction, Fraction]>(transfer ? ropePairs : method === 'half' ? benchmarkPairs : sharedPairs);
  const [left, right] = r.chance(.5) ? [a, b] : [b, a];
  const common = method === 'common' ? commonDenominator(left.d, right.d) : undefined;
  const model: FractionCompare = { kind: 'fraction-compare', left, right, method, common, surface: transfer ? 'rope' : 'basin' };
  const relation = compareFraction(left, right);
  const wrongSign = relation === '<' ? '>' : '<';
  const halfRelation = compareFraction(left, half);
  const otherHalf = compareFraction(half, right);
  const aCommon = common ? expandFraction(left, common / left.d) : left;
  const bCommon = common ? expandFraction(right, common / right.d) : right;
  const commonStatement = [...writtenFraction(aCommon), relation, ...writtenFraction(bCommon)];
  const halfStatement = ['A', halfRelation, '1/2', otherHalf, 'B'];
  return {
    fractionWorkshopModel: model, scene: fractionCompareArt(model),
    say: method === 'half' ? 'Näytä vertailu puolikkaaseen. Rakenna järjestyksessä A, vertailumerkki, 1/2, vertailumerkki ja B.'
      : `Lavenna A ja B samaan ${common} osan jakoon. Kirjoita paloin A:n uusi murtoluku, vertailumerkki ja B:n uusi murtoluku.`,
    hint: method === 'half' ? 'Tarkista kummassakin yhtä pitkässä kokonaisessa, yltääkö sininen osuus puolikkaaseen.'
      : 'Samanpituisista kokonaisista syntyy yhtä suuria osia, kun osia on yhtä monta. Vertaile sitten sinisten osien määriä.',
    task: method === 'half' ? sequence(['A', 'B', '1/2', '<', '=', '>'], halfStatement, [
      [['A', otherHalf === '<' ? '>' : '<', '1/2', halfRelation === '<' ? '>' : '<', 'B'],
        'Tarkista kumpikin vertailumerkki erikseen. Merkin avoin puoli osoittaa suurempaan lukuun.'],
    ]) : sequence([...digits, '/', '<', '=', '>'], commonStatement, [
      [[...writtenFraction(aCommon), wrongSign, ...writtenFraction(bCommon)], 'Kun nimittäjä on sama, suurempi osoittaja merkitsee suurempaa määrää. Yhtä suuret osoittajat merkitsevät samaa määrää.'],
      [[...writtenFraction(left), relation, ...writtenFraction(right)], 'Vertailumerkki voi olla oikein. Tässä tehtävässä näytetään myös yhteinen jako kirjoittamalla molemmat luvut uudessa jaossa.'],
    ]),
    explain: method === 'half' ? `Samoissa kokonaisissa ${fractionSymbol(left)} ${halfRelation} 1/2 ${otherHalf} ${fractionSymbol(right)}. Siksi A ${relation} B.`
      : `Yhteinen jako antaa ${fractionSymbol(aCommon)} ${relation} ${fractionSymbol(bCommon)}. Kummankin kokonaisen osat ovat nyt saman kokoisia.`,
  };
}

const comparison = definition({
  id: 'M-FRAC-09', stop: 'Kumpi ehdotus antaa enemmän?', icon: '⚖️', rev: 'exp690-fraction-compare-v1',
  intro: 'Majavan ja Aavan ehdotuksissa on eri osajaot. Loikka asettaa niiden yhtä pitkät kokonaiset rinnakkain.',
  goal: 'Opit vertaamaan eri tavoin jaettuja osuuksia puolikkaan tai yhteisen jaon avulla ja näyttämään vertailun.',
  reward: 'Pöytäkirjassa näkyvät ehdotusten todelliset osuudet ja käytetty vertailutapa.',
  produce: ['compare-benchmark-half', 'compare-common-cuts', 'transfer'], produceWhat: 'vertailun ja sen käytetyn esitystavan rakentamista',
  demo: () => {
    const basin: FractionCompare = { kind: 'fraction-compare', left: { n: 2, d: 5 }, right: { n: 3, d: 4 }, method: 'half', surface: 'basin' };
    const rope: FractionCompare = { kind: 'fraction-compare', left: { n: 4, d: 5 }, right: { n: 7, d: 10 }, method: 'common', common: 10, surface: 'rope' };
    return [
      { say: 'Kaksi viidesosaa jää puolikkaan alle. Kolme neljäsosaa ylittää puolikkaan. Puolikas auttaa vertaamaan samoja kokonaisia.', scene: fractionCompareArt(basin, true) },
      { say: 'Köydet ovat metrin mittaisia. Neljä viidesosaa on kahdeksan kymmenesosaa, enemmän kuin seitsemän kymmenesosaa. Kummankin voi jakaa kymmenykseen.', scene: fractionCompareArt(rope, true) },
    ];
  },
  families: { 'compare-benchmark-half': (r) => comparisonQuestion(r, 'half'), 'compare-common-cuts': (r) => comparisonQuestion(r, 'common') },
  transfer: (r) => comparisonQuestion(r, 'common', true),
  limit: 'Vertailuketju tai yhteiseen jakoon kirjoitetut luvut näyttävät käytetyn strategian. Strategian itsenäistä valintaa tai vapaata perustelua voi arvioida erikseen.',
});

function mixedQuestion(r: Rng, direction: FractionMixed['direction'], transfer = false): Question {
  const whole = r.int(1, 3);
  const part = r.pick([{ n: 1, d: 3 }, { n: 2, d: 5 }, { n: 3, d: 4 }, { n: 2, d: 3 }]);
  const amount = improperFraction(whole, part);
  const surface = transfer ? 'rope' : 'basin';
  const model: FractionMixed = direction === 'to-improper' ? { kind: 'fraction-mixed', direction, whole, part, surface }
    : { kind: 'fraction-mixed', direction, amount, surface };
  const grouped = mixedFraction(amount);
  const mixedAnswer = [...String(grouped.whole), '+', ...writtenFraction(grouped.part)];
  const tokens = direction === 'to-improper' ? [...digits, '/'] : [...digits, '+', '/'];
  const task = direction === 'to-improper' ? sequence(tokens, writtenFraction(amount), [
    [writtenFraction({ n: whole + part.n, d: part.d }), 'Kokonainen sisältää monta osaa. Muunna jokainen kokonainen ensin saman kokoisiksi osiksi.'],
  ]) : sequence(tokens, mixedAnswer, [
    [[...String(whole), '+', ...writtenFraction(amount)], 'Kun kokonaiset on erotettu, murto-osaan jää vain se osa, joka ylittää kokonaiset.'],
    ...(part.n === whole ? [] : [[[...String(part.n), '+', ...writtenFraction({ n: whole, d: part.d })], 'Ryhmittele täydet kokonaiset ensin. Kirjoita sitten jäljelle jäävä osa samassa jaossa.']] satisfies [string[], string][]),
  ]);
  return {
    fractionWorkshopModel: model, scene: fractionMixedArt(model), task,
    say: direction === 'to-improper'
      ? `Kirjoita ${whole} ${fractionSymbol(part)} yhtenä murtolukuna paloin, osoittaja / nimittäjä. Säilytä osan koko.`
      : `Muuta ${fractionSymbol(amount)} sekaluvuksi. Kirjoita paloin kokonaiset + osoittaja / nimittäjä. Plus erottaa tässä merkinnässä kokonaisosan murto-osasta.`,
    hint: 'Laske, montako osaa tarvitaan yhteen kokonaiseen. Pidä palojen koko samana ryhmittelyn aikana.',
    explain: `${whole} kokonaista on ${whole} · ${part.d} = ${whole * part.d} osaa. Lisäksi on ${part.n} osaa. Sama määrä on ${whole} ${fractionSymbol(part)} eli ${fractionSymbol(amount)}.`,
  };
}

const mixed = definition({
  id: 'M-FRAC-10', stop: 'Yksi allas ja vähän lisää', icon: '🧱', rev: 'exp690-fraction-mixed-v1',
  intro: 'Malliuomaan tarvitaan enemmän kuin yksi saman kokoinen annos. Aava näyttää, miten kokonaiset ja ylimääräiset osat voi lukea samasta kuvasta.',
  goal: 'Opit muuntamaan sekaluvun epämurtoluvuksi ja epämurtoluvun sekaluvuksi samassa jaossa.',
  reward: 'Täyttömäärä voidaan kirjoittaa sopimukseen kummallakin merkinnällä.',
  produce: ['mixed-to-improper', 'mixed-from-improper', 'transfer'], produceWhat: 'murtolukumerkinnän rakentamista kumpaankin suuntaan',
  demo: () => {
    const part = { n: 1, d: 3 };
    const basin: FractionMixed = { kind: 'fraction-mixed', direction: 'to-improper', whole: 2, part, surface: 'basin' };
    const rope: FractionMixed = { kind: 'fraction-mixed', direction: 'to-mixed', amount: { n: 7, d: 3 }, surface: 'rope' };
    return [
      { say: 'Kaksi kokonaista on kuusi kolmasosaa. Kun mukana on vielä yksi kolmasosa, niitä on yhteensä seitsemän.', scene: fractionMixedArt(basin, true) },
      { say: 'Seitsemän kolmasosametrin palaa ryhmittyy kahteen metrin mittaiseen kokonaisuuteen. Yksi kolmasosametri jää ryhmien lisäksi.', scene: fractionMixedArt(rope, true) },
    ];
  },
  families: { 'mixed-to-improper': (r) => mixedQuestion(r, 'to-improper'), 'mixed-from-improper': (r) => mixedQuestion(r, 'to-mixed') },
  transfer: (r) => mixedQuestion(r, r.chance(.5) ? 'to-improper' : 'to-mixed', true),
  limit: 'Oppija rakentaa molemmat merkintätavat samalla osakoolla. Vapaata selitystä tai muun nimittäjän valintaa ei pisteytetä tässä.',
});

const nestedCuts = [
  [{ n: 3, d: 4 }, { n: 1, d: 2 }],
  [{ n: 5, d: 6 }, { n: 1, d: 3 }],
  [{ n: 7, d: 8 }, { n: 1, d: 4 }],
  [{ n: 2, d: 4 }, { n: 1, d: 2 }],
] as const;
const twoCuts = [
  [{ n: 3, d: 4 }, { n: 1, d: 3 }],
  [{ n: 4, d: 5 }, { n: 1, d: 2 }],
  [{ n: 5, d: 6 }, { n: 1, d: 4 }],
] as const;
const ropeCuts = [
  [{ n: 7, d: 8 }, { n: 2, d: 3 }],
  [{ n: 4, d: 5 }, { n: 3, d: 7 }],
  [{ n: 5, d: 6 }, { n: 2, d: 5 }],
] as const;

function subtractQuestion(r: Rng, both: boolean, transfer = false): Question {
  const [left, right] = r.pick<readonly [Fraction, Fraction]>(transfer ? ropeCuts : both ? twoCuts : nestedCuts);
  const task: FractionSubtractTask = { kind: 'fraction-subtract', left, right, surface: transfer ? 'rope' : 'basin' };
  const { common } = solutionFractionSubtract(task);
  const parts = subtractionPartition(task, common);
  return {
    fractionWorkshopModel: task, task,
    say: transfer ? 'Leikkaa köydestä merkitty osuus. Kirjoita yhteisen jaon osamäärä sekä jäljelle jäävä osuus yhdestä metristä.'
      : 'Majavan osa otetaan lähtömäärästä. Kirjoita yhteisen jaon osamäärä sekä putoukselle jäävä murtoluku.',
    hint: 'Etsi osamäärä, jonka saa kertomalla kumpaakin alkuperäistä nimittäjää. Vähennä vasta, kun palat ovat yhtä suuria.',
    explain: `Esimerkiksi ${common} osan jaossa lähtömäärä on ${parts.starting}/${common} ja vähennetään ${parts.removed}/${common}. Jäljelle jää ${parts.remaining}/${common} samasta kokonaisesta. Myös toinen yhteinen jako voi toimia.`,
  };
}

const subtract = definition({
  id: 'M-FRAC-14', stop: 'Mikä osuus kuuluu putoukselle?', icon: '🪨', rev: 'exp690-fraction-subtract-v1',
  intro: 'Majavan varaus ja mallialtaan lähtömäärä on merkitty eri osajaoin. Aava selvittää, kuinka paljon putouksen pienoismallille jää.',
  goal: 'Opit tekemään erinimisistä murtoluvuista samankokoisia osia ja vähentämään niiden lukumäärät.',
  reward: 'Putouksen pienoismalli saa lasketun osuuden ja hiljainen solina alkaa.',
  produce: ['subtract-one-cut', 'subtract-two-cuts', 'transfer'], produceWhat: 'yhteisen jaon ja erotuksen kirjoittamista',
  demo: () => {
    const model: FractionSubtractTask = { kind: 'fraction-subtract', left: { n: 3, d: 4 }, right: { n: 1, d: 3 }, surface: 'basin' };
    const rope: FractionSubtractTask = { ...model, surface: 'rope' };
    const steps: DemoStep[] = [
      { say: 'Samasta kokonaisesta on varattu kolme neljäsosaa. Siitä otetaan yksi kolmasosa. Neljäsosat ja kolmasosat ovat erikokoisia.', scene: fractionSubtractArt(model) },
      { say: 'Jaetaan kumpikin kokonainen kahteentoista yhtä suureen osaan. Lähtömäärä on yhdeksän kahdestoistaosaa ja vähennettävä määrä neljä kahdestoistaosaa.', scene: fractionSubtractArt(model, 12) },
      { say: 'Viisi kahdestoistaosaa jää. Saman osuuden voi näyttää metrin köydellä. Myös jako 24 osaan toimii: silloin jää kymmenen kahdeskymmenesneljäsosaa.', scene: fractionSubtractArt(rope, 24, true) },
    ];
    return steps;
  },
  families: { 'subtract-one-cut': (r) => subtractQuestion(r, false), 'subtract-two-cuts': (r) => subtractQuestion(r, true) },
  transfer: (r) => subtractQuestion(r, true, true),
  limit: 'Vastaus sisältää pätevän yhteisen jaon ja oikean erotuksen samasta kokonaisesta. Lasku koskee mallissa annettuja määriä. Fyysistä virtaamaa tai suullista perustelua ei arvioida.',
});

const entries = [line, expand, comparison, mixed, subtract];
export const fractionWorkshopSpecs: NodeSpec[] = entries.map(({ spec }) => spec);
export const fractionWorkshopEvidence: Readonly<Record<string, { families: readonly string[]; limit: string }>> =
  Object.fromEntries(entries.map(({ spec, evidence }) => [spec.id, evidence]));
