import type { PageDraw } from '../pages';
import { unitCubes } from '../figures';

/** Volume units: a litre is a cube with 1 dm edges. */
export const DRAW: Record<string, () => PageDraw> = {
  'M-UNIT-06': () => ({ beats: [
    unitCubes({ layers: 10, label: 'Särmä 10 cm: kuutioon mahtuu 1 litra', note: 'särmä 1 dm = 10 cm · 1 dm³ = 1 l' }),
  ] }),
};
