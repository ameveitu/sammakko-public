const freeze=x=>{Object.values(x).forEach(v=>{if(v&&typeof v==='object')freeze(v);});return Object.freeze(x);};
export const MODELS=freeze({jump:{name:'12metrin kulku',startClock:0,legs:[[0,12,4]]},walk:{name:'Lyhyempi matka, pidempi aika',startClock:0,legs:[[0,8,6]]},back:{name:'Takaisin lähtöön',startClock:0,legs:[[0,6,3],[6,0,3]]},offset:{name:'Mittarit eivät ala nollasta',startClock:10,legs:[[5,17,6]]}});
function model(key){if(typeof key!=='string'||!Object.hasOwn(MODELS,key))throw new RangeError('Unsupported motion model');return MODELS[key];}
export const duration=key=>model(key).legs.reduce((n,l)=>n+l[2],0);
export function stateAt(key,ticks){
 const c=model(key),end=duration(key);if(!Number.isInteger(ticks)||ticks<0||ticks>(end+2)*10)throw new RangeError('Unsupported observation tick');
 let remaining=Math.min(ticks/10,end),distance=0,position=c.legs[0][0];
 for(const[a,b,t]of c.legs){const spent=Math.min(remaining,t);distance+=Math.abs(b-a)*spent/t;position=a+(b-a)*spent/t;remaining-=spent;if(remaining<=0)break;}
 const elapsed=Math.min(ticks/10,end);return Object.freeze({position,distance,elapsed,clock:c.startClock+elapsed,observation:ticks/10,finished:ticks>=end*10,maximumTicks:(end+2)*10});
}
export const format=n=>Number(n.toFixed(2)).toString().replace('.',',');
export function motionSVG(key,ticks){
 const s=stateAt(key,ticks),x=40+s.position*16;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 160" role="img" aria-label="Suora rata 0–20 m. Vaunun paikka ${format(s.position)} m; kuljettu matka ${format(s.distance)} m. Mitattu kesto ${format(s.elapsed)} s."><path d="M40 95H360" fill="none" stroke="#355c55" stroke-width="4"/>${[0,5,10,15,20].map(n=>`<path d="M${40+n*16} 89v16" stroke="#355c55"/><text x="${40+n*16}" y="132" text-anchor="middle" font-size="20" fill="#173e39">${n} m</text>`).join('')}<rect x="${x-12}" y="56" width="24" height="24" rx="3" fill="#397ba0"/><circle cx="${x-7}" cy="83" r="5" fill="#244c47"/><circle cx="${x+7}" cy="83" r="5" fill="#244c47"/></svg>`;
}
export const REPORTS=freeze({new:{prompt:'Uusi suora kulku: paikka alussa 2m ja lopussa 11m. Kellon lukema alussa 1 s ja lopussa 6 s. Suunta ei vaihdu.',distance:9,time:5},return:{prompt:'Vaunu kulkee 4 m poispäin ja 4 m takaisin. Sekuntikello alkaa nollasta ja pysähtyy 7 s:n kohdalla.',distance:8,time:7},transfer:{prompt:'Aava mittaa suoran kävelyn: matka 15 m. Sekuntikellon lukema alussa 20s ja lopussa 25 s.',distance:15,time:5}});
export function readNumber(raw){
 if(typeof raw!=='string'||raw.length>128||!/^\+?\d+(?:[.,]\d+)?$/.test(raw.trim()))return null;
 let[a,b='']=raw.trim().replace(/^\+/,'').replace(',','.').split('.');a=a.replace(/^0+(?=\d)/,'');b=b.replace(/0+$/,'');if(a.length>5||b.length>3)return null;const n=Number(a+(b?'.'+b:''));return Number.isFinite(n)?n:null;
}

