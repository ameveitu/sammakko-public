// Visual polish VP04: painted surroundings for Lite's map, world choice and workshop hub.
// VP05: a living WebGL2 painting behind the map and, dimmed, behind lessons, only with a
// hardware context (tests opt in to SwiftShader with ?vpgl=any). The layer must stay outside
// the app: no change to #app DOM, layout, input, storage or lesson outcomes. Without the
// painting, motion belongs only to wide idle map/world views and tasks stay bare.
import {expect, test, type Browser, type Page} from '@playwright/test';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';

// The VP04 contracts describe the plates on a browser without WebGL2. A browser
// with working hardware can use VP05 by default, even when running headless.
function refuseWebGL2() {
  const get = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
    return type === 'webgl2' ? null : (get as (...a: unknown[]) => unknown).call(this, type, ...rest);
  } as typeof get;
}
const seed = `(() => { let s = 0x5a5a1234; Math.random = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();`;
const fallback = test.extend({
  page: async ({page}, use) => {
    await page.addInitScript(refuseWebGL2);
    await page.setViewportSize({width: 1440, height: 960});
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await use(page);
    expect(errors).toEqual([]);
  },
});

const surface = (page: Page) => page.locator('html').getAttribute('data-vp-surface');
async function openMap(page: Page, q = '') {
  await page.goto(`/lite/${q}#alueet`);
  await page.locator('.worlds button.world').first().click();
  await page.locator('.wmap').waitFor();
}

fallback('decorates map, world choice and workshop hub only', async ({page}) => {
  await page.goto('/lite/#alueet');
  await page.locator('.worlds').waitFor();
  await expect.poll(() => surface(page)).toBe('worlds');
  const decor = page.locator('#vp-decor');
  await expect(decor).toBeVisible();
  await expect(decor).toHaveAttribute('aria-hidden', 'true');
  expect(await decor.evaluate(e => [getComputedStyle(e).pointerEvents, getComputedStyle(e).position, getComputedStyle(e).zIndex])).toEqual(['none', 'fixed', '-1']);
  expect(await page.locator('#app #vp-decor').count()).toBe(0);
  await page.locator('.worlds button.world').first().click();
  await page.locator('.wmap').waitFor();
  await expect.poll(() => surface(page)).toBe('map');
  await page.goto('/lite/#paja');
  await page.locator('.paja').waitFor();
  await expect.poll(() => surface(page)).toBe('paja');
  // #paja/lento is in the list too: while flight is locked the app sends it on to a workshop
  // station (a decorated hub), so it is only expected to be bare while the hash stays there.
  for (const hash of ['#kc/M-NUM-QTY-NUMERAL', '#aikuiselle', '#paja/lento', '#tuntematon-reitti', '#paja/tuntematon-reitti']) {
    await page.goto(`/lite/${hash}`);
    await page.waitForTimeout(300);
    if (hash === '#paja/lento' && !(await page.evaluate(() => location.hash)).startsWith('#paja/lento')) continue;
    await expect.poll(() => surface(page), hash).toBeNull();
    await expect(decor, hash).toBeHidden();
  }
});

fallback('?vp=off loads nothing and leaves the original page', async ({page}) => {
  await openMap(page, '?vp=off');
  await expect(page.locator('html')).toHaveAttribute('data-vp-lite', 'off');
  expect(await page.locator('#vp-decor, link[data-vp-lite]').count()).toBe(0);
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
});

