import type { Paint } from '../../engine/types';
import { mountObservedExplanation } from './observed-explanations';
import { reactionRecipe, reactionMaterialState, reactionExplanation, reactionNumber, reactionFormulaMass, replayReactionConservation, replayReactionRate, solutionReactionLab, type ReactionLabTask, type ReactionLabResponse, type ReactionAction, type ReactionConfiguration, type ReactionFactor, type ReactionRelation, type ReactionRateReading } from '../models/reaction-lab';
export { reactionLabScene, debugReactionLabScene } from '../models/reaction-lab-scene';
const grid = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(min(112px,100%),1fr));gap:4px 6px';
const stack = 'display:grid;gap:4px';
const labels: Record<string, string> = { physical: 'Fysikaalinen', chemical: 'Kemiallinen', insufficient: 'Ei riittävää tietoa', 'same-identity': 'Sama aine säilyy', 'new-identity': 'Uusi aine tunnistettu', 'need-data': 'Tarvitaan tunnistustietoa', reactant: 'Lähtöaine', product: 'Tuote', out: 'Järj. → ymp.', in: 'Ymp. → järj.', exothermic: 'Eksoterminen', endothermic: 'Endoterminen', temperature: 'Lämpötila', concentration: 'Pitoisuus', surface: 'Palakoko / pinta', faster: 'B nopeampi', same: 'Sama nopeus', slower: 'B hitaampi', more: 'B:n loppusaanto suurempi', less: 'B:n loppusaanto pienempi', confirmed: 'Ennuste sopi havaintoon', revised: 'Korjaan ennustetta', 'data-only': 'Vertaan annettua dataa', 'model-only': 'Vain tämä malli ja havaintoväli', 'given-window': 'Vain annettu havaintoväli', 'all-reactions': 'Kaikki reaktiot aina' };
function el<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string) {
    const node = document.createElement(tag);
    if (text !== undefined)
        node.textContent = text;
    return node;
}
function note(text: string) { const node = el('p', text); node.style.cssText = 'margin:0;font-size:13px;line-height:1.2'; return node; }
function button(text: string, action: () => void) { const node = el('button', text); node.type = 'button'; node.className = 'btn'; node.style.cssText = 'min-height:45px;padding:4px 6px;font-size:13px'; node.onclick = action; return node; }
function field(name: string, input: HTMLInputElement | HTMLSelectElement, caption = name) { const node = el('label', caption); node.style.cssText = 'display:grid;gap:1px;font-size:12px;min-width:0'; input.setAttribute('aria-label', name); input.style.cssText = 'width:100%;box-sizing:border-box;min-width:44px;min-height:45px;font:inherit;border:1px solid #7c9b8e;border-radius:6px;padding:3px;background:#fffdf4;color:#224d40'; node.append(input); return node; }
function numeric(name: string, caption = name) { const input = el('input'); input.type = 'text'; input.inputMode = 'decimal'; input.maxLength = 32; input.autocomplete = 'off'; return { input, node: field(name, input, caption), get: () => { const value = input.value.trim(); return reactionNumber(value) ? value : ''; } }; }
function menu(name: string, values: readonly (readonly [
    string,
    string
])[], caption = name) {
    const input = el('select');
    input.add(new Option('Valitse', ''));
    for (const [value, label] of values)
        input.add(new Option(label, value));
    return { input, node: field(name, input, caption), get: () => input.value };
}
const opts = (values: readonly string[]) => values.map(v => [v, labels[v] ?? v] as const);
const esc = (s: string) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
function svg(markup: string, label: string, width = 420, height = 90) { const node = el('div'); node.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(label)}" style="display:block;width:100%;max-height:${height}px">${markup}</svg>`; return node; }
function chemicalText(formula: string) { return formula.replace(/\d+/g, n => n.replace(/./g, c => '₀₁₂₃₄₅₆₇₈₉'[Number(c)]!)); }
function equation(id: string, names = false) { const r = reactionRecipe(id)!; const side = (s: typeof r.reactants) => s.map(p => `${p.coefficient === 1 ? '' : p.coefficient + ' '}${names ? p.name : chemicalText(p.formula)}`).join(' + '); return `${side(r.reactants)} → ${side(r.products)}`; }
function readingsTable(readings: readonly ReactionRateReading[]) {
    const table = el('div');
    table.style.cssText = stack;
    for (const trial of ['A', 'B']) {
        const rows = readings.filter(r => r.trial === trial);
        if (rows.length)
            table.append(note(`${trial} · ${rows.map(r => `${r.timeS} s → ${r.productMassMg} mg`).join(' · ')}`));
    }
    return table;
}
function shapePicture(configurations: readonly ReactionConfiguration[]) {
    return svg(configurations.map((c, i) => { const [nx, ny, nz] = c.shape.cuts, x = 20 + i * 205, y = 22, w = 120, h = 18; return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#d1b57b" stroke="#567764"/>${Array.from({ length: nx - 1 }, (_, j) => `<path d="M${x + w * (j + 1) / nx},${y}v${h}" stroke="#fff6d6"/>`).join('')}${Array.from({ length: ny - 1 }, (_, j) => `<path d="M${x},${y + h * (j + 1) / ny}h${w}" stroke="#fff6d6"/>`).join('')}<text x="${x}" y="17" font-size="12">${i ? 'B ehdotus' : 'A vertailu'} · ${c.temperatureC} °C · c ${c.concentration}</text><text x="${x}" y="54" font-size="11">${nx}×${ny}×${nz} palaa · V ${c.volumeUnits}</text>`; }).join(''), 'Kumpikin pala esitetään samassa mittakaavassa. Kolmannen suunnan palat nimetään erikseen.', 420, 58);
}
export function reactionLabPaint(task: ReactionLabTask): Paint {
    return (host) => {
        const board = el('div');
        board.dataset.reactionBoard = '';
        board.style.cssText = stack;
        if (task.mode === 'change' || task.mode === 'reaction') {
            const cards = el('div');
            cards.style.cssText = grid;
            for (const c of task.cases) {
                const card = el('div');
                card.style.cssText = 'padding:4px;background:#eaf0dc;border-radius:6px;min-width:0';
                const before = c.before.map(s => `${s.name} ${chemicalText(s.formula)} ×${s.groups}`).join(' + '), after = c.after.map(s => `${s.name} ${chemicalText(s.formula)} ×${s.groups}`).join(' + ');
                card.append(note(`${c.id} · ${c.observation}`), note(`Ennen ${before}`), note(c.identityEvidence === 'verified' ? `Jälkeen ${after}` : 'Jälkeen vain ulkonäköhavainto'));
                const bubbles = c.illustration === 'gas-release' || c.illustration === 'burn';
                card.append(svg(`<path d="M20 15v35q0 5 5 5h80q5 0 5-5V15M160 15v35q0 5 5 5h80q5 0 5-5V15" fill="none" stroke="#537b69" stroke-width="2"/><rect x="29" y="37" width="72" height="13" fill="#a7c6b4"/><rect x="169" y="${bubbles ? 43 : 29}" width="72" height="${bubbles ? 7 : 21}" fill="#c1ac79"/>${bubbles ? Array.from({ length: 5 }, (_, i) => `<circle cx="${178 + i * 13}" cy="${18 + i % 2 * 10}" r="4" fill="#d4dfbd" stroke="#547865"/>`).join('') : ''}<text x="20" y="72" font-size="12">ennen</text><text x="160" y="72" font-size="12">jälkeen / havainto</text>`, `${c.id}. ${c.observation} Kuva on laadullinen mallimerkki.`, 280, 78), note(c.evidence));
                cards.append(card);
            }
            board.append(cards);
        }
        else if (task.mode === 'roles')
            for (const c of task.cases)
                board.append(note(`${c.id} · ${equation(c.recipe, c.presentation === 'written')}`));
        else if (task.mode === 'conservation') {
            const recipe = reactionRecipe(task.recipe)!, before = reactionMaterialState(recipe, task.groups, 0, task.massScaleMg, { open: false, gasFormula: task.boundary.gasFormula, escapedGroups: 0 }, [], task.outsideInitialGroups)!;
            board.append(note(equation(task.recipe)), note(`Alussa kammio ${before.insideMassMg} mg, keräysastia ${before.outsideMassMg} mg. ${task.groups} reaktioryhmää. ${task.boundary.open ? `Lopuksi siirrä ${task.boundary.escapedGroups} ${task.boundary.gasFormula}-malliryhmää keräysastiaan.` : 'Kammio pysyy suljettuna.'}`), note('Koko järjestelmä = kammio + keräysastia. Pyöristetyt suhteelliset atomimassat määrittävät annetun malliryhmän massan. Mallipallo ei paina yksittäisenä atomina milligrammoja.'));
        }
        else if (task.mode === 'rearrange') {
            const recipe = reactionRecipe(task.recipe)!, before = reactionMaterialState(recipe, task.groups, 0, task.massScaleMg)!;
            board.append(note(equation(task.recipe)), note(`${task.groups} reaktioryhmää · kaikki ${before.atoms.length} atomia. Sidosten kertalukusummat H 1, O 2, C 4.`), note(`Alkupankki ${before.inside.map(u => `${u.formula} [${u.atomIds.join(', ')}]`).join(' · ')}`));
        }
        else if (task.mode === 'energy') {
            const profile = task.cases[0]?.presentation === 'activation-profile', flow = task.cases[0]?.presentation === 'flow';
            board.append(note('Annetut mallienergiayksiköt. Käynnistyksen laina palautetaan ennen lopullista lukemaa.'));
            if (flow) {
                for (const c of task.cases) {
                    const r = reactionRecipe(c.recipe)!, net = c.extents * r.netEnergy;
                    board.append(note(`${c.id} · ${equation(c.recipe)} · käynnistyksen laina ${r.activation}`), svg(`<text x="15" y="15" font-size="12">Järjestelmä</text><text x="287" y="15" font-size="12">Ympäristö</text><path d="M${net < 0 ? 60 : 345} 35H${net < 0 ? 345 : 60}" stroke="#a67f48" stroke-width="4"/><path d="M${net < 0 ? 345 : 60} 35l${net < 0 ? -10 : 10} -7v14Z" fill="#a67f48"/><text x="200" y="27" text-anchor="middle" font-size="13">${Math.abs(net)} yksikköä</text><text x="200" y="57" text-anchor="middle" font-size="11">Lopullinen nettosiirto, käynnistyksen laina erikseen</text>`, `${c.id}. Nettosiirto ${Math.abs(net)} mallienergiayksikköä ${net < 0 ? 'järjestelmästä ympäristöön' : 'ympäristöstä järjestelmään'}.`, 420, 62));
                }
            }
            else {
                const table = el('table');
                table.style.cssText = 'width:100%;font-size:12px;border-collapse:collapse';
                const head = el('tr');
                for (const text of ['Koe', 'Järj. ennen→jälkeen', 'Ymp. ennen→jälkeen', profile ? 'Järj. käynnistyshuippu' : 'Laina'])
                    head.append(el('th', text));
                table.append(head);
                for (const c of task.cases) {
                    const r = reactionRecipe(c.recipe)!, net = c.extents * r.netEnergy;
                    board.append(note(`${c.id} · ${equation(c.recipe)}`));
                    const row = el('tr');
                    for (const text of [c.id, `${c.systemBefore} → ${c.systemBefore + net}`, `${c.surroundingsBefore} → ${c.surroundingsBefore - net}`, String(profile ? c.systemBefore + r.activation : r.activation)])
                        row.append(el('td', text));
                    table.append(row);
                }
                board.append(table);
            }
        }
        else if (task.mode === 'rate') {
            board.append(shapePicture(task.initial), note(`Aikaväli ${task.interval[0]}–${task.interval[1]} s. Kiinteä alku ${task.initial[0].extentLimit} ryhmää. c = ${task.model.concentrationSpecies}-ryhmiä / 10 tilavuusyksikköä.`));
            if (task.givenReadings) {
                const product = reactionRecipe(task.model.recipe)!.products.find(s => s.formula === task.model.product)!;
                board.append(readingsTable(task.givenReadings), note(`Annettu lopullinen enimmäistuotemassa · ${task.initial.map((c, i) => `${i ? 'B' : 'A'} ${reactionFormulaMass(product.formula)! * product.coefficient * c.extentLimit * task.massScaleMg} mg`).join(' · ')}. Tämä on loppusaanto, ei tämän havaintovälin nopeus.`));
            }
            else {
                const details = el('details'), summary = el('summary', 'Annettu paikallinen nopeusmalli ja vakiot');
                summary.style.minHeight = '25px';
                details.append(summary, note(task.model.scope), note(`T-kertoimet ${task.model.temperatures.map(t => `${t.value} °C → ${t.factor[0]}/${t.factor[1]}`).join(', ')}. Pitoisuuskertoimet ${task.model.concentrations.map(c => `${c.value} → ${c.factor[0]}/${c.factor[1]}`).join(', ')}. Perusvetäytymä ${task.model.baseRate.join('/')} mallipituusyksikköä/s. Alkumitat ${task.model.referenceShape.join('×')}, pintayksikköä ${task.model.referenceArea}. Lukemat kirjataan kokonaisina reaktioryhminä.`));
                board.append(details);
            }
        }
        host.replaceChildren(board);
    };
}
export function reactionLabWorkedPaint(task: ReactionLabTask): Paint {
    return host => {
        reactionLabPaint(task)(host);
        const answer = solutionReactionLab(task), box = el('div');
        box.style.cssText = stack;
        if (answer.mode === 'change' || answer.mode === 'reaction')
            for (const r of answer.rows)
                box.append(note(`${r.id} · ${labels[r.classification]} · ${labels[r.reason]}.`));
        else if (answer.mode === 'roles')
            for (const p of answer.placements)
                box.append(note(`${p.caseId} · alussa ${p.before.join(' + ')}, lopussa ${p.after.join(' + ')}.`));
        else if (answer.mode === 'conservation')
            box.append(note(`Kammio ${answer.inside} mg + keräysastia ${answer.outside} mg = koko järjestelmä ${answer.whole} mg. Kaasu kuuluu mukaan.`));
        else if (answer.mode === 'rearrange')
            box.append(note(`Jokainen alkuperäinen atomitunnus käytetään kerran. Tuotteet ${answer.molecules.map(m => m.formula).join(' + ')}. Sidontamallin ${answer.bonds.length} yhteyttä toteuttavat annetut kertalukusummat.`));
        else if (answer.mode === 'energy')
            for (const r of answer.rows)
                box.append(note(`${r.id} · nettomuutos ${r.systemChange}, ympäristössä ${r.surroundingsChange}. Käynnistysenergia ${r.activation}. ${labels[r.term]}.`));
        else if (answer.mode === 'rate')
            box.append(note(`Tuotemäärien muutokset ${answer.delta.join(' ja ')} mg, aika ${answer.duration} s. Nopeudet ${answer.rates.join(' ja ')} mg/s. ${labels[answer.relation]}.`));
        box.append(note('Tämä on Aavan malliratkaisu. Oma selitys ja mallin rajaus arvioidaan aikuisen havaintona.'));
        host.append(box);
    };
}
export function mountReactionLab(task: ReactionLabTask, host: HTMLElement, submit: (response: ReactionLabResponse) => void, onChange?: (response: ReactionLabResponse) => void): {
    reveal(): void;
    dispose(): void;
} {
    let disposed = false;
    const controls = el('div'), observations = el('div'), reviewHost = el('div'), work = el('div');
    work.dataset.reactionWorkshop = '';
    work.style.cssText = stack;
    controls.style.cssText = stack;
    observations.style.cssText = stack;
    host.replaceChildren(work);
    const style = el('style');
    style.textContent = '[data-reaction-workshop] [hidden]{display:none!important}[data-reaction-workshop] [data-explanation-adult]{font-size:12px;line-height:1.15}[data-reaction-workshop] [data-explanation-adult] select,[data-reaction-workshop] [data-explanation-adult] button{min-height:45px!important}[data-reaction-workshop] [data-explanation-adult] small{font-size:11px}[data-reaction-workshop] [data-explanation-adult] p{margin:3px 0}';
    work.append(style);
    work.append(observations, controls, reviewHost);
    let read: () => ReactionLabResponse;
    const kind = 'reaction-lab' as const;
    const push = () => {
        if (!disposed && read)
            onChange?.(read());
    };
    const fields = (...nodes: HTMLElement[]) => { const row = el('div'); row.style.cssText = grid; row.append(...nodes); controls.append(row); return row; };
    if (task.mode === 'change' || task.mode === 'reaction') {
        const rows = task.cases.map(c => {
            const classification = menu(`${c.id} muutoksen luokka`, opts(['physical', 'chemical', 'insufficient']), `${c.id} luokka`), reason = menu(`${c.id} päätelmän peruste`, opts(['same-identity', 'new-identity', 'need-data']), `${c.id} peruste`);
            const substances = c.after.filter(s => !c.before.some(b => b.id === s.id)).map(s => { const input = el('input'); input.type = 'checkbox'; const node = field(`${c.id} uusi aine ${s.name}`, input, s.name); node.style.cssText = 'display:flex;align-items:center;gap:4px;min-height:45px;font-size:12px'; input.style.cssText = 'width:45px;height:45px;flex:none'; return { s, input, node }; });
            fields(classification.node, reason.node, ...substances.map(s => s.node));
            return { c, classification, reason, substances };
        });
        read = () => ({ kind, mode: task.mode, rows: rows.map(r => ({ id: r.c.id, classification: r.classification.get(), reason: r.reason.get(), newSubstances: r.substances.filter(s => s.input.checked).map(s => s.s.id) })) });
    }
    else if (task.mode === 'roles') {
        const rows = task.cases.flatMap(c => { const r = reactionRecipe(c.recipe)!; return [...r.reactants, ...r.products].map(s => { const role = menu(`${c.id} ${s.formula} rooli`, opts(['reactant', 'product']), `${c.id} ${s.formula}`); fields(role.node); return { caseId: c.id, formula: s.formula, role }; }); });
        read = () => ({ kind, mode: 'roles', rows: rows.map(r => ({ caseId: r.caseId, formula: r.formula, role: r.role.get() })), placements: task.cases.map(c => ({ caseId: c.id, before: rows.filter(r => r.caseId === c.id && r.role.get() === 'reactant').map(r => r.formula), after: rows.filter(r => r.caseId === c.id && r.role.get() === 'product').map(r => r.formula) })) });
    }
    else if (task.mode === 'energy') {
        const rows = task.cases.map(c => { const system = numeric(`${c.id} järjestelmän energiamuutos`, `${c.id} Δ järjestelmä`), surroundings = numeric(`${c.id} ympäristön energiamuutos`, `${c.id} Δ ympäristö`), activation = numeric(`${c.id} käynnistysenergia`, `${c.id} käynnistys`), direction = menu(`${c.id} energian suunta`, opts(['out', 'in']), `${c.id} suunta`), term = menu(`${c.id} energiamuutoksen nimi`, opts(['exothermic', 'endothermic']), `${c.id} nimi`); fields(system.node, surroundings.node, activation.node, direction.node, term.node); return { c, system, surroundings, activation, direction, term }; });
        read = () => ({ kind, mode: 'energy', rows: rows.map(r => ({ id: r.c.id, systemChange: r.system.get(), surroundingsChange: r.surroundings.get(), activation: r.activation.get(), direction: r.direction.get(), term: r.term.get() })) });
    }
    else if (task.mode === 'conservation') {
        const forecastInside = numeric('Oma ennuste kammion massa', 'Ennuste kammio'), forecastOutside = numeric('Oma ennuste keräysastian massa', 'Ennuste keräysastia'), predictionUnit = menu('Ennusteen massayksikkö', opts(['mg', 'g']), 'Ennusteen yksikkö');
        predictionUnit.input.value = 'mg';
        const forecast = fields(forecastInside.node, forecastOutside.node, predictionUnit.node), actions: ReactionAction[] = [];
        const record = (action: ReactionAction) => { actions.push(action); render(); push(); };
        const next = () => `a${actions.length + 1}`;
        const replay = () => replayReactionConservation(task, actions)!;
        const lock = button('Lukitse massaennuste', () => {
            if (!forecastInside.get() || !forecastOutside.get())
                return;
            record({ type: 'lock-conservation', id: next(), run: task.run, inside: forecastInside.get(), outside: forecastOutside.get(), unit: predictionUnit.get() as 'mg' | 'g' });
        });
        const start = button('Käynnistä kammion muutos', () => record({ type: 'start', id: next(), run: task.run, trial: 'A' })), complete = button('Suorita muutos loppuun', () => record({ type: 'complete', id: next(), run: task.run, trial: 'A' })), boundary = button('Siirrä annettu kaasu keräysastiaan', () => record({ type: 'boundary', id: next(), run: task.run, trial: 'A', open: true, gasFormula: task.boundary.gasFormula, groups: task.boundary.escapedGroups }));
        fields(lock, start, complete, ...(task.boundary.open ? [boundary] : []));
        const inside = numeric('Kammion massa havainnon jälkeen', 'Kammio'), outside = numeric('Keräysastian massa havainnon jälkeen', 'Keräysastia'), whole = numeric('Koko järjestelmän massa', 'Koko järjestelmä'), unit = menu('Vastauksen massayksikkö', opts(['mg', 'g']), 'Yksikkö'), reflection = menu('Ennusteen tarkistus', opts(['confirmed', 'revised']), 'Ennusteen tarkistus');
        unit.input.value = 'mg';
        fields(inside.node, outside.node, whole.node, unit.node, reflection.node);
        function render() { const r = replay(); forecast.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input,select').forEach(n => n.disabled = r.locked); lock.disabled = r.locked; start.disabled = !r.locked || r.started; complete.disabled = !r.started || r.observed; boundary.disabled = !r.observed || r.escapedGroups > 0; observations.replaceChildren(note(r.observed ? `Havainto · kammio ${r.state.insideMassMg} mg · keräysastia ${r.state.outsideMassMg} mg. Molemmat pysyvät koko ainekirjassa.` : 'Havainto avataan oman ennusteen ja suoritetun kokeen jälkeen.')); }
        read = () => ({ kind, mode: 'conservation', forecastInside: forecastInside.get(), forecastOutside: forecastOutside.get(), predictionUnit: predictionUnit.get(), actions: [...actions], locked: replay().locked, observed: replay().observed, reflection: reflection.get(), inside: inside.get(), outside: outside.get(), whole: whole.get(), unit: unit.get() });
        render();
    }
    else if (task.mode === 'rearrange') {
        mountRearrangement(task, controls, observations, () => push(), assign => { read = assign; });
    }
    else if (task.mode === 'rate') {
        mountRate(task, controls, observations, () => push(), assign => { read = assign; });
    }
    const finish = button('Tarkista reaktiopajan tutkimus', () => {
        const response = read();
        if (!task.review) {
            submit(response);
            return;
        }
        controls.hidden = true;
        reviewHost.replaceChildren();
        mountObservedExplanation(reactionExplanation(task)!, reviewHost, r => submit({ ...response, review: { observations: r.observations, confirmedByAdult: r.confirmedByAdult, assistance: r.assistance } }));
        const panel = reviewHost.querySelector<HTMLElement>('[data-explanation-adult]>div');
        if (panel) {
            panel.style.cssText += ';display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px;padding:5px';
            for (const child of Array.from(panel.children))
                if (child instanceof HTMLElement)
                    child.style.gridColumn = '1 / -1';
            for (const label of panel.querySelectorAll<HTMLLabelElement>(':scope>label')) {
                label.style.cssText += ';grid-template-columns:minmax(0,1fr) minmax(110px,35%);font-size:12px;min-height:45px';
                if(label.querySelector('input[type=checkbox],[aria-label="Saiko oppija apua?"]'))label.style.gridColumn='auto';
            }
        }
    });
    controls.append(finish);
    const changed = () => push();
    controls.addEventListener('change', changed);
    controls.addEventListener('input', changed);
    push();
    return { reveal() { controls.hidden = false; reviewHost.replaceChildren(); observations.append(note(task.review?.model ?? 'Vertaa annettuja aineita ja säilyviä määriä.')); }, dispose() { disposed = true; controls.removeEventListener('change', changed); controls.removeEventListener('input', changed); host.replaceChildren(); } };
}
type ReadResponse = () => ReactionLabResponse;
function mountRearrangement(task: Extract<ReactionLabTask, {
    mode: 'rearrange';
}>, controls: HTMLElement, observations: HTMLElement, changed: (response: ReactionLabResponse) => void, setRead: (read: ReadResponse) => void) {
    const recipe = reactionRecipe(task.recipe)!, initial = reactionMaterialState(recipe, task.groups, 0, task.massScaleMg)!, count = recipe.products.reduce((n, s) => n + s.coefficient * task.groups, 0);
    const molecules = Array.from({ length: count }, (_, i) => ({ id: `p${i + 1}`, formula: '', atomIds: [] as string[] })), bonds: {
        a: string;
        b: string;
        order: number;
    }[] = [];
    const group = menu('Oma tuoteryhmä', molecules.map(m => [m.id, `Tuoteryhmä ${m.id}`] as const), 'Tuoteryhmä'), formula = menu('Tuoteryhmän kaava', recipe.products.map(s => [s.formula, `${s.formula} · ${s.name}`] as const), 'Oma kaava');
    group.input.value = 'p1';
    const atom = menu('Siirrettävä alkuperäinen atomi', initial.atoms.map(a => [a.id, `${a.element} · ${a.id}`] as const), 'Atomi'), first = menu('Sidoksen alkuatomi', [], 'Sidoksen alku'), second = menu('Sidoksen loppuatomi', [], 'Sidoksen loppu'), order = menu('Sidoksen kertaluku', opts(['1', '2', '3']), 'Kertaluku');
    order.input.value = '1';
    const row = el('div');
    row.style.cssText = grid;
    const navigation = el('div');
    navigation.style.cssText = grid;
    controls.append(navigation, row);
    const current = () => molecules.find(m => m.id === group.get())!;
    const transfer = button('Siirrä atomi omaan ryhmään', () => {
        const id = atom.get();
        if (!initial.atoms.some(a => a.id === id))
            return;
        for (const m of molecules)
            m.atomIds = m.atomIds.filter(a => a !== id);
        current().atomIds.push(id);
        for (let i = bonds.length - 1; i >= 0; i--)
            if (bonds[i]!.a === id || bonds[i]!.b === id)
                bonds.splice(i, 1);
        render();
        changed(read());
    });
    const remove = button('Palauta atomi alkupankkiin', () => {
        const id = atom.get();
        for (const m of molecules)
            m.atomIds = m.atomIds.filter(a => a !== id);
        for (let i = bonds.length - 1; i >= 0; i--)
            if (bonds[i]!.a === id || bonds[i]!.b === id)
                bonds.splice(i, 1);
        render();
        changed(read());
    });
    const connect = button('Lisää tai muuta sidos', () => {
        const a = first.get(), b = second.get();
        if (!a || !b || a === b)
            return;
        const old = bonds.findIndex(e => e.a === a && e.b === b || e.a === b && e.b === a);
        if (old >= 0)
            bonds.splice(old, 1);
        bonds.push({ a, b, order: Number(order.get()) });
        render();
        changed(read());
    });
    const disconnect = button('Poista valittu sidos', () => {
        const a = first.get(), b = second.get(), index = bonds.findIndex(e => e.a === a && e.b === b || e.a === b && e.b === a);
        if (index >= 0)
            bonds.splice(index, 1);
        render();
        changed(read());
    });
    row.append(group.node, formula.node, atom.node, transfer, remove, first.node, second.node, order.node, connect, disconnect);
    const inventories = Object.keys(initial.allInventory).map(element => ({ element, before: numeric(`${element} atomit ennen`, `${element} ennen`), after: numeric(`${element} atomit jälkeen`, `${element} jälkeen`) })), fields = el('div');
    fields.style.cssText = grid;
    for (const f of inventories)
        fields.append(f.before.node, f.after.node);
    controls.append(fields);
    fields.hidden = true;
    navigation.append(button('Ryhmittely ja sidokset', () => { row.hidden = false; fields.hidden = true; }), button('Oma atomitili', () => { row.hidden = true; fields.hidden = false; }));
    function parseCount(raw: string) { const q = reactionNumber(raw); return q ? Number(q[0]) / Number(q[1]) : -1; }
    function read(): ReactionLabResponse { return { kind: 'reaction-lab', mode: 'rearrange', molecules: molecules.map(m => ({ ...m, atomIds: [...m.atomIds] })), bonds: bonds.map(b => ({ ...b })), beforeAtoms: Object.fromEntries(inventories.map(f => [f.element, parseCount(f.before.get())])), afterAtoms: Object.fromEntries(inventories.map(f => [f.element, parseCount(f.after.get())])) }; }
    function render() {
        const selected = current(), options = selected.atomIds.map(id => [id, id] as const);
        for (const f of [first, second]) {
            const previous = f.get();
            f.input.replaceChildren(new Option('Valitse', ''));
            for (const [id, label] of options)
                f.input.add(new Option(label, id));
            f.input.value = options.some(([id]) => id === previous) ? previous : '';
        }
        formula.input.value = selected.formula;
        const assigned = new Set(molecules.flatMap(m => m.atomIds));
        observations.replaceChildren(note(`Alkupankissa vielä ${initial.atoms.length - assigned.size} atomia. Oma rakenne käyttää ${assigned.size}/${initial.atoms.length} alkuperäistä tunnusta.`), note(molecules.map(m => `${m.id} ${m.formula || 'kaava?'} [${m.atomIds.map(id => initial.atoms.find(a => a.id === id)!.element + '·' + (initial.atoms.findIndex(a => a.id === id) + 1)).join(' ')}]`).join(' · ')), note(`Omat sidokset ${bonds.map(b => `${initial.atoms.findIndex(a => a.id === b.a) + 1}—${initial.atoms.findIndex(a => a.id === b.b) + 1} (${b.order})`).join(', ') || 'ei vielä'}`));
        const points = selected.atomIds.map((id, i) => ({ id, x: 210 + Math.cos(i * 2 * Math.PI / Math.max(1, selected.atomIds.length)) * 75, y: 32 + Math.sin(i * 2 * Math.PI / Math.max(1, selected.atomIds.length)) * 19 }));
        const edges = bonds.filter(b => points.some(p => p.id === b.a) && points.some(p => p.id === b.b));
        observations.append(svg(edges.map(b => { const a = points.find(p => p.id === b.a)!, end = points.find(p => p.id === b.b)!; return Array.from({ length: b.order }, (_, i) => `<line x1="${a.x}" y1="${a.y + (i - (b.order - 1) / 2) * 4}" x2="${end.x}" y2="${end.y + (i - (b.order - 1) / 2) * 4}" stroke="#345f4f" stroke-width="2"/>`).join(''); }).join('') + points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="12" fill="#e8d8ac" stroke="#345f4f"/><text x="${p.x}" y="${p.y + 4}" text-anchor="middle" font-size="11">${p.id}</text>`).join(''), `Oma ryhmä ${selected.id}. Omat sidokset ja alkuperäiset atomitunnukset.`, 420, 64));
    }
    group.input.onchange = render;
    formula.input.onchange = () => { current().formula = formula.get(); changed(read()); render(); };
    setRead(read);
    render();
}
function mountRate(task: Extract<ReactionLabTask, {
    mode: 'rate';
}>, controls: HTMLElement, observations: HTMLElement, changed: (response: ReactionLabResponse) => void, setRead: (read: ReadResponse) => void) {
    const dataOnly = task.activity === 'compare-data' || task.activity === 'produce-window', actions: ReactionAction[] = [], parts = el('div'), navigation = el('div');
    navigation.style.cssText = grid;
    parts.style.cssText = stack;
    controls.append(navigation, parts);
    const plan = el('div'), experiment = el('div'), calculation = el('div');
    for (const p of [plan, experiment, calculation]) {
        p.style.cssText = stack;
        parts.append(p);
    }
    function show(section: HTMLElement) {
        for (const p of [plan, experiment, calculation])
            p.hidden = p !== section;
    }
    for (const [title, section] of [['Oma suunnitelma', plan], ['Kokeen havainto', experiment], ['Omat laskut', calculation]] as const) {
        if (!dataOnly)
            navigation.append(button(title, () => show(section)));
    }
    const gridRow = (parent: HTMLElement, ...children: HTMLElement[]) => { const row = el('div'); row.style.cssText = grid; row.append(...children); parent.append(row); return row; };
    const factor = menu('Oma muuttuva tekijä', opts(task.allowedFactors), 'Muuttuva tekijä'), forecast = menu('Oma nopeusennuste', opts(['faster', 'same', 'slower']), 'Oma ennuste');
    const initialB = task.initial[1], temperature = menu('Kokeen B lämpötila', task.model.temperatures.map(t => [String(t.value), `${t.value} °C`] as const), 'B lämpötila'), concentration = menu('Kokeen B pitoisuus', task.model.concentrations.map(c => [String(c.value), `${c.value} ryhmää / 10 V`] as const), 'B pitoisuus'), cuts = menu('Kokeen B palajako', task.cutOptions.map(c => [c.join(','), c.join('×')] as const), 'B palajako');
    temperature.input.value = String(initialB.temperatureC);
    concentration.input.value = String(initialB.concentration);
    cuts.input.value = initialB.shape.cuts.join(',');
    if (task.allowedFactors.length === 1)
        factor.input.value = task.allowedFactors[0]!;
    const configuration = (): ReactionConfiguration => ({ ...initialB, temperatureC: Number(temperature.get()), concentration: Number(concentration.get()), shape: { ...initialB.shape, cuts: cuts.get().split(',').map(Number) as [
                number,
                number,
                number
            ] } });
    const lock = button('Lukitse suunnitelma ja ennuste', () => {
        if (!factor.get() || !forecast.get() || actions.length)
            return;
        const configured: ReactionAction = { type: 'configure', id: 'a1', run: task.run, trial: 'B', configuration: configuration() }, locked: ReactionAction = { type: 'lock', id: 'a2', run: task.run, factor: factor.get() as ReactionFactor, forecast: forecast.get() as ReactionRelation };
        if (!replayReactionRate(task, [configured, locked]))
            return;
        actions.push(configured, locked);
        render();
        show(experiment);
        changed(read());
    });
    gridRow(plan, temperature.node, concentration.node, cuts.node, factor.node, forecast.node, lock);
    plan.prepend(note(`A on vertailu · ${task.initial[0].temperatureC} °C, c ${task.initial[0].concentration}, jako ${task.initial[0].shape.cuts.join('×')}. Sama kiinteän lähtöaineen alkumäärä ja kammion tilavuus pysyvät molemmissa. Valitse B itse.`));
    const trial = menu('Suoritettava koe', opts(['A', 'B']), 'Koe');
    trial.input.value = 'A';
    const step = menu('Ajan siirto sekunteina', Array.from(new Set([1, 5, task.interval[0], task.interval[1] - task.interval[0]])).filter(n => n > 0).map(n => [String(n), `${n} s`] as const), 'Siirrä aikaa');
    step.input.value = String(task.interval[1] - task.interval[0]);
    const perform = (action: ReactionAction) => {
        if (actions.length >= 64 || !replayReactionRate(task, [...actions, action]))
            return;
        actions.push(action);
        render();
        changed(read());
    };
    const next = () => `a${actions.length + 1}`;
    const start = button('Käynnistä valittu koe', () => perform({ type: 'start', id: next(), run: task.run, trial: trial.get() })), advance = button('Siirrä mallin kelloa', () => perform({ type: 'advance', id: next(), run: task.run, trial: trial.get(), seconds: Number(step.get()) })), sample = button('Kirjaa nykyinen havainto', () => perform({ type: 'sample', id: next(), run: task.run, trial: trial.get() }));
    gridRow(experiment, trial.node, start, step.node, advance, sample);
    experiment.append(note(`Kirjaa kummastakin kokeesta lukema hetkillä ${task.interval.join(' ja ')} s. Kello ja kirjaus ovat eri toimia. Ennustetta ei voi muuttaa havainnon jälkeen.`));
    const readingFields = ['A', 'B'].flatMap(trial => task.interval.map(timeS => ({ trial, timeS, value: numeric(`${trial} tuotemassa hetkellä ${timeS} s`, `${trial} · ${timeS} s / mg`) })));
    gridRow(calculation, ...readingFields.map(r => r.value.node));
    const delta = [numeric('Kokeen A tuotemäärän muutos', 'A määrän muutos'), numeric('Kokeen B tuotemäärän muutos', 'B määrän muutos')] as const, duration = numeric('Havaintovälin kesto sekunteina', 'Ajan muutos / s'), quantityUnit = menu('Määrän muutoksen yksikkö', opts(['mg', 'g']), 'Määräyksikkö');
    quantityUnit.input.value = 'mg';
    gridRow(calculation, delta[0].node, delta[1].node, duration.node, quantityUnit.node);
    const rates = [numeric('Kokeen A oma nopeus', 'A nopeus'), numeric('Kokeen B oma nopeus', 'B nopeus')] as const, rateUnit = menu('Nopeuden yksikkö', opts(['mg/s', 'g/s']), 'Nopeusyksikkö');
    rateUnit.input.value = 'mg/s';
    const relation = menu('Nopeuksien vertailu', opts(['faster', 'same', 'slower']), 'B suhteessa A');
    gridRow(calculation, rates[0].node, rates[1].node, rateUnit.node, relation.node);
    const yieldRelation = menu('Lopullisten saantojen vertailu', [['more', 'B suurempi'], ['same', 'Yhtä suuri'], ['less', 'B pienempi']], 'Loppusaanto B vs A');
    const reflection = menu('Ennusteen jälkeinen päätelmä', opts(dataOnly ? ['data-only'] : ['confirmed', 'revised']), 'Ennusteen tarkistus'), scope = menu('Päätelmän käyttöalue', opts([dataOnly ? 'given-window' : 'model-only', 'all-reactions']), 'Käyttöalue');
    gridRow(calculation, ...(dataOnly ? [yieldRelation.node] : []), reflection.node, scope.node);
    function read(): ReactionLabResponse {
        const replay = dataOnly ? undefined : replayReactionRate(task, actions);
        return { kind: 'reaction-lab', mode: 'rate', ...(replay?.locked ? { plan: { factor: replay.factor!, configurations: [replay.trials.A.configuration, replay.trials.B.configuration] as const, forecast: replay.forecast! } } : {}), actions: [...actions], readings: readingFields.map(r => ({ trial: r.trial, timeS: r.timeS, productMass: r.value.get(), unit: 'mg' })), delta: [delta[0].get(), delta[1].get()], duration: duration.get(), quantityUnit: quantityUnit.get(), rates: [rates[0].get(), rates[1].get()], rateUnit: rateUnit.get(), relation: relation.get(), yieldRelation: dataOnly ? yieldRelation.get() : '', reflection: reflection.get(), boundaryScope: scope.get() };
    }
    function render() {
        const replay = dataOnly ? undefined : replayReactionRate(task, actions), current = replay?.trials[trial.get() as 'A' | 'B'];
        for (const f of [temperature, concentration, cuts, factor, forecast])
            f.input.disabled = !!replay?.locked;
        lock.disabled = !!replay?.locked;
        start.disabled = !replay?.locked || !!current?.started;
        advance.disabled = !current?.started;
        sample.disabled = !current?.started;
        observations.replaceChildren();
        if (!dataOnly) {
            const settings=el('div');settings.dataset.reactionSettings='';settings.style.cssText=grid;
            for(const [index,id]of (['A','B'] as const).entries()){const trial=replay?.trials[id],c=trial?.configuration??task.initial[index]!;settings.append(note(`Oma ${id} ${c.temperatureC} °C · c ${c.concentration} · ${c.shape.cuts.join('×')} palaa · ${trial?.timeS??0} s`));}
            observations.append(settings);
            const readings = replay ? [...replay.trials.A.readings, ...replay.trials.B.readings] : [];
            if (readings.length)
                observations.append(readingsTable(readings));
            else
                observations.append(note('Numeerinen lukema avautuu vasta oman kirjauksen jälkeen.'));
        }
    }
    trial.input.onchange = render;
    setRead(read);
    render();
    show(dataOnly ? calculation : plan);
}
