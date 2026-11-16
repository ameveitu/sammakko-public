import type { PageDraw } from '../pages';
import { C, figure, formula, pill, table, tx } from '../figures';

/** The line y = 3 runs alongside the x-axis and never meets it: no zero. */
const flatLine = () => {
  const X = (x: number) => 200 + x * 36, Y = (y: number) => 150 - y * 30;
  let s = '';
  for (let x = -4; x <= 4; x++) s += `<line x1="${X(x)}" y1="${Y(-1)}" x2="${X(x)}" y2="${Y(4)}" stroke="${C.line}" stroke-width="0.8"/>` + (x ? tx(X(x), Y(0) + 17, String(x).replace('-', '−'), { size: 11, fill: C.soft }) : '');
  for (let y = -1; y <= 4; y++) s += `<line x1="${X(-4)}" y1="${Y(y)}" x2="${X(4)}" y2="${Y(y)}" stroke="${C.line}" stroke-width="0.8"/>` + '';
  const yLabels = [-1, 1, 2, 3, 4].map((y) => `<rect x="${X(0) - 18}" y="${Y(y) - 7}" width="13" height="14" fill="${C.paper}"/>` + tx(X(0) - 7, Y(y) + 4, String(y).replace('-', '−'), { size: 11, fill: C.soft, anchor: 'end' })).join('');
  s += `<line x1="${X(-4)}" y1="${Y(0)}" x2="${X(4) + 8}" y2="${Y(0)}" stroke="${C.ink}" stroke-width="2"/><line x1="${X(0)}" y1="${Y(-1)}" x2="${X(0)}" y2="${Y(4) - 8}" stroke="${C.ink}" stroke-width="2"/>`
    + tx(X(4) + 12, Y(0) + 5, 'x', { size: 14, anchor: 'start', italic: true }) + tx(X(0) + 8, Y(4) - 4, 'y', { size: 14, anchor: 'start', italic: true })
    + `<line x1="${X(-4)}" y1="${Y(3)}" x2="${X(4)}" y2="${Y(3)}" stroke="${C.pond}" stroke-width="3.5"/>` + yLabels + pill(X(-2.6), Y(3) - 10, 'y = 3', { size: 14 })
    + pill(X(2.3), Y(1.5) + 5, 'ei nollakohtaa', { size: 13, stroke: C.red });
  return figure(400, 196, s, 'Vaakasuora suora y = 3: ei nollakohtaa');
};

/** Zeros of a line: set f(x) = 0, solve, and put the answer back in. */
export const DRAW: Record<string, () => PageDraw> = {
  'M79-ZERO-CALC': () => ({ beats: [
    formula({ lines: ['f(x) = −x − 1', '−x − 1 = 0'], note: 'nollakohdassa funktion arvo on 0', label: 'Nollakohta: f(x) = 0' }),
    formula({ lines: ['−x = 1', 'x = −1'], note: 'jaetaan molemmat puolet luvulla −1', label: 'Ratkaistaan x' }),
    table({ head: ['x', '−2', '−1', '0'], rows: [['f(x)', '1', '0', '−1']], mark: 0, label: 'Tarkistus: f(−1) = 0' }),
  ] }),
  'M79-ZERO-GRAPH': () => ({ beats: [undefined, undefined, flatLine()] }),
};
