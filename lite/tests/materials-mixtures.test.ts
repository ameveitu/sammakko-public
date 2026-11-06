import { describe, expect, it } from 'vitest';
// @ts-expect-error Runtime Three.js types are intentionally checked through the stage contract.
import * as THREE from 'three';
import { itemIdentity } from '../src/engine/item-identity';
import { rng } from '../src/engine/rng';
import { materialsMixturesSpecs, materialsMixturesEvidence } from '../src/content/materials-mixtures';
import { applyMatterAction, checkMaterialsMixtures, initialMatterLedger, parcelTotals, replayMatter,
  solutionMaterialsMixtures, wrongMaterialsMixturesResponses, mixtureNumber,
  type MaterialsMixturesTask, type MaterialsMixturesResponse, type MatterAction, type MatterLedger, type SeparationStation } from '../src/content/models/materials-mixtures';
import { materialsMixturesScene } from '../src/content/models/materials-mixtures-scene';
// @ts-expect-error Authored JS renderer has a runtime contract checked below.
import { mountMaterialsMixturesStage } from '../src/world/materials-mixtures-stage.js';

const options = ['independent', 'transfer'] as const;
function action(task: MaterialsMixturesTask, source: string, method: MatterAction['method']): MatterAction {
  return { run: task.run, id: `${source}:${method === 'dissolve' ? 'dissolve' : method === 'reshape' || method === 'phase' ? 'observe' : 'operate'}`, source, method,
    target: `${source}:${method === 'evaporate' ? 'gas' : 'output'}`, residue: `${source}:residue` };
}
/** Independent integer allocation. It never invokes applyMatterAction or solution to produce expected masses. */
function stationOracle(s: SeparationStation) {
  const bins: Record<string, Record<string, number>> = { output: {}, residue: {}, gas: {} };
  for (const p of s.initial.parcels) {
    if (s.method === 'filter') {
      const bin = p.phase === 'solid' && p.zone !== 'dissolved' && p.grainUm! > s.poreUm ? 'residue' : 'output';
      bins[bin]![p.root] = (bins[bin]![p.root] ?? 0) + p.massMg;
    } else if (s.method === 'evaporate') {
      const bin = p.volatile ? 'gas' : 'residue'; bins[bin]![p.root] = p.massMg;
    } else {
      const top = p.phase === 'liquid' || p.zone === 'dissolved' ? BigInt(p.massMg) * 3n / 4n : 0n;
      bins.output![p.root] = Number(top); bins.residue![p.root] = p.massMg - Number(top);
    }
  }
  return bins;
}
function oracle(task: MaterialsMixturesTask): MaterialsMixturesResponse {
  const values: Record<string, string> = {}, actions: MatterAction[] = [];
  if (task.mode === 'materials') {
    for (const s of task.samples!) if (!['compare', 'property'].includes(task.skill)) values[`material:${s.id}`] = s.material;
    if (task.property) {
      const amounts = task.samples!.map(s => s[task.property!]), best = task.choose === 'min' ? Math.min(...amounts) : Math.max(...amounts);
      values.difference = String(Math.max(...amounts) - Math.min(...amounts));
      values.choice = task.samples!.filter(s => s[task.property!] === best).at(-1)!.id;
    }
    for (const o of task.observations ?? []) values[`property:${o.id}`] = o.property;
  }
  if (task.mode === 'levels') Object.assign(values, { object: 'object', material: 'material', substance: 'substance' });
  if (task.mode === 'state') for (const s of task.states!) {
    values[`state:${s.id}`] = s.phase; if (task.stateExperiment === 'compress') values[`change:${s.id}`] = s.phase === 'gas' ? 'smaller' : 'same'; actions.push(action(task, s.id, 'reshape'));
  }
  if (task.mode === 'phase') {
    const names: Record<string, string> = { 'solid/liquid': 'melting', 'liquid/solid': 'freezing', 'liquid/gas': 'evaporation', 'gas/liquid': 'condensation' };
    Object.assign(values, { before: task.phase!.before, after: task.phase!.after, change: names[`${task.phase!.before}/${task.phase!.after}`], mass: String(task.phase!.massMg) });
    actions.push({ ...action(task, 'water', 'phase'), phase: task.phase!.after });
  }
  if (task.mode === 'composition') for (const s of task.compositions!) {
    const species = new Set(s.substances.filter(p => p.count).map(p => p.name)).size;
    values[`species:${s.id}`] = String(species);
    values[`class:${s.id}`] = task.skill === 'pure' ? species === 1 ? 'pure' : 'mixture' : s.phases === 1 ? 'homogeneous' : 'heterogeneous';
  }
  if (task.mode === 'dissolve') {
    for (const t of task.trials!) {
      const dose = BigInt(t.doseMg), capacity = BigInt(t.capacityMg), dissolved = dose < capacity ? dose : capacity;
      values[`dissolved:${t.id}`] = String(dissolved); values[`left:${t.id}`] = String(dose - dissolved); values[`solvent:${t.id}`] = t.solvent;
      actions.push({ ...action(task, t.id, 'dissolve'), capacityMg: t.capacityMg });
    }
    const difference = BigInt(values['dissolved:a']!) - BigInt(values['dissolved:b']!);
    values.comparison = difference === 0n ? 'equal' : difference > 0n ? 'a' : 'b';
    if (task.skill === 'solution') Object.assign(values, { mixture: 'homogeneous', mass: String(task.trials![0]!.doseMg + task.trials![0]!.solventMg) });
  }
  if (task.mode === 'separate') for (const s of task.stations!) {
    const bins = stationOracle(s), target = bins[s.targetBin]![s.targetRoot] ?? 0;
    const initialTarget = s.initial.parcels.filter(p => p.root === s.targetRoot).reduce((n, p) => n + p.massMg, 0);
    const solvent = s.initial.parcels.find(p => p.phase === 'liquid')!, solute = s.initial.parcels.find(p => p.zone === 'dissolved');
    const output = bins[s.method === 'evaporate' ? 'gas' : 'output']!;
    Object.assign(values, { [`method:${s.id}`]: s.method, [`target:${s.id}`]: String(target), [`remaining:${s.id}`]: String(initialTarget - target),
      [`residue:${s.id}`]: String(Object.values(bins.residue!).reduce((sum, n) => sum + n, 0)), [`solvent:${s.id}`]: String(output[solvent.root] ?? 0), [`dissolved:${s.id}`]: String(solute ? output[solute.root] ?? 0 : 0),
      ...(s.method === 'decant' ? { [`sample:${s.id}`]: 'settled' } : {}) });
    actions.push({ ...action(task, s.id, s.method), poreUm: s.poreUm });
  }
  return { kind: 'materials-mixtures', mode: task.mode, values, actions, predictionsLocked: true,
    ...(task.review ? { review: { observations: Object.fromEntries(task.review.rubric.map(c => [c.id, 'met' as const])), confirmedByAdult: true, assistance: 'none' as const } } : {}) };
}
const independentTotals = (ledger: MatterLedger) => {
  const roots = new Map<string, bigint>();
  for (const v of ledger.vessels) for (const p of v.parcels) roots.set(p.root, (roots.get(p.root) ?? 0n) + BigInt(p.massMg));
  return [...roots].sort(([a], [b]) => a.localeCompare(b));
};

