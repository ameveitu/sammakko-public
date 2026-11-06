import { STORY_ORDER, storyProgress } from './story-route';
import { catalogNode, requiredAncestors } from './catalog';
import { neutral, nodeState, RULES, type Attempt, type Help, type NodeState } from './evidence';
import type { NodeSpec } from './types';

export const JOURNEY_KEY = 'sammakko-journey-3';
export const JOURNEY_BACKUP_KEY = `${JOURNEY_KEY}.backup`;

export interface JourneyEvent {
  id: string;
  node: string;
  at: number;
  assisted: boolean;
}
export interface JourneySave {
  v: 3;
  attempts: Attempt[];
  events: JourneyEvent[];
  effects: string[];
  storyStops: string[];
}
export interface JourneyNote {
  mode: 'local' | 'memory';
  issue?: 'unavailable' | 'corrupt';
  backedUp?: boolean;
}

export interface JourneyObservation {
  state: NodeState;
  streak: number;
  streakFamilies: ReadonlySet<string>;
  target: number;
  readyTransfer: boolean;
}

type JourneyStorage = Pick<Storage, 'getItem' | 'setItem'>;
const phases = new Set(['guided', 'independent', 'transfer', 'retrieval', 'quick', 'practice']);
const helpKinds: ReadonlySet<Help> = new Set(['demo', 'hint', 'retry', 'support', 'reveal', 'words']);
const stringFields = ['rev', 'resp', 'mode', 'sess', 'from', 'scn', 'mission', 'itemKey'];
const booleanFields = ['syn', 'legacy', 'math', 'proc', 'replay', 'unreviewed'];
const fresh = (): JourneySave => ({ v: 3, attempts: [], events: [], effects: [], storyStops: [] });
const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const time = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;

function validAttempt(value: unknown): value is Attempt {
  if (!object(value) || typeof value.node !== 'string' || !catalogNode(value.node) ||
    !time(value.at) || typeof value.ok !== 'boolean' || typeof value.tag !== 'string' ||
    typeof value.phase !== 'string' || !phases.has(value.phase)) return false;
  return (value.help === undefined || (Array.isArray(value.help) && value.help.every((kind) => helpKinds.has(kind)))) &&
    (value.assessor === undefined || value.assessor === 'adult') &&
    (value.seed === undefined || (typeof value.seed === 'number' && Number.isSafeInteger(value.seed))) &&
    stringFields.every((key) => value[key] === undefined || typeof value[key] === 'string') &&
    booleanFields.every((key) => value[key] === undefined || typeof value[key] === 'boolean');
}

function validEvent(value: unknown): value is JourneyEvent {
  return object(value) && typeof value.node === 'string' && typeof value.id === 'string' &&
    catalogNode(value.node)?.eventId === value.id && time(value.at) && typeof value.assisted === 'boolean';
}

function effectsFor(events: JourneyEvent[]): string[] {
  return events.map((event) => catalogNode(event.node)!.effectId);
}

function decode(raw: string): JourneySave | undefined {
  let data: unknown;
  try { data = JSON.parse(raw); } catch { return undefined; }
  if (!object(data) || data.v !== 3 || !Array.isArray(data.attempts) || !data.attempts.every(validAttempt) ||
    !Array.isArray(data.events) || !data.events.every(validEvent) || !Array.isArray(data.effects)) return undefined;
  const expected = new Set(effectsFor(data.events));
  const effects = new Set(data.effects);
  if (effects.size !== expected.size || [...effects].some((id) => !expected.has(id))) return undefined;
  // v3 saves made before story navigation only have attempts, events and effects.
  const storyStops = data.storyStops === undefined ? [] : data.storyStops;
  if (!Array.isArray(storyStops) || !storyStops.every(id => typeof id === 'string' && !!catalogNode(id))) return undefined;
  return { v: 3, attempts: data.attempts, events: data.events, effects: data.effects, storyStops };
}

