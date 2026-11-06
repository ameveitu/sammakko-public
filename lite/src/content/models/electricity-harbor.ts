/** Reference models: charge conservation https://openstax.org/books/college-physics-2e/pages/18-1-static-electricity-and-charge-conservation-of-charge
 * Current and energy relations https://openstax.org/books/university-physics-volume-2/pages/9-key-equations
 * Measurement connections https://openstax.org/books/university-physics-volume-2/pages/10-4-electrical-measuring-instruments */
import {solveDC, voltageAcross, type DCCircuit, type DCEdge} from './dc-circuit';
/** The circuit is a virtual ideal model, not proof of physical laboratory competence. */
export type HarborInput=
 | {kind:'build';volts:number;ohms:number;device:'lantern'|'signal';layout:'linear'|'swapped';switchClosed:boolean;assessRoles:boolean;prewired:readonly (readonly [string,string])[]}
 | {kind:'meter';meter:'current'|'voltage';circuit:DCCircuit;targetBranch:string;points:readonly [string,string];options:readonly {id:string;label:string;connection:{kind:'series';branch:string}|{kind:'parallel';a:string;b:string}}[]}
 | {kind:'charge';a:'+'|'-';b:'+'|'-';shape:'ball'|'flag'|'disc';alternateShape?:'ball'|'flag'|'disc';distance:number}
 | {kind:'charging';initialA:number;initialB:number;electrons:number;direction:'a-to-b'|'b-to-a'}
 | {kind:'magnet';a:'N'|'S';b:'N'|'S';material:'iron'|'copper'|'aluminium';observedAttraction:boolean;distance:number;sample2?:{material:'iron'|'copper'|'aluminium';attracted:boolean}}
 | {kind:'current';chargeC:number;seconds:number;comparisonSeconds?:number;context:'lamp'|'motor'}
 | {kind:'voltage';energyJ:number;chargeC:number;points:readonly [string,string];component:'lamp'|'motor'}
 | {kind:'electromagnet';powered:boolean;direction:'forward'|'reverse';turns:number;reverseTest?:boolean}
 | {kind:'generation';moving:boolean;source:'water'|'wind'|'hand';speed:number}
 | {kind:'device';component:'switch'|'source'|'lamp';change:'open'|'remove'|'restore';device:'lantern'|'beacon';volts:number}
 | {kind:'components';component:'source'|'switch'|'lamp'|'wire';question:'role'|'change';layout:'linear'|'reordered'};
