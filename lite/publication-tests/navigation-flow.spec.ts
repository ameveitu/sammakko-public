import {reviewImage} from './review-image';
import {readFile} from 'node:fs/promises';
import {expect, test, type Locator, type Page} from '@playwright/test';

// These checks measure the result of a real user action. In particular, no
// scrollIntoView/focus/locator action is allowed between opening a disclosure
// and measuring its new content. The old projector sweep still checks that all
// optional content can eventually be reached; this suite checks immediate use.
const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({page}) => {
  await page.setViewportSize({width:1280, height:720});
  await page.emulateMedia({reducedMotion:'reduce'});
  const found:string[] = [];
  errors.set(page, found);
  page.on('pageerror', error => found.push(error.message));
});
test.afterEach(async ({page}) => expect(errors.get(page)).toEqual([]));

const primaryLinks = [
  {text:'Etusivu', href:'/'},
  {text:'Oppimisverkko', href:'/oppimisverkko/'},
  {text:'Whitepaper', href:'/whitepaper/'},
  {text:'Tietoa', href:'/tietoa/'},
  {text:'Avaa Sammakko Lite', href:'/lite/'},
];

async function renderedFrames(page:Page, count=3) {
  await page.evaluate(async frames => {
    for (let i=0;i<frames;i++) await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  }, count);
}

async function moduleReady(page:Page) {
  await expect(page.locator('[data-module-status]')).toHaveText(/Harjoitus käytettävissä|Voit jatkaa/);
}

async function audienceBoundary(page:Page) {
  await expect(page.locator('.teacher,[data-shell-teacher],[data-lesson-role="teacher-note"],[data-lesson-role="metadata"],.research-links,section[data-game-kind],#prerequisites,.support-details')).toHaveCount(0);
  await expect(page.locator('[data-audience-step]:not([hidden])')).toHaveCount(1);
  expect(await page.locator('[data-audience-step][hidden]').evaluateAll(steps => steps.every(step => (step as HTMLElement).inert))).toBe(true);
}

async function openAudienceTools(page:Page) {
  const tools=page.locator('[data-audience-tools]');
  if (!(await tools.evaluate(element => (element as HTMLDetailsElement).open))) {
    await tools.locator(':scope > summary').click();
  }
  await expect(tools).toHaveAttribute('open','');
}

// Position only the CLOSED control, before the tested action. This emulates a
// reader who has reached a disclosure at the edge of a long teacher document.
// It never creates spacer content, changes lesson CSS, or assists the result.
async function positionSummary(page:Page, details:Locator, edge:'start'|'end') {
  await details.locator(':scope > summary').evaluate((summary, placement) => {
    let scrollParent:HTMLElement|null=summary.parentElement;
    while (scrollParent && scrollParent!==document.body) {
      const css=getComputedStyle(scrollParent);
      if (/(auto|scroll)/.test(css.overflowY) && scrollParent.scrollHeight>scrollParent.clientHeight+1) break;
      scrollParent=scrollParent.parentElement;
    }
    const container=scrollParent && scrollParent!==document.body ? scrollParent : null;
    const frame=container?.getBoundingClientRect();
    let top=Math.max(0, frame?.top ?? 0), bottom=Math.min(innerHeight, frame?.bottom ?? innerHeight);
    for (const bar of document.querySelectorAll<HTMLElement>('.site-header,[data-teacher-flow]')) {
      const css=getComputedStyle(bar), rect=bar.getBoundingClientRect();
      if ((css.position==='fixed'||css.position==='sticky') && rect.top<=Number.parseFloat(css.top||'0')+2 && rect.bottom>0) top=Math.max(top,rect.bottom);
    }
    const rect=summary.getBoundingClientRect();
    const target=placement==='end' ? bottom-rect.height-8 : top+12;
    if (container) container.scrollTop+=rect.top-target;
    else window.scrollTo({top:scrollY+rect.top-target,behavior:'instant'});
  }, edge);
  await renderedFrames(page);
}

