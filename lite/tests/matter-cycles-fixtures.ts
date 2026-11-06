import type { CycleEdge, MatterCyclesResponse, MatterCyclesTask } from '../src/content/models/matter-cycles';
const kind = 'matter-cycles' as const;
function endpointsFromDescription(task: Extract<MatterCyclesTask, { mode: 'carbon-network' }>): CycleEdge[] {
  const environment = task.reservoirs.find(r => r.id === 'plant')!.label.startsWith('Vesi') ? 'water' : 'air';
  return task.processes.map(process => {
    const text = process.description;
    let pair: [string, string];
    if (/ottaa.*CO₂/.test(text)) pair = [environment, 'plant'];
    else if (/Kasvin hengitys|Vesikasvin hengitys/.test(text)) pair = ['plant', environment];
    else if (/Hajottajien/.test(text)) pair = ['soil', environment];
    else if (/ravintona/.test(text)) pair = ['plant', 'animal'];
    else if (/Kuolleen eläin/.test(text)) pair = ['animal', 'soil'];
    else if (/fossiilisen|Fossiilisen/.test(text)) pair = ['geological', 'air'];
    else if (/palaminen/.test(text)) pair = ['plant', 'air'];
    else if (/liukenee/.test(text)) pair = ['air', 'water'];
    else if (/Vedestä vapautuu/.test(text)) pair = ['water', 'air'];
    else throw Error(`Unhandled source statement ${text}`);
    return { process: process.id, from: pair[0], to: pair[1] };
  });
}
function observation(task: MatterCyclesTask) {
  return task.review ? { channel: 'spoken' as const, observations: Object.fromEntries(task.review.rubric.map(c => [c.id, 'met' as const])), confirmedByAdult: true, assistance: 'none' as const } : undefined;
}
export function matterOracle(task: MatterCyclesTask): MatterCyclesResponse {
  const review = observation(task);
  if (task.mode === 'conservation') {
    const total = Number(task.initial.reduce((sum, p) => sum + BigInt(p.amountMg), 0n)), target = Number(task.initial.filter(p => p.reservoir === task.target).reduce((sum, p) => sum + BigInt(p.amountMg), BigInt(task.amountMg)));
    return { kind, mode: task.mode, predictedTotalMg: total, locked: true, moves: [{ run: task.run, id: 'own-1', process: task.operation.id, from: task.source, to: task.target, amountMg: task.amountMg }], totalMg: total, targetMg: target, energyIsMatter: false };
  }
  if (task.mode === 'photosynthesis') return { kind, mode: task.mode, roles: [{ card: 'a', role: 'input' }, { card: 'b', role: 'input' }, { card: 'c', role: 'output' }, { card: 'd', role: 'output' }, { card: 'e', role: 'energy' }, { card: 'f', role: 'not-main-carbon-source' }].filter(role => task.cards.some(card => card.id === role.card)) as Extract<MatterCyclesResponse, { mode: 'photosynthesis' }>['roles'], trace: ['b', task.plant, 'c'], dayCarbonMg: task.carbonMg, darkPhotoCarbonMg: 0, locked: true, observed: true, rejectedCard: task.variant === 'repair-energy-as-matter' ? 'e' : null };
  const assignments = (cards: Extract<MatterCyclesTask, { mode: 'reservoirs' }>['cards']) => cards.map(card => ({ card: card.id, reservoir: card.formula.C ? card.formula.Ca || card.label.startsWith('Fossiilisen') ? 'geological' : card.label.startsWith('Ilmakehän') ? 'air' : /^(Kasvin|Tuoreen)/.test(card.label) ? 'plant' : card.label.startsWith('Eläimen') ? 'animal' : card.label.startsWith('Maaperän') ? 'soil' : 'water' : null }));
  if (task.mode === 'reservoirs') return { kind, mode: task.mode, assignments: assignments(task.cards), totalCarbonMg: Number(task.cards.filter(c => c.formula.C).reduce((sum, c) => sum + BigInt(c.carbonMg), 0n)) };
  if (task.mode === 'water-path') {
    const table: Record<string, readonly [string, string]> = { Haihtuminen: ['sea', 'vapor'], Tiivistyminen: ['vapor', 'cloud'], Sade: ['cloud', 'river'], Valunta: ['river', 'sea'], Imeytyminen: ['river', 'groundwater'], 'Pohjaveden virtaus': ['groundwater', 'sea'], 'Jäätyminen ja lumisade': ['cloud', 'snow'], Sulaminen: ['snow', 'river'], 'Viipyminen varastossa': ['snow', 'snow'] };
    const edges = task.processes.map(p => ({ process: p.id, from: table[p.label]![0], to: table[p.label]![1] }));
    const names = ['Haihtuminen', 'Tiivistyminen', ...(task.mustStore ? ['Jäätyminen ja lumisade', 'Viipyminen varastossa', 'Sulaminen'] : ['Sade']), ...(task.requiredProcesses.includes('runoff') ? ['Valunta'] : ['Imeytyminen', 'Pohjaveden virtaus'])];
    const moves = names.map((name, i) => { const p = task.processes.find(p => p.label === name)!, pair = table[name]!; return { run: task.run, id: `own-${i + 1}`, process: p.id, from: pair[0], to: pair[1], amountMg: task.amountMg }; });
    return { kind, mode: task.mode, edges, locked: true, moves, cloud: 'droplets-or-ice', storedAt: task.mustStore };
  }
  const edges = endpointsFromDescription(task), stocks = new Map(task.reservoirs.map(r => [r.id, task.initial.filter(p => p.reservoir === r.id).reduce((sum, p) => sum + BigInt(p.amountMg), 0n)]));
  const before = stocks.get(task.focus)!;
  const moves = edges.map((edge, i) => ({ ...edge, run: task.run, id: `own-${i + 1}`, amountMg: task.processes.find(p => p.id === edge.process)!.amountMg }));
  for (const move of moves) { stocks.set(move.from, stocks.get(move.from)! - BigInt(move.amountMg)); stocks.set(move.to, stocks.get(move.to)! + BigInt(move.amountMg)); }
  const returnPath = task.requireReturn ? task.mustReturnVia.length ? [task.focus, 'plant', 'animal', 'soil', task.focus] : [task.focus, 'plant', task.focus] : [];
  return { kind, mode: task.mode, edges, assignments: task.cards ? assignments(task.cards) : [], returnPath, locked: true, moves, focusChangeMg: Number(stocks.get(task.focus)! - before), longStore: task.goal === 'burn' ? 'geological' : null, ...(task.goal === 'burn-trace' ? { energyIsMatter: false } : {}), ...(review ? { review } : {}) };
}
