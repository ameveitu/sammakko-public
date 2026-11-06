import {reviewImage} from './review-image';
import {readFileSync} from 'node:fs';
import {expect, test, type Locator, type Page} from '@playwright/test';

// Run through the packaged publication in every configured engine. Assertions
// observe the live lesson; no synthetic check, reset or input event stands in
// for the learner's own action.
const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(async ({page}) => {
  await page.setViewportSize({width:1280,height:720});
  await page.emulateMedia({reducedMotion:'reduce'});
  const errors:string[]=[];
  browserErrors.set(page,errors);
  page.on('pageerror',error=>errors.push(error.message));
});
test.afterEach(async ({page}) => {
  expect(browserErrors.get(page)).toEqual([]);
  await expect(page.locator('[data-module-status][data-error],[data-lesson-context][data-context-error]')).toHaveCount(0);
});

const activeStage = (page:Page) => page.locator('[data-audience-step]:not([hidden])');
const contextAt = (page:Page,key:string) => page.locator(`[data-lesson-context="${key}"]`);

async function ready(page:Page) {
  await expect(page.locator('[data-module-status]')).toHaveText(/Harjoitus käytettävissä|Voit jatkaa/);
}

async function storage(page:Page) {
  return page.evaluate(()=>Object.fromEntries(Object.keys(localStorage).sort().map(key=>[key,localStorage.getItem(key)])));
}

async function goToStage(page:Page,target:number) {
  const counter=page.locator('[data-step-count]');
  const current=Number((await counter.innerText()).split('/')[0].trim());
  const direction=target>current?'[data-audience-next]':'[data-audience-prev]';
  for(let index=current;index!==target;index+=target>current?1:-1) await page.locator(direction).click();
  await expect(counter).toHaveText(new RegExp(`^${target} / `));
  await expect(activeStage(page)).toHaveCount(1);
}

async function openDetails(details:Locator) {
  if(!(await details.evaluate(element=>(element as HTMLDetailsElement).open))) {
    await details.locator(':scope > summary').click();
  }
  await expect(details).toHaveAttribute('open','');
}

async function openContext(context:Locator) {
  // The 9 × 9 extension deliberately remains inside its optional outer panel.
  const ancestors=context.locator('xpath=ancestor::details');
  for(let index=0;index<await ancestors.count();index++) await openDetails(ancestors.nth(index));
  await openDetails(context);
  const slot=context.locator('[data-context-slot]');
  await expect(slot.locator('[data-lesson-context-source]')).toHaveCount(1);
  return slot;
}

async function closeContext(context:Locator) {
  await context.locator('[data-context-close]').click();
  await expect(context).not.toHaveAttribute('open');
  await expect(context.locator('[data-context-slot] [data-lesson-context-source]')).toHaveCount(0);
  await expect(context.locator(':scope > summary')).toBeFocused();
}

async function resetAudience(page:Page) {
  await openDetails(page.locator('[data-audience-tools]'));
  await page.locator('[data-audience-reset]').click();
  await expect(page.locator('[data-step-count]')).toHaveText(/^1 \/ /);
  await expect(page.locator('#lesson-body details[open]')).toHaveCount(0);
  await expect(page.locator('[data-context-slot] [data-lesson-context-source]')).toHaveCount(0);
}

