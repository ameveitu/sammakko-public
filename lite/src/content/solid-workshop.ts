import type { Rng } from '../engine/rng';
import type { Item, NodeSpec } from '../engine/types';
import { cases } from './kit';
import {
  circularMarks, cone, cylinder, flat, partAt, polygonBase, prism, pyramid, rectangleBase, solidClass, solidMemberships, triangleBase,
  type Geometry, type SolidFigure, type SolidMark, type SolidPart, type SolidPose, type SolidWorkshopQuestion, type SolidWorkshopScene, type SolidWorkshopTask,
} from './models/solid-workshop';
import { solidWorkshopPaint } from './scenes/solid-workshop';

type Draft = Omit<Item, 'tag' | 'task'> & { sceneModel: SolidWorkshopScene; task: SolidWorkshopTask };
type Family = (r: Rng) => Draft;
type Choice = { id: string; label: string };
interface Definition extends Omit<NodeSpec, 'item' | 'demo' | 'rev' | 'validRevs'> {
  families: Record<string, Family>; transfer: (r: Rng) => Draft; limit: string;
}
function define({ families, transfer, limit, ...info }: Definition) {
  const tags = Object.keys(families);
  const rev = `exp690-solid-${info.id.toLowerCase()}-v1`;
  const spec = {
    ...info, rev, validRevs: [rev], item: cases(families, transfer),
    demo: r => tags.map(tag => {
      const example = families[tag]!(r);
      return { say: example.explain!, scene: solidWorkshopPaint(example.sceneModel, example.task.definitions, example.explain), sceneModel: example.sceneModel };
    }),
  } satisfies NodeSpec;
  return { spec, evidence: { families: tags, limit } };
}

const names = {
  figure: 'tasokuvio', solid: 'kappale', column: 'lieriö', pointed: 'kartio', other: 'muu kappale',
  prism: 'särmiö', box: 'suorakulmainen särmiö', cube: 'kuutio', pyramid: 'pyramidi',
  cylinder: 'ympyrälieriö', cone: 'ympyräpohjainen kartio', sphere: 'pallo',
};
const choices = (labels: Record<string, string>): Choice[] => Object.entries(labels).map(([id, label]) => ({ id, label }));
const chooseFigures = (cards: readonly SolidFigure[]): Choice[] => cards.map(({ id }) => ({ id, label: id }));
const query = (id: string, label: string, options: Choice[], answer: string | string[], why: string): SolidWorkshopQuestion => ({
  id, label, options, answer: typeof answer === 'string' ? [answer] : answer, why, many: typeof answer !== 'string',
});
const basicRule = 'Tasokuvio on tasossa. Kappaleella on kolme ulottuvuutta: pituus, leveys ja syvyys.';
const familyRule = 'Lieriön kaksi samanmuotoista ja samankokoista pohjaa ovat yhdensuuntaiset. Vastaavat kohdat yhdistyvät suorilla samansuuntaisilla janoilla. Kartion pohjan reuna yhdistyy yhteiseen kärkeen. Pohja voi olla ympyrä tai monikulmio.';
const boundaryLimit = 'Valinnat osoittavat luokittelua ja annetun rajatapauksen tunnistamista. Oppijan oma perustelu arvioidaan erikseen.';
const partLimit = 'Vastaus osoittaa annettujen pintojen ja pisteiden tunnistamista kahdesta näkymästä. Oma selitys arvioidaan erikseen. Kuvakulma ei vaikuta arviointiin.';

