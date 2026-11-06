import { describe, it, expect } from 'vitest';
import { reactionRecipes, reactionMaterialState, reactionEnergyState, reactionShapeArea, reactionRateReading, reactionExtentAt, type ReactionRateModel, type ReactionConfiguration } from '../src/content/models/reaction-lab';
const table: Record<string, {
    before: number;
    after: number;
    atoms: Record<string, number>;
}> = {
    'water-form': { before: 36, after: 36, atoms: { H: 4, O: 2 } }, 'water-split': { before: 36, after: 36, atoms: { H: 4, O: 2 } },
    peroxide: { before: 68, after: 68, atoms: { H: 4, O: 4 } }, carbon: { before: 44, after: 44, atoms: { C: 1, O: 2 } },
    carbonate: { before: 100, after: 100, atoms: { Ca: 1, C: 1, O: 3 } }, methane: { before: 80, after: 80, atoms: { C: 1, H: 4, O: 4 } },
    cellulose: { before: 354, after: 354, atoms: { C: 6, H: 10, O: 17 } }, magnesium: { before: 80, after: 80, atoms: { Mg: 2, O: 2 } }, ethanol: { before: 142, after: 142, atoms: { C: 2, H: 6, O: 7 } },
};
const rateModel: ReactionRateModel = { name: 'Testin annettu paikallinen malli', recipe: 'carbon', product: 'CO2', secondsMaximum: 30, baseRate: [1, 100], temperatures: [{ value: 20, factor: [1, 1] }, { value: 30, factor: [2, 1] }], concentrations: [{ value: 8, factor: [1, 1] }, { value: 16, factor: [2, 1] }], referenceArea: 96, referenceShape: [4, 4, 4], volumes: [10, 20], concentrationSpecies: 'O2', scope: 'Annetut opetuskertoimet.' };
const configuration: ReactionConfiguration = { temperatureC: 20, concentration: 8, shape: { width: 4, height: 4, depth: 4, cuts: [1, 1, 1] }, volumeUnits: 10, extentLimit: 8 };
describe('Reaction13 closed material and declared rate core', () => {
    it('preserves each independent stoichiometric inventory and rounded model mass at every completed extent', () => {
        for (const recipe of reactionRecipes)
            for (let groups = 1; groups <= 3; groups++) {
                const expected = table[recipe.id]!, before = reactionMaterialState(recipe, groups, 0, 2)!;
                expect(before.allInventory).toEqual(Object.fromEntries(Object.entries(expected.atoms).map(([s, n]) => [s, n * groups])));
                expect(before.totalMassMg).toBe(expected.before * groups * 2);
                for (let extent = 0; extent <= groups; extent++) {
                    const state = reactionMaterialState(recipe, groups, extent, 2)!;
                    expect(state.totalMassMg).toBe(expected.after * groups * 2);
                    expect(state.allInventory).toEqual(before.allInventory);
                    expect(new Set([...state.inside, ...state.outside].flatMap(s => s.atomIds))).toEqual(new Set(before.atoms.map(a => a.id)));
                }
            }
    });
    it('keeps escaped CO2 atoms outside the chamber and includes the receiving vessel initial quantity', () => {
        const recipe = reactionRecipes.find(r => r.id === 'carbonate')!;
        const state = reactionMaterialState(recipe, 4, 4, 1, { open: true, gasFormula: 'CO2', escapedGroups: 2 }, [], 1)!;
        expect(state.insideMassMg).toBe(312);
        expect(state.outsideMassMg).toBe(132);
        expect(state.totalMassMg).toBe(444);
        expect(state.insideInventory).toEqual({ Ca: 4, C: 2, O: 8 });
        expect(state.outsideInventory).toEqual({ C: 3, O: 6 });
        expect(state.atoms).toHaveLength(23);
        expect(new Set(state.outside.flatMap(u => u.atomIds)).size).toBe(9);
        expect(reactionMaterialState(recipe, 4, 4, 1, { open: false, gasFormula: 'CO2', escapedGroups: 1 })).toBeUndefined();
        expect(reactionMaterialState(recipe, 4, 1, 1, { open: true, gasFormula: 'CO2', escapedGroups: 2 })).toBeUndefined();
    });
    it('separates borrowed activation energy from net exothermic and endothermic transfer', () => {
        for (const recipe of reactionRecipes) {
            const before = reactionEnergyState(recipe, 0, false, false)!, active = reactionEnergyState(recipe, 0, true, false)!, end = reactionEnergyState(recipe, 3, true, true)!;
            expect(active.system - before.system).toBe(recipe.activation);
            expect(active.total).toBe(before.total);
            expect(end.system - before.system).toBe(3 * recipe.netEnergy);
            expect(end.surroundings - before.surroundings).toBe(-3 * recipe.netEnergy);
            expect(end.borrowedActivation).toBe(0);
            expect(end.total).toBe(before.total);
        }
    });
    it('counts exposed surfaces from the six faces of every separated equal-volume fragment', () => {
        for (const dims of [[4, 4, 4], [6, 4, 3]])
            for (let nx = 1; nx <= 4; nx++)
                for (let ny = 1; ny <= 4; ny++)
                    for (let nz = 1; nz <= 4; nz++) {
                        const [w, h, d] = dims as [
                            number,
                            number,
                            number
                        ], piece = [w / nx, h / ny, d / nz], count = nx * ny * nz;
                        const expected = count * 2 * (piece[0]! * piece[1]! + piece[0]! * piece[2]! + piece[1]! * piece[2]!);
                        const value = reactionShapeArea({ width: w, height: h, depth: d, cuts: [nx, ny, nz] })!;
                        expect(Number(value[0]) / Number(value[1])).toBeCloseTo(expected, 10);
                        expect(count * piece[0]! * piece[1]! * piece[2]!).toBeCloseTo(w * h * d, 10);
                    }
    });
    it('uses exact declared rate factors and conserves excess oxygen independently of endpoint yield', () => {
        for (let time = 0; time <= 30; time++) {
            const expected = Number(8n * (200n ** 3n - BigInt(Math.max(0, 200 - time)) ** 3n) / (200n ** 3n)), state = reactionRateReading(rateModel, configuration, 'A', time, 1)!;
            expect(state.extent).toBe(expected);
            expect(state.productMassMg).toBe(expected * 44);
            expect(state.insideMassMg).toBe(8 * 12 + 8 * 32);
            expect(state.outsideMassMg).toBe(0);
            expect(reactionExtentAt(rateModel, { ...configuration, temperatureC: 30, concentration: 16 }, time)).toBe(Number(8n * (200n ** 3n - BigInt(Math.max(0, 200 - time * 4)) ** 3n) / (200n ** 3n)));
        }
        const largerSameConcentration = reactionRateReading(rateModel, { ...configuration, volumeUnits: 20 }, 'B', 10, 1)!;
        expect(largerSameConcentration.productMassMg).toBe(44);
        expect(largerSameConcentration.insideMassMg).toBe(8 * 12 + 16 * 32);
    });
    it('rejects inherited geometry and zero denominators in declared factors', () => {
        expect(reactionShapeArea(Object.create(configuration.shape))).toBeUndefined();
        expect(reactionShapeArea({ ...configuration.shape, cuts: [0, 1, 1] })).toBeUndefined();
        expect(reactionExtentAt({ ...rateModel, baseRate: [1, 0] }, configuration, 10)).toBeUndefined();
        expect(reactionExtentAt(rateModel, configuration, -1)).toBeUndefined();
        expect(reactionEnergyState(reactionRecipes[0]!, 2, false, false)).toBeUndefined();
    });
});
describe('Reaction13 actual experimental protocols', () => {
    it('requires plan locking before actual runs and two separate source readings', async () => {
        const { replayReactionRate } = await import('../src/content/models/reaction-lab');
        const task = { kind: 'reaction-lab' as const, mode: 'rate' as const, title: 'test', run: 'rate-case', skill: 'temperature' as const, activity: 'control' as const, model: rateModel, initial: [configuration, configuration] as const, allowedFactors: ['temperature'] as const, interval: [0, 15] as const, cutOptions: [[1, 1, 1]] as const, massScaleMg: 1, question: 'test' };
        const actions = [{ type: 'configure' as const, trial: 'B', configuration: { ...configuration, temperatureC: 30 } }, { type: 'lock' as const, factor: 'temperature' as const, forecast: 'slower' as const }, { type: 'start' as const, trial: 'A' }, { type: 'sample' as const, trial: 'A' }, { type: 'advance' as const, trial: 'A', seconds: 15 }, { type: 'sample' as const, trial: 'A' }, { type: 'start' as const, trial: 'B' }, { type: 'sample' as const, trial: 'B' }, { type: 'advance' as const, trial: 'B', seconds: 15 }, { type: 'sample' as const, trial: 'B' }].map((a, i) => ({ ...a, id: `a${i + 1}`, run: task.run }));
        const replay = replayReactionRate(task, actions)!;
        expect(replay.locked).toBe(true);
        expect(replay.forecast).toBe('slower');
        expect(replay.trials.A.readings.map(r => [r.timeS, r.productMassMg])).toEqual([[0, 0], [15, 44]]);
        expect(replay.trials.B.readings.map(r => [r.timeS, r.productMassMg])).toEqual([[0, 0], [15, 132]]);
        expect(replayReactionRate(task, [actions[2]!])).toBeUndefined();
        expect(replayReactionRate(task, [...actions, actions[9]!])).toEqual(replay);
        expect(replayReactionRate(task, [...actions, { ...actions[9]!, trial: 'A' }])).toBeUndefined();
        expect(replayReactionRate(task, [...actions, { ...actions[0]!, id: 'a11' }])).toBeUndefined();
    });
    it('keeps an incorrect multi-factor setup observable but distinguishable from a controlled result', async () => {
        const { replayReactionRate, reactionChangedFactor } = await import('../src/content/models/reaction-lab');
        const both = { ...configuration, temperatureC: 30, concentration: 16 };
        const task = { kind: 'reaction-lab' as const, mode: 'rate' as const, title: 'test', run: 'confound-case', skill: 'factor' as const, activity: 'repair-confound' as const, model: rateModel, initial: [configuration, both] as const, allowedFactors: ['temperature', 'concentration'] as const, interval: [0, 15] as const, cutOptions: [[1, 1, 1]] as const, massScaleMg: 1, question: 'test' };
        const result = replayReactionRate(task, [{ id: 'a1', run: task.run, type: 'lock', factor: 'temperature', forecast: 'faster' }, { id: 'a2', run: task.run, type: 'start', trial: 'B' }, { id: 'a3', run: task.run, type: 'advance', trial: 'B', seconds: 15 }, { id: 'a4', run: task.run, type: 'sample', trial: 'B' }])!;
        expect(result.trials.B.readings).toHaveLength(1);
        expect(reactionChangedFactor(result.trials.A.configuration, result.trials.B.configuration)).toBeUndefined();
    });
    it('replays a real boundary transfer once and rejects cross-run, inherited and conflicting commands', async () => {
        const { replayReactionConservation } = await import('../src/content/models/reaction-lab');
        const task = { kind: 'reaction-lab' as const, mode: 'conservation' as const, title: 'test', run: 'mass-case', recipe: 'carbonate', groups: 4, boundary: { open: true, gasFormula: 'CO2', escapedGroups: 2 }, massScaleMg: 1, outsideInitialGroups: 1 };
        const actions = [{ id: 'a1', run: task.run, type: 'lock-conservation' as const, inside: '312', outside: '132', unit: 'mg' as const }, { id: 'a2', run: task.run, type: 'start' as const, trial: 'A' }, { id: 'a3', run: task.run, type: 'complete' as const, trial: 'A' }, { id: 'a4', run: task.run, type: 'boundary' as const, trial: 'A', open: true, gasFormula: 'CO2', groups: 2 }];
        const a = replayReactionConservation(task, actions)!;
        expect(a.state.totalMassMg).toBe(444);
        expect(a.state.insideMassMg).toBe(312);
        expect(a.state.outsideMassMg).toBe(132);
        expect(a.escapedGroups).toBe(2);
        expect(replayReactionConservation(task, [...actions, actions[3]!])).toEqual(a);
        expect(replayReactionConservation(task, [...actions, { ...actions[3]!, id: 'a5', groups: 3 }])).toBeUndefined();
        expect(replayReactionConservation(task, [...actions, { ...actions[3]!, groups: 1 }])).toBeUndefined();
        expect(replayReactionConservation(task, actions.map(x => ({ ...x, run: 'other' })))).toBeUndefined();
        expect(replayReactionConservation(task, actions.map(x => Object.create(x)))).toBeUndefined();
        let reads = 0;
        const getter = Object.defineProperty({ ...actions[3] }, 'groups', { enumerable: true, get() { reads++; return 2; } });
        expect(replayReactionConservation(task, [...actions.slice(0, 3), getter])).toBeUndefined();
        expect(reads).toBe(0);
    });
});
import { rng } from '../src/engine/rng';
import { reactionLabSpecs } from '../src/content/reaction-lab';
import { checkReactionLab, solutionReactionLab, wrongReactionLabResponses, reactionRecipe, type ReactionLabTask, type ReactionLabResponse, type ReactionAction } from '../src/content/models/reaction-lab';
import { reactionLabScene, debugReactionLabScene } from '../src/content/models/reaction-lab-scene';
// @ts-expect-error Runtime graph tests use the real Three.js package.
import * as THREE from 'three';
import { mountReactionLabStage, reactionFragmentDimensions } from '../src/world/reaction-lab-stage.js';
const compositions: Record<string, Record<string, number>> = { H2: { H: 2 }, O2: { O: 2 }, H2O: { H: 2, O: 1 }, H2O2: { H: 2, O: 2 }, C: { C: 1 }, CO2: { C: 1, O: 2 }, CH4: { C: 1, H: 4 } };
const weights: Record<string, number> = { H2: 2, O2: 32, H2O: 18, H2O2: 34, C: 12, CO2: 44, CaCO3: 100, CaO: 56, CH4: 16, Mg: 24, MgO: 40, C2H6O: 46, C6H10O5: 162 };
function observed(t: ReactionLabTask, a: ReactionLabResponse): ReactionLabResponse { return { ...a, ...(t.review ? { review: { observations: Object.fromEntries(t.review.rubric.map(r => [r.id, 'met' as const])), confirmedByAdult: true, assistance: 'none' as const } } : {}) }; }
function oracleExtent(model: ReactionRateModel, c: ReactionConfiguration, t: number) {
    const tf = model.temperatures.find(v => v.value === c.temperatureC)!.factor, cf = model.concentrations.find(v => v.value === c.concentration)!.factor;
    const n = BigInt(model.baseRate[0] * tf[0] * cf[0]), d = BigInt(model.baseRate[1] * tf[1] * cf[1]), volume = BigInt(c.shape.width * c.shape.height * c.shape.depth), remaining = [c.shape.width, c.shape.height, c.shape.depth].reduce((p, w, i) => p * (BigInt(w) * d - 2n * n * BigInt(t * c.shape.cuts[i]!) > 0n ? BigInt(w) * d - 2n * n * BigInt(t * c.shape.cuts[i]!) : 0n), 1n);
    return Number(BigInt(c.extentLimit) * (volume * d ** 3n - remaining) / (volume * d ** 3n));
}
function oracle(t: ReactionLabTask): ReactionLabResponse {
    const kind = 'reaction-lab' as const;
    switch (t.mode) {
        case 'change':
        case 'reaction': return { kind, mode: t.mode, rows: t.cases.map(c => { const added = c.after.filter(s => !c.before.some(b => b.id === s.id)); return { id: c.id, classification: c.identityEvidence === 'appearance-only' ? 'insufficient' : added.length ? 'chemical' : 'physical', newSubstances: c.identityEvidence === 'appearance-only' ? [] : added.map(s => s.id).reverse(), reason: c.identityEvidence === 'appearance-only' ? 'need-data' : added.length ? 'new-identity' : 'same-identity' }; }) };
        case 'roles': return { kind, mode: 'roles', rows: t.cases.flatMap(c => { const r = reactionRecipe(c.recipe)!; return [...r.products.map(s => ({ caseId: c.id, formula: s.formula, role: 'product' })), ...r.reactants.map(s => ({ caseId: c.id, formula: s.formula, role: 'reactant' }))]; }), placements: t.cases.map(c => { const r = reactionRecipe(c.recipe)!; return { caseId: c.id, before: r.reactants.map(s => s.formula).reverse(), after: r.products.map(s => s.formula).reverse() }; }) };
        case 'conservation': {
            const recipe = reactionRecipe(t.recipe)!, total = recipe.reactants.reduce((n, s) => n + weights[s.formula]! * s.coefficient, 0) * t.groups * t.massScaleMg + (t.boundary.gasFormula ? weights[t.boundary.gasFormula]! * t.outsideInitialGroups * t.massScaleMg : 0), outside = (t.outsideInitialGroups + t.boundary.escapedGroups) * (t.boundary.gasFormula ? weights[t.boundary.gasFormula]! : 0) * t.massScaleMg;
            const actions: ReactionAction[] = [{ type: 'lock-conservation', id: 'a1', run: t.run, inside: '1', outside: '1', unit: 'mg' }, { type: 'start', id: 'a2', run: t.run, trial: 'A' }, { type: 'complete', id: 'a3', run: t.run, trial: 'A' }];
            if (t.boundary.open)
                actions.push({ type: 'boundary', id: 'a4', run: t.run, trial: 'A', open: true, gasFormula: t.boundary.gasFormula, groups: t.boundary.escapedGroups });
            return { kind, mode: 'conservation', forecastInside: '1', forecastOutside: '1', predictionUnit: 'mg', locked: true, observed: true, actions, inside: `${total - outside}/1000`, outside: `${outside}/1000`, whole: `${total}/1000`, unit: 'g', reflection: 'revised' };
        }
        case 'rearrange': {
            const recipe = reactionRecipe(t.recipe)!, pool: {
                id: string;
                element: string;
            }[] = [];
            for (const s of recipe.reactants)
                for (let i = 0; i < s.coefficient * t.groups; i++)
                    for (const [element, n] of Object.entries(compositions[s.formula]!))
                        for (let j = 0; j < n; j++)
                            pool.push({ id: `R${pool.length + 1}`, element });
            const available = [...pool].reverse(), molecules: {
                id: string;
                formula: string;
                atomIds: string[];
            }[] = [], bonds: {
                a: string;
                b: string;
                order: number;
            }[] = [];
            for (const s of [...recipe.products].reverse())
                for (let i = 0; i < s.coefficient * t.groups; i++) {
                    const atoms: {
                        id: string;
                        element: string;
                    }[] = [];
                    for (const [element, n] of Object.entries(compositions[s.formula]!))
                        for (let j = 0; j < n; j++) {
                            const index = available.findIndex(a => a.element === element);
                            atoms.push(available.splice(index, 1)[0]!);
                        }
                    molecules.push({ id: `p${molecules.length + 1}`, formula: s.formula, atomIds: atoms.map(a => a.id) });
                    if (s.formula === 'H2' || s.formula === 'O2')
                        bonds.push({ a: atoms[1]!.id, b: atoms[0]!.id, order: s.formula === 'H2' ? 1 : 2 });
                    else {
                        const center = atoms.find(a => a.element === (s.formula === 'H2O' ? 'O' : 'C'))!;
                        for (const a of atoms.filter(a => a !== center))
                            bonds.push({ a: a.id, b: center.id, order: s.formula === 'CO2' ? 2 : 1 });
                    }
                }
            const inventory = Object.fromEntries([...new Set(pool.map(a => a.element))].map(s => [s, pool.filter(a => a.element === s).length]));
            return { kind, mode: 'rearrange', molecules, bonds, beforeAtoms: inventory, afterAtoms: { ...inventory } };
        }
        case 'energy': return { kind, mode: 'energy', rows: t.cases.map(c => { const r = reactionRecipe(c.recipe)!, difference = r.netEnergy * c.extents; return { id: c.id, systemChange: `${difference * 3}/3`, surroundingsChange: String(-difference), activation: String(r.activation), direction: difference < 0 ? 'out' : 'in', term: difference < 0 ? 'exothermic' : 'endothermic' }; }) };
        case 'rate': {
            const dataOnly = !!t.givenReadings, actions: ReactionAction[] = [];
            let plan: Extract<ReactionLabResponse, {
                mode: 'rate';
            }>['plan'];
            if (!dataOnly) {
                const a = t.initial[0], factor = t.allowedFactors[0]!, b = { ...a, shape: { ...a.shape } };
                if (factor === 'temperature')
                    b.temperatureC = 30;
                if (factor === 'concentration')
                    b.concentration = 16;
                if (factor === 'surface')
                    b.shape.cuts = [2, 2, 2];
                plan = { factor, configurations: [a, b], forecast: 'slower' };
                actions.push({ type: 'configure', id: 'a1', run: t.run, trial: 'B', configuration: b }, { type: 'lock', id: 'a2', run: t.run, factor, forecast: 'slower' });
                const add = (a: object) => actions.push({ ...a, id: `a${actions.length + 1}`, run: t.run } as ReactionAction);
                for (const trial of ['A', 'B']) {
                    add({ type: 'start', trial });
                    if (t.interval[0])
                        add({ type: 'advance', trial, seconds: t.interval[0] });
                    add({ type: 'sample', trial });
                    add({ type: 'advance', trial, seconds: t.interval[1] - t.interval[0] });
                    add({ type: 'sample', trial });
                }
            }
            const readings = ['A', 'B'].flatMap((trial, i) => t.interval.map(timeS => { const c = plan?.configurations[i] ?? t.initial[i]!, extent = oracleExtent(t.model, c, timeS), coefficient = reactionRecipe(t.model.recipe)!.products.find(s => s.formula === t.model.product)!.coefficient; return { trial, timeS, productMass: String(extent * weights[t.model.product]! * coefficient * t.massScaleMg), unit: 'mg' }; })), delta = [Number(readings[1]!.productMass) - Number(readings[0]!.productMass), Number(readings[3]!.productMass) - Number(readings[2]!.productMass)] as const, duration = t.interval[1] - t.interval[0], relation = delta[1] > delta[0] ? 'faster' : delta[1] < delta[0] ? 'slower' : 'same';
            return { kind, mode: 'rate', ...(plan ? { plan } : {}), actions, readings: readings.reverse(), delta: [`${delta[0]}/1000`, `${delta[1]}/1000`], duration: String(duration), quantityUnit: 'g', rates: [`${delta[0]}/${duration * 1000}`, `${delta[1]}/${duration * 1000}`], rateUnit: 'g/s', relation, yieldRelation: t.skill === 'compare' ? (t.initial[1].extentLimit > t.initial[0].extentLimit ? 'more' : t.initial[1].extentLimit < t.initial[0].extentLimit ? 'less' : 'same') : '', reflection: dataOnly ? 'data-only' : relation === 'slower' ? 'confirmed' : 'revised', boundaryScope: dataOnly ? 'given-window' : 'model-only' };
        }
    }
}
describe('Reaction13 independent authored answers and response boundary', () => {
    it('accepts independent inventories, alternate atom assignments, g conversions and revised predictions in every family and transfer', () => {
        for (const spec of reactionLabSpecs)
            for (const phase of ['independent', 'transfer'] as const)
                for (let seed = 0; seed < 48; seed++) {
                    const task = spec.item(rng(seed), phase).task as unknown as ReactionLabTask, answer = observed(task, oracle(task));
                    expect(checkReactionLab(task, answer), `${spec.id}/${phase}/${seed}`).toMatchObject({ ok: true });
                    expect(checkReactionLab(task, observed(task, solutionReactionLab(task))), `demo ${spec.id}/${seed}`).toMatchObject({ ok: true });
                    for (const wrong of wrongReactionLabResponses(task))
                        expect(checkReactionLab(task, wrong).ok, `${spec.id}/wrong/${seed}`).toBe(false);
                }
    });
    it('needs an adult before either correct or incorrect mathematics, preserving help and never accepting inherited review', () => {
        for (const spec of reactionLabSpecs) {
            const t = spec.item(rng(2), 'independent').task as unknown as ReactionLabTask, a = oracle(t), wrong = wrongReactionLabResponses(t)[0]!;
            expect(checkReactionLab(t, a).pendingReview).toBe(true);
            expect(checkReactionLab(t, { ...wrong, review: undefined }).pendingReview).toBe(true);
            const complete = observed(t, wrong);
            expect(checkReactionLab(t, { ...complete, review: { ...complete.review!, assistance: 'helped' } })).toMatchObject({ ok: false, assisted: true, observedByAdult: true });
            expect(checkReactionLab(t, { ...complete, review: Object.create(complete.review!) }).pendingReview).toBe(true);
            expect(checkReactionLab(t, { ...complete, review: { ...complete.review!, assistance: undefined } }).pendingReview).toBe(true);
        }
    });
    it('rejects unknown keys, sparse collections and accessors without invoking them', () => {
        let calls = 0;
        for (const spec of reactionLabSpecs) {
            const t = spec.item(rng(1), 'independent').task as unknown as ReactionLabTask, a = observed(t, oracle(t));
            expect(checkReactionLab(t, { ...a, prose: 'private' }).ok).toBe(false);
            expect(checkReactionLab(t, Object.create(a)).ok).toBe(false);
            expect(checkReactionLab(t, { ...a, get mode() { calls++; return a.mode; } }).ok).toBe(false);
            if (a.mode === 'rate')
                expect(checkReactionLab(t, { ...a, actions: new Array(3) }).ok).toBe(false);
        }
        expect(calls).toBe(0);
    });
    it('offers at least eight meaningful source situations and both families with deterministic seeds', () => {
        for (const spec of reactionLabSpecs) {
            const seen = new Set(), tags = new Set();
            for (let seed = 0; seed < 160; seed++) {
                const item = spec.item(rng(seed), 'independent'), t = item.task as unknown as ReactionLabTask;
                seen.add(t.run);
                tags.add(item.tag);
                expect(spec.item(rng(seed), 'independent').task).toEqual(item.task);
            }
            expect(seen.size, spec.id).toBeGreaterThanOrEqual(8);
            expect(tags.size, spec.id).toBe(2);
        }
    });
    it('keeps sampled current data and all future observations out of public pre-read projections', () => {
        for (const spec of reactionLabSpecs)
            for (let seed = 0; seed < 8; seed++) {
                const t = spec.item(rng(seed), 'independent').task as unknown as ReactionLabTask, scene = reactionLabScene(t);
                if (!scene)
                    continue;
                const text = JSON.stringify(debugReactionLabScene(scene));
                expect(text).not.toContain('insideMassMg');
                expect(text).not.toContain('reacted');
                if (t.mode === 'rate') {
                    const a = oracle(t);
                    if (a.mode !== 'rate')
                        continue;
                    const beforeSample = { ...a, actions: a.actions.filter(action => action.type !== 'sample') };
                    const observedScene = reactionLabScene(t, beforeSample)!;
                    expect(observedScene.observed).toBe(true);
                    expect(JSON.stringify(debugReactionLabScene(observedScene))).not.toContain('insideMassMg');
                }
            }
    });
    it('draws actual fragments with conserved initial volume and area then an extent-matched remaining volume', () => {
        for (const dimensions of [[4, 4, 4], [6, 4, 3]])
            for (const cuts of [[1, 1, 1], [2, 2, 2], [2, 3, 2]])
                for (let extent = 0; extent <= 8; extent++) {
                    const [width, height, depth] = dimensions as [
                        number,
                        number,
                        number
                    ], shape = { width, height, depth, cuts: cuts as [
                            number,
                            number,
                            number
                        ] }, d = reactionFragmentDimensions(shape, extent, 8), count = cuts.reduce((a, b) => a * b, 1);
                    expect(d.reduce((a, b) => a * b, 1) * count).toBeCloseTo(width * height * depth * (1 - extent / 8), 9);
                }
        const spec = reactionLabSpecs.find(s => s.id === 'CHEM79-RATE-SURF')!, t = spec.item(rng(1), 'independent').task as unknown as ReactionLabTask, scene = reactionLabScene(t)!, parent = new THREE.Group(), stage = mountReactionLabStage(parent, scene), atoms: string[] = [];
        parent.traverse((o: any) => {
            if (o.name === 'conserved-reaction-atom')
                atoms.push(o.userData.id);
        });
        expect(new Set(atoms).size).toBe(atoms.length);
        expect(atoms.length).toBe(scene.vessels.reduce((n, v) => n + v.state.atoms.length, 0));
        stage.advanceTime(9000);
        expect(stage.snapshot().elapsedMs).toBe(8000);
        stage.dispose();
        stage.dispose();
        expect(parent.children).toHaveLength(0);
    });
});
it('retains the exact original atom identities in before and learner-rearranged Three graphs', () => {
    for (const spec of reactionLabSpecs.filter(s => s.id === 'CHEM79-REACTION-MODEL'))
        for (let seed = 0; seed < 16; seed++) {
            const task = spec.item(rng(seed), 'independent').task as ReactionLabTask, answer = oracle(task);
            const before = reactionLabScene(task)!, after = reactionLabScene(task, answer)!;
            const identities: string[][] = [];
            for (const scene of [before, after]) {
                const parent = new THREE.Group(), stage = mountReactionLabStage(parent, scene), ids: string[] = [];
                parent.traverse((node: any) => { if (node.name === 'conserved-reaction-atom')
                    ids.push(node.userData.id); });
                identities.push(ids.sort());
                stage.dispose();
                expect(parent.children.length).toBe(0);
            }
            expect(identities[1]).toEqual(identities[0]);
            expect(new Set(identities[0]).size).toBe(before.vessels[0]!.state.atoms.length);
        }
});

