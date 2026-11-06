import { initialMatterLedger, replayMatter, type CompositionSample, type MatterParcel, type MaterialsMixturesTask, type MaterialsMixturesResponse } from './materials-mixtures';
export interface MaterialsMixturesScene {
  kind: 'materials-mixtures'; title: string; mode: 'state' | 'phase' | 'dissolve' | 'separate' | 'composition'; operated: number;
  vessels: { id: string; label: string; shape: 'tall' | 'wide'; parcels: readonly MatterParcel[] }[];
  compositions?: readonly CompositionSample[];
  legend: string;
}
/** A public projection. No expected values, review, hidden capacities, future actions or future products. */
export function materialsMixturesScene(task: MaterialsMixturesTask, response?: MaterialsMixturesResponse): MaterialsMixturesScene | undefined {
  if (!['state', 'phase', 'dissolve', 'separate', 'composition'].includes(task.mode) || (task.mode === 'separate' && task.skill === 'plan') || (task.mode === 'composition' && task.skill === 'pure')) return;
  if (task.mode === 'composition') return { kind: 'materials-mixtures', title: 'Liuoksen ja eri faasien läpileikkaus', mode: 'composition', operated: 0, vessels: [], compositions: task.compositions!.map(s => ({ ...s, substances: s.substances.map(p => ({ ...p })), regions: s.regions.map(region => [...region]) })), legend: 'Koostumusmerkit ovat annettuja malliosuuksia saman kokoisista alueista. Niistä ei päätellä massaa tai yksittäisten molekyylien lukumäärää. Faasirajat ovat laadullisia.' };
  const actions = response?.mode === task.mode && response.predictionsLocked === true && Array.isArray(response.actions) ? response.actions : [];
  const ledger = actions.length ? replayMatter(task, actions) : initialMatterLedger(task);
  return { kind: 'materials-mixtures', title: 'Rantapajan säilyvän aineen malli', mode: task.mode as MaterialsMixturesScene['mode'],
    operated: ledger.applied.length, vessels: ledger.vessels.map(v => ({ ...v, shape: task.mode === 'state' && ledger.applied.includes(`${v.id}:observe`) ? 'wide' : 'tall', parcels: v.parcels.map(p => ({ ...p })) })),
    legend: 'Nimetyt mallimerkit esittävät milligrammoina ilmoitettuja aine-eriä. Niiden määrä tai pikselikoko ei ole molekyylimäärä. Kaasu säilyy ympäristön astiassa.' };
}
