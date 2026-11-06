/** Independent peer answers: exact boundary-line intersections and enumerated physical categories.
 * Deliberately does not import the production solution, ionization, shadow or exposure helpers. */
import type {LightCase,RadiationCase,WavesObservatoryTask,WavesObservatoryResponse} from '../src/content/models/waves-observatory';
const tenth=(n:number)=>BigInt(Math.round(n*10));
export function independentShadow(input:LightCase,y:number):{low:number;high:number}{
  const sx=tenth(input.sourceX),sy=tenth(input.sourceY),ox=tenth(input.objectX),screen=tenth(input.screenX),half=tenth(input.objectHalf),centre=tenth(y);
  const intersection=(edge:bigint)=>{
    if(input.context==='sun')return Number(edge*100n+(screen-ox)*sy)/1000;
    // Ax + By + C = 0 through the source and one boundary point.
    const a=sy-edge,b=ox-sx,c=sx*edge-ox*sy;
    return Number(-(a*screen+c))/Number(b*10n);
  };
  return {low:intersection(centre-half),high:intersection(centre+half)};
}
export function independentIon(input:RadiationCase):boolean{
  return input.form==='particle'?input.particleIonizes===true:BigInt(Math.round(input.energyEv!*1e6))>=BigInt(Math.round(input.bindingEv!*1e6));
}
export function independentExposureWinners(input:RadiationCase):string[]{
  const values=(input.exposure??[]).map(c=>({id:c.id,amount:BigInt(c.rate)*BigInt(c.time)*BigInt(Math.round(c.transmission*1000))}));
  const min=values.reduce<bigint|undefined>((m,c)=>m===undefined||c.amount<m?c.amount:m,undefined);
  return values.filter(c=>c.amount===min).map(c=>c.id);
}
export function independentlyAnswerWaves(task:WavesObservatoryTask):WavesObservatoryResponse{
  const answer:WavesObservatoryResponse={kind:'waves-observatory',predictionLocked:true,values:{}};
  const values:Record<string,string>={},input=task.input;
  if(input.kind==='light'){
    const {low,high}=independentShadow(input,input.targetY);
    answer.action={objectY:input.targetY};answer.observed={kind:'light',objectY:input.targetY,shadowLow:low,shadowHigh:high};
    values.direction=input.targetY===input.objectY?'same':input.targetY>input.objectY?'up':'down';
    if(task.fields.some(f=>f.id==='path'))values.path='source-object-screen';
  }else if(input.kind==='sound'){
    const frequencyChange=input.targetFrequency-input.frequency,amplitudeChange=input.targetAmplitude-input.amplitude;
    values.effect=frequencyChange>0?'higher':frequencyChange<0?'lower':amplitudeChange>0?'greater':'smaller';
    if(task.fields.some(f=>f.id==='path'))values.path='source-medium-receiver';
    answer.action={frequency:input.targetFrequency,amplitude:input.targetAmplitude};
    answer.observed={kind:'sound',frequency:input.targetFrequency,amplitude:input.targetAmplitude,medium:input.medium};
  }else{
    if(task.fields.some(f=>f.id==='form'))values.form=['alpha','beta','positron','proton','neutron'].includes(input.example)?'particle':'em';
    if(task.fields.some(f=>f.id==='particle'))values.particle=input.example;
    if(task.fields.some(f=>f.id==='ion'))values.ion=independentIon(input)?'yes':'no';
    if(input.comparison)values.ion2=independentIon(input.comparison)?'yes':'no';
    if(task.fields.some(f=>f.id==='risk'))values.risk='exposure';
    if(task.fields.some(f=>f.id==='effect'))values.effect='cell-damage';
    if(task.fields.some(f=>f.id==='plan'))values.plan=input.unknown?'ask':independentExposureWinners(input)[0]!;
  }
  answer.values=values;
  if(task.review){answer.confirmedByAdult=true;answer.assistance='none';answer.observations=Object.fromEntries(task.review.criteria.map(c=>[c.id,'met']));}
  return answer;
}
