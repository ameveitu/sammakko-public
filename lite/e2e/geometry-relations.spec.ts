import { expect,test,type Page } from '@playwright/test';

const ids=['M79-CONGRUENCE','M79-CONG-CRIT','M79-CONSTRUCT','M79-CURVE','M79-LINEREL','M79-POLY-ANGLES','M79-RAY',
  'M79-SIMILARITY','M79-SIM-CRIT','M79-SIMILAR-SCALE','M79-SUPPLEMENTARY-ANGLES','M79-TRI-ANGLE-SUM','M79-VERTICAL-ANGLES','M79-ANGLE-REL'] as const;
type Id=typeof ids[number];
type Point={x:number;y:number};
type Figure={name:string;points:Point[];ids:string[];facts:string[]};
const btn=(page:Page,name:string)=>page.getByRole('button',{name,exact:true});
const desk=(page:Page)=>page.locator('.exp-task');
const board=(page:Page)=>page.locator('.geometry-relations-board');
const menu=(page:Page,name:string)=>desk(page).getByRole('combobox',{name,exact:true});
const field=(page:Page,name:string)=>desk(page).getByRole('textbox',{name,exact:true});
const feedback=(page:Page)=>page.locator('.exp-feedback');
const state=(page:Page)=>page.evaluate(()=>JSON.parse(window.render_game_to_text!()));
async function open(page:Page,id:Id,seed=0){
  await page.goto(`./?qa=1&full=1&seed=${seed}#saaristo/${id}`);
  await btn(page,'Kokeilen itse').click();
  await expect(board(page)).toBeVisible();
  return state(page);
}
async function check(page:Page,ok:boolean) {
  await btn(page,'Tarkista').click();
  await expect(feedback(page)).toHaveAttribute('data-ok',String(ok));
}
const q=(a:Point,b:Point)=>(a.x-b.x)**2+(a.y-b.y)**2;
const close=(a:number,b:number)=>Math.abs(a-b)<.22;
function mapShape(source:Figure,target:Figure,similar=false){
  const n=source.points.length;
  if(n!==target.points.length)return;
  for(let i=0;i<n;i++)for(const order of [1,-1]){
    const to=source.points.map((_,j)=>(i+order*j+n)%n),mapped=to.map(j=>target.points[j]!);
    const k2=q(mapped[0]!,mapped[1]!)/q(source.points[0]!,source.points[1]!);
    if(!similar&&!close(k2,1))continue;
    const matches=source.points.every((a,j)=>source.points.every((b,k)=>close(q(a,b)*k2,q(mapped[j]!,mapped[k]!))));
    if(matches)return {to,k:Math.sqrt(k2)};
  }
  return;
}
async function figures(page:Page):Promise<Figure[]>{
  return board(page).locator('figure').evaluateAll(cards=>cards.map(card=>{
    const poly=card.querySelector('polygon')!;
    const points=Array.from({length:poly.points.numberOfItems},(_,i)=>{
      const {x,y}=poly.points.getItem(i);return {x,y};
    });
    const facts=(card.querySelector('small')?.textContent??'').split(' · ').filter(Boolean);
    return {name:card.querySelector('figcaption')!.textContent!,points,
      ids:[...card.querySelectorAll('svg text')].map(text=>text.textContent!),facts};
  }));
}
async function setMapping(page:Page,source:Figure,target:Figure,to:number[]) {
  for(const [i,id] of source.ids.entries())await menu(page,`Kärjen ${id} vastine`).selectOption(target.ids[to[i]!]!);
}
async function match(page:Page,similar:boolean,overlay=false){
  const [source,...others]=await figures(page);
  const index=others.findIndex(target=>mapShape(source!,target,similar));
  expect(index).toBeGreaterThanOrEqual(0);
  const target=others[index]!,mapping=mapShape(source!,target,similar)!;
  await menu(page,'Sovitettava malli').selectOption({label:target.name});
  await setMapping(page,source!,target,mapping.to);
  if(similar)await field(page,'Pituuskerroin').fill(String(Math.round(mapping.k)));
  if(overlay){
    await btn(page,'Sovita ääriviivat').click();
    await expect(board(page).locator('[data-geo-overlay]')).toBeVisible();
  }
}
async function compass(page:Page,correct:boolean){
  const choices=await menu(page,'Kaaren säde').locator('option').evaluateAll(options=>options.slice(1).map(option=>option.getAttribute('value')!));
  const radius=choices[correct?2:0]!;
  for(const center of ['B','A']){
    await menu(page,'Kaaren keskipiste').selectOption(center);
    await menu(page,'Kaaren säde').selectOption(radius);
    await btn(page,'Piirrä kaari').press('Enter');
  }
  if(correct){
    await expect(board(page).locator('[data-geo-cut]')).toHaveCount(2);
    const marks=await board(page).locator('svg text').evaluateAll(elements=>elements.flatMap(element=>{
      const id=element.textContent!;
      if(!['A','B','M','P','Q'].includes(id))return [];
      const {x,y,width,height}=(element as SVGTextElement).getBBox();
      return [{id,x,y,width,height}];
    }));
    expect(marks.map(mark=>mark.id).sort()).toEqual(['A','B','M','P','Q']);
    for(const [i,a] of marks.entries())for(const b of marks.slice(i+1)){
      const horizontal=Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x);
      const vertical=Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y);
      expect(horizontal>0&&vertical>0,`${a.id} and ${b.id} overlap`).toBe(false);
    }
    await board(page).locator('[data-geo-cut="Q"] circle').last().click();
    await menu(page,'Lisää leikkauspiste').selectOption('P');
    await btn(page,'Merkitse piste').click();
  }else{
    await expect(board(page).locator('[data-geo-cut]')).toHaveCount(0);
    for(const point of ['P','Q']){
      await menu(page,'Lisää leikkauspiste').selectOption(point);
      await btn(page,'Merkitse piste').click();
    }
  }
  await field(page,'Pisteen etäisyys A:han').fill(radius);
  await field(page,'Pisteen etäisyys B:hen').fill(radius);
  await field(page,'Suorien kulma (°)').fill('90');
}
async function triangulate(page:Page,pivot=1) {
  const marks=await board(page).locator('[data-geo-point]').evaluateAll(elements=>elements.map(e=>e.getAttribute('data-geo-point')!));
  const n=marks.length;
  for(let i=2;i<n-1;i++){
    await menu(page,'Lävistäjän alku').selectOption(marks[pivot]!);
    await menu(page,'Lävistäjän loppu').selectOption(marks[(pivot+i)%n]!);
    await btn(page,'Piirrä lävistäjä').press('Space');
  }
  await field(page,'Kolmioiden määrä').fill(String(n-2));
  await field(page,'Sisäkulmien summa (°)').fill(String((n-2)*180));
  if(await field(page,'Yksi sisäkulma (°)').count())await field(page,'Yksi sisäkulma (°)').fill(`${(n-2)*180}/${n}`);
  else await menu(page,'Voiko jokaisen kulman päätellä jakamalla summan tasan?').selectOption('no');
}
const tags=['A','B','C','D'];
async function intersection(page:Page,wrong=false){
  const rendered=await board(page).locator('svg text').allTextContents();
  const shown=rendered.map(text=>/^([A-D]) (\d+)°$/.exec(text)).find(Boolean);
  if(shown){
    const i=tags.indexOf(shown[1]!),given=Number(shown[2]);
    for(let step=1;step<4;step++){
      const id=tags[(i+step)%4]!,opposite=step===2;
      await field(page,`${id} (°)`).fill(String(opposite?given:180-given));
      await menu(page,`Miten ${id} liittyy annettuun?`).selectOption(opposite&&!wrong?'vertical':'supplement');
    }
  }else{
    const difference=Number((await board(page).innerText()).match(/on (\d+)° suurempi/)![1]);
    const smaller=(180-difference)/2;
    for(const [i,id] of tags.entries())await field(page,`${id} (°)`).fill(String(i%2?180-smaller:smaller));
    await menu(page,'A:n ja B:n yhteinen sääntö').selectOption(wrong?'vertical':'supplement');
    await menu(page,'A:n ja C:n yhteinen sääntö').selectOption('vertical');
  }
}

