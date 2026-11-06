import type { CriterionObservation, ObservedExplanationTask } from './observed-explanations';

export const safetyHarborSources = [
  'https://tukes.fi/koti-ja-vapaa-aika/kodin-kemikaalit/kemikaalien-merkinnat',
  'https://tukes.fi/fi/kemikaalit/clp-luokitus-merkinnat-ja-pakkaaminen/kemikaalien-merkinnat/varoitusmerkit',
  'https://tukes.fi/kodin-sahkoturvallisuus/sahko-pihapiirissa-ja-ulkona',
  'https://www.hus.fi/potilaalle/sairaalat-ja-toimipisteet/myrkytystietokeskus',
  'https://www.spek.fi/turvallisuus/paloturvallisuus/toimintaohjeet-tulipalossa/',
  'https://www.osha.gov/hazcom/pictograms',
] as const;
export const safetyHarborScope = 'Näyttö koskee annettujen kuvitteellisten tilanteiden vaarahavaintoja, virtuaalisia päätöksiä ja toteutettuja toimintaketjuja. Fyysinen turvallinen työskentely edellyttää erillistä aikuisen havaintoa asianmukaisesti ohjatussa toiminnassa.';
export type SafetyPictogram = 'ghs01' | 'ghs02' | 'ghs03' | 'ghs04' | 'ghs05' | 'ghs06' | 'ghs07' | 'ghs08' | 'ghs09';
export const safetyPictograms: Record<SafetyPictogram, { name: string; symbol: string; meaning: string }> = {
  ghs01: { name: 'Räjähtävä', symbol: 'Räjähtävä pommi', meaning: 'Räjähdysvaara' },
  ghs02: { name: 'Syttyvä', symbol: 'Liekki', meaning: 'Aine voi syttyä' },
  ghs03: { name: 'Hapettava', symbol: 'Liekki ympyrän päällä', meaning: 'Aine voi aiheuttaa tulipalon tai edistää palamista' },
  ghs04: { name: 'Paineen alainen kaasu', symbol: 'Kaasupullo', meaning: 'Paineen alainen kaasu' },
  ghs05: { name: 'Syövyttävä', symbol: 'Syöpyminen', meaning: 'Voi syövyttää ihoa, vaurioittaa silmiä tai syövyttää metalleja' },
  ghs06: { name: 'Välitön myrkyllisyys', symbol: 'Pääkallo ja ristikkäiset luut', meaning: 'Voi olla välittömästi myrkyllinen' },
  ghs07: { name: 'Terveysvaara / vaarallinen otsonikerrokselle', symbol: 'Huutomerkki', meaning: 'Esimerkiksi ärsytys tai haitallisuus; tarkka vaara luetaan etiketistä' },
  ghs08: { name: 'Vakava terveysvaara', symbol: 'Ihmishahmo ja rintakehän merkki', meaning: 'Voi aiheuttaa vakavia terveyshaittoja; tarkka vaara luetaan etiketistä' },
  ghs09: { name: 'Vaarallinen ympäristölle', symbol: 'Puu ja kala', meaning: 'Vaarallinen vesiympäristölle' },
};
export type SafetyActionId = 'keep-clear' | 'tell-adult' | 'warn-friends' | 'read-instruction' | 'identify-samples' | 'protect' | 'stop-model' | 'adjust-stopped' | 'observe-shield' | 'contact-poison' | 'call-112' | 'wait-permission' | 'close-door' | 'secure-storage' | 'separate-food' | 'ventilate-plan' | 'keep-heat-away' | 'protect-water' | 'touch' | 'taste' | 'mix' | 'return-for-bag' | 'repair-live';
export const safetyActions: Record<SafetyActionId, string> = {
  'keep-clear': 'Pysyn erossa vaarakohdasta', 'tell-adult': 'Kerron havainnon lähellä olevalle aikuiselle', 'warn-friends': 'Varoitan lähellä olevia ystäviä',
  'read-instruction': 'Luen tämän tehtävän ohjeen', 'identify-samples': 'Kohdistan näytteet niiden tunnisteisiin', protect: 'Valitsen ohjeen suojauksen',
  'stop-model': 'Pysäytän virtuaalilaitteen', 'adjust-stopped': 'Säädän pysähtynyttä virtuaalimallia', 'observe-shield': 'Havainnoin suojan takaa',
  'contact-poison': 'Aikuinen kysyy Myrkytystietokeskukselta ohjeen', 'call-112': 'Harjoittelen avun hälyttämistä numeroon 112',
  'wait-permission': 'Odotan turvallisessa paikassa lupaa palata', 'close-door': 'Suljen kartan suojaavan oven', 'secure-storage': 'Annan aikuiselle alkuperäispakkauksen säilytyssuunnitelman',
  'separate-food': 'Suunnittelen kemikaalit erilleen ruokailusta', 'ventilate-plan': 'Osoitan ohjeen vaatiman ilmanvaihdon',
  'keep-heat-away': 'Suunnittelen pakkaukselle paikan eroon lämmöstä', 'protect-water': 'Suunnittelen pääsyn estämisen vesistöön',
  touch: 'Kosketan tuntematonta vaarakohdetta', taste: 'Maistan tunnistamiseksi', mix: 'Yhdistän eri pakkauksien aineita',
  'return-for-bag': 'Palaan hakemaan tavaroita', 'repair-live': 'Korjaan itse jännitteistä laitetta',
};
interface CaseBase { id: string; title: string; facts: readonly string[] }
export interface SafetyProcedure extends CaseBase {
  mode: 'procedure'; situation: 'unknown' | 'exposure' | 'physics' | 'chemistry' | 'electric';
  friendsNearby: boolean; foodNearby: boolean; lifeThreatening: boolean; machineRunning: boolean; labelled: boolean; protectionRequired: boolean;
}
export type SafetyLabelClaim = { id: string; kind: 'meaning'; symbol: SafetyPictogram; meaning: SafetyPictogram } | { id: string; kind: 'action'; action: SafetyActionId };
export interface SafetyLabel extends CaseBase {
  mode: 'label'; proposal?: readonly SafetyLabelClaim[]; pictograms: readonly SafetyPictogram[]; product: string; packageColor: string; instruction: string;
  requirements: { ventilation: boolean; heatSeparation: boolean; waterProtection: boolean; foodSeparation: boolean };
}
export interface SafetyConditions extends CaseBase {
  mode: 'fire-conditions'; example?: 'paper-model' | 'wax-model' | 'gas-card-model'; present: { fuel: boolean; oxidizer: boolean; heat: boolean };
  change: { factor: 'fuel' | 'oxidizer' | 'heat'; available: boolean };
}
export interface SafetyMapNode { id: string; label: string; x: number; y: number; state: 'clear' | 'smoke' | 'fire'; safe: boolean }
export interface SafetyEvacuation extends CaseBase {
  mode: 'evacuation'; nodes: readonly SafetyMapNode[]; edges: readonly (readonly [string, string])[];
  start: string; shelterInPlace: boolean; closeDoor: boolean; friendsNearby: boolean;
}
export interface SafetyElectricPath extends CaseBase {
  mode: 'electric-path'; nodes: readonly { id: string; label: string; x: number; y: number }[];
  edges: readonly (readonly [string, string])[]; source: string; returnNode: string; via: string;
  risk: 'shock' | 'heating'; insulation: 'damaged' | 'intact';
}
export type SafetyCase = SafetyProcedure | SafetyLabel | SafetyConditions | SafetyEvacuation | SafetyElectricPath;
export interface SafetyReview extends Pick<ObservedExplanationTask, 'prompt' | 'rubric' | 'model'> {}
export interface SafetyObservation { channel: 'spoken' | 'written'; observations: Partial<Record<string, CriterionObservation>>; confirmedByAdult: boolean; assistance: 'none' | 'helped' }
export interface SafetyHarborTask {
  kind: 'safety-harbor'; title: string; run: string; context: { title: string; skills: readonly string[] }; cases: readonly SafetyCase[]; review?: SafetyReview;
}
export interface SafetyAction { run: string; id: string; action: SafetyActionId; place?: string }
type ActionAnswer = { mode: 'procedure'; caseId: string; actions: readonly SafetyAction[] };
type LabelAnswer = { mode: 'label'; caseId: string; meanings: Partial<Record<SafetyPictogram, SafetyPictogram>>; rejectedClaim?: string | null; actions: readonly SafetyAction[] };
type ConditionsAnswer = { mode: 'fire-conditions'; caseId: string; factors: { fuel: boolean | null; oxidizer: boolean | null; heat: boolean | null }; prediction: 'continues' | 'stops' | null; locked: boolean; observed: boolean };
type EvacuationAnswer = { mode: 'evacuation'; caseId: string; route: readonly string[]; travelled: readonly string[]; actions: readonly SafetyAction[] };
type PathAnswer = { mode: 'electric-path'; caseId: string; path: readonly string[]; risk: 'shock' | 'heating' | null; insulationRole: 'blocks-contact' | 'adds-current' | 'cosmetic' | null; actions: readonly SafetyAction[] };
export type SafetyAnswer = ActionAnswer | LabelAnswer | ConditionsAnswer | EvacuationAnswer | PathAnswer;
export interface SafetyHarborResponse { kind: 'safety-harbor'; answers: readonly SafetyAnswer[]; review?: SafetyObservation }
export interface SafetyVerdict { ok: boolean; why?: string; pendingReview?: true; observedByAdult?: true; assisted?: true }
const fail = (why: string): SafetyVerdict => ({ ok: false, why });
function record(value: unknown, keys: readonly string[] = []): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) return false;
  const descriptors = Object.getOwnPropertyDescriptors(value);
  return Reflect.ownKeys(descriptors).every(key => typeof key === 'string' && descriptors[key]!.enumerable && Object.hasOwn(descriptors[key]!, 'value')) && keys.every(key => Object.hasOwn(descriptors, key));
}
function dense(value: unknown, limit = 32): value is unknown[] {
  return Array.isArray(value) && value.length <= limit && Array.from({ length: value.length }, (_, i) => Object.getOwnPropertyDescriptor(value, String(i))).every(d => d && Object.hasOwn(d, 'value'));
}
export function safetyRequiredActions(item: SafetyCase): SafetyActionId[] {
  if (item.mode === 'fire-conditions') return [];
  if (item.mode === 'label') return ['read-instruction', ...(item.requirements.ventilation ? ['ventilate-plan' as const] : []),
    ...(item.requirements.heatSeparation ? ['keep-heat-away' as const] : []), ...(item.requirements.waterProtection ? ['protect-water' as const] : []), ...(item.requirements.foodSeparation ? ['separate-food' as const] : []), 'secure-storage'];
  if (item.mode === 'electric-path') return ['keep-clear', 'tell-adult'];
  if (item.mode === 'evacuation') return [...(item.closeDoor ? ['close-door' as const] : []), ...(item.friendsNearby ? ['warn-friends' as const] : []), 'call-112', 'wait-permission'];
  if (item.situation === 'physics') return [...(item.friendsNearby ? ['warn-friends' as const] : []), 'read-instruction', ...(item.machineRunning ? ['stop-model' as const] : []), 'adjust-stopped', ...(item.protectionRequired ? ['protect' as const] : []), 'observe-shield'];
  if (item.situation === 'chemistry' && item.labelled) return [...(item.friendsNearby ? ['warn-friends' as const] : []), ...(item.foodNearby ? ['separate-food' as const] : []), 'read-instruction', 'identify-samples', ...(item.protectionRequired ? ['protect' as const] : []), 'tell-adult'];
  if (item.situation === 'exposure' && item.lifeThreatening) return ['keep-clear', 'tell-adult', 'call-112'];
  return ['keep-clear', ...(item.foodNearby ? ['separate-food' as const] : []), ...(item.situation === 'unknown' && item.labelled ? ['read-instruction' as const] : []), ...(item.friendsNearby ? ['warn-friends' as const] : []), 'tell-adult', ...(item.situation === 'exposure' ? [item.lifeThreatening ? 'call-112' as const : 'contact-poison' as const] : [])];
}
export function safetyLabelClaimTrue(item: SafetyLabel, claim: SafetyLabelClaim) {
  return claim.kind === 'meaning' ? claim.meaning === claim.symbol : safetyRequiredActions(item).includes(claim.action);
}
function actionsComplete(task: SafetyHarborTask, item: SafetyCase, actions: readonly SafetyAction[]): boolean {
  if (!dense(actions) || actions.some(a => !record(a, ['run', 'id', 'action']) || Object.keys(a).some(key => !['run', 'id', 'action', 'place'].includes(key)))) return false;
  const required = safetyRequiredActions(item);
  const optional: SafetyActionId[] = ['read-instruction', 'tell-adult', 'warn-friends', ...(item.mode === 'procedure' && item.situation === 'exposure' && item.lifeThreatening ? ['separate-food' as const] : []), ...(item.mode === 'procedure' && item.situation === 'physics' ? ['stop-model' as const, 'protect' as const] : [])];
  if (new Set(actions.map(a => a.id)).size !== actions.length || actions.some(a => a.run !== task.run || typeof a.id !== 'string' || !/^[a-z][a-z0-9-]{0,79}$/.test(a.id) || ![...required, ...optional].includes(a.action))) return false;
  if (item.mode === 'evacuation' && actions.some(a => ((a.action === 'call-112' || a.action === 'wait-permission') && !item.nodes.some(n => n.id === a.place && n.safe && n.state === 'clear')) || ((a.action === 'warn-friends' || a.action === 'close-door') && a.place !== item.start))) return false;
  const order = actions.map(a => a.action);
  if (item.mode === 'procedure' && item.situation === 'exposure' && item.lifeThreatening && order.slice(0, order.indexOf('call-112')).some(id => !['keep-clear', 'tell-adult', 'warn-friends'].includes(id))) return false;
  if (new Set(order).size !== order.length || !required.every(id => order.includes(id))) return false;
  const before = (a: SafetyActionId, b: SafetyActionId) => !order.includes(a) || !order.includes(b) || order.indexOf(a) < order.indexOf(b);
  return before('read-instruction', 'adjust-stopped') && before('stop-model', 'adjust-stopped') && before('adjust-stopped', 'observe-shield') &&
    before('protect', 'observe-shield') && before('read-instruction', 'identify-samples') && before('read-instruction', 'secure-storage') && before('ventilate-plan', 'secure-storage') && before('keep-heat-away', 'secure-storage') && before('protect-water', 'secure-storage') && before('separate-food', 'secure-storage') &&
    before('tell-adult', 'contact-poison') && before('call-112', 'wait-permission') && before('close-door', 'wait-permission');
}
export function safetyFireContinues(item: SafetyConditions) {
  const after = { ...item.present, [item.change.factor]: item.change.available };
  return after.fuel && after.oxidizer && after.heat;
}
function graphPath(path: readonly string[], nodes: readonly { id: string }[], edges: readonly (readonly [string, string])[], start: string, end: string, via?: string) {
  return dense(path, 12) && path.length > 0 && new Set(path).size === path.length && path[0] === start && path.at(-1) === end &&
    (!via || path.includes(via)) && path.every(id => typeof id === 'string' && nodes.some(n => n.id === id)) && path.every((id, i) => !i || edges.some(([a, b]) => a === id && b === path[i - 1] || b === id && a === path[i - 1]));
}
const answerKeys: Record<SafetyCase['mode'], readonly string[]> = {
  procedure: ['mode', 'caseId', 'actions'], label: ['mode', 'caseId', 'meanings', 'rejectedClaim', 'actions'],
  'fire-conditions': ['mode', 'caseId', 'factors', 'prediction', 'locked', 'observed'],
  evacuation: ['mode', 'caseId', 'route', 'travelled', 'actions'],
  'electric-path': ['mode', 'caseId', 'path', 'risk', 'insulationRole', 'actions'],
};
export function checkSafetyCase(task: SafetyHarborTask, item: SafetyCase, answer: SafetyAnswer): SafetyVerdict {
  if (!record(answer, ['mode', 'caseId']) || answer.mode !== item.mode || answer.caseId !== item.id || Object.keys(answer).some(key => !answerKeys[item.mode].includes(key))) return fail('Tee tämän tilanteen oma toimintapolku.');
  if (item.mode === 'fire-conditions' && answer.mode === 'fire-conditions') {
    if (!record(answer.factors, ['fuel', 'oxidizer', 'heat']) || !(['fuel', 'oxidizer', 'heat'] as const).every(k => answer.factors[k] === item.present[k])) return fail('Kohdista palava aine, hapettava ympäristö ja riittävä lämpö juuri annettuun malliin.');
    if (answer.locked !== true || answer.observed !== true) return fail('Lukitse oma ennuste ja katso sitten tämän mallin muutos.');
    return answer.prediction === (safetyFireContinues(item) ? 'continues' : 'stops') ? { ok: true } : fail('Palamisen jatkuminen edellyttää kaikkia kolmea tässä mallissa. Yksi puuttuva ehto riittää pysäyttämään mallin palamisen.');
  }
  if (!('actions' in answer) || !actionsComplete(task, item, answer.actions)) return fail('Toteuta juuri näiden annettujen olojen turvallinen ketju. Ohjeen lukeminen, pysäytys ja avun ilmoittaminen liittyvät eri vaiheisiin.');
  if (item.mode === 'label' && answer.mode === 'label') {
    if (!item.proposal && answer.rejectedClaim !== undefined && answer.rejectedClaim !== null) return fail('Tässä tehtävässä rakennetaan oma merkintä ilman luonnosväitettä.');
    if (item.proposal && (item.proposal.filter(c => !safetyLabelClaimTrue(item, c)).length !== 1 || !item.proposal.some(c => c.id === answer.rejectedClaim && !safetyLabelClaimTrue(item, c)))) return fail('Osoita luonnoksen virheellinen väite ja rakenna sen tilalle oma oikea merkintä sekä toimintasuunnitelma.');
    return record(answer.meanings, item.pictograms) && Object.keys(answer.meanings).length === item.pictograms.length && item.pictograms.every(id => answer.meanings[id] === id)
      ? { ok: true } : fail('Kohdista jokainen virallinen symboli sen vaaraan. Etiketin turvalausekkeet täydentävät merkin viestiä.');
  }
  if (item.mode === 'evacuation' && answer.mode === 'evacuation') {
    if (!dense(answer.travelled, 12) || !dense(answer.route, 12) || answer.route.length !== answer.travelled.length || !answer.route.every((id, i) => id === answer.travelled[i])) return fail('Piirrä oma suunnitelma ja kulje se virtuaalikartalla loppuun.');
    const target = item.nodes.find(n => n.id === answer.route.at(-1));
    if (!target?.safe || !graphPath(answer.route, item.nodes, item.edges, item.start, target.id) || answer.route.some(id => item.nodes.find(n => n.id === id)!.state !== 'clear') || item.shelterInPlace && (answer.route.length !== 1 || target.id !== item.start)) return fail('Noudata tämän paikan näkyviä ehtoja. Savuun ei mennä. Savuinen porraskäytävä ja savuton poistumisreitti edellyttävät eri ratkaisuja.');
  }
  if (item.mode === 'electric-path' && answer.mode === 'electric-path') {
    if (!graphPath(answer.path, item.nodes, item.edges, item.source, item.returnNode, item.via) || answer.risk !== item.risk || answer.insulationRole !== 'blocks-contact') return fail('Rakenna annettu mahdollinen virtareitti. Eristys estää tahattoman kosketuksen. Energian siirtyminen voi aiheuttaa sähköiskun tai kuumenemisen.');
  }
  return { ok: true };
}
export function safetyExplanation(task: SafetyHarborTask, channel: 'spoken' | 'written'): ObservedExplanationTask {
  if (!task.review) throw Error('No own-explanation rubric in this task');
  return { kind: 'observed-explanation', channel, givens: [], ...task.review };
}
export function checkSafetyHarbor(task: SafetyHarborTask, answer: SafetyHarborResponse): SafetyVerdict {
  if (!record(answer, ['kind', 'answers']) || answer.kind !== 'safety-harbor' || Object.keys(answer).some(key => !['kind', 'answers', 'review'].includes(key))) return fail('Tämä vastaus kuuluu Turvaniemen omaan tilanteeseen.');
  let review: SafetyVerdict | undefined;
  if (task.review) {
    const observation = answer.review;
    if (!record(observation, ['channel', 'observations', 'confirmedByAdult', 'assistance']) || !['spoken', 'written'].includes(observation.channel) || !['none', 'helped'].includes(observation.assistance) || !record(observation.observations, task.review.rubric.map(c => c.id)) || Object.keys(observation.observations).length !== task.review.rubric.length || Object.keys(observation).some(key => !['channel', 'observations', 'confirmedByAdult', 'assistance'].includes(key)) || observation.confirmedByAdult !== true || !task.review.rubric.every(c => ['met', 'not-yet'].includes(observation.observations[c.id] ?? ''))) return { ok: false, pendingReview: true, why: 'Oma perustelu odottaa aikuisen havaintoa ja erillistä avun merkintää.' };
    // The local widget holds the written draft. This protocol carries only the adult's observation.
    const notYet = task.review.rubric.find(c => observation.observations[c.id] === 'not-yet');
    review = { ok: !notYet, observedByAdult: true, ...(notYet ? { why: `Harjoitellaan vielä tätä kohtaa. ${notYet.label}` } : {}),
      ...(observation.assistance === 'helped' ? { assisted: true as const } : {}) };
  }
  const provenance = { ...(review?.observedByAdult ? { observedByAdult: true as const } : {}), ...(review?.assisted ? { assisted: true as const } : {}) };
  if (!dense(answer.answers, 4) || answer.answers.length !== task.cases.length) return { ...fail('Jokainen erillinen tilanne tarvitsee oman päätöksensä.'), ...provenance };
  for (const item of task.cases) {
    const matches = answer.answers.filter(a => record(a, ['caseId']) && a.caseId === item.id);
    if (matches.length !== 1) return { ...fail('Säilytä jokaisen tilanteen oma tunniste.'), ...provenance };
    const verdict = checkSafetyCase(task, item, matches[0]!);
    if (!verdict.ok) return { ...verdict, ...provenance };
  }
  return review ?? { ok: true };
}
function pathTo(nodes: readonly { id: string }[], edges: readonly (readonly [string, string])[], start: string, end: string, via?: string): string[] {
  const queue = [[start]];
  while (queue.length) {
    const path = queue.shift()!;
    if (path.at(-1) === end && (!via || path.includes(via))) return path;
    for (const node of nodes) if (!path.includes(node.id) && edges.some(([a, b]) => a === path.at(-1) && b === node.id || b === path.at(-1) && a === node.id)) queue.push([...path, node.id]);
  }
  return [];
}
/** Demonstration only. Adult confirmation is deliberately absent. */
export function solutionSafetyHarbor(task: SafetyHarborTask): SafetyHarborResponse {
  return { kind: 'safety-harbor', answers: task.cases.map(item => {
    const actions = safetyRequiredActions(item).map((action, i) => ({ run: task.run, id: `${item.id}-${i}`, action, ...(item.mode === 'evacuation' ? { place: action === 'close-door' || action === 'warn-friends' ? item.start : item.nodes.find(n => n.safe && n.state === 'clear')!.id } : {}) }));
    if (item.mode === 'fire-conditions') return { mode: item.mode, caseId: item.id, factors: { ...item.present }, prediction: safetyFireContinues(item) ? 'continues' : 'stops', locked: true, observed: true };
    if (item.mode === 'label') return { mode: item.mode, caseId: item.id, meanings: Object.fromEntries(item.pictograms.map(id => [id, id])), ...(item.proposal ? { rejectedClaim: item.proposal.find(c => !safetyLabelClaimTrue(item, c))!.id } : {}), actions };
    if (item.mode === 'electric-path') return { mode: item.mode, caseId: item.id, path: pathTo(item.nodes, item.edges, item.source, item.returnNode, item.via), risk: item.risk, insulationRole: 'blocks-contact', actions };
    if (item.mode === 'evacuation') {
      const safe = item.nodes.filter(n => n.state === 'clear'), route = item.shelterInPlace ? [item.start] : pathTo(safe, item.edges, item.start, safe.find(n => n.safe)!.id);
      return { mode: item.mode, caseId: item.id, route, travelled: [...route], actions };
    }
    return { mode: item.mode, caseId: item.id, actions };
  }), ...(task.review ? { review: { channel: 'spoken', observations: {}, confirmedByAdult: false, assistance: 'none' } } : {}) };
}
export function wrongSafetyHarborResponses(task: SafetyHarborTask): SafetyHarborResponse[] {
  const model = solutionSafetyHarbor(task);
  return [{ ...model, answers: [] }, { ...model, answers: model.answers.map((answer, i) => i ? answer : answer.mode === 'fire-conditions' ? { ...answer, prediction: answer.prediction === 'continues' ? 'stops' : 'continues' } : { ...answer, actions: [{ run: task.run, id: 'unsafe', action: 'touch' }] }) }];
}
