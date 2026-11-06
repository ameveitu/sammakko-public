import { parseMeasure } from './spatial-measures';

export type CirclePoint = { id: string; angle: number; place: 'rim' | 'inside' | 'centre' };
export type CircleBoard = {
  points: readonly CirclePoint[];
  drawing: { x: number; y: number; radius: number };
  setting: string;
};
export type Segment = readonly [string, string];
export type CircleArc = { ends: Segment; via: string };
export type ArcRequest = 'short' | 'long' | 'via';
type Part = 'radius' | 'diameter' | 'circumference' | 'arc' | 'basic';
export type PartDraft = { kind: 'radius' | 'diameter' | 'arc'; segment: Segment } |
  { kind: 'circumference'; route: readonly string[] } | { kind: 'area' };
type PartMode = {
  mode: 'parts'; part: Part; arcEnds: Segment; arcRequest: ArcRequest; through: string;
  prefix?: readonly string[]; draft?: PartDraft; radius: number; unit: string;
};
type AngleMode = {
  mode: 'angles'; skill: 'central' | 'inscribed' | 'relation' | 'integration';
  ends: Segment; through: string; given?: { angle: 'central' | 'inscribed'; degrees: number };
  comparison?: number; audit?: string; otherSide?: string; distractor?: Segment; relocate?: true;
};
export type CircleMeasure = 'circumference' | 'arc' | 'area' | 'sector';
type MeasureMode = {
  mode: 'measure'; measure: CircleMeasure; given: { length: number; kind: 'radius' | 'diameter' };
  unit: string; angle?: number; remainder?: true; compareRadius?: number;
  result: 'exact' | 'approx' | 'either'; decimals: 1 | 2;
};
type ThalesMode = {
  mode: 'thales'; ends: Segment; compare: Segment; compareVertex: string; through: string;
  candidate?: string;
};
export type CircleObservatoryTask = (PartMode | AngleMode | MeasureMode | ThalesMode) & {
  kind: 'circle-observatory'; board: CircleBoard; context: { title: string; skills: readonly string[] };
};
type PartResponse = {
  mode: 'parts'; radii: Segment[]; diameter: Segment; circumference: string[]; arc: CircleArc;
  values: string[]; draftWorks: boolean | null;
};
type AngleResponse = {
  mode: 'angles'; vertex: string; moved: string; rays: Segment; arc: CircleArc;
  central: string; inscribed: string; resized: string; auditWorks: boolean | null; otherArc: CircleArc; otherInscribed: string;
};
type MeasureResponse = {
  mode: 'measure'; radius: string; share: string; coefficient: string; result: string;
  notation: 'exact' | 'approx' | null; unit: string; lower: string; upper: string;
  prediction: string; locked: boolean; enlargedCoefficient: string;
};
type ThalesResponse = {
  mode: 'thales'; vertices: Segment; arc: CircleArc; central: string; inscribed: string; locked: boolean;
  compareArc: CircleArc; compareCentral: string; compareInscribed: string; candidateWorks: boolean | null;
};
export type CircleObservatoryResponse = (PartResponse | AngleResponse | MeasureResponse | ThalesResponse) & { kind: 'circle-observatory' };
type Task<M extends CircleObservatoryTask['mode']> = Extract<CircleObservatoryTask, { mode: M }>;
const kind = 'circle-observatory' as const;
const pass = { ok: true };
const fail = (why: string) => ({ ok: false, why });
export const circleTurn = (from: number, to: number) => ((to - from) % 360 + 360) % 360;
const point = (board: CircleBoard, id: string) => board.points.find(p => p.id === id);
const rim = (board: CircleBoard, id: string) => {
  const p = point(board, id);
  return p?.place === 'rim' ? p : undefined;
};
const centre = (board: CircleBoard, id: string) => point(board, id)?.place === 'centre';
export const circleRim = (board: CircleBoard) => board.points.filter(p => p.place === 'rim').sort((a, b) => a.angle - b.angle);
const open = (from: number, to: number, through: number) => {
  const t = circleTurn(from, through);
  return t > 0 && t < circleTurn(from, to);
};
const sameEnds = (a: unknown, b: Segment): a is Segment =>
  Array.isArray(a) && a.length === 2 && a[0] !== a[1] && ((a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0]));

