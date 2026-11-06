import type { Rng } from '../engine/rng';
import type { DemoStep, Item, NodeSpec, Task } from '../engine/types';
import { cases, txt } from './kit';
import {
  collectTerms, crossTerms, oppositeTerms, polynomialText, term, termText, variablePart,
  type WorkshopModel, type WorkshopPolynomialForm, type WorkshopRow, type WorkshopTerm,
} from './models/polynomial-workshop';
import { polynomialWorkshopArt } from './scenes/polynomial-workshop';

export type PolynomialWorkshopItem = Item & { polynomialWorkshopModel: WorkshopModel };
type Question = Omit<PolynomialWorkshopItem, 'tag'>;
type Generator = (r: Rng) => Question;
type Definition = Omit<NodeSpec, 'item' | 'rev' | 'validRevs' | 'produce'> & {
  rev: string;
  families: Record<string, Generator>;
  transfer: Generator;
  limit: string;
};

function definition({ families, transfer, limit, ...spec }: Definition) {
  const tags = Object.keys(families);
  return {
    spec: {
      ...spec, validRevs: [spec.rev], item: cases(families, transfer),
      ...(spec.produceWhat ? { produce: [...tags, 'transfer'] } : {}),
    } satisfies NodeSpec,
    evidence: { families: tags, limit },
  };
}
const row = (label: string, terms: readonly WorkshopTerm[]): WorkshopRow => ({ label, terms });
const model = (layout: WorkshopModel['layout'], variable: WorkshopModel['variable'], rows: readonly WorkshopRow[], note?: string): WorkshopModel =>
  ({ kind: 'polynomial-workbench', layout, variable, rows, note });
const sign = (value: number) => String(value).replace('-', '−');
const digits = '0123456789'.split('');
const tokensFor = (text: string) => text.match(/[a-z][²³]?|[0-9+−→]/gi) ?? [];

function buildPolynomial(
  variable: WorkshopModel['variable'], polynomial: WorkshopPolynomialForm, target: string, wrongs: readonly [string, string][],
): Task {
  const task = {
    kind: 'build' as const, mode: 'expr' as const, polynomial, target, max: 44,
    tokens: [...digits, variable, variable + '²', ...(target.includes('³') ? [variable + '³'] : []), '+', '−',
      ...(polynomial === 'expanded-then-collected' ? ['→'] : [])],
    whyAt: Object.fromEntries(wrongs.map(([source, why]) => [tokensFor(source).join(' '), why])),
  };
  return task;
}
const demo = (workshop: WorkshopModel, say: string, result?: Parameters<typeof polynomialWorkshopArt>[1]): DemoStep =>
  ({ say, scene: polynomialWorkshopArt(workshop, result) });

interface Production {
  workshop: WorkshopModel;
  form?: WorkshopPolynomialForm;
  expansion?: readonly WorkshopTerm[];
  result: readonly WorkshopTerm[];
  say: string;
  hint: string;
  why?: readonly [string, string][];
  samples?: boolean;
  explanation?: string;
}

function production({ workshop, form = 'collected', expansion, result, say, hint, why = [], samples, explanation }: Production): Question {
  const resultText = polynomialText(result, workshop.variable);
  const expandedText = expansion && polynomialText(expansion, workshop.variable);
  const target = form === 'expanded-then-collected' ? `${expandedText} → ${resultText}` : resultText;
  return {
    polynomialWorkshopModel: workshop, scene: polynomialWorkshopArt(workshop),
    afterCorrect: polynomialWorkshopArt(workshop, { result, expansion, checkSamples: samples }),
    task: buildPolynomial(workshop.variable, form, target, why),
    say, hint,
    explain: explanation ?? (expandedText ? `Avattu rivi on ${expandedText}. Kun samat muuttujaosat kootaan, tulos on ${resultText}.`
      : `Kootut termit ovat ${resultText}. Vain saman muuttujaosan kertoimet yhdistyvät.`),
  };
}

