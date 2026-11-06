import type { Rng } from '../engine/rng';
import type { Item, NodeSpec, Phase } from '../engine/types';
import type { ProblemContentContext, ProblemWorkbenchTask, RepairProblem, RepresentProblem, SortProblem, StrategyProblem, TrialProblem } from './models/problem-workbench';
import { compareTo, trialUnits } from './models/problem-workbench';
import { problemWorkbenchBoard, problemWorkbenchExample } from './scenes/problem-workbench';

type Mode = ProblemWorkbenchTask['mode'];
type ModeTask<M extends Mode = Mode> = M extends Mode ? Omit<Extract<ProblemWorkbenchTask, { mode: M }>, 'kind' | 'context' | 'givens'> : never;
type BoardItem = Omit<Item, 'task'> & { task: ProblemWorkbenchTask };
type Author = (r: Rng) => Omit<BoardItem, 'tag'>;
type Definition = Pick<NodeSpec, 'id' | 'stop' | 'icon' | 'intro' | 'goal' | 'reward'> & {
  families: readonly [readonly [string, Author], readonly [string, Author]];
  transfer: Author;
  limit: string;
};

const given = (label: string, value: string) => ({ label, value });
const context = (title: string, ...skills: string[]): ProblemContentContext => ({ title, skills });
const contextCount = context('Pienten määrien laskeminen ja vertaaminen', 'M-NUM-1TO1', 'M-NUM-10');
const contextLength = context('Pituus ja sama mittayksikkö', 'M-MEAS-02', 'M-MEAS-04');
const contextAdd = context('Pienten määrien yhdistäminen', 'M-ADD-01', 'M-ADD-20');
const contextGap = context('Kahden määrän erotus', 'M-SUB-02', 'M-SUB-20');
const contextRemoval = context('Jäljelle jäävän määrän laskeminen', 'M-SUB-01', 'M-SUB-20');
const contextShare = context('Yhtä suuret osuudet ja niiden laskeminen', 'M-DIV-01', 'M-NUM-1TO1');
const contextGroup = context('Saman kokoisten ryhmien muodostaminen', 'M-DIV-02', 'M-MULTAB-LOW');
const contextEstimate = context('Väljien lukumäärärajojen yhdistäminen', 'M-EST-01', 'M-ADD-100');

function item(
  problem: ModeTask,
  context: ProblemContentContext,
  givens: ProblemWorkbenchTask['givens'],
  say: string,
  hint: string,
  explain: string,
): ReturnType<Author> {
  const task: ProblemWorkbenchTask = { kind: 'problem-workbench', ...problem, context, givens };
  return { task, scene: problemWorkbenchBoard(task), say, hint, explain };
}

function sort(r: Rng, cards: SortProblem['cards'], unknowns: readonly string[], target: string, familiar: ProblemContentContext): ReturnType<Author> {
  const choices = r.shuffle([...unknowns, target]);
  return item({ mode: 'sort', cards: r.shuffle([...cards]), unknowns: choices, unknown: choices.indexOf(target) }, familiar, [],
    'Lajittele ratkaisussa tarvittavat tiedot, kysymys ja tarpeeton kortti. Merkitse määrä, jota etsitään.',
    'Kysymys kertoo mitä halutaan tietää. Tiedot auttavat pääsemään siihen.',
    `Etsitään tätä: ${target}. Annetut auttavat ratkaisemaan kysymyksen. Tarpeeton kortti jää sivuun.`);
}

const card = (text: string, role: SortProblem['cards'][number]['role']) => ({ text, role });
function sortRemaining(r: Rng) {
  const [length, used] = r.pick([[12, 4], [15, 6], [18, 7]] as const);
  return sort(r, [
    card(`Köysi on ${length} m pitkä.`, 'given'), card(`Telttaan käytetään ${used} m.`, 'given'),
    card('Montako metriä köyttä jää jäljelle?', 'question'),
  ], ['Koko köyden pituus', 'Telttaan käytetty pituus'], 'Jäljelle jäävän köyden pituus', contextLength);
}

