import test from 'node:test';
import assert from 'node:assert/strict';
import {INPUTS, evaluate, checkTable, readInteger} from './lesson.mjs';
test('specified models, finite domains and constant many-to-one mapping', () => {
 for (let x = 0; x <= 5; x++) { assert.equal(evaluate('seats', x), x + x + 1); assert.equal(evaluate('stock', x), 8 - x); assert.equal(evaluate('fixed', x), 4); }
 for (const rule of [null, {}, [], ['seats'], 'toString', 'other']) assert.equal(evaluate(rule, 2), null);
 for (const x of [-1, 6, 1.5, NaN, Infinity, '2', null]) assert.equal(evaluate('seats', x), null);
});
test('entire paired table, every creation order, repeated outputs accepted', () => {
 for (const rule of ['seats','stock','fixed']) for (const order of [[0,2,5],[0,5,2],[2,0,5],[2,5,0],[5,0,2],[5,2,0]]) assert.equal(checkTable(rule, order.map(x => [x,evaluate(rule,x)])).ok, true);
 assert.equal(checkTable('seats', [[0,1],[2,3],[5,5]]).code, 'value'); // adding 2 per row
 assert.equal(checkTable('seats', [[1,0],[5,2],[11,5]]).ok, false); // swapped meaning
});
test('all rows and both tuple entries dense: missing/extra/malformed/unsupported fail closed', () => {
 const good = INPUTS.map(x=>[x,evaluate('seats',x)]);
 const hole = good.slice(); delete hole[1];
 const tupleHole = good.map(r=>r.slice()); delete tupleHole[0][1];
 for (const rows of [null, {}, [], good.slice(1), [...good,[3,7]], Array(3), hole, tupleHole, [[0,1],[0,1],[5,11]], [[0,1],[2,'5'],[5,11]], [[0,1,9],[2,5],[5,11]], [[0,1],[2,NaN],[5,11]], [[0,1],[2,5],undefined]]) assert.equal(checkTable('seats', rows).ok, false);
 for (const rule of [[], ['seats'], 'constructor', null]) assert.equal(checkTable(rule, good).ok, false);
 for (let i=0;i<3;i++) for (const bad of [null,undefined,NaN,Infinity,'',true,{},[5]]) { const rows=good.map(r=>r.slice()); rows[i][1]=bad; assert.equal(checkTable('seats',rows).ok,false); }
});
test('wrong pairs have actionable row-specific feedback; numbers do not coerce blanks', () => {
 const r=checkTable('seats',[[0,1],[2,4],[5,11]]);assert.match(r.message,/x = 2/);assert.match(r.message,/2 · 2 \+ 1 = 5/);
 for (const s of ['', ' ', '2x', '1.5','Infinity', null, 2, [], '1e2']) assert.equal(readInteger(s),null);
 for (const [s,n] of [['0',0],[' 2 ',2],['−5',-5],['-5',-5]]) assert.equal(readInteger(s),n);
});
