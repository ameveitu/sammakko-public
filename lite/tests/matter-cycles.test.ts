import { describe, expect, it } from 'vitest';
import { matterOracle } from './matter-cycles-fixtures';
import { rng } from '../src/engine/rng';
import { makeMatterCyclesTask, matterCyclesSpecs } from '../src/content/matter-cycles';
import { applyCycleMove, checkMatterCycles, cycleTotals, initialCycleLedger, replayCycleMoves, solutionMatterCycles, type CycleMove, type MatterCyclesResponse } from '../src/content/models/matter-cycles';

describe('matter cycle model', () => {
  it('has exactly twelve nodes, stable scientific runs and at least eight different givens', () => {
    expect(matterCyclesSpecs).toHaveLength(12);
    for (const spec of matterCyclesSpecs) {
      expect(spec.produce).toHaveLength(2); const unique = new Set<string>();
      for (let seed = 0; seed < 160; seed++) { const task = makeMatterCyclesTask(spec.id, rng(seed), 'build'); unique.add(task.run); expect(task).toEqual(makeMatterCyclesTask(spec.id, rng(seed), 'build')); }
      expect(unique.size, spec.id).toBeGreaterThanOrEqual(8);
    }
  });
  it('matches independent text/phase and BigInt incidence oracles in 2304 generated situations', () => {
    for (const spec of matterCyclesSpecs) for (const variant of ['build', 'repair', 'transfer'] as const) for (let seed = 0; seed < 64; seed++) {
      const task = makeMatterCyclesTask(spec.id, rng(seed), variant), response = matterOracle(task);
      expect(checkMatterCycles(task, response), `${spec.id} ${variant} ${seed}`).toMatchObject({ ok: true });
      expect(checkMatterCycles(task, solutionMatterCycles(task)).ok).toBe(!task.review);
      if ('moves' in response && 'initial' in task) {
        const replay = replayCycleMoves(task, response.moves); expect(replay.valid).toBe(true); expect(cycleTotals(replay.ledger)).toEqual(cycleTotals(initialCycleLedger(task)));
        expect(new Set(replay.ledger.parcels.map(p => p.id)).size).toBe(replay.ledger.parcels.length);
      }
    }
  });
  it('keeps surface and groundwater evidence distinct and permits both post-snow return routes', () => {
    const surface = makeMatterCyclesTask('ENV-CHEM-WATERCYCLE-01', rng(3), 'build'), ground = makeMatterCyclesTask('ENV-CHEM-WATERCYCLE-01', rng(3), 'repair'), snow = makeMatterCyclesTask('ENV-CHEM-WATERCYCLE-01', rng(3), 'transfer');
    if (surface.mode !== 'water-path' || ground.mode !== 'water-path' || snow.mode !== 'water-path') throw Error('task');
    const direct = matterOracle(surface), underground = matterOracle(ground), snowy = matterOracle(snow);
    if (direct.mode !== 'water-path' || underground.mode !== 'water-path' || snowy.mode !== 'water-path') throw Error('response');
    expect(direct.moves.map(m => m.process)).not.toEqual(underground.moves.map(m => m.process));
    expect(checkMatterCycles(surface, { ...direct, moves: underground.moves.map(m => ({ ...m, run: surface.run })) }).ok).toBe(false);
    const runoff = snow.processes.find(p => p.label === 'Valunta')!;
    expect(checkMatterCycles(snow, { ...snowy, moves: [...snowy.moves.slice(0, -2), { run: snow.run, id: 'alternate-surface', process: runoff.id, from: 'river', to: 'sea', amountMg: snow.amountMg }] }).ok).toBe(true);
  });
  it('permits split conserved transfers and same-action retry, with a fresh ledger for every run', () => {
    const task = makeMatterCyclesTask('ENV-CHEM-MATTERCONS-01', rng(1), 'build'); if (task.mode !== 'conservation') throw Error('task');
    const response = matterOracle(task); if (response.mode !== task.mode) throw Error('response');
    const move = response.moves[0]!, first = Math.floor(move.amountMg / 2), moves: CycleMove[] = [{ ...move, id: 'split-a', amountMg: first }, { ...move, id: 'split-b', amountMg: move.amountMg - first }];
    expect(checkMatterCycles(task, { ...response, moves }).ok).toBe(true);
    const initial = initialCycleLedger(task), after = applyCycleMove(initial, move, 'gas')!;
    expect(applyCycleMove(after, move, 'gas')).toBe(after); expect(initialCycleLedger(task).applied).toEqual([]);
    expect(applyCycleMove(after, { ...move, amountMg: move.amountMg + 1 }, 'gas')).toBeUndefined();
    expect(applyCycleMove(initial, { ...move, run: 'other-run' }, 'gas')).toBeUndefined();
    expect(replayCycleMoves(task, [{ ...move, amountMg: task.amountMg + 1 }]).valid).toBe(false);
  });
});

