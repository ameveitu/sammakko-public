import type { DemoStep, Item, Paint, Phase } from '../engine/types';

/**
 * Saaristo theory book ("teoriakirja"). One node is one page: a few explanation beats and,
 * when it continues the explanation naturally, one try with a single control.
 */

/** One explanation step: a short text and one picture or 3D view. */
export interface Beat {
  /** At most two short sentences. Longer text is split: the rest goes behind "Lisää". */
  text: string;
  /** A worked example's question, shown above the explanation. */
  example?: string;
  /** Extra detail behind "Lisää". */
  more?: string;
  /** 2D picture on the desk. */
  scene?: Paint;
  /** The demo step or item whose 3D model is shown on the Saaristo stage. */
  step?: Item | DemoStep;
  /** A named view of the page's own 3D stage. */
  view?: string;
}

/** A try is one question with one control. Tapping or entering the answer checks it at once. */
export interface Try {
  item: Item;
  seed: number;
  phase: Phase;
  /** Suffix of the node revision recorded with the answer. Authored tries use `kirja1`. */
  rev?: string;
  /** View of the page's own stage while the try is open. */
  view?: string;
}

/** An authored 3D stage drawn on its own canvas above the pond. */
export interface BookStage {
  /** Shows a beat's (or a try's) view. */
  show(view: string): void;
  /**
   * Lets the learner answer by moving the 3D model. The stage calls `answer` with the choice index.
   * Returns true when the 3D model is the whole control: the option buttons are then only for the keyboard
   * and screen readers.
   */
  arm?(view: string, answer: (index: number) => void): boolean | void;
  /** Shows the correct state after an answer, with a consequence animation. */
  reveal?(view: string, correct: number, chosen: number): void;
  resize(): void;
  setPaused(paused: boolean): void;
  dispose(): void;
}

export interface StageOptions {
  assets: (path: string) => string;
  reducedMotion: boolean;
}

/** A page-specific presentation of legacy feedback; evidence retains the original text. */
export type FeedbackText = (text: string) => string;

export interface BookPage {
  feedbackText?: FeedbackText;
  id: string;
  beats: Beat[];
  /** Makes a fresh try (`part` of `tries`), or nothing when the page is pure explanation. */
  makeTry?: (seed: number, part: number) => Try | undefined;
  /** Tries in a row after the beats. Default 1. */
  tries?: number;
  /** false: the try's question says everything, so its painted picture is left out (the 3D model stays). */
  tryFigure?: false;
  /** Page title. Default: the node's stop name. */
  title?: string;
  /** An authored 3D stage. Without one, the pond and the node's own stage model are shown. */
  stage?: (host: HTMLElement, options: StageOptions) => BookStage;
}
