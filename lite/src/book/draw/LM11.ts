import type { PageDraw } from '../pages';
import { cards, formula, sequence, table } from '../figures';

/** Early algebra: a box for an unknown number, a rule someone else can follow, guess and check. */
export const DRAW: Record<string, () => PageDraw> = {
  'M-ALG-04': () => ({ beats: [
    cards({ cards: [{ icon: '👝', title: 'pussi kiinni', text: 'sisältöä ei näe', tone: 'plain' }, { icon: '❓', title: '□ merkkiä', text: 'määrä ei vielä tiedossa', tone: 'cool' }], label: 'Tuntematonta määrää merkitään ruudulla □' }),
    sequence({ values: ['□', '12'], steps: ['käännä'], label: 'Luku oli 12 jo ennen kuin se näkyi' }),
    formula({ lines: ['□ = □', 'ei lisätty, ei otettu'], note: 'sama ruutu tarkoittaa samaa lukua', label: 'Sama pussi, sama luku' }),
  ] }),
  'M-ALG-02': () => ({ beats: [
    sequence({ values: [3, 7, 11, 15], next: '?', label: 'Mitä edelliselle luvulle tehdään?' }),
    sequence({ values: [3, 7, 11, 15], steps: ['+ 4', '+ 4', '+ 4'], label: 'Sääntö: lisää aina 4' }),
  ] }),
  'M-ALG-09': () => ({ beats: [
    table({ head: ['kokeilu x', 'x + 4', 'verrataan 10'], rows: [['4', '8', 'liian pieni']], label: 'Kokeillaan x = 4: tulos 8' }),
    cards({ cards: [{ icon: '⬆️', title: 'tulos alle', text: 'kokeile isompaa x' }, { icon: '⬇️', title: 'tulos yli', text: 'kokeile pienempää x' }], label: 'Tulos ohjaa seuraavaa kokeilua' }),
    table({ head: ['kokeilu x', 'x + 4', 'verrataan 10'], rows: [['4', '8', 'liian pieni ✗'], ['6', '10', 'yhtä suuri ✓']], mark: 1, label: 'x = 6 on ratkaisu' }),
  ] }),
  'M-ALG-01': () => ({ beats: [
    sequence({ values: [5, 10, 15, 20], steps: ['+ 5', '+ 5', '+ 5'], label: 'Jokaisessa välissä lisätään 5' }),
  ] }),
  'M-ALG-03': () => ({ beats: [
    sequence({ values: [5, 8, 11], steps: ['+ 3', '+ 3'], label: 'Ohje: lisää aina 3' }),
  ] }),
};
