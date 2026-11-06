import type { Item, NodeSpec } from '../engine/types';
import type { Rng } from '../engine/rng';
import { cases, txt } from './kit';
import {
  evaluateSide, inequalitySet, isIncompleteQuadratic, quadraticText, setText, signedText, zeroForm,
  type EquationWorkshopTask, type InequalityTask, type QuadraticCandidate, type SquareRootsTask, type SubstitutionTask,
} from './models/equation-workshop';
import { equationWorkshopArt, quadraticWorkshopArt } from './scenes/equation-workshop';

type Question = Omit<Item, 'tag'>;
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
    spec: { ...spec, validRevs: [spec.rev], item: cases(families, transfer),
      ...(spec.produceWhat ? { produce: [...tags, 'transfer'] } : {}) } satisfies NodeSpec,
    evidence: { families: tags, limit },
  };
}

const demo = (task: EquationWorkshopTask, say: string, solved = true) => ({ say, scene: equationWorkshopArt(task, solved) });

function substitutionQuestion(r: Rng, falseCandidate: boolean, transfer = false): Question {
  const candidate = r.pick([-4, -2, 1, 3, 5]);
  const left = { a: r.int(2, 5), b: r.int(-4, 5) };
  const rightSlope = transfer ? r.pick([-2, 1, 6]) : falseCandidate ? r.pick([-2, -1, 1]) : 0;
  const error = falseCandidate ? r.pick([-4, -1, 2, 3]) : 0;
  const right = { a: rightSlope, b: evaluateSide(left, candidate) - rightSlope * candidate + error };
  const task: SubstitutionTask = { kind: 'equation-workshop', activity: 'substitute', left, right, candidate };
  const l = evaluateSide(left, candidate), b = evaluateSide(right, candidate);
  return {
    task,
    say: 'Sijoita kokeiltava arvo alkuperäisen yhtälön molemmille puolille. Kirjoita molemmat arvot ja merkitse, ovatko ne samat.',
    hint: 'Korvaa jokainen x samalla ehdokkaalla. Laske ensin kertolaskut ja sitten kummankin puolen summa.',
    explain: `Ehdokkaalla x = ${signedText(candidate)} vasen puoli on ${signedText(l)} ja oikea ${signedText(b)}. ${l === b ? 'Arvot ovat samat, joten ehdokas on ratkaisu.' : 'Arvot ovat eri, joten ehdokas ei toteuta yhtälöä.'}`,
  };
}

const substitution = definition({
  id: 'M79-EQ1-CHECK', stop: 'Avain pitää kokeilla', icon: '🗝️', rev: 'exp690-equation-check-v1',
  intro: 'Loikka ehdottaa sululle asetusta. Aava pitää alkuperäisen yhtälön näkyvissä ja pyytää tarkistamaan sen molemmat puolet.',
  goal: 'Opit laskemaan yhtälön molemmat puolet ehdokkaalla ja päättelemään, toteutuuko yhtälö.',
  reward: 'Asetus saa tarkistusmerkinnän. Sulkupöytä näyttää, toteutuiko alkuperäinen ehto.',
  produceWhat: 'molempien puolten laskemista ja niiden vertailua',
  demo: () => {
    const task: SubstitutionTask = { kind: 'equation-workshop', activity: 'substitute', left: { a: 3, b: -2 }, right: { a: 1, b: 4 }, candidate: 3 };
    return [
      demo(task, 'Kokeillaan x = 3. Vasemmalla 3 kertaa 3 miinus 2 on 7. Oikealla 3 plus 4 on 7. Ehdokas kelpaa.'),
      demo({ ...task, candidate: 2 }, 'Kokeillaan x = 2. Vasemmalla saadaan 4 ja oikealla 6. Ehdokas ei toteuta yhtälöä.'),
    ];
  },
  families: { 'check-valid-setting': r => substitutionQuestion(r, false), 'check-failed-setting': r => substitutionQuestion(r, true) },
  transfer: r => substitutionQuestion(r, r.chance(.5), true),
  limit: 'Vastaus osoittaa kahden alkuperäisen puolen laskemista annetulla ehdokkaalla ja niiden samuutta. Yhtälön ratkaisemista tai vapaata perustelua arvioidaan erikseen.',
});

