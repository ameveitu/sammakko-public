import type { Paint } from '../../engine/types';
import { svg } from '../../ui/art';
import { h } from '../../ui/dom';
import { paint, table } from '../kit';
import { oppositeTerms, polynomialText, termText, valueAt, type WorkshopModel, type WorkshopRow, type WorkshopTerm } from '../models/polynomial-workshop';

const INK = '#2b4a53';
const WOOD = '#f4e6c8';
const BLUE = '#a4d3cf';
const RED = '#f0c1b0';
const text = (x: number, y: number, value: string, size = 14) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="700" fill="${INK}">${value}</text>`;
const rectangle = (x: number, y: number, w: number, height: number, fill: string, dash = false) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${height}" rx="5" fill="${fill}" stroke="${INK}"${dash ? ' stroke-dasharray="4 2"' : ''}/>`;
const rowLabel = (row: WorkshopRow, variable: string) => [row.label, polynomialText(row.terms, variable)];

interface WorkbenchResult {
  result?: readonly WorkshopTerm[];
  expansion?: readonly WorkshopTerm[];
  checkSamples?: boolean;
}

function trayArt(model: WorkshopModel, rows: readonly WorkshopRow[]) {
  const art = rows.map((row, i) => {
    const y = 42 * i;
    const width = Math.min(74, 285 / Math.max(1, row.terms.length));
    const positions = row.terms.map((part, j) => {
      const x = 22 + j * width;
      const shape = part.power === 0 ? 18 : part.power === 1 ? 31 : part.power === 2 ? 38 : 48;
      const w = Math.min(width - 4, shape + Math.abs(part.coefficient).toString().length * 7);
      return rectangle(x, y + 12, w, 25, part.coefficient < 0 ? RED : BLUE, part.coefficient < 0) +
        text(x + w / 2, y + 30, termText(part, model.variable), 13);
    }).join('');
    return rectangle(10, y + 3, 302, 37, WOOD) + positions + (positions ? '' : text(34, y + 29, '0'));
  }).join('');
  return svg(322, 42 * rows.length, art, 'Telakan termilaatat. Jokaisen laatan merkki ja muuttujaosa pysyvät näkyvissä.');
}

function productArt(model: WorkshopModel, selected: boolean, expansion?: readonly WorkshopTerm[]) {
  const [left, right] = model.rows;
  const columns = right!.terms.length;
  const width = 252 / columns;
  const top = right!.terms.map((entry, i) => text(59 + (i + .5) * width, 19, termText(entry, model.variable))).join('');
  const rows = left!.terms.map((a, i) => {
    const y = 25 + i * 33;
    return text(32, y + 22, termText(a, model.variable), 13) + right!.terms.map((b, j) => {
      const x = 59 + j * width;
      const result = expansion?.[i * columns + j];
      const cell = result ? termText(result, model.variable) : selected ? `${termText(a, model.variable)} · (${termText(b, model.variable)})` : '□';
      return rectangle(x, y, width - 4, 29, result ? result.coefficient < 0 ? RED : BLUE : WOOD, !!result && result.coefficient < 0) +
        text(x + (width - 4) / 2, y + 20, cell, 12);
    }).join('');
  }).join('');
  return svg(322, 28 + left!.terms.length * 33, top + rows, 'Jokaisen vasemman termin ja jokaisen ylätermin pari on yksi tuloruudukon ruutu.');
}

function panel(model: WorkshopModel, inspect: boolean, result?: WorkbenchResult) {
  const { variable, rows, layout, examples } = model;
  const presented = inspect && layout === 'collect'
    ? rows.map(row => ({ ...row, terms: [...row.terms].sort((a, b) => b.power - a.power) }))
    : inspect && layout === 'return'
      ? rows.map((row, i) => i === rows.length - 1 ? { ...row, terms: oppositeTerms(row.terms) } : row)
      : rows;
  const before = layout === 'product' ? productArt(model, inspect, result?.expansion)
    : layout === 'classify' || layout === 'terms'
      ? svg(322, 62, rectangle(10, 7, 302, 49, WOOD) + text(161, 37,
        layout === 'classify' ? 'Piirustukset vertailuun' : polynomialText(rows[0]!.terms, variable)), 'Telakan alkuperäinen piirustus.')
      : trayArt(model, presented);
  const results = result?.result !== undefined
    ? '<p><strong>Kootut laatat</strong></p>' + trayArt(model, [{ label: 'Valmis rivi', terms: result.result }])
    : '';
  const expansion = result?.expansion ? `<p>Avattu rivi: ${polynomialText(result.expansion, variable)}</p>` : '';
  const answer = result?.result !== undefined ? `<p>Valmis rivi: ${polynomialText(result.result, variable)}</p>` : '';
  const check = result?.checkSamples ? table([variable, 'Alkuperäinen', 'Koottu'], [1, 3].map(value => [
    value, valueAt(rows.flatMap(row => row.terms), value), valueAt(result.result!, value),
  ])) + '<p>Kaksi kokeilua havainnollistaa. Yleinen sääntö perustuu samanlaisten termien kertoimiin.</p>' : '';
  const data = examples ? table(['Piirustus', 'Lauseke'], examples.map((value, i) => [String.fromCharCode(65 + i), value]))
    : table(['Telakan lappu', 'Annettu lauseke'], rows.map(row => rowLabel(row, variable)));
  return `<div class="polynomial-workshop" style="grid-column:1/-1;display:flex;align-items:center;flex-wrap:wrap;gap:.45rem;min-width:0">
    <div style="flex:1 1 136px;min-width:0">${before}${results}</div>
    <div style="flex:2 1 240px;min-width:0;overflow-wrap:anywhere">${data}${model.note ? `<p>${model.note}</p>` : ''}${expansion}${answer}${check}</div>
  </div>`;
}

export function polynomialWorkshopArt(model: WorkshopModel, result?: WorkbenchResult): Paint {
  const initial = panel(model, false, result);
  if (result || model.layout === 'classify' || model.layout === 'terms') return paint(initial);
  const label = model.layout === 'product' ? 'Näytä osaparit' : model.layout === 'return' ? 'Näytä palautuserän vastalaatat' : 'Järjestä laattalajit';
  return (host) => {
    const board = h('div', { html: initial });
    const toggle = h('button', {
      class: 'btn small', type: 'button', 'aria-pressed': 'false',
      onclick: () => {
        const selected = toggle.getAttribute('aria-pressed') !== 'true';
        board.innerHTML = selected ? panel(model, true) : initial;
        toggle.setAttribute('aria-pressed', String(selected));
      },
    }, label);
    host.append(board, toggle);
    return () => { board.remove(); toggle.remove(); };
  };
}
