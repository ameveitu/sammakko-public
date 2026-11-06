import { expect, test } from 'vitest';
import { chemicalNotationSpecs, chemicalReactions, chemicalSamples } from '../src/content/chemical-notation';
import { chemicalElements, chemicalReactionInventory, checkChemicalNotation, parseChemicalFormula,
  smallestChemicalBalance, wrongChemicalNotationResponses,
  type AtomInventory, type ChemicalElement, type ChemicalNotationTask, type ChemicalNotationResponse } from '../src/content/models/chemical-notation';
import { rng } from '../src/engine/rng';

// Independent literal compositions. Neither parser nor solution supplies expected counts.
const atoms:Record<string,AtomInventory>={
  H2O:{H:2,O:1},CO2:{C:1,O:2},NH3:{N:1,H:3},CH4:{C:1,H:4},H2O2:{H:2,O:2},
  SO2:{S:1,O:2},SO3:{S:1,O:3},NO2:{N:1,O:2},CO:{C:1,O:1},C2H6:{C:2,H:6},C3H8:{C:3,H:8},
  C2H5OH:{C:2,H:6,O:1},CH3COOH:{C:2,H:4,O:2},N2O:{N:2,O:1},NaCl:{Na:1,Cl:1},MgO:{Mg:1,O:1},
  CaCl2:{Ca:1,Cl:2},Al2O3:{Al:2,O:3},Na2CO3:{Na:2,C:1,O:3},CaCO3:{Ca:1,C:1,O:3},KCl:{K:1,Cl:1},
  CuO:{Cu:1,O:1},Fe2O3:{Fe:2,O:3},NaOH:{Na:1,O:1,H:1},'Ca(OH)2':{Ca:1,O:2,H:2},
  H2:{H:2},O2:{O:2},N2:{N:2},Cl2:{Cl:2},Mg:{Mg:1},Al:{Al:1},Na:{Na:1},Fe:{Fe:1},Cu:{Cu:1},
  CaO:{Ca:1,O:1},KClO3:{K:1,Cl:1,O:3},NaHCO3:{Na:1,H:1,C:1,O:3},HCl:{H:1,Cl:1},Co:{Co:1},
};
const primitive:Record<string,Record<string,number>>={
  H2O:{H2:2,O2:1,H2O:2},NH3:{N2:1,H2:3,NH3:2},MgO:{Mg:2,O2:1,MgO:2},Al2O3:{Al:4,O2:3,Al2O3:2},
  NaCl:{Na:2,Cl2:1,NaCl:2},Fe2O3:{Fe:4,O2:3,Fe2O3:2},CuO:{Cu:2,O2:1,CuO:2},
  H2O2:{H2O2:2,H2O:2,O2:1},CaCO3:{CaCO3:1,CaO:1,CO2:1},KClO3:{KClO3:2,KCl:2,O2:3},
  NaHCO3:{NaHCO3:2,Na2CO3:1,H2O:1,CO2:1},CH4:{CH4:1,O2:2,CO2:1,H2O:2},
  C2H6:{C2H6:2,O2:7,CO2:4,H2O:6},C3H8:{C3H8:1,O2:5,CO2:3,H2O:4},C2H5OH:{C2H5OH:1,O2:3,CO2:2,H2O:3},
  HCl:{HCl:1,NaOH:1,NaCl:1,H2O:1},
};
const scaled=(inventory:AtomInventory,factor:number):AtomInventory=>Object.fromEntries(Object.entries(inventory).map(([symbol,n])=>[symbol,n*factor]));
function fixture(task:ChemicalNotationTask):ChemicalNotationResponse{
  const kind='chemical-notation' as const;
  if(task.mode==='symbols')return {kind,mode:task.mode,rows:task.samples.map(sample=>{
    const element=sample.name?Object.entries(chemicalElements).find(([,name])=>name===sample.name)![0]:sample.shown;
    return {id:sample.id,element,symbol:element};
  })};
  if(task.mode==='formula')return {kind,mode:task.mode,species:Object.keys(atoms[task.sample.formula]!).reverse(),atoms:scaled(atoms[task.sample.formula]!,3),model:atoms[task.sample.formula]!};
  if(task.mode==='subscript'){
    const tokens=[...task.sample.formula.matchAll(/([A-Z][a-z]?)(\d*)/g)],selected=tokens[task.target]!;
    return {kind,mode:task.mode,element:selected[1]!,count:Number(selected[2]||1),implicit:!selected[2],atoms:atoms[task.sample.formula]!};
  }
  if(task.mode==='groups')return {kind,mode:task.mode,groups:task.coefficient,atoms:scaled(atoms[task.sample.formula]!,task.coefficient)};
  if(task.mode==='roles')return {kind,mode:task.mode,roles:[...task.reaction.left.map(()=>'reactant'),...task.reaction.right.map(()=>'product')],arrow:'change'};
  const all=[...task.reaction.left,...task.reaction.right];
  const coefficients=Object.values(primitive).find(vector=>all.every(sample=>sample.formula in vector))!;
  const tally=(samples:readonly (typeof all)[number][])=>{
    const total:AtomInventory={};
    for(const sample of samples)for(const [symbol,n] of Object.entries(atoms[sample.formula]!)){
      const element=symbol as ChemicalElement;total[element]=(total[element]??0)+n*coefficients[sample.formula]!;
    }
    return total;
  };
  return {kind,mode:task.mode,coefficients:all.map(sample=>coefficients[sample.formula]!),left:tally(task.reaction.left),right:tally(task.reaction.right)};
}

