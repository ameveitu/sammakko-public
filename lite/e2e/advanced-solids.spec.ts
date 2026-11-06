import { expect,test,type Page } from '@playwright/test';
import { advancedSolidsSpecs } from '../src/content/advanced-solids';
import type { AdvancedSolidsTask } from '../src/content/models/advanced-solids';
import { rng } from '../src/engine/rng';

test.use({launchOptions:{args:['--enable-unsafe-swiftshader']},reducedMotion:'reduce',trace:'off',screenshot:'only-on-failure'});
const button=(page:Page,name:string)=>page.getByRole('button',{name,exact:true});
const field=(page:Page,name:string)=>page.getByLabel(name,{exact:true});
const exact=(page:Page)=>page.locator('.exp-exact');
const work=(page:Page)=>page.locator('[data-advanced-solids]');
type State={renderer:string;lastOk?:boolean;phase:string;progress:{checked:boolean};model?:{figures:{id:string;shape?:unknown}[];comparisonOpen:boolean};
  stage:{view?:string;revealed?:boolean;filledFraction?:[number,number];figureCount?:number}};
const state=(page:Page):Promise<State>=>page.evaluate(()=>JSON.parse(window.render_game_to_text!()));
const select=(page:Page,name:string,value:string)=>field(page,name).selectOption(value);
const fill=(page:Page,name:string,value:string|number)=>field(page,name).fill(String(value));
const result=(page:Page,ok:boolean)=>expect.poll(async()=>(await state(page)).lastOk).toBe(ok);

async function fallback(page:Page){
  await page.addInitScript(()=>{
    const get=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,...args:unknown[]){
      return /^webgl/.test(type)?null:Reflect.apply(get,this,[type,...args]);
    } as typeof get;
  });
}
async function start(page:Page,id:string,seed:number,independent=false){
  if(page.url()!=='about:blank')await page.goto('about:blank');
  await page.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);
  await button(page,independent?'Kokeilen itse':'Tutkitaan yhdessä').click();
  await expect(work(page)).toBeVisible();
}
async function roundDimensions(page:Page){
  const text=await exact(page).innerText();
  const measure=text.match(/(Säde|Halkaisija) (\d+(?:,\d+)?) (m|cm)\./)!;
  return {radius:Number(measure[2]!.replace(',','.'))/(measure[1]==='Säde'?1:2),unit:measure[3]!,
    height:Number(text.match(/Kohtisuora korkeus (\d+)/)?.[1]),slant:Number(text.match(/Sivujana (\d+)/)?.[1]),text};
}
async function piResult(page:Page,numerator:number,denominator=1){
  if(await field(page,'Tuloksen esitystapa').count())await select(page,'Tuloksen esitystapa','exact');
  if(await field(page,'Pyöristetty likiarvo').isVisible())await fill(page,'Pyöristetty likiarvo',(Math.PI*numerator/denominator).toFixed(2));
}
async function coneSurface(page:Page,wrong=false){
  const {radius,height,slant,unit,text}=await roundDimensions(page);
  const caps=text.includes('yksi pohja')?1:0;
  await fill(page,'Säde',radius);
  if(caps)await fill(page,'Yhden pohjan ala',radius**2);
  await fill(page,'Vaipan sivujana',wrong?height:slant);
  await fill(page,'Vaipan ala',radius*slant);
  await fill(page,'Mukaan tulevat pohjat',caps);
  const total=radius*slant+caps*radius**2;
  await fill(page,'Koko pinta-ala',total);
  await select(page,'Tuloksen yksikkö',unit+'²');
  await piResult(page,total);
  await button(page,'Valmis').click();
}

