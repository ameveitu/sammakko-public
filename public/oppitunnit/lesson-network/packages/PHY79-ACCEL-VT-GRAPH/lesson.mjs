const owners=new WeakMap();
const own=(o,k)=>typeof k==='string'&&Object.hasOwn(o,k);
export const dense=(a,n)=>Array.isArray(a)&&Object.getPrototypeOf(a)===Array.prototype&&a.length===n&&Reflect.ownKeys(a).length===n+1&&Array.from({length:n},(_,i)=>Object.hasOwn(a,i)).every(Boolean);
const exact=(o,keys)=>o!==null&&typeof o==='object'&&!Array.isArray(o)&&Reflect.ownKeys(o).length===keys.length&&keys.every(k=>Object.hasOwn(o,k));
const integer=(n,a,b)=>Number.isSafeInteger(n)&&n>=a&&n<=b;
export function deepFreeze(o){if(o&&typeof o==='object'){Object.values(o).forEach(deepFreeze);Object.freeze(o);}return o;}
const gcd=(a,b)=>{a=a<0n?-a:a;b=b<0n?-b:b;while(b){const t=a%b;a=b;b=t;}return a||1n;};
export function rat(n,d=1n){n=BigInt(n);d=BigInt(d);if(d===0n)throw RangeError('Zero denominator');if(d<0n){n=-n;d=-d;}const g=gcd(n,d);return{n:n/g,d:d/g};}
const add=(a,b)=>rat(a.n*b.d+b.n*a.d,a.d*b.d),sub=(a,b)=>rat(a.n*b.d-b.n*a.d,a.d*b.d),mul=(a,b)=>rat(a.n*b.n,a.d*b.d),div=(a,b)=>rat(a.n*b.d,a.d*b.n),eq=(a,b)=>a.n===b.n&&a.d===b.d;
// Normalize only semantically irrelevant zeros; limits apply before trim and to meaningful digits.
const normalizeInteger=s=>{const negative=s.startsWith('-'),digits=s.replace(/^[-+]/,'').replace(/^0+(?=\d)/,'');return(negative?'-':'')+digits;};
export function parseNumber(raw){
 if(typeof raw!=='string'||raw.length>128)return undefined;const s=raw.trim().replaceAll('−','-');if(!s)return null;
 const fraction=s.match(/^([-+]?\d+)\s*\/\s*([-+]?\d+)$/);if(fraction){const n=normalizeInteger(fraction[1]),d=normalizeInteger(fraction[2]);if(n.replace('-','').length>24||d.replace('-','').length>24||BigInt(d)===0n)return undefined;return rat(n,d);}
 const decimal=s.match(/^([-+]?)(\d+)(?:[,.](\d*))?$/);if(!decimal)return undefined;const whole=normalizeInteger(decimal[2]),digits=(decimal[3]||'').replace(/0+$/,'');if(whole.length>24||digits.length>12)return undefined;return rat(BigInt(decimal[1]==='-'?'-1':'1')*BigInt(whole+digits),10n**BigInt(digits.length));
}
export function parseControlTime(raw){if(typeof raw!=='string'||raw.length>128)return undefined;const s=raw.trim().replaceAll('−','-'),m=s.match(/^([-+]?)(\d+)(?:[,.](\d*))?$/);if(!m||normalizeInteger(m[2]).length>24||(m[3]||'').replace(/0+$/,'').length>6)return undefined;const n=Number(s.replace(',','.'));return Number.isFinite(n)?(n===0?0:n):undefined;}
export function exactText(r){if(!exact(r,['n','d'])||typeof r.n!=='bigint'||typeof r.d!=='bigint'||r.d<=0n)throw RangeError('Invalid rational display');if(r.d===1n)return String(r.n).replace('-','−');let d=r.d;while(d%2n===0n)d/=2n;while(d%5n===0n)d/=5n;if(d!==1n)return`${r.n}/${r.d}`.replace('-','−');let remainder=r.n<0n?-r.n:r.n;const whole=remainder/r.d;remainder%=r.d;let digits='';for(let i=0;i<12&&remainder;i++){remainder*=10n;digits+=String(remainder/r.d);remainder%=r.d;}if(remainder)return`${r.n}/${r.d}`.replace('-','−');return(r.n<0n?'−':'')+String(whole)+(digits?','+digits:'');}
export function fmt(n){if(!Number.isFinite(n))throw RangeError('Invalid display');return String(Object.is(n,-0)?0:Number(n.toFixed(3))).replace('.',',').replace('-','−');}

