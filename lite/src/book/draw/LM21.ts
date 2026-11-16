import type { PageDraw } from '../pages';
import type { Paint } from '../../engine/types';
import { bars, C, cards, figure, formula, pill, tx } from '../figures';

/** A see-through bag with two red tokens, and events with their verdicts beside it. */
function bag(events: [string, string, string][], label: string): Paint {
  let s = `<path d="M70 58 q-34 62 -6 116 h104 q28 -54 -6 -116 z" fill="#f4efe2" stroke="${C.ink}" stroke-width="2.5"/><path d="M76 58 q42 -16 84 0" fill="none" stroke="${C.ink}" stroke-width="2.5"/><path d="M106 50 l12 -14 l12 14" fill="none" stroke="${C.soft}" stroke-width="2.5"/>`;
  for (const [x, y] of [[96, 140], [140, 132]]) s += `<circle cx="${x}" cy="${y}" r="17" fill="${C.red}" stroke="${C.ink}" stroke-width="2"/>`;
  s += tx(118, 198, '2 punaista', { size: 14, fill: C.soft });
  events.forEach(([event, verdict, color], i) => {
    const y = 84 + i * 58;
    s += tx(230, y, event, { size: 15, anchor: 'start' }) + pill(230, y + 26, verdict, { size: 14, stroke: color, anchor: 'start' });
  });
  return figure(400, 212, s, label);
}


/** Statistics and chance: level out the columns, count how often, sort what can happen. */
export const DRAW: Record<string, () => PageDraw> = {
  'M-STAT-04': () => ({ beats: [
    bars({ bars: [{ label: '1. sarake', value: 1, text: '1 palikka' }, { label: '2. sarake', value: 4, text: '4 palikkaa' }, { label: '3. sarake', value: 7, text: '7 palikkaa' }], max: 8, axis: 'palikoita', label: 'Sarakkeissa 1, 4 ja 7 palikkaa, yhteensä 12' }),
  ] }),
  'M-STAT-03': () => ({ beats: [undefined, undefined,
    bars({ bars: [{ label: 'luku 1', value: 1, text: '1 kerta' }, { label: 'luku 4', value: 1, text: '1 kerta' }, { label: 'luku 6', value: 1, text: '1 kerta' }], max: 2, axis: 'esiintyy', label: 'Jokainen luku kerran: ei tyyppiarvoa' }),
  ] }),
  'M-PROB-01': () => ({ beats: [
    bag([['saadaan sininen', 'mahdoton', C.red]], 'Pussissa kaksi punaista: sininen on mahdoton'),
    bag([['saadaan sininen', 'mahdoton', C.red], ['punainen tai sininen', 'varma', C.pond]], 'Punainen tai sininen tulee jokaisella nostolla'),
    cards({ cards: [{ icon: '🚫', title: 'mahdoton', text: 'ei millään nostolla', tone: 'plain' }, { icon: '🎲', title: 'mahdollinen', text: 'joillakin nostoilla', tone: 'cool' }, { icon: '✅', title: 'varma', text: 'jokaisella nostolla', tone: 'plain' }], label: 'Mahdoton, mahdollinen ja varma' }),
  ] }),
  'M-STAT-05': () => ({ beats: [undefined, undefined,
    formula({ lines: ['15 l : 4 = 3,75 l', '15/4 litraa'], note: 'keskiarvo voi olla murtoluku tai desimaaliluku', label: 'Keskiarvo 15/4 = 3,75 litraa' }),
  ] }),
};
