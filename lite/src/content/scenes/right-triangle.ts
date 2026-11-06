import type { Paint } from '../../engine/types';
import {
  TRIANGLE_INDICES, className, ratioName, recordedRightTriangleWork, sideName, sideVertices,
  type Point2, type RightTriangleDiagram, type RightTriangleResponse, type RightTriangleScene, type RightTriangleTask,
  type TriangleIndex, type TriangleJob, type TriangleRule, type TriangleWork, type TrigRatio,
} from '../models/right-triangle';

const SVG = 'http://www.w3.org/2000/svg';
const fmt = (value: number) => String(value).replace('.', ',');
const tones = ['#2b706c', '#aa502f', '#2d5d93'] as const;
const paper = ['#d5e9dc', '#f1d9c3', '#d8e6f7'] as const;
const mid = ([ax, ay]: Point2, [bx, by]: Point2): Point2 => [(ax + bx) / 2, (ay + by) / 2];
const add = ([ax, ay]: Point2, [bx, by]: Point2): Point2 => [ax + bx, ay + by];
const diff = ([ax, ay]: Point2, [bx, by]: Point2): Point2 => [ax - bx, ay - by];
const scale = ([x, y]: Point2, n: number): Point2 => [x * n, y * n];
const unit = (vector: Point2): Point2 => scale(vector, 1 / Math.hypot(...vector));
const pointList = (points: readonly Point2[]): string => points.map(([x, y]) => `${x},${y}`).join(' ');
function svgElement<K extends keyof SVGElementTagNameMap>(tag: K, attributes: Readonly<Record<string, string | number>>) {
  const node = document.createElementNS(SVG, tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, String(value));
  return node;
}

