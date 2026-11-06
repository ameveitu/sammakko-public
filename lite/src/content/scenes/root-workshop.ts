import type { Paint } from '../../engine/types';
import { h } from '../../ui/dom';
import { parseMeasure } from '../models/spatial-measures';
import { fixedText, radicalTerm, solutionRootWorkshop, squaredText,
  type RootMarker, type RootWorkshopResponse, type RootWorkshopTask } from '../models/root-workshop';

const stack = 'display:grid;gap:5px';
const row = 'display:flex;flex-wrap:wrap;gap:5px 8px;align-items:center';
const panel = `${stack};padding:7px;border:1px solid #9ab8aa;border-radius:10px;background:#edf4e9`;
const field = 'min-height:44px;min-width:0;max-width:100%;box-sizing:border-box;border:1px solid #7ca18e;border-radius:7px;padding:4px 6px;background:#fffdf5;color:#163d36;font:inherit';
const action = (name: string, run: () => void, short = name) =>
  h('button', { type: 'button', 'aria-label': name, class: 'btn small', style: 'min-width:44px;min-height:44px', onclick: run }, short);
const txt = (content: string) => h('p', { style: 'margin:0' }, content);
const strong = (content: string) => h('strong', {}, content);

function entry(name: string, visible = name, symbolic = false) {
  const input = h('input', { type: 'text', inputmode: symbolic ? 'text' : 'decimal', 'aria-label': name, autocomplete: 'off',
    style: `${field};width:${symbolic ? 114 : 74}px;text-align:center` });
  return { input, node: h('label', { style: row }, visible, input), get: () => input.value,
    set: (value: string) => { input.value = value; } };
}
function pick<T extends string>(name: string, options: readonly (readonly [T, string])[], visible = name, placeholder = 'Valitse') {
  const input = h('select', { 'aria-label': name, style: field }, h('option', { value: '' }, placeholder),
    ...options.map(([id, label]) => h('option', { value: id }, label)));
  return { input, node: h('label', { style: row }, visible, input), get: () => (input.value || null) as T | null,
    set: (value: T | null) => { input.value = value ?? ''; } };
}
const relations = [['=', '='], ['≈', '≈']] as const;
const exists = [['exists', 'On reaalinen neliöjuuri'], ['undefined', 'Ei reaalista neliöjuurta']] as const;
const classes = [['rational', 'Rationaalinen'], ['irrational', 'Irrationaalinen'], ['undetermined', 'Tieto ei riitä']] as const;
const bases = [['ratio', 'Tarkka murtoluku'], ['finite', 'Päättyvä tarkka desimaali'], ['periodic', 'Toistuva jakso'], ['known-irrational', 'Tunnettu irrationaalisuus'], ['fragment', 'Vain katkelma']] as const;

const ns = 'http://www.w3.org/2000/svg';
function el(name: string, attributes: Record<string, number | string>, content?: string) {
  const element = document.createElementNS(ns, name);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
  if (content !== undefined) element.textContent = content;
  return element;
}
function art(name: string, width: number, height: number, ...children: SVGElement[]) {
  const svg = el('svg', { role: 'img', 'aria-label': name, viewBox: `0 0 ${width} ${height}`,
    style: 'display:block;width:100%;height:auto;max-height:118px;color:#163d36' });
  svg.append(...children);
  return svg;
}
const line = (x1: number, y1: number, x2: number, y2: number, stroke = '#476d61', width = 1.5) =>
  el('line', { x1, y1, x2, y2, stroke, 'stroke-width': width, 'stroke-linecap': 'round' });
const caption = (x: number, y: number, text: string, size = 12) => el('text', { x, y, 'font-size': size, fill: '#173e36', 'font-weight': 700 }, text);
const rect = (x: number, y: number, width: number, height: number, fill: string) =>
  el('rect', { x, y, width, height, fill, rx: 2 });
const signed = (n: number) => String(n).replace('-', '−');
const short = (v: number) => String(v / 100).replace('.', ',').replace('-', '−');
const rootSign = (n: number) => n < 0 ? `√(${signed(n)})` : `√${n}`;

