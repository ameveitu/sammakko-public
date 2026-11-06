const freeze=x=>{Object.values(x).forEach(v=>{if(v&&typeof v==='object')freeze(v);});return Object.freeze(x);};
export const UNITS=freeze({mm:{kind:'length',n:1n,d:1000n},cm:{kind:'length',n:1n,d:100n},m:{kind:'length',n:1n,d:1n},km:{kind:'length',n:1000n,d:1n},s:{kind:'time',n:1n,d:1n},min:{kind:'time',n:60n,d:1n},h:{kind:'time',n:3600n,d:1n}});
function unit(key){if(typeof key!=='string'||!Object.hasOwn(UNITS,key))throw new RangeError('Tuntematon yksikkö');return UNITS[key];}
const gcd=(a,b)=>{while(b){const c=a%b;a=b;b=c;}return a;};
function ratio(n,d){if(typeof n!=='bigint'||typeof d!=='bigint'||n<0n||d<=0n)throw new RangeError('Unsupported nonnegative rational');const g=gcd(n,d);return Object.freeze({n:n/g,d:d/g});}
export function readDecimal(raw){
 if(typeof raw!=='string'||raw.length>128||!/^\+?\d+(?:[.,]\d+)?$/.test(raw.trim()))return null;
 let[a,b='']=raw.trim().replace(/^\+/,'').replace(',','.').split('.');a=a.replace(/^0+(?=\d)/,'');b=b.replace(/0+$/,'');if(a.length>6||b.length>3)return null;return ratio(BigInt(a+b),10n**BigInt(b.length));
}

