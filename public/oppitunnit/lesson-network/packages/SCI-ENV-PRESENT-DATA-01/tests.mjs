import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CASES,checkPresentation,presentationSvg} from './lesson.mjs';
test('construction checks every count, including zero and ties, with alternative row orders',()=>{
 for(let c=0;c<CASES.length;c++){const q=CASES[c].data;assert.equal(checkPresentation(c,[...q].reverse()).ok,true);for(let mask=0;mask<4**q.length;mask++){let n=mask;const a=q.map(r=>{const count=n%4;n=Math.floor(n/4);return{place:r.place,count};});assert.equal(checkPresentation(c,a).ok,a.every((r,i)=>r.count===q[i].count));}}
});
test('missing/extra/duplicate/sparse/unknown/invalid entries cannot earn success',()=>{
 assert.equal(checkPresentation(0,[]).ok,false);assert.equal(checkPresentation(0,[...CASES[0].data,CASES[0].data[0]]).ok,false);assert.equal(checkPresentation(0,[{place:null,count:null},{place:'kivi',count:1}]).code,'missing');assert.equal(checkPresentation(0,[{place:'penkki',count:3},{place:'penkki',count:1}]).code,'duplicate');
 for(const a of[Array(2),null,[{place:'__proto__',count:3},CASES[0].data[1]],[{place:'penkki',count:NaN},CASES[0].data[1]],[{place:'penkki',count:4},CASES[0].data[1]],[{place:'penkki',count:1.5},CASES[0].data[1]],[{place:'penkki',count:'3'},CASES[0].data[1]]])assert.throws(()=>checkPresentation(0,a),RangeError);
});
test('picture renders the actual answer counts rather than the target counts',()=>{
 for(let n=0;n<=3;n++){const s=presentationSvg(0,[{place:'penkki',count:n},{place:'kivi',count:0}]);assert.equal((s.match(/data-mark="leaf"/g)||[]).length,n);assert.match(s,/Yksi kuva = yksi lehti/);}
 const blank=presentationSvg(0,[{place:null,count:null},{place:'kivi',count:0}]);assert.match(blank,/>\?<\/text>/);assert.equal((blank.match(/data-mark=/g)||[]).length,0);assert.match(blank,/Kiven vieri: 0/);
});
test('static original figure has exactly three and one equal-size leaf markers',()=>{
 const s=fs.readFileSync(new URL('./presentation.svg',import.meta.url),'utf8');assert.equal((s.match(/data-mark="leaf"/g)||[]).length,4);assert.match(s,/Yksi kuva = yksi lehti/);
});
