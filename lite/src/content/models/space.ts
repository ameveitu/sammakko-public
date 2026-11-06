export interface SpaceModel {
  kind: 'space';
  title: string;
  mode: 'size' | 'distance' | 'day' | 'seasons';
  /** Rotation of the island marker, with 0 facing the Sun in the day model. */
  rotation: 0 | 180;
  orbit: 'june' | 'december';
  /** Opposite sites in the same day scene. Defaults to only the island marker. */
  sites?: 2;
}

export const spaceDiametersKm = { moon: 3500, earth: 12700, sun: 1400000 };
export const meanSpaceDistancesKm = { earthMoon: 384400, earthSun: 150000000 };
/** The north end of the axis points the same way in both orbit positions. */
export const northAxis = { x: -Math.sin(23.4 * Math.PI / 180), y: -Math.cos(23.4 * Math.PI / 180) };

export function spaceLight(model: SpaceModel) {
  const sunDirection = model.orbit === 'june' ? -1 : 1;
  return {
    islandInDaylight: model.rotation === 0,
    northTiltedTowardSun: northAxis.x * sunDirection > 0,
    sunDirection,
    axis: northAxis,
  };
}
