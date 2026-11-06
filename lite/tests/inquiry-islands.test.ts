import {describe,it,expect} from 'vitest';
import {inquiryRead,validInquiryConfiguration,inquiryTerrainRoute,validInquiryTerrain,inquiryMembership,type InquiryConfiguration,type InquiryTerrain,type InquirySample} from '../src/content/models/inquiry-islands';
const n=(q:readonly [bigint,bigint])=>Number(q[0])/Number(q[1]);
const motion:InquiryConfiguration={kind:'motion',forceX:0,forceY:0,mass:2,initialVX:2,initialVY:0,surface:'smooth',retardation:1};
describe('Inquiry15 pure models before UI integration',()=>{
 it('preserves uniform motion at zero resultant and separates sideways velocity change from forward velocity',()=>{
  for(let time=0;time<=8;time++){
   const coast=inquiryRead(motion,'A',time)!;expect(n(coast.x)).toBe(2*time);expect(n(coast.vx)).toBe(2);expect(n(coast.vy)).toBe(0);expect(coast.direction).toBe('straight');
   const turned=inquiryRead({...motion,forceY:2},'B',time)!;expect(n(turned.x)).toBe(2*time);expect(n(turned.y)).toBe(time*time/2);expect(n(turned.vx)).toBe(2);expect(n(turned.vy)).toBe(time);expect(turned.direction).toBe(time?'right':'straight');
  }
 });
 it('stops rough-surface motion at the exact rational stopping position without reversing it',()=>{
  for(let time=0;time<=8;time++){
   const stopped=inquiryRead({...motion,initialVX:3,surface:'rough',retardation:2},'A',time)!;
   const t=Math.min(time,1.5);expect(n(stopped.x)).toBe(3*t-t*t);expect(n(stopped.vx)).toBe(Math.max(0,3-2*time));expect(stopped.direction).toBe(time>=2?'stopped':'straight');
  }
 });
 it('computes the point-lamp ray and its opposite shadow side from the same geometry',()=>{
  for(const lampX of [-8,-6,-4,2,5,8])for(const height of [1,2,3]){
   const r=inquiryRead({kind:'shadow',height,lampX,lampY:7},'A',0)!;expect(n(r.quantity)).toBe(-lampX*height/(7-height));expect(r.direction).toBe(lampX<0?'right':'left');
  }
 });
 it('uses an actual exposure clock and a finite declared water capacity',()=>{
  for(const [material,capacity]of [['cloth',3],['paper',2],['plastic',0]] as const)for(let t=0;t<=8;t++){
   const result=inquiryRead({kind:'absorb',material,area:2,water:5,seconds:8},'A',t)!;
   expect(n(result.quantity)).toBe(Math.min(5,capacity*2,t));expect(result.unit).toBe('ml');
  }
  expect(inquiryRead({kind:'absorb',material:'cloth',area:2,water:5,seconds:3},'A',4)).toBeUndefined();
 });
 it('shows a controlled gate effect in the declared damped wheel model',()=>{
  for(let t=0;t<=8;t++){
   const open=inquiryRead({kind:'wheel',gate:true,flow:3,drag:1},'A',t)!,closed=inquiryRead({kind:'wheel',gate:false,flow:3,drag:1},'B',t)!;
   expect(n(open.quantity)).toBe(2*t);expect(n(closed.quantity)).toBe(0);expect(open.direction).toBe(t?'right':'stopped');expect(closed.direction).toBe('stopped');
  }
 });
 it('rejects unknown, inherited, getter and unsupported physical configurations',()=>{
  let reads=0;expect(validInquiryConfiguration(Object.create(motion))).toBe(false);expect(validInquiryConfiguration({...motion,note:'private'})).toBe(false);expect(validInquiryConfiguration({...motion,mass:0})).toBe(false);
  expect(validInquiryConfiguration({...motion,get forceY(){reads++;return 1;}})).toBe(false);expect(reads).toBe(0);
  expect(inquiryRead({...motion,surface:'rough',forceY:1},'A',2)).toBeUndefined();expect(inquiryRead(motion,'A',9)).toBeUndefined();
 });
 it('routes by constructed adjacent geometry and respects barriers, source IDs and the disclosed tie order',()=>{
  const terrain:InquiryTerrain={width:3,height:2,cells:[{id:'c1',x:0,y:0,height:4,blocked:false},{id:'c2',x:1,y:0,height:3,blocked:false},{id:'c3',x:2,y:0,height:1,blocked:false},{id:'c4',x:0,y:1,height:3,blocked:false},{id:'c5',x:1,y:1,height:2,blocked:false},{id:'c6',x:2,y:1,height:0,blocked:false}]};
  expect(inquiryTerrainRoute(terrain,'c1')).toEqual(['c1','c2','c3','c6']);
  expect(inquiryTerrainRoute({...terrain,cells:terrain.cells.map(c=>c.id==='c2'?{...c,blocked:true}:c)},'c1')).toEqual(['c1','c4','c5','c6']);
  expect(inquiryTerrainRoute({...terrain,cells:terrain.cells.map(c=>({...c,height:0}))},'c1')).toEqual(['c1']);
  expect(validInquiryTerrain({...terrain,cells:new Array(6)})).toBe(false);
  expect(validInquiryTerrain({...terrain,cells:terrain.cells.map(c=>({...c,id:'c1'}))})).toBe(false);
 });
 it('applies one explicit classification rule to the old samples and a new boundary case',()=>{
  const sample:InquirySample={id:'A',kind:'stone',length:4,width:2,colour:'grey',surface:'rough',floats:false,bend:0,transparent:false};
  expect(inquiryMembership(sample,{property:'length',operator:'at-least',value:'4'})).toBe(1);expect(inquiryMembership({...sample,length:3},{property:'length',operator:'at-least',value:'4'})).toBe(0);
  expect(inquiryMembership(sample,{property:'surface',operator:'equal',value:'rough'})).toBe(1);expect(inquiryMembership({...sample,colour:'green'},{property:'surface',operator:'equal',value:'rough'})).toBe(1);
 });
});