// Use the product's existing reduced-motion path in both contexts. A raw DOM comparison
// must not compare different idle/blink frames from two independent mascot timers.
// Dedicated motion tests below continue to exercise the default animated decoration.
// Each run gets a fresh context: the first world choice is saved and would change the second.
async function snap(browser: Browser, q: string, lesson = false) {
  const context = await browser.newContext({baseURL: test.info().project.use.baseURL, viewport: {width: 1440, height: 960}, reducedMotion: 'reduce'});
  try {
    if (!q.includes('vpgl=any')) await context.addInitScript(refuseWebGL2);
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    if (lesson) {
      await page.goto(`/lite/${q}#kc/M-NUM-QTY-NUMERAL`);
      await page.getByRole('button', {name: 'Osaan jo'}).waitFor();
    } else {
      await openMap(page, q);
    }
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map(image => image.decode()));
    });
    if (!lesson) {
      const mascots = page.locator('#app .sprite-img');
      await expect(mascots).not.toHaveCount(0);
      await expect.poll(() => mascots.evaluateAll(images => images.map(image => image.getAttribute('href') ?? image.getAttribute('src') ?? '').filter(src => /\/(blink|swim_blink)\.png$/.test(src)))).toEqual([]);
    }
    if (q !== '?vp=off' && !lesson) await expect.poll(() => surface(page)).toBe('map');
    // The default map is Rantaretki; a lesson opened by direct link keeps the default painting world.
    if (q.includes('vpgl=any')) await expect(page.locator('html')).toHaveAttribute('data-vp-world', lesson ? 'saari' : 'ranta');
    const result = await page.evaluate(() => {
      const app = document.getElementById('app')!;
      const rects = [...app.querySelectorAll('*')].slice(0, 400).map(el => { const r = el.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round).join(','); });
      const hits = [...app.querySelectorAll('button, a')].filter(el => { const r = el.getBoundingClientRect(); if (!r.width || r.bottom > innerHeight || r.top < 0) return false; const t = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return !!t && (t === el || el.contains(t)); }).length;
      // Voice readiness can redraw the map once in one context. Verify the
      // live paint references, then compare the SVG without that allocation counter.
      const counter = /launch-art-(ranta|saari|lab)-\d+-(water|sand|grass)/g;
      const raw = app.innerHTML;
      for (const id of new Set(raw.match(counter) ?? [])) {
        if (!app.contains(document.getElementById(id))) throw new Error('Broken map pattern: ' + id);
      }
      const html = raw.replace(counter, 'launch-art-$1-map-$2').replace(/\s+/g, ' ');
      return {html, rects, hits, scrollW: document.documentElement.scrollWidth};
    });
    expect(errors).toEqual([]);
    return result;
  } finally { await context.close(); }
}

fallback('app DOM, layout and hit targets are identical with decor on and off', async ({browser}) => {
  const off = await snap(browser, '?vp=off');
  const on = await snap(browser, '');
  expect(on).toEqual(off);
});

// Same fixed driver in every run: wait until the task view has been stable for 400 ms, then
// pick the first enabled unselected option, else Valmis, else Jatka, else the support screen's
// "Yritä uudelleen avun kanssa" (shown after repeated misses). Only states where the
// driver acts are recorded, so pauses while the app auto-advances do not depend on timing.
// Capture the current text and chosen action together before clicking: auto-advance must
// not pair the previous task's text with the next task's action between browser calls.
// The decoration's own surface marker is returned apart from the app trail.
async function seededLesson(browser: Browser, q: string) {
  const context = await browser.newContext({baseURL: test.info().project.use.baseURL, viewport: {width: 1440, height: 960}});
  await context.addInitScript(seed);
  if (!q.includes('vpgl=any')) await context.addInitScript(refuseWebGL2);
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.clock.setFixedTime(new Date('2026-11-02T09:00:00Z'));
  const trail: string[] = [];
  await page.goto(`/lite/${q}#kc/M-NUM-QTY-NUMERAL`);
  await page.getByRole('button', {name: 'Osaan jo'}).click();
  const settle = async () => {
    let last = '', same = 0;
    while (same < 4) { await page.waitForTimeout(100); const now = await page.locator('#app').innerText(); same = now === last ? same + 1 : 0; last = now; }
    return last;
  };
  let answered = 0;
  for (let i = 0; i < 40 && answered < 6; i++) {
    await settle();
    const acted = await page.evaluate(() => {
      const buttons = [...document.querySelectorAll<HTMLButtonElement>('#app button')].filter(b => !b.disabled && b.getClientRects().length > 0);
      const pick = buttons.find(b => b.classList.contains('opt') && !b.classList.contains('sel'))
        ?? buttons.find(b => b.textContent!.trim() === 'Valmis') ?? buttons.find(b => b.textContent!.trim() === 'Jatka')
        ?? buttons.find(b => b.textContent!.trim() === 'Yritä uudelleen avun kanssa');
      if (!pick) return null;
      const text = document.getElementById('app')!.innerText;
      const action = `${pick.className}:${pick.textContent!.trim().slice(0, 20)}`;
      pick.click();
      return {text, action};
    });
    if (!acted) continue;
    trail.push(acted.text, acted.action);
    if (acted.action.startsWith('opt')) answered++;
  }
  await settle();
  trail.push(String(await page.evaluate(() => localStorage.getItem('sammakko-lite-2'))));
  const vp = await page.locator('html').getAttribute('data-vp-surface');
  const moments = await page.evaluate(() => document.getElementById('vp-decor')?.getAttribute('data-world-count') ?? null);
  await context.close();
  expect(errors).toEqual([]);
  return {trail, surface: vp, moments};
}

