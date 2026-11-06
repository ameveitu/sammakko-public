// Island mesh (sculpted in Blender, see blender/island.py), sky dome and a CPU height grid.
import * as THREE from 'three';
import { ISLAND } from './island-mesh.js';

export const ISLAND_POS = new THREE.Vector3(7, 0, -6);
const bytes = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export function makeIsland() {
  const p = new Int16Array(bytes(ISLAND.pos).buffer), n = new Int8Array(bytes(ISLAND.nor).buffer);
  const c = bytes(ISLAND.col), idx = new Uint16Array(bytes(ISLAND.idx).buffer);
  const count = ISLAND.count, pos = new Float32Array(count * 3), nor = new Float32Array(count * 3);
  const k = ISLAND.scale / 32767;
  for (let i = 0; i < count; i++) { // Blender Z-up -> three Y-up
    pos[i * 3] = p[i * 3] * k; pos[i * 3 + 1] = p[i * 3 + 2] * k; pos[i * 3 + 2] = -p[i * 3 + 1] * k;
    nor[i * 3] = n[i * 3] / 127; nor[i * 3 + 1] = n[i * 3 + 2] / 127; nor[i * 3 + 2] = -n[i * 3 + 1] / 127;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(c, 3, true));
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0 }));
  mesh.position.copy(ISLAND_POS);
  return { mesh, pos, nor, idx, heightAt: heightGrid(pos, idx) };
}

// Random surface samples (area-weighted) in world space: used for grass and the height grid.
export function sampleSurface(pos, nor, idx, n, rand = Math.random) {
  const tris = idx.length / 3, area = new Float32Array(tris);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  let total = 0;
  for (let t = 0; t < tris; t++) {
    a.fromArray(pos, idx[t * 3] * 3); b.fromArray(pos, idx[t * 3 + 1] * 3); c.fromArray(pos, idx[t * 3 + 2] * 3);
    total += b.sub(a).cross(c.sub(a)).length() * 0.5; area[t] = total;
  }
  const out = [];
  for (let s = 0; s < n; s++) {
    const r = rand() * total; let lo = 0, hi = tris - 1;
    while (lo < hi) { const m = (lo + hi) >> 1; if (area[m] < r) lo = m + 1; else hi = m; }
    let u = rand(), v = rand(); if (u + v > 1) { u = 1 - u; v = 1 - v; }
    const w = 1 - u - v, i0 = idx[lo * 3] * 3, i1 = idx[lo * 3 + 1] * 3, i2 = idx[lo * 3 + 2] * 3;
    const px = pos[i0] * w + pos[i1] * u + pos[i2] * v, py = pos[i0 + 1] * w + pos[i1 + 1] * u + pos[i2 + 1] * v;
    const pz = pos[i0 + 2] * w + pos[i1 + 2] * u + pos[i2 + 2] * v, ny = nor[i0 + 1] * w + nor[i1 + 1] * u + nor[i2 + 1] * v;
    out.push(px + ISLAND_POS.x, py + ISLAND_POS.y, pz + ISLAND_POS.z, ny);
  }
  return out;
}

// Height grid over the island's bounding box (max surface height per cell, -1 = open water).
// Also baked into a blurred "land" texture: the water shader reads it for shallows and shore foam.
function heightGrid(pos, idx) {
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
  for (let i = 0; i < pos.length; i += 3) { x0 = Math.min(x0, pos[i]); x1 = Math.max(x1, pos[i]); z0 = Math.min(z0, pos[i + 2]); z1 = Math.max(z1, pos[i + 2]); }
  const pad = 3; x0 += ISLAND_POS.x - pad; x1 += ISLAND_POS.x + pad; z0 += ISLAND_POS.z - pad; z1 += ISLAND_POS.z + pad;
  const NX = 256, NZ = Math.max(32, Math.round(NX * (z1 - z0) / (x1 - x0))), grid = new Float32Array(NX * NZ).fill(-1);
  const cell = (x, z) => { const gx = Math.floor((x - x0) / (x1 - x0) * NX), gz = Math.floor((z - z0) / (z1 - z0) * NZ); return gx >= 0 && gz >= 0 && gx < NX && gz < NZ ? gz * NX + gx : -1; };
  const s = sampleSurface(pos, new Float32Array(pos.length).fill(1), idx, 160000);
  for (let i = 0; i < s.length; i += 4) { const c = cell(s[i], s[i + 2]); if (c >= 0) grid[c] = Math.max(grid[c], s[i + 1]); }
  // Land field: 0 deep water .. 1 at the waterline and above, blurred for a soft shelf.
  let land = new Float32Array(NX * NZ);
  for (let i = 0; i < land.length; i++) land[i] = grid[i] === -1 ? 0 : Math.min(1, Math.max(0, (grid[i] + 0.9) / 0.9));
  for (let pass = 0; pass < 4; pass++) {
    const out = new Float32Array(land.length);
    for (let z = 0; z < NZ; z++) for (let x = 0; x < NX; x++) {
      let sum = 0, cnt = 0;
      for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) { const xx = x + dx, zz = z + dz; if (xx >= 0 && zz >= 0 && xx < NX && zz < NZ) { sum += land[zz * NX + xx]; cnt++; } }
      out[z * NX + x] = sum / cnt;
    }
    land = out;
  }
  const tex = new THREE.DataTexture(Uint8Array.from(land, (v) => Math.round(v * 255)), NX, NZ, THREE.RedFormat);
  tex.minFilter = tex.magFilter = THREE.LinearFilter; tex.needsUpdate = true;
  const heightAt = (x, z) => { const c = cell(x, z); return c >= 0 ? grid[c] : -1; };
  heightAt.landTex = tex; heightAt.bounds = new THREE.Vector4(x0, z0, x1 - x0, z1 - z0);
  return heightAt;
}

// Equirect painted sky: horizon sits 40 % up from the bottom of the image.
export const SKY_GLSL = /* glsl */`
uniform sampler2D uSky;uniform vec3 uSkyTint;
vec3 skyColor(vec3 d){
  float u=atan(d.x,-d.z)/6.2831853+.5;
  float el=asin(clamp(d.y,-1.,1.));
  float v=el>0. ? .4+.6*el/1.5707963 : .4+.4*el/1.5707963;
  return texture2D(uSky,vec2(u,clamp(v,.005,.995))).rgb*uSkyTint;
}`;

export function makeSky(tex) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uSky: { value: tex }, uSkyTint: { value: new THREE.Vector3(1,1,1) } }, side: THREE.BackSide, depthWrite: false,
    vertexShader: 'varying vec3 vDir;void main(){vDir=normalize(position);vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=p.xyww;}',
    fragmentShader: SKY_GLSL + 'varying vec3 vDir;void main(){gl_FragColor=vec4(skyColor(normalize(vDir)),1.);\n#include <colorspace_fragment>\n}',
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(400, 48, 24), mat);
  sky.renderOrder = -1; sky.frustumCulled = false;
  return sky;
}
