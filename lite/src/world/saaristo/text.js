// Firefly headline: the hero text is a swarm of the same glowing fireflies that drift over the pond.
// Bound fireflies hover around their letter spot; a touch frees nearby ones, they wander off on a
// smooth noise field for a long while and then drift home slowly. A few leave on their own.
import * as THREE from 'three';

export function makeParticleText(lines, colors) {
  const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(0, 1, 0, -1, -1, 1);
  const MAX = 6000;
  const pos = new Float32Array(MAX * 3), col = new Float32Array(MAX * 3), seed = new Float32Array(MAX);
  const tgt = new Float32Array(MAX * 2), vel = new Float32Array(MAX * 2), free = new Float32Array(MAX), home = new Float32Array(MAX);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const uniforms = { uSize: { value: 6 }, uOpacity: { value: 1 }, uTime: { value: 0 } };
  const pts = new THREE.Points(geo, new THREE.ShaderMaterial({
    uniforms, transparent: true, depthTest: false, depthWrite: false, vertexColors: true,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    vertexShader: /* glsl */`
      attribute float aSeed;uniform float uSize,uTime;varying vec3 vC;varying float vGlow;
      void main(){
        float s=aSeed*6.2831;
        vGlow=.55+.45*pow(max(0.,sin(uTime*(.7+aSeed*1.3)+s*3.)),2.);
        vC=color;
        gl_PointSize=uSize*(.75+.5*vGlow);
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position.xy,0.,1.);
      }`,
    fragmentShader: /* glsl */`
      uniform float uOpacity;varying vec3 vC;varying float vGlow;
      void main(){
        float d=length(gl_PointCoord-.5)*2.;
        float core=smoothstep(.45,0.,d),halo=pow(max(0.,1.-d),2.2);
        float a=(core*.85+halo*.5*vGlow)*uOpacity;
        gl_FragColor=vec4(vC*(core*1.2+halo*vGlow)*uOpacity,a*.55);
      }`,
  }));
  pts.frustumCulled = false;
  scene.add(pts);
  let n = 0, w = 1, h = 1, t = 0, spontaneous = 0;
  const pointer = { x: -1e4, y: -1e4, power: 0 };

  function layout(rect, dpr, scatter) {
    w = innerWidth; h = innerHeight;
    cam.right = w; cam.bottom = -h; cam.updateProjectionMatrix();
    const fs = Math.round(Math.min(rect.width / 8.2, 96)), lh = fs * 1.1;
    const c = document.createElement('canvas'), W = Math.ceil(rect.width), H = Math.ceil(lh * lines.length + fs * 0.4);
    c.width = W; c.height = H;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.font = `750 ${fs}px ui-rounded,"Trebuchet MS","Segoe UI",system-ui,sans-serif`;
    g.textBaseline = 'top'; g.fillStyle = '#fff';
    lines.forEach((l, i) => g.fillText(l, 0, i * lh));
    const data = g.getImageData(0, 0, W, H).data;
    let step = Math.max(3, Math.round(fs / 17));
    const pick = () => {
      const out = [];
      for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
        const jx = Math.min(W - 1, Math.max(0, Math.round(x + (Math.random() - 0.5) * step))), jy = Math.min(H - 1, Math.max(0, Math.round(y + (Math.random() - 0.5) * step)));
        if (data[(jy * W + jx) * 4 + 3] > 150) out.push(jx, jy);
      }
      return out;
    };
    let hits = pick();
    while (hits.length / 2 > MAX) { step++; hits = pick(); }
    n = hits.length / 2;
    for (let i = 0; i < n; i++) {
      const x = rect.left + hits[i * 2], y = rect.top + hits[i * 2 + 1];
      tgt[i * 2] = x; tgt[i * 2 + 1] = y;
      seed[i] = Math.random();
      if (scatter) { pos[i * 3] = Math.random() * w; pos[i * 3 + 1] = -(h * 0.3 + Math.random() * h * 0.7); free[i] = 0.3 + Math.random() * 3.2; home[i] = 0; }
      else { pos[i * 3] = x; pos[i * 3 + 1] = -(y - scrollY); free[i] = 0; home[i] = 1; }
      vel[i * 2] = vel[i * 2 + 1] = 0;
      col.set(colors[Math.min(lines.length - 1, Math.floor(hits[i * 2 + 1] / lh))], i * 3);
    }
    geo.setDrawRange(0, n);
    uniforms.uSize.value = step * 2.3 * dpr;
    for (const a of ['position', 'color', 'aSeed']) geo.attributes[a].needsUpdate = true;
  }

  function update(dt, scrollY) {
    t += dt;
    const k = Math.min(2, dt * 60), R = 120, R2 = R * R;
    // Now and then a few fireflies wander off by themselves.
    spontaneous += dt * n * 0.004;
    while (spontaneous > 1) { spontaneous--; const i = (Math.random() * n) | 0; if (free[i] <= 0) { free[i] = 3 + Math.random() * 6; home[i] = 0; } }
    for (let i = 0; i < n; i++) {
      const ix = i * 3, iv = i * 2, s = seed[i] * 6.2831;
      const x = pos[ix], y = pos[ix + 1];
      let vx = vel[iv], vy = vel[iv + 1];
      if (pointer.power > 0.05) {
        const dx = x - pointer.x, dy = y + pointer.y, d2 = dx * dx + dy * dy;
        if (d2 < R2) {
          const d = Math.sqrt(d2) + 0.01, f = (1 - d / R) * 0.9 * pointer.power;
          vx += (dx / d) * f; vy += (dy / d) * f + 0.15 * pointer.power;
          if (free[i] <= 0) home[i] = 0;
          free[i] = Math.max(free[i], 6 + seed[i] * 16);
        }
      }
      if (free[i] > 0) {
        free[i] -= dt;
        // Smooth wander: a slowly turning flow field plus a gentle rise.
        vx += (Math.sin(y * 0.011 + t * 0.45 + s) + 0.6 * Math.sin(t * 0.9 + s * 2)) * 0.035 * k;
        vy += (Math.cos(x * 0.009 - t * 0.38 + s * 1.7) * 0.035 + 0.004) * k;
        vx *= 0.975; vy *= 0.975;
        const sp = Math.hypot(vx, vy); if (sp > 1.4) { vx *= 1.4 / sp; vy *= 1.4 / sp; }
      } else {
        home[i] = Math.min(1, home[i] + dt * 0.35);
        const hk = 0.0015 + 0.03 * home[i] * home[i];
        const tx = tgt[iv] + Math.sin(t * 1.1 + s) * 1.4, ty = -(tgt[iv + 1] - scrollY) + Math.cos(t * 0.9 + s * 1.3) * 1.4;
        vx += (tx - x) * hk * k; vy += (ty - y) * hk * k;
        const damp = 0.9 - 0.04 * (1 - home[i]);
        vx *= damp; vy *= damp;
      }
      pos[ix] = x + vx * k; pos[ix + 1] = y + vy * k;
      vel[iv] = vx; vel[iv + 1] = vy;
    }
    geo.attributes.position.needsUpdate = true;
  }
  return { scene, cam, layout, update, pointer, uniforms, get count() { return n; } };
}