import {inquiryPlanOkay,replayInquiryExperiment,type InquirySetup,type InquiryPlan,type InquiryExperimentTask,type InquiryAction} from '../src/content/models/inquiry-islands';
const a={kind:'sail' as const,wind:0,area:1,mass:2,initialSpeed:1},b={...a,wind:1};
const setup:InquirySetup={name:'Koepurje',kind:'sail',initial:[a,b],variables:['wind','area'],controlVariables:['wind','area','mass'],outcomes:['side-displacement','turn'],values:{wind:[0,1,2],area:[1,2]},seconds:3,scope:'Annettu poikittaisen vakiovoiman malli, x eteen ja y oikealle.'};
const plan:InquiryPlan={variable:'wind',outcome:'side-displacement',configurations:[a,b],controls:['mass','area'],sequence:['configure','predict','place','start','observe','record','reset','repeat'],repeats:2};
const experiment:InquiryExperimentTask&{run:string}={mode:'experiment',skill:'execute',activity:'guided',setup,minimumRepeats:2,run:'inquiry-test'};
function executed():InquiryAction[]{
 const actions:InquiryAction[]=[{type:'lock',id:'a1',run:experiment.run,forecast:'stopped',plan}];
 for(const trial of ['A','B'])for(let repeat=0;repeat<2;repeat++){
  const add=(action:object)=>actions.push({...action,id:`a${actions.length+1}`,run:experiment.run} as InquiryAction);
  if(repeat)add({type:'reset',trial});add({type:'place',trial});add({type:'start',trial});add({type:'advance',trial,seconds:3});add({type:'observe',trial});add({type:'record',trial});
 }
 return actions;
}
describe('Inquiry actual ordered model procedure',()=>{
 it('accepts independent valid control plans and all valid orders of unrelated preparation steps',()=>{
  expect(inquiryPlanOkay(plan,setup,2)).toBe(true);
  expect(inquiryPlanOkay({...plan,sequence:['predict','place','configure','start','observe','record','reset','repeat']},setup,2)).toBe(true);
  expect(inquiryPlanOkay({...plan,configurations:[a,{...b,area:2}]},setup,2)).toBe(false);
  expect(inquiryPlanOkay({...plan,controls:['area']},setup,2)).toBe(false);
  expect(inquiryPlanOkay({...plan,sequence:['configure','place','start','observe','predict','record','reset','repeat']},setup,2)).toBe(false);
 });
 it('keeps an incorrect initial forecast and separately records every actual repeat',()=>{
  const result=replayInquiryExperiment(experiment,executed())!;expect(result.forecast).toBe('stopped');
  for(const trial of ['A','B'] as const){expect(result.trials[trial].records.map(r=>r.repeat)).toEqual([1,2]);expect(result.trials[trial].records.every(r=>r.reading.timeS===3)).toBe(true);}
  expect(result.trials.A.records[0]!.reading.direction).toBe('straight');expect(result.trials.B.records[0]!.reading.direction).toBe('right');
  expect(n(result.trials.A.records[0]!.reading.y)).toBe(0);expect(n(result.trials.B.records[0]!.reading.y)).toBe(9/4);
 });
 it('requires genuine place/start/observe/record actions and prevents resetting the past forecast',()=>{
  const actions=executed();for(const type of ['place','start','observe'] as const)expect(replayInquiryExperiment(experiment,actions.filter(a=>a.type!==type))).toBeUndefined();
  const latest=actions.at(-1)!;expect(replayInquiryExperiment(experiment,[...actions,{...latest,id:'a30'}])).toBeUndefined();
  expect(replayInquiryExperiment(experiment,[...actions,{...actions[0]!,id:'a31'}])).toBeUndefined();
  expect(replayInquiryExperiment(experiment,[...actions,{type:'configure',id:'a32',run:experiment.run,trial:'B',configuration:{...b,wind:2}}])).toBeUndefined();
 });
 it('handles idempotent retries, safe command bounds, cross-run and sparse/getter payloads',()=>{
  const actions=executed(),valid=replayInquiryExperiment(experiment,actions)!;
  expect(replayInquiryExperiment(experiment,[...actions,{...actions.at(-1)!}])!.actionCount).toBe(valid.actionCount);
  expect(replayInquiryExperiment(experiment,[...actions,{...actions.at(-1)!,type:'reset'}])).toBeUndefined();
  expect(replayInquiryExperiment(experiment,actions.map(a=>({...a,run:'wrong'})))).toBeUndefined();expect(replayInquiryExperiment(experiment,new Array(4))).toBeUndefined();
  let invoked=0;expect(replayInquiryExperiment(experiment,[{get type(){invoked++;return 'lock';},id:'a1',run:experiment.run}])).toBeUndefined();expect(invoked).toBe(0);
 });
});

