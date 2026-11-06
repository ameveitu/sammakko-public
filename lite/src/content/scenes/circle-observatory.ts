import type { Paint } from '../../engine/types';
import { h } from '../../ui/dom';
import { parseMeasure } from '../models/spatial-measures';
import { circleArc, circleArcHas, circleInterceptedArc, circlePiApproximation, circleRim, solutionCircleObservatory,
  type CircleArc, type CircleBoard, type CircleObservatoryResponse, type CircleObservatoryTask, type Segment } from '../models/circle-observatory';

type Mode = CircleObservatoryTask['mode'];
type Task<M extends Mode> = Extract<CircleObservatoryTask, { mode: M }>;
type Answer<M extends Mode> = Extract<CircleObservatoryResponse, { mode: M }>;
type Work<M extends Mode> = { node: HTMLElement; read(): Answer<M>; show(response: Answer<M>): void; ready?(): boolean };
type XY = readonly [number, number];
type Sketch = { lines?: { ends: Segment; draft?: true }[]; arcs?: { path: CircleArc; draft?: true }[]; marked?: string[];
  angle?: { vertex: string; rays: Segment }; compareRadius?: true; areaDraft?: boolean };
const kind = 'circle-observatory' as const;
const stack = 'display:grid;gap:4px';
const row = 'display:flex;flex-wrap:wrap;align-items:center;gap:3px 7px';
const panel = `${stack};background:#eef5e9;border:1px solid #a4b9ab;border-radius:11px;padding:5px 7px`;
const field = 'box-sizing:border-box;min-height:44px;min-width:44px;max-width:100%;border:1px solid #7c9e92;border-radius:8px;background:#fffdf6;color:#17433b;font:inherit;padding:4px';
const note = (text: string) => h('p', { style: 'margin:0;font-size:14px;line-height:1.23;color:#274f48' }, text);
const action = (name: string, run: () => void) => h('button', { type: 'button', class: 'btn small', style: 'min-height:44px;min-width:44px', onclick: run }, name);
const options = (values: readonly string[]) => values.map(value => [value, value] as const);
const yesNo = [['yes', 'Kyllä'], ['no', 'Ei']] as const;
const bool = (value: string) => value === 'yes' ? true : value === 'no' ? false : null;
const booleanValue = (value: boolean | null) => value === null ? '' : value ? 'yes' : 'no';
const pair = (first = '', second = '') => [first, second] as const;
const attr = (name: string) => `data-circle-${name}`;
function choice(name: string, choices: readonly (readonly [string, string])[], caption = name, blank = '—') {
  const control = h('select', { 'aria-label': name, style: field },
    h('option', { value: '' }, blank), ...choices.map(([value, label]) => h('option', { value }, label)));
  return { control, node: h('label', { style: row }, caption, control), get: () => control.value,
    set: (value: string) => { control.value = value; } };
}
function number(name: string, caption = name, width = 69) {
  const control = h('input', { 'aria-label': name, type: 'text', inputmode: 'text', autocomplete: 'off',
    style: `${field};width:${width}px;text-align:center` });
  return { control, node: h('label', { style: row }, caption, control), get: () => {
    const value = control.value.trim();
    return value.length <= 32 && parseMeasure(value) ? value : '';
  }, set: (value: string) => { control.value = value; } };
}
const ns = 'http://www.w3.org/2000/svg';
function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, number | string>, ...kids: SVGElement[]) {
  const element = document.createElementNS(ns, tag);
  for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, String(value));
  element.append(...kids);
  return element;
}
function polar(x: number, y: number, r: number, angle: number): XY {
  const theta = angle * Math.PI / 180;
  return [x + r * Math.cos(theta), y + r * Math.sin(theta)];
}
function dot(board: CircleBoard, id: string): XY | undefined {
  const p = board.points.find(candidate => candidate.id === id);
  if (!p) return;
  const { x, y, radius } = board.drawing;
  return polar(x, y, p.place === 'rim' ? radius : p.place === 'inside' ? .54 * radius : 0, p.angle);
}
const coords = (xy: XY) => xy.join(' ');
function arcPath(board: CircleBoard, route: CircleArc) {
  const resolved = circleArc(board, route);
  if (!resolved) return;
  const { x, y, radius } = board.drawing;
  return `M ${coords(polar(x, y, radius, resolved.start.angle))} A ${radius} ${radius} 0 ${resolved.degrees > 180 ? 1 : 0} 1 ${coords(polar(x, y, radius, resolved.end.angle))}`;
}
function wedge(x: number, y: number, r: number, start: number, sweep: number) {
  return `M ${x} ${y} L ${coords(polar(x, y, r, start))} A ${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${coords(polar(x, y, r, start + sweep))} Z`;
}
function labelSvg(xy: XY, text: string, extra: Record<string, string | number> = {}) {
  const label = svg('text', { x: xy[0], y: xy[1], 'text-anchor': 'middle', 'dominant-baseline': 'middle',
    fill: '#173f37', 'font-size': 16, 'font-weight': 750, ...extra });
  label.textContent = text;
  return label;
}
function line(a: XY, b: XY, draft = false) {
  return svg('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: draft ? '#a75536' : '#106557', 'stroke-width': 2.9,
    'stroke-linecap': 'round', 'stroke-dasharray': draft ? '5 4' : '' });
}
function angleMark(board: CircleBoard, angle: NonNullable<Sketch['angle']>) {
  const o = dot(board, angle.vertex), a = dot(board, angle.rays[0]), b = dot(board, angle.rays[1]);
  if (!o || !a || !b || angle.rays.includes(angle.vertex) || angle.rays[0] === angle.rays[1]) return;
  const angleAt = (p: XY) => Math.atan2(p[1] - o[1], p[0] - o[0]) * 180 / Math.PI;
  const first = angleAt(a), next = angleAt(b), difference = (next - first + 360) % 360;
  return svg('path', { d: wedge(o[0], o[1], 17, difference <= 180 ? first : next, difference <= 180 ? difference : 360 - difference),
    fill: '#e2b45b80', stroke: '#935820', 'stroke-width': 1.2 });
}
function sketch(task: CircleObservatoryTask) {
  const { board } = task, { x, y, radius } = board.drawing;
  const canvas = svg('svg', { viewBox: '25 5 237 184', role: 'img', 'aria-label': 'Havaintopöydän ympyrä',
    style: 'width:100%;max-height:162px;display:block;background:#f9f6e7;border-radius:10px' });
  let callback: ((id: string) => void) | undefined;
  const boundary = (r: number) => svg('circle', { cx: x, cy: y, r, fill: '#dce9e0', stroke: '#4c786d', 'stroke-width': 2 });
  function set(sketch: Sketch) {
    canvas.replaceChildren(boundary(radius));
    if (sketch.areaDraft) canvas.append(svg('circle', { cx: x, cy: y, r: radius - 2, fill: '#e5b690', [attr('draft-area')]: '' }));
    if (task.mode === 'angles' && task.comparison) {
      canvas.append(svg('circle', { cx: x, cy: y, r: task.comparison, fill: 'none', stroke: '#527363',
        'stroke-width': 1.5, 'stroke-dasharray': '4 3' }));
    }
    if (task.mode === 'measure') {
      const isArea = task.measure === 'area' || task.measure === 'sector';
      const base = board.points[0]!.angle;
      if (sketch.compareRadius && task.compareRadius) {
        const given = task.given.length / (task.given.kind === 'radius' ? 1 : 2);
        const original = radius * given / task.compareRadius;
        canvas.append(svg('circle', { cx: x, cy: y, r: radius - 1, fill: '#e7c374' }),
          svg('circle', { cx: x, cy: y, r: original, fill: '#a8cdae', stroke: '#315f4e', 'stroke-width': 2.5, [attr('original-radius')]: original }),
          line([x, y], polar(x, y, radius, 0)), svg('circle', { cx: x, cy: y, r: 3, fill: '#173f37' }));
        return;
      }
      if (task.angle === undefined) {
        if (isArea) canvas.append(svg('circle', { cx: x, cy: y, r: radius - 1, fill: '#d9a74988' }));
        else canvas.append(svg('circle', { cx: x, cy: y, r: radius, fill: 'none', stroke: '#b47524', 'stroke-width': 5 }));
      } else {
        const sweep = task.remainder ? 360 - task.angle : task.angle;
        // The long arc returns from B to A. A remainder starts where the reserved wedge ends.
        const start = task.remainder ? base + task.angle : task.angle > 180 ? base + 360 - task.angle : base;
        const startPoint = polar(x, y, radius, start), endPoint = polar(x, y, radius, start + sweep);
        if (isArea) canvas.append(svg('path', { d: wedge(x, y, radius, start, sweep), fill: '#d9a74988', stroke: '#916121', 'stroke-width': 2 }));
        else canvas.append(line([x, y], startPoint, true), line([x, y], endPoint, true),
          svg('path', { d: wedge(x, y, 15, start, sweep), fill: '#e2b45b80', stroke: '#935820', 'stroke-width': 1.2 }),
          svg('path', { d: `M ${coords(startPoint)} A ${radius} ${radius} 0 ${sweep > 180 ? 1 : 0} 1 ${coords(endPoint)}`,
            fill: 'none', stroke: '#a76d22', 'stroke-width': 5 }));
      }
      const p = polar(x, y, radius, 0);
      canvas.append(line(task.given.kind === 'radius' ? [x, y] : polar(x, y, radius, 180), p),
        svg('circle', { cx: x, cy: y, r: 3, fill: '#173f37' }));
      return;
    }
    for (const entry of sketch.lines ?? []) {
      const a = dot(board, entry.ends[0]), b = dot(board, entry.ends[1]);
      if (a && b) canvas.append(line(a, b, entry.draft));
    }
    for (const entry of sketch.arcs ?? []) {
      const d = arcPath(board, entry.path);
      if (d) canvas.append(svg('path', { d, fill: 'none', stroke: entry.draft ? '#a75536' : '#b57e28', 'stroke-width': 5,
        'stroke-linecap': 'round', 'stroke-dasharray': entry.draft ? '6 4' : '' }));
    }
    if (sketch.angle) {
      const centre = board.points.find(p => p.id === sketch.angle?.vertex)?.place === 'centre';
      const selected = sketch.arcs?.find(v => !v.draft && v.path.ends.includes(sketch.angle!.rays[0]) &&
        v.path.ends.includes(sketch.angle!.rays[1]) && sketch.angle!.rays[0] !== sketch.angle!.rays[1]);
      const arc = selected && circleArc(board, selected.path);
      const mark = centre && arc ? svg('path', { d: wedge(x, y, 20, arc.start.angle, arc.degrees), fill: '#e2b45b80',
        stroke: '#935820', 'stroke-width': 1.2 }) : angleMark(board, sketch.angle);
      if (mark) canvas.append(mark);
    }
    for (const p of board.points) {
      const [px, py] = dot(board, p.id)!;
      const label = p.place === 'rim' ? polar(x, y, radius + 13, p.angle) : [px + 12, py + 9] as const;
      const group = svg('g', { [attr('point')]: p.id });
      if (callback) group.setAttribute('style', 'cursor:pointer');
      const hit = svg('circle', { cx: px, cy: py, r: 13, fill: 'transparent' });
      const marker = svg('circle', { cx: px, cy: py, r: sketch.marked?.includes(p.id) ? 6.4 : 4.4,
        fill: sketch.marked?.includes(p.id) ? '#f9c56c' : '#316c61', stroke: '#143f35', 'stroke-width': 1.3 });
      group.append(hit, marker, labelSvg(label, p.id));
      group.addEventListener('click', () => callback?.(p.id));
      canvas.append(group);
    }
  }
  return { canvas, set, onPick(fn: (id: string) => void) { callback = fn; } };
}

