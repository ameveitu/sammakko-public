import { describe,it,expect } from 'vitest';
import { EXPEDITION_NODES } from '../src/content/expedition';
import { rng } from '../src/engine/rng';
import { check,solution,wrongs } from '../src/engine/check';
import { checkedFamilyLessonSnapshot } from '../src/content/models/family-lesson-snapshot';
import type { Task,Response } from '../src/engine/types';

const ids=['M79-PYTH-CONVERSE','M79-QUAD-INCOMP-02','M79-SYSTEM-GRAPH','M79-COMB-01','CHEM79-BALANCE','CHEM79-CONC-CALC'];
function successful(task:Task):Response {
  const answer=solution(task);
  if(task.kind==='logic-workshop'&&task.review&&answer.kind==='logic-workshop')
    answer.review={channel:task.review.channel,produced:true,confirmedByAdult:true,assistance:'none',observations:Object.fromEntries(task.review.rubric.map(c=>[c.id,'met']))};
  return answer;
}
describe('checked family consequence projections',()=>{
  it('keeps all solution-set branches, exact chemical counts and retained solution mass in 576 cases',()=>{
    const roots=new Set<number>(),relations=new Set<string>(),classes=new Set<string>();
    for(const id of ids)for(const phase of ['independent','transfer'] as const)for(let seed=0;seed<48;seed++){
      const task=EXPEDITION_NODES[id]!.item(rng(seed),phase).task,answer=successful(task);
      expect(check(task,answer).ok,id).toBe(true);
      const model=checkedFamilyLessonSnapshot(id,task,answer)!;
      expect(model,id).toBeDefined();expect(model.nodeId).toBe(id);
      if(model.activity==='square-roots'){roots.add(model.roots.length);expect(model.roots.length).toBe(model.radicand<0?0:model.radicand===0?1:2);for(const root of model.roots)expect(root*root).toBeCloseTo(model.radicand,12);}
      if(model.activity==='system-graph'){relations.add(model.relation);const [a,b]=model.equations;const det=a![0]!*b![1]!-a![1]!*b![0]!;if(model.relation==='one'){expect(det).not.toBe(0);for(const [x,y]of model.points)for(const [a,b,c]of model.equations)expect(a!*x!+b!*y!).toBeCloseTo(c!,10);}else expect(det).toBe(0);}
      if(model.activity==='triangle-converse')for(const triangle of model.triangles){classes.add(triangle.classification);const lengths=triangle.lengths.map(Number).sort((a,b)=>a-b),diff=lengths[0]!**2+lengths[1]!**2-lengths[2]!**2;expect(triangle.classification).toBe(Math.abs(diff)<1e-8?'right':diff>0?'acute':'obtuse');}
      if(model.activity==='chemical-balance')for(const atom of model.atoms){expect(atom.left).toBe(atom.right);expect(atom.left).toBeGreaterThan(0);}
      if(model.activity==='concentration'&&task.kind==='solution-lab'&&task.mode==='concentration'){
        expect(model.percent).toBeCloseTo(100*model.solute/model.total,10);
        expect(model.solute+model.retainedSolute).toBeCloseTo(task.sample.solute,10);
        expect(model.total+model.retainedTotal).toBeCloseTo(task.sample.solute+task.sample.solvent+(task.operation?.kind==='dilute'?task.operation.amount:0),10);
      }
      if(model.activity==='combinations')expect(new Set(model.rows.map(r=>r.join('|'))).size).toBe(model.count);
      expect(JSON.stringify(model)).not.toMatch(/review|observations|confirmedByAdult|PRIVATE/);
    }
    expect([...roots].sort()).toEqual([0,1,2]);expect([...relations].sort()).toEqual(['many','none','one']);expect([...classes].sort()).toEqual(['acute','obtuse','right']);
  });
  it('never invents a model from a failed or pending response and owns detached arrays',()=>{
    for(const id of ids){
      const task=EXPEDITION_NODES[id]!.item(rng(9),'independent').task;
      for(const bad of wrongs(task))expect(checkedFamilyLessonSnapshot(id,task,bad)).toBeUndefined();
      if(task.kind==='logic-workshop'&&task.review)expect(checkedFamilyLessonSnapshot(id,task,solution(task))).toBeUndefined();
      const response=successful(task),before=JSON.stringify({task,response}),model=checkedFamilyLessonSnapshot(id,task,response)!;
      if(model.activity==='chemical-balance')model.coefficients[0]=999;
      if(model.activity==='combinations')model.rows[0]![0]='PRIVATE';
      if(model.activity==='system-graph')model.equations[0]![0]=999;
      if(model.activity==='triangle-converse')model.triangles[0]!.vertices[0]![0]=999;
      expect(JSON.stringify({task,response})).toBe(before);
      expect(checkedFamilyLessonSnapshot('M-ADD-01',task,response)).toBeUndefined();
    }
  });
});
