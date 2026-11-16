import type { PageDraw } from '../pages';
import { cards, flow, formula, indicator, phScale } from '../figures';

/** Acids and bases: the pH scale, its tenfold steps and an indicator's colour ranges. */
export const DRAW: Record<string, () => PageDraw> = {
  'CHEM79-ACIDBASE': () => ({ beats: [
    cards({ cards: [{ icon: '🧪', title: 'näyte 1', text: 'pH 7' }, { icon: '🧪', title: 'näyte 2', text: 'pH 3,3' }, { icon: '🧪', title: 'näyte 3', text: 'pH 10,1' }], label: 'Kolme samannäköistä näytettä, eri pH' }),
    phScale({ marks: [{ at: 3.3, text: 'näyte 2' }, { at: 7, text: 'näyte 1' }, { at: 10.1, text: 'näyte 3' }], label: 'Näyte 2 hapan, 1 neutraali, 3 emäksinen' }),
    phScale({ marks: [{ at: 2.5, text: 'sitruunamehu' }, { at: 7, text: 'puhdas vesi' }, { at: 10, text: 'saippuavesi' }], label: 'Sitruunamehu, vesi ja saippuavesi' }),
  ] }),
  'CHEM79-PH': () => ({ beats: [
    phScale({ marks: [{ at: 5, text: 'liuos 3' }, { at: 6, text: 'liuos 1' }, { at: 11, text: 'liuos 2' }], label: 'Liuokset pH 6, 11 ja 5' }),
    flow({ steps: [{ text: 'liuos 3', sub: 'pH 5' }, { text: 'liuos 1', sub: 'pH 6' }, { text: 'liuos 2', sub: 'pH 11' }], label: 'Happamimmasta emäksisimpään' }),
    formula({ lines: ['pH 5 → pH 6', '10 kertaa vähemmän hapan'], note: 'yksi pH-yksikkö = kymmenkertainen ero', label: 'Yksi pH-yksikkö on kymmenkertainen ero' }),
  ] }),
  'CHEM79-INDICATOR': () => ({ beats: [
    indicator({ label: 'Bromitymolisininen: keltainen alle 6, sininen yli 7,6' }),
    indicator({ sample: 'blue', label: 'Sininen: pH yli 7,6, emäksinen' }),
    indicator({ sample: 'green', label: 'Vihreä: pH 6–7,6, rajoilla epävarma' }),
  ] }),
  'CHEM79-CONC-CALC': () => ({ beats: [undefined, undefined,
    formula({ lines: ['10 % = 10/100 = 0,10', '0,10 · 200 g = 20 g'], note: 'prosentti desimaaliluvuksi, sitten kerrotaan', label: 'Sokeria 200 grammassa mehua' }),
  ] }),
};
