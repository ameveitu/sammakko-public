import { expect, it } from 'vitest';
import { rng } from '../src/engine/rng';
import { reactionLabSpecs } from '../src/content/reaction-lab';
import { checkReactionLab, reactionRecipes, reactionMaterialState, reactionEnergyState, reactionRateReading, reactionShapeArea, replayReactionRate, replayReactionConservation, solutionReactionLab, type ReactionLabTask, type ReactionLabResponse } from '../src/content/models/reaction-lab';
import { reactionLabScene, debugReactionLabScene } from '../src/content/models/reaction-lab-scene';
import { peerReactionAnswer, peerMass, peerInventory, peerExtent, peerConfigurations } from './reaction-independent-peer-fixtures';
const recipes = new Map(reactionRecipes.map(r => [r.id, r]));
const taskFor = (id: string, seed = 0, phase: 'independent' | 'transfer' = 'independent') => reactionLabSpecs.find(s => s.id === id)!.item(rng(seed), phase).task as ReactionLabTask;
function wrongAnswer(r: ReactionLabResponse): ReactionLabResponse {
    switch (r.mode) {
        case 'change': case 'reaction': return { ...r, rows: r.rows.map((v, i) => i ? v : { ...v, classification: 'invented' }) };
        case 'roles': return { ...r, placements: [] };
        case 'conservation': return { ...r, whole: '999999' };
        case 'rearrange': return { ...r, molecules: r.molecules.map((m, i) => i ? m : { ...m, atomIds: [] }) };
        case 'energy': return { ...r, rows: r.rows.map((v, i) => i ? v : { ...v, systemChange: '999999' }) };
        case 'rate': return { ...r, duration: '0' };
    }
}
it('peer independently constructs 2496 answers with alternative row/atom ordering and exact g fractions', () => {
    let tested = 0;
    for (const spec of reactionLabSpecs) for (const phase of ['independent', 'transfer'] as const) for (let seed = 0; seed < 96; seed++) {
        const t = taskFor(spec.id, seed, phase), r = peerReactionAnswer(t, recipes);
        expect(checkReactionLab(t, r), `${spec.id}/${phase}/${seed}`).toMatchObject({ ok: true, observedByAdult: true });
        expect(checkReactionLab(t, wrongAnswer(r)).ok).toBe(false);
        expect(checkReactionLab(t, { ...r, review: { ...r.review!, assistance: 'helped' } })).toMatchObject({ ok: true, assisted: true, observedByAdult: true });
        expect(checkReactionLab(t, { ...wrongAnswer(r), review: { ...r.review!, assistance: 'helped' } })).toMatchObject({ ok: false, assisted: true, observedByAdult: true });
        expect(checkReactionLab(t, { ...wrongAnswer(r), review: undefined })).toMatchObject({ ok: false, pendingReview: true });
        tested++;
    }
    expect(tested).toBe(2496);
});
it('peer checks every stoichiometric atom and relative mass through partial/open-boundary ledgers', () => {
    let states = 0;
    for (const recipe of reactionRecipes) for (let groups = 1; groups <= 4; groups++) for (let extent = 0; extent <= groups; extent++) {
        expect(peerInventory(recipe.products)).toEqual(peerInventory(recipe.reactants));
        const gas = recipe.products.find(p => p.phase === 'gas');
        for (const outsideInitial of gas ? [0, 2] : [0]) for (let escaped = 0; escaped <= (gas ? extent * gas.coefficient : 0); escaped++) {
            const state = reactionMaterialState(recipe, groups, extent, 3, { open: escaped > 0, gasFormula: gas?.formula ?? null, escapedGroups: escaped }, [], outsideInitial)!;
            expect(state).toBeDefined();
            const initial = recipe.reactants.reduce((n, s) => n + peerMass(s.formula) * s.coefficient * groups, 0);
            const outside = gas ? peerMass(gas.formula) * (escaped + outsideInitial) : 0;
            expect(state.totalMassMg).toBe((initial + (gas ? peerMass(gas.formula) * outsideInitial : 0)) * 3);
            expect(state.outsideMassMg).toBe(outside * 3);
            expect(state.insideMassMg + state.outsideMassMg).toBe(state.totalMassMg);
            const assigned = [...state.inside, ...state.outside].flatMap(u => u.atomIds);
            expect(assigned.length).toBe(state.atoms.length); expect(new Set(assigned).size).toBe(state.atoms.length);
            const actual: Record<string, number> = {};
            for (const a of state.atoms) actual[a.element] = (actual[a.element] ?? 0) + 1;
            const expected = peerInventory(recipe.reactants, groups);
            if (gas) for (const [element, n] of Object.entries(peerInventory([{ ...gas, coefficient: 1 }], outsideInitial))) expected[element] = (expected[element] ?? 0) + n;
            expect(actual).toEqual(expected); states++;
        }
    }
    expect(states).toBeGreaterThan(300);
});
it('peer uses energy conservation with arbitrary initial reservoirs and separates temporary loan from net transfer', () => {
    for (const recipe of reactionRecipes) for (let extent = 0; extent <= 4; extent++) for (const started of [false, true]) {
        if (!started && extent) continue;
        for (const complete of started ? [false, true] : [false]) {
            const state = reactionEnergyState(recipe, extent, started, complete, 631, 907)!;
            const loan = started && !complete ? recipe.activation : 0;
            expect(state.system).toBe(631 + loan + extent * recipe.netEnergy);
            expect(state.surroundings).toBe(907 - loan - extent * recipe.netEnergy);
            expect(state.total).toBe(1538);
        }
    }
});
it('peer face-edge-corner oracle checks 0–20 s across all three factors, every cut and unchanged temperature', () => {
    let readings = 0;
    for (const id of ['CHEM79-RATE-TEMP', 'CHEM79-RATE-CONC', 'CHEM79-RATE-SURF']) for (let seed = 0; seed < 16; seed++) {
        const t = taskFor(id, seed, 'transfer'); if (t.mode !== 'rate') throw Error('rate');
        const a = t.initial[0];
        for (const temperature of t.model.temperatures) for (const concentration of t.model.concentrations) for (const cuts of t.cutOptions) {
            const c = { ...a, temperatureC: temperature.value, concentration: concentration.value, shape: { ...a.shape, cuts } };
            const [w, h, d] = [c.shape.width, c.shape.height, c.shape.depth], [nx, ny, nz] = cuts;
            const area = reactionShapeArea(c.shape)!;
            expect(area[0]).toBe(BigInt(2 * (w * h * nz + w * d * ny + h * d * nx)) * area[1]);
            for (let time = 0; time <= 20; time++) {
                const value = reactionRateReading(t.model, c, 'A', time, t.massScaleMg)!;
                expect(value.extent).toBe(peerExtent(t.model, c, time));
                const r = recipes.get(t.model.recipe)!, product = r.products.find(p => p.formula === t.model.product)!;
                expect(value.productMassMg).toBe(peerExtent(t.model, c, time) * peerMass(product.formula) * product.coefficient * t.massScaleMg);
                expect(c.temperatureC).toBe(temperature.value); expect(value.outsideMassMg).toBe(0); readings++;
            }
        }
    }
    expect(readings).toBe(64512);
}, 60_000);
it('peer rejects fictitious samples, stale runs, changed locked predictions, confounds and nonconserved initial amounts', () => {
    for (let seed = 0; seed < 32; seed++) {
        const t = taskFor('CHEM79-RATE-SURF', seed), r = peerReactionAnswer(t, recipes); if (t.mode !== 'rate' || r.mode !== 'rate') throw Error('rate');
        expect(checkReactionLab(t, { ...r, actions: r.actions.filter(a => a.type !== 'sample') }).ok).toBe(false);
        expect(checkReactionLab(t, { ...r, actions: r.actions.map((a, i) => i ? a : { ...a, run: 'other-run' }) }).ok).toBe(false);
        expect(checkReactionLab(t, { ...r, plan: { ...r.plan!, forecast: 'faster' } }).ok).toBe(false);
        const confounded = structuredClone(r); confounded.plan!.configurations[1].temperatureC = 30;
        confounded.actions = confounded.actions.map(a => a.type === 'configure' ? { ...a, configuration: confounded.plan!.configurations[1] } : a);
        expect(checkReactionLab(t, confounded).ok).toBe(false);
        const changed = structuredClone(r); changed.plan!.configurations[1].extentLimit++;
        changed.actions = changed.actions.map(a => a.type === 'configure' ? { ...a, configuration: changed.plan!.configurations[1] } : a);
        expect(checkReactionLab(t, changed).ok).toBe(false);
        const replay = replayReactionRate(t, r.actions)!;
        expect(replayReactionRate(t, [...r.actions, structuredClone(r.actions[0]!)])).toEqual(replay);
        expect(replayReactionRate(t, [...r.actions, { ...r.actions[0]!, trial: 'A' }])).toBeUndefined();
    }
});
it('peer requires explicit adult confirmation for every own explanation and never accepts a revealed model as observation', () => {
    for (const spec of reactionLabSpecs) {
        const t = taskFor(spec.id), r = peerReactionAnswer(t, recipes), id = t.review!.rubric[0]!.id;
        expect(checkReactionLab(t, solutionReactionLab(t))).toMatchObject({ ok: false, pendingReview: true });
        for (const review of [{ ...r.review!, confirmedByAdult: false }, { ...r.review!, assistance: undefined }, { ...r.review!, observations: { ...r.review!.observations, [id]: 'unobserved' } }, Object.create(r.review!)]) expect(checkReactionLab(t, { ...r, review })).toMatchObject({ ok: false, pendingReview: true });
        expect(checkReactionLab(t, { ...r, review: { ...r.review!, observations: { ...r.review!.observations, [id]: 'not-yet' } } })).toMatchObject({ ok: false, observedByAdult: true });
        const withSerializer = structuredClone(r); const values = 'rows' in withSerializer ? withSerializer.rows : 'actions' in withSerializer ? withSerializer.actions : withSerializer.molecules;
        Object.defineProperty(values, 'toJSON', { value: () => ['PRIVATE'] });
        expect(checkReactionLab(t, withSerializer).ok).toBe(false);
        expect(checkReactionLab(t, Object.create(r)).ok).toBe(false);
    }
});
it('peer diagnostics expose sampled readings only and rendering time never advances a scientific experiment', () => {
    const t = taskFor('CHEM79-RATE-TEMP', 4), r = peerReactionAnswer(t, recipes); if (t.mode !== 'rate' || r.mode !== 'rate') throw Error('rate');
    const initial = reactionLabScene(t)!;
    const actions = r.actions.filter(a => a.type !== 'sample');
    const advanced = reactionLabScene(t, { ...r, actions })!;
    const serialized = JSON.stringify(debugReactionLabScene(advanced));
    expect(serialized).not.toContain('MassMg'); expect(serialized).not.toContain('reacted'); expect(advanced.vessels.every(v => !v.sampled)).toBe(true);
    const sampled = reactionLabScene(t, r)!;
    expect(JSON.stringify(debugReactionLabScene(sampled))).toContain('totalMassMg');
    expect(initial.vessels.map(v => v.timeS)).toEqual([0, 0]);
    const configs = peerConfigurations(t);
    expect(configs[0].temperatureC).toBe(t.initial[0].temperatureC);
});
it('peer open-boundary transfer needs an actual gas move and preserves a deliberately incorrect initial prediction', () => {
    for (let seed = 0; seed < 32; seed++) {
        const t = taskFor('CHEM79-MATTER-CONS', seed, 'transfer'), r = peerReactionAnswer(t, recipes); if (r.mode !== 'conservation' || t.mode !== 'conservation') throw Error('conservation');
        expect(replayReactionConservation(t, r.actions)!.prediction).toEqual({ inside: '0', outside: '0', unit: 'mg' });
        expect(checkReactionLab(t, { ...r, reflection: 'confirmed' }).ok).toBe(false);
        expect(checkReactionLab(t, { ...r, actions: r.actions.filter(a => a.type !== 'boundary') }).ok).toBe(false);
    }
});