function sortJoining(r: Rng) {
  const [a, b] = r.pick([[5, 8], [9, 6], [7, 4]] as const);
  return sort(r, [
    card(`Loikka tuo ${a} kiilaa.`, 'given'), card(`Aava tuo ${b} kiilaa.`, 'given'),
    card('Montako kiilaa he tuovat yhteensä?', 'question'),
  ], ['Loikan kiilojen määrä', 'Aavan kiilojen määrä'], 'Kiilojen yhteismäärä', contextAdd);
}

function sortLunch(r: Rng) {
  const [a, b] = r.pick([[14, 6], [16, 7], [11, 4]] as const);
  return sort(r, [
    card(`Korissa on ${a} omenaa.`, 'given'), card(`Retkelle otetaan ${b} omenaa.`, 'given'),
    card('Korissa on myös 3 haarukkaa.', 'unused'), card('Montako omenaa koriin jää?', 'question'),
  ], ['Korissa aluksi olevat omenat', 'Haarukoiden määrä'], 'Koriin jäävien omenoiden määrä', contextRemoval);
}

function trial(r: Rng, scale: number, fixed: number, unit: string, material: string, familiar: ProblemContentContext) {
  const right = r.pick([4, 5, 6]);
  const startingCount = right + r.pick([-2, -1, 1]);
  const task: TrialProblem = {
    mode: 'trial', startingCount, targetUnits: fixed + scale * right, fixedUnits: fixed,
    unitsPerPiece: scale, unit, piece: material,
  };
  const direction = compareTo(trialUnits(task, startingCount), task.targetUnits) === 'short' ? 'lisätään' : 'poistetaan';
  return item(task, familiar, [
    given('Tavoite', `${task.targetUnits} ${unit}`),
    given('Alusta', `Valmiina ${fixed} ${unit}. Jokainen lisäys tuo ${scale} ${unit}.`),
  ], 'Rakenna luonnos ja mittaa se. Merkitse havainto. Muuta määrää sen avulla.',
  'Vertaa ensimmäistä mittausta tavoitteeseen. Puuttuuko jotain vai onko liikaa?',
  `Luonnoksesta saatiin ${trialUnits(task, startingCount)} ${unit}. Siksi ${direction} paloja. ${right} lisäystä ja alusta antavat ${task.targetUnits} ${unit}.`);
}

function trialWeights(r: Rng) { return trial(r, 2, 0, 'painoyksikköä', 'painoa', contextCount); }
function trialFence(r: Rng) { return trial(r, 3, 2, 'm', 'aitapalaa', contextLength); }
function trialTransfer(r: Rng) { return trial(r, 4, 3, 'painoyksikköä', 'painoa', contextCount); }

function strategy(r: Rng, methods: StrategyProblem['methods'], reasons: readonly string[], amounts: readonly number[],
  familiar: ProblemContentContext, givens: ProblemWorkbenchTask['givens'], explain: string) {
  const methodOrder = r.shuffle([0, 1, 2]);
  const reasonOrder = r.shuffle([0, 1, 2]);
  return item({
    mode: 'strategy', methods: methodOrder.map(i => methods[i]!), reasons: reasonOrder.map(i => reasons[i]!),
    correct: methodOrder.indexOf(0), reason: reasonOrder.indexOf(0), amounts,
  }, familiar, givens,
  'Valitse toimitusehtoon sopiva työtapa, tee sen ratkaiseva askel ja yhdistä tapa tavoitteeseen.',
  'Katso, kysytäänkö ryhmien määrää vai puuttuvaa osaa. Tarkista myös toimitusehto.', explain);
}
const way = (label: string, step: string, unit: string) => ({ label, steps: [{ label: step, unit }] });
const bags = way('Tee täysiä ryhmiä', 'Täysiä ryhmiä', 'kpl');
const gap = way('Täydennä tavoitteeseen', 'Lisättävä määrä', 'kpl');
const count = way('Vie yksitellen', 'Matkoja', 'kpl');
const remove = way('Laske jäljelle jäävä määrä', 'Jäljellä', 'kpl');

