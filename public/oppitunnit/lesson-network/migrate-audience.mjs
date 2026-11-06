// Bounded authoring helper. Role/step annotation is not content or human review.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath}from 'node:url';
import {parseFragment,nodeText,teacherNode,validateAudienceSource}from './audience.mjs';import{loadPackages,digest}from './content.mjs';
const root=path.dirname(fileURLToPath(import.meta.url)),scope=JSON.parse(fs.readFileSync(root+'/reference/inputs/mvp-scope-181.json')).selected_ids;
const [batch,...args]=process.argv.slice(2),write=args.includes('--write'),ids=args.filter(x=>x!=='--write');
if(!/^LR04-B\d{2}$/.test(batch??'')||ids.length<12||ids.length>18||new Set(ids).size!==ids.length||ids.some(id=>!scope.includes(id)))throw Error('Supply LR04-Bnn and 12–18 unique selected181 IDs, optionally --write');
const result=[];
for(const id of ids){const dir=root+'/packages/'+id,metaFile=dir+'/lesson.json',p=JSON.parse(fs.readFileSync(metaFile));if(p.extensions.audienceContract===1)throw Error('Already migrated: '+id);
 let source=fs.readFileSync(dir+'/'+p.body,'utf8'),before=digest(source),questionSplits=[],warnings=[];
 // Preserve the first question block and place any following solution blocks behind
 // a separate disclosure. Every such inferred split remains listed for author review.
 let parsed=parseFragment(source),edits=[];
 for(const n of parsed.nodes.filter(n=>n.tag==='details'&&!teacherNode(source,n))){const summary=n.children.find(c=>c.tag==='summary');if(!summary)continue;const title=nodeText(source,summary),content=n.children.filter(c=>c!==summary);
  if(/^(?:Lähtökysymys|Loppukysymys|Lopuksi|Pysähdy miettimään|Mieti hetki|Exit)/i.test(title)&&content.length>1){const first=content[0],rest=source.slice(first.end,n.close);edits.push({start:n.start,end:n.end,text:`<section data-lesson-role="question"><h2>${source.slice(summary.open,summary.close)}</h2>${source.slice(first.start,first.end)}<details data-lesson-role="answer"><summary>Paljasta ratkaisu</summary>${rest}</details></section>`});questionSplits.push(title);}
 }
 for(const e of edits.filter(e=>!edits.some(p=>p!==e&&p.start<e.start&&p.end>=e.end)).sort((a,b)=>b.start-a.start))source=source.slice(0,e.start)+e.text+source.slice(e.end);
 parsed=parseFragment(source);edits=[];
 for(const n of parsed.nodes){if(n.attrs['data-lesson-role'])continue;let role;
  if(teacherNode(source,n))role='teacher-note';else if(n.tag==='noscript'||n.tag==='nav')role='metadata';
  else if(n.tag==='details'){const summary=n.children.find(c=>c.tag==='summary'),title=summary?nodeText(source,summary):'';
   role=/apu|tuki|tueksi|vihje/i.test(title)?'hint':/esimerk|näin ajattelet|ratkaistu malli/i.test(title)?'worked-example':/vastaus|ratkaisu|ajatus|miksi|perustelu/i.test(title)?'answer':'teaching-step';
   if(/vaihda mallia|katso arvot|tutki aikaa|tiedot taulukkona|sallittua muutosta/i.test(title))role='teaching-step';
  }else if(n.tag==='figure')role='worked-example';
  else if(n.tag==='p'&&/^(?:Pohdi(?: ensin)?|Ennusta|Mieti(?: hetki)?|Lähtökysymys|Loppukysymys|Lopuksi|Kysymys):/i.test(nodeText(source,n))){role='question';if(/\?\s*\S/.test(nodeText(source,n)))warnings.push('Question paragraph has text after ?: '+nodeText(source,n).slice(0,130));}
  if(role){let opening=source.slice(n.start,n.open);if(['hint','answer'].includes(role))opening=opening.replace(/\sopen(?:="[^"]*")?/g,'');opening=opening.replace(/(\/?>)$/,` data-lesson-role="${role}"$1`);edits.push({start:n.start,end:n.open,text:opening});}
 }
 for(const e of edits.sort((a,b)=>b.start-a.start))source=source.slice(0,e.start)+e.text+source.slice(e.end);
 parsed=parseFragment(source);let container=parsed.root;const largest=container.children.filter(n=>['section','div'].includes(n.tag)).sort((a,b)=>(b.end-b.start)-(a.end-a.start))[0];if(largest&&(largest.end-largest.start)>source.length*.8)container=largest;
 const groups=[];let group=[];const flush=()=>{if(group.length)groups.push(group);group=[];};
 for(const n of container.children){const role=n.attrs['data-lesson-role'];if(n.tag==='link'||['teacher-note','metadata'].includes(role)){flush();continue;}
  const heading=/^h[23]$/.test(n.tag),question=role==='question',interactive=n.tag==='div'&&n.children.some(c=>/^h[23]$/.test(c.tag)),block=['section','fieldset'].includes(n.tag)||(n.tag==='details'&&!['hint','answer'].includes(role))||interactive;
  if((heading&&group.some(x=>/^h[23]$/.test(x.tag)||['section','fieldset','figure'].includes(x.tag)||x.attrs['data-lesson-role']==='question'))||question||block||(group.some(x=>x.attrs['data-lesson-role']==='question')&&!['hint','answer'].includes(role)))flush();group.push(n);
 }flush();edits=[];
 for(const[i,g]of groups.entries())edits.push({pos:g[0].start,kind:'open',text:`\n<section data-teaching-step="${i+1}" data-lesson-role="teaching-step">\n`},{pos:g.at(-1).end,kind:'close',text:'\n</section>\n'});
 for(const e of edits.sort((a,b)=>b.pos-a.pos||(a.kind==='open'?-1:1)))source=source.slice(0,e.pos)+e.text+source.slice(e.pos);
 validateAudienceSource(source,true);
 p.revision=Number(p.revision)+1;p.extensions.audienceContract=1;p.extensions.audienceMigration={stage:'LR04',batch,method:'bounded source-role/step annotation with separately recorded author corrections',contentReview:'pending',alignmentReview:'pending',humanReview:'pending'};
 result.push({kc:id,revision:p.revision,steps:groups.length,beforeBodySha256:before,afterBodySha256:digest(source),inferredQuestionSplits:questionSplits,warnings,reviewDecision:'pending_current_source_delta_review'});
 if(write){fs.writeFileSync(dir+'/'+p.body,source);fs.writeFileSync(metaFile,JSON.stringify(p,null,2)+'\n');}
}
if(write)for(const[id,pkg]of loadPackages(root,ids,false,{onlySelected:true})){const file=root+'/packages/'+id+'/lesson.json',p=JSON.parse(fs.readFileSync(file));for(const kind of ['content','alignment','human'])p.reviews.push({kind,state:'pending',revision:pkg.metadata.contentRevision,note:batch+': source roles/steps changed. Automated migration is not content/alignment approval. Prior evidence retained; current independent and real human review pending.'});fs.writeFileSync(file,JSON.stringify(p,null,2)+'\n');result.find(r=>r.kc===id).contentRevision=pkg.metadata.contentRevision;}
console.log(JSON.stringify({batch,write,scope:'exact selected181 only; no509 changes',rows:result},null,2));
