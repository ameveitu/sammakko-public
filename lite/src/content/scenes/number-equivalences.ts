import type { Paint } from '../../engine/types';
import { h } from '../../ui/dom';
import { equivalenceNumber, placeText, solutionNumberEquivalences, type Magnitude, type NumberEquivalencesResponse,
  type NumberEquivalencesTask, type NumberSide, type Operation, type PlaceRow, type ProportionPair, type ProportionWork } from '../models/number-equivalences';

type Mode = NumberEquivalencesTask['mode'];
type Task<M extends Mode> = Extract<NumberEquivalencesTask, { mode: M }>;
type Answer<M extends Mode> = Extract<NumberEquivalencesResponse, { mode: M }>;
type Work<M extends Mode> = { node: HTMLElement; read(): Answer<M>; show(answer: Answer<M>): void; ready?(): boolean };
const kind = 'number-equivalences' as const;
const stack = 'display:grid;gap:4px';
const row = 'display:flex;align-items:center;flex-wrap:wrap;gap:4px 7px';
const panel = `${stack};background:#eef4e8;border:1px solid #9db7a9;border-radius:11px;padding:5px 7px`;
const field = 'box-sizing:border-box;min-height:44px;min-width:44px;max-width:100%;border:1px solid #779789;border-radius:8px;background:#fffdf4;color:#164238;font:inherit;padding:4px 5px';
const attr = (id: string) => `data-equiv-${id}`;
const print = (n: number) => String(n).replace('-', '−');
const note = (text: string) => h('p', { style: 'margin:0;font-size:14px;line-height:1.23;color:#2a564b' }, text);
const button = (text: string, run: () => void) => h('button', { type: 'button', class: 'btn small',
  style: 'min-height:44px;min-width:44px', onclick: run }, text);
function number(accessible: string, label = accessible, width = 70, allowX = false) {
  const control = h('input', { type: 'text', 'aria-label': accessible, autocomplete: 'off', style: `${field};width:${width}px;text-align:center` });
  return { control, node: h('label', { style: row }, label, control), get: () => {
    const text = control.value.trim();
    return allowX && text.toLowerCase() === 'x' ? 'x' : equivalenceNumber(text) ? text : '';
  }, set: (text: string) => { control.value = text; } };
}
function pick<T extends string>(accessible: string, options: readonly (readonly [T, string])[], label = accessible) {
  const control = h('select', { 'aria-label': accessible, style: field }, h('option', { value: '' }, '—'),
    ...options.map(([value, text]) => h('option', { value }, text)));
  return { control, node: h('label', { style: row }, label, control), get: () => (control.value || null) as T | null,
    set: (value: T | null) => { control.value = value ?? ''; } };
}
const valueOf = (input: string) => {
  const q = equivalenceNumber(input);
  return q ? Number(q[0]) / Number(q[1]) : NaN;
};
const choices = [['yes', 'Kyllä'], ['no', 'Ei']] as const;
const axes = [['left', 'Vasemmalla'], ['right', 'Oikealla'], ['zero', 'Nollassa']] as const;
const signs = [['add', '+'], ['sub', '−']] as const;
const ns = 'http://www.w3.org/2000/svg';
function svg<K extends keyof SVGElementTagNameMap>(tag: K, attributes: Record<string, string | number>) {
  const el = document.createElementNS(ns, tag);
  for (const [key, value] of Object.entries(attributes)) el.setAttribute(key, String(value));
  return el;
}
function svgLabel(x: number, y: number, label: string, size = 15, paint = '#214d43') {
  const el = svg('text', { x, y, 'text-anchor': 'middle', 'font-weight': 680, 'font-size': size, fill: paint });
  el.textContent = label; return el;
}
const mark = (x: number, y: number, fill: string, r = 5) => svg('circle', { cx: x, cy: y, r, fill, stroke: '#25463f', 'stroke-width': 1.4 });

