import type { Rng } from '../engine/rng';
import type { Item, NodeSpec, Task } from '../engine/types';
import { cases } from './kit';
import {
  TRIANGLE_INDICES, className, ratioName, sideName, sideVertices, solutionRightTriangle, trigPair,
  type Point2, type RightTriangleDiagram, type RightTriangleTask, type TriangleIndex, type TriangleJob, type TrigRatio,
} from './models/right-triangle';
import { rightTrianglePaint, rightTriangleScene } from './scenes/right-triangle';

type Draft = Omit<Item, 'tag'> & { sceneModel?: ReturnType<typeof rightTriangleScene> };
type Family = readonly [tag: string, make: (r: Rng) => Draft];
type Triple = readonly [number, number, number];
const degree = Math.PI / 180;
const lengths: readonly Triple[] = [[5, 3, 4], [13, 5, 12], [17, 8, 15], [25, 7, 24], [29, 20, 21], [37, 12, 35]];
const shortLengths: readonly Triple[] = [[5, 3, 4], [13, 5, 12], [17, 8, 15], [25, 15, 20]];
const labels: readonly (readonly [string, string, string])[] = [['A','B','C'], ['L','M','N'], ['P','Q','R'], ['X','Y','Z']];
const byScale = (triple: Triple, n: number): Triple => [triple[0] * n, triple[1] * n, triple[2] * n];
const displayed = (values: Triple, indices: readonly TriangleIndex[]): RightTriangleDiagram['known'] =>
  Object.fromEntries(indices.map(i => [i, values[i]]));
const display = (x: string | number | undefined): string => String(x).replace('.', ',');
const round = (x: string | undefined): string => display(Number(Number(x).toFixed(1)));

function rotate(points: RightTriangleDiagram['points'], turn: number, reflected: boolean): RightTriangleDiagram['points'] {
  const project = ([x, y]: Point2): Point2 => {
    const a = reflected ? -x : x;
    return turn === 0 ? [a, y] : turn === 1 ? [-y, a] : turn === 2 ? [-a, -y] : [y, -a];
  };
  return [project(points[0]), project(points[1]), project(points[2])];
}

function board(r: Rng, values: Triple, options: {
  name: string; markedRight?: boolean; focus?: TriangleIndex; known?: readonly TriangleIndex[];
  target?: TriangleIndex; markedAngle?: number; fixed?: boolean; unit?: 'm' | 'cm'; labelOffset?: number; turn?: number;
}): RightTriangleDiagram {
  const [diagonal, upright, horizontal] = values;
  const foot = options.markedRight ? 0 : (upright ** 2 + horizontal ** 2 - diagonal ** 2) / (2 * horizontal);
  const high = options.markedRight ? upright : Math.sqrt(upright ** 2 - foot ** 2);
  const points: RightTriangleDiagram['points'] = [[0, 0], [horizontal, 0], [foot, high]];
  const label = options.labelOffset === undefined ? r.pick(labels) : labels[options.labelOffset % labels.length]!;
  return {
    name: options.name, labels: label, unit: options.unit ?? 'm',
    known: displayed(values, options.known ?? TRIANGLE_INDICES),
    points: options.fixed ? points : rotate(points, options.turn ?? r.int(0, 3), r.chance(.5)),
    ...(options.markedRight ? { right: 0 as const } : {}),
    ...(options.focus === undefined ? {} : { focus: options.focus }),
    ...(options.target === undefined ? {} : { target: options.target }),
    ...(options.markedAngle === undefined ? {} : { markedAngle: options.markedAngle }),
  };
}

