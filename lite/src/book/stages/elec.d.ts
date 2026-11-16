import type { BookStage, StageOptions } from '../types';

export declare function mountElecStage(host: HTMLElement, options: StageOptions): BookStage & {
  debug(): { view: string; t: number; power: number; repaired: boolean; sparks: number; badge: string };
};
