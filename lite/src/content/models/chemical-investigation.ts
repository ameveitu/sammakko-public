import { parseMeasure } from './spatial-measures';
import { type CriterionObservation, type ObservedExplanationTask } from './observed-explanations';

export const chemicalInvestigationSources = [
  'https://openstax.org/books/chemistry-2e/pages/1-4-measurements',
  'https://openstax.org/books/chemistry-2e/pages/1-5-measurement-uncertainty-accuracy-and-precision',
  'https://www.nationalacademies.org/read/13165/chapter/7',
] as const;
/** Shared schematic meniscus curve. It does not determine the assessed volume. */
export const MENISCUS_RELATIVE_LIFT = 4 / 98;

export type InvestigationUnit = 'ul' | 'ml' | 'mg' | 'g';
export type InvestigationInstrumentId = 'pipette-small' | 'pipette-large' | 'cylinder' | 'beaker' | 'balance';
export interface InvestigationInstrument {
  id: InvestigationInstrumentId; label: string; quantity: 'volume' | 'mass'; capacity: number; division: number;
  transferable: boolean;
}
export interface InvestigationContext { title: string; skills: readonly string[] }
export type InvestigationReview = Pick<ObservedExplanationTask, 'prompt' | 'rubric' | 'model'>;
export interface InvestigationObservation {
  channel: 'spoken' | 'written';
  observations: Partial<Record<string, CriterionObservation>>; confirmedByAdult: boolean; assistance: 'none' | 'helped';
}
export interface InvestigationAction {
  run: string; id: string; type: 'select' | 'aspirate' | 'dispense' | 'empty-container' | 'tare' | 'load-sample' | 'eye-level' | 'read' | 'run';
  instrument?: InvestigationInstrumentId; amountUl?: number; sample?: string;
}
export interface InvestigationReading { value: string; unit: InvestigationUnit | null }
export interface InvestigationSourceRow {
  id: string; sourceId: string; sample: string; condition: string; x: number | null;
  solvent: string; temperatureC: number; solventMg: number; doseMg: number; capacityMg: number;
  missing: boolean; note: string;
}
export interface InvestigationRecordRow {
  rowId: string; sourceId: string; condition: string; reading: InvestigationReading | null;
}
export interface InvestigationChart {
  type: 'table' | 'bar' | 'line' | 'scatter' | null;
  xLabel: 'sample' | 'temperature' | 'solvent' | null; yLabel: 'dissolved-mass' | null; unit: InvestigationUnit | null;
  start: string; top: string; step: string; values: Record<string, string | null>;
}
export interface InvestigationInstrumentState {
  instrument: InvestigationInstrumentId | null; sourceUl: number; heldUl: number; receiverUl: number;
  containerPlaced: boolean; samplePlaced: boolean; tareMg: number; taredContainer: boolean;
  eyeLevel: boolean; read: boolean; operations: readonly string[]; used: readonly InvestigationInstrumentId[];
}
interface ToolTask { mode: 'tool'; requestedUl: number; sourceUl: number; requiredDivisionUl: number; instruments: readonly InvestigationInstrument[]; unit: 'ul' | 'ml'; protocol: string }
interface MeasureTask { mode: 'measure'; quantity: 'mass' | 'volume'; instruments: readonly InvestigationInstrument[];
  amount: number; requiredDivision: number; containerMg: number; offsetMg: number; unit: InvestigationUnit; shape: 'cylinder' | 'flared'; protocol: string }
interface ObserveTask { mode: 'observe'; observation: string; illustration: { feature: 'bubble' | 'colour' | 'precipitate'; before: number; after: number; temperatureC: number }; cards: readonly { id: string; text: string; category: 'observation' | 'inference' }[]; evidenceNeeded: readonly string[] }
interface DesignTask { mode: 'design'; objective: 'question' | 'plan'; variable: 'solvent' | 'temperature'; response: 'dissolved-mass';
  levels: readonly [string, string]; controls: readonly { id: string; label: string; required: boolean }[]; protocol: string; review: InvestigationReview }
interface DataTask { mode: 'data'; objective: 'collect' | 'present' | 'both'; rows: readonly InvestigationSourceRow[]; xKind: 'sample' | 'temperature' | 'solvent';
  numericX: boolean; publicResults: boolean; unit: 'mg' | 'g'; protocol: string }
