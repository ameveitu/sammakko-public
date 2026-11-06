import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';
import{CASES,groupingState,changeGroups,checkGrouping,groupingKey,groupingSvg}from'./lesson.mjs';
test('quotitive response counts groups, not known group size or original whole',()=>{
 for(const[key,c]of Object.entries(CASES)){const target=c.total/c.size;for(let groups=0;groups<=target;groups++)for(let reported=0;reported<=12;reported++)assert.equal(checkGrouping(key,{groups,reported}).ok,groups===target&&reported===target);assert.equal(checkGrouping(key,{groups:target,reported:null}).code,'number-empty');}
 assert.equal(checkGrouping('pairs',{groups:4,reported:2}).code,'number');assert.equal(checkGrouping('equal',{groups:3,reported:3}).ok,true,'equal numerical roles remain valid');
});
test('forming and undoing whole groups conserves items at every supported state',()=>{
 for(const[key,c]of Object.entries(CASES)){let groups=0;for(let n=0;n<=c.total/c.size;n++){const s=groupingState(key,groups);assert.equal(s.remaining+s.groups*s.size,c.total);const svg=groupingSvg(key,groups);assert.equal((svg.match(/data-token=/g)||[]).length,c.total);assert.equal((svg.match(/data-group=/g)||[]).length,groups);groups=changeGroups(key,groups,1);}assert.equal(groups,c.total/c.size);assert.equal(changeGroups(key,groups,1),groups);assert.equal(changeGroups(key,groups,-1),groups-1);assert.equal(changeGroups(key,0,-1),0);}
});
test('missing/extra/array/sparse/invalid response states cannot earn success',()=>{
 for(const a of[null,[],Array(2),{groups:4},{groups:4,reported:4,extra:1},{groups:4,reported:'4'},{groups:NaN,reported:4},{groups:Infinity,reported:4},{groups:4.5,reported:4},{groups:-1,reported:4},{groups:5,reported:4},{groups:4,reported:NaN}])assert.equal(checkGrouping('pairs',a).ok,false);
 assert.throws(()=>groupingState('pairs',NaN),RangeError);assert.throws(()=>groupingState('toString',4),RangeError);assert.throws(()=>changeGroups('pairs',1,2),RangeError);
});
test('same whole produces different numbers of groups and static diagrams match model',()=>{
 assert.equal(CASES.pairs.total,CASES.fours.total);assert.equal(groupingState('pairs',4).remaining,0);assert.equal(groupingState('fours',2).remaining,0);assert.equal(fs.readFileSync(new URL('worked.svg',import.meta.url),'utf8'),groupingSvg('pairs',4,true)+'\n');assert.equal(fs.readFileSync(new URL('fours.svg',import.meta.url),'utf8'),groupingSvg('fours',2,true)+'\n');assert.notEqual(groupingKey('pairs',{groups:4,reported:4}),groupingKey('fours',{groups:2,reported:2}));
});
