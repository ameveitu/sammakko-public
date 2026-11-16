import type { PageDraw } from '../pages';
import { C, arrow, figure, formula, pill, ruler, tx } from '../figures';

/** A step-shaped island on squared paper shrunk by 1/2: every length halves, the shape stays. */
const halfShape = () => {
  const cell = 16, grid = (x0: number, y0: number, cols: number, rows: number) => {
    let g = '';
    for (let i = 0; i <= cols; i++) g += `<line x1="${x0 + i * cell}" y1="${y0}" x2="${x0 + i * cell}" y2="${y0 + rows * cell}" stroke="${C.line}" stroke-width="1"/>`;
    for (let i = 0; i <= rows; i++) g += `<line x1="${x0}" y1="${y0 + i * cell}" x2="${x0 + cols * cell}" y2="${y0 + i * cell}" stroke="${C.line}" stroke-width="1"/>`;
    return g;
  };
  /** Step shape `u` cells per unit: 4u wide, 2u tall. */
  const step = (x0: number, y0: number, u: number) => { const d = u * cell; return `<path d="M${x0} ${y0}h${2 * d}v${d}h${2 * d}v${d}h${-4 * d}Z" fill="${C.sky}" stroke="${C.blue}" stroke-width="3" stroke-linejoin="round"/>`; };
  const s = grid(14, 40, 10, 6) + step(30, 56, 2) + grid(266, 56, 6, 4) + step(282, 72, 1)
    + tx(94, 150, '8 ruutua leveä', { size: 13 }) + tx(314, 150, '4 ruutua leveä', { size: 13 })
    + arrow(184, 88, 254, 88, { color: C.pond, width: 3 }) + pill(219, 76, '· 1/2', { size: 15 });
  return figure(400, 166, s, 'Kertoimella 1/2 jokainen pituus puolittuu');
};

/** Map scale: compare in the same unit, then find what 1 cm stands for. */
export const DRAW: Record<string, () => PageDraw> = {
  'M-SCALE-01': () => ({ beats: [
    ruler({ length: 4, max: 10, label: 'Saari on kartalla 4 cm pitkä', reading: '4 cm = 32 m luonnossa' }),
    formula({ lines: ['4 cm : 3200 cm', '1 cm : 800 cm = 1 : 800'], note: 'kartalla kaikki on 800 kertaa pienempää', label: 'Mittakaava 1 : 800' }),
  ] }),
  'M-SCALE-02': () => ({ beats: [undefined, undefined, halfShape()] }),
};
