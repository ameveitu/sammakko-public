import type { Item, NodeSpec } from '../engine/types';
import type { Rng } from '../engine/rng';
import { cases, txt } from './kit';
import {
  acuteTriangle, concave, equilateral, isPolygon, isoscelesTriangle, obtuseTriangle, oddQuad, parallelogram, path,
  polygonProperties, quadrilateralTypes, rectangle, rightTriangle, square, transform, trapezoid, triangleTypes,
  type BuildShapeTask, type CircleShapeTask, type InspectShapeTask, type NameShapeTask, type PathShape,
  type Point, type SailShapeTask, type Shape, type ShapeChoice, type ShapeFigure, type ShapeQuestion,
} from './models/sail-shapes';
import { sailCardsArt, sailTaskArt } from './scenes/sail-shapes';

type Question = Omit<Item, 'tag'>;
type Generator = (r: Rng) => Question;
type Definition = Omit<NodeSpec, 'item' | 'validRevs' | 'produce'> & {
  rev: string; priorRevs?: string[]; families: Record<string, Generator>; transfer: Generator; limit: string;
};
function definition({ families, transfer, limit, priorRevs = [], ...spec }: Definition) {
  const tags = Object.keys(families);
  return {
    spec: { ...spec, validRevs: [...priorRevs, spec.rev], item: cases(families, transfer),
      ...(spec.produceWhat ? { produce: [...tags, 'transfer'] } : {}) } satisfies NodeSpec,
    evidence: { families: tags, limit },
  };
}
const letter = (i: number) => String.fromCharCode(65 + i);
const figures = (r: Rng, shapes: Shape[]): ShapeFigure[] => r.shuffle(shapes).map((shape, i) => ({ id: letter(i), shape }));
const choices = (labels: Record<string, string>): ShapeChoice[] => Object.entries(labels).map(([id, label]) => ({ id, label }));
const figureChoices = (cards: readonly ShapeFigure[]) => cards.map(({ id }) => ({ id, label: `Kuvio ${id}` }));
const numberChoices = (numbers: number[]) => numbers.map(n => ({ id: String(n), label: String(n) }));
const q = (id: string, label: string, options: ShapeChoice[], answer: string | string[], why: string): ShapeQuestion =>
  ({ id, label, options, answer: typeof answer === 'string' ? [answer] : answer, why, many: typeof answer !== 'string' });
const demo = (task: SailShapeTask, say: string) => ({ say, scene: sailTaskArt(task) });
const angleNames = { acute: 'teräväkulmainen', right: 'suorakulmainen', obtuse: 'tylppäkulmainen' };
const sideNames = { isosceles: 'tasakylkinen', equilateral: 'tasasivuinen', scalene: 'erisivuinen' };
const quadNames = { quadrilateral: 'nelikulmio', trapezoid: 'trapetsi', parallelogram: 'suunnikas', rectangle: 'suorakulmio', square: 'neliö' };
const quadRule = 'Tässä pajassa trapetsilla on vähintään yksi pari yhdensuuntaisia vastakkaisia sivuja.';
const triangleRule = 'Tasakylkisellä on vähintään kaksi yhtä pitkää sivua. Tasasivuisella kaikki kolme ovat yhtä pitkiä. Sivu- ja kulmaluokat kuvaavat eri ominaisuuksia.';
const polygonRule = 'Monikulmion suora reuna muodostaa suljetun kierroksen. Sivuilla ei ole risteyksiä.';
const circleRule = 'Ympyrän jokainen kehäpiste on yhtä kaukana keskipisteestä. Pallo on kappale.';
const markedRule = 'Kärjessä kohtaavat kaksi sivua. Sivu on jana. Kulma muodostuu kärjestä lähtevistä sivuista.';
const selectionLimit = 'Valinnat osoittavat kuvion ominaisuuksien erottamista annetuista vaihtoehdoista. Oma suullinen perustelu arvioidaan erikseen.';

function tilted(r: Rng, shape: PathShape, transfer: boolean) {
  const [a, b] = transfer ? r.pick([[2, 1], [1, -2], [-1, 2]]) : r.pick([[1, 0], [0, 1], [2, -1]]);
  return transform(shape, a!, b!);
}

function buildTask(r: Rng, four: boolean, transfer = false): BuildShapeTask {
  const width = r.int(4, 6), height = r.int(3, 5);
  const reference = four
    ? r.chance(.5) ? path([[0, 0], [width, 0], [width - r.int(1, 2), height], [1, height]])
      : path([[0, 0], [width, 1], [width - 1, height], [1, height - 1]])
    : path([[0, 0], [width, 0], [r.chance(.5) ? 0 : r.int(1, width - 1), height]]);
  const model = four ? transform(reference, 0, 1, height, 0) : reference;
  return { kind: 'sail-shapes', activity: 'build', reference: model, scale: transfer ? 2 : 1, grid: transfer ? 12 : 8 };
}
function buildQuestion(r: Rng, four: boolean, transfer = false): Question {
  return {
    task: buildTask(r, four, transfer),
    say: transfer ? 'Piirrä mallipurje uudelle ruudukolle kaksinkertaisessa koossa. Lisää kärjet järjestyksessä ja sulje kuvio.'
      : four ? 'Aavan nelisivuinen purje on ripustettu sivuttain. Tee saman kokoinen ja muotoinen purje. Sulje kuvio.'
        : 'Rakenna mallipurjeen muotoinen ja kokoinen kuvio. Lisää kärjet järjestyksessä ja sulje kuvio.',
    hint: 'Aloita yhdestä kärjestä. Laske seuraavan kärjen askel vaakaan ja pystyyn. Kierrä reunaa ja yhdistä viimeinen kärki ensimmäiseen.',
    explain: transfer ? 'Kukin askel vaaka- ja pystysuunnassa on kaksinkertainen. Sivuja ja kulmia on yhtä monta ja kulmien koko säilyy.'
      : 'Rakennettu purje seuraa mallin sivuja ja kulmia. Kierroksen lopuksi viimeinen kärki liittyy ensimmäiseen.',
  };
}
const build = definition({
  id: 'M-GEO-06', rev: 'exp690-sail-build-v2', priorRevs: ['exp690-sail-build-v1'], stop: 'Aavan mallipurje', icon: '🍃',
  intro: 'Aava asettaa lehtipurjeen ruudukolle. Loikka tarvitsee siitä uuden purjeen ja merkitsee mallin kärjet yksi kerrallaan.',
  goal: 'Opit rakentamaan mallin mukaisen tasokuvion sivuista ja kärjistä.',
  reward: 'Rakentamasi purje voidaan sovittaa aluksen vaijereihin.',
  produceWhat: 'mallin mukaisen kuvion rakentamista ja sulkemista',
  demo: r => [demo(buildTask(r, false), 'Seuraa mallin reunaa kärki kerrallaan. Sulje kuvio. Samankokoinen purje sopii myös käännettynä.')],
  families: { 'build-triangle-sail': r => buildQuestion(r, false), 'build-four-sided-sail': r => buildQuestion(r, true) },
  transfer: r => buildQuestion(r, r.chance(.5), true),
  limit: 'Oppija rakentaa suljetun kuvion kokonaislukuruudukolle. Tarkistus kattaa kärjet, muodon ja koon. Vapaakätisen piirroksen tarkkuus arvioidaan erikseen.',
});

