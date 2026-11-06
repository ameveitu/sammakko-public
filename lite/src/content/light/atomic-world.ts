import { atomicElement, atomicElements, atomicPropertyValue, atomicSampleFacts, type AtomicWorldTask } from '../models/atomic-world';
import { atomicWorldWorkedPaint } from '../scenes/atomic-world';
import { askChoice, askNumber, type Choice, type LightAdapter } from './core';

const name = (symbol: string) => `${atomicElement(symbol)?.name ?? symbol} (${symbol})`;
const PHASE: Record<string, string> = { solid: 'Kiinteänä', liquid: 'Nesteenä', gas: 'Kaasuna' };
const PARTICLE = { proton: 'Protoni', neutron: 'Neutroni', electron: 'Elektroni' } as const;
const CHARGE = { proton: '+1', neutron: '0', electron: '−1' } as const;

export const atomicWorldLight: LightAdapter<AtomicWorldTask> = (full, context) => {
  const task = full.task;
  const afterCorrect = atomicWorldWorkedPaint(task);
  const choice = (say: string, choices: Choice[], correct: number, explain: string, hint?: string, ordered = false) =>
    askChoice(full, context, { say, choices, correct, explain, hint, afterCorrect, ordered });
  switch (task.mode) {
    case 'atom': {
      const a = task.atoms[0]!;
      if (task.activity === 'link' && task.sample) {
        const { units, atomsPerUnit, symbol } = task.sample;
        const answer = units * atomsPerUnit;
        return askNumber(full, {
          say: atomsPerUnit === 2
            ? `Mallissa on ${units} molekyyliä alkuainetta ${name(symbol)}. Jokaisessa molekyylissä on kaksi atomia. Montako atomia mallissa on yhteensä?`
            : `Mallissa on ${units} erillistä atomia alkuainetta ${name(symbol)}. Montako atomia mallissa on?`,
          answer, afterCorrect,
          whyAt: { [units]: 'Laskit molekyylit. Jokaisessa molekyylissä on kaksi atomia.' },
          hint: atomsPerUnit === 2 ? `Laske ${units} kertaa 2.` : 'Laske kuvan atomit yksi kerrallaan.',
          explain: atomsPerUnit === 2 ? `${units} molekyyliä · 2 atomia = ${answer} atomia. Kaikki ovat samaa alkuainetta.` : `Mallissa on ${answer} samanlaista atomia.`,
        });
      }
      if (task.activity === 'regions') {
        if (task.comparison) {
          const same = task.comparison.protons === a.protons;
          return choice('Kahdessa ikkunassa on atomit. Toisesta on voinut irrota elektroni. Ovatko atomit samaa alkuainetta?',
            [{ text: 'Ovat, koska protoneja on yhtä monta.' }, { text: 'Eivät, koska elektronien määrä voi olla eri.', why: 'Alkuaineen ratkaisee protonien määrä ytimessä. Elektroneja voi irrota tai tarttua.' }],
            same ? 0 : 1, 'Alkuaine määräytyy ytimen protonien määrästä. Elektronien määrä voi muuttua ilman, että alkuaine vaihtuu.');
        }
        return choice('Missä atomin protonit ja neutronit ovat?',
          [{ text: 'Pienessä ytimessä keskellä.' }, { text: 'Elektroniverhossa ytimen ympärillä.', why: 'Elektroniverhossa ovat elektronit. Protonit ja neutronit ovat ytimessä.' },
            { text: 'Tasaisesti koko atomissa.', why: 'Protonit ja neutronit ovat yhdessä pienessä ytimessä.' }],
          0, 'Protonit ja neutronit ovat pienessä ytimessä. Elektronit liikkuvat ytimen ympärillä elektroniverhossa.',
          'Katso kuvan keskikohtaa.');
      }
      if (task.activity === 'number') {
        if (task.atoms.length === 2) {
          return choice(`Kummassakin atomissa on ${a.protons} protonia, mutta neutroneja on eri määrä. Ovatko ne samaa alkuainetta?`,
            [{ text: 'Ovat. Neutronien määrä voi vaihdella.' }, { text: 'Eivät. Eri neutronimäärä tekee eri alkuaineen.', why: 'Saman alkuaineen atomeissa voi olla eri määrä neutroneja. Alkuaineen ratkaisee protonien määrä.' }],
            0, `Molemmat ovat alkuainetta ${name(a.symbol)}, koska protoneja on ${a.protons}. Neutronien määrä muuttaa vain atomin massaa.`);
        }
        if (a.electrons !== a.protons) {
          return askNumber(full, {
            say: `Atomista on irronnut elektroneja. Sen ytimessä on yhä alkuaineen ${name(a.symbol)} protonit. Montako protonia ytimessä on?`,
            answer: a.protons, afterCorrect,
            whyAt: { [a.electrons]: 'Tämä on elektronien määrä. Elektroneja voi irrota, mutta protonien määrä ei muutu.' },
            hint: 'Järjestysluku kertoo protonien määrän.',
            explain: `Alkuaineen ${name(a.symbol)} järjestysluku on ${a.protons}, joten ytimessä on ${a.protons} protonia. Elektronien määrä voi muuttua.`,
          });
        }
        const near = atomicElements.filter(e => Math.abs(e.z - a.protons) === 1).slice(0, 2);
        const list = [atomicElement(a.symbol)!, ...near].sort((x, y) => x.z - y.z);
        return choice(`Ytimessä on ${a.protons} protonia. Mikä alkuaine se on?`,
          list.map(e => ({ text: `${e.name} (${e.symbol})`, why: e.symbol === a.symbol ? undefined : `Alkuaineella ${e.name} on ${e.z} protonia.` })),
          list.findIndex(e => e.symbol === a.symbol),
          `Protonien määrä on sama kuin järjestysluku. Järjestysluku ${a.protons} on ${name(a.symbol)}.`,
          'Etsi jaksollisesta järjestelmästä järjestysluku, joka on sama kuin protonien määrä.');
      }
      const particle = task.particle ?? 'proton';
      if (task.inverse) {
        const order = ['proton', 'neutron', 'electron'] as const;
        return choice(`Hiukkasen varaus on ${CHARGE[particle]}, ja se on ${particle === 'electron' ? 'ytimen ympärillä' : 'ytimessä'}. Mikä hiukkanen se on?`,
          order.map(p => ({ text: PARTICLE[p], why: p === particle ? undefined : `${PARTICLE[p]}n varaus on ${CHARGE[p]}.` })),
          order.indexOf(particle), `${PARTICLE[particle]}n varaus on ${CHARGE[particle]}.`);
      }
      const charges = ['+1', '0', '−1'];
      return choice(`Mikä on ${PARTICLE[particle].toLowerCase()}n varaus?`,
        charges.map(c => ({ text: c, why: c === CHARGE[particle] ? undefined : 'Protoni on positiivinen, elektroni negatiivinen ja neutroni neutraali.' })),
        charges.indexOf(CHARGE[particle]), `${PARTICLE[particle]}n varaus on ${CHARGE[particle]}. Protoni on +1, neutroni 0 ja elektroni −1.`);
    }
    case 'sample': {
      const facts = task.samples.map(s => ({ s, f: atomicSampleFacts(s) }));
      const target = task.focus;
      const matching = facts.filter(x => x.f.classification === target);
      const word = target === 'element' ? 'alkuaine' : 'yhdiste';
      if (matching.length === 1) {
        return choice(`Mikä näytteistä on ${word}?`,
          facts.map(x => ({ text: x.s.label, why: x.f.classification === target ? undefined
            : x.f.classification === 'mixture' ? 'Tässä näytteessä on kahta eri ainetta sekaisin. Se on seos.'
              : x.f.classification === 'element' ? 'Tässä näytteessä on vain yhtä atomilajia. Se on alkuaine.' : 'Tässä näytteessä eri atomit ovat sitoutuneet toisiinsa. Se on yhdiste.' })),
          facts.indexOf(matching[0]!),
          target === 'element' ? 'Alkuaineessa on vain yhtä atomilajia, joko erillisinä atomeina tai molekyyleinä.' : 'Yhdisteessä eri atomit ovat sitoutuneet toisiinsa samanlaisiksi osiksi.',
          'Katso, montako eri väristä atomia kussakin näytteessä on ja ovatko ne kiinni toisissaan.');
      }
      const pick = facts[context.r.int(0, facts.length - 1)]!;
      const classes = ['element', 'compound', 'mixture'];
      return choice(`Mikä ${pick.s.label} on?`,
        [{ text: 'Alkuaine' }, { text: 'Yhdiste' }, { text: 'Seos' }],
        classes.indexOf(pick.f.classification),
        'Alkuaineessa on yhtä atomilajia. Yhdisteessä eri atomit ovat sitoutuneet toisiinsa. Seoksessa on eri aineita sekaisin.');
    }
    case 'build': {
      if (task.structure === 'lattice') {
        const [first, second] = task.species;
        const answer = task.sites.length / 2;
        return askNumber(full, {
          say: `Hilan ikkunassa on ${task.sites.length} paikkaa. ${first}- ja ${second}-ionit vuorottelevat. Montako ${first}-ionia ikkunassa on?`,
          answer, afterCorrect,
          whyAt: { [task.sites.length]: 'Puolet paikoista on toisen ionin paikkoja.' },
          hint: 'Kun kaksi lajia vuorottelee, kumpaakin on yhtä paljon.',
          explain: `${first} ja ${second} vuorottelevat, joten kumpaakin on puolet: ${task.sites.length} : 2 = ${answer}.`,
        });
      }
      const entries = Object.entries(task.composition);
      const [symbol, count] = entries.find(([, n]) => n > 1) ?? entries[0]!;
      return askNumber(full, {
        say: `Kaava ${task.compound} kertoo, mitä yhdessä molekyylissä on. Montako ${symbol}-atomia yhdessä molekyylissä on?`,
        answer: count, afterCorrect,
        hint: 'Atomin merkin perässä oleva pieni luku kertoo, montako atomia sitä on. Ilman lukua atomeja on yksi.',
        explain: `${task.compound}: ${entries.map(([s, n]) => `${n} ${s}-atomi${n > 1 ? 'a' : ''}`).join(' ja ')}.`,
      });
    }
    case 'periodic': {
      const target = atomicElement(task.target)!;
      if (task.activity === 'order') {
        const cards = task.cards.map(s => atomicElement(s)!);
        const first = [...cards].sort((x, y) => x.z - y.z)[0]!;
        return choice('Alkuaineet järjestetään järjestysluvun mukaan. Mikä korteista tulee ensimmäisenä?',
          cards.map(e => ({ text: `${e.name} (${e.symbol})`, why: e === first ? undefined : `Alkuaineen ${e.name} järjestysluku on ${e.z}. Pienempi luku tulee ensin.` })),
          cards.indexOf(first), `${first.name} tulee ensimmäisenä, koska sen järjestysluku ${first.z} on pienin.`, 'Pienin järjestysluku tulee ensin.');
      }
      if (task.activity === 'fill') {
        const near = atomicElements.filter(e => Math.abs(e.z - target.z) <= 1).sort((x, y) => x.z - y.z);
        return choice(`Järjestysluku on ${target.z}. Mikä alkuaine se on?`,
          near.map(e => ({ text: `${e.name} (${e.symbol})`, why: e === target ? undefined : `Alkuaineen ${e.name} järjestysluku on ${e.z}.` })),
          near.indexOf(target), `Järjestysluku ${target.z} on ${name(target.symbol)}.`);
      }
      if (task.activity === 'inverse') {
        const sameGroup = atomicElements.find(e => e.group === target.group && e.period !== target.period);
        const samePeriod = atomicElements.find(e => e.period === target.period && e.group !== target.group);
        const list = [target, sameGroup, samePeriod].filter((e): e is NonNullable<typeof e> => !!e);
        return choice(`Etsi alkuaine, joka on pystysarakkeessa (ryhmässä) ${target.group} ja vaakarivillä (jaksossa) ${target.period}.`,
          list.map(e => ({ text: `${e.name} (${e.symbol})`, why: e === target ? undefined : e.group === target.group ? 'Ryhmä on oikea, mutta vaakarivi ei.' : 'Vaakarivi on oikea, mutta ryhmä ei.' })),
          0, `${name(target.symbol)} on ryhmässä ${target.group} ja jaksossa ${target.period}.`, 'Ryhmä on pystysarake, jakso vaakarivi.', false);
      }
      return askNumber(full, {
        say: `Monennessa pystysarakkeessa (ryhmässä) ${name(target.symbol)} on?`,
        answer: target.group, afterCorrect, label: 'Ryhmä',
        whyAt: { [target.period]: 'Tämä on vaakarivin (jakson) numero. Kysymys koskee pystysaraketta.' },
        hint: 'Etsi alkuaine taulukosta ja katso sarakkeen numeroa ylhäältä.',
        explain: `${name(target.symbol)} on ryhmässä ${target.group} ja jaksossa ${target.period}.`,
      });
    }
    case 'property': {
      if (task.property === 'state') {
        const value = atomicPropertyValue(task.target, 'state', task.temperatureC) as string;
        const phases = ['solid', 'liquid', 'gas'];
        return choice(`Missä olomuodossa ${name(task.target)} on ${task.temperatureC} °C:ssa? Käytä taulukon sulamis- ja kiehumispisteitä.`,
          phases.map(p => ({ text: PHASE[p]! })), phases.indexOf(value),
          `${name(task.target)} on ${task.temperatureC} °C:ssa ${PHASE[value]!.toLowerCase()}, koska lämpötila on ${value === 'solid' ? 'sulamispistettä matalampi' : value === 'liquid' ? 'sulamis- ja kiehumispisteen välissä' : 'kiehumispistettä korkeampi'}.`,
          'Vertaa lämpötilaa ensin sulamispisteeseen ja sitten kiehumispisteeseen.');
      }
      const label = task.property === 'melting' ? 'sulamispiste' : 'kiehumispiste';
      const t = atomicPropertyValue(task.target, task.property, 20) as number;
      const c = atomicPropertyValue(task.comparison, task.property, 20) as number;
      const higher = t > c ? task.target : task.comparison;
      return choice(`${name(task.target)} ja ${name(task.comparison)} ovat samassa ryhmässä. Kummalla on korkeampi ${label}? Katso taulukon suuntaa.`,
        [task.target, task.comparison].map(s => ({ text: name(s) })), higher === task.target ? 0 : 1,
        `Taulukon mukaan korkeampi ${label} on aineella ${name(higher)}. Samassa ryhmässä ominaisuus muuttuu tasaisesti, kun mennään taulukossa alaspäin.`,
        `Katso, kumpi on taulukossa alempana, ja mihin suuntaan ${label} muuttuu.`);
    }
    case 'phase': {
      if (task.activity === 'change') {
        const verb = task.change === 'melt' ? 'jää sulaa' : task.change === 'vaporize' ? 'vesi höyrystyy' : 'vesihöyry tiivistyy';
        return choice(`Kun ${verb}, mitä vesimolekyyleille tapahtuu?`,
          [{ text: 'Ne pysyvät samoina. Vain liike ja välit muuttuvat.' },
            { text: 'Ne hajoavat vedyksi ja hapeksi.', why: 'Olomuodon muutoksessa molekyylit eivät hajoa. Vesi pysyy vetenä.' },
            { text: 'Ne kasvavat tai pienenevät.', why: 'Molekyylien koko ei muutu. Muuttuu vain liike ja etäisyys.' }],
          0, 'Olomuodon muutoksessa samat vesimolekyylit säilyvät. Niiden liike ja keskinäiset välit muuttuvat.');
      }
      if (task.activity === 'interpret') {
        const unique = task.chambers.filter(c => task.chambers.filter(d => d.phase === c.phase).length === 1);
        if (!unique.length) return null;
        const chamber = unique[context.r.int(0, unique.length - 1)]!;
        const wanted = chamber.phase;
        const words = wanted === 'solid' ? 'kiinteänä' : wanted === 'liquid' ? 'nesteenä' : 'kaasuna';
        return choice(`Missä salissa aine on ${words}?`,
          task.chambers.map(c => ({ text: `Sali ${c.id} (${c.temperatureC} °C)`, why: c === chamber ? undefined : `Salissa ${c.id} aine on ${PHASE[c.phase]!.toLowerCase()}.` })),
          task.chambers.indexOf(chamber),
          `Salissa ${chamber.id} aine on ${words}. Kiinteässä hiukkaset värähtelevät paikallaan, nesteessä ne liukuvat toistensa ohi ja kaasussa ne liikkuvat vapaasti kaukana toisistaan.`,
          'Katso hiukkasten välejä ja lämpötilaa.', false);
      }
      const phases = ['solid', 'liquid', 'gas'] as const;
      const wanted = phases[context.r.int(0, 2)]!;
      const description = wanted === 'solid' ? 'Hiukkaset ovat lähellä toisiaan ja värähtelevät paikallaan.'
        : wanted === 'liquid' ? 'Hiukkaset ovat lähellä toisiaan, mutta liukuvat toistensa ohi.' : 'Hiukkaset ovat kaukana toisistaan ja liikkuvat vapaasti.';
      return choice(`${description} Mikä olomuoto se on?`, phases.map(p => ({ text: PHASE[p]!.replace(/na$/, '') })),
        phases.indexOf(wanted), `${description} Se on ${PHASE[wanted]!.toLowerCase()} oleva aine.`);
    }
    case 'model-use': {
      if (task.particle) {
        const diffusion = task.particle.kind === 'diffusion';
        return choice(diffusion ? 'Hajuhiukkaset ovat aluksi yhdessä nurkassa. Mitä niille tapahtuu ajan kuluessa?' : `Ainetta lämmitetään ${task.particle.temperatureC} °C:sta ${task.particle.afterTemperatureC} °C:seen. Mitä hiukkasille tapahtuu?`,
          diffusion
            ? [{ text: 'Ne leviävät vähitellen koko tilaan.' }, { text: 'Ne pysyvät nurkassa.', why: 'Hiukkaset liikkuvat koko ajan ja törmäilevät, joten ne leviävät.' }, { text: 'Ne katoavat.', why: 'Hiukkasia on yhtä monta. Ne vain leviävät.' }]
            : [{ text: 'Ne liikkuvat nopeammin.' }, { text: 'Ne kasvavat suuremmiksi.', why: 'Hiukkasten koko ei muutu. Lämpö lisää liikettä.' }, { text: 'Niitä tulee lisää.', why: 'Hiukkasia on yhtä monta. Ne liikkuvat nopeammin.' }],
          0, diffusion ? 'Hiukkaset liikkuvat ja törmäilevät, joten ne leviävät vähitellen koko tilaan. Hiukkasten määrä ei muutu.'
            : 'Lämmitettäessä hiukkaset liikkuvat nopeammin. Niiden koko ja määrä pysyvät samoina.');
      }
      const s = task.structures[0]!;
      if (s.intervention === 'shift') {
        return choice('Kidettä lyödään ja yksi kerros siirtyy. Nyt samanmerkkiset ionit ovat vastakkain. Mitä tapahtuu?',
          [{ text: 'Ne torjuvat toisiaan, ja kide lohkeaa.' }, { text: 'Ne tarttuvat toisiinsa tiukemmin.', why: 'Samanmerkkiset varaukset torjuvat toisiaan.' }, { text: 'Mitään ei tapahdu.', why: 'Siirto muuttaa naapurit. Samanmerkkiset ionit torjuvat toisiaan.' }],
          0, 'Siirron jälkeen samanmerkkiset ionit ovat vierekkäin ja torjuvat toisiaan. Siksi ionikide on hauras.');
      }
      return choice(`Hilassa ${s.species[0]}- ja ${s.species[1]}-ionit vuorottelevat. Mikä pitää kiteen koossa?`,
        [{ text: 'Eri merkkiset naapurit vetävät toisiaan puoleensa.' }, { text: 'Samanmerkkiset naapurit vetävät toisiaan.', why: 'Samanmerkkiset varaukset torjuvat toisiaan.' }, { text: 'Ionit ovat kiinni liimalla.', why: 'Kiteen koossa pitää sähköinen vetovoima.' }],
        0, 'Positiiviset ja negatiiviset ionit vuorottelevat, ja eri merkkiset varaukset vetävät toisiaan puoleensa.');
    }
    case 'scale': {
      const particle = task.cards.find(c => c.level === 'particle')!;
      return choice('Mikä kuvista näyttää ilmiön hiukkastasolla, niin pienenä ettei sitä voi nähdä silmällä?',
        task.cards.map(c => ({ text: c.label, why: c === particle ? undefined : c.level === 'macro' ? 'Tämän voi nähdä silmällä.' : 'Tämä näyttää rakenteen, mutta ei vielä yksittäisiä hiukkasia.' })),
        task.cards.indexOf(particle), 'Hiukkastason kuva on malli. Sitä ei voi nähdä kameralla, mutta se selittää, mitä silmällä näkyvässä aineessa tapahtuu.');
    }
  }
};
