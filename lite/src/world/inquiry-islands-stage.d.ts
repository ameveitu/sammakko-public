import type { Group } from 'three';
import type { InquiryIslandsScene } from '../content/models/inquiry-islands-scene';
export function mountInquiryIslandsStage(parent: Group, model: InquiryIslandsScene): {
    snapshot(): Record<string, unknown>;
    advanceTime(ms?: number): void;
    dispose(): void;
};
