import { describe, expect, it } from 'vitest';
import { rng } from '../src/engine/rng';
import { carbonAlcoholData, carbonKitchenEvidence, carbonKitchenSpecs, makeCarbonKitchenTask } from '../src/content/carbon-kitchen';
import { carbonKitchenScene } from '../src/content/models/carbon-kitchen-scene';
import { CARBON_PROTOTYPE_PROFILE, alcoholMarks, checkCarbonKitchen, completeCarbonBonds, solutionCarbonKitchen, validCarbonMolecule, type CarbonBond, type CarbonKitchenResponse, type CarbonKitchenTask, type CarbonMoleculeTask, type NutrientGroup } from '../src/content/models/carbon-kitchen';

const ids = ['CHEM79-CARBON', 'CHEM79-CARBON-COMPOUND', 'CHEM79-NUTRIENT-01', 'CHEM79-NUTRIENT-CARB', 'CHEM79-NUTRIENT-FAT', 'CHEM79-NUTRIENT-PROT', 'CHEM79-ORG-GROUP'];
const kind = 'carbon-kitchen' as const;
function nameGroup(name: string): NutrientGroup {
  if (/Glukoosi|Fruktoosi|Sakkaroosi|Maltoosi|Tärkkelys/.test(name)) return 'carbohydrate';
  if (/Trioleiini|Tripalmitiini/.test(name)) return 'fat';
  if (/proteiin/i.test(name)) return 'protein';
  return 'other';
}
/** Independent authored structural recipes, followed by integer valence conservation. */
function moleculeOracle(task: CarbonMoleculeTask): CarbonBond[] {
  const carbon = task.atoms.filter(a => a.element === 'C'), oxygen = task.atoms.filter(a => a.element === 'O');
  const hydrogen = task.atoms.filter(a => a.element === 'H').reverse();
  const result: CarbonBond[] = [];
  if (oxygen.length === 2) result.push({ a: carbon[0]!.id, b: oxygen[0]!.id, order: 2 }, { a: carbon[0]!.id, b: oxygen[1]!.id, order: 2 });
  else {
    for (let i = 1; i < carbon.length; i++) result.push({ a: carbon[i - 1]!.id, b: carbon[i]!.id, order: carbon.length === 2 && hydrogen.length <= 4 && !oxygen.length ? hydrogen.length === 2 ? 3 : 2 : 1 });
    if (oxygen.length) result.push({ a: carbon.at(-1)!.id, b: oxygen[0]!.id, order: hydrogen.length === carbon.length * 2 ? 2 : 1 });
    let h = 0;
    for (const atom of [...carbon, ...oxygen]) {
      const used = result.filter(b => b.a === atom.id || b.b === atom.id).reduce((sum, b) => sum + BigInt(b.order), 0n);
      for (let degree = used; degree < BigInt(atom.element === 'C' ? 4 : 2); degree++) result.push({ a: atom.id, b: hydrogen[h++]!.id, order: 1 });
    }
    expect(h).toBe(hydrogen.length);
  }
  for (const atom of task.atoms) {
    const degree = result.filter(b => b.a === atom.id || b.b === atom.id).reduce((sum, b) => sum + BigInt(b.order), 0n);
    expect(degree).toBe(BigInt(atom.element === 'C' ? 4 : atom.element === 'O' ? 2 : 1));
  }
  return result;
}
export function carbonOracle(task: CarbonKitchenTask): CarbonKitchenResponse {
  if (task.mode === 'composition') return { kind, mode: task.mode, element: 'C', rows: task.cards.map(c => ({ id: c.id, carbon: c.formula.C ?? 0, type: Object.values(c.formula).filter(n => n! > 0).length === 1 ? 'element' : 'compound' })), counterexample: task.claim ? 'a' : null };
  if (task.mode === 'molecule-build') return { kind, mode: task.mode, bonds: moleculeOracle(task), types: task.samples.map(s => ({ id: s.id, type: s.id === 'carbon' ? 'element' : s.id === 'co2' ? 'compound' : 'mixture' })), allCarbonOrganic: false };
  if (task.mode === 'nutrient-matrix') {
    const group = (id: string) => nameGroup(task.components.find(c => c.id === id)!.name);
    return { kind, mode: task.mode, groups: task.components.map(c => ({ id: c.id, group: nameGroup(c.name) })), foods: task.foods.map(f => ({ id: f.id, groups: [...new Set(f.parts.filter(p => p.massG > 0).map(p => group(p.component)).filter(g => g !== 'other'))] })), massG: Number(task.foods.find(f => f.id === task.requested.food)!.parts.reduce((sum, p) => sum + (group(p.component) === task.requested.group ? BigInt(p.massG) : 0n), 0n)), rejectedFood: task.proposal ? 'food-a' : null };
  }
  if (task.mode === 'protein-fragment') return { kind, mode: task.mode, chain: task.units.filter(u => /^[A-Z][a-z]{2}$/.test(u.label)).reverse().slice(0, task.length).map(u => u.id), folded: true, proteinFoods: task.foods.filter(f => f.parts.some(p => /proteiin/i.test(task.components.find(c => c.id === p.component)!.name) && p.massG > 0)).map(f => f.id) };
  const a = task.molecules[0]!, b = task.molecules[1]!;
  return { kind, mode: task.mode, marks: task.molecules.map(m => ({ molecule: m.id, carbon: m.id === 'propanol2' ? 'c2' : 'c1', oxygen: 'o', hydrogen: 'h' })), higherBoiling: a.boilingC > b.boilingC ? a.id : b.id, differenceC: Number(BigInt(Math.max(a.boilingC, b.boilingC)) - BigInt(Math.min(a.boilingC, b.boilingC))), rejectedMolecule: task.proposal ? 'ether' : null,
    review: { channel: 'spoken', observations: { feature: 'met', comparison: 'met', boundary: 'met' }, confirmedByAdult: true, assistance: 'none' } };
}

