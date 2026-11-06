import {describe,it,expect} from 'vitest';
import {rng} from '../src/engine/rng';
import {atomicWorldSpecs} from '../src/content/atomic-world';
import {checkAtomicWorld,type AtomicWorldTask,type AtomicWorldResponse} from '../src/content/models/atomic-world';
import {resolveItemReadinessContext} from '../src/content/item-readiness-context';
import {evaluateItemReadiness} from '../src/engine/item-readiness';

// IUPAC's numbered first twenty elements, independently of the production table.
const symbols=['H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar','K','Ca'];
const spec=(id:string)=>atomicWorldSpecs.find(s=>s.id===id)!;
function atomAnswer(task:Extract<AtomicWorldTask,{mode:'atom'}>):AtomicWorldResponse {
  return {kind:'atomic-world',mode:'atom',rows:task.atoms.map(a=>({id:a.id,symbol:symbols[a.protons-1]!,number:String(a.protons),particle:task.particle??'',charge:String(task.particle==='electron'?-1:task.particle==='proton'?1:0),region:task.particle==='electron'?'cloud':'nucleus'})),nucleus:'nucleus',cloud:'cloud',literalScale:false,atomCount:String((task.sample?.units??0)*(task.sample?.atomsPerUnit??0)),unit:'atom',macroProperty:'sample',sameAtom:null,sampleAtom:''};
}
const ownReview=(task:AtomicWorldTask)=>({observations:Object.fromEntries(task.review!.rubric.map(r=>[r.id,'met' as const])),confirmedByAdult:true,assistance:'none' as const});
describe('ROOT independent atomic identity, lattice and readiness audit',()=>{
  it('uses proton count for the element identity across neutral atoms, isotopes and ion transfers',()=>{
    let isotopePairs=0,ions=0;
    for(const phase of ['independent','transfer'] as const)for(let seed=0;seed<96;seed++){
      const task=spec('CHEM79-ATOMICNUM').item(rng(seed),phase).task as AtomicWorldTask;
      if(task.mode!=='atom')throw Error('number task');
      const response=atomAnswer(task);expect(checkAtomicWorld(task,response)).toMatchObject({ok:true});
      if(task.atoms.length===2){isotopePairs++;expect(new Set(task.atoms.map(a=>a.protons)).size).toBe(1);expect(new Set(task.atoms.map(a=>a.neutrons)).size).toBe(2);}
      if(task.atoms.some(a=>a.protons!==a.electrons))ions++;
      const wrong=structuredClone(response);if(wrong.mode==='atom')wrong.rows=wrong.rows.map(r=>({...r,number:String(task.atoms.find(a=>a.id===r.id)!.protons+1)}));
      expect(checkAtomicWorld(task,wrong).ok).toBe(false);
    }
    expect(isotopePairs).toBeGreaterThan(0);expect(ions).toBe(96);
  });

  it('distinguishes proton, neutron and electron charge and location in both prompt directions',()=>{
    for(const particle of ['PROTON','NEUTRON','ELECTRON'])for(let seed=0;seed<48;seed++){
      const task=spec(`CHEM79-${particle}`).item(rng(seed),'independent').task as AtomicWorldTask;if(task.mode!=='atom')throw Error('particle');
      const response=atomAnswer(task);expect(checkAtomicWorld(task,response).ok).toBe(true);
      for(const error of ['charge','region'] as const){const wrong=structuredClone(response);if(wrong.mode==='atom')wrong.rows=wrong.rows.map(r=>({...r,[error]:error==='charge'?'2':r.region==='nucleus'?'cloud':'nucleus'}));expect(checkAtomicWorld(task,wrong).ok).toBe(false);}
    }
  });

  it('constructs every nearest-neighbour ionic lattice by graph colouring, not the renderer parity helper',()=>{
    let count=0;
    for(let seed=0;seed<128;seed++){
      const task=spec('CHEM79-COMP-MODEL').item(rng(seed),'independent').task as AtomicWorldTask;
      if(task.mode!=='build'||task.structure!=='lattice')continue;count++;
      const first=task.sites.find(s=>s.x===0&&s.y===0&&s.z===0)!,colour=new Map([[first.id,0]]),queue=[first];
      while(queue.length){const point=queue.shift()!;for(const next of task.sites)if(Math.abs(point.x-next.x)+Math.abs(point.y-next.y)+Math.abs(point.z-next.z)===1){const wanted=1-colour.get(point.id)!;if(colour.has(next.id))expect(colour.get(next.id)).toBe(wanted);else{colour.set(next.id,wanted);queue.push(next);}}}
      const answer:AtomicWorldResponse={kind:'atomic-world',mode:'build',selected:[],bonds:[],placements:[...colour].reverse().map(([id,c])=>({id,symbol:task.species[c]!})),review:ownReview(task)};
      expect(colour.size).toBe(task.sites.length);expect(checkAtomicWorld(task,answer)).toMatchObject({ok:true,observedByAdult:true});
      const wrong=structuredClone(answer);if(wrong.mode==='build')wrong.placements=wrong.placements.slice(1);expect(checkAtomicWorld(task,wrong).ok).toBe(false);
      delete answer.review;expect(checkAtomicWorld(task,answer)).toMatchObject({ok:false,pendingReview:true});
    }
    expect(count).toBeGreaterThan(40);
  });

  it('keeps the authored ELEMENT routes read-only and accepts either prerequisite only where offered',()=>{
    const routes=new Set<string>();
    for(const phase of ['independent','transfer'] as const)for(let seed=0;seed<64;seed++){
      const item=spec('CHEM79-ELEMENT').item(rng(seed),phase),context=resolveItemReadinessContext('CHEM79-ELEMENT',item);
      if(context?.kind!=='element')throw Error('explicit route');routes.add(context.route);
      for(const known of ['CHEM79-PURE-MIX','CHEM79-ATOM-01']){
        const allowed=context.route==='either'||context.route==='pure'&&known==='CHEM79-PURE-MIX'||context.route==='atomic'&&known==='CHEM79-ATOM-01';
        expect(evaluateItemReadiness({nodeId:'CHEM79-ELEMENT',itemAvailable:true,context,staticGroups:[],knownChecked:id=>id===known}).dynamic.status).toBe(allowed?'ready':'missing');
      }
      expect(evaluateItemReadiness({nodeId:'CHEM79-ELEMENT',itemAvailable:true,context,staticGroups:[],knownChecked:()=>false}).dynamic.status).toBe('missing');
    }
    expect(routes).toEqual(new Set(['pure','atomic','either']));
  });
});
