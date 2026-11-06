import type { Rng } from '../engine/rng';
import type { Item, NodeSpec, Phase } from '../engine/types';
import { circleArc, circleRim, circleTurn, type ArcRequest, type CircleBoard, type CircleMeasure, type CircleObservatoryTask,
  type CirclePoint, type PartDraft, type Segment } from './models/circle-observatory';
import { circleObservatoryBoard, circleObservatoryExample } from './scenes/circle-observatory';

type CircleItem = Omit<Item, 'task'> & { task: CircleObservatoryTask };
type Author = (r: Rng) => Omit<CircleItem, 'tag'>;
type Definition = Pick<NodeSpec, 'id' | 'stop' | 'icon' | 'intro' | 'goal' | 'reward' | 'produceWhat'> & {
  families: readonly [readonly [string, Author], readonly [string, Author]];
  transfer: Author;
  limit: string;
};
type Variant = 'build' | 'repair' | 'transfer';
const boardContext = (title: string, ...skills: string[]) => ({ title, skills });
const closed = boardContext('Ympyrä ja kehäpisteet', 'M-GEO-13');
const central = boardContext('Ympyrän osat ja kulman asteluku', 'M79-CIRCLE-BASIC', 'M-GEO-22');
const viewed = boardContext('Keskuskulma ja sitä vastaava kaari', 'M79-CENTRAL-ANGLE');
const compared = boardContext('Kehäkulman kärki ja keskuskulma', 'M79-INSCRIBED-ANGLE-CONCEPT', 'M79-CENTRAL-ANGLE');
const familiar = boardContext('Säde, halkaisija ja kehä', 'M79-CIRCLE-BASIC');

function setup(r: Rng, setting: string, variant: Variant, semicircle = false) {
  const span = semicircle ? 180 : r.pick([60, 66, 72, 84, 96, 108, 120, 132, 144, 156]);
  const offset = r.int(0, 23) * 15;
  const labels = variant === 'transfer' ? ['P', 'Q', 'R', 'S', 'T', 'U', 'V', 'K', 'W'] : ['A', 'B', 'C', 'D', 'E', 'F', 'H', 'O', 'X'];
  const [a, b, c, d, e, f, opposite, origin, inside] = labels as [string, string, string, string, string, string, string, string, string];
  const inner = Math.floor(span / 3);
  const outer = Math.floor((360 - span) / 5);
  const raw: [string, number][] = [[a, 0], [b, span], [c, inner], [d, inner * 2], [e, Math.max(210, span + outer * 2)],
    [f, span + outer * 4], [opposite, semicircle ? 226 : 180]];
  const angle = (v: number) => (offset + v) % 360;
  const points: CirclePoint[] = raw.map(([id, bearing]) => ({ id, angle: angle(bearing), place: 'rim' }));
  points.push({ id: origin, angle: 0, place: 'centre' }, { id: inside, angle: angle(inner * 2 + 12), place: 'inside' });
  const drawing = variant === 'transfer' ? { x: 111, y: 93, radius: 55 } : { x: 146, y: 96, radius: 67 };
  const board: CircleBoard = { drawing, points, setting };
  return { board, a, b, c, d, e, f, opposite, origin, inside, span };
}

function item(task: Omit<Extract<CircleObservatoryTask, { mode: 'parts' }>, 'kind'> |
  Omit<Extract<CircleObservatoryTask, { mode: 'angles' }>, 'kind'> |
  Omit<Extract<CircleObservatoryTask, { mode: 'measure' }>, 'kind'> |
  Omit<Extract<CircleObservatoryTask, { mode: 'thales' }>, 'kind'>, say: string, hint: string, explain: string): ReturnType<Author> {
  const full: CircleObservatoryTask = { kind: 'circle-observatory', ...task };
  return { task: full, scene: circleObservatoryBoard(full), say, hint, explain };
}

