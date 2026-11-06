// WebGPU firefly swarm (hulluttelu "parvi"): tens of thousands of fireflies simulated in a WGSL
// compute shader, drawn as glowing billboards on their own canvas over the WebGL scene.
//
// Why it does not settle into a line: every firefly has its own anchor in a churning shell around
// one of five sub-swarm leaders, circles its own tilted axis (some the other way round) and rides
// divergence-free curl noise with its own speed. The leaders wander apart and merge again. A fast
// swipe sends a gust that scatters the cloud; it gathers again slowly. Returns null without WebGPU.
import * as THREE from 'three';

const COMMON = /* wgsl */`
struct P { pos: vec4f, vel: vec4f };
struct U { viewProj: mat4x4f, right: vec4f, up: vec4f, attr: vec4f, pulse: vec4f, home: vec4f,
           gust: vec4f, gustDir: vec4f, tp: vec4f, ex: vec4f };
@group(0) @binding(0) var<uniform> u: U;`;

// Shared by the simulation and the GPU invariant test.
export const REPULSION_WGSL = /* wgsl */`
fn pointerRepulsion(position: vec3f, pointer: vec3f, power: f32) -> vec3f {
  let away = position - pointer;
  let distance = length(away);
  if (distance <= 0.0001 || distance >= 3.5) { return vec3f(0.0); }
  return away / distance * (clamp(power, 0.0, 1.0) * 10.0 * (1.0 - smoothstep(0.0, 3.5, distance)));
}`;

const SIM = COMMON + REPULSION_WGSL + /* wgsl */`
@group(0) @binding(1) var<storage, read_write> ps: array<P>;
fn h3(p: f32) -> vec3f { return fract(sin(vec3f(p * 127.1, p * 311.7, p * 74.7)) * 43758.5453); }
fn sph(h: vec2f) -> vec3f {
  let z = h.x * 2.0 - 1.0; let a = h.y * 6.2831853; let r = sqrt(max(0.0, 1.0 - z * z));
  return vec3f(r * cos(a), z, r * sin(a));
}
// Curl of the potential (sin(f y + g z + t1), sin(f z + g x + t2), sin(f x + g y + t3)), two octaves.
fn curlOct(p: vec3f, t: f32, f: f32, g: f32) -> vec3f {
  let cx = cos(p.y * f + p.z * g + t * 0.31);
  let cy = cos(p.z * f + p.x * g - t * 0.27);
  let cz = cos(p.x * f + p.y * g + t * 0.23);
  return vec3f(g * cz - f * cy, g * cx - f * cz, g * cy - f * cx);
}
fn curl(p: vec3f, t: f32) -> vec3f {
  let q = vec3f(p.z * 0.8 + p.x * 0.6, p.y, p.x * 0.8 - p.z * 0.6);
  return curlOct(p, t, 1.0, 0.55) + curlOct(q * 2.1, t * 1.7, 1.0, 0.7) * 0.45;
}
@compute @workgroup_size(256) fn sim(@builtin(global_invocation_id) id: vec3u) {
  let i = id.x;
  if (i >= u32(u.tp.w)) { return; }
  let t = u.tp.x; let dt = u.tp.y;
  let p = ps[i];
  var x = p.pos.xyz; var v = p.vel.xyz; let ph = p.pos.w;
  let h = h3(ph); let g = h3(ph + 0.371);
  let k = floor(g.x * 5.0);
  let hold = 1.0 - u.ex.x * 0.92;

  // Sub-swarm leader: wanders around the shared centre; the wander shrinks now and then, so the
  // five sub-swarms drift apart and merge again, independently of the pointer.
  let split = 0.25 + 0.75 * (0.5 + 0.5 * sin(t * 0.045 + k * 1.9));
  let wander = vec3f(sin(t * (0.13 + k * 0.031) + k * 2.1) * 5.0,
                     sin(t * (0.29 + k * 0.05) + k) * 1.1,
                     cos(t * (0.11 + k * 0.027) + k * 3.7) * 3.6);
  let lead = u.home.xyz + wander * split;

  // Own anchor on a slowly turning ellipsoid shell around the leader: a cloud, not a point.
  let turn = vec2f(h.x, fract(h.y + t * 0.012 * (g.y - 0.5)));
  let rad = mix(0.45, 4.2, h.z * h.z);
  let anchor = lead + sph(turn) * rad * vec3f(1.0, 0.8, 0.85);
  let toA = anchor - x; let dA = length(toA);
  let pull = 0.405 * hold;
  var a = toA * (1.5 / (1.0 + dA * 0.35)) * pull;

  // Swirl around the leader on a tilted axis of its own; about a third circle the other way.
  let axis = normalize(sph(g.yz) + vec3f(0.0, 0.5, 0.0));
  let rel = x - lead; let rl = length(rel) + 0.3;
  let swirl = select(1.0, -1.0, g.z < 0.3) * mix(0.35, 1.0, h.x);
  a += cross(axis, rel / rl) * swirl * 2.4 * pull / (1.0 + rl * 0.25);
  // Home anchors are unchanged by the pointer; the force is local and bounded.
  a += pointerRepulsion(x, u.attr.xyz, u.attr.w);
  a += curl(x * 0.33 + vec3f(ph * 3.0), t) * mix(0.7, 1.5, g.x);

  // Stone splash: a burst outward.
  let pd = x - u.pulse.xyz; let pl = length(pd) + 0.1;
  a += pd / pl * u.pulse.w * 30.0 * exp(-pl * 0.45);
  // Swipe gust: a push along the swipe plus each firefly's own sideways scatter.
  let gd = x - u.gust.xyz; let gr = u.gustDir.w;
  let gf = u.gust.w * exp(-dot(gd, gd) / (gr * gr));
  a += (u.gustDir.xyz * 24.0 + sph(vec2f(h.y, g.z)) * 16.0) * gf;

  a.y += max(0.0, 0.3 - x.y) * 10.0;
  let hd = (x - u.home.xyz) / vec3f(1.0, 0.5, 0.6);
  let hr = length(hd);
  a -= normalize(hd + vec3f(1e-4)) * max(0.0, hr - u.home.w) * 0.9;

  v = (v + a * dt) * (1.0 - mix(0.75, 1.35, h.y) * dt);
  let vmax = mix(3.0, 7.0, g.y) + u.ex.x * 8.0;
  let sp = length(v);
  if (sp > vmax) { v = v / sp * vmax; }
  x += v * dt;
  ps[i].pos = vec4f(x, ph);
  ps[i].vel = vec4f(v, p.vel.w);
}`;

