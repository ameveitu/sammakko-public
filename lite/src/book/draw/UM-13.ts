import type { PageDraw } from '../pages';
import { C, cards, figure, pill, table, tx } from '../figures';

const r1 = (v: number) => Math.round(v * 10) / 10;

/** Two lines meeting at a right angle, with the little square that marks 90°. */
const perpendicular = () => figure(400, 190,
  `<line x1="70" y1="104" x2="330" y2="104" stroke="${C.ink}" stroke-width="3"/>` +
  `<line x1="200" y1="24" x2="200" y2="176" stroke="${C.pond}" stroke-width="3"/>` +
  `<path d="M200 90h14v14" fill="none" stroke="${C.red}" stroke-width="2.5"/>` +
  tx(342, 109, 'r', { size: 18, anchor: 'start', italic: true }) + tx(212, 34, 's', { size: 18, anchor: 'start', fill: C.pond, italic: true }) +
  tx(226, 84, '90°', { size: 14, fill: C.red, anchor: 'start' }) + pill(84, 50, 'r ⊥ s', { size: 16 }),
  'Kohtisuorat suorat leikkaavat 90°:n kulmassa');

/** A hexagon cut from one corner into four triangles. */
const hexagon = () => {
  const P = Array.from({ length: 6 }, (_, k) => { const a = Math.PI + k * Math.PI / 3; return [r1(200 + 80 * Math.cos(a)), r1(92 + 80 * Math.sin(a))] as const; });
  let s = '';
  for (let i = 1; i < 5; i++) {
    const a = P[0]!, b = P[i]!, c = P[i + 1]!;
    s += `<path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}L${c[0]} ${c[1]}Z" fill="${i % 2 ? C.cool : C.warm}" stroke="${C.ink}" stroke-width="2" stroke-linejoin="round"/>` +
      tx(r1((a[0] + b[0] + c[0]) / 3), r1((a[1] + b[1] + c[1]) / 3 + 6), String(i), { size: 16 });
  }
  s += tx(P[0]![0] - 10, P[0]![1] + 5, 'A', { anchor: 'end', size: 15 }) + pill(200, 196, '4 kolmiota: 4 · 180° = 720°', { size: 14 });
  return figure(400, 206, s, 'Kuusikulmio jakautuu yhdestä kärjestä neljään kolmioon');
};

/** Geometry: lines, polygon angles, similarity and congruence. */
export const DRAW: Record<string, () => PageDraw> = {
  'M79-LINEREL': () => ({ beats: [undefined, undefined, perpendicular()] }),
  'M79-POLY-ANGLES': () => ({ beats: [undefined, undefined, hexagon()] }),
  'M79-SIMILARITY': () => ({ beats: [undefined, undefined,
    cards({ cards: [{ icon: '🔄', title: 'kierto', text: 'muoto ja koko säilyvät' }, { icon: '🪞', title: 'peilaus', text: 'muoto ja koko säilyvät' }, { icon: '🟰', title: 'yhtenevät', text: 'pituuskerroin 1', tone: 'cool' }], label: 'Yhtenevät kuviot: pituuskerroin 1' }),
  ] }),
  'M79-CONG-CRIT': () => ({ beats: [undefined, undefined,
    table({ head: ['tiedetään', 'riittää'], rows: [['kolme sivua', '✓'], ['kaksi sivua ja välinen kulma', '✓'], ['kaksi kulmaa ja sivu', '✓'], ['kolme kulmaa', '✗ koko ei selviä']], mark: 3, label: 'Mitkä tiedot riittävät yhtenevyyteen' }),
  ] }),
  'M79-SIMILAR-SCALE': () => ({ beats: [undefined, undefined,
    table({ head: ['', 'kerroin', 'kun k = 2'], rows: [['pituus', 'k', '2-kertainen'], ['pinta-ala', 'k²', '4-kertainen'], ['tilavuus', 'k³', '8-kertainen']], label: 'Pinta-ala k², tilavuus k³' }),
  ] }),
};
