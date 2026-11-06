import type { Rng } from '../engine/rng';
import type { Item, NodeSpec, Phase } from '../engine/types';
import { CARBON_PROTOTYPE_PROFILE, completeCarbonBonds, solutionCarbonKitchen, type CarbonAtom, type CarbonBond, type CarbonKitchenTask, type CarbonMolecule, type CarbonProfile, type CarbonReview, type CarbonNutrientTask, type NutrientComponent } from './models/carbon-kitchen';
import { carbonKitchenScene, type CarbonKitchenScene } from './models/carbon-kitchen-scene';
import { carbonKitchenBoard, carbonKitchenExample } from './scenes/carbon-kitchen';

type Variant = 'build' | 'repair' | 'transfer';
type CarbonItem = Omit<Item, 'task' | 'sceneModel'> & { task: CarbonKitchenTask; sceneModel?: CarbonKitchenScene };
type DraftTask = CarbonKitchenTask extends infer T ? T extends CarbonKitchenTask ? Omit<T, 'kind' | 'run' | 'title'> : never : never;
const context = (title: string, ...skills: string[]) => ({ title, skills });
const atom = (id: string, element: CarbonAtom['element'], hydrogens?: number): CarbonAtom => ({ id, element, ...(hydrogens === undefined ? {} : { hydrogens }) });
const bond = (a: string, b: string, order: 1 | 2 | 3 = 1): CarbonBond => ({ a, b, order });
const compoundPool = [
  { name: 'Hiilidioksidi', formula: { C: 1, O: 2 }, appearance: 'Väritön kaasu', appearanceColor: 'colorless' },
  { name: 'Metaani', formula: { C: 1, H: 4 }, appearance: 'Väritön kaasu', appearanceColor: 'colorless' },
  { name: 'Etanoli', formula: { C: 2, H: 6, O: 1 }, appearance: 'Väritön neste', appearanceColor: 'colorless' },
  { name: 'Glukoosi', formula: { C: 6, H: 12, O: 6 }, appearance: 'Valkoinen kiinteä aine', appearanceColor: 'white' },
  { name: 'Sakkaroosi', formula: { C: 12, H: 22, O: 11 }, appearance: 'Valkoinen kiinteä aine', appearanceColor: 'white' },
  { name: 'Propaani', formula: { C: 3, H: 8 }, appearance: 'Väritön kaasu', appearanceColor: 'colorless' },
  { name: 'Asetoni', formula: { C: 3, H: 6, O: 1 }, appearance: 'Väritön neste', appearanceColor: 'colorless' },
  { name: 'Etikkahappo', formula: { C: 2, H: 4, O: 2 }, appearance: 'Väritön neste', appearanceColor: 'colorless' },
] as const;
function composition(r: Rng, variant: Variant): DraftTask {
  const pool = variant === 'transfer' ? compoundPool.filter(c => c.appearance.startsWith('Väritön')) : compoundPool;
  const first = r.pick(pool), second = r.pick(compoundPool.filter(c => c.name !== first.name));
  return { mode: 'composition', context: context('Alkuaineen tunnus ja aineen annettu atomikoostumus', 'CHEM79-ELEMENT'),
    cards: [{ id: 'a', ...first }, { id: 'b', ...second }, { id: 'c', name: 'Alkuainehiili · verkon koostumus', formula: { C: r.int(2, 9) }, appearance: 'Musta grafiittinäyte', appearanceColor: 'black' as const },
      { id: 'd', name: 'Vesi', formula: { H: 2, O: 1 }, appearance: 'Väritön neste', appearanceColor: 'colorless' as const }],
    ...(variant === 'repair' ? { claim: { kind: 'all-carbon-black-element' as const, text: 'Hiiltä sisältävä aine on aina mustaa alkuainehiiltä.' } } : {}) };
}
const moleculeFormulae = [
  { C: 1, H: 4, O: 0 }, { C: 1, H: 0, O: 2 }, { C: 1, H: 2, O: 1 }, { C: 2, H: 2, O: 0 },
  { C: 2, H: 4, O: 0 }, { C: 2, H: 6, O: 0 }, { C: 2, H: 6, O: 1 }, { C: 3, H: 8, O: 1 }, { C: 3, H: 6, O: 1 },
] as const;
function molecule(r: Rng, variant: Variant): DraftTask {
  const selected = r.pick(variant === 'transfer' ? moleculeFormulae.slice(4) : moleculeFormulae);
  const atoms = (['C', 'O', 'H'] as const).flatMap(element => Array.from({ length: selected[element] }, (_, i) => atom(`${element.toLowerCase()}${i + 1}`, element)));
  const formula = (['C', 'H', 'O'] as const).filter(e => selected[e]).map(e => `${e}${selected[e] === 1 ? '' : selected[e]}`).join('');
  const co2 = { atoms: [atom('c', 'C'), atom('o1', 'O'), atom('o2', 'O')], bonds: [bond('c', 'o1', 2), bond('c', 'o2', 2)] };
  const solution = completeCarbonBonds(atoms);
  return { mode: 'molecule-build', atoms, formula, context: context('Annetun neutraalin C/H/O-mallin atomit ja sidosten lukumäärät', 'CHEM79-COMPOUND'),
    ...(variant === 'repair' ? { proposal: solution.slice(1) } : {}), samples: [
      { id: 'carbon', description: 'Alkuainehiilen verkon katkelma. Katkaisupäät jatkuvat näytteen verkkoon.', atoms: [atom('c1', 'C'), atom('c2', 'C'), atom('c3', 'C')], bonds: [bond('c1', 'c2'), bond('c2', 'c3')], form: 'network' },
      { id: 'co2', description: 'Hiilidioksidi. C ja O liittyvät samaan molekyyliin. Se luokitellaan epäorgaaniseksi hiiliyhdisteeksi.', ...co2, form: 'molecules' },
      { id: 'mix', description: 'Alkuainehiilen näyte ja happikaasu samassa astiassa, erillisinä aineina. Niiden välille ei muodostu sidosta.', atoms: co2.atoms, bonds: [bond('o1', 'o2', 2)], form: 'separate-substances' },
    ] };
}
function components(r: Rng, focus: CarbonNutrientTask['focus']): NutrientComponent[] {
  const sugar = r.pick(['Glukoosi', 'Fruktoosi', 'Sakkaroosi', 'Maltoosi']);
  const fat = r.pick([{ name: 'Trioleiini', appearance: 'Nestemäinen malliaine huoneenlämmössä' }, { name: 'Tripalmitiini', appearance: 'Kiinteä malliaine huoneenlämmössä' }]);
  const base: NutrientComponent[] = [{ id: 'sugar', name: sugar, structure: 'sugar', appearance: 'Sokerin esimerkkikortti' },
    { id: 'fat', name: fat.name, structure: 'triglyceride', appearance: fat.appearance },
    { id: 'protein', name: r.pick(['Hernesiementen varastoproteiinit', 'Pavun proteiiniseos', 'Maidon kaseiiniproteiinit']), structure: 'amino-chain', appearance: 'Useiden aminohappotähteiden ketjuja' },
    { id: 'water', name: 'Vesi', structure: 'water', appearance: 'Väritön neste' }];
  if (focus === 'carbohydrate') base[3] = { id: 'starch', name: 'Tärkkelys', structure: 'starch', appearance: 'Ei makea · glukoosiosien pitkä ketju' };
  if (focus === 'fat') base[3] = { id: 'fat2', name: fat.name === 'Trioleiini' ? 'Tripalmitiini' : 'Trioleiini', structure: 'triglyceride', appearance: fat.name === 'Trioleiini' ? 'Kiinteä huoneenlämmössä' : 'Nestemäinen huoneenlämmössä' };
  return base;
}
function nutrient(r: Rng, variant: Variant, focus: CarbonNutrientTask['focus']): DraftTask {
  const list = components(r, focus), quantity = r.int(2, 16), second = r.int(2, 12);
  const foods = [{ id: 'food-a', name: variant === 'transfer' ? 'Uuden kuvitteellisen evään näyte' : 'Eväskorin näyte A', origin: 'imaginary' as const,
    parts: list.map((c, i) => ({ component: c.id, massG: i === 0 ? quantity : i === 1 ? second : i === 2 ? r.int(0, 9) : r.int(1, 8) })) },
    { id: 'food-b', name: 'Vertailuevään näyte B', origin: 'imaginary' as const, parts: list.map((c, i) => ({ component: c.id, massG: i === 0 ? 0 : i === 1 ? r.int(0, 4) : i === 2 ? r.int(1, 10) : r.int(0, 5) })) }];
  return { mode: 'nutrient-matrix', focus, components: list, foods, context: context('Annetut aine-esimerkit ja kuvitteellisen evään koostumus grammoina', focus === 'all' ? 'CHEM79-CARBON-COMPOUND' : 'CHEM79-NUTRIENT-01'),
    requested: { food: 'food-a', group: focus === 'all' ? r.pick(['carbohydrate', 'fat', 'protein'] as const) : focus },
    ...(variant === 'repair' ? { proposal: { food: 'food-a', group: 'carbohydrate' as const, text: focus === 'carbohydrate' ? 'Vain makean sokerin massa kuuluu hiilihydraatteihin; ei-makea tärkkelys ei kuulu.' : focus === 'fat' ? 'Vain kiinteä rasva kuuluu rasvoihin; nestemäinen rasva ei kuulu.' : 'Eväs A kuuluu vain hiilihydraatteihin.' } } : {}) };
}
function protein(r: Rng, variant: Variant): DraftTask {
  const length = r.int(3, 5), labels = r.shuffle(['Gly', 'Ala', 'Ser', 'Val', 'Leu', 'Thr']);
  const units = [...labels.slice(0, length + 1).map((label, i) => ({ id: `aa${i + 1}`, label, kind: 'amino-residue' as const })),
    { id: 'glucose', label: 'Glukoosiosa', kind: 'glucose-residue' as const }, { id: 'tail', label: 'Rasvahappotähde', kind: 'fat-tail' as const }];
  const list = components(r, 'all');
  list[2] = { id: 'protein', name: variant === 'transfer' ? 'Kasvisiemenen proteiiniseos' : 'Annettu proteiiniseos', structure: 'amino-chain', appearance: 'Eri aminohappojärjestyksiä · erilaisia proteiineja' };
  return { mode: 'protein-fragment', length, units, components: list, context: context('Aminohappotähteen kaaviomerkki ja evään annettu koostumus', 'CHEM79-NUTRIENT-01'),
    ...(variant === 'repair' ? { proposal: ['aa1', 'glucose', ...units.slice(2, length).map(u => u.id)] } : {}),
    foods: [{ id: 'plant', name: variant === 'transfer' ? r.pick(['Hernenäyte', 'Papuseos', 'Soijanäyte', 'Linssinäyte']) : 'Kasvipohjainen mallieväs', origin: 'plant',
      parts: [{ component: 'protein', massG: r.int(2, 16) }, { component: 'sugar', massG: r.int(1, 10) }] },
      { id: 'comparison', name: 'Vertailun koostumusnäyte', origin: variant === 'build' ? 'animal' : 'plant',
        parts: [{ component: 'protein', massG: r.pick([0, 0, 3, 5, 8]) }, { component: 'fat', massG: r.int(1, 9) }] }] };
}
/** Condensed model. Carbon hydrogens are explicitly counted in each atom label. */
function alcohol(id: string, name: string, count: number, position: number, boilingC: number) {
  const atoms: CarbonAtom[] = Array.from({ length: count }, (_, i) => atom(`c${i + 1}`, 'C', 4 - Number(i > 0) - Number(i < count - 1) - Number(i === position)));
  atoms.push(atom('o', 'O'), atom('h', 'H'));
  const bonds = [...Array.from({ length: count - 1 }, (_, i) => bond(`c${i + 1}`, `c${i + 2}`)), bond(`c${position + 1}`, 'o'), bond('o', 'h')];
  return { id, name, atoms, bonds, boilingC, pressurePa: 101325 as const };
}
// Whole-degree teaching table, approximately rounded normal boiling data from NIST SRD69.
// Arithmetic compares these explicitly given rounded values, never hidden extra decimals.
export const carbonAlcoholData = [
  alcohol('methanol', 'Metanoli', 1, 0, 65), alcohol('ethanol', 'Etanoli', 2, 0, 78),
  alcohol('propanol', 'Propan-1-oli', 3, 0, 97), alcohol('butanol', 'Butan-1-oli', 4, 0, 118),
  alcohol('pentanol', 'Pentan-1-oli', 5, 0, 138), alcohol('hexanol', 'Heksan-1-oli', 6, 0, 157),
] as const;
const organicReview: CarbonReview = {
  prompt: 'Perustele omin sanoin valitun alkoholiryhmän rakennepiirre ja näiden kahden aineen vertailu. Rajaa päätelmä annettuun aineistoon.',
  rubric: [
    { id: 'feature', label: 'Yhdistää rakennepiirteen esimerkkeihin', guide: 'Osoittaa O–H-ryhmän, joka liittyy yksinkertaisin sidoksin sitoutuneeseen hiileen. Pelkkä O ei riitä.' },
    { id: 'comparison', label: 'Käyttää molempien aineiden tietoja', guide: 'Vertaa nimettyjen mallien rakennetta ja annettuja kiehumispisteitä samassa paineessa.' },
    { id: 'boundary', label: 'Rajaa oman päätelmän aineistoon', guide: 'Kertoo mitä juuri nämä esimerkit näyttävät. Ei päättele kaikkia ominaisuuksia tai koko ryhmän yhtä arvoa pelkästä rakennepiirteestä.' },
  ],
  model: 'Molemmissa esimerkeissä O–H-ryhmä liittyy kylläiseen hiileen. Annetut kiehumispisteet koskevat samaa painetta, joten vertaan niiden lukuja. Sama ryhmä ei tarkoita samaa kiehumispistettä. Päätelmäni koskee näitä annettuja aineita.',
};
function organic(r: Rng, variant: Variant, profile: CarbonProfile | null): DraftTask {
  const selected = r.shuffle(carbonAlcoholData).slice(0, 2);
  if (variant === 'transfer') selected[0] = alcohol('propanol2', 'Propan-2-oli · uusi saman ryhmän rakenne', 3, 1, 82);
  const contrast: CarbonMolecule = { id: 'ether', name: 'Dimetyylieetteri · vertailurakenne', atoms: [atom('c1', 'C', 3), atom('o', 'O'), atom('c2', 'C', 3)], bonds: [bond('c1', 'o'), bond('o', 'c2')] };
  return { mode: 'organic-group', profile, context: { title: 'Tässä tehtävässä valittu ryhmä · alkoholit', skills: ['CHEM79-CARBON-COMPOUND'], kind: 'local-profile',
    ...(profile ? { profileGroup: profile.group } : {}), itemGroup: 'alcohols', allowedGroups: ['alcohols'] },
    molecules: selected, contrast, ...(variant === 'repair' ? { proposal: { molecule: contrast.id, text: 'Tässäkin on O, joten se on alkoholi.' } } : {}), review: organicReview };
}

