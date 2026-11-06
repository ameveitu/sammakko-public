import type { Paint } from '../../engine/types';
import { h } from '../../ui/dom';
import { parseMeasure } from '../models/spatial-measures';
import { mountObservedExplanation } from './observed-explanations';
import { checkHarborActivity, harborExplanation, harborPairs, harborVisit, methodNames, pointId, runHarborExperiment,
  solutionStatisticsHarbor, variableNames, type ChartDraft, type HarborChartType, type HarborRow, type HarborSpace,
  type StatisticsHarborResponse, type StatisticsHarborTask, type Variable } from '../models/statistics-harbor';

const stack = 'display:grid;gap:5px';
const row = 'display:flex;flex-wrap:wrap;align-items:center;gap:5px 8px';
const panel = `${stack};background:#edf4e9;border:1px solid #a2bdb0;border-radius:9px;padding:6px 8px`;
const field = 'box-sizing:border-box;min-height:44px;min-width:0;max-width:100%;border:1px solid #80a18f;border-radius:8px;padding:4px 6px;background:#fffdf5;color:#163d36;font:inherit';
const muted = 'margin:0;color:#395e52;font-size:14px';
const kind = 'statistics-harbor' as const;
const text = (value: string) => h('p', { style: 'margin:0' }, value);
const note = (value: string) => h('p', { style: muted }, value);
const bold = (value: string) => h('strong', {}, value);
const action = (label: string, run: () => void, caption = label) => h('button', { type: 'button', class: 'btn small',
  'aria-label': label, style: 'min-width:44px;min-height:44px', onclick: run }, caption);

function input(label: string, caption = label, width = 75) {
  const fieldEl = h('input', { type: 'text', inputmode: 'decimal', 'aria-label': label, style: `${field};width:${width}px;text-align:center` });
  return { field: fieldEl, node: h('label', { style: row }, caption, fieldEl), get: () => fieldEl.value,
    set: (value: string) => { fieldEl.value = value; } };
}
function pick<T extends string>(label: string, options: readonly (readonly [T, string])[], caption = label, placeholder = 'Valitse') {
  const fieldEl = h('select', { 'aria-label': label, style: field }, h('option', { value: '' }, placeholder),
    ...options.map(([id, name]) => h('option', { value: id }, name)));
  return { field: fieldEl, node: h('label', { style: row }, caption, fieldEl), get: () => (fieldEl.value || null) as T | null,
    set: (value: T | null) => { fieldEl.value = value ?? ''; } };
}
function optionPairs<T extends string>(map: Record<T, string>): [T, string][] {
  return Object.entries(map) as [T, string][];
}
const choices = (values: readonly string[]) => values.map(value => [value, value] as const);
const variables = optionPairs(variableNames);
const methods = optionPairs(methodNames);
const compare = [['a', 'A'], ['b', 'B'], ['equal', 'Yhtä suuret']] as const;
const tiny = (value: string) => h('span', { style: 'display:inline-block;padding:2px 5px;border:1px solid #b2c9b9;border-radius:6px;background:#fbfcf0' }, value);
const live = () => h('p', { role: 'status', style: muted });

function toggles(ids: readonly string[], display: (id: string) => string = id => id) {
  const checks = new Map<string, HTMLInputElement>();
  const node = h('div', { style: row });
  for (const id of ids) {
    const check = h('input', { type: 'checkbox', 'aria-label': display(id), style: 'margin:0' });
    checks.set(id, check);
    node.append(h('label', { style: 'display:inline-flex;align-items:center;gap:4px;min-height:44px;min-width:44px;padding:0 2px' }, check, display(id)));
  }
  return { node, get: () => ids.filter(id => checks.get(id)!.checked),
    set: (value: readonly string[]) => checks.forEach((check, id) => { check.checked = value.includes(id); }) };
}
function entries(ids: readonly string[], caption: (id: string) => string, label = caption) {
  const fields = ids.map(id => ({ id, entry: input(label(id), caption(id), 63) }));
  return { fields, node: h('div', { style: row }, ...fields.map(({ entry }) => entry.node)),
    get: () => Object.fromEntries(fields.map(({ id, entry }) => [id, entry.get()])),
    set: (values: Record<string, string>) => fields.forEach(({ id, entry }) => entry.set(values[id] ?? '')) };
}

type Mode = StatisticsHarborTask['mode'];
type Task<M extends Mode> = Extract<StatisticsHarborTask, { mode: M }>;
type Answer<M extends Mode> = Extract<StatisticsHarborResponse, { mode: M }>;
type Work<M extends Mode> = { node: HTMLElement; read(): Answer<M>; show(answer: Answer<M>): void; ready?(): boolean; review?(): HTMLElement };