function visualNumber(text: string) {
  const fraction = parseMeasure(text);
  return fraction ? Number(fraction[0]) / Number(fraction[1]) : NaN;
}

type Task<M extends RootWorkshopTask['mode']> = Extract<RootWorkshopTask, { mode: M }> extends never
  ? Extract<RootWorkshopTask, { mode: 'principal' | 'exact' }> : Extract<RootWorkshopTask, { mode: M }>;
type Response<M extends RootWorkshopTask['mode']> = Extract<RootWorkshopResponse, { mode: M }> extends never
  ? Extract<RootWorkshopResponse, { mode: 'principal' | 'exact' }> : Extract<RootWorkshopResponse, { mode: M }>;
type Board<M extends RootWorkshopTask['mode']> = { node: HTMLElement; read(): Response<M>; show(answer: Response<M>): void };
const kind = 'root-workshop' as const;

function squarePicture(radicand: number, candidate: string, showTiles: boolean) {
  const value = visualNumber(candidate);
  const side = Number.isFinite(value) && value >= 0 && value <= 999 ? value : NaN;
  const scale = 75 / Math.max(1, Math.sqrt(Math.max(0, radicand)), Number.isNaN(side) ? 0 : side);
  const target = Math.sqrt(Math.max(0, radicand)) * scale;
  const drawn = Number.isNaN(side) ? 0 : side * scale;
  const tiles = showTiles && side > 0 && side <= 14 && Number.isInteger(side) ? Array.from({ length: side - 1 }, (_, i) => {
    const at = (i + 1) * scale;
    return [line(158 + at, 14, 158 + at, 14 + drawn), line(158, 14 + at, 158 + drawn, 14 + at)];
  }).flat() : [];
  return art(`Kohdeneliön ala ${radicand}. ${Number.isNaN(side) ? 'Kokeilun sivu on vielä avoin.' : `Kokeilun sivu ${candidate}.`}`, 260, 111,
    rect(27, 14, target, target, '#a6c2ae'),
    ...(target === 0 ? [el('circle', { cx: 27, cy: 14, r: 2.5, fill: '#416e60' }), caption(27, 55, 'Ala 0: piste')] : []),
    ...(drawn ? [rect(158, 14, drawn, drawn, '#dfbc86'), ...tiles] : []),
    caption(18, 104, `Ala ${radicand}`), caption(154, 104, 'Oma kokeilu'));
}

function principal(task: Task<'principal' | 'exact'>): Board<'principal' | 'exact'> {
  const status = pick('Onko reaalista neliöjuurta?', exists, 'Reaaliluvuissa');
  const probe = task.negativeProbe === undefined ? null :
    pick('Onko negatiivisella juurrettavalla reaalista neliöjuurta?', exists, rootSign(task.negativeProbe));
  const value = entry('Pääjuuri'), square = entry('Pääjuuren neliö');
  const picture = h('div', { 'data-root-square': '' });
  const figures = h('div', { style: row }, value.node, square.node);
  const hasGarden = task.view === 'garden' || task.view === 'tiles';
  const change = (delta: number) => {
    const current = visualNumber(value.get());
    const next = Math.max(0, Math.min(30, (Number.isFinite(current) ? Math.trunc(current) : 0) + delta));
    value.set(String(next)); draw();
  };
  const controls = hasGarden ? h('div', { style: row },
    action('Pienennä kokeilun sivua', () => change(-1), '− 1'),
    action('Suurenna kokeilun sivua', () => change(1), '+ 1')) : null;
  function draw() {
    const noReal = status.get() === 'undefined';
    figures.hidden = noReal; figures.style.display = noReal ? 'none' : 'flex';
    if (controls) controls.hidden = noReal;
    if (hasGarden) picture.replaceChildren(squarePicture(task.radicand, value.get(), task.view === 'tiles'));
  }
  status.input.addEventListener('change', () => {
    if (status.get() === 'undefined') { value.set(''); square.set(''); }
    draw();
  });
  value.input.addEventListener('input', draw);
  if (task.mode === 'exact') status.set('exists');
  draw();
  return { node: h('div', { style: panel }, hasGarden ? picture : null, task.mode === 'principal' ? status.node : null, controls, figures, probe?.node),
    read: () => ({ kind, mode: task.mode, status: status.get(), value: value.get(), squared: square.get(), ...(probe ? { negativeProbe: probe.get() } : {}) }),
    show(a) { status.set(a.status); value.set(a.value); square.set(a.squared); probe?.set(a.negativeProbe ?? null); draw(); },
  };
}