async function disclosureGeometry(details:Locator, contentSelector:string) {
  return details.evaluate((element, selector) => {
    const detail=element as HTMLDetailsElement;
    const summary=detail.querySelector(':scope > summary')!;
    const content=detail.querySelector(selector)!;
    const s=summary.getBoundingClientRect(), c=content.getBoundingClientRect();
    let top=0, bottom=innerHeight, left=0, right=innerWidth;
    for (let parent:HTMLElement|null=detail.parentElement;parent && parent!==document.body;parent=parent.parentElement) {
      const css=getComputedStyle(parent), rect=parent.getBoundingClientRect();
      if (/(auto|scroll|hidden|clip)/.test(css.overflowY)) {top=Math.max(top,rect.top);bottom=Math.min(bottom,rect.bottom);}
      if (/(auto|scroll|hidden|clip)/.test(css.overflowX)) {left=Math.max(left,rect.left);right=Math.min(right,rect.right);}
    }
    for (const bar of document.querySelectorAll<HTMLElement>('.site-header,[data-teacher-flow]')) {
      const css=getComputedStyle(bar), rect=bar.getBoundingClientRect();
      if ((css.position==='fixed'||css.position==='sticky') && rect.top<=Number.parseFloat(css.top||'0')+2 && rect.bottom>0) top=Math.max(top,rect.bottom);
    }
    // A short first paragraph/figure should fit in full with its summary.
    // A genuinely long first child only needs its readable beginning exposed.
    const fullBeginningFits=c.bottom-s.top<=bottom-top-4;
    const neededBottom=fullBeginningFits ? c.bottom : c.top+Math.min(c.height,48);
    const x=Math.max(left+2,Math.min(right-2,c.left+Math.min(c.width/2,40)));
    const y=c.top+Math.min(c.height/2,8), hit=document.elementFromPoint(x,y);
    return {
      open:detail.open,
      summary:{top:s.top,bottom:s.bottom}, content:{top:c.top,bottom:c.bottom,height:c.height},
      frame:{top,bottom,left,right}, neededBottom, fullBeginningFits,
      beginningVisible:detail.open && c.height>0 && s.top>=top-1 && s.bottom<=bottom+1 && c.top>=top-1 && neededBottom<=bottom+1 && !!hit && (hit===content||content.contains(hit)),
      windowScroll:scrollY, lessonScroll:document.querySelector('#lesson-body')?.scrollTop ?? 0,
      focusOnSummary:document.activeElement===summary,
    };
  }, contentSelector);
}

async function clickVisibleSummary(page:Page, details:Locator) {
  const point=await details.locator(':scope > summary').evaluate(summary => {
    const rect=summary.getBoundingClientRect(), x=rect.left+Math.min(rect.width/2,60), y=rect.top+rect.height/2;
    const hit=document.elementFromPoint(x,y);
    return {x,y,visible:x>=0&&x<innerWidth&&y>=0&&y<innerHeight&&!!hit&&(hit===summary||summary.contains(hit))};
  });
  expect(point.visible,'The closed summary must already be reachable before the measured click').toBe(true);
  await page.mouse.click(point.x,point.y);
}

async function expectBeginningWithoutAssistance(details:Locator, contentSelector:string) {
  await expect.poll(async () => (await disclosureGeometry(details,contentSelector)).beginningVisible,
    {message:'The actual disclosure action must expose its new beginning without driver scrolling or focus assistance'}).toBe(true);
  return disclosureGeometry(details,contentSelector);
}

