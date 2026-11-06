const owners=new WeakMap();
const own=(o,k)=>typeof k==='string'&&Object.hasOwn(o,k);
export const dense=(a,n)=>Array.isArray(a)&&a.length===n&&Reflect.ownKeys(a).length===n+1&&Array.from({length:n},(_,i)=>Object.hasOwn(a,i)).every(Boolean);
const exact=(o,keys)=>o!==null&&typeof o==='object'&&!Array.isArray(o)&&Reflect.ownKeys(o).length===keys.length&&keys.every(k=>Object.hasOwn(o,k));
const integer=(n,a,b)=>Number.isSafeInteger(n)&&n>=a&&n<=b;
export function deepFreeze(o){if(o&&typeof o==='object'){Object.values(o).forEach(deepFreeze);Object.freeze(o);}return o;}
export const CONTROLS=deepFreeze(['play','pause','step','end','restart']);
export function validateModel(m){
 if(!exact(m,['name','kind','quantity','origin','motion','lengthUnit','timeUnit','axes','trackMax','step','playbackSeconds','controls','tracks']))return false;
 if(m.kind!=='linear_timeline'||!['path','distance_from_start','velocity'].includes(m.quantity)||m.lengthUnit!=='m'||m.timeUnit!=='s')return false;
 if(typeof m.name!=='string'||m.name.length<1||m.name.length>80||!exact(m.axes,['tMax','tStep','yMax','yStep']))return false;
 if(m.origin!==0||m.motion!==({path:'forward_only',distance_from_start:'positive_axis_position',velocity:'axis_velocity'}[m.quantity]))return false;
 const a=m.axes;
 if(!integer(a.tMax,1,12)||!integer(a.tStep,1,a.tMax)||a.tMax%a.tStep||a.tMax/a.tStep>12||!integer(a.yMax,1,120)||!integer(a.yStep,1,a.yMax)||a.yMax%a.yStep||a.yMax/a.yStep>12)return false;
 if(!integer(m.trackMax,1,500)||typeof m.step!=='number'||!Number.isFinite(m.step)||m.step<=0||m.step>a.tMax||Number(m.step.toFixed(6))!==m.step||!Number.isInteger(a.tMax/m.step)||typeof m.playbackSeconds!=='number'||!Number.isFinite(m.playbackSeconds)||m.playbackSeconds<1||m.playbackSeconds>20)return false;
 if(!dense(m.controls,CONTROLS.length)||!m.controls.every((v,i)=>v===CONTROLS[i])||!Array.isArray(m.tracks)||!dense(m.tracks,m.tracks.length)||m.tracks.length<1||m.tracks.length>2)return false;
 for(const track of m.tracks){
  if(!exact(track,['name','points'])||typeof track.name!=='string'||!/^[A-Za-zÅÄÖåäö0-9 -]{1,24}$/.test(track.name)||!Array.isArray(track.points)||!dense(track.points,track.points.length)||track.points.length<2||track.points.length>5)return false;
  const p=track.points;
  if(p.some((r,i)=>!dense(r,2)||!integer(r[0],0,a.tMax)||!integer(r[1],0,a.yMax)||(i&&r[0]<=p[i-1][0])||(i&&m.quantity==='path'&&r[1]<p[i-1][1])))return false;
  if(p[0][0]!==0||p.at(-1)[0]!==a.tMax||(m.quantity!=='velocity'&&p[0][1]!==0))return false;
  let distance=0;
  for(let i=1;i<p.length;i++)distance+=m.quantity==='velocity'?(p[i][0]-p[i-1][0])*(p[i][1]+p[i-1][1])/2:Math.abs(p[i][1]-p[i-1][1]);
  const extent=m.quantity==='velocity'?distance:Math.max(...p.map(r=>r[1]));if(extent>m.trackMax)return false;
 }
 return new Set(m.tracks.map(t=>t.name)).size===m.tracks.length;
}
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
export function getModel(k){if(!own(MODELS,k)||!validateModel(MODELS[k]))throw RangeError('Unsupported declared model');return MODELS[k];}
export function getTask(k){if(!own(TASKS,k)||!validateTask(TASKS[k]))throw RangeError('Unsupported task');return TASKS[k];}
function validTime(m,t){return typeof t==='number'&&Number.isFinite(t)&&t>=0&&t<=m.axes.tMax;}
export function valueAt(m,actor,t){
 if(!validateModel(m)||!integer(actor,0,m.tracks.length-1)||!validTime(m,t))throw RangeError('Unsupported model, track or time');
 const p=m.tracks[actor].points;
 for(let i=1;i<p.length;i++){const [a,ya]=p[i-1],[b,yb]=p[i];if(t<=b)return ya+(yb-ya)*(t-a)/(b-a);}throw RangeError('Time beyond declared horizon');
}
export function exactValueAt(m,actor,t){
 if(!validateModel(m)||!integer(actor,0,m.tracks.length-1)||!integer(t,0,m.axes.tMax))throw RangeError('Unsupported exact graph coordinate');
 const p=m.tracks[actor].points;
 for(let i=1;i<p.length;i++){const [a,ya]=p[i-1],[b,yb]=p[i];if(t<=b)return add(rat(ya),mul(rat(yb-ya,b-a),rat(t-a)));}throw RangeError('Exact time beyond horizon');
}
export function slope(m,actor,t0,t1){if(!validateModel(m)||!integer(actor,0,m.tracks.length-1)||!integer(t0,0,m.axes.tMax)||!integer(t1,0,m.axes.tMax)||t0>=t1)throw RangeError('Nonpositive/unsupported interval');return div(sub(exactValueAt(m,actor,t1),exactValueAt(m,actor,t0)),rat(t1-t0));}
export function stateAt(m,actor,t){
 const y=valueAt(m,actor,t),p=m.tracks[actor].points;let x=m.origin,s=0,v=0;
 for(let i=1;i<p.length;i++){const [a,ya]=p[i-1],[b,yb]=p[i],u=Math.max(0,Math.min(t-a,b-a)),k=(yb-ya)/(b-a);
  if(m.quantity==='velocity'){const area=ya*u+k*u*u/2;x+=area;s+=area;v=ya+k*u;}else{const delta=k*u;x+=delta;s+=Math.abs(delta);v=k;}
  if(t<b)break;
 }
 return{t,ordinate:y,x,s,v};
}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const COLORS=['#145f87','#8c3c24'];
const yLabel=m=>m.quantity==='velocity'?'Nopeus v (m/s)':m.quantity==='path'?'Kuljettu matka s (m)':'Etäisyys lähdöstä (m)';
export function graph(m,t=0,world=false,actor=null,annotate=false){
 if(!validateModel(m)||!validTime(m,t)||typeof world!=='boolean'||typeof annotate!=='boolean'||actor!==null&&!integer(actor,0,m.tracks.length-1)||world&&actor!==null)throw RangeError('Unsupported graph declaration');
 const top=world?72:30,W=360,H=top+184,left=46,bottom=top+130,right=338,gx=x=>left+(right-left)*x/m.axes.tMax,gy=y=>bottom-130*y/m.axes.yMax;
 let body=`<text x="${left}" y="${top-10}" font-size="17">${escape(yLabel(m))}</text>`;
 for(let x=0;x<=m.axes.tMax;x+=m.axes.tStep)body+=`<line x1="${gx(x)}" y1="${top}" x2="${gx(x)}" y2="${bottom}" stroke="#b9c6be"/><text x="${gx(x)}" y="${bottom+22}" text-anchor="middle" font-size="18">${x}</text>`;
 for(let y=0;y<=m.axes.yMax;y+=m.axes.yStep)body+=`<line x1="${left}" y1="${gy(y)}" x2="${right}" y2="${gy(y)}" stroke="#b9c6be"/><text x="${left-7}" y="${gy(y)+6}" text-anchor="end" font-size="18">${y}</text>`;
 body+=`<text x="${right}" y="${bottom+49}" text-anchor="end" font-size="18">Aika t (s)</text><line x1="${gx(t)}" y1="${top}" x2="${gx(t)}" y2="${bottom}" stroke="#163e38" stroke-dasharray="3 4"/>`;
 m.tracks.forEach((track,i)=>{if(actor!==null&&i!==actor)return;const state=stateAt(m,i,t),c=COLORS[i],dash=i?'stroke-dasharray="7 4"':'';body+=`<polyline points="${track.points.map(([a,b])=>`${gx(a)},${gy(b)}`).join(' ')}" fill="none" stroke="${c}" stroke-width="4" ${dash}/><circle data-graph-point="${i}" data-t="${t}" data-value="${state.ordinate}" cx="${gx(t)}" cy="${gy(state.ordinate)}" r="6" fill="${c}" stroke="#fff" stroke-width="2"/>`;
 if(annotate)track.points.forEach(([a,b],j)=>{if(j===0&&b===0)return;const end=j===track.points.length-1,x=gx(a)+(end?-5:5),y=gy(b)<top+22?gy(b)+22:gy(b)-9;body+=`<text x="${x}" y="${y}" text-anchor="${end?'end':'start'}" font-size="18">${b}</text>`;});
 if(world){const y=18+i*23,px=left+(right-left)*state.x/m.trackMax;body+=`<line x1="${left}" y1="${y}" x2="${right}" y2="${y}" stroke="#c0cbc4" stroke-width="2"/><circle data-world-point="${i}" data-x="${state.x}" data-s="${state.s}" data-v="${state.v}" cx="${px}" cy="${y}" r="6" fill="${c}"/><text x="3" y="${y+5}" font-size="13">${i+1}</text>`;}});
 return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escape(yLabel(m))}, aika vaakasuunnassa. Mallin aika ${fmt(t)} s."><g fill="#153c34" font-family="sans-serif">${body}</g></svg>`;
}
export function readout(m,t){return`Mallin aika ${fmt(t)} s. `+m.tracks.map((a,i)=>{const s=stateAt(m,i,t);return`${a.name}: ${m.quantity==='velocity'?'nopeus '+fmt(s.ordinate)+' m/s, kuljettu matka '+fmt(s.s)+' m':m.quantity==='path'?'kuljettu matka '+fmt(s.ordinate)+' m':'etäisyys lähtöön '+fmt(s.ordinate)+' m, kuljettu matka '+fmt(s.s)+' m'}.`;}).join(' ');}
export function table(m,extraTimes=[],actor=null){if(!validateModel(m)||actor!==null&&!integer(actor,0,m.tracks.length-1)||!Array.isArray(extraTimes)||!dense(extraTimes,extraTimes.length)||extraTimes.some(t=>!integer(t,0,m.axes.tMax)))throw RangeError('Unsupported table declaration');const indices=actor===null?m.tracks.map((_,i)=>i):[actor];const times=[...new Set([...m.tracks.flatMap(a=>a.points.map(p=>p[0])),...extraTimes])].sort((a,b)=>a-b);return`<table><caption>${escape(m.name)}. ${escape(yLabel(m))}.</caption><thead><tr><th scope="col">Aika (s)</th>${indices.map(i=>`<th scope="col">${escape(m.tracks[i].name)}</th>`).join('')}</tr></thead><tbody>${times.map(t=>`<tr><th scope="row">${t}</th>${indices.map(i=>`<td>${exactText(exactValueAt(m,i,t))}</td>`).join('')}</tr>`).join('')}</tbody></table>`;}
export function linearOn(m,actor,a,b){
 const mean=slope(m,actor,a,b),times=[a,...m.tracks[actor].points.map(p=>p[0]).filter(t=>t>a&&t<b),b];
 return times.slice(1).every((t,i)=>eq(slope(m,actor,times[i],t),mean));
}
export function interpretation(m,actor,a,b){if(!linearOn(m,actor,a,b))throw RangeError('Nonuniform interval cannot have a single trend label');const d=slope(m,actor,a,b);if(m.quantity==='velocity')return d.n>0n?'increase':d.n<0n?'decrease':exactValueAt(m,actor,a).n===0n?'rest':'steady';return d.n===0n?'rest':d.n<0n?'return':'advance';}
export function validateTask(t){
 if(!t||typeof t!=='object'||!own(MODELS,t.model))return false;
 const extra={slope:['actor','t0','t1'],ordinate:['actor','time'],trend:['actor','t0','t1'],compare:['t0','t1'],phases:['actor'],segmentRates:['actor'],build:['actor','t0','t1']};
 if(!own(extra,t.op)||!exact(t,['name','op','model','q','help','explain',...extra[t.op]])||['name','q','help','explain'].some(k=>typeof t[k]!=='string'||!t[k].length||t[k].length>1200))return false;
 const m=MODELS[t.model];if(!validateModel(m))return false;
 if(t.op!=='compare'&&!integer(t.actor,0,m.tracks.length-1))return false;
 if(t.op==='ordinate'){if(!integer(t.time,0,m.axes.tMax)||t.time%m.axes.tStep)return false;const value=exactValueAt(m,t.actor,t.time);return value.n%(value.d*BigInt(m.axes.yStep))===0n;}
 if(t.op==='phases')return true;
 if(t.op==='segmentRates')return m.quantity==='path'||m.quantity==='velocity';
 if(!integer(t.t0,0,m.axes.tMax)||!integer(t.t1,0,m.axes.tMax)||t.t0>=t.t1)return false;
 if(t.op==='build')return m.quantity==='velocity';
 if(t.op==='slope')return m.quantity==='path'||m.quantity==='velocity';
 if(t.op==='trend')return linearOn(m,t.actor,t.t0,t.t1);
 return m.quantity==='path'&&m.tracks.length===2&&linearOn(m,0,t.t0,t.t1)&&linearOn(m,1,t.t0,t.t1);
}
export function expected(k){const t=getTask(k),m=getModel(t.model);if(t.op==='slope')return[slope(m,t.actor,t.t0,t.t1)];if(t.op==='ordinate')return[exactValueAt(m,t.actor,t.time)];if(t.op==='trend')return[interpretation(m,t.actor,t.t0,t.t1)];if(t.op==='compare'){if(m.quantity!=='path'||m.tracks.length!==2)throw RangeError('Unsupported comparison');const d=sub(slope(m,0,t.t0,t.t1),slope(m,1,t.t0,t.t1));return[d.n===0n?'same':d.n>0n?'0':'1'];}if(t.op==='phases'){const p=m.tracks[t.actor]?.points;if(!p)throw RangeError('Unsupported phase track');return p.slice(1).map((r,i)=>interpretation(m,t.actor,p[i][0],r[0]));}if(t.op==='segmentRates'){const p=m.tracks[t.actor].points;return p.slice(1).map((r,i)=>slope(m,t.actor,p[i][0],r[0]));}if(t.op==='build'){if(m.quantity!=='velocity')throw RangeError('Unsupported acceleration build');const dv=sub(exactValueAt(m,t.actor,t.t1),exactValueAt(m,t.actor,t.t0)),dt=rat(t.t1-t.t0);return[dv,dt,div(dv,dt)];}throw RangeError('Unsupported declared assessment operation');}
export function phaseLabels(m){if(!validateModel(m))throw RangeError('Unsupported phase context');if(m.quantity==='velocity')return{increase:'Nopeus kasvaa',steady:'Liikkuu tasaisesti',decrease:'Nopeus pienenee',rest:'Paikallaan (0)'};if(m.quantity==='path')return{advance:'Liikkuu',rest:'On paikallaan'};return{advance:'Etääntyy lähdöstä',return:'Lähestyy lähtöä',rest:'Etäisyys ei muutu'};}
const outcome=(state,text)=>({state,ok:state==='correct',text});
export function check(k,answers){if(!own(TASKS,k))return outcome('invalid','Valitse annettu tehtävä.');let want;try{want=expected(k);}catch{return outcome('invalid','Tehtävän malli tai toiminto ei ole tuettu.');}if(!dense(answers,want.length)||answers.some(a=>typeof a!=='string'))return outcome('invalid','Täydennä pyydetyt kentät ilman lisäkenttiä.');if(answers.some(a=>!a.trim()))return outcome('missing','Täydennä vastaukset. Nolla kirjoitetaan 0.');const values=answers.map((a,i)=>typeof want[i]==='string'?a:parseNumber(a));if(values.some(a=>a===undefined||a===null))return outcome('invalid','Kirjoita luku tai kokonaislukujen murtoluku. Käytä pilkkua tai pistettä.');const ok=want.every((v,i)=>typeof v==='string'?values[i]===v:eq(v,values[i]));const t=getTask(k),m=getModel(t.model);if(want.some((v,i)=>typeof v==='string'&&!(t.op==='compare'?['0','1','same'].includes(answers[i]):Object.hasOwn(phaseLabels(m),answers[i]))))return outcome('invalid','Valitse annettu kuvaus.');return outcome(ok?'correct':'retry',ok?'Kyllä. '+t.explain:t.help);}
export function validateCatalog(){for(const m of Object.values(MODELS))if(!validateModel(m))throw RangeError('Unsupported authored model');if(!own(MODELS,DEFAULT_MODEL)||!own(TASKS,DEFAULT_TASK))throw RangeError('Missing authored default reference');for(const k of Object.keys(TASKS))expected(k);return true;}
export function answerFields(k){
 const t=getTask(k),m=getModel(t.model),numeric=label=>({kind:'numeric',label}),choices=(label,options)=>({kind:'choice',label,options});
 const unit=m.quantity==='velocity'?'m/s²':'m/s';
 if(t.op==='compare')return[choices('Kumpi liikkuu nopeammin?',{'0':m.tracks[0].name,'1':m.tracks[1].name,same:'Sama nopeus'})];
 if(t.op==='trend')return[choices('Mikä kuvaus sopii?',phaseLabels(m))];
 if(t.op==='phases')return m.tracks[t.actor].points.slice(1).map((r,i)=>choices(`${m.tracks[t.actor].points[i][0]}–${r[0]} s`,phaseLabels(m)));
 if(t.op==='segmentRates')return m.tracks[t.actor].points.slice(1).map((r,i)=>numeric(`${m.tracks[t.actor].points[i][0]}–${r[0]} s (${unit})`));
 if(t.op==='build')return[numeric('Nopeuden muutos (m/s)'),numeric('Kulunut aika (s)'),numeric('Keskimääräinen kiihtyvyys (m/s²)')];
 if(t.op==='ordinate')return[numeric(m.quantity==='velocity'?'Nopeus (m/s)':m.quantity==='path'?'Kuljettu matka (m)':'Etäisyys lähtöön (m)')];
 return[numeric(m.quantity==='velocity'?'Keskimääräinen kiihtyvyys (m/s²)':'Keskinopeus tällä välillä (m/s)')];
}
export function fieldMarkup(k){return answerFields(k).map(f=>`<label>${escape(f.label)}${f.kind==='numeric'?'<input data-answer type="text" inputmode="text" maxlength="128" autocomplete="off">':`<select data-answer><option value="">Valitse</option>${Object.entries(f.options).map(([v,l])=>`<option value="${escape(v)}">${escape(l)}</option>`).join('')}</select>`}</label>`).join('');}
export function legend(m){return m.tracks.map((a,i)=>`${i+1}. ${a.name} (${i?'katko':'yhtenäinen'})`).join(' · ');}
export function taskGraphic(k){const t=getTask(k),m=getModel(t.model);return graph(m,t.op==='ordinate'?t.time:t.t0??0,false,t.op==='compare'?null:t.actor,t.op==='segmentRates'||t.op==='phases');}
export function taskLegend(k){const t=getTask(k),m=getModel(t.model);return t.op==='compare'?legend(m):m.tracks[t.actor].name;}
export function taskTable(k){const t=getTask(k),m=getModel(t.model);return table(m,[t.time,t.t0,t.t1].filter(v=>Number.isSafeInteger(v)),t.op==='compare'?null:t.actor);}
export function mount(host){
 const root=host.previousElementSibling?.querySelector('[data-physics14]');if(!root)throw Error('Missing own preceding article root');owners.get(root)?.dispose();
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
   const t=getTask(k);q('[data-question]').textContent=t.q;q('[data-task-view]').innerHTML=taskGraphic(k);q('[data-task-legend]').textContent=taskLegend(k);q('[data-task-table]').innerHTML=taskTable(k);q('[data-answer-fields]').innerHTML=fieldMarkup(k);q('[data-task-help]').textContent=t.help;enable();signature=JSON.stringify([k,...answers()]);return true;
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
  q('[data-model-view]').innerHTML=graph(m,time,true);q('[data-readout]').textContent=readout(m,time);q('[data-time]').value=String(Number(time.toFixed(6))).replace('.',',');timeText=q('[data-time]').value;
  if(tableKey!==modelKey){q('[data-model-table]').innerHTML=table(m);q('[data-model-legend]').textContent=legend(m);q('[data-model-description]').textContent=`Mallin aika 0–${m.axes.tMax} s. Askel on ${fmt(m.step)} s. Koko toisto kestää ${fmt(m.playbackSeconds)} ruutusekuntia. Suora kulkureitti 0–${m.trackMax} m on eri kuva kuin sen alla oleva kuvaaja.${m.quantity==='distance_from_start'?' Pystyakselilla on nyt etäisyys lähtöön. Paluukin kasvattaa kuljettua matkaa.':''}`;q('[data-action=step]').textContent=`Askel ${fmt(m.step)} s`;tableKey=modelKey;}
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
  pause(){if(disposed)return;stop();paused=true;const m=syncModel();if(m)draw(m);enable();},
  resume(){if(disposed)return;paused=false;syncTask();const m=syncModel();if(m)draw(m);enable();},
  reset(){if(disposed)return;stop();q('[data-model]').value=DEFAULT_MODEL;q('[data-task]').value=DEFAULT_TASK;modelKey=null;tableKey=null;taskKey=null;signature='';syncTask();const m=syncModel();if(m)draw(m);neutral();enable();},
  dispose(){if(disposed)return;stop();disposed=true;root.removeEventListener('click',click);root.removeEventListener('input',edit);root.removeEventListener('change',edit);root.removeEventListener('keydown',keydown);if(owners.get(root)===api)owners.delete(root);}
 };
 root.addEventListener('click',click);root.addEventListener('input',edit);root.addEventListener('change',edit);root.addEventListener('keydown',keydown);owners.set(root,api);api.reset();return api;
}

