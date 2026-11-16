import type { PageDraw } from '../pages';
import { numberLine } from '../figures';

/** Integers on the number line: steps, midpoints, distances. */
export const DRAW: Record<string, () => PageDraw> = {
  'M79-INT-01': () => ({ beats: [undefined, undefined,
    numberLine({ from: -6, to: 3, step: 1, marks: [{ at: -5, text: '−5' }, { at: -1, text: 'tästä', color: '#176b65' }, { at: 2, text: '2' }], label: 'Kumpi on lähempänä lukua −1?' }),
  ] }),
};
