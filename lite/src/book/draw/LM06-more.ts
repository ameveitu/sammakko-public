import type { PageDraw } from '../pages';
import { arrow, C, figure, formula, groups, pill, sequence, tx } from '../figures';

/** A grid of seats in two rafts: before and after a quarter turn. */
const turned = () => {
  const seats = (x0: number, y0: number, rows: number, cols: number) => {
    let s = `<rect x="${x0}" y="${y0}" width="${cols * 30 + 16}" height="${rows * 30 + 16}" rx="8" fill="#e8c890" stroke="#9a6a3a" stroke-width="2.5"/>`;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) s += `<circle cx="${x0 + 23 + c * 30}" cy="${y0 + 23 + r * 30}" r="10" fill="${C.leaf}" stroke="${C.ink}" stroke-width="1.5"/>`;
    return s;
  };
  const s = seats(30, 56, 2, 4) + seats(268, 26, 4, 2) + tx(98, 150, '2 riviä, 4 paikkaa', { size: 13 }) + tx(305, 182, '4 riviä, 2 paikkaa', { size: 13 })
    + arrow(176, 86, 250, 86, { color: C.pond, width: 3 }) + pill(213, 70, '↻ ¼', { size: 14 }) + pill(200, 210, 'yhä 8 paikkaa', { size: 15, stroke: C.pond });
  return figure(400, 222, s, 'Neljänneskierros: rivit ja sarakkeet vaihtuvat, paikkoja on yhä 8');
};

/** Three boats, four baskets in each, two snacks in each basket; `hot` marks what is counted first. */
const boats = (hot: 'baskets' | 'boat' | 'none', result: string, label: string) => {
  let s = '';
  for (let b = 0; b < 3; b++) {
    const x0 = 18 + b * 126, lit = hot === 'boat' && b === 0;
    s += `<path d="M${x0} 66 h114 l-14 46 h-86 z" fill="${lit ? C.glow : '#e8c890'}" stroke="${lit ? C.ink : '#9a6a3a'}" stroke-width="${lit ? 3 : 2.5}"/>`;
    for (let k = 0; k < 4; k++) {
      const bx = x0 + 10 + k * 25;
      s += `<rect x="${bx}" y="40" width="20" height="24" rx="4" fill="${hot === 'baskets' ? C.glow : '#fff'}" stroke="${C.ink}" stroke-width="1.5"/>`
        + `<circle cx="${bx + 10}" cy="48" r="4" fill="#d9a35b" stroke="${C.ink}" stroke-width="1"/><circle cx="${bx + 10}" cy="58" r="4" fill="#d9a35b" stroke="${C.ink}" stroke-width="1"/>`;
    }
    s += tx(x0 + 57, 96, `${b + 1}. vene`, { size: 12, fill: C.ink });
  }
  s += tx(200, 26, '4 koria veneessä · 2 evästä korissa', { size: 13, fill: C.soft });
  if (result) s += pill(200, 150, result, { size: 16, stroke: C.pond });
  return figure(400, result ? 164 : 124, s, label);
};

/** 4 rows of 8 seats split after column `cut`; `parts` writes the two products under the halves. */
const splitDeck = (cut: number, parts: boolean, label: string) => {
  const x0 = 60, y0 = 30, d = 32;
  let s = '';
  for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) s += `<rect x="${x0 + c * d + (c >= cut ? 10 : 0)}" y="${y0 + r * d}" width="${d - 4}" height="${d - 4}" rx="6" fill="${c < cut ? C.sun : C.sky}" stroke="${C.ink}" stroke-width="1.3"/>`;
  s += `<line x1="${x0 + cut * d + 3}" y1="${y0 - 10}" x2="${x0 + cut * d + 3}" y2="${y0 + 4 * d + 4}" stroke="${C.red}" stroke-width="3" stroke-dasharray="6 4"/>`;
  s += tx(x0 - 10, y0 + 2 * d, '4 riviä', { size: 12, anchor: 'end', fill: C.soft });
  if (parts) s += pill(x0 + cut * d / 2, y0 + 4 * d + 26, `4 × ${cut} = ${4 * cut}`, { size: 14 }) + pill(x0 + cut * d + 10 + (8 - cut) * d / 2, y0 + 4 * d + 26, `4 × ${8 - cut} = ${4 * (8 - cut)}`, { size: 14 });
  else s += tx(x0 + cut * d / 2, y0 + 4 * d + 22, `${cut} sarake`, { size: 13 }) + tx(x0 + cut * d + 10 + (8 - cut) * d / 2, y0 + 4 * d + 22, `${8 - cut} saraketta`, { size: 13 });
  return figure(400, y0 + 4 * d + 44, s, label);
};

/** Commutative and associative laws of multiplication, the distributive split and divisors. */
export const DRAW: Record<string, () => PageDraw> = {
  'M-MUL-COMM': () => ({ beats: [undefined, turned(),
    formula({ lines: ['2 × 4 = 8', '4 × 2 = 8', '2 × 4 = 4 × 2'], note: 'tulon tekijät saa vaihtaa toisin päin', label: 'Vaihdannaisuus: 2 × 4 = 4 × 2' }),
  ] }),
  'M-MUL-ASSOC': () => ({ beats: [
    boats('none', '', 'Kolme venettä, neljä koria, kaksi evästä korissa'),
    boats('baskets', '(3 × 4) × 2 = 12 × 2 = 24', 'Ensin korit: 12 koria, niissä 24 evästä'),
    boats('boat', '3 × (4 × 2) = 3 × 8 = 24', 'Ensin yksi vene: 8 evästä, kolmessa 24'),
  ] }),
  'M-DISTRIB': () => ({ beats: [
    splitDeck(1, false, 'Kansi 4 × 8 jaetaan kahteen osaan'),
    splitDeck(1, true, 'Osat erikseen: 4 + 28 = 32'),
    formula({ lines: ['4 × (1 + 7)', '= 4 × 1 + 4 × 7', '= 4 + 28 = 32'], note: 'kumpikin osa kerrotaan rivien määrällä', label: 'Osittelulaki: 4 × (1 + 7) = 4 × 1 + 4 × 7' }),
  ] }),
  'M-DIVIS-02': () => ({ beats: [
    groups({ sets: [{ n: 4, cols: 2, name: 'kimppu' }, { n: 4, cols: 2, name: 'kimppu' }, { n: 4, cols: 2, name: 'kimppu' }], thing: 'reed', result: '4 × 3 = 12: mitään ei jää yli', label: '12 kaislaa, neljän kimppuja tulee 3' }),
    groups({ sets: [{ n: 4, cols: 2 }, { n: 4, cols: 2 }, { n: 4, cols: 2 }], thing: 'reed', result: '12 : 4 = 3 tasan → 4 on luvun 12 jakaja', label: 'Tasan neljän ryhmiin: 4 on jakaja' }),
    sequence({ values: [4, 8, 12, 16], steps: ['+ 4', '+ 4', '+ 4'], next: '…', label: 'Luvun 4 monikertoja: 4, 8, 12, 16 …' }),
  ] }),
};
