import test from 'node:test';import assert from 'node:assert/strict';
import {CASES,checkIntegration,posterSvg,observationSvg}from'./lesson.mjs';
const records=i=>CASES[i].map(({place,count})=>({place,count}));
test('integration requires source→record fidelity and complete record→presentation assembly',()=>{
 for(let i=0;i<CASES.length;i++){const r=records(i),p=r.map(r=>r.place);assert.equal(checkIntegration(i,r,p).ok,true);assert.equal(checkIntegration(i,[...r].reverse(),[...p].reverse()).ok,true);assert.equal(checkIntegration(i,r,p.map((v,j)=>j?null:v)).code,'poster-missing');assert.equal(checkIntegration(i,r,p.map(()=>p[0])).code,'poster-duplicate');r[0].count=(r[0].count+1)%4;assert.equal(checkIntegration(i,r,p).code,'record-count');}
});
test('every supported count combination checked; repeated quantities/zero are legitimate',()=>{
 for(let i=0;i<CASES.length;i++){const q=records(i),p=q.map(r=>r.place);for(let n=0;n<4**q.length;n++){let v=n;const r=q.map(r=>{const count=v%4;v=Math.floor(v/4);return{place:r.place,count};});assert.equal(checkIntegration(i,r,p).ok,r.every((r,j)=>r.count===q[j].count));}}
 const r=records(2),p=r.map(r=>r.place);assert.deepEqual(r.map(r=>r.count),[2,2,0]);assert.equal(checkIntegration(2,r,p).ok,true);r[2].count=null;assert.equal(checkIntegration(2,r,p).code,'record-missing');
});
test('missing/extra/sparse/duplicate/unsupported records and poster rows cannot pass',()=>{
 const r=records(0),p=r.map(r=>r.place);assert.equal(checkIntegration(0,[],p).ok,false);
 for(const bad of[Array(2),[r[0],r[0]],[{place:'__proto__',count:2},r[1]],[{place:'penkki',count:NaN},r[1]],[{place:'penkki',count:4},r[1]],[{place:'penkki',count:1.5},r[1]],[{place:'penkki',count:'2'},r[1]],null])assert.throws(()=>checkIntegration(0,bad,p),RangeError);
 for(const bad of[[],Array(2),['penkki'],['penkki','kivi','penkki'],['penkki','unknown'],null])assert.throws(()=>checkIntegration(0,r,bad),RangeError);
});
test('presentation faithfully displays current notebook even when it is wrong, never hidden correct data',()=>{
 const r=records(0),p=r.map(r=>r.place);assert.equal((posterSvg(0,r,p).match(/data-item=/g)||[]).length,3);r[0].count=3;assert.equal((posterSvg(0,r,p).match(/data-item=/g)||[]).length,4);assert.equal(checkIntegration(0,r,p).ok,false);r[0].count=2;assert.equal(checkIntegration(0,r,p).ok,true);assert.match(observationSvg(2),/Ei yhtään kukkaa/);assert.throws(()=>posterSvg(0,[{place:'penkki',count:Infinity},r[1]],p),RangeError);
});
