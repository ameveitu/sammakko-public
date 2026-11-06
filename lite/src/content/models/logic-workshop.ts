/** Bounded, inspectable reasoning models. A person's own argument is observed by a person. */
import type { ObservedExplanationTask } from './observed-explanations';

export type LogicReviewTask = Pick<ObservedExplanationTask,'channel'|'rubric'|'model'>;
export interface LogicReview {
  channel:'spoken'|'written'; produced:boolean; confirmedByAdult:boolean;
  assistance:'none'|'helped'; observations:Readonly<Record<string,'met'|'not-yet'|'unobserved'>>;
}
export type Side='left'|'right';
export interface TroughSettings { direction:Side; release:number }
export interface TroughObservation { side:Side; durationMs:number }
export type LogicPredicate = {op:'ge'|'le'|'eq'|'multiple';value:number};
export interface LogicDatum {id:string;label:string;value:number}
export interface LogicStatement {
  label:string; quantifier:'all'|'some'|'one'|'question'; predicate:LogicPredicate;
  condition?:LogicPredicate; subject?:string; scope?:readonly string[]; complete:boolean;
}
export interface ProofRule {id:string;label:string;premises:readonly string[];conclusion:string}
type Cause = {mode:'cause';apparatus:'water'|'dry';baseline:TroughSettings;draft:TroughSettings;target:Side;length:number};
export interface PerspectiveObject {id:string;label:string;shape:'sphere'|'cube'|'cone';heightScale?:number}
type Perspective = {mode:'perspective';objects:readonly PerspectiveObject[];target:string;start:'shore'|'water';blocks:boolean};
type Question = {mode:'question';subjects:readonly {id:string;label:string;quantities:readonly string[]}[];quantities:readonly {id:string;label:string;method:'count'|'measure'}[]};
type Claims = {mode:'conclusion'|'argument'|'truth';data:readonly LogicDatum[];statements:readonly LogicStatement[];sceneText:string};
type Combinations = {mode:'combinations';factors:readonly {label:string;options:readonly {id:string;label:string}[]}[];forbidden:readonly (readonly string[])[]};
type Rule = {mode:'rule';factor:number;offset:number;threshold?:number;aboveOffset?:number;domainMax:number;input:number;unit:string};
type Proof = {mode:'proof';assumptions:readonly string[];goal:string;facts:Readonly<Record<string,string>>;rules:readonly ProofRule[]};
type Reading = {mode:'reading';sentence:string;pieces:readonly {id:string;label:string}[];roles:Readonly<Record<'given'|'target'|'condition',string>>;relation:'ge'|'le'|'difference'|'double'};
type Writing = {mode:'writing';quantity:string;unit:string;amount:number;factor:number;operation:'groups'|'share';recipient:string};
export type LogicWorkshopTask=(Cause|Perspective|Question|Claims|Combinations|Rule|Proof|Reading|Writing)&{
  kind:'logic-workshop';title:string;review?:LogicReviewTask;
};
export type LogicWorkshopResponse=(
  | {mode:'cause';prediction:Side|'';locked:boolean;settings:TroughSettings;observed?:TroughObservation;changed:string;held:string;conclusion:string}
  | {mode:'perspective';view:'shore'|'water';seen:readonly string[];position:number;stable:string;change:string}
  | {mode:'question';verb:string;quantity:string;subjects:readonly string[];method:string}
  | {mode:'conclusion'|'argument'|'truth';judgements:readonly {statement:number;value:string;witnesses:readonly string[]}[]}
  | {mode:'combinations';rows:readonly (readonly string[])[]}
  | {mode:'rule';expression:string;aboveExpression:string;threshold:number;output:number}
  | {mode:'proof';steps:readonly string[];explainedStep:string}
  | {mode:'reading';roles:Readonly<Record<string,string>>;relation:string}
  | {mode:'writing';result:number;unit:string}
)&{kind:'logic-workshop';review?:LogicReview};
export interface LogicVerdict {ok:boolean;why?:string;pendingReview?:true;observedByAdult?:true;assisted?:true}
const kind='logic-workshop' as const;
const own=(o:object,k:PropertyKey)=>Object.prototype.hasOwnProperty.call(o,k);
const record=(o:unknown):o is Record<string,unknown>=>!!o&&typeof o==='object'&&!Array.isArray(o)
  &&[Object.prototype,null].includes(Object.getPrototypeOf(o))&&Reflect.ownKeys(o).every(k=>own(Object.getOwnPropertyDescriptor(o,k)??{},'value'));