function simplifyQuestion(r: Rng, cancel: boolean, transfer = false): Question {
  const variable = transfer ? 't' : 'x';
  const a = r.int(2, 4), b = r.int(2, 5), c = r.int(1, 4);
  const terms = cancel ? [term(a, 2), term(b, 1), term(-a, 2), term(c, 0)] : [term(a, 1), term(c, 0), term(b, 1)];
  const workshop = model('collect', variable, [row('Alkuperäinen piirustus', transfer ? r.shuffle(terms) : terms)],
    'Luku, muuttujalaatta ja neliölaatta pysyvät eri ryhmissä. Miinus on vastalaatta.');
  return production({
    workshop, result: collectTerms(terms), samples: true,
    say: 'Rakenna sievennetty lauseke. Kirjoita jokainen jäljelle jäävä muuttujaosa vain kerran.',
    hint: 'Etsi termit, joilla on sama muuttujaosa. Laske vain niiden kertoimet yhteen.',
    why: [[polynomialText([term(a + b + c, 1)], variable), 'Vakioluku ei ole muuttujalaatta. Vain saman muuttujaosan kertoimet voi yhdistää.']],
  });
}

const simplify = definition({
  id: 'M79-EXPR-SIMPLIFY', stop: 'Lyhyempi piirustus', icon: '📐', rev: 'exp690-expr-simplify-v1',
  intro: 'Telakan piirustuksessa sama laattalaji toistuu. Loikka tekee ohjeesta lyhyemmän, jotta se sopii työpajan kylttiin.',
  goal: 'Opit yhdistämään samanlaiset termit niin, että lausekkeen arvo säilyy.',
  reward: 'Tiivis piirustus mahtuu puukylttiin ja ohje säilyy oikein.',
  produceWhat: 'sievennetyn lausekkeen rakentamista',
  demo: () => {
    const terms = [term(2, 1), term(3, 0), term(1, 1)];
    const workshop = model('collect', 'x', [row('Piirustus', terms)]);
    return [demo(workshop, 'Kaksi x-laattaa ja yksi x-laatta ovat kolme x-laattaa. Kolme vakiolaattaa jää omaksi termikseen.', { result: collectTerms(terms), checkSamples: true })];
  },
  families: { 'simplify-like-terms': r => simplifyQuestion(r, false), 'simplify-cancel-power': r => simplifyQuestion(r, true) },
  transfer: r => simplifyQuestion(r, true, true),
  limit: 'Oppija tuottaa sievennetyn muodon. Malli näyttää kaksi tarkistusarvoa onnistumisen jälkeen. Oma yleinen perustelu arvioidaan erikseen.',
});

function conceptQuestion(r: Rng, denominators: boolean, transfer = false): Question {
  const x = transfer ? 'a' : 'x';
  const n = r.int(2, 6);
  const candidates = denominators ? [
    { value: `${x}/${n} + 2`, polynomial: true, why: 'Nimittäjä on vakio, joten se muuttaa vain muuttujatermin kerrointa.' },
    { value: `${n}/${x} + 2`, polynomial: false, why: 'Muuttuja nimittäjässä vastaisi negatiivista eksponenttia.' },
    { value: `${n}${x}² + 1`, polynomial: true, why: 'Neliö ja vakiotermi sopivat polynomiin.' },
    { value: `1/(${x} + ${n})`, polynomial: false, why: 'Nimittäjän lauseke sisältää muuttujan.' },
  ] : [
    { value: `${x}² + ${n}`, polynomial: true, why: 'Eksponentti 2 on sallittu ja lisäksi voi olla vakiotermi.' },
    { value: `${n}`, polynomial: true, why: 'Yksi vakiotermi riittää polynomiksi.' },
    { value: `${x}⁻¹ + ${n}`, polynomial: false, why: 'Eksponentti miinus yksi ei kuulu polynomin muuttujaosiin.' },
    { value: `√${x} + ${n}`, polynomial: false, why: 'Neliöjuuri vastaa eksponenttia yksi kahdesosa.' },
  ];
  const ordered = r.shuffle(candidates);
  const workshop: WorkshopModel = { ...model('classify', x, [], 'Polynomin muuttujan eksponentit ovat 0, 1, 2 ja niin edelleen.'),
    examples: ordered.map(({ value }) => value) };
  return {
    polynomialWorkshopModel: workshop, scene: polynomialWorkshopArt(workshop),
    say: denominators ? 'Valitse kaikki polynomit. Tarkista erityisesti, onko nimittäjässä muuttuja.' : 'Valitse kaikki polynomit. Tarkista muuttujan eksponentti ja myös pelkkä vakio.',
    hint: 'Kerroin voi olla murtoluku. Muuttujaosan eksponentin pitää olla epänegatiivinen kokonaisluku.',
    task: { kind: 'multi', options: ordered.map(({ value }) => txt(value, false)),
      answer: ordered.flatMap(({ polynomial }, i) => polynomial ? [i] : []), why: ordered.map(({ why }) => why), cols: 2 },
    explain: 'Polynomi on summa sallituista termeistä. Kerroin saa olla vakio, ja muuttujaosissa on vain epänegatiivisia kokonaislukueksponentteja.',
  };
}

