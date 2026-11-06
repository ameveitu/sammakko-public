import {it,expect} from 'vitest';
import * as THREE from 'three';
import {logicDryPoint,logicDryNormal,mountLogicWorkshopStage} from '../src/world/logic-workshop-stage';

it('the bounded route reaches the chosen basin and pause-by-no-advance preserves its pose',()=>{
  for(const direction of ['left','right'])for(let release=1;release<=4;release++){
    const parent=new THREE.Group(),stage=mountLogicWorkshopStage(parent,{kind:'logic-workshop',mode:'cause',apparatus:'dry',direction,release,length:4,observation:{side:direction,durationMs:4000}});
    const n=logicDryNormal(direction,release);expect(stage.snapshot().position[0]).toBeCloseTo(.3*n.x);stage.advanceTime(2000);
    const midpoint=stage.snapshot(),p=logicDryPoint(.25,direction,release,4);[p.x+.3*n.x,p.y+.3*n.y,p.z+.3*n.z].forEach((value,i)=>expect(midpoint.position[i]).toBeCloseTo(value,12));
    stage.advanceTime(-10);expect(stage.snapshot()).toEqual(midpoint);stage.advanceTime(20000);
    expect(stage.snapshot().position[0]).toBeCloseTo(logicDryPoint(1,direction,release,4).x+.3*n.x,12);expect(stage.snapshot().elapsed).toBe(4000);
    let disposed=0;parent.traverse(o=>o.geometry?.addEventListener('dispose',()=>disposed++));stage.dispose();expect(parent.children).toHaveLength(0);expect(disposed).toBeGreaterThan(70);
  }
});
it('draws the dry incline with the same length, slope and constant acceleration as its timing model',()=>{
  for(let length=2;length<=6;length++)for(let release=1;release<=4;release++)for(const direction of ['left','right']){
    const start=logicDryPoint(0,direction,release,length),end=logicDryPoint(1,direction,release,length);
    const distance=Math.hypot(end.x-start.x,end.y-start.y,end.z-start.z),height=start.y-end.y;
    expect(distance/.45).toBeCloseTo(length,12);expect(height/distance).toBeCloseTo(release/10,12);
    const n=logicDryNormal(direction,release);expect(Math.hypot(n.x,n.y,n.z)).toBeCloseTo(1,12);
    expect((end.x-start.x)*n.x+(end.y-start.y)*n.y+(end.z-start.z)*n.z).toBeCloseTo(0,12);
    for(const t of [.25,.5,.75]){const p=logicDryPoint(t*t,direction,release,length);expect(Math.hypot(p.x-start.x,p.y-start.y,p.z-start.z)/distance).toBeCloseTo(t*t,12);}
  }
});
it('two named views transform the same object identities',()=>{
  const objects=[{id:'a',shape:'sphere'},{id:'b',shape:'cube'},{id:'c',shape:'cone'}];
  for(const view of ['shore','water']){
    const parent=new THREE.Group(),stage=mountLogicWorkshopStage(parent,{kind:'logic-workshop',mode:'perspective',objects,view,blocks:false});
    expect(stage.snapshot().objects).toEqual(['a','b','c']);expect(stage.snapshot().rotation).toBe(view==='water'?Math.PI:0);
    parent.updateMatrixWorld(true);const points=[];parent.traverse(o=>{if(o.userData.identity)points.push({id:o.userData.identity,x:o.getWorldPosition(new THREE.Vector3()).x});});
    expect(points.sort((a,b)=>a.x-b.x).map(p=>p.id)).toEqual(view==='shore'?['a','b','c']:['c','b','a']);stage.dispose();
  }
});