it('keeps the boundary valve tied to the actual transfer even with initial gas in the receiving vessel',()=>{
 const spec=reactionLabSpecs.find(s=>s.id==='CHEM79-MATTER-CONS')!;
 for(let seed=0;seed<16;seed++){
  const task=spec.item(rng(seed),'transfer').task as ReactionLabTask,answer=oracle(task),before=reactionLabScene(task)!,after=reactionLabScene(task,answer)!;
  for(const [scene,closed]of [[before,true],[after,false]] as const){const parent=new THREE.Group(),stage=mountReactionLabStage(parent,scene),ids:string[]=[],valves:any[]=[];parent.traverse((node:any)=>{if(node.name==='conserved-reaction-atom')ids.push(node.userData.id);if(node.name==='closed-boundary-valve')valves.push(node);});expect(valves.length).toBe(closed?1:0);expect(new Set(ids).size).toBe(scene.vessels[0]!.state.atoms.length);stage.dispose();}
  expect(after.vessels[0]!.state.totalMassMg).toBe(before.vessels[0]!.state.totalMassMg);
 }
 expect(reactionFragmentDimensions({width:4,height:4,depth:4,cuts:[0,1,1]},0,8)).toEqual([]);
 expect(reactionFragmentDimensions({width:4,height:4,depth:4,cuts:[1,1,1]},9,8)).toEqual([]);
});

it('provides an observable controlled rate difference rather than a late-window depletion tie',()=>{
 for(const spec of reactionLabSpecs.filter(s=>/^CHEM79-RATE-(FACTOR|TEMP|CONC|SURF)$/.test(s.id)))for(const phase of ['independent','transfer'] as const)for(let seed=0;seed<64;seed++){
  const task=spec.item(rng(seed),phase).task as ReactionLabTask,answer=oracle(task);if(answer.mode!=='rate')throw new Error('rate fixture');expect(answer.relation,`${spec.id}/${phase}/${seed}`).toBe('faster');
 }
});