function interpretationQuestion(r: Rng, signed: boolean, transfer = false): Question {
  const boundary = signed ? r.pick([-3, -1, 2, 4]) : r.int(3, 6);
  const task: InequalityTask = {
    kind: 'equation-workshop', activity: 'inequality-interpret', left: { a: 1, b: 0 },
    relation: transfer ? '≥' : signed ? r.pick(['<', '>']) : '≤', right: boundary,
    variable: transfer ? 'p' : signed ? 'x' : 'm', domain: signed ? 'real' : 'nonnegative',
    samples: signed ? [boundary - 1, boundary, boundary + 1] : [-1, boundary - 1, boundary, boundary + 1],
    label: transfer ? 'p on laudan pituus metreinä.' : signed ? 'x on suunnattu poikkeama koemerkin nollatasosta.' : 'm on mallisillan kuorman massa kilogrammoina.',
  };
  const result = inequalitySet(task);
  return {
    task,
    say: 'Merkitse koko sallittu alue lukusuoralle. Valitse myös, kuuluuko kukin koearvo joukkoon.',
    hint: 'Katso, mihin suuntaan merkki osoittaa. Viiva merkin alla ottaa rajakohdan mukaan. Tarkista myös lähtöjoukko.',
    explain: `Koko sallittu alue on ${setText(result.boundary, result.direction, result.inclusive, task.variable, task.domain)}. ${task.domain === 'nonnegative' ? 'Negatiiviset luvut jäävät annetun lähtöjoukon ulkopuolelle.' : 'Lukusuora jatkuu valittuun suuntaan.'}`,
  };
}

const interpretation = definition({
  id: 'M79-INEQ-01', stop: 'Sillan sallittu kuorma', icon: '🪧', rev: 'exp690-inequality-meaning-v1',
  intro: 'Aava kirjoittaa mallisillan kuormarajan. Loikka merkitsee koko sallitun alueen, jotta erilaiset kuormat voi arvioida samalla taululla.',
  goal: 'Opit esittämään epäyhtälön koko ratkaisujoukon ja testaamaan rajakohdan.',
  reward: 'Kuormataululla näkyy koko sallittu alue ja sen rajat.',
  produceWhat: 'ratkaisujoukon rajan, suunnan, sisältyvyyden ja koearvojen merkitsemistä',
  demo: () => {
    const task: InequalityTask = { kind: 'equation-workshop', activity: 'inequality-interpret', left: { a: 1, b: 0 },
      relation: '≤', right: 4, variable: 'm', domain: 'nonnegative', samples: [-1, 3, 4, 5], label: 'm on massa kilogrammoina.' };
    return [demo(task, 'Nollasta neljään kilogrammaan on monta sallittua kuormaa. Neljä kuuluu mukaan ja negatiivinen massa jää lähtöjoukon ulkopuolelle.'),
      demo({ ...task, relation: '>', variable: 'x', domain: 'real', samples: [3, 4, 5], label: 'x on suunnattu poikkeama.' },
        'Tiukka merkki jättää neljän pois. Kaikki neljää suuremmat reaaliluvut kuuluvat tähän alueeseen.')];
  },
  families: { 'interpret-mass-domain': r => interpretationQuestion(r, false), 'interpret-open-directed': r => interpretationQuestion(r, true) },
  transfer: r => interpretationQuestion(r, false, true),
  limit: 'Näyttö koskee koko aluetta annetussa lähtöjoukossa, rajakohtaa ja koearvoja. Malli ei määritä oikean sillan kantavuutta.',
});

function solveQuestion(r: Rng, negative: boolean, transfer = false): Question {
  const coefficient = r.int(2, 5) * (negative ? -1 : 1);
  const offset = r.pick([-4, -2, 1, 3, 5]);
  const boundary = r.pick([-4, -2, 1, 3, 5]);
  const task: InequalityTask = {
    kind: 'equation-workshop', activity: 'inequality-solve', left: { a: coefficient, b: offset },
    relation: transfer ? r.pick(['≤', '≥']) : r.pick(['<', '>']), right: coefficient * boundary + offset,
    variable: 'x', domain: 'real', samples: [], label: 'x on koelaitteen suunnattu asetus.',
  };
  const result = inequalitySet(task);
  return {
    task,
    say: 'Siirrä ensin vakiotermi. Kirjoita sen jälkeen jakaja ja merkitse koko ratkaisujoukko lukusuoralle.',
    hint: 'Vähennä vakiotermi kummaltakin puolelta. Jaa sitten x:n kertoimella. Negatiivinen jakaja vaihtaa järjestyksen.',
    explain: `Vakion siirtämisen jälkeen jaetaan luvulla ${signedText(coefficient)}. ${negative ? 'Negatiivinen jakaja kääntää suunnan.' : 'Positiivinen jakaja säilyttää suunnan.'} Ratkaisujoukko on ${setText(result.boundary, result.direction, result.inclusive)}.`,
  };
}

