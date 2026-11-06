// /saaristo/ — "Saaristo herää": a living evening pond around a Blender-sculpted headland.
// Modules (data-hulluttelu): vesi, ruoho, kaislat, tulikarpaset, kivet, kirjaimet, parvi (WebGPU).
// Sounds (sound.js): effects on interaction; the soundscape is on by default on the homepage (remembered per browser)
// and starts with the first tap or key, as browsers require.
// New experiments register in MODULES and get a checkbox in the lab panel.
import * as THREE from 'three';
import { makeIsland, makeSky, ISLAND_POS } from './island.js';
import { makeWater } from './water.js';
import { makeGrass, makeFireflies } from './grass.js';
import { makeReeds } from './reeds.js';
import { makeStones } from './stones.js';
import { makeParticleText } from './text.js';
import { makeSwarm } from './gpu-swarm.js';
import { makeSound } from './sound.js';

/** Mount the complete Saaristo pond into a bounded host. Publication controls are optional. */
export function mountSaaristo(options) {
const { container, assets = {}, publication = false, reducedMotion, paused = false } = options;
if (!container) throw new Error('Saaristo requires a container');
const root = publication ? document.documentElement : container;
const stage = container;
const scope = publication ? document : container;
const missing = document.createElement('span');
const query = (selector) => scope.querySelector(selector) || (publication ? null : missing);
const queryAll = (selector) => scope.querySelectorAll(selector);
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const calm = () => reducedMotion ?? (reduce.matches || (publication && (new URLSearchParams(location.search).has('calm') || root.classList.contains('calm-chars'))));
const state = { frames: 0, skips: 0, best: 0, throws: 0, gusts: 0, paused, workMode: false, charactersVisible: true, aava: 'float', loikkaPad: 0 };
if (publication) window.__saaristo = state;
const V3 = THREE.Vector3, clamp = THREE.MathUtils.clamp, rnd = (a, b) => a + Math.random() * (b - a);
let disposed = false, raf = 0, controller = new AbortController();
let innerWidth = publication ? window.innerWidth : Math.max(1, container.clientWidth);
let innerHeight = publication ? window.innerHeight : Math.max(1, container.clientHeight);
let devicePixelRatio = window.devicePixelRatio || 1;
const localX = (e) => e.clientX - (publication ? 0 : container.getBoundingClientRect().left);
const localY = (e) => e.clientY - (publication ? 0 : container.getBoundingClientRect().top);
const listen = (target, type, fn, opts = {}) => target?.addEventListener(type, fn, { ...opts, signal: controller.signal });
const timers = new Set();
const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (!disposed) fn(); }, ms); timers.add(id); return id; };
const cancelLater = (id) => { clearTimeout(id); timers.delete(id); };
function fallback(reason) {
  root.dataset.saaristo = 'fallback'; root.dataset.saaristoReason = reason; state.lost = true;
  for (const el of queryAll('[data-throw],[data-loikka-hop],[data-saaristo-pause],[data-saaristo-sound],[data-hulluttelu]')) el.disabled = true;
  const live = query('[data-saaristo-live]');
  if (live) live.textContent = 'Tämä selain näyttää saaren kuvana. Elävä lampi tarvitsee WebGL2-tuen.';
  options.onStatus?.({ status: 'fallback', reason });
}
let renderer;
try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }); if (!renderer.capabilities.isWebGL2) throw new Error('webgl2'); }
catch (e) { renderer?.dispose(); renderer = null; fallback('no-webgl'); }
if (!renderer) return { scene: null, camera: null, state, resize() {}, invalidate() {}, setActivityFocus() {}, setCameraPose() {}, setAtmosphere() {}, setBackdropVisible() {}, renderAt() {}, setWorkMode(value) { state.workMode = !!value; }, setCharactersVisible(value) { state.charactersVisible = !!value; }, advanceTime() {}, setPaused(value) { state.paused = value; }, dispose() { if (disposed) return; disposed = true; controller.abort(); } };
return start();

