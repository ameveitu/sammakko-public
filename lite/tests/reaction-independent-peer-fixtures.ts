/** Independent peer expectations. No production solution, formula parser, rate solver or ledger is used. */
import type { ReactionLabTask, ReactionLabResponse, ReactionConfiguration, ReactionRateModel, ReactionAction, ReactionSpecies } from '../src/content/models/reaction-lab';
export const peerWeights: Record<string, number> = { H: 1, C: 12, N: 14, O: 16, Na: 23, Mg: 24, Al: 27, Si: 28, P: 31, S: 32, Cl: 35, Ca: 40, Fe: 56, Zn: 65 };
export function peerFormula(formula: string): Record<string, number> {
    const atoms: Record<string, number> = {};
    const tokens = [...formula.matchAll(/([A-Z][a-z]?)(\d*)/g)];
    if (tokens.map(t => t[0]).join('') !== formula) throw Error(`Unsupported peer formula ${formula}`);
    for (const t of tokens) atoms[t[1]!] = (atoms[t[1]!] ?? 0) + Number(t[2] || 1);
    return atoms;
}
export const peerMass = (formula: string) => Object.entries(peerFormula(formula)).reduce((n, [element, count]) => n + peerWeights[element]! * count, 0);
export function peerInventory(species: readonly ReactionSpecies[], groups = 1): Record<string, number> {
    const result: Record<string, number> = {};
    for (const s of species) for (const [element, count] of Object.entries(peerFormula(s.formula))) result[element] = (result[element] ?? 0) + count * s.coefficient * groups;
    return result;
}
/** Independent face-minus-edge-plus-corner polynomial, using a common exact rational denominator. */
export function peerExtent(model: ReactionRateModel, c: ReactionConfiguration, seconds: number): number {
    const tf = model.temperatures.find(t => t.value === c.temperatureC)!.factor;
    const cf = model.concentrations.find(t => t.value === c.concentration)!.factor;
    const p = BigInt(model.baseRate[0]) * BigInt(tf[0]) * BigInt(cf[0]) * BigInt(seconds);
    const q = BigInt(model.baseRate[1]) * BigInt(tf[1]) * BigInt(cf[1]);
    const [w, h, d] = [c.shape.width, c.shape.height, c.shape.depth].map(BigInt) as [bigint, bigint, bigint];
    const [nx, ny, nz] = c.shape.cuts.map(BigInt) as [bigint, bigint, bigint];
    if ([w * q - 2n * p * nx, h * q - 2n * p * ny, d * q - 2n * p * nz].some(n => n <= 0n)) return c.extentLimit;
    const faces = 2n * p * q ** 2n * (w * h * nz + w * d * ny + h * d * nx);
    const edges = 4n * p ** 2n * q * (w * ny * nz + h * nx * nz + d * nx * ny);
    const corners = 8n * p ** 3n * nx * ny * nz;
    return Number(BigInt(c.extentLimit) * (faces - edges + corners) / (w * h * d * q ** 3n));
}
export function peerConfigurations(task: Extract<ReactionLabTask, { mode: 'rate' }>): readonly [ReactionConfiguration, ReactionConfiguration] {
    const a = structuredClone(task.initial[0]), b = structuredClone(a), factor = task.allowedFactors[0]!;
    if (factor === 'temperature') b.temperatureC = task.model.temperatures.find(t => t.value !== a.temperatureC)!.value;
    if (factor === 'concentration') b.concentration = task.model.concentrations.find(t => t.value !== a.concentration)!.value;
    if (factor === 'surface') b.shape.cuts = task.cutOptions.find(c => c.some((n, i) => n !== a.shape.cuts[i]))!;
    return [a, b];
}
// Chemistry givens are read as input. Expected counts/masses and actual learner procedures are independently built.
export function peerReactionAnswer(task: ReactionLabTask, recipes: ReadonlyMap<string, { reactants: readonly ReactionSpecies[]; products: readonly ReactionSpecies[]; netEnergy: number; activation: number }>): ReactionLabResponse {
    const kind = 'reaction-lab' as const;
    const recipe = (id: string) => { const r = recipes.get(id); if (!r) throw Error(id); return r; };
    const review = { observations: Object.fromEntries(task.review!.rubric.map(r => [r.id, 'met' as const])), confirmedByAdult: true, assistance: 'none' as const };
    switch (task.mode) {
        case 'change': case 'reaction': return { kind, mode: task.mode, review, rows: task.cases.map(c => {
            const verified = c.identityEvidence === 'verified', added = c.after.filter(a => !c.before.some(b => b.id === a.id));
            return { id: c.id, classification: !verified ? 'insufficient' : added.length ? 'chemical' : 'physical', reason: !verified ? 'need-data' : added.length ? 'new-identity' : 'same-identity', newSubstances: verified ? added.map(s => s.id).reverse() : [] };
        }) };
        case 'roles': return { kind, mode: task.mode, review, rows: task.cases.flatMap(c => [...recipe(c.recipe).products.map(s => ({ caseId: c.id, formula: s.formula, role: 'product' })), ...recipe(c.recipe).reactants.map(s => ({ caseId: c.id, formula: s.formula, role: 'reactant' }))]), placements: task.cases.map(c => ({ caseId: c.id, before: recipe(c.recipe).reactants.map(s => s.formula).reverse(), after: recipe(c.recipe).products.map(s => s.formula).reverse() })).reverse() };
        case 'energy': return { kind, mode: task.mode, review, rows: task.cases.map(c => {
            const r = recipe(c.recipe), net = c.extents * r.netEnergy;
            return { id: c.id, systemChange: `${net * 3}/3`, surroundingsChange: String(-net), direction: net < 0 ? 'out' : 'in', term: net < 0 ? 'exothermic' : 'endothermic', activation: String(r.activation) };
        }).reverse() };
        case 'conservation': {
            const r = recipe(task.recipe), gasMass = task.boundary.gasFormula ? peerMass(task.boundary.gasFormula) : 0;
            const total = (r.reactants.reduce((n, s) => n + peerMass(s.formula) * s.coefficient, 0) * task.groups + gasMass * task.outsideInitialGroups) * task.massScaleMg;
            const outside = gasMass * (task.outsideInitialGroups + task.boundary.escapedGroups) * task.massScaleMg;
            const actions: ReactionAction[] = [{ id: 'a1', run: task.run, type: 'lock-conservation', inside: '0', outside: '0', unit: 'mg' }, { id: 'a2', run: task.run, type: 'start', trial: 'A' }, { id: 'a3', run: task.run, type: 'complete', trial: 'A' }];
            if (task.boundary.open) actions.push({ id: 'a4', run: task.run, type: 'boundary', trial: 'A', open: true, gasFormula: task.boundary.gasFormula, groups: task.boundary.escapedGroups });
            return { kind, mode: task.mode, review, forecastInside: '0', forecastOutside: '0', predictionUnit: 'mg', locked: true, observed: true, actions, reflection: 'revised', inside: `${total - outside}/1000`, outside: `${outside}/1000`, whole: `${total}/1000`, unit: 'g' };
        }
        case 'rearrange': {
            const r = recipe(task.recipe), pool: { id: string; element: string }[] = [];
            for (const s of r.reactants) for (let i = 0; i < s.coefficient * task.groups; i++) for (const [element, count] of Object.entries(peerFormula(s.formula))) for (let j = 0; j < count; j++) pool.push({ id: `R${pool.length + 1}`, element });
            const available = [...pool].reverse(), molecules: { id: string; formula: string; atomIds: string[] }[] = [], bonds: { a: string; b: string; order: number }[] = [];
            for (const s of [...r.products].reverse()) for (let i = 0; i < s.coefficient * task.groups; i++) {
                const selected: typeof pool = [];
                for (const [element, count] of Object.entries(peerFormula(s.formula))) for (let j = 0; j < count; j++) selected.push(available.splice(available.findIndex(a => a.element === element), 1)[0]!);
                molecules.push({ id: `p${molecules.length + 1}`, formula: s.formula, atomIds: selected.map(a => a.id) });
                const center = selected.find(a => a.element === (s.formula === 'H2O' ? 'O' : s.formula === 'CO2' ? 'C' : selected[0]!.element))!;
                for (const a of selected.filter(a => a !== center)) bonds.push({ a: a.id, b: center.id, order: ['CO2', 'O2'].includes(s.formula) ? 2 : 1 });
            }
            const counts = peerInventory(r.reactants, task.groups);
            return { kind, mode: task.mode, review, molecules, bonds, beforeAtoms: counts, afterAtoms: { ...counts } };
        }
        case 'rate': {
            const data = !!task.givenReadings, configs = data ? task.initial : peerConfigurations(task), product = recipe(task.model.recipe).products.find(p => p.formula === task.model.product)!;
            const mass = peerMass(product.formula) * product.coefficient * task.massScaleMg;
            const readings = (['A', 'B'] as const).flatMap((trial, i) => task.interval.map(timeS => ({ trial, timeS, productMass: String(peerExtent(task.model, configs[i]!, timeS) * mass), unit: 'mg' })));
            const delta = [0, 1].map(i => Number(readings[i * 2 + 1]!.productMass) - Number(readings[i * 2]!.productMass)) as [number, number];
            const duration = task.interval[1] - task.interval[0], relation = delta[1] > delta[0] ? 'faster' : delta[1] < delta[0] ? 'slower' : 'same';
            const actions: ReactionAction[] = [];
            const add = (a: object) => actions.push({ ...a, id: `a${actions.length + 1}`, run: task.run } as ReactionAction);
            if (!data) {
                add({ type: 'configure', trial: 'B', configuration: configs[1] });
                add({ type: 'lock', factor: task.allowedFactors[0], forecast: 'slower' });
                for (const trial of ['B', 'A']) {
                    add({ type: 'start', trial });
                    if (task.interval[0]) add({ type: 'advance', trial, seconds: task.interval[0] });
                    add({ type: 'sample', trial });
                    add({ type: 'advance', trial, seconds: duration }); add({ type: 'sample', trial });
                }
            }
            return { kind, mode: task.mode, review, ...(data ? {} : { plan: { factor: task.allowedFactors[0]!, configurations: configs, forecast: 'slower' as const } }), actions, readings: readings.reverse(), delta: delta.map(n => `${n}/1000`) as [string, string], duration: String(duration), quantityUnit: 'g', rates: delta.map(n => `${n}/${duration * 1000}`) as [string, string], rateUnit: 'g/s', relation, yieldRelation: task.skill === 'compare' ? configs[1].extentLimit > configs[0].extentLimit ? 'more' : configs[1].extentLimit < configs[0].extentLimit ? 'less' : 'same' : '', reflection: data ? 'data-only' : relation === 'slower' ? 'confirmed' : 'revised', boundaryScope: data ? 'given-window' : 'model-only' };
        }
    }
}
