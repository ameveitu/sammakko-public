import type { ReactionLabScene } from './models/reaction-lab-scene';
import type { MatterCyclesScene } from './models/matter-cycles-scene';
import type { InquiryIslandsScene } from './models/inquiry-islands-scene';
import type { CarbonKitchenScene } from './models/carbon-kitchen-scene';
import type { AtomicWorldScene } from './models/atomic-world';
import type { WavesObservatoryScene } from './models/waves-observatory';
import type { LogicWorkshopScene } from './models/logic-workshop';
import type { ChemicalInvestigationScene } from './models/chemical-investigation-scene';
import type { PhysicsInvestigationScene } from './models/physics-investigation';
import type { MaterialsMixturesScene } from './models/materials-mixtures-scene';
import type { EnergyIslandsScene } from './models/energy-islands';
import type { AdvancedSolidsScene } from './models/advanced-solids';
import type { CircuitWorkshopScene } from './models/circuit-workshop';
import type { RightTriangleScene } from './models/right-triangle';
import type { ElectricityHarborScene } from './scenes/electricity-harbor';
import type { StatisticsHarborScene } from './models/statistics-harbor-scene';
import type { ThermalScene } from './scenes/thermal-station';
import type { ProgrammingFerryScene } from './models/programming-ferries';
import type { MeasurementStationScene } from './models/measurement-scene';
import type { NumberRouteScene } from './models/number-route';
import type { SpatialVolumeScene } from './models/spatial-measures';
import type { SolidConstructionScene } from './models/solid-construction';
import type { SolidWorkshopScene } from './models/solid-workshop';
import type { WorkPowerScene } from './scenes/work-power';
import type { Rng } from '../engine/rng';
import type { CorrectionSceneModel } from './correction-models';
import type { SpaceObservatoryScene } from './space-observatory';
import type { ForceWorkshopScene } from './scenes/force-workshop';
import type { DemoStep, Item, NodeSpec, Phase, Task } from '../engine/types';
import { svg } from '../ui/art';
import { cases, choose, paint, table, txt } from './kit';
import { pairForces, trackMotion, type ActionPair, type ForceTrack } from './models/force-track';
import { parallelReadings, type ParallelCircuit } from './models/circuit';
import { filtrationOutcome, type Filtration } from './models/filtration';
import { meanSpaceDistancesKm, spaceDiametersKm, spaceLight, type SpaceModel } from './models/space';

interface VolumeScene {
  kind: 'volume';
  title: string;
  dimensions: [number, number, number];
  unit: 'cm' | 'dm';
  showLayers: boolean;
}
interface MapScene {
  kind: 'map-scale';
  title: string;
  segmentsCm: number[];
  metersPerCm: number;
  places: string[];
}
interface PercentScene {
  kind: 'percent';
  title: string;
  marked: number;
  layout: 'square' | 'strip';
  objectsPerCell: number;
  compareObjectsPerCell?: number;
}
interface FireScene {
  kind: 'fire-safety';
  title: string;
  place: string;
  safeExit: string;
  smokyRoute: string;
  view: 'conditions' | 'route';
  fuel: boolean;
  oxygen: boolean;
  heat: boolean;
}

export type ExpeditionSceneModel = VolumeScene | MapScene | PercentScene | ForceTrack | ActionPair | ParallelCircuit | Filtration | FireScene | SpaceModel | CorrectionSceneModel | SpaceObservatoryScene | ForceWorkshopScene | WorkPowerScene | SolidWorkshopScene | SolidConstructionScene | SpatialVolumeScene | NumberRouteScene | MeasurementStationScene | ProgrammingFerryScene | ThermalScene | StatisticsHarborScene | ElectricityHarborScene | RightTriangleScene | AdvancedSolidsScene | EnergyIslandsScene | CircuitWorkshopScene | MaterialsMixturesScene | PhysicsInvestigationScene | LogicWorkshopScene | ChemicalInvestigationScene | WavesObservatoryScene | AtomicWorldScene | CarbonKitchenScene | MatterCyclesScene | InquiryIslandsScene | ReactionLabScene;
export type ExpeditionSliceItem = Item & { sceneModel: ExpeditionSceneModel };
export type ExpeditionSliceDemo = DemoStep & { sceneModel: ExpeditionSceneModel };
export interface ExpeditionSliceSpec extends NodeSpec {
  rev: string;
  item: (r: Rng, phase: Phase) => ExpeditionSliceItem;
  demo: (r: Rng) => ExpeditionSliceDemo[];
}
type Question = Omit<ExpeditionSliceItem, 'tag'>;
type Family = (r: Rng, phase: Phase) => Question;

function expeditionCases(families: Record<string, Family>, transfer: Family): ExpeditionSliceSpec['item'] {
  const item = cases(families, transfer);
  return (r, phase) => item(r, phase) as ExpeditionSliceItem;
}

const text = (x: number, y: number, label: string, size = 14) =>
  `<text x="${x}" y="${y}" fill="currentColor" font-size="${size}" text-anchor="middle" font-weight="650">${label}</text>`;
