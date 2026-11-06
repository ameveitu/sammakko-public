import { expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { mountExpeditionStage } from '../src/world/expedition-stage';

it('renders exactly the occupied cells at their layer coordinates and disposes all of them', () => {
  const scene = new THREE.Scene();
  const stage = mountExpeditionStage({ scene, invalidate() {} });
  const model = { kind: 'spatial-volume', title: 'Tilavuus', grid: [3, 2, 2],
    cells: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [1, 0, 1]] };
  stage.show(model);
  const group = scene.getObjectByName('spatial-volume-cubes');
  expect(group.children).toHaveLength(4);
  expect(stage.snapshot().cells).toEqual(model.cells);
  const unit = stage.snapshot().unit;
  const origin = group.getObjectByName('spatial-cube-1-0-0').position;
  const top = group.getObjectByName('spatial-cube-1-0-1').position;
  const behind = group.getObjectByName('spatial-cube-1-1-0').position;
  expect(top.x).toBe(origin.x);
  expect(top.z).toBe(origin.z);
  expect(top.y - origin.y).toBeCloseTo(unit);
  expect(behind.z - origin.z).toBeCloseTo(unit);
  const destroyed = vi.fn();
  group.traverse(object => object.geometry?.addEventListener('dispose', destroyed));
  stage.clear();
  expect(destroyed).toHaveBeenCalledTimes(8);
  expect(scene.getObjectByName('spatial-volume-cubes')).toBeUndefined();
  stage.dispose();
  expect(scene.children).toHaveLength(0);
});
