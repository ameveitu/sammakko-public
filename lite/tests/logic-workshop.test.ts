import {describe,it,expect} from 'vitest';
import {rng} from '../src/engine/rng';
import {logicWorkshopSpecs} from '../src/content/logic-workshop';
import {checkLogicWorkshop,checkLogicStructure,evaluateLogicExpression,evaluateLogicProof,evaluateLogicStatement,logicWorkshopScene,solutionLogicWorkshop,wrongLogicWorkshopResponses,type LogicWorkshopTask,type LogicWorkshopResponse} from '../src/content/models/logic-workshop';
import {independentlyAnswerLogic} from './logic-workshop-fixtures';

describe('reasoning workshop from independently constructed evidence',()=>{
  it('accepts own constructions across all 11 nodes, both families and transfer',()=>{
    expect(logicWorkshopSpecs).toHaveLength(11);
    for(const spec of logicWorkshopSpecs){
      const families=new Set<string>(),situations=new Set<string>();
      for(const phase of ['independent','transfer'] as const)for(let seed=0;seed<96;seed++){
        const item=spec.item(rng(seed),phase),t=item.task as LogicWorkshopTask,a=independentlyAnswerLogic(t);
        expect(checkLogicWorkshop(t,a),`${spec.id}/${phase}/${seed}`).toMatchObject({ok:true});
        expect(checkLogicStructure(t,solutionLogicWorkshop(t)).ok).toBe(true);
        for(const wrong of wrongLogicWorkshopResponses(t))expect(checkLogicWorkshop(t,wrong).ok).toBe(false);
        if(phase==='independent'){families.add(item.tag);situations.add(JSON.stringify(t));}
        if(t.review){
          expect(checkLogicWorkshop(t,{...a,review:undefined}).pendingReview).toBe(true);
          expect(checkLogicWorkshop(t,{...a,review:{...a.review!,assistance:'helped'}})).toMatchObject({ok:true,observedByAdult:true,assisted:true});
          expect(checkLogicWorkshop(t,{...a,review:{...a.review!,observations:Object.create(a.review!.observations)}}).pendingReview).toBe(true);
          expect(checkLogicWorkshop(t,{...a,review:{...a.review!,produced:false}}).ok).toBe(false);
        }
      }
      expect(families,spec.id).toEqual(new Set(spec.produce));expect(situations.size,spec.id).toBeGreaterThanOrEqual(8);
    }
  });
  it('accepts an initially wrong prediction but rejects forged observations and uncontrolled contrasts',()=>{
    const t=logicWorkshopSpecs[0]!.item(rng(3),'independent').task as Extract<LogicWorkshopTask,{mode:'cause'}>,a=independentlyAnswerLogic(t) as Extract<LogicWorkshopResponse,{mode:'cause'}>;
    expect(a.prediction).not.toBe(t.target);expect(checkLogicWorkshop(t,a).ok).toBe(true);
    expect(checkLogicWorkshop(t,{...a,settings:{...a.settings,release:a.settings.release%4+1}}).ok).toBe(false);
    expect(logicWorkshopScene(t,{...a,locked:false})).not.toHaveProperty('observation');
    expect(logicWorkshopScene(t,{...a,locked:1 as unknown as boolean})).not.toHaveProperty('observation');
    expect(logicWorkshopScene(t,{...a,observed:{side:t.target,durationMs:1}})).not.toHaveProperty('observation');
    expect(logicWorkshopScene(t,a)).toHaveProperty('observation',a.observed);
  });
  it('distinguishes one counterexample, universal evidence, unknown scope and a question',()=>{
    const data=[{id:'a',label:'A',value:3},{id:'b',label:'B',value:4},{id:'c',label:'C',value:5}];
    const all={label:'all',quantifier:'all' as const,predicate:{op:'ge' as const,value:3},complete:true};
    expect(evaluateLogicStatement(data,all)).toEqual({value:'true',sufficient:[['a','b','c']]});
    expect(evaluateLogicStatement(data,{...all,predicate:{op:'ge',value:4}})).toEqual({value:'false',sufficient:[['a']]});
    expect(evaluateLogicStatement(data,{...all,complete:false})).toEqual({value:'unknown',sufficient:[[]]});
    expect(evaluateLogicStatement(data,{...all,scope:[],complete:false})).toEqual({value:'unknown',sufficient:[[]]});
    expect(evaluateLogicStatement(data,{...all,quantifier:'question'})).toEqual({value:'question',sufficient:[[]]});
    const t:LogicWorkshopTask={kind:'logic-workshop',mode:'truth',title:'',data,statements:[all],sceneText:''};
    expect(checkLogicWorkshop(t,{kind:'logic-workshop',mode:'truth',judgements:[{statement:0,value:'true',witnesses:['a']}]}).ok).toBe(false);
  });
  it('accepts both topological orders and an alternate proof, and rejects circular or repeated steps',()=>{
    const spec=logicWorkshopSpecs.find(s=>s.id==='M79-PROOF-01')!;
    const t=spec.item(rng(2),'independent').task as Extract<LogicWorkshopTask,{mode:'proof'}>;
    expect(evaluateLogicProof(t,['span','holds','join'])).toBe(true);
    expect(evaluateLogicProof(t,['holds','span','join'])).toBe(true);
    expect(evaluateLogicProof(t,['circle','holds','join'])).toBe(false);
    expect(evaluateLogicProof(t,['join'])).toBe(false);expect(evaluateLogicProof(t,['span','span','holds','join'])).toBe(false);
    const other={...t,rules:[...t.rules,{id:'both',label:'both',premises:['length','load'],conclusion:'g'}]};
    expect(evaluateLogicProof(other,['both'])).toBe(true);
    const n=spec.item(rng(4),'transfer').task as Extract<LogicWorkshopTask,{mode:'proof'}>;
    expect(evaluateLogicProof(n,['closure','add','factor','definition'])).toBe(true);
    expect(evaluateLogicProof(n,['add','factor','closure','definition'])).toBe(true);
    expect(evaluateLogicProof(n,['add','circle','definition'])).toBe(false);
  });
  it('accepts mathematically equivalent expressions while rejecting malformed or unbounded input',()=>{
    for(let a=-4;a<=6;a++)for(let b=-4;b<=6;b++)for(let x=0;x<=9;x++)expect(evaluateLogicExpression(`(${a})*x+(${b})`,x)).toBe(a*x+b);
    for(const source of ['x/0','alert(1)','x**2','2x','()','x+','1e2','('.repeat(30)+'x'+')'.repeat(30),'999999*999999'])expect(evaluateLogicExpression(source,2),source).toBeUndefined();
    const t:LogicWorkshopTask={kind:'logic-workshop',mode:'rule',title:'',factor:2,offset:3,threshold:4,aboveOffset:5,domainMax:9,input:8,unit:'lyhtyä'};
    const a:LogicWorkshopResponse={kind:'logic-workshop',mode:'rule',expression:'x+x+3',aboveExpression:'(x+2)*2+1',threshold:4,output:21};
    expect(checkLogicWorkshop(t,a).ok).toBe(true);expect(checkLogicWorkshop(t,{...a,threshold:5}).ok).toBe(false);
  });
  it('does not accept inherited, sparse, duplicated or accessor supplied learner evidence',()=>{
    for(const spec of logicWorkshopSpecs){const t=spec.item(rng(4),'independent').task as LogicWorkshopTask,a=independentlyAnswerLogic(t);expect(checkLogicWorkshop(t,Object.create(a)).ok).toBe(false);expect(()=>checkLogicWorkshop(t,Object.defineProperty({...a},'mode',{get(){throw Error('getter');}}))).not.toThrow();}
    const t=logicWorkshopSpecs.find(s=>s.id==='M79-COMB-01')!.item(rng(5),'independent').task as LogicWorkshopTask,a=independentlyAnswerLogic(t);
    if(a.mode!=='combinations')throw Error('comb');
    expect(checkLogicWorkshop(t,{...a,rows:new Array(a.rows.length)}).ok).toBe(false);
    expect(checkLogicWorkshop(t,{...a,rows:[...a.rows,a.rows[0]!]}).ok).toBe(false);
  });
});
