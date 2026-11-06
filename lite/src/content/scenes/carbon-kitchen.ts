import type { Paint } from '../../engine/types';
import { h } from '../../ui/dom';
import { mountObservedExplanation } from './observed-explanations';
import { carbonProfileReady, nutrientNames, nutrientStructures, solutionCarbonKitchen, type CarbonAtom, type CarbonBond, type CarbonKitchenResponse, type CarbonKitchenTask, type CarbonMolecule, type NutrientGroup } from '../models/carbon-kitchen';

const kind = 'carbon-kitchen' as const;
const stack = 'display:grid;gap:5px;min-width:0';
const row = 'display:flex;gap:5px;align-items:center;flex-wrap:wrap;min-width:0';
const noteStyle = 'margin:0;font-size:13px;line-height:1.25;color:#294e48';
const fieldStyle = 'min-height:44px;min-width:0;box-sizing:border-box;font:inherit;font-size:14px;color:#173f38;background:#fffef6;border:1px solid #8eaaa0;border-radius:9px;padding:5px 7px';
const panelStyle = `${stack};background:#edf3e6;border:1px solid #a6bdac;border-radius:9px;padding:6px 8px`;
const note = (text: string) => h('p', { style: noteStyle }, text);
const button = (text: string, onclick: () => void) => h('button', { type: 'button', class: 'btn small', style: 'min-height:44px', onclick }, text);
function menu(label: string, choices: readonly (readonly [string, string])[]) {
  const node = h('select', { 'aria-label': label, style: `${fieldStyle};flex:1;width:0;min-width:90px` }, h('option', { value: '' }, 'Valitse'), ...choices.map(([value, text]) => h('option', { value }, text)));
  return node;
}
function number(label: string) {
  const input = h('input', { type: 'text', inputmode: 'numeric', 'aria-label': label, style: `${fieldStyle};width:65px`, maxlength: 5 });
  // Whitelist before submit. Mistaken prose is never sent to the attempt ledger.
  const read = () => /^\d{1,5}$/.test(input.value.trim()) ? Number(input.value.trim()) : null;
  input.addEventListener('blur', () => { if (read() === null) input.value = ''; });
  return { input, read };
}
export function carbonAtomPositions(atoms: readonly CarbonAtom[]) {
  return atoms.map((atom, i) => ({ id: atom.id, x: 22 + (i % 6) * 47, y: 25 + Math.floor(i / 6) * 43 }));
}
export function carbonMoleculePicture(molecule: Pick<CarbonMolecule, 'atoms' | 'bonds'>, highlighted: readonly string[] = []): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const height = 35 + Math.ceil(molecule.atoms.length / 6) * 43;
  svg.setAttribute('viewBox', `0 0 285 ${height}`); svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', molecule.atoms.map(a => `${a.id} ${a.element}${a.hydrogens ? ` sidosvetyjä ${a.hydrogens}` : ''}`).join(', ') + '. Sidokset ' + molecule.bonds.map(b => `${b.a}–${b.b} kertaluku ${b.order}`).join(', '));
  svg.style.cssText = 'width:100%;max-height:145px;display:block';
  const positions = carbonAtomPositions(molecule.atoms);
  const draw = (tag: string, attrs: Record<string, string | number>, text?: string) => {
    const element = document.createElementNS(svg.namespaceURI, tag);
    for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, String(value));
    if (text) element.textContent = text; svg.append(element);
  };
  for (const b of molecule.bonds) {
    const a = positions.find(p => p.id === b.a), end = positions.find(p => p.id === b.b); if (!a || !end) continue;
    for (let n = 0; n < b.order; n++) draw('line', { x1: a.x, y1: a.y + (n - (b.order - 1) / 2) * 4, x2: end.x, y2: end.y + (n - (b.order - 1) / 2) * 4, stroke: '#75897c', 'stroke-width': 2 });
  }
  molecule.atoms.forEach((atom, i) => {
    const p = positions[i]!;
    draw('circle', { cx: p.x, cy: p.y, r: 13, fill: highlighted.includes(atom.id) ? '#efd399' : atom.element === 'O' ? '#c67664' : atom.element === 'H' ? '#fffdf5' : '#50686a', stroke: '#45655c' });
    draw('text', { x: p.x, y: p.y + 4, fill: atom.element === 'C' && !highlighted.includes(atom.id) ? '#fff' : '#123e37', 'text-anchor': 'middle', 'font-size': 11 }, `${atom.element}${atom.hydrogens ? `H${atom.hydrogens === 1 ? '' : atom.hydrogens}` : ''}`);
    draw('text', { x: p.x, y: p.y + 25, fill: '#21483e', 'text-anchor': 'middle', 'font-size': 11 }, atom.id);
  });
  return svg;
}
export const carbonKitchenBoard = (task: CarbonKitchenTask): Paint => host => {
  const view = h('div', { style: panelStyle }, note(task.title));
  if (task.mode === 'composition') for (const card of task.cards) view.append(note(`${card.name} · ${Object.entries(card.formula).map(([element, count]) => `${element} × ${count}`).join(' · ')}`));
  if (task.mode === 'molecule-build') view.append(carbonMoleculePicture({ atoms: task.atoms, bonds: task.proposal ?? [] }), note(`Oman ${task.formula}-rakenteen atomit. Sidokset rakennetaan itse.`));
  if (task.mode === 'nutrient-matrix' || task.mode === 'protein-fragment') for (const component of task.components) view.append(note(`${component.name} · ${nutrientStructures[component.structure]}`));
  if (task.mode === 'organic-group') for (const molecule of task.molecules) view.append(carbonMoleculePicture(molecule), note(`${molecule.name} · annettu kiehumispiste ≈ ${molecule.boilingC} °C`));
  host.replaceChildren(view);
};
interface Work { node: HTMLElement; read(): CarbonKitchenResponse; ready?(): boolean }
function compositionWork(task: Extract<CarbonKitchenTask, { mode: 'composition' }>): Work {
  const element = menu('Hiilen alkuaineen tunnus', [['C', 'C'], ['H', 'H'], ['O', 'O']]);
  const rows = task.cards.map(card => {
    const count = number(`${card.id} hiiliatomien määrä`), type = menu(`${card.id} aineen tyyppi`, [['element', 'Alkuaine'], ['compound', 'Yhdiste']]);
    const inventory = Object.entries(card.formula).map(([element, n]) => `${element} × ${n}`).join(' · ');
    return { card, count, type, node: h('div', { style: panelStyle, 'data-carbon-card': card.id }, note(`${card.id.toUpperCase()} · ${card.name} · ${card.appearance}`),
      h('div', { style: row }, h('strong', { style: 'flex:1;font-size:13px' }, inventory), count.input, type)) };
  });
  const counter = menu('Väitteen vastaesimerkki', task.cards.map(c => [c.id, c.id.toUpperCase()]));
  return { node: h('div', { style: stack }, note('Atomilajit ja määrät · verkkohiilen kortissa verkon katkelma.'),
    h('label', { style: row }, 'Hiilen tunnus', element), ...rows.map(r => r.node), ...(task.claim ? [note(`Loikan luonnos · ${task.claim.text}`), h('label', { style: row }, 'Oma vastaesimerkki', counter)] : [])),
    read: () => ({ kind, mode: task.mode, element: (element.value || null) as 'C' | 'H' | 'O' | null, rows: rows.map(r => ({ id: r.card.id, carbon: r.count.read(), type: (r.type.value || null) as 'element' | 'compound' | null })), counterexample: task.claim ? counter.value || null : null }) };
}
function bondEditor(atoms: readonly CarbonAtom[], initial: readonly CarbonBond[], changed: () => void) {
  let bonds: CarbonBond[] = structuredClone([...initial]);
  const picture = h('div'), list = h('div', { style: row });
  const options = atoms.map(a => [a.id, `${a.id} · ${a.element}`] as const);
  const a = menu('Sidoksen ensimmäinen atomi', options), b = menu('Sidoksen toinen atomi', options), order = menu('Sidoksen kertaluku', [['1', '1'], ['2', '2'], ['3', '3']]);
  order.style.flex = '0 0 52px'; order.style.minWidth = '52px';
  const status = note('');
  function update() {
    picture.replaceChildren(carbonMoleculePicture({ atoms, bonds }));
    list.replaceChildren(...bonds.map((bond, i) => { const remove = button(`${bond.a}–${bond.b} (${bond.order}) ×`, () => { bonds.splice(i, 1); update(); changed(); }); remove.setAttribute('aria-label', `Poista sidos ${bond.a} ${bond.b}`); return remove; }));
  }
  const add = button('Liitä', () => {
    if (!a.value || !b.value || a.value === b.value || !order.value) { status.textContent = 'Valitse kaksi eri atomia ja sidoksen kertaluku.'; return; }
    bonds = bonds.filter(bond => ![bond.a, bond.b].includes(a.value) || ![bond.a, bond.b].includes(b.value));
    bonds.push({ a: a.value, b: b.value, order: Number(order.value) as 1 | 2 | 3 }); update(); changed(); status.textContent = '';
  });
  update();
  return { node: h('div', { style: stack }, picture, h('div', { style: row }, a, b, order, add), list, status), read: () => [...bonds] };
}
function moleculeWork(task: Extract<CarbonKitchenTask, { mode: 'molecule-build' }>, changed: () => void): Work {
  const editor = bondEditor(task.atoms, task.proposal ?? [], changed);
  const types = task.samples.map(sample => ({ sample, choice: menu(`${sample.id} näytteen tyyppi`, [['element', 'Alkuaine'], ['compound', 'Yhdiste'], ['mixture', 'Seos']]) }));
  const organic = menu('Ovatko kaikki hiiliyhdisteet orgaanisia?', [['yes', 'Ovat'], ['no', 'Eivät ole']]);
  const editorArea = h('div', { style: stack }, editor.node), comparison = h('div', { style: stack });
  let comparing = false;
  const toggle = button('Jatka näytevertailuun', () => { comparing = !comparing; editorArea.style.display = comparing ? 'none' : 'grid'; comparison.style.display = comparing ? 'grid' : 'none'; toggle.textContent = comparing ? 'Muokkaa omaa molekyyliä' : 'Jatka näytevertailuun'; changed(); });
  comparison.append(...types.map(({ sample, choice }) => h('div', { style: row }, h('span', { style: 'flex:1;font-size:12px' }, `${sample.id} · ${sample.description}`), choice)), h('label', { style: row }, 'Kaikki hiiliyhdisteet orgaanisia?', organic));
  toggle.setAttribute('data-carbon-navigation', '');
  comparison.style.display = 'none';
  return { node: h('div', { style: stack }, note(`Oma ${task.formula}-molekyyli. Jokainen annettu atomi käytetään. Neutraalissa mallissa C tarvitsee 4, H 1 ja O 2 sidoksen kertalukuyksikköä. Kaikki kelvolliset isomeerit hyväksytään.`), editorArea, toggle, comparison), ready: () => comparing,
    read: () => ({ kind, mode: task.mode, bonds: editor.read(), types: types.map(t => ({ id: t.sample.id, type: (t.choice.value || null) as 'element' | 'compound' | 'mixture' | null })), allCarbonOrganic: organic.value === '' ? null : organic.value === 'yes' }) };
}
function nutrientWork(task: Extract<CarbonKitchenTask, { mode: 'nutrient-matrix' }>, changed: () => void): Work {
  const labels = Object.entries(nutrientNames) as [NutrientGroup, string][];
  const groups = task.components.map(component => ({ component, choice: menu(`${component.id} aineryhmä`, labels) }));
  const foodRows = task.foods.map(food => ({ food, selected: new Set<NutrientGroup>(), buttons: h('div', { style: row }) }));
  for (const food of foodRows) for (const [value, label] of labels.filter(([id]) => id !== 'other')) {
    const pick = button(label, () => { food.selected.has(value) ? food.selected.delete(value) : food.selected.add(value); pick.setAttribute('aria-pressed', String(food.selected.has(value))); pick.textContent = `${food.selected.has(value) ? '✓ ' : ''}${label}`; pick.style.background = food.selected.has(value) ? '#dceacb' : '#fffef6'; });
    pick.setAttribute('aria-label', `${food.food.id} ${label}`); pick.setAttribute('aria-pressed', 'false'); food.buttons.append(pick);
  }
  const mass = number('Pyydetyn ravintoaineryhmän massa grammoina'), rejected = menu('Korjattava eväsväite', task.foods.map(f => [f.id, f.id === 'food-a' ? 'A' : 'B']));
  const table = h('table', { style: 'width:100%;border-collapse:collapse;font-size:12px' }, h('thead', {}, h('tr', {}, h('th', { style: 'text-align:left' }, 'Aine ja rakenne'), ...task.foods.map((_, i) => h('th', {}, `${i ? 'B' : 'A'} / g`)), h('th', {}, 'Oma ryhmä'))),
    h('tbody', {}, ...groups.map(({ component, choice }) => h('tr', {}, h('td', { style: 'padding-right:4px' }, h('strong', {}, component.name), h('small', { style: 'display:block' }, `${nutrientStructures[component.structure]} · ${component.appearance}`)),
      ...task.foods.map(food => h('td', { style: 'text-align:center;min-width:26px' }, String(food.parts.find(p => p.component === component.id)?.massG ?? 0))), h('td', { style: 'width:32%' }, choice)))));
  let secondPhase = false;
  const tableArea = h('div', {}, table), foodArea = h('div', { style: stack });
  const toggle = button('Rakenna evästaulukko', () => {
    secondPhase = !secondPhase;
    if (secondPhase) {
      const summary = h('table', { style: 'width:100%;font-size:12px', 'data-carbon-composition-table': '' }, h('thead', {}, h('tr', {}, h('th', {}, 'Aine · oma ryhmä'), h('th', {}, 'A / g'), h('th', {}, 'B / g'))), h('tbody', {}, ...groups.map(({ component, choice }) => h('tr', {}, h('td', {}, `${component.name} · ${nutrientNames[choice.value as NutrientGroup] ?? '?'}`), ...task.foods.map(f => h('td', { style: 'text-align:center' }, String(f.parts.find(p => p.component === component.id)?.massG ?? 0)))))));
      tableArea.replaceChildren(summary);
    } else tableArea.replaceChildren(table);
    foodArea.style.display = secondPhase ? 'grid' : 'none'; toggle.textContent = secondPhase ? 'Muokkaa aineiden ryhmiä' : 'Rakenna evästaulukko'; changed();
  });
  foodArea.append(
    ...foodRows.map(({ food, buttons }, i) => h('div', { style: row }, h('strong', {}, `${i ? 'B' : 'A'} ryhmät`), buttons)),
    h('label', { style: row }, `A · ${nutrientNames[task.requested.group]} yhteensä / g`, mass.input),
    ...(task.proposal ? [note(`Loikan väite · ${task.proposal.text}`), h('label', { style: row }, 'Korjattava eväs', rejected)] : []));
  foodArea.style.display = 'none';
  return { node: h('div', { style: stack }, note('Kuvitteelliset koostumusnäytteet A ja B. Massat koskevat samaa näytettä. Ruoassa voi olla monta ryhmää.'), tableArea, toggle, foodArea), ready: () => secondPhase,
    read: () => ({ kind, mode: task.mode, groups: groups.map(({ component, choice }) => ({ id: component.id, group: (choice.value || null) as NutrientGroup | null })), foods: foodRows.map(({ food, selected }) => ({ id: food.id, groups: [...selected] })), massG: mass.read(), rejectedFood: task.proposal ? rejected.value || null : null }) };
}
function proteinWork(task: Extract<CarbonKitchenTask, { mode: 'protein-fragment' }>, changed: () => void): Work {
  let chain = [...(task.proposal ?? [])], folded = false;
  const selectedFoods = new Set<string>(), picture = h('div'), list = h('div', { style: row });
  const unit = menu('Ketjuun lisättävä rakenneosa', task.units.map(u => [u.id, `${u.label} · ${u.kind === 'amino-residue' ? 'aminohappotähde' : u.kind === 'glucose-residue' ? 'glukoosiosa' : 'rasvahappotähde'}`]));
  const redraw = () => {
    picture.replaceChildren(note(`Oma katkelma · ${chain.map(id => task.units.find(u => u.id === id)?.label ?? '?').join(folded ? ' ↗ ' : ' — ') || 'ei vielä osia'}`));
    list.replaceChildren(...chain.map((id, i) => button(`${task.units.find(u => u.id === id)?.label} ×`, () => { chain.splice(i, 1); redraw(); changed(); })));
  };
  const add = button('Liitä ketjuun', () => { if (unit.value && !chain.includes(unit.value) && chain.length < task.units.length) { chain.push(unit.value); redraw(); changed(); } });
  const fold = button('Taivuta mallia', () => { folded = !folded; fold.textContent = folded ? 'Ojenna mallia' : 'Taivuta mallia'; redraw(); changed(); });
  const foodRows = task.foods.map(food => {
    const select = button('Sisältää proteiinia', () => { selectedFoods.has(food.id) ? selectedFoods.delete(food.id) : selectedFoods.add(food.id); select.setAttribute('aria-pressed', String(selectedFoods.has(food.id))); select.textContent = `${selectedFoods.has(food.id) ? '✓ ' : ''}Sisältää proteiinia`; select.style.background = selectedFoods.has(food.id) ? '#dceacb' : '#fffef6'; });
    select.setAttribute('aria-label', `${food.id} sisältää proteiinia`); select.setAttribute('aria-pressed', 'false');
    const data = food.parts.map(part => `${task.components.find(c => c.id === part.component)!.name} ${part.massG} g`).join(' · ');
    return h('div', { style: panelStyle, 'data-carbon-protein-food': food.id }, note(`${food.name} · ${food.origin === 'plant' ? 'kasvipohjainen' : 'vertailunäyte'} · ${data}`), select);
  });
  redraw();
  return { node: h('div', { style: stack }, note(`Kukin aminohappopala esittää aminohappotähdettä. Kokoa ${task.length} eri palaa. Tämä lyhyt pätkä esittää osaa pidemmästä proteiiniketjusta. Pelkistetty taivutus ei muuta osia eikä laske todellista taittumista.`), picture,
    h('div', { style: row }, unit, add), list, fold, ...foodRows), read: () => ({ kind, mode: task.mode, chain: [...chain], folded, proteinFoods: [...selectedFoods] }) };
}
function organicWork(task: Extract<CarbonKitchenTask, { mode: 'organic-group' }>, changed: () => void): Work {
  const marks = task.molecules.map(molecule => {
    const options = molecule.atoms.map(a => [a.id, `${a.id} ${a.element}`] as const);
    const carbon = menu(`${molecule.id} ryhmän C`, options), oxygen = menu(`${molecule.id} ryhmän O`, options), hydrogen = menu(`${molecule.id} ryhmän H`, options);
    const picture = h('div');
    const draw = () => { picture.replaceChildren(carbonMoleculePicture(molecule, [carbon.value, oxygen.value, hydrogen.value])); changed(); };
    for (const input of [carbon, oxygen, hydrogen]) input.addEventListener('change', draw);
    picture.replaceChildren(carbonMoleculePicture(molecule));
    return { molecule, carbon, oxygen, hydrogen, node: h('div', { style: panelStyle }, h('strong', { style: 'font-size:13px' }, `${molecule.name} · kiehumispiste ≈ ${molecule.boilingC} °C`), picture, h('div', { style: row }, carbon, oxygen, hydrogen)) };
  });
  let comparing = false;
  const higher = menu('Korkeampi annettu kiehumispiste', task.molecules.map(m => [m.id, m.name])), difference = number('Kiehumispisteiden ero celsiusasteina');
  const reject = menu('Virheellisen ryhmäväitteen rakenne', [[task.contrast.id, task.contrast.name], ...task.molecules.map(m => [m.id, m.name] as const)]);
  const tabs = h('div', { style: row }), current = h('div', { style: stack });
  const show = (i: number) => current.replaceChildren(marks[i]!.node);
  task.molecules.forEach((m, i) => { const tab = button(m.name, () => show(i)); tab.setAttribute('data-carbon-navigation', ''); tabs.append(tab); }); show(0);
  const data = note(task.molecules.map(m => `${m.name} ≈ ${m.boilingC} °C`).join(' · ') + '. Sama paine 101 325 Pa. Vertailutaulu on pyöristetty kokonaisiin asteisiin.');
  const structure = h('div', { style: stack }, tabs, current), comparison = h('div', { style: stack });
  const toggle = button('Jatka ominaisuusvertailuun', () => { comparing = !comparing; structure.style.display = comparing ? 'none' : 'grid'; comparison.style.display = comparing ? 'grid' : 'none'; toggle.textContent = comparing ? 'Muokkaa omia rakennepiirteitä' : 'Jatka ominaisuusvertailuun'; changed(); });
  comparison.append(
    ...(task.proposal ? [note(`Loikan luonnos · ${task.proposal.text}`), carbonMoleculePicture(task.contrast), reject] : []),
    h('label', { style: row }, 'Korkeampi arvo', higher), h('label', { style: row }, 'Annettujen arvojen ero / °C', difference.input));
  toggle.setAttribute('data-carbon-navigation', '');
  comparison.style.display = 'none';
  return { node: h('div', { style: stack }, note('Tutkittava ryhmä · alkoholit. Merkitse C, O ja H ryhmästä, jossa O–H liittyy kylläiseen hiileen. Hiilen muut vedyt näkyvät CHₙ-merkinnässä.'), data, structure, toggle, comparison), ready: () => comparing,
    read: () => ({ kind, mode: task.mode, marks: marks.map(m => ({ molecule: m.molecule.id, carbon: m.carbon.value, oxygen: m.oxygen.value, hydrogen: m.hydrogen.value })), higherBoiling: higher.value || null, differenceC: difference.read(), rejectedMolecule: task.proposal ? reject.value || null : null }) };
}
export function mountCarbonKitchen(task: CarbonKitchenTask, host: HTMLElement, submit: (response: CarbonKitchenResponse) => void, onChange?: (response: CarbonKitchenResponse) => void): { reveal(): void } {
  if (task.mode === 'organic-group' && !carbonProfileReady(task)) {
    host.replaceChildren(note('Tämä tutkimuslaatikko odottaa aikuisen opetusvalintaa. Voit tutkia muita pöytiä.'), h('details', {}, h('summary', {}, 'Aikuiselle'), note('Paikallisen opetusprofiilin, tehtäväryhmän ja sallittujen ryhmien yhteys puuttuu tai on ristiriitainen.')));
    return { reveal() {} };
  }
  let done = false, work: Work, check: HTMLButtonElement;
  const changed = () => { if (work) { onChange?.(work.read()); if (check) check.disabled = !(work.ready?.() ?? true); } };
  if (task.mode === 'composition') work = compositionWork(task);
  else if (task.mode === 'molecule-build') work = moleculeWork(task, changed);
  else if (task.mode === 'nutrient-matrix') work = nutrientWork(task, changed);
  else if (task.mode === 'protein-fragment') work = proteinWork(task, changed);
  else work = organicWork(task, changed);
  const reviewHost = h('div', { style: stack }), model = h('div', { style: stack });
  check = button(task.mode === 'organic-group' && task.review ? 'Siirry omaan perusteluun' : 'Tarkista oma tutkimus', () => {
    if (done) return;
    const response = work.read();
    if (task.mode !== 'organic-group' || response.mode !== 'organic-group' || !task.review) { done = true; submit(response); return; }
    const review = task.review;
    for (const field of work.node.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>('input,select,button')) field.disabled = true;
    for (const navigation of work.node.querySelectorAll<HTMLButtonElement>('[data-carbon-navigation]')) navigation.disabled = false;
    work.node.style.display = check.style.display = 'none';
    const area = h('div', { style: stack }), prompt = note(review.prompt), channels = h('div', { style: row });
    const explain = (channel: 'spoken' | 'written') => {
      area.replaceChildren(); prompt.style.display = 'block'; channels.style.display = 'flex';
      mountObservedExplanation({ kind: 'observed-explanation', channel, givens: [], ...review }, area, observed => {
        done = true; submit({ ...response, review: { channel, observations: observed.observations, confirmedByAdult: observed.confirmedByAdult, assistance: observed.assistance } });
      });
      for (const control of area.querySelectorAll<HTMLElement>('button,select,textarea,summary,input:not([type=checkbox]),label:has(input[type=checkbox])')) control.style.minHeight = '44px';
      area.querySelector<HTMLButtonElement>('[data-explanation-learner] button')?.addEventListener('click', () => { if (!area.querySelector<HTMLElement>('[data-explanation-adult]')!.hidden) { prompt.style.display = channels.style.display = 'none'; } });
      area.querySelector<HTMLButtonElement>('[data-explanation-adult] button[type=button]')?.addEventListener('click', () => { prompt.style.display = 'block'; channels.style.display = 'flex'; });
    };
    let sourceVisible = false;
    const toggle = button('Näytä oma tutkimus', () => { sourceVisible = !sourceVisible; work.node.style.display = sourceVisible ? 'grid' : 'none'; area.style.display = sourceVisible ? 'none' : 'grid'; toggle.textContent = sourceVisible ? 'Palaa perusteluun' : 'Näytä oma tutkimus'; });
    channels.append(button('Kerron omin sanoin', () => explain('spoken')), button('Kirjoitan tähän', () => explain('written')));
    reviewHost.replaceChildren(prompt, channels, toggle, area);
    explain('spoken');
  });
  check.disabled = !(work.ready?.() ?? true);
  work.node.addEventListener('change', changed);
  host.replaceChildren(h('div', { style: stack, 'data-carbon-workbench': task.mode }, work.node, check, reviewHost, model));
  onChange?.(work.read());
  return { reveal() { carbonKitchenExample(task)(model); } };
}
export const carbonKitchenExample = (task: CarbonKitchenTask): Paint => host => {
  const solution = solutionCarbonKitchen(task), lines: string[] = [];
  if (solution.mode === 'composition') lines.push('Hiilen tunnus on C.', ...solution.rows.map(r => `${r.id.toUpperCase()} · C-atomeja ${r.carbon}, ${r.type === 'element' ? 'alkuaine' : 'yhdiste'}.`));
  if (solution.mode === 'molecule-build') lines.push('Yksi valenssiehdot täyttävä sidostapa.', 'Alkuainehiili · alkuaine. CO₂ · epäorgaaninen hiiliyhdiste. Erillinen C ja O₂ · seos.');
  if (solution.mode === 'nutrient-matrix') lines.push(...solution.groups.map(r => `${r.id} · ${nutrientNames[r.group!]}`), `Pyydetty massa ${solution.massG} g. Ruoassa voi olla samanaikaisesti useita ryhmiä.`);
  if (solution.mode === 'protein-fragment') lines.push(`Yksi katkelma ${solution.chain.join(' — ')}. Aminohappojärjestykset voivat vaihdella. Kasvikoostumuksessa voi olla proteiineja.`);
  if (solution.mode === 'organic-group' && task.mode === 'organic-group') lines.push(...solution.marks.map(m => `${m.molecule} · ${m.carbon}–${m.oxygen}–${m.hydrogen}`), `Annettujen arvojen ero ${solution.differenceC} °C.`, ...(task.review ? [task.review.model, 'Malli ei ole aikuisen havainto omasta selityksestä.'] : []));
  host.replaceChildren(h('div', { style: panelStyle, 'data-carbon-model': '' }, h('strong', {}, 'Sulan malliesimerkki'), ...lines.map(note)));
  if (task.mode === 'molecule-build' && solution.mode === 'molecule-build') host.append(carbonMoleculePicture({ atoms: task.atoms, bonds: solution.bonds }));
};
