import { parseChemicalFormula, type AtomInventory, type ChemicalElement } from './chemical-notation';
import { parseMeasure } from './spatial-measures';
import { atomicOwn, atomicDense, checkAtomicBuild } from './atomic-world';
import { checkObservedExplanation, type ObservedExplanationTask, type CriterionObservation } from './observed-explanations';
export const reactionLabSources = [
    'https://openstax.org/books/chemistry-2e/pages/3-1-formula-mass-and-the-mole-concept',
    'https://openstax.org/books/chemistry-2e/pages/4-1-writing-and-balancing-chemical-equations',
    'https://openstax.org/books/chemistry-2e/pages/5-3-enthalpy',
    'https://openstax.org/books/chemistry-2e/pages/12-1-chemical-reaction-rates',
    'https://openstax.org/books/chemistry-2e/pages/12-2-factors-affecting-reaction-rates',
    'https://openstax.org/books/chemistry-2e/pages/12-5-collision-theory',
] as const;
export type ReactionPhase = 'solid' | 'liquid' | 'gas' | 'aqueous';
export type ReactionFactor = 'temperature' | 'concentration' | 'surface';
export type ReactionRelation = 'faster' | 'same' | 'slower';
export type ReactionRational = readonly [
    bigint,
    bigint
];
export interface ReactionSpecies {
    formula: string;
    name: string;
    phase: ReactionPhase;
    coefficient: number;
}
export interface ReactionRecipe {
    id: string;
    name: string;
    reactants: readonly ReactionSpecies[];
    products: readonly ReactionSpecies[];
    condition: string;
    activation: number;
    netEnergy: number;
    energyUnit: 'model-unit';
}
export interface ReactionAtom {
    id: string;
    element: ChemicalElement;
}
export interface ReactionUnit {
    id: string;
    formula: string;
    name: string;
    phase: ReactionPhase;
    atomIds: readonly string[];
}
export interface ReactionBond {
    a: string;
    b: string;
    order: number;
}
export interface ReactionBoundary {
    open: boolean;
    gasFormula: string | null;
    escapedGroups: number;
}
export interface ReactionMaterialState {
    atoms: readonly ReactionAtom[];
    inside: readonly ReactionUnit[];
    outside: readonly ReactionUnit[];
    insideInventory: AtomInventory;
    outsideInventory: AtomInventory;
    allInventory: AtomInventory;
    insideMassMg: number;
    outsideMassMg: number;
    totalMassMg: number;
    extent: number;
}
export interface ReactionShape {
    width: number;
    height: number;
    depth: number;
    cuts: readonly [
        number,
        number,
        number
    ];
}
export interface ReactionConfiguration {
    temperatureC: number;
    concentration: number;
    shape: ReactionShape;
    volumeUnits: number;
    extentLimit: number;
}
export interface ReactionRateModel {
    name: string;
    recipe: string;
    product: string;
    secondsMaximum: number;
    baseRate: readonly [
        number,
        number
    ];
    temperatures: readonly {
        value: number;
        factor: readonly [
            number,
            number
        ];
    }[];
    concentrations: readonly {
        value: number;
        factor: readonly [
            number,
            number
        ];
    }[];
    referenceArea: number;
    referenceShape: readonly [
        number,
        number,
        number
    ];
    volumes: readonly number[];
    concentrationSpecies: string;
    scope: string;
}
export interface ReactionRateReading {
    trial: string;
    timeS: number;
    extent: number;
    productMassMg: number;
    insideMassMg: number;
    outsideMassMg: number;
}
export interface ReactionReview {
    prompt: string;
    rubric: readonly {
        id: string;
        label: string;
        guide: string;
    }[];
    model: string;
}
export interface ReactionObservation {
    observations: Partial<Record<string, CriterionObservation>>;
    confirmedByAdult: boolean;
    assistance: 'none' | 'helped';
}
export interface ReactionEvidenceSubstance {
    id: string;
    formula: string;
    name: string;
    phase: ReactionPhase;
    groups: number;
}
export interface ReactionCase {
    id: string;
    name: string;
    before: readonly ReactionEvidenceSubstance[];
    after: readonly ReactionEvidenceSubstance[];
    observation: string;
    evidence: string;
    identityEvidence: 'verified' | 'appearance-only';
    illustration: 'melt' | 'dissolve' | 'gas-release' | 'burn' | 'colour' | 'precipitate';
}
export type ReactionChangeTask = {
    mode: 'change' | 'reaction';
    skill: 'physical' | 'new-substance' | 'burn';
    cases: readonly ReactionCase[];
};
export type ReactionRolesTask = {
    mode: 'roles';
    cases: readonly {
        id: string;
        recipe: string;
        presentation: 'formula' | 'before-after' | 'written';
    }[];
};
export type ReactionConservationTask = {
    mode: 'conservation';
    recipe: string;
    groups: number;
    boundary: ReactionBoundary;
    massScaleMg: number;
    outsideInitialGroups: number;
};
export type ReactionRearrangeTask = {
    mode: 'rearrange';
    recipe: string;
    groups: number;
    massScaleMg: number;
};
export type ReactionEnergyTask = {
    mode: 'energy';
    skill: 'transfer' | 'exoendo';
    cases: readonly {
        id: string;
        recipe: string;
        extents: number;
        systemBefore: number;
        surroundingsBefore: number;
        presentation: 'flow' | 'activation-profile' | 'ledger';
        light: boolean;
    }[];
};
export type ReactionRateTask = {
    mode: 'rate';
    skill: 'compare' | 'factor' | 'temperature' | 'concentration' | 'surface';
    activity: 'compare-data' | 'produce-window' | 'plan' | 'repair-confound' | 'control' | 'transfer';
    model: ReactionRateModel;
    initial: readonly [
        ReactionConfiguration,
        ReactionConfiguration
    ];
    allowedFactors: readonly ReactionFactor[];
    interval: readonly [
        number,
        number
    ];
    cutOptions: readonly (readonly [
        number,
        number,
        number
    ])[];
    massScaleMg: number;
    question: string;
    givenReadings?: readonly ReactionRateReading[];
};
export type ReactionLabTask = (ReactionChangeTask | ReactionRolesTask | ReactionConservationTask | ReactionRearrangeTask | ReactionEnergyTask | ReactionRateTask) & {
    kind: 'reaction-lab';
    title: string;
    run: string;
    review?: ReactionReview;
};
export type ReactionAction = ({
    type: 'configure';
    trial: string;
    configuration: ReactionConfiguration;
} | {
    type: 'lock-conservation';
    inside: string;
    outside: string;
    unit: 'mg' | 'g';
} | {
    type: 'complete';
    trial: string;
} | {
    type: 'lock';
    factor: ReactionFactor;
    forecast: ReactionRelation;
} | {
    type: 'start';
    trial: string;
} | {
    type: 'advance';
    trial: string;
    seconds: number;
} | {
    type: 'sample';
    trial: string;
} | {
    type: 'boundary';
    trial: string;
    open: boolean;
    gasFormula: string | null;
    groups: number;
}) & {
    id: string;
    run: string;
};
export type ReactionLabResponse = ({
    mode: 'change' | 'reaction';
    rows: readonly {
        id: string;
        classification: string;
        newSubstances: readonly string[];
        reason: string;
    }[];
} | {
    mode: 'roles';
    rows: readonly {
        caseId: string;
        formula: string;
        role: string;
    }[];
    placements: readonly {
        caseId: string;
        before: readonly string[];
        after: readonly string[];
    }[];
} | {
    mode: 'conservation';
    forecastInside: string;
    forecastOutside: string;
    locked: boolean;
    observed: boolean;
    actions: readonly ReactionAction[];
    predictionUnit: string;
    reflection: string;
    inside: string;
    outside: string;
    whole: string;
    unit: string;
} | {
    mode: 'rearrange';
    molecules: readonly {
        id: string;
        formula: string;
        atomIds: readonly string[];
    }[];
    bonds: readonly ReactionBond[];
    beforeAtoms: AtomInventory;
    afterAtoms: AtomInventory;
} | {
    mode: 'energy';
    rows: readonly {
        id: string;
        systemChange: string;
        surroundingsChange: string;
        direction: string;
        term: string;
        activation: string;
    }[];
} | {
    mode: 'rate';
    plan?: {
        factor: ReactionFactor;
        configurations: readonly [
            ReactionConfiguration,
            ReactionConfiguration
        ];
        forecast: ReactionRelation;
    };
    actions: readonly ReactionAction[];
    readings: readonly {
        trial: string;
        timeS: number;
        productMass: string;
        unit: string;
    }[];
    delta: readonly [
        string,
        string
    ];
    duration: string;
    quantityUnit: string;
    rates: readonly [
        string,
        string
    ];
    rateUnit: string;
    relation: string;
    yieldRelation: string;
    reflection: string;
    boundaryScope: string;
}) & {
    kind: 'reaction-lab';
    review?: ReactionObservation;
};
export interface ReactionLabVerdict {
    ok: boolean;
    why?: string;
    pendingReview?: true;
    observedByAdult?: true;
    assisted?: true;
}
// Rounded classroom relative masses. A picture token represents an equal-size atom group, not a milligram-mass individual atom.
export const reactionRelativeMass: Partial<Record<ChemicalElement, number>> = { H: 1, C: 12, N: 14, O: 16, Na: 23, Mg: 24, Al: 27, Si: 28, P: 31, S: 32, Cl: 35, Ca: 40, Fe: 56, Zn: 65 };
const species = (formula: string, name: string, phase: ReactionPhase, coefficient = 1): ReactionSpecies => ({ formula, name, phase, coefficient });
export const reactionRecipes: readonly ReactionRecipe[] = [
    { id: 'water-form', name: 'Veden muodostumisen mallikuva', reactants: [species('H2', 'vety', 'gas', 2), species('O2', 'happi', 'gas')], products: [species('H2O', 'vesi', 'liquid', 2)], condition: 'Valmiiksi määritetty virtuaalinen lähtötilanne. Tarkastellaan mallin atomijärjestelyä.', activation: 8, netEnergy: -12, energyUnit: 'model-unit' },
    { id: 'water-split', name: 'Veden sähköisen hajotuksen mallikuva', reactants: [species('H2O', 'vesi', 'liquid', 2)], products: [species('H2', 'vety', 'gas', 2), species('O2', 'happi', 'gas')], condition: 'Virtuaalinen ulkoinen energialähde ylläpitää annettua mallimuutosta.', activation: 6, netEnergy: 12, energyUnit: 'model-unit' },
    { id: 'peroxide', name: 'Vetyperoksidin hajoamisen rajattu malli', reactants: [species('H2O2', 'vetyperoksidi', 'aqueous', 2)], products: [species('H2O', 'vesi', 'liquid', 2), species('O2', 'happi', 'gas')], condition: 'Suljettu virtuaalinen aine- ja aikamalli. Opetuskertoimet on annettu erikseen.', activation: 5, netEnergy: -7, energyUnit: 'model-unit' },
    { id: 'carbon', name: 'Hiilen ja hapen mallireaktio', reactants: [species('C', 'hiili', 'solid'), species('O2', 'happi', 'gas')], products: [species('CO2', 'hiilidioksidi', 'gas')], condition: 'Valmis virtuaalinen reaktiotilanne. Pelkkä kuva ei ole toimintaohje.', activation: 9, netEnergy: -15, energyUnit: 'model-unit' },
    { id: 'carbonate', name: 'Kalsiumkarbonaatin hajoamisen mallikuva', reactants: [species('CaCO3', 'kalsiumkarbonaatti', 'solid')], products: [species('CaO', 'kalsiumoksidi', 'solid'), species('CO2', 'hiilidioksidi', 'gas')], condition: 'Mallin ulkoinen energialähde ylläpitää muutosta suljetussa kammiossa.', activation: 10, netEnergy: 11, energyUnit: 'model-unit' },
    { id: 'methane', name: 'Metaanin palamisen annettu muistikuva', reactants: [species('CH4', 'metaani', 'gas'), species('O2', 'happi', 'gas', 2)], products: [species('CO2', 'hiilidioksidi', 'gas'), species('H2O', 'vesihöyry', 'gas', 2)], condition: 'Valmis virtuaalinen tallenne, jonka ainekortit on annettu.', activation: 7, netEnergy: -14, energyUnit: 'model-unit' },
    { id: 'magnesium', name: 'Magnesiumin ja hapen rajattu mallireaktio', reactants: [species('Mg', 'magnesium', 'solid', 2), species('O2', 'happi', 'gas')], products: [species('MgO', 'magnesiumoksidin hilayksikkö', 'solid', 2)], condition: 'Valmiiksi määritetty virtuaalinen tilanne, tuotteena jatkuvan ionirakenteen koostumus.', activation: 7, netEnergy: -16, energyUnit: 'model-unit' },
    { id: 'ethanol', name: 'Etanolin palamisen annettu muistikuva', reactants: [species('C2H6O', 'etanoli', 'liquid'), species('O2', 'happi', 'gas', 3)], products: [species('CO2', 'hiilidioksidi', 'gas', 2), species('H2O', 'vesihöyry', 'gas', 3)], condition: 'Valmis virtuaalinen tallenne ja sen ainekortit.', activation: 7, netEnergy: -13, energyUnit: 'model-unit' },
    { id: 'cellulose', name: 'Puun kuivaa selluloosaosaa kuvaava palamismalli', reactants: [species('C6H10O5', 'selluloosan mallitoistoyksikkö', 'solid'), species('O2', 'happi', 'gas', 6)], products: [species('CO2', 'hiilidioksidi', 'gas', 6), species('H2O', 'vesihöyry', 'gas', 5)], condition: 'Puun palamisen annettu muistikuva. Mineraalinen tuhka on erillinen muuttumaton osa.', activation: 8, netEnergy: -18, energyUnit: 'model-unit' },
];
export const reactionRecipe = (id: string) => reactionRecipes.find(r => r.id === id);
export function reactionInventory(speciesList: readonly ReactionSpecies[], groups = 1): AtomInventory | undefined {
    if (!Number.isSafeInteger(groups) || groups < 0 || groups > 32)
        return;
    const inventory: AtomInventory = {};
    for (const s of speciesList) {
        const atoms = parseChemicalFormula(s.formula)?.atoms;
        if (!atoms || !Number.isSafeInteger(s.coefficient) || s.coefficient < 1 || s.coefficient > 16)
            return;
        for (const [element, count] of Object.entries(atoms))
            inventory[element as ChemicalElement] = (inventory[element as ChemicalElement] ?? 0) + count * s.coefficient * groups;
    }
    return inventory;
}
export function reactionFormulaMass(formula: string): number | undefined {
    const atoms = parseChemicalFormula(formula)?.atoms;
    if (!atoms)
        return;
    let mass = 0;
    for (const [element, count] of Object.entries(atoms)) {
        const weight = reactionRelativeMass[element as ChemicalElement];
        if (weight === undefined)
            return;
        mass += weight * count;
    }
    return mass;
}
export function reactionMass(speciesList: readonly ReactionSpecies[], groups: number, scaleMg: number): number | undefined {
    if (!Number.isSafeInteger(groups) || groups < 0 || groups > 32 || !Number.isSafeInteger(scaleMg) || scaleMg < 1 || scaleMg > 100)
        return;
    let mass = 0;
    for (const s of speciesList) {
        const unit = reactionFormulaMass(s.formula);
        if (unit === undefined)
            return;
        mass += unit * s.coefficient * groups * scaleMg;
    }
    return mass;
}
export function reactionShapeArea(shape: ReactionShape): ReactionRational | undefined {
    if (!atomicOwn(shape, ['width', 'height', 'depth', 'cuts']) || ![shape.width, shape.height, shape.depth].every(n => Number.isSafeInteger(n) && n > 0 && n <= 12)
        || !atomicDense(shape.cuts, 3) || shape.cuts.length !== 3 || !shape.cuts.every(n => typeof n === 'number' && Number.isSafeInteger(n) && n >= 1 && n <= 4))
        return;
    const [nx, ny, nz] = shape.cuts;
    if (nx * ny * nz > 64)
        return;
    return [2n * (BigInt(shape.width * shape.height * nz) + BigInt(shape.width * shape.depth * ny) + BigInt(shape.height * shape.depth * nx)), 1n];
}
export const reactionNumber = (raw: unknown) => typeof raw === 'string' && raw.length <= 32 ? parseMeasure(raw) : undefined;
export function reactionEqual(raw: unknown, expected: ReactionRational): boolean { const value = reactionNumber(raw); return !!value && value[0] * expected[1] === expected[0] * value[1]; }
interface ReactionUnitBank {
    atoms: ReactionAtom[];
    units: ReactionUnit[];
}
const safeInteger = (value: unknown, minimum = 0, maximum = 1000000): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= minimum && value <= maximum;
function makeReactionUnits(list: readonly ReactionSpecies[], groups: number, prefix: string): ReactionUnitBank | undefined {
    if (!safeInteger(groups, 0, 32))
        return;
    const atoms: ReactionAtom[] = [], units: ReactionUnit[] = [];
    for (const [si, s] of list.entries()) {
        const parsed = parseChemicalFormula(s.formula);
        if (!parsed || !safeInteger(s.coefficient, 1, 64))
            return;
        for (let n = 0; n < s.coefficient * groups; n++) {
            const id = `${prefix}-${si + 1}-${n + 1}`, atomIds: string[] = [];
            for (const [element, count] of Object.entries(parsed.atoms))
                for (let k = 0; k < count; k++) {
                    const atomId = `${prefix === 'reactant' ? 'R' : prefix === 'excess' ? 'E' : prefix === 'outside' ? 'S' : 'P'}${atoms.length + 1}`;
                    atomIds.push(atomId);
                    atoms.push({ id: atomId, element: element as ChemicalElement });
                }
            units.push({ id, formula: s.formula, name: s.name, phase: s.phase, atomIds });
        }
    }
    return atoms.length <= 256 ? { atoms, units } : undefined;
}
export function reactionAtomsInventory(atoms: readonly ReactionAtom[], ids?: ReadonlySet<string>): AtomInventory {
    const result: AtomInventory = {};
    for (const atom of atoms)
        if (!ids || ids.has(atom.id))
            result[atom.element] = (result[atom.element] ?? 0) + 1;
    return result;
}
function reactionUnitMass(units: readonly ReactionUnit[], scaleMg: number): number | undefined {
    let mass = 0;
    for (const unit of units) {
        const value = reactionFormulaMass(unit.formula);
        if (value === undefined)
            return;
        mass += value * scaleMg;
    }
    return mass;
}
/** Each product slot is filled from the original atom identities. A state never creates an atom. */
export function reactionMaterialState(recipe: ReactionRecipe, groups: number, extent: number, scaleMg: number, boundary: ReactionBoundary = { open: false, gasFormula: null, escapedGroups: 0 }, extraReactants: readonly ReactionSpecies[] = [], outsideInitialGroups = 0): ReactionMaterialState | undefined {
    if (!safeInteger(groups, 1, 16) || !safeInteger(extent, 0, groups) || !safeInteger(scaleMg, 1, 100) || !safeInteger(outsideInitialGroups, 0, 8)
        || !atomicOwn(boundary, ['open', 'gasFormula', 'escapedGroups']) || typeof boundary.open !== 'boolean' || !safeInteger(boundary.escapedGroups, 0, 64) || (!boundary.open && boundary.escapedGroups !== 0))
        return;
    const before = makeReactionUnits(recipe.reactants, groups, 'reactant'), extras = makeReactionUnits(extraReactants, 1, 'excess');
    if (!before || !extras)
        return;
    const left = reactionInventory(recipe.reactants), right = reactionInventory(recipe.products);
    if (!left || !right || new Set([...Object.keys(left), ...Object.keys(right)]).size > 16
        || !Object.keys({ ...left, ...right }).every(element => (left[element as ChemicalElement] ?? 0) === (right[element as ChemicalElement] ?? 0)))
        return;
    const atoms = [...before.atoms, ...extras.atoms];
    const activeUnits = before.units.filter(unit => { const si = recipe.reactants.findIndex(s => s.formula === unit.formula); const unitNumber = Number(unit.id.split('-').at(-1)); return unitNumber <= recipe.reactants[si]!.coefficient * extent; });
    const activeIds = new Set(activeUnits.flatMap(u => u.atomIds));
    const available = new Map<ChemicalElement, string[]>();
    for (const atom of atoms)
        if (activeIds.has(atom.id)) {
            const list = available.get(atom.element) ?? [];
            list.push(atom.id);
            available.set(atom.element, list);
        }
    const after = makeReactionUnits(recipe.products, extent, 'product');
    if (!after)
        return;
    const products: ReactionUnit[] = [];
    for (const unit of after.units) {
        const atomIds: string[] = [];
        for (const temporary of after.atoms.filter(a => unit.atomIds.includes(a.id))) {
            const actual = available.get(temporary.element)?.shift();
            if (!actual)
                return;
            atomIds.push(actual);
        }
        products.push({ ...unit, atomIds });
    }
    if ([...available.values()].some(ids => ids.length))
        return;
    const gas = boundary.gasFormula ? recipe.products.find(p => p.formula === boundary.gasFormula && p.phase === 'gas') : undefined;
    if ((boundary.open || outsideInitialGroups > 0) && !gas)
        return;
    const escaped = products.filter(p => p.formula === boundary.gasFormula).slice(0, boundary.escapedGroups);
    if (escaped.length !== boundary.escapedGroups)
        return;
    const outsideSeed = gas ? makeReactionUnits([{ ...gas, coefficient: 1 }], outsideInitialGroups, 'outside') : undefined;
    if (outsideSeed)
        atoms.push(...outsideSeed.atoms);
    if (atoms.length > 256)
        return;
    const escapedIds = new Set(escaped.map(u => u.id));
    const inside = [...before.units.filter(u => !activeUnits.includes(u)), ...extras.units, ...products.filter(u => !escapedIds.has(u.id))], outside = [...(outsideSeed?.units ?? []), ...escaped];
    const insideIds = new Set(inside.flatMap(u => u.atomIds)), outsideIds = new Set(outside.flatMap(u => u.atomIds));
    if (insideIds.size + outsideIds.size !== atoms.length || atoms.some(a => insideIds.has(a.id) === outsideIds.has(a.id)))
        return;
    const insideMassMg = reactionUnitMass(inside, scaleMg), outsideMassMg = reactionUnitMass(outside, scaleMg);
    if (insideMassMg === undefined || outsideMassMg === undefined)
        return;
    return { atoms, inside, outside, insideInventory: reactionAtomsInventory(atoms, insideIds), outsideInventory: reactionAtomsInventory(atoms, outsideIds), allInventory: reactionAtomsInventory(atoms), insideMassMg, outsideMassMg, totalMassMg: insideMassMg + outsideMassMg, extent };
}
export interface ReactionEnergyState {
    system: number;
    surroundings: number;
    borrowedActivation: number;
    netSystem: number;
    total: number;
}
/** Activation is tracked separately and returned at completion. Net energy follows completed extent. */
export function reactionEnergyState(recipe: ReactionRecipe, extent: number, started: boolean, completed: boolean, systemBefore = 800, surroundingsBefore = 800): ReactionEnergyState | undefined {
    if (!safeInteger(extent, 0, 16) || !safeInteger(systemBefore, 0, 10000) || !safeInteger(surroundingsBefore, 0, 10000) || typeof started !== 'boolean' || typeof completed !== 'boolean' || completed && !started || extent > 0 && !started)
        return;
    const borrowedActivation = started && !completed ? recipe.activation : 0, netSystem = extent * recipe.netEnergy, system = systemBefore + borrowedActivation + netSystem, surroundings = surroundingsBefore - borrowedActivation - netSystem;
    if (system < 0 || surroundings < 0)
        return;
    return { system, surroundings, borrowedActivation, netSystem, total: system + surroundings };
}
export function validReactionConfiguration(configuration: unknown, model: ReactionRateModel): configuration is ReactionConfiguration {
    if (!atomicOwn(configuration, ['temperatureC', 'concentration', 'shape', 'volumeUnits', 'extentLimit']))
        return false;
    return model.temperatures.some(t => t.value === configuration.temperatureC) && model.concentrations.some(c => c.value === configuration.concentration)
        && model.volumes.includes(configuration.volumeUnits as number) && safeInteger(configuration.volumeUnits, 1, 40) && safeInteger(configuration.extentLimit, 1, 8) && !!reactionShapeArea(configuration.shape as ReactionShape) && model.referenceShape.every((n, i) => n === [(configuration.shape as ReactionShape).width, (configuration.shape as ReactionShape).height, (configuration.shape as ReactionShape).depth][i]);
}
function multiplyReaction(a: ReactionRational, b: ReactionRational): ReactionRational { return [a[0] * b[0], a[1] * b[1]]; }
/** Constant normal interface retreat is an explicit authored teaching assumption. These are not laboratory rate constants. */
export function reactionRateCoefficient(model: ReactionRateModel, configuration: ReactionConfiguration): ReactionRational | undefined {
    if (!validReactionConfiguration(configuration, model) || !safeInteger(model.referenceArea, 1, 10000) || !atomicDense(model.baseRate, 2) || model.baseRate.length !== 2 || !model.baseRate.every(n => safeInteger(n, 1, 1000)))
        return;
    const temperature = model.temperatures.find(t => t.value === configuration.temperatureC)!, concentration = model.concentrations.find(c => c.value === configuration.concentration)!;
    if (![temperature.factor, concentration.factor].every(pair => atomicDense(pair, 2) && pair.length === 2 && pair.every(n => safeInteger(n, 1, 1000))))
        return;
    let speed: ReactionRational = [BigInt(model.baseRate[0]), BigInt(model.baseRate[1])];
    for (const factor of [temperature.factor, concentration.factor])
        speed = multiplyReaction(speed, [BigInt(factor[0]), BigInt(factor[1])]);
    return speed;
}
export interface ReactionGeometryState {
    retreat: ReactionRational;
    remainingVolume: ReactionRational;
    initialVolume: number;
    fractionReacted: ReactionRational;
    extent: number;
}
export function reactionGeometryAt(model: ReactionRateModel, configuration: ReactionConfiguration, timeS: number): ReactionGeometryState | undefined {
    const speed = reactionRateCoefficient(model, configuration);
    if (!speed || !safeInteger(timeS, 0, model.secondsMaximum))
        return;
    const retreat: ReactionRational = [speed[0] * BigInt(timeS), speed[1]], shape = configuration.shape;
    const dimensions = [shape.width, shape.height, shape.depth];
    let remaining: ReactionRational = [BigInt(shape.cuts[0] * shape.cuts[1] * shape.cuts[2]), 1n];
    for (let i = 0; i < 3; i++) {
        const cut = BigInt(shape.cuts[i]!), dimension = BigInt(dimensions[i]!);
        const denominator = cut * retreat[1], numerator = dimension * retreat[1] - 2n * retreat[0] * cut;
        remaining = multiplyReaction(remaining, [numerator > 0n ? numerator : 0n, denominator]);
    }
    const initialVolume = shape.width * shape.height * shape.depth;
    const fractionReacted: ReactionRational = [BigInt(initialVolume) * remaining[1] - remaining[0], BigInt(initialVolume) * remaining[1]];
    const extent = Number(BigInt(configuration.extentLimit) * fractionReacted[0] / fractionReacted[1]);
    return { retreat, remainingVolume: remaining, initialVolume, fractionReacted, extent };
}
export function reactionExtentAt(model: ReactionRateModel, configuration: ReactionConfiguration, timeS: number): number | undefined { return reactionGeometryAt(model, configuration, timeS)?.extent; }
export function reactionRateReading(model: ReactionRateModel, configuration: ReactionConfiguration, trial: string, timeS: number, scaleMg: number): ReactionRateReading | undefined {
    const recipe = reactionRecipe(model.recipe), extent = reactionExtentAt(model, configuration, timeS);
    if (!recipe || extent === undefined || !safeInteger(scaleMg, 1, 100))
        return;
    const product = recipe.products.find(p => p.formula === model.product), formulaMass = product ? reactionFormulaMass(product.formula) : undefined;
    if (!product || formulaMass === undefined)
        return;
    const oxygen = recipe.reactants.find(s => s.formula === model.concentrationSpecies);
    if (!oxygen)
        return;
    const concentrationGroups = configuration.concentration * configuration.volumeUnits / 10, minimumGroups = configuration.extentLimit * oxygen.coefficient;
    if (!safeInteger(concentrationGroups, minimumGroups, 64))
        return;
    const excess = concentrationGroups - minimumGroups;
    const state = reactionMaterialState(recipe, configuration.extentLimit, extent, scaleMg, undefined, excess ? [{ ...oxygen, coefficient: excess }] : []);
    if (!state)
        return;
    return { trial, timeS, extent, productMassMg: formulaMass * product.coefficient * extent * scaleMg, insideMassMg: state.insideMassMg, outsideMassMg: state.outsideMassMg };
}
const rateTrials = ['A', 'B'] as const;
type ReactionTrialId = typeof rateTrials[number];
export interface ReactionTrialState {
    configuration: ReactionConfiguration;
    started: boolean;
    timeS: number;
    readings: readonly ReactionRateReading[];
}
export interface ReactionRateReplay {
    locked: boolean;
    forecast: ReactionRelation | null;
    factor: ReactionFactor | null;
    trials: Record<ReactionTrialId, ReactionTrialState>;
    actionCount: number;
}
export interface ReactionMassReplay {
    locked: boolean;
    prediction: {
        inside: string;
        outside: string;
        unit: 'mg' | 'g';
    } | null;
    started: boolean;
    observed: boolean;
    escapedGroups: number;
    state: ReactionMaterialState;
    actionCount: number;
}
const actionFields: Record<ReactionAction['type'], readonly string[]> = {
    configure: ['trial', 'configuration'], lock: ['factor', 'forecast'], 'lock-conservation': ['inside', 'outside', 'unit'], start: ['trial'], complete: ['trial'], advance: ['trial', 'seconds'], sample: ['trial'], boundary: ['trial', 'open', 'gasFormula', 'groups'],
};
const isRateTrial = (value: unknown): value is ReactionTrialId => value === 'A' || value === 'B';
const isReactionFactor = (value: unknown): value is ReactionFactor => value === 'temperature' || value === 'concentration' || value === 'surface';
const isReactionRelation = (value: unknown): value is ReactionRelation => value === 'faster' || value === 'same' || value === 'slower';
const sameCuts = (a: readonly number[], b: readonly number[]) => a.length === 3 && b.length === 3 && a.every((n, i) => n === b[i]);
export function sameReactionConfiguration(a: ReactionConfiguration, b: ReactionConfiguration): boolean {
    return a.temperatureC === b.temperatureC && a.concentration === b.concentration && a.volumeUnits === b.volumeUnits && a.extentLimit === b.extentLimit
        && a.shape.width === b.shape.width && a.shape.height === b.shape.height && a.shape.depth === b.shape.depth && sameCuts(a.shape.cuts, b.shape.cuts);
}
function copyReactionConfiguration(c: ReactionConfiguration): ReactionConfiguration { return { ...c, shape: { ...c.shape, cuts: [...c.shape.cuts] } }; }
export function reactionChangedFactor(a: ReactionConfiguration, b: ReactionConfiguration): ReactionFactor | undefined {
    if (a.volumeUnits !== b.volumeUnits || a.extentLimit !== b.extentLimit || a.shape.width !== b.shape.width || a.shape.height !== b.shape.height || a.shape.depth !== b.shape.depth)
        return;
    const changed: ReactionFactor[] = [];
    if (a.temperatureC !== b.temperatureC)
        changed.push('temperature');
    if (a.concentration !== b.concentration)
        changed.push('concentration');
    if (!sameCuts(a.shape.cuts, b.shape.cuts))
        changed.push('surface');
    return changed.length === 1 ? changed[0] : undefined;
}
function validReactionAction(raw: unknown, run: string): raw is ReactionAction {
    if (!['id', 'run', 'type'].every(key => !!raw && typeof raw === 'object' && Object.hasOwn(raw, key)) || typeof run !== 'string' || run.length < 1 || run.length > 80 || !atomicOwn(raw) || raw.run !== run || typeof raw.id !== 'string' || !/^a(?:[1-9]|[1-5][0-9]|6[0-4])$/.test(raw.id) || typeof raw.type !== 'string' || !Object.hasOwn(actionFields, raw.type))
        return false;
    return atomicOwn(raw, ['id', 'run', 'type', ...actionFields[raw.type as ReactionAction['type']]]);
}
/** Explicit structural comparison keeps replays independent of JSON property order. */
function sameReactionAction(a: ReactionAction, b: ReactionAction): boolean {
    if (a.type !== b.type || a.id !== b.id || a.run !== b.run)
        return false;
    switch (a.type) {
        case 'configure': return b.type === 'configure' && a.trial === b.trial && sameReactionConfiguration(a.configuration, b.configuration);
        case 'lock': return b.type === 'lock' && a.factor === b.factor && a.forecast === b.forecast;
        case 'lock-conservation': return b.type === 'lock-conservation' && a.inside === b.inside && a.outside === b.outside && a.unit === b.unit;
        case 'advance': return b.type === 'advance' && a.trial === b.trial && a.seconds === b.seconds;
        case 'boundary': return b.type === 'boundary' && a.trial === b.trial && a.open === b.open && a.gasFormula === b.gasFormula && a.groups === b.groups;
        case 'start':
        case 'sample':
        case 'complete': return 'trial' in b && a.trial === b.trial;
    }
}
function validRateConfigurationForTask(task: ReactionRateTask, raw: unknown): raw is ReactionConfiguration {
    return validReactionConfiguration(raw, task.model) && raw.extentLimit === task.initial[0].extentLimit
        && task.cutOptions.some(cuts => sameCuts(cuts, raw.shape.cuts)) && reactionRateReading(task.model, raw, 'A', 0, task.massScaleMg) !== undefined;
}
/** A run or a sample is an experimental action, never a mastery event. */
export function replayReactionRate(task: ReactionRateTask & {
    run: string;
}, raw: unknown): ReactionRateReplay | undefined {
    if (!atomicDense(raw, 64) || !validRateConfigurationForTask(task, task.initial[0]) || !validRateConfigurationForTask(task, task.initial[1]))
        return;
    const result: ReactionRateReplay = { locked: false, forecast: null, factor: null, trials: { A: { configuration: copyReactionConfiguration(task.initial[0]), started: false, timeS: 0, readings: [] }, B: { configuration: copyReactionConfiguration(task.initial[1]), started: false, timeS: 0, readings: [] } }, actionCount: 0 };
    const used = new Map<string, ReactionAction>();
    for (const value of raw) {
        if (!validReactionAction(value, task.run))
            return;
        const action = value;
        if (action.type === 'configure') {
            if (!isRateTrial(action.trial) || !validRateConfigurationForTask(task, action.configuration))
                return;
            if (action.trial === 'A' && !sameReactionConfiguration(action.configuration, task.initial[0]))
                return;
        }
        else if (action.type === 'lock') {
            if (!isReactionFactor(action.factor) || !task.allowedFactors.includes(action.factor) || !isReactionRelation(action.forecast))
                return;
        }
        else if (action.type === 'start' || action.type === 'advance' || action.type === 'sample') {
            if (!isRateTrial(action.trial) || action.type === 'advance' && !safeInteger(action.seconds, 1, task.model.secondsMaximum))
                return;
        }
        else
            return;
        const previous = used.get(action.id);
        if (previous) {
            if (!sameReactionAction(previous, action))
                return;
            continue;
        }
        used.set(action.id, action);
        switch (action.type) {
            case 'configure':
                if (result.locked)
                    return;
                result.trials[action.trial as ReactionTrialId].configuration = copyReactionConfiguration(action.configuration);
                break;
            case 'lock':
                if (result.locked)
                    return;
                result.locked = true;
                result.factor = action.factor;
                result.forecast = action.forecast;
                break;
            case 'start': {
                const trial = result.trials[action.trial as ReactionTrialId];
                if (!result.locked || trial.started)
                    return;
                trial.started = true;
                break;
            }
            case 'advance': {
                const trial = result.trials[action.trial as ReactionTrialId];
                if (!trial.started || trial.timeS + action.seconds > task.model.secondsMaximum)
                    return;
                trial.timeS += action.seconds;
                break;
            }
            case 'sample': {
                const trial = result.trials[action.trial as ReactionTrialId];
                if (!trial.started)
                    return;
                const reading = reactionRateReading(task.model, trial.configuration, action.trial, trial.timeS, task.massScaleMg);
                if (!reading)
                    return;
                trial.readings = [...trial.readings, reading];
                break;
            }
        }
    }
    result.actionCount = used.size;
    return result;
}
export function replayReactionConservation(task: ReactionConservationTask & {
    run: string;
}, raw: unknown): ReactionMassReplay | undefined {
    const recipe = reactionRecipe(task.recipe);
    if (!recipe || !atomicDense(raw, 64))
        return;
    const before = reactionMaterialState(recipe, task.groups, 0, task.massScaleMg, { open: false, gasFormula: task.boundary.gasFormula, escapedGroups: 0 }, [], task.outsideInitialGroups);
    if (!before)
        return;
    const result: ReactionMassReplay = { locked: false, prediction: null, started: false, observed: false, escapedGroups: 0, state: before, actionCount: 0 }, used = new Map<string, ReactionAction>();
    for (const value of raw) {
        if (!validReactionAction(value, task.run))
            return;
        const action = value;
        if (action.type === 'lock-conservation') {
            if (!reactionNumber(action.inside) || !reactionNumber(action.outside) || (action.unit !== 'mg' && action.unit !== 'g'))
                return;
        }
        else if (action.type === 'start' || action.type === 'complete') {
            if (action.trial !== 'A')
                return;
        }
        else if (action.type === 'boundary') {
            if (action.trial !== 'A' || action.open !== true || action.gasFormula !== task.boundary.gasFormula || !safeInteger(action.groups, 1, 64))
                return;
        }
        else
            return;
        const previous = used.get(action.id);
        if (previous) {
            if (!sameReactionAction(previous, action))
                return;
            continue;
        }
        used.set(action.id, action);
        switch (action.type) {
            case 'lock-conservation':
                if (result.locked || result.started)
                    return;
                result.locked = true;
                result.prediction = { inside: action.inside, outside: action.outside, unit: action.unit };
                break;
            case 'start':
                if (!result.locked || result.started)
                    return;
                result.started = true;
                break;
            case 'complete': {
                if (!result.started || result.observed)
                    return;
                const state = reactionMaterialState(recipe, task.groups, task.groups, task.massScaleMg, { open: false, gasFormula: task.boundary.gasFormula, escapedGroups: 0 }, [], task.outsideInitialGroups);
                if (!state)
                    return;
                result.observed = true;
                result.state = state;
                break;
            }
            case 'boundary': {
                if (!result.observed || !task.boundary.open)
                    return;
                const escaped = result.escapedGroups + action.groups;
                const state = reactionMaterialState(recipe, task.groups, task.groups, task.massScaleMg, { open: true, gasFormula: task.boundary.gasFormula, escapedGroups: escaped }, [], task.outsideInitialGroups);
                if (!state)
                    return;
                result.escapedGroups = escaped;
                result.state = state;
                break;
            }
        }
    }
    result.actionCount = used.size;
    return result;
}
const responseFields: Record<ReactionLabTask['mode'], readonly string[]> = {
    change: ['rows'], reaction: ['rows'], roles: ['rows', 'placements'],
    conservation: ['forecastInside', 'forecastOutside', 'locked', 'observed', 'actions', 'predictionUnit', 'reflection', 'inside', 'outside', 'whole', 'unit'],
    rearrange: ['molecules', 'bonds', 'beforeAtoms', 'afterAtoms'], energy: ['rows'],
    rate: ['plan', 'actions', 'readings', 'delta', 'duration', 'quantityUnit', 'rates', 'rateUnit', 'relation', 'yieldRelation', 'reflection', 'boundaryScope'],
};
const member = (raw: unknown, values: readonly string[]): raw is string => typeof raw === 'string' && values.includes(raw);
const sameSet = (raw: unknown, wanted: readonly string[], maximum = 256): raw is string[] => atomicDense(raw, maximum) && raw.length === wanted.length && new Set(raw).size === raw.length && raw.every(s => typeof s === 'string' && wanted.includes(s));
const numeric = (raw: unknown) => typeof raw === 'string' && (raw === '' || !!reactionNumber(raw));
const equalsInteger = (raw: unknown, n: number) => safeInteger(n, -1000000, 1000000) && reactionEqual(raw, [BigInt(n), 1n]);
const massNumber = (raw: unknown, unit: unknown): ReactionRational | undefined => {
    const value = reactionNumber(raw);
    if (!value || (unit !== 'mg' && unit !== 'g'))
        return;
    return [value[0] * (unit === 'g' ? 1000n : 1n), value[1]];
};
const massEquals = (raw: unknown, unit: unknown, n: number) => { const q = massNumber(raw, unit); return !!q && q[0] === BigInt(n) * q[1]; };
function inventoryEquals(raw: unknown, wanted: AtomInventory): boolean {
    return atomicOwn(raw, Object.keys(wanted)) && Object.keys(raw).length === Object.keys(wanted).length && Object.entries(wanted).every(([s, n]) => Object.hasOwn(raw, s) && raw[s] === n);
}
export function reactionExplanation(task: ReactionLabTask): ObservedExplanationTask | undefined {
    return task.review ? { kind: 'observed-explanation', channel: 'spoken', givens: [{ label: 'Tutkimus', value: task.title }], ...task.review } : undefined;
}
function reactionReview(task: ReactionLabTask, response: ReactionLabResponse): ReactionLabVerdict {
    if (!task.review)
        return response.review === undefined ? { ok: true } : { ok: false, why: 'Tässä ikkunassa ei ole erillistä aikuisarviota.' };
    const review = response.review;
    if (!atomicOwn(review, ['observations', 'confirmedByAdult', 'assistance']) || !atomicOwn(review.observations, task.review.rubric.map(r => r.id)))
        return { ok: false, pendingReview: true, why: 'Oma selitys odottaa aikuisen havaintoa. Tekstiä tai ääntä ei tallenneta.' };
    return checkObservedExplanation(reactionExplanation(task)!, { kind: 'observed-explanation', channel: 'spoken', observations: review.observations as ReactionObservation['observations'], confirmedByAdult: review.confirmedByAdult === true, assistance: review.assistance as ReactionObservation['assistance'] });
}
export function reactionChangeFacts(c: ReactionCase): {
    classification: string;
    newSubstances: string[];
    reason: string;
} {
    if (c.identityEvidence === 'appearance-only')
        return { classification: 'insufficient', newSubstances: [], reason: 'need-data' };
    const before = new Set(c.before.map(s => s.id)), newSubstances = c.after.filter(s => !before.has(s.id)).map(s => s.id);
    return { classification: newSubstances.length ? 'chemical' : 'physical', newSubstances, reason: newSubstances.length ? 'new-identity' : 'same-identity' };
}
function changeOkay(task: ReactionChangeTask, response: Extract<ReactionLabResponse, {
    mode: 'change' | 'reaction';
}>): boolean {
    return atomicDense(response.rows, 8) && response.rows.length === task.cases.length && new Set(response.rows.map(r => atomicOwn(r) ? r.id : null)).size === task.cases.length && task.cases.every(c => {
        const row = response.rows.find(r => atomicOwn(r, ['id', 'classification', 'newSubstances', 'reason']) && r.id === c.id), wanted = reactionChangeFacts(c);
        return !!row && row.classification === wanted.classification && row.reason === wanted.reason && sameSet(row.newSubstances, wanted.newSubstances, 8);
    });
}
function rolesOkay(task: ReactionRolesTask, response: Extract<ReactionLabResponse, {
    mode: 'roles';
}>): boolean {
    if (!atomicDense(response.rows, 32) || !atomicDense(response.placements, 4) || response.placements.length !== task.cases.length)
        return false;
    const rows = task.cases.flatMap(c => { const recipe = reactionRecipe(c.recipe)!; return [...recipe.reactants.map(s => ({ caseId: c.id, formula: s.formula, role: 'reactant' })), ...recipe.products.map(s => ({ caseId: c.id, formula: s.formula, role: 'product' }))]; });
    if (rows.length !== response.rows.length || new Set(response.rows.map(r => atomicOwn(r) ? `${r.caseId}|${r.formula}|${r.role}` : null)).size !== rows.length)
        return false;
    return rows.every(w => response.rows.some(r => atomicOwn(r, ['caseId', 'formula', 'role']) && r.caseId === w.caseId && r.formula === w.formula && r.role === w.role))
        && new Set(response.placements.map(p => atomicOwn(p) ? p.caseId : null)).size === task.cases.length && task.cases.every(c => {
        const recipe = reactionRecipe(c.recipe)!, p = response.placements.find(p => atomicOwn(p, ['caseId', 'before', 'after']) && p.caseId === c.id);
        return !!p && sameSet(p.before, recipe.reactants.map(s => s.formula), 8) && sameSet(p.after, recipe.products.map(s => s.formula), 8);
    });
}
function conservationOkay(task: ReactionConservationTask & {
    run: string;
}, response: Extract<ReactionLabResponse, {
    mode: 'conservation';
}>): boolean {
    const replay = replayReactionConservation(task, response.actions);
    if (!replay?.observed || !replay.prediction || response.locked !== true || response.observed !== true || replay.escapedGroups !== task.boundary.escapedGroups)
        return false;
    const { state, prediction } = replay;
    if (!numeric(response.forecastInside) || !numeric(response.forecastOutside) || response.predictionUnit !== prediction.unit || !reactionNumber(prediction.inside) || !reactionNumber(prediction.outside)
        || !reactionEqual(response.forecastInside, reactionNumber(prediction.inside)!) || !reactionEqual(response.forecastOutside, reactionNumber(prediction.outside)!))
        return false;
    const confirmed = massEquals(prediction.inside, prediction.unit, state.insideMassMg) && massEquals(prediction.outside, prediction.unit, state.outsideMassMg);
    return response.reflection === (confirmed ? 'confirmed' : 'revised') && massEquals(response.inside, response.unit, state.insideMassMg) && massEquals(response.outside, response.unit, state.outsideMassMg) && massEquals(response.whole, response.unit, state.totalMassMg);
}
function rearrangeOkay(task: ReactionRearrangeTask, response: Extract<ReactionLabResponse, {
    mode: 'rearrange';
}>): boolean {
    const recipe = reactionRecipe(task.recipe), before = recipe ? reactionMaterialState(recipe, task.groups, 0, task.massScaleMg) : undefined;
    if (!recipe || !before || !atomicDense(response.molecules, 32) || !atomicDense(response.bonds, 64) || !inventoryEquals(response.beforeAtoms, before.allInventory) || !inventoryEquals(response.afterAtoms, before.allInventory))
        return false;
    const wanted = recipe.products.flatMap(s => Array.from({ length: s.coefficient * task.groups }, () => s.formula));
    if (response.molecules.length !== wanted.length || new Set(response.molecules.map(m => atomicOwn(m) ? m.id : null)).size !== wanted.length)
        return false;
    const used: string[] = [];
    for (const molecule of response.molecules) {
        if (!atomicOwn(molecule, ['id', 'formula', 'atomIds']) || typeof molecule.id !== 'string' || !/^p(?:[1-9]|[12][0-9]|3[0-2])$/.test(molecule.id) || !member(molecule.formula, wanted) || !atomicDense(molecule.atomIds, 32) || new Set(molecule.atomIds).size !== molecule.atomIds.length || !molecule.atomIds.every(id => typeof id === 'string'))
            return false;
        const composition = parseChemicalFormula(molecule.formula)?.atoms;
        if (!composition)
            return false;
        if (wanted.filter(s => s === molecule.formula).length !== response.molecules.filter(m => atomicOwn(m) && m.formula === molecule.formula).length)
            return false;
        const selected = molecule.atomIds;
        if (selected.some(id => !before.atoms.some(a => a.id === id)))
            return false;
        used.push(...selected);
        const bonds = response.bonds.filter(b => atomicOwn(b) && selected.includes(b.a as string) && selected.includes(b.b as string));
        if (!checkAtomicBuild({ mode: 'build', structure: 'molecule', compound: molecule.formula, composition, bank: before.atoms.map(a => ({ id: a.id, symbol: a.element })), valences: { H: 1, O: 2, C: 4 } }, { kind: 'atomic-world', mode: 'build', selected, bonds, placements: [] }))
            return false;
    }
    if (!sameSet(used, before.atoms.map(a => a.id)))
        return false;
    return response.bonds.every(b => atomicOwn(b, ['a', 'b', 'order']) && response.molecules.some(m => m.atomIds.includes(b.a) && m.atomIds.includes(b.b)));
}
function energyOkay(task: ReactionEnergyTask, response: Extract<ReactionLabResponse, {
    mode: 'energy';
}>): boolean {
    return atomicDense(response.rows, 4) && response.rows.length === task.cases.length && new Set(response.rows.map(r => atomicOwn(r) ? r.id : null)).size === task.cases.length && task.cases.every(c => {
        const recipe = reactionRecipe(c.recipe)!, row = response.rows.find(r => atomicOwn(r, ['id', 'systemChange', 'surroundingsChange', 'direction', 'term', 'activation']) && r.id === c.id), net = c.extents * recipe.netEnergy;
        return !!row && equalsInteger(row.systemChange, net) && equalsInteger(row.surroundingsChange, -net) && equalsInteger(row.activation, recipe.activation) && row.direction === (net < 0 ? 'out' : 'in') && row.term === (net < 0 ? 'exothermic' : 'endothermic');
    });
}
export interface ReactionRateAnalysis {
    readings: readonly ReactionRateReading[];
    delta: readonly [
        number,
        number
    ];
    duration: number;
    relation: ReactionRelation;
    forecast: ReactionRelation | null;
}
export function reactionRateAnalysis(task: ReactionRateTask & {
    run: string;
}, response?: Extract<ReactionLabResponse, {
    mode: 'rate';
}>): ReactionRateAnalysis | undefined {
    let readings: readonly ReactionRateReading[], forecast: ReactionRelation | null = null;
    if (task.activity === 'compare-data' || task.activity === 'produce-window') {
        if (response && (response.plan !== undefined || !atomicDense(response.actions, 0)))
            return;
        readings = task.givenReadings ?? [];
    }
    else {
        if (!response || !atomicOwn(response.plan, ['factor', 'configurations', 'forecast']) || !atomicDense(response.plan.configurations, 2) || response.plan.configurations.length !== 2)
            return;
        const replay = replayReactionRate(task, response.actions);
        if (!replay?.locked || !replay.trials.A.started || !replay.trials.B.started)
            return;
        if (!response.plan.configurations.every(c => validRateConfigurationForTask(task, c)) || !sameReactionConfiguration(response.plan.configurations[0]!, replay.trials.A.configuration) || !sameReactionConfiguration(response.plan.configurations[1]!, replay.trials.B.configuration)
            || response.plan.factor !== replay.factor || response.plan.forecast !== replay.forecast || reactionChangedFactor(response.plan.configurations[0]!, response.plan.configurations[1]!) !== replay.factor)
            return;
        readings = [...replay.trials.A.readings, ...replay.trials.B.readings];
        forecast = replay.forecast;
    }
    const required = rateTrials.flatMap(trial => task.interval.map(time => readings.find(r => r.trial === trial && r.timeS === time)));
    if (required.some(r => !r) || task.interval[1] <= task.interval[0])
        return;
    const selected = required as ReactionRateReading[], delta = [selected[1]!.productMassMg - selected[0]!.productMassMg, selected[3]!.productMassMg - selected[2]!.productMassMg] as const;
    return { readings: selected, delta, duration: task.interval[1] - task.interval[0], relation: delta[1] > delta[0] ? 'faster' : delta[1] < delta[0] ? 'slower' : 'same', forecast };
}
function rateOkay(task: ReactionRateTask & {
    run: string;
}, response: Extract<ReactionLabResponse, {
    mode: 'rate';
}>): boolean {
    const analysis = reactionRateAnalysis(task, response);
    if (!analysis || !atomicDense(response.readings, 4) || response.readings.length !== 4 || !atomicDense(response.delta, 2) || response.delta.length !== 2 || !atomicDense(response.rates, 2) || response.rates.length !== 2)
        return false;
    if (new Set(response.readings.map(r => atomicOwn(r) ? `${r.trial}|${r.timeS}` : null)).size !== 4)
        return false;
    if (!analysis.readings.every(g => response.readings.some(r => atomicOwn(r, ['trial', 'timeS', 'productMass', 'unit']) && r.trial === g.trial && r.timeS === g.timeS && massEquals(r.productMass, r.unit, g.productMassMg))))
        return false;
    const maximum = task.initial.map(c => { const product = reactionRecipe(task.model.recipe)!.products.find(s => s.formula === task.model.product)!; return reactionFormulaMass(product.formula)! * product.coefficient * c.extentLimit * task.massScaleMg; });
    const yieldRelation = maximum[1]! > maximum[0]! ? 'more' : maximum[1]! < maximum[0]! ? 'less' : 'same';
    if (response.yieldRelation !== (task.skill === 'compare' ? yieldRelation : ''))
        return false;
    const unit = response.rateUnit === 'mg/s' ? 'mg' : response.rateUnit === 'g/s' ? 'g' : undefined;
    return !!unit && response.delta.every((d, i) => massEquals(d, response.quantityUnit, analysis.delta[i]!)) && equalsInteger(response.duration, analysis.duration)
        && response.rates.every((r, i) => { const q = massNumber(r, unit); return !!q && q[0] * BigInt(analysis.duration) === BigInt(analysis.delta[i]!) * q[1]; })
        && response.relation === analysis.relation && response.reflection === (analysis.forecast === null ? 'data-only' : analysis.forecast === analysis.relation ? 'confirmed' : 'revised') && response.boundaryScope === (analysis.forecast === null ? 'given-window' : 'model-only');
}
function reactionActivity(task: ReactionLabTask, response: ReactionLabResponse): boolean {
    if (task.mode !== response.mode)
        return false;
    switch (task.mode) {
        case 'change':
        case 'reaction': return (response.mode === 'change' || response.mode === 'reaction') && changeOkay(task, response);
        case 'roles': return response.mode === 'roles' && rolesOkay(task, response);
        case 'conservation': return response.mode === 'conservation' && conservationOkay(task, response);
        case 'rearrange': return response.mode === 'rearrange' && rearrangeOkay(task, response);
        case 'energy': return response.mode === 'energy' && energyOkay(task, response);
        case 'rate': return response.mode === 'rate' && rateOkay(task, response);
    }
}
export const reactionFeedback: Record<ReactionLabTask['mode'], string> = {
    change: 'Pelkkä muodon, värin tai kuplien muutos ei yksin osoita uutta ainetta. Vertaa annettuja aineiden tunnistustietoja ennen ja jälkeen.',
    reaction: 'Erottele havainto ja aineen tunnistaminen. Kiehuvan veden kuplat voivat olla samaa H2O-ainetta, vaikka kuplia syntyy.',
    roles: 'Lähtöaine on tämän reaktion alussa, tuote sen jälkeen. Saman aineen rooli voi vaihtua toisessa reaktiossa.',
    conservation: 'Laske reaktiokammio ja keräysastia samaan kokonaisuuteen. Kaasun siirtyminen muuttaa osan massaa, mutta atomeja ei poistu koko tilistä. Ennustetta saa korjata havainnon jälkeen.',
    rearrange: 'Käytä jokainen alkuperäinen atomi kerran. Järjestä samat atomit annetuiksi tuotteiksi ja rakenna myös niiden sidokset. Tarkista kummankin puolen atomitili.',
    energy: 'Erota käynnistyksen lainattu energia ja reaktion nettomuutos. Eksoterminen kokonaisuus siirtää energiaa ympäristöön, vaikka alku vaatii energiaa.',
    rate: 'Vertaa tuotemäärän muutosta samalla aikavälillä ja jaa ajan muutoksella. Syyvertailussa vain yksi tekijä saa muuttua. Nopeus ja lopullinen saanto ovat eri asioita.',
};
export function checkReactionLab(task: ReactionLabTask, raw: unknown): ReactionLabVerdict {
    if (!atomicOwn(raw, ['kind', 'mode', 'review', ...responseFields[task.mode]]) || raw.kind !== 'reaction-lab' || raw.mode !== task.mode)
        return { ok: false, why: 'Tuota tämän tutkimusikkunan oma vastaus.' };
    const response = raw as ReactionLabResponse, review = reactionReview(task, response);
    if (review.pendingReview)
        return review;
    const activity = reactionActivity(task, response);
    return activity ? review : { ok: false, why: reactionFeedback[task.mode], ...(review.observedByAdult ? { observedByAdult: true as const } : {}), ...(review.assisted ? { assisted: true as const } : {}) };
}
export function reactionProductBonds(formula: string, atoms: readonly ReactionAtom[]): ReactionBond[] | undefined {
    const hydrogen = atoms.filter(a => a.element === 'H'), oxygen = atoms.filter(a => a.element === 'O'), carbon = atoms.filter(a => a.element === 'C');
    if (formula === 'H2' && hydrogen.length === 2)
        return [{ a: hydrogen[0]!.id, b: hydrogen[1]!.id, order: 1 }];
    if (formula === 'O2' && oxygen.length === 2)
        return [{ a: oxygen[0]!.id, b: oxygen[1]!.id, order: 2 }];
    if (formula === 'H2O' && hydrogen.length === 2 && oxygen.length === 1)
        return hydrogen.map(a => ({ a: oxygen[0]!.id, b: a.id, order: 1 }));
    if (formula === 'CO2' && carbon.length === 1 && oxygen.length === 2)
        return oxygen.map(a => ({ a: carbon[0]!.id, b: a.id, order: 2 }));
    return;
}
export function reactionControlledPlan(task: ReactionRateTask): readonly [
    ReactionConfiguration,
    ReactionConfiguration
] | undefined {
    const a = copyReactionConfiguration(task.initial[0]);
    const candidates = task.allowedFactors.flatMap(factor => {
        if (factor === 'temperature')
            return task.model.temperatures.map(t => ({ ...a, temperatureC: t.value }));
        if (factor === 'concentration')
            return task.model.concentrations.map(c => ({ ...a, concentration: c.value }));
        return task.cutOptions.map(cuts => ({ ...a, shape: { ...a.shape, cuts } }));
    });
    const b = candidates.find(c => validRateConfigurationForTask(task, c) && task.allowedFactors.includes(reactionChangedFactor(a, c)!) && reactionRateReading(task.model, a, 'A', task.interval[1], task.massScaleMg)?.productMassMg !== reactionRateReading(task.model, c, 'B', task.interval[1], task.massScaleMg)?.productMassMg);
    return b ? [a, b] : undefined;
}
export function reactionAction(task: {
    run: string;
}, index: number, action: Omit<Extract<ReactionAction, {
    type: 'start' | 'sample' | 'complete';
}>, 'id' | 'run'>): ReactionAction {
    return { ...action, id: `a${index}`, run: task.run };
}
type ReactionActionInput = ReactionAction extends infer Action ? Action extends ReactionAction ? Omit<Action, 'id' | 'run'> : never : never;
const quantityString = (value: number, divisor = 1) => divisor === 1 ? String(value) : `${value}/${divisor}`;
export function solutionReactionLab(task: ReactionLabTask): ReactionLabResponse {
    const kind = 'reaction-lab' as const;
    let answer: ReactionLabResponse;
    switch (task.mode) {
        case 'change':
        case 'reaction':
            answer = { kind, mode: task.mode, rows: task.cases.map(c => ({ id: c.id, ...reactionChangeFacts(c) })) };
            break;
        case 'roles':
            answer = { kind, mode: 'roles', rows: task.cases.flatMap(c => { const recipe = reactionRecipe(c.recipe)!; return [...recipe.reactants.map(s => ({ caseId: c.id, formula: s.formula, role: 'reactant' })), ...recipe.products.map(s => ({ caseId: c.id, formula: s.formula, role: 'product' }))]; }), placements: task.cases.map(c => { const recipe = reactionRecipe(c.recipe)!; return { caseId: c.id, before: recipe.reactants.map(s => s.formula), after: recipe.products.map(s => s.formula) }; }) };
            break;
        case 'conservation': {
            const target = reactionMaterialState(reactionRecipe(task.recipe)!, task.groups, task.groups, task.massScaleMg, task.boundary, [], task.outsideInitialGroups)!;
            const actions: ReactionAction[] = [{ type: 'lock-conservation', id: 'a1', run: task.run, inside: String(target.insideMassMg), outside: String(target.outsideMassMg), unit: 'mg' }, { type: 'start', id: 'a2', run: task.run, trial: 'A' }, { type: 'complete', id: 'a3', run: task.run, trial: 'A' }];
            if (task.boundary.open && task.boundary.escapedGroups)
                actions.push({ type: 'boundary', id: 'a4', run: task.run, trial: 'A', open: true, gasFormula: task.boundary.gasFormula, groups: task.boundary.escapedGroups });
            answer = { kind, mode: 'conservation', forecastInside: String(target.insideMassMg), forecastOutside: String(target.outsideMassMg), predictionUnit: 'mg', locked: true, observed: true, actions, reflection: 'confirmed', inside: String(target.insideMassMg), outside: String(target.outsideMassMg), whole: String(target.totalMassMg), unit: 'mg' };
            break;
        }
        case 'rearrange': {
            const state = reactionMaterialState(reactionRecipe(task.recipe)!, task.groups, task.groups, task.massScaleMg)!;
            const molecules = state.inside.map((u, i) => ({ id: `p${i + 1}`, formula: u.formula, atomIds: [...u.atomIds] }));
            const bonds = state.inside.flatMap(u => reactionProductBonds(u.formula, state.atoms.filter(a => u.atomIds.includes(a.id))) ?? []);
            answer = { kind, mode: 'rearrange', molecules, bonds, beforeAtoms: { ...state.allInventory }, afterAtoms: { ...state.allInventory } };
            break;
        }
        case 'energy':
            answer = { kind, mode: 'energy', rows: task.cases.map(c => { const r = reactionRecipe(c.recipe)!, net = c.extents * r.netEnergy; return { id: c.id, systemChange: String(net), surroundingsChange: String(-net), activation: String(r.activation), direction: net < 0 ? 'out' : 'in', term: net < 0 ? 'exothermic' : 'endothermic' }; }) };
            break;
        case 'rate': {
            const actions: ReactionAction[] = [];
            let plan: Extract<ReactionLabResponse, {
                mode: 'rate';
            }>['plan'];
            if (task.activity !== 'compare-data' && task.activity !== 'produce-window') {
                const configurations = reactionControlledPlan(task);
                if (!configurations)
                    throw new Error('Authored controlled task needs a valid observable comparison.');
                const factor = reactionChangedFactor(...configurations)!;
                plan = { factor, configurations, forecast: 'faster' };
                actions.push({ type: 'configure', id: 'a1', run: task.run, trial: 'B', configuration: configurations[1] }, { type: 'lock', id: 'a2', run: task.run, factor, forecast: 'faster' });
                for (const trial of rateTrials) {
                    const add = (action: ReactionActionInput) => actions.push({ ...action, id: `a${actions.length + 1}`, run: task.run } as ReactionAction);
                    add({ type: 'start', trial });
                    if (task.interval[0])
                        add({ type: 'advance', trial, seconds: task.interval[0] } as ReactionActionInput);
                    add({ type: 'sample', trial });
                    add({ type: 'advance', trial, seconds: task.interval[1] - task.interval[0] } as ReactionActionInput);
                    add({ type: 'sample', trial });
                }
            }
            const preliminary: Extract<ReactionLabResponse, {
                mode: 'rate';
            }> = { kind, mode: 'rate', ...(plan ? { plan } : {}), actions, readings: [], delta: ['', ''], duration: '', quantityUnit: 'mg', rates: ['', ''], rateUnit: 'mg/s', relation: '', yieldRelation: '', reflection: '', boundaryScope: '' };
            const analysis = reactionRateAnalysis(task, preliminary);
            if (!analysis)
                throw new Error('Authored task needs both observed endpoints.');
            answer = { ...preliminary, readings: analysis.readings.map(r => ({ trial: r.trial, timeS: r.timeS, productMass: String(r.productMassMg), unit: 'mg' })), delta: analysis.delta.map(String) as [
                    string,
                    string
                ], duration: String(analysis.duration), rates: analysis.delta.map(n => quantityString(n, analysis.duration)) as [
                    string,
                    string
                ], relation: analysis.relation, yieldRelation: task.skill === 'compare' ? (task.initial[1].extentLimit > task.initial[0].extentLimit ? 'more' : task.initial[1].extentLimit < task.initial[0].extentLimit ? 'less' : 'same') : '', reflection: analysis.forecast === null ? 'data-only' : analysis.forecast === analysis.relation ? 'confirmed' : 'revised', boundaryScope: analysis.forecast === null ? 'given-window' : 'model-only' };
            break;
        }
    }
    return task.review ? { ...answer, review: { observations: {}, confirmedByAdult: false, assistance: 'none' } } : answer;
}
export function wrongReactionLabResponses(task: ReactionLabTask): ReactionLabResponse[] {
    const correct = solutionReactionLab(task), review = task.review ? { observations: Object.fromEntries(task.review.rubric.map(r => [r.id, 'met' as const])), confirmedByAdult: true, assistance: 'none' as const } : undefined;
    const answer = { ...correct, ...(review ? { review } : {}) };
    switch (answer.mode) {
        case 'change':
        case 'reaction': return [{ ...answer, rows: answer.rows.map((r, i) => i ? r : { ...r, classification: r.classification === 'physical' ? 'chemical' : 'physical' }) }, { ...answer, rows: answer.rows.map((r, i) => i ? r : { ...r, reason: 'appearance-only' }) }];
        case 'roles': return [{ ...answer, rows: answer.rows.map((r, i) => i ? r : { ...r, role: r.role === 'reactant' ? 'product' : 'reactant' }) }, { ...answer, placements: [] }];
        case 'conservation': return [{ ...answer, whole: String(Number(answer.whole) + 1) }, { ...answer, actions: answer.actions.filter(a => a.type !== 'lock-conservation') }];
        case 'rearrange': return [{ ...answer, molecules: answer.molecules.map((m, i) => i ? m : { ...m, atomIds: m.atomIds.slice(1) }) }, { ...answer, bonds: answer.bonds.slice(1) }];
        case 'energy': return [{ ...answer, rows: answer.rows.map((r, i) => i ? r : { ...r, systemChange: String(-Number(r.systemChange)) }) }, { ...answer, rows: answer.rows.map((r, i) => i ? r : { ...r, activation: '0' }) }];
        case 'rate': return [{ ...answer, rates: ['999999', answer.rates[1]] }, { ...answer, duration: '0' }, { ...answer, boundaryScope: 'all-reactions' }, ...(answer.plan ? [{ ...answer, actions: answer.actions.filter(a => a.type !== 'sample') }] : [])];
    }
}
