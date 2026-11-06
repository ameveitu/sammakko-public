import {atomicOwn,atomicDense} from './atomic-world';
import {parseMeasure} from './spatial-measures';
import {trackMotion} from './force-track';
import {checkObservedExplanation,type CriterionObservation,type ObservedExplanationTask} from './observed-explanations';

export type InquiryRational=readonly [bigint,bigint];
export type InquiryDirection='left'|'right'|'straight'|'back'|'stopped';
export interface InquiryReview {prompt:string;rubric:readonly {id:string;label:string;guide:string}[];model:string}
export interface InquiryAdult {observations:Partial<Record<string,CriterionObservation>>;confirmedByAdult:boolean;assistance:'none'|'helped'}
export interface InquiryPoint {x:number;y:number}
export interface InquiryImage {
 type:'sand-print'|'wave'|'shadow'|'watermark'|'leaf-mark';width:number;height:number;
 marks:readonly {id:string;position:InquiryPoint;shape:'circle'|'oval'|'line';width:number;height:number;count:number;direction:InquiryDirection;surface:'smooth'|'rough'}[];
 before?:readonly {id:string;position:InquiryPoint;width:number;height:number}[];
}
export interface InquiryFeature {id:string;mark:string;property:'position'|'direction'|'size'|'count'|'surface'|'change';value:string;label:string;observable:boolean}
export interface InquirySample {
 id:string;kind:'stone'|'leaf'|'shell'|'material';length:number;width:number;colour:'brown'|'green'|'grey';surface:'smooth'|'rough';
 floats:boolean;bend:number;transparent:boolean;
}
export type InquiryProperty='length'|'width'|'colour'|'surface'|'floats'|'bend'|'transparent';
export interface InquiryRule {property:InquiryProperty;operator:'equal'|'at-least';value:string}
export type InquirySailConfiguration={kind:'sail';wind:number;area:number;mass:number;initialSpeed:number};
export type InquiryWheelConfiguration={kind:'wheel';gate:boolean;flow:number;drag:number};
export type InquiryMotionConfiguration={kind:'motion';forceX:number;forceY:number;mass:number;initialVX:number;initialVY:number;surface:'smooth'|'rough';retardation:number};
export type InquiryShadowConfiguration={kind:'shadow';height:number;lampX:number;lampY:number};
export type InquiryAbsorbConfiguration={kind:'absorb';material:'cloth'|'paper'|'plastic';area:number;water:number;seconds:number};
export type InquiryConfiguration=InquirySailConfiguration|InquiryWheelConfiguration|InquiryMotionConfiguration|InquiryShadowConfiguration|InquiryAbsorbConfiguration;
export type InquiryVariable='wind'|'area'|'mass'|'gate'|'flow'|'forceY'|'surface'|'lampX'|'height'|'material'|'lampY'|'water'|'seconds'|'initialSpeed'|'forceX'|'initialVX'|'initialVY'|'retardation'|'drag';
export type InquiryOutcome='forward-displacement'|'side-displacement'|'turn'|'wheel-speed'|'shadow-length'|'absorbed';
export interface InquiryReading {trial:string;timeS:number;x:InquiryRational;y:InquiryRational;vx:InquiryRational;vy:InquiryRational;quantity:InquiryRational;direction:InquiryDirection;unit:string}
export interface InquirySetup {
 name:string;kind:InquiryConfiguration['kind'];initial:readonly [InquiryConfiguration,InquiryConfiguration];
 variables:readonly InquiryVariable[];controlVariables:readonly InquiryVariable[];outcomes:readonly InquiryOutcome[];values:Partial<Record<InquiryVariable,readonly (string|number|boolean)[]>>;
 seconds:number;scope:string;
}
export interface InquiryCell {id:string;x:number;y:number;height:number;blocked:boolean}
export interface InquiryTerrain {width:number;height:number;cells:readonly InquiryCell[]}
export interface InquiryRoute {id:string;start:string;path:readonly string[];condition:'ordinary'|'new-obstacle'}
export interface InquiryDataRow {id:string;group:'A'|'B';value:number;unit:'cm'|'mm'|'°C';sameMethod:boolean;confirmed?:number}
export type InquiryObserveTask={mode:'observe';skill:'describe'|'observe-describe';image:InquiryImage;features:readonly InquiryFeature[];required:number};
export type InquiryCompareTask={mode:'compare';skill:'compare'|'classify'|'compare-classify';samples:readonly InquirySample[];boundary:InquirySample;pair:readonly [string,string];properties:readonly InquiryProperty[];rules:readonly InquiryRule[]};
export type InquiryQuestionTask={mode:'question';setup:InquirySetup;questionContexts:readonly {variable:InquiryVariable;outcomes:readonly InquiryOutcome[]}[]};
export type InquiryPlanTask={mode:'plan';setup:InquirySetup;minimumRepeats:number};
export type InquiryExperimentTask={mode:'experiment';skill:'execute'|'cause'|'motion';activity:'guided'|'controlled'|'repair-confound';setup:InquirySetup;minimumRepeats:number;givenSequence?:readonly InquiryStep[]};
export interface InquiryModelAnnotation {caseId:string;calm:boolean|null;feed:boolean|null}
export type InquiryConstructedModel=(
 |{kind:'terrain';terrain:InquiryTerrain}
 |{kind:'channel-map';links:readonly {from:string;to:string;when:'open'|'closed'|'new'}[];barriers:readonly string[]}
 |{kind:'shadow-ray';rule:'fixed-length'|'point-lamp';rays:readonly {caseId:string;lampX:number;lampY:number;poleHeight:number;groundX:number}[]}
 )&{annotations:readonly InquiryModelAnnotation[]};
export type InquiryModelQuery={kind:'terrain';start:string}|{kind:'channel-map';condition:'open'|'closed'|'new'}|{kind:'shadow-ray';caseId:string};
export interface InquiryModelObservation {id:string;query:InquiryModelQuery;path:readonly string[];calm:boolean|null;feed:boolean|null;label:string}
export type InquiryModelBoard=
 |{kind:'terrain';template:InquiryTerrain;fixedHeights:readonly {id:string;height:number}[]}
 |{kind:'channel-map';ports:readonly {id:string;x:number;y:number}[];start:string;terminals:readonly string[]}
 |{kind:'shadow-ray';cases:readonly {id:string;lampX:number;lampY:number;poleHeight:number}[];groundCandidates:readonly number[]};
export type InquiryModelTask={mode:'model';skill:'use'|'create'|'revise'|'integrate';board:InquiryModelBoard;observations:readonly InquiryModelObservation[];
 newObservation?:InquiryModelObservation;initialDraft?:InquiryConstructedModel;newFeature?:string;
 correspondences:readonly {id:string;real:string;model:string}[];missingFeatures:readonly string[];probe:InquiryModelObservation;scope:string};
export type InquiryEvidenceTask={mode:'evidence';skill:'conclusion'|'evaluate';quantity:'length'|'temperature';rangeUnit:'cm'|'mm'|'°C';rows:readonly InquiryDataRow[];minimumRepeats:number;expectedRange:readonly [number,number];suspect?:string;scope:string};
export type InquiryIslandsTask=(InquiryObserveTask|InquiryCompareTask|InquiryQuestionTask|InquiryPlanTask|InquiryExperimentTask|InquiryModelTask|InquiryEvidenceTask)
 &{kind:'inquiry-islands';title:string;run:string;review?:InquiryReview};
export type InquiryStep='predict'|'place'|'configure'|'start'|'observe'|'record'|'reset'|'repeat';
export interface InquiryPlan {variable:InquiryVariable;outcome:InquiryOutcome;configurations:readonly [InquiryConfiguration,InquiryConfiguration];controls:readonly InquiryVariable[];sequence:readonly InquiryStep[];repeats:number}
export type InquiryAction=(
 |{type:'configure';trial:string;configuration:InquiryConfiguration}
 |{type:'lock';forecast:InquiryDirection;plan:InquiryPlan}
 |{type:'place';trial:string}
 |{type:'start';trial:string}
 |{type:'advance';trial:string;seconds:number}
 |{type:'observe';trial:string}
 |{type:'record';trial:string}
 |{type:'reset';trial:string}
 |{type:'draft';model:InquiryConstructedModel}
 |{type:'lock-model';prediction:readonly string[]}
 |{type:'reveal-evidence'}
 |{type:'revise';model:InquiryConstructedModel}
 |{type:'test-model';route:string}
 |{type:'recheck';row:string}
 )&{id:string;run:string};
