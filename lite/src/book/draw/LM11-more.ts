import type { PageDraw } from '../pages';
import { sequence } from '../figures';

/** The rule continues the sequence; each new term starts from the one before. */
export const DRAW: Record<string, () => PageDraw> = {
  'M-ALG-01': () => ({ beats: [undefined,
    sequence({ values: [5, 10, 15, 20, 25, 30], steps: ['+ 5', '+ 5', '+ 5', '+ 5', '+ 5'], label: 'Sääntö ”lisää aina 5” jatkaa jonoa: 25, 30' }),
  ] }),
  'M-ALG-03': () => ({ beats: [undefined,
    sequence({ values: [5, 8, 11, 14, 17, 20], steps: ['+ 3', '+ 3', '+ 3', '+ 3', '+ 3'], label: 'Jokainen luku lasketaan edellisestä' }),
  ] }),
};
