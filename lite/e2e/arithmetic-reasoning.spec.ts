import { expect, test, type Page } from '@playwright/test';
// These checks cover the opt-in adult review; solo play (the default) has its own spec.
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { try { localStorage.setItem('sammakko-saaristo-adult-review', 'on'); } catch { /* storage blocked */ } }); });

const ids = ['M-DISTRIB', 'M-MUL-ASSOC', 'M-MUL-COMM', 'M-DIVIS-02', 'M-DIVIS-03', 'M-ROUND-01', 'M-EST-01', 'M-EST-02',
  'M-CALC-STRAT', 'M-ALG-01', 'M-ALG-02', 'M-ALG-03', 'M-ALG-09'] as const;
type Id = typeof ids[number];
type Snapshot = { node: Id; family: string; phase: string; seed: number; contentContext: { skills: string[] }; progress: { helped: boolean; checked: boolean } };
const snapshot = (page: Page): Promise<Snapshot> => page.evaluate(() =>
  JSON.parse((window as Window & { render_game_to_text: () => string }).render_game_to_text()));
const saved = (page: Page) => page.evaluate(() =>
  JSON.parse(localStorage.getItem('sammakko-journey-3') ?? '{"attempts":[],"events":[]}'));
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const input = (page: Page, name: string) => page.getByRole('textbox', { name, exact: true });
const menu = (page: Page, name: string) => page.getByRole('combobox', { name, exact: true });
const workbench = (page: Page) => page.locator('[data-arithmetic-workbench]');
const givens = (page: Page) => page.locator('[data-arithmetic-givens]');
const feedback = (page: Page) => page.locator('.exp-feedback');
const nums = (text: string) => [...text.matchAll(/\d+/g)].map(match => Number(match[0]));

async function open(page: Page, id: Id, seed = 7) {
  await page.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);
  await button(page, 'Kokeilen itse').click();
  if (id === 'M-ALG-02') await expect(page.locator('[data-observed-explanation="spoken"]')).toBeVisible();
  else await expect(workbench(page)).toBeVisible();
  expect((await snapshot(page)).contentContext.skills.length).toBeGreaterThan(0);
}

async function submit(page: Page, ok: boolean) {
  await button(page, 'Tarkista ratkaisu').click();
  await expect(feedback(page)).toHaveAttribute('data-ok', String(ok));
}

async function split(page: Page, misplace = false) {
  const [r, c] = nums(await givens(page).locator('dd').first().innerText());
  const splitColumns = (await snapshot(page)).family === 'split-columns';
  const cut = 2, first = cut * (splitColumns ? r! : c!);
  await menu(page, 'Jakokohta').selectOption(String(cut));
  await expect(page.locator('[data-arithmetic-live="split-expression"]')).toContainText('×');
  await expect(page.locator('[data-arithmetic-split] [data-seat]')).toHaveCount(r! * c!);
  await input(page, 'Osa 1').fill(String(first + Number(misplace)));
  await input(page, 'Osa 2').fill(String(r! * c! - first - Number(misplace)));
  await input(page, 'Yhteensä').fill(String(r! * c!));
}

async function tryHunt(page: Page, value: number, finding: 'below' | 'above' | 'fits') {
  await input(page, 'Kokeiltava arvo').fill(String(value));
  await button(page, 'Kokeile arvoa').press('Enter');
  await expect(page.locator('[data-arithmetic-live="measured"]')).toContainText(`x = ${value}`);
  await menu(page, 'Koetulos verrattuna tavoitteeseen').selectOption(finding);
  await button(page, 'Kirjaa havainto').click();
}

async function hunt(page: Page, incorrectSubstitution = false) {
  const equation = await givens(page).locator('dd').first().innerText();
  const [left, right] = equation.split('=').map(t => t.trim());
  const a = left!.includes('×') ? nums(left!)[0]! : 1;
  const b = left!.includes('+') ? nums(left!).at(-1)! : 0;
  const target = Number(right);
  const root = (target - b) / a;
  const start = nums(await page.locator('[data-arithmetic-live="hunt-range"]').innerText()).at(-1)!;
  await expect(input(page, 'Ratkaisu')).toBeHidden();
  await tryHunt(page, start, a * start + b > target ? 'above' : 'below');
  await expect(page.locator('[data-arithmetic-hunt-log] li')).toHaveCount(1);
  await tryHunt(page, root, 'fits');
  await expect(page.locator('[data-arithmetic-hunt-log] li')).toHaveCount(2);
  await input(page, 'Ratkaisu').fill(String(root));
  await input(page, 'Vasen puoli sijoittamalla').fill(String(target + Number(incorrectSubstitution)));
}