function collection(task: Task<'collect'>, change?: (response: StatisticsHarborResponse) => void): Work<'collect'> {
  const variable = pick('Tutkimuksen muuttuja', variables, 'Muuttuja');
  const method = pick('Havaintomenetelmä', methods, 'Menetelmä');
  const status = live();
  let planned: string[] = [], visits: Record<string, string> = {}, locked = false;
  const controls = new Map<string, HTMLButtonElement>();
  function read(): Answer<'collect'> {
    return { kind, mode: 'collect', variable: variable.get(), method: method.get() ?? '', plan: [...planned], visits: { ...visits } };
  }
  function click(id: string) {
    if (!locked) {
      if (planned.includes(id)) planned = planned.filter(point => point !== id);
      else if (planned.length < task.budget) planned = [...planned, id];
    } else {
      const chosen = variable.get();
      if (chosen && planned.includes(id) && !Object.hasOwn(visits, id)) {
        const value = harborVisit(task, id, chosen);
        if (value !== undefined) visits = { ...visits, [id]: value };
      }
    }
    draw(); change?.(read());
  }
  const lock = action('Lukitse keruusuunnitelma', () => {
    locked = true; draw(); controls.get(planned[0] ?? '')?.focus(); change?.(read());
  });
  const map = h('table', { 'data-harbor-collection': '', style: 'width:100%;table-layout:fixed;border-collapse:collapse;font-size:13px' },
    h('thead', {}, h('tr', {}, h('th', { scope: 'col', style: 'width:29%' }, 'Paikka'),
      ...task.times.map(time => h('th', { scope: 'col' }, time.label)))));
  map.append(h('tbody', {}, ...task.sites.map(site => h('tr', {},
    h('th', { scope: 'row', style: 'text-align:left' }, `${site.id} · ${site.label}`),
    ...task.times.map(time => {
      const id = pointId(site.id, time.id);
      const control = action(`${site.label} · ${time.label}`, () => click(id), 'Valitse');
      control.dataset.harborPoint = id;
      control.dataset.harborName = `${site.label} · ${time.label}`;
      control.style.width = '100%'; control.style.paddingInline = '2px';
      controls.set(id, control);
      return h('td', { style: 'padding:1px' }, control);
    })))));
  function draw() {
    lock.disabled = locked || planned.length !== task.budget || !variable.get() || !method.get();
    variable.field.disabled = locked; method.field.disabled = locked;
    for (const [id, button] of controls) {
      const selected = planned.includes(id), observed = Object.hasOwn(visits, id);
      button.textContent = observed ? visits[id]! : locked && selected ? 'Käy' : selected ? 'Valittu' : '–';
      button.disabled = locked ? (!selected || observed) : (!selected && planned.length >= task.budget);
      button.dataset.harborState = observed ? 'observed' : selected ? 'planned' : 'open';
      button.style.opacity = observed ? '1' : '';
      button.style.color = observed ? '#173f34' : '';
      button.style.backgroundColor = observed ? '#dcebdd' : '';
      button.setAttribute('aria-pressed', String(selected));
      button.setAttribute('aria-label', observed ? `${button.dataset.harborName} · havainto ${visits[id]}` : button.dataset.harborName!);
    }
    status.textContent = locked ? `Kerätty ${Object.keys(visits).length} / ${task.budget} havaintoa.`
      : `Suunniteltu ${planned.length} / ${task.budget} käyntiä.`;
  }
  variable.field.addEventListener('change', draw); method.field.addEventListener('change', draw);
  draw();
  return { node: h('div', { style: panel }, h('div', { style: row }, variable.node, method.node), map, h('div', { style: row }, lock, status)),
    read, ready: () => locked && Object.keys(visits).length === planned.length,
    show(answer) { variable.set(answer.variable); method.set(answer.method as keyof typeof methodNames); planned = [...answer.plan];
      visits = { ...answer.visits }; locked = true; draw(); },
    review: () => h('div', { style: stack }, note(`Menetelmä: ${methodNames[method.get() ?? 'count']}.`),
      h('div', { style: row }, ...task.sites.flatMap(site => task.times.flatMap(time => {
        const id = pointId(site.id, time.id);
        return Object.hasOwn(visits, id) ? [tiny(`${site.label} · ${time.label}: ${visits[id]}`)] : [];
      })))),
  };
}

function structure(task: Task<'structure'>): Work<'structure'> {
  const variable = pick('Taulukon muuttuja', variables, 'Sarake');
  const unit = pick('Taulukon yksikkö', choices(['kpl', '°C', 'cm']), 'Yksikkö');
  const logs = [...new Set(task.slips.map(slip => slip.log))].sort();
  const fields = logs.map(log => ({
    log,
    source: pick(`Rivi ${log}, lappu`, task.slips.map(slip => [slip.id, slip.id]), '', 'Lappu'),
    value: input(`Rivi ${log}, lukema`, '', 61),
    status: pick(`Rivi ${log}, merkintä`, [['reading', 'Mitattu'], ['missing', 'Puuttuu'], ['check', 'Tarkista']] as const, '', 'Merkintä'),
  }));
  const copies = toggles(task.slips.map(slip => slip.id).sort(), id => `Kopio ${id}`);
  const table = h('table', { style: 'width:100%;border-collapse:collapse;font-size:14px' },
    h('thead', {}, h('tr', {}, ...['Tunnus', 'Lappu', 'Lukema', 'Merkintä'].map(name => h('th', { scope: 'col' }, name)))),
    h('tbody', {}, ...fields.map(field => h('tr', { style: 'text-align:center' }, h('th', { scope: 'row' }, field.log),
      h('td', {}, field.source.field), h('td', {}, field.value.field), h('td', {}, field.status.field)))));
  return { node: h('div', { style: panel }, h('div', { style: row }, variable.node, unit.node), table, copies.node),
    read: () => ({ kind, mode: 'structure', variable: variable.get() ?? '', unit: unit.get() ?? '', copies: copies.get(),
      rows: Object.fromEntries(fields.map(({ log, source, value, status }) =>
        [log, { receipt: source.get() ?? '', value: value.get(), condition: status.get() }])) }),
    show(answer) {
      variable.set(answer.variable as Variable); unit.set(answer.unit); copies.set(answer.copies);
      for (const { log, source, value, status } of fields) {
        const entry = answer.rows[log]!;
        source.set(entry.receipt); value.set(entry.value); status.set(entry.condition);
      }
    },
  };
}

