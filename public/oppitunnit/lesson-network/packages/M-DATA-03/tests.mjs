import test from 'node:test';
import assert from 'node:assert/strict';
import {tables,searches,checkLookup,tableMarkup} from './lesson.mjs';
test('every search checks headers and actual intersection, including duplicate values',()=>{
 searches.forEach((q,i)=>{let pass=0;for(let r=0;r<2;r++)for(let c=0;c<2;c++)for(let cr=0;cr<2;cr++)for(let cc=0;cc<2;cc++)pass+=Number(checkLookup(i,r,c,cr,cc).ok);assert.equal(pass,1);assert.equal(checkLookup(i,q.row,q.column,q.row,q.column).ok,true);assert.equal(checkLookup(i,null,q.column,q.row,q.column).code,'missing');});
 assert.equal(tables[0].values[0][0],tables[0].values[1][0]);assert.equal(checkLookup(1,0,0,1,0).ok,false);
 assert.equal(checkLookup(0,0,1,0,1).code,'row');assert.equal(checkLookup(0,1,0,1,0).code,'column');assert.equal(checkLookup(0,1,1,0,1).code,'intersection');
});
test('table carries semantic row/column headers and no arithmetic demand',()=>{
 for(let i=0;i<tables.length;i++){const html=tableMarkup(i,0,1);assert.equal((html.match(/scope="row"/g)||[]).length,2);assert.equal((html.match(/scope="col"/g)||[]).length,3);assert.equal((html.match(/data-table-cell=/g)||[]).length,4);assert.match(html,/<caption>/);}
 assert.throws(()=>checkLookup(0,1,1,2,1),RangeError);
});
