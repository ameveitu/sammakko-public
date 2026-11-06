import definition from '../../public/shared/navigation.json';

/** Copy and destinations are shared with the static website generators. */
export const publicationNavigation = definition;

/** Only the checked combined-site packager adds this document marker. */
export function hasPublicationNavigation(pathname: string, marker: string | null): boolean {
  return marker === 'site' && /^\/lite(?:\/|$)/.test(pathname);
}