function frequencies(task: Task<'freq'>): Work<'freq'> {
  const counts = entries(task.categories, id => id, id => `${id}, frekvenssi`);
  const total = input('Frekvenssien summa');
  return { node: h('div', { style: panel }, counts.node, total.node),
    read: () => ({ kind, mode: 'freq', counts: counts.get(), total: total.get() }),
    show(answer) { counts.set(answer.counts); total.set(answer.total); },
  };
}
function relative(task: Task<'relative'>): Work<'relative'> {
  const groups = task.groups.map((group, i) => ({
    name: `${i ? 'B' : 'A'} · ${group.label}`,
    count: input(`Frekvenssi ${i ? 'B' : 'A'}`, 'Frekvenssi'),
    ratio: input(`Suhteellinen frekvenssi ${i ? 'B' : 'A'}`, task.format === 'percent' ? 'Prosenttiluku %' : 'Murtoluku', 92),
  }));
  const greater = pick('Suurempi suhteellinen frekvenssi', compare, 'Suurempi osuus');
  return { node: h('div', { style: panel }, ...groups.map(group => h('div', { style: row }, bold(group.name), group.count.node, group.ratio.node)), greater.node),
    read: () => ({ kind, mode: 'relative', frequencies: [groups[0]!.count.get(), groups[1]!.count.get()],
      ratios: [groups[0]!.ratio.get(), groups[1]!.ratio.get()], comparison: greater.get() }),
    show(answer) { groups.forEach((group, i) => { group.count.set(answer.frequencies[i]!); group.ratio.set(answer.ratios[i]!); }); greater.set(answer.comparison); },
  };
}
function mean(): Work<'mean'> {
  const count = input('Alkuperäinen havaintomäärä', 'Havaintoja'), sum = input('Alkuperäinen summa', 'Summa');
  const average = input('Alkuperäinen keskiarvo', 'Keskiarvo'), newCount = input('Uusi havaintomäärä', 'Havaintoja'), newAverage = input('Uusi keskiarvo', 'Keskiarvo');
  const change = pick('Keskiarvon muutos', [['rose', 'Nousi'], ['fell', 'Laski'], ['equal', 'Pysyi samana']] as const, 'Muutos');
  const meaning = pick('Keskiarvon tulkinta', [['equal-share', 'Tasattu arvo näissä havainnoissa'],
    ['every', 'Jokaisen alkuperäisen havainnon arvo'], ['forecast', 'Seuraavan havainnon varma arvo']] as const, 'Tulkinta');
  return { node: h('div', { style: panel }, h('div', { style: row }, bold('Aluksi'), count.node, sum.node, average.node),
    h('div', { style: row }, bold('Lisäyksen jälkeen'), newCount.node, newAverage.node), h('div', { style: row }, change.node, meaning.node)),
    read: () => ({ kind, mode: 'mean', count: count.get(), total: sum.get(), mean: average.get(), newCount: newCount.get(), newMean: newAverage.get(),
      change: change.get(), meaning: meaning.get() ?? '' }),
    show(answer) { count.set(answer.count); sum.set(answer.total); average.set(answer.mean); newCount.set(answer.newCount); newAverage.set(answer.newMean);
      change.set(answer.change); meaning.set(answer.meaning as 'equal-share'); },
  };
}
function median(task: Task<'median'>): Work<'median'> {
  let ordered: string[] = [], middle: string[] = [];
  const pool = h('div', { style: row, 'data-harbor-order': 'pool' });
  const lineup = h('div', { style: row, 'data-harbor-order': 'placed' });
  const undo = action('Peru viimeinen havainto', () => { const id = ordered.at(-1); ordered = ordered.slice(0, -1); middle = middle.filter(m => m !== id); draw(); });
  const value = input('Mediaani'), previous = input('Mediaani ennen muutosta');
  const byId = (id: string) => task.rows.find(row => row.id === id)!;
  const sources = new Map(task.rows.map(entry => [entry.id, action(`Aseta havainto ${entry.id}`, () => {
    ordered = [...ordered, entry.id]; draw();
    const next = [...sources.values()].find(control => !control.disabled);
    (next ?? lineup.querySelector('button'))?.focus();
  }, `${entry.id} · ${entry.value}`)]));
  function draw() {
    for (const [id, control] of sources) control.disabled = ordered.includes(id);
    lineup.replaceChildren(...ordered.map(id => {
      const selected = middle.includes(id);
      const button = action(`Merkitse keskimmäiseksi ${id}`, () => {
        middle = selected ? middle.filter(mark => mark !== id) : [...middle, id];
        draw(); lineup.querySelector<HTMLElement>(`[data-harbor-middle="${id}"]`)?.focus();
      }, `${id} · ${byId(id).value}`);
      button.dataset.harborMiddle = id;
      button.setAttribute('aria-pressed', String(selected));
      if (selected) button.style.background = '#c3dfcd';
      return button;
    }));
    undo.disabled = !ordered.length;
  }
  pool.append(...sources.values()); draw();
  return { node: h('div', { style: panel }, bold('Valitse järjestyksessä'), pool, h('div', { style: row }, bold('Järjestetty jono'), undo),
    lineup, note('Valitse jonosta keskimmäinen tai kaksi keskimmäistä.'), h('div', { style: row }, value.node, task.previous ? previous.node : null)),
    read: () => ({ kind, mode: 'median', order: ordered, middle, median: value.get(), previous: previous.get() }),
    show(answer) { ordered = [...answer.order]; middle = [...answer.middle]; value.set(answer.median); previous.set(answer.previous); draw(); },
  };
}
function mode(task: Task<'mode'>): Work<'mode'> {
  const counts = entries(task.categories, id => id, id => `${id}, frekvenssi`);
  const marked = toggles(task.categories, id => `Tyyppiarvo ${id}`);
  const status = pick('Tyyppiarvojen määrä', [['one', 'Yksi'], ['many', 'Useita'], ['none', 'Ei nimettyä']] as const);
  return { node: h('div', { style: panel }, counts.node, marked.node, status.node),
    read: () => ({ kind, mode: 'mode', counts: counts.get(), modes: marked.get(), status: status.get() }),
    show(answer) { counts.set(answer.counts); marked.set(answer.modes); status.set(answer.status); },
  };
}

