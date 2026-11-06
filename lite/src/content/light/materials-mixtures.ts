import type { MaterialsMixturesTask, MatterPhase, SeparationMethod } from '../models/materials-mixtures';
import { askChoice, askNumber, card, type LightAdapter } from './core';

const STATE: Record<MatterPhase, string> = { solid: 'Kiinteä', liquid: 'Neste', gas: 'Kaasu' };
const FROM: Record<MatterPhase, string> = { solid: 'kiinteästä', liquid: 'nesteestä', gas: 'kaasusta' };
const TO: Record<MatterPhase, string> = { solid: 'kiinteäksi', liquid: 'nesteeksi', gas: 'kaasuksi' };
const CHANGE: Record<string, string> = { 'solid-liquid': 'Sulaminen', 'liquid-solid': 'Jäätyminen', 'liquid-gas': 'Haihtuminen', 'gas-liquid': 'Tiivistyminen' };
const METHOD: Record<SeparationMethod, [string, string]> = {
  filter: ['Suodatus', 'Suodatin päästää nesteen läpi, mutta pysäyttää kiinteät rakeet.'],
  decant: ['Kaataminen pohjasakan päältä', 'Kun kiinteä aine on laskeutunut pohjalle, nesteen voi kaataa varovasti pois.'],
  evaporate: ['Haihdutus', 'Kun vesi haihtuu, liuennut aine jää astian pohjalle.'],
};
const lc = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);
const up = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const PROPERTY = { absorption: ['Vettä imeytyi', '%'], bend: ['Taipuma', 'mm'], transmission: ['Valoa läpi', '%'] } as const;

