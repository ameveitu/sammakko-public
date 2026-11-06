const gcd=(a,b)=>{a=a<0n?-a:a;while(b){const t=a%b;a=b;b=t<0n?-t:t;}return a;};
function rational(n,d){if(typeof n!=='bigint'||typeof d!=='bigint'||d===0n)throw new RangeError('Unsupported rational');if(d<0n){n=-n;d=-d;}const g=gcd(n,d);return Object.freeze({n:n/g,d:d/g});}
export function parseAnswer(raw){
 if(typeof raw!=='string'||raw.length>128)return null;const s=raw.trim();
 if(/^[+-]?\d+\s*\/\s*[+-]?\d+$/.test(s)){const[a,b]=s.split('/').map(x=>BigInt(x.trim()));return b===0n?null:rational(a,b);}
 if(!/^[+-]?\d+(?:[.,]\d+)?$/.test(s))return null;
 const negative=s.startsWith('-');let[a,b='']=s.replace(/^[+-]/,'').replace(',','.').split('.');a=a.replace(/^0+(?=\d)/,'');b=b.replace(/0+$/,'');
 if(a.length>4||b.length>3)return null;return rational((negative?-1n:1n)*BigInt(a+b),10n**BigInt(b.length));
}

export function multiply(a,b,c,d){
 if(![a,b,c,d].every(Number.isInteger)||[a,c].some(n=>Math.abs(n)>1000)||[b,d].some(n=>n<1||n>1000))throw new RangeError('Unsupported integer fractions');
 return rational(BigInt(a)*BigInt(c),BigInt(b)*BigInt(d));
}
export const asText=r=>r.d===1n?String(r.n):`${r.n}/${r.d}`;
const freeze=x=>{Object.values(x).forEach(v=>{if(v&&typeof v==='object')freeze(v);});return Object.freeze(x);};
export const MODELS=freeze({patch:{a:2,b:3,c:3,d:4},half:{a:1,b:2,c:3,d:4},zero:{a:0,b:3,c:2,d:3},whole:{a:1,b:1,c:3,d:4}});
export function validateArea(c){
 if(!c||typeof c!=='object'||Reflect.ownKeys(c).sort().join(',')!=='a,b,c,d'||![c.a,c.b,c.c,c.d].every(Number.isInteger)||c.b<1||c.d<1||c.b>8||c.d>8||c.a<0||c.c<0||c.a>c.b||c.c>c.d)throw new RangeError('Unsupported proper-fraction area');return Object.freeze({a:c.a,b:c.b,c:c.c,d:c.d});
}
export function modelState(key,phase){
 if(typeof key!=='string'||!Object.hasOwn(MODELS,key)||!Number.isInteger(phase)||phase<0||phase>3)throw new RangeError('Unsupported area declaration');
 const c=validateArea(MODELS[key]);return Object.freeze({...c,phase,total:c.b*c.d,selected:phase<2?0:c.a*c.c,product:multiply(c.a,c.b,c.c,c.d)});
}
export function modelSVG(key,phase){
 const s=modelState(key,phase),width=240/s.d,height=180/s.b;let cells='';
 for(let r=0;r<s.b;r++)for(let c=0;c<s.d;c++){const selected=phase>=2&&r<s.a&&c<s.c,blue=phase>=1&&c<s.c;cells+=`<rect data-selected="${selected?1:0}" x="${60+c*width}" y="${35+r*height}" width="${width}" height="${height}" fill="${selected?'url(#fraction-selected)':blue?'#a5cddc':'#fffdf5'}" stroke="#355c55" stroke-width="1.5"/>`;}
 const caption=phase<2?'Koko suorakulmio on yksi.':`${s.a*s.c} / ${s.b*s.d} = ${asText(s.product)}`;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 280" role="img" aria-label="${s.b} riviä ja ${s.d} saraketta, ${s.total} yhtä suurta osaa kokonaisesta. ${phase>=2?s.selected+' osaa valittuna.':phase===1?'Valittu ensimmäinen osa näkyy sinisenä.':'Vielä ei ole valittu osaa.'}"><defs><pattern id="fraction-selected" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#275e54"/><path d="M0 8L8 0" stroke="#cee3d6" stroke-width="1.5"/></pattern></defs>${cells}<text x="180" y="250" text-anchor="middle" font-size="21" fill="#173e39">${caption}</text></svg>`;
}
export const EXERCISES=freeze({calc:{a:3,b:5,c:2,d:3,prompt:'Laske 3/5 × 2/3.'},half:{a:1,b:2,c:5,d:6,prompt:'Paljonko on puolet luvusta 5/6?'},large:{a:3,b:2,c:4,d:3,prompt:'Laske 3/2 × 4/3. Tulos voi olla suurempi kuin yksi.'},zero:{a:0,b:5,c:3,d:4,prompt:'Laske 0/5 × 3/4.'},length:{a:1,b:2,c:3,d:5,prompt:'Naru on 3/5 m. Tarvitset puolet tästä pituudesta. Kuinka monta metriä tarvitset?'}});
export function checkProduct(key,raw){
 if(typeof key!=='string'||!Object.hasOwn(EXERCISES,key))throw new RangeError('Unsupported fraction exercise');const c=EXERCISES[key],actual=parseAnswer(raw),expected=multiply(c.a,c.b,c.c,c.d);
 if(actual===null)return {ok:false,kind:'missing',message:'Kirjoita luku tai murtoluku, esimerkiksi 3/8. Nimittäjä ei voi olla nolla.'};
 if(actual.n===expected.n&&actual.d===expected.d)return {ok:true,kind:'correct',message:`Kyllä. Tulos on ${asText(expected)}${key==='length'?' m':''}. Myös samanarvoinen supistamaton muoto käy.`};
 return {ok:false,kind:'retry',message:`Kerro osoittajat ja nimittäjät: (${c.a} × ${c.c}) / (${c.b} × ${c.d}) = ${c.a*c.c}/${c.b*c.d} = ${asText(expected)}. Nimittäjiä ei lasketa yhteen.`};
}
const mounted=new WeakMap();
export function mount(host){
 const area=host.closest?.('#lesson-body')??host,root=area.matches?.('[data-fraction-lesson]')?area:area.querySelector('[data-fraction-lesson]');if(!root)throw Error('Missing fraction lesson body');mounted.get(root)?.dispose();
 const q=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)],listeners=[];let key='patch',practiceKey=null,phase=0,timer=null,active=true,disposed=false;
 const selected=(selector,values)=>{const raw=q(selector).value;return typeof raw==='string'&&Object.hasOwn(values,raw)?raw:null;};
 const stop=()=>{if(timer!==null){globalThis.clearInterval(timer);timer=null;}};
 const render=()=>{const s=modelState(key,phase);q('[data-fraction-image]').innerHTML=modelSVG(key,phase);q('[data-fraction-step]').textContent=['Valitse ensimmäinen osa','Ota siitä toinen osa','Katso tulo','Alkuun'][phase];q('[data-fraction-readout]').textContent=[`Kokonainen on jaettu ${s.b*s.d} yhtä suureen ruutuun.`,`Valitse ensin ${s.c}/${s.d} kokonaisesta: siniset sarakkeet.`,`Ota vain sinisestä osasta ${s.a}/${s.b}: viivoitetut ruudut.`,`${s.a}/${s.b} × ${s.c}/${s.d} = ${s.a*s.c}/${s.b*s.d} = ${asText(s.product)} kokonaisesta.`][phase];};
 const syncModel=()=>{const next=selected('[data-fraction-model]',MODELS);if(next===null){stop();key=null;phase=0;q('[data-fraction-image]').replaceChildren();q('[data-fraction-readout]').textContent='Valitse tuettu osamalli.';return false;}if(key!==next){stop();key=next;phase=0;}render();return true;};
 const clear=()=>{q('[data-fraction-feedback]').textContent='Tarkista, kun olet valmis.';q('[data-fraction-feedback]').removeAttribute('data-result');};
 const syncPractice=(force=false,clearAnswer=false)=>{const next=selected('[data-fraction-exercise]',EXERCISES);if(next===null){practiceKey=null;q('[data-fraction-prompt]').textContent='Valitse tuettu tehtävä.';clear();q('[data-fraction-feedback]').textContent='Valitse ensin tehtävä.';return false;}if(force||practiceKey!==next){practiceKey=next;q('[data-fraction-prompt]').textContent=EXERCISES[next].prompt;if(clearAnswer)q('[data-fraction-answer]').value='';clear();}return true;};
 const on=(e,t,fn)=>{e.addEventListener(t,fn);listeners.push(()=>e.removeEventListener(t,fn));},allowed=fn=>()=>{if(active&&!disposed)fn();};
 on(q('[data-fraction-step]'),'click',allowed(()=>{stop();if(!syncModel())return;phase=(phase+1)%4;render();}));
 on(q('[data-fraction-play]'),'click',allowed(()=>{stop();if(!syncModel())return;if(phase===3)phase=0;render();timer=globalThis.setInterval(()=>{if(!active||disposed){stop();return;}if(selected('[data-fraction-model]',MODELS)!==key){syncModel();stop();return;}phase++;render();if(phase===3)stop();},1200);}));
 on(q('[data-fraction-stop]'),'click',allowed(stop));on(q('[data-fraction-rewind]'),'click',allowed(()=>{stop();if(!syncModel())return;phase=0;render();}));
 for(const t of['input','change'])on(q('[data-fraction-model]'),t,allowed(syncModel));
 for(const t of['input','change'])on(q('[data-fraction-exercise]'),t,allowed(()=>syncPractice(true,true)));
 for(const t of['input','change'])on(q('[data-fraction-answer]'),t,allowed(clear));
 on(q('[data-fraction-check]'),'click',allowed(()=>{if(!syncPractice()){q('[data-fraction-feedback]').dataset.result='missing';return;}const r=checkProduct(practiceKey,q('[data-fraction-answer]').value);q('[data-fraction-feedback]').textContent=r.message;q('[data-fraction-feedback]').dataset.result=r.kind;}));
 const controls=all('button,select,input'),setActive=v=>{active=v;stop();controls.forEach(e=>e.disabled=!v);};
 const reset=()=>{stop();key='patch';practiceKey=null;phase=0;q('[data-fraction-model]').value='patch';q('[data-fraction-exercise]').value='calc';render();syncPractice(true,true);};
 reset();setActive(true);root.dataset.ready='true';
 const api={pause(){if(!disposed)setActive(false);},resume(){if(!disposed)setActive(true);},reset(){if(!disposed)reset();},dispose(){if(disposed)return;disposed=true;setActive(false);listeners.forEach(off=>off());if(mounted.get(root)===api){mounted.delete(root);root.dataset.ready='false';}}};mounted.set(root,api);return api;
}
