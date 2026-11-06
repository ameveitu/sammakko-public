import type { Rng } from '../engine/rng';
import type { Item, NodeSpec, Phase } from '../engine/types';
import { displayMeasure, solutionMeasurementStation, type Dimension, type MeasurementMode, type MeasurementStationTask } from './models/measurement-station';
import { measurementStationScene, type MeasurementStationScene } from './models/measurement-scene';
import { measurementStationBoard, measurementStationExample } from './scenes/measurement-station';

type MeasureItem = Omit<Item, 'task'> & { task: MeasurementStationTask; sceneModel?: MeasurementStationScene };
type Author = (r: Rng) => Omit<MeasureItem, 'tag'>;
type Definition = Pick<NodeSpec, 'id' | 'stop' | 'icon' | 'intro' | 'goal' | 'reward' | 'produceWhat'> & {
  families: readonly [readonly [string, Author], readonly [string, Author]];
  transfer: Author;
  limit: string;
};
type Context = MeasurementStationTask['context'];
const context = (title: string, ...skills: string[]): Context => ({ title, skills });
const massContext = context('Gramma ja kilogramma', 'M-MEAS-06');
const liquidContext = context('Litra ja desilitra', 'M-MEAS-09');
const sizeContext = context('Kohteen pituuden vertaaminen', 'M-MEAS-01');
const lengthContext = context('Senttimetri ja metri', 'M-MEAS-03');
const cubeContext = context('Tilavuusyksikkö ja nestemäärä', 'M-GMEAS-04', 'M-MEAS-09');

function item(problem: MeasurementMode, familiar: Context, say: string, hint: string, explain: string): ReturnType<Author> {
  const task: MeasurementStationTask = { kind: 'measurement-station', context: familiar, ...problem };
  return { task, scene: measurementStationBoard(task), sceneModel: measurementStationScene(task), say, hint, explain };
}

function weigh(r: Rng, method: 'empty' | 'tare' | 'beam') {
  const grams = r.pick(method === 'beam' ? [550, 650, 750, 850] : [150, 200, 250, 350]);
  const basket = method === 'tare' ? r.pick([60, 80, 120]) : 0;
  const offset = r.pick([20, 30, 50]);
  const unit = method === 'beam' ? 'kg' : 'g';
  const object = method === 'tare' ? 'Loikan marjat retkiastiassa' : method === 'beam' ? 'Retken eväslaukku' : 'Sulkaan kivi vaa’alla';
  return item({ mode: 'mass', object, grams, offset, basket, unit, display: method === 'beam' ? 'beam' : 'digital' }, massContext,
    'Aseta vaaka mittausvalmiiksi, punnitse kohde ja kirjoita lukema asteikon yksikössä.',
    basket ? 'Aseta ensin tyhjä astia ja käytä taarausta. Nollasta lähtemällä vaaka näyttää pelkän lisätyn kuorman.' :
      'Tarkista tyhjän vaa’an lukema. Nollaa vaaka ennen kuin asetat kohteen.',
    `Kun ${basket ? 'astian massa ja lähtölukema poistetaan taaraamalla' : 'vaa’an lähtölukema nollataan'}, kuorman lukema on ${displayMeasure(grams, unit)} ${unit}.`);
}

function fillVessel(r: Rng, action: 'fill' | 'drain' | 'flared') {
  const target = r.pick(action === 'flared' ? [400, 600, 800] : [200, 300, 400]);
  const unit = action === 'flared' ? 'l' : 'dl';
  const portion = action === 'flared' ? 200 : 100;
  const capacity = action === 'flared' ? 1200 : 600;
  return item({ mode: 'liquid', object: action === 'flared' ? 'Leveäsuinen kaatokannu' : action === 'drain' ? 'Täysi näyteastia' : 'Tyhjä retkikannu',
    target, initial: action === 'drain' ? capacity : 0, portion, step: portion, capacity, unit, shape: action === 'flared' ? 'flared' : 'cylinder' }, liquidContext,
    'Lisää tai poista vettä tavoiteviivaan. Valitse silmän paikka ja lukukohta. Kirjoita lukema asteikon yksikössä.',
    'Kun silmä on vedenpinnan korkeudella, katso veden kaartuvan pinnan alinta kohtaa. Lue sen vieressä oleva asteikko.',
    `Silmän korkeudelta meniskin alin kohta on viivalla ${displayMeasure(target, unit)} ${unit}. Erimuotoisessa astiassa asteikkovälit voivat olla eri pituisia.`);
}

