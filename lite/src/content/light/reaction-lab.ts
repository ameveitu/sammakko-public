import type { Paint } from '../../engine/types';
import { parseChemicalFormula } from '../models/chemical-notation';
import {
  reactionChangeFacts, reactionFormulaMass, reactionMaterialState, reactionRecipe, solutionReactionLab,
  type ReactionCase, type ReactionConfiguration, type ReactionFactor, type ReactionLabTask, type ReactionSpecies,
} from '../models/reaction-lab';
import { askChoice, askNumber, card, fi, type LightAdapter } from './core';

/* Pictures: beakers, atom balls and an energy arrow instead of the full lab's model ledgers. */

const INK = '#24443a';
const esc = (s: string) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const sub = (formula: string) => formula.replace(/\d/g, d => '₀₁₂₃₄₅₆₇₈₉'[Number(d)]!);
const list = (names: readonly string[]) => names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} ja ${names.at(-1)}`;
const unique = (names: readonly string[]) => [...new Set(names)];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** Everyday name: drops the model words of the full lab ("magnesiumoksidin hilayksikkö" → "magnesiumoksidi"). */
const nm = (s: { name: string }) => s.name.replace(/n (hilayksikkö|mallitoistoyksikkö)$/, '').replace(/^muuttumaton /, '');

function picture(markup: string, label: string, width: number, height: number): Paint {
  return host => {
    const wrap = document.createElement('div');
    wrap.setAttribute('data-light-figure', '');
    wrap.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(label)}" style="display:block;width:100%;max-height:240px;font-family:inherit">${markup}</svg>`;
    host.replaceChildren(wrap);
  };
}

const text = (x: number, y: number, s: string, size = 13, anchor = 'middle', weight = 400) =>
  `<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" font-weight="${weight}" fill="${INK}">${esc(s)}</text>`;
const arrow = (x1: number, x2: number, y: number, color = '#a67f48') =>
  `<path d="M${x1} ${y}H${x2}" stroke="${color}" stroke-width="4"/><path d="M${x2} ${y}l${x2 > x1 ? -10 : 10} -7v14Z" fill="${color}"/>`;

type Look = 'liquid' | 'solid' | 'gas' | 'bubbles' | 'flame' | 'clear' | 'colour' | 'cloud';

/** One beaker at x (width 90), with what is seen inside it. */
function beaker(x: number, look: Look, tint: string): string {
  const glass = `<path d="M${x} 20v74q0 6 6 6h78q6 0 6-6V20" fill="#f4faf7" stroke="#537b69" stroke-width="2.5"/>`;
  const fill = (top: number, color: string) => `<rect x="${x + 3}" y="${top}" width="84" height="${97 - top}" rx="3" fill="${color}"/>`;
  const dots = (n: number, y0: number, color: string, r = 4) => Array.from({ length: n }, (_, i) => `<circle cx="${x + 14 + (i * 17) % 66}" cy="${y0 + (i % 3) * 9}" r="${r}" fill="${color}" stroke="#547865" stroke-width=".8"/>`).join('');
  switch (look) {
    case 'liquid': return glass + fill(56, tint);
    case 'clear': return glass + fill(56, '#cfe6f2');
    case 'colour': return glass + fill(56, '#e3a65b');
    case 'solid': return glass + `<rect x="${x + 28}" y="72" width="34" height="25" rx="4" fill="#c1ac79" stroke="#7b6a43"/>`;
    case 'gas': return glass + dots(8, 34, '#e8eef6', 5);
    case 'bubbles': return glass + fill(62, tint) + dots(7, 30, '#ffffff', 5);
    case 'cloud': return glass + fill(56, '#dfe8ea') + dots(6, 84, '#f5f5f5', 3);
    case 'flame': return glass + `<rect x="${x + 28}" y="78" width="34" height="19" rx="4" fill="#d9d4cc" stroke="#7b6a43"/><path d="M${x + 45} 28c12 14 14 26 6 40c-4 6-14 6-18 0c-8-14 0-24 12-40Z" fill="#f2a33a"/><path d="M${x + 45} 46c5 7 6 13 2 20c-2 3-6 3-8 0c-3-7 0-12 6-20Z" fill="#ffe08a"/>`;
  }
}

function lookOf(species: readonly { phase: string }[]): Look {
  if (species.some(s => s.phase === 'liquid' || s.phase === 'aqueous')) return 'liquid';
  if (species.some(s => s.phase === 'solid')) return 'solid';
  return 'gas';
}

