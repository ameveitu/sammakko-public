import type { ComparisonData, EnergyData, LifecycleFlow, LifecycleHarborResponse, LifecycleHarborTask, MaterialData, ResourceData, StageData } from '../src/content/models/lifecycle-harbor';

export function materialOracle(d: MaterialData) {
  const fresh = BigInt(d.freshG), opening = BigInt(d.openingReturnedG), side = BigInt(d.sideG), dust = BigInt(d.dustG), sort = BigInt(d.sortableG);
  const candidate = sort * BigInt(d.recoveryNumerator) / BigInt(d.recoveryDenominator), back = candidate < BigInt(d.qualityLimitG) ? candidate : BigInt(d.qualityLimitG);
  const entries: [string, string, string, bigint][] = [['fresh', 'outside', 'factory', fresh], ['opening', 'opening-stock', 'factory', opening], ['product', 'factory', 'use', fresh + opening - side - dust - sort], ['side', 'factory', 'side-use', side], ['dust', 'factory', 'environment', dust], ['sort', 'factory', 'sorter', sort], ['returned', 'sorter', 'closing-stock', back], ['reject', 'sorter', 'residue', sort - back]];
  return { flows: entries.map(([id, from, to, amount]) => ({ id, from, to, amount: Number(amount) })), freshNextG: Number(fresh + opening - back), locked: true, operated: true };
}
export function energyOracle(d: EnergyData) {
  const electricity = BigInt(d.electricKj), fuel = BigInt(d.fuelKj), useful = BigInt(d.usefulKj), heat = electricity + fuel - useful;
  const rate = heat * BigInt(d.recoveryNumerator) / BigInt(d.recoveryDenominator), recovered = d.plan === 'recover' ? rate < BigInt(d.compatibleDemandKj) ? rate : BigInt(d.compatibleDemandKj) : 0n;
  const saving = d.plan === 'insulate' ? BigInt(d.savedKj) : recovered;
  const entries: [string, string, string, bigint][] = [['electric', 'electricity', 'before', electricity], ['fuel', 'fuel', 'before', fuel], ['useful', 'before', 'useful', useful], ['heat', 'before', 'heat', heat], ['after-purchase', 'purchased', 'after', electricity + fuel - saving], ['after-return', 'recovered', 'after', recovered], ['after-useful', 'after', 'useful', useful], ['after-heat', 'after', 'environment', heat - saving], ['after-store', 'after', 'next-heat-stock', recovered]];
  return { flows: entries.map(([id, from, to, amount]) => ({ id, from, to, amount: Number(amount) })), nextPurchasedKj: Number(electricity + fuel - saving), locked: true, operated: true };
}
export function comparisonOracle(d: ComparisonData) {
  const quantities = d.options.map(o => {
    let uses = d.uses, units = 0, repairs = 0;
    while (uses > 0) { const performed = Math.min(uses, o.lifeUses); units++; if (performed > o.baseLifeUses) repairs++; uses -= performed; }
    return { option: o.id, units, repairs, materialG: Number(BigInt(units) * BigInt(o.newMaterialG) + BigInt(repairs) * BigInt(o.repairMaterialG)), energyKj: Number(BigInt(units) * (BigInt(o.makeEnergyKj) + BigInt(o.transportKj)) + BigInt(d.uses) * BigInt(o.useEnergyKj) + BigInt(repairs) * BigInt(o.repairEnergyKj)), returnedG: units * o.endReturnG };
  });
  return { quantities, choice: [...quantities].sort((a, b) => d.priority === 'energy' ? a.energyKj - b.energyKj : a.materialG - b.materialG)[0]!.option };
}
function resourceOracle(d: ResourceData) {
  const distance = new Map<string, number>([[d.start, 0]]);
  for (let n = 0; n < 4; n++) for (const edge of d.connections) if (distance.has(edge.from)) distance.set(edge.to, Math.min(distance.get(edge.to) ?? 9, distance.get(edge.from)! + 1));
  const roles = d.cards.map(c => ({ card: c.id, role: (['resource', 'intermediate', 'material', 'object'] as const)[distance.get(c.id)!]! }));
  const route = [d.start];
  while (route.at(-1) !== d.finish) route.push(d.connections.find(e => e.from === route.at(-1))!.to);
  return { roles, path: d.direction === 'object-to-source' ? route.reverse() : route };
}
function stageOracle(d: StageData) {
  const labels = { 'Alkuperäpassi': 'extraction', 'Telakan valmistamo': 'manufacture', 'Rahtiveneen matka': 'transport', 'Retken palvelu': 'use', 'Varaosan vaihto': 'maintenance', 'Seuraavan retkeilijän vuoro': 'reuse', 'Materiaalin uusi alku': 'recycling', 'Jäännöksen käsittely': 'disposal' } as const;
  const semantic = { raw: 'extraction', make: 'manufacture', ship: 'transport', use: 'use', repair: 'maintenance', reuse: 'reuse', recycle: 'recycling', end: 'disposal' } as const;
  const connections = { t1: ['raw', 'make'], t2: ['make', 'ship'], t3: ['ship', 'use'], t4: ['use', 'repair'], t5: ['repair', 'use'], t6: ['use', 'reuse'], t7: ['use', 'recycle'], t8: ['recycle', 'make'], t9: ['recycle', 'end'] } as const;
  const assignments = d.events.map(e => ({ event: e.id, stage: labels[e.label as keyof typeof labels] }));
  const event = (key: keyof typeof semantic) => assignments.find(a => a.stage === semantic[key])!.event;
  return { assignments, edges: d.transitions.map(t => ({ transition: t.id, from: event(connections[t.id as keyof typeof connections][0]), to: event(connections[t.id as keyof typeof connections][1]) })) };
}
/** Synthetic complete human-assessment metadata is a test fixture, never an automatic production assessor. */
export function lifecycleOracle(task: LifecycleHarborTask): LifecycleHarborResponse {
  const response: LifecycleHarborResponse = { kind: 'lifecycle-harbor', mode: task.mode };
  if ('resource' in task) response.resource = resourceOracle(task.resource);
  if ('stages' in task) response.stages = stageOracle(task.stages);
  if ('material' in task) response.material = materialOracle(task.material);
  if ('energy' in task) response.energy = energyOracle(task.energy);
  if ('comparison' in task) response.comparison = comparisonOracle(task.comparison);
  if (task.review) response.review = { channel: 'spoken', observations: Object.fromEntries(task.review.rubric.map(c => [c.id, 'met'])), confirmedByAdult: true, assistance: 'none' };
  return response;
}
export function incidence(flows: readonly LifecycleFlow[], node: string): bigint {
  return flows.reduce((n, f) => n + (f.to === node ? BigInt(f.amount!) : 0n) - (f.from === node ? BigInt(f.amount!) : 0n), 0n);
}
