import {describe,it,expect} from 'vitest';
import {evaluateItemReadiness,type ItemReadinessContext} from '../src/engine/item-readiness';
import {resolveItemReadinessContext} from '../src/content/item-readiness-context';
import {powerRuleSpecs} from '../src/content/power-rules';
import {fractionWorkshopSpecs} from '../src/content/fraction-workshop';
import {arithmeticReasoningSpecs} from '../src/content/arithmetic-reasoning';
import {rng} from '../src/engine/rng';
const evalItem=(nodeId:string,context:ItemReadinessContext|undefined,known:string[]=[],staticGroups:Parameters<typeof evaluateItemReadiness>[0]['staticGroups']=[])=>evaluateItemReadiness({nodeId,itemAvailable:true,context,staticGroups,knownChecked:id=>known.includes(id)});
describe('item-specific readiness proposal',()=>{
 it('keeps static AND/OR, dynamic and diagnostic access separate',()=>{
  const r=evalItem('M-UNIT-05',{kind:'time-direction',operation:'divide'},['M-TIME-03','B','M-DIV-01'],[{all:['M-TIME-03']},{any:['A','B']}]);
  expect(r.static.status).toBe('ready');expect(r.static.groups).toEqual([{all:['M-TIME-03']},{any:['A','B']}]);expect(r.dynamic.status).toBe('ready');
  const missing=evalItem('M-UNIT-05',{kind:'time-direction',operation:'divide'},['M-MUL-01'],[{all:['M-TIME-03']}]);expect(missing).toMatchObject({diagnosticAvailable:true,static:{status:'missing'},dynamic:{status:'missing'}});expect(missing.support).toContain('M-DIV-01');
  expect(evalItem('M-UNIT-05',undefined,['M-TIME-03','M-DIV-01']).dynamic.status).toBe('unresolved');
 });
 it('requires actual selected operations, not every family-wide operation',()=>{
  const r=evalItem('M79-EQ1-SOLVE',{kind:'operation',domain:'integer',operations:['subtract','divide']},['M79-INT-SUB','M79-INT-DIV']);expect(r.dynamic.status).toBe('ready');expect(r.dynamic.alternatives).toEqual([{all:['M79-INT-SUB','M79-INT-DIV']}]);
  expect(evalItem('M-UNIT-05',{kind:'time-direction',operation:'multiply'},['M-MUL-01']).dynamic.status).toBe('ready');expect(evalItem('M-UNIT-05',{kind:'time-direction',operation:'divide'},['M-MUL-01']).dynamic.status).toBe('missing');
 });
 it('treats available methods as alternatives and unknown benchmark separately',()=>{
  const c={kind:'fraction-methods',methods:['common-denominator','number-line','benchmark']} as const;
  expect(evalItem('M-FRAC-09',c,['M-FRAC-04']).dynamic.status).toBe('ready');expect(evalItem('M-FRAC-09',c,[]).dynamic.status).toBe('unresolved');
  expect(evalItem('M-PCT-05',{kind:'percent-methods',methods:['fraction','decimal'],prerequisites:{decimal:['M-PCT-03','M-MUL-01']}},['M-PCT-03','M-MUL-01']).dynamic.status).toBe('ready');expect(evalItem('M-PCT-05',{kind:'percent-methods',methods:['unit-percent']},[]).dynamic.status).toBe('unresolved');expect(evalItem('M-PCT-05',{kind:'percent-methods',methods:['decimal']},['M-PCT-03']).dynamic.status).toBe('unresolved');
 });
 it('requires the selected registered link, not two unrelated checked skills',()=>{
  const context={kind:'links',linkIds:['perimeter-multiply']} as const;
  expect(evalItem('M-TH-08',context,['M-ADD-01','M-FRAC-01']).dynamic.status).toBe('missing');expect(evalItem('M-TH-08',context,['M-GMEAS-01','M-MUL-01']).dynamic.status).toBe('ready');
  expect(evalItem('M-TH-08',{kind:'links',linkIds:[]},['M-GMEAS-01','M-MUL-01']).dynamic.status).toBe('unresolved');
  const pairs={kind:'links',linkIds:['multiply-add','fraction-divide','perimeter-multiply']} as const;
  expect(evalItem('M-TH-08',pairs,['M-MUL-01','M-ADD-01']).dynamic.status).toBe('missing');
  expect(evalItem('M-TH-08',pairs,['M-MUL-01','M-ADD-01','M-FRAC-01','M-DIV-01','M-GMEAS-01']).dynamic.status).toBe('ready');
 });
 it('requires the actual quantity, unit, ratio and selected profile',()=>{
  expect(evalItem('M-MEAS-12',{kind:'quantity',quantity:'mass'},['M-MEAS-02']).dynamic.status).toBe('missing');expect(evalItem('M-MEAS-13',{kind:'unit',unit:'volume'},['M-MEAS-09']).dynamic.status).toBe('ready');
  expect(evalItem('PHY79-UNIT-CONV',{kind:'conversion',quantity:'time'},['M-UNIT-05']).dynamic.status).toBe('ready');expect(evalItem('M79-TRIG-SIDE',{kind:'trig',ratio:'cos'},['M79-SIN']).dynamic.status).toBe('missing');
  expect(evalItem('CHEM79-ORG-GROUP',{kind:'local-profile'}).dynamic.status).toBe('unresolved');expect(evalItem('CHEM79-ORG-GROUP',{kind:'local-profile',profileGroup:'alcohol',itemGroup:'acid',allowedGroups:['alcohol','acid']}).dynamic.status).toBe('unresolved');expect(evalItem('CHEM79-ORG-GROUP',{kind:'local-profile',profileGroup:'alcohol',itemGroup:'alcohol',allowedGroups:['alcohol']}).dynamic.status).toBe('ready');
 });
 it('does not infer checked nodes from other nodes or story-like IDs, and rejects required cycles',()=>{
  const r=evaluateItemReadiness({nodeId:'M-UNIT-05',staticGroups:[{all:['M-TIME-03']}],context:{kind:'time-direction',operation:'divide'},knownChecked:id=>id==='story.M-TIME-03.resolved'||id==='M-DIV-01',dependencyGraph:{'M-UNIT-05':['M-TIME-03'],'M-TIME-03':['M-UNIT-05']}});
  expect(r.static.status).toBe('unresolved');expect(r.dynamic.status).toBe('ready');
  expect(evalItem('unknown',undefined,['M-TIME-03']).dynamic.status).toBe('unresolved');
 });
 it('handles the remaining item-specific rule kinds without assuming all alternatives',()=>{
  expect(evalItem('CHEM79-ELEMENT',{kind:'element',route:'either'},['CHEM79-ATOM-01']).dynamic.status).toBe('ready');
  expect(evalItem('M-REP-01',{kind:'content',skills:['M-ADD-01']},['M-ADD-01']).dynamic.status).toBe('ready');
  expect(evalItem('M-REP-04',{kind:'content',skills:['M-SYM-PLUS','M-SYM-EQUAL']},['M-SYM-PLUS']).dynamic.status).toBe('missing');
  expect(evalItem('M-REP-05',{kind:'representations',skills:['M-REP-01','M-REP-02']},['M-REP-02']).dynamic.status).toBe('ready');
  expect(evalItem('M-EXPR-01',{kind:'operation',domain:'natural',operations:['add','multiply']},['M-ADD-01','M-MUL-02']).dynamic.status).toBe('ready');
  expect(evalItem('M-CALC-STRAT',{kind:'operation',domain:'natural',operations:['subtract']},['M-WRSUB']).dynamic.status).toBe('ready');
  expect(evalItem('M79-TRIG-ANGLE',{kind:'trig',ratio:'tan'},['M79-TAN']).dynamic.status).toBe('ready');
 });
 it('maps the actual authored power expression and selected rule metadata, rejecting contradictions',()=>{
  const spec=powerRuleSpecs.find(s=>s.id==='M79-POWER-SIMPLIFY')!;const found=new Set<string>();
  for(let seed=1;seed<40;seed++) {const item=spec.item(rng(seed),'independent');const context=resolveItemReadinessContext(spec.id,item);expect(context?.kind).toBe('power-rules');if(context?.kind==='power-rules')found.add([...context.rules].sort().join(','));}
  expect(found).toContain('power-of-power,product');expect(found).toContain('product,quotient');
  expect(resolveItemReadinessContext('M79-POWER-SIMPLIFY',{task:{kind:'power-rules',mode:'rewrite',source:{kind:'power'},context:{rules:['tulo']}}})).toBeUndefined();
  const r=evalItem('M79-POWER-SIMPLIFY',{kind:'power-rules',rules:['product','quotient']},['M79-POWER-PROD','M79-POWER-QUOT']);expect(r.dynamic.status).toBe('ready');expect(r.dynamic.alternatives).toEqual([{all:['M79-POWER-PROD','M79-POWER-QUOT']}]);
 });
 it('bridges only exact known generator structures; unsupported legacy tags stay unresolved',()=>{
  const frac=fractionWorkshopSpecs.find(s=>s.id==='M-FRAC-09')!;let common=false,half=false;
  for(let seed=1;seed<40;seed++){const item=frac.item(rng(seed),'independent');const c=resolveItemReadinessContext(frac.id,item);if(c?.kind==='fraction-methods'){common ||= c.methods.includes('common-denominator');half ||= c.methods.includes('supplied-half');}}
  expect(common&&half).toBe(true);
  const calc=arithmeticReasoningSpecs.find(s=>s.id==='M-CALC-STRAT')!;expect(resolveItemReadinessContext(calc.id,calc.item(rng(2),'independent'))?.kind).toBe('operation');
  expect(resolveItemReadinessContext('M-UNIT-05',{tag:'hhmm',task:{kind:'place'}})).toBeUndefined();expect(resolveItemReadinessContext('M-UNIT-05',{tag:'back',task:{kind:'numeric'}})).toEqual({kind:'time-direction',operation:'divide'});
  expect(resolveItemReadinessContext('PHY79-UNIT-CONV',{tag:'match',task:{kind:'place'}})).toBeUndefined();
 });
});

