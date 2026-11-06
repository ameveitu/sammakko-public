import type { Paint } from '../../engine/types';
import { h } from '../../ui/dom';
import { mountObservedExplanation } from './observed-explanations';
import { lifecycleRoleNames, lifecycleStageNames, solutionLifecycleHarbor, type ComparisonAnswer, type ComparisonData, type EnergyAnswer, type EnergyData, type LifecycleFlow, type LifecycleHarborResponse, type LifecycleHarborTask, type LifecycleRole, type LifecycleStage, type MaterialAnswer, type MaterialData, type ResourceAnswer, type ResourceData, type StageAnswer, type StageData } from '../models/lifecycle-harbor';

const stack = 'display:grid;gap:5px;min-width:0';
const row = 'display:flex;gap:5px;align-items:center;flex-wrap:wrap;min-width:0';
const small = 'margin:0;font-size:13px;line-height:1.23;color:#284a40';
const field = 'min-height:44px;padding:5px 7px;border:1px solid #8ca698;border-radius:8px;background:#fffef6;color:#234438;font:inherit;font-size:14px;box-sizing:border-box;min-width:0';
const panel = `${stack};padding:7px 8px;background:#eff3e7;border:1px solid #a9ba9f;border-radius:9px`;
const note = (text: string) => h('p', { style: small }, text);
const button = (text: string, action: () => void, nav = false) => h('button', { type: 'button', class: 'btn small', style: 'min-height:44px', onclick: action, ...(nav ? { 'data-lifecycle-nav': '' } : {}) }, text);
function menu(label: string, options: readonly (readonly [string, string])[]) {
  return h('select', { 'aria-label': label, style: `${field};flex:1;width:100%;min-width:0` }, h('option', { value: '' }, 'Valitse'), ...options.map(([value, name]) => h('option', { value }, name)));
}
function numeric(label: string) {
  const input = h('input', { type: 'text', inputmode: 'numeric', maxlength: 8, 'aria-label': label, style: `${field};width:95px` });
  const read = () => /^\d{1,7}$/.test(input.value.trim()) && Number(input.value.trim()) <= 10000000 ? Number(input.value.trim()) : null;
  input.addEventListener('blur', () => { if (read() === null) input.value = ''; });
  return { input, read };
}
function picture(nodes: readonly { id: string; label: string }[], edges: readonly { from: string; to: string; label?: string }[], named = false): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', '0 0 330 105'); svg.setAttribute('role', 'img'); svg.setAttribute('data-lifecycle-picture', '');
  svg.setAttribute('aria-label', `Oma telakkakartta. ${edges.map(e => `${nodes.find(n => n.id === e.from)?.label ?? e.from} → ${nodes.find(n => n.id === e.to)?.label ?? e.to} ${e.label ?? ''}`).join('. ')}`);
  svg.style.cssText = 'width:100%;height:105px;display:block;background:#f6f4e7;border-radius:8px';
  const draw = (tag: string, attrs: Record<string, string | number>, text?: string) => { const e = document.createElementNS(svg.namespaceURI, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v)); if (text) e.textContent = text; svg.append(e); };
  const positions = nodes.map((n, i) => ({ ...n, x: named ? 70 + i * 190 : 40 + i % 4 * 82, y: 28 + Math.floor(i / 4) * 51 }));
  for (const edge of edges) {
    const a = positions.find(n => n.id === edge.from), b = positions.find(n => n.id === edge.to); if (!a || !b) continue;
    if (a === b) { draw('circle', { cx: a.x + 12, cy: a.y, r: 12, stroke: '#6e8d76', fill: 'none' }); continue; }
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy), x = b.x - dx / len * 11, y = b.y - dy / len * 11;
    draw('line', { x1: a.x, y1: a.y, x2: x, y2: y, stroke: '#6c917a', 'stroke-width': 2 });
    draw('path', { d: `M${x},${y} l${-dx / len * 7 - dy / len * 3},${-dy / len * 7 + dx / len * 3} l${dy / len * 6},${-dx / len * 6} Z`, fill: '#52765d' });
  }
  for (const n of positions) { draw('circle', { cx: n.x, cy: n.y, r: 7, fill: '#d6c59b', stroke: '#7a865b' }); draw('text', { x: n.x, y: n.y + 20, 'text-anchor': 'middle', 'font-size': 11, fill: '#294b3c' }, named ? n.label : n.id); }
  return svg;
}
interface Work<T> { node: HTMLElement; read(): T; ready?(): boolean }
function resourceWork(data: ResourceData): Work<ResourceAnswer> {
  const roles = new Map<string, LifecycleRole | null>(), path: string[] = [];
  const card = menu('Alkuperäpassin kortti', data.cards.map(c => [c.id, `${c.id} · ${c.label}`])), role = menu('Kortin oma luokka', Object.entries(lifecycleRoleNames));
  const given = note(''), chart = h('div'), pathText = note(''); card.value = data.cards[0]!.id; card.setAttribute('data-lifecycle-nav', '');
  const paint = () => { const current = data.cards.find(c => c.id === card.value)!; given.textContent = `${current.label}. ${current.description}`; role.value = roles.get(current.id) ?? ''; chart.replaceChildren(picture(data.cards, path.slice(1).map((to, i) => ({ from: path[i]!, to })))); pathText.textContent = `Oma reitti ${path.join(' → ') || 'ei vielä kortteja'}`; };
  card.addEventListener('change', () => { if (!card.value) card.value = data.cards[0]!.id; paint(); }); role.addEventListener('change', () => { roles.set(card.value, (role.value || null) as LifecycleRole | null); paint(); });
  const add = button('Liitä kortti omaan reittiin', () => { if (card.value && !path.includes(card.value)) { path.push(card.value); paint(); } });
  const undo = button('Poista reitin viimeinen', () => { path.pop(); paint(); });
  paint();
  return { node: h('div', { style: stack }, note(data.direction === 'object-to-source' ? 'Jäljitä käyttöesineestä takaisin luonnonvaraan. Luokittele kaikki annetut kortit.' : 'Rakenna luonnonvarasta käyttöesineeseen. Luokittele kaikki annetut kortit.'), chart, card, h('div', { style: panel }, given), h('label', { style: row }, 'Oma luokka', role), h('div', { style: row }, add, undo), pathText, h('details', {}, h('summary', {}, 'Annetut jalostusyhteydet ja rajaus'), note(data.connections.map(e => `${e.from} → ${e.to} · ${e.process}`).join(' / ')), note(data.limit))),
    read: () => ({ roles: data.cards.map(c => ({ card: c.id, role: roles.get(c.id) ?? null })), path: [...path] }) };
}
function stageWork(data: StageData): Work<StageAnswer> {
  const assignments = new Map<string, LifecycleStage | null>(), edges = new Map<string, StageAnswer['edges'][number]>();
  const event = menu('Elinkaaren tapahtuma', data.events.map(e => [e.id, `${e.id} · ${e.label}`])), stage = menu('Tapahtuman oma vaihe', Object.entries(lifecycleStageNames));
  const transition = menu('Tarkasteltava yhteys', data.transitions.map(t => [t.id, t.id])), from = menu('Yhteyden oma lähtö', data.events.map(e => [e.id, e.label])), to = menu('Yhteyden oma tulo', data.events.map(e => [e.id, e.label]));
  event.value = data.events[0]!.id; transition.value = data.transitions[0]!.id;
  for (const n of [event, transition]) n.setAttribute('data-lifecycle-nav', '');
  const description = note(''), connection = note(''), chart = h('div'), status = note('');
  const render = () => { chart.replaceChildren(picture(data.events, [...edges.values()])); status.textContent = `Omat vaiheet ${assignments.size}/${data.events.length}, yhteydet ${edges.size}/${data.transitions.length}.`; };
  const showEvent = () => { const e = data.events.find(e => e.id === event.value)!; description.textContent = `${e.label}. ${e.description}`; stage.value = assignments.get(e.id) ?? ''; };
  const showEdge = () => { const t = data.transitions.find(t => t.id === transition.value)!; connection.textContent = t.description; from.value = edges.get(t.id)?.from ?? ''; to.value = edges.get(t.id)?.to ?? ''; };
  event.addEventListener('change', () => { if (!event.value) event.value = data.events[0]!.id; showEvent(); }); stage.addEventListener('change', () => { assignments.set(event.value, (stage.value || null) as LifecycleStage | null); render(); });
  transition.addEventListener('change', () => { if (!transition.value) transition.value = data.transitions[0]!.id; showEdge(); });
  for (const n of [from, to]) n.addEventListener('change', () => { edges.set(transition.value, { transition: transition.value, from: from.value, to: to.value }); render(); });
  const partA = h('div', { style: stack }, event, h('div', { style: panel }, description), h('label', { style: row }, 'Oma vaihe', stage));
  const partB = h('div', { style: `${stack};display:none` }, transition, h('div', { style: panel }, connection), h('div', { style: row }, from, to));
  let connections = false;
  const toggle = button('Rakenna omat yhteydet', () => { connections = !connections; partA.style.display = connections ? 'none' : 'grid'; partB.style.display = connections ? 'grid' : 'none'; toggle.textContent = connections ? 'Palaa tapahtumien vaiheisiin' : 'Rakenna omat yhteydet'; }, true);
  showEvent(); showEdge(); render();
  return { node: h('div', { style: stack }, note(`${data.product}. Tutki ${data.focus === 'repair-return' ? 'korjauksen paluureittiä' : data.focus === 'end-options' ? 'uudelleenkäytön ja materiaalin palautuksen eroa' : 'uuden esineen huoltoa ja kaikkia paluuvaihtoehtoja'}. Varaosan tarve ${data.repairMaterialG} g.`), chart, partA, partB, status, toggle), read: () => ({ assignments: data.events.map(e => ({ event: e.id, stage: assignments.get(e.id) ?? null })), edges: data.transitions.map(t => edges.get(t.id) ?? { transition: t.id, from: '', to: '' }) }) };
}
const materialZones: readonly (readonly [string, string])[] = [['outside', 'Uusi ulkoinen panos'], ['opening-stock', 'Alun paluuvarasto'], ['factory', 'Valmistamo'], ['use', 'Tuote käyttöön'], ['side-use', 'Sivutuote käyttöön'], ['environment', 'Ympäristöön'], ['sorter', 'Lajittelu'], ['closing-stock', 'Lopun paluuvarasto'], ['residue', 'Hylätty jäännös']];
const materialFlows = [
  ['fresh', 'Uusi materiaalipanoksen saapuminen'], ['opening', 'Alkuvaraston käyttö valmistamiseen'], ['product', 'Varsinainen tuote'], ['side', 'Erilliseen käyttöön päätyvä sivutuote'], ['dust', 'Ilmaan siirtyvä materiaalipöly'], ['sort', 'Lajitteluun kerätty leikkuujäännös'], ['returned', 'Saannon ja laadun ehdot täyttävä palautus'], ['reject', 'Lajittelun hylätty osa'],
] as const;
const energyZones: readonly (readonly [string, string])[] = [['electricity', 'Sähkölähde'], ['fuel', 'Polttoaine'], ['before', 'Alkuperäinen erä'], ['useful', 'Hyödyllinen palvelu'], ['heat', 'Alkuperäinen lämpövirta'], ['purchased', 'Seuraavan erän ostoenergia'], ['recovered', 'Edellisen erän lämpövarasto'], ['after', 'Seuraava sama erä'], ['environment', 'Ympäristöön'], ['next-heat-stock', 'Lämpöä seuraavaan varastoon']];
const energyFlows = [
  ['electric', 'Alkuperäisen erän sähköpanos'], ['fuel', 'Alkuperäisen erän polttoainepanos'], ['useful', 'Alkuperäisen erän hyödyllinen energia'], ['heat', 'Alkuperäisen erän lämpövirta'],
  ['after-purchase', 'Seuraavan erän ostettu energia'], ['after-return', 'Edellisen erän varastosta käytettävä lämpö'], ['after-useful', 'Seuraavan erän sama hyödyllinen palvelu'], ['after-heat', 'Seuraavan erän ympäristöön siirtyvä lämpö'], ['after-store', 'Seuraavan erän lämpövarastoon jäävä energia'],
] as const;
const flowCaptions: Record<string, string> = { outside: 'Uusi aine', 'opening-stock': 'Alkuvarasto', factory: 'Valmistamo', use: 'Käyttö', 'side-use': 'Sivutuote', environment: 'Ympäristö', sorter: 'Lajittelu', 'closing-stock': 'Paluuvarasto', residue: 'Jäännös', electricity: 'Sähkö', fuel: 'Polttoaine', before: 'Alkuperäinen erä', useful: 'Hyöty', heat: 'Lämpö', purchased: 'Ostoenergia', recovered: 'Palautuva lämpö', after: 'Seuraava erä', 'next-heat-stock': 'Lämpövarasto' };
function materialGiven(data: MaterialData): string {
  return `${data.batch}. Seurattava aine ${data.substance}. Valmistukseen tulee ${data.freshG} g uutta ja ${data.openingReturnedG} g alun paluuvarastosta. Sivutuote ${data.sideG} g, pöly ${data.dustG} g, lajitteluun ${data.sortableG} g. Lajittelun saanto ${data.recoveryNumerator}/${data.recoveryDenominator}, laatu sallii enintään ${data.qualityLimitG} g palautuksen. Loput jäävät jäännökseen. Tuotteen massa päätellään taseesta.`;
}
function energyGiven(data: EnergyData): string {
  return `${data.batch}, vaihe ${data.stage}. ${data.electricKj} kJ sähköä + ${data.fuelKj} kJ polttoaineesta. Hyödyllinen palvelu ${data.usefulKj} kJ. Loppu siirtyy lämpönä. ${data.plan === 'insulate' ? `Eristys vähentää tarvittavaa lämpöhäviötä ${data.savedKj} kJ samalla palvelulla. Lämmön palautusta ei käytetä.` : `Edellisestä samanlaisesta erästä saadaan talteen ${data.recoveryNumerator}/${data.recoveryDenominator} lämpövirrasta, mutta vain ${data.compatibleDemandKj} kJ sopii seuraavan erän tarpeeseen. Sama määrä varataan seuraavasta erästä jälleen varastoon, muu lämpö ympäristöön.`}`;
}
/** The simulated run evaluates the learner's committed allocation. It never replaces it with an answer. */
function flowWork(mode: 'material' | 'energy', data: MaterialData | EnergyData): Work<MaterialAnswer | EnergyAnswer> {
  const material = mode === 'material', ids = material ? materialFlows : energyFlows, zones = material ? materialZones : energyZones, unit = material ? 'g' : 'kJ';
  const values = new Map<string, LifecycleFlow>(), flow = menu('Tarkasteltava oma virta', ids), from = menu('Virran oma lähtö', zones), to = menu('Virran oma määränpää', zones), amount = numeric(`Virran oma määrä ${unit}`), next = numeric(material ? 'Seuraavan saman erän uusi materiaalitarve g' : 'Seuraavan saman erän ostettava energia kJ');
  flow.value = ids[0]![0]; flow.setAttribute('data-lifecycle-nav', '');
  let locked = false, operated = false;
  const status = note(''), chart = h('div'), given = note(material ? materialGiven(data as MaterialData) : energyGiven(data as EnergyData)), forecast = h('div', { style: stack });
  const readFlows = () => ids.map(([id]) => values.get(id) ?? { id, from: '', to: '', amount: null });
  const renderChart = () => {
    const active = values.get(flow.value), selected = zones.filter(([id]) => id === active?.from || id === active?.to);
    const svg = picture(selected.map(([id]) => ({ id, label: flowCaptions[id]! })), active?.from && active.to ? [{ ...active, label: `${active.amount ?? '?'} ${unit}` }] : [], true);
    svg.setAttribute('viewBox', '0 0 330 55'); svg.style.height = '55px'; chart.replaceChildren(svg);
  };
  const paint = () => {
    const own = values.get(flow.value); from.value = own?.from ?? ''; to.value = own?.to ?? ''; amount.input.value = own?.amount === null || own?.amount === undefined ? '' : String(own.amount);
    renderChart();
  };
  const write = () => { if (locked) return; values.set(flow.value, { id: flow.value, from: from.value, to: to.value, amount: amount.read() }); renderChart(); };
  flow.addEventListener('change', () => { if (!flow.value) flow.value = ids[0]![0]; paint(); });
  for (const n of [from, to, amount.input]) n.addEventListener(n === amount.input ? 'input' : 'change', write);
  const table = h('div', { tabindex: 0, role: 'region', 'aria-label': 'Oma täydellinen virta-taulukko', style: 'display:none;max-height:100px;overflow:auto' });
  const renderTable = () => table.replaceChildren(h('table', { style: 'width:100%;font-size:12px', 'data-lifecycle-flow-ledger': '' }, h('tbody', {}, ...readFlows().map(f => h('tr', {}, h('td', {}, ids.find(([id]) => id === f.id)![1]), h('td', {}, `${zones.find(([id]) => id === f.from)?.[1] ?? '?'} → ${zones.find(([id]) => id === f.to)?.[1] ?? '?'}`), h('td', {}, `${f.amount ?? '?'} ${unit}`))))));
  let ledgerVisible = false;
  const toggle = button('Katso oma virta-taulukko', () => { ledgerVisible = !ledgerVisible; renderTable(); table.style.display = ledgerVisible ? 'block' : 'none'; chart.style.display = forecast.style.display = ledgerVisible ? 'none' : 'grid'; toggle.textContent = ledgerVisible ? 'Palaa omaan virtaan' : 'Katso oma virta-taulukko'; }, true);
  const run = button('Kokeile lukittua omaa tiliä', () => {
    operated = true;
    const list = readFlows(), incoming = (zone: string) => list.filter(f => f.to === zone).reduce((s, f) => s + (f.amount ?? 0), 0), outgoing = (zone: string) => list.filter(f => f.from === zone).reduce((s, f) => s + (f.amount ?? 0), 0);
    status.textContent = material ? `Oman valmistamon sisään ${incoming('factory')} g, ulos ${outgoing('factory')} g. Oman lajittelun sisään ${incoming('sorter')} g, ulos ${outgoing('sorter')} g. Vertaa suuntia ja määriä annettuihin tietoihin.` : `Oman alkuperäisen erän sisään ${incoming('before')} kJ, ulos ${outgoing('before')} kJ. Oman seuraavan erän sisään ${incoming('after')} kJ, ulos ${outgoing('after')} kJ. Energia siirtyy myös ympäristöön ja varastoon.`;
    run.disabled = true;
  }); run.style.display = 'none';
  const lock = button('Lukitse oma virtaennuste', () => {
    write(); if (readFlows().some(f => !f.from || !f.to || f.amount === null) || next.read() === null) { status.textContent = 'Täytä ensin jokaisen oman virran suunta, määrä ja seuraavan erän panos.'; return; }
    locked = true; for (const n of [from, to, amount.input, next.input]) n.disabled = true; lock.style.display = 'none'; run.style.display = 'block'; status.textContent = 'Oma tili on lukittu. Kokeile sitä, jotta saat havaittavan vertailun.';
  });
  forecast.append(h('div', { style: row }, from, to, amount.input)); paint();
  return { node: h('div', { style: stack }, h('div', { style: panel, 'data-lifecycle-flow-given': '' }, given), chart, flow, forecast, table, h('label', { style: row }, material ? 'Seuraava sama erä · uusi panos / g' : 'Seuraava sama erä · osto / kJ', next.input), note(material ? 'Seuraavan erän kokonaispanos on sama. Vain lopun kelvollinen paluuvarasto vähentää uutta panosta. Alun varasto on jo käytetty.' : 'Tarkastele alkuperäistä ja seuraavaa erää erillisinä taseina. Varastosta tuleva lämpö ei ole uutta ostoenergiaa.'), status, toggle, lock, run),
    ready: () => operated, read: () => material ? { flows: readFlows(), freshNextG: next.read(), locked, operated } : { flows: readFlows(), nextPurchasedKj: next.read(), locked, operated } };
}
function comparisonWork(data: ComparisonData): Work<ComparisonAnswer> {
  const values = new Map<string, ComparisonAnswer['quantities'][number]>(), option = menu('Vertailun vaihtoehto', data.options.map(o => [o.id, o.label])); option.value = data.options[0]!.id; option.setAttribute('data-lifecycle-nav', '');
  const units = numeric('Tarvittavat kokonaiset esineet'), repairs = numeric('Tarvittavat huollot'), material = numeric('Uusi materiaali yhteensä g'), energy = numeric('Energiapanos yhteensä kJ'), returned = numeric('Lopun palautusvarasto g');
  const fields = [units, repairs, material, energy, returned], given = note(''), boundary = note(`${data.boundary} ${data.uncertainty}`);
  const save = () => values.set(option.value, { option: option.value, units: units.read(), repairs: repairs.read(), materialG: material.read(), energyKj: energy.read(), returnedG: returned.read() });
  const show = () => {
    const o = data.options.find(o => o.id === option.value)!; given.textContent = `${o.label}. Ulkoinen materiaalipanos ${o.newMaterialG} g ja valmistus ${o.makeEnergyKj} kJ/esine, kuljetus ${o.transportKj} kJ/esine. Ilman huoltoa ${o.baseLifeUses} palvelua, huollettuna enintään ${o.lifeUses}. Yksi huolto ${o.repairMaterialG} g ja ${o.repairEnergyKj} kJ, vasta jos saman esineen käyttö ylittää ${o.baseLifeUses}. Käyttö ${o.useEnergyKj} kJ/palvelu. Lopun palautus ${o.endReturnG} g/esine.`;
    const v = values.get(o.id); [v?.units, v?.repairs, v?.materialG, v?.energyKj, v?.returnedG].forEach((n, i) => { fields[i]!.input.value = n === undefined || n === null ? '' : String(n); });
  };
  option.addEventListener('change', () => { if (!option.value) option.value = data.options[0]!.id; show(); }); for (const n of fields) n.input.addEventListener('input', save);
  const choice = menu('Oma suositus', data.options.map(o => [o.id, o.label]));
  show();
  return { node: h('div', { style: stack }, note(`${data.service} × ${data.uses}. Aika ${data.period}. ${data.priority === 'tradeoff' ? 'Tavoitteena on perustella paikallinen valinta aineen ja energian vaihtokauppa huomioiden.' : `Nimetty ensitavoite on pienin ${data.priority === 'material' ? 'uuden materiaalin määrä' : 'energiapanos'}. Myös toinen vaikutus täytyy huomioida perustelussa.`}`), boundary, option, h('div', { style: panel }, given),
    h('div', { style: row }, h('label', { style: row }, 'Esineet', units.input), h('label', { style: row }, 'Huollot', repairs.input)), h('div', { style: row }, h('label', { style: row }, 'Uusi aine / g', material.input), h('label', { style: row }, 'Energia / kJ', energy.input)), h('label', { style: row }, 'Lopun paluu / g', returned.input), choice,
    h('details', {}, h('summary', {}, 'Yhteinen rajaus ja laskutapa'), note(data.boundary), note('Tarvitaan kokonaisia esineitä. Jaa palvelumäärä yhden esineen enimmäiskäytöllä ja pyöristä ylöspäin. Viimeisen esineen käyttämätöntä kapasiteettia ei siirretä uuteen vertailuun. Laske huolto vain esineelle, jonka toteutuva käyttö ylittää huoltamattoman keston. Lopun varasto ilmoitetaan erikseen, sitä ei vähennetä jo valmistetun esineen uudesta materiaalista.'), note(data.uncertainty))), read: () => ({ quantities: data.options.map(o => values.get(o.id) ?? { option: o.id, units: null, repairs: null, materialG: null, energyKj: null, returnedG: null }), choice: choice.value }) };
}
export function lifecycleHarborBoard(task: LifecycleHarborTask): Paint {
  return host => host.replaceChildren(h('div', { style: panel, 'data-lifecycle-board': '' }, note(task.title), note('Telakan täsmällinen 2D-työpöytä. Seuraa nimettyä esinettä, materiaalin grammoja ja energian kilojouleja erillisinä. Kaikki tarvittavat paikallisen tapauksen tiedot annetaan pöydällä.')));
}
export function lifecycleHarborExample(task: LifecycleHarborTask, response = solutionLifecycleHarbor(task)): Paint {
  return host => {
    lifecycleHarborBoard(task)(host);
    const lines = [response.resource ? `Yksi sallittu alkuperäreitti ${response.resource.path.join(' → ')}` : '', response.stages ? `Nimetyt yhteydet ${response.stages.edges.map(e => `${e.from} → ${e.to}`).join(', ')}` : '', response.material ? `Seuraavan saman erän uusi materiaali ${response.material.freshNextG} g.` : '', response.energy ? `Seuraavan saman erän ostoenergia ${response.energy.nextPurchasedKj} kJ.` : '', response.comparison ? response.comparison.quantities.map(q => `${q.option} · ${q.units} esinettä, ${q.repairs} huoltoa, ${q.materialG} g ja ${q.energyKj} kJ`).join('. ') : ''].filter(Boolean);
    for (const line of lines) host.append(note(line));
    if (task.review) host.append(note(task.review.model), note('Mallin katsominen ei ole aikuisen havainto oppijan omasta perustelusta.'));
  };
}
export function mountLifecycleHarbor(task: LifecycleHarborTask, host: HTMLElement, submit: (response: LifecycleHarborResponse) => void): { reveal(): void } {
  const root = h('div', { style: stack, class: 'lifecycle-workbench', 'data-lifecycle-workbench': '' }), area = h('div', { style: stack }), status = note('');
  const works: { key: 'resource' | 'stages' | 'material' | 'energy' | 'comparison'; title: string; work: Work<unknown> }[] = [];
  if ('resource' in task) works.push({ key: 'resource', title: 'Alkuperäpassi', work: resourceWork(task.resource) });
  if ('stages' in task) works.push({ key: 'stages', title: 'Vaihekartta', work: stageWork(task.stages) });
  if ('material' in task) works.push({ key: 'material', title: 'Ainekirja', work: flowWork('material', task.material) });
  if ('energy' in task) works.push({ key: 'energy', title: 'Energiakirja', work: flowWork('energy', task.energy) });
  if ('comparison' in task) works.push({ key: 'comparison', title: 'Sama palvelutarve', work: comparisonWork(task.comparison) });
  const navigation = h('div', { style: row }), read = (): LifecycleHarborResponse => Object.assign({ kind: task.kind, mode: task.mode }, ...works.map(w => ({ [w.key]: w.work.read() })));
  const show = (index: number) => { area.replaceChildren(works[index]!.work.node); for (let i = 0; i < navigation.children.length; i++) navigation.children[i]!.setAttribute('aria-pressed', String(i === index)); };
  works.forEach((w, i) => navigation.append(button(w.title, () => show(i), true)));
  const adultArea = h('div', { style: stack }), model = h('div', { style: `${panel};display:none` });
  let helper: { reveal(): void } | undefined, revealed = false;
  const done = button(task.review ? 'Kerro oma perustelusi' : 'Tarkista oma telakkamalli', () => {
    const incomplete = works.find(w => w.work.ready && !w.work.ready());
    if (incomplete) { status.textContent = `Lukitse ja kokeile ensin oma ${incomplete.title.toLowerCase()}.`; show(works.indexOf(incomplete)); return; }
    if (!task.review) { submit(read()); return; }
    for (const w of works) for (const element of w.work.node.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>('input,select,button')) if (!element.hasAttribute('data-lifecycle-nav')) element.disabled = true;
    area.style.display = navigation.style.display = done.style.display = 'none'; adultArea.style.display = 'grid';
  });
  if (task.review) {
    const channel = menu('Oman perustelun tapa', [['spoken', 'Kerron suullisesti'], ['written', 'Kirjoitan aikuiselle']]); channel.value = 'spoken'; channel.setAttribute('data-lifecycle-review-channel', '');
    const content = h('div');
    const renderReview = () => {
      content.replaceChildren();
      helper = mountObservedExplanation({ kind: 'observed-explanation', channel: channel.value === 'written' ? 'written' : 'spoken', givens: [], ...task.review! }, content, observation => {
        const response = read(); response.review = { channel: observation.channel, observations: { ...observation.observations }, confirmedByAdult: observation.confirmedByAdult, assistance: observation.assistance }; submit(response);
      });
      for (const element of content.querySelectorAll<HTMLElement>('select,label:has(input[type=checkbox])')) element.style.minHeight = '44px';
      if (revealed) helper.reveal();
    };
    channel.addEventListener('change', renderReview); renderReview();
    const prompt = note(task.review.prompt); prompt.setAttribute('data-lifecycle-review-prompt', '');
    const inspect = button('Katso omaa lukittua aineistoa', () => {
      const visible = area.style.display !== 'none'; area.style.display = navigation.style.display = visible ? 'none' : 'grid';
      content.style.display = visible ? 'block' : 'none'; root.toggleAttribute('data-lifecycle-inspection', !visible);
    }, true);
    adultArea.append(prompt, channel, content, inspect); adultArea.style.display = 'none';
  }
  root.append(h('style', {}, '@media(min-width:1000px){.expedition:has([data-lifecycle-workbench]){--exp-desk-width:clamp(560px,50vw,640px)}} .lifecycle-workbench [data-explanation-adult] select,.lifecycle-workbench [data-explanation-adult] label:has(input[type=checkbox]){min-height:44px}.lifecycle-workbench:has([data-explanation-adult]:not([hidden])) [data-lifecycle-review-prompt],.lifecycle-workbench:has([data-explanation-adult]:not([hidden])) [data-lifecycle-review-channel],.lifecycle-workbench[data-lifecycle-inspection] [data-lifecycle-review-prompt],.lifecycle-workbench[data-lifecycle-inspection] [data-lifecycle-review-channel]{display:none}'), works.length > 1 ? navigation : h('span'), area, status, done, adultArea, model); host.replaceChildren(root); show(0);
  return { reveal: () => { revealed = true; model.style.display = 'grid'; lifecycleHarborExample(task)(model); helper?.reveal(); } };
}
