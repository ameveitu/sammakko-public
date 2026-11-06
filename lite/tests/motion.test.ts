// Shared motion/time player: one scenario time, exact positions, honest clock.
import { describe, expect, it } from 'vitest';
import { Clock, frameAt, place, Run, type Track } from '../src/engine/motion';

const straight: Track = { kind: 'straight', L: 40 };
const oval: Track = { kind: 'oval', L: 100 };

describe('one scenario time drives every view', () => {
  it('object, ruler distance, stopwatch, lamps, table and graph cursor agree at the same time', () => {
    const run = new Run([{ dur: Infinity, v: 4 }], 40);
    const f = frameAt(run, straight, 3.5, { lampsAt: [10, 20], dt: 1 });
    expect(f.s).toBeCloseTo(14);
    expect(f.x).toBeCloseTo(14 / 40); // object position on the ruler
    expect(f.watch).toBe('3,5');
    expect(f.lamps).toEqual([true, false]);
    expect(f.rows).toEqual([[0, 0], [1, 4], [2, 8], [3, 12]]); // rows reached so far
    expect(f.snaps).toEqual([0, 4, 8, 12]); // strobe snapshots come from the same run
    expect(f.rows[f.rows.length - 1]![1]).toBe(run.s(3)); // table = graph value at the same t
  });
  it('the finish line stops the vehicle on a straight course', () => {
    const run = new Run([{ dur: Infinity, v: 4 }], 40);
    expect(run.s(12)).toBe(40);
    expect(run.v(12)).toBe(0);
    expect(run.v(9)).toBe(4);
  });
});

describe('pause vs stop', () => {
  it('pause freezes time; stopping the vehicle sets speed 0 while time continues', () => {
    const c = new Clock(20), run = new Run([{ dur: Infinity, v: 2 }]);
    c.play(0); c.tick(2000); c.pause(); c.tick(5000);
    expect(c.t).toBeCloseTo(2); // paused: no time passed
    expect(run.s(c.t)).toBeCloseTo(4);
    c.play(5000); c.tick(6000);
    run.stop(c.t);
    c.tick(9000);
    expect(c.t).toBeCloseTo(6); // time continues
    expect(run.v(c.t)).toBe(0);
    expect(run.s(c.t)).toBeCloseTo(6); // the object stays where it stopped
    expect(run.events).toEqual([{ t: 3, v: 0 }]);
  });
});

describe('replay and frame rate', () => {
  it('replay shows the same motion from the start', () => {
    const run = new Run([{ dur: 2, v: 1 }, { dur: 3, a: 2 }, { dur: Infinity, a: -3 }]);
    const first = [0.5, 2.5, 4.9, 7].map((t) => run.s(t));
    const c = new Clock(10); c.play(0); c.tick(7000); c.replay(7000);
    expect(c.t).toBe(0);
    expect([0.5, 2.5, 4.9, 7].map((t) => run.s(t))).toEqual(first);
  });
  it('60 fps and 13 fps give the same time and position', () => {
    const run = new Run([{ dur: Infinity, v: 0, a: 1.5 }]);
    const at = (fps: number) => { const c = new Clock(30); c.play(0); for (let ms = 0; ms <= 4000; ms += 1000 / fps) c.tick(ms); c.tick(4000); return [c.t, run.s(c.t)]; };
    const [t1, s1] = at(60), [t2, s2] = at(13);
    expect(t1).toBeCloseTo(4, 9); expect(t2).toBeCloseTo(4, 9);
    expect(s1).toBeCloseTo(s2!, 9);
  });
  it('at 1× one real second is one scenario second, and the clock stops at the end', () => {
    const c = new Clock(5); c.play(1000); c.tick(4000);
    expect(c.t).toBeCloseTo(3);
    c.tick(99000);
    expect(c.t).toBe(5);
    expect(c.playing).toBe(false);
  });
  it('a hidden page pauses the clock and the hidden time is not caught up', () => {
    const c = new Clock(60); c.play(0); c.tick(2000);
    c.hide();
    expect(c.autoPaused).toBe(true);
    c.tick(30000); // hidden for 28 s
    expect(c.t).toBeCloseTo(2);
    c.play(30000); c.tick(31000);
    expect(c.t).toBeCloseTo(3);
  });
});

describe('oval course uses arc length', () => {
  it('one lap adds exactly L to the distance and returns to the start point', () => {
    const run = new Run([{ dur: Infinity, v: 10 }]);
    const p0 = place(oval, run.s(0)), p1 = place(oval, run.s(10));
    expect(run.s(10)).toBeCloseTo(100);
    expect(p1.lap).toBe(1);
    expect(p1.x).toBeCloseTo(p0.x); expect(p1.y).toBeCloseTo(p0.y);
    expect(frameAt(run, oval, 25).lap).toBe(2);
    expect(frameAt(run, oval, 25).s).toBeCloseTo(250); // distance, not displacement
  });
});

