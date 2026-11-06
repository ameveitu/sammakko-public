import { expect,test,type Page } from '@playwright/test';

const ids=['M-PROG-01','M-PROG-02','M-PROG-04','M-PROG-05','M-PROG-06','M-PROG-07','M-PROG-EVALUATE','M-PROG-TEST','M-PROG-03'] as const;
type Id=typeof ids[number];
type Direction='north'|'east'|'south'|'west';
type Move='Eteen'|'Vasemmalle'|'Oikealle'|'Odota';
type Cell={x:number;y:number};
type Pose=Cell&{heading:Direction};
type Chart={board:{width:number;height:number;rocks:Cell[]};start:Pose;goal?:{destination:Cell;heading?:Direction;via?:Cell[]}};
const vec:Record<Direction,[number,number]>={north:[0,-1],east:[1,0],south:[0,1],west:[-1,0]};
const same=(a:Cell,b:Cell)=>a.x===b.x&&a.y===b.y;
const coord=(cell:Cell)=>`${String.fromCharCode(65+cell.x)}${cell.y+1}`;
const btn=(page:Page,name:string)=>page.getByRole('button',{name,exact:true});
const menu=(page:Page,name:string)=>page.getByRole('combobox',{name,exact:true});
const board=(page:Page)=>page.locator('.programming-ferry-board');
const feedback=(page:Page)=>page.locator('.exp-feedback');
const snapshot=(page:Page)=>page.evaluate(()=>JSON.parse(window.render_game_to_text!()));
const receipts=(page:Page)=>page.evaluate(()=>JSON.parse(localStorage.getItem('sammakko-journey-3')??'{"attempts":[]}').attempts);
const script=(page:Page)=>board(page).locator('[aria-label="Annettu käskyjono"] span').evaluateAll(elements=>
  elements.map(el=>el.textContent!.split(' ').at(-1)! as Move));

function oracle(chart:Chart,commands:readonly Move[]){
  const states:Pose[]=[],visited:Cell[]=[{x:chart.start.x,y:chart.start.y}];
  let pose={...chart.start},status='complete';
  for(const command of commands){
    const [a,b]=vec[pose.heading];
    if(command==='Vasemmalle'||command==='Oikealle'){
      const [x,y]=command==='Vasemmalle'?[b,-a]:[-b,a];
      pose.heading=Object.keys(vec).find(key=>vec[key as Direction][0]===x&&vec[key as Direction][1]===y)! as Direction;
    }
    if(command==='Eteen'){
      const next={x:pose.x+a,y:pose.y+b};
      if(next.x<0||next.y<0||next.x>=chart.board.width||next.y>=chart.board.height)status='edge';
      else if(chart.board.rocks.some(rock=>same(rock,next)))status='rock';
      else{pose={...pose,...next};visited.push(next);}
    }
    states.push({...pose});
    if(status!=='complete')break;
  }
  let next=0;
  const docks=chart.goal?.via??[];
  for(const cell of visited)if(docks[next]&&same(docks[next]!,cell))next++;
  return {pose,status,states,visited,conditions:{
    destination:!chart.goal||same(chart.goal.destination,pose),heading:!chart.goal?.heading||chart.goal.heading===pose.heading,via:next===docks.length,
  },docksVisited:next};
}
function findProgram(chart:Chart):Move[]{
  const pending:Move[][]=[[]],visited=new Set<string>();
  while(pending.length){
    const code=pending.shift()!,run=oracle(chart,code);
    if(run.status!=='complete')continue;
    if(Object.values(run.conditions).every(Boolean))return code;
    const state=`${coord(run.pose)}:${run.pose.heading}:${run.docksVisited}`;
    if(visited.has(state))continue;
    visited.add(state);
    for(const action of ['Eteen','Vasemmalle','Oikealle'] as const)pending.push([...code,action]);
  }
  throw new Error('No feasible route on visible board');
}
async function open(page:Page,id:Id,seed=1){
  await page.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);
  await btn(page,'Kokeilen itse').click();
  await expect(board(page)).toBeVisible();
  return snapshot(page);
}
async function fillPose(page:Page,prefix:string,pose:Pose){
  await menu(page,prefix+'Ruutu').selectOption(coord(pose));
  await menu(page,prefix+'Keula').selectOption(pose.heading);
}
async function observation(page:Page,run:ReturnType<typeof oracle>){
  await fillPose(page,'Havainto · ',run.pose);
  await menu(page,'Havainto · Ajotulos').selectOption(run.status);
  for(const [label,condition] of [['Kohderuutu',run.conditions.destination],['Keulaehto',run.conditions.heading],['Välilaiturit',run.conditions.via]] as const){
    if(await menu(page,label).count())await menu(page,label).selectOption(condition?'yes':'no');
  }
}
async function check(page:Page,yes:boolean) {
  await btn(page,'Tarkista').click();
  await expect(feedback(page)).toHaveAttribute('data-ok',String(yes));
}
async function enter(page:Page,moves:readonly Move[]){
  for(const command of moves)await btn(page,command).press('Space');
}