function diagramSVG(board: RightTriangleDiagram, squares: boolean, height: number): SVGSVGElement {
  const [a, b, c] = board.points;
  const centre = scale(add(add(a, b), c), 1 / 3);
  const outward = (side: TriangleIndex) => {
    const [i, j] = sideVertices(side);
    const p = board.points[i], q = board.points[j];
    const [dx, dy] = diff(q, p);
    const normal: Point2 = [-dy, dx];
    const [mx, my] = diff(centre, mid(p, q));
    return mx * normal[0] + my * normal[1] > 0 ? scale(normal, -1) : normal;
  };
  const square = (side: TriangleIndex) => {
    const [i, j] = sideVertices(side);
    const p = board.points[i], q = board.points[j], offset = outward(side);
    return [p, q, add(q, offset), add(p, offset)];
  };
  const outline = squares ? TRIANGLE_INDICES.flatMap(square) : [...board.points];
  const x0 = Math.min(...outline.map(p => p[0])), y0 = Math.min(...outline.map(p => p[1]));
  const x1 = Math.max(...outline.map(p => p[0])), y1 = Math.max(...outline.map(p => p[1]));
  const width = 320;
  const k = Math.min((width - 74) / (x1 - x0), (height - 48) / (y1 - y0));
  const project = ([x, y]: Point2): Point2 => [width / 2 + (x - (x0 + x1) / 2) * k, height / 2 - (y - (y0 + y1) / 2) * k];
  const projected = board.points.map(project);
  const svg = svgElement('svg', { viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-label': diagramDescription(board) });
  svg.style.cssText = `display:block;width:100%;max-height:${height}px`;
  const text = (content: string, point: Point2, color = '#173d48', size = 13) => {
    const label = svgElement('text', { x: point[0], y: point[1], fill: color, 'font-size': size, 'font-weight': 700,
      'text-anchor': 'middle', 'dominant-baseline': 'central', stroke: '#fcf8eb', 'stroke-width': 2.6, 'paint-order': 'stroke' });
    label.textContent = content;
    svg.append(label);
  };
  if (squares) for (const side of TRIANGLE_INDICES) {
    svg.append(svgElement('polygon', { points: pointList(square(side).map(project)), fill: paper[side], stroke: tones[side], 'stroke-width': 1.4 }));
    const [i, j] = sideVertices(side);
    text(`${sideName(board, side)}²`, project(add(mid(board.points[i], board.points[j]), scale(outward(side), 0.46))), tones[side]);
  }
  svg.append(svgElement('polygon', { points: pointList(projected), fill: '#fff9e6', stroke: '#294e54', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }));
  if (board.right !== undefined) {
    const p = projected[board.right]!;
    const [i, j] = sideVertices(board.right);
    const first = scale(unit(diff(projected[i]!, p)), 11), second = scale(unit(diff(projected[j]!, p)), 11);
    svg.append(svgElement('polyline', { points: pointList([add(p, first), add(add(p, first), second), add(p, second)]), fill: 'none', stroke: '#234851', 'stroke-width': 1.8 }));
  }
  if (board.focus !== undefined) {
    const p = projected[board.focus]!;
    const [i, j] = sideVertices(board.focus);
    const u = unit(diff(projected[i]!, p)), v = unit(diff(projected[j]!, p));
    const from = add(p, scale(u, 20)), to = add(p, scale(v, 20));
    const sign = u[0] * v[1] - u[1] * v[0] > 0 ? 1 : 0;
    svg.append(svgElement('path', { d: `M ${from.join(' ')} A 20 20 0 0 ${sign} ${to.join(' ')}`, fill: 'none', stroke: '#aa502f', 'stroke-width': 2.5 }));
  }
  for (const side of TRIANGLE_INDICES) {
    const [i, j] = sideVertices(side);
    const p = projected[i]!, q = projected[j]!, yFlip = outward(side);
    const normal = unit([yFlip[0], -yFlip[1]]);
    const known = board.known[side];
    if (!squares) text(`${sideName(board, side)}${known !== undefined ? ` ${fmt(known)}` : board.target === side ? ' ?' : ''}`, add(mid(p, q), scale(normal, 14)), tones[side]);
    const vertex = projected[side]!;
    text(board.labels[side], add(vertex, scale(unit(diff(vertex, project(centre))), 12)));
  }
  return svg;
}

function diagramDescription(board: RightTriangleDiagram): string {
  const features = [
    board.name,
    board.right === undefined ? '' : `Suora kulma pisteessä ${board.labels[board.right]}`,
    board.focus === undefined ? '' : `Tarkastelukulma pisteessä ${board.labels[board.focus]}${board.markedAngle === undefined ? '' : `, ${fmt(board.markedAngle)}°`}`,
    ...TRIANGLE_INDICES.flatMap(side => board.known[side] === undefined ? [] : [`${sideName(board, side)} ${fmt(board.known[side]!)} ${board.unit}`]),
    board.target === undefined ? '' : `Tuntematon ${sideName(board, board.target)}`,
  ];
  return features.filter(Boolean).join('. ') + '.';
}
export const rightTrianglePaint = (task: RightTriangleTask): Paint => host => {
  const strip = document.createElement('div');
  strip.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(min(174px,100%),1fr));gap:6px';
  for (const [index, board] of task.diagrams.entries()) {
    const card = document.createElement('figure');
    card.style.cssText = 'margin:0;min-width:0';
    const caption = document.createElement('figcaption');
    caption.style.cssText = 'font-size:.84rem;line-height:1.3';
    caption.textContent = diagramDescription(board);
    const squares = task.jobs.some(job => job.kind === 'identity' && job.board === index);
    const height = task.jobs.length >= 3 ? 111 : task.diagrams.length > 1 ? 126 : 164;
    card.append(diagramSVG(board, squares, height), caption);
    strip.append(card);
  }
  host.replaceChildren(strip);
};
export function rightTriangleScene(task: RightTriangleTask): RightTriangleScene | undefined {
  if (!task.setting) return undefined;
  const board = task.diagrams[0]!;
  const xs = board.points.map(point => point[0]), ys = board.points.map(point => point[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const k = 3.3 / Math.max(x1 - x0, y1 - y0);
  return {
    kind: 'right-triangle', mode: task.setting, title: board.name,
    vertices: board.points.map(([x, y]) => [(x - (x0 + x1) / 2) * k, 0.55 + (y - y0) * k, 0]),
    right: board.right, focus: board.focus,
    shownSides: TRIANGLE_INDICES.filter(side => board.known[side] !== undefined),
  };
}

function optionSelect<T extends string>(name: string, options: readonly (readonly [T, string])[]) {
  const select = document.createElement('select');
  select.setAttribute('aria-label', name);
  select.add(new Option('Valitse', ''));
  for (const [value, label] of options) select.add(new Option(label, value));
  return select;
}
const ruleLabels: Readonly<Record<TriangleRule, string>> = {
  'sqrt-sum': 'Neliöiden summa', 'sqrt-difference': 'Neliöiden erotus',
  times: 'Tunnettu pituus × suhdeluku', divide: 'Tunnettu pituus ÷ suhdeluku', inverse: 'Suhteen käänteisfunktio',
};
function calculator(): HTMLElement {
  const disclosure = document.createElement('details');
  const title = document.createElement('summary');
  title.textContent = 'Laskin asteina (DEG)';
  const kinds = [
    ['sin', 'sin(°)'], ['cos', 'cos(°)'], ['tan', 'tan(°)'], ['asin', 'sin⁻¹'], ['acos', 'cos⁻¹'], ['atan', 'tan⁻¹'],
  ] as const;
  const fn = optionSelect('Laskimen toiminto', kinds);
  const input = document.createElement('input');
  input.type = 'text'; input.inputMode = 'decimal'; input.setAttribute('aria-label', 'Laskimen luku tai osamäärä');
  input.size = 10;
  const compute = document.createElement('button');
  compute.type = 'button'; compute.className = 'btn'; compute.textContent = 'Laske';
  const result = document.createElement('output');
  result.setAttribute('aria-live', 'polite');
  compute.onclick = () => {
    const pieces = input.value.trim().replaceAll(',', '.').split('/');
    const values = pieces.map(s => /^[-+]?\d+(?:\.\d+)?$/.test(s.trim()) ? Number(s) : NaN);
    const n = values.length === 1 ? values[0]! : values.length === 2 ? values[0]! / values[1]! : NaN;
    const direct = { sin: Math.sin, cos: Math.cos, tan: Math.tan };
    const inverse = { asin: Math.asin, acos: Math.acos, atan: Math.atan };
    const radians = n * Math.PI / 180;
    const value = !Number.isFinite(n) || (fn.value === 'tan' && Math.abs(Math.cos(radians)) < 1e-12) ? NaN : fn.value in direct
      ? direct[fn.value as keyof typeof direct](radians)
      : fn.value in inverse ? inverse[fn.value as keyof typeof inverse](n) * 180 / Math.PI : NaN;
    result.textContent = Number.isFinite(value) ? fmt(Number(value.toFixed(8))) : 'Tarkista toiminto ja luku.';
  };
  disclosure.append(title, fn, input, compute, result);
  return disclosure;
}

export function mountRightTriangle(task: RightTriangleTask, host: HTMLElement, submit: (response: RightTriangleResponse) => void): { reveal(): void } {
  const wrap = document.createElement('div');
  wrap.dataset.rightTriangle = '';
  const work: TriangleWork[] = task.jobs.map(() => ({}));
  const root = document.createElement('div');
  root.style.cssText = 'display:grid;gap:4px';
  for (const [index, job] of task.jobs.entries()) {
    const board = task.diagrams[job.board]!, draft = work[index]!;
    const fieldset = document.createElement('fieldset');
    const dense = task.jobs.length >= 3;
    fieldset.style.cssText = dense
      ? 'margin:0;padding:0 0 3px;min-width:0;border:0;border-bottom:1px solid #a3b7a4'
      : 'margin:0;padding:3px 6px 5px;min-width:0;border:1px solid #a3b7a4;border-radius:8px';
    const legend = document.createElement('legend');
    legend.textContent = rowLabel(board, job, task.diagrams.length > 1);
    fieldset.append(legend);
    const fields = document.createElement('div');
    fields.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(min(84px,100%),1fr));gap:4px';
    fieldset.append(fields);
    const inputPrefix = task.jobs.length === 1 ? '' : `Rivi ${index + 1}: `;
    const labels = TRIANGLE_INDICES.map(i => [String(i), sideName(board, i)] as const);
    const labelField = (name: string, control: HTMLElement) => {
      const label = document.createElement('label');
      label.style.cssText = 'display:grid;gap:1px;min-width:0;font-size:.82rem';
      control.style.cssText = 'width:100%;min-width:0;min-height:44px;padding:2px 5px;font:inherit;font-size:.9rem';
      label.append(name, control); fields.append(label);
    };
    const select = <T extends string>(name: string, choices: readonly (readonly [T, string])[], commit: (value: T | undefined) => void) => {
      const node = optionSelect(inputPrefix + name, choices);
      node.onchange = () => { commit(node.value ? node.value as T : undefined); update(); };
      labelField(name, node);
    };
    const number = (name: string, key: 'sum' | 'square' | 'value') => {
      const input = document.createElement('input');
      input.type = 'text'; input.inputMode = 'decimal'; input.setAttribute('aria-label', inputPrefix + name);
      input.oninput = () => { draft[key] = input.value; update(); };
      labelField(name, input);
    };
    const sideSelect = (name: string, key: number | 'single') =>
      select(name, labels, value => {
        const side = value === undefined ? undefined : Number(value) as TriangleIndex;
        if (key === 'single') draft.single = side;
        else {
          const pair = [...(draft.pair ?? [])];
          if (side === undefined) delete pair[key]; else pair[key] = side;
          draft.pair = pair;
        }
      });
    const judgment = () => select('Kulman laji', Object.entries(className) as [keyof typeof className, string][], value => { draft.judgment = value; });
    const rule = (choices: TriangleRule[]) => select('Laskutoimitus', choices.map(r => [r, ruleLabels[r]]), value => { draft.rule = value; });
    const ratio = () => select('Suhdefunktio', Object.entries(ratioName) as [TrigRatio, string][], value => { draft.ratio = value; });
    if (job.kind === 'identity') {
      sideSelect('1. neliö vasemmalle', 0); sideSelect('2. neliö vasemmalle', 1);
      sideSelect('Neliö oikealle', 'single'); judgment();
    } else if (job.kind === 'converse') {
      sideSelect('Pisin sivu', 'single');
      number('Lyhyiden neliöiden summa', 'sum'); number('Pisimmän sivun neliö', 'square'); judgment();
    } else if (job.kind === 'pyth-length') {
      sideSelect('1. tunnettu sivu', 0); sideSelect('2. tunnettu sivu', 1);
      rule(['sqrt-sum', 'sqrt-difference']); number('Tuntemattoman neliö', 'square'); number(`Pituus (${board.unit})`, 'value');
    } else {
      ratio(); sideSelect('Osoittajan sivu', 0); sideSelect('Nimittäjän sivu', 1);
      if (job.kind === 'ratio') { if (job.taught || job.calculate) number('Suhteen arvo', 'value'); }
      else if (job.kind === 'trig-side') { rule(['times', 'divide']); number(`Pituus (${board.unit})`, 'value'); }
      else { rule(['inverse', 'times', 'divide']); number('Kulma (°)', 'value'); }
    }
    const preview = document.createElement('output');
    if (dense) {
      preview.style.cssText = 'margin-left:.6em;font-size:.85rem';
      legend.append(preview);
    } else {
      preview.style.cssText = 'display:block;min-height:1.1em;font-size:.85rem';
      fieldset.append(preview);
    }
    function update() {
      const names = draft.pair?.map(side => sideName(board, side));
      if (job.kind === 'identity') {
        preview.textContent = `${names?.[0] ?? '□'}² + ${names?.[1] ?? '□'}² = ${draft.single === undefined ? '□' : sideName(board, draft.single)}²`;
      } else if (job.kind === 'pyth-length') {
        const sign = draft.rule === 'sqrt-difference' ? '−' : draft.rule === 'sqrt-sum' ? '+' : '□';
        const first = draft.pair?.[0], second = draft.pair?.[1];
        const value = (side: TriangleIndex | undefined) => side === undefined ? '□' : board.known[side] === undefined ? sideName(board, side) : fmt(board.known[side]!);
        preview.textContent = `${sideName(board, job.target)}² = ${value(first)}² ${sign} ${value(second)}²`;
      } else if (job.kind === 'converse') {
        preview.textContent = `${draft.sum || '□'} verrattuna lukuun ${draft.square || '□'}`;
      } else {
        const [a, b] = draft.pair ?? [];
        const v = (side: TriangleIndex | undefined) => side === undefined ? '□' : board.known[side] === undefined ? sideName(board, side) : fmt(board.known[side]!);
        const angle = job.kind === 'trig-side' ? `${fmt(job.degrees)}°` : `∠${board.labels[job.focus]}`;
        const functionCall = `${draft.ratio ?? '□'}(${angle})`;
        const isolatedSide = job.kind === 'trig-side' && (draft.rule === 'times' || draft.rule === 'divide')
          ? ` → ${sideName(board, job.target)} = ${v(job.given)} ${draft.rule === 'times' ? '×' : '÷'} ${functionCall}` : '';
        preview.textContent = job.kind === 'trig-angle' && draft.rule === 'inverse'
          ? `${angle} = ${draft.ratio ?? '□'}⁻¹(${v(a)} / ${v(b)})`
          : `${functionCall} = ${v(a)} / ${v(b)}${isolatedSide}`;
      }
    }
    update();
    root.append(fieldset);
  }
  if (task.jobs.some(job => job.kind === 'trig-side' || job.kind === 'trig-angle')) wrap.append(calculator());
  const finish = document.createElement('button');
  finish.className = 'btn'; finish.type = 'button'; finish.textContent = 'Valmis';
  finish.onclick = () => submit({ kind: 'right-triangle', work: work.map(recordedRightTriangleWork) });
  wrap.append(root, finish);
  host.append(wrap);
  return { reveal() { /* Shared feedback shows the authored worked example and diagram. */ } };
}
function rowLabel(board: RightTriangleDiagram, job: TriangleJob, multiple: boolean): string {
  const prefix = multiple && job.kind !== 'identity' ? board.name + ' · ' : '';
  switch (job.kind) {
    case 'identity': return 'Rakenna neliöyhtälö. Luokittele sitten vertailukolmio.';
    case 'converse': return 'Laske ja vertaa pisimmän sivun neliöön.';
    case 'pyth-length': return `Muodosta neliöyhtälö ja ratkaise ${sideName(board, job.target)}.`;
    case 'ratio': return prefix + `∠${board.labels[job.focus]} · ${job.taught ? ratioName[job.taught] : job.offered!.map(side => sideName(board, side)).join(' ja ')}`;
    case 'trig-side': return prefix + `Ratkaise ${sideName(board, job.target)} suhteella ${ratioName[job.taught]}.`;
    case 'trig-angle': return prefix + `Ratkaise kulma ${board.labels[job.focus]} suhteella ${ratioName[job.taught]}.`;
  }
}