function estimatePicture(radicand: number, lower: string, upper: string) {
  const bounds = [visualNumber(lower), visualNumber(upper)].map(n => n >= 0 && n <= 999 ? n : NaN);
  const target = Math.sqrt(radicand);
  const scale = 67 / Math.max(target, ...bounds.filter(Number.isFinite));
  const cells = [target, ...bounds].flatMap((size, i) => {
    const x = 16 + 109 * i, name = i === 0 ? `Kohde · ala ${radicand}` : i === 1 ? 'Oma alaraja' : 'Oma yläraja';
    const mark = !Number.isFinite(size) ? line(x, 75, x + 33, 75, '#8eada0', 1)
      : size === 0 ? el('circle', { cx: x, cy: 75, r: 2.5, fill: '#9b6845' })
        : rect(x, 75 - size * scale, size * scale, size * scale, i === 0 ? '#a4c2ad' : '#e1bd85');
    return [mark, caption(x, 92, name, 11)];
  });
  return art(`Kohdeneliön ala ${radicand}. Alarajan kokeilu ${lower || 'avoin'}. Ylärajan kokeilu ${upper || 'avoin'}.`, 352, 100, ...cells);
}

const fixedMidpoint = (a: bigint, b: bigint) => a >= 0n && b - a === 1n ? fixedText(5n * (a + b), 1) : '';

function bounds(task: Task<'estimate' | 'paired'>) {
  const low = entry('Alempi kokonaisluku', 'Alempi'), high = entry('Ylempi kokonaisluku', 'Ylempi');
  const nearest = entry('Lähin kokonaisluku', 'Lähin');
  const refinedLow = entry('Alempi kymmenesosa'), refinedHigh = entry('Ylempi kymmenesosa');
  const art = task.mode === 'estimate' && task.view === 'garden' ? h('div', { 'data-root-estimate-squares': '' }, estimatePicture(task.radicand, '', '')) : null;
  const proof = h('p', { 'data-root-comparisons': '', style: 'margin:0;font-size:14px' }, 'Neliövertailu ilmestyy kokeiltujen rajojen alle.');
  function redraw() {
    art?.replaceChildren(estimatePicture(task.radicand, low.get(), high.get()));
    const show = (left: string, right: string) => {
      const a = squaredText(left), b = squaredText(right);
      return `(${left || '?'})² = ${a || '?'} · (${right || '?'})² = ${b || '?'}`;
    };
    const lower = parseMeasure(low.get()), upper = parseMeasure(high.get());
    const middle = lower && upper && lower[0] % lower[1] === 0n && upper[0] % upper[1] === 0n
      ? fixedMidpoint(lower[0] / lower[1], upper[0] / upper[1]) : '';
    proof.textContent = show(low.get(), high.get()) +
      (task.tenths ? ` · ${show(refinedLow.get(), refinedHigh.get())}` : '') +
      (middle ? ` · Puoliväli: ${middle}² = ${squaredText(middle)}` : '');
  }
  for (const field of [low, high, refinedLow, refinedHigh]) field.input.addEventListener('input', redraw);
  return {
    node: h('div', { style: stack }, art,
      h('div', { style: row }, low.node, high.node, nearest.node),
      task.tenths ? h('div', { style: row }, refinedLow.node, refinedHigh.node) : null, proof),
    read: () => ({ low: low.get(), high: high.get(), nearest: nearest.get(), refinedLow: refinedLow.get(), refinedHigh: refinedHigh.get() }),
    set(a: Pick<Response<'estimate'>, 'low' | 'high' | 'nearest' | 'refinedLow' | 'refinedHigh'>) {
      low.set(a.low); high.set(a.high); nearest.set(a.nearest); refinedLow.set(a.refinedLow); refinedHigh.set(a.refinedHigh); redraw();
    },
  };
}
function estimate(task: Task<'estimate'>): Board<'estimate'> {
  const inputs = bounds(task);
  return { node: h('div', { style: panel }, inputs.node), read: () => ({ kind, mode: task.mode, ...inputs.read() }),
    show: inputs.set };
}
function paired(task: Task<'paired'>): Board<'paired'> {
  const exact = entry('Tarkka sivu'), squared = entry('Tarkan sivun neliö', 'Sivun neliö');
  const exactMark = pick('Tarkan juuren merkki', relations, 'Merkki');
  const estimateMark = pick('Arvioidun juuren merkki', relations, 'Merkki');
  const inputs = bounds(task);
  return { node: h('div', { style: panel },
    h('div', { style: row }, strong(rootSign(task.exactRadicand)), exactMark.node, exact.node, squared.node),
    h('div', { style: row }, strong(`${rootSign(task.radicand)} ja sen lähin kokonaisluku`), estimateMark.node),
    inputs.node),
    read: () => ({ kind, mode: task.mode, exact: exact.get(), exactSquared: squared.get(), exactRelation: exactMark.get(),
      estimateRelation: estimateMark.get(), ...inputs.read() }),
    show(a) { exact.set(a.exact); squared.set(a.exactSquared); exactMark.set(a.exactRelation); estimateMark.set(a.estimateRelation); inputs.set(a); },
  };
}

