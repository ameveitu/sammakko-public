import type { Paint } from '../../engine/types';
import type { PageDraw } from '../pages';
import { C, columns, figure, formula, numberLine, pill, tx } from '../figures';

/** A 1 m × 1 m square in 10 × 10 cells with a 0,5 m × 0,5 m piece coloured: 25 of 100 cells. */
function cloth(label: string): Paint {
  const x0 = 120, y0 = 22, side = 160, cell = side / 10;
  let s = `<rect x="${x0}" y="${y0}" width="${side}" height="${side}" fill="#fff" stroke="${C.ink}" stroke-width="2"/>`;
  s += `<rect x="${x0}" y="${y0 + side / 2}" width="${side / 2}" height="${side / 2}" fill="${C.sun}" stroke="${C.ink}" stroke-width="2.5"/>`;
  for (let i = 1; i < 10; i++) {
    s += `<line x1="${x0 + i * cell}" y1="${y0}" x2="${x0 + i * cell}" y2="${y0 + side}" stroke="${C.line}" stroke-width="0.8"/>`;
    s += `<line x1="${x0}" y1="${y0 + i * cell}" x2="${x0 + side}" y2="${y0 + i * cell}" stroke="${C.line}" stroke-width="0.8"/>`;
  }
  s += tx(x0 + side / 4, y0 + side + 20, '0,5 m', { size: 13, fill: C.pond }) + tx(x0 - 10, y0 + side * 0.75 + 5, '0,5 m', { size: 13, fill: C.pond, anchor: 'end' });
  s += tx(x0 + side / 2, y0 - 6, '1 m', { size: 12, fill: C.soft }) + tx(x0 + side + 10, y0 + side / 2 + 5, '1 m', { size: 12, fill: C.soft, anchor: 'start' });
  s += pill(200, y0 + side + 50, '0,5 · 0,5 = 0,25 m² = neljäsosa', { size: 14, stroke: C.pond });
  return figure(400, y0 + side + 62, s, label);
}

/** Decimals: line the commas up, and multiplying by less than one makes smaller. */
export const DRAW: Record<string, () => PageDraw> = {
  'M79-DEC-MUL': () => ({ beats: [
    cloth('Puolen metrin neliö on neljäsosa metrin neliöstä'),
    formula({ lines: ['5/10 · 5/10 = 25/100', '= 0,25 < 0,5'], note: 'alle yhdellä kertominen pienentää', label: 'Kymmenesosa kertaa kymmenesosa on sadasosa' }),
  ] }),
  'M79-DEC-ADD': () => ({ beats: [
    columns({ rows: ['4,60', '0,67'], op: '+', result: '', hot: 2, note: 'pilkut ja samat paikat kohdakkain', label: '4,60 ja 0,67 allekkain' }),
    columns({ rows: ['4,60', '0,67'], op: '+', result: '5,27', carries: ['1', '', '', ''], hot: 1, note: '6 + 6 = 12 kymmenesosaa: 10 niistä on 1 kokonainen', label: '4,60 + 0,67 = 5,27' }),
  ] }),
  'M79-DEC-SUB': () => ({ beats: [
    columns({ rows: ['5,40', '1,43'], op: '−', result: '', hot: 0, note: '5,4 = 5,40: lisätty nolla ei muuta lukua', label: '5,40 ja 1,43 allekkain' }),
    columns({ rows: ['5,40', '1,43'], op: '−', result: '3,97', carries: ['4', '', '13', '10'], note: 'lainataan kymmenesosa ja sitten kokonainen', label: '5,40 − 1,43 = 3,97' }),
    columns({ rows: ['3,97', '1,43'], op: '+', result: '5,40', carries: ['1', '', '1', ''], note: 'summa on alkuperäinen pituus 5,4 m ✓', label: 'Tarkistus: 3,97 + 1,43 = 5,40' }),
  ] }),
  'M79-DEC-ADD-SUB': () => ({ beats: [
    numberLine({ from: 4, to: 7, step: 0.5, jumps: [{ from: 5.6, to: 6.4, text: '+0,8' }, { from: 6.4, to: 4.9, text: '−1,5' }], marks: [{ at: 5.6, text: 'alku 5,6', color: '#176b65' }, { at: 4.9, text: 'arvio 4,9' }, { at: 6.4, text: '6,4', color: '#536c6c' }], label: 'Arvio pyöristetyillä luvuilla: 4 ja 5 kg:n välissä' }),
    formula({ lines: ['5,60 + 0,77 = 6,37', '6,37 − 1,51 = 4,86'], note: '4,86 kg on 4 ja 5 kg:n välissä ✓', label: 'Laatikon massa vaihe kerrallaan' }),
  ] }),
};
