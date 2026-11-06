import type { Rng } from '../engine/rng';
import type { Item, NodeSpec } from '../engine/types';
import { cases } from './kit';
import {
  centerOf, isPolyhedron, polyhedronStructure,
  type NameSolidField, type SolidCell, type SolidConstructionScene, type SolidConstructionTask, type SolidTerm,
} from './models/solid-construction';
import {
  cone, polygonBase, prism, pyramid, rectangleBase, solidMemberships, triangleBase,
  type Geometry, type SolidFigure, type SolidWorkshopQuestion, type SolidWorkshopScene, type SolidWorkshopTask,
} from './models/solid-workshop';
import { constructionBoard, solidNamingArt, type PolyDiagram, type PolyMarker } from './scenes/solid-construction';
import { solidWorkshopPaint } from './scenes/solid-workshop';

type Draft = Omit<Item, 'tag' | 'task'> & { task: SolidWorkshopTask | SolidConstructionTask; sceneModel: SolidWorkshopScene | SolidConstructionScene };
type Author = (r: Rng) => Draft;
interface Definition extends Omit<NodeSpec, 'item' | 'demo' | 'rev' | 'validRevs' | 'produce'> {
  families: Record<string, Author>; transfer: Author; limit: string;
}
function define({ families, transfer, limit, ...meta }: Definition) {
  const tags = Object.keys(families), prior = `exp690-construction-${meta.id.toLowerCase()}-v1`;
  const rev = meta.id === 'M-GEO-07' ? prior.replace(/v1$/, 'v2') : prior;
  return {
    spec: { ...meta, rev, validRevs: rev === prior ? [rev] : [prior, rev], item: cases(families, transfer),
      ...(meta.produceWhat ? { produce: [...tags, 'transfer'] } : {}),
      demo: r => tags.map(tag => {
        const example = families[tag]!(r);
        const model = example.sceneModel;
        return model.kind === 'solid-construction'
          ? { say: example.explain!, scene: constructionBoard({ ...model, previewCells: model.referenceCells }),
            sceneModel: { ...model, previewCells: model.referenceCells } }
          : { say: example.explain!, scene: example.scene!, sceneModel: model };
      }),
    } satisfies NodeSpec,
    evidence: { families: tags, limit },
  };
}
const short = 'Valinnat osoittavat mallin ominaisuuksien tunnistamista. Oma perustelu arvioidaan erikseen.';
const named = 'Oppija osoittaa merkin ja kirjoittaa lyhyen geometrisen termin. Tarkistus hyväksyy yleisiä opetettuja taivutusmuotoja. Vapaa kuvaus arvioidaan erikseen.';
const options = (labels: Record<string, string>) => Object.entries(labels).map(([id, label]) => ({ id, label }));
const letters = ['A', 'B', 'C'];
const markChoices = letters.map(id => ({ id, label: id }));
const pick = (id: string, label: string, choices: ReturnType<typeof options>, answer: string | string[], why: string): SolidWorkshopQuestion =>
  ({ id, label, options: choices, answer: typeof answer === 'string' ? [answer] : answer, many: Array.isArray(answer), why });
const figOptions = (figures: SolidFigure[]) => figures.map(({ id }) => ({ id, label: `Malli ${id}` }));
const countOptions = (nums: number[]) => nums.map(n => ({ id: String(n), label: String(n) }));
const box = (w: number, h: number, d: number) => prism(rectangleBase(w, d), h);
const obliqueBase = () => [[-3, -2], [1, -2], [3, 2], [-1, 2]] as const;

