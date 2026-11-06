import fs from 'node:fs';
import path from 'node:path';
import {digest,loadPackages} from './content.mjs';
// Sealed checkpoints remain immutable. Updating a lesson is a distinct, explicit
// maintenance run, with the same selected IDs and reviews for its actual revision.
export function checkpointRevisions(expected,packages,allowReviewedUpdates=false){
 const ids=Object.keys(expected).sort();
 if(JSON.stringify([...packages.keys()].sort())!==JSON.stringify(ids))throw Error('Checkpoint selection changed');
 return Object.fromEntries(ids.map(id=>{
  const m=packages.get(id).metadata,revision=m.contentRevision;
  if(revision!==expected[id]){
   if(!allowReviewedUpdates)throw Error('Checkpoint content changed: '+id);
   for(const kind of ['contentReview','alignmentReview'])if(m[kind]?.state!=='reviewed'||m[kind]?.revision!==revision)throw Error('Current revision requires reviewed content and alignment: '+id);
  }
  return [id,revision];
 }));
}
const tools=['content.mjs','audience.mjs','AUDIENCE_AUTHORING.md','test-audience.mjs','production-status.mjs','validation-receipt.mjs','check-package-tests.mjs','test-validation-receipt.mjs','test-review-lifecycle-helper.mjs','test-package-revision-helper.mjs','build.mjs','runtime.mjs','verify.mjs','verify-game-actions.mjs','site-config.mjs','test-site-integration.mjs','test-game-actions.mjs','refresh-technical-receipts.mjs'];
export function sourceInventory(root,ids){
 const files=new Set(tools.map(f=>'lesson-network/'+f));
 for(const f of ['package.json','package-lock.json','CONTENT_STATUS.yaml','AUTONOMOUS_52_STATE.json'])files.add(f);
 // The combined-site compiler imports this explicit shared publication contract.
 // Keep the inventory paths relative to public/oppitunnit, like all older receipts.
 for(const f of ['navigation.json','navigation.mjs'])if(fs.existsSync(path.join(root,'../shared',f)))files.add('../shared/'+f);
 for(const f of ['brand.css','site.js'])if(fs.existsSync(path.join(root,'../kotisivu/assets',f)))files.add('../kotisivu/assets/'+f);
 const walk=dir=>{for(const e of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){const name=dir+'/'+e.name;if(e.isSymbolicLink())throw Error('Validation source symlink unsupported: '+name);if(e.isDirectory())walk(name);else if(e.isFile())files.add(name);}};
 for(const id of [...ids].sort()){
  if(!/^[A-Z0-9-]+$/.test(id))throw Error('Unsafe KC identity');
  const base='lesson-network/packages/'+id;walk(base);
  const p=JSON.parse(fs.readFileSync(path.join(root,base,'lesson.json')));
  for(const a of p.assets)if(a.path.startsWith('shared/'))files.add('lesson-network/'+a.path);
 }
 // Shared delivery and compiler inputs can invalidate an unchanged KC's executed view.
 // Bind the actual build-version closure, not only its package and mathematical tests.
 walk('lesson-network/assets');
 walk('lesson-network/reference');
 for(const dir of ['canonical','content-design','baseline'])walk(dir);
 if(fs.existsSync(path.join(root,'lesson-network/deployment.json')))files.add('lesson-network/deployment.json');
 walk('lesson-network/authority/production-181-v2');
 files.add('lesson-network/INTERACTION_FEEDBACK_CONTRACT.md');
 files.add('lesson-network/evidence/production/historical-receipt-identities.json');
 return Object.fromEntries([...files].sort().map(f=>[f,digest(fs.readFileSync(path.join(root,f)))]));
}
export function successfulTestRun(exitCode,stdout){
 const counts=Object.fromEntries(['tests','pass','fail','cancelled','skipped','todo'].map(k=>[k,Number(stdout.match(new RegExp('^# '+k+' (\\d+)$','m'))?.[1]??NaN)]));
 return {passed:exitCode===0&&Object.values(counts).every(Number.isSafeInteger)&&counts.tests>0&&counts.pass===counts.tests&&['fail','cancelled','skipped','todo'].every(k=>counts[k]===0),counts};
}
export function verifyValidationReceipt(root,receipt){
 try{
  if(receipt?.schemaVersion!==1||receipt.status!=='PASS'||receipt.exitCode!==0||receipt.sourceUnchanged!==true||!receipt.contentRevisions||!receipt.sourceHashes)return false;
  const outputPath=receipt.output;
  if(typeof outputPath!=='string'||!outputPath.startsWith('lesson-network/evidence/production/')||outputPath.split('/').some(s=>s==='..'||s==='')||path.isAbsolute(outputPath))return false;
  const output=fs.readFileSync(path.join(root,outputPath));
  if(digest(output)!==receipt.outputSha256)return false;
  const stderr=fs.readFileSync(path.join(root,path.posix.dirname(outputPath),'stderr.txt'));
  if(digest(stderr)!==receipt.stderrSha256)return false;
  const actual=successfulTestRun(receipt.exitCode,output.toString());
  if(!actual.passed||JSON.stringify(actual.counts)!==JSON.stringify(receipt.counts))return false;
  const ids=Object.keys(receipt.contentRevisions);
  const current=loadPackages(path.join(root,'lesson-network'),ids,false,{onlySelected:true});
  if(current.size!==ids.length||ids.some(id=>current.get(id)?.metadata.contentRevision!==receipt.contentRevisions[id]))return false;
  const inventory=sourceInventory(root,ids);
  return JSON.stringify(inventory)===JSON.stringify(receipt.sourceHashes);
 }catch{return false;}
}

