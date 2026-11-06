import {describe,it,expect,vi} from 'vitest';
import * as THREE from 'three';
import {mountAuthoredClimax} from '../../src/world/authored-climax';
import {AUTHORED_CLIMAX_IDS,authoredClimaxes,hasAuthoredClimax} from '../../src/content/authored-climaxes';
const setup=(reducedMotion=false)=>{const scene=new THREE.Scene(),world={scene,state:{lost:false},invalidate:vi.fn(),setActivityFocus:vi.fn()};return {scene,world,stage:mountAuthoredClimax(world,{reducedMotion})};};
describe('authored local climaxes',()=>{
 it('covers each canonical node with its own fixture and story',()=>{expect(AUTHORED_CLIMAX_IDS).toHaveLength(12);expect(new Set(AUTHORED_CLIMAX_IDS.map(id=>authoredClimaxes[id].fixture)).size).toBe(12);expect(hasAuthoredClimax('missing')).toBe(false);});
 it('does not focus on mount, plays a bounded sequence, pauses and resets focus',()=>{
  const {world,stage,scene}=setup();expect(world.setActivityFocus).not.toHaveBeenCalled();expect(stage.play('unknown')).toBe(false);expect(stage.play('M-GEO-17')).toBe(true);expect(stage.snapshot()).toMatchObject({activeNode:'M-GEO-17',phase:'start',remaining:10000});
  stage.advanceTime(3000);expect(stage.snapshot()).toMatchObject({phase:'action',elapsed:3000});stage.setPaused(true);stage.advanceTime(3000);expect(stage.snapshot().elapsed).toBe(3000);
  stage.setPaused(false);stage.advanceTime(20000);expect(stage.snapshot()).toMatchObject({phase:'end',elapsed:10000,remaining:0});stage.clear();expect(world.setActivityFocus).toHaveBeenLastCalledWith(false,{target:[.6,.7,6],span:10});stage.dispose();stage.dispose();expect(scene.children).toHaveLength(0);
 });
 it('reduced motion holds initial still and skip reaches end without a record',()=>{const {stage}=setup(true);stage.play('CHEM79-FIRE-SAFE');stage.advanceTime(6000);expect(stage.snapshot().phase).toBe('start');stage.skipToEnd();expect(stage.snapshot().phase).toBe('end');expect(stage.snapshot().phaseText).toContain('kuvitteellinen');stage.dispose();});
 it('restores specific structures silently and idempotently across clear',()=>{const {scene,stage}=setup();const a='world.M-GEO-06.resolved',b='world.PHY79-PARALLEL.resolved';stage.restoreEffects([b,a,a]);expect(stage.snapshot().fixtures).toEqual([a,b].sort());const group=scene.children.find(c=>c.name==='authored-climax-memory');expect(group.children).toHaveLength(2);stage.restoreEffects([a,b]);expect(group.children).toHaveLength(2);stage.play('M-GEO-06');stage.clear();expect(group.children).toHaveLength(2);stage.restoreEffects([b]);expect(group.children).toHaveLength(1);stage.dispose();});
 it('renders exactly the provided number of volume cells and uses an unmarked box without data',()=>{const {scene,stage}=setup();stage.play('M-GMEAS-05',{lessonModel:{kind:'volume',dimensions:[3,2,2],unit:'cm'}});stage.skipToEnd();let group=scene.children.find(c=>c.name==='authored-climax');const cells=group.children.filter(c=>c.geometry?.type==='BoxGeometry'&&[0x4a9baf,0xf0e8c8].includes(c.material?.color?.getHex()));expect(cells).toHaveLength(12);expect(new Set(cells.map(c=>c.position.x)).size).toBe(3);expect(new Set(cells.map(c=>c.position.y)).size).toBe(2);expect(new Set(cells.map(c=>c.position.z)).size).toBe(2);stage.play('M-GMEAS-05');stage.skipToEnd();group=scene.children.find(c=>c.name==='authored-climax');expect(group.children.filter(c=>c.geometry?.type==='BoxGeometry'&&c.material?.color?.getHex()===0x4a9baf).length).toBe(0);stage.dispose();});
 it('stops time on context loss and ignores further calls after disposal',()=>{const {world,stage}=setup();stage.play('M-SCALE-03');world.state.lost=true;stage.advanceTime(3000);expect(stage.snapshot()).toMatchObject({elapsed:0,renderer:'fallback'});stage.dispose();expect(stage.play('M-SCALE-03')).toBe(false);});
});

