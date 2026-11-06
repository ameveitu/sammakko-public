import type { Group } from 'three';
import type { AtomicWorldScene, AtomicPhaseChamber } from '../content/models/atomic-world';
export function atomicChamberPose(chamber: AtomicPhaseChamber, index: number, timeMs: number, experiment?: AtomicWorldScene['experiment'], observed?: boolean): number[];
export function mountAtomicWorldStage(parent: Group, model: AtomicWorldScene, revealed?: boolean): {
    snapshot(): Record<string, unknown>;
    advanceTime(ms: number): void;
    dispose(): void;
};