const curved = () => path([[0, 0], [3, -2], [5, 0], [3, 4]], true, false);
const open = () => path([[0, 0], [5, 1], [2, 5]], false);
function recognition(cards: ShapeFigure[], accepted: (shape: Shape) => boolean, why: (shape: Shape) => string,
  say: string, hint: string, explain: string, transfer: boolean): Question {
  const answer = cards.flatMap(({ shape }, i) => accepted(shape) ? [i] : []);
  return {
    task: { kind: 'multi', options: cards.map(({ id }) => txt(id, false)), cols: cards.length, answer, why: cards.map(({ shape }) => why(shape)) },
    scene: sailCardsArt(cards, transfer ? 'Kuviot on ripustettu uuteen asentoon.' : undefined),
    say, hint, explain: `Oikeat merkinnät: ${answer.map(letter).join(', ')}. ${explain}`,
  };
}
function polygonQuestion(r: Rng, inward: boolean, transfer = false): Question {
  const shapes = inward ? [concave(), oddQuad(), transfer ? open() : curved(), path([[0, 0], [4, 3], [4, 0], [0, 3]])]
    : [acuteTriangle(), rectangle(), open(), curved()];
  const cards = figures(r, shapes.map(s => tilted(r, s, transfer)));
  return recognition(cards, isPolygon, shape => {
    if (isPolygon(shape)) return 'Suorat sivut muodostavat suljetun kierroksen ilman risteyksiä.';
    if (shape.kind === 'path' && !shape.closed) return 'Päät jäävät erilleen. Tämä viiva on avoin.';
    if (shape.kind === 'path' && !shape.straight) return 'Yksi reuna kaartuu. Monikulmion kaikki sivut ovat suoria.';
    return 'Kaksi sivua risteää. Tässä pajassa monikulmion reuna kiertää yhden alueen ilman risteystä.';
  }, 'Valitse kaikki monikulmiot.', 'Kierrä reunaa. Pääsetkö alkuun vain suoria sivuja pitkin? Tarkista, etteivät sivut risteä.', polygonRule, transfer);
}
const polygons = definition({
  id: 'M-GEO-10', rev: 'exp690-polygon-edge-v1', stop: 'Suorat reunat vai kaari?', icon: '🪁',
  intro: 'Kuivatusnarulla on purjeita ja pelkkiä kehyslankoja. Aava seuraa jokaista reunaa aloituspisteestä takaisin alkuun.',
  goal: 'Opit tunnistamaan monikulmion suorasta, suljetusta ja risteämättömästä reunasta.',
  reward: 'Monikulmiot saavat oman paikkansa purjevarastossa.',
  demo: () => [{ say: 'Koveran A:n reuna palaa alkuun suoria sivuja pitkin. B:ssä on kaari ja C:ssä avoin kohta.',
    scene: sailCardsArt([{ id: 'A', shape: concave() }, { id: 'B', shape: curved() }, { id: 'C', shape: open() }]) }],
  families: { 'polygon-open-curve': r => polygonQuestion(r, false), 'polygon-concave-crossed': r => polygonQuestion(r, true) },
  transfer: r => polygonQuestion(r, true, true), limit: selectionLimit,
});

function inspect(task: InspectShapeTask, say: string, hint: string, explain: string): Question {
  return { task, say, hint, explain };
}
const inspection = (cards: readonly ShapeFigure[], questions: ShapeQuestion[], note?: string, markVertices?: boolean): InspectShapeTask =>
  ({ kind: 'sail-shapes', activity: 'inspect', figures: cards, questions, note, markVertices });

