import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {sourceInventory,successfulTestRun,verifyValidationReceipt,checkpointRevisions} from './validation-receipt.mjs';
import {assertReviewLifecycle} from './test-review-lifecycle-helper.mjs';
import {digest,loadPackages} from './content.mjs';
const tap=(overrides={})=>Object.entries({tests:2,pass:2,fail:0,cancelled:0,skipped:0,todo:0,...overrides}).map(([k,v])=>'# '+k+' '+v).join('\n');
test('a later successful command cannot conceal failed test exit, missing totals or skipped assertions',()=>{
 assert(successfulTestRun(0,tap()).passed);
 for(const [code,output] of [[1,tap()],[null,tap()],[0,tap({pass:1,fail:1})],[0,tap({skipped:1})],[0,tap({todo:1})],[0,tap({cancelled:1})],[0,tap({tests:0,pass:0})],[0,'lint succeeded'],[0,tap({tests:'9'.repeat(400),pass:'9'.repeat(400)})],[0,tap({tests:'9007199254740992',pass:'9007199254740992'})]])assert.equal(successfulTestRun(code,output).passed,false);
});
test('missing, forged and traversal validation receipts fail closed',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'sammakko-validation-guard-'));
 try{for(const r of [null,{}, {schemaVersion:1,status:'FAIL',exitCode:0}, {schemaVersion:1,status:'PASS',exitCode:1}, {schemaVersion:1,status:'PASS',exitCode:0,contentRevisions:{},sourceHashes:{},output:'../../outside'}])assert.equal(verifyValidationReceipt(root,r),false);}finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('a passing receipt becomes unusable after package, shared delivery/compiler, policy or log changes',()=>{
 const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'sammakko-source-binding-'));
 const root=path.join(temporary,'public','oppitunnit');
 fs.mkdirSync(root,{recursive:true});
 const write=(file,data)=>{fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});fs.writeFileSync(path.join(root,file),data);};
 try{
  for(const f of ['navigation.json','navigation.mjs'])write('../shared/'+f,'{}');
  for(const f of ['brand.css','site.js'])write('../kotisivu/assets/'+f,'/* fixture */');
  for(const f of ['content.mjs','audience.mjs','AUDIENCE_AUTHORING.md','test-audience.mjs','production-status.mjs','validation-receipt.mjs','check-package-tests.mjs','test-validation-receipt.mjs','test-review-lifecycle-helper.mjs','test-package-revision-helper.mjs','build.mjs','runtime.mjs','verify.mjs','verify-game-actions.mjs','site-config.mjs','test-site-integration.mjs','test-game-actions.mjs','refresh-technical-receipts.mjs'])write('lesson-network/'+f,'// fixture');
  for(const f of ['package.json','package-lock.json','CONTENT_STATUS.yaml','AUTONOMOUS_52_STATE.json','canonical/fixture.json','content-design/fixture.json','baseline/fixture.json','lesson-network/assets/shell.css','lesson-network/assets/shell.js','lesson-network/assets/lesson-loader.js','lesson-network/assets/audience.js','lesson-network/reference/CONTRACT.json','lesson-network/reference/RUNTIME_LINKS.json','lesson-network/reference/inputs/mvp-scope-181.json','lesson-network/reference/inputs/canonical-690-graph.json','lesson-network/authority/production-181-v2/lite/src/content/facts.ts','lesson-network/authority/production-181-v2/lite-source-hashes.json','lesson-network/INTERACTION_FEEDBACK_CONTRACT.md','lesson-network/evidence/production/historical-receipt-identities.json'])write(f,'{}');
  write('lesson-network/reference/inputs/mvp-scope-181.json',JSON.stringify({selected_ids:['TEST-KC']}));
  write('lesson-network/packages/TEST-KC/lesson.json',JSON.stringify({schemaVersion:1,kcId:'TEST-KC',revision:1,state:'draft',body:'body.html',module:null,assets:[],research:[],reviews:[],alignment:{},planning:{},extensions:{}}));write('lesson-network/packages/TEST-KC/body.html','<p>Fixture only</p>');write('lesson-network/packages/TEST-KC/tests.mjs','// original');
  const output='lesson-network/evidence/production/TEST/validation/tests.tap';write(output,tap());write(path.posix.dirname(output)+'/stderr.txt','');
  const r={schemaVersion:1,status:'PASS',exitCode:0,sourceUnchanged:true,contentRevisions:{'TEST-KC':loadPackages(path.join(root,'lesson-network'),['TEST-KC']).get('TEST-KC').metadata.contentRevision},sourceHashes:sourceInventory(root,['TEST-KC']),output,outputSha256:digest(tap()),stderrSha256:digest(''),counts:successfulTestRun(0,tap()).counts};
  assert.equal(verifyValidationReceipt(root,r),true);
  const forged={...r,contentRevisions:{'TEST-KC':'1@invented'}};assert.equal(verifyValidationReceipt(root,forged),false);
  write('lesson-network/packages/TEST-KC/body.html','<p>New content</p>');
  assert.equal(verifyValidationReceipt(root,{...r,sourceHashes:sourceInventory(root,['TEST-KC'])}),false,'Current inventory cannot authenticate an old content-revision claim');
  write('lesson-network/packages/TEST-KC/body.html','<p>Fixture only</p>');
  write('lesson-network/packages/UNSELECTED/lesson.json','incomplete draft');assert.equal(verifyValidationReceipt(root,r),true,'Unselected draft stays isolated');fs.rmSync(path.join(root,'lesson-network/packages/UNSELECTED'),{recursive:true});
  write('lesson-network/packages/TEST-KC/tests.mjs','// changed');assert.equal(verifyValidationReceipt(root,r),false);
  write('lesson-network/packages/TEST-KC/tests.mjs','// original');assert.equal(verifyValidationReceipt(root,r),true);
  write('lesson-network/packages/TEST-KC/extra.mjs','// omitted');assert.equal(verifyValidationReceipt(root,r),false);fs.unlinkSync(path.join(root,'lesson-network/packages/TEST-KC/extra.mjs'));
  write(output,tap({fail:1,pass:1}));assert.equal(verifyValidationReceipt(root,r),false);
  write(output,tap());write(path.posix.dirname(output)+'/stderr.txt','altered');assert.equal(verifyValidationReceipt(root,r),false);write(path.posix.dirname(output)+'/stderr.txt','');
  for(const f of ['lesson-network/reference/inputs/canonical-690-graph.json','lesson-network/authority/production-181-v2/lite/src/content/facts.ts','lesson-network/INTERACTION_FEEDBACK_CONTRACT.md','lesson-network/build.mjs','lesson-network/audience.mjs','lesson-network/test-audience.mjs','lesson-network/test-package-revision-helper.mjs','lesson-network/runtime.mjs','lesson-network/verify.mjs','lesson-network/verify-game-actions.mjs','lesson-network/site-config.mjs','lesson-network/test-site-integration.mjs','lesson-network/refresh-technical-receipts.mjs','lesson-network/assets/shell.css','lesson-network/assets/shell.js','lesson-network/assets/lesson-loader.js','lesson-network/assets/audience.js','lesson-network/reference/CONTRACT.json','lesson-network/reference/RUNTIME_LINKS.json','canonical/fixture.json','CONTENT_STATUS.yaml','AUTONOMOUS_52_STATE.json']){const original=fs.readFileSync(path.join(root,f));write(f,'changed');assert.equal(verifyValidationReceipt(root,r),false,f);write(f,original);assert.equal(verifyValidationReceipt(root,r),true,f+' restored');}
  for(const f of ['../shared/navigation.json','../shared/navigation.mjs','../kotisivu/assets/brand.css','../kotisivu/assets/site.js']){const original=fs.readFileSync(path.join(root,f));write(f,'changed shared route contract');assert.equal(verifyValidationReceipt(root,r),false,f);write(f,original);assert.equal(verifyValidationReceipt(root,r),true,f+' restored');}
  for(const f of ['lesson-network/assets/new-renderer.js','lesson-network/deployment.json']){write(f,'{}');assert.equal(verifyValidationReceipt(root,r),false,f+' added');fs.unlinkSync(path.join(root,f));assert.equal(verifyValidationReceipt(root,r),true,f+' removed');}
 }finally{fs.rmSync(temporary,{recursive:true,force:true});}
});