const line = (x1: number, y1: number, x2: number, y2: number, color = 'currentColor') =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>`;
const arrow = (x: number, y: number, length: number, color: string) => {
  const end = x + length, tail = end - Math.sign(length) * 8;
  return line(x, y, end, y, color) + line(tail, y - 5, end, y, color) + line(tail, y + 5, end, y, color);
};
const card = (art: string, detail: string) => paint(art + detail);
const step = (sceneModel: ExpeditionSceneModel, scene: DemoStep['scene'], say: string): ExpeditionSliceDemo =>
  ({ sceneModel, scene, say });

function volumeArt(model: VolumeScene) {
  const [length, width, height] = model.dimensions;
  const x = 48, y = 144, sx = 20, sy = 15, dx = 12, dy = 8;
  const front = x + length * sx, top = y - height * sy;
  const farX = front + width * dx, farY = top - width * dy;
  const faces = `<path d="M${x} ${y}V${top}l${width * dx} ${-width * dy}H${farX}L${front} ${top}V${y}Z" fill="#96d2d6" stroke="#24536c" stroke-width="2"/>
    <path d="M${front} ${y}V${top}L${farX} ${farY}v${height * sy}Z" fill="#5799ad" stroke="#24536c" stroke-width="2"/>
    <path d="M${x} ${top}H${front}L${farX} ${farY}H${x + width * dx}Z" fill="#c6ebdf" stroke="#24536c" stroke-width="2"/>`;
  const layers = model.showLayers ? Array.from({ length: height - 1 }, (_, i) => {
    const level = y - (i + 1) * sy;
    return line(x, level, front, level, '#24536c') + line(front, level, farX, level - width * dy, '#24536c');
  }).join('') : '';
  const grid = Array.from({ length: length - 1 }, (_, i) => {
    const edge = x + (i + 1) * sx;
    return line(edge, top, edge + width * dx, farY, '#24536c');
  }).join('') + Array.from({ length: width - 1 }, (_, i) => {
    const depth = i + 1;
    return line(x + depth * dx, top - depth * dy, front + depth * dx, top - depth * dy, '#24536c');
  }).join('');
  return card(svg(260, 166, faces + layers + (model.showLayers ? grid : ''), model.title),
    table(['Pituus', 'Leveys', 'Korkeus'], [model.dimensions.map((n) => `${n} ${model.unit}`)]));
}

function volumeQuestion(r: Rng, build: boolean, transfer = false): Question {
  const dimensions: VolumeScene['dimensions'] = transfer ? r.pick([[2, 6, 3], [2, 3, 5], [3, 5, 2]]) : r.pick([[4, 2, 3], [3, 4, 2], [5, 2, 4]]);
  const [length, width, height] = dimensions;
  const unit = transfer ? 'dm' : 'cm';
  const cubic = `${unit}³`;
  const sceneModel: VolumeScene = {
    kind: 'volume', title: transfer ? 'Retkivälineiden arkku' : 'Suorakulmainen varastolaatikko',
    dimensions, unit, showLayers: build,
  };
  const base = length * width;
  const volume = base * height;
  const target = `${length} · ${width} · ${height} ${cubic}`;
  const task: Task = build ? {
    kind: 'build', mode: 'seq', target, max: 6,
    tokens: r.shuffle([String(length), String(width), String(height), '·', '+', unit, `${unit}²`, cubic]),
    whyAt: {
      [`${length} · ${width}`]: 'Pohjan kertolasku kertoo yhden kerroksen. Lisää kerrosten määrä.',
      [`${length} + ${width} + ${height} ${cubic}`]: 'Kerro ensin rivin pituus rivien määrällä. Kerro sitten kerrosten määrällä.',
      [`${length} · ${width} · ${height} ${unit}²`]: 'Neliöyksikkö mittaa pinta-alaa. Tilavuus ilmoitetaan kuutioyksikköinä.',
      [`${length} · ${width} · ${height} ${unit}`]: 'Pituusyksikkö mittaa yhtä reunaa. Tilavuus ilmoitetaan kuutioyksikköinä.',
    },
  } : {
    kind: 'numeric', answer: volume, unit: cubic,
    whyAt: {
      [base]: 'Laskit pohjan eli yhden kerroksen. Kerro vielä kerrosten määrällä.',
      [length + width + height]: 'Mitat kertovat rivin pituuden, rivien määrän ja kerrosten määrän. Kerro ne keskenään.',
    },
  };
  return {
    sceneModel, scene: volumeArt(sceneModel), task,
    say: build ? 'Rakenna kerroslasku järjestyksessä pituus kertaa leveys kertaa korkeus. Lisää lopuksi tilavuusyksikkö.' : 'Laske laatikon tilavuus.',
    hint: 'Selvitä ensin yhden kerroksen kuutioiden määrä. Kuinka monta tällaista kerrosta laatikkoon mahtuu?',
    explain: `Yhdessä kerroksessa on ${length} · ${width} = ${base} yksikkökuutiota. ${height} kerrosta tekee ${volume} ${cubic}.`,
  };
}

const volumeSpec: ExpeditionSliceSpec = {
  id: 'M-GMEAS-05', stop: 'Kolmen mitan laatikko', icon: '📦',
  intro: 'Loikan varastolaatikko tarvitsee tilavuusmerkinnän. Aava näyttää pohjan rivit ja päällekkäiset kerrokset.',
  goal: 'Opit laskemaan laatikon tilavuuden kolmesta mitasta ja valitsemaan kuutioyksikön.',
  reward: 'Retkipaikan varastolaatikko saa tilavuusmerkinnän.',
  rev: 'exp690-volume-v1', produce: ['volume-value', 'volume-layers', 'transfer'],
  produceWhat: 'tilavuuden laskemista tai kerroslaskun rakentamista',
  demo: () => {
    const model: VolumeScene = { kind: 'volume', title: 'Laatikon kerrokset', dimensions: [3, 2, 2], unit: 'cm', showLayers: true };
    return [
      step(model, volumeArt(model), 'Yksi kerros on kolme kuutiota pitkä ja kaksi leveä. Kerroksessa on siis 3 kertaa 2 eli 6 yksikkökuutiota.'),
      step(model, volumeArt(model), 'Korkeus on kaksi senttimetriä. Kaksi kuutiokerrosta tekee 6 kertaa 2 eli 12 kuutiosenttimetriä.'),
    ];
  },
  item: expeditionCases({
    'volume-value': (r) => volumeQuestion(r, false),
    'volume-layers': (r) => volumeQuestion(r, true),
  }, (r) => volumeQuestion(r, false, true)),
};

function mapArt(model: MapScene) {
  let x = 26;
  let route = '';
  model.places.forEach((_, i) => {
    const next = model.segmentsCm[i];
    if (next !== undefined) {
      const width = next * 24;
      route += line(x, 53, x + width, 53, '#203e55') + text(x + width / 2, 43, `${next} cm`);
    }
    route += `<circle cx="${x}" cy="53" r="6" fill="#efd169" stroke="#203e55" stroke-width="2"/>` + text(x, 77, String(i + 1));
    x += (next ?? 0) * 24;
  });
  const rows = model.segmentsCm.map((segment, i) => [`${model.places[i]} – ${model.places[i + 1]}`, `${segment} cm`]);
  return card(svg(270, 100, `<path d="M0 20Q80 2 119 14T270 7V95Q192 79 142 90T0 92Z" fill="#a1c8a1"/>` + route, model.title),
    table(['Reittiväli', 'Kartalla'], rows) +
    `<p><strong>Mittakaava: 1 cm kartalla vastaa ${model.metersPerCm} m maastossa.</strong></p>`);
}

function scaleQuestion(r: Rng, segments: 1 | 2, transfer = false): Question {
  const model: MapScene = {
    kind: 'map-scale',
    title: transfer ? 'Kartta lintutornille' : 'Retkikartta',
    segmentsCm: segments === 2 ? [r.int(2, 4), r.int(2, 5)] : [r.int(2, 7)],
    metersPerCm: transfer ? r.pick([25, 150, 250]) : r.pick([20, 50, 100]),
    places: transfer ? ['Pitkospuut', 'Lintutorni'] : segments === 2 ? ['Laituri', 'Opaste', 'Kallio'] : ['Laituri', 'Kallio'],
  };
  const cm = model.segmentsCm.reduce((a, b) => a + b, 0);
  const answer = cm * model.metersPerCm;
  return {
    sceneModel: model, scene: mapArt(model),
    say: segments === 2 ? 'Kuinka monta metriä on koko reitti laiturilta kallioon opasteen kautta?' : 'Kuinka pitkä kartan merkitty reitti on maastossa? Vastaa metreinä.',
    hint: 'Laske reitin senttimetrit kartalla. Kerro sitten yhden karttasenttimetrin maastomatkalla.',
    explain: `Reitti on kartalla ${model.segmentsCm.join(' + ')}${segments === 2 ? ` = ${cm}` : ''} cm. Maastossa matka on ${cm} · ${model.metersPerCm} m = ${answer} m.`,
    task: { kind: 'numeric', answer, unit: 'm', whyAt: {
      [cm]: 'Tuo on reitin pituus kartalla. Yksi kartan senttimetri vastaa mittakaavassa kerrottua metrimäärää.',
      [model.metersPerCm]: 'Tuo vastaa yhtä karttasenttimetriä. Reitillä on useampia senttimetrejä.',
    } },
  };
}

const scaleSpec: ExpeditionSliceSpec = {
  id: 'M-SCALE-03', stop: 'Matka kartasta rantaan', icon: '🗺️',
  intro: 'Aava ja Loikka suunnittelevat retkeä. Kartalla lyhyt viiva tarkoittaa maastossa pidempää matkaa.',
  goal: 'Opit lukemaan kartalta reitin ja laskemaan maastomatkan mittakaavasta.',
  reward: 'Retkikarttaan merkitään maastomatka ja ystävät pääsevät havaintopaikalle.',
  rev: 'exp690-map-scale-v1', produce: ['scale-single', 'scale-stages', 'transfer'], produceWhat: 'maastomatkan laskemista',
  demo: () => {
    const model: MapScene = { kind: 'map-scale', title: 'Polku majakalle', segmentsCm: [3], metersPerCm: 50, places: ['Ranta', 'Majakka'] };
    return [step(model, mapArt(model), 'Kartalla polku on 3 senttimetriä. Yksi senttimetri vastaa 50 metriä, joten 3 kertaa 50 metriä on 150 metriä.')];
  },
  item: expeditionCases({ 'scale-single': (r) => scaleQuestion(r, 1), 'scale-stages': (r) => scaleQuestion(r, 2) }, (r) => scaleQuestion(r, 1, true)),
};

function percentArt(model: PercentScene) {
  const columns = model.layout === 'square' ? 10 : 20;
  const cell = model.layout === 'square' ? 14 : 11;
  const rows = 100 / columns;
  const grid = Array.from({ length: 100 }, (_, i) => {
    const x = (i % columns) * cell, y = Math.floor(i / columns) * cell;
    const mark = i < model.marked;
    return `<rect x="${x}" y="${y}" width="${cell - 1}" height="${cell - 1}" rx="1" fill="${mark ? '#238082' : '#ecf3e3'}" stroke="#567373" stroke-width=".6"/>` +
      (mark ? line(x + 4, y + cell - 4, x + cell - 4, y + 4, '#fff') : '');
  }).join('');
  const compare = model.compareObjectsPerCell;
  const boards = compare === undefined ? svg(cell * columns, cell * rows, grid, 'Sadan ruudun ikkuna. Käytössä olevissa ruuduissa on viiva.')
    : table(['Ikkuna A', 'Ikkuna B'], [[`${model.objectsPerCell} tarviketta ruudussa`, `${compare} tarviketta ruudussa`]]) +
      svg(cell * columns, cell * rows, grid, 'Molemmissa ikkunoissa sama sadan ruudun kuvio.');
  const rowDescriptions = Array.from({ length: rows }, (_, row) => {
    const marked = Math.min(columns, Math.max(0, model.marked - row * columns));
    return `<li>Rivi ${row + 1}: ${marked} merkittyä ruutua ${columns} ruudusta.</li>`;
  }).join('');
  return card(boards, '<p>Kokonainen ikkuna: 100 yhtä suurta ruutua.</p>' +
    `<details><summary>Ruudukon rivit tekstinä</summary><ol>${rowDescriptions}</ol></details>`);
}

function percentQuestion(r: Rng, compare: boolean, transfer = false): Question {
  const model: PercentScene = {
    kind: 'percent', title: compare ? 'Kaksi tarvikeikkunaa' : transfer ? 'Laiturin pitkä tilanneikkuna' : 'Majakan tilanneikkuna',
    marked: r.pick([12, 24, 35, 46, 57, 68]), layout: transfer ? 'strip' : 'square',
    objectsPerCell: 1, ...(compare ? { compareObjectsPerCell: 2 } : {}),
  };
  const task: Task = compare
    ? choose(r, txt('Sama prosenttiosuus, eri määrä tarvikkeita.'), [
      txt('Eri prosenttiosuus, sama määrä tarvikkeita.'),
      txt('Sama prosenttiosuus, sama määrä tarvikkeita.'),
    ], [
      'Molemmissa on yhtä monta merkittyä ruutua sadasta, joten prosenttiosuus on sama.',
      'Samasta ruutuosuudesta huolimatta B-ikkunan ruuduissa on kaksi tarviketta yhden sijaan.',
    ], 1)
    : { kind: 'numeric', answer: model.marked, unit: '%', whyAt: {
      [100 - model.marked]: 'Laskit tyhjät ruudut. Kysymys koskee merkittyjä ruutuja.',
      [100]: '100 ruutua on kokonainen. Laske niistä vain merkityt ruudut.',
    } };
  return {
    sceneModel: model, scene: percentArt(model), task,
    say: compare ? 'A:n ja B:n sadan ruudun ikkunoissa on sama kuvio. Vertaa prosenttiosuutta ja merkittyjen ruutujen tarvikkeiden määrää.' : 'Kuinka monta prosenttia ikkunan ruuduista on merkitty viivalla?',
    hint: 'Prosentti kertoo, kuinka moni sadasta yhtä suuresta osasta on mukana.',
    explain: compare
      ? `Kummassakin merkittyjä ruutuja on ${model.marked} sadasta eli ${model.marked} %. A:ssa niissä on ${model.marked} tarviketta ja B:ssä ${2 * model.marked}.`
      : `${model.marked} ruutua sadasta tarkoittaa ${model.marked} sadasosaa eli ${model.marked} %.`,
  };
}

const percentSpec: ExpeditionSliceSpec = {
  id: 'M-PCT-01', stop: 'Sadasosan oma merkki', icon: '🔲',
  intro: 'Aava merkitsee majakan tilanneikkunaan osan sadasta ruudusta. Loikka haluaa lukea osuuden yhdellä merkillä.',
  goal: 'Opit lukemaan prosentit sadasosina ja erottamaan prosenttiosuuden kappalemäärästä.',
  reward: 'Aseman tilanneikkuna kertoo, kuinka suuri osuus on käytössä.',
  rev: 'exp690-percent-v1', produce: ['percent-read', 'transfer'], produceWhat: 'prosenttiosuuden ilmoittamista',
  demo: () => {
    const model: PercentScene = { kind: 'percent', title: 'Sadan ruudun tilanneikkuna', marked: 20, layout: 'square', objectsPerCell: 1 };
    return [step(model, percentArt(model), 'Kokonainen on sata yhtä suurta ruutua. Kaksi kymmenen ruudun riviä tekee 20 ruutua sadasta. Osuus on 20 prosenttia.')];
  },
  item: expeditionCases({ 'percent-read': (r) => percentQuestion(r, false), 'percent-compare': (r) => percentQuestion(r, true) }, (r) => percentQuestion(r, false, true)),
};

function forceArt(model: ForceTrack, showMotion = false) {
  const { rightForce, leftForce, initialSpeed, seconds } = model;
  const cart = `<rect x="126" y="47" width="78" height="30" rx="6" fill="#68b3a8" stroke="#224a59" stroke-width="2"/>
    <circle cx="141" cy="83" r="7" fill="#254655"/><circle cx="189" cy="83" r="7" fill="#254655"/>`;
  const forceArrows = (leftForce ? arrow(118, 59, -13 * leftForce, '#a63f41') : '')
    + (rightForce ? arrow(212, 59, 13 * rightForce, '#275b9c') : '');
  const direction = initialSpeed === 0 ? 'Paikallaan' : `${Math.abs(initialSpeed)} m/s ${initialSpeed > 0 ? 'oikealle' : 'vasemmalle'}`;
  const art = svg(330, 109, line(9, 92, 321, 92, '#456878') + cart + forceArrows + text(165, 25, model.vehicle), model.title);
  const motion = showMotion ? table(['Aika', 'Siirtymä alusta'], [0, 1, 2].map((t) => [`${t} s`, `${trackMotion(model, t).displacement} m`])) : '';
  return card(art, table(['Alkuliike', 'Voima vasemmalle', 'Voima oikealle'], [[direction, `${leftForce} N`, `${rightForce} N`]]) +
    `<p>Kitkaton vaakarata. Paino ja tukivoima tasapainossa. Voimat vaikuttavat ${seconds} s.</p>` + motion);
}

function forceQuestion(r: Rng, balanced: boolean, transfer = false): Question {
  const force = r.int(2, 5);
  const model: ForceTrack = {
    kind: 'force-track',
    title: transfer ? 'Kuljetuskelkan jarrutus' : 'Vaunu kitkattomalla radalla',
    vehicle: transfer ? 'Kuljetuskelkka' : 'Mallivaunu',
    initialSpeed: transfer ? -3 : r.pick([2, 3, 4]),
    mass: 2,
    rightForce: balanced ? force : 2,
    leftForce: balanced ? force : 0,
    seconds: 2,
  };
  const { netForce, velocity } = trackMotion(model);
  const result = {
    steady: 'Liike jatkuu samaan suuntaan yhtä nopeasti.',
    stop: 'Liike pysähtyy heti.',
    speedUp: 'Vauhti kasvaa.',
    slowDown: 'Vauhti pienenee.',
  };
  const explain = netForce === 0
    ? 'Vaakavoimat kumoavat toisensa. Nollakokonaisvoimalla jo liikkuva vaunu jatkaa tasaisesti suoraan.'
    : `Kokonaisvoima on ${netForce} N oikealle. Nopeus muuttuu oikealle päin. Koska ${velocity < 0 ? 'vaunu liikkuu aluksi vasemmalle, se hidastuu' : 'vaunu liikkuu aluksi oikealle, se nopeutuu'}.`;
  const correct = netForce === 0 ? 'steady' : velocity < 0 ? 'slowDown' : 'speedUp';
  const why = {
    steady: 'Vaakasuuntainen kokonaisvoima muuttaa nopeutta. Vertaa sen suuntaa alkuliikkeeseen.',
    stop: 'Liike muuttuu voimien vaikutuksesta vähitellen. Nollakokonaisvoimalla liike pysyy tasaisena.',
    speedUp: 'Vauhti kasvaa, kun kokonaisvoima osoittaa samaan suuntaan kuin alkuliike.',
    slowDown: 'Vauhti pienenee, kun kokonaisvoima osoittaa alkuliikkeelle vastakkaiseen suuntaan.',
  };
  const distractors = (Object.keys(result) as (keyof typeof result)[]).filter((key) => key !== correct);
  return {
    sceneModel: model, scene: forceArt(model),
    say: 'Mitä tapahtuu liikkeelle, kun taulun vaakavoimat vaikuttavat?',
    hint: 'Vertaa ensin vastakkaisia vaakavoimia. Katso sitten kokonaisvoiman suunta suhteessa alkuliikkeeseen.',
    task: choose(r, txt(result[correct]), distractors.map((key) => txt(result[key])), distractors.map((key) => why[key]), 1),
    explain,
  };
}

const forceSpec: ExpeditionSliceSpec = {
  id: 'PHY79-FORCE-MOTION', stop: 'Vaunu, joka jatkaa matkaa', icon: '🛤️',
  intro: 'Aava ja Loikka tutkivat vaunua ihanteellisella kitkattomalla vaakaradalla. Loikka arvelee vaunun pysähtyvän heti, kun veto lakkaa.',
  goal: 'Opit ennustamaan, milloin kokonaisvoima muuttaa liikettä ja milloin liike jatkuu tasaisena.',
  reward: 'Vaunun ajosuunnitelmassa tasainen liike ja jarrutus saavat omat merkintänsä.',
  rev: 'exp690-force-track-v1',
  demo: () => {
    const model: ForceTrack = { kind: 'force-track', title: 'Liuku vedon jälkeen', vehicle: 'Mallivaunu', initialSpeed: 2, mass: 2, rightForce: 0, leftForce: 0, seconds: 2 };
    const brake = { ...model, title: 'Jarru vaikuttaa vaunuun', leftForce: 2 };
    return [
      step(model, forceArt(model, true), 'Vedon päätyttyä vaakavoimia ei ole. Vaunu kulkee yhä kaksi metriä joka sekunti.'),
      step(brake, forceArt(brake, true), 'Erillinen jarruvoima vaikuttaa vasemmalle. Vaunu hidastuu ja pysähtyy kahdessa sekunnissa.'),
    ];
  },
  item: expeditionCases({ 'force-balanced': (r) => forceQuestion(r, true), 'force-change': (r) => forceQuestion(r, false) }, (r) => forceQuestion(r, false, true)),
};

function pairArt(model: ActionPair, showPair = false) {
  const forces = pairForces(model);
  const marks = [75, 245];
  const bodies = model.bodies.map((body, i) =>
    `<rect x="${marks[i]! - 53}" y="45" width="106" height="49" rx="12" fill="${i ? '#e7c980' : '#8ccac8'}" stroke="#23495e" stroke-width="2"/>` +
    `<text x="${marks[i]}" y="75" fill="#132e39" font-size="16" font-weight="700" text-anchor="middle">${body}</text>`).join('');
  const arrows = forces.map(({ signedNewtons }, i) =>
    i === 1 || showPair ? arrow(marks[i]!, 35, signedNewtons * 6, '#a63f41') : '').join('');
  const known = forces[1];
  const rows = (showPair ? forces : [known]).map(({ from, on, signedNewtons }) =>
    [from, on, `${Math.abs(signedNewtons)} N ${signedNewtons > 0 ? 'oikealle' : 'vasemmalle'}`]);
  return card(svg(320, 112, bodies + arrows, model.title), table(['Voiman aiheuttaja', 'Voiman kohde', 'Voima'], rows));
}

function actionModel(r: Rng, oar: boolean): ActionPair {
  return {
    kind: 'action-pair', title: oar ? 'Airon lapa ja vesi' : 'Kaksi toisiaan työntävää vaunua',
    bodies: oar ? ['Airon lapa', 'Vesi'] : ['Vaunu A', 'Vaunu B'],
    force: r.int(3, 7),
    directionOnSecond: oar ? -1 : 1,
    context: oar ? 'oar' : 'carts',
  };
}

function actionQuestion(r: Rng, distinguish: boolean, transfer = false): Question {
  const model = actionModel(r, !transfer && distinguish);
  if (transfer) model.title = 'Kahden mallivaunun törmäys';
  const [unknown, known] = pairForces(model);
  const direction = unknown.signedNewtons > 0 ? 'oikealle' : 'vasemmalle';
  const wrongDirection = unknown.signedNewtons > 0 ? 'vasemmalle' : 'oikealle';
  const task: Task = distinguish ? choose(r, txt('Voimat kohdistuvat eri kappaleisiin, joten ne eivät kumoa toisiaan yhden kappaleen voimakuvassa.'), [
    txt('Voimat ovat vastakkaiset, joten ne kumoavat toisensa kummassakin kappaleessa.'),
    txt('Vain liikkuva kappale saa voiman.'),
  ], [
    'Yhden kappaleen kokonaisvoimaan lasketaan vain juuri siihen kappaleeseen kohdistuvat voimat.',
    'Vuorovaikutuksessa molempiin kappaleisiin kohdistuu voima samalla hetkellä.',
  ], 1) : {
    kind: 'place',
    slots: [{ id: 'body', text: 'Vastavoiman kohde' }, { id: 'force', text: 'Vastavoiman suuruus ja suunta' }],
    tokens: r.shuffle([
      { id: 'first', text: unknown.on }, { id: 'second', text: known.on },
      { id: 'opposite', text: `${model.force} N ${direction}` },
      { id: 'same', text: `${model.force} N ${wrongDirection}` },
      { id: 'larger', text: `${model.force + 2} N ${direction}` },
    ]),
    answer: { body: 'first', force: 'opposite' },
    why: { body: 'Vastavoima kohdistuu toiseen kappaleeseen, joka aiheutti taululla näkyvän voiman.', force: 'Parin voimat ovat yhtä suuria ja vastakkaissuuntaisia.' },
  };
  return {
    sceneModel: model, scene: pairArt(model),
    say: distinguish ? 'Miksi tämä voimapari ei ole sama asia kuin yhden kappaleen voimatasapaino?'
      : transfer ? 'Vaunut törmäävät. Merkitse taululla näkyvän voiman parin kohde, suuruus ja suunta.'
        : 'Merkitse taululla näkyvän voiman parin kohde, suuruus ja suunta.',
    hint: 'Lue ensimmäisen voiman aiheuttaja ja kohde. Parin toisessa voimassa niiden roolit vaihtuvat.',
    task,
    explain: `Parin toisessa voimassa aiheuttaja on ${unknown.from} ja kohde on ${unknown.on}. Voima on yhtä suuri eli ${model.force} N, ja se osoittaa ${direction}. Voimat kohdistuvat eri kappaleisiin.`,
  };
}

const actionSpec: ExpeditionSliceSpec = {
  id: 'PHY79-ACTIONPAIR', stop: 'Airo ja vesi vastaavat', icon: '🛶',
  intro: 'Ensin Aava näyttää kaksi näkyvää mallivaunua. Sitten Loikka tarkastelee, mitä airon lavan ja veden kosketuksessa tapahtuu.',
  goal: 'Opit sijoittamaan yhtä suuret vastakkaissuuntaiset voimat eri kappaleisiin.',
  reward: 'Mallivene irtoaa rannasta ja airon sekä veden voimat merkitään erikseen.',
  rev: 'exp690-action-pair-v1',
  demo: (r) => {
    const carts = actionModel(r, false);
    const oar = actionModel(r, true);
    return [
      step(carts, pairArt(carts, true), `Vaunu A työntää vaunua B oikealle ${carts.force} newtonin voimalla. B työntää A:ta samalla hetkellä yhtä suurella voimalla vasemmalle.`),
      step(oar, pairArt(oar, true), 'Airon lapa työntää vettä vasemmalle. Vesi työntää airon lapaa oikealle. Nuolet kuuluvat eri kappaleille.'),
    ];
  },
  item: expeditionCases({ 'pair-assign': (r) => actionQuestion(r, false), 'pair-distinguish': (r) => actionQuestion(r, true) }, (r) => actionQuestion(r, false, true)),
};

function circuitArt(model: ParallelCircuit) {
  const isVertical = model.layout === 'vertical';
  const component = (x: number, y: number) =>
    `<circle cx="${x}" cy="${y}" r="10" fill="#eed680" stroke="currentColor" stroke-width="2"/>` +
    line(x - 5, y - 5, x + 5, y + 5) + line(x + 5, y - 5, x - 5, y + 5);
  const node = (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="5" fill="currentColor"/>`;
  const wires = isVertical
    ? `<path d="M54 27H264V65M264 85v59H54V27M114 27v49m0 20v48M184 27v49m0 20v48" fill="none" stroke="currentColor" stroke-width="2.5"/>` +
      line(253, 65, 275, 65) + line(257, 85, 271, 85) + component(114, 86) + component(184, 86) +
      node(114, 27) + node(184, 27) + node(114, 144) + node(184, 144) +
      text(34, 30, 'A') + text(34, 148, 'B') + text(92, 89, '1') + text(162, 89, '2')
    : `<path d="M40 34H150m20 0h110v103H171m-22 0H40V34m0 49h110m20 0h110" fill="none" stroke="currentColor" stroke-width="2.5"/>` +
      component(160, 34) + component(160, 83) + line(149, 126, 149, 148) + line(171, 130, 171, 144) +
      node(40, 83) + node(280, 83) + text(23, 89, 'A') + text(297, 89, 'B') + text(125, 28, '1') + text(125, 77, '2');
  return card(svg(320, 164, wires, 'Kaksi lamppua on kytketty rinnakkain samojen solmujen A ja B välille.'),
    table(['Mittaus', 'Arvo'], [
      ['Lähteen jännite A:n ja B:n välillä', `${model.voltage} V`],
      [`Haara 1 · ${model.lights[0]}`, `${model.currentsMa[0]} mA`],
      [`Haara 2 · ${model.lights[1]}`, `${model.currentsMa[1]} mA`],
    ]) + '<p>Lähteen jännite on vakio. Johdot ovat ideaaliset.</p>');
}