interface ConcludeTask { mode: 'conclude'; objective: 'conclusion' | 'evaluate' | 'both'; question: string;
  rows: readonly { id: string; sample: string; condition: string; massMg: number; note: string }[];
  issue: 'none' | 'label' | 'temperature' | 'missing' | 'overlap'; issueRows: readonly string[]; review: InvestigationReview }
export type ChemicalInvestigationTask = (ToolTask | MeasureTask | ObserveTask | DesignTask | DataTask | ConcludeTask) & {
  kind: 'chemical-investigation'; run: string; title: string; context: InvestigationContext; safety: readonly string[];
};
interface ToolAnswer { mode: 'tool'; actions: readonly InvestigationAction[]; reading: InvestigationReading }
interface MeasureAnswer { mode: 'measure'; actions: readonly InvestigationAction[]; reading: InvestigationReading; meniscus: 'bottom' | 'edge' | null }
interface ObserveAnswer { mode: 'observe'; categories: Record<string, 'observation' | 'inference' | null>; extraEvidence: string | null }
interface DesignAnswer { mode: 'design'; variable: 'solvent' | 'temperature' | null; response: 'dissolved-mass' | null;
  controls: readonly string[]; repetitions: number; safeProtocol: boolean; review?: InvestigationObservation }
interface DataAnswer { mode: 'data'; actions: readonly InvestigationAction[]; table: readonly InvestigationRecordRow[];
  chart: InvestigationChart; sourceLink: { rowId: string; sourceId: string } | null }
interface ConcludeAnswer { mode: 'conclude'; citedRows: readonly string[]; difference: string; confidence: 'supports' | 'inconclusive' | null;
  issueRows: readonly string[]; repair: 'repeat-labelled' | 'control-temperature' | 'recover-or-repeat' | 'more-precise' | 'keep-method' | null;
  review?: InvestigationObservation }
export type ChemicalInvestigationResponse = (ToolAnswer | MeasureAnswer | ObserveAnswer | DesignAnswer | DataAnswer | ConcludeAnswer) & { kind: 'chemical-investigation' };
export interface InvestigationVerdict { ok: boolean; why?: string; pendingReview?: true; observedByAdult?: true; assisted?: true }
const kind = 'chemical-investigation' as const;
export const investigationUnitLabels = { ul: 'µl', ml: 'ml', mg: 'mg', g: 'g' } as const;
const unitFactors = { ul: { quantity: 'volume', scale: 1 }, ml: { quantity: 'volume', scale: 1000 },
  mg: { quantity: 'mass', scale: 1 }, g: { quantity: 'mass', scale: 1000 } } as const;
