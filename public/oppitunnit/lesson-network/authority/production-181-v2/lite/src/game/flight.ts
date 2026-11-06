// The first flight: a short side-view trip to the island. Game fiction with deterministic
// rules (hold to climb, release to glide down, the water bounces you back up: no failing).
// It is not a physics lesson and records no learning evidence.
import { FLIGHT, type WingId } from './state';

export interface FlightState { t: number; x: number; y: number; vy: number; rings: boolean[]; done: boolean; splashes: number }
export const WATER = 0.82, ISLAND = 0.88, LANDED = WATER - 0.07;

export const startFlight = (wing: WingId): FlightState => ({ t: 0, x: 0.04, y: 0.45, vy: 0, rings: FLIGHT[wing].rings.map(() => false), done: false, splashes: 0 });

/** Advance by dt seconds with the climb control held (up) or released. Frame-rate independent
 *  enough for play: dt is capped and sub-stepped. */
export function stepFlight(f: FlightState, wing: WingId, up: boolean, dt: number): FlightState {
  const W = FLIGHT[wing];
  let rest = Math.min(dt, 0.25);
  while (rest > 1e-9 && !f.done) {
    const h = Math.min(rest, 1 / 120); rest -= h;
    f.t += h;
    f.vy += (up ? -W.lift : W.sink) * h * 1.6;
    f.vy = Math.max(-0.6, Math.min(0.6, f.vy));
    f.y += f.vy * h;
    if (f.y > WATER) { f.y = WATER; f.vy = -0.3; f.splashes++; }
    if (f.y < 0.12) { f.y = 0.12; f.vy = 0; }
    f.x += W.speed * h;
    W.rings.forEach(([rx, ry], i) => { if (!f.rings[i] && Math.abs(f.x - rx) < 0.03 && Math.abs(f.y - ry) < 0.09) f.rings[i] = true; });
    // Arriving lands the craft on the island, whatever height it came in at.
    if (f.x >= ISLAND) { f.x = ISLAND; f.y = LANDED; f.vy = 0; f.done = true; }
  }
  return f;
}