const disk = (radius = 3): Geometry => ({ kind: 'disk', radius });
const ball = (radius = 3): Geometry => ({ kind: 'sphere', radius });
const sheet = (base = rectangleBase(6, 4)): Geometry => ({ kind: 'flat-polygon', base });
const poses: readonly SolidPose[] = ['upright', 'tilted', 'horizontal'];
function geometryMarks(geometry: Geometry, ids: string[]): SolidMark[] {
  if (geometry.kind === 'cone' || geometry.kind === 'cylinder') return circularMarks(geometry, ids);
  if (geometry.kind !== 'prism' && geometry.kind !== 'pyramid') return [];
  const { height, base } = geometry;
  const [a, b] = base;
  const edge = [(a![0] + b![0]) / 2, (a![1] + b![1]) / 2];
  const mantleFactor = geometry.kind === 'pyramid' ? .5 : 1;
  return [
    { id: ids[0]!, position: [0, -height / 2, 0] },
    { id: ids[1]!, position: [0, height / 2, 0] },
    { id: ids[2]!, position: [edge[0]! * mantleFactor, 0, edge[1]! * mantleFactor] },
  ];
}
function figures(r: Rng, geometries: Geometry[], transfer = false, marked = false): SolidFigure[] {
  return r.shuffle(geometries).map((geometry, i) => ({
    id: String(i + 1), geometry,
    pose: transfer ? 'horizontal' : r.pick(poses),
    ...(marked ? { marks: geometryMarks(geometry, r.shuffle(['A', 'B', 'C'])) } : {}),
  }));
}
function draft(figs: SolidFigure[], questions: SolidWorkshopQuestion[], say: string, hint: string, explain: string, definitions?: string): Draft {
  const sceneModel: SolidWorkshopScene = { kind: 'solid-workshop', title: 'Majakan mittapöytä', figures: figs, view: 'angled' };
  return { task: { kind: 'solid-workshop', scene: sceneModel, questions, definitions }, say, hint, explain, sceneModel,
    scene: solidWorkshopPaint(sceneModel, definitions) };
}

function bodyQuestion(r: Rng, polygon: boolean, transfer = false): Draft {
  const prismBody = transfer ? prism(polygonBase(), 3) : prism(triangleBase(), 6);
  const cylBody = transfer ? cylinder(4, 2) : cylinder(3, 5);
  const cards = figures(r, polygon ? [prismBody, sheet('base' in prismBody ? [...prismBody.base] : triangleBase()), pyramid(triangleBase(), 6)]
    : [cylBody, disk(transfer ? 4 : 3), ball(transfer ? 4 : 3)], transfer);
  const answer = cards.find(figure => figure.geometry.kind === (polygon ? 'prism' : 'cylinder'))!;
  return draft(cards, [
    query('solid', polygon ? 'Särmiö' : 'Ympyrälieriö', chooseFigures(cards), answer.id,
      'Tarkista molemmat piirrokset. Tarvitaan kaksi samanmuotoista pohjaa ja syvyys.'),
    query('observation', 'Havainto valitusta kappaleesta', choices({ double: 'kaksi samanmuotoista päätyä', sheet: 'yksi tasokuvio', apex: 'yksi kärki' }),
      'double', 'Yhden näkyvän päädyn lisäksi tarkista sivukuvasta toinen pääty.'),
  ], polygon ? 'Mikä kappale on särmiö? Merkitse valinta ja sitä tukeva havainto.'
    : 'Yhdestä suunnasta näkyy pyöreä siluetti. Mikä kappale on ympyrälieriö? Merkitse valinta ja havainto.',
  'Päätykuva näyttää pohjan muodon. Katso sivukuvasta, kuinka pitkälle muoto jatkuu.',
  `Kappale ${answer.id} jatkuu syvyyssuunnassa ja sillä on kaksi samanmuotoista päätyä. Yhden siluetin perusteella nämä kuviot voivat näyttää samanlaisilta.`, basicRule);
}
const body = define({
  id: 'M-GEO-05', stop: 'Majakan rakennusosa', icon: '🧱',
  intro: 'Aava nostaa majakan rakennusosan pöydälle. Yhden suunnan siluetti näyttää samalta kuin varastossa oleva levy.',
  goal: 'Opit tunnistamaan kappaleen ja erottamaan sen tasomaisesta siluetista.',
  reward: 'Oikea rakennusosa saa paikkansa majakan varastossa.',
  families: { 'body-round-silhouette': r => bodyQuestion(r, false), 'body-polygon-silhouette': r => bodyQuestion(r, true) },
  transfer: r => bodyQuestion(r, r.chance(.5), true), limit: boundaryLimit,
});

