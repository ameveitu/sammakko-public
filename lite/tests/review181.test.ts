// Regression tests for the prior Lite 181 review findings (L181-01 … L181-15), re-checked against current source.
import { describe, expect, it } from 'vitest';
import { NODES } from '../src/content/index';
import { check, solution } from '../src/engine/check';
import { rng } from '../src/engine/rng';
import type { Option } from '../src/engine/types';

/** Value of a plain arithmetic expression such as "2 × 3 + 2 × 6", else NaN. */
const value = (o: Option) => {
  const s = (o.big ?? o.text ?? '').replace(/−/g, '-').replace(/×/g, '*').replace(/:/g, '/').replace(/\s/g, '');
  if (!/^\d[\d+\-*/]*\d$/.test(s)) return NaN;
  try { return Function(`return (${s})`)() as number; } catch { return NaN; }
};

describe('L181-01 M-PLACE-05 equal digits', () => {
  it('seed 1529 (7777) builds a lesson with exactly one correct purku', () => {
    const it = NODES['M-PLACE-05']!.item(rng(1529), 'independent');
    expect(it.say).toContain('7777');
    if (it.task.kind !== 'choice') throw new Error('expected choice');
    const sums = it.task.options.map((o) => (o.big ?? '').split(' + ').reduce((a, b) => a + Number(b), 0));
    expect(sums.filter((v) => v === 7777)).toHaveLength(1);
    expect(check(it.task, solution(it.task))).toBeTruthy();
  });
  it('no seed in 0…40000 throws, in any phase', () => {
    for (const ph of ['guided', 'independent', 'transfer', 'retrieval'] as const)
      for (let s = 0; s < 40000; s++) expect(() => NODES['M-PLACE-05']!.item(rng(s), ph)).not.toThrow();
  });
});

describe('L181-02 numerically equal alternatives', () => {
  for (const [id, tags] of [['M-TH-08', ['fracDiv', 'areaMul', 'mulAdd']], ['M-SYM-MINUS', [undefined]]] as const)
    it(`${id}: no wrong expression has the same value as the answer`, () => {
      for (let s = 0; s < 3000; s++) for (const ph of ['guided', 'independent', 'transfer', 'retrieval'] as const) {
        const it = NODES[id]!.item(rng(s), ph), t = it.task;
        if (t.kind !== 'choice' || (tags[0] !== undefined && !(tags as readonly (string | undefined)[]).includes(it.tag))) continue;
        const v = t.options.map(value), a = v[t.answer]!;
        if (!Number.isFinite(a)) continue;
        v.forEach((x, i) => { if (i !== t.answer) expect(x, `${ph}#${s} ${it.say}`).not.toBe(a); });
      }
    });
  it('M-TH-08 seeds 27 and 64 (the reported cases)', () => {
    for (const s of [27, 64]) {
      const t = NODES['M-TH-08']!.item(rng(s), 'independent').task;
      if (t.kind !== 'choice') continue;
      const v = t.options.map(value), a = v[t.answer]!;
      expect(v.filter((x) => x === a)).toHaveLength(1);
    }
  });
});

import { place, OVAL_BOX } from '../src/engine/motion';
describe('L181-04 oval arc length', () => {
  it('equal metres are equal drawn lengths on the oval', () => {
    const tr = { kind: 'oval', L: 400 } as any;
    const len = (a: number, b: number) => { let d = 0, p = place(tr, a); for (let s = a + 1; s <= b; s++) { const q = place(tr, s); d += Math.hypot((q.x - p.x) * OVAL_BOX.w, (q.y - p.y) * OVAL_BOX.h); p = q; } return d; };
    const seg = [0, 100, 200, 300].map((a) => len(a, a + 100));
    for (const x of seg) expect(Math.abs(x - seg[0]!) / seg[0]!).toBeLessThan(0.01);
  });
  it('angular lap position and cumulative distance stay separate', () => {
    const tr = { kind: 'oval', L: 400 } as any;
    const a = place(tr, 150), b = place(tr, 550);
    expect(a.x).toBeCloseTo(b.x, 6); expect(b.lap).toBe(1); expect(b.along).toBe(550);
  });
});