it('does not claim that an unknown or unavailable item can be opened',()=>{
 const r=evaluateItemReadiness({nodeId:'unknown',staticGroups:[],knownChecked:()=>true});expect(r).toMatchObject({diagnosticAvailable:false,dynamic:{status:'unresolved'}});
});

it('resolves only audited original time and physics conversion cases from their actual generators',async()=>{
 const [{SAARI1_NODES},{PHYSICS_NODES}]=await Promise.all([import('../src/content/saari1'),import('../src/content/physics')]);
 for(const [nodeId,nodes,expected] of [
  ['M-UNIT-05',SAARI1_NODES,{hmin:'multiply',mins:'multiply',mixed:'multiply',day:'multiply',back:'divide'}],
  ['PHY79-UNIT-CONV',PHYSICS_NODES,{kmM:'length',cmM:'length',minS:'time',hMin:'time'}],
 ] as const){
  const spec=nodes.find(s=>s.id===nodeId)!;const seen=new Set<string>();
  for(let seed=1;seed<=250;seed++){
   const item=spec.item(rng(seed),'independent'),wanted=(expected as Record<string,string>)[item.tag];
   if(!wanted)continue;seen.add(item.tag);const actual=resolveItemReadinessContext(nodeId,item);
   expect(actual).toEqual(nodeId==='M-UNIT-05'?{kind:'time-direction',operation:wanted}:{kind:'conversion',quantity:wanted});
  }
  expect([...seen].sort()).toEqual(Object.keys(expected).sort());
 }
});