function explain(task: RightTriangleTask): string {
  const solution = solutionRightTriangle(task);
  return task.jobs.map((job, index) => {
    const a = task.diagrams[job.board]!, work = solution.work[index]!;
    const pair = work.pair?.map(side => sideName(a, side));
    switch (job.kind) {
      case 'identity':
        return `${pair![0]}² + ${pair![1]}² = ${sideName(a, work.single!)}². Hypotenuusa on suoran kulman vastainen sivu. Vertailukolmio on ${className[work.judgment!]}.`;
      case 'converse': return `Pisin sivu on ${sideName(a, work.single!)}. Vertaa ${display(work.sum)} ja ${display(work.square)}. Kolmio on ${className[work.judgment!]}.`;
      case 'pyth-length': return `${sideName(a, job.target)}² = ${display(a.known[work.pair![0]!]!)}² ${work.rule === 'sqrt-sum' ? '+' : '−'} ${display(a.known[work.pair![1]!]!)}² = ${display(work.square)}. Pituus on √${display(work.square)} ${a.unit} eli noin ${round(work.value)} ${a.unit}.`;
      case 'ratio': return `${ratioName[work.ratio!]} kulmalle ${a.labels[job.focus]} on ${pair![0]} / ${pair![1]}${work.value ? ` = ${work.value}` : ''}.`;
      case 'trig-side': return `${work.ratio}(${display(job.degrees)}°) = ${pair![0]} / ${pair![1]}. Eristä tuntematon sivu ${work.rule === 'times' ? 'kertomalla' : 'jakamalla'} ja saat noin ${round(work.value)} ${a.unit}.`;
      case 'trig-angle': return `Kulma ${a.labels[job.focus]} = ${work.ratio}⁻¹(${display(a.known[work.pair![0]!]!)}/${display(a.known[work.pair![1]!]!)}), noin ${round(work.value)}°.`;
    }
  }).join(' ');
}

function make(task: Omit<RightTriangleTask, 'kind'>, say: string, hint: string): Draft {
  const full: RightTriangleTask = { kind: 'right-triangle', ...task };
  const paint = rightTrianglePaint(full);
  const explanation = explain(full);
  const sceneModel = rightTriangleScene(full);
  return {
    task: full as unknown as Task, say, hint, explain: explanation, scene: paint,
    ...(sceneModel ? { sceneModel } : {}),
    afterCorrect: host => {
      paint(host);
      const worked = document.createElement('p');
      worked.textContent = explanation;
      host.append(worked);
    },
  };
}
function spec(id: string, stop: string, intro: string, goal: string, reward: string, first: Family, second: Family, transfer: Family[1]): NodeSpec {
  const rev = `right-triangle-${id.toLowerCase()}-v1`;
  return {
    id, stop, icon: '△', intro, goal, reward, rev, validRevs: [rev],
    produce: [first[0], second[0]], produceWhat: 'oma sivuyhtälö, sivusuhde tai perusteltu laskurivi',
    demo: r => {
      const sample = first[1](r);
      return [{ scene: sample.afterCorrect!, sceneModel: sample.sceneModel, say: sample.explain }];
    },
    item: cases({ [first[0]]: first[1], [second[0]]: second[1] }, transfer),
  };
}
const pit = 'Oikean kulman vastainen sivu on hypotenuusa, vaikka kuvio käännetään.';
const angleHint = 'Aloita oranssista tarkastelukulmasta. Tunnista ensin hypotenuusa, sitten kulmasta vastapäätä oleva kateetti.';
const roundPrompt = 'Anna tarkka tulos tai pyöristä lähimpään kymmenesosaan.';
const rightTriplet = (r: Rng, small = false) => byScale(r.pick(small ? shortLengths : lengths), r.int(1, small ? 4 : 3));
const almost = (triple: Triple, direction: -1 | 1): Triple => [triple[0] + direction, triple[1], triple[2]];

