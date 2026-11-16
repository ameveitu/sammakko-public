import type { PageDraw } from '../pages';
import { numberLine } from '../figures';

/** Negative numbers on the line: change moves right or left, through zero. */
export const DRAW: Record<string, () => PageDraw> = {
  'M-NEG-04': () => ({ beats: [undefined,
    numberLine({ from: -4, to: 3, step: 1, marks: [{ at: 2, text: 'alku', color: '#176b65' }, { at: -3, text: '−3', color: '#e0533f' }], jumps: [{ from: 2, to: 0, text: '2 askelta' }, { from: 0, to: -3, text: '3 askelta' }], label: 'Viisi askelta alas: nollan yli lukuun −3' }),
  ] }),
};
