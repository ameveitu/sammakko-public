import {zoomView} from './view.js';

// The map owns gestures only inside its stage. Browser/page zoom remains available outside it.
export function bindNavigation(stage, {read, write, minimum, overview}) {
  const pointers = new Map();
  const win = stage.ownerDocument.defaultView;
  let suppressClick = false;
  const local = p => {
    const r = stage.getBoundingClientRect();
    return {x:p.x-r.left, y:p.y-r.top};
  };
  const pair = () => {
    const [a,b] = [...pointers.values()];
    return {x:(a.x+b.x)/2, y:(a.y+b.y)/2, distance:Math.hypot(a.x-b.x,a.y-b.y)};
  };
  const activate = () => {
    suppressClick = true;
    stage.classList.add('dragging');
    stage.focus({preventScroll:true});
  };
  const wheel = e => {
    e.preventDefault();
    const dx = e.deltaX * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? stage.clientWidth : 1);
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? stage.clientHeight : 1);
    const v = read();
    if (e.ctrlKey || e.metaKey) {
      // Chrome sends trackpad pinch as Ctrl+wheel. Use its magnitude, not one jump per event.
      const p = local({x:e.clientX,y:e.clientY});
      // A gentle gain also avoids amplifying Mac Chrome's high-resolution wheel stream.
      write(zoomView(v, Math.exp(-Math.max(-200,Math.min(200,dy))*.005), p.x,p.y,minimum()));
    } else {
      // Trackpad two-finger scroll and mouse wheel both move the map; neither changes its scale.
      write({...v,tx:v.tx-dx,ty:v.ty-dy});
    }
  };
  const down = e => {
    if (e.button !== 0 || (e.pointerType !== 'touch' && pointers.size)) return;
    if (!pointers.size) suppressClick = false;
    // Buttons floating on the map keep their own click.
    if (e.target.closest('button, a, input, select')) return;
    const capture = e.target.closest('.graph-node, .focus-card') || stage;
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,panX:e.clientX,panY:e.clientY,capture});
    // Capturing on the original node preserves normal click selection after a stationary tap.
    capture.setPointerCapture(e.pointerId);
    if (pointers.size > 1) activate();
  };
  const move = e => {
    const p = pointers.get(e.pointerId);
    if (!p) return;
    const before = pointers.size > 1 ? pair() : null;
    p.x = e.clientX; p.y = e.clientY;
    if (before) {
      const after = pair(), a = local(before), b = local(after);
      const factor = before.distance > 0 && after.distance > 0 ? after.distance/before.distance : 1;
      const v = zoomView(read(),factor,a.x,a.y,minimum());
      write({...v,tx:v.tx+b.x-a.x,ty:v.ty+b.y-a.y});
    } else {
      if (!suppressClick && Math.hypot(p.x-p.startX,p.y-p.startY) < 6) return;
      activate();
      const v = read();
      write({...v,tx:v.tx+p.x-p.panX,ty:v.ty+p.y-p.panY});
      p.panX=p.x; p.panY=p.y;
    }
  };
  const up = e => {
    const p = pointers.get(e.pointerId);
    if (!p) return;
    pointers.delete(e.pointerId);
    if (p.capture.hasPointerCapture(e.pointerId)) p.capture.releasePointerCapture(e.pointerId);
    for (const remaining of pointers.values()) {
      remaining.startX=remaining.panX=remaining.x;
      remaining.startY=remaining.panY=remaining.y;
    }
    if (!pointers.size) stage.classList.remove('dragging');
  };
  const cancel = e => {if (pointers.has(e.pointerId)) {suppressClick=true; up(e)}};
  const reset = () => {
    suppressClick=true;
    for (const id of [...pointers.keys()]) up({pointerId:id});
  };
  const click = e => {
    // Keep keyboard activation (detail=0); suppress the compatibility click after drag/pinch.
    if (suppressClick && e.detail !== 0) {e.preventDefault(); e.stopImmediatePropagation()}
  };
  const key = e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const pan = {ArrowLeft:[-48,0],ArrowRight:[48,0],ArrowUp:[0,-48],ArrowDown:[0,48]}[e.key];
    if (pan) {e.preventDefault(); const v=read(); write({...v,tx:v.tx+pan[0],ty:v.ty+pan[1]})}
    if (['+','=','-'].includes(e.key)) {
      e.preventDefault();
      write(zoomView(read(),e.key==='-'?1/1.15:1.15,stage.clientWidth/2,stage.clientHeight/2,minimum()));
    }
    if (e.key==='0') {e.preventDefault(); overview()}
  };
  const dragstart = e => e.preventDefault();
  const visibility = () => {if (stage.ownerDocument.hidden) reset()};
  const listeners = [['wheel',wheel,{passive:false}],['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',cancel],['lostpointercapture',cancel],['click',click,true],['keydown',key],['dragstart',dragstart]];
  for (const [type,fn,options] of listeners) stage.addEventListener(type,fn,options);
  win.addEventListener('blur',reset);
  stage.ownerDocument.addEventListener('visibilitychange',visibility);
  return () => {
    reset();
    for (const [type,fn,options] of listeners) stage.removeEventListener(type,fn,options);
    win.removeEventListener('blur',reset);
    stage.ownerDocument.removeEventListener('visibilitychange',visibility);
  };
}