function familyQuestion(r: Rng, pointed: boolean, transfer = false): Draft {
  const models = transfer ? [prism(polygonBase(), 2), pyramid(triangleBase(), 9), ball(3)]
    : pointed ? [pyramid(rectangleBase(5, 5), 6), cone(3, 5), ball(3)]
      : [prism(triangleBase(), 5), cylinder(2, 7), pyramid(rectangleBase(6, 4), 5)];
  const cards = figures(r, models, transfer);
  const labels = choices({ column: names.column, pointed: names.pointed, other: names.other });
  return draft(cards, cards.map(({ id, geometry }) => query(`class-${id}`, `Kappale ${id}`, labels, solidClass(geometry),
    'Tutki, onko kaksi samanlaista pohjaa vai yksi pohja ja yhteinen kärki. Pohjan ei tarvitse olla pyöreä.')),
  'Lajittele jokainen kappale lieriöksi, kartioksi tai muuksi kappaleeksi.',
  'Vertaa pääty- ja sivukuvaa. Sama pohjamuoto voi jatkua toiseen pohjaan tai kaventua yhteiseen kärkeen.',
  cards.map(({ id, geometry }) => `${id}: ${names[solidClass(geometry)]}.`).join(' ') + ' Särmiö on lieriö ja pyramidi on kartio, vaikka niiden pohjat ovat monikulmioita.',
  familyRule);
}
const families = define({
  id: 'M-GEO-14', stop: 'Pohjien salaisuus', icon: '🔍',
  intro: 'Loikka arvelee, että lieriöt ja kartiot ovat aina pyöreitä. Aava ottaa mukaan särmiön ja pyramidin.',
  goal: 'Opit luokittelemaan lieriöt, kartiot ja muut kappaleet pohjien ja vaipan rakenteesta.',
  reward: 'Kappalehyllyt järjestyvät rakenteen mukaan.',
  families: { 'solid-family-two-bases': r => familyQuestion(r, false), 'solid-family-pointed': r => familyQuestion(r, true) },
  transfer: r => familyQuestion(r, true, true), limit: boundaryLimit,
});

function shelfQuestion(r: Rng, nested: boolean, transfer = false): Draft {
  if (!nested) {
    const cards = figures(r, [cylinder(2, 7), prism(triangleBase(), 5), cone(3, 5)], transfer);
    const sameBases = cards.filter(({ geometry }) => solidClass(geometry) === 'column').map(({ id }) => id);
    const curved = cards.filter(({ geometry }) => geometry.kind === 'cone' || geometry.kind === 'cylinder').map(({ id }) => id);
    return draft(cards, [
      query('bases', 'Kaksi samanlaista, yhdensuuntaista pohjaa', chooseFigures(cards), sameBases,
        'Etsi kappaleet, joiden samanlaiset pohjat ovat eri päissä.'),
      query('curve', 'Kaareva vaippa', chooseFigures(cards), curved, 'Kaareva vaippa kiertää ympyräpohjaa. Särmiön sivutahkot ovat tasaisia.'),
    ], 'Merkitse kappaleet molempiin hyllyryhmiin. Sama kappale voi kuulua kumpaankin.',
    'Tutki pohjia ja vaippaa erikseen. Kaksi pohjaa ja kaareva vaippa voivat olla samassa kappaleessa.',
    'Ympyrälieriö kuuluu kumpaankin ryhmään. Särmiöllä on kaksi pohjaa, kartiolla kaareva vaippa.');
  }
  const d = r.int(3, 4);
  const cards = figures(r, [prism(rectangleBase(d, d), d), prism(rectangleBase(6, 3), 3), transfer ? prism(polygonBase(), 2) : pyramid(rectangleBase(6, 3), 5)], transfer);
  const groups = transfer ? ['box', 'column'] : ['cube', 'box'];
  return draft(cards, groups.map(group => query(group, names[group as 'cube' | 'box' | 'column'], chooseFigures(cards),
    cards.filter(({ geometry }) => solidMemberships(geometry).includes(group)).map(({ id }) => id),
    'Tarkista sivutahkojen muodot ja kappaleen mitat. Käännetyn kappaleen luokka säilyy.')),
  'Valitse jokaiseen ryhmään kaikki ehdon toteuttavat kappaleet.',
  'Kuutiossa jokainen tahko on samanlainen neliö. Suorakulmaisessa särmiössä kaikki tahkot ovat suorakulmioita. Katso molemmat kuvat.',
  'Kuutio on myös suorakulmainen särmiö, ja kaikki suorakulmaiset särmiöt kuuluvat lieriöihin.',
  'Suorakulmaisen särmiön tahkot ovat suorakulmioita. Kuutiossa ne ovat kaikki yhtä suuria neliöitä. Molemmat kuuluvat lieriöihin.');
}
const shelf = define({
  id: 'M-GEO-3D-CLASSIFY', stop: 'Rakentajien kappalehyllyt', icon: '🗃️',
  intro: 'Varastossa on samanvärisiä osia eri käyttötarkoituksiin. Aava kiinnittää hyllyihin niiden geometriset tuntomerkit.',
  goal: 'Opit ryhmittelemään kappaleita ominaisuuksien perusteella ja havaitsemaan päällekkäisiä luokkia.',
  reward: 'Majakan osat löytyvät nyt myös silloin, kun ne ovat käännettyinä.',
  families: { 'shelf-bases-versus-mantle': r => shelfQuestion(r, false), 'shelf-nested-cube-box': r => shelfQuestion(r, true) },
  transfer: r => shelfQuestion(r, true, true), limit: boundaryLimit,
});

