import type { PageDraw } from '../pages';
import { formula, table } from '../figures';

/** Proportions and equation pairs: matching places, one factor, and a check in the original. */
export const DRAW: Record<string, () => PageDraw> = {
  'M79-PROP-SOLVE': () => ({ beats: [
    table({ head: ['', 'malli', 'uusi piirros'], rows: [['pituus', '7 m', '35 m'], ['leveys', '7 m', 'x']], label: 'Samanmuotoiset kannet: mikä on leveys x?' }),
    formula({ lines: ['leveys / pituus = leveys / pituus', '7 / 7 = x / 35'], note: 'vastaavat mitat samoille paikoille', label: 'Vastaavat mitat samoille paikoille' }),
    formula({ lines: ['7 / 7 = 1', '35 / 35 = 1  ✓'], note: 'suhteet yhtä suuret: x = 35 m', label: 'Tarkistus: suhteet ovat yhtä suuret' }),
  ] }),
  'M79-SYSTEM-ALG': () => ({ beats: [
    formula({ lines: ['5x − 2y = −7', '5x + 3y = −2'], note: 'kummassakin 5x: vähennä, niin x häviää', label: 'Yhtälöpari, jossa kummassakin on 5x' }),
    formula({ lines: ['5x − 2 · 1 = −7', '5x = −5, joten x = −1'], note: 'sijoitetaan y = 1', label: 'Sijoitetaan y = 1 ensimmäiseen yhtälöön' }),
    table({ head: ['yhtälö', 'x = −1, y = 1', ''], rows: [['5x − 2y = −7', '−5 − 2 = −7', '✓'], ['5x + 3y = −2', '−5 + 3 = −2', '✓']], label: 'Pari toteuttaa kummankin yhtälön' }),
  ] }),
};
