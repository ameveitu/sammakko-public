import type { PageDraw } from '../pages';
import { bars, flow, table } from '../figures';

/** Decimal bookkeeping: what arrives is added, what leaves is subtracted. */
export const DRAW: Record<string, () => PageDraw> = {
  'M-DEC-07': () => ({ beats: [
    bars({ bars: [{ label: 'alussa', value: 1.38, text: '1,38 l' }, { label: 'saapuu', value: 0.49, text: '+ 0,49 l', color: '#3f9c5a' }, { label: 'nyt', value: 1.87, text: '1,87 l', mark: true }], max: 2, axis: 'litraa', label: '1,38 + 0,49 = 1,87 litraa' }),
    flow({ steps: [{ icon: '🛢️', text: '1,38 l', sub: 'alussa' }, { icon: '⬇️', text: '1,87 l', sub: 'saapui 0,49' }, { icon: '⬆️', text: '0,40 l', sub: 'lähti 1,47', mark: 'hot' }], label: 'Saapuva lisätään, lähtevä vähennetään' }),
  ] }),
  'M-DEC-04': () => ({ beats: [undefined, undefined,
    table({ head: ['kokonaiset', 'kymmenesosat', 'sadasosat', 'tuhannesosat'], rows: [['1', '0', '0', '7']], label: 'Luku 1,007 paikka kerrallaan' }),
  ] }),
};