export function checkReport(key,d,t,du,tu){
 if(typeof key!=='string'||!Object.hasOwn(REPORTS,key))throw new RangeError('Unsupported report');
 if(!['m','s','kg','min'].includes(du)||!['m','s','kg','min'].includes(tu))return {ok:false,kind:'unit',message:'Valitse tunnetut mittayksiköt.'};
 const a=readNumber(d),b=readNumber(t),c=REPORTS[key];
 if(a===null||b===null)return {ok:false,kind:'missing',message:'Kirjoita molemmat lukuarvot. Tyhjä ei tarkoita nollaa.'};
 if(du!=='m'||tu!=='s')return {ok:false,kind:'unit',message:'Matkan yksikkö on tässä m ja keston yksikkö s. Älä vaihda suureita keskenään.'};
 if(a===c.distance&&b===c.time)return {ok:true,kind:'correct',message:`Kyllä. Kuljettu matka ${c.distance} m, kesto ${c.time} s. Ne kertovat eri asioita.`};
 return {ok:false,kind:'retry',message:`Tarkista lähtö ja loppu: kuljettu matka ${c.distance} m ja kesto ${c.time} s. Kellon loppulukema ei yksin ole kesto, ellei kello alkanut nollasta. Paluumatkakin kuuluu kuljettuun matkaan.`};
}
const mounted=new WeakMap();
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
 const area=host.closest?.('#lesson-body')??host,root=area.matches?.('[data-distance-lesson]')?area:area.querySelector('[data-distance-lesson]');if(!root)throw Error('Missing distance lesson body');mounted.get(root)?.dispose();
 const q=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)],listeners=[];let key='jump',reportKey=null,ticks=0,active=true,disposed=false,timer=null;
 const selected=(selector,choices)=>{const raw=q(selector).value;return typeof raw==='string'&&Object.hasOwn(choices,raw)?raw:null;};
 const stop=()=>{if(timer!==null){globalThis.clearInterval(timer);timer=null;}};
 const render=()=>{const s=stateAt(key,ticks);q('[data-distance-image]').innerHTML=motionSVG(key,ticks);q('[data-distance-readout]').textContent=`Kuljettu matka ${format(s.distance)} m. Kesto ${format(s.elapsed)} s. Paikka ${format(s.position)} m. Mittarin lukema ${format(s.clock)} s.`;q('[data-distance-observation]').textContent=s.finished?'Vaunu on perillä. Toiston odotus ei lisää valitun kulun mitattua kestoa.':'Seuraa matkaa ja kelloa yhtä aikaa.';};
 const syncModel=()=>{const next=selected('[data-distance-model]',MODELS);if(next===null){stop();key=null;ticks=0;q('[data-distance-image]').replaceChildren();q('[data-distance-readout]').textContent='Valitse jokin neljästä mallista.';q('[data-distance-observation]').textContent='';return false;}if(next!==key){stop();key=next;ticks=0;}render();return true;};
 const clear=()=>{q('[data-distance-feedback]').textContent='Tarkista, kun olet valmis.';q('[data-distance-feedback]').removeAttribute('data-result');};
 const syncReport=(force=false,clearAnswers=false)=>{const next=selected('[data-distance-report]',REPORTS);if(next===null){reportKey=null;q('[data-distance-prompt]').textContent='Valitse tuettu mittaustilanne.';clear();q('[data-distance-feedback]').textContent='Valitse ensin mittaustilanne.';return false;}if(force||next!==reportKey){reportKey=next;q('[data-distance-prompt]').textContent=REPORTS[next].prompt;if(clearAnswers)for(const e of all('[data-distance-answer]'))e.value='';clear();}return true;};
 const on=(e,t,fn)=>{e.addEventListener(t,fn);listeners.push(()=>e.removeEventListener(t,fn));},allowed=fn=>()=>{if(active&&!disposed)fn();};
 on(q('[data-distance-step]'),'click',allowed(()=>{stop();if(!syncModel())return;ticks=Math.min(ticks+10,stateAt(key,ticks).maximumTicks);render();}));
 on(q('[data-distance-play]'),'click',allowed(()=>{stop();if(!syncModel())return;if(ticks===stateAt(key,ticks).maximumTicks)ticks=0;render();timer=globalThis.setInterval(()=>{if(!active||disposed){stop();return;}if(selected('[data-distance-model]',MODELS)!==key){syncModel();stop();return;}ticks++;render();if(ticks===stateAt(key,ticks).maximumTicks)stop();},100);}));
 on(q('[data-distance-stop]'),'click',allowed(stop));on(q('[data-distance-rewind]'),'click',allowed(()=>{stop();if(!syncModel())return;ticks=0;render();}));
 for(const t of['input','change'])on(q('[data-distance-model]'),t,allowed(syncModel));
 for(const t of['input','change'])on(q('[data-distance-report]'),t,allowed(()=>syncReport(true,true)));
 for(const e of all('[data-distance-answer],[data-distance-unit]'))for(const t of['input','change'])on(e,t,allowed(clear));
 on(q('[data-distance-check]'),'click',allowed(()=>{if(!syncReport()){q('[data-distance-feedback]').dataset.result='missing';return;}const r=checkReport(reportKey,q('[data-distance-answer=distance]').value,q('[data-distance-answer=time]').value,q('[data-distance-unit=distance]').value,q('[data-distance-unit=time]').value);q('[data-distance-feedback]').textContent=r.message;q('[data-distance-feedback]').dataset.result=r.kind;}));
 const controls=all('button,select,input'),setActive=v=>{active=v;stop();controls.forEach(e=>e.disabled=!v);};
 const modelContext = createModelContext(
  () => ({key, selected: q('[data-distance-model]').value, ticks}),
  state => { stop(); key = state.key; ticks = state.ticks; q('[data-distance-model]').value = state.selected; if (key && Object.hasOwn(MODELS, key)) render(); else syncModel(); },
  preset => { if (!['walk', 'back'].includes(preset)) throw new RangeError('Unsupported distance context'); return {key: preset, selected: preset, ticks: 0}; }
 );
 const reset=()=>{modelContext.clear();stop();key='jump';reportKey=null;ticks=0;q('[data-distance-model]').value='jump';q('[data-distance-report]').value='new';q('[data-distance-unit=distance]').value='m';q('[data-distance-unit=time]').value='s';render();syncReport(true,true);};
 reset();setActive(true);root.dataset.ready='true';
 const api={context(request){if(!disposed)modelContext.transition(request);},pause(){if(!disposed)setActive(false);},resume(){if(!disposed)setActive(true);},reset(){if(!disposed)reset();},dispose(){if(disposed)return;modelContext.clear();disposed=true;setActive(false);listeners.forEach(off=>off());if(mounted.get(root)===api){mounted.delete(root);root.dataset.ready='false';}}};mounted.set(root,api);return api;
}
