import type { CriterionObservation, ObservedExplanationTask } from './observed-explanations';

export type LifecycleRole = 'resource' | 'intermediate' | 'material' | 'object';
export type LifecycleStage = 'extraction' | 'manufacture' | 'transport' | 'use' | 'maintenance' | 'reuse' | 'recycling' | 'disposal';
export interface LifecycleReview extends Pick<ObservedExplanationTask, 'prompt' | 'rubric' | 'model'> {}
export interface LifecycleObservation { channel: 'spoken' | 'written'; observations: Partial<Record<string, CriterionObservation>>; confirmedByAdult: boolean; assistance: 'none' | 'helped' }
interface Base { kind: 'lifecycle-harbor'; title: string; context: { title: string; skills: readonly string[] }; review?: LifecycleReview }
export interface ResourceData {
  cards: readonly { id: string; label: string; description: string; role: LifecycleRole }[];
  connections: readonly { from: string; to: string; process: string }[];
  start: string; finish: string; direction: 'source-to-object' | 'object-to-source'; limit: string;
}
export interface StageData {
  events: readonly { id: string; label: string; description: string; stage: LifecycleStage }[];
  transitions: readonly { id: string; from: string; to: string; description: string }[];
  product: string; repairMaterialG: number; focus: 'repair-return' | 'end-options' | 'combined';
}
/** One tracked material in g. Dust remains an output. A quality limit caps usable recovered stock. */
export interface MaterialData {
  substance: string; batch: string; freshG: number; openingReturnedG: number; sideG: number; dustG: number; sortableG: number;
  recoveryNumerator: number; recoveryDenominator: number; qualityLimitG: number; intervention: 'collect-offcuts' | 'quality-separation';
}
/** Separate before/after energy ledgers for the same useful service. Recovered heat displaces only the given compatible demand. */
export interface EnergyData {
  batch: string; source: string; electricKj: number; fuelKj: number; usefulKj: number; stage: string;
  plan: 'insulate' | 'recover'; savedKj: number; recoveryNumerator: number; recoveryDenominator: number; compatibleDemandKj: number;
}
export interface LifecycleOption {
  /** newMaterialG is external manufacturing feed per new object, including its bounded process losses. */
  id: string; label: string; baseLifeUses: number; lifeUses: number; newMaterialG: number; repairMaterialG: number;
  makeEnergyKj: number; transportKj: number; repairEnergyKj: number; useEnergyKj: number; endReturnG: number;
  /** endReturnG is later end-of-life recovery potential per purchased object, not a return during the service period. */
}
export interface ComparisonData {
  service: string; uses: number; period: string; boundary: string; priority: 'material' | 'energy' | 'tradeoff';
  options: readonly LifecycleOption[]; uncertainty: string;
}
export type LifecycleHarborTask =
  | Base & { mode: 'resource-chain'; resource: ResourceData }
  | Base & { mode: 'stage-network'; stages: StageData }
  | Base & { mode: 'material-flow'; material: MaterialData }
  | Base & { mode: 'energy-flow'; energy: EnergyData }
  | Base & { mode: 'compare'; comparison: ComparisonData }
  | Base & { mode: 'integration'; scope: 'lifecycle'; stages: StageData; material: MaterialData }
  | Base & { mode: 'integration'; scope: 'sustainability'; material: MaterialData; energy: EnergyData; comparison: ComparisonData };