function buildQuestion(r: Rng, stack: boolean, transfer = false): Draft {
  const sources: readonly SolidCell[][] = transfer ? [
    [[0,0,0],[1,0,0],[1,0,1],[1,0,2],[2,0,2],[1,1,1],[2,1,2]],
    [[1,0,0],[2,0,0],[1,0,1],[0,0,2],[1,0,2],[2,1,0],[1,1,2]],
  ] : stack ? [
    [[0,0,1],[1,0,1],[2,0,1],[2,0,2],[1,1,1],[2,1,2]],
    [[0,0,0],[0,0,1],[1,0,1],[1,0,2],[0,1,0],[1,1,2]],
  ] : [
    [[0,0,1],[1,0,1],[2,0,1],[0,0,2],[1,0,0]],
    [[0,0,0],[0,0,1],[1,0,1],[2,0,1],[2,0,2]],
  ];
  // Rotate the actual numbered grid positions, not the camera. The required
  // construction changes while depth, support and the layer count remain valid.
  const turns = r.int(0, 3);
  const referenceCells = r.pick(sources).map(([x, y, z]): SolidCell => {
    for (let n = 0; n < turns; n++) [x, z] = [2 - z, x];
    return [x, y, z];
  });
  const sceneModel: SolidConstructionScene = { kind: 'solid-construction', title: 'Majakan palikkapaja',
    view: 'angled', grid: [3, stack || transfer ? 2 : 1, 3], referenceCells, previewCells: [], pose: transfer ? 'horizontal' : 'upright' };
  return { task: { kind: 'solid-construction', activity: 'build', scene: sceneModel }, sceneModel, scene: constructionBoard(sceneModel),
    say: transfer ? 'Rakenna uudesta suunnasta nähty malli. Käytä samoja numeroituja rivejä ja sarakkeita.'
      : 'Kokoa mallin mukainen rakennelma. Napauta tai valitse palikan paikka oikeassa kerroksessa.',
    hint: 'Lue ensin alimman kerroksen ruudut. Takimmainen palikka voi peittyä etukuvassa.',
    explain: 'Mallien palikat täyttävät samat ruudut jokaisessa kerroksessa. Tarkistimme myös syvyyden.' };
}
const builder = define({
  id: 'M-GEO-07', stop: 'Malli muuttuu rakennelmaksi', icon: '🧱',
  intro: 'Aava näyttää mallin myös ylhäältä. Loikka huomaa, että eturivi voi peittää osan rakennelmasta.',
  goal: 'Rakennat saman rakenteen kerros kerrokselta ja tarkistat syvyyden.',
  reward: 'Oma rakennelmasi sopii majakkapajan ruudukkoon.',
  produceWhat: 'oman kolmiulotteisen palikkarakenteen kokoamista',
  families: { 'blocks-hidden-depth': r => buildQuestion(r, false), 'blocks-staggered-levels': r => buildQuestion(r, true) },
  transfer: r => buildQuestion(r, true, true),
  limit: 'Vastaus on oppijan rakentama paikkajoukko. Kiinteä ruudukko määrittää suunnan ja syvyyden. Näkymän kääntäminen ei vaikuta tarkistukseen.',
});

function polyDiagramFor(figure: SolidFigure, markers: (structure: ReturnType<typeof polyhedronStructure>) => PolyMarker[]): PolyDiagram {
  if (!isPolyhedron(figure.geometry)) throw new Error('Monitahokkaan mallista puuttuu rakenne.');
  const structure = polyhedronStructure(figure.geometry);
  return { id: figure.id, vertices: structure.vertices, edges: structure.edges, markers: markers(structure) };
}
const withMarks = (figure: SolidFigure, diagram: PolyDiagram): SolidFigure => ({
  ...figure, marks: diagram.markers.map(marker => ({ id: marker.id, position: centerOf(marker.points), highlight: marker.highlight })),
});
const solidScene = (figures: SolidFigure[]): SolidWorkshopScene => ({ kind: 'solid-workshop', title: 'Majakan mallipöytä', figures, view: 'angled' });
const solidFigures = (r: Rng, models: Geometry[], transfer: boolean) =>
  r.shuffle(models).map((geometry, i): SolidFigure => ({ geometry, id: String(i + 1), pose: transfer ? 'horizontal' : r.pick(['tilted', 'upright', 'horizontal'] as const) }));