const concept = definition({
  id: 'M79-POLY-CONCEPT', stop: 'Monen osan suunnitelma', icon: '🗂️', rev: 'exp690-poly-concept-v1',
  intro: 'Aava lajittelee telakan piirustuksia samaan työkalulaatikkoon. Loikka tutkii, mitkä ohjeet ovat polynomeja.',
  goal: 'Opit tunnistamaan polynomin sen termien ja eksponenttien perusteella.',
  reward: 'Sopivat piirustukset päätyvät samaan laatikkoon.',
  demo: () => [demo({ ...model('classify', 'x', []), examples: ['x² + 3', '2/x + 3'] }, 'Neliö ja vakio sopivat samaan polynomiin. Lausekkeessa kaksi jaettuna x:llä muuttuja on nimittäjässä.')],
  families: { 'concept-exponents': r => conceptQuestion(r, false), 'concept-denominator': r => conceptQuestion(r, true) },
  transfer: r => conceptQuestion(r, true, true),
  limit: 'Valinnat osoittavat polynomin tunnistamista annetuista lausekkeista. Oma määritelmä arvioidaan erikseen.',
});

function termQuestion(r: Rng, roles: boolean, transfer = false): Question {
  const variable = transfer ? 'a' : 'x';
  const n = r.int(2, 5), c = r.int(1, 4);
  const terms = transfer ? [term(c, 0), term(-n, 2), term(2, 1)] : [term(2, 1), term(-n, 2), term(c, 0)];
  const workshop = model('terms', variable, [row('Alkuperäinen piirustus', terms)]);
  const targetPart = variablePart(variable, 2);
  const correct = terms.map(part => termText(part, variable));
  const labels = r.shuffle([...correct.map(value => ({ value, ok: true })),
    { value: termText(term(n, 2), variable), ok: false }, { value: targetPart, ok: false }]);
  const task: Task = roles ? {
    kind: 'place', slots: [{ id: 'coefficient', text: 'Kerroin' }, { id: 'variable', text: 'Muuttujaosa' }],
    tokens: r.shuffle([
      { id: 'negative', text: sign(-n) }, { id: 'positive', text: String(n) },
      { id: 'square', text: targetPart }, { id: 'linear', text: variable },
    ]),
    answer: { coefficient: 'negative', variable: 'square' },
    why: { coefficient: 'Miinus kuuluu kertoimeen.', variable: 'Eksponentti kuuluu muuttujaosaan.' },
  } : {
    kind: 'multi', options: labels.map(({ value }) => txt(value, false)),
    answer: labels.flatMap(({ ok }, i) => ok ? [i] : []),
    why: labels.map(({ ok }) => ok ? 'Tämä on yksi kokonainen termi etumerkkeineen.' : 'Etumerkki, kerroin ja muuttujaosa kuuluvat samaan termiin.'), cols: 3,
  };
  return {
    polynomialWorkshopModel: workshop, scene: polynomialWorkshopArt(workshop), task,
    say: roles ? `Yhdistä termin ${sign(-n)}${targetPart} kerroin ja muuttujaosa oikeille paikoille.`
      : 'Valitse kaikki lausekkeen termit etumerkkeineen.',
    hint: 'Erottele summan osat. Miinus kuuluu sitä seuraavaan termiin. Tulon tekijät voivat kuulua samaan termiin.',
    explain: `Termit ovat ${correct.join(', ')}. Termissä ${sign(-n)}${targetPart} kerroin on ${sign(-n)} ja muuttujaosa ${targetPart}.`,
  };
}

