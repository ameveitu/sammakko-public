import {fitView, zoomView} from './view.js';
import {bindNavigation} from './navigation.js';
const NS='http://www.w3.org/2000/svg';
const $=s=>document.querySelector(s);
const app=$('#network-app'),stage=$('#network-stage'),view=$('#viewport'),edgesLayer=$('#edges-layer'),nodesLayer=$('#nodes-layer'),groupLabelLayer=$('#group-labels');
const focusView=$('#focus-viewport'),focusEdges=$('#focus-edges'),focusCards=$('#focus-cards');
const minimap=$('#minimap'),miniSvg=$('#minimap svg'),miniNodes=$('#mini-nodes'),miniWindow=$('#mini-window');
const status=$('#network-status'),search=$('#network-search'),results=$('#network-results'),info=$('#node-info'),scopeToggle=$('#scope-toggle'),layoutSwitch=$('#layout-switch'),summary=$('#focus-summary');
const btnOverview=$('#btn-overview'),btnFocus=$('#btn-focus'),btnRoots=$('#btn-roots'),btnFit=$('#btn-fit'),btnClear=$('#btn-clear');
const modeButtons={overview:btnOverview,focus:btnFocus,roots:btnRoots};
const zoomRange=$('#zoom-range'),zoomLabel=$('#zoom-label'),sidebar=$('#network-sidebar'),sidebarOpen=$('#sidebar-open'),sidebarClose=$('#sidebar-close');
const camera=()=>({scale:1,tx:0,ty:0});
// Three views share one stage. Each keeps its own camera, so returning to the full network never inherits a subgraph zoom.
const state={mode:'overview',cams:{overview:camera(),focus:camera(),roots:camera()},selected:null,scopeAll:false,layout:'subject',highlight:new Set(),positions:new Map(),nodes:[],byId:new Map(),edges:[],up:new Map(),down:new Map(),bounds:null,focusBounds:null,focusCenter:null,rootsBounds:null,liteIds:new Set()};
const mobile=matchMedia('(max-width:720px)');
const backdrop=$('#sidebar-backdrop');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const niceSubject=s=>({mathematics:'Matematiikka',physics:'Fysiikka',chemistry:'Kemia',environmental_studies:'Ympäristöoppi',science:'Ympäristöoppi'}[s]||String(s||'').replaceAll('_',' '));
const relationLabel=t=>({prerequisite:'Esitieto',representation_support:'Esitystavan tuki',process_support:'Ajattelutaidon tuki',safety_gate:'Turvallisuusehto',transfer_bridge:'Soveltamissilta',enrichment:'Syventävä yhteys'}[t]||t);
function nodeClass(n){const s=String(n.subject||'').toLowerCase();if(s.includes('math'))return'math';if(s.includes('phys'))return'physics';if(s.includes('chem'))return'chemistry';return'science'}
function groupKey(n){const s=nodeClass(n);if(s==='math')return String(n.grade_band||'').includes('7')?'2-math79':'0-math16';if(s==='science')return'1-science';if(s==='physics')return'3-physics';return'4-chemistry'}
const GROUPS=['0-math16','1-science','2-math79','3-physics','4-chemistry'];
const groupLabels={'0-math16':'Matematiikka · 1–6','1-science':'Ympäristöopin perusta · 1–6','2-math79':'Matematiikka · 7–9','3-physics':'Fysiikka · 7–9','4-chemistry':'Kemia · 7–9'};
function el(tag,attrs={}){const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);return e}
async function loadJson(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error(url+' '+r.status);return r.json()}
async function loadGraph(){let last;for(const url of ['/oppimisverkko/data/canonical-690-graph.json','../oppitunnit/lesson-network/reference/inputs/canonical-690-graph.json']){try{return await loadJson(url)}catch(e){last=e}}throw last}
function buildEdges(nodes){const ids=new Set(nodes.map(n=>n.id)),out=[];for(const target of nodes)for(const rel of target.relations||[])if(ids.has(rel.id))out.push({source:rel.id,target:target.id,type:rel.relation_type||'prerequisite',strength:rel.strength||'helpful',rationale:rel.rationale||'',alternative:rel.relation_type==='prerequisite'&&(target.prerequisite_groups||[]).some(g=>g.any_of?.includes(rel.id))});return out}
const isRequired=e=>e.type==='prerequisite'&&e.strength==='required';
// Columns follow every relation type, so arrows read left to right. The data has one mutual pair
// (CHEM79-ATOM-01 and CHEM79-ELEMENT); there the required direction wins and the other arrow points back.
let reqPairs=null;
function layered(e){if(isRequired(e))return true;if(!reqPairs)reqPairs=new Set(state.edges.filter(isRequired).map(x=>x.source+'>'+x.target));return !reqPairs.has(e.target+'>'+e.source)}
function hardDepth(nodes,edges){const incoming=new Map(nodes.map(n=>[n.id,0])),out=new Map(nodes.map(n=>[n.id,[]])),depth=new Map(nodes.map(n=>[n.id,0]));
 for(const e of edges)if(layered(e)){incoming.set(e.target,(incoming.get(e.target)||0)+1);out.get(e.source)?.push(e.target)}
 const q=[...incoming].filter(([,v])=>v===0).map(([id])=>id);let i=0;while(i<q.length){const id=q[i++];for(const t of out.get(id)||[]){depth.set(t,Math.max(depth.get(t)||0,(depth.get(id)||0)+1));incoming.set(t,incoming.get(t)-1);if(incoming.get(t)===0)q.push(t)}}
 return depth}

