import type { Paint } from '../../engine/types';
import { h } from '../../ui/dom';
import { displayMeasure, liquidHeightFraction, massBeamMark, massDisplayGrams, measureTools, measureUnits, solutionMeasurementStation, vesselWidths, type MeasureReading, type MeasureTool, type MeasurementStationResponse,
  type MeasurementStationTask, type MeasureUnit } from '../models/measurement-station';

const stack = 'display:grid;gap:5px';
const row = 'display:flex;flex-wrap:wrap;align-items:center;gap:5px 9px';
const panel = `${stack};background:#edf4e9;border:1px solid #9dbcb0;border-radius:10px;padding:7px`;
const field = 'box-sizing:border-box;min-height:44px;max-width:100%;border:1px solid #81a594;border-radius:8px;background:#fffefa;color:#163b35;padding:4px 7px;font:inherit';
const units = Object.keys(measureUnits).map(unit => [unit, unit] as const) as readonly (readonly [MeasureUnit, string])[];
const text = (value: string) => h('p', { style: 'margin:0' }, value);
const bold = (value: string) => h('strong', {}, value);
const action = (name: string, run: () => void) => h('button', { type: 'button', class: 'btn small', style: 'min-width:44px;min-height:44px', onclick: run }, name);
const live = () => h('p', { style: 'margin:0;font-weight:700', 'aria-live': 'polite' });
const pretty = ({ value, unit }: MeasureReading) => `${value} ${unit ?? ''}`.trim();

function pick<T extends string>(label: string, options: readonly (readonly [T, string])[], visible = label) {
  const input = h('select', { 'aria-label': label, style: field }, h('option', { value: '' }, 'Valitse'),
    ...options.map(([id, name]) => h('option', { value: id }, name)));
  return { input, node: h('label', { style: row }, bold(visible), input), get: () => (input.value || null) as T | null,
    set: (id: T | null) => { input.value = id ?? ''; } };
}
function input(label: string) {
  const control = h('input', { type: 'text', inputmode: 'decimal', 'aria-label': label, style: `${field};width:74px;text-align:center` });
  return { control, node: h('label', { style: row }, bold(label), control), get: () => control.value,
    set: (value: string) => { control.value = value; } };
}
function reading(label: string, choices = units) {
  const value = input(label);
  const unit = pick(`${label}, yksikkö`, choices, 'Yksikkö');
  return { value, unit, node: h('div', { style: row }, value.node, unit.node),
    get: (): MeasureReading => ({ value: value.get(), unit: unit.get() }),
    set: (answer: MeasureReading) => { value.set(answer.value); unit.set(answer.unit); },
    freeze: () => { value.control.disabled = true; unit.input.disabled = true; } };
}
const lengthUnits = units.filter(([unit]) => measureUnits[unit].dimension === 'length');
const lengthReading = (label: string) => reading(label, lengthUnits);
const twoUnits = (unit: MeasureUnit) => {
  const dimension = measureUnits[unit].dimension;
  return units.filter(([value]) => measureUnits[value].dimension === dimension);
};

const ns = 'http://www.w3.org/2000/svg';
function shape(name: string, props: Record<string, string | number>, label?: string) {
  const node = document.createElementNS(ns, name);
  for (const [key, value] of Object.entries(props)) node.setAttribute(key, String(value));
  if (label !== undefined) node.textContent = label;
  return node;
}
function image(label: string, width: number, height: number, ...children: SVGElement[]) {
  const svg = shape('svg', { role: 'img', 'aria-label': label, viewBox: `0 0 ${width} ${height}`,
    style: `display:block;width:100%;max-width:${width * 1.6}px;height:auto;max-height:150px;color:#183d39` });
  svg.append(...children);
  return svg;
}
const ln = (x1: number, y1: number, x2: number, y2: number, stroke = '#315c52', width = 2) =>
  shape('line', { x1, y1, x2, y2, stroke, 'stroke-width': width, 'stroke-linecap': 'round' });