export const DEFAULT_MODEL="journey";
export const DEFAULT_TASK="read";
export const MODELS=deepFreeze({"journey":{"name":"Matka ja tauko","kind":"linear_timeline","quantity":"path","origin":0,"motion":"forward_only","lengthUnit":"m","timeUnit":"s","axes":{"tMax":10,"tStep":2,"yMax":40,"yStep":10},"trackMax":40,"step":2,"playbackSeconds":10,"controls":["play","pause","step","end","restart"],"tracks":[{"name":"Loikka","points":[[0,0],[10,30]]},{"name":"Aava","points":[[0,0],[4,20],[6,20],[10,28]]}]},"flat":{"name":"Tauko keskellä matkaa","kind":"linear_timeline","quantity":"path","origin":0,"motion":"forward_only","lengthUnit":"m","timeUnit":"s","axes":{"tMax":10,"tStep":2,"yMax":30,"yStep":5},"trackMax":30,"step":2,"playbackSeconds":10,"controls":["play","pause","step","end","restart"],"tracks":[{"name":"Loikka","points":[[0,0],[2,10],[6,10],[10,26]]}]},"steady":{"name":"Suora kuvaaja","kind":"linear_timeline","quantity":"path","origin":0,"motion":"forward_only","lengthUnit":"m","timeUnit":"s","axes":{"tMax":10,"tStep":2,"yMax":40,"yStep":10},"trackMax":40,"step":2,"playbackSeconds":10,"controls":["play","pause","step","end","restart"],"tracks":[{"name":"Loikka","points":[[0,0],[10,40]]}]},"return":{"name":"Eri pystyakseli: etäisyys lähdöstä","kind":"linear_timeline","quantity":"distance_from_start","origin":0,"motion":"positive_axis_position","lengthUnit":"m","timeUnit":"s","axes":{"tMax":8,"tStep":2,"yMax":20,"yStep":5},"trackMax":20,"step":2,"playbackSeconds":8,"controls":["play","pause","step","end","restart"],"tracks":[{"name":"Aava","points":[[0,0],[4,20],[8,0]]}]}});
export const TASKS=deepFreeze({"read":{"name":"Tehtävä A","op":"slope","model":"steady","q":"Viiva on suora. Lue kuvaajasta Loikan nopeus, m/s.","help":"Valitse kaksi kohtaa. Laske matkan kasvu ja jaa kuluneella ajalla. Lopun korkeus yksin on matka, ei nopeus.","explain":"Matka kasvaa 40 m ajassa 10 s: 40/10 = 4 m/s.","actor":0,"t0":0,"t1":10},"pause":{"name":"Tehtävä B","op":"trend","model":"flat","q":"Mitä Loikka tekee välillä 2–6 s?","help":"Katso, kasvaako kuljettu matka tämän välin aikana. Vaakasuoralla osalla matka ei kasva.","explain":"Kuljettu matka pysyy 10 metrissä välillä 2–6 s. Loikka on paikallaan.","actor":0,"t0":2,"t1":6},"higher":{"name":"Tehtävä C","op":"compare","model":"journey","q":"Kumpi liikkuu nopeammin välillä 4–6 s?","help":"Vertaile saman aikavälin nousua, älä pelkkää korkeutta. Aavan kuljettu matka pysyy 20 metrissä.","explain":"Loikka kulkee 3 m/s. Aava lepää, vaikka hänen viivansa on tällä välillä korkeammalla.","t0":4,"t1":6},"start":{"name":"Tehtävä D","op":"compare","model":"journey","q":"Kumpi liikkuu nopeammin välillä 0–4 s?","help":"Vertaile, kuinka paljon kummankin matka kasvaa neljässä sekunnissa.","explain":"Aava kulkee 20 m, Loikka 12 m samassa neljässä sekunnissa. Aavan nopeus on suurempi.","t0":0,"t1":4},"story":{"name":"Tehtävä E","op":"segmentRates","model":"journey","q":"Lue Aavan nopeus jokaisella kolmella aikavälillä, m/s.","help":"Laske jokaisella välillä matkan kasvu ja jaa välin pituudella. Tauolla kasvu on 0.","explain":"Aavan nopeudet ovat 5 m/s, 0 m/s ja 2 m/s. Hän kulkee, lepää ja jatkaa hitaammin.","actor":1},"transfer":{"name":"Tehtävä F","op":"trend","model":"return","q":"Pystyakselilla on nyt etäisyys lähdöstä. Mitä Aava tekee välillä 4–8 s?","help":"Etäisyys lähtöön pienenee, kun kuljetaan takaisin. Kuljettu matka ei silti vähene. Kuvaaja ei esitä mäkeä.","explain":"Aava palaa kohti lähtöä. Etäisyys pienenee 20 metristä nollaan, mutta kuljettu matka kasvaa vielä 20 m.","actor":0,"t0":4,"t1":8}});
validateCatalog();
