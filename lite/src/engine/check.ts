import { checkDecimalLedger, solutionDecimalLedger, wrongDecimalLedgerResponses } from '../content/models/decimal-ledger';
import { checkLifecycleHarbor, solutionLifecycleHarbor, wrongLifecycleHarborResponses } from '../content/models/lifecycle-harbor';
import { checkReactionLab, solutionReactionLab, wrongReactionLabResponses } from '../content/models/reaction-lab';
import { checkMatterCycles, solutionMatterCycles, wrongMatterCyclesResponses } from '../content/models/matter-cycles';
import { checkInquiryIslands, solutionInquiryIslands, wrongInquiryIslandsResponses } from '../content/models/inquiry-islands';
import { checkCarbonKitchen, solutionCarbonKitchen, wrongCarbonKitchenResponses } from '../content/models/carbon-kitchen';
import { checkAtomicWorld, solutionAtomicWorld, wrongAtomicWorldResponses } from '../content/models/atomic-world';
import { checkSafetyHarbor, solutionSafetyHarbor, wrongSafetyHarborResponses } from '../content/models/safety-harbor';
import { checkWavesObservatory, solutionWavesObservatory, wrongWavesObservatoryResponses } from '../content/models/waves-observatory';
import { checkSolutionLab, solutionSolutionLab, wrongSolutionLabResponses } from '../content/models/solution-lab';
import { checkLogicWorkshop, solutionLogicWorkshop, wrongLogicWorkshopResponses } from '../content/models/logic-workshop';
import { checkChemicalInvestigation, solutionChemicalInvestigation, wrongChemicalInvestigationResponses } from '../content/models/chemical-investigation';
import { checkPhysicsInvestigation, solutionPhysicsInvestigation, wrongPhysicsInvestigationResponses } from '../content/models/physics-investigation';
import { checkMaterialsMixtures, solutionMaterialsMixtures, wrongMaterialsMixturesResponses } from '../content/models/materials-mixtures';
import { checkChemicalNotation, solutionChemicalNotation, wrongChemicalNotationResponses } from '../content/models/chemical-notation';
import { checkPlaneMeasures, solutionPlaneMeasures, wrongPlaneMeasuresResponses } from '../content/models/plane-measures';
import { checkAlgorithmStudio, solutionAlgorithmStudio, wrongAlgorithmStudioResponses } from '../content/models/algorithm-studio';
import { checkNumberEquivalences, solutionNumberEquivalences, wrongNumberEquivalencesResponses } from '../content/models/number-equivalences';
import { checkEnergyIslands, solutionEnergyIslands, wrongEnergyIslandsResponses } from '../content/models/energy-islands';
import { checkAdvancedSolids, solutionAdvancedSolids, wrongAdvancedSolidsResponses } from '../content/models/advanced-solids';
import { checkFunctionGarden, solutionFunctionGarden, wrongFunctionGardenResponses } from '../content/models/function-garden';
import { checkCircuitWorkshop, solutionCircuitWorkshop, wrongCircuitWorkshopResponses } from '../content/models/circuit-workshop';
import { checkCircleObservatory, solutionCircleObservatory, wrongCircleObservatoryResponses } from '../content/models/circle-observatory';
import { checkRightTriangle, solutionRightTriangle, wrongRightTriangleResponses } from '../content/models/right-triangle';
import { checkRelationWorkshop, solutionRelationWorkshop, wrongRelationWorkshopResponses } from '../content/models/relation-workshop';
import { checkElectricityHarbor, solutionElectricityHarbor, wrongElectricityHarborResponses } from '../content/models/electricity-harbor';
import { checkStatisticsHarbor, solutionStatisticsHarbor, wrongStatisticsHarborResponses } from '../content/models/statistics-harbor';
import { checkGeometryRelations, solutionGeometryRelations, wrongGeometryRelationsResponses } from '../content/models/geometry-relations';
import { checkThermalStation, solutionThermalStation, wrongThermalStationResponses } from '../content/models/thermal-station';
import { checkRootWorkshop, solutionRootWorkshop, wrongRootWorkshopResponses } from '../content/models/root-workshop';
import { checkProgrammingFerry, solutionProgrammingFerry, wrongProgrammingFerryResponses } from '../content/models/programming-ferries';
import { checkDataProbability, solutionDataProbability, wrongDataProbabilityResponses } from '../content/models/data-probability';
import { checkMeasurementStation, solutionMeasurementStation, wrongMeasurementStationResponses } from '../content/models/measurement-station';
import { checkSpatialMeasure, solutionSpatialMeasure, wrongSpatialMeasureResponses } from '../content/models/spatial-measures';
import { checkNumberJourney, solutionNumberJourney, wrongNumberJourneyResponses } from '../content/models/number-journey';
import { checkArithmeticReasoning, solutionArithmeticReasoning, wrongArithmeticReasoningResponses } from '../content/models/arithmetic-reasoning';
import { checkSolidConstruction, solutionSolidConstruction, wrongSolidConstructionResponses } from '../content/models/solid-construction';
import { checkPowerRule, solutionPowerRule, wrongPowerRuleResponses } from '../content/models/power-rules';
import { checkSolidWorkshop, solutionSolidWorkshop, wrongSolidWorkshopResponses } from '../content/models/solid-workshop';
import { checkCake, solutionCake, wrongCakeResponses } from '../content/fractions/cake-table';
import { checkFractionSubtract, solutionFractionSubtract, wrongFractionSubtract } from '../content/models/fraction-workshop';
import { checkSpaceDay, solutionSpaceDay, wrongSpaceDay } from '../content/models/space-observatory';
import { checkWorkshopPolynomial } from '../content/models/polynomial-workshop';
import { checkRationalLink, solutionRationalLink, wrongRationalLinkResponses } from '../content/models/rational-links';
import { checkEquationWorkshop, solutionEquationWorkshop, wrongEquationWorkshopResponses } from '../content/models/equation-workshop';
import { checkObservedExplanation, solutionObservedExplanation, wrongObservedExplanationResponses } from '../content/models/observed-explanations';
import { checkSailShape, solutionSailShape, wrongSailShapeResponses } from '../content/models/sail-shapes';
import { checkProblemWorkbench, solutionProblemWorkbench, wrongProblemWorkbenchResponses } from '../content/models/problem-workbench';
import { sameEquation, sameExpr, sameFact } from './expr';
import type { Response, Task, Verdict } from './types';

const sameSet = (a: number[], b: number[]) => a.length === b.length && [...a].sort().join() === [...b].sort().join();

export function ribbonAnswer(t: { a: number; b: number }): 'A' | 'B' | '=' {
  return t.a > t.b ? 'A' : t.b > t.a ? 'B' : '=';
}

