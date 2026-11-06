import { describe, expect, it } from 'vitest';
import { rng } from '../src/engine/rng';
import { itemIdentity } from '../src/engine/item-identity';
import { safetyHarborSpecs, safetyHarborEvidence } from '../src/content/safety-harbor';
import { checkSafetyHarbor, solutionSafetyHarbor, type SafetyHarborTask, type SafetyHarborResponse, type SafetyCase,
  type SafetyAnswer, type SafetyAction, type SafetyActionId } from '../src/content/models/safety-harbor';
const kind = 'safety-harbor' as const;
function independentSteps(item: SafetyCase): SafetyActionId[] {
  if (item.mode === 'fire-conditions') return [];
  if (item.mode === 'evacuation') return [...(item.friendsNearby ? ['warn-friends' as const] : []), ...(item.closeDoor ? ['close-door' as const] : []), 'call-112', 'wait-permission'];
  if (item.mode === 'electric-path') return ['keep-clear', 'tell-adult'];
  if (item.mode === 'label') {
    const actions: SafetyActionId[] = ['read-instruction'];
    if (item.instruction.includes('riittävän ilmanvaihdon')) actions.push('ventilate-plan');
    if (item.instruction.includes('erossa lämmöstä')) actions.push('keep-heat-away');
    if (item.instruction.includes('pääsy vesistöön')) actions.push('protect-water');
    if (item.instruction.includes('erillään elintarvikkeista')) actions.push('separate-food');
    actions.push('secure-storage'); return actions;
  }
  if (item.situation === 'exposure' && item.facts.some(f => f.includes('tajuton tai hengittäminen'))) return ['keep-clear', 'tell-adult', 'call-112'];
  const actions: SafetyActionId[] = [];
  if (item.facts.some(f => f.includes('Varoita heitä'))) actions.push('warn-friends');
  if (item.facts.some(f => f.includes('ruokailu suunnitellaan erilleen'))) actions.push('separate-food');
  if (item.situation === 'physics') {
    actions.push('read-instruction'); if (item.facts.some(f => f.includes('Malli on käynnissä'))) actions.push('stop-model');
    if (item.facts.some(f => f.includes('suojalasit'))) actions.push('protect');
    actions.push('adjust-stopped', 'observe-shield'); return actions;
  }
  if (item.situation === 'chemistry' && item.facts.some(f => f.includes('Kaikilla virtuaalinäytteillä'))) {
    actions.push('read-instruction', 'identify-samples'); if (item.facts.some(f => f.includes('suojalasit'))) actions.push('protect');
    actions.push('tell-adult'); return actions;
  }
  actions.push('keep-clear'); if (item.situation === 'unknown' && item.facts[0]!.includes('ohje on luettavissa')) actions.push('read-instruction');
  actions.push('tell-adult');
  if (item.situation === 'exposure') actions.push(item.facts.some(f => f.includes('tajuton tai hengittäminen')) ? 'call-112' : 'contact-poison');
  return actions;
}
function paths(item: Extract<SafetyCase, { mode: 'evacuation' | 'electric-path' }>): string[][] {
  const start = item.mode === 'evacuation' ? item.start : item.source, answers: string[][] = [];
  function visit(path: string[]) {
    const last = path.at(-1)!, node = item.nodes.find(n => n.id === last)!;
    if (item.mode === 'evacuation' ? 'safe' in node && node.safe : last === item.returnNode && path.includes(item.via)) { answers.push(path); return; }
    for (const next of [...item.nodes].reverse()) {
      if (path.includes(next.id) || 'state' in next && next.state !== 'clear') continue;
      if (item.edges.some(([a, b]) => (a === last && b === next.id) || (b === last && a === next.id))) visit([...path, next.id]);
    }
  }
  visit([start]); return answers;
}
function independentCase(task: SafetyHarborTask, item: SafetyCase, path?: string[]): SafetyAnswer {
  const route = item.mode === 'evacuation' || item.mode === 'electric-path' ? path ?? paths(item)[0]! : [];
  const actions: SafetyAction[] = independentSteps(item).map((action, i) => ({ run: task.run, id: `${item.id}-oracle-${i}`, action,
    ...(item.mode === 'evacuation' ? { place: action === 'close-door' || action === 'warn-friends' ? item.start : route.at(-1) } : {}) }));
  if (item.mode === 'fire-conditions') {
    const supplied = Object.entries(item.present).filter(([key, value]) => key !== item.change.factor && value).length + Number(item.change.available);
    return { mode: item.mode, caseId: item.id, factors: { ...item.present }, prediction: supplied === 3 ? 'continues' : 'stops', locked: true, observed: true };
  }
  if (item.mode === 'label') return { mode: item.mode, caseId: item.id, meanings: Object.fromEntries(item.pictograms.map(id => [id, id])), ...(item.proposal ? { rejectedClaim: item.proposal.find(c => c.kind === 'meaning' ? c.meaning !== c.symbol : c.action === 'mix')!.id } : {}), actions };
  if (item.mode === 'electric-path') return { mode: item.mode, caseId: item.id, path: route, risk: item.facts[0]!.includes('sähköiskun') ? 'shock' : 'heating', insulationRole: 'blocks-contact', actions };
  if (item.mode === 'evacuation') return { mode: item.mode, caseId: item.id, route, travelled: [...route], actions };
  return { mode: item.mode, caseId: item.id, actions };
}
function independentAnswer(task: SafetyHarborTask): SafetyHarborResponse {
  return { kind, answers: task.cases.map(item => independentCase(task, item)), ...(task.review ? { review: { channel: 'spoken' as const,
    observations: Object.fromEntries(task.review.rubric.map(c => [c.id, 'met' as const])), confirmedByAdult: true, assistance: 'none' as const } } : {}) };
}
function taskFor(id: string, seed = 1, phase: 'independent' | 'transfer' = 'independent') {
  return safetyHarborSpecs.find(s => s.id === id)!.item(rng(seed), phase).task as unknown as SafetyHarborTask;
}
describe('SafetyHarbor13', () => {
  it('preserves exactly13 new IDs, two genuine families, eight real condition variants and content-stable identity', () => {
    const ids = ['ENV-CHEM-CHEMICAL-SAFE-01', 'ENV-CHEM-POISON-SAFE-01', 'ENV-CHEM-FIRE-SAFE-01', 'ENV-CHEM-HOMECHEM-SAFE-01', 'ENV-PHY-ELECSAFE-01', 'PHY79-ELEC-SAFE', 'PHY79-SAFE-01', 'CHEM79-SAFE-01', 'CHEM79-CHEMICAL-USE-SAFE', 'CHEM79-HAZARD-LABEL', 'CHEM79-CHEMICAL-SAFE', 'CHEM79-FIRE-CONDITIONS', 'CHEM79-FIRE-ACTION'];
    expect(safetyHarborSpecs.map(s => s.id).sort()).toEqual(ids.sort());
    for (const spec of safetyHarborSpecs) {
      const physical = new Set<string>(), families = new Set<string>();
      for (let seed = 0; seed < 160; seed++) {
        const item = spec.item(rng(seed), 'independent'), task = item.task as unknown as SafetyHarborTask;
        families.add(item.tag); physical.add(JSON.stringify(task.cases));
        expect(itemIdentity(item)).toBe(itemIdentity(spec.item(rng(seed), 'independent')));
      }
      expect(physical.size, spec.id).toBeGreaterThanOrEqual(8); expect(families.size, spec.id).toBe(2);
      expect(spec.item(rng(1), 'transfer').tag).toBe('transfer'); expect(safetyHarborEvidence[spec.id]!.limit).toContain('Fyysinen');
    }
  });
  it('independent instruction/graph/Boolean oracle accepts1664 authored procedures and rejects missing work', () => {
    let count = 0;
    for (const spec of safetyHarborSpecs) for (const phase of ['independent', 'transfer'] as const) for (let seed = 0; seed < 64; seed++) {
      const task = spec.item(rng(seed), phase).task as unknown as SafetyHarborTask, answer = independentAnswer(task);
      expect(checkSafetyHarbor(task, answer), `${spec.id}/${phase}/${seed}`).toMatchObject({ ok: true }); count++;
      expect(checkSafetyHarbor(task, { ...answer, answers: [] }).ok).toBe(false);
      const wrong = { ...answer, answers: answer.answers.map((a, i) => i ? a : a.mode === 'fire-conditions' ? { ...a, observed: false } : { ...a, actions: [] }) };
      expect(checkSafetyHarbor(task, wrong).ok).toBe(false);
    }
    expect(count).toBe(1664);
  });
  it('accepts every safe alternate escape path, rejects smoke, and distinguishes shelter from forced evacuation', () => {
    let alternatives = 0, shelter = 0;
    for (let seed = 0; seed < 96; seed++) {
      const task = taskFor('ENV-CHEM-FIRE-SAFE-01', seed), item = task.cases[0]!;
      if (item.mode !== 'evacuation') throw Error('Map');
      const answer = independentAnswer(task);
      for (const route of paths(item)) { alternatives++; expect(checkSafetyHarbor(task, { ...answer, answers: [independentCase(task, item, route)] }).ok).toBe(true); }
      if (item.shelterInPlace) { shelter++; expect(paths(item)).toEqual([[item.start]]); }
      const smoky = item.nodes.find(n => n.state === 'smoke')!, bad = [item.start, smoky.id, 'meeting'];
      const response = independentCase(task, item, bad);
      expect(checkSafetyHarbor(task, { ...answer, answers: [response] }).ok).toBe(false);
      const correct = independentCase(task, item);
      if (correct.mode !== 'evacuation') throw Error('Map answer');
      const atHazard = correct.actions.map(a => a.action === 'call-112' ? { ...a, place: smoky.id } : a);
      expect(checkSafetyHarbor(task, { ...answer, answers: [{ ...correct, actions: atHazard }] }).ok).toBe(false);
    }
    expect(alternatives).toBeGreaterThan(96); expect(shelter).toBeGreaterThan(0);
  });
  it('condition removal and addition always change their named supplied factor, with a new transfer material context', () => {
    const examples = new Set<string>(); let cases = 0;
    for (const phase of ['independent', 'transfer'] as const) for (let seed = 0; seed < 128; seed++) {
      const task = taskFor('CHEM79-FIRE-CONDITIONS', seed, phase), item = task.cases[0]!;
      if (item.mode !== 'fire-conditions') throw Error('Conditions');
      expect(item.present[item.change.factor]).toBe(!item.change.available); examples.add(item.example!);
      if (phase === 'transfer') expect(item.example).toBe('gas-card-model'); cases++;
    }
    expect(cases).toBe(256); expect(examples.size).toBe(3);
  });
  it('unsafe actions, cross-run events and adjusting before stopping never become safe procedure evidence', () => {
    for (let seed = 0; seed < 32; seed++) {
      const task = taskFor('PHY79-SAFE-01', seed), answer = independentAnswer(task), first = answer.answers[0]!;
      if (first.mode !== 'procedure') throw Error('Procedure');
      const invalid = first.actions.map(a => a.action === 'stop-model' ? { ...a, action: 'touch' as const } : a);
      if (first.actions.some(a => a.action === 'stop-model')) expect(checkSafetyHarbor(task, { ...answer, answers: [{ ...first, actions: invalid }] }).ok).toBe(false);
      expect(checkSafetyHarbor(task, { ...answer, answers: [{ ...first, actions: first.actions.map(a => ({ ...a, run: 'other-experiment' })) }] }).ok).toBe(false);
    }
  });
  it('genuine adult observation is required for own explanations, reveal is neutral, and wrong work retains assistance', () => {
    for (const spec of safetyHarborSpecs) {
      const task = taskFor(spec.id); if (!task.review) continue;
      expect(checkSafetyHarbor(task, solutionSafetyHarbor(task))).toMatchObject({ ok: false, pendingReview: true });
      const correct = independentAnswer(task);
      expect(checkSafetyHarbor(task, { ...correct, review: { ...correct.review!, channel: 'written' } })).toMatchObject({ ok: true, observedByAdult: true });
      expect(checkSafetyHarbor(task, { ...correct, review: undefined })).toMatchObject({ pendingReview: true });
      expect(checkSafetyHarbor(task, { ...correct, review: { ...correct.review!, assistance: 'helped' } })).toMatchObject({ ok: true, observedByAdult: true, assisted: true });
      expect(checkSafetyHarbor(task, { ...correct, answers: [], review: { ...correct.review!, assistance: 'helped' } })).toMatchObject({ ok: false, observedByAdult: true, assisted: true });
      const notYet = { ...correct.review!, observations: { ...correct.review!.observations, [task.review.rubric[0]!.id]: 'not-yet' as const } };
      expect(checkSafetyHarbor(task, { ...correct, review: notYet })).toMatchObject({ ok: false, observedByAdult: true });
    }
  });
  it('hostile/inherited/partial events and raw prose do not become accepted safety evidence', () => {
    const task = taskFor('ENV-CHEM-CHEMICAL-SAFE-01'), answer = independentAnswer(task), item = answer.answers[0]!;
    for (const invalid of [Object.create(answer), { ...answer, answers: Array(1) }, { ...answer, answers: [Object.create(item)] },
      { ...answer, note: 'Raw learner prose' }, { ...answer, answers: [{ ...item, text: 'Raw learner prose' }] }]) {
      expect(checkSafetyHarbor(task, invalid as SafetyHarborResponse).ok).toBe(false);
    }
    let calls = 0;
    const getter = Object.defineProperty({ ...answer }, 'answers', { enumerable: true, get() { calls++; return answer.answers; } });
    expect(checkSafetyHarbor(task, getter).ok).toBe(false); expect(calls).toBe(0);
    const reviewed = taskFor('PHY79-ELEC-SAFE'), correct = independentAnswer(reviewed);
    expect(checkSafetyHarbor(reviewed, { ...correct, review: Object.create(correct.review!) })).toMatchObject({ pendingReview: true });
    const missing = { ...correct.review } as Record<string, unknown>; delete missing.assistance;
    expect(checkSafetyHarbor(reviewed, { ...correct, review: missing } as unknown as SafetyHarborResponse)).toMatchObject({ pendingReview: true });
  });

});
