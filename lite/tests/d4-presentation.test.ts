import { expect, it } from 'vitest';
import { EXPEDITION_NODES } from '../src/content/expedition';
import { bookPage, PAGE_TEXT } from '../src/book/pages';
import { reactionLabLight } from '../src/content/light/reaction-lab';
import { rng } from '../src/engine/rng';
import { check } from '../src/engine/check';
import { itemIdentity } from '../src/engine/item-identity';
import type { Item } from '../src/engine/types';

function markup(item: Item): string {
  let html = '';
  const prior = Reflect.get(globalThis, 'document');
  Reflect.set(globalThis, 'document', { createElement: () => ({ setAttribute() {}, set innerHTML(value: string) { html = value; } }) });
  try { item.scene?.({ replaceChildren() {}, set innerHTML(value: string) { html = value; } } as unknown as HTMLElement); return html; }
  finally { if (prior) Reflect.set(globalThis, 'document', prior); else Reflect.deleteProperty(globalThis, 'document'); }
}

const witnesses = [
  { seed: 23, observation: 'Grafiittipala murskautuu.', phase: 'solid', look: 'fragments' },
  { seed: 45, observation: 'Rautapala taipuu.', phase: 'solid', look: 'bent-solid' },
  { seed: 27, observation: 'Jää muuttuu vedeksi.', phase: 'liquid', look: 'liquid' },
  { seed: 7, observation: 'Alumiinin annettu sulamistallenne.', phase: 'liquid', look: 'liquid' },
];
it('shows declared solid shape changes and true melting in both book question images', () => {
  for (const id of ['CHEM79-CHANGE-PHYS', 'CHEM79-REACTION-01']) for (const witness of witnesses) {
    const item = bookPage(EXPEDITION_NODES[id]!).makeTry!(witness.seed, 0)!.item;
    const basis = item.basis as { cases: { identityEvidence: string; observation: string; after: { phase: string }[] }[] };
    const selected = basis.cases.find(c => c.identityEvidence === 'verified')!;
    expect(selected.observation).toBe(witness.observation);
    expect(selected.after.map(s => s.phase)).toEqual([witness.phase]);
    const image = markup(item);
    expect(image).toContain(`data-reaction-after="${witness.look}"`);
    expect(image).toContain('data-reaction-before="solid"');
    if (witness.phase === 'solid') expect(image).not.toContain('x="248" y="56" width="84" height="41"');
  }
});

it('presents accurate correct and wrong shape-change feedback without mutating evidence inputs', () => {
  for (const id of ['CHEM79-CHANGE-PHYS', 'CHEM79-REACTION-01']) for (const seed of [23, 45, 20261110]) {
    const page = bookPage(EXPEDITION_NODES[id]!), attempt = page.makeTry!(seed, 0)!, item = attempt.item;
    expect(item.task.kind).toBe('choice'); if (item.task.kind !== 'choice') continue;
    const serialized = JSON.stringify(item), identity = itemIdentity(item);
    // These observations are shape changes; the same identified substance stays solid.
    expect(item.task.options[item.task.answer]?.text).toContain('fysikaalinen');
    for (const index of [item.task.answer, 0]) {
      const verdict = check(item.task, { kind: 'choice', index });
      const originalVerdict = JSON.stringify(verdict);
      const explanation = page.feedbackText!(item.explain), reason = verdict.why ? page.feedbackText!(verdict.why) : '';
      expect(explanation).toContain('muoto');
      if (!verdict.ok) expect(reason).toContain('muoto');
      expect(explanation + reason).not.toContain('Vain olomuoto tai sekoittuminen');
      expect(JSON.stringify(verdict)).toBe(originalVerdict);
    }
    expect(JSON.stringify(item)).toBe(serialized); expect(itemIdentity(item)).toBe(identity);
    expect(item.explain).toContain('Vain olomuoto tai sekoittuminen');
    expect(attempt.rev).toBeUndefined();
  }
  expect(bookPage(EXPEDITION_NODES['M-TH-01']!).feedbackText).toBeUndefined();
});

it('retains the qualitative empty-after fallback without inventing a declared gas phase', () => {
  const base = EXPEDITION_NODES['CHEM79-CHANGE-PHYS']!.item(rng(45), 'guided');
  const basis = structuredClone(base.basis) as any;
  basis.cases = [{ ...basis.cases[0], after: [], identityEvidence: 'appearance-only' }];
  const light = reactionLabLight({ ...base, task: basis } as any, { phase: 'guided', r: rng(1) })!;
  expect(markup(light)).toContain('data-reaction-after="liquid"');
  expect(light.task.kind === 'choice' && light.task.options[light.task.answer]?.text).toContain('Ei voi tietää');
});

it('keeps the revised mathematical claims scoped to their actual examples', () => {
  expect(2 ** 4).toBe(4 ** 2); // Counterexample to universal noncommutativity.
  expect(PAGE_TEXT['M79-POWER-01']!.beats[1]!.text).toContain('Tässä');
  expect(PAGE_TEXT['M-GEO-03']!.beats[0]!.text).toContain('Tällä kartalla');
  expect(PAGE_TEXT['M79-PYTH-CONVERSE']!.beats[2]!.text).toContain('pisintä sivua c');
  const median = (values: number[]) => [...values].sort((a,b) => a-b)[Math.floor(values.length / 2)];
  expect(median([5,9,9,11,13])).toBe(median([5,9,9,11,50]));
  expect(median([1,2,3])).not.toBe(median([100,2,3]));
  expect(PAGE_TEXT['M79-MEDIAN']!.beats[2]!.text).toContain('Tässä suurimman arvon');
});

it('illustrates the actual chemical examples and reaction directions in the related SCI18 beats', () => {
  const physical = bookPage(EXPEDITION_NODES['CHEM79-CHANGE-PHYS']!);
  expect(markup({ scene: physical.beats[2]!.scene } as Item)).toContain('ruoste');
  const reaction = bookPage(EXPEDITION_NODES['CHEM79-REACTION-01']!);
  const magnesium = markup({ scene: reaction.beats[2]!.scene } as Item);
  expect(magnesium).toContain('magnesiumoksidi'); expect(magnesium).not.toContain('rauta Fe');
  const roles = bookPage(EXPEDITION_NODES['CHEM79-REACT-PROD']!);
  expect(markup({ scene: roles.beats[1]!.scene } as Item)).toContain('C + O₂ → CO₂');
  expect(markup({ scene: roles.beats[2]!.scene } as Item)).toContain('2 H₂O → 2 H₂ + O₂');
});