const partNames = { radius: 'säde', diameter: 'halkaisija', circumference: 'kehä', arc: 'kaari', basic: 'kartta' } as const;
function parts(r: Rng, part: keyof typeof partNames, variant: Variant) {
  const semicircle = (part === 'arc' || part === 'basic') && variant === 'transfer' && r.chance(.5);
  const setting = variant === 'transfer' ? 'Tähtialtaan kartta on uudessa paikassa. Pisteiden uudet nimet näkyvät piirroksessa.'
    : 'Observatorion mallialtaan keskus on merkitty. Reunamerkkejä voi yhdistää janalla tai seurata kehää pitkin.';
  const { board, a, b, c, d, e, f, opposite, origin, inside } = setup(r, setting, variant, semicircle);
  const radius = r.int(2, 19), unit = variant === 'transfer' ? 'm' : 'cm';
  const arcEnds = [a, b] as const;
  const arcRequest: ArcRequest = variant === 'build' ? 'short' : variant === 'transfer' && !semicircle ? 'long' : 'via';
  const through = variant === 'repair' ? f : c;
  const order = circleRim(board).map(p => p.id);
  const start = order.indexOf(r.pick([a, b, c, e]));
  const step = r.pick([-1, 1]);
  const prefix = variant === 'repair' && (part === 'circumference' || part === 'basic')
    ? [order[start], order[(start + step + order.length) % order.length]] : undefined;
  let draft: PartDraft | undefined;
  if (variant === 'repair') {
    if (part === 'radius') draft = { kind: 'radius', segment: r.pick([[origin, inside], [origin, e], [c, d]] as const) };
    if (part === 'diameter' || part === 'basic') draft = { kind: 'diameter', segment: r.pick([[a, opposite], [a, b], [a, inside]] as const) };
    if (part === 'arc') draft = { kind: 'arc', segment: arcEnds };
    if (part === 'circumference') draft = { kind: 'circumference', route: [a, c, d] };
  }
  if (variant === 'transfer') {
    if (part === 'radius') draft = { kind: 'radius', segment: r.pick([[origin, inside], [c, inside], [d, inside]] as const) };
    if (part === 'diameter') {
      const points = circleRim(board);
      // Choose a chord with two rim endpoints as close to a diameter as this diagram permits.
      const close = points.flatMap((a, i) => points.slice(i + 1).map(b => ({
        segment: [a.id, b.id] as const, deviation: Math.abs(circleTurn(a.angle, b.angle) - 180),
      }))).filter(v => v.deviation > 0).sort((a, b) => a.deviation - b.deviation)[0]!;
      draft = { kind: 'diameter', segment: close.segment };
    }
    if (part === 'circumference') draft = { kind: 'area' };
  }
  const arcWords = arcRequest === 'short' ? 'lyhyempi kaari' : arcRequest === 'long' ? 'pidempi kaari' :
    semicircle ? `puoliympyrä pisteen ${through} kautta` : `kaari pisteen ${through} kautta`;
  const say = part === 'radius' ? 'Rakenna kaksi eri suuntaan kulkevaa sädettä ja kirjaa niiden mitat.'
    : part === 'diameter' ? 'Rakenna halkaisija ja kirjaa sen puolikkaiden sekä koko janan pituus.'
    : part === 'circumference' ? 'Kulje reunamerkiltä seuraavalle, kunnes reunareitti palaa alkuun. Viivan tulee kulkea kehää pitkin.'
    : part === 'arc' ? `Nimeä ja rakenna ${arcWords} pisteiden ${a} ja ${b} välille.`
    : `Merkitse karttaan säde, halkaisija ja koko kehä. Rakenna lisäksi ${arcWords} pisteiden ${a} ja ${b} välille. Osoita, mistä halkaisijan pituus muodostuu.`;
  return item({ mode: 'parts', part, arcEnds, arcRequest, through, prefix, draft, radius, unit, board, context: closed }, say,
    'Aloita tarkistamalla, mitkä pisteet ovat kehällä. Jana kulkee suoraan. Kaari ja koko kehä kulkevat reunaa pitkin.',
    'Säde yhdistää keskuksen ja kehäpisteen. Halkaisija kulkee kahden säteen verran keskuksen läpi. Kaari on osa koko kehästä.');
}

