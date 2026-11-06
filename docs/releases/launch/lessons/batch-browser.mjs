import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {chromium} from '../../../../public/oppitunnit/node_modules/playwright/index.mjs';

const folder=path.dirname(fileURLToPath(import.meta.url));
const batch=process.env.LESSON_BATCH??'LR04-B01';
const run=process.env.LESSON_BROWSER_RUN??'browser-01';
const plan=JSON.parse(fs.readFileSync(path.join(folder,batch,'plan.json')));
const ids=plan.ids;
const root=fileURLToPath(new URL('../../../../public/oppitunnit/lesson-network/',import.meta.url));
const out=process.env.LESSON_BROWSER_OUTPUT?path.resolve(process.env.LESSON_BROWSER_OUTPUT):path.join(folder,batch,run);
const base=(process.env.LESSON_BROWSER_BASE_URL??'http://127.0.0.1:4197/site/').replace(/\/?$/,'/');
fs.mkdirSync(out,{recursive:false});
const names=[...new Set(['audience.mjs','build.mjs','content.mjs','assets/audience.js','assets/lesson-flow.js','assets/lesson-loader.js','assets/shell.css','assets/shell.js',...ids.flatMap(id=>{
 const p=JSON.parse(fs.readFileSync(path.join(root,'packages',id,'lesson.json')));
 return ['lesson.json',p.body,p.module].filter(Boolean).map(f=>'packages/'+id+'/'+f).concat(p.assets.map(a=>a.path.startsWith('shared/')?a.path:'packages/'+id+'/'+a.path));
})])];
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const hashes=()=>Object.fromEntries(names.map(f=>[f,hash(fs.readFileSync(path.join(root,f)))]));
const before=hashes();
const receipt={batch,ids,kind:'bounded current-source presentation browser',startedAt:new Date().toISOString(),sourceHashes:before,rows:[],disclosureRows:[],resetRows:[],pageErrors:[],harnessSha256:hash(fs.readFileSync(fileURLToPath(import.meta.url))),limits:'Default teaching-stage framing and deliberate disclosure reachability, module/source/teacher boundaries and reset. Opened optional support may scroll within the lesson area. Conditional hidden content and response permutations are not all exercised. Not independent content or human validation.'};
receipt.builtDocumentHashes=Object.fromEntries(ids.map(id=>[id,hash(fs.readFileSync(path.join(root,'site/presentations',id+'.html')))]));
let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.LESSON_BROWSER_EXECUTABLE?{executablePath:process.env.LESSON_BROWSER_EXECUTABLE}:{})});
 const page=await browser.newPage({reducedMotion:'reduce'});
 page.on('pageerror',e=>receipt.pageErrors.push({url:page.url(),message:e.message}));
 async function waitForImages(){
  await page.waitForFunction(()=>[...document.querySelectorAll('[data-audience-step]:not([hidden]) img')].every(i=>i.complete),{},{timeout:10000});
 }
 async function stageRow(kc,index,size){
  await waitForImages();
  return page.evaluate(({kc,index,size})=>{
   const area=document.querySelector('#lesson-body'),active=[...area.querySelectorAll('[data-audience-step]')].filter(s=>!s.hidden&&!s.inert&&s.getClientRects().length),step=active[0],toolbar=document.querySelector('.audience-toolbar').getBoundingClientRect();
   return{kc,index,size,active:active.length,nonempty:!!step&&(!!step.innerText.trim()||!!step.querySelector('img,svg,input,button,select')),text:step?.innerText.slice(0,110),overflowX:document.documentElement.scrollWidth>innerWidth||area.scrollWidth>area.clientWidth+1,overflowY:Math.max(0,area.scrollHeight-area.clientHeight),teacherRegions:document.querySelectorAll('.teacher,.research-links,[data-lesson-role="teacher-note"],[data-lesson-role="metadata"],[data-shell-teacher],#upstream,#downstream,footer').length,moduleStatus:document.querySelector('[data-module-status]')?.textContent,toolbarReachable:toolbar.top>=0&&toolbar.bottom<=innerHeight,brokenImages:[...step.querySelectorAll('img')].filter(img=>!img.complete||!img.naturalWidth).map(img=>img.src)};
  },{kc,index,size});
 }
 async function closeDisclosures(){
  await page.locator('[data-audience-step]:not([hidden])').evaluate(step=>{for(const d of step.querySelectorAll('details'))d.open=false;document.querySelector('#lesson-body').scrollTop=0;});
  // Native toggle delivery returns borrowed nodes after .open changes. Do not
  // read the next disclosure index until its source is back at home.
  await page.waitForFunction(()=>!document.querySelector('[data-audience-step]:not([hidden]) [data-context-active],[data-audience-step]:not([hidden]) [data-context-slot] > [data-lesson-context-source]'));
 }
 async function openDisclosure(index){
  const all=page.locator('[data-audience-step]:not([hidden]) details'),current=all.nth(index);
  const chain=await current.evaluate(d=>{const step=d.closest('[data-audience-step]'),all=[...step.querySelectorAll('details')],chain=[all.indexOf(d)];for(let p=d.parentElement;p&&p!==step;p=p.parentElement)if(p.tagName==='DETAILS')chain.unshift(all.indexOf(p));return chain;});
  for(const n of chain){
   const d=all.nth(n),summary=d.locator(':scope > summary');
   if(!await summary.isVisible())return false;
   if(!await d.evaluate(el=>el.open))await summary.click();
   const key=await d.getAttribute('data-lesson-context');
   if(key!==null)await page.waitForFunction(key=>{
    const panel=[...document.querySelectorAll('details[data-lesson-context]')].find(d=>d.dataset.lessonContext===key);
    return panel?.dataset.contextActive==='true'&&!!panel.querySelector(':scope > [data-context-slot] > [data-lesson-context-source]');
   },key);
  }
  // Finish the runtime's bounded reveal before measuring or enumerating controls.
  // Otherwise controls.nth(1) can change from close button to borrowed select.
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  return true;
 }
 for(const size of[{width:1280,height:720},{width:1024,height:768}]){
  await page.setViewportSize(size);
  for(const id of ids){
   const response=await page.goto(base+'presentations/'+id+'.html');
   if(!response?.ok())throw Error(id+': built presentation was not served successfully');
   const servedHash=hash(await response.body());
   (receipt.servedDocumentHashes??={})[id]=servedHash;
   if(servedHash!==receipt.builtDocumentHashes[id])throw Error(id+': served document differs from current generated presentation');
   await page.waitForFunction(()=>!document.querySelector('[data-module-status]')?.textContent.includes('odottaa'));
   const total=await page.locator('[data-audience-step]').count();
   let lastDisclosure=null;
   for(let i=0;i<total;i++){
    const row=await stageRow(id,i,size);receipt.rows.push(row);
    if((i===0&&(process.env.CI!=='true'||id===process.env.SAMMAKKO_CAPTURE_TOPIC))||row.overflowY>4||row.overflowX||row.teacherRegions)await page.screenshot({path:path.join(out,id+'-'+size.width+'-step'+(i+1)+'.png')});
    const details=page.locator('[data-audience-step]:not([hidden]) details'),count=await details.count();
    for(let n=0;n<count;n++){
     await closeDisclosures();
     const detail=details.nth(n),summary=(await detail.locator(':scope > summary').textContent())?.trim()??'';
     if(!await openDisclosure(n)){
      receipt.disclosureRows.push({kc:id,index:i,size,disclosure:n,summary,status:'not_visible_in_initial_module_state',tested:false});continue;
     }
     await waitForImages();
     const expanded=await stageRow(id,i,size);
     const content=await detail.evaluate(d=>{
      const visible=e=>!!e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
      const clipped=[];
      for(const e of d.querySelectorAll('p,h2,h3,figure,img,svg,table,button,input,select,textarea,summary,a[href]')){
       if(!visible(e))continue;const b=e.getBoundingClientRect();
       for(let p=e.parentElement;p&&p.id!=='lesson-body';p=p.parentElement){
        if(p.tagName==='DETAILS'&&!p.open)break;
        const s=getComputedStyle(p),r=p.getBoundingClientRect();
        if((['hidden','clip'].includes(s.overflowX)&&(b.left<r.left-4||b.right>r.right+4))||(['hidden','clip'].includes(s.overflowY)&&(b.top<r.top-4||b.bottom>r.bottom+4))){clipped.push({tag:e.tagName,text:e.textContent?.trim().slice(0,60),container:p.tagName});break;}
       }
      }
      return{open:d.open,contentVisible:[...d.children].some(e=>e.tagName!=='SUMMARY'&&visible(e)),clipped};
     });
     const controls=detail.locator('button,input,select,textarea,a[href],[role="button"]');
     const unreachable=[];let checkedControls=0;
     for(let c=0;c<await controls.count();c++){
      const control=controls.nth(c);
      if(!await control.isVisible()||await control.isDisabled())continue;
      await control.scrollIntoViewIfNeeded();checkedControls++;
      // Wrapped inline links have multiple rects; their union center may be whitespace.
      const reachable=await control.evaluate(e=>{const points=[...e.getClientRects()].filter(r=>r.width>0&&r.height>0).map(r=>{const x=r.left+r.width/2,y=r.top+r.height/2,hit=document.elementFromPoint(x,y);return{x,y,inViewport:x>=0&&x<innerWidth&&y>=0&&y<innerHeight,hit:!!hit&&(hit===e||e.contains(hit))};}),point=points.find(p=>p.inViewport&&p.hit)??points[0]??{inViewport:false,hit:false},toolbar=document.querySelector('.audience-toolbar').getBoundingClientRect();return{...point,toolbarReachable:toolbar.top>=0&&toolbar.bottom<=innerHeight,label:e.getAttribute('aria-label')??e.textContent?.trim().slice(0,60)};});
      if(!reachable.inViewport||!reachable.hit||!reachable.toolbarReachable)unreachable.push(reachable);
     }
     const disclosure={...expanded,disclosure:n,summary,status:'opened',tested:true,open:content.open,contentVisible:content.contentVisible,clipped:content.clipped,checkedControls,unreachable};
     receipt.disclosureRows.push(disclosure);lastDisclosure={step:i,index:n};
     if(!content.open||!content.contentVisible||content.clipped.length||unreachable.length||expanded.overflowX||expanded.teacherRegions||expanded.brokenImages.length||!expanded.toolbarReachable)await page.screenshot({path:path.join(out,id+'-'+size.width+'-step'+(i+1)+'-disclosure'+n+'.png')});
    }
    await closeDisclosures();
    if(i<total-1)await page.locator('[data-audience-next]').click();
   }
   // Reset must close a real opened disclosure, not just observe already-closed ones.
   if(lastDisclosure){
    for(let i=total-1;i>lastDisclosure.step;i--)await page.locator('[data-audience-prev]').click();
    if(!await openDisclosure(lastDisclosure.index))throw Error(id+': reset disclosure could not be reopened');
   }
   const openBeforeReset=await page.locator('#lesson-body details[open]').count();
   const audienceTools=page.locator('[data-audience-tools]');
   if(!await audienceTools.evaluate(element=>element.open))await audienceTools.locator(':scope > summary').click();
   await page.locator('[data-audience-reset]').click();
   const reset=await page.evaluate(({kc,size,openBeforeReset,disclosureExpected})=>{
    const area=document.querySelector('#lesson-body'),all=[...area.querySelectorAll('[data-audience-step]')],active=all.filter(s=>!s.hidden&&!s.inert&&s.getClientRects().length),first=all[0],toolbar=document.querySelector('.audience-toolbar').getBoundingClientRect();
    return{kc,size,openBeforeReset,disclosureExpected,firstActive:active.length===1&&active[0]===first,nonempty:!!first&&(!!first.innerText.trim()||!!first.querySelector('img,svg,input,button,select')),openHintsAnswers:area.querySelectorAll('details[data-lesson-role=hint][open],details[data-lesson-role=answer][open]').length,openDisclosures:area.querySelectorAll('details[open]').length,teacherRegions:document.querySelectorAll('[data-lesson-role=teacher-note],[data-lesson-role=metadata],.teacher,footer').length,moduleStatus:document.querySelector('[data-module-status]')?.textContent,pausePressed:document.querySelector('[data-audience-pause]').getAttribute('aria-pressed'),toolbarReachable:toolbar.top>=0&&toolbar.bottom<=innerHeight};
   },{kc:id,size,openBeforeReset,disclosureExpected:!!lastDisclosure});
   receipt.resetRows.push(reset);
  }
 }
}catch(error){receipt.error=String(error.stack);}
finally{
 if(browser)await browser.close();
 receipt.sourceUnchanged=JSON.stringify(before)===JSON.stringify(hashes());
 receipt.failed=receipt.rows.filter(r=>r.active!==1||!r.nonempty||r.overflowX||r.overflowY>4||r.teacherRegions||r.moduleStatus?.startsWith('Moduulivirhe')||!r.toolbarReachable||r.brokenImages.length);
 receipt.disclosureFailed=receipt.disclosureRows.filter(r=>r.tested&&(r.active!==1||!r.open||!r.contentVisible||r.overflowX||r.teacherRegions||r.moduleStatus?.startsWith('Moduulivirhe')||!r.toolbarReachable||r.brokenImages.length||r.clipped.length||r.unreachable.length));
 receipt.resetFailed=receipt.resetRows.filter(r=>!r.firstActive||!r.nonempty||r.openHintsAnswers||r.openDisclosures||(r.disclosureExpected&&r.openBeforeReset===0)||r.teacherRegions||r.moduleStatus?.startsWith('Moduulivirhe')||r.pausePressed!=='false'||!r.toolbarReachable);
 receipt.finishedAt=new Date().toISOString();receipt.elapsedMs=Date.parse(receipt.finishedAt)-Date.parse(receipt.startedAt);
 receipt.passed=!receipt.resetFailed.length&&receipt.resetRows.length===ids.length*2&&!receipt.error&&receipt.rows.length>0&&!receipt.failed.length&&!receipt.disclosureFailed.length&&!receipt.pageErrors.length&&receipt.sourceUnchanged;
 fs.writeFileSync(path.join(out,'receipt.json'),JSON.stringify(receipt,null,2)+'\n');
 console.log(JSON.stringify({batch,passed:receipt.passed,rows:receipt.rows.length,disclosureRows:receipt.disclosureRows.length,disclosureFailed:receipt.disclosureFailed.length,resetRows:receipt.resetRows.length,resetFailed:receipt.resetFailed.length,elapsedMs:receipt.elapsedMs,sourceUnchanged:receipt.sourceUnchanged,failed:receipt.failed.map(r=>({kc:r.kc,step:r.index+1,width:r.size.width,overflowY:r.overflowY,overflowX:r.overflowX,module:r.moduleStatus,teacher:r.teacherRegions})),error:receipt.error,out}));
 if(!receipt.passed)process.exitCode=1;
}