function afterLook(c: ReactionCase): Look {
  switch (c.illustration) {
    case 'gas-release': return 'bubbles';
    case 'burn': return 'flame';
    case 'dissolve': return 'clear';
    case 'melt': return 'liquid';
    case 'colour': return 'colour';
    case 'precipitate': return 'cloud';
  }
}

/** Before and after beakers with the identified substances written under each. */
function changePicture(c: ReactionCase): Paint {
  const verified = c.identityEvidence === 'verified';
  const names = (side: ReactionCase['before']) => unique(side.map(s => `${nm(s)} ${sub(s.formula)}`));
  const below = (x: number, lines: readonly string[]) => lines.slice(0, 3).map((line, i) => text(x, 122 + i * 16, line, 12)).join('');
  const after = verified ? names(c.after) : ['ainetta ei tunnistettu'];
  const markup = text(70, 13, 'ennen', 13, 'middle', 700) + text(290, 13, 'jälkeen', 13, 'middle', 700)
    + beaker(25, lookOf(c.before), '#a7c6b4') + arrow(130, 225, 60) + beaker(245, afterLook(c), '#a7c6b4')
    + below(70, names(c.before)) + below(290, after);
  return picture(markup, `Ennen: ${names(c.before).join(', ')}. Jälkeen: ${after.join(', ')}.`, 360, 172);
}

/** A reaction as pills: starting substances → products. */
function equationPicture(reactants: readonly ReactionSpecies[], products: readonly ReactionSpecies[], heading = true): Paint {
  const pill = (s: ReactionSpecies, x: number, w: number) =>
    `<rect x="${x}" y="30" width="${w}" height="46" rx="10" fill="#eaf0dc" stroke="#7c9b8e"/>${text(x + w / 2, 50, nm(s).split(' ')[0]!, 12)}${text(x + w / 2, 68, `${s.coefficient > 1 ? s.coefficient + ' ' : ''}${sub(s.formula)}`, 13, 'middle', 700)}`;
  const width = (s: ReactionSpecies) => Math.max(70, nm(s).split(' ')[0]!.length * 7 + 16);
  let x = 6, markup = '';
  const side = (items: readonly ReactionSpecies[]) => items.forEach((s, i) => {
    if (i) { markup += text(x + 8, 58, '+', 18, 'middle', 700); x += 16; }
    const w = width(s); markup += pill(s, x, w); x += w + 4;
  });
  const left = x;
  side(reactants);
  const mid = x; x += 50; markup += arrow(mid + 6, x - 6, 53);
  const right = x;
  side(products);
  if (heading) markup = text((left + mid) / 2, 18, 'alussa', 12, 'middle', 700) + text((right + x) / 2, 18, 'lopussa', 12, 'middle', 700) + markup;
  return picture(markup, `${reactants.map(s => nm(s)).join(' + ')} → ${products.map(s => nm(s)).join(' + ')}`, x + 6, 84);
}

const ATOM: Record<string, [string, string]> = { H: ['#ffffff', INK], O: ['#d9534f', '#fff'], C: ['#3a3a3a', '#fff'], N: ['#5b7fd1', '#fff'], Mg: ['#b8c2c8', INK], Ca: ['#d8d0b8', INK] };

/** Molecules as balls: same atoms before and after, in a new order. */
function atomsPicture(before: readonly ReactionSpecies[], after: readonly ReactionSpecies[], groups: number): Paint {
  const row = (s: ReactionSpecies) => Array.from({ length: s.coefficient * groups }, () => s.formula);
  const molecule = (formula: string, x: number, y: number) => {
    const atoms = Object.entries(parseChemicalFormula(formula)?.atoms ?? {}).flatMap(([el, n]) => Array.from({ length: n ?? 0 }, () => el));
    return atoms.map((el, i) => { const [fill, ink] = ATOM[el] ?? ['#ccc', INK]; return `<circle cx="${x + i * 15}" cy="${y}" r="8" fill="${fill}" stroke="#4d5f57"/><text x="${x + i * 15}" y="${y + 3.5}" font-size="${el.length > 1 ? 7 : 9}" text-anchor="middle" fill="${ink}">${el}</text>`; }).join('');
  };
  const column = (items: readonly string[], x: number) => items.map((f, i) => molecule(f, x, 34 + i * 22)).join('');
  const left = before.flatMap(row), right = after.flatMap(row);
  const height = 44 + Math.max(left.length, right.length) * 22;
  const markup = text(70, 14, 'alussa', 12, 'middle', 700) + text(290, 14, 'lopussa', 12, 'middle', 700)
    + column(left, 22) + arrow(150, 210, height / 2) + column(right, 245);
  return picture(markup, `Alussa ${left.join(', ')}. Lopussa ${right.join(', ')}.`, 360, height);
}

