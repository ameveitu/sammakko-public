const whole = n => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= 10;
const own = (o,k) => typeof k === 'string' && Object.hasOwn(o,k);
export const FACTS = Object.freeze(Object.fromEntries(Array.from({length:11},(_,sum)=>Array.from({length:sum+1},(_,a)=>[`${a}_${sum-a}`,Object.freeze({a,b:sum-a,sum})])).flat()));
export const MODELS = Object.freeze({count:Object.freeze({a:2,b:6,kind:'line'}),double:Object.freeze({a:4,b:4,kind:'pairs'}),near:Object.freeze({a:3,b:4,kind:'pairs'}),zero:Object.freeze({a:0,b:5,kind:'line'})});
export function readCount(raw) {return typeof raw==='string'&&/^\s*\d{1,2}\s*$/.test(raw)&&whole(Number(raw.trim()))?Number(raw.trim()):NaN;}
export function fact(a,b) {return whole(a)&&whole(b)&&a+b<=10?a+b:null;}
export function countOn(a,b,fromBig=false) {
 if(fact(a,b)===null||typeof fromBig!=='boolean')return null;
 const start=fromBig?Math.max(a,b):a,steps=fromBig?Math.min(a,b):b;
 return {start,steps,end:a+b,landings:Array.from({length:steps},(_,i)=>start+i+1)};
}
export function checkFact(key,raw) {
 if(!own(FACTS,key))return {ok:false,message:'Valitse lasku väliltä 0–10.'};
 const c=FACTS[key],n=readCount(raw);
 if(!whole(n))return {ok:false,message:'Kirjoita kokonainen luku 0–10. Tyhjä ruutu ei tarkoita nollaa.'};
 if(n===c.sum)return {ok:true,message:`${c.a} + ${c.b} = ${n}. Tämä vastaus sopii. Voit miettiä, muistitko tuloksen vai käytitkö apua.`};
 return {ok:false,message:n===c.sum-1?'Yksi jäi puuttumaan. Jos lasket eteenpäin, lähtöluku ei ole ensimmäinen askel.':n===c.sum+1?'Yksi tuli liikaa. Laskeminen alkaa lähtöluvun jälkeen seuraavasta luvusta.':c.a===0||c.b===0?'Nolla ei tuo yhtään lisää. Toinen määrä pysyy samana.':`Yhdistä määrät ${c.a} ja ${c.b}. Voit käyttää mallia tai aloittaa suuremmasta luvusta.`};
}
export function modelState(key,order,step) {
 if(!own(MODELS,key)||!['given','bigger'].includes(order)||!whole(step))return null;
 const c=MODELS[key],r=c.kind==='line'?countOn(c.a,c.b,order==='bigger'):{start:c.a,steps:c.b,end:c.a+c.b,landings:[]};
 return step<=r.steps?{...c,...r,step}:null;
}
const circle=(x,y,color,tag,i)=>`<circle data-${tag}="${i}" cx="${x}" cy="${y}" r="9" fill="${color}" stroke="#234b40" stroke-width="1.5"/>`;
export function modelSvg(key,order,step) {
 const c=modelState(key,order,step);if(!c)return '';
 let t;
 if(c.kind==='line'){
  const x=n=>25+31*n;
  t=`<text x="180" y="24" text-anchor="middle" font-size="18">Aloitus ${c.start}. Askeleita ${step}/${c.steps}.</text><path d="M15 100 H345" stroke="#355d50" stroke-width="2"/>`;
  for(let n=0;n<=10;n++)t+=`<path d="M${x(n)} 95 V105" stroke="#355d50"/><text x="${x(n)}" y="130" text-anchor="middle" font-size="15">${n}</text>`;
  for(let i=0;i<step;i++)t+=`<path data-hop="${i}" d="M${x(c.start+i)} 94 Q${x(c.start+i)+15.5} 48 ${x(c.start+i+1)} 94" stroke="#28745b" stroke-width="3" fill="none"/>`;
  t+=circle(x(c.start+step),100,'#d7aa5f','position',c.start+step);
 }else{
  t=`<text x="180" y="24" text-anchor="middle" font-size="18">Yläosassa ${c.a}. Alhaalle tulee ${c.b}.</text>`;
  for(let i=0;i<c.a;i++)t+=circle(70+i*42,65,'#328372','top',i);
  for(let i=0;i<step;i++)t+=circle(70+i*42,107,i<c.a?'#328372':'#d7aa5f','lower',i);
 }
 t+=`<text x="180" y="169" text-anchor="middle" font-size="23">${step===c.steps?`${c.a} + ${c.b} = ${c.end}`:c.kind==='line'?`Nyt luvussa ${c.start+step}`:`Näytetty alhaalla ${step}/${c.b}`}</text>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 190" role="img" aria-label="Laskun ${c.a} plus ${c.b} malli. Vaihe ${step}."><title>Lähtöluku ja askeleet tai kaksi osaa</title><g fill="#183e36" font-family="sans-serif">${t}</g></svg>`;
}
const mounted=new WeakMap();
export function mount(host) {
 mounted.get(host)?.dispose();const root=host.closest('#lesson-body')?.querySelector('[data-facts-ten]');if(!root)return{pause(){},resume(){},reset(){},dispose(){}};
 const q=x=>root.querySelector(x),fields=[...root.querySelectorAll('fieldset')];let disposed=false,paused=false,modelKey='',order='',step=0,signature='';
 const report=(state,text)=>{q('[data-feedback]').dataset.verdict=state;q('[data-feedback]').textContent=text;};
 function model(){const k=q('[data-model-case]').value,o=q('[data-model-order]').value;if(k!==modelKey||o!==order){modelKey=k;order=o;step=0;}const state=modelState(k,o,step);q('[data-model-order]').disabled=paused||!!state&&state.kind==='pairs';q('[data-model-picture]').innerHTML=modelSvg(k,o,step);q('[data-model-caption]').textContent=state?state.kind==='line'?`Lähtöluku ${state.start} ei ole askel. Tarvitaan ${state.steps} askelta. Malli ei mittaa oppijan nopeutta.`:'Katso yhtä suuret osat. Lähes tuplassa toiseen osaan tulee vielä yksi.':'Valitse malli.';q('[data-action="step"]').disabled=paused||!state||step===state.steps;q('[data-action="all"]').disabled=paused||!state||step===state.steps;return state;}
 function sync(){const key=q('[data-fact-case]').value,raw=q('[data-answer]').value,sig=JSON.stringify([key,raw]);if(sig!==signature){signature=sig;report('neutral','Tarkista, kun olet valmis.');}const c=own(FACTS,key)?FACTS[key]:null;q('[data-question]').textContent=c?`${c.a} + ${c.b} = ?`:'Valitse lasku.';q('[data-current-hint]').textContent=c?c.a===0||c.b===0?'Nolla ei lisää mitään. Määrä pysyy samana.':c.a===c.b?`Tupla: kaksi yhtä suurta ${c.a} merkin osaa.`:Math.abs(c.a-c.b)===1?`Ajattele tuplaa ${Math.min(c.a,c.b)} + ${Math.min(c.a,c.b)} ja yhtä lisää.`:`Voit aloittaa luvusta ${Math.max(c.a,c.b)} ja edetä ${Math.min(c.a,c.b)} askelta.`:'Valitse lasku.';return {key,raw};}
 function edit(e){if(disposed||paused)return;if(e.target.matches('[data-model-case],[data-model-order]'))model();if(e.target.matches('[data-fact-case],[data-answer]'))sync();}
 function click(e){const b=e.target.closest('button[data-action]');if(!b||!root.contains(b)||disposed||paused)return;const a=b.dataset.action;if(a==='check'){const v=sync(),r=checkFact(v.key,v.raw);report(r.ok?'correct':'retry',r.message);}else if(a==='next'){const v=sync(),keys=Object.keys(FACTS),i=keys.indexOf(v.key);q('[data-fact-case]').value=keys[(i+1)%keys.length];q('[data-answer]').value='';sync();}else{const state=model();if(!state)return;step=a==='model-reset'?0:a==='all'?state.steps:Math.min(state.steps,step+1);model();}}
 function reset(){if(disposed)return;q('[data-model-case]').value='count';q('[data-model-order]').value='bigger';q('[data-fact-case]').value='2_6';q('[data-answer]').value='';modelKey='';order='';step=0;signature='';sync();model();for(const f of fields)f.disabled=paused;}
 root.addEventListener('input',edit);root.addEventListener('change',edit);root.addEventListener('click',click);
 const api={pause(){if(disposed)return;paused=true;for(const f of fields)f.disabled=true;model();},resume(){if(disposed)return;paused=false;for(const f of fields)f.disabled=false;sync();model();},reset,dispose(){if(disposed)return;disposed=true;root.removeEventListener('input',edit);root.removeEventListener('change',edit);root.removeEventListener('click',click);for(const f of fields)f.disabled=true;if(mounted.get(host)===api)mounted.delete(host);}};mounted.set(host,api);reset();return api;
}
