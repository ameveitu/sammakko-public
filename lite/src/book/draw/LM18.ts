import type { PageDraw } from '../pages';
import { meniscus, tare } from '../figures';

/** Measuring: zero the scale first, read a jug at the bottom of the curve. */
export const DRAW: Record<string, () => PageDraw> = {
  'M-MEAS-07': () => ({ beats: [
    tare({ reading: '30 g', label: 'Tyhjä vaaka näyttää 30 g', note: 'paina nollausnappia: 0 g' }),
  ] }),
  'M-MEAS-10': () => ({ beats: [
    meniscus('Pinta kaartuu reunoilla: luetaan alimmasta kohdasta', { mark: 'pinnan alin kohta', jug: true }),
  ] }),
};
