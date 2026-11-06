// Shared motion/time model. One scenario time t drives every view: the moving object,
// ruler, stopwatch, lamps, timeline, data table, graphs and strobe snapshots are all
// computed from frameAt(run, t). Positions are exact functions of t (never integrated per
// frame), so the result does not depend on frame rate, and a replay is identical.

/** One piece of the speed profile: from time t0 the object is at s0 with speed v0 and
 *  constant acceleration a (m/s²). Speed never goes below zero: braking ends in rest. */
interface Seg { t0: number; s0: number; v0: number; a: number }

/** A leg of a planned run: lasts `dur` seconds; `v` sets the speed at its start
 *  (default: keep the current speed), `a` is the acceleration during it (default 0). */
export interface Leg { dur: number; v?: number; a?: number }

export interface Track {
  kind: 'straight' | 'oval';
  /** Course length in metres. On the oval, one lap is exactly L metres of path (arc length). */
  L: number;
}

export class Run {
  private segs: Seg[] = [];
  /** Speed changes made by the learner (rally control or "stop"), in scenario time. */
  readonly events: { t: number; v: number }[] = [];
  /** Finish line on a straight course: the object stops there (speed 0 after it). */
  cap: number | undefined;
  constructor(legs: Leg[] = [{ dur: Infinity, v: 0 }], cap?: number) {
    this.cap = cap;
    let t = 0;
    for (const l of legs) {
      const prev = this.segs[this.segs.length - 1];
      const s0 = prev ? this.sOf(prev, t) : 0;
      const v0 = l.v ?? (prev ? this.vOf(prev, t) : 0);
      this.segs.push({ t0: t, s0, v0, a: l.a ?? 0 });
      t += l.dur;
    }
  }
  private seg(t: number): Seg {
    let k = 0;
    while (k + 1 < this.segs.length && this.segs[k + 1]!.t0 <= t) k++;
    return this.segs[k]!;
  }
  private vOf(g: Seg, t: number) { return Math.max(0, g.v0 + g.a * (t - g.t0)); }
  private sOf(g: Seg, t: number) {
    const dt = Math.max(0, t - g.t0);
    // Braking to rest: the object stops at v = 0 and stays.
    if (g.a < 0 && g.v0 + g.a * dt < 0) { const ts = -g.v0 / g.a; return g.s0 + g.v0 * ts + 0.5 * g.a * ts * ts; }
    return g.s0 + g.v0 * dt + 0.5 * g.a * dt * dt;
  }
  /** Distance travelled along the path at time t (metres). */
  s(t: number) { const s = t <= 0 ? 0 : this.sOf(this.seg(t), t); return this.cap === undefined ? s : Math.min(s, this.cap); }
  /** Speed at time t (m/s). Zero once the finish line is reached. */
  v(t: number) {
    if (t < 0) return 0;
    if (this.cap !== undefined && t > 0 && this.sOf(this.seg(t), t) >= this.cap - 1e-9) return 0;
    return this.vOf(this.seg(t), t);
  }
  /** From time t on, move at constant speed v (learner control). Later plans are dropped. */
  setSpeed(t: number, v: number) {
    const s0 = this.s(t);
    this.segs = this.segs.filter((x) => x.t0 < t);
    if (!this.segs.length) this.segs.push({ t0: 0, s0: 0, v0: 0, a: 0 });
    this.segs.push({ t0: t, s0, v0: Math.max(0, v), a: 0 });
    this.events.push({ t, v });
  }
  /** Stop the vehicle: speed becomes 0, scenario time keeps running. */
  stop(t: number) { this.setSpeed(t, 0); }
  /** First time the path distance reaches d (or undefined). Bisection on the monotone s(t). */
  timeAt(d: number, end = 600): number | undefined {
    if (this.s(end) < d - 1e-9) return undefined;
    let lo = 0, hi = end;
    for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (this.s(m) >= d - 1e-12) hi = m; else lo = m; }
    return hi;
  }
}

/** Drawn oval box (px): the player draws the stadium in this box, and positions on it are
 *  parameterised by the drawn arc length, so equal metres are equal lengths on screen. */
