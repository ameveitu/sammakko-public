import { cycleDataSafe, initialCycleLedger, replayCycleMoves, type CycleParcel, type CycleReservoir, type MatterCyclesResponse, type MatterCyclesTask } from './matter-cycles';
export interface MatterCyclesScene {
  kind: 'matter-cycles'; title: string; mode: 'conservation' | 'water-path' | 'reservoirs';
  reservoirs: readonly CycleReservoir[]; parcels: readonly CycleParcel[];
  samples: readonly { id: string; label: string; formula: Readonly<Record<string, number>>; carbonMg: number; at: string | null }[];
  transfers: readonly { from: string; to: string; process: string; amountMg: number }[];
  locked: boolean; operated: number; referenceMassMg: number; legend: string;
}
/** Supplied initial stocks and actually operated transfers only. No forecast, target answer, or adult text. */
export function matterCyclesScene(task: MatterCyclesTask, response?: MatterCyclesResponse): MatterCyclesScene | undefined {
  if (!['conservation', 'water-path', 'reservoirs'].includes(task.mode)) return;
  try { if (!cycleDataSafe(response)) response = undefined; } catch { response = undefined; }
  if (task.mode === 'photosynthesis' || task.mode === 'carbon-network') return;
  if (task.mode === 'reservoirs') {
    const assignments = response?.mode === task.mode && Array.isArray(response.assignments) ? response.assignments : [];
    return { kind: 'matter-cycles', title: task.title, mode: task.mode, reservoirs: task.reservoirs.map(r => ({ ...r })), parcels: [], transfers: [], locked: false, operated: 0,
      samples: task.cards.map(card => {
        const own = assignments.find(a => a && typeof a === 'object' && a.card === card.id);
        return { id: card.id, label: card.label, formula: { ...card.formula }, carbonMg: card.carbonMg, at: own && task.reservoirs.some(r => r.id === own.reservoir) ? own.reservoir : null };
      }), referenceMassMg: Math.max(1, ...task.cards.map(c => c.carbonMg)), legend: 'Oppijan sijoitusehdotukset hiilivarastoihin. Kortti ilmoittaa mg seurattua hiiltä, ei koko yhdisteen massaa. Pallojen määrä tai koko ei kuvaa maapallon varastojen mittakaavaa.' };
  }
  const locked = response?.mode === task.mode && response.locked === true;
  const moves = locked && response && 'moves' in response && Array.isArray(response.moves) ? response.moves : [];
  const replay = replayCycleMoves(task, moves), ledger = moves.length ? replay.ledger : initialCycleLedger(task);
  const successful = new Set(ledger.applied.map(a => a.id));
  return { kind: 'matter-cycles', title: task.title, mode: task.mode, reservoirs: task.reservoirs.map(r => ({ ...r })), parcels: ledger.parcels.map(p => ({ ...p })), samples: [],
    transfers: moves.filter((m, i) => m && successful.has(m.id) && moves.findIndex(other => other?.id === m.id) === i).map(m => ({ from: m.from, to: m.to, process: m.process, amountMg: m.amountMg })),
    locked, operated: successful.size, referenceMassMg: task.initial.reduce((sum, p) => sum + p.amountMg, 0),
    legend: task.mode === 'water-path' ? 'Merkitty vesimäärä kulkee maiseman varastojen välillä. Näkymätön vesihöyry on merkitty ääriviivasymbolilla; pilvi kuvaa pisaroita tai jääkiteitä. Viipymät on aikatiivistetty. Tämä ei simuloi koko meren määrää tai nestevirtausta.' : 'Suljetun kammion massakirja. Mg-arvot ja alkuperämerkinnät säilyvät tarkassa 2D-taulussa. Kaasun ääriviivasymboli on mallimerkki. Massan esityspatsas ei väitä kaasun ja nesteen tiheyttä tai tilavuutta samaksi.' };
}
