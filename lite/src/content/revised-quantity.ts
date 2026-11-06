import type { Rng } from '../engine/rng';
import type { DemoStep, Item, NodeSpec, Task } from '../engine/types';
import { fmt } from './fi';
import { cases, choose, txt } from './kit';
import {
  amountOf, baseOf, fractionShare, levelValues, percentChange, percentOf, percentPlan,
  type EqualLevel, type FractionSplit, type QuantityBoard,
} from './models/quantity';
import { fractionSplitArt, meanLevelArt, quantityArt } from './scenes/quantity-workbench';

type QuantityModel = FractionSplit | EqualLevel | QuantityBoard;
export type RevisedQuantityItem = Item & { quantityModel: QuantityModel };
type Question = Omit<RevisedQuantityItem, 'tag'>;
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

const numeric = (answer: number, unit: string, whyAt?: Record<number, string>): Task =>
  ({ kind: 'numeric', answer, unit, whyAt });
const boardDemo = (quantityModel: QuantityBoard, say: string): DemoStep =>
  ({ say, scene: quantityArt(quantityModel) });

function splitQuestion(r: Rng, recut: boolean, transfer = false): Question {
  const [n, d, recipients] = transfer ? r.pick([[3, 4, 2], [2, 3, 4], [1, 3, 2]]) :
    recut ? r.pick([[1, 2, 3], [2, 5, 3], [3, 4, 2]]) : r.pick([[4, 6, 2], [3, 5, 3], [4, 5, 2]]);
  const model: FractionSplit = { kind: 'fraction-split', shape: transfer ? 'strip' : 'cake', n: n!, d: d!, recipients: recipients! };
  const answer = fractionShare(model);
  const whole = model.shape === 'cake' ? 'yhdestä kokonaisesta kakusta' : 'yhdestä metristä';
  return {
    quantityModel: model, scene: fractionSplitArt(model),
    say: `Jaa ${n}/${d} ${whole} tasan ${recipients} saajalle. Kirjoita yhden saajan osuus samasta kokonaisesta.`,
    hint: `Jaettava pala on ${n}/${d} alkuperäisestä kokonaisesta. Jakaminen saajille pienentää osuutta tästä samasta kokonaisesta.`,
    task: { kind: 'frac', ...answer },
    explain: `Jaettava ${n}/${d} jaetaan ${recipients} yhtä suureen osuuteen. Yksi saaja saa ${answer.n}/${answer.d} ${whole}. Jos saat 1/${recipients}, tarkista, oletko verrannut saajan osaa vain jaettavaan palaan.`,
  };
}

const split = definition({
  id: 'M-FRAC-16', stop: 'Pieni osuus jaetaan reilusti', icon: '🍰', rev: 'exp690-fraction-split-v1',
  intro: 'Majavan pöydällä on osa kakusta. Aava haluaa jakaa sen tasan niin, että alkuperäinen kakku pysyy vertailussa mukana.',
  goal: 'Opit jakamaan murto-osan yhtä suuriksi osuuksiksi ja ilmoittamaan yhden osuuden alkuperäisestä kokonaisesta.',
  reward: 'Jokaisella saajalla on yhtä suuri pala ja alkuperäisen kakun koko näkyy vielä pöydällä.',
  produce: ['split-existing', 'split-recut', 'transfer'], produceWhat: 'murtoluvun kirjoittamista jaon tuloksena',
  demo: () => {
    const cake: FractionSplit = { kind: 'fraction-split', shape: 'cake', n: 1, d: 2, recipients: 3 };
    const strip: FractionSplit = { ...cake, shape: 'strip' };
    return [
      { say: 'Pöydällä on puolet alkuperäisestä kakusta. Kolme saajaa saa kukin yhtä suuren osuuden.', scene: fractionSplitArt(cake) },
      { say: 'Kun puolikas jaetaan kolmeen, jokainen saa yhden kuudesosan alkuperäisestä kakusta. Alkuperäinen puolikkaan raja näkyy yhä.', scene: fractionSplitArt(cake, true) },
      { say: 'Sama jako näkyy nauhassa. Puoli metriä jaetaan kolmeen yhtä pitkään osaan. Jokainen on yhden kuudesosametrin pituinen.', scene: fractionSplitArt(strip, true) },
    ];
  },
  families: { 'split-existing': (r) => splitQuestion(r, false), 'split-recut': (r) => splitQuestion(r, true) },
  transfer: (r) => splitQuestion(r, true, true),
  limit: 'Murtolukuvastaus osoittaa osuuden samasta kokonaisesta. Leikkausjärjestys ja vapaa perustelu vaativat oman havaintonsa.',
});

