import { describe, expect, it } from 'vitest';
import { rng } from '../src/engine/rng';
import { check } from '../src/engine/check';
import { forceWorkshopSpecs, forceWorkshopEvidence } from '../src/content/force-workshop';
import { derivedForces, horizontalMotion, slidingOnSurface, slidingDisplacement, directionOf, frictionOpposing, netOn, normalDirection, vectorLengthCm, weightNewtons } from '../src/content/models/force-workshop';

describe('force workshop models',()=>{
  it('adds only forces on the named body and does not cancel a reaction on another body',()=>{
    const pair=[{from:'köysi',on:'vaunu',signedN:8},{from:'vaunu',on:'köysi',signedN:-8},{from:'kitka',on:'vaunu',signedN:-3}];
    expect(netOn('vaunu',pair)).toBe(5);expect(netOn('köysi',pair)).toBe(-8);
    expect(directionOf(netOn('vaunu',pair))).toBe('right');
    expect(netOn('vaunu',[{from:'A',on:'vaunu',signedN:5},{from:'B',on:'vaunu',signedN:-5}])).toBe(0);
    expect(directionOf(0)).toBe('zero');
  });
  it('uses relative slip including when friction points with room velocity',()=>{
    expect(frictionOpposing(1-3)).toBe('right'); // object 1 m/s, belt 3 m/s
    expect(frictionOpposing(3-1)).toBe('left');
    expect(frictionOpposing(0)).toBe('zero'); // no asserted slip tendency in this helper
    expect(frictionOpposing(-1)).toBe('right'); // backward slip tendency at foot
  });
  it('uses bounded motion and never accelerates relative sliding through zero',()=>{
    expect(horizontalMotion(0,2,2,2)).toEqual({acceleration:1,velocity:2,displacement:2});
    expect(slidingOnSurface(-2,1,1,1)).toBe(-1);
    expect(slidingOnSurface(-2,4,1,1)).toBe(0);
    expect(slidingOnSurface(2,4,1,1)).toBe(0);
    expect(slidingDisplacement(-2,3,4,1,.5)).toBe(1);
    expect(slidingDisplacement(-2,3,4,1,2)).toBe(5.5);
    expect(slidingDisplacement(-2,3,1,1,.5)).toBe(.625);
    expect(()=>horizontalMotion(0,1,0,1)).toThrow();
  });
  it('keeps normal direction, mass, weight and vector scales distinct',()=>{
    expect(normalDirection('flat')).toBe('up');expect(normalDirection('ramp-right')).toBe('up-left');expect(normalDirection('wall-right')).toBe('left');
    expect(weightNewtons(3,10)).toBe(30);expect(weightNewtons(3,1.6)).toBe(4.8);
    expect(weightNewtons(0,10)).toBe(0);expect(()=>weightNewtons(-1,10)).toThrow();
    expect(vectorLengthCm(6,2)).toBe(3);expect(()=>vectorLengthCm(6,0)).toThrow();
  });
  it('derives revealed arrows from input facts without adding forces to other bodies',()=>{
    expect(derivedForces({body:'vaunu',inputs:{kind:'net',forces:[{from:'A',on:'vaunu',signedN:7},{from:'B',on:'vaunu',signedN:-3},{from:'vaunu',on:'A',signedN:-7}]}})).toEqual([{from:'yhteisvaikutus',on:'vaunu',name:'kokonaisvoima',direction:'right',newtons:4}]);
    expect(derivedForces({body:'jalka',inputs:{kind:'friction',relativeSlip:-1}})[0]?.direction).toBe('right');
    expect(derivedForces({body:'laatikko',inputs:{kind:'support',surface:'ramp-right'}})[0]?.direction).toBe('up-left');
    expect(derivedForces({body:'kuorma',inputs:{kind:'weight',massKg:3,gravityNPerKg:1.6,source:'Kuu'}})[0]?.newtons).toBe(4.8);
  });
  it('requires both vector aspects as separate families and has production, wrong and transfer cases for every node',()=>{
    expect(forceWorkshopSpecs).toHaveLength(10);
    expect(forceWorkshopEvidence['PHY79-FORCE-01']?.families).toEqual(['magnitude','direction']);
    for(const spec of forceWorkshopSpecs) {
      const families=new Set(Array.from({length:100},(_,seed)=>spec.item(rng(seed),'independent').tag));
      expect([...families].sort()).toEqual([...forceWorkshopEvidence[spec.id]!.families].sort());
      expect(spec.item(rng(5),'transfer').tag).toBe('transfer');
      for(let seed=0;seed<25;seed++) for(const phase of ['independent','transfer'] as const) {
        const item=spec.item(rng(seed),phase),task=item.task;
        expect(task.kind).toBe('place');
        if(task.kind!=='place') throw new Error('Expected construction');
        expect(new Set(task.tokens.map(t=>t.id)).size).toBe(task.tokens.length);
        expect(Object.keys(task.answer).sort()).toEqual(task.slots.map(s=>s.id).sort());
        for(const id of Object.values(task.answer)) expect(task.tokens.some(t=>t.id===id)).toBe(true);
        expect(check(task,{kind:'place',map:task.answer}).ok).toBe(true);
        expect(check(task,{kind:'place',map:{}}).ok).toBe(false);
        expect(item.afterCorrect).toBeTypeOf('function');
        const view=(item as typeof item & {sceneModel:{body:string;inputs:Parameters<typeof derivedForces>[0]['inputs']}}).sceneModel;
        expect(view.inputs).toBeDefined();
        expect(derivedForces(view).every(force=>force.on===view.body)).toBe(true);
        if(spec.id==='PHY79-FORCE-01') expect(Object.keys(task.answer).sort()).toEqual(['body','dir','length']);
      }
    }
  });
});