function namingQuestion(r: Rng, face: boolean, combined: boolean, transfer = false): Draft {
  const geometry = face && !transfer ? box(5, 4, 4) : transfer ? prism(triangleBase(), 4) : pyramid(rectangleBase(5, 4), 5);
  const model = solidFigures(r, [geometry], transfer)[0]!;
  const figure = combined ? { ...model, id: '2' } : model;
  const [a,b,c] = r.shuffle(letters);
  const term: SolidTerm = combined ? face ? 'tahko' : 'särmä'
    : face ? r.pick(['tahko', 'pohja'] as const) : r.pick(['särmä', 'kärki'] as const);
  const diagram = polyDiagramFor(figure, ({ faces, edges, vertices }) => [
    { id: a!, feature: 'face', points: (term === 'pohja' ? faces[0]! : faces.at(-1)!).map(i => vertices[i]!), highlight: face },
    { id: b!, feature: 'edge', points: edges.at(-1)!.map(i => vertices[i]!), highlight: term === 'särmä' },
    { id: c!, feature: 'vertex', points: [vertices.at(-1)!], highlight: term === 'kärki' },
  ]);
  const bodyField: NameSolidField = { id: 'solid', label: 'Kappale', options: letters, mark: face ? a! : term === 'särmä' ? b! : c!, term };
  const figs = [withMarks(figure, diagram)], diagrams = [diagram], fields = [bodyField];
  if (combined) {
    const base = transfer ? triangleBase() : rectangleBase(6, 4);
    const flat: SolidFigure = { id: '1', geometry: { kind: 'flat-polygon', base }, pose: 'tilted' };
    const vertices = base.map(([x,z]) => [x,0,z] as const);
    const [first, second] = r.shuffle(['A', 'B']);
    const pair: PolyDiagram = { id: flat.id, vertices, edges: vertices.map((_, i) => [i, (i + 1) % vertices.length]),
      markers: [{ id: first!, feature: 'edge', points: vertices.slice(0, 2) },
        { id: second!, feature: 'edge', points: vertices.slice(1, 3), highlight: true }] };
    figs.unshift(withMarks(flat, pair));
    diagrams.unshift(pair);
    fields.unshift({ id: 'flat', label: 'Tasokuvio', options: ['A','B'], mark: second!, term: 'sivu' });
  }
  const prompt = term === 'pohja' ? 'Nimeä korostettu pinta sen roolin mukaan. Pystyasennossa kappale lepää juuri tällä pinnalla.' : '';
  return { task: { kind: 'solid-construction', activity: 'name', fields }, sceneModel: solidScene(figs), scene: solidNamingArt(diagrams, prompt),
    say: combined ? 'Valitse korostettu merkki kummastakin mallista ja kirjoita molempien geometrinen nimi.'
      : 'Valitse korostettu merkki ja kirjoita sen kohdalle täsmällinen geometrinen nimi.',
    hint: 'Katso, osoittaako korostus pinta-alaa, reunaviivaa vai yhtä pistettä. Tasokuvion reunan ja kappaleen reunan nimet eroavat.',
    explain: fields.map(field => `${field.label}, ${field.mark}: ${field.term}.`).join(' ') };
}
const names = define({
  id: 'M-GEO-3D-PROP-NAME', stop: 'Kappaleen omat osat', icon: '📍',
  intro: 'Loikan työohjeessa lukee ”tuo kohta”. Aava osoittaa kappaleen pinnan, viivan tai pisteen.',
  goal: 'Opit kohdistamaan ja nimeämään kappaleen osan täsmällisesti.',
  reward: 'Kiinnityskohta löytyy työohjeesta.',
  produceWhat: 'korostetun kappaleen osan nimeämistä',
  families: { 'name-face-or-base': r => namingQuestion(r, true, false), 'name-edge-or-vertex': r => namingQuestion(r, false, false) },
  transfer: r => namingQuestion(r, r.chance(.5), false, true), limit: named,
});
const combinedNames = define({
  id: 'M-GEO-08', stop: 'Kuva ja kappale samalla pöydällä', icon: '✎',
  intro: 'Tasokuvion reuna ja rakennusosan reuna näyttävät lähekkäin samankaltaisilta. Aava kirjoittaa niille eri nimet.',
  goal: 'Nimeät tasokuvion ja kappaleen osat samassa tehtävässä.',
  reward: 'Työohje erottaa piirroksen sivun ja rakennusosan pinnat tai reunat.',
  produceWhat: 'sekä tasokuvion että kappaleen merkityn osan nimeämistä',
  families: { 'flat-side-and-solid-face': r => namingQuestion(r, true, true), 'flat-side-and-solid-edge': r => namingQuestion(r, false, true) },
  transfer: r => namingQuestion(r, r.chance(.5), true, true),
  limit: 'Kaksi kohdistusta ja kaksi itse kirjoitettua termiä tarkistetaan yhdessä. Vapaamuotoinen selitys arvioidaan erikseen.',
});