const termSpec = definition({
  id: 'M79-TERM-01', stop: 'Piirroksen rakennuspalat', icon: '🏷️', rev: 'exp690-poly-terms-v1',
  intro: 'Loikka leikkaa kopion telakan piirustuksesta nimilapuiksi. Aava pitää etumerkin mukana oikealla lapulla.',
  goal: 'Opit erottamaan lausekkeen termit ja nimeämään kertoimen sekä muuttujaosan.',
  reward: 'Piirroksen osat saavat oikeat nimilaput.',
  demo: () => [demo(model('terms', 'x', [row('Piirustus', [term(2, 1), term(-3, 2), term(4, 0)])]), 'Tässä on kolme termiä. Miinus kolme x toiseen sisältää kertoimen miinus kolme ja muuttujaosan x toiseen.')],
  families: { 'terms-boundaries': r => termQuestion(r, false), 'terms-components': r => termQuestion(r, true) },
  transfer: r => termQuestion(r, false, true),
  limit: 'Valmiiden merkintöjen valinta ja sijoittelu osoittavat termirajojen ja osien tunnistamista tässä muodossa.',
});

function integrationQuestion(r: Rng, zero: boolean, transfer = false): Question {
  const variable = transfer ? 't' : 'x';
  const c = r.int(2, 5), n = zero ? 0 : -r.int(2, 4);
  const terms = [term(n, 2), term(c, 0)];
  const ordered = transfer ? [...terms].reverse() : terms;
  const workshop = model('terms', variable, [row('Korjaussuunnitelma', ordered)]);
  const variableTerm = termText(terms[0]!, variable);
  return {
    polynomialWorkshopModel: workshop, scene: polynomialWorkshopArt(workshop),
    afterCorrect: polynomialWorkshopArt(workshop, { result: collectTerms(terms) }),
    say: 'Merkitse piirustuksen kaksi termiä kertoimineen. Valitse sitten, miksi koko lauseke on polynomi.',
    hint: 'Pidä etumerkki kertoimen mukana. Vakiokin on termi. Tarkista lopuksi muuttujaosan eksponentti.',
    task: {
      kind: 'place', slots: [{ id: 'power', text: 'Muuttujatermi' }, { id: 'constant', text: 'Vakiotermi' }, { id: 'rule', text: 'Rakenne' }],
      tokens: r.shuffle([
        { id: 'power-ok', text: `${variableTerm} · kerroin ${sign(n)}` },
        { id: 'power-wrong', text: `${variableTerm} · kerroin ${zero ? '1' : String(-n)}` },
        { id: 'constant-ok', text: `${c} · kerroin ${c}` },
        { id: 'constant-wrong', text: `${c}${variable} · kerroin ${c}` },
        { id: 'rule-ok', text: zero ? 'Nollatermi poistuu. Vakio on polynomi.' : 'Termien summa, eksponentti 2 sallittu.' },
        { id: 'rule-wrong', text: zero ? 'Nolla estää polynomirakenteen.' : 'Miinusmerkki estää polynomirakenteen.' },
      ]),
      answer: { power: 'power-ok', constant: 'constant-ok', rule: 'rule-ok' },
      why: {
        power: 'Kerroin sisältää etumerkin ja voi myös olla nolla.',
        constant: 'Vakiotermissä ei ole muuttujaa.',
        rule: zero ? 'Kun nollatermi poistuu, vakio jää jäljelle ja on polynomi.'
          : 'Kerroin saa olla negatiivinen. Muuttujan eksponentti kaksi on sallittu.',
      },
    },
    explain: `Termit ovat ${ordered.map(entry => termText(entry, variable)).join(' ja ')}. ${zero ? 'Nollakerroin poistaa muuttujatermin, joten jäljelle jää vakio.' : 'Ne muodostavat summan, ja muuttujaosan eksponentti on epänegatiivinen kokonaisluku.'}`,
  };
}

const integration = definition({
  id: 'M79-POLY-01', stop: 'Osista kokonaiseksi', icon: '📋', rev: 'exp690-poly-integration-v1',
  intro: 'Sulka tuo telakalle uuden korjaussuunnitelman. Aava tarvitsee sekä jokaisen termin tiedot että koko piirustuksen luokituksen.',
  goal: 'Opit erittelemään termit ja tunnistamaan niiden muodostaman polynomin.',
  reward: 'Uuden korjaussuunnitelman termit ja rakenne kirjataan samalle työpaperille.',
  demo: () => {
    const terms = [term(0, 2), term(3, 0)];
    return [demo(model('terms', 'x', [row('Korjaussuunnitelma', terms)]), 'Nolla x toiseen on nolla. Kun se poistuu, kolme jää vakiotermiksi. Se on edelleen polynomi.', { result: collectTerms(terms) })];
  },
  families: { 'integrate-signed-terms': r => integrationQuestion(r, false), 'integrate-zero-term': r => integrationQuestion(r, true) },
  transfer: r => integrationQuestion(r, true, true),
  limit: 'Samassa vastauksessa tarkistetaan termit, kertoimet ja valittu rakenteen perustelu. Oppijan oma sanallinen perustelu arvioidaan erikseen.',
});

