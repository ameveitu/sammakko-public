import {reviewImage} from './review-image';
import {expect, test, type Page} from '@playwright/test';
import {readFile} from 'node:fs/promises';

async function expectEntireNetworkInCanvas(page: Page) {
  const outside = await page.locator('#network-stage').evaluate(stage => {
    const box=stage.getBoundingClientRect();
    return [...stage.querySelectorAll<SVGGElement>('.graph-node')].filter(node=>{
      const r=node.getBoundingClientRect();return r.left<box.left-1||r.right>box.right+1||r.top<box.top-1||r.bottom>box.bottom+1;
    }).map(node=>node.dataset.id);
  });
  expect(outside,'Koko verkko must fit every actual rendered node, not just keep it in the DOM').toEqual([]);
}


const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({page}) => {
  await page.setViewportSize({width:1440, height:960});
  const found: string[] = [];
  errors.set(page, found);
  page.on('pageerror', error => found.push(error.message));
});
test.afterEach(async ({page}) => expect(errors.get(page)).toEqual([]));

test('home opens Aava’s workshop and Lite returns home on the same origin', async ({page}, testInfo) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await expect(page.locator('main h1')).toBeVisible();
  const aava = page.locator('img[src*="/characters/aava/"]').first();
  await expect(aava).toBeVisible();
  expect(await aava.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await reviewImage(page, testInfo, 'desktop-home.png');
  await page.getByRole('link',{name:'Avaa Lentopaja',exact:true}).first().click();
  await expect(page).toHaveURL(/\/lite\/#paja$/);
  await expect(page.locator('#app')).toContainText('Aava');
  await expect(page.locator('.publication-nav')).toBeVisible();
  await page.locator('.publication-nav a[href="/"]').click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('main h1')).toBeVisible();
});

test('lesson link and reload keep the learner on the selected Lite exercise', async ({page, context}) => {
  const id = 'M-NUM-QTY-NUMERAL';
  await page.goto(`/oppitunnit/lessons/${id}.html`);
  await expect(page.locator('main h1')).toBeVisible();
  const launch = page.locator('section[data-game-kind="lite"] a[data-game-action="open"]');
  if (!(await launch.isVisible())) await page.locator('details[data-shell-teacher] > summary').click();
  await expect(launch).toHaveAttribute('href', `/lite/#kc/${id}`);
  const opened = context.waitForEvent('page');
  await launch.click();
  const lite = await opened;
  const popupErrors: string[] = [];
  lite.on('pageerror', error => popupErrors.push(error.message));
  await lite.waitForLoadState();
  await expect(lite).toHaveURL(new RegExp(`/lite/#kc/${id}$`));
  await expect(lite.getByRole('button', {name:'Osaan jo'})).toBeVisible();
  await lite.reload();
  await expect(lite.getByRole('button', {name:'Osaan jo'})).toBeVisible();
  const attempts = await lite.evaluate(() => JSON.parse(localStorage.getItem('sammakko-lite-2') ?? '{}').attempts ?? []);
  expect(attempts).toHaveLength(0);
  await expect(lite.locator('.publication-nav a[href^="/oppitunnit"]')).toHaveCount(0);
  await expect(lite.locator('#app .top .title')).toContainText('Rasian lappu');
  expect(popupErrors).toEqual([]);
});

test('catalogue defaults to authored drafts and scaffolds never offer an unsupported Lite launch', async ({page}, testInfo) => {
  await page.goto('/oppitunnit/');
  await expect(page.locator('select[name="content"]')).toHaveValue('draft');
  await reviewImage(page, testInfo, 'desktop-catalogue.png');
  const canonical = await (await page.request.get('/lite/canonical-ids.json')).json() as {titles:Record<string,string>};
  const runtime = await (await page.request.get('/lite/lite-runtime.json')).json() as {runtimeAvailability:{ids:string[]}};
  const scaffold = Object.keys(canonical.titles).find(id => !runtime.runtimeAvailability.ids.includes(id))!;
  await page.goto(`/oppitunnit/lessons/${scaffold}.html`);
  await expect(page.locator('main h1')).toContainText(canonical.titles[scaffold]);
  expect(await page.locator('section[data-game-kind="lite"] a[data-game-action="open"]').count()).toBe(0);
});