export const CONTROLS=deepFreeze(['play','pause','step','seek','end','restart']);
export function validateModel(m){
 if(!exact(m,['name','kind','origin','direction','lengthUnit','timeUnit','axes','step','playbackSeconds','strobeSeconds','controls','tracks']))return false;
 if(m.strobeSeconds!==1||m.kind!=='linear_velocity_timeline'||m.origin!==0||m.direction!=='positive_axis'||m.lengthUnit!=='m'||m.timeUnit!=='s'||typeof m.name!=='string'||!m.name.length||m.name.length>80)return false;
 const a=m.axes;if(!exact(a,['tMax','tStep','xMax','xStep','vMax','vStep']))return false;
 if(!integer(a.tMax,1,12)||!integer(a.tStep,1,a.tMax)||a.tMax%a.tStep||a.tMax/a.tStep>12)return false;
 for(const[max,step,bound]of[[a.xMax,a.xStep,500],[a.vMax,a.vStep,40]])if(!integer(max,1,bound)||!integer(step,1,max)||max%step||max/step>12)return false;
 if(typeof m.step!=='number'||!Number.isFinite(m.step)||m.step<=0||m.step>a.tMax||Number(m.step.toFixed(6))!==m.step||!Number.isInteger(a.tMax/m.step)||typeof m.playbackSeconds!=='number'||!Number.isFinite(m.playbackSeconds)||m.playbackSeconds<1||m.playbackSeconds>20)return false;
 if(!dense(m.controls,CONTROLS.length)||!m.controls.every((x,i)=>x===CONTROLS[i])||!Array.isArray(m.tracks)||!dense(m.tracks,m.tracks.length)||m.tracks.length<1||m.tracks.length>2)return false;
 for(const track of m.tracks){if(!exact(track,['name','points'])||typeof track.name!=='string'||!/^[A-Za-zÅÄÖåäö0-9 -]{1,24}$/.test(track.name))return false;const p=track.points;if(!Array.isArray(p)||!dense(p,p.length)||p.length<2||p.length>5||p.some((v,i)=>!dense(v,2)||!integer(v[0],0,a.tMax)||!integer(v[1],0,a.vMax)||i&&v[0]<=p[i-1][0]))return false;if(p[0][0]!==0||p.at(-1)[0]!==a.tMax)return false;let x=0;for(let i=1;i<p.length;i++)x+=(p[i][0]-p[i-1][0])*(p[i][1]+p[i-1][1])/2;if(x>a.xMax)return false;}
 return new Set(m.tracks.map(t=>t.name)).size===m.tracks.length;
}
export function getModel(k){if(!own(MODELS,k)||!validateModel(MODELS[k]))throw RangeError('Unsupported declared motion');return MODELS[k];}
const validTime=(m,t)=>typeof t==='number'&&Number.isFinite(t)&&t>=0&&t<=m.axes.tMax;
export function stateAt(m,actor,t){
 if(!validateModel(m)||!integer(actor,0,m.tracks.length-1)||!validTime(m,t))throw RangeError('Unsupported motion, actor or time');
 const p=m.tracks[actor].points;let x=0,v=p[0][1],a=0;
 for(let i=1;i<p.length;i++){const[t0,v0]=p[i-1],[t1,v1]=p[i],u=Math.max(0,Math.min(t,t1)-t0);a=(v1-v0)/(t1-t0);x+=v0*u+a*u*u/2;v=v0+a*u;if(t<t1)break;}
 for(let i=1;i<p.length-1;i++)if(t===p[i][0]){const left=(p[i][1]-p[i-1][1])/(p[i][0]-p[i-1][0]),right=(p[i+1][1]-p[i][1])/(p[i+1][0]-p[i][0]);if(left!==right)a=null;}
 return{t,x,s:x,v,a};
}
export function exactStateAt(m,actor,t){
 if(!validateModel(m)||!integer(actor,0,m.tracks.length-1)||!integer(t,0,m.axes.tMax))throw RangeError('Unsupported exact graph sample');
 const p=m.tracks[actor].points;let x=rat(0),v=rat(p[0][1]),a=rat(0);
 for(let i=1;i<p.length;i++){const[t0,v0]=p[i-1],[t1,v1]=p[i],u=Math.max(0,Math.min(t,t1)-t0);a=rat(v1-v0,t1-t0);x=add(x,add(mul(rat(v0),rat(u)),mul(a,rat(u*u,2))));v=add(rat(v0),mul(a,rat(u)));if(t<t1)break;}
 for(let i=1;i<p.length-1;i++)if(t===p[i][0]){const left=rat(p[i][1]-p[i-1][1],p[i][0]-p[i-1][0]),right=rat(p[i+1][1]-p[i][1],p[i+1][0]-p[i][0]);if(!eq(left,right))a=null;}
 return{x,s:x,v,a};
}
export function meanA(m,actor,t0,t1){if(!integer(t0,0,m.axes.tMax)||!integer(t1,0,m.axes.tMax)||t0>=t1)throw RangeError('Unsupported interval');return div(sub(exactStateAt(m,actor,t1).v,exactStateAt(m,actor,t0).v),rat(t1-t0));}
export function linearOn(m,actor,t0,t1){const mean=meanA(m,actor,t0,t1),times=[t0,...m.tracks[actor].points.map(p=>p[0]).filter(t=>t>t0&&t<t1),t1];return times.slice(1).every((t,i)=>eq(meanA(m,actor,times[i],t),mean));}
export function changedOn(m,actor,t0,t1){meanA(m,actor,t0,t1);const times=[t0,...m.tracks[actor].points.map(p=>p[0]).filter(t=>t>t0&&t<t1),t1];return times.slice(1).some((t,i)=>meanA(m,actor,times[i],t).n!==0n);}
export function motionLabel(m,actor,t0,t1){if(!linearOn(m,actor,t0,t1))throw RangeError('Nonuniform interval has no single acceleration trend');const a=meanA(m,actor,t0,t1);return a.n>0n?'increase':a.n<0n?'decrease':exactStateAt(m,actor,t0).v.n===0n?'rest':'steady';}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function curveSegments(m,actor){if(!validateModel(m)||!integer(actor,0,m.tracks.length-1))throw RangeError('Unsupported curve');const p=m.tracks[actor].points;let x=0;return p.slice(1).map(([t1,v1],i)=>{const[t0,v0]=p[i],T=t1-t0,begin=x,control=x+v0*T/2,end=x+(v0+v1)*T/2;x=end;return{t0,t1,x0:begin,xc:control,x1:end,v0,v1};});}
export function graph(m,t,kind,world=false,actor=null,annotations=[]){
 if(!validateModel(m)||!validTime(m,t)||!['position','velocity'].includes(kind)||typeof world!=='boolean'||actor!==null&&!integer(actor,0,m.tracks.length-1)||!Array.isArray(annotations)||!dense(annotations,annotations.length)||annotations.some(u=>!integer(u,0,m.axes.tMax)))throw RangeError('Unsupported graph representation');
 const a=m.axes,yMax=kind==='position'?a.xMax:a.vMax,yStep=kind==='position'?a.xStep:a.vStep,top=world?92:30,bottom=top+132,left=46,right=338,gx=u=>left+(right-left)*u/a.tMax,gy=y=>bottom-132*y/yMax,label=kind==='position'?'Paikka x (m)':'Nopeus v (m/s)';let out=`<text x="${left}" y="${top-10}" font-size="20">${label}</text>`;
 for(let u=0;u<=a.tMax;u+=a.tStep)out+=`<line x1="${gx(u)}" y1="${top}" x2="${gx(u)}" y2="${bottom}" stroke="#b9c6be"/><text x="${gx(u)}" y="${bottom+22}" text-anchor="middle" font-size="20">${u}</text>`;
 for(let y=0;y<=yMax;y+=yStep)out+=`<line x1="${left}" y1="${gy(y)}" x2="${right}" y2="${gy(y)}" stroke="#b9c6be"/><text x="${left-7}" y="${gy(y)+6}" text-anchor="end" font-size="20">${y}</text>`;
 out+=`<text x="${right}" y="${bottom+49}" text-anchor="end" font-size="20">Aika t (s)</text><line x1="${gx(t)}" x2="${gx(t)}" y1="${top}" y2="${bottom}" stroke="#163e38" stroke-dasharray="3 4"/>`;
 m.tracks.forEach((track,i)=>{if(actor!==null&&actor!==i)return;const c=i?'#8c3c24':'#145f87',dash=i?'stroke-dasharray="7 4"':'',s=stateAt(m,i,t);let path='';if(kind==='position'){for(const segment of curveSegments(m,i)){if(!path)path=`M${gx(segment.t0)} ${gy(segment.x0)}`;path+=segment.v0===segment.v1?` L${gx(segment.t1)} ${gy(segment.x1)}`:` Q${gx((segment.t0+segment.t1)/2)} ${gy(segment.xc)} ${gx(segment.t1)} ${gy(segment.x1)}`;}}else path=track.points.map(([u,v],j)=>(j?'L':'M')+gx(u)+' '+gy(v)).join(' ');
  const value=kind==='position'?s.x:s.v;out+=`<path data-curve="${i}" d="${path}" fill="none" stroke="${c}" stroke-width="4" ${dash}/><circle data-graph-point="${i}" data-t="${t}" data-value="${value}" cx="${gx(t)}" cy="${gy(value)}" r="6" fill="${c}" stroke="#fff" stroke-width="2"/>`;
  for(const u of annotations){const exact=exactStateAt(m,i,u)[kind==='position'?'x':'v'],v=Number(exact.n)/Number(exact.d);out+=`<text x="${gx(u)+(u===a.tMax?-6:6)}" y="${gy(v)+(gy(v)<top+25?24:-10)}" text-anchor="${u===a.tMax?'end':'start'}" font-size="20">${exactText(exact)}</text>`;}
  if(world){const y=18+i*28,px=x=>left+(right-left)*x/a.xMax;out+=`<line x1="${left}" x2="${right}" y1="${y}" y2="${y}" stroke="#b9c6be"/><text x="3" y="${y+5}" font-size="20">${i+1}</text>`;for(let u=0;u<=t;u+=m.strobeSeconds){const p=stateAt(m,i,u);out+=`<circle data-strobe-t="${u}" data-strobe-actor="${i}" data-x="${p.x}" cx="${px(p.x)}" cy="${y}" r="2.5" fill="${c}"/>`;}out+=`<circle data-world-point="${i}" data-x="${s.x}" data-v="${s.v}" data-t="${t}" cx="${px(s.x)}" cy="${y}" r="6" fill="${c}"/>`;}
 });return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 ${bottom+60}" role="img" aria-label="${label}, aika vaakasuunnassa. Kellon hetki ${fmt(t)} s. Kulkureitti on erikseen suoralla."><g fill="#153c34" font-family="sans-serif">${out}</g></svg>`;
}
export function readout(m,t){return`Likiarvot: mallin kello ${fmt(t)} s. `+m.tracks.map((a,i)=>{const s=stateAt(m,i,t);return`${a.name}: paikka ${fmt(s.x)} m, nopeus ${fmt(s.v)} m/s.`;}).join(' ');}
export function table(m,actor=null){if(!validateModel(m)||actor!==null&&!integer(actor,0,m.tracks.length-1))throw RangeError('Unsupported table');const actors=actor===null?m.tracks.map((_,i)=>i):[actor];return`<table><caption>Kellon tasaiset ${fmt(m.strobeSeconds)} sekunnin välit; x on paikka ja v nopeus.</caption><thead><tr><th scope="col">t (s)</th>${actors.map(i=>`<th scope="col">${esc(m.tracks[i].name)} x (m)</th><th scope="col">${esc(m.tracks[i].name)} v (m/s)</th>`).join('')}</tr></thead><tbody>${Array.from({length:m.axes.tMax+1},(_,t)=>`<tr><th scope="row">${t}</th>${actors.map(i=>{const s=exactStateAt(m,i,t);return`<td>${exactText(s.x)}</td><td>${exactText(s.v)}</td>`;}).join('')}</tr>`).join('')}</tbody></table>`;}
export function validateTask(t){
 if(!t||typeof t!=='object'||!own(MODELS,t.model))return false;const fields={motion:['actor','t0','t1'],change:['actor','t0','t1'],sign:['actor','t0','t1'],mean_a:['actor','t0','t1'],compare_a:['t0','t1'],phases:['actor']};if(!own(fields,t.op)||!exact(t,['name','op','model','q','help','explain',...fields[t.op]])||['name','q','help','explain'].some(k=>typeof t[k]!=='string'||!t[k].length||t[k].length>1200))return false;const m=MODELS[t.model];if(!validateModel(m)||t.op!=='compare_a'&&!integer(t.actor,0,m.tracks.length-1))return false;if(t.op==='phases')return true;if(!integer(t.t0,0,m.axes.tMax)||!integer(t.t1,0,m.axes.tMax)||t.t0>=t.t1)return false;if(t.op==='change'||t.op==='mean_a')return true;if(t.op==='compare_a')return m.tracks.length===2&&linearOn(m,0,t.t0,t.t1)&&linearOn(m,1,t.t0,t.t1);return linearOn(m,t.actor,t.t0,t.t1);
}
export function getTask(k){if(!own(TASKS,k)||!validateTask(TASKS[k]))throw RangeError('Unsupported task');return TASKS[k];}
export function expected(k){const t=getTask(k),m=getModel(t.model);if(t.op==='motion')return[motionLabel(m,t.actor,t.t0,t.t1)];if(t.op==='change')return[changedOn(m,t.actor,t.t0,t.t1)?'yes':'no'];if(t.op==='sign'){const a=meanA(m,t.actor,t.t0,t.t1);return[a.n>0n?'positive':a.n<0n?'negative':'zero'];}if(t.op==='mean_a')return[meanA(m,t.actor,t.t0,t.t1)];if(t.op==='compare_a'){const d=sub(meanA(m,0,t.t0,t.t1),meanA(m,1,t.t0,t.t1));return[d.n===0n?'same':d.n>0n?'0':'1'];}if(t.op==='phases'){const p=m.tracks[t.actor].points;return p.slice(1).map((row,i)=>{const a=meanA(m,t.actor,p[i][0],row[0]);return a.n>0n?'positive':a.n<0n?'negative':'zero';});}throw RangeError('Unsupported operation');}
export function fieldOptions(k){const t=getTask(k),m=getModel(t.model);if(t.op==='change')return{yes:'Nopeus muuttuu ainakin osan ajasta',no:'Nopeus pysyy koko ajan samana'};if(t.op==='compare_a')return{'0':m.tracks[0].name,'1':m.tracks[1].name,same:'Kiihtyvyydet ovat samat'};if(['sign','phases'].includes(t.op))return{positive:'Positiivinen (a > 0)',negative:'Negatiivinen (a < 0)',zero:'Nolla (a = 0)'};return{increase:'Nopeus kasvaa',decrease:'Nopeus pienenee',steady:'Liikkuu tasaisella nopeudella',rest:'On paikallaan'};}
const outcome=(state,text)=>({state,ok:state==='correct',text});
export function check(k,answers){if(!own(TASKS,k))return outcome('invalid','Valitse annettu tehtävä.');let want;try{want=expected(k);}catch{return outcome('invalid','Tehtävä tai sen malli ei ole tuettu.');}if(!dense(answers,want.length)||answers.some(a=>typeof a!=='string'))return outcome('invalid','Täydennä vain pyydetyt kentät.');if(answers.some(a=>!a.trim()))return outcome('missing','Täydennä vastaukset. Nolla kirjoitetaan 0.');const numeric=getTask(k).op==='mean_a';let ok;if(numeric){const a=parseNumber(answers[0]);if(!a)return outcome('invalid','Kirjoita luku tai kokonaislukujen murtoluku.');ok=eq(a,want[0]);}else{const options=fieldOptions(k);if(answers.some(a=>!own(options,a)))return outcome('invalid','Valitse annettu kuvaus.');ok=want.every((v,i)=>v===answers[i]);}const t=getTask(k);return outcome(ok?'correct':'retry',ok?'Kyllä. '+t.explain:t.help);}
export function fieldMarkup(k){const t=getTask(k);if(t.op==='mean_a')return'<label>Keskimääräinen kiihtyvyys (m/s²)<input data-answer type="text" inputmode="text" maxlength="128" autocomplete="off"></label>';const opts=fieldOptions(k),labels=t.op==='phases'?getModel(t.model).tracks[t.actor].points.slice(1).map((r,i)=>`${getModel(t.model).tracks[t.actor].points[i][0]}–${r[0]} s`):[t.op==='compare_a'?'Kumman kiihtyvyys on suurempi?':'Mikä kuvaus sopii?'];return labels.map(label=>`<label>${esc(label)}<select data-answer><option value="">Valitse</option>${Object.entries(opts).map(([v,text])=>`<option value="${v}">${esc(text)}</option>`).join('')}</select></label>`).join('');}
export function taskGraphic(k){const t=getTask(k),m=getModel(t.model);return graph(m,t.t0??0,GRAPH_KIND,false,t.op==='compare_a'?null:t.actor,t.op==='mean_a'?[t.t0,t.t1]:[]);}
export function taskTable(k){const t=getTask(k);return table(getModel(t.model),t.op==='compare_a'?null:t.actor);}
export function legend(m){return m.tracks.map((t,i)=>`${i+1}. ${t.name} (${i?'katko':'yhtenäinen'})`).join(' · ');}
export function validateCatalog(){if(!['position','velocity'].includes(GRAPH_KIND))throw RangeError('Unsupported declared representation');for(const m of Object.values(MODELS))if(!validateModel(m))throw RangeError('Unsupported authored motion');if(!own(MODELS,DEFAULT_MODEL)||!own(TASKS,DEFAULT_TASK))throw RangeError('Missing authored defaults');for(const k of Object.keys(TASKS))expected(k);return true;}