/* ---------- Full network (overview) ---------- */
// Each subject group is a block of prerequisite-depth columns. Blocks are shelf-packed so the whole
// network matches the stage's shape instead of one tall strip.
function layoutSubjects(nodes,edges){const depth=hardDepth(nodes,edges),groups=new Map();for(const n of nodes){const k=groupKey(n);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(n)}
 const blocks=[];for(const key of GROUPS){const list=groups.get(key)||[];if(!list.length)continue;const cols=new Map();for(const n of list){const d=depth.get(n.id)||0;if(!cols.has(d))cols.set(d,[]);cols.get(d).push(n)}
  for(const col of cols.values())col.sort((a,b)=>String(a.topic_area||'').localeCompare(String(b.topic_area||''),'fi')||String(a.title||'').localeCompare(String(b.title||''),'fi'));
  const local=new Map();let w=0,count=1;for(const [d,col] of cols){count=Math.max(count,col.length);col.forEach((n,i)=>{local.set(n.id,{x:d*205,y:46+i*66});w=Math.max(w,d*205+156)})}
  blocks.push({key,local,w,h:46+count*66})}
 const GX=170,GY=210,r=stage.getBoundingClientRect(),aspect=r.width&&r.height?r.width/r.height:1.6;
 const pack=limit=>{let x=0,y=0,row=0,W=0;const at=[];for(const b of blocks){if(x>0&&x+b.w>limit){x=0;y+=row+GY;row=0}at.push({x,y});x+=b.w+GX;row=Math.max(row,b.h);W=Math.max(W,x-GX)}return{at,W,H:y+row}};
 let best=null;for(let limit=Math.max(...blocks.map(b=>b.w));limit<=blocks.reduce((s,b)=>s+b.w+GX,0);limit+=120){const p=pack(limit),score=Math.min(aspect/p.W,1/p.H);if(!best||score>best.score)best={...p,score}}
 const pos=new Map(),labels=[];blocks.forEach((b,i)=>{const o=best.at[i];for(const [id,p] of b.local)pos.set(id,{x:o.x+p.x,y:o.y+p.y});labels.push({text:groupLabels[b.key],x:o.x,y:o.y+46,w:b.w,h:b.h-46})});
 state.positions=pos;state.bounds={x:-40,y:-150,w:best.W+80,h:best.H+190};setGroupLabels(labels)}
// Subject headings float in screen space: the same readable size at every zoom, sitting above
// their block and sliding along its edge while the block is only partly in view.
function setGroupLabels(list){groupLabelLayer.replaceChildren(...list.map(l=>{const e=document.createElement('span');e.className='group-label';e.textContent=l.text;e._box=l;return e}))}
function placeGroupLabels(){if(state.mode!=='overview')return;const o=state.cams.overview,{w:W,h:H}=stageSize();for(const e of groupLabelLayer.children){const b=e._box,x=b.x*o.scale+o.tx,y=b.y*o.scale+o.ty,w=b.w*o.scale,h=b.h*o.scale,lw=e.offsetWidth,lh=e.offsetHeight;
  const off=x+w<0||x>W||y+h<0||y>H;e.hidden=off;if(off)continue;const left=Math.max(x,Math.min(8,x+w-lw)),top=Math.max(y-lh-6,Math.min(8,y+h-lh));e.style.transform=`translate(${Math.round(left)}px,${Math.round(top)}px)`}}
// Grade view: one column band per curriculum grade recommendation. Inside a band, nodes flow left to
// right by prerequisite depth; each layer is ordered by where its prerequisites already sit,
// so neighbours in the network stay close. A shared row count fits the bands to the stage.
const BANDS=[{key:'1-2',label:'Vuosiluokat 1–2',note:'myös koko 1–6 kattavat taidot'},{key:'3-6',label:'Vuosiluokat 3–6'},{key:'7-9',label:'Vuosiluokat 7–9'}];
const bandOf=n=>{const g=String(n.grade_band||'');return g.startsWith('7')?'7-9':g==='3-6'?'3-6':'1-2'};
function layoutGrades(nodes,edges){setGroupLabels([]);const W=156,DX=205,DY=66,TOP=230,GAP=150;
 const bands=BANDS.map(b=>{const list=nodes.filter(n=>bandOf(n)===b.key),ids=new Set(list.map(n=>n.id));const depth=hardDepth(list,edges.filter(e=>ids.has(e.source)&&ids.has(e.target)));const layers=new Map();for(const n of list){const d=depth.get(n.id)||0;if(!layers.has(d))layers.set(d,[]);layers.get(d).push(n)}return{...b,layers:[...layers.keys()].sort((a,c)=>a-c).map(k=>layers.get(k))}});
 const r=stage.getBoundingClientRect(),aspect=r.width&&r.height?r.width/r.height:1.6;let best=null;
 for(let rows=6;rows<=80;rows++){let w=-GAP;for(const b of bands){w+=GAP;for(const l of b.layers)w+=Math.ceil(l.length/rows)*DX}const h=TOP+rows*DY,score=Math.min(aspect/w,1/h);if(!best||score>best.score)best={rows,score}}
 const pos=new Map(),rank=new Map(),R=best.rows;let x=0,maxX=0;
 const key=n=>{const ps=(state.up.get(n.id)||[]).map(e=>rank.get(e.source)).filter(v=>v!==undefined);return ps.length?ps.reduce((a,b)=>a+b,0)/ps.length:Infinity};
 bands.forEach((b,bi)=>{if(bi)x+=GAP;const start=x;
  for(const layer of b.layers){const keyed=layer.map(n=>({n,k:key(n)}));keyed.sort((a,c)=>a.k-c.k||groupKey(a.n).localeCompare(groupKey(c.n))||String(a.n.topic_area||'').localeCompare(String(c.n.topic_area||''),'fi')||String(a.n.title||'').localeCompare(String(c.n.title||''),'fi'));
   keyed.forEach(({n},i)=>{const col=Math.floor(i/R),row=i%R;pos.set(n.id,{x:x+col*DX,y:TOP+row*DY});rank.set(n.id,row)});x+=Math.ceil(layer.length/R)*DX}
  const end=x-DX+W;maxX=end;
  const bg=el('rect',{class:'band-bg',x:start-40,y:0,width:end-start+80,height:TOP+R*DY+20,rx:28});edgesLayer.prepend(bg);
  const t=el('text',{x:start,y:118,class:'band-label'});t.textContent=b.label;nodesLayer.append(t);
  const c=el('text',{x:start,y:186,class:'band-note'});c.textContent=`${b.layers.reduce((s,l)=>s+l.length,0)} aihetta${b.note?' · '+b.note:''}`;nodesLayer.append(c)});
 state.positions=pos;state.bounds={x:-60,y:-20,w:maxX+120,h:TOP+R*DY+60}}
