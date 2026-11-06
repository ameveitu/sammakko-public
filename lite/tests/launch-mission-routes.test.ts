import { describe, expect, it } from 'vitest';
import type { Attempt } from '../src/engine/evidence';
import { fresh, grant, install, MISSIONS, outcome, ready } from '../src/game/state';

describe('launch: all three part routes retain their evidence boundaries', () => {
  for (const m of MISSIONS) {
    it(`${m.id}: guided, direct, helped and replay routes`, () => {
      const a = (node: string, extra: Partial<Attempt> = {}): Attempt => ({ node, mission: m.id, phase: 'independent', tag: 'fixture', at: 0, ok: true, ...extra });
      const guided = [a(m.guided, { phase: 'guided' }), a(m.guided, { phase: 'guided' })];
      expect(outcome(m, guided, () => false)).toBe('guided');
      expect(outcome(m, [a(m.direct, { phase: 'quick' })], id => id === m.direct)).toBe('direct');
      expect(outcome(m, [a(m.direct, { phase: 'quick' })], () => false)).toBeNull();
      expect(outcome(m, [a(m.direct, { help: ['hint'] }), a(m.direct, { help: ['demo'] })], () => true)).toBe('guided');
      expect(outcome(m, guided.map(x => ({ ...x, replay: true })), () => true)).toBeNull();
      expect(outcome(m, guided.map(x => ({ ...x, mission: undefined })), () => true)).toBeNull();
      for (const route of ['guided', 'direct'] as const) {
        const g = fresh();
        expect(grant(g, m.id, route, 0)).toBe(true);
        expect(grant(g, m.id, route, 1)).toBe(false);
        expect(install(g, m)).toBe(true);
        expect(g.inv[`part:${m.part}`]!.route).toBe(route);
        expect(ready(g)).toBe(false); // one part cannot launch the complete craft
      }
    });
  }
});