it('aborts a pending character fetch on clear without losing persisted fixtures',async()=>{
 const original=globalThis.fetch;let signal;
 globalThis.fetch=vi.fn((_url,options)=>{signal=options.signal;return new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('aborted'))));});
 try {const scene=new THREE.Scene(),world={scene,state:{lost:false},invalidate(){},setActivityFocus(){},setCharactersVisible:vi.fn()};const stage=mountAuthoredClimax(world,{characterBase:'http://localhost/models/characters/'});
  stage.restoreEffects(['world.M-GEO-06.resolved']);stage.play('M-GEO-06');expect(signal.aborted).toBe(false);stage.clear();expect(signal.aborted).toBe(true);expect(world.setCharactersVisible).toHaveBeenLastCalledWith(true);expect(stage.snapshot().fixtures).toEqual(['world.M-GEO-06.resolved']);await Promise.resolve();expect(stage.snapshot().activeNode).toBeNull();stage.dispose();
 }finally{globalThis.fetch=original;}
});

it('retains restored event identities when WebGL is unavailable',()=>{
 const stage=mountAuthoredClimax({scene:null,state:{lost:false},invalidate(){},setActivityFocus(){}});
 stage.restoreEffects(['world.M-GEO-06.resolved']);expect(stage.snapshot().fixtures).toEqual(['world.M-GEO-06.resolved']);expect(stage.play('M-GEO-06')).toBe(true);stage.skipToEnd();expect(stage.snapshot()).toMatchObject({renderer:'fallback',phase:'end'});stage.dispose();
});

it('moves the shared map carrier continuously and does not expose the old sprites during play',()=>{
 const scene=new THREE.Scene(),world={scene,state:{lost:false},invalidate(){},setActivityFocus(){},setCharactersVisible:vi.fn()};
 const stage=mountAuthoredClimax(world,{characterBase:'http://localhost/models/characters/'});
 const original=globalThis.fetch;globalThis.fetch=vi.fn(()=>new Promise(()=>{}));
 try{stage.play('M-SCALE-03');expect(world.setCharactersVisible).toHaveBeenLastCalledWith(false);const active=scene.children.find(c=>c.name==='authored-climax');const carrier=active.children.find(c=>c.type==='Group');expect(carrier.position.x).toBeCloseTo(-1.35);stage.advanceTime(5000);expect(carrier.position.x).toBeCloseTo(0);stage.skipToEnd();expect(carrier.position.x).toBeCloseTo(1.35);stage.clear();expect(world.setCharactersVisible).toHaveBeenLastCalledWith(true);}finally{stage.dispose();globalThis.fetch=original;}
});

it('coasts at constant velocity until the brake zone, then slows to rest inside it',async()=>{
 const {brakingMotion}=await import('../../src/world/authored-climax');
 const start=brakingMotion(0),early=brakingMotion(.2),entry=brakingMotion(11/27),late=brakingMotion(.7),end=brakingMotion(1);
 expect(start.velocity).toBe(.9);expect(early.acceleration).toBe(0);expect(early.position-start.position).toBeCloseTo(.9*1.2);expect(entry.position).toBeCloseTo(.2);expect(late.braking).toBe(true);expect(late.acceleration).toBeLessThan(0);expect(end.position).toBeCloseTo(1.8);expect(end.velocity).toBe(0);
});
