import type { PageDraw } from '../pages';
import { bars, cards, chain, formula, molecule, table, triglyceride } from '../figures';

/** Carbon compounds and nutrients: the group is decided by structure, not by taste or state. */
export const DRAW: Record<string, () => PageDraw> = {
  'CHEM79-CARBON': () => ({ beats: [
    table({ head: ['aine', 'kaava', 'hiiliatomeja'], rows: [['glukoosi', 'C₆H₁₂O₆', '6'], ['asetoni', 'C₃H₆O', '3']], label: 'Kaavasta näkee hiilen merkin C' }),
    cards({ cards: [{ icon: '✏️', title: 'grafiitti', text: 'vain C: alkuaine', tone: 'plain' }, { icon: '🍬', title: 'glukoosi', text: 'C, H, O: yhdiste', tone: 'cool' }, { icon: '🧴', title: 'asetoni', text: 'C, H, O: yhdiste', tone: 'cool' }], label: 'Alkuainehiili ja hiiliyhdisteet' }),
    molecule({ atoms: ['H', 'O', 'H'], name: 'vesi', formula: 'H₂O', count: 'ei hiiltä', label: 'Vesi on yhdiste, mutta ei hiiliyhdiste' }),
  ] }),
  'CHEM79-NUTRIENT-01': () => ({ beats: [
    cards({ cards: [{ icon: '🍬', title: 'sokeri' }, { icon: '🧈', title: 'rasva' }, { icon: '🫘', title: 'proteiini' }, { icon: '💧', title: 'vesi' }], label: 'Yhdessä näytteessä monta ainetta' }),
    table({ head: ['aine', 'ryhmä'], rows: [['fruktoosi', 'hiilihydraatti'], ['tripalmitiini', 'rasva'], ['herneen varastoproteiinit', 'proteiini']], label: 'Ryhmä rakenteen mukaan' }),
    cards({ cards: [{ icon: '🫛', title: 'herne', text: 'proteiinia ja hiilihydraattia', tone: 'warm' }], label: 'Yksi ruoka, monta ryhmää' }),
  ] }),
  'CHEM79-NUTRIENT-CARB': () => ({ beats: [
    cards({ cards: [{ icon: '🍯', title: 'fruktoosi', text: 'makea' }, { icon: '🥔', title: 'tärkkelys', text: 'ei makea' }], label: 'Makea sokeri ja mauton tärkkelys' }),
    chain({ kind: 'starch', label: 'Tärkkelys on glukoosiosien ketju' }),
    cards({ cards: [{ icon: '🍬', title: 'sokerit', text: 'glukoosi, fruktoosi, sakkaroosi', tone: 'warm' }, { icon: '🍚', title: 'tärkkelys', text: 'peruna, riisi, leipä', tone: 'cool' }], label: 'Sokereita ja tärkkelystä' }),
  ] }),
  'CHEM79-NUTRIENT-FAT': () => ({ beats: [
    cards({ cards: [{ icon: '🧈', title: 'tripalmitiini', text: 'kiinteä' }, { icon: '🫒', title: 'trioleiini', text: 'neste' }], label: 'Kiinteä ja nestemäinen rasva' }),
    triglyceride('Glyseroli ja kolme rasvahappotähdettä'),
  ] }),
  'CHEM79-NUTRIENT-PROT': () => ({ beats: [
    chain({ kind: 'protein', label: 'Proteiini on aminohappojen ketju' }),
    cards({ cards: [{ icon: '🔢', title: '20 aminohappoa' }, { icon: '🔀', title: 'järjestys vaihtelee' }, { icon: '🧬', title: 'eri proteiini', tone: 'cool' }], label: 'Eri järjestys tekee eri proteiinin' }),
    cards({ cards: [{ icon: '🫛', title: 'herne' }, { icon: '🫘', title: 'papu' }, { icon: '🌱', title: 'soija' }, { icon: '🐟', title: 'kala' }], label: 'Proteiinia kasvi- ja eläinruoissa' }),
  ] }),
  'CHEM79-CARBON-COMPOUND': () => ({ beats: [undefined,
    formula({ lines: ['H–C≡C–H', 'C: 4 sidosta, H: 1 sidos'], note: 'hiilet kiinni kolmoissidoksella', label: 'Etyyni C₂H₂' }),
    cards({ cards: [{ icon: '💨', title: 'CO₂', text: 'epäorgaaninen hiiliyhdiste', tone: 'cool' }, { icon: '🧪', title: 'C ja O₂ astiassa', text: 'ei sidoksia: seos', tone: 'plain' }], label: 'Yhdiste vai seos' }),
  ] }),
  'CHEM79-ORG-GROUP': () => ({ beats: [undefined,
    bars({ bars: [{ label: 'heksan-1-oli', value: 157, text: '157 °C' }, { label: 'metanoli', value: 65, text: '65 °C' }], max: 180, axis: 'kiehumispiste', label: 'Sama ryhmä, kiehumispisteissä ero 92 °C' }),
  ] }),
};
