import {expect,test} from 'vitest';
import {rng} from '../src/engine/rng';
import {physicsInvestigationSpecs} from '../src/content/physics-investigation';
import {checkPhysicsInvestigation,performInvestigationMeasurement,physicsInvestigationScene,
 type PhysicsInvestigationTask,type PhysicsInvestigationResponse,type MeasureCase,type MeasurementObservation} from '../src/content/models/physics-investigation';

// Expected values use integer division, public observations and stated rules.
// Production solution helpers and authored ChoiceCase.expected are not read here.
function reading(input:MeasureCase,id:string,placement:string):MeasurementObservation{
 const tool=input.instruments.find(t=>t.id===id);
 if(!tool||tool.quantity!==input.quantity)return {status:'wrong-instrument'};
 if(placement!==input.targetPlacement||placement!==tool.placement)return {status:'wrong-placement'};
 if(input.actualTenths>tool.maxTenths)return {status:'out-of-range'};
 const q=Math.floor(input.actualTenths/tool.resolutionTenths),remainder=input.actualTenths-q*tool.resolutionTenths;
 return {resolutionTenths:tool.resolutionTenths,unit:tool.unit,valueTenths:(q+(remainder*2>=tool.resolutionTenths?1:0))*tool.resolutionTenths,status:'measured'};
}
const unitMap:Record<string,string>={pituus:'m',aika:'s',massa:'kg',voima:'N',energia:'J',teho:'W',sähkövirta:'A',lämpötila:'K'};
function answer(task:PhysicsInvestigationTask):PhysicsInvestigationResponse{
 const input=task.input,values:Record<string,string>={},response:PhysicsInvestigationResponse={kind:'physics-investigation',predictionLocked:true,values};
 if(task.review)Object.assign(response,{confirmedByAdult:true,assistance:'none',observations:Object.fromEntries(task.review.criteria.map(c=>[c.id,'met']))});
 if(input.kind==='measure'){
  const tool=input.instruments.find(t=>t.quantity===input.quantity&&t.maxTenths>=input.actualTenths)!;
  const observed=reading(input,tool.id,tool.placement);
  Object.assign(response,{prediction:'3.5',instrument:tool.id,placement:tool.placement,observed});
  Object.assign(values,{reading:String(observed.valueTenths!/10),unit:tool.unit});
 }else if(input.kind==='choice'){
  const text=input.prompt+' '+input.detail;
  if(task.mode==='unit'){
   const given=text.match(/suuretta (\S+)\./)?.[1],message=text.match(/mittausviesti: (\d+) (\S+)\./),unit=given?unitMap[given]:message![2]!;
   values.quantity=given??Object.keys(unitMap).find(q=>unitMap[q]===unit)!;values.nonSI='min';
   if(given){values.unit=unit!;values.number=text.match(/lukuarvo (\d+)/)![1]!;}
   if(task.fields.some(f=>f.id==='symbolCase'))values.symbolCase=/^[A-Z]$/.test(unit!)?'upper':'lower';
  }else if(task.mode==='question'||task.mode==='plan'){
   const surface=text.includes('pintojen');Object.assign(values,{changed:surface?'surface':'slope',measured:surface?'distance':'time'});
   if(task.mode==='plan')Object.assign(values,{control:'same',repeats:'three'});
  }else if(task.mode==='precision'){
   const parts=text.match(/resoluutio ([\d.]+) cm[\s\S]*vertailtava ero ([\d.]+) cm/)!;
   const resolution=Number(parts[1]),difference=Number(parts[2]);
   Object.assign(values,{decision:difference>=resolution?'enough':'not-enough',instrument:difference>=.5?'coarse':'fine'});
  }else if(task.mode==='digits'){
   const value=text.match(/ja lukema ([\d.]+) cm/)![1]!;
   const selected=task.fields[0]!.options!.find(o=>o.label===`${value} cm`)!;values.decision=selected.id;
  }else{
   const difference=Number(text.match(/vertailtava ero on ([\d,]+)/)![1]!.replace(',','.'));
   Object.assign(values,{decision:difference>=.1?'enough':'not-enough',digits:'resolution'});
  }
 }else{
  const points=input.points,ys=points.map(p=>p[1]),constant=ys.every(y=>y===ys[0]),positive=points.find(p=>p[0]>0)!;
  const quadratic=points.length>2&&points.every(([x,y])=>y*positive[0]**2===positive[1]*x*x);
  const rule=constant?'constant':quadratic?'quadratic':'linear',factor=constant?ys[0]!:positive[1]/positive[0];
  if(task.mode==='relation')values.relation=rule;
  else if(task.mode==='model'){
   const k=rule==='quadratic'?positive[1]/positive[0]**2:factor;
   expect(points.every(([x,y])=>y===(rule==='constant'?k:rule==='quadratic'?k*x*x:k*x))).toBe(true);
   Object.assign(values,{relation:rule,factor:String(k),range:`0-${input.domainMax}`});
  }else if(task.mode==='prediction'){
   const within=input.unseen>=0&&input.unseen<=input.domainMax,k=rule==='quadratic'?positive[1]/positive[0]**2:factor;
   const value=rule==='constant'?k:rule==='quadratic'?k*input.unseen**2:k*input.unseen;
   Object.assign(values,{prediction:within?String(value):'ei pääteltävissä',domain:within?'within':'outside',comparison:within?'same':'no-data'});
  }else{
   values.evidence=new Set(points.map(p=>p[0])).size<points.length?'repeat':'compare';
   if(task.mode==='integration')values.decision=points.length<2?'more':'sufficient';
  }
 }
 return response;
}
test('integer instrument oracle includes half-steps, range, placement and reordered observation keys',()=>{
 let count=0;
 for(const actualTenths of Array.from({length:181},(_,i)=>i))for(const resolutionTenths of [1,2,5,10])for(const maxTenths of [10,50,150]){
  const input:MeasureCase={kind:'measure',quantity:'length',object:'Length',actualTenths,targetInstrument:'ruler',targetPlacement:'edge',
   instruments:[{id:'ruler',name:'Length',quantity:'length',unit:'cm',maxTenths,resolutionTenths,placement:'edge'},
    {id:'clock',name:'Time',quantity:'time',unit:'s',maxTenths:150,resolutionTenths:1,placement:'start-stop'}]};
  const task:PhysicsInvestigationTask={kind:'physics-investigation',mode:'measure',input,question:'Own reading',fields:[],hint:''};
  for(const [id,placement] of [['ruler','edge'],['ruler','middle'],['clock','edge'],['missing','edge']]){
   const expected=reading(input,id!,placement!);expect(performInvestigationMeasurement(input,id!,placement!)).toEqual(expected);count++;
  }
  const expected=reading(input,'ruler','edge');
  if(expected.status==='measured'){
   const r:PhysicsInvestigationResponse={kind:'physics-investigation',values:{reading:String(expected.valueTenths!/10),unit:'cm'},predictionLocked:true,
    prediction:'0',instrument:'ruler',placement:'edge',observed:expected};
   expect(checkPhysicsInvestigation(task,r).ok).toBe(true);
   expect(checkPhysicsInvestigation(task,{...r,values:{reading:String(expected.valueTenths!/10+.1),unit:'cm'}}).ok).toBe(false);
   expect(physicsInvestigationScene(task,{...r,predictionLocked:false})?.observation).toBeUndefined();
   expect(physicsInvestigationScene(task,{...r,observed:{...expected,valueTenths:expected.valueTenths!+1}})?.observation).toBeUndefined();
  }
 }
 expect(count).toBe(8688);
});
test('13 authored targets agree with independently computed answers across both families and transfer',()=>{
 let count=0,pending=0,wrong=0;
 for(const spec of physicsInvestigationSpecs)for(const phase of ['independent','transfer'] as const)for(let seed=1;seed<=96;seed++){
  const task=spec.item(rng(seed),phase).task as PhysicsInvestigationTask,r=answer(task);
  expect(checkPhysicsInvestigation(task,r).ok,`${spec.id}/${phase}/${seed}`).toBe(true);count++;
  expect(checkPhysicsInvestigation(task,{...r,predictionLocked:false}).ok).toBe(false);wrong++;
  for(const key of Object.keys(r.values)){
   expect(checkPhysicsInvestigation(task,{...r,values:{...r.values,[key]:'invalid'}}).ok,`${spec.id}/${key}`).toBe(false);wrong++;
  }
  if(task.review){
   expect(checkPhysicsInvestigation(task,{...r,confirmedByAdult:false}).pendingReview).toBe(true);pending++;
   expect(checkPhysicsInvestigation(task,{...r,assistance:'helped'})).toMatchObject({ok:true,assisted:true,observedByAdult:true});
   expect(checkPhysicsInvestigation(task,{...r,assistance:undefined}).ok).toBe(false);
  }
 }
 expect(count).toBe(2496);expect(pending).toBe(1344);expect(wrong).toBeGreaterThan(6000);
 console.info({authored:count,wrong,adultPending:pending});
});

