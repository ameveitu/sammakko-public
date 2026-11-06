import { lightSpec } from './light';
import { decimalLedgerSpec, decimalLedgerEvidence } from './decimal-ledger';
import { integrationExplanationSpecs, integrationExplanationEvidence, integrationExplanationIds } from './integration-explanations';
import { lifecycleHarborSpecs, lifecycleHarborEvidence } from './lifecycle-harbor';
import { reactionLabSpecs, reactionLabEvidence } from './reaction-lab';
import { matterCyclesSpecs, matterCyclesEvidence } from './matter-cycles';
import { inquiryIslandsSpecs, inquiryIslandsEvidence } from './inquiry-islands';
import { carbonKitchenSpecs, carbonKitchenEvidence } from './carbon-kitchen';
import { atomicWorldSpecs, atomicWorldEvidence } from './atomic-world';
import { safetyHarborSpecs, safetyHarborEvidence } from './safety-harbor';
import { wavesObservatorySpecs, wavesObservatoryEvidence } from './waves-observatory';
import { solutionLabSpecs, solutionLabEvidence } from './solution-lab';
import { logicWorkshopSpecs, logicWorkshopEvidence } from './logic-workshop';
import { chemicalInvestigationSpecs, chemicalInvestigationEvidence } from './chemical-investigation';
import { physicsInvestigationSpecs, physicsInvestigationEvidence } from './physics-investigation';
import { materialsMixturesSpecs, materialsMixturesEvidence } from './materials-mixtures';
import { chemicalNotationSpecs, chemicalNotationEvidence } from './chemical-notation';
import { planeMeasuresSpecs, planeMeasuresEvidence } from './plane-measures';
import { algorithmStudioSpecs, algorithmStudioEvidence } from './algorithm-studio';
import { numberEquivalencesSpecs, numberEquivalencesEvidence } from './number-equivalences';
import { energyIslandsSpecs, energyIslandsEvidence } from './energy-islands';
import { advancedSolidsSpecs, advancedSolidsEvidence } from './advanced-solids';
import { functionGardenSpecs, functionGardenEvidence } from './function-garden';
import { circuitWorkshopSpecs, circuitWorkshopEvidence } from './circuit-workshop';
import { circleObservatorySpecs, circleObservatoryEvidence } from './circle-observatory';
import { rightTriangleSpecs, rightTriangleEvidence } from './right-triangle';
import { relationWorkshopSpecs, relationWorkshopEvidence } from './relation-workshop';
import { electricityHarborSpecs, electricityHarborEvidence } from './electricity-harbor';
import { statisticsHarborSpecs, statisticsHarborEvidence } from './statistics-harbor';
import { geometryRelationsSpecs, geometryRelationsEvidence } from './geometry-relations';
import { thermalStationSpecs, thermalStationEvidence } from './thermal-station';
import { rootWorkshopSpecs, rootWorkshopEvidence } from './root-workshop';
import { programmingFerrySpecs, programmingFerryEvidence } from './programming-ferries';
import { dataProbabilitySpecs, dataProbabilityEvidence } from './data-probability';
import { measurementStationSpecs, measurementStationEvidence } from './measurement-station';
import { spatialMeasureSpecs, spatialMeasureEvidence } from './spatial-measures';
import { numberJourneySpecs, numberJourneyEvidence } from './number-journey';
import { arithmeticReasoningSpecs, arithmeticReasoningEvidence } from './arithmetic-reasoning';
import { solidConstructionSpecs, solidConstructionEvidence } from './solid-construction';
import { powerRuleSpecs, powerRuleEvidence } from './power-rules';
import { solidWorkshopSpecs, solidWorkshopEvidence } from './solid-workshop';
import { CONTENT_REV, NODES } from './index';
import { CAKE_NODE } from './fractions/cake-node';
import { revisedQuantitySpecs, revisedQuantityEvidence } from './revised-quantity';
import { correctionModelSpecs, correctionModelEvidence } from './correction-models';
import { fractionWorkshopSpecs, fractionWorkshopEvidence } from './fraction-workshop';
import { spaceObservatorySpecs, spaceObservatoryEvidence } from './space-observatory';
import { changedAmountSpec, changedAmountEvidence } from './changed-amount';
import { decimalWorkshopSpecs, decimalWorkshopEvidence } from './decimal-workshop';
import { forceWorkshopSpecs, forceWorkshopEvidence } from './force-workshop';
import { polynomialWorkshopSpecs, polynomialWorkshopEvidence } from './polynomial-workshop';
import { rationalLinksSpecs, rationalLinksEvidence } from './rational-links';
import { equationWorkshopSpecs, equationWorkshopEvidence } from './equation-workshop';
import { observedExplanationSpecs, observedExplanationEvidence } from './observed-explanations';
import { workPowerSpecs, workPowerEvidence } from './work-power';
import { sailShapeSpecs, sailShapeEvidence } from './sail-shapes';
import { problemWorkbenchSpecs, problemWorkbenchEvidence } from './problem-workbench';
import { expeditionSliceEvidence, expeditionSliceSpecs } from './expedition-slice';
import type { NodeSpec } from '../engine/types';

