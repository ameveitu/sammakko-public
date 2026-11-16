import type { PageDraw } from '../pages';
import { C, figure, pill, tx } from '../figures';

/** Two litre cubes side by side, with their 10 cm edges. */
const twoCubes = () => {
  const cube = (x: number, y: number) => {
    const a = 80, d = 30;
    return `<path d="M${x} ${y} h${a} l${d} ${-d} h${-a} z" fill="#bfe3a8" stroke="${C.ink}" stroke-width="2"/>`
      + `<path d="M${x + a} ${y} v${a} l${d} ${-d} v${-a} z" fill="#8fcf5a" stroke="${C.ink}" stroke-width="2"/>`
      + `<rect x="${x}" y="${y}" width="${a}" height="${a}" fill="#a8dc80" stroke="${C.ink}" stroke-width="2"/>`
      + tx(x + a / 2, y + a / 2 + 4, '1 dm³', { size: 15 }) + tx(x + a / 2, y + a / 2 + 22, '= 1 l', { size: 13, fill: C.soft })
      + tx(x + a / 2, y + a + 18, '10 cm', { size: 12, fill: C.soft });
  };
  const s = cube(60, 60) + cube(230, 60) + tx(198, 104, '+', { size: 24, fill: C.pond }) + pill(200, 190, '2 dm³ = 2 l', { size: 16, stroke: C.pond });
  return figure(400, 202, s, 'Kaksi litran kuutiota: 2 dm³ = 2 l');
};

/** A cubic decimetre holds one litre. */
export const DRAW: Record<string, () => PageDraw> = {
  'M-UNIT-06': () => ({ beats: [undefined, twoCubes()] }),
};