function line(task: Task<'line'>): Work<'line'> {
  const absolute = task.skill === 'absolute';
  const location = number('Merkityn paikan luku', 'Paikka'), distance = number('Etäisyys nollasta', 'Etäisyys');
  const positions = [number('Saman etäisyyden paikka 1', 'Paikka 1'), number('Saman etäisyyden paikka 2', 'Paikka 2')];
  const opposite = number('Vastaluvun paikka', 'Vastaluku'), side = pick<NumberSide>('Vastaluvun puoli', axes, 'Puoli'), sum = number('Paikkalukujen summa', 'Summa');
  const audit = task.draft === undefined ? null : pick('Onko ehdotus vastaluku?', choices, `Onko ${print(task.draft)} vastaluku?`);
  const plot = svg('svg', { viewBox: '0 0 420 94', role: 'img', 'aria-label': 'Lukusuora, jossa nolla ja tasaväliset mittapisteet',
    style: 'display:block;width:100%;max-height:105px;background:#fffbed;border-radius:8px;touch-action:pan-y' });
  const toX = (n: number) => 22 + (n + task.extent) * 376 / (2 * task.extent);
  const left = 22, right = 398, baseline = task.reference ? 51 : 55;
  function redraw() {
    plot.replaceChildren(svg('line', { x1: left, x2: right, y1: baseline, y2: baseline, stroke: '#28574c', 'stroke-width': 2.5 }));
    for (let n = -task.extent; n <= task.extent; n += task.step) {
      const x = toX(n);
      plot.append(svg('line', { x1: x, x2: x, y1: baseline - 5, y2: baseline + 6, stroke: '#28574c', 'stroke-width': n === 0 ? 3 : 1.5 }),
        svgLabel(x, baseline + 23, print(n), 15));
      if (task.reference) plot.append(svgLabel(x, 22, print(task.reference + n), 13, '#744d2e'));
    }
    if (task.focus !== undefined) {
      const x = toX(task.focus);
      plot.append(svg('path', { d: `M ${x - 7} ${baseline - 17} h 14 l -7 12 Z`, fill: '#d59a46', stroke: '#714719', 'stroke-width': 1.4,
        [attr('focus')]: '' }));
    }
    if (task.draft !== undefined) plot.append(mark(toX(task.draft), baseline + 1, '#f3c5a0', 6));
    const outputs = absolute ? positions : [opposite];
    for (const control of outputs) {
      const value = valueOf(control.get());
      if (value >= -task.extent && value <= task.extent) {
        plot.append(svg('line', { x1: toX(0), x2: toX(value), y1: baseline - 9, y2: baseline - 9,
          stroke: '#337e6d', 'stroke-width': 2, 'stroke-dasharray': '4 3' }), mark(toX(value), baseline, '#99c7a9'));
      }
    }
  }
  const pointAt = (event: PointerEvent) => {
    const matrix = plot.getScreenCTM();
    if (!matrix) return;
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    if (p.x < left - 10 || p.x > right + 10 || p.y < baseline - 23 || p.y > baseline + 23) return;
    return Math.max(-task.extent, Math.min(task.extent, Math.round((p.x - toX(0)) * 2 * task.extent / (376 * task.step)) * task.step));
  };
  let pointer: number | undefined;
  const frozen = () => distance.control.disabled;
  plot.addEventListener('pointerdown', event => {
    if (frozen()) return;
    const value = pointAt(event);
    if (value === undefined) return;
    pointer = event.pointerId; plot.setPointerCapture(event.pointerId);
    if (!absolute) { opposite.set(String(value)); redraw(); }
  });
  plot.addEventListener('pointermove', event => {
    if (pointer !== event.pointerId || absolute || frozen()) return;
    const value = pointAt(event);
    if (value !== undefined) { opposite.set(String(value)); redraw(); }
  });
  plot.addEventListener('pointerup', event => {
    if (pointer !== event.pointerId) return;
    pointer = undefined;
    const value = pointAt(event);
    if (!absolute || value === undefined || frozen()) return;
    const key = String(value);
    const current = positions.map(p => p.get());
    if (current.some(v => valueOf(v) === value)) positions[current.findIndex(v => valueOf(v) === value)]!.set('');
    else (positions.find(p => !p.get()) ?? positions[1]!).set(key);
    redraw();
  });
  plot.addEventListener('pointercancel', () => { pointer = undefined; });
  for (const entry of [...positions, opposite]) entry.control.addEventListener('input', redraw);
  redraw();
  const heading = task.reference ? note(`Yllä mittarin lukema ${task.unit}, alla poikkeama. Vertailunolla on lukema ${task.reference} ${task.unit}.`)
    : note(`Lukuväli ${task.step}. ${task.focus === undefined ? '' : 'Kolmio merkitsee annettua paikkaa. '}${absolute
      ? 'Valitse paikat napauttamalla tai kirjoittamalla.' : 'Napauta, vedä peilimerkkiä tai kirjoita luvut.'}`);
  return {
    node: h('div', { style: panel }, heading, task.distanceGiven === undefined ? null : note(`Annettu etäisyys ${task.distanceGiven}.`), plot,
      h('div', { style: row }, task.focus === undefined ? null : location.node, distance.node),
      h('div', { style: row }, ...(absolute ? positions.map(p => p.node) : [opposite.node, side.node, sum.node])), audit?.node),
    read: () => ({ kind, mode: 'line', location: location.get(), distance: distance.get(),
      positions: absolute ? positions.map(p => p.get()).filter(Boolean) : [], opposite: opposite.get(), side: side.get(), sum: sum.get(),
      draftWorks: audit?.get() === 'yes' ? true : audit?.get() === 'no' ? false : null }),
    show(a) { location.set(a.location); distance.set(a.distance); positions.forEach((p, i) => p.set(a.positions[i] ?? ''));
      opposite.set(a.opposite); side.set(a.side); sum.set(a.sum); audit?.set(a.draftWorks === null ? null : a.draftWorks ? 'yes' : 'no'); redraw(); },
  };
}