describe('learner speed control (rally)', () => {
  it('changing speed mid-run keeps the distance continuous', () => {
    const run = new Run([{ dur: Infinity, v: 0 }]);
    run.setSpeed(0, 2); run.setSpeed(3, 5);
    expect(run.s(3)).toBeCloseTo(6);
    expect(run.s(5)).toBeCloseTo(16);
    expect(run.timeAt(16)).toBeCloseTo(5);
  });
  it('braking ends at rest, never backwards', () => {
    const run = new Run([{ dur: Infinity, v: 6, a: -2 }]);
    expect(run.v(5)).toBe(0);
    expect(run.s(5)).toBeCloseTo(9);
    expect(run.s(8)).toBeCloseTo(9);
  });
});

describe('mapped lessons on the shared player', async () => {
  const { NODES } = await import('../src/content');
  const { SIMS, VIEW_TAUGHT, TENTHS_TAUGHT } = await import('../src/content/motionsims');
  const { MOTION_CFG, scnRecord } = await import('../src/ui/motion');
  const { allOf } = await import('../src/engine/graph');
  const { rng } = await import('../src/engine/rng');
  const { check, solution, wrongs } = await import('../src/engine/check');
  // Strict ancestry: all_of prerequisites only (an any_of alternative may not have been learned).
  const strict = (id: string) => { const seen = new Set<string>([id]); const walk = (x: string) => { for (const p of allOf(x)) if (!seen.has(p)) { seen.add(p); walk(p); } }; walk(id); return [...seen]; };
  const BRIEF = ['M-TIME-01', 'M-TIME-03', 'ENV-PHY-MOTION-OBS-01', 'ENV-PHY-MOTION-CHANGE-01', 'ENV-PHY-MOTION-01', 'PHY79-SPEED-CONCEPT',
    ...['MOTION-REF', 'DIST-TIME', 'SPEED-CALC', 'SPEED-UNIT', 'SPEED-REARR', 'SPEED-MIXED', 'DATA-01', 'GRAPH-01', 'ST-GRAPH', 'VT-GRAPH',
      'ACCEL-CONCEPT', 'ACCEL-CALC', 'ACCEL-MOTION-GRAPH', 'ACCEL-VT-GRAPH', 'ACCEL-GRAPH'].map((x) => `PHY79-${x}`)];

  it('every lesson in the brief is migrated and carries its own revision', () => {
    expect(Object.keys(SIMS).sort()).toEqual([...BRIEF].sort());
    for (const id of BRIEF) { expect(NODES[id]!.rev, id).toMatch(/^(motion1|audit\d+|launch\d+)-/); expect(NODES[id]!.validRevs, id).toEqual(expect.arrayContaining([NODES[id]!.rev])); }
  });
  it('no view demands a representation the lesson has not taught', () => {
    const bad: string[] = [];
    for (const id of BRIEF) {
      const known = strict(id);
      for (let seed = 1; seed <= 40; seed++) {
        const it = SIMS[id]!(rng(seed)), c = (it.scene as never as Record<string, import('../src/ui/motion').MotionCfg>)[MOTION_CFG]!;
        for (const v of c.views) { const re = VIEW_TAUGHT[v]; if (re && !known.some((k) => re.test(k))) bad.push(`${id}: ${v}`); }
        if (c.tenths && !known.some((k) => TENTHS_TAUGHT.test(k))) bad.push(`${id}: tenths`);
        if (c.control?.speeds && !known.some((k) => VIEW_TAUGHT.speedo!.test(k))) bad.push(`${id}: speed control`);
      }
    }
    expect([...new Set(bad)]).toEqual([]);
  });
  it('items are well formed, checkable and record their scenario', () => {
    for (const id of BRIEF) for (let seed = 1; seed <= 30; seed++) {
      const it = SIMS[id]!(rng(seed));
      expect(check(it.task, solution(it.task)).ok, `${id}#${seed}`).toBe(true);
      for (const w of wrongs(it.task)) expect(check(it.task, w).ok, `${id}#${seed} wrong`).toBe(false);
      expect(it.scn, id).toBeTruthy();
      const c = (it.scene as never as Record<string, import('../src/ui/motion').MotionCfg>)[MOTION_CFG]!;
      expect(JSON.parse(scnRecord(c)).d).toBe(it.scn);
    }
  });
  it('a speed the learner must calculate is shown nowhere', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const c = (SIMS['PHY79-SPEED-CALC']!(rng(seed)).scene as never as Record<string, import('../src/ui/motion').MotionCfg>)[MOTION_CFG]!;
      expect(c.hideSpeed).toBe(true);
      expect(c.views.filter((v) => v === 'speedo' || v === 'vt')).toEqual([]);
    }
  });
  it('where positions are read over time, every mover stays on the course (no silent stop at the finish)', () => {
    for (const id of BRIEF) for (let seed = 1; seed <= 30; seed++) {
      const c = (SIMS[id]!(rng(seed)).scene as never as Record<string, import('../src/ui/motion').MotionCfg>)[MOTION_CFG]!;
      if (c.track.kind !== 'straight' || c.control?.speeds || !c.views.some((v) => ['table', 'st', 'vt', 'strobe', 'timeline'].includes(v))) continue;
      for (const l of c.lanes) { const s = new Run(l.legs).s(c.end); expect(s, `${id}#${seed} ${c.scn}`).toBeLessThanOrEqual(c.track.L + 1e-9); }
    }
  });
});
