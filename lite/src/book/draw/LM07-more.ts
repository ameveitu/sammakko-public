import type { PageDraw } from '../pages';
import { columns, formula, numberLine } from '../figures';

/** Column addition, the rounded result and the estimate check. */
export const DRAW: Record<string, () => PageDraw> = {
  'M-CALC-STRAT': () => ({ beats: [undefined,
    columns({ rows: ['287', '98'], op: '+', carries: ['1', '1', ''], result: '385', hot: 1, label: 'Sarakkeittain: 15 ja 18 tuovat muistinumerot' }),
  ] }),
  'M-ROUND-01': () => ({ beats: [undefined,
    numberLine({ from: 30, to: 40, step: 1, marks: [{ at: 30, text: '33 ≈ 30', color: '#176b65' }, { at: 33, text: '33' }], jumps: [{ from: 33, to: 30, text: 'lähempänä' }], label: '33 pyöristyy lukuun 30' }),
  ] }),
  'M-EST-01': () => ({ beats: [undefined,
    formula({ lines: ['367 + 189', '≈ 370 + 190', '= 560'], note: '≈ kertoo, että tulos on arvio', label: 'Arvio: 367 + 189 ≈ 560' }),
  ] }),
  'M-EST-02': () => ({ beats: [undefined,
    numberLine({ from: 200, to: 450, step: 50, marks: [{ at: 260, text: '260' }, { at: 390, text: '390' }, { at: 300, text: '300 ✓', color: '#176b65' }], label: 'Ehdotus 300 on välillä 260–390' }),
  ] }),
};
