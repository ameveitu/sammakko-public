// Regression tests for the second Lite 181 review (U01–U08).
import { describe, expect, it } from 'vitest';
import { NODES, PRODUCE, REVIEW2_NODES, LAUNCH_REVISED_NODES } from '../src/content/index';
import { AUDIT_REV, REVIEW_REV, REVIEW2_REV, LAUNCH_REV } from '../src/content/audit-rev';
import { independentRatio, neutral, nodeState, type Attempt } from '../src/engine/evidence';
import { rng } from '../src/engine/rng';

const at = (o: Partial<Attempt> & { k: number }): Attempt =>
  ({ node: 'X', phase: 'independent', tag: 'a', ok: true, at: o.k * 1000, rev: REVIEW2_REV, ...o });

describe('U01 a revealed answer is not unaided evidence', () => {
  it('a correct answer after the stopwatch was shown is neutral; a wrong one still counts', () => {
    expect(neutral(at({ k: 1, help: ['reveal'] }))).toBe(true);
    expect(neutral(at({ k: 1, help: ['reveal'], ok: false }))).toBe(false);
    expect(neutral(at({ k: 1, help: ['hint'] }))).toBe(false);
  });
  it('three revealed answers and a transfer do not check the lesson', () => {
    const rev = [1, 2, 3].map((k) => at({ k, tag: k % 2 ? 'a' : 'b', help: ['reveal'] }));
    expect(nodeState([...rev, at({ k: 4, phase: 'transfer', tag: 'transfer' })]).checked).toBe(false);
    const own = [1, 2, 3].map((k) => at({ k, tag: k % 2 ? 'a' : 'b' }));
    expect(nodeState([...own, at({ k: 4, phase: 'transfer', tag: 'transfer' })]).checked).toBe(true);
  });
  it('a revealed answer neither extends nor breaks a streak', () => {
    const st = nodeState([at({ k: 1 }), at({ k: 2, help: ['reveal'] }), at({ k: 3, tag: 'b' })]);
    expect(st.streak).toBe(2);
  });
  it('the adult ratio counts revealed answers apart, also on a mission route', () => {
    const r = independentRatio([at({ k: 1 }), at({ k: 2, help: ['reveal'], mission: 'm1', mode: 'mission' }), at({ k: 3, ok: false })]);
    expect(r).toEqual({ ok: 1, n: 2, neutral: 1 });
  });
  it('the shared player demo asks first and answers on the next page', () => {
    let seen = 0;
    for (const n of Object.values(NODES)) {
      const d = n.demo(rng(3));
      if (!d[0]?.say.startsWith('Kokeillaan ensin yhdessä')) continue;
      seen++;
      expect(d[0].say, n.id).not.toContain('Katsotaan vastaus');
      expect(d[1]!.say.startsWith('Katsotaan vastaus:'), n.id).toBe(true);
    }
    expect(seen).toBeGreaterThan(5);
  });
});

describe('U02 production means building, recording, listing or writing', () => {
  it('only own-production families count', () => {
    expect(PRODUCE['M79-EXPR-FORM']).toEqual(['build']);
    expect(PRODUCE['M79-EQ1-FORM']).toEqual(['build']);
    expect(PRODUCE['M-TH-07']).toEqual(['list']);
    expect(PRODUCE['M-WRADD']).toEqual(['column', 'transfer']);
    for (const [id, tags] of Object.entries(PRODUCE)) for (const t of ['translate', 'parts', 'outfits', 'step']) expect(tags, id).not.toContain(t);
  });
  it('matching ready-made expressions does not produce; building does', () => {
    const rule = { tags: PRODUCE['M79-EXPR-FORM']!, revs: [REVIEW2_REV] };
    const base = [at({ k: 1, tag: 'translate' }), at({ k: 2, tag: 'parts' }), at({ k: 3, tag: 'translate' }), at({ k: 4, phase: 'transfer', tag: 'transfer' })];
    const st = nodeState(base, rule);
    expect(st.checked).toBe(false); expect(st.produced).toBe(false);
    const st2 = nodeState([...base, at({ k: 5, tag: 'build' })], rule);
    expect(st2.checked).toBe(true); expect(st2.produced).toBe(true);
  });
  it('a guided build is practice, not production', () => {
    const rule = { tags: ['build'], revs: [REVIEW2_REV] };
    expect(nodeState([at({ k: 1, phase: 'guided', tag: 'build' })], rule).produced).toBe(false);
  });
});

