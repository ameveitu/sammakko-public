import { describe, expect, it } from 'vitest';
import { amountEnergy, checkThermalStation, contactAt, expectedPrediction, solutionThermalStation, thermalDirection, type ThermalStationTask } from '../src/content/models/thermal-station';
import { rng } from '../src/engine/rng';
import { thermalStationSpecs } from '../src/content/thermal-station';
import { thermalScene } from '../src/content/scenes/thermal-station';
const probe:ThermalStationTask={kind:'thermal-station',input:{kind:'probe',target:'a',aC:-10,bC:15,context:'air'},question:'?',choices:[],hint:'hint'};
describe('thermal station domain',()=>{
 it('rejects a sparse prediction instead of treating its missing entry as a chosen answer',()=>{
  const answer=solutionThermalStation(probe);
  expect(checkThermalStation(probe,{...answer,prediction:new Array<string>(1)}).ok).toBe(false);
  expect(checkThermalStation(probe,{...answer,locked:'yes' as unknown as boolean}).ok).toBe(false);
  expect(checkThermalStation(probe,{...answer,observed:1 as unknown as boolean}).ok).toBe(false);
 });
 it('generates at least four real independent inputs per node',()=>{for(const spec of thermalStationSpecs){const inputs=new Set(Array.from({length:80},(_,i)=>JSON.stringify((spec.item(rng(i),'independent').task as ThermalStationTask).input)));expect(inputs.size, spec.id).toBeGreaterThanOrEqual(4);}});
 it('conserves energy and approaches the independently calculated equilibrium',()=>{
  for(const seconds of [0,0.5,10,10000]) {const r=contactAt(80,20,100,300,2,seconds);expect(r.energyA+r.energyB).toBeCloseTo(0,9);expect(r.equilibrium).toBe(35);expect(r.a).toBeGreaterThanOrEqual(r.b);expect(r.a).toBeLessThanOrEqual(80);}
  const end=contactAt(80,20,100,300,2,10000);expect(end.a).toBeCloseTo(35);expect(end.b).toBeCloseTo(35);expect(end.netPowerA).toBeCloseTo(0);
  expect(contactAt(10,10,20,30,5,8).energyA).toBe(0);expect(()=>contactAt(1,2,0,1,1,1)).toThrow();
 });
 it('distinguishes direction and material amount',()=>{expect(thermalDirection(3,8)).toBe('b-to-a');expect(thermalDirection(8,8)).toBe('none');expect(amountEnergy(200,4.2,5)).toBe(4200);expect(amountEnergy(100,4.2,5)).toBe(2100);});
 it('does not expose unread probe values and requires a locked prediction and actual reading',()=>{
  const initial=thermalScene(probe);expect(JSON.stringify(initial)).not.toContain('-10');expect(initial.outcome).toBeUndefined();
  const answer=solutionThermalStation(probe);expect(checkThermalStation(probe,answer).ok).toBe(true);expect(checkThermalStation(probe,{...answer,locked:false}).ok).toBe(false);expect(checkThermalStation(probe,{...answer,reading:10}).ok).toBe(false);expect(thermalScene(probe,answer).outcome).toMatchObject({aC:-10,bC:15});
 });
 it('requires every mechanism and an actual structured adult review',()=>{
  const task:ThermalStationTask={kind:'thermal-station',input:{kind:'integration',context:'tent',warmC:30,coolC:10,mechanisms:['conduction','convection','radiation']},question:'?',choices:[],hint:'hint',review:{criteria:[{id:'routes',label:'Reitit'}]}};
  const answer=solutionThermalStation(task);expect(expectedPrediction(task.input)).toHaveLength(3);expect(checkThermalStation(task,answer).pendingReview).toBe(true);expect(checkThermalStation(task,{...answer,prediction:['conduction','radiation']}).ok).toBe(false);expect(checkThermalStation(task,{...answer,confirmedByAdult:true,assistance:'helped',observations:{routes:'met'}})).toMatchObject({ok:true,observedByAdult:true,assisted:true});
  const inherited=Object.assign(Object.create({routes:'met'}),{other:'met'});
  expect(checkThermalStation(task,{...answer,confirmedByAdult:true,assistance:'none',observations:inherited})).toMatchObject({ok:false,pendingReview:true});
 });
});
