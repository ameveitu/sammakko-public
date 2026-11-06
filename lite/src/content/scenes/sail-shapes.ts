import type { Paint } from '../../engine/types';
import { svg } from '../../ui/art';
import { h } from '../../ui/dom';
import { paint, table } from '../kit';
import {
  checkSailShape, solutionSailShape,
  type BuildShapeTask, type CircleShapeTask, type InspectShapeTask, type NameShapeTask,
  type PathShape, type Point, type SailShapeResponse, type SailShapeTask, type Shape, type ShapeFigure,
} from '../models/sail-shapes';

const ink = '#264b48', leaf = '#add0a0', gold = '#b4642d', blue = '#358189';
const t = (x: number, y: number, label: string, size = 13) =>
  `<text x="${x}" y="${y}" text-anchor="middle" fill="${ink}" font-size="${size}" font-weight="700">${label}</text>`;
const dot = (x: number, y: number, radius = 3, fill = ink) => `<circle cx="${x}" cy="${y}" r="${radius}" fill="${fill}"/>`;
const line = (a: Point, b: Point, stroke = ink, width = 2) =>
  `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"/>`;
const mid = (a: Point, b: Point): Point => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const indexLabel = (index: number) => String.fromCharCode(65 + index);
const layout = (html: string) => `<div class="sail-shape-workbench" style="min-width:0;grid-column:1/-1;display:grid;gap:.45rem">${html}</div>`;

function bounds(shape: PathShape) {
  const xs = shape.points.map(p => p[0]), ys = shape.points.map(p => p[1]);
  return { xmin: Math.min(...xs), xmax: Math.max(...xs), ymin: Math.min(...ys), ymax: Math.max(...ys) };
}
function fittingScale(shape: PathShape) {
  const { xmin, xmax, ymin, ymax } = bounds(shape);
  return Math.min(11, 92 / Math.max(1, xmax - xmin), 63 / Math.max(1, ymax - ymin));
}
function plotted(shape: PathShape, scale = fittingScale(shape)): Point[] {
  const { xmin, xmax, ymin, ymax } = bounds(shape);
  return shape.points.map(([x, y]) => [62 + (x - (xmin + xmax) / 2) * scale, 44 - (y - (ymin + ymax) / 2) * scale]);
}

function visualPath(shape: Extract<Shape, { kind: 'equilateral' }>): PathShape {
  const points: Point[] = [[0, 0], [shape.side, 0], [shape.side / 2, Math.sqrt(3) * shape.side / 2]];
  return { kind: 'path', points: points.map(([x, y]) => [x * shape.a - y * shape.b, x * shape.b + y * shape.a]), closed: true, straight: true };
}
function artShape(shape: Shape, vertices = false, scale?: number) {
  if (shape.kind === 'equilateral') return artShape(visualPath(shape), vertices, scale);
  if (shape.kind !== 'path') {
    const scale = shape.kind === 'ellipse' ? Math.min(7, 39 / shape.rx, 33 / shape.ry) : 0;
    const r = shape.kind === 'ellipse' ? shape.rx * scale : Math.min(33, shape.radius * 6);
    const ry = shape.kind === 'ellipse' ? shape.ry * scale : r;
    const ellipse = `<ellipse cx="62" cy="44" rx="${r}" ry="${ry}" fill="${leaf}" stroke="${ink}" stroke-width="2.2"/>`;
    if (shape.kind === 'circle' && shape.frame) return '<path d="M22 71V23h80v48z" fill="#d6b392" stroke="#574c42" stroke-width="1.8"/>' + ellipse;
    return shape.kind === 'sphere' ? ellipse + `<ellipse cx="62" cy="44" rx="${r * .38}" ry="${r}" fill="none" stroke="${ink}" stroke-width="1.4"/>
      <ellipse cx="62" cy="44" rx="${r}" ry="${r * .32}" fill="none" stroke="${ink}" stroke-width="1.4"/>` : ellipse;
  }
  const points = plotted(shape, scale);
  const [a, b, c, ...rest] = points;
  const edge = shape.straight || !a || !b || !c
    ? `M${points.map(p => p.join(' ')).join(' L')}`
    : `M${a.join(' ')} Q${b.join(' ')} ${c.join(' ')}${rest.map(p => ' L' + p.join(' ')).join('')}`;
  return `<path d="${edge}${shape.closed ? 'Z' : ''}" fill="${shape.closed ? leaf : 'none'}" stroke="${ink}" stroke-width="2.2" stroke-linejoin="round"/>` +
    (vertices ? points.map(([x, y], i) => dot(x, y) + t(x + (x < 62 ? -8 : 8), y + (y < 44 ? -5 : 12), indexLabel(i), 11)).join('') : '');
}

