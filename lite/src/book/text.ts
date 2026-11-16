import type { Paint } from '../engine/types';
import type { FeedbackText } from './types';

/**
 * Rewritten theory-book text for a node. The pictures and 3D models still come from the node's own
 * model steps; this layer only chooses which ones to show and what to say about them.
 * Files in `./text/<familyId>.ts` export `TEXT: Record<nodeId, PageText>`.
 */
export interface PageText {
  /** Display/speech wording only; never mutates generated or recorded items/verdicts. */
  feedbackText?: FeedbackText;
  /** 1–3 beats. Each beat is at most two short sentences (about 25 words). */
  beats: BeatText[];
  /**
   * - 'auto': keep the generated one-move try of the node (one tap or one number).
   * - 'none': the page is pure explanation.
   * - an authored choice question that continues the last beat.
   */
  try: 'auto' | 'none' | AuthoredTry;
  /** false: leave out the try's painted picture when it only repeats or gives away the question. */
  tryFigure?: false;
  /** Page title when the node's stop name covers only part of the page. */
  title?: string;
  /** A clearer question for the generated try (it must fit every generated case). */
  trySay?: string;
}

export interface BeatText {
  text: string;
  /** Detail behind "Lisää". */
  more?: string;
  /** A worked example's question shown above the text. */
  example?: string;
  /** Index of the default beat whose picture and 3D model this beat shows; null for no picture. Default: the same index. */
  pic?: number | null;
  /** false: hide the painted picture of `pic` (when it is only text) but keep its 3D model. */
  figure?: false;
  /** A picture drawn by the book itself (see `book/figures/`). Replaces the painted picture of `pic`; its 3D model stays. */
  draw?: Paint;
}

export interface AuthoredTry {
  /** The question, one sentence. */
  say: string;
  /** 2–4 short options. Shown in a seed-dependent order. */
  options: string[];
  /** Index of the right option in `options`. */
  answer: number;
  /** One or two sentences: why the right answer is right. Shown after any answer. */
  explain: string;
  /** Optional one-line reason for each wrong option (null for the right one). */
  why?: (string | null)[];
  /** A picture for the question (see `book/figures/`). Default: none. */
  draw?: Paint;
}

export const TEXT_LIMITS = { beatChars: 190, moreChars: 320, sayChars: 140, optionChars: 60, explainChars: 220 } as const;
