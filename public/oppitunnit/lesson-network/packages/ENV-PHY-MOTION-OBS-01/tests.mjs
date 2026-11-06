import test from 'node:test';
import assert from 'node:assert/strict';
import {CASES,frameAt,advance,sceneSvg,checkMotion} from './lesson.mjs';
test('actual trajectories retain fixed references and exact still coordinates',()=>{
 for(let c=0;c<CASES.length;c++)for(let t=0;t<=6;t+=.125){const frame=frameAt(c,t);assert.equal(frame.length,2);for(const[f,i]of frame.map((f,i)=>[f,i])){assert.ok(f.x>=70&&f.x<=195);assert.equal(f.y,62+i*100);assert.equal(f.referenceX,270);assert.equal(f.referenceY,62+i*100);if(['still','colour'].includes(CASES[c].acts[i]))assert.equal(f.x,70);}}
 assert.equal(frameAt(1,0)[0].x,frameAt(1,6)[0].x);assert.equal(frameAt(1,3)[0].x,195);assert.notEqual(frameAt(1,0)[1].colour,frameAt(1,6)[1].colour);assert.equal(frameAt(1,0)[1].x,frameAt(1,6)[1].x);
});
test('classification concerns observed whole trajectory, including return and explicit no movement',()=>{
 const truths=[[true,false],[true,false],[false,true],[true,true],[false,false]];
 truths.forEach((correct,i)=>{for(const a of [false,true])for(const b of[false,true])assert.equal(checkMotion(i,[a,b]).ok,a===correct[0]&&b===correct[1]);assert.equal(checkMotion(i,[null,correct[1]]).ok,false);});
 assert.match(checkMotion(1,[false,false]).message,/palasi/);
});
test('finite model clock is partition independent and unsupported/sparse answers never pass',()=>{
 assert.equal(advance(0,1.5),advance(advance(0,.5),1));assert.equal(advance(5,9),6);for(const bad of [NaN,Infinity,-1,7])assert.throws(()=>frameAt(0,bad),RangeError);for(const bad of [NaN,Infinity,-1])assert.throws(()=>advance(0,bad),RangeError);
 for(const a of [[],Array(2),[true], [true,false,true],[1,0],[undefined,false],null])assert.throws(()=>checkMotion(0,a),RangeError);assert.throws(()=>checkMotion(8,[true,false]),RangeError);
});
test('original SVG actually moves objects without moving the reference',()=>{
 const start=sceneSvg(0,0),middle=sceneSvg(0,3);assert.match(start,/data-object="0" transform="translate\(70 62\)"/);assert.match(middle,/data-object="0" transform="translate\(132.5 62\)"/);assert.match(middle,/data-object="1" transform="translate\(70 162\)"/);for(const s of[start,middle])assert.match(s,/data-reference="0" transform="translate\(270 62\)"/);
});

for(const c of CASES)assert.match(c.name,/^Tapahtuma [A-E]/);