function additionQuestion(r: Rng, cancel: boolean, transfer = false): Question {
  const variable = transfer ? 't' : 'x';
  const a = r.int(2, 4), b = r.int(1, 4), c = r.int(2, 5);
  const left = cancel ? [term(a, 2), term(c, 0)] : [term(a, 2), term(b, 1), term(c, 0)];
  const right = cancel ? [term(b, 1), term(-c, 0)] : [term(1, 2), term(2, 1), term(1, 0)];
  const workshop = model('collect', variable, [
    row('Tilaus A', transfer ? r.shuffle(left) : left), row('Tilaus B', transfer ? r.shuffle(right) : right),
  ], 'Saman muuttujaosan laatat sopivat samaan lokeroon. Vastalaatat voivat kumota toisensa.');
  const result = collectTerms([...left, ...right]);
  return production({
    workshop, result, say: 'Yhdistä tilausten A ja B määrät. Rakenna polynomien summa sievennettynä.',
    hint: 'Yhdistä kertoimet vain, kun muuttujaosa ja sen eksponentti ovat samat.',
    why: [[polynomialText([term(a + 1, 3), ...result.filter(part => part.power < 2)], variable), 'Eksponentit eivät kasva yhteenlaskussa. Lisää vain saman lajin kertoimet.']],
  });
}

const addition = definition({
  id: 'M79-POLY-ADD', stop: 'Kahden veneen yhteinen tilaus', icon: '🛶', rev: 'exp690-poly-add-v1',
  intro: 'Kahden venekunnan tilaukset kootaan yhdelle telakkalavalle. Aava pitää eri laattalajit omissa ryhmissään.',
  goal: 'Opit laskemaan polynomien summan ja huomaamaan myös kumoutuvat termit.',
  reward: 'Yhteisen tilauksen työpaperiin jää oikea määrä kutakin laattalajia.',
  produceWhat: 'polynomien sievennetyn summan rakentamista',
  demo: () => {
    const left = [term(2, 2), term(3, 0)], right = [term(3, 1), term(-3, 0)];
    return [demo(model('collect', 'x', [row('Tilaus A', left), row('Tilaus B', right)]),
      'Kolme vakiolaattaa ja kolme vastalaattaa kumoavat toisensa. Neliö- ja muuttujalaatat jäävät erikseen.', { result: collectTerms([...left, ...right]) })];
  },
  families: { 'add-align-kinds': r => additionQuestion(r, false), 'add-cancel-and-keep': r => additionQuestion(r, true) },
  transfer: r => additionQuestion(r, true, true),
  limit: 'Näyttö on sievennetty summa. Erillistä sanallista perustelua ei pisteytetä.',
});

function differenceRows(r: Rng, missing: boolean, transfer: boolean) {
  const a = r.int(2, 5), b = r.int(1, 4), c = r.int(2, 5);
  const left = missing ? [term(a, 2), term(c, 0)] : [term(a, 2), term(b, 1), term(c, 0)];
  const right = missing ? [term(-b, 1), term(-c, 0)] : [term(1, 2), term(2, 1), term(c, 0)];
  return { left: transfer ? [...left].reverse() : left, right: transfer ? [...right].reverse() : right };
}

function subtractionQuestion(r: Rng, missing: boolean, integrated: boolean, transfer = false): Question {
  const variable = transfer ? 't' : 'x';
  const { left, right } = differenceRows(r, missing, transfer);
  const expansion = [...left, ...oppositeTerms(right)];
  const result = collectTerms(expansion);
  const workshop = model(integrated ? 'return' : 'collect', variable, [
    row('Lähtöerä A', left), row('Palautettava erä B', right),
  ], integrated ? 'Sopimuksen lasku on (A) − (B). Miinus koskee koko erää B.'
    : 'Lähtöerän ja palautuserän termit ovat valmiiksi näkyvissä. Kohdista samat lajit, myös puuttuvat.');
  return production({
    workshop, result, ...(integrated ? { form: 'expanded-then-collected', expansion } : {}),
    say: integrated ? 'Avaa (A) − (B) niin, että jokainen termi jää näkyviin. Lisää → ja rakenna sen jälkeen sievennetty erotus.'
      : 'Rakenna erien A − B sievennetty erotus. Vähennä saman lajin kertoimet tässä järjestyksessä.',
    hint: integrated ? 'Ota jokaisesta B:n termistä vastaluku. Pidä A ennallaan ja kokoa vasta nuolen jälkeen.'
      : 'Ajattele puuttuvan termin kertoimeksi nolla. Laske joka lajille ensin A:n kerroin miinus B:n kerroin.',
    why: [[polynomialText(oppositeTerms(result), variable), 'Vähennyksen järjestys on A miinus B. Vaihtamalla järjestyksen saat vastalausekkeen.']],
  });
}

