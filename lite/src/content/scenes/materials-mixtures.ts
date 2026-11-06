import type { Paint } from '../../engine/types';
import { h } from '../../ui/dom';
import { mountObservedExplanation } from './observed-explanations';
import { applyMatterAction, initialMatterLedger, materialsQuestions, mixtureNumber, mixtureExplanation, observationAction,
  solutionMaterialsMixtures, stationAction, trialAction, phaseLabels,
  type MaterialsMixturesResponse, type MaterialsMixturesTask, type MatterAction, type SeparationMethod } from '../models/materials-mixtures';

const grid = 'display:grid;gap:5px';
const row = 'display:flex;gap:5px;align-items:center;flex-wrap:wrap';
const panel = `${grid};padding:5px 7px;background:#f3f4e7;border:1px solid #9cb4a4;border-radius:9px;color:#204d43`;
const field = 'min-height:44px;min-width:44px;max-width:100%;box-sizing:border-box;border:1px solid #8ca99c;border-radius:7px;background:#fffdf3;color:#204d43;padding:3px 5px;font:inherit';
const note = (text: string) => h('p', { style: 'margin:0;font-size:13px;line-height:1.23' }, text);
const button = (text: string, run: () => void) => h('button', { type: 'button', class: 'btn small', style: 'min-height:44px;min-width:44px', onclick: run }, text);
const propertyName = { absorption: 'Vedenimeytyminen', bend: 'Taipuma', transmission: 'Valon läpäisy' };
function table(headers: readonly string[], rows: readonly (readonly (string | HTMLElement)[])[], attr: string) {
  return h('table', { [attr]: '', style: 'width:100%;border-collapse:collapse;font-size:13px;line-height:1.2' },
    h('thead', {}, h('tr', {}, ...headers.map(label => h('th', { scope: 'col', style: 'padding:2px 4px;text-align:left;border-bottom:1px solid #8da797' }, label)))),
    h('tbody', {}, ...rows.map(cells => h('tr', {}, ...cells.map(text => h('td', { style: 'padding:2px 4px;border-bottom:1px solid #d3ded0' }, text))))));
}
export function materialsMixturesBoard(task: MaterialsMixturesTask): Paint {
  return host => {
    const nodes: HTMLElement[] = [];
    if (task.samples && (task.skill !== 'property' || task.property)) {
      nodes.push(note('Nimiavain näille paloille · puu imee vettä; metalli taipuu eikä läpäise valoa; lasi läpäisee valoa eikä taivu. Muoto ei ratkaise.'),
        table(['Näyte / esine', 'Vettä imeytyi %', 'Taipuma mm', 'Valosta läpi %'], task.samples.map(s => [
          `${s.label} · ${s.object}`, String(s.absorption), String(s.bend), String(s.transmission),
        ]), 'data-mixture-materials'), note('Sama vesikäsittely, kuorma ja paksuus.'));
      if (task.property) nodes.push(note(`${propertyName[task.property]} ratkaisee tässä käyttötarkoituksessa. ${task.purpose}.`));
    }
    if (task.levels) nodes.push(note(task.levels.fact), note(`Nimet · ${task.levels.object} / ${task.levels.material} / ${task.levels.substance}`));
    if (task.states) nodes.push(table(['Näyte', task.stateExperiment === 'compress' ? 'Havainto kevyessä puristuksessa' : 'Havainto suljetussa astianvaihdossa', 'Massa mg'], task.states.map(s => [`${s.id.toUpperCase()} · ${s.label}`, s.behavior, String(s.massMg)]), 'data-mixture-states'),
      note('Näkyvä vesipisarasumu on nestepisaroita, ei kaasumaista vesihöyryä. Kaasu voi olla näkymätöntä.'));
    if (task.phase) nodes.push(note(task.phase.temperature), note(`Saman vesinäytteen lähtömassa ${task.phase.massMg} mg. Suljettu kokonaisuus.`));
    if (task.compositions) for (const s of task.compositions) nodes.push(h('div', { style: panel, 'data-mixture-composition': s.id },
      h('strong', {}, s.label), note(s.substances.map(x => `${x.name} (${x.formula}) · ${x.count} malliosuutta`).join(' + ')),
      note(`Alue 1 [${s.regions[0]!.join(' : ')}], alue 2 [${s.regions[1]!.join(' : ')}]. ${s.phases} faasi${s.phases === 1 ? '' : 'a'}; ${s.clear ? 'kirkas' : 'rajapintoja nähtävissä'}.`)));
    if (task.trials) nodes.push(table(['Koe / liuotin / aine', 'Liuotin mg', 'Lisätty mg', 'Enintään liukenee mg', '°C'], task.trials.map(t => [
      `${t.label} · ${t.solvent} + ${t.solute}`, String(t.solventMg), String(t.doseMg), String(t.capacityMg), String(t.temperatureC),
    ]), 'data-mixture-trials'), note('Kapasiteetti on tämän liuotinmäärän ja lämpötilan malliehto. Ylijäämä jää liukenematta.'));
    if (task.stations) nodes.push(note(task.stations.length > 1 ? 'Tutki kolme työpistettä niiden omilla välilehdillä.' : 'Työpisteen aineet ja annetut erotusehdot näkyvät omien ennusteiden vieressä.'));
    host.replaceChildren(h('div', { style: grid, 'data-mixture-givens': task.mode }, ...nodes));
  };
}
function ledgerView(task: MaterialsMixturesTask, actions: readonly MatterAction[]) {
  let ledger = initialMatterLedger(task);
  for (const action of actions) ledger = applyMatterAction(ledger, action);
  return h('div', { style: grid, 'data-mixture-ledger': '' }, ...ledger.vessels.filter(v => v.parcels.length).map(v => h('div', { style: panel, 'data-mixture-vessel': v.id },
    h('strong', {}, v.label), ...v.parcels.map(p => h('span', { style: 'font-size:12px;line-height:1.2', 'data-matter-root': p.root },
      `${p.substance} · ${p.massMg} mg · ${p.zone === 'dissolved' ? 'liuennut' : phaseLabels[p.phase]}${p.zone === 'bottom' ? ', pohjalla' : ''}`)))));
}

