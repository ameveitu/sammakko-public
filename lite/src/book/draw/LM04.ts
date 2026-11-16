import type { PageDraw } from '../pages';
import { C, figure, pill, tx } from '../figures';

/** Seven guests: three pairs and one alone. */
const pairsLeft = () => {
  let s = '';
  for (let p = 0; p < 3; p++) {
    const x = 40 + p * 92;
    s += `<rect x="${x}" y="58" width="76" height="56" rx="14" fill="${C.cool}" stroke="${C.blue}" stroke-width="2"/>`
      + `<circle cx="${x + 22}" cy="86" r="13" fill="${C.leaf}" stroke="${C.ink}" stroke-width="2"/><circle cx="${x + 54}" cy="86" r="13" fill="${C.leaf}" stroke="${C.ink}" stroke-width="2"/>`;
  }
  s += `<circle cx="338" cy="86" r="13" fill="${C.leaf}" stroke="${C.red}" stroke-width="3"/>` + tx(338, 132, 'ilman paria', { size: 12, fill: C.red })
    + tx(156, 40, '3 paria', { size: 14, fill: C.soft }) + pill(200, 172, '7 = 3 paria + 1: pariton', { size: 15 });
  return figure(400, 186, s, 'Seitsemästä vieraasta yksi jää yksin');
};

/** Odd and even: make pairs and see whether anyone is left alone. */
export const DRAW: Record<string, () => PageDraw> = {
  'M-NUM-15': () => ({ beats: [undefined, pairsLeft()] }),
};
