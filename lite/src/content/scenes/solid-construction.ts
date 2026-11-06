import type { Paint } from '../../engine/types';
import { h } from '../../ui/dom';
import { svg } from '../../ui/art';
import {
  cellKey, solutionSolidConstruction, type SolidCell, type SolidConstructionResponse, type SolidConstructionScene, type SolidConstructionTask,
} from '../models/solid-construction';
import type { SolidPoint, SolidView } from '../models/solid-workshop';

const row = 'display:flex;flex-wrap:wrap;gap:.35rem;align-items:center';
const ink = '#264d46';
const axes = 'Rivit etenevät takaa eteen ja sarakkeet vasemmalta oikealle.';
const viewLabels = { angled: 'Viistosta', ends: 'Edestä', side: 'Sivulta' };
const buttonStyle = 'min-height:44px';
const coord = (x: number, z: number) => `sarake ${x + 1}, rivi ${z + 1}`;

function bindViews(host: HTMLElement, onViewChange?: (view: string) => void, redraw?: (view: SolidView) => void) {
  if (!onViewChange && !redraw) return;
  const controls = host.querySelector('[role="group"]')!;
  const change = (event: Event) => {
    if (!(event.target instanceof Element)) return;
    const selected = event.target.closest<HTMLButtonElement>('button[data-construction-view]');
    const view = selected?.dataset.constructionView;
    if (view !== 'angled' && view !== 'ends' && view !== 'side') return;
    for (const button of controls.querySelectorAll('button')) button.setAttribute('aria-pressed', String(button === selected));
    redraw?.(view);
    onViewChange?.(`solid-view:${view}`);
  };
  controls.addEventListener('click', change);
  return () => controls.removeEventListener('click', change);
}

export function constructionBoard(model: SolidConstructionScene): Paint {
  return (host, context) => {
    const [width, height, depth] = model.grid;
    const occupied = new Set(model.referenceCells.map(cellKey));
    const boards = Array.from({ length: height }, (_, y) => {
      const cells = Array.from({ length: width * depth }, (_, i) => [i % width, y, Math.floor(i / width)] as const);
      const filled = cells.filter(cell => occupied.has(cellKey(cell)));
      const description = filled.length ? filled.map(([x, , z]) => coord(x, z)).join('; ') : 'tyhjä';
      return `<div style="flex:0 1 154px;padding:.25rem .4rem;background:#fffcf2;border-radius:8px">
        <strong>Kerros ${y + 1}</strong>${svg(27 * width + 14, 23 * depth + 14,
        cells.map(([x, , z]) => `<rect x="${x * 27 + 14}" y="${z * 23 + 14}" width="25" height="21" rx="2"
          fill="${occupied.has(cellKey([x, y, z])) ? '#70a995' : '#fffef6'}" stroke="#587f73"/>`).join('')
          + Array.from({ length: width }, (_, x) => `<text x="${27 + 27 * x}" y="10" text-anchor="middle" font-size="9" fill="${ink}">${x + 1}</text>`).join('')
          + Array.from({ length: depth }, (_, z) => `<text x="6" y="${29 + 23 * z}" text-anchor="middle" font-size="9" fill="${ink}">${z + 1}</text>`).join(''),
        `Mallin kerros ${y + 1}: ${description}`)}</div>`;
    }).join('');
    host.innerHTML = `<div class="solid-construction-reference" style="grid-column:1/-1;min-width:0;display:grid;gap:.35rem">
      <p class="small">1 · Mallin kerrokset. ${axes}</p>
      <div style="display:flex;gap:.45rem">${boards}<div data-build-projection style="flex:0 1 95px"></div></div>
      <div role="group" aria-label="Rakennelmien katselusuunta" style="${row}">
      ${Object.entries(viewLabels).map(([view, label]) => `<button type="button" class="btn small" data-construction-view="${view}"
        style="${buttonStyle}" aria-pressed="${view === model.view}">${label}</button>`).join('')}</div></div>`;
    if (!context?.onViewChange) return;
    const overlay = host.querySelector('[data-build-projection]')!;
    return bindViews(host, context.onViewChange, view => {
      if (view === 'angled') { overlay.replaceChildren(); return; }
      const limit = view === 'ends' ? width : depth;
      const occupied = new Set(model.referenceCells.map(([x, y, z]) => `${view === 'ends' ? x : z}:${y}`));
      const title = view === 'ends' ? 'Edestä' : 'Sivulta';
      overlay.innerHTML = `<strong>${title}</strong>` + svg(20 * limit, 23 * height,
        Array.from({ length: limit * height }, (_, i) => {
          const x = i % limit, y = Math.floor(i / limit);
          const fill = occupied.has(`${x}:${height - 1 - y}`) ? '#70a995' : '#fffef6';
          return `<rect x="${x * 20 + 1}" y="${y * 23 + 1}" width="18" height="21" fill="${fill}" stroke="#587f73"/>`;
        }).join(''), `Mallin siluetti, ${title.toLowerCase()}`);
    });
  };
}

