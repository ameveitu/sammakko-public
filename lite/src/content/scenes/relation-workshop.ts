import type { Paint } from '../../engine/types';
import { h } from '../../ui/dom';
import { parseMeasure } from '../models/spatial-measures';
import { evaluateRelationFunction, relationLineSamples, solutionRelationWorkshop,
  type CalculableFunction, type LinearEquation, type PlottedFunction, type RelationAxis, type RelationPoint,
  type RelationWorkshopResponse, type RelationWorkshopTask, type SystemWork, type ZeroWork } from '../models/relation-workshop';

const stack = 'display:grid;gap:5px';
const row = 'display:flex;flex-wrap:wrap;align-items:center;gap:5px 8px';
const panel = `${stack};padding:6px 8px;background:#edf4e9;border:1px solid #a2bfb1;border-radius:9px`;
const field = 'box-sizing:border-box;min-height:44px;min-width:0;max-width:100%;border:1px solid #81a493;border-radius:8px;padding:4px 6px;background:#fffdf6;color:#163e36;font:inherit';
const kind = 'relation-workshop' as const;
const note = (text: string) => h('p', { style: 'margin:0;color:#3b5e52;font-size:14px' }, text);
const bold = (text: string) => h('strong', {}, text);
const action = (name: string, run: () => void) => h('button', { type: 'button', class: 'btn small', style: 'min-height:44px;min-width:44px', onclick: run }, name);

function input(name: string, title = name, width = 64) {
  const control = h('input', { 'aria-label': name, type: 'text', inputmode: 'text', autocomplete: 'off',
    style: `${field};width:${width}px;text-align:center` });
  return { control, node: h('label', { style: row }, title, control), get: () => parseMeasure(control.value) ? control.value.trim() : '', set: (value: string) => { control.value = value; } };
}
function pick<T extends string>(name: string, options: readonly (readonly [T, string])[], title = name, placeholder = 'Valitse') {
  const control = h('select', { 'aria-label': name, style: field },
    h('option', { value: '' }, placeholder), ...options.map(([id, text]) => h('option', { value: id }, text)));
  return { control, node: h('label', { style: row }, title, control), get: () => (control.value || null) as T | null,
    set: (value: T | null) => { control.value = value ?? ''; } };
}
const yesNo = [['yes', 'Kyllä'], ['no', 'Ei']] as const;
const solutionTypes = [['one', 'Yksi yhteinen ratkaisu'], ['none', 'Ei yhteistä ratkaisua'], ['many', 'Äärettömän monta yhteistä ratkaisua']] as const;
const variables = [['x', 'x'], ['y', 'y']] as const;
const bool = (state: 'yes' | 'no' | null) => state === null ? null : state === 'yes';
const yes = (state: boolean | null) => state === null ? null : state ? 'yes' : 'no';

type Mode = RelationWorkshopTask['mode'];
type Task<M extends Mode> = Extract<RelationWorkshopTask, { mode: M }>;
type Answer<M extends Mode> = Extract<RelationWorkshopResponse, { mode: M }>;
type Work<M extends Mode> = { node: HTMLElement; read(): Answer<M>; show(a: Answer<M>): void; ready?(): boolean };
const answer = <M extends Mode>(mode: M) => ({ kind, mode });
const signed = (value: number | string) => String(value).replaceAll('-', '−').replace('.', ',');
function variableTerm(a: number, variable: string) {
  return a === 0 ? '' : a === 1 ? variable : a === -1 ? `−${variable}` : `${signed(a)}${variable}`;
}
function joinTerms(a: string, b: string) {
  if (!a) return b || '0';
  if (!b) return a;
  return b.startsWith('−') ? `${a} − ${b.slice(1)}` : `${a} + ${b}`;
}
const equationText = ([a, b, c]: LinearEquation) => `${joinTerms(variableTerm(a, 'x'), variableTerm(b, 'y'))} = ${signed(c)}`;
const affineText = (a: number, b: number) => joinTerms(variableTerm(a, 'x'), b === 0 ? '' : signed(b));
const functionText = (fn: CalculableFunction) => `f(x) = ${fn.kind === 'affine' ? affineText(fn.a, fn.b) : `(${affineText(fn.a, fn.b)})(${affineText(fn.c, fn.d)})`}`;
function number(value: string | undefined) {
  const r = value && parseMeasure(value);
  return r ? Number(r[0]) / Number(r[1]) : NaN;
}
const point = (name: string, title = name, width = 64) => {
  const x = input(`${name}, x`, 'x', width), y = input(`${name}, y`, 'y', width);
  return { node: h('div', { style: row }, bold(title), x.node, y.node), fields: [x.control, y.control],
    get: (): RelationPoint => ({ x: x.get(), y: y.get() }), set(p: RelationPoint) { x.set(p.x); y.set(p.y); } };
};
const blank = { x: '', y: '' };
const originalChecks = () => [input('Vasen puoli 1', 'Ehto 1'), input('Vasen puoli 2', 'Ehto 2')] as const;