const LAYOUTS={subject:layoutSubjects,grade:layoutGrades};
function updateLayoutSwitch(){for(const b of layoutSwitch.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.layout===state.layout))}
function edgeClass(e){return 'graph-edge '+(e.type==='prerequisite'?(e.alternative?'alternative':e.strength):e.type==='safety_gate'?'safety':'support')}
function render(){edgesLayer.replaceChildren();nodesLayer.replaceChildren();miniNodes.replaceChildren();(LAYOUTS[state.layout]||layoutSubjects)(state.nodes,state.edges);
 for(const e of state.edges){const a=state.positions.get(e.source),b=state.positions.get(e.target);if(!a||!b)continue;const p=el('path',{class:edgeClass(e)});p.dataset.source=e.source;p.dataset.target=e.target;const x1=a.x+156,y1=a.y+19,x2=b.x,y2=b.y+19,m=(x1+x2)/2;p.setAttribute('d',`M${x1} ${y1} C${m} ${y1} ${m} ${y2} ${x2} ${y2}`);p.setAttribute('marker-end',`url(#arrow-${edgeClass(e).slice(11)})`);edgesLayer.append(p)}
 for(const n of state.nodes){const p=state.positions.get(n.id),g=el('g',{class:'graph-node '+nodeClass(n),transform:`translate(${p.x} ${p.y})`,role:'button','aria-label':n.id+' '+n.title});g.dataset.id=n.id;const rect=el('rect',{width:156,height:38});const t=el('text',{x:8,y:15,class:'node-title'});t.textContent=String(n.title||n.id).length>25?String(n.title).slice(0,24)+'…':n.title;const sm=el('text',{x:8,y:29,class:'node-small'});sm.textContent=n.id;g.append(rect,t,sm);g.addEventListener('click',ev=>{ev.stopPropagation();selectNode(n.id)});g.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();selectNode(n.id)}});nodesLayer.append(g);
 const m=el('rect',{class:'mini-node '+nodeClass(n),x:p.x,y:p.y-12,width:156,height:62});m.dataset.id=n.id;miniNodes.append(m)}
 const b=state.bounds;miniSvg.setAttribute('viewBox',`${b.x} ${b.y} ${b.w} ${b.h}`);minimap.style.aspectRatio=`${b.w} / ${b.h}`;applyHighlight();fitOverview();setMode('overview')}

/* ---------- Relations ---------- */
function indexEdges(){state.up=new Map(state.nodes.map(n=>[n.id,[]]));state.down=new Map(state.nodes.map(n=>[n.id,[]]));for(const e of state.edges){state.up.get(e.target)?.push(e);state.down.get(e.source)?.push(e)}}
// Signed shortest distance from the selected node: ancestors negative, descendants positive.
function subgraph(id,limit){const depth=new Map([[id,0]]);for(const [map,sign,next] of [[state.up,-1,e=>e.source],[state.down,1,e=>e.target]]){const seen=new Set([id]),q=[[id,0]];for(let i=0;i<q.length;i++){const [cur,d]=q[i];if(d>=limit)continue;for(const e of map.get(cur)||[]){const n=next(e);if(seen.has(n))continue;seen.add(n);if(!depth.has(n))depth.set(n,sign*(d+1));q.push([n,d+1])}}}return depth}
function currentLimit(){return state.scopeAll?Infinity:1}
function scopeText(){return state.scopeAll?'kaikki esivanhemmat ja jälkeläiset':'suorat vanhemmat ja lapset'}
function updateScopeToggle(){scopeToggle.setAttribute('aria-pressed',String(state.scopeAll));scopeToggle.textContent=state.scopeAll?'Näytä vain suorat vanhemmat ja lapset':'Näytä kaikki esivanhemmat ja jälkeläiset'}
function strengthWord(e){return e.alternative?'TAI-vaihtoehto':({required:'pakollinen',strong:'vahva',helpful:'hyödyllinen'}[e.strength]||e.strength)}
function rootIds(){const requiredTargets=new Set(state.edges.filter(e=>e.type==='prerequisite'&&e.strength==='required').map(e=>e.target));return state.nodes.filter(n=>n.foundation_entry||!requiredTargets.has(n.id))}

