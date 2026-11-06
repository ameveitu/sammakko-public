import {expect,test} from 'vitest';
import {lifecycleHarborSpecs} from '../src/content/lifecycle-harbor';
import {checkLifecycleHarbor,type LifecycleHarborTask} from '../src/content/models/lifecycle-harbor';
import {lifecyclePeerAnswer,peerIncidence} from './lifecycle-independent-fixtures';
import {rng} from '../src/engine/rng';
test('peer: semantic resource/stage map and per-use accounting across all eight authored tasks',()=>{
 let cases=0,tradeoffs=0;
 for(const spec of lifecycleHarborSpecs)for(const phase of ['independent','transfer','retrieval'] as const)for(let seed=0;seed<64;seed++){
  const task=spec.item(rng(seed),phase).task as LifecycleHarborTask,response=lifecyclePeerAnswer(task);
  expect(checkLifecycleHarbor(task,response).ok,`${spec.id}/${phase}/${seed}`).toBe(true);
  if(response.material){expect(peerIncidence(response.material.flows,'factory')).toBe(0n);expect(peerIncidence(response.material.flows,'sorter')).toBe(0n);expect(response.material.flows.every(f=>f.amount!>=0)).toBe(true);}
  if(response.energy){expect(peerIncidence(response.energy.flows,'before')).toBe(0n);expect(peerIncidence(response.energy.flows,'after')).toBe(0n);expect(response.energy.flows.every(f=>f.amount!>=0)).toBe(true);}
  if(task.mode==='integration'&&task.scope==='sustainability'){
   const a=response.comparison!.quantities.find(q=>q.option==='a')!,b=response.comparison!.quantities.find(q=>q.option==='b')!;
   expect(task.material.freshG).toBe(a.materialG);expect(task.energy.electricKj+task.energy.fuelKj).toBe(a.units!*task.comparison.options.find(o=>o.id==='a')!.makeEnergyKj);
   if(phase==='transfer'){expect(a.materialG!).toBeGreaterThan(b.materialG!);expect(a.energyKj!).toBeLessThan(b.energyKj!);tradeoffs++;}
  }cases++;
 }expect(cases).toBe(1536);expect(tradeoffs).toBe(64);
});
test('peer: sawn wood is an equally valid complete origin chain in either direction',()=>{
 const spec=lifecycleHarborSpecs.find(s=>s.id==='CHEM79-RESOURCE')!;let alternatives=0;
 for(let seed=0;seed<256;seed++){
  const task=spec.item(rng(seed),'independent').task as LifecycleHarborTask;if(task.mode!=='resource-chain'||!task.resource.cards.some(c=>c.label==='Sahattu ja kuivattu puu'))continue;
  for(const route of ['pulp','sawn'] as const)expect(checkLifecycleHarbor(task,lifecyclePeerAnswer(task,route)).ok).toBe(true);
  const wrong=lifecyclePeerAnswer(task,'sawn');wrong.resource!.path=[wrong.resource!.path[0]!,wrong.resource!.path.at(-1)!];expect(checkLifecycleHarbor(task,wrong).ok).toBe(false);alternatives++;
 }expect(alternatives).toBeGreaterThan(20);
});
test('peer: dust, quality limits, separate heat budgets and adult assessment cannot be omitted',()=>{
 for(const spec of lifecycleHarborSpecs){
  const task=spec.item(rng(9),'transfer').task as LifecycleHarborTask,correct=lifecyclePeerAnswer(task);
  if(correct.material){const wrong=structuredClone(correct);wrong.material!.flows.find(f=>f.id==='dust')!.amount=0;expect(checkLifecycleHarbor(task,wrong).ok).toBe(false);}
  if(correct.energy){const wrong=structuredClone(correct);wrong.energy!.flows.find(f=>f.id==='after-return')!.amount!++;expect(checkLifecycleHarbor(task,wrong).ok).toBe(false);}
  if(correct.comparison){const wrong=structuredClone(correct);wrong.comparison!.quantities[0]!.repairs!++;expect(checkLifecycleHarbor(task,wrong).ok).toBe(false);}
  if(correct.review){const pending=structuredClone(correct);delete pending.review;expect(checkLifecycleHarbor(task,pending).pendingReview).toBe(true);correct.review.assistance='helped';expect(checkLifecycleHarbor(task,correct)).toMatchObject({ok:true,observedByAdult:true,assisted:true});}
 }
});
test('peer: end-of-life potential is explicitly later and is never subtracted from manufactured input',()=>{
 for(const spec of lifecycleHarborSpecs)for(let seed=0;seed<64;seed++){
  const task=spec.item(rng(seed),'transfer').task as LifecycleHarborTask;if(!('comparison' in task))continue;
  expect(task.comparison.boundary).toContain('myöhemmän elinkaaren lopussa');
  const response=lifecyclePeerAnswer(task);for(const q of response.comparison!.quantities){const o=task.comparison.options.find(o=>o.id===q.option)!;expect(q.materialG).toBe(q.units!*o.newMaterialG+q.repairs!*o.repairMaterialG);}
 }
});