function ratio(task: Task<'direct'>): Work<'direct'> {
  const values = task.rows.map((item, i) => item.x === '0' ? null : input(`Rivi ${i + 1}, suhde y/x`, '', 81));
  const origin = input('Nollan syötteen tulos', 'Kun x = 0, y =');
  const proportional = pick('Sopiiko suoraan verrannollisuuteen?', yesNo, 'Vakiosuhde ja nollatulos?');
  const table = h('table', { style: 'width:100%;border-collapse:collapse;text-align:center;font-size:14px' },
    h('thead', {}, h('tr', {}, ...[task.xName, task.yName, 'y / x'].map(text => h('th', { scope: 'col' }, text)))),
    h('tbody', {}, ...task.rows.map(({ x, y }, i) => h('tr', {}, h('td', {}, signed(x)), h('td', {}, signed(y)),
      h('td', {}, values[i]?.control ?? note('Ei määritelty'))))));
  return { node: h('div', { style: panel }, table, h('div', { style: row }, task.rows.some(r => r.x === '0') ? origin.node : null, proportional.node)),
    read: () => ({ ...answer('direct'), values: values.flatMap(value => value ? [value.get()] : []), y0: origin.get(), proportional: bool(proportional.get()) }),
    show(a) { let next = 0; values.forEach(value => { if (value) value.set(a.values[next++]!); }); origin.set(a.y0); proportional.set(yes(a.proportional)); },
  };
}
function inverse(task: Task<'inverse'>): Work<'inverse'> {
  const values = task.rows.map((_, i) => input(`Rivi ${i + 1}, tulo x·y`, '', 81));
  const zero = pick('Onko x = 0 suljettu pois?', yesNo, 'Jääkö x = 0 pois?');
  const proportional = pick('Onko tulo vakio?', yesNo, 'Vakiotulo?');
  const condition = pick('Mikä pidetään mallissa vakiona?', [
    ['work', 'Sama työ ja samanlaiset pumput'], ['area', 'Sama suorakulmion pinta-ala'], ['speed', 'Sama matkan nopeus'],
  ] as const, 'Mallin vakioehto');
  const table = h('table', { style: 'width:100%;border-collapse:collapse;text-align:center;font-size:14px' },
    h('thead', {}, h('tr', {}, ...[task.xName, task.yName, 'x · y'].map(text => h('th', { scope: 'col' }, text)))),
    h('tbody', {}, ...task.rows.map(({ x, y }, i) => h('tr', {}, h('td', {}, signed(x)), h('td', {}, signed(y)), h('td', {}, values[i]!.control)))));
  return { node: h('div', { style: panel }, table, h('div', { style: row }, proportional.node, zero.node), condition.node),
    read: () => ({ ...answer('inverse'), values: values.map(value => value.get()), proportional: bool(proportional.get()),
      zeroExcluded: bool(zero.get()), condition: condition.get() ?? '' }),
    show(a) { values.forEach((value, i) => value.set(a.values[i]!)); proportional.set(yes(a.proportional));
      zero.set(yes(a.zeroExcluded)); condition.set(a.condition as 'area' | 'work'); },
  };
}
function concept(task: Task<'system-concept'>): Work<'system-concept'> {
  const rows = task.candidates.map((_, i) => ({
    a: input(`Pari ${i + 1}, ehto 1`, '', 65), b: input(`Pari ${i + 1}, ehto 2`, '', 65),
    fits: pick(`Pari ${i + 1}, sopiiko kumpaankin?`, yesNo, '', 'Molemmat?'),
  }));
  const type = pick('Ratkaisujoukon laji', solutionTypes, 'Ratkaisuja');
  const factor = input('Toisen vasemman puolen kerroin', 'Kerroin'), scaledRhs = input('Skaalattu ensimmäinen oikea puoli', 'Uusi oikea puoli');
  const related = h('div', { style: stack }, note('Jos yhtälöiden vasemmat puolet ovat monikertoja, kerro ensimmäinen yhtälö toisen vasemman puolen muotoon.'),
    h('div', { style: row }, factor.node, scaledRhs.node));
  const draw = () => { related.style.display = type.get() === 'none' || type.get() === 'many' ? 'grid' : 'none'; };
  type.control.addEventListener('change', draw); draw();
  const table = h('table', { style: 'width:100%;text-align:center;border-collapse:collapse;font-size:14px' },
    h('thead', {}, h('tr', {}, ...['(x, y)', 'Vasen 1', 'Vasen 2', 'Sopiiko?'].map(title => h('th', { scope: 'col' }, title)))),
    h('tbody', {}, ...task.candidates.map((p, i) => h('tr', {}, h('th', { scope: 'row' }, `(${signed(p.x)}, ${signed(p.y)})`),
      ...[rows[i]!.a.control, rows[i]!.b.control, rows[i]!.fits.control].map(control => h('td', {}, control))))));
  return { node: h('div', { style: panel }, table, type.node, related),
    read: () => ({ ...answer('system-concept'), rows: rows.map(({ a, b, fits }) => ({ left: [a.get(), b.get()], fits: bool(fits.get()) })),
      type: type.get(), factor: factor.get(), scaledRhs: scaledRhs.get() }),
    show(a) { rows.forEach(({ a: first, b, fits }, i) => {
      first.set(a.rows[i]!.left[0]); b.set(a.rows[i]!.left[1]); fits.set(yes(a.rows[i]!.fits));
    }); type.set(a.type); factor.set(a.factor); scaledRhs.set(a.scaledRhs); draw(); },
  };
}
function algebra(task: Task<'system-algebra'>): Work<'system-algebra'> {
  const method = pick('Ratkaisumenetelmä', [['eliminate', 'Eliminointi'], ['substitute', 'Sijoitus']] as const, 'Menetelmä');
  const canceled = pick('Eliminoitava muuttuja', variables, 'Poista');
  const m = input('Ensimmäisen yhtälön kerroin', 'Kerro 1', 59), n = input('Toisen yhtälön kerroin', 'Kerro 2', 59);
  const origin = pick('Yhtälö, josta muuttuja erotetaan', [['0', 'Ehto 1'], ['1', 'Ehto 2']] as const, 'Erota ehdosta');
  const isolated = pick('Erotettava muuttuja', variables, 'Muuttuja');
  const slope = input('Erotetun lausekkeen toisen muuttujan kerroin', '', 59), offset = input('Erotetun lausekkeen vakio', '', 59);
  const coefficient = input('Syntyneen yhtälön muuttujakerroin', '', 61), rhs = input('Syntyneen yhtälön oikea puoli', '', 61);
  const p = point('Ratkaisupari', 'Oma ratkaisupari');
  const checks = [1, 2].map(i => ({
    ax: input(`Ehto ${i}, x-termin arvo`, 'x-termi', 61),
    by: input(`Ehto ${i}, y-termin arvo`, 'y-termi', 61),
    lhs: input(`Vasen puoli ${i}`, 'Summa', 61),
  }));
  const remaining = h('strong');
  const showIsolation = h('strong'), isolationTerm = h('strong');
  const el = h('div', { style: stack },
    note('Kerro molemmat alkuperäiset yhtälöt valitsemillasi nollasta poikkeavilla kertoimilla. Laske saadut yhtälöt yhteen.'),
    h('div', { style: row }, canceled.node, m.node, n.node));
  const sub = h('div', { style: stack }, h('div', { style: row }, origin.node, isolated.node),
    h('div', { style: row }, showIsolation, slope.node, isolationTerm, offset.node));
  const second = h('div', { style: stack }, h('div', { style: row }, bold('Saatu yhtälö'), coefficient.node, remaining, rhs.node));
  function draw() {
    const current = method.get();
    el.style.display = current === 'eliminate' ? 'grid' : 'none';
    sub.style.display = current === 'substitute' ? 'grid' : 'none';
    second.style.display = current ? 'grid' : 'none';
    const target = current === 'eliminate' ? canceled.get() : isolated.get(), other = target === 'x' ? 'y' : target === 'y' ? 'x' : '?';
    showIsolation.textContent = `${target ?? '?'} =`;
    isolationTerm.textContent = `· ${other} +`;
    remaining.textContent = `· ${other} =`;
  }
  for (const pick of [method, canceled, isolated]) pick.control.addEventListener('change', draw);
  if (task.method !== 'either') method.set(task.method);
  draw();
  return { node: h('div', { style: panel }, task.method === 'either' ? method.node : note(task.method === 'eliminate' ? 'Menetelmä: eliminointi' : 'Menetelmä: sijoitus'),
    el, sub, second, p.node, note('Laske x-termi ja y-termi erikseen kummassakin alkuperäisessä yhtälössä.'),
    ...checks.map(({ ax, by, lhs }, i) => h('div', { style: row }, bold(`Ehto ${i + 1}`), ax.node, by.node, lhs.node))),
    read() {
      const common = { coefficient: coefficient.get(), rhs: rhs.get() };
      const current = method.get();
      const work: SystemWork | null = current === 'eliminate' ? { method: current, canceled: canceled.get(), first: m.get(), second: n.get(), ...common } :
        current === 'substitute' ? { method: current, original: origin.get() === '0' ? 0 : origin.get() === '1' ? 1 : null,
          isolated: isolated.get(), slope: slope.get(), offset: offset.get(), ...common } : null;
      return { ...answer('system-algebra'), work, point: p.get(),
        checks: checks.map(({ ax, by, lhs }) => ({ ax: ax.get(), by: by.get(), lhs: lhs.get() })) as Answer<'system-algebra'>['checks'] };
    },
    show(result) {
      const work = result.work;
      if (work) {
        method.set(work.method); coefficient.set(work.coefficient); rhs.set(work.rhs);
        if (work.method === 'eliminate') { canceled.set(work.canceled); m.set(work.first); n.set(work.second); }
        else { origin.set(work.original === null ? null : work.original === 0 ? '0' : '1'); isolated.set(work.isolated); slope.set(work.slope); offset.set(work.offset); }
      }
      p.set(result.point);
      checks.forEach(({ ax, by, lhs }, i) => { ax.set(result.checks[i]!.ax); by.set(result.checks[i]!.by); lhs.set(result.checks[i]!.lhs); });
      draw();
    },
  };
}

