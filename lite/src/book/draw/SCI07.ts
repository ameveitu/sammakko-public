import type { PageDraw } from '../pages';
import { bars, cards, flow, stateChanges, states, table } from '../figures';

const SOAK = (o: { pick?: boolean; note?: string } = {}) => bars({
  bars: [{ label: 'pala A', value: 0, text: '0 %', ...(o.pick ? { sub: 'ei ime ✓' } : {}) }, { label: 'pala B', value: 22, text: '22 %', ...(o.pick ? { sub: 'imee ✗' } : {}) }, { label: 'pala C', value: 0, text: '0 %', ...(o.pick ? { sub: 'ei ime ✓' } : {}) }],
  max: 25, axis: 'imi vettä (%)', ...(o.note ? { note: o.note } : {}), label: 'Pala A imi vettä 0 %, B 22 %, C 0 %',
});

/** Materials and states: the same test for every piece, properties vs opinions, states of water. */
export const DRAW: Record<string, () => PageDraw> = {
  'ENV-CHEM-MATERIAL-ID-01': () => ({ beats: [
    table({ head: ['', 'imee vettä?', 'taipuu?', 'valo läpi?'], rows: [['puu', '?', '?', '?'], ['metalli', '?', '?', '?'], ['lasi', '?', '?', '?']], label: 'Kolme palaa, samat kolme koetta' }),
    table({ head: ['', 'imee vettä?', 'taipuu?', 'valo läpi?'], rows: [['puu', '✓', '', ''], ['metalli', '✗', '✓', '✗'], ['lasi', '✗', '✗', '✓']], label: 'Puu imee vettä, metalli taipuu, lasi päästää valoa' }),
    table({ head: ['', 'imee vettä?', 'taipuu?', 'valo läpi?'], rows: [['pala A', '✗', '19 mm', '✗'], ['metalli', '✗', '✓', '✗']], mark: 0, label: 'Pala A taipuu eikä päästä valoa: metallia' }),
  ] }),
  'ENV-CHEM-MATERIAL-COMPARE-01': () => ({ beats: [
    SOAK(),
    SOAK({ pick: true, note: 'A ja C sopivat kanneksi yhtä hyvin' }),
    cards({ cards: [{ icon: '📏', title: 'sama ominaisuus', tone: 'cool' }, { icon: '🧪', title: 'sama koe', tone: 'cool' }, { icon: '🎯', title: 'käyttötarkoitus ratkaisee', tone: 'plain' }], label: 'Vertaa samaa ominaisuutta samalla kokeella' }),
  ] }),
  'ENV-CHEM-MATERIAL-01': () => ({ beats: [
    cards({ cards: [{ icon: '🟫', title: 'pala A' }, { icon: '🟫', title: 'pala B' }, { icon: '🟫', title: 'pala C' }], label: 'Kolme palaa, sama vesikoe' }),
    SOAK({ pick: true, note: 'B imee vettä: puuta, ei kanneksi' }),
    cards({ cards: [{ icon: '📏', title: 'mitattu ominaisuus', mark: 'ok' }, { icon: '🎨', title: 'muoto tai väri', mark: 'no' }], label: 'Valinta perustellaan mitatulla ominaisuudella' }),
  ] }),
  'ENV-CHEM-PROP-01': () => ({ beats: [
    cards({ cards: [{ icon: '📏', title: '”taipuu 6 mm”', text: 'kuka tahansa voi mitata', tone: 'cool' }], label: 'Mitattava havainto kertoo ominaisuudesta' }),
    cards({ cards: [{ icon: '📏', title: '”taipuu 6 mm”', text: 'ominaisuus', mark: 'ok' }, { icon: '💭', title: '”kiiltävä on paras”', text: 'mielipide', mark: 'no' }], label: 'Mielipide ei kerro materiaalin ominaisuutta' }),
    cards({ cards: [{ icon: '🔆', title: 'läpinäkyvyys', text: 'paljonko valoa pääsee läpi' }, { icon: '💎', title: 'kovuus', text: 'naarmuuntuuko pinta' }], label: 'Ominaisuudet tarkistetaan kokeella' }),
  ] }),
  'ENV-CHEM-STATE-01': () => ({ beats: [
    states({ boxes: [{ state: 'solid', title: 'jää', note: 'muoto ja koko pysyvät' }], label: 'Jää pitää muotonsa: kiinteä aine' }),
    states({ boxes: [{ state: 'liquid', title: 'vesi', note: 'astian muotoon' }, { state: 'gas', title: 'vesihöyry', note: 'täyttää astian' }], label: 'Neste ottaa astian muodon, kaasu täyttää astian' }),
    states({ boxes: [{ state: 'solid', title: 'kiinteä', note: 'ei puristu' }, { state: 'liquid', title: 'neste', note: 'ei puristu' }, { state: 'gas', title: 'kaasu', note: 'puristuu' }], label: 'Vain kaasua voi puristaa kokoon' }),
  ] }),
  'ENV-CHEM-STATECHANGE-01': () => ({ beats: [
    states({ boxes: [{ state: 'solid', title: 'jää' }, { state: 'liquid', title: 'vesi', note: '+8 °C' }], arrow: 'sulaminen', label: 'Jää sulaa vedeksi' }),
    stateChanges('Jäätyminen, haihtuminen ja tiivistyminen'),
    cards({ cards: [{ icon: '💧', title: 'vesi pysyy vetenä', tone: 'cool' }, { icon: '⚖️', title: 'massa ei muutu', tone: 'cool' }], label: 'Olomuodon muutoksessa massa säilyy' }),
  ] }),
  'CHEM79-SUBSTANCE-01': () => ({ beats: [
    flow({ steps: [{ icon: '📦', text: 'laatikko', sub: 'esine' }, { icon: '🪵', text: 'puu', sub: 'materiaali' }], label: 'Esine ja sen materiaali' }),
    flow({ steps: [{ icon: '📦', text: 'laatikko', sub: 'esine' }, { icon: '🪵', text: 'puu', sub: 'materiaali' }, { icon: '🧪', text: 'selluloosa', sub: 'kemiallinen aine' }], label: 'Esine, materiaali ja kemiallinen aine' }),
    flow({ steps: [{ icon: '🔩', text: 'teräsruuvi', sub: 'esine' }, { icon: '⚙️', text: 'teräs', sub: 'materiaali' }, { icon: '🧪', text: 'rauta ja hiili', sub: 'aineet' }], label: 'Teräsruuvi, teräs, rauta ja hiili' }),
  ] }),
};