function circuitModel(r: Rng, equal: boolean, transfer = false): ParallelCircuit {
  const first = r.pick([20, 30, 40]);
  return {
    kind: 'parallel-circuit', title: transfer ? 'Laiturit uudessa piirrosasennossa' : 'Sataman kaksi mallivaloa',
    voltage: r.pick([6, 8, 10]), currentsMa: [first, equal ? first : first + 20],
    lights: transfer ? ['Venesatama', 'Huoltolaituri'] : ['Itälaituri', 'Länsilaituri'],
    layout: transfer ? 'vertical' : 'horizontal',
  };
}

function circuitQuestion(r: Rng, diagnose: boolean, transfer = false): Question {
  const model = circuitModel(r, !diagnose && !transfer, transfer);
  const { branchVolts: [volts], totalCurrentMa } = parallelReadings(model);
  const [first, second] = model.currentsMa;
  const voltageRule = `Molemmissa ${volts} V, sillä haarat ovat samojen solmujen välissä.`;
  const currentRule = `${totalCurrentMa} mA, sillä ${first} mA ja ${second} mA yhdistyvät.`;
  const explain = `${voltageRule} Pääjohdossa virta on ${currentRule}`;
  const task: Task = diagnose
    ? choose(r, txt(`Jännitteet ovat ${volts} V ja ${volts} V yhteisten solmujen takia. Virrat yhdistyvät pääjohdossa, joten virta on ${totalCurrentMa} mA.`), [
      txt(`Jännite jakautuu ${volts / 2} V ja ${volts / 2} V haaroille. Pääjohdossa virta on ${totalCurrentMa} mA.`),
      txt(`Jännite on kummassakin ${volts} V. Siksi virta on molemmissa ${first} mA ja pääjohdossa ${first * 2} mA.`),
    ], [
      'Haarojen molemmat päät ovat samoissa solmuissa. Kumpikin haara saa koko solmujen välisen jännitteen.',
      'Sama jännite ei tarkoita samaa virtaa. Lue molemmat haaravirrat taulusta ja laske ne yhteen.',
    ], 1)
    : {
      kind: 'place',
      slots: [{ id: 'voltage', text: 'Haarojen jännitteet' }, { id: 'current', text: 'Pääjohdon virta' }],
      tokens: r.shuffle([
        { id: 'same-voltage', text: voltageRule },
        { id: 'half-voltage', text: `Molemmissa ${volts / 2} V, sillä lähteen jännite jakautuu.` },
        { id: 'sum-current', text: currentRule },
        { id: 'single-current', text: `${first} mA, sillä vain ensimmäisen haaran virta jatkaa pääjohtoon.` },
      ]),
      answer: { voltage: 'same-voltage', current: 'sum-current' },
      why: {
        voltage: 'Haarat yhdistävät samat kaksi solmua, joten jännite on kummassakin sama kuin solmujen välillä.',
        current: 'Haaroissa mitatut virrat palaavat yhteiseen johtoon ja lasketaan yhteen.',
      },
    };
  return {
    sceneModel: model, scene: circuitArt(model), task,
    say: diagnose ? 'Kumpikin lamppu toimii, vaikka mitatut haaravirrat eroavat. Valitse tauluun molempia mittauksia selittävä merkintä.'
      : 'Päätä samasta piiristä sekä haarojen jännitteet että pääjohdon virta. Yhdistä perustelut.',
    hint: 'Katso haarojen päätepisteet, solmut A ja B. Lue sitten kummankin haaran virta mittaustaulusta.',
    explain,
  };
}

