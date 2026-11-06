import { describe, expect, it } from 'vitest';
import { nodeState, RULES, type Attempt } from '../src/engine/evidence';
import scopeJson from '../reference/mvp-scope-181.json';
import { ADDITIONS, allOf, allOfDescendants, ancestors, COVERAGE, isUnlocked, kc, KCS, ORDER, requiredOf, safetyOf } from '../src/engine/graph';

const H = 60 * 60 * 1000;
let t = 0;
const a = (phase: Attempt['phase'], ok: boolean, tag = 'x', at = (t += 1000)): Attempt => ({ node: 'N', phase, ok, tag, at });
const checkedRun = () => [a('independent', true, 'a'), a('independent', true, 'b'), a('independent', true, 'a'), a('transfer', true, 'transfer')];

describe('evidence rules', () => {
  it('three correct of one case is not enough', () => {
    expect(nodeState([a('independent', true, 'a'), a('independent', true, 'a'), a('independent', true, 'a'), a('transfer', true)]).checked).toBe(false);
  });
  it('needs a transfer after the streak', () => {
    const base = checkedRun().slice(0, 3);
    expect(nodeState(base).checked).toBe(false);
    expect(nodeState([...base, a('transfer', true)]).checked).toBe(true);
  });
  it('a transfer before the streak does not count', () => {
    expect(nodeState([a('transfer', true), a('independent', true, 'a'), a('independent', true, 'b'), a('independent', true, 'a')]).checked).toBe(false);
  });
  it('guided answers never check, but two correct ones mean "practised with help"', () => {
    const s = nodeState([a('guided', true, 'a'), a('guided', true, 'b'), a('guided', true, 'c'), a('transfer', true)]);
    expect(s.checked).toBe(false);
    expect(s.helped).toBe(true);
    expect(nodeState([a('guided', true, 'a')]).helped).toBe(false);
  });
  it('a wrong answer resets the streak', () => {
    const s = nodeState([a('independent', true, 'a'), a('independent', true, 'b'), a('independent', false), a('independent', true, 'a')]);
    expect(s.streak).toBe(1);
  });
  it('retention needs a delayed recall', () => {
    const run = checkedRun();
    const at = run.at(-1)!.at;
    expect(nodeState([...run, a('retrieval', true, 'x', at + H)]).retained).toBeUndefined();
    expect(nodeState([...run, a('retrieval', true, 'x', at + RULES.delayMs)]).retained).toBe(at + RULES.delayMs);
  });
  it('a failed recall followed by an immediate retry is not retention', () => {
    const run = checkedRun();
    const at = run.at(-1)!.at + RULES.delayMs;
    const s = nodeState([...run, a('retrieval', false, 'x', at), a('retrieval', true, 'x', at + 1000), a('retrieval', true, 'x', at + 2000)]);
    expect(s.retained).toBeUndefined();
    expect(s.recallFailed).toBe(true);
    expect(s.difficulty).toBe(true);
    expect(s.checked).toBe(true); // a lapse does not erase earlier evidence
  });
  it('a failed recall stays visible until steady success, and a later delayed recall can restore retention', () => {
    const run = checkedRun();
    const at = run.at(-1)!.at + RULES.delayMs;
    const failed = [...run, a('retrieval', false, 'x', at)];
    const steady = [...failed, a('practice', true, 'a', at + 1), a('practice', true, 'b', at + 2), a('practice', true, 'a', at + 3)];
    expect(nodeState(steady).difficulty).toBe(false);
    expect(nodeState(steady).recallFailed).toBe(true);
    const later = [...steady, a('retrieval', true, 'x', at + 3 + RULES.delayMs)];
    expect(nodeState(later).retained).toBeDefined();
    expect(nodeState(later).recallFailed).toBe(false);
  });
  it('later errors after a node is checked stay visible', () => {
    const s = nodeState([...checkedRun(), a('practice', false), a('practice', true), a('practice', false)]);
    expect(s.checked).toBe(true);
    expect(s.difficulty).toBe(true);
  });
  it('a later failed delayed recall removes earlier retention', () => {
    const run = checkedRun();
    const at = run.at(-1)!.at + RULES.delayMs;
    const s = nodeState([...run, a('retrieval', true, 'x', at), a('retrieval', false, 'x', at + RULES.delayMs)]);
    expect(s.retained).toBeUndefined();
    expect(s.recallFailed).toBe(true);
  });
  it('quick check: two correct in a row', () => {
    expect(nodeState([a('quick', true), a('quick', false), a('quick', true)]).checked).toBe(false);
    expect(nodeState([a('quick', true), a('quick', true)]).quick).toBe(true);
  });
  it('unknown is not weak: no attempts means no difficulty', () => {
    const s = nodeState([]);
    expect(s.checked || s.helped || s.difficulty || s.recallFailed).toBe(false);
  });
});