function meanQuestion(r: Rng, audit: boolean, transfer = false): Question {
  const values = transfer ? r.pick([[9, 14], [11, 16], [8, 15]]) :
    r.pick([[1, 4, 7], [1, 2, 9], [2, 3, 10], [1, 4, 10]].slice(audit ? 0 : 1));
  const model: EqualLevel = { kind: 'equal-level', values, material: transfer ? 'strips' : 'blocks' };
  const { total, count, value } = levelValues(model);
  const unit = transfer ? 'cm' : 'palikkaa';
  const explain = `Alussa on yhteensä ${fmt(total)} ${unit} ja ${count} havaintoa. Tasauksessa niitä on edelleen yhtä monta, joten yksi osuus on ${fmt(total)} : ${count} = ${fmt(value)} ${unit}. Alkuperäiset havainnot jäävät ennalleen.`;
  const task = audit ? choose(r, txt(`Jokaiseen sarakkeeseen ${value} palikkaa. Alkuperäiset havainnot säilyvät taulukossa.`), [
    txt(`Jokaiseen sarakkeeseen ${values[0]} palikkaa, koska tämä luku on yksi havainnoista.`),
    txt(`Jokaiseen sarakkeeseen ${value} palikkaa. Tämä tarkoittaa, että kaikki alkuperäiset havainnot olivat samat.`),
    txt(`Jokaiseen sarakkeeseen ${value + 1} palikkaa. Tasauksen lopussa kokonaismäärä saa kasvaa.`),
  ], [
    'Tasattu arvo voi erota kaikista havainnoista. Tarkista säilyykö kokonaismäärä.',
    'Tasattu korkeus kuvaa vertailuarvoa. Alkuperäinen havaintotaulukko säilyy.',
    'Tasauksessa palikoita siirretään paikasta toiseen. Niitä ei lisätä.',
  ], 1) : numeric(value, unit, {
    [total]: 'Tuo on koko aineiston summa. Jaa se yhtä moneen osaan kuin havaintoja on.',
    [values[0]!]: 'Alkuperäinen havainto ei välttämättä ole keskiarvo. Tasaa kaikki havainnot samalla kokonaismäärällä.',
  });
  return {
    quantityModel: model, scene: meanLevelArt(model), task, explain,
    say: transfer ? 'Nauhat voi leikata. Jos jaat niiden yhteispituuden kahteen yhtä pitkään osaan, kuinka pitkä yksi osa on?'
      : audit ? 'Valitse tasaus, joka säilyttää palikoiden määrän ja alkuperäiset havainnot.' : 'Siirrä palikoita mielessäsi, kunnes sarakkeet ovat yhtä korkeat. Kuinka monta palikkaa tulee kuhunkin?',
    hint: 'Pidä sekä kokonaismäärä että havaintojen lukumäärä samoina.',
  };
}

const mean = definition({
  id: 'M-STAT-04', stop: 'Sarakkeet samalle tasolle', icon: '📊', rev: 'exp690-mean-level-v1',
  intro: 'Loikka merkitsee kolme havaintomäärää samankokoisilla yksikköpalikoilla. Aava kysyy, miltä tasattu vertailu näyttäisi.',
  goal: 'Opit löytämään tasatun arvon siten, että kokonaismäärä ja havaintojen lukumäärä säilyvät.',
  reward: 'Tutkimuspöydässä näkyvät sekä alkuperäiset havainnot että uusi vertailuarvo.',
  produce: ['mean-level', 'transfer'], produceWhat: 'tasatun arvon laskemista',
  demo: () => {
    const blocks: EqualLevel = { kind: 'equal-level', values: [1, 4, 7], material: 'blocks' };
    const strips: EqualLevel = { kind: 'equal-level', values: [10, 15], material: 'strips' };
    return [
      { say: 'Kolmessa sarakkeessa on 1, 4 ja 7 samankokoista palikkaa. Yhteensä niitä on 12.', scene: meanLevelArt(blocks) },
      { say: 'Siirrä kolme palikkaa korkeimmasta sarakkeesta matalimpaan. Nyt jokaiseen tulee neljä. Haamut näyttävät, mistä aloitettiin.', scene: meanLevelArt(blocks, true) },
      { say: 'Nauhasta voi leikata myös puolikkaita senttimetrejä. Siirrä pitemmästä nauhasta 2,5 senttimetriä lyhyempään, niin kumpikin on 12,5 senttimetriä pitkä. Sauma näyttää siirretyn osan.', scene: meanLevelArt(strips, true) },
    ];
  },
  families: { 'mean-level': (r) => meanQuestion(r, false), 'mean-audit': (r) => meanQuestion(r, true) },
  transfer: (r) => meanQuestion(r, false, true),
  limit: 'Lukuvastaus näyttää tasatun arvon. Valinta näyttää tasauksen ja alkuperäisten havaintojen erottamista. Käsin tehty siirto vaatii oman havaintonsa.',
});