/* ---------- Cards for the subgraph and root views ---------- */
const CARD={w:240,h:122,row:18,col:26,layer:120};
function wrapTitle(text,max=27,lines=3){const words=String(text||'').split(/\s+/),out=[];let line='';for(const w of words){if(!line)line=w;else if((line+' '+w).length<=max)line+=' '+w;else{out.push(line);line=w}}if(line)out.push(line);if(out.length>lines){out.length=lines;out[lines-1]=out[lines-1].replace(/\s*\S*$/,'')+'…'}return out.map(l=>l.length>max+3?l.slice(0,max)+'…':l)}
function card(n,x,y,meta,extra=''){const g=el('g',{class:`focus-card ${nodeClass(n)} ${extra}`.trim(),transform:`translate(${x} ${y})`,role:'button',tabindex:'0','aria-label':`${n.title} (${n.id}). ${meta}`});g.dataset.id=n.id;
 g.append(el('rect',{class:'card-bg',width:CARD.w,height:CARD.h,rx:14}),el('rect',{class:'card-stripe',x:0,y:12,width:6,height:CARD.h-24,rx:3}));
 const id=el('text',{x:18,y:24,class:'card-id'});id.textContent=n.id;g.append(id);
 wrapTitle(n.title).forEach((line,i)=>{const t=el('text',{x:18,y:46+i*18,class:'card-title'});t.textContent=line;g.append(t)});
 const m=el('text',{x:18,y:CARD.h-13,class:'card-meta'});m.textContent=meta;g.append(m);
 const activate=()=>{if(n.id===state.selected&&state.mode==='focus'){if(mobile.matches)openSidebar(false);return}selectNode(n.id,{keepFocus:true})};
 g.addEventListener('click',ev=>{ev.stopPropagation();activate()});g.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();activate()}});
 return g}
