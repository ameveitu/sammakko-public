import type { Group } from 'three';
import type { ReactionShape } from '../content/models/reaction-lab';
import type { ReactionLabScene } from '../content/models/reaction-lab-scene';
export function reactionFragmentDimensions(shape: ReactionShape, reacted: number, limit: number): number[];
export function mountReactionLabStage(parent: Group, model: ReactionLabScene, revealed?: boolean): {
    snapshot(): Record<string, unknown>;
    advanceTime(ms: number): void;
    dispose(): void;
};