/** An arc is the open side from its clockwise start to end and its two endpoints. A third point identifies the side. */
export function circleArc(board: CircleBoard, arc: CircleArc | undefined) {
  if (!arc || !Array.isArray(arc.ends) || arc.ends.length !== 2) return;
  const a = rim(board, arc.ends[0]), b = rim(board, arc.ends[1]), via = rim(board, arc.via);
  if (!a || !b || !via || a.angle === b.angle || via.angle === a.angle || via.angle === b.angle) return;
  const [start, end] = open(a.angle, b.angle, via.angle) ? [a, b] : [b, a];
  return { start, end, degrees: circleTurn(start.angle, end.angle) };
}
export function circleArcHas(board: CircleBoard, arc: CircleArc, id: string) {
  const route = circleArc(board, arc), p = rim(board, id);
  return !!route && !!p && open(route.start.angle, route.end.angle, p.angle);
}
export function circleArcOptions(board: CircleBoard, ends: Segment) {
  return circleRim(board).filter(p => !ends.includes(p.id)).map(({ id }) => ({ ends, via: id }))
    .filter(arc => circleArc(board, arc));
}
function radius(board: CircleBoard, segment: Segment | undefined): boolean {
  return Array.isArray(segment) && segment.length === 2 &&
    ((centre(board, segment[0]) && !!rim(board, segment[1])) || (centre(board, segment[1]) && !!rim(board, segment[0])));
}
function diameter(board: CircleBoard, segment: Segment | undefined): boolean {
  if (!Array.isArray(segment) || segment.length !== 2) return false;
  const a = rim(board, segment[0]), b = rim(board, segment[1]);
  return !!a && !!b && circleTurn(a.angle, b.angle) === 180;
}
function circumference(board: CircleBoard, route: readonly string[] | undefined): boolean {
  const order = circleRim(board).map(({ id }) => id);
  if (!Array.isArray(route) || route.length !== order.length + 1 || route[0] !== route[route.length - 1]) return false;
  const start = order.indexOf(route[0]);
  return start >= 0 && [1, -1].some(dir => order.every((_, i) => route[i] === order[(start + dir * i + order.length) % order.length]));
}
function correctDraft(board: CircleBoard, draft: PartDraft): boolean {
  switch (draft.kind) {
    case 'radius': return radius(board, draft.segment);
    case 'diameter': return diameter(board, draft.segment);
    case 'circumference': return circumference(board, draft.route);
    case 'arc': return false; // The draft is the straight chord, drawn between its ends.
    case 'area': return false;
  }
}
function requestedArc(task: Task<'parts'>, route: CircleArc) {
  if (!sameEnds(route?.ends, task.arcEnds)) return false;
  const shape = circleArc(task.board, route);
  if (!shape) return false;
  if (task.arcRequest === 'short') return shape.degrees < 180;
  if (task.arcRequest === 'long') return shape.degrees > 180;
  return circleArcHas(task.board, route, task.through);
}
function requestedAngleArc(task: Task<'angles'> | Task<'thales'>, arc: CircleArc) {
  return sameEnds(arc?.ends, task.ends) && circleArcHas(task.board, arc, task.through);
}
function validVertex(task: Task<'angles'> | Task<'thales'>, v: string) {
  return !!rim(task.board, v) && !task.ends.includes(v) &&
    !circleArcHas(task.board, { ends: task.ends, via: task.through }, v);
}
const q = (raw: unknown) => typeof raw === 'string' && raw.length <= 32 ? parseMeasure(raw) : undefined;
const has = (raw: unknown, n: number | bigint, d: number | bigint = 1) => {
  const parsed = q(raw);
  return !!parsed && parsed[0] * BigInt(d) === BigInt(n) * parsed[1];
};
const centralValue = (task: Task<'angles'> | Task<'thales'>) =>
  circleArc(task.board, { ends: task.ends, via: task.through })!.degrees;

