import type { CriterionObservation, ObservedExplanationTask } from './observed-explanations';

export type CarbonElement = 'C' | 'H' | 'O';
export interface CarbonAtom { id: string; element: CarbonElement; hydrogens?: number }
export interface CarbonBond { a: string; b: string; order: 1 | 2 | 3 }
export interface CarbonMolecule { id: string; name: string; atoms: readonly CarbonAtom[]; bonds: readonly CarbonBond[] }
export type NutrientGroup = 'carbohydrate' | 'fat' | 'protein' | 'other';
export type NutrientStructure = 'sugar' | 'starch' | 'triglyceride' | 'amino-chain' | 'water';
export interface NutrientComponent { id: string; name: string; structure: NutrientStructure; appearance: string }
export interface CarbonFood { id: string; name: string; origin: 'plant' | 'animal' | 'imaginary'; parts: readonly { component: string; massG: number }[] }
export interface CarbonReview extends Pick<ObservedExplanationTask, 'prompt' | 'rubric' | 'model'> {}
export interface CarbonObservation { channel: 'spoken' | 'written'; observations: Partial<Record<string, CriterionObservation>>; confirmedByAdult: boolean; assistance: 'none' | 'helped' }
export interface CarbonProfile { group: 'alcohols'; origin: 'prototype-teaching-choice' }
export const CARBON_PROTOTYPE_PROFILE: CarbonProfile = { group: 'alcohols', origin: 'prototype-teaching-choice' };
interface Base {
  kind: 'carbon-kitchen'; run: string; title: string;
  context: { title: string; skills: readonly string[]; kind?: 'local-profile'; profileGroup?: string; itemGroup?: string; allowedGroups?: readonly string[] };
}
export interface CarbonCompositionTask extends Base {
  mode: 'composition'; cards: readonly { id: string; name: string; formula: Readonly<Partial<Record<CarbonElement, number>>>; appearance: string; appearanceColor: 'black' | 'white' | 'colorless' }[];
  claim?: { kind: 'all-carbon-black-element'; text: string };
}
export interface CarbonMoleculeTask extends Base {
  mode: 'molecule-build'; atoms: readonly CarbonAtom[]; formula: string; proposal?: readonly CarbonBond[];
  samples: readonly { id: string; description: string; atoms: readonly CarbonAtom[]; bonds: readonly CarbonBond[]; form: 'network' | 'molecules' | 'separate-substances' }[];
}
export interface CarbonNutrientTask extends Base {
  mode: 'nutrient-matrix'; focus: 'all' | 'carbohydrate' | 'fat'; components: readonly NutrientComponent[]; foods: readonly CarbonFood[];
  requested: { food: string; group: Exclude<NutrientGroup, 'other'> }; proposal?: { food: string; group: Exclude<NutrientGroup, 'other'>; text: string };
}
export interface CarbonProteinTask extends Base {
  mode: 'protein-fragment'; units: readonly { id: string; label: string; kind: 'amino-residue' | 'glucose-residue' | 'fat-tail' }[];
  length: number; proposal?: readonly string[]; components: readonly NutrientComponent[]; foods: readonly CarbonFood[];
}
export interface CarbonOrganicTask extends Base {
  mode: 'organic-group'; profile: CarbonProfile | null; molecules: readonly (CarbonMolecule & { boilingC: number; pressurePa: 101325 })[];
  contrast: CarbonMolecule; proposal?: { molecule: string; text: string }; review?: CarbonReview;
}
export type CarbonKitchenTask = CarbonCompositionTask | CarbonMoleculeTask | CarbonNutrientTask | CarbonProteinTask | CarbonOrganicTask;
export type CarbonKitchenResponse =
  | { kind: 'carbon-kitchen'; mode: 'composition'; element: CarbonElement | null; rows: readonly { id: string; carbon: number | null; type: 'element' | 'compound' | null }[]; counterexample: string | null }
  | { kind: 'carbon-kitchen'; mode: 'molecule-build'; bonds: readonly CarbonBond[]; types: readonly { id: string; type: 'element' | 'compound' | 'mixture' | null }[]; allCarbonOrganic: boolean | null }
  | { kind: 'carbon-kitchen'; mode: 'nutrient-matrix'; groups: readonly { id: string; group: NutrientGroup | null }[]; foods: readonly { id: string; groups: readonly NutrientGroup[] }[]; massG: number | null; rejectedFood: string | null }
  | { kind: 'carbon-kitchen'; mode: 'protein-fragment'; chain: readonly string[]; folded: boolean; proteinFoods: readonly string[] }
  | { kind: 'carbon-kitchen'; mode: 'organic-group'; marks: readonly { molecule: string; carbon: string; oxygen: string; hydrogen: string }[]; higherBoiling: string | null; differenceC: number | null; rejectedMolecule: string | null; review?: CarbonObservation };