function cards(figures: readonly ShapeFigure[], vertices = false) {
  const scale = Math.min(11, ...figures.flatMap(({ shape }) => shape.kind === 'path' ? [fittingScale(shape)] : shape.kind === 'equilateral' ? [fittingScale(visualPath(shape))] : []));
  return `<div style="display:flex;justify-content:center;gap:.3rem;min-width:0">${figures.map(({ id, shape }) =>
    `<div style="flex:1 1 0;min-width:0;max-width:135px">${svg(124, 104, artShape(shape, vertices, scale) + t(62, 98, id), `Kuvio ${id}`)}</div>`).join('')}</div>`;
}
export const sailCardsArt = (figures: readonly ShapeFigure[], note?: string, vertices = false): Paint =>
  paint(layout(cards(figures, vertices) + (note ? `<p>${note}</p>` : '')));

const formRow = 'display:flex;flex-wrap:wrap;gap:.35rem;align-items:end';
const inputStyle = 'width:100%;min-width:0;min-height:44px;padding:6px 7px;border:1px solid #728c82;border-radius:8px;background:#fffdf7;color:#264b48;font:inherit';
const label = (caption: string, control: HTMLElement, basis = 100) =>
  h('label', { class: 'stack', style: `flex:1 1 ${basis}px;min-width:0;gap:.2rem;font-size:14px` }, caption, control);
const select = (caption: string, options: readonly { id: string; label: string }[]) => h('select', {
  required: true, 'aria-label': caption, style: inputStyle,
}, h('option', { value: '', selected: true, disabled: true }, 'Valitse'),
...options.map(option => h('option', { value: option.id }, option.label)));

function inspectControls(task: InspectShapeTask, controls: HTMLElement) {
  const readers = task.questions.map(q => {
    if (!q.many) {
      const input = select(q.label, q.options);
      controls.append(label(q.label, input, 126));
      return () => input.value ? [input.value] : undefined;
    }
    const group = h('fieldset', {
      style: 'width:100%;min-width:0;padding:.25rem .4rem;border:1px solid #aabfb2;border-radius:8px',
    }, h('legend', { class: 'small' }, q.label));
    const options = h('div', { style: 'display:flex;flex-wrap:wrap;gap:.25rem .65rem' });
    const inputs = q.options.map(option => {
      const input = h('input', { type: 'checkbox', value: option.id, 'aria-label': option.label });
      options.append(h('label', { style: 'display:flex;min-height:30px;align-items:center;gap:.3rem;font-size:14px' }, input, option.label));
      return input;
    });
    group.append(options); controls.append(group);
    return () => inputs.filter(input => input.checked).map(input => input.value);
  });
  return () => {
    const entries = readers.map(read => read());
    if (entries.some(value => value === undefined)) return;
    return { kind: task.kind, activity: task.activity, sets: Object.fromEntries(task.questions.map((q, i) => [q.id, entries[i]!])) } satisfies SailShapeResponse;
  };
}

function inspectPanel(task: InspectShapeTask, response?: SailShapeResponse) {
  const text = response?.activity === 'inspect' ? table(['Havainto', 'Merkintä'], task.questions.map(q => [q.label,
    (response.sets[q.id] ?? []).map(value => q.options.find(option => option.id === value)?.label ?? '').join(', ')])) : '';
  return layout(cards(task.figures, task.markVertices) + (task.note ? `<p>${task.note}</p>` : '') + text);
}