/** Why a ribbon answer was wrong: the usual trap is an end that sticks out because it starts later. */
function ribbonWhy(t: { a: number; b: number; offsetA: number; offsetB: number }, c: 'A' | 'B' | '='): string {
  const name = { A: 'Punainen', B: 'Sininen' } as const;
  if (c === '=') return 'Nauhat eivät ole yhtä pitkät. Siirrä alkupäät samaan kohtaan: toinen jatkuu pidemmälle.';
  if (t.a === t.b) return 'Kun alkupäät ovat samassa kohdassa, loppupäätkin ovat kohdakkain: nauhat ovat yhtä pitkät.';
  const len = c === 'A' ? t.a : t.b, end = len + (c === 'A' ? t.offsetA : t.offsetB);
  const other = c === 'A' ? t.b + t.offsetB : t.a + t.offsetA;
  return end > other
    ? `${name[c]} ulottuu pidemmälle vain siksi, että se alkaa myöhemmin. Siirrä alkupäät samaan kohtaan ja vertaa vasta sitten.`
    : `${name[c]} on lyhyempi. Kun alkupäät ovat samassa kohdassa, toinen jatkuu pidemmälle.`;
}

/** Is this response correct for this task? The only place correctness is decided. */
export function check(task: Task, r: Response): Verdict {
  if (task.kind !== r.kind) return { ok: false };
  switch (task.kind) {
    case 'cake': return checkCake(task, r as Extract<Response, { kind: 'cake' }>);
    case 'fraction-subtract': return checkFractionSubtract(task, r as Extract<Response, { kind: 'fraction-subtract' }>);
    case 'space-day': return checkSpaceDay(task, r as Extract<Response, { kind: 'space-day' }>);
    case 'rational-link': return checkRationalLink(task, r as Extract<Response, { kind: 'rational-link' }>);
    case 'equation-workshop': return checkEquationWorkshop(task, r as Extract<Response, { kind: 'equation-workshop' }>);
    case 'observed-explanation': return checkObservedExplanation(task, r as Extract<Response, { kind: 'observed-explanation' }>);
    case 'sail-shapes': return checkSailShape(task, r as Extract<Response, { kind: 'sail-shapes' }>);
    case 'problem-workbench': return checkProblemWorkbench(task, r as Extract<Response, { kind: 'problem-workbench' }>);
    case 'solid-workshop': return checkSolidWorkshop(task, r as Extract<Response, { kind: 'solid-workshop' }>);
    case 'solid-construction': return checkSolidConstruction(task, r as Extract<Response, { kind: 'solid-construction' }>);
    case 'power-rules': return checkPowerRule(task, r as Extract<Response, { kind: 'power-rules' }>);
    case 'arithmetic-reasoning': return checkArithmeticReasoning(task, r as Extract<Response, { kind: 'arithmetic-reasoning' }>);
    case 'number-journey': return checkNumberJourney(task, r as Extract<Response, { kind: 'number-journey' }>);
    case 'measurement-station': return checkMeasurementStation(task, r as Extract<Response, { kind: 'measurement-station' }>);
    case 'data-probability': return checkDataProbability(task, r as Extract<Response, { kind: 'data-probability' }>);
    case 'programming-ferries': return checkProgrammingFerry(task, r as Extract<Response, { kind: 'programming-ferries' }>);
    case 'root-workshop': return checkRootWorkshop(task, r as Extract<Response, { kind: 'root-workshop' }>);
    case 'geometry-relations': return checkGeometryRelations(task, r as Extract<Response, { kind: 'geometry-relations' }>);
    case 'statistics-harbor': return checkStatisticsHarbor(task, r as Extract<Response, { kind: 'statistics-harbor' }>);
    case 'electricity-harbor': return checkElectricityHarbor(task, r as Extract<Response, { kind: 'electricity-harbor' }>);
    case 'right-triangle': return checkRightTriangle(task, r as Extract<Response, { kind: 'right-triangle' }>);
    case 'circle-observatory': return checkCircleObservatory(task, r as Extract<Response, { kind: 'circle-observatory' }>);
    case 'circuit-workshop': return checkCircuitWorkshop(task, r as Extract<Response, { kind: 'circuit-workshop' }>);
    case 'physics-investigation': return checkPhysicsInvestigation(task, r as Extract<Response, { kind: 'physics-investigation' }>);
    case 'materials-mixtures': return checkMaterialsMixtures(task, r as Extract<Response, { kind: 'materials-mixtures' }>);
    case 'chemical-notation': return checkChemicalNotation(task, r as Extract<Response, { kind: 'chemical-notation' }>);
    case 'solution-lab': return checkSolutionLab(task, r as Extract<Response, { kind: 'solution-lab' }>);
    case 'logic-workshop': return checkLogicWorkshop(task, r as Extract<Response, { kind: 'logic-workshop' }>);
    case 'chemical-investigation': return checkChemicalInvestigation(task, r as Extract<Response, { kind: 'chemical-investigation' }>);
    case 'waves-observatory': return checkWavesObservatory(task, r as Extract<Response, { kind: 'waves-observatory' }>);
    case 'decimal-ledger': return checkDecimalLedger(task, r as Extract<Response, {kind:'decimal-ledger'}>);
    case 'lifecycle-harbor': return checkLifecycleHarbor(task, r as Extract<Response, { kind: 'lifecycle-harbor' }>);
    case 'reaction-lab': return checkReactionLab(task, r as Extract<Response, { kind: 'reaction-lab' }>);
    case 'matter-cycles': return checkMatterCycles(task, r as Extract<Response, { kind: 'matter-cycles' }>);
    case 'inquiry-islands': return checkInquiryIslands(task, r);
    case 'carbon-kitchen': return checkCarbonKitchen(task, r as Extract<Response, { kind: 'carbon-kitchen' }>);
    case 'atomic-world': return checkAtomicWorld(task, r as Extract<Response, { kind: 'atomic-world' }>);
    case 'safety-harbor': return checkSafetyHarbor(task, r as Extract<Response, { kind: 'safety-harbor' }>);
    case 'plane-measures': return checkPlaneMeasures(task, r as Extract<Response, { kind: 'plane-measures' }>);
    case 'algorithm-studio': return checkAlgorithmStudio(task, r as Extract<Response, { kind: 'algorithm-studio' }>);
    case 'number-equivalences': return checkNumberEquivalences(task, r as Extract<Response, { kind: 'number-equivalences' }>);
    case 'function-garden': return checkFunctionGarden(task, r as Extract<Response, { kind: 'function-garden' }>);
    case 'advanced-solids': return checkAdvancedSolids(task, r as Extract<Response, { kind: 'advanced-solids' }>);
    case 'energy-islands': return checkEnergyIslands(task, r as Extract<Response, { kind: 'energy-islands' }>);
    case 'relation-workshop': return checkRelationWorkshop(task, r as Extract<Response, { kind: 'relation-workshop' }>);
    case 'thermal-station': return checkThermalStation(task, r as Extract<Response, { kind: 'thermal-station' }>);
    case 'spatial-measures': return checkSpatialMeasure(task, r as Extract<Response, { kind: 'spatial-measures' }>);
    case 'choice': {
      const i = (r as Extract<Response, { kind: 'choice' }>).index;
      return i === task.answer ? { ok: true } : { ok: false, why: task.why?.[i] };
    }
    case 'multi': {
      const ix = (r as Extract<Response, { kind: 'multi' }>).indices;
      if (task.count !== undefined) {
        const got = new Set(ix).size;
        if (got === task.count && ix.length === task.count) return { ok: true };
        return { ok: false, why: got > task.count ? `Valitsit ${got}, se on liian monta. Laske uudelleen ja pysähdy luvussa ${task.count}.` : `Valitsit ${got}, se on liian vähän. Jatka laskemista lukuun ${task.count} asti.` };
      }
      if (sameSet(ix, task.answer)) return { ok: true };
      const off = task.options.findIndex((_, i) => ix.includes(i) !== task.answer.includes(i));
      return { ok: false, why: off >= 0 ? task.why?.[off] : undefined };
    }
    case 'tapcount': {
      const { taps, count } = r as Extract<Response, { kind: 'tapcount' }>;
      const n = task.objects.length;
      const twice = new Set(taps).size < taps.length;
      const unmarked = new Set(taps.filter((i) => i >= 0 && i < n)).size < n;
      const marked = !twice && !unmarked;
      // Wording describes what was tapped, never what the child counted in their head.
      const markWhy = twice ? 'Napautit yhtä esinettä kahdesti.' : unmarked ? 'Yksi esine jäi merkitsemättä.' : '';
      if (!task.ask) return marked ? { ok: true, proc: true } : { ok: false, proc: false, why: markWhy };
      const math = count === n;
      if (task.mode !== 'marking') {
        // Direct total: marks are optional and never judged.
        const off = count === undefined ? '' : count > n ? 'Luku on liian suuri: joku esine tuli ehkä laskettua kahdesti. ' : 'Luku on liian pieni: joku esine jäi ehkä laskematta. ';
        return math ? { ok: true, math } : { ok: false, math, why: `${off}Voit merkitä esineitä napauttamalla, niin näet, mitkä on jo laskettu.` };
      }
      if (math && marked) return { ok: true, math, proc: true };
      if (math) return { ok: false, math, proc: false, why: `Lukumäärä ${n} on oikein. Tässä harjoituksessa merkitään vielä jokainen esine napauttamalla kerran. ${markWhy}` };
      return { ok: false, math, proc: marked, why: `${markWhy ? `${markWhy} ` : ''}Kokonaismäärä ei ole vielä oikein.` };
    }
    case 'place': {
      const map = (r as Extract<Response, { kind: 'place' }>).map;
      const wrong = Object.keys(task.answer).find((s) => (map[s] ?? null) !== task.answer[s]);
      return wrong === undefined ? { ok: true } : { ok: false, why: task.why?.[wrong] };
    }
    case 'ribbons': {
      const c = (r as Extract<Response, { kind: 'ribbons' }>).choice;
      return c === ribbonAnswer(task) ? { ok: true } : { ok: false, why: ribbonWhy(task, c) };
    }
    case 'numeric': {
      const v = (r as Extract<Response, { kind: 'numeric' }>).value;
      const ok = Number.isFinite(v) && Math.abs(v - task.answer) <= (task.tolerance ?? 1e-9);
      return ok ? { ok } : { ok, why: task.whyAt?.[v] };
    }
    case 'plot': {
      const pts = (r as Extract<Response, { kind: 'plot' }>).points;
      const want = task.xs.map((x, i) => `${x},${task.ys[i]}`);
      const got = new Set(pts.map(([x, y]) => `${x},${y}`));
      if (got.size === want.length && want.every((w) => got.has(w))) return { ok: true };
      if (got.size !== want.length) return { ok: false, why: `Merkitse ${want.length} ${want.length === 1 ? 'piste' : 'pistettä'}. Nyt merkittyjä on ${got.size}.` };
      const miss = want.filter((w) => !got.has(w)), extra = [...got].filter((g) => !want.includes(g));
      const flip = (k: string) => k.split(',').reverse().join(',');
      if (miss.some((m) => extra.includes(flip(m)))) return { ok: false, why: 'Piste on väärin päin: ensimmäinen luku kertoo vaakasuunnan (x), toinen pystysuunnan (y).' };
      if (miss.length === 1) {
        const [wx, wy] = miss[0]!.split(','), [gx, gy] = extra[0]!.split(',');
        if (wy === gy) return { ok: false, why: 'Pystysuunta on oikein, mutta vaakasuunta (x) ei. Laske vaakasuunnan askeleet uudelleen.' };
        if (wx === gx) return { ok: false, why: 'Vaakasuunta on oikein, mutta pystysuunta (y) ei. Laske pystysuunnan askeleet uudelleen.' };
      }
      return { ok: false, why: 'Lähde nollasta: ensin vaakasuunnassa x askelta, sitten pystysuunnassa y askelta.' };
    }
    case 'line': {
      const v = (r as Extract<Response, { kind: 'line' }>).value;
      return { ok: Math.abs(v - task.answer) < 1e-9, why: task.whyAt?.[v] ?? (Math.abs(v + task.answer) < 1e-9 && task.answer !== 0 ? 'Merkki on väärin päin: miinusluvut ovat nollan vasemmalla puolella.' : undefined) };
    }
    case 'build': {
      const src = (r as Extract<Response, { kind: 'build' }>).seq.join(' ');
      if (task.mode === 'seq') {
        const want = task.target.split(' '), got = src ? src.split(' ') : [];
        if (src === task.target) return { ok: true };
        if (task.whyAt?.[src]) return { ok: false, why: task.whyAt[src] };
        const k = want.findIndex((w, i) => got[i] !== w);
        const why = k < 0 ? `Lopussa on ylimääräinen sana: ${got[want.length]}.`
          : got[k] === undefined ? `Jatka vielä: seuraavaksi tulee ${want[k]}.`
          : got.includes(want[k]!) ? `Kohdassa ${k + 1} pitäisi olla ${want[k]}. Järjestys meni sekaisin.`
          : `${want[k]![0]!.toUpperCase()}${want[k]!.slice(1)} jäi välistä.`;
        return { ok: false, why };
      }
      // Explicit workshop output forms retain exact coefficients and procedural
      // evidence; ordinary symbolic tasks keep their established equivalence rule.
      if (task.mode === 'expr' && task.polynomial) return checkWorkshopPolynomial(task.polynomial, task.target, src, task.whyAt?.[src]);
      const ok = task.mode === 'expr' ? sameExpr(src, task.target) : task.mode === 'eq' ? sameEquation(src, task.target) : sameFact(src, task.target);
      // An equation must be formed from the situation's numbers, not solved first (x = 5).
      const nums = (x: string): string[] => x.match(/\d+(,\d+)?/g) ?? [];
      const missingNum = task.mode === 'eq' && nums(task.target).some((n) => !nums(src).includes(n));
      const missingGiven = task.requiredNumbers?.some(n => !nums(src).includes(String(n))) ?? false;
      if (ok && missingGiven) return { ok: false, math: true, proc: false, why: 'Luku vastaa tulosta. Rakenna tässä tehtävässä myös lasku, jossa käytät annettua lähtömäärää ja prosenttilukua.' };
      if (ok && !missingNum) return { ok };
      if (missingNum && ok) return { ok: false, why: 'Rakenna yhtälö tilanteen luvuista. Sitä ei tarvitse vielä ratkaista.' };
      if (task.whyAt?.[src]) return { ok: false, why: task.whyAt[src] };
      const eqs = (src.match(/=/g) ?? []).length;
      const why = task.mode === 'expr' && eqs ? 'Lausekkeessa ei ole yhtäsuuruusmerkkiä.'
        : task.mode !== 'expr' && eqs !== 1 ? 'Yhtälössä on yksi yhtäsuuruusmerkki: vasen puoli = oikea puoli.'
        : undefined;
      return { ok: false, why };
    }
    case 'tally': {
      const c = (r as Extract<Response, { kind: 'tally' }>).counts;
      const off = task.cats.find((k) => (c[k.key] ?? 0) !== task.items.filter((x) => x === k.key).length);
      if (!off) return { ok: true };
      const want = task.items.filter((x) => x === off.key).length, got = c[off.key] ?? 0;
      return { ok: false, why: `${off.label}: havaintoja on ${want}, merkkejä ${got}. Käy havainnot läpi yksi kerrallaan.` };
    }
    case 'combos': {
      const pairs = (r as Extract<Response, { kind: 'combos' }>).pairs;
      const keys = pairs.map(([i, j]) => `${i},${j}`);
      if (new Set(keys).size < keys.length) return { ok: false, why: 'Sama yhdistelmä on listassa kahdesti.' };
      const missing = task.a.length * task.b.length - new Set(keys).size;
      return missing === 0 ? { ok: true } : { ok: false, why: `Listasta puuttuu ${missing === 1 ? 'yksi yhdistelmä' : `${missing} yhdistelmää`}. Pidä yksi ${task.aLabel} paikallaan ja käy läpi kaikki ${task.bLabel}.` };
    }
    case 'clock': {
      const { h, m } = r as Extract<Response, { kind: 'clock' }>;
      const H = (x: number) => ((x % 12) + 12) % 12;
      if (H(h) === H(task.h) && m === task.m) return { ok: true };
      if (H(h) === H(task.h)) return { ok: false, why: task.m === 30 ? 'Pitkän viisarin pitää osoittaa alas kuuteen: puoli tuntia.' : 'Tasatunnilla pitkä viisari osoittaa ylös kahteentoista.' };
      if (task.m === 30 && m === 30 && H(h) === H(task.h + 1)) return { ok: false, why: `Puoli tarkoittaa puolta tuntia ennen seuraavaa tasaa: lyhyt viisari kuuluu lukujen ${H(task.h) || 12} ja ${H(task.h + 1) || 12} väliin.` };
      return { ok: false, why: 'Lyhyt viisari näyttää väärää tuntia.' };
    }
    case 'stack': {
      const n = (r as Extract<Response, { kind: 'stack' }>).n, want = task.a * task.k;
      if (n === want) return { ok: true };
      if (n === task.a + task.k) return { ok: false, why: `Torni on Aavan torni ja vielä ${task.k} palikkaa (${task.a} + ${task.k}). ${task.k} kertaa niin korkea tarkoittaa ${task.k} Aavan tornia päällekkäin: ${want}.` };
      return { ok: false, why: n % task.a === 0 ? `Tornissa on Aavan torni ${n / task.a} kertaa. Tarvitaan ${task.k} kertaa.` : `Viimeinen Aavan torni jäi vajaaksi: jokaisessa osassa pitää olla ${task.a}.` };
    }
    case 'grid': {
      const { rows, cols } = r as Extract<Response, { kind: 'grid' }>, A = task.rows, B = task.cols;
      if (rows === A && cols === B) return { ok: true };
      if (rows === B && cols === A) return { ok: false, why: `Määrä on sama, ${A * B}, mutta rivistö on käännetty. Rivejä pitää olla ${A} ja jokaisessa ${B}.` };
      return { ok: false, why: `Rakensit ${rows} riviä, joissa ${cols}: ${rows} × ${cols} = ${rows * cols}. Tilaus oli ${A} riviä, joissa jokaisessa ${B}.` };
    }
    case 'pourtest': {
      const pick = (r as Extract<Response, { kind: 'pourtest' }>).pick, best = pourBest(task), { la, lb } = task;
      if (pick === best) return { ok: true };
      const big = task.capA > task.capB ? la : lb, small = big === la ? lb : la;
      return { ok: false, why: best === 2 ? `${la[0]!.toUpperCase() + la.slice(1)} → ${lb}: täyttyi juuri reunaan asti. Niihin mahtuu yhtä paljon.` : `${small[0]!.toUpperCase() + small.slice(1)} → ${big}: ${big} ei tule täyteen. ${big} → ${small}: vettä valuu yli. ${big[0]!.toUpperCase() + big.slice(1)} on isompi.` };
    }
    case 'sort': {
      const bins = (r as Extract<Response, { kind: 'sort' }>).bins, i = task.answer.findIndex((a, k) => bins[k] !== a);
      if (i < 0) return { ok: true };
      return { ok: false, why: bins[i] === undefined || bins[i]! < 0 ? 'Lajittele kaikki kuvat laatikoihin.' : task.why?.[i] };
    }
    case 'extend': {
      const p = (r as Extract<Response, { kind: 'extend' }>).picks, i = task.answer.findIndex((a, k) => p[k] !== a);
      if (i < 0) return { ok: true };
      return { ok: false, why: p[i] === undefined || p[i]! < 0 ? 'Täytä kaikki tyhjät paikat.' : task.why?.[i] };
    }
    case 'fill': {
      const d = (r as Extract<Response, { kind: 'fill' }>).dl, T = task.target, tx = (x: number) => (x >= 10 ? `${Math.floor(x / 10)} l${x % 10 ? ` ${x % 10} dl` : ''}` : `${x} dl`);
      if (d === T) return { ok: true };
      if (T >= 10 && d === Math.floor(T / 10) + (T % 10)) return { ok: false, why: `Kaadoit ${d} dl. Litra ei ole yksi desilitra: 1 l = 10 dl, joten ${tx(T)} = ${T} dl.` };
      return { ok: false, why: `Kannussa on ${d} dl${d >= 10 ? ` (${tx(d)})` : ''}, mutta piti olla ${tx(T)}${T >= 10 ? ` = ${T} dl` : ''}. ${d < T ? `Puuttuu ${T - d} dl.` : `${d - T} dl on liikaa.`}` };
    }
    case 'grams': {
      const g = (r as Extract<Response, { kind: 'grams' }>).g, T = task.target, kg = (x: number) => (x >= 1000 ? ` (${Math.floor(x / 1000)} kg${x % 1000 ? ` ${x % 1000} g` : ''})` : '');
      if (g === T) return { ok: true };
      return { ok: false, why: `Vaa'alla on ${g} g${kg(g)}, mutta tilaus oli ${T} g${kg(T)}. ${g < T ? `Puuttuu ${T - g} g.` : `${g - T} g on liikaa.`}` };
    }
    case 'weigh': {
      const pick = (r as Extract<Response, { kind: 'weigh' }>).pick, best = weighBest(task);
      if (pick === best) return { ok: true };
      const beat = task.w.findIndex((x, i) => (task.light ? x < task.w[pick]! : x > task.w[pick]!) && i !== pick);
      return { ok: false, why: `Paketti ${task.names[pick]} ei ole ${task.light ? 'kevyin' : 'painavin'}: punnitse se paketin ${task.names[beat]} kanssa. ${task.light ? `${task.names[pick]} painuu alas.` : `${task.names[pick]} nousee ylös.`}` };
    }
    case 'cut': {
      const at = (r as Extract<Response, { kind: 'cut' }>).at, fill = cutFill(task), sg = task.op === '+' ? '+' : '−', v = task.op === '+' ? task.a + at : task.a - at;
      if (at === fill) return { ok: true };
      return { ok: false, why: `${task.a} ${sg} ${at} = ${v}. Se ei ole tasakymppi. Tasakymppiin ${task.op === '+' ? 'pääsee' : 'pääsee alas'}, kun ensimmäinen osa on ${fill}: ${task.a} ${sg} ${fill} = ${task.op === '+' ? task.a + fill : task.a - fill}.` };
    }
    case 'reeds': {
      const { t, o } = r as Extract<Response, { kind: 'reeds' }>, T = Math.floor(task.target / 10), O = task.target % 10, v = t * 10 + o;
      const np = (k: number) => `${k} ${k === 1 ? 'nippu' : 'nippua'}`, ip = (k: number) => `${k} ${k === 1 ? 'irtokaisla' : 'irtokaislaa'}`;
      if (task.tens !== undefined) {
        const W = task.tens, WO = task.target - W * 10;
        if (t === W && o === WO) return { ok: true };
        if (v === task.target) return { ok: false, why: t > W ? `Luku ${task.target} on oikein, mutta nippuja on ${t}. Avaa vielä ${t - W === 1 ? 'yksi nippu' : `${t - W} nippua`}: nippuja ${W} ja irtokaisloja ${WO}.` : `Luku ${task.target} on oikein, mutta nippuja pitää olla ${W}. Sido kymmenen irtokaislaa nipuksi.` };
        if (t === W) return { ok: false, why: `Nippuja on oikein ${W}, mutta irtokaisloja pitää olla ${WO}: avattu nippu antaa kymmenen kaislaa, ${O} + 10 = ${WO}.` };
        return { ok: false, why: `Kokosit ${np(t)} ja ${ip(o)} eli ${v}. Luvun pitää pysyä ${task.target}: ${np(W)} ja ${ip(WO)}.` };
      }
      if (t === T && o === O) return { ok: true };
      if (v === task.target) return { ok: false, why: `Määrä on oikein, mutta kymmenen irtokaislaa kannattaa sitoa nipuksi: ${np(T)} ja ${ip(O)}.` };
      if (task.from !== undefined && task.from > task.target) {
        const k = task.from - task.target;
        if (v === task.target + 10) return { ok: false, why: `Jäljellä on ${v}. Pois piti ottaa ${k}: ${Math.floor(k / 10) === 1 ? 'yksi nippu' : `${Math.floor(k / 10)} nippua`} ja ${k % 10} irtokaislaa. Yksi nippu jäi ottamatta.` };
        if (v === task.target - 10) return { ok: false, why: `Jäljellä on ${v}: otit yhden nipun liikaa. Pois piti ottaa ${k}.` };
        return { ok: false, why: `Jäljellä on ${v}. ${task.from} − ${k} = ${task.target}: ${np(T)} ja ${ip(O)}.` };
      }
      if (task.from !== undefined && v === task.target - 10) return { ok: false, why: `Lautalla on ${v}. Tuotavaa oli ${task.target - task.from}: ${Math.floor((task.target - task.from) / 10) === 1 ? 'yksi nippu' : `${Math.floor((task.target - task.from) / 10)} nippua`} ja ${(task.target - task.from) % 10} irtokaislaa. Yksi nippu puuttuu.` };
      if (t === O && o === T) return { ok: false, why: `Niput ja irtokaislat menivät väärin päin. Luvussa ${task.target} ensimmäinen numero ${T} kertoo niput, viimeinen ${O} irtokaislat.` };
      return { ok: false, why: `Kokosit ${np(t)} ja ${ip(o)} eli ${v}. Tilaus oli ${task.target}: ${np(T)} ja ${ip(O)}.` };
    }
    case 'bundle': {
      const c = (r as Extract<Response, { kind: 'bundle' }>).count;
      if (c === 10) return { ok: true };
      return { ok: false, why: c < 10 ? `Nipussa on ${c} kaislaa. Kymppinippuun tarvitaan tasan kymmenen: puuttuu ${10 - c}.` : `Nipussa on ${c} kaislaa. Se on liikaa: kymppinipussa on tasan kymmenen. Ota ${c - 10} pois.` };
    }
    case 'balance': {
      const n = (r as Extract<Response, { kind: 'balance' }>).n, L = task.left.reduce((x, y) => x + y, 0), R = task.right.reduce((x, y) => x + y, 0);
      if (R + n === L) return { ok: true };
      if (n === L && R > 0) return { ok: false, why: `Laitoit ${L} kiveä, saman verran kuin vasemmalla on yhteensä. Oikealla on kuitenkin jo ${R}, joten oikea puoli painaa liikaa.` };
      return { ok: false, why: R + n > L ? `Oikealla on nyt ${R + n} ja vasemmalla ${L}. Oikea puoli painaa enemmän.` : `Oikealla on nyt ${R + n} ja vasemmalla ${L}. Vasen puoli painaa vielä enemmän.` };
    }
    case 'bagup': {
      const c = (r as Extract<Response, { kind: 'bagup' }>).count, q = task.n / task.g;
      if (c === q) return { ok: true };
      return { ok: false, why: c < q ? `Kasaan jäi vielä ${task.n - c * task.g}. Niistäkin saa täyden pussin.` : `Viimeiseen pussiin ei riittänyt: kasa loppui jo ${q} pussin jälkeen.` };
    }
    case 'pack': {
      const c = (r as Extract<Response, { kind: 'pack' }>).counts;
      const bad = c.findIndex((x) => x !== task.g);
      if (bad < 0) return { ok: true };
      if (task.pile && c.reduce((x, y) => x + y, 0) < task.pile) return { ok: false, why: `Kasaan jäi vielä ${task.pile - c.reduce((x, y) => x + y, 0)}. Jaa kaikki pusseihin.` };
      return { ok: false, why: `Pussissa ${bad + 1} on ${c[bad]}, mutta jokaisessa pitää olla yhtä monta: ${task.g}.` };
    }
    case 'deal': {
      const { a, b } = r as Extract<Response, { kind: 'deal' }>;
      if (a + b < task.n) return { ok: false, why: `Kasaan jäi vielä ${task.n - a - b}. Jaa kaikki.` };
      if (a !== b) return { ok: false, why: `Loikalla on ${a} ja Aavalla ${b}: ei yhtä monta. Puoliksi jaettuna kumpikin saa ${task.n / 2}.` };
      return { ok: true };
    }
    case 'iterate': {
      const c = (r as Extract<Response, { kind: 'iterate' }>).count;
      if (c === task.len) return { ok: true };
      return { ok: false, why: c < task.len ? `Nauhaa jäi vielä mittaamatta: ${c} palaa ei yllä loppuun asti.` : `Viimeinen pala menee nauhan yli. Lopeta, kun palat ulottuvat juuri nauhan loppuun.` };
    }
    case 'frac': {
      const { n, d } = r as Extract<Response, { kind: 'frac' }>;
      if (!d) return { ok: false, why: 'Nimittäjä ei voi olla nolla.' };
      return { ok: n * task.d === task.n * d };
    }
  }
}