import {replayInquiryModel,inquiryModelKey,inquiryModelFits,inquiryModelPath,type InquiryConstructedModel,type InquiryModelTask,type InquiryModelObservation} from '../src/content/models/inquiry-islands';
const terrainHeights=[4,0,6,5,1,3,4,2,2,5,3,1];
const oldTerrain:InquiryTerrain={width:4,height:3,cells:terrainHeights.map((height,i)=>({id:`c${i+1}`,x:i%4,y:Math.floor(i/4),height,blocked:false}))};
const route=(id:string,start:string,path:string[],calm:boolean|null=null,feed:boolean|null=null):InquiryModelObservation=>({id,query:{kind:'terrain',start},path,calm,feed,label:'Annettu havainto'});
const initialModel:InquiryConstructedModel={kind:'terrain',terrain:oldTerrain,annotations:[]};
const revisedModel:InquiryConstructedModel={kind:'terrain',terrain:{...oldTerrain,cells:oldTerrain.cells.map(c=>c.id==='c2'?{...c,blocked:true}:c)},annotations:[]};
const modelTask:InquiryModelTask&{run:string}={mode:'model',skill:'integrate',board:{kind:'terrain',template:oldTerrain,fixedHeights:['c1','c2','c5','c6','c9'].map(id=>({id,height:oldTerrain.cells.find(c=>c.id===id)!.height}))},observations:[route('A','c4',['c4','c8','c12']),route('B','c11',['c11','c12'])],newObservation:route('C','c1',['c1','c5']),newFeature:'c2',correspondences:[],missingFeatures:['real-weather'],probe:route('P','c1',['c1','c5']),scope:'Kuularadan ilmoitettu paikallinen reittisääntö.',run:'model-test'};
function modelActions(task:InquiryModelTask&{run:string},before:InquiryConstructedModel,after:InquiryConstructedModel,prediction:string[]):InquiryAction[]{return [
 {type:'draft',model:before,id:'a1',run:task.run},{type:'lock-model',prediction,id:'a2',run:task.run},{type:'test-model',route:task.probe.id,id:'a3',run:task.run},{type:'reveal-evidence',id:'a4',run:task.run},{type:'revise',model:after,id:'a5',run:task.run},
 ...[...task.observations,task.newObservation!,task.probe].map((o,i)=>({type:'test-model' as const,route:o.id,id:`a${i+6}`,run:task.run}))];}
