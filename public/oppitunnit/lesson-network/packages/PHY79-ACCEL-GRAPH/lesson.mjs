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
 if(!integer(a.tMax,1,12)||!integer(a.tStep,1,a.tMax)||a.tMax%a.tStep||a.tMax/a.tStep>(a.tMax>=10?4:8))return false;
 for(const[max,step,bound]of[[a.xMax,a.xStep,99],[a.vMax,a.vStep,40]])if(!integer(max,1,bound)||!integer(step,1,max)||max%step||max/step>5)return false;
 if(typeof m.step!=='number'||!Number.isFinite(m.step)||m.step<=0||m.step>a.tMax||Number(m.step.toFixed(6))!==m.step||!Number.isInteger(a.tMax/m.step)||!Number.isInteger(m.playbackSeconds)||m.playbackSeconds<1||m.playbackSeconds>20)return false;
 if(!dense(m.controls,CONTROLS.length)||!m.controls.every((x,i)=>x===CONTROLS[i])||!Array.isArray(m.tracks)||!dense(m.tracks,m.tracks.length)||m.tracks.length<1||m.tracks.length!==1)return false;
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

export const REPRESENTATION='paired_position_velocity';
export function compatible(p,v){if(!validateModel(p)||!validateModel(v)||p.axes.tMax!==v.axes.tMax)throw RangeError('Unsupported common time horizon');const ts=[...new Set([...p.tracks[0].points,...v.tracks[0].points].map(r=>r[0]))];return ts.every(t=>eq(exactStateAt(p,0,t).v,exactStateAt(v,0,t).v));}
export function pairedGraph(p,v,t,world=false){
 if(REPRESENTATION!=='paired_position_velocity'||!validateModel(p)||!validateModel(v)||p.axes.tMax!==v.axes.tMax||!validTime(p,t)||typeof world!=='boolean'||world&&!compatible(p,v))throw RangeError('Unsupported paired representation');
 const top=world?62:34,bottom=top+112,height=bottom+54;let out='';const text=(x,y,s,anchor='start')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="20">${esc(s)}</text>`;
 if(world){const left=32,right=342,y=16,X=x=>left+(right-left)*x/p.axes.xMax,s=stateAt(p,0,t);out+=`<line x1="${left}" x2="${right}" y1="${y}" y2="${y}" stroke="#b9c6be"/>`;for(let u=0;u<=t;u+=p.strobeSeconds){const a=stateAt(p,0,u);out+=`<circle data-strobe-t="${u}" data-x="${a.x}" cx="${X(a.x)}" cy="${y}" r="3" fill="#145f87"/>`;}out+=`<circle data-world-point="" data-t="${t}" data-x="${s.x}" data-v="${s.v}" cx="${X(s.x)}" cy="${y}" r="6" fill="#145f87"/>`;}
 for(const[k,c,left,right]of[['position',p,32,166],['velocity',v,208,342]]){
  const a=c.axes,max=k==='position'?a.xMax:a.vMax,step=k==='position'?a.xStep:a.vStep,X=u=>left+(right-left)*u/a.tMax,Y=value=>bottom-112*value/max,s=stateAt(c,0,t),value=k==='position'?s.x:s.v;
  out+=text(left,top-12,k==='position'?'Paikka (m)':'Nopeus (m/s)');for(let u=0;u<=a.tMax;u+=a.tStep)out+=`<line x1="${X(u)}" x2="${X(u)}" y1="${top}" y2="${bottom}" stroke="#c2cdc5"/>`+text(X(u),bottom+22,u,'middle');for(let value=0;value<=max;value+=step)out+=`<line x1="${left}" x2="${right}" y1="${Y(value)}" y2="${Y(value)}" stroke="#c2cdc5"/>`+text(left-5,Y(value)+6,value,'end');out+=text(right,bottom+48,'t (s)','end');
  let path='';if(k==='position')for(const z of curveSegments(c,0)){if(!path)path=`M${X(z.t0)} ${Y(z.x0)}`;path+=z.v0===z.v1?` L${X(z.t1)} ${Y(z.x1)}`:` Q${X((z.t0+z.t1)/2)} ${Y(z.xc)} ${X(z.t1)} ${Y(z.x1)}`;}else path=c.tracks[0].points.map(([u,y],i)=>(i?'L':'M')+X(u)+' '+Y(y)).join(' ');
  out+=`<g data-graph-kind="${k}"><path data-curve="${k}" d="${path}" fill="none" stroke="#145f87" stroke-width="3"/><line x1="${X(t)}" x2="${X(t)}" y1="${top}" y2="${bottom}" stroke="#355d4c" stroke-dasharray="3 4"/><circle data-graph-point="${k}" data-t="${t}" data-value="${value}" cx="${X(t)}" cy="${Y(value)}" r="5" fill="#145f87" stroke="#fff" stroke-width="2"/></g>`;
 }
 return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 ${height}" role="img" aria-label="Vasemmalla paikka ajan funktiona, oikealla nopeus ajan funktiona. Sama kellonhetki ${fmt(t)} s. ${world?'Suora kulkureitti ylimpänä.':'Molemmissa kuvissa on sama aika-alue.'}"><g font-family="sans-serif" fill="#153c34">${out}</g></svg>`;
}
export function readout(m,t){const s=stateAt(m,0,t);return`Likiarvot: t = ${fmt(t)} s, x = ${fmt(s.x)} m, v = ${fmt(s.v)} m/s.`;}
export function table(p,v=p){if(!validateModel(p)||!validateModel(v)||p.axes.tMax!==v.axes.tMax)throw RangeError('Unsupported paired table');return`<table><caption>Vasemman kuvan paikka ja oikean kuvan nopeus samalla kellonhetkellä</caption><thead><tr><th scope="col">t (s)</th><th scope="col">x (m)</th><th scope="col">v (m/s)</th></tr></thead><tbody>${Array.from({length:p.axes.tMax+1},(_,t)=>`<tr><th scope="row">${t}</th><td>${exactText(exactStateAt(p,0,t).x)}</td><td>${exactText(exactStateAt(v,0,t).v)}</td></tr>`).join('')}</tbody></table>`;}
export const POSITION_OPTIONS=deepFreeze({flat:'Vaakasuora',line:'Suora ja nouseva',steeper:'Nousee ja jyrkkenee',flatter:'Nousee ja loivenee'});
export const VELOCITY_OPTIONS=deepFreeze({zero:'Nollassa',flat:'Vaakasuora nollan yläpuolella',rising:'Nouseva suora',falling:'Laskeva suora'});
export const MATCH_OPTIONS=deepFreeze({yes:'Voivat kuvata samaa liikettä',no:'Eivät voi kuvata samaa liikettä'});
export function validateTask(t){if(!t||typeof t!=='object'||!['pair','match'].includes(t.op))return false;const names=['label','op','q','help','explain',...(t.op==='pair'?['model','t0','t1']:['position','velocity'])];if(!exact(t,names)||['label','q','help','explain'].some(k=>typeof t[k]!=='string'||!t[k].length||t[k].length>1200))return false;if(t.op==='match')return own(MODELS,t.position)&&own(MODELS,t.velocity)&&validateModel(MODELS[t.position])&&validateModel(MODELS[t.velocity])&&MODELS[t.position].axes.tMax===MODELS[t.velocity].axes.tMax;if(!own(MODELS,t.model)||!validateModel(MODELS[t.model]))return false;const m=MODELS[t.model];return integer(t.t0,0,m.axes.tMax)&&integer(t.t1,0,m.axes.tMax)&&t.t0<t.t1&&linearOn(m,0,t.t0,t.t1);}
export function getTask(k){if(!own(TASKS,k)||!validateTask(TASKS[k]))throw RangeError('Unsupported paired task');return TASKS[k];}
export function expected(k){const t=getTask(k);if(t.op==='match')return[compatible(getModel(t.position),getModel(t.velocity))?'yes':'no'];const motion=motionLabel(getModel(t.model),0,t.t0,t.t1);return{rest:['flat','zero'],steady:['line','flat'],increase:['steeper','rising'],decrease:['flatter','falling']}[motion];}
export function fieldMarkup(k){const t=getTask(k),rows=t.op==='pair'?[['Paikka–aika-kuvaaja',POSITION_OPTIONS],['Nopeus–aika-kuvaaja',VELOCITY_OPTIONS]]:[['Kuvaavatko kuvat samaa liikettä?',MATCH_OPTIONS]];return rows.map(([label,opts])=>`<label>${label}<select data-answer><option value="">Valitse</option>${Object.entries(opts).map(([v,s])=>`<option value="${v}">${s}</option>`).join('')}</select></label>`).join('');}
export function check(k,answers){const fail=(state,text)=>({state,ok:state==='correct',text});if(!own(TASKS,k))return fail('invalid','Valitse annettu tehtävä.');const t=getTask(k),want=expected(k);if(!dense(answers,want.length)||answers.some(a=>typeof a!=='string'))return fail('invalid','Täydennä vain pyydetyt kentät.');if(answers.some(a=>!a.trim()))return fail('missing','Valitse kaikki pyydetyt kuvaukset.');const opts=t.op==='pair'?[POSITION_OPTIONS,VELOCITY_OPTIONS]:[MATCH_OPTIONS];if(answers.some((a,i)=>!own(opts[i],a)))return fail('invalid','Valitse annetut kuvaukset.');const ok=answers.every((a,i)=>a===want[i]),parts=answers.map((a,i)=>a===want[i]);return{...fail(ok?'correct':'retry',ok?'Kyllä. '+t.explain:t.op==='pair'?`${parts[0]?'Paikkakuvaajan kuvaus sopii.':'Tarkista paikkakuvaajan jyrkkyyden muutos.'} ${parts[1]?'Nopeuskuvaajan kuvaus sopii.':'Tarkista nopeusviivan korkeus ja suunta.'} ${t.help}`:t.help),parts};}
export function taskGraphic(k){const t=getTask(k),p=getModel(t.op==='pair'?t.model:t.position),v=getModel(t.op==='pair'?t.model:t.velocity);return pairedGraph(p,v,t.op==='pair'?t.t0:0,false);}
export function taskTable(k){const t=getTask(k);return table(getModel(t.op==='pair'?t.model:t.position),getModel(t.op==='pair'?t.model:t.velocity));}
export function validateCatalog(){if(REPRESENTATION!=='paired_position_velocity')throw RangeError('Unsupported representation');for(const m of Object.values(MODELS))if(!validateModel(m))throw RangeError('Unsupported authored paired motion');if(!own(MODELS,DEFAULT_MODEL)||!own(TASKS,DEFAULT_TASK))throw RangeError('Missing declared defaults');for(const k of Object.keys(TASKS))expected(k);return true;}