function stationGiven(s: NonNullable<MaterialsMixturesTask['stations']>[number]) {
  const target = s.initial.parcels.find(p => p.root === s.targetRoot)!;
  return h('div', { style: panel, 'data-mixture-station': s.id }, h('strong', {}, `${s.label} · tavoite ${target.substance} → ${s.targetBin === 'residue' ? 'jäännösastia' : 'kaadettu / läpäissyt neste'}`),
    note(s.initial.parcels.map(p => `${p.substance} ${p.massMg} mg · ${p.zone === 'dissolved' ? 'liuennut, haihtumaton' : p.phase === 'liquid' ? 'haihtuva neste' : `liukenematon rae ${p.grainUm} µm`}`).join('; ')),
    note(`Huokonen ${s.poreUm} µm. ${s.settled ? 'Laskeutunut ja sekoitettu rinnakkaisnäyte. Laskeutuneesta kaadetaan 3/4 liuoksesta, 1/4 jää pohjalle.' : s.method === 'evaporate' ? 'Liuennut aine ei haihdu näissä oloissa. Haihtuva liuotin kerätään kaasuastiaan.' : 'Rakeet liukenemattomia; ei laskeumaa. Tavoite on erottaa rakeet liuenneesta aineesta. Suodatuksessa liuos läpäisee.'}`));
}
function mountSeparation(task: MaterialsMixturesTask, host: HTMLElement, submit: (r: MaterialsMixturesResponse) => void,
  onChange?: (r: MaterialsMixturesResponse) => void): { reveal(): void } {
  const questions = materialsQuestions(task);
  const fields = questions.map(q => {
    const control = q.options ? h('select', { 'aria-label': q.label, style: `${field};width:${q.id.startsWith('class:') ? 180 : 126}px;flex:none` }, h('option', { value: '' }, '—'), ...q.options.map(([value, label]) => h('option', { value }, label)))
      : h('input', { type: 'text', inputmode: 'decimal', 'aria-label': q.label, style: `${field};width:76px` });
    return { q, control, read: () => q.options ? control.value : mixtureNumber(control.value) ? control.value.trim() : '',
      node: h('label', { style: 'display:flex;justify-content:space-between;gap:5px;align-items:center' }, h('span', { style: 'font-size:13px;line-height:1.15' }, q.label, q.unit ? ` (${q.unit})` : ''), control) };
  });
  let actions: MatterAction[] = [], finished = false;
  const locked = new Set<string>();
  const current = (): MaterialsMixturesResponse => ({ kind: 'materials-mixtures', mode: task.mode,
    values: Object.fromEntries(fields.map(f => [f.q.id, f.read()])), actions: [...actions], predictionsLocked: locked.size > 0 });
  const tabs = h('div', { style: row }), panels = h('div');
  const done = h('button', { type: 'submit', class: 'btn primary', style: 'min-height:44px', 'data-mixture-submit': '' }, task.review ? 'Siirry omaan selitykseen' : 'Tarkista näytteet');
  done.disabled = true;
  const stationPanels = task.stations!.map(s => {
    const own = fields.filter(f => f.q.id.endsWith(`:${s.id}`));
    const inputs = h('div', { style: `${grid};grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 9px`, 'data-mixture-fields': '' }, ...own.map(f => f.node));
    const readback = h('div', { style: 'display:none;font-size:12px;line-height:1.2' });
    const output = h('div', { style: grid });
    const status = note('Ennusta, lukitse ja tee erotus. Massa säilyy astioissa.'); status.setAttribute('role', 'status');
    const operate = button(`Tee erotus · ${s.label}`, () => {
      if (!locked.has(s.id) || operate.disabled) return;
      const method = own.find(f => f.q.id === `method:${s.id}`)!.read() as SeparationMethod;
      const sample = own.find(f => f.q.id === `sample:${s.id}`)?.read();
      const action = stationAction(task, s, method);
      // A newly stirred suspension is intentionally not a valid settled specimen.
      if (method === 'decant' && sample !== 'settled') {
        status.textContent = 'Sekoitettu näyte ei ole valmis dekantoitavaksi. Ennuste säilyy vertailua varten.';
        action.source = `${s.id}:stirred`;
      }
      actions.push(action); operate.disabled = true;
      const all = ledgerView(task, actions);
      for (const vessel of [...all.querySelectorAll<HTMLElement>('[data-mixture-vessel]')]) if (!vessel.dataset.mixtureVessel!.startsWith(s.id)) vessel.remove();
      output.replaceChildren(all);
      readback.style.display = ''; inputs.style.display = 'none';
      readback.textContent = own.map(f => `${f.q.label.replace(s.label + ', ', '')}: ${f.q.options?.find(([v]) => v === f.read())?.[1] ?? f.read()}`).join(' · ');
      tab.textContent = `${s.label} ✓`;
      done.disabled = actions.length !== task.stations!.length;
      onChange?.(current());
    });
    operate.disabled = true;
    const lock = button(`Lukitse · ${s.label}`, () => {
      if (own.some(f => !f.read())) { status.textContent = 'Täydennä tämän pisteen ennusteet.'; return; }
      locked.add(s.id); own.forEach(f => { f.control.disabled = true; }); lock.disabled = true; operate.disabled = false;
      status.textContent = 'Oma ennuste lukittu. Nyt voit tehdä tämän pisteen kokeen.';
    });
    const panelNode = h('div', { style: grid, 'data-mixture-station-work': s.id }, stationGiven(s), status, inputs, readback,
      h('div', { style: row }, lock, operate), output);
    const tab = button(s.label, () => {
      stationPanels.forEach(p => { p.panelNode.style.display = p.panelNode === panelNode ? 'grid' : 'none'; p.tab.setAttribute('aria-pressed', String(p.panelNode === panelNode)); });
    }); tab.setAttribute('aria-pressed', String(s === task.stations![0]));
    return { panelNode, tab, own, output, lock, operate, inputs, readback };
  });
  stationPanels.forEach((p, i) => { p.panelNode.style.display = i === 0 ? 'grid' : 'none'; panels.append(p.panelNode); tabs.append(p.tab); });
  const form = h('form', { style: grid, 'data-mixture-workbench': task.mode }, ...(stationPanels.length > 1 ? [tabs] : []), panels, done);
  const reviewHost = h('div', { style: grid });
  let adult: ReturnType<typeof mountObservedExplanation> | undefined;
  form.addEventListener('submit', event => {
    event.preventDefault(); if (finished || done.disabled) return;
    const answer = current(); finished = true;
    for (const control of form.querySelectorAll('button,input,select')) control.setAttribute('disabled', '');
    if (!task.review) { submit(answer); return; }
    form.style.display = 'none'; reviewHost.append(note(task.review.prompt), h('details', {}, h('summary', {}, 'Omat kolme koetta ja massahavainnot'), ...stationPanels.map(p => h('div', { style: grid }, stationGiven(task.stations!.find(s => s.id === p.panelNode.dataset.mixtureStationWork)!), p.readback, p.output))));
    const area = h('div'); reviewHost.append(area);
    adult = mountObservedExplanation(mixtureExplanation(task.review), area, observed => submit({ ...answer,
      review: { observations: observed.observations, confirmedByAdult: observed.confirmedByAdult, assistance: observed.assistance } }));
    for (const control of area.querySelectorAll<HTMLElement>('button,select,input:not([type="checkbox"])')) control.style.minHeight = '44px';
  });
  host.replaceChildren(form, reviewHost);
  return { reveal() {
    if (adult) { adult.reveal(); return; }
    const answer = solutionMaterialsMixtures(task); actions = [...answer.actions]; finished = true;
    for (const f of fields) { f.control.value = answer.values[f.q.id]!; f.control.disabled = true; }
    for (const p of stationPanels) {
      p.lock.disabled = true; p.operate.disabled = true; p.inputs.style.display = 'none'; p.readback.style.display = '';
      p.readback.textContent = p.own.map(f => `${f.q.label}: ${f.read()}`).join(' · ');
      const all = ledgerView(task, actions);
      for (const vessel of [...all.querySelectorAll<HTMLElement>('[data-mixture-vessel]')]) if (!vessel.dataset.mixtureVessel!.startsWith(p.panelNode.dataset.mixtureStationWork!)) vessel.remove();
      p.output.replaceChildren(note('Mallikoe, ei oppijan oma havaittu vastaus.'), all);
    }
    done.disabled = true; if (task.review) form.append(note(`Malliselitys. ${task.review.model}`)); onChange?.(answer);
  } };
}
export function mountMaterialsMixtures(task: MaterialsMixturesTask, host: HTMLElement,
  submit: (response: MaterialsMixturesResponse) => void, onChange?: (response: MaterialsMixturesResponse) => void): { reveal(): void } {
  if (task.mode === 'separate') return mountSeparation(task, host, submit, onChange);
  const questions = materialsQuestions(task);
  const fields = questions.map(q => {
    const control = q.options ? h('select', { 'aria-label': q.label, style: `${field};width:${q.id.startsWith('class:') ? 180 : 126}px;flex:none` }, h('option', { value: '' }, '—'),
      ...q.options.map(([value, label]) => h('option', { value }, label))) : h('input', { type: 'text', inputmode: 'decimal',
        'aria-label': q.label, autocomplete: 'off', style: `${field};width:80px` });
    return { q, control, node: h('label', { style: 'display:flex;align-items:center;gap:5px;justify-content:space-between;min-width:0' },
      h('span', { style: 'font-size:13px;line-height:1.2' }, q.id.startsWith('change:') ? `Tilavuus ${q.id.split(':')[1]!.toUpperCase()}` : q.id.startsWith('class:') ? `${q.id.split(':')[1]!.toUpperCase()} · luokitus` : q.label, q.unit ? ` (${q.unit})` : ''), control),
      read: () => q.options ? control.value : mixtureNumber(control.value) ? control.value.trim() : '' };
  });
  let locked = false, finished = false;
  let actions: MatterAction[] = [];
  const experimental = !!(task.trials || task.stations || task.states || task.phase);
  const current = (): MaterialsMixturesResponse => ({ kind: 'materials-mixtures', mode: task.mode,
    values: Object.fromEntries(fields.map(f => [f.q.id, f.read()])), actions: [...actions], predictionsLocked: locked });
  const output = h('div', { 'data-mixture-observation': '', style: grid });
  const status = note(experimental ? '1. Oma ennuste → 2. Lukitus → 3. Omat koetoimet → 4. Tarkistus' : 'Järjestä näytekortit havaintojen perusteella.');
  status.setAttribute('role', 'status');
  const instruments = h('div', { style: row });
  const lock = button('Lukitse ennusteet', () => {
    if (fields.some(f => !f.read())) { status.textContent = 'Täydennä kaikki omat ennusteet ennen koetta.'; return; }
    locked = true;
    for (const f of fields) f.control.disabled = true;
    lock.disabled = true; status.textContent = 'Ennusteet lukittu. Tee jokaisen pisteen oma kokeilu.';
    for (const control of instruments.querySelectorAll('button')) control.disabled = false;
    onChange?.(current());
  });
  const controls: HTMLButtonElement[] = [];
  const operate = (label: string, create: () => MatterAction, shortLabel?: string) => {
    const btn = button(label, () => {
      if (!locked || btn.disabled) return;
      const action = create(); actions.push(action); btn.disabled = true;
      output.replaceChildren(ledgerView(task, actions));
      if (task.mode === 'state') output.append(note(task.stateExperiment === 'compress' ? 'Kevyessä puristuksessa kaasun tilavuus pienenee selvästi. Kiinteän ja nesteen tilavuus pysyy lähes samana.' : 'Astia vaihtui korkeasta leveäksi. Kiinteä säilyttää muodon, neste saman tilavuuden, kaasu täyttää uuden tilan.'));
      status.textContent = 'Havainto näkyy massakirjassa. Vertaa omaan ennusteeseen.';
      done.disabled = controls.some(c => !c.disabled);
      if (!done.disabled) {
        fieldGrid.style.display = 'none';
        const readback = note(fields.map(f => `${f.q.label}: ${f.q.options?.find(([v]) => v === f.read())?.[1] ?? f.read()}`).join(' · '));
        output.prepend(readback);
      }
      onChange?.(current());
    });
    if (shortLabel) { btn.textContent = shortLabel; btn.setAttribute('aria-label', label); }
    btn.disabled = true; controls.push(btn); instruments.append(btn);
  };
  for (const s of task.stations ?? []) operate(`Tee erotus · ${s.label}`, () => {
    const selected = fields.find(f => f.q.id === `method:${s.id}`)!.read() as SeparationMethod;
    return stationAction(task, s, selected);
  });
  for (const t of task.trials ?? []) operate(`Sekoita · ${t.label}`, () => trialAction(task, t));
  for (const s of task.states ?? []) operate(`${task.stateExperiment === 'compress' ? 'Purista näytettä' : 'Vaihda astia'} · ${s.label}`, () => observationAction(task, s.id), `${task.stateExperiment === 'compress' ? 'Purista' : 'Astia'} ${s.id.toUpperCase()}`);
  if (task.phase) operate('Tee lämpötilakoe', () => observationAction(task, 'water'));
  const done = h('button', { type: 'submit', class: 'btn primary', style: 'min-height:44px;min-width:44px',
    'data-mixture-submit': '' }, task.review ? 'Siirry omaan selitykseen' : 'Tarkista näytteet');
  done.disabled = experimental;
  const fieldGrid = h('div', { style: `${grid};grid-template-columns:repeat(auto-fit,minmax(220px,1fr));column-gap:12px`, 'data-mixture-fields': '' }, ...fields.map(f => f.node));
  const form = h('form', { 'data-mixture-workbench': task.mode, style: grid }, status, fieldGrid,
    ...(experimental ? [h('div', { style: row }, lock, instruments)] : []), output, done);
  const reviewHost = h('div', { style: grid });
  let adult: ReturnType<typeof mountObservedExplanation> | undefined;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (finished || (experimental && controls.some(c => !c.disabled))) return;
    locked = true;
    const answer = current();
    for (const control of form.querySelectorAll('input,select,button')) control.setAttribute('disabled', '');
    finished = true;
    if (!task.review) { submit(answer); return; }
    form.style.display = 'none';
    reviewHost.append(note(task.review.prompt), h('details', {}, h('summary', {}, 'Omat merkinnät ja massahavainnot'),
      ...fields.map(f => note(`${f.q.label}: ${f.q.options?.find(([value]) => value === f.read())?.[1] ?? f.read()} ${f.q.unit ?? ''}`)), output));
    const area = h('div'); reviewHost.append(area);
    adult = mountObservedExplanation(mixtureExplanation(task.review), area, observation => submit({ ...answer,
      review: { observations: observation.observations, confirmedByAdult: observation.confirmedByAdult, assistance: observation.assistance } }));
    for (const control of area.querySelectorAll<HTMLElement>('button,select,input:not([type="checkbox"])')) control.style.minHeight = '44px';
    const confirmation = area.querySelector<HTMLInputElement>('input[type="checkbox"]')?.closest('label');
    if (confirmation) confirmation.style.minHeight = '44px';
  });
  host.replaceChildren(form, reviewHost);
  return { reveal() {
    if (adult) { adult.reveal(); return; }
    const answer = solutionMaterialsMixtures(task);
    for (const f of fields) { f.control.value = answer.values[f.q.id]!; f.control.disabled = true; }
    locked = true; finished = true; actions = [...answer.actions];
    output.replaceChildren(ledgerView(task, actions));
    for (const control of form.querySelectorAll('button')) control.disabled = true;
    status.textContent = 'Mallikoe ja mallimerkinnät. Tämä ei ole oppijan oma havaittu vastaus.';
    if (task.review) output.append(note(`Malliselitys. ${task.review.model}`));
    onChange?.(answer);
  } };
}
export function materialsMixturesExample(task: MaterialsMixturesTask): Paint {
  return host => {
    const givens = h('div'), work = h('div'); materialsMixturesBoard(task)(givens);
    mountMaterialsMixtures(task, work, () => {}).reveal();
    work.querySelector('[data-mixture-submit]')?.remove(); host.replaceChildren(givens, work);
  };
}
