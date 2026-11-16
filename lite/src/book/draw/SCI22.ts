import type { PageDraw } from '../pages';
import { bars, cards, cycle, flow, sankey, table } from '../figures';

const SPLIT = (back: boolean) => sankey({
  input: { text: 'alumiini', value: 600 },
  outs: [{ text: 'varaosat', value: 500 }, { text: 'leikkuujäte', value: 80 }, { text: 'pöly', value: 20 }],
  unit: 'g', ...(back ? { back: { to: 1, text: '60 g takaisin raaka-aineeksi' } } : {}),
  label: back ? 'Leikkuujätteestä 60 g palaa seuraavaan erään' : '600 g alumiinia: 500 g varaosiin, 80 g leikkuujätettä, 20 g pölyä',
});

/** Sustainability: material and energy flows, life cycles and fair comparisons. */
export const DRAW: Record<string, () => PageDraw> = {
  'CHEM79-RESOURCE': () => ({ beats: [
    flow({ steps: [{ icon: '⛏️', text: 'bauksiitti' }, { icon: '⚗️', text: 'alumiinioksidi' }, { icon: '⚡', text: 'alumiini', sub: 'elektrolyysi' }, { icon: '📄', text: 'levy' }, { icon: '🏮', text: 'runko' }], label: 'Kaivoksesta lyhdyn rungoksi' }),
    flow({ steps: [{ icon: '⛏️', text: 'bauksiitti', sub: 'luonnonvara' }, { icon: '⚗️', text: 'alumiinioksidi', sub: 'välituote' }, { icon: '📄', text: 'alumiinilevy', sub: 'materiaali' }, { icon: '🏮', text: 'runko', sub: 'käyttöesine' }], label: 'Luonnonvara, välituote, materiaali, käyttöesine' }),
    flow({ steps: [{ icon: '🛢️', text: 'raakaöljy' }, { icon: '⚗️', text: 'eteeni', sub: 'krakkaus' }, { icon: '🧴', text: 'polyeteeni', sub: 'polymerointi' }, { icon: '📦', text: 'laatikko' }], label: 'Muovilaatikon ketju raakaöljystä asti' }),
  ] }),
  'CHEM79-SUSTAIN-COMPARE': () => ({ beats: [
    table({ head: ['', 'kevyt', 'huollettava'], rows: [['lyhtyjä', '4', '2 + huolto'], ['materiaali', '280 g', '264 g'], ['energia', '492 kJ', '622 kJ']], label: 'Sama palvelu: kevyt 280 g ja 492 kJ, huollettava 264 g ja 622 kJ' }),
    cards({ cards: [{ icon: '🔧', title: 'huollettava', text: 'vähemmän materiaalia', tone: 'cool' }, { icon: '🪶', title: 'kevyt', text: 'vähemmän energiaa', tone: 'warm' }], label: 'Kumpikaan ei ole paras kaikessa: valinta perustellaan tavoitteella' }),
    cards({ cards: [{ icon: '📋', title: 'vain annetut vaiheet', tone: 'plain' }, { icon: '⏳', title: 'käyttöikä voi poiketa', tone: 'plain' }], label: 'Vertailulla on rajat' }),
  ] }),
  'CHEM79-LIFECYCLE-STAGES': () => ({ beats: [
    flow({ steps: [{ icon: '⛏️', text: 'raaka-aine' }, { icon: '🏭', text: 'valmistus' }, { icon: '🚚', text: 'kuljetus' }, { icon: '🏮', text: 'käyttö' }], label: 'Raaka-aine, valmistus, kuljetus, käyttö' }),
    flow({ steps: [{ icon: '🏮', text: 'käyttö' }, { icon: '🔩', text: 'sarana hajoaa' }, { icon: '🔧', text: 'varaosa vaihdetaan' }], back: { from: 2, to: 0, text: 'sama lyhty takaisin käyttöön' }, label: 'Korjaus palauttaa saman lyhdyn käyttöön' }),
    cards({ cards: [{ icon: '🤝', title: 'uudelleenkäyttö', text: 'ehjä lyhty uudelle käyttäjälle', tone: 'cool' }, { icon: '♻️', title: 'kierrätys', text: 'materiaali uuden tuotteen raaka-aineeksi', tone: 'plain' }], label: 'Käytön jälkeen: uudelleenkäyttö tai kierrätys' }),
  ] }),
  'CHEM79-LIFECYCLE-FLOWS': () => ({ beats: [
    SPLIT(false),
    SPLIT(true),
    cards({ cards: [{ icon: '🌫️', title: 'osa häviää', tone: 'warm' }, { icon: '🧪', title: 'sekoittunut aines', text: 'voi heikentää laatua', tone: 'warm' }], label: 'Talteenotto ei ole täydellistä' }),
  ] }),
  'CHEM79-LIFECYCLE': () => ({ beats: [
    cycle({ steps: [{ icon: '🏮', text: 'käyttö' }, { icon: '🔩', text: 'sarana hajoaa' }, { icon: '🔧', text: 'varaosa', sub: '20 g' }], hot: 2, label: 'Varaosa vaihdetaan, ja sama lyhty palaa käyttöön' }),
    cards({ cards: [{ icon: '🔧', title: 'korjaus', text: '20 g varaosa', mark: 'ok' }, { icon: '🆕', title: 'uusi lyhty', text: 'raaka-aineesta alkaen', tone: 'warm' }], label: 'Pieni varaosa voi korvata kokonaan uuden lyhdyn' }),
    flow({ steps: [{ icon: '🏭', text: 'varaosan valmistus' }, { icon: '🗑️', text: 'siitäkin jätettä' }], label: 'Korjauskaan ei ole vaikutukseton' }),
  ] }),
  'CHEM79-SUSTAIN-MATTER-FLOW': () => ({ beats: [
    sankey({ input: { text: 'leikkuujäte', value: 80 }, outs: [{ text: 'talteen, sulatetaan', value: 60 }, { text: 'häviää', value: 20, color: '#c8bfa8' }], unit: 'g', label: '80 g leikkuujätteestä 3/4 eli 60 g palaa raaka-aineeksi' }),
    cards({ cards: [{ icon: '✨', title: 'puhdas alumiini', text: 'palaa samaan laatuun', mark: 'ok' }, { icon: '🎨', title: 'pinnoitettu tai seostettu', text: 'vaikeampi', mark: 'no' }], label: 'Materiaalit lajitellaan siellä, missä jäte syntyy' }),
    flow({ steps: [{ icon: '✂️', text: 'tarkempi leikkaus' }, { icon: '📉', text: 'vähemmän jätettä' }, { icon: '♻️', text: 'loput kierrätykseen' }], label: 'Parasta on, ettei jätettä synny' }),
  ] }),
  'CHEM79-SUSTAIN-ENERGY-FLOW': () => ({ beats: [
    sankey({ input: { text: 'ostettu energia', value: 600 }, outs: [{ text: 'muotoilu (hyöty)', value: 200 }, { text: 'lämpö ympäristöön', value: 400 }], unit: 'kJ', label: '600 kJ: 200 kJ muotoiluun, 400 kJ lämpönä ympäristöön' }),
    bars({ bars: [{ label: 'ennen eristystä', value: 600, text: '600 kJ' }, { label: 'katto eristetty', value: 500, text: '500 kJ', mark: true }], max: 700, axis: 'ostoenergia (kJ)', label: 'Eristys pienentää ostoenergiaa 600 kJ:sta 500 kJ:een' }),
    cards({ cards: [{ icon: '🚿', title: 'pesuveden lämmitys', mark: 'ok' }, { icon: '🔥', title: 'takaisin uunin työksi', mark: 'no' }], label: 'Talteen otettu lämpö kelpaa matalampaan lämpötilaan' }),
  ] }),
  'CHEM79-SUSTAIN': () => ({ beats: [
    cards({ cards: [{ icon: '💡', title: 'sama palvelu', text: 'valaistus 12 retki-illalle', tone: 'cool' }, { icon: '📦', title: 'kaikki mukaan', text: 'esineet, korjaukset, materiaali, energia', tone: 'plain' }], label: 'Kestävyyttä verrataan saman palvelun mukaan' }),
    cards({ cards: [{ icon: '📦', title: 'malli 1', text: 'vähemmän materiaalia', tone: 'plain' }, { icon: '⚡', title: 'malli 2', text: 'vähemmän energiaa', tone: 'plain' }, { icon: '🎯', title: 'tavoite ratkaisee', tone: 'cool' }], label: 'Kun kumpikaan ei ole paras kaikessa, valinta perustellaan tavoitteella' }),
    flow({ steps: [{ icon: '⏳', text: 'käyttöikä lyhyempi' }, { icon: '🏮', text: 'esineitä enemmän' }, { icon: '🔄', text: 'tulos voi kääntyä' }], label: 'Epävarmuus kuuluu perusteluun' }),
  ] }),
};