const circuitSpec: ExpeditionSliceSpec = {
  id: 'PHY79-PARALLEL', stop: 'Kaksi rantaa, yhteinen lähde', icon: '💡',
  intro: 'Loikka haluaa valaista kaksi mallilaituria. Aava yhdistää molemmat valot samoihin kahteen solmuun.',
  goal: 'Opit päättelemään rinnankytkennän haarojen jännitteet ja virtojen summan samoista mittauksista.',
  reward: 'Sataman pienoismallin molemmat laiturit valaistuvat.',
  rev: 'exp690-parallel-circuit-v1',
  demo: () => {
    const model: ParallelCircuit = { kind: 'parallel-circuit', title: 'Laiturivalojen mittaukset', voltage: 6, currentsMa: [20, 40], lights: ['Itälaituri', 'Länsilaituri'], layout: 'horizontal' };
    return [
      step(model, circuitArt(model), 'Molemmat haarat ovat samojen solmujen A ja B välissä. Jännite on kummassakin kuusi volttia.'),
      step(model, circuitArt(model), 'Haaroista mitataan 20 ja 40 milliampeeria. Pääjohdossa ne yhdistyvät 60 milliampeeriksi.'),
    ];
  },
  item: expeditionCases({ 'parallel-infer-both': (r) => circuitQuestion(r, false), 'parallel-unequal-reason': (r) => circuitQuestion(r, true) }, (r) => circuitQuestion(r, false, true)),
};