describe('materials and mixtures conserving domain', () => {
  it('covers the exact16 IDs, two families, changed transfer and ≥8 real input situations', () => {
    expect(materialsMixturesSpecs).toHaveLength(16);
    for (const spec of materialsMixturesSpecs) {
      const unique = new Set<string>(), families = new Set<string>();
      for (let seed = 1; seed <= 160; seed++) {
        const item = spec.item(rng(seed), 'independent'); families.add(item.tag);
        const { run: _run, setting: _setting, ...data } = item.task;
        unique.add(JSON.stringify(data));
      }
      expect(families.size, spec.id).toBe(2); expect(unique.size, spec.id).toBeGreaterThanOrEqual(8);
      expect(materialsMixturesEvidence[spec.id]!.families).toHaveLength(2);
      expect(spec.item(rng(2), 'transfer').tag).toBe('transfer');
      expect(spec.validRevs).toContain(spec.rev);
    }
  });
  it('same scientific givens have the same authored identity; new ledgers never carry prior clicks', () => {
    const spec = materialsMixturesSpecs.find(s => s.id === 'CHEM79-SUBSTANCE-01')!;
    const seen = new Map<string, ReturnType<typeof spec.item>>();
    let duplicates = 0;
    for (let seed = 0; seed < 160; seed++) {
      const item = spec.item(rng(seed), 'independent');
      const before = seen.get(item.task.run);
      if (before) { expect(itemIdentity(item)).toBe(itemIdentity(before)); duplicates++; }
      seen.set(item.task.run, item);
    }
    expect(duplicates).toBeGreaterThan(30);
    const experiment = materialsMixturesSpecs.find(s => s.id === 'CHEM79-SOLUTION')!.item(rng(4), 'independent').task;
    const answer = oracle(experiment), used = replayMatter(experiment, answer.actions), fresh = initialMatterLedger(experiment);
    expect(used.applied).toHaveLength(2); expect(fresh.applied).toEqual([]);
    expect(applyMatterAction(fresh, answer.actions[0]!).applied).toHaveLength(1);
    expect(applyMatterAction(fresh, { ...answer.actions[0]!, run: 'other-givens' })).toBe(fresh);
  });
  it('independent allocation oracle accepts all16, rejects wrong quantities/classes/actions, preserves identity at each operation', () => {
    for (const spec of materialsMixturesSpecs) for (const phase of options) for (let seed = 1; seed <= 64; seed++) {
      const task = spec.item(rng(seed), phase).task, answer = oracle(task);
      expect(checkMaterialsMixtures(task, answer), `${spec.id}/${seed}/${phase}`).toMatchObject({ ok: true });
      const after = replayMatter(task, answer.actions), before = initialMatterLedger(task);
      expect(independentTotals(after)).toEqual(independentTotals(before));
      for (const p of after.vessels.flatMap(v => v.parcels)) {
        const original = before.vessels.flatMap(v => v.parcels).find(x => x.root === p.root)!;
        expect(p.substance).toBe(original.substance); expect(p.massMg).toBeGreaterThan(0);
      }
      for (const wrong of wrongMaterialsMixturesResponses(task)) {
        // The adult fixture is explicit and never supplied by solution/reveal.
        expect(checkMaterialsMixtures(task, { ...wrong, review: answer.review }).ok).toBe(false);
      }
      for (const key of Object.keys(answer.values)) {
        const value = answer.values[key]!, numeric = /^\d+$/.test(value);
        const wrong = { ...answer, values: { ...answer.values, [key]: numeric ? String(BigInt(value) + 1n) : 'not-a-valid-class' } };
        expect(checkMaterialsMixtures(task, wrong).ok, key).toBe(false);
      }
      if (task.stations) for (const s of task.stations) {
        const bins = stationOracle(s);
        for (const [bin, roots] of Object.entries(bins)) {
          const actual = after.vessels.find(v => v.id === `${s.id}:${bin}`)?.parcels ?? [];
          for (const [root, expected] of Object.entries(roots)) expect(actual.filter(p => p.root === root).reduce((n, p) => n + p.massMg, 0)).toBe(expected);
        }
      }
    }
  });
  it('demonstration never supplies an adult confirmation, pending is neutral, helped and not-yet retain assessor provenance', () => {
    for (const spec of materialsMixturesSpecs) {
      const task = spec.item(rng(3), 'independent').task;
      if (!task.review) continue;
      expect(checkMaterialsMixtures(task, solutionMaterialsMixtures(task))).toMatchObject({ ok: false, pendingReview: true });
      const answer = oracle(task), criterion = task.review.rubric[0]!.id;
      expect(checkMaterialsMixtures(task, { ...answer, review: { ...answer.review!, confirmedByAdult: false } })).toMatchObject({ pendingReview: true });
      expect(checkMaterialsMixtures(task, { ...answer, review: { ...answer.review!, observations: {} } })).toMatchObject({ pendingReview: true });
      const helped = { ...answer, review: { ...answer.review!, assistance: 'helped' as const } };
      expect(checkMaterialsMixtures(task, helped)).toMatchObject({ ok: true, assisted: true, observedByAdult: true });
      expect(checkMaterialsMixtures(task, { ...helped, review: { ...helped.review, observations: { ...helped.review.observations, [criterion]: 'not-yet' } } })).toMatchObject({ ok: false, assisted: true, observedByAdult: true });
      const badValue = { ...helped, values: {} };
      expect(checkMaterialsMixtures(task, badValue)).toMatchObject({ ok: false, assisted: true, observedByAdult: true });
    }
  });
  it('retries, cross-run actions, pore boundary, dissolved residue, decant incompleteness and saturation are explicit', () => {
    const ledger: MatterLedger = { run: 'r', applied: [], vessels: [{ id: 'a', label: 'Sample', parcels: [
      { id: 'water', root: 'water', substance: 'Vesi', massMg: 1000, phase: 'liquid', zone: 'bulk', volatile: true },
      { id: 'sugar', root: 'sugar', substance: 'Sakkaroosi', massMg: 400, phase: 'solid', zone: 'bottom' },
    ] }] };
    const mix: MatterAction = { run: 'r', id: 'first', source: 'a', method: 'dissolve', target: 'out', residue: 'rest', capacityMg: 300 };
    const first = applyMatterAction(ledger, mix), second = applyMatterAction(first, { ...mix, id: 'second' });
    expect(first.vessels[0]!.parcels.filter(p => p.zone === 'dissolved').reduce((n, p) => n + p.massMg, 0)).toBe(300);
    expect(second.vessels[0]!.parcels.filter(p => p.zone === 'dissolved').reduce((n, p) => n + p.massMg, 0)).toBe(300);
    expect(applyMatterAction(first, mix)).toBe(first);
    expect(applyMatterAction(first, { ...mix, run: 'new' })).toBe(first);
    expect(applyMatterAction(ledger, { ...mix, capacityMg: -1 })).toBe(ledger);
    expect(applyMatterAction(ledger, { ...mix, source: 'missing' })).toBe(ledger);
    const filter = applyMatterAction(first, { ...mix, id: 'filter', method: 'filter', poreUm: 20 });
    expect(filter.vessels.find(v => v.id === 'out')!.parcels.filter(p => p.root === 'sugar').reduce((n, p) => n + p.massMg, 0)).toBe(400); // fine unspecified particles pass in this explicit model
    for (const [size, kept] of [[19, false], [20, false], [21, true]] as const) {
      const grains: MatterLedger = { run: 'r', applied: [], vessels: [{ id: 'a', label: 'Rae', parcels: [{ id: 'g', root: 'g', substance: 'Liukenematon rae', massMg: 80, phase: 'solid', zone: 'bulk', grainUm: size }] }] };
      const result = applyMatterAction(grains, { ...mix, id: 'f', method: 'filter', poreUm: 20 });
      expect(result.vessels.find(v => v.id === (kept ? 'rest' : 'out'))!.parcels[0]!.massMg).toBe(80);
    }
    const settled = applyMatterAction(first, { ...mix, id: 'settle', method: 'settle' });
    const poured = applyMatterAction(settled, { ...mix, id: 'pour', method: 'decant' });
    expect(poured.vessels.find(v => v.id === 'out')!.parcels.filter(p => p.root === 'sugar').reduce((n, p) => n + p.massMg, 0)).toBe(225);
    expect(poured.vessels.find(v => v.id === 'rest')!.parcels.filter(p => p.root === 'sugar').reduce((n, p) => n + p.massMg, 0)).toBe(175);
    const evaporated = applyMatterAction(first, { ...mix, id: 'evap', method: 'evaporate' });
    expect(evaporated.vessels.find(v => v.id === 'out')!.parcels[0]).toMatchObject({ root: 'water', massMg: 1000, phase: 'gas', zone: 'environment' });
    expect(parcelTotals(evaporated)).toEqual(parcelTotals(ledger));
    expect(mixtureNumber('1/0')).toBeUndefined(); expect(mixtureNumber('oma salainen lause')).toBeUndefined();
  });
  it('requires explicit lock, support and own answer/action keys, and rejects hostile malformed values', () => {
    const plain = materialsMixturesSpecs.find(s => s.id === 'CHEM79-DECANTING')!.item(rng(4), 'independent').task;
    const answer = oracle(plain);
    expect(checkMaterialsMixtures(plain, { ...answer, predictionsLocked: 1 as unknown as boolean }).ok).toBe(false);
    const inherited = Object.create(answer.values) as Record<string, string>;
    Object.keys(answer.values).forEach((_, i) => { inherited[`dummy${i}`] = '0'; });
    expect(checkMaterialsMixtures(plain, { ...answer, values: inherited }).ok).toBe(false);
    const copied = Object.create(answer.actions[0]) as MatterAction;
    Object.keys(answer.actions[0]!).forEach((_, i) => Object.defineProperty(copied, `dummy${i}`, { value: '0', enumerable: true }));
    expect(checkMaterialsMixtures(plain, { ...answer, actions: [copied] }).ok).toBe(false);
    for (const values of [null, {}, [], { ...answer.values, unknown: '0' }]) expect(checkMaterialsMixtures(plain, { ...answer, values } as MaterialsMixturesResponse).ok).toBe(false);
    const observed = materialsMixturesSpecs.find(s => s.id === 'CHEM79-SOLUTION')!.item(rng(4), 'independent').task;
    const review = oracle(observed);
    delete (review.review as Partial<NonNullable<MaterialsMixturesResponse['review']>>).assistance;
    expect(checkMaterialsMixtures(observed, review)).toMatchObject({ pendingReview: true, ok: false });
    const solution = replayMatter(observed, oracle(observed).actions);
    expect(solution.vessels.flatMap(v => v.parcels).filter(p => p.zone === 'dissolved').every(p => p.phase === 'solution')).toBe(true);
  });
  it('pure compounds, clear mixtures and equal-region emulsions have different meanings', () => {
    const find = (id: string) => materialsMixturesSpecs.find(s => s.id === id)!;
    const pure = find('CHEM79-PURE-MIX').item(rng(12), 'transfer').task;
    const response = oracle(pure), compound = pure.compositions!.find(s => s.substances.length === 1)!;
    expect(compound.substances[0]!.formula).toBe('H₂O'); expect(response.values[`class:${compound.id}`]).toBe('pure');
    const mix = pure.compositions!.find(s => s.substances.length > 1)!;
    expect(mix.clear).toBe(true); expect(response.values[`class:${mix.id}`]).toBe('mixture');
    const emulsion = find('CHEM79-MIX-HOM').item(rng(8), 'transfer').task, sample = emulsion.compositions!.find(s => s.phases === 2)!;
    expect(sample.regions[0]).toEqual(sample.regions[1]); expect(oracle(emulsion).values[`class:${sample.id}`]).toBe('heterogeneous');
  });
  it('homogeneous/emulsion/layer 3D marks preserve region shares without inventing mg', () => {
    const spec = materialsMixturesSpecs.find(s => s.id === 'CHEM79-MIX-HOM')!;
    for (const phase of options) for (let seed = 1; seed <= 24; seed++) {
      const task = spec.item(rng(seed), phase).task, scene = materialsMixturesScene(task)!;
      expect(scene.compositions).toEqual(task.compositions); expect(scene.vessels).toEqual([]);
      expect(JSON.stringify(scene)).not.toContain('massMg');
      const parent = new THREE.Group(), stage = mountMaterialsMixturesStage(parent, scene);
      const marks: { substance: string; modelShares: number; units: string }[] = [];
      parent.traverse((object: { name: string; userData: unknown }) => { if (object.name === 'qualitative-substance-symbol') marks.push(object.userData as typeof marks[number]); });
      const expected = task.compositions!.flatMap(s => s.regions.flatMap(region => region.flatMap((n, i) => n ? [{ substance: s.substances[i]!.name, modelShares: n, units: 'scale-free-model-shares' }] : [])));
      expect(marks).toEqual(expected); stage.dispose();
    }
    const pure = materialsMixturesSpecs.find(s => s.id === 'CHEM79-PURE-MIX')!.item(rng(7), 'independent').task;
    expect(materialsMixturesScene(pure)).toBeUndefined();
  });
  it('public scenes show only current mass parcels; renderer lifecycle retains numeric snapshots and disposes once', () => {
    const task = materialsMixturesSpecs.find(s => s.id === 'CHEM79-SEPARATE-02')!.item(rng(7), 'transfer').task;
    const initial = materialsMixturesScene(task)!, answer = oracle(task), final = materialsMixturesScene(task, answer)!;
    expect(initial.operated).toBe(0); expect(final.operated).toBe(3);
    expect(JSON.stringify(initial)).not.toMatch(/expected|review|capacityMg|targetRoot/);
    expect(initial.vessels).toHaveLength(3); expect(final.vessels.length).toBeGreaterThan(3);
    const parent = new THREE.Group(), stage = mountMaterialsMixturesStage(parent, final);
    expect(stage.snapshot().vessels).toEqual(final.vessels.map(v => ({ ...v, parcels: v.parcels.map(({ root, substance, massMg, phase, zone }) => ({ root, substance, massMg, phase, zone })) })));
    expect(parent.children).toHaveLength(1); stage.advanceTime(1000); stage.dispose(); stage.dispose(); expect(parent.children).toHaveLength(0);
  });
});