fallback('seeded lesson steps and saved progress are identical with decor on and off', async ({browser}) => {
  test.setTimeout(120_000);
  const on = await seededLesson(browser, '');
  expect(on.trail.filter(step => step.startsWith('opt')).length, 'the driver must actually answer tasks').toBe(6);
  const off = await seededLesson(browser, '?vp=off');
  expect(on.trail).toEqual(off.trail);
  expect([on.surface, off.surface], 'lessons stay bare without the living painting').toEqual([null, null]);
});

fallback('slow water glints run only on wide idle map and world views', async ({page}) => {
  await page.goto('/lite/#alueet');
  await page.locator('.worlds').waitFor();
  await expect(page.locator('html')).toHaveAttribute('data-vp-motion', '');
  const glints = page.locator('#vp-decor .vp-glints-light');
  await expect(glints).toBeVisible();
  expect(await glints.evaluate(e => getComputedStyle(e).animationName)).toBe('vp-glint');
  const reeds = page.locator('#vp-decor .vp-reeds');
  await expect(reeds).toBeVisible();
  expect(await reeds.evaluate(e => getComputedStyle(e).animationName)).toBe('vp-reed-sway');
  // Wait for the CSS animation to leave its pending start state before measuring.
  // Headless WebKit can create the animation before it starts the document timeline.
  await page.bringToFront();
  const start = await glints.evaluate(async e => {
    const animation = e.getAnimations()[0];
    await animation.ready;
    return Number(animation.currentTime);
  });
  await expect.poll(() => glints.evaluate(e => Number(e.getAnimations()[0]?.currentTime)), {timeout: 10_000}).toBeGreaterThan(start + 50);
  await page.locator('.worlds button.world').first().click();
  await page.locator('.wmap').waitFor();
  await expect.poll(() => surface(page)).toBe('map');
  await expect(page.locator('html')).toHaveAttribute('data-vp-motion', '');
  await page.setViewportSize({width: 999, height: 960});
  await expect(page.locator('html')).not.toHaveAttribute('data-vp-motion', '');
  await expect(page.locator('#vp-decor')).toBeHidden();
  expect(await glints.evaluate(e => e.getAnimations().length)).toBe(0);
  expect(await reeds.evaluate(e => e.getAnimations().length)).toBe(0);
  await page.setViewportSize({width: 1440, height: 960});
  await expect(page.locator('html')).toHaveAttribute('data-vp-motion', '');
});

