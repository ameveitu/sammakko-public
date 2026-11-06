import * as THREE from 'three';
import { vesselWidths } from '../content/models/measurement-station';

const teal = 0x4b776c;
const wood = 0xad7950;
const water = 0x60bcd4;
const rim = 0x356c6a;

function mesh(group, name, geometry, color, x, y, z, options = {}) {
  const object = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: .56, ...options }));
  object.name = name;
  object.position.set(x, y, z);
  group.add(object);
  return object;
}
function box(group, name, width, height, depth, color, x, y, z, options) {
  return mesh(group, name, new THREE.BoxGeometry(width, height, depth), color, x, y, z, options);
}
function edges(group, name, geometry, x, y, z) {
  const outline = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: rim }));
  outline.name = name;
  outline.position.set(x, y, z);
  group.add(outline);
  return outline;
}

function drawScale(group, model) {
  box(group, 'scale-base', 1.85, .30, 1.07, teal, 0, .42, 0);
  box(group, 'scale-pan', 1.37, .10, .88, 0xb8cdc2, 0, .63, 0);
  if (model.basket) {
    box(group, 'basket-base', .88, .08, .61, wood, 0, .71, 0);
    for (const side of [-1, 1]) {
      box(group, 'basket-long-edge', .88, .28, .06, wood, 0, .83, side * .28);
      box(group, 'basket-short-edge', .06, .28, .56, wood, side * .41, .83, 0);
    }
  }
  if (model.loaded) {
    const payload = mesh(group, 'scale-load', new THREE.IcosahedronGeometry(.31, 1), 0x739789, 0, model.basket ? .93 : .88, 0);
    payload.scale.set(1.04, .67, .8);
  }
  const lit = model.zeroed ? 0x8ed7b6 : 0xd8b479;
  box(group, 'scale-display', .90, .18, .03, 0x284d47, 0, .44, .55);
  if (model.display === 'beam') {
    for (let i = -3; i <= 3; i++) box(group, 'beam-mark', .015, i % 2 ? .04 : .065, .02, lit, i * .11, .43, .57);
    box(group, 'beam-dial-pointer', .035, .08, .025, 0xf2b57d, -.33 + .66 * model.needle, .48, .58);
  } else box(group, 'scale-indicator', .54, .06, .02, lit, 0, .44, .57, { emissive: lit, emissiveIntensity: .32 });
}

const glass = { transparent: true, opacity: .23, depthWrite: false, side: THREE.DoubleSide };

function trapezoid(widthBottom, widthTop, height, depth) {
  const profile = new THREE.Shape();
  profile.moveTo(-widthBottom / 2, 0);
  profile.lineTo(widthBottom / 2, 0);
  profile.lineTo(widthTop / 2, height);
  profile.lineTo(-widthTop / 2, height);
  profile.closePath();
  return new THREE.ExtrudeGeometry(profile, { depth, bevelEnabled: false }).translate(0, 0, -depth / 2);
}

