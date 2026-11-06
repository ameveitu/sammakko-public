/** Pure, non-persisting proposal. `knownChecked` must read independent checked evidence only. */
export type StaticGroup={all:readonly string[]}|{any:readonly string[]};
export type ReadinessStatus='ready'|'missing'|'unresolved';
export type Operation='add'|'subtract'|'multiply'|'divide';
export type ItemReadinessContext=
 | {kind:'element';route:'pure'|'atomic'|'either'}
 | {kind:'operation';operations:readonly Operation[];domain:'natural'|'integer'}
 | {kind:'fraction-methods';methods:readonly ('common-denominator'|'number-line'|'benchmark'|'supplied-half')[]}
 | {kind:'percent-methods';methods:readonly ('fraction'|'decimal'|'unit-percent'|'scaling')[];prerequisites?:Partial<Record<'fraction'|'decimal'|'unit-percent'|'scaling',readonly string[]>>}
 | {kind:'quantity';quantity:'length'|'mass'|'volume'|'time'}
 | {kind:'unit';unit:'length'|'mass'|'volume'|'time'}
 | {kind:'content';skills:readonly string[]}
 | {kind:'representations';skills:readonly string[]}
 | {kind:'links';linkIds:readonly ('multiply-add'|'fraction-divide'|'area-multiply'|'perimeter-multiply')[]}
 | {kind:'time-direction';operation:'multiply'|'divide'}
 | {kind:'clock-transfer';rolloverMinutes:60;operations:readonly ('add'|'subtract')[]}
 | {kind:'power-rules';rules:readonly ('product'|'quotient'|'power-of-power')[]}
 | {kind:'trig';ratio:'sin'|'cos'|'tan'}
 | {kind:'conversion';quantity:'length'|'mass'|'volume'|'time'|'linear'}
 | {kind:'conversions';quantities:readonly ('length'|'mass'|'volume'|'time'|'linear')[]}
 | {kind:'local-profile';profileGroup?:string;itemGroup?:string;allowedGroups?:readonly string[]};