function depthLabel(d,count){const c=count>1?` · ${count}`:'';if(d===0)return'Valittu aihe';if(!state.scopeAll)return(d<0?'Suorat esitiedot':'Suorat jatkoaiheet')+c;if(d===-1)return'Lähimmät esitiedot'+c;if(d===1)return'Lähimmät jatkoaiheet'+c;return(d<0?`Esitiedot · taso ${-d}`:`Jatkoaiheet · taso ${d}`)+c}
function narrowStage(){return stage.clientWidth<640}
function renderFocus(){focusEdges.replaceChildren();focusCards.replaceChildren();const sel=state.selected;if(!sel)return;
 const depth=subgraph(sel,currentLimit()),layers=new Map();
 // A card sits one column past the longest chain that leads to it, not the shortest, so no arrow points back.
 {const memo=new Map(),len=(id,dir)=>{const k=dir+id;if(memo.has(k))return memo.get(k);memo.set(k,0);let m=0;for(const e of (dir<0?state.down:state.up).get(id)||[]){const o=dir<0?e.target:e.source;if(!depth.has(o)||!layered(e))continue;if(o!==sel&&Math.sign(depth.get(o))!==dir)continue;m=Math.max(m,(o===sel?0:len(o,dir))+1)}memo.set(k,m);return m};
  const longest=new Map([[sel,0]]);for(const [id,d] of depth)if(id!==sel)longest.set(id,Math.sign(d)*Math.max(1,len(id,Math.sign(d))));for(const [id,d] of longest)depth.set(id,d)}
 for(const [id,d] of depth){if(!layers.has(d))layers.set(d,[]);layers.get(d).push(state.byId.get(id))}
 const order=(a,b)=>groupKey(a).localeCompare(groupKey(b))||String(a.topic_area||'').localeCompare(String(b.topic_area||''),'fi')||String(a.title||'').localeCompare(String(b.title||''),'fi');
 const keys=[...layers.keys()].sort((a,b)=>a-b);for(const k of keys)layers.get(k).sort(order);
 const vertical=narrowStage(),pos=new Map(),labels=[];
 if(vertical){
  // Phone: a readable column. Prerequisites above, the selected topic in the middle, follow-ups below.
  const perRow=stage.clientWidth>=560?2:1;let y=0;
  for(const d of keys){const list=layers.get(d);labels.push({d,x:0,y,count:list.length});y+=34;list.forEach((n,i)=>{const r=Math.floor(i/perRow),c=i%perRow,inRow=Math.min(perRow,list.length-r*perRow);pos.set(n.id,{x:(c-(inRow-1)/2)*(CARD.w+CARD.col)-CARD.w/2,y:y+r*(CARD.h+CARD.row)})});y+=Math.ceil(list.length/perRow)*(CARD.h+CARD.row)+CARD.layer/2}
  const xs=[...pos.values()].map(p=>p.x);for(const l of labels)l.x=Math.min(...xs);
  state.focusBounds={x:Math.min(...xs)-24,y:-24,w:Math.max(...xs)-Math.min(...xs)+CARD.w+48,h:y-CARD.layer/2+24};
 }else{
  // Desktop: prerequisites left, follow-ups right. Tall layers wrap into sub-columns; the row count that
  // gives the largest readable fit for this stage wins.
  const r=stage.getBoundingClientRect(),aspect=(r.width||1200)/(r.height||700);let best=null;
  for(let rows=3;rows<=28;rows++){let w=0,h=0;for(const d of keys){const n=layers.get(d).length,sub=Math.ceil(n/rows);w+=sub*(CARD.w+CARD.col)-CARD.col+CARD.layer;h=Math.max(h,Math.ceil(n/sub)*(CARD.h+CARD.row))}w-=CARD.layer;const s=Math.min(aspect/w,1/h);if(!best||s>best.s+1e-9)best={rows,s}}
  let x=0,minY=Infinity;
  for(const d of keys){const list=layers.get(d),sub=Math.ceil(list.length/best.rows),rows=Math.ceil(list.length/sub),start=x;
   for(let s=0;s<sub;s++){const part=list.slice(s*rows,(s+1)*rows);part.forEach((n,i)=>{const y=(i-(part.length-1)/2)*(CARD.h+CARD.row)-CARD.h/2;pos.set(n.id,{x,y});minY=Math.min(minY,y)});x+=CARD.w+CARD.col}
   labels.push({d,x:start,count:list.length});x+=CARD.layer-CARD.col}
  const maxY=Math.max(...[...pos.values()].map(p=>p.y+CARD.h));for(const l of labels)l.y=minY-34;
  state.focusBounds={x:-40,y:minY-70,w:x-CARD.layer+80,h:maxY-minY+100};
 }
 for(const l of labels){const t=el('text',{x:l.x,y:l.y+16,class:'focus-label'+(l.d===0?' is-center':'')});t.textContent=depthLabel(l.d,l.count);focusCards.append(t)}
 const direct=new Map();for(const e of state.up.get(sel)||[])direct.set(e.source,'Esitieto · '+(e.type==='prerequisite'?strengthWord(e):relationLabel(e.type).toLowerCase()));for(const e of state.down.get(sel)||[])direct.set(e.target,'Jatkoaihe · '+(e.type==='prerequisite'?strengthWord(e):relationLabel(e.type).toLowerCase()));
 for(const e of state.edges){const a=pos.get(e.source),b=pos.get(e.target);if(!a||!b)continue;let d;
  if(vertical){const x1=a.x+CARD.w/2,y1=a.y+CARD.h,x2=b.x+CARD.w/2,y2=b.y,m=Math.max(40,(y2-y1)/2);d=`M${x1} ${y1} C${x1} ${y1+m} ${x2} ${y2-m} ${x2} ${y2}`}
  else{const x1=a.x+CARD.w,y1=a.y+CARD.h/2,x2=b.x,y2=b.y+CARD.h/2,m=Math.max(50,(x2-x1)/2);d=`M${x1} ${y1} C${x1+m} ${y1} ${x2-m} ${y2} ${x2} ${y2}`}
  const kind=e.type==='prerequisite'?(e.alternative?'alternative':e.strength):e.type==='safety_gate'?'safety':'support';
  const p=el('path',{class:`focus-edge ${kind}${e.source===sel||e.target===sel?' is-direct':''}`,d,'marker-end':`url(#focus-arrow-${kind==='strong'?'required':kind})`});p.dataset.from=e.source;p.dataset.to=e.target;focusEdges.append(p)}
 for(const [id,p] of pos){const n=state.byId.get(id);focusCards.append(card(n,p.x,p.y,id===sel?`${niceSubject(n.subject)} · ${n.grade_band||''} · valittu`:direct.get(id)||`${niceSubject(n.subject)} · ${n.grade_band||''}`,id===sel?'is-selected':''))}
 const s=pos.get(sel);state.focusCenter={x:s.x+CARD.w/2,y:s.y+CARD.h/2,vertical}}
function renderRoots(){focusEdges.replaceChildren();focusCards.replaceChildren();const list=rootIds(),groups=new Map();for(const n of list){const k=groupKey(n);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(n)}
 const w=stage.clientWidth||1000,cols=Math.max(1,Math.min(5,Math.floor((w-24+CARD.col)/(CARD.w+CARD.col))));let y=0;
 for(const key of GROUPS){const g=groups.get(key);if(!g)continue;g.sort((a,b)=>String(a.topic_area||'').localeCompare(String(b.topic_area||''),'fi')||String(a.title||'').localeCompare(String(b.title||''),'fi'));
  const t=el('text',{x:0,y:y+16,class:'focus-label is-center'});t.textContent=`${groupLabels[key]} · ${g.length}`;focusCards.append(t);y+=34;
  g.forEach((n,i)=>focusCards.append(card(n,(i%cols)*(CARD.w+CARD.col),y+Math.floor(i/cols)*(CARD.h+CARD.row),n.topic_area||niceSubject(n.subject))));y+=Math.ceil(g.length/cols)*(CARD.h+CARD.row)+30}
 state.rootsBounds={x:-24,y:-24,w:cols*(CARD.w+CARD.col)-CARD.col+48,h:y+24};return list.length}

