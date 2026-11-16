import type { BookStage, StageOptions } from '../types';

/** Orbit stations in the order the Earth moves: winter (north tilted away) first. */
export declare const SEASONS: readonly ['winter', 'spring', 'summer', 'autumn'];
/** Index of the right option in the spin try. */
export declare const SPIN_RIGHT: number;
export declare function mountSpaceStage(host: HTMLElement, options: StageOptions): BookStage & {
  debug(): { view: string; season: string; seasonNow: string; sleeping: boolean; armed: boolean; answered: boolean };
};
