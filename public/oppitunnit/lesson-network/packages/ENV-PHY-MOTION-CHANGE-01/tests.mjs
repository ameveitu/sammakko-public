import test from 'node:test';import assert from 'node:assert/strict';
import {CASES,positionAt,advance,checkChange,sceneSvg}from'./lesson.mjs';
test('constant clock intervals give the intended observed changes with fixed reference',()=>{
 const delta=(key,a,b)=>positionAt(key,b).x-positionAt(key,a).x;
 assert.equal(delta('steady',0,2),delta('steady',4,6));assert.ok(delta('faster',0,2)<delta('faster',4,6));assert.ok(delta('slower',0,2)>delta('slower',4,6));assert.ok(delta('stop',0,2)>0);assert.equal(delta('stop',4,6),0);assert.ok(delta('turn',0,2)>0);assert.ok(delta('turn',4,6)<0);assert.equal(positionAt('turn',0).x,positionAt('turn',6).x);
 for(const key of Object.keys(CASES))for(let t=0;t<=6;t+=.125){const p=positionAt(key,t);assert.ok(p.x>=60&&p.x<=240);assert.equal(p.y,84);assert.equal(p.referenceX,285);}
 assert.equal(positionAt('transfer',2).x,positionAt('transfer',4).x);assert.ok(delta('transfer',4,6)<0);
});
test('each question accepts its intended observation and rejects other supported descriptions',()=>{
 for(const[key,c]of Object.entries(CASES)){if(key==='transfer')continue;for(const answer of c.options)assert.equal(checkChange(key,answer).ok,answer===c.answer);assert.equal(checkChange(key,null).ok,false);assert.throws(()=>checkChange(key,'unsupported'),RangeError);}
 assert.equal(checkChange('transfer',['go','stop','back']).ok,true);assert.equal(checkChange('transfer',['back','stop','go']).ok,false);assert.equal(checkChange('transfer',['go',null,'back']).ok,false);
});
test('sparse/extra/invalid sequences and nonfinite clocks cannot pass',()=>{
 for(const a of[[],Array(3),['go','stop'],['go','stop','back','go'],['go',undefined,'back'],['go','wrong','back'],null])assert.throws(()=>checkChange('transfer',a),RangeError);
 for(const t of[NaN,Infinity,-1,7])assert.throws(()=>positionAt('stop',t),RangeError);assert.throws(()=>positionAt('__proto__',0),RangeError);assert.throws(()=>advance(0,NaN),RangeError);assert.throws(()=>advance(0,-1),RangeError);assert.equal(advance(advance(0,1),2),advance(0,3));assert.equal(advance(5,2),6);
});
test('real object positions and helper line do not falsify model or create extra objects',()=>{
 for(const key of Object.keys(CASES)){const start=sceneSvg(key,0),later=sceneSvg(key,2);assert.notEqual(start,later);assert.equal((later.match(/data-mover/g)||[]).length,1);assert.match(later,/data-reference transform="translate\(285 84\)"/);const helped=sceneSvg(key,4,true);assert.match(helped,/Katkoviiva: lähtöpaikka/);assert.equal((helped.match(/data-mover/g)||[]).length,1);}
});
test('all task helpers reject coerced keys while canonical string tasks retain their meaning',()=>{
 for(const key of [[],['stop'],['transfer'],new String('stop'),{toString:()=> 'stop'},null,undefined,0,true,NaN,Symbol('stop')]){
  assert.throws(()=>positionAt(key,6),RangeError);
  assert.throws(()=>checkChange(key,'stop'),RangeError);
  assert.throws(()=>sceneSvg(key,6),RangeError);
 }
 assert.equal(positionAt('stop',6).x,150);
 assert.equal(checkChange('stop','stop').ok,true);
 assert.equal(checkChange('stop','go').ok,false);
 assert.equal(checkChange('transfer',['go','stop','back']).ok,true);
 assert.match(sceneSvg('stop',6),/data-mover transform="translate\(150 84\)"/);
});
