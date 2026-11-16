import * as THREE from 'three';

/*
 * ENV-PHY-SPACE-01 theory-book stage: the Sun, the Earth and the Moon on their own canvas.
 * Views:
 *  - system:   Earth orbits the Sun, the Moon orbits the Earth; tap a body and the rocket flies around it.
 *  - day:      close to the Earth; it spins, Sisi the lizard sleeps on the night side.
 *  - seasons:  the Earth goes round the Sun; the axis keeps its direction; Aava and Loikka in the north
 *              go sledding in winter and sunbathe in summer.
 *  - try-season:<winter|summer>  drag the Earth along the orbit until it is that season in the north.
 *  - try-spin: spin the Earth until Sisi can sleep.
 * The orbit is a circle (seasons do not come from distance) and the axis tilt is fixed in space.
 */

const TAU = Math.PI * 2;
const TILT = THREE.MathUtils.degToRad(23.44);
const R_ORBIT = 9, R_EARTH = 1.35, R_SUN = 2.3, R_MOON = 0.34, MOON_ORBIT = 2.6;
/** Orbit stations in the order the Earth moves; winter (north tilted away) at angle 0. */
export const SEASONS = ['winter', 'spring', 'summer', 'autumn'];
/** Index of the right option in the spin try (the options are listed in this fixed order by the page). */
export const SPIN_RIGHT = 2;
const SEASON_FI = { winter: 'talvi', spring: 'kevät', summer: 'kesä', autumn: 'syksy' };
const NORTH = new THREE.Vector3(Math.sin(TILT), Math.cos(TILT), 0);
const AL_POINT = latLon(58, 0), SISI_POINT = latLon(0, 0);
/** Spin offsets from Sisi's noon: afternoon light, and asleep well inside the night on the seen side. */
const SISI_AFTERNOON = THREE.MathUtils.degToRad(40), SISI_ASLEEP = THREE.MathUtils.degToRad(140);

function latLon(lat, lon) {
  const a = THREE.MathUtils.degToRad(lat), o = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(Math.cos(a) * Math.cos(o), Math.sin(a), -Math.cos(a) * Math.sin(o)).multiplyScalar(R_EARTH);
}
const orbitPoint = (theta, target = new THREE.Vector3()) => target.set(R_ORBIT * Math.cos(theta), 0, -R_ORBIT * Math.sin(theta));
const wrap = angle => ((angle % TAU) + TAU) % TAU;
/** Shortest signed angle from a to b. */
const turn = (a, b) => { const d = wrap(b - a); return d > Math.PI ? d - TAU : d; };
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

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

/** A friendly Earth: blue sea, green and sandy land, white caps. Land under Aava, Loikka and Sisi. */
function earthTexture() {
  return canvasTexture(1024, 512, (g, w, h) => {
    const sea = g.createLinearGradient(0, 0, 0, h);
    sea.addColorStop(0, '#2d6fb0'); sea.addColorStop(.5, '#2a86c9'); sea.addColorStop(1, '#2d6fb0');
    g.fillStyle = sea; g.fillRect(0, 0, w, h);
    const r = seeded(690);
    const at = (lat, lon) => [(0.5 + lon / 360) * w, (0.5 - lat / 180) * h];
    const blob = (lat, lon, size, color) => {
      const [x, y] = at(lat, lon);
      g.fillStyle = color;
      for (let i = 0; i < 26; i++) {
        const a = r() * TAU, d = r() * size;
        g.beginPath(); g.ellipse(x + Math.cos(a) * d * 1.5, y + Math.sin(a) * d * .8, size * (.35 + r() * .45), size * (.3 + r() * .35), 0, 0, TAU); g.fill();
      }
    };
    const lands = [[58, 0, 46], [5, 2, 44], [30, -20, 34], [-25, 30, 40], [45, 95, 52], [20, 120, 30], [-20, 135, 38], [40, -100, 50], [10, -75, 30], [-15, -60, 44], [65, -40, 26], [-50, 70, 18]];
    for (const [lat, lon, size] of lands) blob(lat, lon, size, '#5c9e4c');
    for (const [lat, lon, size] of lands) blob(lat - 3, lon + 4, size * .45, '#7fb65a');
    blob(18, 20, 22, '#d8c27a'); blob(-22, 125, 16, '#d8c27a');
    g.fillStyle = '#f4f8ff';
    g.fillRect(0, 0, w, h * .06); g.fillRect(0, h * .94, w, h * .06);
    for (let i = 0; i < 60; i++) {
      g.beginPath(); g.ellipse(r() * w, h * (.05 + r() * .03), 18 + r() * 30, 8 + r() * 10, 0, 0, TAU); g.fill();
      g.beginPath(); g.ellipse(r() * w, h * (.95 - r() * .03), 18 + r() * 30, 8 + r() * 10, 0, 0, TAU); g.fill();
    }
    g.globalAlpha = .28; g.fillStyle = '#ffffff'; g.filter = 'blur(7px)';
    for (let i = 0; i < 26; i++) { g.beginPath(); g.ellipse(r() * w, h * (.15 + r() * .7), 40 + r() * 60, 10 + r() * 12, 0, 0, TAU); g.fill(); }
    g.filter = 'none'; g.globalAlpha = 1;
  });
}

