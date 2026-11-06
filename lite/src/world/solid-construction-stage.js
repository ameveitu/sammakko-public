import * as THREE from 'three';
import { solidStageBadge } from './solid-workshop-stage';

const turns = { angled: -.36, ends: 0, side: -Math.PI / 2 };
function lattice(group, width, depth, unit) {
  const x = width * unit / 2, z = depth * unit / 2;
  const points = [];
  for (let i = 0; i <= width; i++) points.push([-x + i * unit, 0, -z], [-x + i * unit, 0, z]);
  for (let i = 0; i <= depth; i++) points.push([-x, 0, -z + i * unit], [x, 0, -z + i * unit]);
  group.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(...p))),
    new THREE.LineBasicMaterial({ color: 0xc5a568 })));
}

export function buildSolidConstructionStage(parent, model) {
  const [width, , depth] = model.grid, unit = Math.min(.62, 1.8 / Math.max(width, depth));
  const boards = [['reference', model.referenceCells, -1.45, 0x80b7a1], ['preview', model.previewCells, 1.45, 0x96b7cc]];
  return boards.map(([name, cells, x, color]) => {
    const group = new THREE.Group();
    group.name = 'solid-build-' + name;
    group.position.set(x, .29, 0);
    group.rotation.y = model.view === 'angled' && model.pose === 'horizontal' ? .66 : turns[model.view];
    lattice(group, width, depth, unit);
    const occupied = new Set(cells.map(p => p.join(',')));
    for (const [i, j, k] of cells) {
      const supported = j === 0 || occupied.has([i, j - 1, k].join(','));
      const geometry = new THREE.BoxGeometry(unit * .985, unit * .985, unit * .985);
      const block = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
        color: supported ? color : 0xd09770, roughness: .63, emissive: 0x475a54, emissiveIntensity: .28,
      }));
      block.name = `solid-cell-${i}-${j}-${k}`;
      block.position.set((i - (width - 1) / 2) * unit, (j + .5) * unit, (k - (depth - 1) / 2) * unit);
      block.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0x305853 })));
      group.add(block);
    }
    parent.add(group);
    const label = solidStageBadge(name === 'reference' ? '1' : '2', .19);
    label.position.set(x, .52, 1.38);
    parent.add(label);
    return { name, cells: cells.map(cell => [...cell]), rotation: group.rotation.y };
  });
}