const subtract = definition({
  id: 'M79-POLY-SUBTRACT', stop: 'Palautettujen osien kirjanpito', icon: '📒', rev: 'exp690-poly-subtract-v1',
  intro: 'Telakan varauksesta palautuu osa varastoon. Loikka kohdistaa eri erien samat laattalajit ennen kertoimien vähennystä.',
  goal: 'Opit vähentämään vastaavien termien kertoimet, myös silloin kun toisessa erässä jokin laji puuttuu.',
  reward: 'Palautukset ja jäljellä oleva tilaus täsmäävät varastotaulussa.',
  produceWhat: 'polynomien sievennetyn erotuksen rakentamista',
  demo: () => {
    const left = [term(2, 2), term(3, 0)], right = [term(2, 1), term(3, 0)];
    return [demo(model('collect', 'x', [row('Lähtöerä A', left), row('Palautettava erä B', right)]),
      'A:ssa on nolla x-laattaa. Kun siitä vähennetään kaksi, erotukseen jää miinus kaksi x. Vakiot kumoutuvat.', { result: collectTerms([...left, ...oppositeTerms(right)]) })];
  },
  families: { 'subtract-align-coefficients': r => subtractionQuestion(r, false, false), 'subtract-missing-kind': r => subtractionQuestion(r, true, false) },
  transfer: r => subtractionQuestion(r, true, false, true),
  limit: 'Näyttö koskee erotusta, kun kummankin erän termit ovat valmiiksi näkyvissä. Sulkujen avaaminen arvioidaan omassa tehtävässään.',
});

const integrateSubtract = definition({
  id: 'M79-POLY-SUB', stop: 'Kaksi sopimusta, yksi erotus', icon: '📝', rev: 'exp690-poly-sub-integration-v1',
  intro: 'Aava vertaa kahta suljettua telakkasopimusta. Loikka avaa palautettavan erän merkit ja kokoaa jäljelle jäävät lajit.',
  goal: 'Opit avaamaan vähennyksen sulut ja kokoamaan polynomien erotuksen.',
  reward: 'Korjattu sopimus näyttää, mitä kummallekin venekunnalle jää.',
  produceWhat: 'avatun välivaiheen ja sievennetyn erotuksen rakentamista',
  demo: () => {
    const left = [term(2, 2), term(3, 0)], right = [term(-2, 1), term(3, 0)];
    const expansion = [...left, ...oppositeTerms(right)];
    return [demo(model('return', 'x', [row('Lähtöerä A', left), row('Palautettava erä B', right)]),
      'B:n miinus kaksi x muuttuu plus kahdeksi x:ksi. B:n plus kolme muuttuu miinus kolmeksi. Sen jälkeen kootaan erotus.', { expansion, result: collectTerms(expansion) })];
  },
  families: { 'sub-integrate-both-rows': r => subtractionQuestion(r, false, true), 'sub-integrate-negative-return': r => subtractionQuestion(r, true, true) },
  transfer: r => subtractionQuestion(r, true, true, true),
  limit: 'Samassa vastauksessa tarkistetaan jokainen avattu termi ja sievennetty erotus. Merkintä ei yksin osoita vapaata sanallista perustelua.',
});

