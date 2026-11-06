import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolveGame} from './runtime.mjs';
const config=JSON.parse(fs.readFileSync(new URL('./reference/RUNTIME_LINKS.json',import.meta.url)));
const ids=['A','B'], lite=['A'];
const resolve=()=>resolveGame('A','sammakko',config,ids,lite);
assert.equal(resolveGame('B','lite',config,ids,lite).status,'outside_current_lite_scope');
assert.equal(resolveGame('A','lite',config,ids,lite).status,'route_unsupported');
assert.equal(resolve().status,'base_url_missing');
const a=config.adapters.sammakko;
a.baseUrl='https://school.example/prefix/?engineering=1#old';
assert.equal(resolve().status,'runtime_index_missing');
a.runtimeAvailability.ids=['B'];assert.equal(resolve().status,'runtime_index_missing');
a.runtimeAvailability.state='verified_compiled_index';assert.equal(resolve().status,'kc_not_implemented');
a.runtimeAvailability.ids=ids;assert.equal(resolve().status,'endpoint_unverified');
assert.equal(resolve().url,'https://school.example/prefix/#journey/A');
a.endpointVerification='verified';assert.equal(resolve().status,'student_reachability_unverified');
a.deploymentScope='public';a.studentReachability='verified';assert.equal(resolve().status,'ready');
for(const base of ['http://localhost/p/','http://localhost./','http://127.0.0.2/p/','http://[::1]/p/','http://[::ffff:127.0.0.1]/']){a.baseUrl=base;assert.equal(resolve().status,'local_preview_only');}
a.baseUrl='https://school.example/index.html';assert.equal(resolve().url,'https://school.example/index.html#journey/A');
a.routeSyntaxState='unsupported';assert.equal(resolve().status,'route_unsupported');a.routeSyntaxState='source_verified';
a.baseUrl='javascript:alert(1)';assert.equal(resolve().status,'invalid_base_url');
const root=new URL('./',import.meta.url), build=new URL('./build.mjs',import.meta.url);
const run=()=>execFileSync(process.execPath,[build.pathname],{encoding:'utf8',stdio:'pipe'});
run();
function tree(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?tree(new URL(e.name+'/',dir)):[new URL(e.name,dir)]);}
const files=['site/','records/','checkpoints/'].flatMap(p=>tree(new URL(p,root)));
const before=files.map(p=>[p,fs.readFileSync(p),fs.statSync(p).mtimeMs]);run();
for(const [p,bytes,time] of before){assert.deepEqual(fs.readFileSync(p),bytes);assert.equal(fs.statSync(p).mtimeMs,time);}
const page=new URL('./site/lessons/M-ALG-08.html',root), backup=new URL('./M-ALG-08.saved',root);
fs.renameSync(page,backup);
try{run();assert.deepEqual(fs.readFileSync(page),fs.readFileSync(backup));}finally{fs.renameSync(backup,page);}
const record=new URL('./records/M-ALG-08.json',root), original=fs.readFileSync(record);
try{const edited=JSON.parse(original);edited.newInstructionalContent.body={protectedDraft:true};fs.writeFileSync(record,JSON.stringify(edited));assert.throws(run);assert.deepEqual(JSON.parse(fs.readFileSync(record)).newInstructionalContent.body,{protectedDraft:true});}finally{fs.writeFileSync(record,original);}
console.log('PASS: routing states, clean URL, fresh-document contract, deterministic second build, missing-page resume, authored-record protection');