export interface ResourceAnswer { roles: readonly { card: string; role: LifecycleRole | null }[]; path: readonly string[] }
export interface StageAnswer { assignments: readonly { event: string; stage: LifecycleStage | null }[]; edges: readonly { transition: string; from: string; to: string }[] }
export interface LifecycleFlow { id: string; from: string; to: string; amount: number | null }
export interface MaterialAnswer { flows: readonly LifecycleFlow[]; freshNextG: number | null; locked: boolean; operated: boolean }
export interface EnergyAnswer { flows: readonly LifecycleFlow[]; nextPurchasedKj: number | null; locked: boolean; operated: boolean }
export interface ComparisonAnswer { quantities: readonly { option: string; units: number | null; repairs: number | null; materialG: number | null; energyKj: number | null; returnedG: number | null }[]; choice: string }
export interface LifecycleHarborResponse {
  kind: 'lifecycle-harbor'; mode: LifecycleHarborTask['mode']; resource?: ResourceAnswer; stages?: StageAnswer;
  material?: MaterialAnswer; energy?: EnergyAnswer; comparison?: ComparisonAnswer; review?: LifecycleObservation;
}
export interface LifecycleVerdict { ok: boolean; why?: string; pendingReview?: true; observedByAdult?: true; assisted?: true }
export const lifecycleHarborSources = [
  'https://www.energy.gov/cmei/rd-greet-life-cycle-assessment-model',
  'https://www.gsa.gov/governmentwide-initiatives/federal-highperformance-buildings/highperformance-building-clearinghouse/integrative-design-strategies/life-cycle-perspective/key-terms',
  'https://www.energy.gov/cmei/ito/waste-heat-recovery-basics',
  'https://www.essentialchemicalindustry.org/metals/aluminium.html',
  'https://www.steel.org/steel-technology/steel-production/',
  'https://www.corning.com/worldwide/en/innovation/materials-science/glass/how-glass-made.html',
  'https://www.energy.gov/cmei/systems/solar-photovoltaic-manufacturing-basics',
  'https://www.chlorineinstitute.org/chlorine-manufacture',
  'https://www.lime.org/resource/how-lime-is-made/',
  'https://www.borealisgroup.com/products/base-chemicals/olefins-and-co-products',
  'https://www.bwpa.org.uk/wood-pulp/',
] as const;
export const lifecycleStageNames: Record<LifecycleStage, string> = { extraction: 'Raaka-ainehankinta', manufacture: 'Valmistus', transport: 'Kuljetus', use: 'Käyttö', maintenance: 'Huolto ja korjaus', reuse: 'Uudelleenkäyttö', recycling: 'Materiaalin kierrätys', disposal: 'Loppukäsittely' };
export const lifecycleRoleNames: Record<LifecycleRole, string> = { resource: 'Luonnonvara', intermediate: 'Jalostuksen välituote', material: 'Materiaali', object: 'Käyttöesine' };

