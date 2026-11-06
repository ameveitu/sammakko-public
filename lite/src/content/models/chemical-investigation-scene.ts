import { liquidHeightFraction, vesselWidths } from './measurement-station';
import { initialInvestigationInstrument, investigationMeter, MENISCUS_RELATIVE_LIFT, replayInvestigationInstrument,
  type ChemicalInvestigationResponse, type ChemicalInvestigationTask, type InvestigationInstrument } from './chemical-investigation';

export interface ChemicalInvestigationScene {
  kind: 'chemical-investigation'; title: string; mode: 'tool' | 'mass' | 'liquid';
  instrument: InvestigationInstrument | null; samplePlaced: boolean; containerPlaced: boolean; eyeLevel: boolean; read: boolean;
  transfer?: { sourceUl: number; heldUl: number; receiverUl: number; capacityUl: number; receiverCapacityUl: number };
  meter?: { readingMg: number; minMg: number; maxMg: number; divisionMg: number; pointer: number; tared: boolean };
  liquid?: { volumeUl: number; capacityUl: number; divisionUl: number; heightFraction: number; shape: 'cylinder' | 'flared'; topWidth: number; baseWidth: number; edgeFraction: number; readPoint: 'bottom' | 'edge' | null; ticks: { volumeUl: number; heightFraction: number }[] };
  legend: string;
}
/** Projection of the currently operated virtual instrument. Unloaded sample values stay outside the public scene. */
export function chemicalInvestigationScene(task: ChemicalInvestigationTask, response?: ChemicalInvestigationResponse): ChemicalInvestigationScene | undefined {
  if (task.mode !== 'tool' && task.mode !== 'measure') return;
  const actions = response?.kind === 'chemical-investigation' && response.mode === task.mode && Array.isArray(response.actions) ? response.actions : [];
  const state = actions.length ? replayInvestigationInstrument(task, actions) : initialInvestigationInstrument(task);
  const instrument = task.instruments.find(tool => tool.id === state.instrument) ?? null;
  const model: ChemicalInvestigationScene = {
    kind: 'chemical-investigation', title: task.title, mode: task.mode === 'tool' ? 'tool' : task.quantity === 'mass' ? 'mass' : 'liquid',
    instrument, samplePlaced: state.samplePlaced, containerPlaced: state.containerPlaced, eyeLevel: state.eyeLevel, read: state.read,
    legend: 'Annettu virtuaalinen kalibrointimalli. Tilavuudet ja massat tarkistetaan täsmällisellä 2D-pöydällä. Fyysinen välineenkäsittely arvioidaan erikseen.',
  };
  if (task.mode === 'tool') {
    model.transfer = { sourceUl: state.sourceUl, heldUl: state.heldUl, receiverUl: state.receiverUl,
      capacityUl: task.sourceUl, receiverCapacityUl: Math.max(task.sourceUl, task.requestedUl) };
  } else if (task.quantity === 'mass' && instrument?.quantity === 'mass') {
    const reading = investigationMeter(task, state), minimum = -instrument.division * 5, maximum = instrument.capacity;
    model.meter = { readingMg: reading, minMg: minimum, maxMg: maximum, divisionMg: instrument.division,
      pointer: (reading - minimum) / (maximum - minimum), tared: state.taredContainer };
  } else if (task.quantity === 'volume' && instrument?.quantity === 'volume') {
    const amount = state.samplePlaced ? task.amount : 0;
    model.liquid = { volumeUl: amount, capacityUl: instrument.capacity, divisionUl: instrument.division,
      heightFraction: liquidHeightFraction(task.shape, amount, instrument.capacity), edgeFraction: Math.min(1, liquidHeightFraction(task.shape, amount, instrument.capacity) + MENISCUS_RELATIVE_LIFT), readPoint: response?.mode === 'measure' ? response.meniscus : null, shape: task.shape,
      topWidth: task.shape === 'flared' ? vesselWidths.top : 92, baseWidth: task.shape === 'flared' ? vesselWidths.base : 92, ticks: Array.from({ length: Math.min(200, Math.floor(instrument.capacity / instrument.division)) + 1 }, (_, i) => ({ volumeUl: i * instrument.division, heightFraction: liquidHeightFraction(task.shape, i * instrument.division, instrument.capacity) })) };
  }
  return model;
}
