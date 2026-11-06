import type { SaaristoHandle } from './saaristo/main';
export interface CharacterCandidate {
  id: string; name: string; facing: number; file: string; poster: string;
  clips: string[]; bytes: number; triangles: number; bones: number; sha256: string;
  status: 'local-review-candidate'; license: string; approval?: string;
}
export type CharacterView = 'front' | 'three-quarter' | 'side' | 'back';
export interface CharacterPreview {
  load(candidate: CharacterCandidate, url: string): Promise<boolean>;
  setClip(name: string): boolean;
  setView(view: CharacterView): void;
  setPaused(paused: boolean): void;
  advanceTime(ms: number): void;
  snapshot(): { status: string; character: string | null; clip: string | null; time: number; duration: number; paused: boolean; view: CharacterView; bounds: { minY: number; maxY: number } | null; bones: number };
  dispose(): void;
}
export function mountCharacterPreview(world: SaaristoHandle): CharacterPreview;