function filtrationArt(model: Filtration) {
  const { grainName, poreMicrometers, grainMicrometers, view } = model;
  if (view === 'ion') {
    const ion = (x: number, y: number, label: string, color: string) =>
      `<circle cx="${x}" cy="${y}" r="19" fill="${color}"/>` +
      `<text x="${x}" y="${y + 5}" fill="#152d36" font-size="14" text-anchor="middle">${label}</text>`;
    return card(svg(300, 116, ion(98, 61, 'Na⁺', '#9dcacc') + ion(202, 61, 'Cl⁻', '#f5db8d'), 'Erillinen ionimalli, ei mittakaavassa.'),
      '<p>Ionimalli: liuenneen suolan ionit ovat vedessä. Kuvamerkkien kokoa ei verrata suodattimen huokosiin tai hiekanjyviin.</p>');
  }
  if (view === 'grain') {
    const w = poreMicrometers / 2, d = grainMicrometers / 2;
    return card(svg(300, 118,
      `<rect x="28" y="72" width="${122 - w / 2}" height="12" rx="2" fill="#63a7b0"/>
       <rect x="${150 + w / 2}" y="72" width="${122 - w / 2}" height="12" rx="2" fill="#63a7b0"/>
       <circle cx="150" cy="${66 - d / 2}" r="${d / 2}" fill="#c18b57"/>` +
      text(150, 106, 'Rae ja huokonen, sama suurennus'), 'Rakeen ja suodattimen huokosen kokojen vertailu.'),
      table(['Rae', 'Huokonen'], [[`${grainName}: ${grainMicrometers} µm`, `${poreMicrometers} µm`]]) +
      `<p>Seoksessa on vettä${model.dissolvedSalt ? ' ja siihen liuennutta suolaa' : ''}.</p>`);
  }
  return card(svg(300, 156,
    '<path d="M58 28h184l-77 49v13h-30V77Z" fill="#d5e6df" stroke="#25485a" stroke-width="2.5"/>' +
    '<path d="M81 40h138l-69 40Z" fill="#b07e51"/><path d="M115 101v41h70v-41M117 126h66v14h-66Z" fill="#74c3ce" stroke="#25485a" stroke-width="2.5"/>' +
    text(150, 19, 'Hiekkavesi') + text(222, 124, 'Suodos'), 'Suodatuksen makromalli. Hiekkavesi, suodatin ja suodos.'),
  '<p>Makromalli: näkyvät hiekanjyvät jäävät suodattimeen ja vesi valuu astiaan. Suodoksen kirkkaus ei osoita, että sitä voi juoda.</p>');
}

function filterQuestion(r: Rng, dissolved: boolean, transfer = false): Question {
  const pore = r.pick([40, 60, 80]);
  const model: Filtration = {
    kind: 'filtration', title: transfer ? 'Rantaveden uusi näyte' : 'Hiekan ja veden erotus',
    poreMicrometers: pore, grainMicrometers: dissolved || transfer ? pore + 40 : pore + r.pick([-20, 20]),
    grainName: transfer ? 'Rannan hieno hiekka' : 'Hiekka', dissolvedSalt: dissolved, view: 'grain',
  };
  const result = filtrationOutcome(model);
  const relation = result.grainRetained ? 'suurempi' : 'pienempi';
  const comparison = `Rae on ${model.grainMicrometers} µm ja huokonen ${pore} µm. Rae on huokosta ${relation}.`;
  const explain = dissolved
    ? `${comparison} Rakeet jäävät suodattimeen. Vesi ja liuennut suola kulkevat läpi. Kirkkaasta suodoksesta ei voi päätellä juomakelpoisuutta.`
    : `${comparison} Rae ${result.grainRetained ? 'jää suodattimeen' : 'mahtuu huokosen läpi'} ja vesi kulkee läpi.`;
  const task: Task = dissolved ? choose(r,
    txt('Rakeet jäävät. Vesi ja liuennut suola menevät läpi. Juomakelpoisuutta ei voi päätellä.'),
    [
      txt('Rakeet ja liuennut suola jäävät. Vain vesi menee läpi.'),
      txt('Rakeet jäävät. Vesi ja liuennut suola menevät läpi. Kirkas suodos on juotavaa.'),
      txt('Rakeet, vesi ja liuennut suola menevät kaikki läpi.'),
    ], [
      'Liuennut suola kulkee veden mukana tämän karkean suodattimen läpi.',
      'Kirkkaudesta ei näe liuenneita aineita eikä juomakelpoisuutta.',
      'Annettu rae on huokosta suurempi, joten se jää suodattimeen.',
    ], 1) : choose(r, txt(result.grainRetained ? 'Rae jää. Vesi menee läpi.' : 'Rae ja vesi menevät läpi.'), [
      txt(result.grainRetained ? 'Rae ja vesi menevät läpi.' : 'Rae jää. Vesi menee läpi.'),
      txt('Rae ja vesi jäävät suodattimeen.'),
    ], [comparison, 'Vesi kulkee tämän suodattimen huokosista läpi.'], 1);
  return {
    sceneModel: model, scene: filtrationArt(model), task,
    say: dissolved ? 'Mitä jää suodattimeen, mitä menee läpi ja mitä kirkkaudesta voi päätellä?' : 'Vertaa raetta ja huokosta. Mitkä aineet mahtuvat tämän suodattimen läpi?',
    hint: 'Vertaa raekokoa ja huokoskokoa. Mieti erikseen veteen liuenneita aineita.',
    explain,
  };
}