const DRAW = COMMON + /* wgsl */`
@group(0) @binding(1) var<storage, read> ps: array<P>;
struct VO { @builtin(position) pos: vec4f, @location(0) uv: vec2f, @location(1) glow: f32, @location(2) tint: f32 };
@vertex fn vs(@builtin(vertex_index) vi: u32, @builtin(instance_index) ii: u32) -> VO {
  var corners = array<vec2f, 6>(vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(-1.0, 1.0), vec2f(-1.0, 1.0), vec2f(1.0, -1.0), vec2f(1.0, 1.0));
  let c = corners[vi]; let p = ps[ii]; let ph = p.pos.w;
  let blink = pow(max(0.0, sin(u.tp.x * (0.7 + fract(ph * 7.31) * 1.7) + ph * 6.2831)), 4.0);
  let s = u.tp.z * (0.35 + blink * 0.9);
  let wp = p.pos.xyz + (u.right.xyz * c.x + u.up.xyz * c.y) * s;
  var o: VO;
  o.pos = u.viewProj * vec4f(wp, 1.0);
  o.uv = c; o.glow = (0.06 + blink) * 1.5 / sqrt(u.tp.w / 1024.0); o.tint = fract(ph * 3.17);
  return o;
}
@fragment fn fs(i: VO) -> @location(0) vec4f {
  let d = length(i.uv);
  if (d > 1.0) { discard; }
  let a = pow(1.0 - d, 2.4) * i.glow;
  let col = mix(vec3f(1.0, 0.8, 0.36), vec3f(0.7, 1.0, 0.55), i.tint * 0.6);
  return vec4f(col * a, a * 0.35);
}`;