const ns = 'http://www.w3.org/2000/svg';
function svgNode<K extends keyof SVGElementTagNameMap>(name: K, attributes: Record<string, number | string>, content?: string) {
  const element = document.createElementNS(ns, name);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
  if (content !== undefined) element.textContent = content;
  return element;
}
const stroke = (x1: number, y1: number, x2: number, y2: number, color = '#365e51', width = 1, dash = '') =>
  svgNode('line', { x1, y1, x2, y2, stroke: color, 'stroke-width': width, 'stroke-dasharray': dash });
const caption = (x: number, y: number, content: string, anchor = 'middle', size = 12) =>
  svgNode('text', { x, y, fill: '#163d36', 'font-size': size, 'font-weight': 650, 'text-anchor': anchor }, content);
const gridValues = ([a, b]: readonly [number, number], step: number) => Array.from({ length: Math.round((b - a) / step) + 1 }, (_, i) => a + i * step);
const inBounds = (n: number, range: readonly [number, number]) => Number.isFinite(n) && n >= range[0] && n <= range[1];
let clipCounter = 0;
function graphSvg(axis: RelationAxis, lines: readonly LinearEquation[], fn: PlottedFunction | undefined, marks: readonly RelationPoint[],
  onPick?: (point: RelationPoint) => void) {
  const x1 = 38, x2 = 352, y1 = 13, y2 = 145, width = x2 - x1, height = y2 - y1;
  const x = (v: number) => x1 + (v - axis.x[0]) / (axis.x[1] - axis.x[0]) * width;
  const y = (v: number) => y2 - (v - axis.y[0]) / (axis.y[1] - axis.y[0]) * height;
  const xAxis = y(0), yAxis = x(0);
  const svg = svgNode('svg', { viewBox: '0 0 375 173', role: 'img', 'aria-label':
    `Koordinaatisto. x ${signed(axis.x[0])}–${signed(axis.x[1])}, y ${signed(axis.y[0])}–${signed(axis.y[1])}. x-jaon väli ${signed(axis.xStep)}. ${lines.length ? 'Ehto yksi yhtenäinen, ehto kaksi katkoviiva.' : ''}`,
  style: 'display:block;width:100%;height:auto;max-height:186px' });
  const graph = svgNode('rect', { x: x1, y: y1, width, height, fill: '#f7f8ec', stroke: '#9db5a9', 'stroke-width': .8 });
  const grid = [
    ...gridValues(axis.x, axis.xStep).flatMap(n => [stroke(x(n), y1, x(n), y2, '#b7cbbc', Number.isInteger(n) ? .82 : .44),
      ...(Number.isInteger(n) ? [caption(x(n), y2 + 15, signed(n))] : [])]),
    ...gridValues(axis.y, axis.yStep).flatMap(n => [stroke(x1, y(n), x2, y(n), '#b7cbbc', n % 2 ? .50 : .8),
      ...(n % 2 === 0 ? [caption(x1 - 6, y(n) + 4, signed(n), 'end')] : [])]),
    stroke(x1, xAxis, x2, xAxis, '#456f5d', 1.6), stroke(yAxis, y1, yAxis, y2, '#456f5d', 1.6),
    caption(x2 + 12, xAxis + 4, 'x'), caption(yAxis + 10, y1 - 2, 'y'),
  ];
  const clipId = `relation-plot-${++clipCounter}`;
  const defs = svgNode('defs', {});
  const clip = svgNode('clipPath', { id: clipId });
  clip.append(svgNode('rect', { x: x1, y: y1, width, height })); defs.append(clip);
  const curves = svgNode('g', { 'clip-path': `url(#${clipId})` });
  lines.forEach((line, i) => {
    const points = relationLineSamples(line, axis);
    if (points.length < 2) return;
    const [a, b] = points;
    curves.append(stroke(x(number(a!.x)), y(number(a!.y)), x(number(b!.x)), y(number(b!.y)),
      i ? '#975933' : '#346f69', i ? 2.2 : 3.3, i ? '7 5' : ''));
  });
  if (fn) {
    const coords = gridValues(axis.x, .0625).map(raw => `${x(raw)} ${y(number(evaluateRelationFunction(fn, String(raw))))}`);
    curves.append(svgNode('path', { d: `M ${coords.join(' L ')}`, fill: 'none', stroke: '#346f69', 'stroke-width': 2.8 }));
  }
  const chosen = marks.flatMap((p, i) => {
    const xx = number(p.x), yy = number(p.y);
    if (!inBounds(xx, axis.x) || !inBounds(yy, axis.y)) return [];
    return [svgNode('circle', { cx: x(xx), cy: y(yy), r: 4.8, fill: i ? '#b77847' : '#d6a064', stroke: '#654531', 'stroke-width': 1.2,
      'data-relation-mark': i + 1 })];
  });
  svg.append(defs, graph, ...grid, curves, ...chosen);
  if (onPick) {
    svg.style.cursor = 'crosshair';
    svg.addEventListener('click', event => {
      const transform = svg.getScreenCTM();
      if (!transform) return;
      const raw = svg.createSVGPoint(); raw.x = event.clientX; raw.y = event.clientY;
      const local = raw.matrixTransform(transform.inverse());
      if (local.x < x1 || local.x > x2 || local.y < y1 || local.y > y2) return;
      const snap = (fraction: number, extent: readonly [number, number], step: number) =>
        extent[0] + Math.round(fraction * (extent[1] - extent[0]) / step) * step;
      onPick({ x: signed(snap((local.x - x1) / width, axis.x, axis.xStep)), y: signed(snap((y2 - local.y) / height, axis.y, axis.yStep)) });
    });
  }
  return svg;
}
function plottedText(axis: RelationAxis, lines: readonly LinearEquation[], fn: PlottedFunction | undefined) {
  const samples = h('details', { style: 'font-size:13px' }, h('summary', {}, 'Kuvaajan näytepisteet tekstinä'));
  if (fn) {
    const values = gridValues(axis.x, axis.xStep).map(x => `(${signed(x)}, ${signed(evaluateRelationFunction(fn, String(x))!)})`);
    samples.append(note(values.join(' · ')));
  }
  lines.forEach(([a, b, c], i) => {
    if (!b) {
      samples.append(note(`Ehto ${i + 1}: x on koko näkyvällä suoralla ${signed(c / a)}.`));
      return;
    }
    const examples = gridValues(axis.x, axis.xStep).flatMap(x => {
      const y = (c - a * x) / b;
      return inBounds(y, axis.y) ? [`(${signed(x)}, ${signed(String(2 * (c - a * x)) + '/' + String(2 * b))})`] : [];
    });
    samples.append(note(`Ehto ${i + 1}: ${examples.join(' · ')}.`));
  });
  return samples;
}
function plot(axis: RelationAxis, lines: readonly LinearEquation[] = [], fn?: PlottedFunction,
  onPick?: (p: RelationPoint) => void, textAlternative = true) {
  const diagram = h('div', { 'data-relation-plot': '' });
  const legend = note(`Ruudukon askel: x ${signed(axis.xStep)}, y ${signed(axis.yStep)}.`);
  const samples = textAlternative ? plottedText(axis, lines, fn) : null;
  const node = h('div', { style: stack }, diagram, legend, samples);
  const draw = (marks: readonly RelationPoint[]) => diagram.replaceChildren(graphSvg(axis, lines, fn, marks, onPick));
  draw([]);
  return { node, draw, diagram, legend, samples };
}

