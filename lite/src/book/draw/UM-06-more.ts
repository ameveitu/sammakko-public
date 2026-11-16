import type { Paint } from '../../engine/types';
import type { PageDraw } from '../pages';
import { C, figure, formula, numberLine, pill, table, tx } from '../figures';

/** An n × n square of tiles: the area is n², the side is the square root. */
function tiles(n: number, area: string, side: string, label: string): Paint {
  const cell = Math.min(34, 150 / n), size = n * cell, x0 = 200 - size / 2, y0 = 20;
  let s = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) s += `<rect x="${x0 + c * cell + 1.5}" y="${y0 + r * cell + 1.5}" width="${cell - 3}" height="${cell - 3}" rx="3" fill="${(r + c) % 2 ? C.sun : C.glow}" stroke="${C.ink}" stroke-width="1"/>`;
  s += `<rect x="${x0}" y="${y0}" width="${size}" height="${size}" fill="none" stroke="${C.ink}" stroke-width="2.5"/>`;
  s += `<path d="M${x0} ${y0 + size + 10} V${y0 + size + 16} H${x0 + size} V${y0 + size + 10}" fill="none" stroke="${C.pond}" stroke-width="2"/>` + tx(200, y0 + size + 34, side, { size: 15, fill: C.pond });
  s += pill(x0 + size + 16, y0 + size / 2 + 5, area, { size: 15, stroke: C.sun, anchor: 'start' });
  return figure(400, y0 + size + 46, s, label);
}

/** Two boxes, rationals and irrationals, side by side inside the real numbers. */
function realSets(label: string): Paint {
  const chip = (x: number, y: number, t: string, c: string) => `<rect x="${x - 30}" y="${y - 17}" width="60" height="30" rx="15" fill="#fff" stroke="${c}" stroke-width="2"/>` + tx(x, y + 4, t, { size: 15 });
  let s = `<rect x="14" y="10" width="372" height="170" rx="18" fill="${C.cool}" stroke="${C.line}" stroke-width="1.5"/>` + tx(200, 32, 'reaaliluvut', { size: 14, fill: C.soft });
  s += `<rect x="30" y="44" width="200" height="122" rx="14" fill="#fff8e6" stroke="${C.sun}" stroke-width="2"/>` + tx(130, 66, 'rationaaliluvut', { size: 14 });
  s += `<rect x="244" y="44" width="126" height="122" rx="14" fill="#fbe9e6" stroke="${C.red}" stroke-width="2"/>` + tx(307, 66, 'irrationaali-', { size: 13 }) + tx(307, 82, 'luvut', { size: 13 });
  s += chip(80, 104, '−11/8', C.sun) + chip(170, 104, '3', C.sun) + chip(125, 146, '0,5', C.sun) + chip(307, 112, 'π', C.red) + chip(307, 150, '√3', C.red);
  return figure(400, 190, s, label);
}

