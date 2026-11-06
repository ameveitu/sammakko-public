import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';
import{CASES,validCounts,changeShare,checkSharing,sharingKey,sharingSvg}from'./lesson.mjs';
test('partitive truth requires the entire given pile and equal shares for every recipient',()=>{
 for(const[key,c]of Object.entries(CASES))for(let code=0;code<(c.total+1)**c.recipients;code++){let n=code;const counts=Array.from({length:c.recipients},()=>{const v=n%(c.total+1);n=Math.floor(n/(c.total+1));return v;});const full=counts.reduce((x,y)=>x+y,0)===c.total,equal=counts.every(x=>x===counts[0]);assert.equal(checkSharing(key,{counts,reported:c.total/c.recipients}).ok,full&&equal);}
 assert.equal(checkSharing('three',{counts:[1,1,1],reported:1}).code,'left');assert.equal(checkSharing('three',{counts:[3,2,1],reported:2}).code,'unequal');assert.equal(checkSharing('three',{counts:[2,2,2],reported:3}).code,'number');
});
test('any allocation order conserves all original items and can be undone',()=>{
 const original=[0,0,0];let counts=original;for(const i of[2,2,0,0,1,1])counts=changeShare('three',counts,i,1);assert.deepEqual(original,[0,0,0]);assert.deepEqual(counts,[2,2,2]);assert.equal(checkSharing('three',{counts,reported:2}).ok,true);assert.deepEqual(changeShare('three',counts,0,1),counts);counts=changeShare('three',counts,2,-1);assert.deepEqual(counts,[2,2,1]);assert.equal(checkSharing('three',{counts,reported:2}).code,'left');
});
test('empty/short/sparse/extra/invalid sharing arrays and response shapes never pass',()=>{
 const extra=[2,2,2];extra.other=1;const hole=[2,2,2];delete hole[1];for(const counts of[[],[2],[2,2],Array(3),hole,[2,2,2,0],extra,[2,2,-1],[2,2,2.5],[2,2,NaN],[2,2,3]]){assert.equal(validCounts('three',counts),false);assert.equal(checkSharing('three',{counts,reported:2}).ok,false);}
 for(const a of[null,[],{counts:[2,2,2]},{counts:[2,2,2],reported:2,extra:true},{counts:[2,2,2],reported:'2'},{counts:[2,2,2],reported:Infinity}])assert.equal(checkSharing('three',a).ok,false);
 assert.equal(checkSharing('three',{counts:[2,2,2],reported:null}).code,'number-empty');assert.equal(checkSharing('three',{counts:[2,2,2],reported:0}).code,'number');assert.throws(()=>changeShare('three',[0,0,0],3,1),RangeError);
});
test('source figures and intermediate visual states contain exactly the conserved total',()=>{
 for(const[key,c]of Object.entries(CASES)){let counts=Array(c.recipients).fill(0);for(let i=0;i<=c.total;i++){const svg=sharingSvg(key,counts);assert.equal((svg.match(/data-token=/g)||[]).length,c.total);if(i<c.total)counts=changeShare(key,counts,i%c.recipients,1);}}
 assert.equal(fs.readFileSync(new URL('worked.svg',import.meta.url),'utf8'),sharingSvg('three',[2,2,2])+'\n');assert.equal(fs.readFileSync(new URL('unequal.svg',import.meta.url),'utf8'),sharingSvg('three',[3,2,1])+'\n');assert.notEqual(sharingKey('three',{counts:[2,2,2],reported:2}),sharingKey('three',{counts:[2,2,1],reported:2}));
});