// Eigenvalues of a symmetric 2x2 or 3x3 matrix (Jacobi), smallest first.
function eig(m) {
  const n = m.length, a = m.map((r) => r.slice());
  for (let sweep = 0; sweep < 30; sweep++) {
    let off = 0;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += a[p][q] ** 2;
    if (off < 1e-12) break;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
      if (Math.abs(a[p][q]) < 1e-15) continue;
      const th = (a[q][q] - a[p][p]) / (2 * a[p][q]);
      const tt = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1));
      const c = 1 / Math.sqrt(tt * tt + 1), s = tt * c;
      for (let k = 0; k < n; k++) { const akp = a[k][p], akq = a[k][q]; a[k][p] = c * akp - s * akq; a[k][q] = s * akp + c * akq; }
      for (let k = 0; k < n; k++) { const apk = a[p][k], aqk = a[q][k]; a[p][k] = c * apk - s * aqk; a[q][k] = s * apk + c * aqk; }
    }
  }
  return a.map((r, i) => r[i]).sort((x, y) => x - y);
}
function cov(pts, dim) {
  const n = pts.length / dim, mean = new Array(dim).fill(0), c = Array.from({ length: dim }, () => new Array(dim).fill(0));
  for (let i = 0; i < n; i++) for (let d = 0; d < dim; d++) mean[d] += pts[i * dim + d] / n;
  for (let i = 0; i < n; i++) for (let p = 0; p < dim; p++) for (let q = 0; q < dim; q++) c[p][q] += (pts[i * dim + p] - mean[p]) * (pts[i * dim + q] - mean[q]) / n;
  return c;
}

