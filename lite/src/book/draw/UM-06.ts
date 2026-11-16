import type { PageDraw } from '../pages';
import { formula, numberLine } from '../figures';

/** Rounding with care, exact roots, and where real numbers sit on the line. */
export const DRAW: Record<string, () => PageDraw> = {
  'M79-ROUND-01': () => ({ beats: [undefined,
    formula({ lines: ['12,15 km ≈ 12 km', 'kaksi merkitsevää numeroa: 1 ja 2'], note: 'laskeminen alkaa ensimmäisestä nollasta poikkeavasta', label: 'Kaksi merkitsevää numeroa' }),
    numberLine({ from: 12, to: 13, step: 0.1, marks: [{ at: 12.15, text: 'tarvitaan 12,15' }], jumps: [{ from: 12.15, to: 13, text: 'ostetaan 13 km' }], label: 'Aina ylöspäin: tarvitaan 13 km' }),
  ] }),
  'M79-SQRT-03': () => ({ beats: [undefined, undefined,
    formula({ lines: ['√2 + √3 ≠ √5', '1,41 + 1,73 ≈ 3,14, mutta √5 ≈ 2,24'], note: 'erilaisia juuria ei voi yhdistää', label: 'Erilaisia juuria ei yhdistetä' }),
  ] }),
  'M79-REAL-01': () => ({ beats: [undefined, undefined,
    formula({ lines: ['3,14159…', 'näyttö on vain katkelma'], note: 'laji päätellään luvun tarkasta esityksestä', label: 'Numeroiden määrä ei ratkaise lajia' }),
  ] }),
  'M79-REAL-02': () => ({ beats: [undefined, undefined,
    numberLine({ from: 1.4, to: 1.5, step: 0.02, marks: [{ at: 1.4142, text: '√2 ≈ 1,414' }], note: '1,4² = 1,96 ja 1,5² = 2,25, joten √2 on välissä', label: '√2 on lukujen 1,4 ja 1,5 välissä' }),
  ] }),
};