function sortTask(r: Rng, equality: boolean, transfer = false): InspectShapeTask {
  const shapes = equality ? [square(), rectangle(), path([[0, 0], [4, 0], [4, 3]])] : [concave(), open(), curved()];
  const pictures: Shape[] = shapes.map(s => tilted(r, s, transfer));
  if (equality && transfer) pictures.push(equilateral(4, 1, -2));
  const cards = figures(r, pictures);
  const primary = cards.filter(({ shape }) => isPolygon(shape) && (!transfer || shape.kind === 'equilateral'
    || (shape.kind === 'path' && polygonProperties(shape).count === 3))).map(({ id }) => id);
  const equalSides = cards.filter(({ shape }) => (shape.kind === 'path' || shape.kind === 'equilateral')
    && isPolygon(shape) && polygonProperties(shape).allEqual).map(({ id }) => id);
  const excluded = cards.find(({ shape }) => equality ? shape.kind === 'path' && !polygonProperties(shape).allEqual
    : shape.kind === 'path' && !isPolygon(shape))!;
  const reason = equality ? 'unequal' : excluded.shape.kind === 'path' && !excluded.shape.closed ? 'open' : 'curved';
  const group = equality ? 'Yhtä pitkien sivujen ryhmä' : 'Monikulmioiden ryhmä';
  return inspection(cards, [
    transfer ? q('triangle', 'Kolme suoraa sivua ja kolme kärkeä', figureChoices(cards), primary,
      'Laske suljetun kuvion sivut ja kärjet. Kolmio kuuluu tähän ryhmään sivunpituuksistaan riippumatta.')
      : q('polygon', 'Monikulmiot', figureChoices(cards), primary, polygonRule),
    ...(equality ? [q('equal', 'Kaikki sivut yhtä pitkiä', figureChoices(cards), equalSides,
      'Katso kaikkia sivuja samasta kuviosta. Kaksi yhtä pitkää sivua ei riitä. Sama kuvio voi kuulua molempiin ryhmiin.')] : []),
    q('boundary', `Miksi ${excluded.id} jää pois? · ${group}`, choices({
      unequal: 'kaikki sivut eivät ole yhtä pitkiä', open: 'reuna on avoin', curved: 'reunassa on kaari', look: 'kuvio on vinossa',
    }), reason, 'Perustele ulkopuolelle jääminen juuri merkityn kuvion ominaisuudella. Vinous ei muuta ryhmää.'),
  ]);
}

function sortQuestion(r: Rng, equality: boolean, transfer = false): Question {
  return inspect(sortTask(r, equality, transfer), equality ? 'Merkitse kuviot kumpaankin ryhmään. Kuvio voi kuulua molempiin. Merkitse lopuksi, miksi osoitettu kuvio jää pois.'
    : 'Merkitse kaikki monikulmiot. Tutki, miksi yksi merkityistä kuvioista jää ryhmän ulkopuolelle.',
    equality ? 'Vertaa sivuja samassa kuviossa. Käännetty kuvio säilyttää sivunpituutensa.' : 'Seuraa reunaa alusta loppuun ja tarkista, palaako suora sivuketju alkuun.',
    equality ? 'Ehtona on kaikkien sivujen yhtäpituus. Kulmien ei tarvitse olla suoria.' : polygonRule);
}
const sorting = definition({
  id: 'M-GEO-2D-CLASSIFY', rev: 'exp690-sail-sort-v1', stop: 'Purjevaraston luokat', icon: '🏷️',
  intro: 'Loikka ehdottaa varastolokeron nimeksi ”pystyssä”. Aava vertaa purjeiden pysyviä ominaisuuksia, jotka kestävät kääntämisen.',
  goal: 'Opit luokittelemaan tasokuvioita annetun ominaisuuden mukaan ja tunnistamaan ryhmän rajan.',
  reward: 'Ominaisuuksiin perustuvat kyltit helpottavat kuvioiden löytämistä.',
  demo: r => [demo(sortTask(r, true), 'Yhtä pitkät sivut voivat kuulua eri näköisiin kuvioihin. Tarkista ryhmän ehto erikseen jokaisesta.')],
  families: { 'sort-edge-closure': r => sortQuestion(r, false), 'sort-side-equality': r => sortQuestion(r, true) },
  transfer: r => sortQuestion(r, true, true), limit: selectionLimit,
});

function namingTask(r: Rng, angle: boolean, transfer = false): NameShapeTask {
  const name = angle ? transfer ? 'tylppä kulma' : r.pick(['suora kulma', 'terävä kulma'] as const) : r.pick(['sivu', 'kärki'] as const);
  const shape = tilted(r, angle ? name === 'tylppä kulma' ? obtuseTriangle() : rightTriangle() : trapezoid(), transfer);
  const index = angle ? polygonProperties(shape).angles.indexOf(name === 'suora kulma' ? 'right' : name === 'tylppä kulma' ? 'obtuse' : 'acute') : 0;
  const parts = r.shuffle([
    { kind: 'vertex' as const, index: angle ? (index + 1) % shape.points.length : 0 },
    { kind: 'side' as const, index: 1 },
    { kind: 'angle' as const, index: angle ? index : 3 },
  ]).map((part, i) => ({ ...part, id: `P${i + 1}` }));
  const target = parts.find(part => part.kind === (angle ? 'angle' : name === 'sivu' ? 'side' : 'vertex'))!.id;
  return { kind: 'sail-shapes', activity: 'name', shape, features: parts, target, name };
}
function namingQuestion(r: Rng, angle: boolean, transfer = false): Question {
  const task = namingTask(r, angle, transfer);
  return { task, say: angle ? 'Valitse korostettu merkintä ja kirjoita kulman tarkka geometrinen nimi.'
    : 'Valitse korostettu merkintä ja kirjoita kuvion osan geometrinen nimi.',
  hint: angle ? 'Vertaa kulman avautumista suorakulmaan. Kulman nimi kertoo, onko se yhtä suuri, pienempi vai suurempi.'
    : 'Etsi, osoittaako merkintä reunajanaa vai pistettä, jossa kaksi sivua kohtaa.',
  explain: `Merkintä ${task.target}: ${task.name}. ${markedRule}` };
}
const naming = definition({
  id: 'M-GEO-2D-PROP-NAME', rev: 'exp690-sail-property-name-v1', stop: 'Kuvion omat sanat', icon: '✏️',
  intro: 'Aava merkitsee purjeen osia. Loikka kirjoittaa viereen niiden geometriset nimet, jotta merkinnät ymmärretään myös toisessa pajassa.',
  goal: 'Opit nimeämään omin sanoin sivun, kärjen ja eri kulmat.',
  reward: 'Nimetyistä osista syntyy luettava purjepiirros.',
  produceWhat: 'korostetun ominaisuuden geometrisen nimen kirjoittamista',
  demo: r => [demo(namingTask(r, false), markedRule), demo(namingTask(r, true), 'Kulmaa verrataan suorakulmaan. Kulma voi olla suora, terävä tai tylppä.')],
  families: { 'name-edge-or-vertex': r => namingQuestion(r, false), 'name-angle-type': r => namingQuestion(r, true) },
  transfer: r => namingQuestion(r, true, true),
  limit: 'Oppija kirjoittaa nimen. Tarkistus tunnistaa yleisiä suomenkielisiä perus- ja taivutusmuotoja. Pidempi selitys ja vapaa geometrinen kuvaus arvioidaan erikseen.',
});

