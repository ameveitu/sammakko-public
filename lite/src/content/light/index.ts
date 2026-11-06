import type { NodeSpec } from '../../engine/types';
import { lighten, type LightAdapter } from './core';
import { atomicWorldLight } from './atomic-world';
import { dataProbabilityLight } from './data-probability';
import { functionGardenLight } from './function-garden';
import { geometryRelationsLight } from './geometry-relations';
import { inquiryIslandsLight } from './inquiry-islands';
import { materialsMixturesLight } from './materials-mixtures';
import { reactionLabLight } from './reaction-lab';
import { solidWorkshopLight } from './solid-workshop';
import { spatialMeasuresLight } from './spatial-measures';

/** Task kinds that have a light (one question) version in Saaristo. */
export const LIGHT_ADAPTERS: Readonly<Record<string, LightAdapter<any>>> = {
  'atomic-world': atomicWorldLight,
  'data-probability': dataProbabilityLight,
  'function-garden': functionGardenLight,
  'geometry-relations': geometryRelationsLight,
  'inquiry-islands': inquiryIslandsLight,
  'materials-mixtures': materialsMixturesLight,
  'reaction-lab': reactionLabLight,
  'solid-workshop': solidWorkshopLight,
  'spatial-measures': spatialMeasuresLight,
};

/** QA and the future full runtime can still open the full workbenches with `?full=1`. */
export const FULL_WORKBENCHES = typeof location !== 'undefined' && new URLSearchParams(location.search).has('full');

export function lightSpec(spec: NodeSpec): NodeSpec {
  return FULL_WORKBENCHES ? spec : lighten(spec, LIGHT_ADAPTERS);
}
