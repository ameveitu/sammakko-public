import { describe,it,expect } from 'vitest';
import { workJ,powerW,positionM } from '../src/content/models/work-power';
import { workPowerSpecs,workPowerEvidence } from '../src/content/work-power';
import { rng } from '../src/engine/rng';
describe('work and power',()=>{
 it('keeps work of the chosen force distinct from effort and perpendicular motion',()=>{
  expect(workJ({forceN:10,distanceM:0,durationS:2,direction:'hold'})).toBe(0);
  expect(workJ({forceN:10,distanceM:2,durationS:2,direction:'perpendicular'})).toBe(0);
  expect(workJ({forceN:12,distanceM:3,durationS:2,direction:'parallel'})).toBe(36);
 });
 it('rejects zero duration and compares equal work and unequal work independently',()=>{
  expect(()=>powerW(20,0)).toThrow(); expect(()=>workJ({forceN:1,distanceM:1,durationS:0,direction:'parallel'})).toThrow();
  expect(powerW(20,2)).toBe(10);expect(powerW(20,4)).toBe(5);expect(powerW(40,4)).toBe(10);
 });
 it('clamps position at the correct time for two different lifts',()=>{
  const fast={forceN:10,distanceM:2,durationS:2,direction:'parallel' as const},slow={...fast,durationS:4};
  expect(positionM(fast,2)).toBe(2);expect(positionM(slow,2)).toBe(1);expect(positionM(slow,10)).toBe(2);
 });
 it('exposes two families and transfer for all four nodes',()=>{
  expect(workPowerSpecs).toHaveLength(4);
  for(const spec of workPowerSpecs){expect(workPowerEvidence[spec.id]?.families).toHaveLength(2);for(const phase of ['guided','transfer'] as const){const x=spec.item(rng(123),phase);expect((x as typeof x & {sceneModel:{kind:string}}).sceneModel.kind).toBe('work-power');expect(x.task.kind).toMatch(/choice|numeric/);}}
 });
});

it('power calculations offer at least eight distinct numeric answers with physical givens',()=>{
 const spec=workPowerSpecs.find(s=>s.id==='PHY79-POWER-CALC')!;
 const answers=new Set<number>();
 for(let seed=0;seed<120;seed++){const task=spec.item(rng(seed),'independent').task;if(task.kind==='numeric')answers.add(task.answer);}
 expect(answers.size).toBeGreaterThanOrEqual(8);
});