function mixedQuestion(r: Rng, angular: boolean, transfer = false): Draft {
  const cards = figures(r, angular
    ? [sheet(rectangleBase(transfer ? 7 : 5, 3)), prism(rectangleBase(transfer ? 7 : 5, 3), transfer ? 2 : 6), pyramid(triangleBase(), 5)]
    : [disk(3), cylinder(3, 5), ball(3)], transfer);
  const plane = cards.find(({ geometry }) => flat(geometry))!;
  const body = cards.find(({ geometry }) => geometry.kind === (angular ? 'prism' : 'cylinder'))!;
  const all = chooseFigures(cards);
  return draft(cards, [
    query('flat', 'Tasokuviot', all, cards.filter(({ geometry }) => flat(geometry)).map(({ id }) => id), 'Sivusta tasokuvio näkyy reunaviivana.'),
    query('solids', 'Kappaleet', all, cards.filter(({ geometry }) => !flat(geometry)).map(({ id }) => id), 'Tutki, mitkä mallit jatkuvat syvyyssuunnassa.'),
    query('why-flat', `Ratkaiseva havainto mallista ${plane.id}`, choices({ line: 'sivusta näkyy vain reunaviiva', use: 'se näyttää tutulta', round: 'sillä on syvyyttä' }),
      'line', 'Vertaa saman mallin kahta näkymää. Tasokuvion reuna näkyy sivulta viivana.'),
    query('why-solid', `Ratkaiseva havainto mallista ${body.id}`, choices({ depth: 'sillä on myös syvyyttä', face: 'vain yhden päädyn muoto ratkaisee', hue: 'väri määrää luokan' }),
      'depth', 'Samannäköinen pääty voi kuulua tasokuvioon tai kappaleeseen. Kappale jatkuu päädyn takana.'),
  ], 'Lajittele mallit kahteen hyllyyn. Merkitse kummastakin ryhmästä pyydetyn mallin ratkaiseva havainto.',
  'Vertaa samannäköisiä päätykuvia sivulta. Onko mallilla tasosta ulottuvaa pituutta?',
  `Mallin ${plane.id} sivukuva on reunaviiva. Mallin ${body.id} päätyjen välissä on syvyyttä, joten se on kappale.`);
}
const mixed = define({
  id: 'M-GEO-09', stop: 'Kaksi hyllyjärjestelmää', icon: '🪧',
  intro: 'Majakan varastoon on tuotu tasokuvioita ja niiden näköisiä kappaleita. Aava pyytää Loikkaa tutkimaan molemmat näkymät.',
  goal: 'Opit luokittelemaan tasokuvioita ja kappaleita yhdessä sekä käyttämään kummallekin sopivaa sääntöä.',
  reward: 'Kaksi hyllyä saavat omat, selkeät lajitteluperusteensa.',
  families: { 'mixed-round-silhouettes': r => mixedQuestion(r, false), 'mixed-angular-silhouettes': r => mixedQuestion(r, true) },
  transfer: r => mixedQuestion(r, r.chance(.5), true),
  limit: 'Sama vastaus sisältää molemmat luokittelut ja kaksi annettuihin näkymiin sidottua havaintoa. Oma vapaamuotoinen perustelu arvioidaan erikseen.',
});

