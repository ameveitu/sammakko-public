import * as THREE from 'three';
import { flat, sizeOf } from '../content/models/solid-workshop';

const outlineColor = 0x244843;
const surfaceColor = 0x88b9aa;
const markerColor = 0xffdf96;
const glyphs = {
  A: [[0, 0, .5, 1], [.5, 1, 1, 0], [.23, .45, .77, .45]],
  B: [[0, 0, 0, 1], [0, 1, .65, 1], [.65, 1, .85, .75], [.85, .75, .65, .52], [.65, .52, 0, .52],
    [.65, .52, .9, .27], [.9, .27, .65, 0], [.65, 0, 0, 0]],
  C: [[.9, .9, .63, 1], [.63, 1, .2, .9], [.2, .9, 0, .5], [0, .5, .2, .1], [.2, .1, .63, 0], [.63, 0, .9, .1]],
  D: [[0, 0, 0, 1], [0, 1, .62, .95], [.62, .95, .91, .66], [.91, .66, .91, .34], [.91, .34, .62, .05], [.62, .05, 0, 0]],
  E: [[0, 0, 0, 1], [0, 1, .9, 1], [0, .52, .72, .52], [0, 0, .9, 0]],
  '1': [[.22, .8, .5, 1], [.5, 1, .5, 0], [.18, 0, .82, 0]],
  '2': [[.07, .8, .25, 1], [.25, 1, .72, 1], [.72, 1, .91, .75], [.91, .75, .05, 0], [.05, 0, .92, 0]],
  '3': [[.07, .95, .74, .95], [.74, .95, .92, .72], [.92, .72, .66, .5], [.66, .5, .23, .5],
    [.66, .5, .92, .24], [.92, .24, .74, 0], [.74, 0, .07, .04]],
};

export function solidStageBadge(id, radius) {
  const group = new THREE.Group();
  // The same letters and numbers appear in the exact projections. No text textures are needed.
  const plate = new THREE.Mesh(new THREE.CircleGeometry(radius, 24),
    new THREE.MeshBasicMaterial({ color: outlineColor, side: THREE.DoubleSide, depthTest: false }));
  plate.renderOrder = 7;
  const strokes = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints((glyphs[id] ?? []).flatMap(([x, y, xx, yy]) =>
    [[x, y], [xx, yy]].map(([u, v]) => new THREE.Vector3((u - .5) * radius, (v - .5) * radius, .002)))),
  new THREE.LineBasicMaterial({ color: 0xffedc4, depthTest: false }));
  strokes.renderOrder = 8;
  group.add(plate, strokes);
  // The stage camera remains in front and above the fixed table.
  group.rotation.x = -.42;
  return group;
}

function polygonMesh(shape) {
  const { base } = shape, n = base.length;
  const h = 'height' in shape ? shape.height / 2 : 0;
  const positions = base.flatMap(([x, z]) => [x, -h, z]);
  const sides = [];
  const cap = THREE.ShapeUtils.triangulateShape(base.map(([x, z]) => new THREE.Vector2(x, z)), []);
  const indices = cap.flat();
  if (shape.kind === 'prism') {
    positions.push(...base.flatMap(([x, z]) => [x, h, z]));
    for (const [a, b, c] of cap) indices.push(n + a, n + c, n + b);
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      sides.push(i, i + n, j + n, i, j + n, j);
    }
  } else if (shape.kind === 'pyramid') {
    positions.push(0, h, 0);
    for (let i = 0; i < n; i++) sides.push(i, n, (i + 1) % n);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex([...indices, ...sides]);
  geometry.computeVertexNormals();
  return geometry;
}

function surface(geometry) {
  switch (geometry.kind) {
    case 'disk': return new THREE.CircleGeometry(geometry.radius, 64).rotateX(-Math.PI / 2);
    case 'sphere': return new THREE.SphereGeometry(geometry.radius, 40, 24);
    case 'cylinder': return new THREE.CylinderGeometry(geometry.radius, geometry.radius, geometry.height, 64);
    case 'cone': return new THREE.ConeGeometry(geometry.radius, geometry.height, 64);
    default: return polygonMesh(geometry);
  }
}

