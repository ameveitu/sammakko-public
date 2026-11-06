import test from 'node:test';
import assert from 'node:assert/strict';
import {TASKS,sumValue,checkConnection,counterPositions,counterScene} from './lesson.mjs';
test('each pictured grouping has a constructed sum and two defined factor roles',()=>{
 for(const task of TASKS){const terms=Array(task.groups).fill(task.size);assert.equal(checkConnection(task,terms,task.groups,task.size).ok,true);assert.equal(sumValue(terms),task.groups*task.size);assert.equal(checkConnection(task,[],task.groups,task.size).ok,false);assert.equal(checkConnection(task,[...terms,task.size],task.groups,task.size).ok,false);}
});
test('equal totals are acknowledged rather than declared mathematically false',()=>{
 const task=TASKS[0];const otherSum=checkConnection(task,[4,4,4],4,3);assert.equal(otherSum.ok,false);assert.match(otherSum.text,/saman kokonaismäärän/);
 const commuted=checkConnection(task,[3,3,3,3],3,4);assert.equal(commuted.ok,false);assert.match(commuted.text,/saman määrän/);
 for(const terms of [[3,4,5],[5,3,4]]){const result=checkConnection(task,terms,4,3);assert.equal(result.ok,false);assert.match(result.text,/saman kokonaismäärän/);}
});
test('sparse or nonnumeric sums cannot earn vacuous construction credit',()=>{
 const sparse=Array(4);sparse[0]=3;
 for(const terms of [Array(4),sparse,null,{},'3333',[3,3,3,NaN],[3,3,3,Infinity],[3,3,3,'3'],[3,3,3,undefined]])assert.throws(()=>checkConnection(TASKS[0],terms,4,3),RangeError);
 assert.equal(checkConnection(TASKS[0],[],4,3).ok,false);assert.equal(checkConnection(TASKS[0],[3,3,3,3],4,3).ok,true);
});
test('re-layout keeps exactly the same objects at every intermediate position',()=>{
 for(const task of TASKS)for(let step=0;step<=4;step+=0.25){const positions=counterPositions(task,step);assert.equal(positions.length,task.groups*task.size);assert.deepEqual(positions.map(p=>p.id),Array.from({length:task.groups*task.size},(_,i)=>i));assert.ok(positions.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=5&&p.x<=315&&p.y>=5&&p.y<=220));const ids=[...counterScene(task,step).matchAll(/data-counter="(\d+)"/g)].map(m=>+m[1]);assert.equal(new Set(ids).size,positions.length);}
});

test('practice scene exposes given groups without printing the constructed answer',()=>{for(const t of TASKS)for(let step=0;step<=4;step++){const svg=counterScene(t,step);assert.doesNotMatch(svg,/>[^<>]*=|aria-label="[^"]*Samat (12|6) esinettä/);assert.equal((svg.match(/data-counter=/g)||[]).length,t.groups*t.size);}});