function circleIdQuestion(r: Rng, sphere: boolean, transfer = false): Question {
  const radius = transfer ? 2 : r.int(3, 5);
  const round: Shape = { kind: 'circle', radius, ...(transfer ? { frame: true } : {}) };
  const oval: Shape = { kind: 'ellipse', rx: transfer ? 2 : 6, ry: transfer ? 6 : 3 };
  const cards = figures(r, sphere ? [round, { kind: 'sphere', radius }, tilted(r, square(), transfer)]
    : [round, oval, tilted(r, rectangle(), transfer)]);
  return recognition(cards, s => s.kind === 'circle', s => s.kind === 'circle' ? circleRule
    : s.kind === 'sphere' ? 'Pallolla on syvyyttä. Poikkileikkaus tai varjo voi olla ympyrä.'
    : s.kind === 'ellipse' ? 'Ellipsin keskeltä reunaan on eri matka eri suunnissa.' : 'Tässä kehä muodostuu suorista sivuista.',
  transfer ? 'Valitse vihreä tasokuvio, jonka jokainen kehäpiste on samalla etäisyydellä keskipisteestä.'
    : 'Valitse tasokuvio, jonka jokainen kehäpiste on samalla etäisyydellä keskipisteestä.',
  'Vertaa matkaa keskeltä reunalle eri suunnissa. Kaarevat apuviivat kertovat pallon pinnasta.', circleRule, transfer);
}
const circleId = definition({
  id: 'M-GEO-CIRCLE-ID', rev: 'exp690-sail-circle-id-v1', stop: 'Pyöreä ikkuna on tasokuvio', icon: '🪟',
  intro: 'Aava tarvitsee litteän ikkuna-aukon. Loikka tuo pöydälle myös soikean kehyksen ja pyöreän poijun.',
  goal: 'Opit erottamaan ympyrän ellipsistä ja pallosta.',
  reward: 'Ikkunasuunnitelmaan päätyy ympyrän muotoinen aukko.',
  demo: r => {
    const task = circleIdQuestion(r, true);
    return [{ say: task.explain!, scene: task.scene! }];
  },
  families: { 'circle-versus-ellipse': r => circleIdQuestion(r, false), 'circle-versus-sphere': r => circleIdQuestion(r, true) },
  transfer: r => circleIdQuestion(r, false, true), limit: selectionLimit,
});

function circleTask(r: Rng, diagonal: boolean, joined: boolean, transfer = false): CircleShapeTask {
  const k = transfer ? 2 : 1, radius = 5 * k;
  const right: Point = transfer ? [4 * k, -3 * k] : diagonal ? [3, 4] : [radius, 0];
  const left: Point = [-right[0], -right[1]], upper: Point = [-right[1], right[0]];
  const center: Point = [0, 0], inner: Point = [0, k];
  const points = r.shuffle<Point>([center, right, left, upper, ...(diagonal ? [inner] : [])]).map((at, i) => ({ at, id: letter(i) }));
  const id = (at: Point) => points.find(p => p.at[0] === at[0] && p.at[1] === at[1])!.id;
  const lines: [Point, Point][] = [[center, right], [center, upper], [right, left], [right, upper],
    diagonal ? [inner, upper] : [upper, left]];
  const segments = r.shuffle(lines)
    .map(([a, b], i) => ({ id: String(i + 1), a: id(a), b: id(b) }));
  const circle: Shape = { kind: 'circle', radius };
  return { kind: 'sail-shapes', activity: 'circle', points, segments, figures: figures(r, joined
    ? [circle, { kind: 'ellipse', rx: transfer ? 3 : 6, ry: transfer ? 6 : 3 }, { kind: 'sphere', radius }] : [circle]) };
}
function circleQuestion(r: Rng, diagonal: boolean, joined: boolean, transfer = false): Question {
  return {
    task: circleTask(r, diagonal, joined, transfer),
    say: joined ? 'Valitse ympyrä. Merkitse sen keskipiste, kaksi eri sädettä ja halkaisija samaan suunnitelmaan.'
      : diagonal ? 'Merkitse oikea keskipiste ja kaksi sädettä. Merkitse myös keskipisteen kautta kulkeva halkaisija.'
        : 'Merkitse ympyrän keskipiste, kaksi eri sädettä ja halkaisija.',
    hint: 'Säde alkaa keskipisteestä. Halkaisijan päät ovat kehällä ja keskipiste on niiden puolivälissä.',
    explain: 'Säteet ovat yhtä pitkiä. Halkaisija on kaksi sädettä samassa suorassa linjassa, joten se on kaksi kertaa säteen pituinen.',
  };
}
const circleProperties = definition({
  id: 'M-GEO-CIRCLE-PROP', rev: 'exp690-sail-circle-parts-v1', stop: 'Saman matkan reuna', icon: '📍',
  intro: 'Aava vetää viivoja pyöreään ikkunaan. Loikka vertaa viivojen päitä ja etsii paikan, joka on yhtä kaukana jokaisesta kehäpisteestä.',
  goal: 'Opit merkitsemään keskipisteen, säteet ja halkaisijan.',
  reward: 'Ikkunan mittapiirroksessa on keskikohta ja koko leveys.',
  demo: r => [demo(circleTask(r, false, false), 'Keskipiste yhdistyy kehään yhtä pitkillä säteillä. Halkaisija ulottuu kehältä kehälle keskipisteen kautta.')],
  families: { 'circle-axes': r => circleQuestion(r, false, false), 'circle-diagonal-chord': r => circleQuestion(r, true, false) },
  transfer: r => circleQuestion(r, true, false, true), limit: selectionLimit,
});
const circleIntegration = definition({
  id: 'M-GEO-13', rev: 'exp690-sail-circle-integration-v1', stop: 'Poukaman pyöreä näköikkuna', icon: '🔆',
  intro: 'Aluksen näköikkuna tarvitsee sekä oikean tasokuvion että täsmälliset mittamerkinnät. Loikka laatii yhden yhteisen suunnitelman.',
  goal: 'Opit tunnistamaan ympyrän ja osoittamaan samasta kuviosta keskipisteen, säteet ja halkaisijan.',
  reward: 'Pyöreä näköikkuna saa valmiin mittapiirroksen.',
  demo: r => [demo(circleTask(r, true, true), 'Valitse ensin tasokuvio. Tarkista sitten yhtä pitkät säteet ja keskeltä kulkeva halkaisija samasta kuviosta.')],
  families: { 'circle-plan-window': r => circleQuestion(r, false, true), 'circle-plan-slanted': r => circleQuestion(r, true, true) },
  transfer: r => circleQuestion(r, true, true, true), limit: 'Samassa vastauksessa on kuvion valinta ja kaikki mittamerkinnät. Oma sanallinen perustelu arvioidaan erikseen.',
});

