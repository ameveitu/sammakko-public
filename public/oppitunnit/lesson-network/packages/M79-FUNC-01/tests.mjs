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

test('every finite arrow subset: exactly 27 functions including constants and shared outputs',()=>{
 const all=lesson.INPUTS.flatMap(x=>lesson.OUTPUTS.map(y=>[x,y]));let good=0;
 for(let mask=0;mask<512;mask++){const pairs=all.filter((_,i)=>mask&(1<<i));let expected=true;for(let row=0;row<3;row++){const bits=(mask>>(row*3))&7;if(bits===0||(bits&(bits-1))!==0)expected=false;}assert.equal(lesson.checkMapping(pairs).ok,expected);if(expected)good++;}
 assert.equal(good,27);assert.equal(lesson.checkMapping([[0,2],[1,2],[2,2]]).ok,true);assert.equal(lesson.checkMapping([[0,2],[1,2],[2,0],[1,2]]).ok,true);
 assert.equal(lesson.checkMapping([]).reason,'missing');assert.equal(lesson.checkMapping([[0,2],[1,1],[1,2]]).reason,'conflict');assert.equal(lesson.checkMapping([[0,2],[1,2]]).input,2);
});
test('every required record and tuple index is own, dense and in the stated domain',()=>{
 const valid=[[0,2],[1,2],[2,0]],hole=valid.map(p=>[...p]);delete hole[1];
 const extraHole=valid.map(p=>[...p]);extraHole.length++;
 const tupleHole=[0,2];delete tupleHole[1];
 const inherited=valid.map(p=>[...p]);delete inherited[2];const proto=Object.create(Array.prototype);proto[2]=[2,0];Object.setPrototypeOf(inherited,proto);
 for(const bad of [null,undefined,{},'pairs',Array(3),hole,extraHole,inherited,[[0,2],tupleHole,[2,0]],[[0,2],[1,2],[2,0,1]],[[0,2],[1,undefined],[2,0]],[[0,2],[1,NaN],[2,0]],[[0,2],[1,Infinity],[2,0]],[[0,2],[1,'2'],[2,0]],[[0,2],[1,2],[3,0]],[[0,2],[1,2],['constructor',0]],[[0,2],[1,2],['__proto__',0]],[[0,2],[1,2],{}]])assert.equal(lesson.checkMapping(bad).reason,'data');
 assert.equal(lesson.checkMapping([...valid].reverse()).ok,true);
});
test('editable arrows preserve originals, deduplicate observations and reverse their own changes',()=>{
 const before=[[0,2],[1,2],[2,0]];const added=lesson.toggleArrow(before,1,0);assert.deepEqual(before,[[0,2],[1,2],[2,0]]);assert.equal(lesson.checkMapping(added).reason,'conflict');assert.deepEqual(lesson.toggleArrow(added,1,0),before);
 assert.equal((lesson.mappingScene([...before,[1,2]],1).match(/data-arrow=/g)||[]).length,3);
 for(const [x,y] of [[3,0],[0,3],['0',2],[null,2]])assert.throws(()=>lesson.toggleArrow(before,x,y),RangeError);
 assert.throws(()=>lesson.toggleArrow(Array(3),0,0),RangeError);
});