function place(task: Task<'place'>): Work<'place'> {
  const dual = task.goal === 'both';
  const lo = number('Arvion alempi kokonaisluku', 'Alaraja', 60), hi = number('Arvion ylempi kokonaisluku', 'Yläraja', 60);
  const titles = ['Kokon.', 'Kymmen.', 'Sadas.', 'Tuhannes.'].slice(0, task.precision + 1);
  const preciseTitles = ['kokonaiset', 'kymmenesosat', 'sadasosat', 'tuhannesosat'];
  const columns = `display:grid;grid-template-columns:minmax(65px,.9fr) repeat(${titles.length},minmax(44px,1fr));align-items:center;gap:4px`;
  let locked = !dual, active = 0;
  const tabBar = h('div', { style: row });
  const boards = task.changes.map((event, index) => {
    const prefix = `Vaihe ${index + 1}`;
    const operation = pick<Operation>(`${prefix}, laskutoimitus`, signs, 'Toimitus');
    const left = titles.map((_, i) => number(`${prefix}, ensimmäinen luku, ${preciseTitles[i]}`, '', 54));
    const right = titles.map((_, i) => number(`${prefix}, toinen luku, ${preciseTitles[i]}`, '', 54));
    const moves = titles.slice(1).map((_, i) => number(`${prefix}, siirto sarakkeesta ${preciseTitles[i + 1]}`, '', 54));
    const result = number(`${prefix}, tulos`, `Tulos (${task.unit})`, 78);
    const inverse = number(`${prefix}, tarkistussumma`, 'Tulos + vähennetty', 78);
    const header = h('p', { style: 'margin:0;color:#244f44;font-size:14px' });
    const updateOperation = () => { inverse.node.style.display = operation.get() === 'sub' ? 'flex' : 'none'; };
    operation.control.addEventListener('change', updateOperation); updateOperation();
    const grid = h('div', { style: stack },
      h('div', { style: columns }, note('Paikka'), ...titles.map(t => note(t))),
      h('div', { style: columns }, note('1. luku'), ...left.map(f => f.control)),
      h('div', { style: columns }, note('2. luku'), ...right.map(f => f.control)),
      h('div', { style: columns }, note('Siirto 0/1'), h('span', { 'aria-hidden': 'true' }, '—'), ...moves.map(f => f.control)));
    const node = h('div', { style: stack, [attr('place-row')]: index + 1 }, header,
      h('div', { style: row }, operation.node, note('Siirto 1 = kanto ← tai laina →.')),
      grid, h('div', { style: row }, result.node, inverse.node));
    const read = (): PlaceRow => ({ operation: operation.get(), left: left.map(f => f.get()), right: right.map(f => f.get()),
      moves: moves.map(f => f.get()), result: result.get(), inverse: inverse.get() });
    return { node, read, header, event, result, set(a: PlaceRow) {
      operation.set(a.operation); left.forEach((f, i) => f.set(a.left[i]!)); right.forEach((f, i) => f.set(a.right[i]!));
      moves.forEach((f, i) => f.set(a.moves[i]!)); result.set(a.result); inverse.set(a.inverse); updateOperation();
    } };
  });
  const tabs = boards.map((_, i) => button(`Laskuvaihe ${i + 1}`, () => { active = i; draw(); }));
  const estimateReadback = h('output', { [attr('locked-estimate')]: '', style: 'font-size:14px;color:#2a564b' });
  tabBar.append(...tabs, estimateReadback);
  const lock = button('Lukitse suuruusarvio', () => { if (!lo.get() || !hi.get()) return; locked = true; draw(); });
  const estimateEntry = h('div', { style: stack }, note('Anna peräkkäiset kokonaislukurajat. Tasakokonaiselle käytä samaa rajaa kahdesti.'),
    h('div', { style: row }, lo.node, hi.node, lock));
  function draw() {
    lo.control.disabled = hi.control.disabled = locked;
    estimateEntry.style.display = locked ? 'none' : 'grid';
    estimateReadback.value = `Arvio ${lo.get()}–${hi.get()} ${task.unit}`;
    tabBar.style.display = locked && dual ? 'flex' : 'none';
    boards.forEach((b, i) => {
      b.node.style.display = locked && i === active ? 'grid' : 'none';
      const start = i ? boards[i - 1]!.result.get() || 'täydennä edellisen vaiheen tulos' : placeText(task.start, task.precision, task.startShort);
      b.header.textContent = `Lähtö ${start} · ${b.event.name} ${placeText(b.event.amount, task.precision, b.event.short)} ${task.unit}.`;
      tabs[i]!.setAttribute('aria-pressed', String(i === active));
    });
  }
  for (const b of boards) b.result.control.addEventListener('input', draw);
  draw();
  return {
    node: h('div', { style: panel },
      task.allowNegative ? note('Jos muutos on negatiivinen, näytä erotuksen suuruus taulussa suurempi ensin. Merkitse tulokseen miinus.') : null,
      dual ? estimateEntry : null, tabBar, ...boards.map(b => b.node)),
    ready: () => locked,
    read: () => ({ kind, mode: 'place', rows: boards.map(b => b.read()), estimate: { lower: lo.get(), upper: hi.get(), locked: dual && locked } }),
    show(a) { lo.set(a.estimate.lower); hi.set(a.estimate.upper); a.rows.forEach((value, i) => boards[i]!.set(value)); locked = true; draw(); },
  };
}

