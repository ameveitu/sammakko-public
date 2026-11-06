import {solveDC,voltageAcross,type DCCircuit} from './dc-circuit';
/** One ideal DC source, ideal wires and positive linear resistors only.
 * https://openstax.org/books/university-physics-volume-2/pages/10-2-resistors-in-series-and-parallel
 * https://openstax.org/books/university-physics-volume-2/pages/9-5-electrical-energy-and-power
 */
export type CircuitGoal='parallel-current'|'parallel-voltage'|'series-current'|'series-voltage'|'series-integrated';
export type CircuitWorkshopInput=
 | {kind:'network';goal:CircuitGoal;topology:'series'|'parallel';volts:number;resistances:readonly number[];change:'none'|'remove';removeIndex:number;order:'normal'|'reversed'}
 | {kind:'data';goal:'ui-relation'|'resistance';rows:readonly {u:number;i:number}[];comparison:readonly {u:number;i:number}[];targetRow:number;task:'plot'|'ratio'|'compare'|'nonlinear'}
 | {kind:'ohm';unknown:'u'|'i'|'r';u:number;i:number;r:number;range:readonly [number,number];measured:{u:number;i:number};verifyCurrent:number;verificationMeasuredVoltage:number}
 | {kind:'power';mode:'ui'|'energy';volts:number;amps:number;durationS:number;energyJ:number;device:'heater'|'lamp';comparison?:{volts:number;amps:number;device:'heater'|'lamp'}}
 | {kind:'energy';watts:number;hours:number;device:'beacon'|'lamp';unit:'Wh'|'kWh';comparison?:{watts:number;hours:number;device:'beacon'|'lamp'}};
