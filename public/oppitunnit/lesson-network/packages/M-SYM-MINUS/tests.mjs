import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const xml = svgs => execFileSync('python3', ['-c', 'import json,sys,xml.etree.ElementTree as E; [E.fromstring(s) for s in json.load(sys.stdin)]'], {input: JSON.stringify(svgs)});
const read = f => fs.readFileSync(new URL(f, import.meta.url), 'utf8');

import {CASES, difference, removal, readSubtraction, checkSubtraction, modelSvg, practiceSvg} from './lesson.mjs';
test('Minus: independent absolute differences and actual removal endpoints', () => {
  for(let a=0;a<=10;a++)for(let b=0;b<=10;b++){
    assert.equal(difference(a,b),Math.max(a,b)-Math.min(a,b));
    for(let r=0;r<=b;r++)assert.deepEqual(removal(a,b,r),b<=a?{initial:a,planned:b,removed:r,remaining:a-r}:null);
  }
  for(const x of [null,undefined,[],{},'3',NaN,Infinity,-1,0.5,11]){assert.equal(difference(x,2),null);assert.equal(removal(5,2,x),null);}
  assert.equal(removal(5,2,3),null);
});
test('Minus: distinguish removed from remaining and difference from total; reversed owners supported', () => {
  for(const[key,c]of Object.entries(CASES)){
    const a=c.kind==='remove'?c.a:Math.max(c.a,c.b),b=c.kind==='remove'?c.b:Math.min(c.a,c.b);
    assert(checkSubtraction(key,`${a}-${b}`).ok);assert(checkSubtraction(key,`${a} − ${b}`).ok);
    assert(!checkSubtraction(key,`${b}-${a}`).ok);assert(!checkSubtraction(key,`${a}+${b}`).ok);
    assert(!checkSubtraction(key,`${a-b}`).ok);
  }
  assert(!checkSubtraction('snack','6-4').ok);
  assert(!checkSubtraction('snack','5-1').ok);assert.match(checkSubtraction('snack','5-1').message,/tulos on 4/);
  assert(checkSubtraction('shells','5-3').ok);assert.match(checkSubtraction('shells','5-3').message,/Mitään ei oteta pois/);
});
test('Minus: strict primitive input shape and bounded grammar', () => {
  for(const x of [null,{},[],['6-2'],4,'6-2=4','6--2','6-2;globalThis.x=1','1e1-2','6.0-2','1 0-2','11-2'])assert.equal(readSubtraction(x),null);
  for(const k of [null,[],['snack'],new String('snack'),'__proto__','constructor','SNACK']){assert(!checkSubtraction(k,'6-2').ok);assert.equal(practiceSvg(k),'');}
});
test('Minus: removal crossed objects vs unchanged paired sets have distinct geometric meanings', () => {
  const all=[];
  for(let i=0;i<=2;i++){const svg=modelSvg('remove',i);assert.equal([...svg.matchAll(/data-initial=/g)].length,5);assert.equal([...svg.matchAll(/data-removed=/g)].length,i);all.push(svg);}
  for(let i=0;i<=3;i++){const svg=modelSvg('compare',i);assert.equal([...svg.matchAll(/data-top=/g)].length,5);assert.equal([...svg.matchAll(/data-bottom=/g)].length,3);assert.equal([...svg.matchAll(/data-pair=/g)].length,i);assert.equal([...svg.matchAll(/data-unpaired=/g)].length,i===3?2:0);all.push(svg);}
  for(const[key,c]of Object.entries(CASES)){const svg=practiceSvg(key);if(c.kind==='remove'){assert.equal([...svg.matchAll(/data-initial=/g)].length,c.a);assert.equal([...svg.matchAll(/data-removed=/g)].length,c.b);}else{assert.equal([...svg.matchAll(/data-top=/g)].length,c.a);assert.equal([...svg.matchAll(/data-bottom=/g)].length,c.b);}all.push(svg);}
  xml(all);for(const i of[-1,4,'1',null,NaN,Infinity])assert.equal(modelSvg('compare',i),'');assert.equal(modelSvg('other',0),'');
});
test('Minus: immutable model data and exact shipped external SVGs', () => {
  assert(Object.isFrozen(CASES));for(const c of Object.values(CASES)){assert(Object.isFrozen(c));assert.throws(()=>{c.b=0;},TypeError);}
  for(const[f,svg]of[['remove-start.svg',modelSvg('remove',0)],['remove-end.svg',modelSvg('remove',2)],['compare-end.svg',modelSvg('compare',3)],['practice.svg',practiceSvg('snack')]])assert.equal(read(f),svg+'\n');
});

test('Package: local CSS actually linked, purpose/action before optional explanation, no gated stages', () => {
  const b=read('body.html');assert.match(b,/^<link rel="stylesheet" href="lesson.css">/);
  assert(b.indexOf('class="sym-primary"')<b.indexOf('<summary>'));
  assert.match(b,/<nav aria-label="Oppitunnin kohdat"(?:\s[^>]*)?>/);assert.match(b,/<noscript(?:\s[^>]*)?>/);
  const p=JSON.parse(read('lesson.json'));assert.equal(p.planning.canonical.grade_band,'1-2');assert.equal(p.planning.canonical.mastery_role,'atomic');assert.deepEqual(p.planning.canonical.prerequisite_groups[0].all_of,['M-NUM-03']);
  const human=p.reviews.filter(x=>x.kind==='human').at(-1);assert.equal(human.state,'pending');assert.match(human.revision,/^[1-9]\d*@[a-f0-9]{64}$/);
  // Real content/alignment reviews may close independently; never assert they stay pending.
});
