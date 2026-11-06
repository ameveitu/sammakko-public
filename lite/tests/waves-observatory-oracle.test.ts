import {describe,it,expect} from 'vitest';
import {rng} from '../src/engine/rng';
import {wavesObservatorySpecs} from '../src/content/waves-observatory';
import {checkWavesObservatory,wavesObservatoryScene,lightShadow,pressureDisplacement,type WavesObservatoryTask,type WavesObservatoryResponse} from '../src/content/models/waves-observatory';
import {independentShadow,independentExposureWinners,independentIon,independentlyAnswerWaves} from './waves-observatory-fixtures';

describe('independent waves and radiation oracle',()=>{
  it('checks all authored families and transfer against exact line intersections and physical givens',()=>{
    const rejected:string[]=[];
    for(const spec of wavesObservatorySpecs){
      const families=new Set<string>(),givens=new Set<string>();
      for(const phase of ['independent','transfer'] as const)for(let seed=0;seed<96;seed++){
        const item=spec.item(rng(seed),phase),task=item.task as WavesObservatoryTask,answer=independentlyAnswerWaves(task);
        if(!checkWavesObservatory(task,answer).ok)rejected.push(`${spec.id}/${phase}/${seed}`);
        if(phase==='independent'){families.add(item.tag);givens.add(JSON.stringify(task.input));}
        for(const f of task.fields)for(const o of f.options??[]){
          if(o.id===answer.values[f.id])continue;
          const changed={...answer,values:{...answer.values,[f.id]:o.id}};
          const otherBest=f.id==='plan'&&task.input.kind==='radiation'&&!task.input.unknown&&independentExposureWinners(task.input).includes(o.id);
          expect(checkWavesObservatory(task,changed).ok,`${spec.id} ${f.id}=${o.id}`).toBe(otherBest);
        }
        if(task.review){
          expect(checkWavesObservatory(task,{...answer,confirmedByAdult:false}).pendingReview).toBe(true);
          expect(checkWavesObservatory(task,{...answer,values:{},confirmedByAdult:false}).pendingReview).toBe(true);
          expect(checkWavesObservatory(task,{...answer,assistance:'helped'})).toMatchObject({observedByAdult:true,assisted:true});
        }
      }
      expect(families,spec.id).toEqual(new Set(spec.produce));expect(givens.size,spec.id).toBeGreaterThanOrEqual(8);
    }
    expect(rejected.slice(0,12),`${rejected.length} independently computed valid answers rejected`).toEqual([]);
  });
  it('retains each sufficient prerequisite route and varies equal as well as different paired outcomes',()=>{
    for(const id of ['PHY79-RAD-ION-CLASS','PHY79-RAD-ION']){
      const spec=wavesObservatorySpecs.find(s=>s.id===id)!;
      for(const known of [[],['PHY79-RAD-EM'],['PHY79-RAD-PARTICLE'],['PHY79-RAD-EM','PHY79-RAD-PARTICLE']]){
        const expected=known.includes('PHY79-RAD-PARTICLE')&&!known.includes('PHY79-RAD-EM')?'particle':'em',patterns=new Set<boolean>();
        const context={knownChecked:(id:string)=>known.includes(id)};
        for(let seed=0;seed<96;seed++){
          const previous=spec.item(rng(seed),'independent',context),task=previous.task as WavesObservatoryTask;
          expect(task.context?.route).toBe(expected);if(task.input.kind!=='radiation')throw Error('radiation expected');
          expect(task.input.form).toBe(expected);if(task.input.comparison){expect(task.input.comparison.form).toBe(expected);patterns.add(independentIon(task.input)===independentIon(task.input.comparison));}
          expect(checkWavesObservatory(task,independentlyAnswerWaves(task)).ok).toBe(true);
          const transfer=spec.item(rng(seed+1),'transfer',{knownChecked:()=>true,previousItem:previous}).task as WavesObservatoryTask;
          expect(transfer.context?.route).toBe(expected);expect(checkWavesObservatory(transfer,independentlyAnswerWaves(transfer)).ok).toBe(true);
        }
        expect(patterns).toEqual(new Set([true,false]));
      }
    }
  });
  it('matches independent exact boundaries and a local travelling pressure wave',()=>{
    for(let seed=0;seed<160;seed++)for(const phase of ['independent','transfer'] as const){
      const task=wavesObservatorySpecs[0]!.item(rng(seed),phase).task as WavesObservatoryTask;if(task.input.kind!=='light')throw Error('light');
      for(const y of [-2,-1,0,1,2]){const expected=independentShadow(task.input,y),actual=lightShadow(task.input,y)!;expect(actual.shadowLow).toBeCloseTo(expected.low,12);expect(actual.shadowHigh).toBeCloseTo(expected.high,12);}
    }
    for(const speed of [343,1480])for(const f of [100,200,500])for(const a of [0,1,4]){
      const period=1/f,wavelength=speed/f;
      expect(pressureDisplacement(0,period/4,f,a,speed)).toBeCloseTo(a,12);
      expect(pressureDisplacement(wavelength,period/4,f,a,speed)).toBeCloseTo(a,12);
      expect(pressureDisplacement(wavelength/4,period/2,f,a,speed)).toBeCloseTo(a,12);
      expect(pressureDisplacement(0,period*3/4,f,a,speed)).toBeCloseTo(-a,12);
    }
  });
  it('never accepts inherited or accessor supplied evidence, including adult provenance',()=>{
    for(const spec of wavesObservatorySpecs){
      const task=spec.item(rng(0),'independent').task as WavesObservatoryTask,answer=independentlyAnswerWaves(task);
      expect(checkWavesObservatory(task,Object.create(answer)).ok,spec.id).toBe(false);
      expect(()=>checkWavesObservatory(task,Object.defineProperty({...answer},'kind',{get(){throw Error('getter');}}))).not.toThrow();
      expect(checkWavesObservatory(task,{...answer,values:Object.create(answer.values)}).ok).toBe(false);
      if(task.review){
        const partial={kind:answer.kind,values:answer.values,predictionLocked:true,action:answer.action,observed:answer.observed};
        const inherited=Object.assign(Object.create({confirmedByAdult:true,assistance:'none',observations:answer.observations}),partial) as WavesObservatoryResponse;
        expect(checkWavesObservatory(task,inherited).ok).toBe(false);
      }
      if(answer.observed){expect(checkWavesObservatory(task,{...answer,observed:Object.create(answer.observed)}).ok).toBe(false);expect(wavesObservatoryScene(task,Object.create(answer))?.observation).toBeUndefined();}
    }
  });
});
