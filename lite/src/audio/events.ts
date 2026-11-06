// Game events → effect families. Pure, so tests can check that one change gives one sound.

export interface FlightSnap { splashes: number; rings: boolean[]; done: boolean }

/** Effects for one flight step: a splash, each newly passed ring, and the landing. */
export function flightSounds(before: FlightSnap, after: FlightSnap): string[] {
  const out: string[] = [];
  if (after.splashes > before.splashes) out.push('water.splash');
  if (after.rings.some((r, i) => r && !before.rings[i])) out.push('ui.confirm');
  if (after.done && !before.done) out.push('land.dry');
  return out;
}
