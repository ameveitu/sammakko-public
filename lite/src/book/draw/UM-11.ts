import type { PageDraw } from '../pages';
import { bars, formula, sequence, table } from '../figures';

const WINDOWS = [8, 11, 14, 17];

/** Number sequences: look at how each number turns into the next, then check the rule on all of them. */
export const DRAW: Record<string, () => PageDraw> = {
  'M79-SEQ-STRUCTURE': () => ({ beats: [
    bars({ bars: WINDOWS.map((v, i) => ({ label: `vaihe ${i + 1}`, value: v, text: String(v) })), max: 20, axis: 'ikkunoita', label: 'Ikkunoita vaiheissa: 8, 11, 14 ja 17' }),
    sequence({ values: WINDOWS, steps: ['+ 3', '+ 3', '+ 3', '+ 3'], next: '?', label: 'Erotus on joka kerta 3' }),
    sequence({ values: [2, 6, 18, 54], steps: ['· 3', '· 3', '· 3'], note: 'erotukset 4, 12 ja 36 kasvavat', label: 'Kertova jono: joka luku 3 kertaa edellinen' }),
  ] }),
  'M79-SEQ-RULE': () => ({ beats: [
    table({ head: ['vaihe', '1', '2', '3', '4'], rows: [['ikkunoita', ...WINDOWS.map(String)]], label: 'Ikkunamäärät vaiheittain' }),
    sequence({ values: WINDOWS, next: '?', label: 'Mikä sääntö tekee jokaisen luvun?' }),
    sequence({ values: [3, 6, 12, 24], steps: ['· 2', '· 2', '· 2', '· 2'], next: '48', label: 'Sääntö ”kerro 2:lla”: seuraava on 48' }),
  ] }),
  'M79-SEQ-01': () => ({ beats: [
    sequence({ values: WINDOWS, label: 'Lukujono: 8, 11, 14, 17' }),
    sequence({ values: WINDOWS, steps: ['+ 3', '+ 3', '+ 3', '+ 3'], next: '?', label: 'Sama sääntö joka askeleella' }),
    sequence({ values: [1, 2, 4, 8], steps: ['· 2', '· 2', '· 2'], note: 'erotukset 1, 2 ja 4 kasvavat', label: 'Sääntö tarkistetaan kaikista luvuista' }),
  ] }),
  'M79-DEP-01': () => ({ beats: [undefined, undefined,
    bars({ bars: [{ label: '0 min', value: 0, text: '0 l' }, { label: '1 min', value: 4, text: '4 l' }, { label: '2 min', value: 8, text: '8 l' }, { label: '3 min', value: 8, text: '8 l', mark: true, sub: 'tauko' }, { label: '4 min', value: 12, text: '12 l' }], max: 14, axis: 'vettä', label: 'Tauon ajan määrä pysyy, riippuvuus ei katoa' }),
  ] }),
  'M79-FUNC-01': () => ({ beats: [undefined, undefined,
    formula({ lines: ['f(x) = 2x + 1', 'f(3) = 2 · 3 + 1 = 7'], note: 'jokaiselle syötteelle täsmälleen yksi arvo', label: 'Funktion merkintä f(x)' }),
  ] }),
};