describe('carbon kitchen exact domain and evidence', () => {
  it('owns exactly seven nodes, two genuine families and stable given identities', () => {
    expect(carbonKitchenSpecs.map(s => s.id)).toEqual(ids);
    for (const spec of carbonKitchenSpecs) {
      expect(spec.produce).toHaveLength(2); expect(carbonKitchenEvidence[spec.id]!.limit).toBeTruthy();
      const variants = new Set<string>();
      for (let seed = 0; seed < 160; seed++) {
        const a = makeCarbonKitchenTask(spec.id, rng(seed), 'build');
        expect(a).toEqual(makeCarbonKitchenTask(spec.id, rng(seed), 'build'));
        variants.add(JSON.stringify({ ...a, run: '' }));
      }
      expect(variants.size, spec.id).toBeGreaterThanOrEqual(8);
    }
  });
  it('accepts independent structural/integer oracles and rejects meaningful wrong models in 3360 generated situations', () => {
    for (const id of ids) for (const variant of ['build', 'repair', 'transfer'] as const) for (let seed = 0; seed < 160; seed++) {
      const task = makeCarbonKitchenTask(id, rng(seed), variant), response = carbonOracle(task);
      expect(checkCarbonKitchen(task, response), `${id} ${variant} ${seed}`).toMatchObject({ ok: true });
      expect(checkCarbonKitchen(task, solutionCarbonKitchen(task)).ok).toBe(task.mode !== 'organic-group');
      const wrong = structuredClone(response);
      if (wrong.mode === 'composition') wrong.rows[0]!.carbon = 0;
      else if (wrong.mode === 'molecule-build') wrong.bonds = [];
      else if (wrong.mode === 'nutrient-matrix') wrong.massG = wrong.massG! + 1;
      else if (wrong.mode === 'protein-fragment') wrong.chain = ['glucose', ...wrong.chain.slice(1)];
      else wrong.marks[0]!.hydrogen = wrong.marks[0]!.carbon;
      expect(checkCarbonKitchen(task, wrong).ok).toBe(false);
    }
  });
  it('accepts every given counterexample independent of card order, while water and black graphite do not refute the claim', () => {
    for (let seed = 0; seed < 160; seed++) {
      const task = makeCarbonKitchenTask(ids[0]!, rng(seed), 'repair'), response = carbonOracle(task);
      if (task.mode !== 'composition' || response.mode !== 'composition') throw Error('task');
      for (const id of ['a', 'b']) {
        expect(checkCarbonKitchen(task, { ...response, counterexample: id }).ok).toBe(true);
        expect(checkCarbonKitchen({ ...task, cards: [...task.cards].reverse() }, { ...response, counterexample: id }).ok).toBe(true);
      }
      for (const id of ['c', 'd']) expect(checkCarbonKitchen(task, { ...response, counterexample: id }).ok).toBe(false);
      const diamond = { ...task, cards: task.cards.map(card => card.id === 'c' ? { ...card, appearance: 'Väritön timantin verkkokatkelma', appearanceColor: 'colorless' as const } : card) };
      expect(checkCarbonKitchen(diamond, { ...response, counterexample: 'c' }).ok).toBe(true);
    }
  });
  it('accepts alternate ether/alcohol isomers, all valid residue orders and rejects disconnected valence-correct mixtures', () => {
    const task = makeCarbonKitchenTask(ids[1]!, rng(1), 'build') as CarbonMoleculeTask;
    task.atoms = [{ id: 'c1', element: 'C' }, { id: 'c2', element: 'C' }, { id: 'o1', element: 'O' }, ...Array.from({ length: 6 }, (_, i) => ({ id: `h${i}`, element: 'H' as const }))];
    const ethanol = moleculeOracle(task), ether = [
      { a: 'c1', b: 'o1', order: 1 }, { a: 'c2', b: 'o1', order: 1 }, ...Array.from({ length: 6 }, (_, i) => ({ a: i < 3 ? 'c1' : 'c2', b: `h${i}`, order: 1 })),
    ] as CarbonBond[];
    expect(validCarbonMolecule(task.atoms, ethanol)).toBe(true); expect(validCarbonMolecule(task.atoms, ether)).toBe(true);
    const disconnected = [{ id: 'c', element: 'C' as const }, ...Array.from({ length: 4 }, (_, i) => ({ id: `h${i}`, element: 'H' as const })), { id: 'o1', element: 'O' as const }, { id: 'o2', element: 'O' as const }];
    expect(validCarbonMolecule(disconnected, [...Array.from({ length: 4 }, (_, i) => ({ a: 'c', b: `h${i}`, order: 1 as const })), { a: 'o1', b: 'o2', order: 2 }])).toBe(false);
    expect(completeCarbonBonds(task.atoms).length).toBeGreaterThan(0);
    for (const edge of ether) expect(validCarbonMolecule(task.atoms, ether.filter(b => b !== edge))).toBe(false);
  });
  it('does not infer organic membership from O alone, an ether, an acid OH, or an empty teaching profile', () => {
    for (const molecule of carbonAlcoholData) { expect(validCarbonMolecule(molecule.atoms, molecule.bonds)).toBe(true); expect(alcoholMarks(molecule)).toHaveLength(1); }
    const task = makeCarbonKitchenTask(ids[6]!, rng(7), 'repair');
    if (task.mode !== 'organic-group') throw Error('task');
    expect(alcoholMarks(task.contrast)).toEqual([]);
    const acid = { id: 'acid', name: 'Acid', atoms: [{ id: 'c', element: 'C', hydrogens: 1 }, { id: 'o', element: 'O' }, { id: 'o2', element: 'O' }, { id: 'h', element: 'H' }], bonds: [{ a: 'c', b: 'o', order: 1 }, { a: 'o', b: 'h', order: 1 }, { a: 'c', b: 'o2', order: 2 }] } as const;
    expect(alcoholMarks(acid)).toEqual([]);
    const empty = makeCarbonKitchenTask(ids[6]!, rng(7), 'repair', null);
    expect(checkCarbonKitchen(empty, carbonOracle(empty))).toMatchObject({ ok: false, pendingReview: true });
    for (const bad of [{ ...task, profile: null }, { ...task, context: { ...task.context, itemGroup: 'acids' } }, { ...task, context: { ...task.context, allowedGroups: [] } }]) expect(checkCarbonKitchen(bad, carbonOracle(task))).toMatchObject({ ok: false, pendingReview: true });
    expect(task.profile).toEqual(CARBON_PROTOTYPE_PROFILE);
  });
  it('requires a real adult review first, never treats the model as observation, and preserves helped false provenance', () => {
    const task = makeCarbonKitchenTask(ids[6]!, rng(2), 'build'), response = carbonOracle(task);
    if (response.mode !== 'organic-group') throw Error('response');
    expect(checkCarbonKitchen(task, solutionCarbonKitchen(task))).toMatchObject({ ok: false, pendingReview: true });
    for (const review of [undefined, { ...response.review!, assistance: undefined }, { ...response.review!, confirmedByAdult: false }, { ...response.review!, observations: { feature: 'met' } }]) {
      expect(checkCarbonKitchen(task, { ...response, differenceC: -1, review } as CarbonKitchenResponse)).toMatchObject({ ok: false, pendingReview: true });
    }
    expect(checkCarbonKitchen(task, { ...response, review: { ...response.review!, channel: 'written' } })).toMatchObject({ ok: true, observedByAdult: true });
    expect(checkCarbonKitchen(task, { ...response, differenceC: -1, review: { ...response.review!, assistance: 'helped' } })).toMatchObject({ ok: false, observedByAdult: true, assisted: true });
    expect(checkCarbonKitchen(task, { ...response, review: { ...response.review!, observations: { feature: 'met', comparison: 'not-yet', boundary: 'met' } } })).toMatchObject({ ok: false, observedByAdult: true });
  });
  it('rejects malformed, inherited, accessor, duplicate, sparse and prose submissions without evaluating getters', () => {
    for (const id of ids) {
      const task = makeCarbonKitchenTask(id, rng(5), 'build'), response = carbonOracle(task);
      let reads = 0;
      const getter = Object.defineProperty({ ...response }, 'mode', { get() { reads++; return task.mode; }, enumerable: true });
      for (const wrong of [null, [], 0, 'carbon', {}, { ...response, text: 'PRIVATE_2839' }, Object.create(response), getter, { ...response, mode: 'wrong' }]) {
        expect(() => checkCarbonKitchen(task, wrong as CarbonKitchenResponse)).not.toThrow();
        expect(checkCarbonKitchen(task, wrong as CarbonKitchenResponse).ok).toBe(false);
      }
      expect(reads).toBe(0);
      for (const key of ['rows', 'bonds', 'groups', 'chain', 'marks']) if (key in response) {
        const array = (response as unknown as Record<string, unknown[]>)[key]!;
        for (const replacement of [[null], new Array(array.length), [array[0], array[0]], Object.create(array)]) expect(checkCarbonKitchen(task, { ...response, [key]: replacement } as CarbonKitchenResponse).ok).toBe(false);
      }
    }
  });
  it('projects own graph changes only and conserves residue identities across bending and disposal', () => {
    for (const id of [ids[1]!, ids[5]!, ids[6]!]) for (const variant of ['build', 'repair', 'transfer'] as const) for (let seed = 0; seed < 8; seed++) {
      const task = makeCarbonKitchenTask(id, rng(seed), variant), response = carbonOracle(task), scene = carbonKitchenScene(task, response)!;
      expect(JSON.stringify(scene)).not.toMatch(/observations|confirmedByAdult|higherBoiling|differenceC|expected|solution/);
      if (response.mode === 'protein-fragment') {
        const straight = carbonKitchenScene(task, { ...response, folded: false })!;
        expect(straight.residues).toEqual(scene.residues);
      }
    }
    expect(carbonKitchenScene(makeCarbonKitchenTask(ids[0]!, rng(1), 'build'))).toBeUndefined();
    const moleculeTask = makeCarbonKitchenTask(ids[1]!, rng(3), 'build');
    const modelResponse = carbonOracle(moleculeTask);
    if (modelResponse.mode !== 'molecule-build') throw Error('response');
    const hostile = { ...modelResponse, bonds: modelResponse.bonds.map(b => ({ ...b, note: 'PRIVATE_DRAFT_119' })) };
    expect(JSON.stringify(carbonKitchenScene(moleculeTask, hostile))).not.toContain('PRIVATE_DRAFT_119');
    let reads = 0;
    const getter = Object.defineProperty({ ...modelResponse }, 'bonds', { enumerable: true, get() { reads++; return modelResponse.bonds; } });
    carbonKitchenScene(moleculeTask, getter); expect(reads).toBe(0);
    const organicTask = makeCarbonKitchenTask(ids[6]!, rng(2), 'build'), marked = carbonOracle(organicTask);
    if (marked.mode !== 'organic-group') throw Error('response');
    marked.marks[0]!.carbon = 'PRIVATE_DRAFT_119';
    expect(JSON.stringify(carbonKitchenScene(organicTask, marked))).not.toContain('PRIVATE_DRAFT_119');
  });
});
