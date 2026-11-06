// Test-only synthetic metadata, restricted to the caller's disposable package fixture.
import fs from 'node:fs';
import {Buffer} from 'node:buffer';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {loadPackages} from './content.mjs';
export function assertReviewLifecycle(root,id){
 const real=fs.realpathSync(root),temp=fs.realpathSync(os.tmpdir());
 assert(real.startsWith(temp+path.sep),'review lifecycle fixture must be under the OS temporary directory');
 assert(/^[A-Z0-9-]+$/.test(id),'safe fixture KC identity required');
 root=real;
 const dir=path.join(root,'packages',id);
 assert.equal(fs.realpathSync(dir),dir,'fixture package directory must not escape via symlink');
 const file=path.join(dir,'lesson.json');
 assert.equal(fs.realpathSync(file),file,'fixture metadata must not be a symlink');
 assert.equal(fs.statSync(file).nlink,1,'fixture metadata must not share a hard-linked inode');
 const original=fs.readFileSync(file),p=JSON.parse(original);
 assert(typeof p.body==='string'&&!path.isAbsolute(p.body)&&!p.body.includes('\\')&&p.body.split('/').every(x=>x&&x!=='.'&&x!=='..'),'safe fixture body path required');
 const bodyFile=path.join(dir,p.body);
 assert.equal(fs.realpathSync(bodyFile),bodyFile,'fixture body must not escape via symlink');
 assert.equal(fs.statSync(bodyFile).nlink,1,'fixture body must not share a hard-linked inode');
 const body=fs.readFileSync(bodyFile);
 const read=()=>loadPackages(root,[id]).get(id).metadata;
 const write=()=>fs.writeFileSync(file,JSON.stringify(p));
 try{
  const revision=read().contentRevision;
  p.reviews=[{kind:'content',state:'pending',revision,note:'SYNTHETIC isolated lifecycle regression; not a project review.'},{kind:'human',state:'pending',revision,note:'SYNTHETIC fixture; no human review performed.'}];write();
  assert.equal(read().contentReview.state,'pending');assert.equal(read().humanReview.state,'pending');
  p.reviews.push({kind:'content',state:'reviewed',revision,note:'SYNTHETIC exact-version lifecycle transition only.'});write();
  assert.equal(read().contentReview.state,'reviewed');assert.equal(read().humanReview.state,'pending');
  const probe=p.extensions?.audienceContract===1?'<section data-teaching-step="synthetic-lifecycle" data-lesson-role="teaching-step"><p>Synteettinen versiomuutoksen testi.</p></section>':'<p>Synteettinen versiomuutoksen testi.</p>';
  fs.writeFileSync(bodyFile,Buffer.concat([body,Buffer.from('\n'+probe+'\n')]));
  const changed=read();assert.notEqual(changed.contentRevision,revision);assert.equal(changed.contentReview.state,'stale');assert.equal(changed.humanReview.state,'stale');
  assert.equal(changed.contentReview.history.at(-1).revision,revision);
 }finally{fs.writeFileSync(file,original);fs.writeFileSync(bodyFile,body);}
}
