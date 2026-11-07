import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import YAML from 'yaml';
import os from 'node:os';
import {loadPackages,composePackage} from './content.mjs';
import {resolveGame} from './runtime.mjs';
import {loadDeployment} from './site-config.mjs';

const sourceRoot=path.dirname(fileURLToPath(import.meta.url));
// All writes and exhaustive validation occur in isolation before publication.
if(!process.env.LESSON_STAGING){
 if(process.env.LESSON_BATCH_LIMIT && Number(process.env.LESSON_BATCH_LIMIT)<690)throw new Error('Partial build publication is unsupported; unset LESSON_BATCH_LIMIT. No outputs changed.');
 const target=process.env.LESSON_FIXTURES==='1'?path.join(sourceRoot,'fixture-preview'):sourceRoot;
 const stage=fs.mkdtempSync(path.join(os.tmpdir(),'sammakko-lesson-stage-'));
 const status=path.join(target,'build-status.json');fs.mkdirSync(target,{recursive:true});
 try{
  const mapFile=path.join(target,'derived-records.json');
  if(fs.existsSync(mapFile))for(const [id,sha] of Object.entries(JSON.parse(fs.readFileSync(mapFile)))){
   const f=path.join(target,'records',id+'.json');
   if(fs.existsSync(f))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'),sha,id+': derived record edited; author in packages/ instead');
  }
  if(!fs.existsSync(mapFile)&&fs.existsSync(path.join(target,'records'))){
   let originalManifest=null;const manifestFile=path.join(path.dirname(sourceRoot),'EXPORT_MANIFEST.json');if(fs.existsSync(manifestFile))originalManifest=JSON.parse(fs.readFileSync(manifestFile));
   for(const f of fs.readdirSync(path.join(target,'records'))){
    const relative=path.relative(path.dirname(sourceRoot),path.join(target,'records',f));let expected=null;
    if(originalManifest)expected=originalManifest.files.find(x=>x.path===relative)?.sha256;
    if(!expected)try{const gitRoot=execFileSync('git',['rev-parse','--show-toplevel'],{cwd:path.dirname(sourceRoot),stdio:'pipe'}).toString().trim();if(path.resolve(gitRoot)===path.dirname(sourceRoot))expected=crypto.createHash('sha256').update(execFileSync('git',['show','HEAD:'+relative],{cwd:gitRoot,stdio:'pipe'})).digest('hex');}catch{/* No trustworthy migration baseline: fail closed below. */}
    assert(expected&&expected===crypto.createHash('sha256').update(fs.readFileSync(path.join(target,'records',f))).digest('hex'),f+': legacy derived record has no matching baseline; preserve edits and restore trusted outputs before migration');
   }
  }
  for(const entry of fs.readdirSync(sourceRoot,{withFileTypes:true}))if(['reference','packages','fixtures','assets','shared'].includes(entry.name)||entry.name.endsWith('.mjs')||entry.name==='deployment.json')fs.cpSync(path.join(sourceRoot,entry.name),path.join(stage,entry.name),{recursive:true});
  for(const name of ['site','records','checkpoints','inventory.json','coverage.json'])if(fs.existsSync(path.join(target,name)))fs.cpSync(path.join(target,name),path.join(stage,name),{recursive:true});
  execFileSync(process.execPath,[fileURLToPath(import.meta.url)],{env:{...process.env,LESSON_STAGING:stage,LESSON_SOURCE_REPO:path.dirname(sourceRoot)},stdio:'pipe'});
  const publish=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
   const f=path.join(dir,entry.name),rel=path.relative(stage,f);
   if(entry.isDirectory())publish(f);else if(['site','records','checkpoints'].includes(rel.split(path.sep)[0])||['inventory.json','coverage.json'].includes(rel)){
    const dest=path.join(target,rel);fs.mkdirSync(path.dirname(dest),{recursive:true});const bytes=fs.readFileSync(f);
    if(!fs.existsSync(dest)||!fs.readFileSync(dest).equals(bytes)){fs.writeFileSync(dest+'.tmp',bytes);fs.renameSync(dest+'.tmp',dest);}
   }
  }};publish(stage);
  const contentDir=path.join(target,'site/content');if(fs.existsSync(contentDir)){const prune=dir=>{for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())prune(f);else if(!fs.existsSync(path.join(stage,path.relative(target,f))))fs.unlinkSync(f);}};prune(contentDir);}
  const hashes=Object.fromEntries(fs.readdirSync(path.join(target,'records')).map(f=>[f.slice(0,-5),crypto.createHash('sha256').update(fs.readFileSync(path.join(target,'records',f))).digest('hex')]));
  fs.writeFileSync(mapFile,JSON.stringify(hashes,null,2)+'\n');fs.writeFileSync(status,JSON.stringify({state:'verified',lastGoodRetained:true,fixture:process.env.LESSON_FIXTURES==='1'})+'\n');
  console.log(JSON.stringify({pages:690,state:'verified',fixture:process.env.LESSON_FIXTURES==='1'}));
 }catch(error){fs.writeFileSync(status,JSON.stringify({state:'failed',lastGoodRetained:true,error:String(error.stderr??error.message)})+'\n');console.error(String(error.stderr??error.stack));process.exitCode=1;}
 finally{fs.rmSync(stage,{recursive:true,force:true});}
 process.exit(process.exitCode??0);
}
const root=process.env.LESSON_STAGING,repo=process.env.LESSON_SOURCE_REPO;
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const json = p => JSON.parse(read(p));
const hash = s => crypto.createHash('sha256').update(s).digest('hex');
const encode = x => JSON.stringify(x,null,2)+'\n';
function save(p, data) {
  const target = path.join(root,p); fs.mkdirSync(path.dirname(target),{recursive:true});
  if (fs.existsSync(target) && fs.readFileSync(target,'utf8') === data) return false;
  fs.writeFileSync(target+'.tmp',data); fs.renameSync(target+'.tmp',target); return true;
}
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sourceHash = hash(read('reference/inputs/canonical-690-graph.json'));
assert.equal(sourceHash,'17eca8c1675ffe14aa3d6836e1ce7109020f440b22df09b7a7b15a8e95bb39fb');
const graph = json('reference/inputs/canonical-690-graph.json'), contract = json('reference/CONTRACT.json');
for (const source of json('reference/HANDOVER_MANIFEST.json').sourceInputs) assert.equal(hash(read('reference/'+source.path)),source.sha256);
const nodes = graph.nodes, byId = new Map(nodes.map(n=>[n.id,n])), ids = [...byId.keys()];
assert.equal(nodes.length,690); assert.equal(byId.size,690);
const lite = json('reference/inputs/mvp-scope-181.json').selected_ids; assert.equal(new Set(lite).size,181);
for (const id of lite) assert(byId.has(id));
const config = loadDeployment(root, repo);
const sitePackage = config.kind === 'same_origin_site_package';
// Combined-site navigation is an explicit authoring dependency. Standalone
// exports do not need the publication workspace or its navigation helper.
const publicationRoot = path.resolve(repo, '..'), navigationRoot = path.join(publicationRoot,'shared');
const publicationShellSource = sitePackage ? ['shared/navigation.mjs','shared/navigation.json','kotisivu/assets/brand.css','kotisivu/assets/site.js'].map(name=>name+'\0'+fs.readFileSync(path.join(publicationRoot,name),'utf8')).join('\n') : '';
const {renderSiteHeader,navigation} = sitePackage ? await import(pathToFileURL(path.join(navigationRoot,'navigation.mjs')).href) : {};

