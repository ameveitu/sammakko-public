import {assertPackageRevision} from '../../test-package-revision-helper.mjs';
/* global document, window, innerWidth, MouseEvent */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:http';
import * as logic from './lesson.mjs';
import {loadPackages} from '../../content.mjs';
const directory=path.dirname(fileURLToPath(import.meta.url)),kc=path.basename(directory),network=path.resolve(directory,'../..');
const p=JSON.parse(fs.readFileSync(path.join(directory,'lesson.json'),'utf8'));
const canonical=JSON.parse(fs.readFileSync(path.join(network,'reference/inputs/canonical-690-graph.json'),'utf8')).nodes.find(n=>n.id===kc);
assert.equal(p.state,'draft');const boundRevision = assertPackageRevision(import.meta.url,2);assert.equal(p.planning.canonicalRole,'process');assert.equal(p.planning.gradeBand,canonical.grade_band);assert.deepEqual(p.planning.canonicalPrerequisiteGroups,canonical.prerequisite_groups);assert.deepEqual(p.planning.strongSupport,canonical.relations.filter(r=>r.strength==='strong'));assert.equal(p.planning.dynamicPrerequisiteRule,canonical.dynamic_prerequisite_rule??null);
assert(p.research.every(r=>r.url.startsWith('https://')&&r.retrieved==='2026-10-29'&&r.title&&r.organization&&r.adopted.length&&r.rejected.length&&r.usageRestrictions));
const body=fs.readFileSync(path.join(directory,'body.html'),'utf8'),module=fs.readFileSync(path.join(directory,'lesson.mjs'),'utf8');assert(!/localStorage|sessionStorage|fetch\(|indexedDB|setInterval|setTimeout|speechSynthesis|\beval\s*\(/.test(module));
const temp=fs.mkdtempSync(path.join(os.tmpdir(),kc+'-source-'));
try{
 fs.mkdirSync(path.join(temp,'packages'),{recursive:true});fs.cpSync(directory,path.join(temp,'packages',kc),{recursive:true});fs.mkdirSync(path.join(temp,'reference/inputs'),{recursive:true});fs.copyFileSync(path.join(network,'reference/inputs/mvp-scope-181.json'),path.join(temp,'reference/inputs/mvp-scope-181.json'));
 for(const a of p.assets.filter(a=>a.path.startsWith('shared/'))){const dest=path.join(temp,a.path);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(network,a.path),dest);}
 const packages=loadPackages(temp,[kc]);assert.equal(packages.size,1);assert.equal(packages.get(kc).metadata.contentRevision,boundRevision);
}finally{fs.rmSync(temp,{recursive:true,force:true});}
const permutations=xs=>xs.length<2?[xs]:xs.flatMap((x,i)=>permutations(xs.filter((_,j)=>i!==j)).map(tail=>[x,...tail]));let cases=0;
if(kc==='M-REP-04'){
 const accepted=[new Set(['3 + 2 = 5','2 + 3 = 5','5 = 3 + 2','5 = 2 + 3']),new Set(['6 − 2 = 4','6 − 4 = 2','4 = 6 − 2','2 = 6 − 4'])];
 for(const [i,c] of logic.CONTEXTS.entries())for(const tokens of permutations([...c.numbers.map(String),c.operator,'='])){assert.equal(logic.checkEquation(tokens,c).ok,accepted[i].has(tokens.join(' ')),tokens.join(' '));cases++;}
 assert.equal(logic.checkEquation(['5'],logic.CONTEXTS[0]).reason,'result');assert.equal(logic.checkEquation(['3','+','3','=','6'],logic.CONTEXTS[0]).reason,'quantities');assert.equal(logic.checkEquation(['3','−','2','=','5'],logic.CONTEXTS[0]).reason,'operation');assert.equal(logic.checkEquation(['3','+','5','=','2'],logic.CONTEXTS[0]).reason,'equality');
 assert(logic.checkEquation(['4','=','6','-','2'],logic.CONTEXTS[1]).ok);for(const t of [[],['5','=','5'],['3','+','=','2','5'],['3','+','2','=','5','='],['constructor','+','2','=','5']])assert(!logic.checkEquation(t,logic.CONTEXTS[0]).ok);
}
if(kc==='M-TH-04'){
 assert.deepEqual(logic.continuation(logic.UNIT,8,3),['round','angular','round']);assert.deepEqual(logic.continuation(logic.UNIT,6,3),['angular','round','round']);
 for(const unit of [['angular','round'],logic.UNIT,['angular','round','square']])for(let length=0;length<unit.length*4;length++){const actual=logic.continuation(unit,length,3);assert.deepEqual(actual,[unit[length%unit.length],unit[(length+1)%unit.length],unit[(length+2)%unit.length]]);cases++;}
 for(const a of ['round','angular',null])for(const b of ['round','angular',null])for(const c of ['round','angular',null]){assert.equal(logic.checkContinuation([a,b,c]).ok,a==='round'&&b==='angular'&&c==='round');cases++;}
 assert(logic.checkContinuation(['round','angular','round'],[...logic.UNIT,...logic.UNIT],8).ok);
 const hole=['round','angular','round'];delete hole[1];
 for(const malformed of [null,undefined,{},'round,angular,round',[],['round'],['round','angular','round','round'],Array(3),hole,['round','square','round'],['round',undefined,'round'],['round',4,'round']]){assert.equal(logic.checkContinuation(malformed).ok,false);cases++;}
 for(const invalidUnit of [null,[],['round','foreign']])assert.equal(logic.checkContinuation(['round','angular','round'],invalidUnit,8).ok,false);
 for(const phase of [-1,0.5,NaN])assert.equal(logic.checkContinuation(['round','angular','round'],logic.UNIT,phase).ok,false);
 for(let phase=0;phase<9;phase++){const answer=logic.continuation(logic.UNIT,phase,3);assert.equal(logic.checkContinuation(answer,logic.UNIT,phase).ok,true);cases++;}
 for(let n=0;n<=6;n++){assert.equal(logic.checkGrowth(n).ok,n===2);cases++;}
}
if(kc==='M-TH-07'){
 const wanted=logic.allPairs();assert.equal(wanted.length,6);
 for(const route of permutations(wanted)){let record=[];for(const pair of route){const [a,b]=pair.split(':'),before=[...record],r=logic.addPair(record,a,b);assert.equal(r.kind,'new');assert.deepEqual(record,before);record=r.record;assert.equal(logic.addPair(record,a,b).kind,'duplicate');}assert.deepEqual(record,route);assert(logic.checkPairs(record).ok);cases++;}
 for(let mask=0;mask<64;mask++){const subset=wanted.filter((_,i)=>mask&(1<<i));assert.equal(logic.checkPairs(subset).ok,mask===63);cases++;}
 assert.equal(logic.addPair([],null,'circle').kind,'incomplete');assert.equal(logic.addPair([],'stripe','foreign').kind,'incomplete');assert(!logic.checkPairs([...wanted,wanted[0]]).ok);assert(!logic.checkPairs(['foreign:circle']).ok);
 const edges=[];for(let a=0;a<4;a++)for(let b=a+1;b<4;b++){assert.equal(logic.connectionKey(a,b),logic.connectionKey(b,a));edges.push(`${a}:${b}`);}
 for(let mask=0;mask<64;mask++){assert.equal(logic.checkConnections(edges.filter((_,i)=>mask&(1<<i))).ok,mask===63);cases++;}
 let links=[];for(const edge of [...edges].reverse()){const [a,b]=edge.split(':').map(Number);links=logic.addConnection(links,b,a).record;}assert(logic.checkConnections(links).ok);assert.equal(logic.addConnection(links,0,1).kind,'duplicate');for(const [a,b] of [[0,0],[-1,1],[0,4],[null,2],[0,undefined]])assert.equal(logic.addConnection([],a,b).kind,'invalid');
}
console.log(`${kc}: source/schema/hash/role checks PASS; ${cases} semantic cases PASS`);
if(process.argv.includes('--browser')){
 const {chromium}=await import('@playwright/test');
 const css=fs.readFileSync(path.join(network,'assets/shell.css'),'utf8');
 const harness=`import {mount} from '/package/lesson.mjs';window.lessonHandle=mount(document.querySelector('[data-lesson-module]'));window.remount=()=>{window.lessonHandle.dispose();window.lessonHandle=mount(document.querySelector('[data-lesson-module]'));};document.querySelectorAll('[data-harness]').forEach(b=>b.addEventListener('click',()=>window.lessonHandle[b.dataset.harness]()));`;
 const server=createServer((req,res)=>{const pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname==='/lesson'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(`<!doctype html><html lang="fi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="/package/"><title>${kc} source harness</title><style>${css}</style><main><section id="lesson-body" class="lesson">${body}<div data-lesson-module><button data-harness="pause">Tauko</button><button data-harness="resume">Jatka</button><button data-harness="reset">Alusta</button></div></section></main><script type="module" src="/harness.mjs"></script></html>`);return;}
 if(pathname==='/harness.mjs'){res.setHeader('Content-Type','text/javascript');res.end(harness);return;}
 if(pathname.startsWith('/package/')){const rel=pathname.slice(9),base=rel.startsWith('shared/')?network:directory,target=path.resolve(base,rel);if(target.startsWith(base+path.sep)&&fs.existsSync(target)&&fs.statSync(target).isFile()){res.setHeader('Content-Type',({'.svg':'image/svg+xml','.png':'image/png','.mjs':'text/javascript','.css':'text/css'})[path.extname(target)]??'text/plain');res.end(fs.readFileSync(target));return;}}
 res.writeHead(404);res.end();});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});const browser=await chromium.launch({headless:true}),errors=[];
 try{
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));const url=`http://127.0.0.1:${server.address().port}/lesson`;
 for(const width of [390,1280]){
  await page.setViewportSize({width,height:900});await page.goto(url);await page.locator('[data-module-ready="true"]').waitFor();const root=page.locator(`[data-b03="${kc}"]`);const action=async a=>root.locator(`[data-action="${a}"]`).click();
  for(const image of await root.locator('img').all())assert(await image.evaluate(e=>e.complete&&e.naturalWidth>0));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(kc==='M-REP-04'){
   const feedback=root.locator('[data-feedback]');const build=async tokens=>{await action('clear');for(const token of tokens)await root.locator(`[data-token="${token}"]`).click();await action('check');};
   await build(['5']);assert.equal(await feedback.getAttribute('data-result'),'retry');
   await build(['5','=','2','+','3']);assert.equal(await feedback.getAttribute('data-result'),'correct');

   // B03-FND-01: a checked verdict belongs to the exact current expression.
   await build(['5','=','2','+','3']);
   await action('step');assert.equal(await feedback.getAttribute('data-result'),'correct','model-only step preserves the checked answer');
   await root.locator('[data-token="5"]').click();assert.equal(await root.locator('[data-expression]').textContent(),'5 = 2 + 3 5');assert.equal(await feedback.getAttribute('data-result'),'support','correct → actual token insertion invalidates verdict');assert.doesNotMatch(await feedback.textContent(),/Merkintäsi on tosi/);
   await action('check');assert.equal(await feedback.getAttribute('data-result'),'retry');await root.locator('[data-token="2"]').click();assert.equal(await feedback.getAttribute('data-result'),'support','retry → actual token insertion invalidates verdict');
   await build(['3','+','5','=','2']);assert.equal(await feedback.getAttribute('data-result'),'retry');assert.match(await feedback.textContent(),/Vasemmalla/);
   await action('context');await build(['4','=','6','−','2']);assert.equal(await feedback.getAttribute('data-result'),'correct');await action('undo');assert.equal(await root.locator('[data-expression]').textContent(),'4 = 6 −');
   await root.locator('[data-token="2"]').focus();await page.keyboard.press('Enter');await action('check');assert.equal(await feedback.getAttribute('data-result'),'correct');await action('step');await action('step');assert.match(await root.locator('[data-model-text]').textContent(),/Nyt 4/);
  }else if(kc==='M-TH-04'){
   const choose=async (slot,kind)=>{await root.locator(`[data-slot="${slot}"]`).click();await root.locator(`[data-pattern="${kind}"]`).click();};
   for(const [i,k] of ['angular','angular','round'].entries())await choose(i,k);await action('check-repeat');assert.equal(await root.locator('[data-repeat-feedback]').getAttribute('data-result'),'retry');await choose(0,'round');await action('check-repeat');assert.equal(await root.locator('[data-repeat-feedback]').getAttribute('data-result'),'correct');

   // B03-FND-02: erasing a filled slot invalidates only the repeat answer.
   await choose(2,'round');await action('check-repeat');assert.equal(await root.locator('[data-repeat-feedback]').getAttribute('data-result'),'correct');
   await action('support');assert.equal(await root.locator('[data-repeat-feedback]').getAttribute('data-result'),'correct','support-only change preserves verdict');
   await action('erase');assert.equal(await root.locator('[data-slot="2"]').getAttribute('aria-label'),'Jatkopaikka 3: tyhjä');assert.equal(await root.locator('[data-repeat-feedback]').getAttribute('data-result'),'support','correct → erase invalidates verdict');assert.doesNotMatch(await root.locator('[data-repeat-feedback]').textContent(),/Jatko on pyöreä/);
   await choose(2,'angular');await action('check-repeat');assert.equal(await root.locator('[data-repeat-feedback]').getAttribute('data-result'),'retry');await action('erase');assert.equal(await root.locator('[data-repeat-feedback]').getAttribute('data-result'),'support','retry → erase invalidates verdict');
   await choose(2,'round');await action('check-repeat');assert.equal(await root.locator('[data-repeat-feedback]').getAttribute('data-result'),'correct');
   await action('support');
   await action('support');assert.equal(await root.getAttribute('data-support'),'true');await action('growth-step');await action('growth-step');assert.match(await root.locator('[data-growth-model-text]').textContent(),/4 vanhaa ja kaksi uutta: nyt 6/);
   await action('add-dot');await action('check-growth');assert.equal(await root.locator('[data-growth-feedback]').getAttribute('data-result'),'retry');await action('add-dot');await action('check-growth');assert.equal(await root.locator('[data-growth-feedback]').getAttribute('data-result'),'correct');await action('add-dot');await action('check-growth');assert.equal(await root.locator('[data-growth-feedback]').getAttribute('data-result'),'retry');await action('remove-dot');await action('check-growth');assert.equal(await root.locator('[data-growth-feedback]').getAttribute('data-result'),'correct');
  }else{
   const pair=async (a,b)=>{await root.locator(`[data-background="${a}"]`).click();await root.locator(`[data-emblem="${b}"]`).click();await action('add-pair');};
   await action('add-pair');assert.match(await root.locator('[data-pairs-feedback]').textContent(),/sekä pohja/);await pair('stripe','circle');await action('add-pair');assert.equal(await root.locator('[data-record] li').count(),1);assert.match(await root.locator('[data-pairs-feedback]').textContent(),/jo listassa/);await root.locator('[data-remove="0"]').click();
   for(const key of logic.allPairs().reverse())await pair(...key.split(':'));await action('check-pairs');assert.equal(await root.locator('[data-pairs-feedback]').getAttribute('data-result'),'correct');assert.match(await root.locator('[data-record] li').first().textContent(),/Pistepohja ja tähti/);
   await root.locator('[data-remove="0"]').click();await action('check-pairs');assert.equal(await root.locator('[data-pairs-feedback]').getAttribute('data-result'),'retry');await action('hint');assert.match(await root.locator('[data-pairs-feedback]').textContent(),/Vihje/);await pair('dots','star');await action('check-pairs');assert.equal(await root.locator('[data-pairs-feedback]').getAttribute('data-result'),'correct');
   await root.locator('summary').filter({hasText:'Kokeile siirtoa'}).click();const edge=async(a,b)=>{await root.locator(`[data-station="${a}"]`).click();await root.locator(`[data-station="${b}"]`).click();await action('add-link');};
   await edge(0,0);assert.equal(await root.locator('[data-link-record] li').count(),0);assert.match(await root.locator('[data-links-feedback]').textContent(),/kaksi eri/);
   for(let a=0;a<4;a++)for(let b=a+1;b<4;b++)await edge(a,b);await edge(1,0);assert.equal(await root.locator('[data-link-record] li').count(),6);assert.match(await root.locator('[data-links-feedback]').textContent(),/jo mukana/);await action('check-links');assert.equal(await root.locator('[data-links-feedback]').getAttribute('data-result'),'correct');await root.locator('[data-remove-link="1"]').click();await action('check-links');assert.equal(await root.locator('[data-links-feedback]').getAttribute('data-result'),'retry');await edge(2,0);await action('check-links');assert.equal(await root.locator('[data-links-feedback]').getAttribute('data-result'),'correct');
  }
  for(const button of await root.locator('button:visible').all()){const r=await button.boundingBox();assert(r&&r.width>=44&&r.height>=44,'small control');}
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(width===390){await root.locator('figure').screenshot({path:path.join(os.tmpdir(),`${kc}-B03-diagram.png`)});await root.screenshot({path:path.join(os.tmpdir(),`${kc}-B03-mobile.png`)});let panelIndex=0;for(const panel of await root.locator('.practice').all())await panel.screenshot({path:path.join(os.tmpdir(),`${kc}-B03-practice-${panelIndex++}.png`)});}
  await page.locator('[data-harness="pause"]').click();assert.equal(await root.locator('button:enabled').count(),0);const paused=await root.innerHTML();await root.locator('button').first().evaluate(e=>e.dispatchEvent(new MouseEvent('click',{bubbles:true})));assert.equal(await root.innerHTML(),paused);
  await page.locator('[data-harness="reset"]').click();assert.equal(await root.locator('button:enabled').count(),0);await page.locator('[data-harness="resume"]').click();assert((await root.locator('button:enabled').count())>0);for(let i=0;i<4;i++)await page.locator('[data-harness="reset"]').click();
  if(kc==='M-REP-04'){await action('step');assert.match(await root.locator('[data-model-text]').textContent(),/2 tuli lisää/);}else if(kc==='M-TH-04'){await action('add-dot');assert.match(await root.locator('[data-growth-build] svg').getAttribute('aria-label'),/6 vanhaa ja 1 uutta/);}else{await root.locator('[data-background="stripe"]').click();await root.locator('[data-emblem="circle"]').click();await action('add-pair');assert.equal(await root.locator('[data-record] li').count(),1);}
  await page.evaluate(()=>window.lessonHandle.dispose());const disposed=await root.innerHTML();await root.locator('button:enabled').first().click();assert.equal(await root.innerHTML(),disposed);await page.evaluate(()=>window.remount());assert.equal(await root.getAttribute('data-module-ready'),'true');
 }
 const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}}),sp=await noJS.newPage();await sp.goto(url);assert(await sp.locator('figure img').isVisible());const t=await sp.locator('[data-b03]').innerText();assert(t.includes('Tavoite:')&&t.includes('Lopuksi:'));await noJS.close();assert.deepEqual(errors,[]);
 console.log(`${kc}: browser PASS 390/1280; actual construction, correction and alternate forms; source CSS/images; >=44px; no horizontal overflow; disabled pause/reset/dispose/remount; no-JS teaching`);
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
