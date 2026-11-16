import { expect,test } from '@playwright/test';

// The full workbench's three observation fields must wrap before a native
// select's longest outcome is clipped by .exp-task's horizontal scrollport.
for(const [width,height] of [[1366,768],[768,1024],[320,740],[390,844]]){
  test(`programming observation fields fit at ${width}px`,async({page})=>{
    await page.setViewportSize({width,height});
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.addInitScript(()=>{
      const get=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,...args:unknown[]){
        return /^webgl/.test(type)?null:Reflect.apply(get,this,[type,...args]);
      } as typeof get;
    });
    const families=new Set<string>();
    for(const seed of [0,1]){
      await page.goto(`./?qa=1&seed=${seed}&full=1#saaristo/M-PROG-04`);
      await page.getByRole('button',{name:'Kokeilen itse',exact:true}).click();
      families.add(await page.evaluate(()=>JSON.parse(window.render_game_to_text!()).family));
      for(const suffix of ['Ruutu','Keula','Ajotulos'])
        await page.getByRole('combobox',{name:'Ennuste · '+suffix,exact:true}).selectOption({index:1});
      await page.getByRole('button',{name:'Lukitse ennuste',exact:true}).click();
      await page.getByRole('button',{name:'Aja ohjelma',exact:true}).click();
      const outcome=page.getByRole('combobox',{name:'Havainto · Ajotulos',exact:true});
      await outcome.selectOption('edge');
      await expect(outcome).toBeInViewport({ratio:1});
      const geometry=await page.locator('.exp-task').evaluate(task=>({
        client:task.clientWidth,scroll:task.scrollWidth,
        fields:Array.from(task.querySelectorAll('select')).map(select=>{
          const field=select.getBoundingClientRect(),label=select.parentElement!.getBoundingClientRect();
          return {left:field.left-label.left,right:field.right-label.right,height:field.height};
        }),
      }));
      expect(geometry.scroll).toBe(geometry.client);
      for(const field of geometry.fields){
        expect(field.left).toBeGreaterThanOrEqual(0);
        expect(field.right).toBeLessThanOrEqual(0);
        expect(field.height).toBeGreaterThanOrEqual(44);
      }
    }
    expect(families.size).toBe(2);
  });
}
