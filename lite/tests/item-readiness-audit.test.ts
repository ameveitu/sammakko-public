import {it,expect} from 'vitest';
import {NODES} from '../src/content/index';
import {WRITTEN_NODES} from '../src/content/written';
import {THINKING_NODES} from '../src/content/thinking';
import {ALGEBRA79_NODES} from '../src/content/algebra79';
import {SAARI1_NODES} from '../src/content/saari1';
import {PHYSICS_NODES} from '../src/content/physics';
import {decimalWorkshopSpecs} from '../src/content/decimal-workshop';
import {observedExplanationSpecs} from '../src/content/observed-explanations';
import {resolveItemReadinessContext} from '../src/content/item-readiness-context';
import {evaluateItemReadiness} from '../src/engine/item-readiness';
import {rng} from '../src/engine/rng';
import type {Item} from '../src/engine/types';

it('reads only the actually offered operation tokens in ordering tasks',()=>{
  const spec=WRITTEN_NODES.find(s=>s.id==='M-EXPR-01')!,seen=new Set<string>(),stepSets=new Set<string>();
  const names:Record<string,string>={'o+':'add','o−':'subtract','o×':'multiply','o:':'divide'};
  for(let seed=0;seed<250;seed++)for(const phase of ['independent','transfer'] as const){
    const item=spec.item(rng(seed),phase);seen.add(item.tag);
    const context=resolveItemReadinessContext(spec.id,item);expect(context?.kind).toBe('operation');if(context?.kind!=='operation')throw Error('operation');
    if(item.task.kind==='place'){
      expect(new Set(context.operations)).toEqual(new Set(item.task.tokens.map(t=>names[t.id])));stepSets.add([...context.operations].sort().join(','));
    }else expect(new Set(context.operations)).toEqual(new Set(item.tag==='sub'?['subtract','multiply']:['add','multiply']));
    // Availability must not be reverse engineered from any correct answer or explanation.
    const task={...item.task};Object.defineProperty(task,'answer',{get(){throw Error('answer-key read');}});
    expect(resolveItemReadinessContext(spec.id,{...item,task,say:'unrelated',hint:'unrelated',explain:'unrelated'})).toEqual(context);
  }
  expect(seen).toEqual(new Set(['mulFirst','paren','steps','sub','transfer']));expect(stepSets.size).toBe(2);
});
it('covers conversion and equation contexts supplied by actual authors while cloned unknown structures stay unresolved',()=>{
  const time=SAARI1_NODES.find(s=>s.id==='M-UNIT-05')!,physics=PHYSICS_NODES.find(s=>s.id==='PHY79-UNIT-CONV')!,equation=ALGEBRA79_NODES.find(s=>s.id==='M79-EQ1-SOLVE')!;
  let hhmm=0,mixed=0,ambiguous=0;
  for(let seed=0;seed<250;seed++){
    const t=time.item(rng(seed),'independent');if(t.tag==='hhmm'){hhmm++;expect(resolveItemReadinessContext(time.id,t)).toEqual({kind:'time-direction',operation:'divide'});}
    const p=physics.item(rng(seed),'independent');if(p.tag==='match'){mixed++;expect(resolveItemReadinessContext(physics.id,p)?.kind).toBe('conversions');}
    const e=equation.item(rng(seed),'independent');if(['two','both','moves'].includes(e.tag)){ambiguous++;expect(resolveItemReadinessContext(equation.id,e)?.kind).toBe('operation');}
    if(e.tag==='one')expect(resolveItemReadinessContext(equation.id,e)).toEqual({kind:'operation',domain:'integer',operations:['subtract']});
  }
  expect(hhmm).toBeGreaterThan(0);expect(mixed).toBeGreaterThan(0);expect(ambiguous).toBeGreaterThan(0);
  expect(resolveItemReadinessContext(time.id,time.item(rng(3),'transfer'))).toEqual({kind:'clock-transfer',rolloverMinutes:60,operations:['add','subtract']});
  expect(resolveItemReadinessContext(physics.id,{tag:'match',task:{kind:'place',slots:[],tokens:[]}})).toBeUndefined();
  expect(resolveItemReadinessContext(equation.id,{tag:'two',task:{kind:'numeric'}})).toBeUndefined();
  expect(resolveItemReadinessContext(physics.id,physics.item(rng(3),'transfer'))).toEqual({kind:'conversion',quantity:'length'});
  expect(resolveItemReadinessContext(equation.id,equation.item(rng(3),'transfer'))).toEqual({kind:'operation',domain:'natural',operations:['divide']});
});
it('offered picture or symbol representations are alternatives, not a four-skill gate',()=>{
  const message=observedExplanationSpecs.find(s=>s.id==='M-REP-05')!,symbols=THINKING_NODES.find(s=>s.id==='M-REP-04')!;
  for(let seed=0;seed<80;seed++)for(const phase of ['independent','transfer'] as const){
    const context=resolveItemReadinessContext(message.id,message.item(rng(seed),phase));
    for(const known of ['M-REP-02','M-REP-04'])expect(evaluateItemReadiness({nodeId:message.id,itemAvailable:true,context,staticGroups:[],knownChecked:id=>id===known}).dynamic.status).toBe('ready');
    const item=symbols.item(rng(seed),phase),c=resolveItemReadinessContext(symbols.id,item);
    if(item.tag==='add')expect(c).toEqual({kind:'content',skills:['M-SYM-PLUS','M-SYM-EQUAL']});
    else if(item.tag==='transfer')expect(c).toEqual({kind:'content',skills:['M-MUL-02','M-SYM-EQUAL']});
    else if(item.tag==='compare')expect(c).toEqual({kind:'content',skills:['M-NUM-10']});
    else {expect(c?.kind).toBe('content');if(c?.kind==='content')expect(c.skills).toContain('M-SYM-EQUAL');}
  }
});
it('offers valid percent calculation routes without claiming the method used, with ten real independent situations',()=>{
  const spec=decimalWorkshopSpecs.find(s=>s.id==='M-PCT-05')!,situations=new Set<string>();expect(spec.rev).toBe('exp690-lm09-m-pct-05-v2');
  for(let seed=0;seed<256;seed++)for(const phase of ['independent','transfer'] as const){
    const item=spec.item(rng(seed),phase),context=resolveItemReadinessContext(spec.id,item);
    const available=evaluateItemReadiness({nodeId:spec.id,itemAvailable:true,context,staticGroups:[],knownChecked:id=>['M-PCT-03','M-DEC-08'].includes(id)});
    expect(available.dynamic.status).toBe('ready');expect(available.dynamic.alternatives).toContainEqual({all:['M-PCT-02','M-FRAC-15']});
    expect(evaluateItemReadiness({nodeId:spec.id,itemAvailable:true,context,staticGroups:[],knownChecked:id=>id==='M-PCT-03'}).dynamic.status).toBe('missing');
    if(phase==='independent')situations.add(JSON.stringify((item as Item&{quantityModel:unknown}).quantityModel));
  }
  expect(situations.size).toBe(10);
});
it('leaves every original 181 generator byte-equivalent under the new optional generation context',()=>{
  expect(Object.keys(NODES)).toHaveLength(181);
  const context={knownChecked(){throw Error('original generator unexpectedly consults the new journey');}};
  for(const spec of Object.values(NODES))for(const phase of ['guided','independent','transfer','retrieval'] as const)for(const seed of [0,1,7,32]){
    expect(JSON.stringify(spec.item(rng(seed),phase,context)),`${spec.id}/${phase}/${seed}`).toBe(JSON.stringify(spec.item(rng(seed),phase)));
  }
});
