import type { PageDraw } from '../pages';
import { cards } from '../figures';

/** Choosing plus or minus from what happened. */
export const DRAW: Record<string, () => PageDraw> = {
  'M-ADD-SUB-SELECT': () => ({ beats: [undefined,
    cards({ cards: [{ icon: '➕', title: 'tuli lisää', text: 'plus', tone: 'cool' }, { icon: '➖', title: 'lähti pois', text: 'miinus', tone: 'warm' }, { icon: '⚖️', title: 'verrataan', text: 'miinus', tone: 'warm' }], label: 'Mitä tapahtui? Se ratkaisee laskun' }),
  ] }),
};