function strategyGroup(r: Rng) {
  const [size, trips] = r.pick([[3, 2], [4, 3], [5, 2]] as const);
  return strategy(r, [{ ...bags, plan: { fixed: 0, perStep: size, unit: 'evästä' } },
    { ...count, plan: { fixed: 0, perStep: 1, unit: 'evästä' } }, gap], [
    'Täydet korit mahtuvat sallittuihin matkoihin.', 'Jokaiselle eväälle on tehtävä oma matka.', 'Telttaan viedään vain puuttuvat eväät.',
  ], [trips], contextGroup, [
    given('Toimitus', `Vie kaikki ${size * trips} evästä. Koriin mahtuu ${size}.`),
    given('Ehto', `Saat tehdä enintään ${trips + 1} matkaa. Täytä korit ja selvitä tarvittavat matkat.`),
  ], `${trips} täyttä koria, joissa on ${size} evästä kussakin, riittää. Yksitellen tehtäisiin liian monta matkaa.`);
}

function strategyMissing(r: Rng) {
  const [goal, have] = r.pick([[14, 8], [15, 9], [13, 6]] as const);
  return strategy(r, [{ ...gap, plan: { fixed: have, perStep: 1, unit: 'mukia pöydällä' } }, bags,
    { ...count, plan: { fixed: have, perStep: 1, unit: 'mukia pöydällä' } }], [
    'Löydän lisättävän määrän valmiin ja tavoitteen välistä.', 'Ryhmät ovat aina tärkeämpiä kuin puuttuva määrä.', 'Voin tuoda koko määrän uudelleen.',
  ], [goal - have], contextGap, [
    given('Toimitus', `Pöydälle halutaan ${goal} mukia. Siellä on jo ${have}.`),
    given('Ehto', 'Valmiit jäävät pöydälle. Tuo vain puuttuvat.'),
  ], `Tavoitteesta puuttuu ${goal - have} mukia. Täydentämällä valmiin määrän tavoitteeseen vältytään turhalta kantamiselta.`);
}

function strategyTransfer(r: Rng) {
  const [a, b] = r.pick([[15, 4], [17, 5], [12, 7]] as const);
  return strategy(r, [remove, bags, count], [
    'Otan käytetyt pois ja saan suoraan jäljelle jäävät.', 'Teen täysiä ryhmiä, vaikka ryhmäkokoa ei tarvita.', 'Kannettava määrä löytyy matkoja laskemalla.',
  ], [a - b], contextRemoval, [
    given('Uusi tilanne', `Majavalla oli ${a} tappia. Hän käytti ${b}.`),
    given('Ehto', 'Selvitä, montako on jäljellä. Tappeja ei kuljeteta.'),
  ], `Käytetyt poistetaan aloitusmäärästä. Jäljellä on ${a - b} tappia.`);
}

function estimate(r: Rng, bounds: readonly [number, number], proposed: number, anchors: string, unit: string,
  familiar: ProblemContentContext, givens: ProblemWorkbenchTask['givens']) {
  const [lo, hi] = bounds;
  const width = hi - lo;
  return item({
    mode: 'estimate', bounds, proposed, anchors, unit,
    ranges: r.shuffle([bounds, [Math.max(0, lo - width), lo - 1], [hi + 1, hi + width]] as const),
  }, familiar, givens,
  'Yhdistä väljät rajat arvioalueeksi. Aseta alue ennen kuin katsot Loikan ehdotuksen.',
  'Laske pienistä ankkureista alaraja ja suurista yläraja. Tarkkaa määrää ei tarvita.',
  `Ankkurit rajaavat arvion välille ${lo}–${hi} ${unit}. Siksi ${proposed} ${unit} on ${{
    short: 'arvion alapuolella', fits: 'arvion sisällä', surplus: 'arvion yläpuolella',
  }[compareTo(proposed, lo, hi)]}.`);
}