export function investigationNumber(value: unknown) { return typeof value === 'string' && value.length <= 32 ? parseMeasure(value) : undefined; }
function sameNumber(value: unknown, n: number) {
  const q = investigationNumber(value); return !!q && Number.isSafeInteger(n) && q[0] === BigInt(n) * q[1];
}
function dataRecord(value: unknown, required: readonly string[] = []): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;
  const descriptors = Object.getOwnPropertyDescriptors(value);
  return Reflect.ownKeys(descriptors).every(key => typeof key === 'string' && descriptors[key]!.enumerable && Object.hasOwn(descriptors[key]!, 'value')) &&
    required.every(key => Object.hasOwn(descriptors, key));
}
export function investigationValue(reading: InvestigationReading | null, quantity: 'mass' | 'volume'): readonly [bigint, bigint] | undefined {
  if (!dataRecord(reading, ['unit', 'value']) || !reading || !reading.unit || !Object.hasOwn(unitFactors, reading.unit) || unitFactors[reading.unit].quantity !== quantity) return;
  const value = investigationNumber(reading.value);
  return value ? [value[0] * BigInt(unitFactors[reading.unit].scale), value[1]] : undefined;
}
function sameReading(reading: InvestigationReading | null, quantity: 'mass' | 'volume', expected: number) {
  const q = investigationValue(reading, quantity); return !!q && q[0] === BigInt(expected) * q[1];
}
const failure = (why: string): InvestigationVerdict => ({ ok: false, why });
const sameSet = (a: readonly string[] | undefined, b: readonly string[]) => Array.isArray(a) && a.length === b.length && new Set(a).size === a.length && b.every(value => a.includes(value));
export function initialInvestigationInstrument(task: Extract<ChemicalInvestigationTask, { mode: 'tool' | 'measure' }>): InvestigationInstrumentState {
  return { instrument: null, sourceUl: task.mode === 'tool' ? task.sourceUl : 0, heldUl: 0, receiverUl: 0,
    containerPlaced: false, samplePlaced: false, tareMg: 0, taredContainer: false, eyeLevel: false, read: false, operations: [], used: [] };
}
export function investigationMeter(task: Extract<ChemicalInvestigationTask, { mode: 'measure' }>, state: InvestigationInstrumentState) {
  return task.quantity === 'mass' ? task.offsetMg + (state.containerPlaced ? task.containerMg : 0) + (state.samplePlaced ? task.amount : 0) - state.tareMg : state.samplePlaced ? task.amount : 0;
}
/** A deterministic virtual instrument. It models the supplied calibration and actions, not real-world handling competence. */
export function applyInvestigationInstrument(task: Extract<ChemicalInvestigationTask, { mode: 'tool' | 'measure' }>, state: InvestigationInstrumentState, action: InvestigationAction): InvestigationInstrumentState {
  if (!dataRecord(action, ['run', 'id', 'type']) || action.run !== task.run || !action.id || state.operations.includes(action.id)) return state;
  if (action.type === 'select') {
    if ((state.heldUl > 0 || state.samplePlaced || state.containerPlaced) && state.instrument !== action.instrument) return state;
    if (!Object.hasOwn(action, 'instrument') || !task.instruments.some(tool => tool.id === action.instrument)) return state;
    return { ...state, instrument: action.instrument!, eyeLevel: false, read: false, operations: [...state.operations, action.id] };
  }
  const tool = task.instruments.find(instrument => instrument.id === state.instrument);
  if (!tool) return state;
  const next = { ...state, operations: [...state.operations, action.id] };
  if (task.mode === 'tool') {
    const amount = action.amountUl;
    if (!Object.hasOwn(action, 'amountUl') || !Number.isSafeInteger(amount) || amount! <= 0 || amount! % tool.division || tool.quantity !== 'volume' || !tool.transferable) return state;
    if (action.type === 'aspirate' && state.heldUl === 0 && amount! <= state.sourceUl && amount! <= tool.capacity) return { ...next, sourceUl: state.sourceUl - amount!, heldUl: amount! };
    if (action.type === 'dispense' && amount! <= state.heldUl) return { ...next, heldUl: state.heldUl - amount!, receiverUl: state.receiverUl + amount!, used: [...state.used, tool.id] };
    return state;
  }
  if (tool.quantity !== task.quantity || task.amount > tool.capacity) return state;
  if (action.type === 'empty-container' && task.quantity === 'mass' && !state.samplePlaced) return { ...next, containerPlaced: true, read: false };
  if (action.type === 'tare' && task.quantity === 'mass' && !state.samplePlaced) return { ...next, tareMg: task.offsetMg + (state.containerPlaced ? task.containerMg : 0), taredContainer: state.containerPlaced, read: false };
  if (action.type === 'load-sample' && !state.samplePlaced && task.amount + (task.quantity === 'mass' ? task.containerMg : 0) <= tool.capacity && (task.quantity === 'volume' || state.containerPlaced)) return { ...next, samplePlaced: true, read: false };
  if (action.type === 'eye-level' && task.quantity === 'volume' && state.samplePlaced) return { ...next, eyeLevel: true, read: false };
  if (action.type === 'read' && state.samplePlaced) return { ...next, read: true };
  return state;
}
export function replayInvestigationInstrument(task: Extract<ChemicalInvestigationTask, { mode: 'tool' | 'measure' }>, actions: readonly InvestigationAction[]) {
  let state = initialInvestigationInstrument(task);
  if (!Array.isArray(actions) || actions.length > 64) return state;
  for (const action of actions) state = applyInvestigationInstrument(task, state, action);
  return state;
}
export function investigationResult(row: InvestigationSourceRow): number | null {
  return row.missing ? null : Math.min(row.doseMg, row.capacityMg);
}
export function completedInvestigationRuns(task: Extract<ChemicalInvestigationTask, { mode: 'data' }>, actions: readonly InvestigationAction[]) {
  if (!Array.isArray(actions) || actions.length > 64) return [];
  const ids = new Set<string>(), samples = new Set<string>();
  for (const action of actions) {
    if (!dataRecord(action, ['run', 'id', 'type', 'sample']) || action.run !== task.run || action.type !== 'run' || !action.id || ids.has(action.id) || !task.rows.some(row => row.id === action.sample)) continue;
    ids.add(action.id); samples.add(action.sample!);
  }
  return [...samples];
}
function instrumentActivity(task: Extract<ChemicalInvestigationTask, { mode: 'tool' | 'measure' }>, answer: ToolAnswer | MeasureAnswer): InvestigationVerdict {
  const state = replayInvestigationInstrument(task, answer.actions);
  const selected = task.instruments.find(tool => tool.id === state.instrument);
  if (!selected) return failure('Valitse tarkoitukseen sopiva virtuaaliväline.');
  if (task.mode === 'tool') {
    if (!state.used.length || state.used.some(id => {
      const used = task.instruments.find(tool => tool.id === id)!;
      return used.quantity !== 'volume' || !used.transferable || used.division > task.requiredDivisionUl || used.capacity < task.requestedUl;
    })) return failure('Valitse annettuun kertasiirtoon riittävän suuri ja riittävän hienojakoinen väline.');
    if (state.receiverUl !== task.requestedUl || state.heldUl !== 0 || state.sourceUl + state.receiverUl !== task.sourceUl) return failure('Tee itse pyydetty kertasiirto. Lähdeastian, välineen ja vastaanottajan nestemäärät säilyvät yhteensä samoina.');
    return sameReading(answer.reading, 'volume', state.receiverUl) ? { ok: true } : failure('Kirjaa vastaanottajaan siirtämäsi tilavuus yksikköineen.');
  }
  if (answer.mode !== 'measure') return failure('Kirjaa tämän mittauksen oma lukema.');
  if (!state.samplePlaced || !state.read || selected.quantity !== task.quantity || selected.division > task.requiredDivision) return failure('Aseta näyte tarkoitukseen sopivalle mitta-asteikolle ja ota oma lukema.');
  if (task.quantity === 'mass' && !state.taredContainer) return failure('Taaraa tyhjä näyteastia ennen näytteen lisäämistä. Näytteen massaan ei kuulu astian massa.');
  if (task.quantity === 'volume' && (!state.eyeLevel || answer.meniscus !== 'bottom')) return failure('Aseta katse meniskin tasolle ja lue tämän veden meniskin alin kohta.');
  return sameReading(answer.reading, task.quantity, task.amount) ? { ok: true } : failure('Tarkista oma mittarinlukema, asteikon jako ja yksikkö. Astian ulkomuoto ei määrää mitattua määrää.');
}
function dataActivity(task: Extract<ChemicalInvestigationTask, { mode: 'data' }>, answer: DataAnswer): InvestigationVerdict {
  if (!task.publicResults && !sameSet(completedInvestigationRuns(task, answer.actions), task.rows.map(row => row.id))) return failure('Tee jokaisen näytteen oma virtuaalinen koe. Kirjaa myös poikkeava tai puuttuvaksi todettu tulos.');
  const validRows = Array.isArray(answer.table) && answer.table.length === task.rows.length && answer.table.every(entry => dataRecord(entry, ['rowId', 'sourceId', 'condition', 'reading'])) && task.rows.every(row => {
    const matches = answer.table.filter(entry => entry?.rowId === row.id), result = investigationResult(row);
    return matches.length === 1 && matches[0]!.sourceId === row.sourceId && matches[0]!.condition === row.condition &&
      (result === null ? matches[0]!.reading === null : sameReading(matches[0]!.reading, 'mass', result));
  });
  if (!validRows) return failure('Säilytä jokaisen rivin näyte, alkuperäinen tunniste, olosuhde, todellinen tulos ja yksikkö. Puuttuvaa tulosta ei täytetä arvauksella.');
  if (task.objective === 'collect') return { ok: true };
  const chart = answer.chart;
  if (!dataRecord(chart, ['type', 'xLabel', 'yLabel', 'unit', 'start', 'top', 'step', 'values']) || !chart || !['table', 'bar', 'line', 'scatter'].includes(chart.type ?? '') || (!task.numericX && (chart.type === 'line' || chart.type === 'scatter')) || (task.objective === 'both' && chart.type === 'table')) return failure('Rakenna kysymykseen sopiva esitys. Luokkia ei yhdistetä jatkuvaksi viivaksi; kokonaisnäytössä tarvitaan myös oma diagrammi.');
  if (!((chart.xLabel === task.xKind) || ((chart.type === 'bar' || chart.type === 'table') && chart.xLabel === 'sample')) || chart.yLabel !== 'dissolved-mass' || !chart.unit || !Object.hasOwn(unitFactors, chart.unit) || unitFactors[chart.unit].quantity !== 'mass') return failure('Nimeä esityksen muuttuja, mitattu suure ja yksikkö.');
  if (!dataRecord(chart.values) || !chart.values || Object.keys(chart.values).length !== task.rows.length || !task.rows.every(row => Object.hasOwn(chart.values, row.id) &&
    (investigationResult(row) === null ? chart.values[row.id] === null : sameReading({ value: chart.values[row.id]!, unit: chart.unit }, 'mass', investigationResult(row)!)))) return failure('Esityksen jokainen arvo tulee samasta alkuperäisestä havaintorivistä.');
  if (chart.type !== 'table') {
    const start = investigationNumber(chart.start), top = investigationNumber(chart.top), step = investigationNumber(chart.step);
    if (!start || !top || !step || step[0] <= 0n || top[0] * start[1] <= start[0] * top[1] ||
      (chart.type === 'bar' && start[0] !== 0n)) return failure('Anna kasvava tasavälinen asteikko. Pylväsdiagrammin arvoakseli alkaa tässä nollasta.');
    const width: readonly [bigint, bigint] = [top[0] * start[1] - start[0] * top[1], top[1] * start[1]];
    const numerator = width[0] * step[1], denominator = width[1] * step[0];
    if (numerator % denominator !== 0n || numerator / denominator > 24n) return failure('Valitse tasavälinen jako, jossa loppuarvo on merkkivälillä ja asteikko pysyy luettavana.');
    const values = task.rows.map(investigationResult).filter((value): value is number => value !== null);
    const factor = unitFactors[chart.unit!].scale;
    if (values.some(n => start[0] * BigInt(factor) > BigInt(n) * start[1] || top[0] * BigInt(factor) < BigInt(n) * top[1])) return failure('Kaikkien alkuperäisten havaintojen pitää mahtua esityksen asteikolle.');
  }
  if (task.objective === 'both' && !task.rows.some(row => investigationResult(row) !== null && dataRecord(answer.sourceLink, ['rowId', 'sourceId']) && answer.sourceLink?.rowId === row.id && answer.sourceLink.sourceId === row.sourceId)) return failure('Yhdistä vielä yksi esityksen kohta sen alkuperäiseen mittaustunnisteeseen.');
  return { ok: true };
}
export function investigationExplanation(review: InvestigationReview, channel: 'spoken' | 'written' = 'spoken'): ObservedExplanationTask {
  return { kind: 'observed-explanation', channel, givens: [], ...review };
}
export function checkChemicalInvestigationActivity(task: ChemicalInvestigationTask, answer: ChemicalInvestigationResponse): InvestigationVerdict {
  if (!dataRecord(answer, ['kind', 'mode']) || !answer || answer.kind !== kind || answer.mode !== task.mode) return failure('Tämä vastaus kuuluu tämän tutkimuspöydän omaan tehtävään.');
  if ((task.mode === 'tool' || task.mode === 'measure') && (answer.mode === 'tool' || answer.mode === 'measure')) return instrumentActivity(task, answer);
  if (task.mode === 'observe' && answer.mode === 'observe') {
    if (!dataRecord(answer.categories) || !answer.categories || Object.keys(answer.categories).length !== task.cards.length || !task.cards.every(card => Object.hasOwn(answer.categories, card.id) && answer.categories[card.id] === card.category)) return failure('Erota suoraan kuvattu havainto siitä tehdystä aineen syntyä tai lajia koskevasta tulkinnasta.');
    return task.evidenceNeeded.includes(answer.extraEvidence ?? '') ? { ok: true } : failure('Valitse lisänäyttö, joka voisi tutkia ehdotettua tulkintaa. Pelkkä kupla tai värinmuutos ei nimeä ainetta.');
  }
  if (task.mode === 'design' && answer.mode === 'design') {
    if (answer.variable !== task.variable || answer.response !== task.response) return failure('Rajaa oma kysymys vertailtavaan muuttujaan ja havaittavaan vasteeseen.');
    if (task.objective === 'plan' && (!sameSet(answer.controls, task.controls.filter(c => c.required).map(c => c.id)) || !Number.isSafeInteger(answer.repetitions) || answer.repetitions < 2 || answer.repetitions > 10 || answer.safeProtocol !== true)) return failure('Pidä muut vertailutekijät samoina, suunnittele toistot ja käytä annettua virtuaalista menettelyä.');
    return { ok: true };
  }
  if (task.mode === 'data' && answer.mode === 'data') return dataActivity(task, answer);
  if (task.mode === 'conclude' && answer.mode === 'conclude') {
    if (task.objective !== 'evaluate' && (!sameSet(answer.citedRows, task.rows.slice(0, 2).map(row => row.id)) || !sameNumber(answer.difference, task.rows[1]!.massMg - task.rows[0]!.massMg) || answer.confidence !== (task.issue === 'none' ? 'supports' : 'inconclusive'))) return failure('Liitä oma johtopäätös molempien näytteiden todellisiin lukemiin. Epäselvässä tai sekoittuneessa vertailussa myös keskeneräinen vastaus on perusteltu.');
    const repairs = { none: 'keep-method', label: 'repeat-labelled', temperature: 'control-temperature', missing: 'recover-or-repeat', overlap: 'more-precise' } as const;
    if (task.objective !== 'conclusion' && (!sameSet(answer.issueRows, task.issueRows) || answer.repair !== repairs[task.issue])) return failure('Osoita toteutuksen epävarma kohta ja siihen kohdistuva rajattu parannus. Älä korvaa havaintoa odotetulla arvolla.');
    return { ok: true };
  }
  return failure('Täydennä tämän tutkimusvaiheen oma toiminta.');
}
export function checkChemicalInvestigation(task: ChemicalInvestigationTask, answer: ChemicalInvestigationResponse): InvestigationVerdict {
  let review: InvestigationVerdict | undefined;
  if ('review' in task) {
    const observation = dataRecord(answer, ['review']) && answer && 'review' in answer ? answer.review : undefined;
    if (!dataRecord(observation, ['channel', 'assistance', 'confirmedByAdult', 'observations']) || !observation || !['spoken', 'written'].includes(observation.channel) || !['none', 'helped'].includes(observation.assistance) || observation.confirmedByAdult !== true ||
        !dataRecord(observation.observations) || !observation.observations || Object.keys(observation.observations).length !== task.review.rubric.length || !task.review.rubric.every(c => Object.hasOwn(observation.observations, c.id) && ['met', 'not-yet'].includes(observation.observations[c.id] ?? ''))) {
      return { ok: false, pendingReview: true, why: 'Oma selitys odottaa kaikkien kohtien aikuisarviota, vahvistusta ja erillistä tietoa avusta.' };
    }
    // The local draft is assessed by a person and discarded. Only channel and observation metadata remain.
    const missing = task.review.rubric.find(c => observation.observations[c.id] === 'not-yet');
    review = { ok: !missing, ...(missing ? { why: `Harjoitellaan vielä tätä kohtaa. ${missing.label}` } : {}), observedByAdult: true,
      ...(observation.assistance === 'helped' ? { assisted: true as const } : {}) };
  }
  const activity = checkChemicalInvestigationActivity(task, answer);
  return !activity.ok ? { ...activity, ...(review?.observedByAdult ? { observedByAdult: true as const } : {}), ...(review?.assisted ? { assisted: true as const } : {}) } : review ?? activity;
}

