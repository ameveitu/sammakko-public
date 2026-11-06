/** Idealized constant force, with displacement parallel or perpendicular to the chosen force. */
export type Lift = { forceN:number; distanceM:number; durationS:number; direction:'parallel'|'horizontal'|'perpendicular'|'hold' };
export function workJ(lift:Lift):number {
  if (![lift.forceN,lift.distanceM,lift.durationS].every(Number.isFinite) || lift.forceN<0 || lift.distanceM<0 || lift.durationS<=0) throw new RangeError('Invalid lift');
  if(lift.direction==='hold' && lift.distanceM!==0) throw new RangeError('Holding has zero displacement');
  return (lift.direction==='parallel'||lift.direction==='horizontal')?lift.forceN*lift.distanceM:0;
}
export function powerW(work:number,seconds:number):number {
  if(!Number.isFinite(work)||!Number.isFinite(seconds)||seconds<=0) throw new RangeError('Duration must be positive');
  return work/seconds;
}
export function positionM(lift:Lift,seconds:number):number {
  workJ(lift);
  if(!Number.isFinite(seconds)) throw new RangeError('Invalid time');
  return lift.distanceM*Math.max(0,Math.min(seconds/lift.durationS,1));
}