function angles(r: Rng, skill: 'central' | 'inscribed' | 'relation' | 'integration', variant: Variant) {
  const setting = variant === 'transfer' ? 'Toisen havaintopihan kartassa pisteet on nimetty uudelleen.'
    : 'Kaaren päät kuuluvat molemmille havaitsijoille. Heidän paikkansa voivat olla eri kohdissa.';
  const { board, a, b, c, d, e, f, origin, inside, opposite, span } = setup(r, setting, variant);
  const ends: Segment = [a, b];
  const through = variant === 'repair' || (variant === 'transfer' && r.chance(.5)) ? f : c;
  const sweep = circleArc(board, { ends, via: through })!.degrees;
  const given = skill === 'inscribed' ? undefined : { angle: skill === 'central' || variant === 'build' ? 'central' : 'inscribed',
    degrees: skill === 'central' || variant === 'build' ? sweep : sweep / 2 } as const;
  const comparison = skill === 'central' && variant !== 'build' ? r.pick([34, 45, 51]) : undefined;
  const audit = skill === 'inscribed' && variant === 'repair' ? r.pick([origin, inside, through, d]) : undefined;
  const relocate = skill === 'inscribed' && variant === 'transfer' ? true : undefined;
  const otherSide = (skill === 'relation' || skill === 'integration') && variant === 'repair' ? through : undefined;
  const distractor = skill === 'integration' && variant === 'transfer' ? [d, span < 140 ? e : opposite] as const : undefined;
  const say = skill === 'central' ? 'Rakenna keskuskulma kahdesta säteestä. Merkitse sitä vastaava kaari ja kulman asteluku.'
    : skill === 'inscribed' ? 'Sijoita havaitsija kehälle. Valitse kulman kylkien päätepisteet ja kaari, joka ei sisällä sen kärkeä.'
    : 'Rakenna kehäkulma ja merkitse sitä vastaava kaari. Kirjaa saman kaaren keskuskulma ja kehäkulma.';
  return item({ mode: 'angles', skill, ends, through, given, comparison, audit, otherSide, distractor, relocate, board,
    context: skill === 'central' ? central : skill === 'inscribed' ? viewed : compared }, say,
    skill === 'central' ? 'Kulman kärki on keskellä. Seuraa merkittyä kaarta ja käytä sen astelukua, vaikka ympyrän koko vaihtuisi.'
      : 'Kaaren päiden tulee olla kylkien päissä. Kärki on vastakkaisella kaarella. Vertaa samaa kaarta, kun käytät puolittamista.',
    'Keskuskulma ja kehäkulma vastaavat samaa kaarta, kun kyljet osuvat sen päihin ja kehäkulman kärki jää toiselle kaarelle.');
}

function measures(r: Rng, measure: CircleMeasure, variant: Variant) {
  const area = measure === 'area' || measure === 'sector';
  const partial = measure === 'arc' || measure === 'sector';
  const setting = area ? 'Tähtipihan peite levitetään alueen päälle.' : 'Valonauha asennetaan reunaa pitkin.';
  const { board, span } = setup(r, setting, variant);
  const givenKind = variant === 'repair' ? 'diameter' : 'radius';
  const unit = variant === 'transfer' ? 'm' : 'cm';
  const length = r.int(3, 20);
  const angle = partial ? variant === 'transfer' && measure === 'arc' ? 360 - span : span : undefined;
  const compareRadius = measure === 'area' && variant === 'transfer' ? length * 2 : undefined;
  const remainder = measure === 'sector' && variant === 'transfer' ? true : undefined;
  const result = variant === 'build' ? 'exact' : variant === 'repair' ? 'approx' : 'either';
  const say = measure === 'circumference' ? 'Laske koko kehän pituus ja arvioi se myös halkaisijan mittoina.'
    : measure === 'area' ? 'Laske pyöreän peitteen ala. Jos säde vaihtuu, lukitse ensin ennuste alan muutoksesta.'
    : measure === 'arc' ? 'Määritä kaaren osuus koko kehästä ja laske valonauhan pituus.'
    : remainder ? 'Määritä varatun sektorin ulkopuolelle jäävä osuus ja laske sen ala.'
    : 'Määritä sektorin osuus koko ympyrästä ja laske peitteen ala.';
  const context = measure === 'area' ? boardContext('Säde ja neliöön korottaminen', 'M79-CIRCLE-BASIC', 'M79-POWER-POS')
    : partial ? boardContext(area ? 'Keskuskulma ja ympyrän ala' : 'Keskuskulma ja kehän pituus',
      'M79-CENTRAL-ANGLE', area ? 'M79-CIRCLE-AREA' : 'M79-CIRCLE-CIRC') : familiar;
  return item({ mode: 'measure', measure, given: { length, kind: givenKind }, unit, angle, remainder, compareRadius, result,
    decimals: variant === 'repair' ? r.pick([1, 2]) : 2, board, context }, say,
    area ? 'Muunna halkaisija tarvittaessa säteeksi. Pinta-ala muuttuu säteen neliön mukaan. Tarkista tarvittaessa osuus 360 asteesta.'
      : 'Pii kertoo kehän ja halkaisijan suhteen. Jos tarvitset vain osan kehästä, käytä asteluvun osuutta täydestä kierroksesta.',
    area ? 'Peitettävä pinta-ala käyttää neliöyksikköä. Sektori kattaa keskuskulmansa osuuden ympyrän pinta-alasta.'
      : 'Nauha mitataan pituusyksiköllä. Kaaren pituus on sen keskuskulman mukainen osuus koko kehästä.');
}

