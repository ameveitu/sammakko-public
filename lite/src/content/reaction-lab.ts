import type { Rng } from '../engine/rng';
import type { Item, NodeSpec } from '../engine/types';
import { cases } from './kit';
import { reactionLabPaint, reactionLabWorkedPaint, reactionLabScene } from './scenes/reaction-lab';
import { reactionRecipe, reactionRateReading, type ReactionLabTask, type ReactionReview, type ReactionCase, type ReactionEvidenceSubstance, type ReactionRateTask, type ReactionConfiguration, type ReactionFactor } from './models/reaction-lab';
type Factory = (r: Rng) => ReactionLabTask;
const kind = 'reaction-lab' as const;
function review(prompt: string, model: string, causal = 'Yhdistää oman tuotoksen annettuun havaintoon ja perustelee päätelmän.'): ReactionReview {
    return { prompt, rubric: [{ id: 'evidence', label: 'Käyttää omaa havaintoa tai rakennetta', guide: causal }, { id: 'limit', label: 'Rajaa päätelmän tähän aineistoon', guide: 'Rajaa tuloksen annettuun malliin. Erottaa virtuaalikokeen oikeasta aineenkäsittelystä.' }], model };
}
const substance = (id: string, formula: string, name: string, phase: ReactionEvidenceSubstance['phase'], groups = 1): ReactionEvidenceSubstance => ({ id, formula, name, phase, groups });
function physicalCase(type: number, n: number): ReactionCase {
    const options = [['H2O', 'vesi', 'solid', 'liquid', 'Jää muuttuu vedeksi.', 'melt'], ['H2O', 'vesi', 'liquid', 'gas', 'Vesi kiehuu ja muodostaa kuplia.', 'gas-release'], ['C12H22O11', 'sakkaroosi', 'solid', 'aqueous', 'Sokerikiteet liukenevat veteen.', 'dissolve'], ['C6H12O6', 'glukoosi', 'solid', 'aqueous', 'Glukoosi liukenee veteen.', 'dissolve'], ['C2H6O', 'etanoli', 'liquid', 'gas', 'Etanolin annettu höyrystymistallenne.', 'gas-release'], ['C', 'grafiitti', 'solid', 'solid', 'Grafiittipala murskautuu.', 'melt'], ['Fe', 'rauta', 'solid', 'solid', 'Rautapala taipuu.', 'melt'], ['Al', 'alumiini', 'solid', 'liquid', 'Alumiinin annettu sulamistallenne.', 'melt']] as const;
    const [formula, name, beforePhase, afterPhase, observation, illustration] = options[type % options.length]!;
    const solvent = illustration === 'dissolve' ? [substance('solvent', 'H2O', 'vesi', 'liquid', 2 * n)] : [];
    return { id: 'A', name: observation, before: [substance('same', formula, name, beforePhase, n), ...solvent], after: [substance('same', formula, name, afterPhase, n), ...solvent], observation, evidence: `Annettu tunnistustutkimus osoittaa saman ${name}-aineen ennen ja jälkeen. ${n} yhtä suurta malliosuutta säilyy.`, identityEvidence: 'verified', illustration };
}
function chemicalCase(recipeId: string, n: number, id = 'B'): ReactionCase {
    const recipe = reactionRecipe(recipeId)!;
    return { id, name: recipe.name, before: recipe.reactants.map((s, i) => substance(`r${i}`, s.formula, s.name, s.phase, s.coefficient * n)), after: recipe.products.map((s, i) => substance(`p${i}`, s.formula, s.name, s.phase, s.coefficient * n)), observation: recipeId === 'carbonate' || recipeId === 'peroxide' ? 'Tallenteessa näkyy kaasukuplia.' : recipeId === 'magnesium' ? 'Annetussa tallenteessa näkyy valo ja uusi kiinteä näyte.' : 'Annettu tallenne näyttää muutoksen.', evidence: 'Erillinen aineiden tunnistustutkimus on varmistanut ennen- ja jälkeen-korttien aineet. Nimet kuvaavat aineen identiteettiä, eivät pelkkää ulkonäköä.', identityEvidence: 'verified', illustration: recipeId === 'magnesium' ? 'burn' : 'gas-release' };
}
function change(r: Rng, family: number, skill: 'physical' | 'new-substance' | 'burn'): ReactionLabTask {
    const n = r.int(1, 4), variant = r.int(0, 7);
    let examples: ReactionCase[];
    if (skill === 'burn') {
        const c = chemicalCase(family === 0 ? 'cellulose' : family === 1 ? r.pick(['carbon', 'ethanol', 'methane']) : 'magnesium', n, 'A');
        if (family === 0) {
            const ash = r.int(1, 3);
            c.before = [...c.before, substance('ash', 'SiO2', 'muuttumaton mineraaliosa', 'solid', ash)];
            c.after = [...c.after, substance('ash', 'SiO2', 'mineraalinen tuhka', 'solid', ash)];
            c.evidence += ' Puun kuiva selluloosaosa on rajattu malli. Mineraaliosa jää tuhkaksi, kaasut ovat mukana koko ainevirrassa.';
        }
        examples = [c];
    }
    else if (family === 0) {
        examples = [physicalCase(variant, n), chemicalCase(r.pick(['peroxide', 'water-form', 'carbonate', 'magnesium']), r.int(1, 4))];
    }
    else if (family === 1) {
        const uncertain = physicalCase(variant, n);
        uncertain.id = 'B';
        uncertain.after = [];
        uncertain.identityEvidence = 'appearance-only';
        uncertain.evidence = 'Saatavissa on vain ulkonäköhavainto. Jälkeen-näytteen aineen identiteettiä ei ole tutkittu.';
        examples = [chemicalCase(r.pick(['carbon', 'water-split', 'ethanol', 'carbonate']), n, 'A'), uncertain];
    }
    else {
        examples = [physicalCase(skill === 'new-substance' ? 1 : 3, n), chemicalCase(r.pick(['peroxide', 'methane', 'water-split']), r.int(1, 4))];
    }
    return finish({ kind, mode: skill === 'physical' ? 'change' : 'reaction', skill, title: skill === 'burn' ? 'Aavan turvallinen palamisen muistikuva' : family === 1 ? 'Mitä havainto todella todistaa?' : 'Sama aine vai uusia aineita?', run: '', cases: examples, review: review('Selitä aikuiselle, mitä annettu aineisto osoittaa muutoksesta.', skill === 'burn' ? 'Palaminen muuttaa lähtöaineita uusiksi aineiksi. Tuhka ei sisällä kaikkia tuotteita, koska myös kaasut kuuluvat ainevirtaan.' : 'Uusi aine tunnistetaan aineen ominaisuuksista tai koostumuksesta. Ulkonäköhavainto voi sopia sekä fysikaaliseen että kemialliseen muutokseen.') });
}
function roles(r: Rng, family: number): ReactionLabTask {
    const pool = family === 2 ? ['methane', 'ethanol', 'magnesium'] : ['peroxide', 'carbon', 'carbonate', 'water-form', 'water-split', 'methane', 'magnesium', 'ethanol'];
    return finish({ kind, mode: 'roles', title: family === 1 ? 'Sama vesi kahdessa eri roolissa' : 'Ainekortit reaktion kummallekin puolelle', run: '', cases: family === 1 ? [{ id: 'A', recipe: 'water-form', presentation: 'before-after' }, { id: 'B', recipe: 'water-split', presentation: 'before-after' }] : [{ id: 'A', recipe: r.pick(pool), presentation: family === 2 ? 'written' : 'formula' }], review: review('Perustele aikuiselle jokaisen aineen rooli tämän reaktion suunnasta.', 'Lähtöaineet ovat annetun muutoksen alussa ja tuotteet lopussa. Vesi voi olla toisen reaktion tuote ja toisen lähtöaine.') });
}
function conservation(r: Rng, family: number): ReactionLabTask {
    const recipe = family === 1 ? 'water-form' : family === 2 ? r.pick(['carbonate', 'peroxide']) : 'carbonate', groups = r.int(1, 4), gas = reactionRecipe(recipe)!.products.find(s => s.phase === 'gas')?.formula ?? null;
    return finish({ kind, mode: 'conservation', title: family === 2 ? 'Kaasu siirtyy näkyvän rajan yli' : 'Kaksi astiaa, yksi suljettu ainekirja', run: '', recipe, groups, massScaleMg: r.int(1, 4), outsideInitialGroups: gas ? r.int(0, 2) : 0, boundary: { open: family === 2, gasFormula: gas, escapedGroups: family === 2 ? r.int(1, groups) : 0 }, review: review('Selitä aikuiselle osien ja koko järjestelmän massat oman havaintosi avulla.', 'Aine ei häviä. Reaktiokammio ja keräysastia muodostavat yhdessä suljetun kokonaisuuden. Kaasun siirtyminen pienentää vain lähettävän osan massaa.') });
}
function rearrange(r: Rng, family: number): ReactionLabTask {
    return finish({ kind, mode: 'rearrange', title: 'Samojen atomien uusi järjestys', run: '', recipe: family === 2 ? 'methane' : family === 1 ? r.pick(['peroxide', 'water-split']) : r.pick(['water-form', 'carbon']), groups: r.int(1, 2), massScaleMg: 1, review: review('Esittele aikuiselle oma atomien uudelleenjärjestely.', 'Jokainen alkuperäinen atomitunnus käytetään kerran. Tuotteiden molekyylit ovat uusia ryhmiä, mutta kunkin alkuaineen atomit säilyvät. Sidokset kuvaavat annettua topologiaa.') });
}
function energy(r: Rng, family: number, skill: 'transfer' | 'exoendo'): ReactionLabTask {
    const recipes = family === 1 ? [r.pick(['carbon', 'water-form', 'peroxide']), r.pick(['carbonate', 'water-split'])] : [r.pick(family === 2 ? ['methane', 'ethanol', 'water-split'] : ['carbon', 'carbonate', 'water-form', 'peroxide'])];
    return finish({ kind, mode: 'energy', skill, title: family === 1 ? 'Käynnistyksen laina ja lopullinen energiatili' : 'Energiavirta kammion ja ympäristön välillä', run: '', cases: recipes.map((recipe, i) => ({ id: String.fromCharCode(65 + i), recipe, extents: r.int(1, 4), systemBefore: 800, surroundingsBefore: 800, presentation: family === 2 ? 'ledger' : family === 1 ? 'activation-profile' : 'flow', light: family === 0 && recipe === 'carbon' })), review: review('Perustele aikuiselle energian suunta ja erota käynnistyminen nettomuutoksesta.', 'Käynnistykseen lainattu energia palautetaan mallin lopussa. Eksotermisen kokonaisuuden energia vähenee ja ympäristön kasvaa. Endotermisen kokonaisuuden suunta on päinvastainen.') });
}
function rate(r: Rng, family: number, skill: ReactionRateTask['skill']): ReactionLabTask {
    const w = r.int(3, 6), h = r.int(3, 6), d = r.int(3, 6), groups = r.int(4, 8), massScaleMg = r.int(1, 3), minimum = Math.min(w, h, d), duration = skill==='compare'?r.pick([10,15,20]):20, start = skill==='compare'&&family===1?5:0;
    const shape = { width: w, height: h, depth: d, cuts: [1, 1, 1] as const };
    const model: ReactionRateTask['model'] = { name: 'Annettu tasaisesti vetäytyvän pinnan opetusmalli', recipe: family === 2 ? 'magnesium' : 'carbon', product: family === 2 ? 'MgO' : 'CO2', secondsMaximum: 40, baseRate: [minimum, 200], temperatures: [{ value: 20, factor: [1, 1] }, { value: 30, factor: [2, 1] }, { value: 40, factor: [3, 1] }, { value: 50, factor: [4, 1] }], concentrations: [{ value: 8, factor: [1, 1] }, { value: 16, factor: [2, 1] }, { value: 24, factor: [3, 1] }, { value: 32, factor: [4, 1] }], referenceArea: 2 * (w * h + w * d + h * d), referenceShape: [w, h, d], volumes: [10, 20], concentrationSpecies: 'O2', scope: 'Vain annetut aineet, lämpötilat ja pitoisuudet. Palat ovat erillään ja kaikki uudet pinnat koskettavat mallikaasua. Pinta vetäytyy tässä mallissa samalla normaalinopeudella joka palasta. Taulukon lämpötila- ja pitoisuuskertoimet ovat annettuja opetusoletuksia, eivät yleinen reaktiolaki.' };
    const a: ReactionConfiguration = { temperatureC: 20, concentration: 8, shape, volumeUnits: 10, extentLimit: groups };
    const factor: ReactionFactor = skill === 'factor' ? (family === 2 ? 'surface' : r.pick(['temperature', 'concentration'])) : skill === 'compare' ? 'temperature' : skill;
    const cuts: readonly (readonly [
        number,
        number,
        number
    ])[] = [[1, 1, 1], [2, 2, 2], [3, 3, 3], [2, 3, 2]];
    let b: ReactionConfiguration = { ...a, shape: { ...shape } };
    if (skill === 'compare') {
        b = { ...b, temperatureC: 30, ...(family === 2 ? { extentLimit: Math.max(2, groups - 2) } : {}) };
    }
    else if (family === 1) {
        b = { ...b, temperatureC: 30, concentration: 16 };
        if (factor === 'surface')
            b.shape = { ...shape, cuts: [2, 2, 2] };
    }
    const dataOnly = skill === 'compare', activity = dataOnly ? (family === 1 ? 'produce-window' : 'compare-data') : family === 1 ? 'repair-confound' : family === 2 ? 'transfer' : skill === 'factor' ? 'plan' : 'control';
    const task: ReactionRateTask & {
        kind: 'reaction-lab';
        run: string;
        title: string;
        review?: ReactionReview;
    } = { kind, mode: 'rate', skill, activity, run: '', title: dataOnly ? 'Tuotteen määrän muutos samalla aikavälillä' : family === 1 ? 'Korjaa sekoittunut vertailukoe' : 'Oma yhden tekijän vertailukoe', model, initial: [a, b], allowedFactors: skill === 'factor' && family !== 2 ? ['temperature', 'concentration'] : [factor], interval: [start, start + duration], cutOptions: cuts, massScaleMg, question: family === 2 && skill === 'compare' ? 'Vertaa ensin annetun aikavälin nopeuksia. Mallin lopulliset enimmäistuotemäärät ovat eri suuret, joten nopein ei tarkoita suurinta loppusaantoa.' : 'Muuta vain nimettyä tekijää. Säilytä sama kiinteän lähtöaineen alkumäärä, kammion tilavuus ja muut asetukset. Laske havaintovälin nopeudet.', review: review('Perustele aikuiselle oman vertailusi tulos, kontrollit ja päätelmän rajaus.', 'Nopeus on tuotemäärän muutos jaettuna samalla ajan muutoksella. Yhden tekijän syyvertailussa muut olosuhteet pidetään samoina. Päätelmä koskee annettua mallia ja havaintoväliä.', 'Käyttää molempien kokeiden omia lukemia ja samaa aikaväliä. Kontrollitehtävässä nimeää myös muuttuneen ja vakiona pidetyt tekijät.') };
    const causal:Record<typeof skill,string>={
        compare:'Käyttää oman aikavälin määrän muutosta ja kestoa. Erottaa lasketun nopeuden annetusta lopullisesta saannosta.',
        factor:'Nimeää vain yhden muuttuneen tekijän ja muut vakiot. Perustaa rajatun päätelmän molempien kokeiden lukemiin.',
        temperature:'Yhdistää nopeuseron annettuun lämpötilakertoimeen ja omiin lukemiin. Pitoisuus, palakoko, tilavuus ja kiinteä alku pysyvät samoina.',
        concentration:'Yhdistää nopeuseron O2-ryhmien tiheyteen ja annettuun kohtaamismalliin. Sama tilavuus, lämpötila, palakoko ja kiinteä alku säilyvät.',
        surface:'Yhdistää erillisten palojen uudet kaasukosketuspinnat omiin nopeuslukemiin. Kiinteän aineen alkuvolyymi ja määrä sekä muut koeasetukset säilyvät.'
    };
    task.review!.rubric=[{id:'evidence',label:'Yhdistää havainnon ja vertailun perusteen',guide:causal[skill]},task.review!.rubric[1]!];
    if (dataOnly)
        task.givenReadings = ['A', 'B'].flatMap((trial, i) => [start, start + duration].map(t => reactionRateReading(model, task.initial[i]!, trial, t, massScaleMg)!));
    return finish(task);
}
function finish<T extends ReactionLabTask>(task: T): T {
    const { run: _run, title: _title, review: _review, ...scientific } = task;
    const text = JSON.stringify(scientific);
    let hash = 2166136261;
    for (const c of text) {
        hash ^= c.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return { ...task, run: `reaction-${(hash >>> 0).toString(16)}` };
}
export function reactionInstruction(task: ReactionLabTask): string {
    switch (task.mode) {
        case 'change':
        case 'reaction': return 'Luokittele näytteiden muutos tunnistustiedon avulla. Merkitse uudet aineet ja perustele aikuiselle.';
        case 'roles': return 'Sijoita ainekortit alkuun tai loppuun ja perustele niiden roolit aikuiselle.';
        case 'conservation': return 'Lukitse ennuste, suorita muutos ja tuota osien sekä koko järjestelmän massat. Perustele aikuiselle.';
        case 'rearrange': return 'Rakenna tuotteet samoista atomeista ja niiden sidoksista. Täytä atomitili ja perustele aikuiselle.';
        case 'energy': return 'Tuota etumerkilliset energiamuutokset, käynnistysenergia, suunta ja kokonaisuuden nimi. Perustele aikuiselle.';
        case 'rate': return task.skill === 'compare' ? 'Laske kummankin kokeen nopeus samalla aikavälillä. Vertaa loppusaannot erikseen ja perustele aikuiselle.' : 'Rakenna hallittu vertailu. Lukitse ennuste, mittaa, laske nopeudet ja selitä aikuiselle.';
    }
}
type Draft = Omit<Item, 'tag'> & {
    sceneModel?: ReturnType<typeof reactionLabScene>;
};
function draft(factory: Factory, r: Rng): Draft { const task = factory(r); return { task, scene: reactionLabPaint(task), sceneModel: reactionLabScene(task), say: reactionInstruction(task), hint: 'Sulan kohdistusapu. Rajaa ensin järjestelmä. Vertaa juuri annettuja aineita, samaa aikaväliä ja oman kokeen todellisia lukemia. Muuta syyvertailussa yhtä tekijää.', explain: 'Tarkista aineiden identiteetti, samojen atomien tilit tai havaittu muutos erikseen. Suljetun kokonaisuuden massa säilyy myös kaasun ollessa erillisessä astiassa. Mallin opetuskertoimet eivät kuvaa kaikkia oikeita reaktioita.' }; }
function spec(id: string, stop: string, intro: string, goal: string, reward: string, a: readonly [
    string,
    Factory
], b: readonly [
    string,
    Factory
], transfer: Factory): NodeSpec {
    const rev = `reaction-lab-${id.toLowerCase()}-v1`;
    return { id, stop, icon: '◈', intro, goal, reward, rev, validRevs: [rev], produce: [a[0], b[0]], produceWhat: 'oma aine-, rakenne-, energia- tai kokeen laskutuotos sekä aikuisen havaitsema oma rajattu perustelu', demo: r => { const task = a[1](r); return [{ scene: reactionLabPaint(task), sceneModel: reactionLabScene(task), say: goal }, { scene: reactionLabWorkedPaint(task), say: 'Aava näyttää yhden tämän mallin ratkaisun. Se on malliselitys. Oma perustelusi arvioidaan erikseen.' }]; }, item: cases({ [a[0]]: r => draft(a[1], r), [b[0]]: r => draft(b[1], r) }, r => draft(transfer, r)) };
}
export const reactionLabSpecs: NodeSpec[] = [
    spec('ENV-CHEM-BURN-01', 'Palamisen muistokuva', 'Aava avaa valmiin puun palamisen tallenteen.', 'Tunnista palaminen aineiden muutokseksi ja huomioi myös kaasut.', 'Tuhka ja ilmaan kulkevat tuotteet löytävät yhteisen ainevirran.', ['wood-and-ash', r => change(r, 0, 'burn')], ['other-fuel-record', r => change(r, 1, 'burn')], r => change(r, 2, 'burn')),
    spec('CHEM79-CHANGE-PHYS', 'Sama aine toisessa asussa', 'Loikka arvelee jokaisen kuplan olevan uusi aine.', 'Erota fysikaalinen ja kemiallinen muutos havaintojen avulla.', 'Näyteikkunat saavat aineiston mukaiset tulkinnat.', ['verified-contrast', r => change(r, 0, 'physical')], ['evidence-insufficient', r => change(r, 1, 'physical')], r => change(r, 2, 'physical')),
    spec('CHEM79-REACTION-01', 'Uuden aineen jäljillä', 'Sulka tuo ulkonäköhavainnon rinnalle aineiden tunnistuskortit.', 'Tunnista uuden aineen synty ja huomaa, ettei pelkkä ulkonäkö riitä todisteeksi.', 'Kidepajan päätelmä erottaa havainnon selityksestä.', ['new-identity', r => change(r, 0, 'new-substance')], ['unverified-appearance', r => change(r, 1, 'new-substance')], r => change(r, 2, 'new-substance')),
    spec('CHEM79-REACT-PROD', 'Ainekorttien kaksi rantaa', 'Aavan ainekortit odottavat paikkaansa muutoksen suunnassa.', 'Tuota reaktion lähtöaineet ja tuotteet.', 'Alku ja loppu yhdistyvät nimetyn reaktion poluksi.', ['one-reaction-roles', r => roles(r, 0)], ['same-water-reversed-role', r => roles(r, 1)], r => roles(r, 2)),
    spec('CHEM79-MATTER-CONS', 'Kammion yhteinen ainekirja', 'Kaasu voi siirtyä astiasta toiseen, mutta se ei katoa järjestelmästä.', 'Tuota osien ja koko järjestelmän massat oman virtuaalikokeen jälkeen.', 'Kahden astian yhteinen massamosaiikki säilyy.', ['solid-to-gas-ledger', r => conservation(r, 0)], ['gas-to-liquid-ledger', r => conservation(r, 1)], r => conservation(r, 2)),
    spec('CHEM79-REACTION-MODEL', 'Samojen atomien uusi järjestys', 'Aava avaa alkuperäisillä tunnuksilla merkityn atomipankin.', 'Rakenna annettujen tuotteiden ryhmät ja sidokset samoista atomeista.', 'Alkuperäiset atomivalot asettuvat uusiin ryhmiin.', ['join-molecules', r => rearrange(r, 0)], ['split-molecules', r => rearrange(r, 1)], r => rearrange(r, 2)),
    spec('CHEM79-REACTION-ENERGY', 'Energian kaksi tiliä', 'Loikka huomaa aloitusenergian ja arvaa kokonaismuutoksen liian nopeasti.', 'Tuota energian nettosuunta ja erota käynnistysenergia.', 'Kammion ja ympäristön energiatilit asettuvat tasapainoon.', ['energy-flow', r => energy(r, 0, 'transfer')], ['activation-versus-net', r => energy(r, 1, 'transfer')], r => energy(r, 2, 'transfer')),
    spec('CHEM79-EXOENDO', 'Sisään vai ympäristöön', 'Sulan energiakortit nimeävät virtauksen suhteessa järjestelmään.', 'Nimeä eksoterminen ja endoterminen muutos annetusta energiatiedosta.', 'Energiaportti saa oikean suunnan ja nimen.', ['flow-to-name', r => energy(r, 0, 'exoendo')], ['activation-boundary', r => energy(r, 1, 'exoendo')], r => energy(r, 2, 'exoendo')),
    spec('CHEM79-RATE-01', 'Muutoksen tahti', 'Aava vertaa kahden kammion tuotemääriä eri hetkinä.', 'Tuota määrän muutos ja nopeus samalla havaintovälillä.', 'Kammioiden tahdit erottuvat lopputuloksesta.', ['zero-start-window', r => rate(r, 0, 'compare')], ['nonzero-start-window', r => rate(r, 1, 'compare')], r => rate(r, 2, 'compare')),
    ...(['factor', 'temperature', 'concentration', 'surface'] as const).map((skill) => {
        const suffix = { factor: 'FACTOR', temperature: 'TEMP', concentration: 'CONC', surface: 'SURF' }[skill], name = { factor: 'Oma hallittu vertailu', temperature: 'Lämpötilan tutkimusikkuna', concentration: 'Pitoisuuden kohtaamisikkuna', surface: 'Palakoon pintapaja' }[skill];
        return spec(`CHEM79-RATE-${suffix}`, name, 'Aava rakentaa rajatun virtuaalikokeen ja Sulka tarkistaa vakiona pidettävät tekijät.', 'Rakenna yhden tekijän vertailu, mittaa molemmat kokeet ja perustele rajattu nopeuspäätelmä.', 'Oman kokeen havaintopolku syttyy kidepajan seinään.', ['own-controlled-plan', r => rate(r, 0, skill)], ['repair-confounded-plan', r => rate(r, 1, skill)], r => rate(r, 2, skill));
    }),
];
export const reactionLabEvidence: Readonly<Record<string, {
    families: readonly string[];
    limit: string;
}>> = Object.fromEntries(reactionLabSpecs.map(s => [s.id, { families: s.produce ?? [], limit: 'Näyttö koskee annettujen aineidentiteettien tulkintaa, omaa symbolista rakennetta tai rajatun virtuaalimallin toimia ja laskuja. Oma kausaalinen perustelu edellyttää aikuisen havaintoa ja avun merkintää. Pelkkä valmis perustelun valinta tai malliselityksen lukeminen ei ole oma selitys. Aine- ja energiamäärät sekä pinnan tasainen vetäytyminen ovat ilmoitettuja opetusoletuksia. Virtuaalikoe ei osoita oikean aineen käsittelyä, paloturvallisuustoimintaa tai kaikkien reaktioiden nopeuslakia. Ei oppijan teksti- tai äänitallenteita.' }]));
