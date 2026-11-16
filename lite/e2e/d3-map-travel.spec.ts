import { expect, test, type Page } from '@playwright/test';
import { answerBook, book, openBook, pauseBook, reachQuestion } from './book-contract';
import { LAUNCH_REV } from '../src/content/audit-rev';

async function prepare(page: Page, width = 390, reducedMotion: 'reduce' | 'no-preference' = 'no-preference') {
  await page.setViewportSize({ width, height: width === 320 ? 640 : width === 768 ? 1024 : width === 1366 ? 768 : 844 });
  await page.emulateMedia({ reducedMotion });
  await page.addInitScript(() => {
    localStorage.setItem('sammakko-lite-2', JSON.stringify({ v: 2, world: 'ranta', quietUntil: Date.now() + 3600000, attempts: [], events: [] }));
  });
  await page.goto('./'); await expect(page.locator('.wmap')).toBeVisible();
}
async function returnFromStop(page: Page, id = 'M-NUM-02') {
  await page.evaluate(id => { location.hash = `#kc/${id}`; }, id);
  await page.getByRole('button', { name: 'Kartalle', exact: true }).first().click();
  await expect(page.locator('.wmap')).toBeVisible();
}

for (const direction of ['up', 'down'] as const) test(`slow-frame ${direction} ferry keeps the rendered traveller and arrival target visible`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(({ direction, rev }) => {
    // A synthetic, isolated overdue recall selects a lower destination for the reverse route.
    const attempts = direction === 'down' ? [0, 1].map(i => ({ node: 'M-ADD-100', phase: 'quick', ok: true, tag: 'camera-fixture', at: Date.now() - 172800000 + i, syn: true, rev })) : [];
    localStorage.setItem('sammakko-lite-2', JSON.stringify({ v: 2, world: 'ranta', tester: direction === 'down', quietUntil: Date.now() + 3600000, attempts, events: [] }));
  }, { direction, rev: LAUNCH_REV });
  await page.goto('./'); await expect(page.locator('.wmap')).toBeVisible();
  await expect(page.locator('.wmap')).toHaveAttribute('data-travel-to', direction === 'down' ? 'M-ADD-100' : 'M-NUM-STABLE-ORDER');
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-lite-2')!).attempts);
  await returnFromStop(page, direction === 'up' ? 'M-ADD-100' : 'M-NUM-02');
  await expect(page.locator('.wmap')).toHaveAttribute('data-travel', 'moving');
  const route = await page.locator('.wmap').evaluate(map => ({ from: (map as HTMLElement).dataset.travelFrom, to: (map as HTMLElement).dataset.travelTo, nodes: (map as HTMLElement).dataset.travelNodes, points: map.querySelector('[data-travel-route]')!.getAttribute('points')! }));
  await testInfo.attach('actual-ferry-route', { body: JSON.stringify(route), contentType: 'application/json' });
  expect(route.from).toBe(direction === 'up' ? 'M-ADD-100' : 'M-NUM-02');
  expect(route.to).toBe(direction === 'up' ? 'M-NUM-STABLE-ORDER' : 'M-ADD-100');
  const points = route.points.split(' ').map(pair => pair.split(',').map(Number));
  expect(Math.max(...points.map(p => p[1]!)) - Math.min(...points.map(p => p[1]!))).toBeGreaterThan(1500);
  const camera = await page.evaluate(() => new Promise<{ top: number; bottom: number; hostTop: number; hostBottom: number; scroll: number }[]>(resolve => {
    const rows: { top: number; bottom: number; hostTop: number; hostBottom: number; scroll: number }[] = [];
    const tick = () => {
      const map = document.querySelector<HTMLElement>('.wmap')!, host = map.closest('.lite-map-scroll')!;
      const avatar = map.querySelector('.avatar')!.getBoundingClientRect(), box = host.getBoundingClientRect();
      rows.push({ top: avatar.top, bottom: avatar.bottom, hostTop: box.top, hostBottom: box.bottom, scroll: host.scrollTop });
      if (map.dataset.travel === 'moving') requestAnimationFrame(tick); else resolve(rows);
    }; requestAnimationFrame(tick);
  }));
  await testInfo.attach('rendered-camera-samples', { body: JSON.stringify(camera), contentType: 'application/json' });
  expect(camera.length).toBeGreaterThan(0);
  expect(camera.every(p => p.top >= p.hostTop && p.bottom <= p.hostBottom)).toBe(true);
  expect(direction === 'up' ? camera.at(-1)!.scroll < camera[0]!.scroll : camera.at(-1)!.scroll > camera[0]!.scroll).toBe(true);
  await expect(page.locator('.wmap')).toHaveAttribute('data-travel', 'arrived', { timeout: 7000 });
  const visible = await page.locator('.place.next').evaluate(place => { const r = place.getBoundingClientRect(), box = place.closest('.lite-map-scroll')!.getBoundingClientRect(); return r.top >= box.top && r.bottom <= box.bottom && document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.closest('.place') === place; });
  expect(visible).toBe(true);
  await page.locator('.place.next').click();
  if (await page.locator('.sheet-back').count()) await page.locator('.sheet-back .primary').first().click();
  await expect(page.locator('.wmap')).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-lite-2')!).attempts)).toEqual(before);
});

