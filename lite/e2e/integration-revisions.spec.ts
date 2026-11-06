import {test,expect,type Page} from '@playwright/test';
import {decimalLedgerSpec} from '../src/content/decimal-ledger';
import {integrationExplanationSpecs,integrationExplanationEvidence} from '../src/content/integration-explanations';
import {rng} from '../src/engine/rng';
// These checks cover the opt-in adult review; solo play (the default) has its own spec.
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { try { localStorage.setItem('sammakko-saaristo-adult-review', 'on'); } catch { /* storage blocked */ } }); });
test.use({viewport:{width:1024,height:768},reducedMotion:'reduce',launchOptions:{args:['--enable-unsafe-swiftshader']}});
const button=(p:Page,name:string)=>p.getByRole('button',{name,exact:true});
const field=(p:Page,name:string)=>p.getByLabel(name,{exact:true});
const state=(p:Page)=>p.evaluate(()=>JSON.parse(window.render_game_to_text!()));
const saved=(p:Page)=>p.evaluate(()=>JSON.parse(localStorage.getItem('sammakko-journey-3')??'{"attempts":[]}'));
async function open(p:Page,id:string){await p.goto(`./?qa=1&seed=7#saaristo/${id}`);await button(p,'Kokeilen itse').press('Enter');}
async function ledger(p:Page,wrong=false){
  const s=await state(p),t=decimalLedgerSpec.item(rng(s.seed),s.phase).task;if(t.kind!=='decimal-ledger')throw Error('ledger');
  let cents=BigInt(t.startHundredths);
  for(const [i,c] of t.changes.entries()){
    cents+=BigInt(c.hundredths)*(c.direction==='+'?1n:-1n);
    await field(p,`Määrä tapahtuman ${i+1} jälkeen`).fill(`${wrong&&i===0?cents+1n:cents}/100`);
  }await button(p,'Tarkista koko varauskirja').press('Enter');
}
test('decimal integration rejects the wrong intermediate even when the final amount is right, then supports independent transfer',async({page},info)=>{
  test.setTimeout(120000);await open(page,'M-DEC-07');await ledger(page,true);
  await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok','false');
  expect((await saved(page)).attempts.at(-1)).toMatchObject({ok:false,rev:'exp690-decimal-ledger-v2'});
  await page.screenshot({path:info.outputPath('ledger-intermediate-not-yet.png'),animations:'disabled'});
  await page.goto('./?qa=1&seed=11#saaristo/M-DEC-07');await button(page,'Kokeilen itse').press('Enter');
  for(let i=0;i<3;i++){await ledger(page);await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok','true');if(i<2)await button(page,'Seuraava kokeilu').press('Enter');}
  await button(page,'Kokeile uudessa tilanteessa').press('Enter');expect((await state(page)).phase).toBe('transfer');
  await ledger(page);expect((await state(page)).progress.checked).toBe(true);
});
for(const id of ['PHY79-PARALLEL','CHEM79-FIRE-SAFE','ENV-PHY-SPACE-01'])test(`own explanation ${id}: actual scene, fresh cases, private written handoff and transfer`,async({page},info)=>{
  test.setTimeout(180000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await open(page,id);expect((await state(page)).renderer).toBe('webgl');
  const count=Math.max(3,integrationExplanationEvidence[id]!.families.length),families=new Set<string>();
  for(let i=0;i<=count;i++){
    const s=await state(page);if(i<count)families.add(s.family);else expect(s.phase).toBe('transfer');
    if(i===1)await page.setViewportSize({width:768,height:1024});
    if(i===2)await page.setViewportSize({width:1024,height:768});
    await button(page,'Kirjoitan tähän').press('Enter');await field(page,'Oma selitykseni').fill(`PRIVATE_INTEGRATION_${id}_${i}`);
    await button(page,'Olen kirjoittanut selitykseni').press('Enter');
    const before=await saved(page);await button(page,'Vahvista havainto').press('Enter');expect(await saved(page)).toEqual(before);
    for(const select of await page.locator('[data-explanation-adult] select').all())await select.selectOption(await select.getAttribute('aria-label')==='Saiko oppija apua?'?'none':'met');
    await page.locator('[data-explanation-adult] input[type=checkbox]').check();
    if(i===0){
      await button(page,'Kerron omin sanoin').press('Enter');await button(page,'Olen kertonut selitykseni').press('Enter');
      await expect(page.locator('[data-explanation-adult] input[type=checkbox]')).not.toBeChecked();
      for(const select of await page.locator('[data-explanation-adult] select').all())await expect(select).toHaveValue(await select.getAttribute('aria-label')==='Saiko oppija apua?'?'':'unobserved');
      await button(page,'Kirjoitan tähän').press('Enter');await expect(field(page,'Oma selitykseni')).toHaveValue('');
      await field(page,'Oma selitykseni').fill(`PRIVATE_INTEGRATION_FINAL_${id}`);await button(page,'Olen kirjoittanut selitykseni').press('Enter');
      for(const select of await page.locator('[data-explanation-adult] select').all())await select.selectOption(await select.getAttribute('aria-label')==='Saiko oppija apua?'?'none':'met');
      await page.locator('[data-explanation-adult] input[type=checkbox]').check();
    }
    const box=await button(page,'Vahvista havainto').boundingBox();expect(box!.y+box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
    if(i<2)await page.screenshot({path:info.outputPath(`${id}-adult-${page.viewportSize()!.width}.png`),animations:'disabled'});
    await button(page,'Vahvista havainto').press('Enter');await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok','true');
    const rows=await saved(page);expect(rows.attempts.at(-1)).toMatchObject({assessor:'adult',rev:integrationExplanationSpecs.find(s=>s.id===id)!.rev});
    expect(JSON.stringify(rows)).not.toContain('PRIVATE_INTEGRATION');expect(JSON.stringify(await state(page))).not.toContain('PRIVATE_INTEGRATION');
    if(i<count-1)await button(page,'Seuraava kokeilu').press('Enter');else if(i===count-1)await button(page,'Kokeile uudessa tilanteessa').press('Enter');
  }
  expect(families).toEqual(new Set(integrationExplanationEvidence[id]!.families));expect((await state(page)).progress.checked).toBe(true);expect(errors).toEqual([]);
});
test('changing explanation channel cannot remove revealed help',async({page})=>{
  await open(page,'PHY79-PARALLEL');await button(page,'Olen kertonut selitykseni').press('Enter');
  for(const select of await page.locator('[data-explanation-adult] select').all())await select.selectOption(await select.getAttribute('aria-label')==='Saiko oppija apua?'?'none':'not-yet');
  await page.locator('[data-explanation-adult] input[type=checkbox]').check();await button(page,'Vahvista havainto').press('Enter');
  await button(page,'Näytä ja selitä').press('Enter');await button(page,'Kirjoitan tähän').press('Enter');
  await expect(page.locator('[data-explanation-model]')).toBeVisible();await expect(field(page,'Saiko oppija apua?')).toHaveValue('helped');await expect(field(page,'Saiko oppija apua?')).toBeDisabled();
  expect((await saved(page)).attempts).toHaveLength(1);
});
