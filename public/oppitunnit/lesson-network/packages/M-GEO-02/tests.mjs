import test from 'node:test';
import assert from 'node:assert/strict';
import {instructions,movePosition,checkPosition} from './lesson.mjs';
test('all five relations have one unambiguous instructed place in the fixed view',()=>{
 instructions.forEach((t,i)=>{let passes=0;for(let x=0;x<3;x++)for(let y=0;y<3;y++)passes+=Number(checkPosition([x,y],i).ok);assert.equal(passes,1);assert.equal(checkPosition(t.target,i).ok,true);});
 assert.match(checkPosition([2,0],0).message,/eri hyllyllä/);assert.match(checkPosition([0,1],0).message,/vastakkaisella/);assert.match(checkPosition([2,0],1).message,/sivussa/);
});
test('movements are one place, clamp at edges, and reverse in the interior',()=>{
 assert.deepEqual(movePosition([1,1],'up'),[1,0]);assert.deepEqual(movePosition([1,1],'right'),[2,1]);
 assert.deepEqual(movePosition(movePosition([1,1],'left'),'right'),[1,1]);
 for(let x=0;x<3;x++)for(let y=0;y<3;y++)for(const d of ['left','right','up','down']){const p=movePosition([x,y],d);assert.ok(p.every(n=>n>=0&&n<=2));assert.ok(Math.abs(p[0]-x)+Math.abs(p[1]-y)<=1);}
 assert.deepEqual(movePosition([0,0],'up'),[0,0]);assert.throws(()=>movePosition([3,0],'up'),RangeError);
});
