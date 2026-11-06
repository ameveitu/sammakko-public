import { atomicOwn, atomicDense } from './atomic-world';
import { reactionRecipe, reactionMaterialState, reactionRateReading, replayReactionConservation, replayReactionRate, type ReactionLabTask, type ReactionLabResponse, type ReactionMaterialState, type ReactionShape, type ReactionConfiguration } from './reaction-lab';
export interface ReactionSceneVessel {
    id: string;
    label: string;
    state: ReactionMaterialState;
    configuration?: ReactionConfiguration;
    shape?: ReactionShape;
    reacted: number;
    limit: number;
    timeS: number;
    sampled: boolean;
    boundaryOpen?: boolean;
}
export interface ReactionLabScene {
    kind: 'reaction-lab';
    title: string;
    mode: 'material' | 'rearrange' | 'rate';
    phase: 'given' | 'forecast' | 'observed';
    observed: boolean;
    motionMs: number;
    vessels: readonly ReactionSceneVessel[];
    learnerGroups: readonly {
        id: string;
        atomIds: readonly string[];
    }[];
    learnerBonds: readonly {
        a: string;
        b: string;
        order: number;
    }[];
    legend: string;
}
export function reactionLabScene(task: ReactionLabTask, response?: ReactionLabResponse): ReactionLabScene | undefined {
    const common = { kind: 'reaction-lab' as const, title: task.title, legend: 'Värilliset osat ja sidokset ovat annettuja mallimerkkejä. Atomitunnus säilyy. Kammio ja keräysastia kuuluvat samaan koko ainekirjaan.', motionMs: 0, learnerGroups: [], learnerBonds: [] };
    if (task.mode === 'conservation') {
        const replay = response?.mode === 'conservation' ? replayReactionConservation(task, response.actions) : undefined;
        const state = replay?.state ?? reactionMaterialState(reactionRecipe(task.recipe)!, task.groups, 0, task.massScaleMg, { open: false, gasFormula: task.boundary.gasFormula, escapedGroups: 0 }, [], task.outsideInitialGroups);
        if (!state)
            return;
        return { ...common, mode: 'material', phase: replay?.observed ? 'observed' : replay?.locked ? 'forecast' : 'given', observed: replay?.observed ?? false, motionMs: replay?.observed ? 2400 : 0, vessels: [{ id: 'A', label: 'Reaktiokammio ja keräysastia', state, reacted: state.extent, limit: task.groups, timeS: 0, sampled: replay?.observed ?? false, boundaryOpen: !!replay && replay.escapedGroups > 0 }] };
    }
    if (task.mode === 'rearrange') {
        const state = reactionMaterialState(reactionRecipe(task.recipe)!, task.groups, 0, task.massScaleMg);
        if (!state)
            return;
        const atomIds = state.atoms.map(a => a.id), groups = response?.mode === 'rearrange' && atomicDense(response.molecules, 32) ? response.molecules.filter(m => atomicOwn(m, ['id', 'formula', 'atomIds']) && atomicDense(m.atomIds, 32) && m.atomIds.every(id => typeof id === 'string' && atomIds.includes(id))) : [];
        const bonds = response?.mode === 'rearrange' && atomicDense(response.bonds, 64) ? response.bonds.filter(b => atomicOwn(b, ['a', 'b', 'order']) && atomIds.includes(b.a) && atomIds.includes(b.b) && Number.isSafeInteger(b.order) && b.order >= 1 && b.order <= 3) : [];
        return { ...common, mode: 'rearrange', phase: groups.some(g => g.atomIds.length) ? 'observed' : 'given', observed: groups.some(g => g.atomIds.length > 0), vessels: [{ id: 'A', label: 'Alkuperäiset atomit', state, reacted: 0, limit: task.groups, timeS: 0, sampled: false }], learnerGroups: groups.map(g => ({ id: g.id, atomIds: g.atomIds })), learnerBonds: bonds };
    }
    if (task.mode === 'rate' && ['temperature', 'concentration', 'surface'].includes(task.skill)) {
        const replay = response?.mode === 'rate' ? replayReactionRate(task, response.actions) : undefined, recipe = reactionRecipe(task.model.recipe);
        if (!recipe)
            return;
        const vessels: ReactionSceneVessel[] = [];
        for (const [i, id] of (['A', 'B'] as const).entries()) {
            const trial = replay?.trials[id], configuration = trial?.configuration ?? task.initial[i]!, timeS = trial?.timeS ?? 0;
            const reading = reactionRateReading(task.model, configuration, id, timeS, task.massScaleMg);
            if (!reading)
                return;
            const oxygen = recipe.reactants.find(s => s.formula === task.model.concentrationSpecies)!, excess = configuration.concentration * configuration.volumeUnits / 10 - configuration.extentLimit * oxygen.coefficient;
            const state = reactionMaterialState(recipe, configuration.extentLimit, reading.extent, task.massScaleMg, undefined, excess ? [{ ...oxygen, coefficient: excess }] : []);
            if (!state)
                return;
            vessels.push({ id, label: `Koe ${id}`, state, configuration, shape: configuration.shape, reacted: reading.extent, limit: configuration.extentLimit, timeS, sampled: !!trial?.readings.some(r => r.timeS === timeS) });
        }
        const observed = !!replay && vessels.some(v => v.timeS > 0);
        return { ...common, mode: 'rate', phase: observed ? 'observed' : replay?.locked ? 'forecast' : 'given', observed, motionMs: observed ? 2400 : 0, vessels, legend: `${common.legend} Kiinteän mallipalan pinta vetäytyy paikallisen opetusoletuksen mukaan. Reagoivan palan määrä ja koko suljetun järjestelmän massa ovat eri suureita.` };
    }
    return;
}
/** Public diagnostics expose only givens and measurements the learner has actually sampled. */
export function debugReactionLabScene(scene: ReactionLabScene): unknown {
    return { kind: scene.kind, title: scene.title, mode: scene.mode, phase: scene.phase, observed: scene.observed, vessels: scene.vessels.map(v => ({ id: v.id, label: v.label, timeS: v.timeS, sampled: v.sampled, ...(v.configuration ? { configuration: v.configuration } : {}), ...(v.sampled ? { insideMassMg: v.state.insideMassMg, outsideMassMg: v.state.outsideMassMg, totalMassMg: v.state.totalMassMg, reacted: v.reacted } : {}), ...(scene.phase === 'given' ? { initialAtoms: v.state.atoms.map(a => ({ id: a.id, element: a.element })), inside: v.state.inside.map(u => ({ id: u.id, formula: u.formula, atomIds: u.atomIds })), outside: v.state.outside.map(u => ({ id: u.id, formula: u.formula, atomIds: u.atomIds })) } : {}) })), learnerGroups: scene.learnerGroups, learnerBonds: scene.learnerBonds };
}
