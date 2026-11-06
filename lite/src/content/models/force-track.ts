/** Ideal, horizontal, frictionless track. Positive is right. Weight and normal force cancel. */
export interface ForceTrack {
  kind: 'force-track';
  title: string;
  vehicle: string;
  initialSpeed: number;
  mass: number;
  rightForce: number;
  leftForce: number;
  seconds: number;
}

export function trackMotion(track: ForceTrack, time = track.seconds) {
  const netForce = track.rightForce - track.leftForce;
  const acceleration = netForce / track.mass;
  return {
    netForce,
    acceleration,
    velocity: track.initialSpeed + acceleration * time,
    displacement: track.initialSpeed * time + acceleration * time ** 2 / 2,
  };
}

export interface ActionPair {
  kind: 'action-pair';
  title: string;
  bodies: [string, string];
  force: number;
  directionOnSecond: -1 | 1;
  context: 'carts' | 'oar';
}

/** One force per recipient, with equal magnitudes and opposite signed directions. */
export function pairForces(pair: ActionPair) {
  const [first, second] = pair.bodies;
  const onSecond = pair.directionOnSecond * pair.force;
  return [
    { from: second, on: first, signedNewtons: -onSecond },
    { from: first, on: second, signedNewtons: onSecond },
  ] as const;
}