function attemptKey(attempt: Attempt): string {
  const { sess, at, node, phase, tag, seed, resp, ok, rev, syn, assessor } = attempt;
  return JSON.stringify([sess, at, node, phase, tag, seed, resp, ok, rev, syn, assessor]);
}

function merge(left: JourneySave, right: JourneySave): JourneySave {
  const attempts = new Map<string, Attempt>();
  for (const attempt of [...left.attempts, ...right.attempts]) {
    const key = attemptKey(attempt);
    if (!attempts.has(key)) attempts.set(key, attempt);
  }
  const events = new Map<string, JourneyEvent>();
  for (const event of [...left.events, ...right.events]) {
    const previous = events.get(event.id);
    if (!previous || event.at < previous.at || (event.at === previous.at && event.assisted)) {
      events.set(event.id, event);
    }
  }
  const mergedEvents = [...events.values()].sort((a, b) => a.at - b.at || a.id.localeCompare(b.id));
  // Stable timestamp sort retains recorded order for multiple answers in one clock tick.
  const orderedAttempts = [...attempts.values()].sort((a, b) => a.at - b.at);
  return { v: 3, attempts: orderedAttempts, events: mergedEvents, effects: effectsFor(mergedEvents),
    storyStops: [...new Set([...left.storyStops, ...right.storyStops])] };
}

/** An optional callback requires actual experience of a canonical prerequisite event. */
export function canRecall(nodeId: string, ancestorId: string, hasEvent: (eventId: string) => boolean): boolean {
  const ancestor = catalogNode(ancestorId);
  return !!ancestor && requiredAncestors(nodeId).includes(ancestorId) && hasEvent(ancestor.eventId);
}