test('learning network loads the canonical graph and preserves a focused subgraph when returning to the full view', async ({page}, testInfo) => {
  await page.goto('/oppimisverkko/');
  await expect(page.locator('#network-status')).toContainText('690 noodia');
  await expect(page.locator('#scope-toggle')).toHaveAttribute('aria-pressed','false');
  await expectEntireNetworkInCanvas(page);
  await expect(page.locator('.graph-node[tabindex="0"]')).toHaveCount(1);
  await expect(page.locator('.graph-edge.helpful')).toHaveCount(3);
  const graph = await (await page.request.get('/oppimisverkko/data/canonical-690-graph.json')).json() as {nodes:Array<{relations?:unknown[]}>};
  expect(graph.nodes).toHaveLength(690);
  expect(graph.nodes.reduce((sum, node) => sum + (node.relations?.length ?? 0), 0)).toBe(1287);
  await page.locator('#network-search').fill('M-NUM-01');
  await page.locator('.network-result[data-id="M-NUM-01"]').click();
  await expect(page.locator('.graph-node.is-selected[data-id="M-NUM-01"]')).toBeVisible();
  const highlighted = await page.locator('.graph-node.is-highlight').count();
  expect(highlighted).toBeGreaterThan(1);
  await expect(page.locator('#focus-summary')).toContainText('aliverkko');
  await expect(page.locator('#network-stage')).toHaveAttribute('data-mode','focus');
  await expect(page.locator('.focus-card.is-selected[data-id="M-NUM-01"]')).toBeVisible();
  expect(await page.locator('.focus-card').count()).toBe(highlighted);
  await page.locator('#btn-overview').click();
  await expect(page.locator('#network-stage')).toHaveAttribute('data-mode','overview');
  await expectEntireNetworkInCanvas(page);
  expect(await page.locator('.graph-node.is-highlight').count()).toBe(highlighted);
  await expect(page.locator('#node-info a[href="/oppitunnit/lessons/M-NUM-01.html"]')).toBeVisible();
  await reviewImage(page, testInfo, 'desktop-learning-network.png');
});