function estimateLength(r: Rng, strategy: 'repeat' | 'part' | 'new') {
  const lengthMm = r.pick(strategy === 'repeat' ? [270, 290, 310, 330] : strategy === 'part' ? [160, 180, 210, 230] : [330, 360, 390]);
  const referenceMm = strategy === 'repeat' ? 120 : strategy === 'part' ? 300 : 240;
  const reference = strategy === 'repeat' ? 'pieni karttalaatta' : strategy === 'part' ? 'retkikotelon kansi' : 'kaksi samankokoista mittapalaa yhdessä';
  const object = strategy === 'repeat' ? 'Vihreä nauha' : strategy === 'part' ? 'Retkivihkon kansi' : 'Uusi kaarnalaudan pala';
  const margin = strategy === 'repeat' ? 60 : strategy === 'part' ? 50 : 70;
  return item({ mode: 'estimate', object, reference, referenceMm, lengthMm, rangeMm: [lengthMm - margin, lengthMm + margin] }, sizeContext,
    'Kirjoita vertailukohteen avulla karkea pituusarvio ja yksikkö. Lukitse arvio, mittaa ja vertaa.',
    strategy === 'part' ? 'Pohdi, minkä osan pidemmästä vertailukohteesta mitattava kohde peittää.' :
      'Ajattele, kuinka monta vertailukohteen pituutta mahtuisi mitattavaan kohteeseen.',
    `Mittanauha näyttää ${displayMeasure(lengthMm, 'cm')} cm. Arvio ja mitta voivat olla eri lukuja. Vertaa niitä yhteisessä yksikössä.`);
}

function selectInstrument(r: Rng, dimension: Exclude<Dimension, 'liquid'>, transfer = false): ReturnType<Author> {
  const [object, maximum, resolution] = dimension === 'mass' ?
    r.pick([['Kuivatut eväät', 160, 1], ['Karttakivet', 450, 1], ['Pieni reppu', 1800, 50], ['Pakkauslaatikko', 4200, 100]] as const) :
    transfer ? r.pick([['Uusi kaarnapala', 210, 1], ['Laiturin reunalista', 3850, 20]] as const) :
      r.pick([['Karttakotelon kansi', 150, 1], ['Lyhyt listapala', 280, 1], ['Laiturin penkki', 1250, 10], ['Venepeite', 2600, 20]] as const);
  const unit = dimension === 'mass' ? 'g' : 'mm';
  const familiar = dimension === 'mass' ? context('Massa kuvaa kuorman suuruutta', 'M-MEAS-05') :
    context('Pituus kuvaa kahden pisteen välimatkaa', 'M-MEAS-02');
  const question = `Mittaa ${dimension === 'mass' ? 'massa' : 'pituus'}. Mittausalueen on ulotuttava vähintään arvoon ${maximum} ${unit} ja asteikkoväli saa olla enintään ${resolution} ${unit}.`;
  return item({ mode: 'tool', object, dimension, question, maximum, resolution }, familiar,
    'Valitse sopiva väline ja mitä välineellä verrataan.',
    'Tarkista ensin suure, sitten mittausalue ja asteikkoväli. Molempien rajojen tulee täyttyä.',
    'Välineen pitää kattaa koko pyydetty mittausalue. Riittävän pieni asteikkoväli erottaa tarvittavat lukemat.');
}

