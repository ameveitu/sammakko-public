import { expect, test, type Page } from '@playwright/test';
// These checks cover the opt-in adult review; solo play (the default) has its own spec.
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { try { localStorage.setItem('sammakko-saaristo-adult-review', 'on'); } catch { /* storage blocked */ } }); });

const ids = ['M79-DATA-COLLECT', 'M79-DATA-STRUCT', 'M79-FREQ', 'M79-RELFREQ', 'M79-MEAN', 'M79-MEDIAN', 'M79-MODE',
  'M79-SPREAD', 'M79-DIAGRAM-INTERP', 'M79-DIAGRAM-PROD', 'M79-PROB-SPACE', 'M79-PROB-CLASSIC', 'M79-PROB-EMP'] as const;
type Id = typeof ids[number];
type Snapshot = { family: string; phase: string; renderer: string; model: Record<string, unknown> | null; stage: Record<string, unknown>; progress: { checked: boolean } };
const state = (page: Page): Promise<Snapshot> => page.evaluate(() => JSON.parse(
  (window as Window & { render_game_to_text: () => string }).render_game_to_text()));
const receipts = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3') ?? '{"attempts":[],"events":[]}'));
const work = (page: Page) => page.locator('[data-harbor-workbench]');
const givens = (page: Page) => page.locator('[data-harbor-givens]');
const review = (page: Page) => page.locator('[data-harbor-review]');
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const input = (page: Page, name: string) => work(page).getByRole('textbox', { name, exact: true });
const menu = (page: Page, name: string) => work(page).getByRole('combobox', { name, exact: true });
const submit = (page: Page) => work(page).locator('[data-harbor-submit]');

async function open(page: Page, id: Id, seed = 7) {
  await page.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);
  await button(page, 'Kokeilen itse').click();
  await expect(work(page)).toBeVisible();
}
async function finish(page: Page, yes: boolean) {
  await submit(page).press('Enter');
  await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok', String(yes));
}
async function adult(page: Page, assist = false, yes = true) {
  await expect(review(page)).toBeVisible();
  await button(page, 'Olen kertonut selitykseni').press('Enter');
  const adult = review(page).locator('[data-explanation-adult]');
  await expect(adult.getByRole('heading', { name: 'Aikuisen arvio' })).toBeVisible();
  const before = (await receipts(page)).attempts.length;
  await button(page, 'Vahvista havainto').click();
  expect((await receipts(page)).attempts.length).toBe(before);
  await adult.getByRole('combobox', { name: 'Osoittaa oman havaintonsa tai laskunsa', exact: true }).selectOption('met');
  await adult.getByRole('combobox', { name: 'Perustelee valinnan ja rajaa päätelmän', exact: true }).selectOption(yes ? 'met' : 'not-yet');
  await adult.getByRole('combobox', { name: 'Saiko oppija apua?', exact: true }).selectOption(assist ? 'helped' : 'none');
  await adult.getByRole('checkbox', { name: 'Kuulin oppijan oman selityksen.', exact: true }).check();
  await adult.getByText('Tallennus ja vapaa palaute', { exact: true }).click();
  await adult.getByRole('textbox', { name: 'Vapaa palaute tähän hetkeen' }).fill('Paikallinen testimuistiinpano');
  await button(page, 'Vahvista havainto').click();
  await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok', String(yes));
  const attempt = (await receipts(page)).attempts.at(-1);
  expect(attempt).toMatchObject({ assessor: 'adult', ok: yes });
  if (assist) {
    expect(attempt.help).toContain('support');
    await expect(page.locator('.exp-pips')).toHaveAttribute('aria-label', '0 peräkkäistä itsenäistä onnistumista');
  }
  expect(Object.keys(JSON.parse(attempt.resp).review).sort()).toEqual(['assistance', 'confirmedByAdult', 'observations']);
  expect(attempt.resp).not.toContain('Paikallinen testimuistiinpano');
  expect(JSON.stringify(await state(page))).not.toContain('Paikallinen testimuistiinpano');
}
async function doCollection(page: Page, bad = false) {
  const names = await work(page).locator('[data-harbor-point]').evaluateAll(nodes => nodes.map(node => (node as HTMLElement).dataset.harborName!));
  const rules = await givens(page).locator('[data-harbor-coverage]').allTextContents();
  const wind = (await givens(page).innerText()).includes('Mistä tuuli');
  await menu(page, 'Tutkimuksen muuttuja').selectOption(wind ? 'wind' : 'visits');
  await menu(page, 'Havaintomenetelmä').selectOption(wind ? 'vane' : 'count');
  const variants = Array.from({ length: 1 << names.length }, (_, bits) => names.filter((_, i) => (bits & (1 << i)) !== 0));
  const selected = variants.find(list => list.length === 4 && rules.every(rule => list.some(name => name.includes(rule))) !== bad)!;
  for (const name of selected) await button(page, name).press('Space');
  await expect(work(page).locator('[data-harbor-state="observed"]')).toHaveCount(0);
  await button(page, 'Lukitse keruusuunnitelma').press('Enter');
  await expect(submit(page)).toBeDisabled();
  for (const name of selected) await button(page, name).press('Enter');
  const observed = work(page).locator('[data-harbor-state="observed"]');
  await expect(observed).toHaveCount(4);
  for (const value of await observed.all()) {
    await expect(value).toBeDisabled();
    await expect(value).toHaveCSS('opacity', '1');
  }
}
const fractionGreater = (a: number, n: number, b: number, m: number) => a * m > b * n ? 'a' : a * m < b * n ? 'b' : 'equal';