/** Energy moves between the reaction and its surroundings. */
function energyPicture(net: number, start?: number): Paint {
  const out = net < 0, amount = Math.abs(net);
  const box = (x: number, label: string, note: string) => `<rect x="${x}" y="22" width="120" height="70" rx="12" fill="${x < 100 ? '#f6e7c8' : '#dcebf2'}" stroke="#7c9b8e"/>${text(x + 60, 52, label, 14, 'middle', 700)}${text(x + 60, 74, note, 12)}`;
  const markup = box(10, 'reaktio', '') + box(230, 'ympäristö', start === undefined ? (out ? 'lämpenee' : 'viilenee') : `alussa ${start}`)
    + (out ? arrow(135, 225, 57, '#d9822b') : arrow(225, 135, 57, '#3b82c4')) + text(180, 44, `${amount} yksikköä`, 13, 'middle', 700) + text(180, 112, 'energiaa siirtyy nuolen suuntaan', 12);
  return picture(markup, `${amount} energiayksikköä siirtyy ${out ? 'reaktiosta ympäristöön' : 'ympäristöstä reaktioon'}.`, 360, 120);
}

/** A beaker on a scale with its reading. */
function scalePicture(before: number, after: string, open: boolean): Paint {
  const scale = (x: number, look: Look, reading: string, label: string) => `${text(x + 45, 13, label, 13, 'middle', 700)}${beaker(x, look, '#a7c6b4')}<rect x="${x - 10}" y="104" width="110" height="14" rx="3" fill="#9aa9a2"/><rect x="${x + 15}" y="122" width="60" height="22" rx="4" fill="#1f2d28"/><text x="${x + 45}" y="138" font-size="13" text-anchor="middle" fill="#9ff0b4">${esc(reading)}</text>`;
  const markup = scale(25, 'liquid', `${before} mg`, 'alussa') + arrow(140, 220, 60) + scale(245, 'bubbles', after, 'lopussa')
    + (open ? '' : `<rect x="241" y="16" width="98" height="6" rx="2" fill="#537b69"/><rect x="21" y="16" width="98" height="6" rx="2" fill="#537b69"/>`);
  return picture(markup, `Vaa'an lukema alussa ${before} mg, lopussa ${after}.`, 360, 150);
}

/* Rate helpers. */

const pieces = (c: ReactionConfiguration) => c.shape.cuts[0] * c.shape.cuts[1] * c.shape.cuts[2];
const setting = (c: ReactionConfiguration) => `${c.temperatureC} °C · pitoisuus ${c.concentration} · ${pieces(c) === 1 ? '1 pala' : `${pieces(c)} pientä palaa`}`;
const differs = (a: ReactionConfiguration, b: ReactionConfiguration): ReactionFactor[] => [
  ...(a.temperatureC !== b.temperatureC ? ['temperature' as const] : []),
  ...(a.concentration !== b.concentration ? ['concentration' as const] : []),
  ...(pieces(a) !== pieces(b) ? ['surface' as const] : []),
];
const FACTOR_NAME: Record<ReactionFactor, string> = { temperature: 'lämpötila', concentration: 'pitoisuus', surface: 'palakoko' };
const FACTOR_OF: Record<ReactionFactor, string> = { temperature: 'lämpötilan', concentration: 'pitoisuuden', surface: 'palakoon' };
const WHY_FASTER: Record<ReactionFactor, string> = {
  temperature: 'Lämpimässä hiukkaset liikkuvat nopeammin. Ne törmäävät useammin ja voimakkaammin, joten reaktio nopeutuu.',
  concentration: 'Kun samassa tilavuudessa on enemmän reagoivia hiukkasia, ne törmäävät useammin, joten reaktio nopeutuu.',
  surface: 'Pieniksi paloiksi pilkotulla aineella on enemmän pintaa. Useampi hiukkanen pääsee reagoimaan yhtä aikaa, joten reaktio nopeutuu.',
};
function backTo(f: ReactionFactor, a: ReactionConfiguration): string {
  if (f === 'temperature') return `lämpötila (${a.temperatureC} °C)`;
  if (f === 'concentration') return `pitoisuus (${a.concentration})`;
  return `palakoko (${pieces(a) === 1 ? '1 iso pala' : `${pieces(a)} palaa`})`;
}
function changeText(f: ReactionFactor, a: ReactionConfiguration, b: ReactionConfiguration): string {
  if (f === 'temperature') return `lämpötilaa ${b.temperatureC > a.temperatureC ? 'nostetaan' : 'lasketaan'} (${a.temperatureC} °C → ${b.temperatureC} °C)`;
  if (f === 'concentration') return `liuoksen pitoisuutta ${b.concentration > a.concentration ? 'nostetaan' : 'lasketaan'} (${a.concentration} → ${b.concentration})`;
  return pieces(b) > pieces(a) ? `kiinteä pala pilkotaan ${pieces(b)} pienemmäksi palaksi` : `pienet palat korvataan ${pieces(b) === 1 ? 'yhdellä isolla palalla' : `${pieces(b)} palalla`}`;
}

