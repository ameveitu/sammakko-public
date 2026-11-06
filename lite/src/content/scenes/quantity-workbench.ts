import { fmt } from '../fi';
import { paint, table } from '../kit';
import { svg } from '../../ui/art';
import { baseOf, fractionShare, levelValues, type EqualLevel, type FractionSplit, type QuantityBoard } from '../models/quantity';

const ink = '#234454';
const teal = '#318987';
const gold = '#e0aa4e';
const ghost = '#e4ece3';
const text = (x: number, y: number, label: string) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor">${label}</text>`;
const box = (x: number, y: number, w: number, h: number, fill: string, stroke = ink, dashed = false) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${fill}" stroke="${stroke}"${dashed ? ' stroke-dasharray="4 3"' : ''}/>`;
const workbench = (art: string, details: string) =>
  paint(`<div class="quantity-workbench" style="grid-column:1/-1;display:flex;flex-wrap:wrap;align-items:center;gap:.6rem;min-width:0">` +
    (art ? `<div style="flex:1 1 140px;min-width:0">${art}</div>` : '') +
    `<div style="flex:2 1 295px;min-width:0">${details}</div></div>`);

function cakeSlices(cx: number, cy: number, radius: number, parts: number, kept: number, fill: string) {
  const at = (i: number) => {
    const angle = i / parts * 2 * Math.PI - Math.PI / 2;
    return `${cx + radius * Math.cos(angle)} ${cy + radius * Math.sin(angle)}`;
  };
  const wheel = `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${ghost}" stroke="${ink}"/>`;
  if (parts === 1) return kept ? wheel.replace(ghost, fill) : wheel;
  return wheel + Array.from({ length: parts }, (_, i) =>
    `<path d="M${cx} ${cy} L${at(i)} A${radius} ${radius} 0 0 1 ${at(i + 1)} Z" fill="${i < kept ? fill : 'none'}" stroke="${ink}" stroke-width=".8"/>`).join('');
}

export function fractionSplitArt(model: FractionSplit, showResult = false) {
  const { shape, n, d, recipients } = model;
  const share = fractionShare(model);
  const cutDenominator = d === share.d ? d : d * recipients;
  const cut = d !== cutDenominator;
  let art = '';
  if (shape === 'cake') {
    const parts = showResult ? cutDenominator : d;
    const kept = showResult && cut ? n * recipients : n;
    art = cakeSlices(49, 63, 28, parts, kept, gold) + text(49, 121, 'Yksi kakku');
    if (showResult && cut) {
      art += Array.from({ length: d }, (_, i) => {
        const angle = i / d * 2 * Math.PI - Math.PI / 2;
        return `<path d="M49 63L${49 + 28 * Math.cos(angle)} ${63 + 28 * Math.sin(angle)}" stroke="${ink}" stroke-width="1.6"/>`;
      }).join('');
    }
    for (let i = 0; i < recipients; i++) {
      const x = 111 + i * (198 / recipients);
      art += box(x - 27, 34, 54, 60, 'none', ink, true)
        + (showResult ? cakeSlices(x, 63, 28, share.d, share.n, teal) : '')
        + text(x, 112, `${i + 1}.`);
    }
    art += text(197, 23, 'Saajien alustat');
  } else {
    const parts = showResult ? cutDenominator : d;
    const kept = showResult && cut ? n * recipients : n;
    for (let i = 0; i < parts; i++) art += box(18 + i * 290 / parts, 37, 290 / parts, 23, i < kept ? gold : ghost);
    art += text(163, 22, 'Kokonainen · 1 m');
    if (showResult) for (let i = 1; i < d; i++) art += `<path d="M${18 + i * 290 / d} 36V62" stroke="${ink}" stroke-width="1.8"/>`;
    for (let i = 0; i < recipients; i++) {
      const x = 18 + i * 290 / recipients;
      art += box(x, 82, 280 / recipients, 19, 'none', ink, true);
      if (showResult) art += box(x, 82, 290 * share.n / share.d, 19, teal);
      art += text(x + 140 / recipients, 120, `${i + 1}.`);
    }
  }
  return workbench(svg(330, 128, art, shape === 'cake' ? 'Nimetty kokonainen kakku ja saajien alustat' : 'Metriin verrattu jaettava nauha ja saajien alustat'),
    table(['Kokonainen', 'Jaettava osuus', 'Yhtä suuria osuuksia'], [[shape === 'cake' ? 'Yksi kakku' : 'Yksi metri', `${n}/${d}`, recipients]]) +
    (showResult ? `<p>Yhden saajan osuus alkuperäisestä kokonaisesta on ${share.n}/${share.d}.</p>` : ''));
}

