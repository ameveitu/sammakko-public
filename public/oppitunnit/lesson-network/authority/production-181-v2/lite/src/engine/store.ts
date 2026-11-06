import { nodeState, type Attempt, type NodeState } from './evidence';
import { allOfDescendants, GRAPH_SHA } from './graph';

export type World = 'ranta' | 'saari' | 'lab';

/** Non-answer events: deferring a topic, "this was confusing", adult notes. */
export interface LogEvent {
  type: 'defer' | 'confusing' | 'note' | 'support' | 'migrated';
  at: number;
  node?: string;
  text?: string;
  /** Item seed when the event refers to a specific task. */
  seed?: number;
  sess?: string;
  syn?: boolean;
}

export interface Save {
  v: 2;
  /** Graph sha at the time of the last write. */
  graph: string;
  /** Content revision at the time of the last write. */
  rev: string;
  created: number;
  /** The region currently shown. One local learner: switching regions keeps everything. */
  world: World | null;
  /** "I can't listen right now": quiet mode until this time (ms, real clock). */
  quietUntil: number;
  /** Development aid only (ignored in production builds): pretend time has passed. */
  clockOffset: number;
  /** Tester mode: new answers are marked synthetic and kept apart from the learner's evidence. */
  tester: boolean;
  attempts: Attempt[];
  events: LogEvent[];
  /** Game state (Lentopaja), kept apart from attempts. Validated by the game module. */
  game?: unknown;
  /** Tester mode's own disposable game state. */
  testerGame?: unknown;
}

export const SAVE_KEY = 'sammakko-lite-2';
const OLD_KEY = 'sammakko-lite-1';
export const SAVE_VERSION = 2;
let contentRev = 'unset';
/** Set by the content registry at start-up. */
export const setContentRev = (r: string) => { contentRev = r; };

const fresh = (): Save => ({
  v: 2, graph: GRAPH_SHA, rev: contentRev, created: Date.now(), world: null, quietUntil: 0, clockOffset: 0, tester: false, attempts: [], events: [],
});

/** Storage status, shown truthfully to the learner and the adult. */
export type StorageMode = 'local' | 'memory';
let mode: StorageMode = 'memory';
let memory: Save = fresh();

function ls(): Storage | undefined {
  try { return globalThis.localStorage ?? undefined; } catch { return undefined; }
}

function probe(): StorageMode {
  try {
    const s = ls();
    if (!s) return 'memory';
    s.setItem('sammakko-lite-probe', '1');
    s.removeItem('sammakko-lite-probe');
    return 'local';
  } catch { return 'memory'; }
}

/** Conservative migration of the earlier Lite save (v1): every answer is kept and
 *  marked legacy; no state is copied, everything is derived again under the current rules. */
export function migrate(old: unknown): Save {
  const s = fresh();
  const o = old as Partial<{ world: World | null; quietUntil: number; attempts: Attempt[] }>;
  if (!o || !Array.isArray(o.attempts)) return s;
  s.world = o.world ?? null;
  s.quietUntil = typeof o.quietUntil === 'number' ? o.quietUntil : 0;
  s.attempts = o.attempts
    .filter((a) => a && typeof a.node === 'string' && typeof a.at === 'number')
    .map((a) => ({ node: a.node, phase: a.phase, ok: !!a.ok, tag: a.tag ?? '', at: a.at, legacy: true, rev: 'v1' }));
  s.events.push({ type: 'migrated', at: Date.now(), text: `v1: ${s.attempts.length} answers` });
  return s;
}

/** What happened when the save was opened; shown to the adult and, briefly, on the map. */
export type SaveNote = 'readonly' | 'repaired' | 'unreadable' | null;
let note: SaveNote = null;
export const BACKUP_KEY = 'sammakko-lite-2-unreadable';

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const WORLDS: (World | null)[] = ['ranta', 'saari', 'lab', null];
const PHASES = ['guided', 'independent', 'transfer', 'retrieval', 'quick', 'practice'];

