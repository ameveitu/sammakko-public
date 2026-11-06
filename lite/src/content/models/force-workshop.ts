/** One-dimensional signed forces are in newtons; + is right, − is left.
 * Reference models: https://openstax.org/books/university-physics-volume-1/pages/5-3-newtons-second-law
 * https://openstax.org/books/university-physics-volume-1/pages/5-5-newtons-third-law
 * https://openstax.org/books/university-physics-volume-1/pages/6-2-friction
 * https://openstax.org/books/university-physics-volume-1/pages/5-6-common-forces
 */
export type Direction = 'left'|'right'|'up'|'down'|'up-left'|'up-right'|'down-left'|'zero';
export interface AppliedForce { from:string; on:string; signedN:number }
export function netOn(body:string, forces:readonly AppliedForce[]):number {
  if(forces.some(force=>!Number.isFinite(force.signedN))) throw new RangeError('Invalid force');
  return forces.filter(force=>force.on===body).reduce((sum,force)=>sum+force.signedN,0);
}
export function directionOf(value:number):Direction { return value>0?'right':value<0?'left':'zero'; }
/** Relative slip or its tendency is signed, not the object's velocity relative to the room. */
export function frictionOpposing(relativeSlip:number):Direction { return relativeSlip>0?'left':relativeSlip<0?'right':'zero'; }
export function normalDirection(surface:'flat'|'ramp-right'|'wall-right'):Direction {
  return surface==='flat'?'up':surface==='ramp-right'?'up-left':'left';
}
export function weightNewtons(massKg:number, gravityNPerKg:number):number {
  if(!Number.isFinite(massKg)||massKg<0||!Number.isFinite(gravityNPerKg)||gravityNPerKg<0) throw new RangeError('Invalid mass or gravity');
  return Math.round(massKg*gravityNPerKg*1000000)/1000000;
}
export function vectorLengthCm(forceN:number, scaleNPerCm:number):number {
  if(!Number.isFinite(forceN)||forceN<0||!Number.isFinite(scaleNPerCm)||scaleNPerCm<=0) throw new RangeError('Invalid arrow scale');
  return forceN/scaleNPerCm;
}

/** Input-only scene facts; computed force arrows are derived only when a view reveals them. */
export type ForceInputs =
  | {kind:'interaction';from:string;name:string}
  | {kind:'motion';from:string;netForceN:number;massKg:number;initialVelocity:number;durationS:number}
  | {kind:'direct';from:string;direction:Direction;newtons?:number}
  | {kind:'compare';from:string;direction:Direction;newtons:readonly [number,number]}
  | {kind:'diagram';surface:string}
  | {kind:'friction';relativeSlip:number;massKg?:number;surfaceVelocity?:number;frictionN?:readonly [number,number];durationS?:number}
  | {kind:'net';forces:readonly AppliedForce[]}
  | {kind:'support';surface:'flat'|'ramp-right'|'wall-right'}
  | {kind:'weight';massKg:number;gravityNPerKg:number;source:'Maa'|'Kuu'};
export interface DerivedForce {from:string;on:string;direction?:Direction;newtons?:number;name:string}
export function derivedForces(scene:{body:string;inputs?:ForceInputs}):DerivedForce[] {
  const {body,inputs}=scene;
  if(!inputs) return [];
  switch(inputs.kind) {
    case 'motion': return [{from:inputs.from,on:body,name:'voima',direction:directionOf(inputs.netForceN),newtons:Math.abs(inputs.netForceN)}];
    case 'interaction': return [{from:inputs.from,on:body,name:inputs.name}];
    case 'direct': return [{from:inputs.from,on:body,name:'annettu voima',direction:inputs.direction,...(inputs.newtons===undefined?{}:{newtons:inputs.newtons})}];
    case 'compare': return [{from:inputs.from,on:body,name:'suurempi annettu voima',direction:inputs.direction,newtons:Math.max(...inputs.newtons)}];
    case 'diagram': return [{from:'Maa',on:body,name:'paino',direction:'down'},{from:inputs.surface,on:body,name:'tukivoima',direction:'up'}];
    case 'friction': return [{from:'pinta',on:body,name:'kitka',direction:frictionOpposing(inputs.relativeSlip)}];
    case 'net': {const total=netOn(body,inputs.forces);return [{from:'yhteisvaikutus',on:body,name:'kokonaisvoima',direction:directionOf(total),newtons:Math.abs(total)}];}
    case 'support': return [{from:'kosketuspinta',on:body,name:'tukivoima',direction:normalDirection(inputs.surface)}];
    case 'weight': return [{from:inputs.source,on:body,name:'paino',direction:'down',newtons:weightNewtons(inputs.massKg,inputs.gravityNPerKg)}];
  }
}

/** Bounded, idealised horizontal demonstration. The supplied force is the net horizontal force. */
export function horizontalMotion(initialVelocity:number, netForce:number, massKg:number, time:number) {
  if (![initialVelocity,netForce,massKg,time].every(Number.isFinite) || massKg<=0 || time<0) throw new RangeError('Invalid motion');
  const acceleration=netForce/massKg;
  return {acceleration,velocity:initialVelocity+acceleration*time,displacement:initialVelocity*time+.5*acceleration*time*time};
}
/** Kinetic friction closes the signed relative-velocity gap; it never drives it past zero. */
export function slidingOnSurface(relativeVelocity:number, frictionN:number, massKg:number, time:number) {
  if (![relativeVelocity,frictionN,massKg,time].every(Number.isFinite) || massKg<=0 || frictionN<0 || time<0) throw new RangeError('Invalid friction model');
  const closing=frictionN/massKg*time;
  const remaining=Math.max(0,Math.abs(relativeVelocity)-closing);
  return remaining===0?0:Math.sign(relativeVelocity)*remaining;
}

/** World-frame displacement while kinetic friction reduces relative slip to zero. */
export function slidingDisplacement(relativeVelocity:number,surfaceVelocity:number,frictionN:number,massKg:number,time:number) {
  if (![relativeVelocity,surfaceVelocity,frictionN,massKg,time].every(Number.isFinite) || massKg<=0 || frictionN<0 || time<0) throw new RangeError('Invalid friction model');
  if(frictionN===0) return (surfaceVelocity+relativeVelocity)*time;
  const acceleration=-Math.sign(relativeVelocity)*frictionN/massKg;
  const active=Math.min(time,Math.abs(relativeVelocity)*massKg/frictionN);
  return (surfaceVelocity+relativeVelocity)*active+.5*acceleration*active*active+surfaceVelocity*(time-active);
}
