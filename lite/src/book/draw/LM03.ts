import type { PageDraw } from '../pages';
import { groups, numberLine, queue } from '../figures';

/** Seeing amounts at a glance, estimating, order words and neighbours on the number line. */
export const DRAW: Record<string, () => PageDraw> = {
  'M-NUM-04': () => ({ beats: [
    groups({ sets: [{ n: 4, cols: 2, name: 'neljä' }, { n: 2, cols: 2, name: 'kaksi' }], thing: 'leaf', label: 'Kaksi ryhmää näkee heti ilman laskemista' }),
    groups({ sets: [{ n: 4, cols: 2 }, { n: 2, cols: 2 }], thing: 'leaf', between: ['+'], result: '4 + 2 = 6 lehteä', label: 'Ryhmät yhteen: neljä ja kaksi on kuusi' }),
  ] }),
  'M-NUM-05': () => ({ beats: [
    groups({ sets: [{ n: 18, cols: 6, tone: 'plain' }], thing: 'leaf', result: 'arvio: 16–21 lehteä', label: 'Paljon lehtiä: ensin arvio' }),
    groups({ sets: [{ n: 5, cols: 3 }, { n: 5, cols: 3 }, { n: 5, cols: 3 }, { n: 3, cols: 3 }], thing: 'leaf', between: ['+', '+', '+'], result: '5 + 5 + 5 + 3 = 18: arvion sisällä', label: 'Tarkistus ryhmistä: 18 lehteä' }),
  ] }),
  'M-NUM-13': () => ({ beats: [
    queue({ names: ['Aava', 'Sulka', 'Majava', 'Loikka'], from: 'left', hot: 1, label: 'Vasemmalta laskien Sulka on toinen' }),
    queue({ names: ['Sulka', 'Majava', 'Loikka', 'Aava'], from: 'right', hot: 0, label: 'Uusi jono oikealta laskien: Sulka on neljäs' }),
  ] }),
  'M-NUM-09': () => ({ beats: [
    numberLine({ from: 0, to: 8, step: 1, marks: [{ at: 3, text: 'edeltäjä' }, { at: 4, text: '4', color: '#176b65' }, { at: 5, text: 'seuraaja' }], jumps: [{ from: 4, to: 3, text: '−1' }, { from: 4, to: 5, text: '+1' }], label: 'Luvun 4 naapurit ovat 3 ja 5' }),
    numberLine({ from: 0, to: 8, step: 1, marks: [{ at: 7, text: '7', color: '#176b65' }], jumps: [{ from: 7, to: 6, text: '−1' }, { from: 7, to: 8, text: '+1' }], label: 'Naapuri on aina yhden askeleen päässä' }),
  ] }),
};
