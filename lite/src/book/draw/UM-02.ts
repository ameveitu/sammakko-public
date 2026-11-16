import type { PageDraw } from '../pages';
import { bars, cards, code, flow, formula, sequence, table } from '../figures';

const MACHINE = ['lue n', 'summa = 2', 'toista n kertaa:', '  summa = summa + 3', 'tulosta summa'];

/** Algorithms and programs: the lantern machine, its steps, names and tests. */
export const DRAW: Record<string, () => PageDraw> = {
  'M79-ALGTH-01': () => ({ beats: [
    flow({ steps: [{ icon: '📥', text: 'syöte n', sub: 'lyhtyjä' }, { icon: '⚙️', text: 'aloita 2', sub: '+3 joka lyhdystä' }, { icon: '📤', text: 'tulosta', sub: 'määrä' }], label: 'Kone saa luvun n, laskee ja tulostaa' }),
    flow({ steps: [{ text: 'lue n' }, { text: 'toista lisäys n kertaa' }, { text: 'tulosta tulos' }], label: 'Kolme vaihetta, kukin tekee yhden asian' }),
    sequence({ values: [2, 5, 8], steps: ['+3', '+3'], note: 'toisto saa 2 ja n = 2, antaa 8', label: 'Syötteellä 2: 2, 5, 8' }),
  ] }),
  'M79-TECH-01': () => ({ beats: [
    formula({ lines: ['ala = x · (7 − x)', 'leveys x, pituus 7 − x'], label: 'Leveys x, pituus 7 − x, ala x · (7 − x)' }),
    bars({ bars: [1, 2, 3, 4, 5, 6].map((x, i) => ({ label: `x = ${x}`, value: [6, 10, 12, 12, 10, 6][i]!, text: String([6, 10, 12, 12, 10, 6][i]), mark: x === 3 || x === 4 })), max: 14, axis: 'ala', label: 'Alat 6, 10, 12, 12, 10 ja 6: suurin 12' }),
    cards({ cards: [{ icon: '💻', title: 'kone laskee nopeasti', mark: 'ok' }, { icon: '🚧', title: 'tutkittiin vain kokonaisluvut', text: 'kerro rajat', tone: 'warm' }], label: 'Johtopäätöksen rajat kerrotaan' }),
  ] }),
  'M79-PROG-01': () => ({ beats: [
    code({ lines: MACHINE, label: 'Lyhtykone ohjelmana' }),
    code({ lines: MACHINE, hot: 3, note: 'n = 3: summa 2 → 5 → 8 → 11', label: 'Toisto lisää 3 kolme kertaa: tulostus 11' }),
    code({ lines: ['toista n kertaa:', '  summa = summa + 3', 'jos n on parillinen:', '  summa = summa + 1'], hot: 2, label: 'Ehto: parillisella n lisätään vielä 1' }),
  ] }),
  'M79-PROG-CLEAR': () => ({ beats: [
    cards({ cards: [{ icon: '❓', title: 'a', text: 'mitä tämä laskee?', mark: 'no' }, { icon: '🏮', title: 'lyhtyjen_summa', text: 'nimi kertoo', mark: 'ok' }], label: 'Kuvaava nimi kertoo, mitä muuttuja laskee' }),
    code({ lines: ['lue n', 'lyhtyjen_summa = 2', 'toista n kertaa:', '  lyhtyjen_summa = lyhtyjen_summa + 3', 'tulosta lyhtyjen_summa'], note: 'syöte 1 → yhä 5', label: 'Selkeä ohjelma, sama toiminta' }),
    table({ head: ['syöte', 'ennen', 'jälkeen'], rows: [['0', '2', '2'], ['1', '5', '5'], ['5', '17', '17']], label: 'Samat syötteet, samat tulokset' }),
  ] }),
  'M79-PROG-TEST': () => ({ beats: [
    table({ head: ['syöte', 'ennuste', 'kone'], rows: [['1', '2 + 3 = 5', '8 ✗']], label: 'Ennuste 5, kone antaa 8' }),
    cards({ cards: [{ icon: '1️⃣', title: 'tavallinen', text: 'syöte 1' }, { icon: '0️⃣', title: 'rajatapaus', text: 'syöte 0' }, { icon: '⛔', title: 'virheellinen', text: 'syöte −1', tone: 'warm' }], label: 'Testaa tavallinen, raja ja virheellinen syöte' }),
    table({ head: ['syöte', 'ennuste', 'kone'], rows: [['1', '5', '8 ✗'], ['0', '2', '5 ✗'], ['−1', 'virheilmoitus', '?']], mark: 1, label: 'Myös syöte 0 paljastaa vian' }),
  ] }),
  'M79-PROG-PRACTICE': () => ({ beats: [
    table({ head: ['syöte', 'tulos'], rows: [['1', '5 ✓']], label: 'Kone toimii: syötteellä 1 tulos 5' }),
    flow({ steps: [{ icon: '✏️', text: 'yksi muutos' }, { icon: '▶️', text: 'testaa heti' }, { icon: '✏️', text: 'seuraava muutos' }, { icon: '▶️', text: 'testaa' }], label: 'Yksi muutos kerrallaan, testi heti' }),
    table({ head: ['syöte', 'ennen', 'muutoksen jälkeen'], rows: [['0', '2', '2 ✓'], ['1', '5', '5 ✓'], ['5', '17', '17 ✓']], label: 'Tulokset pysyivät: hyvä perustelu' }),
  ] }),
  'M79-PROG-02': () => ({ beats: [
    formula({ lines: ['tulos = 2 + 3 · n', 'n = 1 → 2 + 3 = 5'], label: 'Lyhtykone: syötteellä 1 tulos 5' }),
    flow({ steps: [{ icon: '✂️', text: 'pilko' }, { icon: '⌨️', text: 'kirjoita' }, { icon: '🏷️', text: 'nimeä' }, { icon: '🧪', text: 'testaa' }], label: 'Pilko, kirjoita, nimeä ja testaa' }),
    table({ head: ['syöte', 'odotettu', 'kone'], rows: [['0', '2', '2 ✓'], ['1', '5', '5 ✓'], ['5', '2 + 3 · 5 = 17', '17 ✓']], label: 'Testataan sallitut syötteet 0–5' }),
  ] }),
};
