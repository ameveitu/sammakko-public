import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { mountFamilyWorlds, FAMILY_IMPLEMENTED_EFFECT_IDS } from '../src/world/family-worlds';
import { familyWorldBriefs, familyLeafTreatments, familyWorldRecipes, familyWorldPilots } from '../src/content/family-worlds';
import { readFileSync } from 'node:fs';
import { AUTHORED_CLIMAX_IDS } from '../src/content/authored-climaxes';
import { familyAnchorNodes } from '../src/world/family-worlds/anchors';
import { familyMilieus, milieuAtmosphere } from '../src/world/family-worlds/milieus';

function fixture(options={}) {const scene=new THREE.Scene(),invalidate=vi.fn();return {scene,invalidate,state:{lost:false},...options};}
describe('family environment pilots',()=>{
 it('enters three distinct scenes without touching existing task geometry or camera',()=>{
  const world=fixture(),task=new THREE.Group();task.name='existing-task';world.scene.add(task);
  const handle=mountFamilyWorlds(world);const compositions=[];
  for(const [id,recipe] of Object.entries(familyWorldPilots)){
   const nodeId=recipe.nodeIds[0];
   expect(handle.enter(id,{nodeId,phase:'work'})).toBe(true);
   expect(world.scene.children).toContain(task);
   const state=handle.snapshot();compositions.push(state.composition);
   expect(state.visibleObjects.length).toBe(3);expect(state.renderer).toBe('webgl');
   const root=world.scene.getObjectByName('family-world-pilot');expect(root.children.length).toBeGreaterThan(5);
   let meshes=0,triangles=0;root.traverse(o=>{if(o.isMesh){meshes++;const g=o.geometry;triangles+=(g.index?.count??g.attributes.position.count)/3;}});
   expect(meshes,id).toBeLessThan(100);expect(triangles,id).toBeLessThan(20000);
  }
  expect(new Set(compositions).size).toBe(Object.keys(familyWorldPilots).length);expect(handle.enter('unknown')).toBe(false);expect(handle.enter('LM01',{nodeId:'M-FRAC-01'})).toBe(false);
  handle.dispose();expect(world.scene.children).toEqual([task]);
 });
 it('builds distinct shelter and funnel outcomes without inventing measurements',()=>{
  const world=fixture(),h=mountFamilyWorlds(world);
  for(const [family,node,name] of [['LM14','M-GEO-18','mountain-shelter-roof'],['UM-17','M79-CONE-V','funnel-store']]){
   h.enter(family,{nodeId:node});expect(h.resolve(node,{eventId:`world.${node}.resolved`})).toBe(true);
   const subject=world.scene.getObjectByName(name);expect(subject).toBeTruthy();const before=subject.scale.clone();h.advanceTime(2500);expect(subject.scale.length()).toBeGreaterThan(before.length());
   expect(h.snapshot().modelBoundEffects).not.toContain(`world.${node}.resolved`);
  }
  const roof=world.scene.getObjectByName('mountain-shelter-roof');expect(roof.children).toHaveLength(2);expect(roof.children[0].rotation.z).toBeCloseTo(-roof.children[1].rotation.z);
  const funnel=world.scene.getObjectByName('funnel-store');expect(funnel.geometry.parameters.radiusTop).toBeGreaterThan(funnel.geometry.parameters.radiusBottom);h.dispose();
 });
 it('uses the checked liquid scene height and does not invent a restored fill',()=>{
  const world=fixture(),h=mountFamilyWorlds(world);h.enter('LM18',{nodeId:'M-MEAS-10'});
  const lessonModel={kind:'measurement-station',mode:'liquid',vessel:'flared',fillHeight:.75};expect(h.resolve('M-MEAS-10',{eventId:'world.M-MEAS-10.resolved',lessonModel})).toBe(true);
  const water=world.scene.getObjectByName('observed-fill');expect(h.snapshot().modelBoundEffects).toContain('world.M-MEAS-10.resolved');expect(water.visible).toBe(false);h.advanceTime(2500);expect(water.visible).toBe(true);
  expect(water.geometry.parameters.height).toBeCloseTo(.6);expect(water.geometry.parameters.radiusTop).toBeCloseTo(.385);expect(water.position.y).toBeCloseTo(.41);
  h.restoreEffects([]);h.restoreEffects(['world.M-MEAS-10.resolved']);expect(world.scene.getObjectByName('observed-fill')).toBeUndefined();expect(h.snapshot().modelBoundEffects).toEqual([]);h.dispose();
 });
 it('retains the measured beam position and never invents a past mass reading',()=>{
  const world=fixture(),h=mountFamilyWorlds(world);h.enter('LM18',{nodeId:'M-MEAS-07'});const lessonModel={kind:'measurement-station',mode:'mass',basket:true,loaded:true,display:'beam',needle:.75};
  expect(h.resolve('M-MEAS-07',{eventId:'world.M-MEAS-07.resolved',lessonModel})).toBe(true);expect(world.scene.getObjectByName('mass-beam-mark').position.x).toBeCloseTo(.165);expect(world.scene.getObjectByName('measured-basket')).toBeTruthy();
  h.restoreEffects([]);h.restoreEffects(['world.M-MEAS-07.resolved']);expect(world.scene.getObjectByName('mass-beam-mark')).toBeUndefined();expect(h.snapshot().modelBoundEffects).toEqual([]);h.dispose();
 });
 it('preserves the current cone radius-to-height ratio without restoring invented dimensions',()=>{
  const world=fixture(),h=mountFamilyWorlds(world);h.enter('UM-17',{nodeId:'M79-CONE-V'});
  const lessonModel={kind:'advanced-solids',mode:'measure',figures:[{id:'Ennen',shape:{kind:'cone',base:{kind:'circle',radius:7},height:8}},{id:'Uusi',shape:{kind:'cone',base:{kind:'circle',radius:3},height:8}}]};h.resolve('M79-CONE-V',{eventId:'world.M79-CONE-V.resolved',lessonModel});
  const cone=world.scene.getObjectByName('funnel-store').geometry.parameters;expect(cone.radiusTop/cone.height).toBeCloseTo(3/8);expect(cone.radiusBottom).toBe(0);expect(h.snapshot().modelBoundEffects).toContain('world.M79-CONE-V.resolved');
  h.restoreEffects([]);h.restoreEffects(['world.M79-CONE-V.resolved']);expect(h.snapshot().modelBoundEffects).toEqual([]);h.dispose();
 });
 it('uses the given right-triangle scene endpoints for the rope and hides a missing model',()=>{
  const world=fixture(),h=mountFamilyWorlds(world);h.enter('UM-14',{nodeId:'M79-PYTH-CALC'});const lessonModel={kind:'right-triangle',mode:'rope',right:0,vertices:[[0,0,0],[3,0,0],[0,4,0]]};
  h.resolve('M79-PYTH-CALC',{eventId:'world.M79-PYTH-CALC.resolved',lessonModel});const rope=world.scene.getObjectByName('measured-rope');expect(rope.geometry.parameters.height).toBeCloseTo(1.9);h.advanceTime(2500);expect(rope.scale.y).toBe(1);
  const start=rope.parent.position.clone(),end=new THREE.Vector3(0,rope.geometry.parameters.height,0).applyQuaternion(rope.parent.quaternion).add(start);expect(end.x).toBeCloseTo(0);expect(end.y).toBeCloseTo(1.72);
  h.restoreEffects([]);h.restoreEffects(['world.M79-PYTH-CALC.resolved']);expect(world.scene.getObjectByName('measured-rope')).toBeUndefined();expect(world.scene.getObjectByName('unmeasured-rope-coil')).toBeTruthy();h.dispose();
 });
 it('reproduces the actual construction cells exactly and restores no invented pattern',()=>{
  const world=fixture(),h=mountFamilyWorlds(world);h.enter('LM14',{nodeId:'M-GEO-07'});const cells=[[0,0,0],[1,0,0],[1,1,0],[2,0,2]];
  h.resolve('M-GEO-07',{eventId:'world.M-GEO-07.resolved',lessonModel:{kind:'solid-construction',grid:[3,2,3],previewCells:cells}});h.advanceTime(2500);
  const group=world.scene.getObjectByName('built-cells');expect(group.children.map(c=>c.userData.cell)).toEqual(cells);expect(group.children[2].position.y-group.children[1].position.y).toBeCloseTo(.24);
  h.restoreEffects([]);h.restoreEffects(['world.M-GEO-07.resolved']);expect(world.scene.getObjectByName('built-cells')).toBeUndefined();expect(world.scene.getObjectByName('construction-tools')).toBeTruthy();h.dispose();
 });
 it('draws only the operated water transfers and does not fabricate a restored route',()=>{
  const world=fixture(),h=mountFamilyWorlds(world);h.enter('SCI20',{nodeId:'ENV-CHEM-WATERCYCLE-01'});
  const reservoirs=[{id:'sea',kind:'sea',x:20,y:115},{id:'vapor',kind:'vapor',x:75,y:15},{id:'cloud',kind:'cloud',x:180,y:15},{id:'snow',kind:'snow',x:240,y:40}];
  const transfers=[{from:'sea',to:'vapor'},{from:'vapor',to:'cloud'},{from:'cloud',to:'snow'},{from:'snow',to:'snow'}];h.resolve('ENV-CHEM-WATERCYCLE-01',{eventId:'world.ENV-CHEM-WATERCYCLE-01.resolved',lessonModel:{kind:'matter-cycles',mode:'water-path',locked:true,reservoirs,transfers}});h.advanceTime(2500);
  const route=world.scene.getObjectByName('observed-water-route');expect(route.children.filter(o=>o.userData.from).map(o=>[o.userData.from,o.userData.to])).toEqual([['sea','vapor'],['vapor','cloud'],['cloud','snow'],['snow','snow']]);
  h.restoreEffects([]);h.restoreEffects(['world.ENV-CHEM-WATERCYCLE-01.resolved']);expect(world.scene.getObjectByName('observed-water-route')).toBeUndefined();h.dispose();
 });
 it('preserves the supplied column shape, proportions and observed fill for every supported base',()=>{
  for(const base of [{kind:'circle',radius:2},{kind:'rectangle',width:4,depth:2},{kind:'right-triangle',width:4,depth:2}]){
   const world=fixture(),h=mountFamilyWorlds(world);h.enter('UM-17',{nodeId:'M79-CYL-V'});const lessonModel={kind:'advanced-solids',mode:'measure',demoFill:'layers',fillStep:3,figures:[{id:'Uusi',shape:{kind:'column',base,height:6}}]};h.resolve('M79-CYL-V',{eventId:'world.M79-CYL-V.resolved',lessonModel});h.advanceTime(2500);
   const column=world.scene.getObjectByName('observed-column');column.geometry.computeBoundingBox();const bounds=column.geometry.boundingBox;expect(bounds.max.y-bounds.min.y).toBeCloseTo(.85,5);expect(column.position.y+bounds.min.y).toBeCloseTo(.16,5);
   expect(column.material.color.getHex()).toBe(0x68aead);expect(h.snapshot().modelBoundEffects).toContain('world.M79-CYL-V.resolved');h.restoreEffects([]);h.restoreEffects(['world.M79-CYL-V.resolved']);expect(world.scene.getObjectByName('observed-column')).toBeUndefined();h.dispose();
  }
 });
 it('keeps the two provided sphere radii in proportion and does not restore fabricated sizes',()=>{
  const world=fixture(),h=mountFamilyWorlds(world);h.enter('UM-17',{nodeId:'M79-SPHERE-V'});h.resolve('M79-SPHERE-V',{eventId:'world.M79-SPHERE-V.resolved',lessonModel:{kind:'advanced-solids',mode:'measure',figures:[{id:'Ennen',shape:{kind:'sphere',radius:2}},{id:'Uusi',shape:{kind:'sphere',radius:6}}]}});h.advanceTime(2500);
  const spheres=world.scene.getObjectByName('observed-spheres').children;expect(spheres).toHaveLength(2);expect(spheres[0].scale.x/spheres[1].scale.x).toBeCloseTo(1/3);expect(spheres[0].scale.x).toBeCloseTo(spheres[0].scale.y);
  h.restoreEffects([]);h.restoreEffects(['world.M79-SPHERE-V.resolved']);expect(world.scene.getObjectByName('observed-spheres')).toBeUndefined();h.dispose();
 });
 it('represents the actual full and partial unit cubes without inventing a restored amount',()=>{
  const world=fixture(),h=mountFamilyWorlds(world);h.enter('LM19',{nodeId:'M-UNIT-06'});h.resolve('M-UNIT-06',{eventId:'world.M-UNIT-06.resolved',lessonModel:{kind:'measurement-station',mode:'cube',cubes:3,filled:2,partial:.5}});h.advanceTime(2500);
  const fills=world.scene.getObjectByName('measured-unit-cubes').children.filter(o=>o.name==='unit-cube-fill');expect(fills.map(o=>o.userData.fraction)).toEqual([1,1,.5]);expect(fills[2].geometry.parameters.height).toBeCloseTo(.2);
  h.restoreEffects([]);h.restoreEffects(['world.M-UNIT-06.resolved']);expect(world.scene.getObjectByName('measured-unit-cubes')).toBeUndefined();h.dispose();
 });
 it('moves the raft to its dock and opens the separate channel gate',()=>{
  const world=fixture(),h=mountFamilyWorlds(world);h.enter('LM06',{nodeId:'M-MUL-COMM'});h.resolve('M-MUL-COMM',{eventId:'world.M-MUL-COMM.resolved'});const raft=world.scene.getObjectByName('arriving-raft'),start=raft.position.x;h.advanceTime(2500);expect(raft.position.x-start).toBeCloseTo(.9);
  h.enter('LM08',{nodeId:'M-FRAC-16'});h.resolve('M-FRAC-16',{eventId:'world.M-FRAC-16.resolved'});const gate=world.scene.getObjectByName('channel-gate'),stream=world.scene.getObjectByName('opened-channel-flow'),closed=gate.position.y;expect(stream.visible).toBe(false);h.advanceTime(2500);expect(gate.position.y-closed).toBeCloseTo(.5);expect(stream.visible).toBe(true);h.dispose();
 });
 it('keeps the cargo cable attached throughout the hoist',()=>{
  const world=fixture(),h=mountFamilyWorlds(world);h.enter('LM07',{nodeId:'M-EXPR-01'});h.resolve('M-EXPR-01',{eventId:'world.M-EXPR-01.resolved'});const cargo=world.scene.getObjectByName('hoisted-cargo'),cable=world.scene.getObjectByName('cargo-cable');
  for(const step of [0,625,625,625,625]){if(step)h.advanceTime(step);expect(cable.position.y-cable.scale.y).toBeCloseTo(cargo.position.y+cargo.geometry.parameters.height/2);}
  h.dispose();
 });
 it('keeps the actual kinetic vehicle context and never guesses it during restore',()=>{
  for(const context of ['boat','cart']){const world=fixture(),h=mountFamilyWorlds(world);h.enter('SCI11',{nodeId:'PHY79-KINETIC'});h.resolve('PHY79-KINETIC',{eventId:'world.PHY79-KINETIC.resolved',lessonModel:{kind:'energy-islands',mode:'kinetic',observed:true,given:{context}}});
   expect(world.scene.getObjectByName(`stopped-model-${context}`)).toBeTruthy();expect(h.snapshot().modelBoundEffects).toContain('world.PHY79-KINETIC.resolved');h.restoreEffects([]);h.restoreEffects(['world.PHY79-KINETIC.resolved']);expect(world.scene.getObjectByName('stopped-model-boat')).toBeUndefined();expect(world.scene.getObjectByName('stopped-model-cart')).toBeUndefined();h.dispose();}
 });
 it('matches the observed virtual device state and does not invent a restored light',()=>{
  for(const [state,color] of [['lamp-on',0xffd77a],['lamp-off',0x465d59]]){const world=fixture(),h=mountFamilyWorlds(world);h.enter('SCI12',{nodeId:'ENV-PHY-DEVICE-01'});h.resolve('ENV-PHY-DEVICE-01',{eventId:'world.ENV-PHY-DEVICE-01.resolved',lessonModel:{kind:'electricity-harbor',mode:'device',observed:true,given:{device:'beacon'},outcome:{observation:[state]}}});h.advanceTime(2500);
   expect(world.scene.getObjectByName('device-lens').material.color.getHex()).toBe(color);h.restoreEffects([]);h.restoreEffects(['world.ENV-PHY-DEVICE-01.resolved']);expect(world.scene.getObjectByName('device-lens').material.color.getHex()).toBe(0x465d59);expect(h.snapshot().modelBoundEffects).toEqual([]);h.dispose();}
 });
 it('shows the muted sound-source vibration and settles at the final still',()=>{
  const world=fixture(),h=mountFamilyWorlds(world);h.enter('SCI05',{nodeId:'ENV-PHY-SOUND-01'});h.resolve('ENV-PHY-SOUND-01',{eventId:'world.ENV-PHY-SOUND-01.resolved'});const source=world.scene.getObjectByName('sound-vibration-source');expect(source.scale.x).toBeCloseTo(1);h.advanceTime(156.25);expect(source.scale.x).toBeGreaterThan(1.1);h.advanceTime(2343.75);expect(source.scale.x).toBeCloseTo(1);h.dispose();
 });
 it('keeps right and non-right triangles distinct and does not restore a guessed triangle',()=>{
  const world=fixture(),h=mountFamilyWorlds(world);h.enter('UM-14',{nodeId:'M79-PYTH-CONVERSE'});const triangles=[{vertices:[[0,0],[3,0],[0,4]],classification:'right'},{vertices:[[0,0],[4,0],[1,1]],classification:'obtuse'}];
  h.resolve('M79-PYTH-CONVERSE',{eventId:'world.M79-PYTH-CONVERSE.resolved',lessonModel:{kind:'family-lesson',nodeId:'M79-PYTH-CONVERSE',activity:'triangle-converse',triangles}});h.advanceTime(2500);
  const drawings=world.scene.getObjectByName('checked-triangles').children;expect(drawings.map(x=>x.userData.classification)).toEqual(['right','obtuse']);expect(drawings.map(x=>!!x.userData.rightMarker)).toEqual([true,false]);
  h.restoreEffects([]);h.restoreEffects(['world.M79-PYTH-CONVERSE.resolved']);expect(world.scene.getObjectByName('checked-triangles')).toBeUndefined();h.dispose();
 });
 it('shows zero, one or two root marks as supplied, without inventing them on restore',()=>{
  for(const [radicand,roots] of [[-4,[]],[0,[0]],[9,[-3,3]]]){const world=fixture(),h=mountFamilyWorlds(world);h.enter('UM-09',{nodeId:'M79-QUAD-INCOMP-02'});h.resolve('M79-QUAD-INCOMP-02',{eventId:'world.M79-QUAD-INCOMP-02.resolved',lessonModel:{kind:'family-lesson',nodeId:'M79-QUAD-INCOMP-02',activity:'square-roots',radicand,roots}});h.advanceTime(2500);
   const marks=world.scene.getObjectByName('checked-root-marks');expect(marks.children.filter(x=>Object.hasOwn(x.userData,'value')).map(x=>x.userData.value)).toEqual(roots);expect(!!world.scene.getObjectByName('no-root-detour')).toBe(roots.length===0);h.restoreEffects([]);h.restoreEffects(['world.M79-QUAD-INCOMP-02.resolved']);expect(world.scene.getObjectByName('checked-root-marks')).toBeUndefined();h.dispose();}
 });
 it('marks a system intersection only for one solution while retaining both lines in every case',()=>{
  const cases=[['one',[[1,0,1],[0,1,2]],[[1,2]]],['none',[[1,-1,0],[1,-1,2]],[[0,0],[0,-2]]],['many',[[1,-1,0],[2,-2,0]],[[0,0],[1,1]]]];
  for(const [relation,equations,points] of cases){const world=fixture(),h=mountFamilyWorlds(world);h.enter('UM-10',{nodeId:'M79-SYSTEM-GRAPH'});h.resolve('M79-SYSTEM-GRAPH',{eventId:'world.M79-SYSTEM-GRAPH.resolved',lessonModel:{kind:'family-lesson',nodeId:'M79-SYSTEM-GRAPH',activity:'system-graph',relation,equations,points}});h.advanceTime(2500);
   const graph=world.scene.getObjectByName('checked-system-graph'),lines=graph.children.filter(x=>Object.hasOwn(x.userData,'equationIndex'));expect(lines).toHaveLength(2);if(relation==='none'){const direction=new THREE.Vector3(0,1,0).applyQuaternion(lines[0].quaternion);expect(Math.abs(direction.y/direction.x)).toBeCloseTo(1);}expect(!!world.scene.getObjectByName('system-intersection')).toBe(relation==='one');h.dispose();}
 });
 it('shows exactly the checked allowed combination rows and no flags when the model is absent',()=>{
  const world=fixture(),h=mountFamilyWorlds(world);h.enter('UM-01',{nodeId:'M79-COMB-01'});const factors=[['a','b'],['x','y']],rows=[['a','x'],['a','y'],['b','x']],forbidden=[['b','y']];h.resolve('M79-COMB-01',{eventId:'world.M79-COMB-01.resolved',lessonModel:{kind:'family-lesson',nodeId:'M79-COMB-01',activity:'combinations',factors,rows,forbidden,count:3}});h.advanceTime(2500);
  expect(world.scene.getObjectByName('checked-combination-flags').children.filter(x=>x.userData.pair).map(x=>x.userData.pair)).toEqual(rows);h.restoreEffects([]);h.restoreEffects(['world.M79-COMB-01.resolved']);expect(world.scene.getObjectByName('checked-combination-flags')).toBeUndefined();h.dispose();
 });
 it('preserves the atom counts and the solute-to-total mass ratios of the checked ledgers',()=>{
  const world=fixture(),h=mountFamilyWorlds(world);h.enter('SCI17',{nodeId:'CHEM79-BALANCE'});h.resolve('CHEM79-BALANCE',{eventId:'world.CHEM79-BALANCE.resolved',lessonModel:{kind:'family-lesson',nodeId:'CHEM79-BALANCE',activity:'chemical-balance',atoms:[{element:'H',left:4,right:4},{element:'O',left:2,right:2}]}});h.advanceTime(2500);
  const bars=world.scene.getObjectByName('checked-atom-ledger').children;expect(bars.map(b=>b.userData.count)).toEqual([4,4,2,2]);expect(bars[2].geometry.parameters.width/bars[0].geometry.parameters.width).toBeCloseTo(.5);
  h.enter('SCI19',{nodeId:'CHEM79-CONC-CALC'});h.resolve('CHEM79-CONC-CALC',{eventId:'world.CHEM79-CONC-CALC.resolved',lessonModel:{kind:'family-lesson',nodeId:'CHEM79-CONC-CALC',activity:'concentration',unit:'g',basis:'mass-mass',solute:5,total:20,percent:25,retainedSolute:5,retainedTotal:40,operation:'dilute'}});h.advanceTime(2500);
  const ledger=world.scene.getObjectByName('checked-solution-ledger').children,whole=ledger.find(b=>b.userData.role==='target'&&b.userData.mass),part=ledger.find(b=>b.userData.role==='target'&&b.userData.solute);expect(part.geometry.parameters.width/whole.geometry.parameters.width).toBeCloseTo(.25);h.restoreEffects([]);h.restoreEffects(['world.CHEM79-BALANCE.resolved','world.CHEM79-CONC-CALC.resolved']);expect(world.scene.getObjectByName('checked-atom-ledger')).toBeUndefined();expect(world.scene.getObjectByName('checked-solution-ledger')).toBeUndefined();h.dispose();
 });
 it('assigns every family an explicit habitat and restores the original atmosphere on exit',()=>{
  expect(new Set(Object.keys(familyMilieus))).toEqual(new Set(familyWorldBriefs.map(f=>f.id)));expect(new Set(Object.values(familyMilieus))).toEqual(new Set(['reed','rocky','workshop','ice','cave','mountain','garden','observatory']));
  const world=fixture({setAtmosphere:vi.fn()}),h=mountFamilyWorlds(world);for(const [family,milieu] of Object.entries(familyMilieus)){expect(h.enter(family)).toBe(true);expect(h.snapshot().milieu).toBe(milieu);expect(world.setAtmosphere).toHaveBeenLastCalledWith(milieuAtmosphere[milieu]);}h.clear();expect(h.snapshot().milieu).toBeNull();expect(world.setAtmosphere).toHaveBeenLastCalledWith('default');h.dispose();
 });
 it('enlarges checked active branch events and returns the same fixture to a compact memory anchor',()=>{
  const world=fixture(),h=mountFamilyWorlds(world),id='M79-SYSTEM-GRAPH';h.enter('UM-10',{nodeId:id});h.resolve(id,{eventId:`world.${id}.resolved`});const effect=world.scene.getObjectByName(`family-effect-${id}`);expect(effect.scale.x).toBeGreaterThan(1);expect(h.snapshot().anchors.find(a=>a.effectId===`world.${id}.resolved`).mode).toBe('active');
  const other=familyWorldPilots['UM-10'].nodeIds.find(n=>n!==id);const activeScale=effect.scale.x;h.enter('UM-10',{nodeId:other});expect(effect.scale.x).toBeLessThan(activeScale);expect(effect.scale.x).toBeLessThanOrEqual(1.2);expect(h.snapshot().anchors.find(a=>a.effectId===`world.${id}.resolved`).mode).toBe('memory');h.dispose();
 });
 it('presents eight bounded before, action and after phases before shrinking into memory',()=>{
  for(const [family,id] of [['LM02','M-PS-06'],['SCI02','SCI-ENV-CONCL-01'],['LM02','M-PS-03'],['LM18','M-MEAS-07'],['LM20','M-DATA-08'],['LM15','M-SYM-02'],['LM08','M-FRAC-16'],['SCI12','ENV-PHY-DEVICE-01']]){
   const world=fixture(),h=mountFamilyWorlds(world);h.enter(family,{nodeId:id});h.resolve(id,{eventId:`world.${id}.resolved`});let s=h.snapshot();expect(s.actionPhase).toBe('before');expect(s.anchors.find(a=>a.effectId===`world.${id}.resolved`).mode).toBe('active');
   h.advanceTime(1250);expect(h.snapshot().actionPhase).toBe('action');h.advanceTime(750);s=h.snapshot();expect(s.actionPhase).toBe('after');expect(s.remaining).toBe(500);expect(s.anchors.find(a=>a.effectId===`world.${id}.resolved`).mode).toBe('active');
   h.advanceTime(500);s=h.snapshot();expect(s.remaining).toBe(0);expect(s.anchors.find(a=>a.effectId===`world.${id}.resolved`).mode).toBe('memory');h.dispose();
  }
 });
 it('keeps the bridge cable connected while the bridge moves',()=>{
  const world=fixture(),h=mountFamilyWorlds(world);h.enter('LM02',{nodeId:'M-PS-06'});h.resolve('M-PS-06',{eventId:'world.M-PS-06.resolved'});const deck=world.scene.getObjectByName('bridge-deck'),cable=world.scene.getObjectByName('bridge-cable');
  for(const step of [0,875,375,375,375]){if(step)h.advanceTime(step);const end=new THREE.Vector3(0,cable.scale.y,0).applyQuaternion(cable.quaternion).add(cable.position);expect(end.x).toBeCloseTo(deck.position.x-.75);expect(end.y).toBeCloseTo(.22);}
  h.dispose();
 });
 it('finishes reduced-motion effects as compact still memories without an active light',()=>{
  const world=fixture(),h=mountFamilyWorlds(world,{reducedMotion:true});h.enter('SCI12',{nodeId:'ENV-PHY-DEVICE-01'});h.resolve('ENV-PHY-DEVICE-01',{eventId:'world.ENV-PHY-DEVICE-01.resolved',lessonModel:{kind:'electricity-harbor',mode:'device',observed:true,given:{device:'lantern'},outcome:{observation:['lamp-on']}}});const s=h.snapshot();expect(s.actionPhase).toBe('after');expect(s.remaining).toBe(0);expect(s.anchors[0].mode).toBe('memory');let active=0;world.scene.traverse(o=>{if(o.isPointLight&&o.intensity>0)active++;});expect(active).toBe(0);h.dispose();
 });
 it('pauses time, stops for reduced motion and does not invent consequences or evidence',()=>{
  const world=fixture(),handle=mountFamilyWorlds(world);handle.enter('LM01',{phase:'arrival'});
  handle.advanceTime(200);handle.setPaused(true);handle.advanceTime(200);
  expect(handle.snapshot().elapsed).toBe(200);expect(handle.resolve('M-TH-01',{eventId:'world.test.resolved'})).toBe(false);
  handle.restoreEffects(['world.test.resolved']);expect(handle.snapshot().effects).toEqual([]);
  handle.setPaused(false);handle.setPhase('work');expect(handle.snapshot().elapsed).toBe(0);
  world.state.lost=true;handle.advanceTime(500);expect(handle.snapshot().renderer).toBe('fallback');expect(handle.snapshot().visibleObjects).toEqual([]);expect(handle.snapshot().elapsed).toBe(0);
  handle.clear();handle.dispose();handle.dispose();expect(world.scene.children).toHaveLength(0);
  const reduced=mountFamilyWorlds(fixture(),{reducedMotion:true});reduced.enter('LM08');reduced.advanceTime(500);expect(reduced.snapshot().elapsed).toBe(0);reduced.dispose();
 });
 it('disposes replaced geometry and resources without removing the host scene',()=>{
  const world=fixture(),handle=mountFamilyWorlds(world);handle.enter('LM01');const root=world.scene.getObjectByName('family-world-pilot');
  const geo=root.children.find(o=>o.geometry).geometry,dispose=vi.spyOn(geo,'dispose');handle.enter('LM14');expect(dispose).toHaveBeenCalledOnce();
  const material=root.children.find(o=>o.material).material,disposeMaterial=vi.spyOn(material,'dispose');handle.dispose();expect(disposeMaterial).toHaveBeenCalledOnce();
 });
 it('replays no effect, restores idempotently, and keeps pause distinct from motion preference',()=>{
  const world=fixture(),h=mountFamilyWorlds(world);h.enter('LM01',{nodeId:'M-TH-01',phase:'work'});
  expect(h.resolve('M-TH-02',{eventId:'world.M-TH-02.resolved'})).toBe(false);
  expect(h.resolve('M-TH-01',{eventId:'world.M-TH-01.resolved'})).toBe(true);
  expect(h.resolve('M-TH-01',{eventId:'world.M-TH-01.resolved'})).toBe(false);
  h.setPaused(true);h.setReducedMotion(false);h.advanceTime(500);expect(h.snapshot().remaining).toBe(2500);
  h.setPaused(false);h.advanceTime(500);expect(h.snapshot().remaining).toBe(2000);
  h.setReducedMotion(true);expect(h.snapshot().remaining).toBe(0);expect(h.snapshot().paused).toBe(false);
  h.clear();h.restoreEffects(['world.M-TH-01.resolved','world.M-FRAC-14.resolved','world.M-TH-01.resolved']);
  expect(h.snapshot().effects).toEqual(['world.M-FRAC-14.resolved','world.M-TH-01.resolved']);
  h.restoreEffects(['world.M-FRAC-14.resolved','world.M-TH-01.resolved']);
  expect(world.scene.getObjectByName('family-world-effects').children).toHaveLength(2);
  h.enter('LM08',{nodeId:'M-FRAC-14'});expect(h.snapshot().remaining).toBe(0);
  h.restoreEffects(['world.M-FRAC-14.resolved']);expect(h.snapshot().effects).toEqual(['world.M-FRAC-14.resolved']);h.dispose();
 });

 it('preserves every canonical family and required-leaf treatment without calling them implemented',()=>{
  const story=JSON.parse(readFileSync(new URL('../../docs/lite-690/source/data/sammakko_690_story.json',import.meta.url),'utf8'));
  expect(familyWorldBriefs).toHaveLength(62);expect(Object.keys(familyWorldPilots)).toHaveLength(62);expect(new Set(Object.keys(familyWorldPilots))).toEqual(new Set(familyWorldBriefs.map(f=>f.id)));expect(familyLeafTreatments).toHaveLength(268);expect(familyWorldRecipes).toHaveLength(62);expect(new Set(familyWorldRecipes.map(r=>r.id))).toEqual(new Set(familyWorldBriefs.map(r=>r.id)));for(const recipe of familyWorldRecipes){expect(recipe.landmark).not.toBe(recipe.support);expect(recipe.light).toBeTruthy();expect(recipe.motion).toBeTruthy();}
  const families=new Map(story.families.map(f=>[f.id,f]));const nodes=new Map(story.nodes.filter(n=>n.is_required_leaf).map(n=>[n.id,n]));
  for(const f of familyWorldBriefs){const expected=familyLeafTreatments.filter(t=>t.familyId===f.id).map(t=>t.id).sort();expect(familyAnchorNodes[f.id]??[]).toEqual(expected);}
  expect(new Set(familyWorldBriefs.map(f=>f.id)).size).toBe(62);expect(new Set(familyLeafTreatments.map(n=>n.id)).size).toBe(268);
  for(const f of familyWorldBriefs){const source=families.get(f.id);expect(f.world).toBe(source.world_description);expect(f.nodeIds).toEqual(source.node_ids);}
  for(const n of familyLeafTreatments){const source=nodes.get(n.id);expect(n.familyId).toBe(source.family_id);expect(n.effectId).toBe(source.story_contract.world_effect_id);expect(n.action).toBe(source.learning_action);expect(n.success).toBe(source.success_event);}
  expect(FAMILY_IMPLEMENTED_EFFECT_IDS).toHaveLength(256);const authoredIds=new Set(AUTHORED_CLIMAX_IDS.map(id=>`world.${id}.resolved`));for(const id of FAMILY_IMPLEMENTED_EFFECT_IDS)expect(authoredIds.has(id)).toBe(false);for(const id of FAMILY_IMPLEMENTED_EFFECT_IDS)expect(familyLeafTreatments.some(n=>n.effectId===id)).toBe(true);
 });
 it('uses a separate fixture for each implemented effect and rejects mismatched event identifiers',()=>{
  const world=fixture(),h=mountFamilyWorlds(world);
  for(const [family,id] of [['LM01','M-TH-01'],['LM08','M-FRAC-14'],['LM14','M-GEO-16']]){
   h.enter(family,{nodeId:id});expect(h.resolve(id,{eventId:'world.fake.resolved'})).toBe(false);
   expect(h.resolve(id,{eventId:`world.${id}.resolved`,lessonModel:{secret:'not read'}})).toBe(true);
   h.advanceTime(2500);expect(h.snapshot().remaining).toBe(0);
  }
  expect(world.scene.getObjectByName('family-world-effects').children).toHaveLength(3);expect(JSON.stringify(h.snapshot())).not.toContain('not read');h.dispose();
 });

 it('moves the boat, reveals the waterfall and assembles the lighthouse over bounded time',()=>{
  for(const [family,id] of [['LM01','M-TH-01'],['LM08','M-FRAC-14'],['LM14','M-GEO-16']]){
   const world=fixture(),h=mountFamilyWorlds(world);h.enter(family,{nodeId:id});h.resolve(id,{eventId:`world.${id}.resolved`});
   const group=world.scene.getObjectByName(`family-effect-${id}`),subject=id==='M-TH-01'?group.getObjectByName('leaf-boat'):group.children.find(o=>o.isMesh && (id==='M-FRAC-14'?o.geometry.type==='BoxGeometry':o.geometry.type==='CylinderGeometry'));
   expect(subject).toBeDefined();const before={x:subject.position.x,y:subject.position.y,sy:subject.scale.y};h.advanceTime(2500);
   if(id==='M-TH-01')expect(subject.position.x).toBeGreaterThan(before.x);
   if(id==='M-FRAC-14')expect(subject.scale.y).toBeGreaterThan(before.sy);
   if(id==='M-GEO-16')expect(subject.position.y).toBeGreaterThan(before.y);
   expect(h.snapshot().remaining).toBe(0);expect(h.snapshot().consequence).toBeTruthy();h.dispose();
  }
 });

 it('ties the tent rope from its anchor without recording any learner answer',()=>{
  const world=fixture(),h=mountFamilyWorlds(world);h.enter('LM02',{nodeId:'M-PS-02'});
  expect(h.resolve('M-PS-02',{eventId:'world.M-PS-02.resolved',lessonModel:{privateData:'not exposed'}})).toBe(true);
  const group=world.scene.getObjectByName('family-effect-M-PS-02'),pivot=group.children.find(o=>o.isGroup),rope=pivot.children[0];
  expect(rope.scale.y).toBeCloseTo(.02);h.advanceTime(2500);expect(rope.scale.y).toBe(1);
  expect(JSON.stringify(h.snapshot())).not.toContain('not exposed');h.dispose();
 });

 it('moves the ordinal boat to its landing while keeping task values out of the world snapshot',()=>{
  const world=fixture(),h=mountFamilyWorlds(world);h.enter('LM03',{nodeId:'M-NUM-13'});
  expect(h.resolve('M-NUM-13',{eventId:'world.M-NUM-13.resolved',lessonModel:{secret:'private'}})).toBe(true);
  const group=world.scene.getObjectByName('family-effect-M-NUM-13'),boat=group.children.find(o=>o.geometry?.type==='SphereGeometry');
  const initial=boat.position.x;h.advanceTime(2500);expect(boat.position.x).toBeGreaterThan(initial);
  expect(JSON.stringify(h.snapshot())).not.toContain('private');h.dispose();
 });

 it('moves the bundle inventory ledger without inventing a bundle quantity',()=>{
  const world=fixture(),h=mountFamilyWorlds(world);h.enter('LM04',{nodeId:'M-NUM-16'});
  expect(h.resolve('M-NUM-16',{eventId:'world.M-NUM-16.resolved'})).toBe(true);
  const group=world.scene.getObjectByName('family-effect-M-NUM-16'),ledger=group.children[0],initial=ledger.position.x;
  h.advanceTime(2500);expect(ledger.position.x).toBeLessThan(initial);expect(h.snapshot().remaining).toBe(0);h.dispose();
 });

 it('opens the workshop lid and extends the beacon message independently',()=>{
  for(const [family,id] of [['LM11','M-ALG-09'],['LM20','M-DATA-12']]){
   const world=fixture(),h=mountFamilyWorlds(world);h.enter(family,{nodeId:id});expect(h.resolve(id,{eventId:`world.${id}.resolved`})).toBe(true);
   const group=world.scene.getObjectByName(`family-effect-${id}`),object=id==='M-ALG-09'?group.children.find(o=>o.isGroup):group.children[0];
   const initial=id==='M-ALG-09'?object.rotation.x:object.scale.y;h.advanceTime(2500);
   expect(id==='M-ALG-09'?object.rotation.x:object.scale.y).not.toBe(initial);h.dispose();
  }
 });

 it('builds and completes every currently implemented leaf-specific fixture, not just its ID',()=>{
  for(const effectId of FAMILY_IMPLEMENTED_EFFECT_IDS){
   const treatment=familyLeafTreatments.find(t=>t.effectId===effectId),world=fixture(),h=mountFamilyWorlds(world);
   expect(treatment).toBeDefined();expect(h.enter(treatment.familyId,{nodeId:treatment.id})).toBe(true);
   expect(h.resolve(treatment.id,{eventId:effectId}),effectId).toBe(true);
   const g=world.scene.getObjectByName(`family-effect-${treatment.id}`);expect(g).toBeTruthy();
   let meshes=0,allMeshes=0,triangles=0;g.traverse(o=>{if(o.isMesh)meshes++;});expect(meshes).toBeGreaterThan(0);world.scene.traverse(o=>{if(o.isMesh){allMeshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}});expect(allMeshes,effectId).toBeLessThan(150);expect(triangles,effectId).toBeLessThan(30000);
   h.advanceTime(2500);expect(h.snapshot().remaining).toBe(0);expect(h.snapshot().consequence).toBeTruthy();h.dispose();
  }
 });

 it('follows only the provided valid ferry path and restores without inventing a missing path',()=>{
  const world=fixture(),h=mountFamilyWorlds(world);h.enter('LM22',{nodeId:'M-PROG-03'});
  const model={kind:'programming-ferry',board:{width:4,height:4},path:[{x:0,y:1},{x:1,y:1},{x:1,y:3}]};
  expect(h.resolve('M-PROG-03',{eventId:'world.M-PROG-03.resolved',lessonModel:model})).toBe(true);
  expect(h.snapshot().modelBoundEffects).toEqual(['world.M-PROG-03.resolved']);
  const g=world.scene.getObjectByName('family-effect-M-PROG-03'),vessel=g.children.find(o=>o.geometry?.type==='SphereGeometry');
  expect(vessel.position.x).toBeCloseTo(-.3);h.advanceTime(2500);expect(vessel.position.x).toBeCloseTo(-.1);expect(vessel.position.z).toBeCloseTo(.3);
  h.restoreEffects([]);h.restoreEffects(['world.M-PROG-03.resolved']);expect(h.snapshot().modelBoundEffects).toEqual([]);h.dispose();
 });

 it('shows the supplied light observation in the matching shape and never invents a restore result',()=>{
  for(const shape of ['round','square']){
   const world=fixture(),h=mountFamilyWorlds(world);h.enter('SCI05',{nodeId:'ENV-PHY-LIGHT-01'});
   const model={kind:'waves-observatory',shape,context:'lamp',sourceX:0,objectX:4,screenX:10,sourceY:1,objectY:0,objectHalf:.5,observation:{kind:'light',shadowLow:-2.75,shadowHigh:-.25}};
   h.resolve('ENV-PHY-LIGHT-01',{eventId:'world.ENV-PHY-LIGHT-01.resolved',lessonModel:model});
   expect(h.snapshot().modelBoundEffects).toEqual(['world.ENV-PHY-LIGHT-01.resolved']);
   const group=world.scene.getObjectByName('family-effect-ENV-PHY-LIGHT-01');h.advanceTime(2500);
   const shadow=group.getObjectByName('observed-shadow');expect(shadow).toBeDefined();
   expect(shadow.geometry.type).toBe(shape==='round'?'CircleGeometry':'BoxGeometry');expect(shadow.position.y).toBeCloseTo(.81);
   h.restoreEffects([]);h.restoreEffects(['world.ENV-PHY-LIGHT-01.resolved']);expect(h.snapshot().modelBoundEffects).toEqual([]);h.dispose();
  }
 });

 it('preserves authored proportions when a seedling is revealed or restored',()=>{
  const world=fixture(),h=mountFamilyWorlds(world);h.enter('SCI02',{nodeId:'SCI-ENV-CONCL-01'});h.resolve('SCI-ENV-CONCL-01',{eventId:'world.SCI-ENV-CONCL-01.resolved'});h.advanceTime(2500);
  const g=world.scene.getObjectByName('family-effect-SCI-ENV-CONCL-01'),leaf=g.getObjectByName('new-leaf');expect(leaf.scale.x).toBeCloseTo(.28);expect(leaf.scale.y).toBeCloseTo(.12);
  h.restoreEffects([]);h.restoreEffects(['world.SCI-ENV-CONCL-01.resolved']);const restored=world.scene.getObjectByName('family-effect-SCI-ENV-CONCL-01').getObjectByName('new-leaf');expect(restored.scale.x).toBeCloseTo(.28);h.dispose();
 });

 it('shows only lamps and lit states supplied by the observed two-lamp series circuit',()=>{
  for(const [edges,lit] of [[["r0","r1"],["r0","r1"]],[["r0"],[]]]){
   const world=fixture(),h=mountFamilyWorlds(world);h.enter('SCI12',{nodeId:'PHY79-SERIES'});
   const model={kind:'circuit-workshop',observed:true,given:{topology:'series',resistances:[4,6]},circuit:{edges:edges.map(id=>({id}))},outcome:{lit}};
   expect(h.resolve('PHY79-SERIES',{eventId:'world.PHY79-SERIES.resolved',lessonModel:model})).toBe(true);h.advanceTime(2500);
   expect(h.snapshot().modelBoundEffects).toEqual(['world.PHY79-SERIES.resolved']);
   const g=world.scene.getObjectByName('family-effect-PHY79-SERIES');const bulbs=g.children.filter(o=>o.geometry?.type==='SphereGeometry');
   expect(bulbs).toHaveLength(edges.length);expect(bulbs.filter(o=>o.material.color.getHex()===0xc9a966)).toHaveLength(lit.length);h.dispose();
  }
 });

 it('keeps the illustrative phase-change block volume fixed through each frame',()=>{
  const world=fixture(),h=mountFamilyWorlds(world);h.enter('SCI16',{nodeId:'CHEM79-STATECHANGE'});h.resolve('CHEM79-STATECHANGE',{eventId:'world.CHEM79-STATECHANGE.resolved'});
  const block=world.scene.getObjectByName('family-effect-CHEM79-STATECHANGE').children[0];
  for(let i=0;i<10;i++){h.advanceTime(250);expect(block.scale.x*block.scale.y*block.scale.z).toBeCloseTo(1,12);}
  h.dispose();
 });

 it('uses the given lift displacement and duration without inventing them on restore',()=>{
  for(const [id,direction,duration] of [['PHY79-WORK-CALC','horizontal',2],['PHY79-POWER-CALC','parallel',5]]){
   const world=fixture(),h=mountFamilyWorlds(world);h.enter('SCI10',{nodeId:id});
   const model={kind:'work-power',lifts:[{forceN:12,distanceM:3,durationS:duration,direction}]};
   expect(h.resolve(id,{eventId:`world.${id}.resolved`,lessonModel:model})).toBe(true);expect(h.snapshot().remaining).toBe(duration*1000);
   const group=world.scene.getObjectByName(`family-effect-${id}`),cart=group.children.find(o=>o.material?.color?.getHex()===0xe7d8ad);
   const rope=group.getObjectByName('model-lift-rope');const start=direction==='horizontal'?cart.position.x:cart.position.y;h.advanceTime(duration*500);
   const halfway=direction==='horizontal'?cart.position.x:cart.position.y;expect(halfway-start).toBeCloseTo(.27);h.advanceTime(duration*500);
   const end=direction==='horizontal'?cart.position.x:cart.position.y;expect(end-start).toBeCloseTo(.54);expect(rope.scale.y).toBeCloseTo(direction==='horizontal'?.46:.385);expect(h.snapshot().remaining).toBe(0);
   h.restoreEffects([]);h.restoreEffects([`world.${id}.resolved`]);expect(h.snapshot().modelBoundEffects).toEqual([]);h.dispose();
  }
 });

 it('keeps the shore rope attached to the boat throughout its guided arrival',()=>{
  const world=fixture(),h=mountFamilyWorlds(world);h.enter('LM01',{nodeId:'M-TH-06'});h.resolve('M-TH-06',{eventId:'world.M-TH-06.resolved'});
  const g=world.scene.getObjectByName('family-effect-M-TH-06'),boat=g.children.find(o=>o.geometry?.type==='SphereGeometry'),rope=g.children.find(o=>o.geometry?.type==='CylinderGeometry'&&o.material.color.getHex()===0xc9a966);
  for(let i=0;i<5;i++){h.advanceTime(500);g.updateWorldMatrix(true,true);const end=rope.localToWorld(new THREE.Vector3(0,1,0)),expected=g.localToWorld(new THREE.Vector3(boat.position.x+.5,.15,0));expect(end.distanceTo(expected)).toBeLessThan(1e-6);}
  h.dispose();
 });

 it('moves the reference level without moving the basket when only the reference changes',()=>{
  const world=fixture(),h=mountFamilyWorlds(world);h.enter('SCI11',{nodeId:'PHY79-POTENTIAL'});
  const model={kind:'energy-islands',mode:'potential',observed:true,given:{height:6,reference:0},controls:{height:6,reference:2}};
  h.resolve('PHY79-POTENTIAL',{eventId:'world.PHY79-POTENTIAL.resolved',lessonModel:model});
  const group=world.scene.getObjectByName('family-effect-PHY79-POTENTIAL'),basket=group.getObjectByName('potential-basket'),level=group.getObjectByName('potential-reference'),y=basket.position.y,ref=level.position.y;
  h.advanceTime(2500);expect(basket.position.y).toBeCloseTo(y);expect(level.position.y-ref).toBeCloseTo(.2);expect(h.snapshot().modelBoundEffects).toEqual(['world.PHY79-POTENTIAL.resolved']);h.dispose();
 });

 it('shows a generator lit and moving only for the observed on-state',()=>{
  for(const control of ['on','off']){
   const world=fixture(),h=mountFamilyWorlds(world);h.enter('SCI12',{nodeId:'PHY79-GENERATION'});
   const model={kind:'electricity-harbor',mode:'generation',observed:true,control,given:{source:'water',speed:2},outcome:{observation:[control==='on'?'input-generates':'no-input']}};
   h.resolve('PHY79-GENERATION',{eventId:'world.PHY79-GENERATION.resolved',lessonModel:model});const group=world.scene.getObjectByName('family-effect-PHY79-GENERATION');h.advanceTime(1250);
   const rotor=group.getObjectByName('generator-rotor');expect(rotor.rotation.z===0).toBe(control==='off');h.advanceTime(1250);
   const lamp=group.getObjectByName('generator-lamp');expect(lamp.material.color.getHex()===0xc9a966).toBe(control==='on');
   h.restoreEffects([]);h.restoreEffects(['world.PHY79-GENERATION.resolved']);expect(h.snapshot().modelBoundEffects).toEqual([]);h.dispose();
  }
 });

 it('keeps the opposite and distance markers symmetric about the same zero',()=>{
  for(const id of ['M79-OPPOSITE-01','M79-ABS-01']){
   const world=fixture(),h=mountFamilyWorlds(world);h.enter('UM-03',{nodeId:id});h.resolve(id,{eventId:`world.${id}.resolved`});const g=world.scene.getObjectByName(`family-effect-${id}`),left=g.getObjectByName('left-marker'),right=g.getObjectByName('right-marker');
   for(let i=0;i<5;i++){h.advanceTime(500);expect(left.position.x+right.position.x).toBeCloseTo(0,12);}
   h.dispose();
  }
 });

 it('places all eleven LM01 leaf memories at unique stable edge anchors without duplicate fixtures',()=>{
  const expected=familyLeafTreatments.filter(n=>n.familyId==='LM01').map(n=>n.effectId).sort();expect(expected).toHaveLength(11);for(const id of expected)expect(FAMILY_IMPLEMENTED_EFFECT_IDS).toContain(id);
  const world=fixture(),h=mountFamilyWorlds(world);h.enter('LM01',{nodeId:'M-TH-01'});h.restoreEffects(expected);
  const first=h.snapshot().anchors.filter(a=>a.familyId==='LM01');expect(first).toHaveLength(11);
  expect(new Set(first.map(a=>a.anchorId)).size).toBe(11);expect(new Set(first.map(a=>JSON.stringify(a.position))).size).toBe(11);
  expect(first.filter(a=>a.mode==='active')).toHaveLength(0);expect(first.filter(a=>a.mode==='memory')).toHaveLength(11);
  for(const a of first)expect(Math.abs(a.position[0])).toBeGreaterThan(3.2);
  h.restoreEffects([...expected].reverse());expect(h.snapshot().anchors.filter(a=>a.familyId==='LM01')).toEqual(first);
  expect(world.scene.getObjectByName('family-world-effects').children).toHaveLength(11);
  const memoryGroups=world.scene.getObjectByName('family-world-effects').children;world.scene.updateMatrixWorld(true);for(let i=0;i<memoryGroups.length;i++)for(let j=i+1;j<memoryGroups.length;j++){const a=new THREE.Box3().setFromObject(memoryGroups[i]),b=new THREE.Box3().setFromObject(memoryGroups[j]);expect(a.intersectsBox(b),`${memoryGroups[i].name} vs ${memoryGroups[j].name}`).toBe(false);}
  h.enter('LM01',{nodeId:'M-TH-02'});const next=h.snapshot().anchors;expect(next.find(a=>a.effectId==='world.M-TH-02.resolved').mode).toBe('memory');expect(next.find(a=>a.effectId==='world.M-TH-01.resolved').mode).toBe('memory');h.dispose();
 });

});
