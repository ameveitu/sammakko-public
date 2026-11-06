import type { SaaristoHandle } from './saaristo/main';
export type FamilyPhase = 'arrival' | 'work' | 'consequence';
export interface FamilyWorldHandle {
 enter(familyId:string, settings?:{nodeId?:string;phase?:FamilyPhase}):boolean;
 setPhase(phase:FamilyPhase):boolean;
 resolve(nodeId:string, options:{eventId:string;lessonModel?:unknown}):boolean;
 restoreEffects(eventIds:readonly string[]):void;
 advanceTime(ms:number):void; skipToEnd():void; setReducedMotion(value:boolean):void; setPaused(value:boolean):void; clear():void;
 /** Anchor positions describe the reserved memory location; an active fixture uses its own full-size location. */
 snapshot():{familyId:string|null;nodeId:string|null;composition:string|null;milieu:'reed'|'rocky'|'workshop'|'ice'|'cave'|'mountain'|'garden'|'observatory'|null;visibleObjects:string[];phase:FamilyPhase|null;elapsed:number;quality:string;renderer:'webgl'|'fallback';effects:string[];anchors:{effectId:string;familyId:string;anchorId:string|null;position:number[]|null;mode:'active'|'memory'|'hidden'}[];modelBoundEffects:string[];consequence:string|null;actionPhase:'before'|'action'|'after'|null;remaining:number;reducedMotion:boolean;paused:boolean};
 dispose():void;
}
export function mountFamilyWorlds(world:SaaristoHandle, options?:{reducedMotion?:boolean;quality?:'full'|'balanced'|'light'}):FamilyWorldHandle;

/** Only these event IDs currently have implemented, authored family fixtures. */
export const FAMILY_IMPLEMENTED_EFFECT_IDS: readonly string[];