function signsQuestion(r: Rng, mixedSigns: boolean, transfer = false): Question {
  const variable = transfer ? 'a' : 'x';
  const a = r.int(1, 4), b = r.int(2, 5), c = r.int(2, 4);
  const inside = transfer ? [term(-c, 0), term(a, 2), term(-b, 1)] : [term(a, 2), term(mixedSigns ? -b : b, 1), term(c, 0)];
  const workshop = model('return', variable, [row('Sulkujen sisällä', inside)],
    `Palautus: −(${polynomialText(inside, variable)}). Miinus tarkoittaa vastalaattoja koko erälle.`);
  const opposites = oppositeTerms(inside);
  return production({
    workshop, form: 'expanded', result: opposites,
    say: 'Avaa miinusmerkin edeltämät sulut. Rakenna avattu rivi, jossa jokaisella termillä on oma uusi etumerkki.',
    hint: 'Vähentäminen on vastaluvun lisäämistä. Vaihda jokaisen sulkujen sisällä olevan termin merkki.',
    why: [[polynomialText([opposites[0]!, ...inside.slice(1)], variable), 'Vaihto koskee kaikkia sulkujen termejä, myös vakiota ja valmiiksi negatiivisia termejä.']],
    explanation: `Jokainen termi korvataan vastalaatalla. Avattu rivi on ${polynomialText(opposites, variable)}.`,
  });
}

const signs = definition({
  id: 'M79-SIGN-PARENS', stop: 'Sulkujen koko kuorma', icon: '📦', rev: 'exp690-poly-signs-v1',
  intro: 'Loikka palauttaa kokonaisen pakkauksen. Aava pitää kirjaa myös niistä osista, joiden merkki vaihtuu plussaksi.',
  goal: 'Opit avaamaan miinusmerkin edeltämät sulut muuttamalla jokaisen termin etumerkin.',
  reward: 'Palautuspakkauksen kaikki vastalaatat merkitään telakan kirjanpitoon.',
  produceWhat: 'sulkujen kaikkien vastatermien rakentamista',
  demo: () => {
    const inside = [term(2, 1), term(-3, 0)];
    return [demo(model('return', 'x', [row('Sulkujen sisällä', inside)], 'Palautus: −(2x − 3).'),
      'Kaksi x vaihtuu miinus kahdeksi x:ksi. Miinus kolme vaihtuu plus kolmeksi.', { result: oppositeTerms(inside) })];
  },
  families: { 'signs-positive-package': r => signsQuestion(r, false), 'signs-mixed-package': r => signsQuestion(r, true) },
  transfer: r => signsQuestion(r, true, true),
  limit: 'Oppija rakentaa avatut termit etumerkkeineen. Vastalaattojen mallia voi käyttää tehtävän aikana.',
});

function monomialQuestion(r: Rng, variableFactor: boolean, transfer = false): Question {
  const variable = transfer ? 't' : 'x';
  const a = r.int(2, 4), b = r.int(2, 4), c = r.int(1, 3);
  const factor = transfer ? term(-a, 1) : variableFactor ? term(a, 1) : term(-a, 0);
  const terms = transfer ? [term(-c, 0), term(b, 2), term(1, 1)]
    : variableFactor ? [term(b, 1), term(c, 0)] : [term(b, 2), term(1, 1), term(-c, 0)];
  const product = crossTerms([factor], terms);
  const workshop = model('product', variable, [row('Kerroinmonomi', [factor]), row('Koko suunnitelma', terms)],
    'Jokainen ruutu vastaa yhtä osatuloa. Miinuslaatta tarkoittaa vastatermiä.');
  return production({
    workshop, result: collectTerms(product), expansion: product,
    say: 'Kerro monomilla jokainen suunnitelman termi. Rakenna avattu tulo ja pidä kaikki osatulot mukana.',
    hint: 'Kulje jokaisen ruudun kautta. Kerro kertoimet ja yhdistä saman muuttujan tekijät tulossa.',
    why: [[polynomialText([product[0]!, ...terms.slice(1)], variable), 'Monomi kerrotaan jokaisella termillä. Myös viimeinen termi tarvitsee oman osatulon.']],
  });
}