test('2 + 2 opens in its own stage, preserves original work and resets context state explicitly',async ({page},testInfo)=>{
  await page.goto('/oppitunnit/presentations/M-ADD-01.html?step=2');
  await ready(page);
  const savedStorage=await storage(page);
  const original=page.locator('[data-add-lab]');
  await original.locator('[data-add-case]').selectOption('2');
  await original.locator('[data-add-total]').fill('2');
  await original.locator('[data-add-action="check"]').click();
  await expect(original.locator('[data-add-feedback]')).toHaveAttribute('data-result','retry');
  const originalFeedback=await original.locator('[data-add-feedback]').innerText();
  await openDetails(original.locator('details[data-lesson-role="worked-example"]'));
  await original.locator('[data-add-action="step"]').click();
  const originalScene=await original.locator('[data-add-view] svg').getAttribute('aria-label');

  await goToStage(page,4);
  const context=contextAt(page,'add-equal');
  await expect(context).not.toHaveAttribute('open');
  const slot=await openContext(context);
  await expect(page.locator('[data-step-count]')).toHaveText(/^4 \/ /);
  await expect(slot.locator('[data-add-case]')).toHaveValue('1');
  await expect(slot.locator('[data-add-total]')).toHaveValue('');
  await expect(slot.locator('[data-add-feedback]')).not.toHaveAttribute('data-result');
  await expect(slot.locator('[data-add-action="stop"]')).toBeDisabled();
  const model=slot.locator('details[data-lesson-role="worked-example"]');
  await expect(model).toHaveAttribute('open','');
  await expect(slot.locator('details[data-lesson-role="answer"][open],details[data-lesson-role="hint"][open]')).toHaveCount(0);
  await expect(slot.locator('[data-add-view] svg')).toHaveAttribute('aria-label',/^2 ja 2 palaa/);
  await expect(slot.locator('[data-add-view] [data-piece]')).toHaveCount(4);
  await reviewImage(page, testInfo, 'context-add-equal.png');
  await slot.locator('[data-add-total]').fill('3');
  await slot.locator('[data-add-action="step"]').click();
  await expect(slot.locator('[data-add-view] [data-joined="true"]')).toHaveCount(1);
  await closeContext(context);

  await openContext(context);
  await expect(slot.locator('[data-add-total]')).toHaveValue('3');
  await expect(slot.locator('[data-add-feedback]')).not.toHaveAttribute('data-result');
  await expect(model).toHaveAttribute('open','');
  await expect(slot.locator('details[data-lesson-role="answer"][open],details[data-lesson-role="hint"][open]')).toHaveCount(0);
  await expect(slot.locator('[data-add-view] [data-joined="true"]')).toHaveCount(1);
  await goToStage(page,2);
  await expect(context).not.toHaveAttribute('open');
  await expect(original.locator('[data-add-case]')).toHaveValue('2');
  await expect(original.locator('[data-add-total]')).toHaveValue('2');
  await expect(original.locator('[data-add-feedback]')).toHaveText(originalFeedback);
  await expect(original.locator('[data-add-feedback]')).toHaveAttribute('data-result','retry');
  await expect(original.locator('[data-add-view] svg')).toHaveAttribute('aria-label',originalScene!);

  await resetAudience(page);
  await goToStage(page,4);
  await openContext(context);
  await expect(slot.locator('[data-add-case]')).toHaveValue('1');
  await expect(slot.locator('[data-add-total]')).toHaveValue('');
  await expect(slot.locator('[data-add-feedback]')).not.toHaveAttribute('data-result');
  await expect(slot.locator('[data-add-view] [data-joined="true"]')).toHaveCount(0);
  expect(await storage(page)).toEqual(savedStorage);
});