// Context examples borrow the live model without submitting or replacing practice work.
function createModelContext(capture, apply, initial) {
 const saved = new Map(); let active = null;
 function transition({action, key, preset} = {}) {
  if (action === 'leave') {
   if (!active || (key && key !== active.key)) return;
   saved.set(active.key, capture()); const previous = active.previous; active = null; apply(previous); return;
  }
  if (action !== 'enter' || !preset) return;
  if (typeof key !== 'string' || !key) throw new RangeError('Missing model context key');
  if (active) transition({action: 'leave', key: active.key});
  const next = saved.has(key) ? saved.get(key) : initial(preset);
  const previous = capture(); apply(next); active = {key, previous};
 }
 return {transition, clear() { saved.clear(); active = null; }};
}

export function mount(host){
 const area=host.matches?.('[data-lesson-module]')?(host.previousElementSibling?.matches?.('article')?host.previousElementSibling:null):host,root=area?.matches?.('[data-graph16]')?area:area?.querySelector('[data-graph16]');if(!root)throw Error('Missing own graph article root');owners.get(root)?.dispose();
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
   const t=getTask(k);q('[data-question]').textContent=t.q;q('[data-task-view]').innerHTML=taskGraphic(k);q('[data-task-legend]').textContent=t.op==='match'?'Vertailupari: tutki, voiko se kuvata yhtä liikettä.':'Kaksi kuvaa samasta liikkeestä.';q('[data-task-table]').innerHTML=taskTable(k);q('[data-answer-fields]').innerHTML=fieldMarkup(k);q('[data-task-help]').textContent=t.help;enable();signature=JSON.stringify([k,...answers()]);return true;
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
  q('[data-model-view]').innerHTML=pairedGraph(m,m,time,true);q('[data-readout]').textContent=readout(m,time);q('[data-time]').value=String(Number(time.toFixed(6))).replace('.',',');timeText=q('[data-time]').value;
  if(tableKey!==modelKey){q('[data-model-table]').innerHTML=table(m);q('[data-model-legend]').textContent=m.tracks[0].name+' · yksi kellonhetki';q('[data-model-description]').textContent=`Mallin aika 0–${m.axes.tMax} s. Askel ${exactText(parseNumber(String(m.step)))} s, ajanmerkkien väli ${fmt(m.strobeSeconds)} s. Koko toisto ${fmt(m.playbackSeconds)} ruutusekuntia. Kulkureitin paikka-asteikko 0–${m.axes.xMax} m on eri asia kuin alla oleva kuvaaja.`;q('[data-action=step]').textContent=`Askel ${exactText(parseNumber(String(m.step)))} s`;tableKey=modelKey;}
  q('[data-action=play]').setAttribute('aria-pressed',String(playing));q('[data-run-state]').textContent=playing?'Toisto käynnissä':time===m.axes.tMax?'Toiston loppukuva, ei fyysinen pysäytys.':'Toisto tauolla';
 }
 function tick(now){
  raf=null;if(disposed||paused||!playing)return;syncTask();const m=syncModel();if(!m)return;if(!playing){draw(m);return;}
  const elapsed=lastStamp===null?0:(now-lastStamp)/1000;lastStamp=now;time=Math.min(m.axes.tMax,time+elapsed*m.axes.tMax/m.playbackSeconds);if(time===m.axes.tMax)stop();draw(m);if(playing)raf=win.requestAnimationFrame(tick);
 }
 function click(e){
  if(disposed||paused)return;const changed=syncTask(),m=syncModel();if(m)draw(m);const action=e.target.closest('[data-action]')?.dataset.action;if(!action)return;
  if(action==='check'){
   if(m)draw(m);if(changed){neutral('Tehtävä vaihtui. Täydennä tämän tehtävän vastaukset.');return;}
   feedback(check(q('[data-task]').value,answers()));signature=JSON.stringify([taskKey,...answers()]);return;
  }
  if(!m)return;
  if(action==='play'){if(time===m.axes.tMax)time=0;playing=true;lastStamp=null;if(raf===null)raf=win.requestAnimationFrame(tick);}
  else if(action==='pause')stop();else if(action==='step'){stop();time=Math.min(m.axes.tMax,time+m.step);}else if(action==='end'){stop();time=m.axes.tMax;}else if(action==='restart'){stop();time=0;}
  draw(m);
 }
 function edit(e){if(disposed||paused||!e.target.matches('[data-task],[data-answer],[data-model],[data-time]'))return;syncTask();const m=syncModel();if(m)draw(m);}
 function keydown(e){if(!disposed&&!paused&&e.key==='Enter'&&e.target.matches('input[data-answer]')){e.preventDefault();q('[data-action=check]').click();}}
 const modelContext = createModelContext(
  () => ({modelKey, modelValue: q('[data-model]').value, time, timeText, rawTime: q('[data-time]').value}),
  state => { stop(); modelKey = state.modelKey; q('[data-model]').value = state.modelValue; time = state.time; timeText = state.timeText; q('[data-time]').value = state.rawTime; tableKey = null; const model = syncModel(); if (model) draw(model); enable(); },
  preset => { if (preset !== 'phases') throw new RangeError('Unsupported graph context'); return {modelKey: 'phases', modelValue: 'phases', time: 0, timeText: '0', rawTime: '0'}; }
 );
 const api={
  context(request){if(!disposed)modelContext.transition(request);},
  pause(){if(disposed)return;stop();syncTask();paused=true;const m=syncModel();if(m)draw(m);enable();},
  resume(){if(disposed)return;paused=false;syncTask();const m=syncModel();if(m)draw(m);enable();},
  reset(){if(disposed)return;modelContext.clear();stop();q('[data-model]').value=DEFAULT_MODEL;q('[data-task]').value=DEFAULT_TASK;modelKey=null;tableKey=null;taskKey=null;signature='';syncTask();const m=syncModel();if(m)draw(m);neutral();enable();},
  dispose(){if(disposed)return;modelContext.clear();stop();syncTask();const m=syncModel();if(m)draw(m);disposed=true;root.removeEventListener('click',click);root.removeEventListener('input',edit);root.removeEventListener('change',edit);root.removeEventListener('keydown',keydown);if(owners.get(root)===api)owners.delete(root);}
 };
 root.addEventListener('click',click);root.addEventListener('input',edit);root.addEventListener('change',edit);root.addEventListener('keydown',keydown);owners.set(root,api);api.reset();return api;
}

