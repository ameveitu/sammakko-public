import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const ts=createRequire(process.env.LESSON_SOURCE_REPO?path.join(process.env.LESSON_SOURCE_REPO,'package.json'):new URL('../package.json',import.meta.url))('typescript');
import {execFileSync} from 'node:child_process';
import {projectAudience,validateAudienceSource} from './audience.mjs';
export const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
const checkedModules=new Set();
export function validateModule(source){
 if(checkedModules.has(source))return;
 try{execFileSync(process.execPath,['--check','--input-type=module'],{input:source,stdio:['pipe','pipe','pipe']});}catch(error){throw new Error('invalid JavaScript module syntax',{cause:error});}
 const tree=ts.createSourceFile('lesson.mjs',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
 if(tree.parseDiagnostics.length)throw new Error('invalid JavaScript module syntax');
 let dependency=false;
 const visit=node=>{if(ts.isImportDeclaration(node)||(ts.isExportDeclaration(node)&&node.moduleSpecifier)||(ts.isCallExpression(node)&&(node.expression.kind===ts.SyntaxKind.ImportKeyword||(ts.isIdentifier(node.expression)&&node.expression.text==='require'))))dependency=true;ts.forEachChild(node,visit);};visit(tree);
 if(dependency)throw new Error('module dependencies unsupported; bundle module locally');
 checkedModules.add(source);
}
export function validateStylesheet(source){
 const css=source.replace(/\/\*[\s\S]*?\*\//g,'');
 if(/[\\@]|\b(?:url|src|image|image-set|-webkit-image-set)\s*\(/i.test(css))throw new Error('stylesheet URL/import, quoted image sources and CSS escapes unsupported; declare local assets in markup');
}
const keys=['schemaVersion','kcId','revision','state','body','module','assets','research','reviews','alignment','planning','extensions'];
export function loadPackages(root, ids, fixture=false, {onlySelected=false}={}){
 const result=new Map();
 for(const directory of ['packages',...(fixture?['fixtures']:[])]){
  const base=path.join(root,directory);if(!fs.existsSync(base))continue;
  for(const name of fs.readdirSync(base).sort()){
   if(onlySelected&&!ids.includes(name))continue;
   const dir=path.join(base,name);if(!fs.statSync(dir).isDirectory())continue;
   const fail=m=>{throw new Error(`${name}: lesson package ${m}`);};
   const local=p=>{if(typeof p!=='string'||!p||p.includes('\\')||p.split('/').some(x=>x==='..'||x==='')||path.isAbsolute(p))fail('unsafe local path '+p);const assetRoot=p.startsWith('shared/')?root:dir;const f=path.join(assetRoot,p);if(!fs.existsSync(f)||!fs.statSync(f).isFile()||!fs.realpathSync(f).startsWith(fs.realpathSync(assetRoot)+path.sep))fail('missing/unsafe file '+p);return fs.readFileSync(f);};
   let p;try{p=JSON.parse(local('lesson.json'));}catch(e){fail(e.message);}
   if(Object.keys(p).some(k=>!keys.includes(k))||keys.some(k=>!Object.hasOwn(p,k)))fail('unknown/missing fields; put custom fields in extensions');
   if(p.schemaVersion!==1||p.kcId!==name||!ids.includes(p.kcId)||(result.has(name)&&directory!=='fixtures'))fail('invalid/duplicate canonical identity');
   if(!['draft','technical_fixture'].includes(p.state)||!/^[1-9]\d*$/.test(String(p.revision)))fail('unsupported state/revision');
   if(directory==='packages'&&!JSON.parse(fs.readFileSync(path.join(root,'reference/inputs/mvp-scope-181.json'))).selected_ids.includes(name))fail('outside authorized181 production scope');
   if((p.state==='technical_fixture')!==(directory==='fixtures'))fail('technical fixtures require explicit fixture mode/directory');
   if([p.alignment,p.planning,p.extensions].some(x=>!x||typeof x!=='object'||Array.isArray(x)))fail('alignment/planning/extensions must be records');
   if(!Array.isArray(p.assets)||!Array.isArray(p.research)||!Array.isArray(p.reviews)||!p.alignment||!p.planning||!p.extensions)fail('invalid metadata containers');
   const assets=p.assets.map(a=>{if(Object.keys(a).sort().join(',')!=='path,sha256')fail('asset requires path,sha256');const bytes=local(a.path);if(a.path.toLowerCase().endsWith('.css'))try{validateStylesheet(bytes.toString());}catch(error){fail(error.message);}if(digest(bytes)!==a.sha256)fail('asset hash mismatch '+a.path);return {...a,bytes};});
   const body=local(p.body).toString();
   try{validateAudienceSource(body,p.extensions.audienceContract===1);}catch(error){fail(error.message);}
   if(/<\/?(?:script|style|html|body|head|iframe|object|embed|base|form|h1|foreignObject)\b|\b(?:on\w+|style|srcset)\s*=|(?:javascript|data|vbscript):|\bdata-shell-[\w-]+|\bid\s*=\s*["'](?:main|lesson-body|upstream|downstream|mode|prerequisites|sharing)["']/i.test(body))fail('unsafe/reserved body markup');
   if(/(?:src|href)\s*=\s*[^\s"']/i.test(body))fail('URL attributes must be quoted');
   for(const asset of assets)if(asset.path.endsWith('.svg')&&/<script|on\w+\s*=|<foreignObject|(?:href|src)\s*=\s*["'](?!#)/i.test(asset.bytes.toString()))fail('external/active SVG unsupported');
   for(const m of body.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g))if(!m[1].startsWith('#')&&!assets.some(a=>a.path===m[1]))fail('body reference must name declared local asset '+m[1]);
   const module=p.module===null?null:local(p.module).toString();
   // Local modules are trusted project source, never fetched remotely. Keep imports self-contained for this first contract.
   if(module)try{validateModule(module);}catch(error){fail(error.message);}
   const hash=digest(JSON.stringify({...p,reviews:undefined})+body+(module??'')+assets.map(a=>a.sha256).join(''));
   const revision=String(p.revision)+'@'+hash;
   for(const r of p.reviews)if(Object.keys(r).sort().join(',')!=='kind,note,revision,state'||!['content','human','alignment'].includes(r.kind)||!['pending','reviewed','not_applicable','unknown'].includes(r.state)||typeof r.note!=='string'||typeof r.revision!=='string')fail('invalid revision-bound review record');
   const review=kind=>{const entries=p.reviews.filter(r=>r.kind===kind);const current=entries.filter(r=>r.revision===revision);return {state:current.at(-1)?.state??(entries.length?'stale':'not_reviewed'),revision,history:entries};};
   const metadata={...p,contentHash:hash,contentRevision:revision,contentReview:review('content'),humanReview:review('human'),alignmentReview:review('alignment')};
   result.set(name,{metadata,body,module,assets,dir});
  }
 }
 return result;
}
export function composePackage(pkg,id,{audience=false}={}){
 if(!pkg)return null;
 const prefix=`../content/${id}/`;
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const sources=pkg.metadata.research.filter(r=>{try{return new URL(r.url).protocol==='https:';}catch{return false;}}).map(r=>`<li><a href="${escape(r.url)}" target="_blank" rel="noopener">${escape(r.title??r.url)}</a></li>`).join('');
 const source=audience?projectAudience(pkg.body,{strict:pkg.metadata.extensions.audienceContract===1}).body:pkg.body;
 const body=source.replace(/((?:src|href)\s*=\s*["'])([^"']+)(["'])/g,(all,start,url,end)=>url.startsWith('#')?all:start+(url.startsWith('shared/')?'../':prefix)+url+end);
 if(audience)return `<article>${body}</article>${pkg.module?`<div data-lesson-module="${prefix}${pkg.metadata.module}"><output class="module-status" data-module-status aria-live="polite">Harjoitus odottaa</output></div>`:''}`;
 return `<p class="content-state">${pkg.metadata.state==='technical_fixture'?'Tekninen testisisältö — ei oppitunti':'Oppituntiluonnos'}</p><article data-content-revision="${pkg.metadata.contentRevision}">${body}${sources?`<details class="research-links"><summary>Lähteet opettajalle</summary><ul>${sources}</ul></details>`:''}</article>${pkg.module?`<div data-lesson-module="${prefix}${pkg.metadata.module}">${pkg.metadata.state==='technical_fixture'?'':'<details class="module-tools"><summary>Harjoituksen ohjaus</summary>'}<button data-module-action="pause">Tauko</button><button data-module-action="resume">Jatka</button><button data-module-action="reset">Alusta</button>${pkg.metadata.state==='technical_fixture'?'':'</details>'}<output class="module-status" data-module-status aria-live="polite">Harjoitus odottaa</output></div>`:''}`;
}
