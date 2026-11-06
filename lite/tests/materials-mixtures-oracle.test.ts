import { expect, test } from 'vitest';
// @ts-expect-error The stage's actual Three.js graph is tested at runtime.
import * as THREE from 'three';
import { rng } from '../src/engine/rng';
import { itemIdentity } from '../src/engine/item-identity';
import { materialsMixturesSpecs } from '../src/content/materials-mixtures';
import { applyMatterAction, checkMaterialsActivity, checkMaterialsMixtures, replayMatter,
  type MatterLedger, type MatterAction, type MaterialsMixturesTask, type MaterialsMixturesResponse } from '../src/content/models/materials-mixtures';
import { materialsMixturesScene } from '../src/content/models/materials-mixtures-scene';
// @ts-expect-error JS stage exports are exercised through actual geometry and lifecycle.
import { mountMaterialsMixturesStage } from '../src/world/materials-mixtures-stage.js';

function totals(ledger:MatterLedger,vessel?:string){
  const roots=new Map<string,bigint>();
  for(const v of ledger.vessels)if(!vessel||v.id===vessel)for(const parcel of v.parcels)
    roots.set(parcel.root,(roots.get(parcel.root)??0n)+BigInt(parcel.massMg));
  return Object.fromEntries([...roots].sort(([a],[b])=>a.localeCompare(b)));
}
function act(run:string,id:string,source:string,method:MatterAction['method'],target:string,residue:string):MatterAction{
  return {run,id,source,method,target,residue};
}
function expectedResponse(task:MaterialsMixturesTask):MaterialsMixturesResponse{
  const values:Record<string,string>={},actions:MatterAction[]=[];
  if(task.samples){
    if(!['compare','property'].includes(task.skill))for(const sample of task.samples)
      values[`material:${sample.id}`]=sample.transmission>0?'glass':sample.absorption>0?'wood':'metal';
    if(task.property){
      const ordered=[...task.samples].sort((a,b)=>a[task.property!]-b[task.property!]);
      values.difference=String(ordered.at(-1)![task.property]-ordered[0]![task.property]);
      // Pick the last equally good sample to exercise a valid alternative choice.
      const best=task.choose==='min'?ordered[0]![task.property]:ordered.at(-1)![task.property];
      values.choice=task.samples.filter(s=>s[task.property!]===best).at(-1)!.id;
    }
    for(const observation of task.observations??[])values[`property:${observation.id}`]=
      observation.text.includes('läpi')?'transmission':observation.text.includes('taipuu')?'bend':
        observation.text.includes('naarmuta')?'hardness':'opinion';
  }
  if(task.levels)Object.assign(values,{object:'object',material:'material',substance:'substance'});
  for(const state of task.states??[]){
    const behavior=state.behavior.toLowerCase();
    values[`state:${state.id}`]=behavior.includes('puristettaessa')||behavior.includes('tilavuus pienenee selvästi')?'gas':behavior.includes('virtaa')?'liquid':'solid';
    if(task.stateExperiment==='compress')values[`change:${state.id}`]=behavior.includes('pienenee selvästi')?'smaller':'same';
    actions.push(act(task.run,`${state.id}:observe`,state.id,'reshape',`${state.id}:output`,`${state.id}:residue`));
  }
  if(task.phase){
    const text=task.phase.temperature;
    const [before,after,change]=text.startsWith('Jäätä')?['solid','liquid','melting']:
      text.startsWith('Vesihöyryä')?['gas','liquid','condensation']:
        text.startsWith('Vettä jäähdytetään')?['liquid','solid','freezing']:['liquid','gas','evaporation'];
    Object.assign(values,{before,after,change,mass:String(task.phase.massMg)});
    actions.push({...act(task.run,'water:observe','water','phase','water:output','water:residue'),phase:after as 'solid'|'liquid'|'gas'});
  }
  for(const sample of task.compositions??[]){
    const species=new Set(sample.substances.filter(s=>s.count>0).map(s=>s.formula)).size;
    values[`species:${sample.id}`]=String(species);
    values[`class:${sample.id}`]=task.skill==='pure'?(species===1?'pure':'mixture'):(sample.phases>1?'heterogeneous':'homogeneous');
  }
  const dissolved:bigint[]=[];
  for(const trial of task.trials??[]){
    const dose=BigInt(trial.doseMg),capacity=BigInt(trial.capacityMg),remaining=dose>capacity?dose-capacity:0n;
    dissolved.push(dose-remaining);
    values[`dissolved:${trial.id}`]=String(dose-remaining);values[`left:${trial.id}`]=String(remaining);values[`solvent:${trial.id}`]=trial.solvent;
    actions.push({...act(task.run,`${trial.id}:dissolve`,trial.id,'dissolve',`${trial.id}:output`,`${trial.id}:residue`),capacityMg:trial.capacityMg});
  }
  if(dissolved.length){
    values.comparison=dissolved[0]===dissolved[1]?'equal':dissolved[0]!>dissolved[1]!?'a':'b';
    if(task.skill==='solution')Object.assign(values,{mixture:'homogeneous',mass:String(task.trials![0]!.solventMg+task.trials![0]!.doseMg)});
  }
  for(const station of task.stations??[]){
    const allocations=new Map<string,{out:bigint;residue:bigint;gas:bigint}>();
    for(const parcel of station.initial.parcels){
      const amount=BigInt(parcel.massMg);
      const retained=station.method==='filter'&&parcel.phase==='solid'&&parcel.zone!=='dissolved'&&parcel.grainUm!>station.poreUm;
      const liquid=parcel.phase==='liquid'||parcel.zone==='dissolved';
      const out=station.method==='decant'?(liquid?amount-amount/4n:0n):station.method==='filter'&&!retained?amount:0n;
      const gas=station.method==='evaporate'&&parcel.volatile?amount:0n;
      allocations.set(parcel.root,{out,residue:amount-out-gas,gas});
    }
    const desired=allocations.get(station.targetRoot)!;
    const target=station.targetBin==='output'?desired.out:desired[station.targetBin];
    const original=station.initial.parcels.filter(p=>p.root===station.targetRoot).reduce((s,p)=>s+BigInt(p.massMg),0n);
    const carrier=station.initial.parcels.find(p=>p.phase==='liquid')!;
    const solute=station.initial.parcels.find(p=>p.zone==='dissolved');
    const output=station.method==='evaporate'?'gas':'out';
    Object.assign(values,{[`method:${station.id}`]:station.method,[`target:${station.id}`]:String(target),
      [`remaining:${station.id}`]:String(original-target),[`solvent:${station.id}`]:String(allocations.get(carrier.root)![output]),
      [`dissolved:${station.id}`]:String(solute?allocations.get(solute.root)![output]:0),
      [`residue:${station.id}`]:String([...allocations.values()].reduce((n,parcel)=>n+parcel.residue,0n)),
      ...(station.method==='decant'?{[`sample:${station.id}`]:'settled'}:{})});
    actions.push({...act(task.run,`${station.id}:operate`,station.id,station.method,`${station.id}:${station.method==='evaporate'?'gas':'output'}`,`${station.id}:residue`),poreUm:station.poreUm});
  }
  return {kind:'materials-mixtures',mode:task.mode,values,actions,predictionsLocked:true,
    ...(task.review?{review:{observations:Object.fromEntries(task.review.rubric.map(c=>[c.id,'met' as const])),confirmedByAdult:true,assistance:'none' as const}}:{})};
}