function referenceQuestion(r: Rng, change: boolean, transfer = false): Question {
  const base = r.pick([40, 60, 80]);
  const part = base / 4;
  const baseName = transfer ? 'Kaikki retkivarusteet' : change ? 'Varasto ennen toimitusta' : 'Koko rakennustilaus';
  const partName = transfer ? 'Ensiapuun varatut varusteet' : change ? 'Toimituksen lisäys' : 'Majavalle varattu osa';
  const unit = transfer ? 'kpl' : 'palaa';
  const model: QuantityBoard = {
    kind: 'quantity-board', view: transfer ? 'ledger' : 'tiles', unit, reference: change ? 'määrä ennen toimitusta' : 'koko alkuperäinen joukko',
    rows: [{ label: baseName, amount: base, ...(change ? {} : { marked: part }) }, { label: partName, amount: part },
      ...(change ? [{ label: 'Varasto toimituksen jälkeen', amount: base + part, marked: part }] : [])],
    notes: [change ? 'Toimitus suurensi varastoa 25 % lähtötilasta.' : 'Nimettyyn käyttötarkoitukseen varataan 25 % kokonaismäärästä.'],
  };
  const task: Task = change ? choose(r, txt(`${base} ${unit} ennen toimitusta`), [
    txt(`${base + part} ${unit} toimituksen jälkeen`), txt(`${part} ${unit} toimituksessa`), txt('25 %'),
  ], [
    'Vertailun lähtökohta on määrä ennen toimitusta. Toimituksen jälkeen määrä on jo muuttunut.',
    'Toimitus on määrän lisäys. Vertailun lähtökohta on varasto ennen toimitusta.',
    '25 % ilmaisee lisäyksen osuuden. Etsi se määrä, johon lisäys suhteutetaan.',
  ], 1) : {
    kind: 'place',
    slots: [{ id: 'base', text: 'Perusarvo · koko määrä' }, { id: 'part', text: 'Prosenttiarvo · varattu määrä' }, { id: 'percent', text: 'Prosenttiluku · osuus' }],
    tokens: r.shuffle([{ id: 'whole', text: `${base} ${unit}` }, { id: 'reserved', text: `${part} ${unit}` }, { id: 'share', text: '25 %' }]),
    answer: { base: 'whole', part: 'reserved', percent: 'share' },
    why: { base: 'Perusarvo on koko alkuperäinen joukko.', part: 'Prosenttiarvo on tähän tarkoitukseen varattu kappalemäärä.', percent: 'Prosenttiluku kertoo osuuden sadasta.' },
  };
  return {
    quantityModel: model, scene: quantityArt(model), task,
    say: change ? 'Mikä määrä on tämän muutoksen perusarvo?' : 'Yhdistä koko määrä, varattu määrä ja prosenttiluku oikeisiin kohtiin.',
    hint: 'Kysy ensin, mistä alkuperäisestä määrästä prosentti on laskettu.',
    explain: `Vertailun perusarvo on ${base} ${unit}. ${part} ${unit} on ${change ? 'lisäyksen' : 'varauksen'} määrä eli 25 % perusarvosta.`,
  };
}

const reference = definition({
  id: 'M79-PCT-REFBASE', stop: 'Kenen sata osaa', icon: '🪵', rev: 'exp690-percent-reference-v1',
  intro: 'Majavan tilauksessa näkyvät koko rakennuspalajoukko ja sivupatoon varattu osa. Aava nimeää, mistä määrästä 100 % muodostuu.',
  goal: 'Opit löytämään vertailun perusarvon ja erottamaan sen prosenttiluvusta ja osan määrästä.',
  reward: 'Varastotaulun kolme lukua saavat yksiselitteiset nimet.',
  demo: () => [boardDemo({
    kind: 'quantity-board', view: 'tiles', unit: 'palaa', reference: 'koko rakennustilaus, 40 palaa',
    rows: [{ label: 'Koko tilaus', amount: 40, marked: 10, base: true }, { label: 'Majavalle varattu', amount: 10 }],
  }, 'Koko tilaus, 40 rakennuspalaa, on perusarvo eli 100 prosenttia. Majavalle varattu 10 palaa on prosenttiarvo, ja 25 prosenttia kertoo, kuinka suuri osuus se on.')],
  families: { 'reference-roles': (r) => referenceQuestion(r, false), 'reference-before': (r) => referenceQuestion(r, true) },
  transfer: (r) => referenceQuestion(r, false, true),
  limit: 'Näyttö koskee annettujen lukujen roolien ja perusarvon tunnistamista. Prosenttilaskeminen arvioidaan erikseen.',
});

function shareQuestion(r: Rng, combine: boolean, transfer = false): Question {
  const base = transfer ? r.pick([20, 40, 60]) : r.pick([40, 60, 80]);
  const [firstPercent, secondPercent] = combine
    ? r.pick([[10, 15], [20, 10], [25, 25], [20, 40]] as const)
    : [r.pick([20, 25, 40, 50]), 0];
  const first = amountOf(firstPercent, base);
  const second = amountOf(secondPercent, base);
  const part = first + second;
  const answer = percentOf(part, base);
  const unit = transfer ? 'ruutua' : 'palaa';
  const model: QuantityBoard = {
    kind: 'quantity-board', view: transfer ? 'ledger' : 'tiles', unit,
    reference: `kaikki ${base} ${unit}`,
    rows: [{ label: transfer ? 'Kaikki seurantaruutujen paikat' : 'Koko tilaus', amount: base, marked: part, base: true },
      { label: transfer ? 'Merkityt ruudut' : combine ? 'Varaus A' : 'Varattu sivupatoon', amount: first },
      ...(combine ? [{ label: 'Varaus B', amount: second }] : [])],
    notes: combine ? ['Varaukset A ja B koostuvat eri paloista.'] : [],
  };
  return {
    quantityModel: model, scene: quantityArt(model),
    say: combine ? 'Kuinka monta prosenttia koko tilauksesta nämä kaksi erillistä varausta ovat yhteensä?'
      : transfer ? 'Kuinka monta prosenttia kaikista seurantaruutujen paikoista on merkitty?' : 'Kuinka monta prosenttia koko tilauksesta on varattu sivupatoon?',
    hint: 'Laske ensin kysytty osamäärä. Jaa se koko määrällä ja kerro sadalla.',
    task: numeric(answer, '%', {
      [base / part * 100]: 'Jaa osan määrä koko määrällä, jolloin saat osan osuuden.',
      [part]: 'Kappalemäärä ja prosenttiosuus voivat olla eri lukuja. Suhteuta osa koko määrään.',
      ...(combine ? { [percentOf(first, base)]: 'Huomioi myös toisen varauksen palat.' } : {}),
    }),
    explain: `${combine ? `Yhteensä on ${first} + ${second} = ${part} varattua palaa. ` : ''}Osa on ${part} ${unit} ja kokonainen on ${base} ${unit}. ${part} : ${base} · 100 % = ${fmt(answer)} %.`,
  };
}