function quadClassTask(r: Rng, nested: boolean, transfer = false): InspectShapeTask {
  const original = nested ? r.pick([square(), rectangle()]) : r.pick([trapezoid(), parallelogram(), oddQuad()]);
  const shape = tilted(r, original, transfer);
  const properties = polygonProperties(shape), classes = quadrilateralTypes(shape);
  return inspection([{ id: 'A', shape }], [
    q('class', 'Kaikki sopivat luokat', choices(quadNames), classes,
      'Luokat voivat sisältyä toisiinsa. Tarkista kulmat, sivujen pituudet ja vastakkaisten sivujen yhdensuuntaisuus.'),
    q('reason', nested ? 'Suoria kulmia' : 'Yhdensuuntaisia vastakkaisia sivupareja', numberChoices(nested ? [0, 2, 4] : [0, 1, 2]),
      String(nested ? properties.angles.filter(a => a === 'right').length : properties.parallelPairs),
      nested ? 'Suora kulma on neljäsosa täydestä kierroksesta.' : 'Vertaa vastakkaisten sivujen suuntia. Laske yhdensuuntaiset parit.'),
  ], quadRule);
}
function quadClassQuestion(r: Rng, nested: boolean): Question {
  return inspect(quadClassTask(r, nested), 'Valitse kaikki luokat, joihin kuvio kuuluu. Merkitse myös pyydetty havainto.',
    'Etsi ensin samansuuntaiset vastakkaiset sivut. Tarkista sitten suorat kulmat ja sivujen yhtäpituus.',
    'Neliö kuuluu myös suorakulmioihin ja suunnikkaisiin. Tässä pajassa suunnikkaat kuuluvat myös trapetseihin.');
}
function quadClassTransfer(r: Rng): Question {
  const narrow = path([[0, 0], [7, 0], [7, 2], [0, 2]]);
  const shapes = [tilted(r, square(), true), tilted(r, narrow, true)];
  const cards = figures(r, shapes);
  return inspect(inspection(cards, cards.map(({ id, shape }) => q(id, `Kuvion ${id} kaikki luokat`, choices(quadNames),
    quadrilateralTypes(shape as PathShape), 'Neljä suoraa kulmaa tekee kuviosta suorakulmion. Tarkista, ovatko myös kaikki sivut yhtä pitkät.')), quadRule),
  'Luokittele kumpikin käännetty ikkuna. Merkitse kaikki sopivat luokat erikseen kummallekin.',
  'Vertaa ikkunoiden sivunpituuksia. Molemmissa voi olla suorat kulmat, vaikka vain toisen kaikki sivut ovat yhtä pitkät.',
  'Molemmat ikkunat ovat suorakulmioita, suunnikkaita, trapetseja ja nelikulmioita. Yhtä pitkien sivujen ikkuna on myös neliö.');
}

const quadClass = definition({
  id: 'M-GEO-QUAD-CLASS', rev: 'exp690-sail-quad-class-v1', stop: 'Nelikulmioiden sukulaiset', icon: '🔷',
  intro: 'Loikka haluaa kiinnittää jokaiseen ikkunaan yhden kyltin. Aava huomaa, että samaan kuvioon voi sopia monta täsmällistä nimeä.',
  goal: 'Opit luokittelemaan nelikulmioita ja tunnistamaan luokkien sisältyvyyden.',
  reward: 'Ikkunavaraston kyltit näyttävät, mitkä luokat sopivat samaan ikkunaan.',
  demo: r => [demo(quadClassTask(r, true), 'Neljä suoraa kulmaa tekee nelikulmiosta suorakulmion. Yhtä pitkät sivut tekevät suorakulmiosta myös neliön.')],
  families: { 'quad-nested-right-angles': r => quadClassQuestion(r, true), 'quad-parallel-pairs': r => quadClassQuestion(r, false) },
  transfer: quadClassTransfer, limit: selectionLimit,
});

