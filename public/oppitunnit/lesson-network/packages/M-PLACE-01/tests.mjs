import test from'node:test';import assert from'node:assert/strict';
import{getCase,groupState,checkBundle,pieceId}from'./lesson.mjs';
test('every ten of thirteen, in different orders, makes exactly one ten with three loose identities',()=>{
 let accepted=0;for(let mask=0;mask<8192;mask++){const members=Array.from({length:13},(_,i)=>i).filter(i=>mask&(1<<i)),s=groupState('thirteen',members);assert.equal(s.members.length+s.loose.length,13);assert.equal(new Set([...s.members,...s.loose]).size,13);assert.equal(checkBundle('thirteen',members).ok,members.length===10);if(members.length===10){accepted++;assert(checkBundle('thirteen',[...members].reverse()).ok);assert.equal(s.loose.length,3);}}assert.equal(accepted,286);
});
test('ten is a group size independent of material or leftover count; nine/eleven are not tens',()=>{
 for(const key of['ten','thirteen','seventeen','beads']){assert(checkBundle(key,Array.from({length:10},(_,i)=>i)).ok);assert.equal(groupState(key,[]).total,getCase(key).n);assert.equal(checkBundle(key,Array.from({length:9},(_,i)=>i)).code,'short');}
 assert.equal(checkBundle('thirteen',Array.from({length:11},(_,i)=>i)).code,'extra');assert.equal(groupState('ten',Array.from({length:10},(_,i)=>i)).loose.length,0);
});
test('dense unique in-domain identities required; no holes, duplicates, strings or inherited identities',()=>{
 const good=Array.from({length:10},(_,i)=>i),hole=[...good];delete hole[5];const inherited=[...good];delete inherited[2];const proto=Object.create(Array.prototype);proto[2]=2;Object.setPrototypeOf(inherited,proto);
 for(const a of[null,{},Array(10),hole,inherited,[...good,13],[...good,0],good.map((x,i)=>i===2?'2':x),good.map((x,i)=>i===2?-1:x),good.map((x,i)=>i===2?NaN:x)]){assert.equal(groupState('thirteen',a),null);assert(!checkBundle('thirteen',a).ok);}
});
test('strict primitive string selectors and exact piece ids prevent prototype/array coercion',()=>{
 for(const key of[['ten'],new String('ten'),{},null,undefined,'constructor','toString','__proto__',10]){assert.equal(getCase(key),null);assert(!checkBundle(key,Array.from({length:10},(_,i)=>i)).ok);}
 for(const v of['',' 1 ','01','1.0','-1','1e1',[],{},1,null])assert.equal(pieceId(v),null);assert.equal(pieceId('0'),0);assert.equal(pieceId('16'),16);
});
