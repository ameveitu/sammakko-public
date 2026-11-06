// Lentopaja: game progress stays apart from evidence; grants are idempotent and honest.
import { beforeEach, describe, expect, it } from 'vitest';
import { store } from '../src/engine/store';
import type { Attempt } from '../src/engine/evidence';
import '../src/content';
import { NODES } from '../src/content';
import { SIMS } from '../src/content/motionsims';
import { rng } from '../src/engine/rng';
import {
  ensureGame, FLIGHT, fresh, game, grant, install, MISSIONS, outcome, ready, saveGame, settle, sizeFor, snack, snapshotLegacy,
  LANDED, startFlight, stepFlight, validate, walkSpeed,
} from '../src/game';

const RUNKO = MISSIONS[0]!;
const att = (node: string, ok: boolean, extra: Partial<Attempt> = {}): Attempt => ({ node, phase: 'guided', ok, tag: 'x', at: 1, ...extra });

describe('missions', () => {
  it('every mission names lessons that exist, and the direct lesson needs the guided one', async () => {
    const { ancestors } = await import('../src/engine/graph');
    for (const m of MISSIONS) {
      expect(NODES[m.guided], m.guided).toBeTruthy();
      expect(NODES[m.direct], m.direct).toBeTruthy();
      if (m.id !== 'm-potkuri') expect(ancestors(m.direct)).toContain(m.guided);
    }
  });
  it('guided route: two correct answers inside the mission; answers outside it do not count', () => {
    const none = () => false;
    expect(outcome(RUNKO, [att('M-NUM-01', true), att('M-NUM-01', true)], none)).toBe(null);
    expect(outcome(RUNKO, [att('M-NUM-01', true, { mission: 'm-runko' })], none)).toBe(null);
    expect(outcome(RUNKO, [att('M-NUM-01', true, { mission: 'm-runko' }), att('M-NUM-01', false, { mission: 'm-runko' }), att('M-NUM-01', true, { mission: 'm-runko' })], none)).toBe('guided');
  });
  it('a replay is not an assessment', () => {
    const r = { mission: 'm-runko', replay: true };
    expect(outcome(RUNKO, [att('M-NUM-01', true, r), att('M-NUM-01', true, r)], () => false)).toBe(null);
  });
  it('direct route: the direct lesson must be checked and answered inside the mission', () => {
    const a = [att('M-MUL-01', true, { mission: 'm-runko', phase: 'quick' })];
    expect(outcome(RUNKO, a, () => false)).toBe(null);
    expect(outcome(RUNKO, a, (n) => n === 'M-MUL-01')).toBe('direct');
    // Checked earlier but not inside the mission: no part.
    expect(outcome(RUNKO, [], (n) => n === 'M-MUL-01')).toBe(null);
  });
  it('grants are idempotent: the same mission never gives a second part', () => {
    const g = fresh();
    expect(grant(g, 'm-runko', 'guided', 5)).toBe(true);
    expect(grant(g, 'm-runko', 'direct', 6)).toBe(false);
    expect(g.missions['m-runko']).toEqual({ at: 5, route: 'guided', node: 'M-NUM-01' });
    expect(Object.keys(g.inv).filter((k) => k.startsWith('part:'))).toEqual(['part:runko']);
  });
  it('guided and direct give the same part but record different routes and lessons', () => {
    const a = fresh(), b = fresh();
    grant(a, 'm-runko', 'guided', 1); grant(b, 'm-runko', 'direct', 1);
    expect(a.inv['part:runko']!.route).toBe('guided'); expect(b.inv['part:runko']!.route).toBe('direct');
    expect(a.missions['m-runko']!.node).toBe('M-NUM-01'); expect(b.missions['m-runko']!.node).toBe('M-MUL-01');
  });
});

describe('the craft', () => {
  it('three slots fill from owned parts only, and then the craft is ready', () => {
    const g = fresh();
    expect(install(g, RUNKO)).toBe(false);
    for (const m of MISSIONS) { grant(g, m.id, 'guided', 1); expect(install(g, m)).toBe(true); }
    expect(ready(g)).toBe(true);
  });
  it('the flight reaches the island on both routes, and the wing choice changes the route', () => {
    for (const wing of ['leveat', 'kapeat'] as const) {
      let f = startFlight(wing); let t = 0;
      while (!f.done && t < 60) { f = stepFlight(f, wing, Math.floor(t * 2) % 3 !== 0, 1 / 30); t += 1 / 30; }
      expect(f.done, wing).toBe(true);
      expect(t).toBeLessThan(15);
      expect(f.y).toBeCloseTo(LANDED); // lands on the island, not mid-air
    }
    expect(FLIGHT.leveat.route).not.toBe(FLIGHT.kapeat.route);
    const high = Math.min(...FLIGHT.leveat.rings.map((r) => r[1])), low = Math.min(...FLIGHT.kapeat.rings.map((r) => r[1]));
    expect(high).toBeLessThan(low); // wide wings: higher route
  });
  it('the water never ends the flight: the craft bounces back up', () => {
    let f = startFlight('kapeat');
    for (let i = 0; i < 600; i++) f = stepFlight(f, 'kapeat', false, 1 / 60);
    expect(f.splashes).toBeGreaterThan(0);
    expect(f.done).toBe(true);
  });
});

