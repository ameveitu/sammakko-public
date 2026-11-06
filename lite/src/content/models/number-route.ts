import type { Direction, NumberJourneyTask, Point } from './number-journey';
/** Given-only scene. No expected route, destination or learner answer is stored here. */
export interface NumberRouteScene {kind:'number-route';title:string;width:number;height:number;origin:Point;heading:Direction;frame:'fixed'|'actor'}
export function numberRouteScene(task:NumberJourneyTask):NumberRouteScene|undefined {
 if(task.mode!=='route')return undefined;
 return {kind:'number-route',title:'Suuntien pienoissaari',width:5,height:5,origin:{...task.origin},heading:task.heading,frame:task.frame};
}