/* ---------- Highlight and side panel ---------- */
function applyHighlight(){const active=state.highlight.size>0,overview=state.mode==='overview',rover=state.selected||state.nodes[0]?.id;
 for(const g of nodesLayer.querySelectorAll('.graph-node')){const id=g.dataset.id;g.classList.toggle('is-muted',active&&!state.highlight.has(id));g.classList.toggle('is-highlight',active&&state.highlight.has(id));g.classList.toggle('is-selected',id===state.selected);g.setAttribute('aria-pressed',String(id===state.selected));g.setAttribute('tabindex',overview&&id===rover?'0':'-1')}
 for(const p of edgesLayer.querySelectorAll('.graph-edge')){const on=state.highlight.has(p.dataset.source)&&state.highlight.has(p.dataset.target);p.classList.toggle('is-muted',active&&!on);p.classList.toggle('is-highlight',active&&on)}
 for(const m of miniNodes.querySelectorAll('.mini-node')){const id=m.dataset.id;m.classList.toggle('is-muted',active&&!state.highlight.has(id));m.classList.toggle('is-highlight',active&&state.highlight.has(id));m.classList.toggle('is-selected',id===state.selected)}}
function updateInfo(){const n=state.byId.get(state.selected);if(!n){info.innerHTML='<p>Valitse aihe kartalta tai haulla.</p>';return}const directIn=state.up.get(n.id)||[],directOut=state.down.get(n.id)||[];
 const tags=[niceSubject(n.subject),n.grade_band,n.topic_area].filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join('');
 const lite=state.liteIds.has(n.id)?`<a href="/lite/#kc/${encodeURIComponent(n.id)}" target="_blank" rel="noopener">Harjoittele tätä aihetta Litessä <span aria-hidden="true">↗</span> <small>(uusi välilehti)</small></a>`:'';
 const edgeLabel=e=>e.alternative?'Vaihtoehtoinen esitieto (TAI)':relationLabel(e.type);
 const groupInfo=(n.prerequisite_groups||[]).map(g=>`<li><strong>${g.any_of?'Vähintään yksi (TAI)':'Kaikki (JA)'}</strong>: ${(g.any_of||g.all_of||[]).map(esc).join(g.any_of?' TAI ':' JA ')}${g.rationale?`<p>${esc(g.rationale)}</p>`:''}</li>`).join('');
 const technical=[...directIn.map(e=>`<li><strong>← ${esc(edgeLabel(e))}</strong> · ${esc(e.strength)} · <code>${esc(e.source)}</code>${e.rationale?`<br><span>${esc(e.rationale)}</span>`:''}</li>`),...directOut.map(e=>`<li><strong>→ ${esc(edgeLabel(e))}</strong> · ${esc(e.strength)} · <code>${esc(e.target)}</code>${e.rationale?`<br><span>${esc(e.rationale)}</span>`:''}</li>`)].join('');
 const provenance=[n.source_basis?`<p><strong>Lähdepohja:</strong> ${esc(n.source_basis)}</p>`:'',n.concept_path?.length?`<p><strong>Käsitepolku:</strong> ${esc(n.concept_path.join(' → '))}</p>`:'',n.curriculum_refs?.length?`<p><strong>OPS-viitteet:</strong> ${n.curriculum_refs.map(esc).join(', ')}</p>`:'',n.entry_role?`<p><strong>Entry role:</strong> ${esc(n.entry_role)} · <strong>Mastery role:</strong> ${esc(n.mastery_role||'')}</p>`:''].join('');
 info.innerHTML=`<div class="node-id">${esc(n.id)}</div><h3>${esc(n.title)}</h3><p>${esc(n.short_description||'')}</p><div class="node-tags">${tags}</div><div class="relation-counts"><div><strong>${directIn.length}</strong><span>suoraa esitietoa</span></div><div><strong>${directOut.length}</strong><span>suoraa jatkoaihetta</span></div></div>${groupInfo?`<section class="prerequisite-groups" aria-label="Esitietoryhmät"><h4>Esitiedot ryhmissä</h4><p>Ryhmien välillä JA. TAI-ryhmästä riittää yksi.</p><ul>${groupInfo}</ul></section>`:''}<div class="node-actions"><a href="/oppitunnit/lessons/${encodeURIComponent(n.id)}.html">Avaa oppitunti</a>${lite}<button type="button" id="refocus-node">Näytä aliverkko</button></div><details class="technical-details"><summary>Tekniset tiedot ja kaikki suorat relaatiot</summary>${provenance}${technical?`<ul>${technical}</ul>`:'<p>Ei suoria relaatiota.</p>'}</details>`;
 $('#refocus-node')?.addEventListener('click',()=>{showFocus();if(mobile.matches)closeSidebar(false);stage.focus({preventScroll:true})})}
function setSummary(){const n=state.byId.get(state.selected);
 summary.textContent=state.mode==='focus'&&n?`${state.highlight.size} noodin aliverkko · ${scopeText()}`:state.mode==='roots'?`${rootIds().length} juurinoodia · valitse aloituskohta`:n?`Koko verkko · ${state.highlight.size} noodin aliverkko korostettuna`:'Koko 690 noodin verkko · valitse aihe'}