function systemGraph(task: Task<'system-graph'>): Work<'system-graph'> {
  const type = pick('Suorien yhteiset pisteet', solutionTypes, 'Ratkaisuja');
  const a = point('Piste 1', 'Piste 1', 50), b = point('Piste 2', 'Piste 2', 50);
  const [first, second] = originalChecks();
  const checks = h('div', { style: row }, first.node, second.node);
  const goal = note('Valitse ratkaisujoukon laji ja merkitse pisteet.');
  let next = 0;
  const graphic = plot(task.axis, task.equations, undefined, p => {
    if (!type.get()) return;
    if (type.get() === 'one' || next === 0) a.set(p); else b.set(p);
    next = next ? 0 : 1; draw();
  });
  graphic.node.style.gap = '3px';
  function draw() {
    const selected = type.get();
    a.node.style.display = selected ? 'flex' : 'none';
    b.node.style.display = selected === 'none' || selected === 'many' ? 'flex' : 'none';
    checks.style.display = selected === 'one' ? 'flex' : 'none';
    goal.textContent = selected === 'one' ? 'Merkitse yhteinen piste. Laske sillä molempien yhtälöiden vasemmat puolet.'
      : selected === 'many' ? 'Merkitse kaksi eri pistettä, jotka kuuluvat molempiin suoriin.'
        : selected === 'none' ? 'Piste 1 yhtenäiseltä, piste 2 katkoviivalta. Sama x, pystysuorilla sama y.'
          : 'Valitse ratkaisujoukon laji. Voit kirjoittaa koordinaatit tai napauttaa ruudukkoa.';
    graphic.draw(!selected ? [] : selected === 'one' ? [a.get()] : [a.get(), b.get()]);
  }
  for (const field of [...a.fields, ...b.fields]) field.addEventListener('input', draw);
  type.control.addEventListener('change', () => { next = 0; draw(); });
  draw();
  return { node: h('div', { style: `${panel};gap:3px` }, graphic.node, type.node, goal, h('div', { style: row }, a.node, b.node), checks),
    read: () => ({ ...answer('system-graph'), type: type.get(), points: type.get() === 'one' ? [a.get()] : [a.get(), b.get()],
      checks: [first.get(), second.get()] }),
    show(result) { type.set(result.type); a.set(result.points[0] ?? blank); b.set(result.points[1] ?? blank);
      first.set(result.checks[0]); second.set(result.checks[1]); draw(); },
  };
}
function intercept(task: Task<'intercept'>): Work<'intercept'> {
  const value = input('Funktion arvo f(0)', 'f(0)'), start = input('Tilanteen alkuarvo', `Alkuarvo (${task.unit})`);
  const p = point('Y-akselin piste');
  const meaning = pick('Mitä alkuarvo kuvaa?', [
    ['at-zero', 'y-arvoa, kun x = 0'], ['zero-crossing', 'x-arvoa, kun y = 0'], ['change', 'Muutosta yhdellä x-askeleella'],
  ] as const, 'Merkitys');
  const graphic = plot(task.axis, [], task.view === 'graph' ? task.fn : undefined, value => { p.set(value); draw(); }, task.view === 'graph');
  function draw() { graphic.draw([p.get()]); }
  p.fields.forEach(input => input.addEventListener('input', draw)); draw();
  return { node: h('div', { style: panel }, graphic.node, p.node, h('div', { style: row }, value.node, start.node), meaning.node),
    read: () => ({ ...answer('intercept'), value: value.get(), point: p.get(), initial: start.get(), interpretation: meaning.get() ?? '' }),
    show(a) { value.set(a.value); p.set(a.point); start.set(a.initial); meaning.set(a.interpretation as 'at-zero'); draw(); },
  };
}