const label = (x: number, y: number, value: string, size = 12) =>
  shape('text', { x, y, fill: '#153b36', 'font-size': size, 'font-weight': 650 }, value);
const rect = (x: number, y: number, width: number, height: number, fill: string, rx = 0) =>
  shape('rect', { x, y, width, height, fill, rx });
const poly = (points: string, fill: string, stroke = '#35625a') =>
  shape('polygon', { points, fill, stroke, 'stroke-width': 1.5 });

type Mode = MeasurementStationTask['mode'];
type Task<M extends Mode> = Extract<MeasurementStationTask, { mode: M }>;
type Response<M extends Mode> = Extract<MeasurementStationResponse, { mode: M }>;
type Work<M extends Mode> = { node: HTMLElement; read(): Response<M>; show(answer: Response<M>): void; ready?(): boolean };
const fillAnswer = <M extends Mode>(mode: M) => ({ kind: 'measurement-station' as const, mode });

function mass(task: Task<'mass'>): Work<'mass'> {
  let basket = false, placed = false, zeroed: Response<'mass'>['zeroed'] = null;
  const note = live(), art = h('div', { 'data-measure-scale': '' });
  const entry = reading('Punnittu massa', twoUnits(task.unit));
  const pan = action('Aseta astia', () => { basket = !basket; draw(); });
  const zero = action('Nollaa tyhjä vaaka', () => {
    zeroed = basket ? 'basket' : 'empty';
    draw();
  });
  const load = action('Aseta kohde', () => { placed = !placed; draw(); });
  function draw() {
    pan.textContent = basket ? 'Poista astia' : 'Aseta astia';
    pan.disabled = placed;
    zero.disabled = placed;
    zero.textContent = basket ? 'Taaraa astia' : 'Nollaa tyhjä vaaka';
    load.textContent = placed ? 'Poista kohde' : 'Aseta kohde';
    const raw = massDisplayGrams(task, basket, placed, zeroed);
    const value = `${displayMeasure(raw, task.unit)} ${task.unit}`;
    const props = [rect(19, 42, 87, 34, '#9fb9b0', 8), ln(12, 42, 113, 42, '#38655a', 4)];
    if (basket) props.push(poly('29,28 97,28 88,41 38,41', '#bd9158'));
    if (placed) props.push(rect(42, basket ? 10 : 22, 43, 19, '#719983', 6));
    if (task.display === 'digital') props.push(rect(121, 30, 143, 44, '#d6e5dc', 5), label(133, 58, value, 23));
    else {
      const { first, fraction } = massBeamMark(raw);
      const ticks = Array.from({ length: 7 }, (_, i) => {
        const x = 128 + 25 * i;
        return [ln(x, 44, x, i % 2 ? 51 : 55, '#315c52', 1.5),
          ...(i % 2 ? [] : [label(x - 9, 70, displayMeasure(first + i * 50, task.unit), 11)])];
      }).flat();
      const marker = 128 + fraction * 150;
      props.push(...ticks, ln(127, 44, 279, 44), poly(`${marker - 5},31 ${marker + 5},31 ${marker},43`, '#bd764b'), label(249, 22, task.unit));
    }
    art.replaceChildren(image(`Vaa’an lukema ${value}. ${basket ? 'Astia on paikallaan.' : ''}`, 290, 86, ...props));
    note.textContent = placed ? 'Kohde on vaa’alla.' : basket ? 'Astia on vaa’alla.' : 'Vaaka on tyhjä.';
  }
  draw();
  return { node: h('div', { style: panel }, art, h('div', { style: row }, task.basket ? pan : null, zero, load), note, entry.node),
    read: () => ({ ...fillAnswer('mass'), zeroed, basketPlaced: basket, placed, reading: entry.get() }),
    show(answer) { placed = answer.placed; zeroed = answer.zeroed; basket = answer.basketPlaced; entry.set(answer.reading); draw(); },
  };
}

