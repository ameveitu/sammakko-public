import { expect, test } from 'vitest';
import { CATALOG } from '../src/engine/catalog';
import { createJourney } from '../src/engine/journey';
import { authoredItemReadiness, evaluateItemReadiness, type ItemReadinessContext, type Operation } from '../src/engine/item-readiness';
import { CONTENT_REV } from '../src/content/index';
import { EXPEDITION_NODES } from '../src/content/expedition';
import { resolveItemReadinessContext } from '../src/content/item-readiness-context';
import { rng } from '../src/engine/rng';

const evaluate = (nodeId: string, context: ItemReadinessContext | undefined, known: readonly string[] = []) => evaluateItemReadiness({ nodeId, context, itemAvailable: true, staticGroups: [], knownChecked: id => known.includes(id) });
test('authoring annotations are nonserializing, node-specific copies', () => {
  const item = EXPEDITION_NODES['M-REP-04']!.item(rng(0), 'independent');
  const before = JSON.stringify(item);
  const context = authoredItemReadiness('M-REP-04', item.task);
  expect(context?.kind).toBe('content'); if (context?.kind !== 'content') throw Error('context');
  (context.skills as string[]).push('not-a-real-skill');
  expect(authoredItemReadiness('M-REP-04', item.task)).not.toEqual(context);
  expect(authoredItemReadiness('M79-EQ1-SOLVE', item.task)).toBeUndefined();
  expect(JSON.stringify(item)).toBe(before);
  expect(authoredItemReadiness('M-REP-04', JSON.parse(JSON.stringify(item.task)))).toBeUndefined();
});
test('all eighteen actual rule producers expose diagnostic context without inventing mastery', () => {
  const dynamic = CATALOG.filter(n => n.dynamic);
  expect(dynamic).toHaveLength(18);
  let count = 0;
  for (const node of dynamic) for (const phase of ['independent', 'transfer'] as const) for (let seed = 0; seed < 128; seed++) {
    const item = EXPEDITION_NODES[node.id]!.item(rng(seed), phase);
    const context = resolveItemReadinessContext(node.id, item);
    expect(context, `${node.id}/${phase}/${seed}`).toBeDefined();
    expect(evaluateItemReadiness({ nodeId: node.id, itemAvailable: true, staticGroups: node.groups, context, knownChecked: () => true }).dynamic.status).toBe('ready');
    count++;
  }
  expect(count).toBe(4608);
  expect(evaluate('unknown', undefined).dynamic.status).toBe('unresolved');
  expect(evaluate('M-FRAC-09', { kind: 'fraction-methods', methods: ['benchmark'] }, CATALOG.map(n => n.id)).dynamic.status).toBe('unresolved');
});

test('half is an explicitly supplied reference, while mixed physical quantities are AND', () => {
  let half = 0, mixed = 0, onlyLength = 0;
  for (let seed = 0; seed < 512; seed++) {
    const fraction = EXPEDITION_NODES['M-FRAC-09']!.item(rng(seed), 'independent');
    if (fraction.tag === 'compare-benchmark-half') {
      half++;
      const context = resolveItemReadinessContext('M-FRAC-09', fraction);
      expect(context).toEqual({ kind: 'fraction-methods', methods: ['supplied-half'] });
      expect(evaluate('M-FRAC-09', context, ['M-FRAC-03']).dynamic.status).toBe('ready');
      expect(evaluate('M-FRAC-09', context).dynamic.status).toBe('missing');
    }
    const item = EXPEDITION_NODES['PHY79-UNIT-CONV']!.item(rng(seed), 'independent');
    if (item.tag !== 'match' || item.task.kind !== 'place') continue;
    const expected = new Set(item.task.slots.map(slot => /\b(min|h|s)\b/.test(slot.text ?? '') ? 'time' : 'length'));
    const context = resolveItemReadinessContext('PHY79-UNIT-CONV', item);
    expect(context?.kind).toBe('conversions'); if (context?.kind !== 'conversions') throw Error('quantities');
    expect(new Set(context.quantities)).toEqual(expected);
    if (expected.has('time')) {
      mixed++; expect(evaluate('PHY79-UNIT-CONV', context, ['M-UNIT-02']).dynamic.status).toBe('missing');
      expect(evaluate('PHY79-UNIT-CONV', context, ['M-UNIT-02', 'M-UNIT-05']).dynamic.status).toBe('ready');
    } else { onlyLength++; expect(evaluate('PHY79-UNIT-CONV', context, ['M-UNIT-02']).dynamic.status).toBe('ready'); }
  }
  expect(half).toBeGreaterThan(0); expect(mixed).toBeGreaterThan(0); expect(onlyLength).toBeGreaterThan(0);
});