function namePanel(task: NameShapeTask, response?: SailShapeResponse) {
  const points = plotted(task.shape);
  const overlay = task.features.map(({ id, kind, index }) => {
    const p = points[index]!, next = points[(index + 1) % points.length]!, previous = points[(index + points.length - 1) % points.length]!;
    const marked = id === task.target;
    const color = marked ? gold : blue;
    if (kind === 'side') return { id, anchor: mid(p, next), drawing: line(p, next, color, marked ? 4 : 2) };
    if (kind === 'angle') {
      const arm = (end: Point): Point => {
        const length = Math.hypot(end[0] - p[0], end[1] - p[1]);
        return [p[0] + (end[0] - p[0]) * 14 / length, p[1] + (end[1] - p[1]) * 14 / length];
      };
      const a = arm(previous), b = arm(next);
      const [x, y] = mid(a, b);
      return { id, anchor: [(x + p[0]) / 2, (y + p[1]) / 2] as Point,
        drawing: `<path d="M${a.join(' ')} Q${p.join(' ')} ${b.join(' ')}" fill="none" stroke="${color}" stroke-width="3"/>` };
    }
    return { id, anchor: p, drawing: dot(...p, marked ? 5 : 3, color) };
  }).sort((a, b) => a.anchor[1] - b.anchor[1] || a.anchor[0] - b.anchor[0]);
  const leaders = overlay.map(({ anchor: [x, y] }, index) =>
    `<path d="M${x} ${y} L122 ${18 + index * 27} H132" fill="none" stroke="#6f8f83" stroke-width=".9" stroke-dasharray="2 2"/>`).join('');
  const labels = overlay.map(({ id, drawing }, index) => `<g>${drawing}${t(145, 23 + index * 27, id, 14)}</g>`).join('');
  return layout(`<div style="max-width:216px;margin:auto">${svg(162, 100, artShape(task.shape) + leaders + labels,
    `Kuviossa ovat merkinnät ${task.features.map(feature => feature.id).join(', ')}. Yksi on korostettu.`)}</div>` +
    (response?.activity === 'name' ? `<p>Geometrinen nimi: ${task.name}.</p>` : ''));
}

function nameControls(task: NameShapeTask, controls: HTMLElement) {
  const feature = select('Kuvion merkintä', task.features.map(part => ({ id: part.id, label: part.id })));
  const name = h('input', { type: 'text', 'aria-label': 'Oma geometrinen nimi', maxlength: 42, required: true, style: inputStyle });
  controls.append(label('Kuvion merkintä', feature), label('Oma geometrinen nimi', name, 180));
  return () => feature.value && name.value.trim()
    ? { kind: task.kind, activity: task.activity, feature: feature.value, text: name.value } satisfies SailShapeResponse : undefined;
}

const gridInset = 18, gridWidth = 136;
function gridArt(grid: number, vertices: readonly Point[], closed: boolean, description: string) {
  const toPixel = ([x, y]: Point): Point => [gridInset + x * gridWidth / grid, gridInset + gridWidth - y * gridWidth / grid];
  const marks = Array.from({ length: grid + 1 }, (_, i) => Array.from({ length: grid + 1 }, (_, j) => dot(...toPixel([i, j]), 1.45, '#84a69a')).join('')).join('');
  const chosen = vertices.map(toPixel);
  const edges = chosen.length ? `<path d="M${chosen.map(p => p.join(' ')).join(' L')}${closed ? 'Z' : ''}" fill="${closed ? leaf : 'none'}" stroke="${ink}" stroke-width="2.5"/>` : '';
  const labels = chosen.map(([x, y], i) => dot(x, y, 3.2, gold) + t(x + 6, y - 5, String(i + 1), 10)).join('');
  const axis = t(gridInset, gridInset + gridWidth + 14, '0', 10) + t(gridInset + gridWidth, gridInset + gridWidth + 14, String(grid), 10)
    + t(gridInset - 10, gridInset + 3, String(grid), 10);
  return svg(172, 172, marks + edges + labels + axis, description);
}
function buildPanel(task: BuildShapeTask, vertices: readonly Point[], closed: boolean) {
  const modelPoints = task.reference.points.map(([x, y]) => `(${x}, ${y})`).join(' · ');
  return layout(`<div style="display:flex;gap:.4rem;align-items:center">
    <div style="flex:1 1 0;min-width:0;max-width:158px;text-align:center"><p>Mallipurje</p>${gridArt(task.grid, task.reference.points, true, 'Mallipurje ruudukolla')}</div>
    <div class="sail-grid" style="flex:1 1 0;min-width:0;max-width:158px;text-align:center;cursor:crosshair"><p>Oma purje</p>${gridArt(task.grid, vertices, closed, 'Napautettava kokonaislukuruudukko')}</div>
    </div><p>Mallin kärjet: ${modelPoints}. ${task.scale === 2 ? 'Tee sivuista kaksinkertaiset.' : 'Säilytä sivujen pituudet.'}</p>`);
}

