import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const xml = svgs => execFileSync('python3', ['-c', 'import json,sys,xml.etree.ElementTree as E; [E.fromstring(s) for s in json.load(sys.stdin)]'], {input: JSON.stringify(svgs)});
const read = f => fs.readFileSync(new URL(f, import.meta.url), 'utf8');

import {CASES, union, readAddition, checkAddition, modelSvg, practiceSvg} from './lesson.mjs';
test('Plus: independently calculated bounded unions, both orders and zero', () => {
  for (let a = 0; a <= 10; a++) for (let b = 0; b <= 10; b++) {
    assert.equal(union(a,b), a+b <= 10 ? a+b : null);
    assert.equal(union(a,b), union(b,a));
  }
  for (const bad of [null,undefined,[],{},'3',NaN,Infinity,-1,0.5,11]) {assert.equal(union(bad,2),null);assert.equal(union(2,bad),null);}
});
test('Plus: each pictured union accepts commuted operands; equal result is not the pictured parts', () => {
  for (const [key,c] of Object.entries(CASES)) {
    assert(checkAddition(key,`${c.a}+${c.b}`).ok);
    assert(checkAddition(key,` ${c.b} + ${c.a} `).ok);
    assert(!checkAddition(key,`${c.a+c.b}`).ok);
    assert(!checkAddition(key,`${c.a+c.b}+${c.b}`).ok);
  }
  assert(!checkAddition('shells','3 + 3').ok);
  assert.match(checkAddition('shells','3 + 3').message,/yhteismäärä on 6/);
});
test('Plus: primitive keys, bounded syntax, no coercion/evaluation/injection', () => {
  for (const x of [null,{},[],['2+4'],4,'2+4=6','1e0+2','2++4','-2+4','11+0','2.0+4','2 0+4','2+4;alert(1)','<img src=x>']) assert.equal(readAddition(x),null);
  for (const k of [null,[],['shells'],new String('shells'),'__proto__','constructor','SHELLS']) {assert(!checkAddition(k,'2+4').ok);assert.equal(practiceSvg(k),'');}
  assert.deepEqual(readAddition('02 + 04'),[2,4]);
});
test('Plus: sequential arrival conserves initial, arrived and waiting objects; union conserves all objects', () => {
  const all=[];
  for(let step=0;step<=2;step++){const svg=modelSvg('arrival',step);assert.equal([...svg.matchAll(/data-initial=/g)].length,3);assert.equal([...svg.matchAll(/data-arrived=/g)].length,step);assert.equal([...svg.matchAll(/data-waiting=/g)].length,2-step);all.push(svg);}
  for(let step=0;step<=1;step++){const svg=modelSvg('union',step);assert.equal([...svg.matchAll(/data-first=/g)].length,3);assert.equal([...svg.matchAll(/data-part-b=/g)].length,2);all.push(svg);}
  for(const [key,c]of Object.entries(CASES)){const svg=practiceSvg(key);assert.equal([...svg.matchAll(/data-first=/g)].length,c.a);assert.equal([...svg.matchAll(/data-part-b=/g)].length,c.b);all.push(svg);}
  xml(all);
  for(const k of ['bad',null,[],{}])assert.equal(modelSvg(k,0),'');
  for(const n of [-1,3,'1',null,NaN,Infinity])assert.equal(modelSvg('arrival',n),'');
});
test('Plus: immutable cases and shipped diagrams match actual generators', () => {
  assert(Object.isFrozen(CASES));for(const c of Object.values(CASES)){assert(Object.isFrozen(c));assert.throws(()=>{c.a=9;},TypeError);}
  for(const[f,svg]of [['arrival-start.svg',modelSvg('arrival',0)],['arrival-end.svg',modelSvg('arrival',2)],['union-end.svg',modelSvg('union',1)],['practice.svg',practiceSvg('shells')]])assert.equal(read(f),svg+'\n');
});

test('Package: local CSS actually linked, purpose/action before optional explanation, no gated stages', () => {
  const b=read('body.html');assert.match(b,/^<link rel="stylesheet" href="lesson.css">/);
  assert(b.indexOf('class="sym-primary"')<b.indexOf('<summary>'));
  assert.match(b,/<nav aria-label="Oppitunnin kohdat"(?:\s[^>]*)?>/);assert.match(b,/<noscript(?:\s[^>]*)?>/);
  const p=JSON.parse(read('lesson.json'));assert.equal(p.planning.canonical.grade_band,'1-2');assert.equal(p.planning.canonical.mastery_role,'atomic');assert.deepEqual(p.planning.canonical.prerequisite_groups[0].all_of,['M-NUM-03']);
  const human=p.reviews.filter(x=>x.kind==='human').at(-1);assert.equal(human.state,'pending');assert.match(human.revision,/^[1-9]\d*@[a-f0-9]{64}$/);
  // Real content/alignment reviews may close independently; never assert they stay pending.
});
