import { parseMeasure } from './spatial-measures';
import { checkObservedExplanation, type ObservedExplanationTask, type CriterionObservation } from './observed-explanations';
/** Rounded factual teaching-table values, never a universal trend beyond the supplied rows. */
export const atomicWorldSources = [
    'https://iupac.org/what-we-do/periodic-table-of-elements/',
    'https://physics.nist.gov/cgi-bin/Compositions/stand_alone.pl?ele=&all=all&ascii=html&isotype=some',
    'https://openstax.org/books/chemistry-2e/pages/2-3-atomic-structure-and-symbolism',
    'https://openstax.org/books/chemistry-2e/pages/10-5-the-solid-state-of-matter',
    'https://openstax.org/books/chemistry-2e/pages/10-4-phase-diagrams',
    'https://periodic-table.rsc.org/',
] as const;
export interface AtomicElement {
    symbol: string;
    name: string;
    z: number;
    group: number;
    period: number;
    isotopes: readonly number[];
    meltingC?: number;
    boilingC?: number;
}
const elementRows: readonly (readonly [
    string,
    string,
    number,
    number,
    number,
    readonly number[]
])[] = [
    ['H', 'Vety', 1, 1, 1, [1, 2]], ['He', 'Helium', 2, 18, 1, [3, 4]], ['Li', 'Litium', 3, 1, 2, [6, 7]], ['Be', 'Beryllium', 4, 2, 2, [9]],
    ['B', 'Boori', 5, 13, 2, [10, 11]], ['C', 'Hiili', 6, 14, 2, [12, 13]], ['N', 'Typpi', 7, 15, 2, [14, 15]], ['O', 'Happi', 8, 16, 2, [16, 17, 18]],
    ['F', 'Fluori', 9, 17, 2, [19]], ['Ne', 'Neon', 10, 18, 2, [20, 21, 22]], ['Na', 'Natrium', 11, 1, 3, [23]], ['Mg', 'Magnesium', 12, 2, 3, [24, 25, 26]],
    ['Al', 'Alumiini', 13, 13, 3, [27]], ['Si', 'Pii', 14, 14, 3, [28, 29, 30]], ['P', 'Fosfori', 15, 15, 3, [31]], ['S', 'Rikki', 16, 16, 3, [32, 33, 34, 36]],
    ['Cl', 'Kloori', 17, 17, 3, [35, 37]], ['Ar', 'Argon', 18, 18, 3, [36, 38, 40]], ['K', 'Kalium', 19, 1, 4, [39, 41]], ['Ca', 'Kalsium', 20, 2, 4, [40, 42, 43, 44, 46, 48]],
    ['Br', 'Bromi', 35, 17, 4, [79, 81]], ['Kr', 'Krypton', 36, 18, 4, [84]], ['Rb', 'Rubidium', 37, 1, 5, [85, 87]],
    ['I', 'Jodi', 53, 17, 5, [127]], ['Xe', 'Ksenon', 54, 18, 5, [132]], ['Cs', 'Cesium', 55, 1, 6, [133]],
];
const phaseData: Record<string, readonly [
    number | undefined,
    number | undefined
]> = {
    Li: [180.5, 1342], Na: [97.794, 882.94], K: [63.5, 759], Rb: [39.3, 688], Cs: [28.5, 671],
    He: [undefined, -268.928], Ne: [-248.59, -246.046], Ar: [-189.34, -185.848], Kr: [-157.37, -153.415], Xe: [-111.75, -108.099],
    F: [-219.67, -188.11], Cl: [-101.5, -34.04], Br: [-7.2, 58.8], I: [113.7, 184.4],
};
export const atomicElements: readonly AtomicElement[] = elementRows.map(([symbol, name, z, group, period, isotopes]) => ({ symbol, name, z, group, period, isotopes,
    ...(phaseData[symbol]?.[0] !== undefined ? { meltingC: phaseData[symbol]![0] } : {}), ...(phaseData[symbol]?.[1] !== undefined ? { boilingC: phaseData[symbol]![1] } : {}) }));