type RoundKind = 'cone' | 'cylinder';
function roundShape(kind: RoundKind, low: boolean) {
  return kind === 'cone' ? cone(low ? 4 : 2, low ? 2 : 7) : cylinder(low ? 4 : 2, low ? 2 : 7);
}

function roundCandidates(kind: RoundKind, sameFamily: boolean, low: boolean): Geometry[] {
  const target = roundShape(kind, low);
  if (kind === 'cone') return sameFamily
    ? [target, pyramid(rectangleBase(6, 5), 5), pyramid(triangleBase(), 5)]
    : [target, cylinder(3, 5), prism(rectangleBase(5, 3), 5)];
  return sameFamily
    ? [target, prism(triangleBase(), 5), prism(rectangleBase(6, 3), 5)]
    : [target, cone(3, 5), pyramid(rectangleBase(5, 4), 5)];
}

function roundIdQuestion(r: Rng, kind: RoundKind, sameFamily: boolean, transfer = false): Draft {
  const cards = figures(r, roundCandidates(kind, sameFamily, transfer), transfer);
  const chosen = cards.find(({ geometry }) => geometry.kind === kind)!;
  const coneTask = kind === 'cone';
  return draft(cards, [
    query('figure', coneTask ? 'Ympyräpohjainen kartio' : 'Ympyrälieriö', chooseFigures(cards), chosen.id,
      'Tarkista pohjan muoto päätykuvasta. Sivukuva näyttää, kapeneeko vaippa vai jatkuuko se toiseen pohjaan.'),
    sameFamily ? query('reason', 'Pohjan muoto', choices({ circular: 'ympyrä', polygon: 'monikulmio', pointed: 'kärki' }),
      'circular', 'Pohja on tasainen alue. Tarkista sen reuna päätykuvasta.')
      : query('reason', 'Valitun kappaleen sivukuva', choices({ pointed: 'kapenee yhteen kärkeen', column: 'sama leveys päädystä päätyyn', ball: 'pyöristyy molemmissa päissä' }),
        coneTask ? 'pointed' : 'column', 'Päädyn pyöreys ei yksin riitä. Tarkista, miten leveys muuttuu päädystä toiseen.'),
  ], coneTask ? 'Etsi ympyräpohjainen kartio ja merkitse pyydetty havainto.'
    : 'Etsi ympyrälieriö ja merkitse pyydetty havainto.',
  sameFamily ? 'Sivukuvat voivat muistuttaa toisiaan. Vertaa pohjien reunoja päätykuvissa.'
    : 'Vertaile, jatkuuko kappale samalla leveydellä vai kapeneeko se kärkeen.',
  coneTask ? `Kappale ${chosen.id} on ympyräpohjainen kartio. Sen yksi pohja on ympyrä ja vaippa kapenee kärkeen.`
    : `Kappale ${chosen.id} on ympyrälieriö. Sen molemmat samankokoiset, yhdensuuntaiset pohjat ovat ympyröitä.`);
}
const coneId = define({
  id: 'M-GEO-CONE-ID', stop: 'Katon pyöreä alusta', icon: '🔺',
  intro: 'Loikka tuo majakan suojaksi kaksi kärjellistä osaa. Aava kääntää ne niin, että myös pohjien muodot näkyvät.',
  goal: 'Opit erottamaan ympyräpohjaisen kartion pyramidista ja lieriöstä.',
  reward: 'Varastosta löytyy pyöreään runkoon sopiva kattoaihio.',
  families: { 'cone-versus-pyramids': r => roundIdQuestion(r, 'cone', true), 'cone-versus-column': r => roundIdQuestion(r, 'cone', false) },
  transfer: r => roundIdQuestion(r, 'cone', r.chance(.5), true), limit: boundaryLimit,
});
const cylinderId = define({
  id: 'M-GEO-CYLINDER-ID', stop: 'Pyöreäpohjainen torni', icon: '🗼',
  intro: 'Aava etsii majakan runkoon lieriön, jonka molemmat päädyt ovat pyöreitä. Kaksi aihiota on asetettu kyljelleen.',
  goal: 'Opit erottamaan ympyrälieriön muista lieriöistä ja ympyräpohjaisesta kartiosta.',
  reward: 'Majakan pyöreälle tornille löytyy rungon aihio.',
  families: { 'cylinder-versus-prisms': r => roundIdQuestion(r, 'cylinder', true), 'cylinder-versus-pointed': r => roundIdQuestion(r, 'cylinder', false) },
  transfer: r => roundIdQuestion(r, 'cylinder', r.chance(.5), true), limit: boundaryLimit,
});

