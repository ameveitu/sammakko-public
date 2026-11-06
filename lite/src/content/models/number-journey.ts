export interface NumberContext { title: string; skills: readonly string[] }
export type Point = { x: number; y: number };
export type Direction = 'north' | 'east' | 'south' | 'west';
export type Relative = 'forward' | 'back' | 'left' | 'right';
export type Pair = readonly [string, string];
export type Meaning = 'quantity' | 'ordinal' | 'length' | 'identifier';

export type NumberMode =
  | { mode: 'grouped'; parts: readonly number[]; pattern: 'dice' | 'rows' | 'uneven'; object: string }
  | { mode: 'estimate'; amount: number; bands: readonly (readonly [number, number])[]; pattern: 'loose' | 'clusters' | 'sizes'; object: string }
  | { mode: 'neighbors'; center: number; view: 'path' | 'quay' | 'cards' }
  | { mode: 'order'; cards: readonly { id: string; value: number }[]; descending: boolean; view: 'numbers' | 'amounts' }
  | { mode: 'meaning'; cards: readonly { id: string; text: string; meaning: Meaning }[]; target: string; count: number; object: string }
  | { mode: 'ordinal'; first: readonly string[]; changed: readonly string[]; place: number; fromEnd: boolean; vertical: boolean; changedFromEnd: boolean }
  | { mode: 'pair'; activity: 'parity'; count: number; object: string; dispersed?: boolean }
  | { mode: 'pair'; activity: 'difference'; a: number; b: number; object: string; bars?: boolean }
  | { mode: 'add-law'; activity: 'commute' | 'associate'; counts: readonly number[]; symbolic?: boolean; preferred?: boolean }
  | { mode: 'operation'; story: 'join' | 'take' | 'compare'; a: number; b: number; object: string }
  | { mode: 'move'; start: number; delta: number; min: number; max: number }
  | { mode: 'route'; origin: Point; heading: Direction; frame: 'fixed'; steps: readonly Direction[] }
  | { mode: 'route'; origin: Point; heading: Direction; frame: 'actor'; steps: readonly Relative[] };

export type NumberJourneyTask = NumberMode & {
  kind: 'number-journey';
  context: NumberContext;
  givens: readonly { label: string; value: string }[];
};

type Work =
  | { mode: 'grouped'; parts: number[]; total: number }
  | { mode: 'estimate'; band: number; groupedCount: number }
  | { mode: 'neighbors'; previous: number | null; next: number }
  | { mode: 'order'; ids: string[] }
  | { mode: 'meaning'; quantities: string[]; built: number }
  | { mode: 'ordinal'; object: string; newPlace: number }
  | { mode: 'pair'; pairs: Pair[]; single: number; classification: 'even' | 'odd' | null; larger: 'a' | 'b' | 'equal' | null; minuend: number; subtrahend: number }
  | { mode: 'add-law'; views: number[]; operands: number[][]; inside: number[]; totals: number[]; choice: number }
  | { mode: 'operation'; operation: '+' | '−' | null; first: number; second: number; result: number }
  | { mode: 'move'; positions: number[]; value: number }
  | { mode: 'route'; moves: Direction[]; end: Point };
export type NumberJourneyResponse = Work & { kind: 'number-journey' };

const answer = <T extends Work>(work: T): T & { kind: 'number-journey' } => ({ kind: 'number-journey', ...work });
const yes = { ok: true };
const no = (why: string) => ({ ok: false, why });
const sum = (values: readonly number[]) => values.reduce((a, b) => a + b, 0);
const same = <T>(a: readonly T[], b: readonly T[]) => Array.isArray(a) && a.length === b.length && b.every((value, i) => a[i] === value);
const sameSet = <T>(a: readonly T[], b: readonly T[]) => Array.isArray(a) && a.length === b.length && new Set(a).size === a.length && b.every(value => a.includes(value));
const unique = (keys: readonly string[]) => new Set(keys).size === keys.length;
const sequenceIds = (n: number, prefix: string) => Array.from({ length: n }, (_, i) => `${prefix}${i + 1}`);
export const pairIds = (task: Extract<NumberMode, { mode: 'pair' }>) =>
  task.activity === 'parity' ? [sequenceIds(task.count, 'p')] : [sequenceIds(task.a, 'a'), sequenceIds(task.b, 'b')];

