import { parseMeasure } from './spatial-measures';
import { checkObservedExplanation, type ObservedExplanationTask, type CriterionObservation } from './observed-explanations';

export type MatterPhase = 'solid' | 'liquid' | 'gas';
export type MatterZone = 'bulk' | 'bottom' | 'dissolved' | 'environment' | 'dispersed';
export type SeparationMethod = 'filter' | 'decant' | 'evaporate';
/** phase='solution' means the substance is dispersed in the shared solution phase, never pure liquid sugar. */
export interface MatterParcel {
  id: string; root: string; substance: string; massMg: number; phase: MatterPhase | 'solution'; zone: MatterZone;
  grainUm?: number; volatile?: boolean;
}
export interface MatterVessel { id: string; label: string; parcels: readonly MatterParcel[] }
export interface MatterLedger { run: string; vessels: readonly MatterVessel[]; applied: readonly string[] }
export interface MatterAction {
  run: string; id: string; source: string; method: 'settle' | SeparationMethod | 'dissolve' | 'phase' | 'reshape';
  target: string; residue: string; poreUm?: number; capacityMg?: number; phase?: MatterPhase;
}
export interface MaterialSample {
  id: string; label: string; material: 'wood' | 'metal' | 'glass'; object: string;
  absorption: number; bend: number; transmission: number; hard: boolean;
}
export interface CompositionSample {
  id: string; label: string; substances: readonly { name: string; formula: string; count: number }[];
  regions: readonly (readonly number[])[]; phases: number; clear: boolean;
}
export interface DissolveTrial { id: string; label: string; solvent: string; solute: string; solventMg: number; doseMg: number;
  capacityMg: number; temperatureC: number }
export interface SeparationStation {
  id: string; label: string; method: SeparationMethod; initial: MatterVessel; poreUm: number;
  targetRoot: string; targetBin: 'output' | 'residue' | 'gas'; settled: boolean;
}
export type MixtureReview = Pick<ObservedExplanationTask, 'prompt' | 'rubric' | 'model'>;
export interface MixtureObservation {
  observations: Partial<Record<string, CriterionObservation>>; confirmedByAdult: boolean; assistance: 'none' | 'helped';
}
export type MaterialsMode = 'materials' | 'levels' | 'state' | 'phase' | 'composition' | 'dissolve' | 'separate';
export interface MaterialsMixturesTask {
  kind: 'materials-mixtures'; mode: MaterialsMode; skill: string; run: string; setting: string;
  context: { title: string; skills: readonly string[] };
  samples?: readonly MaterialSample[]; property?: 'absorption' | 'bend' | 'transmission';
  purpose?: string; choose?: 'min' | 'max'; observations?: readonly { id: string; text: string; property: string }[];
  levels?: { object: string; material: string; substance: string; fact: string };
  stateExperiment?: 'reshape' | 'compress';
  states?: readonly { id: string; label: string; phase: MatterPhase; massMg: number; behavior: string }[];
  phase?: { before: MatterPhase; after: MatterPhase; name: string; massMg: number; temperature: string };
  compositions?: readonly CompositionSample[]; trials?: readonly DissolveTrial[]; stations?: readonly SeparationStation[];
  review?: MixtureReview;
}
export interface MaterialsMixturesResponse {
  kind: 'materials-mixtures'; mode: MaterialsMode; values: Record<string, string>;
  actions: readonly MatterAction[]; predictionsLocked: boolean; review?: MixtureObservation;
}
export interface MixtureQuestion { id: string; label: string; unit?: string; options?: readonly (readonly [string, string])[] }
export interface MixtureVerdict { ok: boolean; why?: string; pendingReview?: true; observedByAdult?: true; assisted?: true }
const kind = 'materials-mixtures' as const;
const states = [['solid', 'Kiinteä'], ['liquid', 'Neste'], ['gas', 'Kaasu']] as const;
export const methodLabels = { filter: 'Suodatus', decant: 'Dekantointi', evaporate: 'Haihdutus' } as const;
export const phaseLabels = { solid: 'Kiinteä', liquid: 'Neste', gas: 'Kaasu', solution: 'Liuosfaasissa' } as const;
export const changes = { 'solid-liquid': 'melting', 'liquid-solid': 'freezing', 'liquid-gas': 'evaporation', 'gas-liquid': 'condensation' } as const;
export const changeLabels = [['melting', 'Sulaminen'], ['freezing', 'Jäätyminen'], ['evaporation', 'Haihtuminen'], ['condensation', 'Tiivistyminen']] as const;
export const materialLabels = [['wood', 'Puu'], ['metal', 'Metalli'], ['glass', 'Lasi']] as const;
export function mixtureNumber(value: unknown) { return typeof value === 'string' && value.length <= 32 ? parseMeasure(value) : undefined; }
function exact(raw: unknown, expected: number) {
  const value = mixtureNumber(raw); return !!value && value[0] === BigInt(expected) * value[1];
}
export function parcelTotals(ledger: MatterLedger): Record<string, number> {
  const out: Record<string, number> = {};
  for (const vessel of ledger.vessels) for (const parcel of vessel.parcels) out[parcel.root] = (out[parcel.root] ?? 0) + parcel.massMg;
  return out;
}
const mass = (v: MatterVessel, root?: string) => v.parcels.filter(p => !root || p.root === root).reduce((n, p) => n + p.massMg, 0);
/** Authored ideal mass transfer. Parcel marks stand for stated mg, never for individual molecules.
 * Physical classification follows OpenStax Chemistry 2e 1.2. Dissolution retains substance identity.
 * https://openstax.org/books/chemistry-2e/pages/1-2-phases-and-classification-of-matter
 * Separation boundary follows RSC/Nuffield separating sand and salt (physical separation).
 * https://edu.rsc.org/experiments/separating-sand-and-salt-by-filtering-and-evaporation/386.article
 */