const monomial = definition({
  id: 'M79-POLY-MUL-MONO', stop: 'Yksi tekijä kaikille osille', icon: '🛠️', rev: 'exp690-poly-multiply-mono-v1',
  intro: 'Aava suurentaa koko suunnitelman samalla tekijällä. Pienen vakiolaatankin kohdalla telakan ruudukkoon kuuluu yksi osatulo.',
  goal: 'Opit kertomaan monomin polynomin jokaisella termillä ja tarkistamaan merkit.',
  reward: 'Suurennettu suunnitelma sisältää kaikki telakkakehykseen tarvittavat osat.',
  produceWhat: 'jokaisesta termistä muodostuvan tulon rakentamista',
  demo: () => {
    const left = [term(-2, 1)], right = [term(1, 1), term(3, 0)];
    const expansion = crossTerms(left, right);
    return [demo(model('product', 'x', [row('Kerroinmonomi', left), row('Koko suunnitelma', right)]),
      'Miinus kaksi x kerrotaan sekä x:llä että kolmella. Tulot ovat miinus kaksi x toiseen ja miinus kuusi x.', { expansion, result: collectTerms(expansion) })];
  },
  families: { 'mono-negative-scalar': r => monomialQuestion(r, false), 'mono-variable-factor': r => monomialQuestion(r, true) },
  transfer: r => monomialQuestion(r, true, true),
  limit: 'Rakennettu tulo tarkistaa jokaisen eri osatulon merkin ja muuttujaosan. Osittelun vapaa selitys arvioidaan erikseen.',
});

function multiplicationQuestion(r: Rng, conjugates: boolean, transfer = false): Question {
  const variable = transfer ? 'a' : 'x';
  const b = r.int(2, 4), c = r.int(1, 3);
  const left = [term(1, 1), term(b, 0)];
  const right = transfer ? [term(-c, 0), term(1, 2), term(-1, 1)]
    : [term(1, 1), term(conjugates ? -b : c, 0)];
  const expansion = crossTerms(left, right), result = collectTerms(expansion);
  const workshop = model('product', variable, [row('Kertoja A', left), row('Kerrottava B', right)],
    'Jokainen rivi ja sarake kohtaa kerran. Vastalaatat kuvaavat laskun merkkiä.');
  const full = polynomialText(result, variable);
  const corners = polynomialText([expansion[0]!, expansion.at(-1)!], variable);
  return production({
    workshop, form: 'expanded-then-collected', result, expansion,
    say: 'Rakenna jokainen ruudukon osatulo omana terminään. Lisää → ja kokoa sen jälkeen sievennetty tulo.',
    hint: 'Aloita yhdestä rivistä ja käy jokainen sarake läpi. Tee sama kaikille riveille. Kokoa vasta nuolen jälkeen.',
    why: [[`${corners} → ${full}`, 'Kahden kulman tulojen lisäksi tarvitaan kaikki niiden välissä olevat osatulot.']],
  });
}

const multiplication = definition({
  id: 'M79-POLY-MUL', stop: 'Telakan suuri katos', icon: '🏗️', rev: 'exp690-poly-multiply-v1',
  intro: 'Katos muodostuu useasta osaparista. Loikka käyttää tuloruudukkoa, jotta mikään osapari ei jää pois.',
  goal: 'Opit muodostamaan polynomien kaikki osatulot ja sieventämään niiden summan.',
  reward: 'Katoksen suunnitelma on koottu. Se antaa pajan väelle yhteisen kuivan työtilan.',
  produceWhat: 'kaikkien osatulojen ja sievennetyn tulon rakentamista',
  demo: () => {
    const left = [term(1, 1), term(2, 0)], right = [term(1, 1), term(-2, 0)];
    const expansion = crossTerms(left, right);
    return [demo(model('product', 'x', [row('Kertoja A', left), row('Kerrottava B', right)]),
      'Neljästä ruudusta tulee neljä osatuloa. Miinus kaksi x ja plus kaksi x kumoavat toisensa. Vastalaatta on laskumerkintä.', { expansion, result: collectTerms(expansion) })];
  },
  families: { 'multiply-all-four': r => multiplicationQuestion(r, false), 'multiply-cancel-cross': r => multiplicationQuestion(r, true) },
  transfer: r => multiplicationQuestion(r, true, true),
  limit: 'Näyttö sisältää jokaisen osatulon ja kootun tulon asteeseen kolme asti. Miinuslaatat ovat symbolisia. Fyysistä katoksen pinta-alaa tai vapaata perustelua ei arvioida.',
});

const entries = [simplify, concept, termSpec, integration, addition, monomial, multiplication, subtract, signs, integrateSubtract];
export const polynomialWorkshopSpecs: NodeSpec[] = entries.map(({ spec }) => spec);
export const polynomialWorkshopEvidence: Readonly<Record<string, { families: readonly string[]; limit: string }>> =
  Object.fromEntries(entries.map(({ spec, evidence }) => [spec.id, evidence]));