function roundPartsQuestion(r: Rng, kind: RoundKind, surfaces: boolean, integration: boolean, transfer = false): Draft {
  const target = roundShape(kind, transfer || surfaces);
  const cards = figures(r, integration ? [target, ...roundCandidates(kind, surfaces, transfer).slice(1)] : [target], transfer, true);
  const chosen = cards.find(({ geometry }) => geometry.kind === kind)!;
  const coneTask = kind === 'cone';
  const marked = chosen.marks!.map(({ id, position }) => ({ id, part: partAt(chosen.geometry, position) }));
  const code = (part: SolidPart) => marked.find(mark => mark.part === part)!.id;
  const labels = choices({ A: 'A', B: 'B', C: 'C' });
  const questions = [
    ...(integration ? [query('figure', coneTask ? 'Ympyräpohjainen kartio' : 'Ympyrälieriö', chooseFigures(cards), chosen.id,
      'Valitse malli, jonka pohja on ympyrä. Tarkista sivukuvasta myös, onko yksi kärki vai toinen pohja.')] : []),
    coneTask
      ? query('base', 'Pohja', labels, code('base-near'), 'Kartion pohja on kärjen vastainen tasainen ympyräalue.')
      : query('base', 'Molemmat pohjat', labels, [code('base-near'), code('base-far')], 'Etsi kaksi tasopintaa kappaleen eri päistä. Kumpikaan ei ole kaareva vaippa.'),
    ...(coneTask ? [query('apex', 'Kärki', labels, code('apex'), 'Kärki on yksi piste, johon kartion vaippa kapenee.')] : []),
    query('mantle', 'Vaippa', labels, code('mantle'), 'Vaippa kiertää pohjan reunaa. Se on kaareva pinta.'),
    surfaces
      ? query('relation', 'Millaista pintaa vaippa on?', choices({ curved: 'yhtenäinen kaareva pinta', flat: 'joukko tasokolmioita', rim: 'pelkkä ympyräreuna' }),
        'curved', 'Vaippa on pinta. Pelkkä reunaviiva tai sivukuvan siluetti ei kuvaa koko kaarevaa pintaa.')
      : query('relation', 'Mihin vaippa liittyy?', coneTask
        ? choices({ correct: 'pohjan reunaan ja kärkeen', wrong: 'kahteen samanlaiseen pohjaan', rim: 'vain kärkeen' })
        : choices({ correct: 'molempien pohjien reunoihin', wrong: 'yhteen pohjaan ja kärkeen', rim: 'vain toiseen päätyyn' }),
        'correct', 'Seuraa vaippaa sivukuvan koko matkalla. Tarkista, mihin se päättyy kummassakin suunnassa.'),
  ];
  const label = coneTask ? 'ympyräpohjainen kartio' : 'ympyrälieriö';
  const parts = coneTask ? 'pohja, kärki ja vaippa' : 'molemmat pohjat ja vaippa';
  return draft(cards, questions, `${integration ? `Valitse ${label}. Merkitse samasta kappaleesta` : 'Merkitse kuvasta'} ${parts}. Valitse myös vaipan kuvaus.`,
    'Tarkista, mitkä merkinnät ovat päädyissä ja mikä on kyljessä. Sivukuva näyttää vaipan jatkumisen päädystä toiseen.',
    coneTask ? `${chosen.id}: ${code('base-near')} on pohja, ${code('apex')} on kärki ja ${code('mantle')} on kaarevalla vaipalla. Vaippa jatkuu pohjan reunasta kärkeen.`
      : `${chosen.id}: ${code('base-near')} ja ${code('base-far')} ovat samankokoiset ja yhdensuuntaiset ympyräpohjat. ${code('mantle')} on kaareva vaippa, joka yhdistää niiden reunat.`);
}
const coneProperties = define({
  id: 'M-GEO-CONE-PROP', stop: 'Kärki ja kaareva vaippa', icon: '📐',
  intro: 'Aava kiinnittää kartioon kolme merkkiä. Loikka tutkii, mitä kohtia ne osoittavat, kun kappale käännetään.',
  goal: 'Opit osoittamaan ympyräpohjaisen kartion pohjan, kärjen, kaarevan vaipan ja niiden suhteen.',
  reward: 'Katon mittapiirroksessa on jokaiselle osalle oikea merkintä.',
  families: { 'cone-parts-joined-at-apex': r => roundPartsQuestion(r, 'cone', false, false),
    'cone-parts-curved-mantle': r => roundPartsQuestion(r, 'cone', true, false) },
  transfer: r => roundPartsQuestion(r, 'cone', false, false, true), limit: partLimit,
});
const cylinderProperties = define({
  id: 'M-GEO-CYLINDER-PROP', stop: 'Tornin kaksi pohjaa', icon: '⚙️',
  intro: 'Yksi tornin päädyistä jää viistossa kuvassa helposti taakse. Aava näyttää myös sivun ja merkitsee kolme kohtaa.',
  goal: 'Opit osoittamaan ympyrälieriön molemmat pohjat ja kaarevan vaipan.',
  reward: 'Tornin molemmat päädyt löytyvät samasta piirroksesta.',
  families: { 'cylinder-parts-paired-bases': r => roundPartsQuestion(r, 'cylinder', false, false),
    'cylinder-parts-curved-mantle': r => roundPartsQuestion(r, 'cylinder', true, false) },
  transfer: r => roundPartsQuestion(r, 'cylinder', false, false, true), limit: partLimit,
});
const coneIntegration = define({
  id: 'M-GEO-17', stop: 'Majakan kartiokatto', icon: '🏠',
  intro: 'Majakan kattoon tarvitaan ympyräpohjainen kartio. Loikka valitsee aihion ja merkitsee sen osat yhteen piirrokseen.',
  goal: 'Opit valitsemaan ympyräpohjaisen kartion ja osoittamaan siitä määrittävät ominaisuudet.',
  reward: 'Ympyräpohjainen kartiokatto sopii majakan pyöreään runkoon.',
  families: { 'cone-plan-apex-connection': r => roundPartsQuestion(r, 'cone', false, true),
    'cone-plan-round-base-versus-pyramid': r => roundPartsQuestion(r, 'cone', true, true) },
  transfer: r => roundPartsQuestion(r, 'cone', r.chance(.5), true, true),
  limit: 'Valinta, osien osoittaminen ja annettu vaipan kuvaus tarkistetaan samasta kappaleesta ja samasta vastauksesta. Vapaa perustelu arvioidaan erikseen.',
});
const cylinderIntegration = define({
  id: 'M-GEO-16', stop: 'Torni jonka muoto ymmärretään', icon: '🔦',
  intro: 'Aava tarvitsee tornista piirroksen, jossa ovat mukana myös toinen pääty ja vaippa. Loikka valitsee aihion ja merkitsee saman kappaleen osat.',
  goal: 'Opit valitsemaan ympyrälieriön ja osoittamaan samasta kappaleesta sen pohjat ja vaipan.',
  reward: 'Tornin runko ja sen kaksi pyöreää päätyä saavat yhteisen piirustuksen.',
  families: { 'cylinder-plan-mantle-between-bases': r => roundPartsQuestion(r, 'cylinder', false, true),
    'cylinder-plan-round-bases-versus-prisms': r => roundPartsQuestion(r, 'cylinder', true, true) },
  transfer: r => roundPartsQuestion(r, 'cylinder', r.chance(.5), true, true),
  limit: 'Valinta, molemmat pohjat, vaippa ja annettu vaipan kuvaus tarkistetaan samasta kappaleesta. Vapaa perustelu arvioidaan erikseen.',
});

const entries = [body, families, shelf, mixed, coneId, coneProperties, coneIntegration, cylinderId, cylinderProperties, cylinderIntegration];
export const solidWorkshopSpecs: NodeSpec[] = entries.map(({ spec }) => spec);
export const solidWorkshopEvidence: Readonly<Record<string, { families: readonly string[]; limit: string }>> =
  Object.fromEntries(entries.map(({ spec, evidence }) => [spec.id, evidence]));