const share = definition({
  id: 'M79-PCT-SHARE', stop: 'Sivupadon palat', icon: '🟧', rev: 'exp690-percent-share-v1',
  intro: 'Majava varaa rakennuspaloja sivupatoon. Aava haluaa merkitä varaston tauluun, kuinka suuri osuus paloja on varattu.',
  goal: 'Opit laskemaan, kuinka monta prosenttia annettu osa on nimetystä kokonaismäärästä.',
  reward: 'Rakennuspöydän kyltti kertoo varauksen osuuden.',
  produce: ['share-one', 'share-combine', 'transfer'], produceWhat: 'prosenttiosuuden laskemista',
  demo: () => [boardDemo({
    kind: 'quantity-board', view: 'tiles', unit: 'palaa', reference: 'koko sadan palan tilaus',
    rows: [{ label: 'Koko tilaus, varatut kultaisina', amount: 100, marked: 40, base: true }],
    notes: ['Majavalle on varattu 40 palaa.'],
  }, 'Neljäkymmentä palaa sadasta on 40 prosenttia. Jos koko määrä on jokin muu kuin sata, jaa ensin varattu määrä koko määrällä.')],
  families: { 'share-one': (r) => shareQuestion(r, false), 'share-combine': (r) => shareQuestion(r, true) },
  transfer: (r) => shareQuestion(r, false, true),
  limit: 'Vastaus osoittaa prosenttiosuuden laskemista, kun perusarvo on nimetty. Perusarvon itsenäinen tunnistaminen vaatii erillisen tehtävän.',
});

function amountQuestion(r: Rng, remaining: boolean, transfer = false): Question {
  const base = r.pick(transfer ? [40, 60, 100] : [60, 80, 100]);
  const percent = r.pick([20, 25, 40]);
  const wanted = remaining ? 100 - percent : percent;
  const amount = amountOf(wanted, base);
  const unit = transfer ? 'm²' : 'palaa';
  const model: QuantityBoard = {
    kind: 'quantity-board', view: transfer ? 'ruler' : 'tiles', unit, givenPercent: percent, reference: `koko ${transfer ? 'puutarha' : 'rakennustilaus'}, ${base} ${unit}`,
    rows: [{ label: transfer ? 'Puutarhan pinta-ala' : 'Koko tilaus', amount: base, base: true }],
    notes: [transfer ? `Varjostuskankaalla peitetään ${percent} % puutarhasta.` : `Majavan sivupatoon varataan ${percent} % tilauksesta.`],
  };
  return {
    quantityModel: model, scene: quantityArt(model),
    say: remaining ? 'Kuinka monta palaa jää muihin töihin, kun majavan osuus varataan?'
      : transfer ? 'Kuinka monta neliömetriä puutarhasta varjostetaan? Kirjoita lukumäärä yksi numero kerrallaan ja lisää pinta-alan yksikkö.'
        : 'Kuinka monta rakennuspalaa majavan työhön varataan?',
    hint: remaining ? 'Poista varattu prosenttiosuus sadasta ennen kuin lasket jäljelle jäävän määrän.'
      : 'Kerro koko määrä osuudella, joka saadaan jakamalla prosenttiluku sadalla.',
    task: transfer ? {
      kind: 'build', mode: 'seq', target: `${digitSequence(amount)} m²`, tokens: [...digits, 'm', 'm²', '%'], max: 5,
      whyAt: {
        [`${digitSequence(amount)} m`]: 'Metri mittaa pituutta. Puutarhan varjostus on pinta-ala.',
        [`${digitSequence(amount)} %`]: 'Tulos kertoo varjostetun pinta-alan määrän neliömetreinä.',
      },
    } : numeric(amount, unit, {
      [base + percent]: 'Prosenttilukua ei lisätä kappalemäärään. Laske pyydetty osuus kokonaismäärästä.',
      ...(remaining ? { [amountOf(percent, base)]: 'Tuo on varattu määrä. Kysymys koskee jäljelle jäävää määrää.' } : {}),
    }),
    explain: `${remaining ? `Jäljelle jää ${100} − ${percent} = ${wanted} %. ` : ''}${wanted}/100 · ${base} = ${fmt(amount)} ${unit}.`,
  };
}