fallback('calm and reduced motion stop glints, and live settings resume them', async ({page}) => {
  await openMap(page);
  const root = page.locator('html');
  const glints = page.locator('#vp-decor .vp-glints-light');
  await expect(root).toHaveAttribute('data-vp-motion', '');
  await page.evaluate(() => document.documentElement.classList.add('calm-chars'));
  await expect(root).not.toHaveAttribute('data-vp-motion', '');
  expect(await glints.evaluate(e => e.getAnimations().length)).toBe(0);
  expect(await page.locator('#vp-decor .vp-reeds').evaluate(e => e.getAnimations().length)).toBe(0);
  await page.evaluate(() => document.documentElement.classList.remove('calm-chars'));
  await expect(root).toHaveAttribute('data-vp-motion', '');
  await page.emulateMedia({reducedMotion: 'reduce'});
  // Synchronize with the browser's media and CSS state before checking the decoration's
  // change listener: the emulation protocol reply alone does not await those updates.
  await expect.poll(() => page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
  await expect(page.locator('#vp-decor .vp-glints')).toHaveCSS('display', 'none');
  await expect(glints).toHaveCSS('animation-name', 'none');
  await expect(root).not.toHaveAttribute('data-vp-motion', '');
  expect(await glints.evaluate(e => e.getAnimations().length)).toBe(0);
  expect(await page.locator('#vp-decor .vp-reeds').evaluate(e => e.getAnimations().length)).toBe(0);
  await page.emulateMedia({reducedMotion: 'no-preference'});
  await expect.poll(() => page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(false);
  await expect(page.locator('#vp-decor .vp-glints')).toHaveCSS('display', 'block');
  await expect(glints).toHaveCSS('animation-name', 'vp-glint');
  await expect(root).toHaveAttribute('data-vp-motion', '');
});

fallback('static mode keeps the decoration visible without glint animation', async ({page}) => {
  await openMap(page, '?vp=static');
  const root = page.locator('html');
  const glints = page.locator('#vp-decor .vp-glints-light');
  await expect(root).toHaveAttribute('data-vp-lite', 'static');
  await expect(root).not.toHaveAttribute('data-vp-motion', '');
  await expect(page.locator('#vp-decor')).toBeVisible();
  expect(await glints.evaluate(e => e.getAnimations().length)).toBe(0);
  await expect(page.locator('#vp-decor .vp-reeds')).toBeVisible();
  expect(await page.locator('#vp-decor .vp-reeds').evaluate(e => e.getAnimations().length)).toBe(0);
});

fallback('visibility and BFCache lifecycle signals pause and restore one decorative layer', async ({page}) => {
  await openMap(page);
  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-vp-motion', '');
  // Explicit lifecycle-signal coverage; this does not claim the browser cached a real page.
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {configurable: true, get: () => true});
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(root).not.toHaveAttribute('data-vp-motion', '');
  await page.evaluate(() => {
    Reflect.deleteProperty(document, 'hidden');
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(root).toHaveAttribute('data-vp-motion', '');
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', {persisted: true})));
    await expect(root).not.toHaveAttribute('data-vp-motion', '');
    expect(await page.locator('#vp-decor .vp-glints-light').evaluate(e => e.getAnimations().length)).toBe(0);
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', {persisted: true})));
    await expect(root).toHaveAttribute('data-vp-motion', '');
  }
  expect(await page.locator('#vp-decor, link[data-vp-lite]').count()).toBe(2);
});

fallback('shore uses the shoreline plate and active measuring removes the decoration', async ({page}) => {
  await page.goto('/lite/#paja');
  await page.locator('.paja').waitFor();
  await expect.poll(() => surface(page)).toBe('paja');
  expect(await page.locator('#vp-decor .vp-left').evaluate(e => getComputedStyle(e).backgroundImage)).toContain('/workshop.webp');
  await page.goto('/lite/#paja/ranta');
  await page.locator('.paja').waitFor();
  await expect.poll(() => surface(page)).toBe('paja-shore');
  expect(await page.locator('#vp-decor .vp-left').evaluate(e => getComputedStyle(e).backgroundImage)).toContain('/shore-left.webp');
  await expect(page.locator('html')).not.toHaveAttribute('data-vp-motion', '');
  expect(await page.locator('#vp-decor .vp-glints-light').evaluate(e => e.getAnimations().length)).toBe(0);
  await page.getByRole('button', {name: 'Simpukka hiekassa', exact: true}).click();
  await expect(page.getByRole('button', {name: 'Simpukka hiekassa', exact: true})).toHaveCount(0);
  await page.getByRole('button', {name: 'Kisa Aavan kanssa', exact: true}).click();
  await page.getByRole('button', {name: /^\d+ m$/}).first().click();
  await expect(page.locator('.paja')).toHaveClass(/measuring/);
  await expect.poll(() => surface(page)).toBeNull();
  await expect(page.locator('#vp-decor')).toBeHidden();
  await expect(page.locator('html')).not.toHaveAttribute('data-vp-motion', '');
  await page.getByRole('button', {name: 'Lopeta kisa', exact: true}).click();
  await expect(page.locator('.paja')).not.toHaveClass(/measuring/);
  await expect.poll(() => surface(page)).toBe('paja-shore');
  await expect(page.locator('html')).not.toHaveAttribute('data-vp-motion', '');
});

async function cycleRoutes(page: Page, loops: number) {
  await page.evaluate(async (count) => {
    for (let i = 0; i < count; i++) {
      for (const hash of ['#alueet', '#paja', '#kc/M-NUM-QTY-NUMERAL', '#aikuiselle', '']) {
        location.hash = hash;
        await new Promise<void>(resolve => setTimeout(resolve, 30));
      }
    }
  }, loops);
}

fallback('repeated navigation keeps exactly one layer and one stylesheet', async ({page}) => {
  await openMap(page);
  await cycleRoutes(page, 12);
  expect(await page.locator('#vp-decor').count()).toBe(1);
  expect(await page.locator('link[data-vp-lite]').count()).toBe(1);
});

fallback('narrow screens open the playable map directly and remember the selected region', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/lite/');
  const next = page.locator('.wmap.ranta .place.next');
  await expect(next).toBeInViewport();
  await expect(page.locator('.worlds, .legend, .wmap .sign')).toHaveCount(0);
  await next.click();
  await expect(page).toHaveURL(/#kc\//);
  await page.getByRole('button', {name:'Kartalle', exact:true}).first().click();
  await expect(next).toBeInViewport();
  await page.getByRole('link', {name:'Alueet', exact:true}).click();
  await expect(page.getByRole('link', {name:'Saaristo 690'})).toHaveAttribute('href', '#saaristo');
  await expect(page.getByRole('link', {name:'Lentopaja'})).toHaveAttribute('href', '#paja');
  await page.getByRole('button', {name:/Lampilaboratorio/}).click();
  await expect(page.locator('.wmap.lab')).toBeVisible();
  await page.reload();
  await expect(page.locator('.wmap.lab .place.next')).toBeInViewport();
  await expect(page.locator('#vp-decor')).toBeHidden();
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
});

for (const module of ['VP04', 'VP05']) {
  fallback(`shipped files match the ${module} asset manifest`, async ({page}) => {
    const manifest = JSON.parse(await readFile(new URL(`../../tools/visual-polish/assets/${module}.json`, import.meta.url), 'utf8'));
    expect(manifest.files.length).toBeGreaterThan(0);
    for (const f of manifest.files) {
      const body = await (await page.request.get('/lite/' + f.out.replace(/^lite\/public\//, ''))).body();
      expect(createHash('sha256').update(body).digest('hex'), f.out).toBe(f.sha256);
      expect(body.length, f.out).toBeLessThanOrEqual(f.budget);
    }
  });
}

test.describe('VP05 living painting (software WebGL2 allowed with ?vpgl=any)', () => {
  // Headless Chromium has no hardware GPU; SwiftShader stands in, in a browser of this group's
  // own. Without ?vpgl=any that browser must refuse it (failIfMajorPerformanceCaveat + renderer
  // check), as covered below.
  let gpu: Browser;
  test.beforeAll(async ({playwright}) => { gpu = await playwright.chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']}); });
  test.afterAll(async () => { await gpu.close(); });
  const world = (page: Page) => page.locator('html').getAttribute('data-vp-world');
  async function fresh(width = 1440, height = 960) {
    const context = await gpu.newContext({baseURL: test.info().project.use.baseURL, viewport: {width, height}});
    const page = await context.newPage();
    const list: string[] = [];
    page.on('pageerror', e => list.push(e.message));
    return {context, page, done: async () => { expect(list).toEqual([]); await context.close(); }};
  }

  test('a software renderer is refused unless the review flag allows it', async () => {
    const {page, done} = await fresh();
    await page.goto('/lite/#alueet');
    await page.locator('.worlds').waitFor();
    const renderer = await page.evaluate(() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      const info = gl?.getExtension('WEBGL_debug_renderer_info');
      return gl && info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : null;
    });
    expect(renderer, 'the actual software renderer is SwiftShader').toMatch(/swiftshader/i);
    await expect.poll(() => surface(page)).toBe('worlds');
    await page.waitForTimeout(800);
    expect(await world(page)).toBeNull();
    expect(await page.locator('#vp-decor .vp-left').evaluate(e => getComputedStyle(e).backgroundImage)).toContain('/shore-left.webp');
    await page.goto('/lite/#kc/M-NUM-QTY-NUMERAL');
    await page.getByRole('button', {name: 'Osaan jo'}).waitFor();
    await page.waitForTimeout(500);
    expect(await surface(page)).toBeNull();
    await done();
  });

  test('the painting replaces the plates on the map and world choice, outside #app', async () => {
    const {page, done} = await fresh();
    await page.goto('/lite/?vpgl=any#alueet');
    await page.locator('.worlds').waitFor();
    await expect.poll(() => world(page)).toBe('saari');
    const canvas = page.locator('#vp-decor canvas.vp-world');
    await expect(canvas).toBeVisible();
    await expect(canvas).toHaveAttribute('aria-hidden', 'true');
    expect(await canvas.evaluate(e => getComputedStyle(e).pointerEvents)).toBe('none');
    expect(await page.locator('#app canvas.vp-world').count()).toBe(0);
    for (const sel of ['.vp-left', '.vp-right', '.vp-glints', '.vp-reeds']) await expect(page.locator(`#vp-decor ${sel}`), sel).toBeHidden();
    await page.locator('.worlds button.world').first().click();
    await page.locator('.wmap').waitFor();
    await expect.poll(() => surface(page)).toBe('map');
    await expect.poll(() => world(page)).toBe('ranta');
    // Sample the displayed left margin. A visible, uniformly clear canvas also
    // matches the DOM assertions but fails this check of the rendered painting.
    const art = await page.screenshot({clip: {x: 18, y: 70, width: 220, height: 500}});
    const colours = await page.evaluate(async (png) => {
      const image = new Image();
      image.src = 'data:image/png;base64,' + png;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(image, 0, 0);
      const {data} = ctx.getImageData(0, 0, image.width, image.height);
      const samples = new Set();
      for (let y = 20; y < image.height; y += 50) {
        for (let x = 10; x < image.width; x += 36) {
          const i = 4 * (y * image.width + x);
          samples.add([data[i], data[i + 1], data[i + 2]].map(value => Math.round(value / 8)).join(','));
        }
      }
      return samples.size;
    }, art.toString('base64'));
    expect(colours, 'the visible margin contains painted detail').toBeGreaterThan(8);
    await page.goto('/lite/?vpgl=any#paja');
    await page.locator('.paja').waitFor();
    await expect.poll(() => surface(page)).toBe('paja');
    expect(await world(page)).toBeNull();
    expect(await page.locator('#vp-decor .vp-left').evaluate(e => getComputedStyle(e).backgroundImage)).toContain('/workshop.webp');
    for (const hash of ['#aikuiselle', '#tuntematon-reitti']) {
      await page.evaluate(h => { location.hash = h; }, hash);
      await expect.poll(() => surface(page), hash).toBeNull();
      expect(await world(page), hash).toBeNull();
      await expect(page.locator('#vp-decor'), hash).toBeHidden();
    }
    await cycleRoutes(page, 6);
    expect(await page.locator('#vp-decor').count()).toBe(1);
    expect(await page.locator('#vp-decor canvas').count()).toBe(1);
    await done();
  });

  async function delayRantaMask(page: Page) {
    await page.addInitScript(() => {
      const decode = HTMLImageElement.prototype.decode;
      HTMLImageElement.prototype.decode = async function () {
        await decode.call(this);
        if (this.src.endsWith('/ranta-paiva-mask.webp')) document.documentElement.dataset.vpTestMaskDecoded = '';
      };
    });
    let release!: () => void;
    let seen!: () => void;
    const requested = new Promise<void>(resolve => { seen = resolve; });
    const pending = new Promise<void>(resolve => { release = resolve; });
    await page.route('**/ranta-paiva-mask.webp', async route => {
      seen();
      await pending;
      await route.continue();
    });
    const decoded = async () => {
      await expect(page.locator('html')).toHaveAttribute('data-vp-test-mask-decoded', '');
      await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    };
    return { requested, release, decoded };
  }

  test('a pending painting keeps its fallback and cannot replace a reselected world', async () => {
    const {page, done} = await fresh();
    const ranta = await delayRantaMask(page);
    try {
      await page.goto('/lite/?vp=static&vpgl=any&vptime=day#alueet');
      await expect.poll(() => world(page)).toBe('saari');
      await page.locator('.worlds button.world').first().click();
      await page.locator('.wmap.ranta').waitFor();
      await ranta.requested;
      await expect.poll(() => world(page)).toBeNull();
      await expect(page.locator('#vp-decor .vp-left')).toBeVisible();
      await expect(page.locator('#vp-decor canvas.vp-world')).toBeHidden();

      await page.evaluate(() => { location.hash = '#alueet'; });
      await page.locator('.worlds button.world').nth(1).click();
      await page.locator('.wmap.saari').waitFor();
      await expect.poll(() => world(page)).toBe('saari');
      const clip = {x: 20, y: 90, width: 200, height: 430};
      const before = await page.screenshot({clip});
      ranta.release();
      await ranta.decoded();
      expect(await page.screenshot({clip}), 'the late Rantaretki texture never appears in Saari').toEqual(before);
    } finally {
      ranta.release();
      await done();
    }
  });

  test('disposing during texture loading prevents a late draw or callback', async () => {
    const {page, done} = await fresh();
    const ranta = await delayRantaMask(page);
    try {
      await page.addInitScript(() => {
        const drawArrays = WebGL2RenderingContext.prototype.drawArrays;
        WebGL2RenderingContext.prototype.drawArrays = function (mode, first, count) {
          document.documentElement.dataset.vpTestDrew = '';
          return drawArrays.call(this, mode, first, count);
        };
      });
      await page.goto('/lite/?vp=off#alueet');
      await page.evaluate(async () => {
        const base = new URL('/lite/visual-polish/world/', location.href);
        const renderer = await import(new URL('world.js', base).href);
        const host = document.createElement('div');
        document.body.append(host);
        const api = await renderer.start({ host, base: base.href, soft: true, onReady: () => { document.documentElement.dataset.vpTestReady = ''; } });
        if (!api) throw new Error('Test painting renderer unavailable');
        document.addEventListener('vp-test-dispose', () => api.destroy(), {once: true});
        void api.set({ visible: true, surface: 'map', world: 'ranta', phase: 'day', animate: true, chars: true, dark: false });
      });
      await ranta.requested;
      await page.evaluate(() => document.dispatchEvent(new Event('vp-test-dispose')));
      ranta.release();
      await ranta.decoded();
      expect(await page.locator('canvas.vp-world').count()).toBe(0);
      expect(await page.locator('html').getAttribute('data-vp-test-drew')).toBeNull();
      expect(await page.locator('html').getAttribute('data-vp-test-ready')).toBeNull();
    } finally {
      ranta.release();
      await done();
    }
  });

  test('each world loads only its own day or evening painting', async () => {
    test.setTimeout(60_000);
    for (const [phase, tag] of [['day', 'paiva'], ['evening', 'ilta']] as const) {
      const {page, done} = await fresh();
      const got: string[] = [];
      page.on('request', r => { const m = /\/visual-polish\/world\/([a-z-]+)\.webp$/.exec(r.url()); if (m && m[1] !== 'hahmot') got.push(m[1]); });
      await page.goto(`/lite/?vpgl=any&vptime=${phase}#alueet`);
      for (const [i, w] of ['ranta', 'saari', 'lab'].entries()) {
        await page.evaluate(() => { location.hash = '#alueet'; });
        await page.locator('.worlds').waitFor();
        await page.locator('.worlds button.world').nth(i).click();
        await page.locator(`.wmap.${w}`).waitFor();
        await expect.poll(() => world(page), `${w} ${phase}`).toBe(w);
        await expect.poll(() => got.filter(x => x.startsWith(`${w}-`)).sort(), `${w} ${phase}`).toEqual([`${w}-${tag}`, `${w}-${tag}-mask`]);
      }
      expect(new Set(got), phase).toEqual(new Set(['ranta', 'saari', 'lab'].flatMap(w => [`${w}-${tag}`, `${w}-${tag}-mask`])));
      await done();
    }
  });

  test('lessons get the dimmed painting and only correct answers play a moment', async () => {
    test.setTimeout(90_000);
    const {context, page, done} = await fresh();
    await context.addInitScript(seed);
    await page.goto('/lite/?vpgl=any#kc/M-NUM-QTY-NUMERAL');
    await page.getByRole('button', {name: 'Osaan jo'}).waitFor();
    await expect.poll(() => surface(page)).toBe('lesson');
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
    const col = await page.locator('#vp-decor .vp-col').evaluate(e => [getComputedStyle(e).backgroundColor, getComputedStyle(e).width]);
    expect(col[0]).not.toBe('rgba(0, 0, 0, 0)');
    expect(col[1]).toBe('720px');
    const decor = page.locator('#vp-decor');
    expect(await decor.getAttribute('data-world-moment')).toBeNull();
    await page.getByRole('button', {name: 'Osaan jo'}).click();
    let ok = false;
    for (let i = 0; i < 30 && !ok; i++) {
      await page.waitForTimeout(400);
      const state = await page.evaluate(() => ({ok: !!document.querySelector('#app .feedback.ok'), bad: !!document.querySelector('#app .feedback.bad')}));
      if (state.ok) { ok = true; break; }
      if (state.bad) expect(await decor.getAttribute('data-world-moment'), 'a mistake plays nothing').toBeNull();
      await page.evaluate(() => {
        const buttons = [...document.querySelectorAll<HTMLButtonElement>('#app button')].filter(b => !b.disabled && b.getClientRects().length > 0);
        (buttons.find(b => b.classList.contains('opt') && !b.classList.contains('sel'))
          ?? buttons.find(b => ['Valmis', 'Jatka', 'Yritä uudelleen avun kanssa'].includes(b.textContent!.trim())))?.click();
      });
    }
    expect(ok, 'the driver reaches a correct answer').toBe(true);
    await expect(decor).toHaveAttribute('data-world-moment', 'correct');
    await expect(decor).toHaveAttribute('data-world-count', '1');
    await expect.poll(() => surface(page)).toBe('lesson');
    await done();
  });

  test('app DOM, layout and hit targets are identical with the painting on and off', async () => {
    test.setTimeout(60_000);
    expect(await snap(gpu, '?vpgl=any')).toEqual(await snap(gpu, '?vp=off'));
    expect(await snap(gpu, '?vpgl=any', true)).toEqual(await snap(gpu, '?vp=off', true));
  });

  test('seeded lesson steps and saved progress are identical with the painting on and off', async () => {
    test.setTimeout(120_000);
    const on = await seededLesson(gpu, '?vpgl=any');
    expect(on.trail.filter(step => step.startsWith('opt')).length, 'the driver must actually answer tasks').toBe(6);
    const off = await seededLesson(gpu, '?vp=off');
    expect(on.trail).toEqual(off.trail);
    expect(on.surface).toBe('lesson');
    expect(Number(on.moments), 'correct answers played moments').toBeGreaterThan(0);
  });

  test('without WebGL2 the plates stay and lessons stay bare', async () => {
    const {page, done} = await fresh();
    await page.addInitScript(refuseWebGL2);
    await page.goto('/lite/?vpgl=any#alueet');
    await page.locator('.worlds').waitFor();
    await expect.poll(() => surface(page)).toBe('worlds');
    await page.waitForTimeout(800);
    expect(await world(page)).toBeNull();
    await expect(page.locator('#vp-decor .vp-left')).toBeVisible();
    await page.goto('/lite/?vpgl=any#kc/M-NUM-QTY-NUMERAL');
    await page.getByRole('button', {name: 'Osaan jo'}).waitFor();
    await page.waitForTimeout(500);
    expect(await surface(page)).toBeNull();
    await expect(page.locator('#vp-decor')).toBeHidden();
    await done();
  });

  test('narrow screens never load the painting', async () => {
    const {page, done} = await fresh(390, 844);
    await openMap(page, '?vpgl=any');
    await page.waitForTimeout(800);
    expect(await world(page)).toBeNull();
    expect(await page.locator('#vp-decor canvas').count()).toBe(0);
    await expect(page.locator('#vp-decor')).toBeHidden();
    await done();
  });

  test('the painting code keeps to its own random source and storage-free', async () => {
    const code = await readFile(new URL('../public/visual-polish/world/world.js', import.meta.url), 'utf8');
    for (const banned of ['Math.random', 'localStorage', 'sessionStorage', "getElementById('app')", 'Date.now', 'AudioContext']) expect(code, banned).not.toContain(banned);
  });
});

