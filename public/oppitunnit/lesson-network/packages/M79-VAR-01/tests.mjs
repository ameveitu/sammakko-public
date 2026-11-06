import test from 'node:test';
import assert from 'node:assert/strict';
import {packTotal, checkPlans, checkOrder, checkIntegration, readInteger} from './lesson.mjs';
test('all two-plan alternatives and both constrained orders integrate both roles', () => {
 for (let a=0;a<=6;a++) for(let b=0;b<=6;b++) for(const target of [12,15]) {
  const r=checkIntegration([[a,a+a+a],[b,b+b+b]],target/3,target);assert.equal(r.ok,a!==b);
 }
 assert.equal(checkIntegration([[2,6],[5,15]],4,12).ok,true);
 assert.equal(checkIntegration([[5,15],[2,6]],4,12).ok,true);
 assert.equal(checkIntegration([[2,6],[5,15]],5,12).ok,false);
 assert.equal(checkIntegration([[2,6],[2,6]],4,12).ok,false);
});
test('same n means same group size; zero is valid and domain is a contextual restriction',()=>{
 for(let n=0;n<=6;n++)assert.equal(packTotal(n),n+n+n);
 for(const n of [-1,7,.5,NaN,Infinity,'4',null,[],true])assert.equal(packTotal(n),null);
 assert.match(checkPlans([[2,12],[5,15]]).message,/2 \+ 2 \+ 2 = 6/);
 assert.equal(checkPlans([[0,0],[6,18]]).ok,true);
 for(const t of [0,18,'12',[12],null,NaN])assert.equal(checkOrder(4,t).ok,false);
 for(const target of [12,15]) for(let n=0;n<=6;n++)assert.equal(checkOrder(n,target).ok,3*n===target);
});
test('sparse plans and tuples, duplicates, extras, coercions and malformed inputs rejected',()=>{
 const sparse=[[2,6],[5,15]];delete sparse[1]; const holeTuple=[[2,6],[5,15]];delete holeTuple[1][0];
 for(const plans of [null,{},[],Array(2),sparse,holeTuple,[[2,6]],[[2,6],[5,15],[4,12]],[[2,6,9],[5,15]],[[2,'6'],[5,15]],[[2,6],[5]],[[2,6],undefined],[[2,6],[2,6]]])assert.equal(checkPlans(plans).ok,false);
 for(let i=0;i<2;i++)for(let j=0;j<2;j++)for(const v of [null,undefined,'2',NaN,Infinity,{},[2],true]){const p=[[2,6],[5,15]];p[i][j]=v;assert.equal(checkPlans(p).ok,false);}
});
test('new target or proposal rechecks truth; parser does not coerce empty or noninteger answers',()=>{
 assert.equal(checkOrder(4,12).ok,true);assert.equal(checkOrder(4,15).ok,false);assert.equal(checkOrder(5,15).ok,true);
 for(const v of ['', ' ', '-1', '2.5', '2x', '1e1', null, 2, []])assert.equal(readInteger(v),null);
 assert.equal(readInteger(' 0 '),0);assert.equal(readInteger('6'),6);
});
