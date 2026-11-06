import test from 'node:test';
import assert from 'node:assert/strict';
import {situations,checkSituation,traceState,traceSvg} from './lesson.mjs';
test('physical referent, drawing and thin paper remain distinct',()=>{
  const expected=['object','drawing','drawing','object'];
  expected.forEach((answer,i)=>{assert.equal(checkSituation(i,answer).ok,true);assert.equal(checkSituation(i,answer==='object'?'drawing':'object').ok,false);assert.ok(checkSituation(i,answer).message.length>70);});
  assert.equal(situations.length,4);
});
test('only the selected flat base is traced; cube and cylinder differ',()=>{
  for(const model of ['cube','can'])for(let step=0;step<3;step++){const s=traceState(model,step);assert.equal(s.outline,step===2?(model==='cube'?'square':'circle'):null);assert.match(traceSvg(model,step),/role="img"/);}
  assert.match(traceSvg('cube',2),/width="108" height="108"/);assert.match(traceSvg('can',2),/r="54"/);
  assert.throws(()=>traceState('ball',2),RangeError);assert.throws(()=>traceState('cube',3),RangeError);
});
