import { expect, test, type Page } from '@playwright/test';

const KEY = 'sammakko-lite-2';
const screenshots = new Set(['M-NUM-1TO1', 'M-DATA-04', 'M79-FUNC-GRAPH', 'PHY79-SPEED-CONCEPT']);

// These are render/route checks. They do not answer tasks or claim human playtesting.
for (const viewport of [{ width: 1280, height: 720 }, { width: 390, height: 844 }]) {
  test(`all181 production intro, demo, guided and independent at ${viewport.width}`, async ({ page }, info) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => { Math.random = () => 7 / 2 ** 31; });
    const errors: string[] = [];
    const failedResources: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.status() >= 400) failedResources.push(`${r.status()} ${r.url()}`); });
    await page.goto('./');
    await page.evaluate(() => localStorage.clear());
    const runtime = await (await page.request.get('./lite-runtime.json')).json();
    const ids: string[] = runtime.runtimeAvailability.ids;
    expect(new Set(ids).size).toBe(181);
    const rows: Record<string, unknown>[] = [];
    async function inspect(kc: string, phase: string, attemptPage: Page = page) {
      await expect(attemptPage.locator('.say > p')).not.toBeEmpty();
      const state = await attemptPage.evaluate(key => ({
        title: document.querySelector('.title')?.textContent,
        prompt: document.querySelector('.say > p')?.textContent,
        horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
        brokenImages: [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.src),
        attempts: JSON.parse(localStorage.getItem(key) ?? '{}').attempts?.length ?? 0,
        developmentOracle: '__qa' in window,
        controls: document.querySelectorAll('#app > .stack > .stack button, #app > .stack > .stack input, #app > .stack > .stack [tabindex="0"]').length,
      }), KEY);
      rows.push({ kc, phase, viewport, ...state });
      expect.soft(state.horizontalOverflow, `${kc}/${phase}: horizontal overflow`).toBeLessThanOrEqual(1);
      expect.soft(state.brokenImages, `${kc}/${phase}: images`).toEqual([]);
      expect.soft(state.attempts, `${kc}/${phase}: no answer means no attempt`).toBe(0);
      expect.soft(state.developmentOracle, `${kc}/${phase}: production has no oracle`).toBe(false);
      if (phase === 'guided' || phase === 'independent') expect.soft(state.controls, `${kc}/${phase}: answer control`).toBeGreaterThan(0);
      const capture = process.env.CI === 'true' ? kc === process.env.SAMMAKKO_CAPTURE_TOPIC : screenshots.has(kc);
      if (capture && ['demo-0', 'guided', 'independent'].includes(phase)) {
        await attemptPage.screenshot({ path: info.outputPath(`${kc}-${phase}.png`), fullPage: true });
      }
    }
    try {
      for (const kc of ids) {
        await test.step(kc, async () => {
          await page.goto(`./#kc/${kc}`);
          const showDemo = page.getByRole('button', { name: /^Näytä ensin(?: esimerkki)?$/ });
          await showDemo.waitFor({ timeout: 10_000 });
          await inspect(kc, 'intro');
          await showDemo.click();
          let demoStep = 0;
          while (true) {
            await inspect(kc, `demo-${demoStep}`);
            if (await page.getByRole('button', { name: 'Kokeile itse', exact: true }).count()) break;
            expect(++demoStep, `${kc}: bounded demo`).toBeLessThan(30);
            await page.getByRole('button', { name: 'Seuraava', exact: true }).click();
          }
          await page.getByRole('button', { name: 'Kokeile itse', exact: true }).click();
          await expect(page.locator('.confusing')).toBeVisible();
          await inspect(kc, 'guided');
          await page.reload();
          // Foundation KC links intentionally enter the quick-check start screen.
          await page.getByRole('button', { name: /^(Osaan jo|Aloita)$/ }).click();
          await expect(page.locator('.confusing')).toBeVisible();
          await inspect(kc, 'independent');
          await page.getByRole('button', { name: 'Kartalle', exact: true }).click();
          await expect(page.locator('.confusing')).toHaveCount(0);
        });
      }
      expect(errors).toEqual([]);
      expect(failedResources).toEqual([]);
    } finally {
      await info.attach('scope-observations', { body: JSON.stringify({ viewport, rows, errors, failedResources, humanValidation: 'pending' }, null, 2), contentType: 'application/json' });
    }
  });
}
