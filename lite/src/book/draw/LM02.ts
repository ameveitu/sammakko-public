import type { PageDraw } from '../pages';
import { cards, bars, flow, formula, sequence, table } from '../figures';

/** Showing how you know: a sum with its reason, two routes to 41, a message the reader can use. */
export const DRAW: Record<string, () => PageDraw> = {
  'M-REP-03': () => ({ beats: [
    cards({ cards: [{ icon: '🔺', title: '2 isoa kiilaa' }, { icon: '🔸', title: '4 pientä kiilaa' }, { icon: '⛺', title: '2 + 4 = 6', tone: 'cool' }], label: 'Teltalle 2 isoa ja 4 pientä kiilaa' }),
    formula({ lines: ['isot + pienet = kaikki', '2 + 4 = 6 kiilaa'], note: 'selitys kertoo, miksi lasketaan yhteen', label: 'Selitys: kysytään kaikkia, joten lasketaan yhteen' }),
  ] }),
  'M-PS-04': () => ({ beats: [
    sequence({ values: [22, 32, 41], steps: ['+ 10', '+ 9'], label: 'Aava: ensin kymppi, sitten ykköset' }),
    sequence({ values: [22, 42, 41], steps: ['+ 20', '− 1'], label: 'Loikka: tasakympit ja yksi pois' }),
    table({ head: ['', 'Aava', 'Loikka'], rows: [['askeleet', '+10 ja +9', '+20 ja −1'], ['yhteensä', '+19', '+19'], ['tulos', '41', '41']], mark: 1, label: 'Kumpikin lisää 19, tulos on sama' }),
  ] }),
  'M-REP-05': () => ({ beats: [
    cards({ cards: [{ icon: '📝', title: 'lappu', text: '”2 m”' }, { icon: '🖼️', title: 'kuva', text: 'kaksi metrin palaa peräkkäin' }], label: 'Kaksi viestiä samasta köydestä' }),
    cards({ cards: [{ icon: '📝', title: 'lappu', text: 'Majava ei käytä numeroita', tone: 'plain' }, { icon: '🖼️', title: 'kuva', text: 'Majava voi tarkistaa itse', mark: 'ok' }], label: 'Kuva sopii Majavalle paremmin' }),
  ] }),
  'M-PS-01': () => ({ beats: [
    cards({ cards: [{ icon: '🪢', title: 'köysi 15 m', text: 'annettu tieto' }, { icon: '⛺', title: 'telttaan 6 m', text: 'annettu tieto' }], label: 'Kaksi annettua tietoa' }),
  ] }),
  'M-PS-02': () => ({ beats: [
    bars({ bars: [{ label: '4 palaa', value: 8, text: '8' }], max: 12, axis: 'painoyksiköitä', line: { at: 10, text: 'tavoite 10' }, label: 'Ensimmäinen koe: 4 palaa antaa 8' }),
  ] }),
  'M-REP-01': () => ({ beats: [
    flow({ steps: [{ icon: '🍪', text: '6 evästä' }, { icon: '🪨', text: '6 kiveä', sub: 'yksi kivi joka evästä kohden' }], label: 'Yksi kivi jokaista evästä kohden' }),
  ] }),
  'M-REP-02': () => ({ beats: [
    cards({ cards: [{ icon: '🍪', title: '1 eväs' }, { icon: '⚪', title: '1 pallo', text: 'piirroksessa', tone: 'cool' }], label: 'Piirroksessa yksi pallo on yksi eväs' }),
  ] }),
  'M-PS-03': () => ({ beats: [
    bars({ bars: [{ label: 'yksi eväs kerrallaan', value: 12, text: '12 matkaa', color: '#d9534f' }], max: 14, axis: 'matkoja', line: { at: 4, text: 'enintään 4' }, label: 'Yksi kerrallaan: 12 matkaa on liikaa' }),
  ] }),
  'M-PS-05': () => ({ beats: [
    cards({ cards: [{ icon: '🧺', title: '4 koria' }, { icon: '🍪', title: '4–6 evästä', text: 'joka korissa' }, { icon: '💬', title: 'Loikka: 60?', tone: 'warm' }], label: 'Onko 60 evästä mahdollista?' }),
  ] }),
  'M-PS-06': () => ({ beats: [
    cards({ cards: [{ icon: '📦', title: 'alussa 15 tappia' }, { icon: '⛺', title: 'käytettiin 4' }, { icon: '🧮', title: 'Loikka: 15 + 4 = 19', tone: 'warm' }], label: 'Loikan lasku: 15 + 4 = 19' }),
  ] }),
};
