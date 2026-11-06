import { expect,test,type Page } from '@playwright/test';

const ids=['M-DATA-06','M-DATA-07','M-DATA-08','M-DATA-11','M-DATA-12','M-PROB-01','M-PROB-02','M-PROB-03',
  'M-PROB-04','M-PROB-05','M-PROB-06','M-STAT-01','M-STAT-02','M-STAT-03','M-STAT-05'] as const;
type Id=typeof ids[number];
const button=(page:Page,name:string)=>page.getByRole('button',{name,exact:true});
const board=(page:Page)=>page.locator('.data-probability-board');
const task=(page:Page)=>page.locator('.exp-task');
const feedback=(page:Page)=>page.locator('.exp-feedback');
const select=(page:Page,name:string)=>task(page).getByRole('combobox',{name,exact:true});
const spin=(page:Page,name:string)=>task(page).getByRole('spinbutton',{name,exact:true});
const input=(page:Page,name:string)=>task(page).getByRole('textbox',{name,exact:true});
const state=(page:Page)=>page.evaluate(()=>JSON.parse(window.render_game_to_text!()));
async function open(page:Page,id:Id,seed=1) {
  await page.goto(`./?qa=1&full=1&seed=${seed}#saaristo/${id}`);
  await button(page,'Kokeilen itse').click();
  await expect(board(page)).toBeVisible();
}
async function check(page:Page,correct:boolean) {
  await button(page,'Tarkista').click();
  await expect(feedback(page)).toHaveAttribute('data-ok',String(correct));
}
const table=(page:Page)=>board(page).locator('tbody tr').evaluateAll(rows=>rows.map(row=>({
  label:row.querySelector('th')!.textContent!,value:Number(row.querySelector('td')!.textContent),
})));
async function describeChart(page:Page,baseline=0,step=2,top=10) {
  await select(page,'Diagrammin otsikko').selectOption('data');
  await select(page,'Vaaka-akselin nimi').selectOption('categories');
  await select(page,'Pysty-akselin nimi ja yksikkö').selectOption('counts');
  await spin(page,'Asteikon alku').fill(String(baseline));
  await spin(page,'Asteikkoväli').fill(String(step));
  await spin(page,'Asteikon yläraja').fill(String(top));
}
async function allHeights(page:Page) {
  const rows=await table(page);
  for(const {label,value} of rows)await spin(page,`Arvo: ${label}`).fill(String(value));
  return rows;
}
async function bagCounts(page:Page) {
  return board(page).locator('section').evaluateAll(sections=>sections.map(section=>{
    const tokens=Array.from(section.querySelectorAll('[data-data-token]')).map(el=>el.textContent!);
    return {name:section.querySelector('strong')!.textContent!,blue:tokens.filter(t=>t.startsWith('Sininen')).length,total:tokens.length};
  }));
}

