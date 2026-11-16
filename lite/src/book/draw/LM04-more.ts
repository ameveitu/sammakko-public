import type { PageDraw } from '../pages';
import { groups } from '../figures';

/** Even: everyone gets a pair. */
export const DRAW: Record<string, () => PageDraw> = {
  'M-NUM-15': () => ({ beats: [
    groups({ sets: [{ n: 2, name: 'pari', color: '#2f9e5b' }, { n: 2, name: 'pari', color: '#2f9e5b' }, { n: 2, name: 'pari', color: '#2f9e5b' }], thing: 'dot', result: '6 = 3 paria: parillinen', label: 'Kuusi vierasta: kolme paria, kukaan ei jää yksin' }),
  ] }),
};
