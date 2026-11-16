import type { PageDraw } from '../pages';
import { C, arrow, bars, cards, figure, photosynthesis, pill, tx } from '../figures';

/** A closed chamber before and after heating: the same 12 water particles, 3 still liquid and 9 now vapour. */
const chamber = () => {
  const dot = (x: number, y: number, liquid: boolean) => `<circle cx="${x}" cy="${y}" r="7" fill="${liquid ? C.blue : C.sky}" stroke="${C.blue}" stroke-width="2"/>`;
  const box = (x0: number) => `<rect x="${x0}" y="24" width="124" height="120" rx="10" fill="#fff" stroke="${C.ink}" stroke-width="2.5"/>`;
  let s = box(30) + box(246);
  for (let i = 0; i < 12; i++) s += dot(46 + (i % 6) * 18, 130 - Math.floor(i / 6) * 15, true);
  for (let i = 0; i < 3; i++) s += dot(268 + i * 18, 130, true);
  const gas = [[262, 44], [300, 52], [342, 42], [280, 74], [326, 80], [356, 66], [262, 100], [304, 104], [348, 106]];
  for (const [x, y] of gas) s += dot(x!, y!, false);
  s += arrow(166, 84, 236, 84, { color: C.red, width: 3 }) + tx(201, 72, 'lämmitys', { size: 12, fill: C.red })
    + tx(92, 166, 'ennen: 30 mg', { size: 13 }) + tx(308, 166, 'jälkeen: 8 + 22 mg', { size: 13 })
    + pill(200, 194, 'sama määrä: 30 mg', { size: 14 });
  return figure(400, 206, s, 'Aine muuttaa muotoaan, mutta ei katoa');
};

/** One closed chamber on a hot plate: 30 mg of liquid water, no vapour yet. */
const chamberBefore = () => {
  let s = `<rect x="138" y="24" width="124" height="120" rx="10" fill="#fff" stroke="${C.ink}" stroke-width="2.5"/>`;
  for (let i = 0; i < 12; i++) s += `<circle cx="${154 + (i % 6) * 18}" cy="${130 - Math.floor(i / 6) * 15}" r="7" fill="${C.blue}" stroke="${C.blue}" stroke-width="2"/>`;
  s += `<rect x="128" y="150" width="144" height="12" rx="4" fill="${C.red}"/>`;
  for (const x of [164, 200, 236]) s += `<path d="M${x} 190 q-11 -10 0 -26 q11 16 0 26z" fill="${C.sun}" stroke="${C.red}" stroke-width="2"/>`;
  s += tx(282, 182, 'lämmitys', { size: 13, fill: C.red, anchor: 'start' }) + pill(286, 120, 'nestettä 30 mg', { size: 13, stroke: C.blue, anchor: 'start' }) + pill(286, 52, 'höyryä 0 mg', { size: 13, stroke: C.line, anchor: 'start' });
  return figure(400, 206, s, 'Suljettu kammio: 30 mg nestemäistä vettä, ei höyryä');
};

/** Photosynthesis: carbon comes from the air, light only gives the energy. */
export const DRAW: Record<string, () => PageDraw> = {
  'ENV-CHEM-PHOTOSYN-01': () => ({ beats: [
    cards({ cards: [{ icon: '🍃', title: 'hiilidioksidi', text: 'ilmasta lehteen', tone: 'cool' }, { icon: '💧', title: 'vesi', text: 'maasta juuriin', tone: 'cool' }], label: 'Lehti ottaa hiilidioksidia, juuret vettä' }),
    photosynthesis({ label: 'Valossa syntyy sokeria, ja happea vapautuu' }),
    photosynthesis({ carbon: 'hiili ilmasta', label: 'Kasvin hiili tulee ilman hiilidioksidista' }),
  ] }),
  'ENV-CHEM-CYCLE-PHOTO-01': () => ({ beats: [
    photosynthesis({ carbon: 'hiili lehteen', label: 'Lehti ottaa hiilidioksidia ilmasta' }),
    bars({ bars: [{ label: 'valossa', value: 10, text: '10 mg' }, { label: 'pimeässä', value: 0, text: '0 mg' }], max: 12, axis: 'sidottu hiili', label: 'Valossa 10 mg, pimeässä ei yhtään' }),
    cards({ cards: [{ icon: '☀️', title: 'valo', text: 'antaa energian', tone: 'warm' }, { icon: '🌳', title: 'hiili', text: 'tulee ilmasta', tone: 'cool' }], label: 'Valo antaa energian, hiili tulee ilmasta' }),
  ] }),
  'ENV-CHEM-MATTERCONS-01': () => ({ beats: [
    chamberBefore(),
    bars({ bars: [{ label: 'nestettä', value: 8, text: '8 mg' }, { label: 'höyryä', value: 22, text: '22 mg' }, { label: 'yhteensä', value: 30, text: '30 mg', mark: true }], max: 30, axis: 'vettä', label: '8 mg + 22 mg = 30 mg' }),
    chamber(),
  ] }),
  'CHEM79-CARBON-RESERVOIRS': () => ({ beats: [undefined, undefined,
    cards({ cards: [{ icon: '🌲', title: 'metsä', text: 'varasto: hiiltä on siellä', tone: 'cool' }, { icon: '🌿', title: 'yhteyttäminen', text: 'siirtymä: hiili liikkuu', tone: 'warm' }], label: 'Varasto on paikka, prosessi siirtää' }),
  ] }),
  'CHEM79-CARBONCYCLE': () => ({ beats: [undefined, undefined,
    bars({ bars: [{ label: 'tulee ilmakehään', value: 12, text: '12 mg' }, { label: 'lähtee ilmakehästä', value: 9, text: '9 mg', color: '#e0533f' }], max: 14, axis: 'hiiltä', label: 'Tuloja 12 mg, lähtöjä 9 mg' }),
  ] }),
};