export function mount(host){
 const area=host.matches?.('[data-lesson-module]')?(host.previousElementSibling?.matches?.('article')?host.previousElementSibling:null):host,root=area?.matches?.('[data-graph15]')?area:area?.querySelector('[data-graph15]');if(!root)throw Error('Missing own graph article root');owners.get(root)?.dispose();
 const q=s=>root.querySelector(s),win=root.ownerDocument.defaultView;let disposed=false,paused=false,playing=false,raf=null,lastStamp=null,time=0,timeText='',modelKey=null,tableKey=null,taskKey=null,signature='';
 const stop=()=>{playing=false;q('[data-action=play]').setAttribute('aria-pressed','false');lastStamp=null;if(raf!==null)win.cancelAnimationFrame(raf);raf=null;};
 const feedback=r=>{q('[data-feedback]').dataset.result=r.state;q('[data-feedback]').textContent=r.text;};
 const neutral=(text='Tarkista, kun olet valmis.')=>feedback({state:'neutral',text});
 const answers=()=>[...root.querySelectorAll('[data-answer]')].map(e=>e.value);
 const enable=()=>root.querySelectorAll('button,input,select,fieldset').forEach(e=>e.disabled=paused);
 function syncTask(){
  const k=q('[data-task]').value;
  if(k!==taskKey){
   taskKey=k;signature='';neutral();
   if(!own(TASKS,k)){q('[data-question]').textContent='Valitse annettu tehtävä.';q('[data-task-view]').textContent='Tukematonta tehtävää ei korvata toisella.';q('[data-answer-fields]').replaceChildren();q('[data-task-table]').replaceChildren();q('[data-task-help]').textContent='Valitse annettu tehtävä.';return true;}
   const t=getTask(k);q('[data-question]').textContent=t.q;q('[data-task-view]').innerHTML=taskGraphic(k);q('[data-task-legend]').textContent=t.op==='compare_a'?legend(getModel(t.model)):getModel(t.model).tracks[t.actor].name;q('[data-task-table]').innerHTML=taskTable(k);q('[data-answer-fields]').innerHTML=fieldMarkup(k);q('[data-task-help]').textContent=t.help;enable();signature=JSON.stringify([k,...answers()]);return true;
  }
  const next=JSON.stringify([k,...answers()]);if(next!==signature){neutral();signature=next;}return false;
 }
 function syncModel(){
  const k=q('[data-model]').value;
  if(k!==modelKey){stop();modelKey=k;time=0;timeText='0';q('[data-time]').value='0';}
  if(!own(MODELS,k)){stop();q('[data-model-view]').textContent='Valitse annettu malli.';q('[data-readout]').textContent='Tukematon mallivalinta, ei oletusmallia.';q('[data-model-table]').replaceChildren();q('[data-run-state]').textContent='Toisto ei käytettävissä';tableKey=null;return null;}
  const m=getModel(k),raw=q('[data-time]').value;
  if(raw!==timeText){stop();const n=parseControlTime(raw);if(!validTime(m,n)){q('[data-model-view]').textContent='Anna mallin alueella oleva aika.';q('[data-readout]').textContent=`Anna aika 0–${m.axes.tMax} s tavallisena desimaalilukuna, enintään 6 desimaalia.`;q('[data-run-state]').textContent='Toisto ei käytettävissä';return null;}time=n;timeText=raw;}
  return m;
 }
 function draw(m){
  time=Number(time.toFixed(6));if(time===m.axes.tMax&&playing)stop();
  q('[data-model-view]').innerHTML=graph(m,time,GRAPH_KIND,true);q('[data-readout]').textContent=readout(m,time);q('[data-time]').value=String(Number(time.toFixed(6))).replace('.',',');timeText=q('[data-time]').value;
  if(tableKey!==modelKey){q('[data-model-table]').innerHTML=table(m);q('[data-model-legend]').textContent=legend(m);q('[data-model-description]').textContent=`Mallin aika 0–${m.axes.tMax} s. Askel ${fmt(m.step)} s, ajanmerkkien väli ${fmt(m.strobeSeconds)} s. Koko toisto ${fmt(m.playbackSeconds)} ruutusekuntia. Kulkureitin paikka-asteikko 0–${m.axes.xMax} m on eri asia kuin alla oleva kuvaaja.`;q('[data-action=step]').textContent=`Askel ${fmt(m.step)} s`;tableKey=modelKey;}
  q('[data-action=play]').setAttribute('aria-pressed',String(playing));q('[data-run-state]').textContent=playing?'Toisto käynnissä':time===m.axes.tMax?'Toiston loppukuva, ei fyysinen pysäytys.':'Toisto tauolla';
 }
 function tick(now){
  raf=null;if(disposed||paused||!playing)return;syncTask();const m=syncModel();if(!m)return;if(!playing){draw(m);return;}
  const elapsed=lastStamp===null?0:(now-lastStamp)/1000;lastStamp=now;time=Math.min(m.axes.tMax,time+elapsed*m.axes.tMax/m.playbackSeconds);if(time===m.axes.tMax)stop();draw(m);if(playing)raf=win.requestAnimationFrame(tick);
 }
 function click(e){
  if(disposed||paused)return;const action=e.target.closest('[data-action]')?.dataset.action;if(!action)return;
  const changed=syncTask(),m=syncModel();
  if(action==='check'){
   if(m)draw(m);if(changed){neutral('Tehtävä vaihtui. Täydennä tämän tehtävän vastaukset.');return;}
   feedback(check(q('[data-task]').value,answers()));signature=JSON.stringify([taskKey,...answers()]);return;
  }
  if(!m)return;
  if(action==='play'){if(time===m.axes.tMax)time=0;playing=true;lastStamp=null;if(raf===null)raf=win.requestAnimationFrame(tick);}
  else if(action==='pause')stop();else if(action==='step'){stop();time=Math.min(m.axes.tMax,time+m.step);}else if(action==='end'){stop();time=m.axes.tMax;}else if(action==='restart'){stop();time=0;}
  draw(m);
 }
 function edit(e){if(disposed||paused)return;if(e.target.matches('[data-task],[data-answer]'))syncTask();if(e.target.matches('[data-model],[data-time]')){const m=syncModel();if(m)draw(m);}}
 function keydown(e){if(!disposed&&!paused&&e.key==='Enter'&&e.target.matches('input[data-answer]')){e.preventDefault();q('[data-action=check]').click();}}
 const api={
  pause(){if(disposed)return;stop();syncTask();paused=true;const m=syncModel();if(m)draw(m);enable();},
  resume(){if(disposed)return;paused=false;syncTask();const m=syncModel();if(m)draw(m);enable();},
  reset(){if(disposed)return;stop();q('[data-model]').value=DEFAULT_MODEL;q('[data-task]').value=DEFAULT_TASK;modelKey=null;tableKey=null;taskKey=null;signature='';syncTask();const m=syncModel();if(m)draw(m);neutral();enable();},
  dispose(){if(disposed)return;stop();syncTask();const m=syncModel();if(m)draw(m);disposed=true;root.removeEventListener('click',click);root.removeEventListener('input',edit);root.removeEventListener('change',edit);root.removeEventListener('keydown',keydown);if(owners.get(root)===api)owners.delete(root);}
 };
 root.addEventListener('click',click);root.addEventListener('input',edit);root.addEventListener('change',edit);root.addEventListener('keydown',keydown);owners.set(root,api);api.reset();return api;
}