test.describe('Säähavaintojen satama', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        return /^webgl/.test(type) ? null : Reflect.apply(get, this, [type, ...args]);
      } as typeof get;
    });
  });

  test('collects an actual planned sample, rejects insufficient coverage, and needs adult evidence for the new try', async ({ page }) => {
    await open(page, 'M79-DATA-COLLECT');
    await doCollection(page, true);
    await finish(page, false);
    expect((await receipts(page)).events).toHaveLength(0);
    await button(page, 'Uusi kokeilu').click();
    await doCollection(page);
    await submit(page).click();
    await adult(page, true);
  });

  test('retains measured zero and outliers while making a separate row for missing data and marking the actual copy', async ({ page }) => {
    await open(page, 'M79-DATA-STRUCT', 1);
    const slips = await givens(page).locator('span').allTextContents();
    const unit = (await givens(page).innerText()).includes('°C') ? '°C' : 'kpl';
    await menu(page, 'Taulukon muuttuja').selectOption(unit === '°C' ? 'temperature' : 'visits');
    await menu(page, 'Taulukon yksikkö').selectOption(unit);
    const seen = new Set<string>();
    for (const slip of slips) {
      const [id, log, , value] = slip.split(' · ');
      if (seen.has(log!)) { await work(page).getByRole('checkbox', { name: `Kopio ${id}` }).check(); continue; }
      seen.add(log!);
      await menu(page, `Rivi ${log}, lappu`).selectOption(id!);
      if (value !== 'puuttuu') await input(page, `Rivi ${log}, lukema`).fill(value!);
      await menu(page, `Rivi ${log}, merkintä`).selectOption(value === 'puuttuu' ? 'missing' : Number(value) > 10 ? 'check' : 'reading');
    }
    await finish(page, true);
  });

  test('records integer frequencies and exact relative frequencies against the correct sample size', async ({ page }) => {
    await open(page, 'M79-FREQ', 1);
    const labels = await givens(page).locator('[data-harbor-values] span').allTextContents();
    const fields = work(page).getByRole('textbox', { name: /, frekvenssi$/ });
    for (const field of await fields.all()) {
      const name = (await field.getAttribute('aria-label'))!.replace(', frekvenssi', '');
      await field.fill(String(labels.filter(x => x === name).length));
    }
    await input(page, 'Frekvenssien summa').fill(String(labels.length));
    await finish(page, true);
    await open(page, 'M79-RELFREQ');
    const rows = await givens(page).locator('tbody tr').evaluateAll(rows => rows.map(row => [...row.querySelectorAll('td')].map(cell => Number(cell.textContent))));
    for (const [i, [count, total]] of rows.entries()) {
      const id = i ? 'B' : 'A';
      await input(page, `Frekvenssi ${id}`).fill(String(count));
      await input(page, `Suhteellinen frekvenssi ${id}`).fill(`${count! * 2}/${total! * 2}`);
    }
    await menu(page, 'Suurempi suhteellinen frekvenssi').selectOption(fractionGreater(rows[0]![0]!, rows[0]![1]!, rows[1]![0]!, rows[1]![1]!));
    await finish(page, true);
  });

  test('sorts repeated observations and averages both middle ranks', async ({ page }) => {
    for (const seed of [1, 7]) {
      await open(page, 'M79-MEDIAN', seed);
      if ((await state(page)).family.includes('two-middle')) break;
    }
    const pool = work(page).locator('[data-harbor-order="pool"] button');
    const tokens = (await pool.allTextContents()).map(text => text.split(' · ')).sort((a, b) => Number(a[1]) - Number(b[1]) || b[0]!.localeCompare(a[0]!));
    expect(tokens.length % 2).toBe(0);
    for (const [id] of tokens) await button(page, `Aseta havainto ${id}`).press('Enter');
    const [a, b] = tokens.slice(tokens.length / 2 - 1, tokens.length / 2 + 1);
    await button(page, `Merkitse keskimmäiseksi ${a![0]}`).press('Space');
    await button(page, `Merkitse keskimmäiseksi ${b![0]}`).press('Space');
    await input(page, 'Mediaani').fill(`${Number(a![1]) + Number(b![1])}/2`);
    await finish(page, true);
  });

  test('builds its own exact chart before a separate adult review of the learner explanation', async ({ page }) => {
    await open(page, 'M79-DIAGRAM-PROD');
    await menu(page, 'Diagrammityyppi').selectOption('line');
    await menu(page, 'Vaaka-akselin nimi').selectOption('Kellonaika');
    await menu(page, 'Pystyakselin nimi ja yksikkö').selectOption('Havaintoja (kpl)');
    await input(page, 'Asteikon alku').fill('0');
    await input(page, 'Asteikkoväli').fill('3');
    await input(page, 'Asteikon yläraja').fill('15');
    const rows = await work(page).locator('tbody tr').evaluateAll(rows => rows.map(row => [row.querySelector('th')!.textContent!, row.querySelector('td')!.textContent!]));
    for (const [label, value] of rows) await input(page, `Arvo ${label}`).fill(value!);
    await expect(work(page).locator('[data-harbor-chart-preview] circle')).toHaveCount(rows.length);
    await submit(page).click();
    await adult(page);
  });

  test('checks numerical poster comparisons before an independently observed conclusion', async ({ page }) => {
    for (const seed of [1, 7]) {
      await open(page, 'M79-DIAGRAM-INTERP', seed);
      if ((await state(page)).family.includes('populations')) break;
    }
    const rows = await work(page).locator('tbody tr').evaluateAll(rows => rows.map(row => [...row.querySelectorAll('td')].map(td => Number(td.textContent))));
    const [a, b] = rows;
    await menu(page, 'Julisteen ongelma').selectOption('population');
    await input(page, 'Toisen ja ensimmäisen lukeman erotus').fill(String(b![0]! - a![0]!));
    await input(page, 'Otos A, osuus').fill(`${a![0]}/${a![1]}`);
    await input(page, 'Otos B, osuus').fill(`${b![0]}/${b![1]}`);
    await menu(page, 'Otos, jossa osuus on suurempi').selectOption(fractionGreater(a![0]!, a![1]!, b![0]!, b![1]!));
    await submit(page).click();
    await adult(page, false, false);
  });

  test('lists each unordered pair once and accepts a reversed representation of the pair', async ({ page }) => {
    for (const seed of [1, 7]) {
      await open(page, 'M79-PROB-SPACE', seed);
      if ((await state(page)).family.includes('unordered')) break;
    }
    const first = menu(page, 'Parin ensimmäinen tunnus'), second = menu(page, 'Parin toinen tunnus');
    const choices = (await first.locator('option').allTextContents()).slice(1);
    let size = 0;
    for (let i = 0; i < choices.length; i++) for (let j = i + 1; j < choices.length; j++) {
      await first.selectOption(choices[j]!); await second.selectOption(choices[i]!);
      await button(page, 'Lisää pari').press('Space'); size++;
    }
    await expect(work(page).locator('[data-harbor-pairs] span')).toHaveCount(size);
    await input(page, 'Alkeistulosten määrä').fill(String(size));
    await finish(page, true);
  });

  test('distinguishes same-colored sectors and requires equal elementary outcomes', async ({ page }) => {
    for (const seed of [1, 7]) {
      await open(page, 'M79-PROB-CLASSIC', seed);
      if ((await state(page)).family.includes('colour')) break;
    }
    const cells = await work(page).locator('[data-harbor-classic] input').all();
    let favorable = 0;
    for (const cell of cells) if ((await cell.getAttribute('aria-label'))!.startsWith('Sininen ')) {
      await cell.check(); favorable++;
    }
    expect(favorable).toBeGreaterThanOrEqual(2);
    await input(page, 'Suotuisia alkeistuloksia').fill(String(favorable));
    await input(page, 'Kaikki alkeistulokset').fill(String(cells.length));
    await input(page, 'Tapahtuman todennäköisyys').fill(`${favorable}/${cells.length}`);
    await menu(page, 'Miksi suhde toimii?').selectOption('equal-atomic');
    await finish(page, true);
  });

  test('runs actual seeded samples before accepting experimental ratios, and rejects a compensation prediction', async ({ page }) => {
    await open(page, 'M79-PROB-EMP');
    const fill = async (compensation: boolean) => {
      const model = (await givens(page).getByRole('img').getAttribute('aria-label'))!.split(': ')[1]!.slice(0, -1).split(', ');
      const hits = model.filter(x => x === 'Sininen').length;
      const distances: { id: string; size: number; numerator: number }[] = [];
      await expect(submit(page)).toBeDisabled();
      for (const experiment of await work(page).locator('[data-harbor-experiment]').all()) {
        const id = (await experiment.getAttribute('data-harbor-experiment'))!;
        const result = experiment.locator('[data-harbor-result]');
        await expect(result).toContainText('Ei ajettu');
        await button(page, `Aja koe ${id}`).press('Enter');
        const [, count, total] = /(\d+)\/(\d+) sinistä/.exec(await result.innerText())!;
        await input(page, `Koe ${id}, frekvenssi`).fill(count!);
        await input(page, `Koe ${id}, osuus`).fill(`${count}/${total}`);
        distances.push({ id, size: Number(total), numerator: Math.abs(Number(count) * model.length - hits * Number(total)) });
      }
      for (const candidate of distances) if (distances.every(other => candidate.numerator * other.size <= other.numerator * candidate.size)) {
        await work(page).getByRole('checkbox', { name: `Koe ${candidate.id}`, exact: true }).check();
      }
      await input(page, 'Mallin todennäköisyys seuraavassa kokeessa').fill(`${hits}/${model.length}`);
      await menu(page, 'Mitä kokeiden osuudet kertovat?').selectOption(compensation ? 'compensation' : 'estimate');
    };
    await fill(true);
    await finish(page, false);
    await button(page, 'Uusi kokeilu').click();
    for (let round = 0; round < 4; round++) {
      if (round === 3) expect((await state(page)).phase).toBe('transfer');
      await fill(false);
      await finish(page, true);
      if (round < 2) await button(page, 'Seuraava kokeilu').click();
      if (round === 2) await button(page, 'Kokeile uudessa tilanteessa').click();
    }
    expect((await state(page)).progress.checked).toBe(true);
    expect((await receipts(page)).events).toEqual([expect.objectContaining({ node: 'M79-PROB-EMP', assisted: false })]);
  });

  for (const [name, viewport] of [['desktop', { width: 1366, height: 768 }], ['tablet', { width: 768, height: 1024 }]] as const) {
    test(`all 26 task families retain givens and controls on ${name}`, async ({ page }, info) => {
      test.setTimeout(90_000);
      await page.setViewportSize(viewport);
      const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
      for (const id of ids) {
        const families = new Set<string>();
        for (const seed of [1, 7]) {
          await open(page, id, seed);
          families.add((await state(page)).family);
          if (id === 'M79-PROB-EMP') await button(page, 'Aja koe A').click();
          await expect(givens(page), `${id} ${seed}`).toBeInViewport({ ratio: 1 });
          await expect(work(page), `${id} ${seed}`).toBeInViewport({ ratio: 1 });
          for (const control of await work(page).locator('button:visible,input:not([type="checkbox"]):visible,select:visible').all()) {
            expect((await control.boundingBox())!.height, id).toBeGreaterThanOrEqual(44);
          }
        }
        expect(families.size, id).toBe(2);
        if (['M79-DATA-COLLECT', 'M79-DIAGRAM-INTERP', 'M79-PROB-EMP', 'M79-SPREAD'].includes(id)) {
          await page.screenshot({ path: info.outputPath(`${id}-${name}.png`) });
        }
      }
      expect(errors).toEqual([]);
    });
  }
});