export function ordinalAt(values: readonly string[], place: number, fromEnd: boolean) {
  return values[fromEnd ? values.length - place : place - 1];
}
export function ordinalOf(values: readonly string[], object: string, fromEnd: boolean) {
  const index = values.indexOf(object);
  return index < 0 ? 0 : fromEnd ? values.length - index : index + 1;
}

export const compass = ['north', 'east', 'south', 'west'] as const;
const relativeOffset: Record<Relative, number> = { forward: 0, right: 1, back: 2, left: 3 };
const directions: Record<Direction, Point> = { north: { x: 0, y: -1 }, east: { x: 1, y: 0 }, south: { x: 0, y: 1 }, west: { x: -1, y: 0 } };
export function worldSteps(task: Extract<NumberMode, { mode: 'route' }>): Direction[] {
  return task.frame === 'fixed' ? [...task.steps] : task.steps.map(step => compass[(compass.indexOf(task.heading) + relativeOffset[step]) % 4]!);
}
export function advance(point: Point, direction: Direction): Point {
  const delta = directions[direction];
  return { x: point.x + delta.x, y: point.y + delta.y };
}
const endpoint = (origin: Point, moves: readonly Direction[]) => moves.reduce(advance, origin);
const samePoint = (a: Point, b: Point) => a?.x === b.x && a?.y === b.y;

export function estimateGroups(amount: number) {
  return [...Array.from({ length: Math.floor(amount / 5) }, () => 5), ...(amount % 5 ? [amount % 5] : [])];
}

function lawParts(task: Extract<NumberMode, { mode: 'add-law' }>) {
  const [a, b, c] = task.counts;
  return task.activity === 'commute' ? { operands: [[a!, b!], [b!, a!]], inside: [] }
    : { operands: [[a!, b!, c!], [a!, b!, c!]], inside: [a! + b!, b! + c!] };
}

function pairEvidence(task: Extract<NumberMode, { mode: 'pair' }>, pairs: readonly Pair[]) {
  if (!Array.isArray(pairs) || !pairs.every(pair => Array.isArray(pair) && pair.length === 2)) return false;
  const [a, b] = pairIds(task);
  const all = new Set([...(a ?? []), ...(b ?? [])]);
  const used = pairs.flat();
  if (!unique(used) || used.some(key => !all.has(key))) return false;
  return task.activity === 'parity' ? pairs.length === Math.floor(task.count / 2)
    : pairs.length === Math.min(task.a, task.b) && pairs.every(([x, y]) => x[0] !== y[0]);
}

