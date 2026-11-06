import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {CASES,validStarts,checkTiling,tilingKey,tilingSvg}from'./lesson.mjs';
const a=(starts,reported=4)=>({starts,reported});
test('unit coverage checks start/end, whole coverage, gaps and overlaps rather than count alone',()=>{
 assert.equal(checkTiling('ribbon',a([0,1,2,3])).ok,true);assert.equal(checkTiling('ribbon',a([3,1,0,2])).ok,true);
 for(const[s,code]of [[[],'empty'],[[1,2,3,4],'start'],[[0,1,3],'gap'],[[0,1,1,3],'overlap'],[[0,1,2],'short'],[[0,1,2,3,4],'long']])assert.equal(checkTiling('ribbon',a(s)).code,code);
 assert.equal(checkTiling('card',a([2,0,1],3)).ok,true);
});
test('reported unit count is distinct from blank/zero and inconsistent number',()=>{
 assert.equal(checkTiling('ribbon',a([0,1,2,3],null)).code,'number-empty');for(const n of[0,3,5])assert.equal(checkTiling('ribbon',a([0,1,2,3],n)).code,'number');
 for(const key of Object.keys(CASES)){const c=CASES[key],s=Array.from({length:c.length},(_,i)=>i);assert.equal(checkTiling(key,a(s,c.length)).ok,true);}
});
test('sparse/extra/invalid input cannot fabricate complete measurement',()=>{
 const extra=[0,1,2,3];extra.other=1;const hole=[0,1,2,3];delete hole[2];
 for(const starts of[Array(4),hole,extra,[0,1,2,NaN],[0,1,2,1.5],[-1,0,1,2],[0,1,2,7],null]){assert.equal(validStarts('ribbon',starts),false);assert.equal(checkTiling('ribbon',a(starts)).ok,false);}
 for(const bad of[[],null,{starts:[0,1,2,3]}, {...a([0,1,2,3]),extra:1},a([0,1,2,3],'4'),a([0,1,2,3],Infinity)])assert.equal(checkTiling('ribbon',bad).ok,false);
 assert.throws(()=>checkTiling('toString',a([0,1,2,3])),RangeError);
});
test('rendered geometry uses touching full-width units; key ignores piece IDs but includes semantic edits',()=>{
 const s=tilingSvg('ribbon',[0,1,2,3]);assert.match(s,/data-measured="true" x="24" y="47" width="168"/);assert.equal((s.match(/height="32"/g)||[]).length,4);assert.equal((s.match(/y="100" width="42"/g)||[]).length,4);
 for(const f of['worked.svg','gap.svg','transfer.svg']){const expected=f==='worked.svg'?tilingSvg('ribbon',[0,1,2,3]):f==='gap.svg'?tilingSvg('gap',[0,1,3]):tilingSvg('card',[0,1,2]);assert.equal(fs.readFileSync(new URL(f,import.meta.url),'utf8'),expected+'\n');}
 assert.equal(tilingKey('ribbon',a([0,1,2,3])),tilingKey('ribbon',a([3,2,1,0])));assert.notEqual(tilingKey('ribbon',a([0,1,2,3])),tilingKey('ribbon',a([0,1,1,3])));assert.notEqual(tilingKey('ribbon',a([0,1,2,3])),tilingKey('ribbon',a([0,1,2,3],null)));
});
