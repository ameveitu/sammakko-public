import { parseMeasure } from './spatial-measures';
import { checkObservedExplanation, type ObservedExplanationTask, type CriterionObservation } from './observed-explanations';

export const solutionLabSources=[
  'https://openstax.org/books/chemistry-2e/pages/3-4-other-units-for-solution-concentrations',
  'https://openstax.org/books/chemistry-2e/pages/14-2-ph-and-poh',
  'https://www.ch.ic.ac.uk/rzepa/aptonge/mdl/indi/indicator.html',
] as const;
export type SolutionRational=readonly [bigint,bigint];
export type Acidity='acidic'|'neutral'|'basic';
export type MassSample={id:string;label:string;solute:number;solvent:number;unit:'g';basis:'mass-mass'};
export type SolutionOperation={kind:'dilute'|'aliquot';amount:number};
export type SolutionReview=Pick<ObservedExplanationTask,'prompt'|'rubric'|'model'>;
export type SolutionObservation={observations:Partial<Record<string,CriterionObservation>>;confirmedByAdult:boolean;assistance:'none'|'helped'};
type ConcentrationTask={mode:'concentration';skill:'concept'|'calculate';sample:MassSample;show:'parts'|'total';operation?:SolutionOperation};
type CompareTask={mode:'compare';samples:readonly [MassSample,MassSample]};
export type PhSample={id:string;label:string}&({ph10:number;requested?:never}|{requested:Acidity;ph10?:never});
type PhTask=({skill:'acidbase';activity:'read'|'construct';samples:readonly PhSample[];pair?:never}
  |{skill:'scale';activity:'read'|'log';samples:readonly Extract<PhSample,{ph10:number}>[];pair:readonly [string,string]})
  &{mode:'ph';temperatureC:25;neutral10:70};
export type IndicatorId='methyl-orange'|'bromothymol-blue'|'phenolphthalein';
export type IndicatorBand='low'|'transition'|'high';
export type IndicatorReading={indicator:IndicatorId;band:IndicatorBand};
type IndicatorTask={mode:'indicator';readings:readonly IndicatorReading[];temperatureC:25;neutral10:70;review?:SolutionReview};
export type SolutionLabTask=(ConcentrationTask|CompareTask|PhTask|IndicatorTask)&{kind:'solution-lab';title:string};
export type SolutionLabResponse=(
 |{mode:'concentration';numerator:string;denominator:string;basis:string;percent:string;
   operation?:{kind:string;amount:string;locked:boolean;applied:boolean}}
 |{mode:'compare';rows:readonly {id:string;numerator:string;denominator:string}[];cross:readonly [string,string];relation:'left'|'same'|'right'|null}
 |{mode:'ph';rows:readonly {id:string;ph:string;classification:string}[];order:readonly string[];moreAcidic:string;factor:string}
 |{mode:'indicator';consistent:boolean|null;lower:string;upper:string;includeLower:boolean;includeUpper:boolean;classes:readonly string[];review?:SolutionObservation}
)&{kind:'solution-lab'};
export type SolutionLabVerdict={ok:boolean;why?:string;pendingReview?:true;observedByAdult?:true;assisted?:true};
export type PhInterval={lower10:number;upper10:number;includeLower:boolean;includeUpper:boolean};
export const solutionIndicators:Record<IndicatorId,{name:string;lower10:number;upper10:number;colors:readonly [string,string,string];fills:readonly [string,string,string]}>={
  'methyl-orange':{name:'Metyylioranssi',lower10:32,upper10:44,colors:['Punainen','Värinvaihtoalue','Keltainen'],fills:['#bf5d53','#cc9760','#dfc65b']},
  'bromothymol-blue':{name:'Bromitymolisininen',lower10:60,upper10:76,colors:['Keltainen','Värinvaihtoalue','Sininen'],fills:['#dfc65b','#83ad88','#618ab7']},
  'phenolphthalein':{name:'Fenoliftaleiini',lower10:82,upper10:100,colors:['Väritön','Värinvaihtoalue','Vaaleanpunainen'],fills:['#e8ece0','#d2a7c0','#c76b9d']},
};
const kind='solution-lab' as const;
const pass={ok:true};
const fail=(why:string):SolutionLabVerdict=>({ok:false,why});
const integer=(n:number):SolutionRational=>[BigInt(n),1n];
const multiply=([a,b]:SolutionRational,[c,d]:SolutionRational):SolutionRational=>[a*c,b*d];
const divide=([a,b]:SolutionRational,[c,d]:SolutionRational):SolutionRational=>[a*d,b*c];
const subtract=([a,b]:SolutionRational,[c,d]:SolutionRational):SolutionRational=>[a*d-c*b,b*d];
const equal=([a,b]:SolutionRational,[c,d]:SolutionRational)=>a*d===b*c;
const less=([a,b]:SolutionRational,[c,d]:SolutionRational)=>a*d<c*b;
export function solutionValue(raw:unknown):SolutionRational|undefined{
  if(typeof raw!=='string'||raw.length>48)return;
  const value=parseMeasure(raw);if(value)return value;
  // Cross-products and powers of ten can exceed the general nine-digit measure input.
  const text=raw.trim(),ratio=/^([+-]?\d{1,18})\s*\/\s*([+-]?\d{1,18})$/.exec(text);
  if(ratio){const n=BigInt(ratio[1]!),d=BigInt(ratio[2]!);return d===0n?undefined:d<0n?[-n,-d]:[n,d];}
  return /^[+-]?\d{1,18}$/.test(text)?[BigInt(text),1n]:undefined;
}
export function solutionFormat([n,d]:SolutionRational):string{
  let a=n<0n?-n:n,b=d;while(b)[a,b]=[b,a%b];
  return d===a?String(n/a):`${n/a}/${d/a}`;
}
const has=(value:unknown,wanted:SolutionRational)=>{const actual=solutionValue(value);return !!actual&&equal(actual,wanted);};
const ownRecord=(value:unknown,allowed?:readonly string[]):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value)
  &&[Object.prototype,null].includes(Object.getPrototypeOf(value))
  &&Reflect.ownKeys(value).every(key=>Object.prototype.hasOwnProperty.call(Object.getOwnPropertyDescriptor(value,key)??{},'value')
    &&(allowed===undefined||typeof key==='string'&&allowed.includes(key)));
