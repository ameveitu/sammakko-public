import {assertPackageRevision} from '../../test-package-revision-helper.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadPackages,digest} from '../../content.mjs';
import * as lesson from './lesson.mjs';
const directory=path.dirname(fileURLToPath(import.meta.url)),id=path.basename(directory),root=path.resolve(directory,'../..');
test('own package matches atomic canonical node and isolated source contract',()=>{
 const p=JSON.parse(fs.readFileSync(path.join(directory,'lesson.json'),'utf8'));
 const node=JSON.parse(fs.readFileSync(path.join(root,'reference/inputs/canonical-690-graph.json'),'utf8')).nodes.find(n=>n.id===id);
 assert.equal(p.state,'draft');const boundRevision = assertPackageRevision(import.meta.url,3);assert.equal(p.planning.gradeBand,node.grade_band);assert.equal(p.planning.teacherObjective,node.title);assert.equal(p.planning.canonicalMasteryRole,'atomic');assert.equal(p.planning.canonicalNodeKind,'concept');assert.equal(p.planning.canonicalEntryRole,'none');assert.deepEqual(p.planning.canonicalPrerequisiteGroups,node.prerequisite_groups);assert.deepEqual(p.planning.strongSupport,node.relations.filter(r=>r.strength==='strong'));
 assert.equal(p.planning.feedbackContract.sha256,digest(fs.readFileSync(path.join(root,'INTERACTION_FEEDBACK_CONTRACT.md'))));
 assert(p.research.every(r=>r.url.startsWith('https://')&&r.retrieved==='2026-10-29'&&r.title&&r.organization&&r.adopted.length&&r.rejected.length&&r.usageRestrictions));
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),id+'-source-'));
 try{fs.mkdirSync(path.join(temp,'packages'),{recursive:true});fs.cpSync(directory,path.join(temp,'packages',id),{recursive:true});fs.mkdirSync(path.join(temp,'reference/inputs'),{recursive:true});fs.copyFileSync(path.join(root,'reference/inputs/mvp-scope-181.json'),path.join(temp,'reference/inputs/mvp-scope-181.json'));for(const a of p.assets.filter(a=>a.path.startsWith('shared/'))){const dest=path.join(temp,a.path);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(root,a.path),dest);}const pkgs=loadPackages(temp,[id]);assert.equal(pkgs.size,1);assert.equal(pkgs.get(id).metadata.contentRevision,boundRevision);}finally{fs.rmSync(temp,{recursive:true,force:true});}
});

test('all allowed counts and every prediction value have exact model truth',()=>{
 for(const [key,max] of [['price',6],['remaining',12]])for(let n=0;n<=max;n++){const actual=key==='price'?4+2*n:12-n;assert.equal(lesson.modelValue(key,n),actual);for(let answer=0;answer<=30;answer++)assert.equal(lesson.checkPrediction(key,n,answer).ok,answer===actual);}
 assert.match(lesson.checkPrediction('price',3,6).text,/varausosa 4 puuttuu/);assert.match(lesson.checkPrediction('price',3,27).text,/peräkkäin/);assert.equal(lesson.checkPrediction('remaining',6,6).ok,true);
});
test('arbitrary jumps and decreases use the complete change, not an unconditional +2',()=>{
 for(let from=0;from<=6;from++)for(let to=0;to<=6;to++)assert.equal(lesson.modelDifference('price',from,to),2*(to-from));
 for(let from=0;from<=12;from++)for(let to=0;to<=12;to++)assert.equal(lesson.modelDifference('remaining',from,to),from-to);
 assert.equal(lesson.modelValue('price',0),4);assert.equal(lesson.modelValue('price','2,0'),8);assert.equal((lesson.modelScene('price','2,0').match(/<rect /g)||[]).length,4);
});
test('numeric domains and displayed model quantities stay finite and explicit',()=>{
 for(const v of ['', ' ',null,undefined,{},[],Array(1),'0x3','2x','2.5',NaN,Infinity,-1,31])assert.equal(lesson.checkPrediction('price',3,v).ok,false);
 for(const [key,n] of [['price',7],['remaining',13],['constructor',2],[['price'],2],[{toString:()=> 'price'},2],['price',2.5],['price',undefined]]){assert.throws(()=>lesson.modelValue(key,n),RangeError);assert.equal(lesson.checkPrediction(key,n,4).ok,false);}
 for(const key of ['price','remaining'])for(let n=0;n<=lesson.MODELS[key].max;n++){const svg=lesson.modelScene(key,n);assert.doesNotMatch(svg,/NaN|Infinity/);assert.match(svg,/aria-label=/);}
});
