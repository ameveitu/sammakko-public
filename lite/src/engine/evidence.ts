import type { Phase } from './types';

/** Where an answer came from. Only 'independent', 'transfer', 'quick' and a delayed
 *  'retrieval' can make a node checked; 'guided' and 'practice' never do. */
export type AttemptPhase = Phase | 'quick' | 'practice';

/** Kinds of help that were visible when the answer was given. */
export type Help = 'demo' | 'hint' | 'retry' | 'support' | 'reveal' | 'words';

/** One answered task, with what is needed to reproduce it. */
export interface Attempt {
  node: string;
  phase: AttemptPhase;
  ok: boolean;
  /** Case of the item (answer class); 'transfer' for transfer items. */
  tag: string;
  at: number; // ms
  /** Item seed: spec.item(rng(seed), itemPhase) reproduces the exact item. */
  seed?: number;
  /** Optional exact structured item identity; new Saaristo content only. No learner text. */
  itemKey?: string;
  /** Content revision of the node when answered. */
  rev?: string;
  /** Compact learner response (JSON). */
  resp?: string;
  /** An explicit human observation; absence denotes the existing automatic task checker. */
  assessor?: 'adult';
  /** Adult review was off: an attached own explanation was left out, or a pure explanation was a guided self-check. */
  unreviewed?: boolean;
  help?: Help[];
  /** Lesson mode: learn / direct / retrieval / quick / practice / support. */
  mode?: string;
  /** Session id (one page load). */
  sess?: string;
  /** Support detour: the topic the learner came from and returns to. */
  from?: string;
  /** Synthetic QA data, never mixed with a learner's evidence. */
  syn?: boolean;
  /** Imported from the earlier Lite save format. */
  legacy?: boolean;
  /** The mathematical answer was right (set when it can differ from `ok`). */
  math?: boolean;
  /** A stated procedure (e.g. mark every object once) was completed. proc === false with a
   *  correct answer is neutral evidence: it neither extends nor resets the streak. */
  proc?: boolean;
  /** Scenario of a motion/time trial (JSON): initial conditions, control log, shown views. */
  scn?: string;
  /** Exact replay of an item already answered: familiar, never a fresh assessment. */
  replay?: boolean;
  /** Game mission this answer was given in (the route is in `mode`). */
  mission?: string;
}

/** The answer was visible before answering (e.g. the covered stopwatch was opened): a correct answer
 *  may be read, not calculated (review U01). */
export const exposed = (a: Attempt) => !!a.help?.includes('reveal');

/** Neutral attempts are kept in the history but do not move the evidence either way. A correct answer
 *  after the answer was revealed is neutral; a wrong one still counts as wrong. */
export const neutral = (a: Attempt) => a.replay === true || (a.proc === false && a.math === true) || (exposed(a) && a.ok);

/** Adult ratio of independent answers: fresh assessments only, neutral ones counted apart. */
export function independentRatio(at: Attempt[]): { ok: number; n: number; neutral: number } {
  const all = at.filter((a) => a.phase === 'independent' || a.phase === 'transfer');
  const fresh = all.filter((a) => !neutral(a));
  return { ok: fresh.filter((a) => a.ok).length, n: fresh.length, neutral: all.length - fresh.length };
}

export interface NodeState {
  /** Checked here: 3 consecutive correct independent answers covering 2 cases, then 1 transfer; or the quick check. */
  checked: boolean;
  checkedAt?: number;
  quick?: boolean;
  /** Practised with help: at least 2 correct guided answers. Earns world progress, never counts as checked. */
  helped: boolean;
  /** Time of the latest successful delayed recall (at least RULES.delayMs after the previous attempt). */
  retained?: number;
  /** The latest delayed recall failed and no later delayed recall has succeeded. */
  recallFailed: boolean;
  /** Recent difficulty: a failed delayed recall not yet followed by steady success,
   *  or at least 2 wrong among the last 4 non-guided answers. */
  difficulty: boolean;
  /** When a delayed recall becomes available (checked, not yet retained). */
  dueAt?: number;
  last?: number;
  /** Progress towards checked. */
  streak: number;
  tags: number;
  /** Production rule nodes only: a correct non-guided answer in a production family was seen. A node
   *  checked under an older revision may be checked with produced false: report it as recognition. */
  produced?: boolean;
  transfer: number;
  guidedOk: number;
}