function identity(r: Rng, contrast: -1 | 1, swap = false): Draft {
  const values = rightTriplet(r, true);
  const squareBoard = board(r, values, { name: 'Kolmen neliön malli', markedRight: true, known: [], unit: 'cm', ...(swap ? { labelOffset: 2, turn: 1 } : {}) });
  const comparison = board(r, almost(values, contrast), { name: 'Vertailukolmio', unit: 'cm', ...(swap ? { labelOffset: 3 } : {}) });
  return make({ diagrams: [squareBoard, comparison], jobs: [{ kind: 'identity', board: 0, comparison: 1 }] },
    'Aseta kolme neliöalaa yhtälöön. Tutki sitten vertailukolmion pisintä sivua ja luokittele kolmio.', pit);
}
function converse(r: Rng, variant: 'exact' | 'almost' | 'transfer'): Draft {
  const values = rightTriplet(r);
  const compared = variant === 'exact' ? values : almost(values, variant === 'transfer' || r.chance(.5) ? 1 : -1);
  const figure = board(r, compared, { name: 'Tukikolmion sivumitattu malli', unit: 'cm' });
  return make({ diagrams: [figure], jobs: [{ kind: 'converse', board: 0 }] },
    'Valitse pisin sivu, laske molemmat neliövertailun luvut ja päättele, onko kolmio suora-, terävä- vai tylppäkulmainen.',
    'Älä päätä piirroksen perusteella. Vertaa kahden lyhyemmän neliöiden summaa pisimmän neliöön.');
}
function pythLength(r: Rng, target: TriangleIndex): Draft {
  let values: Triple = rightTriplet(r, true);
  if (target === 0 && r.chance(.5)) {
    const [a, b] = [r.int(3, 12), r.int(4, 15)];
    values = [Math.hypot(a, b), a, b];
  }
  const model = board(r, values, { name: target === 0 ? 'Tasanteiden välinen malliköysi' : 'Tasanteen tuntematon etäisyys', markedRight: true,
    known: sideVertices(target), target, fixed: true });
  return make({ diagrams: [model], jobs: [{ kind: 'pyth-length', board: 0, target }], setting: 'rope' },
    `Muodosta neliöyhtälö, laske tuntemattoman neliö ja ratkaise pituus. ${roundPrompt}`, pit);
}

function oneRatio(r: Rng, taught: TrigRatio, variant: 'single' | 'scale' | 'transfer'): Draft {
  const values = rightTriplet(r, true);
  const ramp = variant === 'transfer' && taught === 'tan';
  const focus: TriangleIndex = (taught === 'tan' ? variant === 'scale' : variant === 'transfer') ? 2 : 1;
  const name = ramp ? 'Luiskan sivukuva' : variant === 'scale' ? 'Pienempi samanmuotoinen malli' : 'Mittauskolmio';
  const diagrams = [board(r, values, { name, markedRight: true, focus, fixed: ramp })];
  const jobs: TriangleJob[] = [{ kind: 'ratio', board: 0, focus, taught }];
  if (variant === 'scale') {
    diagrams.push(board(r, byScale(values, r.int(2, 4)), { name: 'Suurempi samanmuotoinen malli', markedRight: true, focus }));
    jobs.push({ kind: 'ratio', board: 1, focus, taught });
  }
  return make({ diagrams, jobs }, variant === 'scale'
    ? `Muodosta ${ratioName[taught]} kummassakin kolmiossa. Anna kummankin suhde murtolukuna tai kolmen desimaalin tarkkuudella.`
    : `Muodosta ${ratioName[taught]} merkitylle kulmalle. Anna suhde murtolukuna tai kolmen desimaalin tarkkuudella.`, angleHint);
}
function integration(r: Rng, mode: 'three-windows' | 'one-card' | 'transfer'): Draft {
  const values = rightTriplet(r, true), focus: TriangleIndex = mode === 'transfer' ? 2 : 1;
  const diagrams = [board(r, values, { name: 'Kolmen suhteen mittauskortti', markedRight: true, focus })];
  const order = r.shuffle(['sin','cos','tan'] as const);
  const jobs: TriangleJob[] = order.map(ratio => {
    const [a, b] = trigPair(0, focus, ratio);
    return { kind: 'ratio', board: 0, focus, offered: r.chance(.5) ? [a, b] : [b, a], calculate: mode === 'three-windows' };
  });
  if (mode === 'three-windows') {
    diagrams[0] = { ...diagrams[0]!, name: 'Kolme nimettyä sivuparia' };
  } else {
    // Without lengths this family tests whether each side pair determines a ratio.
    diagrams[0] = { ...diagrams[0]!, name: 'Kolmio ilman mittalukuja', known: {} };
  }
  return make({ diagrams, jobs }, 'Muodosta kolmelle sivuparille funktio sekä osoittaja ja nimittäjä. Käytä merkittyä kulmaa.'
    + (mode === 'three-windows' ? ' Anna myös arvot murtolukuina tai kolmen desimaalin tarkkuudella.' : ''), angleHint);
}

