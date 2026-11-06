import { parseMeasure } from '../models/spatial-measures';
import type { Paint } from '../../engine/types';
import { mountObservedExplanation } from './observed-explanations';
import { atomicElements, atomicElement, atomicParticleFacts, atomicModelLimit, atomicExplanation, atomicPhaseAfter, atomicPropertyValue, atomicPhaseMotion, atomicPhaseSpacing, atomicOwn, atomicDense, solutionAtomicWorld, type AtomicWorldTask, type AtomicWorldResponse, type AtomicWorldScene, type AtomicPhaseChamber, type AtomicStructure, type AtomicAtom } from '../models/atomic-world';
const labels: Record<string, string> = { solid: 'Kiinteä', liquid: 'Neste', gas: 'Kaasu', vibrate: 'Värähtelee paikallaan', slide: 'Liukuu naapuriensa lomitse', free: 'Liikkuu vapaasti', far: 'Kaukana toisistaan', near: 'Lähekkäin', open: 'Avoin jäärakenne', same: 'Sama', lower: 'Pienempi', higher: 'Suurempi', nucleus: 'Ydin', cloud: 'Elektroniverho', proton: 'Protoni', neutron: 'Neutroni', electron: 'Elektroni', element: 'Alkuaine', compound: 'Yhdiste', mixture: 'Seos' };
const stack = 'display:grid;gap:4px';
const grid = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(min(115px,100%),1fr));gap:4px 6px';
function el<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string) {
    const node = document.createElement(tag);
    if (text !== undefined)
        node.textContent = text;
    return node;
}
function note(text: string) { const n = el('p', text); n.style.cssText = 'margin:0;font-size:13px;line-height:1.2'; return n; }
function button(text: string, action: () => void) { const b = el('button', text); b.type = 'button'; b.className = 'btn'; b.style.cssText = 'min-height:45px;font-size:13px;line-height:1.15;padding:4px 6px'; b.onclick = action; return b; }
function field<T extends HTMLInputElement | HTMLSelectElement>(name: string, input: T, caption = name) { const wrapper = el('label', caption); wrapper.style.cssText = 'display:grid;gap:1px;min-width:0;font-size:13px;line-height:1.15'; input.setAttribute('aria-label', name); input.style.cssText = 'font:inherit;box-sizing:border-box;min-height:45px;min-width:44px;max-width:100%;width:100%;border:1px solid #76958a;border-radius:6px;padding:3px 5px;color:#224b43;background:#fffdf4'; wrapper.append(input); return wrapper; }
function text(name: string, caption = name) { const input = el('input'); input.type = 'text'; input.autocomplete = 'off'; input.maxLength = 32; return { node: field(name, input, caption), input, get: () => input.value.trim() }; }
function number(name: string, caption = name) {
    const f = text(name, caption);
    f.input.inputMode = 'decimal';
    return { ...f, get: () => { const value = f.get(); return parseMeasure(value) ? value : ''; } };
}
function menu(name: string, options: readonly (readonly [
    string,
    string
])[], caption = name) {
    const input = el('select');
    input.add(new Option('Valitse', ''));
    for (const [v, label] of options)
        input.add(new Option(label, v));
    return { node: field(name, input, caption), input, get: () => input.value };
}
const options = (values: readonly string[]) => values.map(v => [v, labels[v] ?? v] as const);
const elementOptions = () => atomicElements.map(e => [e.symbol, `${e.symbol} · ${e.name}`] as const);
function picture(markup: string, label: string, width = 360, height = 125) { const p = el('div'); p.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}" style="display:block;width:100%;max-height:${height}px">${markup}</svg>`; return p; }
const escaped = (s: string) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const colour = (symbol: string) => ({ H: '#efe7bc', O: '#bb7460', N: '#7797ba', C: '#61776c', Na: '#c29c63', Cl: '#81ab80', Mg: '#bca0c3', S: '#d5bd63', Si: '#a39679', P: '#bd8d73' }[symbol] ?? '#a3b9a0');
function ball(x: number, y: number, symbol: string, r = 9) { return `<circle cx="${x}" cy="${y}" r="${r}" fill="${colour(symbol)}" stroke="#355b4c"/><text x="${x}" y="${y + 3.5}" text-anchor="middle" font-size="9" fill="#173e36">${escaped(symbol)}</text>`; }
function atomPicture(a: AtomicAtom, style: string) {
    const dots = (n: number, offset: number, proton: boolean) => Array.from({ length: n }, (_, i) => {
        const x = 24 + (i % 10) * 14, y = 35 + Math.floor(i / 10) * 14 + offset;
        return `<circle cx="${x}" cy="${y}" r="6" fill="${proton ? '#c09a63' : '#99b4a8'}" stroke="#365e50"/><text x="${x}" y="${y + 3}" font-size="10" text-anchor="middle">${proton ? '+' : '0'}</text>`;
    }).join('');
    const enlarged = style === 'enlarged';
    const nucleus = dots(a.protons, 0, true) + dots(a.neutrons, Math.ceil(a.protons / 10) * 14, false);
    return picture(`<ellipse cx="90" cy="66" rx="86" ry="62" fill="#b9d0d2" opacity=".5" stroke="#47797b" stroke-dasharray="3 3"/><rect x="${enlarged ? 10 : 16}" y="${enlarged ? 20 : 24}" width="${enlarged ? 160 : 148}" height="${enlarged ? 98 : 90}" rx="10" fill="#f4e9ce" stroke="#776e50"/>${nucleus}<text x="12" y="15" font-size="11">B · e− × ${a.electrons}</text><text x="85" y="15" font-size="11">A</text>`, `${a.id}. Alueessa A ovat laskettavat plus- ja nollamerkit. Alue B on pilvimäinen e− × ${a.electrons} -esitys. Mittasuhteet ovat kaavamaiset.`, 180, 130);
}
function periodicTable() {
    const width = 360, height = 133, cell = 18;
    let content = '';
    for (let g = 1; g <= 18; g++)
        content += `<text x="${24 + (g - 1) * cell}" y="11" text-anchor="middle" font-size="8">${g}</text>`;
    for (let p = 1; p <= 6; p++)
        content += `<text x="8" y="${29 + (p - 1) * 18}" font-size="9">${p}</text>`;
    for (const e of atomicElements) {
        const x = 16 + (e.group - 1) * cell, y = 16 + (e.period - 1) * 18;
        content += `<rect x="${x}" y="${y}" width="17" height="17" fill="#dce6cc" stroke="#6c8a70"/><text x="${x + 8.5}" y="${y + 7}" text-anchor="middle" font-size="6">${e.z}</text><text x="${x + 8.5}" y="${y + 15}" text-anchor="middle" font-size="8">${e.symbol}</text>`;
    }
    return picture(content, 'Jaksollisen järjestelmän nimetty osajoukko. Ryhmät 1–18 pystysarakkeina, jaksot 1–6 vaakariveinä. Tyhjä solu tarkoittaa tästä esityksestä pois jätettyä alkuainetta.', width, height);
}
function samplePicture(task: Extract<AtomicWorldTask, {
    mode: 'sample';
}>) {
    const row = el('div');
    row.style.cssText = grid;
    for (const s of task.samples) {
        let mark = '', index = 0;
        for (const species of s.species)
            for (let j = 0; j < species.units; j++) {
                const x = 18 + (index % 4) * 29, y = 20 + Math.floor(index / 4) * 25;
                index++;
                if (species.structure === 'lattice') {
                    mark += `<rect x="${x - 9}" y="${y - 10}" width="24" height="19" fill="none" stroke="#566e57" stroke-dasharray="2 2"/>`;
                }
                for (let i = 0; i < species.atoms.length; i++)
                    mark += ball(x + i * 6, y + (i % 2) * 5, species.atoms[i]!, 5);
            }
        const p = el('div');
        p.style.cssText = 'min-width:0;padding:4px;background:#ecf1e2;border-radius:6px';
        p.append(note(s.label), picture(mark, `${s.label}. ${s.species.map(sp => `${sp.units} ${sp.structure === 'lattice' ? 'toistoyksikköä jatkuvassa hilassa' : sp.structure === 'molecule' ? 'sidottua molekyyliä' : 'erillistä atomia'}, lajit ${sp.atoms.join(' ')}`).join('; ')}`, 135, 100), note(s.species.map(sp => `${sp.units} × ${sp.label}${sp.structure === 'lattice' ? ' · hila jatkuu' : sp.structure === 'molecule' ? ' · sidottu' : ' · atomi'}`).join(' / ')));
        row.append(p);
    }
    return row;
}
function sitePanel(structure: Pick<AtomicStructure, 'sites' | 'species' | 'rule' | 'label'>, placements?: readonly {
    id: string;
    symbol: string;
}[]) {
    const layers = [...new Set(structure.sites.map(s => s.y))].sort((a, b) => a - b), row = el('div');
    row.style.cssText = grid;
    for (const layer of layers) {
        const sites = structure.sites.filter(s => s.y === layer), w = Math.max(...sites.map(s => s.x)) + 1, d = Math.max(...sites.map(s => s.z)) + 1;
        const markup = sites.map(s => { const x = 22 + s.x * 29, y = 25 + s.z * 30, p = placements?.find(p => p.id === s.id); return `${p ? ball(x, y, p.symbol, 10) : `<circle cx="${x}" cy="${y}" r="9" fill="#e6e9d5" stroke="#7c9072"/>`}<text x="${x}" y="${y + 19}" font-size="9" text-anchor="middle">${s.id}</text>`; }).join('');
        const panel = el('div');
        panel.append(note(`Kerros ${layer + 1} · y=${layer}`), picture(markup, `Kerros ${layer + 1}, jokainen merkitty paikka näkyvissä.`, Math.max(110, w * 29 + 15), d * 30 + 27));
        row.append(panel);
    }
    return row;
}
function chamberPicture(c: AtomicPhaseChamber, phase = c.phase, motion = atomicPhaseMotion(phase), spacing = atomicPhaseSpacing(c.substance, phase)) {
    const columns = 5, step = spacing === 'far' ? 33 : spacing === 'open' ? 24 : 20, originX = 20, originY = phase === 'gas' ? 15 : 27;
    const marks = Array.from({ length: c.count }, (_, i) => {
        const x = originX + i % columns * step, y = originY + Math.floor(i / columns) * (phase === 'gas' ? 19 : 14);
        const unit = c.substance === 'water' ? `<path d="M${x - 5} ${y - 4}L${x} ${y}L${x + 5} ${y - 4}" fill="none" stroke="#5d7163"/><circle cx="${x}" cy="${y}" r="3.6" fill="#bb7460" stroke="#355b4c"/><circle cx="${x - 5}" cy="${y - 4}" r="2.4" fill="#efe7bc" stroke="#355b4c"/><circle cx="${x + 5}" cy="${y - 4}" r="2.4" fill="#efe7bc" stroke="#355b4c"/>` : ball(x, y, 'Ar', 5);
        return unit + (motion === 'vibrate' ? `<path d="M${x - 8} ${y - 6}l2 -2 -2 -2" fill="none" stroke="#a47344"/>` : motion === 'free' ? `<path d="M${x + 8} ${y}h6l-2 -2m2 2l-2 2" fill="none" stroke="#7c7154"/>` : '');
    }).join('');
    return picture(`<rect x="5" y="4" width="165" height="77" rx="8" fill="#e7efdf" stroke="#728d78"/>${marks}`, `${c.id}, ${c.substance === 'water' ? 'H2O-vesimolekyylien' : 'argonatomien'} mallisali. ${c.count} samankokoista rakenneosaa. Liikkeen kaavamaiset nuolet.`, 180, 85);
}
function safeObserved(task: AtomicWorldTask, response?: AtomicWorldResponse): boolean {
    if (!response || !atomicOwn(response) || response.kind !== 'atomic-world' || response.mode !== task.mode)
        return false;
    if (task.mode === 'phase' && response.mode === 'phase')
        return task.activity === 'change' && response.locked === true && response.observed === true
            && atomicDense(response.steps, 2) && response.steps.length === 2 && response.steps[0] === 'during' && response.steps[1] === 'after';
    if (task.mode === 'model-use' && response.mode === 'model-use')
        return !!task.particle && atomicOwn(response.particle) && response.particle.locked === true && response.particle.observed === true;
    return false;
}
/** Given and learner-generated physical geometry only. Assessment rows and rubrics never reach the stage. */
export function atomicWorldScene(task: AtomicWorldTask, response?: AtomicWorldResponse): AtomicWorldScene | undefined {
    if (response && (!atomicOwn(response) || response.kind !== 'atomic-world' || response.mode !== task.mode))
        response = undefined;
    if (!['atom', 'build', 'phase', 'model-use'].includes(task.mode) || task.mode === 'atom' && !['link', 'regions'].includes(task.activity))
        return;
    const observed = safeObserved(task, response), model: AtomicWorldScene = { kind: 'atomic-world', title: task.title, mode: task.mode === 'build' ? 'compound' : task.mode === 'atom' ? 'atom' : task.mode === 'phase' ? 'phase' : 'model-use', observed, phase: observed ? 'observed' : response ? 'forecast' : 'given', motionMs: task.mode === 'phase' || task.mode === 'model-use' ? 8000 : 0, atoms: [], particles: [], bonds: [], chambers: [], structures: [], legend: atomicModelLimit, view: observed ? 'after' : 'before' };
    if (task.mode === 'atom') {
        model.atoms = [...task.atoms, ...(task.comparison ? [task.comparison] : [])];
        if (task.sample)
            model.sample = task.sample;
        if (response?.mode === 'atom' && task.atoms.some(a => a.id === response.sampleAtom))
            model.selectedAtomId = response.sampleAtom;
    }
    if (task.mode === 'build') {
        if (task.structure === 'molecule' && response?.mode === 'build' && atomicDense(response.selected, 32) && atomicDense(response.bonds, 48)) {
            const selected = task.bank.filter(a => response.selected.includes(a.id));
            model.particles = selected.map((a, i) => ({ id: a.id, symbol: a.symbol, x: Math.cos(i * 2.399) * (.4 + i * .1), y: .4 + Math.sin(i * 2.399) * .5, z: (i % 3 - 1) * .35, radius: .16, chamber: 'build' }));
            model.bonds = response.bonds.filter(b => atomicOwn(b, ['a', 'b', 'order']) && selected.some(a => a.id === b.a) && selected.some(a => a.id === b.b) && Number.isInteger(b.order) && b.order >= 1 && b.order <= 3);
        }
        else if (task.structure === 'lattice') {
            const structure: AtomicStructure = { id: 'lattice', label: task.compound, sites: task.sites, species: task.species, rule: 'alternating', property: '', reference: '', intervention: 'inspect' };
            model.structures = [structure];
            const p = response?.mode === 'build' && atomicDense(response.placements, 64) ? response.placements : [];
            model.particles = task.sites.flatMap(s => { const a = p.find(p => atomicOwn(p, ['id', 'symbol']) && p.id === s.id && task.species.includes(p.symbol)); return a ? [{ id: s.id, symbol: a.symbol, x: s.x, y: s.y, z: s.z, radius: .19, chamber: 'lattice' }] : []; });
        }
    }
    if (task.mode === 'phase') {
        if (task.activity === 'change')
            model.transition = { from: task.chambers[0]!.phase, to: atomicPhaseAfter(task) };
        if (response?.mode === 'phase' && atomicDense(response.steps, 2) && response.steps[0] === 'during' && !observed)
            model.view = 'during';
        model.chambers = task.chambers.map(c => {
            if (model.view === 'during')
                return { ...c, temperatureC: task.change === 'melt' ? 0 : 100 };
            if (task.activity === 'change' && observed)
                return { ...c, phase: atomicPhaseAfter(task), temperatureC: task.afterTemperatureC! };
            if (task.activity === 'construct') {
                const r = response?.mode === 'phase' && atomicDense(response.rows, 4) ? response.rows.find(r => atomicOwn(r) && r.id === c.id) : undefined;
                return r && ['vibrate', 'slide', 'free', 'stopped'].includes(r.motion) && ['near', 'open', 'far'].includes(r.spacing) ? { ...c, motion: r.motion as AtomicPhaseChamber['motion'], spacing: r.spacing as AtomicPhaseChamber['spacing'] } : { ...c, count: 0 };
            }
            return c;
        });
    }
    if (task.mode === 'model-use') {
        model.structures = task.structures;
        const rows = response?.mode === 'model-use' && atomicDense(response.structures, 3) ? response.structures : [];
        model.particles = task.structures.flatMap(s => {
            const row = rows.find(r => atomicOwn(r) && r.id === s.id), placements = row && atomicDense(row.placements, 64) ? row.placements : [];
            return s.sites.flatMap(site => { const p = placements.find(p => atomicOwn(p, ['id', 'symbol']) && p.id === site.id && s.species.includes(p.symbol)); return p ? [{ id: site.id, symbol: p.symbol, x: site.x + (s.intervention === 'shift' && row?.shifted === true && site.y === Math.max(...s.sites.map(p => p.y)) ? 1 : 0), y: site.y, z: site.z, radius: .19, chamber: s.id }] : []; });
        });
        if (task.particle) {
            model.experiment = { kind: task.particle.kind, id: task.particle.id };
            model.chambers = [{ id: task.particle.id, substance: 'argon', count: task.particle.count, phase: 'gas', temperatureC: observed ? task.particle.afterTemperatureC : task.particle.temperatureC }];
        }
    }
    return model;
}
/** Deliberately omits physical answers, future conditions, all particle coordinates and assessment payloads. */
export function debugAtomicWorldScene(scene: AtomicWorldScene | undefined) { return scene ? { kind: scene.kind, title: scene.title, mode: scene.mode, observed: scene.observed, phase: scene.phase, motionMs: scene.motionMs, view: scene.view, legend: scene.legend } : undefined; }
export const atomicWorldPaint = (task: AtomicWorldTask): Paint => (host, context) => {
    const root = el('div');
    root.dataset.atomicBoard = '';
    root.dataset.atomicMode = task.mode;
    root.style.cssText = stack;
    if (task.mode !== 'phase' && task.mode !== 'model-use')
        root.append(note('Pienten rakenteiden luolat · havainto ja selitysmalli pidetään erillään.'));
    if (task.mode === 'atom') {
        if (task.sample)
            root.append(note(`${task.sample.appearance} · alkuaine ${task.sample.symbol} · ${task.sample.units} rakenneyksikköä, jokaisessa ${task.sample.atomsPerUnit} atomia. Näytteen märkyys, kiinteys tai väri koskee suurta näytettä.`));
        const atomRow = el('div');
        atomRow.style.cssText = grid;
        for (const a of [...task.atoms, ...(task.comparison ? [task.comparison] : [])]) {
            const panel = el('div');
            panel.dataset.atomicAtom = a.id;
            panel.append(note(`Malli ${a.id.toUpperCase()}${task.activity === 'link' ? ` · atomilaji ${a.symbol}` : ''}`), atomPicture(a, task.comparison && a.id === 'b' ? 'enlarged' : task.style));
            atomRow.append(panel);
        }
        root.append(atomRow);
        if (task.activity === 'particle')
            root.append(note(task.inverse ? `Etsi kortti, jonka varaus on ${atomicParticleFacts[task.particle!].charge} ja alue ${labels[atomicParticleFacts[task.particle!].region]}.` : `Tutkittava hiukkanen ${atomicParticleFacts[task.particle!].label}.`), note('Hiukkaskortit · protoni +1 ytimessä · neutroni 0 ytimessä · elektroni −1 elektroniverhon kuvauksessa. Neutroni on massallinen hiukkanen, vaikka varaus on nolla.'));
        if (task.activity === 'number')
            root.append(periodicTable());
        root.append(note(atomicModelLimit));
    }
    else if (task.mode === 'sample')
        root.append(samplePicture(task), note('Toisiinsa yhdistetyt atomit kuuluvat samaan molekyyliin. Hilan katkoviivainen ikkuna jatkuu. Seoksessa on erillisiä aineita. Lukumäärä tarkoittaa kuvattuja atomeja, molekyylejä tai hilatoistoyksiköitä, ei makronäytteen kaikkia atomeja.'));
    else if (task.mode === 'build') {
        if (task.structure === 'molecule')
            root.append(note(`Rakenna yksi ${task.compound}-molekyyli. Koostumus ${Object.entries(task.composition).map(([s, n]) => `${s} × ${n}`).join(' · ')}.`), note(`Annettu sidontamalli ${Object.entries(task.valences).map(([s, n]) => `${s}, sidosten kertalukusumma ${n}`).join(' · ')}. Yksi, kaksi tai kolme viivaa merkitsevät sidoksen kertalukua. Atomipankissa on ylimääräisiä osia.`));
        else
            root.append(note(`${task.compound} · annetun hilaikkunan suhde ${task.species[0]}:${task.species[1]} = ${task.counts[0]}:${task.counts[1]}. Lähinaapurien merkit vuorottelevat kaikissa kolmessa suunnassa. Paikka s1 on ${task.species[0]}.`), note('Täydennä alla näkyvät kerroskartat. Kaikki paikat ovat tarjolla myös koordinaattivalikossa.'));
        root.append(note('Oma rakenne päivittyy 3D-työpöydälle ja tarkkaan 2D-esikatseluun. Symbolien koko ja sidostikut ovat kaavamaisia.'));
    }
    else if (task.mode === 'periodic') {
        root.append(periodicTable(), note('IUPACin ryhmänumerot 1–18. Tämä on nimetty osajoukko oikeasta taulukosta. Tyhjät kohdat ovat pois jätettyjä alkuaineita. Taulukko kuvaa aineiden järjestystä, ei niiden maantieteellistä sijaintia.'));
        const e = atomicElement(task.target)!;
        root.append(note(task.activity === 'order' ? `Kortit ${task.cards.map(s => `${s}, Z=${atomicElement(s)!.z}`).join(' · ')}` : task.activity === 'fill' ? `Nimetön kohde, järjestysluku Z=${e.z}` : task.activity === 'inverse' ? `Kohde ryhmässä ${e.group}, jaksossa ${e.period}` : `Kohde ${e.symbol} · ${e.name}`));
    }
    else if (task.mode === 'property') {
        root.append(note(`Ryhmä ${task.group} · ${task.property === 'melting' ? 'sulamispiste' : task.property === 'boiling' ? 'kiehumispiste' : 'olomuoto 20 °C:ssa'} · normaalipaineen taulukkoarvot.`));
        for (const symbol of task.references) {
            const e = atomicElement(symbol)!;
            root.append(note(`${e.symbol} · jakso ${e.period} · ${task.property === 'state' ? `sulamispiste ${e.meltingC} °C, kiehumispiste ${e.boilingC} °C` : String(atomicPropertyValue(symbol, task.property, 20)) + ' °C'}`));
        }
        const e = atomicElement(task.target)!;
        root.append(note(`Kohde ${e.symbol}, ryhmä ${e.group}, jakso ${e.period}. Vertailukortti ${task.comparison}.`));
        if (task.property === 'state')
            root.append(note(`Kohteen annettu sulamispiste ${e.meltingC} °C ja kiehumispiste ${e.boilingC} °C. Alle sulamispisteen kiinteä, niiden välissä neste, yli kiehumispisteen kaasu. Tässä 20 °C ei ole rajalla.`));
        root.append(note('Annetut RSC-taulukkoarvot. Näiden rivien suuntausta käytetään rajattuna ennustemallina. Havainto avautuu vasta lukituksen jälkeen.'));
    }
    else if (task.mode === 'phase') {
        const row = el('div');
        row.style.cssText = grid;
        for (const c of task.chambers) {
            const p = el('div');
            if (task.activity === 'change')
                p.style.cssText = 'display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:5px;align-items:center';
            p.append(note(`${task.activity === 'change' ? 'Alkutila · ' : ''}Sali ${c.id} · ${c.substance === 'water' ? 'vesi H2O' : 'argon Ar'} · ${c.count} rakenneosaa${task.activity === 'construct' ? ` · rakenna ${labels[c.phase].toLowerCase()} tila` : ` · ${c.temperatureC} °C`}`));
            if (task.activity !== 'construct')
                p.append(chamberPicture(c));
            row.append(p);
        }
        root.append(row);
        root.append(note(task.chambers[0]!.substance === 'water' ? 'Vesi normaalipaineessa · sulaminen 0 °C · kiehuminen 100 °C. Jään avoin rakenne tekee sen väleistä tässä mallissa nestettä suuremmat.' : 'Argon normaalipaineessa · sulamispiste noin −189 °C · kiehumispiste noin −186 °C.'));
        if (task.change)
            root.append(note(`Toimenpide ${task.change === 'melt' ? 'lämmitä jää sulaksi' : task.change === 'vaporize' ? 'lämmitä vesi höyryksi' : 'jäähdytä vesihöyry nesteeksi'} · lopun lämpötila ${task.afterTemperatureC} °C. Suljettu mallikammio.`));
        root.append(note('Kaavamainen malli · hiukkasen oma koko on vakio. Nuolet ja 3D näyttävät liikettä, eivät laskettuja molekyyliratoja.'));
    }
    else if (task.mode === 'model-use') {
        for (const s of task.structures)
            root.append(note(s.label), note(s.reference), note(s.intervention === 'shift' ? 'Tutki kerroksen siirtoa.' : 'Tutki järjestystä ylläpitävää vuorovaikutusta.'));
        if (task.particle)
            root.append(note(`Hiukkasikkuna · ${task.particle.count} argonatomia · ${task.particle.kind === 'diffusion' ? 'avaa väliseinä, aluksi kaikki vasemmalla' : 'lämmitä ' + task.particle.temperatureC + ' °C → ' + task.particle.afterTemperatureC + ' °C'}. Suljettu mallikammio, hiukkaslaji ei muutu.`));
    }
    else {
        const row = el('div');
        row.style.cssText = grid;
        for (const c of task.cards) {
            const p = el('div');
            p.style.cssText = 'padding:5px;border:1px solid #9bab87;border-radius:5px;background:#eef0dc';
            const marks = c.level === 'macro' ? (task.phenomenon === 'solution' ? '<path d="M28 12v58h92V12" fill="#d1e4e0" stroke="#4a6a60"/><path d="M30 32h88" stroke="#6eaaa9"/>' : '<path d="M28 61l15 -39 51 -9 31 40 -29 25z" fill="#c7d5c4" stroke="#5a7767"/><path d="M43 22l31 26 51 5M74 48l22 30" fill="none" stroke="#6b8471"/>') : c.level === 'structure' ? Array.from({ length: 12 }, (_, i) => ball(28 + i % 4 * 28, 22 + Math.floor(i / 4) * 22, task.phenomenon === 'ice' ? 'H2O' : task.phenomenon === 'solution' ? 'H2O' : i % 2 ? 'Na' : 'Cl', 8)).join('') : Array.from({ length: 6 }, (_, i) => ball(28 + i % 3 * 44, 28 + Math.floor(i / 3) * 34, task.phenomenon === 'solution' ? (i % 2 ? 'Cl−' : 'Na+') : task.phenomenon === 'ice' ? 'H2O' : i % 2 ? 'Na+' : 'Cl−', 10)).join('');
            p.append(note(`Ikkuna ${c.id}`), picture(marks, c.label, 150, 90), note(c.label), note(c.source === 'observation' ? 'Havaintoon perustuva esitys' : 'Nimetty selitysmalli'));
            row.append(p);
        }
        root.append(row, note('Havaintoikkunan vieressä oleva malli tulee eri tiedonlähteestä. Aava katsoo näyttelyä omassa koossaan.'));
    }
    if (['phase', 'model-use'].includes(task.mode)) {
        const replay = button('Toista mallin liike', () => context?.onViewChange?.('atomic-view:motion'));
        const row = el('div');
        row.style.cssText = 'display:grid;grid-template-columns:minmax(0,1fr) 140px;gap:5px;align-items:center';
        const last = root.lastElementChild;
        if (last)
            row.append(last);
        row.append(replay);
        root.append(row);
    }
    host.replaceChildren(root);
};
/** Demonstration-only human-readable reasoning, never an adult observation. */
export const atomicWorldWorkedPaint = (task: AtomicWorldTask): Paint => (host, context) => {
    atomicWorldPaint(task)(host, context);
    const answer = solutionAtomicWorld(task);
    const worked = el('div');
    worked.dataset.atomicWorked = '';
    worked.style.cssText = stack + ';padding:6px;background:#e9efdb;border-left:3px solid #8b9b69';
    worked.append(note('Aavan malliratkaisu'));
    if (task.mode === 'atom' && answer.mode === 'atom') {
        if (task.activity === 'link')
            worked.append(note(`Näytteessä on ${task.sample!.units} × ${task.sample!.atomsPerUnit} = ${answer.atomCount} atomia. Yksi atomi on yksi ${task.sample!.symbol}-osa. Näytteen makro-ominaisuutta ei siirretä yksittäiseen atomiin.`));
        else if (task.activity === 'regions') {
            worked.append(note('Alue A on ydin. Alue B kuvaa elektroniverhoa. Ydin on suurennettu erikseen, joten piirretyt koko-osuudet eivät ole kirjaimellisia.'));
            if (task.comparison)
                worked.append(note(answer.sameAtom ? 'Ikkunoissa on samat hiukkasmäärät, vaikka suurennokset eroavat.' : 'Ikkunoiden hiukkasmäärissä on ero. Eri suurennus ei yksin muuta hiukkasten lukumäärää.'));
        }
        else if (task.activity === 'particle') {
            const fact = atomicParticleFacts[task.particle!];
            worked.append(note(`${fact.label} kuuluu alueelle ${labels[fact.region].toLowerCase()}. Sen varaus on ${fact.charge}. Merkki 0 tarkoittaa varaamattomuutta, ei hiukkasen puuttumista.`));
        }
        else
            for (const row of answer.rows)
                worked.append(note(`Mallin ${row.id.toUpperCase()} plusmerkkejä on ${row.number}. Protonien määrä antaa järjestysluvun ${row.number}, joka vastaa taulukossa alkuainetta ${row.symbol}. Neutronit tai elektronit eivät muuta tätä tunnusta.`));
    }
    else if (task.mode === 'sample' && answer.mode === 'sample') {
        for (const row of answer.rows)
            worked.append(note(`Näyte ${row.id.toUpperCase()} on ${labels[row.classification].toLowerCase()}. Siinä on ${row.kinds} atomilajia ja ${row.units} kuvattua rakenneyksikköä.`));
        worked.append(note('Yhden alkuaineen molekyylissä voi olla useita saman alkuaineen atomeja. Yhdisteessä eri alkuaineet ovat saman aineen rakenteessa. Seoksessa erillisiä aineita esiintyy rinnakkain.'));
    }
    else if (task.mode === 'build' && answer.mode === 'build') {
        if (task.structure === 'lattice')
            worked.append(sitePanel({ ...task, label: task.compound, rule: 'alternating' }, answer.placements), note('Jokainen paikka on täytetty. Lähinaapurit vuorottelevat kaikissa kolmessa suunnassa. Ikkunan reuna on mallin rajaus, ei erillisen molekyylin raja.'));
        else
            worked.append(note(`Valittuja atomeja on ${Object.entries(task.composition).map(([s, n]) => `${s} ${n}`).join(' ja ')}.`), note(answer.bonds.map(b => `${b.a}–${b.b}, ${b.order === 1 ? 'yksinkertainen' : b.order === 2 ? 'kaksinkertainen' : 'kolminkertainen'} sidos`).join(' · ')), note('Kaikki atomit kuuluvat yhteen rakenteeseen ja jokaisen sidontamäärä vastaa annettua mallia. Saman lajin atomien keskinäiset tunnukset voi vaihtaa.'));
    }
    else if (task.mode === 'periodic' && answer.mode === 'periodic') {
        if (task.activity === 'order')
            worked.append(note(`Järjestys on ${answer.order.map(symbol => `${symbol} (Z=${atomicElement(symbol)!.z})`).join(' → ')}. Suunta perustuu järjestyslukuun.`));
        else
            worked.append(note(`${answer.symbol} löytyy ryhmästä ${answer.group} ja jaksosta ${answer.period}. Ryhmä on pystysarake, jakso vaakarivi. Järjestysluku on ${atomicElement(answer.symbol)!.z}.`));
    }
    else if (task.mode === 'property' && answer.mode === 'property') {
        worked.append(note(`Ennuste koskee vain ominaisuutta ${task.property === 'melting' ? 'sulamispiste' : task.property === 'boiling' ? 'kiehumispiste' : 'olomuoto 20 °C:ssa'}. Kohde ${task.target} on ryhmässä ${task.group}.`), note(`Ennuste ${labels[answer.forecast] ?? answer.forecast}. Havainto ${labels[answer.result] ?? answer.result}${task.property === 'state' ? '' : ' °C'}. Vertailukortti on ${answer.comparison}.`));
    }
    else if (task.mode === 'phase' && answer.mode === 'phase') {
        for (const row of answer.rows)
            worked.append(note(`Sali ${row.id}, ${labels[row.phase].toLowerCase()} tila. Liike ${labels[row.motion].toLowerCase()}, välit ${labels[row.spacing].toLowerCase()}. Hiukkasen oma koko säilyy.`));
        if (task.activity === 'change')
            worked.append(chamberPicture({ ...task.chambers[0]!, phase: atomicPhaseAfter(task) }), note(`Lopussa on edelleen ${answer.count} H2O-molekyyliä. Muutoksen aikana vanha ja uusi olomuoto voivat esiintyä rinnakkain. Vesimolekyylin sisäisiä sidoksia ei hajoteta tässä muutoksessa.`));
    }
    else if (task.mode === 'model-use' && answer.mode === 'model-use') {
        for (const s of task.structures)
            worked.append(sitePanel(s, answer.structures.find(r => r.id === s.id)!.placements), note(`${s.label}. ${s.property} ${s.reference}`));
        if (task.particle)
            worked.append(note(task.particle.kind === 'diffusion' ? 'Väliseinän avauduttua liike levittää samoja hiukkasia molemmille puolille. Hiukkasmalli selittää tämän liikkeen.' : 'Lämmityksen jälkeen liike vilkastuu. Hiukkaset eivät kasva tai vaihdu toiseksi lajiksi.'));
        worked.append(note('Rakennemalli kohdistuu osiin ja järjestykseen. Liikettä kuvaava hiukkasmalli kohdistuu tässä muutokseen. Kumpikin esittää rajatun näkökulman.'));
    }
    else if (task.mode === 'scale' && answer.mode === 'scale')
        worked.append(note(`Järjestys on ${answer.order.map(id => task.cards.find(c => c.id === id)!.label).join(' → ')}.`), note(`Ensimmäinen selitysmalli on ikkuna ${answer.modelBoundary}. Sen kuva ei synny tavallisen kameran lisäsuurennoksesta.`));
    if (task.review)
        worked.append(note(task.review.model), note('Aikuinen arvioi oppijan oman selityksen erikseen. Tämä malliselitys ei ole havainto oppijan puheesta.'));
    host.append(worked);
};
/** A topology drawing. The coordinates never claim molecular bond angles or determine correctness. */
export function atomicBondLayout(ids:readonly string[],edges:readonly {a:string;b:string}[]) {
    const degrees=new Map(ids.map(id=>[id,edges.filter(e=>e.a===id||e.b===id).length]));
    const hub=[...ids].sort((a,b)=>degrees.get(b)!-degrees.get(a)!)[0];
    const leaves=ids.filter(id=>id!==hub);
    const positions=new Map<string,{x:number;y:number}>();
    if(hub)positions.set(hub,{x:150,y:ids.length===1?20:13});
    leaves.forEach((id,i)=>positions.set(id,{x:(i+1)*300/(leaves.length+1),y:42}));
    const curved=edges.some(e=>e.a!==hub&&e.b!==hub);
    return {hub,positions,height:ids.length===0?26:ids.length===1?45:curved?90:70};
}
/** Commands and drafts remain local. Only the bounded scientific response and explicit adult metadata are submitted. */
export function mountAtomicWorld(task: AtomicWorldTask, host: HTMLElement, submit: (response: AtomicWorldResponse) => void, onChange?: (response: AtomicWorldResponse) => void): {
    reveal(): void;
    dispose(): void;
} {
    const root = el('div');
    root.dataset.atomicWorkshop = '';
    root.style.cssText = stack;
    const controls = el('div');
    controls.style.cssText = grid;
    const preview = el('div');
    preview.dataset.atomicPreview = '';
    preview.style.cssText = stack;
    const status = note('');
    status.setAttribute('role', 'status');
    const adultHost = el('div');
    adultHost.hidden = true;
    let finished = false, disposed = false, read: () => AtomicWorldResponse;
    const emit = () => {
        if (!disposed)
            onChange?.(read());
    };
    const done = button('Tarkista tutkimusikkuna', () => {
        if (finished || disposed)
            return;
        const response = read();
        if (task.review) {
            controls.hidden = true;
            controls.style.display = 'none';
            preview.hidden = true;
            preview.style.display = 'none';
            done.hidden = true;
            done.style.display = 'none';
            adultHost.hidden = false;
            mountObservedExplanation(atomicExplanation(task)!, adultHost, observation => {
                if (finished || disposed)
                    return;
                finished = true;
                submit({ ...response, review: { observations: observation.observations, confirmedByAdult: observation.confirmedByAdult, assistance: observation.assistance } });
            });
            const panel = adultHost.querySelector<HTMLElement>('[data-explanation-adult] > div');
            if (panel) {
                panel.style.cssText += ';display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px;padding:5px';
                for (const select of panel.querySelectorAll('select'))
                    select.style.minHeight = '45px';
                for (const child of Array.from(panel.children))
                    if (child instanceof HTMLElement)
                        child.style.gridColumn = '1 / -1';
                for (const label of panel.querySelectorAll<HTMLLabelElement>(':scope > label'))
                    if (label.querySelector('input[type=checkbox],[aria-label="Saiko oppija apua?"]'))
                        label.style.gridColumn = 'auto';
            }
        }
        else {
            finished = true;
            submit(response);
        }
    });
    const kind = 'atomic-world' as const;
    if (task.mode === 'atom') {
        const rows = task.atoms.map(a => {
            const symbol = menu(`Malli ${a.id} alkuaine`, elementOptions(), 'Alkuaine'), value = number(`Malli ${a.id} järjestysluku`, 'Järjestysluku'), particle = menu(`Malli ${a.id} hiukkanen`, options(['proton', 'neutron', 'electron']), 'Hiukkanen'), charge = number(`Malli ${a.id} varaus`, 'Varaus'), region = menu(`Malli ${a.id} sijainti`, options(['nucleus', 'cloud']), 'Sijainti');
            if (task.activity === 'number')
                controls.append(symbol.node);
            if (task.activity === 'number')
                controls.append(value.node);
            if (task.activity === 'particle')
                controls.append(particle.node, charge.node, region.node);
            return () => ({ id: a.id, symbol: symbol.get(), number: value.get(), particle: particle.get(), charge: charge.get(), region: region.get() });
        });
        const nucleus = menu('Alue A nimi', options(['nucleus', 'cloud'])), cloud = menu('Alue B nimi', options(['nucleus', 'cloud'])), literal = menu('Ovatko mittasuhteet kirjaimelliset?', [['yes', 'Kyllä'], ['no', 'Eivät']]), comparison = menu('Ovatko ikkunoissa samat hiukkasmäärät?', [['yes', 'Samat'], ['no', 'Eri määrät']]);
        const sampleAtom = menu('Näytettä edustava atomi', task.atoms.map(a => [a.id, `Malli ${a.id.toUpperCase()} · ${a.symbol}`] as const), 'Edustava atomi');
        const count = number('Mallin atomien kokonaismäärä', 'Atomien määrä'), unit = menu('Yksi laskettava atomi on', [['atom', 'Yksi atomiosa'], ['molecule', 'Koko moniatominen molekyyli']], 'Atomin rajaus'), macro = menu('Märkyys tai kiinteys kuuluu', [['sample', 'Makronäytteelle'], ['atom', 'Yksittäiselle atomille']], 'Näytteen ominaisuus');
        if (task.activity === 'regions') {
            controls.append(nucleus.node, cloud.node, literal.node);
            if (task.comparison)
                controls.append(comparison.node);
        }
        if (task.activity === 'link')
            controls.append(sampleAtom.node, count.node, unit.node, macro.node);
        read = () => ({ kind, mode: 'atom', rows: task.activity === 'link' ? [] : rows.map(r => r()), sampleAtom: sampleAtom.get(), nucleus: nucleus.get(), cloud: cloud.get(), literalScale: literal.get() ? literal.get() === 'yes' : null, sameAtom: comparison.get() ? comparison.get() === 'yes' : null, atomCount: count.get(), unit: unit.get(), macroProperty: macro.get() });
    }
    else if (task.mode === 'sample') {
        const rows = task.samples.map(s => { const classification = menu(`${s.id} aineen luokka`, options(['element', 'compound', 'mixture']), `${s.label} · luokka`), kinds = number(`${s.id} atomilajien määrä`, `${s.label} · atomilajit`), units = number(`${s.id} rakenneyksikköjen määrä`, `${s.label} · yksiköt`); controls.append(classification.node, kinds.node, units.node); return () => ({ id: s.id, classification: classification.get(), kinds: kinds.get(), units: units.get() }); });
        read = () => ({ kind, mode: 'sample', rows: rows.map(r => r()) });
    }
    else if (task.mode === 'build') {
        let selected: string[] = [], bonds: {
            a: string;
            b: string;
            order: number;
        }[] = [], placements: {
            id: string;
            symbol: string;
        }[] = [];
        if (task.structure === 'molecule') {
            const moleculeTask = task;
            const bank = el('div');
            bank.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(45px,1fr));gap:3px';
            bank.style.gridColumn = '1 / -1';
            const refresh = () => {
                bank.replaceChildren(...task.bank.map(a => {
                    const b = button(`${selected.includes(a.id) ? '✓ ' : ''}${a.id}`, () => {
                        if (selected.includes(a.id)) {
                            selected = selected.filter(id => id !== a.id);
                            bonds = bonds.filter(b => b.a !== a.id && b.b !== a.id);
                        }
                        else
                            selected.push(a.id);
                        refresh();
                        draw();
                        emit();
                    });
                    b.setAttribute('aria-pressed', String(selected.includes(a.id)));
                    b.setAttribute('aria-label', `Valitse atomi ${a.id}`);
                    return b;
                }));
            };
            const a = menu('Sidoksen ensimmäinen atomi', task.bank.map(a => [a.id, a.id] as const), 'Atomi 1'), b = menu('Sidoksen toinen atomi', task.bank.map(a => [a.id, a.id] as const), 'Atomi 2'), order = menu('Sidoksen kertaluku', [['1', 'Yksinkertainen'], ['2', 'Kaksinkertainen'], ['3', 'Kolminkertainen']], 'Sidos');
            const add = button('Lisää sidos', () => {
                if (a.get() === b.get() || !selected.includes(a.get()) || !selected.includes(b.get()) || !order.get()) {
                    status.textContent = 'Valitse kaksi erillistä omaa atomia ja sidoksen kertaluku.';
                    return;
                }
                if (bonds.some(edge => [edge.a, edge.b].includes(a.get()) && [edge.a, edge.b].includes(b.get()))) {
                    status.textContent = 'Poista vanha sidos ennen saman parin muuttamista.';
                    return;
                }
                if (bonds.length < 32)
                    bonds.push({ a: a.get(), b: b.get(), order: Number(order.get()) });
                draw();
                emit();
            });
            const bondList = el('div');
            bondList.style.cssText = 'display:flex;gap:3px;flex-wrap:wrap';
            bondList.dataset.atomicBonds = '';
            bondList.style.gridColumn = '1 / -1';
            function draw() {
                bondList.replaceChildren(...bonds.map((edge, i) => button(`${edge.a}–${edge.b} · ${edge.order} · poista`, () => { bonds.splice(i, 1); draw(); emit(); })));
                const layout=atomicBondLayout(selected,bonds),positions=layout.positions;
                let markup=bonds.map(edge=>{
                    const a=positions.get(edge.a),b=positions.get(edge.b);
                    if(!a||!b)return '';
                    const length=Math.hypot(b.x-a.x,b.y-a.y),nx=-(b.y-a.y)/length,ny=(b.x-a.x)/length;
                    return Array.from({length:edge.order},(_,i)=>{
                        const offset=(i-(edge.order-1)/2)*4;
                        if(edge.a!==layout.hub&&edge.b!==layout.hub)return `<path data-atomic-bond="${edge.a}|${edge.b}" d="M${a.x} ${a.y+offset} Q${(a.x+b.x)/2} ${86+offset} ${b.x} ${b.y+offset}" fill="none" stroke="#5b785f" stroke-width="1.8"/>`;
                        return `<line data-atomic-bond="${edge.a}|${edge.b}" x1="${a.x+nx*offset}" y1="${a.y+ny*offset}" x2="${b.x+nx*offset}" y2="${b.y+ny*offset}" stroke="#5b785f" stroke-width="1.8"/>`;
                    }).join('');
                }).join('');
                markup+=selected.map(id=>{
                    const p=positions.get(id)!,atom=moleculeTask.bank.find(a=>a.id===id)!;
                    const tx=id===layout.hub?p.x+20:p.x,ty=id===layout.hub?p.y+3:p.y+21;
                    return ball(p.x,p.y,atom.symbol,10)+`<text x="${tx}" y="${ty}" font-size="10" text-anchor="${id===layout.hub?'start':'middle'}" paint-order="stroke" stroke="#fffaf0" stroke-width="2" fill="#173e36">${id}</text>`;
                }).join('');
                preview.replaceChildren(picture(markup,'Oppijan oma yhteysverkko. Atomien paikat ovat kaavamaisia, viivat näyttävät juuri omat sidokset.',300,layout.height));
            }
            controls.append(bank, a.node, b.node, order.node, add, bondList);
            refresh();
            draw();
        }
        else {
            const latticeTask = task;
            const site = menu('Hilan paikka', task.sites.map(s => [s.id, `${s.id} (${s.x},${s.y},${s.z})`] as const), 'Paikka'), symbol = menu('Paikan ionilaji', task.species.map(s => [s, s] as const), 'Ionilaji');
            const put = button('Sijoita oma osa', () => {
                if (!site.get() || !symbol.get())
                    return;
                placements = placements.filter(p => p.id !== site.get());
                placements.push({ id: site.get(), symbol: symbol.get() });
                draw();
                emit();
            });
            const undo = button('Kumoa sijoitus', () => { placements.pop(); draw(); emit(); });
            function draw() { preview.replaceChildren(sitePanel({ ...latticeTask, label: latticeTask.compound, rule: 'alternating' }, placements), note(`Omat paikat ${placements.length}/${latticeTask.sites.length}.`)); }
            controls.append(site.node, symbol.node, put, undo);
            draw();
        }
        read = () => ({ kind, mode: 'build', selected: [...selected], bonds: bonds.map(b => ({ ...b })), placements: placements.map(p => ({ ...p })) });
    }
    else if (task.mode === 'periodic') {
        const slots = task.cards.map((_, i) => menu(`Järjestyspaikka ${i + 1}`, task.cards.map(s => [s, `${s} · Z=${atomicElement(s)!.z}`] as const), `Paikka ${i + 1}`));
        const symbol = menu('Kohteen alkuaine', elementOptions(), 'Alkuaine'), group = number('Kohteen ryhmä', 'Ryhmä'), period = number('Kohteen jakso', 'Jakso');
        if (task.activity === 'order')
            controls.append(...slots.map(s => s.node));
        else {
            controls.append(symbol.node);
            if (task.activity !== 'fill')
                controls.append(group.node, period.node);
        }
        read = () => ({ kind, mode: 'periodic', order: slots.map(s => s.get()), symbol: symbol.get(), group: group.get(), period: period.get() });
    }
    else if (task.mode === 'property') {
        const forecast = menu('Oma ominaisuusennuste', options(task.property === 'state' ? ['solid', 'liquid', 'gas'] : ['lower', 'same', 'higher']), 'Ennuste'), group = number('Ennusteen ryhmä', 'Ryhmä'), comparison = menu('Ennusteen vertailukortti', task.references.map(s => [s, s] as const), 'Vertailukortti');
        let locked = false, observed = false, result = '';
        const lock = button('Lukitse oma ennuste', () => {
            if (!forecast.get())
                return;
            locked = true;
            forecast.input.disabled = true;
            lock.disabled = true;
            run.disabled = false;
            emit();
        }), run = button('Avaa kohteen havainto', () => {
            if (!locked)
                return;
            observed = true;
            result = String(atomicPropertyValue(task.target, task.property, task.temperatureC));
            preview.replaceChildren(note(`Kohteen havainto ${task.target} · ${labels[result] ?? result}${task.property === 'state' ? '' : ' °C'}.`));
            run.disabled = true;
            emit();
        });
        run.disabled = true;
        controls.append(forecast.node, group.node, comparison.node, lock, run);
        read = () => ({ kind, mode: 'property', forecast: forecast.get(), locked, observed, group: group.get(), comparison: comparison.get(), result });
    }
    else if (task.mode === 'phase') {
        const initialFields: HTMLElement[] = [];
        const rows = task.chambers.map(c => {
            const phase = menu(`${c.id} olomuoto`, options(['solid', 'liquid', 'gas']), `${c.id} · olomuoto`), motion = menu(`${c.id} liike`, options(['vibrate', 'slide', 'free', 'stopped']), `${c.id} · liike`), spacing = menu(`${c.id} hiukkasvälit`, options(['near', 'open', 'far']), `${c.id} · välit`);
            if (task.activity !== 'construct')
                controls.append(phase.node);
            else
                phase.input.value = c.phase;
            controls.append(motion.node, spacing.node);
            initialFields.push(phase.node, motion.node, spacing.node);
            const f = () => ({ id: c.id, phase: phase.get(), motion: motion.get(), spacing: spacing.get(), size: 'same' });
            if (task.activity === 'construct')
                for (const input of [motion.input, spacing.input])
                    input.addEventListener('change', () => { preview.replaceChildren(...task.chambers.map(k => { const r = rows.find((_, i) => task.chambers[i]!.id === k.id)!(); return chamberPicture(k, k.phase, r.motion as ReturnType<typeof atomicPhaseMotion>, r.spacing as ReturnType<typeof atomicPhaseSpacing>); })); emit(); });
            return f;
        });
        const size = menu('Muuttuuko hiukkasen oma koko?', [['same', 'Säilyy samana'], ['larger', 'Suurenee'], ['smaller', 'Pienenee']], 'Hiukkasen koko');
        controls.append(size.node);
        initialFields.push(size.node);
        let locked = false, observed = false;
        const steps: string[] = [];
        const forecast = menu('Oma muutoksen jälkeinen olomuoto', options(['solid', 'liquid', 'gas']), 'Lopputilan ennuste'), identity = menu('Muutoksen jälkeinen hiukkaslaji', [['same', 'Sama H2O'], ['changed', 'Muuttuu alkuaineiksi']], 'Hiukkaslaji'), count = number('Muutoksen jälkeinen rakenneosien määrä', 'Rakenneosien määrä');
        if (task.activity === 'change') {
            const lock = button('Lukitse oma ennuste', () => {
                if (!forecast.get())
                    return;
                locked = true;
                forecast.input.disabled = true;
                lock.disabled = true;
                during.disabled = false;
                for (const node of initialFields) {
                    node.style.display = 'none';
                    for (const input of node.querySelectorAll('select,input'))
                        (input as HTMLInputElement).disabled = true;
                }
                emit();
            });
            const during = button('Suorita muutoksen alku', () => {
                if (!locked || steps.length)
                    return;
                steps.push('during');
                const pair = el('div');
                pair.style.cssText = grid;
                pair.append(chamberPicture({ ...task.chambers[0]!, count: Math.ceil(task.chambers[0]!.count / 2) }), chamberPicture({ ...task.chambers[0]!, count: Math.floor(task.chambers[0]!.count / 2), phase: atomicPhaseAfter(task) }));
                preview.replaceChildren(note(`Muutoksen aikana ${task.change === 'melt' ? 0 : 100} °C · samat H2O-osat, osa alku- ja osa lopputilassa.`), pair);
                during.disabled = true;
                after.disabled = false;
                emit();
            });
            const after = button('Suorita muutos loppuun', () => {
                if (steps.length !== 1)
                    return;
                steps.push('after');
                observed = true;
                preview.replaceChildren(note(`Muutoksen jälkeen ${task.afterTemperatureC} °C · ${task.chambers[0]!.count} samaa H2O-osaa.`), chamberPicture({ ...task.chambers[0]!, phase: atomicPhaseAfter(task) }));
                after.disabled = true;
                emit();
            });
            during.disabled = true;
            after.disabled = true;
            const operations = el('div');
            operations.style.cssText = 'display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;grid-column:1 / -1';
            operations.append(lock, during, after);
            after.addEventListener('click', () => { if (observed)
                operations.style.display = 'none'; });
            controls.append(forecast.node, identity.node, count.node, operations);
        }
        read = () => ({ kind, mode: 'phase', rows: rows.map(r => ({ ...r(), size: size.get() })), forecast: forecast.get(), locked, observed, identity: identity.get(), count: count.get(), steps: [...steps] });
    }
    else if (task.mode === 'model-use') {
        const structures = task.structures.map(s => {
            let placements: {
                id: string;
                symbol: string;
            }[] = [], shifted = false;
            preview.append(sitePanel(s, []));
            const site = menu(`${s.id} hilan paikka`, s.sites.map(p => [p.id, `${p.id} (${p.x},${p.y},${p.z})`] as const), 'Hilan paikka'), symbol = menu(`${s.id} ionilaji`, s.species.map(s => [s, s] as const), 'Ionilaji'), model = menu(`${s.id} selitysmalli`, [['structure', 'Rakennemalli'], ['particle', 'Liikettä kuvaava hiukkasmalli']], 'Mallin tehtävä'), literal = menu(`${s.id} ovatko pallot ja tikut kirjaimellisia?`, [['yes', 'Ovat'], ['no', 'Ovat mallimerkkejä']], 'Mallin symbolit');
            let shiftButton: HTMLButtonElement | undefined;
            const syncShift = () => { shifted = false; if (shiftButton)
                shiftButton.disabled = placements.length !== s.sites.length; };
            const put = button('Sijoita hilan osa', () => {
                if (!site.get() || !symbol.get())
                    return;
                placements = placements.filter(p => p.id !== site.get());
                placements.push({ id: site.get(), symbol: symbol.get() });
                syncShift();
                preview.replaceChildren(sitePanel(s, placements));
                emit();
            }), undo = button('Kumoa hilan osa', () => { placements.pop(); syncShift(); preview.replaceChildren(sitePanel(s, placements)); emit(); });
            controls.append(site.node, symbol.node, put, undo, model.node, literal.node);
            if (s.intervention === 'shift') {
                shiftButton = button('Siirrä rakennettu kerros', () => { if (placements.length !== s.sites.length)
                    return; shifted = true; status.textContent = 'Kerroksen siirto tuo samanmerkkiset naapurit vastakkain. Annetussa mallissa ne torjuvat toisiaan.'; emit(); });
                shiftButton.disabled = true;
                controls.append(shiftButton);
            }
            return () => ({ id: s.id, placements: placements.map(p => ({ ...p })), model: model.get(), shifted, literal: literal.get() ? literal.get() === 'yes' : null });
        });
        let particle: Extract<AtomicWorldResponse, {
            mode: 'model-use';
        }>['particle'] = null;
        if (task.particle) {
            const model = menu('Liikeikkunan selitysmalli', [['particle', 'Hiukkasmalli'], ['structure', 'Pelkkä paikallaan oleva rakennemalli']], 'Liikeikkunan malli'), forecast = menu('Liikeikkunan oma ennuste', [['spread', 'Leviää molemmille puolille'], ['faster', 'Liike vilkastuu'], ['stop', 'Hiukkaset pysähtyvät']], 'Oma ennuste'), count = number('Liikeikkunan säilyvä lukumäärä', 'Lukumäärä');
            let locked = false, observed = false;
            const lock = button('Lukitse liike-ennuste', () => {
                if (!forecast.get())
                    return;
                locked = true;
                forecast.input.disabled = true;
                lock.disabled = true;
                run.disabled = false;
                emit();
            }), run = button('Suorita hiukkaskoe', () => {
                if (!locked)
                    return;
                observed = true;
                run.disabled = true;
                status.textContent = task.particle!.kind === 'diffusion' ? 'Havainto · hiukkaset leviävät kummallekin puolelle, määrä säilyy.' : 'Havainto · liike vilkastuu, samat hiukkaset säilyvät.';
                emit();
            });
            run.disabled = true;
            controls.append(model.node, forecast.node, count.node, lock, run);
            const particleRead = () => ({ model: model.get(), forecast: forecast.get(), locked, observed, count: count.get() });
            read = () => ({ kind, mode: 'model-use', structures: structures.map(f => f()), particle: particleRead() });
        }
        else
            read = () => ({ kind, mode: 'model-use', structures: structures.map(f => f()), particle });
    }
    else {
        const order = [0, 1, 2].map(i => menu(`Mittakaavan paikka ${i + 1}`, task.cards.map(c => [c.id, `Ikkuna ${c.id}`] as const), ['Makrotaso', 'Rakennetaso', 'Hiukkastaso'][i]));
        const boundary = menu('Ensimmäinen selitysmalli', task.cards.map(c => [c.id, `Ikkuna ${c.id}`] as const), 'Havainto → malli');
        const links = task.cards.map(c => { const f = menu(`Ikkuna ${c.id} sama ilmiö`, [['salt-crystal', 'Suolakide'], ['ice', 'Jää'], ['solution', 'Suolaliuos']], `Ikkuna ${c.id} · ilmiö`); controls.append(f.node); return () => ({ id: c.id, phenomenon: f.get() }); });
        controls.prepend(...order.map(f => f.node), boundary.node);
        read = () => ({ kind, mode: 'scale', order: order.map(f => f.get()), links: links.map(f => f()), modelBoundary: boundary.get() });
    }
    controls.addEventListener('change', emit);
    root.append(preview, controls, status, done, adultHost);
    host.replaceChildren(root);
    return { reveal() { atomicWorldWorkedPaint(task)(preview); controls.hidden = true; done.hidden = true; }, dispose() { disposed = true; root.remove(); } };
}