const filtrationSpec: ExpeditionSliceSpec = {
  id: 'CHEM79-FILTRATION', stop: 'Hiekan oma portti', icon: '🧪',
  intro: 'Sulan suodattimen läpi valuu kirkkaampaa vettä. Aava selvittää, mitkä aineet jäivät suodattimeen ja mitkä jatkoivat matkaa.',
  goal: 'Opit ennustamaan annetun suodattimen läpäisyn ja tulkitsemaan, mitä kirkkaus kertoo.',
  reward: 'Hiekkajyvät saadaan talteen ja suodoksen koostumus merkitään havaintotauluun.',
  rev: 'exp690-filtration-v1',
  demo: () => {
    const macro: Filtration = { kind: 'filtration', title: 'Hiekkavesi astiassa', poreMicrometers: 60, grainMicrometers: 100, grainName: 'Hiekka', dissolvedSalt: true, view: 'macro' };
    const grain: Filtration = { ...macro, title: 'Suurennettu rae ja huokonen', view: 'grain' };
    const ion: Filtration = { ...macro, title: 'Erillinen liuenneen suolan ionimalli', view: 'ion' };
    return [
      step(macro, filtrationArt(macro), 'Tässä astiassa näkyy hiekkaa. Suodatin kerää jyvät ja suodos valuu ala-astiaan.'),
      step(grain, filtrationArt(grain), 'Suurennoksessa rae on huokosta suurempi. Tässä mallissa se jää suodattimeen.'),
      step(ion, filtrationArt(ion), 'Liuenneen suolan ionit näkyvät tässä erillisessä mallissa. Ne kulkevat veden mukana suodokseen. Kirkkaus ei kerro, voiko vettä juoda.'),
    ];
  },
  item: expeditionCases({ 'filter-size': (r) => filterQuestion(r, false), 'filter-dissolved': (r) => filterQuestion(r, true) }, (r) => filterQuestion(r, true, true)),
};

const fireConditions = [
  { key: 'fuel', label: 'Palava aine', detail: 'Palava aine kuluu reaktiossa.' },
  { key: 'oxygen', label: 'Happi', detail: 'Tässä mallissa palaminen tarvitsee ilmaa tai muuta hapen lähdettä.' },
  { key: 'heat', label: 'Riittävä lämpö', detail: 'Tässä mallissa lämpöä tarvitaan syttymiseen ja palamisen jatkumiseen.' },
] as const;

export function fireArt(model: FireScene) {
  if (model.view === 'conditions') {
    return card(svg(312, 132, '<path d="M156 25L261 106H51Z" fill="none" stroke="#745031" stroke-width="3"/>' +
      '<circle cx="156" cy="25" r="12" fill="#e6bd68"/><circle cx="51" cy="106" r="12" fill="#89c8be"/><circle cx="261" cy="106" r="12" fill="#d59174"/>' +
      text(156, 81, 'Palamisen ehdot'), 'Palamisen kolmen ehdon mallitaulu.'),
    table(['Ehto', 'Mallissa'], fireConditions.map(({ key, label }) => [label, model[key] ? 'On' : 'Puuttuu'])));
  }
  return card(svg(312, 135, '<rect x="113" y="38" width="86" height="66" rx="12" fill="#ecd29b"/>' +
    arrow(113, 70, -70, '#327a64') + arrow(199, 70, 70, '#895448') +
    text(156, 66, model.place, 12) + text(156, 84, 'Aava ja ryhmä', 12) +
    text(62, 114, 'Savuttomaan suuntaan', 10) + text(254, 114, 'Savua', 10), 'Kuvitteellinen turvakartta, jossa on savuton reitti ja savuinen reitti.'),
  table(['Tässä tilanteessa', 'Havainto'], [[model.safeExit, 'Savuton reitti turvapaikalle'], [model.smokyRoute, 'Savua']]) +
    '<p>Aava on ryhmän aikuinen. Pelastusryhmä hoitaa palon.</p>');
}

function fireModel(place: string, safeExit: string, smokyRoute: string, view: FireScene['view']): FireScene {
  return { kind: 'fire-safety', title: 'Metsän yhteinen turvapiiri', place, safeExit, smokyRoute, view, fuel: true, oxygen: true, heat: true };
}

function fireQuestion(r: Rng, route: boolean, transfer = false): Question {
  const model = transfer
    ? fireModel('Retkivaja', 'Pihaportti', 'Takahuone', 'route')
    : fireModel('Retkikatos', 'Laituripolku', 'Varastopolku', route ? 'route' : 'conditions');
  if (!route) {
    const missing = r.pick(fireConditions);
    model[missing.key] = false;
    const wrong = fireConditions.filter(({ key }) => key !== missing.key);
    return {
      sceneModel: model, scene: fireArt(model),
      say: 'Jatkuuko palo taulun mallissa? Valitse havaintoon sopiva selitys.',
      hint: 'Tarkista palava aine, happi ja riittävä lämpö erikseen.',
      task: choose(r, txt(`Palo ei jatku. Puuttuva ehto: ${missing.label}.`),
        [txt('Palo jatkuu, koska kaksi ehtoa riittää.'), ...wrong.map(({ label }) => txt(`Palo ei jatku. Puuttuva ehto: ${label}.`))],
        ['Tässä mallissa kaikkien kolmen ehdon on oltava yhtä aikaa voimassa.', ...wrong.map(({ label }) => `${label} on tässä mallissa mukana. Katso, mikä ehto puuttuu.`)], 1),
      explain: `${missing.label} puuttuu. ${missing.detail} Kaikki kolme ehtoa tarvitaan tässä mallissa.`,
    };
  }
  const reason = `Ryhmä siirtyy turvaan. Savuton reitti on ${model.safeExit.toLowerCase()}.`;
  const report = 'Aava varmistaa turvasta, että apu saa tiedon.';
  const task: Task = transfer ? {
    kind: 'place',
    slots: [{ id: 'route', text: 'Reitti turvaan' }, { id: 'report', text: 'Apu saa tiedon' }],
    tokens: r.shuffle([
      { id: 'safe', text: `${model.safeExit}: savuton reitti` },
      { id: 'smoke', text: `${model.smokyRoute}: lyhyempi reitti savun läpi` },
      { id: 'adult', text: 'Aava ilmoittaa turvasta hätänumeroon, mitä tapahtui ja missä.' },
      { id: 'wait', text: 'Aava jää odottamaan, että joku muu tekee ilmoituksen.' },
    ]),
    answer: { route: 'safe', report: 'adult' },
    why: {
      route: 'Savua vältetään. Kartassa on savuton reitti turvapaikalle.',
      report: 'Aava varmistaa, että hätäkeskus saa tiedon tapahtumasta ja paikasta.',
    },
  } : choose(r, txt(`${reason} ${report}`), [
    txt('Ryhmä jää paikalle katsomaan, lisääntyykö savu. Ilmoitus tehdään vasta sen jälkeen.'),
    txt(`Ryhmä käyttää savuista oikoreittiä. Reitti on ${model.smokyRoute.toLowerCase()}. Aava ilmoittaa perillä.`),
    txt(`${reason} Ryhmä jää odottamaan, että joku muu huomaa palon.`),
  ], [
    'Tässä tilanteessa on turvallinen poistumisreitti. Ryhmä siirtyy heti turvaan ja Aava varmistaa, että apu saa tiedon.',
    'Savu on vaarallista. Kartassa on savuton reitti turvapaikalle.',
    'Aava varmistaa hätäilmoituksen turvasta. Hän ei jää odottamaan, että joku muu ilmoittaisi.',
  ], 1);
  return {
    sceneModel: model, scene: fireArt(model), task,
    say: transfer ? 'Retkivajassa näkyy savua. Merkitse ryhmän reitti ja ilmoituspäätös erikseen.' : 'Aava näkee savua. Miten ryhmä pääsee turvaan ja apu saa tiedon?',
    hint: 'Seuraa savutonta reittiä ja mieti, kuka varmistaa avun kutsumisen turvasta.',
    explain: `${reason} ${report} Aava kertoo hätänumeroon 112, mitä tapahtui ja missä. Pelastusryhmä hoitaa palon.`,
  };
}