describe('snacks and growth', () => {
  it('growth is bounded and never lost', () => {
    const g = fresh();
    for (let i = 0; i < 50; i++) snack(g);
    expect(g.size).toBe(2);
    expect(sizeFor(0)).toBe(0); expect(sizeFor(3)).toBe(1);
  });
  it('the long hop is optional, and world boosts never change a measured trial', () => {
    const g = fresh(); for (let i = 0; i < 9; i++) snack(g);
    expect(walkSpeed(g)).toBe(walkSpeed(fresh()));
    g.hop = 'long';
    expect(walkSpeed(g)).toBeGreaterThan(walkSpeed(fresh()));
    // Motion lessons do not read game state: the same seed gives the same scenario.
    store.reset(); store.update((s) => { s.game = g; });
    const a = SIMS['PHY79-SPEED-CALC']!(rng(7)).scn;
    store.update((s) => { s.game = fresh(); });
    expect(SIMS['PHY79-SPEED-CALC']!(rng(7)).scn).toBe(a);
  });
});

describe('saved game', () => {
  beforeEach(() => store.reset());
  it('repairs a damaged game without losing parts of completed missions', () => {
    const g = validate({ missions: { 'm-runko': { route: 'direct', at: 3 } }, inv: 'broken', slots: { chassis: 'runko', wings: 'nope' }, size: 99, snacks: -4, flights: [{}], pos: { scene: 'kuu' } });
    expect(g.inv['part:runko']).toBeTruthy();
    expect(g.slots).toEqual({ chassis: 'runko' });
    expect(g.size).toBe(0);
    expect(g.pos.scene).toBe('paja');
    expect(validate('nonsense').v).toBe(1);
  });
  it('legacy prizes are snapshotted once with their provenance and invent no missions', () => {
    const g = fresh(); snapshotLegacy(g, ['loru', 'mitat'], 9); snapshotLegacy(g, ['loru'], 10);
    expect(g.inv['prize:loru']).toEqual({ from: 'legacy', at: 9 });
    expect(g.missions).toEqual({});
  });
  it('refresh and repeated settling never duplicate a part', () => {
    store.load({ world: 'ranta', attempts: [att('M-NUM-01', true, { mission: 'm-runko' }), att('M-NUM-01', true, { mission: 'm-runko' })] });
    ensureGame();
    expect(settle().map((m) => m.id)).toEqual(['m-runko']);
    expect(settle()).toEqual([]);
    const before = JSON.stringify(game());
    store.update(() => {}); ensureGame(); settle();
    expect(JSON.stringify(game())).toBe(before);
  });
  it('inferred ancestors mint nothing: checking a later lesson outside a mission gives no part', () => {
    const quick = Array.from({ length: 4 }, () => att('M-MUL-01', true, { phase: 'quick' }));
    store.load({ world: 'ranta', attempts: quick });
    ensureGame();
    expect(settle()).toEqual([]);
    expect(game().missions).toEqual({});
  });
  it('tester mode plays the whole arc in its own disposable game; the learner game is untouched', () => {
    store.load({ world: 'ranta' });
    ensureGame(); saveGame((g) => { g.snacks = 2; });
    const learner = JSON.stringify(store.get().game);
    store.update((s) => { s.tester = true; });
    ensureGame();
    for (const m of MISSIONS) saveGame((g) => { grant(g, m.id, 'tester', 1); install(g, m); });
    expect(ready(game())).toBe(true);
    expect(JSON.stringify(store.get().game)).toBe(learner);
    store.resetTester();
    expect(store.get().testerGame).toBeUndefined();
    store.update((s) => { s.tester = false; });
    expect(ready(game())).toBe(false);
    expect(game().snacks).toBe(2);
  });
  it('the game survives a reload', () => {
    const data = new Map<string, string>();
    const gl = globalThis as { localStorage?: unknown };
    gl.localStorage = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => { data.set(k, v); }, removeItem: (k: string) => { data.delete(k); } };
    store.reload(); store.setStorageMode('local');
    store.load({ world: 'ranta' }); ensureGame();
    saveGame((g) => { grant(g, 'm-runko', 'guided', 1); install(g, RUNKO); g.pos = { scene: 'ranta', x: 0.7 }; });
    store.update(() => {});
    store.reload();
    expect(game().slots.chassis).toBe('runko');
    expect(game().pos).toEqual({ scene: 'ranta', x: 0.7 });
    delete gl.localStorage; store.reload();
  });
});