export type InquiryIslandsResponse=(
 |{mode:'observe';selected:readonly string[];description:readonly string[];uncertainCause:boolean}
 |{mode:'compare';property:string;first:string;second:string;relation:string;rule:InquiryRule|null;memberships:readonly {id:string;group:number}[];boundaryGroup:number;boundaryReason:string}
 |{mode:'question';variable:string;outcome:string;investigable:boolean}
 |{mode:'plan';plan:InquiryPlan}
 |{mode:'experiment';actions:readonly InquiryAction[];observations:readonly {trial:string;repeat:number;timeS:number;direction:string}[];result:string;reflection:string;scope:string}
 |{mode:'model';actions:readonly InquiryAction[];correspondences:readonly {id:string;model:string}[];missing:string;prediction:readonly string[];cause:string;scope:string}
 |{mode:'evidence';actions:readonly InquiryAction[];claim:string;support:readonly string[];scope:string;correction:string;correctionUnit:string;retain:boolean}
 )&{kind:'inquiry-islands';review?:InquiryAdult};
export interface InquiryVerdict {ok:boolean;why?:string;pendingReview?:true;observedByAdult?:true;assisted?:true}

export const inquiryNumber=(raw:unknown):InquiryRational|undefined=>typeof raw==='string'&&raw.length<=32?parseMeasure(raw):undefined;
export const inquiryEqual=(raw:unknown,n:InquiryRational)=>{const q=inquiryNumber(raw);return !!q&&q[0]*n[1]===n[0]*q[1];};
const integer=(raw:unknown,min:number,max:number):raw is number=>typeof raw==='number'&&Number.isSafeInteger(raw)&&raw>=min&&raw<=max;
const rational=(n:number,d=1):InquiryRational=>[BigInt(n),BigInt(d)];
const value=(q:InquiryRational)=>Number(q[0])/Number(q[1]);
export function inquirySampleValue(sample:InquirySample,property:InquiryProperty):string{return String(sample[property]);}
export function inquiryMembership(sample:InquirySample,rule:InquiryRule):number{
 const observed=sample[rule.property];
 return rule.operator==='equal'?(String(observed)===rule.value?1:0):(typeof observed==='number'&&observed>=Number(rule.value)?1:0);
}
export function validInquiryConfiguration(raw:unknown):raw is InquiryConfiguration{
 if(!atomicOwn(raw)||!Object.hasOwn(raw,'kind'))return false;
 switch(raw.kind){
  case 'sail':return atomicOwn(raw,['kind','wind','area','mass','initialSpeed'])&&integer(raw.wind,0,4)&&integer(raw.area,1,4)&&integer(raw.mass,1,4)&&integer(raw.initialSpeed,0,2);
  case 'wheel':return atomicOwn(raw,['kind','gate','flow','drag'])&&typeof raw.gate==='boolean'&&integer(raw.flow,1,4)&&integer(raw.drag,1,3);
  case 'motion':return atomicOwn(raw,['kind','forceX','forceY','mass','initialVX','initialVY','surface','retardation'])&&integer(raw.forceX,-3,3)&&integer(raw.forceY,-3,3)&&integer(raw.mass,1,4)&&integer(raw.initialVX,0,3)&&integer(raw.initialVY,-2,2)&&(raw.surface==='smooth'||raw.surface==='rough')&&integer(raw.retardation,1,3);
  case 'shadow':return atomicOwn(raw,['kind','height','lampX','lampY'])&&integer(raw.height,1,4)&&integer(raw.lampX,-8,8)&&raw.lampX!==0&&integer(raw.lampY,2,10)&&raw.lampY>raw.height;
  case 'absorb':return atomicOwn(raw,['kind','material','area','water','seconds'])&&['cloth','paper','plastic'].includes(raw.material as string)&&integer(raw.area,1,4)&&integer(raw.water,1,16)&&integer(raw.seconds,1,8);
  default:return false;
 }
}
/** The model states and records its conditions. This pure result is independent of pixels and animation time. */
export function inquiryRead(configuration:InquiryConfiguration,trial:string,timeS:number):InquiryReading|undefined{
 if(!validInquiryConfiguration(configuration)||!integer(timeS,0,8))return;
 let x:InquiryRational=rational(0),y:InquiryRational=rational(0),vx:InquiryRational=rational(0),vy:InquiryRational=rational(0),quantity:InquiryRational=rational(0),unit='model-unit';
 switch(configuration.kind){
  case 'sail':{
   const {wind,area,mass,initialSpeed}=configuration;
   // A fixed transverse model force turns the boat. With zero resultant it keeps its given velocity.
   x=rational(initialSpeed*timeS);vx=rational(initialSpeed);y=rational(wind*area*timeS*timeS,2*mass);vy=rational(wind*area*timeS,mass);quantity=y;unit='cm';break;
  }
  case 'motion':{
   const c=configuration;
   if(c.surface==='rough'){
    if(c.initialVY!==0||c.forceX!==0||c.forceY!==0)return;
    const tNumerator=Math.min(timeS*c.retardation,c.initialVX),tDenominator=c.retardation;
    x=rational(2*c.initialVX*tNumerator*tDenominator-c.retardation*tNumerator*tNumerator,2*tDenominator*tDenominator);vx=rational(Math.max(0,c.initialVX-c.retardation*timeS));
   }else{
    // Reuse the existing ideal-track law independently for the two horizontal axes.
    const axis=(speed:number,force:number)=>trackMotion({kind:'force-track',title:'Rajattu vaakatasomalli',vehicle:'vene',initialSpeed:speed,mass:c.mass,rightForce:Math.max(force,0),leftForce:Math.max(-force,0),seconds:timeS});
    const horizontal=axis(c.initialVX,c.forceX),vertical=axis(c.initialVY,c.forceY);
    x=rational(2*c.mass*c.initialVX*timeS+c.forceX*timeS*timeS,2*c.mass);y=rational(2*c.mass*c.initialVY*timeS+c.forceY*timeS*timeS,2*c.mass);vx=rational(c.mass*c.initialVX+c.forceX*timeS,c.mass);vy=rational(c.mass*c.initialVY+c.forceY*timeS,c.mass);
    if(Math.abs(value(vx)-horizontal.velocity)>1e-10||Math.abs(value(vy)-vertical.velocity)>1e-10)return;
   }
   quantity=x;unit='cm';break;
  }
  case 'wheel':{
   // A declared damped indicator model, sampled at whole seconds. It does not claim fluid dynamics.
   let speed=0;for(let second=0;second<timeS;second++)speed=Math.max(0,speed+(configuration.gate?configuration.flow:0)-configuration.drag);
   quantity=rational(speed);vx=quantity;unit='turn-unit/s';break;
  }
  case 'shadow':quantity=rational(-configuration.lampX*configuration.height,configuration.lampY-configuration.height);x=quantity;unit='cm';break;
  case 'absorb':{
   if(timeS>configuration.seconds)return;
   const capacities={cloth:3,paper:2,plastic:0};quantity=rational(Math.min(configuration.water,capacities[configuration.material]*configuration.area,timeS));unit='ml';break;
  }
 }
 const direction:InquiryDirection=configuration.kind==='shadow'?(quantity[0]>0n?'right':'left'):configuration.kind==='wheel'?(quantity[0]>0n?'right':'stopped'):vx[0]===0n&&vy[0]===0n&&(configuration.kind==='motion'||configuration.kind==='sail')?'stopped':vy[0]>0n?'right':vy[0]<0n?'left':vx[0]<0n?'back':'straight';
 return {trial,timeS,x,y,vx,vy,quantity,direction,unit};
}
export function validInquiryTerrain(raw:unknown):raw is InquiryTerrain{
 if(!atomicOwn(raw,['width','height','cells'])||!integer(raw.width,2,4)||!integer(raw.height,2,4)||!atomicDense(raw.cells,16)||raw.cells.length!==raw.width*raw.height)return false;
 const ids=new Set<string>(),positions=new Set<string>();
 for(const cell of raw.cells){
  if(!atomicOwn(cell,['id','x','y','height','blocked'])||typeof cell.id!=='string'||!/^c(?:[1-9]|1[0-6])$/.test(cell.id)||!integer(cell.x,0,raw.width-1)||!integer(cell.y,0,raw.height-1)||!integer(cell.height,0,6)||typeof cell.blocked!=='boolean')return false;
  ids.add(cell.id);positions.add(`${cell.x},${cell.y}`);
 }
 return ids.size===raw.cells.length&&positions.size===raw.cells.length;
}
/** Only adjacent lower cells can be entered. Equal candidates use the disclosed compass order east/south/west/north. */
export function inquiryTerrainRoute(terrain:InquiryTerrain,start:string):string[]|undefined{
 if(!validInquiryTerrain(terrain))return;
 let current=terrain.cells.find(c=>c.id===start);if(!current||current.blocked)return;
 const route=[current.id],directions=[[1,0],[0,1],[-1,0],[0,-1]] as const;
 for(let step=0;step<16;step++){
  const neighbours=directions.map(([dx,dy])=>terrain.cells.find(c=>c.x===current!.x+dx&&c.y===current!.y+dy&&!c.blocked&&c.height<current!.height)).filter((c):c is InquiryCell=>!!c);
  const next=neighbours.reduce<InquiryCell|undefined>((best,c)=>!best||c.height<best.height?c:best,undefined);
  if(!next)return route;route.push(next.id);current=next;
 }
 return;
}
export function inquiryExplanation(task:InquiryIslandsTask):ObservedExplanationTask|undefined{return task.review?{kind:'observed-explanation',channel:'spoken',givens:[{label:'Tutkimus',value:task.title}],...task.review}:undefined;}
export function reviewInquiry(task:InquiryIslandsTask,raw:unknown):InquiryVerdict{
 if(!task.review)return raw===undefined?{ok:true}:{ok:false,why:'Tähän tehtävään ei kuulu erillistä aikuisarviota.'};
 if(!atomicOwn(raw,['observations','confirmedByAdult','assistance'])||!atomicOwn(raw.observations,task.review.rubric.map(r=>r.id)))return {ok:false,pendingReview:true,why:'Oma selitys odottaa aikuisen havaintoa. Teksti ja ääni jäävät tähän hetkeen.'};
 return checkObservedExplanation(inquiryExplanation(task)!,{kind:'observed-explanation',channel:'spoken',observations:raw.observations as InquiryAdult['observations'],confirmedByAdult:raw.confirmedByAdult===true,assistance:raw.assistance as InquiryAdult['assistance']});
}