describe('matter cycle countermodels, provenance and observation boundaries', () => {
  it('rejects changed mass, energy-as-matter, reversed arrows, vapor clouds and unseen changes', () => {
    for (const spec of matterCyclesSpecs) for (const variant of ['build', 'repair', 'transfer'] as const) for (let seed = 0; seed < 16; seed++) {
      const task = makeMatterCyclesTask(spec.id, rng(seed), variant), response = matterOracle(task), wrong = structuredClone(response);
      if (wrong.mode === 'conservation') wrong.predictedTotalMg!++;
      else if (wrong.mode === 'photosynthesis') wrong.trace = ['e', task.mode === 'photosynthesis' ? task.plant : '', 'c'];
      else if (wrong.mode === 'water-path') wrong.cloud = 'vapor';
      else if (wrong.mode === 'reservoirs') wrong.assignments = wrong.assignments.map(a => a.card === 'water-only' ? { ...a, reservoir: 'water' } : a);
      else wrong.edges = wrong.edges.map((edge, i) => i ? edge : { ...edge, from: edge.to, to: edge.from });
      expect(checkMatterCycles(task, wrong).ok).toBe(false);
      if ('locked' in response) expect(checkMatterCycles(task, { ...response, locked: false }).ok).toBe(false);
      if (response.mode === 'photosynthesis') expect(checkMatterCycles(task, { ...response, observed: false }).ok).toBe(false);
      if (response.mode === 'conservation') expect(checkMatterCycles(task, { ...response, energyIsMatter: true }).ok).toBe(false);
      if (task.mode === 'carbon-network' && response.mode === task.mode) {
        expect(checkMatterCycles(task, { ...response, moves: [...response.moves].reverse() }).ok).toBe(true);
        if (task.mustReturnVia.length) expect(checkMatterCycles(task, { ...response, returnPath: [task.focus, 'plant', task.focus] }).ok).toBe(false);
        if (task.proposal) expect(task.proposal[0]).not.toEqual(response.edges.find(edge => edge.process === task.proposal![0]!.process));
      }
    }
  });
  it('requires explicit complete adult observation first and preserves helped provenance on an incorrect account', () => {
    for (const spec of matterCyclesSpecs) {
      const task = makeMatterCyclesTask(spec.id, rng(3), 'repair'); if (!task.review) continue;
      const response = matterOracle(task); if (response.mode !== 'carbon-network') throw Error('review mode');
      const badMath = { ...response, focusChangeMg: response.focusChangeMg! + 1 };
      for (const review of [undefined, { ...response.review!, assistance: undefined }, { ...response.review!, confirmedByAdult: false }, { ...response.review!, observations: { matter: 'met' } }]) expect(checkMatterCycles(task, { ...badMath, review } as MatterCyclesResponse)).toMatchObject({ ok: false, pendingReview: true });
      expect(checkMatterCycles(task, { ...badMath, review: { ...response.review!, assistance: 'helped' } })).toMatchObject({ ok: false, observedByAdult: true, assisted: true });
      expect(checkMatterCycles(task, { ...response, review: { ...response.review!, channel: 'written' } })).toMatchObject({ ok: true, observedByAdult: true });
      expect(checkMatterCycles(task, { ...response, review: { ...response.review!, observations: { matter: 'met', process: 'not-yet', boundary: 'met' } } })).toMatchObject({ ok: false, observedByAdult: true });
      expect(checkMatterCycles(task, solutionMatterCycles(task))).toMatchObject({ ok: false, pendingReview: true });
    }
  });
  it('keeps dissolved material in a shared solution phase and carbonate carbon outside the fuel combustion', () => {
    for (let seed = 0; seed < 64; seed++) {
      const dissolve = makeMatterCyclesTask('ENV-CHEM-MATTERCONS-01', rng(seed), 'transfer'); if (dissolve.mode !== 'conservation') throw Error('task');
      const solution = matterOracle(dissolve); if (solution.mode !== dissolve.mode) throw Error('response');
      const after = replayCycleMoves(dissolve, solution.moves).ledger;
      expect(after.parcels.filter(p => p.reservoir === dissolve.target).every(p => p.form === 'solution')).toBe(true);
      expect(after.parcels.find(p => p.reservoir === dissolve.source)?.form).toBe('solid');
      expect(cycleTotals(after)).toEqual(cycleTotals(initialCycleLedger(dissolve)));
      const burn = makeMatterCyclesTask('CHEM79-CARBON-BURN', rng(seed), 'transfer'); if (burn.mode !== 'carbon-network') throw Error('task');
      const response = matterOracle(burn); if (response.mode !== burn.mode) throw Error('response');
      const carbonateBefore = burn.initial.filter(p => p.root === 'root-carbonate');
      expect(replayCycleMoves(burn, response.moves).ledger.parcels.filter(p => p.root === 'root-carbonate')).toEqual(carbonateBefore);
      const noFuel = { ...burn, initial: burn.initial.map(p => p.root === 'root-fossil' ? { ...p, form: 'inorganic-carbon' as const } : p) };
      expect(replayCycleMoves(noFuel, response.moves).valid).toBe(false);
    }
  });
  it('rejects malformed inherited, sparse, accessor and stale submissions without evaluating getters', () => {
    for (const spec of matterCyclesSpecs) {
      const task = makeMatterCyclesTask(spec.id, rng(4), 'build'), response = matterOracle(task); let reads = 0;
      const getter = Object.defineProperty({ ...response }, 'mode', { get() { reads++; return task.mode; }, enumerable: true });
      for (const bad of [undefined, null, 'cycle', [], {}, Object.create(response), getter, { ...response, text: 'PRIVATE_RESPONSE_721' }]) { expect(() => checkMatterCycles(task, bad as MatterCyclesResponse)).not.toThrow(); expect(checkMatterCycles(task, bad as MatterCyclesResponse).ok).toBe(false); }
      expect(reads).toBe(0);
      for (const key of ['roles', 'moves', 'assignments', 'edges']) if (key in response) {
        const array = (response as unknown as Record<string, unknown[]>)[key]!;
        for (const bad of [[null], ...(array.length ? [new Array(array.length), [Object.create(array[0]!), ...array.slice(1)]] : [])]) expect(checkMatterCycles(task, { ...response, [key]: bad } as MatterCyclesResponse).ok).toBe(false);
      }
      if ('moves' in response) expect(checkMatterCycles(task, { ...response, moves: response.moves.map(m => ({ ...m, run: 'stale-run' })) }).ok).toBe(false);
    }
  });
});