test('independent whole-system allocation, phase meaning and rubric boundary across all16',()=>{
  let generated=0,reviewed=0;
  for(const spec of materialsMixturesSpecs)for(const phase of ['independent','transfer'] as const)for(let seed=0;seed<96;seed++){
    const task=spec.item(rng(seed),phase).task,response=expectedResponse(task);
    expect(checkMaterialsMixtures(task,response),`${spec.id}/${phase}/${seed}`).toMatchObject({ok:true});
    expect(checkMaterialsActivity(task,{...response,predictionsLocked:1 as unknown as boolean}).ok).toBe(false);
    const inherited=Object.assign(Object.create(response.values),Object.fromEntries(Object.keys(response.values).map((_,i)=>['dummy'+i,'0'])));
    expect(checkMaterialsActivity(task,{...response,values:inherited}).ok).toBe(false);
    if(response.actions.length){
      const phantom=response.actions.map(action=>Object.assign(Object.create(action),Object.fromEntries(Object.keys(action).map((_,i)=>['dummy'+i,true]))));
      expect(checkMaterialsActivity(task,{...response,actions:phantom}).ok).toBe(false);
      expect(checkMaterialsActivity(task,{...response,actions:response.actions.slice(1)}).ok).toBe(false);
      expect(checkMaterialsActivity(task,{...response,actions:response.actions.map(a=>({...a,run:'another-run'}))}).ok).toBe(false);
      expect(materialsMixturesScene(task,{...response,predictionsLocked:'true' as unknown as boolean})?.operated??0).toBe(0);
    }
    for(const key of Object.keys(response.values)){
      const raw=response.values[key]!;
      const wrong=/^\d+$/.test(raw)?String(BigInt(raw)+1n):'invalid';
      expect(checkMaterialsMixtures(task,{...response,values:{...response.values,[key]:wrong}}).ok).toBe(false);
    }
    if(task.review){
      expect(checkMaterialsMixtures(task,{...response,review:undefined}).pendingReview).toBe(true);
      const {assistance:_assistance,...missing}=response.review!;
      expect(checkMaterialsMixtures(task,{...response,review:missing as MaterialsMixturesResponse['review']}).pendingReview).toBe(true);
      expect(checkMaterialsMixtures(task,{...response,review:{...response.review!,assistance:'helped'}})).toMatchObject({ok:true,assisted:true,observedByAdult:true});
      reviewed++;
    }
    const scene=materialsMixturesScene(task,response);
    if(scene){
      const final=replayMatter(task,response.actions);
      expect(scene.vessels.map(v=>({id:v.id,parcels:v.parcels}))).toEqual(final.vessels.map(v=>({id:v.id,parcels:v.parcels})));
    }
    generated++;
  }
  expect(generated).toBe(3072);expect(reviewed).toBe(960);
});

