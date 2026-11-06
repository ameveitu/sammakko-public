import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildCases,readCases,checkSelection,checkNotation,partsSvg,demoCaptions} from './lesson.mjs';

test('all subsets may construct the requested fraction, without adjacency restrictions',()=>{
 for(let index=0;index<buildCases.length;index++){
  const q=buildCases[index];let passing=0;
  for(let mask=0;mask<2**q.b;mask++){
   const selected=Array.from({length:q.b},(_,i)=>i).filter(i=>mask&(1<<i));
   const r=checkSelection(selected,index);assert.equal(r.ok,selected.length===q.a);passing+=Number(r.ok);
  }
  const fact=n=>n<2?1:n*fact(n-1);assert.equal(passing,fact(q.b)/(fact(q.a)*fact(q.b-q.a)));
 }
 assert.equal(checkSelection([4,0,2],0).ok,true);assert.equal(checkSelection([1,1],0).ok,false);
});

test('sparse selections and every invalid index boundary are rejected',()=>{
 const sparse=[Array(1),Array(3),Array(8),Object.assign(Array(3),{0:1,2:2})];
 for(const selected of sparse){assert.throws(()=>checkSelection(selected,0),RangeError);assert.throws(()=>partsSvg('bar',5,selected),RangeError);}
 for(const index of ['constructor','__proto__','toString','length','0',-1,0.5,NaN,Infinity,3,null,undefined]){
  assert.throws(()=>checkSelection([],index),RangeError);assert.throws(()=>checkNotation(index,'1','4'),RangeError);
 }
 for(const bad of [[-1],[5],[NaN],[undefined],null])assert.throws(()=>checkSelection(bad,0),RangeError);
});

test('notation checker accepts every bounded equivalent value and identifies misconceptions',()=>{
 const gcd=(a,b)=>b?gcd(b,a%b):a;
 const canonical=(a,b)=>{const g=gcd(a,b);return`${a/g}/${b/g}`;};
 readCases.forEach((q,index)=>{
  for(let a=0;a<=64;a++)for(let b=1;b<=64;b++)assert.equal(checkNotation(index,String(a),String(b)).ok,canonical(a,b)===canonical(q.a,q.b));
 });
 assert.equal(checkNotation(2,'1','3').code,'equivalent');assert.equal(checkNotation(2,'2','6').code,'exact');
 assert.equal(checkNotation(0,'5','3').code,'swapped');assert.equal(checkNotation(0,'3','2').code,'whole');assert.equal(checkNotation(0,'2','5').code,'selected');
 assert.equal(checkNotation(0,'','5').code,'missing');for(const [a,b]of[['1','0'],['1.5','5'],['-1','5'],['Infinity','5'],['65','5']])assert.equal(checkNotation(0,a,b).code,'invalid');
 assert.equal(checkNotation(0,'3.0','5.0').ok,true);
});

test('bar and square drawings conserve equal part areas across all selection states',()=>{
 for(let b=2;b<=8;b++)for(const selected of [[],[0],Array.from({length:b},(_,i)=>i)]){
  const svg=partsSvg('bar',b,selected);const widths=[...svg.matchAll(/<rect[^>]*width="([^"]+)" height="68"/g)].map(m=>Number(m[1]));
  assert.equal(widths.length,b);assert(Math.abs(widths.reduce((a,b)=>a+b,0)-280)<1e-8);assert(widths.every(w=>Math.abs(w-280/b)<1e-8));
 }
 assert.equal((partsSvg('square',4,[0]).match(/width="70" height="70"/g)||[]).length,4);
 assert.equal((partsSvg('flags',6,[1,4]).match(/h32v44h-32z/g)||[]).length,6);
 assert.equal(demoCaptions.length,4);assert.throws(()=>partsSvg('square',5),RangeError);
});

test('original different-shape quarter polygons each cover one fourth and have disjoint interiors',()=>{
 const svg=readFileSync(new URL('different-shape-quarters.svg',import.meta.url),'utf8');
 const polygons=[...svg.matchAll(/<polygon data-quarter="\d" points="([^"]+)"/g)].map(m=>m[1].split(' ').map(p=>p.split(',').map(Number)));
 const area=p=>Math.abs(p.reduce((sum,[x,y],i)=>{const q=p[(i+1)%p.length];return sum+x*q[1]-y*q[0];},0))/2;
 assert.equal(polygons.length,4);assert.deepEqual(polygons.map(area),[12544,12544,12544,12544]);
 // Interior sample grid verifies one owner everywhere away from shared edges.
 const inside=(x,y,p)=>{let n=0;for(let i=0,j=p.length-1;i<p.length;j=i++)if((p[i][1]>y)!==(p[j][1]>y)&&x<(p[j][0]-p[i][0])*(y-p[i][1])/(p[j][1]-p[i][1])+p[i][0])n++;return n%2===1;};
 for(let x=48.25;x<272;x+=7)for(let y=48.375;y<272;y+=7)assert.equal(polygons.filter(p=>inside(x,y,p)).length,1);
});

test('read practice describes each given part without the completed numerator/denominator counts',()=>{const svg=partsSvg('bar',5,[0,2,4],false),label=svg.match(/aria-label="([^"]*)"/)[1];assert(!label.includes('5 yhtä suurta osaa'));assert(!label.includes('3 merkitty'));assert.equal((label.match(/osa merkitty/g)||[]).length,3);assert.equal((label.match(/osa vaalea/g)||[]).length,2);assert(partsSvg('bar',5,[0,2,4]).includes('5 yhtä suurta osaa, 3 merkitty'));});

test('read context does not pre-count the flag denominator',()=>{const source=readFileSync(new URL('lesson.mjs',import.meta.url),'utf8');assert(!source.includes('Kokonainen on koko kuuden lipun joukko.'));});
