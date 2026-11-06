import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bindNavigation} from './navigation.js';

function fixture() {
  const stage=new EventTarget(), win=new EventTarget(), doc=new EventTarget();
  const classes=new Set(), captured=new Set();
  let view={scale:1,tx:30,ty:40}, resets=0;
  Object.assign(doc,{defaultView:win,hidden:false});
  Object.assign(stage,{
    ownerDocument:doc,clientWidth:800,clientHeight:500,
    getBoundingClientRect:()=>({left:100,top:50}),closest:()=>null,
    classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)},focus:()=>{},
    setPointerCapture:id=>captured.add(id),hasPointerCapture:id=>captured.has(id),releasePointerCapture:id=>captured.delete(id),
  });
  const unbind=bindNavigation(stage,{read:()=>view,write:next=>{view=next},minimum:()=>.1,overview:()=>resets++});
  const send=(type,props={},target=stage)=>{
    const event=Object.assign(new Event(type,{cancelable:true}),{button:0,pointerType:'mouse',pointerId:1,clientX:200,clientY:150,deltaX:0,deltaY:0,deltaMode:0,detail:1,...props});
    target.dispatchEvent(event);return event;
  };
  return{stage,win,doc,classes,captured,send,unbind,read:()=>({...view}),resets:()=>resets};
}
const near=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);