function calculation(fn: CalculableFunction) {
  const parts = fn.kind === 'affine' ? 1 : 2;
  const equations = Array.from({ length: parts }, (_, i) => ({ coefficient: input(`Yhtälö ${i + 1}, x:n kerroin`, '', 57),
    rhs: input(`Yhtälö ${i + 1}, oikea puoli`, '', 57) }));
  const solved = Array.from({ length: parts }, (_, i) => ({ root: input(`Laskettu nollakohta ${i + 1}`, 'x', 61),
    terms: Array.from({ length: parts }, (_, j) => input(`Nollakohta ${i + 1}, sijoitus ${j + 1}`,
      fn.kind === 'affine' ? 'a·x' : `T${j + 1}`, 55)),
    check: input(`Sijoituksen tulos ${i + 1}`, 'f(x)', 57) }));
  const source = h('p', { 'data-relation-formula': '', style: 'margin:0;font-size:19px;font-weight:720' }, functionText(fn));
  const description = fn.kind === 'factored' ? 'Aseta tekijät nollaksi ja kirjaa yhtälöt ennen jakoa.' :
    'Aseta f(x) = 0. Kirjaa yhtälö ennen jakoa.';
  return {
    source, node: h('div', { style: stack }, note(description),
      h('div', { style: `${row};column-gap:18px` }, ...equations.map(({ coefficient, rhs }, i) =>
        h('div', { style: row }, bold(`${i + 1}.`), coefficient.node, bold('· x ='), rhs.node))),
      note(fn.kind === 'affine' ? 'Laske nollakohdassa a·x ja f(x).' : 'Laske tekijät T1, T2 alkuperäisessä järjestyksessä ja niiden tulo.'),
      ...solved.map(({ root, terms, check }) => h('div', { style: row }, root.node, ...terms.map(term => term.node), check.node))),
    read(): ZeroWork {
      const pairs = solved.map(({ root, terms, check }) =>
        ({ root: root.get().trim(), terms: terms.map(term => term.get()), value: check.get() })).filter(({ root }) => root.length);
      return { equations: equations.map(({ coefficient, rhs }) => ({ coefficient: coefficient.get(), rhs: rhs.get() })),
        roots: pairs.map(({ root }) => root), substitutions: pairs.map(({ terms, value }) => ({ terms, value })) };
    },
    show(a: ZeroWork) { equations.forEach((field, i) => { field.coefficient.set(a.equations[i]!.coefficient); field.rhs.set(a.equations[i]!.rhs); });
      solved.forEach(({ root, terms, check }, i) => {
        root.set(a.roots[i] ?? ''); check.set(a.substitutions[i]?.value ?? '');
        terms.forEach((term, j) => term.set(a.substitutions[i]?.terms[j] ?? ''));
      }); },
  };
}
function zeroCalc(task: Task<'zero-calc'>): Work<'zero-calc'> {
  const calc = calculation(task.fn);
  return { node: h('div', { style: panel }, calc.source, calc.node), read: () => ({ ...answer('zero-calc'), ...calc.read() }), show: calc.show };
}