describe('Inquiry model construction and immutable evidence chronology',()=>{
 it('holds the original own model and its wrong prediction while the corrected model preserves old observations',()=>{
  const actions=modelActions(modelTask,initialModel,revisedModel,['c1','c2']),r=replayInquiryModel(modelTask,actions)!;
  expect(r.revealed).toBe(true);expect(r.prediction).toEqual(['c1','c2']);expect(r.old?.kind).toBe('terrain');expect(r.current?.kind).toBe('terrain');
  expect(inquiryModelKey(r.old!)).toBe(inquiryModelKey(initialModel));expect(inquiryModelKey(r.current!)).toBe(inquiryModelKey(revisedModel));
  for(const observation of [...modelTask.observations,modelTask.newObservation!])expect(inquiryModelFits(r.current!,observation,modelTask.board)).toBe(true);
  expect(inquiryModelFits(r.old!,modelTask.newObservation!,modelTask.board)).toBe(false);
 });
 it('rejects revealing before an actual old-model test and rejects retroactive forecast locking after evidence',()=>{
  const actions=modelActions(modelTask,initialModel,revisedModel,['c1','c2']);expect(replayInquiryModel(modelTask,actions.filter(a=>a.id!=='a3'))).toBeUndefined();
  expect(replayInquiryModel(modelTask,[...actions,{type:'lock-model',prediction:['c1','c5'],id:'a20',run:modelTask.run}])).toBeUndefined();
  expect(replayInquiryModel(modelTask,[...actions,{type:'draft',model:revisedModel,id:'a20',run:modelTask.run}])).toBeUndefined();
  const restored=replayInquiryModel(modelTask,[...actions,{type:'revise',model:initialModel,id:'a20',run:modelTask.run}])!;expect(restored.revealed).toBe(true);expect(restored.prediction).toEqual(['c1','c2']);expect(inquiryModelFits(restored.current!,modelTask.newObservation!,modelTask.board)).toBe(false);
 });
 it('tracks current-version tests and compares constructed models independently of array or property order',()=>{
  const r=replayInquiryModel(modelTask,modelActions(modelTask,initialModel,revisedModel,['c1','c2']))!;
  const key=inquiryModelKey(revisedModel);expect(r.tests.filter(t=>t.modelKey===key).map(t=>t.observation)).toEqual(['A','B','C','P']);
  expect(inquiryModelKey({...revisedModel,terrain:{...oldTerrain,cells:[...revisedModel.terrain.cells].reverse()}} as InquiryConstructedModel)).toBe(key);
 });
 it('repairs a channel map from supplied route and two-needs observations without inferring hydrodynamics',()=>{
  const observations:InquiryModelObservation[]=[{id:'A',query:{kind:'channel-map',condition:'open'},path:['in','fork','nest'],calm:true,feed:false,label:'A'},{id:'B',query:{kind:'channel-map',condition:'closed'},path:['in','fork','fall'],calm:false,feed:true,label:'B'}],newObservation:InquiryModelObservation={id:'C',query:{kind:'channel-map',condition:'new'},path:['in','bypass','fall'],calm:true,feed:true,label:'Uusi C'};
  const task:InquiryModelTask&{run:string}={...modelTask,board:{kind:'channel-map',ports:[{id:'in',x:0,y:0},{id:'fork',x:1,y:0},{id:'nest',x:2,y:0},{id:'bypass',x:1,y:1},{id:'fall',x:2,y:1}],start:'in',terminals:['nest','fall']},observations,newObservation,newFeature:'fork',probe:{...newObservation,id:'P'},run:'channel-test'};
  const before:InquiryConstructedModel={kind:'channel-map',links:[{from:'in',to:'fork',when:'open'},{from:'fork',to:'nest',when:'open'},{from:'in',to:'fork',when:'closed'},{from:'fork',to:'fall',when:'closed'}],barriers:[],annotations:observations.map(o=>({caseId:o.id,calm:o.calm,feed:o.feed}))};
  const after:InquiryConstructedModel={...before,links:[...before.links,{from:'in',to:'bypass',when:'new'},{from:'bypass',to:'fall',when:'new'}],barriers:['fork'],annotations:[...before.annotations,{caseId:'C',calm:true,feed:true}]};
  const r=replayInquiryModel(task,modelActions(task,before,after,['in','fork','nest']))!;expect(r.revealed).toBe(true);for(const o of [...observations,newObservation])expect(inquiryModelFits(r.current!,o,task.board)).toBe(true);
  expect(inquiryModelFits({...after,annotations:after.annotations.map(a=>a.caseId==='C'?{...a,feed:false}:a)},newObservation,task.board)).toBe(false);
 });
 it('revises a fixed-shadow hypothesis into two independently constructed point-lamp rays',()=>{
  const first:InquiryModelObservation={id:'A',query:{kind:'shadow-ray',caseId:'A'},path:['lamp-A','pole-A','ground:2'],calm:null,feed:null,label:'Ensimmäinen varjo'},next:InquiryModelObservation={id:'B',query:{kind:'shadow-ray',caseId:'B'},path:['lamp-B','pole-B','ground:3'],calm:null,feed:null,label:'Uusi varjo'};
  const task:InquiryModelTask&{run:string}={...modelTask,skill:'revise',board:{kind:'shadow-ray',cases:[{id:'A',lampX:-4,lampY:6,poleHeight:2},{id:'B',lampX:-6,lampY:6,poleHeight:2}],groundCandidates:[0,1,2,3,4,5,6]},observations:[first],newObservation:next,probe:{...next,id:'P'},newFeature:'lamp-position',run:'shadow-test'};
  const before:InquiryConstructedModel={kind:'shadow-ray',rule:'fixed-length',rays:[{caseId:'A',lampX:-4,lampY:6,poleHeight:2,groundX:2}],annotations:[]},after:InquiryConstructedModel={kind:'shadow-ray',rule:'point-lamp',rays:[...before.rays,{caseId:'B',lampX:-6,lampY:6,poleHeight:2,groundX:3}],annotations:[]};
  expect(inquiryModelPath(before,next.query,task.board)).toEqual(['lamp-B','pole-B','ground:2']);const r=replayInquiryModel(task,modelActions(task,before,after,['lamp-B','pole-B','ground:2']))!;expect(inquiryModelFits(r.current!,next,task.board)).toBe(true);expect(inquiryModelFits(r.current!,first,task.board)).toBe(true);
 });
});