/* ---------- Modes ---------- */
function setMode(mode){state.mode=mode;stage.dataset.mode=mode;for(const [m,b] of Object.entries(modeButtons)){b.classList.toggle('active',m===mode);b.setAttribute('aria-pressed',String(m===mode))}btnFocus.disabled=!state.selected;btnClear.hidden=!state.selected;applyHighlight();setSummary();applyCameras()}
function selectNode(id,{keepFocus=false}={}){if(!state.positions.has(id))return;const hadCardFocus=keepFocus&&document.activeElement?.closest?.('.focus-card');state.selected=id;state.highlight=new Set(subgraph(id,currentLimit()).keys());history.replaceState(null,'','#'+encodeURIComponent(id));updateInfo();renderFocus();setMode('focus');fitFocus();
 if(hadCardFocus)focusCards.querySelector('.focus-card.is-selected')?.focus({preventScroll:true});else if(app.getBoundingClientRect().top<0)app.scrollIntoView({block:'start'})}
function showFocus(){if(!state.selected)return;renderFocus();setMode('focus');fitFocus()}
function showOverview(){setMode('overview');fitOverview()}
function showRoots(){renderRoots();setMode('roots');fitRoots()}
function clearSelection(){state.selected=null;state.highlight.clear();history.replaceState(null,'',location.pathname+location.search);updateInfo();focusCards.replaceChildren();focusEdges.replaceChildren();showOverview()}

/* ---------- Cameras ---------- */
function activeBounds(){return state.mode==='focus'?state.focusBounds:state.mode==='roots'?state.rootsBounds:state.bounds}
function stageSize(){const r=stage.getBoundingClientRect();return{w:r.width,h:r.height}}
function minimumScale(){const {w,h}=stageSize(),b=activeBounds();if(!b||!w||!h)return .01;const s=fitView(b,w,h).scale;return state.mode==='overview'?s:Math.min(s,1)*.8}
function applyCameras(){const o=state.cams.overview;view.setAttribute('transform',`translate(${o.tx} ${o.ty}) scale(${o.scale})`);
 if(state.mode!=='overview'){const c=state.cams[state.mode];focusView.setAttribute('transform',`translate(${c.tx} ${c.ty}) scale(${c.scale})`)}
 const c=state.cams[state.mode];zoomRange.min=String(minimumScale());zoomRange.value=String(c.scale);zoomLabel.textContent=c.scale.toFixed(c.scale<.1?3:2)+'×';zoomRange.setAttribute('aria-valuetext',zoomLabel.textContent);
 const {w,h}=stageSize();if(w&&h){miniWindow.setAttribute('x',-o.tx/o.scale);miniWindow.setAttribute('y',-o.ty/o.scale);miniWindow.setAttribute('width',w/o.scale);miniWindow.setAttribute('height',h/o.scale)}placeGroupLabels()}
function centered(b,s){const {w,h}=stageSize();return{scale:s,tx:(w-b.w*s)/2-b.x*s,ty:(h-b.h*s)/2-b.y*s}}
function fitBox(box,pad=55){const {w,h}=stageSize();if(!w||!h)return;Object.assign(state.cams[state.mode],fitView(box,w,h,pad));applyCameras()}
function fitOverview(){const {w,h}=stageSize();if(!w||!h||!state.bounds)return;state.cams.overview=fitView(state.bounds,w,h,55);applyCameras()}
function fitSet(ids){const pts=[...ids].map(id=>state.positions.get(id)).filter(Boolean);if(!pts.length)return fitOverview();const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y);fitBox({x:Math.min(...xs)-45,y:Math.min(...ys)-45,w:Math.max(...xs)-Math.min(...xs)+246,h:Math.max(...ys)-Math.min(...ys)+128},55)}
// Fit the whole subgraph when it stays readable; otherwise keep a readable zoom and start from the selected topic.
function fitFocus(all=false){const b=state.focusBounds,{w,h}=stageSize();if(!b||!w||!h)return;const c=state.focusCenter,fit=fitView(b,w,h,28);
 const readable=c.vertical?Math.min(1,(w-16)/b.w):.7;let cam;
 if(all||fit.scale>=readable)cam=centered(b,Math.min(fit.scale,1.15));
 else if(c.vertical){const s=readable;cam={scale:s,tx:(w-b.w*s)/2-b.x*s,ty:Math.min(16-b.y*s,h*.42-c.y*s)}}
 else{const s=readable;cam={scale:s,tx:Math.min(24-b.x*s,w*.36-c.x*s),ty:h/2-c.y*s}}
 state.cams.focus=cam;applyCameras()}
function fitRoots(all=false){const b=state.rootsBounds,{w,h}=stageSize();if(!b||!w||!h)return;const fit=fitView(b,w,h,16);if(all){state.cams.roots=centered(b,Math.min(fit.scale,1));applyCameras();return}const s=Math.min(1,(w-16)/b.w);state.cams.roots={scale:s,tx:(w-b.w*s)/2-b.x*s,ty:12-b.y*s};applyCameras()}
function fitCurrent(){if(state.mode==='focus')fitFocus(true);else if(state.mode==='roots')fitRoots(true);else state.highlight.size?fitSet(state.highlight):fitOverview()}
function zoomAt(factor,cx,cy){const m=state.mode;state.cams[m]=zoomView(state.cams[m],factor,cx,cy,minimumScale());applyCameras()}
bindNavigation(stage,{read:()=>({...state.cams[state.mode]}),write:next=>{state.cams[state.mode]={scale:next.scale,tx:next.tx,ty:next.ty};applyCameras()},minimum:minimumScale,overview:showOverview});

