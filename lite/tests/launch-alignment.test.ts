import { describe, expect, it } from 'vitest';
import { NODES, revOf } from '../src/content';
import { check } from '../src/engine/check';
import { rng } from '../src/engine/rng';
import type { Phase } from '../src/engine/types';
import type { Attempt } from '../src/engine/evidence';
import { store } from '../src/engine/store';
import { AUDIT_REV, LAUNCH_REV, LIGHT_REV } from '../src/content/audit-rev';
import { ANIM, type AnimPaint } from '../src/ui/anim';
import { fracArt } from '../src/content/pics';

describe('launch: given picture data is named without a completed answer', () => {
  it('keeps the original fraction helper default and supports neutral sector data', () => {
    expect(fracArt(4, 2)).toContain('aria-label="2/4"');
    const described = fracArt(4, 1, 'pie', [0.4, 0.2, 0.25, 0.15], 120, '#d65a6f', true);
    expect(described).toContain('144 asteen keskuskulma');
    expect(described).toContain('72 asteen keskuskulma');
    expect(described).not.toMatch(/aria-label="\d+\/\d+/);
  });
  for (const id of ['M-FRAC-01', 'M-FRAC-02', 'M-SYM-EQUAL', 'SCI-ENV-RECORD-DATA-01', 'SCI-ENV-PRESENT-DATA-01', 'SCI-ENV-RECORD-01']) it(`${id}: practice drawings have essential data`, () => {
    for (const phase of ['independent', 'transfer'] as Phase[]) for (let seed = 1; seed <= 40; seed++) {
      const n = NODES[id]!, item = n.item(rng(seed), phase);
      // SCI-ENV-RECORD-01: lighter layout (user request 2026-11-06); the launch revision stays valid.
      expect(n.rev).toBe(id === 'SCI-ENV-RECORD-01' ? LIGHT_REV : LAUNCH_REV);
      expect(n.validRevs).toContain(AUDIT_REV);
      expect(n.validRevs).toContain(LAUNCH_REV);
      const cfg = (item.scene as AnimPaint | undefined)?.[ANIM];
      if (id.startsWith('SCI-') && cfg) expect(cfg.label).toMatch(/(?:ranta|metsä|niitty|kallio):/);
      const task = item.task;
      const options = task.kind === 'choice' || task.kind === 'multi' ? task.options : task.kind === 'place' ? [...task.slots, ...task.tokens] : [];
      for (const o of options) if (o.art?.includes('<svg')) {
        expect(o.art).toContain('aria-label=');
        expect(o.art).not.toContain('aria-hidden="true"');
        if (id.startsWith('M-FRAC')) expect(o.art).not.toMatch(/aria-label="\d+\/\d+/);
      }
    }
  });
  it('asks for the specific ten-completing strategy rather than rejecting other valid decompositions generally', () => {
    for (const [id, tag] of [['M-ADD-20', 'split'], ['M-MENTAL-01', 'toTen']] as const) {
      let found = false;
      for (let seed = 1; seed <= 40; seed++) {
        const item = NODES[id]!.item(rng(seed), 'independent');
        if (item.tag === tag) { found = true; expect(item.say).toMatch(/ensimmäinen osa.*tasakymppiin/); }
      }
      expect(found).toBe(true);
    }
    expect(NODES['M-MENTAL-01']!.item(rng(1), 'transfer').say).toMatch(/ensimmäinen osa.*tasakymppiin/);
  });
  it('calls a numeric equation an equation while distinguishing an unknown-containing equation', () => {
    const node = NODES['M-ALG-06']!;
    // The first teaching text and hint must agree with the numeric-equation
    // feedback: an unknown narrows this exercise, not the general definition.
    expect(node.intro).toMatch(/kaksi lauseketta.*yhtä suuret/);
    expect(node.goal).toMatch(/yhtälön, jossa on tuntematon/);
    let found = false, foundWhich = false, foundNumeric = false;
    for (let seed = 1; seed <= 40; seed++) {
      const item = node.item(rng(seed), 'independent');
      if (item.tag === 'which') {
        foundWhich = true;
        expect(item.say).toContain('yhtälö, jossa on tuntematon');
        expect(item.hint).toMatch(/^Tässä etsitään yhtälöä, jossa/);
      }
      if (item.tag !== 'spot' || item.task.kind !== 'sort') continue;
      found = true;
      expect(item.task.cats.map(c => c.label)).toEqual(['Sisältää = ja tuntemattoman', 'Ei sisällä molempia']);
      const task = item.task;
      task.items.forEach((o, i) => {
        if (o.big && /^\d+ \+ \d+ = \d+$/.test(o.big)) {
          foundNumeric = true;
          expect(task.answer[i]).toBe(1);
          expect(task.why?.[i]).toBe('Tämä on numeerinen yhtälö ilman tuntematonta.');
        }
      });
      expect(item.explain).not.toContain('pelkkä lasku');
    }
    expect(found && foundWhich && foundNumeric).toBe(true);
  });
  it('versions the equation definition hint while retaining earlier answer evidence', () => {
    const id = 'M-ALG-06', node = NODES[id]!, current = 'launch2-2026-11-01';
    expect(revOf(id)).toBe(current);
    expect(node.validRevs).toEqual([AUDIT_REV, LAUNCH_REV, current]);
    expect(node.produce).toBeUndefined();
    for (const rev of [AUDIT_REV, LAUNCH_REV, current]) {
      const attempts: Attempt[] = ['which', 'spot'].map((tag, i) => ({ node: id, phase: 'quick', tag, ok: true, at: i + 1, rev }));
      store.load({ world: 'ranta', attempts });
      expect(store.state(id).checked, rev).toBe(true);
    }
  });
});

describe('launch observation: essential pictured data is also described neutrally', () => {
  it('names the visible colour and geometry in every practice scene and picture option', () => {
    const tags = new Set<string>();
    for (const phase of ['independent', 'transfer'] as Phase[]) for (let seed = 1; seed <= 80; seed++) {
      const item = NODES['SCI-ENV-OBSERVE-01']!.item(rng(seed), phase);
      tags.add(item.tag);
      const host = { innerHTML: '' };
      item.scene!(host as HTMLElement);
      const drawings = [host.innerHTML, ...(item.task.kind === 'choice' ? item.task.options.flatMap(o => o.art ? [o.art] : []) : [])];
      for (const drawing of drawings) {
        expect(drawing).not.toContain('aria-hidden="true"');
        const label = drawing.match(/aria-label="([^"]+)"/)?.[1];
        expect(label).toMatch(/(?:lehti|simpukka|sieni);/);
        expect(label).not.toMatch(/oikea|väärä|havainto|arvaus|toukk|myrkyll|vanha|eilen|aalto/i);
      }
    }
    expect([...tags].sort()).toEqual(['colour', 'feature', 'match', 'sort', 'transfer']);
  });
});

describe('launch: tool choice names the property and supplies optional arithmetic', () => {
  it('gives the equation transformation before the integer-division transfer', () => {
    const n = NODES['M79-INT-DIV']!;
    expect(n.rev).toBe(LAUNCH_REV);
    expect(n.validRevs).toContain(AUDIT_REV);
    for (let seed = 1; seed <= 40; seed++) {
      const item = n.item(rng(seed), 'transfer');
      expect(item.say).toContain('on jo saatu');
      expect(item.say).toContain('Laske annettu jako');
      expect(item.hint).toContain('muokkaus on jo annettu');
      if (item.task.kind === 'numeric') expect(item.task.answer).toBeLessThan(0);
    }
  });
  it('does not define dependence by mandatory simultaneous change at every step', () => {
    const n = NODES['M79-DEP-01']!;
    expect(n.rev).toBe(LAUNCH_REV);
    expect(n.intro).toContain('jokainen pieni muutos ei');
    const texts = n.demo(rng(1)).map(s => s.say).join(' ');
    expect(texts).toContain('Yksi muuttumaton väli ei siis todista');
    expect(texts).not.toContain('Jos se pysyy samana, se ei riipu');
  });
  it('SCI data keeps the supplied record total distinct from individual animals and labels its given drawings', () => {
    const seen = new Set<string>();
    for (const phase of ['independent', 'transfer'] as Phase[]) for (let seed = 1; seed <= 80; seed++) {
      const item = NODES['SCI-ENV-DATA-01']!.item(rng(seed), phase);
      seen.add(item.tag);
      const host = { innerHTML: '' }; item.scene!(host as HTMLElement);
      expect(host.innerHTML).not.toContain('aria-hidden="true"');
      if (item.tag === 'total' && item.task.kind === 'choice') {
        expect(host.innerHTML).toContain(`havaintomerkintöjä yhteensä ${item.task.options[item.task.answer]!.big}`);
        expect(item.explain).toContain('ei kerro, montako eri sammakkoa nähtiin');
        expect(item.hint).toContain('ei tarvitse tehdä');
      }
      if (item.tag === 'transfer' && item.task.kind === 'choice') for (const o of item.task.options) {
        expect(o.art).toContain('aria-label=');
        expect(o.art).not.toContain('aria-hidden="true"');
      }
    }
    expect([...seen].sort()).toEqual(['fill', 'most', 'table', 'total', 'transfer']);
  });
  it('keeps readings explicit and distinguishes measurable properties of the same object', () => {
    const tags = new Set<string>();
    for (let seed = 1; seed <= 80; seed++) {
      const item = NODES['SCI-ENV-TOOL-01']!.item(rng(seed), 'independent');
      tags.add(item.tag);
      if (item.tag === 'pick' && item.task.kind === 'sort') for (const option of item.task.items) expect(option.text).toMatch(/pituus|leveys|massa|lämpötila/);
      if (item.tag === 'tare' || item.tag === 'read') {
        expect(item.task.kind).toBe('numeric');
        if (item.task.kind === 'numeric') expect(item.say).toContain(`${item.task.answer} ${item.task.unit}`);
        expect(item.say).toMatch(/on laskettu/);
        expect(item.say).toMatch(/Kirjoita annettu/);
      }
    }
    expect(tags.has('pick') && tags.has('tare') && tags.has('read')).toBe(true);
  });
  it('excludes the shared starting stone from the first shared jump target', () => {
    const n = NODES['M-NUM-16']!;
    expect(n.rev).toBe(LAUNCH_REV);
    expect(n.validRevs).toContain(AUDIT_REV);
    for (let seed = 1; seed <= 40; seed++) {
      const item = n.item(rng(seed), 'transfer');
      expect(item.say).toContain('nollan jälkeen');
      expect(item.hint).toContain('Lähtökiveä 0 ei lasketa');
      if (item.task.kind === 'choice') expect(Number(item.task.options[item.task.answer]!.big)).toBeGreaterThan(0);
    }
  });
});

describe('launch alignment: atomic one-to-one marking stays separate from cardinality', () => {
  it('accepts marking each object once without reporting the total', () => {
    for (const phase of ['guided', 'independent', 'transfer'] as Phase[]) {
      let found = 0;
      for (let seed = 1; seed <= 40; seed++) {
        const item = NODES['M-NUM-1TO1']!.item(rng(seed), phase), task = item.task;
        if (task.kind !== 'tapcount') continue;
        found++;
        const taps = task.objects.map((_, i) => i);
        expect(check(task, { kind: 'tapcount', taps }).ok, `${phase}/${item.tag}/${seed}`).toBe(true);
        expect(check(task, { kind: 'tapcount', taps: [...taps, 0] }).ok).toBe(false);
        expect(check(task, { kind: 'tapcount', taps: taps.slice(1) }).ok).toBe(false);
        expect(task.ask).toBe(false);
        expect(item.say).not.toMatch(/montako/);
      }
      expect(found).toBeGreaterThan(0);
    }
  });

  it('M-NUM-01 still requires the total and treats marking as optional', () => {
    let found = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const task = NODES['M-NUM-01']!.item(rng(seed), 'independent').task;
      if (task.kind !== 'tapcount') continue;
      found++;
      expect(task.ask).toBe(true);
      expect(check(task, { kind: 'tapcount', taps: [], count: task.objects.length }).ok).toBe(true);
      expect(check(task, { kind: 'tapcount', taps: task.objects.map((_, i) => i), count: task.objects.length + 1 }).ok).toBe(false);
    }
    expect(found).toBeGreaterThan(0);
  });
});

