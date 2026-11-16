import type { PageDraw } from '../pages';
import { beakers, cards, conduction, convection, flow, heatFlow, heatRoutes, radiation } from '../figures';

/** Heat: energy moves from warmer to cooler by conduction, convection and radiation. */
export const DRAW: Record<string, () => PageDraw> = {
  'ENV-PHY-THERMAL-01': () => ({ beats: [
    heatFlow({ a: { t: 35, name: 'kallion pinta' }, b: { t: 15, name: 'eväskivi' }, label: 'Kallion pinta 35 °C, eväskivi 15 °C' }),
    heatFlow({ a: { t: 35, name: 'kallion pinta' }, b: { t: 15, name: 'eväskivi' }, note: 'energiaa lämpimästä kylmempään', label: 'Energiaa siirtyy lämpimästä kallion pinnasta kiveen' }),
    heatFlow({ a: { t: 80, name: 'kuuma kuppi' }, b: { t: 20, name: 'viileä ilma' }, label: 'Kuppi jäähtyy: energiaa siirtyy kupista ilmaan' }),
  ] }),
  'ENV-PHY-TEMP-01': () => ({ beats: [
    flow({ steps: [{ icon: '🌡️', text: 'mittari veteen' }, { icon: '⏳', text: 'odota', sub: 'lukema muuttuu' }, { icon: '📋', text: 'kirjaa', sub: 'kun lukema pysyy' }], label: 'Lukema kirjataan vasta, kun se ei enää muutu' }),
    cards({ cards: [{ icon: '☕', title: 'kuppi 1', text: '18 °C' }, { icon: '☕', title: 'kuppi 2', text: '23 °C', mark: 'ok' }], label: 'Suurempi lukema on lämpimämpi: 23 °C' }),
  ] }),
  'PHY79-TEMP-HEAT': () => ({ beats: [
    beakers({ items: [{ name: 'A', mass: '80 g', level: 0.4, t0: 15, t1: 23 }, { name: 'B', mass: '160 g', level: 0.8, t0: 15, t1: 23 }], label: 'A 80 g ja B 160 g, molemmat 15 °C → 23 °C' }),
    beakers({ items: [{ name: 'A', mass: '80 g', level: 0.4, t0: 15, t1: 23, energy: '2688 J' }, { name: 'B', mass: '160 g', level: 0.8, t0: 15, t1: 23, energy: '5376 J' }], label: 'B tarvitsee kaksi kertaa enemmän energiaa' }),
    cards({ cards: [{ icon: '🌡️', title: 'lämpötila', text: 'kuinka lämmintä aine on', tone: 'cool' }, { icon: '🔥', title: 'lämpö', text: 'siirtyvää energiaa', tone: 'warm' }], label: 'Lämpötila ja lämpö ovat eri asioita' }),
  ] }),
  'PHY79-HEATFLOW': () => ({ beats: [
    heatFlow({ a: { t: 45, name: 'A' }, b: { t: 15, name: 'B' }, rod: true, label: 'A 45 °C ja B 15 °C, sauva välissä: energiaa A:sta B:hen' }),
    heatFlow({ a: { t: 45, name: 'A' }, b: { t: 15, name: 'B' }, rod: true, end: 30, label: 'Lämpötilat lähenevät, kunnes ne ovat yhtä suuret' }),
    cards({ cards: [{ icon: '❄️', title: 'kylmyys virtaa', mark: 'no' }, { icon: '🔥', title: 'energia lämpimästä kylmempään', mark: 'ok' }], label: 'Vain energia siirtyy, aina lämpimämmästä kylmempään' }),
  ] }),
  'PHY79-HEAT-CONDUCTION': () => ({ beats: [
    conduction({ rods: [{ name: 'silta A', reach: 0.3 }, { name: 'silta B', reach: 0.3 }], hot: '60 °C', cold: '20 °C', label: 'Kaksi siltaa samojen päiden välillä, vain aine vaihtuu' }),
    conduction({ rods: [{ name: 'silta A · johtaa 4 × paremmin', reach: 0.92 }, { name: 'silta B', reach: 0.3 }], hot: '60 °C', cold: '20 °C', label: 'Samassa ajassa A:n viileä pää lämpenee enemmän' }),
    cards({ cards: [{ icon: '🔩', title: 'metallit', text: 'johtavat hyvin', tone: 'warm' }, { icon: '🪵', title: 'puu', text: 'johtaa huonosti', tone: 'cool' }, { icon: '💨', title: 'ilma', text: 'johtaa huonosti', tone: 'cool' }], label: 'Metallit johtavat lämpöä hyvin, puu ja ilma huonosti' }),
  ] }),
  'PHY79-HEAT-CONVECTION': () => ({ beats: [
    convection({ warm: '25 °C', cool: '10 °C', label: 'Lämmin puoli 25 °C, viileä 10 °C: merkkihiukkaset kiertävät' }),
    convection({ warm: '25 °C', cool: '10 °C', label: 'Lämmin ilma nousee, viileä laskeutuu: kuljettuminen' }),
    cards({ cards: [{ icon: '💧', title: 'nesteet', mark: 'ok' }, { icon: '💨', title: 'kaasut', mark: 'ok' }, { icon: '🧱', title: 'kiinteä aine', text: 'ei virtaa', mark: 'no' }], label: 'Kuljettumista tapahtuu nesteissä ja kaasuissa' }),
  ] }),
  'PHY79-HEAT-RADIATION': () => ({ beats: [
    radiation({ source: 'fire', label: 'Kaksi kiveä yhtä kaukana, toisen edessä varjostin' }),
    radiation({ source: 'fire', label: 'Avoin kivi lämpenee, varjostettu ei saa säteilyä' }),
    radiation({ source: 'sun', space: true, label: 'Säteily kulkee myös tyhjiössä' }),
  ] }),
  'PHY79-HEAT-MECH': () => ({ beats: [
    heatRoutes('Mökissä energia siirtyy kolmea reittiä yhtä aikaa'),
    heatRoutes('Johtuminen seinässä, kuljettuminen ilmassa, säteily lähteestä'),
    cards({ cards: [{ icon: '❄️', title: 'kylmyys virtaa', mark: 'no' }, { icon: '🔥', title: 'lämpimästä kylmempään', mark: 'ok' }], label: 'Kaikissa reiteissä energia siirtyy lämpimämmästä kylmempään' }),
  ] }),
};