test('learning network modes switch cleanly: roots, subgraph and back to the full network', async ({page}) => {
  // The faded-overview transition moves tiny overview nodes for 0.3 s; clicks here target them directly.
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/oppimisverkko/');
  await expect(page.locator('#network-status')).toContainText('690 noodia');
  const stage=page.locator('#network-stage'),overview=page.locator('#btn-overview'),roots=page.locator('#btn-roots');
  await expect(page.locator('#btn-focus')).toBeDisabled();
  await roots.click();
  await expect(stage).toHaveAttribute('data-mode','roots');
  await expect(roots).toHaveAttribute('aria-pressed','true');await expect(overview).toHaveAttribute('aria-pressed','false');
  expect(await page.locator('.focus-card').count()).toBeGreaterThan(50);
  // Regression: Koko verkko after Juurinoodit used to leave the roots view in place.
  await overview.click();
  await expect(stage).toHaveAttribute('data-mode','overview');
  await expect(overview).toHaveAttribute('aria-pressed','true');await expect(roots).toHaveAttribute('aria-pressed','false');
  await expectEntireNetworkInCanvas(page);
  expect(await page.locator('.graph-node.is-highlight').count()).toBe(0);
  await roots.click();
  await page.locator('.focus-card[data-id]').first().click();
  await expect(stage).toHaveAttribute('data-mode','focus');
  await expect(page.locator('#btn-focus')).toBeEnabled();
  await expect(page.locator('.focus-card.is-selected')).toHaveCount(1);
  const toggle=page.locator('#scope-toggle'),direct=await page.locator('.focus-card').count();
  await expect(toggle).toBeVisible();await expect(toggle).toHaveText('Näytä kaikki esivanhemmat ja jälkeläiset');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed','true');await expect(toggle).toHaveText('Näytä vain suorat vanhemmat ja lapset');
  expect(await page.locator('.focus-card').count()).toBeGreaterThan(direct);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed','false');
  expect(await page.locator('.focus-card').count()).toBe(direct);
  await page.locator('#network-stage').focus();await page.keyboard.press('0');
  await expect(stage).toHaveAttribute('data-mode','overview');
  await page.locator('#btn-focus').click();
  await expect(stage).toHaveAttribute('data-mode','focus');
  // Overview nodes stay clickable after returning to the full network (the hidden subgraph layer once covered them).
  await overview.click();
  await page.locator('.graph-node[data-id="M-NUM-01"]').click({force:true});
  await expect(stage).toHaveAttribute('data-mode','focus');
  await expect(page.locator('.focus-card.is-selected[data-id="M-NUM-01"]')).toBeVisible();
  // Grade-band arrangement: three bands, whole network still fits, nodes still selectable.
  await overview.click();
  const subject=page.locator('#layout-switch button[data-layout="subject"]'),grade=page.locator('#layout-switch button[data-layout="grade"]');
  // Arrows read left to right: every relation has an arrowhead, and in the grade arrangement only the
  // mutual atom/element pair and one cross-band link may point back.
  const backward=(kinds:string)=>page.evaluate(k=>{const x:Record<string,number>={};for(const g of document.querySelectorAll<SVGGElement>('.graph-node'))x[g.dataset.id!]=Number(g.getAttribute('transform')!.match(/translate\(([-\d.]+)/)![1]);
    return [...document.querySelectorAll<SVGPathElement>(k)].filter(e=>x[e.dataset.target!]<=x[e.dataset.source!]).length},kinds);
  expect(await page.locator('#edges-layer .graph-edge:not([marker-end])').count()).toBe(0);
  await expect(subject).toHaveAttribute('aria-pressed','true');
  // Subject headings float at a fixed readable size, whatever the zoom.
  const labels=page.locator('.group-label');
  await expect(labels).toHaveText(['Matematiikka · 1–6','Ympäristöopin perusta · 1–6','Matematiikka · 7–9','Fysiikka · 7–9','Kemia · 7–9']);
  const size=()=>labels.first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize));
  const before=await size();expect(before).toBeGreaterThanOrEqual(13);
  await stage.focus();for(let i=0;i<10;i++)await page.keyboard.press('+');
  expect(await size()).toBe(before);
  expect(await page.locator('.group-label:not([hidden])').count()).toBeGreaterThan(0);
  await page.keyboard.press('0');
  await grade.click();
  await expect(page.locator('.group-label')).toHaveCount(0);
  await expect(grade).toHaveAttribute('aria-pressed','true');await expect(subject).toHaveAttribute('aria-pressed','false');
  await expect(page.locator('.band-label')).toHaveText(['Vuosiluokat 1–2','Vuosiluokat 3–6','Vuosiluokat 7–9']);
  expect(await backward('#edges-layer .graph-edge.required,#edges-layer .graph-edge.alternative')).toBe(0);
  expect(await backward('#edges-layer .graph-edge')).toBeLessThanOrEqual(2);
  await expectEntireNetworkInCanvas(page);
  await page.locator('.graph-node[data-id="M-NUM-01"]').click({force:true});
  await expect(stage).toHaveAttribute('data-mode','focus');
  await overview.click();await subject.click();
  await expect(subject).toHaveAttribute('aria-pressed','true');
  // The full subgraph lays cards by the longest chain, so none of its arrows point back.
  await page.locator('.graph-node[data-id="M-EST-01"]').click({force:true});
  await expect(stage).toHaveAttribute('data-mode','focus');
  if(await toggle.getAttribute('aria-pressed')!=='true')await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed','true');
  expect(await page.evaluate(()=>{const x:Record<string,number>={};for(const c of document.querySelectorAll<SVGGElement>('.focus-card'))x[c.dataset.id!]=Number(c.getAttribute('transform')!.match(/translate\(([-\d.]+)/)![1]);
    const edges=[...document.querySelectorAll<SVGPathElement>('#focus-edges .focus-edge')];return edges.length>10&&edges.every(e=>x[e.dataset.to!]>x[e.dataset.from!])})).toBe(true);
  await toggle.click();
});