function baseOutline(geometry, y) {
  const coords = 'base' in geometry ? geometry.base
    : Array.from({ length: 64 }, (_, i) => [Math.cos(i * Math.PI / 32) * geometry.radius, Math.sin(i * Math.PI / 32) * geometry.radius]);
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([...coords, coords[0]].map(([x, z]) => new THREE.Vector3(x, y, z))),
    new THREE.LineDashedMaterial({ color: 0xffecbb, transparent: true, opacity: .7, depthTest: false, dashSize: .25, gapSize: .18 }));
  line.computeLineDistances();
  line.renderOrder = 2;
  return line;
}

function rotation(figure, view) {
  if (view === 'ends') return [1.04, .18, 0];
  if (view === 'side') return [-.5, -.12, -.23];
  if (figure.pose === 'horizontal') return [-.28, .38, -Math.PI / 2];
  if (figure.pose === 'tilted') return [.16, -.41, -.43];
  return [0, .35, .08];
}

export function buildSolidWorkshopStage(parent, model) {
  const unit = (model.figures.length === 1 ? 2.3 : 1.8) /
    Math.max(...model.figures.map(({ geometry }) => Math.max(...Object.values(sizeOf(geometry)))));
  return model.figures.map((figure, i) => {
    const x = (i - (model.figures.length - 1) / 2) * 1.72;
    const group = new THREE.Group();
    group.name = 'solid-figure-' + figure.id;
    group.rotation.set(...rotation(figure, model.view));
    group.scale.setScalar(unit);
    const geometry = surface(figure.geometry);
    const object = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
      color: surfaceColor, roughness: .66, metalness: .06, side: THREE.DoubleSide, emissive: 0x46645f, emissiveIntensity: .28,
      flatShading: 'base' in figure.geometry,
    }));
    object.name = 'solid-surface';
    group.add(object);
    if (figure.geometry.kind !== 'sphere') {
      group.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 22),
        new THREE.LineBasicMaterial({ color: outlineColor })));
    }
    if ('height' in figure.geometry) {
      group.add(baseOutline(figure.geometry, -figure.geometry.height / 2));
      if (figure.geometry.kind === 'cylinder' || figure.geometry.kind === 'prism') {
        group.add(baseOutline(figure.geometry, figure.geometry.height / 2));
      }
    }
    parent.add(group);
    const height = new THREE.Box3().setFromObject(group).min.y;
    group.position.set(x, Math.max(.64, .66 - height), -.05);
    const id = solidStageBadge(figure.id, .19);
    id.position.set(x, .52, 1.25); parent.add(id);

    const physicalMarks = (figure.marks ?? []).map(mark => ({
      id: mark.id, highlight: mark.highlight,
      tip: new THREE.Vector3(...mark.position).multiplyScalar(unit).applyEuler(group.rotation).add(group.position),
    })).sort((a, b) => (b.tip.y - a.tip.y) * .86 - (b.tip.z - a.tip.z) * .51);
    physicalMarks.forEach(({ id: markId, tip, highlight }, index) => {
      const pin = new THREE.Mesh(new THREE.SphereGeometry(.045, 10, 8),
        new THREE.MeshBasicMaterial({ color: highlight ? 0xf8a669 : markerColor, depthTest: false }));
      pin.position.copy(tip);
      pin.renderOrder = 4;
      parent.add(pin);
      const label = solidStageBadge(markId, .105);
      label.position.set(x + .68, group.position.y + .36 - index * .30, .53);
      const guide = new THREE.Line(new THREE.BufferGeometry().setFromPoints([tip, label.position]),
        new THREE.LineBasicMaterial({ color: 0xffedc4, transparent: true, opacity: .75, depthTest: false }));
      guide.renderOrder = 3;
      parent.add(guide, label);
    });
    return { id: figure.id, dimensionality: flat(figure.geometry) ? 2 : 3, pose: figure.pose,
      orientation: [group.rotation.x, group.rotation.y, group.rotation.z], marked: figure.marks?.map(({ id }) => id) ?? [] };
  });
}