function quadPropTask(r: Rng, angles: boolean, transfer = false): InspectShapeTask {
  const shape = tilted(r, angles ? r.pick([square(), rectangle(), oddQuad()]) : r.pick([parallelogram(), trapezoid(), oddQuad()]), transfer);
  const prop = polygonProperties(shape);
  return inspection([{ id: 'A', shape }], [
    q('corners', 'Kärkiä', numberChoices([3, 4, 5]), String(prop.count), 'Laske pisteet, joissa reunalla vaihtuu suunta.'),
    q('edges', 'Sivuja', numberChoices([3, 4, 5]), String(prop.count), 'Seuraa suljetun kuvion sivuja yksi kerrallaan.'),
    angles ? q('feature', 'Suoria kulmia', numberChoices([0, 1, 2, 4]), String(prop.angles.filter(a => a === 'right').length),
      'Vertaa jokaista kulmaa suorakulmaan, vaikka ikkunaa olisi käännetty.')
      : q('feature', 'Yhdensuuntaisia vastakkaisia sivupareja', numberChoices([0, 1, 2]), String(prop.parallelPairs), 'Vertaa sivujen suuntia pareittain.'),
    q('equal', 'Ovatko kaikki sivut yhtä pitkät?', choices({ yes: 'kyllä', no: 'eivät' }), prop.allEqual ? 'yes' : 'no',
      'Kaikkien sivujen on oltava yhtä pitkiä. Kaksi yhtä pitkää sivua ei riitä.'),
  ], undefined, true);
}
function quadPropQuestion(r: Rng, angles: boolean, transfer = false): Question {
  return inspect(quadPropTask(r, angles, transfer), 'Laske ikkunan kärjet ja sivut. Tarkista lopuksi muut pyydetyt ominaisuudet.',
    angles ? 'Laske jokainen kärki kerran. Kuvion kääntäminen ei muuta kulmia.' : 'Vastakkaiset sivut eivät kosketa toisiaan. Vertaa niiden suuntia.',
    'Jokaisessa nelikulmiossa on neljä sivua ja neljä kärkeä. Muut ominaisuudet riippuvat nelikulmiosta.');
}
const quadProperties = definition({
  id: 'M-GEO-QUAD-PROP', rev: 'exp690-sail-quad-properties-v1', stop: 'Neljän reunan ikkuna', icon: '🧭',
  intro: 'Loikka seuraa ikkunan reunoja ennen leikkaamista. Aava merkitsee jokaisen kärjen ja tutkii kulmia sekä vastakkaisia sivuja.',
  goal: 'Opit lukemaan nelikulmion sivujen, kärkien, kulmien ja sivuparien ominaisuuksia.',
  reward: 'Ikkunapiirrokseen syntyy käyttökelpoinen ominaisuusluettelo.',
  demo: r => [demo(quadPropTask(r, true), 'Laske sivut ja kärjet erikseen. Vertaa kulmia suorakulmaan ja sivujen pituuksia toisiinsa.')],
  families: { 'quad-count-angle-equality': r => quadPropQuestion(r, true), 'quad-count-parallel-equality': r => quadPropQuestion(r, false) },
  transfer: r => quadPropQuestion(r, false, true), limit: selectionLimit,
});

function quadIntegrationTask(r: Rng, parallel: boolean, transfer = false): InspectShapeTask {
  const shapes = (parallel ? [trapezoid(), square(), oddQuad()] : [square(), rectangle(), parallelogram()]).map(source => {
    const shape = tilted(r, source, transfer);
    const offset = r.int(0, 3);
    return { ...shape, points: [...shape.points.slice(offset), ...shape.points.slice(0, offset)] };
  });
  const cards = figures(r, shapes).map((figure, i) => ({ ...figure, id: String(i + 1) }));
  const chosen = cards.find(({ shape }) => shape.kind === 'path' && (parallel ? polygonProperties(shape).parallelPairs === 1
    : quadrilateralTypes(shape).includes('square')))!;
  const shape = chosen.shape as PathShape;
  const [a, b, c, d] = shape.points as readonly [Point, Point, Point, Point];
  const firstPair = (b[0] - a[0]) * (d[1] - c[1]) === (b[1] - a[1]) * (d[0] - c[0]);
  return inspection(cards, [
    q('figure', 'Piirrokseen sopiva kuvio', figureChoices(cards), chosen.id,
      parallel ? 'Tarkista, että juuri yksi vastakkainen sivupari on yhdensuuntainen.' : 'Tarvitset neljä suoraa kulmaa ja neljä yhtä pitkää sivua samasta ikkunasta.'),
    parallel ? q('observation', 'Mikä vastakkainen sivupari on yhdensuuntainen?', choices({
      first: 'AB ja CD', second: 'BC ja DA', adjacent: 'AB ja BC',
    }), firstPair ? 'first' : 'second', 'Tarkista valitsemasi ikkunan vastakkaiset sivut kirjaimista. Vertaa niiden suuntia.')
      : q('observation', 'Mitkä merkinnät pätevät?', choices({
        angles: 'kulmat A ja C ovat suoria', equal: 'sivut AB ja BC ovat yhtä pitkät', unequal: 'sivu AB on pidempi kuin BC',
      }), ['angles', 'equal'], 'Tarkista pyydetyt kulmat ja sivunpituudet juuri valitsemastasi ikkunasta.'),
    q('class', 'Kaikki sopivat luokat', choices(quadNames), quadrilateralTypes(shape),
      'Valitun ikkunan voi luokitella usealla nimellä, jos kaikkien luokkien ehdot täyttyvät.'),
  ], quadRule, true);
}

function quadIntegrationQuestion(r: Rng, parallel: boolean, transfer = false): Question {
  return inspect(quadIntegrationTask(r, parallel, transfer), parallel
    ? 'Valitse ikkuna, jossa on täsmälleen yksi pari yhdensuuntaisia vastakkaisia sivuja. Merkitse havainto ja kaikki ikkunan luokat.'
    : 'Valitse ikkuna, jossa on neljä suoraa kulmaa ja yhtä pitkät sivut. Merkitse molemmat tuntomerkit ja kaikki ikkunan luokat.',
  'Tarkista kaikki ehdot samasta kuviosta. Katso lisäksi, mitä laajempia luokkia sen ominaisuudet toteuttavat.',
  parallel ? 'Yhden yhdensuuntaisen vastakkaisen sivuparin ikkuna kuuluu sekä trapetseihin että nelikulmioihin.'
    : 'Neliö täyttää samalla suorakulmion, suunnikkaan, trapetsin ja nelikulmion ehdot.');
}
const quadIntegration = definition({
  id: 'M-GEO-12', rev: 'exp690-sail-quad-integration-v1', stop: 'Oikea ikkuna oikeaan suunnitelmaan', icon: '📐',
  intro: 'Aluksen eri ikkunoihin on eri piirustukset. Loikka valitsee jokaiseen kuvion ja kirjaa, mitkä ominaisuudet valinnan täyttävät.',
  goal: 'Opit valitsemaan nelikulmion ehtojen perusteella ja liittämään ominaisuudet sen luokkiin.',
  reward: 'Aluksen ikkuna saa kuvion ja siihen sopivat luokkamerkinnät.',
  demo: r => [demo(quadIntegrationTask(r, true), 'Tässä ikkunassa on yksi yhdensuuntainen vastakkainen sivupari. Siksi se on nelikulmio ja trapetsi.')],
  families: { 'quad-plan-right-and-equal': r => quadIntegrationQuestion(r, false), 'quad-plan-one-parallel': r => quadIntegrationQuestion(r, true) },
  transfer: r => quadIntegrationQuestion(r, r.chance(.5), true),
  limit: 'Valittu kuvio, annetut tuntomerkit ja kaikki jäsenyydet tarkistetaan yhdessä. Oma sanallinen perustelu arvioidaan erikseen.',
});