/** Shape validation. Keeps every well-formed attempt and event; reports whether anything had to be dropped. */
export function validate(p: unknown): { save: Save | null; repaired: boolean } {
  if (!isObj(p) || p.v !== 2) return { save: null, repaired: false };
  let repaired = false;
  const arr = (x: unknown) => { if (Array.isArray(x)) return x as unknown[]; if (x !== undefined) repaired = true; return []; };
  const attempts = arr(p.attempts).filter((a): a is Attempt => {
    const ok = isObj(a) && typeof a.node === 'string' && typeof a.at === 'number' && typeof a.ok === 'boolean' && PHASES.includes(a.phase as string);
    if (!ok) repaired = true;
    return ok;
  }).map((a) => ({ ...a, tag: typeof a.tag === 'string' ? a.tag : '' }));
  const events = arr(p.events).filter((e): e is LogEvent => {
    const ok = isObj(e) && typeof e.type === 'string' && typeof e.at === 'number';
    if (!ok) repaired = true;
    return ok;
  });
  const num = (x: unknown, d: number) => { if (typeof x === 'number' && Number.isFinite(x)) return x; if (x !== undefined) repaired = true; return d; };
  const world = WORLDS.includes(p.world as World) ? (p.world as World | null) : (repaired = true, null);
  const base = fresh();
  return {
    save: {
      ...base, created: num(p.created, base.created), world, quietUntil: num(p.quietUntil, 0), clockOffset: num(p.clockOffset, 0),
      tester: p.tester === true, attempts, events, game: p.game, testerGame: p.testerGame,
      graph: typeof p.graph === 'string' ? p.graph : base.graph, rev: typeof p.rev === 'string' ? p.rev : base.rev,
    },
    repaired,
  };
}

/** Reading never depends on writing: a readable save is used even when storage refuses writes. */
function read(): Save {
  note = null;
  const s = ls();
  let raw: string | null = null, old: string | null = null;
  try { raw = s?.getItem(SAVE_KEY) ?? null; if (!raw) old = s?.getItem(OLD_KEY) ?? null; } catch { /* storage not readable */ }
  mode = probe();
  const keepRaw = (text: string) => {
    if (mode !== 'local') return;
    try { s!.setItem(BACKUP_KEY, text); } catch { mode = 'memory'; }
  };
  let out: Save | null = null;
  if (raw) {
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch { parsed = undefined; }
    const v = validate(parsed);
    if (v.save) { out = v.save; if (v.repaired) { note = 'repaired'; keepRaw(raw); } }
    else { note = 'unreadable'; keepRaw(raw); }
    // Unreadable or repaired: the original text was copied aside before anything is written.
  } else if (old) {
    try { out = migrate(JSON.parse(old)); } catch { note = 'unreadable'; }
  }
  if (mode === 'memory' && out) note = note ?? 'readonly';
  return out ?? fresh();
}

function write(s: Save) {
  memory = s;
  s.graph = GRAPH_SHA;
  s.rev = contentRev;
  if (mode !== 'local') return;
  try { ls()!.setItem(SAVE_KEY, JSON.stringify(s)); } catch { mode = 'memory'; }
}

let save = read();
const cache = new Map<string, NodeState>();
const memo = new Map<string, unknown>();
function once<T>(key: string, f: () => T): T {
  if (!memo.has(key)) memo.set(key, f());
  return memo.get(key) as T;
}
function clear() { cache.clear(); memo.clear(); }
const DEV = (() => { try { return !!import.meta.env?.DEV; } catch { return false; } })();
export const SESSION = Math.random().toString(36).slice(2, 10);

/** Evidence in effect: the learner's own attempts, or in tester mode only the tester's
 *  disposable ones. The two never mix. */
const real = () => save.attempts.filter((a) => (save.tester ? !!a.syn : !a.syn));

/** Lesson revisions whose evidence is still valid under the current task contract (set by content).
 *  Attempts under an older contract stay in the history as prior progress, not as a current check. */
let validRevs: (node: string) => string[] | undefined = () => undefined;
export const setRevPolicy = (f: typeof validRevs) => { validRevs = f; clear(); };
const current = (a: Attempt) => { const v = validRevs(a.node); return !v || (!!a.rev && v.includes(a.rev)); };

