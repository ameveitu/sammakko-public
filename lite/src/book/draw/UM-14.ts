import type { PageDraw } from '../pages';
import { formula, table } from '../figures';

/** Right triangles: Pythagoras both ways, and which ratio fits the known sides. */
export const DRAW: Record<string, () => PageDraw> = {
  'M79-TRIG-CALC': () => ({ beats: [undefined, undefined,
    table({ head: ['kulmaan nähden tunnetaan', 'käytä'], rows: [['vastainen ja hypotenuusa', 'sin'], ['viereinen ja hypotenuusa', 'cos'], ['vastainen ja viereinen', 'tan']], label: 'Sivut ratkaisevat funktion' }),
  ] }),
  'M79-PYTH-01': () => ({ beats: [undefined,
    formula({ lines: ['XZ² + XY² = YZ²', 'kateetit² yhteensä = hypotenuusa²'], note: 'hypotenuusa on suoran kulman vastainen, pisin sivu', label: 'Pythagoraan lause' }),
  ] }),
  'M79-PYTH-CONVERSE': () => ({ beats: [undefined, undefined,
    table({ head: ['c on pisin sivu', 'kolmio on'], rows: [['a² + b² = c²', 'suorakulmainen'], ['a² + b² > c²', 'teräväkulmainen'], ['a² + b² < c²', 'tylppäkulmainen']], mark: 0, label: 'Käänteislause: c on pisin sivu, a ja b muut sivut' }),
  ] }),
  'M79-PYTH-CALC': () => ({ beats: [undefined, undefined,
    formula({ lines: ['√(26² − 24²)', '= √(676 − 576) = √100 = 10'], note: 'kateetti: hypotenuusan neliöstä vähennetään', label: 'Kateetti: vähennetään neliöt' }),
  ] }),
};
