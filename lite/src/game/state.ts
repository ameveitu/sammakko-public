// Lentopaja game state: kept apart from lesson attempts and from the derived knowledge state.
// Three records stay distinct: game progress (here), lesson attempts/assistance (store), and
// what is known (derived from attempts). A mission grants its part once (idempotent) and only
// from attempts made inside that mission; inferred ancestors and replays mint nothing.
import type { Attempt } from '../engine/evidence';

export type Slot = 'chassis' | 'wings' | 'engine';
export type SceneId = 'paja' | 'ranta' | 'rata' | 'torni';
export type Route = 'guided' | 'direct' | 'tester';
export type WingId = 'leveat' | 'kapeat';

/** Where a possession came from. Legacy = snapshot of an older save's prizes (never a mission). */
export interface Possession { from: 'mission' | 'legacy' | 'found' | 'start'; mission?: string; route?: Route; at: number }
export interface MissionDone { at: number; route: Route; node: string }
export interface Flight { at: number; wing: WingId; route: string; rings: number; arrived: boolean }
/** A free test-track run the child wrote into the notebook (game record, never evidence). */
export interface Run { at: number; v: number; L: number; secs: number }
/** A beach race Loikka vs Aava that was played to the end (game record, never evidence).
 *  `guess` is the child's prediction of Loikka's time, when one was asked. */
export interface Race { at: number; L: number; loikka: number; aava: number; guess?: number }

export interface GameState {
  v: 1;
  /** The opening scene has been seen (it can be replayed). */
  intro: boolean;
  /** Loikka's place: scene and x (0..1). */
  pos: { scene: SceneId; x: number };
  inv: Record<string, Possession>;
  slots: Partial<Record<Slot, string>>;
  wing: WingId;
  pennant: string;
  missions: Record<string, MissionDone>;
  /** Snacks caught. Growth and the long hop are bounded and purely for world movement. */
  snacks: number;
  size: 0 | 1 | 2;
  hop: 'normal' | 'long';
  flights: Flight[];
  runs: Run[];
  races: Race[];
  /** Keepsakes the child put on the workshop shelf. */
  shelf: string[];
}

export interface Mission {
  id: string; slot: Slot; part: string; scene: SceneId;
  /** Guided route: learn this lesson with help. */
  guided: string;
  /** Direct route: a quick check on a later lesson that needs the guided one. */
  direct: string;
}

export const MISSIONS: Mission[] = [
  { id: 'm-runko', slot: 'chassis', part: 'runko', scene: 'ranta', guided: 'M-NUM-01', direct: 'M-MUL-01' },
  { id: 'm-siivet', slot: 'wings', part: 'siivet', scene: 'rata', guided: 'M-MEAS-04', direct: 'M-GMEAS-01' },
  { id: 'm-potkuri', slot: 'engine', part: 'potkuri', scene: 'rata', guided: 'M-TIME-03', direct: 'PHY79-SPEED-CONCEPT' },
];
export const mission = (id: string) => MISSIONS.find((m) => m.id === id);

export const PENNANTS = ['#e8674a', '#2f6fb3', '#f4c542', '#6cb85c'];
export const SCENES: SceneId[] = ['paja', 'ranta', 'rata', 'torni'];

export const fresh = (now = 0): GameState => ({
  v: 1, intro: false, pos: { scene: 'paja', x: 0.3 }, inv: { vihko: { from: 'start', at: now } }, slots: {}, wing: 'leveat', pennant: PENNANTS[0]!,
  missions: {}, snacks: 0, size: 0, hop: 'normal', flights: [], runs: [], races: [], shelf: [],
});

const obj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const num = (x: unknown, d: number) => (typeof x === 'number' && Number.isFinite(x) ? x : d);