for (const item of [
  {route:'/',active:'Etusivu' as string|null},
  // The lesson library is out of the header until release quality; its pages keep the shared header with nothing current.
  {route:'/oppitunnit/',active:null},
  {route:'/oppitunnit/lessons/M79-EQ1-SOLVE.html',active:null},
  {route:'/oppimisverkko/',active:'Oppimisverkko'},
  {route:'/whitepaper/',active:'Whitepaper'},
  {route:'/tietoa/',active:'Tietoa'},
]) {
  test(`shared navigation stays available with consistent destinations: ${item.route}`,async ({page}) => {
    await page.goto(item.route);
    const nav=page.locator('#site-nav');
    await expect(nav).toHaveAttribute('aria-label','Päänavigaatio');
    // On desktop the homepage keeps its play link in the hero. Mobile has extra destinations in Valikko.
    const expected=item.route==='/' ? primaryLinks.filter(link => link.href!=='/lite/') : primaryLinks;
    expect(await nav.locator(':scope > a:visible').evaluateAll(links => links.map(link => ({text:link.textContent?.trim(),href:link.getAttribute('href')})))).toEqual(expected);
    if (item.active) await expect(nav.locator('[aria-current="page"]')).toHaveText(item.active);
    else await expect(nav.locator('[aria-current="page"]')).toHaveCount(0);
    if (item.route!=='/') await expect(nav.locator('a[href="/lite/"]')).not.toHaveAttribute('target','_blank');
    await page.evaluate(() => window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
    await renderedFrames(page);
    const home=nav.getByRole('link',{name:'Etusivu',exact:true});
    await expect(home).toBeInViewport({ratio:1});
    await home.click();
    await expect(page).toHaveURL(/\/$/);
  });
}

test('mobile navigation opens at the current reading position, closes by Escape and exposes the home route',async ({page},testInfo) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/oppitunnit/');
  await page.evaluate(() => window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
  await renderedFrames(page);
  const toggle=page.locator('[data-menu-toggle]');
  await expect(toggle).toBeInViewport({ratio:1});
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded','true');
  const home=page.locator('#site-nav').getByRole('link',{name:'Etusivu',exact:true});
  await expect(home).toBeInViewport({ratio:1});
  await reviewImage(page, testInfo, 'navigation-mobile-at-end.png');
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded','false');
  await expect(toggle).toBeFocused();
  await toggle.click();
  await home.click();
  await expect(page).toHaveURL(/\/$/);
});

for (const route of ['/lite/','/lite/#kc/M-NUM-QTY-NUMERAL']) {
  test(`packaged Lite keeps explicit site destinations: ${route}`,async ({page},testInfo) => {
    await page.setViewportSize({width:390,height:844});
    await page.goto(route);
    await expect(page.locator('meta[name="sammakko-publication"]')).toHaveAttribute('content','site');
    const nav=page.getByRole('navigation',{name:'Sammakko-sivusto',exact:true});
    for (const [name,href] of [['Etusivu','/'],['Oppimisverkko','/oppimisverkko/']]) {
      const link=nav.getByRole('link',{name,exact:true});
      await expect(link).toHaveAttribute('href',href);
      await expect(link).toBeInViewport({ratio:1});
    }
    await expect(nav.locator('a[href^="/oppitunnit"]')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    await reviewImage(page, testInfo, route.includes('#kc/')?'navigation-lite-topic.png':'navigation-lite-home.png');
    await nav.getByRole('link',{name:'Etusivu',exact:true}).click();
    await expect(page).toHaveURL(/\/$/);
  });
}

test('the actual standalone Lite build at /lite/ does not invent publication routes',async ({page}) => {
  const standalone=await readFile(new URL('../dist/index.html', import.meta.url),'utf8');
  expect(standalone).not.toContain('sammakko-publication');
  await page.route(url => url.pathname==='/lite/',async route => {
    if (route.request().resourceType()==='document') await route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:standalone});
    else await route.continue();
  });
  await page.goto('/lite/#alueet');
  await expect(page.locator('#app h1').first()).toBeVisible();
  await expect(page.locator('.publication-nav')).toHaveCount(0);
});

test('teacher stage choice launches that exact stage in a separate clean audience tab',async ({page,context},testInfo) => {
  await page.goto('/oppitunnit/lessons/M79-EQ1-SOLVE.html');
  await moduleReady(page);
  const chooser=page.locator('[data-teacher-step]');
  await chooser.selectOption('2');
  await expect(page.locator('[data-teacher-count]')).toHaveText(/^3 \/ /);
  const detail=page.locator('#eq14-explain');
  await clickVisibleSummary(page,detail);
  await expectBeginningWithoutAssistance(detail,':scope > h3');
  await reviewImage(page, testInfo, 'teacher-selected-step-open.png');
  const launch=page.locator('[data-teacher-presentation]');
  await expect(launch).toHaveAttribute('target','_blank');
  await expect(launch).toHaveAttribute('href',/presentations\/M79-EQ1-SOLVE\.html\?step=3$/);
  const before=await page.evaluate(() => ({url:location.href,storage:localStorage.getItem('sammakko-lite-2')}));
  const popup=context.waitForEvent('page');
  await launch.click();
  const audience=await popup;
  const found:string[]=[];audience.on('pageerror',error=>found.push(error.message));
  await audience.waitForLoadState();
  await expect(audience).toHaveURL(/\/presentations\/M79-EQ1-SOLVE\.html\?step=3$/);
  await expect(audience.locator('[data-step-count]')).toHaveText(/^3 \/ /);
  await audienceBoundary(audience);
  await expect(audience.locator('#eq14-explain')).not.toHaveAttribute('open');
  await audience.close();
  await page.bringToFront();
  await expect(page).toHaveURL(before.url);
  await expect(chooser).toHaveValue('2');
  await expect(detail).toHaveAttribute('open','');
  expect(await page.evaluate(() => localStorage.getItem('sammakko-lite-2'))).toBe(before.storage);
  expect(found).toEqual([]);
});