function sideCase(r: Rng, ratio: TrigRatio, targetInNumerator: boolean, focus: 1 | 2, name: string): { diagram: RightTriangleDiagram; job: Extract<TriangleJob, { kind: 'trig-side' }> } {
  const degrees = r.pick([24, 28, 32, 37, 42, 48, 54, 61, 66]);
  const pair = trigPair(0, focus, ratio);
  const target = pair[targetInNumerator ? 0 : 1], given = pair[targetInNumerator ? 1 : 0];
  const angle = degrees * degree;
  const unitTriangle: Triple = focus === 1 ? [1, Math.sin(angle), Math.cos(angle)] : [1, Math.cos(angle), Math.sin(angle)];
  const givenLength = r.int(3, 20);
  const values = byScale(unitTriangle, givenLength / unitTriangle[given]);
  const diagram = { ...board(r, values, { name, markedRight: true, focus, known: [given], target, markedAngle: degrees, fixed: true }),
    known: { [given]: givenLength } };
  return { diagram, job: { kind: 'trig-side', board: 0, focus, taught: ratio, target, given, degrees } };
}
function angleCase(r: Rng, ratio: TrigRatio, focus: 1 | 2, name: string) {
  const values = rightTriplet(r, true);
  const pair = trigPair(0, focus, ratio);
  const diagram = board(r, values, { name, markedRight: true, focus, known: pair, fixed: true });
  const job: TriangleJob = { kind: 'trig-angle', board: 0, focus, taught: ratio };
  return { diagram, job };
}
function trigSide(r: Rng, variant: 'height' | 'length' | 'transfer'): Draft {
  const ratio = 'tan';
  const { diagram, job } = sideCase(r, ratio, variant !== 'length', variant === 'transfer' ? 2 : 1,
    variant === 'height' ? 'Rannan merkin korkeus' : variant === 'length' ? 'Havaintopaikan vaakamatka' : 'Luiskan mallietäisyys');
  return make({ diagrams: [diagram], jobs: [job], setting: 'height', context: { kind: 'trig', ratio } },
    `Muodosta tangenttiyhtälö merkitylle kulmalle ja ratkaise tuntematon sivu. ${roundPrompt}`, angleHint);
}
function trigAngle(r: Rng, variant: 'low' | 'top' | 'transfer'): Draft {
  const ratio = 'cos';
  const { diagram, job } = angleCase(r, ratio, variant === 'low' ? 1 : 2,
    variant === 'low' ? 'Rannalta suunnattu havaintoputki' : variant === 'top' ? 'Ylemmän telineen havaintokulma' : 'Uuden merkin katselukulma');
  return make({ diagrams: [diagram], jobs: [job], setting: 'sighting', context: { kind: 'trig', ratio } },
    `Muodosta kosinin sivusuhde, ratkaise merkitty kulma asteina ja tarkista, että kulma on terävä. ${roundPrompt}`, angleHint);
}
function trigBoth(r: Rng, variant: 'rise' | 'base' | 'transfer'): Draft {
  const side = sideCase(r, variant === 'rise' ? 'sin' : 'tan', variant === 'rise', variant === 'transfer' ? 2 : 1, 'Malliköyden mitoitus');
  const angle = angleCase(r, variant === 'rise' ? 'tan' : 'cos', variant === 'transfer' ? 2 : 1, 'Merkkivalon suuntaus');
  return make({ diagrams: [side.diagram, angle.diagram], jobs: [side.job, { ...angle.job, board: 1 }], setting: 'relay' },
    `Ratkaise reittisuunnitelmaan sekä puuttuva sivu että puuttuva kulma. Tarkista kummankin suhde ja yksikkö. ${roundPrompt}`, angleHint);
}