test('9 × 9 context keeps its own model choices and leaves the original exercise untouched',async ({page},testInfo)=>{
  await page.goto('/oppitunnit/presentations/M-MULTAB-ALL.html?step=2');
  await ready(page);
  const savedStorage=await storage(page);
  const original=page.locator('[data-tables-lab]');
  await original.locator('[data-kind]').selectOption('factor');
  await original.locator('[data-factor-a]').selectOption('4');
  await original.locator('[data-factor-b]').selectOption('6');
  await original.locator('[data-answer="0"]').fill('99');
  await original.locator('[data-action="check"]').click();
  await expect(original.locator('[data-feedback]')).toHaveAttribute('data-result','retry');
  const originalFeedback=await original.locator('[data-feedback]').innerText();
  await openDetails(original.locator('details[data-lesson-role="worked-example"]'));
  await openDetails(original.locator('[data-model-tools]'));
  await original.locator('[data-model-a]').selectOption('2');
  await original.locator('[data-model-b]').selectOption('3');

  await goToStage(page,9);
  const context=contextAt(page,'tables-nine');
  const slot=await openContext(context);
  await expect(page.locator('[data-step-count]')).toHaveText(/^9 \/ /);
  await expect(slot.locator('[data-model-a]')).toHaveValue('9');
  await expect(slot.locator('[data-model-b]')).toHaveValue('9');
  await expect(slot.locator('[data-answer="0"]')).toHaveValue('');
  await expect(slot.locator('[data-feedback]')).not.toHaveAttribute('data-result');
  const model=slot.locator('details[data-lesson-role="worked-example"]');
  await expect(model).toHaveAttribute('open','');
  await expect(slot.locator('details[data-lesson-role="answer"][open],details[data-lesson-role="hint"][open]')).toHaveCount(0);
  await expect(slot.locator('[data-model-view] [data-dot]')).toHaveCount(81);
  await expect(slot.locator('[data-model-view] svg')).toHaveAttribute('aria-label',/^9 riviä, 9 pistettä/);
  await reviewImage(page, testInfo, 'context-tables-nine.png');
  await slot.locator('[data-action="plus"]').click();
  await expect(slot.locator('[data-model-b]')).toHaveValue('10');
  await closeContext(context);
  await openContext(context);
  await expect(slot.locator('[data-model-a]')).toHaveValue('9');
  await expect(slot.locator('[data-model-b]')).toHaveValue('10');
  await expect(slot.locator('[data-feedback]')).not.toHaveAttribute('data-result');
  await expect(model).toHaveAttribute('open','');
  await expect(slot.locator('details[data-lesson-role="answer"][open],details[data-lesson-role="hint"][open]')).toHaveCount(0);

  await goToStage(page,2);
  await expect(original.locator('[data-kind]')).toHaveValue('factor');
  await expect(original.locator('[data-factor-a]')).toHaveValue('4');
  await expect(original.locator('[data-factor-b]')).toHaveValue('6');
  await expect(original.locator('[data-answer="0"]')).toHaveValue('99');
  await expect(original.locator('[data-feedback]')).toHaveText(originalFeedback);
  await expect(original.locator('[data-feedback]')).toHaveAttribute('data-result','retry');
  await expect(original.locator('[data-model-a]')).toHaveValue('2');
  await expect(original.locator('[data-model-b]')).toHaveValue('3');
  await resetAudience(page);
  await goToStage(page,9);
  await openContext(context);
  await expect(slot.locator('[data-model-a]')).toHaveValue('9');
  await expect(slot.locator('[data-model-b]')).toHaveValue('9');
  await expect(slot.locator('[data-answer="0"]')).toHaveValue('');
  expect(await storage(page)).toEqual(savedStorage);
});

test('paused context transitions recompute disabled controls for the active model state',async ({page})=>{
  await page.goto('/oppitunnit/presentations/M-MULTAB-ALL.html?step=2');
  await ready(page);
  const savedStorage=await storage(page);
  const original=page.locator('[data-tables-lab]');
  await openDetails(original.locator('details[data-lesson-role="worked-example"]'));
  await openDetails(original.locator('[data-model-tools]'));
  await original.locator('[data-model-b]').selectOption('10');
  await expect(original.locator('[data-action="plus"]')).toBeDisabled();
  await page.locator('[data-audience-pause]').click();
  await expect(page.locator('[data-audience-pause]')).toHaveAttribute('aria-pressed','true');
  await goToStage(page,9);
  const context=contextAt(page,'tables-nine');
  const slot=await openContext(context);
  await expect(slot.locator('[data-model-b]')).toHaveValue('9');
  await expect(slot.locator('[data-action="plus"]')).toBeDisabled();
  await page.locator('[data-audience-pause]').click();
  await expect(slot.locator('[data-action="plus"]')).toBeEnabled();

  await page.locator('[data-audience-pause]').click();
  await expect(context.locator('[data-context-close]')).toBeEnabled();
  await closeContext(context);
  await goToStage(page,2);
  await expect(page.locator('[data-audience-pause]')).toHaveAttribute('aria-pressed','true');
  await page.locator('[data-audience-pause]').click();
  await expect(original.locator('[data-model-b]')).toHaveValue('10');
  await expect(original.locator('[data-action="plus"]')).toBeDisabled();
  expect(await storage(page)).toEqual(savedStorage);
});

