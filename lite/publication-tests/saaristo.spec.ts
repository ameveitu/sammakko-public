// Saaristo herää (/, formerly /saaristo/): the landing page renders a live pond where WebGL2 exists,
// falls back to the painted island where it does not, and respects reduced motion.
import {expect, test, type Page} from '@playwright/test';

const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({page}) => {
  await page.setViewportSize({width: 1440, height: 900});
  const list: string[] = [];
  errors.set(page, list);
  page.on('pageerror', e => list.push(e.message));
});
test.afterEach(async ({page}) => { expect(errors.get(page)).toEqual([]); });

async function mode(page: Page) {
  await expect(page.locator('html')).toHaveAttribute('data-saaristo', /webgl|fallback|static/, {timeout: 15_000});
  return page.locator('html').getAttribute('data-saaristo');
}

test('page has landmarks, a real heading and working exits', async ({page}) => {
  await page.goto('/');
  await mode(page);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toContainText('Pieni oivallus.');
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('main a[href="/lite/"]').first()).toBeVisible();
  await expect(page.locator('main a[href="/lite/#paja"]')).toHaveCount(1);
  await expect(page.locator('a[href^="/oppitunnit"]')).toHaveCount(0);
  for (const href of ['/', '/oppimisverkko/', '/whitepaper/', '/tietoa/']) await expect(page.locator(`#site-nav a[href="${href}"]`)).toHaveCount(1);
  await expect(page.locator('[data-hulluttelu]')).toHaveCount(7);
  await expect(page.locator('[data-throwzone]')).toHaveCount(1);
  await expect(page.locator('.saaristo-modules .is-coming')).toHaveCount(1);
});

test('live pond draws pixels and a thrown stone skips', async ({page}) => {
  test.setTimeout(90_000); // Software WebGL can take longer to render and settle UI actions.
  await page.goto('/');
  test.skip(await mode(page) === 'fallback', 'WebGL2 unavailable: live rendering skipped; fallback has its own test');
  await expect(page.locator('html')).toHaveAttribute('data-saaristo-water', 'simulated');
  const lit = await page.locator('canvas.saaristo-canvas').evaluate((c: HTMLCanvasElement) => new Promise<number>(resolve => (window as any).__saaristo.afterNextFrame(() => {
    const probe = document.createElement('canvas'); probe.width = 64; probe.height = 40;
    const g = probe.getContext('2d')!; g.drawImage(c, 0, 0, 64, 40);
    const d = g.getImageData(0, 0, 64, 40).data; let n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] > 60) n++;
    resolve(n);
  })));
  expect(lit).toBeGreaterThan(500);
  await page.locator('[data-throw]').click();
  // Step the real stone physics independently of the software renderer's frame rate.
  await page.evaluate(() => (window as any).__saaristo.advanceStones(10));
  await expect(page.locator('[data-skip-count]')).toHaveText(/^[1-9]\d*$/);
  await expect(page.locator('[data-saaristo-live]')).toContainText('Kivi pomppasi', {timeout: 15_000});
  expect(Number(await page.locator('[data-skip-best]').textContent())).toBeGreaterThanOrEqual(1);
  // A swipe up from the throw zone at the left edge throws too, once the visitor has scrolled past the hero.
  await page.locator('#kivi').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const zone = await page.locator('[data-throwzone]').boundingBox();
  const throws = await page.evaluate(() => (window as any).__saaristo.throws);
  await page.mouse.move(zone!.x + zone!.width / 2, zone!.y + zone!.height / 2);
  await page.mouse.down();
  await page.mouse.move(zone!.x + 60, zone!.y - 320, {steps: 4});
  await page.mouse.up();
  await expect.poll(() => page.evaluate(() => (window as any).__saaristo.throws)).toBeGreaterThan(throws);
  await page.locator('[data-hulluttelu="ruoho"]').uncheck();
  await page.locator('[data-saaristo-pause]').click();
  await expect(page.locator('[data-saaristo-pause]')).toHaveAttribute('aria-pressed', 'true');
});