export interface PolyMarker {
  id: string;
  feature: 'face' | 'edge' | 'vertex';
  points: readonly SolidPoint[];
  highlight?: boolean;
}
export interface PolyDiagram {
  id: string;
  vertices: readonly SolidPoint[];
  edges: readonly (readonly [number, number])[];
  markers: readonly PolyMarker[];
}
export const polyDiagram = (diagram: PolyDiagram, view: SolidView = 'angled') => {
  const raw = ([x, y, z]: SolidPoint) => view === 'ends' ? [x * .98 - z * .23, -z * .75 - y * .30] as const
    : view === 'side' ? [x * .98 + z * .12, -y + z * .10] as const
      : [x * .87 - z * .68, -y + .34 * (x + z)] as const;
  const points = diagram.vertices.map(raw);
  const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
  const left = Math.min(...xs), right = Math.max(...xs), top = Math.min(...ys), bottom = Math.max(...ys);
  const scale = Math.min(77 / Math.max(1, right - left), 50 / Math.max(1, bottom - top));
  const plot = (p: SolidPoint) => {
    const [x, y] = raw(p);
    return [57 + (x - (right + left) / 2) * scale, 33 + (y - (bottom + top) / 2) * scale] as const;
  };
  const lines = diagram.edges.map(([i, j]) => {
    const [a, b] = [plot(diagram.vertices[i]!), plot(diagram.vertices[j]!)];
    return `<path d="M${a.join(' ')}L${b.join(' ')}" stroke="#71958b" stroke-width="1.2" stroke-dasharray="3 2" fill="none"/>`;
  }).join('');
  const markers = diagram.markers.map(marker => {
    const points = marker.points.map(plot);
    const x = points.reduce((sum, p) => sum + p[0], 0) / points.length;
    const y = points.reduce((sum, p) => sum + p[1], 0) / points.length;
    const stroke = marker.highlight ? '#9c4a18' : '#2b7168';
    const shape = marker.feature === 'face' ? `<polygon points="${points.map(p => p.join(',')).join(' ')}" fill="${stroke}" fill-opacity=".23" stroke="${stroke}" stroke-width="1.8"/>`
      : marker.feature === 'edge' ? `<polyline points="${points.map(p => p.join(',')).join(' ')}" fill="none" stroke="${stroke}" stroke-width="2.8"/>`
        : `<circle cx="${x}" cy="${y}" r="3.6" fill="${stroke}"/>`;
    return { id: marker.id, x, y, stroke, shape };
  }).sort((a, b) => a.y - b.y);
  const marked = markers.map(({ id, x, y, stroke, shape }, i) => {
    const labelY = 9 + (i + .5) * 49 / markers.length;
    return shape + `<path d="M${x} ${y}L107 ${labelY}H116" stroke="${stroke}" stroke-width=".9" stroke-dasharray="2 2" fill="none"/>
      <text x="120" y="${labelY + 3}" font-size="11" font-weight="700" fill="${ink}">${id}</text>`;
  }).join('');
  return svg(147, 68, lines + marked, `Malli ${diagram.id}, merkityt kohdat ${diagram.markers.map(m => m.id).join(', ')}`);
};
export function solidNamingArt(diagrams: readonly PolyDiagram[], example?: string): Paint {
  return (host, context) => {
    host.innerHTML = `<div class="solid-naming-board" style="grid-column:1/-1;display:flex;gap:.4rem;flex-wrap:wrap">
      ${diagrams.map(d => `<div style="flex:1 1 130px;max-width:238px;background:#fffcf3;padding:.35rem;border-radius:8px">
        <strong>${d.id}</strong><div data-poly-projection>${polyDiagram(d)}</div></div>`).join('')}
      ${example ? `<p style="width:100%">${example}</p>` : ''}
      <div role="group" aria-label="Kappaleiden katselusuunta" style="${row};width:100%">
      ${Object.entries({ ...viewLabels, ends: 'Päädyn suuntaan' }).map(([view, label]) =>
        `<button type="button" class="btn small" data-construction-view="${view}" style="${buttonStyle}"
        aria-pressed="${view === 'angled'}">${label}</button>`).join('')}</div></div>`;
    if (!context?.onViewChange) return;
    const projections = host.querySelectorAll('[data-poly-projection]');
    return bindViews(host, context.onViewChange, view => {
      diagrams.forEach((diagram, i) => { projections[i]!.innerHTML = polyDiagram(diagram, view); });
    });
  };
}

