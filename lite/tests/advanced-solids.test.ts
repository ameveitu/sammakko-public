import { describe, expect, it } from 'vitest';
import { advancedSolidsSpecs } from '../src/content/advanced-solids';
import {
  checkAdvancedSolids, debugAdvancedSolidsScene, solidNumericInput, solutionAdvancedSolids,
  type AdvancedSolidsResponse, type AdvancedSolidsTask, type MeasurementField, type SolidGroup, type SolidWitness,
} from '../src/content/models/advanced-solids';
import { advancedSolidsScene } from '../src/content/scenes/advanced-solids';
import { rng } from '../src/engine/rng';

const kind = 'advanced-solids' as const;
type Q = readonly [number,number];
const multiply = ([a,b]:Q,[c,d]:Q):Q=>[a*c,b*d];
const add = ([a,b]:Q,[c,d]:Q):Q=>[a*d+b*c,b*d];
const text = ([a,b]:Q)=>`${a*7}/${b*7}`;
const ratio = (x:number):Q=>[x*2,2];
const numeric = ([a,b]:Q)=>a/b;
const solve = (task:AdvancedSolidsTask):AdvancedSolidsResponse => {
  if(task.mode==='identify'){
    const byKind: Record<string,SolidGroup> = {column:'column',cone:'cone',sphere:'sphere',flat:'flat',ellipsoid:'other',frustum:'other'};
    const entries=task.figures.map(({id,shape})=>{
      const label=byKind[shape.kind]!,group=task.target==='all'||label===task.target?label:'other';
      const witness:SolidWitness={group};
      if(group==='column'){witness.bases='6/3';witness.equalBases=true;}
      if(group==='cone'){witness.bases='5/5';witness.tips='8/8';}
      if(shape.kind==='sphere'&&group==='sphere')witness.radii=Array.from({length:3},()=>text(ratio(shape.radius)));
      return [id,witness] as const;
    });
    return {kind,mode:'identify',choices:Object.fromEntries(entries)};
  }
  if(task.mode==='convert'){
    const metre:Record<string,number>={'m³':1000,'dm³':100,'cm³':10,'mm³':1,l:100};
    const a=metre[task.from]!,b=metre[task.to]!;
    const step=Math.max(a,b)/Math.min(a,b);
    const common=Math.min(a,b);
    const value=multiply(ratio(task.amount),[(a/common)**3,(b/common)**3]);
    return {kind,mode:'convert',axes:Array(3).fill(String(step)),operation:a>b?'times':a<b?'divide':'same',
      factor:String(step**3),value:text(value),unit:task.to};
  }
  const {shape}=task.figure;
  const values:Partial<Record<MeasurementField,string>>={};
  const set=(key:MeasurementField,q:Q)=>{values[key]=text(q);};
  const surface=task.target==='surface',volume=task.target==='volume';
  let total:Q,withPi:boolean,radius:number|undefined,height:number|undefined;
  if(shape.kind==='sphere'){
    radius=shape.radius;
    withPi=true;
    const r2=multiply(ratio(radius),ratio(radius));
    if(surface){set('power',r2);total=multiply([4,1],r2);}
    else{
      set('power',multiply(r2,ratio(radius)));
      // Integrate the quadratic horizontal section by Simpson's rule.
      total=multiply([2*radius,6],multiply([4,1],r2));
    }
  }else{
    height=shape.height;
    const {base}=shape;
    let area:Q,perimeter:Q;
    withPi=base.kind==='circle';
    if(base.kind==='circle'){
      radius=base.radius;area=multiply(ratio(radius),ratio(radius));perimeter=[2*radius,1];
    }else{
      const {width,depth}=base;
      const vertices=base.kind==='rectangle'?[[0,0],[width,0],[width,depth],[0,depth]]:[[0,0],[width,0],[0,depth]];
      const [twiceA,p]=vertices.reduce(([a,p],[x,y],i)=>{
        const [u,v]=vertices[(i+1)%vertices.length]!;
        return [a+x*v-u*y,p+Math.hypot(x-u,y-v)];
      },[0,0]);
      area=[twiceA,2];perimeter=[p,1];
    }
    if(!surface||shape.caps)set('baseArea',area);
    if(surface){
      let lateral:Q;
      if(shape.kind==='column'){set('perimeter',perimeter);lateral=multiply(perimeter,ratio(height));}
      else{
        const slope=Math.hypot(radius!,height);
        expect(slope).toBe(shape.slant);
        set('slant',ratio(slope));
        // The sector keeps the base circumference, so its fraction of a full disk is r/l.
        lateral=multiply(ratio(radius!),ratio(slope));
      }
      set('lateral',lateral);set('caps',[shape.caps,1]);
      total=add(lateral,multiply(area,[shape.caps,1]));
    }else if(volume){
      const prism=multiply(area,ratio(height));
      total=shape.kind==='cone'?multiply(prism,[1,3]):prism;
      if(shape.kind==='cone')set('factor',[1,3]);
    }else{
      total=multiply(ratio(task.givenVolume!),[area[1],area[0]]);
      expect(numeric(total)).toBe(height);
      withPi=false;
    }
  }
  if(radius!==undefined)set('radius',ratio(radius));
  if(task.compare){
    const size=task.compare.earlierRadius?ratio(radius!):[1,1] as const;
    const original=task.compare.earlierRadius?ratio(task.compare.earlierRadius):[1,1] as const;
    const r=multiply(size,[original[1],original[0]]);
    const h=task.compare.earlierHeight?[height!,task.compare.earlierHeight] as const:[1,1] as const;
    const scale=multiply(multiply(r,r),shape.kind==='sphere'&&volume?r:h);
    if(task.compare.factor)set('scale',scale);
    set('total',total);
    return {kind,mode:'measure',values,unit:task.unit+(surface?'²':volume?'³':''),notation:task.result==='approx'?'approx':'exact',
      rounded:(numeric(total)*(withPi?Math.PI:1)).toFixed(2),locked:true,prediction:numeric(scale)>1?'greater':numeric(scale)<1?'less':'same',
      fillStep:task.demoFill?3:0};
  }
  set('total',total);
  return {kind,mode:'measure',values,unit:task.unit+(surface?'²':volume?'³':''),notation:task.result==='approx'?'approx':'exact',
    rounded:(numeric(total)*(withPi?Math.PI:1)).toFixed(2),fillStep:task.demoFill?3:0};
};
const at=(id:string,seed:number,transfer=false)=>advancedSolidsSpecs.find(n=>n.id===id)!
  .item(rng(seed),transfer?'transfer':'independent').task as unknown as AdvancedSolidsTask;