function thales(r: Rng, variant: Variant) {
  const setting = variant === 'transfer' ? 'Toisen pihan halkaisija osoittaa uuteen suuntaan. Tutki nyt toista puoliympyrää.'
    : 'Mallisilta kulkee keskustan kautta. Vaihda havaintopaikkaa sen kaarella ja kokeile sitten toista jännettä.';
  const { board, a, b, c, d, e, f, opposite, inside } = setup(r, setting, variant);
  const through = variant === 'transfer' ? f : c;
  const ends = [a, opposite] as const;
  const compare = variant === 'repair' ? [a, d] as const : [a, b] as const;
  return item({ mode: 'thales', ends, compare, compareVertex: variant === 'transfer' ? c : e, through,
    candidate: variant === 'repair' ? r.pick([c, inside, e]) : undefined, board,
    context: boardContext('Saman kaaren keskus- ja kehäkulma', 'M79-INSCRIBED-ANGLE') },
  'Ennusta ensin kehäkulma. Siirrä sitten kärkeä samalla puoliympyrällä ja vertaa toiseen, keskuksen ohi kulkevaan jänteeseen.',
  'Puoliympyrää vastaava keskuskulma on oikokulma. Tarkista erikseen, kulkeeko vertailujänne keskuksen kautta.',
  'Halkaisijan päihin tukeutuva kehäkulma on 90°, kun kärki on kehällä ja erillään päistä. Toisen jänteen päät eivät rajaa puoliympyrää.');
}

