import type { Paint } from '../../engine/types';
import { h } from '../../ui/dom';
import { mountObservedExplanation } from './observed-explanations';
import { safetyActions, safetyPictograms, safetyExplanation, safetyFireContinues, solutionSafetyHarbor, safetyHarborScope,
  type SafetyHarborTask, type SafetyHarborResponse, type SafetyCase, type SafetyAnswer, type SafetyAction, type SafetyActionId,
  type SafetyConditions, type SafetyProcedure, type SafetyEvacuation, type SafetyElectricPath, type SafetyLabel, type SafetyPictogram } from '../models/safety-harbor';
const kind = 'safety-harbor' as const;
const stack = 'display:grid;gap:4px';
const row = 'display:flex;align-items:center;flex-wrap:wrap;gap:5px';
const small = 'font-size:13px;line-height:1.2';
const note = (text: string) => h('p', { style: `margin:0;${small}` }, text);
const panel = `${stack};padding:6px 8px;background:#edf3e8;border:1px solid #a6bba8;border-radius:8px;color:#224c41`;
const button = (text: string, click: () => void, caption = text) => h('button', { 'aria-label': text, class: 'btn small', type: 'button', style: 'min-height:44px;min-width:44px', onclick: click }, caption);
function menu<T extends string>(name: string, choices: readonly (readonly [T, string])[], caption = name) {
  const input = h('select', { 'aria-label': name, style: 'min-height:44px;min-width:44px;max-width:100%;flex:1;background:#fffef6;border:1px solid #799b86;border-radius:7px;color:#244c42;padding:3px 5px;font:inherit' },
    h('option', { value: '' }, 'Valitse'), ...choices.map(([value, text]) => h('option', { value }, text)));
  return { input, node: h('label', { style: row }, h('span', { style: small }, caption), input), get: () => (input.value || null) as T | null,
    set(value: T | null) { input.value = value ?? ''; } };
}
const ns = 'http://www.w3.org/2000/svg';
function svg<K extends keyof SVGElementTagNameMap>(tag: K, attributes: Record<string, string | number>) {
  const element = document.createElementNS(ns, tag); for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, String(value)); return element;
}
function text(x: number, y: number, value: string, size = 10) {
  const element = svg('text', { x, y, 'font-size': size, 'text-anchor': 'middle', fill: '#244e42' }); element.textContent = value; return element;
}
function caseFacts(item: SafetyCase) {
  return h('div', { style: panel, 'data-safety-case-facts': item.id }, ...item.facts.map(note));
}
export const safetyHarborBoard = (task: SafetyHarborTask): Paint => host => host.replaceChildren(h('div', { style: stack, 'data-safety-givens': '' },
  note('Kuvitteellinen harjoitus · oma turvallinen toimintapolku.')));
