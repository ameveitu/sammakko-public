import type { PageDraw } from '../pages';
import { bars, cards, formula, rate, table } from '../figures';

const HEAD = ['', 'lämpötila', 'pitoisuus', 'palat'];
const FAIR = (what: string) => cards({ cards: [{ icon: '1️⃣', title: `vain ${what} muuttui`, mark: 'ok' }, { icon: '2️⃣', title: 'kaksi muutosta', text: 'kumpi vaikutti?', mark: 'no' }], label: `Reilu vertailu: vain ${what} muuttui` });

/** Reaction rate: product per second, and one factor changed at a time. */
export const DRAW: Record<string, () => PageDraw> = {
  'CHEM79-REACT-PROD': () => ({ beats: [undefined,
    formula({ lines: ['hiili + happi → hiilidioksidi', 'C + O₂ → CO₂'], note: 'lähtöaineet → reaktiotuote', label: 'Hiili ja happi ovat lähtöaineita, hiilidioksidi on reaktiotuote' }),
    formula({ lines: ['vesi → vety + happi', '2 H₂O → 2 H₂ + O₂'], note: 'sähkövirran avulla: vesi on tässä lähtöaine', label: 'Vettä hajotetaan sähkövirralla: vesi on lähtöaine, vety ja happi ovat tuotteita' }),
  ] }),
  'CHEM79-CHANGE-PHYS': () => ({ beats: [undefined, undefined,
    cards({ cards: [{ icon: '🔩', title: 'rauta', text: 'alussa' }, { icon: '💧', title: 'happi ja vesi', text: 'mukana ruostumisessa' }, { icon: '🟤', title: 'ruoste', text: 'syntyy uusi aine' }], label: 'Ruostumisessa raudasta, hapesta ja vedestä syntyy ruostetta' }),
  ] }),
  'CHEM79-REACTION-01': () => ({ beats: [undefined, undefined,
    cards({ cards: [{ icon: '🪨', title: 'magnesium', text: 'alussa: metalli' }, { icon: '💨', title: 'happi', text: 'alussa: ilmasta' }, { icon: '⚪', title: 'magnesiumoksidi', text: 'lopussa: uusi valkoinen aine' }], label: 'Magnesium palaa hapessa: syntyy uutta ainetta, valkoista magnesiumoksidia' }),
  ] }),
  'CHEM79-RATE-01': () => ({ beats: [
    rate({ vary: 'temp', a: '20 °C', b: '30 °C', result: ['44 mg / 10 s', '88 mg / 10 s'], label: 'A tuottaa 44 mg ja B 88 mg kymmenessä sekunnissa' }),
    bars({ bars: [{ label: 'A', value: 44, text: '44 mg' }, { label: 'B', value: 88, text: '88 mg', mark: true }], max: 100, axis: 'tuote 10 s:ssa', label: 'B tuottaa samassa ajassa kaksi kertaa enemmän' }),
    formula({ lines: ['88 mg : 10 s = 8,8 mg/s'], note: 'reaktionopeus: tuotetta sekunnissa', label: 'Kokeen B reaktionopeus 8,8 mg/s' }),
  ] }),
  'CHEM79-RATE-FACTOR': () => ({ beats: [
    table({ head: HEAD, rows: [['A', '20 °C', '8 g/l', '1']], label: 'Koe A: 20 °C, 8 g/l, yksi pala' }),
    rate({ vary: 'temp', a: '20 °C', b: '30 °C', label: 'Lämpimässä hiukkaset liikkuvat nopeammin' }),
    FAIR('yksi asia'),
  ] }),
  'CHEM79-RATE-TEMP': () => ({ beats: [
    table({ head: HEAD, rows: [['A', '20 °C', '8 g/l', '1'], ['B', '30 °C', '8 g/l', '1']], mark: 1, label: 'Vain lämpötila eroaa' }),
    rate({ vary: 'temp', a: '20 °C', b: '30 °C', label: 'Lämpimässä hiukkaset törmäävät useammin' }),
    FAIR('lämpötila'),
  ] }),
  'CHEM79-RATE-CONC': () => ({ beats: [
    table({ head: HEAD, rows: [['A', '20 °C', '8 g/l', '1'], ['B', '20 °C', '16 g/l', '1']], mark: 1, label: 'Vain pitoisuus eroaa' }),
    rate({ vary: 'conc', a: '8 g/l', b: '16 g/l', label: 'Enemmän hiukkasia samassa tilavuudessa' }),
    FAIR('pitoisuus'),
  ] }),
  'CHEM79-RATE-SURF': () => ({ beats: [
    table({ head: HEAD, rows: [['A', '20 °C', '8 g/l', '1 pala'], ['B', '20 °C', '8 g/l', '8 palaa']], mark: 1, label: 'Sama aine, B pilkottuna' }),
    rate({ vary: 'surface', a: '1 pala', b: '8 palaa', label: 'Pienillä paloilla enemmän pintaa' }),
    cards({ cards: [{ icon: '🪵', title: 'iso halko', text: 'vähän pintaa', tone: 'plain' }, { icon: '🥢', title: 'pienet tikut', text: 'syttyvät helpommin', tone: 'warm' }], label: 'Tikut syttyvät helpommin kuin halko' }),
  ] }),
};