/** Square roots: the side of a square, exact or approximate. */
export const DRAW: Record<string, () => PageDraw> = {
  'M79-SQRT-01': () => ({ beats: [
    tiles(4, 'ala 16', 'sivu 4', 'Neliön ala 16, sivu 4'),
    formula({ lines: ['√16 = 4', 'tarkistus: 4² = 16'], note: 'neliöjuuri on luku, jonka neliö on 16', label: 'Neliöjuuri ja tarkistus' }),
    table({ head: ['merkintä', 'arvo'], rows: [['(−3)²', '9'], ['√9', '3 (ei −3)'], ['√−25', 'ei reaalilukua']], mark: 1, label: '√9 tarkoittaa vain pääjuurta 3' }),
  ] }),
  'M79-EXACTAPPROX-01': () => ({ beats: [
    formula({ lines: ['2,65² = 7,0225', '7,0225 > 7, joten √7 ≈ 2,65'], note: 'näytön lukema on vain likiarvo', label: '2,65 on hieman liian suuri' }),
    numberLine({ from: 2.64, to: 2.66, step: 0.005, marks: [{ at: 2.645, text: 'vähintään 2,645', color: C.pond }, { at: 2.65, text: 'lukema 2,65', color: C.ink }, { at: 2.655, text: 'alle 2,655' }], label: 'Lukeman 2,65 antavat luvut 2,645:stä 2,655:een' }),
  ] }),
  'M79-SQRT-EXACT': () => ({ beats: [
    tiles(3, 'ala 9', 'sivu 3', 'Yhdeksän laattaa: sivu 3'),
    table({ head: ['sivu', 'ala', 'neliöjuuri'], rows: [['3', '3² = 9', '√9 = 3'], ['12', '12² = 144', '√144 = 12']], label: 'Neliöluvun neliöjuuri on kokonaisluku' }),
  ] }),
  'M79-SQRT-EST': () => ({ beats: [
    numberLine({ from: 24, to: 37, step: 1, marks: [{ at: 25, text: '5² = 25', color: C.pond }, { at: 29, text: '29' }, { at: 36, text: '6² = 36', color: C.pond }], note: '25 < 29 < 36, joten 5 < √29 < 6', label: '29 on neliöiden 25 ja 36 välissä' }),
    formula({ lines: ['5,5² = 30,25', '29 < 30,25'], note: '√29 on alle 5,5: lähempänä lukua 5', label: 'Puolivälin neliö ratkaisee' }),
  ] }),
  'M79-ROUND-01': () => ({ beats: [
    numberLine({ from: 12.1, to: 12.2, step: 0.05, minor: 5, marks: [{ at: 12.15, text: 'puoliväli 12,15' }], jumps: [{ from: 12.15, to: 12.2, text: '≈ 12,2' }], note: 'puolivälistä pyöristetään nollasta poispäin', label: '12,15 pyöristyy ylöspäin' }),
  ] }),
  'M79-SQRT-02': () => ({ beats: [
    formula({ lines: ['√36 = 6', 'koska 6² = 36'], note: 'tarkka arvo: merkki =', label: 'Portin ensimmäinen sivu' }),
    numberLine({ from: 60, to: 85, step: 5, marks: [{ at: 64, text: '8² = 64', color: C.pond }, { at: 72.25, text: '8,5² = 72,25', color: C.soft }, { at: 75, text: '75' }, { at: 81, text: '9² = 81', color: C.pond }], note: '75 > 72,25, joten √75 ≈ 9', label: '√75 on lähempänä lukua 9' }),
    table({ head: ['merkintä', 'mikä se on'], rows: [['√75', 'tarkka luku'], ['√75 ≈ 8,66', 'likiarvo'], ['√75 ≈ 9', 'likiarvo']], mark: 0, label: 'Juuri on tarkka, desimaali likiarvo' }),
  ] }),
  'M79-SQRT-03': () => ({ beats: [
    formula({ lines: ['2√5 + 4√5 = 6√5', 'kuten 2x + 4x = 6x'], note: 'samanlaiset termit yhdistetään', label: 'Samanlaiset juuritermit' }),
    table({ head: ['järjestys', 'lasku', 'tulos'], rows: [['pyöristä lopuksi', '6 · 2,236…', '13,4 ✓'], ['pyöristä ensin', '6 · 2,2', '13,2 ✗']], label: 'Pyöristä vasta lopuksi' }),
  ] }),
  'M79-REAL-01': () => ({ beats: [
    formula({ lines: ['−11/8', 'kokonaisluku / kokonaisluku'], note: 'nimittäjä 8 ei ole nolla: rationaaliluku', label: 'Rationaaliluku on kahden kokonaisluvun osamäärä' }),
    realSets('Rationaali- ja irrationaaliluvut'),
  ] }),
  'M79-REAL-02': () => ({ beats: [
    numberLine({ from: -1, to: 2, step: 1, minor: 4, marks: [{ at: 1.25, text: 'A = 1,25' }], note: 'yksi pieni väli on 0,25', label: 'Ykkösväli neljään osaan' }),
    numberLine({ from: -1, to: 2, step: 1, minor: 4, marks: [{ at: -0.75, text: 'B = −3/4' }, { at: 0.5, text: 'C = 0,5', color: C.pond }], note: '−3/4 = −0,75', label: 'B ja C lukusuoralla' }),
  ] }),
};