/** A model response for objective tasks. Human-observed tasks remain pending, never inventing an observation. */
export function solution(task: Task): Response {
  switch (task.kind) {
    case 'cake': return solutionCake(task);
    case 'fraction-subtract': return solutionFractionSubtract(task);
    case 'space-day': return solutionSpaceDay(task);
    case 'rational-link': return solutionRationalLink(task);
    case 'equation-workshop': return solutionEquationWorkshop(task);
    case 'observed-explanation': return solutionObservedExplanation(task);
    case 'sail-shapes': return solutionSailShape(task);
    case 'problem-workbench': return solutionProblemWorkbench(task);
    case 'solid-workshop': return solutionSolidWorkshop(task);
    case 'solid-construction': return solutionSolidConstruction(task);
    case 'power-rules': return solutionPowerRule(task);
    case 'arithmetic-reasoning': return solutionArithmeticReasoning(task);
    case 'number-journey': return solutionNumberJourney(task);
    case 'measurement-station': return solutionMeasurementStation(task);
    case 'data-probability': return solutionDataProbability(task);
    case 'programming-ferries': return solutionProgrammingFerry(task);
    case 'root-workshop': return solutionRootWorkshop(task);
    case 'geometry-relations': return solutionGeometryRelations(task);
    case 'statistics-harbor': return solutionStatisticsHarbor(task);
    case 'electricity-harbor': return solutionElectricityHarbor(task);
    case 'right-triangle': return solutionRightTriangle(task);
    case 'circle-observatory': return solutionCircleObservatory(task);
    case 'circuit-workshop': return solutionCircuitWorkshop(task);
    case 'physics-investigation': return solutionPhysicsInvestigation(task);
    case 'materials-mixtures': return solutionMaterialsMixtures(task);
    case 'chemical-notation': return solutionChemicalNotation(task);
    case 'solution-lab': return solutionSolutionLab(task);
    case 'logic-workshop': return solutionLogicWorkshop(task);
    case 'chemical-investigation': return solutionChemicalInvestigation(task);
    case 'waves-observatory': return solutionWavesObservatory(task);
    case 'decimal-ledger': return solutionDecimalLedger(task);
    case 'lifecycle-harbor': return solutionLifecycleHarbor(task);
    case 'reaction-lab': return solutionReactionLab(task);
    case 'matter-cycles': return solutionMatterCycles(task);
    case 'inquiry-islands': return solutionInquiryIslands(task);
    case 'carbon-kitchen': return solutionCarbonKitchen(task);
    case 'atomic-world': return solutionAtomicWorld(task);
    case 'safety-harbor': return solutionSafetyHarbor(task);
    case 'plane-measures': return solutionPlaneMeasures(task);
    case 'algorithm-studio': return solutionAlgorithmStudio(task);
    case 'number-equivalences': return solutionNumberEquivalences(task);
    case 'function-garden': return solutionFunctionGarden(task);
    case 'advanced-solids': return solutionAdvancedSolids(task);
    case 'energy-islands': return solutionEnergyIslands(task);
    case 'relation-workshop': return solutionRelationWorkshop(task);
    case 'thermal-station': return solutionThermalStation(task);
    case 'spatial-measures': return solutionSpatialMeasure(task);
    case 'choice': return { kind: 'choice', index: task.answer };
    case 'multi': return { kind: 'multi', indices: task.count !== undefined ? task.options.slice(0, task.count).map((_, i) => i) : task.answer };
    case 'tapcount': return { kind: 'tapcount', taps: task.objects.map((_, i) => i), ...(task.ask ? { count: task.objects.length } : {}) };
    case 'place': return { kind: 'place', map: { ...task.answer } };
    case 'ribbons': return { kind: 'ribbons', choice: ribbonAnswer(task) };
    case 'numeric': return { kind: 'numeric', value: task.answer };
    case 'plot': return { kind: 'plot', points: task.xs.map((x, i) => [x, task.ys[i]!] as [number, number]) };
    case 'line': return { kind: 'line', value: task.answer };
    case 'build': return { kind: 'build', seq: [task.target] };
    case 'tally': return { kind: 'tally', counts: Object.fromEntries(task.cats.map((k) => [k.key, task.items.filter((x) => x === k.key).length])) };
    case 'combos': return { kind: 'combos', pairs: task.a.flatMap((_, i) => task.b.map((_, j) => [i, j] as [number, number])) };
    case 'frac': return { kind: 'frac', n: task.n, d: task.d };
    case 'iterate': return { kind: 'iterate', count: task.len };
    case 'clock': return { kind: 'clock', h: task.h, m: task.m };
    case 'deal': return { kind: 'deal', a: task.n / 2, b: task.n / 2 };
    case 'bagup': return { kind: 'bagup', count: task.n / task.g };
    case 'stack': return { kind: 'stack', n: task.a * task.k };
    case 'bundle': return { kind: 'bundle', count: 10 };
    case 'cut': return { kind: 'cut', at: cutFill(task) };
    case 'grid': return { kind: 'grid', rows: task.rows, cols: task.cols };
    case 'weigh': return { kind: 'weigh', pick: weighBest(task) };
    case 'grams': return { kind: 'grams', g: task.target };
    case 'fill': return { kind: 'fill', dl: task.target };
    case 'sort': return { kind: 'sort', bins: [...task.answer] };
    case 'extend': return { kind: 'extend', picks: [...task.answer] };
    case 'pourtest': return { kind: 'pourtest', pick: pourBest(task) };
    case 'reeds': { const W = task.tens ?? Math.floor(task.target / 10); return { kind: 'reeds', t: W, o: task.target - W * 10 }; }
    case 'balance': return { kind: 'balance', n: task.left.reduce((x, y) => x + y, 0) - task.right.reduce((x, y) => x + y, 0) };
    case 'pack': return { kind: 'pack', counts: Array(task.k).fill(task.g) };
  }
}

