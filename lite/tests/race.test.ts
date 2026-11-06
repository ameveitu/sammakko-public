import { describe, expect, it } from 'vitest';
import { copilot, fresh, guessOptions, RACE, raceTalk, raceTimes, startFlight, stepFlight, validate, FLIGHT } from '../src/game';
import { Run, frameAt } from '../src/engine/motion';

describe('Lentopaja beach race', () => {
  it('times come from the same steady-speed model the track and graph draw', () => {
    for (const L of RACE.lengths) {
      const t = raceTimes(L);
      const lo = new Run([{ dur: Infinity, v: RACE.loikka }], L), aa = new Run([{ dur: Infinity, v: RACE.aava }], L);
      expect(lo.timeAt(L, 99)).toBeCloseTo(t.loikka, 9);
      expect(aa.timeAt(L, 99)).toBeCloseTo(t.aava, 9);
      // at Loikka's finish time Aava has run exactly speed × time
      expect(frameAt(aa, { kind: 'straight', L }, t.loikka).s).toBeCloseTo(RACE.aava * t.loikka, 9);
    }
    expect(RACE.lengths.map((L) => raceTimes(L).loikka)).toEqual([2, 4, 6]);
    expect(RACE.lengths.map((L) => raceTimes(L).aava)).toEqual([3, 6, 9]);
  });
  it('the guess offers the right time and the "distance ignored" time', () => {
    for (const a of RACE.lengths) for (const b of RACE.lengths) if (a !== b) {
      const o = guessOptions(a, b);
      expect(o).toContain(raceTimes(b).loikka);
      expect(o).toContain(raceTimes(a).loikka);
      expect(new Set(o).size).toBe(o.length);
      expect(o.length).toBe(3);
    }
  });
  it('Aava explains what changed and what stayed the same', () => {
    const r = (L: number, guess?: number) => ({ at: 0, L, ...raceTimes(L), ...(guess !== undefined ? { guess } : {}) });
    expect(raceTalk([])).toMatch(/Valitse matka/);
    expect(raceTalk([r(6)])).toMatch(/6 metriä: Loikka 2 s, minä 3 s/);
    const t = raceTalk([r(6), r(12, 2)]);
    expect(t).toMatch(/Matka kaksinkertaistui \(6 m → 12 m\)/);
    expect(t).toMatch(/aikakin kaksinkertaistui \(2 s → 4 s\)/);
    expect(t).toMatch(/Nopeus pysyi samana: 3 metriä joka sekunti/);
    expect(t).toMatch(/Arvasit 2 s/);
    expect(raceTalk([r(18), r(6, 2)])).toMatch(/pieneni kolmasosaan[\s\S]*Arvauksesi osui/);
  });
  it('saved races survive validation; junk is dropped', () => {
    const g = validate({ ...fresh(), races: [{ at: 1, L: 12, loikka: 4, aava: 6, guess: 4 }, { L: 999 }, 'x'] });
    expect(g.races).toEqual([{ at: 1, L: 12, loikka: 4, aava: 6, guess: 4 }]);
    expect(validate({ intro: true }).races).toEqual([]);
  });
});

describe('flight co-pilot', () => {
  it('reads the next ring from the flight state', () => {
    const f = startFlight('leveat');
    const [rx, ry] = FLIGHT.leveat.rings[0]!;
    expect(copilot({ ...f, y: ry + 0.2 }, 'leveat')).toMatch(/Rengas 1 on ylempänä/);
    expect(copilot({ ...f, y: ry - 0.2 }, 'leveat')).toMatch(/Rengas 1 on alempana/);
    expect(copilot({ ...f, y: ry }, 'leveat')).toMatch(/Hyvä korkeus renkaalle 1/);
    expect(copilot({ ...f, x: rx + 0.05, rings: [true, false, false] }, 'leveat')).toMatch(/renka|Rengas 2/i);
    let g = startFlight('kapeat');
    for (let i = 0; i < 400 && !g.done; i++) g = stepFlight(g, 'kapeat', false, 0.05);
    expect(copilot(g, 'kapeat')).toMatch(/Laskeudutaan/);
  });
});