function inspectDraft(figures: SolidFigure[], questions: SolidWorkshopQuestion[], say: string, hint: string, explain: string,
  diagrams?: PolyDiagram[], definitions?: string): Draft {
  const sceneModel = solidScene(figures);
  return { task: { kind: 'solid-workshop', scene: sceneModel, questions, definitions }, sceneModel, say, hint, explain,
    scene: diagrams ? solidNamingArt(diagrams, definitions) : solidWorkshopPaint(sceneModel, definitions) };
}

const rectRule = 'Suorakulmaisen särmiön jokainen tahko on suorakulmio. Neliö on suorakulmio, joten kuutio kuuluu ryhmään.';
const pyramidRule = 'Pyramidilla on yksi monikulmiopohja. Jokaisesta pohjan sivusta kulkee yksi kolmionmuotoinen sivutahko yhteiseen kärkeen.';
function identity(r: Rng, rect: boolean, second: boolean, transfer = false): Draft {
  const rectModels = transfer ? [box(7,2,4), prism(obliqueBase(),3), pyramid(rectangleBase(5,4),5)]
    : second ? [box(6,2,3), box(4,4,4), prism(obliqueBase(),4)] : [box(4,4,4), prism(triangleBase(),4), pyramid(rectangleBase(5,4),4)];
  const pyramidModels = transfer ? [pyramid(polygonBase(),3), prism(polygonBase(),3), cone(3,3)]
    : second ? [pyramid(triangleBase(),4), prism(triangleBase(),4), cone(3,4)]
      : [pyramid(rectangleBase(5,5),4), pyramid(triangleBase(),5), cone(3,5)];
  const figures = solidFigures(r, rect ? rectModels : pyramidModels, transfer);
  const chosen = figures.filter(({ geometry }) => rect ? solidMemberships(geometry).includes('box') : geometry.kind === 'pyramid');
  const reasons = rect ? { all: 'jokainen tahko on suorakulmio', front: 'yksi suorakulmainen sivukuva riittää', cube: 'tahko ei voi olla neliö' }
    : { all: 'monikulmiopohja ja sivukolmiot yhteiseen kärkeen', front: 'kaikki kärjelliset kappaleet', cube: 'pohja on aina neliö' };
  return inspectDraft(figures, [
    pick('figures', rect ? 'Suorakulmaiset särmiöt' : 'Pyramidit', figOptions(figures), chosen.map(f => f.id), rect ? rectRule : pyramidRule),
    pick('rule', 'Rakenteen tuntomerkki', options(reasons), 'all', 'Yhdistä havainto koko kappaleen rakenteeseen. Pelkkä siluetti ei riitä.'),
  ], rect ? 'Valitse kaikki suorakulmaiset särmiöt. Merkitse niiden yhteinen tuntomerkki.'
    : 'Valitse kaikki pyramidit. Merkitse niiden yhteinen tuntomerkki.',
  rect ? 'Katso, mitkä muodot näkyvät kahdesta suunnasta. Neliö on suorakulmion erikoistapaus.'
    : 'Etsi pohja ja sivut. Kärki yksin ei kerro, onko pohja monikulmio vai ympyrä.',
  `Valitut mallit ovat ${chosen.map(f => f.id).join(' ja ')}. ${rect ? rectRule : pyramidRule}`);
}
const rectId = define({
  id: 'M-GEO-RECTPRISM-ID', stop: 'Suorakulmaisen varaston runko', icon: '▣',
  intro: 'Varaston aihiot ovat eri asennoissa. Loikka tutkii tahkot kahdesta suunnasta ennen valintaa.',
  goal: 'Tunnistat suorakulmaisen särmiön ja sen erikoistapauksen kuution.',
  reward: 'Varaston runko löytyy rakenteensa perusteella.',
  families: { 'rect-id-cube-included': r => identity(r,true,false), 'rect-id-same-side-view': r => identity(r,true,true) },
  transfer: r => identity(r,true,true,true), limit: short,
});
const pyramidId = define({
  id: 'M-GEO-PYRAMID-ID', stop: 'Monikulmainen huippu', icon: '△',
  intro: 'Majan katon aihioissa on kärkiä ja erilaisia pohjia. Aava tutkii, mihin tasaiset sivut liittyvät.',
  goal: 'Tunnistat pyramidin sen monikulmiopohjasta ja yhteisestä kärjestä.',
  reward: 'Pyramidiaihiot siirtyvät oikealle hyllylle.',
  families: { 'pyramid-id-square-and-triangle': r => identity(r,false,false), 'pyramid-id-same-end-view': r => identity(r,false,true) },
  transfer: r => identity(r,false,true,true), limit: short,
});

