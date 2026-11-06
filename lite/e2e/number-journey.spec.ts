import { expect, test, type Page } from '@playwright/test';

const ids = ['M-NUM-04', 'M-NUM-05', 'M-NUM-09', 'M-NUM-11', 'M-NUM-12', 'M-NUM-13', 'M-NUM-15', 'M-SUB-02',
  'M-ADD-COMM', 'M-ADD-ASSOC', 'M-ADD-SUB-SELECT', 'M-NEG-04', 'M-GEO-03'] as const;
type Id = typeof ids[number];
type Snapshot = { node: Id; family: string; phase: string; seed: number; contentContext: { skills: string[] }; progress: { checked: boolean } };
const shot = (page: Page): Promise<Snapshot> => page.evaluate(() => JSON.parse(
  (window as Window & { render_game_to_text: () => string }).render_game_to_text()));
const saved = (page: Page) => page.evaluate(() =>
  JSON.parse(localStorage.getItem('sammakko-journey-3') ?? '{"attempts":[],"events":[]}'));
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const input = (page: Page, name: string) => page.getByRole('textbox', { name, exact: true });
const menu = (page: Page, name: string) => page.getByRole('combobox', { name, exact: true });
const workbench = (page: Page) => page.locator('[data-number-workbench]');
const givens = (page: Page) => page.locator('[data-number-givens]');
const feedback = (page: Page) => page.locator('.exp-feedback');
const nums = (s: string) => [...s.matchAll(/\d+/g)].map(match => Number(match[0]));

async function open(page: Page, id: Id, seed = 7) {
  await page.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);
  await button(page, 'Kokeilen itse').click();
  await expect(workbench(page)).toBeVisible();
  expect((await shot(page)).contentContext.skills.length).toBeGreaterThan(0);
}

async function submit(page: Page, ok: boolean) {
  await button(page, 'Tarkista työpöytä').click();
  await expect(feedback(page)).toHaveAttribute('data-ok', String(ok));
}

async function lockEstimate(page: Page, wrong = false) {
  const chart = page.locator('[data-number-estimate]');
  await expect(chart).toHaveAttribute('data-number-estimate', 'rough');
  const objects = () => chart.locator('[data-number-object]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-number-object')).sort());
  const ids = await objects();
  const options = (await menu(page, 'Arvioalue').locator('option').allTextContents()).slice(1);
  const right = options.findIndex(label => { const [lo, hi] = nums(label); return lo! <= ids.length && ids.length <= hi!; });
  await menu(page, 'Arvioalue').selectOption(String(wrong ? (right + 1) % options.length : right));
  await button(page, 'Lukitse arvio').click();
  await expect(menu(page, 'Arvioalue')).toBeDisabled();
  await expect(chart).toHaveAttribute('data-number-estimate', 'grouped');
  expect(await objects()).toEqual(ids);
  await input(page, 'Ryhmitelty tarkka määrä').fill(String(ids.length));
}

const cardinals: Record<string, string> = { pohjoiseen: 'pohjoinen', itään: 'itä', etelään: 'etelä', länteen: 'länsi' };
const vectors: Record<string, [number, number]> = { pohjoinen: [0, -1], itä: [1, 0], etelä: [0, 1], länsi: [-1, 0] };

async function route(page: Page, reverse = false) {
  const [frame, heading] = await givens(page).locator('dd').allTextContents();
  const text = await page.locator('.exp-instruction').innerText();
  const [, first, second] = /ensin (?:Loikan )?([^,]+), sitten (?:Loikan )?([^.]*)\./.exec(text)!;
  const names = [first!, second!].map(word => {
    if (frame!.includes('Kartan')) return cardinals[word]!;
    const [x, y] = vectors[heading!]!;
    const [dx, dy] = word === 'eteen' ? [x, y] : word === 'taakse' ? [-x, -y] : word === 'vasemmalle' ? [y, -x] : [-y, x];
    return Object.keys(vectors).find(name => vectors[name]![0] === dx && vectors[name]![1] === dy)!;
  });
  if (reverse) names.reverse();
  for (const name of names) await button(page, `Askel kartalla ${name}`).press('Enter');
  return heading;
}