/** Read whatever is stored; repair what can be repaired, drop what cannot. Never throws. */
export function validate(raw: unknown, now = 0): GameState {
  const g = fresh(now);
  if (!obj(raw)) return g;
  g.intro = raw.intro === true;
  if (obj(raw.pos) && SCENES.includes(raw.pos.scene as SceneId)) g.pos = { scene: raw.pos.scene as SceneId, x: Math.min(1, Math.max(0, num(raw.pos.x, 0.3))) };
  if (obj(raw.inv)) {
    g.inv = {};
    for (const [k, p] of Object.entries(raw.inv)) if (obj(p) && ['mission', 'legacy', 'found', 'start'].includes(p.from as string))
      g.inv[k] = { from: p.from as Possession['from'], at: num(p.at, now), ...(typeof p.mission === 'string' ? { mission: p.mission } : {}), ...(['guided', 'direct', 'tester'].includes(p.route as string) ? { route: p.route as Route } : {}) };
  }
  if (obj(raw.missions)) for (const [k, m] of Object.entries(raw.missions)) if (mission(k) && obj(m) && ['guided', 'direct', 'tester'].includes(m.route as string))
    g.missions[k] = { at: num(m.at, now), route: m.route as Route, node: typeof m.node === 'string' ? m.node : '' };
  // A mission's part is never lost: a completed mission always leaves its part in the backpack or a slot.
  for (const [k, m] of Object.entries(g.missions)) { const M = mission(k)!; g.inv[`part:${M.part}`] ??= { from: 'mission', mission: k, route: m.route, at: m.at }; }
  if (obj(raw.slots)) for (const s of ['chassis', 'wings', 'engine'] as Slot[]) { const v = raw.slots[s]; if (typeof v === 'string' && g.inv[`part:${v}`]) g.slots[s] = v; }
  g.wing = raw.wing === 'kapeat' ? 'kapeat' : 'leveat';
  g.pennant = PENNANTS.includes(raw.pennant as string) ? (raw.pennant as string) : PENNANTS[0]!;
  g.snacks = Math.max(0, Math.floor(num(raw.snacks, 0)));
  g.size = sizeFor(g.snacks);
  g.hop = raw.hop === 'long' && g.size > 0 ? 'long' : 'normal';
  if (Array.isArray(raw.flights)) g.flights = raw.flights.filter(obj).slice(-50).map((f) => ({ at: num(f.at, now), wing: f.wing === 'kapeat' ? 'kapeat' : 'leveat', route: String(f.route ?? ''), rings: num(f.rings, 0), arrived: f.arrived === true }));
  if (Array.isArray(raw.runs)) g.runs = raw.runs.filter(obj).slice(-50).map((r) => ({ at: num(r.at, now), v: num(r.v, 0), L: num(r.L, 0), secs: num(r.secs, 0) }));
  if (Array.isArray(raw.races)) g.races = raw.races.filter(obj).slice(-50).map((r) => ({ at: num(r.at, now), L: num(r.L, 0), loikka: num(r.loikka, 0), aava: num(r.aava, 0), ...(typeof r.guess === 'number' ? { guess: r.guess } : {}) })).filter((r) => (RACE.lengths as readonly number[]).includes(r.L));
  if (Array.isArray(raw.shelf)) g.shelf = raw.shelf.filter((k): k is string => typeof k === 'string' && !!g.inv[k]).slice(0, 12);
  return g;
}

/** Growth is bounded: three snacks per step, two steps at most. Mistakes never shrink it. */
export const sizeFor = (snacks: number): 0 | 1 | 2 => (snacks >= 6 ? 2 : snacks >= 3 ? 1 : 0);
export function snack(g: GameState) { g.snacks++; g.size = sizeFor(g.snacks); }
/** Walking speed in the world (scene widths per second). World play only: experiments never read it. */
export const walkSpeed = (g: GameState) => 0.45 * (g.hop === 'long' ? 1 + 0.3 * g.size : 1);

/** Which route (if any) completed a mission, read only from attempts made inside it.
 *  Guided: two correct answers on the guided lesson. Direct: the direct lesson is checked and at
 *  least one correct answer was given inside the mission without guidance (not a guided item, no
 *  demo or hint used). A guided success never reads as direct (review L181-10). Replays never count. */
export function outcome(m: Mission, attempts: Attempt[], checked: (node: string) => boolean): Route | null {
  const mine = attempts.filter((a) => a.mission === m.id && a.ok && !a.replay);
  const unaided = (a: Attempt) => a.node === m.direct && a.phase !== 'guided' && !a.help?.length;
  if (mine.some(unaided) && checked(m.direct)) return 'direct';
  // Helped answers on the direct lesson inside the mission count towards the guided route.
  if (mine.filter((a) => a.node === m.guided || (a.node === m.direct && !unaided(a))).length >= 2) return 'guided';
  return null;
}

