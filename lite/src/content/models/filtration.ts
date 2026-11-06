/** Model of one coarse filter with stated openings and grains. Equal sizes are avoided. */
export interface Filtration {
  kind: 'filtration';
  title: string;
  poreMicrometers: number;
  grainMicrometers: number;
  grainName: string;
  dissolvedSalt: boolean;
  view: 'macro' | 'grain' | 'ion';
}

export function filtrationOutcome(model: Filtration) {
  const grainRetained = model.grainMicrometers > model.poreMicrometers;
  return {
    grainRetained,
    waterPasses: true,
    saltPasses: model.dissolvedSalt,
    clearInThisModel: grainRetained,
    safeToDrinkEstablished: false,
  };
}
