import type { Paint } from '../../engine/types';
import { h } from '../../ui/dom';
import { svg } from '../../ui/art';
import {
  solutionSpatialMeasure, type AnglePicture, type Point, type SpatialBoard, type SpatialMeasureResponse, type SpatialMeasureTask,
} from '../models/spatial-measures';

const ink = '#24524c', leaf = '#c2d9bb', blue = '#38778d', gold = '#9e5628';
const row = 'display:flex;flex-wrap:wrap;align-items:end;gap:.35rem';
const panel = 'grid-column:1/-1;min-width:0;display:grid;gap:.35rem';
const control = 'min-height:44px;border:1px solid #729285;border-radius:7px;background:#fffdf5;color:#24524c;padding:4px 6px;font:inherit;width:100%;min-width:0';
const pointKey = (p: readonly number[]) => p.join(',');
const text = (x: number, y: number, value: string, size = 12, color = ink) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" fill="${color}" font-weight="700">${value}</text>`;
const dot = (x: number, y: number, r = 3, color = ink) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
const line = (a: Point, b: Point, color = ink, width = 2, dash = '') =>
  `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
const curve = (points: readonly Point[], color: string, closed = false) =>
  points.length ? `<path d="M${points.map(p => p.join(' ')).join('L')}${closed ? 'Z' : ''}" stroke="${color}" stroke-width="2.3" fill="none" stroke-linejoin="round"/>` : '';
const onRay = ([x, y]: Point, angle: number, length: number): Point => [x + length * Math.cos(angle * Math.PI / 180), y - length * Math.sin(angle * Math.PI / 180)];
const addLabel = (label: string, input: HTMLElement, width = 120) =>
  h('label', { class: 'stack', style: `flex:1 1 ${width}px;min-width:0;gap:.2rem;font-size:14px` }, label, input);
const entry = (label: string, type = 'text', attributes: Record<string, number> = {}) =>
  h('input', { type, 'aria-label': label, inputmode: type === 'number' ? 'numeric' : 'text', style: control, ...attributes });
function pick(label: string, options: readonly { id: string; label: string }[]) {
  return h('select', { 'aria-label': label, style: control },
    h('option', { value: '', selected: true, disabled: true }, 'Valitse'), ...options.map(o => h('option', { value: o.id }, o.label)));
}
const button = (caption: string, onclick: () => void) =>
  h('button', { type: 'button', class: 'btn small', style: 'min-height:44px', onclick }, caption);
const empty = (): SpatialMeasureResponse => ({ kind: 'spatial-measures', values: {}, points: [], cells: [], degrees: null, tested: [] });

function gridArt(board: Extract<SpatialBoard, { kind: 'grid' }>, answer: SpatialMeasureResponse) {
  const inset = 20, step = 216 / board.size;
  const toPixel = ([x, y]: Point): Point => [inset + x * step, inset + (board.size - y) * step];
  const ticks = Array.from({ length: board.size + 1 }, (_, i) => {
    const horizontal = line(toPixel([0, i]), toPixel([board.size, i]), '#9db6a6', .7);
    const vertical = line(toPixel([i, 0]), toPixel([i, board.size]), '#9db6a6', .7);
    const label = i % (board.size > 10 ? 2 : 1) ? '' : text(inset + i * step, 251, String(i), 9) + text(8, 239 - i * step, String(i), 9);
    return horizontal + vertical + label;
  }).join('');
  const source = board.path ? curve(board.path.map(toPixel), blue, board.path.length > 2)
    : (board.motifs ?? []).map(motif => {
      const points = motif.map(toPixel);
      return curve(points, blue) + points.map(([x,y], i) => dot(x,y,2.5,blue) + text(x+7,y-5,String(i+1),10,blue)).join('');
    }).join('');
  const pins = board.shown.map((p, i) => {
    const [x, y] = toPixel(p);
    return dot(x, y, board.largePin ? 7 : 3.6, blue) + text(x + 9, y - 5, String.fromCharCode(65 + i), 11, blue);
  }).join('');
  const marks = answer.points.map((p, i) => {
    const [x, y] = toPixel(p);
    return dot(x, y, board.largePin ? 6.5 : 3.7, gold) + text(x - 8, y + 12, String(i + 1), 10, gold);
  }).join('');
  return `<div data-spatial-grid style="max-width:240px;width:100%;margin:auto">${svg(256, 256,
    ticks + source + pins + curve(answer.points.map(toPixel), gold, !!board.path && answer.points.length > 2) + marks, 'Kokonaislukuruudukko')
    .replace('<svg ', '<svg style="max-height:205px" ')}</div>`;
}

function angleArt(picture: AnglePicture, opening: number, inkColor = ink) {
  const { vertex, start, clockwise, lengths } = picture;
  const sign = clockwise ? -1 : 1;
  const startRay = onRay(vertex, start, lengths[0]), endRay = onRay(vertex, start + sign * opening, lengths[1]);
  const arc = Array.from({ length: 25 }, (_, i) => onRay(vertex, start + sign * opening * i / 24, Math.min(25, ...lengths.map(n => n * .53))));
  const labels = picture.names ? [vertex, startRay, endRay].map(([x, y], i) => text(x + 7, y + 11, picture.names![i]!, 12)).join('') : '';
  return line(vertex, startRay, blue, 2.6) + line(vertex, endRay, inkColor, 2.3) + curve(arc, gold) + dot(...vertex, 3.5) + labels;
}
function protractor(center: Point, heading: number) {
  const arc = Array.from({ length: 37 }, (_, i) => onRay(center, heading - i * 5, 70));
  const ticks = Array.from({ length: 37 }, (_, i) => {
    const value = i * 5, axis = heading - value;
    const major = value % 15 === 0;
    return line(onRay(center, axis, 70), onRay(center, axis, major ? 62 : 66), blue, major ? 1.1 : .65);
  }).join('');
  const labels = Array.from({ length: 13 }, (_, i) => {
    const value = i * 15, axis = heading - value;
    return text(...onRay(center, axis, 78), String(value), 9.7, blue)
      + text(...onRay(center, axis, value % 30 === 0 ? 53 : 58), String(180 - value), 9.7, gold);
  }).join('').replaceAll('<text ', '<text paint-order="stroke" stroke="#f8faec" stroke-width="2.5" stroke-linejoin="round" ');
  return { shape: curve(arc, blue) + ticks + line(onRay(center, heading, 70), onRay(center, heading + 180, 70), blue, 1.3)
    + dot(...center, 4, gold), labels };
}
function anglePanel(board: Extract<SpatialBoard, { kind: 'angles' }>, answer: SpatialMeasureResponse) {
  return `<div style="display:flex;justify-content:center;gap:.35rem">${board.angles.map(picture => {
    const proposed = answer.degrees;
    const rays = board.tool === 'draw' && proposed === null
      ? line(picture.vertex, onRay(picture.vertex, picture.start, picture.lengths[0]), blue, 2.6) + dot(...picture.vertex, 3.5)
      : angleArt(picture, board.tool === 'draw' ? proposed ?? 0 : picture.opening);
    const instrument = board.tool === 'protractor' && answer.points.length && proposed !== null ? protractor(answer.points[0]!, proposed) : undefined;
    const marks = board.tool === 'protractor' ? [picture.vertex, [picture.vertex[0] + 21, picture.vertex[1] + 18] as Point,
      [picture.vertex[0] - 21, picture.vertex[1] + 18] as Point].map(([x,y], i) =>
        dot(x, y, 2.7, blue) + text(x + 8, y + 12,
          String.fromCharCode(65 + (i + 3 - (picture.vertex[0] + picture.vertex[1]) % 3) % 3), 11, blue)).join('') : '';
    const title = picture.id ? text(104, 190, picture.showDegrees ? `${picture.id} · ${picture.opening}°` : picture.id, 15) : '';
    return `<div style="flex:1 1 0;min-width:0;max-width:${board.tool === 'protractor' ? 275 : board.tool ? 234 : 159}px">${svg(208, 196,
      (instrument?.shape ?? '') + rays + marks + (instrument?.labels ?? '') + title, picture.id ? `Kulma ${picture.id}` : 'Kulman tarkka piirros')
      .replace('<svg ', board.tool === 'protractor' ? '<svg style="max-height:218px" ' : '<svg ')}</div>`;
  }).join('')}</div>`;
}
function linePanel(board: Extract<SpatialBoard, { kind: 'lines' }>) {
  return `<div style="display:flex;gap:.35rem">${board.lines.map(({ id, style, bearing }) => {
    const center: Point = [55, 35], a = onRay(center, bearing + 180, 29), b = onRay(center, bearing, 29);
    const arrow = (p: Point, angle: number) => line(p, onRay(p, angle + 155, 8)) + line(p, onRay(p, angle - 155, 8));
    const drawing = style === 'arc'
      ? `<path d="M${a.join(' ')} Q${onRay(center, bearing + 90, 23).join(' ')} ${b.join(' ')}" fill="none" stroke="${ink}" stroke-width="2"/>`
      : line(a, b);
    const ends = (style === 'line' ? arrow(a, bearing + 180) : dot(...a)) + (style === 'line' || style === 'ray' ? arrow(b, bearing) : dot(...b));
    return `<div style="flex:1 1 0;min-width:0">${svg(110, 85, drawing + ends + text(55, 78, id, 15), `Piirros ${id}`)}</div>`;
  }).join('')}</div>`;
}
function cellPanel(board: Extract<SpatialBoard, { kind: 'cells' }>, answer: SpatialMeasureResponse) {
  const [width, depth, layers] = board.grid, occupied = new Set(board.cells.map(pointKey)), covered = new Set(answer.cells.map(pointKey));
  return `<div style="display:flex;flex-wrap:wrap;gap:.4rem">${Array.from({ length: layers }, (_, z) => {
    const cells = Array.from({ length: width * depth }, (_, i) => {
      const x = i % width, y = Math.floor(i / width), key = pointKey([x, y, z]);
      const cut = /^([xy])(\d+)$/.exec(answer.values.cut ?? '');
      const inFirst = cut && (cut[1] === 'x' ? x : y) < Number(cut[2]);
      const fill = covered.has(key) || (occupied.has(key) && inFirst) ? '#6f9dca' : occupied.has(key) ? leaf : '#fffdf4';
      return `<rect x="${22 * x + 1}" y="${22 * y + 1}" width="20" height="20" rx="2" stroke="#759589" fill="${fill}"/>`;
    }).join('');
    return `<div style="max-width:132px;flex:1 1 72px">${layers > 1 ? `<strong>Kerros ${z + 1}</strong>` : ''}${svg(width * 22, depth * 22, cells,
      `Kerros ${z + 1}, ${board.unit}`)}</div>`;
  }).join('')}</div>`;
}
function rotationPanel(board: Extract<SpatialBoard, { kind: 'rotation' }>, answer: SpatialMeasureResponse) {
  const origin: Point = [91, 77];
  const label = (i: number) => String.fromCharCode(65 + (i + 3 - board.labelOffset) % 3);
  const centerChoice = answer.points[0];
  const pivot: Point = !centerChoice || pointKey(centerChoice) === pointKey(board.center) ? origin
    : centerChoice[0] > board.center[0] ? [137,90] : [44,87];
  const move = ([x,y]:Point, degrees:number):Point => {
    const angle=degrees*Math.PI/180, dx=x-pivot[0], dy=y-pivot[1];
    return [pivot[0]+dx*Math.cos(angle)+dy*Math.sin(angle),pivot[1]-dx*Math.sin(angle)+dy*Math.cos(angle)];
  };
  const motif = (degrees: number, color: string, width: number) => board.spokes.map((length, i) => {
    const angle = i * 360 / board.spokes.length;
    return line(move(onRay(origin, angle, 15),degrees),move(onRay(origin, angle, length * 8 + 16),degrees),color,width);
  }).join('');
  return `<div style="max-width:172px;margin:auto">${svg(182, 156, motif(0, blue, 4.5)
    + (answer.degrees !== null ? motif(answer.degrees, gold, 2.2) : '') + dot(...origin, 3.5) + (centerChoice ? dot(...pivot, 3, gold) : '')
    + text(100, 91, label(0), 10) + dot(137, 90, 2.8, blue) + text(147, 102, label(1), 10)
    + dot(44, 87, 2.8, blue) + text(36, 98, label(2), 10) + text(91, 150, 'Sininen: malli · ruskea: koe', 10), 'Kierto saman keskipisteen ympäri')}</div>`;
}
function measurePanel(board: Extract<SpatialBoard, { kind: 'measure' }>) {
  const n = board.divisions;
  const matrix = n ? Array.from({ length: n * n }, (_, i) => {
    const step = 66 / n;
    return `<rect x="${(i % n) * step + 3}" y="${Math.floor(i / n) * step + 3}" width="${step}" height="${step}" fill="${leaf}" stroke="${ink}" stroke-width=".45"/>`;
  }).join('') : '';
  return `<div style="display:flex;gap:.5rem;align-items:center">
    ${matrix ? `<div style="flex:0 0 95px">${svg(72, 72, matrix, 'Neliö jakautuu vaaka- ja pystysuunnassa')}</div>` : ''}
    <dl style="display:grid;gap:.2rem .45rem;grid-template-columns:auto minmax(0,1fr);margin:0">
      ${board.givens.map(({ label, value }) => `<dt style="font-weight:700">${label}</dt><dd style="margin:0">${value}</dd>`).join('')}</dl></div>`;
}
function visual(board: SpatialBoard, answer: SpatialMeasureResponse) {
  const diagram = board.kind === 'grid' ? gridArt(board, answer)
    : board.kind === 'angles' ? anglePanel(board, answer)
      : board.kind === 'lines' ? linePanel(board)
        : board.kind === 'cells' ? cellPanel(board, answer)
          : board.kind === 'rotation' ? rotationPanel(board, answer) : measurePanel(board);
  return diagram + ('legend' in board && board.legend ? `<p class="small">${board.legend}</p>` : '');
}
export const spatialMeasureArt = (task: SpatialMeasureTask, solved = false): Paint => host => {
  host.innerHTML = `<div class="spatial-measure-board" style="${panel}">${visual(task.board, solved ? solutionSpatialMeasure(task) : empty())}</div>`;
};

export function mountSpatialMeasure(task: SpatialMeasureTask, host: HTMLElement, submit: (answer: SpatialMeasureResponse) => void) {
  let answer = empty();
  const board = h('div', { class: 'exp-exact spatial-measure-board', style: panel });
  const form = h('form', { class: 'stack', style: 'gap:.4rem' }, board);
  const controls = h('div', { style: row });
  const status = h('p', { class: 'small', 'aria-live': 'polite' });
  const refresh = () => { board.innerHTML = visual(task.board, answer); };
  let cellDetails: HTMLElement | undefined;
  const fieldControls = new Map<string, HTMLInputElement | HTMLSelectElement>();
  const showValue = (id: string, label: string, options?: readonly { id: string; label: string }[]) => {
    const input = options ? pick(label, options) : entry(label);
    const update = () => { answer.values[id] = input.value; if (id === 'cut') refresh(); };
    input.addEventListener(options ? 'change' : 'input', update);
    fieldControls.set(id, input); (cellDetails ?? controls).append(addLabel(label, input));
  };
  const action = task.action;
  let sync = () => {};
  const place = (point: Point, count: number) => {
    answer.points = count === 1 ? [point] : [...answer.points.slice(0, count - 1), point];
    refresh();
    status.textContent = answer.points.map(p => `(${p.join(', ')})`).join(' · ');
  };

  if (action?.kind === 'points' && task.board.kind === 'grid') {
    const size = task.board.size;
    const x = entry('Pisteen x', 'number', { min: 0, max: size, step: 1 });
    const y = entry('Pisteen y', 'number', { min: 0, max: size, step: 1 });
    const mark = () => {
      const point: Point = [x.valueAsNumber, y.valueAsNumber];
      if (point.every(n => Number.isSafeInteger(n) && n >= 0 && n <= size)) place(point, action.count);
      else status.textContent = `Valitse molemmat koordinaatit väliltä 0–${size}.`;
    };
    controls.append(addLabel('x', x, 60), addLabel('y', y, 60), button(action.count === 1 ? 'Merkitse piste' : 'Lisää piste', mark),
      ...(action.count > 1 ? [button('Poista viimeinen', () => {
        answer.points = answer.points.slice(0, -1); refresh();
        status.textContent = answer.points.map(p => `(${p.join(', ')})`).join(' · ');
      })] : []));
    for (const input of [x,y]) input.addEventListener('keydown', event => {
      if (event.key === 'Enter') { event.preventDefault(); mark(); }
    });
    board.addEventListener('click', (event: MouseEvent) => {
      const target = (event.target as Element).closest('[data-spatial-grid] svg') as SVGSVGElement | null;
      const ctm = target?.getScreenCTM();
      if (!target || !ctm || done.disabled) return;
      const pos = target.createSVGPoint(); pos.x = event.clientX; pos.y = event.clientY;
      const local = pos.matrixTransform(ctm.inverse());
      const point: Point = [Math.round((local.x - 20) * size / 216), Math.round((236 - local.y) * size / 216)];
      if (point.every(n => n >= 0 && n <= size)) place(point, action.count);
    });
  }
  if (action?.kind === 'cells' && task.board.kind === 'cells') {
    const [width, height, layers] = task.board.grid;
    const initial = new Set(task.board.cells.map(pointKey));
    const layer = pick('Muokattava kerros', Array.from({ length: layers }, (_, i) => ({ id: String(i), label: `Kerros ${i+1}` })));
    layer.value = '0';
    const editing = h('div', { role: 'group', 'aria-label': 'Asetettavat yksiköt',
      style: `display:grid;grid-template-columns:repeat(${width},44px);gap:2px` });
    const cells = Array.from({ length: width * height }, (_, i) => {
      const x = i % width, y = Math.floor(i / width);
      const key = () => [x, y, Number(layer.value)] as const;
      const node = button('·', () => {
        const p = key(), id = pointKey(p);
        answer.cells = answer.cells.some(c => pointKey(c) === id) ? answer.cells.filter(c => pointKey(c) !== id) : [...answer.cells, p];
        sync(); refresh();
      });
      node.style.padding = '0';
      node.style.borderRadius = '5px';
      editing.append(node);
      return { node, key };
    });
    sync = () => {
      const placed = new Set(answer.cells.map(pointKey));
      cells.forEach(({ node, key }) => {
        const p = key(), id = pointKey(p), on = placed.has(id);
        node.style.background = on ? '#83abd1' : initial.has(id) ? leaf : '#fffdf4';
        node.setAttribute('aria-pressed', String(on));
        node.setAttribute('aria-label', `Kerros ${p[2]+1}, rivi ${p[1]+1}, sarake ${p[0]+1}`);
        node.textContent = on ? '■' : '·';
      });
      status.textContent = `Asetettuja yksiköitä: ${answer.cells.length}`;
    };
    layer.addEventListener('change', sync);
    if (layers > 1) {
      cellDetails = h('div', { style: 'display:grid;min-width:0;gap:.3rem' }, addLabel('Muokattava kerros', layer, 110));
      controls.append(h('div', { style: 'display:grid;grid-template-columns:auto minmax(0,1fr);gap:.55rem;width:100%;align-items:start' },
        editing, cellDetails));
    } else controls.append(editing);
  }
  if (action?.kind === 'degree' || action?.kind === 'protractor') {
    const instrument = action.kind === 'protractor';
    const label = instrument ? 'Mitan pohjaviivan suunta' : 'Oma avautuminen';
    const max = instrument ? 359 : 180;
    const degree = entry(label, 'number', { min: 0, max, step: 1 });
    const set = (n: number | null) => { answer.degrees = n; degree.value = n === null ? '' : String(n); refresh(); };
    degree.addEventListener('input', () => set(Number.isFinite(degree.valueAsNumber) ? degree.valueAsNumber : null));
    const step = instrument ? 15 : 5;
    const move = (delta: number) => {
      const n = (answer.degrees ?? 0) + delta;
      set(instrument ? (n + 360) % 360 : Math.max(0, Math.min(180, n)));
    };
    if (instrument && task.board.kind === 'angles') {
      const [x,y] = task.board.angles[0]!.vertex;
      const marks: Point[] = [[x,y],[x+21,y+18],[x-21,y+18]];
      const order = (x + y) % 3;
      const arranged = [...marks.slice(order), ...marks.slice(0, order)];
      const center = pick('Mitan keskipiste', arranged.map((_, i) => ({ id: String(i), label: String.fromCharCode(65+i) })));
      center.addEventListener('change', () => {
        place(arranged[Number(center.value)]!, 1);
        status.textContent = '';
        if (answer.degrees === null) set(0);
      });
      controls.append(addLabel('Mitan keskipiste', center));
      sync = () => { center.value = answer.points.length ? String(arranged.findIndex(p => pointKey(p) === pointKey(answer.points[0]!))) : '';
        degree.value = answer.degrees === null ? '' : String(answer.degrees); };
    } else sync = () => { degree.value = answer.degrees === null ? '' : String(answer.degrees); };
    controls.append(addLabel(label, degree, 130), button(`−${step}°`, () => move(-step)), button(`+${step}°`, () => move(step)));
    if (instrument) {
      showValue('scale', 'Luettava asteikko', [{ id: 'a', label: 'A · ulompi' }, { id: 'b', label: 'B · sisempi' }]);
      showValue('read', 'Kulmamitan lukema (°)');
    }
  }
  if (action?.kind === 'rotation' && task.board.kind === 'rotation') {
    const { center, labelOffset } = task.board;
    const choices: Point[] = [center, [center[0]+1, center[1]], [center[0], center[1]+1]];
    const candidates = [...choices.slice(labelOffset), ...choices.slice(0,labelOffset)];
    const choose = pick('Kierron keskipiste', candidates.map((_, i) => ({ id: String(i), label: String.fromCharCode(65+i) })));
    const angles = pick('Kokeile kiertoa', [...action.allowed.map(n => ({ id: String(n), label: `${n}°` })), { id: 'none', label: 'Ei sopivaa kiertoa' }]);
    angles.disabled = true;
    choose.addEventListener('change', () => {
      answer.tested = []; answer.degrees = null; angles.value = '';
      place(candidates[Number(choose.value)]!, 1); angles.disabled = false;
    });
    angles.addEventListener('change', () => {
      answer.degrees = angles.value === 'none' ? null : Number(angles.value);
      if (answer.degrees !== null && !answer.tested.includes(answer.degrees)) answer.tested = [...answer.tested, answer.degrees];
      status.textContent = `Kokeiltu: ${answer.tested.map(n => n + '°').join(', ')}`;
      refresh();
    });
    sync = () => { choose.value = answer.points.length ? String(candidates.findIndex(p => pointKey(p) === pointKey(answer.points[0]!))) : '';
      angles.value = answer.degrees === null ? 'none' : String(answer.degrees); };
    controls.append(addLabel('Kierron keskipiste', choose), addLabel('Kokeile kiertoa', angles));
  }
  if (action?.kind === 'partition') {
    showValue('cut', 'Ositus', action.cuts);
    showValue('first', 'Ensimmäisen osan ala');
    showValue('second', 'Toisen osan ala');
    showValue('total', 'Yhteensä');
  }
  for (const field of task.fields) showValue(field.id, field.label, field.kind === 'choice' ? field.options : undefined);
  const done = h('button', { type: 'submit', class: 'btn primary' }, 'Tarkista');
  form.noValidate = true;
  if (cellDetails) {
    cellDetails.append(status, h('div', {}, done));
    form.append(controls);
  } else form.append(controls, ...(action && action.kind !== 'partition' ? [status] : []), h('div', {}, done));
  form.addEventListener('submit', event => { event.preventDefault(); if (!done.disabled) submit(answer); });
  host.append(form); sync(); refresh();
  return { reveal() {
    answer = solutionSpatialMeasure(task);
    for (const [id, input] of fieldControls) input.value = answer.values[id] ?? '';
    sync(); refresh();
    for (const input of form.querySelectorAll('button,input,select')) (input as HTMLInputElement).disabled = true;
  } };
}