export function lifecycleDataSafe(value: unknown, depth = 0): boolean {
  if (depth > 10) return false;
  if (value === null || value === undefined || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isSafeInteger(value) && Math.abs(value) <= 10000000;
  if (typeof value === 'string') return value.length <= 90;
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return Object.getPrototypeOf(value) === Array.prototype && value.length <= 70 && Reflect.ownKeys(value).length === value.length + 1 && Object.keys(value).length === value.length && Array.from({ length: value.length }, (_, i) => i).every(i => {
    const d = Object.getOwnPropertyDescriptor(value, i); return !!d && Object.hasOwn(d, 'value') && lifecycleDataSafe(d.value, depth + 1);
  });
  if (![Object.prototype, null].includes(Object.getPrototypeOf(value))) return false;
  return Reflect.ownKeys(value).length <= 30 && Reflect.ownKeys(value).every(key => {
    const d = Object.getOwnPropertyDescriptor(value, key)!; return typeof key === 'string' && d.enumerable && Object.hasOwn(d, 'value') && lifecycleDataSafe(d.value, depth + 1);
  });
}
function fields(value: unknown, required: readonly string[], optional: readonly string[] = []): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value) && required.every(k => Object.hasOwn(value, k)) && Object.keys(value).every(k => required.includes(k) || optional.includes(k));
}
function fractionOf(value: number, numerator: number, denominator: number): number {
  if (!Number.isSafeInteger(denominator) || denominator <= 0) throw new Error('Invalid authored fraction');
  const n = BigInt(value) * BigInt(numerator), d = BigInt(denominator);
  if (n % d) throw new Error('Author in whole ledger units');
  return Number(n / d);
}
export function lifecycleMaterialLedger(data: MaterialData): { flows: LifecycleFlow[]; freshNextG: number; productG: number; returnedG: number; rejectG: number } {
  const productG = data.freshG + data.openingReturnedG - data.sideG - data.dustG - data.sortableG;
  const returnedG = Math.min(fractionOf(data.sortableG, data.recoveryNumerator, data.recoveryDenominator), data.qualityLimitG);
  const rejectG = data.sortableG - returnedG;
  return { productG, returnedG, rejectG, freshNextG: data.freshG + data.openingReturnedG - returnedG, flows: [
    { id: 'fresh', from: 'outside', to: 'factory', amount: data.freshG },
    { id: 'opening', from: 'opening-stock', to: 'factory', amount: data.openingReturnedG },
    { id: 'product', from: 'factory', to: 'use', amount: productG },
    { id: 'side', from: 'factory', to: 'side-use', amount: data.sideG },
    { id: 'dust', from: 'factory', to: 'environment', amount: data.dustG },
    { id: 'sort', from: 'factory', to: 'sorter', amount: data.sortableG },
    { id: 'returned', from: 'sorter', to: 'closing-stock', amount: returnedG },
    { id: 'reject', from: 'sorter', to: 'residue', amount: rejectG },
  ] };
}
export function lifecycleEnergyLedger(data: EnergyData): { flows: LifecycleFlow[]; nextPurchasedKj: number; recoveredKj: number; beforeHeatKj: number } {
  const total = data.electricKj + data.fuelKj, beforeHeatKj = total - data.usefulKj;
  const recoveredKj = data.plan === 'recover' ? Math.min(fractionOf(beforeHeatKj, data.recoveryNumerator, data.recoveryDenominator), data.compatibleDemandKj) : 0;
  const saving = data.plan === 'insulate' ? data.savedKj : recoveredKj;
  return { nextPurchasedKj: total - saving, recoveredKj, beforeHeatKj, flows: [
    { id: 'electric', from: 'electricity', to: 'before', amount: data.electricKj },
    { id: 'fuel', from: 'fuel', to: 'before', amount: data.fuelKj },
    { id: 'useful', from: 'before', to: 'useful', amount: data.usefulKj },
    { id: 'heat', from: 'before', to: 'heat', amount: beforeHeatKj },
    { id: 'after-purchase', from: 'purchased', to: 'after', amount: total - saving },
    { id: 'after-return', from: 'recovered', to: 'after', amount: recoveredKj },
    { id: 'after-useful', from: 'after', to: 'useful', amount: data.usefulKj },
    { id: 'after-heat', from: 'after', to: 'environment', amount: beforeHeatKj - saving },
    { id: 'after-store', from: 'after', to: 'next-heat-stock', amount: recoveredKj },
  ] };
}
/** Whole objects meet a fixed service. Only a used object reaching its maintenance threshold is repaired. */
export function lifecycleOptionTotals(option: LifecycleOption, uses: number): ComparisonAnswer['quantities'][number] {
  if (!Number.isSafeInteger(uses) || uses <= 0 || option.lifeUses <= 0) throw new Error('Invalid service');
  const units = Number((BigInt(uses) + BigInt(option.lifeUses) - 1n) / BigInt(option.lifeUses));
  const repairs = Array.from({ length: units }, (_, i) => Math.min(option.lifeUses, uses - i * option.lifeUses)).filter(u => u > option.baseLifeUses).length;
  return { option: option.id, units, repairs, materialG: units * option.newMaterialG + repairs * option.repairMaterialG,
    energyKj: units * (option.makeEnergyKj + option.transportKj) + uses * option.useEnergyKj + repairs * option.repairEnergyKj, returnedG: units * option.endReturnG };
}
function reviewVerdict(task: LifecycleReview, value: LifecycleObservation | undefined): LifecycleVerdict {
  const pending = { ok: false, pendingReview: true as const, why: 'Oma perustelu odottaa aikuisen havaintoa ja tuen merkintää.' };
  if (!fields(value, ['channel', 'observations', 'confirmedByAdult', 'assistance']) || !['spoken', 'written'].includes(value.channel as string) || value.confirmedByAdult !== true || !['none', 'helped'].includes(value.assistance as string) || !fields(value.observations, task.rubric.map(c => c.id)) || !task.rubric.every(c => ['met', 'not-yet'].includes((value.observations as Record<string, string>)[c.id]!))) return pending;
  const flags = { observedByAdult: true as const, ...(value.assistance === 'helped' ? { assisted: true as const } : {}) };
  return task.rubric.every(c => (value.observations as Record<string, string>)[c.id] === 'met') ? { ok: true, ...flags } : { ok: false, ...flags, why: 'Harjoitellaan vielä aineistoon sidottua omaa perustelua.' };
}
function resourceCorrect(data: ResourceData, answer: ResourceAnswer): boolean {
  if (!fields(answer, ['roles', 'path']) || !Array.isArray(answer.roles) || answer.roles.length !== data.cards.length || new Set(answer.roles.map(r => r.card)).size !== data.cards.length || !data.cards.every(c => answer.roles.some(r => fields(r, ['card', 'role']) && r.card === c.id && r.role === c.role))) return false;
  if (!Array.isArray(answer.path) || answer.path.length < 4 || new Set(answer.path).size !== answer.path.length) return false;
  const path = data.direction === 'object-to-source' ? [...answer.path].reverse() : answer.path;
  return path[0] === data.start && path.at(-1) === data.finish && path.slice(1).every((to, i) => data.connections.some(e => e.from === path[i] && e.to === to)) && ['resource', 'intermediate', 'material', 'object'].every(role => path.some(id => data.cards.find(c => c.id === id)?.role === role));
}
function stagesCorrect(data: StageData, answer: StageAnswer): boolean {
  return fields(answer, ['assignments', 'edges']) && Array.isArray(answer.assignments) && answer.assignments.length === data.events.length && new Set(answer.assignments.map(a => a.event)).size === data.events.length && data.events.every(e => answer.assignments.some(a => fields(a, ['event', 'stage']) && a.event === e.id && a.stage === e.stage)) && Array.isArray(answer.edges) && answer.edges.length === data.transitions.length && new Set(answer.edges.map(e => e.transition)).size === data.transitions.length && data.transitions.every(t => answer.edges.some(e => fields(e, ['transition', 'from', 'to']) && e.transition === t.id && e.from === t.from && e.to === t.to));
}
function flowsCorrect(expected: readonly LifecycleFlow[], answer: readonly LifecycleFlow[]): boolean {
  return Array.isArray(answer) && answer.length === expected.length && new Set(answer.map(a => a.id)).size === expected.length && expected.every(e => answer.some(a => fields(a, ['id', 'from', 'to', 'amount']) && a.id === e.id && a.from === e.from && a.to === e.to && a.amount === e.amount));
}
function materialCorrect(data: MaterialData, value: MaterialAnswer): boolean {
  const expected = lifecycleMaterialLedger(data);
  return fields(value, ['flows', 'freshNextG', 'locked', 'operated']) && value.locked === true && value.operated === true && value.freshNextG === expected.freshNextG && flowsCorrect(expected.flows, value.flows);
}
function energyCorrect(data: EnergyData, value: EnergyAnswer): boolean {
  const expected = lifecycleEnergyLedger(data);
  return fields(value, ['flows', 'nextPurchasedKj', 'locked', 'operated']) && value.locked === true && value.operated === true && value.nextPurchasedKj === expected.nextPurchasedKj && flowsCorrect(expected.flows, value.flows);
}
function comparisonCorrect(data: ComparisonData, value: ComparisonAnswer): boolean {
  if (!fields(value, ['quantities', 'choice']) || !Array.isArray(value.quantities) || value.quantities.length !== data.options.length || new Set(value.quantities.map(q => q.option)).size !== data.options.length || !data.options.some(o => o.id === value.choice)) return false;
  const expected = data.options.map(o => lifecycleOptionTotals(o, data.uses));
  if (!expected.every(e => value.quantities.some(a => fields(a, ['option', 'units', 'repairs', 'materialG', 'energyKj', 'returnedG']) && Object.keys(e).every(k => a[k as keyof typeof a] === e[k as keyof typeof e])))) return false;
  const chosen = expected.find(e => e.option === value.choice)!;
  return data.priority === 'tradeoff' || (data.priority === 'material' ? chosen.materialG === Math.min(...expected.map(e => e.materialG!)) : chosen.energyKj === Math.min(...expected.map(e => e.energyKj!)));
}
export function checkLifecycleHarbor(task: LifecycleHarborTask, response: LifecycleHarborResponse): LifecycleVerdict {
  try {
    if (!lifecycleDataSafe(response)) return { ok: false, ...(task.review ? { pendingReview: true as const } : {}), why: 'Tarkista omat rakenteiset vastaukset.' };
    const keys = ['kind', 'mode', ...('resource' in task ? ['resource'] : []), ...('stages' in task ? ['stages'] : []), ...('material' in task ? ['material'] : []), ...('energy' in task ? ['energy'] : []), ...('comparison' in task ? ['comparison'] : [])];
    const review = task.review ? reviewVerdict(task.review, response?.review) : { ok: true };
    if (review.pendingReview) return review;
    const flags = { ...(review.observedByAdult ? { observedByAdult: true as const } : {}), ...(review.assisted ? { assisted: true as const } : {}) };
    if (!fields(response, keys, task.review ? ['review'] : []) || response.kind !== task.kind || response.mode !== task.mode) return { ok: false, ...flags, why: 'Vastaa juuri tämän telakkatapauksen vaiheisiin.' };
    const ok = (!('resource' in task) || resourceCorrect(task.resource, response.resource!)) && (!('stages' in task) || stagesCorrect(task.stages, response.stages!)) && (!('material' in task) || materialCorrect(task.material, response.material!)) && (!('energy' in task) || energyCorrect(task.energy, response.energy!)) && (!('comparison' in task) || comparisonCorrect(task.comparison, response.comparison!));
    return { ok: ok && review.ok, ...flags, ...(!ok ? { why: 'Tarkista omat reitit, yksiköt, sivuvirrat ja sama palvelutarve. Paluuvarasto ja ympäristö kuuluvat rajattuun tiliin.' } : review.why ? { why: review.why } : {}) };
  } catch { return { ok: false, why: 'Tarkista telakkamallin rakenteiset tiedot.' }; }
}
export function solutionLifecycleHarbor(task: LifecycleHarborTask): LifecycleHarborResponse {
  const response: LifecycleHarborResponse = { kind: task.kind, mode: task.mode };
  if ('resource' in task) {
    const visit = (id: string, path: string[]): string[] | undefined => id === task.resource.finish ? path : task.resource.connections.filter(e => e.from === id && !path.includes(e.to)).map(e => visit(e.to, [...path, e.to])).find(Boolean);
    const path = visit(task.resource.start, [task.resource.start]) ?? [];
    response.resource = { roles: task.resource.cards.map(c => ({ card: c.id, role: c.role })), path: task.resource.direction === 'object-to-source' ? path.reverse() : path };
  }
  if ('stages' in task) response.stages = { assignments: task.stages.events.map(e => ({ event: e.id, stage: e.stage })), edges: task.stages.transitions.map(t => ({ transition: t.id, from: t.from, to: t.to })) };
  if ('material' in task) { const ledger = lifecycleMaterialLedger(task.material); response.material = { flows: ledger.flows, freshNextG: ledger.freshNextG, locked: true, operated: true }; }
  if ('energy' in task) { const ledger = lifecycleEnergyLedger(task.energy); response.energy = { flows: ledger.flows, nextPurchasedKj: ledger.nextPurchasedKj, locked: true, operated: true }; }
  if ('comparison' in task) {
    const quantities = task.comparison.options.map(o => lifecycleOptionTotals(o, task.comparison.uses));
    const sorted = [...quantities].sort((a, b) => task.comparison.priority === 'energy' ? a.energyKj! - b.energyKj! : a.materialG! - b.materialG!);
    response.comparison = { quantities, choice: sorted[0]!.option };
  }
  if (task.review) response.review = { channel: 'spoken', observations: Object.fromEntries(task.review.rubric.map(c => [c.id, 'unobserved'])), confirmedByAdult: false, assistance: 'none' };
  return response;
}
export function wrongLifecycleHarborResponses(task: LifecycleHarborTask): LifecycleHarborResponse[] {
  const response = solutionLifecycleHarbor(task);
  if (task.review) response.review = { channel: 'spoken', observations: Object.fromEntries(task.review.rubric.map(c => [c.id, 'met'])), confirmedByAdult: true, assistance: 'none' };
  if (response.resource) response.resource.path = [...response.resource.path].reverse();
  else if (response.stages) response.stages.edges = response.stages.edges.map((e, i) => i ? e : { ...e, from: e.to });
  else if (response.material) response.material.flows = response.material.flows.map(f => f.id === 'dust' ? { ...f, amount: 0 } : f);
  else if (response.energy) response.energy.nextPurchasedKj = 0;
  else if (response.comparison) response.comparison.quantities = response.comparison.quantities.map(q => ({ ...q, units: 1, materialG: 0 }));
  return [response];
}