const magnitudes = [['smaller', 'Pienempi'], ['same', 'Yhtä suuri'], ['larger', 'Suurempi']] as const;
function multiply(task: Task<'multiply'>): Work<'multiply'> {
  const leftUnit = task.contextType === 'area' ? 'm' : 'km/h', rightUnit = task.contextType === 'area' ? 'm' : 'h';
  const [leftPlaces, rightPlaces] = task.places;
  const leftDivisor = 10 ** leftPlaces, rightDivisor = 10 ** rightPlaces;
  const left = number('Ensimmäisen kertoimen osat', `Osia 1/${leftDivisor}`, 64), right = number('Toisen kertoimen osat', `Osia 1/${rightDivisor}`, 64);
  const product = number('Osamäärien kokonaislukutulo', 'Osien tulo', 74), divisor = number('Kokonaisen jakaja', 'Jakaja', 74);
  const result = number('Kertolaskun tulos', 'Tulos', 76);
  const unit = pick('Tuloksen yksikkö', [['m²', 'm²'], ['m', 'm'], ['km', 'km'], ['km/h', 'km/h']], 'Yksikkö');
  const prediction = pick<Magnitude>('Suuruusennuste', magnitudes, 'Ennuste');
  const plot = svg('svg', { viewBox: '0 0 258 134', role: 'img', 'aria-label': 'Mittakertoimien suorakulmioruudukko',
    style: 'display:block;width:100%;max-height:136px;border-radius:8px;background:#fffbed' });
  let locked = false;
  const lock = button('Lukitse suuruusennuste', () => {
    if (!prediction.get()) return;
    locked = true; draw(); left.control.focus();
  });
  const work = h('div', { style: stack, [attr('multiply-work')]: '' },
    h('div', { style: row }, left.node, right.node, product.node), h('div', { style: row }, divisor.node, result.node, unit.node));
  const bounds = task.contextType === 'area'
    ? 'Vertaa saman levyiseen palaan, jonka korkeus on 1 m.'
    : 'Vertaa samalla nopeudella täsmälleen tunnissa kuljettuun matkaan.';
  function drawArea() {
    const widths = Math.max(1, Math.ceil(task.right / rightDivisor)), heights = Math.max(1, Math.ceil(task.left / leftDivisor));
    const cell = Math.min(196 / widths, 90 / heights), x = (258 - widths * cell) / 2, y = 112 - heights * cell;
    const markY = 112 - task.left * cell / leftDivisor, markX = x + task.right * cell / rightDivisor;
    plot.replaceChildren();
    if (locked) plot.append(svg('rect', { x, y: markY, width: markX - x, height: 112 - markY, fill: '#e3b872',
      [attr('product-area')]: '' }));
    for (let i = 0; i <= widths * rightDivisor; i++) {
      const tx = x + i * cell / rightDivisor, major = i % rightDivisor === 0;
      plot.append(svg('line', { x1: tx, x2: tx, y1: y, y2: 112, stroke: major ? '#4f7568' : '#acc8b6',
        'stroke-opacity': major ? .9 : .6, 'stroke-width': major ? 1.6 : .5 }));
      if (major) plot.append(svgLabel(tx, 129, String(i / rightDivisor), 13));
    }
    for (let i = 0; i <= heights * leftDivisor; i++) {
      const ty = 112 - i * cell / leftDivisor, major = i % leftDivisor === 0;
      plot.append(svg('line', { x1: x, x2: x + widths * cell, y1: ty, y2: ty, stroke: major ? '#4f7568' : '#acc8b6',
        'stroke-opacity': major ? .9 : .6, 'stroke-width': major ? 1.6 : .5 }));
      if (major) plot.append(svgLabel(x - 11, ty + 3, String(i / leftDivisor), 13));
    }
    plot.append(svg('line', { x1: x, x2: markX, y1: 112, y2: 112, stroke: '#926233', 'stroke-width': 3 }),
      svg('line', { x1: x, x2: x, y1: 112, y2: markY, stroke: '#926233', 'stroke-width': 3 }));
  }
  function draw() {
    if (task.contextType === 'area') drawArea();
    prediction.control.disabled = locked; lock.style.display = locked ? 'none' : '';
    work.style.display = locked ? 'grid' : 'none';
  }
  draw();
  const givens = h('div', { style: stack, [attr('factors')]: '' },
    note(`${task.contextType === 'area' ? 'Leveys' : 'Nopeus'} ${placeText(task.left, leftPlaces)} ${leftUnit}.`),
    note(`${task.contextType === 'area' ? 'Korkeus' : 'Aika'} ${placeText(task.right, rightPlaces)} ${rightUnit}.`), note(bounds));
  return {
    node: h('div', { style: panel }, task.contextType === 'area'
      ? h('div', { style: 'display:grid;grid-template-columns:minmax(153px,1.2fr) minmax(0,1fr);align-items:start;gap:7px' }, plot, givens) : givens,
      h('div', { style: row }, prediction.node, lock), work),
    ready: () => locked,
    read: () => ({ kind, mode: 'multiply', prediction: prediction.get(), locked, left: left.get(), right: right.get(), product: product.get(),
      divisor: divisor.get(), result: result.get(), unit: unit.get() ?? '' }),
    show(a) { prediction.set(a.prediction); locked = a.locked; left.set(a.left); right.set(a.right); product.set(a.product);
      divisor.set(a.divisor); result.set(a.result); unit.set(a.unit as 'm²' | 'm' | 'km' | 'km/h'); draw(); },
  };
}

