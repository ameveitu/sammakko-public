import {test,expect,type Page} from '@playwright/test';
import {FINALE_CHAPTERS,FINALE_SECONDS} from '../src/content/finale';
test.use({viewport:{width:1280,height:900},launchOptions:{args:['--enable-unsafe-swiftshader']}});
const state=(p:Page)=>p.evaluate(()=>JSON.parse(window.render_game_to_text!()));
/** The picture story is the default; the 3D film starts from its button. */
async function open3d(page:Page){await page.goto('./?qa=1#saaristo/loppu');await expect(page.locator('.ep-art > svg')).toBeVisible();await page.getByRole('button',{name:'3D-elokuva',exact:true}).click();}
test('the picture story is the default and loads no 3D film until asked',async({page})=>{
  await page.goto('./?qa=1#saaristo/loppu');await expect(page.locator('.ep-art > svg')).toBeVisible();
  const s=await state(page);expect(s.pictureMode).toBe(true);expect(s.film).toBeNull();await expect(page.locator('.ep-film canvas')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'3D-elokuva',exact:true})).toHaveAttribute('aria-pressed','false');
});
async function seek(page:Page,t:number){
  await page.getByRole('slider',{name:'Etene tarinassa'}).evaluate((element,t)=>{const input=element as HTMLInputElement;input.value=String(t);input.dispatchEvent(new Event('input',{bubbles:true}));},t);
  await expect.poll(async()=>(await state(page)).film.time).toBe(t);
}
test('all35 screenplay shots render through the real Saaristo film and the final child has only the original bill',async({page},info)=>{
  test.setTimeout(240000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});await page.emulateMedia({reducedMotion:'reduce'});
  await open3d(page);await expect.poll(async()=>(await state(page)).film.status,{timeout:45000}).toBe('ready');
  await expect(page.locator('.ep-film')).toHaveAttribute('data-saaristo-sky','ready');
  const shots=FINALE_CHAPTERS.flatMap(c=>c.shots),capture=new Set(['water','winter','adult-bank','hatch','map','tools','keepsakes','choice','feast','wood-box','bench','embrace','departure','launch','islands','cabin','notebook','evening-nest','shell','crack','bill']);
  for(let i=0;i<shots.length;i++){
    const shot=shots[i]!,end=shots[i+1]?.start??FINALE_SECONDS,t=(shot.start+end)/2;await seek(page,t);
    const s=await state(page);expect(s.film.art).toBe(shot.art);expect(s.film.status).toBe('ready');await expect(page.locator('.ep-film')).toHaveAttribute('data-ready','true');
    if(shot.art==='bill')expect(s.film.babyParts.sort()).toEqual(['Lower_bill','Upper_bill']);else expect(s.film.babyParts).toEqual([]);
    if(shot.art==='bench')expect(s.film.actors).toEqual([expect.objectContaining({id:'sisi',clip:'sleep'})]);
    if(capture.has(shot.art))await page.locator('.ep-screen').screenshot({path:info.outputPath(`film-${String(i).padStart(2,'0')}-${shot.art}.png`)});
  }
  expect(errors).toEqual([]);await expect(page.getByRole('button',{name:'Palaa saaristoon',exact:true})).not.toBeVisible();
  await seek(page,FINALE_SECONDS);await expect(page.getByRole('button',{name:'Palaa saaristoon',exact:true})).toBeVisible();
});
test('film music follows playback and cancels every voice on pause, seek and mute',async({page})=>{
  test.setTimeout(90000);await open3d(page);await expect.poll(async()=>(await state(page)).film.status,{timeout:45000}).toBe('ready');
  await page.getByRole('button',{name:'Äänet',exact:true}).click();expect((await state(page)).audio.activeVoices).toBe(0);expect((await state(page)).playing).toBe(false);
  await seek(page,58);await page.getByRole('button',{name:'Jatka',exact:true}).click();await expect.poll(async()=>(await state(page)).audio.activeVoices).toBeGreaterThan(0);
  await page.getByRole('button',{name:'Pysäytä',exact:true}).click();expect((await state(page)).audio.activeVoices).toBe(0);
  await seek(page,224);expect((await state(page)).audio.activeVoices).toBe(0);
  await page.getByRole('button',{name:'Jatka',exact:true}).click();await expect.poll(async()=>(await state(page)).audio.activeVoices).toBeGreaterThan(0);
  await page.getByRole('button',{name:'Äänet',exact:true}).click();expect((await state(page)).audio.activeVoices).toBe(0);expect((await state(page)).audible).toBe(false);
});
test('pause, backward seek, picture fallback and exit preserve unrelated learner storage',async({page})=>{
  test.setTimeout(90000);await page.emulateMedia({reducedMotion:'no-preference'});await open3d(page);
  await expect.poll(async()=>(await state(page)).film.status,{timeout:45000}).toBe('ready');
  const saved=await page.evaluate(()=>JSON.stringify({...localStorage}));await seek(page,312);const frame=(await state(page)).film;
  await seek(page,449);await seek(page,312);expect((await state(page)).film.actors).toEqual(frame.actors);
  await page.getByRole('button',{name:'Jatka',exact:true}).click();await expect.poll(async()=>(await state(page)).time).toBeGreaterThan(312);
  await page.getByRole('button',{name:'Pysäytä',exact:true}).click();const stopped=(await state(page)).time;await page.waitForTimeout(200);expect((await state(page)).time).toBe(stopped);
  await page.getByRole('button',{name:'3D-elokuva',exact:true}).click();await expect(page.locator('.ep-film')).toHaveAttribute('data-ready','false');await expect(page.locator('.ep-art > svg')).toBeVisible();
  await page.getByRole('button',{name:'3D-elokuva',exact:true}).click();await expect(page.locator('.ep-film')).toHaveAttribute('data-ready','true');
  expect(await page.evaluate(()=>JSON.stringify({...localStorage}))).toBe(saved);
  await page.getByRole('button',{name:'Ohita tarina',exact:true}).click();await expect(page.locator('.ep-film')).toHaveCount(0);
  expect(await page.evaluate(()=>JSON.stringify({...localStorage}))).toBe(saved);
});
test('loss of WebGL preserves the current story, captions and controls',async({page})=>{
  await open3d(page);await expect.poll(async()=>(await state(page)).film.status,{timeout:45000}).toBe('ready');await seek(page,184);
  const lost=await page.evaluate(()=>{const canvas=document.querySelector<HTMLCanvasElement>('.ep-film canvas'),extension=canvas?.getContext('webgl2')?.getExtension('WEBGL_lose_context');if(!extension)return false;extension.loseContext();return true;});expect(lost).toBe(true);
  await expect(page.locator('.ep-film')).toHaveAttribute('data-ready','false');await expect(page.locator('.ep-art > svg')).toBeVisible();await expect(page.getByText('Sinä saat lähteä. Minä saan jäädä. Me saamme silti olla me.',{exact:false}).first()).toBeVisible();
  await seek(page,512);expect((await state(page)).film.art).toBe('bill');
});
