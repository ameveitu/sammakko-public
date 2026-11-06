import {reviewImage} from './review-image';
import {createHash} from 'node:crypto';
import {expect,test,type Page} from '@playwright/test';

const teacherOnly='.teacher,[data-shell-teacher],[data-lesson-role="teacher-note"],[data-lesson-role="metadata"],.research-links';
async function openAudienceTools(page:Page){
 const tools=page.locator('[data-audience-tools]');
 if(!await tools.evaluate(element=>(element as HTMLDetailsElement).open))await tools.locator(':scope > summary').click();
 await expect(tools).toHaveAttribute('open','');
}
async function expectAudienceBoundary(page:Page){
 await expect(page.locator('body')).toHaveClass(/audience/);
 await expect(page.locator(teacherOnly)).toHaveCount(0);
 await expect(page.locator('section[data-game-kind],#prerequisites,.support-details')).toHaveCount(0);
 expect(await page.content()).not.toContain('Lukusanojen sarja annetaan tässä tukena');
 await expect(page.locator('[data-audience-step]:not([hidden])')).toHaveCount(1);
 const inactive=await page.locator('[data-audience-step][hidden]').evaluateAll(steps=>steps.every(s=>(s as HTMLElement).inert));
 expect(inactive).toBe(true);
}

test('separate audience tab excludes teacher DOM and returns to unchanged preparation',async({page,context},testInfo)=>{
 await page.setViewportSize({width:1280,height:720});await page.emulateMedia({reducedMotion:'reduce'});
 const id='M-NUM-1TO1',prep=`/oppitunnit/lessons/${id}.html`;
 await page.goto(prep);await expect(page.locator('main')).toHaveAttribute('data-kc',id);
 await page.locator('[data-shell-teacher]>summary').click();await expect(page.locator('[data-shell-teacher]')).toHaveAttribute('open','');
 const before=await page.evaluate(()=>({storage:localStorage.getItem('sammakko-lite-2'),url:location.href}));
 const popup=context.waitForEvent('page');await page.locator('#mode').click();const audience=await popup;
 const runtimeErrors:string[]=[];audience.on('pageerror',e=>runtimeErrors.push(e.message));await audience.waitForLoadState();
 await expect(audience).toHaveURL(new RegExp(`/oppitunnit/presentations/${id}\\.html$`));await expectAudienceBoundary(audience);
 await expect(audience.locator('[data-module-status]')).toHaveText(/Harjoitus käytettävissä|Voit jatkaa/);
 const response=await audience.request.get(`/oppitunnit/presentations/${id}.html`);expect(response.ok()).toBe(true);
 expect(await response.text()).not.toContain('Lukusanojen sarja annetaan tässä tukena');
 await audience.getByRole('link',{name:'Näytä laskeminen vaiheittain'}).click();
 await expect(audience.locator('[data-step-count]')).toHaveText(/^5 \/ /);
 await audience.locator('[data-action="step"]').click();await expect(audience.locator('[data-demo-view]')).toHaveText('Osoita yhtä marjaa: yksi.');
 await audience.locator('[data-audience-pause]').click();await expect(audience.locator('[data-audience-pause]')).toHaveAttribute('aria-pressed','true');
 await openAudienceTools(audience);
 await audience.locator('[data-audience-reset]').click();await expect(audience.locator('[data-step-count]')).toHaveText(/^1 \/ /);
 await expect(audience.locator('[data-audience-pause]')).toHaveAttribute('aria-pressed','false');
 await expect(audience.locator('[data-demo-view]')).toHaveText('Aloita mallin ensimmäisestä vaiheesta.');
 await audience.locator('[data-audience-next]').click();await expect(audience.locator('[data-step-count]')).toHaveText(/^2 \/ /);
 await audience.keyboard.press('ArrowRight');await expect(audience.locator('[data-step-count]')).toHaveText(/^3 \/ /);
 await expectAudienceBoundary(audience);
 await reviewImage(audience, testInfo, 'audience-step-no-teacher.png');
 await openAudienceTools(audience);
 await Promise.all([
  audience.waitForEvent('close'),
  audience.locator('[data-audience-close]').click().catch(error=>{
   // Firefox can close the popup before acknowledging the click that closed it.
   if(!audience.isClosed()||!(error instanceof Error)||error.message.split('\n',1)[0]!=='locator.click: Target page, context or browser has been closed')throw error;
  }),
 ]);
 await page.bringToFront();
 await expect(page).toHaveURL(before.url);await expect(page.locator('[data-shell-teacher]')).toHaveAttribute('open','');
 expect(await page.evaluate(()=>localStorage.getItem('sammakko-lite-2'))).toBe(before.storage);expect(runtimeErrors).toEqual([]);
});