test.describe('Lauttarivien, lastien ja tuntemattoman pajat', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        return /^webgl/.test(type) ? null : Reflect.apply(get, this, [type, ...args]);
      } as typeof get;
    });
  });

  test('splitting preserves all seats and rejects a right total with wrong subtotals before guided recovery', async ({ page }) => {
    await open(page, 'M-DISTRIB');
    await split(page, true);
    await submit(page, false);
    expect((await saved(page)).events).toHaveLength(0);
    await button(page, 'Näytä ja selitä').click();
    await button(page, 'Uusi yhteinen kokeilu').click();
    expect((await snapshot(page)).phase).toBe('guided');
    await split(page);
    await submit(page, true);
    expect((await saved(page)).attempts[1]).toMatchObject({ ok: true, phase: 'guided' });
  });

  test('both associative groupings keep the same objects and expose nested baskets', async ({ page }) => {
    await open(page, 'M-MUL-ASSOC');
    const [a, b, c] = nums(await givens(page).locator('dd').first().innerText());
    const model = page.locator('[data-arithmetic-group]');
    const ids = () => model.locator('[data-item]').evaluateAll(items => items.map(item => item.getAttribute('data-item')));
    await button(page, 'Avaa vasen ryhmittely').press('Enter');
    const before = await ids();
    await expect(model.locator('[data-arithmetic-inner-group]')).toHaveCount(a! * b!);
    await button(page, 'Avaa oikea ryhmittely').click();
    expect(await ids()).toEqual(before);
    await expect(model.locator('[data-arithmetic-outer-group]')).toHaveCount(a!);
    for (const boat of await model.locator('[data-arithmetic-outer-group]').all()) {
      await expect(boat.locator('[data-arithmetic-inner-group]')).toHaveCount(b!);
    }
    await input(page, 'Vasemmat sulut').fill(String(a! * b!));
    await input(page, 'Oikeat sulut').fill(String(b! * c!));
    await input(page, 'Vasemmalta yhteensä').fill(String(a! * b! * c!));
    await input(page, 'Oikealta yhteensä').fill(String(a! * b! * c!));
    await submit(page, true);
  });

  test('turning preserves cell identities and accepts the same marked seat at new row and column', async ({ page }) => {
    await open(page, 'M-MUL-COMM', 7);
    const [size, point, direction] = await givens(page).locator('dd').allTextContents();
    const [rows, cols] = nums(size!), [r, c] = nums(point!);
    const clockwise = direction!.includes('myötä');
    const grid = page.locator('[data-arithmetic-rotate]');
    const cells = () => grid.locator('[data-seat]').evaluateAll(els => els.map(el => el.getAttribute('data-seat')));
    const before = await cells();
    await button(page, clockwise ? 'Käännä myötäpäivään' : 'Käännä vastapäivään').press('Enter');
    const after = await cells();
    expect([...after].sort()).toEqual([...before].sort());
    expect(after).not.toEqual(before);
    for (const [label, n] of [['Rivejä alussa', rows], ['Sarakkeita alussa', cols], ['Rivejä lopussa', cols], ['Sarakkeita lopussa', rows]] as const) {
      await input(page, label).fill(String(n));
    }
    const matrix = Array.from({ length: rows! }, (_, i) => before.slice(i * cols!, (i + 1) * cols!));
    const transpose = matrix[0]!.map((_, i) => matrix.map(row => row[i]));
    const turned = clockwise ? transpose.map(row => [...row].reverse()) : [...transpose].reverse();
    const id = `${r}-${c}`;
    const targetRow = turned.findIndex(row => row.includes(id));
    const targetColumn = turned[targetRow]!.indexOf(id);
    await button(page, `Rivi ${targetRow + 1}, sarake ${targetColumn + 1}`).press('Enter');
    await submit(page, true);

    await open(page, 'M-MUL-COMM', 1);
    expect((await snapshot(page)).family).toBe('rotate-find-original-seat');
    const [dimensions, destination] = await givens(page).locator('dd').allTextContents();
    const [originalRows, originalColumns] = nums(dimensions!);
    const [destRow, destColumn] = nums(destination!);
    await button(page, 'Käännä vastapäivään').press('Enter');
    for (const [label, value] of [
      ['Rivejä alussa', originalRows], ['Sarakkeita alussa', originalColumns], ['Rivejä lopussa', originalColumns], ['Sarakkeita lopussa', originalRows],
      ['Istuimen alkurivi', destColumn], ['Istuimen alkusarake', originalColumns! + 1 - destRow!],
    ] as const) await input(page, label).fill(String(value));
    await submit(page, true);
  });

  test('zero, overlap and neither are separate divisibility classifications', async ({ page }) => {
    await open(page, 'M-DIVIS-03', 1);
    const mixed = (await snapshot(page)).family === 'divisor-and-multiple-roles';
    const ruleText = await givens(page).locator('dd').first().innerText();
    const [first, second] = nums(ruleText);
    const rows = await workbench(page).locator('strong').allTextContents();
    let sawOverlap = false;
    for (const raw of rows) {
      const n = Number(raw);
      const inFirst = mixed ? n > 0 && first! % n === 0 : n % first! === 0;
      const inSecond = n % second! === 0;
      if (inFirst) await button(page, `${n}: Luvun ${first} ${mixed ? 'jakaja' : 'monikerta'}`).click();
      if (inSecond) await button(page, `${n}: Luvun ${second} monikerta`).click();
      if (!inFirst && !inSecond) await button(page, `${n}: Ei kumpaankaan`).click();
      if (inFirst && inSecond) {
        sawOverlap = true;
        await expect(button(page, `${n}: Luvun ${first} ${mixed ? 'jakaja' : 'monikerta'}`)).toHaveAttribute('aria-pressed', 'true');
      }
    }
    expect(sawOverlap).toBe(true);
    await submit(page, true);
  });

  test('calculation accepts a produced partition and a produced compensation on fresh tasks', async ({ page }) => {
    await open(page, 'M-CALC-STRAT', 7);
    for (const method of ['partition', 'adjust'] as const) {
      const equation = await givens(page).locator('dd').first().innerText();
      const [a, b] = nums(equation), sign = equation.includes('−') ? -1 : 1;
      await menu(page, 'Oma laskutapa').selectOption(method);
      if (method === 'partition') {
        await input(page, 'Osa 1').fill(String(b! - 1));
        await input(page, 'Osa 2').fill('1');
        await input(page, 'Välitulos').fill(String(a! + sign * (b! - 1)));
      } else {
        const anchor = Math.round(b! / 10) * 10;
        await input(page, 'Tasakymppi').fill(String(anchor));
        await input(page, 'Korjaus').fill(String(b! - anchor));
        await input(page, 'Välitulos').fill(String(a! + sign * anchor));
      }
      await input(page, 'Tarkka tulos').fill(String(a! + sign * b!));
      await submit(page, true);
      if (method === 'partition') await button(page, 'Seuraava kokeilu').click();
    }
  });

  test('systematic search records inferences across both families and requires final substitution in transfer', async ({ page }) => {
    await open(page, 'M-ALG-09');
    const families = new Set<string>(), seeds = new Set<number>();
    for (let i = 0; i < 3; i++) {
      const state = await snapshot(page);
      families.add(state.family);
      seeds.add(state.seed);
      await hunt(page);
      await submit(page, true);
      if (i < 2) await button(page, 'Seuraava kokeilu').click();
    }
    expect(families).toEqual(new Set(['hunt-additive-unknown', 'hunt-scale-unknown']));
    expect(seeds.size).toBe(3);
    await button(page, 'Kokeile uudessa tilanteessa').click();
    expect((await snapshot(page)).phase).toBe('transfer');
    await hunt(page, true);
    await submit(page, false);
    expect((await snapshot(page)).progress.checked).toBe(false);
    await button(page, 'Uusi kokeilu').click();
    await hunt(page);
    await submit(page, true);
    expect((await snapshot(page)).progress.checked).toBe(true);
    expect((await saved(page)).events).toEqual([expect.objectContaining({ node: 'M-ALG-09', assisted: false })]);
  });

  test('spoken rule and two checked transitions require separate adult confirmation', async ({ page }) => {
    await open(page, 'M-ALG-02');
    await expect(page.locator('textarea, audio')).toHaveCount(0);
    await button(page, 'Olen kertonut selitykseni').click();
    const adult = page.locator('[data-explanation-adult]');
    await menu(page, 'Sanoo toistettavan säännön').selectOption('met');
    await menu(page, 'Saiko oppija apua?').selectOption('none');
    await adult.getByRole('checkbox').check();
    await button(page, 'Vahvista havainto').click();
    await expect(adult.getByRole('status')).toContainText('odottaa');
    expect((await saved(page)).attempts).toHaveLength(0);
    await menu(page, 'Testaa säännön kahdessa välissä').selectOption('met');
    await button(page, 'Vahvista havainto').click();
    await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
    expect((await saved(page)).attempts).toEqual([expect.objectContaining({ node: 'M-ALG-02', assessor: 'adult' })]);
  });

  for (const [label, viewport] of [['desktop', { width: 1366, height: 768 }], ['tablet', { width: 768, height: 1024 }]] as const) {
    test(`both families of all thirteen tasks fit ${label}`, async ({ page }, info) => {
      test.setTimeout(90_000);
      await page.setViewportSize(viewport);
      for (const id of ids) {
        const families = new Set<string>();
        for (const seed of [1, 7]) {
          await open(page, id, seed);
          const state = await snapshot(page);
          families.add(state.family);
          if (id === 'M-ALG-02') await button(page, 'Olen kertonut selitykseni').click();
          if (id === 'M-ALG-09') await hunt(page);
          if (id === 'M-CALC-STRAT') await menu(page, 'Oma laskutapa').selectOption('columns');
          if (id === 'M-MUL-ASSOC') await button(page, 'Avaa oikea ryhmittely').click();
          if (id === 'M-MUL-COMM') await button(page, state.family.includes('original-seat') ? 'Käännä vastapäivään' : 'Käännä myötäpäivään').click();
          const bounds = await page.evaluate(() => {
            const boxes = [...document.querySelectorAll('[data-arithmetic-givens],[data-arithmetic-workbench],[data-explanation-board],[data-observed-explanation]')]
              .map(node => node.getBoundingClientRect());
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
        if (id === 'M-MUL-COMM' || id === 'M-ALG-09') {
          const path = info.outputPath(`${id}-${label}.png`);
          await page.screenshot({ path });
          await info.attach(id, { path, contentType: 'image/png' });
        }
      }
    });
  }
});