export const atomicElement = (symbol: string) => atomicElements.find(e => e.symbol === symbol);
export type AtomicParticle = 'proton' | 'neutron' | 'electron';
export type AtomicPhase = 'solid' | 'liquid' | 'gas';
export type AtomicRegion = 'nucleus' | 'cloud';
export interface AtomicAtom {
    id: string;
    symbol: string;
    protons: number;
    neutrons: number;
    electrons: number;
}
export interface AtomicSpecies {
    id: string;
    label: string;
    atoms: readonly string[];
    units: number;
    structure: 'atom' | 'molecule' | 'lattice';
}
export interface AtomicSample {
    id: string;
    label: string;
    species: readonly AtomicSpecies[];
}
export interface AtomicReview {
    prompt: string;
    rubric: readonly {
        id: string;
        label: string;
        guide: string;
    }[];
    model: string;
}
export interface AtomicObservation {
    observations: Partial<Record<string, CriterionObservation>>;
    confirmedByAdult: boolean;
    assistance: 'none' | 'helped';
}
export interface AtomicSite {
    id: string;
    x: number;
    y: number;
    z: number;
}
export interface AtomicStructure {
    id: string;
    label: string;
    sites: readonly AtomicSite[];
    species: readonly [
        string,
        string
    ];
    rule: 'alternating' | 'molecular';
    property: string;
    reference: string;
    intervention: 'inspect' | 'shift';
}
export interface AtomicPhaseChamber {
    id: string;
    substance: 'water' | 'argon';
    count: number;
    phase: AtomicPhase;
    temperatureC: number;
    motion?: 'vibrate' | 'slide' | 'free' | 'stopped';
    spacing?: 'near' | 'open' | 'far';
}
export type AtomicAtomTask = {
    mode: 'atom';
    activity: 'link' | 'regions' | 'particle' | 'number';
    atoms: readonly AtomicAtom[];
    particle?: AtomicParticle;
    inverse?: boolean;
    style: 'cutaway' | 'cloud' | 'monochrome';
    sample?: {
        symbol: string;
        units: number;
        atomsPerUnit: number;
        appearance: string;
        state: 'solid' | 'gas';
    };
    comparison?: AtomicAtom;
};
export type AtomicSampleTask = {
    mode: 'sample';
    focus: 'element' | 'compound';
    samples: readonly AtomicSample[];
    context?: {
        kind: 'element';
        route: 'pure' | 'atomic' | 'either';
    };
};
export type AtomicBuildTask = {
    mode: 'build';
    structure: 'molecule';
    compound: string;
    composition: Readonly<Record<string, number>>;
    bank: readonly {
        id: string;
        symbol: string;
    }[];
    valences: Readonly<Record<string, number>>;
} | {
    mode: 'build';
    structure: 'lattice';
    compound: string;
    sites: readonly AtomicSite[];
    species: readonly [
        string,
        string
    ];
    counts: readonly [
        number,
        number
    ];
};
export type AtomicPeriodicTask = {
    mode: 'periodic';
    activity: 'order' | 'fill' | 'locate' | 'inverse';
    cards: readonly string[];
    target: string;
    table: readonly string[];
};
export type AtomicPropertyTask = {
    mode: 'property';
    group: 1 | 17 | 18;
    property: 'melting' | 'boiling' | 'state';
    references: readonly string[];
    target: string;
    comparison: string;
    temperatureC: number;
};
export type AtomicPhaseTask = {
    mode: 'phase';
    activity: 'interpret' | 'construct' | 'change';
    chambers: readonly AtomicPhaseChamber[];
    change?: 'melt' | 'vaporize' | 'condense';
    afterTemperatureC?: number;
};
export type AtomicModelTask = {
    mode: 'model-use';
    structures: readonly AtomicStructure[];
    particle?: {
        id: string;
        kind: 'diffusion' | 'heating';
        count: number;
        temperatureC: number;
        afterTemperatureC: number;
    };
};
export type AtomicScaleTask = {
    mode: 'scale';
    phenomenon: 'salt-crystal' | 'ice' | 'solution';
    cards: readonly {
        id: string;
        level: 'macro' | 'structure' | 'particle';
        source: 'observation' | 'model';
        label: string;
        phenomenon: string;
    }[];
};
export type AtomicWorldTask = (AtomicAtomTask | AtomicSampleTask | AtomicBuildTask | AtomicPeriodicTask | AtomicPropertyTask | AtomicPhaseTask | AtomicModelTask | AtomicScaleTask) & {
    kind: 'atomic-world';
    title: string;
    review?: AtomicReview;
};
export type AtomicWorldResponse = ({
    mode: 'atom';
    rows: readonly {
        id: string;
        symbol: string;
        number: string;
        particle: string;
        charge: string;
        region: string;
    }[];
    nucleus: string;
    cloud: string;
    literalScale: boolean | null;
    atomCount: string;
    unit: string;
    macroProperty: string;
    sameAtom: boolean | null;
    sampleAtom: string;
} | {
    mode: 'sample';
    rows: readonly {
        id: string;
        classification: string;
        kinds: string;
        units: string;
    }[];
} | {
    mode: 'build';
    selected: readonly string[];
    bonds: readonly {
        a: string;
        b: string;
        order: number;
    }[];
    placements: readonly {
        id: string;
        symbol: string;
    }[];
} | {
    mode: 'periodic';
    order: readonly string[];
    symbol: string;
    group: string;
    period: string;
} | {
    mode: 'property';
    forecast: string;
    locked: boolean;
    observed: boolean;
    group: string;
    comparison: string;
    result: string;
} | {
    mode: 'phase';
    rows: readonly {
        id: string;
        phase: string;
        motion: string;
        spacing: string;
        size: string;
    }[];
    forecast: string;
    locked: boolean;
    observed: boolean;
    identity: string;
    count: string;
    steps: readonly string[];
} | {
    mode: 'model-use';
    structures: readonly {
        id: string;
        placements: readonly {
            id: string;
            symbol: string;
        }[];
        model: string;
        literal: boolean | null;
        shifted: boolean;
    }[];
    particle: {
        model: string;
        forecast: string;
        locked: boolean;
        observed: boolean;
        count: string;
    } | null;
} | {
    mode: 'scale';
    order: readonly string[];
    links: readonly {
        id: string;
        phenomenon: string;
    }[];
    modelBoundary: string;
}) & {
    kind: 'atomic-world';
    review?: AtomicObservation;
};
export type AtomicWorldVerdict = {
    ok: boolean;
    why?: string;
    pendingReview?: true;
    observedByAdult?: true;
    assisted?: true;
};
export interface AtomicWorldScene {
    kind: 'atomic-world';
    title: string;
    mode: 'atom' | 'compound' | 'structure' | 'phase' | 'model-use';
    observed: boolean;
    phase: 'given' | 'forecast' | 'observed';
    motionMs: number;
    atoms: readonly AtomicAtom[];
    particles: readonly {
        id: string;
        symbol: string;
        x: number;
        y: number;
        z: number;
        radius: number;
        chamber: string;
    }[];
    bonds: readonly {
        a: string;
        b: string;
        order: number;
    }[];
    chambers: readonly AtomicPhaseChamber[];
    structures: readonly AtomicStructure[];
    sample?: AtomicAtomTask['sample'];
    selectedAtomId?: string;
    legend: string;
    view: 'before' | 'during' | 'after';
    experiment?: {
        kind: 'diffusion' | 'heating';
        id: string;
    };
    transition?: {
        from: AtomicPhase;
        to: AtomicPhase;
    };
}
export const atomicParticleFacts: Record<AtomicParticle, {
    charge: number;
    region: AtomicRegion;
    label: string;
}> = {
    proton: { charge: 1, region: 'nucleus', label: 'Protoni' }, neutron: { charge: 0, region: 'nucleus', label: 'Neutroni' }, electron: { charge: -1, region: 'cloud', label: 'Elektroni' },
};
export const atomicModelLimit = 'Pallot, värit ja tikut ovat mallimerkkejä. Ydin on suurennettu erikseen, elektroniverho on sijaintitodennäköisyyden kaavamainen kuva. Piirros ei ole valokuva eikä mittakaavakuva.';
const fail = (why: string): AtomicWorldVerdict => ({ ok: false, why });
const pass = { ok: true };
export function atomicOwn(value: unknown, keys?: readonly string[]): value is Record<string, unknown> {
    return !!value && typeof value === 'object' && !Array.isArray(value)
        && [Object.prototype, null].includes(Object.getPrototypeOf(value)) && Reflect.ownKeys(value).every(k => typeof k === 'string' && Object.hasOwn(Object.getOwnPropertyDescriptor(value, k) ?? {}, 'value') && (!keys || keys.includes(k)));
}
export function atomicDense(value: unknown, max = 64): value is unknown[] {
    return Array.isArray(value) && value.length <= max
        && Reflect.ownKeys(value).every(k => k === 'length' || typeof k === 'string' && /^(0|[1-9]\d*)$/.test(k) && Number(k) < value.length)
        && Array.from({ length: value.length }, (_, i) => Object.getOwnPropertyDescriptor(value, String(i))).every(d => !!d && Object.hasOwn(d, 'value'));
}
const numberIs = (value: unknown, wanted: number) => {
    if (typeof value !== 'string' || value.length > 32 || !Number.isSafeInteger(wanted))
        return false;
    const q = parseMeasure(value);
    return !!q && q[0] === BigInt(wanted) * q[1];
};
const int = (n: number, min = 0, max = 128) => Number.isSafeInteger(n) && n >= min && n <= max;
export function validAtomicAtom(atom: AtomicAtom): boolean { const e = atomicElement(atom.symbol); return !!e && int(atom.protons, 1, 55) && atom.protons === e.z && int(atom.neutrons, 0, 90) && e.isotopes.includes(atom.protons + atom.neutrons) && int(atom.electrons, 0, 60); }
export function atomicSampleFacts(sample: AtomicSample) {
    const elements = new Set(sample.species.flatMap(s => s.atoms)), species = new Set(sample.species.map(s => [...s.atoms].sort().join(',') + '|' + s.structure));
    return { kinds: elements.size, units: sample.species.reduce((n, s) => n + s.units, 0), classification: species.size > 1 ? 'mixture' : elements.size === 1 ? 'element' : 'compound' };
}
export function atomicPropertyValue(symbol: string, property: AtomicPropertyTask['property'], temperatureC: number): number | AtomicPhase | undefined {
    const e = atomicElement(symbol);
    if (!e)
        return;
    if (property === 'melting')
        return e.meltingC;
    if (property === 'boiling')
        return e.boilingC;
    if (e.meltingC === undefined || e.boilingC === undefined || temperatureC === e.meltingC || temperatureC === e.boilingC)
        return;
    return temperatureC < e.meltingC ? 'solid' : temperatureC < e.boilingC ? 'liquid' : 'gas';
}
export function atomicPropertyForecast(task: AtomicPropertyTask): string {
    const target = atomicPropertyValue(task.target, task.property, task.temperatureC), comparison = atomicPropertyValue(task.comparison, task.property, task.temperatureC);
    return task.property === 'state' ? String(target) : typeof target === 'number' && typeof comparison === 'number' ? (target < comparison ? 'lower' : target > comparison ? 'higher' : 'same') : 'invalid';
}
export function atomicPhaseAfter(task: AtomicPhaseTask): AtomicPhase { return task.change === 'condense' ? 'liquid' : task.change === 'vaporize' ? 'gas' : 'liquid'; }
export function atomicPhaseMotion(phase: AtomicPhase) { return phase === 'solid' ? 'vibrate' : phase === 'liquid' ? 'slide' : 'free'; }
export function atomicPhaseSpacing(substance: 'water' | 'argon', phase: AtomicPhase) { return phase === 'gas' ? 'far' : substance === 'water' && phase === 'solid' ? 'open' : 'near'; }
export function atomicSiteSymbol(structure: Pick<AtomicStructure, 'sites' | 'species' | 'rule'>, site: AtomicSite): string { return structure.rule === 'alternating' ? structure.species[Math.abs(site.x + site.y + site.z) % 2]! : structure.species[0]; }
function placementsOkay(sites: readonly AtomicSite[], placements: unknown, symbol: (site: AtomicSite) => string): boolean {
    return atomicDense(placements, sites.length) && placements.length === sites.length
        && new Set(placements.map(v => atomicOwn(v) ? v.id : null)).size === sites.length && sites.every(s => placements.some(v => atomicOwn(v, ['id', 'symbol']) && v.id === s.id && v.symbol === symbol(s)));
}
export function checkAtomicBuild(task: AtomicBuildTask, response: Extract<AtomicWorldResponse, {
    mode: 'build';
}>): boolean {
    if (!atomicDense(response.selected, 32) || !atomicDense(response.bonds, 48) || !atomicDense(response.placements, 64))
        return false;
    if (task.structure === 'lattice')
        return response.selected.length === 0 && response.bonds.length === 0 && placementsOkay(task.sites, response.placements, s => task.species[Math.abs(s.x + s.y + s.z) % 2]!);
    if (response.placements.length || !response.selected.length || new Set(response.selected).size !== response.selected.length)
        return false;
    const selected = response.selected.map(id => task.bank.find(a => a.id === id));
    if (selected.some(a => !a))
        return false;
    const counts: Record<string, number> = {};
    for (const a of selected)
        counts[a!.symbol] = (counts[a!.symbol] ?? 0) + 1;
    if (Object.keys(counts).length !== Object.keys(task.composition).length || !Object.entries(task.composition).every(([s, n]) => counts[s] === n))
        return false;
    const edges = new Set<string>(), degrees: Record<string, number> = {}, links: Record<string, string[]> = {};
    for (const bond of response.bonds) {
        if (!atomicOwn(bond, ['a', 'b', 'order']) || typeof bond.a !== 'string' || typeof bond.b !== 'string' || bond.a === bond.b || !response.selected.includes(bond.a) || !response.selected.includes(bond.b) || !int(bond.order, 1, 3))
            return false;
        const key = [bond.a, bond.b].sort().join('|');
        if (edges.has(key))
            return false;
        edges.add(key);
        degrees[bond.a] = (degrees[bond.a] ?? 0) + bond.order;
        degrees[bond.b] = (degrees[bond.b] ?? 0) + bond.order;
        (links[bond.a] ??= []).push(bond.b);
        (links[bond.b] ??= []).push(bond.a);
    }
    const reached = new Set<string>(), pending = [response.selected[0]!];
    while (pending.length) {
        const id = pending.pop()!;
        if (!reached.has(id)) {
            reached.add(id);
            pending.push(...(links[id] ?? []));
        }
    }
    return reached.size === selected.length && selected.every(a => degrees[a!.id] === task.valences[a!.symbol]);
}
const allowed: Record<AtomicWorldTask['mode'], readonly string[]> = { atom: ['rows', 'nucleus', 'cloud', 'literalScale', 'atomCount', 'unit', 'macroProperty', 'sameAtom', 'sampleAtom'], sample: ['rows'], build: ['selected', 'bonds', 'placements'], periodic: ['order', 'symbol', 'group', 'period'], property: ['forecast', 'locked', 'observed', 'group', 'comparison', 'result'], phase: ['rows', 'forecast', 'locked', 'observed', 'identity', 'count', 'steps'], 'model-use': ['structures', 'particle'], scale: ['order', 'links', 'modelBoundary'] };
export function atomicExplanation(task: AtomicWorldTask): ObservedExplanationTask | undefined { return task.review ? { kind: 'observed-explanation', channel: 'spoken', givens: [{ label: 'Tutkimusikkuna', value: task.title }], ...task.review } : undefined; }
function reviewAtomic(task: AtomicWorldTask, response: AtomicWorldResponse): AtomicWorldVerdict {
    if (!task.review)
        return pass;
    const review = response.review;
    if (!atomicOwn(review, ['observations', 'confirmedByAdult', 'assistance']) || !atomicOwn(review.observations, task.review.rubric.map(r => r.id)))
        return { ok: false, pendingReview: true, why: 'Oma selitys odottaa aikuisen havaintoa. Oppijan tekstiä tai ääntä ei tallenneta.' };
    return checkObservedExplanation(atomicExplanation(task)!, { kind: 'observed-explanation', channel: 'spoken', observations: review.observations as AtomicObservation['observations'], confirmedByAdult: review.confirmedByAdult === true, assistance: review.assistance as AtomicObservation['assistance'] });
}
function activityAtomic(task: AtomicWorldTask, response: AtomicWorldResponse): boolean {
    if (task.mode !== response.mode)
        return false;
    switch (task.mode) {
        case 'atom': {
            if (task.activity === 'link')
                return response.mode === 'atom' && atomicDense(response.rows, 0) && response.rows.length === 0 && !!task.sample && task.atoms.some(a => a.id === response.sampleAtom && a.symbol === task.sample!.symbol) && numberIs(response.atomCount, task.sample.units * task.sample.atomsPerUnit) && response.unit === 'atom' && response.macroProperty === 'sample';
            if (response.mode !== 'atom' || !atomicDense(response.rows, 8) || response.rows.length !== task.atoms.length || new Set(response.rows.map(r => atomicOwn(r) ? r.id : null)).size !== task.atoms.length)
                return false;
            const rowsOkay = task.atoms.every(atom => {
                const row = response.rows.find(r => atomicOwn(r, ['id', 'symbol', 'number', 'particle', 'charge', 'region']) && r.id === atom.id);
                if (!row)
                    return false;
                if (task.activity === 'number')
                    return numberIs(row.number, atom.protons) && row.symbol === atom.symbol;
                if (task.activity === 'particle') {
                    const p = task.particle!, f = atomicParticleFacts[p];
                    return row.particle === p && numberIs(row.charge, f.charge) && row.region === f.region;
                }
                return true;
            });
            return rowsOkay && (task.activity !== 'regions' || response.nucleus === 'nucleus' && response.cloud === 'cloud' && response.literalScale === false && (!task.comparison || response.sameAtom === (task.atoms[0]!.protons === task.comparison.protons && task.atoms[0]!.neutrons === task.comparison.neutrons && task.atoms[0]!.electrons === task.comparison.electrons)));
        }
        case 'sample': return response.mode === 'sample' && atomicDense(response.rows, 8) && response.rows.length === task.samples.length && new Set(response.rows.map(r => atomicOwn(r) ? r.id : null)).size === task.samples.length && task.samples.every(sample => {
            const row = response.rows.find(r => atomicOwn(r, ['id', 'classification', 'kinds', 'units']) && r.id === sample.id), f = atomicSampleFacts(sample);
            return !!row && row.classification === f.classification && numberIs(row.kinds, f.kinds) && numberIs(row.units, f.units);
        });
        case 'build': return response.mode === 'build' && checkAtomicBuild(task, response);
        case 'periodic': {
            if (response.mode !== 'periodic')
                return false;
            const e = atomicElement(task.target);
            if (!e)
                return false;
            if (task.activity === 'order')
                return atomicDense(response.order, 8) && response.order.length === task.cards.length && response.order.every((s, i) => s === [...task.cards].sort((a, b) => atomicElement(a)!.z - atomicElement(b)!.z)[i]);
            if (task.activity === 'fill')
                return response.symbol === e.symbol;
            return response.symbol === e.symbol && numberIs(response.group, e.group) && numberIs(response.period, e.period);
        }
        case 'property': return response.mode === 'property' && response.locked === true && response.observed === true && response.forecast === atomicPropertyForecast(task) && numberIs(response.group, task.group) && response.comparison === task.comparison && response.result === String(atomicPropertyValue(task.target, task.property, task.temperatureC));
        case 'phase': {
            if (response.mode !== 'phase' || !atomicDense(response.rows, 4) || response.rows.length !== task.chambers.length || new Set(response.rows.map(r => atomicOwn(r) ? r.id : null)).size !== task.chambers.length)
                return false;
            const rows = task.chambers.every(c => { const r = response.rows.find(r => atomicOwn(r, ['id', 'phase', 'motion', 'spacing', 'size']) && r.id === c.id); return !!r && r.phase === c.phase && r.motion === atomicPhaseMotion(c.phase) && r.spacing === atomicPhaseSpacing(c.substance, c.phase) && r.size === 'same'; });
            return rows && (task.activity !== 'change' || response.locked === true && response.observed === true && response.forecast === atomicPhaseAfter(task) && response.identity === 'same' && numberIs(response.count, task.chambers[0]!.count) && atomicDense(response.steps, 2) && response.steps.length === 2 && response.steps[0] === 'during' && response.steps[1] === 'after');
        }
        case 'model-use': {
            if (response.mode !== 'model-use' || !atomicDense(response.structures, 3) || response.structures.length !== task.structures.length || new Set(response.structures.map(r => atomicOwn(r) ? r.id : null)).size !== task.structures.length)
                return false;
            const structures = task.structures.every(s => { const r = response.structures.find(r => atomicOwn(r, ['id', 'placements', 'model', 'literal', 'shifted']) && r.id === s.id); return !!r && r.model === 'structure' && r.literal === false && (s.intervention !== 'shift' || r.shifted === true) && placementsOkay(s.sites, r.placements, site => atomicSiteSymbol(s, site)); });
            const p = response.particle;
            return structures && (!task.particle ? p === null : atomicOwn(p, ['model', 'forecast', 'locked', 'observed', 'count']) && p.model === 'particle' && p.locked === true && p.observed === true && p.forecast === (task.particle.kind === 'diffusion' ? 'spread' : 'faster') && numberIs(p.count, task.particle.count));
        }
        case 'scale': {
            if (response.mode !== 'scale' || !atomicDense(response.order, 3) || !atomicDense(response.links, 3) || response.links.length !== task.cards.length)
                return false;
            const wanted = [...task.cards].sort((a, b) => ['macro', 'structure', 'particle'].indexOf(a.level) - ['macro', 'structure', 'particle'].indexOf(b.level));
            return response.order.length === wanted.length && response.order.every((id, i) => id === wanted[i]!.id) && response.modelBoundary === wanted.find(c => c.source === 'model')?.id && new Set(response.links.map(r => atomicOwn(r) ? r.id : null)).size === wanted.length
                && task.cards.every(c => response.links.some(r => atomicOwn(r, ['id', 'phenomenon']) && r.id === c.id && r.phenomenon === c.phenomenon));
        }
    }
}
const oneOf = (value: unknown, values: readonly string[]) => typeof value === 'string' && values.includes(value);
const numericField = (value: unknown) => typeof value === 'string' && (value === '' || value.length <= 32 && !!parseMeasure(value));
const boolOrEmpty = (value: unknown) => value === null || typeof value === 'boolean';
/** Unused controls stay bounded too. A valid scientific answer is never a channel for arbitrary prose. */
function atomicResponseShape(task: AtomicWorldTask, response: AtomicWorldResponse): boolean {
    if (task.mode !== response.mode)
        return false;
    switch (response.mode) {
        case 'atom': return atomicDense(response.rows, 8) && response.rows.every(row => atomicOwn(row, ['id', 'symbol', 'number', 'particle', 'charge', 'region'])
            && oneOf(row.id, task.mode === 'atom' ? task.atoms.map(a => a.id) : []) && oneOf(row.symbol, ['', ...atomicElements.map(e => e.symbol)]) && numericField(row.number)
            && oneOf(row.particle, ['', 'proton', 'neutron', 'electron']) && numericField(row.charge) && oneOf(row.region, ['', 'nucleus', 'cloud']))
            && oneOf(response.nucleus, ['', 'nucleus', 'cloud']) && oneOf(response.cloud, ['', 'nucleus', 'cloud']) && boolOrEmpty(response.literalScale) && boolOrEmpty(response.sameAtom)
            && numericField(response.atomCount) && oneOf(response.unit, ['', 'atom', 'molecule']) && oneOf(response.macroProperty, ['', 'sample', 'atom'])
            && oneOf(response.sampleAtom, ['', ...(task.mode === 'atom' ? task.atoms.map(a => a.id) : [])]);
        case 'periodic': return atomicDense(response.order, 8) && response.order.every(s => oneOf(s, ['', ...atomicElements.map(e => e.symbol)]))
            && oneOf(response.symbol, ['', ...atomicElements.map(e => e.symbol)]) && numericField(response.group) && numericField(response.period);
        case 'property': return typeof response.locked === 'boolean' && typeof response.observed === 'boolean' && numericField(response.group)
            && oneOf(response.forecast, ['', 'lower', 'same', 'higher', 'solid', 'liquid', 'gas']) && oneOf(response.comparison, task.mode === 'property' ? ['', ...task.references] : [])
            && (numericField(response.result) || oneOf(response.result, ['solid', 'liquid', 'gas']));
        case 'phase': return atomicDense(response.rows, 4) && response.rows.every(row => atomicOwn(row, ['id', 'phase', 'motion', 'spacing', 'size'])
            && oneOf(row.id, task.mode === 'phase' ? task.chambers.map(c => c.id) : []) && oneOf(row.phase, ['', 'solid', 'liquid', 'gas']) && oneOf(row.motion, ['', 'vibrate', 'slide', 'free', 'stopped'])
            && oneOf(row.spacing, ['', 'near', 'open', 'far']) && oneOf(row.size, ['', 'same', 'larger', 'smaller'])) && typeof response.locked === 'boolean' && typeof response.observed === 'boolean'
            && oneOf(response.forecast, ['', 'solid', 'liquid', 'gas']) && oneOf(response.identity, ['', 'same', 'changed']) && numericField(response.count)
            && atomicDense(response.steps, 2) && response.steps.every(s => oneOf(s, ['during', 'after']));
        case 'model-use': return atomicDense(response.structures, 3) && response.structures.every(row => atomicOwn(row, ['id', 'placements', 'model', 'literal', 'shifted'])
            && oneOf(row.model, ['', 'structure', 'particle']) && boolOrEmpty(row.literal) && typeof row.shifted === 'boolean')
            && (response.particle === null || atomicOwn(response.particle, ['model', 'forecast', 'locked', 'observed', 'count']) && oneOf(response.particle.model, ['', 'particle', 'structure'])
                && oneOf(response.particle.forecast, ['', 'spread', 'faster', 'stop']) && typeof response.particle.locked === 'boolean' && typeof response.particle.observed === 'boolean' && numericField(response.particle.count));
        // Every field of these three modes is already assessed by the domain relation.
        case 'sample':
        case 'build':
        case 'scale': return true;
    }
}
function atomicMisconception(task: AtomicWorldTask): string {
    switch (task.mode) {
        case 'atom': return task.activity === 'number' ? 'Järjestysluku on protonien määrä. Neutronien määrä tai kaikkien hiukkasten summa ei anna tätä tunnusta.' : task.activity === 'regions' ? 'Ydin ja elektroniverho ovat eri alueet. Ytimen erillinen suurennos ei kuvaa sen todellista koko-osuutta.' : task.activity === 'link' ? 'Yhdistä näytteen alkuaine samaan atomilajiin. Molekyylin atomit lasketaan erikseen. Näytteen makro-ominaisuutta ei siirretä yksittäiseen atomiin.' : `Tarkista ${atomicParticleFacts[task.particle!].label.toLowerCase()}. Varaus on ${atomicParticleFacts[task.particle!].charge} ja alue ${atomicParticleFacts[task.particle!].region === 'cloud' ? 'elektroniverho' : 'ydin'}. Nollavaraus ei tarkoita hiukkasen puuttumista.`;
        case 'sample': return 'Saman alkuaineen molekyyli on edelleen alkuainetta. Puhtaassa yhdisteessä eri alkuaineet kuuluvat samaan aineeseen, seoksessa erilliset aineet ovat rinnakkain. Laske lajit ja kuvatut rakenneyksiköt erikseen.';
        case 'build': return 'Tarkista atomilajien määrät sekä jokainen sidos tai hilapaikka. Molekyylin osat kuuluvat yhteen rakenteeseen. Hilan ikkuna jatkuu reunoilta eikä ole erillinen molekyyli.';
        case 'periodic': return 'Kasvava järjestysluku järjestää kortit. Ryhmä on pystysarake ja jakso vaakarivi. Niiden luvut eivät vaihdu alkuaineen mukaan.';
        case 'property': return 'Kohdista ennuste tähän ryhmään, vertailukorttiin ja annettuun ominaisuuteen. Saman ryhmän kaikki ominaisuudet eivät ole samoja. Havainto avataan oman lukituksen jälkeen.';
        case 'phase': return 'Tarkista järjestys, liike ja välit. Kiinteänkin aineen rakenneosat liikkuvat. Olomuodon muutos ei tässä hajota H2O-molekyylejä alkuaineiksi eikä kasvata molekyylin omaa kokoa.';
        case 'model-use': return 'Tarkista oman hilan toisto ja jokainen paikka. Rakennemalli kuvaa osia ja järjestystä. Integraatiossa tarvitaan myös erillinen hiukkaskoe liikkeen selittämiseen. Pallot ja tikut ovat mallimerkkejä.';
        case 'scale': return 'Järjestä makrohavainto, rakenne ja hiukkasesitys. Merkitse ensimmäinen nimetty selitysmalli. Sen kuva ei synny tavallista kameraa vain suurentamalla.';
    }
}
export function checkAtomicWorld(task: AtomicWorldTask, raw: unknown): AtomicWorldVerdict {
    if (!atomicOwn(raw, ['kind', 'mode', 'review', ...allowed[task.mode]]) || raw.kind !== 'atomic-world' || raw.mode !== task.mode)
        return fail('Tuota tämän tutkimusikkunan oma vastaus.');
    const response = raw as AtomicWorldResponse, review = reviewAtomic(task, response);
    if (review.pendingReview)
        return review;
    return atomicResponseShape(task, response) && activityAtomic(task, response) ? review : { ...fail(atomicMisconception(task)), ...(review.observedByAdult ? { observedByAdult: true as const } : {}), ...(review.assisted ? { assisted: true as const } : {}) };
}
export function solutionAtomicWorld(task: AtomicWorldTask): AtomicWorldResponse {
    const kind = 'atomic-world' as const;
    let answer: AtomicWorldResponse;
    switch (task.mode) {
        case 'atom':
            answer = { kind, mode: 'atom', rows: task.activity === 'link' ? [] : task.atoms.map(a => ({ id: a.id, symbol: a.symbol, number: String(a.protons), particle: task.particle ?? '', charge: String(task.particle ? atomicParticleFacts[task.particle].charge : 0), region: task.particle ? atomicParticleFacts[task.particle].region : '' })), nucleus: 'nucleus', cloud: 'cloud', literalScale: false, atomCount: String((task.sample?.units ?? 0) * (task.sample?.atomsPerUnit ?? 0)), unit: 'atom', macroProperty: 'sample', sampleAtom: task.sample ? task.atoms.find(a => a.symbol === task.sample!.symbol)!.id : '', sameAtom: task.comparison ? task.atoms[0]!.protons === task.comparison.protons && task.atoms[0]!.neutrons === task.comparison.neutrons && task.atoms[0]!.electrons === task.comparison.electrons : null };
            break;
        case 'sample':
            answer = { kind, mode: 'sample', rows: task.samples.map(s => { const f = atomicSampleFacts(s); return { id: s.id, classification: f.classification, kinds: String(f.kinds), units: String(f.units) }; }) };
            break;
        case 'build': {
            if (task.structure === 'lattice') {
                answer = { kind, mode: 'build', selected: [], bonds: [], placements: task.sites.map(s => ({ id: s.id, symbol: task.species[Math.abs(s.x + s.y + s.z) % 2]! })) };
                break;
            }
            const selected: string[] = [];
            for (const [symbol, count] of Object.entries(task.composition))
                selected.push(...task.bank.filter(a => a.symbol === symbol).slice(0, count).map(a => a.id));
            const atoms = selected.map(id => task.bank.find(a => a.id === id)!), center = atoms.find(a => task.valences[a.symbol]! > 1)!, others = atoms.filter(a => a !== center);
            answer = { kind, mode: 'build', selected, bonds: others.map(a => ({ a: center.id, b: a.id, order: task.valences[a.symbol]! })), placements: [] };
            break;
        }
        case 'periodic': {
            const e = atomicElement(task.target)!;
            answer = { kind, mode: 'periodic', order: [...task.cards].sort((a, b) => atomicElement(a)!.z - atomicElement(b)!.z), symbol: e.symbol, group: String(e.group), period: String(e.period) };
            break;
        }
        case 'property':
            answer = { kind, mode: 'property', forecast: atomicPropertyForecast(task), locked: true, observed: true, group: String(task.group), comparison: task.comparison, result: String(atomicPropertyValue(task.target, task.property, task.temperatureC)) };
            break;
        case 'phase':
            answer = { kind, mode: 'phase', rows: task.chambers.map(c => ({ id: c.id, phase: c.phase, motion: atomicPhaseMotion(c.phase), spacing: atomicPhaseSpacing(c.substance, c.phase), size: 'same' })), forecast: atomicPhaseAfter(task), locked: true, observed: true, identity: 'same', count: String(task.chambers[0]!.count), steps: task.activity === 'change' ? ['during', 'after'] : [] };
            break;
        case 'model-use':
            answer = { kind, mode: 'model-use', structures: task.structures.map(s => ({ id: s.id, placements: s.sites.map(site => ({ id: site.id, symbol: atomicSiteSymbol(s, site) })), model: 'structure', literal: false, shifted: s.intervention === 'shift' })), particle: task.particle ? { model: 'particle', forecast: task.particle.kind === 'diffusion' ? 'spread' : 'faster', locked: true, observed: true, count: String(task.particle.count) } : null };
            break;
        case 'scale': {
            const ordered = [...task.cards].sort((a, b) => ['macro', 'structure', 'particle'].indexOf(a.level) - ['macro', 'structure', 'particle'].indexOf(b.level));
            answer = { kind, mode: 'scale', order: ordered.map(c => c.id), links: task.cards.map(c => ({ id: c.id, phenomenon: c.phenomenon })), modelBoundary: ordered.find(c => c.source === 'model')!.id };
            break;
        }
    }
    return { ...answer, ...(task.review ? { review: { observations: {}, confirmedByAdult: false, assistance: 'none' as const } } : {}) };
}
export function wrongAtomicWorldResponses(task: AtomicWorldTask): AtomicWorldResponse[] {
    const a = solutionAtomicWorld(task);
    switch (a.mode) {
        case 'atom': return [{ ...a, rows: a.rows.map(r => ({ ...r, number: '0', symbol: 'Xx', charge: '99', region: 'outside' })), nucleus: 'cloud', cloud: 'nucleus', atomCount: '0' }];
        case 'sample': return [{ ...a, rows: a.rows.map(r => ({ ...r, classification: r.classification === 'element' ? 'compound' : 'element' })) }];
        case 'build': return [{ ...a, selected: [], bonds: [], placements: [] }];
        case 'periodic': return [{ ...a, order: [...a.order].reverse(), symbol: 'Xx', group: '0', period: '0' }];
        case 'property': return [{ ...a, locked: false }, { ...a, forecast: 'invalid' }];
        case 'phase': return [{ ...a, rows: a.rows.map(r => ({ ...r, motion: 'stopped', size: 'larger' })), identity: 'changed' }];
        case 'model-use': return [{ ...a, structures: [], particle: null }];
        case 'scale': return [{ ...a, order: [...a.order].reverse(), modelBoundary: 'camera' }];
    }
}