interface Work { node: HTMLElement; read(): SafetyAnswer; show(answer: SafetyAnswer): void }
function procedurePicture(item: SafetyProcedure, actions: readonly SafetyAction[]) {
  const plot = svg('svg', { viewBox: '0 0 320 82', role: 'img', 'aria-label': `Virtuaalitilanteen ${item.title} tilakuva. Toimintajälki on myös tekstinä.`, style: 'display:block;width:100%;max-height:82px;background:#faf8e9;border-radius:8px' });
  const has = (id: SafetyActionId) => actions.some(a => a.action === id);
  const stopped = !item.machineRunning || has('stop-model');
  plot.append(svg('rect', { x: 12, y: 12, width: 96, height: 56, rx: 8, fill: '#dfdbc4', stroke: '#9a7452' }),
    svg('rect', { x: 205, y: 12, width: 104, height: 56, rx: 8, fill: '#dae9d3', stroke: '#65836a' }), text(258, 77, 'Turvallinen paikka', 10));
  if (item.situation === 'physics') {
    plot.append(svg('circle', { cx: 60, cy: 38, r: 18, fill: '#c9d9d1', stroke: '#3c6458' }));
    for (let i = 0; i < 3; i++) {
      const angle = i * Math.PI * 2 / 3;
      plot.append(svg('line', { x1: 60, y1: 38, x2: 60 + Math.cos(angle) * 16, y2: 38 + Math.sin(angle) * 16, stroke: '#628974', 'stroke-width': 5 }));
    }
    plot.append(text(60, 78, stopped ? 'Pysähtynyt malli' : 'Käynnissä', 10));
    if (has('protect') || has('observe-shield')) plot.append(svg('path', { d: 'M 120 11 V 68 M 120 12 H 148 V 68 H 120', fill: '#c6dce0', opacity: .7, stroke: '#436b62' }));
  } else if (item.situation === 'electric') {
    plot.append(svg('rect', { x: 31, y: 23, width: 39, height: 29, fill: '#a6bfb3', stroke: '#3e665b' }),
      svg('path', { d: 'M 69 35 H 84 L 88 27 M 88 44 L 94 35 H 106', stroke: '#786344', fill: 'none', 'stroke-width': 3 }), text(58, 78, 'Vaurio', 10));
  } else {
    plot.append(svg('path', { d: 'M 49 16 H 68 V 25 L 78 34 V 61 H 39 V 34 L 49 25 Z', fill: '#b8d0d0', stroke: '#4e6d5e', 'stroke-width': 2 }),
      svg('rect', { x: 47, y: 37, width: 24, height: 16, fill: '#fbf8e8' }), text(59, 49, item.labelled ? 'A' : '?', 13));
    if (item.foodNearby) plot.append(svg('path', { d: 'M 82 53 H 106 L 102 65 H 85 Z', fill: '#c3a87e', stroke: '#6e7552' }));
    if (has('identify-samples')) plot.append(text(60, 78, 'Tunnisteet tarkistettu', 10));
  }
  if (has('keep-clear')) plot.append(svg('path', { d: 'M 126 9 V 69', stroke: '#9e7551', 'stroke-width': 3, 'stroke-dasharray': '5 3' }));
  const x = has('keep-clear') || has('observe-shield') ? 257 : 159;
  for (let i = 0; i < 3; i++) plot.append(svg('circle', { cx: x - 13 + i * 13, cy: 42, r: 5, fill: '#4a7e6f' }));
  if (has('tell-adult')) plot.append(text(256, 22, 'Aikuinen sai tiedon', 9));
  return plot;
}
function actionOptions(item: SafetyCase): SafetyActionId[] {
  if (item.mode === 'label') return ['read-instruction', 'secure-storage', 'ventilate-plan', 'keep-heat-away', 'protect-water', 'separate-food', 'mix', 'taste'];
  if (item.mode === 'evacuation') return ['warn-friends', 'close-door', 'call-112', 'wait-permission', 'return-for-bag', 'touch'];
  if (item.mode === 'electric-path') return ['keep-clear', 'tell-adult', 'repair-live', 'touch'];
  if (item.mode !== 'procedure') return [];
  if (item.situation === 'physics') return ['read-instruction', 'warn-friends', 'stop-model', 'adjust-stopped', 'protect', 'observe-shield', 'tell-adult', 'touch'];
  if (item.situation === 'chemistry') return ['read-instruction', 'identify-samples', 'protect', 'separate-food', 'keep-clear', 'warn-friends', 'tell-adult', 'mix', 'taste'];
  if (item.situation === 'exposure') return ['keep-clear', 'separate-food', 'warn-friends', 'tell-adult', 'contact-poison', 'call-112', 'taste'];
  return ['keep-clear', 'read-instruction', 'separate-food', 'warn-friends', 'tell-adult', 'touch', 'taste'];
}
function actionsWork(task: SafetyHarborTask, item: SafetyCase, place?: () => string) {
  let proposed: SafetyActionId[] = [], performed: SafetyAction[] = [], locked = false, serial = 0, blocked = false;
  const option = menu<SafetyActionId>(`${item.id}, seuraava suunniteltu toimi`, actionOptions(item).map(id => [id, safetyActions[id]]), 'Oma toimi');
  const list = h('ol', { style: `margin:0;padding-left:22px;${small}`, 'data-safety-plan': item.id });
  const picture = h('div', { 'data-safety-action-picture': item.id });
  const status = note('Kokoa oma järjestys, lukitse ja toteuta se vaihe kerrallaan.'); status.setAttribute('role', 'status');
  const add = button('Lisää suunnitelmaan', () => { const action = option.get(); if (!locked && action && !proposed.includes(action)) { proposed.push(action); redraw(); } }, 'Lisää');
  const undo = button('Poista viimeinen', () => { if (!locked) { proposed.pop(); redraw(); } }, 'Poista');
  const lock = button('Lukitse suunnitelma', () => { if (!proposed.length) return; locked = true; option.input.disabled = add.disabled = undo.disabled = lock.disabled = true; planning.style.display = 'none'; perform.disabled = false; redraw(); }, 'Lukitse');
  const perform = button('Toteuta seuraava vaihe', () => {
    if (!locked || blocked || performed.length >= proposed.length) return;
    const action = proposed[performed.length]!;
    performed.push({ run: task.run, id: `${item.id}-${++serial}`, action, ...(place ? { place: place() } : {}) });
    blocked = ['touch', 'taste', 'mix', 'repair-live', 'return-for-bag'].includes(action) || action === 'adjust-stopped' && item.mode === 'procedure' && item.machineRunning && !performed.some(a => a.action === 'stop-model');
    status.textContent = blocked ? 'Suunnitelma pysähtyy turvallisuuskohtaan. Vaarallista toimea ei toteuteta. Tarkista oma päätös.' : `${safetyActions[action]}. Vaihe näkyy oman suunnitelman jäljessä.`;
    if (performed.length === proposed.length && !blocked) status.textContent = 'Oma toimintaketju on toteutettu.';
    redraw();
  }); perform.disabled = true;
  function redraw() {
    status.style.display = blocked || performed.length > 0 ? '' : 'none';
    if (item.mode === 'procedure') picture.replaceChildren(procedurePicture(item, performed));
    list.replaceChildren(...proposed.map((action, i) => h('li', { style: 'padding:1px 0', 'data-safety-performed': i < performed.length ? 'true' : 'false' }, `${i < performed.length ? '✓ ' : ''}${safetyActions[action]}`)));
    if (blocked || performed.length === proposed.length) perform.disabled = true;
    perform.style.display = locked && !blocked && performed.length < proposed.length ? '' : 'none';
  }
  option.node.style.flex = '1 1 0'; option.node.style.minWidth = '0'; option.node.style.width = '0'; option.input.style.flex = '1 1 0'; option.input.style.width = '0'; option.input.style.minWidth = '60px'; option.input.style.fontSize = '14px';
  option.node.firstChild!.textContent = 'Toimi';
  const planning = h('div', { style: `${row};flex-wrap:nowrap;max-width:100%;width:100%;box-sizing:border-box` }, option.node, add, undo, lock);
  const node = h('div', { style: stack, 'data-safety-action-work': item.id }, picture, planning, list, perform, status);
  redraw();
  return { node, read: () => [...performed], show(actions: readonly SafetyAction[]) { proposed = actions.map(a => a.action); performed = [...actions]; locked = true; planning.style.display = 'none'; option.input.disabled = add.disabled = undo.disabled = lock.disabled = true; redraw(); } };
}
function mapPicture(item: SafetyEvacuation | SafetyElectricPath, path: readonly string[], travelled: readonly string[] = []) {
  const plot = svg('svg', { viewBox: '0 0 310 132', style: 'width:100%;display:block;max-height:150px;background:#f8f8e9;border-radius:7px', role: 'img', 'aria-label': 'Kartta tai virtareitti. Samat pisteet ovat myös nimettyinä ohjaimissa.' });
  for (const [a, b] of item.edges) {
    const first = item.nodes.find(n => n.id === a)!, second = item.nodes.find(n => n.id === b)!;
    const selected = path.some((id, i) => i && (path[i - 1] === a && id === b || path[i - 1] === b && id === a));
    plot.append(svg('line', { x1: first.x, y1: first.y, x2: second.x, y2: second.y, stroke: selected ? '#177b74' : '#9baa97', 'stroke-width': selected ? 4 : 2 }));
  }
  for (const node of item.nodes) {
    const state = 'state' in node ? node.state : 'clear';
    plot.append(svg('circle', { cx: node.x, cy: node.y, r: 9, fill: state === 'smoke' ? '#92978b' : state === 'fire' ? '#b86e4c' : '#e2ecd3', stroke: '#45674e' }),
      text(node.x, node.y + 3, node.id === travelled.at(-1) ? '●' : state === 'smoke' ? 'S' : state === 'fire' ? 'T' : ''));
    const labelX = Math.min(250, Math.max(60, node.x));
    plot.append(text(labelX, Math.max(10, node.y + (node.y > 75 ? 21 : -14)), node.label, node.label.length > 25 ? 8 : 9));
  }
  if (item.mode === 'evacuation') plot.append(text(29, 128, 'S = savu', 10));
  return plot;
}
function pathWork(task: SafetyHarborTask, item: SafetyEvacuation | SafetyElectricPath): Work {
  const start = item.mode === 'evacuation' ? item.start : item.source;
  let path = [start], travelled = item.mode === 'evacuation' ? [start] : [] as string[], locked = false;
  const point = menu<string>(`${item.id}, lisättävä piste`, item.nodes.map(n => [n.id, n.label]), 'Seuraava piste');
  const picture = h('div', { 'data-safety-map': item.id });
  const own = note(''), travelStatus = note('Rakenna oma reitti nimetyistä pisteistä.'); travelStatus.setAttribute('role', 'status');
  const actions = actionsWork(task, item, item.mode === 'evacuation' ? () => travelled.at(-1)! : undefined);
  const add = button('Lisää reitille', () => { const id = point.get(); if (!locked && id && !path.includes(id)) { path.push(id); redraw(); } }, 'Lisää piste');
  const undo = button('Poista reitin viimeinen', () => { if (!locked && path.length > 1) { path.pop(); redraw(); } }, 'Poista piste');
  const lock = button('Lukitse reitti', () => { locked = true; point.input.disabled = add.disabled = undo.disabled = lock.disabled = true; routePlanning.style.display = 'none'; move.disabled = false; redraw(); });
  const move = button('Kulje seuraava karttapiste', () => { if (!locked || travelled.length >= path.length) return; travelled.push(path[travelled.length]!); redraw(); }); move.disabled = true;
  const risk = menu<'shock' | 'heating'>(`${item.id}, energiansiirron riski`, [['shock', 'Sähköisku'], ['heating', 'Kuumeneminen']], 'Riski');
  const insulation = menu<'blocks-contact' | 'adds-current' | 'cosmetic'>(`${item.id}, eristyksen tehtävä`, [['blocks-contact', 'Estää tahattoman kosketuksen'], ['adds-current', 'Lisää virtaa ihmisen kautta'], ['cosmetic', 'Muuttaa vain väriä']], 'Eristys');
  function redraw() {
    picture.replaceChildren(mapPicture(item, path, travelled)); own.style.display = path.length > 1 || locked ? '' : 'none'; own.textContent = `Oma reitti ${path.map(id => item.nodes.find(n => n.id === id)!.label).join(' → ')}`;
    travelStatus.style.display = locked || travelled.length > 1 ? '' : 'none';
    if (item.mode === 'evacuation') travelStatus.textContent = `Virtuaaliryhmä nyt ${item.nodes.find(n => n.id === travelled.at(-1))!.label}. S = savu.`;
    if (travelled.length >= path.length) move.disabled = true;
    move.style.display = locked && travelled.length < path.length ? '' : 'none';
  }
  risk.node.style.flex = '0 0 160px'; risk.input.style.fontSize = '14px'; risk.input.style.minWidth = '60px'; risk.input.style.width = '0';
  insulation.node.style.flex = '1 1 0'; insulation.node.style.minWidth = '0'; insulation.node.style.width = '0'; insulation.input.style.width = '0'; insulation.input.style.fontSize = '14px';
  const electricalChoices = h('div', { style: `${row};flex-wrap:nowrap` }, risk.node, insulation.node);
  const routePlanning = h('div', { style: stack }, point.node, h('div', { style: row }, add, undo, lock));
  const node = h('div', { style: stack }, picture, routePlanning, own,
    ...(item.mode === 'evacuation' ? [move, travelStatus] : [electricalChoices]), actions.node);
  redraw();
  return { node, read: () => item.mode === 'evacuation' ? { mode: item.mode, caseId: item.id, route: [...path], travelled: [...travelled], actions: actions.read() }
    : { mode: item.mode, caseId: item.id, path: [...path], risk: risk.get(), insulationRole: insulation.get(), actions: actions.read() },
    show(answer) { if (answer.mode === 'evacuation') { path = [...answer.route]; travelled = [...answer.travelled]; actions.show(answer.actions); } else if (answer.mode === 'electric-path') { path = [...answer.path]; risk.set(answer.risk); insulation.set(answer.insulationRole); actions.show(answer.actions); } redraw(); } };
}
function conditionsWork(item: SafetyConditions): Work {
  const names = { fuel: 'Palava aine', oxidizer: 'Hapettava ympäristö', heat: 'Riittävä lämpötila' };
  const factors = (Object.keys(names) as (keyof typeof names)[]).map(id => ({ id, control: menu<'yes' | 'no'>(`${item.id}, ${names[id]}`, [['yes', 'On mukana'], ['no', 'Puuttuu']], names[id]) }));
  const prediction = menu<'continues' | 'stops'>(`${item.id}, oma ennuste`, [['continues', 'Palaminen jatkuu mallissa'], ['stops', 'Palaminen ei jatku mallissa']], 'Ennuste');
  const observed = h('div', { 'data-safety-condition-observation': '' }); let locked = false, seen = false;
  const diagram = h('div', { 'data-safety-condition-diagram': '' });
  function draw() {
    const state = seen ? { ...item.present, [item.change.factor]: item.change.available } : item.present;
    const plot = svg('svg', { viewBox: '0 0 320 66', style: 'width:100%;display:block;max-height:66px;background:#f7f6e7;border-radius:7px', role: 'img', 'aria-label': `Kolme ehtoa. ${Object.entries(names).map(([id, name]) => `${name} ${state[id as keyof typeof names] ? 'mukana' : 'puuttuu'}`).join(', ')}` });
    for (const [index, id] of (Object.keys(names) as (keyof typeof names)[]).entries()) {
      const x = 55 + index * 105;
      plot.append(svg('line', { x1: x, y1: 26, x2: 160, y2: 61, stroke: '#6e8d77' }),
        svg('circle', { cx: x, cy: 23, r: 17, fill: state[id] ? '#d7e8ce' : '#ebdece', stroke: '#547966' }), text(x, 27, state[id] ? '+' : '−', 18), text(x, 53, names[id], 10));
    }
    diagram.replaceChildren(plot);
  }
  draw();
  const operate = button('Muuta virtuaalimallia', () => { if (!locked || seen) return; seen = true; draw(); observed.replaceChildren(note(safetyFireContinues(item) ? 'Havainto · kaikki kolme ehtoa täyttyvät, mallin palaminen jatkuu.' : 'Havainto · vähintään yksi ehto puuttuu, mallin palaminen ei jatku.')); operate.disabled = true; }); operate.disabled = true;
  const lock = button('Lukitse oma ennuste', () => { if (!prediction.get() || factors.some(f => !f.control.get())) return; locked = true; prediction.input.disabled = true; factors.forEach(f => { f.control.input.disabled = true; }); lock.disabled = true; operate.disabled = false; });
  const givens = note(`Alussa ${Object.entries(names).map(([id, name]) => `${name.toLowerCase()} ${item.present[id as keyof typeof names] ? 'mukana' : 'puuttuu'}`).join(' · ')}. Muutos ${names[item.change.factor].toLowerCase()} ${item.change.available ? 'saataville' : 'pois'}.`);
  givens.setAttribute('data-safety-condition-givens', '');
  return { node: h('div', { style: stack }, diagram, givens, ...factors.map(f => f.control.node), prediction.node, h('div', { style: row }, lock, operate), observed),
    read: () => ({ mode: item.mode, caseId: item.id, factors: Object.fromEntries(factors.map(f => [f.id, f.control.get() === null ? null : f.control.get() === 'yes'])) as Extract<SafetyAnswer, { mode: 'fire-conditions' }>['factors'], prediction: prediction.get(), locked, observed: seen }),
    show(answer) { if (answer.mode !== 'fire-conditions') return; factors.forEach(f => f.control.set(answer.factors[f.id] === null ? null : answer.factors[f.id] ? 'yes' : 'no')); prediction.set(answer.prediction); locked = answer.locked; seen = answer.observed; draw(); observed.replaceChildren(note(safetyFireContinues(item) ? 'Mallihavainto · palaminen jatkuu.' : 'Mallihavainto · palaminen ei jatku.')); } };
}
function labelWork(task: SafetyHarborTask, item: SafetyLabel): Work {
  const fields = item.pictograms.map((id, i) => ({ id, control: menu<SafetyPictogram>(`${item.id}, merkin ${i + 1} merkitys`, Object.entries(safetyPictograms).map(([id, data]) => [id as SafetyPictogram, data.name]), `Merkki ${i + 1}`) }));
  const symbols = h('div', { style: `${stack};background:${item.packageColor};padding:5px;border-radius:7px` }, ...fields.map(({ id, control }, i) => {
    control.node.style.flex = '1'; control.node.style.minWidth = '0'; control.input.style.fontSize = '14px';
    return h('div', { style: `${row};flex-wrap:nowrap` }, h('img', { src: `${import.meta.env.BASE_URL}images/safety-harbor/${id}.png`, alt: `Merkki ${i + 1}, ${safetyPictograms[id].symbol}`, width: 52, height: 52, style: 'object-fit:contain;background:#fff;flex:none' }), control.node);
  }));
  const actions = actionsWork(task, item);
  const claimText = (claim: NonNullable<SafetyLabel['proposal']>[number]) => claim.kind === 'meaning' ? `${safetyPictograms[claim.symbol].symbol} tarkoittaa ${safetyPictograms[claim.meaning].name.toLowerCase()}` : safetyActions[claim.action];
  const rejected = menu<string>(`${item.id}, korjattava luonnosväite`, (item.proposal ?? []).map(claim => [claim.id, claimText(claim)]), 'Korjattava väite');
  const markStage = h('div', { style: stack }, symbols, ...(item.proposal ? [note('Korjaa luonnoksen virhe omalla merkinnällä ja suunnitelmalla.'), rejected.node] : []));
  const compact = h('div', { style: `${row};flex-wrap:nowrap;background:${item.packageColor};padding:4px;border-radius:7px` });
  const ownClaim = note('');
  const planStage = h('div', { style: `${stack};display:none` }, compact, ownClaim, actions.node);
  function phase(planning: boolean) {
    if (planning && (fields.some(f => !f.control.get()) || item.proposal && !rejected.get())) return;
    markStage.style.display = planning ? 'none' : 'grid'; planStage.style.display = planning ? 'grid' : 'none';
    compact.replaceChildren(...fields.map(({ id, control }, i) => h('div', { style: `${row};flex:1;min-width:0;flex-wrap:nowrap` },
      h('img', { src: `${import.meta.env.BASE_URL}images/safety-harbor/${id}.png`, alt: `Merkki ${i + 1}, ${safetyPictograms[id].symbol}`, width: 44, height: 44, style: 'object-fit:contain;background:#fff;flex:none' }),
      h('span', { style: `${small};overflow-wrap:anywhere` }, safetyPictograms[control.get()!]?.name ?? 'Oma merkintä'))));
    ownClaim.textContent = item.proposal ? `Korjattava väite · ${claimText(item.proposal.find(c => c.id === rejected.get())!)}` : 'Omat merkinnät kulkevat suunnitelman mukana.';
  }
  markStage.append(button('Jatka omaan toimintaketjuun', () => phase(true)));
  planStage.append(button('Muokkaa etikettimerkintöjä', () => phase(false)));
  return { node: h('div', { style: stack }, note(item.instruction), markStage, planStage),
    read: () => ({ mode: item.mode, caseId: item.id, meanings: Object.fromEntries(fields.map(f => [f.id, f.control.get()]).filter((pair): pair is [SafetyPictogram, SafetyPictogram] => pair[1] !== null)), ...(item.proposal ? { rejectedClaim: rejected.get() } : {}), actions: actions.read() }),
    show(answer) { if (answer.mode !== 'label') return; fields.forEach(f => f.control.set(answer.meanings[f.id] ?? null)); rejected.set(answer.rejectedClaim ?? null); actions.show(answer.actions); phase(true); } };

}
function makeWork(task: SafetyHarborTask, item: SafetyCase): Work {
  if (item.mode === 'fire-conditions') return conditionsWork(item);
  if (item.mode === 'evacuation' || item.mode === 'electric-path') return pathWork(task, item);
  if (item.mode === 'label') return labelWork(task, item);
  const actions = actionsWork(task, item);
  return { node: actions.node, read: () => ({ mode: 'procedure', caseId: item.id, actions: actions.read() }), show(answer) { if (answer.mode === 'procedure') actions.show(answer.actions); } };
}
export function mountSafetyHarbor(task: SafetyHarborTask, host: HTMLElement, submit: (answer: SafetyHarborResponse) => void): { reveal(): void } {
  const works = task.cases.map(item => ({ item, work: makeWork(task, item) }));
  const surface = h('div', { style: stack, 'data-safety-workbench': '' });
  const current = h('div', { style: stack, 'data-safety-active-case': '' }); let active = 0, done = false;
  function view(index: number) { active = index; const { item, work } = works[index]!; current.setAttribute('data-safety-active-case', item.id); current.replaceChildren(...(item.mode === 'label' ? [] : [caseFacts(item)]), work.node); }
  const shortNames: Record<string, string> = { package: 'Pakkaus', exposure: 'Altistus', fire: 'Savu', label: 'Etiketti', work: 'Työtila' };
  const tabs = works.map(({ item }, i) => { const tab = button(`${i + 1} · ${shortNames[item.id] ?? item.title}`, () => view(i)); tab.setAttribute('aria-label', `Tilanne ${i + 1}, ${item.title}`); return tab; });
  const tabsBox = h('div', { style: row }, ...tabs);
  const handoff = h('div', { style: stack }), status = note(''); status.setAttribute('role', 'status');
  const check = button(task.review ? 'Siirry omaan perusteluun' : 'Tarkista turvapolku', () => {
    if (done) return;
    const response: SafetyHarborResponse = { kind, answers: works.map(w => w.work.read()) };
    if (!task.review) { done = true; submit(response); return; }
    const area = h('div', { style: stack });
    function explain(channel: 'spoken' | 'written') {
      area.replaceChildren();
      mountObservedExplanation(safetyExplanation(task, channel), area, observation => { done = true; submit({ ...response, review: { channel, observations: observation.observations, confirmedByAdult: observation.confirmedByAdult, assistance: observation.assistance } }); });
      for (const control of area.querySelectorAll<HTMLElement>('select,button,textarea,summary,input:not([type=checkbox])')) control.style.minHeight = '44px';
    }
    for (const control of surface.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>('input,select,button')) control.disabled = true;
    current.style.display = tabsBox.style.display = check.style.display = 'none';
    for (const tab of tabs) tab.disabled = false;
    let seeingSource = false;
    const sourceToggle = button('Näytä oma työ ja tilannetiedot', () => { seeingSource = !seeingSource; current.style.display = seeingSource ? 'grid' : 'none'; tabsBox.style.display = seeingSource && tabs.length > 1 ? 'flex' : 'none'; area.style.display = seeingSource ? 'none' : 'grid'; sourceToggle.textContent = seeingSource ? 'Palaa omaan perusteluun' : 'Näytä oma työ ja tilannetiedot'; sourceToggle.setAttribute('aria-label', sourceToggle.textContent); });
    handoff.replaceChildren(note(task.review.prompt), h('div', { style: row }, button('Kerron omin sanoin', () => explain('spoken')), button('Kirjoitan tähän', () => explain('written'))), sourceToggle, area);
    explain('spoken');
  });
  surface.append(...(works.length > 1 ? [tabsBox] : []), current, check, status);
  host.replaceChildren(surface, handoff); view(active);
  return { reveal() { const model = solutionSafetyHarbor(task); works.forEach(({ work, item }) => { const answer = model.answers.find(a => a.caseId === item.id)!; work.show(answer); }); view(active); status.textContent = 'Mallitoiminta on näkyvissä. Oma näyttö tehdään uudessa tilanteessa.'; if (task.review) status.append(document.createTextNode(` Malliperustelu. ${task.review.model}`)); } };
}
export const safetyHarborExample = (task: SafetyHarborTask): Paint => host => {
  safetyHarborBoard(task)(host); const model = solutionSafetyHarbor(task);
  for (const item of task.cases) {
    const answer = model.answers.find(a => a.caseId === item.id)!;
    const result = h('div', { style: panel }, caseFacts(item));
    if (item.mode === 'procedure' && answer.mode === 'procedure') result.append(procedurePicture(item, answer.actions));
    if (item.mode === 'label' && answer.mode === 'label') result.append(note(item.pictograms.map(id => `${safetyPictograms[id].symbol} → ${safetyPictograms[id].name}`).join(' · ')), note(item.instruction));
    if (item.mode === 'fire-conditions') result.append(note(`Mallin muutoksen jälkeen palaminen ${safetyFireContinues(item) ? 'jatkuu, koska kaikki kolme ehtoa täyttyvät' : 'ei jatku, koska vähintään yksi ehto puuttuu'}.`));
    if (item.mode === 'evacuation' && answer.mode === 'evacuation') result.append(mapPicture(item, answer.route, answer.travelled));
    if (item.mode === 'electric-path' && answer.mode === 'electric-path') result.append(mapPicture(item, answer.path), note('Mallin virtareitti on mahdollinen vain annetuilla kytkentä- ja vikaehdoilla. Eristys estää tahattoman kosketuksen.'));
    if ('actions' in answer) result.append(h('ol', { style: `margin:0;padding-left:22px;${small}` }, ...answer.actions.map(a => h('li', {}, safetyActions[a.action]))));
    host.append(result);
  }
  host.append(note(safetyHarborScope), note('Oma perustelu ja tarvittava aikuisarvio tehdään erikseen.'));
};