function pointFields(board: CircleBoard, draw: () => void) {
  let active: ReturnType<typeof choice> | undefined;
  const all = options(board.points.map(p => p.id));
  function pick(name: string, title = name, values = all) {
    const input = choice(name, values, title);
    input.control.addEventListener('focus', () => { active = input; });
    input.control.addEventListener('change', draw);
    return input;
  }
  function segment(name: string, title = name) {
    const a = pick(`${name}, pää 1`, ''), b = pick(`${name}, pää 2`, '');
    return { node: h('div', { style: row }, title, a.control, b.control),
      get: () => pair(a.get(), b.get()), set: (ends: Segment) => { a.set(ends[0]); b.set(ends[1]); } };
  }
  function arc(name: string, ends: Segment, label = name) {
    const via = pick(name, label);
    return { node: via.node, control: via.control, get: (): CircleArc => ({ ends, via: via.get() }), set: (arc: CircleArc) => { via.set(arc.via); } };
  }
  return { pick, segment, arc, click(id: string) { if (active && !active.control.disabled) { active.set(id); draw(); } } };
}
function routeEdges(board: CircleBoard, route: readonly string[], draft?: true) {
  const order = circleRim(board);
  const arcs: { start: number; sweep: number; draft?: true }[] = [];
  const lines: NonNullable<Sketch['lines']> = [];
  // Join consecutive rim marks along the boundary. An invalid jump remains a straight draft.
  for (let i = 1; i < route.length; i++) {
    const a = order.findIndex(p => p.id === route[i - 1]), b = order.findIndex(p => p.id === route[i]);
    const ends = pair(route[i - 1], route[i]);
    if (a < 0 || b < 0 || ![1, order.length - 1].includes(Math.abs(b - a))) {
      lines.push({ ends, draft: true }); continue;
    }
    const start = b === (a + 1) % order.length ? order[a]! : order[b]!;
    const end = start.id === ends[0] ? order[b]! : order[a]!;
    const sweep = (end.angle - start.angle + 360) % 360;
    arcs.push({ start: start.angle, sweep, draft });
  }
  return { arcs, lines };
}
function paintRoute(canvas: SVGSVGElement, board: CircleBoard, route: ReturnType<typeof routeEdges>) {
  const { x, y, radius } = board.drawing;
  for (const edge of route.arcs) {
    const a = polar(x, y, radius, edge.start), b = polar(x, y, radius, edge.start + edge.sweep);
    canvas.insertBefore(svg('path', { d: `M ${coords(a)} A ${radius} ${radius} 0 ${edge.sweep > 180 ? 1 : 0} 1 ${coords(b)}`,
      fill: 'none', stroke: edge.draft ? '#a75536' : '#1e7466', 'stroke-width': edge.draft ? 2.5 : 4.5,
      'stroke-dasharray': edge.draft ? '5 4' : '' }), canvas.querySelector('g'));
  }
}
function drawColumns(diagram: SVGSVGElement, work: HTMLElement) {
  return h('div', { style: 'display:grid;grid-template-columns:minmax(145px,.83fr) minmax(0,1.17fr);align-items:start;gap:6px' }, diagram, work);
}
function parts(task: Task<'parts'>): Work<'parts'> {
  const diagram = sketch(task), { part, board } = task;
  const point = pointFields(board, draw);
  const radiusCount = part === 'radius' ? 2 : part === 'basic' ? 1 : 0;
  const radii = Array.from({ length: radiusCount }, (_, i) => point.segment(radiusCount === 2 ? `Säde ${i + 1}` : 'Säde'));
  const diameter = part === 'diameter' || part === 'basic' ? point.segment('Halkaisija') : undefined;
  const arc = part === 'arc' || part === 'basic' ? point.arc('Kaaren välipiste', task.arcEnds, 'Kaari kautta') : undefined;
  const draft = task.draft ? choice('Onko luonnos oikein?', yesNo, task.draft.kind === 'area'
    ? 'Onko varjostettu alue kehä?' : 'Luonnos oikein?') : undefined;
  const measure = part === 'radius' ? ['Säde 1', 'Säde 2'] : diameter ? ['Puolikas 1', 'Puolikas 2', 'Halkaisija'] : [];
  const values = measure.map(name => number(`${name}, pituus`, name, 47));
  const route = [...(task.prefix ?? [])];
  const routeValue = h('output', { [attr('route')]: '', 'aria-label': 'Rakennettu kehäreitti', 'aria-live': 'polite', style: 'font-weight:700;color:#153e38' });
  const trace = part === 'circumference' || part === 'basic' ? point.pick('Seuraava reunamerkki', '', options(board.points.map(p => p.id))) : undefined;
  const add = action('Lisää kehälle', () => { if (trace?.get() && route.length < circleRim(board).length + 1) { route.push(trace.get()); trace.set(''); draw(); } });
  const undo = action('Peru', () => { if (route.length > (task.prefix?.length ?? 0)) { route.pop(); draw(); } });
  function draw() {
    const routeShape = routeEdges(board, route), draftRoute = task.draft?.kind === 'circumference' ? routeEdges(board, task.draft.route, true) : undefined;
    const lines = [...radii.map(v => ({ ends: v.get() })), ...(diameter ? [{ ends: diameter.get() }] : []), ...routeShape.lines,
      ...(draftRoute?.lines ?? []), ...(task.draft && 'segment' in task.draft ? [{ ends: task.draft.segment, draft: true as const }] : [])];
    diagram.set({ lines, areaDraft: task.draft?.kind === 'area', arcs: arc ? [{ path: arc.get() }] : [], marked: [task.through].filter(() => !!arc && task.arcRequest === 'via') });
    if (draftRoute) paintRoute(diagram.canvas, board, draftRoute);
    paintRoute(diagram.canvas, board, routeShape);
    routeValue.value = route.length ? route.join(' → ') : 'Aloita mistä tahansa reunamerkistä.';
    add.disabled = !trace?.get() || route.length >= circleRim(board).length + 1;
    undo.disabled = route.length <= (task.prefix?.length ?? 0);
  }
  diagram.onPick(id => point.click(id));
  draw();
  const routePanel = trace ? h('div', { style: stack }, h('div', { style: row }, 'Kehä', trace.control, add, undo), routeValue) : null;
  const summary = arc ? note(`Päät ${task.arcEnds.join(' ja ')}. ${task.arcRequest === 'via' ? `Reitti käy pisteen ${task.through} kautta.`
    : task.arcRequest === 'short' ? 'Valitse lyhyempi reunareitti.' : 'Valitse pidempi reunareitti.'}`) : null;
  return {
    node: h('div', { style: panel }, drawColumns(diagram.canvas, h('div', { style: stack }, summary, ...radii.map(v => v.node), diameter?.node,
      arc?.node, draft?.node, part === 'circumference' ? routePanel : null)),
      part === 'basic' ? routePanel : null, values.length ? h('div', { style: row }, ...values.map(v => v.node)) : null),
    read: () => ({ kind, mode: 'parts', radii: radii.map(v => v.get()), diameter: diameter?.get() ?? pair(),
      circumference: [...route], arc: arc?.get() ?? { ends: pair(), via: '' }, values: values.map(v => v.get()), draftWorks: bool(draft?.get() ?? '') }),
    show(a) {
      radii.forEach((v, i) => v.set(a.radii[i]!)); diameter?.set(a.diameter); arc?.set(a.arc);
      route.splice(0, route.length, ...a.circumference); values.forEach((v, i) => v.set(a.values[i]!));
      draft?.set(booleanValue(a.draftWorks)); draw();
    },
  };
}