export async function makeSwarm(count, home) {
  if (!navigator.gpu) return null;
  const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
  if (!adapter) return null;
  const device = await adapter.requestDevice();
  try {
  const canvas = document.createElement('canvas');
  canvas.className = 'saaristo-gpu';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('webgpu');
  if (!ctx) { device.destroy(); return null; }
  const format = navigator.gpu.getPreferredCanvasFormat();
  ctx.configure({ device, format, alphaMode: 'premultiplied' });

  const data = new Float32Array(count * 8);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 10;
    data.set([home.x + Math.cos(a) * r, 0.5 + Math.random() * 4, home.z + Math.sin(a) * r * 0.6, Math.random(), 0, 0, 0, 0], i * 8);
  }
  const particles = device.createBuffer({ size: data.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC });
  device.queue.writeBuffer(particles, 0, data);
  const U = new Float32Array(56);
  const ubuf = device.createBuffer({ size: U.byteLength, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
  const sim = device.createComputePipeline({ layout: 'auto', compute: { module: device.createShaderModule({ code: SIM }), entryPoint: 'sim' } });
  const add = { srcFactor: 'one', dstFactor: 'one', operation: 'add' };
  const drawMod = device.createShaderModule({ code: DRAW });
  const draw = device.createRenderPipeline({
    layout: 'auto',
    vertex: { module: drawMod, entryPoint: 'vs' },
    fragment: { module: drawMod, entryPoint: 'fs', targets: [{ format, blend: { color: add, alpha: add } }] },
    primitive: { topology: 'triangle-list' },
  });
  const bind = (pipe) => device.createBindGroup({ layout: pipe.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: ubuf } }, { binding: 1, resource: { buffer: particles } }] });
  const simBind = bind(sim), drawBind = bind(draw);
  const clipFix = new THREE.Matrix4().set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
  const vp = new THREE.Matrix4(), e = new THREE.Vector3(), proj = new THREE.Matrix4();
  let lost = false;
  device.lost.then(() => { lost = true; canvas.remove(); });
  const NO_GUST = { pos: [0, -50, 0, 0], dir: [0, 0, 0, 1], scatter: 0 };

  return {
    canvas, count,
    dispose() { if (lost) return; lost = true; ctx.unconfigure(); particles.destroy(); ubuf.destroy(); device.destroy(); canvas.remove(); },
    get lost() { return lost; },
    resize(w, h) { canvas.width = w; canvas.height = h; },
    /** attr: [x,y,z,repulsion 0..1]; pulse: [x,y,z,power]; gust: {pos:[x,y,z,power], dir:[dx,dy,dz,radius], scatter 0..1}. */
    frame(camera, time, dt, attr, pulse, gust = NO_GUST) {
      if (lost) return;
      proj.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      vp.multiplyMatrices(clipFix, proj);
      U.set(vp.elements, 0);
      e.setFromMatrixColumn(camera.matrixWorld, 0); U.set([e.x, e.y, e.z, 0], 16);
      e.setFromMatrixColumn(camera.matrixWorld, 1); U.set([e.x, e.y, e.z, 0], 20);
      U.set(attr, 24); U.set(pulse, 28); U.set([home.x, home.y, home.z, 12], 32);
      U.set(gust.pos, 36); U.set(gust.dir, 40);
      U.set([time, Math.min(dt, 1 / 30), 0.075, count], 44);
      U.set([gust.scatter, 0, 0, 0], 48);
      device.queue.writeBuffer(ubuf, 0, U);
      const enc = device.createCommandEncoder();
      const cp = enc.beginComputePass(); cp.setPipeline(sim); cp.setBindGroup(0, simBind); cp.dispatchWorkgroups(Math.ceil(count / 256)); cp.end();
      const rp = enc.beginRenderPass({ colorAttachments: [{ view: ctx.getCurrentTexture().createView(), clearValue: { r: 0, g: 0, b: 0, a: 0 }, loadOp: 'clear', storeOp: 'store' }] });
      rp.setPipeline(draw); rp.setBindGroup(0, drawBind); rp.draw(6, count); rp.end();
      device.queue.submit([enc.finish()]);
    },
    clear() {
      if (lost) return;
      const enc = device.createCommandEncoder();
      enc.beginRenderPass({ colorAttachments: [{ view: ctx.getCurrentTexture().createView(), clearValue: { r: 0, g: 0, b: 0, a: 0 }, loadOp: 'clear', storeOp: 'store' }] }).end();
      device.queue.submit([enc.finish()]);
    },
    /** Shape check for tests: reads n fireflies back and returns how far the cloud is from a line.
     *  ratio = smallest/largest principal spread (on screen and in 3D); a line gives ~0. */
    async shape(n = 65536) {
      if (lost) return null;
      n = Math.min(n, count);
      const read = device.createBuffer({ size: n * 32, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
      const enc = device.createCommandEncoder();
      enc.copyBufferToBuffer(particles, 0, read, 0, n * 32);
      device.queue.submit([enc.finish()]);
      await read.mapAsync(GPUMapMode.READ);
      const f = new Float32Array(read.getMappedRange().slice(0));
      read.unmap(); read.destroy();
      const p3 = new Float64Array(n * 3), p2 = [], v = new THREE.Vector4(), aspect = canvas.width / Math.max(1, canvas.height);
      for (let i = 0; i < n; i++) {
        p3.set([f[i * 8], f[i * 8 + 1], f[i * 8 + 2]], i * 3);
        v.set(f[i * 8], f[i * 8 + 1], f[i * 8 + 2], 1).applyMatrix4(proj);
        if (v.w > 0.1) p2.push((v.x / v.w) * aspect, v.y / v.w);
      }
      const e3 = eig(cov(p3, 3)), e2 = eig(cov(p2, 2));
      const r = (e) => Math.sqrt(Math.max(0, e[0]) / Math.max(1e-9, e[e.length - 1]));
      // Bright core: the densest on-screen cells (where the additive glow piles up). A streak gives a
      // core ratio near 0; a cloud gives 0.4 or more. share = fireflies in the densest 2 % of cells.
      const m = p2.length / 2, GX = 120, GY = 75, grid = new Float32Array(GX * GY);
      for (let i = 0; i < m; i++) {
        const gx = Math.floor((p2[i * 2] / aspect * 0.5 + 0.5) * GX), gy = Math.floor((p2[i * 2 + 1] * 0.5 + 0.5) * GY);
        if (gx >= 0 && gy >= 0 && gx < GX && gy < GY) grid[gy * GX + gx]++;
      }
      const order = [...grid.keys()].sort((x, y) => grid[y] - grid[x]), top = order.slice(0, Math.round(GX * GY * 0.02));
      const core = []; let inTop = 0;
      for (const c of top) { inTop += grid[c]; for (let w = 0; w < grid[c]; w += 8) core.push((c % GX) / GX * aspect, Math.floor(c / GX) / GY); }
      return { ratio2d: r(e2), ratio3d: r(e3), core: r(eig(cov(core, 2))), share: inTop / Math.max(1, m), spread3d: e3.map((x) => Math.sqrt(Math.max(0, x))), onScreen: m };
    },
  };
  } catch (error) { device.destroy(); throw error; }
}
