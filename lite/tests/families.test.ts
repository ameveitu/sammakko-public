// Activity-family registry: every detected demand is explained, every declaration is live,
// and help points to relevant lessons that exist in scope.
import { describe, expect, it } from 'vitest';
import { ORDER } from '../src/engine/graph';
import { audit } from '../src/content/audit';
import { DECL, family, inScope, namedKCs } from '../src/content/families';

const rows = audit(150);

describe('family registry', () => {
  it('covers every lesson with at least two families', () => {
    for (const id of ORDER) expect(rows.filter((r) => r.node === id).length, id).toBeGreaterThanOrEqual(2);
  });
  it('zero unexplained demands (features read from the items themselves)', () => {
    const bad = rows.filter((r) => r.unexplained.length).map((r) => `${r.node}/${r.tag}: ${r.unexplained.join(', ')}`);
    expect(bad).toEqual([]);
  });
  it('every named KC is in the 181 scope', () => {
    for (const k of namedKCs()) expect(inScope(k), k).toBe(true);
  });
  it('every declaration names a family the lesson really produces', () => {
    for (const key of Object.keys(DECL)) {
      const [node, tag] = key.split('/');
      expect(ORDER, key).toContain(node);
      if (tag && tag !== '*') expect(rows.some((r) => r.node === node && r.tag === tag), key).toBe(true);
    }
  });
  it('declared "not demanded" features are really present (no stale excuses)', () => {
    for (const r of rows) for (const f of Object.keys(r.reg.incidental)) {
      const fam = rows.filter((x) => x.node === r.node && (DECL[`${r.node}/${r.tag}`]?.incidental ? x.tag === r.tag : true));
      expect(fam.some((x) => x.features.includes(f as never)), `${r.node}/${r.tag} ${f}`).toBe(true);
    }
  });
  it('help from a family with outside demands points to a lesson in scope, never itself', () => {
    for (const r of rows) {
      if (r.reg.assumed.length) expect(r.reg.support.length, `${r.node}/${r.tag}`).toBeGreaterThan(0);
      for (const s of r.reg.support) { expect(inScope(s), s).toBe(true); expect(s).not.toBe(r.node); }
    }
  });
  it('the six dynamic rules are instantiated with named KCs in actual families', () => {
    const dyn = ['M-REP-04', 'M-TH-08', 'M-EXPR-01', 'M-UNIT-05', 'PHY79-UNIT-CONV', 'M79-EQ1-SOLVE'];
    for (const id of dyn) {
      const fams = rows.filter((r) => r.node === id);
      expect(fams.length).toBeGreaterThan(0);
      for (const r of fams) { expect(r.reg.rule, `${id}/${r.tag}`).toBeTruthy(); expect(r.reg.assumed.length, `${id}/${r.tag}`).toBeGreaterThan(0); }
    }
  });
  it('S1–S3: speed, unit and equation help is relevant, not a counting rhyme', () => {
    const helpOf = (id: string) => rows.filter((r) => r.node === id).flatMap((r) => r.reg.support);
    for (const id of ['PHY79-SPEED-MIXED', 'PHY79-UNIT-CONV', 'M79-EQ1-SOLVE']) {
      const h = helpOf(id);
      expect(h.length, id).toBeGreaterThan(0);
      expect(h).not.toContain('M-NUM-STABLE-ORDER');
      expect(h.every((x) => /DEC|UNIT|INT|SPEED/.test(x)), `${id}: ${h.join(', ')}`).toBe(true);
    }
  });
  it('a default family gets a plain outcome and its source says so', () => {
    const f = family('M-ADD-01', 'whatever', 'numeric');
    expect(f.outcome).toBe('kirjoittaa luvun');
    expect(f.source).toEqual(['oletus']);
  });
});