test('240 chained exact mass ledgers retain dissolved matter, sediment and all vapour',()=>{
  let cases=0,actualGraphs=0;
  for(const water of [1600,3200,6400,12000])for(const dose of [80,160,400,800])for(const capacity of [0,40,160,400,1200])for(const grain of [10,20,30]){
    let ledger:MatterLedger={run:'peer',applied:[],vessels:[{id:'cup',label:'Annettu näyte',parcels:[
      {id:'water',root:'water',substance:'Liuotin',massMg:water,phase:'liquid',zone:'bulk',volatile:true},
      {id:'dose',root:'dose',substance:'Haihtumaton malliaine',massMg:dose,phase:'solid',zone:'bulk',grainUm:grain,volatile:false},
    ]}]};
    const original=structuredClone(ledger),whole=totals(ledger),dissolved=Math.min(dose,capacity),undissolved=dose-dissolved;
    const action={...act('peer','dissolve','cup','dissolve','unused-out','unused-residue'),capacityMg:capacity};
    const step=(action:MatterAction)=>{
      const before=structuredClone(ledger),next=applyMatterAction(ledger,action);
      expect(ledger).toEqual(before);expect(totals(next)).toEqual(whole);
      for(const parcel of next.vessels.flatMap(v=>v.parcels)){
        expect(parcel.massMg).toBeGreaterThan(0);expect(Number.isSafeInteger(parcel.massMg)).toBe(true);
        expect(parcel.substance).toBe(parcel.root==='water'?'Liuotin':'Haihtumaton malliaine');
      }
      ledger=next;
    };
    step(action);
    expect(ledger.vessels[0]!.parcels.filter(p=>p.zone==='dissolved').reduce((n,p)=>n+p.massMg,0)).toBe(dissolved);
    expect(ledger.vessels[0]!.parcels.filter(p=>p.zone==='dissolved').every(p=>p.phase==='solution')).toBe(true);
    const once=ledger;expect(applyMatterAction(ledger,action)).toBe(once);
    expect(applyMatterAction(ledger,{...action,run:'other'})).toBe(once);
    step({...action,id:'dissolve-again'});
    expect(ledger.vessels[0]!.parcels.filter(p=>p.zone==='dissolved').reduce((n,p)=>n+p.massMg,0)).toBe(dissolved);
    step({...act('peer','filter','cup','filter','filtrate','filter-residue'),poreUm:20});
    step(act('peer','settle','filtrate','settle','unused-out','unused-residue'));
    step(act('peer','decant','filtrate','decant','top','bottom'));
    const expectedDoseTop=BigInt(dissolved)*3n/4n;
    const expectedDoseBottom=BigInt((grain<=20?undissolved:0)+dissolved/4);
    const top:Record<string,bigint>={water:BigInt(water)*3n/4n};
    const bottom:Record<string,bigint>={water:BigInt(water)/4n};
    if(expectedDoseTop)top.dose=expectedDoseTop;
    if(expectedDoseBottom)bottom.dose=expectedDoseBottom;
    expect(totals(ledger,'top')).toEqual(top);
    expect(totals(ledger,'bottom')).toEqual(bottom);
    step(act('peer','evaporate-top','top','evaporate','environment-gas','top-crystals'));
    step(act('peer','evaporate-bottom','bottom','evaporate','environment-gas','bottom-crystals'));
    expect(totals(ledger,'environment-gas')).toEqual({water:BigInt(water)});
    expect(totals(ledger)).toEqual({dose:BigInt(dose),water:BigInt(water)});
    expect(ledger.vessels.find(v=>v.id==='environment-gas')!.parcels.every(p=>p.phase==='gas'&&p.zone==='environment')).toBe(true);
    if(cases%8===0){
      for(const sample of [original,ledger]){
        const parent=new THREE.Group();
        const stage=mountMaterialsMixturesStage(parent,{kind:'materials-mixtures',title:'Peer',mode:'separate',operated:sample.applied.length,
          vessels:sample.vessels.map(v=>({...v,shape:'tall'})),legend:'Milligrammoina ilmoitetut aine-erät'});
        const masses=new Map<string,bigint>();let packets=0;
        parent.traverse((object:{name:string;userData:Record<string,unknown>;children:unknown[]})=>{
          if(!object.name.startsWith('parcel:'))return;
          expect(object.children.length).toBeGreaterThan(0);
          const root=String(object.userData.root);masses.set(root,(masses.get(root)??0n)+BigInt(Number(object.userData.massMg)));packets++;
        });
        expect(Object.fromEntries([...masses].sort(([a],[b])=>a.localeCompare(b)))).toEqual(whole);
        expect(packets).toBe(sample.vessels.flatMap(v=>v.parcels).length);
        stage.dispose();stage.dispose();expect(parent.children).toHaveLength(0);actualGraphs++;
      }
    }
    cases++;
  }
  expect(cases).toBe(240);expect(actualGraphs).toBe(60);
});


