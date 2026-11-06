import type { LogicWorkshopTask,LogicWorkshopResponse,LogicPredicate } from '../src/content/models/logic-workshop';

/** Independent test construction from givens; never imports the production solution or inference helpers. */
export function independentlyAnswerLogic(t:LogicWorkshopTask):LogicWorkshopResponse{
  const kind='logic-workshop' as const;
  let answer:LogicWorkshopResponse;
  if(t.mode==='cause'){
    const release=t.baseline.release,seconds=t.apparatus==='water'?t.length/(.5+release/4):(2*t.length/(9.81*release/10))**.5;
    answer={kind,mode:'cause',prediction:t.baseline.direction,locked:true,settings:{direction:t.target,release},observed:{side:t.target,durationMs:Math.round(seconds*1000)},changed:'direction',held:'release',conclusion:t.target};
  }else if(t.mode==='perspective'){
    const points=t.objects.map((o,i)=>({id:o.id,x:i})),other=t.start==='shore'?[...points].sort((a,b)=>b.x-a.x):points;
    answer={kind,mode:t.mode,view:t.start==='shore'?'water':'shore',seen:['shore','water'],position:other.findIndex(p=>p.id===t.target),stable:'identity',change:'left-right'};
  }else if(t.mode==='question'){
    const s=t.subjects[t.subjects.length-1]!,q=t.quantities.find(q=>s.quantities.includes(q.id))!;
    answer={kind,mode:t.mode,verb:q.method,quantity:q.id,subjects:[s.id],method:q.method};
  }else if(t.mode==='conclusion'||t.mode==='argument'||t.mode==='truth'){
    const predicate=(n:number,p:LogicPredicate)=>({ge:()=>n-p.value>=0,le:()=>p.value-n>=0,eq:()=>n-p.value===0,multiple:()=>Number.isInteger(n/p.value)})[p.op]();
    answer={kind,mode:t.mode,judgements:t.statements.map((s,statement)=>{
      const rows=t.data.filter(d=>(!s.scope||s.scope.includes(d.id))&&(s.quantifier!=='one'||s.subject===d.id));
      const truth=rows.map(d=>({id:d.id,ok:(s.condition&&!predicate(d.value,s.condition))||predicate(d.value,s.predicate)}));
      const yes=truth.filter(x=>x.ok),no=truth.filter(x=>!x.ok);
      if(s.quantifier==='question')return {statement,value:'question',witnesses:[]};
      if(s.quantifier==='one')return {statement,value:truth.length?truth[0]!.ok?'true':'false':'unknown',witnesses:truth.map(x=>x.id)};
      if(s.quantifier==='all')return no.length?{statement,value:'false',witnesses:[no.at(-1)!.id]}:s.complete?{statement,value:'true',witnesses:truth.map(x=>x.id).reverse()}:{statement,value:'unknown',witnesses:[]};
      return yes.length?{statement,value:'true',witnesses:[yes.at(-1)!.id]}:s.complete?{statement,value:'false',witnesses:truth.map(x=>x.id)}:{statement,value:'unknown',witnesses:[]};
    })};
  }else if(t.mode==='combinations'){
    const rows:string[][]=[];
    for(const b of t.factors[1]!.options)for(const a of t.factors[0]!.options){
      const pair=[a.id,b.id];if(!t.forbidden.some(f=>f.every((v,i)=>v==='*'||pair[i]===v)))rows.unshift(pair);
    }
    answer={kind,mode:t.mode,rows};
  }else if(t.mode==='rule'){
    // Repeated addition is intentionally different from the production multiplicative solution.
    const expression=(offset:number)=>`(${Array(t.factor).fill('x').join('+')})+${offset}`;
    answer={kind,mode:t.mode,expression:expression(t.offset),aboveExpression:expression(t.aboveOffset??t.offset),threshold:t.threshold??0,
      output:Array(t.factor).fill(t.input).reduce((a:number,b:number)=>a+b,0)+(t.threshold!==undefined&&t.input>t.threshold?t.aboveOffset!:t.offset)};
  }else if(t.mode==='proof'){
    const queue=[{known:new Set(t.assumptions),steps:[] as string[]}];let steps:string[]|undefined;
    while(queue.length){
      const current=queue.shift()!;if(current.known.has(t.goal)){steps=current.steps;break;}
      for(const rule of [...t.rules].reverse())if(!current.known.has(rule.conclusion)&&rule.premises.every(p=>current.known.has(p)))queue.push({known:new Set([...current.known,rule.conclusion]),steps:[...current.steps,rule.id]});
    }
    if(!steps)throw Error('No independent proof');
    answer={kind,mode:t.mode,steps,explainedStep:steps.at(-1)!};
  }else if(t.mode==='reading'){
    const given=t.pieces.find(p=>p.label.startsWith('Korissa'))!,target=t.pieces.find(p=>p.label.endsWith('?'))!,condition=t.pieces.find(p=>p!==given&&p!==target)!;
    const relation=condition.label.includes('vähintään')?'ge':condition.label.includes('enintään')?'le':condition.label.includes('kaksinkertainen')?'double':'difference';
    answer={kind,mode:t.mode,roles:{given:given.id,target:target.id,condition:condition.id},relation};
  }else if(t.mode==='writing'){
    let result=0;if(t.operation==='groups')for(let i=0;i<t.factor;i++)result+=t.amount;else for(let left=t.amount;left>0;left-=t.factor)result++;
    answer={kind,mode:t.mode,result,unit:t.unit};
  }else throw Error('Unsupported fixture');
  return t.review?{...answer,review:{channel:t.review.channel,produced:true,confirmedByAdult:true,assistance:'none',observations:Object.fromEntries(t.review.rubric.map(c=>[c.id,'met']))}}:answer;
}