test('three physical cone pours fill one matching WebGL cylinder and support an own answer',async({page},testInfo)=>{
  test.setTimeout(150_000);
  const errors:Error[]=[];page.on('pageerror',error=>errors.push(error));
  await page.setViewportSize({width:1366,height:768});
  await start(page,'M79-CONE-V',2);
  await expect.poll(async()=>(await state(page)).renderer).toBe('webgl');
  expect((await state(page)).stage).toMatchObject({figureCount:2,revealed:false});
  expect((await state(page)).stage.filledFraction).toBeUndefined();
  expect((await state(page)).model?.figures.every(f=>f.shape===undefined)).toBe(true);
  const {radius,height,unit}=await roundDimensions(page);
  await expect(button(page,'Valmis')).toBeDisabled();
  await expect(work(page).locator('[data-solid-cone-water]')).toBeVisible();
  for(let step=1;step<=3;step++){
    await button(page,'Kaada yksi täysi kartio').click();
    expect((await state(page)).stage.filledFraction).toEqual([step,3]);
  }
  await expect(work(page).locator('[data-solid-cone-water]')).toHaveCount(0);
  await page.screenshot({path:testInfo.outputPath('cone-fill.png')});
  await fill(page,'Säde',radius);await fill(page,'Yhden pohjan ala',radius**2);
  await fill(page,'Osuus vertailulieriöstä','2/6');
  const numerator=radius**2*height;
  await fill(page,'Tilavuus',`${numerator}/3`);
  await select(page,'Tuloksen yksikkö',unit+'³');
  await piResult(page,numerator,3);
  await button(page,'Valmis').click();await result(page,true);
  expect((await state(page)).stage.revealed).toBe(true);
  expect(errors).toEqual([]);
});

test('2D fallback cone net distinguishes slant from height, then supports a new trial',async({page})=>{
  await fallback(page);await start(page,'M79-CONE-SA',0,true);
  expect((await state(page)).renderer).toBe('painted-fallback');
  await button(page,'Avaa verkko').click();
  await expect(work(page).locator('svg')).toContainText('Sektorivaippa');
  await coneSurface(page,true);await result(page,false);
  await expect(page.locator('.exp-feedback')).toContainText('sivujanaa');
  await button(page,'Uusi kokeilu').click();await button(page,'Pieni vihje').click();
  await coneSurface(page);await result(page,true);
  const attempt=await page.evaluate(()=>JSON.parse(localStorage.getItem('sammakko-journey-3')!).attempts.at(-1));
  expect(attempt.help).toContain('hint');
});

async function convert(page:Page){
  const [,quantity,from,to]=(await exact(page).innerText()).match(/Sama tila: ([\d,]+) (\S+) = \? (\S+)\./)!;
  const sizes:Record<string,number>={'m³':1000,'dm³':100,'cm³':10,'mm³':1,l:100};
  const a=sizes[from!]!,b=sizes[to!]!,scale=Math.max(a,b)/Math.min(a,b);
  for(const axis of ['Leveys','Syvyys','Korkeus'])await fill(page,`Särmän kerroin: ${axis}`,scale);
  await fill(page,'Tilavuuden muunnoskerroin',scale**3);
  await select(page,'Muunnoksen laskutoimitus',a>b?'times':'divide');
  const original=Number(quantity!.replace(',','.'));
  await fill(page,'Muunnettu tilavuus',a>b?original*scale**3:`${2*original}/${2*scale**3}`);
  await select(page,'Uusi tilavuusyksikkö',to!);
  await button(page,'Valmis').click();await result(page,true);
}
test('three fresh unit conversions transfer to litres through cubic units',async({page})=>{
  await fallback(page);await start(page,'M79-UNIT-VOL',1,true);
  for(let index=0;index<3;index++){
    await convert(page);await button(page,index===2?'Kokeile uudessa tilanteessa':'Seuraava kokeilu').click();
  }
  expect((await state(page)).phase).toBe('transfer');
  await expect(exact(page)).toContainText('1 l = 1 dm³');
  await convert(page);
  expect((await state(page)).progress.checked).toBe(true);
});

test('sphere identification uses three independent radial directions in the fallback section',async({page})=>{
  await fallback(page);await start(page,'M79-SPHERE-ID',2);
  await button(page,'Leikkaus').click();
  const svg=work(page).locator('svg');
  let accepted=0;
  for(const picture of await svg.all()){
    const id=(await picture.getAttribute('aria-label'))!.match(/Mallin ([A-D])/)![1]!;
    const lengths=(await picture.textContent())?.match(/X ([\d,]+) · Y ([\d,]+) · Z ([\d,]+)/);
    const same=lengths&&lengths[1]===lengths[2]&&lengths[1]===lengths[3];
    await select(page,`Mallin ${id} luokka`,same?'sphere':'other');
    if(same){
      accepted++;
      for(const [index,axis] of ['X','Y','Z'].entries())await fill(page,`Mallin ${id} keskus–pinta ${axis}`,lengths[index+1]!);
    }
  }
  expect(accepted).toBe(1);
  await button(page,'Valmis').click();await result(page,true);
});