/** Availability is explicit. A treatment in the 690 catalog is not a lesson. */
export const EXPEDITION_ADDITIONS = [
  ...expeditionSliceSpecs.filter(spec=>!integrationExplanationIds.includes(spec.id as typeof integrationExplanationIds[number])),
  ...integrationExplanationSpecs,
  decimalLedgerSpec,
  ...revisedQuantitySpecs,
  // The expanded graph workshop supersedes the earlier limited board-length scene.
  // Its new revision keeps old attempts in history without broadening their evidence.
  // SCI-ENV-MODEL-02 v2 is the one revised existing node: Inquiry15 replaces the v1 selection task.
  ...correctionModelSpecs.filter(spec => spec.id !== 'M79-SYSTEM-GRAPH' && spec.id !== 'SCI-ENV-MODEL-02'),
  ...fractionWorkshopSpecs,
  ...spaceObservatorySpecs,
  ...decimalWorkshopSpecs.filter(spec=>spec.id!=='M-DEC-07'),
  ...forceWorkshopSpecs,
  ...polynomialWorkshopSpecs,
  ...rationalLinksSpecs,
  ...equationWorkshopSpecs,
  ...observedExplanationSpecs,
  ...workPowerSpecs,
  ...sailShapeSpecs,
  ...problemWorkbenchSpecs,
  ...solidWorkshopSpecs,
  ...solidConstructionSpecs,
  ...powerRuleSpecs,
  ...arithmeticReasoningSpecs,
  ...numberJourneySpecs,
  ...spatialMeasureSpecs,
  ...rootWorkshopSpecs,
  ...geometryRelationsSpecs,
  ...statisticsHarborSpecs,
  ...electricityHarborSpecs,
  ...rightTriangleSpecs,
  ...circleObservatorySpecs,
  ...circuitWorkshopSpecs,
  ...numberEquivalencesSpecs,
  ...planeMeasuresSpecs,
  ...chemicalNotationSpecs,
  ...solutionLabSpecs,
  ...logicWorkshopSpecs,
  ...chemicalInvestigationSpecs,
  ...wavesObservatorySpecs,
  ...safetyHarborSpecs,
  ...atomicWorldSpecs,
  ...lifecycleHarborSpecs,
  ...reactionLabSpecs,
  ...matterCyclesSpecs,
  ...inquiryIslandsSpecs,
  ...carbonKitchenSpecs,
  ...materialsMixturesSpecs,
  ...physicsInvestigationSpecs,
  ...algorithmStudioSpecs,
  ...functionGardenSpecs,
  ...advancedSolidsSpecs,
  ...energyIslandsSpecs,
  ...relationWorkshopSpecs,
  ...thermalStationSpecs,
  ...programmingFerrySpecs,
  ...dataProbabilitySpecs,
  ...measurementStationSpecs,
  changedAmountSpec,
  CAKE_NODE,
] as const;
export const EXPEDITION_NODES: Readonly<Record<string, NodeSpec>> = Object.freeze({
  ...NODES,
  ...Object.fromEntries(EXPEDITION_ADDITIONS.map(spec => [spec.id, lightSpec(spec)])),
});

export const SLICE_IDS = [
  'M-NUM-QTY-NUMERAL', 'M-FRAC-01', 'M-FRAC-13', 'M-GMEAS-05',
  'M-SCALE-03', 'M-PCT-01', 'PHY79-FORCE-MOTION', 'PHY79-ACTIONPAIR',
  'PHY79-PARALLEL', 'CHEM79-FILTRATION', 'CHEM79-FIRE-SAFE', 'ENV-PHY-SPACE-01',
] as const;

export const expeditionRevision = (id: string) => EXPEDITION_NODES[id]?.rev ?? CONTENT_REV;
export const EXPEDITION_EVIDENCE = {
  ...expeditionSliceEvidence,
  ...revisedQuantityEvidence,
  ...correctionModelEvidence,
  ...fractionWorkshopEvidence,
  ...spaceObservatoryEvidence,
  ...decimalWorkshopEvidence,
  ...forceWorkshopEvidence,
  ...polynomialWorkshopEvidence,
  ...rationalLinksEvidence,
  ...equationWorkshopEvidence,
  ...observedExplanationEvidence,
  ...workPowerEvidence,
  ...sailShapeEvidence,
  ...problemWorkbenchEvidence,
  ...solidWorkshopEvidence,
  ...solidConstructionEvidence,
  ...powerRuleEvidence,
  ...arithmeticReasoningEvidence,
  ...numberJourneyEvidence,
  ...spatialMeasureEvidence,
  ...rootWorkshopEvidence,
  ...geometryRelationsEvidence,
  ...statisticsHarborEvidence,
  ...electricityHarborEvidence,
  ...rightTriangleEvidence,
  ...circleObservatoryEvidence,
  ...circuitWorkshopEvidence,
  ...numberEquivalencesEvidence,
  ...planeMeasuresEvidence,
  ...chemicalNotationEvidence,
  ...solutionLabEvidence,
  ...logicWorkshopEvidence,
  ...chemicalInvestigationEvidence,
  ...wavesObservatoryEvidence,
  ...safetyHarborEvidence,
  ...atomicWorldEvidence,
  ...lifecycleHarborEvidence,
  ...decimalLedgerEvidence,
  ...integrationExplanationEvidence,
  ...reactionLabEvidence,
  ...matterCyclesEvidence,
  ...inquiryIslandsEvidence,
  ...carbonKitchenEvidence,
  ...materialsMixturesEvidence,
  ...physicsInvestigationEvidence,
  ...algorithmStudioEvidence,
  ...functionGardenEvidence,
  ...advancedSolidsEvidence,
  ...energyIslandsEvidence,
  ...relationWorkshopEvidence,
  ...thermalStationEvidence,
  ...programmingFerryEvidence,
  ...dataProbabilityEvidence,
  ...measurementStationEvidence,
  ...changedAmountEvidence,
};

export function expeditionEvidenceLimit(id: string): string | undefined {
  return EXPEDITION_EVIDENCE[id]?.limit;
}
