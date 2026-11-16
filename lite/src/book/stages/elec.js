import * as THREE from 'three';

/*
 * ENV-PHY-ELECSAFE-01 theory-book stage: a broken cord on a wet jetty, on its own canvas.
 * Views:
 *  - danger:  the cord's cover is torn, copper shows and sparks fly in a puddle. Loikka stops outside the red circle.
 *  - tell:    Aava calls the friends away from the cord and flies to the lab to tell Sulka.
 *  - safe:    Sulka turns the main switch to 0 and the sparks stop. An electrician mends the cord and the light comes back.
 *  - try:     the danger scene while the learner chooses what to do first.
 *  - resolve: after the answer, tell and safe play in a row.
 * Nobody touches the cord and nobody gets a shock.
 */

const TAU = Math.PI * 2;
const JET_Y = .45, ISLAND_Y = .42;
const GAP = new THREE.Vector3(.65, JET_Y + .06, -.35);
const PUDDLE = new THREE.Vector3(1.0, JET_Y + .012, 0);
const RING = new THREE.Vector3(.8, JET_Y + .016, -.1);
const LAMP = new THREE.Vector3(4.25, JET_Y, -1.05);
const HUT = new THREE.Vector3(-8.4, ISLAND_Y, -1.3);
const SWITCH = new THREE.Vector3(-7.3, ISLAND_Y + 1.2, -.14);

const P = (x, y, z) => new THREE.Vector3(x, y, z);
const AAVA_HOVER = P(-2.0, JET_Y + 1.2, .25);
const AAVA_AT_SULKA = P(-5.6, ISLAND_Y + 1.25, .8);
const AAVA_END = P(-2.2, JET_Y + 1.0, .55);
const LOIKKA_STOP = P(-.95, JET_Y, .3);
const LOIKKA_BACK = P(-2.65, JET_Y, .6);
const SISI_NEAR = P(-3.1, JET_Y, -.1);
const SISI_BACK = P(-3.95, JET_Y, .1);
const SULKA_HOME = P(-6.5, ISLAND_Y, .55);
const SULKA_SWITCH = P(-6.72, ISLAND_Y, .28);
const OTTER_START = P(-4.8, JET_Y, .75);
const OTTER_WORK = P(-.05, JET_Y, .5);
const OTTER_DONE = P(-1.0, JET_Y, .8);

/** Seconds: tell ends, safe ends; in `resolve` safe starts after tell. */
const TELL_END = 6.8, SAFE_END = 7.6, RESOLVE_SAFE = 7.4;

/** Width / height of the electrician sprite. */
const OTTER_ASPECT = 340 / 560;

const clamp01 = v => Math.min(1, Math.max(0, v));
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const seg = (t, a, b) => ease(clamp01((t - a) / (b - a)));

