import {it,expect} from 'vitest';
import {rng} from '../src/engine/rng';
import {makeMatterCyclesTask,matterCyclesSpecs} from '../src/content/matter-cycles';
import {checkMatterCycles,replayCycleMoves} from '../src/content/models/matter-cycles';
import {matterPeerAnswer} from './matter-independent-fixtures';

it('peer: 1152 independent mass/carbon accounts preserve every origin without confusing mg C and compound mass',()=>{
  for(const spec of matterCyclesSpecs)for(const variant of ['build','repair','transfer'] as const)for(let seed=0;seed<32;seed++){
    const t=makeMatterCyclesTask(spec.id,rng(seed),variant),r=matterPeerAnswer(t);
    expect(checkMatterCycles(t,r).ok,`${spec.id}/${variant}/${seed}`).toBe(true);
    if('initial'in t&&'moves'in r){
      const replay=replayCycleMoves(t,r.moves);expect(replay.valid).toBe(true);
      for(const root of new Set(t.initial.map(p=>p.root))){
        const sum=(ps:typeof t.initial)=>ps.filter(p=>p.root===root).reduce((n,p)=>n+BigInt(p.amountMg),0n);
        expect(sum(replay.ledger.parcels),root).toBe(sum(t.initial));
      }
      if(t.mode==='carbon-network'){
        expect(replay.ledger.parcels.filter(p=>p.root==='root-carbonate')).toEqual(t.initial.filter(p=>p.root==='root-carbonate'));
        if(r.mode==='carbon-network')expect(checkMatterCycles(t,{...r,focusChangeMg:r.focusChangeMg!+1}).ok).toBe(false);
      }
    }
    if(t.mode==='photosynthesis'&&r.mode===t.mode){expect(checkMatterCycles(t,{...r,dayCarbonMg:t.carbonMg*44/12}).ok).toBe(false);expect(checkMatterCycles(t,{...r,darkPhotoCarbonMg:t.carbonMg}).ok).toBe(false);}
  }
});
it('peer: both complete snow-return routes work; skipping the required storage or adding mass does not',()=>{
  for(let seed=0;seed<32;seed++){
    const t=makeMatterCyclesTask('ENV-CHEM-WATERCYCLE-01',rng(seed),'transfer');if(t.mode!=='water-path')throw Error('water');
    for(const route of ['surface','ground'] as const){
      const r=matterPeerAnswer(t,route);if(r.mode!=='water-path')throw Error('water');
      expect(checkMatterCycles(t,r).ok).toBe(true);
      const store=t.processes.find(p=>p.kind==='store')!.id;
      expect(checkMatterCycles(t,{...r,moves:r.moves.filter(m=>m.process!==store)}).ok).toBe(false);
      expect(checkMatterCycles(t,{...r,moves:r.moves.map((m,i)=>i?m:{...m,amountMg:m.amountMg+1})}).ok).toBe(false);
      const after=replayCycleMoves(t,r.moves).ledger.parcels;expect(after.every(p=>p.reservoir==='sea'&&p.form==='liquid')).toBe(true);
    }
  }
});
it('peer: adult observation cannot override an incorrect inventory or erase assistance',()=>{
  const t=makeMatterCyclesTask('CHEM79-CARBONCYCLE',rng(19),'transfer'),r=matterPeerAnswer(t);if(r.mode!=='carbon-network')throw Error('carbon');
  const wrong={...r,focusChangeMg:r.focusChangeMg!+17};
  expect(checkMatterCycles(t,{...wrong,review:undefined})).toMatchObject({ok:false,pendingReview:true});
  expect(checkMatterCycles(t,{...wrong,review:{...r.review!,assistance:'helped'}})).toMatchObject({ok:false,observedByAdult:true,assisted:true});
});
it('peer: array metadata cannot smuggle a hidden serializer or inherited execution into a persisted response',()=>{
  const t=makeMatterCyclesTask('ENV-CHEM-MATTERCONS-01',rng(8),'build'),r=matterPeerAnswer(t);if(r.mode!=='conservation')throw Error('conservation');
  let calls=0;const hidden=[...r.moves];Object.defineProperty(hidden,'toJSON',{value(){calls++;return 'PRIVATE';}});
  expect(checkMatterCycles(t,{...r,moves:hidden}).ok).toBe(false);expect(calls).toBe(0);
  const inherited=[...r.moves];Object.setPrototypeOf(inherited,Object.create(Array.prototype));expect(checkMatterCycles(t,{...r,moves:inherited}).ok).toBe(false);
  expect(checkMatterCycles(t,r).ok).toBe(true);
});
