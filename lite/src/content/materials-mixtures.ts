import type { Item, NodeSpec, Phase } from '../engine/types';
import type { Rng } from '../engine/rng';
import { type MaterialsMixturesTask, type MaterialSample, type MixtureReview, type CompositionSample,
  type SeparationMethod, type SeparationStation } from './models/materials-mixtures';
import { materialsMixturesScene, type MaterialsMixturesScene } from './models/materials-mixtures-scene';
import { materialsMixturesBoard, materialsMixturesExample } from './scenes/materials-mixtures';

type MixtureItem = Omit<Item, 'task'> & { task: MaterialsMixturesTask; sceneModel?: MaterialsMixturesScene };
type Author = (r: Rng) => Omit<MixtureItem, 'tag'>;
type Variant = 'build' | 'contrast' | 'transfer';
type Definition = Pick<NodeSpec, 'id' | 'stop' | 'icon' | 'intro' | 'goal' | 'reward' | 'produceWhat'> & {
  families: readonly [readonly [string, Author], readonly [string, Author]]; transfer: Author; limit: string;
};
const contexts = { materials: { title: 'Annetut ominaisuushavainnot ja saman mittauksen vertailu', skills: ['M-NUM-10'] }, levels: { title: 'Esineen nimi ja annettu koostumustieto', skills: [] }, state: { title: 'Muoto ja tilavuus astiassa', skills: [] }, phase: { title: 'Saman vesinäytteen olomuodot', skills: ['ENV-CHEM-STATE-01'] }, composition: { title: 'Nimetyt kemialliset aineet ja annetut faasirajat', skills: ['CHEM79-SUBSTANCE-01'] }, dissolve: { title: 'Massan säilyminen ja annetun kapasiteetin käyttö', skills: ['M-NUM-10', 'CHEM79-PURE-MIX'] }, separate: { title: 'Annetut raekoot, liukoisuus ja haihtuvuus; dekantoinnissa kolme neljäsosaa', skills: ['M-FRAC-03', 'CHEM79-PURE-MIX'] } };
const review = (prompt: string, guide: string, model: string): MixtureReview => ({ prompt, model, rubric: [
  { id: 'relation', label: 'Liittää oman väitteensä annettuun havaintoon', guide },
  { id: 'boundary', label: 'Rajaa väitteen tämän näytteen oloihin', guide: 'Kertoo, mitä tästä kokeesta voi päätellä ja mitä ei. Ei päättele turvallisuutta, kaikkien aineiden ominaisuuksia tai puhtautta pelkästä ulkonäöstä.' },
] });
function item(_r: Rng, data: Omit<MaterialsMixturesTask, 'kind' | 'run' | 'context'>, say: string, hint: string, explain: string): ReturnType<Author> {
  // Stable authored conditions, not a random freshness nonce. Every run starts a new empty ledger.
  let hash = 0xcbf29ce484222325n;
  for (const char of JSON.stringify(data)) hash = BigInt.asUintN(64, (hash ^ BigInt(char.charCodeAt(0))) * 0x100000001b3n);
  const task: MaterialsMixturesTask = { kind: 'materials-mixtures', run: `matter-${hash.toString(16)}`, context: contexts[data.mode], ...data };
  return { task, scene: materialsMixturesBoard(task), sceneModel: materialsMixturesScene(task), say, hint, explain };
}
function materials(r: Rng, skill: 'identify' | 'compare' | 'integrate' | 'property', variant: Variant) {
  const base = r.int(1, 9);
  const objects = variant === 'transfer' ? ['lasta', 'rengas', 'purkki'] : variant === 'contrast' ? ['levy', 'levy', 'levy'] : ['kuppi', 'kaari', 'pala'];
  const samples: MaterialSample[] = r.shuffle([
    { material: 'wood' as const, absorption: 18 + base, bend: 2 + base, transmission: 0, hard: false },
    { material: 'metal' as const, absorption: 0, bend: 15 + base, transmission: 0, hard: true },
    { material: 'glass' as const, absorption: 0, bend: 0, transmission: 80 + base, hard: true },
  ]).map((s, i) => ({ ...s, id: String.fromCharCode(65 + i), label: `Pala ${String.fromCharCode(65 + i)}`, object: objects[i]! }));
  const property = variant === 'transfer' ? 'transmission' as const : variant === 'contrast' ? 'bend' as const : 'absorption' as const;
  return item(r, { mode: 'materials', skill, samples,
    ...(['compare', 'integrate'].includes(skill) || (skill === 'property' && variant === 'contrast') ? { property, choose: property === 'absorption' ? 'min' as const : 'max' as const,
      purpose: property === 'absorption' ? 'sateelta suojaava jäykkä näytekansi; tässä kokeessa pienin vedenimeytyminen riittää, tasapeli sallitaan'
        : property === 'bend' ? 'taivutettava kiinnitin; suurin taipuma samalla kuormalla' : 'katseluikkuna; suurin valon läpäisy' } : {}),
    ...(skill === 'property' ? { observations: r.shuffle([
      { id: 'light', text: `Valosta ${80 + base} % pääsee läpi samalla paksuudella.`, property: 'transmission' },
      { id: 'bend', text: `Samalla kuormalla pala taipuu ${base + 2} mm.`, property: 'bend' },
      { id: 'scratch', text: 'Annettu koetin ei naarmuta pintaa.', property: 'hardness' },
      { id: 'like', text: variant === 'transfer' ? 'Vihreä pala on minusta kaunis.' : 'Kiiltävä pala on minusta paras.', property: 'opinion' },
    ]).filter(o => variant !== 'contrast' || o.id === 'bend' || o.id === 'like') } : {}),
    ...(['compare', 'integrate'].includes(skill) ? { review: review('Valitse pala ja perustele ominaisuudella juuri tähän käyttöön. Kerro, mikä voisi sopia eri käyttöön.',
      'Mainitsee vertailussa saman kuorman, paksuuden tai vedenkäsittelyn, käyttää oikeaa havaintoa ja yhdistää sen tarkoitukseen.',
      'Tähän käyttöön valitsen vaaditun ominaisuuden perusteella. Sama näyte ei ole paras kaikkiin tarkoituksiin, ja nämä ovat annettujen palojen mittauksia.') } : {}),
    setting: 'Rantapajan kolme nimettyä vertailupalaa. Mittaukset ovat näiden palojen mallihavaintoja, eivät kaikkien puu-, metalli- ja lasilaatujen vakioita.' },
  skill === 'property' ? 'Nimeä havaittu ominaisuus. Erota havainto omasta mieltymyksestä.' : skill === 'identify' ? 'Liitä näytteet materiaalinimiin usean havainnon perusteella.' : 'Tunnista tarvittaessa materiaalit, laske vertailuero ja perustele käyttötarkoitukseen sopiva valinta.',
  'Vertaa samoissa oloissa mitattuja ominaisuuksia. Näytteen muoto tai oma mieltymys ei ole materiaalin nimi.',
  'Materiaali tunnistetaan ominaisuustiedoista. Käyttökelpoisuus riippuu tehtävästä ja kyseisten palojen vertailusta.');
}
function levels(r: Rng, variant: Variant) {
  const cards = variant === 'transfer' ? [
    ['juomapullo', 'lasi', 'piidioksidi', 'Tämä annettu lasi sisältää piidioksidia sekä muita aineita.'],
    ['ikkunaruutu', 'lasi', 'piidioksidi', 'Tämän lasin yksi aine on piidioksidi, mutta lasinäyte ei ole puhdasta piidioksidia.'],
  ] : variant === 'contrast' ? [
    ['ruuvi', 'teräs', 'rauta', 'Annettu teräs sisältää rautaa ja hiiltä.'], ['kattila', 'teräs', 'rauta', 'Tässä kattilamateriaalissa on rautaa sekä muita aineita.'],
    ['purje', 'puuvillakangas', 'selluloosa', 'Tämän kankaan kuitu sisältää selluloosaa.'],
    ['paita', 'puuvillakangas', 'selluloosa', 'Puuvillakuidun yksi aine on selluloosa.'],
    ['rengas', 'messinki', 'kupari', 'Tämä messinki on kuparin ja sinkin seos.'],
    ['kahva', 'pronssi', 'kupari', 'Annettu pronssi sisältää kuparia ja tinaa.'],
    ['lusikka', 'teräs', 'rauta', 'Terässeos sisältää rautaa ja hiiltä.'],
  ] : [['vene', 'puu', 'selluloosa', 'Annettu puu sisältää selluloosaa ja muita aineita.'], ['lasta', 'puu', 'selluloosa', 'Tämä puu ei koostu vain yhdestä kemiallisesta aineesta.'],
    ['laatikko', 'puu', 'selluloosa', 'Selluloosa on yksi tämän puumateriaalin aineista.'],
    ['köysi', 'pellavakuitu', 'selluloosa', 'Pellavakuitu sisältää selluloosaa ja muita aineita.'],
    ['tulppa', 'korkki', 'suberiini', 'Tämä korkkimateriaali sisältää suberiinia sekä muita aineita.']];
  const [object, material, substance, fact] = r.pick(cards)!;
  return item(r, { mode: 'levels', skill: 'levels', levels: { object: object!, material: material!, substance: substance!, fact: fact! },
    setting: 'Pajaluettelo; sama esine voitaisiin tehdä eri materiaalista.',
    review: review('Kuvaile annettua kohdetta esineen, materiaalin ja yhden kemiallisen aineen tasolla.',
      'Yhdistää kaikki kolme tasoa tähän samaan kohteeseen omin sanoin. Kertoo, ettei koko materiaali välttämättä ole vain tuo yksi aine.',
      `${object} on esine. ${material} on sen materiaali. ${substance} on yksi annetun materiaalin kemiallisista aineista. Materiaalin nimi ei takaa kemiallista puhtautta.`) },
  'Järjestä kolme nimeä oikeille tarkastelutasoille ja kerro, miten ne liittyvät samaan kohteeseen.',
  'Esineellä on käyttö. Materiaali kertoo, mistä se tehdään. Koostumustieto nimeää sen kemiallisia aineita.',
  'Samaa esinettä voi valmistaa eri materiaaleista. Yksi materiaali voi sisältää useita kemiallisia aineita.');
}
function state(r: Rng, variant: Variant) {
  const n = r.int(2, 14) * 100;
  const labels = variant === 'transfer' ? ['Metallipala', 'Nestemäinen öljy', 'Näkymätön typpikaasu'] : ['Jääpala', 'Nestemäinen vesi', 'Näkymätön vesihöyry'];
  return item(r, { mode: 'state', skill: 'state', stateExperiment: variant === 'contrast' ? 'compress' : 'reshape', states: r.shuffle([
    { id: 'a', label: labels[0]!, phase: 'solid' as const, massMg: n, behavior: variant === 'contrast' ? 'Kevyt puristus ei muuta tilavuutta juuri lainkaan; pala säilyttää oman muotonsa.' : 'Muoto ja tilavuus säilyvät, kun näyte vaihdetaan astiaan.' },
    { id: 'b', label: labels[1]!, phase: 'liquid' as const, massMg: n + 100, behavior: variant === 'contrast' ? 'Kevyt puristus ei muuta tilavuutta juuri lainkaan; näyte virtaa astian muotoon.' : 'Virtaa astian muotoon, tilavuus säilyy lähes samana.' },
    { id: 'c', label: labels[2]!, phase: 'gas' as const, massMg: n - 100, behavior: variant === 'contrast' ? 'Kevyessä puristuksessa tilavuus pienenee selvästi; näyte täyttää aina käytettävissä olevan tilan.' : 'Täyttää suljetun astian, ja tilavuus voi muuttua puristettaessa.' },
  ]), setting: variant === 'contrast' ? 'Korkeasta leveään suljettuun astiaan; massa säilyy. Kaasu voi olla näkymätöntä. Näkyvän sumun pienet vesipisarat ovat nestettä.'
    : 'Suljettu astianvaihtokoe. Kaasu ei ole tyhjää. Mallimerkit näyttävät ainetta, eivät yksittäisiä molekyylejä.' },
  variant === 'contrast' ? 'Luokittele näytteet ja ennusta tilavuus. Tee puristuskokeet.' : 'Vaihda astiat ja luokittele näytteet muodon ja tilavuuden käyttäytymisestä.',
  'Erota muuttuva muoto muuttuvasta tilavuudesta. Kaasu täyttää koko sille tarjotun tilan.',
  'Kiinteä säilyttää oman muotonsa. Neste muuttaa muotoa astian mukaan. Kaasu muuttaa myös tilavuuttaan.');
}
function phase(r: Rng, variant: Variant) {
  const row = variant === 'transfer' ? ['liquid', 'solid', 'Jäätyminen', 'Vettä jäähdytetään +8 °C → −8 °C'] :
    variant === 'contrast' ? ['gas', 'liquid', 'Tiivistyminen', 'Vesihöyryä jäähdytetään viileällä pinnalla'] :
      r.pick([['solid', 'liquid', 'Sulaminen', 'Jäätä lämmitetään −8 °C → +8 °C'], ['liquid', 'gas', 'Haihtuminen', 'Vettä haihtuu 20 °C:ssa ajan kuluessa']]);
  return item(r, { mode: 'phase', skill: 'phase', phase: { before: row[0] as 'solid' | 'liquid' | 'gas', after: row[1] as 'solid' | 'liquid' | 'gas',
    name: 'Sama vesi', temperature: `${row[3]}. Tavallinen ilmanpaine, kaikki vesi säilyy suljetussa mallijärjestelmässä.`, massMg: r.int(2, 16) * 100 },
    setting: 'Ennusta muutos ja seuraa samaa vesiainetta. Kaasu kerätään ympäristön suljettuun tilaan.' },
  'Nimeä alku- ja loppuolomuoto sekä muutos. Ennusta veden massa ennen koetta ja tee lämpötilakokeilu.',
  'Aineen nimi säilyy. Haihtumiseen ei vaadita kiehumista. Kaasuna oleva vesi kuuluu edelleen kokonaismassaan.',
  `${row[2]} muuttaa olomuotoa, ei veden kemiallista identiteettiä tai suljetun järjestelmän massaa.`);
}
function composition(r: Rng, pure: boolean, variant: Variant) {
  const n = r.int(2, 14);
  const a = variant === 'contrast' ? { name: 'Happi', formula: 'O₂', count: n } : { name: 'Vesi', formula: 'H₂O', count: n };
  const b = { name: variant === 'transfer' ? 'Etanoli' : 'Sakkaroosi', formula: variant === 'transfer' ? 'C₂H₆O' : 'C₁₂H₂₂O₁₁', count: n + 1 };
  const samples: CompositionSample[] = pure ? [
    { id: 'a', label: 'Näyte A', substances: [a], regions: [[n], [n]], phases: 1, clear: true },
    { id: 'b', label: 'Näyte B, kirkas', substances: [{ name: 'Vesi', formula: 'H₂O', count: n * 2 }, b], regions: [[n * 2, n + 1], [n * 2, n + 1]], phases: 1, clear: true },
  ] : [
    { id: 'a', label: 'Näyte A, liuos', substances: [{ name: 'Vesi', formula: 'H₂O', count: n * 2 }, b], regions: [[2 * n, n + 1], [2 * n, n + 1]], phases: 1, clear: true },
    { id: 'b', label: variant === 'transfer' ? 'Näyte B, öljypisaroiden emulsio' : variant === 'contrast' ? 'Näyte B, tasaisesti levitettyjä öljypisaroita' : 'Näyte B, erottuneet kerrokset',
      substances: [{ name: 'Vesi', formula: 'H₂O', count: n * 2 }, { name: 'Mallirasva', formula: 'rasvamolekyylit', count: n }],
      regions: variant === 'build' ? [[3 * n, 0], [n, 2 * n]] : [[2 * n, n], [2 * n, n]], phases: 2, clear: false },
  ];
  return item(r, { mode: 'composition', skill: pure ? 'pure' : 'homogeneous', compositions: r.shuffle(samples), setting:
    'Koostumuskortin merkit ovat saman kokoisten mallialueiden aineosuuksia. Kemiallisen aineen identiteetti nimetään kaavan vieressä. Tasainenkin emulsio sisältää erilliset vesi- ja rasvafaasit.' },
  pure ? 'Laske eri kemialliset aineet, älä kaavan alkuaineita. Luokittele näytteet koostumuksen perusteella.' : 'Vertaa kahta aluehavaintoa ja erillisiä faaseja. Luokittele molemmat seokset.',
  'Puhdas yhdiste voi sisältää useita alkuaineita. Kirkkaus ei ratkaise puhtautta. Tasakoosteisessa liuoksessa on yksi faasi; emulsiossa on pisaroiden rajapintoja.',
  pure ? 'Puhdas aine sisältää yhtä kemiallista ainetta. Seos sisältää useampaa, vaikka se olisi kirkas.' : 'Erilliset faasit tekevät emulsiosta sekakoosteisen, vaikka pienet pisarat olisivat tasaisesti jakautuneet.');
}
function dissolve(r: Rng, skill: 'solubility' | 'waterfat' | 'solution', variant: Variant) {
  const dose = r.int(3, 12) * 100, solventMg = r.int(5, 14) * 1000, capacity = r.int(1, 6) * 100;
  const solute = variant === 'transfer' ? 'Nimetty malliaine B' : skill === 'waterfat' ? 'Nimetty malliaine A' : 'Sakkaroosi';
  const first = variant === 'transfer' && skill === 'solution' ? 'Etanoli' : 'Vesi';
  const second = skill === 'waterfat' ? 'Annettu mallirasva' : skill === 'solution' || variant === 'contrast' ? first : 'Annettu malliliuotin';
  const capA = skill === 'solution' ? dose + 100 : variant === 'contrast' ? capacity : dose + 100;
  const capB = skill === 'solution' ? dose + 200 : variant === 'contrast' ? dose + 200 : capacity;
  return item(r, { mode: 'dissolve', skill, trials: [
    { id: 'a', label: 'Koe A', solvent: first, solute, solventMg, doseMg: dose, capacityMg: capA, temperatureC: 20 },
    { id: 'b', label: 'Koe B', solvent: second, solute, solventMg, doseMg: skill === 'solution' && variant === 'contrast' ? dose + 100 : dose, capacityMg: capB, temperatureC: skill === 'solubility' && variant === 'contrast' ? 35 : 20 },
  ], setting: 'Suljetut nimetyt virtuaalinäytteet. Kapasiteetti tarkoittaa enimmäismäärää juuri annetussa liuotinmäärässä ja lämpötilassa; luvut ovat opetusmallin ehtoja, eivät aineiden taulukkoarvoja. Sekoita ja odota mallin tasapainoa.',
  ...(skill === 'solution' ? { review: review('Selitä, mitä liuennut aine ja liuotin ovat tässä kokeessa ja missä liuennut aine nyt on.',
    'Nimeää molemmat aineet, kertoo liuoksen tasakoosteisuudesta ja säilyvästä liuenneen aineen massasta. Liukeneminen ei ole tuhoutumista.',
    `${solute} on liuennut aine ja ${first} kokeen A liuotin. Molemmat ovat edelleen liuoksessa; malliaineen massa ei katoa kirkkaudesta huolimatta.`) } : {}) },
  'Tuota liukenevan ja jäljelle jäävän aineen massat molempiin kokeisiin. Lukitse ennuste ja sekoita erikseen kumpikin näyte.',
  'Liuennut määrä on enintään annettu kapasiteetti ja enintään lisätty määrä. Ylijäämä jää näkyvään jäännökseen. Sama aine voi käyttäytyä eri liuottimissa eri tavoin.',
  'Liuenneen ja liukenemattoman aineen massat summautuvat lisättyyn massaan. Näistä oloista ei päätellä aineen vaarallisuutta.');
}
function station(r: Rng, id: string, method: SeparationMethod, variant: Variant): SeparationStation {
  const multiplier = r.int(2, 12), liquid = multiplier * 1000, solid = r.int(2, 12) * 100;
  const solute = r.int(1, 8) * 100;
  const initial = { id, label: `Piste ${id.toUpperCase()}`, parcels: [
    { id: `${id}:water`, root: `${id}:water`, substance: variant === 'transfer' ? 'Nimetty haihtuva liuotin B' : 'Vesi', massMg: liquid, phase: 'liquid' as const, zone: 'bulk' as const, volatile: true },
    ...(method !== 'evaporate' || variant === 'contrast' ? [{ id: `${id}:grain`, root: `${id}:grain`, substance: variant === 'transfer' ? 'Liukenematon kivirouhe' : 'Hiekka', massMg: solid,
      phase: 'solid' as const, zone: method === 'decant' ? 'bottom' as const : 'bulk' as const, grainUm: variant === 'contrast' ? 30 : 80 }] : []),
    ...((method === 'decant' && variant === 'build') ? [] : [{ id: `${id}:sugar`, root: `${id}:sugar`, substance: variant === 'transfer' ? 'Nimetty haihtumaton aine B' : 'Sakkaroosi', massMg: solute,
      phase: 'solution' as const, zone: 'dissolved' as const, volatile: false }]),
  ] };
  const targetRoot = method === 'evaporate' ? `${id}:sugar` : method === 'decant' || variant !== 'build' ? `${id}:water` : `${id}:grain`;
  return { id, label: initial.label, method, initial, poreUm: 20, targetRoot,
    targetBin: method === 'evaporate' || targetRoot.endsWith('grain') ? 'residue' : 'output', settled: method === 'decant' };
}
function separate(r: Rng, skill: 'plan' | 'decant' | 'evaporate' | 'integrate', variant: Variant) {
  const methods: SeparationMethod[] = skill === 'integrate' ? r.shuffle(['filter', 'evaporate', 'decant']) : [skill === 'plan' ? variant === 'contrast' ? 'evaporate' : 'filter' : skill];
  return item(r, { mode: 'separate', skill, stations: methods.map((method, i) => station(r, String.fromCharCode(97 + i), method, variant)),
    setting: 'Virtuaalinen talteenotto. Suodatus siirtää nesteen ja liuenneen aineen suodokseen. Dekantointi siirtää 3/4 laskeutuneen näytteen nestekerroksesta, loput jäävät sakkaan. Haihdutuksessa vain ilmoitettu haihtuva liuotin siirtyy ympäristön kaasuastiaan, muu aine säilyy jäännöksenä. Ei juomakelpoisuus- tai puhtauslupausta.',
    ...(skill === 'integrate' ? { review: review('Selitä jokaisen kolmen työpisteen menetelmä, mihin aineet menivät ja miksi eri menetelmä tarvittiin.',
      'Selittää suodattimen raekokorajan ja liuenneen aineen läpipääsyn, dekantoinnin laskeuman ja osittaisuuden sekä haihdutuksen liuottimen kaasuastiaan ja ei-haihtuvan aineen jäännökseen. Liittää kaikki kolme omiin ennusteisiin ja havaintoihin.',
      'Suodatus käyttää hiukkaskokoa. Dekantointi kaataa osan laskeuman yläpuolen liuoksesta, ja vähän liuosta jää sakkaan. Haihdutus siirtää haihtuvan liuottimen kaasutilaan ja jättää ei-haihtuvan aineen. Aineiden kokonaismassat säilyvät.') } : {}) },
  'Valitse menetelmä ja ennusta massat. Lukitse suunnitelma ja tee jokaisen pisteen oma erotus.',
  'Seuraa jokaista nimettyä ainetta. Suodatin ei pysäytä liuennutta ainetta. Kaasuastia on osa järjestelmää. Dekantointi jättää myös nestettä sakkaan.',
  'Aine ei katoa käsittelystä. Menetelmä valitaan seoksen ominaisuuksista ja siitä, mikä osa halutaan talteen.');
}
const definitions: Definition[] = [];
function add(id: string, stop: string, goal: string, reward: string, produceWhat: string, tags: readonly [string, string], author: (r: Rng, variant: Variant) => ReturnType<Author>, limit: string) {
  definitions.push({ id, stop, icon: '◌', intro: 'Aava, Loikka ja Sulka tutkivat nimettyjä näytteitä Saariston rantapajassa.', goal, reward, produceWhat,
    families: [[tags[0], r => author(r, 'build')], [tags[1], r => author(r, 'contrast')]], transfer: r => author(r, 'transfer'), limit });
}
const recognized = 'Nimet ja luokitus ovat havaintotiedon tulkintaa. Ei tuntemattoman oikean aineen tunnistamista, todellisen laboratoriotyön tai turvallisuuden sertifiointia.';
const own = 'Oma perustelu arvioidaan erillisellä aikuisrubriikilla. Malliselitys ei täytä havaintoa. Puhetta tai omaa tekstiä ei tallenneta.';
add('ENV-CHEM-MATERIAL-ID-01', 'Nimilaput rantapajassa', 'Tunnistat annetut puu-, metalli- ja lasinäytteet useista ominaisuuksista.', 'Nimilaput löytävät paikkansa.', 'näytteiden materiaaliluokat', ['identify-across-shapes', 'identify-same-shape-different-properties'], (r, v) => materials(r, 'identify', v), recognized);
add('ENV-CHEM-MATERIAL-COMPARE-01', 'Katoksen materiaalikoe', 'Vertaat samaa ominaisuutta ja perustelet tarkoitukseen sopivan valinnan.', 'Näytekori saa perustellun katoksen.', 'oman havaintoeron, materiaalivalinnan ja perustelun', ['compare-absorption-for-cover', 'compare-deflection-for-fastener'], (r, v) => materials(r, 'compare', v), own);
add('ENV-CHEM-MATERIAL-01', 'Retkikotelo sulkeutuu', 'Tunnistat, vertaat ja valitset samassa uudessa tilanteessa.', 'Retkikotelo sulkeutuu.', 'erillisen yhdistetyn materiaalinäytön', ['identify-and-choose-cover', 'identify-and-choose-flexible-fastener'], (r, v) => materials(r, 'integrate', v), `Oma integraationäyttö. Atomisten solmujen historia ei täyty tästä. ${own}`);
add('ENV-CHEM-PROP-01', 'Ominaisuus vai mieltymys?', 'Erotat havaittavan ominaisuuden omasta mieltymyksestä.', 'Näyttelykortti saa täsmällisen merkin.', 'ominaisuuksien luokitukset', ['classify-measured-properties', 'construct-matched-deflection-comparison-and-separate-opinion'], (r, v) => materials(r, 'property', v), recognized);
add('ENV-CHEM-STATE-01', 'Olomuotohylly', 'Tunnistat olomuodon muodon ja tilavuuden käyttäytymisestä.', 'Myös näkymätön kaasu saa oman paikan.', 'kolmen astianvaihtokokeen luokitukset', ['reshape-and-classify', 'predict-and-observe-compression-in-three-states'], state, 'Idealisoidut nimetyt näytteet, ei yksittäisten molekyylien laskentaa. Näkyvä sumu erotetaan kaasusta.');
add('ENV-CHEM-STATECHANGE-01', 'Pisara palaa lasille', 'Nimeät veden alku- ja loppuolomuodon ja muutoksen.', 'Aavan vesimerkki palaa pisaraan.', 'muutosnimet ja säilyvän massan ennusteen', ['predict-melting-or-ambient-evaporation', 'predict-condensation-on-cold-surface'], phase, 'Suljettu opetusmalli tavallisessa ilmanpaineessa. Ei lämmitysohjetta. Haihtuminen voi tapahtua kiehumatta.');
add('CHEM79-SUBSTANCE-01', 'Pajaluettelon kolme tasoa', 'Erotat esineen, materiaalin ja kemiallisen aineen ja liität ne samaan kohteeseen.', 'Loikka löytää varaosan oikealla nimellä.', 'kolmen tason luokituksen ja oman selityksen', ['wood-object-material-constituent', 'steel-or-textile-object-material-constituent'], levels, own);
add('CHEM79-PURE-MIX', 'Koostumuksen nimilaput', 'Erotat yhden kemiallisen aineen seoksesta.', 'Näytekaapin koostumuskortit valmistuvat.', 'aineiden lukumäärät ja näyteluokat', ['compound-can-be-pure', 'elemental-purity-versus-mixture'], (r, v) => composition(r, true, v), `${recognized} Molekyylin eri alkuaineet eivät tee siitä seosta.`);
add('CHEM79-MIX-HOM', 'Läpileikkaus Kristallilahteen', 'Erotat liuoksen ja erillisiä faaseja sisältävän seoksen.', 'Läpileikkaus paljastaa koostumuksen.', 'aluevertailun pohjalta luokitukset', ['compare-separated-layers-and-solution', 'detect-dispersed-phases-despite-equal-regional-counts'], (r, v) => composition(r, false, v), 'Emulsio pysyy sekakoosteisena tasaisesta pisarajakaumasta huolimatta. Alueiden merkit ovat osuuksia, eivät yksittäisiä molekyylejä.');
add('CHEM79-SOLUBILITY', 'Liuottimen nimikortti', 'Seuraat liukoisuutta annetussa liuottimessa ja lämpötilassa.', 'Liukoisuuskortti nimeää liuottimen.', 'kahden kokeen liuenneet ja jäännösmassat', ['compare-solvents-at-fixed-dose', 'compare-stated-temperature-capacities'], (r, v) => dissolve(r, 'solubility', v), 'Annetut mallikapasiteetit eivät ole aineiden mitattuja taulukkoarvoja. Ei yleistä väitettä lämpötilariippuvuuden suunnasta.');
add('CHEM79-WATERFAT-SOL', 'Kahden liuottimen arvoitus', 'Vertaat annetun aineen liukenemista veteen ja mallirasvaan.', 'Aava avaa faasien läpileikkauksen.', 'molempien liuottimien massaennusteet ja vertailun', ['water-favoured-distribution', 'fat-favoured-distribution'], (r, v) => dissolve(r, 'waterfat', v), 'Vertailu koskee nimettyä ainetta ja annettua rasvaa näissä oloissa. Liukoisuus ei todista vaarallisuutta.');
add('CHEM79-SOLUTION', 'Kadonneen kiteen arvoitus', 'Nimeät liuenneen aineen ja liuottimen sekä selität liuoksen säilyvän aineen.', 'Kiteen aine löytyy liuoksen mallista.', 'omat massat, liuotinroolit ja selityksen', ['construct-solution-from-named-components', 'compare-two-solutions-with-retained-solute'], (r, v) => dissolve(r, 'solution', v), own);
add('CHEM79-SEPARATE-01', 'Talteenottosuunnitelma', 'Valitset menetelmän ominaisuuksista ja tavoitellusta osasta.', 'Näytteelle löytyy talteenottosuunnitelma.', 'oman menetelmän, massaennusteet ja toteutuksen', ['plan-grain-size-separation', 'plan-volatility-separation'], (r, v) => separate(r, 'plan', v), 'Rajattu kahden menetelmän suunnitteluperhe ja muuttunut tavoite. Aiemman FILTRATION-solmun näyttö säilyy erillisenä.');
add('CHEM79-EVAPORATION', 'Kiteen alkuperä', 'Erotat haihtuvan liuottimen ei-haihtuvasta jäännöksestä.', 'Kiteet saavat alkuperälapun.', 'jäännöksen ja kaasuastian massat', ['predict-residue-and-vapour', 'contrast-dose-and-solvent-amount'], (r, v) => separate(r, 'evaporate', v), 'Tämän näytteen liuotin on ilmoitettu haihtuvaksi ja liuennut aine haihtumattomaksi näissä oloissa. Kaasu säilyy mallin ympäristöastiassa.');
add('CHEM79-DECANTING', 'Rauhassa laskeutunut näyte', 'Ennustat kaadettavan liuoksen ja pohjalle jäävän osan.', 'Yläosa saadaan omaan astiaansa.', 'osittaisen kaadon molempien osien massat', ['decant-settled-suspension', 'track-dissolved-material-in-both-parts'], (r, v) => separate(r, 'decant', v), 'Valmiiksi laskeutunut näyte valitaan sekoitetun vertailun sijasta. Malli kaataa täsmälleen 3/4 liuoksesta ja jättää 1/4 sakkaan. Ei täydellisen puhtauden väitettä.');
add('CHEM79-SEPARATE-02', 'Kolme talteenottopöytää', 'Suunnittelet ja teet kolme erotusta ja selität menetelmien erot.', 'Hiekka, kiteet ja yläkerros saavat omat selityksensä.', 'kolme erillistä toteutusta ja oman yhteisen selityksen', ['coordinate-grain-volatility-and-settling', 'compare-three-methods-with-new-loads'], (r, v) => separate(r, 'integrate', v), `Oma integraationäyttö kaikista kolmesta menetelmästä, ei atomisten solmujen korvaus. ${own}`);

type MixtureSpec = Omit<NodeSpec, 'item'> & { item(r: Rng, phase: Phase): MixtureItem };
export const materialsMixturesSpecs: MixtureSpec[] = definitions.map(def => {
  const { families, transfer, limit: _limit, ...meta } = def;
  const rev = `exp690-materials-mixtures-${def.id.toLowerCase()}-v1`;
  return { ...meta, rev, validRevs: [rev], produce: [...families.map(([tag]) => tag), 'transfer'],
    demo(r) { return families.map(([, author]) => { const example = author(r); return { say: example.explain!, scene: materialsMixturesExample(example.task) }; }); },
    item(r, phase) { const [tag, author] = phase === 'transfer' ? ['transfer', transfer] as const : r.pick(families); return { ...author(r), tag }; },
  };
});
export const materialsMixturesEvidence: Readonly<Record<string, { families: readonly string[]; limit: string }>> =
  Object.fromEntries(definitions.map(({ id, families, limit }) => [id, { families: families.map(([tag]) => tag), limit }]));