function operation(task: Task<'operation'>): Board<'operation'> {
  const exact = entry('Tarkka tulos', 'Tarkka tulos', true), report = entry('Tulos yhden desimaalin tarkkuudella', 'Desimaali');
  const mark = pick('Tarkan tuloksen ja desimaalin merkki', relations, 'Merkki');
  const addRoot = action('Lisää juurimerkki', () => {
    const start = exact.input.selectionStart ?? exact.get().length;
    const end = exact.input.selectionEnd ?? start;
    exact.input.setRangeText('√', start, end, 'end'); exact.input.focus();
  }, '√');
  return { node: h('div', { style: panel },
    h('div', { style: row }, exact.node, addRoot, txt('Esimerkiksi √6 tai 2√6. Voit kirjoittaa myös sqrt(6).')),
    h('div', { style: row }, mark.node, report.node)),
    read: () => ({ kind, mode: task.mode, exact: exact.get(), report: report.get(), relation: mark.get() }),
    show(a) { exact.set(a.exact); report.set(a.report); mark.set(a.relation); },
  };
}
function classify(task: Task<'classify'>): Board<'classify'> {
  const cards = task.cards.map(card => ({
    ...card,
    classification: pick(`Lukulaji: ${card.id}`, classes, '', 'Lukulaji'),
    reasoning: pick(`Peruste: ${card.id}`, bases, '', 'Peruste'),
  }));
  return {
    node: h('div', { style: panel }, ...cards.map(card =>
      h('section', { 'data-root-card': card.id, style: 'border-bottom:1px solid #a7bfb1;padding:2px 0 4px' },
        h('p', { style: 'margin:0;font-size:14px' }, strong(`${card.id} · ${card.label}. `), card.detail),
        h('div', { style: row }, card.classification.node, card.reasoning.node)))),
    read: () => ({ kind, mode: task.mode, cards: Object.fromEntries(cards.map(card =>
      [card.id, { classification: card.classification.get(), basis: card.reasoning.get() }])) }),
    show(a) { for (const card of cards) { card.classification.set(a.cards[card.id]?.classification ?? null); card.reasoning.set(a.cards[card.id]?.basis ?? null); } },
  };
}

