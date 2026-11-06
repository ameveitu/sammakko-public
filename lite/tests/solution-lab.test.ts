import {expect,test} from 'vitest';
import {checkSolutionLab,checkSolutionLabActivity,indicatorClasses,intersectIndicators,solutionAcidity,solutionMassState,solutionValue,
 type SolutionLabTask,type SolutionLabResponse,type IndicatorId,type IndicatorReading} from '../src/content/models/solution-lab';

const kind='solution-lab' as const;
test('mass dilution and every retained aliquot conserve both quantities exactly',()=>{
  for(const component of [1,3,7,11])for(const carrier of [13,29,47])for(const amount of [1,3,9]){
    const sample={id:'a',label:'Virtuaalinen mallinäyte',solute:component,solvent:carrier,unit:'g' as const,basis:'mass-mass' as const};
    const whole=BigInt(component+carrier),portion=solutionMassState(sample,{kind:'aliquot',amount:String(amount)})!;
    const [n,d]=portion.target.solute,[r,s]=portion.source.solute;
    expect(n*whole).toBe(BigInt(component*amount)*d);
    expect(n*s+r*d).toBe(BigInt(component)*d*s);
    expect(portion.target.total).toEqual([BigInt(amount),1n]);
    expect(portion.source.total[0]).toBe(whole-BigInt(amount));
    const diluted=solutionMassState(sample,{kind:'dilute',amount:String(amount)})!;
    expect(diluted.target.solute).toEqual([BigInt(component),1n]);
    expect(diluted.target.total).toEqual([whole+BigInt(amount),1n]);
    const task:SolutionLabTask={kind,mode:'concentration',title:'Independent mass oracle',skill:'calculate',sample,show:'parts'};
    const answer:SolutionLabResponse={kind,mode:'concentration',numerator:String(component),denominator:String(component+carrier),basis:'mass-mass',percent:`${component*300}/${(component+carrier)*3}`};
    expect(checkSolutionLab(task,answer)).toEqual({ok:true});
    expect(checkSolutionLab(task,{...answer,denominator:String(carrier)}).ok).toBe(false);
    expect(checkSolutionLab(task,{...answer,basis:'volume-volume'}).ok).toBe(false);
  }
  for(const amount of ['0','-1','1/0','NaN'])expect(solutionMassState({id:'a',label:'',solute:2,solvent:8,unit:'g',basis:'mass-mass'},{kind:'aliquot',amount})).toBeUndefined();
  expect(solutionValue('100000000000000')).toEqual([100000000000000n,1n]);
  expect(solutionValue('192000000000000000/192000000000000000')).toEqual([192000000000000000n,192000000000000000n]);
});

test('neutral, close boundary, logarithmic direction and tied pH orders use the stated rule',()=>{
  for(let tick=0;tick<=140;tick++)expect(solutionAcidity([BigInt(tick),10n])).toBe(tick<70?'acidic':tick>70?'basic':'neutral');
  const task:SolutionLabTask={kind,mode:'ph',title:'pH at25C',skill:'scale',activity:'log',temperatureC:25,neutral10:70,
    samples:[{id:'a',label:'A',ph10:0},{id:'b',label:'B',ph10:140},{id:'c',label:'C',ph10:140}],pair:['a','b']};
  const answer:SolutionLabResponse={kind,mode:'ph',rows:[{id:'a',ph:'0',classification:'acidic'},{id:'b',ph:'14',classification:'basic'},{id:'c',ph:'28/2',classification:'basic'}],
    order:['a','c','b'],moreAcidic:'a',factor:'100000000000000'};
  expect(checkSolutionLab(task,answer)).toEqual({ok:true});
  expect(checkSolutionLab(task,{...answer,factor:'2'}).ok).toBe(false);
  expect(checkSolutionLab(task,{...answer,order:['b','a','c']}).ok).toBe(false);
  const inverse:SolutionLabTask={kind,mode:'ph',title:'Produce model readings',skill:'acidbase',activity:'construct',temperatureC:25,neutral10:70,
    samples:[{id:'a',label:'A',requested:'acidic'},{id:'b',label:'B',requested:'neutral'},{id:'c',label:'C',requested:'basic'}]};
  expect(checkSolutionLab(inverse,{kind,mode:'ph',rows:[{id:'a',ph:'699/100',classification:'acidic'},{id:'b',ph:'14/2',classification:'neutral'},{id:'c',ph:'701/100',classification:'basic'}],order:[],moreAcidic:'',factor:''})).toEqual({ok:true});
});