function estimateBaskets(r: Rng) {
  const baskets = r.pick([3, 4, 5]);
  return estimate(r, [baskets * 4, baskets * 6], baskets * 15, 'Jokaisessa korissa on 4–6 evästä.', 'evästä', contextGroup,
    [given('Retkipöytä', `${baskets} koria`)]);
}
function estimateCrates(r: Rng) {
  const ten = r.pick([20, 30, 40]), lo = ten + 10, hi = ten + 30;
  const proposed = r.pick([lo - 7, lo + 4]);
  return estimate(r, [lo, hi], proposed, 'Yhdistä laatikoiden väljät ala- ja ylärajat.', 'tappia', contextEstimate,
    [given('Laatikko A', `${ten}–${ten + 10} tappia`), given('Laatikko B', '10–20 tappia')]);
}
function estimateTransfer(r: Rng) {
  const a = r.pick([6, 7, 8]), b = r.pick([3, 4, 5]);
  return estimate(r, [a + b, a + b + 4], r.pick([a + b - 3, a + b + 2, a + b + 8]),
    'Köydet liitetään peräkkäin ilman päällekkäisyyttä.', 'm', contextLength,
    [given('Rantaköysi', `${a}–${a + 2} m`), given('Telttaköysi', `${b}–${b + 2} m`)]);
}

function repair(task: RepairProblem, situation: string, familiar: ProblemContentContext, explain: string) {
  return item(task, familiar, [given('Pulma', situation)],
    'Seuraa laskupolkua. Merkitse ensimmäinen kohta, jossa yhteys pulmaan katkeaa, ja korjaa se.',
    'Tarkista yksi vaihe kerrallaan. Vertaa jokaista vaihetta siihen, mitä alkuperäisessä pulmassa tapahtuu.', explain);
}
function repairRemoval(r: Rng) {
  const [a, b] = r.pick([[13, 5], [15, 4], [17, 3]] as const);
  return repair({
    mode: 'repair', left: a, right: b, correctSign: '−', unit: 'tappia', firstFault: 1,
    chain: [`Aluksi laatikossa on ${a} tappia.`, `Kun ${b} käytetään, lisään: ${a} + ${b} = ${a + b}.`, `Laatikkoon jää ${a + b} tappia.`],
  }, `Laatikossa oli ${a} tappia. Telttaan käytettiin ${b}. Paljonko jäi?`, contextRemoval,
  `Vaiheessa 2 käytetyt tapit pitää ottaa pois: ${a} − ${b} = ${a - b}.`);
}
function repairGroups(r: Rng) {
  const [a, b] = r.pick([[3, 4], [2, 5], [4, 4]] as const);
  return repair({
    mode: 'repair', left: a, right: b, correctSign: '×', unit: 'kuppia', firstFault: 2,
    chain: [`Pusseja on ${a}.`, `Kussakin pussissa on ${b} kuppia.`, `Yhdistän luvut: ${a} + ${b} = ${a + b} kuppia.`],
  }, `${a} pussia, jokaisessa ${b} kuppia. Kuinka monta kuppia yhteensä?`, contextGroup,
  `Vaiheessa 3 tarvitaan ${a} samanlaista ${b} kupin ryhmää: ${a} × ${b} = ${a * b}.`);
}
function repairTransfer(r: Rng) {
  const [a, b] = r.pick([[12, 4], [15, 5], [18, 6]] as const);
  return repair({
    mode: 'repair', left: a, right: b, correctSign: '−', unit: 'omenaa', firstFault: 1,
    chain: [`Aluksi on ${a} omenaa.`, `Kun jaetaan pois ${b}, koriin tulee ${b} lisää: ${a} + ${b} = ${a + b}.`,
      `Otan vielä ${2 * b} pois: ${a + b} − ${2 * b} = ${a - b}. Lopputulokseni on ${a - b}.`],
  }, `Korissa on ${a} omenaa. Retkeläisille annetaan korista ${b}. Kuinka monta jää koriin?`, contextRemoval,
  `Lopun ${a - b} on sattumalta oikein. Vaiheessa 2 pitää vähentää ${b} eikä lisätä sitä. Sen jälkeen ei tarvita uutta vähennystä.`);
}

function represent(parts: RepresentProblem['parts'], medium: RepresentProblem['medium'], situation: string, familiar: ProblemContentContext) {
  const media = { stone: 'kiviä', tile: 'palikoita', point: 'pisteitä', square: 'ruutuja' };
  return item({ mode: 'represent', parts, medium }, familiar, [given('Tilanne', situation)],
    `Rakenna malli. Valitse kullekin mallin osalle nimi ja lisää oikea määrä ${media[medium]}.`,
    'Yksi merkki vastaa yhtä asiaa. Laske mallista, näkyykö jokainen osa oikean kokoisena.',
    `Mallin osat: ${parts.map(part => `${part.label} ${part.count}`).join(', ')}. Merkkien paikoilla ei ole väliä ryhmän sisällä.`);
}