test.describe('Majakan data- ja todennäköisyyspaja',()=>{
  test.beforeEach(async({page})=>{
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.addInitScript(()=>{
      const get=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,...args:unknown[]){
        return /^webgl/.test(type)?null:Reflect.apply(get,this,[type,...args]);
      } as typeof get;
    });
  });
  test('rejects a misleading axis, then builds its own bars by keyboard and tap',async({page})=>{
    await open(page,'M-DATA-07',0);
    await describeChart(page,1);
    await allHeights(page);
    await check(page,false);
    await expect(feedback(page)).toContainText('Aloita asteikko nollasta');
    await button(page,'Uusi kokeilu').click();
    await button(page,'Pieni vihje').click();
    await expect(page.locator('.exp-help')).toContainText('yläraja');
    await describeChart(page);
    const rows=await table(page);
    const tapIndex=rows.findIndex(row=>row.value>0&&row.value<10);
    for(const [i,{label,value}] of rows.entries()){
      if(i!==tapIndex){await spin(page,`Arvo: ${label}`).fill(String(value));continue;}
      const hit=page.locator('[data-data-column]').nth(i);
      const pointer=await hit.evaluate((rect,target)=>{
        const hit=rect as SVGRectElement,svg=hit.ownerSVGElement!,point=svg.createSVGPoint();
        point.x=hit.x.baseVal.value+hit.width.baseVal.value/2;
        const tick=hit.height.baseVal.value-3;
        point.y=hit.y.baseVal.value+tick*(1-target/10);
        const screen=point.matrixTransform(svg.getScreenCTM()!);
        return {x:screen.x,y:screen.y};
      },value);
      await page.mouse.click(pointer.x,pointer.y);
      await expect(spin(page,`Arvo: ${label}`)).toHaveValue(String(value));
    }
    await check(page,true);
    await expect(feedback(page)).toBeVisible();
  });
  test('accepts a picture instead of bars when equal size symbols carry a common key',async({page})=>{
    for(const seed of [0,1]){
      await open(page,'M-DATA-11',seed);
      if((await state(page)).family==='choose-unordered-category-display')break;
    }
    expect((await state(page)).family).toBe('choose-unordered-category-display');
    await select(page,'Diagrammityyppi').selectOption('picture');
    await select(page,'Valinnan peruste').selectOption('pictures');
    await describePicture(page);
    const rows=await allHeights(page);
    const marks=page.locator('[data-chart-preview] svg rect');
    await expect(marks).toHaveCount(rows.reduce((n,row)=>n+row.value/2,0));
    expect(await marks.evaluateAll(rects=>new Set(rects.map(r=>r.getAttribute('width')+'×'+r.getAttribute('height'))).size)).toBe(1);
    await check(page,true);
  });
  test('lists every distinct pair of lookalike tokens and rejects one repeated pair',async({page})=>{
    for(const seed of [0,1]){
      await open(page,'M-PROB-02',seed);
      if((await state(page)).family==='enumerate-lookalike-identities')break;
    }
    const pairSelect=[select(page,'Ensimmäisen pussin merkki'),select(page,'Toisen pussin merkki')];
    const makePairs=async()=>{
      const choices=await Promise.all(pairSelect.map(control=>control.locator('option:not(:disabled)').evaluateAll(options=>
        options.map(option=>option.getAttribute('value')!))));
      return choices[0]!.flatMap(a=>choices[1]!.map(b=>[a,b])).reverse();
    };
    const addPairs=async(pairs:string[][])=>{
      for(const [a,b] of pairs){
        await pairSelect[0]!.selectOption(a!);await pairSelect[1]!.selectOption(b!);
        await button(page,'Lisää alkeistulos').press('Space');
      }
    };
    const pairs=await makePairs();
    await addPairs([...pairs,pairs[0]!]);
    await input(page,'Alkeistuloksia yhteensä').fill(String(pairs.length));
    await check(page,false);
    await button(page,'Uusi kokeilu').click();
    const retry=await makePairs();
    await addPairs(retry);
    await input(page,'Alkeistuloksia yhteensä').fill(String(retry.length));
    await check(page,true);
  });
  test('compares ties and transfers to equal favorable counts with different totals',async({page})=>{
    await open(page,'M-PROB-04',1);
    const families=new Set<string>();
    const compare=async()=>{
      const [a,b]=await bagCounts(page);
      for(const bag of [a!,b!]){
        await input(page,`${bag.name}: sinisiä`).fill(String(bag.blue));
        await input(page,`${bag.name}: kaikki`).fill(String(bag.total));
      }
      const x=a!.blue/a!.total,y=b!.blue/b!.total;
      const choice=x===y?'equal':x>y?'a':'b';
      await select(page,'Kummasta sininen todennäköisemmin?').selectOption(choice);
      await check(page,true);
      return {a:a!,b:b!,choice};
    };
    for(let attempt=0;attempt<3;attempt++){
      const family=(await state(page)).family;
      families.add(family);
      const {choice}=await compare();
      if(family==='compare-equal-favorable-shares')expect(choice).toBe('equal');
      if(attempt<2)await button(page,'Seuraava kokeilu').click();
    }
    expect(families.size).toBe(2);
    await button(page,'Kokeile uudessa tilanteessa').click();
    expect((await state(page)).phase).toBe('transfer');
    const {a,b,choice}=await compare();
    expect(a.blue).toBe(b.blue);
    expect(a.total).not.toBe(b.total);
    expect(choice).not.toBe('equal');
    expect((await state(page)).progress.checked).toBe(true);
    await expect(feedback(page)).toContainText('Pussien nostomahdollisuudet');
  });
  test('uses every repeated measurement when producing an exact fractional mean',async({page})=>{
    for(const seed of [0,1]){
      await open(page,'M-STAT-05',seed);
      if((await state(page)).family==='mean-fraction-with-repeated-observations')break;
    }
    expect((await state(page)).family).toBe('mean-fraction-with-repeated-observations');
    const source=await table(page),sum=source.reduce((n,row)=>n+row.value,0);
    const unique=new Set(source.map(r=>r.value)).size;
    await input(page,'Yhteensä (l)').fill(String(sum));
    await input(page,'Havaintojen lukumäärä').fill(String(unique));
    await input(page,'Keskiarvo (l)').fill(`${sum}/${unique}`);
    await select(page,'Mitä keskiarvo kuvaa tässä?').selectOption('equal');
    await check(page,false);
    await button(page,'Uusi kokeilu').click();
    const retry=await table(page),total=retry.reduce((n,row)=>n+row.value,0);
    await input(page,'Yhteensä (l)').fill(String(total));
    await input(page,'Havaintojen lukumäärä').fill(String(retry.length));
    await input(page,'Keskiarvo (l)').fill(`${total*2}/${retry.length*2}`);
    await select(page,'Mitä keskiarvo kuvaa tässä?').selectOption('equal');
    await check(page,true);
  });
  for(const [name,width,height] of [['desktop',1366,768],['tablet',768,1024]] as const){
    test(`keeps givens, actual chart preview and input controls on ${name}`,async({page},testInfo)=>{
      test.setTimeout(100_000);
      const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
      await page.setViewportSize({width,height});
      for(const id of ids){
        const families=new Set<string>();
        for(const seed of [0,1]){
          await open(page,id,seed);
          const snapshot=await state(page);
          families.add(snapshot.family);
          if(id==='M-DATA-07'||id==='M-DATA-11'){
            if(id==='M-DATA-11')await select(page,'Diagrammityyppi').selectOption(snapshot.family==='choose-ordered-time-display'?'line':'bar');
            const maximum=Math.max(...(await table(page)).map(row=>row.value));
            await describeChart(page,0,maximum>10?5:2,maximum>10?50:10);
            await allHeights(page);
            await expect(page.locator('[data-chart-preview] svg'),id).toBeInViewport({ratio:1});
          }
          await expect(page.locator('.exp-instruction'),id).toBeInViewport({ratio:1});
          await expect(board(page),id).toBeInViewport({ratio:1});
          for(const control of await task(page).locator('button:visible,input:visible,select:visible').all())
            await expect(control,id).toBeInViewport({ratio:1});
          await expect(button(page,'Pieni vihje'),id).toBeInViewport({ratio:1});
          expect(await page.evaluate(()=>window.scrollY),id).toBe(0);
          if(seed===1&&(id==='M-DATA-07'||id==='M-DATA-11'||id==='M-PROB-05')){
            const filename=`data-${id}-${name}.png`,path=testInfo.outputPath(filename);
            await page.screenshot({path});
            await testInfo.attach(filename,{path,contentType:'image/png'});
          }
        }
        expect(families.size,id).toBe(2);
      }
      expect(errors).toEqual([]);
    });
  }
});

async function describePicture(page:Page) {
  await select(page,'Diagrammin otsikko').selectOption('data');
  await select(page,'Vaaka-akselin nimi').selectOption('categories');
  await select(page,'Pysty-akselin nimi ja yksikkö').selectOption('counts');
  await spin(page,'Yhden kuvan arvo').fill('2');
}