const amount = definition({
  id: 'M79-PCT-AMOUNT', stop: 'Tilauksen varaus', icon: '📦', rev: 'exp690-percent-amount-v1',
  intro: 'Loikka lukee varauslapusta prosentin. Aava tarvitsee tietää, montako samanlaista rakennuspalaa varastosta siirretään.',
  goal: 'Opit muuttamaan annetun prosenttiosuuden rakennuspalojen määräksi tai muuksi annetuksi yksiköksi.',
  reward: 'Majavan rakennuspalat kootaan oikean kokoiseen varaukseen.',
  produce: ['amount-reserve', 'amount-remaining', 'transfer'], produceWhat: 'prosenttiosuutta vastaavan määrän laskemista',
  demo: () => {
    const model: QuantityBoard = { kind: 'quantity-board', view: 'tiles', unit: 'palaa', reference: 'kaikki 80 rakennuspalaa',
      rows: [{ label: 'Koko tilaus', amount: 80, base: true }], notes: ['Majavalle varataan 25 %.'] };
    return [
      boardDemo(model, 'Koko tilauksessa on 80 samanlaista palaa. Neljä yhtä suurta ryhmää muodostaa koko tilauksen.'),
      boardDemo({ ...model, rows: [{ label: 'Koko tilaus', amount: 80, marked: 20, base: true }, { label: 'Majavan ryhmä', amount: 20, marked: 20 }] },
        'Yksi neljästä ryhmästä vastaa 25 prosenttia. Majavalle varataan 25 sadasosaa 80 palasta eli 20 palaa.'),
    ];
  },
  families: { 'amount-reserve': (r) => amountQuestion(r, false), 'amount-remaining': (r) => amountQuestion(r, true) },
  transfer: (r) => amountQuestion(r, false, true),
  limit: 'Oppija laskee määrän. Yksikön valinta näkyy siirtotehtävässä, jossa oppija lisää pinta-alan yksikön itse.',
});

function baseQuestion(r: Rng, remaining: boolean, transfer = false): Question {
  const knownPercent = remaining ? r.pick([25, 40, 50]) : r.pick([20, 25, 30]);
  const total = r.pick([40, 60, 80]);
  const partPercent = remaining ? 100 - knownPercent : knownPercent;
  const part = amountOf(partPercent, total);
  const unit = transfer ? 'kpl' : 'palaa';
  const known = remaining ? 'Jäljellä oleva määrä' : 'Majavalle varattu määrä';
  const model: QuantityBoard = {
    kind: 'quantity-board', view: transfer ? 'ledger' : 'ruler', unit, givenPercent: knownPercent, referencePartPercent: partPercent, reference: 'alkuperäinen tilaus, määrä tuntematon',
    rows: [{ label: 'Koko alkuperäinen tilaus', amount: null, base: true }, { label: known, amount: part }],
    notes: [remaining ? `Alkuperäisestä tilauksesta on jo jaettu ${knownPercent} %.` : `Majavalle on varattu ${knownPercent} % alkuperäisestä tilauksesta.`],
  };
  return {
    quantityModel: model, scene: quantityArt(model),
    say: transfer ? 'Täydennä varusteluettelo. Montako varustetta oli alun perin?' : 'Montako rakennuspalaa alkuperäisessä tilauksessa oli?',
    hint: 'Selvitä, kuinka suuri prosenttiosuus tunnettu määrä on. Kulje sitten tästä osuudesta takaisin sataan prosenttiin.',
    task: numeric(baseOf(part, partPercent), unit, {
      [amountOf(partPercent, part)]: 'Tunnettu määrä on vain osa tilauksesta. Älä laske osuutta siitä uudelleen.',
      [part]: 'Tuo on tunnettu osa. Koko tilauksessa on enemmän.',
      ...(remaining ? { [baseOf(part, knownPercent)]: 'Annettu prosenttiluku kertoo jaetun osuuden. Tunnettu kappalemäärä on jäljellä oleva osa.' } : {}),
    }),
    explain: `${remaining ? `Jäljellä on 100 − ${knownPercent} = ${partPercent} %. ` : ''}Kokonaismäärä on ${part} · 100 : ${partPercent} = ${total} ${unit}. Tarkistus: ${partPercent}/100 · ${total} = ${part} ${unit}.`,
  };
}

