// Served production build (vite preview of dist/): KC links (review V4-03/G03) and two open tabs (G01).
import { expect, test, type Page } from '@playwright/test';
// These checks cover the opt-in adult review; solo play (the default) has its own spec.
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { try { localStorage.setItem('sammakko-saaristo-adult-review', 'on'); } catch { /* storage blocked */ } }); });

const KEY = 'sammakko-lite-2';
type Save = { world: string | null; attempts: { node: string; sess: string; at: number }[]; events: { type: string; text?: string }[] };
const saveOf = async (p: Page): Promise<Save | null> => p.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? 'null'), KEY);
const attempts = async (p: Page) => (await saveOf(p))?.attempts.length ?? 0;

/** Same task every run: each page gets its own fixed Math.random sequence. */
const seeded = (p: Page, seed: number) => p.addInitScript((s) => {
  let x = s >>> 0;
  Math.random = () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 2 ** 32; };
}, seed);

/** Open the quick check by changing the address (same document, no reload) and answer its first
 *  task once, right or wrong; an attempt is recorded either way. */
async function submitAnswer(p: Page) {
  await p.evaluate(() => { location.hash = '#alueet'; });
  await p.evaluate(() => { location.hash = '#kc/M-NUM-02'; });
  await p.getByRole('button', { name: 'Osaan jo' }).click();
  await p.locator('#app button.opt:not([disabled])').first().click();
  const done = p.getByRole('button', { name: 'Valmis' });
  if (await done.isVisible()) await done.click();
}

/** Exact single-answer check for sequential interactions only. A concurrent answer in another
 *  tab may legitimately move the shared count past n + 1 before this page observes it. */
async function answer(p: Page) {
  const n = await attempts(p);
  await submitAnswer(p);
  await expect.poll(() => attempts(p)).toBe(n + 1);
}

