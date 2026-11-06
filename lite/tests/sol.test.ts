// Sol design cards are annotations: they match the graph and never change lesson content.
import { describe, expect, it } from 'vitest';
import { SOL_CARDS, SOL_STATUS_TEXT, solCard } from '../src/content/sol';
import { NODES } from '../src/content';
import { KCS, kc } from '../src/engine/graph';

const inScope = SOL_CARDS.filter((c) => KCS.some((k) => k.id === c.id));
const norm = (gs: ({ all: string[] } | { any: string[] })[]) =>
  gs.map((g) => ('all' in g ? `all:${[...g.all].sort().join(',')}` : `any:${[...g.any].sort().join(',')}`)).sort();

describe('Sol design cards', () => {
  it('every card has a known status and a source reference', () => {
    expect(SOL_CARDS.length).toBe(52);
    for (const c of SOL_CARDS) {
      expect(SOL_STATUS_TEXT[c.status], c.id).toBeTruthy();
      expect(c.source.sha256, c.id).toMatch(/^[0-9a-f]{64}$/);
    }
  });
  it('cards are for lessons that exist here (cards outside the scope open nothing)', () => {
    const out = SOL_CARDS.filter((c) => !NODES[c.id]).map((c) => c.id);
    expect(out, `outside the 181 lessons: ${out.join(', ')}`).toEqual([]);
    expect(inScope.length).toBe(SOL_CARDS.length);
  });
  it('the required groups a card states as unchanged are the graph groups', () => {
    const differ = inScope.filter((c) => c.groups.length && JSON.stringify(norm(c.groups)) !== JSON.stringify(norm(kc(c.id).groups)));
    expect(differ.map((c) => `${c.id}: card ${norm(c.groups)} / graph ${norm(kc(c.id).groups)}`)).toEqual([]);
  });
  it('a card never overrides lesson content', () => {
    for (const c of inScope) {
      const n = NODES[c.id]!;
      expect(n.goal === c.goal && n.intro === c.example, c.id).toBe(false);
    }
    expect(solCard('M-NUM-01')?.id).toBe('M-NUM-01');
  });
});
