import { expect, test, type Page } from '@playwright/test';
// These checks cover the opt-in adult review; solo play (the default) has its own spec.
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { try { localStorage.setItem('sammakko-saaristo-adult-review', 'on'); } catch { /* storage blocked */ } }); });

const ids = ['M-PS-04', 'M-REP-03', 'M-REP-05'] as const;
type Id = typeof ids[number];
type Snapshot = { node: Id; phase: string; family: string; seed: number; progress: { helped: boolean; checked: boolean } };
type Attempt = { node: string; phase: string; ok: boolean; tag: string; seed: number; help: string[]; assessor?: string; resp: string };
type Journey = { attempts: Attempt[]; events: { node: string; assisted: boolean }[] };

const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const adult = (page: Page) => page.locator('[data-explanation-adult]');
const review = (page: Page) => button(page, 'Vahvista havainto');
const criteria = (page: Page) => adult(page).locator('select').filter({ has: page.locator('option[value="unobserved"]') });
const checkbox = (page: Page) => adult(page).getByRole('checkbox');
const feedback = (page: Page) => page.locator('.exp-feedback');
const textField = (page: Page) => page.getByRole('textbox', { name: 'Oma selitykseni', exact: true });
const shot = (page: Page): Promise<Snapshot> => page.evaluate(() =>
  JSON.parse((window as Window & { render_game_to_text: () => string }).render_game_to_text()));
const saved = (page: Page): Promise<Journey> => page.evaluate(() =>
  JSON.parse(localStorage.getItem('sammakko-journey-3') ?? '{"attempts":[],"events":[]}'));

async function open(page: Page, id: Id, seed = 7) {
  await page.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);
  await button(page, 'Kokeilen itse').click();
  await expect(page.locator('[data-explanation-board]')).toBeVisible();
}

async function handOff(page: Page, spoken: boolean, text = 'Vain aikuiselle näkyvä oma selitys.') {
  if (!spoken) await textField(page).fill(text);
  await button(page, spoken ? 'Olen kertonut selitykseni' : 'Olen kirjoittanut selitykseni').click();
  await expect(adult(page).getByRole('heading', { name: 'Aikuisen arvio' })).toBeFocused();
  await expect(page.locator('[data-explanation-learner]')).toBeHidden();
}

async function rate(page: Page, result: 'met' | 'not-yet' = 'met', helped = false) {
  for (const field of await criteria(page).all()) await field.selectOption(result);
  await adult(page).getByRole('combobox', { name: 'Saiko oppija apua?' }).selectOption(helped ? 'helped' : 'none');
  await checkbox(page).check();
}

async function observe(page: Page, spoken: boolean, helped = false) {
  await handOff(page, spoken);
  await rate(page, 'met', helped);
  await review(page).click();
  await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
}

