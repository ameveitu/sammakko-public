export interface SaaristoOptions {
  container: HTMLElement;
  assets?: { world?: string; characters?: string };
  reducedMotion?: boolean;
  paused?: boolean;
  publication?: boolean;
  interactive?: boolean;
  onStatus?: (status: { status: 'ready' | 'fallback'; reason?: string }) => void;
}
export interface SaaristoHandle {
  scene: any;
  camera: any;
  state: Record<string, any>;
  resize(width?: number, height?: number, dpr?: number): void;
  invalidate(): void;
  setActivityFocus(on: boolean, framing?: { target: [number, number, number]; span: number }): void;
  /** A local director's camera. null restores the ordinary Saaristo camera. */
  setCameraPose(pose: { position: [number, number, number]; target: [number, number, number]; fov: number } | null): void;
  setAtmosphere(preset: 'default' | 'cool' | 'warm' | 'twilight'): void;
  setBackdropVisible(visible: boolean): void;
  /** Absolute decorative time for paused cinematic playback; never advances task evidence. */
  renderAt(seconds: number): void;
  setCharactersVisible(visible: boolean): void;
  advanceTime(ms: number): void;
  setPaused(paused: boolean): void;
  /** Stops ambient movement while task apparatus continues on its own clock. */
  setWorkMode(working: boolean): void;
  dispose(): void;
}
export function mountSaaristo(options: SaaristoOptions): SaaristoHandle;
