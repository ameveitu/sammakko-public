/** Idealized energy accounts. The system boundary explicitly includes surroundings.
 * https://openstax.org/books/university-physics-volume-1/pages/8-3-conservation-of-energy
 * https://openstax.org/books/college-physics-2e/pages/7-6-conservation-of-energy
 * https://www.iea.org/reports/integrating-solar-and-wind/executive-summary
 * https://www.eia.gov/energyexplained/biomass/
 * https://www.eia.gov/energyexplained/what-is-energy/
 */
export interface EnergyOption {id:string;name:string;available:number;needUnit:'kWh';habitatImpact:number;variability:'low'|'high';note:string}
export type EnergyIslandsInput=
 | {kind:'kinetic';mass:number;speed:number;targetMass:number;targetSpeed:number;factor:'mass'|'speed';context:'cart'|'boat'}
 | {kind:'potential';mass:number;height:number;reference:number;g:number;targetMass:number;targetHeight:number;targetReference:number;factor:'mass'|'height'|'reference'}
 | {kind:'ledger';context:'boat'|'lamp'|'heater';initial:number;useful:number}
 | {kind:'bounce';mass:number;height:number;g:number;restitution:number}
 | {kind:'form';context:'moving-water'|'warm-stone'|'raised-load'|'moving-boat';amount:number}
 | {kind:'chain';context:'water-lamp'|'battery-toy'|'charger';steps:readonly string[];initial:number;useful:number}
 | {kind:'transfer';context:'water-wheel'|'lamp'|'charger';stage:'transfer'|'conversion'|'both';from:string;to:string;amount:number}
 | {kind:'source';source:'wind'|'sun'|'water'|'coal'|'biomass';converter:'generator'|'solar-cell';carrier:'electricity'|'motion';endUse:'lamp'|'motor';amount:number}
 | {kind:'renew';resource:'wind'|'solar'|'coal'|'biomass';horizon:number;renewed:number;used:number;variable:boolean}
 | {kind:'impact';season:'summer'|'winter';scenario:'normal'|'storm';need:number;maxImpact:number;options:readonly EnergyOption[]};
