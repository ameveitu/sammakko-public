// Stone skipping: tiny ballistic physics. A fast, flat stone bounces off the water; each bounce
// rings the height field, throws a splash and reports its number (1, 2, 3 ...).
import * as THREE from 'three';

const G = 9.81, MAX_SPLASH = 360;

export function makeStones(scene, water, heightAt, events, later = setTimeout) {
  const geo = new THREE.IcosahedronGeometry(0.13, 1).scale(1.35, 0.42, 1);
  const mat = new THREE.MeshStandardMaterial({ color: 0x8d8f86, roughness: 0.6 });
  const stones = [];
  const sp = new Float32Array(MAX_SPLASH * 3), sv = new Float32Array(MAX_SPLASH * 3), life = new Float32Array(MAX_SPLASH);
  const sgeo = new THREE.BufferGeometry();
  sgeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  sgeo.setAttribute('aLife', new THREE.BufferAttribute(life, 1));
  const splash = new THREE.Points(sgeo, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'attribute float aLife;varying float vL;void main(){vL=aLife;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=(aLife>0.?60.:0.)/max(-mv.z,1.);gl_Position=projectionMatrix*mv;}',
    fragmentShader: 'varying float vL;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.1,d)*clamp(vL,0.,1.)*.9;gl_FragColor=vec4(vec3(.85,.95,1.)*a,a);}',
  }));
  splash.frustumCulled = false;
  scene.add(splash);
  let next = 0;
  function burst(x, z, n, power) {
    for (let i = 0; i < n; i++) {
      const k = next++ % MAX_SPLASH, a = Math.random() * Math.PI * 2, s = (0.6 + Math.random()) * power;
      sp.set([x, 0.02, z], k * 3); sv.set([Math.cos(a) * s * 0.6, 1.4 * power + Math.random() * 2 * power, Math.sin(a) * s * 0.6], k * 3); life[k] = 1;
    }
  }

  function throwStone(from, vel) {
    let s = stones.find((o) => !o.active);
    if (!s) { s = { mesh: new THREE.Mesh(geo, mat) }; scene.add(s.mesh); stones.push(s); }
    Object.assign(s, { active: true, sinking: 0, skips: 0, p: from.clone(), v: vel.clone(), spin: 18 + Math.random() * 10 });
    s.mesh.visible = true; s.mesh.position.copy(from);
    events.onThrow?.();
    return s;
  }

  function update(dt) {
    for (const s of stones) {
      if (!s.active) continue;
      if (s.sinking > 0) {
        s.sinking -= dt; s.p.y -= dt * 0.35; s.mesh.position.copy(s.p);
        if (s.sinking <= 0) { s.active = false; s.mesh.visible = false; }
        continue;
      }
      s.v.y -= G * dt; s.p.addScaledVector(s.v, dt);
      s.mesh.rotation.y += s.spin * dt; s.mesh.rotation.z = Math.sin(s.mesh.rotation.y) * 0.08;
      const ground = heightAt(s.p.x, s.p.z);
      if (ground > 0 && s.p.y < ground + 0.04) { // reached the island shore
        s.p.y = ground + 0.04; s.active = false; s.mesh.position.copy(s.p);
        later(() => { s.mesh.visible = false; }, 2500);
        events.onEnd?.(s.skips, 'shore', s.p.clone());
        continue;
      }
      if (s.p.y <= 0 && s.v.y < 0) {
        const hs = Math.hypot(s.v.x, s.v.z), steep = -s.v.y / Math.max(hs, 1e-3);
        if (hs > 2.6 && steep < 0.8) {
          // Faster stones lose less speed per bounce, so a hard flat throw can skip well past ten.
          s.skips++;
          s.p.y = 0.001;
          s.v.y = Math.max(-s.v.y * 0.5, hs * 0.07);
          const keep = 0.8 + 0.11 * THREE.MathUtils.clamp((hs - 6) / 14, 0, 1);
          s.v.x *= keep; s.v.z *= keep;
          water.drop(s.p.x, s.p.z, 0.32, 0.55);
          burst(s.p.x, s.p.z, 14, 1);
          events.onSkip?.(s.skips, s.p.clone());
        } else {
          water.drop(s.p.x, s.p.z, 0.5, 1.1);
          burst(s.p.x, s.p.z, 34, 1.5);
          s.sinking = 1.2;
          events.onEnd?.(s.skips, 'sink', s.p.clone());
        }
      }
      s.mesh.position.copy(s.p);
    }
    for (let k = 0; k < MAX_SPLASH; k++) {
      if (life[k] <= 0) continue;
      life[k] -= dt * 1.3; sv[k * 3 + 1] -= G * dt;
      sp[k * 3] += sv[k * 3] * dt; sp[k * 3 + 1] = Math.max(0, sp[k * 3 + 1] + sv[k * 3 + 1] * dt); sp[k * 3 + 2] += sv[k * 3 + 2] * dt;
      if (sp[k * 3 + 1] <= 0 && sv[k * 3 + 1] < 0) life[k] = 0;
    }
    sgeo.attributes.position.needsUpdate = true; sgeo.attributes.aLife.needsUpdate = true;
  }
  return { throwStone, update, busy: () => stones.some((s) => s.active && !s.sinking) };
}