function checkParts(task: Task<'parts'>, response: PartResponse) {
  const { part, board } = task;
  if (task.draft && response.draftWorks !== correctDraft(board, task.draft))
    return fail('Tarkista luonnoksen päätepisteet, keskuksen paikka ja se, kulkeeko reitti kehää pitkin.');
  if (part === 'radius' || part === 'basic') {
    const radii = response.radii;
    if (!Array.isArray(radii) || radii.length !== (part === 'radius' ? 2 : 1) || !Array.from(radii).every(v => radius(board, v)) ||
        (radii.length === 2 && radii[0].some(id => !centre(board, id) && radii[1].includes(id))))
      return fail('Säde yhdistää keskuksen kehäpisteeseen. Valitse säteille eri kehäpäät, kun tarvitaan kaksi sädettä.');
  }
  if ((part === 'diameter' || part === 'basic') && !diameter(board, response.diameter))
    return fail('Halkaisijan molemmat päät ovat kehällä ja jana kulkee keskuksen kautta.');
  if ((part === 'circumference' || part === 'basic') &&
      (!circumference(board, response.circumference) || (task.prefix && !task.prefix.every((p, i) => response.circumference[i] === p))))
    return fail('Seuraa vierekkäisiä merkkejä kehällä yhteen suuntaan ja palaa aloituspisteeseen.');
  if ((part === 'arc' || part === 'basic') && !requestedArc(task, response.arc))
    return fail('Kaari kulkee päätepisteiden välillä kehää pitkin. Välimerkki erottaa reitin toisesta kaaresta ja suorasta jänteestä.');
  const expected = part === 'radius' ? [task.radius, task.radius] :
    part === 'diameter' || part === 'basic' ? [task.radius, task.radius, 2 * task.radius] : [];
  if (!Array.isArray(response.values) || response.values.length !== expected.length ||
      !expected.every((value, i) => has(response.values[i], value)))
    return fail('Käytä kartan säteen mittaa. Keskuksen kohdalla halkaisija jakautuu kahteen yhtä pitkään säteeseen.');
  return pass;
}
function checkAngles(task: Task<'angles'>, response: AngleResponse) {
  const { skill, board } = task;
  const rightVertex = skill === 'central' ? centre(board, response.vertex) : validVertex(task, response.vertex);
  if (!rightVertex || !sameEnds(response.rays, task.ends))
    return fail(skill === 'central' ? 'Keskuskulman kärki on keskuksessa, ja sen kyljet kulkevat kaaren päätepisteisiin.'
      : 'Kehäkulman kärki ja kylkien päät ovat kehällä. Kärki ei kuulu kulmaa vastaavalle kaarelle.');
  if (task.relocate && (response.moved === response.vertex || !validVertex(task, response.moved)))
    return fail('Siirrä kärki toiseen kehäpisteeseen samalla puolella. Kaaren ja kylkien päät pysyvät samoina.');
  if (!requestedAngleArc(task, response.arc))
    return fail('Sido kulma täsmälleen samaan merkittyyn kaareen. Samat päät voivat rajata lyhyen tai pitkän reitin.');
  if (task.audit && response.auditWorks !== validVertex(task, task.audit))
    return fail('Tarkista, onko ehdokas kehällä ja jääkö hän valitun kaaren ulkopuolelle.');
  const sweep = centralValue(task);
  if (skill === 'central' && (!has(response.central, sweep) || (task.comparison && !has(response.resized, sweep))))
    return fail('Keskuskulma kertoo avautuman, ei reunan pituutta. Samat suunnat antavat saman kulman eri kokoisissa ympyröissä.');
  if ((skill === 'relation' || skill === 'integration') && (!has(response.central, sweep) || !has(response.inscribed, sweep, 2)))
    return fail('Saman kaaren kehäkulma on puolet kaaren keskuskulmasta. Tarkista myös pitkän kaaren puoli.');
  if (task.otherSide) {
    const other = circleArc(board, response.otherArc);
    if (!sameEnds(response.otherArc?.ends, task.ends) || !other ||
        circleArcHas(board, response.otherArc, task.otherSide) ||
        !has(response.otherInscribed, other.degrees, 2))
      return fail('Toiselta puolelta katsova kärki näkee toisen kaaren. Nämä kaksi kehäkulmaa ovat yhteensä 180°.');
  }
  return pass;
}
function roundedRatio(n: bigint, d: bigint, decimals: number) {
  const scale = 10n ** BigInt(decimals);
  return (2n * n * scale + d) / (2n * d);
}
const approximation = [3141592653589793n, 1000000000000000n] as const;
export const circlePiApproximation = '3,141592653589793';
export function circleMeasureValues(task: Task<'measure'>) {
  const rN = BigInt(task.given.length), rD = task.given.kind === 'radius' ? 1n : 2n;
  const area = task.measure === 'area' || task.measure === 'sector';
  const partial = task.measure === 'arc' || task.measure === 'sector';
  const sweep = BigInt(task.angle ?? 360);
  const sN = partial ? task.remainder ? 360n - sweep : sweep : 1n, sD = partial ? 360n : 1n;
  const n = (area ? rN * rN : 2n * rN) * sN, d = (area ? rD * rD : rD) * sD;
  const display = roundedRatio(n * approximation[0], d * approximation[1], task.decimals);
  return { rN, rD, sN, sD, n, d, display, area, partial };
}
function checkMeasure(task: Task<'measure'>, response: MeasureResponse) {
  const { rN, rD, sN, sD, n, d, display, area, partial } = circleMeasureValues(task);
  if (task.compareRadius !== undefined && (response.locked !== true ||
      !has(response.prediction, BigInt(task.compareRadius) ** 2n * rD * rD, rN * rN)))
    return fail('Lukitse ensin oma ennuste. Vertaa pinta-aloja säteiden suhteen neliön avulla.');
  if (!has(response.radius, rN, rD)) return fail('Säde on puolet halkaisijasta. Käytä kartassa ilmoitettua mittaa.');
  if (partial && !has(response.share, sN, sD)) return fail('Vertaa valitun kaaren keskuskulmaa täyteen 360 asteen kierrokseen.');
  if (!has(response.coefficient, n, d))
    return fail(area ? 'Käytä säteen neliötä. Jos peite kattaa vain osan pihasta, ota alan osuus.'
      : 'Koko kehä on kaksi sädettä kertaa pii. Jos tarvitaan osa nauhasta, kerro vielä kaaren osuudella.');
  if (response.unit !== (area ? task.unit + '²' : task.unit))
    return fail('Merkitse pituus pituusyksiköllä ja peitettävä ala neliöyksiköllä.');
  if (response.notation !== 'exact' && response.notation !== 'approx' ||
      task.result !== 'either' && response.notation !== task.result)
    return fail('Merkitse tarkka piin sisältävä tulos tai sovitusti pyöristetty likiarvo tehtävän pyynnön mukaan.');
  if (response.notation === 'approx' && !has(response.result, display, 10n ** BigInt(task.decimals)))
    return fail('Laske piin ilmoitetulla likiarvolla ja pyöristä vasta lopuksi annettuun tarkkuuteen.');
  if (task.measure === 'circumference' && (!has(response.lower, 3) || !has(response.upper, 4)))
    return fail('Arvioi kehän pituus kokonaisina halkaisijan mittoina. Minkä kahden peräkkäisen kokonaisluvun väliin se jää?');
  if (task.compareRadius !== undefined && !has(response.enlargedCoefficient, BigInt(task.compareRadius) ** 2n))
    return fail('Laske myös uuden pihan alan kerroin käyttämällä uuden säteen neliötä.');
  return pass;
}
export function circleInterceptedArc(board: CircleBoard, ends: Segment, vertex: string) {
  return circleArcOptions(board, ends).find(arc => !ends.includes(vertex) && !!rim(board, vertex) && !circleArcHas(board, arc, vertex));
}
function checkThales(task: Task<'thales'>, response: ThalesResponse) {
  const [first, second] = Array.isArray(response.vertices) ? response.vertices : [];
  if (response.locked !== true || response.vertices?.length !== 2 || !first || !second || !validVertex(task, first) || !validVertex(task, second) || first === second)
    return fail('Lukitse ennuste ja siirry sitten toiseen kehäpisteeseen samalla puoliympyrällä. Halkaisijan päät eivät kelpaa kärjeksi.');
  if (!diameter(task.board, task.ends) || !requestedAngleArc(task, response.arc) ||
      !has(response.central, 180) || !has(response.inscribed, 90))
    return fail('Halkaisija rajaa puoliympyrän. Sen keskuskulma on 180°, ja kehäkulma on puolet siitä.');
  if (task.candidate && response.candidateWorks !== validVertex(task, task.candidate))
    return fail('Tarkista, jääkö luonnoksen kärki valitun puoliympyrän ulkopuolelle ja onko se kehällä.');
  const comparison = circleArc(task.board, response.compareArc);
  if (diameter(task.board, task.compare) || !sameEnds(response.compareArc?.ends, task.compare) || !comparison ||
      circleArcHas(task.board, response.compareArc, task.compareVertex) ||
      !has(response.compareCentral, comparison.degrees) || !has(response.compareInscribed, comparison.degrees, 2))
    return fail('Vertailujänne ei ole halkaisija. Käytä kaarta, joka ei sisällä vertailukulman kärkeä, ja puolita sen keskuskulma.');
  return pass;
}
export function checkCircleObservatory(task: CircleObservatoryTask, response: CircleObservatoryResponse) {
  if (response?.kind === kind) {
    if (task.mode === 'parts' && response.mode === 'parts') return checkParts(task, response);
    if (task.mode === 'angles' && response.mode === 'angles') return checkAngles(task, response);
    if (task.mode === 'measure' && response.mode === 'measure') return checkMeasure(task, response);
    if (task.mode === 'thales' && response.mode === 'thales') return checkThales(task, response);
  }
  return fail('Täydennä tämän havaintopöydän merkinnät.');
}
function scalar(n: bigint, d: bigint) {
  let a = n, b = d;
  while (b) [a, b] = [b, a % b];
  return d === a ? String(n / a) : `${n / a}/${d / a}`;
}
function wholeRoute(task: Task<'parts'>) {
  const order = circleRim(task.board).map(({ id }) => id);
  const start = order.indexOf(task.prefix?.[0] ?? order[0]);
  const dir = !task.prefix || task.prefix[1] === order[(start + 1) % order.length] ? 1 : -1;
  return Array.from({ length: order.length + 1 }, (_, i) => order[(start + dir * i + order.length) % order.length]);
}
export function solutionCircleObservatory(task: CircleObservatoryTask): CircleObservatoryResponse {
  const board = task.board;
  const order = circleRim(board).map(({ id }) => id), origin = board.points.find(p => p.place === 'centre')!.id;
  switch (task.mode) {
    case 'parts': {
      const d = order.flatMap(a => order.map(b => [a, b] as const)).find(pair => diameter(board, pair))!;
      const arc = circleArcOptions(board, task.arcEnds).find(v => requestedArc(task, v))!;
      return { kind, mode: 'parts', radii: task.part === 'radius' ? [[origin, order[0]], [origin, order[1]]] :
        task.part === 'basic' ? [[origin, d[0]]] : [], diameter: d, circumference: wholeRoute(task), arc,
        values: task.part === 'radius' ? [task.radius, task.radius].map(String) : ['diameter', 'basic'].includes(task.part) ?
          [task.radius, task.radius, task.radius * 2].map(String) : [], draftWorks: task.draft ? correctDraft(board, task.draft) : null };
    }
    case 'angles': {
      const sweep = centralValue(task);
      const vertices = order.filter(v => validVertex(task, v));
      const otherArc = task.otherSide ? circleInterceptedArc(board, task.ends, task.otherSide)! : { ends: task.ends, via: '' };
      return { kind, mode: 'angles', vertex: task.skill === 'central' ? origin : vertices[0]!, moved: vertices[1] ?? '',
        rays: task.ends, arc: { ends: task.ends, via: task.through }, central: String(sweep), inscribed: String(sweep / 2),
        resized: String(sweep), auditWorks: task.audit ? validVertex(task, task.audit) : null, otherArc,
        otherInscribed: task.otherSide ? String(circleArc(board, otherArc)!.degrees / 2) : '' };
    }
    case 'measure': {
      const { rN, rD, sN, sD, n, d, area, display } = circleMeasureValues(task);
      const enlarged = BigInt(task.compareRadius ?? 1), scale = 10n ** BigInt(task.decimals);
      return { kind, mode: 'measure', radius: scalar(rN, rD), share: scalar(sN, sD), coefficient: scalar(n, d),
        result: task.result === 'approx' ? `${display / scale},${String(display % scale).padStart(task.decimals, '0')}` : '',
        notation: task.result === 'approx' ? 'approx' : 'exact', unit: area ? task.unit + '²' : task.unit, lower: '3', upper: '4',
        prediction: task.compareRadius === undefined ? '' : scalar(enlarged * enlarged * rD * rD, rN * rN),
        locked: task.compareRadius !== undefined, enlargedCoefficient: task.compareRadius === undefined ? '' : String(enlarged * enlarged) };
    }
    case 'thales': {
      const [first, second] = order.filter(v => validVertex(task, v));
      const compareArc = circleInterceptedArc(board, task.compare, task.compareVertex)!;
      const sweep = circleArc(board, compareArc)!.degrees;
      return { kind, mode: 'thales', vertices: [first, second], arc: { ends: task.ends, via: task.through }, central: '180',
        inscribed: '90', locked: true, compareArc, compareCentral: String(sweep), compareInscribed: String(sweep / 2),
        candidateWorks: task.candidate ? validVertex(task, task.candidate) : null };
    }
  }
}
export function wrongCircleObservatoryResponses(task: CircleObservatoryTask): CircleObservatoryResponse[] {
  const response = solutionCircleObservatory(task);
  switch (response.mode) {
    case 'parts':
      if (task.mode !== 'parts') return [];
      switch (task.part) {
        case 'radius': return [{ ...response, radii: [response.diameter, response.diameter] }];
        case 'diameter': return [{ ...response, values: ['0', '0', '0'] }];
        case 'circumference': return [{ ...response, circumference: response.circumference.slice(0, -1) }];
        default: return [{ ...response, arc: { ...response.arc, via: response.arc.ends[0] } }];
      }
    case 'angles': return [{ ...response, arc: { ...response.arc, via: response.arc.ends[0] } }];
    case 'measure': return [{ ...response, unit: '' }, { ...response, coefficient: '0' }];
    case 'thales': return [{ ...response, inscribed: '180' }, { ...response, compareInscribed: '90' }];
  }
}