const fireSpec: ExpeditionSliceSpec = {
  id: 'CHEM79-FIRE-SAFE', stop: 'Metsän yhteinen turvapiiri', icon: '🛟',
  intro: 'Aava pitää retkiryhmän turvassa. Sulka välittää havaintoja aikuisten pelastusryhmälle, ja Loikka tutkii palamisen ehtoja mallitaululta.',
  goal: 'Opit palamisen ehdot ja tunnistamaan turvallisen poistumis- ja ilmoittamispäätöksen kuvitteellisessa tilanteessa.',
  reward: 'Aikuisten pelastusryhmä hoitaa kuvitteellisen tilanteen. Ystävät pysyvät turvapaikalla ja odottavat lupaa palata.',
  rev: 'exp690-fire-safety-v1',
  demo: () => {
    const model = fireModel('Retkikatos', 'Laituripolku', 'Varastopolku', 'conditions');
    const route: FireScene = { ...model, view: 'route' };
    return [
      step(model, fireArt(model), 'Tässä palamisen mallissa tarvitaan palava aine, happea ja riittävästi lämpöä. Jos jokin ehto puuttuu, palo ei jatku mallissa.'),
      step(route, fireArt(route), 'Kuvitteellisessa tilanteessa Aava ohjaa ryhmän savutonta reittiä turvaan ja varmistaa hätäilmoituksen. Pelastusryhmä hoitaa palon.'),
    ];
  },
  item: expeditionCases({ 'fire-conditions': (r) => fireQuestion(r, false), 'fire-safe-route': (r) => fireQuestion(r, true) }, (r) => fireQuestion(r, true, true)),
};

const spaceTitles: Record<SpaceModel['mode'], string> = {
  size: 'Lähiavaruus · koko',
  distance: 'Lähiavaruus · etäisyys',
  day: 'Maan pyöriminen · yksi vuorokausi',
  seasons: 'Maan kierto · yksi vuosi',
};
const spaceModel = (mode: SpaceModel['mode'], rotation: SpaceModel['rotation'] = 0, orbit: SpaceModel['orbit'] = 'june'): SpaceModel =>
  ({ kind: 'space', title: spaceTitles[mode], mode, rotation, orbit });
const km = (n: number) => n.toLocaleString('fi-FI') + ' km';

export function spaceArt(model: SpaceModel) {
  const twoSites = model.sites === 2;
  const { mode } = model;
  if (mode === 'size') {
    const body = (x: number, radius: number, name: string, color: string) =>
      `<circle cx="${x}" cy="51" r="${radius}" fill="${color}"/>` + text(x, 103, name);
    return card(svg(315, 113, body(58, 12, 'Kuu', '#93a8b0') + body(156, 23, 'Maa', '#67b1b0') + body(256, 37, 'Aurinko', '#e7c167'), model.title),
      table(['Kohde', 'Halkaisija noin'], [['Kuu', km(spaceDiametersKm.moon)], ['Maa', km(spaceDiametersKm.earth)], ['Aurinko', km(spaceDiametersKm.sun)]]) +
      '<p>Kuvakkeet ovat tunnuksia. Vertaa kokoa taulukon halkaisijoista.</p>');
  }
  if (mode === 'distance') {
    return card(svg(315, 115,
      line(51, 56, 265, 56, '#6d8492') +
      '<circle cx="51" cy="56" r="14" fill="#67b1b0"/><circle cx="103" cy="56" r="8" fill="#93a8b0"/><circle cx="265" cy="56" r="24" fill="#e7c167"/>' +
      text(51, 102, 'Maa') + text(103, 102, 'Kuu') + text(265, 102, 'Aurinko'), model.title),
      table(['Kohdepari', 'Keskimääräinen etäisyys noin'], [
        ['Maa – Kuu', km(meanSpaceDistancesKm.earthMoon)], ['Maa – Aurinko', km(meanSpaceDistancesKm.earthSun)],
      ]) + '<p>Kaavio osoittaa kohdeparit. Vertaa etäisyyksiä taulukon kilometreistä.</p>');
  }
  const light = spaceLight(model);
  const sunX = mode === 'day' || light.sunDirection < 0 ? 48 : 272;
  const earthX = 160;
  const sunLeft = sunX < earthX;
  const litHalf = `M${earthX} 36a42 42 0 0 ${sunLeft ? 0 : 1} 0 84Z`;
  const globe = `<circle cx="${earthX}" cy="78" r="42" fill="#24485f"/><path d="${litHalf}" fill="#a0c9ab"/>
    <circle cx="${sunX}" cy="78" r="23" fill="#e7c167"/>` +
    text(sunX, 122, 'Aurinko') + text(earthX, 141, 'Maa');
  if (mode === 'day') {
    const a = model.rotation === 0 ? 135 : 185;
    const b = 320 - a;
    const marker = (x: number, label: string) =>
      `<circle cx="${x}" cy="78" r="9" fill="#fff4c7" stroke="#142c3a" stroke-width="1.5"/>
       <text x="${x}" y="82" fill="#142c3a" font-size="10" text-anchor="middle">${label}</text>`;
    const position = model.rotation === 0 ? 'A on Aurinkoon päin olevalla puolella' : 'A on Auringosta poispäin olevalla puolella';
    return card(svg(320, 152, globe + arrow(81, 78, 29, '#ba923b') + marker(a, 'A') + (twoSites ? marker(b, 'B') : ''), model.title),
      `<p>${position}${twoSites ? ' ja B vastakkaisella puolella' : ''}. Aurinko valaisee Maasta aina siihen päin olevan puolen. Kaavio ei ole mittakaavassa.</p>`);
  }
  const axis = light.axis;
  const reach = 57;
  return card(svg(320, 152, globe +
    line(earthX - axis.x * reach, 78 - axis.y * reach, earthX + axis.x * reach, 78 + axis.y * reach, '#b26b39') +
    text(earthX + axis.x * reach - 14, 23, 'P', 12) + text(earthX - axis.x * reach + 14, 134, 'E', 12), model.title),
    '<p>P on pohjoisnapa ja E etelänapa. Akselin suunta säilyy vuoden kierrossa. Mallin kiertorata on ympyrä ja kuvakkeiden koot kaaviomaisia.</p>');
}