function angles(task: Task<'angles'>): Work<'angles'> {
  const diagram = sketch(task), point = pointFields(task.board, draw);
  const vertex = point.pick('Kulman kärki', 'Kärki'), moved = task.relocate ? point.pick('Siirretty kärki', 'Uusi kärki') : undefined;
  const rays = point.segment('Kulman kyljet', 'Kylkien päät');
  const arc = point.arc('Kulman kaaren välipiste', task.ends, 'Kaari kautta');
  const central = number('Keskuskulman asteluku', 'Keskus ∠', 61);
  const inscribed = number('Kehäkulman asteluku', 'Kehä ∠', 61);
  const resize = number('Kulman asteluku pienessä ympyrässä', 'Pieni ∠', 61);
  const audit = task.audit ? choice('Sopiiko luonnoksen kärki?', yesNo, `Sopiiko ${task.audit}?`) : undefined;
  const otherArc = task.otherSide ? point.arc('Toisen kaaren välipiste', task.ends, 'Toinen kaari kautta') : undefined;
  const otherInscribed = task.otherSide ? number('Toisen kehäkulman asteluku', `Kärjen ${task.otherSide} ∠`, 61) : undefined;
  function draw() {
    const shape = { vertex: vertex.get(), rays: rays.get() };
    const lines = shape.rays.map(p => ({ ends: pair(shape.vertex, p) }));
    if (moved?.get()) lines.push(...shape.rays.map(p => ({ ends: pair(moved.get(), p), draft: true as const })));
    if (task.distractor) {
      const root = task.board.points.find(p => p.place === 'centre')!.id;
      lines.push(...task.distractor.map(p => ({ ends: pair(root, p), draft: true as const })));
    }
    if (task.otherSide) lines.push(...task.ends.map(p => ({ ends: pair(task.otherSide, p), draft: true as const })));
    diagram.set({ angle: shape, lines, arcs: [{ path: arc.get() }, ...(otherArc ? [{ path: otherArc.get(), draft: true as const }] : [])],
      marked: [task.through, ...(task.audit ? [task.audit] : [])] });
  }
  diagram.onPick(id => point.click(id)); draw();
  const given = task.given ? note(task.skill === 'central' ? `Merkityn kaaren asteluku ${task.given.degrees}°.` :
    `Annettu ${task.given.angle === 'central' ? 'keskuskulma' : 'kehäkulma'} on ${String(task.given.degrees).replace('.', ',')}°.`) : null;
  return {
    node: h('div', { style: panel }, drawColumns(diagram.canvas, h('div', { style: stack },
      note(`Tutkittava kaari kulkee ${task.ends[0]}–${task.through}–${task.ends[1]}.`), given,
      vertex.node, rays.node, arc.node, audit?.node, moved?.node)),
      task.skill !== 'inscribed' ? h('div', { style: row }, central.node,
        task.skill === 'central' ? task.comparison ? resize.node : null : inscribed.node) : null,
      task.comparison ? note('Katkoviivaympyrällä on sama keskus ja samat kylkien suunnat. Anna sen asteluku erikseen.') : null,
      task.distractor ? note('Ruskeat katkoviivat rajaavat eri kaarta. Käytä tehtävässä nimettyä kaarta.') : null,
      task.otherSide ? h('div', { style: row }, otherArc?.node, otherInscribed?.node) : null),
    read: () => ({ kind, mode: 'angles', vertex: vertex.get(), moved: moved?.get() ?? '', rays: rays.get(), arc: arc.get(), central: central.get(), inscribed: inscribed.get(),
      resized: resize.get(), auditWorks: bool(audit?.get() ?? ''), otherArc: otherArc?.get() ?? { ends: task.ends, via: '' }, otherInscribed: otherInscribed?.get() ?? '' }),
    show(a) {
      vertex.set(a.vertex); moved?.set(a.moved); rays.set(a.rays); arc.set(a.arc); central.set(a.central); inscribed.set(a.inscribed);
      resize.set(a.resized); audit?.set(booleanValue(a.auditWorks)); otherArc?.set(a.otherArc); otherInscribed?.set(a.otherInscribed); draw();
    },
  };
}

