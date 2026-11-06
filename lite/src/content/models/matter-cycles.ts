import type { CriterionObservation, ObservedExplanationTask } from './observed-explanations';

export type CycleReservoirKind = 'air' | 'plant' | 'animal' | 'soil' | 'water' | 'geological' | 'sea' | 'vapor' | 'cloud' | 'snow' | 'river' | 'groundwater' | 'liquid' | 'gas' | 'solid' | 'solution';
export type CycleProcessKind = 'photosynthesis' | 'respiration' | 'decomposition' | 'combustion' | 'feeding' | 'litter' | 'dissolution' | 'release' | 'evaporation' | 'condensation' | 'rain' | 'runoff' | 'infiltration' | 'groundwater-flow' | 'freezing' | 'melting' | 'dissolve' | 'store';
export interface CycleReservoir { id: string; label: string; kind: CycleReservoirKind; x: number; y: number; elevation: number; description: string }
/** The unit is mg of the tracked substance, or mg of carbon alone. Never interchange mg C and mg CO2. */
export interface CycleParcel { id: string; root: string; reservoir: string; material: 'water' | 'solute' | 'carbon'; amountMg: number; form: 'liquid' | 'gas' | 'solid' | 'solution' | 'organic-carbon' | 'inorganic-carbon' }
export interface CycleLedger { run: string; parcels: readonly CycleParcel[]; applied: readonly { id: string; fingerprint: string }[] }
export interface CycleMove { run: string; id: string; process: string; from: string; to: string; amountMg: number }
export interface CycleProcess {
  id: string; kind: CycleProcessKind; label: string; amountMg: number; description: string;
  medium?: 'land' | 'aquatic'; subject?: 'plant' | 'animal'; fuel?: 'recent' | 'fossil'; timescale: string;
}
export interface CycleReview extends Pick<ObservedExplanationTask, 'prompt' | 'rubric' | 'model'> {}
export interface CycleObservation { channel: 'spoken' | 'written'; observations: Partial<Record<string, CriterionObservation>>; confirmedByAdult: boolean; assistance: 'none' | 'helped' }
interface Base { kind: 'matter-cycles'; run: string; title: string; context: { title: string; skills: readonly string[] }; review?: CycleReview }
export interface ConservationCycleTask extends Base {
  mode: 'conservation'; reservoirs: readonly CycleReservoir[]; initial: readonly CycleParcel[];
  material: 'water' | 'solute'; operation: CycleProcess; source: string; target: string; amountMg: number; energy: 'in' | 'out' | 'mixing'; boundary: 'closed';
}
export interface WaterCycleTask extends Base {
  mode: 'water-path'; reservoirs: readonly CycleReservoir[]; initial: readonly CycleParcel[]; amountMg: number;
  start: string; finish: string; mustVisit: readonly string[]; requiredProcesses: readonly CycleProcessKind[]; mustStore: string | null; processes: readonly CycleProcess[];
}
export interface PhotoCycleTask extends Base {
  mode: 'photosynthesis'; focus: 'full-process' | 'carbon-path'; carbonMg: number; medium: 'land' | 'aquatic'; variant: 'roles-and-trace' | 'repair-energy-as-matter';
  cards: readonly { id: string; material: 'water' | 'co2' | 'organic' | 'oxygen' | 'light' | 'soil'; label: string; description: string }[];
  conditions: string; plant: string;
}
export interface ReservoirCard { id: string; label: string; formula: Readonly<Record<string, number>>; location: 'air' | 'plant' | 'animal' | 'soil' | 'water' | 'geological' | 'process'; description: string; carbonMg: number }
export interface ReservoirCycleTask extends Base { mode: 'reservoirs'; reservoirs: readonly CycleReservoir[]; cards: readonly ReservoirCard[] }
export interface CarbonNetworkTask extends Base {
  mode: 'carbon-network'; goal: 'transfers' | 'matter-loop' | 'integration' | 'burn' | 'burn-trace' | 'photo';
  reservoirs: readonly CycleReservoir[]; initial: readonly CycleParcel[]; processes: readonly CycleProcess[];
  period: string; focus: string; mustReturnVia: readonly string[]; requireReturn: boolean;
  cards?: readonly ReservoirCard[]; proposal?: readonly CycleEdge[]; claim?: string;
}
export type MatterCyclesTask = ConservationCycleTask | WaterCycleTask | PhotoCycleTask | ReservoirCycleTask | CarbonNetworkTask;
export interface CycleEdge { process: string; from: string; to: string }
export interface CycleAssignment { card: string; reservoir: string | null }
export type MatterCyclesResponse =
  | { kind: 'matter-cycles'; mode: 'conservation'; predictedTotalMg: number | null; locked: boolean; moves: readonly CycleMove[]; totalMg: number | null; targetMg: number | null; energyIsMatter: boolean | null; review?: CycleObservation }
  | { kind: 'matter-cycles'; mode: 'water-path'; edges: readonly CycleEdge[]; locked: boolean; moves: readonly CycleMove[]; cloud: 'droplets-or-ice' | 'vapor' | null; storedAt: string | null; review?: CycleObservation }
  | { kind: 'matter-cycles'; mode: 'photosynthesis'; roles: readonly { card: string; role: 'input' | 'output' | 'energy' | 'not-main-carbon-source' | null }[]; trace: readonly string[]; dayCarbonMg: number | null; darkPhotoCarbonMg: number | null; locked: boolean; observed: boolean; rejectedCard: string | null; review?: CycleObservation }
  | { kind: 'matter-cycles'; mode: 'reservoirs'; assignments: readonly CycleAssignment[]; totalCarbonMg: number | null; review?: CycleObservation }
  | { kind: 'matter-cycles'; mode: 'carbon-network'; edges: readonly CycleEdge[]; assignments: readonly CycleAssignment[]; returnPath: readonly string[]; locked: boolean; moves: readonly CycleMove[]; focusChangeMg: number | null; longStore: string | null; energyIsMatter?: boolean | null; review?: CycleObservation };
