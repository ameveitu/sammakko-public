import {readFileSync} from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { partWidths, checkPartition } from './lesson.mjs';
test('all possible grid partitions conserve the whole and only the equal splits pass',()=>{
  for(let mask=0;mask<32;mask++) { const cuts=[1,2,3,4,5].filter((_,i)=>mask&(1<<i)); const widths=partWidths(cuts); assert.equal(widths.reduce((a,b)=>a+b,0),6); assert.ok(widths.every(x=>x>0));
    for(const n of [2,3]) assert.equal(checkPartition(cuts,n).ok, JSON.stringify(cuts)===JSON.stringify(n===2?[3]:[2,4])); }
});
test('same count is insufficient, order and duplicate clicks do not affect geometry',()=>{
  assert.equal(checkPartition([1],2).code,'unequal'); assert.equal(checkPartition([],2).code,'count');
  assert.deepEqual(partWidths([4,2,2]),[2,2,2]); assert.equal(checkPartition([4,2],3).ok,true);
  for(const cuts of [[0],[6],[-1],[1.5],[NaN]]) assert.throws(()=>partWidths(cuts),RangeError);
});

// A cut does not change the original whole: all three strip diagrams have equal dimensions.
const diagram=readFileSync(new URL('equal-parts.svg',import.meta.url),'utf8');assert.deepEqual([...diagram.matchAll(/<rect[^>]*width="280"[^>]*height="(\d+)"/g)].map(x=>Number(x[1])),[48,48,48]);