test.describe('KC links on the production build', () => {
  test.beforeEach(async ({ page }) => { await page.goto('./'); await page.evaluate(() => (localStorage.clear(),localStorage.setItem('sammakko-saaristo-adult-review','on'))); });

  test('known id opens the lesson, nothing is recorded', async ({ page }) => {
    await page.goto('./#kc/M-NUM-02');
    await expect(page.getByRole('button', { name: 'Osaan jo' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Osaan jo' })).toBeVisible();
    expect(await attempts(page)).toBe(0);
  });

  test('canonical id not in Lite, unknown id and malformed link', async ({ page }) => {
    const canon = await (await page.request.get('./canonical-ids.json')).json() as { titles: Record<string, string> };
    const runtime = await (await page.request.get('./lite-runtime.json')).json() as { runtimeAvailability: { ids: string[] } };
    const notInLite = Object.keys(canon.titles).find((id) => !runtime.runtimeAvailability.ids.includes(id))!;
    await page.goto(`./#kc/${notInLite}`);
    await expect(page.locator('.title')).toHaveText('Aihetta ei ole tässä versiossa');
    await expect(page.getByRole('status')).toContainText(canon.titles[notInLite]);
    await page.goto('./#kc/M-NOPE-99');
    await expect(page.locator('.title')).toHaveText('Tuntematon aihe');
    await page.goto('./#kc/%E0%A4%A');
    await expect(page.locator('.title')).toHaveText('Linkki ei toimi');
    expect(await attempts(page)).toBe(0);
  });

  test('title list failure: error with retry and a way back, never "unknown"; retry recovers', async ({ page }) => {
    let block = true;
    await page.route('**/canonical-ids.json', (r) => (block ? r.fulfill({ status: 503, body: 'down' }) : r.continue()));
    await page.goto('./#kc/M-NOPE-99');
    await expect(page.locator('.title')).toHaveText('Aiheluetteloa ei saatu ladattua');
    await expect(page.getByRole('status')).toContainText('HTTP 503');
    await expect(page.getByRole('button', { name: 'Kartalle' })).toBeVisible();
    block = false;
    await page.getByRole('button', { name: 'Yritä uudelleen' }).click();
    await expect(page.locator('.title')).toHaveText('Tuntematon aihe');
    expect(await attempts(page)).toBe(0);
  });

  test('a slow failure for a link the reader already left does not replace the newer page', async ({ page }) => {
    let release!: () => void;
    const gate = new Promise<void>((r) => { release = r; });
    await page.route('**/canonical-ids.json', async (r) => { await gate; await r.fulfill({ status: 503, body: 'down' }); });
    await page.goto('./#kc/M-NOPE-99');
    await expect(page.locator('.title')).toHaveText('Haetaan aihetta');
    await page.evaluate(() => { location.hash = '#kc/M-NUM-02'; });
    await expect(page.getByRole('button', { name: 'Osaan jo' })).toBeVisible();
    release();
    await page.waitForTimeout(500);
    await expect(page.getByRole('button', { name: 'Osaan jo' })).toBeVisible();
    await expect(page.locator('.title')).not.toHaveText('Aiheluetteloa ei saatu ladattua');
  });
});

test.describe('two tabs (review G01)', () => {
  test('A answers, stale B switches world, reload: the answer and the world are both kept', async ({ context }) => {
    const A = await context.newPage(), B = await context.newPage();
    await seeded(A, 1); await seeded(B, 2);
    await A.goto('./'); await A.evaluate(() => (localStorage.clear(),localStorage.setItem('sammakko-saaristo-adult-review','on')));
    await A.goto('./#alueet'); await A.reload();
    await B.goto('./#alueet');
    // A answers in a lesson; B still shows the world list it drew before.
    await A.goto('./#kc/M-NUM-02');
    await answer(A);
    await B.locator('button.world.saari').click();
    await B.reload();
    const s = (await saveOf(B))!;
    expect(s.world).toBe('saari');
    expect(s.attempts.map((a) => a.node)).toEqual(['M-NUM-02']);
    // A's map, opened after B's switch, shows the new world and still has the answer.
    await A.goto('./');
    await expect(A.locator('h1, .title').first()).toBeVisible();
    expect((await saveOf(A))!.world).toBe('saari');
    expect(await attempts(A)).toBe(1);
  });

  test('answers in both tabs are all kept', async ({ context }) => {
    const A = await context.newPage(), B = await context.newPage();
    await seeded(A, 3); await seeded(B, 4);
    await A.goto('./'); await A.evaluate(() => (localStorage.clear(),localStorage.setItem('sammakko-saaristo-adult-review','on')));
    await A.goto('./#alueet'); await B.goto('./#alueet');
    await answer(A); await answer(B); await answer(A);
    const before = (await saveOf(A))!.attempts;
    const sessionA = before[0].sess, sessionB = before[1].sess;
    expect(sessionA).not.toBe(sessionB);
    await Promise.all([submitAnswer(A), submitAnswer(B)]);
    await expect.poll(() => attempts(A)).toBe(5);
    await Promise.all([A.reload(), B.reload()]);
    const savedA = (await saveOf(A))!, savedB = (await saveOf(B))!;
    expect(savedA.attempts).toEqual(savedB.attempts);
    expect(savedA.attempts).toHaveLength(5);
    expect(savedA.attempts).toEqual(expect.arrayContaining(before));
    expect(savedA.attempts.filter((a) => a.sess === sessionA)).toHaveLength(3);
    expect(savedA.attempts.filter((a) => a.sess === sessionB)).toHaveLength(2);
    expect(new Set(savedA.attempts.map((a) => JSON.stringify(a))).size).toBe(5);
  });

  test('a note written in one tab survives an answer in the other', async ({ context }) => {
    const A = await context.newPage(), B = await context.newPage();
    await seeded(A, 5); await seeded(B, 6);
    await A.goto('./'); await A.evaluate(() => (localStorage.clear(),localStorage.setItem('sammakko-saaristo-adult-review','on')));
    await B.goto('./#alueet');
    await A.goto('./#aikuiselle');
    await A.locator('textarea').first().fill('Harjoiteltiin rannalla');
    await A.getByRole('button', { name: 'Tallenna muistiinpano' }).click();
    await answer(B);
    await B.reload();
    const s = (await saveOf(B))!;
    expect(s.events.filter((e) => e.type === 'note').map((e) => e.text)).toEqual(['Harjoiteltiin rannalla']);
    expect(s.attempts).toHaveLength(1);
  });
});

test('the /lite/ deployment prefix preserves KC routes and title-list recovery', async ({ page }) => {
  const base = 'http://127.0.0.1:5203/lite/';
  const errors: string[] = [], titleRequests: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => {
    if (new URL(r.url()).pathname.endsWith('/canonical-ids.json')) titleRequests.push(r.url());
  });
  await page.goto(`${base}#kc/M-NUM-02`);
  await expect(page.getByRole('button', { name: 'Osaan jo' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Osaan jo' })).toBeVisible();

  let block = true;
  await page.route('**/canonical-ids.json', (r) => block ? r.fulfill({ status: 503, body: 'down' }) : r.continue());
  await page.goto(`${base}#kc/M-NOPE-99`);
  await expect(page.locator('.title')).toHaveText('Aiheluetteloa ei saatu ladattua');
  await expect(page.getByRole('status')).toContainText('HTTP 503');
  await expect(page.getByRole('button', { name: 'Kartalle' })).toBeVisible();
  block = false;
  await page.getByRole('button', { name: 'Yritä uudelleen' }).click();
  await expect(page.locator('.title')).toHaveText('Tuntematon aihe');
  expect(titleRequests).toEqual([`${base}canonical-ids.json`, `${base}canonical-ids.json`]);

  const canon = await (await page.request.get(`${base}canonical-ids.json`)).json() as { titles: Record<string, string> };
  const runtime = await (await page.request.get(`${base}lite-runtime.json`)).json() as { runtimeAvailability: { ids: string[] } };
  const notInLite = Object.keys(canon.titles).find((id) => !runtime.runtimeAvailability.ids.includes(id))!;
  await page.goto(`${base}#kc/${notInLite}`);
  await expect(page.locator('.title')).toHaveText('Aihetta ei ole tässä versiossa');
  await expect(page.getByRole('status')).toContainText(canon.titles[notInLite]);
  expect(await attempts(page)).toBe(0);
  expect(errors).toEqual([]);
});