export interface CarbonVerdict { ok: boolean; why?: string; pendingReview?: true; observedByAdult?: true; assisted?: true }
export const carbonKitchenSources = [
  'https://openstax.org/books/biology-2e/pages/3-2-carbohydrates',
  'https://openstax.org/books/biology-2e/pages/3-3-lipids',
  'https://openstax.org/books/biology-2e/pages/3-4-proteins',
  'https://openstax.org/books/organic-chemistry/pages/17-1-naming-alcohols-and-phenols',
  'https://openstax.org/books/organic-chemistry/pages/17-2-properties-of-alcohols-and-phenols',
  ...['C67561', 'C64175', 'C71238', 'C71363', 'C71410', 'C111273', 'C67630'].map(id => `https://webbook.nist.gov/cgi/cbook.cgi?ID=${id}&Type=TBOIL`),
] as const;
export const nutrientNames: Record<NutrientGroup, string> = { carbohydrate: 'Hiilihydraatti', fat: 'Rasva', protein: 'Proteiini', other: 'Muu aine' };
export const nutrientStructures: Record<NutrientStructure, string> = {
  sugar: 'Sokerin pieni sakkaridirakenne', starch: 'Tärkkelys · glukoosiosien pitkä ketju',
  triglyceride: 'Triglyseridi · glyseroli ja kolme rasvahappotähdettä', 'amino-chain': 'Proteiini · pitkä aminohappotähteiden ketju', water: 'Vesi · H₂O',
};
export function nutrientGroup(structure: NutrientStructure): NutrientGroup {
  if (structure === 'sugar' || structure === 'starch') return 'carbohydrate';
  if (structure === 'triglyceride') return 'fat';
  if (structure === 'amino-chain') return 'protein';
  return 'other';
}
export function foodNutrientGroups(components: readonly NutrientComponent[], food: CarbonFood): NutrientGroup[] {
  return [...new Set(food.parts.filter(part => part.massG > 0).map(part => nutrientGroup(components.find(c => c.id === part.component)!.structure)).filter(group => group !== 'other'))];
}
function safeData(value: unknown, depth = 0): boolean {
  if (depth > 12) return false;
  if (value === undefined || value === null || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'string') return value.length <= 120;
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) {
    return value.length <= 100 && Object.keys(value).length === value.length && Array.from({ length: value.length }, (_, i) => i).every(i => {
      const d = Object.getOwnPropertyDescriptor(value, i); return !!d && Object.hasOwn(d, 'value') && safeData(d.value, depth + 1);
    });
  }
  if (![Object.prototype, null].includes(Object.getPrototypeOf(value))) return false;
  const descriptors = Object.getOwnPropertyDescriptors(value);
  return Reflect.ownKeys(descriptors).length <= 100 && Reflect.ownKeys(descriptors).every(key => {
    const d = descriptors[key as string]!; return typeof key === 'string' && d.enumerable && Object.hasOwn(d, 'value') && safeData(d.value, depth + 1);
  });
}
function closed(value: unknown, required: readonly string[], optional: readonly string[] = []): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value) && required.every(key => Object.hasOwn(value, key)) && Object.keys(value).every(key => required.includes(key) || optional.includes(key));
}
function sameSet(a: readonly unknown[], b: readonly unknown[]): boolean {
  return a.length === b.length && new Set(a).size === a.length && a.every(value => b.includes(value));
}
function rowsMatch<T extends { id: string }>(rows: readonly T[], ids: readonly string[]): boolean {
  return Array.isArray(rows) && sameSet(rows.map(row => row.id), ids);
}
/** Ordinary neutral C/H/O molecules only. This does not generalize valence to ions or radicals. */
export function validCarbonMolecule(atoms: readonly CarbonAtom[], bonds: readonly CarbonBond[]): boolean {
  if (!Array.isArray(bonds) || bonds.length > 30 || atoms.length < 2 || atoms.length > 16 || new Set(atoms.map(a => a.id)).size !== atoms.length) return false;
  const seen = new Set<string>(), degree = new Map(atoms.map(a => [a.id, a.hydrogens ?? 0]));
  const neighbors = new Map(atoms.map(a => [a.id, [] as string[]]));
  for (const bond of bonds) {
    if (!closed(bond, ['a', 'b', 'order']) || typeof bond.a !== 'string' || typeof bond.b !== 'string' || typeof bond.order !== 'number' || bond.a === bond.b || ![1, 2, 3].includes(bond.order) || !degree.has(bond.a) || !degree.has(bond.b)) return false;
    const key = [bond.a, bond.b].sort().join('|'); if (seen.has(key)) return false; seen.add(key);
    degree.set(bond.a, degree.get(bond.a)! + bond.order); degree.set(bond.b, degree.get(bond.b)! + bond.order);
    neighbors.get(bond.a)!.push(bond.b); neighbors.get(bond.b)!.push(bond.a);
  }
  if (!atoms.every(atom => degree.get(atom.id) === ({ C: 4, H: 1, O: 2 }[atom.element]))) return false;
  const visited = new Set<string>(), visit = (id: string) => { if (visited.has(id)) return; visited.add(id); neighbors.get(id)!.forEach(visit); };
  visit(atoms[0]!.id); return visited.size === atoms.length;
}
/** Bounded heavy-atom enumeration for a demonstration. Every valid isomer remains acceptable. */
export function completeCarbonBonds(atoms: readonly CarbonAtom[]): CarbonBond[] {
  const heavy = atoms.filter(a => a.element !== 'H'), hydrogen = atoms.filter(a => a.element === 'H');
  const pairs = heavy.flatMap((a, i) => heavy.slice(i + 1).map(b => [a.id, b.id] as const));
  const degree = new Map(heavy.map(a => [a.id, a.hydrogens ?? 0])), bonds: CarbonBond[] = [];
  let found: CarbonBond[] | undefined;
  function search(i: number): void {
    if (found) return;
    if (i === pairs.length) {
      const remaining = heavy.flatMap(a => Array.from({ length: Math.max(0, (a.element === 'C' ? 4 : 2) - degree.get(a.id)!) }, () => a.id));
      if (remaining.length !== hydrogen.length) return;
      const result = [...bonds, ...hydrogen.map((a, j) => ({ a: remaining[j]!, b: a.id, order: 1 as const }))];
      if (validCarbonMolecule(atoms, result)) found = result;
      return;
    }
    const [a, b] = pairs[i]!;
    const valence = (id: string) => heavy.find(atom => atom.id === id)!.element === 'C' ? 4 : 2;
    for (let order = 0; order <= Math.min(3, valence(a) - degree.get(a)!, valence(b) - degree.get(b)!); order++) {
      degree.set(a, degree.get(a)! + order); degree.set(b, degree.get(b)! + order);
      if (order) bonds.push({ a, b, order: order as 1 | 2 | 3 }); search(i + 1); if (order) bonds.pop();
      degree.set(a, degree.get(a)! - order); degree.set(b, degree.get(b)! - order);
      if (found) return;
    }
  }
  search(0); return found ?? [];
}
export function alcoholMarks(molecule: CarbonMolecule): { carbon: string; oxygen: string; hydrogen: string }[] {
  if (!validCarbonMolecule(molecule.atoms, molecule.bonds)) return [];
  return molecule.atoms.filter(a => a.element === 'O').flatMap(oxygen => {
    const adjacent = molecule.bonds.filter(b => b.order === 1 && (b.a === oxygen.id || b.b === oxygen.id)).map(b => b.a === oxygen.id ? b.b : b.a);
    const hydrogen = molecule.atoms.find(a => a.element === 'H' && adjacent.includes(a.id));
    return molecule.atoms.filter(carbon => carbon.element === 'C' && adjacent.includes(carbon.id) && !molecule.bonds.some(b => b.order !== 1 && (b.a === carbon.id || b.b === carbon.id)))
      .flatMap(carbon => hydrogen ? [{ carbon: carbon.id, oxygen: oxygen.id, hydrogen: hydrogen.id }] : []);
  });
}
export function carbonProfileReady(task: CarbonOrganicTask): boolean {
  return task.profile?.group === 'alcohols' && task.profile.origin === 'prototype-teaching-choice' && task.context.kind === 'local-profile' &&
    task.context.profileGroup === task.profile.group && task.context.itemGroup === task.profile.group && task.context.allowedGroups?.length === 1 && task.context.allowedGroups[0] === task.profile.group;
}
function adultReview(task: CarbonReview, review: CarbonObservation | undefined): CarbonVerdict {
  const pending = { ok: false, pendingReview: true as const, why: 'Oma perustelu odottaa aikuisen havaintoa ja tuen merkintää.' };
  if (!closed(review, ['channel', 'observations', 'confirmedByAdult', 'assistance']) || !['spoken', 'written'].includes(review.channel as string) || review.confirmedByAdult !== true || !['none', 'helped'].includes(review.assistance as string) || !closed(review.observations, task.rubric.map(c => c.id))) return pending;
  if (!task.rubric.every(c => ['met', 'not-yet'].includes((review.observations as Record<string, string>)[c.id]!))) return pending;
  const flags = { observedByAdult: true as const, ...(review.assistance === 'helped' ? { assisted: true as const } : {}) };
  return task.rubric.every(c => (review.observations as Record<string, string>)[c.id] === 'met') ? { ok: true, ...flags } : { ok: false, ...flags, why: 'Harjoitellaan vielä omaa aineistoon sidottua perustelua.' };
}
function counterexampleToCarbonClaim(card: CarbonCompositionTask['cards'][number]): boolean {
  return (card.formula.C ?? 0) > 0 && (Object.keys(card.formula).length > 1 || card.appearanceColor !== 'black');
}
function checkCarbonResponse(task: CarbonKitchenTask, response: CarbonKitchenResponse): CarbonVerdict {
  const fail = (why = 'Tarkista oman mallin osat ja annetut tiedot.'): CarbonVerdict => ({ ok: false, why });
  if (!safeData(response) || !response || response.kind !== 'carbon-kitchen' || response.mode !== task.mode) return fail();
  let observation: CarbonVerdict | undefined;
  if (task.mode === 'organic-group') {
    if (!carbonProfileReady(task)) return { ok: false, pendingReview: true, why: 'Tutkimuslaatikon opetusvalinta tarkistetaan aikuisen kanssa.' };
    if (response.mode !== 'organic-group') return fail();
    if (task.review) {
      observation = adultReview(task.review, response.review);
      if (observation.pendingReview) return observation;
    } else if (response.review !== undefined) return fail();
  }
  let ok = false;
  if (task.mode === 'composition' && response.mode === task.mode) {
    ok = closed(response, ['kind', 'mode', 'element', 'rows', 'counterexample']) && response.element === 'C' && rowsMatch(response.rows, task.cards.map(c => c.id)) && task.cards.every(card => {
      const row = response.rows.find(row => row.id === card.id)!;
      return closed(row, ['id', 'carbon', 'type']) && row.carbon === (card.formula.C ?? 0) && row.type === (Object.keys(card.formula).length === 1 ? 'element' : 'compound');
    }) && (task.claim ? task.claim.kind === 'all-carbon-black-element' && task.cards.some(card => card.id === response.counterexample && counterexampleToCarbonClaim(card)) : response.counterexample === null);
  }
  if (task.mode === 'molecule-build' && response.mode === task.mode) {
    ok = closed(response, ['kind', 'mode', 'bonds', 'types', 'allCarbonOrganic']) && validCarbonMolecule(task.atoms, response.bonds) && rowsMatch(response.types, task.samples.map(s => s.id)) && task.samples.every(sample => {
      const row = response.types.find(row => row.id === sample.id)!;
      const type = sample.form === 'separate-substances' ? 'mixture' : new Set(sample.atoms.map(a => a.element)).size === 1 ? 'element' : 'compound';
      return closed(row, ['id', 'type']) && row.type === type;
    }) && response.allCarbonOrganic === false;
  }
  if (task.mode === 'nutrient-matrix' && response.mode === task.mode) {
    const food = task.foods.find(f => f.id === task.requested.food)!;
    const mass = food.parts.filter(p => nutrientGroup(task.components.find(c => c.id === p.component)!.structure) === task.requested.group).reduce((sum, p) => sum + p.massG, 0);
    ok = closed(response, ['kind', 'mode', 'groups', 'foods', 'massG', 'rejectedFood']) && rowsMatch(response.groups, task.components.map(c => c.id)) && task.components.every(c => {
      const row = response.groups.find(row => row.id === c.id)!; return closed(row, ['id', 'group']) && row.group === nutrientGroup(c.structure);
    }) && rowsMatch(response.foods, task.foods.map(f => f.id)) && task.foods.every(f => {
      const row = response.foods.find(row => row.id === f.id)!; return closed(row, ['id', 'groups']) && Array.isArray(row.groups) && sameSet(row.groups, foodNutrientGroups(task.components, f));
    }) && response.massG === mass && response.rejectedFood === (task.proposal?.food ?? null);
  }
  if (task.mode === 'protein-fragment' && response.mode === task.mode) {
    const expected = task.foods.filter(food => foodNutrientGroups(task.components, food).includes('protein')).map(f => f.id);
    ok = closed(response, ['kind', 'mode', 'chain', 'folded', 'proteinFoods']) && Array.isArray(response.chain) && response.chain.length === task.length && new Set(response.chain).size === response.chain.length && response.chain.every(id => task.units.some(u => u.id === id && u.kind === 'amino-residue')) && typeof response.folded === 'boolean' && Array.isArray(response.proteinFoods) && sameSet(response.proteinFoods, expected);
  }
  if (task.mode === 'organic-group' && response.mode === task.mode) {
    ok = closed(response, ['kind', 'mode', 'marks', 'higherBoiling', 'differenceC', 'rejectedMolecule'], ['review']) && Array.isArray(response.marks) && response.marks.length === task.molecules.length && sameSet(response.marks.map(m => m.molecule), task.molecules.map(m => m.id)) && task.molecules.every(m => {
      const mark = response.marks.find(mark => mark.molecule === m.id)!;
      return closed(mark, ['molecule', 'carbon', 'oxygen', 'hydrogen']) && alcoholMarks(m).some(expected => mark.carbon === expected.carbon && mark.oxygen === expected.oxygen && mark.hydrogen === expected.hydrogen);
    }) && response.higherBoiling === [...task.molecules].sort((a, b) => b.boilingC - a.boilingC)[0]!.id && response.differenceC === Math.abs(task.molecules[0]!.boilingC - task.molecules[1]!.boilingC) && response.rejectedMolecule === (task.proposal?.molecule ?? null);
  }
  if (!ok) return { ...fail(), ...(observation?.observedByAdult ? { observedByAdult: true, ...(observation.assisted ? { assisted: true } : {}) } : {}) };
  return observation ?? { ok: true };
}
/** A model artifact. An adult observation is always left unconfirmed. */
export function solutionCarbonKitchen(task: CarbonKitchenTask): CarbonKitchenResponse {
  const base = { kind: 'carbon-kitchen' as const };
  if (task.mode === 'composition') return { ...base, mode: task.mode, element: 'C', rows: task.cards.map(c => ({ id: c.id, carbon: c.formula.C ?? 0, type: Object.keys(c.formula).length === 1 ? 'element' : 'compound' })), counterexample: task.claim ? task.cards.find(counterexampleToCarbonClaim)?.id ?? null : null };
  if (task.mode === 'molecule-build') return { ...base, mode: task.mode, bonds: completeCarbonBonds(task.atoms), types: task.samples.map(s => ({ id: s.id, type: s.form === 'separate-substances' ? 'mixture' : new Set(s.atoms.map(a => a.element)).size === 1 ? 'element' : 'compound' })), allCarbonOrganic: false };
  if (task.mode === 'nutrient-matrix') return { ...base, mode: task.mode, groups: task.components.map(c => ({ id: c.id, group: nutrientGroup(c.structure) })), foods: task.foods.map(f => ({ id: f.id, groups: foodNutrientGroups(task.components, f) })), massG: task.foods.find(f => f.id === task.requested.food)!.parts.filter(p => nutrientGroup(task.components.find(c => c.id === p.component)!.structure) === task.requested.group).reduce((sum, p) => sum + p.massG, 0), rejectedFood: task.proposal?.food ?? null };
  if (task.mode === 'protein-fragment') return { ...base, mode: task.mode, chain: task.units.filter(u => u.kind === 'amino-residue').slice(0, task.length).map(u => u.id), folded: false, proteinFoods: task.foods.filter(f => foodNutrientGroups(task.components, f).includes('protein')).map(f => f.id) };
  return { ...base, mode: task.mode, marks: task.molecules.map(m => ({ molecule: m.id, ...alcoholMarks(m)[0]! })), higherBoiling: [...task.molecules].sort((a, b) => b.boilingC - a.boilingC)[0]!.id, differenceC: Math.abs(task.molecules[0]!.boilingC - task.molecules[1]!.boilingC), rejectedMolecule: task.proposal?.molecule ?? null,
    ...(task.review ? { review: { channel: 'spoken' as const, observations: {}, confirmedByAdult: false, assistance: 'none' as const } } : {}) };
}
export function wrongCarbonKitchenResponses(task: CarbonKitchenTask): CarbonKitchenResponse[] {
  const good = solutionCarbonKitchen(task), wrong = structuredClone(good);
  if (wrong.mode === 'composition') wrong.element = 'O';
  else if (wrong.mode === 'molecule-build') wrong.bonds = wrong.bonds.slice(1);
  else if (wrong.mode === 'nutrient-matrix') wrong.massG = (wrong.massG ?? 0) + 1;
  else if (wrong.mode === 'protein-fragment') wrong.chain = wrong.chain.slice(1);
  else wrong.differenceC = -1;
  return [wrong];
}

/** Malformed external submissions never throw or manufacture evidence. */
export function checkCarbonKitchen(task: CarbonKitchenTask, response: CarbonKitchenResponse): CarbonVerdict {
  try { return checkCarbonResponse(task, response); }
  catch { return { ok: false, why: 'Tarkista oman mallin rakenteiset tiedot.' }; }
}

/** Guards presentation projections before any external response field is read. */
export function carbonDraftIsSafe(value: unknown): boolean {
  try { return safeData(value); } catch { return false; }
}