export const RULES = {
  streak: 3, // consecutive correct independent answers
  distinctTags: 2, // ...covering at least this many different cases
  transfer: 1, // correct transfer answers after the streak
  quick: 2, // foundation quick check: 2 correct in a row
  helped: 2, // correct guided answers for "practised with help"
  delayMs: 20 * 60 * 60 * 1000, // a recall counts as delayed only after 20 h without this node
  recent: 4, // window for recent difficulty
  recentWrong: 2,
  steady: 3, // correct non-guided answers that clear a failed recall's difficulty flag
};

const nonGuided = (a: Attempt) => a.phase !== 'guided' && !neutral(a);

/** Derive a node's state from its attempts (oldest first). Pure function. */
/** Production rule for a node: the families that count as production, and the revisions under
 *  which the rule applies (older answers were collected without it and stay valid as they were). */
export interface ProduceRule { tags: string[]; revs: string[] }

export function nodeState(all: Attempt[], produce?: ProduceRule): NodeState {
  const attempts = all; // caller filters synthetic data
  let checked = false, checkedAt: number | undefined, quick = false;
  let streak: Attempt[] = [];
  let transferOk = 0, quickOk = 0, guidedOk = 0;
  let retained: number | undefined;
  let recallFailedAt: number | undefined;
  let prev: number | undefined;
  let produced = false;

  for (const a of attempts) {
    if (neutral(a)) continue;
    const delayed = prev !== undefined && a.at - prev >= RULES.delayMs;
    // A production answer counts whenever it is given, also after an earlier check (review U03).
    if (a.phase !== 'guided' && a.ok && produce?.tags.includes(a.tag) && a.rev && produce.revs.includes(a.rev)) produced = true;
    if (a.phase === 'guided') { if (a.ok) guidedOk++; }
    else if (!checked) {
      // The production rule applies to answers given under a revision that has it.
      const gate = !!produce && !produced && !!a.rev && produce.revs.includes(a.rev);
      if (a.phase === 'independent' || a.phase === 'practice' || a.phase === 'retrieval') {
        if (a.ok) streak.push(a); else { streak = []; transferOk = 0; }
      } else if (a.phase === 'transfer') {
        if (a.ok && streak.length >= RULES.streak) transferOk++;
        else if (!a.ok) transferOk = 0;
      } else if (a.phase === 'quick') {
        quickOk = a.ok ? quickOk + 1 : 0;
      }
      const tags = new Set(streak.map((s) => s.tag)).size;
      if (gate) { /* every other condition may be met, but nothing was written or built yet */ }
      else if (streak.length >= RULES.streak && tags >= RULES.distinctTags && transferOk >= RULES.transfer) {
        checked = true; checkedAt = a.at;
      } else if (quickOk >= RULES.quick) {
        checked = true; checkedAt = a.at; quick = true;
      }
    } else if (a.phase === 'retrieval' && delayed) {
      // Only a recall after a real pause tells about retention.
      if (a.ok) { retained = a.at; recallFailedAt = undefined; }
      else { retained = undefined; recallFailedAt = a.at; }
    }
    prev = a.at;
  }

  const ng = attempts.filter(nonGuided);
  const recent = ng.slice(-RULES.recent);
  const recentWrong = recent.filter((a) => !a.ok).length >= RULES.recentWrong;
  const sinceFail = recallFailedAt === undefined ? [] : ng.filter((a) => a.at > recallFailedAt!);
  const failOpen = recallFailedAt !== undefined && !(sinceFail.length >= RULES.steady && sinceFail.slice(-RULES.steady).every((a) => a.ok));
  const last = attempts.at(-1)?.at;
  return {
    checked, checkedAt, quick: checked ? quick : undefined,
    helped: guidedOk >= RULES.helped,
    retained,
    recallFailed: recallFailedAt !== undefined,
    difficulty: recentWrong || failOpen,
    dueAt: checked && retained === undefined && last !== undefined ? last + RULES.delayMs : undefined,
    last,
    streak: streak.length,
    ...(produce ? { produced } : {}),
    tags: new Set(streak.map((s) => s.tag)).size,
    transfer: transferOk,
    guidedOk,
  };
}

/** Status words for the adult view (never a probability). */
export type Status = 'unchecked' | 'helped' | 'checked' | 'retained' | 'inferred' | 'deferred';
