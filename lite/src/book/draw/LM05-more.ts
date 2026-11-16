import type { PageDraw } from '../pages';
import { formula, groups, pairUp } from '../figures';

/** Order and grouping in sums, difference by pairing, and the plus that a situation asks for. */
export const DRAW: Record<string, () => PageDraw> = {
  'M-ADD-COMM': () => ({ beats: [
    groups({ sets: [{ n: 6, cols: 3, name: 'Loikka' }, { n: 2, cols: 2, name: 'Aava' }], thing: 'cookie', between: ['+'], result: '6 + 2   tai   2 + 6', label: 'Kaksi koria voi laskea kummin päin tahansa' }),
    formula({ lines: ['6 + 2 = 8', '2 + 6 = 8'], note: 'kun luvut vaihtavat paikkaa, summa pysyy', label: 'Kumpikin järjestys antaa kahdeksan' }),
  ] }),
  'M-ADD-ASSOC': () => ({ beats: [
    groups({ sets: [{ n: 3, cols: 3, mark: true }, { n: 4, cols: 2, mark: true }, { n: 5, cols: 3 }], between: ['+', '+'], result: '(3 + 4) + 5 = 7 + 5 = 12', label: 'Ensin kaksi ensimmäistä: 3 + 4 = 7' }),
    groups({ sets: [{ n: 3, cols: 3 }, { n: 4, cols: 2, mark: true }, { n: 5, cols: 3, mark: true }], between: ['+', '+'], result: '3 + (4 + 5) = 3 + 9 = 12', label: 'Ensin kaksi viimeistä: sama 12' }),
  ] }),
  'M-SUB-02': () => ({ beats: [
    pairUp({ a: { name: 'Aava', n: 4 }, b: { name: 'Loikka', n: 6 }, thing: 'reed', label: 'Neljä paria, Loikalta jää kaksi ilman paria' }),
    pairUp({ a: { name: 'Aava', n: 4 }, b: { name: 'Loikka', n: 6 }, thing: 'reed', result: '6 − 4 = 2', label: 'Ilman paria jääneet ovat ero: 6 − 4 = 2' }),
  ] }),
  'M-ADD-SUB-SELECT': () => ({ beats: [
    groups({ sets: [{ n: 6, cols: 3, name: 'lautalla' }, { n: 2, cols: 2, name: 'tulee lisää', tone: 'warm' }], thing: 'reed', between: ['+'], result: '6 + 2 = 8', label: 'Määrä kasvaa, joten lasketaan plus' }),
  ] }),
};
