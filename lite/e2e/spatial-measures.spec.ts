import { expect,test,type Page } from '@playwright/test';

const ids=['M-GEO-19','M-GEO-20','M-GEO-21','M-GEO-22','M-GEO-23','M-GEO-25','M-GEO-24',
  'M-GMEAS-02','M-GMEAS-04','M-GMEAS-03','M-SCALE-01','M-SCALE-02','M-SYM-02','M-SYM-03','M-GMEAS-06'] as const;
const btn=(page:Page,name:string)=>page.getByRole('button',{name,exact:true});
const board=(page:Page)=>page.locator('.spatial-measure-board');
const task=(page:Page)=>page.locator('.exp-task');
const feedback=(page:Page)=>page.locator('.exp-feedback');
const debug=(page:Page)=>page.evaluate(()=>JSON.parse(window.render_game_to_text!()));
const pick=(page:Page,name:string)=>task(page).getByRole('combobox',{name,exact:true});
const field=(page:Page,name:string)=>task(page).getByRole('textbox',{name,exact:true});
const degree=(page:Page,name:string)=>task(page).getByRole('spinbutton',{name,exact:true});
async function open(page:Page,id:typeof ids[number],seed=1){
  await page.goto(`./?qa=1&full=1&seed=${seed}#saaristo/${id}`);
  await btn(page,'Kokeilen itse').click();
  await expect(board(page)).toBeVisible();
}
async function check(page:Page,ok:boolean){
  await btn(page,'Tarkista').click();
  await expect(feedback(page)).toHaveAttribute('data-ok',String(ok));
}
async function instrumentFromDrawing(page:Page, wrongScale=false) {
  const shown = await board(page).getByRole('img',{name:'Kulman tarkka piirros'}).evaluate(svg=>{
    const read=(line:SVGLineElement) => [line.x1.baseVal.value,line.y1.baseVal.value,line.x2.baseVal.value,line.y2.baseVal.value];
    const base=read(svg.querySelector('line[stroke-width="2.6"]')!), end=read(svg.querySelector('line[stroke-width="2.3"]')!);
    const bearing=([x,y,xx,yy]:number[])=>Math.round((Math.atan2(y!-yy!,xx!-x!)*180/Math.PI+360)%360);
    const a=bearing(base),b=bearing(end), clockwise=(a-b+360)%360<180;
    const opening=clockwise?(a-b+360)%360:(b-a+360)%360;
    const center=[...svg.querySelectorAll('circle[r="2.7"]')].find(p=>p.cx.baseVal.value===base[0]&&p.cy.baseVal.value===base[1])!;
    return { opening, heading:(a+(clockwise?0:180))%360, scale:clockwise?'a':'b', label:center.nextElementSibling!.textContent! };
  });
  await pick(page,'Mitan keskipiste').selectOption({label:shown.label});
  await degree(page,'Mitan pohjaviivan suunta').fill(String(shown.heading));
  await expect(board(page).locator('text[paint-order="stroke"]').filter({hasText:/^(0|180)$/})).toHaveCount(4);
  await pick(page,'Luettava asteikko').selectOption(wrongScale?(shown.scale==='a'?'b':'a'):shown.scale);
  await field(page,'Kulmamitan lukema (°)').fill(String(shown.opening));
}
async function fillUnitLayers(page:Page,includeHidden=true) {
  const maps=await board(page).getByRole('img',{name:/^Kerros/}).all();
  let total=0;
  for(const [layer,map] of maps.entries()){
    const positions=await map.evaluate(svg=>[...svg.querySelectorAll('rect[fill="#c2d9bb"]')].map(rect=>[
      (rect.x.baseVal.value-1)/22+1,(rect.y.baseVal.value-1)/22+1,
    ]));
    total+=positions.length;
    if(!includeHidden&&layer>0)continue;
    if(maps.length>1)await pick(page,'Muokattava kerros').selectOption(String(layer));
    for(const [x,y] of positions) await btn(page,`Kerros ${layer+1}, rivi ${y}, sarake ${x}`).click();
  }
  await field(page,'Tilavuus').fill(String(total));
  await pick(page,'Tilavuuden yksikkö').selectOption('volume');
}