test('timely wheel and keyboard cancel travel without later scrolling or focus theft', async ({ page }, testInfo) => {
  await prepare(page);
  await page.evaluate(() => {
    const inputs: unknown[] = []; Reflect.set(window, '__cameraInputs', inputs);
    for (const type of ['wheel', 'keydown']) document.addEventListener(type, event => inputs.push({ type, trusted: event.isTrusted, travel: document.querySelector<HTMLElement>('.wmap')?.dataset.travel }), { capture: true, passive: true });
  });
  await page.mouse.move(210, 400);
  await returnFromStop(page); await page.mouse.wheel(0, 240);
  await expect(page.locator('.wmap')).toHaveAttribute('data-travel', 'cancelled');
  await page.waitForTimeout(200);
  const scroll = await page.locator('.lite-map-scroll').evaluate(el => el.scrollTop);
  await page.waitForTimeout(1000);
  expect(await page.locator('.lite-map-scroll').evaluate(el => el.scrollTop)).toBe(scroll);
  await returnFromStop(page); await page.keyboard.press('Tab');
  await expect(page.locator('.wmap')).toHaveAttribute('data-travel', 'cancelled');
  const focus = await page.locator(':focus').getAttribute('class');
  await page.waitForTimeout(1000);
  expect(await page.locator(':focus').getAttribute('class')).toBe(focus);
  const inputs = await page.evaluate(() => Reflect.get(window, '__cameraInputs'));
  await testInfo.attach('trusted-cancellation-inputs', { body: JSON.stringify(inputs), contentType: 'application/json' });
  expect(inputs).toContainEqual({ type: 'wheel', trusted: true, travel: 'moving' });
  expect(inputs).toContainEqual({ type: 'keydown', trusted: true, travel: 'moving' });
});

