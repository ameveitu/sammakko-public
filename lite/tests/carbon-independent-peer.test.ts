import {describe,it,expect} from 'vitest';
import {makeCarbonKitchenTask,carbonKitchenSpecs} from '../src/content/carbon-kitchen';
import {checkCarbonKitchen,validCarbonMolecule,type CarbonAtom,type CarbonBond} from '../src/content/models/carbon-kitchen';
import {carbonKitchenScene} from '../src/content/models/carbon-kitchen-scene';
import {rng} from '../src/engine/rng';
import {carbonOwnAnswer} from './carbon-independent-fixtures';

describe('independent carbon chemistry review',()=>{
  it('accepts either supplied carbon-compound counterexample, independent of row order',()=>{
    for(let seed=0;seed<64;seed++){
      const t=makeCarbonKitchenTask('CHEM79-CARBON',rng(seed),'repair');if(t.mode!=='composition')throw Error('mode');
      const a=carbonOwnAnswer(t);if(a.mode!=='composition')throw Error('answer');
      for(const card of t.cards){
        const expected=(card.formula.C??0)>0&&Object.keys(card.formula).length>1;
        expect(checkCarbonKitchen(t,{...a,rows:[...a.rows].reverse(),counterexample:card.id}).ok,`seed ${seed}, card ${card.id}`).toBe(expected);
      }
    }
  });
  it('accepts distinct connected C2H6O isomers and rejects a disconnected valence-complete mixture',()=>{
    const atom=(id:string,element:CarbonAtom['element'],hydrogens=0):CarbonAtom=>({id,element,hydrogens});
    const bond=(a:string,b:string,order:1|2|3=1):CarbonBond=>({a,b,order});
    const ethanol=[atom('a','C',3),atom('b','C',2),atom('o','O'),atom('h','H')];
    const ether=[atom('a','C',3),atom('b','C',3),atom('o','O')];
    expect(validCarbonMolecule(ethanol,[bond('a','b'),bond('b','o'),bond('o','h')])).toBe(true);
    expect(validCarbonMolecule(ether,[bond('a','o'),bond('o','b')])).toBe(true);
    expect(validCarbonMolecule([atom('a','C',4),atom('b','C',4)],[])).toBe(false);
    expect(validCarbonMolecule(ethanol,[bond('a','b'),bond('b','o',2),bond('o','h')])).toBe(false);
  });
  it('independently reconstructs all seven authored tasks, including zero-mass exclusions and bent-chain identity',()=>{
    let checked=0;
    for(const spec of carbonKitchenSpecs)for(let seed=0;seed<64;seed++)for(const variant of ['build','repair','transfer'] as const){
      const t=makeCarbonKitchenTask(spec.id,rng(seed),variant),a=carbonOwnAnswer(t);
      expect(checkCarbonKitchen(t,a).ok,`${spec.id}/${variant}/${seed}`).toBe(true);checked++;
      if(t.mode==='nutrient-matrix'&&a.mode==='nutrient-matrix')expect(checkCarbonKitchen(t,{...a,massG:a.massG!+1}).ok).toBe(false);
      if(t.mode==='protein-fragment'&&a.mode==='protein-fragment'){
        const bent=carbonKitchenScene(t,a)!,straight=carbonKitchenScene(t,{...a,folded:false})!;
        expect(bent.residues.map(r=>r.id)).toEqual(a.chain);expect(straight.residues).toEqual(bent.residues);
        const reordered={...a,chain:[...a.chain].reverse()};expect(checkCarbonKitchen(t,reordered).ok).toBe(true);
      }
    }
    expect(checked).toBe(1344);
  });
  it('keeps teaching profile and observed adult provenance separate from numerical correctness',()=>{
    for(let seed=0;seed<32;seed++){
      const t=makeCarbonKitchenTask('CHEM79-ORG-GROUP',rng(seed),'transfer');if(t.mode!=='organic-group')throw Error('mode');
      const a=carbonOwnAnswer(t);if(a.mode!=='organic-group')throw Error('answer');
      expect(checkCarbonKitchen({...t,profile:null},a)).toMatchObject({ok:false,pendingReview:true});
      expect(checkCarbonKitchen({...t,context:{...t.context,allowedGroups:['alcohols','alkanes']}},a)).toMatchObject({ok:false,pendingReview:true});
      expect(checkCarbonKitchen(t,{...a,review:undefined})).toMatchObject({ok:false,pendingReview:true});
      expect(checkCarbonKitchen(t,{...a,differenceC:-1,review:{...a.review!,channel:'written',assistance:'helped'}})).toMatchObject({ok:false,observedByAdult:true,assisted:true});
      expect(JSON.stringify(carbonKitchenScene(t,a))).not.toMatch(/observations|confirmedByAdult|assistance/);
    }
  });
});
