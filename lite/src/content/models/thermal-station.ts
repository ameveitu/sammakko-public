/** Idealized classroom models; correctness is independent of rendering.
 * Sources: https://openstax.org/books/university-physics-volume-2/pages/1-4-heat-transfer-specific-heat-and-calorimetry
 * https://openstax.org/books/university-physics-volume-2/pages/1-6-mechanisms-of-heat-transfer
 * https://www.nist.gov/si-redefinition/kelvin/kelvin-present-realization
 * Constant heat capacities, fixed conductance, no phase change or external work/heat in contact model.
 */
export type Mechanism='conduction'|'convection'|'radiation';
export type ThermalInput=
 | {kind:'probe';target:'a'|'b';aC:number;bC:number;context:'water'|'air'}
 | {kind:'energy';context:'sun-stone'|'cooling-cup'|'warm-water';direction:'in'|'out';sourceC:number;targetC:number}
 | {kind:'amount';massA:number;massB:number;temperatureC:number;riseC:number;specificHeat:number}
 | {kind:'flow';aC:number;bC:number;capacityA:number;capacityB:number;conductance:number;seconds:number;context:'bottle'|'stone'}
 | {kind:'conduction';aConductance:number;bConductance:number;hotC:number;coldC:number;capacity:number;seconds:number;context:'bridge'|'wall'}
 | {kind:'convection';medium:'air'|'water';context:'cabin'|'tank';question:'mechanism'|'circulation';warmC:number;coolC:number}
 | {kind:'radiation';medium:'air'|'vacuum';context:'sun'|'lamp';question:'shield'|'medium';openPower:number;screenPower:number;seconds:number}
 | {kind:'integration';context:'cabin'|'greenhouse'|'tent';warmC:number;coolC:number;mechanisms:readonly Mechanism[]};