export const GRAPH_KIND="velocity";
export const DEFAULT_MODEL="increase";
export const DEFAULT_TASK="clock";
export const MODELS=deepFreeze({"increase": {"name": "Lähtö ja kasvavat välit", "kind": "linear_velocity_timeline", "origin": 0, "direction": "positive_axis", "lengthUnit": "m", "timeUnit": "s", "axes": {"tMax": 4, "tStep": 1, "xMax": 16, "xStep": 4, "vMax": 8, "vStep": 2}, "step": 1, "playbackSeconds": 4, "strobeSeconds": 1, "controls": ["play", "pause", "step", "seek", "end", "restart"], "tracks": [{"name": "Loikka", "points": [[0, 0], [4, 8]]}]}, "decrease": {"name": "Jarrutus ja lyhenevät välit", "kind": "linear_velocity_timeline", "origin": 0, "direction": "positive_axis", "lengthUnit": "m", "timeUnit": "s", "axes": {"tMax": 4, "tStep": 1, "xMax": 16, "xStep": 4, "vMax": 8, "vStep": 2}, "step": 1, "playbackSeconds": 4, "strobeSeconds": 1, "controls": ["play", "pause", "step", "seek", "end", "restart"], "tracks": [{"name": "Loikka", "points": [[0, 8], [4, 0]]}]}, "steady": {"name": "Tasaiset välit", "kind": "linear_velocity_timeline", "origin": 0, "direction": "positive_axis", "lengthUnit": "m", "timeUnit": "s", "axes": {"tMax": 4, "tStep": 1, "xMax": 16, "xStep": 4, "vMax": 8, "vStep": 2}, "step": 1, "playbackSeconds": 4, "strobeSeconds": 1, "controls": ["play", "pause", "step", "seek", "end", "restart"], "tracks": [{"name": "Loikka", "points": [[0, 4], [4, 4]]}]}, "rest": {"name": "Paikallaan, kello käy", "kind": "linear_velocity_timeline", "origin": 0, "direction": "positive_axis", "lengthUnit": "m", "timeUnit": "s", "axes": {"tMax": 4, "tStep": 1, "xMax": 16, "xStep": 4, "vMax": 8, "vStep": 2}, "step": 1, "playbackSeconds": 4, "strobeSeconds": 1, "controls": ["play", "pause", "step", "seek", "end", "restart"], "tracks": [{"name": "Loikka", "points": [[0, 0], [4, 0]]}]}, "phases": {"name": "Kasvaa, pysyy, pienenee", "kind": "linear_velocity_timeline", "origin": 0, "direction": "positive_axis", "lengthUnit": "m", "timeUnit": "s", "axes": {"tMax": 6, "tStep": 2, "xMax": 40, "xStep": 10, "vMax": 10, "vStep": 2}, "step": 1, "playbackSeconds": 6, "strobeSeconds": 1, "controls": ["play", "pause", "step", "seek", "end", "restart"], "tracks": [{"name": "Loikka", "points": [[0, 0], [2, 8], [4, 8], [6, 0]]}]}, "higher": {"name": "Korkeus vai nopeuden muutos?", "kind": "linear_velocity_timeline", "origin": 0, "direction": "positive_axis", "lengthUnit": "m", "timeUnit": "s", "axes": {"tMax": 4, "tStep": 1, "xMax": 40, "xStep": 10, "vMax": 12, "vStep": 2}, "step": 1, "playbackSeconds": 4, "strobeSeconds": 1, "controls": ["play", "pause", "step", "seek", "end", "restart"], "tracks": [{"name": "Loikka", "points": [[0, 0], [4, 8]]}, {"name": "Aava", "points": [[0, 6], [4, 10]]}]}, "clock": {"name": "Aikaväli kellon keskeltä", "kind": "linear_velocity_timeline", "origin": 0, "direction": "positive_axis", "lengthUnit": "m", "timeUnit": "s", "axes": {"tMax": 8, "tStep": 2, "xMax": 80, "xStep": 20, "vMax": 20, "vStep": 5}, "step": 1, "playbackSeconds": 8, "strobeSeconds": 1, "controls": ["play", "pause", "step", "seek", "end", "restart"], "tracks": [{"name": "Loikka", "points": [[0, 2], [8, 18]]}]}});
export const TASKS=deepFreeze({"read": {"name": "Tapaus A: kiihtyvyyden lasku", "op": "mean_a", "model": "increase", "q": "Lue alkunopeus ja nopeus hetkellä 4 s. Laske välin keskimääräinen kiihtyvyys.", "help": "Nopeuden muutos on 8 − 0 m/s, kulunut aika 4 − 0 s. Jaa muutos ajalla.", "explain": "Kiihtyvyys on (8 − 0) / 4 = 2 m/s². Suoran jokaisella välillä on sama jyrkkyys.", "actor": 0, "t0": 0, "t1": 4}, "positive": {"name": "Tapaus B: kiihtyvyyden merkki", "op": "sign", "model": "increase", "q": "Minkä merkkinen kiihtyvyys on, kun nopeus–aika-viiva nousee?", "help": "Aika kasvaa oikealle ja nopeus ylöspäin. Katso nopeuden muutosta, älä viivan korkeutta.", "explain": "Nopeus kasvaa positiivisella aikavälillä, joten a > 0.", "actor": 0, "t0": 0, "t1": 4}, "negative": {"name": "Tapaus C: kiihtyvyyden merkki", "op": "sign", "model": "decrease", "q": "Minkä merkkinen kiihtyvyys on tässä oikealle liikkuvan Loikan jarrutuksessa?", "help": "Laske loppunopeus miinus alkunopeus. Tämän mallin nopeudet eivät ole negatiivisia.", "explain": "Nopeus pienenee 8 → 0 m/s. Muutos on negatiivinen, joten a < 0.", "actor": 0, "t0": 0, "t1": 4}, "zero": {"name": "Tapaus D: kiihtyvyyden merkki", "op": "sign", "model": "steady", "q": "Nopeus on koko ajan 4 m/s. Mikä on kiihtyvyys?", "help": "Kiihtyvyys kertoo nopeuden muutoksesta. Neljä m/s on nopeus, ei kiihtyvyys.", "explain": "Nopeus ei muutu: a = 0. Loikka silti liikkuu.", "actor": 0, "t0": 0, "t1": 4}, "compare": {"name": "Tapaus E: kahden kuvaajan vertailu", "op": "compare_a", "model": "higher", "q": "Kumman kiihtyvyys on suurempi välillä 0–4 s: Loikan vai Aavan?", "help": "Vertaa nopeuden muutosta samassa ajassa. Aavan suurempi alkunopeus ei ole suurempi kiihtyvyys.", "explain": "Loikan nopeus kasvaa 8 m/s ja Aavan 4 m/s neljässä sekunnissa. Loikan a = 2 m/s², Aavan a = 1 m/s².", "t0": 0, "t1": 4}, "phases": {"name": "Tapaus F: kolme aikaväliä", "op": "phases", "model": "phases", "q": "Valitse kunkin aikavälin kiihtyvyyden merkki.", "help": "Nouseva nopeusviiva: plus. Vaakasuora: nolla. Laskeva: miinus.", "explain": "Välillä 0–2 s a > 0, välillä 2–4 s a = 0 ja välillä 4–6 s a < 0.", "actor": 0}, "clock": {"name": "Tapaus G: kiihtyvyyden lasku", "op": "mean_a", "model": "clock", "q": "Nopeus on hetkellä 2 s 6 m/s ja hetkellä 6 s 14 m/s. Laske välin keskimääräinen kiihtyvyys.", "help": "Nopeuden muutos on 14 − 6 = 8 m/s. Aikaa kuluu 6 − 2 = 4 s, ei 6 s.", "explain": "(14 − 6) / (6 − 2) = 8 / 4 = 2 m/s². Kellon loppulukema ei yksin ole kulunut aika.", "actor": 0, "t0": 2, "t1": 6}, "mean_zero": {"name": "Tapaus H: koko aikaväli", "op": "mean_a", "model": "phases", "q": "Nopeus on alussa ja lopussa 0 m/s. Laske koko kuuden sekunnin keskimääräinen kiihtyvyys.", "help": "Koko välin keskiarvo käyttää päätenopeuksien erotusta. Se ei kerro kaikkia välissä tapahtuvia muutoksia.", "explain": "Keskimääräinen a = (0 − 0) / 6 = 0 m/s². Nopeus silti muuttuu välin sisällä.", "actor": 0, "t0": 0, "t1": 6}});
validateCatalog();