test('lifecycle fixture refuses symlink and hard-link escapes before any writes',()=>{
 const root=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'sammakko-fixture-escape-'))),outside=fs.mkdtempSync(path.join(os.tmpdir(),'sammakko-sentinel-'));
 const sentinel=path.join(outside,'lesson.json'),body=path.join(outside,'body.html'),dir=path.join(root,'packages','TEST-KC');
 fs.writeFileSync(sentinel,JSON.stringify({body:'body.html'}));fs.writeFileSync(body,'sentinel-body');fs.mkdirSync(path.dirname(dir),{recursive:true});
 const unchanged=()=>{assert.equal(fs.readFileSync(sentinel,'utf8'),JSON.stringify({body:'body.html'}));assert.equal(fs.readFileSync(body,'utf8'),'sentinel-body');};
 try{
  fs.symlinkSync(outside,dir,'dir');assert.throws(()=>assertReviewLifecycle(root,'TEST-KC'),/symlink/);unchanged();fs.unlinkSync(dir);fs.mkdirSync(dir);
  fs.symlinkSync(sentinel,path.join(dir,'lesson.json'));assert.throws(()=>assertReviewLifecycle(root,'TEST-KC'),/symlink/);unchanged();fs.unlinkSync(path.join(dir,'lesson.json'));
  fs.writeFileSync(path.join(dir,'lesson.json'),JSON.stringify({body:'body.html'}));fs.symlinkSync(body,path.join(dir,'body.html'));assert.throws(()=>assertReviewLifecycle(root,'TEST-KC'),/symlink/);unchanged();
  fs.unlinkSync(path.join(dir,'body.html'));fs.unlinkSync(path.join(dir,'lesson.json'));fs.linkSync(sentinel,path.join(dir,'lesson.json'));assert.throws(()=>assertReviewLifecycle(root,'TEST-KC'),/hard-linked/);unchanged();fs.unlinkSync(path.join(dir,'lesson.json'));
  fs.writeFileSync(path.join(dir,'lesson.json'),JSON.stringify({body:'body.html'}));fs.linkSync(body,path.join(dir,'body.html'));assert.throws(()=>assertReviewLifecycle(root,'TEST-KC'),/hard-linked/);unchanged();
 }finally{fs.rmSync(root,{recursive:true,force:true});fs.rmSync(outside,{recursive:true,force:true});}
});