const dense=(a:unknown,max=64):a is unknown[]=>Array.isArray(a)&&a.length<=max&&Array.from(a).every((_,i)=>own(a,i));
const int=(n:unknown,min=-1000000,max=1000000):n is number=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=min&&n<=max;
const fail=(why:string):LogicVerdict=>({ok:false,why});
const sameSet=(a:unknown,b:readonly string[])=>dense(a)&&a.length===b.length&&new Set(a).size===a.length&&b.every(x=>a.includes(x));

export function runLogicTrough(task:Extract<LogicWorkshopTask,{mode:'cause'}>,settings:TroughSettings):TroughObservation|undefined {
  if(!record(settings)||!['left','right'].includes(settings.direction)||!int(settings.release,1,4))return;
  // A deliberately bounded virtual channel. Release controls speed, direction controls destination.
  // Dry transfer is a frictionless sliding bead under constant g*sin(theta), not a rolling-body claim.
  const seconds=task.apparatus==='dry'?Math.sqrt(2*task.length/(9.81*settings.release/10)):task.length/(.5+settings.release/4);
  return {side:settings.direction,durationMs:Math.round(seconds*1000)};
}
function validTroughObservation(task:Extract<LogicWorkshopTask,{mode:'cause'}>,answer:Extract<LogicWorkshopResponse,{mode:'cause'}>){
  const o=runLogicTrough(task,answer.settings),given=answer.observed;
  return answer.locked===true&&['left','right'].includes(answer.prediction)&&o&&record(given)
    &&Reflect.ownKeys(given).length===2&&own(given,'side')&&own(given,'durationMs')&&given.side===o.side&&given.durationMs===o.durationMs?o:undefined;
}
export function logicPredicate(value:number,p:LogicPredicate):boolean {
  return p.op==='ge'?value>=p.value:p.op==='le'?value<=p.value:p.op==='eq'?value===p.value:p.value!==0&&value%p.value===0;
}
export function evaluateLogicStatement(data:readonly LogicDatum[],statement:LogicStatement):{value:'true'|'false'|'unknown'|'question';sufficient:readonly string[][]}{
  if(statement.quantifier==='question')return {value:'question',sufficient:[[]]};
  const population=statement.scope?data.filter(d=>statement.scope!.includes(d.id)):data;
  const relevant=statement.quantifier==='one'?population.filter(d=>d.id===statement.subject):population;
  const success=relevant.filter(d=>!statement.condition||!logicPredicate(d.value,statement.condition)||logicPredicate(d.value,statement.predicate));
  // For a bare predicate there is no implication antecedent.
  const good=statement.condition?success:relevant.filter(d=>logicPredicate(d.value,statement.predicate));
  const bad=relevant.filter(d=>!good.includes(d));
  if(statement.quantifier==='one')return relevant.length===1?{value:good.length?'true':'false',sufficient:[[relevant[0]!.id]]}:{value:'unknown',sufficient:[[]]};
  if(statement.quantifier==='all')return bad.length?{value:'false',sufficient:bad.map(d=>[d.id])}:statement.complete?{value:'true',sufficient:[relevant.map(d=>d.id)]}:{value:'unknown',sufficient:[[]]};
  return good.length?{value:'true',sufficient:good.map(d=>[d.id])}:statement.complete?{value:'false',sufficient:[relevant.map(d=>d.id)]}:{value:'unknown',sufficient:[[]]};
}
export function enumerateLogicCombinations(task:Extract<LogicWorkshopTask,{mode:'combinations'}>):string[][] {
  let rows:string[][]=[[]];
  for(const factor of task.factors)rows=rows.flatMap(row=>factor.options.map(o=>[...row,o.id]));
  return rows.filter(row=>!task.forbidden.some(pattern=>pattern.every((id,i)=>id==='*'||row[i]===id)));
}
/** Tiny arithmetic grammar: integers, x, parentheses, +, -, *. No eval or executable input. */
export function evaluateLogicExpression(source:unknown,x:number):number|undefined {
  if(typeof source!=='string'||source.length>100||!Number.isSafeInteger(x))return;
  const text=source.replace(/\s/g,'').replace(/×/g,'*').replace(/−/g,'-');
  if(!text||!/^[0-9x()+*\-]+$/.test(text))return;
  let at=0,budget=64;
  const primary=(depth:number):number=>{
    if(--budget<0||depth>12)throw Error('bound');
    if(text[at]==='-'){at++;return -primary(depth+1);}
    if(text[at]==='x'){at++;return x;}
    if(text[at]==='('){at++;const n=sum(depth+1);if(text[at++]!==')')throw Error('paren');return n;}
    const digits=text.slice(at).match(/^\d{1,6}/)?.[0];if(!digits)throw Error('number');at+=digits.length;return Number(digits);
  };
  const product=(depth:number):number=>{let n=primary(depth);while(text[at]==='*'){at++;n*=primary(depth);if(!int(n))throw Error('range');}return n;};
  const sum=(depth:number):number=>{let n=product(depth);while(text[at]==='+'||text[at]==='-'){const op=text[at++];n+=(op==='+'?1:-1)*product(depth);if(!int(n))throw Error('range');}return n;};
  try {const n=sum(0);return at===text.length&&int(n)?n:undefined;}catch{return;}
}
export function evaluateLogicProof(task:Extract<LogicWorkshopTask,{mode:'proof'}>,steps:unknown):boolean {
  if(!dense(steps,24)||!steps.length||new Set(steps).size!==steps.length)return false;
  const known=new Set(task.assumptions);
  for(const id of steps){const rule=task.rules.find(r=>r.id===id);if(!rule||!rule.premises.every(p=>known.has(p))||known.has(rule.conclusion))return false;known.add(rule.conclusion);}
  return known.has(task.goal);
}
export function checkLogicStructure(task:LogicWorkshopTask,answer:LogicWorkshopResponse):LogicVerdict {
  if(!record(answer)||answer.kind!==kind||answer.mode!==task.mode)return fail('Rakenna tämän työpajan oma vastaus.');
  if(task.mode==='cause'&&answer.mode==='cause'){
    if(!validTroughObservation(task,answer))return fail('Lukitse oma ennuste ja tee koe. Ennusteen ei tarvitse osua oikeaan.');
    if(answer.settings.direction!==task.target||answer.settings.release!==task.baseline.release)return fail('Vaihda vain kourun suunta. Pidä lähtökorkeus tai virtaus ennallaan.');
    return answer.changed==='direction'&&answer.held==='release'&&answer.conclusion===answer.observed!.side?{ok:true}:fail('Nimeä muutettu tekijä, vakiona pidetty asia ja havaittu määränpää.');
  }
  if(task.mode==='perspective'&&answer.mode==='perspective'){
    const index=task.objects.findIndex(o=>o.id===task.target),other=task.start==='shore'?task.objects.length-1-index:index;
    return sameSet(answer.seen,['shore','water'])&&answer.position===other&&answer.stable==='identity'&&answer.change==='left-right'?{ok:true}:fail('Katso molemmat nimetyt näkymät. Kohteet pysyvät samoina, mutta vasen ja oikea riippuvat katsojasta.');
  }
  if(task.mode==='question'&&answer.mode==='question'){
    const q=task.quantities.find(q=>q.id===answer.quantity);
    if(!q||!dense(answer.subjects,4)||new Set(answer.subjects).size!==answer.subjects.length||!answer.subjects.every(id=>task.subjects.some(s=>s.id===id&&s.quantities.includes(q.id))))return fail('Valitse kysymykseen sopivat kohteet ja tutkittava määrä.');
    const valid=answer.verb==='compare'?answer.subjects.length===2:answer.verb===q.method&&answer.subjects.length===1;
    return valid&&answer.method===q.method?{ok:true}:fail('Muodosta kokonainen kysymys. Vertailu tarvitsee kaksi kohdetta; lukumäärä lasketaan ja pituus tai aika mitataan.');
  }
  if(['conclusion','argument','truth'].includes(task.mode)&&['conclusion','argument','truth'].includes(answer.mode)){
    const t=task as Extract<LogicWorkshopTask,{mode:'conclusion'|'argument'|'truth'}>,a=answer as Extract<LogicWorkshopResponse,{mode:'conclusion'|'argument'|'truth'}>;
    if(!dense(a.judgements,8)||a.judgements.length!==t.statements.length)return fail('Käsittele jokainen väite ja sen havaintotuki.');
    for(let i=0;i<t.statements.length;i++){
      const rows=a.judgements.filter(j=>record(j)&&j.statement===i),wanted=evaluateLogicStatement(t.data,t.statements[i]!);
      if(rows.length!==1||rows[0]!.value!==wanted.value||!wanted.sufficient.some(ids=>sameSet(rows[0]!.witnesses,ids)))return fail('Yksi vastaesimerkki kumoaa kaikki-väitteen. Yksi onnistunut tapaus ei todista sitä. Rajaa päätelmä annettuihin havaintoihin.');
    }
    return {ok:true};
  }
  if(task.mode==='combinations'&&answer.mode==='combinations'){
    const rows=enumerateLogicCombinations(task),signature=(row:readonly string[])=>JSON.stringify(row);
    if(!dense(answer.rows,64)||answer.rows.some(row=>!dense(row,4)||row.length!==task.factors.length))return fail('Rakenna jokainen yhdistelmä omalle rivilleen.');
    return sameSet(answer.rows.map(signature),rows.map(signature))?{ok:true}:fail('Tarkista jokainen valintahaara. Sama yhdistelmä tulee vain kerran, ja kielletyt yhdistelmät jätetään pois.');
  }
  if(task.mode==='rule'&&answer.mode==='rule'){
    if(task.threshold!==undefined&&!int(answer.threshold,0,task.domainMax))return fail('Ilmoita ehdon raja.');
    const value=(x:number)=>evaluateLogicExpression(task.threshold!==undefined&&x>answer.threshold?answer.aboveExpression:answer.expression,x);
    for(let x=0;x<=task.domainMax;x++)if(value(x)!==task.factor*x+(task.threshold!==undefined&&x>task.threshold?task.aboveOffset!:task.offset))return fail('Säännön on toimittava koko annetulla kokonaislukualueella. Tarkista myös nolla ja ehtorajan molemmat puolet.');
    return answer.output===value(task.input)?{ok:true}:fail('Sovella omaa sääntöäsi uuteen syötteeseen.');
  }
  if(task.mode==='proof'&&answer.mode==='proof')return evaluateLogicProof(task,answer.steps)&&answer.steps.includes(answer.explainedStep)?{ok:true}:fail('Jokainen syy saa käyttää vain oletuksia tai aiemmin johdettuja tietoja. Johtopäätös ei saa perustella itseään. Valitse selitettävä välivaihe.');
  if(task.mode==='reading'&&answer.mode==='reading')return record(answer.roles)&&Object.entries(task.roles).every(([role,id])=>own(answer.roles,role)&&answer.roles[role]===id)&&answer.relation===task.relation?{ok:true}:fail('Erota annettu tieto, kysytty asia ja koko ehtolause. Tässä ei tarvitse ratkaista laskua.');
  if(task.mode==='writing'&&answer.mode==='writing')return answer.result===(task.operation==='groups'?task.amount*task.factor:task.amount/task.factor)&&answer.unit===task.unit?{ok:true}:fail('Liitä omaan tekstiisi määrä ja sen yksikkö sekä tilanteen oikea suhde.');
  return fail('Täydennä oma vastaus.');
}
export function checkLogicWorkshop(task:LogicWorkshopTask,answer:LogicWorkshopResponse):LogicVerdict {
  if(!record(answer))return fail('Anna tämän tehtävän oma vastaus.');
  const structure=checkLogicStructure(task,answer);
  if(!task.review)return structure;
  const r=answer?.review;
  if(!record(r)||r.channel!==task.review.channel||r.produced!==true||r.confirmedByAdult!==true||!['none','helped'].includes(r.assistance)||!record(r.observations)
    ||!sameSet(Object.keys(r.observations),task.review.rubric.map(c=>c.id))||!task.review.rubric.every(c=>['met','not-yet'].includes(r.observations[c.id]??'')))return {...structure,ok:false,pendingReview:true,why:structure.ok?'Oma perustelu odottaa aikuisen havaintoa.':structure.why};
  const origin={observedByAdult:true as const,...(r.assistance==='helped'?{assisted:true as const}:{})};
  if(!structure.ok)return {...structure,...origin};
  return task.review.rubric.every(c=>r.observations[c.id]==='met')?{ok:true,...origin}:{ok:false,...origin,why:'Harjoitellaan vielä perustelun merkittyä kohtaa.'};
}
export function solutionLogicWorkshop(task:LogicWorkshopTask):LogicWorkshopResponse {
  if(task.mode==='cause'){const settings={...task.baseline,direction:task.target};return {kind,mode:task.mode,prediction:task.target,locked:true,settings,observed:runLogicTrough(task,settings),changed:'direction',held:'release',conclusion:task.target};}
  if(task.mode==='perspective'){const index=task.objects.findIndex(o=>o.id===task.target);return {kind,mode:task.mode,view:task.start==='shore'?'water':'shore',seen:['shore','water'],position:task.start==='shore'?task.objects.length-1-index:index,stable:'identity',change:'left-right'};}
  if(task.mode==='question'){const subject=task.subjects[0]!,q=task.quantities.find(q=>subject.quantities.includes(q.id))!;return {kind,mode:task.mode,verb:q.method,quantity:q.id,subjects:[subject.id],method:q.method};}
  if(task.mode==='conclusion'||task.mode==='argument'||task.mode==='truth')return {kind,mode:task.mode,judgements:task.statements.map((s,i)=>{const e=evaluateLogicStatement(task.data,s);return {statement:i,value:e.value,witnesses:e.sufficient[0]!};})};
  if(task.mode==='combinations')return {kind,mode:task.mode,rows:enumerateLogicCombinations(task)};
  if(task.mode==='rule')return {kind,mode:task.mode,expression:`${task.factor}*x+${task.offset}`,aboveExpression:`${task.factor}*x+${task.aboveOffset??task.offset}`,threshold:task.threshold??0,output:task.factor*task.input+(task.threshold!==undefined&&task.input>task.threshold?task.aboveOffset!:task.offset)};
  if(task.mode==='proof'){
    const known=new Set(task.assumptions),steps:string[]=[];
    for(let round=0;round<task.rules.length&&!known.has(task.goal);round++)for(const rule of task.rules)if(!known.has(rule.conclusion)&&rule.premises.every(p=>known.has(p))){known.add(rule.conclusion);steps.push(rule.id);}
    return {kind,mode:task.mode,steps,explainedStep:steps[0]??''};
  }
  if(task.mode==='reading')return {kind,mode:task.mode,roles:{...task.roles},relation:task.relation};
  if(task.mode==='writing')return {kind,mode:'writing',result:task.operation==='groups'?task.amount*task.factor:task.amount/task.factor,unit:task.unit};
  throw new Error('Unsupported logic task mode');
}
export function wrongLogicWorkshopResponses(task:LogicWorkshopTask):LogicWorkshopResponse[]{
  const r=solutionLogicWorkshop(task);
  if(r.mode==='cause')return [{...r,locked:false},{...r,changed:'colour'}];
  if(r.mode==='perspective')return [{...r,seen:[]},{...r,stable:'position'}];
  if(r.mode==='question')return [{...r,subjects:[]},{...r,method:'guess'}];
  if(r.mode==='combinations')return [{...r,rows:r.rows.slice(1)},{...r,rows:[...r.rows,r.rows[0]!]}];
  if(r.mode==='rule')return [{...r,expression:'x/'},{...r,output:r.output+1}];
  if(r.mode==='proof')return [{...r,steps:[]},{...r,explainedStep:'missing'}];
  if(r.mode==='reading')return [{...r,roles:{}},{...r,relation:'guess'}];
  if(r.mode==='writing')return [{...r,result:r.result+1},{...r,unit:'none'}];
  return [{...r,judgements:[]},{...r,judgements:r.judgements.map(j=>({...j,value:'guess'}))}];
}
export type LogicWorkshopScene=({mode:'cause';apparatus:'water'|'dry';direction:Side;release:number;length:number;observation?:TroughObservation}|{mode:'perspective';objects:Perspective['objects'];view:'shore'|'water';blocks:boolean})&{kind:'logic-workshop';title:string};
export function logicWorkshopScene(task:LogicWorkshopTask,answer?:LogicWorkshopResponse):LogicWorkshopScene|undefined {
  if(answer&&(!record(answer)||answer.kind!==kind))answer=undefined;
  if(task.mode==='cause'){
    const a=answer?.mode==='cause'?answer:undefined,o=a?validTroughObservation(task,a):undefined;
    const settings=a?.locked===true&&runLogicTrough(task,a.settings)?a.settings:task.baseline;
    return {kind,title:task.title,mode:'cause',apparatus:task.apparatus,direction:settings.direction,release:settings.release,length:task.length,...(o?{observation:o}:{})};
  }
  if(task.mode==='perspective')return {kind,title:task.title,mode:'perspective',objects:task.objects,view:answer?.mode==='perspective'&&['shore','water'].includes(answer.view)?answer.view:task.start,blocks:task.blocks};
  return undefined;
}
