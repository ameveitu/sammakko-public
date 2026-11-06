import test from 'node:test';
import assert from 'node:assert/strict';
import {OBSERVATIONS,evaluateRule,checkRule,squareEdges,squaresScene,checkFormula} from './lesson.mjs';
test('all bounded candidate constructions are checked on every supplied pair',()=>{
 for(let a=1;a<=4;a++)for(let b=-2;b<=4;b++){const result=checkRule(a,b);assert.equal(result.ok,a===3&&b===2);if(!result.ok)assert.match(result.text,/Vastaesimerkki/);}
 assert.equal(evaluateRule(1,4,1),5);assert.equal(evaluateRule(1,4,2),6);assert.match(checkRule(3,2).text,/ei yksin todista ainoaa/);
});
test('finite agreement does not establish uniqueness among unrestricted rules',()=>{
 const alternative=x=>3*x+2+(x-1)*(x-2)*(x-4);for(const p of OBSERVATIONS)assert.equal(alternative(p.input),p.output);assert.notEqual(alternative(3),evaluateRule(3,2,3));
});
test('unsupported rule inputs cannot pass vacuously or produce NaN feedback',()=>{
 for(const bad of [NaN,Infinity,-Infinity,'3',null,undefined]){assert.throws(()=>checkRule(bad,2),RangeError);assert.throws(()=>checkRule(3,bad),RangeError);}
 const sparse=Array(3);sparse[0]={input:1,output:5};
 for(const pairs of [[],Array(1),sparse,null,{},'pairs',[null],[{}],[[1,5]],[{input:1}],[{output:5}],[{input:'1',output:5}],[{input:NaN,output:5}],[{input:1,output:Infinity}]])assert.throws(()=>checkRule(3,2,pairs),RangeError);
 assert.throws(()=>checkRule(Number.MAX_VALUE,0,[{input:2,output:1}]),RangeError);
 const ordinary=checkRule(1,4,[{input:1,output:5},{input:2,output:8}]);assert.equal(ordinary.ok,false);assert.match(ordinary.text,/syötteellä 2/);
 assert.equal(checkRule(3,2,[{input:1,output:5}]).ok,true);
});
test('adjacent squares deduplicate their shared edge and add exactly three new edges',()=>{
 for(let n=1;n<=8;n++){const edges=squareEdges(n);assert.equal(edges.length,4*n-(n-1));assert.equal(new Set(edges.map(e=>e.key)).size,edges.length);assert.equal(edges.filter(e=>e.addedAt===n).length,n===1?4:3);assert.ok(edges.every(e=>Math.abs(e.x2-e.x1)+Math.abs(e.y2-e.y1)===1));
 const svg=squaresScene(n),lines=[...svg.matchAll(/<line data-edge="[^"]+" x1="([^"]+)" y1="([^"]+)" x2="([^"]+)" y2="([^"]+)"/g)];assert.equal(lines.length,edges.length);for(const p of lines)assert.equal(Math.hypot(+p[3]-+p[1],+p[4]-+p[2]),32);}
 for(const n of [0,9,1.5])assert.throws(()=>squareEdges(n),RangeError);
});
test('equivalent structural formulas accepted; a single coincidental match does not suffice',()=>{
 assert.equal(checkFormula('shared').ok,true);assert.equal(checkFormula('first').ok,true);assert.equal(checkFormula('separate').ok,false);assert.match(checkFormula('separate').text,/2 vierekkäistä/);assert.equal(checkFormula('missing').ok,false);assert.throws(()=>checkFormula('other'),RangeError);
});

test('custom observation feedback does not invent a fixed number of pairs',()=>{const r=checkRule(3,2,[{input:1,output:5}]);assert.equal(r.ok,true);assert.match(r.text,/annettuihin pareihin/);assert.doesNotMatch(r.text,/kolmeen/);});
