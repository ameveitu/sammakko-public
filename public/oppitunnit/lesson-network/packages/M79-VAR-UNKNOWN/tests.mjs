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
 assert.equal(p.state,'draft');const boundRevision = assertPackageRevision(import.meta.url,2);assert.equal(p.planning.gradeBand,node.grade_band);assert.equal(p.planning.teacherObjective,node.title);assert.equal(p.planning.canonicalMasteryRole,'atomic');assert.equal(p.planning.canonicalNodeKind,'concept');assert.equal(p.planning.canonicalEntryRole,'none');assert.deepEqual(p.planning.canonicalPrerequisiteGroups,node.prerequisite_groups);assert.deepEqual(p.planning.strongSupport,node.relations.filter(r=>r.strength==='strong'));
 assert.equal(p.planning.feedbackContract.sha256,digest(fs.readFileSync(path.join(root,'INTERACTION_FEEDBACK_CONTRACT.md'))));
 assert(p.research.every(r=>r.url.startsWith('https://')&&r.retrieved==='2026-10-29'&&r.title&&r.organization&&r.adopted.length&&r.rejected.length&&r.usageRestrictions));
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),id+'-source-'));
 try{fs.mkdirSync(path.join(temp,'packages'),{recursive:true});fs.cpSync(directory,path.join(temp,'packages',id),{recursive:true});fs.mkdirSync(path.join(temp,'reference/inputs'),{recursive:true});fs.copyFileSync(path.join(root,'reference/inputs/mvp-scope-181.json'),path.join(temp,'reference/inputs/mvp-scope-181.json'));for(const a of p.assets.filter(a=>a.path.startsWith('shared/'))){const dest=path.join(temp,a.path);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(root,a.path),dest);}const pkgs=loadPackages(temp,[id]);assert.equal(pkgs.size,1);assert.equal(pkgs.get(id).metadata.contentRevision,boundRevision);}finally{fs.rmSync(temp,{recursive:true,force:true});}
});

test('both fixed conditions accept exactly the intended count across all candidates',()=>{
 for(const [key,want] of [['cards',12],['ticket',7]])for(let value=0;value<=20;value++){const r=lesson.checkUnknown(key,value);assert.equal(r.ok,value===want);if(value!==want)assert.match(r.text,new RegExp(String(value)));}
 assert.equal(lesson.checkUnknown('cards',17).reason,'large');assert.match(lesson.checkUnknown('cards',17).text,/koko määrää/);assert.equal(lesson.checkUnknown('cards',10).reason,'small');
});
test('blank and malformed candidates never turn into a zero or a successful number',()=>{
 for(const v of ['', ' ', '12x','0xC','1e1',null,undefined,{},[],Array(1),NaN,Infinity,-1,21,12.5,12n]){assert.equal(lesson.readWhole(v),null);assert.equal(lesson.checkUnknown('cards',v).ok,false);}
 for(const v of [12,'12','012','12.0','12,0'])assert.equal(lesson.checkUnknown('cards',v).ok,true);
 for(const key of ['constructor','__proto__','foreign',undefined,['cards'],{toString:()=> 'cards'}])assert.equal(lesson.checkUnknown(key,12).ok,false);
});
