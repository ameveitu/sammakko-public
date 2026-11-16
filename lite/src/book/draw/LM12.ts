import type { PageDraw } from '../pages';
import { C, arrow, cards, figure, pill, tx } from '../figures';

/** Loikka on a map, facing down (south): the right hand points to the map's left (west). */
const facingDown = () => {
  let s = `<rect x="100" y="26" width="200" height="150" rx="8" fill="#eef5e6" stroke="${C.line}" stroke-width="2"/>`;
  s += tx(200, 20, 'pohjoinen', { size: 12, fill: C.soft }) + tx(200, 192, 'etelä', { size: 12, fill: C.soft })
    + tx(94, 105, 'länsi', { size: 12, fill: C.soft, anchor: 'end' }) + tx(306, 105, 'itä', { size: 12, fill: C.soft, anchor: 'start' });
  s += `<circle cx="200" cy="96" r="16" fill="${C.leaf}" stroke="${C.ink}" stroke-width="2"/><circle cx="194" cy="104" r="3" fill="${C.ink}"/><circle cx="206" cy="104" r="3" fill="${C.ink}"/>`
    + arrow(200, 114, 200, 160, { color: C.ink, width: 2.5 }) + tx(210, 150, 'katse', { size: 12, anchor: 'start' })
    + arrow(182, 96, 118, 96, { color: C.red, width: 3 }) + pill(150, 82, 'oikea käsi', { size: 12, stroke: C.red });
  return figure(400, 200, s, 'Katse alas: oikea käsi kartan vasempaan reunaan');
};

/** Directions: map directions stay put, left and right turn with you. */
export const DRAW: Record<string, () => PageDraw> = {
  'M-GEO-03': () => ({ beats: [undefined,
    cards({ cards: [{ icon: '🧭', title: 'kartan suunnat', text: 'pysyvät paikallaan', tone: 'cool' }, { icon: '🐸', title: 'Loikan vasen ja oikea', text: 'kääntyvät mukana', tone: 'warm' }], label: 'Kartta ei käänny, Loikka kääntyy' }),
    facingDown(),
  ] }),
};
