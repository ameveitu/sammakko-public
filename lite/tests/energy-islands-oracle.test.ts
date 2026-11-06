import { describe, expect, it } from 'vitest';
import { energyIslandsSpecs } from '../src/content/energy-islands';
import { bounceAt, checkEnergyIslands, collisionLedger, energyIslandsScene,
  type EnergyIslandsResponse, type EnergyIslandsTask } from '../src/content/models/energy-islands';
import { rng } from '../src/engine/rng';

const kind = 'energy-islands' as const;
const fixed = (n:number) => Number(n.toFixed(2));
function independentReply(task:EnergyIslandsTask):EnergyIslandsResponse {
  const m=task.input;
  const response:EnergyIslandsResponse={kind,locked:true,actionApplied:true,observed:true,values:{}};
  switch(m.kind){
    case 'kinetic':
      response.values={before:m.mass*m.speed**2/2,after:m.targetMass*m.targetSpeed**2/2};
      response.controls={mass:m.targetMass,speed:m.targetSpeed};
      break;
    case 'potential':
      response.values={before:m.mass*m.g*(m.height-m.reference),after:m.targetMass*m.g*(m.targetHeight-m.targetReference)};
      response.controls={mass:m.targetMass,height:m.targetHeight,reference:m.targetReference};
      break;
    case 'ledger':response.values={thermal:m.initial-m.useful,total:m.initial};break;
    case 'bounce':{
      const total=m.mass*m.g*m.height;
      const rebound=m.restitution**2*total;
      response.values={remaining:fixed(rebound),thermal:fixed(total-rebound),total};
      break;
    }
    case 'form':
      response.choice=m.context==='warm-stone'?'thermal':m.context==='raised-load'?'potential':'kinetic';
      break;
    case 'chain':
      response.order={
        'water-lamp':['water-motion','electric-transfer','light-and-heat'],
        'battery-toy':['battery-chemical','electric-transfer','motion-and-heat'],
        charger:['grid-source','electric-transfer','battery-and-heat'],
      }[m.context];
      response.values={thermal:m.initial-m.useful,total:m.initial};
      break;
    case 'transfer':{
      const given={
        'water-wheel':['transfer','water','wheel'], lamp:['conversion','electric','light'], charger:['both','electric','battery'],
      }[m.context]!;
      response.choice=given[0];
      response.participants={from:given[1]!,to:given[2]!};
      break;
    }
    case 'source':
      response.choice=m.source;
      response.order=[m.source,m.source==='sun'?'solar-cell':'generator','electricity',m.endUse];
      break;
    case 'renew':
      response.values={renewable:m.resource==='coal'?0:1,balance:m.renewed>=m.used?1:0,
        variable:m.resource==='wind'||m.resource==='solar'?1:0};
      break;
    case 'impact':
      response.choice=m.options.find(o=>o.available>=m.need&&o.habitatImpact<=m.maxImpact)?.id;
      break;
  }
  if(task.review){
    response.confirmedByAdult=true;
    response.assistance='none';
    response.observations=Object.fromEntries(task.review.criteria.map(c=>[c.id,'met']));
  }
  return response;
}

describe('independent energy island oracle',()=>{
  it('preserves the closed account throughout the fall, impact and first rebound',()=>{
    let frames=0,impacts=0;
    for(const mass of [.5,1,2,5,8])for(const height of [0,1,2.5,5,10])
      for(const g of [9.8,10,12])for(const e of [0,.2,.5,.8,1]){
        const initial=mass*g*height;
        const rebound=height*e**2;
        const thermal=mass*g*(height-rebound);
        const drop=Math.sqrt(2*height/g),duration=drop*(1+e);
        const impact=collisionLedger(mass,Math.sqrt(2*g*height),e);
        expect(impact.remaining).toBeCloseTo(mass*g*rebound,8);
        expect(impact.thermal).toBeCloseTo(thermal,8);
        impacts++;
        const stop=bounceAt(mass,height,g,e,duration+1);
        expect(stop.height).toBeCloseTo(rebound,8);
        expect(stop.kinetic).toBeCloseTo(0,8);
        for(let i=0;i<16;i++){
          const time=duration*i/15;
          const frame=bounceAt(mass,height,g,e,time);
          expect(frame.kinetic+frame.potential+frame.thermal).toBeCloseTo(initial,8);
          expect(frame.thermal).toBeCloseTo(time<drop?0:thermal,8);
          expect(frame.speed).toBe(Math.abs(frame.velocityY));
          frames++;
        }
      }
    expect({frames,impacts}).toEqual({frames:6000,impacts:375});
  });

  it('checks all ten authored generators, own controls, hostile values and adult observations',()=>{
    const summer=new Set<string>();
    let generated=0,storms=0;
    for(const spec of energyIslandsSpecs)for(const phase of ['independent','transfer'] as const)for(let seed=0;seed<128;seed++){
      const task=spec.item(rng(seed),phase).task as unknown as EnergyIslandsTask;
      const reply=independentReply(task),m=task.input;
      expect(checkEnergyIslands(task,reply).ok,`${spec.id}/${phase}/${seed}`).toBe(true);
      expect(checkEnergyIslands(task,{...reply,locked:false}).ok).toBe(false);
      expect(checkEnergyIslands(task,{...reply,actionApplied:false}).ok).toBe(false);
      expect(energyIslandsScene(task,{...reply,observed:false}).outcome).toBeUndefined();
      expect(energyIslandsScene(task,reply).outcome?.values).toEqual(reply.values);
      for(const key of Object.keys(reply.values))
        expect(checkEnergyIslands(task,{...reply,values:{...reply.values,[key]:NaN}}).ok).toBe(false);
      for(const [key,n] of Object.entries(reply.controls??{}))
        expect(checkEnergyIslands(task,{...reply,controls:{...reply.controls,[key]:n+1}}).ok).toBe(false);
      if(task.review){
        const forged=Object.assign(Object.create(reply.observations!),
          Object.fromEntries(task.review.criteria.map((_,i)=>[`unknown${i}`,'met'])));
        expect(checkEnergyIslands(task,{...reply,observations:forged})).toMatchObject({ok:false,pendingReview:true});
        expect(checkEnergyIslands(task,{...reply,assistance:'helped'})).toMatchObject({ok:true,observedByAdult:true,assisted:true});
      }
      if(m.kind==='impact'){
        const feasible=m.options.filter(o=>o.available>=m.need&&o.habitatImpact<=m.maxImpact).map(o=>o.id);
        for(const option of m.options)expect(checkEnergyIslands(task,{...reply,choice:option.id}).ok).toBe(feasible.includes(option.id));
        if(m.season==='summer'){
          summer.add(feasible.join(','));
          const [a,b]=m.options;
          expect(a!.available).toBeLessThan(b!.available);
          expect(a!.habitatImpact).toBeLessThan(b!.habitatImpact);
          expect([a!.variability,b!.variability]).toEqual(['high','low']);
        }
        if(phase==='transfer'){
          expect(m.scenario).toBe('storm');
          expect(m.need).toBeGreaterThanOrEqual(17);
          expect(m.need).toBeLessThanOrEqual(20);
          expect(m.options.find(o=>o.id==='b')?.available).toBe(22);
          expect(feasible).toEqual(['b']);
          storms++;
        }
      }
      generated++;
    }
    expect(summer).toEqual(new Set(['a','a,b']));
    expect({generated,storms}).toEqual({generated:2560,storms:128});
  });
});
