import type { Paint } from '../../engine/types';
import { h } from '../../ui/dom';
import { decimalLabel, type DecimalTickRange } from '../models/decimal-workshop';

export interface DecimalRow {
  label: string;
  value: string;
  /** Visible amount as hundredths of the same named whole. */
  fill?: number;
  /** Physical width of this whole on the shared scale, as hundredths of the longest whole. */
  width?: number;
  parts?: number;
}

export interface DecimalWorkbench {
  whole: string;
  rows: readonly DecimalRow[];
  axis?: DecimalTickRange & { marked?: boolean };
  columns?: readonly { label: string; digits: readonly [string, string, string] }[];
  note?: string;
  receipt?: string;
}

function strips(rows: readonly DecimalRow[]): HTMLElement | null {
  const visible = rows.filter(row => row.fill !== undefined);
  if (!visible.length) return null;
  const w = 128;
  const cell = 55;
  const second = visible.some(row => row.fill! > 100);
  const bars = visible.map((row, i) => {
    const y = i * 15 + 1;
    const width = cell * (row.width ?? 100) / 100;
    const parts = row.parts ?? 10;
    const bar = (start: number, value: number) => {
      const fill = width * Math.max(0, Math.min(100, value)) / 100;
      const divisions = Array.from({ length: parts - 1 }, (_, k) => {
        const x = start + width * (k + 1) / parts;
        return `<path d="M${x} ${y + 7}v3" stroke="#567576" stroke-width=".6"/>`;
      }).join('');
      return `<rect x="${start}" y="${y}" width="${width}" height="10" rx="2" fill="#fdf9eb" stroke="#517470"/>
        <rect x="${start}" y="${y}" width="${fill}" height="10" rx="1" fill="${i % 2 ? '#e2ac68' : '#79afab'}"/>${divisions}`;
    };
    return bar(1, row.fill!) + (second ? bar(cell + 7, row.fill! - 100) : '');
  }).join('');
  return h('div', {
    style: 'flex:1 1 96px;max-width:180px;min-width:84px',
    html: `<svg viewBox="0 0 ${second ? w : cell + 2} ${visible.length * 15}" aria-hidden="true">${bars}</svg>`,
  });
}

function axisArt(axis: NonNullable<DecimalWorkbench['axis']>): HTMLElement {
  const left = 15, right = 185, y = 15;
  const extent = axis.max - axis.min;
  const count = extent / axis.step;
  const x = (value: number) => left + (value - axis.min) * (right - left) / extent;
  const ticks = Array.from({ length: count + 1 }, (_, i) => {
    const tick = x(axis.min + i * axis.step);
    return `<path d="M${tick} 12v6" stroke="#355f63"/>`;
  }).join('');
  const labels = [axis.min, axis.max].map(value =>
    `<text x="${x(value)}" y="30" text-anchor="middle" font-size="8" fill="#254745">${decimalLabel(value)}</text>`).join('');
  const pin = axis.marked ? `<circle cx="${x(axis.target)}" cy="${y}" r="4" fill="#d18347"/>` : '';
  return h('div', { style: 'flex:2 1 160px;max-width:270px',
    html: `<svg viewBox="0 0 200 36" aria-hidden="true"><path d="M${left} ${y}H${right}" stroke="#355f63"/>${ticks}${labels}${pin}</svg>` });
}

export function decimalWorkbench(board: DecimalWorkbench): Paint {
  return (host) => {
    const values = h('dl', {
      class: 'decimal-givens', style: 'display:grid;grid-template-columns:minmax(0,1fr) auto;gap:1px 10px;margin:0;min-width:0;font-size:13px',
    }, ...board.rows.flatMap(({ label, value }) => [
      h('dt', {}, label), h('dd', { style: 'margin:0;text-align:right;font-weight:700;font-variant-numeric:tabular-nums' }, value),
    ]));
    const columns = board.columns && h('table', {
      'aria-label': 'Paikka-arvopöytä', style: 'margin:0;font-variant-numeric:tabular-nums;width:auto',
    }, h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Määrä'), ...['1', '1/10', '1/100'].map(label => h('th', { scope: 'col' }, label)))),
    h('tbody', {}, ...board.columns.map(({ label, digits }) => h('tr', {},
      h('th', { scope: 'row' }, label), ...digits.map((digit, index) => h('td', {
        style: `text-align:center;${index === 1 ? 'border-left:2px solid #45746d' : ''}`,
      }, digit))))));
    const panel = h('div', { 'data-decimal-workbench': board.receipt ? 'solved' : 'given', style: 'display:grid;gap:4px' },
      h('p', { class: 'decimal-whole', style: 'margin:0;color:#2e534f;font-weight:750' }, board.whole),
      h('div', { style: 'display:flex;align-items:center;flex-wrap:wrap;gap:4px 14px' },
        h('div', { style: 'flex:2 1 154px;min-width:0' }, values), columns ?? (board.axis ? axisArt(board.axis) : strips(board.rows))),
      board.note ? h('p', { style: 'margin:0' }, board.note) : null,
      board.receipt ? h('p', { class: 'decimal-receipt', style: 'font-weight:750;color:#2e6353;margin:0' }, board.receipt) : null);
    host.replaceChildren(panel);
  };
}
