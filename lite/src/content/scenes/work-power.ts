import type { Paint } from '../../engine/types';
import type { Lift } from '../models/work-power';
export interface WorkPowerScene {kind:'work-power'; title:string; given:string; lifts:readonly Lift[]; durationS:number;}
export function workPowerPaint(scene:WorkPowerScene):Paint {return host=>{const p=document.createElement('p');p.textContent=(scene.lifts.length>1?"A on vasemmalla ja B oikealla. ":"")+scene.given;host.replaceChildren(p);};}
