import type { Paint } from '../../engine/types';
import { h } from '../../ui/dom';
import { mountObservedExplanation } from './observed-explanations';
import { liquidHeightFraction, vesselWidths } from '../models/measurement-station';
import { applyInvestigationInstrument, initialInvestigationInstrument, investigationAction, investigationExplanation, investigationMeter,
  investigationNumber, investigationResult, MENISCUS_RELATIVE_LIFT, investigationUnitLabels, investigationValue, solutionChemicalInvestigation,
  type ChemicalInvestigationResponse, type ChemicalInvestigationTask, type InvestigationAction, type InvestigationChart,
  type InvestigationInstrumentId, type InvestigationReading, type InvestigationUnit } from '../models/chemical-investigation';

type Mode = ChemicalInvestigationTask['mode'];
type Task<M extends Mode> = Extract<ChemicalInvestigationTask, { mode: M }>;
type Answer<M extends Mode> = Extract<ChemicalInvestigationResponse, { mode: M }>;
type Work<M extends Mode> = { node: HTMLElement; read(): Answer<M>; show(answer: Answer<M>): void; beforeSubmit?(): void };
const kind = 'chemical-investigation' as const;
const stack = 'display:grid;gap:5px';
const row = 'display:flex;align-items:center;flex-wrap:wrap;gap:5px 8px';
const panel = `${stack};padding:5px 7px;background:#edf3e7;border:1px solid #a4bdaa;border-radius:9px;color:#214d43`;
const controlStyle = 'min-height:44px;min-width:44px;max-width:100%;box-sizing:border-box;background:#fffef5;border:1px solid #809e8d;border-radius:7px;color:#204b41;padding:4px 6px;font:inherit';
const note = (text: string) => h('p', { style: 'margin:0;font-size:13px;line-height:1.22' }, text);
const button = (text: string, run: () => void, caption = text) => h('button', { 'aria-label': text, class: 'btn small', type: 'button', style: 'min-height:44px;min-width:44px', onclick: run }, caption);
function number(name: string, caption = name, width = 85) {
  const input = h('input', { type: 'text', inputmode: 'decimal', autocomplete: 'off', 'aria-label': name, style: `${controlStyle};width:${width}px` });
  return { input, node: h('label', { style: row }, h('span', { style: 'font-size:13px;line-height:1.2' }, caption), input),
    get: () => investigationNumber(input.value) ? input.value.trim() : '', set: (value: string) => { input.value = value; } };
}
function select<T extends string>(name: string, values: readonly (readonly [T, string])[], caption = name) {
  const input = h('select', { 'aria-label': name, style: `${controlStyle};flex:1;min-width:100px` }, h('option', { value: '' }, '—'), ...values.map(([value, label]) => h('option', { value }, label)));
  return { input, node: h('label', { style: row }, h('span', { style: 'font-size:13px;line-height:1.2' }, caption), input),
    get: () => (input.value || null) as T | null, set: (value: T | null) => { input.value = value ?? ''; } };
}
function check(name: string, caption = name) {
  const input = h('input', { type: 'checkbox', 'aria-label': name, style: 'width:20px;height:20px;flex:none' });
  return { input, node: h('label', { style: `${row};min-height:44px` }, input, h('span', { style: 'font-size:13px;line-height:1.2' }, caption)) };
}
const quantityUnits = (quantity: 'mass' | 'volume') => quantity === 'mass' ? [['mg', 'mg'], ['g', 'g']] as const : [['ul', 'µl'], ['ml', 'ml']] as const;
function reading(name: string, quantity: 'mass' | 'volume') {
  const value = number(`${name}, arvo`, 'Arvo'), unit = select<InvestigationUnit>(`${name}, yksikkö`, quantityUnits(quantity), 'Yksikkö');
  return { value, unit, node: h('div', { style: row }, value.node, unit.node), get: (): InvestigationReading => ({ value: value.get(), unit: unit.get() }),
    set: (answer: InvestigationReading) => { value.set(answer.value); unit.set(answer.unit); } };
}
const display = (base: number, unit: InvestigationUnit) => `${base / (unit === 'g' || unit === 'ml' ? 1000 : 1)}`.replace('.', ',');
function table(headers: readonly string[], rows: readonly (readonly (HTMLElement | string)[])[], attr: string) {
  return h('table', { [attr]: '', style: 'width:100%;border-collapse:collapse;font-size:12px;line-height:1.18' },
    h('thead', {}, h('tr', {}, ...headers.map(text => h('th', { scope: 'col', style: 'text-align:left;padding:2px 4px;border-bottom:1px solid #98af9c' }, text)))),
    h('tbody', {}, ...rows.map(cells => h('tr', {}, ...cells.map(text => h('td', { style: 'padding:2px 4px;border-bottom:1px solid #d0dfce' }, text))))));
}
export function chemicalInvestigationBoard(task: ChemicalInvestigationTask): Paint {
  return host => {
    const content: HTMLElement[] = [];
    if (task.mode === 'tool' || task.mode === 'measure') {
      content.push(note(task.protocol));
      if (task.mode === 'tool') content.unshift(note(`Siirrettävä ${display(task.requestedUl, task.unit)} ${investigationUnitLabels[task.unit]}. Lähteessä ${task.sourceUl} µl. Sallittu jakoväli enintään ${task.requiredDivisionUl} µl.`));
      else content.push(note(`Jakoväli enintään ${task.requiredDivision} ${task.quantity === 'mass' ? 'mg' : 'µl'}.`));
    } else if (task.mode === 'observe') content.push(observationPicture(task), note(task.observation));
    else if (task.mode === 'design') content.push(note(task.protocol));
    else if (task.mode === 'data') content.push(note(task.publicResults ? `${task.rows[0]!.sample} · Säilytä alkuperäiset havainnot tunnisteineen ja yksikköineen.` : `${task.rows[0]!.sample} · Tee kunkin näytteen oma virtuaalikoe. Havaintoloki säilyy muuttumattomana.`));
    else content.push(note(task.question), table(['Näyte / olosuhde', 'Liukeni mg', 'Toteutusmuistiinpano'], task.rows.map(s => [`${s.id} · ${s.sample} · ${s.condition}`, String(s.massMg), s.note]), 'data-inquiry-conclusions'));
    host.replaceChildren(h('div', { style: stack, 'data-inquiry-givens': task.mode }, ...content));
  };
}
const ns = 'http://www.w3.org/2000/svg';
function svg<K extends keyof SVGElementTagNameMap>(tag: K, attributes: Record<string, string | number>) {
  const element = document.createElementNS(ns, tag);
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, String(value));
  return element;
}
function text(x: number, y: number, value: string, size = 14) {
  const element = svg('text', { x, y, 'font-size': size, fill: '#254c42', 'text-anchor': 'middle' }); element.textContent = value; return element;
}
function observationPicture(task: Task<'observe'>) {
  const data = task.illustration;
  const plot = svg('svg', { viewBox: '0 0 380 100', role: 'img', 'aria-label': `Laadullinen ennen–jälkeen-malli. ${task.observation} Lämpömittari ${data.temperatureC} °C.`, style: 'width:100%;display:block;max-height:103px;background:#f9f8ea;border-radius:8px', 'data-inquiry-observation-picture': data.feature });
  for (const [i, amount] of [data.before, data.after].entries()) {
    const x = 25 + i * 135, top = 13, bottom = 72, width = 92;
    const fill = data.feature === 'colour' ? `hsl(${180 + amount * 7} 42% 74%)` : '#b4d4d7';
    plot.append(svg('path', { d: `M ${x} ${top} V ${bottom} H ${x + width} V ${top}`, fill: 'none', stroke: '#42685c', 'stroke-width': 2 }),
      svg('rect', { x: x + 2, y: top + 18, width: width - 4, height: bottom - top - 20, fill }), text(x + width / 2, 10, i ? 'Jälkeen' : 'Ennen', 12));
    if (data.feature === 'bubble' || data.feature === 'precipitate') {
      for (let marker = 0; marker < amount; marker++) {
        const col = marker % 6, row = Math.floor(marker / 6);
        if (data.feature === 'bubble') plot.append(svg('circle', { cx: x + 12 + col * 13, cy: top + 26 + row * 11, r: 3, fill: '#f5fbfa', stroke: '#426d74', 'stroke-width': 1.2, 'data-inquiry-observed-marker': 'bubble' }));
        else plot.append(svg('rect', { x: x + 9 + col * 13, y: bottom - 7 - row * 7, width: 5, height: 4, fill: '#a47c52', 'data-inquiry-observed-marker': 'precipitate' }));
      }
      plot.append(text(x + width / 2, 88, `${amount} ${data.feature === 'bubble' ? 'kuplamerkkiä' : 'sakkamerkkiä'}`, 11));
    } else plot.append(text(x + width / 2, 88, `Värikoodi ${amount}`, 11));
  }
  const thermometerX = 320, high = 26, low = 18, readingY = 68 - (data.temperatureC - low) / (high - low) * 43;
  plot.append(svg('rect', { x: thermometerX - 5, y: 17, width: 10, height: 53, rx: 4, fill: '#f6f6ee', stroke: '#42685c' }),
    svg('line', { x1: thermometerX, x2: thermometerX, y1: 68, y2: readingY, stroke: '#ae6a48', 'stroke-width': 4 }),
    svg('circle', { cx: thermometerX, cy: 73, r: 6, fill: '#ae6a48' }), text(333, 97, `${data.temperatureC} °C`, 13));
  for (let tick = low; tick <= high; tick += 2) {
    const y = 68 - (tick - low) / (high - low) * 43;
    plot.append(svg('line', { x1: 327, x2: 334, y1: y, y2: y, stroke: '#42685c' }), text(349, y + 3, String(tick), 10));
  }
  return h('div', {}, plot);
}
function instrumentWork(task: Task<'tool' | 'measure'>, onChange?: (answer: ChemicalInvestigationResponse) => void): Work<'tool' | 'measure'> {
  let state = initialInvestigationInstrument(task), actions: InvestigationAction[] = [], serial = 0;
  const catalogSummary = h('summary', { style: 'display:none;align-items:center;min-height:44px;font-size:13px' }, 'Välineiden kalibrointi');
  const catalog = h('details', { open: true }, catalogSummary, table(['Virtuaaliväline', 'Enimmäismitta', 'Jakoväli'], task.instruments.map(tool => [tool.label,
    `${tool.capacity} ${tool.quantity === 'mass' ? 'mg' : 'µl'}`, `${tool.division} ${tool.quantity === 'mass' ? 'mg' : 'µl'}`]), 'data-inquiry-tools'));
  function updateCatalog() {
    const tool = task.instruments.find(t => t.id === state.instrument);
    catalogSummary.style.display = tool ? 'flex' : 'none'; catalog.open = !tool;
    if (tool) catalogSummary.textContent = `${tool.label} · max ${tool.capacity}, jako ${tool.division} ${tool.quantity === 'mass' ? 'mg' : 'µl'} · kaikki välineet`;
  }
  const instrument = select<InvestigationInstrumentId>('Virtuaaliväline', task.instruments.map(tool => [tool.id, tool.label]), 'Väline');
  const answer = reading('Oma lukema', task.mode === 'tool' ? 'volume' : task.quantity);
  const meniscus = select<'bottom' | 'edge'>('Meniskin lukukohta', [['bottom', 'Alin kohta'], ['edge', 'Reunan yläkohta']], 'Lukukohta');
  const amount = reading('Siirrettävä annos', 'volume');
  const picture = h('div', { 'data-inquiry-instrument': '', style: stack }), status = note('Valitse väline ja tee sen oma käyttövaihe.'); status.setAttribute('role', 'status');
  const read = (): Answer<'tool' | 'measure'> => task.mode === 'tool' ? { kind, mode: 'tool', actions: [...actions], reading: answer.get() }
    : { kind, mode: 'measure', actions: [...actions], reading: answer.get(), meniscus: meniscus.get() };
  function redraw() {
    if (task.mode === 'tool') picture.replaceChildren(note(`Lähde ${state.sourceUl} µl · väline ${state.heldUl} µl · vastaanottaja ${state.receiverUl} µl. Yhteensä ${state.sourceUl + state.heldUl + state.receiverUl} µl.`));
    else if (task.quantity === 'mass') {
      const tool = task.instruments.find(t => t.id === state.instrument);
      picture.replaceChildren(h('div', { style: panel }, note(state.containerPlaced ? state.samplePlaced ? 'Näyte on astiassa.' : 'Tyhjä näyteastia on vaa’alla.' : 'Punnitusalusta on tyhjä.'),
        h('strong', { style: 'font-size:23px', 'data-inquiry-meter': '' }, tool?.quantity === 'mass' ? `${display(investigationMeter(task, state), task.unit)} ${investigationUnitLabels[task.unit]}` : 'Valitse massan mittaväline')));
    } else {
      const tool = task.instruments.find(t => t.id === state.instrument);
      if (!tool || tool.quantity !== 'volume') { picture.replaceChildren(note('Valitse tilavuuden mittaväline.')); return; }
      const plot = svg('svg', { viewBox: '0 0 380 128', role: 'img', 'aria-label': 'Vesinäytteen kalibroitu asteikko ja meniski', style: 'width:100%;display:block;max-height:135px;background:#f9f8ea;border-radius:8px' });
      const left = task.shape === 'flared' ? 138 : 118, right = task.shape === 'flared' ? 250 : 210, bottomLeft = task.shape === 'flared' ? left + (vesselWidths.top - vesselWidths.base) / 2 : left;
      const bottomRight = task.shape === 'flared' ? right - (vesselWidths.top - vesselWidths.base) / 2 : right;
      const top = 8, bottom = 106, amountUl = state.samplePlaced ? task.amount : 0;
      const fraction = liquidHeightFraction(task.shape, amountUl, tool.capacity), y = bottom - fraction * (bottom - top);
      const edgeY = Math.max(top, y - MENISCUS_RELATIVE_LIFT * (bottom - top)), edgeFraction = (bottom - edgeY) / (bottom - top);
      const xAt = (a: number, b: number, f: number) => a + (b - a) * f;
      const waterLeft = xAt(bottomLeft, left, edgeFraction), waterRight = xAt(bottomRight, right, edgeFraction);
      if (amountUl) plot.append(svg('path', { d: `M ${bottomLeft} ${bottom} L ${waterLeft} ${edgeY} Q ${(left + right) / 2} ${2 * y - edgeY} ${waterRight} ${edgeY} L ${bottomRight} ${bottom} Z`, fill: '#a4cbd0', opacity: .8 }));
      plot.append(svg('path', { d: `M ${left} ${top} L ${bottomLeft} ${bottom} H ${bottomRight} L ${right} ${top}`, fill: 'none', stroke: '#3a655b', 'stroke-width': 2 }));
      // Every drawn tick uses its calibrated volume-to-height mapping.
      const major = Math.max(tool.division, Math.ceil(tool.capacity / (tool.division * 5)) * tool.division);
      for (let tick = 0; tick <= tool.capacity; tick += major) {
        const tickY = bottom - liquidHeightFraction(task.shape, tick, tool.capacity) * (bottom - top);
        plot.append(svg('line', { x1: 78, x2: 105, y1: tickY, y2: tickY, stroke: '#31594d', 'stroke-width': 1.4 }), text(48, tickY + 4, `${display(tick, 'ml')}`, 13));
      }
      plot.append(text(46, 122, 'ml', 13), text((left + right) / 2, 123, 'Vesinäyte', 13));
      // An exact local scale window keeps the stated small division readable without a camera gate.
      const low = Math.max(0, Math.min(tool.capacity - 6 * tool.division, Math.floor(amountUl / tool.division - 3) * tool.division));
      const high = Math.min(tool.capacity, low + 6 * tool.division);
      const lowF = liquidHeightFraction(task.shape, low, tool.capacity), highF = liquidHeightFraction(task.shape, high, tool.capacity);
      const zoomY = (volume: number) => bottom - (liquidHeightFraction(task.shape, volume, tool.capacity) - lowF) / (highF - lowF) * (bottom - top);
      plot.append(text(337, 123, 'Suurennos ml', 11), svg('line', { x1: 308, x2: 308, y1: top, y2: bottom, stroke: '#4c7666', 'stroke-width': 1.5 }));
      for (let tick = low; tick <= high; tick += tool.division) {
        const yy = zoomY(tick);
        plot.append(svg('line', { x1: 301, x2: 316, y1: yy, y2: yy, stroke: '#31594d', 'stroke-width': 1.3, 'data-inquiry-volume-tick': tick }), text(345, yy + 4, display(tick, 'ml'), 12));
      }
      if (amountUl) plot.append(svg('path', { d: `M 283 ${zoomY(amountUl) - 5} L 298 ${zoomY(amountUl)} L 283 ${zoomY(amountUl) + 5} Z`, fill: '#b58441', 'data-inquiry-volume-focus': amountUl }));

      const pointY = meniscus.get() === 'edge' ? edgeY : y, pointX = meniscus.get() === 'edge' ? waterRight : (left + right) / 2;
      if (state.eyeLevel) plot.append(svg('line', { x1: 270, x2: pointX, y1: pointY, y2: pointY, stroke: '#a26137', 'stroke-dasharray': '4 3', 'stroke-width': 2 }), text(278, Math.min(118, pointY + 5), 'Katse', 12));
      picture.replaceChildren(plot, note(`Välineen jakoväli ${tool.division} µl. ${state.eyeLevel ? 'Katse on valitun vertailupisteen tasolla.' : 'Silmän korkeutta ei ole vielä asetettu.'}`));
    }
  }
  function act(type: InvestigationAction['type'], rest: Pick<InvestigationAction, 'instrument' | 'amountUl' | 'sample'> = {}) {
    const action = investigationAction(task, `action-${++serial}`, type, rest), next = applyInvestigationInstrument(task, state, action);
    if (next === state) { status.textContent = 'Tämä vaihe ei vielä onnistu näillä ehdoilla. Tarkista väline, määrä ja järjestys.'; instrument.set(state.instrument); return; }
    actions.push(action); state = next; if (type === 'select') updateCatalog(); status.textContent = 'Käyttövaihe valmis. Kirjaa lukema yksikköineen.'; redraw(); onChange?.(read());
  }
  meniscus.input.addEventListener('change', () => { redraw(); onChange?.(read()); });
  instrument.input.addEventListener('change', () => { const selected = instrument.get(); if (selected) act('select', { instrument: selected }); });
  const controls = task.mode === 'tool' ? h('div', { style: row }, button('Ota annos välineeseen', () => {
    const q = investigationValue(amount.get(), 'volume');
    if (!q || q[0] <= 0n || q[0] % q[1]) { status.textContent = 'Anna positiivinen annos kokonaisina mikrolitroina.'; return; }
    act('aspirate', { amountUl: Number(q[0] / q[1]) });
  }), button('Siirrä annos vastaanottajaan', () => act('dispense', { amountUl: state.heldUl }))) : task.quantity === 'mass'
    ? h('div', { style: row }, button('Aseta tyhjä astia', () => act('empty-container')), button('Taaraa', () => act('tare')), button('Lisää näyte', () => act('load-sample')), button('Ota lukema', () => act('read')))
    : h('div', { style: row }, button('Aseta vesinäyte', () => act('load-sample'), 'Aseta näyte'), button('Aseta silmänkorkeus', () => act('eye-level'), 'Katse tasolle'), button('Ota lukema', () => act('read')));
  const reset = button('Aloita välinekoe uudelleen', () => { actions = []; state = initialInvestigationInstrument(task); instrument.set(null); updateCatalog(); redraw(); status.textContent = 'Uusi välinekoe alkaa samoilla annetuilla ehdoilla.'; onChange?.(read()); });
  catalog.append(reset);
  const node = h('div', { style: stack }, catalog, instrument.node, picture, ...(task.mode === 'tool' ? [amount.node] : []), controls,
    ...(task.mode === 'measure' && task.quantity === 'volume' ? [meniscus.node] : []), answer.node,
    status);
  redraw();
  return { node, read, show(response) {
    actions = [...response.actions]; state = initialInvestigationInstrument(task);
    for (const action of actions) state = applyInvestigationInstrument(task, state, action);
    instrument.set(state.instrument); updateCatalog(); answer.set(response.reading);
    if (response.mode === 'measure') meniscus.set(response.meniscus);
    redraw(); onChange?.(read());
  } };
}
function observationWork(task: Task<'observe'>): Work<'observe'> {
  const fields = task.cards.map(card => ({ card, control: select<'observation' | 'inference'>(card.text, [['observation', 'Havainto'], ['inference', 'Tulkinta']], card.text) }));
  const evidence = select<string>('Hyödyllinen lisänäyttö', [['analyse-gas', 'Kaasun erillinen virtuaalinen analyysi'], ['analyse-sample', 'Näytteen erillinen virtuaalinen analyysi'],
    ['compare-control', 'Kontrollinäytteen ja olosuhteiden vertailu'], ['pretty-name', 'Pelkkä houkuttelevan nimen valinta']], 'Lisänäyttö');
  return { node: h('div', { style: stack }, ...fields.map(f => f.control.node), evidence.node),
    read: () => ({ kind, mode: 'observe', categories: Object.fromEntries(fields.map(f => [f.card.id, f.control.get()])), extraEvidence: evidence.get() }),
    show(answer) { fields.forEach(f => f.control.set(answer.categories[f.card.id] ?? null)); evidence.set(answer.extraEvidence); } };
}
function designWork(task: Task<'design'>): Work<'design'> {
  const variable = select<'solvent' | 'temperature'>('Vaihteleva tekijä', [['solvent', 'Liuotin'], ['temperature', 'Lämpötila']], 'Mikä muuttuu?');
  const response = select<'dissolved-mass'>('Havaittava vaste', [['dissolved-mass', 'Liuennut massa']], 'Mitä havaitaan?');
  const controls = task.controls.map(control => ({ control, field: check(`Pidä samana · ${control.id}`, control.label) }));
  const repetitions = number('Toistojen määrä', 'Toistoja', 70), safe = check('Annettu virtuaalinen menettely', 'Käytän annettua virtuaalista menettelyä.');
  const node = h('div', { style: stack }, variable.node, response.node, ...(task.objective === 'plan' ? [
    h('div', { style: 'display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2px 8px' }, ...controls.map(c => c.field.node)), h('div', { style: row }, repetitions.node, safe.node),
  ] : []), note('Valmistellut osat auttavat oman kysymyksen tai suunnitelman muodostamista. Seuraavaksi tuotat sen itse aikuisen kuultavaksi tai luettavaksi.'));
  return { node, read: () => ({ kind, mode: 'design', variable: variable.get(), response: response.get(), controls: controls.filter(c => c.field.input.checked).map(c => c.control.id),
    repetitions: Number(repetitions.get()), safeProtocol: safe.input.checked }),
    show(answer) { variable.set(answer.variable); response.set(answer.response); controls.forEach(c => { c.field.input.checked = answer.controls.includes(c.control.id); }); repetitions.set(String(answer.repetitions)); safe.input.checked = answer.safeProtocol; } };
}
function conclusionWork(task: Task<'conclude'>): Work<'conclude'> {
  const cited = task.rows.map(s => ({ source: s, control: check(`Päätelmän havainto ${s.id}`, `${s.id} · ${s.massMg} mg`) }));
  const difference = number('Havainnon B ja A erotus', 'B − A', 92);
  const confidence = select<'supports' | 'inconclusive'>('Aineiston vastaus kysymykseen', [['supports', 'Rajattu vertailupäätelmä on mahdollinen'], ['inconclusive', 'Kysymys jää vielä ratkaisematta']], 'Päätelmän tila');
  const issues = task.rows.map(s => ({ source: s, control: check(`Epävarma havainto ${s.id}`, `${s.id} · tutkittava epävarma kohta`) }));
  const repair = select<Answer<'conclude'>['repair'] & string>('Perusteltu seuraava tutkimustoimi', [
    ['repeat-labelled', 'Tunnisteet kuntoon ja kyseisen näytteen uusinta'], ['control-temperature', 'Sama lämpötila ja rajattu uusinta'],
    ['recover-or-repeat', 'Hae alkuperäinen lukema tai mittaa uudelleen'], ['more-precise', 'Tarkempi vertailu ja lisää havaintoja'], ['keep-method', 'Säilytä toimiva menetelmä ja rajaus'],
  ], 'Seuraava toimi');
  const node = h('div', { style: stack }, ...(task.objective !== 'evaluate' ? [h('div', { style: row }, ...cited.map(c => c.control.node), difference.node, note('mg')), confidence.node] : []),
    ...(task.objective !== 'conclusion' ? [h('div', { style: row }, ...issues.map(c => c.control.node)), repair.node] : []),
    note('Tuota seuraavaksi oma perustelu. Aikuinen arvioi sen merkityksen erikseen.'));
  return { node, read: () => ({ kind, mode: 'conclude', citedRows: cited.filter(c => c.control.input.checked).map(c => c.source.id), difference: difference.get(), confidence: confidence.get(),
    issueRows: issues.filter(c => c.control.input.checked).map(c => c.source.id), repair: repair.get() }),
    show(answer) { cited.forEach(c => { c.control.input.checked = answer.citedRows.includes(c.source.id); }); difference.set(answer.difference); confidence.set(answer.confidence);
      issues.forEach(c => { c.control.input.checked = answer.issueRows.includes(c.source.id); }); repair.set(answer.repair); } };
}
function shortCondition(value: string) {
  return value === 'Annettu mallirasva' ? 'Mallirasva' : value === 'Nimetty malliliuotin' ? 'Malliliuotin' : value;
}
function dataWork(task: Task<'data'>): Work<'data'> {
  let serial = 0, actions: InvestigationAction[] = [];
  const observed = new Set(task.publicResults ? task.rows.map(s => s.id) : []);
  const source = h('div', { style: stack, 'data-inquiry-source': '' });
  const sourceIntroduction = note(`Jokaiseen kokeeseen ${task.rows[0]!.doseMg} mg nimettyä malliaineetta ja ${task.rows[0]!.solventMg} mg liuotinta. Annetun opetusmallin tulokset.`);
  const sourceChoices = task.rows.map(s => [s.sourceId, s.sourceId] as const);
  const conditions = [...new Set(task.rows.map(s => s.condition))].map(condition => [condition, shortCondition(condition)] as const);
  const records = task.rows.map(s => {
    const original = select(`Rivi ${s.id}, alkuperäinen tunniste`, sourceChoices), condition = select(`Rivi ${s.id}, olosuhde`, conditions);
    const value = number(`Rivi ${s.id}, mittausarvo`), unit = select<InvestigationUnit>(`Rivi ${s.id}, mittayksikkö`, quantityUnits('mass'));
    const missing = check(`Rivi ${s.id}, lukema puuttuu`, 'Puuttuu');
    original.input.style.cssText = `${controlStyle};width:84px;font-size:13px`;
    condition.input.style.cssText = `${controlStyle};width:112px;font-size:13px`;
    value.input.style.width = '70px'; unit.input.style.cssText = `${controlStyle};width:58px;font-size:13px`;
    missing.input.addEventListener('change', () => { value.input.disabled = missing.input.checked; unit.input.disabled = missing.input.checked; redraw(); });
    return { source: s, original, condition, value, unit, missing };
  });
  const ownTable = table(['Rivi', 'Alkuperä', 'Olo', 'Arvo', 'Yks.', 'Puuttuu'], records.map(f => [f.source.id, f.original.input, f.condition.input, f.value.input, f.unit.input,
    h('label', { style: 'display:flex;align-items:center;justify-content:center;min-width:44px;min-height:44px' }, f.missing.input)]), 'data-inquiry-own-table');
  const type = select<NonNullable<InvestigationChart['type']>>('Esitystapa', [['table', 'Taulukko'], ['bar', 'Pylväät'], ['line', 'Viiva'], ['scatter', 'Pisteet']], 'Esitys');
  const xLabel = select<NonNullable<InvestigationChart['xLabel']>>('Esityksen vaaka-akseli', [['sample', 'Näyte'], ['temperature', 'Lämpötila'], ['solvent', 'Liuotin']], 'Vaaka');
  const yLabel = select<'dissolved-mass'>('Esityksen pystyakseli', [['dissolved-mass', 'Liuennut massa']], 'Pysty');
  const chartUnit = select<InvestigationUnit>('Esityksen yksikkö', quantityUnits('mass'), 'Yksikkö');
  const start = number('Asteikon alku', 'Alku', 62), top = number('Asteikon loppu', 'Loppu', 62), step = number('Asteikon jakoväli', 'Jakoväli', 62);
  const chartValues = task.rows.map(s => ({ source: s, value: number(`Esityksen arvo ${s.id}`, s.id, 62), missing: check(`Esityksen arvo ${s.id} puuttuu`, '?') }));
  const linkRow = select('Esityksen osoitettu rivi', task.rows.map(s => [s.id, s.id]), 'Esityksen kohta'), linkSource = select('Osoitetun arvon alkuperä', sourceChoices, 'Alkuperä');
  const picture = h('div', { 'data-inquiry-chart': '' });
  const previewPanel = h('div', { style: `${stack};display:none`, 'data-inquiry-data-phase': 'preview' }, picture);
  function readTable() {
    return records.map(f => ({ rowId: f.source.id, sourceId: f.original.get() ?? '', condition: f.condition.get() ?? '',
      reading: f.missing.input.checked ? null : { value: f.value.get(), unit: f.unit.get() } }));
  }
  function chart(): InvestigationChart {
    const tableValues = Object.fromEntries(records.map(f => {
      if (f.missing.input.checked) return [f.source.id, null];
      const q = investigationValue({ value: f.value.get(), unit: f.unit.get() }, 'mass');
      const factor = chartUnit.get() === 'g' ? 1000 : 1;
      return [f.source.id, q ? `${q[0]}/${q[1] * BigInt(factor)}` : ''];
    }));
    return { type: type.get(), xLabel: xLabel.get(), yLabel: yLabel.get(), unit: chartUnit.get(), start: start.get(), top: top.get(), step: step.get(),
      values: type.get() === 'table' ? tableValues : Object.fromEntries(chartValues.map(f => [f.source.id, f.missing.input.checked ? null : f.value.get()])) };
  }
  const numeric = (value: string) => { const q = investigationNumber(value); return q ? Number(q[0]) / Number(q[1]) : NaN; };
  function redraw() {
    const own = chart();
    if (own.type === 'table') {
      picture.replaceChildren(table(['Rivi', 'Alkuperä', 'Olo', 'Liuennut massa'], readTable().map(entry => [entry.rowId, entry.sourceId, entry.condition,
        entry.reading ? `${entry.reading.value} ${entry.reading.unit ? investigationUnitLabels[entry.reading.unit] : '—'}` : 'Puuttuu']), 'data-inquiry-own-presentation'));
      return;
    }
    const low = numeric(own.start), high = numeric(own.top), division = numeric(own.step), ticks = Math.round((high - low) / division);
    if (!own.type || !Number.isFinite(low + high + division) || high <= low || division <= 0 || ticks < 1 || ticks > 24) {
      picture.replaceChildren(note('Valitse esitys ja oma luettava asteikko, enintään 24 merkkiväliä.')); return;
    }
    const plot = svg('svg', { viewBox: '0 0 430 175', role: 'img', 'aria-label': 'Oma alkuperäisiin havaintoihin sidottu esitys', style: 'display:block;width:100%;max-height:200px;background:#f9f8ec;border-radius:7px' });
    const left = 49, right = 409, upper = 15, bottom = 131;
    const y = (n: number) => bottom - (n - low) / (high - low) * (bottom - upper);
    const sorted = own.type === 'bar' ? [...task.rows] : [...task.rows].sort((a, b) => (a.x ?? 0) - (b.x ?? 0));
    const xs = task.rows.map(s => s.x ?? 0), minX = Math.min(...xs), maxX = Math.max(...xs);
    const x = (s: typeof task.rows[number], i: number) => own.type === 'bar' ? left + (i + .5) * (right - left) / sorted.length : left + 20 + ((s.x ?? 0) - minX) / Math.max(1, maxX - minX) * (right - left - 40);
    const labelEvery = Math.max(1, Math.ceil(ticks / 4));
    for (let n = 0; n <= ticks; n++) {
      const tick = low + n * division, yy = y(tick);
      plot.append(svg('line', { x1: left, x2: right, y1: yy, y2: yy, stroke: '#c8d9ca', 'stroke-width': .8 }));
      if (n % labelEvery === 0 || n === ticks) plot.append(text(26, yy + 4, String(Number(tick.toFixed(6))).replace('.', ','), 13));
    }
    plot.append(svg('path', { d: `M ${left} ${upper} V ${bottom} H ${right}`, fill: 'none', stroke: '#2d5d4b', 'stroke-width': 1.8 }));
    let previous: { x: number; y: number } | undefined;
    sorted.forEach((s, i) => {
      const xx = x(s, i), raw = own.values[s.id], value = raw === null || raw === undefined ? NaN : numeric(raw), yy = y(value);
      plot.append(text(xx, 149, own.xLabel === 'sample' ? s.id : shortCondition(s.condition), 12));
      if (!Number.isFinite(value) || value < low || value > high) { previous = undefined; plot.append(text(xx, 113, raw === null ? '?' : '·', 16)); return; }
      if (own.type === 'bar') { plot.append(svg('rect', { x: xx - 23, y: Math.min(yy, y(0)), width: 46, height: Math.abs(y(0) - yy), fill: '#72a98a', stroke: '#396b52', 'stroke-width': 1.2 })); if (value === 0) plot.append(svg('circle', { cx: xx, cy: y(0), r: 3, fill: '#396b52' })); }
      else {
        if (own.type === 'line' && previous) plot.append(svg('line', { x1: previous.x, x2: xx, y1: previous.y, y2: yy, stroke: '#43876e', 'stroke-width': 2 }));
        plot.append(svg('circle', { cx: xx, cy: yy, r: 5, fill: '#cf9a4f', stroke: '#4f6144', 'stroke-width': 1.2 })); previous = { x: xx, y: yy };
      }
    });
    plot.append(text(226, 171, `${own.xLabel === 'temperature' ? 'Lämpötila °C' : own.xLabel === 'solvent' ? 'Liuotin' : 'Näyte'} · Liuennut massa ${own.unit ? investigationUnitLabels[own.unit] : '—'}`, 13));
    picture.replaceChildren(plot, ...(own.type === 'line' ? [note('Viiva yhdistää mitatut vierekkäiset pisteet. Puuttuva lukema katkaisee viivan.')] : []));
  }
  function drawSource() {
    source.replaceChildren(sourceIntroduction,
      table(['Näyte / mittaus', 'Olosuhde', 'Liukeni mg', 'Jäännös mg'], task.rows.map(s => {
        const result = observed.has(s.id) ? investigationResult(s) : undefined;
        return [`${s.id} · ${s.sourceId}`, s.condition, result === undefined ? 'Koe tekemättä' : result === null ? 'Puuttuu' : String(result), result === undefined || result === null ? '—' : String(s.doseMg - result)];
      }), 'data-inquiry-original-log'), ...task.rows.filter(s => observed.has(s.id) && /Poikkeava|puuttuu/.test(s.note)).map(s => note(`${s.id} · ${s.note}`)));
  }
  const runs = h('div', { style: row }, ...task.rows.map(s => {
    const run = button(`Tee koe ${s.id}`, () => {
      if (observed.has(s.id)) return;
      actions.push(investigationAction(task, `run-${++serial}`, 'run', { sample: s.id })); observed.add(s.id); run.disabled = true; drawSource();
    }); return run;
  }));
  const collectPanel = h('div', { style: stack, 'data-inquiry-data-phase': 'record' }, ...(task.publicResults ? [] : [runs]),
    note('Oma aineisto. Yhdistä alkuperäinen mittaus oikeaan näyteriviin.'), ownTable);
  const quantities = h('div', { style: row }, ...chartValues.map(f => {
    f.missing.input.addEventListener('change', () => { f.value.input.disabled = f.missing.input.checked; redraw(); });
    return h('div', { style: row }, f.value.node, f.missing.node);
  }));
  const chartPanel = h('div', { style: `${stack};display:none`, 'data-inquiry-data-phase': 'chart' }, h('div', { style: 'display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 8px' }, type.node, chartUnit.node, xLabel.node, yLabel.node),
    h('div', { style: row }, start.node, top.node, step.node), quantities, note('? tarkoittaa puuttuvaa lukemaa. Nolla on havainto.'), ...(task.objective === 'both' ? [h('div', { style: row }, linkRow.node, linkSource.node)] : []));
  function view(which: 'record' | 'chart' | 'preview') {
    collectPanel.style.display = which === 'record' ? 'grid' : 'none';
    chartPanel.style.display = which === 'chart' ? 'grid' : 'none';
    previewPanel.style.display = which === 'preview' ? 'grid' : 'none';
    sourceIntroduction.style.display = which === 'record' ? '' : 'none'; redraw();
  }
  const tabs = h('div', { style: row }, button('1 · Oma aineisto', () => view('record')),
    button('2 · Oma esitys', () => view('chart')), button('Katso omaa kuvaa', () => view('preview')));
  for (const f of [...chartValues.map(c => c.value), start, top, step]) f.input.addEventListener('input', redraw);
  for (const f of [type, chartUnit, xLabel, yLabel]) f.input.addEventListener('change', redraw);
  drawSource(); redraw();
  return { node: h('div', { style: stack }, source, ...(task.objective === 'collect' ? [] : [tabs]), collectPanel, chartPanel, previewPanel), beforeSubmit() { if (task.objective !== 'collect') view('preview'); },
    read: () => ({ kind, mode: 'data', actions: [...actions], table: readTable(), chart: chart(), sourceLink: linkRow.get() && linkSource.get() ? { rowId: linkRow.get()!, sourceId: linkSource.get()! } : null }),
    show(answer) {
      actions = [...answer.actions]; observed.clear(); task.rows.forEach(s => observed.add(s.id));
      records.forEach(f => { const entry = answer.table.find(row => row.rowId === f.source.id)!; f.original.set(entry.sourceId); f.condition.set(entry.condition);
        f.missing.input.checked = entry.reading === null; f.value.set(entry.reading?.value ?? ''); f.unit.set(entry.reading?.unit ?? null); });
      type.set(answer.chart.type); chartUnit.set(answer.chart.unit); xLabel.set(answer.chart.xLabel); yLabel.set(answer.chart.yLabel); start.set(answer.chart.start); top.set(answer.chart.top); step.set(answer.chart.step);
      chartValues.forEach(f => { f.missing.input.checked = answer.chart.values[f.source.id] === null; f.value.set(answer.chart.values[f.source.id] ?? ''); });
      linkRow.set(answer.sourceLink?.rowId ?? null); linkSource.set(answer.sourceLink?.sourceId ?? null); drawSource(); redraw();
    } };
}
export function mountChemicalInvestigation(task: ChemicalInvestigationTask, host: HTMLElement,
  submit: (answer: ChemicalInvestigationResponse) => void, onChange?: (answer: ChemicalInvestigationResponse) => void): { reveal(): void } {
  function mount<M extends Mode>(work: Work<M>) {
    const done = h('button', { type: 'submit', class: 'btn primary', style: 'min-height:44px;min-width:44px', 'data-inquiry-submit': '' }, 'review' in task ? 'Siirry omaan tuotokseen' : 'Tarkista tutkimus');
    const form = h('form', { style: stack, 'data-inquiry-workbench': task.mode }, work.node, done);
    const reviewHost = h('div', { style: stack });
    let frozen = false, adult: ReturnType<typeof mountObservedExplanation> | undefined;
    const freeze = () => {
      frozen = true;
      for (const control of form.querySelectorAll('button,input,select,textarea')) control.setAttribute('disabled', '');
    };
    form.addEventListener('submit', event => {
      event.preventDefault(); if (frozen) return;
      work.beforeSubmit?.(); const answer = work.read(); freeze();
      if (!('review' in task)) { submit(answer); return; }
      form.style.display = 'none';
      const area = h('div');
      const start = (channel: 'spoken' | 'written') => {
        area.replaceChildren();
        adult = mountObservedExplanation(investigationExplanation(task.review, channel), area, observation => {
          submit({ ...answer, review: { channel, observations: observation.observations,
            confirmedByAdult: observation.confirmedByAdult, assistance: observation.assistance } } as ChemicalInvestigationResponse);
        });
        for (const control of area.querySelectorAll<HTMLElement>('button,select,input:not([type="checkbox"])')) control.style.minHeight = '44px';
        const confirmation = area.querySelector('input[type=checkbox]')?.closest('label');
        if (confirmation) confirmation.style.minHeight = '44px';
      };
      reviewHost.replaceChildren(note(task.review.prompt), h('div', { style: row }, button('Kerron omin sanoin', () => start('spoken')),
        button('Kirjoitan tähän', () => start('written'))), note('Oma puhe tai teksti on tässä hetkessä. Laitteelle jäävät kanava, aikuisen arvio ja tieto avusta.'), area);
      start('spoken');
    });
    host.replaceChildren(form, reviewHost);
    return { reveal() {
      if (adult) { adult.reveal(); return; }
      work.show(solutionChemicalInvestigation(task) as Answer<M>); freeze();
      form.append(note('Mallitoiminta ja mallimerkinnät. Oma näyttö syntyy uudessa tehtävässä oppijan toiminnasta.'), ...('review' in task ? [note(`Malliselitys. ${task.review.model}`)] : []));
    } };
  }
  switch (task.mode) {
    case 'tool': return mount(instrumentWork(task, onChange));
    case 'measure': return mount(instrumentWork(task, onChange));
    case 'observe': return mount(observationWork(task));
    case 'design': return mount(designWork(task));
    case 'data': return mount(dataWork(task));
    case 'conclude': return mount(conclusionWork(task));
  }
}
export function chemicalInvestigationExample(task: ChemicalInvestigationTask): Paint {
  return host => {
    const givens = h('div'), work = h('div'); chemicalInvestigationBoard(task)(givens);
    mountChemicalInvestigation(task, work, () => {}).reveal();
    work.querySelector('[data-inquiry-submit]')?.remove(); host.replaceChildren(givens, work);
  };
}
