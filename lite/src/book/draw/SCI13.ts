import type { PageDraw } from '../pages';
import { bars, cards, decay, formula, hazards, spectrum } from '../figures';

/** Radiation: photons and particles, the ionising limit, and exposure = rate · time · share let through. */
export const DRAW: Record<string, () => PageDraw> = {
  'PHY79-RAD-EM': () => ({ beats: [
    cards({ cards: [{ icon: '📻', title: 'radio' }, { icon: '🌡️', title: 'lämpökamera' }, { icon: '💡', title: 'valo' }, { icon: '🦷', title: 'röntgen' }], label: 'Kaikki käyttävät sähkömagneettista säteilyä' }),
    spectrum({ label: 'Fotonin energia kasvaa radioaalloista gammaan' }),
    cards({ cards: [{ icon: '✨', title: 'sähkömagneettinen', text: 'fotoneja, ei ainetta', tone: 'cool' }, { icon: '⚛️', title: 'hiukkassäteily', text: 'ainehiukkasia', tone: 'warm' }], label: 'Säteily luokitellaan sen mukaan, mistä se koostuu' }),
  ] }),
  'PHY79-RAD-PARTICLE': () => ({ beats: [
    decay({ kind: 'beta', label: 'Ytimestä sinkoutuu elektroni: beetasäteily' }),
    decay({ kind: 'alpha', label: 'Alfahiukkanen: 2 protonia ja 2 neutronia' }),
    cards({ cards: [{ icon: '⚛️', title: 'hiukkanen', text: 'on massa', tone: 'warm' }, { icon: '✨', title: 'fotoni', text: 'ei massaa', tone: 'cool' }], label: 'Hiukkasilla on massa, fotoneilla ei' }),
  ] }),
  'PHY79-RAD-ION-CLASS': () => ({ beats: [
    bars({ bars: [{ label: 'UV-fotoni', value: 4, text: '4 eV' }], max: 14, line: { at: 10, text: 'raja 10 eV' }, axis: 'energia (eV)', label: 'UV 4 eV jää rajan 10 eV alle' }),
    bars({ bars: [{ label: 'UV-fotoni', value: 4, text: '4 eV' }, { label: 'röntgenfotoni', value: 14, text: '1000 eV ↑', mark: true }], max: 14, line: { at: 10, text: 'raja 10 eV' }, axis: 'energia (eV)', note: 'röntgenin pylväs jatkuisi kauas ylös', label: 'Röntgen 1000 eV ylittää rajan' }),
    spectrum({ ionizing: true, label: 'Ionisoimaton ja ionisoiva säteily' }),
  ] }),
  'PHY79-RAD-ION-SAFETY': () => ({ beats: [
    cards({ cards: [{ icon: '🧬', title: 'voi rikkoa perimää', tone: 'warm' }, { icon: '⬇️', title: 'altistus pieneksi', tone: 'cool' }], label: 'Ionisoivalle säteilylle altistutaan mahdollisimman vähän' }),
    bars({ bars: [{ label: 'A', value: 24, text: '8 · 3 · 1 = 24' }, { label: 'B, suoja', value: 20, text: '8 · 5 · 0,5 = 20', mark: true }, { label: 'C', value: 32, text: '8 · 4 · 1 = 32' }], max: 36, axis: 'altistus', label: 'Suojattu reitti B: pienin altistus' }),
    formula({ lines: ['8 · 5 · 0,5 = 20', 'ilman suojaa 8 · 5 · 1 = 40'], note: 'suoja päästää puolet: altistus puolittuu', label: 'Puolet läpäisevä suoja puolittaa altistuksen' }),
  ] }),
  'PHY79-RAD-ION': () => ({ beats: [
    cards({ cards: [{ icon: '⚛️', title: 'ionisoivuus', text: 'rikkooko atomeja' }, { icon: '⏱️', title: 'altistus', text: 'voimakkuus ja aika' }], label: 'Riskiin vaikuttavat ionisoivuus ja altistus' }),
    cards({ cards: [{ icon: '🦷', title: 'hammasröntgen', text: 'ionisoiva', tone: 'warm' }, { icon: '🤏', title: 'pieni annos', text: 'hetken kuvaus', tone: 'cool' }, { icon: '⚖️', title: 'vain tarpeeseen', text: 'hyöty > riski', mark: 'ok' }], label: 'Röntgenkuva otetaan vain tarpeeseen' }),
    cards({ cards: [{ icon: '☀️', title: 'liika UV', text: 'ionisoimaton, polttaa silti', tone: 'warm' }, { icon: '🔎', title: 'arvioi', text: 'laji ja altistus', tone: 'cool' }], label: 'Turvallisuus arvioidaan lajin ja altistuksen perusteella' }),
  ] }),
  'PHY79-RAD-SAFE': () => ({ beats: [
    bars({ bars: [{ label: 'A', value: 25, text: '5 · 5 · 1 = 25' }, { label: 'B, suoja', value: 8.75, text: '5 · 7 · 0,25 = 8,75', mark: true }, { label: 'C', value: 30, text: '5 · 6 · 1 = 30' }], max: 34, axis: 'altistus (malliyksikköä)', label: 'Suojattu reitti B on pisin, mutta altistus pienin' }),
    cards({ cards: [{ icon: '⏱️', title: 'lyhyempi aika' }, { icon: '📏', title: 'suurempi etäisyys' }, { icon: '🧱', title: 'suoja välissä', text: 'lyijy, betoni' }], label: 'Kolme keinoa pienentää altistusta' }),
    hazards({ kinds: ['radiation'], label: 'Tuntematon lähde: pysy erossa ja pyydä asiantuntija' }),
  ] }),
};
