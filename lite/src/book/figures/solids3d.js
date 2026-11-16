import * as THREE from 'three';

/*
 * Book figures drawn in 3D: slowly turning solids with names under them and measures
 * (r, h, s) that follow the turn. Without WebGL the names and the caption still show.
 */

const COLORS = {
  cylinder: 0x3b9fd6, cone: 0xf2a33a, frustum: 0xe0705a, sphere: 0x5cb88a, disc: 0xb9a3e8,
  ellipsoid: 0x7a9fd6, prism3: 0xd9c27a, pyramid4: 0xe98bb8, cube: 0x8fcf5a,
};
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Shared frame: canvas, renderer, lights, resize, a frame loop and full cleanup. */
function mount(host, label, extra, build) {
  host.innerHTML = `<div class="bf3" role="img" aria-label="${esc(label)}"><canvas></canvas>${extra}</div>`;
  const wrap = host.querySelector('.bf3'), canvas = wrap.querySelector('canvas');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch { wrap.dataset.flat = 'true'; return () => {}; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 400 / 170, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb7c7b9, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.9); sun.position.set(3, 6, 5); scene.add(sun);
  const disposables = [];
  const keep = x => { disposables.push(x); return x; };
  const { step, fit, after } = build({ scene, camera, keep, wrap });
  const size = () => {
    const w = canvas.clientWidth || 400, h = canvas.clientHeight || 170;
    renderer.setSize(w, h, false); camera.aspect = w / h; fit(camera.aspect); camera.updateProjectionMatrix();
  };
  const watch = typeof ResizeObserver === 'function' ? new ResizeObserver(size) : undefined;
  watch?.observe(canvas); size();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let frame = 0, stopped = false;
  const t0 = performance.now();
  const draw = now => {
    step(reduced ? 0 : (now - t0) / 1000);
    renderer.render(scene, camera);
    after?.(canvas.clientWidth, canvas.clientHeight);
    if (!reduced && !stopped && canvas.isConnected) frame = requestAnimationFrame(draw);
  };
  frame = requestAnimationFrame(draw);
  return () => { stopped = true; cancelAnimationFrame(frame); watch?.disconnect(); disposables.forEach(x => x.dispose()); renderer.dispose(); };
}