function axis(first: number, last: number, step: number, values: readonly { id: string; raw: string }[] = []) {
  const start = 25, width = 310;
  const project = (amount: number) => start + (amount - first) / (last - first) * width;
  const tickCount = (last - first) / step;
  const every = tickCount > 12 ? 4 : tickCount > 8 ? 2 : 1;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const amount = first + i * step, x = project(amount);
    const named = i % every === 0 || i === tickCount;
    return [line(x, 35, x, named ? 46 : 42), ...(named ? [caption(x - 8, 60, short(amount), 11)] : [])];
  }).flat();
  const marks = values.flatMap(({ id, raw }, i) => {
    const amount = visualNumber(raw) * 100;
    if (!Number.isFinite(amount) || amount < first || amount > last) return [];
    const x = project(amount), y = i % 2 ? 12 : 24;
    return [line(x, y + 2, x, 37, '#9b5739', 2), caption(x - 4, y, id, 12)];
  });
  const markDescription = values.filter(m => m.raw).map(({ id, raw }) => `${id} kohdassa ${raw}`).join(' · ');
  return art(`Lukusuora ${short(first)}–${short(last)}, yhden jaon väli ${short(step)}. ${markDescription}`,
    360, 68, line(start, 37, start + width, 37), ...ticks, ...marks);
}
function markerFact(marker: RootMarker) {
  return 'range' in marker ? `sallittu suljettu väli ${marker.range[0]}–${marker.range[1]}` : 'tarkka sijoitus';
}
function place(task: Task<'line'>): Board<'line'> {
  const chart = h('div', { 'data-root-axis': '' });
  const overview = task.overview ? h('div', { 'data-root-overview': '' }) : null;
  const inputs = task.markers.map(marker => {
    const where = entry(`Sijoitus ${marker.id}`, '');
    const exact = pick(`Sijoituksen merkki ${marker.id}`, relations, '', '= tai ≈');
    const move = (delta: number) => {
      const old = visualNumber(where.get());
      const point = Number.isFinite(old) ? Math.round(old * 100) + delta : task.first;
      const next = Math.max(task.first, Math.min(task.last, point));
      where.set(short(next)); redraw();
    };
    const controls = h('div', { style: row }, where.node,
      action(`Siirrä merkkiä ${marker.id} vasemmalle`, () => move(-task.step), '←'),
      action(`Siirrä merkkiä ${marker.id} oikealle`, () => move(task.step), '→'), exact.node);
    return { marker, where, exact, controls };
  });
  function redraw() {
    const positions = inputs.map(({ marker, where }) => ({ id: marker.id, raw: where.get() }));
    if (overview && task.overview) overview.replaceChildren(axis(task.overview[0], task.overview[1], 100, positions));
    chart.replaceChildren(axis(task.first, task.last, task.step, positions));
  }
  inputs.forEach(({ where }) => where.input.addEventListener('input', redraw)); redraw();
  return { node: h('div', { style: panel }, overview, chart, ...inputs.map(({ marker, controls }) =>
    h('div', { style: row, 'data-root-marker': marker.id }, strong(`${marker.id} · ${marker.label}`), controls))),
    read: () => ({ kind, mode: task.mode, markers: Object.fromEntries(inputs.map(({ marker, where, exact }) =>
      [marker.id, { value: where.get(), relation: exact.get() }])) }),
    show(a) { for (const { marker, where, exact } of inputs) { where.set(a.markers[marker.id]?.value ?? ''); exact.set(a.markers[marker.id]?.relation ?? null); } redraw(); },
  };
}