const ns = 'http://www.w3.org/2000/svg';
function svgEl(name: string, props: Record<string, string | number>, content?: string) {
  const node = document.createElementNS(ns, name);
  for (const [key, value] of Object.entries(props)) node.setAttribute(key, String(value));
  if (content !== undefined) node.textContent = content;
  return node;
}
function picture(label: string, width: number, height: number, ...nodes: SVGElement[]) {
  const svg = svgEl('svg', { role: 'img', 'aria-label': label, viewBox: `0 0 ${width} ${height}`,
    style: 'display:block;width:100%;height:auto;max-height:155px' });
  svg.append(...nodes);
  return svg;
}
const ink = '#31594c', sea = '#74a88e';
const ln = (x1: number, y1: number, x2: number, y2: number, stroke = ink, width = 1.3) =>
  svgEl('line', { x1, y1, x2, y2, stroke, 'stroke-width': width });
const label = (x: number, y: number, content: string, size = 11, align = 'middle') =>
  svgEl('text', { x, y, fill: ink, 'font-size': size, 'font-weight': 650, 'text-anchor': align }, content);
const box = (x: number, y: number, width: number, height: number, fill: string) =>
  svgEl('rect', { x, y, width, height, fill, rx: 1 });
const dot = (cx: number, cy: number, r: number, fill = sea) => svgEl('circle', { cx, cy, r, fill, stroke: ink, 'stroke-width': .7 });

function dotPlot(task: Task<'spread'>) {
  const values = task.series.flatMap(series => series.values);
  const first = Math.min(...values), last = Math.max(...values);
  const left = 64, right = 344;
  const x = (value: number) => left + (right - left) * (value - first) / Math.max(1, last - first);
  const closeFrom = Math.max(first, task.centre - task.radius), closeTo = Math.min(last, task.centre + task.radius);
  const art = task.series.flatMap(({ label: name, values }, i) => {
    const y = i ? 97 : 44;
    const stacks = new Map<number, number>();
    const dots = values.map(v => {
      const level = stacks.get(v) ?? 0; stacks.set(v, level + 1);
      return dot(x(v), y - 7 - 8 * level, 3.8, i ? '#d2ac74' : sea);
    });
    return [
      box(x(closeFrom) - 6, y - 30, x(closeTo) - x(closeFrom) + 12, 31, '#deead8'),
      label(57, y - 6, `${i ? 'B' : 'A'} · ${name}`, 9, 'end'),
      ln(left - 6, y, right + 5, y), ...dots,
      ...Array.from({ length: last - first + 1 }, (_, j) => {
        const v = first + j;
        return [ln(x(v), y, x(v), y + 4), label(x(v), y + 15, String(v), 9)];
      }).flat(),
    ];
  });
  return picture(`Pistejakaumat yhteisellä asteikolla. ${task.series.map(series => `${series.label}: ${series.values.join(', ')}`).join('. ')} ${task.unit}.`, 365, 117, ...art);
}
function spread(task: Task<'spread'>): Work<'spread'> {
  const ranges = [input('Vaihteluvälin leveys A', 'A · Leveys'), input('Vaihteluvälin leveys B', 'B · Leveys')];
  const near = [input('Keskialueen lukumäärä A', 'A · Keskellä'), input('Keskialueen lukumäärä B', 'B · Keskellä')];
  const compareNear = pick('Enemmän keskialueen havaintoja', compare, 'Enemmän keskellä');
  return { node: h('div', { style: panel }, dotPlot(task),
    note(`Keskialueeseen kuuluvat ${task.centre - task.radius}–${task.centre + task.radius} ${task.unit}, myös rajakohdat.`),
    h('div', { style: row }, ...ranges.map(input => input.node)),
    h('div', { style: row }, ...near.map(input => input.node)), compareNear.node),
    read: () => ({ kind, mode: 'spread', ranges: [ranges[0]!.get(), ranges[1]!.get()], near: [near[0]!.get(), near[1]!.get()], moreCentral: compareNear.get() }),
    show(answer) { ranges.forEach((entry, i) => entry.set(answer.ranges[i]!)); near.forEach((entry, i) => entry.set(answer.near[i]!)); compareNear.set(answer.moreCentral); },
  };
}

