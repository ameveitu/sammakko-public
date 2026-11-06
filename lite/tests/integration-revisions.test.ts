import {describe,expect,it} from 'vitest';
import {decimalLedgerSpec} from '../src/content/decimal-ledger';
import {decimalWorkshopSpecs} from '../src/content/decimal-workshop';
import {integrationExplanationSpecs} from '../src/content/integration-explanations';
import {expeditionSliceSpecs} from '../src/content/expedition-slice';
import {EXPEDITION_NODES,EXPEDITION_EVIDENCE} from '../src/content/expedition';
import {checkDecimalLedger,type DecimalLedgerTask,type DecimalLedgerResponse} from '../src/content/models/decimal-ledger';
import {checkObservedExplanation,type ObservedExplanationTask,type ObservedExplanationResponse} from '../src/content/models/observed-explanations';
import {rng} from '../src/engine/rng';
import {createJourney} from '../src/engine/journey';

function balances(task:DecimalLedgerTask):string[]{
  let value=BigInt(task.startHundredths);
  return task.changes.map(c=>{value+=BigInt(c.hundredths)*(c.direction==='+'?1n:-1n);return `${value}/100`;});
}
const adult=(task:ObservedExplanationTask,channel:'spoken'|'written'):ObservedExplanationResponse=>({kind:'observed-explanation',channel,...(channel==='written'?{text:'Oma tapauskohtainen selitys aikuiselle.'}:{}),observations:Object.fromEntries(task.rubric.map(c=>[c.id,'met'])),confirmedByAdult:true,assistance:'none'});

describe('four integration revisions require the missing original production',()=>{
  it('checks both successive decimal balances against integer arithmetic, including swapped operation order',()=>{
    const families=new Set<string>();let count=0;
    for(const phase of ['guided','independent','transfer','retrieval'] as const)for(let seed=0;seed<192;seed++){
      const q=decimalLedgerSpec.item(rng(seed),phase);if(q.task.kind!=='decimal-ledger')throw Error('ledger task');
      families.add(q.tag);const answer:DecimalLedgerResponse={kind:'decimal-ledger',balances:balances(q.task)};
      expect(checkDecimalLedger(q.task,answer).ok).toBe(true);
      expect(q.task.changes.map(c=>c.direction).sort()).toEqual(['+','−']);
      expect(q.task.unit).toBe(phase==='transfer'?'m':'l');
      expect(checkDecimalLedger(q.task,{...answer,balances:['',answer.balances[1]!]}).ok).toBe(false);
      expect(checkDecimalLedger(q.task,{...answer,balances:['999/100',answer.balances[1]!]}).ok).toBe(false);
      expect(checkDecimalLedger(q.task,{...answer,balances:[answer.balances[0]!,'999/100']}).ok).toBe(false);count++;
    }
    expect(count).toBe(768);expect(families).toEqual(new Set(['ledger-in-out','ledger-out-in','transfer']));
  });
  it('does not execute hidden ledger getters or serializers',()=>{
    const q=decimalLedgerSpec.item(rng(2),'independent');if(q.task.kind!=='decimal-ledger')throw Error('ledger');
    let called=0;const values=balances(q.task);Object.defineProperty(values,'toJSON',{value:()=>{called++;return [];}});
    expect(checkDecimalLedger(q.task,{kind:'decimal-ledger',balances:values}).ok).toBe(false);
    const response={kind:'decimal-ledger',get balances(){called++;return balances(q.task as DecimalLedgerTask);}} as DecimalLedgerResponse;
    expect(checkDecimalLedger(q.task,response).ok).toBe(false);expect(called).toBe(0);
  });
  it('requires a fresh human judgment for either channel across every authored science family',()=>{
    let count=0;
    for(const spec of integrationExplanationSpecs){
      const families=new Set<string>();
      for(const phase of ['independent','transfer'] as const)for(let seed=0;seed<128;seed++){
        const q=spec.item(rng(seed),phase);families.add(q.tag);if(q.task.kind!=='observed-explanation')throw Error('own explanation');
        const task=q.task;expect(task.allowEitherChannel).toBe(true);
        for(const channel of ['spoken','written'] as const){
          const response=adult(task,channel);
          expect(checkObservedExplanation(task,response)).toEqual({ok:true,observedByAdult:true});
          expect(checkObservedExplanation(task,{...response,confirmedByAdult:false}).pendingReview).toBe(true);
          expect(checkObservedExplanation(task,{...response,observations:{}}).pendingReview).toBe(true);
          expect(checkObservedExplanation(task,{...response,assistance:'helped'})).toMatchObject({ok:true,assisted:true});
          expect(checkObservedExplanation(task,{...response,observations:{...response.observations,[task.rubric[0]!.id]:'not-yet'}})).toMatchObject({ok:false,observedByAdult:true});
        }count++;
      }
      expect(families).toEqual(new Set([...EXPEDITION_EVIDENCE[spec.id]!.families,'transfer']));
      expect(spec.produce).toEqual(EXPEDITION_EVIDENCE[spec.id]!.families);
    }expect(count).toBe(768);
  });
  it('preserves all previous attempts without using v1 recognition as v2 original production',()=>{
    for(const spec of [...integrationExplanationSpecs,decimalLedgerSpec]){
      const prior=[...expeditionSliceSpecs,...decimalWorkshopSpecs].find(s=>s.id===spec.id)!;
      expect(EXPEDITION_NODES[spec.id]).toBe(spec);expect(spec.validRevs).toEqual([spec.rev]);expect(spec.rev).not.toBe(prior.rev);
      const journey=createJourney(null);
      for(let i=0;i<4;i++)journey.record({node:spec.id,at:i+1,ok:true,phase:i===3?'transfer':'independent',tag:i===3?'transfer':`old-${i}`,seed:i,rev:prior.rev});
      const history=journey.get().attempts;
      expect(journey.state(spec.id,prior).checked).toBe(true);
      expect(journey.state(spec.id,spec).checked).toBe(false);
      expect(journey.observation(spec.id,spec,EXPEDITION_EVIDENCE[spec.id]!.families).streak).toBe(0);
      expect(journey.get().attempts).toEqual(history);
    }
  });
  it('shows both named day/night sites and scopes the fire plan to an explicitly safe route',()=>{
    for(const spec of integrationExplanationSpecs)for(let seed=0;seed<128;seed++){
      const q=spec.item(rng(seed),'independent');if(q.task.kind!=='observed-explanation')throw Error('explanation');
      if(q.sceneModel?.kind==='space'&&q.sceneModel.mode==='day')expect(q.sceneModel.sites).toBe(2);
      if(q.sceneModel?.kind==='fire-safety'&&q.sceneModel.view==='conditions'){
        expect(q.task.prompt).toContain('annetussa retkikatostilanteessa');expect(q.task.model).toContain('savutonta laituripolkua');expect(q.task.model).toContain('112');
      }
    }
  });
});
