import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { mountExpeditionStage } from '../../src/world/expedition-stage';

describe('expedition stage', () => {
  it('withholds force motion until reveal and follows the domain model afterward', () => {
    const scene = new THREE.Scene();
    const invalidate = vi.fn();
    const stage = mountExpeditionStage({ scene, invalidate });
    const track = { kind: 'force-track', title: 'track', vehicle: 'cart', initialSpeed: 2, mass: 2, leftForce: 2, rightForce: 0, seconds: 2 };
    stage.show(track);
    stage.advanceTime(2000);
    expect(stage.snapshot()).not.toHaveProperty('motion');
    stage.show(track, { revealed: true });
    stage.advanceTime(2000);
    expect(stage.snapshot().motion).toEqual({ netForce: -2, acceleration: -1, velocity: 0, displacement: 2 });
    stage.dispose(); stage.dispose();
    expect(scene.children).toHaveLength(0);
    expect(invalidate).toHaveBeenCalled();
  });
});

it('renders filtration without showing the result before reveal and keeps scene ownership', () => {
  const scene = new THREE.Scene();
  const stage = mountExpeditionStage({ scene, invalidate() {} });
  const model = { kind: 'filtration', title: 'filter', poreMicrometers: 60, grainMicrometers: 40, grainName: 'sand', dissolvedSalt: false, view: 'grain' };
  stage.show(model);
  expect(stage.snapshot()).not.toHaveProperty('outcome');
  stage.show(model, { revealed: true });
  expect(stage.snapshot().outcome.grainRetained).toBe(false);
  for (const view of ['macro', 'grain', 'ion']) {
    stage.show({ ...model, view });
    expect(stage.snapshot().view).toBe(view);
  }
  stage.dispose();
  expect(scene.children).toHaveLength(0);
});

it('shows both accepted cake subdivisions and reports physical pieces', () => {
  const scene = new THREE.Scene();
  const stage = mountExpeditionStage({ scene, invalidate() {} });
  const task = { kind: 'cake', family: 'construct-common-unit', shape: 'cake', left: { kept: 1, parts: 2 }, right: { kept: 1, parts: 3 }, subdivisions: [1, 2, 3] };
  const partitions = [
    { source: 'left', denominator: 6, originalSeams: [0, 3, 6], newSeams: [1, 2, 4, 5], pieces: Array.from({ length: 3 }, (_, i) => ({ id: `l${i}`, parentId: 'left-0', from: i, to: i + 1 })) },
    { source: 'right', denominator: 6, originalSeams: [0, 2, 4, 6], newSeams: [1, 3, 5], pieces: Array.from({ length: 2 }, (_, i) => ({ id: `r${i}`, parentId: 'right-0', from: i, to: i + 1 })) },
  ];
  stage.show({ kind: 'cake', task, partitions }, { revealed: true });
  expect(stage.snapshot().partitions).toEqual([
    { source: 'left', denominator: 6, pieceCount: 3, factor: 3 },
    { source: 'right', denominator: 6, pieceCount: 2, factor: 2 },
  ]);
  stage.dispose();
});

it('restores monotonic world marks once, independent of ordering and task clearing', () => {
  const scene = new THREE.Scene();
  const stage = mountExpeditionStage({ scene, invalidate() {} });
  stage.restoreEffects(['island-b', 'island-a', 'island-a']);
  const marks = scene.children[1];
  const positions = Object.fromEntries(marks.children.map((m, i) => [['island-b', 'island-a'][i], m.position.toArray()]));
  stage.clear(); stage.celebrate('island-a'); stage.restoreEffects(['island-a', 'island-b']);
  expect(marks.children).toHaveLength(2);
  expect(stage.snapshot().effects).toEqual(['island-a', 'island-b']);
  stage.dispose();
  const replayScene = new THREE.Scene();
  const replay = mountExpeditionStage({ scene: replayScene, invalidate() {} });
  replay.restoreEffects(['island-a', 'island-b']);
  const replayMarks = replayScene.children[1].children;
  expect(replayMarks[0].position.toArray()).toEqual(positions['island-a']);
  expect(replayMarks[1].position.toArray()).toEqual(positions['island-b']);
  replay.dispose();
  expect(replayScene.children).toHaveLength(0);
});