export interface ElectricityHarborTask {kind:'electricity-harbor';input:HarborInput;question:string;choices:readonly {id:string;label:string}[];hint:string;review?:{criteria:readonly {id:string;label:string}[]}}
export interface ElectricityHarborResponse {kind:'electricity-harbor';prediction:readonly string[];locked:boolean;observed:boolean;wires?:readonly (readonly [string,string])[];meterOption?:string;reading?:number;testedOpen?:boolean;appearanceChanged?:boolean;deviceChanged?:boolean;chargeA?:number;chargeB?:number;chargeTotal?:number;roles?:Readonly<Record<string,string>>;control?:'on'|'off';reversed?:boolean;points?:readonly string[];confirmedByAdult?:boolean;assistance?:'none'|'helped';observations?:Readonly<Record<string,'met'|'not-yet'>>;moves?:readonly ('a-to-b'|'b-to-a')[]}
export interface HarborVerdict {ok:boolean;why?:string;pendingReview?:true;observedByAdult?:true;assisted?:true}
export function buildCircuit(input:Extract<HarborInput,{kind:'build'}>,wires:readonly (readonly [string,string])[]):DCCircuit {
 const terminals=new Set(['p','n','la','lb','sa','sb']);if(!Array.isArray(wires)||!Array.from(wires).every(pair=>Array.isArray(pair)&&pair.length===2&&typeof pair[0]==='string'&&typeof pair[1]==='string'))throw new RangeError('Invalid wire');wires=[...input.prewired,...wires];if(wires.some(([a,b])=>!terminals.has(a)||!terminals.has(b)||a===b))throw new RangeError('Invalid terminal');
 const edges:DCEdge[]=[{id:'lamp',a:'la',b:'lb',kind:'resistor',ohms:input.ohms,role:'lamp'},...(input.switchClosed?[{id:'switch',a:'sa',b:'sb',kind:'wire' as const}]:[]),...wires.map(([a,b],i)=>({id:`wire-${i}`,a,b,kind:'wire' as const}))];return {positive:'p',negative:'n',volts:input.volts,edges};
}
export function prediction(input:HarborInput):readonly string[] {
 switch(input.kind){
  case 'build':return ['lamp-on'];
  case 'meter':return ['measure'];
  case 'charge':return [input.a===input.b?'repel':'attract'];
  case 'charging':{const d=input.direction==='a-to-b'?input.electrons:-input.electrons,a=input.initialA+d,b=input.initialB-d;return [a<b?'a-negative':b<a?'b-negative':'equal-charge'];}
  case 'magnet':return [input.a===input.b?'repel':'attract',input.observedAttraction?'material-attracts':'material-not-attracted',...(input.sample2?[input.sample2.attracted?'second-attracts':'second-not-attracted']:[])];
  case 'current':return [input.comparisonSeconds===undefined?String(input.chargeC/input.seconds):input.seconds<input.comparisonSeconds?'first':input.seconds>input.comparisonSeconds?'second':'equal'];
  case 'voltage':return [String(input.energyJ/input.chargeC)];
  case 'electromagnet':return input.powered?['field-on',input.direction==='forward'?'north-right':'north-left',...(input.reverseTest?[input.direction==='forward'?'reversed-north-left':'reversed-north-right']:[])]:['field-off'];
  case 'generation':return [input.moving?'input-generates':'no-input'];
  case 'device':return [input.change==='restore'?'lamp-on':'lamp-off'];
  case 'components':return [input.component];
 }
}
/** Meter wiring is intentionally a named branch cut or node pair, not an arbitrary ideal-ammeter graph solver. */
export function meterReading(input:Extract<HarborInput,{kind:'meter'}>,optionId:string):number|null {
 const selected=input.options.find(o=>o.id===optionId);if(!selected)return null;const r=solveDC(input.circuit);if(r.status!=='ok')return null;
 if(input.meter==='current'){if(selected.connection.kind!=='series'||selected.connection.branch!==input.targetBranch)return null;const value=r.currents[input.targetBranch];return typeof value==='number'&&Number.isFinite(value)?Math.abs(value):null;}
 if(selected.connection.kind!=='parallel')return null;const sameNode=(a:string,b:string)=>{const seen=new Set([a]),stack=[a];while(stack.length){const x=stack.pop()!;for(const e of input.circuit.edges)if(e.kind==='wire'){const y=e.a===x?e.b:e.b===x?e.a:null;if(y&&!seen.has(y)){seen.add(y);stack.push(y);}}}return seen.has(b);};const actual=[selected.connection.a,selected.connection.b];if(!(sameNode(actual[0]!,input.points[0])&&sameNode(actual[1]!,input.points[1]))&&!(sameNode(actual[0]!,input.points[1])&&sameNode(actual[1]!,input.points[0])))return null;const v=voltageAcross(r,...input.points);return v===null?null:Math.abs(v);
}
/** Shows what the selected ideal meter measures even when it is the wrong target. */
export function observeMeter(input:Extract<HarborInput,{kind:'meter'}>,optionId:string):{value:number|null;onTarget:boolean}{
 const selected=input.options.find(o=>o.id===optionId),r=solveDC(input.circuit);if(!selected||r.status!=='ok')return {value:null,onTarget:false};let value:number|null=null;
 if(selected.connection.kind==='series'){const current=r.currents[selected.connection.branch];if(typeof current==='number'&&Number.isFinite(current))value=Math.abs(current);}else {const v=voltageAcross(r,selected.connection.a,selected.connection.b);if(v!==null)value=Math.abs(v);}
 return {value,onTarget:input.meter===(selected.connection.kind==='series'?'current':'voltage')&&meterReading(input,optionId)!==null};
}
export function roundMeter(value:number):number {return Math.round((value+Number.EPSILON)*100)/100;}
export function harborOutcome(task:ElectricityHarborTask,r:ElectricityHarborResponse):Record<string,unknown> {
 const m=task.input;if(m.kind==='build'){const dc=solveDC(buildCircuit(m,r.wires??[]));return {status:dc.status,lit:dc.lit,currents:dc.currents};}if(m.kind==='meter'){const observed=observeMeter(m,r.meterOption??''),selected=m.options.find(o=>o.id===r.meterOption),circuit=solveDC(m.circuit);return {reading:observed.value===null?null:roundMeter(observed.value),unit:selected?.connection.kind==='series'?'A':'V',onTarget:observed.onTarget,lit:circuit.lit};}if(m.kind==='charging'){const delta=(r.moves??[]).reduce((sum,direction)=>sum+(direction==='a-to-b'?1:-1),0);return {a:m.initialA+delta,b:m.initialB-delta,total:m.initialA+m.initialB};}if(m.kind==='electromagnet')return {observation:prediction({...m,powered:r.control==='on',reverseTest:!!m.reverseTest&&!!r.reversed})};if(m.kind==='generation')return {observation:prediction({...m,moving:r.control==='on'})};return {observation:prediction(m)};
}
const setEqual=(a:readonly string[],b:readonly string[])=>a.length===b.length&&new Set(a).size===a.length&&Array.from(a).every(x=>typeof x==='string'&&b.includes(x));
export function checkElectricityHarbor(task:ElectricityHarborTask,r:ElectricityHarborResponse):HarborVerdict {
 if(!r||r.kind!=='electricity-harbor'||r.locked!==true||r.observed!==true)return {ok:false,why:'Lukitse ennuste ennen virtuaalista havaintoa.'};if(!Array.isArray(r.prediction)||!setEqual(r.prediction,prediction(task.input)))return {ok:false,why:task.hint};
 if(task.input.kind==='charging'){const m=task.input,d=m.direction==='a-to-b'?m.electrons:-m.electrons;if(![r.chargeA,r.chargeB,r.chargeTotal].every(x=>typeof x==='number'&&Number.isFinite(x))||r.chargeA!==m.initialA+d||r.chargeB!==m.initialB-d||r.chargeTotal!==m.initialA+m.initialB)return {ok:false,why:'Laske molempien kappaleiden etumerkilliset loppuvaraukset ja kokonaisvaraus.'};}
 if(task.input.kind==='charging'&&((r.moves?.length??0)!==task.input.electrons||!Array.isArray(r.moves)||!Array.from(r.moves).every(x=>x===(task.input as Extract<HarborInput,{kind:'charging'}>).direction)))return {ok:false,why:'Siirrä ilmoitettu määrä elektroneja pyydettyyn suuntaan.'};
 if(task.input.kind==='charge'&&task.input.alternateShape&&r.appearanceChanged!==true)return {ok:false,why:'Vaihda kappaleiden ulkonäkö ja vertaa samaa varausmerkkiä.'};
 if(task.input.kind==='voltage'&&(!Array.isArray(r.points)||!setEqual(r.points,task.input.points)))return {ok:false,why:'Valitse pyydetyt kaksi pistettä.'};
 if((task.input.kind==='electromagnet'||task.input.kind==='generation')&&r.control!==((task.input.kind==='electromagnet'?task.input.powered:task.input.moving)?'on':'off'))return {ok:false,why:'Aseta virtuaaliohjain annettuun tilaan.'};
 if(task.input.kind==='electromagnet'&&task.input.reverseTest&&r.reversed!==true)return {ok:false,why:'Käännä mallin virran suunta ja vertaile napoja.'};
 if(task.input.kind==='device'&&r.deviceChanged!==true)return {ok:false,why:'Tee tutkittavan osan muutos virtuaalimallissa.'};
 if(task.input.kind==='device'&&(!r.roles||!Object.prototype.hasOwnProperty.call(r.roles,'component')||r.roles.component!==task.input.component))return {ok:false,why:'Valitse ensin tutkittavan osan tehtävä.'};
 if(task.input.kind==='build'){try{if(r.testedOpen!==true)return {ok:false,why:'Kokeile samaa kytkentää ensin avoimella kytkimellä.'};if(task.input.assessRoles&&(!r.roles||!['source','lamp','switch'].every(key=>Object.prototype.hasOwnProperty.call(r.roles,key)&&r.roles![key]===key)))return {ok:false,why:'Yhdistä osat niiden tehtäviin.'};const s=solveDC(buildCircuit(task.input,r.wires??[])),open=solveDC(buildCircuit({...task.input,switchClosed:false},r.wires??[]));if(s.status!=='ok'||!s.lit.includes('lamp')||open.status!=='ok'||open.lit.includes('lamp'))return {ok:false,why:'Yhdistä lähteen molemmat navat lampun kautta suljetuksi reitiksi ilman oikosulkua.'};}catch{return {ok:false,why:'Tarkista liitännät.'};}}
 if(task.input.kind==='meter'){const expected=meterReading(task.input,r.meterOption??'');if(expected===null||!Number.isFinite(expected))return {ok:false,why:'Sijoita mittari pyydetyn haaran sarjaan tai pyydettyjen pisteiden rinnalle.'};if(typeof r.reading!=='number'||!Number.isFinite(r.reading)||Math.abs(r.reading-roundMeter(expected))>1e-9)return {ok:false,why:'Lue virtuaalimittarin arvo ja yksikkö.'};}
 if(task.review){if(r.confirmedByAdult!==true||!['none','helped'].includes(r.assistance??'')||!r.observations||Object.keys(r.observations).length!==task.review.criteria.length||!task.review.criteria.every(c=>Object.prototype.hasOwnProperty.call(r.observations,c.id)&&['met','not-yet'].includes(r.observations![c.id]??'')))return {ok:false,pendingReview:true,why:'Oma selitys odottaa aikuisen havaintoa.'};if(task.review.criteria.some(c=>r.observations![c.id]!=='met'))return {ok:false,observedByAdult:true,why:'Harjoitellaan perustelua vielä.',...(r.assistance==='helped'?{assisted:true}:{})};return {ok:true,observedByAdult:true,...(r.assistance==='helped'?{assisted:true}:{})};}
 return {ok:true};
}
export function solutionElectricityHarbor(task:ElectricityHarborTask):ElectricityHarborResponse {const m=task.input;const option=m.kind==='meter'?m.options.find(o=>meterReading(m,o.id)!==null):undefined;return {kind:'electricity-harbor',prediction:[...prediction(m)],locked:true,observed:true,...(m.kind==='charge'&&m.alternateShape?{appearanceChanged:true}:{}),...(m.kind==='voltage'?{points:[...m.points]}:{}),...(m.kind==='electromagnet'?{control:m.powered?'on' as const:'off' as const,...(m.reverseTest?{reversed:true}:{})}:{}),...(m.kind==='generation'?{control:m.moving?'on' as const:'off' as const}:{}),...(m.kind==='device'?{roles:{component:m.component},deviceChanged:true}:{}),...(m.kind==='charging'?{moves:Array.from({length:m.electrons},()=>m.direction),chargeA:m.initialA+(m.direction==='a-to-b'?m.electrons:-m.electrons),chargeB:m.initialB-(m.direction==='a-to-b'?m.electrons:-m.electrons),chargeTotal:m.initialA+m.initialB}:{}),...(m.kind==='build'?{testedOpen:true,wires:([['p','la'],['lb','sa'],['sb','n']] as const).filter(([a,b])=>!m.prewired.some(([x,y])=>(a===x&&b===y)||(a===y&&b===x))),roles:{source:'source',lamp:'lamp',switch:'switch'}}:{}),...(m.kind==='meter'&&option?{meterOption:option.id,reading:roundMeter(meterReading(m,option.id)!)}:{})};}
export function wrongElectricityHarborResponses(task:ElectricityHarborTask):ElectricityHarborResponse[]{const r=solutionElectricityHarbor(task);return [{...r,locked:false},{...r,prediction:['incorrect']}];}