export function investigationAction(task: ChemicalInvestigationTask, id: string, type: InvestigationAction['type'], rest: Pick<InvestigationAction, 'instrument' | 'amountUl' | 'sample'> = {}): InvestigationAction {
  return { run: task.run, id, type, ...rest };
}
export function solutionChemicalInvestigation(task: ChemicalInvestigationTask): ChemicalInvestigationResponse {
  if (task.mode === 'tool') {
    const instrument = task.instruments.find(tool => tool.quantity === 'volume' && tool.transferable && tool.capacity >= task.requestedUl && tool.division <= task.requiredDivisionUl && task.requestedUl % tool.division === 0)!;
    return { kind, mode: 'tool', actions: [investigationAction(task, 'choose', 'select', { instrument: instrument.id }),
      investigationAction(task, 'draw', 'aspirate', { amountUl: task.requestedUl }), investigationAction(task, 'deliver', 'dispense', { amountUl: task.requestedUl })],
      reading: { value: `${task.requestedUl}/${unitFactors[task.unit].scale}`, unit: task.unit } };
  }
  if (task.mode === 'measure') {
    const instrument = task.instruments.find(tool => tool.quantity === task.quantity && tool.capacity >= task.amount + (task.quantity === 'mass' ? task.containerMg : 0) && tool.division <= task.requiredDivision)!;
    const actions = [investigationAction(task, 'choose', 'select', { instrument: instrument.id }),
      ...(task.quantity === 'mass' ? [investigationAction(task, 'empty', 'empty-container'), investigationAction(task, 'tare', 'tare')] : []),
      investigationAction(task, 'sample', 'load-sample'), ...(task.quantity === 'volume' ? [investigationAction(task, 'eye', 'eye-level')] : []), investigationAction(task, 'read', 'read')];
    return { kind, mode: 'measure', actions, meniscus: task.quantity === 'volume' ? 'bottom' : null, reading: { value: `${task.amount}/${unitFactors[task.unit].scale}`, unit: task.unit } };
  }
  if (task.mode === 'observe') return { kind, mode: 'observe', categories: Object.fromEntries(task.cards.map(card => [card.id, card.category])), extraEvidence: task.evidenceNeeded[0]! };
  if (task.mode === 'design') return { kind, mode: 'design', variable: task.variable, response: task.response,
    controls: task.controls.filter(control => control.required).map(control => control.id), repetitions: 3, safeProtocol: true,
    review: { channel: 'spoken', observations: {}, confirmedByAdult: false, assistance: 'none' } };
  if (task.mode === 'data') {
    const factor = unitFactors[task.unit].scale, maximum = Math.max(0, ...task.rows.map(row => investigationResult(row) ?? 0));
    const step = Math.max(100, Math.ceil(maximum / 800) * 100), top = Math.max(step, Math.ceil(maximum / step) * step);
    const source = task.rows.find(row => investigationResult(row) !== null)!;
    return { kind, mode: 'data', actions: task.publicResults ? [] : task.rows.map(row => investigationAction(task, `run:${row.id}`, 'run', { sample: row.id })),
      table: task.rows.map(row => ({ rowId: row.id, sourceId: row.sourceId, condition: row.condition,
        reading: investigationResult(row) === null ? null : { value: `${investigationResult(row)}/${factor}`, unit: task.unit } })),
      chart: { type: task.numericX ? 'scatter' : 'bar', xLabel: task.xKind, yLabel: 'dissolved-mass', unit: task.unit,
        start: '0', top: `${top}/${factor}`, step: `${step}/${factor}`, values: Object.fromEntries(task.rows.map(row => [row.id, investigationResult(row) === null ? null : `${investigationResult(row)}/${factor}`])) },
      sourceLink: { rowId: source.id, sourceId: source.sourceId } };
  }
  const repairs = { none: 'keep-method', label: 'repeat-labelled', temperature: 'control-temperature', missing: 'recover-or-repeat', overlap: 'more-precise' } as const;
  return { kind, mode: 'conclude', citedRows: task.rows.slice(0, 2).map(row => row.id), difference: String(task.rows[1]!.massMg - task.rows[0]!.massMg),
    confidence: task.issue === 'none' ? 'supports' : 'inconclusive', issueRows: [...task.issueRows], repair: repairs[task.issue],
    review: { channel: 'spoken', observations: {}, confirmedByAdult: false, assistance: 'none' } };
}
export function wrongChemicalInvestigationResponses(task: ChemicalInvestigationTask): ChemicalInvestigationResponse[] {
  const correct = solutionChemicalInvestigation(task);
  switch (correct.mode) {
    case 'tool': return [{ ...correct, actions: [] }, { ...correct, reading: { value: '0', unit: 'g' } }];
    case 'measure': return [{ ...correct, actions: [] }, { ...correct, reading: { value: '0', unit: null }, meniscus: 'edge' }];
    case 'observe': return [{ ...correct, categories: {} }, { ...correct, extraEvidence: 'pretty-name' }];
    case 'design': return [{ ...correct, response: null }, { ...correct, variable: correct.variable === 'solvent' ? 'temperature' : 'solvent', controls: [], safeProtocol: false, repetitions: 1 }];
    case 'data': return [{ ...correct, table: [] }, { ...correct, table: correct.table.map((row, i) => i ? row : { ...row, sourceId: 'invented' }), chart: { ...correct.chart, values: {} } }];
    case 'conclude': return [{ ...correct, citedRows: [], difference: '999999', issueRows: ['invented'], repair: null }, { ...correct, confidence: correct.confidence === 'supports' ? 'inconclusive' : 'supports', issueRows: ['invented'], repair: null }];
  }
}