function glowTexture(stops) {
  return canvasTexture(256, 256, (g, w) => {
    const grad = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    for (const [at, color] of stops) grad.addColorStop(at, color);
    g.fillStyle = grad; g.fillRect(0, 0, w, w);
  });
}

function letterTexture(text) {
  return canvasTexture(64, 64, (g) => {
    g.font = 'bold 46px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineWidth = 6; g.strokeStyle = '#173b6b'; g.strokeText(text, 32, 34);
    g.fillStyle = '#e3eeff'; g.fillText(text, 32, 34);
  });
}

const EARTH_VERTEX = /* glsl */`
varying vec2 vUv; varying vec3 vN; varying vec3 vP;
void main() {
  vUv = uv;
  vN = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vP = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;
const EARTH_FRAGMENT = /* glsl */`
uniform sampler2D map; uniform vec3 sunPos;
varying vec2 vUv; varying vec3 vN; varying vec3 vP;
void main() {
  vec3 n = normalize(vN);
  vec3 l = normalize(sunPos - vP);
  float d = dot(n, l);
  float day = smoothstep(-0.07, 0.11, d);
  vec3 tex = texture2D(map, vUv).rgb;
  vec3 dayColor = tex * (0.62 + 0.55 * max(d, 0.0));
  vec3 nightColor = tex * vec3(0.035, 0.045, 0.1) + vec3(0.008, 0.016, 0.045);
  vec3 color = mix(nightColor, dayColor, day);
  vec3 v = normalize(cameraPosition - vP);
  float rim = pow(1.0 - max(dot(n, v), 0.0), 2.6);
  color += vec3(0.35, 0.62, 1.0) * rim * (0.06 + 0.6 * day);
  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}`;

// The Sun: slowly boiling granules, darker towards the edge, white-hot in the middle.
const SUN_VERTEX = /* glsl */`
varying vec3 vObj; varying vec3 vN; varying vec3 vView;
void main() {
  vObj = position;
  vN = normalize(normalMatrix * normal);
  vec4 view = modelViewMatrix * vec4(position, 1.0);
  vView = normalize(-view.xyz);
  gl_Position = projectionMatrix * view;
}`;
const SUN_FRAGMENT = /* glsl */`
uniform float time;
varying vec3 vObj; varying vec3 vN; varying vec3 vView;
float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
void main() {
  vec3 p = normalize(vObj) * 3.2;
  float n = fbm(p + vec3(0.0, time * 0.18, time * 0.07));
  float cells = fbm(p * 2.6 - vec3(time * 0.25));
  float limb = clamp(dot(normalize(vN), normalize(vView)), 0.0, 1.0);
  vec3 deep = vec3(0.95, 0.38, 0.06), hot = vec3(1.0, 0.78, 0.32), white = vec3(1.0, 0.97, 0.86);
  vec3 color = mix(deep, hot, smoothstep(0.25, 0.75, n * 0.7 + cells * 0.5));
  color = mix(color, white, pow(limb, 3.0) * 0.55);
  color *= 0.62 + 0.48 * pow(limb, 0.45);
  gl_FragColor = vec4(color, 1.0);
}`;

export function mountSpaceStage(host, options) {
  const reduced = !!options.reducedMotion;
  const disposables = [];
  const keep = thing => { disposables.push(thing); return thing; };
  const texture = path => {
    const t = keep(new THREE.TextureLoader().load(options.assets(path)));
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.className = 'space-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  host.classList.add('space-stage');
  host.append(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 400);
  camera.position.set(0, 13, 18);
  const look = new THREE.Vector3();

  // Sky: soft nebula behind and stars.
  {
    const count = 1400, positions = new Float32Array(count * 3), colors = new Float32Array(count * 3);
    const r = seeded(11), color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const u = r() * 2 - 1, a = r() * TAU, s = Math.sqrt(1 - u * u);
      positions.set([Math.cos(a) * s * 150, u * 150, Math.sin(a) * s * 150], i * 3);
      color.setHSL(.58 + r() * .12, .5, .7 + r() * .3);
      colors.set([color.r, color.g, color.b], i * 3);
    }
    const geometry = keep(new THREE.BufferGeometry());
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    scene.add(new THREE.Points(geometry, keep(new THREE.PointsMaterial({ size: 1.7, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: .85 }))));
  }

  // The Sun.
  const sun = new THREE.Group();
  scene.add(sun);
  const sunMaterial = keep(new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: SUN_VERTEX, fragmentShader: SUN_FRAGMENT,
  }));
  const sunBall = new THREE.Mesh(keep(new THREE.SphereGeometry(R_SUN, 64, 40)), sunMaterial);
  sun.add(sunBall);
  const glow = (scale, opacity, stops) => {
    const sprite = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: keep(glowTexture(stops)), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity })));
    sprite.scale.setScalar(scale);
    sun.add(sprite);
    return sprite;
  };
  const corona = glow(R_SUN * 5.4, 1, [[0, 'rgba(255,248,226,1)'], [.3, 'rgba(255,220,130,.9)'], [.45, 'rgba(255,170,70,.35)'], [.7, 'rgba(255,130,40,.08)'], [1, 'rgba(255,120,30,0)']]);
  glow(R_SUN * 11, .45, [[0, 'rgba(255,200,120,.5)'], [.3, 'rgba(255,150,70,.15)'], [1, 'rgba(255,120,40,0)']]);
  const light = new THREE.PointLight(0xfff1dc, 3.2, 0, 0);
  sun.add(light);
  scene.add(new THREE.AmbientLight(0x8aa4d8, .22));

  // The orbit: a circle seen from above.
  const orbit = new THREE.Mesh(keep(new THREE.RingGeometry(R_ORBIT - .03, R_ORBIT + .03, 160)), keep(new THREE.MeshBasicMaterial({ color: 0x9fc2ff, transparent: true, opacity: .35, side: THREE.DoubleSide, depthWrite: false })));
  orbit.rotation.x = -Math.PI / 2;
  scene.add(orbit);

  // The Earth: anchor on the orbit → fixed tilt → daily spin.
  const earth = new THREE.Group();
  scene.add(earth);
  const tilt = new THREE.Group();
  tilt.rotation.z = -TILT;
  earth.add(tilt);
  const spin = new THREE.Group();
  tilt.add(spin);
  const earthMaterial = keep(new THREE.ShaderMaterial({
    uniforms: { map: { value: keep(earthTexture()) }, sunPos: { value: new THREE.Vector3() } },
    vertexShader: EARTH_VERTEX, fragmentShader: EARTH_FRAGMENT,
  }));
  const globe = new THREE.Mesh(keep(new THREE.SphereGeometry(R_EARTH, 64, 40)), earthMaterial);
  spin.add(globe);
  const air = new THREE.Mesh(keep(new THREE.SphereGeometry(R_EARTH * 1.07, 48, 32)), keep(new THREE.MeshBasicMaterial({ color: 0x5fa8ff, transparent: true, opacity: .12, side: THREE.BackSide, depthWrite: false })));
  earth.add(air);
  const axisMaterial = keep(new THREE.MeshBasicMaterial({ color: 0xffe9a8, transparent: true, opacity: .9 }));
  const axis = new THREE.Mesh(keep(new THREE.CylinderGeometry(.035, .035, R_EARTH * 2 + 1.5, 10)), axisMaterial);
  tilt.add(axis);
  const star = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: keep(glowTexture([[0, 'rgba(255,250,220,1)'], [.18, 'rgba(255,236,160,.9)'], [.5, 'rgba(255,220,120,.2)'], [1, 'rgba(255,220,120,0)']])), blending: THREE.AdditiveBlending, depthWrite: false })));
  star.scale.setScalar(.7);
  star.position.y = R_EARTH + .78;
  tilt.add(star);
  // A wider invisible ball makes the Earth easy to grab.
  const earthHit = new THREE.Mesh(keep(new THREE.SphereGeometry(R_EARTH * 1.9, 16, 12)), keep(new THREE.MeshBasicMaterial({ visible: false })));
  earth.add(earthHit);

  // The Moon.
  const moonPivot = new THREE.Group();
  earth.add(moonPivot);
  const moon = new THREE.Mesh(keep(new THREE.SphereGeometry(R_MOON, 32, 20)), keep(new THREE.MeshStandardMaterial({ color: 0xd9d6cf, roughness: .95 })));
  moon.position.x = MOON_ORBIT;
  moonPivot.add(moon);
  const moonHit = new THREE.Mesh(keep(new THREE.SphereGeometry(.9, 12, 8)), keep(new THREE.MeshBasicMaterial({ visible: false })));
  moon.add(moonHit);
  const moonRing = new THREE.Mesh(keep(new THREE.RingGeometry(MOON_ORBIT - .015, MOON_ORBIT + .015, 96)), keep(new THREE.MeshBasicMaterial({ color: 0xc9d6ff, transparent: true, opacity: .22, side: THREE.DoubleSide, depthWrite: false })));
  moonRing.rotation.x = -Math.PI / 2;
  earth.add(moonRing);

  // Stations: faint ghost Earths with parallel axes and glowing landing rings.
  const stations = SEASONS.map((season, i) => {
    const group = new THREE.Group();
    orbitPoint(i * Math.PI / 2, group.position);
    const ring = new THREE.Mesh(keep(new THREE.TorusGeometry(R_EARTH * 1.25, .05, 8, 64)), keep(new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: .55 })));
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
    const ghostTilt = new THREE.Group();
    ghostTilt.rotation.z = -TILT;
    ghostTilt.add(new THREE.Mesh(keep(new THREE.SphereGeometry(R_EARTH, 24, 16)), keep(new THREE.MeshBasicMaterial({ color: 0x9cc4ff, transparent: true, opacity: .1, depthWrite: false }))));
    ghostTilt.add(new THREE.Mesh(keep(new THREE.CylinderGeometry(.025, .025, R_EARTH * 2 + 1.5, 6)), keep(new THREE.MeshBasicMaterial({ color: 0xffe9a8, transparent: true, opacity: .35 }))));
    group.add(ghostTilt);
    const hit = new THREE.Mesh(keep(new THREE.CylinderGeometry(R_EARTH * 1.7, R_EARTH * 1.7, .4, 20)), keep(new THREE.MeshBasicMaterial({ visible: false })));
    hit.userData.station = i;
    group.add(hit);
    group.visible = false;
    scene.add(group);
    return { group, ring, hit, season };
  });

  // Characters stand on the globe (2D picture-book sprites, always upright on the ground).
  const people = new THREE.Group();
  scene.add(people);
  const stander = (width, height) => {
    const geometry = keep(new THREE.PlaneGeometry(width, height));
    geometry.translate(0, height / 2, 0);
    const material = keep(new THREE.MeshBasicMaterial({ transparent: true, alphaTest: .08, side: THREE.DoubleSide }));
    const mesh = new THREE.Mesh(geometry, material);
    people.add(mesh);
    return mesh;
  };
  const sisiAwake = texture('models/characters/sisi/poster.png');
  const sisiAsleep = texture('models/characters/sisi/film-sleep.png');
  const sisi = stander(1.45, 1.45);
  sisi.material.map = sisiAwake;
  const looks = { winter: texture('art/book/space-winter.png'), summer: texture('art/book/space-summer.png') };
  const plain = keep(new THREE.CanvasTexture(document.createElement('canvas')));
  plain.colorSpace = THREE.SRGBColorSpace;
  let plainUrl = '';
  {
    const [aava, loikka] = ['characters/aava/idle.png', 'characters/loikka/idle.png'].map(path => {
      const image = new Image(); image.src = options.assets(path); return image;
    });
    let loaded = 0;
    const draw = () => {
      if (++loaded < 2) return;
      const c = plain.image; c.width = 512; c.height = 300;
      const g = c.getContext('2d');
      g.drawImage(aava, 10, 20, 250, 250); g.drawImage(loikka, 250, 20, 250, 250);
      plain.needsUpdate = true;
      plainUrl = c.toDataURL('image/png');
      if (card.dataset.season === 'spring' || card.dataset.season === 'autumn') cardImage.src = plainUrl;
    };
    aava.onload = draw; loikka.onload = draw;
  }
  looks.spring = plain; looks.autumn = plain;
  const friends = stander(1.25, 1.05);
  friends.material.map = looks.summer;
  const zzz = [0, 1, 2].map(i => {
    const sprite = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: keep(letterTexture(i === 1 ? 'Z' : 'z')), transparent: true, depthWrite: false })));
    sprite.scale.setScalar(.32);
    people.add(sprite);
    return sprite;
  });

  // Aava and Loikka's rocket.
  const rocketMaterial = keep(new THREE.SpriteMaterial({ map: texture('art/book/space-rocket.png'), transparent: true }));
  const rocket = new THREE.Sprite(rocketMaterial);
  rocket.scale.set(.95, 1.17, 1);
  scene.add(rocket);
  const flame = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: keep(glowTexture([[0, 'rgba(255,220,140,.9)'], [.4, 'rgba(255,140,50,.35)'], [1, 'rgba(255,90,20,0)']])), blending: THREE.AdditiveBlending, depthWrite: false })));
  flame.scale.setScalar(.6);
  scene.add(flame);

  // DOM overlays.
  const el = (tag, className, text) => { const node = document.createElement(tag); node.className = className; if (text) node.textContent = text; host.append(node); return node; };
  const hint = el('p', 'space-hint');
  el('p', 'space-badge', 'Ei mittakaavassa');
  const label = el('p', 'space-label');
  const card = el('figure', 'space-card');
  const cardImage = document.createElement('img'); cardImage.alt = '';
  const cardCaption = document.createElement('figcaption');
  card.append(cardImage, cardCaption);
  const controls = el('div', 'space-ctl');
  const button = (text, aria, onClick) => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = text; b.setAttribute('aria-label', aria);
    b.addEventListener('click', onClick); controls.append(b); return b;
  };
  const back = button('◀', 'Taaksepäin', () => step(-1));
  const forth = button('▶', 'Eteenpäin', () => step(1));

  // State.
  let view = 'system', target = '', armed, answered = false;
  let theta = Math.PI * .72, phi = 0, phiGoal, moonAngle = .6;
  /** In a season try: the station the Earth started from and whether the learner has moved it since. */
  let startStation = 0, moved = false;
  let glide; // { from, to, t, length, done }
  let selected = 'earth', rocketAngle = 0, transfer; // { t, from: Vector3 }
  let zoom = 1, restTimer = 0, lastHint = '', sleeping = false, revealing = false;
  let currentSeason = '';
  let width = 1, height = 1;
  const camGoal = new THREE.Vector3(), lookGoal = new THREE.Vector3();
  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3(), tmp3 = new THREE.Vector3(), basis = new THREE.Matrix4();
  const sunDirOf = (point, out = new THREE.Vector3()) => out.copy(point).multiplyScalar(-1).normalize();

  const BODY = {
    sun: { text: 'Aurinko on tähti. Se on noin 109 kertaa Maata leveämpi.', radius: R_SUN + 1.15, object: sunBall },
    earth: { text: 'Maa kiertää Aurinkoa kerran vuodessa.', radius: R_EARTH + .85, object: globe },
    moon: { text: 'Kuu kiertää Maata noin kuukaudessa. Se on noin neljäsosa Maan leveydestä.', radius: R_MOON + .7, object: moon },
  };

  function setHint(text, tone = 'info') {
    if (text === lastHint) return;
    lastHint = text;
    hint.textContent = text;
    hint.dataset.tone = tone;
    hint.hidden = !text;
  }

  /** Spin angle that puts the meridian of `point` at noon. */
  function noonSpin() {
    earth.updateMatrixWorld(true);
    const sunDir = sunDirOf(earth.position, tmp);
    const local = tmp2.copy(sunDir).applyQuaternion(tilt.getWorldQuaternion(new THREE.Quaternion()).invert());
    return Math.atan2(-local.z, local.x);
  }

  function seasonAt(angle) {
    const sunDir = sunDirOf(orbitPoint(angle, tmp3), tmp3);
    const lean = NORTH.dot(sunDir);
    if (lean < -.2) return 'winter';
    if (lean > .2) return 'summer';
    return wrap(angle) < Math.PI ? 'spring' : 'autumn';
  }
  const nearestStation = angle => Math.round(wrap(angle) / (Math.PI / 2)) % 4;

  function fitDistance(halfWidth, halfHeight) {
    const v = THREE.MathUtils.degToRad(camera.fov) / 2;
    const h = Math.atan(Math.tan(v) * camera.aspect);
    return Math.max(halfWidth / Math.tan(h), halfHeight / Math.tan(v));
  }

  function show(next) {
    const [name, goal] = next.split(':');
    view = name; target = goal ?? '';
    armed = undefined; answered = false; revealing = false; glide = undefined;
    lastHint = '\u0000';
    phiGoal = undefined;
    const orbitView = name === 'seasons' || name === 'try-season';
    stations.forEach(s => { s.group.visible = orbitView; s.ring.visible = name === 'try-season'; s.hit.visible = name === 'try-season'; });
    controls.hidden = !(name === 'try-season' || name === 'try-spin');
    back.setAttribute('aria-label', name === 'try-spin' ? 'Pyöritä Maata taaksepäin' : 'Siirrä Maata taaksepäin radalla');
    forth.setAttribute('aria-label', name === 'try-spin' ? 'Pyöritä Maata eteenpäin' : 'Siirrä Maata eteenpäin radalla');
    card.hidden = !orbitView;
    label.hidden = true;
    moved = false;
    if (name === 'system') { selected = 'earth'; setHint('Napauta Aurinkoa, Maata tai Kuuta.'); }
    else if (name === 'day') setHint('');
    else if (name === 'seasons') setHint('');
    else if (name === 'try-season') {
      // Start from the opposite season so the change is easy to see.
      // Jump there at once: a glide from the previous view could pass the answer season on the way.
      startStation = SEASONS.indexOf(target === 'winter' ? 'summer' : 'winter');
      theta = startStation * Math.PI / 2;
      earth.position.copy(orbitPoint(theta, tmp));
      setHint('Vedä Maata radalla tai napauta rengasta.');
    } else if (name === 'try-spin') {
      glide = undefined;
      theta = Math.PI / 2;
      earth.position.copy(orbitPoint(theta, tmp));
      // Sisi starts in the afternoon light, on the side the camera sees.
      phi = noonSpin() + SISI_AFTERNOON;
      setHint('Vedä Maata sivulle tai käytä nuolia.');
    }
  }

  function goTo(angle) {
    const from = theta, to = from + turn(from, angle);
    glide = { from, to, t: 0, length: reduced ? .01 : Math.min(1.6, .5 + Math.abs(to - from) * .45) };
  }

  function step(direction) {
    if (answered || revealing) return;
    if (view === 'try-season') {
      const at = nearestStation(theta);
      goTo(((at + direction + 4) % 4) * Math.PI / 2);
      moved = true;
      restTimer = 0;
    } else if (view === 'try-spin') {
      phiGoal = (phiGoal ?? phi) + direction * Math.PI / 4;
      moved = true;
      restTimer = 0;
    }
  }

  function arm(next, answer) {
    show(next);
    armed = answer;
    return true;
  }

  function reveal() {
    answered = true; revealing = true;
    if (view === 'try-season') {
      goTo(SEASONS.indexOf(target) * Math.PI / 2);
      // The close-up shows one Earth: the ghosts and rings would only clutter it.
      stations.forEach(s => { s.group.visible = false; });
    }
    if (view === 'try-spin' && !sleeping) phiGoal = phi + turn(phi, noonSpin() + SISI_ASLEEP);
    setHint('');
  }


  function finish(index) { const done = armed; armed = undefined; done?.(index); }

  /**
   * Called every frame in a try. Moving is free: a stop on the goal answers right at once.
   * In a season try, a stop back on the opposite season (where the Earth started) answers wrong,
   * and a stop on spring or autumn only tells what is there.
   */
  function settle(dt) {
    if (!armed || answered || pointer.down || glide) { restTimer = 0; return; }
    restTimer += dt;
    if (view === 'try-season') {
      if (!moved) return;
      const at = nearestStation(theta), season = SEASONS[at];
      if (season === target && restTimer > .35) return finish(at);
      if (at === startStation && restTimer > 1.1) return finish(at);
      if (season !== target && restTimer > .5) setHint(seasonHint(season), 'warn');
    } else if (view === 'try-spin') {
      if (phiGoal !== undefined) { restTimer = 0; return; }
      if (sleeping && restTimer > .4) return finish(SPIN_RIGHT);
      if (!sleeping && restTimer > 1.2 && moved) setHint('Sisi on vielä valossa. Pyöritä lisää.', 'warn');
    }
  }
  function seasonHint(season) {
    if (season === 'summer') return 'Täällä on kesä: pohjoinen kallistuu Aurinkoa kohti.';
    if (season === 'winter') return 'Täällä on talvi: pohjoinen kallistuu poispäin Auringosta.';
    return `Täällä on ${SEASON_FI[season]}: akseli ei kallistu Aurinkoa kohti eikä poispäin. Jatka matkaa.`;
  }

  // Pointer: tap bodies, drag the Earth along the orbit, spin the Earth, pinch or wheel to zoom.
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const pointer = { down: false, id: -1, x: 0, y: 0, moved: 0, mode: '', pinch: 0, zoom0: 1 };
  const touches = new Map();
  function cast(event) {
    const rect = canvas.getBoundingClientRect();
    ndc.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
  }
  function onDown(event) {
    touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (touches.size === 2) {
      const [a, b] = [...touches.values()];
      pointer.pinch = Math.hypot(a.x - b.x, a.y - b.y); pointer.zoom0 = zoom; pointer.mode = 'pinch';
      return;
    }
    pointer.down = true; pointer.id = event.pointerId; pointer.x = event.clientX; pointer.y = event.clientY; pointer.moved = 0; pointer.mode = '';
    canvas.setPointerCapture?.(event.pointerId);
    if (answered || revealing) return;
    cast(event);
    if (view === 'try-season' && raycaster.intersectObject(earthHit, false).length) { pointer.mode = 'orbit'; glide = undefined; }
    else if (view === 'try-spin') { pointer.mode = 'spin'; phiGoal = undefined; }
  }
  function onMove(event) {
    if (touches.has(event.pointerId)) touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointer.mode === 'pinch' && touches.size === 2) {
      const [a, b] = [...touches.values()];
      zoom = THREE.MathUtils.clamp(pointer.zoom0 * pointer.pinch / Math.max(20, Math.hypot(a.x - b.x, a.y - b.y)), .55, 1.6);
      return;
    }
    if (!pointer.down || event.pointerId !== pointer.id) return;
    const dx = event.clientX - pointer.x;
    pointer.moved += Math.abs(dx) + Math.abs(event.clientY - pointer.y);
    pointer.x = event.clientX; pointer.y = event.clientY;
    if (pointer.mode === 'orbit') {
      cast(event);
      if (raycaster.ray.intersectPlane(ground, tmp)) {
        const angle = Math.atan2(-tmp.z, tmp.x);
        theta += turn(theta, angle);
        moved = true;
      }
    } else if (pointer.mode === 'spin') {
      phi += dx * .012;
      if (Math.abs(dx) > 0) moved = true;
    }
  }
  function onUp(event) {
    touches.delete(event.pointerId);
    if (pointer.mode === 'pinch') { if (touches.size === 0) pointer.mode = ''; pointer.down = false; return; }
    if (!pointer.down || event.pointerId !== pointer.id) return;
    pointer.down = false;
    const tap = pointer.moved < 8;
    if (pointer.mode === 'orbit') {
      goTo(nearestStation(theta) * Math.PI / 2);
    } else if (tap && !answered && !revealing) {
      cast(event);
      if (view === 'system') {
        const hits = raycaster.intersectObjects([sunBall, earthHit, moonHit], false);
        const hit = hits[0]?.object;
        if (hit) pick(hit === sunBall ? 'sun' : hit === moonHit ? 'moon' : 'earth');
      } else if (view === 'try-season') {
        const hit = raycaster.intersectObjects(stations.map(s => s.hit), false)[0];
        if (hit) { goTo(hit.object.userData.station * Math.PI / 2); moved = true; }
      }
    }
    pointer.mode = '';
  }
  function onWheel(event) {
    event.preventDefault();
    zoom = THREE.MathUtils.clamp(zoom * (event.deltaY > 0 ? 1.08 : 1 / 1.08), .55, 1.6);
  }
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  function pick(body) {
    if (body === selected && !transfer) return;
    transfer = { t: 0, from: rocket.position.clone() };
    selected = body;
    setHint('');
  }

  function bodyPosition(body, out) {
    if (body === 'sun') return out.set(0, 0, 0);
    if (body === 'moon') return moon.getWorldPosition(out);
    return out.copy(earth.position);
  }

  function place(object, point, lift, alongNormal = true) {
    // Stands `object` on the globe at the local surface `point`, upright and turned towards the camera.
    const surface = globe.localToWorld(tmp.copy(point));
    const normal = tmp2.copy(surface).sub(earth.position).normalize();
    const toCamera = tmp3.copy(camera.position).sub(surface).normalize();
    const facing = toCamera.dot(normal);
    const front = toCamera.addScaledVector(normal, -facing);
    if (front.lengthSq() < 1e-5) front.set(0, 0, 1);
    front.normalize();
    const right = new THREE.Vector3().crossVectors(normal, front).normalize();
    if (alongNormal) {
      basis.makeBasis(right, normal, front);
      object.quaternion.setFromRotationMatrix(basis);
    }
    object.position.copy(surface).addScaledVector(normal, lift);
    return { normal: normal.clone(), facing, light: normal.dot(sunDirOf(earth.position, new THREE.Vector3())) };
  }

  function resize() {
    width = Math.max(1, host.clientWidth); height = Math.max(1, host.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function cameraGoal() {
    const up = tmp.set(0, 1, 0);
    if (view === 'system') {
      // High enough that the near side of the orbit stays in the picture.
      lookGoal.set(0, 0, .8);
      camGoal.set(0, .75, .66).normalize().multiplyScalar(fitDistance(12, 9.6) * 1.12 * zoom).add(lookGoal);
    } else if (view === 'try-season' || view === 'seasons') {
      // The whole orbit from high up: the four ghost Earths show that the axis keeps its direction.
      lookGoal.set(0, 0, view === 'seasons' ? .6 : 0);
      camGoal.set(0, .86, .5).normalize().multiplyScalar(fitDistance(11.6, 10.6) * zoom).add(lookGoal);
    } else sideCamera();
  }

  /**
   * The Sun at one edge, the Earth at the other, seen from the Earth's evening side: the ground turns
   * from the light into the night, and the axis leans towards or away from the Sun in plain view.
   */
  function sideCamera() {
    const up = tmp.set(0, 1, 0);
    const sunDir = sunDirOf(earth.position, tmp2);
    const side = new THREE.Vector3().crossVectors(up, sunDir).normalize();
    lookGoal.copy(earth.position).addScaledVector(sunDir, 2.6);
    camGoal.copy(lookGoal).addScaledVector(side, fitDistance(5, 2.6) * zoom).addScaledVector(up, 1.2);
  }

  let raf = 0, running = true, last = performance.now(), clock = 0;
  function frame(now) {
    raf = 0;
    if (!running) return;
    const dt = Math.min(.05, (now - last) / 1000);
    last = now; clock += dt;
    update(dt);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  function update(dt) {
    const pace = reduced ? .3 : 1;
    // Orbit.
    if (glide) {
      glide.t = Math.min(1, glide.t + dt / glide.length);
      theta = glide.from + (glide.to - glide.from) * ease(glide.t);
      if (glide.t >= 1) glide = undefined;
    } else if (view === 'system') theta += dt * TAU / 48 * pace;
    else if (view === 'seasons') theta += dt * TAU / 18 * pace;
    earth.position.copy(orbitPoint(theta, tmp));
    earthMaterial.uniforms.sunPos.value.set(0, 0, 0);
    // Spin.
    if (view === 'system') phi += dt * TAU / 6 * pace;
    else if (view === 'day') phi += dt * TAU / 9 * pace;
    else if (view === 'seasons' || view === 'try-season') phi += turn(phi, noonSpin()) * Math.min(1, dt * 6);
    if (phiGoal !== undefined) {
      const d = turn(phi, phiGoal);
      phi += d * Math.min(1, dt * (reduced ? 20 : 5));
      if (Math.abs(d) < .01) { phi = phiGoal; phiGoal = undefined; }
    }
    spin.rotation.y = phi;
    // Moon.
    moonAngle += dt * TAU / 11 * pace;
    moonPivot.rotation.y = moonAngle;
    const moonShown = view === 'system';
    moon.visible = moonShown; moonRing.visible = moonShown;
    sunBall.rotation.y += dt * .05;
    sunMaterial.uniforms.time.value = reduced ? 0 : clock;
    corona.material.rotation += dt * .02;
    earth.updateMatrixWorld(true);

    // Camera.
    if (revealing && view === 'try-season' && !glide) sideCamera(); else cameraGoal();
    const k = reduced ? 1 : 1 - Math.exp(-dt * 3.2);
    camera.position.lerp(camGoal, k);
    look.lerp(lookGoal, k);
    camera.lookAt(look);
    camera.updateMatrixWorld();

    // Characters.
    const showSisi = view === 'day' || view === 'try-spin';
    const showFriends = view === 'seasons' || view === 'try-season';
    sisi.visible = showSisi;
    friends.visible = showFriends;
    if (showSisi) {
      const at = place(sisi, SISI_POINT, 0);
      sleeping = at.light < -.3;
      sisi.material.map = sleeping ? sisiAsleep : sisiAwake;
      shade(sisi.material, at.light);
      zzz.forEach((z, i) => {
        z.visible = sleeping && at.facing > -.2;
        const t = (clock * .55 + i / 3) % 1;
        z.position.copy(sisi.position).addScaledVector(at.normal, .85 + t * .9).add(tmp.set(.15 + t * .35, 0, 0).applyQuaternion(camera.quaternion));
        z.material.opacity = Math.sin(t * Math.PI);
      });
    } else zzz.forEach(z => { z.visible = false; });
    if (showFriends) {
      const big = view === 'try-season' ? (revealing ? 1.05 : 1.5) : 1.05;
      friends.scale.setScalar(big);
      const at = place(friends, AL_POINT, 0);
      shade(friends.material, at.light);
      const season = seasonAt(theta);
      if (season !== currentSeason || !friends.material.map) {
        currentSeason = season;
        friends.material.map = looks[season];
        friends.material.needsUpdate = true;
        const extreme = season === 'winter' || season === 'summer';
        const src = extreme ? options.assets(`art/book/space-${season}.png`) : plainUrl;
        if (src) cardImage.src = src;
        card.dataset.season = season;
        cardCaption.textContent = `Aava ja Loikka pohjoisessa: ${SEASON_FI[season]}`;
      }
    }

    // Rocket: orbits the chosen body; flies over when the choice changes.
    const showRocket = view === 'system';
    rocket.visible = showRocket; flame.visible = showRocket;
    if (showRocket) {
      const body = BODY[selected];
      rocketAngle += dt * TAU / 7 * pace;
      const center = bodyPosition(selected, tmp2);
      const goal = tmp3.set(Math.cos(rocketAngle) * body.radius, .35 * Math.sin(rocketAngle * 2), -Math.sin(rocketAngle) * body.radius).add(center);
      const before = rocket.position.clone();
      if (transfer) {
        transfer.t = Math.min(1, transfer.t + dt / (reduced ? .2 : 1.7));
        const e = ease(transfer.t);
        const arc = Math.sin(e * Math.PI) * 2.2;
        rocket.position.copy(transfer.from).lerp(goal, e).add(tmp.set(0, arc, 0));
        if (transfer.t >= 1) transfer = undefined;
      } else rocket.position.copy(goal);
      // Point the nose along the flight on screen.
      const a = before.project(camera), b = rocket.position.clone().project(camera);
      const dx = (b.x - a.x) * width, dy = (b.y - a.y) * height;
      if (Math.hypot(dx, dy) > .01) {
        const angle = Math.atan2(dy, dx);
        rocketMaterial.rotation += turn(rocketMaterial.rotation, angle - THREE.MathUtils.degToRad(58)) * Math.min(1, dt * 8);
      }
      flame.position.copy(rocket.position).add(tmp.set(-Math.cos(rocketMaterial.rotation + THREE.MathUtils.degToRad(58)), -Math.sin(rocketMaterial.rotation + THREE.MathUtils.degToRad(58)), 0).multiplyScalar(.55).applyQuaternion(camera.quaternion));
      flame.material.opacity = .55 + .3 * Math.sin(clock * 30);
      // Label of the chosen body.
      label.hidden = !!transfer;
      if (!transfer) {
        const p = bodyPosition(selected, tmp).clone().project(camera);
        label.textContent = body.text;
        label.style.left = `${THREE.MathUtils.clamp((p.x + 1) / 2 * width, 124, width - 124)}px`;
        label.style.top = `${THREE.MathUtils.clamp((1 - p.y) / 2 * height + (selected === 'sun' ? 70 : 44), 30, height - 30)}px`;
      }
    }

    // Station rings pulse; the one under the Earth lights up.
    if (view === 'try-season') {
      const at = nearestStation(theta);
      stations.forEach((s, i) => {
        s.ring.material.opacity = (i === at ? .85 : .4) + .15 * Math.sin(clock * 3 + i);
      });
    }
    settle(dt);
  }

  function shade(material, light) {
    // Night side: the sprite dims to blue, so it reads as night.
    const day = THREE.MathUtils.smoothstep(light, -.15, .12);
    material.color.setRGB(.36 + .64 * day, .42 + .58 * day, .62 + .38 * day);
  }

  resize();
  // The book lays the page out after mounting the stage: follow the host's real size.
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(() => resize()) : undefined;
  observer?.observe(host);
  show('system');
  camera.position.copy(camGoal.lengthSq() ? camGoal : camera.position);
  raf = requestAnimationFrame(frame);

  const api = {
    show,
    arm,
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
      canvas.removeEventListener('wheel', onWheel);
      for (const thing of disposables) thing.dispose?.();
      renderer.dispose();
      renderer.forceContextLoss();
      host.replaceChildren();
      host.classList.remove('space-stage');
    },
    /** For tests: the season the Earth is in and whether Sisi sleeps. */
    debug: () => {
      const p = earth.position.clone().project(camera);
      return { view, season: SEASONS[nearestStation(theta)], seasonNow: seasonAt(theta), sleeping, armed: !!armed, answered,
        earthOnScreen: [Math.round((p.x + 1) / 2 * width), Math.round((1 - p.y) / 2 * height)], size: [width, height], theta, phi };
    },
  };
  // Browser tests and QA read the stage state from its host element.
  host.spaceStage = api;
  return api;
}
