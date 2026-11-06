import fs from 'node:fs';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('assets/lesson-loader.js',import.meta.url),'utf8').replace('import(new URL(host.dataset.lessonModule,location.href))','load()');
function harness(){const events=new EventTarget(),host=new EventTarget(),doc=new EventTarget(),status={dataset:{}};host.dataset={lessonModule:'test.mjs'};host.querySelector=()=>status;doc.querySelector=()=>host;doc.hidden=false;let resolve;const promise=new Promise(r=>resolve=r);const done=Function('document','addEventListener','location','load','return '+source)(doc,events.addEventListener.bind(events),{reload(){}},()=>promise);return{events,resolve,done};}
let mounts=0,disposes=0;
const early=harness();early.events.dispatchEvent(new Event('pagehide'));early.resolve({mount(){mounts++;return{pause(){},resume(){},reset(){},dispose(){disposes++;}};}});await early.done;assert.equal(mounts,0);assert.equal(disposes,0);
const invalid=harness();invalid.resolve({mount(){return{pause(){},resume(){},dispose(){disposes++;}};}});await invalid.done;invalid.events.dispatchEvent(new Event('pagehide'));assert.equal(disposes,1);
console.log('PASS: navigation during pending import never mounts; invalid lifecycle disposes exactly once');