export function checkNumberJourney(task: NumberJourneyTask, response: NumberJourneyResponse): { ok: boolean; why?: string } {
  if (task.mode !== response.mode) return no('Täydennä tämän tehtävän merkinnät.');
  switch (task.mode) {
    case 'grouped':
      return response.mode === 'grouped' && same(response.parts, task.parts) && response.total === sum(task.parts)
        ? yes : no('Kirjoita kunkin näkyvän ryhmän määrä. Laske sitten kaikkien ryhmien määrät yhteen.');
    case 'estimate': {
      if (response.mode !== 'estimate') return no('Valitse ensin arvioalue.');
      const band = task.bands[response.band];
      if (!band || task.amount < band[0] || task.amount > band[1]) return no('Tarkista arvion suuruusluokka vertaamalla sitä nyt näkyviin ryhmiin.');
      return response.groupedCount === task.amount ? yes : no('Laske ryhmistä tarkka määrä ja vertaa sitä arvioalueeseen.');
    }
    case 'neighbors':
      return response.mode === 'neighbors' && response.previous === (task.center === 0 ? null : task.center - 1) && response.next === task.center + 1
        ? yes : no('Seuraaja on yhtä suurempi ja edeltäjä yhtä pienempi. Luonnollisissa luvuissa nollalla ei ole edeltäjää.');
    case 'order': {
      if (response.mode !== 'order' || !sameSet(response.ids, task.cards.map(card => card.id))) return no('Käytä jokaista numerokorttia kerran.');
      const lookup = new Map(task.cards.map(card => [card.id, card.value]));
      const values = response.ids.map(id => lookup.get(id)!);
      return values.slice(1).every((value, i) => task.descending ? values[i]! >= value : values[i]! <= value)
        ? yes : no('Tarkista vierekkäiset kortit. Saman suuruiset luvut voivat olla kummassa järjestyksessä tahansa.');
    }
    case 'meaning':
      if (response.mode !== 'meaning' || !sameSet(response.quantities, task.cards.filter(card => card.meaning === 'quantity').map(card => card.id))) {
        return no('Määräluku kertoo, kuinka monta kohdetta on. Järjestysnumero, mittalukema ja tunnus tarkoittavat muuta.');
      }
      return response.built === task.count ? yes : no('Rakenna pyydetyn määräkortin kokoinen joukko.');
    case 'ordinal': {
      if (response.mode !== 'ordinal') return no('Tarkista jonon alkupää.');
      const object = ordinalAt(task.first, task.place, task.fromEnd);
      return response.object === object && response.newPlace === ordinalOf(task.changed, object!, task.changedFromEnd)
        ? yes : no('Aloita nimetystä päästä. Etsi sama kohde uudesta jonosta ja laske sen vuoro uudelleen.');
    }
    case 'pair': {
      if (response.mode !== 'pair' || !pairEvidence(task, response.pairs)) return no(task.activity === 'parity'
        ? 'Tee niin monta kahden kohteen paria kuin voit. Käytä kutakin kohdetta vain kerran.'
        : 'Yhdistä aina yksi kohde kummastakin joukosta. Jatka, kunnes pienemmän joukon kaikki kohteet ovat pareina.');
      if (task.activity === 'parity') {
        const single = task.count % 2;
        return response.single === single && response.classification === (single ? 'odd' : 'even')
          ? yes : no('Parillisessa määrässä kaikki löytävät parin. Parittomassa yksi jää ilman paria.');
      }
      const larger = task.a === task.b ? 'equal' : task.a > task.b ? 'a' : 'b';
      return response.larger === larger && response.single === Math.abs(task.a - task.b) &&
        response.minuend === Math.max(task.a, task.b) && response.subtrahend === Math.min(task.a, task.b)
        ? yes : no('Suuremmasta määrästä vähennetään pienempi. Erotus on ilman paria jäävä määrä.');
    }
    case 'add-law': {
      if (response.mode !== 'add-law' || !sameSet(response.views, [0, 1])) return no('Tarkista molemmat näkymät samoista kohteista.');
      const expected = lawParts(task);
      if (!Array.isArray(response.operands) || response.operands.length !== 2 || !expected.operands.every((values, i) => same(response.operands[i]!, values)) ||
          !same(response.inside, expected.inside)) return no(task.activity === 'commute'
        ? 'Kirjoita molemmissa näkymissä korien määrät siinä järjestyksessä, jossa ne näkyvät.'
        : 'Kirjoita kaikki kolme määrää ja laske myös sulkujen sisällä olevat osat.');
      const amount = sum(task.counts);
      return same(response.totals, [amount, amount]) && (!task.preferred || [0, 1].includes(response.choice)) ? yes
        : no('Kaikki kohteet ovat mukana molemmissa laskuissa. Tarkista kokonaismäärät ja valitse tarvittaessa sinulle helpompi ryhmittely.');
    }
    case 'operation': {
      if (response.mode !== 'operation' || response.operation !== (task.story === 'join' ? '+' : '−')) {
        return no('Valitse teko tilanteen perusteella: yhdistä, ota pois tai vertaa. Pelkkä lopputulos ei ratkaise laskutapaa.');
      }
      const direct = response.first === task.a && response.second === task.b;
      const swapped = task.story === 'join' && response.first === task.b && response.second === task.a;
      const total = task.story === 'join' ? task.a + task.b : task.a - task.b;
      return (direct || swapped) && response.result === total ? yes : no('Liitä laskun luvut tilanteen määriin ja tarkista tulos.');
    }
    case 'move': {
      if (response.mode !== 'move') return no('Näytä liike lukusuoralla.');
      const expected = Array.from({ length: Math.abs(task.delta) + 1 }, (_, i) => task.start + i * Math.sign(task.delta));
      return same(response.positions, expected) && response.value === expected.at(-1) ? yes
        : no('Aloita merkitystä luvusta. Käytä muutoksen suuntaa ja pituutta. Lopuksi merkitse kohta, johon päädyit.');
    }
    case 'route': {
      if (response.mode !== 'route') return no('Tee reitti.');
      const steps = worldSteps(task);
      return same(response.moves, steps) && samePoint(response.end, endpoint(task.origin, steps)) ? yes
        : no(task.frame === 'fixed' ? 'Käytä kartan nuolia, vaikka Loikka katsoo eri suuntaan.'
          : 'Lue vasen ja oikea Loikan lähtösuunnasta. Nuoli kertoo, mihin päin hän katsoo koko reitin ajan.');
    }
  }
}

