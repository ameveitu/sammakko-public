import type { Rng } from './rng';

export type Phase = 'guided' | 'independent' | 'transfer' | 'retrieval';

/** A short, child-facing learning objective (shown at the start of a lesson). */
export type Goal = string;

/** Draws a visual into the host. May return a cleanup (for animations). */
export type Paint = (host: HTMLElement) => void | (() => void);

export interface Verdict {
  ok: boolean;
  /** Specific feedback for this particular wrong answer, if known. */
  why?: string;
  /** Was the mathematical answer (e.g. the total) correct? Set when it can differ from `ok`. */
  math?: boolean;
  /** Was a required procedure (e.g. marking every object once) completed? */
  proc?: boolean;
}

export interface Option {
  art?: string; // SVG markup
  big?: string; // large numeral / short symbol
  text?: string; // written label (avoid for pre-readers)
  speak?: string; // spoken on the separate listen button
  /** Shown in writing in quiet mode when `speak` carries the content. */
  quiet?: string;
}

export interface Token {
  id: string;
  art?: string;
  text?: string;
  speak?: string;
}

export interface Slot {
  id: string;
  art?: string;
  text?: string;
  /** How many tokens fit. Default 1. */
  size?: number;
}

/** The twelve interaction types. Every task knows its own correct answer. */
export type Task =
  | { kind: 'choice'; options: Option[]; answer: number; why?: (string | undefined)[]; cols?: number }
  /** With `count`, any selection of exactly that many options is correct ("give me N"). */
  | { kind: 'multi'; options: Option[]; answer: number[]; count?: number; cols?: number; why?: (string | undefined)[] }
  /** Counting a set of objects.
   *  mode 'total' (default): only the total decides; tapping marks is an optional aid.
   *  mode 'marking': explicit one-to-one practice; marking each object once is a stated, required
   *  procedure, judged separately from the total.
   *  `words`: each tap shows and says the next number word (supplied assistance).
   *  `ask`: the learner answers "how many?" themselves. */
  | { kind: 'tapcount'; objects: { x: number; y: number; thing: string }[]; w: number; h: number; words?: boolean; ask?: boolean; mode?: 'total' | 'marking' }
  /** slot id → token id. `start` pre-fills slots (for "fix the mix-up" tasks). */
  | { kind: 'place'; tokens: Token[]; slots: Slot[]; answer: Record<string, string | null>; start?: Record<string, string | null>; why?: Record<string, string> }
  /** Two ribbons (lengths in grid units) that may start at different points. */
  | { kind: 'ribbons'; a: number; b: number; offsetA: number; offsetB: number }
  | { kind: 'numeric'; answer: number; tolerance?: number; unit?: string; label?: string; whyAt?: Record<number, string> }
  /** Mark the points (xs[i], ys[i]) on a grid. xMin/yMin (default 0) may be negative: all four quadrants. */
  | { kind: 'plot'; xs: number[]; ys: number[]; xMax: number; yMax: number; xLabel: string; yLabel: string; xStep: number; yStep: number; xMin?: number; yMin?: number }
  /** Tap the right spot on a number line from min to max (ticks every `step`, numbers every `labelEvery`). */
  | { kind: 'line'; min: number; max: number; step: number; answer: number; labelEvery?: number; unit?: string; whyAt?: Record<number, string> }
  /** Build an expression or equation from reusable token buttons. Accepted when equivalent to
   *  `target`: 'expr' same value for all variable values, 'eq' an equivalent linear equation,
   *  'fact' a true number sentence with the same numbers and operations, 'seq' exactly the
   *  tokens of `target` (space separated) in that order (e.g. the counting words). */
  | { kind: 'build'; tokens: string[]; target: string; mode: 'expr' | 'eq' | 'fact' | 'seq'; max?: number; whyAt?: Record<string, string> }
  /** Record each observation in `items` (category keys, in order) as a tally mark. */
  | { kind: 'tally'; items: string[]; cats: { key: string; label: string; icon: string }[] }
  /** List every pair (one from `a`, one from `b`) exactly once. */
  | { kind: 'combos'; a: string[]; b: string[]; aLabel: string; bLabel: string }
  /** Enter a fraction; any equivalent fraction is accepted. */
  | { kind: 'frac'; n: number; d: number }
  /** Lay equal unit pieces end to end under a ribbon `len` units long, then say it is done. */
  | { kind: 'iterate'; len: number }
  /** Turn the clock hands in half-hour steps to h.mm (m is 0 or 30); `start` is the starting hour. */
  | { kind: 'clock'; h: number; m: number; start?: number }
  /** Deal a pile of n things to Loikka and Aava, one tap per thing; fair when both get n/2. */
  | { kind: 'deal'; n: number; thing: string }
  /** Fill k bags so each holds g things (tap a bag to drop one in); `pile` limits the supply. */
  | { kind: 'pack'; k: number; g: number; thing: string; pile?: number }
  /** Fill bags of g from a pile of n until it runs out; the answer is the number of bags. */
  | { kind: 'bagup'; n: number; g: number; thing: string }
  /** Build a tower k times as tall as a tower of a blocks, one block at a time. */
  | { kind: 'stack'; a: number; k: number }
  | { kind: 'balance'; left: number[]; right: number[] }
  | { kind: 'bundle'; n: number }
  | { kind: 'reeds'; target: number; tens?: number; from?: number }
  /** Cut a row of b pebbles into two parts so that a ± (first part) is a whole ten. */
  | { kind: 'cut'; a: number; b: number; op: '+' | '-' }
  /** Build an array of `rows` rows with `cols` things in each. */
  | { kind: 'grid'; rows: number; cols: number; thing: string }
  /** Weigh labelled packages two at a time on a balance (hidden weights w), then pick the heaviest
   *  (or the lightest when `light`). */
  | { kind: 'weigh'; names: string[]; w: number[]; light?: boolean }
  /** Put weight packets (grams in `packs`) on a kitchen scale until it shows `target` grams. */
  | { kind: 'grams'; target: number; packs: number[] }
  /** Try pouring a full vessel into the other (either way), then tell which holds more (0 = a, 1 = b, 2 = same). */
  /** Sort every item into one of the bins `cats` (answer[i] = bin of item i); why[i] if item i is misplaced. */
  | { kind: 'sort'; items: Option[]; cats: { label: string; art?: string }[]; answer: number[]; why?: (string | undefined)[] }
  /** Continue a pattern: `shown` is the start, the learner fills answer.length empty places by
   *  tapping `palette` pictures (reusable); why[i] if place i is wrong. */
  | { kind: 'extend'; shown: Option[]; palette: Option[]; answer: number[]; why?: (string | undefined)[] }
  /** Pour 1 dl cups into a measuring jug of `cap` dl until it holds `target` dl. */
  | { kind: 'fill'; target: number; cap: number }
  | { kind: 'pourtest'; a: 'kannu' | 'muki' | 'lasi' | 'pullo' | 'ampari'; b: 'kannu' | 'muki' | 'lasi' | 'pullo' | 'ampari'; capA: number; capB: number; la: string; lb: string };