function triangleClassTask(r: Rng, angles: boolean, transfer = false): InspectShapeTask {
  const regular = transfer ? equilateral(4, 2, 1) : equilateral(4, 1, -1);
  const shape = angles ? tilted(r, r.pick([acuteTriangle(), rightTriangle(), obtuseTriangle()]), transfer)
    : transfer ? regular : r.pick([regular, tilted(r, isoscelesTriangle(), false), tilted(r, acuteTriangle(), false)]);
  const types = triangleTypes(shape);
  const reasonOptions = angles ? choices({ acute: 'kaikki kulmat teräviä', right: 'yksi suora kulma', obtuse: 'yksi tylppä kulma' })
    : choices({ equilateral: 'kaikki kolme sivua yhtä pitkiä', isosceles: 'vain kaksi sivua yhtä pitkiä', scalene: 'kaikki sivut eripituisia' });
  const mostSpecific = types.sides.at(-1)!;
  return inspection([{ id: 'A', shape }], [
    q('class', angles ? 'Kulmaluokka' : 'Kaikki sopivat sivuluokat', choices(angles ? angleNames : sideNames),
      angles ? types.angles : [...types.sides],
      angles ? 'Etsi suora tai tylppä kulma. Jos kumpaakaan ei ole, kaikki kulmat ovat teräviä.'
        : 'Vähintään kaksi yhtä pitkää sivua riittää tasakylkisyyteen. Kaikki kolme yhtä pitkää tekevät kolmiosta lisäksi tasasivuisen.'),
    q('reason', 'Täsmällinen tuntomerkki', reasonOptions, angles ? types.angles : mostSpecific, 'Valitse täsmällinen havainto, joka sopii tähän kuvioon.'),
  ], triangleRule);
}

function triangleClassQuestion(r: Rng, angles: boolean, transfer = false): Question {
  return inspect(triangleClassTask(r, angles, transfer), angles ? 'Valitse kolmion kulmaluokka ja sitä vastaava tuntomerkki.'
    : 'Valitse kaikki sopivat sivuluokat ja täsmällinen tuntomerkki.',
  angles ? 'Vertaa kulmia suorakulmaan. Yksi suora tai tylppä kulma ratkaisee luokan.'
    : 'Samanpituiset sivut voivat olla vinossa. Vertaa pituuksia, älä suuntia.', triangleRule);
}
const triangleClass = definition({
  id: 'M-GEO-TRI-CLASS', rev: 'exp690-sail-tri-class-v1', stop: 'Kolmioiden monet purjeet', icon: '⛵',
  intro: 'Kuivuvat kolmipurjeet näyttävät erilaisilta. Aava järjestää ne ensin sivunpituuksien ja sitten kulmien perusteella.',
  goal: 'Opit erottamaan kolmion sivuluokan sen kulmaluokasta.',
  reward: 'Varastoon saadaan kaksi eri tapaa etsiä sopivaa kolmipurjetta.',
  demo: r => [demo(triangleClassTask(r, false), triangleRule)],
  families: { 'triangle-class-side': r => triangleClassQuestion(r, false), 'triangle-class-angle': r => triangleClassQuestion(r, true) },
  transfer: r => triangleClassQuestion(r, false, true), limit: selectionLimit,
});

function trianglePropTask(r: Rng, angles: boolean, transfer = false): InspectShapeTask {
  const shape = tilted(r, transfer ? path([[0, 0], [8, 0], [2, 1]])
    : angles ? r.pick([rightTriangle(), obtuseTriangle()]) : r.pick([isoscelesTriangle(), acuteTriangle()]), transfer);
  const prop = polygonProperties(shape);
  const labels = { A: 'A', B: 'B', C: 'C' };
  const [ab, bc, ca] = prop.lengths;
  const pairs = [ab === bc ? 'ab-bc' : '', bc === ca ? 'bc-ca' : '', ca === ab ? 'ca-ab' : ''].filter(Boolean);
  const feature = angles
    ? q('feature', prop.angles.includes('right') ? 'Suoran kulman kärki' : 'Tylpän kulman kärki', choices(labels),
      letter(prop.angles.findIndex(a => a !== 'acute')), 'Vertaa kaikkien kolmen kärjen kulmia suorakulmaan.')
    : q('feature', 'Yhtä pitkät sivut', choices({ 'ab-bc': 'AB ja BC', 'bc-ca': 'BC ja CA', 'ca-ab': 'CA ja AB', none: 'ei yhtä pitkiä' }),
      pairs[0] ?? 'none', 'Jana AB kulkee kärjestä A kärkeen B. Seuraa kahta merkittyä janaa ja vertaa niiden pituuksia.');
  return inspection([{ id: '1', shape }], [
    q('corners', 'Kärkiä', numberChoices([2, 3, 4]), String(prop.count), 'Laske reunojen kohtaamispisteet.'),
    q('edges', 'Sivuja', numberChoices([2, 3, 4]), String(prop.count), 'Laske jokainen reunajana kerran.'),
    feature,
  ], undefined, true);
}
function trianglePropQuestion(r: Rng, angles: boolean, transfer = false): Question {
  return inspect(trianglePropTask(r, angles, transfer), angles ? 'Laske kärjet ja sivut. Osoita sitten pyydetyn kulman kärki.'
    : 'Laske kärjet ja sivut. Merkitse sitten yhtä pitkät sivut tai niiden puuttuminen.',
  angles ? 'Kulman koko pysyy samana, vaikka purje kääntyy.' : 'Seuraa kirjainten välistä reunaa. Laske jokainen sivu kerran.',
  'Kolmiossa on kolme sivua ja kolme kärkeä. Kolmioiden sivujen pituudet ja kulmien koot voivat vaihdella.');
}
const triangleProperties = definition({
  id: 'M-GEO-TRI-PROP', rev: 'exp690-sail-tri-properties-v1', stop: 'Kolmion kolme kulmaa', icon: '📏',
  intro: 'Loikka kiertää kolmipurjeen reunaa. Aava merkitsee kärjet niin, että sivuista ja kulmista voi puhua täsmällisesti.',
  goal: 'Opit laskemaan kolmion sivut ja kärjet ja osoittamaan pyydetyn sivuparin tai kulman.',
  reward: 'Purjekankaaseen saadaan selkeät geometriset merkinnät.',
  demo: r => [demo(trianglePropTask(r, true), 'Kärjen kirjain kertoo, missä kulma on. Kahden kärjen kirjaimet nimeävät sivun.')],
  families: { 'triangle-count-equal-edges': r => trianglePropQuestion(r, false), 'triangle-count-angle-vertex': r => trianglePropQuestion(r, true) },
  transfer: r => trianglePropQuestion(r, true, true), limit: selectionLimit,
});