describe('launch: construction claims require a current production-family answer', () => {
  for (const [id, recognition, production] of [
    ['M-NUM-1TO1', 'judge', 'tap'], ['M-DATA-04', 'header', 'fromList'], ['M79-FUNC-GRAPH', 'match', 'plot'],
  ]) {
    const a = (n: number, extra: Partial<Attempt> = {}): Attempt => ({ node: id!, phase: 'quick', tag: recognition!, ok: true, at: n, rev: LAUNCH_REV, ...extra });
    it(`${id}: recognition, correct production, mistakes, guided/revealed assistance and history`, () => {
      const base = [a(1), a(2)];
      store.load({ world: 'ranta', attempts: base });
      expect(store.state(id!).checked).toBe(false);
      expect(store.state(id!).produced).toBe(false);
      store.load({ world: 'ranta', attempts: [...base, a(3, { tag: production! })] });
      expect(store.state(id!).checked).toBe(true);
      expect(store.state(id!).produced).toBe(true);
      for (const extra of [{ ok: false }, { phase: 'guided' as const, help: ['hint' as const] }, { help: ['reveal' as const] }, { replay: true }]) {
        store.load({ world: 'ranta', attempts: [...base, a(3, { tag: production!, ...extra })] });
        expect(store.state(id!).produced).toBe(false);
        expect(store.state(id!).checked).toBe(false);
      }
      const historic = base.map(x => ({ ...x, rev: AUDIT_REV }));
      store.load({ world: 'ranta', attempts: historic });
      expect(store.state(id!).checked).toBe(true);
      expect(store.state(id!).produced).toBe(false);
      expect(store.get().attempts).toEqual(historic);
      const historicSameTag = [...historic, a(3, { tag: production!, rev: AUDIT_REV })];
      store.load({ world: 'ranta', attempts: historicSameTag });
      expect(store.state(id!).checked).toBe(true);
      expect(store.state(id!).produced).toBe(false);
      expect(store.get().attempts).toEqual(historicSameTag);
      store.load({ world: 'ranta', attempts: [...historicSameTag, a(4, { tag: production! })] });
      expect(store.state(id!).produced).toBe(true);
    });
  }
});