// A camera-facing character card. Fragments below `uCut` (the waterline) are dropped, so a
// standing pose reads as floating and a dive really goes under. uFlip mirrors the art.
function billboard(map, size) {
  const uniforms = { map: { value: map }, uCut: { value: -10 }, uFlip: { value: 0 } };
  // Opaque pass on purpose: alpha is handled by discard, and the transparent pass would sort
  // the card behind the water plane.
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.ShaderMaterial({
    uniforms,
    vertexShader: 'varying vec2 vUv;varying float vY;void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.);vY=w.y;gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader: /* glsl */`
      uniform sampler2D map;uniform float uCut,uFlip;varying vec2 vUv;varying float vY;
      void main(){
        vec4 c=texture2D(map,vec2(mix(vUv.x,1.-vUv.x,uFlip),vUv.y));
        if(c.a<.4||vY<uCut) discard;
        float wet=smoothstep(.16,0.,vY-uCut);
        gl_FragColor=vec4(mix(c.rgb,c.rgb*vec3(.62,.78,.82),wet*.55),1.);
        #include <colorspace_fragment>
      }`,
  }));
  mesh.userData.u = uniforms;
  return mesh;
}

function start() {
  const narrow = innerWidth < 760;
  renderer.setPixelRatio(Math.min(devicePixelRatio, narrow ? 1.5 : 1.75));
  renderer.setSize(innerWidth, innerHeight);
  renderer.autoClear = false;
  renderer.domElement.className = 'saaristo-canvas';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  if (!publication) { renderer.domElement.style.display = 'block'; renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%'; }
  stage.append(renderer.domElement);
  listen(renderer.domElement, 'webglcontextlost', (e) => { e.preventDefault(); renderer.domElement.style.opacity = '0'; swarm?.dispose(); swarm = null; fallback('context-lost'); });

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 900);
  const sunDir = new V3(0, 0.07, -1).normalize();
  const skyTex = new THREE.TextureLoader().load(`${assets.world ?? '/assets/saaristo'}/sky.webp`, () => { needsFrame = true; if (!disposed) root.dataset.saaristoSky = 'ready'; });
  skyTex.colorSpace = THREE.SRGBColorSpace;
  skyTex.wrapS = THREE.RepeatWrapping;

  const sky = makeSky(skyTex);
  scene.add(sky);
  const hemisphere = new THREE.HemisphereLight(0xffd6b0, 0x1d4a4a, 1.6);
  scene.add(hemisphere);
  const sun = new THREE.DirectionalLight(0xffb070, 2.4);
  sun.position.set(-4, 6, -30); scene.add(sun);
  const fill = new THREE.DirectionalLight(0x9fc4ff, 0.6); fill.position.set(6, 8, 20); scene.add(fill);

  const island = makeIsland();
  scene.add(island.mesh);
  const water = makeWater(renderer, skyTex, sunDir, island.heightAt);
  scene.add(water.mesh, water.pads);
  const grass = makeGrass(island, narrow ? 9000 : 30000);
  scene.add(grass.mesh);
  const reedU = { uTime: grass.uniforms.uTime, uPush: { value: 0 }, uPointer: { value: new V3(1e4, 0, 1e4) } };
  const reeds = makeReeds(island.heightAt, reedU);
  scene.add(reeds.group);
  const flies = makeFireflies(ISLAND_POS, narrow ? 120 : 240);
  scene.add(flies.mesh);
  const backdrop = [sky, island.mesh, water.mesh, water.pads, grass.mesh, reeds.group, flies.mesh];
  const atmospheres = {
    default: { sky: 0xffd6b0, ground: 0x1d4a4a, ambient: 1.6, sun: 0xffb070, sunlight: 2.4, fill: 0x9fc4ff, fillLight: .6, tint: [1,1,1] },
    cool: { sky: 0xd6e7f4, ground: 0x284852, ambient: 1.7, sun: 0xffe1b2, sunlight: 1.85, fill: 0xa9d7ef, fillLight: .7, tint: [.73,.88,1] },
    warm: { sky: 0xffe5c5, ground: 0x425048, ambient: 1.65, sun: 0xffc28b, sunlight: 2.1, fill: 0xb8cbd8, fillLight: .6, tint: [1,.94,.82] },
    twilight: { sky: 0xa0bad8, ground: 0x202f42, ambient: 1.45, sun: 0xf3b3a0, sunlight: 1.65, fill: 0x8cb8e4, fillLight: .8, tint: [.25,.33,.52] },
  };
  let atmosphere = 'default';
  state.atmosphere = atmosphere; state.backdropVisible = true;
  function setAtmosphere(preset) {
    if (disposed || !Object.hasOwn(atmospheres,preset) || atmosphere === preset) return;
    const values=atmospheres[preset]; atmosphere=preset; state.atmosphere=preset;
    hemisphere.color.setHex(values.sky); hemisphere.groundColor.setHex(values.ground); hemisphere.intensity=values.ambient;
    sun.color.setHex(values.sun); sun.intensity=values.sunlight; fill.color.setHex(values.fill); fill.intensity=values.fillLight;
    sky.material.uniforms.uSkyTint.value.set(...values.tint); water.uniforms.uSkyTint.value.set(...values.tint);
    needsFrame=true;
  }

  // Characters: original approved PNGs, read-only.
  const loader = new THREE.TextureLoader();
  const tex = (p) => { const t = loader.load(p, () => { needsFrame = true; }); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const LT = Object.fromEntries(['idle', 'crouch', 'leap', 'airborne', 'land', 'happy'].map((k) => [k, tex(`${assets.characters ?? "/lite/characters"}/loikka/${k}.png`)]));
  const AT = Object.fromEntries(['idle', 'blink', 'wave', 'curious', 'swim'].map((k) => [k, tex(`${assets.characters ?? "/lite/characters"}/aava/${k}.png`)]));
  const loikka = billboard(LT.idle, 1.15);
  const aava = billboard(AT.idle, 1.5);
  scene.add(loikka, aava);

  const live = query('[data-saaristo-live]');
  const counter = query('[data-skip-count]');
  const bestEl = query('[data-skip-best]');
  const pops = query('[data-saaristo-pops]');
  const project = new V3();
  let lastPop = null;
  function pop(text, world, cls, ms = 1600) {
    if (!pops) return null;
    project.copy(world).project(camera);
    const el = document.createElement('span');
    el.className = 'saaristo-pop' + (cls ? ' ' + cls : '');
    el.textContent = text;
    el.style.left = `${(project.x * 0.5 + 0.5) * innerWidth}px`;
    el.style.top = `${(-project.y * 0.5 + 0.5) * innerHeight}px`;
    pops.append(el);
    el._t = later(() => el.remove(), ms);
    return el;
  }
  // ---- Sound: unlocked by the first gesture; panned by where the thing is on screen.
  const sound = makeSound({ world: assets.world, ambientDefault: publication });
  const panAt = (p) => project.copy(p).project(camera).x;
  Object.defineProperty(state, 'sound', { value: sound.stats });
  const soundBtn = query('[data-saaristo-sound]');
  // While the soundscape waits for the first gesture the button says so (data-waiting).
  const showSound = () => { soundBtn?.setAttribute('aria-pressed', String(sound.ambient)); soundBtn?.toggleAttribute('data-waiting', sound.ambient && !sound.stats.unlocked); };
  for (const ev of ['pointerdown', 'keydown']) listen(publication ? window : container, ev, () => { sound.unlock(); showSound(); }, { capture: true, passive: true });
  if (soundBtn) {
    if (!(window.AudioContext || window.webkitAudioContext)) soundBtn.disabled = true;
    showSound();
    listen(soundBtn, 'click', () => { sound.setAmbient(!sound.ambient); showSound(); });
  }

  const pulse = [0, -50, 0, 0];
  function splashNear(p, power) {
    pulse[0] = p.x; pulse[1] = 0.4; pulse[2] = p.z; pulse[3] = power;
    // Loikka knows how to jump: a stone landing close sends it to another pad.
    if (!hop && p.distanceTo(water.padPos[pad]) < 1.7) { hopNext(true); pop('hups!', loikka.position.clone().setY(1.5), 'is-small', 1200); sound.play('loikka.croak', { x: panAt(loikka.position) }); }
    if (A.mode === 'float' && p.distanceTo(A.pos) < 1.6) { startFly(); sound.play('aava.peep', { x: panAt(A.pos), delay: 0.15 }); }
  }
  const stones = makeStones(scene, water, island.heightAt, {
    onThrow() { state.throws++; counter.textContent = '0'; lastPop = null; sound.play('wind.swish', { gain: 0.3, rate: 1.5, x: -0.3 }); },
    onSkip(n, p) {
      state.skips = n; counter.textContent = String(n); lastPop = pop(String(n), p.clone().setY(0.6), n >= 10 ? 'is-hot' : '', 1300); splashNear(p, 0.6);
      sound.play('water.skip', { x: panAt(p), rate: Math.min(1.5, 0.92 + n * 0.045), gain: 0.9 });
    },
    onEnd(n, where, p) {
      state.skips = n; state.best = Math.max(state.best, n); bestEl.textContent = String(state.best);
      live.textContent = n === 0 ? 'Plumps! Kokeile matalampaa ja nopeampaa heittoa.'
        : `Kivi pomppasi ${n} ${n === 1 ? 'kerran' : 'kertaa'}${where === 'shore' ? ' ja liukui rantaan' : ''}.`;
      if (where === 'sink') { splashNear(p, 1); sound.play('water.dive', { x: panAt(p), gain: 0.8 }); }
      // The last number lingers: it floats up and fades after all the others.
      if (lastPop && n > 0) {
        cancelLater(lastPop._t);
        lastPop.className = 'saaristo-pop is-final' + (n >= 8 ? ' is-big' : '');
        lastPop.textContent = n >= 8 ? `✦ ${n}` : String(n);
        const el = lastPop; el._t = later(() => el.remove(), 3400);
      }
    },
  }, later);

  // Diagnostics step the same stone model without relying on rendering frame rate.
  Object.defineProperty(state, 'advanceStones', { value: (seconds) => {
    if (disposed || !Number.isFinite(seconds)) return;
    let remaining = clamp(seconds, 0, 10);
    while (remaining > 1e-9 && stones.busy()) { const dt = Math.min(remaining, 1 / 60); stones.update(dt); remaining -= dt; }
    needsFrame = true;
  } });
  const headline = query('[data-saaristo-headline]');
  const text = !publication || calm() ? null : makeParticleText(['Pieni oivallus.', 'Suuri seikkailu.'], [[1, 0.84, 0.42], [0.78, 1, 0.56]]);
  function layoutText(scatter) {
    if (!text) return;
    const r = headline.getBoundingClientRect();
    text.layout({ left: r.left, top: r.top + scrollY, width: Math.min(r.width, innerWidth - r.left - 16) }, renderer.getPixelRatio(), scatter);
  }
  if (text) { root.dataset.saaristoText = 'particles'; layoutText(true); }

  // WebGPU swarm, started asynchronously; its checkbox stays disabled where WebGPU is missing.
  let swarm = null, swarmOn = true;
  const swarmBox = query('[data-hulluttelu="parvi"]');
  const swarmNote = query('[data-parvi-note]');
  if (swarmBox) swarmBox.disabled = true;
  if (!calm()) {
    makeSwarm(narrow ? 16384 : 65536, new V3(ISLAND_POS.x - 2, 1.6, ISLAND_POS.z + 3)).then((s) => {
      if (!s) throw new Error('none');
      if (disposed || state.lost) { s.dispose(); return; }
      swarm = s; stage.append(s.canvas); if (!publication) Object.assign(s.canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none' }); sizeSwarm();
      root.dataset.saaristoParvi = String(s.count);
      if (swarmBox) swarmBox.disabled = false;
      if (swarmNote) swarmNote.textContent = `${s.count.toLocaleString('fi-FI')} tulikärpästä laskee WebGPU:n laskentavarjostin.`;
    }).catch(() => {
      if (disposed) return;
      root.dataset.saaristoParvi = 'off';
      if (swarmBox) swarmBox.checked = false;
      if (swarmNote) swarmNote.textContent = 'Tämä selain ei tue WebGPU:ta, joten parvi jää lepäämään.';
    });
  } else root.dataset.saaristoParvi = 'off';
  function sizeSwarm() { if (swarm) swarm.resize(renderer.domElement.width, renderer.domElement.height); }
  // Test hook (not enumerable, so the state still serialises): how far the cloud is from a line.
  Object.defineProperty(state, 'swarmShape', { value: () => (swarm ? swarm.shape() : Promise.resolve(null)) });

  const MODULES = {
    vesi: (on) => { water.uniforms.uSimOn.value = on && water.ok ? 1 : 0; water.pads.visible = on; },
    ruoho: (on) => { grass.mesh.visible = on; },
    kaislat: (on) => { reeds.group.visible = on; },
    tulikarpaset: (on) => { flies.mesh.visible = on; },
    kivet: (on) => { query('[data-throw]').disabled = !on; state.stonesOff = !on; zone?.classList.toggle('is-off', !on); },
    kirjaimet: (on) => { if (text) { text.scene.visible = on; root.dataset.saaristoText = on ? 'particles' : 'plain'; } },
    parvi: (on) => { swarmOn = on; if (swarm) { swarm.canvas.style.display = on ? '' : 'none'; if (!on) swarm.clear(); } },
  };
  for (const input of queryAll('[data-hulluttelu]')) {
    const name = input.dataset.hulluttelu;
    if (!MODULES[name]) { input.disabled = true; continue; }
    listen(input, 'change', () => { MODULES[name](input.checked); needsFrame = true; });
  }

  // ---- Pointer: ripples, grass and reeds part, letters scatter, characters react, swipe to throw.
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new V3(0, 1, 0), 0), hit = new V3();
  const attr = [0, 2, 0, 0], attrPos = new V3();
  let last = new V3(1e4, 0, 1e4), swipe = null, pushTarget = 0, drag = false, attrTarget = 0;
  // A fast sweep of the pointer is a gust: it scatters the swarm and bends the reeds.
  const gust = { pos: [0, -50, 0, 0], dir: [0, 0, 0, 3], scatter: 0 };
  let prevMove = null, lastGust = 0;
  function gustAt(p, e) {
    const now = performance.now(), pm = prevMove;
    prevMove = { x: localX(e), y: localY(e), t: now, p: p.clone() };
    if (!pm || now - pm.t > 120) return;
    const pxs = Math.hypot(localX(e) - pm.x, localY(e) - pm.y) / Math.max(8, now - pm.t) * 1000;
    const d = p.clone().sub(pm.p).setY(0);
    if (pxs < 1300 || d.lengthSq() < 1e-4) return;
    d.normalize();
    const s = Math.min(1, 0.35 + (pxs - 1300) / 2500);
    if (s >= gust.pos[3]) { gust.pos = [p.x, 1.4, p.z, s]; gust.dir = [d.x, 0.25, d.z, 3 + s * 4]; }
    gust.scatter = Math.max(gust.scatter, s);
    if (now - lastGust > 400) { state.gusts++; lastGust = now; sound.gust(s, (localX(e) / innerWidth) * 2 - 1); }
  }
  const zone = query('[data-throwzone]');
  const throwReady = () => !publication || scrollY > innerHeight * 0.3;
  const onUi = (e) => e.target.closest('a,button,input,label,summary,.saaristo-panel');
  function aim(e) { ndc.set((localX(e) / innerWidth) * 2 - 1, -(localY(e) / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); }
  function waterHit(e) { aim(e); return ray.ray.intersectPlane(plane, hit) && hit.distanceTo(camera.position) < 60 ? hit : null; }
  listen(publication ? window : container, 'pointermove', (e) => {
    if (!publication && !options.interactive) return;
    parT.set(localX(e) / innerWidth - 0.5, localY(e) / innerHeight - 0.5);
    if (text) { text.pointer.x = localX(e); text.pointer.y = localY(e); text.pointer.power = 1; }
    if (calm()) return;
    if (drag) { const h = waterHit(e); if (h) A.target = clampRegion(h.clone()); return; }
    aim(e);
    const hits = ray.intersectObject(island.mesh, false);
    if (hits.length) { grass.uniforms.uPointer.value.copy(hits[0].point); pushTarget = 1; attrPos.copy(hits[0].point).setY(hits[0].point.y + 1.2); attrTarget = 1; gustAt(hits[0].point, e); return; }
    pushTarget = 0;
    if (ray.ray.intersectPlane(plane, hit) && hit.distanceTo(camera.position) < 45) {
      reedU.uPointer.value.copy(hit); attrPos.copy(hit).setY(1.2); attrTarget = 1; gustAt(hit, e);
      if (hit.distanceTo(last) > 0.35) { water.drop(hit.x, hit.z, 0.28, 0.07); last.copy(hit); }
    }
  }, { passive: true });
  listen(publication ? window : container, 'pointerleave', () => { pushTarget = 0; attrTarget = 0; if (text) text.pointer.power = 0; });
  listen(publication ? window : container, 'pointerdown', (e) => {
    if (!publication && !options.interactive) return;
    if (onUi(e) || calm()) return;
    aim(e);
    const ch = ray.intersectObjects([aava, loikka, water.pads], false)[0];
    if (ch?.object === aava && A.mode === 'float') { drag = true; A.mode = 'drag'; state.aava = 'drag'; swipe = null; sound.play('aava.peep', { x: panAt(A.pos) }); return; }
    if (ch?.object === loikka) { if (!hop) { hopTo(pad, true); sound.play('loikka.joy', { x: panAt(loikka.position) }); } return; }
    if (ch?.object === water.pads && ch.instanceId !== undefined) { if (!hop && ch.instanceId !== pad && padClear(ch.instanceId)) hopTo(ch.instanceId); return; }
    const fromZone = !!e.target.closest('[data-throwzone]');
    if (e.pointerType !== 'mouse' && !fromZone) return; // touch elsewhere scrolls the page
    if (fromZone) zone.setPointerCapture?.(e.pointerId);
    swipe = { x: localX(e), y: localY(e), t: performance.now(), zone: fromZone };
  });
  listen(publication ? window : container, 'pointerup', (e) => {
    if (!publication && !options.interactive) return;
    if (drag) { drag = false; A.mode = 'float'; state.aava = 'float'; A.next = rnd(4, 7); return; }
    if (!swipe || state.stonesOff) { swipe = null; return; }
    const dx = localX(e) - swipe.x, dy = localY(e) - swipe.y, dt = Math.max(60, performance.now() - swipe.t) / 1000, s = swipe;
    swipe = null;
    if (dy > -40) { // a tap: a ring where you tapped, and Aava paddles over to look
      const h = waterHit(e);
      if (h) {
        water.drop(h.x, h.z, 0.4, 0.5);
        if (A.mode === 'float' && h.distanceTo(A.pos) < 10) { A.target = clampRegion(h.clone()); A.curious = 1.6; A.speed = 1.1; if (Math.random() < 0.5) sound.play('aava.peep', { x: panAt(A.pos), delay: 0.2 }); }
      }
      return;
    }
    if (!throwReady()) return; // the first screen is for reading: stones fly once the visitor scrolls toward the shore
    const speed = clamp(Math.hypot(dx, dy) / dt * 0.014, 5, 28);
    const flat = clamp(0.05 + Math.abs(dx) / (Math.hypot(dx, dy) + 1) * 0.08, 0.04, 0.16);
    throwFrom(Math.atan2(dx, -dy) * 0.6 - (s.zone ? 0.02 : 0.12), speed, flat, s.zone);
  });
  listen(publication ? window : container, 'pointercancel', () => { swipe = null; drag = false; if (A.mode === 'drag') A.mode = 'float'; });
  function throwFrom(a, speed, flat, fromLeft) {
    const dir = new V3(Math.sin(a), 0, -Math.cos(a));
    const side = new V3().setFromMatrixColumn(camera.matrixWorld, 0).setY(0).normalize();
    const from = camera.position.clone().addScaledVector(side, fromLeft ? -2.4 : -0.8).setY(0.95).addScaledVector(dir, 3.5);
    stones.throwStone(from, dir.multiplyScalar(speed).setY(speed * flat));
    needsFrame = true;
  }
  listen(query('[data-throw]'), 'click', () => throwFrom(rnd(-0.42, -0.18), rnd(15, 21), 0.06, false));

  // ---- Loikka hops pad to pad (or to the pad you click), and dodges stones.
  let pad = publication ? 0 : 3, hop = null, nextHop = 2.2;
  state.loikkaPad = pad;
  const padTop = (i) => water.padPos[i].clone().setY(0.52);
  loikka.position.copy(padTop(pad));
  function hopTo(to, happy = false) { hop = { from: padTop(pad), to: padTop(to), t: happy ? 0 : -0.18, idx: to, happy, h: happy ? 0.9 : 1.4 }; nextHop = rnd(4, 7); }
  function hopNext(far = false) {
    let to = pad, best = -1;
    for (let k = 0; k < (far ? 7 : 1); k++) {
      const c = (pad + 1 + Math.floor(Math.random() * (water.padPos.length - 1))) % water.padPos.length;
      if (!padClear(c)) continue;
      const d = water.padPos[c].distanceTo(water.padPos[pad]);
      if (d > best) { best = d; to = c; }
    }
    hopTo(to);
  }
  listen(query('[data-loikka-hop]'), 'click', () => { if (!hop) hopNext(); });

  // ---- Aava: floats (waterline cuts the pose), dives under and resurfaces, or flutters up and away.
  const REGION = { x0: -6.2, x1: 3, z0: -2, z1: 7.5 };
  // While a task table stands in the foreground (activity focus), the characters keep clear of it.
  // Footprint of the expedition platform (centre 0.6, 6.0; 7.6 × 3.6) plus a margin for the sprites.
  const TABLE = { x0: -4.1, x1: 5.3, z0: 3.3, z1: 8.7 };
  const onTable = (p) => !!focus && p.x > TABLE.x0 && p.x < TABLE.x1 && p.z > TABLE.z0 && p.z < TABLE.z1;
  function clampRegion(p) {
    p.x = clamp(p.x, REGION.x0, REGION.x1); p.z = clamp(p.z, REGION.z0, REGION.z1); p.y = 0;
    if (onTable(p)) p.z = TABLE.z0 - 0.2;
    return island.heightAt(p.x, p.z) > -0.35 ? A.pos.clone() : p;
  }
  function randomSpot(nearby) {
    for (let k = 0; k < 20; k++) {
      const p = nearby ? A.pos.clone().add(new V3(rnd(-6, 6), 0, rnd(-4, 4))) : new V3(rnd(REGION.x0, REGION.x1), 0, rnd(REGION.z0, REGION.z1));
      const c = clampRegion(p);
      if (c.distanceTo(A.pos) > 2.5 && !onTable(c) && water.padPos.every((q) => q.distanceTo(c) > 1.1)) return c;
    }
    return onTable(A.pos) ? safeSpot() : A.pos.clone();
  }
  const A = { mode: 'float', t: 0, pos: new V3(-3.4, 0, 5.2), target: null, speed: 0.35, next: rnd(5, 8), blink: 3, curious: 0, flip: 0, from: new V3(), to: new V3(), wake: 0 };
  state.aavaPos = A.pos;
  function safeSpot() {
    for (let k = 0; k < 40; k++) {
      const c = new V3(rnd(REGION.x0, REGION.x1), 0, rnd(REGION.z0, TABLE.z0 - 0.2));
      if (island.heightAt(c.x, c.z) <= -0.35 && water.padPos.every((q) => q.distanceTo(c) > 1.1)) return c;
    }
    return new V3(-1.8, 0, 2.6);
  }
  const padClear = (i) => !onTable(water.padPos[i]);
  /** Moves both characters off the table area at once (also in the still work mode). */
  function clearTable() {
    if (!focus) return;
    if (!padClear(pad) || (hop && !padClear(hop.idx))) {
      const free = water.padPos.map((_, i) => i).filter(padClear);
      if (free.length) { hop = null; pad = free.reduce((a, b) => water.padPos[a].distanceTo(water.padPos[pad]) <= water.padPos[b].distanceTo(water.padPos[pad]) ? a : b); state.loikkaPad = pad; loikka.position.copy(padTop(pad)); }
    }
    if (onTable(A.pos) || (A.target && onTable(A.target)) || ((A.mode === 'fly' || A.mode === 'dive') && onTable(A.to))) {
      if (onTable(A.pos)) A.pos.copy(safeSpot());
      A.mode = 'float'; A.target = null; A.t = 0; state.aava = 'float';
      aava.position.set(A.pos.x, FLOAT, A.pos.z);
    }
  }
  const FLOAT = 0.3, WL = 0.02;
  function startFly(to) { A.mode = 'fly'; A.t = 0; A.flap = 0; A.from.copy(A.pos); A.to.copy(to ?? randomSpot(true)); water.drop(A.pos.x, A.pos.z, 0.5, 0.45); state.aava = 'fly'; sound.play('aava.flutter', { x: panAt(A.pos) }); }
  function startDive() { A.mode = 'dive'; A.t = 0; A.from.copy(A.pos); A.to.copy(randomSpot(true)); water.drop(A.pos.x, A.pos.z, 0.45, 0.5); state.aava = 'dive'; sound.play('water.dive', { x: panAt(A.pos), gain: 0.7 }); }
  function updateAava(dt, t) {
    const u = aava.userData.u;
    A.t += dt;
    let y = FLOAT, tilt = 0, map = AT.idle;
    u.uCut.value = WL;
    aava.visible = true;
    if (A.mode === 'float' || A.mode === 'drag') {
      if (A.mode === 'float') {
        A.next -= dt;
        if (A.next < 0) { A.next = rnd(6, 10); (Math.random() < 0.5 ? startDive : startFly)(); }
        if (!A.target || A.pos.distanceTo(A.target) < 0.2) { A.target = Math.random() < 0.6 ? randomSpot(true) : A.pos.clone(); A.speed = 0.35; }
      }
      const d = (A.target ?? A.pos).clone().sub(A.pos); d.y = 0;
      const sp = A.mode === 'drag' ? 3.5 : A.speed, len = d.length();
      if (len > 0.05 && onTable(A.pos.clone().addScaledVector(d, Math.min(1, (sp * dt + 0.3) / len)))) { A.target = null; }
      else if (len > 0.05) { A.pos.addScaledVector(d, Math.min(1, sp * dt / len)); A.flip = d.x < -0.02 ? 1 : d.x > 0.02 ? 0 : A.flip; A.wake -= dt; if (A.wake < 0) { A.wake = 0.3; water.drop(A.pos.x, A.pos.z, 0.3, 0.06); } }
      y = FLOAT + Math.sin(t * 1.6) * 0.04;
      tilt = Math.sin(t * 1.2) * 0.04;
      A.blink -= dt; A.curious -= dt;
      map = A.mode === 'drag' || A.curious > 0 ? AT.curious : A.blink < 0.14 && A.blink > 0 ? AT.blink : AT.idle;
      if (A.blink < 0) A.blink = rnd(2.5, 5);
    } else if (A.mode === 'dive') {
      map = AT.swim;
      const down = 0.9, under = 1.6, up = 0.7;
      if (A.t < down) { const k = A.t / down; y = FLOAT - k * 1.5; tilt = (A.flip ? 1 : -1) * 0.55; A.pos.x += (A.flip ? -1 : 1) * dt * 0.8; }
      else if (A.t < down + under) {
        aava.visible = false;
        const k = (A.t - down) / under; A.pos.lerpVectors(A.from, A.to, k * k * (3 - 2 * k)); A.flip = A.to.x < A.from.x ? 1 : 0;
        A.wake -= dt; if (A.wake < 0) { A.wake = 0.22; water.drop(A.pos.x, A.pos.z, 0.2, 0.05); }
      } else if (A.t < down + under + up) {
        if (A.t - dt < down + under) {
          water.drop(A.pos.x, A.pos.z, 0.45, 0.45);
          sound.play('water.skip', { x: panAt(A.pos), rate: 0.8, gain: 0.5 });
          if (Math.random() < 0.35) sound.play('aava.peep', { x: panAt(A.pos), delay: 0.35 });
        }
        const k = (A.t - down - under) / up; y = FLOAT - (1 - k) * (1 - k) * 1.3; map = AT.idle;
      } else { A.mode = 'float'; A.target = null; state.aava = 'float'; }
    } else if (A.mode === 'fly') {
      const dur = 1.7, k = Math.min(1, A.t / dur), e = k * k * (3 - 2 * k);
      A.pos.lerpVectors(A.from, A.to, e); A.flip = A.to.x < A.from.x ? 1 : 0;
      y = FLOAT + Math.sin(k * Math.PI) * 2.3;
      u.uCut.value = -10;
      const f = Math.floor(A.t * 10);
      map = f % 2 ? AT.wave : AT.idle;
      // A wing stroke on every other flap frame once the take-off flutter has passed.
      if (f !== A.flap) { A.flap = f; if (f % 2 && A.t > 0.6 && k < 0.9) sound.play('aava.wing', { x: panAt(A.pos), gain: 0.8 }); }
      tilt = (A.flip ? 1 : -1) * Math.cos(k * Math.PI) * 0.18;
      if (k >= 1) { water.drop(A.pos.x, A.pos.z, 0.55, 0.55); A.mode = 'float'; A.target = null; A.next = rnd(6, 10); state.aava = 'float'; sound.play('water.skip', { x: panAt(A.pos), rate: 0.75, gain: 0.6 }); }
    }
    u.map.value = map; u.uFlip.value = A.flip;
    aava.position.set(A.pos.x, y, A.pos.z);
    aava.quaternion.copy(camera.quaternion); aava.rotateZ(tilt);
  }

  // ---- Camera: scroll dives from the overview to the water line; the pointer adds parallax.
  const camA = { p: new V3(0.5, 4.8, 19.5), l: new V3(3.5, 1.0, -4) };
  const camB = { p: new V3(-1.5, 1.35, 15.5), l: new V3(1.5, 0.7, -6) };
  const par = new THREE.Vector2(), parT = new THREE.Vector2(), look = new V3();
  let progress = 0, focus = null, focusMix = 0, cameraPose = null;
  const activityLook = new V3(0.6, 0.7, 6.0), activityPosition = new V3();
  let activitySpan = 10;
  function placeCamera(dt) {
    if (cameraPose) {
      camera.position.fromArray(cameraPose.position); camera.fov=cameraPose.fov;
      camera.updateProjectionMatrix(); camera.lookAt(...cameraPose.target); camera.updateMatrixWorld();
      return;
    }
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    // The camera travels over the first screens only, however long the homepage below grows.
    progress = publication ? clamp(scrollY / Math.min(max * 0.55, innerHeight * 1.8), 0, 1) : 0;
    const e = progress * progress * (3 - 2 * progress);
    camera.position.lerpVectors(camA.p, camB.p, e).add(new V3(par.x * 0.9, -par.y * 0.4, 0));
    look.lerpVectors(camA.l, camB.l, e);
    camera.fov = camera.aspect < 1 ? 62 : 45;
    const desired = focus ? 1 : 0;
    focusMix = (calm() || state.paused || state.workMode) ? desired : focusMix + (desired - focusMix) * Math.min(1, dt * 4);
    if (Math.abs(desired - focusMix) < 0.001) focusMix = desired;
    const distance = clamp(activitySpan / (2 * Math.tan(camera.fov * Math.PI / 360) * camera.aspect), 6, 15);
    activityPosition.copy(activityLook);
    activityPosition.y += distance * 0.53; activityPosition.z += distance * 0.85;
    camera.position.lerp(activityPosition, focusMix);
    look.lerp(activityLook, focusMix);
    camera.updateProjectionMatrix();
    camera.lookAt(look);
    camera.updateMatrixWorld();
    zone?.classList.toggle('is-away', !throwReady() || scrollY > innerHeight * 1.5);
  }

  let needsFrame = true, lastT = performance.now(), acc = 0, t = 0, ambient = 0.8, charactersVisible = true;
  const frameObservers = [];
  Object.defineProperty(state, 'afterNextFrame', { value: (fn) => { if (!disposed) { frameObservers.push(fn); needsFrame = true; } } });
  const voiceNext = { croak: rnd(8, 16), peep: rnd(10, 20) };
  function resize(width = publication ? window.innerWidth : container.clientWidth, height = publication ? window.innerHeight : container.clientHeight, dpr = window.devicePixelRatio || 1) {
    if (disposed) return;
    innerWidth = Math.max(1, width); innerHeight = Math.max(1, height); devicePixelRatio = dpr;
    renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 760 ? 1.5 : 1.75));
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    sizeSwarm();
    layoutText(false);
    needsFrame = true;
  }
  listen(window, 'resize', () => resize());
  // A written explanation or feedback can resize the task surface without resizing
  // the window. Keep the canvas covering its host instead of exposing a blank strip.
  const hostResize = !publication && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => {
    if (!disposed && (container.clientWidth !== innerWidth || container.clientHeight !== innerHeight)) resize();
  }) : null;
  hostResize?.observe(container);
  // The headline can still be settling (web fonts, hero layout) when the pond mounts. Lay the
  // firefly text out again whenever its box changes; the first real layout still flies in.
  const box0 = text ? headline.getBoundingClientRect() : null;
  let textBox = box0 ? `${Math.round(box0.width)}x${Math.round(box0.height)}` : '';
  const headlineResize = text && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => {
    if (disposed) return;
    const r = headline.getBoundingClientRect(), box = `${Math.round(r.width)}x${Math.round(r.height)}`;
    if (box === textBox) return;
    const first = !text.count; textBox = box; layoutText(first); needsFrame = true;
  }) : null;
  headlineResize?.observe(headline);
  listen(window, 'scroll', () => { needsFrame = true; }, { passive: true });
  listen(reduce, 'change', () => { needsFrame = true; });
  listen(document, 'visibilitychange', () => { lastT = performance.now(); });
  const pauseBtn = query('[data-saaristo-pause]');
  listen(pauseBtn, 'click', () => {
    state.paused = !state.paused;
    pauseBtn.setAttribute('aria-pressed', String(state.paused));
    (pauseBtn.querySelector('.saaristo-chip-label') ?? pauseBtn).textContent = state.paused ? 'Jatka liikettä' : 'Pysäytä liike';
    lastT = performance.now(); needsFrame = true;
  });

  function frame(now, forcedDt) {
    if (disposed || state.lost) return;
    if (forcedDt === undefined) raf = requestAnimationFrame(frame);
    const still = state.workMode || (forcedDt === undefined && (calm() || state.paused));
    if (forcedDt === undefined && (document.hidden || (still && !needsFrame && !stones.busy()))) return;
    const dt = forcedDt ?? Math.max(0, Math.min(0.05, (now - lastT) / 1000)); lastT = now;
    needsFrame = false;
    if (!still) {
      t += dt;
      acc += dt;
      let steps = 0;
      while (acc >= 1 / 60 && steps < 4) { water.step(); acc -= 1 / 60; steps++; }
      ambient -= dt;
      if (ambient < 0) { ambient = rnd(0.5, 1.9); water.drop(rnd(-8, 10), rnd(-10, 12), 0.18, 0.08); }
      par.lerp(parT, 0.05);
      nextHop -= dt;
      if (!hop && nextHop < 0) { hopNext(); nextHop = rnd(3, 6); }
      // Now and then the characters speak up on their own.
      voiceNext.croak -= dt; voiceNext.peep -= dt;
      if (voiceNext.croak < 0) { voiceNext.croak = rnd(14, 32); if (!hop) sound.play('loikka.croak', { x: panAt(loikka.position), gain: 0.75 }); }
      if (voiceNext.peep < 0) { voiceNext.peep = rnd(15, 40); if (A.mode === 'float') sound.play('aava.peep', { x: panAt(A.pos), gain: 0.8 }); }
      if (hop) {
        hop.t += dt;
        const k = clamp(hop.t / 0.75, 0, 1);
        if (!hop.pushed && hop.t >= 0) { hop.pushed = true; sound.play('loikka.push', { x: panAt(loikka.position) }); }
        loikka.userData.u.map.value = hop.happy ? LT.happy : hop.t < 0 ? LT.crouch : k < 0.3 ? LT.leap : k < 0.85 ? LT.airborne : LT.land;
        loikka.userData.u.uFlip.value = hop.to.x < hop.from.x - 0.01 ? 1 : 0;
        loikka.position.lerpVectors(hop.from, hop.to, k).setY(0.52 + Math.sin(k * Math.PI) * hop.h);
        if (k >= 1) { water.drop(hop.to.x, hop.to.z, 0.55, 0.35); sound.play('land.wet', { x: panAt(hop.to) }); pad = hop.idx; state.loikkaPad = pad; hop = null; later(() => { if (!hop) loikka.userData.u.map.value = LT.idle; }, 260); }
      } else loikka.position.y = 0.52 + Math.sin(t * 1.3 + pad) * 0.02;
      updateAava(dt, t);
      grass.uniforms.uPush.value += (pushTarget - grass.uniforms.uPush.value) * Math.min(1, dt * 6);
      reedU.uPush.value += (Math.max(attrTarget && !pushTarget ? 1 : 0, gust.pos[3] * 1.6) - reedU.uPush.value) * Math.min(1, dt * 4);
      gust.pos[3] *= Math.pow(0.03, dt); gust.scatter = Math.max(0, gust.scatter - dt / 1.8);
      stones.update(dt);
      if (text) { text.update(dt, scrollY); text.pointer.power *= 0.94; }
    } else if (!state.started) {
      loikka.position.copy(padTop(pad));
      updateAava(0, 0);
    }
    if (still) stones.update(dt);
    state.started = true;
    water.uniforms.uTime.value = grass.uniforms.uTime.value = flies.uniforms.uTime.value = t;
    if (text) { text.uniforms.uTime.value = t; text.uniforms.uOpacity.value = clamp(1 - progress * 2.2, 0, 1); }
    placeCamera(dt);
    loikka.quaternion.copy(camera.quaternion);
    if (!charactersVisible) { loikka.visible = false; aava.visible = false; }
    renderer.clear();
    renderer.render(scene, camera);
    if (text && text.scene.visible && text.uniforms.uOpacity.value > 0) { renderer.clearDepth(); renderer.render(text.scene, text.cam); }
    for (const callback of frameObservers.splice(0)) callback();
    if (swarm && swarmOn && !still) {
      attr[3] += ((attrTarget ? 1 : 0) - attr[3]) * Math.min(1, dt * 2);
      if (attrTarget) { attr[0] = attrPos.x; attr[1] = attrPos.y; attr[2] = attrPos.z; attrTarget *= 0.995; }
      swarm.frame(camera, t, dt, attr, pulse, gust);
      pulse[3] *= Math.pow(0.02, dt);
    }
    state.time = t;
    state.frames++;
    if (state.frames === 1 && !state.lost) root.dataset.saaristo = calm() ? 'static' : 'webgl';
  }
  root.dataset.saaristoWater = water.ok ? 'simulated' : 'flat';
  root.dataset.saaristoGrass = String(grass.count);
  root.dataset.saaristoReeds = String(reeds.count);
  raf = requestAnimationFrame(frame);
  options.onStatus?.({ status: 'ready' });
  return {
    scene, camera, state, resize,
    setCameraPose(pose) {
      if (disposed || publication) return;
      if (pose===null) cameraPose=null;
      else {
        if (![pose.position,pose.target].every(v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite)) || !Number.isFinite(pose.fov) || pose.fov<15 || pose.fov>85) return;
        cameraPose={ position:[...pose.position], target:[...pose.target], fov:pose.fov };
      }
      needsFrame=true;
    },
    setAtmosphere,
    setBackdropVisible(value) { if(disposed||publication)return; state.backdropVisible=!!value; for(const object of backdrop)object.visible=!!value; needsFrame=true; },
    renderAt(seconds) { if(disposed||publication||!state.workMode||!Number.isFinite(seconds)||seconds<0)return; t=seconds; frame(performance.now(),0); },
    setCharactersVisible(value) { if (disposed) return; charactersVisible = !!value; state.charactersVisible = charactersVisible; loikka.visible = charactersVisible; aava.visible = charactersVisible; needsFrame = true; },
    invalidate() { if (!disposed) needsFrame = true; },
    setActivityFocus(on, framing) {
      if (disposed) return;
      focus = !!on;
      clearTable();
      if (framing?.target?.length === 3 && framing.target.every(Number.isFinite)) activityLook.fromArray(framing.target);
      if (Number.isFinite(framing?.span)) activitySpan = clamp(framing.span, 3, 20);
      needsFrame = true;
    },
    advanceTime(ms) {
      if (disposed || state.lost || !Number.isFinite(ms) || ms <= 0) return;
      // Task apparatus has its own bounded clock. A quiet background needs one render,
      // including under the deterministic browser hook, rather than 60 renders per second.
      if (state.workMode) { frame(performance.now(), 0); return; }
      let remaining = Math.min(ms, 10000) / 1000;
      while (remaining > 1e-9) { const dt = Math.min(remaining, 1 / 60); frame(performance.now(), dt); remaining -= dt; }
      lastT = performance.now();
    },
    setPaused(value) { if (disposed) return; state.paused = !!value; lastT = performance.now(); needsFrame = true; },
    setWorkMode(value) { if (disposed) return; state.workMode = !!value; lastT = performance.now(); needsFrame = true; },
    dispose() {
      if (disposed) return;
      disposed = true; hostResize?.disconnect(); headlineResize?.disconnect(); controller.abort(); cancelAnimationFrame(raf); for (const id of timers) clearTimeout(id); timers.clear();
      sound.dispose(); swarm?.dispose(); water.dispose();
      const objects = new Set();
      const disposeValue = (v) => { if (v?.isTexture && !objects.has(v)) { objects.add(v); v.dispose(); } };
      const disposeScene = (s) => s?.traverse((o) => {
        if (o.geometry && !objects.has(o.geometry)) { objects.add(o.geometry); o.geometry.dispose(); }
        for (const m of (Array.isArray(o.material) ? o.material : [o.material])) if (m && !objects.has(m)) {
          objects.add(m); for (const v of Object.values(m)) disposeValue(v); for (const u of Object.values(m.uniforms || {})) disposeValue(u.value); m.dispose();
        }
      });
      disposeScene(scene); disposeScene(text?.scene); for (const v of Object.values(LT)) disposeValue(v); for (const v of Object.values(AT)) disposeValue(v);
      renderer.dispose(); renderer.domElement.remove();
    },
  };
}
}