export function solutionNumberJourney(task: NumberJourneyTask): NumberJourneyResponse {
  switch (task.mode) {
    case 'grouped': return answer({ mode: 'grouped', parts: [...task.parts], total: sum(task.parts) });
    case 'estimate': return answer({ mode: 'estimate', band: task.bands.findIndex(([a, b]) => task.amount >= a && task.amount <= b), groupedCount: task.amount });
    case 'neighbors': return answer({ mode: 'neighbors', previous: task.center === 0 ? null : task.center - 1, next: task.center + 1 });
    case 'order': return answer({ mode: 'order', ids: [...task.cards].sort((a, b) => task.descending ? b.value - a.value : a.value - b.value).map(card => card.id) });
    case 'meaning': return answer({ mode: 'meaning', quantities: task.cards.filter(card => card.meaning === 'quantity').map(card => card.id), built: task.count });
    case 'ordinal': {
      const object = ordinalAt(task.first, task.place, task.fromEnd)!;
      return answer({ mode: 'ordinal', object, newPlace: ordinalOf(task.changed, object, task.changedFromEnd) });
    }
    case 'pair': {
      const [a, b] = pairIds(task);
      if (task.activity === 'parity') {
        const pairs = Array.from({ length: Math.floor(task.count / 2) }, (_, i) => [a![2 * i]!, a![2 * i + 1]!] as const);
        return answer({ mode: 'pair', pairs, single: task.count % 2, classification: task.count % 2 ? 'odd' : 'even', larger: null, minuend: 0, subtrahend: 0 });
      }
      return answer({ mode: 'pair', pairs: Array.from({ length: Math.min(task.a, task.b) }, (_, i) => [a![i]!, b![i]!] as const),
        single: Math.abs(task.a - task.b), classification: null, larger: task.a === task.b ? 'equal' : task.a > task.b ? 'a' : 'b',
        minuend: Math.max(task.a, task.b), subtrahend: Math.min(task.a, task.b) });
    }
    case 'add-law': return answer({ mode: 'add-law', views: [0, 1], ...lawParts(task), totals: [sum(task.counts), sum(task.counts)], choice: 0 });
    case 'operation': return answer({ mode: 'operation', operation: task.story === 'join' ? '+' : '−', first: task.a, second: task.b,
      result: task.story === 'join' ? task.a + task.b : task.a - task.b });
    case 'move': return answer({ mode: 'move', positions: Array.from({ length: Math.abs(task.delta) + 1 }, (_, i) => task.start + i * Math.sign(task.delta)),
      value: task.start + task.delta });
    case 'route': {
      const moves = worldSteps(task);
      return answer({ mode: 'route', moves, end: endpoint(task.origin, moves) });
    }
  }
}

export function wrongNumberJourneyResponses(task: NumberJourneyTask): NumberJourneyResponse[] {
  const correct = solutionNumberJourney(task);
  switch (correct.mode) {
    case 'grouped': return [{ ...correct, parts: [] }, { ...correct, total: -1 }];
    case 'estimate': return [{ ...correct, band: -1 }, { ...correct, groupedCount: -1 }];
    case 'neighbors': return [{ ...correct, next: -1 }, { ...correct, previous: -1 }];
    case 'order': return [{ ...correct, ids: correct.ids.slice(1) }];
    case 'meaning': return [{ ...correct, quantities: [] }, { ...correct, built: -1 }];
    case 'ordinal': return [{ ...correct, object: '' }, { ...correct, newPlace: -1 }];
    case 'pair': return [{ ...correct, pairs: [] }, { ...correct, single: -1 }];
    case 'add-law': return [{ ...correct, views: [0] }, { ...correct, operands: [] }];
    case 'operation': return [{ ...correct, operation: correct.operation === '+' ? '−' : '+' }];
    case 'move': return [{ ...correct, positions: correct.positions.slice(1) }, { ...correct, value: 99 }];
    case 'route': return [{ ...correct, moves: correct.moves.slice(1) }];
  }
}