export const DEFAULT_MODEL="increase";
export const DEFAULT_TASK="steady";
export const MODELS=deepFreeze({"increase": {"name": "Nopeus kasvaa", "kind": "linear_velocity_timeline", "origin": 0, "direction": "positive_axis", "lengthUnit": "m", "timeUnit": "s", "axes": {"tMax": 4, "tStep": 1, "xMax": 16, "xStep": 4, "vMax": 8, "vStep": 2}, "step": 1, "playbackSeconds": 4, "strobeSeconds": 1, "controls": ["play", "pause", "step", "seek", "end", "restart"], "tracks": [{"name": "Loikka", "points": [[0, 0], [4, 8]]}]}, "decrease": {"name": "Loikka jarruttaa", "kind": "linear_velocity_timeline", "origin": 0, "direction": "positive_axis", "lengthUnit": "m", "timeUnit": "s", "axes": {"tMax": 4, "tStep": 1, "xMax": 16, "xStep": 4, "vMax": 8, "vStep": 2}, "step": 1, "playbackSeconds": 4, "strobeSeconds": 1, "controls": ["play", "pause", "step", "seek", "end", "restart"], "tracks": [{"name": "Loikka", "points": [[0, 8], [4, 0]]}]}, "steady": {"name": "Tasainen liike", "kind": "linear_velocity_timeline", "origin": 0, "direction": "positive_axis", "lengthUnit": "m", "timeUnit": "s", "axes": {"tMax": 4, "tStep": 1, "xMax": 16, "xStep": 4, "vMax": 8, "vStep": 2}, "step": 1, "playbackSeconds": 4, "strobeSeconds": 1, "controls": ["play", "pause", "step", "seek", "end", "restart"], "tracks": [{"name": "Loikka", "points": [[0, 4], [4, 4]]}]}, "rest": {"name": "Paikallaan, kello käy", "kind": "linear_velocity_timeline", "origin": 0, "direction": "positive_axis", "lengthUnit": "m", "timeUnit": "s", "axes": {"tMax": 4, "tStep": 1, "xMax": 16, "xStep": 4, "vMax": 8, "vStep": 2}, "step": 1, "playbackSeconds": 4, "strobeSeconds": 1, "controls": ["play", "pause", "step", "seek", "end", "restart"], "tracks": [{"name": "Loikka", "points": [[0, 0], [4, 0]]}]}, "phases": {"name": "Lepo, lähtö, kävely ja jarrutus", "kind": "linear_velocity_timeline", "origin": 0, "direction": "positive_axis", "lengthUnit": "m", "timeUnit": "s", "axes": {"tMax": 7, "tStep": 1, "xMax": 20, "xStep": 4, "vMax": 4, "vStep": 1}, "step": 1, "playbackSeconds": 7, "strobeSeconds": 1, "controls": ["play", "pause", "step", "seek", "end", "restart"], "tracks": [{"name": "Loikka", "points": [[0, 0], [1, 0], [3, 4], [5, 4], [7, 0]]}]}, "rescale": {"name": "Sama liike, eri pystyasteikot", "kind": "linear_velocity_timeline", "origin": 0, "direction": "positive_axis", "lengthUnit": "m", "timeUnit": "s", "axes": {"tMax": 4, "tStep": 1, "xMax": 20, "xStep": 5, "vMax": 12, "vStep": 3}, "step": 1, "playbackSeconds": 4, "strobeSeconds": 1, "controls": ["play", "pause", "step", "seek", "end", "restart"], "tracks": [{"name": "Loikka", "points": [[0, 0], [4, 8]]}]}});
export const TASKS=deepFreeze({"increase":{"label":"Tehtävä A","op":"pair","model":"increase","t0":0,"t1":4,"q":"Valitse molempiin kuvaajiin sopiva kuvaus. Miten sama nopeuden kasvu näkyy niissä?","help":"Paikkakäyrän jyrkkyys kertoo nopeuden. Oikean kuvan korkeus kertoo saman nopeuden.","explain":"Paikkakäyrä jyrkkenee ja nopeusviiva nousee. Sekuntimatkat ovat 1, 3, 5 ja 7 m."},"decrease":{"label":"Tehtävä B","op":"pair","model":"decrease","t0":0,"t1":4,"q":"Loikka liikkuu yhä eteenpäin ja jarruttaa. Valitse molempien kuvaajien muodot.","help":"Paikka kasvaa edelleen, mutta sekuntimatkat pienenevät. Nopeusviiva laskee kohti nollaa.","explain":"Paikkakäyrä nousee loiventuen. Nopeusviiva laskee 8 m/s:sta nollaan. Loikka ei palaa lähtöpaikkaan."},"steady":{"label":"Tehtävä C","op":"pair","model":"steady","t0":0,"t1":4,"q":"Millaista viivaa tasainen liike tekee kumpaankin kuvaan?","help":"Paikka kasvaa joka sekunti 4 m. Nopeus pysyy 4 m/s:ssa, joten se ei kasva.","explain":"Paikkakuva on nouseva suora ja nopeuskuva vaakasuora nollan yläpuolella. Loikka liikkuu, vaikka nopeusviiva on vaakasuora."},"rest":{"label":"Tehtävä D","op":"pair","model":"rest","t0":0,"t1":4,"q":"Loikka on paikallaan ja kello käy. Valitse molempien kuvaajien muodot.","help":"Paikka pysyy samana. Nopeus on nolla, ei vain jokin muuttumaton positiivinen nopeus.","explain":"Paikkakuvaaja on vaakasuora. Nopeuskuvaaja on nollassa."},"phase_rest":{"label":"Tehtävä E","op":"pair","model":"phases","t0":0,"t1":1,"q":"Tutki vain väliä 0–1 s. Millainen kohta on kummassakin kuvaajassa?","help":"Alussa kello käy sekunnin, mutta Loikka ei vielä liiku.","explain":"Paikka ei muutu ja nopeus on 0. Molemmat kuvat näyttävät levon."},"phase_start":{"label":"Tehtävä F","op":"pair","model":"phases","t0":1,"t1":3,"q":"Tutki vain väliä 1–3 s. Miten lähtö ja kiihtyminen näkyvät molemmissa kuvissa?","help":"Paikkakäyrä muuttuu jyrkemmäksi samaan aikaan kun nopeusviiva nousee.","explain":"Paikka nousee jyrkkenevästi ja nopeus kasvaa 0 → 4 m/s."},"phase_steady":{"label":"Tehtävä G","op":"pair","model":"phases","t0":3,"t1":5,"q":"Tutki vain väliä 3–5 s. Kuinka tasainen kävely näkyy kahdessa kuvassa?","help":"Vertaa yhden vaiheen viivoja: paikka kasvaa yhtä paljon joka sekunti, nopeus ei muutu.","explain":"Paikan suora nousee ja nopeusviiva pysyy 4 m/s:ssa. Lepoa tämä ei ole."},"phase_brake":{"label":"Tehtävä H","op":"pair","model":"phases","t0":5,"t1":7,"q":"Tutki vain väliä 5–7 s. Valitse jarrutuksen muodot.","help":"Matkaa kertyy vähemmän sekuntia kohti. Paikka ei kuitenkaan vähene.","explain":"Paikkakäyrä loivenee nousevana ja nopeusviiva laskee nollaan."},"scaled":{"label":"Tehtävä I","op":"match","position":"increase","velocity":"rescale","q":"Voivatko nämä kuvat esittää samaa liikettä? Tarkista myös akselien luvut.","help":"Pystyasteikot ovat erilaiset. Paikkakäyrän jyrkkeneminen vastaa nopeuden kasvua 0 → 8 m/s neljässä sekunnissa.","explain":"Kyllä. Eri pystyasteikot eivät muuta samaa laskettua liikettä. Paikka päättyy 16 m:iin ja nopeus 8 m/s:iin."},"constant_trap":{"label":"Tehtävä J","op":"match","position":"increase","velocity":"steady","q":"Tämä on tutkittava vertailupari. Voivatko kuvat esittää samaa liikettä?","help":"Vasen paikkakäyrä jyrkkenee. Oikean kuvan vaakaviiva väittää nopeuden pysyvän samana.","explain":"Eivät. Jyrkkenevään paikkakäyrään tarvitaan nouseva nopeusviiva, ei tasainen 4 m/s."},"rest_trap":{"label":"Tehtävä K","op":"match","position":"steady","velocity":"rest","q":"Tarkista vertailupari. Voivatko kuvat kertoa samasta liikkeestä?","help":"Vasen näyttää paikan kasvavan joka sekunti. Oikea näyttää nollanopeutta.","explain":"Eivät. Nouseva paikan suora tarkoittaa liikettä, joten nopeus ei voi olla 0."},"brake_trap":{"label":"Tehtävä L","op":"match","position":"decrease","velocity":"increase","q":"Tarkista jarrutuksen vertailupari: sopivatko nämä kuvat yhteen?","help":"Vasen paikkakäyrä loivenee. Oikea nopeusviiva nousee. Kumpaa nopeuden muutosta kumpikin väittää?","explain":"Eivät. Loiveneva paikkakäyrä vastaa pienenevää nopeutta, mutta oikea kuva väittää nopeuden kasvavan."}});
validateCatalog();