test('reported-digit families expose distinct actual reporting resolutions',()=>{
 const spec=physicsInvestigationSpecs.find(s=>s.id==='PHY79-REPORTED-DIGITS')!,seen=new Map<string,Set<string>>();
 for(const phase of ['independent','transfer'] as const)for(let seed=1;seed<=96;seed++){
  const item=spec.item(rng(seed),phase),task=item.task as PhysicsInvestigationTask;
  if(task.input.kind!=='choice')throw Error('Expected reporting case');
  const resolution=task.input.detail.match(/resoluutio ([\d.]+) cm/)![1]!;
  const values=seen.get(item.tag)??new Set();values.add(resolution);seen.set(item.tag,values);
 }
 expect(Object.fromEntries([...seen].map(([tag,values])=>[tag,[...values]]))).toEqual({coarse:['1'],fine:['0.01'],transfer:['0.1']});
});

test('a learner model is judged by every given point instead of hidden generator factors',()=>{
 const task:PhysicsInvestigationTask={kind:'physics-investigation',mode:'model',question:'Fit every displayed pair',hint:'',fields:[{id:'relation',label:'Model'},{id:'factor',label:'Own factor'},{id:'range',label:'Range'}],
  input:{kind:'data',points:[[0,0],[1,3],[2,6],[3,9]],xLabel:'x',yLabel:'y',unit:'unit',rule:'linear',factor:99,unseen:4,domainMax:5}};
 const r:PhysicsInvestigationResponse={kind:'physics-investigation',predictionLocked:true,values:{relation:'linear',factor:'3',range:'0-5'}};
 expect(checkPhysicsInvestigation(task,r).ok).toBe(true);
 expect(checkPhysicsInvestigation(task,{...r,values:{...r.values,factor:'99'}}).ok).toBe(false);
 expect(checkPhysicsInvestigation({...task,input:{...task.input,kind:'data',points:[[0,0],[1,3],[2,7]],xLabel:'x',yLabel:'y',unit:'unit',rule:'linear',factor:3,unseen:4,domainMax:5}},r).ok).toBe(false);
});
