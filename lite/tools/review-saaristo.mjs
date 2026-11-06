// One-off browser content inspection. Run against a locally served production build.
// node lite/tools/review-saaristo.mjs http://127.0.0.1:5203/lite/ > receipt.json
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const origin = new URL(process.argv[2]);
assert(['localhost','127.0.0.1','[::1]'].includes(origin.hostname), 'Use a local build');
assert(origin.pathname.endsWith('/'), 'Include the trailing slash');
const catalog = JSON.parse(await readFile(new URL('../src/data/journey-catalog.json', import.meta.url)));
const ids = catalog.nodes.map(node => node.id).sort();
assert.equal(ids.length, 690);
assert.equal(new Set(ids).size, 690);
const checked = new Set((await (await fetch(new URL('lite-runtime.json',origin))).json()).runtimeAvailability.ids);
assert.equal(checked.size,181);
assert(ids.every(id => checked.has(id) === (catalog.nodes.find(n => n.id === id).scope === 'existing_181_exterior_wrapper')));
const hash = text => createHash('sha256').update(text).digest('hex');
const errors = [];
const rows = [];
const seed = 6102026;
origin.search = new URLSearchParams({qa:'1',seed:String(seed)}).toString();
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
  args: ['--disable-webgl'], // Exercise the low-end 2D rendering path for the full census.
});

async function atTopic(page,id,alreadyOpen) {
  if (alreadyOpen) {
    await page.evaluate(() => { location.hash = 'saaristo'; });
    await page.locator('.exp-home').waitFor();
  }
  await page.evaluate(id => { location.hash = 'saaristo/' + encodeURIComponent(id); },id);
  await page.waitForFunction(id => {
    if (!window.render_game_to_text) return false;
    const current = JSON.parse(window.render_game_to_text());
    return current.node === id && current.mode === 'intro';
  },id,{polling:20,timeout:6000});
}

function inspect(guided) {
  const desk = () => document.querySelector('.exp-desk');
  const read = selector => desk().querySelector(selector)?.innerText?.trim();
  const text = (s,label) => {
    if (!s || /\b(?:undefined|NaN)\b|\[object Object\]/.test(s)) throw Error('Missing or malformed ' + label);
    return s;
  };
  const click = (host,name) => {
    const b = [...host.querySelectorAll('button:not(:disabled)')].find(b => b.textContent.trim()===name);
    if (!b) throw Error('Missing button ' + name);
    b.click();
  };
  text(read('h1'),'title');
  text(read('.exp-instruction'),'intro');
  if (guided) {
    click(desk(),'Katso mallia');
    for (let step=0; !desk().querySelector('.exp-task'); step++) {
      if (step===30) throw Error('Demo never reaches the exercise');
      text(read('.exp-instruction'),'example');
      desk().querySelector('.exp-primary').click();
    }
  } else click(desk(),'Kokeilen itse');

  const task=desk().querySelector('.exp-task');
  const kind=task.dataset.taskKind;
  text(read('.exp-instruction'),'question');
  const controls=[...task.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"],[role="slider"]')];
  if (!controls.some(el=>el.getClientRects().length)) throw Error('No visible enabled answer control');
  click(desk(),'Pieni vihje');
  text(read('.exp-help:not([hidden])'),'hint');
  if(document.documentElement.scrollWidth>innerWidth+1) throw Error('Horizontal page overflow: ' + document.documentElement.scrollWidth);
  let feedback=false;
  if (kind==='choice' || kind==='numeric') {
    if (kind==='choice') task.querySelector('.opt').click();
    else { click(task,'1'); click(task,'OK'); }
    const status=desk().querySelector('.exp-feedback');
    if (!status.hasAttribute('data-ok')) throw Error('No response verdict');
    text(status.querySelector('p')?.innerText,'response feedback');
    if (status.dataset.ok==='false') {
      click(status,'Näytä ja selitä');
      text(status.querySelector('p')?.innerText,'worked explanation');
    }
    feedback=true;
  }
  return {kind,feedback};
}

async function inspectGroup(group,width) {
  const ctx=await browser.newContext({ viewport:{width,height:width===390?844:800}, reducedMotion:'reduce' });
  const page=await ctx.newPage();
  let topic='';
  page.on('pageerror',e=>errors.push({width,topic,error:e.message}));
  page.on('response',r=>{if (r.status()>=400) errors.push({width,topic,status:r.status(),path:new URL(r.url()).pathname});});
  await page.goto(origin.href);
  for (const id of group) {
    topic=id;
    try {
      await atTopic(page,id,false);
      const guided=await page.evaluate(inspect,true);
      await atTopic(page,id,true);
      const independent=await page.evaluate(inspect,false);
      rows.push({id,width,guided,independent});
    } catch(e) { errors.push({width,topic,error:e.message.split('\n')[0]}); }
  }
  await ctx.close();
}

try {
  await Promise.all([390,1280].flatMap(width=>[0,1].map(parity=>inspectGroup(ids.filter((_,i)=>i%2===parity),width))));
  const summary=[390,1280].map(width=>{
    const done=rows.filter(r=>r.width===width).sort((a,b)=>a.id.localeCompare(b.id,'en'));
    return {width,completed:done.length,checked181:done.filter(r=>checked.has(r.id)).length,
      candidate509:done.filter(r=>!checked.has(r.id)).length,
      simpleAnswerFeedback:{guided:done.filter(r=>r.guided.feedback).length,independent:done.filter(r=>r.independent.feedback).length},
      completedIdsSha256:hash(done.map(r=>r.id).sort().join('\n'))};
  });
  console.log(JSON.stringify({schema:'saaristo-one-off-browser/1',seed,engine:'Chromium '+browser.version(),renderer:'painted fallback',
    catalogIdsSha256:hash(ids.join('\n')),summary,errors},null,2));
  if (rows.length!==1380 || errors.length) process.exitCode=1;
} finally { await browser.close(); }