export const reactionLabLight: LightAdapter<ReactionLabTask> = (full, context) => {
  const task = full.task, phase = context.phase;
  const pick = <T,>(items: readonly T[]): T => phase === 'guided' ? items[0]! : phase === 'transfer' ? items.at(-1)! : items[context.r.int(0, items.length - 1)]!;

  if (task.mode === 'change' || task.mode === 'reaction') {
    // A case seen only by its appearance makes the one question ambiguous ("water boils" → "cannot know"), so the light version shows identified cases.
    const known = task.cases.filter(c => c.identityEvidence === 'verified');
    const c = pick(known.length ? known : task.cases), facts = reactionChangeFacts(c);
    const afterIds = new Set(c.after.map(s => s.id)), kept = c.before.filter(s => afterIds.has(s.id) && facts.classification === 'chemical');
    const reacting = c.before.filter(s => !kept.includes(s)), before = unique(reacting.map(s => nm(s))), fresh = c.after.filter(s => facts.newSubstances.includes(s.id));
    const keptNote = kept.length ? ` ${cap(list(unique(kept.map(s => nm(s)))))} ei muuttunut.` : '';
    const scene = changePicture(c);
    if (task.skill === 'burn' && phase !== 'guided' && fresh.length && c.before.length) {
      const right = fresh[context.r.int(0, fresh.length - 1)]!;
      return askChoice(full, context, {
        say: 'Kuvassa aine palaa. Palaessa aine reagoi ilman hapen kanssa. Mikä näistä aineista syntyi palamisessa?', scene,
        choices: [{ text: `${nm(right)} ${sub(right.formula)}` }, ...c.before.map(s => ({ text: `${nm(s)} ${sub(s.formula)}`, why: kept.includes(s) ? `${cap(nm(s))} oli mukana jo alussa, eikä se muutu.` : `${cap(nm(s))} oli mukana jo alussa. Se kuluu palamisessa.` }))],
        correct: 0,
        explain: `Palamisessa ${list(before)} muuttuvat ${fresh.length > 1 ? 'uusiksi aineiksi' : 'uudeksi aineeksi'}: ${list(fresh.map(s => nm(s)))}.${keptNote} Palaminen on kemiallinen reaktio.`,
      });
    }
    const options = [
      { text: 'Syntyi uusi aine: muutos on kemiallinen', id: 'chemical' },
      { text: 'Aine pysyi samana: muutos on fysikaalinen', id: 'physical' },
      { text: 'Ei voi tietää: aineita ei ole tunnistettu', id: 'insufficient' },
    ];
    const why: Record<string, string> = {
      chemical: fresh.length ? '' : facts.classification === 'physical' ? `Lopussa on yhä samaa ainetta: ${list(unique(c.after.map(s => nm(s))))}. Vain olomuoto tai sekoittuminen muuttui.` : 'Kuplat, väri tai valo eivät yksin todista uutta ainetta.',
      physical: facts.classification === 'chemical' ? `Lopussa on aineita, joita alussa ei ollut: ${list(fresh.map(s => nm(s)))}.` : 'Kuplat, väri tai valo eivät yksin todista, että aine pysyi samana.',
      insufficient: 'Aineet on tunnistettu ennen ja jälkeen. Siksi voidaan päätellä.',
    };
    const explain = facts.classification === 'chemical'
      ? `Alussa oli ${list(before)}. Lopussa on ${fresh.length > 1 ? 'uusia aineita' : 'uusi aine'}: ${list(fresh.map(s => nm(s)))}.${keptNote} Kun syntyy uusi aine, muutos on kemiallinen eli reaktio.`
      : facts.classification === 'physical'
        ? `Ennen ja jälkeen on samat aineet: ${list(before)}. Vain olomuoto tai sekoittuminen muuttui, joten muutos on fysikaalinen.`
        : `${c.observation} Pelkkä näkyvä havainto ei kerro, syntyikö uusi aine. Tarvitaan tunnistustutkimus.`;
    const seen = /^Annet/.test(c.observation) ? '' : `${c.observation} `;
    return askChoice(full, context, {
      say: facts.classification === 'insufficient'
        ? `${seen}Lopun ainetta ei ole tutkittu, joten tiedämme vain, miltä se näyttää. Voiko tästä päätellä, syntyikö uusi aine?`
        : `${seen}Kuvassa on aineet ennen ja jälkeen muutoksen. Syntyikö muutoksessa uusi aine?`, scene, ordered: true,
      choices: options.map(o => ({ text: o.text, why: o.id === facts.classification ? undefined : why[o.id] })),
      correct: options.findIndex(o => o.id === facts.classification), explain,
    });
  }

  if (task.mode === 'roles') {
    const c = pick(task.cases), recipe = reactionRecipe(c.recipe)!;
    const scene = equationPicture(recipe.reactants, recipe.products);
    const all = [...recipe.reactants.map(s => ({ s, role: 'reactant' as const })), ...recipe.products.map(s => ({ s, role: 'product' as const }))];
    const explain = `Lähtöaineet ovat aineita, jotka reagoivat: ${list(recipe.reactants.map(s => nm(s)))}. Reaktiotuotteet syntyvät reaktiossa: ${list(recipe.products.map(s => nm(s)))}.`;
    if (phase === 'transfer') {
      const focus = all.find(x => x.s.formula === 'H2O') ?? all[context.r.int(0, all.length - 1)]!;
      return askChoice(full, context, {
        say: `Onko ${nm(focus.s)} tässä reaktiossa lähtöaine vai reaktiotuote?`, scene: equationPicture(recipe.reactants, recipe.products, false), ordered: true,
        choices: [
          { text: 'Lähtöaine', why: focus.role === 'reactant' ? undefined : `${cap(nm(focus.s))} syntyy reaktiossa, joten se on reaktiotuote.` },
          { text: 'Reaktiotuote', why: focus.role === 'product' ? undefined : `${cap(nm(focus.s))} on mukana alussa ja kuluu, joten se on lähtöaine.` },
        ],
        correct: focus.role === 'reactant' ? 0 : 1, explain: `${explain} Sama aine voi olla yhdessä reaktiossa lähtöaine ja toisessa tuote.`,
      });
    }
    const role = phase === 'guided' ? 'product' : 'reactant';
    const right = all.filter(x => x.role === role)[0]!, wrong = all.filter(x => x.role !== role);
    return askChoice(full, context, {
      say: role === 'product' ? 'Mikä aine on tämän reaktion reaktiotuote eli syntyy reaktiossa?' : 'Mikä aine on tämän reaktion lähtöaine eli reagoi ja kuluu?', scene,
      choices: [{ text: `${nm(right.s)} ${sub(right.s.formula)}` }, ...wrong.map(x => ({ text: `${nm(x.s)} ${sub(x.s.formula)}`, why: x.role === 'reactant' ? `${cap(nm(x.s))} on mukana alussa: se on lähtöaine.` : `${cap(nm(x.s))} syntyy reaktiossa: se on reaktiotuote.` }))],
      correct: 0, explain,
    });
  }

  if (task.mode === 'conservation') {
    const recipe = reactionRecipe(task.recipe)!, answer = solutionReactionLab(task);
    if (answer.mode !== 'conservation') return null;
    const start = reactionMaterialState(recipe, task.groups, 0, task.massScaleMg, { open: false, gasFormula: task.boundary.gasFormula, escapedGroups: 0 }, [], task.outsideInitialGroups)!;
    // Only the reaction vessel is weighed; a collecting jar may already hold gas, so the whole system is not the question.
    const total = start.insideMassMg, inside = Number(answer.inside), escaped = total - inside;
    const names = `${list(recipe.reactants.map(s => nm(s)))} ${recipe.reactants.length > 1 ? 'reagoivat' : 'hajoaa'}, ja syntyy ${list(recipe.products.map(s => nm(s)))}`;
    if (task.boundary.open && escaped > 0) {
      const gas = recipe.products.find(s => s.formula === task.boundary.gasFormula)?.name.replace(/n (hilayksikkö|mallitoistoyksikkö)$/, '') ?? 'kaasu';
      return askNumber(full, {
        say: `Astia on auki. ${cap(names)}. ${cap(gas)} on kaasua, ja sitä karkaa astiasta ${escaped} mg. Mitä vaaka näyttää lopussa?`,
        unit: 'mg', answer: inside, scene: scalePicture(start.insideMassMg, '? mg', true), afterCorrect: scalePicture(start.insideMassMg, `${inside} mg`, true),
        whyAt: { [start.insideMassMg]: `Astia on auki. Karannut ${gas} vie massaansa mukanaan.`, [start.insideMassMg + escaped]: 'Massaa ei tule lisää. Karannut kaasu vähentää vaa’an lukemaa.' },
        explain: `${start.insideMassMg} mg − ${escaped} mg = ${inside} mg. Massa ei katoa: karannut ${gas} painaa ${escaped} mg astian ulkopuolella. Yhteensä massaa on yhä ${total} mg.`,
      });
    }
    const explain = `Suljetussa astiassa atomit vain järjestyvät uudelleen. Mitään ei tule lisää eikä lähde pois, joten massa pysyy samana: ${total} mg.`;
    if (phase === 'guided') {
      return askChoice(full, context, {
        say: `Astia on suljettu. ${cap(names)}. Miten vaa'an lukema muuttuu?`, ordered: true,
        scene: scalePicture(start.insideMassMg, '? mg', false), afterCorrect: scalePicture(total, `${total} mg`, false),
        choices: [
          { text: 'Kasvaa', why: 'Astiaan ei tule mitään lisää.' },
          { text: 'Pysyy samana' },
          { text: 'Pienenee', why: 'Syntyvä kaasu jää suljettuun astiaan, ja sekin painaa.' },
        ],
        correct: 1, explain,
      });
    }
    return askNumber(full, {
      say: `Astia on suljettu. ${cap(names)}. Alussa vaaka näyttää ${start.insideMassMg} mg. Mitä vaaka näyttää reaktion jälkeen?`, unit: 'mg', answer: total,
      scene: scalePicture(start.insideMassMg, '? mg', false), afterCorrect: scalePicture(total, `${total} mg`, false), explain,
    });
  }

  if (task.mode === 'rearrange') {
    const recipe = reactionRecipe(task.recipe)!, groups = task.groups;
    const scene = atomsPicture(recipe.reactants, recipe.products, groups);
    const count: Record<string, number> = {};
    for (const s of recipe.reactants) for (const [el, n] of Object.entries(parseChemicalFormula(s.formula)?.atoms ?? {})) count[el] = (count[el] ?? 0) + (n ?? 0) * s.coefficient * groups;
    const elements = Object.keys(count);
    const NAME: Record<string, string> = { H: 'vetyatomia (H)', O: 'happiatomia (O)', C: 'hiiliatomia (C)', N: 'typpiatomia (N)', Mg: 'magnesiumatomia (Mg)', Ca: 'kalsiumatomia (Ca)' };
    const explain = `Reaktiossa samat atomit järjestyvät uusiksi molekyyleiksi. Atomeja ei synny eikä katoa: ${elements.map(el => `${el} ${count[el]}`).join(', ')} sekä alussa että lopussa.`;
    if (phase === 'guided') {
      return askChoice(full, context, {
        say: 'Pallot ovat atomeja. Miten atomien määrä muuttuu reaktiossa?', scene, ordered: true,
        choices: [{ text: 'Atomeja tulee lisää', why: 'Uusia atomeja ei synny. Samat atomit vain liittyvät toisiinsa uudella tavalla.' }, { text: 'Atomeja on yhtä monta' }, { text: 'Atomeja katoaa', why: 'Atomit eivät katoa. Ne siirtyvät uusiin molekyyleihin.' }],
        correct: 1, explain,
      });
    }
    const el = phase === 'transfer' ? elements.reduce((a, b) => (count[b]! > count[a]! ? b : a)) : elements[context.r.int(0, elements.length - 1)]!;
    const molecules = recipe.products.filter(s => (parseChemicalFormula(s.formula)?.atoms as Record<string, number> | undefined)?.[el]).reduce((sum, s) => sum + s.coefficient * groups, 0);
    return askNumber(full, {
      say: `Pallot ovat atomeja. Montako ${NAME[el] ?? `${el}-atomia`} on lopussa yhteensä?`, answer: count[el]!, scene,
      whyAt: molecules !== count[el] ? { [molecules]: 'Tämä on molekyylien määrä. Laske atomit eli pallot.' } : undefined, explain,
    });
  }

  if (task.mode === 'energy') {
    const c = pick(task.cases), recipe = reactionRecipe(c.recipe)!, net = c.extents * recipe.netEnergy;
    const exo = net < 0, amount = Math.abs(net), eq = `${list(recipe.reactants.map(s => nm(s)))} → ${list(recipe.products.map(s => nm(s)))}`;
    const explain = exo
      ? `Reaktio luovuttaa ${amount} yksikköä energiaa ympäristöön, ja ympäristö lämpenee. Energiaa luovuttava reaktio on eksoterminen.`
      : `Reaktio sitoo ${amount} yksikköä energiaa ympäristöstä, ja ympäristö viilenee. Energiaa sitova reaktio on endoterminen.`;
    if (phase === 'transfer') {
      const after = c.surroundingsBefore - net;
      return askNumber(full, {
        say: `Reaktiossa ${eq}. Ympäristössä on alussa ${c.surroundingsBefore} energiayksikköä. Paljonko ympäristössä on energiaa reaktion jälkeen?`,
        answer: after, scene: energyPicture(net, c.surroundingsBefore),
        whyAt: { [c.surroundingsBefore + net]: exo ? 'Nuoli osoittaa ympäristöön: ympäristö saa energiaa.' : 'Nuoli osoittaa ympäristöstä pois: ympäristö menettää energiaa.' },
        explain: `${c.surroundingsBefore} ${exo ? '+' : '−'} ${amount} = ${after}. ${explain} Energiaa ei katoa, se vain siirtyy.`,
      });
    }
    return askChoice(full, context, {
      say: `Reaktiossa ${eq}. Kuva näyttää, mihin suuntaan energiaa siirtyy. Onko reaktio eksoterminen vai endoterminen?`, scene: energyPicture(net), ordered: true,
      choices: [
        { text: 'Eksoterminen: luovuttaa energiaa', why: exo ? undefined : 'Nuoli osoittaa ympäristöstä reaktioon: reaktio sitoo energiaa.' },
        { text: 'Endoterminen: sitoo energiaa', why: exo ? 'Nuoli osoittaa reaktiosta ympäristöön: reaktio luovuttaa energiaa.' : undefined },
      ],
      correct: exo ? 0 : 1, explain,
    });
  }

  if (task.mode === 'rate') {
    const [a, b] = task.initial, answer = solutionReactionLab(task);
    if (answer.mode !== 'rate') return null;
    const setup = card([['Koe A', setting(a)], ['Koe B', setting(b)]]);
    if (task.givenReadings) {
      const [dA, dB] = answer.delta.map(Number) as [number, number], time = Number(answer.duration);
      const product = reactionRecipe(task.model.recipe)!.products.find(s => s.formula === task.model.product)!;
      const rows: [string, string][] = [['Koe A', setting(a)], ['Koe B', setting(b)], [`A: tuotetta syntyi ${time} sekunnissa`, `${dA} mg`], [`B: tuotetta syntyi ${time} sekunnissa`, `${dB} mg`]];
      const yieldOf = (c: ReactionConfiguration) => reactionFormulaMass(product.formula)! * product.coefficient * c.extentLimit * task.massScaleMg;
      if (phase === 'transfer' && a.extentLimit !== b.extentLimit) {
        const more = yieldOf(a) > yieldOf(b) ? 0 : 1;
        return askChoice(full, context, {
          say: `B on nopeampi, mutta kokeissa on eri määrä kiinteää lähtöainetta: A ${a.extentLimit} osaa, B ${b.extentLimit} osaa. Kummassa syntyy lopulta enemmän tuotetta, kun reaktio on päättynyt?`,
          scene: card([...rows, ['Lähtöainetta A / B', `${a.extentLimit} / ${b.extentLimit} osaa`]]), ordered: true,
          choices: [{ text: 'Kokeessa A', why: more === 0 ? undefined : 'B:ssä on enemmän lähtöainetta, joten siitä riittää enemmän tuotetta.' }, { text: 'Kokeessa B', why: more === 1 ? undefined : 'Nopeus ei ratkaise loppumäärää. A:ssa on enemmän lähtöainetta.' }, { text: 'Yhtä paljon', why: 'Lähtöaineen määrät ovat eri suuret.' }],
          correct: more,
          explain: `Nopeus kertoo, kuinka nopeasti tuotetta syntyy. Lopullinen määrä riippuu lähtöaineen määrästä: A ${yieldOf(a)} mg, B ${yieldOf(b)} mg. Nopeampi reaktio ei siis aina tuota eniten.`,
        });
      }
      if (phase === 'guided') {
        const right = dB > dA ? 1 : dB < dA ? 0 : 2;
        return askChoice(full, context, {
          say: `Kummassa kokeessa reaktio on nopeampi? Vertaa, paljonko tuotetta syntyy samassa ajassa.`, scene: card(rows), ordered: true,
          choices: [{ text: 'Kokeessa A', why: right === 2 ? 'Kumpikin tuottaa samassa ajassa yhtä paljon.' : 'A tuottaa samassa ajassa vähemmän.' }, { text: 'Kokeessa B', why: right === 2 ? 'Kumpikin tuottaa samassa ajassa yhtä paljon.' : 'B tuottaa samassa ajassa vähemmän.' }, { text: 'Yhtä nopeita', why: 'Tuotetta syntyi eri määrä samassa ajassa.' }],
          correct: right, explain: `Samassa ajassa (${time} s) A tuottaa ${dA} mg ja B ${dB} mg. Nopeampi reaktio tuottaa samassa ajassa enemmän tuotetta.`,
        });
      }
      return askNumber(full, {
        say: `Reaktionopeus kertoo, paljonko tuotetta syntyy sekunnissa. Mikä on kokeen B reaktionopeus?`, scene: card(rows), unit: 'mg/s', answer: dB / time, tolerance: 0.01,
        whyAt: { [dB]: `Tämä on koko tuotteen määrä. Jaa se ajalla ${time} s.`, [time / dB]: 'Jako on väärin päin: tuotteen määrä jaetaan ajalla.' },
        explain: `${dB} mg : ${time} s = ${fi(dB / time)} mg/s. Joka sekunti syntyy keskimäärin ${fi(dB / time)} mg tuotetta.`,
      });
    }
    const target = answer.plan?.factor ?? task.allowedFactors[0]!, plan = answer.plan?.configurations;
    const changed = differs(a, b);
    if (task.activity === 'repair-confound' && changed.length > 1) {
      const others = changed.filter(f => f !== target);
      if (phase === 'guided') {
        return askChoice(full, context, {
          say: `Halutaan tietää, miten ${FACTOR_NAME[target]} vaikuttaa reaktion nopeuteen. B reagoi nopeammin kuin A. Voiko tästä päätellä ${FACTOR_OF[target]} vaikutuksen?`,
          scene: setup, ordered: true,
          choices: [
            { text: 'Ei: kokeissa muuttui monta asiaa yhtä aikaa' },
            { text: `Kyllä: ${FACTOR_NAME[target]} on eri`, why: `Myös ${list(others.map(f => FACTOR_NAME[f]))} ${others.length > 1 ? 'ovat erilaiset' : 'on erilainen'}. Ei tiedetä, mikä muutos nopeutti.` },
            { text: 'Kyllä, jos koe toistetaan samalla tavalla', why: 'Toisto ei auta, jos kokeissa eroaa yhä monta asiaa.' },
          ],
          correct: 0, explain: `Reilussa vertailussa muutetaan vain yhtä asiaa. Nyt muuttui ${list(changed.map(f => FACTOR_NAME[f]))}, joten ei tiedetä, mikä niistä nopeutti reaktiota.`,
        });
      }
      return askChoice(full, context, {
        say: `Halutaan tutkia vain ${FACTOR_OF[target]} vaikutusta. Mitä kokeessa B pitää muuttaa, jotta vertailu on reilu?`, scene: setup,
        choices: [
          { text: `Sama ${list(others.map(f => backTo(f, a)))} kuin A:ssa` },
          { text: `Sama ${backTo(target, a)} kuin A:ssa`, why: `Silloin juuri tutkittava ${FACTOR_NAME[target]} ei enää eroa.` },
          { text: 'Ei mitään: vertailu on jo reilu', why: `Kokeissa eroaa nyt ${list(changed.map(f => FACTOR_NAME[f]))}.` },
        ],
        correct: 0, explain: `Kun vain ${FACTOR_NAME[target]} eroaa, nopeuden ero johtuu siitä. ${WHY_FASTER[target]}`,
      });
    }
    const [p, q] = plan ?? [a, b];
    const right = answer.relation === 'faster' ? 0 : answer.relation === 'same' ? 1 : 2;
    return askChoice(full, context, {
      say: `Kokeessa B ${changeText(target, p!, q!)}. Kaikki muu pysyy samana. Miten reaktion nopeus muuttuu?`, scene: card([['Koe A', setting(p!)], ['Koe B', setting(q!)]]), ordered: true,
      choices: ['Nopeutuu', 'Pysyy samana', 'Hidastuu'].map((text, i) => ({ text, why: i === right ? undefined : right === 0 ? 'Muutos lisää hiukkasten törmäyksiä.' : right === 2 ? 'Muutos vähentää hiukkasten törmäyksiä.' : 'Tämä muutos ei tässä mallissa muuta törmäyksiä.' })),
      correct: right, explain: right === 2 ? `${WHY_FASTER[target]} Päinvastainen muutos hidastaa reaktiota.` : WHY_FASTER[target],
    });
  }
  return null;
};