import {checkInquiryIslands,solutionInquiryIslands,wrongInquiryIslandsResponses,type InquiryIslandsTask,type InquiryIslandsResponse,type InquiryReview} from '../src/content/models/inquiry-islands';
const review:InquiryReview={prompt:'Perustele omin sanoin.',rubric:[{id:'evidence',label:'Käyttää aineistoa',guide:'Käyttää omia havaintoja.'},{id:'limit',label:'Rajaa tuloksen',guide:'Rajaa tähän tutkimukseen.'}],model:'Malliselitys'};
const full=<T extends object>(t:T):T&{kind:'inquiry-islands';title:string;run:string;review:InquiryReview}=>({...t,kind:'inquiry-islands',title:'Testin tutkimuspöytä',run:'test-run',review});
const assessed=(a:InquiryIslandsResponse):InquiryIslandsResponse=>({...a,review:{observations:{evidence:'met',limit:'met'},confirmedByAdult:true,assistance:'none'}});
const imageTask=full({mode:'observe' as const,skill:'observe-describe' as const,image:{type:'sand-print' as const,width:200,height:100,marks:[]},required:2,features:[{id:'F1',mark:'a',property:'count' as const,value:'3',label:'Kolme jälkeä',observable:true},{id:'F2',mark:'a',property:'surface' as const,value:'rough',label:'Karhea reuna',observable:true},{id:'F3',mark:'a',property:'position' as const,value:'left',label:'Vasemmalla',observable:true},{id:'F4',mark:'a',property:'change' as const,value:'purpose',label:'Joku halusi pelotella',observable:false}]});
const observeAnswer:InquiryIslandsResponse={kind:'inquiry-islands',mode:'observe',selected:['F2','F1'],description:['F1','F2'],uncertainCause:true};
const sample=(id:string,length:number,floats:boolean):InquirySample=>({id,kind:'stone',length,width:2,colour:'grey',surface:'rough',floats,bend:0,transparent:false});
const compareTask=full({mode:'compare' as const,skill:'compare-classify' as const,samples:[sample('A',4,true),sample('B',8,false),sample('C',2,true)],boundary:sample('D',4,false),pair:['A','B'] as const,properties:['length','surface'] as const,rules:[{property:'length' as const,operator:'at-least' as const,value:'4'},{property:'floats' as const,operator:'equal' as const,value:'true'}]});
const compareAnswer:InquiryIslandsResponse={kind:'inquiry-islands',mode:'compare',property:'length',first:'8/2',second:'16/2',relation:'less',rule:{property:'length',operator:'at-least',value:'4'},memberships:[{id:'A',group:1},{id:'B',group:1},{id:'C',group:0}],boundaryGroup:1,boundaryReason:'length'};
const questionTask=full({mode:'question' as const,setup,questionContexts:[{variable:'wind' as const,outcomes:['side-displacement','turn'] as const},{variable:'area' as const,outcomes:['side-displacement'] as const}]});
const questionAnswer:InquiryIslandsResponse={kind:'inquiry-islands',mode:'question',variable:'area',outcome:'side-displacement',investigable:true};
const executionTask=full({...experiment,run:'test-run'});
const executionAnswer:InquiryIslandsResponse={kind:'inquiry-islands',mode:'experiment',actions:executed().map(a=>({...a,run:'test-run'})),observations:['A','B'].flatMap(trial=>[1,2].map(repeat=>({trial,repeat,timeS:3,direction:trial==='A'?'straight':'right'}))),result:'observed',reflection:'revised',scope:'this-model'};
const wholeModelTask=full({...modelTask,run:'test-run'});
const modelAnswer:InquiryIslandsResponse={kind:'inquiry-islands',mode:'model',actions:modelActions(wholeModelTask,initialModel,revisedModel,['c1','c2']),correspondences:[],missing:'real-weather',prediction:['c1','c5'],cause:'declared-route-rule',scope:'local-model'};
const evidenceTask=full({mode:'evidence' as const,skill:'conclusion' as const,quantity:'length' as const,rangeUnit:'cm' as const,minimumRepeats:3,expectedRange:[0,10] as const,scope:'Näiden kuuden näytteen paikallinen vertailu.',rows:[...[4,5,6].map((value,i)=>({id:`A${i+1}`,group:'A' as const,value,unit:'cm' as const,sameMethod:true})),...[10,20,30].map((value,i)=>({id:`B${i+1}`,group:'B' as const,value,unit:'mm' as const,sameMethod:true}))]});
const conclusionAnswer:InquiryIslandsResponse={kind:'inquiry-islands',mode:'evidence',actions:[],claim:'A-higher',support:['B3','A3','B1','A1','B2','A2'],scope:'these-samples',correction:'',correctionUnit:'',retain:true};
describe('Inquiry exact goal checks and adult-production boundary',()=>{
 it('accepts independent complete response fixtures and rejects missing own explanation before mathematical grading',()=>{
  const fixtures:readonly [InquiryIslandsTask,InquiryIslandsResponse][]=[[imageTask,observeAnswer],[compareTask,compareAnswer],[questionTask,questionAnswer],[full({mode:'plan',setup,minimumRepeats:2}),{kind:'inquiry-islands',mode:'plan',plan}],[executionTask,executionAnswer],[wholeModelTask,modelAnswer],[evidenceTask,conclusionAnswer]];
  for(const [task,answer]of fixtures){expect(checkInquiryIslands(task,answer).pendingReview).toBe(true);expect(checkInquiryIslands(task,assessed(answer))).toMatchObject({ok:true,observedByAdult:true});
   expect(checkInquiryIslands(task,assessed(solutionInquiryIslands(task))),task.mode).toMatchObject({ok:true});for(const wrong of wrongInquiryIslandsResponses(task))expect(checkInquiryIslands(task,wrong).ok,task.mode).toBe(false);
  }
 });
 it('accepts a different valid classification property and explicitly checks the new boundary case',()=>{
  const answer:InquiryIslandsResponse={...compareAnswer,rule:{property:'floats',operator:'equal',value:'true'},memberships:[{id:'A',group:1},{id:'B',group:0},{id:'C',group:1}],boundaryGroup:0,boundaryReason:'floats'};
  expect(checkInquiryIslands(compareTask,assessed(answer)).ok).toBe(true);expect(checkInquiryIslands(compareTask,assessed({...answer,boundaryGroup:1})).ok).toBe(false);
 });
 it('distinguishes an intervention effect, a direction change, stopping and no resultant force',()=>{
  expect(inquiryRead({...motion,forceX:-1,mass:1,initialVX:3},'A',1)!.direction).toBe('straight');expect(inquiryRead({...motion,forceX:-1,mass:1,initialVX:3},'A',3)!.direction).toBe('stopped');expect(inquiryRead({...motion,forceX:-1,mass:1,initialVX:3},'A',4)!.direction).toBe('back');
  expect(checkInquiryIslands({...executionTask,skill:'motion'},assessed({...executionAnswer,result:'direction'})).ok).toBe(true);
  expect(checkInquiryIslands({...executionTask,skill:'cause'},assessed({...executionAnswer,result:'model-cause'})).ok).toBe(true);
 });
 it('uses exact mixed units, ties and explicitly inconclusive coverage without cherry-picking',()=>{
  expect(checkInquiryIslands(evidenceTask,assessed(conclusionAnswer)).ok).toBe(true);
  const overlap={...evidenceTask,rows:evidenceTask.rows.map(r=>r.id==='B3'?{...r,value:60}:r)};expect(checkInquiryIslands(overlap,assessed({...conclusionAnswer,claim:'inconclusive'})).ok).toBe(true);expect(checkInquiryIslands(overlap,assessed(conclusionAnswer)).ok).toBe(false);
  const badMethod={...evidenceTask,rows:evidenceTask.rows.map(r=>r.group==='B'?{...r,sameMethod:false}:r)};expect(checkInquiryIslands(badMethod,assessed({...conclusionAnswer,claim:'inconclusive'})).ok).toBe(true);
  const tied={...evidenceTask,rows:evidenceTask.rows.map(r=>({...r,value:0}))};expect(checkInquiryIslands(tied,assessed({...conclusionAnswer,claim:'same'})).ok).toBe(true);
 });
 it('requires the actual recheck before correcting, preserves confirmed outliers and accepts exact alternate units',()=>{
  const task=full({...evidenceTask,skill:'evaluate' as const,suspect:'A1',rows:evidenceTask.rows.map(r=>r.id==='A1'?{...r,value:250,confirmed:2.5}:r)});
  const answer:InquiryIslandsResponse={...conclusionAnswer,actions:[{type:'recheck',id:'a1',run:task.run,row:'A1'}],claim:'correct-error',correction:'50/2',correctionUnit:'mm',retain:false};expect(checkInquiryIslands(task,assessed(answer)).ok).toBe(true);expect(checkInquiryIslands(task,assessed({...answer,actions:[]})).ok).toBe(false);
  const unchanged={...task,rows:task.rows.map(r=>r.id==='A1'?{...r,value:2.5}:r)};expect(checkInquiryIslands(unchanged,assessed({...answer,claim:'retain-outlier',retain:true})).ok).toBe(true);
  const cold={...task,quantity:'temperature' as const,rangeUnit:'°C' as const,rows:task.rows.map(r=>({...r,unit:'°C' as const,...(r.id==='A1'?{confirmed:-1.5}:{})}))};expect(checkInquiryIslands(cold,assessed({...answer,correction:'-3/2',correctionUnit:'°C'})).ok).toBe(true);
 });
 it('keeps pending/adult/helped metadata on wrong results and rejects inherited, unknown and getter response objects',()=>{
  const wrong={...observeAnswer,uncertainCause:false};expect(checkInquiryIslands(imageTask,wrong).pendingReview).toBe(true);const complete=assessed(wrong);
  expect(checkInquiryIslands(imageTask,{...complete,review:{...complete.review!,assistance:'helped'}})).toMatchObject({ok:false,observedByAdult:true,assisted:true});
  expect(checkInquiryIslands(imageTask,{...complete,review:{...complete.review!,assistance:undefined}}).pendingReview).toBe(true);expect(checkInquiryIslands(imageTask,{...complete,review:Object.create(complete.review!)}).pendingReview).toBe(true);
  let reads=0;expect(checkInquiryIslands(imageTask,{...complete,get mode(){reads++;return 'observe';}}).ok).toBe(false);expect(reads).toBe(0);expect(checkInquiryIslands(imageTask,{...complete,secret:'private'}).ok).toBe(false);expect(checkInquiryIslands(imageTask,Object.create(complete)).ok).toBe(false);
 });
});