function selectUnit(r: Rng, variation: 'small' | 'long' | 'new') {
  const amount = r.pick(variation === 'long' ? [2000, 3000, 4000] : variation === 'small' ? [180, 240, 320] : [430, 510, 620]);
  const sourceUnit = variation === 'long' ? 'cm' : 'm';
  const compactUnit = variation === 'long' ? 'm' : 'cm';
  const object = variation === 'long' ? 'Pitkä laituriköysi' : variation === 'small' ? 'Pieni lipputikku' : 'Uusi retkirasian hihna';
  return item({ mode: 'unit', object, source: { value: displayMeasure(amount, sourceUnit), unit: sourceUnit }, amount,
    dimension: 'length', allowedUnits: ['mm', 'cm', 'm', 'g', 'dl'] }, lengthContext,
    'Kirjoita sama mitta lappuun. Valitse yksikkö, jossa lukumäärä on kokonaisluku 1–99.',
    'Metrissä on sata senttimetriä. Yksikköä vaihtamalla lukuarvo muuttuu, mutta pituus pysyy.',
    `Sama pituus on ${displayMeasure(amount, sourceUnit)} ${sourceUnit} ja ${displayMeasure(amount, compactUnit)} ${compactUnit}. Lyhyeen lappuun sopii jälkimmäinen.`);
}

function readPrecision(r: Rng, layout: 'on' | 'between' | 'different') {
  const step = layout === 'different' ? 5 : layout === 'between' ? 20 : 10;
  const middle = r.pick([2, 3, 4]) * step;
  const actual = middle + (layout === 'on' ? 0 : layout === 'between' ? r.pick([4, 10, 16]) : r.pick([1, 2, 3, 4]));
  return item({ mode: 'precision', object: 'Retkivihkon pituusmittari', unit: 'cm', step, actual, end: 6 * step }, lengthContext,
    'Lue asteikkoväli. Päätä, onko osoitin viivalla vai välissä. Kirjaa lähin viiva asteikon tarkkuudella.',
    'Vierekkäisten viivojen ero kertoo jaon. Kahden viivan välissä tulos ilmoitetaan lähimpänä viivana sovitulla tarkkuudella.',
    `Tämän asteikon viivojen väli on ${displayMeasure(step, 'cm')} cm. ${layout === 'on' ? 'Osoitin osuu merkittyyn viivaan.' : 'Välilukema kirjataan lähimmän viivan arviona.'}`);
}

function plausibility(r: Rng, variation: 'credible' | 'mass-error' | 'length-error') {
  if (variation === 'length-error') {
    const expected = [800, 1200] as const;
    return item({ mode: 'plausibility', object: 'Yhden aikuisen askeleen pituinen listapala', dimension: 'length', expected,
      reference: 'Puusepän vertailumallissa hyväksyttävä pituus on 80–120 cm.',
      proposal: r.pick([{ value: '10', unit: 'cm' }, { value: '100', unit: 'g' }] as const) }, lengthContext,
    'Vertaa lappua annettuun rajaan ja yksikköön. Kirjoita yksi mahdollinen korjattu lukema.',
    'Vain pituusyksikkö kelpaa. Tarkista sitten, mihin annettuun väliin luku asettuu.',
    'Esimerkiksi 100 cm on pituus ja osuu 80–120 cm:n vertailuväliin.');
  }
  const [object, minimum, maximum] = r.pick([
    ['Pieni eväskori', 400, 800], ['Karttalaukku', 200, 450], ['Retkireppu', 1300, 2300], ['Varustelaatikko', 2800, 4200],
  ] as const);
  const expected = [minimum, maximum] as const;
  const suitable = r.pick([minimum, (minimum + maximum) / 2, maximum]);
  const wrong = r.pick([minimum / 4, maximum * 2, maximum * 10]);
  return item({ mode: 'plausibility', object, dimension: 'mass', expected,
    reference: `Tässä retkimallissa tämän kokoisen kohteen massa on ${minimum}–${maximum} g.`,
    proposal: { value: displayMeasure(variation === 'credible' ? suitable : wrong, 'kg'), unit: 'kg' } }, massContext,
  'Onko Loikan lappu uskottava? Valitse vertailun perustelu ja kirjoita jokin alueelle sopiva lukema.',
  'Vertaa lukemaa grammoihin tai muunna rajat kilogrammoiksi. Yksi kilogramma on tuhat grammaa.',
  `Esimerkiksi ${suitable} g on annettujen rajojen sisällä. Kohteen lopullinen mitta selviää punnitsemalla.`);
}