const authoredContexts = new WeakMap<object, { nodeId: string; context: ItemReadinessContext }>();
/** Authoring metadata only. No enumerable properties, RNG calls, learner state or saved evidence. */
export function rememberItemReadiness(nodeId: string, task: object, context: ItemReadinessContext): void {
 authoredContexts.set(task, { nodeId, context: structuredClone(context) });
}
export function authoredItemReadiness(nodeId: string, task: object): ItemReadinessContext | undefined {
 const annotation = authoredContexts.get(task);
 return annotation?.nodeId === nodeId ? structuredClone(annotation.context) : undefined;
}
export interface RequirementAlternative {all:readonly string[];unresolved?:string}
export interface ReadinessPart {status:ReadinessStatus;alternatives:readonly RequirementAlternative[];groups?:readonly StaticGroup[];missing:readonly (readonly string[])[];reason?:string}
export interface ItemReadinessResult {diagnosticAvailable:boolean;static:ReadinessPart;dynamic:ReadinessPart;support:readonly string[]}
export interface ReadinessInput {nodeId:string;itemAvailable?:boolean;staticGroups:readonly StaticGroup[];context?:ItemReadinessContext;knownChecked:(id:string)=>boolean;dependencyGraph?:Readonly<Record<string,readonly string[]>>}
const ops:Record<'natural'|'integer',Record<Operation,string>>={natural:{add:'M-ADD-01',subtract:'M-SUB-01',multiply:'M-MUL-01',divide:'M-DIV-01'},integer:{add:'M79-INT-ADD',subtract:'M79-INT-SUB',multiply:'M79-INT-MUL',divide:'M79-INT-DIV'}};
const linkPairs={ 'multiply-add':['M-MUL-01','M-ADD-01'], 'fraction-divide':['M-FRAC-01','M-DIV-01'], 'area-multiply':['M-GMEAS-02','M-MUL-01'], 'perimeter-multiply':['M-GMEAS-01','M-MUL-01'] } as const;
const exprOps:Record<Operation,string>={add:'M-ADD-01',subtract:'M-SUB-01',multiply:'M-MUL-02',divide:'M-DIV-FACT-01'};
const quantities={length:'M-MEAS-02',mass:'M-MEAS-05',volume:'M-MEAS-08',time:'M-TIME-01'} as const;
const units={length:'M-MEAS-03',mass:'M-MEAS-06',volume:'M-MEAS-09',time:'M-TIME-03'} as const;
const conversions={length:'M-UNIT-02',mass:'M-UNIT-03',volume:'M-UNIT-04',time:'M-UNIT-05',linear:'M79-UNIT-LIN'} as const;
const power={product:'M79-POWER-PROD',quotient:'M79-POWER-QUOT','power-of-power':'M79-POWER-POWER'} as const;
const trig={sin:'M79-SIN',cos:'M79-COS',tan:'M79-TAN'} as const;
const unique=(ids:readonly string[])=>[...new Set(ids)];
const validIds=(ids:readonly string[],node:string)=>ids.length>0&&ids.every(id=>typeof id==='string'&&id.length>0&&id!==node);
function evaluate(alternatives:readonly RequirementAlternative[],known:(id:string)=>boolean):ReadinessPart {
 if(!alternatives.length)return {status:'unresolved',alternatives:[],missing:[],reason:'Tehtävän esitietoja ei ole määritetty.'};
 const missing=alternatives.map(a=>a.all.filter(id=>!known(id)));
 if(alternatives.some((a,i)=>!a.unresolved&&missing[i]!.length===0))return {status:'ready',alternatives,missing};
 if(alternatives.some(a=>!!a.unresolved))return {status:'unresolved',alternatives,missing,reason:'Yhden vaihtoehdon osaamisvaatimusta ei ole määritetty.'};
 return {status:'missing',alternatives,missing};
}
function cycleAt(root:string,graph:Readonly<Record<string,readonly string[]>>):boolean {
 const active=new Set<string>(),done=new Set<string>();
 function visit(n:string):boolean {if(active.has(n))return true;if(done.has(n))return false;active.add(n);for(const c of graph[n]??[])if(visit(c))return true;active.delete(n);done.add(n);return false;}
 return visit(root);
}
/** DNF requirements are AND within an alternative and OR between alternatives. */
function dynamicAlternatives(id:string,c?:ItemReadinessContext):RequirementAlternative[]|undefined {
 const all=(ids:readonly string[])=>validIds(ids,id)?[{all:unique(ids)}]:undefined;
 const any=(ids:readonly string[])=>validIds(ids,id)?unique(ids).map(skill=>({all:[skill]})):undefined;
 switch(id){
  case 'CHEM79-ELEMENT':if(c?.kind!=='element')return;return any(c.route==='pure'?['CHEM79-PURE-MIX']:c.route==='atomic'?['CHEM79-ATOM-01']:['CHEM79-PURE-MIX','CHEM79-ATOM-01']);
  // Proposal for the current generator's decomposition/compensation or written traces;
  // this is not a universal rule about every legitimate mental calculation.
  case 'M-CALC-STRAT':if(c?.kind!=='operation'||c.domain!=='natural'||c.operations.length!==1)return;{const op=c.operations[0]!,written={add:'M-WRADD',subtract:'M-WRSUB',multiply:'M-WRMUL',divide:'M-WRDIV'};return ops.natural[op]&&written[op]?[{all:['M-MENTAL-01',ops.natural[op]]},{all:[written[op]]}]:undefined;}
  case 'M-FRAC-09':if(c?.kind!=='fraction-methods'||!c.methods.length)return;return c.methods.map(method=>method==='common-denominator'?{all:['M-FRAC-07','M-FRAC-05']}:method==='number-line'?{all:['M-FRAC-04']}:method==='supplied-half'?{all:['M-FRAC-03']}:{all:[],unresolved:'Vertailuluvulle ei ole vielä erillistä vahvistettua osaamiskontekstia.'});
  case 'M-PCT-05':if(c?.kind!=='percent-methods'||!c.methods.length)return;return c.methods.map(method=>{
   const skills=c.prerequisites?.[method],base=method==='fraction'?'M-PCT-02':method==='decimal'?'M-PCT-03':null;
   // A conversion concept alone is not the actual calculation capability.
   if(!skills||!validIds(skills,id)||unique(skills).length<(base?2:1)||(base&&!skills.includes(base)))return {all:[],unresolved:`Menetelmän ${method} tarkka laskuvaatimus on vielä määrittämättä.`};
   return {all:unique(skills)};
  });
  case 'M-MEAS-12':return c?.kind==='quantity'&&quantities[c.quantity]?all([quantities[c.quantity]]):undefined;
  case 'M-MEAS-13':return c?.kind==='unit'&&units[c.unit]?all([units[c.unit]]):undefined;
  case 'M-REP-01':case 'M-REP-04':return c?.kind==='content'?all(c.skills):undefined;
  case 'M-REP-05':return c?.kind==='representations'&&c.skills.every(k=>['M-REP-01','M-REP-02','M-REP-03','M-REP-04'].includes(k))?any(c.skills):undefined;
  case 'M-TH-08':if(c?.kind!=='links'||!c.linkIds.length||!c.linkIds.every(link=>Object.hasOwn(linkPairs,link)))return;return all(c.linkIds.flatMap(link=>[...linkPairs[link]]));
  case 'M-EXPR-01':if(c?.kind!=='operation'||c.domain!=='natural'||!c.operations.length||c.operations.some(op=>!exprOps[op]))return;return all(c.operations.map(op=>exprOps[op]));
  case 'M79-EQ1-SOLVE':if(c?.kind!=='operation'||!c.operations.length||c.operations.some(op=>!ops[c.domain]?.[op]))return;return all(c.operations.map(op=>ops[c.domain][op]));
  case 'M-UNIT-05':if(c?.kind==='clock-transfer')return c.rolloverMinutes===60&&c.operations.length===2&&c.operations.includes('add')&&c.operations.includes('subtract')?all(['M-TIME-02',...c.operations.map(op=>ops.natural[op])]):undefined;return c?.kind==='time-direction'?all([ops.natural[c.operation]]):undefined;
  case 'M79-POWER-SIMPLIFY':return c?.kind==='power-rules'&&c.rules.length&&c.rules.every(r=>power[r])?all(c.rules.map(r=>power[r])):undefined;
  case 'M79-TRIG-ANGLE':case 'M79-TRIG-SIDE':return c?.kind==='trig'&&trig[c.ratio]?all([trig[c.ratio]]):undefined;
  case 'PHY79-UNIT-CONV':if(c?.kind==='conversions')return c.quantities.length&&c.quantities.every(q=>conversions[q])?all(c.quantities.map(q=>conversions[q])):undefined;return c?.kind==='conversion'&&conversions[c.quantity]?all([conversions[c.quantity]]):undefined;
  case 'CHEM79-ORG-GROUP':return c?.kind==='local-profile'&&typeof c.profileGroup==='string'&&c.profileGroup.trim()&&c.itemGroup===c.profileGroup&&c.allowedGroups?.includes(c.profileGroup)? [{all:[]}]:undefined;
  default:return;
 }
}
export function evaluateItemReadiness(input:ReadinessInput):ItemReadinessResult {
 const {nodeId,knownChecked}=input,invalidGraph=!!input.dependencyGraph&&cycleAt(nodeId,input.dependencyGraph);
 let staticPart:ReadinessPart;
 if(invalidGraph)staticPart={status:'unresolved',alternatives:[],missing:[],reason:'Pakollisten esitietojen riippuvuussykli.'};
 else if(input.staticGroups.some(g=>('all'in g?!validIds(g.all,nodeId):!validIds(g.any,nodeId))))staticPart={status:'unresolved',alternatives:[],missing:[],reason:'Virheellinen staattinen esitietoryhmä.'};
 else {const missing=input.staticGroups.map(g=>'all'in g?g.all.filter(k=>!knownChecked(k)):g.any.some(knownChecked)?[]:[...g.any]);staticPart={status:missing.some(x=>x.length)?'missing':'ready',alternatives:[],groups:input.staticGroups,missing};}
 const options=dynamicAlternatives(nodeId,input.context);
 const dynamic=options?evaluate(options,knownChecked):{status:'unresolved' as const,alternatives:[],missing:[],reason:'Tehtäväkohtainen konteksti tai sääntö puuttuu.'};
 const support=unique([...staticPart.missing.flat(),...dynamic.missing.flat()]);
 return {diagnosticAvailable:input.itemAvailable===true,static:staticPart,dynamic,support};
}
