import test from'node:test';import assert from'node:assert/strict';
import{getCase,integer,checkStages,demoState}from'./lesson.mjs';
test('each supplied substitution and intermediate quantity has independent arithmetic meaning',()=>{
 const expected={linear:[4+4+4,4+4+4+2],paren:[3+5,(3+5)+(3+5)],signed:[-2-2-2-2,-2-2-2-2+9],fare:[5+5,3+5+5]};
 for(const[key,values]of Object.entries(expected)){assert(checkStages(key,values).ok);for(let i=0;i<2;i++){const wrong=[...values];wrong[i]++;assert(!checkStages(key,wrong).ok);}}
 assert.equal(checkStages('linear',[34,14]).code,'part');assert.equal(checkStages('paren',[8,11]).code,'total');assert.equal(checkStages('signed',[8,1]).code,'part');assert.equal(getCase('signed').total,1);
});
test('dense two-stage answers required; no sparse or extra stage can pass',()=>{
 const inherited=Array(2),proto=Object.create(Array.prototype);proto[0]=12;proto[1]=14;Object.setPrototypeOf(inherited,proto);
 for(const a of[null,{},[],Array(2),inherited,[12],[12,14,0],[12,undefined],[12,'14'],[NaN,14],[12,Infinity],[true,14]])assert(!checkStages('linear',a).ok);
});
test('case keys and values reject coercion, inherited property names and unsafe numerals',()=>{
 for(const key of[['linear'],new String('linear'),{},null,undefined,'constructor','__proto__',0]){assert.equal(getCase(key),null);assert(!checkStages(key,[12,14]).ok);}
 for(const value of['',' ','1e2','2x','1.5','9007199254740992',2,{},[],null])assert.equal(integer(value),null);
 for(const[s,n]of[['12',12],['12,00',12],['−8.0',-8],['−8',-8],['-8',-8],[' 0 ',0]])assert.equal(integer(s),n);
});
test('visual demo total conserves group members; all four steps use the same supplied value',()=>{
 for(let x=2;x<=6;x++)for(let step=0;step<=3;step++){const s=demoState(x,step);assert.equal(s.product,x+x+x);assert.equal(s.total,x+x+x+2);assert.equal(s.groups,3);assert.equal(s.extra,2);assert(s.text.includes(String(step===3?s.total:x)));}
 for(const[x,s]of[[1,0],[7,0],[4,-1],[4,4],['4',0],[4,'1'],[NaN,1],[4,.5]])assert.equal(demoState(x,s),null);
});