const base = definition({
  id: 'M79-PCT-BASE', stop: 'Kokonainen piilossa', icon: '🏷️', rev: 'exp690-percent-base-v1',
  intro: 'Koko tilauksen määrälappu puuttuu. Majavan osan määrä ja prosentti ovat tallessa, joten Aava selvittää alkuperäisen määrän.',
  goal: 'Opit ratkaisemaan koko määrän tunnetusta prosenttiosuudesta ja tarkistamaan tuloksen.',
  reward: 'Kadonnut kokonaismäärä merkitään takaisin varastotauluun.',
  produce: ['base-from-reservation', 'base-from-remainder', 'transfer'], produceWhat: 'perusarvon ratkaisemista',
  demo: () => {
    const model: QuantityBoard = { kind: 'quantity-board', view: 'ruler', unit: 'palaa', reference: 'koko tilaus', referencePartPercent: 30,
      rows: [{ label: 'Koko tilaus', amount: null, base: true }, { label: 'Tunnettu 30 %', amount: 24 }] };
    return [
      boardDemo(model, 'Majavan 24 palaa on 30 prosenttia. Jaetaan nämä kolmeen yhtä suureen ryhmään. Yksi kahdeksan palan ryhmä vastaa kymmentä prosenttia.'),
      boardDemo({ ...model, view: 'tiles', reference: '80 palaa', rows: [{ label: 'Koko tilaus', amount: 80, marked: 24, base: true }] },
        'Sata prosenttia on kymmenen kahdeksan palan ryhmää eli 80 palaa. Tarkista, että 30 prosenttia 80 palasta on 24 palaa.'),
    ];
  },
  families: { 'base-from-reservation': (r) => baseQuestion(r, false), 'base-from-remainder': (r) => baseQuestion(r, true) },
  transfer: (r) => baseQuestion(r, true, true),
  limit: 'Vastaus osoittaa perusarvon laskemista nollasta poikkeavasta osuudesta. Palautustarkistus näytetään palautteessa. Oppijan oman tarkistuksen voi arvioida erikseen.',
});

const signed = (n: number) => fmt(n).replace('-', '−');
const digitSequence = (n: number) => [...signed(n)].join(' ');
const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const pairs = [[20, 25], [25, 40], [40, 80], [32, 50], [20, 50]] as const;

function changeBoard(before: number, after: number, view: QuantityBoard['view'] = 'tiles'): QuantityBoard {
  return {
    kind: 'quantity-board', view, unit: 'palaa', reference: `lähtötilan ${before} palaa`,
    rows: [{ label: 'Alussa', amount: before, marked: before > after ? before - after : undefined, markEnd: true, base: true },
      { label: 'Lopussa', amount: after, marked: after > before ? after - before : undefined, markEnd: true }],
    notes: ['Kultaiset palat kuvaavat lisättyä tai poistettua määrää.'],
  };
}

function changeQuestion(r: Rng, decrease: boolean, transfer = false): Question {
  const [low, high] = r.pick(pairs);
  const [before, after] = decrease ? [high, low] : [low, high];
  const model = changeBoard(before, after, transfer ? 'ruler' : 'tiles');
  const delta = after - before;
  const answer = percentChange(before, after);
  return {
    quantityModel: model, scene: quantityArt(model),
    say: transfer ? 'Tilaus palaa suuremmasta määrästä aiempaan pienempään määrään. Laske paluun muutosprosentti etumerkillä.'
      : 'Laske muutosprosentti. Käytä miinusta, jos määrä pieneni.',
    hint: 'Vähennä loppumäärästä alkumäärä. Jaa erotus juuri tämän muutoksen alkumäärällä.',
    task: numeric(answer, '%', {
      [delta]: 'Tuo on muutos paloina. Jaa erotus alkumäärällä ja kerro sadalla.',
      [percentOf(delta, after)]: 'Vertailu alkaa taulun alkumäärästä. Loppumäärä ei ole tämän suunnan perusarvo.',
      [-answer]: 'Tarkista etumerkki: kasvulla on positiivinen ja pienenemisellä negatiivinen muutosprosentti.',
    }),
    explain: `Muutos on ${after} − ${before} = ${signed(delta)} palaa. ${signed(delta)} : ${before} · 100 % = ${signed(answer)} %. Käänteisessä suunnassa perusarvo on ${after} ja muutosprosentti ${signed(percentChange(after, before))} %.`,
  };
}

const change = definition({
  id: 'M79-PCT-CHANGE', stop: 'Varaston muutos', icon: '↕️', rev: 'exp690-percent-change-v1',
  intro: 'Majavan varaston määrä muuttuu toimituksessa. Aava vertaa lisäystä tai vähennystä siihen, mitä hyllyllä oli muutoksen alussa.',
  goal: 'Opit laskemaan muutosprosentin oikeasta lähtöarvosta ja merkitsemään pienenemisen miinuksella.',
  reward: 'Seurantataulu kertoo muutoksen määrän, suunnan ja vertailupohjan.',
  produce: ['change-increase', 'change-decrease', 'transfer'], produceWhat: 'etumerkillisen muutosprosentin laskemista',
  demo: () => [
    boardDemo(changeBoard(20, 30), 'Varastossa oli 20 palaa ja nyt on 30. Kymmenen uutta palaa on puolet lähtötilan määrästä, joten kasvu on 50 prosenttia.'),
    boardDemo(changeBoard(25, 20, 'ruler'), 'Tässä paluussa lähtömäärä on 25 ja loppumäärä 20. Viisi poistettua palaa on viidesosa lähtömäärästä, joten muutos on miinus 20 prosenttia.'),
  ],
  families: { 'change-increase': (r) => changeQuestion(r, false), 'change-decrease': (r) => changeQuestion(r, true) },
  transfer: (r) => changeQuestion(r, true, true),
  limit: 'Näyttö koskee muutosprosenttia annetuista positiivisista lähtöarvoista. Nollasta alkavaa suhteellista muutosta ei arvioida tässä.',
});