function chartArt(rows: readonly HarborRow[], type: HarborChartType, start: number, top: number, step: number, axis: string, unit: string) {
  const left = 45, right = 295, y0 = 104, y1 = 18;
  const at = (v: number) => y0 - (y0 - y1) * (v - start) / (top - start);
  const x = (i: number) => left + (right - left) * (i + .5) / rows.length;
  const ticks = Array.from({ length: Math.min(11, Math.floor((top - start) / step) + 1) }, (_, i) => {
    const v = start + i * step, y = at(v);
    return [ln(left, y, right, y, '#9cb9aa', .65), label(left - 6, y + 4, String(v), 10, 'end')];
  }).flat();
  const points = rows.map((r, i) => [x(i), at(r.value)] as const);
  const marks = rows.flatMap((r, i) => {
    const [px, py] = points[i]!;
    const data = type === 'bar' ? [box(px - 13, py, 26, y0 - py, sea)] :
      [dot(px, py, 3.6), ...(i ? [ln(...points[i - 1]!, px, py, '#5a8e73', 2)] : [])];
    return [...data, label(px, y0 + 14, r.label, 10)];
  });
  const cut = start > 0 ? [svgEl('path', { d: 'M 39 97 L 44 94 L 48 100 L 52 97', fill: 'none', stroke: '#a55132', 'stroke-width': 2 })] : [];
  return picture(`${type === 'bar' ? 'Pylväs' : 'Viiva'}diagrammi. ${axis}, ${unit}. Asteikko ${start}–${top}, väli ${step}. ${rows.map(r => `${r.label} ${r.value}`).join(' · ')}.`,
    310, 140, label(left, 12, unit, 10, 'start'), ...ticks, ln(left, y1, left, y0), ln(left, y0, right, y0), ...marks, ...cut, label(172, 135, axis, 10));
}
function sourceTable(rows: readonly HarborRow[], axis = 'Havainto', unit = 'Määrä', totals?: readonly number[]) {
  return h('table', { style: 'width:100%;border-collapse:collapse;font-size:14px' },
    h('thead', {}, h('tr', {}, h('th', { scope: 'col', style: 'text-align:left' }, axis),
      h('th', { scope: 'col' }, unit), totals ? h('th', { scope: 'col' }, 'Kaikki') : null)),
    h('tbody', {}, ...rows.map((row, i) => h('tr', {}, h('th', { scope: 'row', style: 'text-align:left' }, row.label),
      h('td', { style: 'text-align:center' }, row.value), totals ? h('td', { style: 'text-align:center' }, totals[i]!) : null))));
}
function interpret(task: Task<'interpret'>): Work<'interpret'> {
  const issue = pick('Julisteen ongelma', [['axis', 'Katkaistu asteikko'], ['population', 'Otoskoot puuttuvat kuvasta'], ['none', 'Molemmat näkyvät selvästi']] as const, 'Ongelma');
  const delta = input('Toisen ja ensimmäisen lukeman erotus', 'Erotus B − A');
  const ratios = [input('Otos A, osuus', 'Osuus A', 86), input('Otos B, osuus', 'Osuus B', 86)];
  const greater = pick('Otos, jossa osuus on suurempi', compare, 'Suurempi osuus');
  const plot = h('div', { 'data-harbor-interpret-chart': '' });
  let alternate = false, compared = false;
  const flip = action('Vaihda diagrammia ja asteikkoa', () => { alternate = !alternate; compared = true; draw(); });
  const source = sourceTable(task.rows.map((r, i) => ({ ...r, label: i ? 'B · Ilta' : 'A · Aamu' })), 'Otos', 'Määrä', task.totals);
  const layout = h('div', { style: 'display:grid;grid-template-columns:minmax(108px,.78fr) minmax(0,1.22fr);gap:5px;align-items:center' }, source, plot);
  function draw() {
    const top = alternate ? Math.ceil(Math.max(...task.rows.map(r => r.value)) / 10) * 10 : task.firstTop;
    plot.replaceChildren(chartArt(task.rows, alternate ? 'line' : task.firstChart, alternate ? 0 : task.firstStart, top,
      alternate ? 10 : task.firstStep, 'Havaintovuoro', 'Havaintoja (kpl)'));
    flip.setAttribute('aria-pressed', String(alternate));
  }
  draw();
  return { node: h('div', { style: panel }, layout, task.compareCharts ? flip : null, h('div', { style: row }, issue.node, delta.node),
    task.totals ? h('div', { style: row }, ...ratios.map(ratio => ratio.node), greater.node) : null),
    read: () => ({ kind, mode: 'interpret', issue: issue.get() ?? '', compared, change: delta.get(), ratios: [ratios[0]!.get(), ratios[1]!.get()],
      comparison: greater.get() }),
    show(answer) { compared = answer.compared; issue.set(answer.issue as 'axis' | 'population'); delta.set(answer.change); ratios.forEach((input, i) => input.set(answer.ratios[i]!)); greater.set(answer.comparison); },
    review: () => h('div', { style: stack }, layout, note(`Kirjaamasi erotus B − A: ${delta.get()}.${task.totals ? ` Osuudet: ${ratios.map(ratio => ratio.get()).join(' ja ')}.` : ''}`)),
  };
}

function chart(task: Task<'chart'>): Work<'chart'> {
  const type = pick('Diagrammityyppi', [['bar', 'Pylväsdiagrammi'], ['line', 'Viivadiagrammi']] as const, '', 'Diagrammityyppi');
  const axis = pick('Vaaka-akselin nimi', choices(['Kellonaika', 'Havaintopaikka', 'Väri']), '', 'Vaaka-akseli');
  const unit = pick('Pystyakselin nimi ja yksikkö', choices(['Havaintoja (kpl)', 'Lämpötila (°C)', 'Pituus (m)']), '', 'Pystyakseli');
  const low = input('Asteikon alku', 'Alku', 54), step = input('Asteikkoväli', 'Väli', 54), high = input('Asteikon yläraja', 'Yläraja', 58);
  const values = entries(task.rows.map(row => row.id), id => task.rows.find(r => r.id === id)!.label,
    id => `Arvo ${task.rows.find(r => r.id === id)!.label}`);
  const view = h('div', { 'data-harbor-chart-preview': '' });
  const table = sourceTable(task.rows, task.axis, task.unit);
  const layout = h('div', { style: 'display:grid;grid-template-columns:minmax(105px,.72fr) minmax(0,1.28fr);gap:5px;align-items:center' }, table, view);
  function read(): ChartDraft {
    return { type: type.get(), axis: axis.get() ?? '', unit: unit.get() ?? '', start: low.get(), step: step.get(), top: high.get(), values: values.get() };
  }
  function draw() {
    const draft = read(), start = Number(draft.start), step = Number(draft.step), top = Number(draft.top);
    const visible = task.rows.map(row => {
      const raw = draft.values[row.id];
      const exact = raw ? parseMeasure(raw) : undefined;
      return { ...row, value: exact ? Number(exact[0]) / Number(exact[1]) : raw ? NaN : 0 };
    });
    if (draft.type && /^0+$/.test(draft.start) && step > 0 && top / step >= 2 && top / step <= 10 && top % step === 0 &&
        visible.every(r => Number.isFinite(r.value) && r.value >= start && r.value <= top)) {
      view.replaceChildren(chartArt(visible, draft.type, start, top, step, draft.axis || 'Vaaka-akseli', draft.unit || 'Pystyakseli'));
    } else view.replaceChildren(note('Kuva piirtyy, kun tyyppi, asteikko ja arvot sopivat näkyvälle alueelle.'));
  }
  for (const control of [type.field, axis.field, unit.field, low.field, step.field, high.field, ...values.fields.map(v => v.entry.field)]) {
    control.addEventListener(control instanceof HTMLSelectElement ? 'change' : 'input', draw);
  }
  draw();
  return { node: h('div', { style: panel }, layout, h('div', { style: row }, type.node, axis.node, unit.node),
    h('div', { style: row }, low.node, step.node, high.node), values.node),
    read: () => ({ kind, mode: 'chart', draft: read() }),
    show(answer) { const draft = answer.draft; type.set(draft.type); axis.set(draft.axis); unit.set(draft.unit);
      low.set(draft.start); step.set(draft.step); high.set(draft.top); values.set(draft.values); draw(); },
    review: () => layout,
  };
}

