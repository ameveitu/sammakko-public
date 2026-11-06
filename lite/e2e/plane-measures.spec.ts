import { expect,test,type Page } from '@playwright/test';
import { planeMeasuresSpecs } from '../src/content/plane-measures';
import type { PlaneMeasuresTask } from '../src/content/models/plane-measures';
import { rng } from '../src/engine/rng';

type State={renderer:string;phase:string;lastOk?:boolean;progress:{checked:boolean}};
type Point=readonly [number,number];
type Diagram=Map<string,Point>;
const work=(p:Page)=>p.locator('[data-plane-measures]');
const exact=(p:Page)=>p.locator('.exp-exact');
const b=(p:Page,name:string)=>p.getByRole('button',{name,exact:true});
const f=(p:Page,name:string)=>p.getByLabel(name,{exact:true});
const select=(p:Page,name:string,value:string)=>f(p,name).selectOption(value);
const fill=(p:Page,name:string,value:number|string)=>f(p,name).fill(String(value));
const state=(p:Page):Promise<State>=>p.evaluate(()=>JSON.parse(window.render_game_to_text!()));
const verify=(p:Page,ok:boolean)=>expect.poll(async()=>(await state(p)).lastOk).toBe(ok);
const startSeed=(id:string,tag:string)=>Array.from({length:30},(_,i)=>i).find(seed=>
  planeMeasuresSpecs.find(n=>n.id===id)!.item(rng(seed),'guided').tag===tag)!;
const length=([ax,ay]:Point,[bx,by]:Point)=>Math.hypot(bx-ax,by-ay);
const area=(points:Point[])=>Math.abs(points.reduce((n,[x,y],i)=>{
  const [xx,yy]=points[(i+1)%points.length]!;return n+x*yy-y*xx;
},0))/2;
const areaOf=(map:Diagram,ids:string)=>area([...ids].map(id=>map.get(id)!));

async function fallback(p:Page){
  await p.addInitScript(()=>{
    const old=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,...args:unknown[]){
      return /^webgl/.test(type)?null:Reflect.apply(old,this,[type,...args]);
    } as typeof old;
  });
}
async function start(p:Page,id:string,seed:number,independent=false){
  if(p.url()!=='about:blank')await p.goto('about:blank');
  await p.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);
  await b(p,independent?'Kokeilen itse':'Tutkitaan yhdessä').click();
  await expect(work(p)).toBeVisible();
}
async function diagram(p:Page,index=0):Promise<Diagram>{
  const points=await work(p).locator('svg').nth(index).locator('[data-plane-point]').evaluateAll(nodes=>nodes.map(n=>
    [n.getAttribute('data-plane-point')!,[Number(n.getAttribute('data-plane-x')),Number(n.getAttribute('data-plane-y'))]] as const));
  return new Map(points);
}
async function cut(p:Page,a:string,z:string){
  await select(p,'Leikkauksen alku',a);await select(p,'Leikkauksen loppu',z);await b(p,'Lisää leikkaus').click();
}
async function unit(p:Page){
  return (await exact(p).innerText()).includes('1 m.')?'m':'cm';
}

test('learner traces the concave boundary in reverse and uses only the outer side lengths',async({page})=>{
  await fallback(page);await start(page,'M79-POLY-PERIM',startSeed('M79-POLY-PERIM','concave-notch-trace'));
  const map=await diagram(page),ids=[...map.keys()].reverse();
  const text=await exact(page).innerText();
  const [,a,z]=text.match(/([A-Z])–([A-Z]) \?/)!;
  const missing=length(map.get(a!)!,map.get(z!)!);
  const total=ids.reduce((sum,id,i)=>sum+length(map.get(id)!,map.get(ids[(i+1)%ids.length]!)!),0);
  for(const id of [...ids,ids[0]!])await work(page).locator(`svg [data-plane-point="${id}"]`).click();
  await fill(page,'Puuttuvan sivun pituus',missing);await fill(page,'Piiri',total);
  await select(page,'Tuloksen yksikkö','cm');
  await b(page,'Valmis').press('Enter');
  await verify(page,true);
});