test('own notebook edits retain wrong, missing and invalid entries without inventing observations or success',async ({page},testInfo)=>{
  await page.goto('/oppitunnit/presentations/SCI-ENV-RECORD-01.html?step=7');
  await ready(page);
  const savedStorage=await storage(page);
  await page.locator('[data-record-row="0"]').fill('3');
  await expect(page.locator('[data-record-row="1"]')).toHaveValue('');
  await goToStage(page,8);
  await page.locator('[data-poster-row="0"]').selectOption('penkki');
  await page.locator('[data-poster-row="1"]').selectOption('kivi');
  await expect(page.locator('[data-notebook-reference]')).toContainText('Vastaamatta');
  await expect(page.locator('[data-poster] svg')).toHaveAttribute('aria-label',/Penkki, 3.*Kiven vieri, määrä puuttuu/);
  await expect(page.locator('[data-feedback]')).toHaveAttribute('data-result','neutral');
  await reviewImage(page, testInfo, 'context-own-record-wrong-and-missing.png');

  const context=contextAt(page,'record-edit');
  const slot=await openContext(context);
  await expect(page.locator('[data-step-count]')).toHaveText(/^8 \/ /);
  await expect(slot.locator('[data-record-row="0"]')).toHaveValue('3');
  await expect(slot.locator('[data-record-row="1"]')).toHaveValue('');
  await slot.locator('[data-record-row="0"]').fill('9');
  await expect(page.locator('[data-notebook-reference]')).toContainText('Tarkista luku');
  await expect(page.locator('[data-poster-row="0"] option[value="penkki"]')).toContainText('Tarkista luku');
  await expect(page.locator('[data-notebook-reference]')).toContainText('Vastaamatta');
  await expect(page.locator('[data-poster]')).toContainText('Korjaa');
  await expect(page.locator('[data-poster] svg')).toHaveCount(0);
  await expect(page.locator('[data-feedback]')).toHaveAttribute('data-result','neutral');
  await closeContext(context);
  await expect(page.locator('[data-notebook-reference]')).toContainText('Tarkista luku');
  await reviewImage(page, testInfo, 'context-own-record-invalid.png');
  await openContext(context);
  await expect(slot.locator('[data-record-row="0"]')).toHaveValue('9');
  await slot.locator('[data-record-row="0"]').fill('2');
  await slot.locator('[data-record-row="1"]').fill('1');
  await closeContext(context);
  await expect(page.locator('[data-poster-row="0"]')).toHaveValue('penkki');
  await expect(page.locator('[data-poster-row="1"]')).toHaveValue('kivi');
  await expect(page.locator('[data-poster] svg')).toHaveAttribute('aria-label',/Penkki, 2.*Kiven vieri, 1/);
  await expect(page.locator('[data-feedback]')).toHaveAttribute('data-result','neutral');
  await page.locator('[data-action="check"]').click();
  await expect(page.locator('[data-feedback]')).toHaveAttribute('data-result','correct');
  await openContext(context);
  await slot.locator('[data-record-row="0"]').fill('');
  await expect(page.locator('[data-feedback]')).toHaveAttribute('data-result','neutral');
  await closeContext(context);
  await expect(page.locator('[data-notebook-reference]')).toContainText('Vastaamatta');
  await expect(page.locator('[data-poster] svg')).toHaveAttribute('aria-label',/Penkki, määrä puuttuu.*Kiven vieri, 1/);
  await resetAudience(page);
  await goToStage(page,8);
  await expect(page.locator('[data-notebook-reference]')).toContainText('Vastaamatta');
  await expect(page.locator('[data-poster-row="0"]')).toHaveValue('');
  await expect(page.locator('[data-poster-row="1"]')).toHaveValue('');
  await expect(page.locator('[data-feedback]')).toHaveAttribute('data-result','neutral');
  expect(await storage(page)).toEqual(savedStorage);
});