function rearrangedSectors() {
  const r = 44, half = Math.PI / 12, dx = r * Math.sin(half), height = r * Math.cos(half);
  const figure = svg('svg', { viewBox: '0 0 162 61', role: 'img', 'aria-label': 'Kaksitoista samaa sektoria vuorotellen suunnattuina',
    style: 'width:180px;max-height:65px' });
  for (let i = 0; i < 6; i++) {
    figure.append(svg('path', { d: wedge(10 + 2 * i * dx, 6, r, 75, 30), fill: '#e7bd71', stroke: '#8d632a', 'stroke-width': 1 }),
      svg('path', { d: wedge(10 + (2 * i + 1) * dx, 6 + height, r, 255, 30), fill: '#afd1a8', stroke: '#5a7953', 'stroke-width': 1 }));
  }
  return figure;
}
function measure(task: Task<'measure'>): Work<'measure'> {
  const diagram = sketch(task);
  diagram.set({});
  const partial = task.angle !== undefined;
  const radius = number('Ympyrän säde', `Säde (${task.unit})`);
  const share = number('Osuus täydestä kierroksesta', 'Osuus');
  const coefficient = number('Tarkka piin kerroin', 'Kerroin');
  const result = number('Pyöristetty tulos', '≈');
  const unit = choice('Tuloksen yksikkö', options([task.unit, task.unit + '²', task.unit + '³']), 'Yksikkö');
  const notation = task.result === 'either' ? choice('Tuloksen esitystapa', [['exact', 'Tarkka ='], ['approx', 'Likiarvo ≈']], 'Esitystapa') : undefined;
  const lower = number('Halkaisijoiden määrä, alaraja', '', 45), upper = number('Halkaisijoiden määrä, yläraja', '', 45);
  const prediction = task.compareRadius ? number('Ennustettu pinta-alan kerroin', 'Alan kerroin') : undefined;
  const enlarged = task.compareRadius ? number('Uuden pihan tarkka piin kerroin', 'Uusi kerroin') : undefined;
  const renderedSectors = task.measure === 'area' ? h('div', { style: 'display:none;align-items:center;gap:7px' },
    rearrangedSectors(), note('Samat 12 palaa säilyttävät alan. Suorakulmiota lähestytään yhä kapeammilla sektoreilla.')) : null;
  const more = renderedSectors ? action('Sektorit rinnakkain', () => {
    renderedSectors.style.display = renderedSectors.style.display === 'none' ? 'flex' : 'none';
  }) : null;
  const notationValue = () => (notation ? notation.get() : task.result) as 'exact' | 'approx' | '';
  const resultPanel = h('div', { [attr('approx')]: '', style: stack },
    note(`Käytä π ≈ ${circlePiApproximation}. Pyöristä tulos ${task.decimals} desimaalin tarkkuuteen.`), result.node);
  const calc = h('div', { style: stack, [attr('calculation')]: '' },
    h('div', { style: row }, radius.node, partial ? share.node : null, unit.node),
    task.measure === 'circumference' ? h('div', { style: row }, 'Kehä halkaisijan mittoina', lower.control, '<', 'C/d', '<', upper.control) : null,
    h('div', { style: row }, notation?.node, coefficient.node, '× π', enlarged?.node, enlarged ? '× π' : null),
    resultPanel, more, renderedSectors);
  let locked = !prediction;
  const lock = prediction ? action('Lukitse alan ennuste', () => {
    if (!prediction.get().trim()) { prediction.control.focus(); return; }
    locked = true; refresh(); radius.control.focus();
  }) : null;
  function refresh() {
    calc.style.display = locked ? 'grid' : 'none';
    if (prediction) diagram.set({ compareRadius: locked ? true : undefined });
    resultPanel.style.display = notationValue() === 'approx' ? 'grid' : 'none';
    if (prediction) prediction.control.disabled = locked;
    if (lock) lock.style.display = locked ? 'none' : '';
  }
  notation?.control.addEventListener('change', refresh); refresh();
  const given = h('div', { style: stack }, note(`${task.given.kind === 'radius' ? 'Säde' : 'Halkaisija'} ${task.given.length} ${task.unit}.`),
    partial ? note(`${task.remainder ? 'Varatun sektorin' : 'Merkityn osuuden'} keskuskulma ${task.angle}°.`) : null,
    note(task.result === 'exact' ? 'Anna tarkka tulos piin avulla.' : task.result === 'approx' ? 'Kirjaa tarkka piin kerroin ja pyöristetty tulos.'
      : 'Voit antaa tarkan tuloksen tai sovitun likiarvon.'),
    prediction ? note(`Uusi säde ${task.compareRadius} ${task.unit}. Kuinka moninkertainen uusi pinta-ala on?`) : null);
  return {
    node: h('div', { style: panel }, drawColumns(diagram.canvas, given),
      prediction ? h('div', { style: row }, prediction.node, lock) : null, calc),
    ready: () => locked,
    read: () => ({ kind, mode: 'measure', radius: radius.get(), share: share.get(), coefficient: coefficient.get(), result: result.get(),
      notation: notationValue() || null, unit: unit.get(), lower: lower.get(), upper: upper.get(),
      prediction: prediction?.get() ?? '', locked: !!prediction && locked, enlargedCoefficient: enlarged?.get() ?? '' }),
    show(a) {
      radius.set(a.radius); share.set(a.share); coefficient.set(a.coefficient); result.set(a.result);
      notation?.set(a.notation ?? ''); unit.set(a.unit); lower.set(a.lower); upper.set(a.upper);
      prediction?.set(a.prediction); enlarged?.set(a.enlargedCoefficient); locked = true; refresh();
    },
  };
}