async function solveTriangles(p:Page,wrong=false){
  const count=await work(p).locator('svg').count();
  let external=false;
  for(let index=0;index<count;index++){
    const prefix=count===1?'':`Kolmio ${index+1} · `;
    const baseLabel=await f(p,prefix+'Kanta').locator('option').nth(1).innerText();
    const [a,b]=baseLabel.split('–') as [string,string];
    await select(p,prefix+'Kanta','0');
    const map=await diagram(p,index),vertex=['A','B','C'].find(v=>v!==a&&v!==b)!;
    const from=map.get(a)!,to=map.get(b)!,tip=map.get(vertex)!;
    const dx=to[0]-from[0],dy=to[1]-from[1];
    const t=((tip[0]-from[0])*dx+(tip[1]-from[1])*dy)/(dx*dx+dy*dy);
    external ||= t<0||t>1;
    const [footId,foot]=[...map.entries()].find(([,p])=>p[0]===from[0]+t*dx&&p[1]===from[1]+t*dy)!;
    await select(p,prefix+'Kärki',vertex);
    await select(p,prefix+'Korkeuden jalkapiste',wrong&&index===0?a:footId);
    await fill(p,prefix+'Kannan pituus',length(from,to));await fill(p,prefix+'Korkeus',length(tip,foot));
    await fill(p,prefix+'Pinta-ala',areaOf(map,'ABC'));
  }
  await select(p,'Tuloksen yksikkö',(await unit(p))+'²');
  await b(p,'Valmis').click();
  return external;
}

test('an obtuse altitude lands on the extended base and a wrong foot supports hint recovery',async({page},testInfo)=>{
  await fallback(page);await page.setViewportSize({width:768,height:1024});
  await start(page,'M79-TRI-AREA',startSeed('M79-TRI-AREA','external-same-area'),true);
  expect(await solveTriangles(page,true)).toBe(true);
  await verify(page,false);
  await expect(page.locator('.exp-feedback')).toContainText('kohtisuorasti');
  await b(page,'Uusi kokeilu').click();await b(page,'Pieni vihje').click();
  await solveTriangles(page);await verify(page,true);
  await page.screenshot({path:testInfo.outputPath('triangle-recovery.png')});
});

async function solveComposite(p:Page){
  const map=await diagram(p);
  const [bx,by]=map.get('B')!,[cx,cy]=map.get('C')!,[dx,dy]=map.get('D')!;
  const roof=(dx-cx)*(cx-bx)+(dy-cy)*(cy-by)>0;
  const parts=roof?['ABC','ACDE']:['ABDE','BCD'];
  await cut(p,roof?'A':'B',roof?'C':'D');
  let total=0;
  for(const part of parts){
    const value=areaOf(map,part);total+=value;
    await fill(p,`Osan ${[...part].sort().join('')} pinta-ala`,value);
  }
  if(map.has('I')){const opening=areaOf(map,'IJKL');await fill(p,'Aukon pinta-ala',opening);total-=opening;}
  await fill(p,'Koko pinta-ala',total);await select(p,'Tuloksen yksikkö',(await unit(p))+'²');
  await b(p,'Valmis').click();
}
test('crossing cuts are rejected despite the exact total area',async({page})=>{
  await fallback(page);await start(page,'M79-POLY-AREA',startSeed('M79-POLY-AREA','roof-and-yard'),true);
  const map=await diagram(page);
  await cut(page,'A','C');await cut(page,'B','E');
  await fill(page,'Koko pinta-ala',areaOf(map,'ABCDE'));await select(page,'Tuloksen yksikkö','cm²');
  await b(page,'Valmis').click();await verify(page,false);
  await expect(page.locator('.exp-feedback')).toContainText('päällekkäisyyttä');
});
test('three own alternate partitions transfer to an area with a real hole',async({page},testInfo)=>{
  await fallback(page);await page.setViewportSize({width:1366,height:768});
  await start(page,'M79-POLY-AREA',2,true);
  for(let i=0;i<3;i++){
    await solveComposite(page);await verify(page,true);
    await b(page,i===2?'Kokeile uudessa tilanteessa':'Seuraava kokeilu').click();
  }
  expect((await state(page)).phase).toBe('transfer');
  expect((await diagram(page)).has('I')).toBe(true);
  await solveComposite(page);await verify(page,true);
  expect((await state(page)).progress.checked).toBe(true);
  await page.screenshot({path:testInfo.outputPath('opening.png')});
});