export function mountSolidConstruction(
  task: SolidConstructionTask,
  host: HTMLElement,
  submit: (answer: SolidConstructionResponse) => void,
  onChange?: (answer: SolidConstructionResponse) => void,
) {
  const form = h('form', { class: 'stack', style: 'gap:.4rem' });
  const button = h('button', { type: 'submit', class: 'btn primary' }, 'Tarkista');
  let read: () => SolidConstructionResponse;
  let show: (answer: SolidConstructionResponse) => void;
  if (task.activity === 'build') {
    const [width, height, depth] = task.scene.grid;
    const chosen = new Map<string, SolidCell>();
    const controls = new Map<string, HTMLButtonElement>();
    read = () => ({ kind: task.kind, activity: task.activity, cells: [...chosen.values()] });
    const live = h('p', { class: 'small', 'aria-live': 'polite' });
    const sync = () => {
      for (const [id, control] of controls) {
        const selected = chosen.has(id);
        control.setAttribute('aria-pressed', String(selected));
        control.textContent = selected ? '■' : '·';
        control.style.background = selected ? '#8cbeaa' : '#fffdf2';
      }
      live.textContent = `Omassa mallissa on ${chosen.size} ${chosen.size === 1 ? 'palikka' : 'palikkaa'}.`;
    };
    const layers = Array.from({ length: height }, (_, y) => {
      const layer = h('div', { style: `display:grid;grid-template-columns:repeat(${width}, minmax(40px, 1fr));gap:2px` });
      for (let z = 0; z < depth; z++) for (let x = 0; x < width; x++) {
        const cell = [x, y, z] as const, id = cellKey(cell);
        const control = h('button', {
          type: 'button', 'aria-label': `Kerros ${y + 1}, ${coord(x, z)}`,
          style: 'min-width:0;min-height:42px;color:#21483f;border:1px solid #749388;border-radius:4px;font-size:20px',
          onclick: () => {
            if (chosen.has(id)) chosen.delete(id);
            else chosen.set(id, cell);
            sync();
            onChange?.(read());
          },
        });
        controls.set(id, control);
        layer.append(control);
      }
      return h('fieldset', { style: 'flex:0 1 145px;min-width:0;margin:0;border:1px solid #aabfb2;border-radius:8px;padding:.25rem' },
        h('legend', { class: 'small' }, `2 · Oma kerros ${y + 1}`), layer);
    });
    form.append(h('div', { style: row }, ...layers), live);
    sync();
    show = answer => {
      if (answer.activity !== 'build') return;
      chosen.clear();
      answer.cells.forEach(cell => chosen.set(cellKey(cell), cell));
      sync();
    };
  } else {
    const fieldStyle = 'width:100%;min-width:0;min-height:44px;border:1px solid #728c82;border-radius:8px;background:#fffdf7;color:#264b48;font:inherit;padding:5px';
    const rows = task.fields.map(({ id, label, options }) => {
      const select = h('select', { 'aria-label': `${label}: merkki`, required: true, style: fieldStyle },
        h('option', { value: '', disabled: true, selected: true }, 'Valitse'), ...options.map(mark => h('option', { value: mark }, mark)));
      const input = h('input', { 'aria-label': `${label}: oma termi`, type: 'text', maxlength: 36, required: true, style: fieldStyle });
      form.append(h('fieldset', { style: 'margin:0;min-width:0;border:1px solid #aabfb2;border-radius:8px;padding:.25rem .4rem' },
        h('legend', { class: 'small' }, label), h('div', { style: row },
          h('label', { class: 'stack', style: 'flex:1 1 68px;gap:.2rem' }, 'Merkki', select),
          h('label', { class: 'stack', style: 'flex:2 1 130px;gap:.2rem' }, 'Oma geometrinen termi', input))));
      return { id, select, input };
    });
    read = () => ({ kind: task.kind, activity: task.activity,
      entries: Object.fromEntries(rows.map(({ id, select, input }) => [id, { mark: select.value, term: input.value }])) });
    show = answer => {
      if (answer.activity !== 'name') return;
      rows.forEach(({ id, select, input }) => {
        select.value = answer.entries[id]!.mark;
        input.value = answer.entries[id]!.term;
      });
    };
  }
  form.append(h('div', {}, button));
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!button.disabled) submit(read());
  });
  host.append(form);
  return { reveal() {
    show(solutionSolidConstruction(task));
    for (const element of form.querySelectorAll('button,input,select')) (element as HTMLButtonElement).disabled = true;
  } };
}
