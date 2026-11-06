import test from 'node:test';
import assert from 'node:assert/strict';
import {CASES,checkRecord,observationSvg} from './lesson.mjs';
test('all supported object choices preserve place bindings; alternate row order is valid',()=>{
 for(let c=0;c<CASES.length;c++){const correct=CASES[c];assert.equal(checkRecord(c,[...correct].reverse()).ok,true);for(let mask=0;mask<3**correct.length;mask++){let n=mask;const answer=correct.map(r=>{const item=['lehti','kukka','kivi'][n%3];n=Math.floor(n/3);return{place:r.place,item};});assert.equal(checkRecord(c,answer).ok,answer.every((r,i)=>r.item===correct[i].item));}}
});
test('repair requires actual source correspondence and leaves valid rows intact',()=>{
 const q=CASES[1],wrong=q.map((r,i)=>({place:r.place,item:q[(i+1)%2].item}));assert.equal(checkRecord(1,wrong).code,'item');wrong[0].item=q[0].item;assert.equal(checkRecord(1,wrong).ok,false);wrong[1].item=q[1].item;assert.equal(checkRecord(1,wrong).ok,true);assert.equal(checkRecord(0,CASES[0].map(r=>({...r,item:null}))).code,'missing');
});
test('empty/extra/sparse/duplicate/unknown/malformed notebooks cannot pass',()=>{
 assert.equal(checkRecord(0,[]).ok,false);assert.equal(checkRecord(0,[...CASES[0],{place:'alusta',item:'kivi'}]).ok,false);
 for(const a of[Array(2),[CASES[0][0],CASES[0][0]],[{place:'__proto__',item:'lehti'},{place:'kivi',item:'kukka'}],[{place:'penkki',item:'constructor'},CASES[0][1]],[{place:'penkki'},CASES[0][1]],null])assert.throws(()=>checkRecord(0,a),RangeError);
});
test('visible source gives the same specific place/item information as checker',()=>{
 for(let c=0;c<CASES.length;c++){const s=observationSvg(c);assert.equal((s.match(/<rect /g)||[]).length,CASES[c].length);assert.ok(s.includes('Mallihavainnot'));assert.ok(s.includes('viewBox="0 0 320 '+CASES[c].length*90+'"'));}assert.throws(()=>observationSvg(-1),RangeError);
});
