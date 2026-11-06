import { describe, expect, it } from 'vitest';
import { NODES } from '../src/content';
import { AUDIT_REV, LAUNCH_REV } from '../src/content/audit-rev';
import { allOf } from '../src/engine/graph';
import { rng } from '../src/engine/rng';
import { check } from '../src/engine/check';
import type { Phase, Response } from '../src/engine/types';

describe('launch M-ALG-04: unknown meaning requires no equation-solving prerequisite', () => {
  it('retains its canonical entry point and historical evidence, with a new content revision', () => {
    expect(allOf('M-ALG-04')).toEqual([]);
    expect(NODES['M-ALG-04']!.rev).toBe(LAUNCH_REV);
    expect(NODES['M-ALG-04']!.validRevs).toContain(AUDIT_REV);
  });
  it('uses conceptual choice/matching actions in every phase, rather than requiring a hidden numerical solution', () => {
    const tags = new Set<string>();
    for (const phase of ['guided', 'independent', 'retrieval', 'transfer'] as Phase[]) for (let seed = 1; seed <= 80; seed++) {
      const q = NODES['M-ALG-04']!.item(rng(seed), phase); tags.add(q.tag);
      expect(['choice', 'multi', 'place']).toContain(q.task.kind);
      expect(q.say + ' ' + q.hint).not.toMatch(/molemmilta puolilta|ratkaise|vähennä|jaa \d|kerro \d/i);
      let response: Response;
      if (q.task.kind === 'choice') {
        const phrase = q.tag === 'same' ? 'Sama määrä' : q.tag === 'transfer' ? 'hinnan lukuarvo' : 'lukumäärä tai peitetty luku';
        const index = q.task.options.findIndex(o => o.text?.includes(phrase));
        expect(index).toBeGreaterThanOrEqual(0); response = { kind: 'choice', index };
        const zero = q.task.options.findIndex(o => o.text === 'Varmasti nolla');
        if (zero >= 0) expect(check(q.task, { kind: 'choice', index: zero }).ok).toBe(false);
      } else if (q.task.kind === 'multi') {
        response = { kind: 'multi', indices: q.task.options.flatMap((o, i) => o.text === 'Näkyvän kortin luku on annettu.' || o.text === 'Peitetyn kortin luku on vielä tuntematon.' ? [i] : []) };
        expect(check(q.task, { kind: 'multi', indices: [] }).ok).toBe(false);
      } else if (q.task.kind === 'place') {
        response = { kind: 'place', map: { hidden: 'unknown', shown: 'given' } };
        expect(check(q.task, { kind: 'place', map: { hidden: 'given', shown: 'unknown' } }).ok).toBe(false);
      } else throw Error('Arithmetic action substituted for concept meaning');
      expect(check(q.task, response).ok, `${phase}/${q.tag}/${seed}`).toBe(true);
    }
    expect([...tags].sort()).toEqual(['known', 'match', 'meaning', 'same', 'transfer']);
  });
});
