import * as THREE from 'three';

/** Fixed side view of the authored measurement model. The stage has no grading logic. */
export function mountRightTriangleStage(parent, model, revealed = false) {
  const root = new THREE.Group();
  root.name = 'right-triangle';
  parent.add(root);

  const rock = new THREE.MeshStandardMaterial({ color: 0x637571, roughness: .95 });
  const moss = new THREE.MeshStandardMaterial({ color: 0x6f8e54, roughness: .96 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xd4ad61, metalness: .35, roughness: .57 });
  const focus = new THREE.MeshStandardMaterial({ color: 0xe68d49, emissive: 0xd85d25, emissiveIntensity: .3 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x73503e, roughness: .9 });
  const guides = [0x66bcb5, 0xd99560, 0x9cbed8].map(color =>
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: .11, roughness: .75 }));
  const materials = [rock, moss, brass, focus, wood, ...guides];
  const put = (geometry, material, point) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(point);
    root.add(mesh);
    return mesh;
  };
  const vector = (x, y, z) => new THREE.Vector3(x, y, z);
  const box = (x, y, z, width, height, depth, material) =>
    put(new THREE.BoxGeometry(width, height, depth), material, vector(x, y, z));
  const line = (from, to, material, radius = .035) => {
    const delta = to.clone().sub(from);
    const length = delta.length();
    if (length < 1e-6) return;
    const mesh = put(new THREE.CylinderGeometry(radius, radius, length, 10), material, from.clone().lerp(to, .5));
    mesh.quaternion.setFromUnitVectors(vector(0, 1, 0), delta.normalize());
  };
  const dash = (from, to, material) => {
    for (let i = 0; i < 11; i += 2) line(from.clone().lerp(to, i / 11), from.clone().lerp(to, (i + 1) / 11), material, .023);
  };
  box(0, .27, -.08, 5.4, .18, 2.25, wood);
  box(0, .38, -.08, 5.25, .065, 2.1, moss);
  const vertices = model.vertices.map(([x, y, z]) => vector(x, y, z + .18));
  const left = Math.min(...vertices.map(point => point.x));
  const right = Math.max(...vertices.map(point => point.x));
  for (const [index, point] of vertices.entries()) {
    const active = model.focus === index;
    put(new THREE.SphereGeometry(active ? .13 : .075, 14, 10), active ? focus : brass, point);
    if (point.y > .75) {
      const height = point.y - .43;
      const width = model.mode === 'rope' ? .78 : .53;
      const crag = box(point.x, .43 + height / 2, -.36, width, height, .68, rock);
      crag.rotation.y = .12;
      box(point.x, point.y - .025, -.36, width + .08, .07, .74, moss);
    }
  }
  for (let side = 0; side < 3; side++) {
    const [a, b] = vertices.filter((_, index) => index !== side);
    if (model.shownSides.includes(side) || revealed) line(a, b, revealed && side === model.right ? brass : guides[side]);
    else dash(a, b, guides[side]);
  }
  if (model.right !== undefined) {
    const corner = vertices[model.right];
    const directions = vertices.filter((_, index) => index !== model.right)
      .map(point => point.clone().sub(corner).normalize().multiplyScalar(.19));
    const first = corner.clone().add(directions[0]);
    const second = corner.clone().add(directions[1]);
    const bend = first.clone().add(directions[1]);
    line(first, bend, brass, .024);
    line(bend, second, brass, .024);
  }
  if (model.focus !== undefined) {
    const origin = vertices[model.focus];
    const [a, b] = vertices.filter((_, index) => index !== model.focus)
      .map(point => point.clone().sub(origin).normalize());
    const angle = a.angleTo(b);
    const radius = .24;
    const tangent = b.clone().addScaledVector(a, -a.dot(b)).normalize();
    let previous = origin.clone().addScaledVector(a, radius);
    for (let i = 1; i <= 8; i++) {
      const phi = angle * i / 8;
      const point = origin.clone().addScaledVector(a, radius * Math.cos(phi)).addScaledVector(tangent, radius * Math.sin(phi));
      line(previous, point, focus, .021);
      previous = point;
    }
    if (model.mode === 'sighting' || model.mode === 'relay') {
      const target = vertices.find((point, index) => index !== model.focus && index !== model.right);
      const direction = target.clone().sub(origin).normalize();
      const start = origin.clone().add(vector(0, .06, .19));
      line(start, start.clone().addScaledVector(direction, .34), brass, .073);
    }
  }
  if (model.mode === 'height' || model.mode === 'relay') {
    const marker = vertices.reduce((best, point) => point.y > best.y ? point : best);
    const pole = marker.clone().add(vector(.12, 0, -.35));
    line(pole, pole.clone().add(vector(0, .37, 0)), brass, .035);
    put(new THREE.SphereGeometry(.11, 14, 10), focus, pole.clone().add(vector(0, .41, 0)));
  }
  if (model.mode === 'rope') {
    for (const x of [left, right]) box(x, .45, .05, .59, .095, .54, wood);
  }
  if (revealed && model.focus !== undefined && (model.mode === 'sighting' || model.mode === 'relay')) {
    const target = vertices.find((point, index) => index !== model.focus && index !== model.right);
    put(new THREE.SphereGeometry(.11, 14, 10), focus, target.clone().add(vector(0, .09, .02)));
  }

  return {
    snapshot: () => ({ mode: model.mode, markedRight: model.right !== undefined, markedFocus: model.focus !== undefined,
      shownSides: [...model.shownSides], guideSegments: 3, revealed }),
    advanceTime() {},
    dispose() {
      root.traverse(object => object.geometry?.dispose());
      for (const material of materials) material.dispose();
      root.removeFromParent();
    },
  };
}
