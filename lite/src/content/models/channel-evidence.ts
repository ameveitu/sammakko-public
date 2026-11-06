/** Disclosed observations of a tabletop routing experiment, not a hydraulic law. */
export type RouteCase = 'A' | 'B' | 'C';
export interface ChannelObservation { route: RouteCase; nest: 'quiet' | 'disturbed'; waterfall: boolean }
export const CHANNEL_OBSERVATIONS: readonly ChannelObservation[] = Object.freeze([
  { route: 'A', nest: 'quiet', waterfall: false },
  { route: 'B', nest: 'disturbed', waterfall: true },
  { route: 'C', nest: 'quiet', waterfall: true },
]);
/** A lookup only: an unobserved arrangement does not acquire an invented prediction. */
export function observedRoute(route: string, observations: readonly ChannelObservation[] = CHANNEL_OBSERVATIONS): ChannelObservation | undefined {
  return observations.find(row => row.route === route);
}
export function matchingRoutes(observations: readonly ChannelObservation[] = CHANNEL_OBSERVATIONS): RouteCase[] {
  return observations.filter(row => row.nest === 'quiet' && row.waterfall).map(row => row.route);
}