function graphRoots(task: Task<'zero-graph'> | Task<'zero-integration'>, canEdit = () => true) {
  const roots = [input('Kuvaajan nollakohta 1', 'x₁'), input('Kuvaajan nollakohta 2', 'x₂')] as const;
  const graphic = plot(task.axis, [], task.fn, p => {
    if (!canEdit()) return;
    const next = roots.find(input => !input.get()) ?? roots[1];
    next.set(p.x); draw();
  });
  const inputs = h('div', { style: row }, ...roots.map(value => value.node));
  function draw() { graphic.draw(roots.map(root => ({ x: root.get(), y: '0' }))); }
  roots.forEach(input => input.control.addEventListener('input', draw));
  return { view: graphic.node, diagram: graphic.diagram, legend: graphic.legend, samples: graphic.samples, inputs,
    read: () => roots.map(input => input.get().trim()).filter(Boolean),
    set(values: readonly string[]) { roots.forEach((input, i) => input.set(values[i] ?? '')); draw(); },
    lock() { roots.forEach(input => { input.control.disabled = true; }); },
  };
}
function zeroGraph(task: Task<'zero-graph'>): Work<'zero-graph'> {
  const type = pick('Näkyykö nollakohtia?', [['listed', 'Näkyy yksi tai useampi'], ['none', 'Ei näy tällä välillä']] as const);
  let locked = false;
  const roots = graphRoots(task, () => !locked && type.get() === 'listed');
  const redraw = () => {
    const present = type.get() === 'listed';
    roots.inputs.style.display = present ? 'flex' : 'none';
    if (!present) roots.set([]);
  };
  type.control.addEventListener('change', redraw); redraw();
  return { node: h('div', { style: panel }, roots.view, type.node, roots.inputs),
    read: () => { locked = true; return { ...answer('zero-graph'), rootType: type.get(), roots: roots.read() }; },
    show(a) { type.set(a.rootType); redraw(); roots.set(a.roots); locked = true; },
  };
}
function zeroIntegration(task: Task<'zero-integration'>): Work<'zero-integration'> {
  let locked = false;
  const roots = graphRoots(task, () => !locked);
  const calc = calculation(task.fn);
  const step = h('div', { style: 'display:none' });
  const receipt = note('');
  const head = h('div', {}, roots.view);
  const summary = h('div', { style: stack }, receipt, calc.source, roots.legend.cloneNode(true));
  const lock = action('Lukitse kuvaajan nollakohdat', () => {
    if (!roots.read().length) return;
    locked = true; open();
    step.querySelector<HTMLElement>('input')?.focus({ preventScroll: true });
  });
  function open() {
    step.style.display = locked ? 'block' : 'none';
    if (locked) {
      step.replaceChildren(calc.node); roots.lock(); lock.disabled = true; lock.hidden = true; lock.style.display = 'none';
      const graphic = roots.diagram.querySelector('svg');
      if (graphic) { graphic.style.maxHeight = '125px'; graphic.style.cursor = 'default'; graphic.style.pointerEvents = 'none'; }
      head.style.cssText = 'display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:7px;align-items:center';
      if (roots.samples) summary.append(roots.samples);
      head.replaceChildren(roots.diagram, summary);
      roots.inputs.style.display = 'none';
      receipt.textContent = `Lukittu kuvaajahavainto: ${roots.read().map(signed).join(' ja ')}.`;
    }
  }
  return { node: h('div', { style: panel }, head, roots.inputs, lock, step),
    ready: () => locked,
    read: () => ({ ...answer('zero-integration'), graph: roots.read(), locked, ...calc.read() }),
    show(a) { roots.set(a.graph); calc.show(a); locked = true; open(); },
  };
}