function space(task: Task<'space'>): Work<'space'> {
  let pairs: string[] = [];
  const first = pick('Parin ensimmäinen tunnus', choices(task.space.variant === 'product' ? task.space.first : task.space.symbols), 'Ensin');
  const second = pick('Parin toinen tunnus', choices(task.space.variant === 'product' ? task.space.second : task.space.symbols), 'Toinen');
  const total = input('Alkeistulosten määrä');
  const list = h('div', { style: row, 'data-harbor-pairs': '', 'aria-live': 'polite' });
  const add = action('Lisää pari', () => {
    const a = first.get(), b = second.get();
    if (a && b && pairs.length < 20) { pairs = [...pairs, `${a}|${b}`]; draw(); }
  });
  const remove = action('Poista viimeinen pari', () => { pairs = pairs.slice(0, -1); draw(); });
  function draw() {
    remove.disabled = !pairs.length;
    list.replaceChildren(...(pairs.length ? pairs.map(pair => tiny(pair.replace('|', ' · '))) : [note('Ei vielä merkittyjä pareja.')]));
  }
  draw();
  return { node: h('div', { style: panel }, h('div', { style: row }, first.node, second.node, add, remove), list, total.node),
    read: () => ({ kind, mode: 'space', pairs, count: total.get() }),
    show(answer) { pairs = [...answer.pairs]; total.set(answer.count); draw(); },
  };
}
const pairLabel = (id: string) => id.replace('|', ' · ');
function classic(task: Task<'classic'>): Work<'classic'> {
  const inputs = new Map<string, HTMLInputElement>();
  const grid = h('table', { 'data-harbor-classic': '', style: 'width:100%;table-layout:fixed;border-collapse:collapse;font-size:13px;text-align:center' },
    h('thead', {}, h('tr', {}, h('th', { scope: 'col', style: 'width:14%' }, '2. / 1.'),
      ...task.space.first.map(symbol => h('th', { scope: 'col' }, symbol)))));
  grid.append(h('tbody', {}, ...task.space.second.map(second => h('tr', {},
    h('th', { scope: 'row' }, second), ...task.space.first.map(first => {
      const key = `${first}|${second}`;
      const input = h('input', { type: 'checkbox', 'aria-label': pairLabel(key), style: 'margin:0' });
      inputs.set(key, input);
      return h('td', {}, h('label', { style: 'display:grid;place-items:center;min-height:44px;min-width:44px;border:1px solid #c3d4c7;cursor:pointer' }, input));
    })))));
  const members = { node: grid, get: () => harborPairs(task.space).filter(id => inputs.get(id)?.checked),
    set: (selected: readonly string[]) => inputs.forEach((input, id) => { input.checked = selected.includes(id); }) };
  const favored = input('Suotuisia alkeistuloksia', 'Suotuisia'), total = input('Kaikki alkeistulokset', 'Kaikkia');
  const ratio = input('Tapahtuman todennäköisyys', 'Todennäköisyys', 90);
  const condition = pick('Miksi suhde toimii?', [['equal-atomic', 'Yksittäiset sektoriparit ovat yhtä mahdollisia'],
    ['equal-categories', 'Nimetyt värit ovat aina yhtä mahdollisia'], ['frequency', 'Yhden kokeen osuus määrää mallin']] as const, 'Suhteen ehto');
  return { node: h('div', { style: panel }, bold('Ehdon toteuttavat parit'), members.node,
    h('div', { style: row }, favored.node, total.node, ratio.node), condition.node),
    read: () => ({ kind, mode: 'classic', members: members.get(), favorable: favored.get(), total: total.get(), probability: ratio.get(),
      condition: condition.get() ?? '' }),
    show(answer) { members.set(answer.members); favored.set(answer.favorable); total.set(answer.total); ratio.set(answer.probability); condition.set(answer.condition as 'equal-atomic'); },
  };
}
function empirical(task: Task<'empirical'>): Work<'empirical'> {
  const run: string[] = [];
  const next = input('Mallin todennäköisyys seuraavassa kokeessa', 'Seuraava pyöräytys', 78);
  const nearby = toggles(task.experiments.map(test => test.id), id => `Koe ${id}`);
  const meaning = pick('Mitä kokeiden osuudet kertovat?', [
    ['estimate', 'Havainto-osuudet ovat vaihtelevia arvioita'],
    ['large-guarantee', 'Suurin otos on aina lähimpänä mallia'],
    ['compensation', 'Seuraava pyöräytys korjaa aiemman sarjan'],
  ] as const, 'Tulkinta');
  const shots = task.experiments.map(test => {
    const count = input(`Koe ${test.id}, frekvenssi`, 'Määrä', 56), share = input(`Koe ${test.id}, osuus`, 'Osuus', 76);
    const result = h('span', { 'data-harbor-result': test.id, role: 'status', style: muted });
    const go = action(`Aja koe ${test.id}`, () => { if (!run.includes(test.id)) { run.push(test.id); draw(); } }, `Aja ${test.count}`);
    const draw = () => {
      const sample = run.includes(test.id) ? runHarborExperiment(task, test.id) : undefined;
      go.disabled = !!sample; count.field.disabled = !sample; share.field.disabled = !sample;
      result.replaceChildren(...(sample ? [
        h('span', { 'aria-hidden': 'true', style: 'display:inline-flex;gap:2px;margin-right:4px' },
          ...sample.sample.slice(0, 8).map(color => h('span', { style: `width:8px;height:8px;border-radius:50%;background:${color === task.target ? '#4b8eb1' : '#ba7056'}` }))),
        h('span', {}, `${sample.hits}/${test.count} sinistä`),
      ] : [h('span', {}, 'Ei ajettu')]));
    };
    draw();
    return { test, go, count, share, result, draw };
  });
  const experimentGrid = 'display:grid;grid-template-columns:minmax(18px,.25fr) minmax(63px,.75fr) minmax(83px,1.3fr) minmax(49px,.6fr) minmax(53px,.8fr);gap:4px 6px;align-items:center';
  return { node: h('div', { style: panel },
    h('div', { style: `${experimentGrid};font-size:13px`, 'aria-hidden': 'true' }, ...['Koe', 'Käynnistä', 'Havainto', 'Määrä', 'Osuus'].map(bold)),
    ...shots.map(shot => h('div', { style: experimentGrid, 'data-harbor-experiment': shot.test.id },
      bold(shot.test.id), shot.go, shot.result, shot.count.field, shot.share.field)),
    h('div', { style: row }, bold('Lähimpänä mallin osuutta'), nearby.node),
    h('div', { style: row }, next.node, meaning.node)),
    read: () => ({ kind, mode: 'empirical', run: [...run], counts: Object.fromEntries(shots.map(s => [s.test.id, s.count.get()])),
      ratios: Object.fromEntries(shots.map(s => [s.test.id, s.share.get()])), closest: nearby.get(), next: next.get(), inference: meaning.get() ?? '' }),
    ready: () => run.length === task.experiments.length,
    show(answer) { run.splice(0, run.length, ...answer.run);
      for (const shot of shots) { shot.count.set(answer.counts[shot.test.id]!); shot.share.set(answer.ratios[shot.test.id]!); shot.draw(); }
      nearby.set(answer.closest); next.set(answer.next); meaning.set(answer.inference as 'estimate'); },
  };
}

