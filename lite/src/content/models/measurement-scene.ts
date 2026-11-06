import { liquidHeightFraction, massBeamMark, massDisplayGrams, type Eye, type MeasurementStationResponse, type MeasurementStationTask } from './measurement-station';

export type MeasurementStationScene = { kind: 'measurement-station'; title: string } & (
  | { mode: 'mass'; basket: boolean; loaded: boolean; zeroed: boolean; display: 'digital' | 'beam'; needle: number }
  | { mode: 'liquid'; vessel: 'cylinder' | 'flared'; fillHeight: number; ticks: number[]; eye: Eye | null }
  | { mode: 'cube'; cubes: number; filled: number; partial: number; available: number }
);

export function measurementStationScene(task: MeasurementStationTask, response?: MeasurementStationResponse): MeasurementStationScene | undefined {
  const common = { kind: 'measurement-station' as const, title: task.object };
  switch (task.mode) {
    case 'mass': {
      const state = response?.mode === 'mass' ? response : undefined;
      const basket = !!state?.basketPlaced, loaded = !!state?.placed;
      const grams = massDisplayGrams(task, basket, loaded, state?.zeroed ?? null);
      return { ...common, mode: 'mass', basket, loaded, zeroed: !!state?.zeroed, display: task.display,
        needle: massBeamMark(grams).fraction };
    }
    case 'liquid': {
      const state = response?.mode === 'liquid' ? response : undefined;
      const height = (amount: number) => liquidHeightFraction(task.shape, amount, task.capacity);
      return { ...common, mode: 'liquid', vessel: task.shape, fillHeight: height(state?.filled ?? task.initial),
        ticks: Array.from({ length: task.capacity / task.step + 1 }, (_, i) => height(i * task.step)), eye: state?.eye ?? null };
    }
    case 'cube': {
      const pouredDl = response?.mode === 'cube' ? response.pouredDl : 0;
      const filled = Math.floor(pouredDl / 10);
      return { ...common, mode: 'cube', filled, partial: (pouredDl % 10) / 10,
        cubes: task.direction === 'from-cubes' ? task.amount : Math.ceil(pouredDl / 10),
        available: (task.amount * 10 - pouredDl) / 10 };
    }
    default: return undefined;
  }
}