function comparisonBoard(low: number, high: number, larger: boolean, transfer: boolean): QuantityBoard {
  const [a, b] = transfer ? ['Rantareitti', 'Metsäreitti'] : ['Aavan tilaus', 'Majavan tilaus'];
  const unit = transfer ? 'm' : 'palaa';
  return {
    kind: 'quantity-board', view: transfer ? 'ruler' : 'tiles', unit,
    reference: `${larger ? a : b}, ${larger ? low : high} ${unit}`,
    rows: [{ label: a, amount: low, base: larger }, { label: b, amount: high, marked: high - low, markEnd: true, base: !larger }],
    notes: [`Määrät ovat samassa yksikössä. ${transfer ? 'Palkit käyttävät samaa asteikkoa.' : 'Jokainen ruutu vastaa yhtä rakennuspalaa.'}`],
  };
}

function comparisonQuestion(r: Rng, larger: boolean, transfer = false): Question {
  const [low, high] = r.pick(pairs);
  const model = comparisonBoard(low, high, larger, transfer);
  const [a, b] = model.rows;
  const delta = high - low;
  const denominator = larger ? low : high;
  const answer = percentOf(delta, denominator);
  return {
    quantityModel: model, scene: quantityArt(model),
    say: larger ? `Kuinka monta prosenttia suurempi on ${b!.label} kuin ${a!.label}?`
      : transfer ? 'Kuinka monta prosenttia lyhyempi rantareitti on kuin metsäreitti?'
        : 'Kuinka monta prosenttia pienempi Aavan tilaus on kuin majavan tilaus?',
    hint: 'Laske määrien erotus. Jaa erotus sillä määrällä, johon kysymys vertaa.',
    task: numeric(answer, '%', {
      [percentOf(delta, larger ? high : low)]: 'Tuo on vastakkaisen vertailusuunnan tulos. Katso, kumpi määrä on nimetty sadaksi prosentiksi.',
      [delta]: 'Erotus on vielä alkuperäisessä yksikössä. Suhteuta se perusarvoon.',
      [-answer]: 'Suunta on jo kysymyksessä. Vastaa, kuinka monta prosenttia.',
    }),
    explain: `Erotus on ${delta} ${model.unit}. Tässä perusarvo on ${denominator} ${model.unit}: ${delta} : ${denominator} · 100 % = ${fmt(answer)} %. Vastakkaisessa suunnassa jakajana olisi ${larger ? high : low}.`,
  };
}

const comparison = definition({
  id: 'M79-PCT-COMP', stop: 'Kahden tilauksen vertailu', icon: '📏', rev: 'exp690-percent-compare-v1',
  intro: 'Aavan ja majavan tilauksissa on eri määrä samanlaisia rakennuspaloja. Loikka selvittää, kuinka paljon eroa on kummastakin tilauksesta katsottuna.',
  goal: 'Opit laskemaan kahden määrän eron prosentteina nimenomaan kysytystä vertailuarvosta.',
  reward: 'Varastotaulun kumpikin vertailulause kertoo, mistä määrästä prosentti laskettiin.',
  produce: ['compare-larger', 'compare-smaller', 'transfer'], produceWhat: 'vertailuprosentin laskemista',
  demo: () => [
    boardDemo(comparisonBoard(40, 50, true, false), 'Majavan tilaus on 10 palaa suurempi kuin Aavan 40 palan tilaus. Kymmenen on neljäsosa neljästäkymmenestä eli 25 prosenttia.'),
    boardDemo(comparisonBoard(40, 50, false, false), 'Vaihdetaan 100 prosentin vertailupohjaksi majavan 50 palaa. Sama kymmenen palan ero on nyt viidesosa eli 20 prosenttia.'),
  ],
  families: { 'compare-larger': (r) => comparisonQuestion(r, true), 'compare-smaller': (r) => comparisonQuestion(r, false) },
  transfer: (r) => comparisonQuestion(r, false, true),
  limit: 'Vastaus osoittaa vertailuprosenttia nimetystä perusarvosta. Tässä vastaus on suuruus ja kysymys ilmaisee suunnan.',
});

function planBoard(before: number, after: number, relative: boolean, transfer = false): QuantityBoard {
  const unit = transfer ? 'ruutua' : 'palaa';
  return {
    kind: 'quantity-board', view: transfer ? 'ledger' : 'tiles', unit,
    reference: relative ? `ensimmäisen vaiheen ${before} valmista ${unit}` : `koko suunnitelman 100 ${unit}`,
    rows: [{ label: 'Sama koko suunnitelma', amount: 100, base: !relative },
      { label: 'Valmiina ensin', amount: before, extent: 100, base: relative },
      { label: 'Valmiina myöhemmin', amount: after, extent: 100 }],
    notes: [transfer ? 'Kaksi seurantakautta, sama sadan ruudun kokonaisuus.' : 'Sama sadan laatan suunnitelma. Tarkastuksessa laattoja voidaan palauttaa korjattavaksi.'],
  };
}