const stories: Record<string, { title: string; intro: string; goal: string; reward: string }> = {
  "CHEM79-CARBON": {
    "title": "Hiili monessa asussa",
    "intro": "Hiilipuutarhan näyttelyssä Aava näkee hiiltä sisältäviä aineita, joiden ulkonäöt poikkeavat toisistaan. Sulka antaa koostumuskortit, jotta hiili löytyy muustakin kuin mustista kappaleista.",
    "goal": "Tunnista hiili alkuaineeksi ja monien yhdisteiden yhteiseksi osaksi koostumustietojen avulla; erota alkuaine aineista, joissa sitä esiintyy.",
    "reward": "Puutarhan eri näytteiden välille piirtyy hiilen yhteinen nimilanka."
  },
  "CHEM79-CARBON-COMPOUND": {
    "title": "Hiilen erilaiset naapurit",
    "intro": "Sulka avaa Aavalle valmiita hiiliyhdisteiden malleja. Loikka huomaa, että saman alkuaineen mukanaolo ei tee niiden rakenteista tai ominaisuuksista samanlaisia.",
    "goal": "Tunnista hiiliyhdiste hiiltä sisältäväksi yhdisteeksi ja vertaa annettuja atomilajeja sekä liittymistä; kaikki hiiliyhdisteet eivät kuulu orgaanisiin yhdisteisiin.",
    "reward": "Hiilipuutarhan rakennekaaristo saa erilaisille yhdisteille omat paikkansa."
  },
  "CHEM79-NUTRIENT-01": {
    "title": "Yhteinen eväspöytä",
    "intro": "Aava ja Loikka avaavat eväskorin ystäville ja tutkimuspöydälle. Sulka auttaa näkemään ruoat useiden kemiallisten aineiden yhdistelminä, ei yhden ravintoainemerkin omistamina esineinä.",
    "goal": "Luokittele annetut ravintoaine-esimerkit hiilihydraatteihin, rasvoihin ja proteiineihin sekä tulkitse monen ryhmän esiintyminen samassa ruoassa.",
    "reward": "Yhteinen eväspöytä avautuu, ja jokaisen annoksen tutkimuskortti kertoo sen monipuolisen kemiallisen koostumuksen."
  },
  "CHEM79-NUTRIENT-CARB": {
    "title": "Eväskorin hiilihydraatit",
    "intro": "Aava tutkii kuvitteellisen eväskorin koostumustietoja Sulan kanssa. Loikka löytää hiilihydraatteihin kuuluvia erilaisia aineita myös tuotteista, jotka eivät maistu makeilta.",
    "goal": "Tunnista annetut sokerit ja tärkkelys hiilihydraattien ryhmän esimerkeiksi ja liitä ryhmä koostumustietoon ilman ruoan arvottamista.",
    "reward": "Eväskorin makeuteen perustunut arvaus korjaantuu: myös ei-makea aine-esimerkki löytää hiilihydraattien paikan. Aava avaa tämän ryhmän pienen näyttelypöydän ystäville."
  },
  "CHEM79-NUTRIENT-FAT": {
    "title": "Rasvan monet muodot",
    "intro": "Sulka näyttää Aavalle rasvojen aineryhmää kuvaavan mallikortin sekä erilaisten elintarvikkeiden koostumuksia. Loikka huomaa, että rasva voi olla mukana ilman näkyvää rasvalammikkoa.",
    "goal": "Tunnista rasvat kemialliseksi ravintoaineryhmäksi annetun rakenne- ja koostumustiedon perusteella; erottele ryhmä arkisesta ulkonäöstä.",
    "reward": "Näkyvän ulkonäön taakse kätkeytyneet rasvaryhmän esimerkit löytyvät koostumustiedoista. Eväspajan oma tutkimusliina avautuu, ja Loikka esittelee ryhmän kaksi erilaista esimerkkiä."
  },
  "CHEM79-NUTRIENT-PROT": {
    "title": "Proteiinin rakentuvat ketjut",
    "intro": "Aava seuraa Sulan merkittyä proteiinimallia, jossa aminohappo-osat liittyvät ketjuksi. Loikka vertaa mallia eväiden annettuihin koostumustietoihin.",
    "goal": "Tunnista proteiinit ravintoaineiden kemialliseksi ryhmäksi ja yhdistä ne annetussa mallissa aminohapporakenteeseen; löydä ryhmä eri ruoka-aineiden tiedoista.",
    "reward": "Proteiinimalli avautuu ketjuksi ja liittyy annettuihin eri ruokien koostumuksiin. Aava tuo näyttelyyn myös kasvipohjaisen esimerkin, ja ystävien yhteinen pöytä saa uuden ymmärrettävän osan."
  },
  "CHEM79-ORG-GROUP": {
    "title": "Puutarhurin tutkimuslaatikko",
    "intro": "Sulka avaa puutarhan alkoholien tutkimuslaatikon. Aava vertaa kahta rakennetta ja annettuja ominaisuuksia.",
    "goal": "Tunnista alkoholien rakennepiirre, vertaa kahta annettua ominaisuusarvoa ja perustele oma aineistoon rajattu päätelmä.",
    "reward": "Puutarhan paikallinen näyttely avautuu kyseisen ryhmän tutkimustuloksille, kun olet näyttänyt osaamisesi."
  }
};
interface Definition { id: string; families: readonly [string, string]; author: (r: Rng, variant: Variant, profile: CarbonProfile | null) => DraftTask; limit: string }
const definitions: Definition[] = [
  { id: 'CHEM79-CARBON', families: ['formula-element-comparison', 'appearance-claim-counterexample'], author: composition, limit: 'Annetun atomikoostumuksen hiili ja alkuaineen/yhdisteen ero. Ulkonäkö ei määritä koostumusta.' },
  { id: 'CHEM79-CARBON-COMPOUND', families: ['build-connected-molecule', 'repair-unbonded-compound'], author: molecule, limit: 'Oma valenssiehdot täyttävä neutraali C/H/O-molekyyli. Saman kaavan kaikki mallin ehdot täyttävät isomeerit hyväksytään. Verkkohiilen katkelma ja mekaaninen seos ovat erilliset annetut vertailumallit; hiilidioksidi on epäorgaaninen hiiliyhdiste.' },
  { id: 'CHEM79-NUTRIENT-01', families: ['classify-chemical-components', 'repair-single-group-food'], author: (r, v) => nutrient(r, v, 'all'), limit: 'Annettujen aine-esimerkkien ryhmät, evään moniryhmäinen koostumus ja oma ryhmän massan lasku. Valmiin ryhmän merkintä on tunnistusnäyttöä, ei vapaata selitystä.' },
  { id: 'CHEM79-NUTRIENT-CARB', families: ['sugar-and-starch-composition', 'repair-sweetness-only-food'], author: (r, v) => nutrient(r, v, 'carbohydrate'), limit: 'Annetut sokerit ja ei-makea tärkkelys sekä koostumusluettelon oma tulkinta. Malli ei määrittele kaikkia hiilihydraatteja yhdellä kaavalla.' },
  { id: 'CHEM79-NUTRIENT-FAT', families: ['liquid-solid-triglycerides', 'repair-visible-fat-only-food'], author: (r, v) => nutrient(r, v, 'fat'), limit: 'Rasvan esimerkit rajataan triglyserideihin, glyseroliin liittyneisiin kolmeen rasvahappotähteeseen. Tämä ei väitä kaikkia lipidejä triglyserideiksi. Koostumustieto ratkaisee, ei olomuoto.' },
  { id: 'CHEM79-NUTRIENT-PROT', families: ['construct-amino-residue-fragment', 'repair-non-amino-chain'], author: protein, limit: 'Oma lyhyt proteiiniketjun mallikatkelma ja annetun koostumuksen proteiinit, myös kasveissa. Yksittäinen pala esittää aminohappotähdettä. Taivutus on havainnollistus, ei molekyylitason laskenta tai automaattisesti arvioitu taittumistaito.' },
  { id: 'CHEM79-ORG-GROUP', families: ['mark-alcohol-feature-and-compare', 'repair-oxygen-only-classification'], author: organic, limit: 'Vain eksplisiittisen prototype-teaching-choice-alcohols-profiilin aineisto. Omat rakennepiirteen merkinnät ja lukujen vertailu sekä erillinen oma aikuisen havaitsema rajattu perustelu. Puuttuva tai ristiriitainen profiili ei tuota näyttöä. Ei yleistystä muihin ryhmiin.' },
];
export function makeCarbonKitchenTask(id: string, r: Rng, variant: Variant, profile: CarbonProfile | null = CARBON_PROTOTYPE_PROFILE): CarbonKitchenTask {
  const def = definitions.find(def => def.id === id); if (!def) throw new Error('Unknown carbon-kitchen node');
  const data = def.author(r, variant, profile);
  let hash = 0xcbf29ce484222325n;
  for (const char of JSON.stringify(data)) hash = BigInt.asUintN(64, (hash ^ BigInt(char.charCodeAt(0))) * 0x100000001b3n);
  return { kind: 'carbon-kitchen', run: `carbon-${hash.toString(16)}`, title: stories[id]!.title, ...data } as CarbonKitchenTask;
}
function authored(def: Definition, r: Rng, phase: Phase): CarbonItem {
  const variant = phase === 'transfer' ? 'transfer' : r.pick(['build', 'repair'] as const), task = makeCarbonKitchenTask(def.id, r, variant);
  const say = task.mode === 'composition' ? 'Etsi hiili koostumuksista. Merkitse hiiliatomien määrä ja aineen tyyppi.'
    : task.mode === 'molecule-build' ? 'Rakenna sidokset omaan molekyyliin. Vertaa kolmea annettua näytettä.'
      : task.mode === 'nutrient-matrix' ? 'Ryhmittele aineet ja löydä evään kaikki ravintoaineryhmät. Laske pyydetyn ryhmän massa.'
        : task.mode === 'protein-fragment' ? `Kokoa ${task.length} aminohappotähteen katkelma. Etsi proteiinia sisältävät koostumusnäytteet.`
          : 'Merkitse kummankin alkoholin O–H-hiiliyhteys. Vertaa aineistoa ja perustele omin sanoin.';
  return { task, tag: variant === 'transfer' ? 'transfer' : def.families[variant === 'build' ? 0 : 1], say, sceneModel: carbonKitchenScene(task),
    hint: 'Tutki annettuja rakenne- ja koostumustietoja. Ulkonäkö tai yksi tuttu nimi ei korvaa aineen tietoja.',
    explain: 'Atomilajit, liittyminen ja annettu koostumus kuvaavat eri asioita. Sama alkuaine tai aineryhmä ei tee kaikista näytteistä samaa ainetta.' };
}
export const carbonKitchenSpecs: NodeSpec[] = definitions.map(def => {
  const story = stories[def.id]!, rev = `carbon-kitchen-${def.id.toLowerCase()}-v1`;
  return { id: def.id, stop: story.title, icon: '❧', intro: story.intro, goal: story.goal, reward: story.reward, rev, validRevs: [rev], produce: [...def.families], produceWhat: def.id === 'CHEM79-CARBON' ? 'hiilen atomimäärän kirjaamista ja koostumuksen tulkintaa' : def.id === 'CHEM79-CARBON-COMPOUND' ? 'oman kytketyn sidostorakenteen rakentamista' : def.id === 'CHEM79-NUTRIENT-PROT' ? 'oman aminohappotähdeketjun rakentamista' : def.id === 'CHEM79-ORG-GROUP' ? 'oman rakennepiirteen merkitsemistä ja aikuisen havaitsemaa aineistoon rajattua perustelua' : 'aine-esimerkkien tunnistamista, oman evästaulukon täyttämistä ja koostumuksen massan laskemista',
    demo: r => { const item = authored(def, r, 'independent'); return [{ scene: carbonKitchenBoard(item.task), sceneModel: carbonKitchenScene(item.task), say: story.goal }, { scene: carbonKitchenExample(item.task), sceneModel: carbonKitchenScene(item.task, solutionCarbonKitchen(item.task)), say: 'Sulka näyttää tämän mallin osat. Oma näyttö tehdään uudessa aineistossa.' }]; },
    item: (r, phase) => authored(def, r, phase) as unknown as Item };
});
export const carbonKitchenEvidence: Readonly<Record<string, { families: readonly string[]; limit: string }>> = Object.fromEntries(definitions.map(def => [def.id, { families: def.families, limit: `${def.limit} Näyttö on rajattu virtuaalinen kemian tutkimus. Mallin pikselit eivät ole atomikoon, sidospituuden tai aineen määrän mitta. Kuvitteelliset evästiedot eivät ole ruokavalio-ohje.` }]));