export const OVAL_BOX = { w: 268, h: 130 };
/** Stadium in the 0..1 box: straights from x 0.3 to 0.7 at y 0.1 / 0.9, half-ellipse bends. */
const ovalPt = (u: number): [number, number] => {
  // u runs 0..4 over the four drawn pieces (bottom straight, right bend, top straight, left bend).
  const k = Math.min(3, Math.floor(u)), f = u - k, r = 0.4;
  if (k === 0) return [0.3 + f * 0.4, 0.5 + r];
  if (k === 1) { const a = Math.PI / 2 - f * Math.PI; return [0.7 + 0.2 * Math.cos(a), 0.5 + r * Math.sin(a)]; }
  if (k === 2) return [0.7 - f * 0.4, 0.5 - r];
  const a = -Math.PI / 2 - f * Math.PI; return [0.3 + 0.2 * Math.cos(a), 0.5 + r * Math.sin(a)];
};
/** Cumulative drawn length (px) at N+1 samples of u ∈ [0, 4]. */
const OVAL_N = 800;
const OVAL_CUM = (() => {
  const c = [0]; let [px, py] = ovalPt(0);
  for (let i = 1; i <= OVAL_N; i++) { const [x, y] = ovalPt((4 * i) / OVAL_N); c.push(c[i - 1]! + Math.hypot((x - px) * OVAL_BOX.w, (y - py) * OVAL_BOX.h)); px = x; py = y; }
  return c;
})();
/** Point at a fraction `frac` (0..1) of the drawn lap length. */
function ovalAt(frac: number): [number, number] {
  const want = frac * OVAL_CUM[OVAL_N]!;
  let lo = 0, hi = OVAL_N;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (OVAL_CUM[m]! <= want) lo = m; else hi = m; }
  const seg = OVAL_CUM[hi]! - OVAL_CUM[lo]!, f = seg > 0 ? (want - OVAL_CUM[lo]!) / seg : 0;
  return ovalPt((4 * (lo + f)) / OVAL_N);
}

/** Point on the track for path distance s, in a 0..1 × 0..1 box. One lap of the oval = L metres,
 *  and on screen the object covers equal drawn lengths in equal metres (arc-length parameterised). */
export function place(track: Track, s: number): { x: number; y: number; lap: number; along: number } {
  const L = track.L;
  if (track.kind === 'straight') { const along = Math.min(Math.max(s, 0), L); return { x: along / L, y: 0.5, lap: 0, along }; }
  const lap = Math.floor(s / L), u = ((s % L) + L) % L / L; // fraction of a lap
  const [x, y] = ovalAt(u);
  return { x, y, lap, along: s };
}

/** Scenario clock. At rate 1 one real second is one scenario second. */
export class Clock {
  t = 0;
  playing = false;
  /** Set when the page was hidden and the clock paused itself. */
  autoPaused = false;
  private last: number | undefined;
  constructor(public end: number, public rate = 1) {}
  play(now: number) { if (this.t >= this.end) this.t = 0; this.playing = true; this.autoPaused = false; this.last = now; }
  pause() { this.playing = false; this.last = undefined; }
  replay(now: number) { this.t = 0; this.play(now); }
  seek(t: number) { this.t = Math.min(Math.max(0, t), this.end); this.last = undefined; if (this.playing) this.playing = false; }
  /** The page was hidden: pause, and do not catch up the hidden time later. */
  hide() { if (this.playing) { this.pause(); this.autoPaused = true; } }
  /** Advance to real time `now` (ms). Returns the new scenario time. */
  tick(now: number) {
    if (!this.playing) return this.t;
    if (this.last !== undefined) this.t = Math.min(this.end, this.t + ((now - this.last) / 1000) * this.rate);
    this.last = now;
    if (this.t >= this.end) this.pause();
    return this.t;
  }
}

export interface FrameOpts {
  /** Path distances of lamps along the course; a lamp lights when the object passes it. */
  lampsAt?: number[];
  /** Data table / strobe interval in seconds. */
  dt?: number;
  /** The stopwatch stops when the object reaches this path distance (finish line). */
  watchStopAt?: number;
  tenths?: boolean;
}

/** Everything any view shows at scenario time t. Views render only from this. */
export interface Frame {
  t: number; s: number; v: number; x: number; y: number; lap: number;
  /** Stopwatch reading, whole tenths of a second. */
  watch: string;
  lamps: boolean[];
  /** Data rows reached so far (time, distance): one per dt. */
  rows: [number, number][];
  /** Strobe snapshots taken so far: path distances at k·dt. */
  snaps: number[];
}

const r1 = (x: number) => Math.round(x * 10) / 10;
/** Stopwatch text: whole seconds (before decimals are taught) or tenths. */
export const fmtWatch = (t: number, tenths = true) => tenths ? (Math.floor(t * 10 + 1e-6) / 10).toFixed(1).replace('.', ',') : String(Math.floor(t + 1e-6));

export function frameAt(run: Run, track: Track, t: number, o: FrameOpts = {}): Frame {
  const s = run.s(t), p = place(track, s), dt = o.dt ?? 1;
  const rows: [number, number][] = [];
  for (let k = 0; k * dt <= t + 1e-9; k++) rows.push([r1(k * dt), r1(run.s(k * dt))]);
  return {
    t, s, v: run.v(t), x: p.x, y: p.y, lap: p.lap,
    watch: fmtWatch(o.watchStopAt === undefined ? t : Math.min(t, run.timeAt(o.watchStopAt, t + 1e-9) ?? t), o.tenths ?? true),
    lamps: (o.lampsAt ?? []).map((d) => s >= d - 1e-9),
    rows,
    snaps: rows.map((rw) => run.s(rw[0])),
  };
}