for (const width of [320, 390, 768, 1366]) test(`${width}: connected path, measured intermediate positions, arrival and open`, async ({ page }) => {
  await prepare(page, width);
  await expect(page.locator('.wmap')).toHaveAttribute('data-travel-reason', /first-entry|same-stop/);
  await returnFromStop(page);
  await expect(page.locator('.wmap')).toHaveAttribute('data-travel', 'moving');
  const samples = await page.evaluate(() => new Promise<{ x: number; y: number; width: number; ms: number }[]>(resolve => {
    const output: { x: number; y: number; width: number; ms: number }[] = [], start = performance.now();
    const tick = (now: number) => {
      const map = document.querySelector<HTMLElement>('.wmap')!, avatar = map.querySelector<HTMLElement>('.avatar')!;
      output.push({ x: Number(avatar.dataset.mapX), y: Number(avatar.dataset.mapY), width: map.getBoundingClientRect().width, ms: now - start });
      if (map.dataset.travel === 'moving') requestAnimationFrame(tick); else resolve(output);
    }; requestAnimationFrame(tick);
  }));
  expect(new Set(samples.map(p => `${p.x},${p.y}`)).size).toBeGreaterThan(10);
  expect(Math.max(...samples.map(p => p.width)) - Math.min(...samples.map(p => p.width))).toBeLessThan(.1);
  const nodes = JSON.parse(await page.locator('.wmap').getAttribute('data-travel-nodes') ?? '[]');
  expect(nodes.length).toBeGreaterThan(2);
  const points = (await page.locator('[data-travel-route]').getAttribute('points'))!.split(' ').map(pair => pair.split(',').map(Number));
  const nearest = (p: { x: number; y: number }) => Math.min(...points.slice(1).map((b, i) => {
    const a = points[i]!, dx = b[0]! - a[0]!, dy = b[1]! - a[1]!;
    const t = Math.max(0, Math.min(1, ((p.x - a[0]!) * dx + (p.y - a[1]!) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(p.x - a[0]! - t * dx, p.y - a[1]! - t * dy);
  }));
  expect(Math.max(...samples.map(nearest))).toBeLessThan(.2);
  await expect(page.locator('.wmap')).toHaveAttribute('data-travel', 'arrived');
  // The visual portrait is clear of the next button, and cannot intercept it.
  const hit = await page.locator('.place.next').evaluate(place => { const r = place.getBoundingClientRect(); return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.closest('.place') === place; });
  expect(hit).toBe(true);
  if (width > 960) await page.locator('.place.next').click();
  else await page.locator('.place.next').click();
  if (await page.locator('.sheet-back').count()) await page.locator('.sheet-back .primary').first().click();
  await expect(page.locator('.wmap')).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-lite-2')!).attempts)).toEqual([]);
});

test('user wheel and keyboard finish cosmetics without later scrolling or focus theft', async ({ page }) => {
  await prepare(page); await returnFromStop(page);
  await page.locator('.lite-map-scroll').hover(); await page.mouse.wheel(0, 240);
  await expect(page.locator('.wmap')).toHaveAttribute('data-travel', 'cancelled');
  await page.waitForTimeout(200);
  const scroll = await page.locator('.lite-map-scroll').evaluate(el => el.scrollTop);
  await page.waitForTimeout(1000);
  expect(await page.locator('.lite-map-scroll').evaluate(el => el.scrollTop)).toBe(scroll);
  await returnFromStop(page); await page.keyboard.press('Tab');
  await expect(page.locator('.wmap')).toHaveAttribute('data-travel', 'cancelled');
  const focus = await page.locator(':focus').getAttribute('class');
  await page.waitForTimeout(1000);
  expect(await page.locator(':focus').getAttribute('class')).toBe(focus);
});

test('a long connected ferry trip keeps its arrival on screen', async ({ page }) => {
  await prepare(page); await returnFromStop(page, 'M-ADD-100');
  await expect(page.locator('.wmap')).toHaveAttribute('data-travel', 'moving');
  const points = (await page.locator('[data-travel-route]').getAttribute('points'))!.split(' ').map(pair => pair.split(',').map(Number));
  expect(Math.max(...points.map(p => p[1]!)) - Math.min(...points.map(p => p[1]!))).toBeGreaterThan(1500);
  const camera = await page.evaluate(() => new Promise<{ y: number; top: number; bottom: number; scroll: number }[]>(resolve => {
    const rows: { y: number; top: number; bottom: number; scroll: number }[] = [];
    const tick = () => {
      const map = document.querySelector<HTMLElement>('.wmap')!, avatar = map.querySelector<HTMLElement>('.avatar')!, host = map.closest('.lite-map-scroll')!;
      const m = map.getBoundingClientRect(), box = host.getBoundingClientRect();
      rows.push({ y: m.top + parseFloat(avatar.style.top) / 100 * m.height, top: box.top, bottom: box.bottom, scroll: host.scrollTop });
      if (map.dataset.travel === 'moving') requestAnimationFrame(tick); else resolve(rows);
    }; requestAnimationFrame(tick);
  }));
  expect(camera.length).toBeGreaterThan(20);
  expect(camera.every(p => p.y > p.top && p.y < p.bottom)).toBe(true);
  expect(new Set(camera.map(p => p.scroll)).size).toBeGreaterThan(20);
  await expect(page.locator('.wmap')).toHaveAttribute('data-travel', 'arrived', { timeout: 7000 });
  const visible = await page.locator('.place.next').evaluate(place => { const r = place.getBoundingClientRect(), box = place.closest('.lite-map-scroll')!.getBoundingClientRect(); return r.top >= box.top && r.bottom <= box.bottom && document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.closest('.place') === place; });
  expect(visible).toBe(true);
});

test('direct open during motion and route disposal produce one destination and no later work', async ({ page }) => {
  await prepare(page); await returnFromStop(page);
  const old = await page.locator('.wmap').elementHandle();
  await page.getByRole('button', { name: 'Pelaa', exact: true }).click();
  await expect(page.locator('.wmap')).toHaveCount(0);
  expect(await old!.getAttribute('data-travel')).toBe('disposed');
  const hash = new URL(page.url()).hash;
  await page.waitForTimeout(2400); expect(new URL(page.url()).hash).toBe(hash);
  await page.getByRole('button', { name: 'Kartalle', exact: true }).first().click();
  await returnFromStop(page);
  const detached = await page.locator('.wmap').elementHandle();
  await page.evaluate(() => { location.hash = '#alueet'; });
  await expect(page.locator('.wmap')).toHaveCount(0);
  expect(await detached!.getAttribute('data-travel')).toBe('disposed');
});

test('keyboard activation during travel opens the chosen task once', async ({ page }) => {
  await prepare(page); await returnFromStop(page);
  await page.locator('.place.next').evaluate(place => (place as HTMLElement).focus({ preventScroll: true }));
  const old = await page.locator('.wmap').elementHandle();
  await page.keyboard.press('Enter');
  await expect(page.locator('.wmap')).toHaveCount(0);
  expect(await old!.getAttribute('data-travel')).toBe('disposed');
  expect(new URL(page.url()).hash).toBe('#kc/M-NUM-STABLE-ORDER');
  await page.waitForTimeout(2300);
  expect(new URL(page.url()).hash).toBe('#kc/M-NUM-STABLE-ORDER');
});

for (const manualScroll of [false, true]) test(`late voice availability rebuild disposes motion and preserves viewport (manual scroll ${manualScroll})`, async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(speechSynthesis, 'getVoices', { configurable: true, value: () => [] }); });
  await prepare(page); await returnFromStop(page);
  await expect(page.locator('.wmap')).toHaveAttribute('data-travel', 'moving');
  if (manualScroll) {
    await page.locator('.lite-map-scroll').hover(); await page.mouse.wheel(0, 240);
    await expect(page.locator('.wmap')).toHaveAttribute('data-travel', 'cancelled');
    await page.waitForTimeout(200);
  }
  const old = await page.locator('.wmap').elementHandle();
  const scroll = await page.locator('.lite-map-scroll').evaluate(el => el.scrollTop);
  await page.evaluate(() => {
    Object.defineProperty(speechSynthesis, 'getVoices', { configurable: true, value: () => [{ lang: 'fi-FI', name: 'D3 synthetic Finnish', localService: true }] });
    speechSynthesis.dispatchEvent(new Event('voiceschanged'));
  });
  await expect(page.locator('.wmap')).toHaveAttribute('data-travel-viewport', 'restore');
  expect(await old!.getAttribute('data-travel')).toBe('disposed');
  await expect(page.locator('.wmap')).toHaveAttribute('data-travel', 'arrived');
  expect(Math.abs(await page.locator('.lite-map-scroll').evaluate(el => el.scrollTop) - scroll)).toBeLessThan(2);
  await page.waitForTimeout(1200);
  expect(Math.abs(await page.locator('.lite-map-scroll').evaluate(el => el.scrollTop) - scroll)).toBeLessThan(2);
});