function buildControls(task: BuildShapeTask, controls: HTMLElement, board: HTMLElement) {
  let vertices: Point[] = [], closed = false;
  const coordinate = (axis: string) => h('input', { type: 'number', inputmode: 'numeric', min: 0, max: task.grid, step: 1,
    'aria-label': `Pisteen ${axis}`, style: inputStyle });
  const x = coordinate('x'), y = coordinate('y');
  const update = () => {
    board.innerHTML = buildPanel(task, vertices, closed);
    close.setAttribute('aria-pressed', String(closed));
    close.textContent = closed ? 'Avaa kuvio' : 'Sulje kuvio';
    live.textContent = vertices.length ? vertices.map(p => `(${p.join(', ')})`).join(' · ') : 'Ei vielä kärkiä.';
  };
  const add = (point: Point) => {
    if (vertices.length >= 10) return;
    vertices = [...vertices, point]; closed = false; update();
  };
  const addFields = () => {
    const point: Point = [x.valueAsNumber, y.valueAsNumber];
    if (point.some(n => !Number.isInteger(n) || n < 0 || n > task.grid)) {
      live.textContent = `Kirjoita molempiin kenttiin kokonaisluku väliltä 0–${task.grid}.`;
      return;
    }
    add(point);
  };
  const addButton = h('button', { type: 'button', class: 'btn small', onclick: addFields }, 'Lisää piste');
  for (const field of [x, y]) field.addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); addFields(); }
  });
  const close = h('button', { type: 'button', class: 'btn small', onclick: () => { if (vertices.length >= 2) { closed = !closed; update(); } } }, 'Sulje kuvio');
  const undo = h('button', { type: 'button', class: 'btn small', onclick: () => { vertices = vertices.slice(0, -1); closed = false; update(); } }, 'Poista viimeinen');
  const live = h('p', { class: 'small', 'aria-live': 'polite', style: 'width:100%' });
  controls.append(label('Pisteen x', x, 52), label('Pisteen y', y, 52), addButton, close, undo, live);
  board.addEventListener('click', (event: MouseEvent) => {
    if (addButton.disabled || !(event.target instanceof Element)) return;
    const svgElement = event.target.closest('.sail-grid svg') as SVGSVGElement | null;
    const matrix = svgElement?.getScreenCTM();
    if (!svgElement || !matrix) return;
    const point = svgElement.createSVGPoint();
    point.x = event.clientX; point.y = event.clientY;
    const local = point.matrixTransform(matrix.inverse());
    const xx = Math.round((local.x - gridInset) * task.grid / gridWidth);
    const yy = Math.round((gridInset + gridWidth - local.y) * task.grid / gridWidth);
    if (xx >= 0 && yy >= 0 && xx <= task.grid && yy <= task.grid) add([xx, yy]);
  });
  update();
  return () => ({ kind: task.kind, activity: task.activity, vertices, closed } satisfies SailShapeResponse);
}

function circlePanel(task: CircleShapeTask, figureId: string, response?: SailShapeResponse) {
  const figure = task.figures.find(f => f.id === figureId);
  const pick = task.figures.length > 1 ? cards(task.figures) : '';
  if (!figure || figure.shape.kind === 'path' || figure.shape.kind === 'equilateral') return layout(pick + '<p>Valitse tutkittava kuvio.</p>');
  const { shape } = figure;
  const radius = Math.max(...task.points.map(p => Math.hypot(...p.at)));
  const size = Math.min(50, radius * 6.5);
  const rx = shape.kind === 'ellipse' ? shape.rx * size / Math.max(shape.rx, shape.ry) : size;
  const ry = shape.kind === 'ellipse' ? shape.ry * size / Math.max(shape.rx, shape.ry) : size;
  const toPixel = ([x, y]: Point): Point => [76 + x * rx / radius, 61 - y * ry / radius];
  const points = Object.fromEntries(task.points.map(point => [point.id, toPixel(point.at)]));
  const shown = response?.activity === 'circle' ? response : undefined;
  const segments = task.segments.map(segment => line(points[segment.a]!, points[segment.b]!,
    shown?.diameter === segment.id ? gold : shown?.radii.includes(segment.id) ? blue : '#879b93',
    shown?.diameter === segment.id || shown?.radii.includes(segment.id) ? 3.5 : 1.5)).join('');
  const marks = task.points.map(({ id }) => {
    const [x, y] = points[id]!;
    return dot(x, y, 3.3, shown?.center === id ? gold : ink) + t(x + (x > 76 ? 9 : -9), y + (y < 61 ? -5 : 12), id, 14);
  }).join('');
  const name = (id: string) => {
    const segment = task.segments.find(segment => segment.id === id)!;
    return `${segment.a}–${segment.b}`;
  };
  const answered = shown ? `<p>Keskipiste ${shown.center}. Säteet ${shown.radii.map(name).join(' ja ')}. Halkaisija ${name(shown.diameter)}.</p>` : '';
  const description = 'Pisteet: ' + task.points.map(({ id }) => id).join(' · ') + '. Tarkista janojen päätepisteet kuvasta.';
  const detail = `<ellipse cx="76" cy="61" rx="${rx}" ry="${ry}" fill="${leaf}" stroke="${ink}" stroke-width="2"/>`;
  const volume = shape.kind === 'sphere' ? `<ellipse cx="76" cy="61" rx="${rx}" ry="${ry * .31}" fill="none" stroke="#527e76"/><ellipse cx="76" cy="61" rx="${rx * .38}" ry="${ry}" fill="none" stroke="#527e76"/>` : '';
  return layout(pick + `<div style="display:flex;gap:.5rem;align-items:center"><div style="flex:0 0 150px">${svg(152, 118,
    detail + volume + segments + marks, `Kuvio ${figureId}: merkityt pisteet ja janat`)}</div>
    <p class="sail-circle-coords" style="font-size:14px">${description}</p></div>` + answered);
}