test('sealed checkpoints stay strict; reviewed maintenance cannot change selection or inherit stale reviews',()=>{
 const expected={'TEST-KC':'1@old'},revision='2@new';
 const pkg=(contentRevision=revision,state='reviewed',reviewRevision=revision)=>new Map([['TEST-KC',{metadata:{contentRevision,contentReview:{state,revision:reviewRevision},alignmentReview:{state,revision:reviewRevision}}}]]);
 assert.throws(()=>checkpointRevisions(expected,pkg()),/content changed/);
 assert.deepEqual(checkpointRevisions(expected,pkg(),true),{'TEST-KC':revision});
 assert.deepEqual(checkpointRevisions(expected,pkg('1@old','pending','1@old')),expected);
 for(const state of ['pending','stale','not_reviewed'])assert.throws(()=>checkpointRevisions(expected,pkg(revision,state),true),/requires reviewed/);
 assert.throws(()=>checkpointRevisions(expected,pkg(revision,'reviewed','1@old'),true),/requires reviewed/);
 const oneReview=pkg();oneReview.get('TEST-KC').metadata.alignmentReview.state='pending';assert.throws(()=>checkpointRevisions(expected,oneReview,true),/requires reviewed/);
 assert.throws(()=>checkpointRevisions(expected,new Map(),true),/selection changed/);
 const extra=pkg();extra.set('OTHER-KC',extra.get('TEST-KC'));assert.throws(()=>checkpointRevisions(expected,extra,true),/selection changed/);
});