const boundaries:Record<IndicatorId,readonly[number,number]>={'methyl-orange':[32,44],'bromothymol-blue':[60,76],'phenolphthalein':[82,100]};
const readings=(Object.keys(boundaries) as IndicatorId[]).flatMap(indicator=>(['low','transition','high'] as const).map(band=>({indicator,band})));
function independentInterval(observations:readonly IndicatorReading[]){
  const edges=[...new Set([0,70,140,...Object.values(boundaries).flat()])].sort((a,b)=>a-b);
  const cells=edges.flatMap((value,i)=>[{at:value,low:value,high:value,point:true},
    ...(i<edges.length-1?[{at:(value+edges[i+1]!)/2,low:value,high:edges[i+1]!,point:false}]:[])]);
  const accepted=cells.filter(cell=>observations.every(({indicator,band})=>{
    const [lower,upper]=boundaries[indicator];return band==='low'?cell.at<lower:band==='high'?cell.at>upper:cell.at>=lower&&cell.at<=upper;
  }));
  if(!accepted.length)return;
  const first=accepted[0]!,last=accepted.at(-1)!;
  return {interval:{lower10:first.low,upper10:last.high,includeLower:first.point,includeUpper:last.point},
    classes:[...(accepted.some(cell=>cell.at<70)?['acidic']:[]),...(accepted.some(cell=>cell.at===70)?['neutral']:[]),...(accepted.some(cell=>cell.at>70)?['basic']:[])]};
}
test('every pair of indicator bands has the complete interval or a justified inconsistency',()=>{
  let cases=0;
  for(const a of readings)for(const b of readings){
    const given=[a,b],wanted=independentInterval(given),actual=intersectIndicators(given);
    expect(actual).toEqual(wanted?.interval);expect(indicatorClasses(actual)).toEqual(wanted?.classes??[]);
    const task:SolutionLabTask={kind,mode:'indicator',title:'Two named indicator observations',readings:given,temperatureC:25,neutral10:70,
      review:{prompt:'Explain the permitted precision',rubric:[{id:'range',label:'Uses the supplied intervals',guide:'Own explanation'}],model:'A band allows an interval.'}};
    const answer:SolutionLabResponse={kind,mode:'indicator',consistent:!!wanted,lower:wanted?`${wanted.interval.lower10}/10`:'',upper:wanted?`${wanted.interval.upper10}/10`:'',
      includeLower:wanted?.interval.includeLower??false,includeUpper:wanted?.interval.includeUpper??false,classes:wanted?.classes??[]};
    expect(checkSolutionLabActivity(task,answer)).toEqual({ok:true});
    expect(checkSolutionLab(task,answer).pendingReview).toBe(true);
    expect(checkSolutionLab(task,{...answer,review:{observations:{range:'met'},confirmedByAdult:true,assistance:'helped'}})).toMatchObject({ok:true,assisted:true,observedByAdult:true});
    expect(checkSolutionLabActivity(task,{...answer,consistent:!answer.consistent}).ok).toBe(false);cases++;
  }
  expect(cases).toBe(81);
});

