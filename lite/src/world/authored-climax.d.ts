import type { SaaristoHandle } from './saaristo/main';
import type { ExpeditionSceneModel } from '../content/expedition-slice';
export type ClimaxLessonModel = ExpeditionSceneModel | {kind:'cake-shares';left:readonly [number,number];right:readonly [number,number]};
import type { ClimaxId } from '../content/authored-climaxes';
export interface AuthoredClimaxOptions { characterBase?:string; reducedMotion?:boolean }
export interface AuthoredClimaxSnapshot {activeNode:ClimaxId|null;elapsed:number;duration:number;remaining:number;phase:'start'|'action'|'end'|null;phaseText:string;renderer:string;characterStatus:string;fixtures:string[];lessonModelKind:string|null}
export interface AuthoredClimaxHandle {play(nodeId:string,options?:{lessonModel?:ClimaxLessonModel}):boolean;advanceTime(ms:number):void;setPaused(value:boolean):void;skipToEnd():void;restoreEffects(ids:readonly string[]):void;clear():void;snapshot():AuthoredClimaxSnapshot;dispose():void}
export function mountAuthoredClimax(world:SaaristoHandle,options?:AuthoredClimaxOptions):AuthoredClimaxHandle;

export function brakingMotion(progress:number):{position:number;velocity:number;acceleration:number;braking:boolean};