function liquid(task: Task<'liquid'>): Work<'liquid'> {
  let filled = task.initial;
  const eye = pick('Silmän paikka', [['above', 'Ylhäällä'], ['level', 'Pinnan korkeudella'], ['below', 'Alhaalla']] as const);
  const meniscus = pick('Vedenpinnan lukukohta', [['edge', 'Ylös kaartuva reuna'], ['bottom', 'Kaaren alin kohta']] as const);
  const entry = reading('Asteikon nestemäärä', twoUnits(task.unit));
  const vessel = h('div', { 'data-measure-vessel': task.shape });
  const portion = `${displayMeasure(task.portion, task.unit)} ${task.unit}`;
  const add = action(`Kaada ${portion}`, () => { filled += task.portion; draw(); });
  const drain = action(`Poista ${portion}`, () => { filled -= task.portion; draw(); });
  function draw() {
    add.disabled = filled + task.portion > task.capacity;
    drain.disabled = filled === 0;
    const level = (v: number) => 127 - 108 * liquidHeightFraction(task.shape, v, task.capacity);
    const side = (y: number) => task.shape === 'flared' ? (y - 19) * (vesselWidths.top - vesselWidths.base) / 216 : 0;
    const y = level(filled), shift = side(y - 6), left = 40 + shift, right = 152 - shift;
    const baseLeft = 40 + side(127), baseRight = 152 - side(127);
    const surface = `M${left} ${y - 6} Q96 ${y + 6} ${right} ${y - 6}`;
    const liquid = filled ? [shape('path', { d: `${surface} L${baseRight} 127 L${baseLeft} 127 Z`, fill: '#7abaca', stroke: '#237184', 'stroke-width': 2 })] : [];
    const ticks = Array.from({ length: task.capacity / task.step + 1 }, (_, i) => {
      const ty = level(i * task.step), edge = 152 - side(ty);
      return [ln(edge - 8, ty, 164, ty, '#426b65', 1), label(168, ty + 4, displayMeasure(i * task.step, task.unit), 11)];
    }).flat();
    const eyeY = eye.get() === 'above' ? y - 14 : eye.get() === 'below' ? y + 14 : y;
    const aimedX = meniscus.get() === 'edge' ? right - 3 : 96;
    const aimedY = meniscus.get() === 'edge' ? y - 6 : y;
    const sight = eye.get() && filled ? [
      ln(229, eyeY, aimedX, aimedY, '#a24d34', 1.5),
      shape('ellipse', { cx: 230, cy: eyeY, rx: 9, ry: 5, fill: '#ffedcc', stroke: '#84462d' }),
      shape('circle', { cx: 230, cy: eyeY, r: 2.5, fill: '#84462d' }),
      ...(meniscus.get() ? [shape('circle', { cx: aimedX, cy: aimedY, r: 3, fill: '#803b25' })] : []),
    ] : [];
    const accessible = filled ? (eye.get() === 'level' && meniscus.get() === 'bottom'
      ? `Asteikon lukema veden kaaren alimmassa kohdassa: ${displayMeasure(filled, task.unit)} ${task.unit}.`
      : 'Astian asteikko ja kaartuva veden pinta. Valitse silmän paikka ja lukukohta.') : 'Asteikoitu astia on tyhjä.';
    vessel.replaceChildren(image(accessible, 260, 143,
      poly(`${40 + side(11)},11 ${152 - side(11)},11 ${baseRight},127 ${baseLeft},127`, '#e3efea'), ...liquid, ...ticks, ...sight, label(168, 11, task.unit)));
  }
  eye.input.addEventListener('change', draw);
  meniscus.input.addEventListener('change', draw);
  draw();
  return { node: h('div', { style: panel }, vessel, h('div', { style: row }, add, drain),
    h('div', { style: row }, eye.node, meniscus.node), entry.node),
    read: () => ({ ...fillAnswer('liquid'), filled, eye: eye.get(), meniscus: meniscus.get(), reading: entry.get() }),
    show(a) { filled = a.filled; eye.set(a.eye); meniscus.set(a.meniscus); entry.set(a.reading); draw(); },
  };
}

