// Run the explicit checkpoint selection even while later package drafts are incomplete.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {digest,loadPackages} from './content.mjs';
import {sourceInventory,successfulTestRun,checkpointRevisions} from './validation-receipt.mjs';
const root=new URL('../',import.meta.url).pathname;
const [checkpoint,run,mode,...extra]=process.argv.slice(2);
if(!/^B\d+$/.test(checkpoint??'')||!(/^[a-zA-Z0-9_-]+$/.test(run??''))||(mode!==undefined&&mode!=='--current')||extra.length)throw Error('Usage: node lesson-network/check-package-tests.mjs B08 unique-run-name [--current]');
const completion=JSON.parse(fs.readFileSync(path.join(root,'lesson-network/evidence/production',checkpoint,'completion.json')));
const ids=Object.keys(completion.contentRevisions).sort();
const relative='lesson-network/evidence/production/'+checkpoint+'/validation/'+run;
const output=path.join(root,relative);
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.mkdirSync(output,{recursive:false}); // existing evidence is immutable
const before=sourceInventory(root,ids),staging=fs.mkdtempSync(path.join(os.tmpdir(),'sammakko-validation-'));
let revisions;
try{
 fs.mkdirSync(path.join(staging,'packages'));
 fs.mkdirSync(path.join(staging,'reference/inputs'),{recursive:true});
 fs.copyFileSync(path.join(root,'lesson-network/reference/inputs/mvp-scope-181.json'),path.join(staging,'reference/inputs/mvp-scope-181.json'));
 for(const id of ids){
  const dir=path.join(root,'lesson-network/packages',id);fs.cpSync(dir,path.join(staging,'packages',id),{recursive:true});
  const p=JSON.parse(fs.readFileSync(path.join(dir,'lesson.json')));
  for(const a of p.assets.filter(a=>a.path.startsWith('shared/'))){const f=path.join(staging,a.path);fs.mkdirSync(path.dirname(f),{recursive:true});fs.copyFileSync(path.join(root,'lesson-network',a.path),f);}
 }
 revisions=checkpointRevisions(completion.contentRevisions,loadPackages(staging,ids),mode==='--current');
}finally{fs.rmSync(staging,{recursive:true,force:true});}
const args=['--test','--test-reporter=tap',...ids.map(id=>'lesson-network/packages/'+id+'/tests.mjs'),'lesson-network/test-validation-receipt.mjs','lesson-network/test-game-actions.mjs','lesson-network/test-site-integration.mjs','lesson-network/test-audience.mjs'];
const result=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024});
const stdout=result.stdout??'',stderr=result.stderr??'';
fs.writeFileSync(path.join(output,'tests.tap'),stdout);fs.writeFileSync(path.join(output,'stderr.txt'),stderr);
const after=sourceInventory(root,ids),checked=successfulTestRun(result.status,stdout);
const passed=checked.passed&&JSON.stringify(before)===JSON.stringify(after);
const receipt={schemaVersion:1,checkpoint,checkpointMode:mode==='--current'?'current':'sealed',status:passed?'PASS':'FAIL',exitCode:result.status,signal:result.signal,command:[process.execPath,...args],counts:checked.counts,contentRevisions:revisions,sourceHashes:before,sourceUnchanged:JSON.stringify(before)===JSON.stringify(after),output:relative+'/tests.tap',outputSha256:digest(stdout),stderrSha256:digest(stderr)};
fs.writeFileSync(path.join(output,'receipt.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({status:receipt.status,exitCode:result.status,counts:receipt.counts,receipt:relative+'/receipt.json'}));
process.exitCode=passed?0:1;