export interface CycleVerdict { ok: boolean; why?: string; pendingReview?: true; observedByAdult?: true; assisted?: true }
export const matterCycleSources = [
  'https://science.nasa.gov/earth/earth-observatory/the-carbon-cycle/',
  'https://www.usgs.gov/water-science-school/water-cycle',
  'https://openstax.org/books/biology-2e/pages/8-1-overview-of-photosynthesis',
  'https://openstax.org/books/biology-2e/pages/8-3-using-light-energy-to-make-organic-molecules',
] as const;
export const cycleProcessNames: Record<CycleProcessKind, string> = {
  photosynthesis: 'Yhteyttäminen', respiration: 'Hengitys', decomposition: 'Hajottajien hengitys', combustion: 'Palaminen', feeding: 'Syöminen', litter: 'Kuolleen aineen siirtymä', dissolution: 'CO₂:n liukeneminen', release: 'CO₂:n vapautuminen', evaporation: 'Haihtuminen', condensation: 'Tiivistyminen', rain: 'Sade', runoff: 'Valunta', infiltration: 'Imeytyminen', 'groundwater-flow': 'Pohjaveden virtaus', freezing: 'Jäätyminen', melting: 'Sulaminen', dissolve: 'Liukeneminen', store: 'Viipyminen varastossa',
};
export function cycleDataSafe(value: unknown, depth = 0): boolean {
  if (depth > 12) return false;
  if (value === null || value === undefined || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'string') return value.length <= 120;
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return Object.getPrototypeOf(value) === Array.prototype && value.length <= 160 && Reflect.ownKeys(value).length === value.length + 1 && Array.from({ length: value.length }, (_, i) => i).every(i => {
    const descriptor = Object.getOwnPropertyDescriptor(value, i); return !!descriptor && Object.hasOwn(descriptor, 'value') && cycleDataSafe(descriptor.value, depth + 1);
  });
  if (![Object.prototype, null].includes(Object.getPrototypeOf(value))) return false;
  const descriptors = Object.getOwnPropertyDescriptors(value);
  return Reflect.ownKeys(descriptors).length <= 80 && Reflect.ownKeys(descriptors).every(key => {
    const descriptor = descriptors[key as string]!;
    return typeof key === 'string' && descriptor.enumerable && Object.hasOwn(descriptor, 'value') && cycleDataSafe(descriptor.value, depth + 1);
  });
}
function closed<T>(value: T, required: readonly string[], optional: readonly string[] = []): value is NonNullable<T> & Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value) && required.every(key => Object.hasOwn(value, key)) && Object.keys(value).every(key => required.includes(key) || optional.includes(key));
}
const integer = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && Math.abs(value) <= 1000000;
export function cycleTotals(ledger: CycleLedger): Record<string, number> {
  const result: Record<string, number> = {};
  for (const parcel of ledger.parcels) result[parcel.root] = (result[parcel.root] ?? 0) + parcel.amountMg;
  return result;
}
export function cycleAmount(ledger: CycleLedger, reservoir?: string, material?: CycleParcel['material']): number {
  return ledger.parcels.filter(p => (!reservoir || p.reservoir === reservoir) && (!material || p.material === material)).reduce((sum, p) => sum + p.amountMg, 0);
}
export function initialCycleLedger(task: ConservationCycleTask | WaterCycleTask | CarbonNetworkTask): CycleLedger {
  return { run: task.run, parcels: task.initial.map(p => ({ ...p })), applied: [] };
}
/** All movement conserves root/substance amounts. Phase/carbon form changes never turn light into material. */
export function applyCycleMove(ledger: CycleLedger, move: CycleMove, form?: CycleParcel['form'], sourceForm?: CycleParcel['form']): CycleLedger | undefined {
  if (!cycleDataSafe(move) || !closed(move, ['run', 'id', 'process', 'from', 'to', 'amountMg']) || move.run !== ledger.run || typeof move.id !== 'string' || !/^[a-z][a-z0-9-]{0,79}$/.test(move.id) || !integer(move.amountMg) || move.amountMg <= 0 || typeof move.from !== 'string' || typeof move.to !== 'string' || !move.to) return;
  const fingerprint = JSON.stringify([move.process, move.from, move.to, move.amountMg, form ?? null, sourceForm ?? null]);
  const applied = ledger.applied.find(a => a.id === move.id);
  if (applied) return applied.fingerprint === fingerprint ? ledger : undefined;
  const available = ledger.parcels.filter(p => p.reservoir === move.from && (!sourceForm || p.form === sourceForm)).reduce((sum, p) => sum + p.amountMg, 0);
  if (available < move.amountMg) return;
  let remaining = move.amountMg;
  const parcels = ledger.parcels.flatMap(parcel => {
    if (parcel.reservoir !== move.from || sourceForm && parcel.form !== sourceForm || !remaining) return [{ ...parcel }];
    const taken = Math.min(remaining, parcel.amountMg); remaining -= taken;
    return [...(parcel.amountMg > taken ? [{ ...parcel, amountMg: parcel.amountMg - taken }] : []),
      { ...parcel, id: `${parcel.id}-${move.id}`, amountMg: taken, reservoir: move.to, ...(form ? { form } : {}) }];
  });
  const nextParcels = form === 'solution' ? parcels.map(p => p.reservoir === move.to && p.material === 'water' ? { ...p, form: 'solution' as const } : p) : parcels;
  return { run: ledger.run, parcels: nextParcels, applied: [...ledger.applied, { id: move.id, fingerprint }] };
}
/** Direction comes from the named physical/biological process and the supplied local conditions. */
export function cycleProcessEndpoints(process: CycleProcess, reservoirs: readonly CycleReservoir[]): readonly [string, string] | undefined {
  const environmental = process.medium === 'aquatic' ? 'water' : 'air';
  const kinds: Partial<Record<CycleProcessKind, readonly [CycleReservoirKind, CycleReservoirKind]>> = {
    photosynthesis: [environmental, 'plant'], respiration: [process.subject ?? 'plant', environmental], decomposition: ['soil', environmental], combustion: [process.fuel === 'fossil' ? 'geological' : 'plant', 'air'], feeding: ['plant', 'animal'], litter: [process.subject ?? 'plant', 'soil'], dissolution: ['air', 'water'], release: ['water', 'air'],
    evaporation: ['sea', 'vapor'], condensation: ['vapor', 'cloud'], rain: ['cloud', 'river'], runoff: ['river', 'sea'], infiltration: ['river', 'groundwater'], 'groundwater-flow': ['groundwater', 'sea'], freezing: ['cloud', 'snow'], melting: ['snow', 'river'], store: ['snow', 'snow'],
  };
  const pair = kinds[process.kind]; if (!pair) return;
  const from = reservoirs.find(r => r.kind === pair[0]), to = reservoirs.find(r => r.kind === pair[1]);
  return from && to ? [from.id, to.id] : undefined;
}
function targetForm(process: CycleProcess): CycleParcel['form'] | undefined {
  if (['photosynthesis', 'feeding', 'litter'].includes(process.kind)) return 'organic-carbon';
  if (['respiration', 'decomposition', 'combustion', 'dissolution', 'release'].includes(process.kind)) return 'inorganic-carbon';
  if (process.kind === 'evaporation') return 'gas';
  if (process.kind === 'freezing') return 'solid';
  if (process.kind === 'dissolve') return 'solution';
  if (['condensation', 'rain', 'runoff', 'melting', 'infiltration', 'groundwater-flow'].includes(process.kind)) return 'liquid';
  return undefined;
}
export function replayCycleMoves(task: ConservationCycleTask | WaterCycleTask | CarbonNetworkTask, moves: readonly CycleMove[]): { valid: boolean; ledger: CycleLedger } {
  let ledger = initialCycleLedger(task);
  if (!cycleDataSafe(moves) || !Array.isArray(moves) || moves.length > 120) return { valid: false, ledger };
  const processes = task.mode === 'conservation' ? [task.operation] : task.processes;
  for (const move of moves) {
    if (!closed(move, ['run', 'id', 'process', 'from', 'to', 'amountMg'])) return { valid: false, ledger };
    const process = processes.find(p => p.id === move.process); if (!process) return { valid: false, ledger };
    const pair = task.mode === 'conservation' ? [task.source, task.target] : cycleProcessEndpoints(process, task.reservoirs);
    if (!pair || move.from !== pair[0] || move.to !== pair[1]) return { valid: false, ledger };
    if (!ledger.applied.some(a => a.id === move.id)) {
      const alreadyMoved = ledger.applied.reduce((sum, a) => {
        const data = JSON.parse(a.fingerprint) as [string, string, string, number];
        return sum + (data[0] === process.id ? data[3] : 0);
      }, 0);
      if (alreadyMoved + move.amountMg > process.amountMg) return { valid: false, ledger };
    }
    const sourceForm: CycleParcel['form'] | undefined = task.mode === 'carbon-network' ? ['photosynthesis', 'dissolution', 'release'].includes(process.kind) ? 'inorganic-carbon' : 'organic-carbon' : process.kind === 'evaporation' || process.kind === 'freezing' ? 'liquid' : process.kind === 'condensation' ? 'gas' : process.kind === 'melting' || process.kind === 'dissolve' ? 'solid' : undefined;
    const next = applyCycleMove(ledger, move, targetForm(process), sourceForm); if (!next) return { valid: false, ledger };
    ledger = next;
  }
  return { valid: true, ledger };
}
function observedReview(task: CycleReview, review: CycleObservation | undefined): CycleVerdict {
  const pending = { ok: false, pendingReview: true as const, why: 'Oma aineistoon sidottu selitys odottaa aikuisen havaintoa ja tuen merkintää.' };
  if (!closed(review, ['channel', 'observations', 'confirmedByAdult', 'assistance']) || !['spoken', 'written'].includes(review.channel as string) || review.confirmedByAdult !== true || !['none', 'helped'].includes(review.assistance as string) || !closed(review.observations, task.rubric.map(c => c.id)) || !task.rubric.every(c => ['met', 'not-yet'].includes((review.observations as Record<string, string>)[c.id]!))) return pending;
  const flags = { observedByAdult: true as const, ...(review.assistance === 'helped' ? { assisted: true as const } : {}) };
  return task.rubric.every(c => (review.observations as Record<string, string>)[c.id] === 'met') ? { ok: true, ...flags } : { ok: false, ...flags, why: 'Harjoitellaan vielä omaa aineen reitin ja rajauksen selitystä.' };
}
function assignmentsCorrect(cards: readonly ReservoirCard[], reservoirs: readonly CycleReservoir[], assignments: readonly CycleAssignment[]): boolean {
  return Array.isArray(assignments) && assignments.length === cards.length && new Set(assignments.map(a => a.card)).size === cards.length && cards.every(card => {
    const answer = assignments.find(a => a.card === card.id), hasCarbon = (card.formula.C ?? 0) > 0 && card.location !== 'process';
    return closed(answer, ['card', 'reservoir']) && answer.reservoir === (hasCarbon ? reservoirs.find(r => r.kind === card.location)?.id : null);
  });
}
function edgesCorrect(task: WaterCycleTask | CarbonNetworkTask, edges: readonly CycleEdge[]): boolean {
  return Array.isArray(edges) && edges.length === task.processes.length && new Set(edges.map(e => e.process)).size === edges.length && task.processes.every(process => {
    const edge = edges.find(e => e.process === process.id), pair = cycleProcessEndpoints(process, task.reservoirs);
    return !!pair && closed(edge, ['process', 'from', 'to']) && edge.from === pair[0] && edge.to === pair[1];
  });
}
function completedProcesses(task: ConservationCycleTask | CarbonNetworkTask, moves: readonly CycleMove[]): boolean {
  if (!Array.isArray(moves)) return false;
  const unique = moves.filter((move, i) => moves.findIndex(other => other.id === move.id) === i);
  const processes = task.mode === 'conservation' ? [task.operation] : task.processes;
  return processes.every(process => unique.filter(m => m.process === process.id).reduce((sum, m) => sum + m.amountMg, 0) === process.amountMg);
}
function returnPathCorrect(task: CarbonNetworkTask, path: readonly string[]): boolean {
  if (!task.requireReturn) return Array.isArray(path) && path.length === 0;
  return Array.isArray(path) && path.length >= 3 && path.length <= 12 && path[0] === task.focus && path.at(-1) === task.focus && new Set(path.slice(0, -1)).size === path.length - 1 && task.mustReturnVia.every(id => path.includes(id)) && path.slice(1).every((to, i) => task.processes.some(process => {
    const pair = cycleProcessEndpoints(process, task.reservoirs); return !!pair && pair[0] === path[i] && pair[1] === to;
  }));
}
export function checkMatterCycles(task: MatterCyclesTask, response: MatterCyclesResponse): CycleVerdict {
  try { return checkCycleResponse(task, response); }
  catch { return { ok: false, why: 'Tarkista tämän mallin omat rakenteiset tiedot.' }; }
}
function checkCycleResponse(task: MatterCyclesTask, response: MatterCyclesResponse): CycleVerdict {
  const fail = (why = 'Tarkista aineen lähtöpaikka, suunta ja säilyvä määrä.'): CycleVerdict => ({ ok: false, why });
  if (!cycleDataSafe(response) || !response || response.kind !== 'matter-cycles' || response.mode !== task.mode) return fail();
  const review = task.review ? observedReview(task.review, response.review) : undefined;
  if (review?.pendingReview) return review;
  let ok = false;
  if (task.mode === 'conservation' && response.mode === task.mode) {
    const replay = replayCycleMoves(task, response.moves), before = initialCycleLedger(task);
    ok = closed(response, ['kind', 'mode', 'predictedTotalMg', 'locked', 'moves', 'totalMg', 'targetMg', 'energyIsMatter'], ['review']) && response.locked === true && replay.valid && completedProcesses(task, response.moves) && response.predictedTotalMg === cycleAmount(before) && response.totalMg === cycleAmount(before) && response.targetMg === cycleAmount(replay.ledger, task.target) && response.energyIsMatter === false;
  }
  if (task.mode === 'water-path' && response.mode === task.mode) {
    const replay = replayCycleMoves(task, response.moves);
    const unique = response.moves.filter((move, i) => response.moves.findIndex(other => other.id === move.id) === i);
    const visited = [task.start, ...unique.map(m => m.to)];
    ok = closed(response, ['kind', 'mode', 'edges', 'locked', 'moves', 'cloud', 'storedAt'], ['review']) && response.locked === true && edgesCorrect(task, response.edges) && replay.valid && unique.length > 3 && unique[0]?.from === task.start && unique.every((m, i) => m.amountMg === task.amountMg && (!i || unique[i - 1]!.to === m.from)) && visited.at(-1) === task.finish && task.mustVisit.every(id => visited.includes(id)) && task.requiredProcesses.every(kind => unique.some(m => task.processes.find(p => p.id === m.process)?.kind === kind)) && response.cloud === 'droplets-or-ice' && response.storedAt === task.mustStore && (!task.mustStore || unique.some(m => m.from === task.mustStore && m.to === task.mustStore && task.processes.some(p => p.id === m.process && p.kind === 'store'))) && cycleAmount(replay.ledger, task.finish) === task.amountMg;
  }
  if (task.mode === 'photosynthesis' && response.mode === task.mode) {
    const input = task.cards.find(c => c.material === 'co2')!, output = task.cards.find(c => c.material === 'organic')!, light = task.cards.find(c => c.material === 'light')!;
    ok = closed(response, ['kind', 'mode', 'roles', 'trace', 'dayCarbonMg', 'darkPhotoCarbonMg', 'locked', 'observed', 'rejectedCard'], ['review']) && Array.isArray(response.roles) && response.roles.length === task.cards.length && new Set(response.roles.map(r => r.card)).size === response.roles.length && task.cards.every(card => {
      const own = response.roles.find(r => r.card === card.id), role = card.material === 'light' ? 'energy' : card.material === 'soil' ? 'not-main-carbon-source' : ['water', 'co2'].includes(card.material) ? 'input' : 'output';
      return closed(own, ['card', 'role']) && own.role === role;
    }) && Array.isArray(response.trace) && response.trace.length === 3 && response.trace[0] === input.id && response.trace[1] === task.plant && response.trace[2] === output.id && response.dayCarbonMg === task.carbonMg && response.darkPhotoCarbonMg === 0 && response.locked === true && response.observed === true && response.rejectedCard === (task.variant === 'repair-energy-as-matter' ? light.id : null);
  }
  if (task.mode === 'reservoirs' && response.mode === task.mode) {
    ok = closed(response, ['kind', 'mode', 'assignments', 'totalCarbonMg'], ['review']) && assignmentsCorrect(task.cards, task.reservoirs, response.assignments) && response.totalCarbonMg === task.cards.filter(c => (c.formula.C ?? 0) > 0 && c.location !== 'process').reduce((sum, c) => sum + c.carbonMg, 0);
  }
  if (task.mode === 'carbon-network' && response.mode === task.mode) {
    const replay = replayCycleMoves(task, response.moves), before = initialCycleLedger(task);
    ok = closed(response, ['kind', 'mode', 'edges', 'assignments', 'returnPath', 'locked', 'moves', 'focusChangeMg', 'longStore'], ['review', 'energyIsMatter']) && response.locked === true && edgesCorrect(task, response.edges) && replay.valid && completedProcesses(task, response.moves) && returnPathCorrect(task, response.returnPath) && assignmentsCorrect(task.cards ?? [], task.reservoirs, response.assignments) && response.focusChangeMg === cycleAmount(replay.ledger, task.focus) - cycleAmount(before, task.focus) && response.longStore === (task.goal === 'burn' ? task.reservoirs.find(r => r.kind === 'geological')!.id : null) && (task.goal !== 'burn-trace' || response.energyIsMatter === false);
  }
  if (!ok) return { ...fail(), ...(review?.observedByAdult ? { observedByAdult: true, ...(review.assisted ? { assisted: true } : {}) } : {}) };
  return review ?? { ok: true };
}
export function suggestedCycleReturn(task: CarbonNetworkTask): string[] {
  if (!task.requireReturn) return [];
  const queue = [[task.focus]];
  while (queue.length) {
    const path = queue.shift()!;
    for (const process of task.processes) {
      const pair = cycleProcessEndpoints(process, task.reservoirs);
      if (!pair || pair[0] !== path.at(-1)) continue;
      const next = [...path, pair[1]];
      if (returnPathCorrect(task, next)) return next;
      if (next.length < 10 && !path.includes(pair[1])) queue.push(next);
    }
  }
  return [];
}
export function suggestedWaterMoves(task: WaterCycleTask): CycleMove[] {
  const queue: { at: string; moves: CycleMove[]; visited: readonly string[]; stored: boolean }[] = [{ at: task.start, moves: [], visited: [task.start], stored: false }];
  const seen = new Set<string>();
  while (queue.length) {
    const current = queue.shift()!, key = JSON.stringify([current.at, [...new Set(current.visited)].sort(), current.stored, [...new Set(current.moves.map(m => task.processes.find(p => p.id === m.process)?.kind))].sort()]);
    if (seen.has(key)) continue; seen.add(key);
    if (current.moves.length >= 4 && current.at === task.finish && task.mustVisit.every(id => current.visited.includes(id)) && task.requiredProcesses.every(kind => current.moves.some(m => task.processes.find(p => p.id === m.process)?.kind === kind)) && (!task.mustStore || current.stored)) return current.moves;
    for (const process of task.processes) {
      const pair = cycleProcessEndpoints(process, task.reservoirs);
      if (!pair || pair[0] !== current.at || current.moves.length >= 12) continue;
      const move = { run: task.run, id: `step-${current.moves.length + 1}`, process: process.id, from: pair[0], to: pair[1], amountMg: task.amountMg };
      queue.push({ at: pair[1], moves: [...current.moves, move], visited: [...current.visited, pair[1]], stored: current.stored || process.kind === 'store' });
    }
  }
  return [];
}
export function solutionMatterCycles(task: MatterCyclesTask): MatterCyclesResponse {
  const kind = 'matter-cycles' as const;
  const review = task.review ? { channel: 'spoken' as const, observations: {}, confirmedByAdult: false, assistance: 'none' as const } : undefined;
  const assignments = (cards: readonly ReservoirCard[], reservoirs: readonly CycleReservoir[]): CycleAssignment[] => cards.map(card => ({ card: card.id, reservoir: (card.formula.C ?? 0) > 0 && card.location !== 'process' ? reservoirs.find(r => r.kind === card.location)!.id : null }));
  if (task.mode === 'conservation') {
    const moves: CycleMove[] = [{ run: task.run, id: 'step-1', process: task.operation.id, from: task.source, to: task.target, amountMg: task.amountMg }];
    return { kind, mode: task.mode, predictedTotalMg: cycleAmount(initialCycleLedger(task)), locked: true, moves, totalMg: cycleAmount(initialCycleLedger(task)), targetMg: cycleAmount(replayCycleMoves(task, moves).ledger, task.target), energyIsMatter: false, ...(review ? { review } : {}) };
  }
  if (task.mode === 'water-path') return { kind, mode: task.mode, edges: task.processes.map(p => { const pair = cycleProcessEndpoints(p, task.reservoirs)!; return { process: p.id, from: pair[0], to: pair[1] }; }), locked: true, moves: suggestedWaterMoves(task), cloud: 'droplets-or-ice', storedAt: task.mustStore, ...(review ? { review } : {}) };
  if (task.mode === 'photosynthesis') return { kind, mode: task.mode, roles: task.cards.map(card => ({ card: card.id, role: card.material === 'light' ? 'energy' : card.material === 'soil' ? 'not-main-carbon-source' : ['water', 'co2'].includes(card.material) ? 'input' : 'output' })), trace: [task.cards.find(c => c.material === 'co2')!.id, task.plant, task.cards.find(c => c.material === 'organic')!.id], dayCarbonMg: task.carbonMg, darkPhotoCarbonMg: 0, locked: true, observed: true, rejectedCard: task.variant === 'repair-energy-as-matter' ? task.cards.find(c => c.material === 'light')!.id : null, ...(review ? { review } : {}) };
  if (task.mode === 'reservoirs') return { kind, mode: task.mode, assignments: assignments(task.cards, task.reservoirs), totalCarbonMg: task.cards.filter(c => c.location !== 'process' && (c.formula.C ?? 0) > 0).reduce((sum, c) => sum + c.carbonMg, 0), ...(review ? { review } : {}) };
  const edges = task.processes.map(process => { const pair = cycleProcessEndpoints(process, task.reservoirs)!; return { process: process.id, from: pair[0], to: pair[1] }; });
  const moves = edges.map((edge, i) => ({ ...edge, id: `step-${i + 1}`, run: task.run, amountMg: task.processes[i]!.amountMg }));
  return { kind, mode: task.mode, edges, assignments: assignments(task.cards ?? [], task.reservoirs), returnPath: suggestedCycleReturn(task), locked: true, moves, focusChangeMg: cycleAmount(replayCycleMoves(task, moves).ledger, task.focus) - cycleAmount(initialCycleLedger(task), task.focus), longStore: task.goal === 'burn' ? task.reservoirs.find(r => r.kind === 'geological')!.id : null, ...(task.goal === 'burn-trace' ? { energyIsMatter: false } : {}), ...(review ? { review } : {}) };
}
export function wrongMatterCyclesResponses(task: MatterCyclesTask): MatterCyclesResponse[] {
  const response = solutionMatterCycles(task);
  if (response.mode === 'conservation') response.predictedTotalMg = -1;
  else if (response.mode === 'water-path') response.cloud = 'vapor';
  else if (response.mode === 'photosynthesis') response.dayCarbonMg = -1;
  else if (response.mode === 'reservoirs') response.totalCarbonMg = -1;
  else response.focusChangeMg = 1000000;
  return [response];
}
