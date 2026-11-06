import {expect,test} from '@playwright/test';
test.use({launchOptions:{args:['--enable-unsafe-swiftshader']}});
test('3D route island shares the 2D compass and reveals no destination',async({page})=>{
 test.setTimeout(90000);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('./?qa=1&seed=1#saaristo/M-GEO-03');
 await page.getByRole('button',{name:'Tutkitaan yhdessä',exact:true}).click();
 const current=await page.evaluate(()=>JSON.parse(window.render_game_to_text!()));expect(current.renderer).toBe('webgl');expect(current.model.kind).toBe('number-route');
 expect(current.stage).toMatchObject({kind:'number-route',width:5,height:5,origin:current.model.origin,heading:current.model.heading,axes:'x-right,y-down',north:'-z'});
 expect(current.stage).not.toHaveProperty('route');expect(current.stage).not.toHaveProperty('answer');expect(current.stage).not.toHaveProperty('destination');
 const cells=page.locator('[data-number-route] [data-map-cell]');await expect(cells).toHaveCount(25);
 const {x,y}=current.model.origin;const arrows:Record<string,string>={north:'↑',east:'→',south:'↓',west:'←'};
 await expect(page.locator(`[data-map-cell="${x}-${y}"]`)).toHaveText(arrows[current.model.heading]!);
 await expect(page.locator('.exp-task')).toContainText('Kartan pohjoinen');
});