describe('Kuppelikaupungin geometry and volume oracle',()=>{
  it('accepts independent calculations in all authored families and transfer',()=>{
    for(const spec of advancedSolidsSpecs){
      const families=new Set<string>(), signatures=new Set<string>();
      for(const phase of ['independent','transfer'] as const)for(let seed=0;seed<84;seed++){
        const item=spec.item(rng(seed),phase),task=item.task as unknown as AdvancedSolidsTask;
        const response=solve(task);
        expect(checkAdvancedSolids(task,response),`${spec.id}/${phase}/${seed}`).toEqual({ok:true});
        expect(checkAdvancedSolids(task,solutionAdvancedSolids(task)).ok).toBe(true);
        const sig=task.mode==='identify'?task.figures.map(f=>f.shape):task.mode==='measure'?
          [task.figure.shape,task.target,task.compare]:[task.from,task.to,task.amount];
        if(phase==='independent'){families.add(item.tag);signatures.add(JSON.stringify(sig));}
        if(response.mode==='measure'&&task.mode==='measure'){
          expect(checkAdvancedSolids(task,{...response,unit:'wrong'}).ok).toBe(false);
          expect(checkAdvancedSolids(task,{...response,values:{...response.values,total:'0'}}).ok).toBe(false);
          if(task.demoFill)expect(checkAdvancedSolids(task,{...response,fillStep:2}).ok).toBe(false);
          if(task.compare)expect(checkAdvancedSolids(task,{...response,locked:false}).ok).toBe(false);
        }
      }
      expect(signatures.size,spec.id).toBeGreaterThanOrEqual(8);
      expect(families).toEqual(new Set(spec.produce));
    }
  });

  it('separates shell selection, slant height and volume from the same geometry',()=>{
    const task=at('M79-CONE-SA',12,true);
    expect(task.mode).toBe('measure');
    if(task.mode!=='measure'||task.figure.shape.kind!=='cone')throw Error('Expected cone');
    const r=solve(task);
    if(r.mode!=='measure')throw Error('Expected measure');
    expect(task.figure.shape.caps).toBe(0);
    for(const values of [{...r.values,slant:String(task.figure.shape.height)},{...r.values,caps:'1'},Object.create(r.values)])
      expect(checkAdvancedSolids(task,{...r,values}).ok).toBe(false);
    expect(checkAdvancedSolids(task,{...r,notation:'approx',rounded:'1'}).ok).toBe(false);
    expect(checkAdvancedSolids(task,{...r,notation:'approx'}).ok).toBe(true);
  });

  it('preserves equal comparator geometry, waits for the observation and exposes a bounded stage state',()=>{
    const task=at('M79-CONE-V',12,true),r=solve(task);
    if(task.mode!=='measure'||r.mode!=='measure')throw Error('Expected measurement');
    const before=advancedSolidsScene(task),after=advancedSolidsScene(task,r);
    expect(before.figures.map(f=>f.id)).toEqual(['Uusi','Vertailu']);
    expect(after.figures.map(f=>f.id)).toEqual(['Ennen','Uusi','Vertailu']);
    expect(after.figures[1]!.shape).toMatchObject({height:(after.figures[2]!.shape as {height:number}).height});
    expect(after.figures[1]!.shape).toMatchObject({base:(after.figures[2]!.shape as {base:unknown}).base});
    expect(advancedSolidsScene(task,{...r,fillStep:50}).fillStep).toBe(0);
    expect(debugAdvancedSolidsScene(before).figures).toEqual(before.figures.map(({id,pose})=>({id,pose})));
    expect(JSON.stringify(debugAdvancedSolidsScene(before))).not.toContain('height');
  });

  it('maps base readiness to geometry, tests wrong cubic factors and masks arbitrary numeric text',()=>{
    for(const id of ['M79-CYL-SA','M79-CYL-V'])for(let seed=0;seed<32;seed++){
      const task=at(id,seed);
      if(task.mode!=='measure'||task.figure.shape.kind!=='column')throw Error('Expected column');
      expect(task.context).toEqual({kind:'solid-base',base:task.figure.shape.base.kind==='circle'?'circle':'polygon'});
    }
    const task=at('M79-UNIT-VOL',0,true),r=solve(task);
    if(r.mode!=='convert')throw Error('Expected conversion');
    expect(checkAdvancedSolids(task,{...r,factor:'10'}).ok).toBe(false);
    expect(checkAdvancedSolids(task,{...r,operation:'times'}).ok).toBe(false);
    expect(checkAdvancedSolids(task,{...r,axes:Array(3)}).ok).toBe(false);
    expect(solidNumericInput('a private draft')).toBe('');
    expect(solidNumericInput(' 12/8 ')).toBe('12/8');
  });

  it('requires the integration witnesses for all named geometric shapes',()=>{
    const task=at('M79-SOLID-01',5,true),r=solve(task);
    if(r.mode!=='identify')throw Error('Expected identification');
    for(const [id,witness] of Object.entries(r.choices)){
      if(witness.group==='other'||witness.group==='flat')continue;
      expect(checkAdvancedSolids(task,{...r,choices:{...r.choices,[id]:{group:witness.group}}}).ok).toBe(false);
      expect(checkAdvancedSolids(task,{...r,choices:{...r.choices,[id]:Object.create(witness)}}).ok).toBe(false);
    }
  });
});