function representShares(r: Rng, medium: RepresentProblem['medium'], transferred = false) {
  const n = r.pick(transferred ? [5, 6, 7] : [2, 3, 4]);
  return represent([{ label: 'Aavan osuus', count: n }, { label: 'Loikan osuus', count: n }], medium,
    `Jaa ${2 * n} ${transferred ? 'mukia' : 'evästä'} Aavalle ja Loikalle tasan.`, contextShare);
}
function representGroups(r: Rng, medium: RepresentProblem['medium']) {
  const [a, b] = r.pick([[2, 4], [3, 5], [4, 3]] as const);
  return represent([{ label: 'Aavan teltta', count: a }, { label: 'Loikan teltta', count: b }], medium,
    `Aavan teltta tarvitsee ${a} kiilaa ja Loikan teltta ${b}. Näytä tilauksen kaksi osaa.`, contextCount);
}

const defs: readonly Definition[] = [
  {
    id: 'M-PS-01', stop: 'Köysipulman kaksi taskua', icon: '◫',
    intro: 'Loikka löysi köysikortin. Hän kaipaa apua sen selvittämiseen, mikä tiedetään ja mitä vielä etsitään.',
    goal: 'Opit erottamaan annetut tiedot, kysymyksen ja tuntemattoman määrän.',
    reward: 'Köyden suunnitelma selkeni. Ystävät löytävät oikean työvaiheen.',
    families: [['sort-length-remaining', sortRemaining], ['sort-quantity-together', sortJoining]], transfer: sortLunch,
    limit: 'Näyttö koskee korttien jäsentämistä ja tuntemattoman nimeämistä. Varsinaista laskutoimitusta ei vielä vaadita.',
  },
  {
    id: 'M-PS-02', stop: 'Kivien koerakennelma', icon: '●',
    intro: 'Loikan luonnos tarvitsee koemittauksen. Aava tuo kivet ja jättää pöydälle tilaa toiselle yritykselle.',
    goal: 'Opit mittaamaan kokeen, merkitsemään havainnon ja muuttamaan yritystä sen mukaan.',
    reward: 'Toimiva kokeilu pitää teltan paikallaan. Ensimmäinen yritys jää hyödylliseksi luonnokseksi.',
    families: [['trial-repeat-weights', trialWeights], ['trial-extend-fixed-base', trialFence]], transfer: trialTransfer,
    limit: 'Näyttö koskee määrättyä aloituskoetta, sen suuntaa kuvaavaa havaintoa ja uutta toimivaa rakennelmaa. Koe käyttää ihanteellista yksikkömallia.',
  },
  {
    id: 'M-PS-03', stop: 'Reitti ilman turhaa kantamista', icon: '↦',
    intro: 'Aava etsii kuhunkin toimitukseen sopivaa tapaa. Loikka odottaa pöydän toisella puolella.',
    goal: 'Opit valitsemaan tilanteeseen sopivan tavan ja tekemään ratkaisevan työvaiheen.',
    reward: 'Tarvikkeet saapuvat perille. Valittu tapa näkyy kuljetusjäljessä.',
    families: [['strategy-pack-with-trip-limit', strategyGroup], ['strategy-fill-to-target', strategyMissing]], transfer: strategyTransfer,
    limit: 'Valitun strategian lisäksi oppija tuottaa ratkaisevan määrän ja yhdistää sen annettuun ehtoon. Perustelu on rajattu suhteen tunnistamiseen.',
  },
  {
    id: 'M-PS-05', stop: 'Liian suuri eväskori', icon: '≈',
    intro: 'Loikka pohtii, pitäisikö varata kokonainen laivalasti. Aava pyytää ensin väljää arviota.',
    goal: 'Opit muodostamaan arvioalueen ja vertaamaan ehdotusta siihen.',
    reward: 'Jättikori väistyy suunnitelmasta. Retkelle jää arvioon sopiva kori.',
    families: [['estimate-equal-containers', estimateBaskets], ['estimate-combined-intervals', estimateCrates]], transfer: estimateTransfer,
    limit: 'Arvioalue johdetaan annetuista väljistä rajoista ennen ehdotuksen näyttämistä. Näyttö ei vaadi tarkkaa eväs-, tappi- tai köysimäärää.',
  },
  {
    id: 'M-PS-06', stop: 'Minne laskupolku kääntyi?', icon: '⤴',
    intro: 'Aava seuraa Loikan laskupolkua. Yhdessä välivaiheessa polku erkanee alkuperäisestä kysymyksestä.',
    goal: 'Opit merkitsemään ensimmäisen perustelemattoman vaiheen ja korjaamaan sen.',
    reward: 'Katkennut yhteys korjaantui. Telttakylän polku johtaa oikealle laiturille.',
    families: [['repair-removed-amount', repairRemoval], ['repair-equal-groups', repairGroups]], transfer: repairTransfer,
    limit: 'Näyttö vaatii ensimmäisen virhevaiheen, sopivan laskutoimituksen ja korjatun arvon. Siirrossa alkuperäinen loppuluku voi olla oikein.',
  },
  {
    id: 'M-REP-01', stop: 'Kivet kertovat ajatuksen', icon: '◉',
    intro: 'Aava pyytää Loikkaa näyttämään kivillä, miten eväät ja tarvikkeet kuuluvat pöydälle.',
    goal: 'Opit rakentamaan tutusta tilanteesta välinemallin, jossa osat ja määrät vastaavat tilannetta.',
    reward: 'Aava seuraa kivimallia ja kattaa pienen pöydän oikein.',
    families: [['objects-equal-shares', r => representShares(r, 'stone')], ['objects-combine-parts', r => representGroups(r, 'stone')]],
    transfer: r => representShares(r, 'tile', true),
    limit: 'Näyttö koskee oppijan rakentamia ja nimeämiä ryhmiä. Kivien tai palikoiden asettelu ryhmän sisällä on vapaa.',
  },
  {
    id: 'M-REP-02', stop: 'Kartta jonka toinen ymmärtää', icon: '▦',
    intro: 'Loikka jättää Aavalle vihkoon kuvan, joka kertoo, miten eväät tai tarvikkeet kuuluvat ryhmiin.',
    goal: 'Opit rakentamaan oman kuvan merkeistä ja yhdistämään kuvan osat annettuihin määriin.',
    reward: 'Aava lukee vihkon kuvan ja tekee jaon sen mukaan.',
    families: [['picture-equal-shares', r => representShares(r, 'point')], ['picture-combine-parts', r => representGroups(r, 'point')]],
    transfer: r => representShares(r, 'square', true),
    limit: 'Näyttö koskee oppijan itse lisäämiä pisteitä tai ruutuja ja niiden nimeämistä, käyttäen määrättyä ryhmäpohjaa. Vapaata piirtämistä tai motoriikkaa ei arvioida.',
  },
];

type ProblemSpec = Omit<NodeSpec, 'item'> & { item: (r: Rng, phase: Phase) => BoardItem };
function lesson(def: Definition): ProblemSpec {
  const rev = `exp690-lm02-${def.id.toLowerCase()}-v1`;
  return {
    id: def.id, stop: def.stop, icon: def.icon, intro: def.intro, goal: def.goal, reward: def.reward,
    rev, validRevs: [rev],
    demo(r) {
      const example = def.families[0][1](r);
      return [{ say: example.hint!, scene: example.scene! }, { say: example.explain, scene: problemWorkbenchExample(example.task) }];
    },
    item(r, phase) {
      const [tag, create] = phase === 'transfer' ? ['transfer', def.transfer] as const : r.pick(def.families);
      return { ...create(r), tag };
    },
  };
}

export const problemWorkbenchSpecs: ProblemSpec[] = defs.map(lesson);
export const problemWorkbenchEvidence: Readonly<Record<string, { families: readonly string[]; limit: string }>> =
  Object.fromEntries(defs.map(def => [def.id, { families: def.families.map(([tag]) => tag), limit: def.limit }]));