function exactApprox(task: Task<'exact-approx'>): Board<'exact-approx'> {
  const relation = pick('Tarkan arvon ja näytön merkki', relations, '= tai ≈');
  const order = pick('Tarkan arvon järjestys näyttöön nähden', [['<', 'Pienempi'], ['=', 'Sama'], ['>', 'Suurempi']] as const, 'Tarkka arvo on');
  const low = entry('Näytön alempi rajakohta', 'Alempi raja'), high = entry('Näytön ylempi rajakohta', 'Ylempi raja');
  return { node: h('div', { style: panel },
    h('div', { style: row }, relation.node, order.node), h('div', { style: row }, low.node, high.node)),
    read: () => ({ kind, mode: task.mode, relation: relation.get(), order: order.get(), low: low.get(), high: high.get() }),
    show(a) { relation.set(a.relation); order.set(a.order); low.set(a.low); high.set(a.high); },
  };
}
function round(task: Task<'round'>): Board<'round'> {
  const low = entry('Alempi asteikkokohta', 'Alempi kohta'), high = entry('Ylempi asteikkokohta', 'Ylempi kohta');
  const result = entry('Kirjattava lukema', task.goal === 'pieces' ? 'Kokonaisia osia' : 'Kirjattava lukema');
  const scale = h('div', { 'data-root-round-axis': '' });
  function redraw() {
    const a = visualNumber(low.get()), b = visualNumber(high.get()), original = visualNumber(task.value);
    const where = Number.isFinite(a) && Number.isFinite(b) && b > a ? (original - a) / (b - a) : NaN;
    scale.replaceChildren(art(`Alkuperäinen luku ${task.value}. ${low.get() ? `Alempi ehdotus ${low.get()}.` : ''} ${high.get() ? `Ylempi ehdotus ${high.get()}.` : ''}`,
      330, 57, line(24, 29, 300, 29), line(24, 22, 24, 36), line(300, 22, 300, 36),
      caption(13, 52, low.get().slice(0, 14) || '?'), caption(266, 52, high.get().slice(0, 14) || '?'),
      ...(where >= 0 && where <= 1 ? [line(24 + 276 * where, 11, 24 + 276 * where, 30, '#a25d3f', 2)] : [])));
  }
  low.input.addEventListener('input', redraw); high.input.addEventListener('input', redraw); redraw();
  return { node: h('div', { style: panel }, scale, h('div', { style: row }, low.node, high.node, result.node)),
    read: () => ({ kind, mode: task.mode, low: low.get(), high: high.get(), result: result.get() }),
    show(a) { low.set(a.low); high.set(a.high); result.set(a.result); redraw(); },
  };
}

