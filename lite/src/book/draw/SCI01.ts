import type { PageDraw } from '../pages';
import { C, figure, table, tx } from '../figures';

/** A pine cone, which has no emoji of its own. */
const CONE = (x: number, y: number) => `<ellipse cx="${x}" cy="${y}" rx="8" ry="12" fill="#9a6a3a" stroke="#5e3d1e" stroke-width="1.5"/><path d="M${x - 7} ${y - 4}l14 6M${x - 7} ${y + 4}l14 -6M${x - 6} ${y - 9}l12 6" stroke="#5e3d1e" stroke-width="1.2" fill="none"/>`;
type Find = string | ((x: number, y: number) => string);

/** A picture chart: places on top, one mark per find stacked under each place. */
const pictograph = (cols: { place: string; find: Find; n: number }[], label: string) => {
  const step = 360 / cols.length;
  let s = '';
  cols.forEach((c, i) => {
    const x = 20 + step * (i + 0.5);
    s += `<rect x="${x - 48}" y="14" width="96" height="30" rx="8" fill="${C.cool}" stroke="${C.blue}" stroke-width="2"/>` + tx(x, 35, c.place, { size: 15 })
      + `<line x1="${x}" y1="50" x2="${x}" y2="186" stroke="${C.line}" stroke-dasharray="3 5"/>`;
    for (let k = 0; k < c.n; k++) {
      const y = 70 + k * 32;
      s += `<rect x="${x - 17}" y="${y - 15}" width="34" height="30" rx="8" fill="${C.paper}"/>`
        + (typeof c.find === 'string' ? tx(x, y + 8, c.find, { size: 22 }) : c.find(x, y));
    }
  });
  return figure(400, 190, s, label);
};

/** Recording and presenting what was seen on a trip. */
export const DRAW: Record<string, () => PageDraw> = {
  'SCI-ENV-PRESENT-DATA-01': () => ({
    beats: [
      pictograph([{ place: 'ranta', find: '🐚', n: 3 }, { place: 'metsä', find: CONE, n: 1 }], 'Paikat ylös, löydöt niiden alle'),
      pictograph([{ place: 'niitty', find: '🌸', n: 2 }, { place: 'kallio', find: '🪨', n: 1 }, { place: 'ranta', find: '🐚', n: 3 }], 'Kuvasta näkyy mitä, missä ja kuinka monta'),
    ],
    try: pictograph([{ place: 'metsä', find: '🍄', n: 4 }, { place: 'niitty', find: '🌸', n: 1 }, { place: 'ranta', find: '🐚', n: 2 }], 'Aavan retken löydöt'),
  }),
  'SCI-ENV-RECORD-01': () => ({
    beats: [
      table({ head: ['paikka', 'löydöt', 'määrä'], rows: [['niitty', '🌸 kukka', '2'], ['kallio', '🪨 kivi', '1'], ['ranta', '🐚 simpukka', '3']], label: 'Vihkoon heti: paikka, löytö ja määrä' }),
      pictograph([{ place: 'niitty', find: '🌸', n: 2 }, { place: 'kallio', find: '🪨', n: 1 }, { place: 'ranta', find: '🐚', n: 3 }], 'Vihkosta kuva, jonka kaikki näkevät'),
    ],
  }),
};