export function meanLevelArt(model: EqualLevel, showResult = false) {
  const { values, material } = model;
  const { value } = levelValues(model);
  const captions = values.map((_, i) => String.fromCharCode(65 + i));
  let art: string;
  if (material === 'blocks') {
    const max = Math.max(...values);
    const side = Math.min(17, 84 / max);
    art = values.map((count, i) => {
      const x = (i + .5) * 330 / values.length;
      const column = (count: number, x: number, fill: string, dashed = false) => Array.from({ length: count }, (_, j) =>
        box(x, 108 - (j + 1) * side, side - 2, side - 2, fill, ink, dashed)).join('');
      return column(count, x - 19, showResult ? ghost : teal, showResult) +
        (showResult ? column(value, x + 2, gold) : '') + text(x, 126, captions[i]!);
    }).join('');
  } else {
    const scale = 256 / Math.max(...values);
    art = values.map((length, i) => {
      const y = 16 + 56 * i;
      const original = box(39, y, length * scale, 16, showResult ? ghost : teal, ink, showResult);
      const equal = showResult ? box(39, y + 21, value * scale, 16, gold) : '';
      const seam = showResult && length < value ? `<path d="M${39 + length * scale} ${y + 21}v16" stroke="${ink}" stroke-width="2"/>` : '';
      return text(22, y + 12, captions[i]!) + original + equal + seam;
    }).join('');
  }
  const unit = material === 'blocks' ? ' palikkaa' : ' cm';
  return workbench(svg(330, 136, art, material === 'blocks' ? 'Samankokoiset yksikköpalikat sarakkeina' : 'Leikattavat samanlevyiset pituusnauhat'),
    table(captions.map(x => `Havainto ${x}`), [values.map(n => fmt(n) + unit)]) +
    (showResult ? `<p>Haamut näyttävät alkuperäisen aineiston. Kultainen malli näyttää tasauksen, ${fmt(value)}${unit} kutakin havaintoa kohti.</p>` : ''));
}

export function quantityArt(model: QuantityBoard) {
  const { rows, unit, view } = model;
  const knownPart = rows.find((row) => row.amount !== null)?.amount;
  const unknownWidth = view === 'ruler' && model.referencePartPercent && knownPart !== undefined && knownPart !== null
    ? baseOf(knownPart, model.referencePartPercent) : 0;
  const totals = rows.map((row) => row.extent ?? row.amount ?? unknownWidth);
  const max = model.scaleMaximum ?? Math.max(1, ...totals);
  let art = '';
  if (view === 'tiles') {
    const cols = Math.min(20, Math.max(10, Math.ceil(max / 5)));
    const size = 11, x0 = (330 - cols * size) / 2;
    let y = 22;
    for (const row of rows) {
      const count = row.amount ?? 0;
      const capacity = row.amount === null ? 0 : row.extent ?? count;
      const lines = Math.max(1, Math.ceil(capacity / cols));
      const marked = row.marked ?? 0;
      const partOfPlan = capacity > count;
      art += text(165, y - 7, row.label);
      if (row.base && !partOfPlan) art += box(x0 - 5, y - 4, cols * size + 10, lines * size + 7, 'none', '#99621c');
      if (row.amount === null) art += box(x0, y, cols * size, size, 'none', '#99621c', true);
      art += Array.from({ length: capacity }, (_, i) => {
        const x = x0 + (i % cols) * size;
        const tileY = y + Math.floor(i / cols) * size;
        const highlight = row.markEnd ? i >= count - marked : i < marked;
        return box(x, tileY, size - 2, size - 2, i >= count ? ghost : highlight ? gold : teal, row.base && partOfPlan && i < count ? '#99621c' : '#376370');
      }).join('');
      y += lines * size + 22;
    }
    art = svg(330, y - 12, art, 'Samanlaiset rakennuspalat. Rajattu kehys osoittaa nimetyn vertailujoukon.');
  } else if (view === 'ruler') {
    const scale = 248 / max;
    art = rows.map((row, i) => {
      const y = i * 36 + 27;
      const width = totals[i]! * scale;
      return text(165, y - 6, row.label) +
        box(41, y, Math.max(12, width), 14, row.amount === null ? 'none' : teal, row.base ? '#99621c' : ink, row.amount === null) +
        (row.marked ? box(41 + (row.markEnd ? (row.amount! - row.marked) * scale : 0), y, row.marked * scale, 14, gold) : '');
    }).join('');
    art = svg(330, rows.length * 36 + 14, art, 'Yhteinen lineaarinen asteikko. Taulukossa lukee kunkin palkin määrä.');
  }
  const labels = rows.map(row => row.label + (row.base ? ' · 100 %' : ''));
  const amounts = rows.map(row => row.amount === null ? '?' : `${row.amount} ${unit}`);
  return workbench(art, `<p><strong>100 %: ${model.reference}.</strong></p>` + table(labels, [amounts]) +
    (model.notes ?? []).map(note => `<p>${note}</p>`).join(''));
}