function proportion(task: Task<'proportion'>): Work<'proportion'> {
  const selectMethod = task.method === 'either' ? pick('Ratkaisumenetelmä', [['scale', 'Skaalaus'], ['algebra', 'Yhtälö']], 'Menetelmä') : undefined;
  const names = ['Vasen', 'Oikea'] as const;
  const fractions = names.map((name) => {
    const top = number(`${name} suhde, osoittaja`, '', 71, true), bottom = number(`${name} suhde, nimittäjä`, '', 71, true);
    return { top, bottom, node: h('div', { style: 'display:grid;justify-items:center;gap:2px' }, note(name), top.control,
      h('span', { style: 'display:block;width:73px;height:2px;background:#63877a', 'aria-hidden': 'true' }), bottom.control),
      get: (): ProportionPair => [top.get(), bottom.get()], set([a, b]: ProportionPair) { top.set(a); bottom.set(b); } };
  });
  const direction = pick('Skaalauksen suunta', [['forward', `${task.modelNames[0]} → ${task.modelNames[1]}`],
    ['backward', `${task.modelNames[1]} → ${task.modelNames[0]}`]], 'Suunta');
  const factor = number('Skaalauskerroin', 'Kerroin', 68);
  const coefficient = number('Yhtälörivin x-kerroin', '', 69), constant = number('Yhtälörivin oikea puoli', '', 74);
  const unknown = number('Puuttuva mitta', `x (${task.unit})`, 78);
  const left = number('Vasemman suhteen tarkistusarvo', 'Vasen', 69), right = number('Oikean suhteen tarkistusarvo', 'Oikea', 69);
  const scale = h('div', { style: row }, direction.node, factor.node);
  const algebra = h('div', { style: row }, 'Yhtälö', coefficient.control, '· x =', constant.control);
  const chosen = () => selectMethod?.get() ?? (task.method === 'either' ? null : task.method);
  function draw() {
    scale.style.display = chosen() === 'scale' ? 'flex' : 'none';
    algebra.style.display = chosen() === 'algebra' ? 'flex' : 'none';
  }
  selectMethod?.control.addEventListener('change', draw); draw();
  const table = h('table', { [attr('ratio-table')]: '', style: 'border-collapse:collapse;text-align:center;width:100%;font-size:14px' },
    h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, task.unit), ...task.modelNames.map(v => h('th', { scope: 'col' }, v)))),
    h('tbody', {}, ...task.measureNames.map((label, i) => h('tr', {}, h('th', { scope: 'row' }, label),
      ...task.pairs.map(values => h('td', { style: 'padding:3px 4px' }, values[i]))))));
  return {
    node: h('div', { style: panel },
      h('div', { style: 'display:grid;grid-template-columns:minmax(165px,1fr) minmax(170px,1fr);align-items:start;gap:6px' },
        table, h('div', { style: row }, fractions[0]!.node, '=', fractions[1]!.node)),
      note('Kirjoita suhteisiin vastaavat mitat. Kirjoita puuttuvaan kohtaan x. Mitat ja nimittäjät ovat positiivisia.'),
      selectMethod?.node, scale, algebra,
      h('div', { style: row }, unknown.node, note('Tarkista sijoittamalla x suhteisiin.'), left.node, right.node)),
    read() {
      const method = chosen();
      const work: ProportionWork | null = method === 'scale' ? { method, direction: direction.get(), factor: factor.get() }
        : method === 'algebra' ? { method, coefficient: coefficient.get(), constant: constant.get() } : null;
      return { kind, mode: 'proportion', relation: [fractions[0]!.get(), fractions[1]!.get()], work, unknown: unknown.get(),
        leftCheck: left.get(), rightCheck: right.get() };
    },
    show(a) {
      a.relation.forEach((v, i) => fractions[i]!.set(v));
      selectMethod?.set(a.work?.method ?? null);
      if (a.work?.method === 'scale') { direction.set(a.work.direction); factor.set(a.work.factor); }
      if (a.work?.method === 'algebra') { coefficient.set(a.work.coefficient); constant.set(a.work.constant); }
      unknown.set(a.unknown); left.set(a.leftCheck); right.set(a.rightCheck); draw();
    },
  };
}

