import type { PageDraw } from '../pages';
import { cards, formula, table } from '../figures';

/** Reading formulas: subscripts count atoms in one molecule, a coefficient counts molecules. */
export const DRAW: Record<string, () => PageDraw> = {
  'CHEM79-FORMULA': () => ({ beats: [undefined, undefined,
    cards({ cards: [{ icon: '🧪', title: 'molekyylikaava', text: 'C₂H₅OH: todelliset määrät', tone: 'cool' }, { icon: '⚖️', title: 'lukusuhde', text: 'H : C : O = 6 : 2 : 1', tone: 'warm' }], label: 'Kaava kertoo määrät, lukusuhde vain suhteen' }),
  ] }),
  'CHEM79-SUBSCRIPT': () => ({ beats: [undefined, undefined,
    formula({ lines: ['C₂H₅OH', 'H: 5 + 1 = 6'], note: 'sama merkki kahdesti: määrät lasketaan yhteen', label: 'Etanolissa on 6 vetyatomia' }),
  ] }),
  'CHEM79-COEFF': () => ({ beats: [
    formula({ lines: ['3 C₂H₅OH', 'kerroin 3: kolme molekyyliä'], note: 'iso numero kaavan edessä on kerroin', label: 'Kerroin kertoo molekyylien määrän' }),
    table({ head: ['', 'C', 'H', 'O'], rows: [['1 molekyyli', '2', '6', '1'], ['3 molekyyliä', '6', '18', '3']], mark: 1, label: 'Kolmessa molekyylissä 6 C, 18 H ja 3 O' }),
    cards({ cards: [{ icon: '💧', title: 'H₂O', text: 'vesi', tone: 'cool' }, { icon: '⚗️', title: 'H₂O₂', text: 'vetyperoksidi', tone: 'warm' }], label: 'Alaindeksin muutos tekee toisen aineen' }),
  ] }),
};