test('authored inverse operations agree with independent parsing of the displayed equations and offered moves', () => {
  const operations: Record<string, Operation> = { Vähennä: 'subtract', Jaa: 'divide', Lisää: 'add', Kerro: 'multiply' };
  const seen = new Set<string>();
  for (let seed = 0; seed < 512; seed++) {
    const item = EXPEDITION_NODES['M79-EQ1-SOLVE']!.item(rng(seed), 'independent');
    if (!['two', 'both', 'moves'].includes(item.tag)) continue;
    const context = resolveItemReadinessContext('M79-EQ1-SOLVE', item);
    expect(context?.kind).toBe('operation'); if (context?.kind !== 'operation') throw Error('operation');
    seen.add(item.tag);
    if (item.tag === 'two') {
      const parts = /^(\d+)x\s*([+−])\s*(\d+)\s*=\s*([−-]?\d+)/.exec(item.say)!;
      expect(parts).not.toBeNull();
      const coefficient = BigInt(parts[1]!), constant = BigInt(parts[3]!) * (parts[2] === '−' ? -1n : 1n), rhs = BigInt(parts[4]!.replace('−', '-'));
      const numerator = rhs - constant; expect(numerator % coefficient).toBe(0n);
      expect(context.operations).toEqual([constant < 0n ? 'add' : 'subtract', 'divide']);
      expect(context.domain).toBe(numerator < 0n || rhs < 0n ? 'integer' : 'natural');
    } else if (item.tag === 'both') {
      const parts = /^(\d+)x\s*\+\s*(\d+)\s*=\s*(\d*)x\s*\+\s*(\d+)/.exec(item.say)!;
      expect(parts).not.toBeNull();
      const difference = Number(parts[1]) - Number(parts[3] || 1);
      expect(context.operations).toEqual(['subtract', ...(difference > 1 ? ['divide'] : [])]); expect(context.domain).toBe('natural');
    } else if (item.task.kind === 'sort') {
      const expected = new Set(item.task.items.map(option => operations[option.text!.split(' ')[0]!]));
      expect(new Set(context.operations)).toEqual(expected); expect(context.domain).toBe('natural');
    }
  }
  expect(seen).toEqual(new Set(['two', 'both', 'moves']));
});

test('symbol production and clock rollover use their actual local operations, with no answer or prose inference', () => {
  const seen = new Set<string>();
  for (let seed = 0; seed < 256; seed++) {
    const item = EXPEDITION_NODES['M-REP-04']!.item(rng(seed), 'independent');
    if (!['words', 'build', 'compare'].includes(item.tag)) continue;
    seen.add(item.tag);
    const context = resolveItemReadinessContext('M-REP-04', item);
    if (item.tag === 'compare') expect(context).toEqual({ kind: 'content', skills: ['M-NUM-10'] });
    else {
      const plus = /enemmän|hyppää viereen/.test(item.say);
      expect(context).toEqual({ kind: 'content', skills: [plus ? 'M-ADD-01' : 'M-SUB-01', plus ? 'M-SYM-PLUS' : 'M-SYM-MINUS', 'M-SYM-EQUAL'] });
    }
    const task = item.task;
    Object.defineProperty(task, 'answer', { configurable: true, get() { throw Error('answer read'); } });
    expect(resolveItemReadinessContext('M-REP-04', { ...item, say: 'unrelated', hint: 'unrelated', explain: 'unrelated' })).toEqual(context);
  }
  expect(seen).toEqual(new Set(['words', 'build', 'compare']));
  const clock = EXPEDITION_NODES['M-UNIT-05']!.item(rng(9), 'transfer');
  const context = resolveItemReadinessContext('M-UNIT-05', clock);
  expect(context).toEqual({ kind: 'clock-transfer', rolloverMinutes: 60, operations: ['add', 'subtract'] });
  expect(evaluate('M-UNIT-05', context, ['M-TIME-02', 'M-ADD-01', 'M-SUB-01']).dynamic.status).toBe('ready');
  expect(evaluate('M-UNIT-05', context, ['M-TIME-02', 'M-MUL-01', 'M-DIV-01']).dynamic.status).toBe('missing');
  const lost = JSON.parse(JSON.stringify(clock));
  expect(resolveItemReadinessContext('M-UNIT-05', lost)).toBeUndefined();
});

test('all sixty-six integrations remain independent from parent evidence and experienced parent stories', () => {
  const integrations = CATALOG.filter(n => n.integrationOf.length);
  expect(integrations).toHaveLength(66);
  let checkedTargets = 0;
  for (const target of integrations) {
    const spec = EXPEDITION_NODES[target.id]; if (!spec) continue;
    const values = new Map<string, string>();
    const journey = createJourney({ getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); } });
    let at = 1;
    for (const parent of target.integrationOf) {
      const parentSpec = EXPEDITION_NODES[parent]; if (!parentSpec) continue;
      const tags = parentSpec.produce?.filter(tag => tag !== 'transfer') ?? [];
      const first = tags[0] ?? 'fixture-a', second = tags[1] ?? 'fixture-b';
      for (const [i, tag] of [first, second, first, 'transfer'].entries()) journey.record({ node: parent, phase: i === 3 ? 'transfer' : 'independent', ok: true, tag, seed: i, at: at++, rev: parentSpec.rev ?? CONTENT_REV });
      journey.resolve(parent, false);
    }
    expect(journey.state(target.id, spec).checked, target.id).toBe(false);
    expect(journey.get().attempts.filter(a => a.node === target.id)).toHaveLength(0);
    expect(journey.hasEvent(`story.${target.id}.resolved`)).toBe(false);
    checkedTargets++;
  }
  expect(checkedTargets).toBeGreaterThanOrEqual(64);
});