describe('launch alignment: table construction supplies optional arithmetic prerequisites', () => {
  for (const tag of ['fromTally', 'total']) it(`${tag} supplies each copied row quantity explicitly`, () => {
    let found = 0;
    for (let seed = 1; seed <= 80; seed++) {
      const item = NODES['M-DATA-04']!.item(rng(seed), 'independent');
      if (item.tag !== tag) continue;
      found++;
      const host = { innerHTML: '' };
      item.scene!(host as HTMLElement);
      if (tag === 'fromTally') {
        expect(host.innerHTML).toContain('>Määrä</th>');
        const task = item.task;
        expect(task.kind).toBe('place');
        if (task.kind !== 'place') continue;
        for (const id of Object.values(task.answer)) expect(host.innerHTML).toContain(`<td>${id!.slice(1)}</td>`);
        expect(item.hint).not.toMatch(/Laske.*viisiryhm/);
      } else {
        const source = host.innerHTML.match(/<h3>Keruuvihkon tiedot<\/h3>([\s\S]*?)<h3>/)?.[1];
        expect(source).toBeTruthy();
        if (item.task.kind === 'numeric') expect(source).toContain(`<td>${item.task.answer}</td>`);
        expect(item.explain).toContain('Vapaaehtoinen tarkistus');
        expect(item.hint).not.toMatch(/[Vv]ähenn/);
        if (item.task.kind === 'numeric') for (const why of Object.values(item.task.whyAt ?? {})) expect(why).not.toMatch(/[Vv]ähenn/);
      }
    }
    expect(found).toBeGreaterThan(0);
  });
});
