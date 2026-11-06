import test from 'node:test';
import assert from 'node:assert/strict';
import {FACTS,QUESTIONS,toggleFact,checkFacts} from './lesson.mjs';
test('every subset is checked against the current question, not against all numbers',()=>{
 const expected=[['start','added'],['colour'],['books']];
 for(let q=0;q<3;q++)for(let mask=0;mask<16;mask++){const selected=FACTS.filter((_,i)=>mask&(1<<i)).map(f=>f.id);const right=selected.length===expected[q].length&&selected.every(x=>expected[q].includes(x));assert.equal(checkFacts(q,selected).ok,right);}
 assert.equal(QUESTIONS.length,3);
});
test('the same fact changes relevance with the question; corrections are reversible',()=>{
 assert.equal(checkFacts(0,['start','added','colour']).ok,false);assert.equal(checkFacts(1,['colour']).ok,true);assert.equal(checkFacts(1,['start','added']).ok,false);
 let selected=toggleFact([],'books');assert.deepEqual(selected,['books']);selected=toggleFact(selected,'books');assert.deepEqual(selected,[]);
 assert.match(checkFacts(0,['start']).text,/2 kynää/);assert.match(checkFacts(0,['books']).text,/ei vastaa/);
});
test('unknown information is not silently accepted as a relevant observation',()=>{
 assert.throws(()=>toggleFact([],'unknown'),RangeError);assert.throws(()=>checkFacts(3,[]),RangeError);assert.throws(()=>checkFacts(0,['unknown']),RangeError);
});

test('sparse fact selections never count as a complete observation',()=>{const xs=Array(2);xs[0]='colour';assert.throws(()=>checkFacts(1,xs),RangeError);assert.equal(checkFacts(1,['colour']).ok,true);});
