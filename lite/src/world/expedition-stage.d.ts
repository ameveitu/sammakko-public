import type { ExpeditionSceneModel } from '../content/expedition-slice';
import type { CakeTask, CakePartition } from '../content/fractions/cake-table';
import type { SaaristoHandle } from './saaristo/main';
export type StageModel = ExpeditionSceneModel | { kind: 'cake'; task: CakeTask; partition?: CakePartition; partitions?: readonly [CakePartition, CakePartition] };
export interface ExpeditionStage {
  show(model: StageModel, options?: { revealed?: boolean }): void;
  advanceTime(ms: number): void;
  celebrate(effectId: string): void;
  restoreEffects(ids: readonly string[]): void;
  clear(): void;
  setVisible(visible: boolean): void;
  dispose(): void;
  snapshot(): Record<string, unknown>;
}
export function mountExpeditionStage(world: SaaristoHandle): ExpeditionStage;