const dense=(value:unknown,max=8):value is unknown[]=>Array.isArray(value)&&value.length<=max
  &&Array.from({length:value.length},(_,i)=>Object.getOwnPropertyDescriptor(value,String(i)))
    .every(descriptor=>!!descriptor&&Object.prototype.hasOwnProperty.call(descriptor,'value')&&descriptor.value!==undefined);
const responseKeys:Record<SolutionLabTask['mode'],readonly string[]>={
  concentration:['kind','mode','numerator','denominator','basis','percent','operation'],
  compare:['kind','mode','rows','cross','relation'],
  ph:['kind','mode','rows','order','moreAcidic','factor'],
  indicator:['kind','mode','consistent','lower','upper','includeLower','includeUpper','classes','review'],
};
const total=(sample:MassSample)=>sample.solute+sample.solvent;
const validSample=(sample:MassSample)=>Number.isSafeInteger(sample.solute)&&Number.isSafeInteger(sample.solvent)&&sample.solute>=0&&sample.solvent>0
  &&total(sample)<=1000000&&sample.basis==='mass-mass'&&sample.unit==='g';
export type SolutionMassState={source:{solute:SolutionRational;total:SolutionRational};target:{solute:SolutionRational;total:SolutionRational};addedSolvent:SolutionRational};
/** All masses are grams. An aliquot includes a retained source. Dilution includes its added solvent supply. */
export function solutionMassState(sample:MassSample,operation?:{kind:string;amount:string}):SolutionMassState|undefined{
  if(!validSample(sample))return;
  const solute=integer(sample.solute),whole=integer(total(sample));
  if(!operation)return {source:{solute:integer(0),total:integer(0)},target:{solute,total:whole},addedSolvent:integer(0)};
  const amount=solutionValue(operation.amount);
  if(!amount||!less(integer(0),amount)||less(integer(1000000),amount))return;
  if(operation.kind==='dilute')return {source:{solute:integer(0),total:integer(0)},
    target:{solute,total:[whole[0]*amount[1]+amount[0],amount[1]]},addedSolvent:amount};
  if(operation.kind==='aliquot'&&!less(whole,amount)){
    const part=multiply(solute,divide(amount,whole));
    return {source:{solute:subtract(solute,part),total:subtract(whole,amount)},target:{solute:part,total:amount},addedSolvent:integer(0)};
  }
  return;
}
export function solutionAcidity(value:SolutionRational,neutral10=70):Acidity{
  const neutral:SolutionRational=[BigInt(neutral10),10n];
  return equal(value,neutral)?'neutral':less(value,neutral)?'acidic':'basic';
}
export function indicatorInterval(reading:IndicatorReading):PhInterval{
  const indicator=solutionIndicators[reading.indicator];
  if(reading.band==='low')return {lower10:0,upper10:indicator.lower10,includeLower:true,includeUpper:false};
  if(reading.band==='high')return {lower10:indicator.upper10,upper10:140,includeLower:false,includeUpper:true};
  return {lower10:indicator.lower10,upper10:indicator.upper10,includeLower:true,includeUpper:true};
}
export function intersectIndicators(readings:readonly IndicatorReading[]):PhInterval|undefined{
  let interval:PhInterval={lower10:0,upper10:140,includeLower:true,includeUpper:true};
  for(const reading of readings){
    const next=indicatorInterval(reading);
    const lower10=Math.max(interval.lower10,next.lower10),upper10=Math.min(interval.upper10,next.upper10);
    const includeLower=(lower10!==interval.lower10||interval.includeLower)&&(lower10!==next.lower10||next.includeLower);
    const includeUpper=(upper10!==interval.upper10||interval.includeUpper)&&(upper10!==next.upper10||next.includeUpper);
    if(lower10>upper10||lower10===upper10&&(!includeLower||!includeUpper))return;
    interval={lower10,upper10,includeLower,includeUpper};
  }
  return interval;
}
export function indicatorClasses(interval:PhInterval|undefined,neutral10=70):Acidity[]{
  if(!interval)return [];
  const out:Acidity[]=[];
  if(interval.lower10<neutral10)out.push('acidic');
  if(interval.lower10<=neutral10&&interval.upper10>=neutral10&&
    (interval.lower10!==neutral10||interval.includeLower)&&(interval.upper10!==neutral10||interval.includeUpper))out.push('neutral');
  if(interval.upper10>neutral10)out.push('basic');
  return out;
}
export function solutionExplanation(task:Extract<SolutionLabTask,{mode:'indicator'}>):ObservedExplanationTask{
  if(!task.review)throw Error('No adult-observed explanation in this task');
  return {kind:'observed-explanation',channel:'spoken',givens:[],...task.review};
}
export function checkSolutionLabActivity(task:SolutionLabTask,answer:SolutionLabResponse):SolutionLabVerdict{
  if(!ownRecord(answer,responseKeys[task.mode])||answer.kind!==kind||answer.mode!==task.mode)return fail('Täydennä tämän tutkimusikkunan oma vastaus.');
  if(task.mode==='concentration'&&answer.mode==='concentration'){
    if(answer.basis!=='mass-mass')return fail('Tässä käytetään massaprosenttia. Aineosan massa suhteutetaan koko liuoksen massaan samoissa massayksiköissä.');
    let state=solutionMassState(task.sample);
    if(task.operation){
      const action=answer.operation;
      if(!ownRecord(action,['kind','amount','locked','applied'])||action.locked!==true||action.applied!==true||action.kind!==task.operation.kind||!has(action.amount,integer(task.operation.amount)))
        return fail('Lukitse oma ennuste ja tee annettu virtuaalinen osanotto tai liuottimen lisäys.');
      state=solutionMassState(task.sample,action);
    }
    if(!state||!has(answer.numerator,state.target.solute)||!has(answer.denominator,state.target.total))
      return fail('Osoittajaan kuuluu tarkasteltavan aineosan massa. Nimittäjään kuuluu koko tarkasteltavan liuoksen massa, mukana myös aineosa.');
    if(task.skill==='calculate'&&!has(answer.percent,multiply(divide(state.target.solute,state.target.total),integer(100))))
      return fail('Jaa aineosan massa koko liuoksen massalla ja kerro sadalla. Säilytä massa–massa-määritelmä.');
    return pass;
  }
  if(task.mode==='compare'&&answer.mode==='compare'){
    if(!dense(answer.rows,2)||answer.rows.length!==2)return fail('Tuota kummankin näytteen oma suhde.');
    for(const sample of task.samples){
      const rows=answer.rows.filter(row=>ownRecord(row,['id','numerator','denominator'])&&row.id===sample.id);
      if(rows.length!==1||!has(rows[0]!.numerator,integer(sample.solute))||!has(rows[0]!.denominator,integer(total(sample))))
        return fail('Pidä kummassakin suhteessa aineosan massa ja saman näytteen koko massa omilla paikoillaan.');
    }
    const [a,b]=task.samples,left=BigInt(a.solute)*BigInt(total(b)),right=BigInt(b.solute)*BigInt(total(a));
    if(!dense(answer.cross,2)||answer.cross.length!==2||!has(answer.cross[0], [left,1n])||!has(answer.cross[1],[right,1n]))
      return fail('Muodosta vertailutuotteet aineosa A × kokonaismäärä B ja aineosa B × kokonaismäärä A.');
    return answer.relation===(left===right?'same':left>right?'left':'right')?pass:
      fail('Vertaa suhteita. Suurempi aineosan määrä ei yksin tarkoita suurempaa pitoisuutta.');
  }
  if(task.mode==='ph'&&answer.mode==='ph'){
    if(!dense(answer.rows,6)||answer.rows.length!==task.samples.length)return fail('Tee jokaiselle pH-kortille oma merkintä.');
    for(const sample of task.samples){
      const rows=answer.rows.filter(row=>ownRecord(row,['id','ph','classification'])&&row.id===sample.id),row=rows[0],value=solutionValue(row?.ph);
      if(rows.length!==1||!value||less(value,integer(0))||less(integer(14),value))return fail('Tämän taulukkomallin pH-alue on 0–14. Anna jokaiselle näytteelle oma mittaluku.');
      if(sample.ph10!==undefined&&!equal(value,[BigInt(sample.ph10),10n]))return fail('Kohdista oma merkintä annetun mittauskortin pH-arvoon.');
      const acidity=solutionAcidity(value,task.neutral10);
      if(row!.classification!==acidity||sample.requested!==undefined&&acidity!==sample.requested)
        return fail('Näissä 25 °C:n vesiliuosnäytteissä pH 7 on neutraali, pienempi hapan ja suurempi emäksinen.');
    }
    if(task.skill==='scale'){
      if(!dense(answer.order,6)||answer.order.length!==task.samples.length||new Set(answer.order).size!==task.samples.length||!task.samples.every(s=>answer.order.includes(s.id)))
        return fail('Järjestä kaikki mittauskortit happamimmasta kohti suurempaa pH-arvoa.');
      const ordered=answer.order.map(id=>task.samples.find(sample=>sample.id===id)!.ph10!);
      if(ordered.some((value,i)=>i>0&&value<ordered[i-1]!))return fail('Happamamman vesiliuoksen pH-arvo on pienempi samoissa oloissa.');
      if(task.activity==='read')return pass;
      const [a,b]=task.pair!.map(id=>task.samples.find(sample=>sample.id===id)!);
      const delta=Math.abs(a!.ph10!-b!.ph10!);
      if(delta%10!==0)return fail('Tässä kymmenkertaisen askeleen tehtävässä verrataan kokonaisia pH-yksiköitä.');
      const more=a!.ph10===b!.ph10?'same':a!.ph10!<b!.ph10!?a!.id:b!.id;
      if(answer.moreAcidic!==more||!has(answer.factor,[10n**BigInt(delta/10),1n]))
        return fail('Käytä annettua logaritmista sääntöä. Yhden pH-yksikön pienennys vastaa kymmenkertaista oksoniumionien aktiivisuutta.');
    }
    return pass;
  }
  if(task.mode==='indicator'&&answer.mode==='indicator'){
    const interval=intersectIndicators(task.readings);
    if(answer.consistent!==!!interval)return fail('Tarkista, voiko sama pH-arvo kuulua kaikkiin annettujen havaintojen alueisiin.');
    if(interval&&(!has(answer.lower,[BigInt(interval.lower10),10n])||!has(answer.upper,[BigInt(interval.upper10),10n])||
      answer.includeLower!==interval.includeLower||answer.includeUpper!==interval.includeUpper))
      return fail('Anna koko havaintojen sallima pH-alue ja mukaan kuuluvat rajat. Laajasta värialueesta ei päätellä yhtä tarkkaa pH-lukua.');
    const classes=indicatorClasses(interval,task.neutral10);
    if(!dense(answer.classes,3)||answer.classes.length!==classes.length||!classes.every(c=>answer.classes.filter(v=>v===c).length===1))
      return fail('Merkitse kaikki mahdolliset happamuusluokat. Neutraalin rajan ylittävä alue voi sallia useita luokkia.');
    return pass;
  }
  return fail('Täydennä tämän tutkimusikkunan oma vastaus.');
}
export function checkSolutionLab(task:SolutionLabTask,answer:SolutionLabResponse):SolutionLabVerdict{
  if(task.mode!=='indicator')return checkSolutionLabActivity(task,answer);
  if(!ownRecord(answer,responseKeys.indicator)||answer.kind!==kind||answer.mode!=='indicator')return fail('Täydennä tämän tutkimusikkunan oma vastaus.');
  if(!task.review)return answer.review===undefined?checkSolutionLabActivity(task,answer):fail('Tähän tehtävään ei kuulu erillistä aikuisarviota.');
  const observation=answer.review;
  if(!ownRecord(observation,['observations','confirmedByAdult','assistance'])
    ||!ownRecord(observation.observations,task.review.rubric.map(c=>c.id))
    ||!['none','helped'].includes(observation.assistance))return {ok:false,pendingReview:true,why:'Aikuinen arvioi oman tarkkuusperustelun ja merkitsee avun erikseen.'};
  const reviewed=checkObservedExplanation(solutionExplanation(task),{kind:'observed-explanation',channel:'spoken',observations:observation.observations,
    confirmedByAdult:observation.confirmedByAdult===true,assistance:observation.assistance});
  if(reviewed.pendingReview)return reviewed;
  const activity=checkSolutionLabActivity(task,answer);
  return activity.ok?reviewed:{...activity,...(reviewed.observedByAdult?{observedByAdult:true as const}:{}),...(reviewed.assisted?{assisted:true as const}:{})};
}
export function solutionSolutionLab(task:SolutionLabTask):SolutionLabResponse{
  switch(task.mode){
    case 'concentration':{
      const operation=task.operation?{...task.operation,amount:String(task.operation.amount),locked:true,applied:true}:undefined;
      const state=solutionMassState(task.sample,operation)!;
      return {kind,mode:task.mode,numerator:solutionFormat(state.target.solute),denominator:solutionFormat(state.target.total),basis:'mass-mass',
        percent:solutionFormat(multiply(divide(state.target.solute,state.target.total),integer(100))),...(operation?{operation}:{})};
    }
    case 'compare':{
      const [a,b]=task.samples,left=BigInt(a.solute)*BigInt(total(b)),right=BigInt(b.solute)*BigInt(total(a));
      return {kind,mode:task.mode,rows:task.samples.map(s=>({id:s.id,numerator:String(s.solute),denominator:String(total(s))})),
        cross:[String(left),String(right)],relation:left===right?'same':left>right?'left':'right'};
    }
    case 'ph':{
      const rows=task.samples.map(s=>{const ph10=s.ph10??(s.requested==='acidic'?40:s.requested==='basic'?100:70);
        return {id:s.id,ph:solutionFormat([BigInt(ph10),10n]),classification:solutionAcidity([BigInt(ph10),10n],task.neutral10)};});
      const pair=task.pair?.map(id=>task.samples.find(s=>s.id===id)!);
      const delta=pair?Math.abs(pair[0]!.ph10!-pair[1]!.ph10!)/10:0;
      return {kind,mode:task.mode,rows,order:task.skill==='scale'?[...task.samples].sort((a,b)=>a.ph10!-b.ph10!).map(s=>s.id):[],
        moreAcidic:pair?(pair[0]!.ph10===pair[1]!.ph10?'same':pair[0]!.ph10!<pair[1]!.ph10!?pair[0]!.id:pair[1]!.id):'',factor:String(10n**BigInt(delta))};
    }
    case 'indicator':{
      const interval=intersectIndicators(task.readings);
      return {kind,mode:task.mode,consistent:!!interval,lower:interval?solutionFormat([BigInt(interval.lower10),10n]):'',
        upper:interval?solutionFormat([BigInt(interval.upper10),10n]):'',includeLower:interval?.includeLower??false,includeUpper:interval?.includeUpper??false,
        classes:indicatorClasses(interval,task.neutral10),...(task.review?{review:{observations:{},confirmedByAdult:false,assistance:'none' as const}}:{})};
    }
  }
}
export function wrongSolutionLabResponses(task:SolutionLabTask):SolutionLabResponse[]{
  const answer=solutionSolutionLab(task);
  switch(answer.mode){
    case 'concentration':return [{...answer,basis:'mass-solvent'},{...answer,denominator:'0'}];
    case 'compare':return [{...answer,cross:['0','0']},{...answer,rows:[]}];
    case 'ph':return [{...answer,rows:[]},{...answer,rows:answer.rows.map(row=>({...row,classification:'invalid'}))}];
    case 'indicator':return [{...answer,consistent:!answer.consistent},{...answer,classes:['invalid']}];
  }
}