export const materialsMixturesLight: LightAdapter<MaterialsMixturesTask> = (full, context) => {
  const task = full.task;
  const pick = <T>(list: readonly T[]) => list[context.r.int(0, list.length - 1)]!;
  const choice = (say: string, choices: { text: string; why?: string }[], correct: number, explain: string, scene?: ReturnType<typeof card>, hint?: string, ordered = false) =>
    askChoice(full, context, { say, choices, correct, explain, hint, ordered, scene: scene ?? null });

  switch (task.mode) {
    case 'materials': {
      const samples = task.samples ?? [];
      if (task.property) {
        const [label, unit] = PROPERTY[task.property];
        const values = samples.map(s => s[task.property!]);
        const best = task.choose === 'min' ? Math.min(...values) : Math.max(...values);
        const right = samples.findIndex(s => s[task.property!] === best);
        const want = task.property === 'absorption' ? 'imee vettä vähiten' : task.property === 'bend' ? (task.choose === 'min' ? 'taipuu vähiten' : 'taipuu eniten') : (task.choose === 'min' ? 'päästää valoa läpi vähiten' : 'päästää valoa läpi eniten');
        return choice(`Tarvitaan näyte, joka ${want}. Mikä näytteistä sopii parhaiten?`,
          samples.map((s, i) => ({ text: `${s.label} (${s.object})`, why: i === right ? undefined : `Tällä näytteellä tulos on ${s[task.property!]} ${unit}. Vertaa lukuja.` })),
          right, `${samples[right]!.label} sopii, koska sen tulos ${best} ${unit} on ${task.choose === 'min' ? 'pienin' : 'suurin'}. Ominaisuus mitataan, ei arvata muodosta.`,
          card(samples.map(s => [`${s.label} · ${s.object}`, `${s[task.property!]} ${unit}`]), `${label}, sama koe kaikille:`));
      }
      if (task.observations?.length) {
        const o = pick(task.observations);
        const options = [['transmission', 'Läpinäkyvyys'], ['bend', 'Taipuisuus'], ['hardness', 'Kovuus'], ['opinion', 'Mielipide, ei mittaus']] as const;
        return choice(`Havainto: ”${o.text}” Mitä tämä havainto kertoo?`,
          options.map(([id, text]) => ({ text, why: id === o.property ? undefined : id === 'opinion' ? 'Tässä havainnossa on mitattava tai nähtävä asia, ei mieltymys.' : 'Lue havainto uudelleen: mitä siinä tapahtuu materiaalille?' })),
          options.findIndex(([id]) => id === o.property),
          o.property === 'opinion' ? 'Tämä on mieltymys. Toinen ihminen voi olla eri mieltä, joten se ei ole materiaalin ominaisuus.' : `Havainto kertoo ominaisuudesta: ${options.find(([id]) => id === o.property)![1].toLowerCase()}.`);
      }
      const s = pick(samples);
      const materials = [['wood', 'Puu'], ['metal', 'Metalli'], ['glass', 'Lasi']] as const;
      return choice(`${s.label} (${s.object}) imi vettä ${s.absorption} %, taipui ${s.bend} mm ja päästi valoa läpi ${s.transmission} %. Mistä materiaalista se on?`,
        materials.map(([id, text]) => ({ text, why: id === s.material ? undefined : id === 'wood' ? 'Puu imee vettä.' : id === 'metal' ? 'Metalli ei päästä valoa läpi.' : 'Lasi päästää valoa läpi eikä taivu.' })),
        materials.findIndex(([id]) => id === s.material),
        'Puu imee vettä. Metalli taipuu eikä päästä valoa läpi. Lasi päästää valoa läpi eikä taivu. Esineen muoto ei kerro materiaalia.',
        card([['Vettä imeytyi', `${s.absorption} %`], ['Taipuma', `${s.bend} mm`], ['Valoa läpi', `${s.transmission} %`]], `${s.label} · ${s.object}`),
        'Mikä materiaali päästää valoa läpi? Mikä imee vettä?');
    }
    case 'levels': {
      const levels = task.levels!;
      const key = pick(['object', 'material', 'substance'] as const);
      const options = [['object', 'Esine'], ['material', 'Materiaali'], ['substance', 'Kemiallinen aine']] as const;
      return choice(`${levels.fact} Onko ”${levels[key]}” esine, materiaali vai kemiallinen aine?`,
        options.map(([id, text]) => ({ text, why: id === key ? undefined : id === 'object' ? 'Esine on valmis tavara, jota käytetään.' : id === 'material' ? 'Materiaali on se, mistä esine on tehty.' : 'Kemiallinen aine on materiaalin pienin rakennusaine.' })),
        options.findIndex(([id]) => id === key),
        `${up(levels.object)} on esine. Se on tehty materiaalista: ${lc(levels.material)}. Materiaalissa on kemiallista ainetta: ${lc(levels.substance)}.`);
    }
    case 'state': {
      const s = pick(task.states!);
      if (task.stateExperiment === 'compress') {
        const smaller = s.phase === 'gas';
        return choice(`Suljettua ruiskua puristetaan kevyesti. Ruiskussa on ${s.label.toLowerCase()}. Mitä sen tilavuudelle tapahtuu?`,
          [{ text: 'Tilavuus pysyy lähes samana.', why: smaller ? 'Kaasun hiukkasten välissä on paljon tyhjää, joten kaasu puristuu kokoon.' : undefined },
            { text: 'Tilavuus pienenee selvästi.', why: smaller ? undefined : 'Kiinteän ja nesteen hiukkaset ovat jo lähellä toisiaan, joten ne eivät juuri puristu.' }],
          smaller ? 1 : 0, 'Kaasu puristuu kokoon, koska hiukkasten välissä on paljon tyhjää. Neste ja kiinteä aine eivät juuri puristu.');
      }
      const phases: MatterPhase[] = ['solid', 'liquid', 'gas'];
      return choice(`${s.label}: ${s.behavior.replace(/\.$/, '')}. Missä olomuodossa aine on?`,
        phases.map(p => ({ text: STATE[p] })), phases.indexOf(s.phase),
        'Kiinteä aine pitää muotonsa. Neste ottaa astian muodon, mutta tilavuus pysyy. Kaasu täyttää koko astian.',
        undefined, 'Pitääkö aine muotonsa? Täyttääkö se koko astian?');
    }
    case 'phase': {
      const { before, after, name, massMg, temperature } = task.phase!;
      if (context.phase !== 'guided') {
        return askNumber(full, {
          say: `${name}: suljetussa astiassa on ${massMg} mg ainetta. Aine muuttuu ${FROM[before]} ${TO[after]}. Montako milligrammaa ainetta on muutoksen jälkeen?`,
          answer: massMg, unit: 'mg', scene: card([['Alussa', `${massMg} mg`], ['Olomuoto', `${STATE[before]} → ${STATE[after]}`]], temperature),
          whyAt: { 0: 'Aine ei katoa, vaikka se muuttuu kaasuksi tai nesteeksi. Astia on suljettu.' },
          explain: `Massa säilyy: ${massMg} mg. Olomuodon muutoksessa samat hiukkaset vain liikkuvat eri tavalla.`,
        });
      }
      const changes = ['solid-liquid', 'liquid-solid', 'liquid-gas', 'gas-liquid'];
      return choice(`${name} muuttuu ${FROM[before]} ${TO[after]}. Mikä muutoksen nimi on?`,
        changes.map(c => ({ text: CHANGE[c]! })), changes.indexOf(`${before}-${after}`),
        `${STATE[before]} → ${STATE[after].toLowerCase()} on ${CHANGE[`${before}-${after}`]!.toLowerCase()}. Aineen massa ei muutu.`,
        card([['Ennen', STATE[before]], ['Jälkeen', STATE[after]]], temperature));
    }
    case 'composition': {
      const s = pick(task.compositions!);
      const names = [...new Set(s.substances.filter(x => x.count > 0).map(x => x.name))];
      const scene = card(s.substances.map(x => [`${x.name} (${x.formula})`, `${x.count} osaa`]), s.label, s.phases === 1 ? 'Näyte näyttää kauttaaltaan samalta.' : 'Näytteessä näkyy eri kerroksia tai rakeita.');
      if (task.skill === 'pure') {
        const pure = names.length === 1;
        return choice(`Katso näytettä: ${s.label}. Onko se puhdas aine vai seos?`,
          [{ text: 'Puhdas aine', why: pure ? undefined : `Näytteessä on ${names.length} eri ainetta: ${names.map(lc).join(' ja ')}.` }, { text: 'Seos', why: pure ? 'Näytteessä on vain yhtä ainetta.' : undefined }],
          pure ? 0 : 1, pure ? `Näytteessä on vain ${lc(names[0]!)}. Se on puhdas aine.` : `Näytteessä on ${names.map(lc).join(' ja ')}. Kaksi tai useampi aine sekaisin on seos.`, scene);
      }
      const even = s.phases === 1;
      return choice(`Katso näytettä: ${s.label}. Se on seos. Onko se kauttaaltaan samanlainen vai erottuvatko sen osat?`,
        [{ text: 'Tasakoosteinen: kaikkialla samanlainen', why: even ? undefined : 'Näytteessä näkyy eri osia, joten se ei ole kaikkialla samanlainen.' },
          { text: 'Sekakoosteinen: osat erottuvat', why: even ? 'Osat eivät erotu toisistaan. Näyte on kaikkialla samanlainen.' : undefined }],
        even ? 0 : 1, even ? 'Tasakoosteisessa seoksessa aineet ovat sekoittuneet niin, että osia ei erota.' : 'Sekakoosteisessa seoksessa eri osat näkyvät, esimerkiksi rakeina tai kerroksina.', scene);
    }
    case 'dissolve': {
      const trials = task.trials!;
      const over = trials.find(t => t.doseMg > t.capacityMg);
      if (over && context.phase !== 'guided') {
        return askNumber(full, {
          say: `${over.label}: veteen lisätään ${over.doseMg} mg ainetta (${lc(over.solute)}). Vesi pystyy liuottamaan siitä enintään ${over.capacityMg} mg. Montako milligrammaa jää pohjalle liukenematta?`,
          answer: over.doseMg - over.capacityMg, unit: 'mg',
          scene: card([['Lisätty', `${over.doseMg} mg`], ['Liukenee enintään', `${over.capacityMg} mg`]], `${over.label} · ${over.solvent} + ${over.solute}`),
          whyAt: { [over.capacityMg]: 'Tämä määrä liukenee. Kysymys koskee pohjalle jäävää osaa.', 0: 'Kaikki ei mahdu liukenemaan, koska lisättiin enemmän kuin vesi pystyy liuottamaan.' },
          explain: `${over.capacityMg} mg liukenee ja loput jää pohjalle: ${over.doseMg} − ${over.capacityMg} = ${over.doseMg - over.capacityMg} mg.`,
        });
      }
      const [a, b] = [trials[0]!, trials[1]!];
      const da = Math.min(a.doseMg, a.capacityMg), db = Math.min(b.doseMg, b.capacityMg);
      const right = da > db ? 0 : da < db ? 1 : 2;
      return choice('Kummassa kokeessa ainetta liukeni enemmän?',
        [{ text: a.label }, { text: b.label }, { text: 'Yhtä paljon' }].map((c, i) => ({ ...c, why: i === right ? undefined : 'Liukenee vain se määrä, joka mahtuu. Ylimäärä jää pohjalle.' })),
        right, `${a.label}: liukeni ${da} mg. ${b.label}: liukeni ${db} mg. Liukenee lisätty määrä, mutta enintään se, minkä vesi pystyy liuottamaan.`,
        card(trials.map(t => [`${t.label}: lisätty / enintään`, `${t.doseMg} mg / ${t.capacityMg} mg`]), 'Sama vesimäärä kummassakin kokeessa.'),
        'Kummastakin kokeesta: liukenee pienempi luvuista ”lisätty” ja ”enintään”.');
    }
    case 'separate': {
      const s = pick(task.stations!);
      const methods: SeparationMethod[] = ['filter', 'decant', 'evaporate'];
      const parts = card(s.initial.parcels.map(p => [lc(p.substance), p.zone === 'dissolved' ? 'liuennut veteen' : p.phase === 'solid' ? (s.settled ? 'laskeutunut pohjalle' : 'rakeina nesteessä') : p.phase === 'solution' ? 'liuoksena' : STATE[p.phase].toLowerCase()]), s.label);
      if (s.method === 'decant') {
        return choice(`Halutaan kaataa neste pois niin, että hiekka jää astiaan. Kumpi astia kannattaa kaataa?`,
          [{ text: 'Astia, jossa hiekka on laskeutunut pohjalle' }, { text: 'Astia, joka on juuri sekoitettu', why: 'Sekoitetussa astiassa hiekka on vielä nesteessä ja valuisi mukaan.' }],
          0, 'Kun hiekka on laskeutunut pohjalle, nesteen voi kaataa varovasti pois. Tätä kutsutaan dekantoinniksi.', parts);
      }
      const solids = s.initial.parcels.filter(p => p.phase === 'solid' && p.zone !== 'dissolved').map(p => lc(p.substance));
      const dissolved = s.initial.parcels.filter(p => p.zone === 'dissolved').map(p => lc(p.substance));
      const say = s.method === 'evaporate'
        ? `${up(dissolved.join(' ja '))} on liuennut veteen. Halutaan saada se talteen kiinteänä. Mikä keino sopii?`
        : `Nesteessä on kiinteitä rakeita (${solids.join(', ')}), eivätkä ne ole laskeutuneet. Halutaan erottaa rakeet nesteestä. Mikä keino sopii?`;
      return choice(say,
        methods.map(m => ({ text: METHOD[m][0], why: m === s.method ? undefined : METHOD[m][1] + ' Se ei sovi tähän.' })),
        methods.indexOf(s.method), `${METHOD[s.method][0]}: ${METHOD[s.method][1]}`, parts);
    }
  }
};
