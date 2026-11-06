import { describe, expect, it } from 'vitest';
import { expeditionSliceEvidence, expeditionSliceSpecs } from '../src/content/expedition-slice';
import { filtrationOutcome } from '../src/content/models/filtration';
import { pairForces, trackMotion } from '../src/content/models/force-track';
import { parallelReadings } from '../src/content/models/circuit';
import { meanSpaceDistancesKm, spaceDiametersKm, spaceLight, type SpaceModel } from '../src/content/models/space';
import { check, solution, wrongs } from '../src/engine/check';
import { rng } from '../src/engine/rng';
import type { Paint, Phase } from '../src/engine/types';

const ids = [
  'M-GMEAS-05', 'M-SCALE-03', 'M-PCT-01', 'PHY79-FORCE-MOTION', 'PHY79-ACTIONPAIR',
  'PHY79-PARALLEL', 'CHEM79-FILTRATION', 'CHEM79-FIRE-SAFE', 'ENV-PHY-SPACE-01',
];
const specFor = (id: string) => expeditionSliceSpecs.find((spec) => spec.id === id)!;
const render = (scene: Paint) => {
  const host = { innerHTML: '' } as HTMLElement;
  scene(host);
  return host.innerHTML;
};
const families = (id: string) => Array.from({ length: 64 }, (_, i) => specFor(id).item(rng(i), 'independent'));

describe('Saaristo expedition content', () => {
  it('provides one revision and local demo for each of the nine new canonical IDs', () => {
    expect(expeditionSliceSpecs.map(({ id }) => id)).toEqual(ids);
    expect(Object.keys(expeditionSliceEvidence)).toEqual(ids);
    expect(new Set(expeditionSliceSpecs.map(({ rev }) => rev)).size).toBe(ids.length);
    for (const spec of expeditionSliceSpecs) {
      expect(spec.rev).toMatch(/^exp690-/);
      expect(spec.validRevs).toEqual([spec.rev]);
      expect(spec.intro && spec.goal && spec.reward).toBeTruthy();
      expect(expeditionSliceEvidence[spec.id]!.limit.length).toBeGreaterThan(40);
      for (const step of spec.demo(rng(19))) {
        expect(step.say).toBeTruthy();
        expect(step.sceneModel.title).toBeTruthy();
        expect(render(step.scene)).toContain('<svg');
      }
    }
  });

  it.each(expeditionSliceSpecs.map(({ id }) => id))('%s generates deterministic, solvable and varied items', (id) => {
    const spec = specFor(id);
    const tags = new Set<string>();
    const phases: Phase[] = ['guided', 'independent', 'transfer', 'retrieval'];
    for (const phase of phases) {
      for (let seed = 0; seed < 48; seed++) {
        const item = spec.item(rng(seed), phase);
        const again = spec.item(rng(seed), phase);
        expect(item.tag).toBe(again.tag);
        expect(item.sceneModel).toEqual(again.sceneModel);
        expect(item.task).toEqual(again.task);
        expect(render(item.scene!)).toBe(render(again.scene!));
        expect(item.hint && item.explain).toBeTruthy();
        expect(check(item.task, solution(item.task)).ok).toBe(true);
        for (const wrong of wrongs(item.task)) expect(check(item.task, wrong).ok).toBe(false);
        if (item.task.kind === 'choice') {
          expect(new Set(item.task.options.map(({ text }) => text)).size).toBe(item.task.options.length);
          for (const wrong of wrongs(item.task)) expect(check(item.task, wrong).why).toBeTruthy();
        }
        if (phase === 'independent') tags.add(item.tag);
        if (phase === 'transfer') expect(item.tag).toBe('transfer');
      }
    }
    expect([...tags].sort()).toEqual([...expeditionSliceEvidence[id]!.families].sort());
  });

  it('measures volume from all three dimensions and checks the cubic unit in the layer task', () => {
    const spec = specFor('M-GMEAS-05');
    for (const item of [...families(spec.id), spec.item(rng(29), 'transfer')]) {
      const { task, sceneModel } = item;
      if (sceneModel.kind !== 'volume') throw new Error('Expected volume model');
      const [a, b, c] = sceneModel.dimensions;
      const unit = sceneModel.unit;
      const scene = render(item.scene!);
      for (const d of [a, b, c]) expect(scene).toContain(`${d} ${unit}`);
      if (task.kind === 'build') {
        const seq = [String(a), '·', String(b), '·', String(c), `${unit}³`];
        expect(seq.every((token) => task.tokens.includes(token))).toBe(true);
        expect(check(task, { kind: 'build', seq }).ok).toBe(true);
        expect(check(task, { kind: 'build', seq: seq.slice(0, -1).concat(`${unit}²`) })).toMatchObject({ ok: false, why: expect.stringContaining('pinta-alaa') });
      } else {
        expect(task).toMatchObject({ kind: 'numeric', answer: a * b * c, unit: `${unit}³` });
        expect(check(task, { kind: 'numeric', value: a * b })).toMatchObject({ ok: false, why: expect.stringContaining('kerroksen') });
      }
    }
  });

  it('distinguishes route stages and a new map scale, and changes the hundred-grid layout in transfer', () => {
    const scale = specFor('M-SCALE-03');
    const map = scale.item(rng(2), 'transfer');
    expect(map.sceneModel).toMatchObject({ kind: 'map-scale', places: ['Pitkospuut', 'Lintutorni'] });
    expect([25, 150, 250]).toContain(map.sceneModel.kind === 'map-scale' && map.sceneModel.metersPerCm);
    for (const { task, sceneModel } of [...families(scale.id), map]) {
      if (sceneModel.kind !== 'map-scale') throw new Error('Expected map model');
      const cm = sceneModel.segmentsCm.reduce((a, b) => a + b, 0);
      expect(task).toMatchObject({ kind: 'numeric', answer: cm * sceneModel.metersPerCm, unit: 'm' });
      expect(check(task, { kind: 'numeric', value: cm }).why).toContain('kartalla');
    }
    const pct = specFor('M-PCT-01').item(rng(10), 'transfer');
    expect(pct.sceneModel).toMatchObject({ kind: 'percent', layout: 'strip' });
    expect(render(pct.scene!).match(/<rect /g)).toHaveLength(100);
    expect(render(pct.scene!)).toContain('Ruudukon rivit tekstinä');
    expect(pct.task).toMatchObject({ kind: 'numeric', unit: '%', answer: pct.sceneModel.kind === 'percent' && pct.sceneModel.marked });
  });
});