export interface ThermalStationTask {kind:'thermal-station';input:ThermalInput;question:string;choices:readonly {id:string;label:string}[];hint:string;review?:{criteria:readonly {id:string;label:string}[]}}
export interface ThermalStationResponse {kind:'thermal-station';prediction:readonly string[];locked:boolean;observed:boolean;compared?:readonly string[];sensor?:'a'|'b';reading?:number;comparison?:'a'|'b'|'equal';confirmedByAdult?:boolean;assistance?:'none'|'helped';observations?:Readonly<Record<string,'met'|'not-yet'>>}
export interface ThermalVerdict {ok:boolean;why?:string;pendingReview?:true;observedByAdult?:true;assisted?:true}
const valid=(...values:number[])=>values.every(Number.isFinite);
/** Analytic solution: C1*dT1 + C2*dT2 = 0 at every elapsed time. K is W/K; C is J/K. */
export function contactAt(aC:number,bC:number,capacityA:number,capacityB:number,conductance:number,seconds:number){
 if(!valid(aC,bC,capacityA,capacityB,conductance,seconds)||capacityA<=0||capacityB<=0||conductance<0||seconds<0)throw new RangeError('Invalid thermal model');
 const equilibrium=(capacityA*aC+capacityB*bC)/(capacityA+capacityB),factor=Math.exp(-conductance*(1/capacityA+1/capacityB)*seconds);
 const a=equilibrium+(aC-equilibrium)*factor,b=equilibrium+(bC-equilibrium)*factor;
 return {a,b,equilibrium,energyA:capacityA*(a-aC),energyB:capacityB*(b-bC),netPowerA:conductance*(b-a)};
}
export function thermalDirection(a:number,b:number):'a-to-b'|'b-to-a'|'none'{return a>b?'a-to-b':a<b?'b-to-a':'none';}
export function amountEnergy(mass:number,specificHeat:number,rise:number){if(!valid(mass,specificHeat,rise)||mass<=0||specificHeat<=0)throw new RangeError('Invalid material');return mass*specificHeat*rise;}
export function expectedPrediction(input:ThermalInput):readonly string[] {
 switch(input.kind){
  case 'probe':return ['settled'];
  case 'energy':return [input.direction];
  case 'amount':return [input.massA>input.massB?'a':input.massA<input.massB?'b':'equal'];
  case 'flow':return [thermalDirection(input.aC,input.bC)];
  case 'conduction':return [input.aConductance>input.bConductance?'a':input.aConductance<input.bConductance?'b':'equal'];
  case 'convection':return [input.question==='mechanism'?'matter-moves':'warm-rises'];
  case 'radiation':return [input.question==='shield'?'open':'vacuum-yes'];
  case 'integration':return [...input.mechanisms];
 }
}
export function thermalOutcome(input:ThermalInput):Record<string,unknown>{
 switch(input.kind){
  case 'probe':return {aC:input.aC,bC:input.bC,target:input.target};
  case 'energy':return {direction:input.direction};
  case 'amount':return {aJ:amountEnergy(input.massA,input.specificHeat,input.riseC),bJ:amountEnergy(input.massB,input.specificHeat,input.riseC)};
  case 'flow':return {...contactAt(input.aC,input.bC,input.capacityA,input.capacityB,input.conductance,input.seconds),direction:thermalDirection(input.aC,input.bC)};
  case 'conduction':return {a:contactAt(input.hotC,input.coldC,input.capacity,input.capacity,input.aConductance,input.seconds),b:contactAt(input.hotC,input.coldC,input.capacity,input.capacity,input.bConductance,input.seconds)};
  case 'convection':return {medium:input.medium,bulkMotion:true};
  case 'radiation':return {openJ:input.openPower*input.seconds,screenJ:input.screenPower*input.seconds};
  case 'integration':return {mechanisms:[...input.mechanisms]};
 }
}
const equalSet=(a:readonly string[],b:readonly string[])=>a.length===b.length&&new Set(a).size===a.length&&Array.from(a).every(v=>typeof v==='string'&&b.includes(v));
export function checkThermalStation(task:ThermalStationTask,response:ThermalStationResponse):ThermalVerdict {
 if(!response||response.kind!=='thermal-station'||response.locked!==true||response.observed!==true)return {ok:false,why:'Lukitse ennuste ja avaa sen jälkeen mallihavainto.'};
 if(!Array.isArray(response.prediction)||!equalSet(response.prediction,expectedPrediction(task.input)))return {ok:false,why:task.hint};
 if((task.input.kind==='conduction'||task.input.kind==='radiation')&&(!Array.isArray(response.compared)||!equalSet(response.compared,['a','b'])))return {ok:false,why:'Tutki vertailun molemmat mallit.'};
 if(task.input.kind==='probe'){
  const m=task.input,target=m.target==='a'?m.aC:m.bC,comparison=m.aC>m.bC?'a':m.aC<m.bC?'b':'equal';
  if(response.sensor!==m.target)return {ok:false,why:'Aseta virtuaalimittari pyydettyyn kohteeseen.'};
  if(response.reading!==target)return {ok:false,why:'Lue vakiintunut asteikko, huomioi nollan alapuolinen etumerkki ja Celsius-yksikkö.'};
  if(response.comparison!==comparison)return {ok:false,why:'Vertaa molempia annettuja Celsius-lukemia.'};
 }
 if(task.review){
  if(response.confirmedByAdult!==true||!['none','helped'].includes(response.assistance??'')||!response.observations||Object.keys(response.observations).length!==task.review.criteria.length||!task.review.criteria.every(c=>Object.hasOwn(response.observations!,c.id)&&['met','not-yet'].includes(response.observations![c.id]??'')))return {ok:false,pendingReview:true,why:'Oma selitys odottaa aikuisen havaintoa.'};
  const missing=task.review.criteria.find(c=>response.observations![c.id]!=='met');if(missing)return {ok:false,why:`Harjoitellaan vielä: ${missing.label}`,observedByAdult:true,...(response.assistance==='helped'?{assisted:true}:{})};
  return {ok:true,observedByAdult:true,...(response.assistance==='helped'?{assisted:true}:{})};
 }
 return {ok:true};
}
export function solutionThermalStation(task:ThermalStationTask):ThermalStationResponse {
 const m=task.input;return {kind:'thermal-station',prediction:[...expectedPrediction(m)],locked:true,observed:true,...(m.kind==='conduction'||m.kind==='radiation'?{compared:['a','b']}:{}),...(m.kind==='probe'?{sensor:m.target,reading:m.target==='a'?m.aC:m.bC,comparison:m.aC>m.bC?'a':m.aC<m.bC?'b':'equal'}:{}),...(task.review?{confirmedByAdult:false,observations:{}}:{})};
}
export function wrongThermalStationResponses(task:ThermalStationTask):ThermalStationResponse[] {
 const correct=solutionThermalStation(task);return [{...correct,locked:false},{...correct,prediction:['wrong-model']}];
}