test('bounded school formulas preserve every atom species and reject invalid grammar',()=>{
  for(const [formula,inventory] of Object.entries(atoms))expect(parseChemicalFormula(formula)?.atoms,formula).toEqual(inventory);
  expect(parseChemicalFormula('Ca(OH)2')?.tokens.map(t=>[t.element,t.count,t.multiplier])).toEqual([['Ca',1,1],['O',1,2],['H',1,2]]);
  for(const bad of ['',0,null,'2H2O','H0','H-1','H01','H25','Xx2','COfoo','(H2O','H2O)','()','H()','((H)2)2','H 2O','H2O+O2','H2O.constructor'])
    expect(parseChemicalFormula(bad),String(bad)).toBeUndefined();
  expect(parseChemicalFormula('Co')?.atoms).not.toEqual(parseChemicalFormula('CO')?.atoms);
});

test('all eight nodes have two deterministic families, transfer, own production and meaningful variation',()=>{
  let generated=0;
  for(const spec of chemicalNotationSpecs){
    const tags=new Set<string>(),situations=new Set<string>();
    for(const phase of ['independent','transfer'] as const)for(let seed=0;seed<96;seed++){
      const item=spec.item(rng(seed),phase),task=item.task as unknown as ChemicalNotationTask;
      expect(item.task).toEqual(spec.item(rng(seed),phase).task);
      if(phase==='independent')tags.add(item.tag);
      const {title:_title,...actual}=task;
      situations.add(JSON.stringify({...actual,...('palette' in actual?{palette:undefined}:{}),...('monochrome' in actual?{monochrome:undefined}:{})}));
      const answer=fixture(task);expect(checkChemicalNotation(task,answer),JSON.stringify(task)).toEqual({ok:true});
      for(const wrong of wrongChemicalNotationResponses(task))expect(checkChemicalNotation(task,wrong).ok,JSON.stringify({task,wrong})).toBe(false);
      expect(checkChemicalNotation(task,null as unknown as ChemicalNotationResponse).ok).toBe(false);
      generated++;
    }
    expect(tags.size,spec.id).toBe(2);expect(situations.size,spec.id).toBeGreaterThanOrEqual(8);
  }
  expect(generated).toBe(1536);
});