const variables:readonly InquiryVariable[]=['wind','area','mass','gate','flow','forceY','surface','lampX','height','material','lampY','water','seconds','initialSpeed','forceX','initialVX','initialVY','retardation','drag'];
const outcomes:readonly InquiryOutcome[]=['forward-displacement','side-displacement','turn','wheel-speed','shadow-length','absorbed'];
const steps:readonly InquiryStep[]=['predict','place','configure','start','observe','record','reset','repeat'];
const directions:readonly InquiryDirection[]=['left','right','straight','back','stopped'];
const trials=['A','B'] as const;
type Trial=typeof trials[number];
const isTrial=(raw:unknown):raw is Trial=>raw==='A'||raw==='B';
const setEquals=(raw:unknown,wanted:readonly string[])=>atomicDense(raw,32)&&raw.length===wanted.length&&new Set(raw).size===raw.length&&raw.every(v=>typeof v==='string'&&wanted.includes(v));
const copyConfiguration=(c:InquiryConfiguration):InquiryConfiguration=>({...c});
export function sameInquiryConfiguration(a:InquiryConfiguration,b:InquiryConfiguration):boolean{
 return a.kind===b.kind&&Object.keys(a).length===Object.keys(b).length&&Object.entries(a).every(([key,v])=>Object.hasOwn(b,key)&&(b as unknown as Record<string,unknown>)[key]===v);
}
export function inquiryChangedVariable(a:InquiryConfiguration,b:InquiryConfiguration):InquiryVariable|undefined{
 if(!validInquiryConfiguration(a)||!validInquiryConfiguration(b)||a.kind!==b.kind)return;
 const changed=Object.keys(a).filter(key=>key!=='kind'&&(a as unknown as Record<string,unknown>)[key]!== (b as unknown as Record<string,unknown>)[key]);
 return changed.length===1&&variables.includes(changed[0] as InquiryVariable)?changed[0] as InquiryVariable:undefined;
}
export function inquiryConfigurationForSetup(setup:InquirySetup,raw:unknown):raw is InquiryConfiguration{
 if(!validInquiryConfiguration(raw)||raw.kind!==setup.kind)return false;
 const reference=setup.initial[0] as unknown as Record<string,unknown>;
 return Object.entries(raw).every(([key,v])=>{
  if(key==='kind')return true;
  const variable=key as InquiryVariable;
  return setup.variables.includes(variable)?!!setup.values[variable]?.includes(v):reference[key]===v;
 });
}
function validInquiryPlan(raw:unknown,setup:InquirySetup):raw is InquiryPlan{
 return atomicOwn(raw,['variable','outcome','configurations','controls','sequence','repeats'])&&Object.keys(raw).length===6
  &&variables.includes(raw.variable as InquiryVariable)&&outcomes.includes(raw.outcome as InquiryOutcome)
  &&atomicDense(raw.configurations,2)&&raw.configurations.length===2&&raw.configurations.every(c=>inquiryConfigurationForSetup(setup,c))
  &&atomicDense(raw.controls,24)&&raw.controls.every(c=>variables.includes(c as InquiryVariable))&&new Set(raw.controls).size===raw.controls.length
  &&atomicDense(raw.sequence,8)&&raw.sequence.every(s=>steps.includes(s as InquiryStep))&&new Set(raw.sequence).size===raw.sequence.length&&integer(raw.repeats,1,3);
}
export function inquiryPlanOkay(plan:InquiryPlan,setup:InquirySetup,minimumRepeats:number):boolean{
 if(!validInquiryPlan(plan,setup)||!setup.variables.includes(plan.variable)||!setup.outcomes.includes(plan.outcome)||plan.repeats<minimumRepeats||inquiryChangedVariable(plan.configurations[0],plan.configurations[1])!==plan.variable
  ||!setEquals(plan.controls,setup.controlVariables.filter(v=>v!==plan.variable)))return false;
 const order=plan.sequence;
 const before=(a:InquiryStep,b:InquiryStep)=>order.includes(a)&&order.includes(b)&&order.indexOf(a)<order.indexOf(b);
 return before('predict','start')&&before('place','start')&&before('configure','start')&&before('start','observe')&&before('observe','record')
  &&(plan.repeats===1?!order.includes('repeat')&&!order.includes('reset'):before('record','reset')&&before('reset','repeat'));
}
export interface InquiryTrialReplay {
 configuration:InquiryConfiguration;placed:boolean;started:boolean;timeS:number;repeat:number;observed:InquiryReading|null;recorded:boolean;
 records:readonly {repeat:number;reading:InquiryReading}[];
}
export interface InquiryExperimentReplay {locked:boolean;plan:InquiryPlan|null;forecast:InquiryDirection|null;trials:Record<Trial,InquiryTrialReplay>;actionCount:number}
const actionKeys:Record<InquiryAction['type'],readonly string[]>={
 configure:['trial','configuration'],lock:['forecast','plan'],place:['trial'],start:['trial'],advance:['trial','seconds'],observe:['trial'],record:['trial'],reset:['trial'],draft:['model'],'lock-model':['prediction'],'reveal-evidence':[],revise:['model'],'test-model':['route'],recheck:['row'],
};
function validInquiryAction(raw:unknown,run:string):raw is InquiryAction{
 return atomicOwn(raw)&&['type','id','run'].every(key=>Object.hasOwn(raw,key))&&raw.run===run&&typeof raw.id==='string'&&/^a(?:[1-9]|[1-5][0-9]|6[0-4])$/.test(raw.id)
  &&typeof raw.type==='string'&&Object.hasOwn(actionKeys,raw.type)&&atomicOwn(raw,['type','id','run',...actionKeys[raw.type as InquiryAction['type']]]);
}
function sameInquiryPlan(a:InquiryPlan,b:InquiryPlan):boolean{
 return a.variable===b.variable&&a.outcome===b.outcome&&a.repeats===b.repeats&&a.configurations.every((c,i)=>sameInquiryConfiguration(c,b.configurations[i]!))
  &&setEquals(a.controls,b.controls)&&a.sequence.length===b.sequence.length&&a.sequence.every((s,i)=>s===b.sequence[i]);
}
function sameExperimentAction(a:InquiryAction,b:InquiryAction):boolean{
 if(a.type!==b.type||a.id!==b.id||a.run!==b.run)return false;
 switch(a.type){
  case 'configure':return b.type==='configure'&&a.trial===b.trial&&sameInquiryConfiguration(a.configuration,b.configuration);
  case 'lock':return b.type==='lock'&&a.forecast===b.forecast&&sameInquiryPlan(a.plan,b.plan);
  case 'advance':return b.type==='advance'&&a.trial===b.trial&&a.seconds===b.seconds;
  case 'place':case 'start':case 'observe':case 'record':case 'reset':return 'trial' in b&&a.trial===b.trial;
  default:return false;
 }
}
function copyPlan(p:InquiryPlan):InquiryPlan{return {...p,configurations:[copyConfiguration(p.configurations[0]),copyConfiguration(p.configurations[1])],controls:[...p.controls],sequence:[...p.sequence]};}
/** Actual model actions are replayed in order. Observing, recording and a new repeat are separate operations. */
export function replayInquiryExperiment(task:InquiryExperimentTask&{run:string},raw:unknown):InquiryExperimentReplay|undefined{
 if(!atomicDense(raw,64)||!task.setup.initial.every(c=>inquiryConfigurationForSetup(task.setup,c)))return;
 const trial=(c:InquiryConfiguration):InquiryTrialReplay=>({configuration:copyConfiguration(c),placed:false,started:false,timeS:0,repeat:1,observed:null,recorded:false,records:[]});
 const result:InquiryExperimentReplay={locked:false,plan:null,forecast:null,trials:{A:trial(task.setup.initial[0]),B:trial(task.setup.initial[1])},actionCount:0},used=new Map<string,InquiryAction>();
 for(const value of raw){
  if(!validInquiryAction(value,task.run))return;const a=value;
  if(a.type==='configure'){
   if(!isTrial(a.trial)||!inquiryConfigurationForSetup(task.setup,a.configuration))return;
  }else if(a.type==='lock'){
   if(!directions.includes(a.forecast)||!validInquiryPlan(a.plan,task.setup))return;
  }else if(a.type==='advance'){
   if(!isTrial(a.trial)||!integer(a.seconds,1,8))return;
  }else if(a.type==='place'||a.type==='start'||a.type==='observe'||a.type==='record'||a.type==='reset'){
   if(!isTrial(a.trial))return;
  }else return;
  const previous=used.get(a.id);if(previous){if(!sameExperimentAction(previous,a))return;continue;}used.set(a.id,a);
  switch(a.type){
   case 'configure':if(result.locked)return;result.trials[a.trial as Trial].configuration=copyConfiguration(a.configuration);break;
   case 'lock':
    if(result.locked||!sameInquiryConfiguration(a.plan.configurations[0],result.trials.A.configuration)||!sameInquiryConfiguration(a.plan.configurations[1],result.trials.B.configuration))return;
    result.locked=true;result.plan=copyPlan(a.plan);result.forecast=a.forecast;break;
   case 'place':{const t=result.trials[a.trial as Trial];if(!result.locked||t.placed||t.started)return;t.placed=true;break;}
   case 'start':{const t=result.trials[a.trial as Trial];if(!t.placed||t.started)return;t.started=true;break;}
   case 'advance':{const t=result.trials[a.trial as Trial];if(!t.started||t.recorded||t.timeS+a.seconds>task.setup.seconds)return;t.timeS+=a.seconds;t.observed=null;break;}
   case 'observe':{const t=result.trials[a.trial as Trial];if(!t.started||t.recorded)return;const reading=inquiryRead(t.configuration,a.trial,t.timeS);if(!reading)return;t.observed=reading;break;}
   case 'record':{const t=result.trials[a.trial as Trial];if(!t.observed||t.recorded||t.observed.timeS!==t.timeS)return;t.records=[...t.records,{repeat:t.repeat,reading:t.observed}];t.recorded=true;break;}
   case 'reset':{const t=result.trials[a.trial as Trial];if(!t.started||t.repeat>=8)return;t.placed=false;t.started=false;t.timeS=0;t.repeat++;t.observed=null;t.recorded=false;break;}
  }
 }
 result.actionCount=used.size;return result;
}

