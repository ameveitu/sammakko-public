import {describe, expect, it} from 'vitest';
import {hasPublicationNavigation, publicationNavigation} from '../src/publication';

describe('combined publication boundary', () => {
  it.each(['/lite/', '/lite', '/lite/index.html'])('enables the website navigation on the marked combined page %s', pathname => {
    expect(hasPublicationNavigation(pathname, 'site')).toBe(true);
  });

  it.each(['/', '/index.html', '/preview/lite/', '/literature/', '/oppitunnit/'])('does not mistake another path for the combined Lite page: %s', pathname => {
    expect(hasPublicationNavigation(pathname, 'site')).toBe(false);
  });

  it('keeps standalone builds independent, even when hosted under /lite/', () => {
    expect(hasPublicationNavigation('/lite/', null)).toBe(false);
    expect(hasPublicationNavigation('/lite/', '')).toBe(false);
    expect(hasPublicationNavigation('/lite/', 'preview')).toBe(false);
  });

  it('uses the website route names without changing the canonical generic/workshop destinations', () => {
    expect(publicationNavigation.sections.filter(item => ['home', 'lessons', 'network'].includes(item.id)).map(item => [item.label, item.href])).toEqual([
      ['Etusivu', '/'], ['Oppitunnit', '/oppitunnit/'], ['Oppimisverkko', '/oppimisverkko/'],
    ]);
    expect(publicationNavigation.lite.href).toBe('/lite/');
    expect(publicationNavigation.workshop.href).toBe('/lite/#paja');
  });
});