import {solutionLabSpecs} from '../src/content/solution-lab';
import {rng} from '../src/engine/rng';
function independentAnswer(task:SolutionLabTask):SolutionLabResponse{
 if(task.mode==='concentration'){
  const s=task.sample,whole=s.solute+s.solvent,op=task.operation;
  const n=op?.kind==='aliquot'?`${s.solute*op.amount}/${whole}`:String(s.solute),d=op?.kind==='aliquot'?op.amount:whole+(op?.amount??0);
  const percent=op?.kind==='aliquot'?`${s.solute*100}/${whole}`:`${s.solute*100}/${d}`;
  return {kind,mode:'concentration',numerator:n,denominator:String(d),basis:'mass-mass',percent,
   ...(op?{operation:{kind:op.kind,amount:String(op.amount),locked:true,applied:true}}:{})};
 }
 if(task.mode==='compare'){
  const [a,b]=task.samples,x=a.solute*(b.solute+b.solvent),y=b.solute*(a.solute+a.solvent);
  return {kind,mode:'compare',rows:task.samples.map(s=>({id:s.id,numerator:String(s.solute),denominator:String(s.solute+s.solvent)})),cross:[String(x),String(y)],relation:x===y?'same':x>y?'left':'right'};
 }
 if(task.mode==='ph'){
  const samples=task.samples.map(s=>({...s,value:s.ph10??(s.requested==='acidic'?69:s.requested==='basic'?71:70)}));
  const pair=task.pair?.map(id=>samples.find(s=>s.id===id)!);
  return {kind,mode:'ph',rows:samples.map(s=>({id:s.id,ph:`${s.value}/10`,classification:s.value<70?'acidic':s.value>70?'basic':'neutral'})),
   order:task.skill==='scale'?[...samples].sort((a,b)=>a.value-b.value).map(s=>s.id):[],
   moreAcidic:pair?pair[0]!.value===pair[1]!.value?'same':pair[0]!.value<pair[1]!.value?pair[0]!.id:pair[1]!.id:'',
   factor:pair?String(10n**BigInt(Math.abs(pair[0]!.value-pair[1]!.value)/10)):''};
 }
 const wanted=independentInterval(task.readings);
 return {kind,mode:'indicator',consistent:!!wanted,lower:wanted?`${wanted.interval.lower10}/10`:'',upper:wanted?`${wanted.interval.upper10}/10`:'',
  includeLower:wanted?.interval.includeLower??false,includeUpper:wanted?.interval.includeUpper??false,classes:wanted?.classes??[],
  review:{confirmedByAdult:true,assistance:'none',observations:{legend:'met',precision:'met'}}};
}
test('all six authored pools support independent exact answers, honest families and fresh situations',()=>{
 let generated=0;
 for(const spec of solutionLabSpecs){
  const identities=new Set<string>(),families=new Set<string>();
  for(const phase of ['independent','transfer'] as const)for(let seed=1;seed<=96;seed++){
   const item=spec.item(rng(seed),phase),task=item.task as unknown as SolutionLabTask,answer=independentAnswer(task);
   expect(checkSolutionLab(task,answer).ok,`${spec.id}/${phase}/${seed}`).toBe(true);generated++;
   expect(spec.item(rng(seed),phase).task).toEqual(item.task);
   if(phase==='independent'){
    families.add(item.tag);const {title,...physical}=task;void title;identities.add(JSON.stringify(physical));
   }
   if(answer.mode==='concentration'){
    expect(checkSolutionLab(task,{...answer,denominator:'0'}).ok).toBe(false);
    if(answer.operation)expect(checkSolutionLab(task,{...answer,operation:{...answer.operation,applied:false}}).ok).toBe(false);
   }else if(answer.mode==='compare')expect(checkSolutionLab(task,{...answer,cross:['-1','-1']}).ok).toBe(false);
   else if(answer.mode==='ph')expect(checkSolutionLab(task,{...answer,rows:answer.rows.map(s=>({...s,classification:'unknown'}))}).ok).toBe(false);
   else{
    expect(checkSolutionLab(task,{...answer,review:{...answer.review!,confirmedByAdult:false}}).pendingReview).toBe(true);
    expect(checkSolutionLab(task,{...answer,consistent:!answer.consistent}).ok).toBe(false);
   }
  }
  expect(families.size).toBe(2);expect(identities.size,spec.id).toBeGreaterThanOrEqual(8);
 }
 expect(generated).toBe(1152);
});

test('response boundary rejects sparse, inherited and accessory quantities; supported ratios may be unsimplified',()=>{
 const spec=solutionLabSpecs[0]!,task=spec.item(rng(3),'transfer').task as unknown as SolutionLabTask,answer=independentAnswer(task);
 expect(checkSolutionLab(task,Object.create(answer)).ok).toBe(false);
 expect(checkSolutionLab(task,Object.defineProperty({...answer},'numerator',{get(){throw Error('must not read accessor');}})).ok).toBe(false);
 const t:SolutionLabTask={kind,mode:'compare',title:'Boundary',samples:[{id:'a',label:'A',solute:2,solvent:8,unit:'g',basis:'mass-mass'},{id:'b',label:'B',solute:4,solvent:16,unit:'g',basis:'mass-mass'}]};
 const a=independentAnswer(t);if(a.mode!=='compare')throw Error('fixture');
 expect(checkSolutionLab(t,{...a,rows:Array(2)}).ok).toBe(false);
 expect(checkSolutionLab(t,{...a,rows:a.rows.map(row=>Object.create(row))}).ok).toBe(false);
 expect(checkSolutionLab(t,{...a,cross:['80/2','160/4']}).ok).toBe(true);
});