/* ---------- Controls ---------- */
$('#zoom-in').addEventListener('click',()=>zoomAt(1.15,stage.clientWidth/2,stage.clientHeight/2));$('#zoom-out').addEventListener('click',()=>zoomAt(.87,stage.clientWidth/2,stage.clientHeight/2));zoomRange.addEventListener('input',()=>{const next=Number(zoomRange.value),factor=next/state.cams[state.mode].scale;zoomAt(factor,stage.clientWidth/2,stage.clientHeight/2)});
btnOverview.addEventListener('click',showOverview);btnFocus.addEventListener('click',showFocus);btnRoots.addEventListener('click',showRoots);btnFit.addEventListener('click',fitCurrent);btnClear.addEventListener('click',clearSelection);
layoutSwitch.addEventListener('click',e=>{const b=e.target.closest('button[data-layout]');if(!b||b.dataset.layout===state.layout)return;state.layout=b.dataset.layout;try{localStorage.setItem('oppimisverkko-layout',state.layout)}catch{}updateLayoutSwitch();render()});
try{const saved=localStorage.getItem('oppimisverkko-layout');if(LAYOUTS[saved])state.layout=saved}catch{}updateLayoutSwitch();
scopeToggle.addEventListener('click',()=>{state.scopeAll=!state.scopeAll;updateScopeToggle();if(!state.selected)return;state.highlight=new Set(subgraph(state.selected,currentLimit()).keys());applyHighlight();if(state.mode==='focus'){renderFocus();fitFocus()}setSummary()});
// The minimap acts on press: in the full view it moves the camera there, elsewhere it returns to the full network.
minimap.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();if(state.mode!=='overview'){showOverview();return}const ctm=miniSvg.getScreenCTM();if(!ctm)return;const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(ctm.inverse()),c=state.cams.overview,{w,h}=stageSize();c.tx=w/2-p.x*c.scale;c.ty=h/2-p.y*c.scale;applyCameras()});
search.addEventListener('input',()=>{const q=search.value.trim().toLocaleLowerCase('fi');if(!q){results.replaceChildren();return}const hits=state.nodes.filter(n=>(n.id+' '+n.title+' '+(n.topic_area||'')+' '+(n.short_description||'')).toLocaleLowerCase('fi').includes(q)).slice(0,12);results.innerHTML=hits.map(n=>`<button class="network-result ${nodeClass(n)}" type="button" data-id="${esc(n.id)}"><strong>${esc(n.title)}</strong><span>${esc(n.id)} · ${esc(n.topic_area||niceSubject(n.subject))}</span></button>`).join('')||'<p class="small">Ei osumia.</p>';for(const b of results.querySelectorAll('button'))b.addEventListener('click',()=>{selectNode(b.dataset.id);search.value='';results.replaceChildren();if(mobile.matches)closeSidebar(false);stage.focus({preventScroll:true})})});
function updateSidebar(){const open=sidebar.classList.contains('is-open');sidebar.inert=mobile.matches&&!open;sidebarOpen.setAttribute('aria-expanded',String(mobile.matches&&open));backdrop.hidden=!mobile.matches||!open;$('#network-main').inert=mobile.matches&&open}
function openSidebar(focusSearch=true){sidebar.classList.add('is-open');updateSidebar();(focusSearch?search:sidebarClose).focus({preventScroll:true})}
function closeSidebar(restoreFocus=true){sidebar.classList.remove('is-open');updateSidebar();if(restoreFocus&&mobile.matches){sidebarOpen.focus({preventScroll:true});sidebarOpen.scrollIntoView({behavior:'instant',block:'center',inline:'nearest'})}}
sidebarOpen.addEventListener('click',()=>openSidebar());
sidebarClose.addEventListener('click',()=>closeSidebar());backdrop.addEventListener('click',()=>closeSidebar());
addEventListener('keydown',event=>{if(event.key==='Escape'&&mobile.matches&&sidebar.classList.contains('is-open')){event.preventDefault();closeSidebar()}});
mobile.addEventListener('change',()=>{sidebar.classList.remove('is-open');updateSidebar()});updateSidebar();
let resizeFrame=0;addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{if(!state.bounds)return;fitOverview();if(state.mode==='focus'){renderFocus();fitFocus()}else if(state.mode==='roots'){renderRoots();fitRoots()}})});
(async()=>{try{const graph=await loadGraph();if(!Array.isArray(graph.nodes)||graph.nodes.length!==690)throw new Error('Kanonisen verkon noodimäärä ei ole 690');state.nodes=graph.nodes;state.byId=new Map(graph.nodes.map(n=>[n.id,n]));state.edges=buildEdges(graph.nodes);if(state.edges.length!==1287)throw new Error('Kanonisen verkon relaatiomäärä ei ole 1287');indexEdges();try{const lite=await loadJson('/lite/lite-runtime.json');state.liteIds=new Set(lite.runtimeAvailability?.ids||[])}catch{}
 render();status.textContent='690 noodia · 1 287 relaatiota';app.dataset.loading='false';const id=decodeURIComponent(location.hash.slice(1));if(id&&state.positions.has(id))selectNode(id)}catch(error){console.error(error);status.textContent='Verkon lataus epäonnistui';$('#loading-card').innerHTML='<strong>Oppimisverkkoa ei voitu ladata.</strong><span>Julkaisupaketin graafidata puuttuu tai on ristiriitainen.</span>'}})();