test('three area conversions transfer to a nonadjacent unit and grouped square',async({page})=>{
  await fallback(page);await start(page,'M79-UNIT-AREA',3,true);
  const lengths:Record<string,number>={'mm²':1,'cm²':10,'dm²':100,'m²':1000};
  for(let i=0;i<4;i++){
    const [,value,from,to]=(await exact(page).innerText()).match(/Muunna ([\d,]+) (\S+) yksikköön (\S+)\./)!;
    const a=lengths[from!]!,z=lengths[to!]!,step=Math.max(a,z)/Math.min(a,z);
    const quantity=Number(value!.replace(',','.'));
    if(i===3){
      expect((await state(page)).phase).toBe('transfer');
      expect(step).toBe(100);
      await expect(work(page).getByRole('img',{name:'Suuren ruudun lohkot ja yhden lohkon sisäruudut'})).toBeVisible();
    }
    await fill(page,'Pituuskerroin leveyteen',step);await fill(page,'Pituuskerroin korkeuteen',step);
    await fill(page,'Pinta-alan muunnoskerroin',step**2);
    await select(page,'Muunnoksen laskutoimitus',a>z?'multiply':'divide');
    await fill(page,'Muunnettu pinta-ala',a>z?quantity*step**2:`${2*quantity}/${2*step**2}`);
    await select(page,'Tuloksen yksikkö',to!);
    await b(page,'Valmis').click();await verify(page,true);
    if(i<3)await b(page,i===2?'Kokeile uudessa tilanteessa':'Seuraava kokeilu').click();
  }
  expect((await state(page)).progress.checked).toBe(true);
});

for(const [width,height] of [[1366,768],[768,1024]]){
  test(`all ten plane-measure families keep the active board and controls visible at ${width}×${height}`,async({page})=>{
    await fallback(page);await page.setViewportSize({width:width!,height:height!});
    for(const spec of planeMeasuresSpecs){
      const tags=new Set<string>();
      for(let seed=0;seed<30&&tags.size<2;seed++){
        const item=spec.item(rng(seed),'guided'),task=item.task as unknown as PlaneMeasuresTask;
        if(tags.has(item.tag))continue;tags.add(item.tag);
        await start(page,spec.id,seed);
        if(task.mode==='partition'){
          if(task.altitude){await select(page,'Kanta','0');await select(page,'Kärki',task.altitude.apex);}
          if(task.shape==='quad')await cut(page,'A','C');
          else{const map=await diagram(page),[x,y]=map.get('D')!,[bx,by]=map.get('B')!,[cx,cy]=map.get('C')!;
            if((x-cx)*(cx-bx)+(y-cy)*(cy-by)>0)await cut(page,'C','E');else await cut(page,'A','D');}
        }
        for(const control of [exact(page),...await work(page).locator('svg,select,input,button').all()]){
          const bounds=await control.boundingBox(),key=`${spec.id}/${item.tag}/${await control.getAttribute('aria-label')??await control.textContent()}`;
          expect(bounds,key).not.toBeNull();expect(bounds!.x,key).toBeGreaterThanOrEqual(0);
          expect(bounds!.x+bounds!.width,key).toBeLessThanOrEqual(width!+1);
          expect(bounds!.y,key).toBeGreaterThanOrEqual(0);expect(bounds!.y+bounds!.height,key).toBeLessThanOrEqual(height!);
        }
      }
      expect(tags.size).toBe(2);
    }
  });
}
