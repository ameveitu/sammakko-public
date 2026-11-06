import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {parseFragment,projectAudience,teacherNode,validateAudienceSource} from './audience.mjs';
import {loadPackages} from './content.mjs';
import {sourceBindings} from '../../../tools/launch/source-bindings.mjs';
const root=new URL('./',import.meta.url).pathname;
const ids=JSON.parse(fs.readFileSync(new URL('reference/inputs/mvp-scope-181.json',import.meta.url))).selected_ids;
function visibilityHarness(){
 const source=fs.readFileSync(new URL('assets/lesson-flow.js',import.meta.url),'utf8');
 const listeners={},documentListeners={},frames=[],scrolls=[];
 const rect=(top,bottom)=>({top,bottom,left:0,right:400,width:400,height:bottom-top});
 const documentRoot={},area={tagName:'SECTION',parentElement:null,scrollTop:0,scrollHeight:1000,clientHeight:500,clientTop:0,
  getBoundingClientRect:()=>rect(100,600),scrollTo(value){scrolls.push(value);this.scrollTop=value.top;}};
 const root={contains:()=>true,addEventListener:(name,listener)=>{listeners[name]=listener;}};
 const window={},document={scrollingElement:documentRoot,documentElement:documentRoot,
  querySelector:selector=>selector==='#lesson-body'?null:root,querySelectorAll:()=>[],addEventListener:(name,listener)=>{documentListeners[name]=listener;}};
 const getComputedStyle=element=>({display:'block',visibility:'visible',position:'static',overflowY:element===area?'auto':'visible'});
 vm.runInNewContext(source,{window,document,getComputedStyle,innerHeight:700,Node:{TEXT_NODE:3,ELEMENT_NODE:1},performance:{now:()=>0},requestAnimationFrame:callback=>frames.push(callback)});
 function disclosure(){
  const detail={tagName:'DETAILS',open:false,isConnected:true,parentElement:area,blocked:false,
   closest(){return this.blocked?this:null;},getClientRects:()=>[rect(550,800)]};
  const summary={tagName:'SUMMARY',parentElement:detail,closest:()=>summary,getBoundingClientRect:()=>rect(550,590)};
  const paragraph={nodeType:1,tagName:'P',isConnected:true,parentElement:detail,closest:()=>null,matches:()=>true,
   getClientRects:()=>[rect(600,680)],getBoundingClientRect:()=>rect(600,680)};
  detail.querySelector=()=>summary;detail.querySelectorAll=()=>[summary];detail.childNodes=[summary,paragraph];
  return {detail,summary};
 }
 return {api:window.SammakkoLessonFlow,scrolls,documentListeners,
  open(pair,{deliberate=true}={}){if(deliberate)listeners.click({type:'click',button:0,target:pair.summary,defaultPrevented:false});pair.detail.open=true;listeners.toggle({target:pair.detail});},
  flush(){while(frames.length)frames.shift()();},disclosure};
}
test('lesson visibility leaves an already visible beginning still and fits the summary with a short new block',()=>{
 const {revealDelta}=visibilityHarness().api,view={top:100,bottom:600};
 assert.equal(revealDelta({top:110,bottom:150},{top:160,bottom:300},view),0);
 assert.equal(revealDelta({top:70,bottom:100},{top:110,bottom:170},view),0,'do not move merely because the summary is above the edge');
 assert.equal(revealDelta({top:550,bottom:590},{top:600,bottom:680},view),80);
 assert.equal(revealDelta({top:40,bottom:80},{top:90,bottom:140},view),-60);
});
test('lesson visibility reveals the start of oversized content, never its far end',()=>{
 const {revealDelta}=visibilityHarness().api,view={top:100,bottom:600};
 assert.equal(revealDelta({top:540,bottom:580},{top:590,bottom:1500},view),70);
 assert.equal(revealDelta({top:110,bottom:150},{top:160,bottom:1500},view),0);
 assert.equal(revealDelta({top:0,bottom:40},{top:50,bottom:100},{top:100,bottom:100}),0);
});
test('lesson visibility includes the first useful action when it fits and does not chase a distant action',()=>{
 const {revealDelta}=visibilityHarness().api,view={top:100,bottom:600};
 const summary={top:500,bottom:540},paragraph={top:550,bottom:600};
 assert.equal(revealDelta(summary,paragraph,view),0,'paragraph alone already fits');
 assert.equal(revealDelta(summary,paragraph,view,{top:610,bottom:654}),54,'bring the nearby action and opening into view together');
 assert.equal(revealDelta(summary,paragraph,view,{top:1400,bottom:1444}),0,'a far action must not pull the reader away from the beginning');
});
test('lesson visibility handles a deliberately opened dynamically mounted disclosure without changing focus',()=>{
 const h=visibilityHarness(),late=h.disclosure();h.open(late);h.flush();
 assert.equal(h.scrolls.length,1);assert.equal(h.scrolls[0].top,90,'10px visible-edge padding is respected');
 assert.equal(h.scrolls[0].behavior,'instant','automatic reveal does not inherit smooth scrolling under reduced motion');
});
test('lesson visibility ignores programmatic opening, hidden stages, closed details and reset/stage-change races',()=>{
 for(const cancellation of ['programmatic','hidden','closed','reset','stage-change']){
  const h=visibilityHarness(),pair=h.disclosure();h.open(pair,{deliberate:cancellation!=='programmatic'});
  if(cancellation==='hidden')pair.detail.blocked=true;
  if(cancellation==='closed')pair.detail.open=false;
  if(cancellation==='reset')h.documentListeners['lesson-control']({detail:'reset'});
  if(cancellation==='stage-change')h.documentListeners['lesson-stage-change']();
  h.flush();assert.equal(h.scrolls.length,0,cancellation);
 }
});
test('pause and reset requested during module import are applied when its real lifecycle mounts',async()=>{
 const source=fs.readFileSync(new URL('assets/lesson-loader.js',import.meta.url),'utf8');
 const document=new EventTarget(),status={textContent:'',dataset:{}},control={disabled:false,matches:()=>false},area={querySelectorAll:()=>[control]},host={dataset:{lessonModule:'lesson.mjs'},querySelector:()=>status,closest:()=>area,addEventListener(){},removeEventListener(){}};
 document.hidden=false;document.querySelector=()=>host;const calls=[];let resolveImport;
 const waiting=new Promise(resolve=>{resolveImport=resolve;});
 const finished=vm.runInNewContext(source.replace('await import(', 'await __import('),{document,Event,CustomEvent,location:{href:'http://lesson.test/a.html'},URL,addEventListener(){},__import:()=>waiting});
 document.dispatchEvent(new CustomEvent('lesson-control',{detail:'pause'}));
 document.dispatchEvent(new CustomEvent('lesson-control',{detail:'reset'}));
 resolveImport({mount:()=>({pause(){calls.push('pause');},resume(){calls.push('resume');},reset(){calls.push('reset');},dispose(){calls.push('dispose');}})});
 await finished;
 assert(calls.includes('reset'),'pre-mount reset is applied');assert.equal(calls.at(-1),'pause','pre-mount pause is preserved');assert.equal(control.disabled,true);assert.equal(status.textContent,'Keskeytetty');
 document.dispatchEvent(new CustomEvent('lesson-control',{detail:'resume'}));assert.equal(calls.at(-1),'resume');assert.equal(control.disabled,false);
});
test('teacher notes, their child IDs and links are absent from the built audience body even when opened in preparation',()=>{
 const source='<section data-teaching-step="q" data-lesson-role="question"><p>Question</p><a href="#secret-child">Paperille</a><details open data-lesson-role="teacher-note"><summary>Notes</summary><p id="secret-child">SECRET TEACHER NOTE</p></details><details data-lesson-role="answer"><summary>Reveal answer</summary><p>Answer</p></details></section>';
 const a=projectAudience(source,{strict:true});assert.doesNotMatch(a.body,/SECRET|secret-child|Paperille|Notes/);assert.match(a.body,/Reveal answer/);assert.doesNotMatch(a.body,/<details[^>]*\sopen\b/);
});
test('source contract rejects empty, nested, duplicate and unknown steps/roles and immediately exposed answers',()=>{
 for(const s of ['<p>Answer outside the step</p><p data-teaching-step="1">Question</p>','<section data-teaching-step="1"></section>','<section data-teaching-step="1"><section data-teaching-step="2">Nested</section></section>','<p data-teaching-step="1">A</p><p data-teaching-step="1">B</p>','<p data-teaching-step="1" data-lesson-role="typo">X</p>','<p data-teaching-step="1" data-lesson-role="answer">Answer</p>','<details open data-teaching-step="1" data-lesson-role="answer"><summary>Answer</summary>A</details>'])assert.throws(()=>validateAudienceSource(s,true));
 const a=projectAudience('<details open data-teaching-step="1"><summary>Model</summary>Example</details><p data-teaching-step="2">Next</p>');
 assert.equal(a.steps,2);assert.doesNotMatch(a.body,/<details[^>]*\sopen\b/);assert.equal(parseFragment(a.body).nodes.filter(n=>n.attrs['data-audience-step']!==undefined&&!Object.hasOwn(n.attrs,'hidden')).length,1);
});
test('context sources remain one live workbench and cannot carry steps or teacher material into a task',()=>{
 const model='<section data-teaching-step="model"><div data-lesson-context-source="model"><p>Model</p></div></section>';
 const context='<section data-teaching-step="task"><p>Task</p><details data-lesson-context="try" data-context-source="model"><summary>Model here</summary><div data-context-slot></div></details></section>';
 assert.equal(projectAudience(model+context,{strict:true}).steps,2);
 for(const broken of [
  context,
  model+context.replace('data-context-source="model"','data-context-source="missing"'),
  model+context.replace('<details ','<details open '),
  model+context.replace('<div data-context-slot></div>',''),
  model.replace('<p>Model</p>','<details data-lesson-role="teacher-note"><summary>Private note</summary>Secret</details>')+context,
  '<div data-lesson-context-source="model">'+model.replace(' data-lesson-context-source="model"','')+'</div>'+context,
  model.replace('<p>Model</p>',context)+context.replace('data-teaching-step="task"','data-teaching-step="other"').replace('data-lesson-context="try"','data-lesson-context="other"'),
 ])assert.throws(()=>validateAudienceSource(broken,true));
});
test('all181 same-source projections remove teacher regions; calibrated sources bind pending reviews to their changed revisions',()=>{
 const pkgs=loadPackages(root,ids);assert.equal(pkgs.size,181);let semantic=0;
 for(const [id,pkg]of pkgs){const strict=pkg.metadata.extensions.audienceContract===1,a=projectAudience(pkg.body,{strict}),source=parseFragment(pkg.body),output=parseFragment(a.body);
  assert(output.nodes.every(n=>!teacherNode(a.body,n)),id);
  for(const n of source.nodes.filter(n=>teacherNode(pkg.body,n)))assert(!a.body.includes(pkg.body.slice(n.start,n.end)),id+': teacher subtree not retained');
  if(strict){semantic++;assert(a.steps>0);assert.equal(pkg.metadata.humanReview.state,'pending');for(const kind of ['contentReview','alignmentReview']){assert(['pending','reviewed'].includes(pkg.metadata[kind].state),id+': current-source review state');assert.equal(pkg.metadata[kind].revision,pkg.metadata.contentRevision);}}
 }
 assert.equal(semantic,181,'Every selected181 package requires the explicit audience source contract');
});
test('current launch alignment hashes for changed calibration Lite counterparts are actual source bytes',()=>{
 const packages=loadPackages(root,ids);
 const {lessonRev}=JSON.parse(fs.readFileSync(path.resolve(root,'../../../lite/public/lite-runtime.json'))).runtimeAvailability;
 for(const id of ['M-NUM-1TO1','M-DATA-04','M79-FUNC-GRAPH','SCI-ENV-OBSERVE-01']){
  const {currentSource}=packages.get(id).metadata.alignment;
  assert.equal(currentSource.kcRevision,lessonRev[id],id+': current manifest revision');
  assert(currentSource.validRevisions.includes('audit1-2026-10-28'));
  for(const[f,h]of Object.entries(currentSource.sourceHashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.resolve(root,'../../../lite',f))).digest('hex'),h,id+': '+f);
 }
});
test('all181 alignment records bind current Lite bytes while keeping historical provenance separate',()=>{
 const packages=loadPackages(root,ids),bindings=sourceBindings(path.resolve(root,'../../..'));
 for(const [id,pkg]of packages){
  const current=pkg.metadata.alignment.currentSource;
  assert(current,id+': missing current source binding');
  assert.equal(current.liteGeneratorSha256,bindings.liteGeneratorSha256,id+': global Lite boundary');
  assert.equal(typeof current.kcRevision,'string');assert(current.kcRevision.length>0);
  assert(Object.keys(current.sourceHashes).some(p=>p.startsWith('src/content/')),id+': no current content source');
  for(const [relative,expected]of Object.entries(current.sourceHashes)){
   assert(!path.isAbsolute(relative)&&!relative.split('/').includes('..'));
   assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.resolve(root,'../../../lite',relative))).digest('hex'),expected,id+': '+relative);
  }
 }
});
test('a response and the model it operates on remain in one visible source stage',()=>{
 const contracts=[
  ['M-NUM-EQUALSTEP-SEQ',['data-task','data-question','data-given','data-number-fields','data-action=check','data-feedback']],
  ['M-NUM-MULTIPLE-INTRO',['data-task','data-question','data-given','data-number-fields','data-action=check','data-feedback']],
  ['M-GEO-04',['data-shape-board','data-shape-check','data-shape-transfer']],
 ];
 for(const [id,attributes]of contracts){
  const source=fs.readFileSync(new URL(`packages/${id}/body.html`,import.meta.url),'utf8'),{nodes}=parseFragment(source);
  const owners=attributes.map(attribute=>{
   const [name,value]=attribute.split('='),matches=nodes.filter(n=>Object.hasOwn(n.attrs,name)&&(value===undefined||n.attrs[name]===value));assert.equal(matches.length,1,`${id}: unique ${attribute}`);
   for(let node=matches[0];node;node=node.parent)if(Object.hasOwn(node.attrs,'data-teaching-step'))return node.attrs['data-teaching-step'];
   assert.fail(`${id}: ${attribute} has no teaching stage`);
  });
  assert.equal(new Set(owners).size,1,`${id}: given data, action and response must be visible together`);
 }
});
test('speed exit question has an independently closed answer; worked examples remain deliberately labelled',()=>{
 const source=fs.readFileSync(new URL('packages/PHY79-SPEED-CONCEPT/body.html',import.meta.url),'utf8'),{nodes}=parseFragment(source);
 const question=nodes.find(n=>n.attrs['data-lesson-role']==='question'&&source.slice(n.start,n.end).includes('A etenee 15 m'));
 assert(question);const answer=nodes.find(n=>n.start>question.start&&n.end<question.end&&n.attrs['data-lesson-role']==='answer');assert(answer);assert.equal(answer.tag,'details');assert(!Object.hasOwn(answer.attrs,'open'));assert(source.slice(answer.start,answer.end).includes('3 m/s'));
 const fraction=fs.readFileSync(new URL('packages/M-FRAC-12/body.html',import.meta.url),'utf8');assert.match(fraction,/data-lesson-role="worked-example"/);
});