/** A few plausible wrong responses, for tests. */
export function wrongs(task: Task): Response[] {
  switch (task.kind) {
    case 'cake': return wrongCakeResponses(task);
    case 'fraction-subtract': return wrongFractionSubtract(task);
    case 'space-day': return wrongSpaceDay(task);
    case 'rational-link': return wrongRationalLinkResponses(task);
    case 'equation-workshop': return wrongEquationWorkshopResponses(task);
    case 'observed-explanation': return wrongObservedExplanationResponses(task);
    case 'sail-shapes': return wrongSailShapeResponses(task);
    case 'problem-workbench': return wrongProblemWorkbenchResponses(task);
    case 'solid-workshop': return wrongSolidWorkshopResponses(task);
    case 'solid-construction': return wrongSolidConstructionResponses(task);
    case 'power-rules': return wrongPowerRuleResponses(task);
    case 'arithmetic-reasoning': return wrongArithmeticReasoningResponses(task);
    case 'number-journey': return wrongNumberJourneyResponses(task);
    case 'measurement-station': return wrongMeasurementStationResponses(task);
    case 'data-probability': return wrongDataProbabilityResponses(task);
    case 'programming-ferries': return wrongProgrammingFerryResponses(task);
    case 'root-workshop': return wrongRootWorkshopResponses(task);
    case 'geometry-relations': return wrongGeometryRelationsResponses(task);
    case 'statistics-harbor': return wrongStatisticsHarborResponses(task);
    case 'electricity-harbor': return wrongElectricityHarborResponses(task);
    case 'right-triangle': return wrongRightTriangleResponses(task);
    case 'circle-observatory': return wrongCircleObservatoryResponses(task);
    case 'circuit-workshop': return wrongCircuitWorkshopResponses(task);
    case 'physics-investigation': return wrongPhysicsInvestigationResponses(task);
    case 'materials-mixtures': return wrongMaterialsMixturesResponses(task);
    case 'chemical-notation': return wrongChemicalNotationResponses(task);
    case 'solution-lab': return wrongSolutionLabResponses(task);
    case 'logic-workshop': return wrongLogicWorkshopResponses(task);
    case 'chemical-investigation': return wrongChemicalInvestigationResponses(task);
    case 'waves-observatory': return wrongWavesObservatoryResponses(task);
    case 'decimal-ledger': return wrongDecimalLedgerResponses(task);
    case 'lifecycle-harbor': return wrongLifecycleHarborResponses(task);
    case 'reaction-lab': return wrongReactionLabResponses(task);
    case 'matter-cycles': return wrongMatterCyclesResponses(task);
    case 'inquiry-islands': return wrongInquiryIslandsResponses(task);
    case 'carbon-kitchen': return wrongCarbonKitchenResponses(task);
    case 'atomic-world': return wrongAtomicWorldResponses(task);
    case 'safety-harbor': return wrongSafetyHarborResponses(task);
    case 'plane-measures': return wrongPlaneMeasuresResponses(task);
    case 'algorithm-studio': return wrongAlgorithmStudioResponses(task);
    case 'number-equivalences': return wrongNumberEquivalencesResponses(task);
    case 'function-garden': return wrongFunctionGardenResponses(task);
    case 'advanced-solids': return wrongAdvancedSolidsResponses(task);
    case 'energy-islands': return wrongEnergyIslandsResponses(task);
    case 'relation-workshop': return wrongRelationWorkshopResponses(task);
    case 'thermal-station': return wrongThermalStationResponses(task);
    case 'spatial-measures': return wrongSpatialMeasureResponses(task);
    case 'choice': return task.options.map((_, i) => i).filter((i) => i !== task.answer).map((index) => ({ kind: 'choice', index }));
    case 'multi': {
      if (task.count !== undefined) return [{ kind: 'multi', indices: task.options.slice(0, task.count + 1).map((_, i) => i) }];
      const extra = task.options.map((_, i) => i).filter((i) => !task.answer.includes(i));
      const out: Response[] = [{ kind: 'multi', indices: task.answer.slice(1) }];
      if (extra.length) out.push({ kind: 'multi', indices: [...task.answer, extra[0]!] });
      return out;
    }
    case 'tapcount': {
      const n = task.objects.length, all = task.objects.map((_, i) => i);
      // A wrong total fails even when every object is marked exactly once.
      if (task.ask) return [{ kind: 'tapcount', taps: all, count: n + 1 }, { kind: 'tapcount', taps: [], count: n - 1 }];
      return [{ kind: 'tapcount', taps: all.slice(1) }, { kind: 'tapcount', taps: [0, ...all] }];
    }
    case 'place': {
      const slots = Object.keys(task.answer);
      if (slots.length < 2) return [{ kind: 'place', map: { [slots[0]!]: null } }];
      const m = { ...task.answer };
      const [a, b] = slots.filter((s) => task.answer[s] !== null);
      if (a && b) [m[a], m[b]] = [m[b]!, m[a]!];
      return m[a!] === task.answer[a!] ? [{ kind: 'place', map: { ...task.answer, [a ?? slots[0]!]: null } }] : [{ kind: 'place', map: m }];
    }
    case 'ribbons': return (['A', 'B', '='] as const).filter((c) => c !== ribbonAnswer(task)).map((choice) => ({ kind: 'ribbons', choice }));
    case 'numeric': return [{ kind: 'numeric', value: task.answer + 1 }, { kind: 'numeric', value: task.answer + 10 }];
    case 'plot': return [
      { kind: 'plot', points: task.xs.slice(1).map((x, i) => [x, task.ys[i + 1]!] as [number, number]) },
      // Swapped coordinates, the classic mistake (only when that is a different set of points).
      ...(task.xs.some((x, i) => !task.xs.some((x2, j) => x2 === task.ys[i] && task.ys[j] === x)) ? [{ kind: 'plot' as const, points: task.xs.map((x, i) => [task.ys[i]!, x] as [number, number]) }] : []),
    ];
    case 'line': return [{ kind: 'line', value: task.answer + task.step <= task.max ? task.answer + task.step : task.answer - task.step }];
    case 'build': return [{ kind: 'build', seq: [] }, { kind: 'build', seq: [task.target, '+', '1'] }];
    case 'tally': {
      const right = (solution(task) as Extract<Response, { kind: 'tally' }>).counts;
      const k = task.items[0]!;
      return [{ kind: 'tally', counts: { ...right, [k]: right[k]! + 1 } }, { kind: 'tally', counts: { ...right, [k]: right[k]! - 1 } }];
    }
    case 'combos': {
      const all = (solution(task) as Extract<Response, { kind: 'combos' }>).pairs;
      return [{ kind: 'combos', pairs: all.slice(1) }, { kind: 'combos', pairs: [...all.slice(1), all[1]!] }];
    }
    case 'pourtest': return [0, 1, 2].filter((i) => i !== pourBest(task)).map((pick) => ({ kind: 'pourtest', pick }) as Response);
    case 'extend': return [task.answer.length - 1, 0].map((j) => ({ kind: 'extend', picks: task.answer.map((a, k) => (k === j ? (a + 1) % task.palette.length : a)) }) as Response);
    case 'sort': return [0, task.answer.length - 1].map((j) => ({ kind: 'sort', bins: task.answer.map((a, k) => (k === j ? (a + 1) % task.cats.length : a)) }) as Response);
    case 'fill': return [task.target >= 10 ? { kind: 'fill', dl: Math.floor(task.target / 10) + (task.target % 10) } : { kind: 'fill', dl: task.target - 1 }, { kind: 'fill', dl: task.target + 1 }];
    case 'grams': return [{ kind: 'grams', g: task.target - Math.min(...task.packs) }, { kind: 'grams', g: task.target + Math.min(...task.packs) }];
    case 'weigh': return task.w.map((_, i) => i).filter((i) => i !== weighBest(task)).map((pick) => ({ kind: 'weigh', pick }) as Response);
    case 'grid': return ([...(task.rows !== task.cols ? [{ kind: 'grid', rows: task.cols, cols: task.rows }] : []), { kind: 'grid', rows: task.rows, cols: task.cols + 1 }] as Response[]);
    case 'cut': { const f = cutFill(task); return [f + 1, f - 1].filter((x) => x >= 1 && x < task.b).map((at) => ({ kind: 'cut', at }) as Response); }
    case 'reeds': { const T = Math.floor(task.target / 10), O = task.target % 10; if (task.tens !== undefined) { const W = task.tens; return [{ kind: 'reeds', t: T, o: O }, { kind: 'reeds', t: W, o: O }] as Response[]; } return ([{ kind: 'reeds', t: O, o: T }, { kind: 'reeds', t: T, o: O + 1 > 9 ? O - 1 : O + 1 }] as Response[]).filter((w) => !((w as { t: number }).t === T && (w as { o: number }).o === O)); }
    case 'bundle': return [{ kind: 'bundle', count: 9 }, { kind: 'bundle', count: 11 }] as Response[];
    case 'balance': { const L = task.left.reduce((x, y) => x + y, 0), want = L - task.right.reduce((x, y) => x + y, 0); return ([{ kind: 'balance', n: L }, { kind: 'balance', n: want + 1 }] as Response[]).filter((w) => (w as { n: number }).n !== want); }
    case 'stack': return ([{ kind: 'stack', n: task.a + task.k }, { kind: 'stack', n: task.a * task.k + 1 }] as Response[]).filter((w) => (w as { n: number }).n !== task.a * task.k);
    case 'bagup': return [{ kind: 'bagup', count: task.n / task.g - 1 }, { kind: 'bagup', count: task.n / task.g + 1 }];
    case 'pack': return [{ kind: 'pack', counts: [task.g + 1, ...Array(task.k - 1).fill(task.g)] }, { kind: 'pack', counts: [...Array(task.k - 1).fill(task.g), task.g - 1] }];
    case 'deal': return [{ kind: 'deal', a: task.n / 2 + 1, b: task.n / 2 - 1 }, { kind: 'deal', a: task.n / 2, b: task.n / 2 - 1 }];
    case 'clock': return [{ kind: 'clock', h: task.h, m: 30 - task.m }, { kind: 'clock', h: task.h + 1, m: task.m }];
    case 'iterate': return [{ kind: 'iterate', count: task.len - 1 }, { kind: 'iterate', count: task.len + 1 }];
    case 'frac': return ([{ kind: 'frac', n: task.n + 1, d: task.d }, { kind: 'frac', n: task.d, d: task.n }] as Extract<Response, { kind: 'frac' }>[]).filter((w) => w.n * task.d !== task.n * w.d);
  }
}

/** Size of the first part that takes a to a whole ten (up for +, down for −). */
export function cutFill(t: Extract<Task, { kind: 'cut' }>): number { return t.op === '+' ? (10 - (t.a % 10)) % 10 : t.a % 10; }

/** Index of the heaviest (or with `light` the lightest) package. */
export function weighBest(t: Extract<Task, { kind: 'weigh' }>): number {
  return t.w.indexOf(t.light ? Math.min(...t.w) : Math.max(...t.w));
}

/** 0 when a holds more, 1 when b does, 2 when they hold the same. */
export function pourBest(t: Extract<Task, { kind: 'pourtest' }>): number {
  return t.capA === t.capB ? 2 : t.capA > t.capB ? 0 : 1;
}
