import { describe, expect, test } from 'vitest';
import { rng } from '../src/engine/rng';
import { lifecycleHarborEvidence, lifecycleHarborSpecs, makeLifecycleHarborTask } from '../src/content/lifecycle-harbor';
import { checkLifecycleHarbor, lifecycleMaterialLedger, lifecycleEnergyLedger, lifecycleOptionTotals, solutionLifecycleHarbor, wrongLifecycleHarborResponses, type LifecycleHarborResponse } from '../src/content/models/lifecycle-harbor';
import { energyOracle, incidence, lifecycleOracle, materialOracle } from './lifecycle-harbor-fixtures';

const ids = lifecycleHarborSpecs.map(s => s.id), variants = ['build', 'repair', 'transfer'] as const;
describe('lifecycle harbor exact bounded evidence', () => {
  test('all eight canonical nodes have two genuine families, revisions and eight distinct scientific situations', () => {
    expect(ids).toHaveLength(8); expect(new Set(ids).size).toBe(8);
    for (const spec of lifecycleHarborSpecs) {
      expect(spec.validRevs).toContain(spec.rev); expect(spec.produce).toHaveLength(2); expect(lifecycleHarborEvidence[spec.id]!.limit).toMatch(/2D/);
      const instances = new Set(Array.from({ length: 160 }, (_, seed) => JSON.stringify(spec.item(rng(seed), 'independent').task)));
      expect(instances.size).toBeGreaterThanOrEqual(8);
      const a = makeLifecycleHarborTask(spec.id, rng(4), 'build'), b = makeLifecycleHarborTask(spec.id, rng(4), 'repair');
      if ('resource' in a && 'resource' in b) expect(a.resource.direction).not.toBe(b.resource.direction);
      if ('stages' in a && 'stages' in b) expect(a.stages.transitions.map(t => t.id).sort()).not.toEqual(b.stages.transitions.map(t => t.id).sort());
      if ('material' in a && 'material' in b) expect(a.material.intervention).not.toBe(b.material.intervention);
      if ('energy' in a && 'energy' in b) expect(a.energy.plan).not.toBe(b.energy.plan);
      if ('comparison' in a && 'comparison' in b) expect(a.comparison.priority).not.toBe(b.comparison.priority);
    }
    const sources = new Set(Array.from({ length: 160 }, (_, seed) => {
      const task = makeLifecycleHarborTask('CHEM79-RESOURCE', rng(seed), 'build');
      return task.mode === 'resource-chain' ? task.resource.cards.find(c => c.id === task.resource.start)!.label : '';
    }));
    expect(sources.size).toBe(8);
  });
  test('1536 independently derived productions and BigInt incidence ledgers', () => {
    let count = 0;
    for (const id of ids) for (const variant of variants) for (let seed = 0; seed < 64; seed++) {
      const task = makeLifecycleHarborTask(id, rng(seed), variant), answer = lifecycleOracle(task);
      expect(checkLifecycleHarbor(task, answer).ok, `${id}/${variant}/${seed}`).toBe(true); count++;
      if ('material' in task) {
        const oracle = materialOracle(task.material), actual = lifecycleMaterialLedger(task.material);
        expect(actual.flows).toEqual(oracle.flows); expect(actual.freshNextG).toBe(oracle.freshNextG);
        expect(incidence(oracle.flows, 'factory')).toBe(0n); expect(incidence(oracle.flows, 'sorter')).toBe(0n);
        expect(actual.returnedG + actual.rejectG).toBe(task.material.sortableG); expect(actual.returnedG).toBeLessThanOrEqual(task.material.qualityLimitG);
        expect(actual.flows.every(f => Number.isSafeInteger(f.amount) && f.amount! >= 0)).toBe(true);
      }
      if ('energy' in task) {
        const oracle = energyOracle(task.energy), actual = lifecycleEnergyLedger(task.energy);
        expect(actual.flows).toEqual(oracle.flows); expect(actual.nextPurchasedKj).toBe(oracle.nextPurchasedKj);
        expect(incidence(oracle.flows, 'before')).toBe(0n); expect(incidence(oracle.flows, 'after')).toBe(0n);
        expect(actual.recoveredKj).toBeLessThanOrEqual(task.energy.compatibleDemandKj); expect(actual.recoveredKj).toBeLessThan(actual.beforeHeatKj);
      }
      if (task.mode === 'integration' && task.scope === 'lifecycle') expect(lifecycleMaterialLedger(task.material).productG).toBe(task.stages.repairMaterialG);
      if (task.mode === 'integration' && task.scope === 'sustainability') {
        const a = task.comparison.options.find(o => o.id === 'a')!, quantity = lifecycleOptionTotals(a, task.comparison.uses);
        expect(task.material.freshG).toBe(quantity.units! * a.newMaterialG);
        expect(lifecycleMaterialLedger(task.material).productG).toBeLessThan(task.material.freshG + task.material.openingReturnedG);
        expect(task.energy.electricKj + task.energy.fuelKj).toBe(quantity.units! * a.makeEnergyKj);
      }
      if ('comparison' in task && variant === 'transfer') {
        const a = answer.comparison!.quantities.find(q => q.option === 'a')!, b = answer.comparison!.quantities.find(q => q.option === 'b')!;
        expect(b.materialG!).toBeLessThan(a.materialG!); expect(b.energyKj!).toBeGreaterThan(a.energyKj!);
      }
    }
    expect(count).toBe(1536);
  });
  test('accepts both source chains, reordered correct edges and either reasoned tradeoff choice', () => {
    for (let seed = 0; seed < 64; seed++) {
      const source = makeLifecycleHarborTask('CHEM79-RESOURCE', rng(seed), 'build'), answer = lifecycleOracle(source);
      if ('resource' in source && source.resource.cards.length > 4) {
        const middle = source.resource.cards.find(c => c.label === 'Sahattu ja kuivattu puu')!, material = source.resource.cards.find(c => c.label === 'Liimattu puulevy')!;
        answer.resource!.path = [source.resource.start, middle.id, material.id, source.resource.finish];
      }
      answer.resource!.roles = [...answer.resource!.roles].reverse(); expect(checkLifecycleHarbor(source, answer).ok).toBe(true);
      const task = makeLifecycleHarborTask('CHEM79-SUSTAIN', rng(seed), 'transfer');
      for (const choice of ['a', 'b']) { const alternate = lifecycleOracle(task); alternate.comparison!.choice = choice; alternate.material!.flows = [...alternate.material!.flows].reverse(); expect(checkLifecycleHarbor(task, alternate).ok).toBe(true); }
    }
  });
  test('rejects resource/object reversal, reuse as recycling, missing dust, lossless recovery, one-object and free-energy models', () => {
    for (const id of ids) for (const variant of variants) for (let seed = 0; seed < 12; seed++) {
      const task = makeLifecycleHarborTask(id, rng(seed), variant);
      for (const wrong of wrongLifecycleHarborResponses(task)) expect(checkLifecycleHarbor(task, wrong).ok).toBe(false);
      const answer = lifecycleOracle(task);
      if (answer.material) {
        answer.material.flows = answer.material.flows.map(f => f.id === 'returned' ? { ...f, amount: f.amount! + 1 } : f);
        expect(checkLifecycleHarbor(task, answer).ok).toBe(false);
      }
      if (answer.energy) { answer.energy!.locked = 'yes' as unknown as boolean; expect(checkLifecycleHarbor(task, answer).ok).toBe(false); }
    }
  });
  test('whole-object and maintenance thresholds are explicit, unused service and end stock are not credits', () => {
    const o = { id: 'a', label: 'example', baseLifeUses: 3, lifeUses: 5, newMaterialG: 10, repairMaterialG: 2, makeEnergyKj: 20, transportKj: 1, repairEnergyKj: 4, useEnergyKj: 2, endReturnG: 7 };
    expect(lifecycleOptionTotals(o, 3)).toEqual({ option: 'a', units: 1, repairs: 0, materialG: 10, energyKj: 27, returnedG: 7 });
    expect(lifecycleOptionTotals(o, 4)).toEqual({ option: 'a', units: 1, repairs: 1, materialG: 12, energyKj: 33, returnedG: 7 });
    expect(lifecycleOptionTotals(o, 6)).toEqual({ option: 'a', units: 2, repairs: 1, materialG: 22, energyKj: 58, returnedG: 14 });
  });
  test('review-first is neutral until a real complete observation and preserves helped/adult provenance even for wrong mathematics', () => {
    for (const id of ids) for (const variant of variants) {
      const task = makeLifecycleHarborTask(id, rng(12), variant); if (!task.review) continue;
      const good = lifecycleOracle(task), model = solutionLifecycleHarbor(task);
      expect(checkLifecycleHarbor(task, model)).toMatchObject({ ok: false, pendingReview: true });
      for (const review of [undefined, { ...good.review!, confirmedByAdult: false }, { ...good.review!, assistance: undefined }, { ...good.review!, observations: {} }]) {
        const pending = { ...good, review } as LifecycleHarborResponse; expect(checkLifecycleHarbor(task, pending)).toMatchObject({ ok: false, pendingReview: true });
      }
      const helped = { ...good, review: { ...good.review!, assistance: 'helped' as const } };
      expect(checkLifecycleHarbor(task, helped)).toMatchObject({ ok: true, observedByAdult: true, assisted: true });
      const wrong = wrongLifecycleHarborResponses(task)[0]!; wrong.review!.assistance = 'helped';
      expect(checkLifecycleHarbor(task, wrong)).toMatchObject({ ok: false, observedByAdult: true, assisted: true });
      const notYet = lifecycleOracle(task); notYet.review!.observations[task.review.rubric[0]!.id] = 'not-yet';
      expect(checkLifecycleHarbor(task, notYet)).toMatchObject({ ok: false, observedByAdult: true });
    }
  });
  test('hostile accessor, inherited, sparse, unknown-key and prototype answers are rejected without execution', () => {
    let reads = 0;
    for (const id of ids) {
      const task = makeLifecycleHarborTask(id, rng(0), 'build'), good = lifecycleOracle(task);
      const getter = { ...good }; Object.defineProperty(getter, 'mode', { enumerable: true, get: () => { reads++; return task.mode; } });
      const bad = [null, {}, { ...good, extra: 'PRIVATE' }, Object.create(good), getter, { ...good, review: Object.create(good.review ?? {}) }];
      for (const value of bad) expect(checkLifecycleHarbor(task, value as LifecycleHarborResponse).ok).toBe(false);
      for (const key of ['resource', 'stages', 'material', 'energy', 'comparison'] as const) {
        if (!good[key]) continue;
        const forged = structuredClone(good); forged[key] = Object.create(good[key]) as never;
        expect(checkLifecycleHarbor(task, forged).ok).toBe(false);
      }
      if (good.material) { const sparse = structuredClone(good); sparse.material!.flows = new Array(8); expect(checkLifecycleHarbor(task, sparse).ok).toBe(false); }
      if (good.material) {
        const custom = structuredClone(good); Object.setPrototypeOf(custom.material!.flows, { map: () => { reads++; return []; } }); expect(checkLifecycleHarbor(task, custom).ok).toBe(false);
        const serial = structuredClone(good); Object.defineProperty(serial.material!.flows, 'toJSON', { get: () => { reads++; return () => 'PRIVATE'; } }); expect(checkLifecycleHarbor(task, serial).ok).toBe(false);
      }
    }
    expect(reads).toBe(0);
  });
});
