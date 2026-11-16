import type { PageDraw } from '../pages';
import { bars, cards, groups } from '../figures';

/** Second beats of the problem-solving pages: what is asked, the next try, fair shares, full baskets, the fixed step. */
export const DRAW: Record<string, () => PageDraw> = {
  'M-PS-01': () => ({ beats: [undefined,
    cards({ cards: [{ icon: '🪢', title: 'köysi 15 m', text: 'annettu' }, { icon: '⛺', title: 'telttaan 6 m', text: 'annettu' }, { icon: '❓', title: 'jää ? m', text: 'kysytty: mitä jää jäljelle', tone: 'warm' }], label: 'Kysymys: montako metriä köyttä jää' }),
  ] }),
  'M-PS-02': () => ({ beats: [undefined,
    bars({ bars: [{ label: '1. koe: 4 palaa', value: 8, text: '8' }, { label: '2. koe: 5 palaa', value: 10, text: '10', mark: true }], max: 12, axis: 'painoyksiköitä', line: { at: 10, text: 'tavoite 10' }, label: 'Yksi pala lisää: 5 palaa antaa juuri 10' }),
  ] }),
  'M-REP-01': () => ({ beats: [undefined,
    groups({ sets: [{ n: 3, name: 'Aava' }, { n: 3, name: 'Loikka' }], thing: 'stone', between: ['ja'], result: '3 ja 3: tasan', label: 'Kuusi kiveä kahteen yhtä suureen ryhmään' }),
  ] }),
  'M-REP-02': () => ({ beats: [undefined,
    groups({ sets: [{ n: 3, name: 'Aava' }, { n: 3, name: 'Loikka' }], between: ['='], result: 'yhtä monta palloa', label: 'Piirroksesta näkee: ryhmät ovat yhtä suuret' }),
  ] }),
  'M-PS-03': () => ({ beats: [undefined,
    groups({ sets: [{ n: 4, name: '1. matka', cols: 2 }, { n: 4, name: '2. matka', cols: 2 }, { n: 4, name: '3. matka', cols: 2 }], thing: 'cookie', result: '3 × 4 = 12: kolme matkaa riittää', label: 'Täydet korit: 12 evästä kolmella matkalla' }),
  ] }),
  'M-PS-05': () => ({ beats: [undefined,
    bars({ bars: [{ label: 'vähintään', value: 16, text: '16' }, { label: 'enintään', value: 24, text: '24' }, { label: 'Loikka', value: 60, text: '60?', color: '#e0533f' }], max: 64, axis: 'evästä', label: 'Arvio 16–24: ehdotus 60 on aivan liian suuri' }),
  ] }),
  'M-PS-06': () => ({ beats: [undefined,
    cards({ cards: [{ icon: '🧮', title: '15 + 4 = 19', text: 'tapit eivät tule lisää', mark: 'no', tone: 'warm' }, { icon: '📦', title: '15 − 4 = 11', text: 'käytetyt lähtevät laatikosta', mark: 'ok', tone: 'cool' }], label: 'Vaihe 2 korjattu: käytetyt vähennetään' }),
  ] }),
};
