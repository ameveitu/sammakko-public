import * as THREE from 'three';

function box(parent, name, size, position, colour, options = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), new THREE.MeshStandardMaterial({ color: colour, roughness: .65, ...options }));
  mesh.name = name; mesh.position.set(...position); parent.add(mesh); return mesh;
}
function vessel(parent, name, x, z, fraction, colour = 0x75aeb8) {
  const group = new THREE.Group(); group.name = name; group.position.set(x, .57, z); parent.add(group);
  box(group, 'vessel-base', [.65, .04, .5], [0, 0, 0], 0xd0dddd, { transparent: true, opacity: .4 });
  for (const side of [-1, 1]) box(group, 'transparent-vessel-wall', [.018, .9, .5], [side * .325, .45, 0], 0xc0d9d1, { transparent: true, opacity: .24, depthWrite: false });
  box(group, 'transparent-vessel-back', [.65, .9, .018], [0, .45, -.25], 0xc0d9d1, { transparent: true, opacity: .24, depthWrite: false });
  if (fraction > 0) box(group, 'current-liquid-amount', [.61, fraction * .82, .46], [0, fraction * .41 + .025, 0], colour, { transparent: true, opacity: .65 });
  for (let i = 0; i <= 5; i++) box(group, 'calibration-mark', [.12, .012, .02], [.28, .03 + i * .164, .27], 0x375b4e);
  return group;
}
function liquidPrism(parent, name, base, top, height, depth, colour, options = {}) {
  const shape = new THREE.Shape();
  shape.moveTo(-base / 2, 0); shape.lineTo(base / 2, 0); shape.lineTo(top / 2, height); shape.lineTo(-top / 2, height); shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }); geometry.translate(0, 0, -depth / 2);
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: colour, roughness: .5, ...options }));
  mesh.name = name; parent.add(mesh); return mesh;
}
export function mountChemicalInvestigationStage(parent, model) {
  const group = new THREE.Group(); group.name = 'chemical-investigation-table'; parent.add(group);
  box(group, 'inquiry-worktop', [3.7, .12, 1.75], [0, .42, 0], 0xac865b);
  if (model.mode === 'tool') {
    const state = model.transfer;
    vessel(group, 'source-vessel', -1.1, 0, state.sourceUl / state.capacityUl);
    vessel(group, 'receiving-vessel', 1.1, 0, state.receiverUl / state.receiverCapacityUl);
    const instrument = model.instrument;
    if (instrument?.id === 'pipette-small' || instrument?.id === 'pipette-large') {
      const holder = new THREE.Group(); holder.name = 'operated-pipette'; holder.position.set(0, .65, .02); group.add(holder);
      holder.userData = { instrument: instrument.id };
      box(holder, 'pipette-stem', [.10, 1.25, .10], [0, .55, 0], 0xd0dedd, { transparent: true, opacity: .4 });
      const fraction = state.heldUl / instrument.capacity;
      if (fraction > 0) box(holder, 'pipette-held-liquid', [.07, fraction * .86, .07], [0, .08 + fraction * .43, 0], 0x75aeb8);
      box(holder, 'pipette-grip', [.26, .23, .26], [0, 1.28, 0], 0x8cab83);
      for (let i = 0; i <= 5; i++) box(holder, 'pipette-division', [.15, .01, .02], [0, .15 + i * .15, .065], 0x365b4d);
    } else if (instrument?.id === 'cylinder' || instrument?.id === 'beaker') {
      const holder = new THREE.Group(); holder.name = instrument.id === 'cylinder' ? 'operated-measuring-cylinder' : 'operated-beaker';
      holder.position.set(0, .57, .02); holder.userData = { instrument: instrument.id }; group.add(holder);
      const radius = instrument.id === 'cylinder' ? .19 : .31, height = instrument.id === 'cylinder' ? 1.2 : .65;
      const wall = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 24, 1, true),
        new THREE.MeshStandardMaterial({ color: 0xc0d9d1, transparent: true, opacity: .24, depthWrite: false, side: THREE.DoubleSide }));
      wall.name = 'graduated-vessel-wall'; wall.position.y = height / 2; holder.add(wall);
      box(holder, 'graduated-vessel-foot', [radius * 2.6, .04, radius * 2.6], [0, 0, 0], 0xbed0c5);
      const filledHeight = state.heldUl / instrument.capacity * height;
      if (filledHeight > 0) {
        const liquid = new THREE.Mesh(new THREE.CylinderGeometry(radius * .92, radius * .92, filledHeight, 24),
          new THREE.MeshStandardMaterial({ color: 0x75aeb8, transparent: true, opacity: .65 }));
        liquid.name = 'graduated-vessel-held-liquid'; liquid.position.y = filledHeight / 2; holder.add(liquid);
      }
      const divisions = Math.min(10, Math.floor(instrument.capacity / instrument.division));
      for (let i = 0; i <= divisions; i++) box(holder, 'graduated-vessel-division', [.10, .009, .016], [radius * .35, height * i / divisions, radius], 0x365b4d);
    } else if (instrument?.id === 'balance') {
      box(group, 'selected-unsuitable-balance', [.75, .14, .6], [0, .64, .02], 0x769787);
    } else {
      box(group, 'instrument-awaits-selection', [.6, .045, .5], [0, .57, .02], 0xd0cfb7);
    }
  } else if (model.mode === 'mass' && model.meter) {
    box(group, 'virtual-balance', [1.42, .19, .9], [0, .6, 0], 0x769787);
    box(group, 'weighing-platform', [.78, .07, .58], [0, .75, .08], 0xccd0ba);
    if (model.containerPlaced) {
      const cup = vessel(group, 'tare-container', 0, .08, 0); cup.position.y = .81; cup.scale.setScalar(.65);
    }
    if (model.samplePlaced) box(group, 'named-sample', [.28, .17, .25], [0, .98, .08], 0xc8b184);
    box(group, 'meter-face', [.82, .55, .04], [0, 1.06, -.29], 0xf0ead5);
    const pointer = model.meter?.pointer ?? 0;
    for (let i = 0; i <= 8; i++) {
      const angle = -Math.PI * .7 + i / 8 * Math.PI * 1.4;
      const tick = box(group, 'meter-tick', [.016, .045, .015], [Math.sin(angle) * .28, 1.04 + Math.cos(angle) * .18, -.26], 0x30574c);
      tick.rotation.z = -angle;
    }
    const angle = -Math.PI * .7 + pointer * Math.PI * 1.4;
    const needle = box(group, 'actual-reading-pointer', [.016, .25, .02], [Math.sin(angle) * .125, 1.04 + Math.cos(angle) * .125, -.235], 0xa5653e);
    needle.rotation.z = -angle;
    needle.userData = model.meter ? { readingMg: model.meter.readingMg, minMg: model.meter.minMg, maxMg: model.meter.maxMg } : {};
  } else if (model.liquid) {
    const data = model.liquid, cup = new THREE.Group(); cup.name = 'calibrated-volume-vessel'; cup.position.set(0, .53, 0); group.add(cup);
    const height = 1.35, base = data.baseWidth / 100, top = data.topWidth / 100;
    liquidPrism(cup, 'glass-prismatic-vessel', base, top, height, .55, 0xc1d7d0, { transparent: true, opacity: .17, depthWrite: false, side: THREE.DoubleSide });
    const filledHeight = height * data.heightFraction, filledWidth = base + (top - base) * data.heightFraction;
    if (data.volumeUl > 0) liquidPrism(cup, 'calibrated-liquid-content', base, filledWidth, filledHeight, .52, 0x72a8b5, { transparent: true, opacity: .66 });
    for (const tick of data.ticks) {
      const y = height * tick.heightFraction;
      const mark = box(cup, 'volume-division', [.12, .006, .012], [-top / 2 - .08, y, .28], 0x315b4e);
      mark.userData = { volumeUl: tick.volumeUl, heightFraction: tick.heightFraction };
    }
    if (data.volumeUl > 0) {
      const edgeWidth = base + (top - base) * data.edgeFraction;
      const points = Array.from({ length: 25 }, (_, i) => {
        const t = (i - 12) / 12;
        return new THREE.Vector3(t * edgeWidth / 2, filledHeight + height * (data.edgeFraction - data.heightFraction) * t * t, .278);
      });
      const curve = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: 0x2f6870 }));
      curve.name = 'schematic-meniscus-reading-curve'; cup.add(curve);
    }
    if (model.eyeLevel) {
      const eye = new THREE.Mesh(new THREE.TorusGeometry(.07, .016, 8, 20), new THREE.MeshStandardMaterial({ color: 0x9e693d }));
      eye.name = 'eye-at-current-meniscus'; eye.position.set(top / 2 + .35, data.readPoint === 'edge' ? height * data.edgeFraction : filledHeight, .02); cup.add(eye);
      box(cup, 'eye-level-guide', [.28, .012, .012], [top / 2 + .17, data.readPoint === 'edge' ? height * data.edgeFraction : filledHeight, .02], 0xb27a46);
    }
  } else {
    box(group, 'instrument-awaits-selection', [.8, .08, .65], [0, .58, 0], 0xd0cfb7);
  }
  let disposed = false;
  return { advanceTime() {}, snapshot() {
    const snapshot = structuredClone(model);
    // The renderer needs the physical surface before the learner takes a reading.
    // Public debug output reports only observed measurements and given calibration.
    if (model.mode !== 'tool' && model.read !== true) {
      if (snapshot.meter) {
        delete snapshot.meter.readingMg;
        delete snapshot.meter.pointer;
      }
      if (snapshot.liquid) {
        delete snapshot.liquid.volumeUl;
        delete snapshot.liquid.heightFraction;
        delete snapshot.liquid.edgeFraction;
        delete snapshot.liquid.ticks;
      }
    }
    return snapshot;
  }, dispose() {
    if (disposed) return; disposed = true;
    group.traverse(object => {
      object.geometry?.dispose();
      const materials = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
      for (const material of materials) material.dispose();
    });
    parent.remove(group);
  } };
}