it('shows corrected inputs while concealing graph and diffusion outcomes until reveal', () => {
  const scene = new THREE.Scene(), stage = mountExpeditionStage({ scene, invalidate() {} });
  const graph = {kind:'system-graph',title:'boards',first:[1,1,12],second:[2,1,17],xMax:12,yMax:16};
  stage.show(graph);
  expect(stage.snapshot()).not.toHaveProperty('solution');
  stage.show(graph,{revealed:true});
  expect(stage.snapshot().solution).toEqual({kind:'unique',x:5,y:7});
  const diffusion = {kind:'diffusion-model',title:'liquid',medium:'liquid',initial:[12,4,0,0],steps:2,accelerated:true};
  stage.show(diffusion);
  expect(stage.snapshot()).not.toHaveProperty('distribution');
  stage.advanceTime(600); expect(stage.snapshot().markedCell).toBe(1);
  stage.advanceTime(600); expect(stage.snapshot().markedCell).toBe(2);
  stage.advanceTime(600); expect(stage.snapshot().markedCell).toBe(1);
  expect(stage.snapshot()).not.toHaveProperty('distribution');
  stage.show(diffusion,{revealed:true});
  expect(stage.snapshot().distribution).toEqual([8.75,5.25,1.75,.25]);
  stage.dispose();
});

it('keeps solar direction and north axis stable in observatory scenes', () => {
  const scene=new THREE.Scene(),stage=mountExpeditionStage({scene,invalidate(){}});
  stage.show({kind:'observatory-day',title:'day',rotation:180,site:'A',siteOffset:0});
  expect(stage.snapshot()).toMatchObject({rotation:180,site:'A',sun:'left'});
  expect(stage.snapshot()).not.toHaveProperty('light');
  stage.show({kind:'observatory-season',title:'summer',latitude:45,month:'june'});
  expect(stage.snapshot()).toMatchObject({axis:'fixed',month:'june'});
  const june=stage.snapshot();
  stage.show({kind:'observatory-season',title:'winter',latitude:45,month:'december'});
  const december=stage.snapshot();
  expect(december.axis).toBe('fixed');
  expect(june.north.dayHours).toBeGreaterThan(december.north.dayHours);
  stage.show({kind:'observatory-near',title:'near',mode:'size',pair:'earth'});
  expect(stage.snapshot().scale).toContain('distance not to scale');
  stage.show({kind:'observatory-near',title:'near',mode:'distance',pair:'earth'});
  expect(stage.snapshot().scale).toContain('marker size enlarged');
  stage.dispose(); expect(scene.children).toHaveLength(0);
});

it('reveals workshop forces from domain inputs only after assessment',()=>{
  const scene=new THREE.Scene(),stage=mountExpeditionStage({scene,invalidate(){}});
  const model={kind:'force-workshop',title:'kitka',body:'laatikko',context:'box',given:'Hihna liikkuu oikealle nopeammin.',inputs:{kind:'friction',relativeSlip:-2}};
  stage.show(model);
  expect(stage.snapshot()).not.toHaveProperty('forces');
  stage.show(model,{revealed:true});
  expect(stage.snapshot().forces).toEqual([{from:'pinta',on:'laatikko',name:'kitka',direction:'right'}]);
  stage.show({...model,primary:'2d'});
  expect(stage.snapshot().primary).toBe('2d');
  expect(stage.snapshot()).not.toHaveProperty('forces');
  stage.dispose();
});