/** Grant a mission's part once. Returns false when it was already granted (refresh, replay, import). */
export function grant(g: GameState, id: string, route: Route, now: number): boolean {
  const m = mission(id);
  if (!m || g.missions[id]) return false;
  g.missions[id] = { at: now, route, node: route === 'direct' ? m.direct : m.guided };
  g.inv[`part:${m.part}`] ??= { from: 'mission', mission: id, route, at: now };
  return true;
}

/** Put an owned part into its slot. */
export function install(g: GameState, m: Mission): boolean {
  if (!g.inv[`part:${m.part}`]) return false;
  g.slots[m.slot] = m.part;
  return true;
}

/** Give a found tool once. */
export function find(g: GameState, key: string, now: number): boolean {
  if (g.inv[key]) return false;
  g.inv[key] = { from: 'found', at: now };
  return true;
}

export const ready = (g: GameState) => !!(g.slots.chassis && g.slots.wings && g.slots.engine);

/** One-time snapshot of an older save's prizes (derived from known status back then), marked
 *  as legacy. It invents no missions and no checked skills. */
export function snapshotLegacy(g: GameState, prizes: string[], now: number) {
  for (const p of prizes) g.inv[`prize:${p}`] ??= { from: 'legacy', at: now };
}

/** Flight route: wide wings climb easily and take the high route over the gull rock;
 *  narrow wings are quicker and take the low route through the stone arch. Fiction, not physics. */
export const FLIGHT = {
  leveat: { route: 'Lokkikallion yli', lift: 1.25, sink: 0.55, speed: 0.11, rings: [[0.25, 0.35], [0.45, 0.22], [0.65, 0.3]] as [number, number][] },
  kapeat: { route: 'Kivikaaren läpi', lift: 1.0, sink: 0.75, speed: 0.15, rings: [[0.25, 0.6], [0.45, 0.68], [0.65, 0.58]] as [number, number][] },
} as const;

/** The beach race: one controlled model. Each runner keeps one steady speed; only the distance
 *  changes. Times come from the same model the track, stopwatch and graph draw. */
export const RACE = { lengths: [6, 12, 18], loikka: 3, aava: 2 } as const;
export const raceTimes = (L: number) => ({ loikka: L / RACE.loikka, aava: L / RACE.aava });

/** Choices for "how long will Loikka take this time?" after an earlier race at another distance:
 *  the right time, the old time (distance ignored) and one more distractor. Sorted, distinct. */
export function guessOptions(prevL: number, L: number): number[] {
  const right = raceTimes(L).loikka, old = raceTimes(prevL).loikka;
  const third = right + old <= 10 ? right + old : Math.max(1, Math.abs(right - old) || right + 1);
  return [...new Set([right, old, third])].sort((a, b) => a - b);
}

const fi = (x: number) => String(Math.round(x * 10) / 10).replace('.', ',');
/** Aava's reading of the notebook after a race: what changed and what stayed the same. */
export function raceTalk(races: Race[]): string {
  const r = races[races.length - 1];
  if (!r) return 'Valitse matka ja käynnistä kisa. Minä luen sekuntikelloa.';
  let t = `${r.L} metriä: Loikka ${fi(r.loikka)} s, minä ${fi(r.aava)} s. Samassa ajassa Loikka ehtii pidemmälle, joten sen viiva kuvaajassa on jyrkempi.`;
  const prev = [...races].reverse().find((x) => x.L !== r.L);
  if (prev) {
    const k = r.L / prev.L;
    const word = Math.abs(k - 2) < 1e-9 ? 'kaksinkertaistui' : Math.abs(k - 3) < 1e-9 ? 'kolminkertaistui' : Math.abs(k - 1.5) < 1e-9 ? 'kasvoi puolitoistakertaiseksi'
      : Math.abs(k - 0.5) < 1e-9 ? 'puolittui' : Math.abs(k - 1 / 3) < 1e-9 ? 'pieneni kolmasosaan' : 'pieneni kahteen kolmasosaan';
    t += ` Matka ${word} (${prev.L} m → ${r.L} m), ja Loikan aikakin ${word} (${fi(prev.loikka)} s → ${fi(r.loikka)} s). Nopeus pysyi samana: ${RACE.loikka} metriä joka sekunti.`;
  }
  if (r.guess !== undefined) t += r.guess === r.loikka ? ' Arvauksesi osui!' : ` Arvasit ${fi(r.guess)} s.`;
  return t;
}
