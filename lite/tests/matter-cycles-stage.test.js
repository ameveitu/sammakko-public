import { expect, it } from 'vitest';
import * as THREE from 'three';
import { rng } from '../src/engine/rng';
import { makeMatterCyclesTask } from '../src/content/matter-cycles';
import { matterOracle } from './matter-cycles-fixtures';
import { matterCyclesScene } from '../src/content/models/matter-cycles-scene';
import { mountMatterCyclesStage } from '../src/world/matter-cycles-stage.js';
it('projects only initial or actually operated quantities and owns the complete actual Three lifecycle', () => {
  for (const id of ['ENV-CHEM-MATTERCONS-01', 'ENV-CHEM-WATERCYCLE-01', 'CHEM79-CARBON-RESERVOIRS']) for (const variant of ['build', 'repair', 'transfer']) for (let seed = 0; seed < 8; seed++) {
    const task = makeMatterCyclesTask(id, rng(seed), variant), response = matterOracle(task), initial = matterCyclesScene(task);
    const scene = matterCyclesScene(task, response), parent = new THREE.Group(), stage = mountMatterCyclesStage(parent, scene);
    expect(stage.snapshot()).toEqual(scene); expect(parent.children).toHaveLength(1);
    if ('moves' in response) {
      expect(matterCyclesScene(task, { ...response, locked: 'yes' }).parcels).toEqual(initial.parcels);
      expect(matterCyclesScene(task, { ...response, locked: false }).operated).toBe(0);
      const parcels = []; parent.traverse(object => { if (object.name.startsWith('tracked-parcel:')) parcels.push(object.userData); });
      expect(parcels.map(p => p.amountMg).reduce((a, b) => a + b, 0)).toBe(task.initial.reduce((sum, p) => sum + p.amountMg, 0));
      for (const parcel of parcels) expect(scene.parcels).toContainEqual(expect.objectContaining(parcel));
    } else {
      const samples = []; parent.traverse(object => { if (object.name.startsWith('own-sample:')) samples.push(object.userData); });
      expect(samples.length).toBe(response.assignments.filter(a => a.reservoir).length);
    }
    expect(JSON.stringify(scene)).not.toMatch(/"(predictedTotalMg|focusChangeMg|observations|confirmedByAdult|expected|answer)":/);
    stage.dispose(); stage.dispose(); expect(parent.children).toHaveLength(0);
  }
});
it('drops hostile fields and never reads getters into a public forecast or placement projection', () => {
  for (const id of ['ENV-CHEM-MATTERCONS-01', 'ENV-CHEM-WATERCYCLE-01', 'CHEM79-CARBON-RESERVOIRS']) {
    const task = makeMatterCyclesTask(id, rng(1), 'build'), response = matterOracle(task); let reads = 0;
    const getter = Object.defineProperty({ ...response }, 'mode', { enumerable: true, get() { reads++; return task.mode; } });
    const initial = matterCyclesScene(task); expect(matterCyclesScene(task, getter)).toEqual(initial); expect(reads).toBe(0);
    expect(JSON.stringify(matterCyclesScene(task, { ...response, note: 'PRIVATE_SCENE_218' }))).not.toContain('PRIVATE_SCENE_218');
    expect(JSON.stringify(matterCyclesScene(task, { ...response, predictedTotalMg: 'PRIVATE_SCENE_218' }))).not.toContain('PRIVATE_SCENE_218');
  }
});
