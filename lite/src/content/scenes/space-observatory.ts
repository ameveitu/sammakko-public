import { h } from '../../ui/dom';
import { solutionSpaceDay, type SpaceDayTask, type SpaceDayResponse } from '../models/space-observatory';

/** The stepper controls a model only; the answer is recorded solely on explicit choice. */
export function mountSpaceDay(task:SpaceDayTask, host:HTMLElement, submit:(r:SpaceDayResponse)=>void, onChange?:(r:SpaceDayResponse)=>void) {
  let rotation:number=task.startRotation, locked=false;
  const diagram=h('div',{class:'space-day-diagram'});
  const state=h('p',{class:'small',role:'status','aria-live':'polite'});
  const day=h('button',{class:'btn',type:'button'},'Päivä');
  const night=h('button',{class:'btn',type:'button'},'Yö');
  const response=():SpaceDayResponse=>({kind:'space-day',rotation});
  const update=()=>{
    const angle=(rotation+task.siteOffset)*Math.PI/180, markerX=150-Math.cos(angle)*30;
    diagram.innerHTML=`<svg viewBox="0 0 230 82" width="100%" height="82" role="img" aria-label="Aurinko vasemmalla, valittu paikka ${task.site} mallipallolla"><circle cx="35" cy="41" r="18" fill="#efbb4d"/><path d="M58 41H100" stroke="#9a651f" stroke-width="3"/><path d="M92 34L101 41L92 48" fill="none" stroke="#9a651f" stroke-width="3"/><circle cx="150" cy="41" r="32" fill="#28465f"/><path d="M150 9A32 32 0 0 0 150 73Z" fill="#74b3c0"/><circle cx="${markerX}" cy="41" r="5" fill="#ffd65f" stroke="#152d36" stroke-width="1.5"/><text x="${markerX}" y="33" text-anchor="middle" font-size="11" font-weight="bold">${task.site}</text><text x="7" y="78" font-size="11">Aurinko →</text></svg>`;
    state.textContent=`Maan käännös ${rotation}°. Tavoite ${task.targetRotation}°. Aurinko pysyy vasemmalla. Tutki paikkaa ${task.site}.`;
    day.disabled=night.disabled=locked || rotation!==task.targetRotation;
    onChange?.(response());
  };
  const step=(delta:number)=>{ if(locked) return; rotation=(rotation+delta+360)%360; update(); };
  const back=h('button',{class:'btn',type:'button','aria-label':'Käännä Maata 90 astetta vasemmalle',onclick:()=>step(-90)},'↶ 90°');
  const forward=h('button',{class:'btn',type:'button','aria-label':'Käännä Maata 90 astetta oikealle',onclick:()=>step(90)},'↷ 90°');
  for(const [button,light] of [[day,'day'],[night,'night']] as const) button.addEventListener('click',()=>{
    if(locked || rotation!==task.targetRotation) return;
    locked=true; day.disabled=night.disabled=back.disabled=forward.disabled=true;
    const value:SpaceDayResponse={kind:'space-day',rotation,light}; onChange?.(value); submit(value);
  });
  host.append(diagram,h('div',{class:'row'},back,forward),state,h('p',{},`Kun malli on tavoitekulmassa, ennusta paikan ${task.site} valo:`),h('div',{class:'row'},day,night));
  update();
  return {reveal() { const answer=solutionSpaceDay(task); rotation=answer.rotation; state.textContent=`Mallivastaus: paikka ${task.site}: ${answer.light==='day'?'päivä':'yö'}.`; onChange?.(answer); }};
}
