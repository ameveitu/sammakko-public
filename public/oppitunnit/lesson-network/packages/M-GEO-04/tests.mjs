import test from 'node:test';
import assert from 'node:assert/strict';
import {shapes,rules,polygonFacts,belongs,rotatePoints,checkGroup,shapeSvg,demoSvg} from './lesson.mjs';

test('inclusive geometric membership agrees with independent named truth and all group subsets',()=>{
 const truth={triangle:['triangle','thin'],rectangle:['square','rectangle'],square:['square'],circle:['circle']};
 for(const rule of rules){
  for(const s of shapes)assert.equal(belongs(s.id,rule.key),truth[rule.key].includes(s.id));
  let pass=0;for(let mask=0;mask<2**shapes.length;mask++){const selected=shapes.filter((_,i)=>mask&(1<<i)).map(s=>s.id);const r=checkGroup(selected,rule.key);const expected=selected.length===truth[rule.key].length&&selected.every(id=>truth[rule.key].includes(id));assert.equal(r.ok,expected);pass+=Number(r.ok);}assert.equal(pass,1);
 }
 assert.equal(checkGroup(['rectangle'],'rectangle').code,'missing');assert.match(checkGroup(['rectangle'],'rectangle').message,/Myös neliössä/);
 assert.match(checkGroup(['open'],'triangle').message,/aukko/);assert.match(checkGroup(['curved'],'triangle').message,/kaartuu/);
 assert.match(checkGroup(['rhombus'],'square').message,/kulmat eivät/);
});

test('rhombus is not square: equal lengths and right angles are separate properties',()=>{
 const square=polygonFacts(shapes.find(s=>s.id==='square').points),rhombus=polygonFacts(shapes.find(s=>s.id==='rhombus').points);
 assert(square.equalSides&&square.rightAngles);assert(rhombus.equalSides&&!rhombus.rightAngles);
 assert.equal(belongs('rhombus','square'),false);assert.equal(belongs('square','rectangle'),true);
});

test('every degree of rotation preserves lengths, area, angles and visible frame',()=>{
 for(const s of shapes.filter(s=>s.points&&s.closed&&s.straight)){
  const original=polygonFacts(s.points);
  for(let angle=0;angle<360;angle++){
   const points=rotatePoints(s.points,angle),f=polygonFacts(points);
   assert(Math.abs(f.area-original.area)<1e-7);f.squared.forEach((v,i)=>assert(Math.abs(v-original.squared[i])<1e-7));
   assert.equal(f.rightAngles,original.rightAngles);assert.equal(f.equalSides,original.equalSides);
   for(const[x,y]of points)assert(Math.abs(x)<86&&Math.abs(y)<86);
  }
 }
});

test('all demonstration steps close the same shape; circle marks smooth arc without corner dots',()=>{
 for(const id of ['triangle','square','rectangle','circle','rhombus']){
  const max=id==='circle'?4:shapes.find(s=>s.id===id).points.length;
  for(let step=0;step<=max;step++){
   const svg=demoSvg(id,75,step);assert.match(svg,/viewBox="-90 -90 180 180"/);assert.doesNotMatch(svg,/NaN|Infinity/);
   if(id==='circle')assert.equal((svg.match(/r="6"/g)||[]).length,0);
   else assert.equal((svg.match(/r="6"/g)||[]).length,step);
  }
 }
 for(const s of shapes)assert.match(shapeSvg(s.id,35,true),new RegExp('Kuvio '+s.letter));
});

test('sparse arrays, invalid shape names and invalid numeric domains fail closed',()=>{
 for(const selected of [Array(1),Array(8),Object.assign(Array(3),{1:'square'})])assert.throws(()=>checkGroup(selected,'square'),RangeError);
 for(const name of ['constructor','__proto__','toString','length',null,undefined,0])assert.throws(()=>belongs(name,'square'),RangeError);
 for(const name of ['constructor','0',0,null])assert.throws(()=>checkGroup([],name),RangeError);
 for(const p of [Array(3),[[0,0],Array(2),[1,2]],[[0,0],[1,NaN],[1,2]]])assert.throws(()=>polygonFacts(p),RangeError);
 for(const step of ['constructor','1',-1,0.5,NaN,9])assert.throws(()=>demoSvg('square',0,step),RangeError);
 assert.throws(()=>rotatePoints([[0,0],[1,1],[1,0]],NaN),RangeError);
});
