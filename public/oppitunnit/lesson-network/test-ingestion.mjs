import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {digest} from './content.mjs';
const root=new URL('./',import.meta.url), fixture=new URL('fixtures/M-ALG-08/',root),out=new URL('fixture-preview/',root);
const run=()=>execFileSync(process.execPath,[new URL('build.mjs',root).pathname],{env:{...process.env,LESSON_FIXTURES:'1'},stdio:'pipe'});
const source=new URL('lesson.json',fixture),body=new URL('body.html',fixture),original=fs.readFileSync(source),originalBody=fs.readFileSync(body);
const read=p=>JSON.parse(fs.readFileSync(new URL(p,out)));
const pages=()=>Object.fromEntries(fs.readdirSync(new URL('site/lessons/',out)).map(n=>[n,digest(fs.readFileSync(new URL('site/lessons/'+n,out)))]));
let checks=0;const test=(v,m)=>{assert(v,m);checks++;};
try{
 assert.throws(()=>execFileSync(process.execPath,[new URL('build.mjs',root).pathname],{env:{...process.env,LESSON_BATCH_LIMIT:'1'},stdio:'pipe'}));
 run();const first=read('records/M-ALG-08.json'),snapshot=pages();
 test(fs.readFileSync(new URL('site/lessons/M-ALG-08.html',out),'utf8').includes('SENTINEL-M-ALG-08'),'static fixture composition');
 let pkg=JSON.parse(original);pkg.reviews=[{kind:'content',state:'reviewed',revision:first.authoredPackage.contentRevision,note:'Synthetic contract test only; not pedagogy approval'}];fs.writeFileSync(source,JSON.stringify(pkg));run();
 test(read('records/M-ALG-08.json').contentReview.state==='reviewed','exact review applied only to matched hash');
 fs.writeFileSync(body,originalBody.toString()+'<p>UPDATED-SENTINEL</p>');pkg.revision=2;fs.writeFileSync(source,JSON.stringify(pkg));run();run();
 const second=read('records/M-ALG-08.json');
 test(first.authoredPackage.contentRevision!==second.authoredPackage.contentRevision,'KC revision changes');test(second.contentReview.state==='stale','old review not current');
 test(second.authoredPackage.extensions.testMarker==='persist-me','extension preserved');test(second.authoredPackage.planning.learnerAction===pkg.planning.learnerAction,'planning preserved');
 const updatedPages=pages();for(const [n,hash]of Object.entries(snapshot))if(n!=='M-ALG-08.html')test(updatedPages[n]===hash,'unrelated page unchanged '+n);
 const good=fs.readFileSync(new URL('site/lessons/M-ALG-08.html',out));
 for(const mutate of [p=>p.unknown='reject',p=>p.kcId='WRONG-KC',p=>p.assets[0].path='absent.svg']){
  const broken=structuredClone(pkg);mutate(broken);fs.writeFileSync(source,JSON.stringify(broken));assert.throws(run);test(fs.readFileSync(new URL('site/lessons/M-ALG-08.html',out)).equals(good),'failed source preserves last good');test(read('build-status.json').state==='failed','failure visible separately from last good');
 }
 fs.writeFileSync(source,JSON.stringify(pkg));run();
 const derived=new URL('records/M-ALG-08.json',out),bytes=fs.readFileSync(derived);const corrupted=JSON.parse(bytes);corrupted.contentReview.note='UNSUPPORTED EDIT';fs.writeFileSync(derived,JSON.stringify(corrupted));assert.throws(run);test(JSON.parse(fs.readFileSync(derived)).contentReview.note==='UNSUPPORTED EDIT','derived edit rejected intact');fs.writeFileSync(derived,bytes);
 const extra=new URL('fixtures/M-MEAS-00/',root);
 try{fs.cpSync(fixture,extra,{recursive:true});const p=JSON.parse(fs.readFileSync(new URL('lesson.json',extra)));p.kcId='M-MEAS-00';fs.writeFileSync(new URL('lesson.json',extra),JSON.stringify(p));run();test(read('records/M-MEAS-00.json').authoredPackage.kcId==='M-MEAS-00','add without generator edit');}finally{fs.rmSync(extra,{recursive:true,force:true});}
}finally{fs.writeFileSync(source,original);fs.writeFileSync(body,originalBody);run();}
console.log(JSON.stringify({status:'PASS',checks,scope:'noncurricular add/edit/rebuild/preservation/stale-review/failure/derived-edit tests'}));
