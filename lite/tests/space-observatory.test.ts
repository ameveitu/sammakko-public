import { describe, expect, it } from 'vitest';
import { rng } from '../src/engine/rng';
import { check } from '../src/engine/check';
import { daylight, solstice, nearData, scaleKey, checkSpaceDay, solutionSpaceDay, wrongSpaceDay, type SpaceDayTask } from '../src/content/models/space-observatory';
import { spaceObservatorySpecs } from '../src/content/space-observatory';

describe('observatory physical models and assessment', () => {
  it('uses the dot product with a fixed Sun and distinguishes the terminator', () => {
    for (const angle of [0, 90, 180, 270]) for (const siteOffset of [0, 180]) {
      const dot=Math.cos((angle+siteOffset)*Math.PI/180);
      expect(daylight(angle,siteOffset)).toBe(Math.abs(dot)<1e-10?'terminator':dot>0?'day':'night');
    }
    const task:SpaceDayTask={kind:'space-day',startRotation:0,targetRotation:180,site:'A',siteOffset:0};
    expect(solutionSpaceDay(task)).toEqual({kind:'space-day',rotation:180,light:'night'});
    expect(checkSpaceDay(task,solutionSpaceDay(task)).ok).toBe(true);
    for(const bad of wrongSpaceDay(task)) expect(checkSpaceDay(task,bad).ok).toBe(false);
    expect(checkSpaceDay(task,{kind:'space-day',rotation:0,light:'night'}).ok).toBe(false);
  });
  it('models opposite solstices, equal latitudes and polar limits without distance-based seasons', () => {
    const summer=solstice(45,'june'), winter=solstice(45,'december');
    expect(summer.noonElevation).toBeCloseTo(68.44,2);
    expect(winter.noonElevation).toBeCloseTo(21.56,2);
    expect(summer.dayHours).toBeCloseTo(15.43,1);
    expect(summer.dayHours+winter.dayHours).toBeCloseTo(24,8);
    expect(solstice(-45,'december').dayHours).toBeCloseTo(summer.dayHours,8);
    expect(solstice(90,'june').dayHours).toBe(24);
    expect(solstice(90,'december').dayHours).toBe(0);
    expect(()=>solstice(91,'june')).toThrow();
  });
  it('keeps size and distance values distinct and scale keys explicit', () => {
    expect(nearData.earth.diameterKm).toBeGreaterThan(nearData.moon.diameterKm);
    expect(nearData.mars.diameterKm).toBeGreaterThan(nearData.phobos.diameterKm);
    expect(nearData.earthMoonKm).toBeGreaterThan(nearData.marsPhobosKm);
    expect(scaleKey.map(row=>row.unit)).toEqual(['AU','valovuosi','kpc']);
  });
  it('supplies distinct families, transfer, and rejects wrong answers in each node', () => {
    expect(spaceObservatorySpecs).toHaveLength(5);
    for(const spec of spaceObservatorySpecs) {
      const families=new Set(Array.from({length:80},(_,seed)=>spec.item(rng(seed),'independent').tag));
      expect(families.size).toBeGreaterThanOrEqual(2);
      expect(spec.item(rng(7),'transfer').tag).toBe('transfer');
      for(let seed=1;seed<16;seed++) {
        const task=spec.item(rng(seed),'independent').task;
        if(task.kind==='space-day') {
          expect(check(task,solutionSpaceDay(task)).ok).toBe(true);
          expect(check(task,wrongSpaceDay(task)[1]!).ok).toBe(false);
        } else if(task.kind==='choice') {
          expect(check(task,{kind:'choice',index:task.answer}).ok).toBe(true);
          expect(check(task,{kind:'choice',index:(task.answer+1)%task.options.length}).ok).toBe(false);
        } else if(task.kind==='place') {
          expect(check(task,{kind:'place',map:task.answer}).ok).toBe(true);
          expect(check(task,{kind:'place',map:{}}).ok).toBe(false);
        } else if(task.kind==='build') {
          expect(check(task,{kind:'build',seq:task.target.split(' ')}).ok).toBe(true);
          expect(check(task,{kind:'build',seq:[]}).ok).toBe(false);
        } else throw new Error(`Unexpected ${task.kind}`);
      }
    }
  });
});
