import type { CarbonBond, CarbonKitchenResponse, CarbonKitchenTask, NutrientGroup, NutrientStructure } from '../src/content/models/carbon-kitchen';

// A separate chemistry oracle: explicit neutral skeletons and residual C4/O2/H1
// valence, plus the task's public composition table. No production solver is used.
const group: Record<NutrientStructure,NutrientGroup> = {sugar:'carbohydrate',starch:'carbohydrate',triglyceride:'fat','amino-chain':'protein',water:'other'};
export function carbonOwnAnswer(t:CarbonKitchenTask):CarbonKitchenResponse {
  const base={kind:'carbon-kitchen' as const};
  if(t.mode==='composition')return {...base,mode:t.mode,element:'C',rows:t.cards.map(c=>({id:c.id,carbon:c.formula.C??0,type:Object.keys(c.formula).length===1?'element':'compound'})),counterexample:t.claim?t.cards.filter(c=>(c.formula.C??0)>0&&Object.keys(c.formula).length>1).at(-1)!.id:null};
  if(t.mode==='molecule-build'){
    const cs=t.atoms.filter(a=>a.element==='C'),os=t.atoms.filter(a=>a.element==='O'),hs=t.atoms.filter(a=>a.element==='H');
    const bonds:CarbonBond[]=[];
    if(os.length===2)bonds.push(...os.map(o=>({a:cs[0]!.id,b:o.id,order:2 as const})));
    else {
      for(let i=1;i<cs.length;i++)bonds.push({a:cs[i-1]!.id,b:cs[i]!.id,order:!os.length&&cs.length===2&&hs.length<6?(hs.length===2?3:2):1});
      if(os.length)bonds.push({a:cs.at(-1)!.id,b:os[0]!.id,order:hs.length===cs.length*2?2:1});
      let h=0;
      for(const a of [...cs,...os]){
        const total=bonds.filter(b=>b.a===a.id||b.b===a.id).reduce((n,b)=>n+b.order,0);
        for(let n=total;n<(a.element==='C'?4:2);n++)bonds.push({a:a.id,b:hs[h++]!.id,order:1});
      }
      if(h!==hs.length)throw Error('Independent skeleton did not consume the supplied hydrogen inventory');
    }
    return {...base,mode:t.mode,bonds,types:t.samples.map(s=>({id:s.id,type:s.form==='separate-substances'?'mixture':new Set(s.atoms.map(a=>a.element)).size===1?'element':'compound'})),allCarbonOrganic:false};
  }
  if(t.mode==='nutrient-matrix'){
    const foods=t.foods.map(f=>({id:f.id,groups:[...new Set(f.parts.filter(p=>p.massG>0).map(p=>group[t.components.find(c=>c.id===p.component)!.structure]).filter(g=>g!=='other'))]}));
    const massG=t.foods.find(f=>f.id===t.requested.food)!.parts.reduce((sum,p)=>sum+(group[t.components.find(c=>c.id===p.component)!.structure]===t.requested.group?p.massG:0),0);
    return {...base,mode:t.mode,groups:t.components.map(c=>({id:c.id,group:group[c.structure]})),foods,massG,rejectedFood:t.proposal?.food??null};
  }
  if(t.mode==='protein-fragment')return {...base,mode:t.mode,chain:t.units.filter(u=>u.kind==='amino-residue').slice(-t.length).reverse().map(u=>u.id),folded:true,proteinFoods:t.foods.filter(f=>f.parts.some(p=>p.massG>0&&t.components.find(c=>c.id===p.component)!.structure==='amino-chain')).map(f=>f.id)};
  return {...base,mode:t.mode,marks:t.molecules.map(m=>{
    const oxygen=m.atoms.find(a=>a.element==='O')!.id;
    const around=m.bonds.filter(b=>b.order===1&&(b.a===oxygen||b.b===oxygen)).map(b=>b.a===oxygen?b.b:b.a);
    return {molecule:m.id,oxygen,carbon:around.find(id=>m.atoms.find(a=>a.id===id)!.element==='C')!,hydrogen:around.find(id=>m.atoms.find(a=>a.id===id)!.element==='H')!};
  }),higherBoiling:t.molecules[0]!.boilingC>t.molecules[1]!.boilingC?t.molecules[0]!.id:t.molecules[1]!.id,differenceC:Math.abs(t.molecules[0]!.boilingC-t.molecules[1]!.boilingC),rejectedMolecule:t.proposal?.molecule??null,review:{channel:'spoken',observations:Object.fromEntries(t.review!.rubric.map(c=>[c.id,'met' as const])),confirmedByAdult:true,assistance:'none'}};
}
