// ROOT's authority-based policy and graph oracle. No production answer builder.
// HUS: life-threatening exposure -> 112, other suspected poisoning -> Poison Centre.
// SPEK: smoke-free exit, or stay in the separate smoke-free apartment if stairs smoke.
import type { SafetyActionId, SafetyAnswer, SafetyCase, SafetyHarborResponse, SafetyHarborTask } from '../src/content/models/safety-harbor';

export function safePaths(c: Extract<SafetyCase, { mode: 'evacuation' | 'electric-path' }>): string[][] {
  const start = c.mode === 'evacuation' ? c.start : c.source;
  const found: string[][] = [];
  const walk = (path: string[]) => {
    const end = path.at(-1)!;
    if (c.mode === 'evacuation'
      ? c.nodes.some(n => n.id === end && n.safe && n.state === 'clear') && (!c.shelterInPlace || end === c.start)
      : end === c.returnNode && path.includes(c.via)) { found.push(path); return; }
    if (c.mode === 'evacuation' && c.shelterInPlace) return;
    for (const [a, b] of c.edges) {
      const next = a === end ? b : b === end ? a : undefined;
      if (!next || path.includes(next)) continue;
      if (c.mode === 'evacuation' && c.nodes.find(n => n.id === next)?.state !== 'clear') continue;
      walk([...path, next]);
    }
  };
  walk([start]); return found;
}

export function policy(c: SafetyCase): SafetyActionId[] {
  if (c.mode === 'fire-conditions') return [];
  if (c.mode === 'evacuation') return [...(c.friendsNearby ? ['warn-friends' as const] : []), ...(c.closeDoor ? ['close-door' as const] : []), 'call-112', 'wait-permission'];
  if (c.mode === 'electric-path') return ['keep-clear', 'tell-adult'];
  if (c.mode === 'label') {
    // Derive the plan from the learner-visible instructions, independently of the requirement flags.
    const plan: SafetyActionId[] = ['read-instruction'];
    for (const [phrase, action] of [['ilmanvaihdon', 'ventilate-plan'], ['erossa lämmöstä', 'keep-heat-away'], ['pääsy vesistöön', 'protect-water'], ['erillään elintarvikkeista', 'separate-food']] as const)
      if (c.instruction.includes(phrase)) plan.push(action);
    return [...plan, 'secure-storage'];
  }
  if (c.situation === 'exposure' && c.lifeThreatening) return ['keep-clear', 'tell-adult', 'call-112'];
  const plan: SafetyActionId[] = c.friendsNearby ? ['warn-friends'] : [];
  if (c.foodNearby && c.situation !== 'physics') plan.push('separate-food');
  if (c.situation === 'physics') return [...plan, 'read-instruction', ...(c.machineRunning ? ['stop-model' as const] : []), ...(c.protectionRequired ? ['protect' as const] : []), 'adjust-stopped', 'observe-shield'];
  if (c.situation === 'chemistry' && c.labelled) return [...plan, 'read-instruction', 'identify-samples', ...(c.protectionRequired ? ['protect' as const] : []), 'tell-adult'];
  return ['keep-clear', ...plan, ...(c.situation === 'unknown' && c.labelled ? ['read-instruction' as const] : []), 'tell-adult', ...(c.situation === 'exposure' ? ['contact-poison' as const] : [])];
}

export function safetyCaseOracle(task: SafetyHarborTask, c: SafetyCase, overridePath?: string[]): SafetyAnswer {
  if (c.mode === 'fire-conditions') {
    const remaining = (['fuel', 'heat', 'oxidizer'] as const).filter(k => k !== c.change.factor).map(k => c.present[k]);
    return { mode: c.mode, caseId: c.id, factors: { ...c.present }, prediction: c.change.available && remaining.every(Boolean) ? 'continues' : 'stops', locked: true, observed: true };
  }
  const path = c.mode === 'evacuation' || c.mode === 'electric-path' ? overridePath ?? safePaths(c)[0]! : [];
  const actions = policy(c).map((action, index) => ({ action, id: `root-${c.id}-${index}`, run: task.run,
    ...(c.mode === 'evacuation' ? { place: ['close-door', 'warn-friends'].includes(action) ? c.start : path.at(-1)! } : {}) }));
  if (c.mode === 'evacuation') return { mode: c.mode, caseId: c.id, route: path, travelled: [...path], actions };
  if (c.mode === 'electric-path') return { mode: c.mode, caseId: c.id, path, risk: c.nodes.find(n => n.id === c.via)!.label.includes('Ihminen') ? 'shock' : 'heating', insulationRole: 'blocks-contact', actions };
  if (c.mode === 'label') return { mode: c.mode, caseId: c.id, meanings: Object.fromEntries(c.pictograms.map(id => [id, id])), actions,
    ...(c.proposal ? { rejectedClaim: c.proposal.find(claim => claim.kind === 'meaning' ? claim.symbol !== claim.meaning : !policy(c).includes(claim.action))!.id } : {}) };
  return { mode: c.mode, caseId: c.id, actions };
}

export function safetyOracle(task: SafetyHarborTask): SafetyHarborResponse {
  return { kind: 'safety-harbor', answers: task.cases.map(c => safetyCaseOracle(task, c)), ...(task.review ? { review: {
    channel: 'spoken' as const, confirmedByAdult: true, assistance: 'none' as const,
    observations: Object.fromEntries(task.review.rubric.map(c => [c.id, 'met' as const])),
  } } : {}) };
}