test('context keyboard opening preserves focus and stage exit hides old content on mobile',async ({page},testInfo)=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/oppitunnit/presentations/M-ADD-01.html?step=4');
  await ready(page);
  const context=contextAt(page,'add-equal');
  const summary=context.locator(':scope > summary');
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(context).toHaveAttribute('open','');
  await expect(context.locator('[data-context-slot] [data-add-case]')).toHaveValue('1');
  // Reading assertions below do not focus or scroll the newly exposed control.
  await expect(summary).toBeFocused();
  await expect.poll(async()=>context.locator('[data-add-case]').evaluate(control=>{
    const rect=control.getBoundingClientRect();
    const area=document.querySelector('#lesson-body')!.getBoundingClientRect();
    const x=rect.left+Math.min(20,rect.width/2),y=rect.top+rect.height/2;
    const hit=document.elementFromPoint(x,y);
    return rect.top>=Math.max(0,area.top)-1&&rect.bottom<=Math.min(innerHeight,area.bottom)+1&&!!hit&&(hit===control||control.contains(hit));
  }),{message:'Opening a context should expose its first usable control without a second scrolling action'}).toBe(true);
  await reviewImage(page, testInfo, 'context-add-mobile-keyboard.png');
  await page.locator('[data-audience-pause]').click();
  await expect(context.locator('[data-add-case]')).toBeDisabled();
  await expect(context.locator('[data-context-close]')).toBeEnabled();
  await closeContext(context);
  await expect(page.locator('[data-audience-pause]')).toHaveAttribute('aria-pressed','true');
  await page.locator('[data-audience-pause]').click();
  await openContext(context);
  await expect(context.locator('[data-add-case]')).toBeEnabled();
  await expect(context.locator('[data-add-action="stop"]')).toBeDisabled();
  await page.locator('[data-audience-next]').click();
  await expect(context).not.toHaveAttribute('open');
  await expect(context.locator('[data-context-slot] [data-lesson-context-source]')).toHaveCount(0);
  await expect(activeStage(page)).toBeFocused();
  expect(await page.locator('[data-audience-step][hidden]').evaluateAll(steps=>steps.every(step=>(step as HTMLElement).inert))).toBe(true);
  const answer=activeStage(page).locator('details[data-lesson-role="answer"]');
  await openDetails(answer);
  await goToStage(page,6);
  await goToStage(page,5);
  await expect(answer).not.toHaveAttribute('open');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});