test('whitepaper is readable, downloadable and has a usable print view', async ({page}, testInfo) => {
  await page.goto('/');
  await page.locator('a[href="/whitepaper/"]').first().click();
  await expect(page.locator('#whitepaper-content')).toBeVisible();
  await expect(page.locator('[id="22-johtopaatos"]')).toBeAttached();
  await expect(page.locator('#kirjallisuutta-ja-taustaa')).toBeAttached();
  await reviewImage(page, testInfo, 'desktop-whitepaper.png');
  const source = await page.request.get('/whitepaper/Sammakko_whitepaper_FI.md');
  expect(source.ok()).toBe(true);
  const markdown = await source.text();
  expect(markdown.length).toBeGreaterThan(20_000);
  expect(markdown).toContain('# 22. Johtopäätös');
  const downloadEvent=page.waitForEvent('download');
  await page.getByRole('link',{name:'Lataa whitepaper tekstinä (Markdown)'}).click();
  const download=await downloadEvent;
  expect(download.suggestedFilename()).toBe('Sammakko_whitepaper_FI.md');
  expect(await download.failure()).toBeNull();
  expect(await readFile((await download.path())!,'utf8')).toBe(markdown);
  await expect(page.locator('#kirjallisuutta-ja-taustaa').locator('..').locator('a[href^="https://"]')).toHaveCount(11);
  await page.evaluate(() => { window.print = () => { document.body.dataset.printCalled = 'true'; }; });
  await page.locator('[data-print]').click();
  await expect(page.locator('body')).toHaveAttribute('data-print-called', 'true');
  await page.emulateMedia({media:'print'});
  await expect(page.locator('#whitepaper-content')).toBeVisible();
  await expect(page.locator('[data-print]')).toBeHidden();
});

