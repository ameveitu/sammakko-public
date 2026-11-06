import type { Paint } from '../../engine/types';
import { svg } from '../../ui/art';
import { paint } from '../kit';
import type { Direction, ForceInputs } from '../models/force-workshop';

export interface ForceWorkshopScene {
  kind:'force-workshop'; title:string; body:string; primary?:'2d'|'3d'; context:'raft'|'cart'|'box'|'ramp'|'wall'|'magnet'|'foot'|'moon';
  given:string; inputs?:ForceInputs; surfaceOptions?:boolean; surfaceView?:'smooth'|'rough'; arrows?:readonly {direction:Direction; label:string; lengthCm?:number}[];
}
const arrow=(d:Direction,label:string,lengthCm?:number)=>{
  const ends:Record<Direction,[number,number]>={right:[247,70],left:[73,70],up:[160,12],down:[160,128],'up-left':[106,16],'up-right':[214,16],'down-left':[106,124],zero:[160,70]};
  let [x,y]=ends[d]; if(lengthCm!==undefined && (d==='right'||d==='left')) x=160+(d==='right'?1:-1)*lengthCm*16; return d==='zero'?'':`<line x1="160" y1="70" x2="${x}" y2="${y}" stroke="#a34534" stroke-width="4" marker-end="url(#force-tip)"/><text x="${x}" y="${Math.max(10,y-7)}" text-anchor="middle" font-size="11">${label}</text>`;
};
/** Only explicitly given arrows are drawn; answer arrows are supplied after a correct response. */
export function forcePaint(scene:ForceWorkshopScene):Paint {
  const ramp=scene.context==='ramp';
  const base=ramp?'<path d="M125 126L236 15" stroke="#647877" stroke-width="7"/>':scene.context==='wall'?'<path d="M240 15V130" stroke="#647877" stroke-width="7"/>':'<path d="M25 108H295" stroke="#647877" stroke-width="7"/>';
  const draw=paint(svg(320,145,`<defs><marker id="force-tip" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z" fill="#a34534"/></marker></defs>${base}<rect x="130" y="49" width="60" height="42" rx="5" ${ramp?'transform="rotate(-45 160 70)"':''} fill="#70b4ad" stroke="#25485a" stroke-width="2"/><text x="160" y="74" text-anchor="middle" font-size="12">${scene.body}</text>${(scene.arrows??[]).map(a=>arrow(a.direction,a.label,a.lengthCm)).join('')}`,`Tarkasteltava kappale ${scene.body}.`).replace('<svg ',scene.surfaceOptions?'<svg class="force-surface-diagram" ':'<svg ')+`<p><strong>Kohde: ${scene.body}.</strong> ${scene.given}</p>`);
  return (host,context)=>{
    draw(host);
    if(scene.surfaceOptions) {
      const controls=document.createElement('div'); controls.className='row'; controls.setAttribute('aria-label','Pintaparin vertailu');
      let selected=scene.surfaceView??'smooth';
      for(const [value,label] of [['smooth','Sileä pinta'],['rough','Karkea pinta']] as const) {
        const button=document.createElement('button'); button.type='button';button.className='btn small';button.textContent=label;button.dataset.surface=value;
        button.setAttribute('aria-pressed',String(value===selected));
        button.addEventListener('click',()=>{selected=value;controls.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.surface===selected)));context?.onViewChange?.(`force-surface:${selected}`);});
        controls.append(button);
      }
      host.append(controls);
    } else if(scene.surfaceView) { const note=document.createElement('p'); note.textContent=`Mallitarkistuksessa pinta: ${scene.surfaceView==='rough'?'karkea':'sileä'}.`;host.append(note); }
  };
}