const top = Object.fromEntries(ids.map(id=>[id,[]])), bottom = Object.fromEntries(ids.map(id=>[id,[]]));
for (const n of nodes) for (const [i,r] of (n.relations??[]).entries()) {
  assert(byId.has(r.id)); const e={sourceKCId:r.id,targetKCId:n.id,relationType:r.relation_type,strength:r.strength,rationale:r.rationale,sourceRelationIndex:i};
  top[n.id].push(e); bottom[r.id].push(e);
}
const statuses = YAML.parse(fs.readFileSync(path.join(repo,'CONTENT_STATUS.yaml'),'utf8'));
const state = JSON.parse(fs.readFileSync(path.join(repo,'AUTONOMOUS_52_STATE.json'),'utf8'));
const protectedDirs = ['canonical','content-design','baseline'];
function walk(dir) { return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]); }
const sourceFiles = protectedDirs.flatMap(d=>walk(path.join(repo,d))).sort();
const protectedHashes = Object.fromEntries(sourceFiles.map(p=>[path.relative(repo,p),hash(fs.readFileSync(p))]));
const comparisons = graph.catalogs.map(c=>({path:c.source_relative_path,pinnedHash:c.source_sha256,localHash:protectedHashes[c.source_relative_path]??null,matches:protectedHashes[c.source_relative_path]===c.source_sha256}));
const version = hash(read('build.mjs')+read('site-config.mjs')+read('runtime.mjs')+read('content.mjs')+read('audience.mjs')+read('assets/audience.js')+read('assets/lesson-loader.js')+read('assets/shell.css')+read('assets/shell.js')+read('assets/lesson-flow.js')+publicationShellSource+encode(config)+encode(contract));
const packages=loadPackages(root,ids,process.env.LESSON_FIXTURES==='1');
fs.rmSync(path.join(root,'site/content'),{recursive:true,force:true});
const subject = {mathematics:'Matematiikka',science:'Ympäristöoppi',physics:'Fysiikka',chemistry:'Kemia'};
const rel = {prerequisite:'Esitieto',representation_support:'Esitystavan tuki',process_support:'Työskentelyn tuki',safety_gate:'Turvallisuusehto (toiminnallinen)'};
const strength = {required:'Vaadittu',strong:'Vahva tuki',helpful:'Hyödyllinen tuki'};
const link = id => `<a href="${esc(id)}.html">${esc(byId.get(id).title)} <small>${esc(id)}</small></a>`;
function nav(id,edges,up) { return `<nav id="${up?'upstream':'downstream'}" aria-label="${up?'Tukiaiheet':'Jatkoaiheet'}"><h2>${up?'Tätä aihetta tukevat aiheet':'Aiheet, joita tämä tukee'}</h2>${edges.length?'<ul>'+edges.map(e=>{const target=up?e.sourceKCId:e.targetKCId; return `<li><a data-edge="${e.targetKCId}:${e.sourceRelationIndex}" href="${target}.html">${esc(byId.get(target).title)} <small>${target}</small></a><span>${esc(rel[e.relationType]??e.relationType)} · ${esc((byId.get(e.targetKCId).prerequisite_groups??[]).some(g=>g.any_of?.includes(e.sourceKCId))?'Vaihtoehtoinen esitieto — yksi TAI-ryhmästä riittää':(strength[e.strength]??e.strength))}</span><details><summary>Suhteen perustelu</summary><p>Kanoninen vahvuus: ${esc(strength[e.strength]??e.strength)}</p><p>${esc(e.rationale)}</p></details></li>`;}).join('')+'</ul>':`<p>${up?'Ei kirjattuja suoria tukiyhteyksiä':'Ei kirjattuja suoria jatkoaiheita'}</p>`}</nav>`; }
function html(title,body,prefix='',description='Tutki aiheita Aavan kanssa. Oppituntien luonnokset, tukiaiheet ja samaan aiheeseen vievä Lite-harjoittelu.') {
 const siteHeader = sitePackage ? renderSiteHeader('lessons') : '';
 return `<!doctype html>\n<html lang="fi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${esc(description)}"><title>${esc(title)} — Sammakko</title>${sitePackage?'<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/brand.css"><script defer src="/assets/site.js"></script>':''}<link rel="stylesheet" href="${prefix}assets/shell.css"><script defer src="${prefix}assets/lesson-flow.js"></script><script defer src="${prefix}assets/shell.js"></script></head><body${sitePackage?' class="lesson-network"':''}><a class="skip" href="#main">Siirry sisältöön</a>${sitePackage?siteHeader:`<header><a href="${prefix}index.html">Sammakko / Oppituntiverkko</a><span>Oppitunnit · 690 aiheen verkko</span></header>`}${body}<footer class="lesson-footer">${sitePackage?'<a href="/">Sammakko · Aavan mukana oivaltamaan</a><p>':''}181 oppituntiluonnosta ja 509 aihepohjaa. Tekninen tarkistus ei tarkoita oppilailla todennettua vaikuttavuutta.${sitePackage?'</p><span class="lesson-footer-links"><a href="/oppimisverkko/">Tutki koko 690 KC:n oppimisverkkoa</a> · <a href="/whitepaper/">Tutustu pedagogiseen suunnitelmaan</a></span>':''}</footer></body></html>\n`;
}
const runtimeLabels = {
 same_origin_package: 'Harjoittele samaa aihetta Sammakko Litessä. Peli avautuu uuteen välilehteen.',
 ready: 'Peli on käytettävissä tässä osoitteessa.',
 outside_current_lite_scope: 'Tämä aihe ei kuulu vielä Sammakko Liteen.',
 route_unsupported: 'Peliyhteyttä ei ole käytössä tässä versiossa.',
 base_url_missing: 'Tämän pelin osoitetta ei ole vielä määritetty.',
 invalid_base_url: 'Pelin osoite ei ole kelvollinen.',
 runtime_index_missing: 'Pelin aihevalikoimaa ei ole voitu varmistaa.',
 kc_not_implemented: 'Tätä aihetta ei ole mukana pelin tässä versiossa.',
 local_preview_only: 'Pelilinkki on käytettävissä vain paikallisessa esikatselussa.',
 endpoint_unverified: 'Pelin verkko-osoitetta ei ole vielä varmennettu.',
 student_reachability_unverified: 'Pelin saatavuutta oppilaille ei ole vielä varmennettu.',
 unknown_kc: 'Aihetunnusta ei tunnistettu.',
};