function triangleIntegrationTask(r: Rng, angles: boolean, transfer = false): InspectShapeTask {
  const need = angles ? transfer ? 'obtuse' : 'right' : 'isosceles';
  const cards = figures(r, (angles ? [rightTriangle(), acuteTriangle(), obtuseTriangle()]
    : [isoscelesTriangle(), obtuseTriangle(), acuteTriangle()]).map(shape => tilted(r, shape, transfer)));
  const chosen = cards.find(({ shape }) => shape.kind === 'path' && (angles ? triangleTypes(shape).angles === need : triangleTypes(shape).sides.some(side => side === need)))!;
  const prop = polygonProperties(chosen.shape as PathShape);
  const edgeChoices = choices({ 'ab-bc': 'AB ja BC', 'bc-ca': 'BC ja CA', 'ca-ab': 'CA ja AB' });
  const [ab, bc] = prop.lengths;
  return inspection(cards, [
    q('figure', 'Sopiva purje', figureChoices(cards), chosen.id, angles
      ? 'Vertaa kaikkien purjeiden kulmia suorakulmaan. Valitse ehdon toteuttava purje.' : 'Vertaa sivujen pituuksia yhdessä kuviossa kerrallaan.'),
    angles ? q('feature', 'Pyydetyn kulman kärki', choices({ A: 'A', B: 'B', C: 'C' }), letter(prop.angles.findIndex(a => a === need)),
      'Osoita kulma valitsemastasi purjeesta. Kärjen kirjain yksilöi kulman.')
      : q('feature', 'Yhtä pitkät sivut', edgeChoices, ab === bc ? 'ab-bc' : 'bc-ca',
      'Osoita valitsemasi purjeen ne kaksi sivua, joiden pituudet ovat samat.'),
    q('class', angles ? 'Kulmaluokka' : 'Sivuluokka', choices(angles ? angleNames : sideNames), need,
      'Nimeä luokka, jonka ehdon merkitsemäsi ominaisuus täyttää.'),
  ], triangleRule, true);
}
function triangleIntegrationQuestion(r: Rng, angles: boolean, transfer = false): Question {
  const requirement = angles ? transfer ? 'yksi tylppä kulma' : 'yksi suora kulma' : 'vähintään kaksi yhtä pitkää sivua';
  return inspect(triangleIntegrationTask(r, angles, transfer),
    `Valitse kolmipurje, jossa on ${requirement}. Merkitse samasta purjeesta havainto ja sen luokka.`,
    angles ? 'Etsi vaadittu kulma ja lue sen kärjen kirjain. Päättele kolmion kulmaluokka kulmasta.'
      : 'Etsi ensin kaksi yhtä pitkää sivua. Käytä niiden päätepisteitä sivujen nimeämiseen.',
    angles ? transfer ? 'Yksi tylppä kulma tekee kolmiosta tylppäkulmaisen.' : 'Yksi suora kulma tekee kolmiosta suorakulmaisen.'
      : 'Vähintään kaksi yhtä pitkää sivua tekee kolmiosta tasakylkisen.');
}
const triangleIntegration = definition({
  id: 'M-GEO-11', rev: 'exp690-sail-triangle-integration-v1', stop: 'Purje, jonka valinnan voi perustella', icon: '🏁',
  intro: 'Aluksen purjeelle on ehto. Loikka etsii sopivan kappaleen ja osoittaa juuri siitä havainnon, joka täyttää ehdon.',
  goal: 'Opit valitsemaan kolmion, osoittamaan sen ominaisuuden ja nimeämään oikean luokan.',
  reward: 'Aluksen purjeen piirustuksessa on kuvio, havainto ja luokka.',
  demo: r => [demo(triangleIntegrationTask(r, false), 'Valitse purje ja osoita sen kaksi yhtä pitkää sivua. Ne osoittavat, että purje on tasakylkinen.')],
  families: { 'triangle-plan-equal-sides': r => triangleIntegrationQuestion(r, false), 'triangle-plan-angle': r => triangleIntegrationQuestion(r, true) },
  transfer: r => triangleIntegrationQuestion(r, true, true),
  limit: 'Kuvio, siitä osoitettu ominaisuus ja luokka tarkistetaan samassa vastauksessa. Oppijan oma perustelu arvioidaan erikseen.',
});

const entries = [build, polygons, sorting, naming, circleId, circleProperties, circleIntegration,
  quadClass, quadProperties, quadIntegration, triangleClass, triangleProperties, triangleIntegration];
export const sailShapeSpecs: NodeSpec[] = entries.map(({ spec }) => spec);
export const sailShapeEvidence: Readonly<Record<string, { families: readonly string[]; limit: string }>> =
  Object.fromEntries(entries.map(({ spec, evidence }) => [spec.id, evidence]));
