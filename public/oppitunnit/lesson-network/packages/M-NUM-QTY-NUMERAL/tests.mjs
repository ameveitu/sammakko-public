import test from'node:test';import assert from'node:assert/strict';
import{CASES,LABELS,WORDS,objectDescription,checkPairs,objectsAt,groupSvg,countModelSvg,checkSubset,checkReverse}from'./lesson.mjs';
const correct=key=>CASES[key].groups.map(g=>({id:g.id,label:LABELS[g.count-1]}));
test('constructed mappings inspect every group; same value and reordered mappings remain valid',()=>{
 for(const key of Object.keys(CASES)){const c=CASES[key],rows=correct(key);assert(checkPairs(key,rows).ok);assert(checkPairs(key,[...rows].reverse()).ok);for(let i=0;i<rows.length;i++)for(const label of LABELS){const candidate=rows.map(r=>({...r}));candidate[i].label=label;assert.equal(checkPairs(key,candidate).ok,label===LABELS[c.groups[i].count-1]);}const missing=rows.map(r=>({...r}));missing[0].label=null;assert.equal(checkPairs(key,missing).code,'missing');}
 assert.equal(correct('same')[0].label,correct('same')[1].label);assert.equal(checkPairs('same',correct('same')).ok,true);assert.equal(checkPairs('repair',CASES.repair.groups.map((g,i)=>({id:g.id,label:CASES.repair.start[i]}))).code,'mismatch');
});
test('mapping/API guards reject holes, extras, unsupported selector types and nonfinite labels',()=>{
 const good=correct('first');for(const rows of[[],Array(2),[good[0]], [...good,good[0]],[good[0],good[0]],[{id:'a',label:good[0].label,extra:true},good[1]],[{id:['a'],label:good[0].label},good[1]],[{id:'a',label:NaN},good[1]],[{id:'a',label:new String(good[0].label)},good[1]],null])assert.throws(()=>checkPairs('first',rows),RangeError);
 const hole=[...good];delete hole[0];assert.throws(()=>checkPairs('first',hole),RangeError);const extra=[...good];extra.extra=good[0];assert.throws(()=>checkPairs('first',extra),RangeError);
 for(const key of[['first'],new String('first'),null,undefined,1,NaN,Infinity,'__proto__','constructor',Symbol('first')]){assert.throws(()=>checkPairs(key,good),RangeError);assert.throws(()=>objectsAt(key,'a',0),RangeError);assert.throws(()=>groupSvg(key,'a'),RangeError);}
 for(const id of[['a'],new String('a'),null,1,'missing'])assert.throws(()=>objectsAt('first',id,0),RangeError);
 for(const spread of[NaN,Infinity,-1,1.1,'0',null])assert.throws(()=>objectsAt('first','a',spread),RangeError);
});
test('all rearrangement frames preserve each original object once, count and non-overlapping bounds',()=>{
 for(const key of Object.keys(CASES))for(const group of CASES[key].groups){const ids=objectsAt(key,group.id,0).map(p=>p.id);for(let frame=0;frame<=32;frame++){const spread=frame/32,points=objectsAt(key,group.id,spread);assert.equal(points.length,group.count);assert.deepEqual(points.map(p=>p.id),ids);assert.equal(new Set(points.map(p=>p.id)).size,group.count);for(const p of points){assert(Number.isFinite(p.x)&&Number.isFinite(p.y));assert(p.x-12>7&&p.x+12<293);assert(p.y-18>=15&&p.y+10<100);}for(let i=1;i<points.length;i++)assert(points[i].x-points[i-1].x>=28);assert.equal((groupSvg(key,group.id,spread).match(/data-object=/g)||[]).length,group.count);}assert(checkPairs(key,correct(key)).ok);}
 assert.notDeepEqual(objectsAt('first','b',0),objectsAt('first','b',1));
});
test('count model synchronizes actual visible pieces and the current whole-set label',()=>{
 for(let n=0;n<=5;n++){const svg=countModelSvg(n);assert.equal((svg.match(/data-object=/g)||[]).length,n);assert(svg.includes('>'+ (n?LABELS[n-1]:'Aloita')+'</text>'));}for(const n of[-1,6,NaN,Infinity,'2',null])assert.throws(()=>countModelSvg(n),RangeError);assert.deepEqual(WORDS.slice(0,5),['yksi','kaksi','kolme','neljä','viisi']);
});
test('requested three allows every distinct subset of three; no fixed object privilege',()=>{
 let valid=0;for(let bits=0;bits<64;bits++){const list=Array.from({length:6},(_,i)=>i).filter(i=>(bits>>i)&1);assert.equal(checkSubset(list).ok,list.length===3);if(list.length===3)valid++;}assert.equal(valid,20);assert(checkSubset([5,2,0]).ok);
 for(const a of[null,{},Array(3),[0,0,1],[0,1,6],[0,1,NaN],[0,'1',2],[0,1,2,3,4,5,6]])assert.throws(()=>checkSubset(a),RangeError);
});
test('reverse word-to-set action is bounded; words do not claim free spoken production',()=>{
 assert(checkReverse('three').ok);assert.equal(checkReverse('two').ok,false);assert.equal(checkReverse('five').ok,false);assert.equal(checkReverse(null).code,'missing');for(const id of[undefined,['three'],new String('three'),3,NaN,'__proto__'])assert.throws(()=>checkReverse(id),RangeError);assert(Object.isFrozen(CASES.first.groups));assert.throws(()=>{CASES.first.groups[0].count=9;},TypeError);
});

test('practice accessible names list the actual objects without a prepared final count or number word',()=>{
 for(const key of Object.keys(CASES))for(const group of CASES[key].groups){const label=groupSvg(key,group.id).match(/aria-label="([^"]*)"/)[1],name=group.kind==='stone'?'kivi':'simpukka';assert.equal(label,'Kuvassa esineet: '+Array(group.count).fill(name).join(', ')+'.');assert(!WORDS.some(w=>new RegExp('\\b'+w+'\\b').test(label)));assert(!/\d/.test(label));}
 for(const n of[2,3,5])assert.equal(objectDescription('stone',n),Array(n).fill('kivi').join(', '));
 assert.match(countModelSvg(3),/kolme/,'deliberately opened worked example still provides its count');
});
