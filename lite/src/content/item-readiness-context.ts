import type { ItemReadinessContext } from '../engine/item-readiness';
import { authoredItemReadiness } from '../engine/item-readiness';
/**
 * Narrow bridges for present item producers whose item-specific intent is explicit.
 * No regex against visible prompts, no inference from optional hints, answer keys or family-wide assumptions.
 * Unknown/legacy tags deliberately stay unresolved until separately audited.
 */
type ObjectValue=Record<string,unknown>;
const object=(value:unknown):value is ObjectValue=>typeof value==='object'&&value!==null&&!Array.isArray(value);
export function resolveItemReadinessContext(nodeId:string,item:unknown):ItemReadinessContext|undefined {
 if(!object(item)||!object(item.task))return;
 // A light (theory book) item keeps the full workbench task as its basis; readiness follows that situation.
 const task=object(item.basis)&&typeof item.basis.kind==='string'?item.basis:item.task;
 const authored=authoredItemReadiness(nodeId,task);if(authored)return authored;
 if(nodeId==='CHEM79-ORG-GROUP'&&task.kind==='carbon-kitchen'&&task.mode==='organic-group'&&object(task.context)&&object(task.profile)){
  const c=task.context,p=task.profile;
  if(c.kind==='local-profile'&&p.origin==='prototype-teaching-choice'&&p.group==='alcohols'&&c.profileGroup===p.group&&c.itemGroup===p.group&&Array.isArray(c.allowedGroups)&&c.allowedGroups.length===1&&c.allowedGroups[0]===p.group)
   return {kind:'local-profile',profileGroup:p.group,itemGroup:p.group,allowedGroups:[p.group]};
 }
 if(nodeId==='CHEM79-ELEMENT'&&task.kind==='atomic-world'&&task.mode==='sample'&&task.focus==='element'&&object(task.context)&&task.context.kind==='element'){
  const route=task.context.route;if(route==='pure'||route==='atomic'||route==='either')return {kind:'element',route};
 }
 if((nodeId==='M79-TRIG-ANGLE'||nodeId==='M79-TRIG-SIDE')&&task.kind==='right-triangle'){
  if(!object(task.context)||task.context.kind!=='trig')return;
  const ratio=task.context.ratio;
  if(ratio!=='sin'&&ratio!=='cos'&&ratio!=='tan')return;
  const jobKind=nodeId==='M79-TRIG-ANGLE'?'trig-angle':'trig-side';
  if(!Array.isArray(task.jobs)||!task.jobs.length||!Array.from(task.jobs).every(job=>object(job)&&job.kind===jobKind&&job.taught===ratio))return;
  return {kind:'trig',ratio};
 }
 if(nodeId==='M79-POWER-SIMPLIFY'&&task.kind==='power-rules'&&task.mode==='rewrite'&&object(task.context)&&Array.isArray(task.context.rules)){
  const labels:Record<string,'product'|'quotient'|'power-of-power'>={'tulo':'product','osamäärä':'quotient','potenssin-potenssi':'power-of-power'};
  const raw=task.context.rules;if(!raw.length||!raw.every(x=>typeof x==='string'&&labels[x]))return;
  const rules=raw.map(x=>labels[x as string]!);const kinds=new Set<string>();
  function walk(x:unknown):boolean {if(!object(x)||typeof x.kind!=='string')return false;if(x.kind==='power')return true;if(x.kind==='nested'){kinds.add('power-of-power');return walk(x.inner);}if(x.kind==='product'||x.kind==='quotient'){kinds.add(x.kind);return walk(x.left)&&walk(x.right);}return false;}
  if(!walk(task.source)||rules.some(r=>!kinds.has(r))||[...kinds].some(k=>!rules.includes(k as typeof rules[number]))||!Array.isArray(task.focuses)||task.focuses.length!==rules.length)return;
  // Check the author-declared rewrite sites against the actual expression, not answer text.
  for(let i=0;i<task.focuses.length;i++){
   const path=task.focuses[i];if(!Array.isArray(path))return;let target:unknown=task.source;
   for(const edge of path){if((edge!=='left'&&edge!=='right')||!object(target))return;target=target[edge];}
   if(!object(target))return;const actual=target.kind==='nested'?'power-of-power':target.kind;
   if(actual!==rules[i])return;
  }
  return {kind:'power-rules',rules:[...new Set(rules)]};
 }
 if((nodeId==='M-MEAS-12'||nodeId==='M-MEAS-13')&&task.kind==='measurement-station'&&task.mode===(nodeId==='M-MEAS-12'?'tool':'unit')){
  const dimension=task.dimension==='liquid'?'volume':task.dimension;
  if(dimension==='length'||dimension==='mass'||dimension==='volume')return nodeId==='M-MEAS-12'?{kind:'quantity',quantity:dimension}:{kind:'unit',unit:dimension};
 }
 if(nodeId==='M-REP-01'&&task.kind==='problem-workbench'&&task.mode==='represent'&&object(task.context)&&Array.isArray(task.context.skills)){
  const skills=task.context.skills;if(!skills.every(x=>typeof x==='string'))return;
  const expected=item.tag==='objects-equal-shares'||item.tag==='transfer'?['M-DIV-01','M-NUM-1TO1']:item.tag==='objects-combine-parts'?['M-NUM-1TO1','M-NUM-10']:undefined;
  if(expected&&skills.length===expected.length&&expected.every(id=>skills.includes(id)))return {kind:'content',skills:[...expected]};
 }
 if(nodeId==='M-TH-08'&&typeof item.tag==='string'){
  if(item.tag==='mulAdd'&&task.kind==='choice')return {kind:'links',linkIds:['multiply-add']};
  if(item.tag==='fracDiv'&&task.kind==='choice')return {kind:'links',linkIds:['fraction-divide']};
  if(item.tag==='areaMul'&&task.kind==='choice')return {kind:'links',linkIds:['area-multiply']};
  if(item.tag==='pairs'&&task.kind==='place')return {kind:'links',linkIds:['multiply-add','fraction-divide','perimeter-multiply']};
  if(item.tag==='transfer'&&task.kind==='numeric')return {kind:'links',linkIds:['perimeter-multiply']};
 }
 if(nodeId==='M-CALC-STRAT'&&task.kind==='arithmetic-reasoning'&&task.mode==='strategy'&&(task.operation==='+'||task.operation==='−'))
  return {kind:'operation',domain:'natural',operations:[task.operation==='+'?'add':'subtract']};
 if(nodeId==='M-EXPR-01'){
  if((item.tag==='mulFirst'||item.tag==='transfer')&&task.kind==='choice'||item.tag==='paren'&&task.kind==='numeric')return {kind:'operation',domain:'natural',operations:['add','multiply']};
  if(item.tag==='sub'&&task.kind==='numeric')return {kind:'operation',domain:'natural',operations:['subtract','multiply']};
  if(item.tag==='steps'&&task.kind==='place'&&Array.isArray(task.tokens)&&task.tokens.length===3){
   const labels:Record<string,'add'|'subtract'|'multiply'|'divide'>={'o+':'add','o−':'subtract','o×':'multiply','o:':'divide'};
   if(!task.tokens.every(token=>object(token)&&typeof token.id==='string'&&Object.hasOwn(labels,token.id)))return;
   const operations=task.tokens.map(token=>labels[(token as ObjectValue).id as string]!);
   if(new Set(operations).size!==3||!operations.includes('add')||!operations.includes('subtract'))return;
   return {kind:'operation',domain:'natural',operations};
  }
 }
 if(nodeId==='M-REP-04'&&task.kind==='choice'){
  if(item.tag==='add')return {kind:'content',skills:['M-SYM-PLUS','M-SYM-EQUAL']};
  if(item.tag==='transfer')return {kind:'content',skills:['M-MUL-02','M-SYM-EQUAL']};
 }
 // The audited message table offers a picture and a symbolic label. Other learner-created
 // representations remain admissible in the task, without inventing readiness for them.
 if(nodeId==='M-REP-05'&&task.kind==='observed-explanation'&&task.channel==='written'&&['choose-measuring-message','choose-sharing-message','transfer'].includes(item.tag as string))
  return {kind:'representations',skills:['M-REP-02','M-REP-04']};
 if(nodeId==='M79-EQ1-SOLVE'&&task.kind==='numeric'){
  if(item.tag==='one')return {kind:'operation',domain:'integer',operations:['subtract']};
  if(item.tag==='transfer')return {kind:'operation',domain:'natural',operations:['divide']};
 }
 // These are available calculation routes, never a claim about the learner's actual method.
 if(nodeId==='M-PCT-05'&&task.kind==='numeric'&&['amount-familiar-share','amount-unit-percent','transfer'].includes(item.tag as string)){
  const prerequisites={fraction:['M-PCT-02','M-FRAC-15'],decimal:['M-PCT-03','M-DEC-08']};
  return item.tag==='amount-unit-percent'?{kind:'percent-methods',methods:['fraction','decimal','unit-percent'],prerequisites:{...prerequisites,'unit-percent':['M-PCT-01','M-DIV-01','M-MUL-01']}}
   :{kind:'percent-methods',methods:['fraction','decimal'],prerequisites};
 }
 if(nodeId==='M-FRAC-09'&&object(item.fractionWorkshopModel)&&item.fractionWorkshopModel.kind==='fraction-compare'){
  const method=item.fractionWorkshopModel.method;if(method==='common')return {kind:'fraction-methods',methods:['common-denominator']};if(method==='half')return {kind:'fraction-methods',methods:['supplied-half']};return;
 }
 if(nodeId==='M-UNIT-05'&&task.kind==='numeric'&&typeof item.tag==='string'){
  if(['hmin','mins','mixed','day'].includes(item.tag))return {kind:'time-direction',operation:'multiply'};
  if(item.tag==='back')return {kind:'time-direction',operation:'divide'};
 }
 if(nodeId==='M-UNIT-05'&&item.tag==='hhmm'&&task.kind==='place'&&Array.isArray(task.slots)&&Array.isArray(task.tokens)
  &&task.slots.length===3&&task.tokens.length===4&&task.slots.every((s,i)=>object(s)&&s.id===`s${i}`)&&task.tokens.every((t,i)=>object(t)&&t.id===`t${i}`))return {kind:'time-direction',operation:'divide'};
 if(nodeId==='PHY79-UNIT-CONV'&&task.kind==='numeric'&&typeof item.tag==='string'){
  if(['kmM','cmM'].includes(item.tag))return {kind:'conversion',quantity:'length'};
  if(['minS','hMin'].includes(item.tag))return {kind:'conversion',quantity:'time'};
 }
 if(nodeId==='PHY79-UNIT-CONV'&&item.tag==='transfer'&&task.kind==='choice')return {kind:'conversion',quantity:'length'};
 return;
}
