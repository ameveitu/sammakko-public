import type { PageDraw } from '../pages';
import { formula, plane, table } from '../figures';

/** Zeros and intercepts of a line, read from the graph and checked by calculation. */
export const DRAW: Record<string, () => PageDraw> = {
  'M79-ZERO-GRAPH': () => ({ beats: [
    plane({ x: [-1, 4], y: [-2, 4], xStep: 0.5, xLabel: 1, lines: [{ k: -2, b: 5 }], points: [{ x: 2.5, y: 0, text: 'y = 0', dx: 30, dy: -12 }], label: 'Nollakohdassa kuvaaja leikkaa x-akselin' }),
    plane({ x: [-1, 4], y: [-2, 4], xStep: 0.5, xLabel: 1, lines: [{ k: -2, b: 5 }], points: [{ x: 2.5, y: 0, text: 'x = 2,5 = 5/2', dx: 54, dy: -14 }], note: 'yksi ruutu on 0,5: viisi ruutua on 2,5', label: 'Nollakohta x = 5/2' }),
  ] }),
  'M79-INTERCEPT': () => ({ beats: [
    plane({ x: [0, 4], y: [-3, 2], lines: [{ k: -1, b: 1, text: 'f(x) = −x + 1', at: 2.6, dy: -14 }], xName: 'aika', yName: 'korkeus (cm)', label: 'Pinnan korkeus ajan funktiona' }),
    plane({ x: [0, 4], y: [-3, 2], lines: [{ k: -1, b: 1 }], points: [{ x: 0, y: 1, text: 'f(0) = 1', dx: 46, dy: -6 }], xName: 'aika', yName: 'korkeus (cm)', label: 'Alussa pinta on 1 cm vertailutason yläpuolella' }),
    formula({ lines: ['y = kx + b', 'b = f(0)'], note: 'y-akselin leikkauskohta kertoo alkuarvon', label: 'Vakiotermi on alkuarvo' }),
  ] }),
  'M79-ZERO': () => ({ beats: [
    plane({ x: [-1, 4], y: [-2, 6], lines: [{ k: -2, b: 5, text: 'f(x) = −2x + 5', at: 1.4, dy: -6 }], points: [{ x: 2.5, y: 0, text: '≈ 2,5', dx: 26, dy: -12 }], label: 'Kuvaajasta luettu nollakohta noin 2,5' }),
    formula({ lines: ['−2x + 5 = 0', '−2x = −5', 'x = 5/2 = 2,5'], note: 'laskulla saadaan tarkka arvo', label: 'Nollakohta laskemalla' }),
    table({ head: ['x', '2', '2,5', '3'], rows: [['f(x)', '1', '0', '−1']], label: 'f(2,5) = −2 · 2,5 + 5 = 0' }),
  ] }),
};
