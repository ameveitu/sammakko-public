export interface FinaleCinema {
  ready: Promise<boolean>;
  setTime(seconds: number, reducedMotion?: boolean): void;
  snapshot(): Record<string, unknown>;
  dispose(): void;
}
export function mountFinaleCinema(container: HTMLElement, options?: { onStatus?: (status: 'loading' | 'ready' | 'fallback') => void }): FinaleCinema;