export function createJourney(storage?: JourneyStorage | null) {
  let active: JourneyStorage | undefined;
  let note: JourneyNote;
  try {
    active = storage === undefined ? globalThis.localStorage : storage ?? undefined;
    note = active ? { mode: 'local' } : { mode: 'memory', ...(storage === null ? {} : { issue: 'unavailable' }) };
  } catch {
    note = { mode: 'memory', issue: 'unavailable' };
  }

  let save = fresh();
  let lastRead: string | null | undefined;
  const session = globalThis.crypto?.randomUUID?.() ?? `journey-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  function latest(): void {
    if (!active) return;
    try {
      const raw = active.getItem(JOURNEY_KEY);
      if (raw === lastRead) return;
      lastRead = raw;
      if (raw === null) return;
      const incoming = decode(raw);
      if (incoming) {
        save = merge(incoming, save);
        return;
      }
      note = { mode: 'memory', issue: 'corrupt', backedUp: false };
      const backup = active.getItem(JOURNEY_BACKUP_KEY);
      if (backup !== null && backup !== raw) {
        active = undefined;
        return;
      }
      if (backup === null) active.setItem(JOURNEY_BACKUP_KEY, raw);
      note = { mode: 'local', issue: 'corrupt', backedUp: true };
    } catch {
      if (note.issue !== 'corrupt') note = { mode: 'memory', issue: 'unavailable' };
      active = undefined;
    }
  }

  function write(): void {
    if (!active) return;
    try {
      const raw = JSON.stringify(save);
      active.setItem(JOURNEY_KEY, raw);
      lastRead = raw;
    } catch {
      active = undefined;
      note = { mode: 'memory', issue: 'unavailable', ...(note.backedUp ? { backedUp: true } : {}) };
    }
  }

  function snapshot(): JourneySave {
    latest();
    return structuredClone(save);
  }

  function eligibleAttempts(id: string, spec: NodeSpec): Attempt[] {
    latest();
    if (spec.id !== id || !catalogNode(id)) return [];
    const revision = spec.rev ?? 'journey-v3';
    return save.attempts
      .filter((attempt) => attempt.node === id && !attempt.syn && (!spec.validRevs || (!!attempt.rev && spec.validRevs.includes(attempt.rev))))
      .map((attempt): Attempt => ({
        ...attempt,
        ...(spec.produce && !attempt.rev ? { rev: revision } : {}),
        // A reveal uses the engine's existing neutral-evidence rule. Other help is guided evidence.
        ...(attempt.help?.some((kind) => kind !== 'reveal') ? { phase: 'guided' } : {}),
      }));
  }

  function assess(spec: NodeSpec, attempts: Attempt[]): NodeState {
    return nodeState(attempts, spec.produce ? { tags: spec.produce, revs: [spec.rev ?? 'journey-v3'] } : undefined);
  }

  latest();
  return {
    get: snapshot,
    storyProgress() { latest(); return storyProgress(save.storyStops, save.attempts); },
    advanceStory(id: string, reviewing = false): string | undefined {
      latest();
      if (!catalogNode(id)) return undefined;
      if (!reviewing && !save.storyStops.includes(id)) {
        save.storyStops.push(id);
        write();
      }
      const progress = storyProgress(save.storyStops, save.attempts);
      if (!reviewing) return progress.next;
      const remaining = new Set(progress.review);
      return STORY_ORDER.slice(STORY_ORDER.indexOf(id) + 1).find(next => remaining.has(next));
    },
    export: snapshot,
    note(): JourneyNote { latest(); return { ...note }; },
    record(attempt: Attempt): boolean {
      if (!validAttempt(attempt)) return false;
      latest();
      const replay = !attempt.syn && save.attempts.some((prior) =>
        !prior.syn && prior.node === attempt.node && prior.rev === attempt.rev &&
        ((attempt.seed !== undefined && prior.seed === attempt.seed) ||
          (attempt.itemKey !== undefined && prior.itemKey === attempt.itemKey)));
      const row: Attempt = { ...structuredClone(attempt), sess: attempt.sess ?? session, ...(replay ? { replay: true } : {}) };
      const pending = { ...fresh(), attempts: [row] };
      save = merge(save, pending);
      write();
      return true;
    },
    state(id: string, spec: NodeSpec): NodeState {
      return assess(spec, eligibleAttempts(id, spec));
    },
    observation(id: string, spec: NodeSpec, requiredFamilies: readonly string[] = []): JourneyObservation {
      const streakFamilies = new Set<string>();
      const target = Math.max(RULES.streak, requiredFamilies.length);
      let streak = 0;
      const ready = () => streak >= target && streakFamilies.size >= RULES.distinctTags
        && requiredFamilies.every((family) => streakFamilies.has(family));
      const attempts = eligibleAttempts(id, spec).filter((attempt) => {
        if (attempt.phase === 'guided') return true;
        if (attempt.phase === 'transfer') return !attempt.ok || ready();
        // A recall remains part of the same evidence timeline: nodeState owns the
        // 20-hour quiet interval and retention outcome. It must not disappear in
        // the UI's family-aware projection after having been saved successfully.
        if (attempt.phase === 'retrieval') return true;
        if (attempt.phase !== 'independent') return false;
        if (!neutral(attempt)) {
          if (attempt.ok) {
            streak++;
            streakFamilies.add(attempt.tag);
          } else {
            streak = 0;
            streakFamilies.clear();
          }
        }
        return true;
      });
      return { state: assess(spec, attempts), streak, streakFamilies, target, readyTransfer: ready() };
    },
    resolve(id: string, assisted: boolean): boolean {
      const node = catalogNode(id);
      if (!node || typeof assisted !== 'boolean') return false;
      latest();
      if (save.events.some((event) => event.id === node.eventId)) return false;
      const events: JourneyEvent[] = [{ id: node.eventId, node: id, at: Date.now(), assisted }];
      save = merge(save, { ...fresh(), events });
      write();
      return true;
    },
    hasEvent(id: string): boolean { latest(); return save.events.some((event) => event.id === id); },
    effectIds(): string[] { latest(); return [...save.effects]; },
  };
}

// Keep the in-memory fallback across hash navigation when browser storage is unavailable.
let activeJourney: ReturnType<typeof createJourney> | undefined;
export function saaristoJourney() { return activeJourney ??= createJourney(); }
