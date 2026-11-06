import { expect, it } from 'vitest';
import * as THREE from 'three';
import { rng } from '../src/engine/rng';
import { reactionLabSpecs } from '../src/content/reaction-lab';
import { reactionRecipes } from '../src/content/models/reaction-lab';
import { reactionLabScene, debugReactionLabScene } from '../src/content/models/reaction-lab-scene';
import { mountReactionLabStage } from '../src/world/reaction-lab-stage.js';
import { peerReactionAnswer } from './reaction-independent-peer-fixtures';
const recipes = new Map(reactionRecipes.map(r => [r.id, r]));
it('peer compares 120 actual Three graphs against independent atom allocations and remaining solid volumes', () => {
    let graphs = 0;
    for (const id of ['CHEM79-MATTER-CONS', 'CHEM79-REACTION-MODEL', 'CHEM79-RATE-TEMP', 'CHEM79-RATE-CONC', 'CHEM79-RATE-SURF']) for (const phase of ['independent', 'transfer']) for (let seed = 0; seed < 12; seed++) {
        const task = reactionLabSpecs.find(s => s.id === id).item(rng(seed), phase).task;
        const answer = peerReactionAnswer(task, recipes), model = reactionLabScene(task, answer);
        const parent = new THREE.Group(), stage = mountReactionLabStage(parent, model), atoms = [], fragments = [], resources = new Set();
        parent.traverse(o => { if (o.name === 'conserved-reaction-atom') atoms.push(o); if (o.name === 'remaining-reactant-fragment') fragments.push(o); if (o.geometry) resources.add(o.geometry); });
        const ids = atoms.map(a => a.userData.id);
        expect(new Set(ids).size).toBe(ids.length);
        expect(ids.sort()).toEqual(model.vessels.flatMap(v => v.state.atoms.map(a => `${v.id}:${a.id}`)).sort());
        for (const v of model.vessels) {
            const rendered = fragments.filter(f => f.userData.trial === v.id);
            if (v.shape) {
                const actual = rendered.reduce((n, f) => n + f.geometry.parameters.width * f.geometry.parameters.height * f.geometry.parameters.depth / f.userData.scale ** 3, 0);
                const expected = v.shape.width * v.shape.height * v.shape.depth * (v.limit - v.reacted) / v.limit;
                expect(actual).toBeCloseTo(expected, 9);
                expect(rendered.length).toBe(v.reacted === v.limit ? 0 : v.shape.cuts.reduce((n, d) => n * d, 1));
            }
        }
        const before = stage.snapshot(); stage.advanceTime(3000); const after = stage.snapshot();
        expect(after.vessels).toEqual(before.vessels); expect(after.elapsedMs).toBe(3000);
        let released = 0; for (const geometry of resources) geometry.addEventListener('dispose', () => released++);
        stage.dispose(); expect(parent.children).toHaveLength(0); expect(released).toBe(resources.size);
        stage.dispose(); expect(released).toBe(resources.size); graphs++;
    }
    expect(graphs).toBe(120);
});
it('peer unsampled stage/public snapshots omit actual mass and extent even after a clock move', () => {
    const task = reactionLabSpecs.find(s => s.id === 'CHEM79-RATE-SURF').item(rng(21), 'transfer').task;
    const answer = peerReactionAnswer(task, recipes), unsampled = { ...answer, actions: answer.actions.filter(a => a.type !== 'sample') };
    const model = reactionLabScene(task, unsampled), parent = new THREE.Group(), stage = mountReactionLabStage(parent, model);
    for (const snapshot of [stage.snapshot(), debugReactionLabScene(model)]) {
        const json = JSON.stringify(snapshot);
        expect(json).not.toContain('MassMg'); expect(json).not.toContain('reacted');
    }
    stage.dispose();
});
