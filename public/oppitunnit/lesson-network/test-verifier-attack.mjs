import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {digest} from './content.mjs';
const root=new URL('./',import.meta.url),stage=fs.mkdtempSync(path.join(os.tmpdir(),'sammakko-audit-attack-'));
try{
 for(const p of ['reference','records','site','checkpoints','inventory.json','coverage.json','build.mjs','runtime.mjs','content.mjs','assets','packages','shared'])fs.cpSync(new URL(p,root),path.join(stage,p),{recursive:true});
 const load=p=>JSON.parse(fs.readFileSync(path.join(stage,p))),save=(p,x)=>fs.writeFileSync(path.join(stage,p),JSON.stringify(x,null,2)+'\n');
 const id='M-ALG-08',record=load('records/'+id+'.json'),manifest=load('site/data/lesson-manifest.json'),teacher=load('site/data/teacher-integration.json'),coverage=load('coverage.json');
 const url='https://fabricated.example/#journey/WRONG-KC';
 record.runtimeAvailability.sammakko={status:'ready',url,classroomReady:true,requiresFreshDocument:true,target:'_blank',rel:'noopener',releaseReview:'unverified'};
 const pageFile=path.join(stage,'site/lessons/'+id+'.html');let page=fs.readFileSync(pageFile,'utf8');
 page=page.replace(/<section data-game-kind="sammakko">[\s\S]*?<\/section>/,`<section data-game-kind="sammakko"><h3>Sammakko-peli</h3><p>ready</p><a data-game-action="open" target="_blank" rel="noopener" href="${url}">Avaa Sammakko-peli</a><button data-game-action="copy" data-copy-url="${url}">Kopioi Sammakko-pelilinkki</button></section>`);
 fs.writeFileSync(pageFile,page);record.outputHash=digest(page);record.checkpoint.outputHash=record.outputHash;
 save('records/'+id+'.json',record);save('checkpoints/'+id+'.json',record.checkpoint);
 for(const array of [manifest,teacher.entries])array.find(m=>m.kcId===id).gameLinks=record.runtimeAvailability;
 coverage.checkpoints.find(m=>m.kcId===id).outputHash=record.outputHash;
 save('site/data/lesson-manifest.json',manifest);save('site/data/teacher-integration.json',teacher);save('coverage.json',coverage);
 let result;try{execFileSync(process.execPath,[new URL('verify.mjs',root).pathname],{env:{...process.env,LESSON_VERIFY_ROOT:stage},stdio:'pipe'});assert.fail('forged matching outputs passed');}catch(e){assert(e.stdout,'expected validator failure');result=JSON.parse(e.stdout);}
 assert(!result.passed);assert(result.failures.every(x=>x.startsWith(id+': ')),'attack must not pass due to unrelated stale outputs');assert(result.failures.some(x=>x.includes(id)&&/game|sammakko|ready|URL|status/i.test(x)));
 console.log(JSON.stringify({status:'PASS',attack:'Mutually consistent ready record/manifests/HTML/checkpoints/hashes with WRONG-KC rejected by full independent verifier',failureCount:result.failureCount}));
}finally{fs.rmSync(stage,{recursive:true,force:true});}