test('ordering and logarithmic comparison have different required productions',()=>{
 const base={kind,mode:'ph' as const,title:'Own ordering',skill:'scale' as const,temperatureC:25 as const,neutral10:70 as const,
  samples:[{id:'a',label:'A',ph10:40},{id:'b',label:'B',ph10:70},{id:'c',label:'C',ph10:90}],pair:['a','b'] as const};
 const task:SolutionLabTask={...base,activity:'read'},r=independentAnswer(task);
 if(r.mode!=='ph')throw Error('fixture');
 expect(checkSolutionLab(task,{...r,moreAcidic:'',factor:''}).ok).toBe(true);
 expect(checkSolutionLab({...base,activity:'log'},{...r,moreAcidic:'',factor:''}).ok).toBe(false);
 expect(checkSolutionLab({...base,activity:'log'},{...r,moreAcidic:'a',factor:'100000/100'}).ok).toBe(true);
});

test('unknown prose fields and inherited or accessor array entries cannot enter an accepted response',()=>{
 const task=solutionLabSpecs[1]!.item(rng(2),'independent').task as SolutionLabTask,r=independentAnswer(task);
 expect(checkSolutionLab(task,{...r,note:'private prose'} as unknown as SolutionLabResponse).ok).toBe(false);
 if(r.mode!=='compare')throw Error('fixture');
 const inherited=Array(2);Object.setPrototypeOf(inherited,Object.assign(Object.create(Array.prototype),{0:r.rows[0],1:r.rows[1]}));
 expect(checkSolutionLab(task,{...r,rows:inherited}).ok).toBe(false);
 const accessor=[...r.rows];Object.defineProperty(accessor,'0',{get(){throw Error('must not invoke getter');}});
 expect(checkSolutionLab(task,{...r,rows:accessor}).ok).toBe(false);
 expect(checkSolutionLab(task,{...r,rows:r.rows.map(row=>({...row,note:'private prose'}))}).ok).toBe(false);
 const indicator:SolutionLabTask={kind,mode:'indicator',title:'Adult guard',temperatureC:25,neutral10:70,readings:[{indicator:'methyl-orange',band:'low'}],
  review:{prompt:'Explain',rubric:[{id:'legend',label:'Uses given legend',guide:'Own explanation'},{id:'precision',label:'Own limit',guide:'Precision'}],model:'Range'}};
 const a=independentAnswer(indicator);if(a.mode!=='indicator')throw Error('fixture');
 const observations=Object.defineProperty({precision:'met' as const},'legend',{enumerable:true,get(){throw Error('must not invoke criterion getter');}});
 expect(checkSolutionLab(indicator,{...a,review:{...a.review!,observations}}).pendingReview).toBe(true);
});

test('indicator pending review precedes wrong mathematics and preserves assisted provenance',()=>{
 const task:SolutionLabTask={kind,mode:'indicator',title:'Compound observation',temperatureC:25,neutral10:70,readings:[{indicator:'methyl-orange',band:'low'}],
  review:{prompt:'Own explanation',rubric:[{id:'legend',label:'Legend',guide:'Uses this legend'},{id:'precision',label:'Precision',guide:'Own interval limitation'}],model:'An interval'}};
 const expected=independentAnswer(task);if(expected.mode!=='indicator')throw Error('fixture');
 const wrong={...expected,lower:'8',review:undefined};
 expect(checkSolutionLab(task,wrong)).toMatchObject({ok:false,pendingReview:true});
 expect(checkSolutionLab(task,{...wrong,review:{observations:{legend:'met',precision:'met'},confirmedByAdult:true,assistance:'helped'}}))
  .toMatchObject({ok:false,observedByAdult:true,assisted:true});
 expect(checkSolutionLab(task,{...expected,review:{observations:{legend:'met',precision:'not-yet'},confirmedByAdult:true,assistance:'none'}}))
  .toMatchObject({ok:false,observedByAdult:true});
});
