import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fitView, zoomView} from './view.js';

const world = {x:50, y:30, w:3300, h:8500};
for (const [width, height] of [[1100,662],[390,506],[320,400]]) {
  test(`the entire tall 690-node world fits ${width}×${height}`, () => {
    const v=fitView(world,width,height);
    assert(v.scale < .35, 'regression: readable-node minimum clipped the overview');
    assert(v.tx + world.x*v.scale >= 0);
    assert(v.ty + world.y*v.scale >= 0);
    assert(v.tx + (world.x+world.w)*v.scale <= width + 1e-8);
    assert(v.ty + (world.y+world.h)*v.scale <= height + 1e-8);
    const restored=zoomView({...v,scale:v.scale*3},.001,width/2,height/2,v.scale);
    assert.equal(restored.scale,v.scale);
  });
}
test('a focused subgraph remains readable and pointer-centred zoom preserves its world point',()=>{
  const v=fitView({x:190,y:400,w:246,h:128},1100,662);
  assert(v.scale>1);
  const next=zoomView(v,1.1,300,200,.05);
  assert(Math.abs((300-v.tx)/v.scale-(300-next.tx)/next.scale)<1e-8);
  assert(Math.abs((200-v.ty)/v.scale-(200-next.ty)/next.scale)<1e-8);
});
test('invalid geometry fails explicitly instead of emitting a broken transform',()=>{
  assert.throws(()=>fitView({...world,w:0},390,506),TypeError);
  assert.throws(()=>zoomView({scale:0,tx:0,ty:0},1,0,0,.01),TypeError);
});
