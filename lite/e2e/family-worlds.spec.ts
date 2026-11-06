import { expect, test } from '@playwright/test';

test.use({ contextOptions: { reducedMotion: 'reduce' }, launchOptions: { args: ['--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist'] } });
const ids=['M-TH-01','M-PS-02','M-NUM-13','M-FRAC-14','M-GEO-16'];
const family=['LM01','LM02','LM03','LM08','LM14'];
test('seeded resolved events restore five distinct local fixtures silently and survive route changes',async({page},info)=>{
 test.setTimeout(90000);
 await page.goto('./');
 const saved={v:3,attempts:[],events:ids.map((node,at)=>({id:`story.${node}.resolved`,node,at,assisted:true})),effects:ids.map(node=>`world.${node}.resolved`)};
 await page.evaluate(value=>localStorage.setItem('sammakko-journey-3',JSON.stringify(value)),saved);
 for(let i=0;i<ids.length;i++){
  await page.goto(`./?qa=1&full=1&seed=0#saaristo/${ids[i]}`);await page.reload();
  await page.getByRole('button',{name:'Tutkitaan yhdessä',exact:true}).click();
  const state=await page.evaluate(()=>JSON.parse(window.render_game_to_text!()));
  expect(state.renderer).toBe('webgl');expect(state.familyWorld.familyId).toBe(family[i]);
  expect(state.familyWorld.effects).toEqual([...saved.effects].sort());expect(state.familyWorld.remaining).toBe(0);
  expect(state.familyWorld.consequence).toBeTruthy();await page.screenshot({path:info.outputPath(`${ids[i]}.png`)});
  expect(state.stage.effects.filter((id:string)=>saved.effects.includes(id))).toEqual([]);
  expect(JSON.parse((await page.evaluate(()=>localStorage.getItem('sammakko-journey-3')))!).events).toHaveLength(5);
 }
});