function spaceGivens(space: HarborSpace) {
  if (space.variant === 'product') return [
    text(`Ensimmäinen kiekko: ${space.first.join(' · ')}. Toinen kiekko: ${space.second.join(' · ')}.`),
    note('Tulos sisältää ensimmäisen ja toisen kiekon tunnuksen tässä järjestyksessä.'),
  ];
  return [text(`Tunnukset: ${space.symbols.join(' · ')}.`), note(space.variant === 'ordered'
    ? 'Nosta kaksi eri korttia samasta pakasta palauttamatta ensimmäistä. Nosta ensin yksi, sitten toinen. Järjestys vaikuttaa tulokseen.'
    : 'Nosta samasta pakasta kaksi eri korttia kerralla. Samat kaksi tunnusta muodostavat saman parin kummassakin järjestyksessä.')];
}
function spinner(task: Task<'empirical'>) {
  const cx = 32, cy = 31, radius = 25;
  const at = (i: number) => {
    const angle = i * 2 * Math.PI / task.sectors.length - Math.PI / 2;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  };
  const sectors = task.sectors.map((color, i) => {
    const [x1, y1] = at(i), [x2, y2] = at(i + 1);
    return svgEl('path', { d: `M${cx},${cy} L${x1},${y1} A${radius},${radius} 0 0 1 ${x2},${y2} Z`,
      fill: color === task.target ? '#518ca9' : '#bd785d', stroke: '#f9f6de', 'stroke-width': 1.2 });
  });
  return h('div', { style: row }, h('span', { style: 'display:block;width:75px' },
    picture(`Tasakokoiset sektorit: ${task.sectors.join(', ')}.`, 66, 60, ...sectors)),
    h('div', { style: stack }, text(`Yhtä suuret sektorit: ${task.sectors.join(' · ')}.`),
      note('Sininen on seurattava väri. Pyöräytykset ovat mallissa riippumattomia.')));
}