function spaceQuestion(r: Rng, mode: SpaceModel['mode'], transfer = false): Question {
  const model = spaceModel(mode,
    mode === 'day' ? r.pick([0, 180]) : 0,
    mode === 'seasons' ? r.pick(['june', 'december']) : 'june',
  );
  if (transfer) model.sites = 2;
  const scene = spaceArt(model);
  if (mode === 'size') {
    const ordered = Object.entries(spaceDiametersKm).sort(([, a], [, b]) => a - b).map(([key]) => ({ moon: 'Kuu', earth: 'Maa', sun: 'Aurinko' })[key]!);
    return {
      sceneModel: model, scene, say: 'Mikä on kohteiden kokojärjestys pienimmästä suurimpaan?',
      hint: 'Halkaisija on matka kohteen poikki sen keskipisteen kautta. Vertaa taulukon lukuja.',
      task: choose(r, txt(ordered.join(' – ')), [txt('Maa – Kuu – Aurinko'), txt('Aurinko – Maa – Kuu')], [
        'Kuun halkaisija on Maan halkaisijaa pienempi.',
        'Taulukossa Auringon halkaisija on suurin. Aloita pienimmästä.',
      ], 1),
      explain: 'Kuun halkaisija on pienin, Maa on Kuuta suurempi ja Aurinko on näistä suurin.',
    };
  }
  if (mode === 'distance') {
    const moonNearer = meanSpaceDistancesKm.earthMoon < meanSpaceDistancesKm.earthSun;
    return {
      sceneModel: model, scene, say: 'Kumpi kohde on keskimäärin lähempänä Maata?',
      hint: 'Vertaa etäisyyksiä Maasta. Käytä taulukkoa.',
      task: choose(r, txt(moonNearer ? 'Kuu' : 'Aurinko'), [txt(moonNearer ? 'Aurinko' : 'Kuu'), txt('Ne ovat keskimäärin yhtä kaukana.')], [
        'Maa–Aurinko-etäisyys on taulukossa Maa–Kuu-etäisyyttä suurempi.',
        'Taulukon keskimääräiset etäisyydet ovat eri suuria.',
      ]),
      explain: `Kuu on keskimäärin ${km(meanSpaceDistancesKm.earthMoon)} Maasta. Aurinko on noin ${km(meanSpaceDistancesKm.earthSun)} päässä.`,
    };
  }
  const light = spaceLight(model);
  if (mode === 'seasons') {
    const season = light.northTiltedTowardSun ? 'kesä' : 'talvi';
    const opposite = light.northTiltedTowardSun ? 'talvi' : 'kesä';
    return {
      sceneModel: model, scene,
      say: 'Kumpi vuodenaika on mallin tässä kohdassa pohjoisella pallonpuoliskolla?',
      hint: 'Katso, kallistuuko pohjoispää Auringon suuntaan vai siitä poispäin.',
      task: choose(r, txt(`Pohjoisessa on ${season}, koska akselin pohjoispää on kallistunut ${light.northTiltedTowardSun ? 'Aurinkoon päin' : 'Auringosta poispäin'}.`), [
        txt(`Pohjoisessa on ${opposite}. Vastaus määräytyy Auringon ja Maan välisestä etäisyydestä.`),
        txt('Molemmilla pallonpuoliskoilla on kesä samaan aikaan.'),
      ], [
        'Vuodenajat johtuvat akselin kallistuksesta. Tässä kiertoratamallissa etäisyys Aurinkoon pysyy samana.',
        'Toinen pallonpuolisko kallistuu Aurinkoa kohti ja toinen poispäin.',
      ], 1),
      explain: `Pohjoisessa on ${season} ja etelässä ${opposite}. Aurinkoa kohti kallistuvalla pallonpuoliskolla päivät ovat pitempiä ja Auringon valo osuu pintaan suoremmin.`,
    };
  }
  const daySite = light.islandInDaylight ? 'A' : 'B';
  const nightSite = light.islandInDaylight ? 'B' : 'A';
  const task: Task = transfer ? choose(r,
    txt(`Paikassa ${daySite} on päivä ja paikassa ${nightSite} yö. Maa pyörii akselinsa ympäri.`), [
      txt(`Paikassa ${nightSite} on päivä ja paikassa ${daySite} yö. Maa pyörii akselinsa ympäri.`),
      txt(`Paikassa ${daySite} on päivä ja paikassa ${nightSite} yö, koska Maa kiertää Auringon ympäri vuorokaudessa.`),
      txt('Molemmissa paikoissa on samaan aikaan päivä.'),
    ], [
      'Katso kumpi paikka on Auringon valaisemalla puolella juuri nyt.',
      'Vuorokausi tulee Maan pyörimisestä oman akselinsa ympäri. Kierros Auringon ympäri kestää vuoden.',
      'Kerrallaan Auringon valo osuu vain Aurinkoon päin olevalle puolelle.',
    ], 1) : choose(r,
    txt(light.islandInDaylight ? 'Päivä, koska paikka A on valaistulla puolella.' : 'Yö, koska paikka A on varjon puolella.'), [
      txt(light.islandInDaylight ? 'Yö, koska paikka A on varjon puolella.' : 'Päivä, koska paikka A on valaistulla puolella.'),
      txt('Tämä riippuu siitä, kuinka pitkällä Maa on vuosikierrossaan.'),
    ], [
      'Aurinko valaisee tässä sen puolen Maasta, joka osoittaa Aurinkoon päin.',
      'Vuorokauden päivän ja yön vaihtelu johtuu Maan pyörimisestä oman akselinsa ympäri.',
    ], 1);
  return {
    sceneModel: model, scene, task,
    say: transfer ? 'Paikat A ja B ovat samalla hetkellä Maan eri puolilla. Valitse havainto ja sen selitys.' : 'Onko paikassa A nyt päivä vai yö? Valitse havainto ja sen selitys.',
    hint: 'Etsi se Maan puolisko, jolle Auringon valo osuu.',
    explain: transfer
      ? `Paikka ${daySite} on valaistulla puolella ja paikka ${nightSite} varjon puolella. Maan pyöriminen vaihtaa paikkojen valo-olosuhteita.`
      : `Paikassa A on nyt ${light.islandInDaylight ? 'päivä' : 'yö'}. Maa pyörii akselinsa ympäri, joten paikka A siirtyy valosta varjoon ja takaisin.`,
  };
}

const spaceSpec: ExpeditionSliceSpec = {
  id: 'ENV-PHY-SPACE-01', stop: 'Kotisaaren paikka taivaalla', icon: '🪐',
  intro: 'Aava avaa tutkimusaluksen avaruusluokan. Loikka etsii kotisaaren Maasta, vertaa lähikohteita ja seuraa valoa.',
  goal: 'Opit erottamaan koon ja etäisyyden sekä yhdistämään päivän ja yön Maan pyörimiseen ja vuodenajat akselin kallistukseen.',
  reward: 'Luokan kupoli avautuu Aurinkokunnan panoraamaksi. Kotisaari jää hehkumaan kartalle.',
  rev: 'exp690-space-v1',
  demo: () => {
    const size = spaceModel('size'), distance = spaceModel('distance');
    const day = spaceModel('day'), night = spaceModel('day', 180);
    const summer = spaceModel('seasons'), winter = spaceModel('seasons', 0, 'december');
    return [
      step(size, spaceArt(size), 'Halkaisija kuvaa kohteen kokoa. Kuu on Maata pienempi ja Aurinko on Maata suurempi.'),
      step(distance, spaceArt(distance), 'Etäisyys kuvaa kohteiden väliä. Kuu on paljon lähempänä Maata kuin Aurinko.'),
      step(day, spaceArt(day), 'Kotisaari A on valaistulla puolella. Siellä on päivä.'),
      step(night, spaceArt(night), 'Maa on pyörähtänyt puoli kierrosta akselinsa ympäri. Kotisaari on nyt varjon puolella.'),
      step(summer, spaceArt(summer), 'Vuoden kierrossa Maan akselin suunta säilyy. Kun pohjoispuolisko kallistuu Aurinkoon päin, siellä on kesä.'),
      step(winter, spaceArt(winter), 'Puoli vuotta myöhemmin pohjoispuolisko kallistuu poispäin Auringosta. Siellä on talvi.'),
    ];
  },
  item: expeditionCases({
    'space-size': (r) => spaceQuestion(r, 'size'),
    'space-distance': (r) => spaceQuestion(r, 'distance'),
    'space-day': (r) => spaceQuestion(r, 'day'),
    'space-seasons': (r) => spaceQuestion(r, 'seasons'),
  }, (r) => spaceQuestion(r, 'day', true)),
};

export const expeditionSliceSpecs: ExpeditionSliceSpec[] = [
  volumeSpec, scaleSpec, percentSpec, forceSpec, actionSpec, circuitSpec, filtrationSpec, fireSpec, spaceSpec,
].map((spec) => ({ ...spec, validRevs: [spec.rev] }));

/** These limits describe preview observations. Canonical progression and prerequisites live elsewhere. */
export const expeditionSliceEvidence: Readonly<Record<string, { families: readonly string[]; limit: string }>> = {
  'M-GMEAS-05': { families: ['volume-value', 'volume-layers'], limit: 'Lukuvastaus näyttää tilavuuden laskun. Kuutioyksikön valinta näkyy vain kerroslaskussa. Vapaan perustelun voi arvioida erikseen.' },
  'M-SCALE-03': { families: ['scale-single', 'scale-stages'], limit: 'Tehtävä näyttää maastomatkan laskemista annetusta karttalukemasta. Viivaimella mittaaminen vaatii oman havaintonsa.' },
  'M-PCT-01': { families: ['percent-read', 'percent-compare'], limit: 'Näyttö koskee sadasosaruudukkoa ja prosenttiosuuden erottamista kappalemäärästä näissä kuvioissa.' },
  'PHY79-FORCE-MOTION': { families: ['force-balanced', 'force-change'], limit: 'Vastaus näyttää ennusteen kitkattoman mallin liikkeestä valmiista vaihtoehdoista. Vapaan perustelun voi arvioida erikseen.' },
  'PHY79-ACTIONPAIR': { families: ['pair-assign', 'pair-distinguish'], limit: 'Näyttö koskee voimaparin kohteiden, suuruuden ja suunnan yhdistämistä mallissa. Oma voimakuva ja vapaa perustelu vaativat erillisen havainnon.' },
  'PHY79-PARALLEL': { families: ['parallel-infer-both', 'parallel-unequal-reason'], limit: 'Jännite- ja virtapäätelmät perustuvat saman ideaalipiirin annettuihin mittauksiin ja valmiisiin perusteluihin. Piirin rakentaminen ja oma selitys vaativat erillisen havainnon.' },
  'CHEM79-FILTRATION': { families: ['filter-size', 'filter-dissolved'], limit: 'Vastaus näyttää ennusteen annetulle suodattimelle. Käytännön työskentely ja veden juomakelpoisuus vaativat erillisen arvioinnin.' },
  'CHEM79-FIRE-SAFE': { families: ['fire-conditions', 'fire-safe-route'], limit: 'Valinta näyttää palamisen ehdon tai kuvitteellisen turvallisuuspäätöksen tunnistamista. Todellisen palotilanteen toiminta, fyysinen turvallisuusosaaminen ja oma perustelu vaativat erillisen arvion.' },
  'ENV-PHY-SPACE-01': { families: ['space-size', 'space-distance', 'space-day', 'space-seasons'], limit: 'Koko, etäisyys, vuorokausi ja vuodenaika näkyvät erillisinä mallihavaintoina. Valmiin selityksen valinta ja itsenäinen selitys arvioidaan erikseen.' },
};
