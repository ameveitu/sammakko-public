import type { PageDraw } from '../pages';
import { bars, C, cards, figure, formula, meniscus, pill, ruler, tare, tx } from '../figures';

/** A ribbon of unknown length and 12 cm tiles to compare it with. */
const ribbonTiles = () => {
  const px = (cm: number) => 30 + cm * 9;
  let s = `<rect x="${px(0)}" y="40" width="${px(29) - px(0)}" height="24" rx="5" fill="${C.sun}" stroke="${C.ink}" stroke-width="2"/>` + tx(px(14.5), 30, 'nauha: ? cm', { size: 13 });
  for (let k = 0; k < 3; k++) s += `<rect x="${px(k * 12)}" y="88" width="${px(12) - px(0) - 3}" height="36" rx="5" fill="${k < 2 ? C.cool : '#fff'}" stroke="${k < 2 ? C.blue : C.line}" stroke-width="2"${k < 2 ? '' : ' stroke-dasharray="5 4"'}/>`
    + tx(px(k * 12 + 6), 112, k < 2 ? '12 cm' : '?', { size: 13, fill: k < 2 ? C.ink : C.soft });
  s += pill(200, 160, 'montako 12 cm:n laattaa mahtuu?', { size: 14 });
  return figure(400, 172, s, 'Vertailukohde: karttalaatta on 12 cm');
};

/** A magnified ruler: one division is 1 mm. */
const millimetres = () => {
  const px = (mm: number) => 40 + mm * 16;
  let s = `<rect x="30" y="40" width="340" height="56" rx="5" fill="#f4e3b6" stroke="${C.ink}" stroke-width="2"/>`;
  for (let mm = 0; mm <= 20; mm++) s += `<line x1="${px(mm)}" y1="40" x2="${px(mm)}" y2="${40 + (mm % 10 === 0 ? 26 : mm % 5 === 0 ? 18 : 11)}" stroke="${C.ink}" stroke-width="${mm % 10 ? 1 : 1.8}"/>`;
  s += tx(px(0), 88, '0', { size: 12 }) + tx(px(10), 88, '1 cm', { size: 12 }) + tx(px(20) - 6, 88, '2 cm', { size: 12, anchor: 'end' });
  s += `<path d="M${px(6)} 116 V124 H${px(7)} V116" fill="none" stroke="${C.red}" stroke-width="2.5"/>` + tx(px(6.5), 146, 'asteikkoväli 1 mm', { size: 14, fill: C.red });
  s += pill(200, 24, 'viivain ulottuu 300 mm:iin', { size: 13 });
  return figure(400, 158, s, 'Viivaimen asteikkoväli on 1 mm');
};

/** A centimetre scale with pointers and their recorded readings. */
const scale = (points: { at: number; text: string }[], label: string) => {
  const px = (cm: number) => 40 + cm * 53;
  let s = `<line x1="${px(0)}" y1="96" x2="${px(6)}" y2="96" stroke="${C.ink}" stroke-width="2.5"/>`;
  for (let cm = 0; cm <= 6; cm++) s += `<line x1="${px(cm)}" y1="84" x2="${px(cm)}" y2="108" stroke="${C.ink}" stroke-width="2"/>` + tx(px(cm), 128, String(cm), { size: 14 });
  s += tx(px(6) + 6, 132, 'cm', { size: 12, anchor: 'start', fill: C.soft });
  for (const p of points) s += `<path d="M${px(p.at)} 80 l-8 -16 h16 z" fill="${C.red}"/>` + pill(px(p.at), 46, p.text, { size: 14, stroke: C.red });
  return figure(400, 146, s, label);
};

/** A ribbon from 6 to 18 on the tape, laid out as four 3 cm pieces. */
const ribbonPieces = () => {
  const px = (cm: number) => 30 + cm * 17;
  let s = '';
  for (let k = 0; k < 4; k++) s += `<rect x="${px(6 + k * 3)}" y="40" width="${px(3) - px(0)}" height="30" fill="${k % 2 ? C.sky : C.cool}" stroke="${C.ink}" stroke-width="1.5"/>` + tx(px(7.5 + k * 3), 60, '3 cm', { size: 12 });
  s += `<rect x="20" y="78" width="360" height="34" rx="4" fill="#f4e3b6" stroke="${C.ink}" stroke-width="2"/>`;
  for (let cm = 0; cm <= 20; cm++) s += `<line x1="${px(cm)}" y1="78" x2="${px(cm)}" y2="${78 + (cm % 2 ? 7 : 12)}" stroke="${C.ink}" stroke-width="1.2"/>` + (cm % 2 ? '' : tx(px(cm), 106, String(cm), { size: 11, weight: 600 }));
  s += pill(110, 146, '18 − 6 = 12 cm', { size: 15, stroke: C.pond }) + pill(290, 146, '4 × 3 cm = 12 cm', { size: 15, stroke: C.pond });
  return figure(400, 160, s, 'Kaksi tapaa: 18 − 6 = 12 ja 4 × 3 = 12');
};