const solve = definition({
  id: 'M79-INEQ-SOLVE', stop: 'Rajan oikea puoli', icon: '↔️', rev: 'exp690-inequality-solve-v1',
  intro: 'Sulkan koelaitteen ehto on kirjoitettu epäyhtälöksi. Aava selvittää, kummalla puolella rajaa hyväksyttävät asetukset ovat.',
  goal: 'Opit ratkaisemaan epäyhtälön ja merkitsemään ratkaisujoukon, myös negatiivisella luvulla jaettaessa.',
  reward: 'Koelaitteen taulussa näkyvät kaikki sallitut asetukset.',
  produceWhat: 'etumerkillisen jakajan ja koko ratkaisualueen merkitsemistä',
  demo: () => {
    const task: InequalityTask = { kind: 'equation-workshop', activity: 'inequality-solve', left: { a: -2, b: 1 },
      relation: '<', right: 5, variable: 'x', domain: 'real', samples: [], label: 'x on koelaitteen suunnattu asetus.' };
    return [
      demo(task, 'Vähennetään ensin yksi. Miinus kaksi x on pienempi kuin neljä. Kun jaetaan miinus kahdella, x on suurempi kuin miinus kaksi.'),
      demo({ ...task, relation: '≤' }, 'Jos myös yhtäsuuruus sallitaan, x = −2 kuuluu mukaan. Jakajan vaikutus suuntaan säilyy.'),
    ];
  },
  families: { 'solve-positive-division': r => solveQuestion(r, false), 'solve-negative-division': r => solveQuestion(r, true) },
  transfer: r => solveQuestion(r, true, true),
  limit: 'Oppija tuottaa etumerkillisen jakajan, rajan, suunnan ja rajakohdan sisältyvyyden. Oma perustelu siitä, miksi järjestys kääntyy, arvioidaan erikseen.',
});

function classificationQuestion(r: Rng, canceled: boolean, transfer = false): Question {
  const k = r.int(2, 4), n = r.int(2, 5);
  const zero = [0, 0, 0] as const;
  const candidates: QuadraticCandidate[] = canceled ? [
    { left: [k, n, 3], right: [0, 0, 3] },
    { left: [k, 0, 1], right: [0, 0, 1] },
    { left: [k, n, 2], right: [k, 0, 3] },
    { left: [k, n, 2], right: [0, 0, 3] },
  ] : [
    { left: [k, 0, -n], right: zero },
    { left: [k, 0, 0], right: zero },
    { left: [0, n, -2], right: zero },
    { left: [k, n, -1], right: zero },
  ];
  const ordered = r.shuffle(candidates);
  const order: readonly (0 | 1 | 2)[] = transfer ? [2, 1, 0] : [0, 1, 2];
  const answer = ordered.flatMap((candidate, i) => isIncompleteQuadratic(candidate) ? [i] : []);
  const why = ordered.map(candidate => {
    const [a, b, c] = zeroForm(candidate);
    const start = `Nollamuoto on ${quadraticText([a, b, c])} = 0.`;
    return a === 0 ? `${start} Neliötermin kerroin on nolla.` : b === 0 || c === 0
      ? `${start} Neliötermi säilyy ja vähintään yksi alemman asteen termi puuttuu.`
      : `${start} Sekä x-termi että vakio ovat mukana, joten yhtälö on täydellinen.`;
  });
  return {
    task: { kind: 'multi', options: ordered.map((_, i) => txt(String.fromCharCode(65 + i), false)), answer, why, cols: 4 },
    scene: quadraticWorkshopArt(ordered, order), afterCorrect: quadraticWorkshopArt(ordered, order, true),
    say: 'Valitse kaikki vaillinaiset toisen asteen yhtälöt. Katso, mitkä termit jäävät, kun oikealla on nolla.',
    hint: 'Nollamuodossa x²-termin on säilyttävä. Lisäksi x-termin tai vakion kertoimen pitää olla nolla.',
    explain: `Oikeat piirrokset: ${answer.map(i => String.fromCharCode(65 + i)).join(' ja ')}. Tarkista taulusta kunkin yhtälön nollamuoto.`,
  };
}

const classify = definition({
  id: 'M79-QUAD-INCOMP-01', stop: 'Puuttuvan termin kaari', icon: '🌉', rev: 'exp690-incomplete-quadratic-v1',
  intro: 'Aava lajittelee kaariportin piirroksia. Loikka tarkistaa, mitkä alemman asteen termit puuttuvat yhtälöistä.',
  goal: 'Opit tunnistamaan vaillinaisen toisen asteen yhtälön nollamuodosta.',
  reward: 'Piirrokset löytävät oikean ratkaisutapojen lokeron.',
  demo: () => {
    const cards: QuadraticCandidate[] = [{ left: [2, 0, -3], right: [0, 0, 0] }, { left: [1, 2, 4], right: [1, 0, 4] }];
    return [{ say: 'A:ssa x² säilyy ja x-termi puuttuu. B:ssä neliötermit kumoutuvat ja jäljelle jää ensimmäisen asteen yhtälö.',
      scene: quadraticWorkshopArt(cards, [0, 1, 2], true) }];
  },
  families: { 'quad-incomplete-zero-form': r => classificationQuestion(r, false), 'quad-incomplete-cancel-terms': r => classificationQuestion(r, true) },
  transfer: r => classificationQuestion(r, true, true),
  limit: 'Valinta osoittaa annettujen yhtälöiden luokittelua nollamuodon perusteella. Oppijan oma nollamuotoon järjestäminen arvioidaan erikseen.',
});