test('teacher context stays in the preparation stage and a separate presentation starts cleanly',async ({page,context:browserContext},testInfo)=>{
  await page.goto('/oppitunnit/lessons/M-ADD-01.html?step=4');
  await ready(page);
  await page.locator('[data-teacher-step]').selectOption('3');
  const context=contextAt(page,'add-equal');
  const slot=await openContext(context);
  await slot.locator('[data-add-total]').fill('3');
  await expect(page.locator('[data-teacher-count]')).toHaveText(/^4 \/ /);
  const launch=page.locator('[data-teacher-presentation]');
  await expect(launch).toHaveAttribute('href',/\/presentations\/M-ADD-01\.html\?step=4$/);
  const before=await storage(page);
  const popup=browserContext.waitForEvent('page');
  await launch.click();
  const audience=await popup;
  const errors:string[]=[];
  audience.on('pageerror',error=>errors.push(error.message));
  await audience.waitForLoadState();
  await ready(audience);
  await expect(audience.locator('[data-step-count]')).toHaveText(/^4 \/ /);
  await expect(audience.locator('[data-lesson-role="teacher-note"],[data-lesson-role="metadata"],.teacher,[data-shell-teacher]')).toHaveCount(0);
  const cleanContext=contextAt(audience,'add-equal');
  await expect(cleanContext).not.toHaveAttribute('open');
  const cleanSlot=await openContext(cleanContext);
  await expect(cleanSlot.locator('[data-add-case]')).toHaveValue('1');
  await expect(cleanSlot.locator('[data-add-total]')).toHaveValue('');
  await audience.close();
  await page.bringToFront();
  await expect(context).toHaveAttribute('open','');
  await expect(slot.locator('[data-add-total]')).toHaveValue('3');
  await expect(page.locator('[data-teacher-count]')).toHaveText(/^4 \/ /);
  expect(await storage(page)).toEqual(before);
  expect(errors).toEqual([]);
  await reviewImage(page, testInfo, 'context-teacher-return-preserves-work.png');

  // The teacher's module-local reset must use the same context teardown as the
  // audience toolbar; restoring a stale borrowed snapshot after reset is wrong.
  await openDetails(page.locator('[data-lesson-module] > details.module-tools'));
  await page.locator('[data-module-action="reset"]').click();
  await expect(context).not.toHaveAttribute('open');
  await expect(context.locator('[data-context-slot] [data-lesson-context-source]')).toHaveCount(0);
  await expect(page.locator('[data-teaching-step="2"] [data-add-lab]')).toHaveCount(1);
  await expect(page.locator('[data-add-case]')).toHaveValue('0');
  await expect(page.locator('[data-add-total]')).toHaveValue('');
  await page.locator('[data-teacher-step]').selectOption('3');
  await openContext(context);
  await expect(slot.locator('[data-add-case]')).toHaveValue('1');
  await expect(slot.locator('[data-add-total]')).toHaveValue('');
  await expect(slot.locator('[data-add-feedback]')).not.toHaveAttribute('data-result');
  expect(await storage(page)).toEqual(before);
});

type AnchorRow={kc:string;fromStep:number;toStep:number};
const anchors=JSON.parse(readFileSync(new URL('../../docs/ux/baseline/lesson-anchor-inventory.json',import.meta.url),'utf8')) as AnchorRow[];
const backwards=anchors.filter(row=>row.toStep<row.fromStep);
const affected=[...new Set(backwards.map(row=>row.kc))].sort();

for(const kc of affected){
  test(`every audited context keeps the current task and restores one live source: ${kc}`,async({page})=>{
    const steps=[...new Set(backwards.filter(row=>row.kc===kc).map(row=>row.fromStep))].sort((a,b)=>a-b);
    await page.goto(`/oppitunnit/presentations/${kc}.html?step=${steps[0]}`);
    await ready(page);
    const savedStorage=await storage(page);
    for(const number of steps){
      await goToStage(page,number);
      const contexts=activeStage(page).locator('[data-lesson-context]');
      const expected=backwards.filter(row=>row.kc===kc&&row.fromStep===number).length;
      await expect(contexts).toHaveCount(expected);
      for(let index=0;index<expected;index++){
        const context=contexts.nth(index),sourceKey=await context.getAttribute('data-context-source');
        expect(sourceKey).toBeTruthy();
        const source=page.locator(`[data-lesson-context-source="${sourceKey}"]`);
        await expect(source).toHaveCount(1);
        const live=await source.elementHandle();
        expect(live).not.toBeNull();
        const home=await live!.evaluateHandle(element=>element.parentElement);
        const slot=await openContext(context);
        await expect(page.locator('[data-step-count]')).toHaveText(new RegExp(`^${number} / `));
        expect(await slot.evaluate((element,original)=>element.contains(original),live!)).toBe(true);
        await expect(source).toHaveCount(1);
        expect(await source.evaluate(element=>element.closest('[hidden],[inert]')===null)).toBe(true);
        await closeContext(context);
        expect(await live!.evaluate((element,parent)=>element.parentElement===parent,home)).toBe(true);
        await expect(source).toHaveCount(1);
        await home.dispose();
        await live!.dispose();
      }
    }
    expect(await storage(page)).toEqual(savedStorage);
  });
}