function estimate(task: Task<'estimate'>): Work<'estimate'> {
  let locked: MeasureReading | null = null, measured = false;
  const picture = h('div', { 'data-measure-estimate': 'rough' }), note = live();
  const estimate = lengthReading('Arvio'), exact = lengthReading('Mitattu pituus');
  const compare = pick('Arvion suhde mittaan', [['smaller', 'Arvio on pienempi'], ['same', 'Arvio on yhtä suuri'], ['larger', 'Arvio on suurempi']] as const);
  const results = h('div', { hidden: true, style: row }, exact.node, compare.node);
  const lock = action('Lukitse arvio', () => {
    const proposed = estimate.get();
    if (!proposed.unit || !/^\d{1,12}(?:[,.]\d{1,8})?$/.test(proposed.value.trim())) return;
    locked = proposed; estimate.freeze(); lock.disabled = true; measure.disabled = false; measure.focus(); draw();
  });
  const measure = action('Aseta mittanauha', () => { measured = true; measure.disabled = true; draw(); exact.value.control.focus(); });
  measure.disabled = true;
  function draw() {
    const unit = 245 / Math.max(task.referenceMm, task.lengthMm + 40);
    const reference = task.referenceMm * unit, target = task.lengthMm * unit;
    const axis = measured ? ruler(20, 65, task.lengthMm, unit) : [];
    const measurement = `Mittanauhan osoitin: ${displayMeasure(task.lengthMm, 'cm')} cm.`;
    const roughRelation = task.lengthMm === task.referenceMm ? 'Kohde on vertailumitan pituinen.' : task.lengthMm === task.referenceMm * 2 ? 'Kohde on kahden vertailumitan pituinen.' : task.lengthMm > task.referenceMm * 2 ? 'Kohde on yli kaksi vertailumitan pituutta.'
      : task.lengthMm > task.referenceMm ? 'Kohde on vertailumittaa pidempi, mutta jää alle kahden vertailumitan.' : 'Kohde on vertailumittaa lyhyempi.';
    picture.dataset.measureEstimate = measured ? 'measured' : locked ? 'locked' : 'rough';
    picture.replaceChildren(image(measured ? measurement : `${task.reference} vertailuna. ${roughRelation}`, 285, measured ? 95 : 66,
      rect(20, 7, reference, 12, '#b78854', 5), label(20, 33, `${displayMeasure(task.referenceMm, 'cm')} cm`),
      rect(20, 41, target, 13, '#609a82', 5), ...axis));
    results.hidden = !measured;
    results.style.display = measured ? 'flex' : 'none';
    note.textContent = locked ? `Lukittu arvio ${pretty(locked)}.` : `Vertailukohde: ${task.reference}.`;
  }
  draw();
  return { node: h('div', { style: panel }, picture, note, h('div', { style: row }, estimate.node, lock, measure), results),
    ready: () => measured,
    read: () => ({ ...fillAnswer('estimate'), estimate: locked, measured, reading: exact.get(), comparison: compare.get() }),
    show(a) { locked = a.estimate; measured = a.measured; if (a.estimate) estimate.set(a.estimate);
      exact.set(a.reading); compare.set(a.comparison); draw(); },
  };
}
function ruler(x: number, y: number, length: number, scale: number) {
  const last = Math.ceil(length / 50) * 50;
  const stride = scale > 1.1 ? 10 : 50;
  return [ln(x, y, x + last * scale, y), ...Array.from({ length: last / 10 + 1 }, (_, i) => {
    const at = x + i * 10 * scale;
    return [ln(at, y, at, y + (i % 5 ? 6 : 9), '#315c52', 1),
      ...(i * 10 % stride === 0 ? [label(at - 3, y + 22, String(i), 10)] : [])];
  }).flat(), ln(x + length * scale, y - 10, x + length * scale, y + 3, '#924f34', 2)];
}