test('audience deep step, deliberate answer disclosure and reset work at narrow width',async({page},testInfo)=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 const base='/oppitunnit/presentations/M-MEAS-00.html';await page.goto(base);
 const index=await page.locator('details[data-lesson-role="answer"]').first().evaluate(d=>Number((d.closest('[data-audience-step]') as HTMLElement).dataset.audienceStep));
 expect(Number.isInteger(index)).toBe(true);await page.goto(`${base}?step=${index+1}`);
 await expectAudienceBoundary(page);await expect(page.locator('[data-step-count]')).toHaveText(new RegExp(`^${index+1} / `));
 const answer=page.locator('[data-audience-step]:not([hidden]) details[data-lesson-role="answer"]').first();
 await expect(answer).not.toHaveAttribute('open');await answer.locator('summary').click();await expect(answer).toHaveAttribute('open','');
 await openAudienceTools(page);
 await page.locator('[data-audience-reset]').click();await expect(page.locator('details[data-lesson-role="answer"][open]')).toHaveCount(0);
 await expect(page.locator('[data-step-count]')).toHaveText(/^1 \/ /);await expect(page).toHaveURL(/\/oppitunnit\/presentations\/M-MEAS-00\.html$/);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await reviewImage(page, testInfo, 'audience-mobile-reset.png');
});

test('served release identifies exact current HTML, audience module and assets through publication server',async({request})=>{
 const releaseResponse=await request.get('/release.json');expect(releaseResponse.ok()).toBe(true);
 const release=await releaseResponse.json() as {schema:string,sourceCommit:string|null,publication:{mode:string,publicOrigin:string|null,authorTbd:boolean,contactTbd:boolean},presentationPages:number,files:Record<string,{bytes:number,sha256:string}>};
 expect(release.schema).toBe('sammakko-site-release/1');expect(release.presentationPages).toBe(181);
 if(process.env.EXPECTED_RELEASE_SHA)expect(release.sourceCommit).toBe(process.env.EXPECTED_RELEASE_SHA);
 if(release.publication.mode==='preview'){expect(release.publication.publicOrigin).toBeNull();expect(release.publication.contactTbd).toBe(true);}
 expect(release.publication.authorTbd).toBe(false);
 const about=await request.get('/tietoa/');
 expect(await about.text()).toContain('<span data-publication-author>Veikko Tuominen</span>');
 for(const name of ['index.html','oppitunnit/presentations/M-NUM-1TO1.html','oppitunnit/assets/audience.js','oppitunnit/content/M-NUM-1TO1/lesson.mjs','lite/lite-runtime.json','lite/art/backgrounds/lake-shore.webp']){
  expect(release.files[name],name).toBeDefined();const served=await request.get('/'+name);expect(served.ok(),name).toBe(true);const bytes=await served.body();
  expect(bytes.length,name).toBe(release.files[name]!.bytes);expect(createHash('sha256').update(bytes).digest('hex'),name).toBe(release.files[name]!.sha256);
  expect(served.headers()['x-content-type-options']).toBe('nosniff');expect(served.headers()['cache-control']).toContain('no-cache');
 }
});

test('audience links to a group of examples activate its first actual teaching stage',async({page})=>{
 await page.goto('/oppitunnit/presentations/M-MULTAB-ALL.html?step=4');
 await expect(page.locator('[data-module-status]')).toHaveText(/Harjoitus käytettävissä|Voit jatkaa/);
 await page.getByRole('link',{name:'Katso kaksi esimerkkiä'}).click();
 await expect(page.locator('[data-audience-step]:not([hidden]) h3')).toHaveText('7 × 8 auttaa laskussa 7 × 9');
 await expect(page.locator('[data-step-count]')).toHaveText(/^5 \/ /);
 await expectAudienceBoundary(page);
});
