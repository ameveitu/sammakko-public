import * as THREE from 'three';
function shape(parent, name, geometry, color, xyz, options = {}) {
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: .7, ...options })); mesh.name = name; mesh.position.set(...xyz); parent.add(mesh); return mesh;
}
function text(parent, name, value, xyz, width = 1) {
  if (typeof document === 'undefined') return;
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 112;
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  ctx.fillStyle = '#f3edcf'; ctx.fillRect(0, 0, 512, 112); ctx.fillStyle = '#214c41'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = 'bold 32px sans-serif';
  ctx.fillText(value.length > 34 ? `${value.slice(0, 32)}…` : value, 256, 56, 490);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), depthWrite: false }));
  sprite.name = name; sprite.position.set(...xyz); sprite.scale.set(width, width * 112 / 512, 1); parent.add(sprite);
}
function line(parent, name, points, color, y = 0) {
  if (points.length < 2) return;
  const geometry = new THREE.BufferGeometry().setFromPoints(points.map(([x, z, h = 0]) => new THREE.Vector3(x, y + h, z)));
  const l = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color })); l.name = name; parent.add(l); return l;
}
const lagoon = 0x6aa6a8, sand = 0xd9c79a, wood = 0x9b7a51, leaf = 0x6f9c62, accent = 0xc4572c;

function experiment(group, model) {
  shape(group, 'lagoon-tank', new THREE.BoxGeometry(4.4, .12, 2.6), model.apparatus === 'shadow' || model.apparatus === 'absorb' ? sand : lagoon, [0, .36, 0], { transparent: true, opacity: .9 });
  const all = model.trials.flatMap(t => [...t.records, ...(t.observed ? [t.observed] : [])]);
  const span = Math.max(1e-6, ...all.map(r => Math.max(Math.abs(r.x), Math.abs(r.y)))), scale = 3.2 / span;
  const lanes = [];
  model.trials.forEach((trial, i) => {
    const lane = new THREE.Group(); lane.name = `trial:${trial.id}`; lane.position.set(-1.8, .44, (i - .5) * 1.2); group.add(lane);
    shape(lane, 'start-post', new THREE.CylinderGeometry(.04, .04, .32, 8), wood, [0, .16, 0]);
    text(lane, `trial-label:${trial.id}`, `Koe ${trial.id} · toisto ${trial.repeat}`, [.2, .55, 0], 1.1);
    const latest = trial.observed ?? trial.records.at(-1) ?? null;
    const at = latest ? [latest.x * scale, -latest.y * scale] : [0, 0];
    let object = null;
    if (trial.placed || latest) {
      const piece = new THREE.Group(); piece.name = `placed-object:${model.apparatus}`; piece.position.set(at[0], 0, at[1]); lane.add(piece); object = piece;
      if (model.apparatus === 'sail') { shape(piece, 'raft', new THREE.BoxGeometry(.34, .06, .2), wood, [0, .03, 0]); shape(piece, 'sail', new THREE.PlaneGeometry(.22, .28 * Math.max(.6, Math.min(1.6, (trial.configuration.area ?? 2) / 2))), 0xf2ead2, [0, .22, 0], { side: THREE.DoubleSide }); }
      else if (model.apparatus === 'wheel') { const wheel = shape(piece, 'water-wheel', new THREE.TorusGeometry(.2, .035, 8, 18), wood, [0, .24, 0]); wheel.rotation.y = Math.PI / 2; wheel.rotation.x = (latest?.quantity ?? 0) * .4; shape(piece, 'gate', new THREE.BoxGeometry(.05, .2, .3), trial.configuration.gate ? leaf : 0x7b6d5c, [-.35, .1, 0]); }
      else if (model.apparatus === 'motion') shape(piece, 'puck', new THREE.CylinderGeometry(.12, .12, .05, 20), trial.configuration.surface === 'rough' ? 0x8c7b63 : 0x4e7f97, [0, .03, 0]);
      else if (model.apparatus === 'shadow') { shape(piece, 'pole', new THREE.CylinderGeometry(.02, .02, .12 * (trial.configuration.height ?? 3), 8), wood, [0, .06 * (trial.configuration.height ?? 3), 0]); shape(piece, 'lamp', new THREE.SphereGeometry(.07, 12, 10), 0xf6d26b, [-.12 * (trial.configuration.lampX ?? 2), .12 * (trial.configuration.lampY ?? 4), 0], { emissive: 0x7a5a10 }); if (latest) shape(piece, 'shadow', new THREE.BoxGeometry(Math.max(.02, latest.quantity * .1), .005, .06), 0x2d342f, [Math.max(.02, latest.quantity * .1) / 2, .005, 0]); }
      else if (model.apparatus === 'absorb') { shape(piece, 'tray', new THREE.BoxGeometry(.5, .04, .36), 0xbfc7c0, [0, .02, 0]); shape(piece, `sample:${trial.configuration.material}`, new THREE.BoxGeometry(.32, .015 + Math.min(.2, (latest?.quantity ?? 0) * .01), .22), { cloth: 0x9bb3d4, paper: 0xeee6cf, plastic: 0xc9e3e1 }[trial.configuration.material] ?? 0xeee6cf, [0, .05, 0]); }
    }
    trial.records.forEach((r, k) => shape(lane, `recorded-reading:${trial.id}${r.repeat}`, new THREE.SphereGeometry(.045, 10, 8), accent, [r.x * scale, .06, -r.y * scale + (k % 2 ? .05 : -.05)]).userData = { repeat: r.repeat, timeS: r.timeS, quantity: r.quantity, unit: r.unit, direction: r.direction });
    if (latest) line(lane, `observed-path:${trial.id}`, [[0, 0], at], 0x284e45, .05);
    lanes.push({ id: trial.id, placed: trial.placed, started: trial.started, timeS: trial.timeS, repeat: trial.repeat, records: trial.records.length, observed: !!trial.observed, object: object?.name ?? null });
  });
  return { lanes };
}

