import * as THREE from 'three';
function shape(parent, name, geometry, color, xyz, options = {}) {
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: .68, ...options })); mesh.name = name; mesh.position.set(...xyz); parent.add(mesh); return mesh;
}
function text(parent, name, value, xyz, width = .95) {
  if (typeof document === 'undefined') return;
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 112;
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  ctx.fillStyle = '#f3edcf'; ctx.fillRect(0, 0, 512, 112); ctx.fillStyle = '#214c41'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = 'bold 34px sans-serif';
  ctx.fillText(value.length > 33 ? `${value.slice(0, 31)}…` : value, 256, 56, 490);
  const material = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), depthWrite: false }), sprite = new THREE.Sprite(material);
  sprite.name = name; sprite.position.set(...xyz); sprite.scale.set(width, width * 112 / 512, 1); parent.add(sprite);
}
const world = reservoir => [(reservoir.x - 150) / 75, .62 + Math.max(-.3, reservoir.elevation * .45), (reservoir.y - 85) / 100];
export function mountMatterCyclesStage(parent, model) {
  const group = new THREE.Group(); group.name = 'matter-cycles-model'; parent.add(group);
  shape(group, 'cycle-display-base', new THREE.CylinderGeometry(2.45, 2.6, .16, 32, 1, model.mode === 'reservoirs'), 0xb29a73, [0, .33, 0]);
  if (model.mode === 'water-path') {
    shape(group, 'mountain-high-storage', new THREE.ConeGeometry(.8, 1.05, 7), 0x89917b, [1.45, .94, -.15]);
    shape(group, 'snow-cap-given-location', new THREE.ConeGeometry(.28, .34, 7), 0xe6eadc, [1.45, 1.32, -.15]);
    shape(group, 'sea-given-location', new THREE.CylinderGeometry(.7, .7, .06, 24), 0x6099a5, [-1.7, .47, .2], { transparent: true, opacity: .85 });
    shape(group, 'groundwater-cutaway', new THREE.BoxGeometry(1.1, .18, .55), 0x70929b, [-.8, .66, .65], { transparent: true, opacity: .65 });
    for (const x of [-1.42, -.18]) shape(group, 'aquifer-cutaway-side', new THREE.BoxGeometry(.09, .48, .75), 0x9f8f6d, [x, .76, .65]);
    shape(group, 'aquifer-cutaway-back', new THREE.BoxGeometry(1.3, .48, .08), 0x9f8f6d, [-.8, .76, .3]);
  }
  if (model.mode === 'conservation') {
    shape(group, 'closed-chamber-frame', new THREE.BoxGeometry(3.7, 1.3, 1.2), 0xaacbcb, [0, 1.05, 0], { transparent: true, opacity: .08, depthWrite: false });
    shape(group, 'closed-chamber-lid', new THREE.BoxGeometry(3.7, .055, 1.2), 0x91ada5, [0, 1.72, 0]);
  }
  if (model.mode === 'reservoirs') {
    const geological = model.reservoirs.find(r => r.kind === 'geological');
    if (geological) { const [x, y, z] = world(geological); for (let layer = 0; layer < 3; layer++) shape(group, `geological-cutaway-layer:${layer}`, new THREE.BoxGeometry(.8, .08, .5), [0x8f836b, 0xa9977b, 0x687a73][layer], [x, y - .2 + layer * .09, z]); }
  }
  model.reservoirs.forEach((reservoir, index) => {
    const xyz = model.mode === 'conservation' ? [(index - .5) * 1.6, .6, 0] : world(reservoir);
    const location = new THREE.Group(); location.name = `reservoir:${reservoir.id}`; location.position.set(...xyz); group.add(location);
    const gas = ['air', 'vapor', 'gas'].includes(reservoir.kind), cloud = reservoir.kind === 'cloud';
    shape(location, 'reservoir-marker', gas ? new THREE.TorusGeometry(.22, .015, 8, 24) : new THREE.CylinderGeometry(.32, .35, .07, 20), gas ? 0xc6cfbc : 0x799c7d, [0, 0, 0]);
    if (cloud) for (const [x, y] of [[-.15, .09], [.02, .16], [.17, .09]]) shape(location, 'condensed-cloud-droplet-symbol', new THREE.SphereGeometry(.13, 12, 10), 0xe7ecdf, [x, y, 0]);
    const parcels = model.parcels.filter(p => p.reservoir === reservoir.id), amount = parcels.reduce((sum, p) => sum + p.amountMg, 0);
    const samples = model.samples.filter(s => s.at === reservoir.id);
    if (model.mode === 'conservation' && amount > 0) {
      const fraction = Math.min(1, amount / Math.max(1, model.referenceMassMg));
      const bar = shape(location, 'tracked-mass-bar', new THREE.BoxGeometry(.55, Math.max(.015, fraction * .8), .3), gas ? 0xb9caba : 0x65a1b1, [0, .08 + fraction * .4, .08], { transparent: gas, opacity: gas ? .35 : .85, wireframe: gas });
      bar.userData = { amountMg: amount, referenceMassMg: model.referenceMassMg, representation: 'mass-bar-not-volume' };
    }
    parcels.forEach((parcel, p) => {
      const material = parcel.form === 'gas' ? { wireframe: true } : {};
      const marker = shape(location, `tracked-parcel:${parcel.id}`, new THREE.IcosahedronGeometry(.085, 1), parcel.material === 'solute' ? 0xd5c599 : 0x4f9ab5, [(p % 3 - 1) * .15, .16 + Math.floor(p / 3) * .15, .14], material);
      marker.userData = { root: parcel.root, material: parcel.material, amountMg: parcel.amountMg, form: parcel.form, reservoir: parcel.reservoir };
    });
    samples.forEach((sample, p) => {
      const marker = shape(location, `own-sample:${sample.id}`, new THREE.OctahedronGeometry(.09, 0), 0xcaa85f, [(p - (samples.length - 1) / 2) * .19, .18, .1]);
      marker.userData = { card: sample.id, carbonMg: sample.carbonMg, proposal: true };
    });
    text(location, `reservoir-label:${reservoir.id}`, model.mode === 'conservation' ? `${reservoir.label} · ${amount} mg` : reservoir.label, [0, .4 + (model.mode === 'conservation' ? .6 : 0), 0], model.mode === 'conservation' ? 1.5 : 1.05);
  });
  model.transfers.forEach((transfer, i) => {
    if (model.mode === 'conservation') return;
    const from = model.reservoirs.find(r => r.id === transfer.from), to = model.reservoirs.find(r => r.id === transfer.to); if (!from || !to || from.id === to.id) return;
    const start = new THREE.Vector3(...world(from)), end = new THREE.Vector3(...world(to));
    const arrow = new THREE.ArrowHelper(end.clone().sub(start).normalize(), start, start.distanceTo(end), 0xc1a75e, .1, .055); arrow.line.geometry = arrow.line.geometry.clone(); arrow.cone.geometry = arrow.cone.geometry.clone(); arrow.name = `operated-transfer:${i}`; arrow.userData = { ...transfer }; group.add(arrow);
  });
  let disposed = false;
  return { advanceTime() {}, snapshot() { return structuredClone(model); }, dispose() {
    if (disposed) return; disposed = true;
    group.traverse(object => {
      object.geometry?.dispose(); const materials = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
      for (const material of materials) { material.map?.dispose(); material.dispose(); }
    }); parent.remove(group);
  } };
}