test.describe('Lukujen saaristoretki', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        return /^webgl/.test(type) ? null : Reflect.apply(get, this, [type, ...args]);
      } as typeof get;
    });
  });

  test('requires the partition and total rather than a guessed total', async ({ page }) => {
    await open(page, 'M-NUM-04');
    const groups = await workbench(page).locator('[data-number-group]').all();
    let total = 0;
    for (const [i, group] of groups.entries()) {
      const count = await group.locator('[data-number-object]').count();
      total += count;
      await input(page, `Ryhmä ${i + 1}`).fill(String(i === 0 ? count + 1 : count));
    }
    await input(page, 'Kaikki yhteensä').fill(String(total));
    await submit(page, false);
    await expect(feedback(page)).toContainText('kunkin näkyvän ryhmän');
  });

  test('locks estimation before revealing the same objects in exact groups and recovers with support', async ({ page }) => {
    await open(page, 'M-NUM-05');
    await expect(input(page, 'Ryhmitelty tarkka määrä')).toBeHidden();
    await expect(button(page, 'Lukitse arvio')).toBeDisabled();
    await expect(button(page, 'Tarkista työpöytä')).toBeDisabled();
    await lockEstimate(page, true);
    await submit(page, false);
    expect((await saved(page)).events).toHaveLength(0);
    await button(page, 'Näytä ja selitä').click();
    await button(page, 'Uusi yhteinen kokeilu').click();
    expect((await shot(page)).phase).toBe('guided');
    await lockEstimate(page);
    await submit(page, true);
    expect((await saved(page)).attempts[1]).toMatchObject({ ok: true, phase: 'guided' });
  });

  test('the same shells change size before estimation without moving or revealing a count', async ({ page }) => {
    await open(page, 'M-NUM-05');
    for (let i = 0; i < 3; i++) {
      await lockEstimate(page);
      await submit(page, true);
      if (i < 2) await button(page, 'Seuraava kokeilu').click();
    }
    await button(page, 'Kokeile uudessa tilanteessa').click();
    expect((await shot(page)).phase).toBe('transfer');
    const chart = page.locator('[data-number-estimate="rough"]');
    const shells = () => chart.locator('[data-number-object]').evaluateAll(nodes => nodes.map(node => ({
      id: node.getAttribute('data-number-object'), width: (node as HTMLElement).style.width,
      gridIndex: [...node.parentElement!.children].indexOf(node), transform: (node as HTMLElement).style.transform,
    })));
    const before = await shells();
    await button(page, 'Vaihda simpukoiden kokoa').press('Enter');
    const after = await shells();
    const anchors = (items: typeof before) => items.map(({ id, gridIndex, transform }) => ({ id, gridIndex, transform }));
    expect(anchors(after)).toEqual(anchors(before));
    expect(after.every((shell, index) => shell.width !== before[index]!.width)).toBe(true);
    await expect(input(page, 'Ryhmitelty tarkka määrä')).toBeHidden();
    await lockEstimate(page);
    const grouped = await page.locator('[data-number-estimate="grouped"] [data-number-object]').evaluateAll(nodes =>
      Object.fromEntries(nodes.map(node => [node.getAttribute('data-number-object'), (node as HTMLElement).style.width])));
    expect(grouped).toEqual(Object.fromEntries(after.map(({ id, width }) => [id, width])));
    await submit(page, true);
  });

  test('supports the zero boundary and either equal-card order', async ({ page }) => {
    await open(page, 'M-NUM-09', 1);
    const center = Number(await workbench(page).locator('strong').nth(1).innerText());
    if (center === 0) await button(page, 'Ei edeltäjää').press('Enter');
    else await input(page, 'Edeltäjä').fill(String(center - 1));
    await input(page, 'Seuraaja').fill(String(center + 1));
    await submit(page, true);
    await open(page, 'M-NUM-11', 1);
    const cards = await workbench(page).getByRole('button', { name: /^Kortti/ }).evaluateAll(nodes => nodes.map(node => node.getAttribute('aria-label')!));
    cards.sort((a, b) => nums(a)[0]! - nums(b)[0]! || b.localeCompare(a));
    for (const card of cards) await button(page, card).press('Enter');
    await expect(page.locator('[data-number-live="ordered-values"]')).toContainText('=');
    await submit(page, true);
  });

  test('classifies number meanings and builds the chosen amount', async ({ page }) => {
    await open(page, 'M-NUM-12', 1);
    const target = workbench(page).getByRole('button', { name: /^Rakenna .* lehtipaikkaa/ });
    const count = nums(await target.innerText())[0]!;
    await target.press('Enter');
    const secondQuantity = workbench(page).getByRole('button', { name: 'Korissa on 2 käpyä.' });
    if (await secondQuantity.count()) await secondQuantity.click();
    for (let i = 0; i < count; i++) await button(page, 'Lisää yksi kohde').click();
    await expect(page.locator('[data-number-built] [data-number-object]')).toHaveCount(count);
    await submit(page, true);
  });

  test('reads the named end and changes to a vertical queue in transfer', async ({ page }) => {
    await open(page, 'M-NUM-13');
    const families = new Set<string>();
    async function readQueue() {
      const first = workbench(page).locator('[data-number-ordinal="first"]');
      const changed = workbench(page).locator('[data-number-ordinal="changed"]');
      const place = nums(await givens(page).locator('dd').first().innerText())[0]!;
      const names = await first.getByRole('button').allTextContents();
      const fromEnd = /oikealta|alhaalta/.test(await first.locator('strong').innerText());
      const object = names[fromEnd ? names.length - place : place - 1]!;
      await first.getByRole('button', { name: object, exact: true }).press('Enter');
      const after = await changed.locator('[data-number-ordinal-member]').allTextContents();
      const direction = await changed.getByText(/^Uusi jono\./).innerText();
      const index = after.indexOf(object);
      await input(page, 'Saman kohteen uusi järjestysnumero').fill(String(/oikealta|alhaalta/.test(direction) ? after.length - index : index + 1));
      return { original: await first.locator('strong').innerText(), direction };
    }
    for (let i = 0; i < 3; i++) {
      families.add((await shot(page)).family);
      await readQueue();
      await submit(page, true);
      if (i < 2) await button(page, 'Seuraava kokeilu').click();
    }
    expect(families.size).toBe(2);
    await button(page, 'Kokeile uudessa tilanteessa').click();
    expect((await shot(page)).phase).toBe('transfer');
    expect(await readQueue()).toEqual({ original: expect.stringContaining('alhaalta'), direction: expect.stringContaining('ylhäältä') });
    await submit(page, true);
    expect((await shot(page)).progress.checked).toBe(true);
  });

  test('forms alternative keyboard pairs and matches different amounts without removing either set', async ({ page }) => {
    await open(page, 'M-NUM-15', 1);
    const tokens = page.locator('[data-pair-object]');
    const count = await tokens.count();
    for (let i = 0; i < Math.floor(count / 2); i++) {
      await button(page, `Kohde ${i + 1}`).press('Enter');
      await button(page, `Kohde ${count - i}`).press('Enter');
    }
    await input(page, 'Ilman paria').fill(String(count % 2));
    await menu(page, 'Parillisuus').selectOption(count % 2 ? 'odd' : 'even');
    await submit(page, true);

    await open(page, 'M-SUB-02');
    const a = await workbench(page).getByRole('button', { name: /^Aavan kohde/ }).count();
    const b = await workbench(page).getByRole('button', { name: /^Loikan kohde/ }).count();
    for (let i = 0; i < Math.min(a, b); i++) {
      await button(page, `Aavan kohde ${i + 1}`).click();
      await button(page, `Loikan kohde ${b - i}`).click();
    }
    await expect(tokens).toHaveCount(a + b);
    await menu(page, 'Kummalla on enemmän?').selectOption(a === b ? 'equal' : a > b ? 'a' : 'b');
    await input(page, 'Suurempi määrä').fill(String(Math.max(a, b)));
    await input(page, 'Pienempi määrä').fill(String(Math.min(a, b)));
    await input(page, 'Erotus').fill(String(Math.abs(a - b)));
    await submit(page, true);
  });

  test('reordering and regrouping preserve actual items while requiring both own calculations', async ({ page }) => {
    for (const id of ['M-ADD-COMM', 'M-ADD-ASSOC'] as const) {
      await open(page, id);
      const drawing = page.locator('[data-number-law-objects]');
      const objects = () => drawing.locator('[data-number-object]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-number-object')).sort());
      let previous: string[] = [];
      for (let i = 0; i < 2; i++) {
        await button(page, `Avaa näkymä ${i + 1}`).press('Enter');
        const ids = await objects();
        if (i === 1) expect(ids).toEqual(previous);
        previous = ids;
        const parts = await drawing.locator('[data-number-law-part]').all();
        const values: number[] = [];
        for (const [index, part] of parts.entries()) {
          const value = await part.locator('[data-number-object]').count();
          values.push(value);
          await input(page, `Näkymä ${i + 1}, määrä ${index + 1}`).fill(String(value));
        }
        if (id === 'M-ADD-ASSOC') {
          await expect(drawing.locator('[data-number-law-bracket] [data-number-law-part]')).toHaveCount(2);
          await input(page, i === 0 ? 'Ensimmäiset sulut' : 'Toiset sulut').fill(String(values[i]! + values[i + 1]!));
        }
        await input(page, i === 0 ? 'Ensimmäinen summa' : 'Toinen summa').fill(String(ids.length));
      }
      const choice = menu(page, 'Kumpi ryhmittely helpottaa sinua?');
      if (await choice.count()) await choice.selectOption('0');
      await submit(page, true);
    }
  });

  test('takes every signed step from the given start across zero', async ({ page }) => {
    await open(page, 'M-NEG-04', 1);
    const [first, change] = await givens(page).locator('dd').allTextContents();
    const start = Number(first!.replace('−', '-'));
    const delta = change!.startsWith('Nouse') ? nums(change!)[0]! : Number(change!.replace('−', '-'));
    for (let i = 0; i < Math.abs(delta); i++) await button(page, delta > 0 ? 'Askel oikealle' : 'Askel vasemmalle').press('Enter');
    if ((start + delta) * start < 0) await expect(page.locator('[data-number-live="number-position"]')).toContainText('→ 0 →');
    await input(page, 'Uusi arvo').fill(String(start + delta));
    await submit(page, true);
  });

  test('tests fixed and actor directions before a changed-heading transfer', async ({ page }) => {
    await open(page, 'M-GEO-03');
    const families = new Set<string>();
    for (let i = 0; i < 3; i++) {
      families.add((await shot(page)).family);
      await expect(button(page, 'Kuuntele')).toBeVisible();
      await route(page);
      await submit(page, true);
      if (i < 2) await button(page, 'Seuraava kokeilu').click();
    }
    expect(families).toEqual(new Set(['follow-fixed-map-directions', 'follow-actor-directions']));
    await button(page, 'Kokeile uudessa tilanteessa').click();
    expect((await shot(page)).phase).toBe('transfer');
    const heading = await route(page, true);
    expect(['etelä', 'länsi']).toContain(heading);
    await submit(page, false);
    await button(page, 'Uusi kokeilu').click();
    await route(page);
    await submit(page, true);
    expect((await shot(page)).progress.checked).toBe(true);
    expect((await saved(page)).events).toEqual([expect.objectContaining({ node: 'M-GEO-03', assisted: false })]);
  });

  for (const [label, viewport] of [['desktop', { width: 1366, height: 768 }], ['tablet', { width: 768, height: 1024 }]] as const) {
    test(`all 26 independent tasks fit ${label}`, async ({ page }, info) => {
      test.setTimeout(90_000);
      await page.setViewportSize(viewport);
      for (const id of ids) {
        const families = new Set<string>();
        for (const seed of [1, 7]) {
          await open(page, id, seed);
          families.add((await shot(page)).family);
          if (id === 'M-NUM-05') await lockEstimate(page);
          if (id === 'M-NUM-13') await button(page, 'Aava').click();
          if (id === 'M-ADD-COMM' || id === 'M-ADD-ASSOC') await button(page, 'Avaa näkymä 2').click();
          const bounds = await page.evaluate(() => {
            const boxes = [...document.querySelectorAll('[data-number-givens],[data-number-workbench]')].map(node => node.getBoundingClientRect());
            return { top: Math.min(...boxes.map(r => r.top)), left: Math.min(...boxes.map(r => r.left)),
              bottom: Math.max(...boxes.map(r => r.bottom)), right: Math.max(...boxes.map(r => r.right)), scrollWidth: document.documentElement.scrollWidth };
          });
          const trace = `${id} ${seed} ${JSON.stringify(bounds)}`;
          expect(bounds.top, trace).toBeGreaterThanOrEqual(0);
          expect(bounds.left, trace).toBeGreaterThanOrEqual(0);
          expect(bounds.right, trace).toBeLessThanOrEqual(viewport.width);
          expect(bounds.bottom, trace).toBeLessThanOrEqual(viewport.height);
          expect(bounds.scrollWidth, trace).toBeLessThanOrEqual(viewport.width);
        }
        expect(families.size, id).toBe(2);
        if (id === 'M-GEO-03' || id === 'M-NUM-05' || id === 'M-ADD-ASSOC') {
          const path = info.outputPath(`${id}-${label}.png`);
          await page.screenshot({ path });
          await info.attach(id, { path, contentType: 'image/png' });
        }
      }
    });
  }
});