export const store = {
  get: () => save,
  storage: (): StorageMode => mode,
  update(fn: (s: Save) => void) { fn(save); write(save); clear(); },
  /** Real time; the dev clock offset only in development builds. */
  now: () => Date.now() + (DEV ? save.clockOffset : 0),
  devClock: DEV,
  record(a: Omit<Attempt, 'at' | 'sess' | 'rev' | 'syn'> & { rev?: string }) {
    store.update((s) => s.attempts.push({ rev: contentRev, ...a, at: store.now(), sess: SESSION, ...(s.tester ? { syn: true } : {}) }));
  },
  log(e: Omit<LogEvent, 'at' | 'sess' | 'syn'>) {
    store.update((s) => s.events.push({ ...e, at: store.now(), sess: SESSION, ...(s.tester ? { syn: true } : {}) }));
  },
  /** Attempts that count as evidence under the current contract. */
  attemptsOf: (node: string) => real().filter((a) => a.node === node && current(a)),
  /** Everything recorded for a node, including history under an earlier contract. */
  historyOf: (node: string) => real().filter((a) => a.node === node),
  state(node: string): NodeState {
    let st = cache.get(node);
    if (!st) { st = nodeState(store.attemptsOf(node)); cache.set(node, st); }
    return st;
  },
  /** Done in an earlier lesson version whose task contract has since changed. Lights the map,
   *  never counts as a current check. */
  prior: (node: string) => once(`p${node}`, () => {
    if (!validRevs(node) || store.checked(node)) return false;
    const old = real().filter((a) => a.node === node && !current(a));
    return old.length > 0 && nodeState(old).checked;
  }),
  note: (): SaveNote => note,
  /** Checked here with this node's own independent evidence. */
  checked: (node: string) => store.state(node).checked,
  /** Practised with help (guided), not checked. */
  helped: (node: string) => !store.state(node).checked && store.state(node).helped,
  /** Lit on the map and counted for world progress: checked or practised with help. */
  lit: (node: string) => store.checked(node) || store.state(node).helped,
  /** Checked later nodes that imply this one through all_of prerequisite groups only.
   *  Never over any_of, strong, support or safety relations; closure membership alone is not inference. */
  inferredFrom: (node: string): string[] => once(`f${node}`, () => (store.checked(node) ? [] : allOfDescendants(node).filter((d) => store.checked(d)))),
  inferred: (node: string) => store.inferredFrom(node).length > 0,
  /** Opens routes on the map: checked, practised with help, or inferred. Never a hard lock. */
  known: (node: string) => store.lit(node) || store.inferred(node) || store.prior(node),
  /** Deferred and not touched since. */
  deferred: (node: string) => once(`d${node}`, () => {
    const d = save.events.filter((e) => e.type === 'defer' && e.node === node && !e.syn).at(-1);
    return !!d && !store.attemptsOf(node).some((a) => a.at > d.at);
  }),
  due: (node: string) => {
    const st = store.state(node);
    return st.checked && st.dueAt !== undefined && st.dueAt <= store.now();
  },
  quiet: () => save.quietUntil > Date.now(),
  reset() { save = fresh(); write(save); clear(); },
  /** Tester mode: throw away the tester's disposable answers and game; the learner's stay. */
  resetTester() { store.update((s) => { s.attempts = s.attempts.filter((a) => !a.syn); s.events = s.events.filter((e) => !e.syn); s.testerGame = undefined; }); },
  /** Tests and import: replace the save. */
  load(s: Partial<Save>) { save = { ...fresh(), ...s, attempts: s.attempts ?? [], events: s.events ?? [] }; clear(); },
  /** For tests: read again from storage, as on a page load. */
  reload() { save = read(); clear(); },
  /** For tests: pretend storage is (un)available. */
  setStorageMode(m: StorageMode) { mode = m; },
};

/** Everything an adult or tester needs to reproduce what happened, as one JSON document. */
export function exportData(extra: Record<string, unknown> = {}) {
  return {
    format: 'sammakko-lite-export',
    version: SAVE_VERSION,
    exportedAt: new Date().toISOString(),
    graph: GRAPH_SHA,
    contentRev,
    storage: mode,
    ...extra,
    save,
  };
}

export const _memory = () => memory;