test('homogeneous mixtures have actual phase geometry and scale-free region shares',()=>{
  const spec=materialsMixturesSpecs.find(spec=>spec.id==='CHEM79-MIX-HOM')!;
  let cases=0;
  for(const phase of ['independent','transfer'] as const)for(let seed=0;seed<48;seed++){
    const task=spec.item(rng(seed),phase).task,scene=materialsMixturesScene(task)!;
    expect(scene.mode).toBe('composition');expect(scene.vessels).toHaveLength(0);
    const parent=new THREE.Group(),stage=mountMaterialsMixturesStage(parent,scene);
    for(const sample of task.compositions!){
      const group=parent.getObjectByName(`composition:${sample.id}`)!;
      expect(group).toBeDefined();
      const layered=sample.regions.some((region,i)=>i>0&&region.some((n,j)=>n!==sample.regions[0]![j]));
      expect(!!group.getObjectByName('separate-upper-phase')).toBe(sample.phases>1&&layered);
      expect(!!group.getObjectByName('dispersed-phase-boundary')).toBe(sample.phases>1&&!layered);
      sample.regions.forEach((region,index)=>{
        const actual:Record<string,number>={};
        group.getObjectByName(`region:${index+1}`)!.traverse((object:{name:string;userData:Record<string,unknown>})=>{
          if(object.name!=='qualitative-substance-symbol')return;
          expect(object.userData.units).toBe('scale-free-model-shares');expect(object.userData.massMg).toBeUndefined();
          actual[String(object.userData.substance)]=Number(object.userData.modelShares);
        });
        const wanted=Object.fromEntries(region.flatMap((count,i)=>count?[[sample.substances[i]!.name,count]]:[]));
        expect(actual).toEqual(wanted);
      });
    }
    stage.dispose();stage.dispose();expect(parent.children).toHaveLength(0);cases++;
  }
  expect(cases).toBe(96);
});


test('identical authored givens share operational run and evidence identity across seeds',()=>{
  const spec=materialsMixturesSpecs.find(spec=>spec.id==='ENV-CHEM-STATE-01')!;
  const seen=new Map<string,ReturnType<typeof spec.item>>();
  let repeats=0;
  for(let seed=0;seed<160;seed++){
    const item=spec.item(rng(seed),'independent');
    const signature=itemIdentity({...item,task:{...item.task,run:''}});
    const previous=seen.get(signature);
    if(previous){
      expect(item.task.run).toBe(previous.task.run);
      expect(itemIdentity(item)).toBe(itemIdentity(previous));
      repeats++;
    }else seen.set(signature,item);
  }
  expect(repeats).toBeGreaterThan(0);expect(seen.size).toBeGreaterThanOrEqual(8);
});