it('animates force and chosen surface only after reveal, with domain values',()=>{
  const scene=new THREE.Scene(), stage=mountExpeditionStage({scene,invalidate(){}});
  const friction={kind:'force-workshop',title:'kitka',body:'laatikko',context:'box',given:'hihna',surfaceOptions:true,surfaceView:'smooth',inputs:{kind:'friction',relativeSlip:-2,massKg:1,surfaceVelocity:3,frictionN:[1,4],durationS:2}};
  stage.show(friction);stage.advanceTime(500);expect(stage.snapshot()).not.toHaveProperty('motion');expect(stage.snapshot().surfaceView).toBe('smooth');
  stage.show(friction,{revealed:true});stage.advanceTime(500);
  expect(stage.snapshot().surfaceView).toBe('rough');
  expect(stage.snapshot().motion).toEqual({relativeVelocity:0,velocity:3,displacement:1,frictionN:0});
  const push={kind:'force-workshop',title:'lautta',body:'lautta',context:'raft',given:'työntö',inputs:{kind:'motion',from:'käsi',netForceN:1,massKg:1,initialVelocity:0,durationS:2}};
  stage.show(push);stage.advanceTime(2000);expect(stage.snapshot()).not.toHaveProperty('motion');
  stage.show(push,{revealed:true});stage.advanceTime(2000);expect(stage.snapshot().motion).toEqual({acceleration:1,velocity:2,displacement:2});
  stage.dispose();
});

it('reveals synchronized winch motion from the domain at each elapsed time', () => {
  const scene=new THREE.Scene(),stage=mountExpeditionStage({scene,invalidate(){}});
  const lifts=[{forceN:10,distanceM:2,durationS:2,direction:'parallel'},{forceN:10,distanceM:2,durationS:4,direction:'parallel'}];
  const model={kind:'work-power',title:'winch',given:'same work',lifts,durationS:4};
  stage.show(model);stage.advanceTime(2000);expect(stage.snapshot()).not.toHaveProperty('results');
  stage.show(model,{revealed:true});stage.advanceTime(2000);
  expect(stage.snapshot().results).toEqual([{workJ:20,powerW:10,positionM:2},{workJ:20,powerW:5,positionM:1}]);
  stage.advanceTime(2000);expect(stage.snapshot().results[1].positionM).toBe(2);
  stage.dispose();expect(scene.children).toHaveLength(0);
});

it('builds real solid meshes, keeps flat silhouettes planar and changes only their presentation', () => {
  const scene = new THREE.Scene(), stage = mountExpeditionStage({ scene, invalidate() {} });
  const model = { kind: 'solid-workshop', title: 'table', view: 'angled', figures: [
    { id: '1', pose: 'horizontal', geometry: { kind: 'cylinder', radius: 3, height: 2 }, marks: [
      { id: 'A', position: [0, -1, 0] }, { id: 'B', position: [0, 1, 0] }, { id: 'C', position: [3, 0, 0] },
    ] },
    { id: '2', pose: 'tilted', geometry: { kind: 'disk', radius: 3 } },
    { id: '3', pose: 'upright', geometry: { kind: 'pyramid', base: [[-3, -2], [3, -2], [2, 2], [-3, 2]], height: 4 } },
  ] };
  stage.show(model);
  const first = stage.snapshot();
  expect(first.figures.map(figure => figure.dimensionality)).toEqual([3, 2, 3]);
  expect(first.figures[0].marked).toEqual(['A', 'B', 'C']);
  const solid = scene.getObjectByName('solid-figure-1').getObjectByName('solid-surface');
  const planar = scene.getObjectByName('solid-figure-2').getObjectByName('solid-surface');
  const pyramid = scene.getObjectByName('solid-figure-3').getObjectByName('solid-surface');
  for (const mesh of [solid, planar, pyramid]) mesh.geometry.computeBoundingBox();
  expect(solid.geometry.boundingBox.max.y - solid.geometry.boundingBox.min.y).toBe(2);
  expect(planar.geometry.boundingBox.max.y - planar.geometry.boundingBox.min.y).toBeCloseTo(0, 8);
  expect(pyramid.geometry.boundingBox.max.y - pyramid.geometry.boundingBox.min.y).toBe(4);
  const dispose = vi.fn(); solid.geometry.addEventListener('dispose', dispose);
  stage.show({ ...model, view: 'ends' });
  expect(dispose).toHaveBeenCalledTimes(1);
  const current = stage.snapshot();
  expect(current.view).toBe('ends');
  expect(current.figures[0].orientation).not.toEqual(first.figures[0].orientation);
  expect(current.figures[0].marked).toEqual(first.figures[0].marked);
  expect(current).not.toHaveProperty('answer');
  stage.dispose();
  expect(scene.children).toHaveLength(0);
});