describe('Saaristo expedition domain models', () => {
  it('keeps velocity constant under zero force and distinguishes slowing from moving left', () => {
    const [coast, brake] = specFor('PHY79-FORCE-MOTION').demo(rng(1)).map(({ sceneModel }) => sceneModel);
    if (coast?.kind !== 'force-track' || brake?.kind !== 'force-track') throw new Error('Expected track model');
    expect(trackMotion(coast, 0)).toMatchObject({ netForce: 0, velocity: 2, displacement: 0 });
    expect(trackMotion(coast, 1)).toMatchObject({ velocity: 2, displacement: 2 });
    expect(trackMotion(coast, 2)).toMatchObject({ velocity: 2, displacement: 4 });
    expect(trackMotion(brake, 1)).toMatchObject({ netForce: -2, velocity: 1 });
    expect(trackMotion(brake, 2).velocity).toBe(0);
    const transfer = specFor('PHY79-FORCE-MOTION').item(rng(2), 'transfer');
    const model = transfer.sceneModel;
    if (model.kind !== 'force-track' || transfer.task.kind !== 'choice') throw new Error('Expected track prediction');
    expect(model.initialSpeed).toBeLessThan(0);
    expect(trackMotion(model)).toMatchObject({ netForce: 2, velocity: -1 });
    expect(transfer.task.options[transfer.task.answer]!.text).toContain('pienenee');
  });

  it('assigns action forces to different bodies in both the cart and oar models', () => {
    for (const { sceneModel } of specFor('PHY79-ACTIONPAIR').demo(rng(4))) {
      if (sceneModel.kind !== 'action-pair') throw new Error('Expected action pair model');
      const [a, b] = pairForces(sceneModel);
      expect(a.on).not.toBe(b.on);
      expect(a.from).toBe(b.on);
      expect(b.from).toBe(a.on);
      expect(a.signedNewtons).toBe(-b.signedNewtons);
      expect(Math.abs(b.signedNewtons)).toBe(sceneModel.force);
    }
  });

  it('uses shared voltage and measured currents from both unequal branches without a resistance input', () => {
    const { sceneModel, task } = specFor('PHY79-PARALLEL').item(rng(9), 'transfer');
    if (sceneModel.kind !== 'parallel-circuit' || task.kind !== 'place') throw new Error('Expected parallel circuit task');
    expect(sceneModel.layout).toBe('vertical');
    const [a, b] = sceneModel.currentsMa;
    expect(a).not.toBe(b);
    expect(parallelReadings(sceneModel)).toEqual({ branchVolts: [sceneModel.voltage, sceneModel.voltage], totalCurrentMa: a + b });
    expect(check(task, { kind: 'place', map: { voltage: 'half-voltage', current: 'sum-current' } })).toMatchObject({ ok: false, why: expect.stringContaining('samat kaksi solmua') });
    expect(check(task, { kind: 'place', map: { voltage: 'same-voltage', current: 'single-current' } })).toMatchObject({ ok: false, why: expect.stringContaining('yhteen') });
  });

  it('accounts for grains and dissolved salt across separate filtration representations', () => {
    const spec = specFor('CHEM79-FILTRATION');
    const steps = spec.demo(rng(5));
    expect(steps.map(({ sceneModel }) => sceneModel.kind === 'filtration' && sceneModel.view)).toEqual(['macro', 'grain', 'ion']);
    expect(render(steps[2]!.scene)).toContain('Kuvamerkkien kokoa ei verrata');
    const retained = spec.item(rng(2), 'transfer').sceneModel;
    if (retained.kind !== 'filtration') throw new Error('Expected filtration model');
    expect(filtrationOutcome(retained)).toEqual({
      grainRetained: true, waterPasses: true, saltPasses: true, clearInThisModel: true, safeToDrinkEstablished: false,
    });
    expect(filtrationOutcome({ ...retained, grainMicrometers: retained.poreMicrometers / 2, dissolvedSalt: false })).toMatchObject({
      grainRetained: false, saltPasses: false, waterPasses: true, safeToDrinkEstablished: false,
    });
  });

  it('keeps physical safety claims separate from simulated conditions and decisions', () => {
    const spec = specFor('CHEM79-FIRE-SAFE');
    const items = [...families(spec.id), spec.item(rng(5), 'transfer')];
    for (const { sceneModel, explain } of items) {
      if (sceneModel.kind !== 'fire-safety') throw new Error('Expected fire model');
      if (sceneModel.view === 'conditions') {
        expect([sceneModel.fuel, sceneModel.oxygen, sceneModel.heat].filter(Boolean)).toHaveLength(2);
      } else {
        expect(sceneModel.safeExit).not.toBe(sceneModel.smokyRoute);
        expect(explain).toContain('Aava');
        expect(explain).toContain('112');
      }
    }
    const transfer = spec.item(rng(5), 'transfer');
    expect(transfer.task).toMatchObject({ kind: 'place', answer: { route: 'safe', report: 'adult' } });
    expect(expeditionSliceEvidence[spec.id]!.limit).toContain('fyysinen turvallisuusosaaminen');
  });

  it('changes the day marker independently of orbit and preserves the seasonal axis direction', () => {
    const model: SpaceModel = { kind: 'space', title: 'Mallitaulu', mode: 'day', rotation: 0, orbit: 'june' };
    const june = spaceLight(model);
    const december = spaceLight({ ...model, orbit: 'december' });
    expect(spaceLight({ ...model, rotation: 180 }).islandInDaylight).toBe(false);
    expect(june.islandInDaylight).toBe(december.islandInDaylight);
    expect(june.axis).toEqual(december.axis);
    expect(june.sunDirection).toBe(-december.sunDirection);
    expect(specFor('ENV-PHY-SPACE-01').item(rng(5), 'transfer').sceneModel).toMatchObject({ mode: 'day', sites: 2 });
    expect(june.northTiltedTowardSun).toBe(true);
    expect(december.northTiltedTowardSun).toBe(false);
    expect(spaceDiametersKm.moon).toBeLessThan(spaceDiametersKm.earth);
    expect(meanSpaceDistancesKm.earthMoon).toBeLessThan(meanSpaceDistancesKm.earthSun);
  });
});