function thales(task: Task<'thales'>): Work<'thales'> {
  const diagram = sketch(task), point = pointFields(task.board, draw);
  const first = point.pick('Ensimmäinen havaintopaikka', 'Kärki 1'), second = point.pick('Toinen havaintopaikka', 'Kärki 2');
  const arc = point.arc('Puoliympyrän välipiste', task.ends, 'Kaari kautta');
  const central = number('Ennustettu keskuskulma', 'Keskus ∠', 62), inscribed = number('Ennustettu kehäkulma', 'Kehä ∠', 62);
  const compareArc = point.arc('Vertailukaaren välipiste', task.compare, 'Kaari kautta');
  const compareCentral = number('Vertailun keskuskulma', 'Keskus ∠', 62), compareInscribed = number('Vertailun kehäkulma', 'Kehä ∠', 62);
  const candidate = task.candidate ? choice('Sopiiko luonnoksen kärki?', yesNo, `Sopiiko ${task.candidate}?`) : undefined;
  const observation = h('output', { [attr('observation')]: '', 'aria-live': 'polite', style: 'font-size:14px;color:#254e42' });
  let locked = false;
  const lock = action('Lukitse kulmaennuste', () => {
    if (!first.get() || !arc.get().via || !central.get().trim() || !inscribed.get().trim()) {
      [first.control, central.control, inscribed.control].find(control => !control.value)?.focus(); return;
    }
    locked = true; draw(); second.control.focus();
  });
  const trial = h('div', { style: stack, [attr('trial')]: '' }, h('div', { style: row }, second.node, candidate?.node), observation,
    note(`Vertailujänne ${task.compare.join('–')}, kärki ${task.compareVertex}. Käytä samaa kaarisääntöä.`),
    h('div', { style: row }, compareArc.node, compareCentral.node, compareInscribed.node));
  function draw() {
    const apex = locked && second.get() ? second.get() : first.get();
    const mainLines = task.ends.map(p => ({ ends: pair(apex, p) }));
    const comparisonLines = locked ? task.compare.map(p => ({ ends: pair(task.compareVertex, p), draft: true as const })) : [];
    const arcs = [{ path: arc.get() }, ...(locked ? [{ path: compareArc.get(), draft: true as const }] : [])];
    diagram.set({ lines: [{ ends: task.ends }, ...mainLines, ...comparisonLines], arcs, marked: [task.through, ...(task.candidate ? [task.candidate] : [])],
      angle: locked ? { vertex: apex, rays: task.ends } : undefined });
    trial.style.display = locked ? 'grid' : 'none'; lock.style.display = locked ? 'none' : '';
    central.control.disabled = inscribed.control.disabled = first.control.disabled = arc.control.disabled = locked;
    if (!locked) return;
    const messages = [first.get(), second.get()].filter(Boolean).map(id => {
      const intercept = circleInterceptedArc(task.board, task.ends, id);
      if (!intercept || circleArcHas(task.board, { ends: task.ends, via: task.through }, id)) return `${id} ei ole tällä havaintokaarella.`;
      return `${id}: ${String(circleArc(task.board, intercept)!.degrees / 2).replace('.', ',')}°.`;
    });
    observation.value = 'Havaitut kulmat ' + messages.join(' ');
  }
  diagram.onPick(id => point.click(id)); draw();
  return {
    node: h('div', { style: panel }, drawColumns(diagram.canvas, h('div', { style: stack },
      note(`Halkaisija ${task.ends.join('–')}. Tarkasteltava puoliympyrä kulkee pisteen ${task.through} kautta. Kärki on toisella puolella.`),
      first.node, arc.node)),
      h('div', { style: row }, central.node, inscribed.node, lock), trial),
    ready: () => locked,
    read: () => ({ kind, mode: 'thales', vertices: pair(first.get(), second.get()), arc: arc.get(), central: central.get(), inscribed: inscribed.get(), locked,
      compareArc: compareArc.get(), compareCentral: compareCentral.get(), compareInscribed: compareInscribed.get(), candidateWorks: bool(candidate?.get() ?? '') }),
    show(a) {
      first.set(a.vertices[0]); second.set(a.vertices[1]); arc.set(a.arc); central.set(a.central); inscribed.set(a.inscribed);
      compareArc.set(a.compareArc); compareCentral.set(a.compareCentral); compareInscribed.set(a.compareInscribed);
      candidate?.set(booleanValue(a.candidateWorks)); locked = true; draw();
    },
  };
}

