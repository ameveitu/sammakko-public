import type { Paint } from '../../engine/types';
import { h } from '../../ui/dom';
import { evaluateGardenCurve, gardenNumber, gardenWitness, solutionFunctionGarden,
  type FunctionGardenResponse, type FunctionGardenTask, type GardenAxis, type GardenCurve,
  type GardenDirection, type GardenInterval, type GardenPattern, type GardenPoint, type GardenRule, type GardenSign } from '../models/function-garden';

type Mode = FunctionGardenTask['mode'];
type Task<M extends Mode> = Extract<FunctionGardenTask, { mode: M }>;
type Answer<M extends Mode> = Extract<FunctionGardenResponse, { mode: M }>;
type Work<M extends Mode> = { node: HTMLElement; read(): Answer<M>; show(response: Answer<M>): void; ready?(): boolean };
const kind = 'function-garden' as const;
const stack = 'display:grid;gap:4px';
const row = 'display:flex;align-items:center;flex-wrap:wrap;gap:3px 7px';
const panel = `${stack};border:1px solid #a0b9a7;background:#eef4e7;border-radius:10px;padding:5px 7px`;
const field = 'box-sizing:border-box;min-height:44px;min-width:44px;max-width:100%;border:1px solid #729786;border-radius:8px;color:#173f39;background:#fffef5;font:inherit;padding:4px 5px';
const attr = (id: string) => `data-garden-${id}`;
const note = (text: string) => h('p', { style: 'margin:0;line-height:1.23;font-size:14px;color:#28544a' }, text);
const button = (text: string, run: () => void) => h('button', { type: 'button', class: 'btn small', style: 'min-height:44px;min-width:44px', onclick: run }, text);
const name = (value: number | string) => String(value).replaceAll('-', '−').replace('.', ',');
const parse = (raw: string) => {
  const q = gardenNumber(raw);
  return q ? Number(q[0]) / Number(q[1]) : NaN;
};
function input(accessible: string, title = accessible, width = 58) {
  const control = h('input', { 'aria-label': accessible, type: 'text', autocomplete: 'off', style: `${field};width:${width}px;text-align:center` });
  return { control, node: h('label', { style: row }, title, control), get: () => {
    const text = control.value.trim();
    return gardenNumber(text) ? text : '';
  }, set: (value: string) => { control.value = value; } };
}
function select<T extends string>(accessible: string, options: readonly (readonly [T, string])[], title = accessible, blank = '—') {
  const control = h('select', { 'aria-label': accessible, style: field }, h('option', { value: '' }, blank),
    ...options.map(([id, label]) => h('option', { value: id }, label)));
  return { control, node: h('label', { style: row }, title, control), get: () => (control.value || null) as T | null,
    set: (value: T | null) => { control.value = value ?? ''; } };
}
const directions = [['rising', 'Nousee'], ['falling', 'Laskee'], ['constant', 'Vakio']] as const;
const signs = [['positive', 'Positiivinen'], ['zero', 'Nolla'], ['negative', 'Negatiivinen']] as const;
const patterns = [['difference', 'Sama erotus'], ['ratio', 'Sama suhde']] as const;
const yesNo = [['yes', 'Kyllä'], ['no', 'Ei']] as const;
const ns = 'http://www.w3.org/2000/svg';
function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>) {
  const node = document.createElementNS(ns, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  return node;
}
function axisText(x: number, y: number, value: string, align = 'middle', size = 13.4) {
  const text = svg('text', { x, y, 'text-anchor': align, fill: '#23483e', 'font-size': size, 'font-weight': 680 });
  text.textContent = value; return text;
}
type Line = { points: readonly GardenPoint[]; color: string; dashed?: boolean; model?: true };
const size = { left: 35, right: 229, top: 17, bottom: 123, width: 257, height: 153 };
function plot(axis: GardenAxis, label: string, miniature = false) {
  const area = miniature ? { left: 34, right: 176, top: 17, bottom: 107, width: 200, height: 143 } : size;
  const { left, right, top, bottom } = area;
  const svgNode = svg('svg', { viewBox: `0 0 ${area.width} ${area.height}`, role: 'img', 'aria-label': label,
    style: `display:block;width:100%;max-height:${miniature ? 105 : 155}px;border-radius:8px;background:#fffdf1` });
  const px = (x: number) => left + (x - axis.x[0]) * (right - left) / (axis.x[1] - axis.x[0]);
  const py = (y: number) => bottom - (y - axis.y[0]) * (bottom - top) / (axis.y[1] - axis.y[0]);
  const [xMin, xMax] = axis.x, [yMin, yMax] = axis.y;
  const line = (x1: number, y1: number, x2: number, y2: number, stroke: string, weight = 1, dash = '') =>
    svg('line', { x1, y1, x2, y2, stroke, 'stroke-width': weight, 'stroke-dasharray': dash });
  function draw(lines: readonly Line[] = [], marks: readonly GardenPoint[] = [], signAt?: number) {
    svgNode.replaceChildren();
    for (let x = xMin; x <= xMax; x += axis.xStep) {
      svgNode.append(line(px(x), top, px(x), bottom, x === 0 ? '#4f7062' : '#ccd9c9', x === 0 ? 1.6 : 1),
        axisText(px(x), bottom + (miniature ? 17 : 13), name(x), 'middle', miniature ? 17 : 13.4));
    }
    const labelStep = Math.max(axis.yStep, Math.ceil((yMax - yMin) / 6));
    for (let y = yMin; y <= yMax; y++) {
      const major = y % labelStep === 0;
      svgNode.append(line(left, py(y), right, py(y), y === 0 ? '#547368' : major ? '#cadacb' : '#e8eddd', y === 0 ? 1.6 : 1));
      const labelled = miniature ? y === 0 || (y === yMin || y === yMax) && Math.abs(y) > 1 : major;
      if (labelled) svgNode.append(axisText(left - 4, py(y) + 3, name(y), 'end', miniature ? 16 : 13.4));
    }
    svgNode.append(axisText(left, 10, axis.yName, 'start'), axisText(right + 13, bottom + 28, axis.xName, 'end'));
    if (signAt !== undefined) svgNode.append(line(px(signAt), top, px(signAt), bottom, '#8c602b', 2, '4 3'));
    for (const layer of lines) {
      if (!layer.points.length) continue;
      const d = layer.points.map(([x, y], i) => `${i ? 'L' : 'M'} ${px(x)} ${py(y)}`).join(' ');
      svgNode.append(svg('path', { d, fill: 'none', stroke: layer.color, 'stroke-width': 2.8, 'stroke-linecap': 'round',
        'stroke-linejoin': 'round', 'stroke-dasharray': layer.dashed ? '5 3' : '', ...(layer.model ? { [attr('model-curve')]: '' } : {}) }));
    }
    for (const [x, y] of marks) {
      if (x < xMin || x > xMax || y < yMin || y > yMax) continue;
      svgNode.append(svg('circle', { cx: px(x), cy: py(y), r: 4.1, fill: '#f1c77f', stroke: '#743e27', 'stroke-width': 1.5,
        [attr('marked-point')]: `${x},${y}` }));
    }
  }
  return { svg: svgNode, draw, onPoint(callback: (x: number, y: number) => void) {
    svgNode.style.cursor = 'crosshair';
    svgNode.addEventListener('click', event => {
      const matrix = svgNode.getScreenCTM();
      if (!matrix) return;
      const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      if (p.x < left - 4 || p.x > right + 4 || p.y < top - 4 || p.y > bottom + 4) return;
      const x = Math.round(xMin + (p.x - left) * (xMax - xMin) / (right - left));
      const y = Math.round(yMin + (bottom - p.y) * (yMax - yMin) / (bottom - top));
      if (x >= xMin && x <= xMax && y >= yMin && y <= yMax) callback(x, y);
    });
  } };
}
function sampledCurve(curve: GardenCurve, axis: GardenAxis): GardenPoint[] {
  return Array.from({ length: 101 }, (_, i) => {
    const x = axis.x[0] + i / 100 * (axis.x[1] - axis.x[0]);
    return [x, evaluateGardenCurve(curve, x)];
  });
}
function formula(curve: GardenCurve) {
  const shift = curve.h === 0 ? 'x' : `(x ${curve.h < 0 ? '+' : '−'} ${Math.abs(curve.h)})`;
  return `y = ${curve.a === 1 ? '' : curve.a === -1 ? '−' : name(curve.a) + '·'}${shift}²${curve.k === 0 ? '' :
    ` ${curve.k < 0 ? '−' : '+'} ${Math.abs(curve.k)}`}`;
}
function monotonic(task: Task<'mono'>): Work<'mono'> {
  const plotter = plot(task.axis, `Mittauskuvaaja. Vaaka-akseli ${task.axis.xName}, pystyakseli ${task.axis.yName}.`);
  const range = Array.from({ length: task.axis.x[1] - task.axis.x[0] + 1 }, (_, i) => String(task.axis.x[0] + i));
  const options = range.map(x => [x, name(x)] as const);
  const value = input('Funktion arvo merkityssä kohdassa', `f(${task.signAt})`);
  const sign = select<GardenSign>('Arvon merkki', signs, 'Merkki');
  const draft = task.draft ? select('Onko luonnoksen suunta oikein?', yesNo, 'Luonnos oikein?') : undefined;
  const rows = Array.from({ length: 3 }, (_, i) => {
    const a = select(`Jakso ${i + 1}, alku`, options, ''), b = select(`Jakso ${i + 1}, loppu`, options, '');
    const dir = select<GardenDirection>(`Jakso ${i + 1}, suunta`, directions, '');
    return { node: h('div', { style: row }, `Jakso ${i + 1}`, a.control, '→', b.control, dir.control),
      get: (): GardenInterval => ({ from: a.get() ?? '', to: b.get() ?? '', direction: dir.get() }),
      set(item: GardenInterval) { a.set(item.from); b.set(item.to); dir.set(item.direction); } };
  });
  let used = 1;
  const add = button('Lisää jakso', () => { if (used < rows.length) used++; render(); });
  const remove = button('Poista viimeinen jakso', () => { if (used > 1) used--; render(); });
  function render() {
    rows.forEach(({ node }, i) => { node.style.display = i < used ? 'flex' : 'none'; });
    add.style.display = used < rows.length ? '' : 'none';
    remove.style.display = used > 1 ? '' : 'none';
    plotter.draw([{ points: task.points, color: '#17665b' }], task.points, task.signAt);
  }
  render();
  const comparison = task.draft ? note(`Luonnos: väli ${task.draft.from}–${task.draft.to}, ${directions.find(([id]) => id === task.draft!.direction)![1].toLowerCase()}.`) : null;
  return {
    node: h('div', { style: panel }, h('div', { style: 'display:grid;grid-template-columns:minmax(160px,1.25fr) minmax(0,1fr);gap:6px;align-items:start' },
      plotter.svg, h('div', { style: stack }, value.node, sign.node, comparison, draft?.node)),
      ...rows.map(v => v.node), h('div', { style: row }, add, remove)),
    read: () => ({ kind, mode: 'mono', intervals: rows.slice(0, used).map(v => v.get()), value: value.get(), sign: sign.get(),
      draftWorks: draft?.get() === 'yes' ? true : draft?.get() === 'no' ? false : null }),
    show(a) { used = a.intervals.length; a.intervals.forEach((v, i) => rows[i]!.set(v)); value.set(a.value); sign.set(a.sign);
      draft?.set(a.draftWorks === null ? null : a.draftWorks ? 'yes' : 'no'); render(); },
  };
}

function recognition(task: Task<'parabola'>): Work<'parabola'> {
  let selected = '';
  const x = input('Arvoparin x', 'x'), y = input('Arvoparin y', 'y');
  const cards = task.choices.map(({ id, curve }) => {
    const graph = plot(task.axis, `Kuvaaja ${id}`, true);
    graph.draw([{ points: sampledCurve(curve, task.axis), color: '#186b60' }]);
    return h('button', { type: 'button', 'aria-label': `Kuvaaja ${id}`, 'aria-pressed': 'false', [attr('candidate')]: id,
      style: 'border:2px solid #aac1aa;background:#fbfaeb;min-height:44px;min-width:44px;padding:4px;border-radius:9px;font:inherit;font-weight:700;color:#234a41;cursor:pointer',
      onclick: () => { selected = id; draw(); } }, id, graph.svg);
  });
  function draw() {
    cards.forEach((b, i) => {
      const active = selected === task.choices[i]!.id;
      b.setAttribute('aria-pressed', String(active)); b.style.borderColor = active ? '#15776b' : '#aac1aa';
    });
  }
  const given = task.view === 'formula' ? h('strong', { [attr('formula')]: '' }, formula(task.curve))
    : h('span', { [attr('samples')]: '' }, 'Arvoparit ', task.samples.map(([x, y]) => `(${name(x)}, ${name(y)})`).join('   '));
  return {
    node: h('div', { style: panel }, given, h('div', { style: 'display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px' }, ...cards),
      h('div', { style: row }, `Arvopari kohdassa x = ${name(task.checkX)}`, x.node, y.node)),
    read: () => ({ kind, mode: 'parabola', choice: selected, pair: { x: x.get(), y: y.get() } }),
    show(a) { selected = a.choice; x.set(a.pair.x); y.set(a.pair.y); draw(); },
  };
}

function construction(task: Task<'parabola-graph'>): Work<'parabola-graph'> {
  const graph = plot(task.axis, 'Arvoparien koordinaatisto, x vaakasuunnassa ja y pystysuunnassa');
  const values = task.table.map(({ x }) => {
    const field = input(`Pisteen y kohdassa x = ${name(x)}`, `x = ${name(x)}`, 47);
    field.node.style.cssText = 'display:grid;justify-items:center;gap:1px;font-size:14px';
    return field;
  });
  const vx = input('Huipun x', 'x'), vy = input('Huipun y', 'y');
  const mirrors = [input('Symmetriaparin ensimmäinen x', '', 45), input('Symmetriaparin toinen x', '', 45)] as const;
  const path = select('Piirroksen kulku', [['smooth', 'Sileä kaari'], ['segments', 'Taittoviiva'], ['line', 'Suora']] as const, 'Kulku');
  const known = h('table', { [attr('table')]: '', style: 'border-collapse:collapse;text-align:center;width:100%;font-size:14px' },
    h('tbody', {}, h('tr', {}, h('th', { scope: 'row' }, 'x'), ...task.table.map(({ x }) => h('td', { style: 'padding:3px' }, name(x)))),
      h('tr', {}, h('th', { scope: 'row' }, 'y'), ...task.table.map(({ y }) => h('td', { style: 'padding:3px' }, y === undefined ? '—' : name(y))))));
  let locked = false;
  const lock = button('Lukitse piirros', () => {
    if (locked || !values.every(v => !!v.get()) || !vx.get() || !vy.get() || !mirrors.every(v => !!v.get()) || !path.get()) return;
    locked = true; redraw();
  });
  const result = h('p', { style: 'display:none;margin:0;color:#295948;font-size:14px', [attr('observation')]: '' },
    'Vihreä kaari on malli. Lukitut pisteesi jäävät näkyviin sen rinnalle.');
  function redraw() {
    const marks: GardenPoint[] = task.table.flatMap(({ x }, i) => {
      const value = parse(values[i]!.get());
      return Number.isFinite(value) ? [[x, value] as GardenPoint] : [];
    });
    const vertex: GardenPoint = [parse(vx.get()), parse(vy.get())];
    const overlay: Line[] = [];
    if (path.get() === 'segments') overlay.push({ points: marks, color: '#a25834', dashed: true });
    if (path.get() === 'line' && marks.length >= 2) overlay.push({ points: [marks[0]!, marks.at(-1)!], color: '#a25834', dashed: true });
    if (locked) overlay.push({ points: sampledCurve(task.curve, task.axis), color: '#176557', model: true });
    graph.draw(overlay, [...marks, ...(vertex.every(Number.isFinite) ? [vertex] : [])]);
    const controls = [...values, vx, vy, ...mirrors];
    controls.forEach(v => { v.control.disabled = locked; });
    path.control.disabled = locked;
    lock.disabled = locked || !values.every(v => !!v.get()) || !vx.get() || !vy.get() || !mirrors.every(v => !!v.get()) || !path.get();
    lock.style.display = locked ? 'none' : '';
    result.style.display = locked ? 'block' : 'none';
  }
  for (const field of [...values, vx, vy, ...mirrors]) field.control.addEventListener('input', redraw);
  path.control.addEventListener('change', redraw);
  graph.onPoint((x, y) => {
    if (locked) return;
    const i = task.table.findIndex(row => row.x === x);
    if (i < 0) return;
    values[i]!.set(String(y)); redraw();
  });
  redraw();
  return {
    node: h('div', { style: panel }, h('div', { style: 'display:grid;grid-template-columns:minmax(154px,1.15fr) minmax(0,1fr);gap:6px' },
      graph.svg, h('div', { style: stack }, known, note('Täytä pisteiden y-arvot tai napauta kokonaislukuruudukkoa.'), path.node)),
      h('div', { style: row }, 'Omat y-arvot', ...values.map(v => v.node)),
      h('div', { style: row },
        h('span', { style: 'display:inline-flex;align-items:center;gap:6px' }, 'Huippu', vx.node, vy.node),
        h('span', { style: 'display:inline-flex;align-items:center;gap:6px' }, 'Symmetriaparin x:t', ...mirrors.map(v => v.control))), lock, result),
    ready: () => locked,
    read: () => ({ kind, mode: 'parabola-graph', points: task.table.map(({ x }, i) => ({ x: String(x), y: values[i]!.get() })),
      vertex: { x: vx.get(), y: vy.get() }, mirror: mirrors.map(v => v.get()), path: path.get(), locked }),
    show(a) {
      values.forEach((v, i) => v.set(a.points[i]!.y));
      vx.set(a.vertex.x); vy.set(a.vertex.y); mirrors.forEach((v, i) => v.set(a.mirror[i]!)); path.set(a.path); locked = a.locked; redraw();
    },
  };
}

function sequence(task: Task<'sequence'>): Work<'sequence'> {
  const structure = task.target !== 'rule', ruleNeeded = task.target !== 'structure';
  const pattern = select<GardenPattern>('Sallittu malliperhe', patterns, 'Sama siirtymä');
  const steps = task.observed.slice(1).map(({ index }, i) => {
    const previous = task.observed[i]!.index;
    return input(`Siirtymä vaiheesta ${previous} vaiheeseen ${index}`, `${previous}→${index}`, 50);
  });
  const firstIndex = input('Jonon ensimmäinen indeksi', 'Alkuindeksi', 50);
  const form = select<GardenRule['form']>('Säännön muoto', [['anchored', 'Suora kaava'], ['recursive', 'Rekursio']], 'Muoto');
  const anchor = input('Säännön ankkuri-indeksi', 'k', 48);
  const value = input('Säännön ankkuritermi', 'aₖ', 52);
  const step = input('Säännön siirtymä', 'd tai q', 52);
  const witness = gardenWitness(task);
  const checkTerm = input('Näkyvän koevaiheen termi', `Koe a(${witness.index})`, 69);
  const testTerm = input('Puuttuvan vaiheen termi', `Uusi a(${task.testIndex})`, 80);
  const ruleText = h('output', { [attr('rule')]: '', style: 'display:block;font-size:14px;line-height:1.25;color:#214940;font-weight:650' });
  const terms = h('div', { style: 'display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px', [attr('terms')]: '' },
    ...task.observed.map(({ index, value }) => {
      const icons = task.view === 'windows' ? h('span', { 'aria-hidden': 'true',
        style: 'display:flex;max-width:100%;gap:1px;flex-wrap:wrap;justify-content:center;margin-top:2px' },
        ...Array.from({ length: value }, () => h('span', { style: 'width:5px;height:5px;border-radius:1px;background:#c58d42;display:block' }))) : null;
      return h('div', { [attr('term-index')]: index, [attr('term-value')]: value,
        style: 'border:1px solid #afc2a8;border-radius:7px;background:#fff9e7;padding:3px;text-align:center;font-size:14px' },
        h('div', {}, `Vaihe ${index}`), h('strong', {}, String(value)), icons);
    }));
  const activePattern = () => task.pattern ?? pattern.get();
  function redraw() {
    const type = activePattern(), mode = form.get(), at = name(anchor.get() || 'k'), term = name(value.get() || 'aₖ');
    const by = name(step.get() || (type === 'ratio' ? 'q' : 'd'));
    const op = type === 'ratio' ? '×' : '+';
    if (!mode || !type) {
      ruleText.value = 'Valitse sääntömuoto. Täytä ankkurin indeksi k, sen termi ja siirtymä.';
      return;
    }
    ruleText.value = mode === 'recursive' ? `a(${at}) = ${term}, sitten a(n + 1) = a(n) ${op} ${by}.`
      : type === 'ratio' ? `a(n) = (${term}) × (${by})^(n − (${at})).`
        : `a(n) = (${term}) + (${by}) × (n − (${at})).`;
  }
  pattern.control.addEventListener('change', redraw); form.control.addEventListener('change', redraw);
  for (const field of [anchor, value, step]) field.control.addEventListener('input', redraw);
  redraw();
  return {
    node: h('div', { style: panel }, terms, h('div', { style: row },
      note(`Jonon ensimmäinen vaihe on ${task.start}. ${task.pattern === 'difference' ? 'Mallissa on vakioerotus.'
        : task.pattern === 'ratio' ? 'Mallissa on vakiosuhde.' : 'Tutki vakioerotusta tai vakiosuhdetta.'}`), task.pattern ? null : pattern.node),
      structure ? h('div', { style: row }, 'Siirtymät', ...steps.map(v => v.node)) : null,
      ruleNeeded ? h('div', { style: stack }, h('div', { style: row }, firstIndex.node, form.node),
        h('div', { style: row }, anchor.node, value.node, step.node), ruleText) : null,
      h('div', { style: row }, ruleNeeded ? checkTerm.node : null, testTerm.node),
      note('Rajallinen havaintolista sopii näihin malleihin. Siitä ei päätellä ainoaa mahdollista jatkoa.')),
    read() {
      const mode = form.get();
      return { kind, mode: 'sequence', pattern: activePattern(), steps: steps.map(v => v.get()), firstIndex: firstIndex.get(),
        rule: mode ? { form: mode, anchor: anchor.get(), value: value.get(), step: step.get() } : null,
        checkTerm: checkTerm.get(), testTerm: testTerm.get() };
    },
    show(a) {
      pattern.set(a.pattern); steps.forEach((v, i) => v.set(a.steps[i]!)); firstIndex.set(a.firstIndex);
      form.set(a.rule?.form ?? null); anchor.set(a.rule?.anchor ?? ''); value.set(a.rule?.value ?? ''); step.set(a.rule?.step ?? '');
      checkTerm.set(a.checkTerm); testTerm.set(a.testTerm); redraw();
    },
  };
}

export function functionGardenBoard(task: FunctionGardenTask): Paint {
  return host => host.replaceChildren(h('div', { style: stack, [attr('givens')]: '' }, note(task.setting)));
}
export function mountFunctionGarden(task: FunctionGardenTask, host: HTMLElement, submit: (answer: FunctionGardenResponse) => void): { reveal(): void } {
  function mount<M extends Mode>(work: Work<M>) {
    const done = h('button', { type: 'submit', class: 'btn primary wide', [attr('submit')]: '' }, 'Tarkista merkinnät');
    const form = h('form', { style: stack, [attr('workbench')]: task.mode }, work.node, done);
    let frozen = false;
    const refresh = () => { done.disabled = frozen || work.ready?.() === false; };
    refresh(); form.addEventListener('click', refresh);
    function freeze() {
      frozen = true;
      for (const control of form.querySelectorAll('input,button,select')) control.setAttribute('disabled', '');
      for (const drawing of form.querySelectorAll('svg')) drawing.style.pointerEvents = 'none';
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (frozen || work.ready?.() === false) return;
      const answer = work.read();
      freeze(); submit(answer);
    });
    host.append(form);
    return { reveal() { work.show(solutionFunctionGarden(task) as Answer<M>); freeze(); } };
  }
  switch (task.mode) {
    case 'mono': return mount(monotonic(task));
    case 'parabola': return mount(recognition(task));
    case 'parabola-graph': return mount(construction(task));
    case 'sequence': return mount(sequence(task));
  }
}
export function functionGardenExample(task: FunctionGardenTask): Paint {
  return host => {
    const givens = h('div'), work = h('div');
    functionGardenBoard(task)(givens);
    mountFunctionGarden(task, work, () => {}).reveal();
    work.querySelector('[data-garden-submit]')?.remove();
    host.replaceChildren(givens, work);
  };
}