function normalise(points) {
  const xs = points.map(p => p.x), ys = points.map(p => p.y), minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const s = 3.4 / Math.max(1e-6, maxX - minX, maxY - minY);
  return p => [(p.x - (minX + maxX) / 2) * s, (p.y - (minY + maxY) / 2) * s];
}
function modelBoard(group, model) {
  shape(group, 'model-table', new THREE.BoxGeometry(4.3, .12, 2.9), 0xcfbf95, [0, .36, 0]);
  const board = model.board, root = new THREE.Group(); root.name = `model-board:${board.kind}`; root.position.y = .44; group.add(root);
  const testPaths = model.tests.map(t => t.path), info = { cells: 0, links: 0, rays: 0, tests: model.tests.length, observations: model.observations.length };
  const colour = i => [0x2f6fa3, 0xb5524a, 0x5e8d3f, 0x8a5aa8][i % 4];
  if (board.kind === 'terrain') {
    const cells = model.model?.kind === 'terrain' ? model.model.terrain.cells : board.template.cells.map(c => ({ ...c, height: board.fixedHeights.find(f => f.id === c.id)?.height ?? 0, blocked: false }));
    const known = new Set(model.model?.kind === 'terrain' ? cells.map(c => c.id) : board.fixedHeights.map(f => f.id));
    const at = id => { const c = cells.find(x => x.id === id); return c ? [(c.x - (board.template.width - 1) / 2) * .8, (c.y - (board.template.height - 1) / 2) * .8, .1 + c.height * .1] : null; };
    for (const c of cells) {
      const h = .06 + (known.has(c.id) ? c.height : 0) * .1, [x, z] = at(c.id);
      const box = shape(root, `terrain-cell:${c.id}`, new THREE.BoxGeometry(.74, h, .74), c.blocked ? 0x7c807a : known.has(c.id) ? new THREE.Color().setHSL((40 + c.height * 12) / 360, .4, .72 - c.height * .05) : 0xf2ecd6, [x, h / 2, z], { transparent: !known.has(c.id), opacity: known.has(c.id) ? 1 : .55 });
      box.userData = { height: known.has(c.id) ? c.height : null, blocked: c.blocked };
      if (c.blocked) shape(root, `stone:${c.id}`, new THREE.DodecahedronGeometry(.18), 0x6a6e69, [x, h + .15, z]);
      info.cells++;
    }
    testPaths.forEach((p, i) => line(root, `model-test-path:${model.tests[i].observation}`, p.map(at).filter(Boolean).map(([x, z, h]) => [x, z, h + .08]), colour(i)));
  } else if (board.kind === 'channel-map') {
    const place = normalise(board.ports), at = id => { const p = board.ports.find(x => x.id === id); return p ? place(p) : null; };
    for (const p of board.ports) { const [x, z] = place(p); shape(root, `port:${p.id}`, new THREE.CylinderGeometry(.13, .13, .14, 14), board.terminals.includes(p.id) ? 0x4e7f97 : p.id === board.start ? leaf : wood, [x, .07, z]); text(root, `port-label:${p.id}`, p.id, [x, .4, z], .35); }
    if (model.model?.kind === 'channel-map') {
      for (const l of model.model.links) { const a = at(l.from), b = at(l.to); if (a && b) { line(root, `channel-link:${l.from}-${l.to}:${l.when}`, [[...a, .02], [...b, .02]], { open: 0x3f8fb0, closed: 0x9a7b53, new: 0xc4572c }[l.when]); info.links++; } }
      for (const id of model.model.barriers) { const a = at(id); if (a) shape(root, `barrier:${id}`, new THREE.BoxGeometry(.32, .22, .08), 0x6a6e69, [a[0], .11, a[1] + .18]); }
    }
    testPaths.forEach((p, i) => line(root, `model-test-path:${model.tests[i].observation}`, p.map(at).filter(Boolean).map(([x, z]) => [x, z, .2 + i * .04]), colour(i)));
  } else {
    const rays = model.model?.kind === 'shadow-ray' ? model.model.rays : [];
    const cases = board.cases, maxX = Math.max(...cases.map(c => c.lampX), ...board.groundCandidates, 1), maxY = Math.max(...cases.map(c => c.lampY), 1), sx = 3.4 / (maxX + 1), sy = 1.6 / maxY;
    cases.forEach((c, i) => {
      const lane = new THREE.Group(); lane.name = `shadow-case:${c.id}`; lane.position.set(-1.7, 0, (i - (cases.length - 1) / 2) * (2.4 / Math.max(1, cases.length))); root.add(lane);
      shape(lane, 'lamp', new THREE.SphereGeometry(.07, 12, 10), 0xf6d26b, [0, c.lampY * sy, 0], { emissive: 0x7a5a10 });
      shape(lane, 'pole', new THREE.CylinderGeometry(.025, .025, c.poleHeight * sy, 8), wood, [c.lampX * sx, c.poleHeight * sy / 2, 0]);
      const ray = rays.find(r => r.caseId === c.id);
      if (ray) { line(lane, `model-ray:${c.id}`, [[0, 0, c.lampY * sy], [ray.groundX * sx, 0, 0]], 0xd29a2e); shape(lane, `ground-point:${c.id}`, new THREE.CylinderGeometry(.05, .05, .02, 12), accent, [ray.groundX * sx, .01, 0]); info.rays++; }
      text(lane, `case-label:${c.id}`, c.id, [-.25, .3, 0], .35);
    });
  }
  return info;
}