test('sphere scaling locks its forecast before displaying the comparison or accepting a calculation',async({page})=>{
  await fallback(page);
  const spec=advancedSolidsSpecs.find(s=>s.id==='M79-SPHERE-V')!;
  const seed=Array.from({length:30},(_,i)=>i).find(i=>spec.item(rng(i),'guided').tag==='compare-interiors')!;
  await start(page,spec.id,seed);
  const {radius,unit,text}=await roundDimensions(page);
  const earlier=Number(text.match(/Entisen pallon säde ([\d,]+)/)![1]!.replace(',','.'));
  expect((await state(page)).model?.comparisonOpen).toBe(false);
  await expect(field(page,'Tilavuus')).toBeHidden();
  await select(page,'Tilavuuden tai pinta-alan ennuste',radius>earlier?'greater':'less');
  await button(page,'Lukitse ennuste').click();
  await expect(field(page,'Tilavuuden tai pinta-alan ennuste')).toBeDisabled();
  expect((await state(page)).model?.comparisonOpen).toBe(true);
  const radii=await work(page).locator('svg').evaluateAll(svgs=>svgs.map(s=>Number(s.querySelector('ellipse')!.getAttribute('rx'))));
  expect(radii[1]!/radii[0]!).toBeCloseTo(radius/earlier,10);
  await fill(page,'Säde',radius);await fill(page,'Säteen kuutio',radius**3);
  await fill(page,'Uuden ja entisen suhde',`${radius**3}/${earlier**3}`);
  await fill(page,'Tilavuus',`${4*radius**3}/3`);
  await select(page,'Tuloksen yksikkö',unit+'³');await piResult(page,4*radius**3,3);
  await button(page,'Valmis').click();await result(page,true);
});

for(const [width,height] of [[1366,768],[768,1024]]){
  test(`all 22 advanced solid family panels fit ${width}×${height}`,async({page})=>{
    test.setTimeout(60_000);
    await page.setViewportSize({width:width!,height:height!});await fallback(page);
    for(const spec of advancedSolidsSpecs){
      const seeds=new Map<string,number>();
      for(let seed=0;seed<30&&seeds.size<2;seed++){
        const tag=spec.item(rng(seed),'guided').tag;
        if(!seeds.has(tag))seeds.set(tag,seed);
      }
      expect(seeds.size).toBe(2);
      for(const [tag,seed] of seeds){
        await start(page,spec.id,seed);
        const authored=spec.item(rng(seed),'guided').task as unknown as AdvancedSolidsTask;
        if(authored.mode==='identify')for(const figure of authored.figures){
          const shape=figure.shape.kind;
          const group=shape==='ellipsoid'||shape==='frustum'?'other':shape;
          await select(page,`Mallin ${figure.id} luokka`,authored.target==='all'||authored.target===group?group:'other');
        }
        const forecast=field(page,'Tilavuuden tai pinta-alan ennuste');
        if(await forecast.count()){await forecast.selectOption('greater');await button(page,'Lukitse ennuste').click();}
        const fields=await work(page).locator('input:visible,select:visible,button:visible').all();
        for(const control of [exact(page),...fields]){
          const bounds=await control.boundingBox();
          const key=`${spec.id}/${tag}/${await control.getAttribute('aria-label')??await control.textContent()}`;
          expect(bounds,key).not.toBeNull();expect(bounds!.x,key).toBeGreaterThanOrEqual(0);
          expect(bounds!.x+bounds!.width,key).toBeLessThanOrEqual(width!+1);
          expect(bounds!.y,key).toBeGreaterThanOrEqual(0);expect(bounds!.y+bounds!.height,key).toBeLessThanOrEqual(height!);
        }
      }
    }
  });
}