export function relationWorkshopBoard(task: RelationWorkshopTask): Paint {
  return host => {
    const content = h('div', { 'data-relation-givens': '', style: stack }, note(task.setting));
    if ('equations' in task) {
      content.append(h('div', { style: row }, ...task.equations.map((line, i) =>
        h('span', { 'data-relation-equation': i + 1, style: 'border-radius:7px;padding:4px 6px;background:#f7f7ea' },
          bold(`${i + 1}. `), equationText(line)))));
    } else if (task.mode === 'intercept' && task.view === 'formula') {
      content.append(h('strong', { 'data-relation-formula': '', style: 'font-size:19px' }, functionText(task.fn)));
    } else if (task.mode === 'zero-graph') {
      content.append(note(`Näkyvä x-väli ${signed(task.axis.x[0])}…${signed(task.axis.x[1])}, molemmat rajat mukana.`));
    } else if (task.mode === 'zero-integration') {
      content.append(note('Voit kirjoittaa tarkan desimaalin tai murtoluvun. Täytä vain tarvittavat nollakohdat.'));
    }
    host.replaceChildren(content);
  };
}
export function mountRelationWorkshop(task: RelationWorkshopTask, host: HTMLElement, submit: (answer: RelationWorkshopResponse) => void): { reveal(): void } {
  function mount<M extends Mode>(work: Work<M>) {
    const done = h('button', { type: 'submit', class: 'btn primary wide', 'data-relation-submit': '' }, 'Tarkista merkinnät');
    const form = h('form', { 'data-relation-workbench': task.mode, style: stack }, work.node, done);
    let locked = false;
    const refresh = () => { if (!locked) done.disabled = work.ready?.() === false; };
    refresh(); form.addEventListener('click', refresh);
    function freeze() {
      locked = true;
      for (const control of form.querySelectorAll('input,button,select')) control.setAttribute('disabled', '');
      // Coordinate picking and keyboard entry are the same mathematical input.
      for (const svg of form.querySelectorAll('svg')) svg.style.pointerEvents = 'none';
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (locked || work.ready?.() === false) return;
      const a = work.read();
      freeze(); submit(a);
    });
    host.append(form);
    return { reveal() { work.show(solutionRelationWorkshop(task) as Answer<M>); freeze(); } };
  }
  switch (task.mode) {
    case 'direct': return mount(ratio(task));
    case 'inverse': return mount(inverse(task));
    case 'system-concept': return mount(concept(task));
    case 'system-algebra': return mount(algebra(task));
    case 'system-graph': return mount(systemGraph(task));
    case 'intercept': return mount(intercept(task));
    case 'zero-calc': return mount(zeroCalc(task));
    case 'zero-graph': return mount(zeroGraph(task));
    case 'zero-integration': return mount(zeroIntegration(task));
  }
}
export function relationWorkshopExample(task: RelationWorkshopTask): Paint {
  return host => {
    const givens = h('div'), work = h('div');
    relationWorkshopBoard(task)(givens);
    mountRelationWorkshop(task, work, () => {}).reveal();
    work.querySelector('[data-relation-submit]')?.remove();
    host.replaceChildren(givens, work);
  };
}
