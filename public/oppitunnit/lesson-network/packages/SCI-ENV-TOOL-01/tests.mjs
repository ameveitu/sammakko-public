import fs from 'node:fs';import test from 'node:test';import assert from 'node:assert/strict';import {checkView,moveFocus,viewScene} from './lesson.mjs';
test('both location and clear view are necessary in every model state',()=>{for(const target of ['A','B'])for(const spot of ['A','B'])for(const focus of [0,1,2]){const v=checkView(target,spot,focus);assert.equal(v.ok,target===spot&&focus===1);assert.ok(v.text.length>50);}assert.match(checkView('A','B',1).text,/Tehtävä pyytää kohtaa A/);assert.match(checkView('A','A',0).text,/kauemmas/);assert.match(checkView('B','B',2).text,/lähemmäs/);});
test('focus controls stop at model limits and clear drawings contain the right details',()=>{assert.equal(moveFocus(0,-1),0);assert.equal(moveFocus(2,1),2);assert.equal(moveFocus(0,1),1);assert.equal(moveFocus(2,-1),1);assert.match(viewScene('A',1),/neljä pistettä erottuvat/);assert.match(viewScene('B',1),/kaksi poikittaista ja kaksi pitkittäistä lankaa erottuvat/);assert.match(viewScene('B',2),/eivät erotu/);});
test('unknown focus/target values cannot be accepted',()=>{for(const args of [['C','A',1],['A','C',1],['A','A',3]])assert.throws(()=>checkView(...args),RangeError);});

// Parse the rendered SVG, not the feature generator, so either view can regress independently.
function group(svg,name){
 const match=svg.match(new RegExp(`<g data-features="${name}"[^>]*transform="translate\\(([-\\d.]+) ([-\\d.]+)\\) scale\\(([-\\d.]+)\\)">([\\s\\S]*?)</g>`));
 assert.ok(match,`missing rendered feature group ${name}`);
 const features=[...match[4].matchAll(/<(circle|line)\b([^>]*)\/>/g)].map(m=>({tag:m[1],...Object.fromEntries([...m[2].matchAll(/([\w-]+)="([^"]*)"/g)].map(a=>[a[1],a[2]]))}));
 return {x:Number(match[1]),y:Number(match[2]),scale:Number(match[3]),features};
}
function uniform(base,zoom){
 assert.equal(base.features.length,4);assert.equal(zoom.features.length,4);
 const factor=2.5;assert.equal(zoom.scale/base.scale,factor);
 base.features.forEach((source,i)=>{
  const target=zoom.features[i];assert.equal(source.tag,target.tag);assert.equal(source['data-feature'],target['data-feature']);
  for(const key of ['fill','stroke'])assert.equal(source[key],target[key]);
  const axes=source.tag==='circle'?[['cx','x'],['cy','y']]:[['x1','x'],['y1','y'],['x2','x'],['y2','y']];
  for(const [key,axis]of axes){const basePoint=base[axis]+Number(source[key])*base.scale;const zoomPoint=zoom[axis]+Number(target[key])*zoom.scale;assert.equal(zoomPoint-zoom[axis],(basePoint-base[axis])*factor,`${key} uses the same position scale`);}
  for(const key of source.tag==='circle'?['r']:['stroke-width'])assert.equal(Number(target[key])*zoom.scale,Number(source[key])*base.scale*factor,`${key} uses the same size scale`);
 });
}
test('dynamic paper preserves four dots with uniform spacing and radius magnification',()=>{
 const rendered=viewScene('A',1),base=group(rendered,'base-A'),zoom=group(rendered,'zoom');uniform(base,zoom);
 assert.deepEqual(base.features.map(p=>[Number(p.cx),Number(p.cy),Number(p.r)]),[[-10,-10,4],[10,-10,4],[-10,10,4],[10,10,4]]);
 assert.ok(base.features.every(p=>p['data-feature']==='dot'));
});
test('dynamic fabric preserves exactly two horizontal and two vertical threads, including widths and colours',()=>{
 const rendered=viewScene('B',1),base=group(rendered,'base-B'),zoom=group(rendered,'zoom');uniform(base,zoom);
 assert.deepEqual(base.features.map(p=>p['data-feature']),['horizontal','horizontal','vertical','vertical']);
 for(const p of base.features.filter(p=>p['data-feature']==='horizontal'))assert.equal(p.y1,p.y2);
 for(const p of base.features.filter(p=>p['data-feature']==='vertical'))assert.equal(p.x1,p.x2);
 for(const focus of [0,2])assert.equal(viewScene('B',focus).includes('data-features="zoom"'),false);
});
test('static paper SVG preserves the same four dots with the same spacing/radius scale',()=>{
 const svg=fs.readFileSync(new URL('./magnifier.svg',import.meta.url),'utf8');uniform(group(svg,'base-A'),group(svg,'zoom'));
 assert.equal((svg.match(/data-feature="dot"/g)||[]).length,8);
});