export function rootWorkshopBoard(task: RootWorkshopTask): Paint {
  return host => {
    const givens = h('div', { 'data-root-givens': '', style: stack });
    switch (task.mode) {
      case 'principal':
      case 'exact':
        givens.append(h('p', { style: 'margin:0' }, strong(rootSign(task.radicand)), task.view === 'garden' || task.view === 'tiles' ? ' · Neliön ala ja sen sivu' : ' · Reaaliluvuissa.'));
        if (task.view === 'repair') givens.append(txt('Loikan luonnoksessa juurimerkki tarkoitti kahta vastakkaismerkkistä lukua. Tarkista merkitys.'));
        break;
      case 'estimate':
        givens.append(h('p', { style: 'margin:0' }, strong(rootSign(task.radicand)), ' · Rajaa sivu kokonaisluvuilla.',
          task.tenths ? ' Rajaa lisäksi kahdella peräkkäisellä kymmenesosalla.' : ''));
        break;
      case 'paired':
        givens.append(h('p', { style: 'margin:0' }, strong(`${rootSign(task.exactRadicand)} ja ${rootSign(task.radicand)}`),
          task.view === 'repair' ? ' · Luonnoksessa molemmat sivut on merkitty tarkaksi kokonaisluvuksi. Korjaa lappu.' : ' · Kirjaa toinen tarkasti ja toinen rajaten.',
          task.tenths ? ' Rajaa myös kymmenesosilla.' : ''));
        if (task.view === 'garden') {
          const scale = 34 / Math.sqrt(Math.max(task.exactRadicand, task.radicand));
          givens.append(h('div', { style: row }, ...[task.exactRadicand, task.radicand].map(n => {
            const side = Math.sqrt(n) * scale;
            return h('div', { style: 'width:120px' }, art(`Neliön ala ${n}`, 100, 44, rect(11, 37 - side, side, side, '#a5c3ac'), caption(49, 26, String(n), 13)));
          })));
        }
        break;
      case 'operation':
        givens.append(h('p', { style: 'margin:0;font-size:21px' }, strong(`${radicalTerm(task.left, task.radicand)} ${task.operation} ${radicalTerm(task.right, task.rightRadicand)}`)));
        break;
      case 'classify':
        givens.append(txt('Luokittele annetun esityksen perusteella. Kolme pistettä voivat tarkoittaa pelkkää näytettyä katkelmaa.'));
        break;
      case 'line':
        if (task.overview) givens.append(txt('Siirrä merkkejä alemmalla, suurennetulla asteikolla. Samat kohdat näkyvät myös ylemmällä kartalla.'));
        givens.append(h('div', { style: row }, ...task.markers.map(marker => txt(`${marker.id} · ${marker.label}: ${markerFact(marker)}.`))));
        break;
      case 'exact-approx':
        givens.append(h('p', { style: row }, strong(`Tarkka arvo: ${task.source.kind === 'ratio' ? task.source.value : rootSign(task.source.radicand)}`),
          strong(`Mittarin näyttö: ${task.report}`)),
        txt(`Mittari pyöristää ${task.places} desimaaliin. Puolivälissä se pyöristää nollasta poispäin. Kirjoita mahdollisten alkuperäisten arvojen kaksi rajakohtaa.`));
        break;
      case 'round':
        givens.append(h('p', { style: 'margin:0' }, strong(`${task.value} ${task.unit}`)),
          txt(task.goal === 'pieces' ? 'Yksi osa on 1 m. Tilaa pienin määrä kokonaisia osia, joka riittää.'
            : task.goal === 'significant' ? `Kirjaa ${task.figures} merkitsevää numeroa. Laske ensimmäisestä nollasta poikkeavasta numerosta.`
              : `Kirjaa ${task.places} desimaalia. Puolivälissä pyöristä nollasta poispäin.`),
          txt('Anna viereiset asteikkokohdat, joista alempi on enintään alkuperäinen luku ja ylempi sitä suurempi.'));
        break;
    }
    host.replaceChildren(givens);
  };
}

export function mountRootWorkshop(task: RootWorkshopTask, host: HTMLElement, submit: (response: RootWorkshopResponse) => void): { reveal(): void } {
  const mount = <M extends RootWorkshopTask['mode']>(board: Board<M>) => {
    const done = h('button', { type: 'submit', class: 'btn primary wide' }, 'Tarkista mittalappu');
    const form = h('form', { 'data-root-workbench': task.mode, style: stack }, board.node, done);
    let locked = false;
    function lock() {
      locked = true;
      for (const control of form.querySelectorAll('input,select,button')) control.setAttribute('disabled', '');
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (locked) return;
      const answer = board.read(); lock(); submit(answer);
    });
    host.append(form);
    return { reveal() { board.show(solutionRootWorkshop(task) as Response<M>); lock(); } };
  };
  switch (task.mode) {
    case 'principal':
    case 'exact': return mount<'principal' | 'exact'>(principal(task));
    case 'estimate': return mount<'estimate'>(estimate(task));
    case 'paired': return mount<'paired'>(paired(task));
    case 'operation': return mount<'operation'>(operation(task));
    case 'classify': return mount<'classify'>(classify(task));
    case 'line': return mount<'line'>(place(task));
    case 'exact-approx': return mount<'exact-approx'>(exactApprox(task));
    case 'round': return mount<'round'>(round(task));
  }
}

export function rootWorkshopExample(task: RootWorkshopTask): Paint {
  return host => {
    const givens = h('div'), work = h('div');
    rootWorkshopBoard(task)(givens); mountRootWorkshop(task, work, () => {}).reveal();
    work.querySelector('button[type="submit"]')?.remove(); host.replaceChildren(givens, work);
  };
}