let written=0, resumed=0; const manifest=[], checkpoints=[];
const limit = Number(process.env.LESSON_BATCH_LIMIT || Infinity);
for (const [index,n] of nodes.entries()) {
  if(index>=limit) break;
  const existingPath = path.join(root,'records',n.id+'.json');
  const task=(statuses.tasks??[]).find(t=>t.kc_id===n.id)??null;
  const references=sourceFiles.filter(p=>path.basename(p).startsWith(n.id+'.')).map(p=>({path:path.relative(repo,p),sha256:protectedHashes[path.relative(repo,p)],status:'original_source_referenced_not_reapproved',originalHeader:fs.readFileSync(p,'utf8').split('\n').slice(0,8).join('\n')}));
  const sourceReferenceHash=hash(encode({references,task}));
  const rec={kcId:n.id,pagePath:`lessons/${n.id}.html`,canonicalSourceHash:sourceHash,canonicalNodeId:n.id,canonicalNode:n,
    schemaVersion:1,templateVersion:version,generationState:'generated',validationState:'pending_validation',
    top:top[n.id],bottom:bottom[n.id],prerequisiteGroups:n.prerequisite_groups??[],
    dynamicPrerequisite:{rule:n.dynamic_prerequisite_rule??null,binding:'unresolved'},
    newInstructionalContent:{state:'awaiting_reviewed_handover',body:null,slots:Object.fromEntries(contract.future_content_slots.map(s=>[s,null]))},
    newPedagogicalResearch:{state:'not_started_this_phase',records:[],recordSchema:Object.fromEntries(contract.future_research_fields.map(s=>[s,null]))},
    activityFamily:{state:'unresolved',fields:Object.fromEntries(contract.future_family_fields.map(s=>[s,null]))},
    renderer:contract.future_renderer_interfaces,existingDrafts:{inventoryState:'inventoried',references,preserveOriginalStatuses:true,originalTaskStatus:task},
    contentReview:{state:'not_performed_for_new_lesson'},humanReview:{state:'not_performed_for_new_lesson'},
    liteAlignment:{subsetMembership:lite.includes(n.id),referenceBuild:config.adapters.lite.referenceBuild,reviewReference:'reference/inputs/lite181-review-findings.json',alignmentState:lite.includes(n.id)?'awaiting_corrected_reviewed_baseline':'outside_current_lite_scope'},
    runtimeAvailability:Object.fromEntries(['lite','sammakko'].map(k=>[k,resolveGame(n.id,k,config,ids,lite)]))};
  const pkg=packages.get(n.id);
  if(pkg){
   rec.authoredPackage=pkg.metadata;
   rec.newInstructionalContent={...rec.newInstructionalContent,state:pkg.metadata.state,body:{source:'packages/'+n.id+'/'+pkg.metadata.body},revision:pkg.metadata.contentRevision};
   rec.newPedagogicalResearch={...rec.newPedagogicalResearch,state:pkg.metadata.research.length?'source_records_present':'not_started_this_phase',records:pkg.metadata.research};
   rec.contentReview=pkg.metadata.contentReview;rec.humanReview=pkg.metadata.humanReview;
   for(const asset of pkg.assets){const dest=path.join(root,'site',...(asset.path.startsWith('shared/')?[asset.path]:['content',n.id,asset.path]));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,asset.bytes);}
   if(pkg.module)save('site/content/'+n.id+'/'+pkg.metadata.module,pkg.module);
  }
  const groups=(n.prerequisite_groups??[]).map(g=>`<li>${g.any_of?'Vähintään yksi (TAI)':'Kaikki (JA)'}: ${(g.any_of??g.all_of).map(link).join(g.any_of?' TAI ':' JA ')}<p>${esc(g.rationale)}</p></li>`).join('');
  const gameActions=Object.fromEntries(['lite','sammakko'].map(k=>{const r=rec.runtimeAvailability[k], name=k==='lite'?'Sammakko Lite':'Laaja Sammakko-peli'; return [k, `<section class="game-connection" data-game-kind="${k}"><h3>${name}</h3><p data-runtime-status="${esc(r.status)}">${esc(runtimeLabels[r.status]??r.status)}</p>${r.classroomReady||r.packageReady?`<a class="lesson-play" data-game-action="open" target="_blank" rel="noopener" href="${esc(r.url)}">${k==='lite'?esc(navigation?.topicPracticeLabel??'Harjoittele tätä aihetta Litessä'):'Avaa Sammakko-peli'} <span aria-hidden="true">↗</span></a> <button type="button" data-game-action="copy" data-copy-url="${esc(r.url)}">Kopioi pelilinkki</button>`:`<button data-game-action="open" disabled>Avaa ${name}</button> <button data-game-action="copy" disabled>Kopioi pelilinkki</button>${r.url?`<a data-game-action="developer" target="_blank" rel="noopener" href="${esc(r.url)}">Kehittäjän testi · ei varmennettu oppilaslinkki</a>`:''}`}</section>`];}));
  const teacherFlow=pkg?`<nav class="teacher-flow" data-teacher-flow data-lesson-sticky aria-label="Oppitunnin vaiheet" hidden><div class="teacher-flow-position"><label>Vaihe<select data-teacher-step aria-label="Valitse oppitunnin vaihe"></select></label><output data-teacher-count aria-live="polite"></output></div><div class="teacher-flow-actions"><button type="button" data-teacher-prev>← Edellinen</button><button type="button" data-teacher-next>Seuraava →</button><a class="audience-launch" data-teacher-presentation target="_blank" rel="noopener" href="../presentations/${n.id}.html">Avaa esitys tästä vaiheesta <span class="new-tab-note">(uusi välilehti)</span></a></div></nav>`:'';
  const page=html(n.title,`<main id="main" data-kc="${n.id}">${sitePackage?`<a class="back-to-catalogue" href="../index.html">← Kaikki oppitunnit</a>`:''}<p class="eyebrow">${esc(subject[n.subject])} · vuosiluokat ${esc(n.grade_band)} · ${n.id}</p><h1>${esc(n.title)}</h1>${teacherFlow}<div class="toolbar">${pkg?`<a id="mode" class="audience-launch" target="_blank" rel="noopener" href="../presentations/${n.id}.html">Avaa esitys ↗</a><button data-copy-presentation="../presentations/${n.id}.html">Kopioi esityslinkki</button><p class="audience-sharing">Jaa vain esitysvälilehti tai sen ikkuna. Valmistelu ja muistiinpanot jäävät tähän välilehteen. Palaa valmisteluun vaihtamalla takaisin tähän välilehteen.</p>`:''}<button data-copy-id="${n.id}">Kopioi KC-tunnus</button><button id="copy-lesson">Kopioi oppituntilinkki</button><p id="sharing">${sitePackage?'Oppituntiluonnos · tutustu sisältöön ennen käyttöä ryhmän kanssa.':'Paikallinen tai varmentamaton esikatselu · oppilasjakelu odottaa varmennusta.'}</p><output id="copy-status" aria-live="polite"></output></div>${gameActions.lite}<details class="support-details"><summary>Tukiaiheet ja esitietoryhmät</summary>${nav(n.id,top[n.id],true)}${groups?`<section id="prerequisites"><h2>Kirjatut esitietoryhmät</h2><p>Ryhmien välillä JA. Tämä sivu ei lukitse etenemistä.</p><ul>${groups}</ul></section>`:''}</details><section class="lesson" id="lesson-body">${composePackage(pkg,n.id)??`<p class="eyebrow">Opetussisältö odottaa</p><h2>Oppituntisisältö valmistellaan seuraavassa vaiheessa</h2><p>Sivupohja on valmis. Opetussisältöä ei ole vielä hyväksytty tälle sivulle.</p>`}</section>${nav(n.id,bottom[n.id],false)}<details class="teacher" data-shell-teacher><summary>Opettajan suunnittelutiedot ja peliyhteydet</summary><h2>Muut peliyhteydet</h2>${gameActions.sammakko}<h2>Kanoniset tiedot</h2><p>Rooli: ${esc(n.mastery_role)} · Noodityyppi: ${esc(n.node_kind)}</p><p>Lite181: ${lite.includes(n.id)?'Kuuluu Liten 181 aiheen valikoimaan; oppitunnin ja pelitehtävien pedagoginen yhteensovitus arvioidaan erikseen':'Ei kuulu rajaukseen'}</p><p>Dynaaminen sääntö: ${esc(n.dynamic_prerequisite_rule??'Ei kirjattua sääntöä')} · Tehtäväkohtainen sidonta ratkaisematta.</p><h3>Taksonomia ja integraatiorakenne (ei navigaatio)</h3><pre>${esc(encode({concept_path:n.concept_path,parent_concept:n.parent_concept,integration_of:n.integration_of,split_children:n.split_children}))}</pre><h3>Aiemmat aineistot</h3><pre>${esc(encode(rec.existingDrafts))}</pre><h3>Lähde ja tilat</h3><p>Kanoninen SHA-256: ${sourceHash}</p><p>Tutkimus: ${esc(rec.newPedagogicalResearch.state)} · Sisältökatselmus: ${esc(rec.contentReview.state)} · Ihmiskatselmus: ${esc(rec.humanReview.state)}.</p>${pkg?`<h3>Lähdepaketin versio ja katselmushistoria</h3><pre>${esc(encode(pkg.metadata))}</pre>`:''}<pre>${esc(encode({source:graph.node_sources[n.id],curriculum_refs:n.curriculum_refs,source_basis:n.source_basis,evidence_notes:n.evidence_notes}))}</pre></details>${pkg?.module?'<script type="module" src="../assets/lesson-loader.js"></script>':''}</main>`,'../',pkg?`${n.title}. ${subject[n.subject]}, vuosiluokat ${n.grade_band}. Havainnollinen oppituntiluonnos ja opettajan esimerkit.`:`${n.title}. Aihepohja: opetussisältö odottaa valmistelua.`);
  if(pkg){
   const audience=composePackage(pkg,n.id,{audience:true});
   const controls=`<nav class="audience-toolbar" aria-label="Esityksen ohjaus"><div class="audience-primary"><button type="button" data-audience-prev>← Edellinen</button><output data-step-count aria-live="polite" aria-label="Nykyinen vaihe"></output><button type="button" data-audience-next>Seuraava →</button><button type="button" data-audience-pause aria-pressed="false">Tauko</button></div><details class="audience-tools" data-audience-tools><summary>Lisätoiminnot</summary><div class="audience-tools-panel"><button type="button" data-audience-fullscreen aria-pressed="false">Koko näyttö</button><button type="button" data-audience-copy>Kopioi esityslinkki</button><button type="button" data-audience-reset>Alusta</button><button type="button" data-audience-close>Sulje esitys</button><a data-audience-catalogue href="../index.html">Oppitunnit</a>${sitePackage?'<a data-audience-home href="/">Etusivu</a>':''}</div></details><output data-audience-status aria-live="polite"></output></nav>`;
   save('site/presentations/'+n.id+'.html',`<!doctype html>\n<html lang="fi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, follow"><title>${esc(n.title)} — esitys</title><link rel="stylesheet" href="../assets/shell.css"><script defer src="../assets/lesson-flow.js"></script><script defer src="../assets/audience.js"></script></head><body class="audience"><main><h1>${esc(n.title)}</h1>${controls}<section class="lesson" id="lesson-body">${audience}</section><noscript>Vaihenavigointi tarvitsee JavaScriptin. Ensimmäinen opetusvaihe on luettavissa.</noscript>${pkg.module?'<script type="module" src="../assets/lesson-loader.js"></script>':''}</main></body></html>\n`);
  }
  assert(page.includes(`data-kc="${n.id}"`) && (pkg||page.includes('Oppituntisisältö valmistellaan seuraavassa vaiheessa')));
  rec.outputHash=hash(page); rec.checkpoint={canonicalInputHash:sourceHash,sourceReferenceHash,schemaVersion:1,templateVersion:version,outputHash:rec.outputHash,validationResult:'pending_validation',blockers:[]};
  if(fs.existsSync(existingPath)) { const old=JSON.parse(fs.readFileSync(existingPath)); if(old.templateVersion===version && old.checkpoint.sourceReferenceHash===sourceReferenceHash && old.outputHash===rec.outputHash && old.validationState==='verified') {rec.validationState='verified';rec.checkpoint.validationResult='verified';} }
  if(save('site/'+rec.pagePath,page)) written++; else resumed++;
  save('records/'+n.id+'.json',encode(rec)); save('checkpoints/'+n.id+'.json',encode(rec.checkpoint));
  checkpoints.push({kcId:n.id,...rec.checkpoint});
  manifest.push({kcId:n.id,title:n.title,subject:n.subject,gradeBand:n.grade_band,role:n.mastery_role,pagePath:rec.pagePath,scaffold:rec.validationState,content:rec.newInstructionalContent.state,contentRevision:pkg?.metadata.contentRevision??null,liteAlignment:rec.liteAlignment,gameLinks:rec.runtimeAvailability});
}
if(manifest.length!==690) {console.log(encode({partial:true,processed:manifest.length,written,resumed}));process.exit(0);}
save('site/assets/lesson-loader.js',read('assets/lesson-loader.js'));
save('site/assets/audience.js',read('assets/audience.js'));
save('site/assets/lesson-flow.js',read('assets/lesson-flow.js'));
save('site/assets/shell.css',read('assets/shell.css')); save('site/assets/shell.js',read('assets/shell.js'));
const options=(name,label,values)=>`<label>${label}<select name="${name}"><option value="">Kaikki</option>${values.map(v=>`<option value="${esc(v)}">${esc(subject[v]??v)}</option>`).join('')}</select></label>`;
save('site/index.html',html('Oppitunnit',`<main id="main"><section class="catalogue-intro"><div><p class="eyebrow">Aavan oppituntisaaret</p><h1>Yksi aihe.<br>Uusi oivallus.</h1><p class="catalogue-lead">Tutki lukumääriä, mittaamista ja luonnon ilmiöitä. Valitse aihe, kokeile yhdessä ja jatka saman aiheen harjoitteluun Litessä.</p><p class="catalogue-note">${process.env.LESSON_FIXTURES==='1'?'Tekninen esikatselu · testipaketit eivät ole oppitunteja.':`${packages.size} oppituntiluonnosta · ${690-packages.size} aihepohjaa. Luonnokset on tarkistettu teknisesti; sisältöjen toimivuus oppilasryhmissä arvioidaan erikseen.`}</p></div>${sitePackage?'<img class="catalogue-aava" src="/lite/characters/aava/map.png" width="224" height="224" alt="Aava-ankanpoikanen tutkimassa karttaa">':''}</section><form id="filters"><label class="search-label">Mitä haluaisit tutkia?<input name="q" type="search" placeholder="Hae aihetta tai tunnusta…"></label><label>Näytä<select name="content"><option value="">Kaikki aiheet ja pohjat</option><option value="draft"${sitePackage?' selected':''}>Oppituntiluonnokset</option><option value="awaiting_reviewed_handover">Aihepohjat</option></select></label>${options('subject','Oppiaine',[...new Set(nodes.map(n=>n.subject))])}${options('grade','Vuosiluokat',[...new Set(nodes.map(n=>n.grade_band))])}${options('role','Rooli',[...new Set(nodes.map(n=>n.mastery_role))])}${options('lite','Lite-harjoittelu',['kyllä','ei'])}<button type="reset">Palauta rajaukset</button></form><p id="count" aria-live="polite">690 aihetta</p><noscript><p>Haku ja suodatus toimivat JavaScriptillä. Alla on koko 690 aiheen luettelo; oppitunnit ja linkit ovat luettavissa ilman JavaScriptiä.</p></noscript><ul id="catalogue">${manifest.map(m=>`<li data-search="${esc((m.kcId+' '+m.title).toLocaleLowerCase('fi'))}" data-subject="${m.subject}" data-grade="${m.gradeBand}" data-role="${m.role}" data-content="${m.content}" data-lite="${m.liteAlignment.subsetMembership?'kyllä':'ei'}"><span class="catalogue-state ${m.content==='draft'?'has-lesson':'is-scaffold'}">${m.content==='draft'?'Oppituntiluonnos':m.content==='technical_fixture'?'Tekninen testipaketti':'Aihepohja · sisältö tulossa'}</span><a href="${m.pagePath}">${esc(m.title)}</a><small>${esc(subject[m.subject])} · vuosiluokat ${m.gradeBand}${m.liteAlignment.subsetMembership?' · harjoittelu Litessä':''}</small><small class="kc-id">${m.kcId}</small></li>`).join('')}</ul></main>`));
save('site/data/lesson-manifest.json',encode(manifest)); save('site/data/navigation.json',encode({top,bottom})); save('site/data/runtime-links.json',encode(config));
save('site/data/teacher-integration.json',encode({schemaVersion:1,lessonRevision:version,entries:manifest}));
save('inventory.json',encode({protectedHashes,catalogueComparison:comparisons,originalEngineeringCount:state.unique_complete_ids.length,canonicalHash:sourceHash}));
save('coverage.json',encode({phase:'phase2_selected181',pages:manifest.length,lite:lite.length,outsideLite:690-lite.length,checkpoints,contentApproved:0,phase2Authorized:true}));
// Independent exhaustive validation precedes the verified transition.
try { execFileSync(process.execPath,[path.join(root,'verify.mjs'),'--allow-pending'],{stdio:'pipe'}); }
catch(error) { console.error(String(error.stdout)); throw new Error('Independent structural validation failed; checkpoints remain unpromoted.',{cause:error}); }
for(const m of manifest){const r=json('records/'+m.kcId+'.json');r.validationState='verified';r.checkpoint.validationResult='verified';m.scaffold='verified';save('records/'+m.kcId+'.json',encode(r));save('checkpoints/'+m.kcId+'.json',encode(r.checkpoint));}
for(const c of checkpoints)c.validationResult='verified';
save('site/data/lesson-manifest.json',encode(manifest));save('site/data/teacher-integration.json',encode({schemaVersion:1,lessonRevision:version,entries:manifest}));
save('coverage.json',encode({phase:'phase2_selected181',pages:690,lite:181,outsideLite:509,checkpoints,contentApproved:0,phase2Authorized:true}));
console.log(encode({pages:690,written,resumed,lite:181,contentApproved:0,catalogueComparison:comparisons}));