export function print(x){
 if(!x||typeof x.n!=='bigint'||typeof x.d!=='bigint')throw new RangeError('Unsupported rational');const r=ratio(x.n,x.d);let d=r.d;for(const p of[2n,5n])while(d%p===0n)d/=p;if(d!==1n)return `${r.n}/${r.d}`;
 let result=String(r.n/r.d),rem=r.n%r.d;if(!rem)return result;result+=',';while(rem){rem*=10n;result+=String(rem/r.d);rem%=r.d;}return result;
}
export function convert(raw,from,to){const a=unit(from),b=unit(to);if(a.kind!==b.kind)throw new RangeError('Pituutta ja aikaa ei voi muuntaa toisikseen');const x=readDecimal(raw);return x===null?null:ratio(x.n*a.n*b.d,x.d*a.d*b.n);}
export function conversionSVG(raw,from,to,reveal){
 if(typeof reveal!=='boolean')throw new RangeError('Unsupported reveal state');const x=readDecimal(raw),v=convert(raw,from,to);if(x===null)return '';
 const a=`${print(x)} ${from}`,b=reveal?`${print(v)} ${to}`:`? ${to}`;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 180" role="img" aria-label="Sama määrä kahdessa yksikössä: ${a} = ${b}. Viivat kuvaavat samaa määrää, eivät eri pituisia lukuja."><text x="210" y="28" text-anchor="middle" font-size="24" fill="#174b40">${a}</text><path d="M40 55H380" stroke="#34756b" stroke-width="18"/><path d="M40 110H380" stroke="#537aab" stroke-width="18"/><text x="210" y="155" text-anchor="middle" font-size="24" fill="#174b40">${b}</text></svg>`;
}
export const EXERCISES=freeze({path:{value:'1,8',from:'km',to:'m',prompt:'Kävelyreitti on 1,8 km. Kirjoita matka metreinä.'},ribbon:{value:'350',from:'cm',to:'m',prompt:'Mittanauha näyttää 350 cm. Kirjoita pituus metreinä.'},time:{value:'2,5',from:'h',to:'min',prompt:'Mittausvuoro kestää 2,5 h. Kirjoita kesto minuutteina.'},seconds:{value:'1,75',from:'min',to:'s',prompt:'Mittausta varten 1 min 45 s on kirjoitettava sekunteina. Paljonko se on?'}});
export function checkConversion(key,raw,answerUnit){
 if(typeof key!=='string'||!Object.hasOwn(EXERCISES,key))throw new RangeError('Unsupported conversion exercise');
 const c=EXERCISES[key],x=readDecimal(raw);if(x===null)return {ok:false,kind:'missing',message:'Kirjoita lukuarvo. Tyhjä ei tarkoita nollaa.'};
 try{const actual=convert(raw,answerUnit,c.to),expected=convert(c.value,c.from,c.to);if(actual.n===expected.n&&actual.d===expected.d){if(answerUnit!==c.to)return {ok:false,kind:'form',message:`Määrä on sama. Kirjoita se vielä pyydetyssä yksikössä ${c.to}.`};return {ok:true,kind:'correct',message:`Kyllä. ${print(expected)} ${c.to}. Määrä säilyi, lukuarvo ja yksikkö vaihtuivat.`};}
 return {ok:false,kind:'retry',message:`Tarkista kerroin ja suunta: ${print(readDecimal(c.value))} ${c.from} = ${print(expected)} ${c.to}. Minuutissa on 60 s, ei 100 s.`};
 }catch{return {ok:false,kind:'unit',message:'Valitse saman suureen yksikkö: pituus ja aika eivät muutu toisikseen.'};}
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
 const area=host.closest?.('#lesson-body')??host,root=area.matches?.('[data-unit-lesson]')?area:area.querySelector('[data-unit-lesson]');if(!root)throw Error('Missing unit lesson body');mounted.get(root)?.dispose();
 const q=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)],listeners=[];let active=true,disposed=false,revealed=false,practiceKey=null;
 const model=()=>{try{const raw=q('[data-unit-value]').value,from=q('[data-unit-from]').value,to=q('[data-unit-to]').value,r=convert(raw,from,to);q('[data-unit-image]').innerHTML=conversionSVG(raw,from,to,revealed);q('[data-unit-readout]').textContent=r===null?'Kirjoita lukuarvo, esimerkiksi 1,2.':revealed?`${print(readDecimal(raw))} ${from} = ${print(r)} ${to}. Sama määrä.`:`1 ${from} = ${print(convert('1',from,to))} ${to}. Muuta merkintää painamalla painiketta.`;}catch(e){q('[data-unit-image]').replaceChildren();q('[data-unit-readout]').textContent=e.message;}};
 const clear=()=>{q('[data-unit-feedback]').textContent='Tarkista, kun olet valmis.';q('[data-unit-feedback]').removeAttribute('data-result');};
 const syncPractice=(force=false,clearAnswer=false)=>{const next=q('[data-unit-exercise]').value;if(typeof next!=='string'||!Object.hasOwn(EXERCISES,next)){practiceKey=null;q('[data-unit-prompt]').textContent='Valitse tuettu muunnostehtävä.';clear();q('[data-unit-feedback]').textContent='Valitse ensin tehtävä.';return false;}if(force||practiceKey!==next){practiceKey=next;q('[data-unit-prompt]').textContent=EXERCISES[next].prompt;if(clearAnswer)q('[data-unit-answer]').value='';clear();}return true;};
 const on=(e,t,fn)=>{e.addEventListener(t,fn);listeners.push(()=>e.removeEventListener(t,fn));},allowed=fn=>()=>{if(active&&!disposed)fn();};
 on(q('[data-unit-reveal]'),'click',allowed(()=>{revealed=true;model();}));
 for(const e of all('[data-unit-value],[data-unit-from],[data-unit-to]'))for(const t of['input','change'])on(e,t,allowed(()=>{revealed=false;model();}));
 for(const t of['input','change'])on(q('[data-unit-exercise]'),t,allowed(()=>syncPractice(true,true)));
 for(const e of all('[data-unit-answer],[data-unit-answer-unit]'))for(const t of['input','change'])on(e,t,allowed(clear));
 on(q('[data-unit-check]'),'click',allowed(()=>{if(!syncPractice()){q('[data-unit-feedback]').dataset.result='missing';return;}const r=checkConversion(practiceKey,q('[data-unit-answer]').value,q('[data-unit-answer-unit]').value);q('[data-unit-feedback]').textContent=r.message;q('[data-unit-feedback]').dataset.result=r.kind;}));
 const controls=all('button,select,input'),setActive=v=>{active=v;controls.forEach(e=>e.disabled=!v);};
 const modelContext = createModelContext(
  () => ({raw: q('[data-unit-value]').value, from: q('[data-unit-from]').value, to: q('[data-unit-to]').value, revealed}),
  state => { q('[data-unit-value]').value = state.raw; q('[data-unit-from]').value = state.from; q('[data-unit-to]').value = state.to; revealed = state.revealed; model(); },
  preset => { if (preset !== 'half-hour') throw new RangeError('Unsupported conversion context'); return {raw: '0,5', from: 'h', to: 'min', revealed: false}; }
 );
 const reset=()=>{modelContext.clear();revealed=false;practiceKey=null;q('[data-unit-value]').value='1,2';q('[data-unit-from]').value='km';q('[data-unit-to]').value='m';q('[data-unit-exercise]').value='path';q('[data-unit-answer-unit]').value='m';model();syncPractice(true,true);};
 reset();setActive(true);root.dataset.ready='true';
 const api={context(request){if(disposed)return;modelContext.transition(request);if(request?.action==='enter'){revealed=false;model();}},pause(){if(!disposed)setActive(false);},resume(){if(!disposed)setActive(true);},reset(){if(!disposed)reset();},dispose(){if(disposed)return;modelContext.clear();disposed=true;setActive(false);listeners.forEach(off=>off());if(mounted.get(root)===api){mounted.delete(root);root.dataset.ready='false';}}};mounted.set(root,api);return api;
}