export function statisticsHarborBoard(task: StatisticsHarborTask): Paint {
  return host => {
    const body = h('div', { 'data-harbor-givens': '', style: stack });
    switch (task.mode) {
      case 'collect':
        body.append(h('p', { style: 'margin:0' }, bold(task.question)),
          note(`Tee ${task.budget} erillistä käyntiä. Mukaan tarvitaan:`),
          h('div', { style: row }, ...task.coverage.map(rule => h('span', { 'data-harbor-coverage': '', style: 'font-size:13px' }, rule.label))));
        break;
      case 'structure':
        body.append(text(`Lapuissa mitataan: ${variableNames[task.variable]} (${task.unit}).`),
          h('div', { style: row }, ...task.slips.map(slip => tiny(`${slip.id} · ${slip.log} · ${slip.site} ${slip.time} · ${slip.value ?? 'puuttuu'}`))),
          note(`Sataman tavanomainen väli on ${task.usual[0]}–${task.usual[1]} ${task.unit}. Sen ulkopuolinen lukema säilytetään tarkistettavana.`));
        break;
      case 'freq':
        body.append(h('p', { style: 'margin:0' }, bold(task.name)),
          h('div', { style: row, 'data-harbor-values': '' }, ...task.values.map(tiny)));
        break;
      case 'relative':
        body.append(sourceTable(task.groups.map((group, i) => ({ ...group, label: `${i ? 'B' : 'A'} · ${group.label}` })),
          'Havaintopäivä', 'Lokkikäynnit', task.groups.map(group => group.total)),
        note(task.format === 'percent' ? 'Kirjaa osuus prosenttilukuna. % tarkoittaa sadasosaa.' : 'Kirjaa osuus murtolukuna.'));
        break;
      case 'mean':
        body.append(text(`Alkuperäiset havainnot: ${task.values.join(' · ')} ${task.unit}.`),
          text(`Lisätään yksi uusi havainto: ${task.addition} ${task.unit}.`), note('Keskiarvon voi kirjoittaa murtolukuna tai tarkkana desimaalina.'));
        break;
      case 'median':
        body.append(text(`Havainnot ovat yksikössä ${task.unit}. Saman lukuarvon kortit ovat eri havaintoja.`));
        if (task.previous) body.append(note(`Ennen muutosta kortin ${task.previous.id} arvo oli ${task.previous.value} ${task.unit}. Muut havainnot pysyivät samoina.`));
        break;
      case 'mode':
        body.append(h('div', { style: row, 'data-harbor-values': '' }, ...task.values.map(tiny)),
          note('Pajan sopimus: jos kaikki useasta eri havaitusta arvosta ovat yhtä yleisiä, tyyppiarvoa ei nimetä.'));
        break;
      case 'spread': body.append(note(`Molemmissa aineistoissa keskiarvo on ${task.centre} ${task.unit}. Tutki niiden jakaumia.`)); break;
      case 'interpret': body.append(note('Juliste kuvaa kahta paikallista otosta. Katso myös alkuperäiset luvut.' +
        (task.compareCharts ? ' Vertailukuvassa käytetään samoja lukuja eri asteikolla.' : ''))); break;
      case 'chart': body.append(text(task.question), note('Käytä nollasta alkavaa yhteistä asteikkoa.')); break;
      case 'space': body.append(...spaceGivens(task.space)); break;
      case 'classic': body.append(...spaceGivens(task.space), note('Molemmissa kiekoissa sektorit ovat keskenään yhtä suuret omassa kiekossaan. Pyöräytykset ovat riippumattomia.')); break;
      case 'empirical': body.append(spinner(task)); break;
    }
    host.replaceChildren(body);
  };
}

export function mountStatisticsHarbor(task: StatisticsHarborTask, host: HTMLElement,
  submit: (response: StatisticsHarborResponse) => void, onChange?: (response: StatisticsHarborResponse) => void): { reveal(): void } {
  function mount<M extends Mode>(work: Work<M>) {
    const done = h('button', { type: 'submit', class: 'btn primary wide', 'data-harbor-submit': '' },
      'review' in task ? 'Siirry omaan perusteluun' : 'Tarkista tutkimuslappu');
    const form = h('form', { 'data-harbor-workbench': task.mode, style: stack }, work.node, done);
    const reviewHost = h('div', { hidden: true, 'data-harbor-review': '', style: stack });
    let locked = false;
    let adult: ReturnType<typeof mountObservedExplanation> | undefined;
    const refresh = () => { if (!locked) done.disabled = work.ready?.() === false; };
    refresh(); form.addEventListener('click', refresh); form.addEventListener('change', refresh);
    function freeze() {
      locked = true;
      for (const control of form.querySelectorAll('input,select,button')) control.setAttribute('disabled', '');
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (locked || work.ready?.() === false) return;
      const answer = work.read();
      freeze();
      if (!('review' in task) || !checkHarborActivity(task, answer).ok) { submit(answer); return; }
      const area = h('div');
      reviewHost.hidden = false;
      form.hidden = true; form.style.display = 'none';
      reviewHost.replaceChildren(work.review?.() ?? h('div'), text(task.review.prompt), area);
      adult = mountObservedExplanation(harborExplanation(task.review), area, observation => {
        submit({ ...answer, review: { observations: observation.observations, confirmedByAdult: observation.confirmedByAdult,
          assistance: observation.assistance } } as StatisticsHarborResponse);
      });
      for (const control of area.querySelectorAll<HTMLElement>('button,select,input:not([type="checkbox"])')) control.style.minHeight = '44px';
      const confirmation = area.querySelector<HTMLInputElement>('input[type="checkbox"]')?.closest('label');
      if (confirmation) confirmation.style.minHeight = '44px';
      area.querySelector<HTMLElement>('button')?.focus();
    });
    host.append(form, reviewHost);
    return { reveal() {
      if (adult) { adult.reveal(); return; }
      const answer = solutionStatisticsHarbor(task);
      work.show(answer as Answer<M>); freeze();
      if (task.mode === 'collect') onChange?.(answer);
      if ('review' in task) form.append(note(`Malliselitys: ${task.review.model}`));
    } };
  }
  switch (task.mode) {
    case 'collect': return mount(collection(task, onChange));
    case 'structure': return mount(structure(task));
    case 'freq': return mount(frequencies(task));
    case 'relative': return mount(relative(task));
    case 'mean': return mount(mean());
    case 'median': return mount(median(task));
    case 'mode': return mount(mode(task));
    case 'spread': return mount(spread(task));
    case 'interpret': return mount(interpret(task));
    case 'chart': return mount(chart(task));
    case 'space': return mount(space(task));
    case 'classic': return mount(classic(task));
    case 'empirical': return mount(empirical(task));
  }
}

export function statisticsHarborExample(task: StatisticsHarborTask): Paint {
  return host => {
    const givens = h('div'), work = h('div');
    statisticsHarborBoard(task)(givens);
    mountStatisticsHarbor(task, work, () => {}).reveal();
    work.querySelector('[data-harbor-submit]')?.remove();
    host.replaceChildren(givens, work);
  };
}