test('two-finger diagonal/horizontal scroll pans, including fractional deltas, without zooming',()=>{
  const f=fixture();const e=f.send('wheel',{deltaX:42.5,deltaY:-60.25});
  assert.deepEqual(f.read(),{scale:1,tx:-12.5,ty:100.25});assert(e.defaultPrevented);
  f.send('wheel',{deltaX:-12,deltaY:0});assert.deepEqual(f.read(),{scale:1,tx:-.5,ty:100.25});
});
test('line/page wheel deltas use their declared units rather than becoming zoom steps',()=>{
  const f=fixture();f.send('wheel',{deltaMode:1,deltaY:2});assert.equal(f.read().ty,8);
  f.send('wheel',{deltaMode:2,deltaX:1,deltaY:-1});assert.deepEqual(f.read(),{scale:1,tx:-770,ty:508});
});
for(const modifier of ['ctrlKey','metaKey']) test(`${modifier} pinch owns only map zoom and preserves the pointer's world point`,()=>{
  const f=fixture(),before=f.read();const e=f.send('wheel',{[modifier]:true,deltaY:-40});const v=f.read();
  assert(e.defaultPrevented);assert(v.scale>before.scale);
  near((100-before.tx)/before.scale,(100-v.tx)/v.scale);near((100-before.ty)/before.scale,(100-v.ty)/v.scale);
  f.send('wheel',{[modifier]:true,deltaY:40});near(f.read().scale,1);near(f.read().tx,30);near(f.read().ty,40);
});
test('pinch has smooth event-magnitude response, and zero delta does not jump',()=>{
  const f=fixture();f.send('wheel',{ctrlKey:true,deltaY:0});assert.deepEqual(f.read(),{scale:1,tx:30,ty:40});
  f.send('wheel',{ctrlKey:true,deltaY:-1});const once=f.read();assert(once.scale>1&&once.scale<1.02);
  f.send('wheel',{ctrlKey:true,deltaY:-3});near(f.read().scale,Math.exp(.02));
});
test('extreme pinch deltas stay finite and respect overview/maximum bounds',()=>{
  const f=fixture();for(let i=0;i<8;i++)f.send('wheel',{ctrlKey:true,deltaY:-10000});assert.equal(f.read().scale,5);
  for(let i=0;i<8;i++)f.send('wheel',{ctrlKey:true,deltaY:10000});assert.equal(f.read().scale,.1);
  assert(Object.values(f.read()).every(Number.isFinite));
});
test('ordinary small tap motion stays a click; dragging moves the map and suppresses its trailing click',()=>{
  const f=fixture();f.send('pointerdown');f.send('pointermove',{clientX:203,clientY:152});f.send('pointerup');
  assert.deepEqual(f.read(),{scale:1,tx:30,ty:40});assert(!f.send('click').defaultPrevented);
  f.send('pointerdown');f.send('pointermove',{clientX:280,clientY:190});f.send('pointerup');
  assert.deepEqual(f.read(),{scale:1,tx:110,ty:80});assert(f.send('click').defaultPrevented);
  assert(!f.classes.has('dragging'));assert.equal(f.captured.size,0);
  f.send('pointerdown');f.send('pointerup');assert(!f.send('click').defaultPrevented);
});
test('automatic capture release does not turn a stationary tap into a suppressed click',()=>{
  const f=fixture();f.send('pointerdown');f.send('pointerup');f.send('lostpointercapture');
  assert(!f.send('click').defaultPrevented);
});
test('keyboard activation after drag remains available without giving a drag its accidental click',()=>{
  const f=fixture();f.send('pointerdown');f.send('pointermove',{clientX:230});f.send('pointerup');
  assert(f.send('click').defaultPrevented);assert(!f.send('click',{detail:0}).defaultPrevented);
});
test('secondary button and unknown pointer cannot start or hijack a drag',()=>{
  const f=fixture();f.send('pointerdown',{button:2});f.send('pointermove',{clientX:300});
  assert.deepEqual(f.read(),{scale:1,tx:30,ty:40});
  f.send('pointerdown');f.send('pointermove',{pointerId:9,clientX:300});f.send('pointerup',{pointerId:9});
  f.send('pointermove',{clientX:220});assert.equal(f.read().tx,50);
});
test('two touch points zoom around their moving centre, then resume one-finger pan without a jump',()=>{
  const f=fixture();f.send('pointerdown',{pointerType:'touch',clientX:200});
  f.send('pointerdown',{pointerType:'touch',pointerId:2,clientX:300});
  f.send('pointermove',{pointerType:'touch',pointerId:2,clientX:400});
  assert.deepEqual(f.read(),{scale:2,tx:-40,ty:-20});
  f.send('pointerup',{pointerType:'touch',pointerId:2,clientX:400});
  f.send('pointermove',{pointerType:'touch',clientX:210});assert.deepEqual(f.read(),{scale:2,tx:-30,ty:-20});
  f.send('pointerup',{pointerType:'touch',clientX:210});assert(f.send('click').defaultPrevented);
});
test('coincident touch points and third-finger transitions never emit invalid camera values',()=>{
  const f=fixture();for(let id=1;id<=3;id++)f.send('pointerdown',{pointerType:'touch',pointerId:id});
  f.send('pointermove',{pointerType:'touch',pointerId:2,clientX:260});f.send('pointerup',{pointerType:'touch',pointerId:1});
  f.send('pointermove',{pointerType:'touch',pointerId:3,clientX:180});assert(Object.values(f.read()).every(Number.isFinite));
});
for(const exit of ['pointercancel','lostpointercapture','blur','hidden']) test(`${exit} cleans up an interrupted gesture`,()=>{
  const f=fixture();f.send('pointerdown');f.send('pointermove',{clientX:240});const before=f.read();
  if(exit==='blur')f.send('blur',{},f.win);
  else if(exit==='hidden'){f.doc.hidden=true;f.send('visibilitychange',{},f.doc)}
  else f.send(exit);
  f.send('pointermove',{clientX:400});assert.deepEqual(f.read(),before);assert(!f.classes.has('dragging'));assert.equal(f.captured.size,0);
});
test('map keyboard controls work; browser zoom/navigation shortcuts are never consumed',()=>{
  const f=fixture();assert(f.send('keydown',{key:'ArrowRight'}).defaultPrevented);assert.equal(f.read().tx,78);
  assert(f.send('keydown',{key:'+'}).defaultPrevented);assert(f.read().scale>1);
  f.send('keydown',{key:'0'});assert.equal(f.resets(),1);
  const v=f.read();for(const modifier of ['ctrlKey','metaKey','altKey'])for(const key of ['+','-','0','ArrowLeft']){
    assert(!f.send('keydown',{key,[modifier]:true}).defaultPrevented);assert.deepEqual(f.read(),v);
  }
  assert.equal(f.resets(),1);
});
test('unbinding releases active pointers and all map ownership',()=>{
  const f=fixture();f.send('pointerdown');f.unbind();const before=f.read();
  assert.equal(f.captured.size,0);assert(!f.send('wheel',{ctrlKey:true,deltaY:-40}).defaultPrevented);
  f.send('pointermove',{clientX:400});assert.deepEqual(f.read(),before);
});
