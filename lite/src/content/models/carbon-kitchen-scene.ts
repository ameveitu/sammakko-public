import { carbonDraftIsSafe, carbonProfileReady } from './carbon-kitchen';
import type { CarbonAtom, CarbonBond, CarbonKitchenResponse, CarbonKitchenTask } from './carbon-kitchen';
export interface CarbonKitchenScene {
  kind: 'carbon-kitchen'; title: string; mode: 'molecule-build' | 'protein-fragment' | 'organic-group';
  molecules: readonly { id: string; label: string; atoms: readonly CarbonAtom[]; bonds: readonly CarbonBond[]; highlighted: readonly string[]; form: 'molecule' | 'network-fragment' | 'separate-substances' }[];
  residues: readonly { id: string; label: string; kind: 'amino-residue' | 'glucose-residue' | 'fat-tail' }[];
  folded: boolean; legend: string;
}
/** Only public givens and the learner's current construction. No solution or assessment state. */
export function carbonKitchenScene(task: CarbonKitchenTask, response?: CarbonKitchenResponse): CarbonKitchenScene | undefined {
  if (task.mode !== 'molecule-build' && task.mode !== 'protein-fragment' && task.mode !== 'organic-group') return;
  if (!carbonDraftIsSafe(response)) response = undefined;
  if (task.mode === 'organic-group' && !carbonProfileReady(task)) return;
  const model: CarbonKitchenScene = { kind: 'carbon-kitchen', title: task.title, mode: task.mode, molecules: [], residues: [], folded: false,
    legend: 'C harmaa, O punainen, H vaalea. Sidosten kertaluvut näkyvät tarkassa 2D-mallissa. Tilamalli ei mittaa sidospituuksia tai atomikokoja.' };
  if (task.mode === 'molecule-build') {
    const ids = new Set(task.atoms.map(a => a.id));
    const draft = response?.mode === task.mode && Array.isArray(response.bonds) ? response.bonds : task.proposal ?? [];
    const bonds = draft.flatMap(b => b && typeof b === 'object' && Object.hasOwn(b, 'a') && Object.hasOwn(b, 'b') && Object.hasOwn(b, 'order') && ids.has(b.a) && ids.has(b.b) && b.a !== b.b && [1, 2, 3].includes(b.order) ? [{ a: b.a, b: b.b, order: b.order }] : []);
    model.molecules = [{ id: 'own', label: `Oma ${task.formula}`, atoms: task.atoms, bonds, highlighted: [], form: 'molecule' }, ...task.samples.map(sample => ({ id: sample.id, label: sample.description, atoms: sample.atoms, bonds: sample.bonds, highlighted: [], form: sample.form === 'network' ? 'network-fragment' as const : sample.form === 'separate-substances' ? 'separate-substances' as const : 'molecule' as const }))];
  } else if (task.mode === 'protein-fragment') {
    const chain = response?.mode === task.mode && Array.isArray(response.chain) ? response.chain : task.proposal ?? [];
    model.residues = [...new Set(chain)].flatMap(id => { const unit = task.units.find(u => u.id === id); return unit ? [{ ...unit }] : []; });
    model.folded = response?.mode === task.mode && response.folded === true;
    model.legend = 'Jokainen nimetty pala on rakenneosan kaaviomerkki. Aminohappopala on aminohappotähde proteiinin pidemmän ketjun katkelmassa. Taivutus säilyttää osien tunnisteet ja ketjun järjestyksen. Se ei simuloi proteiinin todellista laskostumista.';
  } else {
    model.molecules = [...task.molecules, task.contrast].map(molecule => {
      const mark = response?.mode === task.mode && Array.isArray(response.marks) ? response.marks.find(m => m && typeof m === 'object' && m.molecule === molecule.id) : undefined;
      return { id: molecule.id, label: molecule.name, atoms: molecule.atoms, bonds: molecule.bonds, highlighted: mark ? [mark.carbon, mark.oxygen, mark.hydrogen].filter(id => molecule.atoms.some(atom => atom.id === id)) : [], form: 'molecule' };
    });
    model.legend += ' CHₙ-merkinnän hiilivetyjä ei piirretä erillisiksi palloiksi. Niiden lukumäärä pysyy 2D-atomimerkinnässä. Merkitty C/O/H on oppijan oma valinta.';
  }
  return model;
}