export interface WorkshopField {id:string;label:string;unit:string}
export interface CircuitWorkshopTask {kind:'circuit-workshop';input:CircuitWorkshopInput;question:string;fields:readonly WorkshopField[];hint:string;review?:{criteria:readonly {id:string;label:string}[]}}
export interface CircuitWorkshopResponse {kind:'circuit-workshop';values:Readonly<Record<string,number>>;locked:boolean;observed:boolean;changeApplied:boolean;points?:readonly (readonly [number,number])[];nodePair?:readonly string[];confirmedByAdult?:boolean;assistance?:'none'|'helped';checkedComparison?:'matches'|'differs';observations?:Readonly<Record<string,'met'|'not-yet'>>}
export interface CircuitWorkshopScene {kind:'circuit-workshop';title:string;mode:CircuitWorkshopInput['kind'];given:Record<string,unknown>;changed:boolean;observed:boolean;circuit?:DCCircuit;outcome?:Record<string,unknown>}
/** Only explicitly given initial measurements and the learner's applied topology enter pre-observation state. */
export function circuitWorkshopScene(task:CircuitWorkshopTask,r?:CircuitWorkshopResponse):CircuitWorkshopScene {
 const input=task.input,changed=r?.locked===true&&r.changeApplied===true,observed=changed&&r?.observed===true;let given:Record<string,unknown>,circuit:DCCircuit|undefined;
 if(input.kind==='network'){const initial=networkObservation(input,false);given={goal:input.goal,topology:input.topology,volts:input.volts,resistances:input.resistances,change:input.change,removeIndex:input.removeIndex,order:input.order,initialCurrent:initial.sourceCurrent,...(input.topology==='parallel'?{initialBranches:initial.branches}:{initialFirstVoltage:initial.voltages[0],...(input.resistances.length===3?{initialSecondVoltage:initial.voltages[1]}:{})})};circuit=networkCircuit(input,changed);}
 else if(input.kind==='ohm'){given={kind:input.kind,unknown:input.unknown,range:input.range,measured:input.measured,verifyCurrent:input.verifyCurrent,...(input.unknown!=='u'?{u:input.u}:{}),...(input.unknown!=='i'?{i:input.i}:{}),...(input.unknown!=='r'?{r:input.r}:{})};}
 else if(input.kind==='power')given=input.mode==='energy'?{kind:input.kind,mode:input.mode,device:input.device,durationS:input.durationS,energyJ:input.energyJ}:{kind:input.kind,mode:input.mode,device:input.device,volts:input.volts,amps:input.amps,...(input.comparison?{comparison:input.comparison}:{})};else given={...input};
 const outcome=observed?(input.kind==='network'?networkObservation(input,true):input.kind==='ohm'?{values:expectedValues(input),verificationMeasuredVoltage:input.verificationMeasuredVoltage}:input.kind==='power'?{values:expectedValues(input),energyJ:(input.mode==='ui'?input.volts*input.amps:input.energyJ/input.durationS)*input.durationS,durationS:input.durationS}:{values:expectedValues(input)}):undefined;
 return {kind:'circuit-workshop',title:'Valomerkkien virtapiiripaja',mode:input.kind,given,changed,observed,...(circuit?{circuit}:{}),...(outcome?{outcome}:{})};
}
export interface WorkshopVerdict {ok:boolean;why?:string;pendingReview?:true;observedByAdult?:true;assisted?:true}
export function networkCircuit(input:Extract<CircuitWorkshopInput,{kind:'network'}>,changed:boolean):DCCircuit {
 if(input.resistances.length<2||input.resistances.length>3||input.removeIndex<0||input.removeIndex>=input.resistances.length)throw new RangeError('Invalid prepared network');
 const resistances=changed&&input.order==='reversed'?[...input.resistances].reverse():[...input.resistances],removed=changed&&input.change==='remove'?input.removeIndex:-1;
 const edges=resistances.flatMap((ohms,index)=>{if(index===removed)return [];const a=input.topology==='parallel'?'p':index===0?'p':`n${index}`,b=input.topology==='parallel'?'n':index===resistances.length-1?'n':`n${index+1}`;return [{id:`r${index}`,kind:'resistor' as const,a,b,ohms,role:'lamp' as const}];});
 return {positive:'p',negative:'n',volts:input.volts,edges};
}
const round=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
export function networkObservation(input:Extract<CircuitWorkshopInput,{kind:'network'}>,changed:boolean){
 const circuit=networkCircuit(input,changed),result=solveDC(circuit);if(result.status!=='ok')throw new RangeError('Invalid prepared circuit');const branches=input.resistances.map((_,i)=>round(Math.abs(result.currents[`r${i}`]??0))),voltages=input.resistances.map((_,i)=>{const edge=circuit.edges.find(e=>e.id===`r${i}`);if(!edge)return null;const v=voltageAcross(result,edge.a,edge.b);return v===null?null:round(Math.abs(v));});return {circuit,branches,voltages,sourceCurrent:round(result.sourceCurrent??0),lit:result.lit};
}
/** Exact workbench answers are rounded to the displayed 0.01 unit resolution. */
export function expectedValues(input:CircuitWorkshopInput):Readonly<Record<string,number>> {
 switch(input.kind){
  case 'network':{const o=networkObservation(input,true);switch(input.goal){case 'parallel-current':return {total:o.sourceCurrent,branch:o.branches[0]!};case 'parallel-voltage':return {uA:o.voltages[0]??0,uB:o.voltages[1]??0};case 'series-current':return {before:o.sourceCurrent,between:o.sourceCurrent,after:o.sourceCurrent};case 'series-voltage':return {uA:o.voltages[0]??0,uB:o.voltages[1]??0,...(o.voltages.length===3?{uC:o.voltages[2]??0}:{}),total:input.volts};case 'series-integrated':return {current:o.sourceCurrent,uA:o.voltages[0]??0,uB:o.voltages[1]??0};}}
  case 'data':if(input.task==='plot')return input.comparison.length?{comparison:input.rows[0]!.i>input.comparison[0]!.i?1:input.rows[0]!.i<input.comparison[0]!.i?2:0}:{};else if(input.task==='nonlinear'){if(input.rows.length!==3||input.rows.some(row=>row.i<=0))throw new RangeError('Invalid nonlinear data');return {ratio1:round(input.rows[0]!.u/input.rows[0]!.i),ratio2:round(input.rows[1]!.u/input.rows[1]!.i),ratio3:round(input.rows[2]!.u/input.rows[2]!.i),constant:0};}else {const row=input.rows[input.targetRow];if(!row||!Number.isFinite(row.u)||!Number.isFinite(row.i)||row.i<=0)throw new RangeError('Invalid measurement denominator');const resistance=round(row.u/row.i);if(input.task==='ratio')return {resistance};const otherRow=input.comparison[0];if(!otherRow||!Number.isFinite(otherRow.u)||!Number.isFinite(otherRow.i)||otherRow.i<=0)throw new RangeError('Invalid comparison denominator');const other=round(otherRow.u/otherRow.i);return {resistance,greaterResistance:resistance>other?1:resistance<other?2:0};}
  case 'ohm':if(!Number.isFinite(input.measured.u)||!Number.isFinite(input.measured.i)||input.measured.i<=0||!Number.isFinite(input.verifyCurrent)||(input.unknown!=='r'&&(!Number.isFinite(input.r)||input.r<=0))||(input.unknown==='r'&&(!Number.isFinite(input.i)||input.i<=0)))throw new RangeError('Non-positive denominator');const answer=input.unknown==='u'?input.i*input.r:input.unknown==='i'?input.u/input.r:input.u/input.i;return {answer:round(answer),checkVoltage:round(input.measured.u/input.measured.i*input.verifyCurrent)};
  case 'power':{if(input.durationS<=0)throw new RangeError('Non-positive duration');const power=round(input.mode==='ui'?input.volts*input.amps:input.energyJ/input.durationS);if(!input.comparison)return {power};const otherPower=round(input.comparison.volts*input.comparison.amps);return {power,otherPower,more:power>otherPower?1:power<otherPower?2:0};}
  case 'energy':{const energyWh=round(input.watts*input.hours),energyKWh=round(energyWh/1000);if(!input.comparison)return {energyWh,energyKWh};const otherWh=round(input.comparison.watts*input.comparison.hours);return {energyWh,energyKWh,otherWh,otherKWh:round(otherWh/1000),more:energyWh>otherWh?1:energyWh<otherWh?2:0};}
 }
}
const own=(obj:object,key:string)=>Object.prototype.hasOwnProperty.call(obj,key);
export function checkCircuitWorkshop(task:CircuitWorkshopTask,r:CircuitWorkshopResponse):WorkshopVerdict {
 if(!r||r.kind!=='circuit-workshop'||r.locked!==true||r.observed!==true||r.changeApplied!==true)return {ok:false,why:'Lukitse ennuste ja tee annettu virtuaalinen muutos ennen havaintoa.'};
 let provenance:Pick<WorkshopVerdict,'observedByAdult'|'assisted'>={};
 if(task.review){if(r.confirmedByAdult!==true||!['none','helped'].includes(r.assistance??'')||!r.observations||Object.keys(r.observations).length!==task.review.criteria.length||!task.review.criteria.every(c=>own(r.observations!,c.id)&&['met','not-yet'].includes(r.observations![c.id]??'')))return {ok:false,pendingReview:true,why:'Oma selitys odottaa aikuisen havaintoa.'};provenance={observedByAdult:true,...(r.assistance==='helped'?{assisted:true}:{})};}
 const fail=(why:string):WorkshopVerdict=>({ok:false,why,...provenance});const expected=expectedValues(task.input);
 if(!r.values||typeof r.values!=='object'||Object.keys(expected).some(k=>!own(r.values,k)||typeof r.values[k]!=='number'||!Number.isFinite(r.values[k])||Math.abs(r.values[k]!-expected[k]!)>1e-9))return fail(task.hint);
 if(task.input.kind==='network'&&task.input.goal==='parallel-voltage'){if(!Array.isArray(r.nodePair)||r.nodePair.length!==2||new Set(r.nodePair).size!==2||!Array.from(r.nodePair).every(x=>typeof x==='string'&&['p','n'].includes(x)))return fail('Merkitse molempien haarojen yhteiset kaksi solmua.');}
 if(task.input.kind==='data'&&task.input.task==='plot'){const rows=task.input.rows;if(!Array.isArray(r.points)||r.points.length!==rows.length||!Array.from(r.points).every(p=>Array.isArray(p)&&p.length===2&&Array.from(p).every(v=>typeof v==='number'&&Number.isFinite(v)))||!rows.every(({u,i})=>r.points!.some(p=>p[0]===u&&p[1]===i)))return fail('Sijoita jokainen annettu U–I-mittapari kuvaajalle.');}
 if(task.input.kind==='ohm'){const match=Math.abs(expected.checkVoltage!-task.input.verificationMeasuredVoltage)<1e-9;if(r.checkedComparison!==(match?'matches':'differs'))return fail('Vertaa ennustettasi erilliseen mittaustulokseen.');}
 if(task.review&&task.review.criteria.some(c=>r.observations![c.id]!=='met'))return fail('Harjoitellaan vielä molempien sääntöjen perustelua.');
 return {ok:true,...provenance};
}

export function solutionCircuitWorkshop(task:CircuitWorkshopTask):CircuitWorkshopResponse {const m=task.input;return {kind:'circuit-workshop',values:expectedValues(m),locked:true,observed:true,changeApplied:true,...(m.kind==='ohm'?{checkedComparison:Math.abs(expectedValues(m).checkVoltage!-m.verificationMeasuredVoltage)<1e-9?'matches' as const:'differs' as const}:{}),...(m.kind==='network'&&m.goal==='parallel-voltage'?{nodePair:['p','n']}:{}),...(m.kind==='data'&&m.task==='plot'?{points:m.rows.map(row=>[row.u,row.i] as const)}:{})};}
export function wrongCircuitWorkshopResponses(task:CircuitWorkshopTask):CircuitWorkshopResponse[]{const r=solutionCircuitWorkshop(task),keys=Object.keys(r.values);return [{...r,locked:false},{...r,values:keys.length?{...r.values,[keys[0]!]:NaN}:{wrong:0},...(task.input.kind==='data'&&task.input.task==='plot'?{points:[]}: {})}];}