test.describe('Mittapajan tarkka 2D-työpöytä',()=>{
  test.beforeEach(async({page})=>{
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.addInitScript(()=>{
      const get=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,...args:unknown[]){
        return /^webgl/.test(type)?null:Reflect.apply(get,this,[type,...args]);
      } as typeof get;
    });
  });
  test('aligns the protractor, rejects its other scale and recovers from the hint',async({page})=>{
    await open(page,'M-GEO-24',1);
    await instrumentFromDrawing(page,true);
    await check(page,false);
    await expect(feedback(page)).toContainText('alkaa nollasta');
    await btn(page,'Uusi kokeilu').click();
    await btn(page,'Pieni vihje').click();
    await expect(page.locator('.exp-help')).toContainText('kärjessä');
    await instrumentFromDrawing(page);
    await check(page,true);
  });
  test('draws the second ray from the given start using keyboard degree steps',async({page})=>{
    await open(page,'M-GEO-23',0);
    const instruction=await page.locator('.exp-instruction').innerText();
    const target=Number(instruction.match(/(\d+)°/)![1]);
    await degree(page,'Oma avautuminen').fill(String(target-5));
    await btn(page,'+5°').press('Space');
    await expect(degree(page,'Oma avautuminen')).toHaveValue(String(target));
    await expect(board(page).locator('line[stroke-width="2.3"]')).toBeVisible();
    await check(page,true);
  });
  test('constructs a real segment using a snapped tap and keyboard coordinates',async({page})=>{
    await open(page,'M-GEO-20',0);
    const grid=board(page).getByRole('img',{name:'Kokonaislukuruudukko'});
    const [a,b]=await grid.evaluate(svg=>{
      const root=svg as SVGSVGElement;
      const matrix=root.getScreenCTM()!;
      return [...root.querySelectorAll('circle')].map(mark=>{
        const point=root.createSVGPoint();
        point.x=mark.cx.baseVal.value;point.y=mark.cy.baseVal.value;
        const screen=point.matrixTransform(matrix);
        return {sx:screen.x,sy:screen.y,x:Math.round((point.x-20)*7/216),y:Math.round((236-point.y)*7/216)};
      });
    });
    await page.mouse.click(a!.sx,a!.sy);
    await degree(page,'Pisteen x').fill(String(b!.x));
    await degree(page,'Pisteen y').fill(String(b!.y));
    await degree(page,'Pisteen y').press('Enter');
    await expect(grid.locator('path[stroke="#9e5628"]')).toHaveAttribute('d',/L/);
    await pick(page,'Rakennetun janan ominaisuus').selectOption('bounded');
    await check(page,true);
  });
  test('counts and places cubes in the hidden layers as well as the first layer',async({page})=>{
    await open(page,'M-GMEAS-04',0);
    expect((await debug(page)).renderer).toBe('painted-fallback');
    await fillUnitLayers(page,false);
    await check(page,false);
    await expect(feedback(page)).toContainText('kerrosta');
    await btn(page,'Uusi kokeilu').click();
    await fillUnitLayers(page);
    await check(page,true);
  });
  test('accepts an equivalent ratio only after both lengths are converted',async({page})=>{
    await open(page,'M-SCALE-01',1);
    const vals=await board(page).locator('dd').allTextContents();
    const [a,au]=vals[0]!.split(' '),[b,bu]=vals[1]!.split(' ');
    const cm=(n:string,u:string)=>u==='mm'?Number(n)/10:Number(n)*(u==='dm'?10:u==='m'?100:1);
    const map=cm(a!,au!), actual=cm(b!,bu!);
    await field(page,'Kuvan pituus (cm)').fill(String(map).replace('.',','));
    await field(page,'Todellinen pituus (cm)').fill(String(actual));
    const numerator=20*map;
    await field(page,'Suhde kuva : todellinen').fill(`${Math.round(numerator)}:${20*actual}`);
    await check(page,true);
  });
  test('shows the preserved orientation and checks every scaled point',async({page})=>{
    await open(page,'M-SCALE-02',1);
    await expect(page.locator('.exp-instruction')).toContainText('Säilytä alkuperäisen kuvion suunta.');
    const picture=board(page).getByRole('img',{name:'Kokonaislukuruudukko'});
    const source=await picture.evaluate(svg=>[...svg.querySelectorAll('circle')].map(mark=>[
      Math.round((mark.cx.baseVal.value-20)*12/216), Math.round((236-mark.cy.baseVal.value)*12/216),
    ]));
    const [ox,oy]=source[0]!;
    const fields=[degree(page,'Pisteen x'),degree(page,'Pisteen y')];
    for(const [x,y] of source){
      await fields[0]!.fill(String(6+(x!-ox!)/2));
      await fields[1]!.fill(String(5+(y!-oy!)/2));
      await fields[1]!.press('Enter');
    }
    await check(page,true);
  });
  for(const [name,viewport] of [
    ['desktop',{width:1366,height:768}],['tablet',{width:768,height:1024}],
  ] as const){
    test(`all thirty complete response layouts fit ${name}`,async({page},testInfo)=>{
      test.setTimeout(70_000);
      await page.setViewportSize(viewport);
      const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
      for(const id of ids){
        const tags=new Set<string>();
        for(const seed of [0,1]){
          await open(page,id,seed);tags.add((await debug(page)).family);
          if(id==='M-GEO-24')await instrumentFromDrawing(page);
          await expect(page.locator('.exp-instruction'),id).toBeInViewport({ratio:1});
          await expect(board(page),id).toBeInViewport({ratio:1});
          for(const input of await task(page).locator('button:visible,input:visible,select:visible').all())
            await expect(input,id).toBeInViewport({ratio:1});
          expect(await page.evaluate(()=>window.scrollY),id).toBe(0);
          if(seed===1&&(id==='M-GEO-24'||id==='M-GMEAS-04'||id==='M-SCALE-02')){
            const filename=`spatial-${id}-${name}.png`,path=testInfo.outputPath(filename);
            await page.screenshot({path});
            await testInfo.attach(filename,{path,contentType:'image/png'});
          }
        }
        expect(tags.size,id).toBe(2);
      }
      expect(errors).toEqual([]);
    });
  }
});

test.use({launchOptions:{args:['--enable-unsafe-swiftshader']}});
test('renders the stepped voxel reference in WebGL2 while keeping every layer map visible',async({page},testInfo)=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:1366,height:768});
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await open(page,'M-GMEAS-04',1);
  await expect.poll(async()=>(await debug(page)).renderer).toBe('webgl');
  const state=await debug(page);
  expect(state.stage.kind).toBe('spatial-volume');
  expect(state.stage.grid).toEqual([3,4,3]);
  expect(state.stage.cells.some(([,,layer]:number[])=>layer===2)).toBe(true);
  const layers=board(page).getByRole('img',{name:/^Kerros/});
  await expect(layers).toHaveCount(3);
  const visibleVoxels=await layers.locator('rect[fill="#c2d9bb"]').count();
  expect(state.stage.cells).toHaveLength(visibleVoxels);
  await page.evaluate(()=>window.advanceTime?.(100));
  const path=testInfo.outputPath('spatial-volume-webgl.png');
  await page.screenshot({path});
  await testInfo.attach('spatial-volume-webgl',{path,contentType:'image/png'});
  expect(errors).toEqual([]);
});