/** Measuring pages: tare, reading the surface, estimates, the right tool, units and the zero point. */
export const DRAW: Record<string, () => PageDraw> = {
  'M-MEAS-07': () => ({ beats: [undefined,
    tare({ reading: '200 g', sample: true, label: 'Nollattu vaaka: kivi painaa 200 g' }),
  ] }),
  'M-MEAS-10': () => ({ beats: [undefined,
    meniscus('Silmä pinnan korkeudella: alin kohta on viivalla 3', { mark: 'viiva 3: 3 dl', jug: true, scale: 'dl' }),
  ] }),
  'M-MEAS-11': () => ({ beats: [
    ribbonTiles(),
    bars({ bars: [{ label: 'arvio', value: 23, text: '23 cm' }, { label: 'mittaus', value: 29, text: '29 cm', mark: true }], max: 32, horizontal: true, note: 'arvio oli 6 cm pienempi', label: 'Arvio 23 cm, mittaus 29 cm' }),
  ] }),
  'M-MEAS-12': () => ({ beats: [
    cards({ cards: [{ icon: '📏', title: 'viivain', text: 'pituus', mark: 'ok', tone: 'cool' }, { icon: '🧵', title: 'mittanauha', text: 'pituus', mark: 'ok', tone: 'cool' }, { icon: '⚖️', title: 'vaaka', text: 'massa', mark: 'no', tone: 'plain' }, { icon: '🥛', title: 'mitta-astia', text: 'tilavuus', mark: 'no', tone: 'plain' }], label: 'Pituutta mittaavat viivain ja mittanauha' }),
    millimetres(),
  ] }),
  'M-MEAS-13': () => ({ beats: [
    cards({ cards: [{ icon: '🚩', title: 'tikku 0,24 m', text: 'pituus metreinä' }, { icon: '🏷️', title: 'lappu: 1–99', text: '0,24 ei mahdu lappuun', tone: 'warm' }], label: 'Lappuun mahtuu vain kokonaisluku' }),
    formula({ lines: ['1 m = 100 cm', '0,24 m = 24 cm'], note: 'luku muuttuu, pituus pysyy samana', label: 'Metristä senttimetreiksi: 0,24 m = 24 cm' }),
  ] }),
  'M-MEAS-14': () => ({ beats: [
    scale([{ at: 3, text: '3 cm' }], 'Osoitin tasan viivalla 3: lukema 3 cm'),
    scale([{ at: 1.3, text: 'lähin: 1 cm' }, { at: 5.5, text: 'puoliväli: 6 cm' }], 'Välissä: lähin viiva, puolivälistä ylempi'),
  ] }),
  'M-MEAS-15': () => ({ beats: [
    cards({ cards: [{ icon: '🧭', title: 'karttalaukku', text: 'yleensä 200–450 g' }, { icon: '🏷️', title: 'lappu: 0,325 kg', text: 'onko uskottava?', tone: 'warm' }], label: 'Lappu kilogrammoina, vertailu grammoina' }),
    formula({ lines: ['1 kg = 1000 g', '0,325 kg = 325 g'], note: '200 g < 325 g < 450 g: uskottava', label: 'Grammoiksi: 0,325 kg = 325 g' }),
  ] }),
  'M-MEAS-16': () => ({ beats: [
    ruler({ length: 12, zeroOff: 6, max: 20, reading: 'loppu 18', label: 'Nauha alkaa kohdasta 6 ja loppuu kohtaan 18' }),
    ribbonPieces(),
    cards({ cards: [{ icon: '🐸', title: 'Loikka: 18 cm', text: 'alkulukema jäi vähentämättä', mark: 'no', tone: 'warm' }, { icon: '📏', title: '18 − 6 = 12 cm', mark: 'ok', tone: 'cool' }, { icon: '🧩', title: '4 × 3 cm = 12 cm', mark: 'ok', tone: 'cool' }], label: 'Kaksi tapaa antaa saman: 12 cm' }),
  ] }),
};
