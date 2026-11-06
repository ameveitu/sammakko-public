import type { Paint } from '../../engine/types';
import { h } from '../../ui/dom';
import { mountObservedExplanation } from './observed-explanations';
import { cycleAmount, cycleProcessNames, initialCycleLedger, replayCycleMoves, solutionMatterCycles, type CycleAssignment, type CycleEdge, type CycleLedger, type CycleMove, type CycleReservoir, type MatterCyclesResponse, type MatterCyclesTask, type ReservoirCard } from '../models/matter-cycles';

const kind = 'matter-cycles' as const;
const stack = 'display:grid;gap:5px;min-width:0';
const row = 'display:flex;align-items:center;gap:5px;flex-wrap:wrap;min-width:0';
const small = 'margin:0;font-size:13px;line-height:1.25;color:#284e45';
const panel = `${stack};padding:6px 8px;background:#edf3e7;border:1px solid #a7beaf;border-radius:9px`;
const control = 'min-height:44px;box-sizing:border-box;min-width:0;padding:5px 7px;font:inherit;font-size:14px;color:#23473e;background:#fffef6;border:1px solid #8ba79a;border-radius:9px';
const note = (text: string) => h('p', { style: small }, text);
const button = (name: string, onclick: () => void, nav = false) => h('button', { type: 'button', class: 'btn small', style: 'min-height:44px', onclick, ...(nav ? { 'data-cycle-navigation': '' } : {}) }, name);
function menu(label: string, options: readonly (readonly [string, string])[]) {
  return h('select', { 'aria-label': label, style: `${control};flex:1;width:0;min-width:95px` }, h('option', { value: '' }, 'Valitse'), ...options.map(([value, name]) => h('option', { value }, name)));
}
function number(label: string, signed = false) {
  const input = h('input', { type: 'text', inputmode: signed ? 'text' : 'numeric', maxlength: 8, 'aria-label': label, style: `${control};width:85px` });
  const read = () => {
    const text = input.value.trim().replaceAll('−', '-');
    return (signed ? /^-?\d{1,7}$/ : /^\d{1,7}$/).test(text) && Math.abs(Number(text)) <= 1000000 ? Number(text) : null;
  };
  input.addEventListener('blur', () => { if (read() === null) input.value = ''; });
  return { input, read };
}
function shortReservoir(reservoir: CycleReservoir): string {
  const names: Partial<Record<CycleReservoir['kind'], string>> = { air: 'Ilma', plant: 'Kasvi / tuore aines', animal: 'Eläimet', soil: 'Kuollut aines', water: 'Vesistö', geological: 'Geologinen varasto', sea: 'Meri', vapor: 'Vesihöyry', cloud: 'Pilvi', snow: 'Lumi', river: 'Puro', groundwater: 'Pohjavesi' };
  return names[reservoir.kind] ?? reservoir.label;
}
function diagram(reservoirs: readonly CycleReservoir[], edges: readonly CycleEdge[], at: readonly string[] = []): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 330 125'); svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', reservoirs.map(r => `${r.id} ${r.label}`).join(', ') + '. Omat nuolet ' + edges.map(e => `${e.process}: ${e.from} → ${e.to}`).join(', '));
  svg.style.cssText = 'width:100%;height:135px;display:block;background:#f8f8e9;border-radius:8px';
  reservoirs = reservoirs.map(r => ({ ...r, y: r.y * .55 + 14 }));
  const draw = (tag: string, attributes: Record<string, string | number>, text?: string) => { const element = document.createElementNS(svg.namespaceURI, tag); for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value)); if (text) element.textContent = text; svg.append(element); };
  for (const edge of edges) {
    const a = reservoirs.find(r => r.id === edge.from), b = reservoirs.find(r => r.id === edge.to); if (!a || !b) continue;
    const dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy); if (!length) { draw('circle', { cx: a.x + 12, cy: a.y - 10, r: 9, fill: 'none', stroke: '#9e8e52' }); continue; }
    const x = b.x - dx / length * 13, y = b.y - dy / length * 13;
    draw('line', { x1: a.x, y1: a.y, x2: x, y2: y, stroke: '#7f9c86', 'stroke-width': 2 });
    draw('path', { d: `M ${x} ${y} L ${x - dx / length * 8 - dy / length * 4} ${y - dy / length * 8 + dx / length * 4} L ${x - dx / length * 8 + dy / length * 4} ${y - dy / length * 8 - dx / length * 4} Z`, fill: '#557f69' });
  }
  for (const reservoir of reservoirs) {
    draw('circle', { cx: reservoir.x, cy: reservoir.y, r: at.includes(reservoir.id) ? 11 : 7, fill: at.includes(reservoir.id) ? '#84b1b5' : '#e2e9ce', stroke: '#446b59' });
    const anchor = reservoir.x < 60 ? 'start' : reservoir.x > 265 ? 'end' : 'middle';
    draw('text', { x: reservoir.x, y: Math.max(12, reservoir.y - 13), 'text-anchor': anchor, fill: '#24493e', 'font-size': 12 }, shortReservoir(reservoir));
  }
  return svg;
}
function ledgerView(task: Extract<MatterCyclesTask, { mode: 'conservation' | 'carbon-network' | 'water-path' }>, ledger: CycleLedger) {
  const unit = task.mode === 'carbon-network' ? 'mg C' : 'mg';
  return h('table', { 'data-cycle-ledger': '', style: 'width:100%;border-collapse:collapse;font-size:12px' }, h('thead', {}, h('tr', {}, h('th', { style: 'text-align:left' }, 'Varasto'), h('th', {}, unit), h('th', {}, 'Muoto'))),
    h('tbody', {}, ...task.reservoirs.map(reservoir => h('tr', { 'data-reservoir': reservoir.id }, h('td', { title: reservoir.label }, task.mode === 'conservation' ? reservoir.label : shortReservoir(reservoir)), h('td', { style: 'text-align:center', 'data-cycle-mass': '' }, String(cycleAmount(ledger, reservoir.id))), h('td', {}, [...new Set(ledger.parcels.filter(p => p.reservoir === reservoir.id).map(p => ({ liquid: 'neste', gas: 'kaasu', solid: 'kiinteä', solution: 'liuoksessa', 'organic-carbon': 'orgaaninen C', 'inorganic-carbon': 'CO₂:n C' }[p.form])))].join(', ') || '—')))));
}
interface Work { node: HTMLElement; read(): MatterCyclesResponse; ready?(): boolean }
function assignmentEditor(cards: readonly ReservoirCard[], reservoirs: readonly CycleReservoir[], changed: () => void) {
  const values = new Map<string, string | null>(), current = menu('Tarkasteltava näytekortti', cards.map(card => [card.id, `${card.id} · ${card.label}`]));
  const select = menu('Näytteen oma hiilivarasto', [['none', 'Ei hiilivarastoa'], ...reservoirs.map(r => [r.id, r.label] as const)]);
  const given = note(''), summary = h('div'); current.value = cards[0]!.id; current.style.width = '100%'; current.setAttribute('data-cycle-navigation', '');
  const paint = () => {
    const card = cards.find(card => card.id === current.value)!;
    given.textContent = `${card.label} · ${Object.entries(card.formula).map(([element, n]) => `${element}×${n}`).join(' ') || 'Prosessikortti'} · ${card.carbonMg} mg C. ${card.description}`;
    select.setAttribute('aria-label', `${card.id} hiilivarasto`); select.value = values.has(card.id) ? values.get(card.id) === null ? 'none' : values.get(card.id)! : '';
    summary.replaceChildren(h('table', { style: 'width:100%;font-size:12px', 'data-cycle-card-table': '' }, h('thead', {}, h('tr', {}, h('th', {}, 'Kortti / koostumus'), h('th', {}, 'mg C'), h('th', {}, 'Oma varasto'))), h('tbody', {}, ...cards.map(card => h('tr', { 'data-cycle-card': card.id },
      h('td', {}, `${card.id} · ${Object.entries(card.formula).map(([element, n]) => `${element}×${n}`).join(' ') || 'prosessi'}`), h('td', { 'data-card-carbon': '' }, String(card.carbonMg)), h('td', {}, !values.has(card.id) ? '?' : values.get(card.id) === null ? 'Ei hiilivarasto' : reservoirs.find(r => r.id === values.get(card.id))?.label ?? '?'))))));
  };
  current.addEventListener('change', () => { if (!current.value) current.value = cards[0]!.id; current.style.width = '100%'; current.setAttribute('data-cycle-navigation', ''); paint(); });
  select.addEventListener('change', () => { values.set(current.value, select.value === 'none' ? null : select.value); paint(); changed(); });
  paint();
  const cardArea = h('div', { style: stack }, current, h('div', { style: panel, 'data-cycle-card-given': '' }, given), h('label', { style: row }, 'Oma sijoitus', select));
  let showingTable = false; summary.style.display = 'none';
  const toggle = button('Katso oma sijoitustaulukko', () => { showingTable = !showingTable; cardArea.style.display = showingTable ? 'none' : 'grid'; summary.style.display = showingTable ? 'block' : 'none'; toggle.textContent = showingTable ? 'Palaa näytekorttiin' : 'Katso oma sijoitustaulukko'; }, true);
  return { node: h('div', { style: stack }, cardArea, summary, toggle), read: (): CycleAssignment[] => cards.map(card => ({ card: card.id, reservoir: values.has(card.id) ? values.get(card.id)! : '' })) };
}
function edgeEditor(task: Extract<MatterCyclesTask, { mode: 'water-path' | 'carbon-network' }>, changed: () => void) {
  const values = new Map<string, CycleEdge>();
  if (task.mode === 'carbon-network') for (const edge of task.proposal ?? []) values.set(edge.process, { ...edge });
  const options = task.reservoirs.map(r => [r.id, r.label] as const), process = menu('Tarkasteltava prosessi', task.processes.map(p => [p.id, `${p.id} · ${p.label}`]));
  const from = menu('Prosessin lähtövarasto', options), to = menu('Prosessin tulovarasto', options), description = note(''), picture = h('div'), count = note('');
  let current = task.processes[0]!.id; process.value = current; process.setAttribute('data-cycle-navigation', '');
  const read = () => task.processes.map(p => values.get(p.id) ?? { process: p.id, from: '', to: '' });
  const paint = () => { picture.replaceChildren(diagram(task.reservoirs, read())); count.textContent = `Omat nimetyt suunnat ${read().filter(e => e.from && e.to).length}/${task.processes.length}.`; };
  const show = () => { const card = task.processes.find(p => p.id === current)!; description.textContent = `${card.description} Annettu määrä ${card.amountMg} ${task.mode === 'carbon-network' ? 'mg C' : 'mg vettä'}. ${card.timescale}`; const own = values.get(current); from.value = own?.from ?? ''; to.value = own?.to ?? ''; paint(); };
  process.addEventListener('change', () => { current = process.value || task.processes[0]!.id; show(); });
  for (const field of [from, to]) field.addEventListener('change', () => { values.set(current, { process: current, from: from.value, to: to.value }); paint(); changed(); });
  show();
  return { node: h('div', { style: stack }, picture, h('label', { style: row }, 'Prosessi', process), h('div', { style: panel }, description), h('div', { style: row }, from, to), count), read };
}
function conservationWork(task: Extract<MatterCyclesTask, { mode: 'conservation' }>, changed: () => void): Work {
  const predicted = number('Ennustettu koko kammion massa milligrammoina'), total = number('Havaittu koko kammion massa milligrammoina'), targetMass = number('Vastaanottavan varaston massa milligrammoina');
  const energy = menu('Onko energia tämän massakirjan ainetta?', [['yes', 'On ainetta'], ['no', 'Ei ole ainetta']]);
  const from = menu('Siirron lähtövarasto', task.reservoirs.map(r => [r.id, r.label])), to = menu('Siirron tulovarasto', task.reservoirs.map(r => [r.id, r.label])), amount = number('Oma siirrettävä massa milligrammoina');
  const moves: CycleMove[] = [], picture = h('div'), account = h('div'), status = note(''), operationArea = h('div', { style: stack }), finalArea = h('div', { style: stack }), lockedSummary = note('');
  let locked = false, invalid = false, accounting = false;
  const render = () => { const replay = replayCycleMoves(task, moves); picture.replaceChildren(diagram(task.reservoirs, moves.map(m => ({ process: m.process, from: m.from, to: m.to })), replay.ledger.parcels.filter(p => p.amountMg > 0).map(p => p.reservoir))); account.replaceChildren(ledgerView(task, replay.ledger)); };
  const move = button('Toteuta oma aineensiirto', () => {
    const value = amount.read(); if (value === null || !from.value || !to.value || invalid) return;
    moves.push({ run: task.run, id: `step-${moves.length + 1}`, process: task.operation.id, from: from.value, to: to.value, amountMg: value });
    invalid = !replayCycleMoves(task, moves).valid; move.disabled = invalid;
    status.textContent = invalid ? 'Malli ei toteuttanut tätä siirtoa. Säilytä havainto ja tarkista oma vastauksesi.' : 'Oma siirto on toteutettu. Kaikki varastot ovat edelleen mukana.';
    render(); changed();
  });
  const finish = button('Kirjaa oma massatili', () => { if (!moves.length) return; accounting = true; operationArea.style.display = 'none'; finalArea.style.display = 'grid'; changed(); }, true);
  operationArea.append(note(task.operation.description), h('div', { style: row }, from, to), h('div', { style: row }, amount.input, move), status, finish); operationArea.style.display = 'none';
  const back = button('Katso omaa siirtoa', () => { accounting = false; operationArea.style.display = 'grid'; finalArea.style.display = 'none'; changed(); }, true);
  finalArea.append(note(`Kirjaa ${task.reservoirs.find(r => r.id === task.target)!.label} ja koko suljettu kammio.`), h('div', { style: row }, h('label', { style: row }, 'Koko kammio / mg', total.input), h('label', { style: row }, 'Vastaanottaja / mg', targetMass.input)), h('label', { style: row }, 'Energia aineena?', energy), back); finalArea.style.display = 'none';
  const predictionArea = h('div', { style: stack }, h('label', { style: row }, 'Oma ennuste · koko kammio / mg', predicted.input));
  const lock = button('Lukitse massaennuste', () => { if (predicted.read() === null) return; locked = true; predicted.input.disabled = true; predictionArea.style.display = picture.style.display = 'none'; lockedSummary.textContent = `Lukittu oma massaennuste ${predicted.read()} mg.`; operationArea.style.display = 'grid'; changed(); });
  predictionArea.append(lock); render();
  return { node: h('div', { style: stack }, note('Suljettu kammio. Myös kaasu ja liuennut aine kuuluvat massakirjaan. Ääriviivamerkki osoittaa näkymättömän kaasun paikan.'), picture, account, lockedSummary, predictionArea, operationArea, finalArea), ready: () => accounting,
    read: () => ({ kind, mode: task.mode, predictedTotalMg: predicted.read(), locked, moves: moves.map(m => ({ ...m })), totalMg: total.read(), targetMg: targetMass.read(), energyIsMatter: energy.value ? energy.value === 'yes' : null }) };
}
function photoPicture(task: Extract<MatterCyclesTask, { mode: 'photosynthesis' }>, response: Extract<MatterCyclesResponse, { mode: 'photosynthesis' }>, observed: boolean): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', '0 0 330 95'); svg.setAttribute('role', 'img'); svg.setAttribute('data-cycle-photo-picture', observed ? 'observation' : 'own');
  svg.setAttribute('aria-label', `${observed ? 'Mallihavainto' : 'Oma roolimalli'} · ${response.roles.map(r => `${r.card} ${r.role ?? 'ei vielä roolia'}`).join(', ')}`); svg.style.cssText = 'width:100%;height:95px;display:block;background:#f5f6e8;border-radius:9px';
  const draw = (tag: string, attributes: Record<string, string | number>, text?: string) => { const element = document.createElementNS(svg.namespaceURI, tag); for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value)); if (text) element.textContent = text; svg.append(element); };
  draw('path', { d: 'M 165 73 Q 130 45 165 16 Q 199 45 165 73 Z', fill: '#85a781', stroke: '#527b5a' }); draw('path', { d: 'M165 73 L165 27', stroke: '#4a7050', fill: 'none' });
  draw('text', { x: 165, y: 87, 'text-anchor': 'middle', 'font-size': 11, fill: '#274b3d' }, observed ? 'Mallihavainto' : 'Omat roolit');
  const names = { water: 'H₂O', co2: 'CO₂', organic: 'Orgaaninen aine', oxygen: 'O₂', light: 'Valo', soil: 'Kivennäiset' };
  task.cards.forEach((card, i) => {
    const x = i < 3 ? 53 : 278, y = 14 + i % 3 * 28, role = response.roles.find(r => r.card === card.id)?.role;
    if (role === 'input' || role === 'output' || role === 'energy') {
      const inward = role !== 'output', from = inward ? x : 165, to = inward ? 165 : x;
      draw('line', { x1: from, y1: inward ? y : 45, x2: to, y2: inward ? 45 : y, stroke: role === 'energy' ? '#aa8c42' : '#6b9295', 'stroke-width': response.trace.includes(card.id) ? 3 : 1.5, 'stroke-dasharray': role === 'energy' ? '4 3' : '0' });
      const dx = to - from, dy = (inward ? 45 : y) - (inward ? y : 45), length = Math.hypot(dx, dy), endX = to - dx / length * (inward ? 22 : 37), endY = (inward ? 45 : y) - dy / length * (inward ? 22 : 37);
      draw('path', { d: `M${endX},${endY} l${-dx / length * 6 - dy / length * 3},${-dy / length * 6 + dx / length * 3} l${dy / length * 6},${-dx / length * 6} Z`, fill: '#557e72' });
    }
    draw('rect', { x: x - 49, y: y - 10, width: 98, height: 21, rx: 5, fill: '#f8edcf', stroke: '#afad88' });
    draw('text', { x, y: y + 4, 'text-anchor': 'middle', 'font-size': 11, fill: '#274b3d' }, `${card.id} · ${names[card.material]}`);
  });
  return svg;
}
function photoWork(task: Extract<MatterCyclesTask, { mode: 'photosynthesis' }>, changed: () => void): Work {
  let tracing = false, locked = false, observed = false;
  const topNote = note('Yhteyttämisessä vesi ja hiilidioksidi ovat lähtöaineita, valo tuo energiaa. Malliin muodostuu orgaanista ainetta ja vapautuu happea.'), picture = h('div');
  const roleOptions = [['input', 'Lähtöaine'], ['output', 'Tuote'], ['energy', 'Energia'], ['not-main-carbon-source', 'Ei tämän mallin hiilen lähde']] as const;
  const roles = task.cards.map(card => ({ card, select: menu(`${card.id} tehtävä yhteyttämisessä`, roleOptions) }));
  const rolesArea = h('div', { style: stack }, ...roles.map(({ card, select }) => h('div', { style: row }, h('span', { style: 'flex:1;font-size:12px' }, h('strong', {}, `${card.id} · ${card.label}`), h('small', { style: 'display:block' }, card.description)), select)));
  const traceOptions = [...task.cards.map(c => [c.id, `${c.id} · ${c.material === 'co2' ? 'CO₂' : c.material === 'organic' ? 'orgaaninen aine' : c.material === 'water' ? 'vesi' : c.material === 'oxygen' ? 'O₂' : c.material === 'light' ? 'valo' : 'kivennäiset'}`] as const), [task.plant, task.medium === 'aquatic' ? 'Vesikasvi' : 'Lehti'] as const];
  const trace = [menu('Hiilen lähtökortti', traceOptions), menu('Hiilen reitin eliö', traceOptions), menu('Hiilen tulokortti', traceOptions)];
  const day = number('Valomallin orgaaniseen aineeseen siirtyvä hiili milligrammoina'), dark = number('Pimeän yhteyttämisen hiili milligrammoina');
  const reject = menu('Korjattava ainekorin kortti', task.cards.map(c => [c.id, c.label])), observation = note(''), summary = note(''), fields = h('div', { style: stack }), conditions = note(task.conditions);
  const read = (): Extract<MatterCyclesResponse, { mode: 'photosynthesis' }> => ({ kind, mode: task.mode, roles: roles.map(({ card, select }) => ({ card: card.id, role: (select.value || null) as 'input' | 'output' | 'energy' | 'not-main-carbon-source' | null })), trace: trace.map(f => f.value), dayCarbonMg: day.read(), darkPhotoCarbonMg: dark.read(), locked, observed, rejectedCard: task.variant === 'repair-energy-as-matter' ? reject.value || null : null });
  const paint = () => {
    // An observed model is displayed only after the original predictions are locked.
    // It never replaces any learner field or supplies an observation of free speech.
    const observing = observed && tracing, model = observing ? solutionMatterCycles(task) as Extract<MatterCyclesResponse, { mode: 'photosynthesis' }> : read();
    picture.replaceChildren(photoPicture(task, model, observing)); picture.style.display = !tracing || locked ? 'block' : 'none'; topNote.style.display = locked ? 'none' : 'block';
  };
  const run = button('Aja valo- ja pimeämalli', () => { observed = true; run.disabled = true; observation.textContent = `Havainto · valossa orgaaniseen aineeseen ${task.carbonMg} mg C. Pimeän yhteyttämisessä 0 mg C. Hengitys on erillinen prosessi.`; paint(); changed(); }); run.style.display = 'none';
  const lock = button('Lukitse hiilireitti ja ennusteet', () => {
    if (day.read() === null || dark.read() === null || trace.some(f => !f.value)) return;
    locked = true; lock.disabled = true; for (const f of [...trace, day.input, dark.input, reject, ...roles.map(r => r.select)]) f.disabled = true;
    summary.textContent = `Lukittu oma ennuste · ${trace.map(f => f.selectedOptions[0]?.textContent ?? '?').join(' → ')}. Valo ${day.read()} mg C, pimeä ${dark.read()} mg C.`;
    fields.style.display = 'none'; conditions.textContent = `Sama ${task.carbonMg} mg CO₂-hiilen malliannos valossa ja pimeässä. Hengitys on erillinen prosessi.`; run.style.display = 'block'; paint(); changed();
  });
  fields.append(note('Oma hiilireitti · lähtö → yhteyttävä eliö → tulo'), h('div', { style: row }, ...trace), h('div', { style: row }, h('label', { style: row }, 'Valossa / mg C', day.input), h('label', { style: row }, 'Pimeässä / mg C', dark.input)),
    ...(task.variant === 'repair-energy-as-matter' ? [note('Loikka sijoitti valon aineiden koriin. Osoita korjattava kortti.'), h('label', { style: row }, 'Korjattava kortti', reject)] : []), lock);
  const traceArea = h('div', { style: stack }, conditions, fields, summary, run, observation); traceArea.style.display = 'none';
  const toggle = button('Jatka hiilen jäljitykseen', () => { tracing = !tracing; rolesArea.style.display = tracing ? 'none' : 'grid'; traceArea.style.display = tracing ? 'grid' : 'none'; toggle.textContent = tracing ? 'Katso omat aineroolit' : 'Jatka hiilen jäljitykseen'; paint(); changed(); }, true);
  for (const field of [...roles.map(r => r.select), ...trace]) field.addEventListener('change', paint);
  paint();
  return { node: h('div', { style: stack }, topNote, picture, rolesArea, toggle, traceArea), ready: () => observed, read };
}
function reservoirWork(task: Extract<MatterCyclesTask, { mode: 'reservoirs' }>, changed: () => void): Work {
  const editor = assignmentEditor(task.cards, task.reservoirs, changed), total = number('Näytteiden hiilen kokonaismassa milligrammoina');
  return { node: h('div', { style: stack }, note('Etsi C koostumuksesta. Kortin mg C tarkoittaa vain hiilen osuutta. Puhtaan veden kortti ja prosessikortti erotetaan hiilivarastokorteista.'), editor.node, h('label', { style: row }, 'Kaikki seurattu hiili / mg C', total.input)), read: () => ({ kind, mode: task.mode, assignments: editor.read(), totalCarbonMg: total.read() }) };
}
function flowWork(task: Extract<MatterCyclesTask, { mode: 'water-path' | 'carbon-network' }>, changed: () => void): Work {
  let phase: 'assign' | 'edges' | 'route' | 'forecast' | 'operate' = task.mode === 'carbon-network' && task.cards ? 'assign' : 'edges';
  let locked = false, invalid = false;
  const moves: CycleMove[] = [], editor = edgeEditor(task, changed);
  const assignments = task.mode === 'carbon-network' && task.cards ? assignmentEditor(task.cards, task.reservoirs, changed) : undefined;
  const phaseArea = h('div', { style: stack }), source = h('div'), status = note('');
  const cloud = menu('Pilven veden muoto', [['droplets-or-ice', 'Pisaroita tai jääkiteitä'], ['vapor', 'Näkymätöntä vesihöyryä']]);
  const storedAt = menu('Reitillä vaadittu viipymävarasto', [['none', 'Ei erillistä vaadittua viipymää'], ...task.reservoirs.map(r => [r.id, r.label] as const)]);
  const energy = menu('Mitä palamisen energianuoli siirtää?', [['energy', 'Energiaa'], ['carbon', 'Hiiliainetta']]);
  const delta = number('Oma ennuste fokusvaraston hiilen muutoksesta milligrammoina', true), oldStore = menu('Pitkäaikainen polttoaineen lähtövarasto', task.reservoirs.map(r => [r.id, r.label]));
  const route: string[] = [], routeView = note(''), routePoint = menu('Paluureitin seuraava varasto', task.reservoirs.map(r => [r.id, r.label]));
  const addPoint = button('Lisää reitille', () => { if (routePoint.value && route.length < 12) { route.push(routePoint.value); paintRoute(); } });
  const removePoint = button('Poista viimeinen', () => { route.pop(); paintRoute(); });
  function paintRoute() { routeView.textContent = `Oma paluureitti · ${route.map(id => task.reservoirs.find(r => r.id === id)!.label).join(' → ') || 'ei vielä pisteitä'}`; changed(); }
  const processChoice = menu('Toteutettava prosessi', task.processes.map(p => [p.id, `${p.id} · ${p.label}`])), amount = number('Oma siirrettävä määrä milligrammoina'), operationGiven = note('');
  const account = h('div'), location = note('');
  const operation = h('div', { style: stack });
  const sourceTable = () => h('div', { style: stack }, note(task.reservoirs.map((r, i) => `${i + 1} ${shortReservoir(r)}`).join(' · ')), h('table', { style: 'width:100%;font-size:12px', 'data-cycle-process-table': '' }, h('thead', {}, h('tr', {}, h('th', {}, 'Oma prosessinuoli'), h('th', {}, task.mode === 'carbon-network' ? 'mg C' : 'mg'))),
    h('tbody', {}, ...editor.read().map(edge => { const card = task.processes.find(p => p.id === edge.process)!; return h('tr', { 'data-process': edge.process }, h('td', {}, `${card.id} ${card.label} · ${task.reservoirs.findIndex(r => r.id === edge.from) + 1} → ${task.reservoirs.findIndex(r => r.id === edge.to) + 1}`), h('td', { 'data-process-amount': '' }, String(card.amountMg))); }))));
  function paintOperating() {
    const replay = replayCycleMoves(task, moves); account.replaceChildren(ledgerView(task, replay.ledger));
    location.textContent = task.mode === 'water-path' ? `Seurantavesi ${task.amountMg} mg · nyt ${task.reservoirs.filter(r => cycleAmount(replay.ledger, r.id) > 0).map(r => r.label).join(', ')}` : 'Hiilikirja seuraa vain hiilen osuutta. Muut atomit ja energia käsitellään erikseen.';
    const process = task.processes.find(p => p.id === processChoice.value);
    operationGiven.textContent = process ? `${process.description} Tämän jakson annettu määrä ${process.amountMg} ${task.mode === 'carbon-network' ? 'mg C' : 'mg vettä'}.` : 'Valitse toteutettava prosessi. Anna itse sen siirrettävä määrä.';
  }
  processChoice.addEventListener('change', paintOperating);
  const move = button('Toteuta prosessin siirto', () => {
    if (invalid || !processChoice.value || amount.read() === null) return;
    const edge = editor.read().find(e => e.process === processChoice.value)!;
    moves.push({ run: task.run, id: `step-${moves.length + 1}`, process: processChoice.value, from: edge.from, to: edge.to, amountMg: amount.read()! });
    const replay = replayCycleMoves(task, moves); invalid = !replay.valid; move.disabled = invalid;
    status.textContent = invalid ? 'Malli ei toteuttanut tätä suunniteltua siirtoa. Säilytä havainto ja tarkista oma vastauksesi.' : 'Oma siirto on toteutettu. Seuraa alkuperämerkintää ja koko tiliä.';
    paintOperating(); changed();
  });
  operation.append(location, account, h('label', { style: row }, 'Prosessi', processChoice), operationGiven, h('div', { style: row }, amount.input, move), status);
  const lock = button('Lukitse ennuste ja oma malli', () => {
    if (editor.read().some(edge => !edge.from || !edge.to)) return;
    if (task.mode === 'carbon-network' && delta.read() === null || task.mode === 'water-path' && (!cloud.value || !storedAt.value)) return;
    locked = true;
    for (const field of [...editor.node.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input,select'), ...(assignments ? [...assignments.node.querySelectorAll<HTMLSelectElement>('select')] : []), cloud, storedAt, delta.input, oldStore, energy, routePoint]) field.disabled = true;
    addPoint.disabled = removePoint.disabled = lock.disabled = true; phase = 'operate'; render(); paintOperating(); changed();
  });
  const advance = button('Jatka omaan hiilitiliin', () => { phase = phase === 'assign' ? 'edges' : task.mode === 'carbon-network' && task.requireReturn ? 'route' : 'forecast'; render(); changed(); }, true);
  const back = button('Katso omia prosessinuolia', () => { phase = phase === 'edges' ? locked ? 'operate' : 'forecast' : 'edges'; render(); changed(); }, true);
  const forecastNav = button('Katso lukittu ennuste ja reitti', () => { phase = phase === 'forecast' ? 'operate' : 'forecast'; render(); }, true);
  const assignmentNav = button('Katso omat näytesijoitukset', () => { phase = 'assign'; render(); }, true);
  const routePicture = h('div'), routeArea = h('div', { style: stack });
  const toForecast = button('Jatka muutosennusteeseen', () => { phase = 'forecast'; render(); changed(); }, true);
  const toRoute = button('Katso omaa paluureittiä', () => { phase = 'route'; render(); changed(); }, true);
  if (task.mode === 'carbon-network' && task.requireReturn) routeArea.append(note(`Rakenna yksi mahdollinen paluureitti. Aloita ja lopeta varastossa ${task.reservoirs.find(r => r.id === task.focus)!.label}.${task.mustReturnVia.length ? ' Käy maaperän / pohjan hajottajareitillä.' : ''}`), routePicture, h('div', { style: row }, routePoint, addPoint, removePoint), routeView, toForecast);
  const navigation = h('div', { style: row });
  back.setAttribute('aria-label', 'Katso omia prosessinuolia'); back.textContent = 'Prosessit';
  assignmentNav.setAttribute('aria-label', 'Katso omat näytesijoitukset'); assignmentNav.textContent = 'Näytteet';
  const forecast = h('div', { style: stack });
  if (task.mode === 'water-path') forecast.append(note(`Yksi mahdollinen reitti. Aloita merestä ja palaa mereen. Käytä pyydettyä siirtymää ${task.requiredProcesses.map(kind => cycleProcessNames[kind]).join(', ')}. Käy paikoissa ${task.mustVisit.map(id => task.reservoirs.find(r => r.id === id)!.label).join(', ')}.${task.mustStore ? ' Tässä reitissä seurantavesi viipyy lumivarastossa ennen jatkoa.' : ' Voit käyttää muitakin annettuja kelvollisia siirtymiä.'}`), source, h('label', { style: row }, 'Pilvi sisältää', cloud), h('label', { style: row }, 'Vaadittu viipymä', storedAt), lock);
  else {
    const focusLabel = task.reservoirs.find(r => r.id === task.focus)!.label;
    forecast.append(note(task.period), source, h('label', { style: row }, `Oma ennuste · ${focusLabel} muutos / mg C`, delta.input));
    if (task.requireReturn) forecast.append(toRoute);
    if (task.goal === 'burn-trace') forecast.append(h('label', { style: row }, 'Energianuoli', energy));
    if (task.goal === 'burn') forecast.append(h('label', { style: row }, 'Hidas lähtövarasto', oldStore));
    forecast.append(lock);
  }
  function render() {
    source.replaceChildren(sourceTable()); routePicture.replaceChildren(diagram(task.reservoirs, editor.read())); forecastNav.setAttribute('aria-label', phase === 'forecast' ? 'Palaa toteutettuihin siirtoihin' : 'Katso lukittu ennuste ja reitti'); forecastNav.textContent = phase === 'forecast' ? 'Siirrot' : 'Ennuste';
    if (phase === 'assign' && assignments) phaseArea.replaceChildren(note('Sijoita koostumuskortit omiin varastoehdotuksiisi. Prosessi ja hiiltä sisältävä aine ovat eri asioita.'), assignments.node, advance);
    else if (phase === 'edges') { advance.textContent = task.mode === 'water-path' ? 'Jatka omaan vesireittiin' : task.requireReturn ? 'Jatka omaan paluureittiin' : 'Jatka omaan hiilitiliin'; phaseArea.replaceChildren(...(task.mode === 'carbon-network' && task.claim ? [note(`Loikan luonnos · ${task.claim}`)] : []), editor.node, ...(locked ? [back] : [advance])); }
    else if (phase === 'route') phaseArea.replaceChildren(routeArea, back);
    else if (phase === 'forecast') phaseArea.replaceChildren(forecast, ...(task.mode === 'carbon-network' && task.requireReturn ? [] : [back]));
    else phaseArea.replaceChildren(operation, back);
    if (locked) { navigation.replaceChildren(back, forecastNav, ...(assignments && phase !== 'assign' ? [assignmentNav] : [])); phaseArea.append(navigation); }
  }
  render();
  return { node: phaseArea, ready: () => locked && moves.length > 0, read: () => task.mode === 'water-path'
    ? { kind, mode: task.mode, edges: editor.read(), locked, moves: moves.map(m => ({ ...m })), cloud: (cloud.value || null) as 'droplets-or-ice' | 'vapor' | null, storedAt: storedAt.value === 'none' ? null : storedAt.value || null }
    : { kind, mode: task.mode, edges: editor.read(), assignments: assignments?.read() ?? [], returnPath: [...route], locked, moves: moves.map(m => ({ ...m })), focusChangeMg: delta.read(), longStore: task.goal === 'burn' ? oldStore.value || null : null, ...(task.goal === 'burn-trace' ? { energyIsMatter: energy.value ? energy.value === 'carbon' : null } : {}) } };
}
export function mountMatterCycles(task: MatterCyclesTask, host: HTMLElement, submit: (response: MatterCyclesResponse) => void, onChange?: (response: MatterCyclesResponse) => void): { reveal(): void } {
  let work: Work, check: HTMLButtonElement, done = false, reviewing = false;
  const changed = () => { if (work) { onChange?.(work.read()); if (check && !reviewing) { const ready = work.ready?.() ?? true; check.disabled = !ready; check.style.display = ready ? 'block' : 'none'; } } };
  if (task.mode === 'conservation') work = conservationWork(task, changed);
  else if (task.mode === 'photosynthesis') work = photoWork(task, changed);
  else if (task.mode === 'reservoirs') work = reservoirWork(task, changed);
  else work = flowWork(task, changed);
  const reviewArea = h('div', { style: stack }), model = h('div', { style: stack });
  check = button(task.review ? 'Siirry omaan kiertoselitykseen' : 'Tarkista oma kiertomalli', () => {
    if (done) return;
    const response = work.read();
    if (!task.review) { done = true; submit(response); return; }
    reviewing = true;
    for (const field of work.node.querySelectorAll<HTMLInputElement | HTMLButtonElement | HTMLSelectElement>('input,button,select')) field.disabled = true;
    for (const nav of work.node.querySelectorAll<HTMLButtonElement | HTMLSelectElement>('[data-cycle-navigation]')) nav.disabled = false;
    work.node.style.display = check.style.display = 'none';
    const prompt = note(task.review.prompt), channels = h('div', { style: row }), area = h('div', { style: stack });
    const explain = (channel: 'spoken' | 'written') => {
      area.replaceChildren(); prompt.style.display = 'block'; channels.style.display = 'flex';
      mountObservedExplanation({ kind: 'observed-explanation', channel, givens: [], ...task.review! }, area, observation => { done = true; submit({ ...response, review: { channel, observations: observation.observations, confirmedByAdult: observation.confirmedByAdult, assistance: observation.assistance } }); });
      for (const control of area.querySelectorAll<HTMLElement>('button,select,textarea,summary,input:not([type=checkbox]),label:has(input[type=checkbox])')) control.style.minHeight = '44px';
      area.querySelector('[data-explanation-learner] button')?.addEventListener('click', () => { if (!area.querySelector<HTMLElement>('[data-explanation-adult]')!.hidden) prompt.style.display = channels.style.display = 'none'; });
      area.querySelector('[data-explanation-adult] button[type=button]')?.addEventListener('click', () => { prompt.style.display = 'block'; channels.style.display = 'flex'; });
    };
    let source = false;
    const toggle = button('Näytä oma kiertomalli ja havainnot', () => { source = !source; work.node.style.display = source ? 'grid' : 'none'; area.style.display = source ? 'none' : 'grid'; toggle.textContent = source ? 'Palaa omaan selitykseen' : 'Näytä oma kiertomalli ja havainnot'; });
    channels.append(button('Kerron omin sanoin', () => explain('spoken')), button('Kirjoitan tähän', () => explain('written')));
    reviewArea.replaceChildren(prompt, channels, toggle, area); explain('spoken');
  });
  check.disabled = !(work.ready?.() ?? true); check.style.display = check.disabled ? 'none' : 'block'; work.node.addEventListener('change', changed);
  host.replaceChildren(h('div', { style: stack, 'data-cycle-workbench': task.mode }, work.node, check, reviewArea, model));
  onChange?.(work.read());
  return { reveal() { matterCyclesExample(task)(model); } };
}
export const matterCyclesBoard = (task: MatterCyclesTask): Paint => host => {
  if (task.mode === 'photosynthesis') host.replaceChildren(h('div', { style: panel }, ...task.cards.map(c => note(`${c.label} · ${c.description}`))));
  else host.replaceChildren(diagram(task.reservoirs, []), ...(task.mode === 'reservoirs' ? [note('Koostumuskortit ja varastot yhdistetään omalla tutkimuspöydällä.')] : [ledgerView(task, initialCycleLedger(task))]));
};
export const matterCyclesExample = (task: MatterCyclesTask): Paint => host => {
  const solution = solutionMatterCycles(task), lines: string[] = [];
  if (solution.mode === 'conservation') lines.push(`Koko suljettu kammio ennen ja jälkeen ${solution.totalMg} mg. Vastaanottajan massa ${solution.targetMg} mg. Energiaa siirtyy, aine ei muutu energiaksi tässä massakirjassa.`);
  if (solution.mode === 'water-path' || solution.mode === 'carbon-network') lines.push(...solution.edges.map(e => `${'processes' in task ? task.processes.find(p => p.id === e.process)!.label : e.process} · ${'reservoirs' in task ? task.reservoirs.find(r => r.id === e.from)!.label : e.from} → ${'reservoirs' in task ? task.reservoirs.find(r => r.id === e.to)!.label : e.to}`));
  if (solution.mode === 'water-path') lines.push(`Yksi mahdollinen kulku ${solution.moves.map(m => 'processes' in task ? task.processes.find(p => p.id === m.process)!.label : m.process).join(' → ')}. Pilvessä on pisaroita tai jääkiteitä.`);
  if (solution.mode === 'photosynthesis') lines.push(...solution.roles.map(r => `${task.mode === 'photosynthesis' ? task.cards.find(c => c.id === r.card)!.label : r.card} · ${{ input: 'lähtöaine', output: 'tuote', energy: 'energia', 'not-main-carbon-source': 'ei tämän mallin hiilen lähde' }[r.role!]}`), `Hiilen reitti ${solution.trace.join(' → ')}. Valossa ${solution.dayCarbonMg} mg C, pimeän yhteyttämisessä ${solution.darkPhotoCarbonMg} mg C.`);
  if (solution.mode === 'reservoirs') lines.push(...solution.assignments.map(a => `${task.mode === 'reservoirs' ? task.cards.find(c => c.id === a.card)!.label : a.card} → ${a.reservoir && 'reservoirs' in task ? task.reservoirs.find(r => r.id === a.reservoir)!.label : 'ei hiilivarastokortti'}`), `Seurattua hiiltä yhteensä ${solution.totalCarbonMg} mg C.`);
  if (solution.mode === 'carbon-network') lines.push(`Fokusvaraston muutos ${solution.focusChangeMg} mg C. Mahdollinen paluureitti ${solution.returnPath.map(id => 'reservoirs' in task ? task.reservoirs.find(r => r.id === id)!.label : id).join(' → ') || 'tätä polttoainevarastoa ei oleteta palaavaksi heti'}.`);
  if (task.review) lines.push(task.review.model, 'Tämä malliselitys ei ole aikuisen havainto oppijan omasta selityksestä.');
  host.replaceChildren(h('div', { style: panel, 'data-cycle-model': '' }, h('strong', {}, 'Sulan malliesimerkki'), ...lines.map(note)));
  if ('edges' in solution && 'reservoirs' in task) host.prepend(diagram(task.reservoirs, solution.edges));
};