export function numberEquivalencesBoard(task: NumberEquivalencesTask): Paint {
  return host => {
    const title = h('div', { [attr('givens')]: '', style: stack }, note(task.setting));
    if (task.mode === 'place') {
      const timeline = h('div', { [attr('timeline')]: '', style: row },
        h('strong', {}, `Alku ${placeText(task.start, task.precision, task.startShort)} ${task.unit}`),
        ...task.changes.map((event, i) => h('span', {}, `${i + 1}. ${event.name} ${placeText(event.amount, task.precision, event.short)} ${task.unit}`)));
      title.append(timeline);
    }
    host.replaceChildren(title);
  };
}
export function mountNumberEquivalences(task: NumberEquivalencesTask, host: HTMLElement, submit: (answer: NumberEquivalencesResponse) => void): { reveal(): void } {
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
    return { reveal() { work.show(solutionNumberEquivalences(task) as Answer<M>); freeze(); } };
  }
  switch (task.mode) {
    case 'line': return mount(line(task));
    case 'place': return mount(place(task));
    case 'multiply': return mount(multiply(task));
    case 'proportion': return mount(proportion(task));
  }
}
export function numberEquivalencesExample(task: NumberEquivalencesTask): Paint {
  return host => {
    const givens = h('div'), work = h('div');
    numberEquivalencesBoard(task)(givens);
    mountNumberEquivalences(task, work, () => {}).reveal();
    work.querySelector('[data-equiv-submit]')?.remove();
    if (task.mode === 'place' && task.goal === 'both')
      for (const board of work.querySelectorAll<HTMLElement>('[data-equiv-place-row]')) board.style.display = 'grid';
    host.replaceChildren(givens, work);
  };
}
