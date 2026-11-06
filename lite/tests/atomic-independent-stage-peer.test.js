import {describe,it,expect} from 'vitest';
import * as THREE from 'three';
import {atomicChamberPose,mountAtomicWorldStage} from '../src/world/atomic-world-stage.js';
import {atomicWorldSpecs} from '../src/content/atomic-world';
import {atomicWorldScene} from '../src/content/scenes/atomic-world';
import {rng} from '../src/engine/rng';

describe('ROOT particle-motion and conservation peer',()=>{
  it('keeps gas behind the closed partition until the learner opens the experiment',()=>{
    const chamber={id:'gas',substance:'argon',count:20,phase:'gas',temperatureC:20};
    let afterCrossed=false;
    for(let ms=0;ms<=8000;ms+=125)for(let i=0;i<chamber.count;i++){
      const before=atomicChamberPose(chamber,i,ms,{kind:'diffusion',id:'gas'},false);
      expect(before[0]+.042,`particle ${i} at ${ms} ms crosses the closed partition`).toBeLessThanOrEqual(1e-10);
      expect(before.every(Number.isFinite)).toBe(true);
      const after=atomicChamberPose(chamber,i,ms,{kind:'diffusion',id:'gas'},true);afterCrossed||=after[0]>.1;
    }
    expect(afterCrossed).toBe(true);
  });

  it('preserves every actual H2O unit, oxygen/hydrogen count and radius through all three change stages',()=>{
    const spec=atomicWorldSpecs.find(s=>s.id==='CHEM79-STATECHANGE');
    for(const phase of ['independent','transfer'])for(let seed=0;seed<24;seed++){
      const task=spec.item(rng(seed),phase).task,c=task.chambers[0], n=c.count;
      const reply={kind:'atomic-world',mode:'phase',rows:[{id:c.id,phase:c.phase,motion:c.phase==='solid'?'vibrate':c.phase==='gas'?'free':'slide',spacing:c.phase==='solid'?'open':c.phase==='gas'?'far':'near',size:'same'}],forecast:task.change==='vaporize'?'gas':'liquid',locked:true,observed:false,identity:'same',count:String(n),steps:[]};
      let identity;
      for(const step of ['before','during','after']){
        reply.steps=step==='before'?[]:step==='during'?['during']:['during','after'];reply.observed=step==='after';
        const scene=atomicWorldScene(task,step==='before'?undefined:reply),parent=new THREE.Group(),mounted=mountAtomicWorldStage(parent,scene);
        const units=[],oxygen=[],hydrogen=[];parent.traverse(o=>{if(o.name.startsWith('conserved-'))units.push(o);if(o.name==='water-oxygen')oxygen.push(o);if(o.name==='water-hydrogen')hydrogen.push(o);});
        expect(units).toHaveLength(n);expect(oxygen).toHaveLength(n);expect(hydrogen).toHaveLength(2*n);
        const now=units.map(u=>[u.userData.id,u.userData.substance,u.userData.radius]);identity??=now;expect(now).toEqual(identity);
        expect(new Set(oxygen.map(o=>o.geometry.parameters.radius))).toEqual(new Set([.047]));
        expect(new Set(hydrogen.map(o=>o.geometry.parameters.radius))).toEqual(new Set([.029]));
        mounted.advanceTime(8000);expect(mounted.snapshot().elapsedMs).toBe(8000);mounted.advanceTime(Infinity);expect(mounted.snapshot().elapsedMs).toBe(8000);
        mounted.dispose();expect(parent.children).toHaveLength(0);
      }
    }
  });
});
