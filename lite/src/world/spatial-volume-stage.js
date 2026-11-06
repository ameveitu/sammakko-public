import * as THREE from 'three';

export function drawSpatialVolume(parent, model) {
  const [columns, rows, layers] = model.grid;
  const unit = Math.min(.51, 3.4 / columns, 2.4 / rows, 1.9 / layers);
  const group = new THREE.Group();
  group.name = 'spatial-volume-cubes';
  parent.add(group);
  for (const [x, y, z] of model.cells) {
    const geometry = new THREE.BoxGeometry(unit, unit, unit);
    const cube = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
      color: [0x84b8a9, 0x83a4c6, 0xd0aa73][z % 3],
      roughness: .7, emissive: 0x526962, emissiveIntensity: .28,
    }));
    cube.name = `spatial-cube-${x}-${y}-${z}`;
    cube.position.set((x - (columns - 1) / 2) * unit, .28 + (z + .5) * unit, (y - (rows - 1) / 2) * unit);
    cube.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0x3b625f })));
    group.add(cube);
  }
  return { grid: [...model.grid], cells: model.cells.map(cell => [...cell]), unit };
}