test('balanced alternatives conserve each species, while zeros, impossible reactions and false ledgers fail',()=>{
  for(const reaction of Object.values(chemicalReactions).flat()){
    const task:ChemicalNotationTask={kind:'chemical-notation',mode:'balance',title:'Oracle',reaction,draft:[],primitive:false};
    const answer=fixture(task);if(answer.mode!=='balance')throw Error('Expected balance');
    for(const factor of [1,2,7]){
      const other={...answer,coefficients:answer.coefficients.map(n=>n*factor),left:scaled(answer.left,factor),right:scaled(answer.right,factor)};
      expect(checkChemicalNotation(task,other)).toEqual({ok:true});
      expect(chemicalReactionInventory(reaction,other.coefficients)).toEqual({left:other.left,right:other.right});
      if(factor>1)expect(checkChemicalNotation({...task,primitive:true},other).ok).toBe(false);
    }
    const species=Object.keys(answer.left) as ChemicalElement[];
    if(species.length>1){
      const [a,b]=species;
      const falseLedger={...answer.left,[a!]:answer.left[a!]!+1,[b!]:answer.left[b!]!-1};
      expect(checkChemicalNotation(task,{...answer,left:falseLedger,right:falseLedger}).ok).toBe(false);
    }
    for(const coefficients of [Array(answer.coefficients.length),[0],answer.coefficients.map(()=>-1),answer.coefficients.map(()=>Infinity),answer.coefficients.map(()=>.5),answer.coefficients.map(()=>1001)])
      expect(checkChemicalNotation(task,{...answer,coefficients}).ok).toBe(false);
    expect(checkChemicalNotation(task,{...answer,left:{...answer.left,unknown:1} as AtomInventory}).ok).toBe(false);
    expect(checkChemicalNotation(task,{...answer,left:Object.create(answer.left) as AtomInventory}).ok).toBe(false);
    const accessor=Object.defineProperty({},'H',{get(){throw Error('Getter should never execute');}});
    expect(checkChemicalNotation(task,{...answer,left:accessor}).ok).toBe(false);
  }
  const impossible={left:[{formula:'H2',name:'vety',form:'molecule' as const}],right:[{formula:'O2',name:'happi',form:'molecule' as const}],condition:'Impossible fixture'};
  expect(smallestChemicalBalance(impossible)).toBeUndefined();
  expect(chemicalSamples.every(sample=>atoms[sample.formula])).toBe(true);
});


test('the supported large coefficient keeps complete atom inventories',()=>{
  const task:ChemicalNotationTask={kind:'chemical-notation',mode:'groups',title:'Bounded whole groups',
    sample:{formula:'H2O',name:'vesi',form:'molecule'},coefficient:1000,source:'notation',palette:['H','O']};
  expect(checkChemicalNotation(task,{kind:'chemical-notation',mode:'groups',groups:1000,atoms:{H:2000,O:1000}})).toEqual({ok:true});
  const reaction=chemicalReactions.join[0]!;
  const balance:ChemicalNotationTask={kind:'chemical-notation',mode:'balance',title:'Large common multiple',reaction,draft:[],primitive:false};
  expect(checkChemicalNotation(balance,{kind:'chemical-notation',mode:'balance',coefficients:[1000,500,1000],
    left:{H:2000,O:1000},right:{H:2000,O:1000}})).toEqual({ok:true});
});


test('public parser, coefficient and atom inventory limits agree at their shared boundary',()=>{
  const task:ChemicalNotationTask={kind:'chemical-notation',mode:'groups',title:'Parser boundary fixture',
    sample:{formula:'(C8H8)24',name:'Symbolinen parserirajatapaus',form:'molecule'},coefficient:1000,source:'notation',palette:['C','H']};
  expect(parseChemicalFormula(task.sample.formula)?.atoms).toEqual({C:192,H:192});
  expect(checkChemicalNotation(task,{kind:'chemical-notation',mode:'groups',groups:1000,atoms:{C:192000,H:192000}})).toEqual({ok:true});
  const sample={formula:'(C10H10)24C16H16',name:'Symbolinen parserirajatapaus',form:'molecule' as const};
  expect(parseChemicalFormula(sample.formula)?.atoms).toEqual({C:256,H:256});
  const reaction={left:Array(4).fill(sample),right:Array(4).fill(sample),condition:'Arithmetical grammar boundary only'};
  const balance:ChemicalNotationTask={kind:'chemical-notation',mode:'balance',title:'Eight participants',reaction,draft:[],primitive:false};
  expect(checkChemicalNotation(balance,{kind:'chemical-notation',mode:'balance',coefficients:Array(8).fill(1000),
    left:{C:1024000,H:1024000},right:{C:1024000,H:1024000}})).toEqual({ok:true});
});
