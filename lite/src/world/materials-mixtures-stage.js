import * as THREE from 'three';

const tint = name => {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return [0x73a9b5, 0xc4a36c, 0x84af8b, 0xc59b83, 0x96a9c5][hash % 5];
};
function block(parent, name, dimensions, xyz, color, options = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...dimensions), new THREE.MeshStandardMaterial({ color, roughness: .64, ...options }));
  mesh.name = name; mesh.position.set(...xyz); parent.add(mesh); return mesh;
}
function compositionView(parent, model) {
  const root = new THREE.Group(); root.name = 'mixture-phase-cross-sections'; parent.add(root);
  model.compositions.forEach((sample, index) => {
    const group = new THREE.Group(); group.name = `composition:${sample.id}`;
    group.position.set((index - (model.compositions.length - 1) / 2) * 1.8, .52, 0); root.add(group);
    block(group, 'sample-tray', [1.45, .08, 1], [0, 0, 0], 0xb89263);
    block(group, 'transparent-cross-section', [1.08, .62, .58], [0, .37, 0], 0xd0e1d7, { transparent: true, opacity: .18, depthWrite: false });
    const layered = sample.phases > 1 && sample.regions.some((region, i) => i > 0 && region.some((n, j) => n !== sample.regions[0][j]));
    block(group, 'continuous-phase', [.98, layered ? .2 : .35, .5], [0, layered ? .17 : .26, 0], tint(sample.substances[0].name), { transparent: true, opacity: .55 });
    if (layered) block(group, 'separate-upper-phase', [.98, .15, .5], [0, .36, 0], tint(sample.substances[1].name), { transparent: true, opacity: .75 });
    if (sample.phases > 1 && !layered) {
      for (const [x, y, z] of [[-.28, .23, -.1], [.22, .36, .1], [0, .18, .15], [-.15, .38, 0]]) {
        const drop = new THREE.Mesh(new THREE.SphereGeometry(.065, 12, 8), new THREE.MeshStandardMaterial({ color: tint(sample.substances[1].name), roughness: .5 }));
        drop.position.set(x, y, z); drop.name = 'dispersed-phase-boundary'; group.add(drop);
      }
    }
    sample.regions.forEach((region, r) => {
      const view = new THREE.Group(); view.name = `region:${r + 1}`; view.position.set((r - .5) * .57, .16, .64); group.add(view);
      block(view, 'region-observation-tile', [.5, .04, .28], [0, 0, 0], 0xe9ddbc);
      region.forEach((count, j) => {
        if (!count) return;
        const marker = new THREE.Mesh(new THREE.SphereGeometry(.052, 10, 7), new THREE.MeshStandardMaterial({ color: tint(sample.substances[j].name), roughness: .6 }));
        marker.name = 'qualitative-substance-symbol'; marker.position.set((j - .5) * .16, .07, 0);
        marker.userData = { substance: sample.substances[j].name, modelShares: count, units: 'scale-free-model-shares' }; view.add(marker);
      });
    });
  });
  const snapshot = () => ({ kind: model.kind, mode: model.mode, operated: model.operated, vessels: [], compositions: model.compositions, legend: model.legend });
  return { ...snapshot(), snapshot, group: root };
}
/** Schematic substance parcels. Exact mg stay in the 2D panel. No fluid-dynamics or molecular-count claim. */
export function drawMaterialsMixtures(parent, model) {
  if (model.mode === 'composition') return compositionView(parent, model);
  const root = new THREE.Group(); root.name = 'materials-mixtures-workbench'; parent.add(root);
  const columns = Math.min(4, Math.max(1, model.vessels.length));
  model.vessels.forEach((vessel, index) => {
    const group = new THREE.Group(); group.name = `matter-vessel:${vessel.id}`;
    group.position.set((index % columns - (columns - 1) / 2) * 1.12, .5, Math.floor(index / columns) * .83 - .55);
    root.add(group);
    block(group, 'vessel-platform', [.92, .09, .66], [0, 0, 0], 0xbb9563);
    const wide = vessel.shape === 'wide';
    group.scale.x = wide ? 1.15 : 1;
    group.scale.y = wide ? .78 : 1;
    block(group, 'transparent-vessel-base', [.72, .035, .5], [0, .08, 0], 0xc4dddd, { transparent: true, opacity: .55 });
    for (const x of [-.36, .36]) block(group, 'vessel-wall', [.018, .63, .5], [x, .39, 0], 0xb9d6d1, { transparent: true, opacity: .22, depthWrite: false });
    block(group, 'vessel-back', [.72, .63, .018], [0, .39, -.25], 0xb9d6d1, { transparent: true, opacity: .22, depthWrite: false });
    vessel.parcels.forEach((parcel, p) => {
      const marker = new THREE.Group(); marker.name = `parcel:${parcel.id}`;
      marker.userData = { root: parcel.root, substance: parcel.substance, massMg: parcel.massMg, phase: parcel.phase, zone: parcel.zone };
      group.add(marker);
      const gas = parcel.phase === 'gas';
      const y = gas ? .48 : parcel.zone === 'bottom' ? .15 : .26 + p * .09;
      const geometry = gas ? new THREE.IcosahedronGeometry(.07, 0) : parcel.phase === 'liquid' && parcel.zone !== 'dispersed' ? new THREE.BoxGeometry(.57, .13, .38) : parcel.zone === 'bottom' ? new THREE.BoxGeometry(.22, .07, .19) : parcel.phase === 'solid' ? new THREE.BoxGeometry(.17, .17, .17) : new THREE.SphereGeometry(.075, 12, 8);
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: tint(parcel.substance), roughness: .58,
        transparent: gas, opacity: gas ? .7 : 1 }));
      mesh.position.set(-.23 + (p % 3) * .22, y, -.08 + Math.floor(p / 3) * .18);
      if (parcel.phase === 'liquid' && parcel.zone !== 'dispersed') { mesh.position.set(0, .19, 0); if (wide) mesh.scale.y = 1 / (1.15 * .78); }
      if (parcel.phase === 'solid') mesh.scale.set(wide ? 1 / 1.15 : 1, wide ? 1 / .78 : 1, 1);
      mesh.name = 'schematic-mass-packet'; marker.add(mesh);
      if (parcel.zone === 'dispersed') {
        for (const [x, y, z] of [[-.2, .22, -.1], [.18, .25, .12], [0, .18, -.16]]) {
          const drop = new THREE.Mesh(new THREE.SphereGeometry(.04, 10, 7), mesh.material);
          drop.name = 'dispersed-phase-droplet'; drop.position.set(x, y, z); marker.add(drop);
        }
      }
      if (parcel.zone === 'dissolved') {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(.10, .012, 6, 18), new THREE.MeshStandardMaterial({ color: tint(parcel.substance) }));
        ring.rotation.x = Math.PI / 2; ring.position.copy(mesh.position); marker.add(ring);
      }
    });
    if (vessel.parcels.some(p => p.phase === 'gas')) block(group, 'closed-environment-lid', [.73, .035, .51], [0, .72, 0], 0xa2c4c3, { transparent: true, opacity: .45 });
  });
  const snapshot = () => ({ kind: model.kind, mode: model.mode, operated: model.operated,
    vessels: model.vessels.map(v => ({ id: v.id, label: v.label, shape: v.shape, parcels: v.parcels.map(({ root, substance, massMg, phase, zone }) => ({ root, substance, massMg, phase, zone })) })), legend: model.legend });
  return { ...snapshot(), snapshot, group: root };
}
export function mountMaterialsMixturesStage(parent, model) {
  const drawn = drawMaterialsMixtures(parent, model);
  let disposed = false;
  return { advanceTime() {}, snapshot: drawn.snapshot, dispose() {
    if (disposed) return; disposed = true;
    drawn.group.traverse(object => {
      object.geometry?.dispose();
      const materials = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
      for (const material of materials) material.dispose();
    });
    parent.remove(drawn.group);
  } };
}
