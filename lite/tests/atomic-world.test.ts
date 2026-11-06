import { describe, it, expect } from 'vitest';
// @ts-expect-error Actual Three.js graphs are verified at runtime.
import * as THREE from 'three';
import { rng } from '../src/engine/rng';
import { atomicWorldSpecs } from '../src/content/atomic-world';
import { atomicElements, atomicSampleFacts, checkAtomicWorld, solutionAtomicWorld, wrongAtomicWorldResponses, checkAtomicBuild, validAtomicAtom, type AtomicWorldTask, type AtomicWorldResponse, type AtomicBuildTask } from '../src/content/models/atomic-world';
import { atomicWorldScene, debugAtomicWorldScene } from '../src/content/scenes/atomic-world';
import { atomicChamberPose, mountAtomicWorldStage } from '../src/world/atomic-world-stage.js';
const observed = (t: AtomicWorldTask, a: AtomicWorldResponse): AtomicWorldResponse => ({ ...a, ...(t.review ? { review: { observations: Object.fromEntries(t.review.rubric.map(r => [r.id, 'met' as const])), confirmedByAdult: true, assistance: 'none' as const } } : {}) });
/** Independent expected rows use a separate factual table and direct integer counting, never the production solution. */
const facts = [['H', 1, 1, 1], ['He', 2, 18, 1], ['Li', 3, 1, 2], ['Be', 4, 2, 2], ['B', 5, 13, 2], ['C', 6, 14, 2], ['N', 7, 15, 2], ['O', 8, 16, 2], ['F', 9, 17, 2], ['Ne', 10, 18, 2], ['Na', 11, 1, 3], ['Mg', 12, 2, 3], ['Al', 13, 13, 3], ['Si', 14, 14, 3], ['P', 15, 15, 3], ['S', 16, 16, 3], ['Cl', 17, 17, 3], ['Ar', 18, 18, 3], ['K', 19, 1, 4], ['Ca', 20, 2, 4], ['Br', 35, 17, 4], ['Kr', 36, 18, 4], ['Rb', 37, 1, 5], ['I', 53, 17, 5], ['Xe', 54, 18, 5], ['Cs', 55, 1, 6]] as const;
const number = (n: number) => `${n * 3}/3`;
function oracle(t: AtomicWorldTask): AtomicWorldResponse {
    const kind = 'atomic-world' as const;
    switch (t.mode) {
        case 'atom': {
            const charge = t.particle === 'electron' ? -1 : t.particle === 'proton' ? 1 : 0, region = t.particle === 'electron' ? 'cloud' : 'nucleus';
            return { kind, mode: t.mode, rows: t.activity === 'link' ? [] : t.atoms.map(a => ({ id: a.id, symbol: facts.find(f => f[1] === a.protons)![0], number: number(a.protons), particle: t.particle ?? '', charge: number(charge), region })), sampleAtom: t.sample ? t.atoms.find(a => a.symbol === t.sample!.symbol)!.id : '', nucleus: 'nucleus', cloud: 'cloud', literalScale: false, sameAtom: t.comparison ? JSON.stringify([t.atoms[0]!.protons, t.atoms[0]!.neutrons, t.atoms[0]!.electrons]) === JSON.stringify([t.comparison.protons, t.comparison.neutrons, t.comparison.electrons]) : null, atomCount: number((t.sample?.units ?? 0) * (t.sample?.atomsPerUnit ?? 0)), unit: 'atom', macroProperty: 'sample' };
        }
        case 'sample': return { kind, mode: t.mode, rows: t.samples.map(s => { const kinds = new Set(s.species.flatMap(p => p.atoms)).size, substances = new Set(s.species.map(p => p.atoms.slice().sort().join('/') + '-' + p.structure)).size; return { id: s.id, classification: substances > 1 ? 'mixture' : kinds > 1 ? 'compound' : 'element', kinds: number(kinds), units: number(s.species.map(p => p.units).reduce((a, b) => a + b, 0)) }; }) };
        case 'build': {
            if (t.structure === 'lattice')
                return { kind, mode: t.mode, selected: [], bonds: [], placements: t.sites.slice().reverse().map(s => ({ id: s.id, symbol: t.species[(s.x + s.y + s.z) % 2]! })) };
            const selected = Object.entries(t.composition).flatMap(([symbol, n]) => t.bank.filter(a => a.symbol === symbol).slice(-n).map(a => a.id)), atoms = selected.map(id => t.bank.find(a => a.id === id)!), central = atoms.find(a => t.valences[a.symbol]! > 1)!;
            return { kind, mode: t.mode, selected: selected.reverse(), bonds: atoms.filter(a => a !== central).map(a => ({ a: a.id, b: central.id, order: t.valences[a.symbol]! })), placements: [] };
        }
        case 'periodic': {
            const row = facts.find(f => f[0] === t.target)!;
            return { kind, mode: t.mode, order: t.cards.slice().sort((a, b) => facts.find(f => f[0] === a)![1] - facts.find(f => f[0] === b)![1]), symbol: row[0], group: number(row[2]), period: number(row[3]) };
        }
        case 'property': {
            const melting: Record<string, number> = { Li: 180.5, Na: 97.794, K: 63.5, Rb: 39.3, Cs: 28.5 }, boiling: Record<string, number> = { He: -268.928, Ne: -246.046, Ar: -185.848, Kr: -153.415, Xe: -108.099 }, state: Record<string, string> = { F: 'gas', Cl: 'gas', Br: 'liquid', I: 'solid' };
            const map = t.property === 'melting' ? melting : t.property === 'boiling' ? boiling : state, target = map[t.target]!, comparison = map[t.comparison]!;
            return { kind, mode: t.mode, forecast: t.property === 'state' ? String(target) : target < comparison ? 'lower' : target > comparison ? 'higher' : 'same', locked: true, observed: true, group: number(t.group), comparison: t.comparison, result: String(target) };
        }
        case 'phase': return { kind, mode: t.mode, rows: t.chambers.map(c => ({ id: c.id, phase: c.phase, motion: c.phase === 'solid' ? 'vibrate' : c.phase === 'liquid' ? 'slide' : 'free', spacing: c.phase === 'gas' ? 'far' : c.phase === 'solid' && c.substance === 'water' ? 'open' : 'near', size: 'same' })), forecast: t.change === 'vaporize' ? 'gas' : 'liquid', locked: true, observed: true, identity: 'same', count: number(t.chambers[0]!.count), steps: t.activity === 'change' ? ['during', 'after'] : [] };
        case 'model-use': return { kind, mode: t.mode, structures: t.structures.map(s => ({ id: s.id, placements: s.sites.slice().reverse().map(p => ({ id: p.id, symbol: s.species[(p.x + p.y + p.z) % 2]! })), model: 'structure', literal: false, shifted: s.intervention === 'shift' })), particle: t.particle ? { model: 'particle', forecast: t.particle.kind === 'diffusion' ? 'spread' : 'faster', locked: true, observed: true, count: number(t.particle.count) } : null };
        case 'scale': {
            const order = ['macro', 'structure', 'particle'].map(level => t.cards.find(c => c.level === level)!);
            return { kind, mode: t.mode, order: order.map(c => c.id), links: t.cards.map(c => ({ id: c.id, phenomenon: t.phenomenon })), modelBoundary: order.find(c => c.source === 'model')!.id };
        }
    }
}
function taskAt(spec: typeof atomicWorldSpecs[number], seed: number, phase: 'independent' | 'transfer' = 'independent') { return spec.item(rng(seed), phase).task as unknown as AtomicWorldTask; }
describe('Atomic17 authored scientific workshop', () => {
    it('accepts 2176 independently constructed responses and rejects wrong models', () => {
        expect(atomicWorldSpecs).toHaveLength(17);
        for (const spec of atomicWorldSpecs)
            for (const phase of ['independent', 'transfer'] as const)
                for (let seed = 1; seed <= 64; seed++) {
                    const t = taskAt(spec, seed, phase), answer = observed(t, oracle(t));
                    expect(checkAtomicWorld(t, answer), `${spec.id}/${phase}/${seed}`).toMatchObject({ ok: true });
                    for (const wrong of wrongAtomicWorldResponses(t))
                        expect(checkAtomicWorld(t, observed(t, wrong)).ok).toBe(false);
                    if(t.mode==='atom')for(const a of t.atoms){expect(validAtomicAtom(a)).toBe(true);if(t.particle==='neutron')expect(a.neutrons).toBeGreaterThan(0);}
                }
    });
    it('has 8+ genuine givens and both independent families, deterministic seeds and isolated ELEMENT entry contexts', () => {
        for (const spec of atomicWorldSpecs) {
            const cases = new Set<string>(), families = new Set<string>();
            for (let seed = 1; seed <= 160; seed++) {
                const item = spec.item(rng(seed), 'independent'), t = item.task as unknown as AtomicWorldTask;
                families.add(item.tag);
                cases.add(JSON.stringify(t));
                const replay = spec.item(rng(seed), 'independent');
                expect({ task: replay.task, tag: replay.tag, say: replay.say }).toEqual({ task: item.task, tag: item.tag, say: item.say });
                if (spec.id === 'CHEM79-ELEMENT') {
                    expect(t.mode).toBe('sample');
                    if (t.mode === 'sample')
                        expect(t.context?.kind).toBe('element');
                }
            }
            expect(cases.size, spec.id).toBeGreaterThanOrEqual(8);
            expect(families.size, spec.id).toBe(2);
        }
    });
    it('deduces elemental identity from protons and preserves homonuclear compounds boundary', () => {
        expect(atomicElements.map(e => [e.symbol, e.z, e.group, e.period])).toEqual(facts.map(f => [...f]));
        expect(atomicSampleFacts({ id: 'o', label: 'O2', species: [{ id: 'o', label: 'oxygen', atoms: ['O', 'O'], units: 4, structure: 'molecule' }] })).toEqual({ kinds: 1, units: 4, classification: 'element' });
        expect(atomicSampleFacts({ id: 's', label: 'NaCl', species: [{ id: 's', label: 'lattice', atoms: ['Na', 'Cl'], units: 8, structure: 'lattice' }] })).toEqual({ kinds: 2, units: 8, classification: 'compound' });
    });
    it('accepts alternative equivalent atoms and bond direction while rejecting disconnected or overbonded molecules', () => {
        const t: AtomicBuildTask = { mode: 'build', structure: 'molecule', compound: 'H2O', composition: { H: 2, O: 1 }, valences: { H: 1, O: 2 }, bank: [{ id: 'o', symbol: 'O' }, { id: 'a', symbol: 'H' }, { id: 'b', symbol: 'H' }, { id: 'c', symbol: 'H' }] };
        const a: Extract<AtomicWorldResponse, {
            mode: 'build';
        }> = { kind: 'atomic-world', mode: 'build', selected: ['c', 'o', 'b'], placements: [], bonds: [{ a: 'c', b: 'o', order: 1 }, { a: 'o', b: 'b', order: 1 }] };
        expect(checkAtomicBuild(t, a)).toBe(true);
        expect(checkAtomicBuild(t, { ...a, bonds: [{ a: 'c', b: 'b', order: 1 }] })).toBe(false);
        expect(checkAtomicBuild(t, { ...a, bonds: [...a.bonds, { a: 'b', b: 'c', order: 1 }] })).toBe(false);
    });
    it('keeps own explanations pending and preserves assistance on wrong scientific activity', () => {
        const spec = atomicWorldSpecs.find(s => s.id === 'CHEM79-COMP-MODEL')!, t = taskAt(spec, 1), a = oracle(t);
        expect(checkAtomicWorld(t, a)).toMatchObject({ ok: false, pendingReview: true });
        const bad = observed(t, wrongAtomicWorldResponses(t)[0]!);
        bad.review!.assistance = 'helped';
        expect(checkAtomicWorld(t, bad)).toMatchObject({ ok: false, observedByAdult: true, assisted: true });
        const inherited = { ...a, review: Object.create(observed(t, a).review!) };
        expect(checkAtomicWorld(t, inherited)).toMatchObject({ pendingReview: true });
    });
    it('rejects sparse, inherited, accessor, unknown and prose payloads without invoking accessors', () => {
        for (const spec of atomicWorldSpecs) {
            const t = taskAt(spec, 4), a = observed(t, oracle(t));
            expect(checkAtomicWorld(t, Object.create(a)).ok).toBe(false);
            expect(checkAtomicWorld(t, { ...a, text: 'private draft' }).ok).toBe(false);
            let calls = 0;
            const accessor = Object.defineProperty({ ...a }, 'mode', { get() { calls++; return t.mode; }, enumerable: true });
            expect(checkAtomicWorld(t, accessor).ok).toBe(false);
            expect(calls).toBe(0);
            if ('rows' in a && a.rows.length) {
                const sparse = new Array(a.rows.length);
                expect(checkAtomicWorld(t, { ...a, rows: sparse }).ok).toBe(false);
            }
        }
    });
    it('projects all seven primary3D nodes safely and renders actual conserved water parts with disposal', () => {
        const primary = ['CHEM79-ATOM-01', 'CHEM79-ATOM-NUCLEUS', 'CHEM79-COMP-MODEL', 'CHEM79-MODEL-01', 'CHEM79-STATE-01', 'CHEM79-STATECHANGE', 'CHEM79-STRUCTURE-MODEL-USE'];
        for (const id of primary) {
            const t = taskAt(atomicWorldSpecs.find(s => s.id === id)!, 3), scene = atomicWorldScene(t)!;
            expect(scene).toBeDefined();
            expect(scene.observed).toBe(false);
            const debug = debugAtomicWorldScene(scene)!;
            expect(Object.keys(debug).sort()).toEqual(['kind', 'legend', 'mode', 'motionMs', 'observed', 'phase', 'title', 'view'].sort());
            expect(JSON.stringify(debug)).not.toContain('protons');
            const parent = new THREE.Group(), mounted = mountAtomicWorldStage(parent, scene);
            expect(parent.children).toHaveLength(1);
            mounted.advanceTime(2000);
            expect(mounted.snapshot().elapsedMs).toBe(2000);
            mounted.dispose();
            mounted.dispose();
            expect(parent.children).toHaveLength(0);
        }
        const t = taskAt(atomicWorldSpecs.find(s => s.id === 'CHEM79-STATECHANGE')!, 1), before = atomicWorldScene(t)!, after = atomicWorldScene(t, oracle(t))!;
        const counts = (scene: typeof before) => {
            const parent = new THREE.Group(), mounted = mountAtomicWorldStage(parent, scene), all: string[] = [];
            parent.traverse((o: {
                name: string;
            }) => all.push(o.name));
            mounted.dispose();
            return ['water-oxygen', 'water-hydrogen'].map(n => all.filter(name => name === n).length);
        };
        expect(counts(before)).toEqual(counts(after));
        expect(counts(before)[1]).toBe(counts(before)[0]! * 2);
    });
    it('moves solids locally, conserves radii and handles negative/nonfinite time safely', () => {
        const c = { id: 'A', substance: 'water' as const, phase: 'solid' as const, count: 16, temperatureC: -10 };
        for (let i = 0; i < c.count; i++) {
            const a = atomicChamberPose(c, i, 0), b = atomicChamberPose(c, i, 3000);
            expect(a.some((v, j) => v !== b[j])).toBe(true);
            expect(Math.max(...a.map((v, j) => Math.abs(v - b[j]!)))).toBeLessThan(.037);
            expect(atomicChamberPose(c, i, -3)).toEqual(a);
            expect(atomicChamberPose(c, i, NaN)).toEqual(a);
        }
    });
    it('demonstration answers remain pending when own adult explanation is required', () => {
        for (const spec of atomicWorldSpecs) {
            const t = taskAt(spec, 2);
            if (t.review)
                expect(checkAtomicWorld(t, solutionAtomicWorld(t))).toMatchObject({ pendingReview: true });
        }
    });
    it('connects only the actual learner-selected sample atom and rejects foreign preview objects', () => {
        const task = taskAt(atomicWorldSpecs.find(s => s.id === 'CHEM79-ATOM-01')!, 12);
        if (task.mode !== 'atom')
            throw Error('Expected sample atom task');
        const before = atomicWorldScene(task)!;
        const countLinks = (scene: typeof before) => { const parent = new THREE.Group(), mounted = mountAtomicWorldStage(parent, scene), names: string[] = []; parent.traverse((o: {
            name: string;
        }) => names.push(o.name)); mounted.dispose(); return names.filter(n => n === 'learner-sample-to-atom-link').length; };
        expect(countLinks(before)).toBe(0);
        const answer = oracle(task);
        const after = atomicWorldScene(task, answer)!;
        expect(after.selectedAtomId).toBe(task.atoms.find(a => a.symbol === task.sample!.symbol)!.id);
        expect(countLinks(after)).toBe(1);
        const invalid = { ...answer, sampleAtom: 'missing' };
        expect(atomicWorldScene(task, invalid)?.selectedAtomId).toBeUndefined();
        expect(atomicWorldScene(task, Object.create(answer))?.selectedAtomId).toBeUndefined();
    });
    it('matches independently derived phase boundaries and transition-temperature plateaus', () => {
        const spec = atomicWorldSpecs.find(s => s.id === 'CHEM79-STATE-01')!;
        for (let seed = 1; seed <= 96; seed++)
            for (const phase of ['independent', 'transfer'] as const) {
                const task = taskAt(spec, seed, phase);
                if (task.mode !== 'phase')
                    throw Error('Expected phase');
                for (const c of task.chambers) {
                    const melt = c.substance === 'water' ? 0 : -189.34, boil = c.substance === 'water' ? 100 : -185.848;
                    expect(c.phase).toBe(c.temperatureC < melt ? 'solid' : c.temperatureC > boil ? 'gas' : 'liquid');
                }
            }
        const change = atomicWorldSpecs.find(s => s.id === 'CHEM79-STATECHANGE')!;
        for (let seed = 1; seed <= 48; seed++)
            for (const phase of ['independent', 'transfer'] as const) {
                const task = taskAt(change, seed, phase);
                if (task.mode !== 'phase')
                    throw Error('Expected phase');
                const a = oracle(task);
                if (a.mode !== 'phase')
                    throw Error('Expected phase response');
                const scene = atomicWorldScene(task, { ...a, observed: false, steps: ['during'] })!;
                expect(scene.view).toBe('during');
                expect(scene.chambers[0]!.temperatureC).toBe(task.change === 'melt' ? 0 : 100);
            }
    });
});