const safeName=(raw:unknown):raw is string=>typeof raw==='string'&&/^[A-Za-z][A-Za-z0-9-]{0,15}$/.test(raw);
export function validInquiryModel(raw:unknown,board:InquiryModelBoard):raw is InquiryConstructedModel{
 if(!atomicOwn(raw)||raw.kind!==board.kind||!atomicDense(raw.annotations,8)||!raw.annotations.every(a=>atomicOwn(a,['caseId','calm','feed'])&&safeName(a.caseId)&&(typeof a.calm==='boolean'||a.calm===null)&&(typeof a.feed==='boolean'||a.feed===null))||new Set(raw.annotations.map(a=>atomicOwn(a)?a.caseId:null)).size!==raw.annotations.length)return false;
 switch(board.kind){
  case 'terrain':{
   if(!atomicOwn(raw,['kind','terrain','annotations'])||!validInquiryTerrain(raw.terrain))return false;
   const t=raw.terrain;
   return t.width===board.template.width&&t.height===board.template.height&&t.cells.every(c=>board.template.cells.some(g=>g.id===c.id&&g.x===c.x&&g.y===c.y));
  }
  case 'channel-map':{
   if(!atomicOwn(raw,['kind','links','barriers','annotations'])||!atomicDense(raw.links,32)||!atomicDense(raw.barriers,12))return false;
   const ids=board.ports.map(p=>p.id);
   return raw.links.every(l=>atomicOwn(l,['from','to','when'])&&ids.includes(l.from as string)&&ids.includes(l.to as string)&&l.from!==l.to&&['open','closed','new'].includes(l.when as string))
    &&new Set(raw.links.map(l=>atomicOwn(l)?`${l.from}|${l.when}`:null)).size===raw.links.length&&raw.barriers.every(id=>typeof id==='string'&&ids.includes(id)&&id!==board.start&&!board.terminals.includes(id))&&new Set(raw.barriers).size===raw.barriers.length;
  }
  case 'shadow-ray':
   return atomicOwn(raw,['kind','rule','rays','annotations'])&&(raw.rule==='fixed-length'||raw.rule==='point-lamp')&&atomicDense(raw.rays,4)&&raw.rays.every(r=>atomicOwn(r,['caseId','lampX','lampY','poleHeight','groundX'])&&board.cases.some(c=>c.id===r.caseId&&c.lampX===r.lampX&&c.lampY===r.lampY&&c.poleHeight===r.poleHeight)&&integer(r.groundX,-16,16)&&board.groundCandidates.includes(r.groundX))&&new Set(raw.rays.map(r=>atomicOwn(r)?r.caseId:null)).size===raw.rays.length;
 }
}
export function inquiryModelPath(model:InquiryConstructedModel,query:InquiryModelQuery,board:InquiryModelBoard):string[]|undefined{
 if(!validInquiryModel(model,board)||model.kind!==query.kind)return;
 if(model.kind==='terrain'&&query.kind==='terrain')return inquiryTerrainRoute(model.terrain,query.start);
 if(model.kind==='channel-map'&&query.kind==='channel-map'&&board.kind==='channel-map'){
  let port=board.start;const path=[port],visited=new Set([port]);
  for(let step=0;step<board.ports.length;step++){
   if(board.terminals.includes(port))return path;
   let link=model.links.find(l=>l.from===port&&l.when===query.condition);
   if(!link&&query.condition==='new')link=model.links.find(l=>l.from===port&&l.when==='open');
   if(!link||query.condition==='new'&&model.barriers.includes(link.to))return path;
   if(visited.has(link.to))return;port=link.to;visited.add(port);path.push(port);
  }
  return;
 }
 if(model.kind==='shadow-ray'&&query.kind==='shadow-ray'){
  const ray=model.rule==='fixed-length'?[...model.rays].sort((a,b)=>a.caseId.localeCompare(b.caseId))[0]:model.rays.find(r=>r.caseId===query.caseId);if(!ray)return;
  return [`lamp-${query.caseId}`,`pole-${query.caseId}`,`ground:${ray.groundX}`];
 }
 return;
}
const samePath=(raw:unknown,expected:readonly string[]|undefined)=>!!expected&&atomicDense(raw,20)&&raw.length===expected.length&&raw.every((id,i)=>id===expected[i]);
function copyModel(model:InquiryConstructedModel):InquiryConstructedModel{
 const annotations=model.annotations.map(a=>({...a}));
 switch(model.kind){
  case 'terrain':return {kind:model.kind,terrain:{...model.terrain,cells:model.terrain.cells.map(c=>({...c}))},annotations};
  case 'channel-map':return {kind:model.kind,links:model.links.map(l=>({...l})),barriers:[...model.barriers],annotations};
  case 'shadow-ray':return {kind:model.kind,rule:model.rule,rays:model.rays.map(r=>({...r})),annotations};
 }
}
/** Canonical model identity is independent of property and placement-list ordering. */
export function inquiryModelKey(model:InquiryConstructedModel):string{
 const annotations=[...model.annotations].sort((a,b)=>a.caseId.localeCompare(b.caseId)).map(a=>[a.caseId,a.calm,a.feed]);
 switch(model.kind){
  case 'terrain':return JSON.stringify([model.kind,model.terrain.width,model.terrain.height,[...model.terrain.cells].sort((a,b)=>a.id.localeCompare(b.id)).map(c=>[c.id,c.x,c.y,c.height,c.blocked]),annotations]);
  case 'channel-map':return JSON.stringify([model.kind,[...model.links].sort((a,b)=>(a.from+a.when).localeCompare(b.from+b.when)).map(l=>[l.from,l.to,l.when]),[...model.barriers].sort(),annotations]);
  case 'shadow-ray':return JSON.stringify([model.kind,model.rule,[...model.rays].sort((a,b)=>a.caseId.localeCompare(b.caseId)).map(r=>[r.caseId,r.lampX,r.lampY,r.poleHeight,r.groundX]),annotations]);
 }
}
export function inquiryModelFits(model:InquiryConstructedModel,observation:InquiryModelObservation,board:InquiryModelBoard):boolean{
 if(!samePath(inquiryModelPath(model,observation.query,board),observation.path))return false;
 const a=model.annotations.find(a=>a.caseId===observation.id);
 return observation.calm===null&&observation.feed===null?true:!!a&&a.calm===observation.calm&&a.feed===observation.feed;
}
function fixedInquiryModelFits(model:InquiryConstructedModel,board:InquiryModelBoard):boolean{return board.kind!=='terrain'||model.kind==='terrain'&&board.fixedHeights.every(g=>model.terrain.cells.some(c=>c.id===g.id&&c.height===g.height));}
function validOldModel(task:InquiryModelTask,model:InquiryConstructedModel):boolean{
 if(!validInquiryModel(model,task.board)||!fixedInquiryModelFits(model,task.board)||!task.observations.every(o=>inquiryModelFits(model,o,task.board)))return false;
 const oldIds=task.observations.map(o=>o.id);
 if(!model.annotations.every(a=>oldIds.includes(a.caseId)))return false;
 if(task.skill==='revise'||task.skill==='integrate'){
  if(model.kind==='terrain'&&model.terrain.cells.some(c=>c.blocked))return false;
  if(model.kind==='channel-map'&&(model.barriers.length||model.links.some(l=>l.when==='new')))return false;
  if(model.kind==='shadow-ray'&&(model.rule!=='fixed-length'||model.rays.some(r=>!task.observations.some(o=>o.query.kind==='shadow-ray'&&o.query.caseId===r.caseId))))return false;
 }
 return true;
}
export interface InquiryModelTest {observation:string;path:readonly string[];modelKey:string}
export interface InquiryModelReplay {current:InquiryConstructedModel|null;old:InquiryConstructedModel|null;locked:boolean;prediction:readonly string[];revealed:boolean;tests:readonly InquiryModelTest[];revisionCount:number;actionCount:number}
function sameModelAction(a:InquiryAction,b:InquiryAction):boolean{
 if(a.type!==b.type||a.id!==b.id||a.run!==b.run)return false;
 switch(a.type){
  case 'draft':case 'revise':return (b.type==='draft'||b.type==='revise')&&inquiryModelKey(a.model)===inquiryModelKey(b.model);
  case 'lock-model':return b.type==='lock-model'&&samePath(a.prediction,b.prediction);
  case 'reveal-evidence':return b.type==='reveal-evidence';
  case 'test-model':return b.type==='test-model'&&a.route===b.route;
  default:return false;
 }
}
/** The old learner model and prediction remain immutable after evidence opens, even when the current model changes. */
export function replayInquiryModel(task:InquiryModelTask&{run:string},raw:unknown):InquiryModelReplay|undefined{
 if(!atomicDense(raw,64))return;
 const result:InquiryModelReplay={current:null,old:null,locked:false,prediction:[],revealed:false,tests:[],revisionCount:0,actionCount:0},used=new Map<string,InquiryAction>();
 for(const value of raw){
  if(!validInquiryAction(value,task.run))return;const a=value;
  if(a.type==='draft'||a.type==='revise'){
   if(!validInquiryModel(a.model,task.board))return;
  }else if(a.type==='lock-model'){
   if(!atomicDense(a.prediction,20)||!a.prediction.every(id=>typeof id==='string'&&id.length<=32))return;
  }else if(a.type==='test-model'){
   if(!task.observations.some(o=>o.id===a.route)&&a.route!==task.newObservation?.id&&a.route!==task.probe.id)return;
  }else if(a.type!=='reveal-evidence')return;
  const previous=used.get(a.id);if(previous){if(!sameModelAction(previous,a))return;continue;}used.set(a.id,a);
  switch(a.type){
   case 'draft':if(result.locked||result.revealed)return;result.current=copyModel(a.model);break;
   case 'lock-model':{
    if(result.locked||!result.current||!validOldModel(task,result.current)||!samePath(a.prediction,inquiryModelPath(result.current,task.probe.query,task.board)))return;
    result.locked=true;result.old=copyModel(result.current);result.prediction=[...a.prediction];break;
   }
   case 'reveal-evidence':if(!result.locked||result.revealed||!task.newObservation||!result.old||!result.tests.some(t=>t.observation===task.probe.id&&t.modelKey===inquiryModelKey(result.old!)))return;result.revealed=true;break;
   case 'revise':if(!result.revealed||!result.current)return;result.current=copyModel(a.model);result.revisionCount++;break;
   case 'test-model':{
    if(!result.current||!result.locked||a.route===task.newObservation?.id&&!result.revealed)return;
    const observation=[...task.observations,task.probe,...(result.revealed&&task.newObservation?[task.newObservation]:[])].find(o=>o.id===a.route)!;
    const path=inquiryModelPath(result.current,observation.query,task.board);if(!path)return;
    result.tests=[...result.tests,{observation:a.route,path:[...path],modelKey:inquiryModelKey(result.current)}];break;
   }
  }
 }
 result.actionCount=used.size;return result;
}

