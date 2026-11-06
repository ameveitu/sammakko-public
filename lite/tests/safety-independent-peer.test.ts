import { describe, expect, it } from 'vitest';
import { rng } from '../src/engine/rng';
import { safetyHarborSpecs } from '../src/content/safety-harbor';
import { checkSafetyHarbor, type SafetyHarborTask, type SafetyHarborResponse, type SafetyConditions } from '../src/content/models/safety-harbor';
import { safePaths, safetyCaseOracle, safetyOracle } from './safety-independent-fixtures';

const tasks = () => safetyHarborSpecs.flatMap(s => Array.from({ length: 48 }, (_, seed) => (['independent','transfer'] as const).map(phase => s.item(rng(seed),phase).task as SafetyHarborTask)).flat());
describe('ROOT independent safety policy, graph, provenance and teaching evidence', () => {
  it('accepts all 1248 independent plans and rejects every omitted action and unsafe action', () => {
    let alternatives = 0, omissions = 0;
    for (const task of tasks()) {
      const answer = safetyOracle(task);
      expect(checkSafetyHarbor(task,answer), task.title).toMatchObject({ok:true});
      task.cases.forEach((c,index) => {
        const good = answer.answers[index]!;
        if (c.mode === 'evacuation' || c.mode === 'electric-path') for (const route of safePaths(c)) {
          const other = structuredClone(answer); other.answers = other.answers.map((a,i)=>i===index?safetyCaseOracle(task,c,route):a);
          expect(checkSafetyHarbor(task,other).ok).toBe(true); alternatives++;
        }
        if ('actions' in good) {
          good.actions.forEach((_, step) => {
            const bad=structuredClone(answer), own=bad.answers[index]!;
            if ('actions' in own) own.actions=own.actions.filter((_,i)=>i!==step);
            expect(checkSafetyHarbor(task,bad).ok, `${task.title}:${step}`).toBe(false); omissions++;
          });
          for (const action of ['touch','taste','mix','return-for-bag','repair-live'] as const) {
            const bad=structuredClone(answer), own=bad.answers[index]!;
            if ('actions' in own) own.actions=[...own.actions,{run:task.run,id:'unsafe-added',action}];
            expect(checkSafetyHarbor(task,bad).ok,action).toBe(false);
          }
        }
      });
    }
    expect(alternatives).toBeGreaterThan(500); expect(omissions).toBeGreaterThan(4000);
  });

  it('covers all 48 Boolean changes, prediction-before-observation and actual authored changes', () => {
    const base=safetyHarborSpecs.find(s=>s.id==='CHEM79-FIRE-CONDITIONS')!.item(rng(0),'independent').task as SafetyHarborTask;
    for(let mask=0;mask<8;mask++)for(const factor of ['fuel','heat','oxidizer'] as const)for(const available of [false,true]) {
      const c:SafetyConditions={id:'oracle-fire',mode:'fire-conditions',title:'Ehtomalli',facts:[],present:{fuel:!!(mask&1),heat:!!(mask&2),oxidizer:!!(mask&4)},change:{factor,available}};
      const task={...base,cases:[c]}, answer=safetyOracle(task);
      expect(checkSafetyHarbor(task,answer).ok).toBe(true);
      for(const key of ['locked','observed'] as const) {
        const bad=structuredClone(answer); const a=bad.answers[0]!;if(a.mode==='fire-conditions')a[key]=false;
        expect(checkSafetyHarbor(task,bad).ok).toBe(false);
      }
    }
    for(const task of tasks())for(const c of task.cases)if(c.mode==='fire-conditions')expect(c.present[c.change.factor],task.title).not.toBe(c.change.available);
  });

  it('rejects smoke, untravelled routes, wrong location and missing electrical return', () => {
    for (const task of tasks()) task.cases.forEach((c,index)=>{
      if(c.mode!=='evacuation'&&c.mode!=='electric-path')return;
      const answer=safetyOracle(task), bad=structuredClone(answer), a=bad.answers[index]!;
      if(a.mode==='evacuation'&&c.mode==='evacuation') {
        a.travelled=[];expect(checkSafetyHarbor(task,bad).ok).toBe(false);a.travelled=[...a.route];
        const old=a.actions;a.actions=a.actions.map(x=>x.action==='call-112'?{...x,place:'unvisited'}:x);
        expect(checkSafetyHarbor(task,bad).ok).toBe(false);a.actions=old;
        const smoke=c.nodes.find(n=>n.state==='smoke')!;a.route=[c.start,smoke.id,'meeting'];a.travelled=[...a.route];
        expect(checkSafetyHarbor(task,bad).ok).toBe(false);
      } else if(a.mode==='electric-path') { a.path=a.path.slice(0,-1);expect(checkSafetyHarbor(task,bad).ok).toBe(false); }
    });
  });

  it('requires adult judgment before an own explanation and retains helped provenance on a wrong plan', () => {
    let reviewed=0;
    for(const task of tasks().filter(t=>t.review)) {
      const written=safetyOracle(task);written.review!.channel='written';
      expect(checkSafetyHarbor(task,written)).toMatchObject({ok:true,observedByAdult:true});
      const a=safetyOracle(task);delete a.review;
      expect(checkSafetyHarbor(task,a)).toMatchObject({ok:false,pendingReview:true});
      const bad=safetyOracle(task);bad.review!.assistance='helped';bad.answers=[];
      expect(checkSafetyHarbor(task,bad)).toMatchObject({ok:false,observedByAdult:true,assisted:true});reviewed++;
    }
    expect(reviewed).toBe(384);
  });

  it('rejects stale runs, inherited answers and accessors without evaluating them', () => {
    const task=safetyHarborSpecs[0]!.item(rng(1),'independent').task as SafetyHarborTask;
    const answer=safetyOracle(task);let reads=0;
    const getter={kind:'safety-harbor',get answers(){reads++;return answer.answers;}};
    expect(checkSafetyHarbor(task,getter as SafetyHarborResponse).ok).toBe(false);expect(reads).toBe(0);
    expect(checkSafetyHarbor(task,Object.create(answer)).ok).toBe(false);
    const stale=structuredClone(answer), own=stale.answers[0]!;if('actions'in own)own.actions=own.actions.map(a=>({...a,run:'previous-run'}));
    expect(checkSafetyHarbor(task,stale).ok).toBe(false);
  });
});