export interface EnergyField {id:string;label:string;unit:string}
export interface EnergyIslandsTask {kind:'energy-islands';input:EnergyIslandsInput;question:string;fields:readonly EnergyField[];choices?:readonly {id:string;label:string}[];hint:string;review?:{criteria:readonly {id:string;label:string}[]}}
export interface EnergyIslandsResponse {kind:'energy-islands';values:Readonly<Record<string,number>>;choice?:string;order?:readonly string[];participants?:Readonly<Record<string,string>>;controls?:Readonly<Record<string,number>>;locked:boolean;actionApplied:boolean;observed:boolean;confirmedByAdult?:boolean;assistance?:'none'|'helped';observations?:Readonly<Record<string,'met'|'not-yet'>>}
export interface EnergyIslandsVerdict {ok:boolean;why?:string;pendingReview?:true;observedByAdult?:true;assisted?:true}
const valid=(...v:number[])=>v.every(Number.isFinite),round=(n:number)=>Math.round((n+Number.EPSILON)*100)/100,own=(o:object,k:string)=>Object.prototype.hasOwnProperty.call(o,k);
export function kineticJ(mass:number,speed:number):number {if(!valid(mass,speed)||mass<=0)throw new RangeError('Invalid mass or speed');return .5*mass*speed**2;}
export function potentialJ(mass:number,g:number,height:number,reference:number):number {if(!valid(mass,g,height,reference)||mass<=0||g<=0)throw new RangeError('Invalid gravity model');return mass*g*(height-reference);}
export function collisionLedger(mass:number,speed:number,restitution:number){if(!valid(restitution)||restitution<0||restitution>1)throw new RangeError('Invalid restitution');const initial=kineticJ(mass,speed),remaining=initial*restitution**2;return {initial,remaining,thermal:initial-remaining,total:initial};}
/** Drop to first rebound apex, fixed field and one impact; lost mechanical energy enters thermal store. */
export function bounceAt(mass:number,height:number,g:number,restitution:number,time:number){if(!valid(mass,height,g,restitution,time)||mass<=0||height<0||g<=0||restitution<0||restitution>1||time<0)throw new RangeError('Invalid bounce');const impact=Math.sqrt(2*height/g),incoming=g*impact,upward=restitution*incoming,apex=impact+upward/g,t=Math.min(time,apex);let y:number,v:number,thermal:number;if(t<impact){y=height-.5*g*t*t;v=-g*t;thermal=0;}else{const dt=t-impact;y=Math.max(0,upward*dt-.5*g*dt*dt);v=Math.max(0,upward-g*dt);thermal=.5*mass*incoming**2*(1-restitution**2);}return {height:y,speed:Math.abs(v),velocityY:v,kinetic:kineticJ(mass,v),potential:mass*g*y,thermal,total:mass*g*height,duration:apex};}
export function expectedEnergyValues(input:EnergyIslandsInput):Readonly<Record<string,number>> {switch(input.kind){
 case 'kinetic':return {before:round(kineticJ(input.mass,input.speed)),after:round(kineticJ(input.targetMass,input.targetSpeed))};
 case 'potential':return {before:round(potentialJ(input.mass,input.g,input.height,input.reference)),after:round(potentialJ(input.targetMass,input.g,input.targetHeight,input.targetReference))};
 case 'renew':return {renewable:input.resource==='coal'?0:1,balance:input.renewed>=input.used?1:0,variable:input.variable?1:0};
 case 'bounce':{const initial=potentialJ(input.mass,input.g,input.height,0),remaining=initial*input.restitution**2;if(input.restitution<0||input.restitution>1)throw new RangeError('Invalid restitution');return {remaining:round(remaining),thermal:round(initial-remaining),total:round(initial)};}
 case 'chain':case 'ledger':if(input.initial<0||input.useful<0||input.useful>input.initial)throw new RangeError('Invalid ledger');return {thermal:round(input.initial-input.useful),total:round(input.initial)};
 default:return {};
}}
export function expectedEnergyChoice(input:EnergyIslandsInput):string|undefined {switch(input.kind){case 'form':return input.context==='warm-stone'?'thermal':input.context==='raised-load'?'potential':'kinetic';case 'transfer':return input.stage;case 'source':return input.source;default:return undefined;}}
export function eligibleOptions(input:Extract<EnergyIslandsInput,{kind:'impact'}>):readonly string[]{return input.options.filter(o=>o.available>=input.need&&o.habitatImpact<=input.maxImpact).map(o=>o.id);}
export function expectedEnergyControls(input:EnergyIslandsInput):Readonly<Record<string,number>>{if(input.kind==='kinetic')return {mass:input.targetMass,speed:input.targetSpeed};if(input.kind==='potential')return {mass:input.targetMass,height:input.targetHeight,reference:input.targetReference};return {};}
export interface EnergyIslandsScene {kind:'energy-islands';title:string;mode:EnergyIslandsInput['kind'];given:Record<string,unknown>;controls:Readonly<Record<string,number>>;selection?:string;actionApplied:boolean;observed:boolean;outcome?:Record<string,unknown>}
export function energyIslandsScene(task:EnergyIslandsTask,r?:EnergyIslandsResponse):EnergyIslandsScene {const input=task.input,actionApplied=r?.locked===true&&r.actionApplied===true,observed=actionApplied&&r?.observed===true;const given={...input} as Record<string,unknown>;if(input.kind==='chain')delete given.steps;if(input.kind==='transfer')delete given.stage;const outcome=observed?{values:expectedEnergyValues(input),...(input.kind==='ledger'?{initial:input.initial,useful:input.useful,thermal:input.initial-input.useful}:{}),...(input.kind==='bounce'?{duration:bounceAt(input.mass,input.height,input.g,input.restitution,1e6).duration}:{}),...(input.kind==='impact'?{eligible:eligibleOptions(input)}:{})}:undefined;return {kind:'energy-islands',title:'Tuulien voimaluodot',mode:input.kind,given,controls:actionApplied?(r?.controls??{}):{},...(r?.locked&&r.choice?{selection:r.choice}:{}),actionApplied,observed,...(outcome?{outcome}:{})};}
export function checkEnergyIslands(task:EnergyIslandsTask,r:EnergyIslandsResponse):EnergyIslandsVerdict {
 if(!r||r.kind!=='energy-islands'||r.locked!==true||r.actionApplied!==true||r.observed!==true)return {ok:false,why:'Lukitse ennuste ja tee annettu muutos ennen havaintoa.'};let provenance:Pick<EnergyIslandsVerdict,'observedByAdult'|'assisted'>={};
 if(task.review){if(r.confirmedByAdult!==true||!['none','helped'].includes(r.assistance??'')||!r.observations||Object.keys(r.observations).length!==task.review.criteria.length||!task.review.criteria.every(c=>own(r.observations!,c.id)&&['met','not-yet'].includes(r.observations![c.id]??'')))return {ok:false,pendingReview:true,why:'Oma perustelu odottaa aikuisen havaintoa.'};provenance={observedByAdult:true,...(r.assistance==='helped'?{assisted:true}:{})};}
 const fail=(why:string):EnergyIslandsVerdict=>({ok:false,why,...provenance}),expected=expectedEnergyValues(task.input),controls=expectedEnergyControls(task.input);
 if(!r.values||typeof r.values!=='object'||Object.keys(expected).some(k=>!own(r.values,k)||typeof r.values[k]!=='number'||!Number.isFinite(r.values[k])||Math.abs(r.values[k]!-expected[k]!)>1e-9))return fail(task.hint);
 if(Object.keys(controls).some(k=>!r.controls||!own(r.controls,k)||typeof r.controls[k]!=='number'||!Number.isFinite(r.controls[k])||r.controls[k]!==controls[k]))return fail('Aseta pyydetty mallin parametri ennen havaintoa.');
 const expectedChoice=expectedEnergyChoice(task.input);if(expectedChoice!==undefined&&r.choice!==expectedChoice)return fail(task.hint);
 if(task.input.kind==='transfer'&&(!r.participants||!own(r.participants,'from')||!own(r.participants,'to')||r.participants.from!==task.input.from||r.participants.to!==task.input.to))return fail('Osoita annettujen osapuolten roolit.');
 if(task.input.kind==='impact'&&(!r.choice||!eligibleOptions(task.input).includes(r.choice)))return fail('Valitse annettujen tarve- ja pesimärauhaehtojen mukainen vaihtoehto.');
 if(task.input.kind==='chain'||task.input.kind==='source'){const steps=task.input.kind==='chain'?task.input.steps:[task.input.source,task.input.converter,task.input.carrier,task.input.endUse];if(!Array.isArray(r.order)||r.order.length!==steps.length||!Array.from(r.order).every((v,i)=>typeof v==='string'&&v===steps[i]))return fail('Järjestä kaikki annetun energiaketjun vaiheet.');}
 if(task.review&&task.review.criteria.some(c=>r.observations![c.id]!=='met'))return fail('Harjoitellaan vielä annettuun näyttöön perustuvaa selitystä.');return {ok:true,...provenance};
}
export function solutionEnergyIslands(task:EnergyIslandsTask):EnergyIslandsResponse {const m=task.input;return {kind:'energy-islands',values:expectedEnergyValues(m),locked:true,actionApplied:true,observed:true,...(expectedEnergyChoice(m)?{choice:expectedEnergyChoice(m)}:{}),...(m.kind==='transfer'?{participants:{from:m.from,to:m.to}}:{}),...(m.kind==='impact'?{choice:eligibleOptions(m)[0]}:{}),...(m.kind==='chain'?{order:[...m.steps]}:m.kind==='source'?{order:[m.source,m.converter,m.carrier,m.endUse]}:{}),...(Object.keys(expectedEnergyControls(m)).length?{controls:expectedEnergyControls(m)}:{})};}
export function wrongEnergyIslandsResponses(task:EnergyIslandsTask):EnergyIslandsResponse[]{const r=solutionEnergyIslands(task),k=Object.keys(r.values)[0];return [{...r,locked:false},{...r,...(k?{values:{...r.values,[k]:NaN}}:(task.input.kind==='chain'||task.input.kind==='source')?{order:[]}:{choice:'wrong'})}];}
