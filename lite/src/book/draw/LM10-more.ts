import type { PageDraw } from '../pages';
import { numberLine } from '../figures';

/** A rise moves right on the number line. */
export const DRAW: Record<string, () => PageDraw> = {
  'M-NEG-04': () => ({ beats: [
    numberLine({ from: -2, to: 7, step: 1, marks: [{ at: 2, text: 'alku', color: '#176b65' }, { at: 6, text: '6' }], jumps: [{ from: 2, to: 6, text: '+4: neljä askelta oikealle' }], label: 'Nousu +4 vie luvusta 2 lukuun 6' }),
  ] }),
};