function remeasure(r: Rng, fault: 'origin' | 'gaps' | 'none') {
  const segments = r.pick([3, 4, 5, 6]), segmentCm = r.pick([2, 3, 5]);
  const total = segments * segmentCm;
  const origin = fault === 'gaps' ? 0 : r.pick([2, 4, 6]);
  const object = fault === 'gaps' ? 'Laudan mittapalarivi' : fault === 'origin' ? 'Mittanauhan kiinnitysnaru' : 'Uusi jokimajan tukilista';
  return item({ mode: 'recheck', object, origin, segments, segmentCm,
    oldRuler: fault === 'origin' ? total + origin : total, oldSegments: fault === 'gaps' ? total - segmentCm : total, fault }, lengthContext,
  'Mittaa sama kohde uudestaan nauhalla ja mittapaloilla. Vertaa aiempia merkintöjä kahteen uuteen havaintoon.',
  'Vähennä nauhan alkulukema loppulukemasta. Aseta samanpituiset palat peräkkäin koko matkalle.',
  `Nauhan päätepisteiden erotus ja ${segments} kappaletta ${segmentCm} cm:n mittapalaa antavat kumpikin tulokseksi ${total} cm.`);
}

function connectCube(r: Rng, direction: 'from-cubes' | 'from-litres', transfer = false) {
  const amount = transfer ? r.pick([2, 3]) : r.pick([1, 2, 3]);
  const portionDl = r.pick([2, 5, 10] as const);
  return item({ mode: 'cube', object: transfer ? 'Kellotornin kuutioryhmä' : 'Litra ja läpinäkyvä kuutio', amount, direction, portionDl }, cubeContext,
    'Täytä kuutiot annos kerrallaan. Kirjoita särmän pituus, nestemäärä ja kuutioiden tilavuus.',
    'Kuution kolme suuntaa ovat yhtä pitkiä. Särmä on 1 dm eli 10 cm. Litran annos täyttää tällaisen kuution.',
    `Yhden kuution tilavuus on 1 dm³, koska sen kaikki särmät ovat 1 dm. Tässä ${amount} l vastaa ${amount} dm³.`);
}