function cuboidParts(r: Rng, opposite: boolean, integration: boolean, transfer = false): Draft {
  const geometry = transfer ? box(8,3,2) : opposite ? box(5,3,2) : box(4,4,4);
  const figures = solidFigures(r, integration ? [geometry, prism(obliqueBase(),3), prism(triangleBase(),4)] : [geometry], transfer);
  const target = figures.find(f => f.geometry === geometry)!;
  const edgeMode = integration && !opposite;
  const diagrams = figures.map(figure => {
    const labels = r.shuffle(letters);
    return polyDiagramFor(figure, ({ faces, edges, vertices }) => {
      if (edgeMode) return [
        { id: labels[0]!, feature: 'edge', points: edges.at(-1)!.map(i => vertices[i]!) },
        { id: labels[1]!, feature: 'vertex', points: [vertices.at(-1)!] },
        { id: labels[2]!, feature: 'face', points: faces[0]!.map(i => vertices[i]!) },
      ];
      // Two end faces and one side face share no hidden answer text in the figure.
      return [0, 1, 2].map((index): PolyMarker => ({
        id: labels[index]!, feature: 'face', points: faces[index]!.map(i => vertices[i]!),
      }));
    });
  });
  const correct = diagrams.find(d => d.id === target.id)!;
  if (!isPolyhedron(target.geometry)) throw new Error('Suorakulmaisen särmiön rakenne puuttuu.');
  const { faces, edges, vertices } = polyhedronStructure(target.geometry);
  const question = [
    ...(integration ? [pick('figure', 'Suorakulmainen särmiö', figOptions(figures), target.id, rectRule)] : []),
    ...(!opposite ? [
      pick('faces', 'Tahkoja', countOptions([4, 5, 6, 8]), String(faces.length), 'Laske kaikki tasopinnat myös takaa ja alta.'),
      pick('edges', 'Särmiä', countOptions([8, 10, 12, 14]), String(edges.length), 'Särmä on kahden tahkon yhteinen reunajana. Laske myös katkoviivat.'),
      pick('vertices', 'Kärkiä', countOptions([6, 8, 10, 12]), String(vertices.length), 'Kärjissä särmät kohtaavat. Laske myös peittyvät kärjet.'),
      ...(edgeMode ? [pick('part','Särmän merkintä',markChoices,correct.markers[0]!.id,'Särmä on jana kahden tahkon välissä.')] : []),
    ] : [
      pick('faces-pair', 'Kaksi vastakkaista tahkoa', markChoices, correct.markers.slice(0,2).map(m => m.id),
        'Vastakkaiset tahkot ovat eri puolilla kappaletta. Niillä ei ole yhteistä särmää.'),
      pick('relation', 'Vastakkaisten tahkojen suhde', options({
        same: 'samankokoiset ja yhdensuuntaiset', adjacent: 'kohtaavat yhteisellä särmällä', vary: 'aina erikokoiset',
      }), 'same', 'Vertaa tahkojen muotoa ja niiden suuntaa.'),
    ]),
    ...(integration ? [pick('structure', 'Valitun mallin rakennesääntö', options({
      rectangular: 'kaikki tahkot ovat suorakulmioita', sameSide: 'yksi suorakulmainen sivukuva riittää',
      opposed: 'kaksi samankokoista pohjaa riittää',
    }), 'rectangular', 'Myös vinolla särmiöllä voi olla suorakulmainen sivukuva. Tarkista kaikkien tahkojen muoto.')] : []),
  ];
  return inspectDraft(figures.map((f,i) => withMarks(f,diagrams[i]!)),question,
    `${integration ? 'Valitse suorakulmainen särmiö. Tutki saman mallin osia. ' : ''}${opposite
      ? 'Merkitse kaksi vastakkaista tahkoa ja niiden suhde.' : 'Laske kaikki tahkot, särmät ja kärjet.'}${integration ? ' Merkitse myös rakennesääntö.' : ''}`,
    'Tutki myös katkoviivoin näkyvät reunat. Laske jokainen osa kerran.',
    opposite ? `${correct.markers[0]!.id} ja ${correct.markers[1]!.id} ovat vastakkaiset, samankokoiset ja yhdensuuntaiset tahkot.`
      : 'Suorakulmaisessa särmiössä on 6 tahkoa, 12 särmää ja 8 kärkeä.',
    diagrams);
}
const rectParts = define({
  id: 'M-GEO-RECTPRISM-PROP', stop: 'Varastorungon kaikki puolet', icon: '▦',
  intro: 'Loikka laski etupuolen reunat. Aava piirtää myös peittyvät reunat näkyviin.',
  goal: 'Lasket koko särmiön osat ja tunnistat vastakkaiset tahkot.',
  reward: 'Kaikki kiinnityskohdat näkyvät työohjeessa.',
  families: { 'rect-count-hidden-structure': r => cuboidParts(r,false,false), 'rect-opposite-faces': r => cuboidParts(r,true,false) },
  transfer: r => cuboidParts(r,r.chance(.5),false,true), limit: short,
});
const rectIntegration = define({
  id: 'M-GEO-15', stop: 'Perusteltu varastorunko', icon: '📦',
  intro: 'Majakan varasto tarvitsee rungon ja tarkan ohjeen siitä, mihin osaan kiinnikkeet tulevat.',
  goal: 'Valitset suorakulmaisen särmiön ja osoitat sen osat samasta mallista.',
  reward: 'Varaston runko saa siihen sopivan kiinnityssuunnitelman.',
  families: { 'rect-plan-count-and-edge': r => cuboidParts(r,false,true), 'rect-plan-opposite-supports': r => cuboidParts(r,true,true) },
  transfer: r => cuboidParts(r,r.chance(.5),true,true),
  limit: 'Yksi vastaus kattaa valitun kappaleen sekä sen määrä- tai tahkohavainnot. Oma perustelu arvioidaan erikseen.',
});