function partDef(id: string, part: keyof typeof partNames, stop: string, intro: string, reward: string, produceWhat: string,
  tags: readonly [string, string], limit: string): Definition {
  return { id, stop, icon: '◯', intro, reward, produceWhat, limit, goal: `Havaintopöydän ${partNames[part]} rakennetaan pisteistä.`,
    families: [[tags[0], r => parts(r, part, 'build')], [tags[1], r => parts(r, part, 'repair')]], transfer: r => parts(r, part, 'transfer') };
}
function angleDef(id: string, skill: 'central' | 'inscribed' | 'relation' | 'integration', stop: string, goal: string, reward: string,
  tags: readonly [string, string], limit: string): Definition {
  return { id, stop, icon: '∠', intro: 'Loikka etsii havaintopaikkaa observatorion kehältä. Aava tarkistaa kartan kaaren.',
    goal, reward, produceWhat: 'oman kulmarakenteen ja sitä vastaavan kaaren', limit,
    families: [[tags[0], r => angles(r, skill, 'build')], [tags[1], r => angles(r, skill, 'repair')]], transfer: r => angles(r, skill, 'transfer') };
}
function measureDef(id: string, measure: CircleMeasure, stop: string, goal: string, reward: string, tags: readonly [string, string], limit: string): Definition {
  return { id, stop, icon: 'π', intro: 'Ympyräpihan nauha ja peite valmistetaan havaintopiirroksen mitoilla.',
    goal, reward, produceWhat: 'oman täsmällisen laskun ja sovitun yksikön', limit,
    families: [[tags[0], r => measures(r, measure, 'build')], [tags[1], r => measures(r, measure, 'repair')]], transfer: r => measures(r, measure, 'transfer') };
}
const defs: Definition[] = [
  partDef('M79-CIRCLE-RADIUS', 'radius', 'Keskeltä rantaan', 'Loikka rakentaa kaksi suuntaa havaintopöydälle.', 'Mallialtaan keskusmerkki yhdistyy rantaan.',
    'kaksi erisuuntaista sädettä ja niiden yhteisen pituuden', ['build-two-radii', 'audit-radius-endpoints-and-rebuild'],
    'Kaksi rakennettua janaa ja niiden yhteinen pituus ovat rakenteellinen perustelu samassa ympyrässä. Sanallista todistusta ei arvioida.'),
  partDef('M79-CIRCLE-DIAMETER', 'diameter', 'Reitti keskuksen läpi', 'Aava etsii sillalle suoraa keskilinjaa.', 'Mallisillan keskilinja ylittää altaan.',
    'keskuksen läpi kulkevan janan ja kahden säteen pituussuhteen', ['construct-and-split-diameter', 'audit-chord-versus-diameter'],
    'Kelpaavat kaikki annetun kehän vastakkaiset pisteparit. Luonnoksen luokittelu on tunnistusta.'),
  partDef('M79-CIRCLE-CIRCUMFERENCE-CONCEPT', 'circumference', 'Kierros pitkin reunaa', 'Aava seuraa pyöreän pöydän reunaa.', 'Reunavalon reitti sulkeutuu.',
    'suljetun kehäreitin', ['trace-closed-boundary', 'repair-an-open-boundary'],
    'Kehä kulkee reunaa pitkin ja muodostaa kokonaisen kierroksen. Eri aloituspaikat ja suunnat käyvät vapaan reitin tehtävässä.'),
  partDef('M79-CIRCLE-ARC', 'arc', 'Lyhyt reitti reunalla', 'Loikka etsii kahden tähden välisen reitin.', 'Reunaviesti saapuu Aavan tähdelle.',
    'kolmella pisteellä yksilöidyn reunakaaren', ['construct-short-boundary-arc', 'replace-chord-with-designated-arc'],
    'Kaari yksilöidään päätepisteillä ja kolmannella pisteellä. Saman kaaren vaihtoehtoiset välipisteet käyvät.'),
  partDef('M79-CIRCLE-BASIC', 'basic', 'Observatorion yhteinen kartta', 'Sulka tuo uuden pyöreän laitteen piirroksen.', 'Observatorion piirros sopii koko laitteeseen.',
    'säteen, halkaisijan, kehän ja kaaren sekä halkaisijan jakamisen kahdeksi säteeksi', ['construct-four-circle-parts', 'repair-map-and-link-four-parts'],
    'Integraation oma näyttö kattaa kaikki neljä rakennetta ja halkaisijan pituussuhteen. Se ei kirjaa atomeille uusia näyttöjä.'),
  angleDef('M79-CENTRAL-ANGLE', 'central', 'Keskuksesta avautuva ikkuna', 'Rakennat keskuskulman ja yhdistät sen kaareen ympyrän koosta riippumatta.',
    'Havaintoikkuna suuntautuu oikeaan kaareen.', ['build-centre-rays-and-arc', 'keep-angle-under-radius-change'],
    'Kaaren asteluku annetaan. Näyttö erottaa asteluvun ja säteen muutoksen. Kuvan pikseleistä ei mitata kulmaa.'),
  angleDef('M79-INSCRIBED-ANGLE-CONCEPT', 'inscribed', 'Katse kehän reunalta', 'Sijoitat kärjen kehälle ja rakennat kulman ja kaaren.',
    'Havaintopaikka saa oikean merkinnän.', ['build-inscribed-angle-from-arc', 'audit-and-relocate-inscribed-vertex'],
    'Kärjen, kylkien ja vastaavan kaaren valinnat tarkistetaan. Vaihtoehtoiset saman puolen kärjet käyvät.'),
  angleDef('M79-INSCRIBED-CENTRAL-REL', 'relation', 'Kahden havaitsijan suhde', 'Tuotat saman kaaren asteluvut ja vertaat eri puolen havaintoa.',
    'Havaitsijoiden kulmalaput sopivat samaan reittiin.', ['halve-same-arc-central-angle', 'double-angle-and-contrast-other-arc'],
    'Numeerinen ja kaarirakenteinen näyttö erottaa vastaavat kaaret. Mukana ovat suurempi kaari ja vastakkaisen kaaren täydentävä kehäkulma.'),
  angleDef('M79-INSCRIBED-ANGLE', 'integration', 'Reunapaikan yhteinen havainto', 'Yhdistät omassa kartassa kehäkulman rakenteen, vastaavan kaaren ja lasketun kulmasuhteen.',
    'Havaintokartan reitti voidaan avata.', ['construct-and-compute-same-arc', 'rebuild-relation-with-other-side'],
    'Integraatio tarkistaa kärjen, kyljet, oikean kaaren ja lasketut asteluvut. Yksi numerovastaus ei riitä.'),
  measureDef('M79-CIRCLE-CIRC', 'circumference', 'Reunavalon mitta', 'Lasket koko kehän pituuden ja tarkistat suuruusluokan.', 'Valonauha sulkeutuu kehälle.',
    ['exact-circumference-from-radius', 'approximate-circumference-from-diameter'],
    'Pituuden tarkka piikerroin ja pituusyksikkö tarkistetaan. Likiarvoperhe pyytää myös sovitun pyöristyksen.'),
  measureDef('M79-ARC', 'arc', 'Vain osa valonauhasta', 'Lasket kaaren pituuden osuutena kehästä.', 'Sovittu reunakaari syttyy.',
    ['partition-circumference-exactly', 'recover-radius-and-approximate-arc-length'],
    'Asteluvusta tuotetaan osuus ja nauhan pituus. Siirrossa valittu kaari ylittää puoliympyrän.'),
  measureDef('M79-CIRCLE-AREA', 'area', 'Pyöreän pihan peite', 'Lasket alan ja osoitat säteen neliövaikutuksen.', 'Peite kattaa kuivan havaintopihan.',
    ['square-radius-for-exact-area', 'convert-diameter-before-squaring-and-rounding'],
    'Säde, sen neliö ja neliöyksikkö tarkistetaan. Siirrossa alan muutoksen ennuste lukitaan ennen vertailua.'),
  measureDef('M79-SECTOR', 'sector', 'Tähtipihan oma nurkka', 'Lasket peitteen alan kulman osuutena ympyrän alasta.', 'Peite asettuu lukupaikalle.',
    ['partition-disk-area-exactly', 'recover-radius-and-approximate-sector-area'],
    'Sektorin pinta-ala ja neliöyksikkö tarkistetaan. Siirrossa lasketaan jäljelle jäävä ala.'),
  { id: 'M79-THALES', stop: 'Puoliympyrän yllätys', icon: '∟', intro: 'Loikka kokeilee havaintopaikkaa puoliympyrältä.',
    goal: 'Rakennat kaksi samaan halkaisijaan tukeutuvaa kulmaa, osoitat niiden asteluvun ja vertaat muuhun jänteeseen.',
    reward: 'Observatorion malliin löytyy suora kulma.', produceWhat: 'lukitun ennusteen, kaksi kärkeä ja oman vertailukulman',
    families: [['predict-and-move-on-semicircle', r => thales(r, 'build')], ['audit-thales-hypotheses-and-counterexample', r => thales(r, 'repair')]],
    transfer: r => thales(r, 'transfer'), limit: 'Tarkistetaan halkaisija, kaari, kaksi kelpaavaa kärkeä, 180°–90°-yhteys ja erillinen vertailujänne. Ennuste lukitaan ennen kulman havaintoa.' },
];

type CircleSpec = Omit<NodeSpec, 'item'> & { item(r: Rng, phase: Phase): CircleItem };
function spec(def: Definition): CircleSpec {
  const { families, transfer, limit: _limit, ...meta } = def;
  const rev = `exp690-circle-observatory-${def.id.toLowerCase()}-v1`;
  return { ...meta, rev, validRevs: [rev], produce: [...families.map(([tag]) => tag), 'transfer'],
    demo(r) { return families.map(([, author]) => {
      const example = author(r);
      return { say: example.explain!, scene: circleObservatoryExample(example.task) };
    }); },
    item(r, phase) {
      const [tag, author] = phase === 'transfer' ? ['transfer', transfer] as const : r.pick(families);
      return { ...author(r), tag };
    },
  };
}
export const circleObservatorySpecs: CircleSpec[] = defs.map(spec);
export const circleObservatoryEvidence: Readonly<Record<string, { families: readonly string[]; limit: string }>> =
  Object.fromEntries(defs.map(({ id, families, limit }) => [id, { families: families.map(([tag]) => tag), limit }]));