function canvasTexture(width, height, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  draw(canvas.getContext('2d'), width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function seeded(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const BASIC_VERTEX = /* glsl */`
varying vec2 vUv; varying vec3 vP;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vP = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

/** Lake: calm waves and glints that fade into the hazy horizon. */
const WATER_FRAGMENT = /* glsl */`
uniform float time;
varying vec2 vUv; varying vec3 vP;
void main() {
  vec3 deep = vec3(.16, .42, .58), shallow = vec3(.34, .66, .68), haze = vec3(.86, .87, .84);
  float shore = smoothstep(9.5, 4.2, length(vP.xz - vec2(-9.2, 0.0)));
  vec3 c = mix(deep, shallow, shore * .75);
  float w = sin(vP.x * 1.3 + time * .9 + sin(vP.z * .7)) * sin(vP.z * 1.9 - time * .7);
  c += w * .035;
  float glint = smoothstep(.9, 1.0, sin(vP.x * 3.1 + vP.z * 1.2 + time * 1.6) * sin(vP.z * 2.7 - vP.x * .8 - time * 1.1));
  c += glint * .2;
  float fog = smoothstep(16.0, 52.0, length(vP.xz - vec2(-2.0, 0.0)));
  gl_FragColor = vec4(mix(c, haze, fog), 1.0);
  #include <colorspace_fragment>
}`;

/** The puddle: rings move outwards; while the power is on it flickers yellow near the torn cord. */
const PUDDLE_FRAGMENT = /* glsl */`
uniform float time; uniform float charge; uniform vec2 gap;
varying vec2 vUv; varying vec3 vP;
void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r = length(p);
  float edge = smoothstep(1.0, .8, r);
  float ring = sin(r * 16.0 - time * 2.2) * .5 + .5;
  vec3 c = mix(vec3(.33, .58, .8), vec3(.66, .86, .97), ring * .32 + (1.0 - r) * .3);
  float near = smoothstep(1.1, 0.0, length(p - gap));
  float flicker = charge * near * (.55 + .45 * sin(time * 27.0 + r * 11.0));
  c = mix(c, vec3(1.0, .9, .45), flicker * .55);
  gl_FragColor = vec4(c, edge * .82);
  #include <colorspace_fragment>
}`;

/** Bright dashes run along the cord while the power is on. */
const CURRENT_FRAGMENT = /* glsl */`
uniform float time; uniform float on; uniform vec2 gap;
varying vec2 vUv; varying vec3 vP;
void main() {
  if (vUv.x > gap.x && vUv.x < gap.y) discard;
  float s = fract(vUv.x * 11.0 - time * .9);
  float bead = exp(-pow((s - .5) * 14.0, 2.0));
  gl_FragColor = vec4(vec3(1.0, .86, .42) * bead * on * .55, 1.0);
  #include <colorspace_fragment>
}`;

/** The red circle around the danger pulses gently; it turns calm green when the power is off. */
const RING_FRAGMENT = /* glsl */`
uniform float time; uniform float danger; uniform float show;
varying vec2 vUv; varying vec3 vP;
void main() {
  float r = length(vUv * 2.0 - 1.0);
  float band = smoothstep(.86, .9, r) * smoothstep(1.0, .96, r);
  float fill = smoothstep(.98, .9, r) * .16;
  float pulse = .75 + .25 * sin(time * 3.2);
  vec3 c = mix(vec3(.35, .8, .5), vec3(.95, .2, .14), danger);
  float a = (band * pulse + fill * danger) * show;
  gl_FragColor = vec4(c, a);
  #include <colorspace_fragment>
}`;

function skyTexture() {
  return canvasTexture(16, 512, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#4f86b8'); grad.addColorStop(.45, '#9cc4de'); grad.addColorStop(.8, '#e9dcc0'); grad.addColorStop(1, '#f1d9b2');
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
  });
}

function glowTexture(stops) {
  return canvasTexture(128, 128, (g, w) => {
    const grad = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    for (const [at, color] of stops) grad.addColorStop(at, color);
    g.fillStyle = grad; g.fillRect(0, 0, w, w);
  });
}

function starTexture() {
  return canvasTexture(64, 64, (g, w) => {
    const c = w / 2;
    const grad = g.createRadialGradient(c, c, 0, c, c, c);
    grad.addColorStop(0, 'rgba(255,255,255,1)'); grad.addColorStop(.25, 'rgba(255,255,255,.8)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad; g.fillRect(0, 0, w, w);
    g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 3; g.lineCap = 'round';
    g.beginPath(); g.moveTo(c, 4); g.lineTo(c, w - 4); g.moveTo(4, c); g.lineTo(w - 4, c); g.stroke();
  });
}

/** The yellow warning triangle with a lightning bolt. */
function warningTexture() {
  return canvasTexture(256, 232, (g) => {
    const tri = () => { g.beginPath(); g.moveTo(128, 16); g.lineTo(242, 214); g.lineTo(14, 214); g.closePath(); };
    g.lineJoin = 'round';
    tri(); g.fillStyle = '#ffd23f'; g.fill();
    g.lineWidth = 16; g.strokeStyle = '#1e1e1e'; g.stroke();
    g.fillStyle = '#1e1e1e';
    g.beginPath(); g.moveTo(140, 70); g.lineTo(98, 146); g.lineTo(126, 146); g.lineTo(112, 196); g.lineTo(160, 118); g.lineTo(132, 118); g.lineTo(148, 70); g.closePath(); g.fill();
  });
}

/** The main switch's face: the lightning sticker and the 1 and 0 positions. */
function switchFace() {
  return canvasTexture(128, 160, (g, w, h) => {
    g.fillStyle = '#e4e8ea'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#9aa4aa'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);
    g.font = 'bold 30px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#2b6d3a'; g.fillText('1', 98, 34);
    g.fillStyle = '#9b2a1c'; g.fillText('0', 98, 128);
    g.fillStyle = '#ffd23f'; g.beginPath(); g.moveTo(42, 50); g.lineTo(72, 102); g.lineTo(12, 102); g.closePath(); g.fill();
    g.strokeStyle = '#1e1e1e'; g.lineWidth = 4; g.stroke();
    g.fillStyle = '#1e1e1e'; g.beginPath(); g.moveTo(46, 64); g.lineTo(36, 84); g.lineTo(43, 84); g.lineTo(39, 96); g.lineTo(50, 78); g.lineTo(43, 78); g.lineTo(48, 64); g.closePath(); g.fill();
  });
}

function signTexture(text) {
  return canvasTexture(256, 72, (g, w, h) => {
    g.fillStyle = '#f7f1e3'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#3c4a52'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);
    g.fillStyle = '#23465a'; g.font = 'bold 40px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, w / 2, h / 2 + 2);
  });
}

export function mountElecStage(host, options) {
  const reduced = !!options.reducedMotion;
  const disposables = [];
  const keep = thing => { disposables.push(thing); return thing; };
  const texture = path => {
    const t = keep(new THREE.TextureLoader().load(options.assets(path)));
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const canvas = renderer.domElement;
  canvas.className = 'elec-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  host.classList.add('elec-stage');
  host.append(canvas);

  const scene = new THREE.Scene();
  scene.background = keep(skyTexture());
  const camera = new THREE.PerspectiveCamera(40, 1, .1, 300);
  camera.position.set(-1, 4, 9);
  const look = new THREE.Vector3(-1, .8, 0);

  scene.add(new THREE.HemisphereLight(0xd8ecff, 0x6b5a40, 1.5));
  const sunLight = new THREE.DirectionalLight(0xffe6bf, 2.2);
  sunLight.position.set(-6, 10, 7);
  scene.add(sunLight);

  const standard = (color, extra = {}) => keep(new THREE.MeshStandardMaterial({ color, roughness: .82, metalness: 0, ...extra }));
  const basic = (shader, uniforms, extra = {}) => keep(new THREE.ShaderMaterial({ uniforms, vertexShader: BASIC_VERTEX, fragmentShader: shader, ...extra }));
  const geo = g => keep(g);

  // Lake.
  const waterMaterial = basic(WATER_FRAGMENT, { time: { value: 0 } });
  const water = new THREE.Mesh(geo(new THREE.PlaneGeometry(220, 220)), waterMaterial);
  water.rotation.x = -Math.PI / 2;
  scene.add(water);

  // The island with Sulka's lab, a few pines and rocks.
  {
    const grass = texture('art/textures/grass.webp');
    grass.wrapS = grass.wrapT = THREE.RepeatWrapping; grass.repeat.set(3, 3);
    const sand = texture('art/textures/sand.webp');
    sand.wrapS = sand.wrapT = THREE.RepeatWrapping; sand.repeat.set(6, 1);
    const beach = new THREE.Mesh(geo(new THREE.CylinderGeometry(5.3, 5.9, .5, 56)), standard(0xe2cc98, { map: sand }));
    beach.position.set(-9.2, .02, 0);
    const land = new THREE.Mesh(geo(new THREE.CylinderGeometry(4.7, 5.15, .8, 56)), standard(0x86b765, { map: grass }));
    land.position.set(-9.2, ISLAND_Y - .4, 0);
    scene.add(beach, land);
    const rock = geo(new THREE.DodecahedronGeometry(.4, 0));
    const rockMaterial = standard(0x8f949a);
    for (const [x, z, s] of [[-4.6, 1.7, .9], [-5.0, 2.2, .6], [-13.2, 1.8, 1.2], [-4.9, -2.3, .8]]) {
      const mesh = new THREE.Mesh(rock, rockMaterial);
      mesh.position.set(x, .2, z); mesh.scale.set(s, s * .7, s); mesh.rotation.set(x, z, s);
      scene.add(mesh);
    }
    const trunk = geo(new THREE.CylinderGeometry(.09, .12, .7, 8));
    const crown = geo(new THREE.ConeGeometry(.75, 1.5, 9));
    const trunkMaterial = standard(0x6b4a2e), crownMaterial = standard(0x2f6b3c);
    for (const [x, z, s] of [[-11.6, -2.6, 1.15], [-6.3, -3.0, .9], [-12.6, -.4, .95], [-10.6, -3.6, 1.35], [-6.9, -2.2, .7]]) {
      const tree = new THREE.Group();
      const t = new THREE.Mesh(trunk, trunkMaterial); t.position.y = .35;
      const a = new THREE.Mesh(crown, crownMaterial); a.position.y = 1.15;
      const b = new THREE.Mesh(crown, crownMaterial); b.position.y = 1.75; b.scale.setScalar(.72);
      tree.add(t, a, b);
      tree.position.set(x, ISLAND_Y, z); tree.scale.setScalar(s);
      scene.add(tree);
    }
  }

  // Sulka's lab: a red cottage with white corners, a window, a sign and the main switch by the door.
  const lever = new THREE.Group();
  {
    const hut = new THREE.Group();
    hut.position.copy(HUT);
    scene.add(hut);
    const W = 3, H = 2.2, D = 2.2;
    const body = new THREE.Mesh(geo(new THREE.BoxGeometry(W, H, D)), standard(0xa63a2c));
    body.position.y = H / 2;
    const shape = new THREE.Shape();
    shape.moveTo(-W / 2 - .25, 0); shape.lineTo(W / 2 + .25, 0); shape.lineTo(0, 1.15); shape.closePath();
    const roofGeometry = geo(new THREE.ExtrudeGeometry(shape, { depth: D + .4, bevelEnabled: false }));
    const roof = new THREE.Mesh(roofGeometry, standard(0x3d434b));
    roof.position.set(0, H, -D / 2 - .2);
    const trim = standard(0xf4f1ea);
    const corner = geo(new THREE.BoxGeometry(.14, H, .14));
    for (const [x, z] of [[-W / 2, D / 2], [W / 2, D / 2], [-W / 2, -D / 2], [W / 2, -D / 2]]) {
      const c = new THREE.Mesh(corner, trim); c.position.set(x, H / 2, z); hut.add(c);
    }
    const door = new THREE.Mesh(geo(new THREE.BoxGeometry(.7, 1.35, .06)), standard(0x5a3a26));
    door.position.set(-.75, .68, D / 2 + .02);
    const windowFrame = new THREE.Mesh(geo(new THREE.BoxGeometry(.78, .62, .05)), trim);
    windowFrame.position.set(.35, 1.32, D / 2 + .02);
    const glass = new THREE.Mesh(geo(new THREE.PlaneGeometry(.62, .46)), keep(new THREE.MeshBasicMaterial({ color: 0xfff1c4 })));
    glass.position.set(.35, 1.32, D / 2 + .05);
    const sign = new THREE.Mesh(geo(new THREE.PlaneGeometry(1.2, .34)), keep(new THREE.MeshBasicMaterial({ map: keep(signTexture('LABRA')) })));
    sign.position.set(-.3, H - .22, D / 2 + .03);
    hut.add(body, roof, door, windowFrame, glass, sign);

    // The main switch.
    const box = new THREE.Mesh(geo(new THREE.BoxGeometry(.46, .58, .12)), standard(0xd5dadd, { roughness: .5 }));
    box.position.copy(SWITCH);
    const face = new THREE.Mesh(geo(new THREE.PlaneGeometry(.44, .56)), keep(new THREE.MeshBasicMaterial({ map: keep(switchFace()) })));
    face.position.copy(SWITCH).add(P(0, 0, .065));
    scene.add(box, face);
    lever.position.copy(SWITCH).add(P(.03, 0, .1));
    const handle = new THREE.Mesh(geo(new THREE.BoxGeometry(.07, .26, .07)), standard(0xd23b2a, { roughness: .4 }));
    handle.position.y = .13;
    const knob = new THREE.Mesh(geo(new THREE.SphereGeometry(.06, 12, 8)), standard(0xd23b2a, { roughness: .4 }));
    knob.position.y = .27;
    lever.add(handle, knob);
    scene.add(lever);
  }

  // The jetty: planks, beams and posts.
  {
    const count = 26, width = .34, step = .37, start = -5.1;
    const planks = new THREE.InstancedMesh(geo(new THREE.BoxGeometry(width, .07, 2.4)), standard(0xffffff, { roughness: .9 }), count);
    const matrix = new THREE.Matrix4(), color = new THREE.Color(), r = seeded(45);
    for (let i = 0; i < count; i++) {
      matrix.makeTranslation(start + i * step, JET_Y - .035, (r() - .5) * .06);
      planks.setMatrixAt(i, matrix);
      planks.setColorAt(i, color.setHSL(.075 + r() * .02, .38 + r() * .12, .44 + r() * .1));
    }
    scene.add(planks);
    const beam = geo(new THREE.BoxGeometry(9.8, .12, .14));
    const wood = standard(0x6e4d33);
    for (const z of [-1.0, 1.0]) { const b = new THREE.Mesh(beam, wood); b.position.set(-.3, JET_Y - .13, z); scene.add(b); }
    const post = geo(new THREE.CylinderGeometry(.09, .09, 1.1, 10));
    for (const x of [-3.9, -1.2, 1.5, 4.3]) for (const z of [-1.15, 1.15]) {
      const p = new THREE.Mesh(post, wood); p.position.set(x, JET_Y - .55, z); scene.add(p);
    }
  }

  // The socket post where the cord starts. Its light shows that the power is on.
  const led = new THREE.Mesh(geo(new THREE.SphereGeometry(.045, 12, 8)), keep(new THREE.MeshBasicMaterial({ color: 0xff5a3c })));
  {
    const post = new THREE.Mesh(geo(new THREE.BoxGeometry(.16, .55, .16)), standard(0x6e4d33));
    post.position.set(-4.3, JET_Y + .27, -1.05);
    const socket = new THREE.Mesh(geo(new THREE.BoxGeometry(.26, .22, .14)), standard(0xe8ebec, { roughness: .45 }));
    socket.position.set(-4.3, JET_Y + .5, -.94);
    led.position.set(-4.21, JET_Y + .58, -.86);
    scene.add(post, socket, led);
  }

  // The jetty light at the far end.
  const lampMaterial = keep(new THREE.MeshBasicMaterial({ color: 0xfff0b8 }));
  const lampGlow = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: keep(glowTexture([[0, 'rgba(255,240,190,1)'], [.35, 'rgba(255,214,120,.5)'], [1, 'rgba(255,200,90,0)']])), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })));
  const lampLight = new THREE.PointLight(0xffd28a, 2, 5, 1.6);
  {
    const pole = new THREE.Mesh(geo(new THREE.CylinderGeometry(.05, .06, 2.1, 10)), standard(0x39424a, { roughness: .5, metalness: .3 }));
    pole.position.copy(LAMP).add(P(0, 1.05, 0));
    const head = new THREE.Mesh(geo(new THREE.SphereGeometry(.18, 18, 12)), lampMaterial);
    head.position.copy(LAMP).add(P(0, 2.2, 0));
    const cap = new THREE.Mesh(geo(new THREE.ConeGeometry(.24, .16, 16)), standard(0x39424a, { roughness: .5 }));
    cap.position.copy(LAMP).add(P(0, 2.4, 0));
    const base = new THREE.Mesh(geo(new THREE.BoxGeometry(.2, .2, .16)), standard(0x39424a));
    base.position.copy(LAMP).add(P(0, .1, 0));
    lampGlow.position.copy(head.position); lampGlow.scale.setScalar(1.4);
    lampLight.position.copy(head.position);
    scene.add(pole, head, cap, base, lampGlow, lampLight);
  }

  // The cord: a soft tube along the jetty with a torn piece where the copper shows.
  const curve = new THREE.CatmullRomCurve3([
    P(-4.3, JET_Y + .42, -.88), P(-4.12, JET_Y + .1, -.82), P(-3.5, JET_Y + .06, -.6), P(-2.4, JET_Y + .06, -.78), P(-1.2, JET_Y + .06, -.5),
    GAP.clone(), P(1.8, JET_Y + .06, -.62), P(3.0, JET_Y + .06, -.86), P(3.95, JET_Y + .06, -1.0), P(4.18, JET_Y + .12, -1.02),
  ], false, 'catmullrom', .4);
  const atX = x => { let best = 0, d = Infinity; for (let i = 0; i <= 600; i++) { const u = i / 600, e = Math.abs(curve.getPointAt(u).x - x); if (e < d) { d = e; best = u; } } return best; };
  const U0 = atX(GAP.x - .2), U1 = atX(GAP.x + .2);
  const part = (a, b, n = 40) => new THREE.CatmullRomCurve3(Array.from({ length: n + 1 }, (_, i) => curve.getPointAt(a + (b - a) * i / n)));
  const R_CORD = .055;
  const cordMaterial = standard(0x2c2f36, { roughness: .55 });
  const cordA = new THREE.Mesh(geo(new THREE.TubeGeometry(part(0, U0), 90, R_CORD, 10)), cordMaterial);
  const cordB = new THREE.Mesh(geo(new THREE.TubeGeometry(part(U1, 1), 90, R_CORD, 10)), cordMaterial);
  scene.add(cordA, cordB);
  const torn = new THREE.Group();
  scene.add(torn);
  {
    // Ragged ends of the cover close the open tube ends.
    const up = P(0, 1, 0);
    for (const u of [U0, U1]) {
      const end = new THREE.Mesh(geo(new THREE.CylinderGeometry(R_CORD * 1.18, R_CORD * 1.05, .06, 10)), standard(0x1f2227, { roughness: .7 }));
      end.position.copy(curve.getPointAt(u));
      end.quaternion.setFromUnitVectors(up, curve.getTangentAt(u));
      torn.add(end);
    }
    // Frayed copper strands.
    const copper = standard(0xd9823b, { roughness: .32, metalness: .85, emissive: 0x3a1a05 });
    const a = curve.getPointAt(U0), b = curve.getPointAt(U1), tangent = b.clone().sub(a).normalize();
    const side = new THREE.Vector3().crossVectors(tangent, up).normalize();
    for (let k = 0; k < 7; k++) {
      const angle = k / 7 * TAU, spread = .022 + (k % 3) * .006;
      const offset = new THREE.Vector3().addScaledVector(side, Math.cos(angle)).addScaledVector(up, Math.sin(angle));
      const points = Array.from({ length: 7 }, (_, i) => {
        const s = i / 6;
        return a.clone().lerp(b, s).addScaledVector(offset, spread * (1 + 2.6 * Math.sin(Math.PI * s) * (.6 + .4 * Math.cos(k * 2.3))));
      });
      torn.add(new THREE.Mesh(geo(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 16, .011, 5)), copper));
    }
  }
  // After the repair: a whole piece and a proper joint box.
  const mended = new THREE.Group();
  {
    mended.add(new THREE.Mesh(geo(new THREE.TubeGeometry(part(U0 - .01, U1 + .01), 20, R_CORD, 10)), cordMaterial));
    const joint = new THREE.Mesh(geo(new THREE.BoxGeometry(.3, .14, .18)), standard(0xf0f2f2, { roughness: .4 }));
    joint.position.copy(GAP).add(P(0, .02, 0));
    joint.quaternion.setFromUnitVectors(P(1, 0, 0), curve.getTangentAt((U0 + U1) / 2));
    mended.add(joint);
    mended.visible = false;
    scene.add(mended);
  }
  const GAP_UV = new THREE.Vector2(U0 - .004, U1 + .004), NO_GAP = new THREE.Vector2(-1, -1);
  const currentMaterial = basic(CURRENT_FRAGMENT, { time: { value: 0 }, on: { value: 1 }, gap: { value: GAP_UV.clone() } }, { transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  scene.add(new THREE.Mesh(geo(new THREE.TubeGeometry(curve, 240, R_CORD * 1.12, 8)), currentMaterial));

  // The puddle around the torn piece.
  const puddleMaterial = basic(PUDDLE_FRAGMENT, { time: { value: 0 }, charge: { value: 1 }, gap: { value: new THREE.Vector2((GAP.x - PUDDLE.x) / 1.05, -(GAP.z - PUDDLE.z) / .72) } }, { transparent: true, depthWrite: false });
  const puddle = new THREE.Mesh(geo(new THREE.CircleGeometry(1, 48)), puddleMaterial);
  puddle.rotation.x = -Math.PI / 2;
  puddle.scale.set(1.05, .72, 1);
  puddle.position.copy(PUDDLE);
  scene.add(puddle);

  // The danger circle on the planks.
  const ringMaterial = basic(RING_FRAGMENT, { time: { value: 0 }, danger: { value: 1 }, show: { value: 1 } }, { transparent: true, depthWrite: false });
  const ring = new THREE.Mesh(geo(new THREE.PlaneGeometry(2.5, 2.5)), ringMaterial);
  ring.rotation.x = -Math.PI / 2;
  ring.position.copy(RING);
  scene.add(ring);

  // The warning sign floats above the danger.
  const warning = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: keep(warningTexture()), transparent: true, depthWrite: false })));
  warning.scale.set(.62, .56, 1);
  scene.add(warning);

  // Sparks: short bursts of little stars from the copper, a flickering glow and a light.
  const SPARKS = 80;
  const sparkPosition = new Float32Array(SPARKS * 3), sparkColor = new Float32Array(SPARKS * 3);
  const sparkVelocity = new Float32Array(SPARKS * 3), sparkLife = new Float32Array(SPARKS), sparkMax = new Float32Array(SPARKS), sparkKind = new Uint8Array(SPARKS);
  sparkPosition.fill(-99);
  const sparkGeometry = geo(new THREE.BufferGeometry());
  sparkGeometry.setAttribute('position', new THREE.BufferAttribute(sparkPosition, 3));
  sparkGeometry.setAttribute('color', new THREE.BufferAttribute(sparkColor, 3));
  const sparks = new THREE.Points(sparkGeometry, keep(new THREE.PointsMaterial({ size: .2, map: keep(starTexture()), vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })));
  sparks.frustumCulled = false;
  scene.add(sparks);
  const gapGlow = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: keep(glowTexture([[0, 'rgba(255,250,215,1)'], [.3, 'rgba(255,214,90,.6)'], [1, 'rgba(255,170,40,0)']])), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })));
  gapGlow.position.copy(GAP).add(P(0, .04, 0));
  scene.add(gapGlow);
  const sparkLight = new THREE.PointLight(0xffd27a, 0, 4, 2);
  sparkLight.position.copy(GAP).add(P(0, .3, 0));
  scene.add(sparkLight);
  let nextBurst = .3, flash = 0, working = false, nextWork = 0;
  function burst(kind, count) {
    let made = 0;
    for (let i = 0; i < SPARKS && made < count; i++) {
      if (sparkLife[i] > 0) continue;
      made++;
      const a = Math.random() * TAU, lift = kind === 0 ? .55 + Math.random() * .9 : .8 + Math.random() * .6;
      const speed = kind === 0 ? 1.5 + Math.random() * 1.4 : .7 + Math.random() * .6;
      const dir = P(Math.cos(a), lift, Math.sin(a)).normalize().multiplyScalar(speed);
      sparkVelocity.set([dir.x, dir.y, dir.z], i * 3);
      sparkPosition.set([GAP.x, GAP.y + .04, GAP.z], i * 3);
      sparkLife[i] = sparkMax[i] = kind === 0 ? .32 + Math.random() * .34 : .8 + Math.random() * .4;
      sparkKind[i] = kind;
    }
  }
  function updateSparks(dt) {
    for (let i = 0; i < SPARKS; i++) {
      if (sparkLife[i] <= 0) continue;
      sparkLife[i] -= dt;
      const k = i * 3;
      if (sparkLife[i] <= 0) { sparkPosition[k + 1] = -99; sparkColor.fill(0, k, k + 3); continue; }
      const mend = sparkKind[i] === 1;
      sparkVelocity[k + 1] -= (mend ? 1.2 : 7.5) * dt;
      for (let j = 0; j < 3; j++) sparkPosition[k + j] += sparkVelocity[k + j] * dt;
      if (sparkPosition[k + 1] < JET_Y + .02) { sparkPosition[k + 1] = JET_Y + .02; sparkVelocity[k + 1] *= -.3; sparkVelocity[k] *= .6; sparkVelocity[k + 2] *= .6; }
      const f = sparkLife[i] / sparkMax[i];
      if (mend) sparkColor.set([.55 * f, f, .7 * f], k);
      else sparkColor.set([f, (.55 + .4 * f) * f, (.15 + .6 * f * f) * f], k);
    }
    sparkGeometry.attributes.position.needsUpdate = true;
    sparkGeometry.attributes.color.needsUpdate = true;
  }

  // Characters: 2D picture-book sprites standing in the 3D world, always facing the camera.
  const actors = [];
  const actor = (height, aspect, foot, textures) => {
    const geometry = geo(new THREE.PlaneGeometry(height * aspect, height));
    geometry.translate(0, height / 2 - foot * height, 0);
    const material = keep(new THREE.MeshBasicMaterial({ transparent: true, alphaTest: .06, side: THREE.DoubleSide }));
    const mesh = new THREE.Mesh(geometry, material);
    const shadow = new THREE.Mesh(geo(new THREE.CircleGeometry(height * aspect * .3, 24)), keep(new THREE.MeshBasicMaterial({ color: 0x1c2a22, transparent: true, opacity: .24, depthWrite: false })));
    shadow.rotation.x = -Math.PI / 2;
    shadow.scale.y = .5;
    scene.add(mesh, shadow);
    const loaded = Object.fromEntries(Object.entries(textures).map(([name, path]) => [name, texture(path)]));
    const self = {
      mesh, shadow, height, flip: 1, ground: JET_Y,
      pose(name) { if (material.map !== loaded[name]) { material.map = loaded[name]; material.needsUpdate = true; } },
      at(position, ground = position.y) { mesh.position.copy(position); self.ground = ground; mesh.visible = shadow.visible = true; },
      hide() { mesh.visible = shadow.visible = false; },
    };
    self.pose(Object.keys(textures)[0]);
    actors.push(self);
    return self;
  };
  const aava = actor(1.0, 1, .055, { flap1: 'art/characters/aava/flap_01.png', flap2: 'art/characters/aava/flap_02.png', idle: 'characters/aava/idle.png', wave: 'characters/aava/wave.png' });
  const loikka = actor(1.05, 1, .06, { idle: 'characters/loikka/idle.png', crouch: 'characters/loikka/crouch.png', airborne: 'characters/loikka/airborne.png', happy: 'characters/loikka/happy.png' });
  const sisi = actor(1.3, 1, .145, { idle: 'models/characters/sisi/poster.png' });
  const sulka = actor(2.15, 260 / 560, 0, { idle: 'art/book/elec-sulka.png' });
  const otter = actor(1.55, OTTER_ASPECT, 0, { idle: 'art/book/elec-otter.png' });

  // Picture-book overlays: speech bubbles, labels and the power badge.
  const el = (tag, className, text = '') => { const node = document.createElement(tag); node.className = className; node.textContent = text; host.append(node); return node; };
  const bubbles = { aava: el('p', 'elec-bubble'), sulka: el('p', 'elec-bubble'), loikka: el('p', 'elec-bubble') };
  for (const bubble of Object.values(bubbles)) bubble.hidden = true;
  const tags = [
    { node: el('p', 'elec-tag', 'Rikki johto: kupari näkyy'), anchor: GAP.clone().add(P(0, .5, 0)), place: 'above' },
    { node: el('p', 'elec-tag', 'Vesi johtaa sähköä'), anchor: PUDDLE.clone().add(P(.35, 0, .72)), place: 'below' },
  ];
  for (const tag of tags) tag.node.dataset.place = tag.place;
  const badge = el('p', 'elec-badge');
  badge.hidden = true;
  const replay = el('button', 'elec-replay', '↻ Katso uudelleen');
  replay.type = 'button';
  replay.hidden = true;
  replay.addEventListener('click', () => { t = 0; replay.hidden = true; });

  const BADGES = {
    danger: '⚡ Sähköt päällä: älä koske!',
    off: '✓ Sähköt katkaistu',
    fix: '🔧 Sähköasentaja korjaa johdon',
    ok: '💡 Ehjä johto, ehjä valo',
  };

  let width = 1, height = 1, covered = 0;
  let view = 'danger', t = 0, clock = 0, yaw = 0;
  let power = 1, powerGoal = 1, repaired = false, wasRepaired = false;
  const lookGoal = new THREE.Vector3(), camGoal = new THREE.Vector3(), tmp = new THREE.Vector3();
  let frameGoal = { x: -.1, y: .75, z: -.1, w: 3.1, h: 2.0 };

  function fitDistance(halfWidth, halfHeight) {
    const v = THREE.MathUtils.degToRad(camera.fov) / 2;
    const h = Math.atan(Math.tan(v) * camera.aspect);
    return Math.max(halfWidth / Math.tan(h), halfHeight / Math.tan(v));
  }

  const lerpFrame = (a, b, s) => ({ x: a.x + (b.x - a.x) * s, y: a.y + (b.y - a.y) * s, z: a.z + (b.z - a.z) * s, w: a.w + (b.w - a.w) * s, h: a.h + (b.h - a.h) * s });
  const F_DANGER = { x: -.55, y: .85, z: -.1, w: 3.55, h: 2.1 };
  const F_JETTY = { x: -1.6, y: .95, z: -.1, w: 4.0, h: 2.4 };
  const F_LAB = { x: -6.1, y: 1.25, z: -.2, w: 3.6, h: 2.3 };
  const F_SWITCH = { x: -7.0, y: 1.25, z: -.3, w: 2.7, h: 1.85 };
  const F_GAP = { x: .3, y: .8, z: -.2, w: 3.0, h: 1.9 };
  const F_WIDE = { x: .2, y: 1.15, z: -.3, w: 4.6, h: 2.6 };
  const F_ALL = { x: -3.4, y: 1.2, z: -.3, w: 8.2, h: 3.2 };

  function show(next) {
    view = next;
    t = 0;
    replay.hidden = true;
    lastBadge = '-';
    if (view === 'danger' || view === 'try') { repaired = false; powerGoal = power = 1; }
    if (view === 'tell') { repaired = false; powerGoal = power = 1; }
    for (const tag of tags) tag.node.hidden = view !== 'danger';
  }

  function reveal() {
    if (view !== 'try') return;
    view = 'resolve';
    t = 0;
    lastBadge = '-';
    for (const tag of tags) tag.node.hidden = true;
  }

  /** Who says what and stands where at time t of the "tell" story. */
  function tellScript(time) {
    const hop = seg(time, .55, 1.25);
    loikka.at(LOIKKA_STOP.clone().lerp(LOIKKA_BACK, hop).add(P(0, Math.sin(Math.PI * hop) * .55, 0)), JET_Y);
    loikka.pose(hop > 0 && hop < 1 ? 'airborne' : hop >= 1 ? 'idle' : 'crouch');
    const walk = seg(time, .75, 1.7);
    sisi.at(SISI_NEAR.clone().lerp(SISI_BACK, walk).add(P(0, Math.abs(Math.sin(walk * Math.PI * 4)) * .06, 0)), JET_Y);
    sisi.flip = walk > 0 && walk < 1 ? -1 : 1;
    const fly = seg(time, 1.9, 4.0);
    aava.at(AAVA_HOVER.clone().lerp(AAVA_AT_SULKA, fly).add(P(0, Math.sin(Math.PI * fly) * .7, 0)), fly < .5 ? JET_Y : ISLAND_Y);
    aava.flip = time > 1.85 ? -1 : 1;
    sulka.at(SULKA_HOME, ISLAND_Y);
    sulka.flip = -1;
    say('aava', time > .15 && time < 1.85 ? 'Pysykää kauempana!' : time > 4.05 && time < 5.6 ? 'Sulka! Laiturilla on rikki johto.' : '', time < 1.85);
    say('sulka', time > 5.6 ? 'Hyvä, että kerroit! Pysykää kaukana.' : '');
    otter.hide();
    say('loikka', '');
    powerGoal = 1; repaired = false;
    setBadge('');
    frameGoal = reduced ? F_ALL : lerpFrame(F_JETTY, F_LAB, seg(time, 1.9, 4.0));
  }

  /** The "safe" story: the power goes off at the main switch, the cord is mended, the light comes back. */
  function safeScript(time) {
    loikka.at(LOIKKA_BACK, JET_Y);
    loikka.pose(time > 6.3 ? 'happy' : 'idle');
    sisi.at(SISI_BACK, JET_Y);
    sisi.flip = 1;
    const back = seg(time, 5.5, 6.9);
    aava.at(AAVA_AT_SULKA.clone().lerp(AAVA_END, back).add(P(0, Math.sin(Math.PI * back) * .6, 0)), back < .5 ? ISLAND_Y : JET_Y);
    aava.flip = back > 0 && back < 1 ? 1 : time >= 6.9 ? 1 : -1;
    const walk = seg(time, 0, .8);
    sulka.at(SULKA_HOME.clone().lerp(SULKA_SWITCH, walk), ISLAND_Y);
    sulka.flip = walk >= 1 ? 1 : -1;
    lever.rotation.z = -Math.PI * (seg(time, 1.0, 1.45) - seg(time, 5.4, 5.8));
    powerGoal = time < 1.45 || time >= 5.8 ? 1 : 0;
    repaired = time >= 4.6;
    const walkIn = seg(time, 1.7, 3.3), stepBack = seg(time, 4.8, 5.4);
    if (time < 1.7) otter.hide();
    else {
      const at = OTTER_START.clone().lerp(OTTER_WORK, walkIn).lerp(OTTER_DONE, stepBack);
      const walking = (walkIn > 0 && walkIn < 1) || (stepBack > 0 && stepBack < 1);
      const kneel = time > 3.3 && time < 4.7 ? .06 * Math.abs(Math.sin(time * 9)) : 0;
      at.y += walking ? Math.abs(Math.sin(time * 11)) * .06 : -kneel;
      otter.at(at, JET_Y);
      otter.flip = stepBack > 0 && stepBack < 1 ? 1 : -1;
    }
    working = time > 3.3 && time < 4.6;
    say('sulka', time > .2 && time < 2.4 ? 'Katkaisen sähköt pääkytkimestä.' : '');
    say('aava', time > 7.0 ? 'Valo palaa taas!' : '');
    say('loikka', '');
    setBadge(time < 1.45 ? '' : time < 3.1 ? 'off' : time < 5.8 ? 'fix' : 'ok');
    frameGoal = reduced ? F_ALL
      : time < 1.9 ? F_SWITCH
      : time < 5.5 ? lerpFrame(F_SWITCH, F_GAP, seg(time, 1.9, 3.5))
      : lerpFrame(F_GAP, F_WIDE, seg(time, 5.5, 6.8));
  }

  /** The danger scene: Loikka has stopped outside the circle, Aava hovers, Sisi waits behind. */
  function dangerScript() {
    loikka.at(LOIKKA_STOP, JET_Y); loikka.pose('crouch');
    sisi.at(SISI_NEAR, JET_Y); sisi.flip = 1;
    aava.at(AAVA_HOVER, JET_Y); aava.flip = 1;
    sulka.at(SULKA_HOME, ISLAND_Y); sulka.flip = -1;
    lever.rotation.z = 0;
    powerGoal = 1; repaired = false;
    say('aava', ''); say('sulka', '');
    say('loikka', view === 'danger' ? '!' : '');
    setBadge(view === 'danger' ? 'danger' : '');
    otter.hide();
    frameGoal = F_DANGER;
  }

  const spoken = { aava: '', sulka: '', loikka: '' };
  function say(who, text, loud = false) {
    const bubble = bubbles[who];
    if (spoken[who] !== text) { spoken[who] = text; bubble.textContent = text; bubble.hidden = !text; }
    bubble.dataset.loud = String(loud);
  }
  let lastBadge = '';
  function setBadge(tone) {
    if (tone === lastBadge) return;
    lastBadge = tone;
    badge.hidden = !tone;
    if (tone) { badge.textContent = BADGES[tone]; badge.dataset.tone = tone; badge.style.animation = 'none'; void badge.offsetWidth; badge.style.animation = ''; }
  }

  function resize() {
    width = Math.max(1, host.clientWidth); height = Math.max(1, host.clientHeight);
    // On phones the desk slides over the bottom of the stage: frame the scene in the part that shows.
    const desk = host.closest('.expedition')?.querySelector('.exp-desk')?.getBoundingClientRect();
    const box = host.getBoundingClientRect();
    covered = desk && desk.left <= box.left + 4 && desk.top > box.top + box.height * .3 ? THREE.MathUtils.clamp(box.bottom - desk.top, 0, height * .4) : 0;
    renderer.setSize(width, height, false);
    camera.aspect = width / (height - covered);
    if (covered) camera.setViewOffset(width, height - covered, 0, 0, width, height);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }

  function cameraGoal() {
    lookGoal.set(frameGoal.x, frameGoal.y, frameGoal.z);
    const sway = reduced ? 0 : Math.sin(clock * .23) * .05;
    const angle = -.2 + yaw + sway;
    const dir = tmp.set(Math.sin(angle), .5, Math.cos(angle)).normalize();
    // Portrait screens crop the sides a little so the friends stay big enough.
    const narrow = width < 600 ? .8 : 1;
    camGoal.copy(lookGoal).addScaledVector(dir, fitDistance(frameGoal.w * narrow, frameGoal.h));
  }

  function update(dt) {
    t += dt;
    working = false;
    const story = view === 'tell' ? t : view === 'safe' ? t : view === 'resolve' ? t : 0;
    if (view === 'tell') tellScript(story);
    else if (view === 'safe') safeScript(story);
    else if (view === 'resolve') { if (story < RESOLVE_SAFE) tellScript(story); else safeScript(story - RESOLVE_SAFE); }
    else dangerScript();
    const end = view === 'tell' ? TELL_END + 1.2 : view === 'safe' ? SAFE_END + 1 : view === 'resolve' ? RESOLVE_SAFE + SAFE_END + 1 : Infinity;
    if (t > end && replay.hidden) replay.hidden = false;

    // Power and repair.
    power += (powerGoal - power) * Math.min(1, dt * 7);
    if (repaired && !wasRepaired) burst(1, 18);
    working = working && !reduced;
    if (working) { nextWork -= dt; if (nextWork <= 0) { burst(1, 4); nextWork = .35; } }
    currentMaterial.uniforms.gap.value.copy(repaired ? NO_GAP : GAP_UV);
    wasRepaired = repaired;
    const hazard = repaired ? 0 : power;
    torn.visible = !repaired; mended.visible = repaired;
    currentMaterial.uniforms.on.value = power;
    puddleMaterial.uniforms.charge.value = hazard;
    ringMaterial.uniforms.danger.value = hazard;
    ringMaterial.uniforms.show.value = repaired ? Math.max(0, ringMaterial.uniforms.show.value - dt * 1.5) : 1;
    led.material.color.setHex(power > .5 ? 0xff5a3c : 0x3a2c2a);
    lampMaterial.color.setRGB(.55 + .45 * power, .5 + .44 * power, .42 + .3 * power);
    lampGlow.material.opacity = power;
    lampLight.intensity = 2 * power;
    warning.visible = hazard > .05;
    warning.position.copy(GAP).add(P(0, 1.2 + (reduced ? 0 : Math.sin(clock * 2.4) * .06), 0));
    warning.material.opacity = hazard;
    if (hazard > .5) {
      nextBurst -= dt;
      if (nextBurst <= 0) { burst(0, reduced ? 4 : 11); flash = 1; nextBurst = .55 + Math.random() * .8; }
    }
    flash = Math.max(0, flash - dt * 7);
    gapGlow.material.opacity = hazard * (.45 + .25 * Math.random() + flash * .3);
    gapGlow.scale.setScalar(.45 + flash * .35);
    sparkLight.intensity = hazard * (1.2 + flash * 6);
    updateSparks(dt);

    // Lake and shader clocks.
    const time = reduced ? 0 : clock;
    waterMaterial.uniforms.time.value = time;
    puddleMaterial.uniforms.time.value = time;
    currentMaterial.uniforms.time.value = clock;
    ringMaterial.uniforms.time.value = time;

    // Camera.
    cameraGoal();
    const k = Math.min(1, dt * 2.6);
    camera.position.lerp(camGoal, k);
    look.lerp(lookGoal, k);
    camera.lookAt(look);
    camera.updateMatrixWorld();

    // Characters: face the camera; Aava flaps while she flies or hovers.
    const flap = Math.floor(clock * (reduced ? 2 : 7)) % 2 ? 'flap1' : 'flap2';
    const aloft = aava.mesh.position.y - aava.ground > .2;
    aava.pose(aloft ? flap : view === 'safe' && t > 7.0 ? 'wave' : 'idle');
    if (aloft && !reduced) aava.mesh.position.y += Math.sin(clock * 3.1) * .05;
    for (const a of actors) {
      a.mesh.rotation.y = Math.atan2(camera.position.x - a.mesh.position.x, camera.position.z - a.mesh.position.z);
      a.mesh.scale.x = a.flip;
      a.shadow.position.set(a.mesh.position.x, a.ground + .012, a.mesh.position.z);
      const lift = clamp01((a.mesh.position.y - a.ground) / 1.6);
      a.shadow.material.opacity = .24 * (1 - lift * .6);
      a.shadow.scale.set(1 - lift * .4, .5 * (1 - lift * .4), 1);
    }

    // Overlays follow their 3D anchors.
    place(bubbles.aava, aava.mesh.position, aava.height * .95);
    place(bubbles.sulka, sulka.mesh.position, sulka.height * 1.0);
    place(bubbles.loikka, loikka.mesh.position, loikka.height * .9);
    for (const tag of tags) if (!tag.node.hidden) place(tag.node, tag.anchor, 0);
  }

  function place(node, at, above) {
    if (node.hidden) return;
    const p = tmp.copy(at).add(P(0, above, 0)).project(camera);
    const x = THREE.MathUtils.clamp((p.x + 1) / 2 * width, 90, width - 90);
    // Bubbles stay below the top bar (logo and buttons).
    const top = node.classList.contains('elec-bubble') ? (width < 600 ? 112 : 96) : 40;
    const y = THREE.MathUtils.clamp((1 - p.y) / 2 * height, top, height - covered - 20);
    node.style.left = `${x}px`; node.style.top = `${y}px`;
  }

  // Dragging turns the view a little around the scene.
  const pointer = { id: -1, x: 0, yaw: 0, moved: false };
  function onDown(event) { pointer.id = event.pointerId; pointer.x = event.clientX; pointer.yaw = yaw; pointer.moved = false; canvas.setPointerCapture?.(event.pointerId); }
  function onMove(event) {
    if (event.pointerId !== pointer.id) return;
    const dx = event.clientX - pointer.x;
    if (Math.abs(dx) > 6) pointer.moved = true;
    if (pointer.moved) yaw = THREE.MathUtils.clamp(pointer.yaw - dx * .005, -.6, .6);
  }
  function onUp(event) { if (event.pointerId === pointer.id) pointer.id = -1; }
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);

  let raf = 0, running = true, last = performance.now();
  function frame(now) {
    raf = 0;
    if (!running) return;
    const dt = Math.min(.05, (now - last) / 1000);
    last = now; clock += dt;
    update(dt);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  resize();
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(() => resize()) : undefined;
  observer?.observe(host);
  show('danger');
  dangerScript();
  cameraGoal();
  camera.position.copy(camGoal); look.copy(lookGoal);
  raf = requestAnimationFrame(frame);

  const api = {
    show,
    reveal,
    resize,
    setPaused(paused) {
      running = !paused;
      if (running && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    },
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      observer?.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      for (const thing of disposables) thing.dispose?.();
      renderer.dispose();
      renderer.forceContextLoss();
      host.replaceChildren();
      host.classList.remove('elec-stage');
    },
    /** For tests: the story clock and the power state. */
    debug: () => ({ view, t, power: Math.round(power * 100) / 100, repaired, sparks: Array.from(sparkLife).filter(v => v > 0).length, badge: lastBadge }),
  };
  host.elecStage = api;
  return api;
}