export const rightTriangleSpecs: NodeSpec[] = [
  spec('M79-PYTH-01','Kolmen neliön silta','Aava sovittaa kolme neliölaattaa köysisillan pienoismallin ympärille.','Rakenna suorakulmaisen kolmion neliöyhtälö.','Sillan suunnitelmaan piirtyy ylityksen mahdollisuus.',
    ['acute-contrast',r=>identity(r,-1)],['obtuse-contrast',r=>identity(r,1)],r=>identity(r,1,true)),
  spec('M79-PYTH-CONVERSE','Onko kulma todella suora','Loikan tukipuu näyttää suoralta, mutta Aava mittasi kolme sivua.','Ratkaise kulman laji sivujen neliövertailulla.','Tukikolmio saa paikan sillan pienoismallissa.',
    ['exact-brace',r=>converse(r,'exact')],['near-miss',r=>converse(r,'almost')],r=>converse(r,'transfer')),
  spec('M79-PYTH-CALC','Köysi yli kallion','Kahden tasanteen väli on mallissa mitattavissa. Aava tarvitsee puuttuvan pituuden ennen köyden tilaamista.','Ratkaise hypotenuusa tai kateetti neliöyhtälöstä.','Mitoitettu malliköysi yhdistää retkikorin tasanteet.',
    ['find-rope',r=>pythLength(r,0)],['find-rise',r=>pythLength(r,1)],r=>pythLength(r,2)),
  spec('M79-SIN','Köyden nousun osuus','Loikka haluaa mitata, kuinka suuri osa köyden pituudesta on nousua.','Muodosta vastaisen kateetin ja hypotenuusan suhde.','Nousun osuus merkitään mittauskorttiin.',
    ['side-roles',r=>oneRatio(r,'sin','single')],['scale-comparison',r=>oneRatio(r,'sin','scale')],r=>oneRatio(r,'sin','transfer')),
  spec('M79-COS','Köyden vaakasuora osuus','Aava mittaa köyden vaakasuuntaista osuutta uudesta havaintopaikasta.','Muodosta viereisen kateetin ja hypotenuusan suhde.','Vaakamatkan suunnitelma täydentyy.',
    ['side-roles',r=>oneRatio(r,'cos','single')],['scale-comparison',r=>oneRatio(r,'cos','scale')],r=>oneRatio(r,'cos','transfer')),
  spec('M79-TAN','Nousu suhteessa etenemään','Luiskan pienoismalli tarvitsee nousun suhteessa etenemiseen.','Muodosta vastaisen ja viereisen kateetin suhde.','Luiskan noususuhde saadaan rakennuslappuun.',
    ['side-roles',r=>oneRatio(r,'tan','single')],['scale-comparison',r=>oneRatio(r,'tan','scale')],r=>oneRatio(r,'tan','transfer')),
  spec('M79-TRIG-01','Kolme ikkunaa samaan kolmioon','Aava ja Loikka kokoavat yhden mittauskortin kolmelle eri sivuparille.','Muodosta sini, kosini ja tangentti annetuille sivupareille.','Yhteinen mittauskortti avaa kolme näkymää samaan köysisiltaan.',
    ['measured-pairs',r=>integration(r,'three-windows')],['structural-pairs',r=>integration(r,'one-card')],r=>integration(r,'transfer')),
  spec('M79-TRIG-SIDE','Majakan saavuttamaton korkeus','Aava mittaa merkin paikan turvallisesti rannalta.','Ratkaise puuttuva sivu tangenttiyhtälöstä.','Merkin paikka saadaan mallikartalle.',
    ['find-height',r=>trigSide(r,'height')],['find-run',r=>trigSide(r,'length')],r=>trigSide(r,'transfer')),
  spec('M79-TRIG-ANGLE','Viestin oikea katselukulma','Loikka asettaa havaintoputken kohti vastarannan merkkivaloa.','Ratkaise kulma kosinin käänteisfunktiolla asteina.','Havaintoputki kohtaa vastarannan merkkivalon.',
    ['look-up',r=>trigAngle(r,'low')],['view-from-above',r=>trigAngle(r,'top')],r=>trigAngle(r,'transfer')),
  spec('M79-TRIG-CALC','Kallion viestiyhteys','Retkiryhmä tarvitsee sekä mitoituksen malliköydelle että suunnan valomerkille.','Ratkaise erikseen puuttuva sivu ja puuttuva kulma.','Paikallinen viestiyhteys avautuu, ja retkiryhmä vastaa valomerkein.',
    ['rise-and-angle',r=>trigBoth(r,'rise')],['base-and-angle',r=>trigBoth(r,'base')],r=>trigBoth(r,'transfer')),
];
export const rightTriangleEvidence = Object.fromEntries(rightTriangleSpecs.map(s => [s.id, {
  families: s.produce ?? [],
  limit: 'Tarkistin arvioi oppijan rakentamat sivuparit, neliöyhtälön tai laskun vaiheet ja pyydetyt tulokset. Vapaa todistus, fyysinen etämittaus ja mittalaitteen käsittely edellyttävät erillistä näyttöä.',
}]));
