import type { PageDraw } from '../pages';
import { numberLine, table } from '../figures';

/** Opposite numbers and absolute value: both measure the way to zero. */
export const DRAW: Record<string, () => PageDraw> = {
  'M79-OPPOSITE-01': () => ({ beats: [
    numberLine({ from: -5, to: 5, step: 1, jumps: [{ from: 0, to: -4, text: '4 askelta' }, { from: 0, to: 4, text: '4 askelta' }], marks: [{ at: -4, text: '−4' }, { at: 4, text: '4', color: '#176b65' }], label: 'Luvut 4 ja −4 ovat yhtä kaukana nollasta' }),
    table({ head: ['luku', 'vastaluku', 'summa'], rows: [['4', '−4', '0'], ['10', '−10', '0'], ['2,5', '−2,5', '0']], label: 'Vastalukujen summa on aina nolla' }),
  ] }),
  'M79-ABS-01': () => ({ beats: [
    numberLine({ from: -5, to: 5, step: 1, jumps: [{ from: 0, to: -4, text: '|−4| = 4' }, { from: 0, to: 4, text: '|4| = 4' }], marks: [{ at: -4, text: '−4' }, { at: 4, text: '4' }], label: 'Itseisarvo on etäisyys nollasta' }),
    table({ head: ['etäisyys nollasta', 'paikat', 'montako'], rows: [['4', '−4 ja 4', '2'], ['2', '−2 ja 2', '2'], ['0', '0', '1']], mark: 2, label: 'Samalla etäisyydellä on kaksi paikkaa, paitsi nollassa' }),
  ] }),
};