/** Inquiry island apparatus: the learner's own trials or own model, never a target answer. */
export function mountInquiryIslandsStage(parent, model) {
  const group = new THREE.Group(); group.name = 'inquiry-islands-model'; parent.add(group);
  shape(group, 'island-base', new THREE.CylinderGeometry(2.8, 2.95, .2, 36), 0xb9a77d, [0, .2, 0]);
  const details = model.mode === 'experiment' ? experiment(group, model) : modelBoard(group, model);
  text(group, 'inquiry-legend', model.mode === 'experiment' ? (model.locked ? 'Oma koe käynnissä' : 'Suunnitelma ei vielä lukittu') : model.revealed ? `Uusi havainto: ${model.newFeature ?? ''}` : model.locked ? 'Malli lukittu' : 'Oma malli', [0, 1.75, -1.2], 2.2);
  return {
    advanceTime() {},
    snapshot() { return { kind: 'inquiry-islands', mode: model.mode, apparatus: model.apparatus, locked: model.locked, ...(model.mode === 'model' ? { revealed: model.revealed, hasModel: !!model.model } : {}), ...details }; },
    dispose() { group.traverse(o => { o.geometry?.dispose(); if (o.material) { o.material.map?.dispose(); o.material.dispose(); } }); group.removeFromParent(); },
  };
}