function tool(task: Task<'tool'>): Work<'tool'> {
  const tools = Object.entries(measureTools) as [MeasureTool, (typeof measureTools)[MeasureTool]][];
  const choice = pick('Mittaväline', tools.map(([id, info]) => [id, info.label]));
  const reason = pick('Mitä väline vertaa?', [['capacity', 'Nestepintaa tilavuusviivoihin'],
    ['distance', 'Päätepisteiden väliä pituusviivoihin'], ['mass', 'Kuormaa tunnettuun massaan']] as const);
  const table = h('table', { style: 'width:100%;font-size:14px;border-collapse:collapse' },
    h('caption', { style: 'text-align:left;font-weight:700' }, 'Välinelaukun asteikot'),
    h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Väline'), h('th', { scope: 'col' }, 'Mittausalue'), h('th', { scope: 'col' }, 'Asteikkoväli'))));
  const data = h('tbody'); table.append(data);
  function draw() {
    data.replaceChildren(...tools.map(([id, info]) => h('tr', { 'data-measure-tool': id,
      style: `text-align:center;background:${choice.get() === id ? '#cae0ce' : 'transparent'}` },
    h('th', { scope: 'row', style: 'text-align:left' }, info.label),
    h('td', {}, `0–${info.max} ${info.unit}`), h('td', {}, `${info.division} ${info.unit}`))));
  }
  choice.input.addEventListener('change', draw); draw();
  return { node: h('div', { style: panel }, table, choice.node, reason.node),
    read: () => ({ ...fillAnswer('tool'), tool: choice.get(), reason: reason.get() }),
    show(a) { choice.set(a.tool); reason.set(a.reason); draw(); },
  };
}

function unit(task: Task<'unit'>): Work<'unit'> {
  const entry = reading('Mittalapun määrä', units.filter(([u]) => task.allowedUnits.includes(u)));
  return { node: h('div', { style: panel }, text('Mittalapussa on tilaa kokonaisluvulle 1–99 ja yksikölle.'), entry.node),
    read: () => ({ ...fillAnswer('unit'), reading: entry.get() }), show(a) { entry.set(a.reading); },
  };
}

function precision(task: Task<'precision'>): Work<'precision'> {
  const value = reading('Lähimmän viivan lukema', twoUnits(task.unit));
  const step = reading('Asteikkoväli', twoUnits(task.unit));
  const kind = pick('Osoittimen kohta', [['on', 'Viivalla'], ['between', 'Kahden viivan välissä']] as const);
  const start = 18, width = 244, at = (n: number) => start + n / task.end * width;
  const left = task.actual - task.actual % task.step;
  const right = left + task.step;
  const accessible = left === task.actual ? `Osoitin on viivalla ${displayMeasure(left, task.unit)} ${task.unit}.`
    : `Osoitin on viivojen ${displayMeasure(left, task.unit)} ja ${displayMeasure(right, task.unit)} ${task.unit} välissä, ${2 * (task.actual - left) === task.step ? 'puolivälissä' : 2 * (task.actual - left) < task.step ? 'lähempänä alempaa' : 'lähempänä ylempää'}.`;
  const ticks = Array.from({ length: task.end / task.step + 1 }, (_, i) => {
    const x = at(i * task.step);
    return [ln(x, 40, x, 53), label(x - 6, 67, displayMeasure(i * task.step, task.unit), 10)];
  }).flat();
  const x = at(task.actual);
  const dial = image(`Tasavälinen asteikko. Viivat ${Array.from({ length: task.end / task.step + 1 }, (_, i) => displayMeasure(i * task.step, task.unit)).join(' · ')} ${task.unit}. ${accessible}`,
    288, 75, ln(start, 40, at(task.end), 40), ...ticks, poly(`${x - 6},24 ${x + 6},24 ${x},39`, '#b76a45'), label(256, 22, task.unit));
  return { node: h('div', { style: panel }, dial, step.node, kind.node, value.node),
    read: () => ({ ...fillAnswer('precision'), step: step.get(), reading: value.get(), approximate: kind.get() === 'between' }),
    ready: () => kind.get() !== null,
    show(a) { step.set(a.step); value.set(a.reading); kind.set(a.approximate ? 'between' : 'on'); },
  };
}

function plausibility(task: Task<'plausibility'>): Work<'plausibility'> {
  const verdict = pick('Vertailun perustelu', [['fits', 'Suure ja määrä sopivat vertailuun'], ['too-small', 'Määrä on liian pieni'],
    ['too-large', 'Määrä on liian suuri'], ['wrong-dimension', 'Yksikkö kuvaa toista ominaisuutta']] as const);
  const entry = reading('Uskottava määrä');
  const references = h('div', { style: row }, h('span', {}, bold('Vertailu: '), task.reference),
    h('span', {}, bold('Loikan lappu: '), pretty(task.proposal)));
  return { node: h('div', { style: panel }, references, verdict.node, entry.node),
    read: () => ({ ...fillAnswer('plausibility'), judgment: verdict.get(), reading: entry.get() }),
    show(a) { verdict.set(a.judgment); entry.set(a.reading); },
  };
}

function recheck(task: Task<'recheck'>): Work<'recheck'> {
  let tape = false, count = 0;
  const rulerRead = lengthReading('Mittanauhan havainto'), final = lengthReading('Tarkistettu pituus');
  const fault = pick('Mitä aiemmin tapahtui?', [['gaps', 'Mittapalojen väliin jäi rakoja'], ['origin', 'Nauhan alkulukema jäi vähentämättä'],
    ['none', 'Mitat sopivat yhteen']] as const);
  const board = h('div', { 'data-measure-recheck': '' });
  const align = action('Aseta mittanauha', () => { tape = true; draw(); });
  const more = action('Lisää mittapala', () => { count++; draw(); });
  const less = action('Poista mittapala', () => { count--; draw(); });
  const span = 210;
  const oldEvidence = task.fault === 'origin' ? image(
    `Aiempi nauha kohteen alla. Vasemmalla ${task.origin} cm ja oikealla ${task.oldRuler} cm. Vihkoon kirjattiin ${task.oldRuler} cm.`,
    255, 50, rect(18, 2, span, 12, '#9ab4a0', 3), ln(18, 23, 18 + span, 23),
    ln(18, 21, 18, 32), ln(18 + span, 21, 18 + span, 32), label(16, 44, String(task.origin), 10),
    label(220, 44, `${task.oldRuler} cm`, 10))
    : task.fault === 'gaps' ? image('Aiemman mittapalarivin ensimmäinen ja viimeinen pala osuvat kohteen päihin. Palojen välissä näkyy tyhjää tilaa.',
      255, 41, rect(18, 2, span, 12, '#9ab4a0', 3),
      ...Array.from({ length: task.segments - 1 }, (_, i) => {
        const unitWidth = span / task.segments;
        const gap = unitWidth / (task.segments - 2);
        return rect(18 + i * (unitWidth + gap), 23, unitWidth, 12, '#bf9861', 1);
      }))
    : text('Aiemmat merkinnät sopivat yhteen. Tee silti oma mittaus.');
  function draw() {
    align.disabled = tape;
    more.disabled = count >= task.segments + 2; less.disabled = count <= 0;
    rulerRead.value.control.disabled = !tape; rulerRead.unit.input.disabled = !tape;
    const scale = 220 / (task.segments + 2), start = 18, end = start + task.segments * scale;
    const left = task.origin, right = left + task.segments * task.segmentCm;
    const marks = tape ? [ln(start, 47, end, 47), ...Array.from({ length: task.segments + 1 }, (_, i) => {
      const x = start + i * scale;
      return [ln(x, 46, x, 53, '#315c52', 1.5), label(x - 4, 67, String(task.origin + i * task.segmentCm), 10)];
    }).flat()] : [];
    const tiles = Array.from({ length: count }, (_, i) => rect(start + i * scale, 74, scale - 1, 14, '#bf9861', 1));
    board.replaceChildren(image(`Mitattava kohde. ${tape ? `Nauhan päätepisteet ${left} ja ${right} cm.` : ''} ${count ? `${count} mittapalaa, rivi on ${count === task.segments ? 'kohteen mittainen' : count < task.segments ? 'kohdetta lyhyempi' : 'kohdetta pidempi'}.` : ''}`,
      255, 96, rect(start, 24, end - start, 15, '#69a18b', 4), ...marks, ...tiles));
  }
  draw();
  const views = h('div', { style: 'display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:8px;align-items:start' },
    h('div', { style: stack }, bold('Loikan asetelma'), oldEvidence), h('div', { style: stack }, bold('Uusi mittaus'), board));
  return { node: h('div', { style: panel }, views, h('div', { style: row }, align, more, less), rulerRead.node, fault.node, final.node),
    ready: () => tape && count > 0,
    read: () => ({ ...fillAnswer('recheck'), tape: tape ? rulerRead.get() : null, segmentCount: count || null, fault: fault.get(), reading: final.get() }),
    show(a) { tape = !!a.tape; count = a.segmentCount ?? 0;
      if (a.tape) rulerRead.set(a.tape); fault.set(a.fault); final.set(a.reading); draw(); },
  };
}

function cube(task: Task<'cube'>): Work<'cube'> {
  let pouredDl = 0;
  const edge = reading('Yhden kuution särmä', [['cm', 'cm']]), litres = input('Nestettä litroina'), dm3 = input('Tilavuus kuutiodesimetreinä');
  const cubes = h('div', { 'data-measure-cubes': '' });
  const fromCube = task.direction === 'from-cubes';
  const add = action(`Kaada ${task.portionDl} dl`, () => { pouredDl += task.portionDl; draw(); });
  const remove = action('Palauta viimeinen annos', () => { pouredDl -= task.portionDl; draw(); });
  function draw() {
    const filled = Math.floor(pouredDl / 10), total = fromCube ? task.amount : Math.ceil(pouredDl / 10);
    add.disabled = pouredDl >= task.amount * 10; remove.disabled = pouredDl <= 0;
    const boxes = Array.from({ length: total }, (_, i) => {
      const x = 15 + i * 60, water = Math.max(0, Math.min(1, pouredDl / 10 - i)), y = 69 - water * 35;
      return [
        poly(`${x},34 ${x + 13},21 ${x + 48},21 ${x + 35},34`, '#e8f4ee'),
        poly(`${x + 35},34 ${x + 48},21 ${x + 48},56 ${x + 35},69`, '#cce4dc'),
        poly(`${x},34 ${x + 35},34 ${x + 35},69 ${x},69`, '#f0f8f0'),
        ...(water ? [
          poly(`${x},${y} ${x + 13},${y - 13} ${x + 48},${y - 13} ${x + 35},${y}`, '#9ed9e3'),
          poly(`${x + 35},${y} ${x + 48},${y - 13} ${x + 48},56 ${x + 35},69`, '#65aebe'),
          poly(`${x},${y} ${x + 35},${y} ${x + 35},69 ${x},69`, '#86c6d3'),
        ] : []),
        ...(i === 0 ? [ln(x, 79, x + 35, 79, '#3b685f', 1), label(x, 93, '1 dm', 10)] : []),
      ];
    }).flat();
    const description = `${total} samanlaista kuutiota. ${filled} täynnä. Kaadettu ${pouredDl} dl.`;
    cubes.replaceChildren(image(`${description} Yhden kuution jokainen särmä on yksi desimetri.`, 265, 99,
      ...(!total ? [rect(15, 21, 48, 49, '#d9e8df', 4), label(74, 49, 'Kuutiot asetetaan tähän')] : []), ...boxes));
  }
  draw();
  return { node: h('div', { style: panel }, cubes, h('div', { style: row }, add, remove),
    h('div', { style: row }, edge.node, litres.node, dm3.node)),
    read: () => ({ ...fillAnswer('cube'), filled: Math.floor(pouredDl / 10), pouredDl, edge: edge.get(), litres: litres.get(), cubicDecimetres: dm3.get() }),
    show(a) { pouredDl = a.pouredDl; edge.set(a.edge); litres.set(a.litres); dm3.set(a.cubicDecimetres); draw(); },
  };
}

export function measurementStationBoard(task: MeasurementStationTask): Paint {
  return host => {
    const givens = task.mode === 'mass' ? [task.basket ? 'Punnitse kohde astiassa. Astian massa on taarattava pois.' : 'Punnitse kohde ilman astiaa. Vaaka voi näyttää aluksi muuta kuin nollaa.']
      : task.mode === 'liquid' ? [`Tavoite ${displayMeasure(task.target, task.unit)} ${task.unit}. Astiassa on vettä, jonka pinta kaartuu astian reunoilla ylöspäin.`]
      : task.mode === 'estimate' ? [`Vertailukohde: ${task.reference}, ${displayMeasure(task.referenceMm, 'cm')} cm.`]
      : task.mode === 'tool' ? [task.question]
      : task.mode === 'unit' ? [`Aiempi tarkka lukema on ${pretty(task.source)}.`]
      : task.mode === 'precision' ? ['Kirjaa lähin viiva tämän asteikon yksikössä. Puolivälistä käytetään ylempää viivaa.']
      : task.mode === 'recheck' ? [`Aiemmat merkinnät: nauha ${task.oldRuler} cm, palat ${task.oldSegments} cm. Yksi mittapala on ${task.segmentCm} cm.`]
      : task.mode === 'cube' ? [task.direction === 'from-litres' ? `Kannussa on ${task.amount} litraa. Uusi kuutio asetetaan, kun edellinen täyttyy. Kirjoita särmän pituus senttimetreinä.`
        : 'Jokainen särmä on 1 dm. Täytä kaikki kuutiot kokonaan ja kirjoita särmän pituus senttimetreinä.']
      : [];
    host.replaceChildren(h('div', { 'data-measure-givens': '', style: stack },
      h('p', { style: 'margin:0' }, bold(task.object)),
      ...givens.map(text)));
  };
}

export function mountMeasurementStation(task: MeasurementStationTask, host: HTMLElement,
  submit: (response: MeasurementStationResponse) => void, onChange?: (response: MeasurementStationResponse) => void): { reveal(): void } {
  const mount = <M extends Mode>(work: Work<M>) => {
    const done = h('button', { type: 'submit', class: 'btn primary wide' }, 'Tarkista mittalappu');
    const form = h('form', { 'data-measure-workbench': task.mode, style: stack }, work.node, done);
    let locked = false;
    const refresh = () => { if (!locked) done.disabled = work.ready?.() === false; };
    refresh();
    form.addEventListener('click', event => {
      refresh();
      if (!locked && event.target instanceof HTMLButtonElement && event.target.type === 'button') onChange?.(work.read());
    });
    form.addEventListener('change', event => {
      refresh();
      if (!locked && event.target instanceof HTMLSelectElement) onChange?.(work.read());
    });
    function freeze() {
      locked = true;
      for (const control of form.querySelectorAll('input,select,button')) control.setAttribute('disabled', '');
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (locked || work.ready?.() === false) return;
      const answer = work.read();
      freeze(); submit(answer);
    });
    host.append(form);
    return { reveal() { work.show(solutionMeasurementStation(task) as Response<M>); freeze(); onChange?.(work.read()); } };
  };
  switch (task.mode) {
    case 'mass': return mount(mass(task));
    case 'liquid': return mount(liquid(task));
    case 'estimate': return mount(estimate(task));
    case 'tool': return mount(tool(task));
    case 'unit': return mount(unit(task));
    case 'precision': return mount(precision(task));
    case 'plausibility': return mount(plausibility(task));
    case 'recheck': return mount(recheck(task));
    case 'cube': return mount(cube(task));
  }
}

export function measurementStationExample(task: MeasurementStationTask): Paint {
  return host => {
    const givens = h('div'), work = h('div');
    measurementStationBoard(task)(givens);
    mountMeasurementStation(task, work, () => {}).reveal();
    work.querySelector('button[type="submit"]')?.remove();
    host.replaceChildren(givens, work);
  };
}
