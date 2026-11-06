// Source-owned audience projection. Teacher material is removed during build,
// rather than hidden with presentation CSS or left in a template in the page.
export const LESSON_ROLES = new Set(['teaching-step','worked-example','question','hint','answer','teacher-note','metadata']);
export function parseFragment(source) {
 const root={tag:'#root',attrs:{},children:[],start:0,end:source.length}, stack=[root], nodes=[],texts=[];
 const tokens=/<!--[\s\S]*?-->|<![^>]*>|<\/?[A-Za-z][^>"']*(?:(?:"[^"]*"|'[^']*')[^>"']*)*>|[^<]+|</g;
 const voids=new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
 for(const m of source.matchAll(tokens)){
  const raw=m[0];if(raw.startsWith('<!'))continue;
  if(raw.startsWith('</')){const tag=raw.match(/^<\/([\w:-]+)/)[1].toLowerCase();const node=stack.pop();if(node.tag!==tag)throw Error('Unbalanced lesson markup: '+tag);node.close=m.index;node.end=m.index+raw.length;}
  else if(/^<[A-Za-z]/.test(raw)){
   const tag=raw.match(/^<([\w:-]+)/)[1].toLowerCase(),attrs={};
   for(const a of raw.slice(tag.length+1).replace(/\/?\s*>$/,'').matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g))attrs[a[1].toLowerCase()]=a[2]??a[3]??a[4]??'';
   const node={tag,attrs,parent:stack.at(-1),children:[],start:m.index,open:m.index+raw.length,close:m.index+raw.length,end:m.index+raw.length};node.parent.children.push(node);nodes.push(node);
   if(!voids.has(tag)&&!raw.endsWith('/>'))stack.push(node);
  }else texts.push({text:raw,start:m.index,end:m.index+raw.length,parent:stack.at(-1)});
 }
 if(stack.length!==1)throw Error('Unclosed lesson markup: '+stack.at(-1).tag);
 return {root,nodes,texts};
}
export const nodeText=(source,node)=>source.slice(node.open,node.close).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
export function teacherNode(source,node){
 const role=node.attrs['data-lesson-role'];
 if(role==='teacher-note'||role==='metadata')return true;
 if((node.attrs.class??'').split(/\s+/).some(x=>['teacher','research-links'].includes(x)))return true;
 const summary=node.children.find(c=>c.tag==='summary');
 return !!summary&&/(?:opettaj|aikuiselle|teacher)/i.test(nodeText(source,summary));
}
export function validateAudienceSource(source,strict=false){
 const parsed=parseFragment(source);
 for(const n of parsed.nodes){
  const role=n.attrs['data-lesson-role'];if(role&&!LESSON_ROLES.has(role))throw Error('Unknown lesson role: '+role);
  if(['hint','answer'].includes(role)&&n.tag!=='details')throw Error(role+' must use a deliberate details disclosure');
  if(['hint','answer'].includes(role)&&Object.hasOwn(n.attrs,'open'))throw Error(role+' cannot start open');
  if(strict&&teacherNode(source,n)&&!['teacher-note','metadata'].includes(role))throw Error('Teacher material requires an explicit semantic role');
 }
 if(strict&&!parsed.nodes.some(n=>Object.hasOwn(n.attrs,'data-teaching-step')))throw Error('Audience contract requires teaching steps');
 const steps=parsed.nodes.filter(n=>Object.hasOwn(n.attrs,'data-teaching-step'));
 if(new Set(steps.map(n=>n.attrs['data-teaching-step'])).size!==steps.length)throw Error('Teaching step identities must be unique');
 const sources=parsed.nodes.filter(n=>Object.hasOwn(n.attrs,'data-lesson-context-source'));
 const contexts=parsed.nodes.filter(n=>Object.hasOwn(n.attrs,'data-lesson-context'));
 const keys=nodes=>nodes.map(n=>n.attrs['data-lesson-context-source']??n.attrs['data-lesson-context']);
 for(const group of [sources,contexts])if(new Set(keys(group)).size!==group.length||keys(group).some(k=>!/^[-a-zA-Z0-9]+$/.test(k)))throw Error('Lesson context identities must be unique safe names');
 for(const sourceNode of sources){
  if(steps.some(n=>n.start>=sourceNode.start&&n.end<=sourceNode.end))throw Error('A context source cannot move teaching steps');
  if(parsed.nodes.some(n=>n.start>=sourceNode.start&&n.end<=sourceNode.end&&teacherNode(source,n)))throw Error('A context source cannot include teacher material');
 }
 for(const context of contexts){
  const source=sources.find(n=>n.attrs['data-lesson-context-source']===context.attrs['data-context-source']);
  if(context.tag!=='details'||Object.hasOwn(context.attrs,'open'))throw Error('A lesson context must be a deliberate closed disclosure');
  if(!source)throw Error('Missing lesson context source: '+context.attrs['data-context-source']);
  if(source.start<=context.start&&source.end>=context.end)throw Error('A lesson context cannot borrow its own ancestor');
  if(context.children.filter(n=>Object.hasOwn(n.attrs,'data-context-slot')).length!==1)throw Error('A lesson context needs one direct content slot');
 }
 for(const n of steps){
  for(let p=n.parent;p;p=p.parent)if(Object.hasOwn(p.attrs,'data-teaching-step'))throw Error('Teaching steps cannot be nested');
  if(!nodeText(source,n)&&!parsed.nodes.some(c=>c.start>n.start&&c.end<=n.end&&['img','svg','input','button'].includes(c.tag)))throw Error('Teaching steps cannot be empty');
 }
 if(strict)for(const t of parsed.texts){if(!t.text.trim())continue;let covered=false;for(let p=t.parent;p;p=p.parent)if(Object.hasOwn(p.attrs,'data-teaching-step')||['teacher-note','metadata'].includes(p.attrs['data-lesson-role']))covered=true;if(!covered)throw Error('Visible lesson text outside teaching steps: '+t.text.trim().slice(0,70));}
 return parsed;
}
export function projectAudience(source,{strict=false}={}){
 const {nodes}=validateAudienceSource(source,strict),removed=nodes.filter(n=>teacherNode(source,n));
 const removedIds=new Set(nodes.filter(n=>removed.some(p=>p.start<=n.start&&p.end>=n.end)).map(n=>n.attrs.id).filter(Boolean));
 // A link to a removed teacher note must not survive as an audience control.
 const cuts=[...removed,...nodes.filter(n=>n.tag==='a'&&removedIds.has((n.attrs.href??'').replace(/^#/,'')))];
 const edits=cuts.filter(n=>!cuts.some(p=>p!==n&&p.start<n.start&&p.end>=n.end)).map(n=>({start:n.start,end:n.end,text:''}));
 let step=0;
 for(const n of nodes){if(cuts.some(p=>p.start<=n.start&&p.end>=n.end))continue;
  let opening=source.slice(n.start,n.open);
  if(Object.hasOwn(n.attrs,'data-teaching-step'))opening=opening.replace(/\s(?:hidden|inert)(?:="[^"]*")?/g,'').replace(/>$/,` data-audience-step="${step}"${step++?' hidden inert':''}>`);
  if(n.tag==='details'&&Object.hasOwn(n.attrs,'open'))opening=opening.replace(/\sopen(?:="[^"]*")?/g,'');
  if(opening!==source.slice(n.start,n.open))edits.push({start:n.start,end:n.open,text:opening});
 }
 let body=source;for(const e of edits.sort((a,b)=>b.start-a.start))body=body.slice(0,e.start)+e.text+body.slice(e.end);
 if(strict)validateAudienceSource(body,true);
 return {body,steps:step,contract:strict?'semantic-v1':'legacy-boundary-only'};
}
