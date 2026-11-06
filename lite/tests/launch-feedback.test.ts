import {describe, expect, it} from 'vitest';
import {NODES} from '../src/content';
import {rng} from '../src/engine/rng';
import {check} from '../src/engine/check';

// LR04: equal operands and a zero sum must remain valid generated exercises.
// A misconception must never label the correct numerical value as wrong.
const ids=['M-ADD-100','M-ADD-SUB-01','M-DEC-DECOMPOSE','M-MULTAB-ALL','M-MULTAB-HIGH','M-SUB-20','M-SUB-FACT-10','M79-INT-ADD'];
describe('launch feedback boundary values',()=>{
 for(const id of ids)it(id,()=>{
  let examined=0;
  for(let seed=0;seed<1000;seed++)for(const phase of ['guided','independent','transfer'] as const){
   const item=NODES[id]!.item(rng(seed),phase),t=item.task;
   if(t.kind!=='numeric'&&t.kind!=='line')continue;
   examined++;
   const where=`${id}/${item.tag}/${phase}/seed${seed}`;
   expect(Object.keys(t.whyAt??{}).length,where).toBeGreaterThan(0);
   for(const [value,why] of Object.entries(t.whyAt??{})){
    expect(Math.abs(Number(value)-t.answer),`${where}: ${value}`).toBeGreaterThan(t.kind==='numeric'?(t.tolerance??1e-9):1e-9);
    expect(why.trim().length,where).toBeGreaterThan(0);
    expect(check(t,{kind:t.kind,value:Number(value)}).ok,where).toBe(false);
   }
   expect(check(t,{kind:t.kind,value:t.answer}).ok,where).toBe(true);
  }
  expect(examined).toBeGreaterThan(0);
 });
});