test.describe('Kulmatuulen tarkka geometriapaja',()=>{
  test.beforeEach(async({page})=>{
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.addInitScript(()=>{
      const get=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,...args:unknown[]){
        return /^webgl/.test(type)?null:Reflect.apply(get,this,[type,...args]);
      } as typeof get;
    });
  });
  test('builds both compass intersections with either center order and rejects the tangent case',async({page})=>{
    await open(page,'M79-CONSTRUCT',0);
    await compass(page,false);await check(page,false);
    await expect(feedback(page)).toContainText('puolet');
    await btn(page,'Uusi kokeilu').click();await btn(page,'Pieni vihje').click();
    await expect(page.locator('.exp-help')).toContainText('kompassi');
    await compass(page,true);
    await expect(desk(page).locator('[data-geo-cuts]')).toContainText('Q ja P');
    await check(page,true);
  });
  test('matches all vertices under a rigid reflection and a uniform scale',async({page})=>{
    await open(page,'M79-CONGRUENCE',1);
    await match(page,false,true);await btn(page,'Peilaa sovitus').click();await check(page,true);
    await open(page,'M79-SIMILARITY',0);
    await match(page,true,true);await field(page,'Pituuskerroin').fill('1');await check(page,false);
    await expect(feedback(page)).toContainText('pituuskerroin');
    await btn(page,'Uusi kokeilu').click();
    await match(page,true);await check(page,true);
  });
  test('constructs the criterion correspondence and an actual counterexample pair',async({page})=>{
    await open(page,'M79-CONG-CRIT',0);
    const [source,target,...examples]=await figures(page);
    const pairing=mapShape(source!,target!)!;
    await setMapping(page,source!,target!,pairing.to);
    const sufficient=source!.facts.every(f=>!f.startsWith('∠'))?'SSS':'SAS';
    await menu(page,'Riittävä kriteeri').selectOption(sufficient);
    const normalized=(f:Figure)=>f.facts.map(fact=>fact.replace(/^(?:∠[A-Z]|[A-Z]{2}) /,'')).join('|');
    const correct=examples.flatMap((a,i)=>examples.slice(i+1).filter(b=>normalized(a)===normalized(b)&&!mapShape(a,b)).map(b=>[a,b]))[0]!;
    expect(correct).toHaveLength(2);
    for(const chosen of correct)await page.getByRole('checkbox',{name:chosen.name,exact:true}).check();
    await check(page,true);
  });
  test('accepts a nondefault fan triangulation and exact regular interior angle',async({page})=>{
    await open(page,'M79-POLY-ANGLES',1);
    await triangulate(page);
    await check(page,true);
  });
  test('produces a ray with two taps and extends a line beyond its visible segment',async({page})=>{
    await open(page,'M79-RAY',0);
    const opposite=(await page.locator('.exp-instruction').innerText()).includes('poispäin');
    await board(page).locator('[data-geo-point="A"]').click();
    await board(page).locator(`[data-geo-point="${opposite?'D':'C'}"]`).click();
    await menu(page,'Rakennetun viivan jatkuminen').selectOption('one');
    await expect(board(page).getByRole('img')).toHaveAttribute('aria-label',/Alku A/);
    await check(page,true);
    await open(page,'M79-LINEREL',1);
    for(let i=0;i<4;i++){
      const lines=await board(page).locator('svg path[stroke-width="3"]').evaluateAll(paths=>paths.map(path=>{
        const [x,y,xx,yy]=path.getAttribute('d')!.match(/-?[\d.]+/g)!.map(Number);
        return [xx!-x!,yy!-y!];
      }));
      const [[a,b],[c,d]]=lines as [[number,number],[number,number]];
      const parallel=Math.abs(a*d-b*c)<.01,perp=Math.abs(a*c+b*d)<.01;
      if(i===3){
        expect((await state(page)).phase).toBe('transfer');
        await expect(board(page).locator('svg circle')).toHaveCount(0);
      }
      await btn(page,'Jatka suoria').press('Enter');
      await expect(board(page).getByRole('img')).toHaveAttribute('aria-label',/jatkettuina/);
      if(i===3)await expect(board(page).locator('svg circle')).toHaveCount(1);
      await menu(page,'Suorat leikkaavat').selectOption(parallel?'no':'yes');
      await menu(page,'Suorat ovat kohtisuorassa').selectOption(perp?'yes':'no');
      await menu(page,'Suorat ovat yhdensuuntaiset').selectOption(parallel?'yes':'no');
      await check(page,true);
      if(i<2)await btn(page,'Seuraava kokeilu').click();
      if(i===2)await btn(page,'Kokeile uudessa tilanteessa').click();
    }
  });
  test('requires both rules in the same crossing, then awards transfer only after fresh work',async({page})=>{
    await open(page,'M79-ANGLE-REL',1);
    await intersection(page,true);await check(page,false);
    await btn(page,'Uusi kokeilu').click();
    for(let i=0;i<4;i++){
      if(i===3)expect((await state(page)).phase).toBe('transfer');
      await intersection(page);await check(page,true);
      if(i<2)await btn(page,'Seuraava kokeilu').click();
      if(i===2)await btn(page,'Kokeile uudessa tilanteessa').click();
    }
    expect((await state(page)).progress.checked).toBe(true);
  });
  for(const [name,width,height] of [['desktop',1366,768],['tablet',768,1024]] as const){
    test(`both families of all fourteen tasks fit the ${name} viewport`,async({page},info)=>{
      test.setTimeout(90_000);
      await page.setViewportSize({width,height});
      const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
      for(const id of ids){
        const families=new Set<string>();
        for(const seed of [0,1]){
          const snapshot=await open(page,id,seed);
          families.add(snapshot.family);
          if(id==='M79-CONGRUENCE'||id==='M79-SIMILARITY')await match(page,id==='M79-SIMILARITY',true);
          if(id==='M79-CONSTRUCT')await compass(page,true);
          if(id==='M79-POLY-ANGLES')await triangulate(page);
          await expect(page.locator('.exp-instruction'),id).toBeInViewport({ratio:1});
          await expect(board(page),id).toBeInViewport({ratio:1});
          for(const control of await desk(page).locator('button:visible,input:visible,select:visible').all())
            await expect(control,id).toBeInViewport({ratio:1});
          expect(await page.evaluate(()=>scrollY),id).toBe(0);
          if(seed===1&&['M79-CONSTRUCT','M79-CONG-CRIT','M79-POLY-ANGLES','M79-ANGLE-REL'].includes(id)){
            const file=`geometry-${id}-${name}.png`,path=info.outputPath(file);
            await page.screenshot({path});await info.attach(file,{path,contentType:'image/png'});
          }
        }
        expect(families.size,id).toBe(2);
      }
      expect(errors).toEqual([]);
    });
  }
});