const qAdd=(a:InquiryRational,b:InquiryRational):InquiryRational=>[a[0]*b[1]+b[0]*a[1],a[1]*b[1]];
const qMultiply=(a:InquiryRational,b:InquiryRational):InquiryRational=>[a[0]*b[0],a[1]*b[1]];
const qNegative=(a:InquiryRational):InquiryRational=>[-a[0],a[1]];
const qSame=(a:InquiryRational,b:InquiryRational)=>a[0]*b[1]===b[0]*a[1];
export function inquiryMotionChange(configuration:InquiryConfiguration,reading:InquiryReading):string{
 const initial=inquiryRead(configuration,reading.trial,0);if(!initial)return 'unknown';
 const beforeStill=initial.vx[0]===0n&&initial.vy[0]===0n,afterStill=reading.vx[0]===0n&&reading.vy[0]===0n;
 if(afterStill)return beforeStill?'same':'stop';if(beforeStill)return 'start';
 const cross=qAdd(qMultiply(initial.vx,reading.vy),qNegative(qMultiply(initial.vy,reading.vx))),dot=qAdd(qMultiply(initial.vx,reading.vx),qMultiply(initial.vy,reading.vy));
 if(cross[0]!==0n||dot[0]<0n)return 'direction';
 const beforeSquared=qAdd(qMultiply(initial.vx,initial.vx),qMultiply(initial.vy,initial.vy)),afterSquared=qAdd(qMultiply(reading.vx,reading.vx),qMultiply(reading.vy,reading.vy));
 return qSame(beforeSquared,afterSquared)?'same':'speed';
}
export function inquiryExperimentResult(task:InquiryExperimentTask,replay:InquiryExperimentReplay):string|undefined{
 const a=replay.trials.A.records.find(r=>r.reading.timeS===task.setup.seconds)?.reading,b=replay.trials.B.records.find(r=>r.reading.timeS===task.setup.seconds)?.reading;if(!a||!b)return;
 if(task.skill==='motion')return inquiryMotionChange(replay.trials.B.configuration,b);
 if(task.skill==='execute')return 'observed';
 return !qSame(a.quantity,b.quantity)||a.direction!==b.direction?'model-cause':'no-difference';
}
function experimentOkay(task:InquiryExperimentTask&{run:string},response:Extract<InquiryIslandsResponse,{mode:'experiment'}>):boolean{
 const replay=replayInquiryExperiment(task,response.actions);if(!replay?.locked||!replay.plan||!inquiryPlanOkay(replay.plan,task.setup,task.minimumRepeats))return false;
 if(task.givenSequence&&!samePath(replay.plan.sequence,task.givenSequence))return false;
 if(task.activity==='guided'&&(!sameInquiryConfiguration(replay.plan.configurations[0],task.setup.initial[0])||!sameInquiryConfiguration(replay.plan.configurations[1],task.setup.initial[1])))return false;
 if(!trials.every(id=>replay.trials[id].records.filter(r=>r.reading.timeS===task.setup.seconds).length>=replay.plan!.repeats))return false;
 const records=trials.flatMap(trial=>replay.trials[trial].records.map(r=>({trial,...r})));
 if(!atomicDense(response.observations,16)||response.observations.length!==records.length||new Set(response.observations.map(o=>atomicOwn(o)?`${o.trial}|${o.repeat}`:null)).size!==records.length)return false;
 if(!records.every(r=>response.observations.some(o=>atomicOwn(o,['trial','repeat','timeS','direction'])&&o.trial===r.trial&&o.repeat===r.repeat&&o.timeS===r.reading.timeS&&o.direction===r.reading.direction)))return false;
 const b=replay.trials.B.records.find(r=>r.reading.timeS===task.setup.seconds)!.reading;
 return response.result===inquiryExperimentResult(task,replay)&&response.reflection===(replay.forecast===b.direction?'confirmed':'revised')&&response.scope==='this-model';
}
function observeOkay(task:InquiryObserveTask,response:Extract<InquiryIslandsResponse,{mode:'observe'}>):boolean{
 const description=response.description;
 if(!atomicDense(description,8)||description.length!==task.required||new Set(description).size!==description.length)return false;
 const facts=description.map(id=>task.features.find(f=>f.id===id));
 if(facts.some(f=>!f?.observable)||new Set(facts.map(f=>f!.property)).size!==task.required)return false;
 return response.uncertainCause===true&&(task.skill==='observe-describe'?setEquals(response.selected,description as string[]):atomicDense(response.selected,0));
}
function compareOkay(task:InquiryCompareTask,response:Extract<InquiryIslandsResponse,{mode:'compare'}>):boolean{
 if(task.skill!=='classify'){
  if(!task.properties.includes(response.property as InquiryProperty))return false;
  const property=response.property as InquiryProperty,a=task.samples.find(s=>s.id===task.pair[0])!,b=task.samples.find(s=>s.id===task.pair[1])!,first=a[property],second=b[property];
  const valid=(raw:unknown,v:typeof first)=>typeof v==='number'?inquiryEqual(raw,rational(v)):raw===String(v);
  const relation=typeof first==='number'&&typeof second==='number'?(first<second?'less':first>second?'more':'equal'):first===second?'same':'different';
  if(!valid(response.first,first)||!valid(response.second,second)||response.relation!==relation)return false;
 }else if(response.property!==''||response.first!==''||response.second!==''||response.relation!=='')return false;
 if(task.skill==='compare')return response.rule===null&&atomicDense(response.memberships,0)&&response.boundaryGroup===-1&&response.boundaryReason==='';
 const rule=response.rule;
 if(!atomicOwn(rule,['property','operator','value'])||!task.rules.some(r=>r.property===rule.property&&r.operator===rule.operator&&r.value===rule.value)||!atomicDense(response.memberships,12)||response.memberships.length!==task.samples.length)return false;
 if(new Set(response.memberships.map(m=>atomicOwn(m)?m.id:null)).size!==task.samples.length)return false;
 return task.samples.every(s=>response.memberships.some(m=>atomicOwn(m,['id','group'])&&m.id===s.id&&m.group===inquiryMembership(s,rule as InquiryRule)))
  &&response.boundaryGroup===inquiryMembership(task.boundary,rule as InquiryRule)&&response.boundaryReason===rule.property;
}
function modelOkay(task:InquiryModelTask&{run:string},response:Extract<InquiryIslandsResponse,{mode:'model'}>):boolean{
 const r=replayInquiryModel(task,response.actions);if(!r?.current||!r.old||!r.locked||!fixedInquiryModelFits(r.current,task.board))return false;
 const revised=task.skill==='revise'||task.skill==='integrate';
 if(revised&&(!r.revealed||r.revisionCount<1||inquiryModelKey(r.current)===inquiryModelKey(r.old)))return false;
 if(revised&&task.newFeature){
  if(r.current.kind==='terrain'&&(!r.current.terrain.cells.some(c=>c.id===task.newFeature&&c.blocked)||r.old.kind!=='terrain'||r.old.terrain.cells.some(c=>c.id===task.newFeature&&c.blocked)))return false;
  if(r.current.kind==='channel-map'&&(!r.current.barriers.includes(task.newFeature)||r.old.kind!=='channel-map'||r.old.barriers.includes(task.newFeature)))return false;
  if(r.current.kind==='shadow-ray'&&(r.current.rule!=='point-lamp'||r.old.kind!=='shadow-ray'||r.old.rule!=='fixed-length'))return false;
 }
 const all=[...task.observations,...(r.revealed&&task.newObservation?[task.newObservation]:[]),task.probe];
 if(!all.every(o=>inquiryModelFits(r.current!,o,task.board)))return false;
 if(r.current.kind==='shadow-ray'&&r.current.rule==='point-lamp'&&!r.current.rays.every(ray=>BigInt(ray.lampY-ray.poleHeight)*BigInt(ray.groundX)===BigInt(-ray.lampX*ray.poleHeight)))return false;
 const key=inquiryModelKey(r.current);
 if(!all.every(o=>r.tests.some(t=>t.observation===o.id&&t.modelKey===key&&samePath(t.path,o.path))))return false;
 if(!atomicDense(response.correspondences,8)||response.correspondences.length!==task.correspondences.length||new Set(response.correspondences.map(c=>atomicOwn(c)?c.id:null)).size!==task.correspondences.length)return false;
 return task.correspondences.every(c=>response.correspondences.some(p=>atomicOwn(p,['id','model'])&&p.id===c.id&&p.model===c.model))&&task.missingFeatures.includes(response.missing)
  &&samePath(response.prediction,inquiryModelPath(r.current,task.probe.query,task.board))&&response.cause===(task.board.kind==='terrain'?'declared-route-rule':task.board.kind==='channel-map'?'observed-connections':'straight-ray')&&response.scope==='local-model';
}
function inquiryDataValue(row:InquiryDataRow):InquiryRational|undefined{
 const q=inquiryNumber(String(row.value));return q?(row.unit==='cm'?[q[0]*10n,q[1]]:q):undefined;
}
export function inquiryConclusion(task:InquiryEvidenceTask):string{
 const a=task.rows.filter(r=>r.group==='A'&&r.sameMethod).map(inquiryDataValue),b=task.rows.filter(r=>r.group==='B'&&r.sameMethod).map(inquiryDataValue);
 if(a.length<task.minimumRepeats||b.length<task.minimumRepeats||[...a,...b].some(q=>!q))return 'inconclusive';
 const lower=(x:InquiryRational,y:InquiryRational)=>x[0]*y[1]<y[0]*x[1];
 const aa=a as InquiryRational[],bb=b as InquiryRational[],min=(qs:InquiryRational[])=>qs.reduce((x,y)=>lower(x,y)?x:y),max=(qs:InquiryRational[])=>qs.reduce((x,y)=>lower(x,y)?y:x);
 if(lower(max(bb),min(aa)))return 'A-higher';if(lower(max(aa),min(bb)))return 'B-higher';
 return [...aa,...bb].every(q=>qSame(q,aa[0]!))?'same':'inconclusive';
}
export function replayInquiryRechecks(task:InquiryEvidenceTask&{run:string},raw:unknown):ReadonlyMap<string,number>|undefined{
 if(!atomicDense(raw,64))return;const observed=new Map<string,number>(),used=new Map<string,InquiryAction>();
 for(const value of raw){
  if(!validInquiryAction(value,task.run)||value.type!=='recheck')return;
  const row=task.rows.find(r=>r.id===value.row);if(!row||row.confirmed===undefined||!Number.isFinite(row.confirmed))return;
  const previous=used.get(value.id);if(previous){if(previous.type!=='recheck'||previous.row!==value.row)return;continue;}used.set(value.id,value);observed.set(row.id,row.confirmed);
 }
 return observed;
}
function evidenceOkay(task:InquiryEvidenceTask&{run:string},response:Extract<InquiryIslandsResponse,{mode:'evidence'}>):boolean{
 if(!atomicDense(response.support,16)||!response.support.length||new Set(response.support).size!==response.support.length||!response.support.every(id=>task.rows.some(r=>r.id===id))||response.scope!=='these-samples')return false;
 if(task.skill==='conclusion'){
  if(!atomicDense(response.actions,0)||response.correction!==''||response.correctionUnit!==''||response.retain!==true||response.claim!==inquiryConclusion(task))return false;
  const valid=task.rows.filter(r=>(response.claim==='inconclusive'||r.sameMethod)&&response.support.includes(r.id));
  return ['A','B'].every(group=>valid.filter(r=>r.group===group).length>=(response.claim==='inconclusive'?Math.min(1,task.rows.filter(r=>r.group===group).length):task.minimumRepeats));
 }
 const checked=replayInquiryRechecks(task,response.actions),suspect=task.rows.find(r=>r.id===task.suspect),confirmed=suspect?checked?.get(suspect.id):undefined;
 if(!suspect||confirmed===undefined||!response.support.includes(suspect.id)||!response.support.some(id=>id!==suspect.id))return false;
 const changed=confirmed!==suspect.value;
 if(response.claim!==(changed?'correct-error':'retain-outlier')||response.retain===changed)return false;
 const q=inquiryNumber(response.correction);if(!q)return false;
 const expected=inquiryNumber(String(confirmed));if(!expected)return false;
 if(task.quantity==='temperature')return response.correctionUnit==='°C'&&qSame(q,expected);
 if(response.correctionUnit!=='cm'&&response.correctionUnit!=='mm')return false;
 const factor=response.correctionUnit==='cm'?10n:1n,target:InquiryRational=suspect.unit==='cm'?[expected[0]*10n,expected[1]]:expected;
 return q[0]*factor*target[1]===target[0]*q[1];
}
const responseKeys:Record<InquiryIslandsTask['mode'],readonly string[]>={observe:['selected','description','uncertainCause'],compare:['property','first','second','relation','rule','memberships','boundaryGroup','boundaryReason'],question:['variable','outcome','investigable'],plan:['plan'],experiment:['actions','observations','result','reflection','scope'],model:['actions','correspondences','missing','prediction','cause','scope'],evidence:['actions','claim','support','scope','correction','correctionUnit','retain']};
export const inquiryFeedback:Record<InquiryIslandsTask['mode'],string>={
 observe:'Osoita tai kuvaa näkyviä piirteitä. Jäljen tekijä tai tarkoitus jäävät tässä aineistossa avoimiksi. Kaksi eri piirrettä kertoo enemmän kuin saman havainnon toisto.',
 compare:'Vertaa samaa ominaisuutta molemmista. Luokittele jokainen näyte ja uusi rajatapaus samalla valitsemallasi säännöllä.',
 question:'Muodosta kysymys sellaisesta muutettavasta asiasta ja havaittavasta tuloksesta, joihin tämä tutkimuspöytä antaa välineet.',
 plan:'Tee toistettava suunnitelma. Muuta yhtä tekijää, nimeä vakiot ja aseta ennuste, aloitus, havainto sekä kirjaus oikeaan järjestykseen.',
 experiment:'Aseta kohde, käynnistä, havainnoi ja kirjaa kumpikin vertailu. Uusi toisto tarvitsee oman aloituksensa. Säilytä lukittu ennuste ja korjaa päätelmä havainnon perusteella.',
 model:'Rakenna malli havaintojen perusteella. Koettele vanha ennuste ennen uutta havaintoa. Korjauksen on säilytettävä aiemmat havainnot, ja myös korjattu malli tarvitsee omat kokeensa.',
 evidence:'Käytä koko annettua aineistoa ja rajaa johtopäätös sen kattavuuteen. Poikkeava tulos tutkitaan uudelleen ennen korjausta, ja vahvistunut poikkeama säilyy.',
};
export function checkInquiryIslands(task:InquiryIslandsTask,raw:unknown):InquiryVerdict{
 if(!atomicOwn(raw,['kind','mode','review',...responseKeys[task.mode]])||raw.kind!=='inquiry-islands'||raw.mode!==task.mode)return {ok:false,why:'Tuota tämän tutkimuksen oma vastaus.'};
 const response=raw as InquiryIslandsResponse,review=reviewInquiry(task,response.review);if(review.pendingReview)return review;
 let ok=false;
 switch(task.mode){
  case 'observe':ok=response.mode==='observe'&&observeOkay(task,response);break;
  case 'compare':ok=response.mode==='compare'&&compareOkay(task,response);break;
  case 'question':ok=response.mode==='question'&&response.investigable===true&&task.questionContexts.some(q=>q.variable===response.variable&&q.outcomes.includes(response.outcome as InquiryOutcome));break;
  case 'plan':ok=response.mode==='plan'&&inquiryPlanOkay(response.plan,task.setup,task.minimumRepeats);break;
  case 'experiment':ok=response.mode==='experiment'&&experimentOkay(task,response);break;
  case 'model':ok=response.mode==='model'&&modelOkay(task,response);break;
  case 'evidence':ok=response.mode==='evidence'&&evidenceOkay(task,response);break;
 }
 return ok?review:{ok:false,why:inquiryFeedback[task.mode],...(review.observedByAdult?{observedByAdult:true as const}:{}),...(review.assisted?{assisted:true as const}:{})};
}