function planQuestion(r: Rng, relative: boolean, transfer = false): Question {
  const [before, after] = r.pick([[20, 30], [40, 50], [50, 40], [80, 60]] as const);
  const results = percentPlan(before, after);
  const model = planBoard(before, after, relative && !transfer, transfer);
  if (transfer) {
    model.notes!.push(`Suhteellisen muutoksen vertailussa 100 % tarkoittaa ensimmäisen kauden ${before} merkittyä ruutua.`);
  }
  const difference = results.difference;
  const change = results.relative;
  const task: Task = transfer ? {
    kind: 'build', mode: 'seq',
    target: `${digitSequence(difference)} %-yks. ${digitSequence(change)} %`,
    tokens: [...digits, '−', '%-yks.', '%'], max: 10,
    whyAt: {
      [`${digitSequence(difference)} % ${digitSequence(change)} %-yks.`]: 'Ensimmäinen luku on prosenttiosuuksien ero prosenttiyksikköinä. Toinen on suhteellinen muutos prosentteina.',
      [`${digitSequence(difference)} %-yks. ${digitSequence(difference)} %`]: 'Suhteellisessa muutoksessa erotus jaetaan vielä ensimmäisen kauden prosenttiosuudella.',
    },
  } : relative ? numeric(change, '%', {
    [difference]: 'Tuo on ero prosenttiyksikköinä. Jaa se alkuperäisellä prosenttiosuudella ja kerro sadalla.',
    [-change]: 'Tarkista muutoksen suunta. Kun osuus pienenee, muutos on negatiivinen.',
  }) : numeric(difference, 'prosenttiyksikköä', {
    [change]: 'Tuo on suhteellinen muutos prosentteina. Prosenttiyksiköissä vähennetään osuudet toisistaan.',
    [-difference]: 'Vähennä myöhemmästä prosenttiosuudesta ensimmäinen osuus.',
  });
  return {
    quantityModel: model, scene: quantityArt(model), task,
    say: transfer ? 'Kirjoita ensin ero ja yksikkö %-yks. Kirjoita sitten suhteellinen muutos ja yksikkö %. Napauta yksi numero kerrallaan. Merkitse pieneneminen miinuksella.'
      : relative ? 'Laske valmiin osuuden suhteellinen muutos prosentteina. Merkitse pieneneminen miinuksella.'
        : 'Laske valmiiden osuuksien ero prosenttiyksikköinä. Merkitse pieneneminen miinuksella.',
    hint: 'Prosenttiyksikköä varten vähennä osuudet. Suhteellista muutosta varten vertaa erotusta vielä ensimmäiseen osuuteen.',
    explain: `${after} % − ${before} % = ${signed(difference)} prosenttiyksikköä. Suhteellinen muutos on ${signed(difference)} : ${before} · 100 % = ${signed(change)} %.`,
  };
}

const plan = definition({
  id: 'M79-PCT-PP', stop: 'Suunnitelman kaksi mittaa', icon: '🧱', rev: 'exp690-percentage-points-v1',
  intro: 'Aava seuraa, montako laattaa samasta sadan laatan suunnitelmasta on hyväksytty valmiiksi. Hän tarkistaa, miksi sama muutos voidaan ilmaista kahdella luvulla.',
  goal: 'Opit laskemaan prosenttiosuuksien eron prosenttiyksikköinä ja suhteellisen muutoksen prosentteina.',
  reward: 'Rakennussuunnitelman seuranta näyttää kaksi lukua ja kummankin oikean yksikön.',
  produce: ['pp-difference', 'pp-relative', 'transfer'], produceWhat: 'prosenttiyksiköiden ja suhteellisen muutoksen laskemista',
  demo: () => [
    boardDemo(planBoard(20, 30, false), 'Ensimmäisessä vaiheessa on 20 ja toisessa 30 valmista laattaa samasta sadasta. Osuus kasvaa 20 prosentista 30 prosenttiin eli 10 prosenttiyksikköä.'),
    boardDemo(planBoard(20, 30, true), 'Määrät pysyvät samoina. Nyt 100 prosentin vertailukehys siirtyy ensimmäisen vaiheen 20 laattaan. Kymmenen uutta laattaa on niistä puolet eli kasvua on 50 prosenttia.'),
  ],
  families: { 'pp-difference': (r) => planQuestion(r, false), 'pp-relative': (r) => planQuestion(r, true) },
  transfer: (r) => planQuestion(r, false, true),
  limit: 'Siirtotehtävässä oppija rakentaa molemmat luvut yksiköineen. Suhteellinen muutos on määritelty vain positiivisesta ensimmäisestä osuudesta.',
});

const entries = [split, mean, reference, share, amount, base, change, comparison, plan];
export const revisedQuantitySpecs: NodeSpec[] = entries.map(({ spec }) => spec);
export const revisedQuantityEvidence: Readonly<Record<string, { families: readonly string[]; limit: string }>> =
  Object.fromEntries(entries.map(({ spec, evidence }) => [spec.id, evidence]));