import { SIMS, MOTION_NODES } from '../src/content/motionsims';
import { MOTION_CFG } from '../src/ui/motion';
describe('L181-03/04/15 motion lessons start on the shared player', () => {
  it('every motion lesson demo opens with a runnable shared-player scene', () => {
    for (const id of MOTION_NODES) {
      const d = NODES[id]!.demo(rng(3));
      expect((d[0]!.scene as any)[MOTION_CFG], id).toBeTruthy();
    }
  });
  it('SPEED-MIXED shows the whole asked journey, not a 60 s cut', () => {
    for (let s = 0; s < 200; s++) {
      const c = (SIMS['PHY79-SPEED-MIXED']!(rng(s)).scene as any)[MOTION_CFG];
      expect(c.end).toBe(Number(c.scn.match(/(\d+) kierrosta/)![1]) * 400 / Number(c.scn.match(/(\d+) m\/s/)![1])); expect(c.watchCover).toBe(true);
      expect(c.views).toContain('watch');
    }
  });
  it('SPEED-REARR can be checked by running with a stopwatch', () => {
    for (let s = 0; s < 50; s++) expect((SIMS['PHY79-SPEED-REARR']!(rng(s)).scene as any)[MOTION_CFG].views).toContain('watch');
  });
});

import { trialFromLog } from '../src/ui/paja';
describe('L181-05 a test drive is logged only after it was observed', () => {
  it('a speed choice alone is not a trial', () => {
    expect(trialFromLog(['0.0:v=4'])).toBeNull();
    expect(trialFromLog(['0.0:v=4', '5.0:finish=5', '0.0:v=2'])).toBeNull();
  });
  it('a speed played to the finish is a trial with its measured time', () => {
    expect(trialFromLog(['0.0:v=4', '5.0:finish=5'])).toEqual({ v: 4, secs: 5 });
    expect(trialFromLog(['0.0:v=4', '0.0:v=5', '4.0:finish=4'])).toEqual({ v: 5, secs: 4 });
  });
});

import { nodeState, type Attempt } from '../src/engine/evidence';
import { AUDIT_REV, REVIEW_REV, REVIEW2_REV } from '../src/content/audit-rev';
describe('L181-06 production claims need a produced answer', () => {
  // Narrowed in review U02: only a built expression is production; the gate applies from REVIEW2_REV.
  const rule = { tags: ['build'], revs: [REVIEW2_REV] };
  const at = (phase: Attempt['phase'], tag: string, k: number, rev = REVIEW2_REV, ok = true): Attempt => ({ node: 'M79-EXPR-FORM', phase, tag, ok, at: k * 1000, rev });
  const choices = (rev: string) => [at('independent', 'price', 1, rev), at('independent', 'shape', 2, rev), at('independent', 'words', 3, rev), at('transfer', 'transfer', 4, rev)];
  it('four multiple choices no longer check a writing lesson', () => {
    expect(NODES['M79-EXPR-FORM']!.produce).toEqual(rule.tags);
    const st = nodeState(choices(REVIEW2_REV), rule);
    expect(st.checked).toBe(false); expect(st.produced).toBe(false);
  });
  it('one built expression completes the check', () => {
    const st = nodeState([...choices(REVIEW2_REV), at('independent', 'build', 5)], rule);
    expect(st.checked).toBe(true); expect(st.produced).toBe(true);
  });
  it('a quick check of two choices is not enough either', () => {
    expect(nodeState([at('quick', 'price', 1), at('quick', 'shape', 2)], rule).checked).toBe(false);
    expect(nodeState([at('quick', 'price', 1), at('quick', 'build', 2)], rule).checked).toBe(true);
  });
  it('a check earned under an earlier revision is kept, reported as recognition only', () => {
    for (const rev of [AUDIT_REV, REVIEW_REV]) {
      const st = nodeState(choices(rev), rule);
      expect(st.checked).toBe(true); expect(st.produced).toBe(false);
    }
    expect(NODES['M79-EXPR-FORM']!.validRevs).toContain(AUDIT_REV);
  });
  it('every production family exists in its lesson', () => {
    for (const [id, n] of Object.entries(NODES)) if (n.produce) {
      const seen = new Set<string>();
      for (let s = 0; s < 300; s++) { seen.add(n.item(rng(s), 'independent').tag); seen.add(n.item(rng(s), 'transfer').tag); }
      for (const t of n.produce) expect(seen.has(t), `${id}/${t}`).toBe(true);
    }
  });
});

