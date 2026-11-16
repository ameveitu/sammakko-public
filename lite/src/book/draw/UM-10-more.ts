import type { Paint } from '../../engine/types';
import type { PageDraw } from '../pages';
import { bars, C, figure, pill, plane, table, tx } from '../figures';

/** Pumps × hours as rectangles: different shapes, the same area 18. */
function sameWork(label: string): Paint {
  const u = 13, base = 150, items = [{ n: 2, t: 9 }, { n: 3, t: 6 }, { n: 6, t: 3 }];
  let s = '', x = 70;
  for (const it of items) {
    const w = it.n * u, h = it.t * u;
    for (let c = 0; c < it.n; c++) for (let r = 0; r < it.t; r++) s += `<rect x="${x + c * u}" y="${base - (r + 1) * u}" width="${u}" height="${u}" fill="${C.cool}" stroke="${C.line}" stroke-width="0.8"/>`;
    s += `<rect x="${x}" y="${base - h}" width="${w}" height="${h}" fill="none" stroke="${C.pond}" stroke-width="2.5"/>`;
    s += tx(x + w / 2, base + 18, `${it.n} pumppua`, { size: 12, fill: C.soft }) + tx(x - 6, base - h / 2 + 4, `${it.t} h`, { size: 12, fill: C.soft, anchor: 'end' });
    s += pill(x + w / 2, base + 44, `${it.n} · ${it.t} = 18`, { size: 13, stroke: C.pond });
    x += w + 60;
  }
  return figure(400, base + 58, s, label);
}

/** Three small planes: crossing lines, parallel lines and one line drawn twice. */
function threeCases(label: string): Paint {
  const box = (x: number, title: string, body: string, color: string) =>
    `<rect x="${x}" y="10" width="116" height="116" rx="10" fill="#fff" stroke="${C.line}" stroke-width="1.5"/>` + body + tx(x + 58, 148, title, { size: 13, fill: color });
  const ln = (x1: number, y1: number, x2: number, y2: number, c: string, dash = false, w = 3) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${dash ? ' stroke-dasharray="8 6"' : ''}/>`;
  let s = box(12, 'yksi ratkaisu', ln(24, 112, 116, 24, C.pond) + ln(24, 30, 116, 108, C.blue, true) + `<circle cx="70" cy="68" r="6" fill="${C.red}"/>`, C.pond);
  s += box(142, 'ei yhtään', ln(154, 92, 246, 28, C.pond) + ln(166, 114, 252, 54, C.blue, true), C.red);
  s += box(272, 'äärettömän monta', ln(284, 112, 376, 24, C.pond, false, 7) + ln(284, 112, 376, 24, C.blue, true, 3), C.pond);
  return figure(400, 160, s, label);
}

/** Proportionality and systems of two equations. */
export const DRAW: Record<string, () => PageDraw> = {
  'M79-DIRECTPROP': () => ({ beats: [
    table({ head: ['laitureita x', '2', '3', '5'], rows: [['näytteitä y', '12', '18', '30']], label: 'Jokaiselta laiturilta 6 näytettä' }),
    table({ head: ['x', 'y', 'y : x'], rows: [['2', '12', '6'], ['3', '18', '6'], ['5', '30', '6']], label: 'Osamäärä on joka rivillä 6: y = 6x' }),
    plane({ x: [0, 5], y: [0, 30], yStep: 6, lines: [{ k: 6, b: 0, text: 'y = 6x', at: 3.6, dy: 4 }], points: [{ x: 0, y: 0, text: 'x = 0 → y = 0', dx: 95, dy: -8 }, { x: 2, y: 12, color: C.pond }, { x: 3, y: 18, color: C.pond }, { x: 5, y: 30, color: C.pond }], label: 'Suora verrannollisuus kulkee origon kautta' }),
  ] }),
  'M79-INVERSEPROP': () => ({ beats: [
    bars({ bars: [{ label: '2 pumppua', value: 9, text: '9 h' }, { label: '3 pumppua', value: 6, text: '6 h' }, { label: '6 pumppua', value: 3, text: '3 h' }], max: 10, label: 'Enemmän pumppuja, vähemmän aikaa' }),
    sameWork('Tulo on joka kerta 18'),
    table({ head: ['ehto', 'malli pätee'], rows: [['samanlaiset pumput', '✓'], ['sama työ', '✓'], ['0 pumppua', '✗ työ ei valmistu']], label: 'Milloin malli pätee' }),
  ] }),
  'M79-SYSTEM-01': () => ({ beats: [
    table({ head: ['(5, 1)', 'vasen puoli', 'pitää olla', ''], rows: [['3x + 2y', '15 + 2 = 17', '17', '✓'], ['4x − 2y', '20 − 2 = 18', '4', '✗']], label: 'Pari (5, 1) sopii vain ensimmäiseen' }),
    table({ head: ['(3, 4)', 'vasen puoli', 'pitää olla', ''], rows: [['3x + 2y', '9 + 8 = 17', '17', '✓'], ['4x − 2y', '12 − 8 = 4', '4', '✓']], label: 'Pari (3, 4) sopii molempiin' }),
    table({ head: ['ratkaisuja', 'suorat'], rows: [['yksi', 'leikkaavat'], ['ei yhtään', 'yhdensuuntaiset'], ['äärettömän monta', 'sama suora']], mark: 0, label: 'Yhtälöparin ratkaisujen määrä' }),
  ] }),
  'M79-SYSTEM-GRAPH': () => ({ beats: [
    plane({ x: [-1, 3], y: [-1, 3], square: true, lines: [{ k: 1, b: 0, text: '−x + y = 0', at: 2.5, dy: 18 }, { k: -1, b: 2, dash: true, color: C.blue, text: 'x + y = 2', at: 0.6, dy: -18 }], points: [{ x: 1, y: 1, text: '(1, 1)', dx: 34, dy: 0 }], label: 'Suorat leikkaavat pisteessä (1, 1)' }),
    table({ head: ['yhtälö', 'sijoitus (1, 1)', ''], rows: [['−x + y = 0', '−1 + 1 = 0', '✓'], ['x + y = 2', '1 + 1 = 2', '✓']], label: 'Leikkauspiste toteuttaa molemmat' }),
    threeCases('Leikkaavat, yhdensuuntaiset ja sama suora'),
  ] }),
};
