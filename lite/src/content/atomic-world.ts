import type { Rng } from '../engine/rng';
import type { Item, NodeSpec } from '../engine/types';
import { cases } from './kit';
import { atomicWorldPaint, atomicWorldWorkedPaint, atomicWorldScene } from './scenes/atomic-world';
import { atomicElements, atomicElement, type AtomicWorldTask, type AtomicAtom, type AtomicReview, type AtomicSite, type AtomicSample, type AtomicStructure } from './models/atomic-world';
type Factory = (r: Rng) => AtomicWorldTask;
type Draft = Omit<Item, 'tag'> & {
    sceneModel?: ReturnType<typeof atomicWorldScene>;
};
const kind = 'atomic-world' as const;
const basic = atomicElements.filter(e => e.z <= 20);
function atom(r: Rng, symbol?: string, id = 'a'): AtomicAtom { const e = symbol ? atomicElement(symbol)! : r.pick(basic), a = r.pick(e.isotopes); return { id, symbol: e.symbol, protons: e.z, neutrons: a - e.z, electrons: e.z }; }
function review(prompt: string, criteria: readonly (readonly [
    string,
    string,
    string
])[], model: string): AtomicReview { return { prompt, rubric: criteria.map(([id, label, guide]) => ({ id, label, guide })), model }; }
const symbolic = ['limit', 'Rajaa mallin esitys', 'Kertoo, mitä pallot, värit tai tikut kuvaavat ja mitä ne eivät esitä kirjaimellisesti.'] as const;
function atomTask(r: Rng, activity: 'link' | 'regions' | 'number' | 'particle', family: number, particle?: 'proton' | 'neutron' | 'electron'): AtomicWorldTask {
    const a = atom(r, activity === 'number' && family === 1 ? r.pick(basic.filter(e => e.isotopes.length > 1)).symbol : undefined), style = family === 2 ? 'monochrome' : family === 1 ? 'cloud' : 'cutaway';
    if (activity === 'link') {
        const symbol = family === 1 ? r.pick(['H', 'N', 'O', 'F', 'Cl']) : r.pick(['He', 'Ne', 'Ar', 'Al', 'Mg', 'C']), a = atom(r, symbol), units = r.int(2, 7), atomsPerUnit = family === 1 ? 2 : 1;
        const candidates = [a, ...r.shuffle(basic.filter(e => e.symbol !== symbol)).slice(0, 2).map((e, i) => atom(r, e.symbol, String.fromCharCode(98 + i)))];
        return { kind, mode: 'atom', activity, atoms: candidates.sort((a, b) => a.protons - b.protons).map((a, i) => ({ ...a, id: String.fromCharCode(97 + i) })), style, title: 'Näytteestä nimettyyn atomilajiin', sample: { symbol, units, atomsPerUnit, state: ['He', 'Ne', 'Ar', 'H', 'N', 'O', 'F', 'Cl'].includes(symbol) ? 'gas' : 'solid', appearance: ['He', 'Ne', 'Ar', 'H', 'N', 'O', 'F', 'Cl'].includes(symbol) ? 'Suljettu kaasun makronäyte 20 °C:ssa' : 'Kiinteän alkuaineen makronäyte 20 °C:ssa' } };
    }
    if (activity === 'regions') {
        const comparison = family === 1 ? { ...a, id: 'b', ...(r.chance(.5) ? { electrons: Math.max(0, a.electrons - 1) } : {}) } : undefined;
        return { kind, mode: 'atom', activity, atoms: [a], style, title: family === 1 ? 'Kaksi erikseen suurennettua atomi-ikkunaa' : 'Keskus ja elektroniverho', ...(comparison ? { comparison } : {}) };
    }
    if (activity === 'number') {
        const b = family === 1 ? { ...a, id: 'b', neutrons: (atomicElement(a.symbol)!.isotopes.find(m => m - a.protons !== a.neutrons) ?? (a.protons + a.neutrons)) - a.protons } : undefined;
        if (family === 2)
            a.electrons = Math.max(0, a.electrons - r.int(1, 2));
        return { kind, mode: 'atom', activity, atoms: b ? [a, b] : [a], style, title: family === 1 ? 'Sama tunnus, eri neutroniluku' : 'Nimetön ydin ja järjestysluku' };
    }
    if(particle==='neutron'&&a.neutrons===0)a.neutrons=1;
    return { kind, mode: 'atom', activity, particle, atoms: [a], inverse: family === 1, style, title: family === 1 ? 'Hiukkaskortti tuntomerkeistä' : 'Hiukkasen paikka ja varaus' };
}
const species = (id: string, atoms: readonly string[], units: number, structure: 'atom' | 'molecule' | 'lattice') => ({ id, label: atoms.join('·'), atoms, units, structure });
function samples(r: Rng, focus: 'element' | 'compound', family: number): AtomicWorldTask {
    const mon = r.pick(['He', 'Ne', 'Ar', 'Al', 'Mg']), di = r.pick(['H', 'N', 'O', 'F', 'Cl']), units = r.int(2, 7);
    const composition = r.pick([['H', 'H', 'O'], ['C', 'O', 'O'], ['N', 'H', 'H', 'H'], ['C', 'H', 'H', 'H', 'H']] as const), ionic = r.pick([['Na', 'Cl'], ['Mg', 'O']] as const);
    const single = species('one', family === 1 ? [di, di] : [mon], units, family === 1 ? 'molecule' : 'atom');
    const bonded = species('bond', family === 2 ? ionic : composition, units, family === 2 ? 'lattice' : 'molecule');
    const mixed = [single, species('other', focus === 'element' ? (family === 1 ? [mon] : [di, di]) : composition, r.int(1, 5), focus === 'element' && family === 1 ? 'atom' : 'molecule')];
    const cards: AtomicSample[] = [{ id: 'a', label: 'Näyte A', species: [single] }, { id: 'b', label: 'Näyte B', species: [bonded] }, { id: 'c', label: 'Näyte C', species: mixed }];
    return { kind, mode: 'sample', focus, title: focus === 'element' ? 'Yhden atomilajin näyte' : 'Sitoutunut yhdiste ja erilliset aineet', samples: cards.sort((a, b) => a.species.reduce((n, s) => n + s.atoms.length * s.units, 0) - b.species.reduce((n, s) => n + s.atoms.length * s.units, 0) || a.species[0]!.atoms.join('').localeCompare(b.species[0]!.atoms.join(''))).map((s, i) => ({ ...s, id: String.fromCharCode(97 + i), label: `Näyte ${String.fromCharCode(65 + i)}` })),
        ...(focus === 'element' ? { context: { kind: 'element' as const, route: family === 0 ? 'pure' as const : family === 1 ? 'atomic' as const : 'either' as const } } : {}) };
}
export function atomicLatticeSites(width: number, depth: number, layers: number): AtomicSite[] { return Array.from({ length: width * depth * layers }, (_, i) => ({ id: `s${i + 1}`, x: i % width, y: Math.floor(i / width) % layers, z: Math.floor(i / (width * layers)) })); }
function build(r: Rng, family: number): AtomicWorldTask {
    if (family === 1) {
        const width = r.pick([2, 4]), depth = r.pick([1, 2]), layers = r.pick([2, 3]), sites = atomicLatticeSites(width, depth, layers), species = r.pick([['Na', 'Cl'], ['Mg', 'O']] as const);
        return { kind, mode: 'build', structure: 'lattice', title: 'Rakenna jatkuvan ionihilan ikkuna', compound: species.join(''), sites, species, counts: [sites.length / 2, sites.length / 2], review: review('Selitä aikuiselle, miten oma hila kuvaa yhtä yhdistettä ja mikä jää mallin ulkopuolelle.', [['ratio', 'Perustelee atomilajien suhteen', 'Käyttää oman ikkunan lukumääriä ja jatkuvan hilan annettua toistosääntöä.'], symbolic], 'Hilan ikkuna sisältää vuorottelevia ionipaikkoja. Se jatkuu reunoilta eikä koostu erillisistä NaCl- tai MgO-molekyyleistä.') };
    }
    const options: {
        formula: string;
        composition: Record<string, number>;
        valences: Record<string, number>;
    }[] = [{ formula: 'H2O', composition: { O: 1, H: 2 }, valences: { O: 2, H: 1 } }, { formula: 'CO2', composition: { C: 1, O: 2 }, valences: { C: 4, O: 2 } },
        { formula: 'NH3', composition: { N: 1, H: 3 }, valences: { N: 3, H: 1 } }, { formula: 'CH4', composition: { C: 1, H: 4 }, valences: { C: 4, H: 1 } }];
    const transferOptions: {
        formula: string;
        composition: Record<string, number>;
        valences: Record<string, number>;
    }[] = [{ formula: 'H2S', composition: { S: 1, H: 2 }, valences: { S: 2, H: 1 } }, { formula: 'SiH4', composition: { Si: 1, H: 4 }, valences: { Si: 4, H: 1 } }, { formula: 'PCl3', composition: { P: 1, Cl: 3 }, valences: { P: 3, Cl: 1 } }];
    const chosen = r.pick<{
        formula: string;
        composition: Record<string, number>;
        valences: Record<string, number>;
    }>(family === 2 ? transferOptions : options), copies = r.int(family === 2 ? 2 : 1, family === 2 ? 5 : 4), composition: Record<string, number> = {};
    for (const [s, n] of Object.entries(chosen.composition))
        if (n)
            composition[s] = n;
    const bank = Object.entries(composition).flatMap(([symbol, n]) => Array.from({ length: n + copies }, (_, i) => ({ id: `${symbol}${i + 1}`, symbol })));
    return { kind, mode: 'build', structure: 'molecule', title: family === 2 ? 'Uusi yhdiste rakennuspöydälle' : 'Yhden molekyylin oma sidontamalli', compound: chosen.formula, composition, bank, valences: chosen.valences, review: review('Esittele oma molekyylirakenne aikuiselle. Mitä osat ja yhteydet merkitsevät?', [['ratio', 'Yhdistää määrät koostumukseen', 'Nimeää omasta mallista kunkin atomilajin ja vertaa määriä annettuun kaavaan.'], symbolic], 'Molekyylissä on annettu määrä kutakin atomilajia. Yhteydet kuvaavat annettua sidontamallia. Tikut eivät ole aineessa olevia sauvoja eikä kuva näytä kaikkea elektronirakennetta.') };
}
function periodic(r: Rng, skill: 'order' | 'location', family: number): AtomicWorldTask {
    const cards = r.shuffle(basic).slice(0, r.int(3, 5)).sort((a, b) => a.symbol.localeCompare(b.symbol)).map(e => e.symbol), target = r.pick(family === 2 ? atomicElements : basic).symbol;
    return { kind, mode: 'periodic', activity: skill === 'order' ? (family === 0 ? 'order' : 'fill') : (family === 0 ? 'locate' : 'inverse'), title: skill === 'order' ? 'Alkuainekortit järjestyksen malliin' : 'Vaakarivi ja pystysarake', cards: skill === 'order' && family === 0 ? cards : [], target: skill === 'order' && family === 0 ? cards[0]! : target, table: atomicElements.map(e => e.symbol) };
}
function property(r: Rng, family: number): AtomicWorldTask {
    const group = family === 2 ? 17 : family === 1 ? 18 : 1, all = atomicElements.filter(e => e.group === group && e.z > 2), pool = group === 18 ? atomicElements.filter(e => e.group === 18) : all;
    const target = r.pick(pool).symbol, remaining = pool.filter(e => e.symbol !== target), references = r.shuffle(remaining).slice(0, group === 17 ? 2 : 3).map(e => e.symbol).sort((a, b) => atomicElement(a)!.period - atomicElement(b)!.period), comparison = r.pick(references);
    return { kind, mode: 'property', title: family === 2 ? 'Toinen ryhmä ja olomuodon ennuste' : 'Taulukon rajattu ominaisuusvihje', group, property: family === 2 ? 'state' : family === 1 ? 'boiling' : 'melting', references, target, comparison, temperatureC: 20,
        review: review('Perustele aikuiselle ennuste annetulla ryhmällä ja havaintotaulukolla. Rajaa päätelmä tähän ominaisuuteen.', [['data', 'Käyttää annettuja vertailutietoja', 'Yhdistää kohteen ryhmän ja jakson saman ryhmän lukuihin tai annettuun olomuotosääntöön.'], ['limit', 'Rajaa ennusteen', 'Ei väitä kaikkia ominaisuuksia samoiksi eikä taulukon suuntausta kaikkia alkuaineita koskevaksi laiksi.']], 'Saman ryhmän tässä taulukossa annetut arvot tukevat rajattua ennustetta. Ominaisuuksien samankaltaisuus ei merkitse identtisyyttä. Olomuoto päätellään annetuista sulamis- ja kiehumispisteistä 20 °C:ssa.') };
}
function phase(r: Rng, change: boolean, family: number): AtomicWorldTask {
    const count = r.int(8, 20), substance = family === 2 && !change ? 'argon' : 'water';
    if (!change) {
        const temperatures = substance === 'water' ? [-r.int(5, 25), r.int(5, 75), r.int(110, 160)] : [-r.int(195, 210), -188, -r.int(150, 180)];
        return { kind, mode: 'phase', activity: family === 1 ? 'construct' : 'interpret', title: family === 1 ? 'Rakenna nimetyn olomuodon mallisalit' : 'Saman aineen kolme mallisalia', chambers: ['solid', 'liquid', 'gas'].map((p, i) => ({ id: String.fromCharCode(65 + i), substance, count, phase: p as 'solid' | 'liquid' | 'gas', temperatureC: family === 1 ? [-10, 20, 120][i]! : temperatures[i]! })) };
    }
    const action = family === 2 ? 'condense' : family === 1 ? 'vaporize' : 'melt', initial = action === 'melt' ? 'solid' : action === 'vaporize' ? 'liquid' : 'gas', before = action === 'melt' ? -r.int(5, 25) : action === 'vaporize' ? r.int(10, 80) : r.int(110, 150), after = action === 'vaporize' ? r.int(110, 150) : r.int(10, 70);
    return { kind, mode: 'phase', activity: 'change', title: action === 'condense' ? 'Tiivistyminen ja säilyvät vesimolekyylit' : action === 'melt' ? 'Jään avautuva järjestys' : 'Veden höyrystymisen ikkuna', chambers: [{ id: 'A', substance: 'water', count, phase: initial, temperatureC: before }], change: action, afterTemperatureC: after,
        review: review('Selitä aikuiselle ennen–aikana–jälkeen-mallin muutos omien havaintojesi avulla.', [['identity', 'Säilyttää vesimolekyylit', 'Tunnistaa samat H2O-osat ennen muutosta, muutoksen aikana ja jälkeen. Ei hajota niitä alkuaineiksi.'], ['motion', 'Yhdistää järjestyksen, liikkeen ja välit', 'Kuvaa juuri toteutetun muutoksen suunnan. Jään avoin rakenne voi tiivistyä sulaessa.'], symbolic], 'Molekyylit ja niiden koko säilyvät. Liike ja keskinäinen järjestys muuttuvat. Jään rakenne on avoimempi kuin nestemäisen veden. Tiivistyminen palauttaa kaasun kaukana olevat molekyylit lähelle toisiaan.') };
}
function structure(r: Rng, family: number, id = 'k'): AtomicStructure {
    const species: readonly [
        string,
        string
    ] = family === 2 ? ['Mg', 'O'] : ['Na', 'Cl'], sites = atomicLatticeSites(r.pick([2, 4]), r.pick([1, 2]), r.pick([2, 3]));
    return { id, label: `${species.join('')}-hilan rajattu ikkuna`, sites, species, rule: 'alternating', intervention: family === 1 ? 'shift' : 'inspect', property: family === 1 ? 'Kerros siirtyy ja samanmerkkiset naapurit torjuvat toisiaan.' : 'Eri merkkiset naapurit vetävät toisiaan puoleensa.', reference: family === 1 ? `Annettu ${species.join('')}-hila. Lähinaapurit vuorottelevat. Kerroksen siirto tuo samanmerkkiset vastakkain ja niiden torjunta auttaa selittämään haurautta. Hila jatkuu reunoilta.` : `Annettu ${species.join('')}-hila. Lähinaapurit vuorottelevat kaikissa kolmessa suunnassa. Erimerkkiset ionit vetävät toisiaan puoleensa. Hila jatkuu reunoilta.` };
}
function modelUse(r: Rng, integration: boolean, family: number): AtomicWorldTask {
    const s = structure(r, family), particle = integration ? { id: 'p', kind: family === 1 ? 'heating' as const : 'diffusion' as const, count: r.int(8, 20), temperatureC: family === 1 ? r.int(15, 25) : 20, afterTemperatureC: family === 1 ? r.int(45, 65) : 20 } : undefined;
    return { kind, mode: 'model-use', title: integration ? 'Kaksi ikkunaa ja kaksi selitystehtävää' : 'Kiteen rakennus ja ominaisuus', structures: [s], ...(particle ? { particle } : {}),
        review: review(integration ? 'Selitä aikuiselle hiukkasikkunan havainto ja rakennemallin ominaisuus erikseen.' : 'Selitä aikuiselle, miten rakentamasi järjestys auttaa selittämään annettua ominaisuutta.', [
            ['structure', 'Käyttää omaa rakennemallia', 'Yhdistää omat osat, toistuvan järjestyksen ja annetun vetovoima- tai kerrossiirtotiedon nimettyyn ominaisuuteen.'],
            ...(integration ? [['particle', 'Käyttää hiukkasmallia', 'Selittää leviämisen tai lämmityksen liikkeen avulla säilyttäen hiukkaslajin ja lukumäärän.'] as const] : []), symbolic
        ], 'Rakennemalli kuvaa annettuja osia ja niiden järjestystä. Hiukkasmalli kuvaa tässä liikettä ja leviämistä. Kummankin käyttöalue on rajattu, eikä yhden mallin onnistuminen tee toisesta tarpeetonta.') };
}
function scale(r: Rng, family: number): AtomicWorldTask {
    const phenomenon = family === 2 ? 'solution' : family === 1 ? 'ice' : 'salt-crystal', n = r.int(2, 10), label = phenomenon === 'solution' ? `${n} g suolaa kirkkaassa vesinäytteessä` : phenomenon === 'ice' ? `${n} cm jääpala` : `${n} mm suolakide`;
    return { kind, mode: 'scale', title: 'Saman ilmiön kolme erillistä ikkunaa', phenomenon, cards: [
            { id: 'C', level: 'particle', source: 'model', label: phenomenon === 'solution' ? 'Vesi ja erilliset suolaionit mallissa' : 'Saman aineen rakenneosat hiukkasmallissa', phenomenon },
            { id: 'A', level: 'macro', source: 'observation', label, phenomenon },
            { id: 'B', level: 'structure', source: family === 0 ? 'observation' : 'model', label: family === 0 ? 'Suurennettu kiteen ulkopinnan porras havaintokuvassa' : phenomenon === 'ice' ? 'Jään avoimen järjestyksen rakennemalli' : 'Liuoksen koostumuksen mallikaavio', phenomenon }
        ],
        review: review('Perustele aikuiselle, miten ikkunat koskevat samaa ilmiötä ja missä havainto vaihtuu selitysmalliksi.', [['link', 'Yhdistää saman aineen esitykset', 'Kytkee makrohavainnon ja hiukkastason kuvauksen. Kirkas liuos ei tarkoita suolan kadonneen.'], ['boundary', 'Erottaa mallin havainnosta', 'Tunnistaa nimetyn havainto–malli-rajan. Atomin malli ei synny tavallista kameraa vain zoomaamalla.']], 'Kuvat on nimetty eri tiedonlähteiden esityksiksi. Havaittava pinta ja laskennallinen rakenne eivät ole sama asia. Hiukkasmalli selittää makrohavaintoa, mutta ei ole sen tavallinen suurennos.') };
}
function instruction(task: AtomicWorldTask): string {
    switch (task.mode) {
        case 'atom': return task.activity === 'link' ? 'Yhdistä näyte sen atomilajiin ja laske mallin kaikki atomit. Rajaa makronäytteen ominaisuus.' : task.activity === 'regions' ? 'Nimeä mallin kaksi aluetta ja arvioi mittasuhteen kirjaimellisyys. Vertaa erilliset ikkunat, jos niitä on kaksi.' : task.activity === 'number' ? 'Tuota kunkin ytimen protoniluku ja sitä vastaava alkuaine annetun kartan avulla.' : 'Tuota pyydetty hiukkanen, sen varaus ja sijaintialue.';
        case 'sample': return 'Luokittele jokainen näyte. Tuota atomilajien määrä ja kuvattujen rakenneyksiköiden lukumäärä. Sama alkuaine voi esiintyä myös molekyyleinä.';
        case 'build': return task.structure === 'molecule' ? 'Valitse itse atomit ja rakenna niiden sidokset annetun koostumuksen ja sidontamäärien mukaan. Perustele mallin käyttö aikuiselle.' : 'Täytä itse jatkuvan ionihilan paikat annetulla toistosäännöllä ja perustele, mitä malli kuvaa.';
        case 'periodic': return task.activity === 'order' ? 'Rakenna annettujen alkuaineiden järjestys kasvavan järjestysluvun mukaan.' : task.activity === 'fill' ? 'Etsi nimeämätön alkuaine annetun järjestysluvun avulla.' : task.activity === 'inverse' ? 'Tuota annetun ryhmän ja jakson alkuaine sekä molemmat osoiteluvut.' : 'Etsi nimetyn alkuaineen ryhmä ja jakso. Ryhmä on pystysarake, jakso vaakarivi.';
        case 'property': return 'Tuota rajattu ennuste ja lukitse se ennen kohteen havaintoa. Avaa havainto ja perustele ennuste aikuiselle annetulla aineistolla.';
        case 'phase': return task.activity === 'construct' ? 'Rakenna nimetyille olomuodoille sopivat hiukkasvälit ja liike. Oma mallisi näkyy salissa.' : task.activity === 'change' ? 'Tulkitse alkutila. Lukitse oma ennuste, suorita muutos ennen–aikana–jälkeen ja kuvaa säilyvät rakenneosat aikuiselle.' : 'Yhdistä kunkin salin olomuoto, liike ja suhteelliset välit. Hiukkasen oma koko ei muutu.';
        case 'model-use': return task.particle ? 'Rakenna hilan järjestys ja käytä myös liikkuvaa hiukkasikkunaa. Kumpikin selitys ja mallirajaus arvioidaan omana tuotoksena.' : 'Täydennä hilan oma rakenne. Käytä annettua rakennetietoa ominaisuuden selittämiseen aikuiselle.';
        case 'scale': return 'Järjestä kolme ikkunaa makrotasolta hiukkastasolle. Yhdistä sama ilmiö ja merkitse ensimmäinen mallikuva. Perustele havainto–malli-raja aikuiselle.';
    }
}
function item(factory: Factory, r: Rng): Draft { const task = factory(r); return { task, scene: atomicWorldPaint(task), sceneModel: atomicWorldScene(task), say: instruction(task), hint: 'Sulan kohdistusapu. Käytä juuri tämän ikkunan annettuja osia ja selitettä. Laske ennen nimeämistä. Avaa mallin havainto vasta oman ennusteen jälkeen.', explain: 'Tarkista määrä, rakenne ja tiedon lähde erikseen. Mallin symbolit ja mittasuhteet on rajattu näkyvään selitteeseen.' }; }
function spec(id: string, stop: string, intro: string, goal: string, reward: string, a: readonly [
    string,
    Factory
], b: readonly [
    string,
    Factory
], transfer: Factory): NodeSpec {
    const rev = `atomic-world-${id.toLowerCase()}-v1`;
    return { id, stop, icon: '◌', intro, goal, reward, rev, validRevs: [rev], produce: [a[0], b[0]], produceWhat: 'oma määrä-, rakenne- tai taulukkotuotos ja tavoitteen edellyttämä havaittu oma selitys',
        demo: r => { const task = a[1](r); return [{ scene: atomicWorldPaint(task), sceneModel: atomicWorldScene(task), say: goal }, { scene: atomicWorldWorkedPaint(task), say: 'Aava näyttää tämän rajatun mallin yhden mahdollisen ratkaisun. Oman selityksen arvioi aikuinen erikseen.' }]; },
        item: cases({ [a[0]]: r => item(a[1], r), [b[0]]: r => item(b[1], r) }, r => item(transfer, r)) };
}
export const atomicWorldSpecs: NodeSpec[] = [
    spec('CHEM79-ATOM-01', 'Näytteen rakenneosan jäljillä', 'Aava avaa näytteen viereen nimetyn atomimallin.', 'Yhdistä alkuaine sen atomeihin ja erota näyte yksittäisestä atomista.', 'Näytteen ja atomimallin yhteysviiva syttyy.', ['single-atom-units', r => atomTask(r, 'link', 0)], ['atoms-within-molecules', r => atomTask(r, 'link', 1)], r => atomTask(r, 'link', 2)),
    spec('CHEM79-ATOM-NUCLEUS', 'Keskus ja elektroniverho', 'Loikka tarkastelee erikseen suurennettua atomi-ikkunaa.', 'Erota ydin, elektroniverho ja mallin mittakaavarajaus.', 'Atomi-ikkuna saa nimetyt alueet.', ['locate-regions', r => atomTask(r, 'regions', 0)], ['compare-enlargements', r => atomTask(r, 'regions', 1)], r => atomTask(r, 'regions', 2)),
    spec('CHEM79-ATOMICNUM', 'Alkuaineen henkilöllisyyskortti', 'Nimetön ydin odottaa tunnustaan gallerian kartalla.', 'Laske protonit ja tuota järjestysluku sekä alkuaine.', 'Kadonnut nimi palautuu näytteen vitriiniin.', ['count-protons', r => atomTask(r, 'number', 0)], ['compare-isotopes', r => atomTask(r, 'number', 1)], r => atomTask(r, 'number', 2)),
    spec('CHEM79-COMP-MODEL', 'Rakenteen yhteinen sääntö', 'Aava avaa atomipankin ja jatkuvan hilan työpöydän.', 'Rakenna yhdisteen koostumus ja yhteydet itse.', 'Yhdisteholvin rakenneikkuna valmistuu.', ['molecule-bond-building', r => build(r, 0)], ['ionic-window-building', r => build(r, 1)], r => build(r, 2)),
    spec('CHEM79-COMPOUND', 'Yhteinen aine, eri atomilajit', 'Loikka sekoittaa toisiinsa sitoutumisen ja samassa astiassa olemisen.', 'Erota puhdas yhdiste alkuaineesta ja seoksesta.', 'Näytteiden koostumustunnukset löytävät paikkansa.', ['molecular-compound-vs-mixture', r => samples(r, 'compound', 0)], ['homonuclear-boundary', r => samples(r, 'compound', 1)], r => samples(r, 'compound', 2)),
    ...(['PROTON', 'ELECTRON', 'NEUTRON'] as const).map((suffix) => { const particle = suffix.toLowerCase() as 'proton' | 'electron' | 'neutron'; return spec(`CHEM79-${suffix}`, suffix === 'PROTON' ? 'Ytimen plusmerkki' : suffix === 'ELECTRON' ? 'Elektroniverhon miinusmerkki' : 'Ytimen hiljainen merkki', 'Sulan hiukkaskortti odottaa omia merkintöjä.', 'Yhdistä hiukkanen sen varaukseen ja sijaintiin.', 'Hiukkaskortin merkinnät asettuvat malliin.', ['name-to-properties', r => atomTask(r, 'particle', 0, particle)], ['properties-to-particle', r => atomTask(r, 'particle', 1, particle)], r => atomTask(r, 'particle', 2, particle)); }),
    spec('CHEM79-ELEM-PROP', 'Kartta, joka vihjaa ominaisuuksista', 'Sulka antaa rajatun ominaisuusaineiston tutkittavaksi.', 'Tee saman ryhmän aineistoon perustuva ennuste ja rajaa se.', 'Ominaisuusikkuna avautuu ennusteen rinnalle.', ['group1-melting', r => property(r, 0)], ['group18-boiling', r => property(r, 1)], r => property(r, 2)),
    spec('CHEM79-ELEMENT', 'Yhden atomilajin tunnus', 'Aava tutkii näytteitä aineiden luokittelun tai atomimallin kautta.', 'Tunnista yksi atomilaji myös kaksiatomisessa alkuaineessa.', 'Yhden atomilajin vitriini saa tunnuksensa.', ['pure-atomic-samples', r => samples(r, 'element', 0)], ['homonuclear-molecules', r => samples(r, 'element', 1)], r => samples(r, 'element', 2)),
    spec('CHEM79-PERIODIC-01', 'Alkuaineiden suuri kartta', 'Gallerian numerokortit odottavat järjestämistä.', 'Järjestä alkuaineet järjestysluvun avulla.', 'Alkuaineiden kartta löytää järjestyksensä.', ['order-element-cards', r => periodic(r, 'order', 0)], ['identify-from-number', r => periodic(r, 'order', 1)], r => periodic(r, 'order', 2)),
    spec('CHEM79-PERIOD-GROUP', 'Vaakarivi ja pystyperhe', 'Loikka etsii ryhmää vaakasuunnassa.', 'Tuota alkuaineen oikea ryhmä ja jakso.', 'Kartalle avautuu oikeansuuntainen kohdistus.', ['element-to-address', r => periodic(r, 'location', 0)], ['address-to-element', r => periodic(r, 'location', 1)], r => periodic(r, 'location', 2)),
    spec('CHEM79-MODEL-01', 'Kahden ikkunan galleria', 'Sama tutkimusgalleria tarvitsee kahta erilaista mallia.', 'Käytä hiukkas- ja rakennemallia erikseen ja rajaa niiden esitys.', 'Kaksi selitysikkunaa avautuu rinnakkain.', ['diffusion-and-structure', r => modelUse(r, true, 0)], ['heating-and-layer', r => modelUse(r, true, 1)], r => modelUse(r, true, 2)),
    spec('CHEM79-STRUCTURE-MODEL-USE', 'Kiteen rakentumisen kuvio', 'Aava tutkii kiteen pinnan alle kätkeytyvää järjestystä.', 'Rakenna järjestys ja selitä annettu ominaisuus mallin rajoissa.', 'Kidegalleriaan avautuu läpinäkyvä rakenneikkuna.', ['attraction-order', r => modelUse(r, false, 0)], ['shift-and-brittleness', r => modelUse(r, false, 1)], r => modelUse(r, false, 2)),
    spec('CHEM79-STATE-01', 'Kolme salia samalle aineelle', 'Loikka etsii liikettä myös kiinteästä näytteestä.', 'Yhdistä olomuoto järjestykseen, liikkeeseen ja suhteellisiin väleihin.', 'Kolme mallisalia saa oikeat tunnuksensa.', ['temperature-to-state', r => phase(r, false, 0)], ['motion-to-state', r => phase(r, false, 1)], r => phase(r, false, 2)),
    spec('CHEM79-STATECHANGE', 'Jään avautuva järjestys', 'Sulan tutkimusikkunassa jää voi muuttua veden molekyylejä hajottamatta.', 'Selitä olomuodon muutos samojen hiukkasten avulla.', 'Jääikkuna muuttuu liikkuvaksi vesipeiliksi.', ['ice-melting', r => phase(r, true, 0)], ['water-vaporizing', r => phase(r, true, 1)], r => phase(r, true, 2)),
    spec('CHEM79-SCALE', 'Kallion pinnasta hiukkasikkunaan', 'Sulka pitää havainnon ja selitysmallin rajat näkyvissä.', 'Yhdistä saman ilmiön makro-, rakenne- ja hiukkastaso.', 'Gallerian selityspolku yhdistää ikkunat.', ['observed-surface-to-model', r => scale(r, 0)], ['model-boundary-at-structure', r => scale(r, 1)], r => scale(r, 2)),
];
export const atomicWorldEvidence: Readonly<Record<string, {
    families: readonly string[];
    limit: string;
}>> = Object.fromEntries(atomicWorldSpecs.map(s => [s.id, { families: s.produce ?? [], limit: ['CHEM79-COMP-MODEL', 'CHEM79-MODEL-01', 'CHEM79-STRUCTURE-MODEL-USE', 'CHEM79-STATECHANGE', 'CHEM79-SCALE', 'CHEM79-ELEM-PROP'].includes(s.id) ? 'Omat määrät, sidokset, järjestys tai ennuste tarkistetaan rajatusta mallista. Oma kausaalinen selitys ja mallin rajaus edellyttävät aikuisen havaintoa ja erillistä avun merkintää. Valmis malliselitys ei ole oppijan oma puhe. Ei oikean aineen käsittelynäyttöä.' : 'Näyttö koskee annettujen kaavamaisten mallien tai nimetyn taulukon tulkintaa ja omaa kohdistettua lukumäärä- tai osoitetuotosta. Mallin kuvan lukeminen ei osoita kaikkien todellisten aineiden rakennetta tai kokeellista tunnistamista.' }]));