function circleControls(task: CircleShapeTask, controls: HTMLElement, board: HTMLElement) {
  const chooseFigure = task.figures.length > 1;
  const figure = select('Valittu kuvio', task.figures.map(({ id }) => ({ id, label: `Kuvio ${id}` })));
  const center = select('Keskipiste', task.points.map(({ id }) => ({ id, label: id })));
  const segments = task.segments.map(({ id, a, b }) => ({ id, label: `${a}–${b}` }));
  const first = select('Ensimmäinen säde', segments), second = select('Toinen säde', segments), diameter = select('Halkaisija', segments);
  const figureId = () => chooseFigure ? figure.value : task.figures[0]!.id;
  if (chooseFigure) {
    controls.append(label('Valittu kuvio', figure, 100));
    figure.addEventListener('change', () => { board.innerHTML = circlePanel(task, figureId()); });
  }
  controls.append(label('Keskipiste', center, 100), label('Ensimmäinen säde', first, 120), label('Toinen säde', second, 105), label('Halkaisija', diameter, 100));
  board.innerHTML = circlePanel(task, figureId());
  return () => ({ kind: task.kind, activity: task.activity, figure: figureId(), center: center.value,
    radii: [first.value, second.value], diameter: diameter.value } satisfies SailShapeResponse);
}

function panel(task: SailShapeTask, response?: SailShapeResponse): string {
  if (task.activity === 'build') return buildPanel(task, response?.activity === 'build' ? response.vertices : [], response?.activity === 'build' && response.closed);
  if (task.activity === 'name') return namePanel(task, response);
  if (task.activity === 'circle') return circlePanel(task, response?.activity === 'circle' ? response.figure : task.figures.length === 1 ? task.figures[0]!.id : '', response);
  return inspectPanel(task, response);
}

export const sailTaskArt = (task: SailShapeTask): Paint => paint(panel(task, solutionSailShape(task)));

export function mountSailShape(task: SailShapeTask, host: HTMLElement, submit: (response: SailShapeResponse) => void) {
  const board = h('div', { class: 'exp-exact' });
  const controls = h('div', { style: formRow });
  const status = h('p', { 'aria-live': 'polite', class: 'small' });
  const form = h('form', { class: 'stack', style: 'gap:.45rem', ...(task.activity === 'build' ? { novalidate: true } : {}) }, board, controls);
  const done = h('button', { type: 'submit', class: 'btn primary' }, 'Tarkista');
  form.append(h('div', { style: 'display:flex;align-items:center;gap:.5rem' }, done, status));
  host.append(form);
  board.innerHTML = panel(task);
  const read = task.activity === 'build' ? buildControls(task, controls, board)
    : task.activity === 'name' ? nameControls(task, controls)
    : task.activity === 'circle' ? circleControls(task, controls, board)
    : inspectControls(task, controls);
  const show = (response: SailShapeResponse, message: string) => {
    board.innerHTML = panel(task, response);
    form.querySelectorAll('input, select, button').forEach(control => (control as HTMLInputElement).disabled = true);
    status.textContent = message;
  };
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (done.disabled) return;
    const response = read();
    if (!response) { status.textContent = 'Täydennä merkinnät.'; return; }
    if (checkSailShape(task, response).ok) show(response, 'Merkinnät tarkistettu.');
    submit(response);
  });
  return { reveal: () => show(solutionSailShape(task), 'Malliratkaisu.') };
}
