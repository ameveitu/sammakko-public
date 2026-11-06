import * as THREE from 'three';

function box(group, name, dimensions, coordinates, color, options = {}) {
  const geometry = new THREE.BoxGeometry(...dimensions);
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: .72, ...options }));
  mesh.position.set(...coordinates);
  mesh.name = name;
  group.add(mesh);
  return mesh;
}

const dockLetters = {
  A: [[-.05, -.055, 0, .057], [0, .057, .05, -.055], [-.027, -.005, .027, -.005]],
  B: [[-.045, -.055, -.045, .055], [-.045, .055, .025, .055], [.025, .055, .048, .027],
    [.048, .027, .018, 0], [.018, 0, -.045, 0], [.018, 0, .052, -.025], [.052, -.025, .028, -.055], [.028, -.055, -.045, -.055]],
  C: [[.045, .055, -.023, .055], [-.023, .055, -.05, .028], [-.05, .028, -.05, -.028],
    [-.05, -.028, -.023, -.055], [-.023, -.055, .045, -.055]],
};

function dockSign(dock, id) {
  box(dock, 'station-sign', [.23, .17, .035], [0, .53, -.15], 0xf0d7a5);
  box(dock, 'station-sign-post', [.038, .20, .04], [0, .39, -.16], 0x654934);
  for (const [x1, y1, x2, y2] of dockLetters[id] ?? []) {
    const segment = box(dock, 'station-letter-stroke', [Math.hypot(x2 - x1, y2 - y1) + .012, .018, .013],
      [(x1 + x2) / 2, .53 + (y1 + y2) / 2, -.128], 0x315650);
    segment.rotation.z = Math.atan2(y2 - y1, x2 - x1);
  }
}

export function drawStatisticsHarbor(parent, model) {
  const map = new THREE.Group();
  map.name = 'observation-harbor-map';
  parent.add(map);
  box(map, 'harbor-water', [4.8, .1, 2.82], [0, .31, 0], 0x568b94, { roughness: .43 });
  model.sites.forEach(site => {
    const dock = new THREE.Group();
    dock.name = `observation-site-${site.id}`;
    dock.position.set(site.x, .37, site.z);
    map.add(dock);
    box(dock, 'shore', [1.13, .13, .62], [0, .02, -.15], 0x98ac7f);
    box(dock, 'pier', [.50, .11, .68], [0, .095, .26], 0xa88358);
    for (const x of [-.20, .20]) {
      box(dock, 'pier-post', [.058, .28, .058], [x, .15, .57], 0x745744);
    }
    box(dock, 'station-foot', [.40, .18, .32], [0, .16, -.20], 0xe5cd9e);
    dockSign(dock, site.id);
    const roofColor = site.active ? 0xdf875c : 0x4e7a72;
    box(dock, 'station-roof', [.48, .10, .40], [0, .30, -.20], roofColor,
      site.active ? { emissive: 0x98502f, emissiveIntensity: .35 } : {});
    for (let i = 0; i < site.planned; i++) {
      const done = i < site.collected;
      box(dock, 'observation-marker', [.14, .08, .19], [-.17 + .17 * i, .185, .38],
        done ? 0x8ccbaa : 0xe7bf81, done ? { emissive: 0x3f8f6d, emissiveIntensity: .30 } : {});
    }
  });
  return { sites: model.sites.map(({ id, label, planned, collected, active }) => ({ id, label, planned, collected, active })) };
}