import { independentRatio } from '../src/engine/evidence';
describe('L181-09 adult ratio counts fresh assessments only', () => {
  it('two successes + a process-incomplete answer + its familiar retry read 2/2, not 3/4', () => {
    const a = (k: number, x: Partial<Attempt>): Attempt => ({ node: 'M-NUM-1TO1', phase: 'independent', tag: 't', ok: true, at: k, ...x });
    const r = independentRatio([a(1, {}), a(2, {}), a(3, { ok: false, math: true, proc: false }), a(4, { replay: true })]);
    expect(r).toEqual({ ok: 2, n: 2, neutral: 2 });
    expect(nodeState([a(1, {}), a(2, {}), a(3, { ok: false, math: true, proc: false }), a(4, { replay: true })]).streak).toBe(2);
  });
});

import { store } from '../src/engine/store';
import { ensureGame, game } from '../src/game';
import { CHAPTERS, REV_177, ADDED_IN_181 } from '../src/content/world';
describe('L181-08 first migration keeps Lite 177 prizes', () => {
  const full = (node: string, rev: string, t0: number): Attempt[] => [
    { node, phase: 'independent', tag: 'a', ok: true, at: t0 + 1, rev }, { node, phase: 'independent', tag: 'b', ok: true, at: t0 + 2, rev },
    { node, phase: 'independent', tag: 'a', ok: true, at: t0 + 3, rev }, { node, phase: 'transfer', tag: 'transfer', ok: true, at: t0 + 4, rev }];
  const old177 = (id: string) => CHAPTERS.find((c) => c.id === id)!.nodes.filter((n) => !ADDED_IN_181[id]!.includes(n));
  it('a 177 save with every old chapter member done keeps mitat, veistamo and piirakka', () => {
    const attempts = ['mitat', 'veistamo', 'piirakka'].flatMap(old177).flatMap((n, i) => full(n, REV_177, i * 10));
    store.reset(); store.load({ world: 'ranta', rev: REV_177, attempts });
    ensureGame();
    for (const p of ['mitat', 'veistamo', 'piirakka']) expect(game().inv[`prize:${p}`], p).toMatchObject({ from: 'legacy' });
  });
  it('a new 181 save is not given a prize for the old subset', () => {
    const attempts = old177('mitat').flatMap((n, i) => full(n, 'lite181-2026-10-27', i * 10));
    store.reset(); store.load({ world: 'ranta', attempts });
    ensureGame();
    expect(game().inv['prize:mitat']).toBeUndefined();
  });
});

import { outcome, MISSIONS } from '../src/game';
describe('L181-10 assisted mission completion is not labelled direct', () => {
  const m = MISSIONS.find((x) => x.id === 'm-runko')!;
  const a = (k: number, x: Partial<Attempt>): Attempt => ({ node: m.direct, phase: 'quick', tag: 't', ok: true, at: k, mission: m.id, ...x });
  it('quick failures then a guided success with demo and hint is guided, not direct', () => {
    const at = [a(1, { ok: false }), a(2, { ok: false }), a(3, { phase: 'guided', help: ['demo', 'hint'] })];
    expect(outcome(m, at, () => true)).toBeNull();
    expect(outcome(m, [...at, a(4, { phase: 'guided', help: ['demo'] })], () => true)).toBe('guided');
  });
  it('an unaided correct answer on a checked direct lesson is direct', () => {
    expect(outcome(m, [a(1, {})], () => true)).toBe('direct');
  });
});

