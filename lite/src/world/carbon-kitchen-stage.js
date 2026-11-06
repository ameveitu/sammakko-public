import * as THREE from 'three';

function mesh(parent, name, geometry, color, position) {
  const object = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: .6 }));
  object.name = name; object.position.set(...position); parent.add(object); return object;
}
function connector(parent, name, a, b, color = 0xa5b5a5, radius = .022) {
  const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b), delta = end.clone().sub(start);
  if (delta.length() < .0001) return;
  const stick = mesh(parent, name, new THREE.CylinderGeometry(radius, radius, delta.length(), 10), color, start.clone().add(end).multiplyScalar(.5).toArray());
  stick.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize()); return stick;
}
function label(parent, name, text, position, width = 1.25) {
  if (typeof document === 'undefined') return;
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 96;
  const context = canvas.getContext('2d'); if (!context) return;
  context.fillStyle = '#f7edcf'; context.fillRect(0, 0, 512, 96);
  context.fillStyle = '#234a3b'; context.font = 'bold 36px sans-serif'; context.textAlign = 'center'; context.textBaseline = 'middle';
  const short = text.length > 38 ? `${text.slice(0, 36)}…` : text; context.fillText(short, 256, 48, 490);
  const texture = new THREE.CanvasTexture(canvas), material = new THREE.SpriteMaterial({ map: texture, depthWrite: false });
  const sprite = new THREE.Sprite(material); sprite.name = name; sprite.position.set(...position); sprite.scale.set(width, width * 96 / 512, 1); parent.add(sprite);
}
export function mountCarbonKitchenStage(parent, model) {
  const group = new THREE.Group(); group.name = 'carbon-kitchen-workbench'; parent.add(group);
  mesh(group, 'garden-display-table', new THREE.BoxGeometry(4.8, .14, 1.65), 0xb59465, [0, .46, 0]);
  for (const x of [-1.9, 1.9]) mesh(group, 'wooden-display-leg', new THREE.CylinderGeometry(.08, .11, .55, 10), 0x8a6d49, [x, .14, .3]);
  if (model.mode === 'protein-fragment') {
    const positions = model.residues.map((unit, i) => [(i - (model.residues.length - 1) / 2) * .55, .85 + (model.folded ? .3 * Math.sin(i * 1.35) : 0), model.folded ? .35 * Math.cos(i * 1.35) : 0]);
    model.residues.forEach((unit, i) => {
      const piece = mesh(group, `residue:${unit.id}`, new THREE.OctahedronGeometry(.19, 1), unit.kind === 'amino-residue' ? 0x77a58e : unit.kind === 'glucose-residue' ? 0xd4af62 : 0xbc8265, positions[i]);
      piece.userData = { residueId: unit.id, label: unit.label, kind: unit.kind, abstraction: 'labeled-residue-symbol' };
      if (i) connector(group, `chain:${model.residues[i - 1].id}:${unit.id}`, positions[i - 1], positions[i], 0xb6bb92, .035);
      label(group, `label:${unit.id}`, unit.label, [positions[i][0], positions[i][1] + .32, positions[i][2]], .6);
    });
    if (!model.residues.length) label(group, 'empty-fragment-place', 'Oman ketjukatkelman paikka', [0, .8, 0], 2);
  } else {
    model.molecules.forEach((molecule, index) => {
      const root = new THREE.Group(); root.name = `molecule:${molecule.id}`;
      root.position.set((index - (model.molecules.length - 1) / 2) * 1.22, .72, 0); group.add(root);
      const locations = molecule.atoms.map((atom, i) => ({ id: atom.id, point: [(i % 3 - 1) * .28, Math.floor(i / 3) * .28, (i % 2 ? .1 : -.1)] }));
      molecule.atoms.forEach((atom, i) => {
        const radius = atom.element === 'H' ? .063 : .098;
        const ball = mesh(root, `atom:${atom.id}`, new THREE.SphereGeometry(radius, 18, 12), molecule.highlighted.includes(atom.id) ? 0xf0ca6d : atom.element === 'O' ? 0xc97563 : atom.element === 'H' ? 0xf5f1d8 : 0x4b6060, locations[i].point);
        ball.userData = { atomId: atom.id, element: atom.element, implicitHydrogens: atom.hydrogens ?? 0 };
      });
      molecule.bonds.forEach(bond => {
        const a = locations.find(p => p.id === bond.a), b = locations.find(p => p.id === bond.b); if (!a || !b) return;
        for (let n = 0; n < bond.order; n++) {
          const offset = (n - (bond.order - 1) / 2) * .045;
          const object = connector(root, `bond:${bond.a}:${bond.b}:${n}`, [a.point[0], a.point[1], a.point[2] + offset], [b.point[0], b.point[1], b.point[2] + offset]);
          if (object) object.userData = { a: bond.a, b: bond.b, order: bond.order };
        }
      });
      if (molecule.form === 'network-fragment') for (const item of [locations[0], locations.at(-1)]) {
        if (item) connector(root, 'network-continues', item.point, [item.point[0] + .2, item.point[1] + .18, item.point[2]], 0x8ca299, .012);
      }
      label(root, `label:${molecule.id}`, molecule.id === 'own' ? molecule.label : molecule.id, [0, -.08, .36], 1.1);
    });
  }
  let disposed = false;
  return { advanceTime() {}, snapshot() { return structuredClone(model); }, dispose() {
    if (disposed) return; disposed = true;
    group.traverse(object => {
      object.geometry?.dispose();
      const materials = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
      for (const material of materials) { material.map?.dispose(); material.dispose(); }
    }); parent.remove(group);
  } };
}