export type Response =
  | { kind: 'choice'; index: number }
  | { kind: 'multi'; indices: number[] }
  | { kind: 'tapcount'; taps: number[]; count?: number }
  | { kind: 'place'; map: Record<string, string | null> }
  | { kind: 'ribbons'; choice: 'A' | 'B' | '=' }
  | { kind: 'numeric'; value: number }
  | { kind: 'plot'; points: [number, number][] }
  | { kind: 'line'; value: number }
  | { kind: 'build'; seq: string[] }
  | { kind: 'tally'; counts: Record<string, number> }
  | { kind: 'combos'; pairs: [number, number][] }
  | { kind: 'frac'; n: number; d: number }
  | { kind: 'iterate'; count: number }
  | { kind: 'clock'; h: number; m: number }
  | { kind: 'deal'; a: number; b: number }
  | { kind: 'pack'; counts: number[] }
  | { kind: 'bagup'; count: number }
  | { kind: 'stack'; n: number }
  | { kind: 'balance'; n: number }
  | { kind: 'bundle'; count: number }
  | { kind: 'reeds'; t: number; o: number }
  | { kind: 'cut'; at: number }
  | { kind: 'grid'; rows: number; cols: number }
  | { kind: 'weigh'; pick: number }
  | { kind: 'grams'; g: number }
  | { kind: 'pourtest'; pick: number }
  | { kind: 'fill'; dl: number }
  | { kind: 'sort'; bins: number[] }
  | { kind: 'extend'; picks: number[] };

export interface Item {
  /** Instruction. Spoken aloud in the small world. Keep it short. */
  say: string;
  scene?: Paint;
  task: Task;
  /** Support shown from the start in the guided phase. */
  hint?: string;
  /** The correct reasoning, shown after any wrong answer. */
  explain: string;
  /** Case / answer class, used for coverage and balance checks. */
  tag: string;
  /** A listening task. In quiet mode it is avoided; if it still comes up,
   *  this instruction is used and options show their `quiet` text. */
  listen?: { say: string };
  /** Motion scenario shown by the shared player (recorded with the answer). */
  scn?: string;
}

export interface DemoStep {
  say: string;
  scene: Paint;
}

export interface NodeSpec {
  id: string;
  /** Child-facing name of the stop on the map (never a curriculum term). */
  stop: string;
  icon: string;
  /** One story sentence: why are we doing this? */
  intro: string;
  /** Story consequence after the node is learned. */
  reward: string;
  /** Child-facing objective: "Opit ...". Filled for every node by the registry if missing. */
  goal?: string;
  /** Content revision of this lesson; bump when the items change meaning. Recorded on every
   *  attempt (the global content revision is only the fallback). */
  rev?: string;
  /** Lesson revisions whose evidence is valid under the current task contract. Older answers stay
   *  in the history as prior progress (shown honestly), not as a current check. */
  validRevs?: string[];
  demo: (r: Rng) => DemoStep[];
  item: (r: Rng, phase: Phase) => Item;
}