test.describe('Ohjelmointilauttojen tarkka kartta',()=>{
  test.beforeEach(async({page})=>{
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.addInitScript(()=>{
      const get=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,...args:unknown[]){
        return /^webgl/.test(type)?null:Reflect.apply(get,this,[type,...args]);
      } as typeof get;
    });
  });
  test('follows each command, records every state, and supports undo without recording mastery',async({page})=>{
    const initial=await open(page,'M-PROG-01',1);
    const given=await script(page),expected=oracle(initial.model,given);
    await btn(page,'Odota').click();
    await btn(page,'Kumoa askel').click();
    for(const [index,command] of given.entries()){
      await btn(page,command).press('Space');
      await fillPose(page,'Askel · ',expected.states[index]!);
      await btn(page,'Kirjaa askel').click();
    }
    expect(await receipts(page)).toHaveLength(0);
    await check(page,true);
    expect(await receipts(page)).toHaveLength(1);
  });
  test('allows an own valid route and builds a separate pre-code plan by map and keyboard',async({page})=>{
    const scenario=(await open(page,'M-PROG-02',1)).model as Chart;
    const commands=findProgram(scenario);
    await enter(page,['Odota',...commands]);
    await btn(page,'Aja ohjelma').press('Enter');
    expect(await receipts(page)).toHaveLength(0);
    await check(page,true);
    const planning=(await open(page,'M-PROG-05',0)).model as Chart;
    const path=oracle(planning,findProgram(planning)).visited;
    const stops=path.filter((cell,i)=>i>0&&(!path[i+1]||
      cell.x-path[i-1]!.x!==path[i+1]!.x-cell.x||cell.y-path[i-1]!.y!==path[i+1]!.y-cell.y));
    expect(stops.length).toBeGreaterThanOrEqual(2);
    await board(page).locator(`[data-ferry-cell="${coord(stops[0]!)}"]`).click();
    for(const stop of stops.slice(1)){
      await menu(page,'Osuuden pääteruutu').selectOption(coord(stop));
      await btn(page,'Lisää osuus').press('Enter');
    }
    await check(page,true);
  });
  test('locks forecast before execution and rejects a wrong forecast even with a right observation',async({page})=>{
    const predict=async(wrong:boolean)=>{
      const chart=(await snapshot(page)).model as Chart,expected=oracle(chart,await script(page));
      await expect(btn(page,'Askella')).toHaveCount(0);
      await expect(board(page)).not.toContainText('Kohde:');
      expect(chart.goal).toBeUndefined();
      await fillPose(page,'Ennuste · ',expected.pose);
      await menu(page,'Ennuste · Ajotulos').selectOption(wrong?(expected.status==='complete'?'rock':'complete'):expected.status);
      await btn(page,'Lukitse ennuste').press('Enter');
      await expect(menu(page,'Ennuste · Ruutu')).toHaveCount(0);
      const locked=await board(page).locator('[data-ferry-forecast]').innerText();
      await btn(page,'Aja ohjelma').click();
      await expect(board(page).locator('[data-ferry-forecast]')).toHaveText(locked);
      await observation(page,expected);
      await check(page,!wrong);
    };
    await open(page,'M-PROG-04',1);
    await predict(true);
    await expect(feedback(page)).toContainText('ennustetta');
    await btn(page,'Uusi kokeilu').click();
    await btn(page,'Pieni vihje').click();
    await expect(page.locator('.exp-help')).toContainText('lähtösuuntaa');
    await predict(false);
  });
  test('repairs the second departure with separate observations for each actual run',async({page})=>{
    for(const seed of [0,1]){
      const initial=await open(page,'M-PROG-07',seed),first=initial.model as Chart;
      const given=await script(page),program=given.length?given:findProgram(first);
      if(!given.length)await enter(page,program);
      const firstRun=oracle(first,program);
      await btn(page,'Aja ohjelma').click();
      await observation(page,firstRun);
      await btn(page,'Kirjaa ajo 1').click();
      const second=(await snapshot(page)).model as Chart,secondRun=oracle(second,program);
      expect(second.start.heading).not.toBe(first.start.heading);
      expect(secondRun.status!=='complete'||!Object.values(secondRun.conditions).every(Boolean)).toBe(true);
      await btn(page,'Askella').press('Space');
      await btn(page,'Aja ohjelma').click();
      await observation(page,secondRun);
      await btn(page,'Kirjaa ajo 2').click();
      await btn(page,'Tyhjennä').click();
      const repaired=findProgram(second);
      await enter(page,repaired);
      await btn(page,'Aja ohjelma').click();
      await observation(page,oracle(second,repaired));
      const before=(await receipts(page)).length;
      await check(page,true);
      const after=await receipts(page);
      expect(after).toHaveLength(before+1);
      const reply=JSON.parse(after.at(-1).resp);
      expect(reply.observations).toHaveLength(3);
      expect(reply).not.toHaveProperty('preview');
    }
  });
  test('detects the first deviation after actually executing the test, then checks all goal conditions',async({page})=>{
    const chart=(await open(page,'M-PROG-03',1)).model as Chart,commands=await script(page);
    const run=oracle(chart,commands);
    await expect(menu(page,'Ensimmäinen ero')).toHaveCount(0);
    await btn(page,'Askella').click();
    await expect(board(page).locator('[data-ferry-result]')).toContainText(coord(run.states[0]!));
    await btn(page,'Aja ohjelma').click();
    const expected=(await board(page).locator('[data-ferry-reference]').innerText()).split(/ · (?=\d+\.)/);
    const difference=run.states.findIndex((_,i)=>i>=expected.length);
    await observation(page,run);
    await menu(page,'Ensimmäinen ero').selectOption(difference<0?'none':String(difference));
    await menu(page,'Keulaehto').selectOption(run.conditions.heading?'no':'yes');
    await check(page,false);
    await expect(feedback(page)).toContainText('kukin erikseen');
  });
  for(const [name,width,height] of [['desktop',1366,768],['tablet',768,1024]] as const){
    test(`keeps both families of every task playable in the ${name} viewport`,async({page},info)=>{
      test.setTimeout(75_000);
      const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
      await page.setViewportSize({width,height});
      for(const id of ids){
        const families=new Set<string>();
        for(const seed of [0,1]){
          const state=await open(page,id,seed);
          families.add(state.family);
          if(['M-PROG-TEST','M-PROG-03','M-PROG-07'].includes(id))await btn(page,'Aja ohjelma').click();
          if(id==='M-PROG-04'){
            const forecast=oracle(state.model,await script(page));
            await fillPose(page,'Ennuste · ',forecast.pose);
            await menu(page,'Ennuste · Ajotulos').selectOption(forecast.status);
            await btn(page,'Lukitse ennuste').click();
            await btn(page,'Aja ohjelma').click();
          }
          await expect(page.locator('.exp-instruction'),id).toBeInViewport({ratio:1});
          await expect(board(page),id).toBeInViewport({ratio:1});
          for(const control of await page.locator('.exp-task button:visible,.exp-task select:visible').all())
            await expect(control,id).toBeInViewport({ratio:1});
          expect(await page.evaluate(()=>scrollY),id).toBe(0);
          if(seed===1&&(id==='M-PROG-07'||id==='M-PROG-03')){
            const file=`ferry-${id}-${name}.png`,path=info.outputPath(file);await page.screenshot({path});
            await info.attach(file,{path,contentType:'image/png'});
          }
        }
        expect(families.size,id).toBe(2);
      }
      expect(errors).toEqual([]);
    });
  }
});

test.use({launchOptions:{args:['--enable-unsafe-swiftshader']}});
test('renders actual ferry pose and path in WebGL after a manual step',async({page},info)=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:1366,height:768});
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  const state=await open(page,'M-PROG-TEST',0);
  expect(state.renderer).toBe('webgl');
  const given=await script(page),expected=oracle(state.model,given.slice(0,1));
  await btn(page,'Askella').click();
  const stage=(await snapshot(page)).stage;
  expect(stage).toMatchObject({kind:'programming-ferry',pose:expected.pose,step:1,path:expected.visited});
  expect(await receipts(page)).toHaveLength(0);
  await page.evaluate(()=>window.advanceTime?.(100));
  const file='programming-ferry-webgl.png',path=info.outputPath(file);await page.screenshot({path});
  await info.attach(file,{path,contentType:'image/png'});
  expect(errors).toEqual([]);
});