function drawVessel(group, model) {
  const y = .32, height = 1.26, top = 1.16, base = top * vesselWidths.base / vesselWidths.top, depth = .82;
  const flared = model.vessel === 'flared';
  const profile = fraction => base + (top - base) * fraction;
  const hull = flared ? trapezoid(base, top, height, depth) : new THREE.CylinderGeometry(top / 2, top / 2, height, 32, 1, true);
  if (!flared) hull.translate(0, height / 2, 0);
  const vessel = mesh(group, 'calibrated-vessel', hull, 0xb1d9d5, 0, y, 0, glass);
  vessel.renderOrder = 2;
  if (flared) edges(group, 'vessel-edges', hull, 0, y, 0);
  else {
    mesh(group, 'vessel-rim', new THREE.TorusGeometry(top / 2, .022, 8, 32), rim, 0, y + height, 0).rotation.x = Math.PI / 2;
    mesh(group, 'vessel-base', new THREE.TorusGeometry(top / 2, .020, 8, 32), rim, 0, y, 0).rotation.x = Math.PI / 2;
  }
  if (model.fillHeight > 0) {
    const fill = model.fillHeight * height;
    const geometry = flared ? trapezoid(base * .96, profile(model.fillHeight) * .96, fill, depth * .96)
      : new THREE.CylinderGeometry(top * .48, top * .48, fill, 32).translate(0, fill / 2, 0);
    mesh(group, 'measured-water', geometry, water, 0, y, 0, { transparent: true, opacity: .76, depthWrite: false }).renderOrder = 1;
  }
  model.ticks.forEach((fraction, i) => {
    const side = flared ? profile(fraction) / 2 : .37;
    box(group, 'graduation-mark', i % 2 ? .14 : .22, .017, .014, rim, side - .08, y + fraction * height, flared ? depth / 2 + .015 : .44);
  });
  if (model.eye && model.fillHeight > 0) {
    const eyeShift = model.eye === 'level' ? 0 : model.eye === 'above' ? .25 : -.25;
    mesh(group, 'sight-marker', new THREE.SphereGeometry(.062, 12, 8), 0xe1a467, .96, y + model.fillHeight * height + eyeShift, .28);
  }
}

function drawCubeExchange(group, model) {
  const edge = .60;
  for (let i = 0; i < model.cubes; i++) {
    const x = (i - (model.cubes - 1) / 2) * .69 - .32;
    const geometry = new THREE.BoxGeometry(edge + .025, edge + .025, edge + .025);
    const cube = mesh(group, 'one-cubic-decimetre', geometry, 0xc0ded6, x, .59, 0, glass);
    cube.renderOrder = 2;
    edges(group, 'cube-edge', geometry, x, .59, 0);
    const waterHeight = edge * (i < model.filled ? 1 : i === model.filled ? model.partial : 0);
    if (waterHeight > 0) {
      const fill = box(group, waterHeight === edge ? 'one-litre-in-cube' : 'partial-litre-in-cube',
        edge, waterHeight, edge, water, x, .59 - (edge - waterHeight) / 2, 0,
        { transparent: true, opacity: .82, depthWrite: false });
      fill.renderOrder = 1;
    }
  }
  const radius = .44, shellRadius = radius + .025, sides = 32, jugX = 1.33;
  const crossSection = sides * radius ** 2 * Math.sin(2 * Math.PI / sides) / 2;
  const cap = 3 * edge ** 3 / crossSection;
  const jug = mesh(group, 'reserve-jug', new THREE.CylinderGeometry(shellRadius, shellRadius, cap, sides, 1, true), 0xb4d6c9, jugX, .29 + cap / 2, 0, glass);
  jug.renderOrder = 2;
  mesh(group, 'reserve-jug-rim', new THREE.TorusGeometry(shellRadius, .023, 8, sides), rim, jugX, .29 + cap, 0).rotation.x = Math.PI / 2;
  if (model.available) {
    const height = cap * model.available / 3;
    mesh(group, 'reserve-water', new THREE.CylinderGeometry(radius, radius, height, sides), water, jugX, .29 + height / 2, 0,
      { transparent: true, opacity: .76, depthWrite: false }).renderOrder = 1;
  }
}

export function drawMeasurementStation(parent, model) {
  const group = new THREE.Group();
  group.name = 'measurement-station-instrument';
  parent.add(group);
  if (model.mode === 'mass') {
    drawScale(group, model);
    return { instrument: model.mode, basket: model.basket, loaded: model.loaded, zeroed: model.zeroed, display: model.display };
  }
  if (model.mode === 'liquid') {
    drawVessel(group, model);
    return { instrument: model.mode, vessel: model.vessel, fillHeight: model.fillHeight, ticks: [...model.ticks], eye: model.eye };
  }
  drawCubeExchange(group, model);
  return { instrument: model.mode, cubes: model.cubes, filled: model.filled, partial: model.partial, available: model.available };
}