const definitions: readonly Definition[] = [
  {
    id: 'M-MEAS-07', stop: 'Retkikorin punnitus', icon: '⚖', intro: 'Aava tarkistaa tutkimuslappua varten, mistä vaa’an lukema alkaa.',
    goal: 'Osaat nollata tai taarata vaa’an ja kirjoittaa mallin näyttämän massan yksikköineen.',
    reward: 'Korin mallimassa merkitään kuljetussuunnitelmaan.',
    families: [['zero-empty-scale', r => weigh(r, 'empty')], ['tare-container-before-loading', r => weigh(r, 'tare')]], transfer: r => weigh(r, 'beam'),
    limit: 'Näyttö koskee simuloidun vaa’an nollausta, taarausta ja annetun asteikon lukemista. Fyysisen vaa’an käyttö edellyttää erillistä havaintoa.',
  },
  {
    id: 'M-MEAS-10', stop: 'Sovittu määrä retkikannuun', icon: '◒', intro: 'Loikka kohdistaa katseen vedenpintaan ja mitta-astian asteikkoon.',
    goal: 'Osaat säätää tavoitemäärän, lukea meniskin silmän korkeudelta ja ilmoittaa yksikön.',
    reward: 'Retkikannu saa sovitun nestemäärän.',
    families: [['fill-from-empty-to-mark', r => fillVessel(r, 'fill')], ['remove-excess-to-mark', r => fillVessel(r, 'drain')]], transfer: r => fillVessel(r, 'flared'),
    limit: 'Arviointi koskee simuloitua vettä, ylöspäin kaartuvia reunoja ja merkittyjä asteikkoviivoja. Fyysistä kaatamista tai muiden nesteiden meniskiä ei arvioida.',
  },
  {
    id: 'M-MEAS-11', stop: 'Ennen mittanauhaa', icon: '⟷', intro: 'Aava asettaa tutun vertailukohteen uuden retkitarvikkeen viereen.',
    goal: 'Osaat tehdä vertailuun nojaavan arvion ennen mittaamista ja verrata kahta lukemaa.',
    reward: 'Mittaretken muistiinpano sisältää sekä arvion että tarkistuksen.',
    families: [['estimate-by-repeating-reference', r => estimateLength(r, 'repeat')], ['estimate-part-of-larger-reference', r => estimateLength(r, 'part')]],
    transfer: r => estimateLength(r, 'new'),
    limit: 'Arvio lukitaan ennen mittanauhaa ja hyväksytään vaihteluvälillä. Oppijan mielensisäistä laskutapaa ei päätellä lukemasta.',
  },
  {
    id: 'M-MEAS-12', stop: 'Oikea väline oikeaan kysymykseen', icon: '⟒', intro: 'Aavan laukussa on vaaka, mittanauha ja mitta-astia.',
    goal: 'Osaat valita tutun suureen mittavälineen ja yhdistää sen oikeaan vertailutapaan.',
    reward: 'Paikallinen mittaus alkaa sopivalla välineellä.',
    families: [['select-instrument-for-length', r => selectInstrument(r, 'length')], ['select-instrument-for-mass', r => selectInstrument(r, 'mass')]],
    transfer: r => selectInstrument(r, 'length', true),
    limit: 'Valinta perustuu tämän tehtävän suureeseen, mittausalueeseen ja asteikkoväliin. Mittavälineen fyysinen käyttö ja avoin oma perustelu ovat erillisiä näyttöjä.',
  },
  {
    id: 'M-MEAS-13', stop: 'Yksikkö tekee tiedosta ymmärrettävän', icon: '▱', intro: 'Loikan mittalappuun mahtuu lyhyt lukema, jonka toinenkin osaa tulkita.',
    goal: 'Osaat pitää pituuden samana, kun vaihdat lyhyelle lapulle sopivaan yksikköön.',
    reward: 'Mittalappu auttaa seuraavaa rakentajaa.',
    families: [['choose-short-object-unit', r => selectUnit(r, 'small')], ['choose-long-object-unit', r => selectUnit(r, 'long')]], transfer: r => selectUnit(r, 'new'),
    limit: 'Hyväksyntä koskee tämän lapun ilmoitettua 1–99 kokonaisluvun tilarajausta. Sama pituus voidaan ilmaista oikein muissakin yksiköissä.',
  },
  {
    id: 'M-MEAS-14', stop: 'Kuinka tarkasti mittari kertoo?', icon: '≋', intro: 'Sama mittari voi näyttää viivalla olevan osoittimen tai osoittimen kahden viivan välissä.',
    goal: 'Osaat lukea jaon ja kirjata lukeman asteikon tarkkuudella.',
    reward: 'Retkivihkoon jää asteikkoon perustuva lukema.',
    families: [['read-at-mark', r => readPrecision(r, 'on')], ['report-between-marks', r => readPrecision(r, 'between')]], transfer: r => readPrecision(r, 'different'),
    limit: 'Harjoitus arvioi asteikkoväliä, sijaintia ja lähimmän viivan raportointisääntöä. Asteikkoväli yksin ei määritä fyysisen mittarin kokonaisepävarmuutta.',
  },
  {
    id: 'M-MEAS-15', stop: 'Voiko tämä mitta pitää paikkansa?', icon: '≈', intro: 'Aava vertaa Loikan mittalappua tutun retkikohteen suuruusluokkaan.',
    goal: 'Osaat arvioida yksikköä ja suuruutta suhteessa annettuun vertailuun.',
    reward: 'Retkikori saa käyttökelpoisen arviointilapun.',
    families: [['verify-a-credible-reading', r => plausibility(r, 'credible')], ['repair-implausible-magnitude', r => plausibility(r, 'mass-error')]],
    transfer: r => plausibility(r, 'length-error'),
    limit: 'Valittu perustelu ja oma uskottava mittaluku arvioidaan annetulla vertailuvälillä. Vertailu ei yksin tuota kohteen tarkkaa mittatulosta.',
  },
  {
    id: 'M-MEAS-16', stop: 'Aavan toinen tarkistus', icon: '↻', intro: 'Aava kokeilee sekä mittanauhaa että mittapaloja ja vertaa kahta havaintoa aiempaan.',
    goal: 'Osaat toistaa mittauksen, verrata kahta menetelmää ja paikantaa mahdollisen asetelmavirheen.',
    reward: 'Rakennussuunnitelmaan jää tarkistettu mitta.',
    families: [['remeasure-after-origin-error', r => remeasure(r, 'origin')], ['remeasure-after-gap-error', r => remeasure(r, 'gaps')]],
    transfer: r => remeasure(r, 'none'),
    limit: 'Mallissa tehdään kaksi erillistä mittausasetelmaa. Hyväksyntä koskee havaintoja, annettuja virhelähteitä ja tarkistettua pituutta.',
  },
  {
    id: 'M-UNIT-06', stop: 'Litra kuution sisällä', icon: '◇', intro: 'Loikka vertaa yhden litran annosta kuutioon, jonka jokainen särmä on yhden desimetrin mittainen.',
    goal: 'Osaat yhdistää tilan ja nestemäärän sekä erottaa särmän pituuden kuution tilavuudesta.',
    reward: 'Kellotornin mittapöytä yhdistää litroina ja kuutiodesimetreinä ilmaistun määrän.',
    families: [['fill-a-cubic-decimetre', r => connectCube(r, 'from-cubes')], ['fit-a-litre-into-a-cube', r => connectCube(r, 'from-litres')]],
    transfer: r => connectCube(r, 'from-cubes', true),
    limit: 'Arviointi yhdistää erikokoiset desilitran annokset kokonaisiin litroihin ja yhtä suuriin yhden kuutiodesimetrin kuutioihin. Vapaa kolmiulotteinen mallintaminen on erillinen näyttö.',
  },
];