describe('L181-11 tester deferrals stay in the tester stream', () => {
  it('a real deferral does not reach tester mode, a tester deferral does', () => {
    store.reset(); store.load({ events: [{ type: 'defer', node: 'M-ADD-01', at: 1 } as any] });
    expect(store.deferred('M-ADD-01')).toBe(true);
    store.load({ tester: true, events: [{ type: 'defer', node: 'M-ADD-01', at: 1 } as any] });
    expect(store.deferred('M-ADD-01')).toBe(false);
    store.load({ tester: true, events: [{ type: 'defer', node: 'M-ADD-01', at: 1, syn: true } as any] });
    expect(store.deferred('M-ADD-01')).toBe(true);
  });
});

describe('L181-13 arrival times use valid clock times', () => {
  it('every option is a real clock time within the taught hours', () => {
    for (let s = 0; s < 500; s++) {
      const it = NODES['M-UNIT-05']!.item(rng(s), 'transfer');
      if (it.task.kind !== 'choice') continue;
      for (const o of it.task.options) {
        const [hh, mm] = (o.text ?? '').split('.').map(Number);
        expect(hh, o.text).toBeLessThanOrEqual(12); expect(mm, o.text).toBeLessThan(60);
      }
      expect(new Set(it.task.options.map((o) => o.text)).size).toBe(it.task.options.length);
    }
  });
});

describe('L181-14 compared shapes share one scale', () => {
  it('the M-TH-02 transfer box is one drawing with three different sizes', () => {
    for (let s = 0; s < 40; s++) {
      const it = NODES['M-TH-02']!.item(rng(s), 'transfer');
      const host = { innerHTML: '' };
      (it.scene as any)(host);
      expect(host.innerHTML.match(/<svg/g)).toHaveLength(1);
      expect([...host.innerHTML.matchAll(/data-size="(\d+)"/g)].map((m) => m[1]).sort()).toEqual(['32', '44', '56']);
    }
  });
});

import { featuresOf, suppliedBefore } from '../src/content/features';
import { audit } from '../src/content/audit';
describe('L181-07 family coverage reads real demands', () => {
  const item = (say: string, explain = '', task: any = { kind: 'numeric', answer: 2 }) => ({ say, explain, tag: 't', task }) as any;
  it('division written with a colon is a division demand; a prose colon is not', () => {
    expect(featuresOf(item('120 : 60 = □')).has('divide')).toBe(true);
    expect(featuresOf(item('Alussa 6, ja tuli lisää 5: 6 + 5.')).has('divide')).toBe(false);
  });
  it('a conversion fact only in the feedback is not supplied', () => {
    expect(suppliedBefore(item('Lauta on 2 m 1 cm. Kirjoita metreinä.', '1 cm = 0,01 m'))).toBe(false);
    expect(suppliedBefore(item('Lauta on 2 m 1 cm. Metrissä on 100 cm. Kirjoita metreinä.'))).toBe(true);
    expect(suppliedBefore({ ...item('Lauta on 2 m 1 cm.'), hint: 'Metrissä on 100 cm.' })).toBe(false);
  });
  it('the three reproduced cases are detected and explained', () => {
    const rows = audit(40, ['M-SYM-01', 'M-DEC-WRITE', 'M-UNIT-05']);
    const row = (k: string) => rows.find((r) => `${r.node}/${r.tag}` === k)!;
    expect(row('M-SYM-01/transfer').why.coordinate).toMatch(/M-COORD-PLOT-Q1/);
    expect(row('M-DEC-WRITE/transfer').why.convertLength).toMatch(/^annettu/);
    expect(row('M-UNIT-05/back').why.divide).toBeTruthy();
    expect(rows.every((r) => r.unexplained.length === 0)).toBe(true);
  });
});