it('maps current measurement dimensions and explicit representation content, not unrelated tags',async()=>{
 const [{measurementStationSpecs},{problemWorkbenchSpecs},{observedExplanationSpecs}]=await Promise.all([import('../src/content/measurement-station'),import('../src/content/problem-workbench'),import('../src/content/observed-explanations')]);
 for(const id of ['M-MEAS-12','M-MEAS-13']){const spec=measurementStationSpecs.find(s=>s.id===id)!;for(let seed=1;seed<20;seed++){const item=spec.item(rng(seed),'independent');const c=resolveItemReadinessContext(id,item);expect(c?.kind).toBe(id==='M-MEAS-12'?'quantity':'unit');}}
 expect(resolveItemReadinessContext('M-MEAS-12',{task:{kind:'measurement-station',mode:'tool',dimension:'liquid'}})).toEqual({kind:'quantity',quantity:'volume'});
 const rep=problemWorkbenchSpecs.find(s=>s.id==='M-REP-01')!;const seen=new Set<string>();for(let seed=1;seed<50;seed++){const item=rep.item(rng(seed),'independent');seen.add(item.tag);const c=resolveItemReadinessContext(rep.id,item);expect(c?.kind).toBe('content');}expect(seen).toEqual(new Set(['objects-equal-shares','objects-combine-parts']));
 const rep05=observedExplanationSpecs.find(s=>s.id==='M-REP-05')!;expect(resolveItemReadinessContext(rep05.id,rep05.item(rng(1),'independent'))).toEqual({kind:'representations',skills:['M-REP-02','M-REP-04']});
});

it('audits all TH08 generator tags and requires all three links for pairs',async()=>{
 const {THINKING_NODES}=await import('../src/content/thinking');const spec=THINKING_NODES.find(s=>s.id==='M-TH-08')!;const seen=new Set<string>();
 const expected:Record<string,string[]>={mulAdd:['multiply-add'],fracDiv:['fraction-divide'],areaMul:['area-multiply'],pairs:['multiply-add','fraction-divide','perimeter-multiply']};
 for(let seed=1;seed<=250;seed++){const item=spec.item(rng(seed),'independent');seen.add(item.tag);expect(resolveItemReadinessContext(spec.id,item)).toEqual({kind:'links',linkIds:expected[item.tag]});}
 expect([...seen].sort()).toEqual(Object.keys(expected).sort());const transfer=spec.item(rng(1),'transfer');expect(resolveItemReadinessContext(spec.id,transfer)).toEqual({kind:'links',linkIds:['perimeter-multiply']});
});