export function applyMatterAction(ledger: MatterLedger, action: MatterAction): MatterLedger {
  if (!action || !['run', 'id', 'source', 'method', 'target', 'residue'].every(key => Object.hasOwn(action, key))) return ledger;
  if (action.run !== ledger.run || !action.id || ledger.applied.includes(action.id)) return ledger;
  const source = ledger.vessels.find(v => v.id === action.source);
  if (!source || !source.parcels.length || [action.target, action.residue].includes(source.id) || action.target === action.residue ||
      !action.target || !action.residue || source.parcels.some(p => !Number.isSafeInteger(p.massMg) || p.massMg <= 0)) return ledger;
  if (action.method === 'filter' && (!Number.isSafeInteger(action.poreUm) || action.poreUm! <= 0)) return ledger;
  if (action.method === 'dissolve' && (!Number.isSafeInteger(action.capacityMg) || action.capacityMg! < 0)) return ledger;
  if (action.method === 'phase' && !['solid', 'liquid', 'gas'].includes(action.phase ?? '')) return ledger;
  if (action.method === 'decant' && source.parcels.some(p => p.phase === 'solid' && p.zone !== 'dissolved' && p.zone !== 'bottom')) return ledger;
  if (action.method === 'decant' && source.parcels.some(p => (p.phase === 'liquid' || p.zone === 'dissolved') && p.massMg % 4)) return ledger;
  const bins = new Map(ledger.vessels.map(v => [v.id, { ...v, parcels: [...v.parcels] }]));
  const from = bins.get(source.id)!; from.parcels = [];
  const add = (bin: string, p: MatterParcel, amount: number, patch: Partial<MatterParcel> = {}) => {
    if (!amount) return;
    if (!bins.has(bin)) bins.set(bin, { id: bin, label: bin.endsWith(':gas') ? 'Ympäristön kaasuastia' : bin.endsWith(':residue') ? 'Jäännös' : 'Talteenotto', parcels: [] });
    bins.get(bin)!.parcels.push({ ...p, ...patch, massMg: amount, id: `${p.id}/${action.id}/${bin}` });
  };
  let capacity = Math.max(0, (action.capacityMg ?? 0) - source.parcels.filter(p => p.zone === 'dissolved').reduce((sum, p) => sum + p.massMg, 0));
  for (const p of source.parcels) {
    switch (action.method) {
      case 'settle': add(source.id, p, p.massMg, p.phase === 'solid' && p.zone !== 'dissolved' ? { zone: 'bottom' } : {}); break;
      case 'reshape': add(source.id, p, p.massMg); break;
      case 'phase': add(source.id, p, p.massMg, { phase: action.phase!, zone: action.phase === 'gas' ? 'environment' : 'bulk' }); break;
      case 'dissolve': {
        const dissolved = p.phase === 'solid' && p.zone !== 'dissolved' ? Math.min(capacity, p.massMg) : 0;
        capacity -= dissolved;
        add(source.id, p, dissolved, { zone: 'dissolved', phase: 'solution' }); add(source.id, p, p.massMg - dissolved);
        break;
      }
      case 'filter': add(p.zone !== 'dissolved' && p.phase === 'solid' && (p.grainUm ?? 0) > action.poreUm! ? action.residue : action.target, p, p.massMg); break;
      case 'decant': {
        const poured = p.phase === 'liquid' || p.zone === 'dissolved' ? p.massMg * 3 / 4 : 0;
        add(action.target, p, poured); add(action.residue, p, p.massMg - poured); break;
      }
      case 'evaporate': add(p.volatile ? action.target : action.residue, p, p.massMg,
        p.volatile ? { phase: 'gas', zone: 'environment' } : { phase: 'solid', zone: 'bottom' }); break;
      default: return ledger;
    }
  }
  const next = { ...ledger, vessels: [...bins.values()], applied: [...ledger.applied, action.id] };
  if (JSON.stringify(parcelTotals(next)) !== JSON.stringify(parcelTotals(ledger))) {
    const a = parcelTotals(next), b = parcelTotals(ledger);
    if (!Object.keys(b).every(root => a[root] === b[root]) || Object.keys(a).length !== Object.keys(b).length) return ledger;
  }
  return next;
}
export function initialMatterLedger(task: MaterialsMixturesTask): MatterLedger {
  const vessels: MatterVessel[] = task.stations?.map(s => s.initial) ?? task.trials?.map(t => ({ id: t.id, label: t.label, parcels: [
    { id: `${t.id}:solvent`, root: `${t.id}:solvent`, substance: t.solvent, massMg: t.solventMg, phase: 'liquid' as const, zone: 'bulk' as const },
    { id: `${t.id}:solute`, root: `${t.id}:solute`, substance: t.solute, massMg: t.doseMg, phase: 'solid' as const, zone: 'bottom' as const },
  ] })) ?? task.states?.map(s => ({ id: s.id, label: s.label, parcels: [
    { id: s.id, root: s.id, substance: s.label, massMg: s.massMg, phase: s.phase, zone: 'bulk' as const },
  ] })) ?? (task.phase ? [{ id: 'water', label: 'Sama vesinäyte', parcels: [
    { id: 'water', root: 'water', substance: 'Vesi', massMg: task.phase.massMg, phase: task.phase.before, zone: 'bulk' as const },
  ] }] : []);
  return { run: task.run, vessels, applied: [] };
}
export function stationAction(task: MaterialsMixturesTask, station: SeparationStation, method: SeparationMethod): MatterAction {
  return { run: task.run, id: `${station.id}:operate`, method, source: station.id, target: `${station.id}:${method === 'evaporate' ? 'gas' : 'output'}`,
    residue: `${station.id}:residue`, poreUm: station.poreUm };
}
export function trialAction(task: MaterialsMixturesTask, trial: DissolveTrial): MatterAction {
  return { run: task.run, id: `${trial.id}:dissolve`, method: 'dissolve', source: trial.id, target: `${trial.id}:output`, residue: `${trial.id}:residue`, capacityMg: trial.capacityMg };
}
export function observationAction(task: MaterialsMixturesTask, source: string): MatterAction {
  return { run: task.run, id: `${source}:observe`, method: task.mode === 'phase' ? 'phase' : 'reshape', source,
    target: `${source}:output`, residue: `${source}:residue`, ...(task.phase ? { phase: task.phase.after } : {}) };
}
export function replayMatter(task: MaterialsMixturesTask, actions: readonly MatterAction[]): MatterLedger {
  let ledger = initialMatterLedger(task);
  for (const action of actions) ledger = applyMatterAction(ledger, action);
  return ledger;
}
function stationOutcome(task: MaterialsMixturesTask, s: SeparationStation) {
  const ledger = applyMatterAction({ run: task.run, vessels: [s.initial], applied: [] }, stationAction(task, s, s.method));
  const target = ledger.vessels.find(v => v.id === `${s.id}:${s.targetBin}`);
  const solvent = s.initial.parcels.find(p => p.phase === 'liquid')!;
  const output = ledger.vessels.find(v => v.id === `${s.id}:${s.method === 'evaporate' ? 'gas' : 'output'}`);
  const residue = ledger.vessels.find(v => v.id === `${s.id}:residue`);
  const totalTarget = mass(s.initial, s.targetRoot);
  const sugar = s.initial.parcels.find(p => p.zone === 'dissolved');
  return { target: target ? mass(target, s.targetRoot) : 0, remaining: totalTarget - (target ? mass(target, s.targetRoot) : 0),
    solvent: output ? mass(output, solvent.root) : 0, residueTotal: residue ? mass(residue) : 0, dissolved: sugar && output ? mass(output, sugar.root) : 0 };
}
export function materialsQuestions(task: MaterialsMixturesTask): MixtureQuestion[] {
  const q: MixtureQuestion[] = [];
  const add = (id: string, label: string, options?: MixtureQuestion['options'], unit?: string) => q.push({ id, label, options, unit });
  if (task.mode === 'materials') {
    if (task.skill !== 'compare' && task.skill !== 'property') for (const s of task.samples!) add(`material:${s.id}`, `${s.label} on`, materialLabels);
    if (task.property) {
      add('difference', 'Suurimman ja pienimmän havainnon ero', undefined, task.property === 'bend' ? 'mm' : '%');
      add('choice', 'Valitse tarkoitukseen sopiva näyte', task.samples!.map(s => [s.id, s.label]));
    }
    for (const o of task.observations ?? []) add(`property:${o.id}`, o.text, [['transmission', 'Läpinäkyvyys'], ['bend', 'Taipuisuus'], ['hardness', 'Kovuus'], ['opinion', 'Mieltymys, ei ominaisuushavainto']]);
  }
  if (task.mode === 'levels') for (const key of ['object', 'material', 'substance'] as const) add(key, task.levels![key], [['object', 'Esine'], ['material', 'Materiaali'], ['substance', 'Kemiallinen aine']]);
  if (task.mode === 'state') for (const s of task.states!) {
    add(`state:${s.id}`, s.label, states);
    if (task.stateExperiment === 'compress') add(`change:${s.id}`, `${s.label}, tilavuus kevyessä puristuksessa`, [['same', 'Lähes sama'], ['smaller', 'Pienenee selvästi']]);
  }
  if (task.mode === 'phase') {
    add('before', 'Olomuoto ennen', states); add('after', 'Olomuoto jälkeen', states); add('change', 'Muutoksen nimi', changeLabels);
    add('mass', 'Saman aineen massa lopussa', undefined, 'mg');
  }
  if (task.mode === 'composition') for (const s of task.compositions!) {
    add(`species:${s.id}`, `${s.label}, kemiallisten aineiden määrä`, undefined, 'kpl');
    add(`class:${s.id}`, `${s.label}, luokitus`, task.skill === 'pure' ? [['pure', 'Puhdas aine'], ['mixture', 'Seos']] : [['homogeneous', 'Tasakoosteinen seos'], ['heterogeneous', 'Sekakoosteinen seos']]);
  }
  if (task.mode === 'dissolve') {
    for (const t of task.trials!) {
      add(`dissolved:${t.id}`, `${t.label}, liuennut`, undefined, 'mg'); add(`left:${t.id}`, `${t.label}, liukenematta`, undefined, 'mg');
      add(`solvent:${t.id}`, `${t.label}, liuotin`, [[t.solvent, t.solvent], [t.solute, t.solute]]);
    }
    add('comparison', 'Enemmän ainetta liuennut', [['a', 'Koe A'], ['b', 'Koe B'], ['equal', 'Yhtä paljon']]);
    if (task.skill === 'solution') {
      add('mixture', 'Kirkas liuososa on', [['homogeneous', 'Tasakoosteinen seos'], ['pure', 'Puhdas aine'], ['empty', 'Tyhjää']]);
      add('mass', 'Kokeen A aineiden massa yhteensä', undefined, 'mg');
    }
  }
  if (task.mode === 'separate') for (const s of task.stations!) {
    add(`method:${s.id}`, `${s.label}, menetelmä`, Object.entries(methodLabels));
    add(`target:${s.id}`, `${s.label}, tavoiteastian kohdeaine`, undefined, 'mg');
    add(`remaining:${s.id}`, `${s.label}, muissa astioissa kohdeainetta`, undefined, 'mg');
    add(`solvent:${s.id}`, `${s.label}, siirtynyt liuotin`, undefined, 'mg');
    add(`dissolved:${s.id}`, `${s.label}, siirtynyt alun liuennut aine`, undefined, 'mg');
    add(`residue:${s.id}`, `${s.label}, jäännöksen kokonaismassa`, undefined, 'mg');
    if (s.method === 'decant') add(`sample:${s.id}`, `${s.label}, käytettävä näyte`, [['settled', 'Laskeutunut'], ['stirred', 'Juuri sekoitettu']]);
  }
  return q;
}
function expectedValues(task: MaterialsMixturesTask): Record<string, string> {
  const values: Record<string, string> = {};
  if (task.mode === 'materials') {
    if (task.skill !== 'compare' && task.skill !== 'property') for (const s of task.samples!) values[`material:${s.id}`] = s.material;
    if (task.property) {
      const amounts = task.samples!.map(s => s[task.property!]);
      values.difference = String(Math.max(...amounts) - Math.min(...amounts));
      const best = task.choose === 'min' ? Math.min(...amounts) : Math.max(...amounts);
      values.choice = task.samples!.find(s => s[task.property!] === best)!.id;
    }
    for (const o of task.observations ?? []) values[`property:${o.id}`] = o.property;
  }
  if (task.mode === 'levels') for (const key of ['object', 'material', 'substance']) values[key] = key;
  if (task.mode === 'state') for (const s of task.states!) { values[`state:${s.id}`] = s.phase; if (task.stateExperiment === 'compress') values[`change:${s.id}`] = s.phase === 'gas' ? 'smaller' : 'same'; }
  if (task.mode === 'phase') Object.assign(values, { before: task.phase!.before, after: task.phase!.after,
    change: changes[`${task.phase!.before}-${task.phase!.after}` as keyof typeof changes], mass: String(task.phase!.massMg) });
  if (task.mode === 'composition') for (const s of task.compositions!) {
    values[`species:${s.id}`] = String(new Set(s.substances.filter(x => x.count > 0).map(x => x.name)).size);
    values[`class:${s.id}`] = task.skill === 'pure' ? (Number(values[`species:${s.id}`]) === 1 ? 'pure' : 'mixture') : (s.phases === 1 ? 'homogeneous' : 'heterogeneous');
  }
  if (task.mode === 'dissolve') {
    for (const t of task.trials!) Object.assign(values, { [`dissolved:${t.id}`]: String(Math.min(t.doseMg, t.capacityMg)),
      [`left:${t.id}`]: String(Math.max(0, t.doseMg - t.capacityMg)), [`solvent:${t.id}`]: t.solvent });
    const a = Math.min(task.trials![0]!.doseMg, task.trials![0]!.capacityMg), b = Math.min(task.trials![1]!.doseMg, task.trials![1]!.capacityMg);
    values.comparison = a > b ? 'a' : a < b ? 'b' : 'equal';
    if (task.skill === 'solution') Object.assign(values, { mixture: 'homogeneous', mass: String(task.trials![0]!.doseMg + task.trials![0]!.solventMg) });
  }
  if (task.mode === 'separate') for (const s of task.stations!) {
    const o = stationOutcome(task, s);
    Object.assign(values, { [`method:${s.id}`]: s.method, [`target:${s.id}`]: String(o.target), [`remaining:${s.id}`]: String(o.remaining), [`solvent:${s.id}`]: String(o.solvent), [`dissolved:${s.id}`]: String(o.dissolved), [`residue:${s.id}`]: String(o.residueTotal), ...(s.method === 'decant' ? { [`sample:${s.id}`]: 'settled' } : {}) });
  }
  return values;
}
export function solutionMaterialsMixtures(task: MaterialsMixturesTask): MaterialsMixturesResponse {
  const actions = task.stations?.map(s => stationAction(task, s, s.method)) ?? task.trials?.map(t => trialAction(task, t))
    ?? task.states?.map(s => observationAction(task, s.id)) ?? (task.phase ? [observationAction(task, 'water')] : []);
  return { kind, mode: task.mode, values: expectedValues(task), actions, predictionsLocked: true,
    ...(task.review ? { review: { observations: {}, confirmedByAdult: false, assistance: 'none' as const } } : {}) };
}
export function mixtureExplanation(review: MixtureReview): ObservedExplanationTask {
  return { kind: 'observed-explanation', channel: 'spoken', givens: [], ...review };
}
function actionsComplete(task: MaterialsMixturesTask, response: MaterialsMixturesResponse) {
  const required = solutionMaterialsMixtures(task).actions;
  if (!Array.isArray(response.actions) || response.actions.length !== required.length || response.predictionsLocked !== true) return false;
  return required.every(a => response.actions.some(b => b && Object.keys(a).every(key => Object.hasOwn(b, key) && a[key as keyof MatterAction] === b[key as keyof MatterAction]) && Object.keys(b).length === Object.keys(a).length));
}
export function checkMaterialsActivity(task: MaterialsMixturesTask, response: MaterialsMixturesResponse): MixtureVerdict {
  if (!response || response.kind !== kind || response.mode !== task.mode || !response.values || typeof response.values !== 'object') return { ok: false, why: 'Tämä vastaus kuuluu tämän näytepöydän tehtävään.' };
  if (!actionsComplete(task, response)) return { ok: false, why: 'Lukitse oma ennuste ja tee jokaisen näytteen oma koetoimi. Aine säilyy myös sivuastiassa.' };
  const questions = materialsQuestions(task), expected = expectedValues(task);
  if (Object.keys(response.values).length !== questions.length || !questions.every(q => Object.hasOwn(response.values, q.id))) return { ok: false, why: 'Täydennä jokaisen näytteen merkinnät.' };
  for (const q of questions) {
    const actual = response.values[q.id];
    if (q.id === 'choice' && task.samples && task.property) {
      const selected = task.samples.find(s => s.id === actual), best = task.samples.find(s => s.id === expected.choice)!;
      if (selected && selected[task.property] === best[task.property]) continue;
    }
    if (q.options ? actual !== expected[q.id] : !exact(actual, Number(expected[q.id]))) return { ok: false,
      why: q.options ? `Tarkista havainto ja sen merkitys. ${q.label}` : `Seuraa aineen massaa tai havaintojen eroa. ${q.label}` };
  }
  return { ok: true };
}
export function checkMaterialsMixtures(task: MaterialsMixturesTask, response: MaterialsMixturesResponse): MixtureVerdict {
  let observation: MixtureVerdict | undefined;
  if (task.review) {
    const review = response?.review;
    if (!review || !['none', 'helped'].includes(review.assistance)) return { ok: false, pendingReview: true, why: 'Aikuinen merkitsee erikseen, käytettiinkö apua.' };
    observation = checkObservedExplanation(mixtureExplanation(task.review), { kind: 'observed-explanation', channel: 'spoken',
      observations: review?.observations ?? {}, confirmedByAdult: review?.confirmedByAdult === true, assistance: review.assistance });
    if (observation.pendingReview) return observation;
  }
  const activity = checkMaterialsActivity(task, response);
  if (!activity.ok) return { ...activity, ...(observation?.observedByAdult ? { observedByAdult: true as const } : {}), ...(observation?.assisted ? { assisted: true as const } : {}) };
  return observation ?? activity;
}
export function wrongMaterialsMixturesResponses(task: MaterialsMixturesTask): MaterialsMixturesResponse[] {
  const answer = solutionMaterialsMixtures(task), first = materialsQuestions(task)[0]!;
  return [{ ...answer, actions: [], predictionsLocked: false }, { ...answer, values: { ...answer.values, [first.id]: first.options ? first.options.find(([v]) => v !== answer.values[first.id])![0] : String(Number(answer.values[first.id]) + 1) } }];
}
