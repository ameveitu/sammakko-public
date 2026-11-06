import { expect, it } from 'vitest';
import * as THREE from 'three';
import { rng } from '../src/engine/rng';
import { makeCarbonKitchenTask } from '../src/content/carbon-kitchen';
import { carbonKitchenScene } from '../src/content/models/carbon-kitchen-scene';
import { mountCarbonKitchenStage } from '../src/world/carbon-kitchen-stage.js';
it('keeps actual Three atom IDs, bond orders and residue identities through bend and disposal', () => {
  for (const id of ['CHEM79-CARBON-COMPOUND', 'CHEM79-NUTRIENT-PROT', 'CHEM79-ORG-GROUP']) for (const variant of ['build', 'repair', 'transfer']) for (let seed = 0; seed < 8; seed++) {
    const task = makeCarbonKitchenTask(id, rng(seed), variant);
    const response = task.mode === 'protein-fragment' ? { mode: task.mode, chain: task.units.slice(0, task.length).map(u => u.id), folded: true } : undefined;
    const scene = carbonKitchenScene(task, response), parent = new THREE.Group(), stage = mountCarbonKitchenStage(parent, scene);
    expect(stage.snapshot()).toEqual(scene); expect(parent.children).toHaveLength(1);
    const atoms = [], residues = [], bonds = [];
    parent.traverse(o => { if (o.name.startsWith('atom:')) atoms.push(o.userData); if (o.name.startsWith('residue:')) residues.push(o.userData.residueId); if (o.name.startsWith('bond:')) bonds.push(o.userData); });
    expect(atoms.map(a => a.atomId)).toEqual(scene.molecules.flatMap(m => m.atoms.map(a => a.id)));
    expect(bonds.length).toBe(scene.molecules.reduce((sum, m) => sum + m.bonds.reduce((n, b) => n + b.order, 0), 0));
    if (response) { expect(residues).toEqual(response.chain); expect(carbonKitchenScene(task, { ...response, folded: false }).residues).toEqual(scene.residues); }
    stage.dispose(); stage.dispose(); expect(parent.children).toHaveLength(0);
  }
});
