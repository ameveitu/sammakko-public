import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { styleCharacter } from './character-style.js';

function release(object) {
  const resources = new Set();
  object?.traverse(child => {
    if (child.geometry) resources.add(child.geometry);
    if (child.skeleton) resources.add(child.skeleton);
    for (const material of (Array.isArray(child.material) ? child.material : [child.material])) {
      if (!material) continue;
      for (const value of Object.values(material)) if (value?.isTexture) resources.add(value);
      resources.add(material);
    }
  });
  for (const resource of resources) { resource.dispose(); resource.source?.data?.close?.(); }
  object?.removeFromParent();
}

/** Candidate-only player: no learner store, scoring, physics, or gameplay side effects. */
export function mountCharacterPreview(world) {
  const holder = new THREE.Group(); holder.name = 'character-review';
  holder.position.set(.6, .52, 6);
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.9, .18, 64), new THREE.MeshStandardMaterial({ color: 0x8c7655, roughness: .95 }));
  floor.position.y = -.09; holder.add(floor);
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.69, 1.72, 64), new THREE.MeshBasicMaterial({ color: 0xf4e5bb, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = .003; holder.add(ring);
  world.scene?.add(holder);
  world.setCharactersVisible(false);
  world.setActivityFocus(true, { target: [.6, 1.6, 6], span: 6 });
  const loader = new GLTFLoader();
  let disposed = false, generation = 0, fetchController, model, mixer, action, clips = [], candidate;
  let status = world.scene ? 'empty' : 'fallback', paused = true, view = 'three-quarter', raf = 0, previous = 0;
  function clear() {
    fetchController?.abort(); fetchController = undefined;
    mixer?.stopAllAction(); if (model) mixer?.uncacheRoot(model);
    release(model); model = mixer = action = undefined; clips = [];
  }
  function turn() {
    if (!model || !candidate) return;
    const angles = { front: 0, 'three-quarter': -.55, side: -Math.PI / 2, back: Math.PI };
    model.rotation.y = candidate.facing + angles[view];
    world.invalidate();
  }
  function frame(now) {
    raf = 0;
    if (disposed || paused || document.hidden || !mixer || world.state.lost) return;
    mixer.update(Math.min(.05, Math.max(0, (now - previous) / 1000)));
    previous = now; world.invalidate(); raf = requestAnimationFrame(frame);
  }
  function schedule() {
    cancelAnimationFrame(raf); raf = 0; previous = performance.now();
    if (!disposed && !paused && !document.hidden && mixer && !world.state.lost) raf = requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange', schedule);
  function setClip(name) {
    const clip = clips.find(value => value.name === name);
    if (disposed || !mixer || !clip) return false;
    mixer.stopAllAction(); mixer.setTime(0);
    action = mixer.clipAction(clip).reset(); action.setLoop(THREE.LoopRepeat, Infinity).play();
    mixer.update(0); world.invalidate(); return true;
  }
  return {
    async load(next, url) {
      if (disposed) return false;
      const token = ++generation;
      clear(); candidate = next; status = world.scene && !world.state.lost ? 'loading' : 'fallback';
      if (status === 'fallback') return false;
      const controller = new AbortController(); fetchController = controller;
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error('asset unavailable');
        const bytes = await response.arrayBuffer();
        if (bytes.byteLength !== next.bytes || bytes.byteLength >= 3_000_000) throw new Error('asset differs from manifest');
        const gltf = await loader.parseAsync(bytes, new URL('.', url).href);
        if (disposed || token !== generation || world.state.lost) { release(gltf.scene); return false; }
        model = styleCharacter(gltf.scene); clips = gltf.animations;
        const bounds = new THREE.Box3().setFromObject(model, true);
        const height = bounds.max.y - bounds.min.y;
        if (!Number.isFinite(height) || height <= 0 || next.clips.some(name => !clips.find(clip => clip.name === name))) throw new Error('invalid model or animation');
        model.scale.multiplyScalar(2.35 / height);
        holder.add(model); model.position.y -= bounds.min.y * (2.35 / height);
        mixer = new THREE.AnimationMixer(model); turn(); setClip('idle');
        status = 'ready'; schedule(); world.invalidate(); return true;
      } catch (error) {
        if (!disposed && token === generation) { clear(); status = error?.name === 'AbortError' ? 'empty' : 'fallback'; world.invalidate(); }
        return false;
      }
    },
    setClip,
    setView(next) { if (!disposed && ['front', 'three-quarter', 'side', 'back'].includes(next)) { view = next; turn(); } },
    setPaused(value) { if (!disposed) { paused = !!value; schedule(); } },
    advanceTime(ms) {
      if (disposed || !mixer || world.state.lost || !Number.isFinite(ms) || ms <= 0) return;
      mixer.update(Math.min(ms, 10_000) / 1000); world.invalidate();
    },
    snapshot() {
      model?.updateMatrixWorld(true);
      const bounds = model ? new THREE.Box3().setFromObject(model, true) : null;
      let bones = 0; model?.traverse(object => { if (object.isBone) bones++; });
      return { status: world.state.lost ? 'fallback' : status, character: candidate?.id ?? null, clip: action?.getClip().name ?? null,
        time: action?.time ?? 0, duration: action?.getClip().duration ?? 0, paused, view,
        bounds: bounds ? { minY: bounds.min.y, maxY: bounds.max.y } : null, bones };
    },
    dispose() {
      if (disposed) return;
      disposed = true; generation++; cancelAnimationFrame(raf); clear();
      document.removeEventListener('visibilitychange', schedule); release(holder);
      world.setCharactersVisible(true);
    },
  };
}