for (const sample of [
  {kc:'M79-EQ1-SOLVE',detail:'#eq14-explain',content:':scope > h3',width:1280,height:720},
  {kc:'M-DEC-04',detail:'#decimal-why14',content:':scope > p',width:390,height:844},
]) {
  test(`audience disclosure exposes its beginning without driver assistance: ${sample.kc}`,async ({page},testInfo) => {
    await page.setViewportSize({width:sample.width,height:sample.height});
    if(sample.kc==='M79-EQ1-SOLVE')await page.emulateMedia({reducedMotion:'no-preference'});
    await page.goto(`/oppitunnit/presentations/${sample.kc}.html?step=3`);
    await moduleReady(page);
    if(sample.kc==='M-DEC-04'){
      expect(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
      await expect(page.locator('#lesson-body')).toHaveCSS('scroll-behavior','auto');
    }
    const detail=page.locator(sample.detail);
    await expect(detail).not.toHaveAttribute('open');
    await clickVisibleSummary(page,detail);
    const after=await expectBeginningWithoutAssistance(detail,sample.content);
    await audienceBoundary(page);
    await testInfo.attach('unassisted-disclosure-geometry',{body:JSON.stringify(after,null,2),contentType:'application/json'});
    await reviewImage(page, testInfo, `disclosure-${sample.kc}-opened.png`);
  });
}

test('teacher disclosure at the viewport edge exposes new content without a second scrolling action',async ({page},testInfo) => {
  await page.goto('/oppitunnit/lessons/M79-EQ1-SOLVE.html');
  await moduleReady(page);
  const detail=page.locator('#eq14-explain');
  await positionSummary(page,detail,'end');
  const before=await disclosureGeometry(detail,':scope > h3');
  expect(before.summary.bottom).toBeGreaterThan(before.frame.bottom-24);
  await clickVisibleSummary(page,detail);
  const after=await expectBeginningWithoutAssistance(detail,':scope > h3');
  expect(after.windowScroll).toBeGreaterThan(before.windowScroll);
  await testInfo.attach('unassisted-teacher-disclosure',{body:JSON.stringify({before,after},null,2),contentType:'application/json'});
  await reviewImage(page, testInfo, 'teacher-edge-disclosure-opened.png');
});

test('a disclosure exposes both its introduction and the first relevant control when they fit',async ({page},testInfo) => {
  await page.goto('/oppitunnit/lessons/M-FRAC-01.html');
  await moduleReady(page);
  const detail=page.locator('details[data-lesson-role="worked-example"]').filter({has:page.getByText('Tutki reunajaon mallia',{exact:true})});
  await expect(detail).toHaveCount(1);
  await expect(detail).not.toHaveAttribute('open');
  await positionSummary(page,detail,'end');
  const before=await disclosureGeometry(detail,':scope > p');
  expect(before.summary.bottom).toBeGreaterThan(before.frame.bottom-24);
  await clickVisibleSummary(page,detail);
  // Do not use click(), focus(), scrollIntoView(), or a driver visibility aid
  // on the newly exposed button. Seeing only the introductory paragraph is
  // insufficient: the adjacent action must be usable in the same view.
  await expect.poll(async () => {
    const introduction=await disclosureGeometry(detail,':scope > p');
    const control=await disclosureGeometry(detail,':scope > button[data-frac-demo]');
    return introduction.beginningVisible && control.fullBeginningFits && control.beginningVisible;
  },{message:'The introduction and Näytä reunajako button fit together and must appear after the single disclosure action'}).toBe(true);
  const introduction=await disclosureGeometry(detail,':scope > p');
  const control=await disclosureGeometry(detail,':scope > button[data-frac-demo]');
  await expect(detail.locator(':scope > button[data-frac-demo]')).toBeEnabled();
  await testInfo.attach('unassisted-first-relevant-control',{body:JSON.stringify({before,introduction,control},null,2),contentType:'application/json'});
  await reviewImage(page, testInfo, 'teacher-first-action-visible-M-FRAC-01.png');
});

test('an already visible disclosure beginning does not move the reading position',async ({page},testInfo) => {
  await page.goto('/oppitunnit/presentations/M79-EQ1-SOLVE.html?step=3');
  await moduleReady(page);
  const detail=page.locator('#eq14-explain');
  const before=await disclosureGeometry(detail,':scope > h3');
  await clickVisibleSummary(page,detail);
  await expectBeginningWithoutAssistance(detail,':scope > h3');
  await renderedFrames(page,5);
  const after=await disclosureGeometry(detail,':scope > h3');
  expect(after.windowScroll).toBeCloseTo(before.windowScroll,0);
  expect(after.lessonScroll).toBeCloseTo(before.lessonScroll,0);
  await reviewImage(page, testInfo, 'disclosure-visible-no-jump.png');
});

test('dynamic and nested table-model disclosures preserve the current learner response',async ({page},testInfo) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/oppitunnit/presentations/M-MULTAB-ALL.html?step=2');
  await moduleReady(page);
  const response=page.locator('[data-answer="0"]');
  await response.fill('1');
  await page.locator('[data-action="check"]').click();
  await expect(page.locator('[data-feedback]')).toHaveAttribute('data-result','retry');
  const before=await page.evaluate(() => ({storage:localStorage.getItem('sammakko-lite-2'),feedback:document.querySelector('[data-feedback]')?.textContent}));
  const model=page.locator('[data-tables-lab] details[data-lesson-role="worked-example"]');
  await positionSummary(page,model,'end');
  await clickVisibleSummary(page,model);
  await expectBeginningWithoutAssistance(model,':scope > [data-model-view]');
  await reviewImage(page, testInfo, 'dynamic-model-opened.png');
  const nested=model.locator('details[data-model-tools]');
  await positionSummary(page,nested,'end');
  await clickVisibleSummary(page,nested);
  await expectBeginningWithoutAssistance(nested,':scope > label');
  await expect(response).toHaveValue('1');
  await expect(page.locator('[data-feedback]')).toHaveAttribute('data-result','retry');
  expect(await page.evaluate(() => ({storage:localStorage.getItem('sammakko-lite-2'),feedback:document.querySelector('[data-feedback]')?.textContent}))).toEqual(before);
  await audienceBoundary(page);
  await reviewImage(page, testInfo, 'dynamic-nested-controls-opened.png');
});

test('keyboard disclosure keeps focus, stage changes hide old focus, and direct audience exit stays public',async ({page},testInfo) => {
  await page.goto('/oppitunnit/presentations/M-DEC-04.html?step=3');
  await moduleReady(page);
  const detail=page.locator('#decimal-why14'), summary=detail.locator(':scope > summary');
  await summary.focus();
  await page.keyboard.press('Enter');
  await expectBeginningWithoutAssistance(detail,':scope > p');
  await expect(summary).toBeFocused();
  await page.locator('[data-audience-next]').click();
  const active=page.locator('[data-audience-step]:not([hidden])');
  await expect(active).toBeFocused();
  await expect(page.locator('[data-step-count]')).toHaveText(/^4 \/ /);
  await audienceBoundary(page);
  await page.locator('[data-case]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-step-count]')).toHaveText(/^4 \/ /);
  await openAudienceTools(page);
  const home=page.locator('[data-audience-tools] a[href="/"]');
  await expect(home).toBeVisible();
  await expect(page.locator('[data-audience-tools] a[href*="/lessons/"]')).toHaveCount(0);
  await reviewImage(page, testInfo, 'audience-safe-exit-tools.png');
  await home.click();
  await expect(page).toHaveURL(/\/$/);
});
