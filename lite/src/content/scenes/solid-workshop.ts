import type { Paint } from '../../engine/types';
import { svg } from '../../ui/art';
import { h } from '../../ui/dom';
import { flat, sizeOf, solutionSolidWorkshop,
  type Geometry, type SolidFigure, type SolidView, type SolidWorkshopResponse, type SolidWorkshopScene, type SolidWorkshopTask,
} from '../models/solid-workshop';

const ink = '#234d46', fill = '#b6d4ba';
const outline = `fill="${fill}" stroke="${ink}" stroke-width="1.9" stroke-linejoin="round"`;
const views: Readonly<Record<SolidView, string>> = { angled: 'Viistosta', ends: 'Päädyn suuntaan', side: 'Sivulta' };
const tx = (x: number, y: number, value: string, size = 14) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="700" fill="${ink}">${value}</text>`;
const segment = (x: number, y: number, xx: number, yy: number, weight = 1.8) =>
  `<line x1="${x}" y1="${y}" x2="${xx}" y2="${yy}" stroke="${ink}" stroke-width="${weight}" stroke-linecap="round"/>`;

function endDrawing(shape: Geometry, scale: number, x: number, y: number) {
  if ('base' in shape) {
    return `<polygon points="${shape.base.map(([a, b]) => `${x + a * scale},${y - b * scale}`).join(' ')}" ${outline}/>`;
  }
  return `<circle cx="${x}" cy="${y}" r="${shape.radius * scale}" ${outline}/>`;
}

function sideDrawing(shape: Geometry, scale: number, x: number, y: number) {
  const size = sizeOf(shape), w = size.width * scale, height = size.height * scale;
  if (flat(shape)) return segment(x - w / 2, y, x + w / 2, y);
  if (shape.kind === 'sphere') return endDrawing(shape, scale, x, y);
  if (shape.kind === 'cone' || shape.kind === 'pyramid') {
    const triangle = `<polygon points="${x},${y - height / 2} ${x - w / 2},${y + height / 2} ${x + w / 2},${y + height / 2}" ${outline}/>`;
    if (shape.kind === 'pyramid') {
      return triangle + shape.base.filter(([a]) => a > -size.width / 2 && a < size.width / 2)
        .map(([a]) => `<path d="M${x} ${y - height / 2} L${x + a * scale} ${y + height / 2}" fill="none" stroke="${ink}" stroke-dasharray="3 2" stroke-width="1"/>`).join('');
    }
    return triangle;
  }
  const rectangle = `<rect x="${x - w / 2}" y="${y - height / 2}" width="${w}" height="${height}" ${outline}/>`;
  if (shape.kind !== 'prism') return rectangle;
  return rectangle + [...new Set(shape.base.map(([a]) => a))].filter(a => a > -size.width / 2 && a < size.width / 2)
    .map(a => `<line x1="${x + a * scale}" y1="${y - height / 2}" x2="${x + a * scale}" y2="${y + height / 2}" stroke="${ink}" stroke-dasharray="3 2" stroke-width="1"/>`).join('');
}

function marks(figure: SolidFigure, scale: number, x: number, y: number, labelX: number) {
  const sorted = [...figure.marks ?? []].sort((a, b) => b.position[1] - a.position[1]);
  return sorted.map(({ id, position }, i) => {
    const [px, py] = [x + position[0] * scale, y - position[1] * scale];
    const [lx, ly] = [labelX, 20 + i * 18];
    return segment(px, py, lx - 8, ly - 4, .8)
      + `<circle cx="${px}" cy="${py}" r="2.7" fill="#9d4b1d" stroke="#fffdf5" stroke-width=".8"/>`
      + tx(lx, ly, id, 16);
  }).join('');
}

function cards(model: SolidWorkshopScene) {
  const scale = 36 / Math.max(...model.figures.map(({ geometry }) => Math.max(...Object.values(sizeOf(geometry)))));
  return `<div style="display:flex;min-width:0;gap:.35rem;flex-wrap:wrap">${model.figures.map(figure => {
    const focus = (view: SolidView, x: number, w: number) =>
      `<rect data-projection-focus="${view}" x="${x}" y="6" width="${w}" height="68" rx="6" fill="#e0edcf"
        stroke="#6e9984" stroke-width="1" visibility="${model.view === view ? 'visible' : 'hidden'}"/>`;
    const content = focus('ends', 2, 44) + focus('side', 48, 64)
      + `<g data-projection="end">${endDrawing(figure.geometry, scale, 24, 34)}${tx(24, 68, 'Pääty')}</g>`
      + `<g data-projection="side">${sideDrawing(figure.geometry, scale, 66, 34)}${marks(figure, scale, 66, 34, 102)}${tx(66, 68, 'Sivu')}</g>`;
    const markerLabel = figure.marks?.length ? `, merkinnät ${figure.marks.map(({ id }) => id).join(', ')}` : '';
    const width = 114;
    return `<div style="flex:1 1 104px;min-width:0;max-width:230px;padding:.25rem;text-align:center;border-radius:9px;background:#fffcf1">
      <strong>${figure.id}</strong>${svg(width, 77, content, `${figure.id}, pääty- ja sivukuva${markerLabel}`)}</div>`;
  }).join('')}</div>`;
}

export function solidWorkshopPaint(model: SolidWorkshopScene, definitions?: string, explanation?: string): Paint {
  return (host, context) => {
    host.innerHTML = `<div class="solid-workshop" style="grid-column:1/-1;min-width:0;display:grid;gap:.4rem">
      ${cards(model)}
      <div class="solid-views" role="group" aria-label="Kappaleiden katselusuunta" style="display:flex;gap:.35rem;flex-wrap:wrap">
      ${Object.entries(views).map(([view, label]) =>
        `<button type="button" class="btn small" style="min-height:44px;padding:7px 10px;font-size:14px" data-solid-view="${view}" aria-pressed="${view === model.view}">${label}</button>`).join('')}
      </div>
      ${definitions ? `<p class="small">${definitions}</p>` : ''}
      ${explanation ? `<p class="small">${explanation}</p>` : ''}
      </div>`;
    if (!context?.onViewChange) return;
    const group = host.querySelector('.solid-views')!;
    const change = (event: Event) => {
      if (!(event.target instanceof HTMLElement)) return;
      const selected = event.target.closest<HTMLButtonElement>('button[data-solid-view]');
      if (!selected) return;
      for (const button of group.querySelectorAll('button')) button.setAttribute('aria-pressed', String(button === selected));
      for (const focus of host.querySelectorAll('[data-projection-focus]')) {
        focus.setAttribute('visibility', focus.getAttribute('data-projection-focus') === selected.dataset.solidView ? 'visible' : 'hidden');
      }
      context.onViewChange?.(`solid-view:${selected.dataset.solidView}`);
    };
    group.addEventListener('click', change);
    return () => group.removeEventListener('click', change);
  };
}

const optionStyle = 'width:100%;min-width:0;min-height:44px;border:1px solid #728c82;border-radius:8px;background:#fffdf7;color:#264b48;font:inherit;padding:5px';

export function mountSolidWorkshop(task: SolidWorkshopTask, host: HTMLElement, submit: (response: SolidWorkshopResponse) => void) {
  const form = h('form', { class: 'stack', style: 'gap:.4rem' });
  const fields = h('div', { style: 'display:flex;flex-wrap:wrap;align-items:end;gap:.4rem' });
  const read = task.questions.map(question => {
    if (!question.many) {
      const input = h('select', { 'aria-label': question.label, required: true, style: optionStyle },
        h('option', { value: '', selected: true, disabled: true }, 'Valitse'),
        ...question.options.map(option => h('option', { value: option.id }, option.label)));
      fields.append(h('label', { class: 'stack', style: 'flex:1 1 136px;min-width:0;gap:.2rem;font-size:14px' }, question.label, input));
      return { id: question.id, input, value: () => [input.value] };
    }
    const list = h('div', { style: 'display:flex;flex-wrap:wrap;gap:.18rem .65rem' });
    const options = question.options.map(option => {
      const input = h('input', { type: 'checkbox', value: option.id, 'aria-label': option.label });
      list.append(h('label', { style: 'display:flex;min-height:38px;gap:.28rem;align-items:center;font-size:14px' }, input, option.label));
      return input;
    });
    fields.append(h('fieldset', { style: 'flex:1 0 100%;min-width:0;border:1px solid #aabfb2;border-radius:8px;padding:.15rem .4rem' },
      h('legend', { class: 'small' }, question.label), list));
    return { id: question.id, options, value: () => options.filter(input => input.checked).map(input => input.value) };
  });
  const done = h('button', { type: 'submit', class: 'btn primary' }, 'Tarkista');
  form.append(fields, h('div', {}, done));
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!done.disabled) submit({ kind: task.kind, sets: Object.fromEntries(read.map(field => [field.id, field.value()])) });
  });
  host.append(form);
  return { reveal() {
    const { sets } = solutionSolidWorkshop(task);
    for (const field of read) {
      if (field.input) field.input.value = sets[field.id]?.[0] ?? '';
      for (const input of field.options ?? []) input.checked = !!sets[field.id]?.includes(input.value);
    }
    for (const control of form.querySelectorAll('input, select, button')) (control as HTMLInputElement).disabled = true;
  } };
}