it('renders reference and learner blocks on separate boards and disposes replaced previews', () => {
  const scene = new THREE.Scene(), stage = mountExpeditionStage({ scene, invalidate() {} });
  const model = { kind: 'solid-construction', title: 'build', grid: [3,2,3], pose: 'upright', view: 'angled',
    referenceCells: [[1,0,1],[1,1,1]], previewCells: [] };
  stage.show(model);
  expect(stage.snapshot().boards.map(board => board.cells.length)).toEqual([2,0]);
  const original = scene.getObjectByName('solid-build-reference').getObjectByName('solid-cell-1-1-1');
  const dispose = vi.fn(); original.geometry.addEventListener('dispose', dispose);
  stage.show({ ...model, view: 'side', previewCells: [[1,0,2]] });
  expect(dispose).toHaveBeenCalledTimes(1);
  expect(stage.snapshot().boards.map(board => board.cells)).toEqual([[[1,0,1],[1,1,1]], [[1,0,2]]]);
  expect(scene.getObjectByName('solid-build-preview').getObjectByName('solid-cell-1-0-2')).toBeTruthy();
  stage.dispose();
  expect(scene.children).toHaveLength(0);
});

it('keeps number-route given coordinates in the fixed compass frame without revealing an answer',async()=>{
 const {routeCellWorld}=await import('../../src/world/number-route-stage');
 expect(routeCellWorld(0,0,5,5)).toEqual({x:-.98,z:-.98});expect(routeCellWorld(4,4,5,5)).toEqual({x:.98,z:.98});
 const scene=new THREE.Scene(),stage=mountExpeditionStage({scene,invalidate(){}});
 stage.show({kind:'number-route',title:'Suunnat',width:5,height:5,origin:{x:1,y:3},heading:'east',frame:'actor'});
 expect(stage.snapshot()).toMatchObject({width:5,height:5,origin:{x:1,y:3},heading:'east',axes:'x-right,y-down',north:'-z'});expect(stage.snapshot()).not.toHaveProperty('answer');expect(stage.snapshot()).not.toHaveProperty('route');
 stage.dispose();expect(scene.children).toHaveLength(0);
});

it('orients the marker in all four compass directions independently of the camera',async()=>{
 const {mountNumberRoute}=await import('../../src/world/number-route-stage');
 for(const [heading,expected] of Object.entries({north:[0,-1],east:[1,0],south:[0,1],west:[-1,0]})){
  const parent=new THREE.Group(),instance=mountNumberRoute(parent,{width:5,height:5,origin:{x:2,y:2},heading,frame:'fixed'});parent.updateMatrixWorld(true);
  const arrow=parent.getObjectByName('number-route-heading'),from=arrow.localToWorld(new THREE.Vector3(0,0,0)),to=arrow.localToWorld(new THREE.Vector3(0,1,0)),direction=to.sub(from).normalize();
  expect(direction.x).toBeCloseTo(expected[0]);expect(direction.z).toBeCloseTo(expected[1]);instance.dispose();expect(parent.children).toHaveLength(0);
 }
});
