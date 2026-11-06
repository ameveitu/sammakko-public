import * as THREE from 'three';

// Thin painted surface details sit on a volume and need no outline of their own.
const DETAIL = /eye|iris|pupil|glint|cheek|blush|lid|tongue|belly|closed|mouth|brow|nostril|spot|patch|toe|claw|\bink\b/i;
export const OUTLINE_SUFFIX = ' outline';
// The drawn bill is outlined in rust, not navy.
const ACCENT = /bill/i;

function toonRamp() {
  // Three flat tones, like a crayon fill with one soft shadow band.
  const data = new Uint8Array([168, 168, 168, 255, 222, 222, 222, 255, 255, 255, 255, 255]);
  const ramp = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  ramp.minFilter = ramp.magFilter = THREE.NearestFilter; ramp.generateMipmaps = false; ramp.needsUpdate = true;
  return ramp;
}

function outlineMaterial(width, color) {
  const material = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide });
  material.name = 'Navy crayon outline';
  material.onBeforeCompile = shader => {
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\ntransformed += normalize(normal) * ${width.toFixed(4)};`);
  };
  material.customProgramCacheKey = () => `character-outline-${width.toFixed(4)}`;
  return material;
}

/**
 * Gives a loaded glTF character the look of its 2D drawing: flat toon fills and a navy inverted-hull outline.
 * Call once, right after loading and before the model is scaled. Mesh names, bones and clips stay unchanged.
 * The outline width defaults to the model's own `sammakko_outline` scene extra (the drawing's ink width), else .022.
 */
export function styleCharacter(model, { outline, color = 0x123b55, accent = 0xaf4407, lift = .16 } = {}) {
  if (!model || model.userData.characterStyled) return model;
  model.userData.characterStyled = true;
  const width = outline ?? (Number(model.userData.sammakko_outline) > 0 ? Number(model.userData.sammakko_outline) : .022);
  const ramp = toonRamp(), converted = new Map(), meshes = [];
  const hullMaterial = width > 0 ? outlineMaterial(width, color) : null, accentMaterial = width > 0 ? outlineMaterial(width, accent) : null;
  model.traverse(object => { if (object.isMesh) meshes.push(object); });
  for (const mesh of meshes) {
    const toToon = source => {
      if (!source || source.isMeshToonMaterial) return source;
      if (!converted.has(source)) {
        const toon = new THREE.MeshToonMaterial({ name: source.name, color: source.color?.clone() ?? new THREE.Color(1, 1, 1), map: source.map ?? null, gradientMap: ramp,
          transparent: source.transparent, opacity: source.opacity, side: source.side, alphaTest: source.alphaTest });
        // A little self-light keeps the fill colours close to the drawing in dim or warm scenes.
        toon.emissive.copy(toon.color).multiplyScalar(lift);
        converted.set(source, toon); source.dispose();
      }
      return converted.get(source);
    };
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(toToon) : toToon(mesh.material);
    if (!hullMaterial || DETAIL.test(mesh.name)) continue;
    const material = ACCENT.test(mesh.name) ? accentMaterial : hullMaterial;
    const hull = mesh.isSkinnedMesh ? new THREE.SkinnedMesh(mesh.geometry, material) : new THREE.Mesh(mesh.geometry, material);
    if (mesh.isSkinnedMesh) hull.bind(mesh.skeleton, mesh.bindMatrix);
    hull.name = mesh.name + OUTLINE_SUFFIX; hull.userData.outline = true;
    hull.castShadow = false; hull.receiveShadow = false; hull.frustumCulled = mesh.frustumCulled;
    mesh.add(hull);
  }
  return model;
}