describe('U03 a legacy recognition check can be upgraded', () => {
  it('a later build turns produced on without losing the check', () => {
    const rule = { tags: ['build'], revs: [REVIEW2_REV] };
    for (const rev of [AUDIT_REV, REVIEW_REV]) {
      const old = [at({ k: 1, rev, tag: 'translate' }), at({ k: 2, rev, tag: 'parts' }), at({ k: 3, rev, tag: 'translate' }), at({ k: 4, rev, phase: 'transfer', tag: 'transfer' })];
      const before = nodeState(old, rule);
      expect(before.checked).toBe(true); expect(before.produced).toBe(false);
      const after = nodeState([...old, at({ k: 5, tag: 'build', mode: 'practice', phase: 'practice' })], rule);
      expect(after.checked).toBe(true); expect(after.produced).toBe(true);
      expect(after.checkedAt).toBe(before.checkedAt);
    }
  });
});

describe('U08 revised lessons record the new revision and keep old evidence valid', () => {
  it('rev and validRevs', () => {
    for (const id of REVIEW2_NODES) {
      const n = NODES[id]!;
      expect(n.rev, id).toBe(LAUNCH_REVISED_NODES.includes(id) ? LAUNCH_REV : REVIEW2_REV);
      expect(n.validRevs, id).toContain(REVIEW2_REV);
      if (n.validRevs) expect(n.validRevs.length, id).toBeGreaterThan(1);
    }
  });
});

/** Independent evaluator for M-TH-08 card texts: "3 × 4", "2 + 2 + 2", "12 : 2". */
const evalCard = (t: string) => {
  const e = t.replace(/×/g, '*').replace(/:/g, '/').replace(/\s/g, '');
  if (!/^[\d+*/]+$/.test(e)) throw new Error(`unexpected card ${t}`);
  return e.split('+').reduce((s, term) => s + term.split('*').reduce((p, f) => p * f.split('/').map(Number).reduce((a, b) => a / b), 1), 0);
};
const evalSlot = (t: string) => {
  let m = t.match(/^(\d+) × (\d+)$/); if (m) return +m[1]! * +m[2]!;
  m = t.match(/^1\/(\d+) luvusta (\d+)$/); if (m) return +m[2]! / +m[1]!;
  m = t.match(/^neliön piiri, sivu (\d+)$/); if (m) return 4 * +m[1]!;
  throw new Error(`unexpected slot ${t}`);
};

describe('U06 M-TH-08 pairs: exactly one card fits each slot', () => {
  it('over 4000 seeds and every phase', () => {
    let n = 0;
    for (let s = 0; s < 4000; s++) for (const ph of ['guided', 'independent', 'transfer'] as const) {
      const q = NODES['M-TH-08']!.item(rng(s), ph);
      if (q.task.kind !== 'place' || q.tag !== 'pairs') continue;
      n++;
      const t = q.task;
      const vals = t.tokens.map((k) => evalCard(k.text!));
      for (const sl of t.slots) {
        const v = evalSlot(sl.text!);
        const fits = t.tokens.filter((_, i) => Math.abs(vals[i]! - v) < 1e-9).map((k) => k.id);
        expect(fits, `#${s} ${sl.text}: ${t.tokens.map((k) => k.text).join(' | ')}`).toEqual([t.answer[sl.id]]);
      }
    }
    expect(n).toBeGreaterThan(100);
  });
});

describe('M-PLACE-05 split cards are distinct', () => {
  it('no duplicate card text in any phase', () => {
    for (let s = 0; s < 4000; s++) for (const ph of ['guided', 'independent', 'transfer'] as const) {
      const t = NODES['M-PLACE-05']!.item(rng(s), ph).task;
      if (t.kind !== 'place') continue;
      const txt = t.tokens.map((k) => k.text ?? k.art);
      expect(new Set(txt).size, `#${s} ${txt.join(',')}`).toBe(txt.length);
    }
  });
});