describe('181-node manifest (177 baseline + reviewed addendum)', () => {
  const scope = scopeJson as unknown as {
    selected_ids: string[]; original_107_ids: string[]; added_ids: string[];
    nodes: { id: string; relations: { id: string; strength: string }[] }[];
  };
  const sel = new Set(scope.selected_ids);

  it('has exactly the 181 selected ids, including all 107 earlier ids', () => {
    expect(ORDER.length).toBe(181);
    expect([...ORDER].sort()).toEqual([...scope.selected_ids].sort());
    for (const id of scope.original_107_ids) expect(ORDER).toContain(id);
    expect(KCS.filter((k) => k.original).length).toBe(107);
  });
  it('is closed under required and strong relations (safety included)', () => {
    for (const n of scope.nodes) for (const r of n.relations)
      if (r.strength === 'required' || r.strength === 'strong') expect(sel.has(r.id), `${n.id} needs ${r.id}`).toBe(true);
  });
  it('records a reason and witness for every addition', () => {
    expect(ADDITIONS.map((x) => x.id).sort()).toEqual([...scope.added_ids].sort());
    for (const x of ADDITIONS) { expect(x.reason.length).toBeGreaterThan(10); expect(x.witness.at(-1)).toBe(x.id); }
  });
  it('keeps activity coverage apart from canonical edges', () => {
    expect(COVERAGE.length).toBe(16);
    for (const c of COVERAGE) { expect(ORDER).toContain(c.target); expect(ORDER).toContain(c.uses); expect(c.example).toBeTruthy(); }
  });
  it('is in topological order with no reverse edges or cycles', () => {
    ORDER.forEach((id, i) => kc(id).rel.forEach((r) => expect(ORDER.indexOf(r.id), `${r.id} -> ${id}`).toBeLessThan(i)));
    for (const id of ORDER) expect(ancestors(id)).not.toContain(id);
  });
  it('roots are unlocked, others are not', () => {
    ORDER.forEach((id) => expect(isUnlocked(id, () => false)).toBe(requiredOf(id).length === 0));
    ORDER.forEach((id) => expect(isUnlocked(id, () => true)).toBe(true));
  });
  it('any_of groups need one member only and are never inferred', () => {
    const anyNodes = KCS.filter((k) => k.groups.some((g) => 'any' in g));
    expect(anyNodes.length).toBeGreaterThan(0);
    for (const k of anyNodes) {
      const g = k.groups.find((x) => 'any' in x) as { any: string[] };
      for (const m of g.any.filter((m) => !allOf(k.id).includes(m))) expect(allOfDescendants(m)).not.toContain(k.id);
      const one = g.any[0]!;
      const others = requiredOf(k.id).filter((p) => !g.any.includes(p));
      expect(isUnlocked(k.id, (x) => x === one || others.includes(x))).toBe(true);
    }
  });
  it('the safety lesson is never a lock and never inferred', () => {
    const gated = KCS.filter((k) => safetyOf(k.id).length);
    expect(gated.length).toBeGreaterThan(0);
    for (const k of gated) for (const s of safetyOf(k.id)) {
      expect(requiredOf(k.id)).not.toContain(s);
      expect(allOfDescendants(s)).not.toContain(k.id);
    }
  });
  it('lab nodes reach back to grade 1–2 foundations', () => {
    expect(ancestors('PHY79-SPEED-CALC')).toContain('M-MEAS-01');
  });
});