export function circleObservatoryBoard(task: CircleObservatoryTask): Paint {
  return host => {
    const given = task.mode === 'parts' && (task.part === 'radius' || task.part === 'diameter' || task.part === 'basic')
      ? note(`Kartan säde ${task.radius} ${task.unit}. Anna kaikki pituudet samassa yksikössä.`) : null;
    const description = task.mode === 'measure' ? task.board.setting : 'Kehä ja nimetyt pisteet näkyvät kartassa. Käytä valikoita. Kun pistevalikko on kohdistettu, voit myös napsauttaa pistettä kuvasta.';
    host.replaceChildren(h('div', { style: stack, [attr('givens')]: '' }, note(description), given));
  };
}
export function mountCircleObservatory(task: CircleObservatoryTask, host: HTMLElement, submit: (answer: CircleObservatoryResponse) => void): { reveal(): void } {
  function mount<M extends Mode>(work: Work<M>) {
    const done = h('button', { type: 'submit', class: 'btn primary wide', [attr('submit')]: '' }, 'Tarkista merkinnät');
    const form = h('form', { [attr('workbench')]: task.mode, style: stack }, work.node, done);
    let frozen = false;
    const refresh = () => { done.disabled = frozen || work.ready?.() === false; };
    refresh(); form.addEventListener('click', refresh);
    function freeze() {
      frozen = true;
      for (const control of form.querySelectorAll('input,button,select')) control.setAttribute('disabled', '');
      for (const svg of form.querySelectorAll('svg')) svg.style.pointerEvents = 'none';
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (frozen || work.ready?.() === false) return;
      const a = work.read();
      freeze(); submit(a);
    });
    host.append(form);
    return { reveal() { work.show(solutionCircleObservatory(task) as Answer<M>); freeze(); } };
  }
  switch (task.mode) {
    case 'parts': return mount(parts(task));
    case 'angles': return mount(angles(task));
    case 'measure': return mount(measure(task));
    case 'thales': return mount(thales(task));
  }
}
export function circleObservatoryExample(task: CircleObservatoryTask): Paint {
  return host => {
    const givens = h('div'), work = h('div');
    circleObservatoryBoard(task)(givens);
    mountCircleObservatory(task, work, () => {}).reveal();
    work.querySelector('[data-circle-submit]')?.remove();
    host.replaceChildren(givens, work);
  };
}