function rootsQuestion(r: Rng, sign: 'positive' | 'zero' | 'negative', transfer = false): Question {
  const radicand = sign === 'zero' ? 0 : sign === 'negative' ? r.pick([-2, -4, -9]) : r.pick([2, 5, 8, 9, 16, 25]);
  const task: SquareRootsTask = { kind: 'equation-workshop', activity: 'square-roots', radicand, context: transfer ? 'abstract' : 'gate' };
  const explain = radicand > 0 ? `Molempien lukujen −√${radicand} ja √${radicand} neliö on ${radicand}. Neliöjuuren pääarvo on vain √${radicand}.`
    : radicand === 0 ? 'Vain nollan neliö on nolla. Yhtälön ainoa ratkaisu ja neliöjuuren pääarvo ovat nolla.'
      : 'Reaaliluvun neliö on aina vähintään nolla. Ehdolla ei ole reaaliratkaisua eikä neliöjuurella ole reaalista pääarvoa.';
  return {
    task,
    say: 'Merkitse ratkaisujen määrä ja kirjoita jokainen reaaliratkaisu erikseen. Anna myös neliöjuuren pääarvo tai merkitse, ettei sitä ole.',
    hint: 'Neliö on epänegatiivinen. Jos neliö on positiivinen, tarkista sekä juuri että sen vastaluku. Pääarvo on vain epänegatiivinen juuri.',
    explain,
  };
}

const roots = definition({
  id: 'M79-QUAD-INCOMP-02', stop: 'Portin mahdolliset paikat', icon: '🚪', rev: 'exp690-square-root-set-v1',
  intro: 'Kaariportin paikkaa mitataan nollakohdasta kumpaankin suuntaan. Aava tarkistaa kaikki piirroksen ehdon toteuttavat reaaliluvut.',
  goal: 'Opit ratkaisemaan x² = a reaaliluvuissa ja erottamaan ratkaisujoukon neliöjuuren pääarvosta.',
  reward: 'Piirroksessa näkyy koko ratkaisujoukko. Portin suunnitelma voidaan hyväksyä tai palauttaa korjattavaksi.',
  produceWhat: 'kaikkien reaaliratkaisujen ja pääarvon kirjoittamista',
  demo: () => [
    demo({ kind: 'equation-workshop', activity: 'square-roots', radicand: 8, context: 'gate' },
      'Kahdeksan neliöjuuri on epänegatiivinen pääarvo. Yhtälöä toteuttavat sekä juuri että sen vastaluku.'),
    demo({ kind: 'equation-workshop', activity: 'square-roots', radicand: 0, context: 'gate' },
      'Nollalla on vain yksi paikka lukusuoralla. Ratkaisujoukko sisältää vain nollan.'),
    demo({ kind: 'equation-workshop', activity: 'square-roots', radicand: -4, context: 'gate' },
      'Reaaliluvun neliö ei ole negatiivinen. Piirroksen ehto palautuu korjattavaksi ja kiertoreitti on käytettävissä.'),
  ],
  families: { 'roots-positive-pair': r => rootsQuestion(r, 'positive'), 'roots-zero-single': r => rootsQuestion(r, 'zero'),
    'roots-negative-empty': r => rootsQuestion(r, 'negative') },
  transfer: r => rootsQuestion(r, r.pick(['positive', 'zero', 'negative']), true),
  limit: 'Tarkistus kattaa kaikki reaaliratkaisut ja epänegatiivisen pääarvon. Juuret voi kirjoittaa tarkkoina juurimerkintöinä tai täsmällisinä lukuina. Malli ei arvioi portin fyysistä sijaintia.',
});

const entries = [substitution, interpretation, solve, classify, roots];
export const equationWorkshopSpecs: NodeSpec[] = entries.map(({ spec }) => spec);
export const equationWorkshopEvidence: Readonly<Record<string, { families: readonly string[]; limit: string }>> =
  Object.fromEntries(entries.map(({ spec, evidence }) => [spec.id, evidence]));