export function solids(o) {
  return host => {
    const n = o.items.length;
    const names = o.items.map(it => `<span${it.mark ? ` data-mark="${it.mark}"` : ''}>${esc(it.name ?? '')}</span>`).join('');
    const extra = `<div class="bf3-labels"></div>${names.replace(/<span><\/span>/g, '') ? `<div class="bf3-names" style="--n:${n}">${names}</div>` : ''}${o.caption ? `<p class="bf3-caption">${esc(o.caption)}</p>` : ''}`;
    return mount(host, o.label, extra, ({ scene, camera, keep, wrap }) => {
      const labelHost = wrap.querySelector('.bf3-labels');
      const gap = 2.5, groups = [], labels = [], waters = [];
      const lineMat = keep(new THREE.LineBasicMaterial({ color: 0x163e46 }));
      const dimMat = keep(new THREE.LineDashedMaterial({ color: 0xc0392b, dashSize: 0.08, gapSize: 0.06 }));
      const addLabel = (parent, at, text) => {
        const anchor = new THREE.Object3D(); anchor.position.set(...at); parent.add(anchor);
        const el = document.createElement('span'); el.textContent = text; labelHost.append(el);
        labels.push({ el, obj: anchor });
      };
      const segment = (parent, a, b) => {
        const g = keep(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]));
        const line = new THREE.Line(g, dimMat); line.computeLineDistances(); parent.add(line);
      };
      const R = 0.8, H = 1.5;
      o.items.forEach((it, i) => {
        const group = new THREE.Group();
        group.position.x = (i - (n - 1) / 2) * gap;
        const see = !!it.ghost || !!it.dims?.radii || it.water !== undefined;
        const mat = keep(new THREE.MeshStandardMaterial({
          color: COLORS[it.kind] ?? 0x8fcf5a, roughness: 0.45, metalness: 0.05,
          transparent: see, opacity: it.ghost || it.water !== undefined ? 0.28 : see ? 0.42 : 1, side: THREE.DoubleSide, depthWrite: !see,
        }));
        let geo;
        switch (it.kind) {
          case 'cylinder': geo = new THREE.CylinderGeometry(R, R, H, 48); break;
          case 'cone': geo = new THREE.ConeGeometry(R, H, 48); break;
          case 'frustum': geo = new THREE.CylinderGeometry(R * 0.45, R, H, 48); break;
          case 'sphere': geo = new THREE.SphereGeometry(0.9, 48, 32); break;
          case 'disc': geo = new THREE.CircleGeometry(0.9, 48); break;
          case 'ellipsoid': geo = new THREE.SphereGeometry(0.6, 40, 28); geo.scale(1, 1.6, 0.8); break;
          case 'prism3': geo = new THREE.CylinderGeometry(R, R, H, 3); break;
          case 'pyramid4': geo = new THREE.ConeGeometry(R * 1.1, H, 4); break;
          default: geo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
        }
        keep(geo);
        const body = new THREE.Group();
        const mesh = new THREE.Mesh(geo, mat);
        if (it.kind === 'disc') { mesh.rotation.x = -0.9; mat.emissive.setHex(0x5b4a9a); mat.emissiveIntensity = 0.45; }
        body.add(mesh);
        if (it.kind !== 'sphere' && it.kind !== 'ellipsoid') {
          const e = new THREE.LineSegments(keep(new THREE.EdgesGeometry(geo, 30)), lineMat); e.rotation.copy(mesh.rotation); body.add(e);
        }
        if (it.lying) body.rotation.z = Math.PI / 2;
        group.add(body);
        const d = it.dims;
        if (d?.r) {
          const y = it.kind === 'cone' || it.kind === 'frustum' ? -H / 2 : it.kind === 'sphere' ? 0 : H / 2, r = it.kind === 'sphere' ? 0.9 : R;
          segment(body, [0, y, 0], [r, y, 0]); addLabel(body, [r / 2, y + 0.16, 0], d.r);
        }
        if (d?.h) {
          const x = it.kind === 'cone' || it.kind === 'pyramid4' ? 0 : R + 0.14;
          // On a cone the height runs inside, so its label sits low and to the other side than the slant's.
          segment(body, [x, -H / 2, 0], [x, H / 2, 0]); addLabel(body, x === 0 ? [-0.3, 0.02, 0] : [x + 0.26, 0, 0], d.h);
        }
        if (d?.s) {
          const len = Math.hypot(H, R), t = 0.62;
          segment(body, [R, -H / 2, 0], [0, H / 2, 0]); addLabel(body, [R * (1 - t) + 0.3 * H / len, -H / 2 + t * H + 0.3 * R / len, 0], d.s);
        }
        if (d?.radii) {
          const r = 0.9;
          segment(body, [0, 0, 0], [r, 0, 0]); segment(body, [0, 0, 0], [0, r, 0]); segment(body, [0, 0, 0], [0, 0, r]);
          addLabel(body, [r / 2, 0.14, 0], 'r'); addLabel(body, [0.14, r / 2, 0], 'r'); addLabel(body, [0, 0.14, r / 2], 'r');
        }
        if (d?.equator) {
          const disc = new THREE.Mesh(keep(new THREE.CircleGeometry(0.9, 48)), keep(new THREE.MeshStandardMaterial({ color: 0xf4c542, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })));
          disc.rotation.x = -Math.PI / 2; body.add(disc); addLabel(group, [0, -1.15, 0], d.equator);
        }
        if (it.water !== undefined) {
          const w = new THREE.Mesh(keep(new THREE.CylinderGeometry(R * 0.96, R * 0.96, 1, 48)), keep(new THREE.MeshStandardMaterial({ color: 0x2f7fd0, transparent: true, opacity: 0.8 })));
          w.scale.y = 0.001; body.add(w); waters.push({ mesh: w, mode: it.water });
        }
        group.rotation.x = 0.32;
        scene.add(group); groups.push(group);
      });
      const v = new THREE.Vector3();
      const base = 2.2 + n * 2.05;
      // Measures stay readable when the solid only sways instead of turning edge-on.
      const sway = o.sway ?? o.items.some(it => it.dims && (it.dims.r || it.dims.h || it.dims.s || it.dims.radii));
      return {
        fit: aspect => { camera.position.set(0, 0.5, base * Math.max(1, 2.35 / aspect) * (n === 1 ? 1.2 : 1)); camera.lookAt(0, 0, 0); },
        step: t => {
          groups.forEach((g, i) => { g.rotation.y = sway ? Math.sin(t * 0.6 + i) * 0.45 + 0.35 : t * 0.45 + i * 0.7 + 0.5; });
          waters.forEach(({ mesh, mode }) => {
            // 'pour3': one cone of water at a time, three cones fill the cylinder, then it starts again.
            const share = mode === 'pour3' ? (t === 0 ? 1 / 3 : Math.min(3, Math.floor((t % 8) / 2.2) + 1) / 3) : mode;
            const level = Math.max(0.001, share) * H;
            mesh.scale.y = t === 0 ? level : mesh.scale.y + (level - mesh.scale.y) * 0.08;
            mesh.position.y = -H / 2 + mesh.scale.y / 2;
          });
        },
        after: (w, h) => {
          for (const { el, obj } of labels) {
            obj.getWorldPosition(v); v.project(camera);
            el.style.transform = `translate(${((v.x + 1) / 2 * w).toFixed(1)}px, ${((1 - v.y) / 2 * h).toFixed(1)}px) translate(-50%, -50%)`;
          }
        },
      };
    });
  };
}

export function unitCubes(o) {
  return host => mount(host, o.label, o.note ? `<p class="bf3-caption">${esc(o.note)}</p>` : '', ({ scene, camera, keep }) => {
    const box = keep(new THREE.BoxGeometry(0.092, 0.092, 0.092));
    const mat = keep(new THREE.MeshStandardMaterial({ color: 0x8fcf5a, roughness: 0.5 }));
    const layers = Math.max(1, Math.min(10, o.layers)), mesh = new THREE.InstancedMesh(box, mat, 100 * layers), m = new THREE.Matrix4();
    let k = 0;
    for (let y = 0; y < layers; y++) for (let x = 0; x < 10; x++) for (let z = 0; z < 10; z++) { m.makeTranslation(x * 0.1 - 0.45, y * 0.1 - 0.45, z * 0.1 - 0.45); mesh.setMatrixAt(k++, m); }
    const g = new THREE.Group(); g.add(mesh);
    g.add(new THREE.LineSegments(keep(new THREE.EdgesGeometry(keep(new THREE.BoxGeometry(1, 1, 1)))), keep(new THREE.LineBasicMaterial({ color: 0x163e46 }))));
    g.rotation.x = 0.5; scene.add(g);
    return {
      fit: aspect => { camera.position.set(0, 0.3, 4.4 * Math.max(1, 2.35 / aspect)); camera.lookAt(0, 0, 0); },
      step: t => { g.rotation.y = 0.6 + Math.sin(t * 0.5) * 0.5; },
    };
  });
}