export function inquiryDefaultPlan(setup:InquirySetup,repeats:number):InquiryPlan|undefined{
 const a=copyConfiguration(setup.initial[0]);
 for(const variable of setup.variables)for(const option of setup.values[variable]??[]){
  const b={...a,[variable]:option};if(!inquiryConfigurationForSetup(setup,b)||inquiryChangedVariable(a,b)!==variable)continue;
  return {variable,outcome:setup.outcomes[0]!,configurations:[a,b],controls:setup.controlVariables.filter(v=>v!==variable),repeats,sequence:['configure','predict','place','start','observe','record',...(repeats>1?['reset','repeat'] as const:[])]};
 }
 return;
}
function modelAnnotations(observations:readonly InquiryModelObservation[]):InquiryModelAnnotation[]{return observations.filter(o=>o.calm!==null||o.feed!==null).map(o=>({caseId:o.id,calm:o.calm,feed:o.feed}));}
/** Integer difference constraints construct one terrain witness. Learner grading accepts every fitting terrain. */
export function inquiryTerrainWitness(board:Extract<InquiryModelBoard,{kind:'terrain'}>,observations:readonly InquiryModelObservation[],barrier?:string):InquiryTerrain|undefined{
 const cells=board.template.cells.map(c=>({...c,blocked:c.blocked||c.id===barrier,height:board.fixedHeights.find(f=>f.id===c.id)?.height??0}));
 const fixed=new Map(board.fixedHeights.map(c=>[c.id,c.height])),edges:{from:string;to:string;gap:number}[]=[],directions=[[1,0],[0,1],[-1,0],[0,-1]] as const;
 for(const observation of observations){
  if(observation.query.kind!=='terrain'||observation.path[0]!==observation.query.start)return;
  for(const [i,id]of observation.path.entries()){
   const current=cells.find(c=>c.id===id);if(!current||current.blocked)return;
   const neighbours=directions.map(([dx,dy])=>cells.find(c=>c.x===current.x+dx&&c.y===current.y+dy&&!c.blocked)).filter((c):c is InquiryCell=>!!c),next=observation.path[i+1];
   if(next){
    const chosen=neighbours.findIndex(c=>c.id===next);if(chosen<0)return;
    edges.push({from:next,to:id,gap:1});
    for(const [rank,n]of neighbours.entries())if(n.id!==next)edges.push({from:next,to:n.id,gap:rank<chosen?1:0});
   }else for(const n of neighbours)edges.push({from:id,to:n.id,gap:0});
  }
 }
 for(let iteration=0;iteration<cells.length*7;iteration++){
  let changed=false;
  for(const edge of edges){const source=cells.find(c=>c.id===edge.from)!,target=cells.find(c=>c.id===edge.to)!,needed=source.height+edge.gap;if(target.height>=needed)continue;if(needed>6||fixed.has(target.id)&&fixed.get(target.id)!<needed)return;target.height=needed;changed=true;}
  if(!changed)return {width:board.template.width,height:board.template.height,cells};
 }
 return;
}
export function inquiryModelWitness(task:InquiryModelTask,includeNew:boolean):InquiryConstructedModel|undefined{
 const observations=[...task.observations,...(includeNew&&task.newObservation?[task.newObservation]:[])],constraints=includeNew||task.skill==='use'||task.skill==='create'?[...observations,task.probe]:observations,annotations=modelAnnotations(observations),board=task.board;
 switch(board.kind){
  case 'terrain':{const terrain=inquiryTerrainWitness(board,constraints,includeNew?task.newFeature:undefined);return terrain?{kind:'terrain',terrain,annotations}:undefined;}
  case 'channel-map':{
   const links:Extract<InquiryConstructedModel,{kind:'channel-map'}>['links'][number][]=[];
   for(const observation of constraints){if(observation.query.kind!=='channel-map')return;for(let i=1;i<observation.path.length;i++){const from=observation.path[i-1]!,to=observation.path[i]!,when=observation.query.condition,existing=links.find(l=>l.from===from&&l.when===when);if(existing&&existing.to!==to)return;if(!existing)links.push({from,to,when});}}
   return {kind:board.kind,links,barriers:includeNew&&task.newFeature?[task.newFeature]:[],annotations};
  }
  case 'shadow-ray':{
   const initial=task.skill==='revise'||task.skill==='integrate',cases=includeNew||!initial?board.cases:board.cases.filter(c=>observations.some(o=>o.query.kind==='shadow-ray'&&o.query.caseId===c.id)),rays=cases.map(c=>({caseId:c.id,lampX:c.lampX,lampY:c.lampY,poleHeight:c.poleHeight,groundX:-c.lampX*c.poleHeight/(c.lampY-c.poleHeight)}));
   const model:InquiryConstructedModel={kind:board.kind,rule:initial&&!includeNew?'fixed-length':'point-lamp',rays,annotations};return validInquiryModel(model,board)?model:undefined;
  }
 }
}
export function solutionInquiryIslands(task:InquiryIslandsTask):InquiryIslandsResponse{
 const kind='inquiry-islands' as const;let answer:InquiryIslandsResponse;
 switch(task.mode){
  case 'observe':{
   const picked:InquiryFeature[]=[];for(const f of task.features)if(f.observable&&!picked.some(p=>p.property===f.property)&&picked.length<task.required)picked.push(f);
   answer={kind,mode:task.mode,selected:task.skill==='describe'?[]:picked.map(f=>f.id),description:picked.map(f=>f.id),uncertainCause:true};break;
  }
  case 'compare':{
   const property=task.properties[0]!,a=task.samples.find(s=>s.id===task.pair[0])!,b=task.samples.find(s=>s.id===task.pair[1])!,first=a[property],second=b[property],rule=task.skill==='compare'?null:task.rules[0]!;
   answer={kind,mode:'compare',property:task.skill==='classify'?'':property,first:task.skill==='classify'?'':String(first),second:task.skill==='classify'?'':String(second),relation:task.skill==='classify'?'':typeof first==='number'&&typeof second==='number'?(first<second?'less':first>second?'more':'equal'):first===second?'same':'different',rule,memberships:rule?task.samples.map(s=>({id:s.id,group:inquiryMembership(s,rule)})):[],boundaryGroup:rule?inquiryMembership(task.boundary,rule):-1,boundaryReason:rule?.property??''};break;
  }
  case 'question':answer={kind,mode:'question',variable:task.questionContexts[0]!.variable,outcome:task.questionContexts[0]!.outcomes[0]!,investigable:true};break;
  case 'plan':{const plan=inquiryDefaultPlan(task.setup,task.minimumRepeats);if(!plan)throw new Error('An authored plan needs a supported single-variable contrast.');answer={kind,mode:'plan',plan};break;}
  case 'experiment':{
   let plan=inquiryDefaultPlan(task.setup,task.minimumRepeats);if(!plan)throw new Error('An authored experiment needs a supported plan.');
   if(task.activity==='guided'){const variable=inquiryChangedVariable(...task.setup.initial);if(!variable)throw new Error('Guided experiments state one changed variable.');plan={...plan,variable,configurations:task.setup.initial,controls:task.setup.controlVariables.filter(v=>v!==variable)};}
   if(task.givenSequence)plan={...plan,sequence:task.givenSequence};
   const actions:InquiryAction[]=[];const add=(a:object)=>actions.push({...a,id:`a${actions.length+1}`,run:task.run} as InquiryAction),forecast=inquiryRead(plan.configurations[1],'B',task.setup.seconds)!.direction;
   for(const [i,trial]of trials.entries())add({type:'configure',trial,configuration:plan.configurations[i]});add({type:'lock',plan,forecast});
   for(const trial of trials)for(let repeat=0;repeat<plan.repeats;repeat++){if(repeat)add({type:'reset',trial});add({type:'place',trial});add({type:'start',trial});if(task.setup.seconds)add({type:'advance',trial,seconds:task.setup.seconds});add({type:'observe',trial});add({type:'record',trial});}
   const replay=replayInquiryExperiment(task,actions);if(!replay)throw new Error('Authored experiment protocol is inconsistent.');
   answer={kind,mode:'experiment',actions,observations:trials.flatMap(trial=>replay.trials[trial].records.map(r=>({trial,repeat:r.repeat,timeS:r.reading.timeS,direction:r.reading.direction}))),result:inquiryExperimentResult(task,replay)!,reflection:'confirmed',scope:'this-model'};break;
  }
  case 'model':{
   const old=inquiryModelWitness(task,false);if(!old)throw new Error('An authored model needs a fitting initial witness.');
   const prediction=inquiryModelPath(old,task.probe.query,task.board);if(!prediction)throw new Error('The initial model needs a testable forecast.');
   const actions:InquiryAction[]=[];const add=(a:object)=>actions.push({...a,id:`a${actions.length+1}`,run:task.run} as InquiryAction);
   add({type:'draft',model:old});add({type:'lock-model',prediction});
   let current=old;
   if(task.skill==='revise'||task.skill==='integrate'){
    add({type:'test-model',route:task.probe.id});add({type:'reveal-evidence'});const revised=inquiryModelWitness(task,true);if(!revised)throw new Error('The new observation needs a fitting revision.');current=revised;add({type:'revise',model:current});
   }
   for(const observation of [...task.observations,...(task.newObservation?[task.newObservation]:[]),task.probe])add({type:'test-model',route:observation.id});
   answer={kind,mode:'model',actions,correspondences:task.correspondences.map(c=>({id:c.id,model:c.model})),missing:task.missingFeatures[0]!,prediction:inquiryModelPath(current,task.probe.query,task.board)!,cause:task.board.kind==='terrain'?'declared-route-rule':task.board.kind==='channel-map'?'observed-connections':'straight-ray',scope:'local-model'};break;
  }
  case 'evidence':{
   if(task.skill==='conclusion')answer={kind,mode:'evidence',actions:[],claim:inquiryConclusion(task),support:task.rows.map(r=>r.id),scope:'these-samples',correction:'',correctionUnit:'',retain:true};
   else {const row=task.rows.find(r=>r.id===task.suspect);if(!row||row.confirmed===undefined)throw new Error('A recheck needs a recorded source result.');const changed=row.value!==row.confirmed;answer={kind,mode:'evidence',actions:[{type:'recheck',id:'a1',run:task.run,row:row.id}],claim:changed?'correct-error':'retain-outlier',support:task.rows.map(r=>r.id),scope:'these-samples',correction:String(row.confirmed),correctionUnit:row.unit,retain:!changed};}
   break;
  }
 }
 return task.review?{...answer,review:{observations:{},confirmedByAdult:false,assistance:'none'}}:answer;
}
export function wrongInquiryIslandsResponses(task:InquiryIslandsTask):InquiryIslandsResponse[]{
 const base=solutionInquiryIslands(task),answer={...base,...(task.review?{review:{observations:Object.fromEntries(task.review.rubric.map(r=>[r.id,'met' as const])),confirmedByAdult:true,assistance:'none' as const}}:{})};
 switch(answer.mode){
  case 'observe':return [{...answer,uncertainCause:false},{...answer,description:answer.description.slice(1)}];
  case 'compare':return task.mode==='compare'&&task.skill==='compare'?[{...answer,relation:'different-property'},{...answer,first:'999'}]:[{...answer,memberships:answer.memberships.map((m,i)=>i?m:{...m,group:1-m.group})},{...answer,boundaryGroup:1-answer.boundaryGroup}];
  case 'question':return [{...answer,investigable:false},{...answer,outcome:'opinion'}];
  case 'plan':return [{...answer,plan:{...answer.plan,controls:[]}},{...answer,plan:{...answer.plan,sequence:[...answer.plan.sequence].reverse()}}];
  case 'experiment':return [{...answer,actions:answer.actions.filter(a=>a.type!=='observe')},{...answer,result:'all-world-causes'},{...answer,observations:[]}];
  case 'model':return [{...answer,actions:answer.actions.filter(a=>a.type!=='test-model')},{...answer,prediction:[]},...(task.mode==='model'&&task.newObservation?[{...answer,actions:answer.actions.filter(a=>a.type!=='revise')}]:[])];
  case 'evidence':return [{...answer,scope:'everywhere'},{...answer,claim:'discard-without-check'},...(task.mode==='evidence'&&task.skill==='evaluate'?[{...answer,actions:[]}]:[])];
 }
}