function pyramidParts(r: Rng, second: boolean, integration: boolean, transfer = false): Draft {
  const base = transfer ? polygonBase() : second ? triangleBase() : rectangleBase(5,4);
  const geometry = pyramid(base,transfer ? 3 : 5);
  const figures = solidFigures(r, integration ? [geometry, prism(base,5), pyramid(second ? rectangleBase(5,4) : triangleBase(),5)] : [geometry], transfer);
  const target = figures.find(f => f.geometry === geometry)!;
  const diagrams = figures.map(figure => {
    const labels = r.shuffle(letters);
    return polyDiagramFor(figure, ({ faces, vertices, bases }) => [
      { id: labels[0]!, feature: 'face', points: faces[0]!.map(i => vertices[i]!) },
      { id: labels[1]!, feature: 'vertex', points: [vertices.at(-1)!] },
      { id: labels[2]!, feature: 'face', points: faces[bases]!.map(i => vertices[i]!) },
    ]);
  });
  const correct = diagrams.find(d => d.id === target.id)!;
  const [bottom, top, side] = correct.markers;
  if (!isPolyhedron(target.geometry)) throw new Error('Pyramidin rakenne puuttuu.');
  const structure = polyhedronStructure(target.geometry);
  const sides = structure.faces.length - structure.bases;
  const asks = [
    ...(integration ? [pick('figure', `${base.length}-kulmapohjainen pyramidi`, figOptions(figures), target.id,
      'Valitse kappale, jonka pohjassa on pyydetty määrä sivuja ja jonka sivut liittyvät yhteiseen kärkeen.')] : []),
    pick('base', 'Pohja', markChoices, bottom!.id, 'Pohja on kärjen vastainen monikulmio.'),
    pick('apex', 'Yhteinen kärki', markChoices, top!.id, 'Sivukolmiot liittyvät samaan pisteeseen.'),
    pick('side', 'Sivukolmio', markChoices, side!.id, 'Etsi kolmio, joka yhdistää pohjan yhden sivun kärkeen.'),
    second ? pick('relation', integration ? 'Kaikkien tahkojen määrä pohja mukaan lukien' : 'Montako sivukolmiota?',
      countOptions([3, 4, 5, 6, 7]), String(integration ? structure.faces.length : sides),
      'Jokainen pohjan sivu liittyy omaan sivukolmioonsa.') : pick('relation', 'Pohjan sivun ja sivutahkon suhde', options({
      one: 'yksi sivukolmio jokaista pohjan sivua kohti', two: 'kaksi sivukolmiota jokaista pohjan sivua kohti', fixed: 'aina neljä sivukolmiota',
    }), 'one', 'Seuraa yhtä pohjan sivua yhteiseen kärkeen. Samanlainen yhteys toistuu muilla sivuilla.'),
  ];
  return inspectDraft(figures.map((f,i) => withMarks(f,diagrams[i]!)),asks,
    `${integration ? `Valitse ${base.length}-kulmapohjainen pyramidi. ` : ''}Merkitse samasta mallista pohja, yhteinen kärki ja sivukolmio. Tarkista niiden suhde.`,
    'Kierrä pohjan reunaa. Yhdistä mielessäsi jokainen sivu yhteiseen kärkeen.',
    `Pohja on ${bottom!.id}, kärki ${top!.id} ja sivukolmio ${side!.id}. Pohjan ${base.length} sivua muodostavat ${sides} sivukolmiota.${integration && second ? ` Pohja mukaan lukien tahkoja on ${structure.faces.length}.` : ''}`, diagrams);
}
const pyramidProperties = define({
  id: 'M-GEO-PYRAMID-PROP', stop: 'Pohja kertoo huipun rakenteen', icon: '◇',
  intro: 'Aava vaihtaa pyramidin pohjan. Loikka tutkii, mitkä osat muuttuvat pohjan mukana.',
  goal: 'Osoitat pyramidin osat ja yhdistät sivukolmioiden määrän pohjan sivuihin.',
  reward: 'Pyramidin osaluettelo vastaa valittua pohjaa.',
  families: { 'pyramid-one-face-per-side': r => pyramidParts(r,false,false), 'pyramid-count-triangle-base': r => pyramidParts(r,true,false) },
  transfer: r => pyramidParts(r,true,false,true), limit: short,
});
const pyramidIntegration = define({
  id: 'M-GEO-18', stop: 'Vuoristomajan huippu', icon: '⛺',
  intro: 'Vuoristomajan kattoon tarvitaan tietyn pohjan pyramidi. Loikka tarkistaa osien paikat ennen kiinnitystä.',
  goal: 'Valitset pyramidin ja osoitat sen pohjan, kärjen ja sivukolmion samasta mallista.',
  reward: 'Majan lyhty syttyy uuden suojakaton alla.',
  families: { 'pyramid-plan-square-structure': r => pyramidParts(r,false,true), 'pyramid-plan-triangle-count': r => pyramidParts(r,true,true) },
  transfer: r => pyramidParts(r,true,true,true),
  limit: 'Sama vastaus tarkistaa valitun pyramidin, kohdistetut osat ja pohjan sekä sivutahkojen yhteyden. Oma perustelu arvioidaan erikseen.',
});

const entries = [builder, names, combinedNames, pyramidId, pyramidProperties, pyramidIntegration, rectId, rectParts, rectIntegration];
export const solidConstructionSpecs: NodeSpec[] = entries.map(({ spec }) => spec);
export const solidConstructionEvidence: Readonly<Record<string, { families: readonly string[]; limit: string }>> =
  Object.fromEntries(entries.map(({ spec, evidence }) => [spec.id,evidence]));
