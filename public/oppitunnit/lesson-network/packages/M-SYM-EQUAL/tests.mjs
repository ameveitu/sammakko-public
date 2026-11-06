import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const xml = svgs => execFileSync('python3', ['-c', 'import json,sys,xml.etree.ElementTree as E; [E.fromstring(s) for s in json.load(sys.stdin)]'], {input: JSON.stringify(svgs)});
const read = f => fs.readFileSync(new URL(f, import.meta.url), 'utf8');

import {CASES, amount, relation, quantityState, readCount, checkEquality, equalSvg} from './lesson.mjs';
test('Equal: independently calculated quantities, symmetric equality and both composed sides', () => {
  for(let a=0;a<=8;a++)for(let b=0;b<=8;b++)for(let c=0;c<=8;c++)for(let d=0;d<=8;d++){
    const expected=a+b<=10&&c+d<=10?a+b===c+d:null;
    assert.equal(relation([a,b],[c,d]),expected);assert.equal(relation([c,d],[a,b]),expected);
  }
  assert(relation([0],[0]));assert(relation([5],[4,1]));assert(relation([3,1],[2,2]));assert.equal(relation([3,1],[2,4]),false);
});
test('Equal: current case part is checked against the whole other side; total is not missing part', () => {
  for(const[key,c]of Object.entries(CASES))for(let n=0;n<=8;n++)for(const swapped of[false,true]){
    const total=c.left.reduce((a,b)=>a+b,0),s=quantityState(key,n,swapped);
    assert.equal(s.equal,total===c.fixed+n);assert.equal(checkEquality(key,n,swapped).ok,total===c.fixed+n);
    assert.equal(s.leftTotal,swapped?c.fixed+n:total);assert.equal(s.rightTotal,swapped?total:c.fixed+n);
  }
  assert(checkEquality('parts',2).ok);assert(!checkEquality('parts',4).ok);assert(!checkEquality('parts',6).ok);
});
test('Equal: exact dense arrays, no extra or symbolic keys, strict primitive quantity and case', () => {
  for(const bad of[[],[1,2,3],Array(1),Object.assign(Array(2),{0:2}),Object.assign([1,2],{x:1}),Object.assign([1,2],{[Symbol()]:1}),['1'],[NaN],[Infinity],[-1],[0.5],[9],null,{},'1']){assert.equal(amount(bad),null);assert.equal(relation(bad,[1]),null);}
  for(const k of [null,[],['berries'],new String('berries'),'__proto__','constructor'])assert.equal(quantityState(k,5),null);
  for(const n of [null,[],{},'5',NaN,Infinity,-1,0.5,9]){assert(!checkEquality('berries',n).ok);assert.equal(equalSvg('berries',n),'');}
  for(const x of ['true',1,null,[]])assert.equal(quantityState('berries',5,x),null);
  for(const raw of [null,5,{},[], '', '1e0','1.0','9','-1','1 0'])assert(Number.isNaN(readCount(raw)));
  assert.equal(readCount(' 0 '),0);assert.equal(readCount('5'),5);
});
test('Equal: SVG displays exactly the totals for every case, side swap and spacing; valid external XML', () => {
  const all=[];for(const key of Object.keys(CASES))for(let n=0;n<=8;n++)for(const swap of[false,true])for(const spread of[false,true]){
    const s=quantityState(key,n,swap),svg=equalSvg(key,n,swap,spread);assert.equal([...svg.matchAll(/data-left=/g)].length,s.leftTotal);assert.equal([...svg.matchAll(/data-right=/g)].length,s.rightTotal);assert(svg.includes(s.equal?'>=</text>':'>≠</text>'));all.push(svg);
  }
  xml(all);assert.equal(equalSvg('berries',5,false,'true'),'');
  assert.equal(read('start.svg'),equalSvg('berries',4)+'\n');assert.equal(read('parts.svg'),equalSvg('parts',2)+'\n');assert.equal(read('too-many.svg'),equalSvg('parts',4)+'\n');
  const five=read('five.svg');assert.equal([...five.matchAll(/data-left=/g)].length,5);assert.equal([...five.matchAll(/data-right=/g)].length,5);assert.match(five,/>4 \+ 1</);xml([five]);
});
test('Equal: configurations are deeply frozen; caller edits to returned state cannot change truth', () => {
  assert(Object.isFrozen(CASES));for(const c of Object.values(CASES)){assert(Object.isFrozen(c));assert(Object.isFrozen(c.left));assert.throws(()=>{c.left[0]=0;},TypeError);}
  const a=quantityState('parts',2);a.left[0]=8;a.right.push(8);assert(checkEquality('parts',2).ok);
});

test('Package: local CSS actually linked, purpose/action before optional explanation, no gated stages', () => {
  const b=read('body.html');assert.match(b,/^<link rel="stylesheet" href="lesson.css">/);
  assert(b.indexOf('class="sym-primary"')<b.indexOf('<summary>'));
  assert.match(b,/<nav aria-label="Oppitunnin kohdat"(?:\s[^>]*)?>/);assert.match(b,/<noscript(?:\s[^>]*)?>/);
  const p=JSON.parse(read('lesson.json'));assert.equal(p.planning.canonical.grade_band,'1-2');assert.equal(p.planning.canonical.mastery_role,'atomic');assert.deepEqual(p.planning.canonical.prerequisite_groups[0].all_of,['M-NUM-03']);
  const human=p.reviews.filter(x=>x.kind==='human').at(-1);assert.equal(human.state,'pending');assert.match(human.revision,/^[1-9]\d*@[a-f0-9]{64}$/);
  // Real content/alignment reviews may close independently; never assert they stay pending.
});