type MeasureSpec = Omit<NodeSpec, 'item'> & { item: (r: Rng, phase: Phase) => MeasureItem };
function spec(def: Definition): MeasureSpec {
  const { families, transfer, limit: _limit, ...meta } = def;
  const revision = ['M-MEAS-12', 'M-MEAS-15', 'M-UNIT-06'].includes(def.id) ? 2 : 1;
  const rev = `exp690-measurement-station-${def.id.toLowerCase()}-v${revision}`;
  return {
    ...meta, rev, validRevs: revision === 2 ? [rev.replace(/-v2$/, '-v1'), rev] : [rev],
    demo(r) {
      const example = families[0][1](r);
      return [{ say: example.hint!, scene: example.scene!, sceneModel: example.sceneModel }, {
        say: example.explain, scene: measurementStationExample(example.task),
        sceneModel: measurementStationScene(example.task, solutionMeasurementStation(example.task)),
      }];
    },
    item(r, phase) {
      const [tag, author] = phase === 'transfer' ? ['transfer', transfer] as const : r.pick(families);
      return { ...author(r), tag };
    },
  };
}

export const measurementStationSpecs: MeasureSpec[] = definitions.map(spec);
export const measurementStationEvidence: Readonly<Record<string, { families: readonly string[]; limit: string }>> =
  Object.fromEntries(definitions.map(({ id, families, limit }) => [id, { families: families.map(([tag]) => tag), limit }]));