test('mobile menu, keyboard exit and narrow pages work with reduced motion', async ({page}, testInfo) => {
  await page.setViewportSize({width:390, height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  const menu = page.locator('[data-menu-toggle]');
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  const nav = page.locator('#' + await menu.getAttribute('aria-controls'));
  await expect(nav.locator('a[href="/whitepaper/"]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  for (const route of ['/', '/whitepaper/', '/tietoa/', '/oppitunnit/', '/oppimisverkko/', '/lite/#alueet']) {
    await page.goto(route);
    await expect(page.locator('h1').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `Horizontal overflow at ${route}`).toBe(true);
    if (route === '/' || route === '/oppitunnit/' || route === '/oppimisverkko/' || route === '/whitepaper/') {
      const name = route === '/' ? 'mobile-home.png' : route === '/oppitunnit/' ? 'mobile-catalogue.png' : route === '/oppimisverkko/' ? 'mobile-learning-network.png' : 'mobile-whitepaper.png';
      await reviewImage(page, testInfo, name);
    }
  }
});

test('publication works without site JavaScript and server preserves redirects, 404 and module types', async ({browser, request, baseURL}) => {
  const context = await browser.newContext({javaScriptEnabled:false, baseURL});
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('main h1')).toBeVisible();
  await page.locator('a[href="/whitepaper/"]').first().click();
  await expect(page.locator('#whitepaper-content')).toBeVisible();
  await context.close();
  for (const route of ['/lite', '/oppitunnit', '/oppimisverkko', '/whitepaper']) {
    const redirect = await request.get(route, {maxRedirects:0});
    expect([301, 308]).toContain(redirect.status());
    expect(redirect.headers().location).toBe(route + '/');
  }
  const missing = await request.get('/this-page-does-not-exist');
  expect(missing.status()).toBe(404);
  expect(await missing.text()).toContain('lang="fi"');
  const module = await request.get('/oppitunnit/content/M-NUM-QTY-NUMERAL/lesson.mjs');
  expect(module.ok()).toBe(true);
  expect(module.headers()['content-type']).toMatch(/javascript/);
  const release = await (await request.get('/release.json')).json() as {sections:string[]; sourceCommit:string|null};
  expect(release.sections.slice().sort()).toEqual(['kotisivu', 'lite', 'oppimisverkko', 'oppitunnit', 'whitepaper']);
  if (process.env.GITHUB_SHA) expect(release.sourceCommit).toBe(process.env.GITHUB_SHA);
});


test('teacher can open the counting example presentation and see the complete figure on the board',async({page},testInfo)=>{
  await page.setViewportSize({width:1280,height:720});
  // Lessons are linked only from the learning network node panel until release quality, so open the presentation directly.
  await page.goto('/oppitunnit/presentations/M-NUM-1TO1.html');
  await expect(page.locator('body')).toHaveClass(/audience/);
  await expect(page.locator('[data-shell-teacher],.teacher,[data-lesson-role=\"teacher-note\"]')).toHaveCount(0);
  const opening=page.locator('.teaching-opening');
  await expect(opening.getByRole('heading',{name:'Jokaiselle oma laskusana'})).toBeVisible();
  const rect=await opening.locator('figure img').evaluate(img=>{const b=img.getBoundingClientRect();return{top:b.top,bottom:b.bottom,height:innerHeight,loaded:(img as HTMLImageElement).naturalWidth>0}});
  expect(rect.loaded).toBe(true);expect(rect.top).toBeGreaterThanOrEqual(0);expect(rect.bottom).toBeLessThanOrEqual(rect.height);
  await reviewImage(page, testInfo, 'projector-counting-opening.png');
  await page.getByRole('link',{name:'Näytä laskeminen vaiheittain'}).click();
  await page.locator('[data-action="step"]').click();
  await expect(page.locator('[data-demo-view]')).toHaveText('Osoita yhtä marjaa: yksi.');
  await expect(page.locator('.audience-toolbar')).toBeVisible();
  await page.emulateMedia({media:'print'});
  await expect(page.locator('.audience-toolbar')).toBeHidden();
  await page.emulateMedia({media:'screen'});
  await expect(page.locator('.audience-toolbar')).toBeVisible();
  // The legacy entry redirects to a separate audience document. Preparation remains a distinct route.
  await page.goto('/oppitunnit/lessons/M-NUM-1TO1.html?mode=presentation');
  await expect(page).toHaveURL(/\/presentations\/M-NUM-1TO1.html$/);
  await page.goto('/oppitunnit/lessons/M-NUM-1TO1.html');
  await expect(page.locator('main>h1')).toBeVisible();
  await expect(page.locator('#mode')).toHaveAttribute('href','../presentations/M-NUM-1TO1.html');
});

test('mobile network tools manage focus, Escape and search without an offscreen tab sequence',async({page},testInfo)=>{
  await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/oppimisverkko/');
  await expect(page.locator('#network-status')).toContainText('690 noodia');
  await expectEntireNetworkInCanvas(page);
  const drawer=page.locator('#network-sidebar'),open=page.locator('#sidebar-open');
  await expect(drawer).toHaveJSProperty('inert',true);
  await open.click();await expect(page.locator('#network-search')).toBeFocused();
  await expect(page.locator('#network-main')).toHaveJSProperty('inert',true);
  for(let i=0;i<8;i++){await page.keyboard.press('Tab');expect(await page.evaluate(()=>!!document.activeElement?.closest('#network-main'))).toBe(false);}
  for(let i=0;i<3;i++){await page.keyboard.press('Shift+Tab');expect(await page.evaluate(()=>!!document.activeElement?.closest('#network-main'))).toBe(false);}
  await page.keyboard.press('Escape');
  await expect(open).toHaveAttribute('aria-expanded','false');await expect(open).toBeFocused();await expect(drawer).toHaveJSProperty('inert',true);
  await open.click();await page.locator('#network-search').fill('M-NUM-01');await page.locator('.network-result[data-id="M-NUM-01"]').click();
  await expect(open).toHaveAttribute('aria-expanded','false');await expect(page.locator('#network-stage')).toBeFocused();
  await page.locator('#btn-overview').click();await expectEntireNetworkInCanvas(page);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await reviewImage(page, testInfo, 'mobile-network-overview.png');
  await page.setViewportSize({width:720,height:844});await open.click();await expect(page.locator('#network-main')).toHaveJSProperty('inert',true);
  await page.setViewportSize({width:721,height:844});await expect(drawer).toHaveJSProperty('inert',false);await expect(page.locator('#network-main')).toHaveJSProperty('inert',false);
});

test('preview and unfinished lessons have explicit indexing rules and the share image ships',async({page,request})=>{
  await page.goto('/');
  const release=await(await request.get('/release.json')).json() as {publication:{mode:string,publicOrigin:string|null}};
  if(release.publication.mode==='preview'){
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex, follow');
    expect(await page.locator('link[rel="canonical"]').count()).toBe(0);
    expect(await(await request.get('/sitemap.xml')).text()).not.toContain('<loc>');
  }
  const canonical=await(await request.get('/lite/canonical-ids.json')).json() as {titles:Record<string,string>};
  const lite=await(await request.get('/lite/lite-runtime.json')).json() as {runtimeAvailability:{ids:string[]}};
  const pending=Object.keys(canonical.titles).find(id=>!lite.runtimeAvailability.ids.includes(id))!;
  await page.goto(`/oppitunnit/lessons/${pending}.html`);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex, follow');
  const image=await request.get('/assets/share.png');expect(image.ok()).toBe(true);expect(image.headers()['content-type']).toContain('image/png');
});


test('explorer preserves canonical OR prerequisite groups instead of making each alternative mandatory',async({page,request})=>{
  const graph=await(await request.get('/oppimisverkko/data/canonical-690-graph.json')).json() as {nodes:Array<{id:string,prerequisite_groups?:Array<{any_of?:string[]}>}>};
  await page.goto('/oppimisverkko/');await expect(page.locator('#network-status')).toContainText('690 noodia');
  for(const id of ['M-DIVIS-01','M-PCT-01','M-ALG-08']){
    await page.locator('#network-search').fill(id);await page.locator(`.network-result[data-id="${id}"]`).click();
    const groups=graph.nodes.find(n=>n.id===id)!.prerequisite_groups!.filter(g=>g.any_of);
    expect(groups.length).toBeGreaterThan(0);
    const info=page.locator('.prerequisite-groups');await expect(info).toContainText('Vähintään yksi (TAI)');
    for(const group of groups){await expect(info).toContainText(group.any_of!.join(' TAI '));for(const source of group.any_of!)await expect(page.locator(`.graph-edge[data-source="${source}"][data-target="${id}"]`)).toHaveClass(/alternative/);}
  }
});


test('rapid normal-motion drawer exit cancels pending scroll and returns focus visibly',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/oppimisverkko/');await expect(page.locator('#network-status')).toContainText('690 noodia');
  await page.locator('#sidebar-open').click();await page.keyboard.press('Tab');await page.keyboard.press('Tab');await page.keyboard.press('Escape');
  await expect(page.locator('#sidebar-open')).toBeFocused();
  const final=await page.evaluate(async()=>{
    for(let i=0;i<120;i++)await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
    const b=document.querySelector('#sidebar-open')!.getBoundingClientRect();return{top:b.top,bottom:b.bottom,height:innerHeight,active:document.activeElement?.id};
  });
  expect(final.active).toBe('sidebar-open');expect(final.top).toBeGreaterThanOrEqual(0);expect(final.bottom).toBeLessThanOrEqual(final.height);
});
