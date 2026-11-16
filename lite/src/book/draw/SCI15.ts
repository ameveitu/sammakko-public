import type { PageDraw } from '../pages';
import { bars, cards, table } from '../figures';

/** Solubility depends on the solvent, and it says nothing about safety. */
export const DRAW: Record<string, () => PageDraw> = {
  'CHEM79-WATERFAT-SOL': () => ({ beats: [
    bars({ bars: [{ label: 'vesi', value: 800, text: 'enintään 800 mg' }, { label: 'rasva', value: 200, text: 'enintään 200 mg', color: '#e0a83a' }], max: 1000, axis: 'liukenee', line: { at: 700, text: 'lisätty 700 mg' }, label: 'Veteen liukenee 800 mg, rasvaan 200 mg' }),
    cards({ cards: [{ icon: '🍊', title: 'C-vitamiini', text: 'liukenee veteen', tone: 'cool' }, { icon: '🐟', title: 'D-vitamiini', text: 'liukenee rasvaan', tone: 'warm' }], label: 'Eri aineet, eri liuottimet' }),
    cards({ cards: [{ icon: '🧪', title: 'kertoo', text: 'mihin ja kuinka paljon liukenee', mark: 'ok' }, { icon: '⚠️', title: 'ei kerro', text: 'onko aine vaarallinen', mark: 'no' }], label: 'Liukoisuus ei kerro vaarallisuudesta' }),
  ] }),
  'CHEM79-PURE-MIX': () => ({ beats: [undefined,
    cards({ cards: [{ icon: '💧', title: 'puhdas vesi', text: 'yksi aine', tone: 'cool' }, { icon: '💧', title: 'sokerivesi', text: 'kaksi ainetta: seos', tone: 'warm' }], label: 'Näyttävät samalta, mutta sokerivesi on seos' }),
  ] }),
  'CHEM79-MIX-HOM': () => ({ beats: [undefined,
    cards({ cards: [{ icon: '🏖️', title: 'hiekka vedessä', text: 'osat erottuvat' }, { icon: '🛢️', title: 'öljy veden päällä', text: 'kerrokset erottuvat' }], label: 'Sekakoosteinen: osat erottuvat' }),
    cards({ cards: [{ icon: '🥛', title: 'maito', text: 'rasvapisaroita veden seassa', tone: 'cool' }, { icon: '🔍', title: 'emulsio', text: 'näyttää tasaiselta, on sekakoosteinen', tone: 'warm' }], label: 'Maito on emulsio' }),
  ] }),
  'CHEM79-DECANTING': () => ({ beats: [undefined,
    cards({ cards: [{ icon: '🥄', title: 'juuri sekoitettu', text: 'hiekka valuu mukaan', mark: 'no' }, { icon: '⏳', title: 'laskeutunut', text: 'kaada varovasti', mark: 'ok' }], label: 'Ensin laskeutuminen, sitten kaataminen' }),
    cards({ cards: [{ icon: '🫗', title: 'kaadettu vesi', text: 'sokeria' }, { icon: '🫙', title: 'pohjalle jäänyt vesi', text: 'sokeria' }, { icon: '🏖️', title: 'hiekka', text: 'pohjalla', tone: 'plain' }], label: 'Liuennut sokeri on kummassakin vedessä' }),
  ] }),
  'CHEM79-SEPARATE-02': () => ({ beats: [undefined,
    cards({ cards: [{ icon: '☕', title: 'suodatus', text: 'isot rakeet jäävät suodattimeen' }, { icon: '🫗', title: 'dekantointi', text: 'neste kaadetaan sakan päältä' }], label: 'Suodatus ja dekantointi' }),
    table({ head: ['menetelmä', 'käyttää'], rows: [['suodatus', 'hiukkasten kokoa'], ['dekantointi', 'laskeutumista'], ['haihdutus', 'haihtumista']], label: 'Jokainen menetelmä käyttää eri ominaisuutta' }),
  ] }),
};