test('reduced motion is immediate and a cross-world entry never invents a route', async ({ page }) => {
  await prepare(page, 390, 'reduce'); await returnFromStop(page);
  await expect(page.locator('.wmap')).toHaveAttribute('data-travel', 'arrived');
  await expect(page.locator('.wmap')).toHaveAttribute('data-travel-reason', 'reduced-motion');
  await page.getByRole('link', { name: 'Alueet', exact: true }).click();
  await page.locator('button.world').filter({ hasText: 'Aarresaaristo' }).click();
  await expect(page.locator('.wmap')).toHaveAttribute('data-travel-reason', 'cross-world');
  await expect(page.locator('[data-travel-route]')).toHaveCount(0);
});

test('fallback Saaristo picture follows D2 departure cancellation and reduced motion', async ({ page }) => {
  await prepare(page);
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) { return /^webgl/.test(type) ? null : Reflect.apply(get, this, [type, ...args]); } as typeof get;
  });
  await openBook(page, 'M-TH-01'); await pauseBook(page); await reachQuestion(page); await answerBook(page);
  await page.getByRole('button', { name: 'Eteenpäin', exact: true }).click();
  await expect(page.locator('.book-travel-picture')).toBeVisible();
  await expect.poll(() => page.locator('.book-travel-picture img').evaluateAll(images => images.length === 2 && images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)), { timeout: 500 }).toBe(true);
  await expect(page.locator('.expedition')).toHaveAttribute('data-travel', 'picture');
  await page.getByRole('button', { name: 'Retkikartta', exact: true }).click();
  await expect(page.locator('.book-travel-picture')).toHaveCount(0);
  expect((await book(page)).page).toBe('M-TH-01');
  expect((await page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3')!))).storyStops).not.toContain('M-TH-01');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openBook(page, 'M-TH-01', 4); await pauseBook(page); await reachQuestion(page); await answerBook(page);
  await page.getByRole('button', { name: 'Eteenpäin', exact: true }).click();
  await expect.poll(async () => (await book(page)).page).not.toBe('M-TH-01');
  await expect(page.locator('.book-travel-picture')).toHaveCount(0);
});