test('WebGPU swarm stays a loose cloud and a fast sweep scatters it', async ({page}) => {
  await page.goto('/');
  test.skip(await mode(page) === 'fallback', 'WebGL2 unavailable: the swarm lives in the live pond');
  await expect(page.locator('html')).toHaveAttribute('data-saaristo-parvi', /^(\d+|off)$/, {timeout: 15_000});
  test.skip(await page.locator('html').getAttribute('data-saaristo-parvi') === 'off', 'WebGPU unavailable in this browser');
  type Shape = {share: number; ratio3d: number; spread3d: number[]};
  const shape = () => page.evaluate(() => (window as any).__saaristo.swarmShape()) as Promise<Shape>;
  await page.mouse.move(1430, 30);
  await page.waitForTimeout(4000);
  const idle = await shape();
  // Not piled into a streak: few fireflies in the densest cells, and real thickness in 3D.
  expect(idle.share).toBeLessThan(0.35);
  expect(idle.ratio3d).toBeGreaterThan(0.2);
  await page.mouse.move(720, 560, {steps: 8});
  await page.waitForTimeout(3000);
  const before = await shape(), gusts = await page.evaluate(() => (window as any).__saaristo.gusts);
  await page.mouse.move(300, 600, {steps: 3});
  await page.mouse.move(1150, 520, {steps: 4});
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => (window as any).__saaristo.gusts)).toBeGreaterThan(gusts);
  expect(Math.max(...(await shape()).spread3d)).toBeGreaterThan(Math.max(...before.spread3d) * 1.2);
});

test('soundscape is on by default, waits for a gesture, and the choice is remembered', async ({page}) => {
  test.setTimeout(90_000); // Rendering and audio decode share constrained CI resources.
  const audio: string[] = [];
  page.on('request', r => { if (r.url().includes('/assets/saaristo/audio/')) audio.push(r.url()); });
  await page.goto('/');
  test.skip(await mode(page) === 'fallback', 'WebGL2 unavailable: sound wiring lives in the live pond');
  const button = page.locator('[data-saaristo-sound]');
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(button).toHaveAttribute('data-waiting', '');
  await expect(button).toHaveAccessibleName(/Äänimaisema/);
  await page.waitForTimeout(500);
  expect(audio).toEqual([]); // nothing is fetched before the visitor does something
  type Stats = {unlocked: boolean; loaded: number; failed: number; played: number; ambient: boolean};
  const stats = () => page.evaluate(() => ({...(window as any).__saaristo.sound})) as Promise<Stats>;
  await page.keyboard.press('Shift');
  await expect.poll(async () => (await stats()).loaded, {timeout: 15_000}).toBeGreaterThanOrEqual(22); // effects + the two soundscape loops
  expect((await stats()).failed).toBe(0);
  expect((await stats()).ambient).toBe(true);
  await expect(button).not.toHaveAttribute('data-waiting', '');
  expect(audio.every(u => /\.[0-9a-f]{10}\.mp3$/.test(u))).toBe(true);
  // A thrown stone is heard: the throw whoosh and the skips.
  const played = (await stats()).played;
  await page.locator('[data-throw]').click();
  await expect.poll(async () => (await stats()).played, {timeout: 12_000}).toBeGreaterThan(played);
  // Turning it off is remembered over a reload, and so is turning it back on.
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  expect((await stats()).ambient).toBe(false);
  await page.reload();
  await mode(page);
  await expect(page.locator('[data-saaristo-sound]')).toHaveAttribute('aria-pressed', 'false');
  await page.locator('[data-saaristo-sound]').click();
  await expect(page.locator('[data-saaristo-sound]')).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await mode(page);
  await expect(page.locator('[data-saaristo-sound]')).toHaveAttribute('aria-pressed', 'true');
});

test('reduced motion keeps the pond still and the heading as text', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/');
  const m = await mode(page);
  expect(['static', 'fallback']).toContain(m);
  await expect(page.locator('html')).not.toHaveAttribute('data-saaristo-text', 'particles');
  expect(await page.locator('h1').evaluate(h => getComputedStyle(h).color)).not.toBe('rgba(0, 0, 0, 0)');
});

test('without WebGL the painted island and links remain', async ({page}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      return /webgl/.test(type) ? null : (original as any).call(this, type, ...rest);
    } as typeof original;
  });
  await page.goto('/');
  expect(await mode(page)).toBe('fallback');
  await expect(page.locator('.saaristo-fallback')).toBeVisible();
  await expect(page.locator('[data-throw]')).toBeDisabled();
  await expect(page.locator('[data-saaristo-live]')).toContainText('WebGL2');
  await expect(page.locator('main a[href="/lite/"]').first()).toBeVisible();
});

test('phone width has no horizontal overflow', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/');
  await mode(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('the old /saaristo/ address forwards to the landing page', async ({page}) => {
  await page.goto('/saaristo/');
  await expect(page).toHaveURL(/\/$/);
  await mode(page);
});