test.describe('Selitysten telttakylän aikuishavainto', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        return /^webgl/.test(type) ? null : Reflect.apply(get, this, [type, ...args]);
      } as typeof get;
    });
  });

  test('pending and unobserved are retryable, while a genuine incomplete explanation is a failed adult observation', async ({ page }) => {
    await open(page, 'M-PS-04');
    await expect(button(page, 'Olen kirjoittanut selitykseni')).toBeDisabled();
    await expect(adult(page)).toBeHidden();
    await handOff(page, false);
    await rate(page);
    await checkbox(page).uncheck();
    await review(page).click();
    await expect(adult(page).getByRole('status')).toContainText('Aikuinen vahvistaa');
    await checkbox(page).check();
    await criteria(page).first().selectOption('unobserved');
    await review(page).click();
    await expect(adult(page).getByRole('status')).toContainText('Havainto odottaa');
    expect(await saved(page)).toEqual(expect.objectContaining({ attempts: [], events: [] }));
    await adult(page).locator('summary').click();
    await adult(page).getByRole('textbox', { name: 'Vapaa palaute tähän hetkeen' }).fill('Yksityinen palauteteksti.');
    await criteria(page).first().selectOption('not-yet');
    await review(page).click();
    await expect(feedback(page)).toHaveAttribute('data-ok', 'false');
    await expect(feedback(page)).toContainText('Harjoitellaan vielä tätä kohtaa');
    const { attempts, events } = await saved(page);
    expect(attempts).toEqual([expect.objectContaining({ node: 'M-PS-04', ok: false, assessor: 'adult', phase: 'independent' })]);
    expect(JSON.parse(attempts[0]!.resp)).toEqual(expect.objectContaining({
      channel: 'written', confirmedByAdult: true, assistance: 'none',
    }));
    expect(JSON.parse(attempts[0]!.resp)).not.toHaveProperty('text');
    expect(JSON.parse(attempts[0]!.resp)).not.toHaveProperty('note');
    expect(events).toHaveLength(0);
    await button(page, 'Näytä ja selitä').click();
    await expect(page.locator('[data-explanation-model]')).toBeVisible();
    await expect(checkbox(page)).not.toBeChecked();
    for (const field of await criteria(page).all()) await expect(field).toHaveValue('unobserved');
    expect((await saved(page)).attempts).toHaveLength(1);
    expect((await saved(page)).events).toHaveLength(0);
    await button(page, 'Uusi yhteinen kokeilu').click();
    expect((await shot(page)).phase).toBe('guided');
    await expect(textField(page)).toHaveValue('');
  });

  test('spoken REP03 requires a new human confirmation per case, with assistance separate from independent transfer', async ({ page }) => {
    await open(page, 'M-REP-03');
    await expect(page.locator('textarea, [type="file"], audio')).toHaveCount(0);
    await expect(page.getByText('Puhetta ei tallenneta.', { exact: false })).toBeVisible();
    await observe(page, true, true);
    expect((await saved(page)).attempts[0]).toMatchObject({ assessor: 'adult', ok: true, help: expect.arrayContaining(['support']) });
    expect((await shot(page)).progress.checked).toBe(false);
    await button(page, 'Toinen yhteinen kokeilu').click();
    expect((await shot(page)).phase).toBe('guided');
    await observe(page, true, true);
    expect((await saved(page)).events).toEqual([expect.objectContaining({ node: 'M-REP-03', assisted: true })]);
    expect((await shot(page)).progress).toMatchObject({ helped: true, checked: false });
    await button(page, 'Kokeilen nyt itse').click();
    const cases: Snapshot[] = [];
    for (let i = 0; i < 3; i++) {
      cases.push(await shot(page));
      await observe(page, true);
      if (i < 2) await button(page, 'Seuraava kokeilu').click();
    }
    expect(new Set(cases.map(row => row.family))).toEqual(new Set(['speak-combine-groups', 'speak-explain-missing-part']));
    expect(new Set(cases.map(row => row.seed)).size).toBe(3);
    await button(page, 'Kokeile uudessa tilanteessa').click();
    expect((await shot(page)).phase).toBe('transfer');
    await expect(page.locator('[data-explanation-board]')).toContainText('Sulkan eväslaukku');
    await handOff(page, true);
    await expect(checkbox(page)).not.toBeChecked();
    for (const field of await criteria(page).all()) await expect(field).toHaveValue('unobserved');
    expect((await shot(page)).progress.checked).toBe(false);
    await rate(page);
    await review(page).click();
    await expect(feedback(page)).toHaveAttribute('data-ok', 'true');
    expect((await shot(page)).progress.checked).toBe(true);
    const { attempts, events } = await saved(page);
    expect(attempts).toHaveLength(6);
    expect(attempts.every(row => row.node === 'M-REP-03' && row.assessor === 'adult' &&
      JSON.parse(row.resp).channel === 'spoken' && JSON.parse(row.resp).text === undefined)).toBe(true);
    expect(events).toHaveLength(1);
    await page.reload();
    await button(page, 'Aikuiselle: retken tiedot').click();
    await expect(page.getByText('Aikuisen arvioimia havaintoja: 6.', { exact: false })).toBeVisible();
    expect((await saved(page)).attempts).toEqual(attempts);
  });

  for (const [label, viewport] of [
    ['desktop', { width: 1366, height: 768 }],
    ['tablet', { width: 768, height: 1024 }],
  ] as const) {
    test(`both handoff steps keep givens and controls visible on ${label}`, async ({ page }, info) => {
      await page.setViewportSize(viewport);
      for (const id of ids) {
        const families = new Set<string>();
        for (const seed of [1, 7]) {
          await open(page, id, seed);
          families.add((await shot(page)).family);
          const visibleBounds = () => page.evaluate(() => {
            const visible = [...document.querySelectorAll('[data-explanation-board], [data-observed-explanation] :is(button,textarea,select,[type=checkbox])')]
              .filter(el => el.getClientRects().length).map(el => el.getBoundingClientRect());
            return { x: Math.min(...visible.map(r => r.left)), right: Math.max(...visible.map(r => r.right)),
              top: Math.min(...visible.map(r => r.top)), bottom: Math.max(...visible.map(r => r.bottom)),
              scrollWidth: document.documentElement.scrollWidth };
          });
          for (const stage of ['learner', 'adult']) {
            if (stage === 'adult') await handOff(page, id === 'M-REP-03');
            const bounds = await visibleBounds();
            const context = `${id} ${seed} ${stage} ${JSON.stringify(bounds)}`;
            expect(bounds.x, context).toBeGreaterThanOrEqual(0);
            expect(bounds.right, context).toBeLessThanOrEqual(viewport.width);
            expect(bounds.scrollWidth, context).toBeLessThanOrEqual(viewport.width);
            expect(bounds.top, context).toBeGreaterThanOrEqual(0);
            expect(bounds.bottom, context).toBeLessThanOrEqual(viewport.height);
          }
        }
        expect(families.size, id).toBe(2);
      }
      const path = info.outputPath(`observed-explanations-${label}.png`);
      await page.screenshot({ path });
      await info.attach(label, { path, contentType: 'image/png' });
    });
  }
});
