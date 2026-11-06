// Contexts borrow one live workbench; each preset keeps its own in-memory state.
// Returning restores the original work without submitting an answer or replaying motion.
function lessonContexts(read, write, start) {
  const saved = new Map(); let active = null, origin = null;
  return {
    change({action, key, preset}) {
      if (action === 'enter') {
        if (!preset || active === key) return;
        if (active !== null) throw new Error('Close the active lesson context first');
        const before = read();
        try { if (saved.has(key)) write(saved.get(key)); else start(preset); }
        catch (error) { write(before); throw error; }
        origin = before; active = key;
      } else if (action === 'leave' && active === key) {
        const state = read(), previous = origin;
        saved.set(key, state); active = null; origin = null; write(previous);
      }
    },
    clear() { saved.clear(); active = null; origin = null; }
  };
}
function contextFeedback(element) {
  return {text: element.textContent, attributes: ['data-result', 'data-verdict', 'data-code'].map(name => [name, element.getAttribute(name)])};
}
function restoreContextFeedback(element, state) {
  element.textContent = state.text;
  for (const [name, value] of state.attributes) if (value === null) element.removeAttribute(name); else element.setAttribute(name, value);
}

export const TASKS=Object.freeze({free:Object.freeze({name:'Tee kaksi osaa'}),hidden:Object.freeze({name:'Kupin alla',whole:7,known:4}),pockets:Object.freeze({name:'Kaksi taskua',whole:8,known:3}),ten:Object.freeze({name:'Kympin ruudukko',whole:10,known:7})});
const whole=n=>typeof n==='number'&&Number.isInteger(n)&&n>=1&&n<=10;
export function task(key,n){if(typeof key!=='string'||!Object.hasOwn(TASKS,key)||!whole(n))return null;const t=TASKS[key];if(key==='free')return whole(n)?{key,name:t.name,whole:n}:null;return{key,...t};}
function dense(a,n){return Array.isArray(a)&&a.length===n&&Reflect.ownKeys(a).length===n+1&&Array.from({length:n},(_,i)=>Object.hasOwn(a,i)).every(Boolean);}
export function readPart(raw){return typeof raw==='string'&&/^\d{1,2}$/.test(raw.trim())?Number(raw.trim()):NaN;}
const part=n=>typeof n==='number'&&Number.isInteger(n)&&n>=0&&n<=10;
export function checkParts(key,n,answer){const t=task(key,n);if(!t||!dense(answer,key==='free'?2:1)||!answer.every(part))return{ok:false,message:'Täytä osien määrät kokonaisluvuilla 0–10. Tyhjässä osassa on 0.'};const a=key==='free'?answer[0]:t.known,b=key==='free'?answer[1]:answer[0],sum=a+b;if(sum===t.whole)return{ok:true,message:`Osat ${a} ja ${b} ovat yhteensä ${t.whole}. ${a} + ${b} = ${t.whole}.`};if(key!=='free'&&b===t.whole)return{ok:false,message:`${t.whole} on kaikki yhteensä. ${t.known} on jo näkyvissä tai toisessa osassa. Etsi puuttuva osa.`};if(sum<t.whole)return{ok:false,message:`${a} ja ${b} ovat yhteensä ${sum}. Tarvitaan vielä ${t.whole-sum}, jotta saadaan ${t.whole}.`};return{ok:false,message:`${a} ja ${b} ovat yhteensä ${sum}. Se on ${sum-t.whole} liikaa. Koko määrä on ${t.whole}.`};}
export function partition(n,a){if(!whole(n)||!part(a)||a>n)return null;return{whole:n,left:a,right:n-a,objects:Array.from({length:n},(_,id)=>({id,side:id<a?'left':'right'}))};}
export function partsSvg(a,b,cover=false){if(!part(a)||!part(b)||typeof cover!=='boolean')return'';const dots=(n,side)=>Array.from({length:n},(_,i)=>`<circle data-dot="${side}-${i}" cx="${side==='left'?35+i%5*19:149+i%5*19}" cy="${52+Math.floor(i/5)*24}" r="6" fill="${side==='left'?'#245f4c':'#a75523'}"/>`).join('');return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 145" role="img" aria-label="Vasemmassa osassa ${a}.${cover?' Oikea osa peitetty.':` Oikeassa ${b}, yhteensä ${a+b}.`}"><title>Kaksi osaa</title><rect x="17" y="30" width="107" height="64" rx="6" fill="#fffaf0" stroke="#758b80"/><rect x="131" y="30" width="107" height="64" rx="6" fill="#fffaf0" stroke="#758b80"/>${dots(a,'left')}${cover?'<rect data-cover="" x="131" y="30" width="107" height="64" rx="6" fill="#b9804b" stroke="#72502d"/><text x="184" y="76" text-anchor="middle" font-family="sans-serif" font-size="30" fill="#ffffff">?</text>':dots(b,'right')}<text x="70" y="118" text-anchor="middle" font-family="sans-serif" font-size="21" fill="#183e36">${a}</text><text x="184" y="118" text-anchor="middle" font-family="sans-serif" font-size="21" fill="#183e36">${cover?'?':b}</text></svg>`;}
export function partitionSvg(n,a){const p=partition(n,a);if(!p)return'';return partsSvg(p.left,p.right).replace(/data-dot="(left|right)-(\d+)"/g,(_,side,index)=>`data-object="${side==='left'?Number(index):a+Number(index)}"`);}
export function tenSvg(filled){if(!part(filled))return'';return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 155" role="img" aria-label="Kymmenen ruutua. ${filled} täytetty ja loput tyhjiä."><title>Kympin koko määrä</title><text x="130" y="23" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#183e36">Yhteensä 10 ruutua</text>${Array.from({length:10},(_,i)=>{const x=25+i%5*42,y=34+Math.floor(i/5)*42;return`<rect data-cell="${i}" x="${x}" y="${y}" width="42" height="42" fill="#fffaf0" stroke="#758b80"/>${i<filled?`<circle data-filled="${i}" cx="${x+21}" cy="${y+21}" r="8" fill="#245f4c"/>`:''}`;}).join('')}<text x="130" y="145" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#183e36">Täytetty ${filled}</text></svg>`;}
const mounted=new WeakMap();
export function mount(host){mounted.get(host)?.dispose();const root=host.closest('#lesson-body')?.querySelector('[data-parts]');if(!root)return{pause(){},resume(){},reset(){},dispose(){}};const q=s=>root.querySelector(s),field=q('fieldset'),feedback=q('[data-feedback]');let paused=false,disposed=false,key='free',n=7,modelLeft=5,revealed=false,signature='';
 function report(state,text){feedback.dataset.verdict=state;feedback.textContent=text;}
 function read(){const key=q('[data-task]').value,raw=q('[data-whole]').value,number=/^(?:[1-9]|10)$/.test(raw)?Number(raw):NaN;return{key,n:number,answer:key==='free'?[readPart(q('[data-left]').value),readPart(q('[data-right]').value)]:[readPart(q('[data-right]').value)]};}
 function paint(){const t=task(key,n);q('[data-whole-wrap]').hidden=key!=='free';q('[data-left-wrap]').hidden=key!=='free';q('[data-right-label]').textContent=key==='free'?'Toinen osa':'Puuttuva osa';q('[data-action="reveal"]').hidden=key==='free';q('[data-action="reveal"]').textContent=revealed?'Peitä osa uudelleen':'Näytä puuttuva osa';if(!t){q('[data-question]').textContent='Valitse tehtävä ja koko määrä 1–10.';q('[data-answer-picture]').innerHTML='';q('[data-model]').innerHTML='';return;}
 q('[data-question]').textContent=key==='free'?`Koko määrä on ${t.whole}. Tee kaksi osaa. Saat valita minkä tahansa sopivan parin.`:key==='ten'?`Ruudukossa on 10 paikkaa. Täytettyjä on ${t.known}. Montako on tyhjää?`:`${key==='pockets'?'Kahdessa taskussa':'Yhteensä'} on ${t.whole}. ${key==='pockets'?'Ensimmäisessä taskussa':'Näkyvissä'} on ${t.known}. Montako on ${key==='pockets'?'toisessa taskussa':'kupin alla'}?`;
 const v=read();if(key==='free'){const valid=v.answer.every(part);q('[data-answer-picture]').innerHTML=valid?partsSvg(...v.answer):'';q('[data-built]').textContent=valid?`Rakentamasi osat: ${v.answer[0]} ja ${v.answer[1]}, yhteensä ${v.answer[0]+v.answer[1]}. Tehtävän koko määrä on ${t.whole}.`:'Kirjoita kumpaankin osaan määrä. Tyhjään osaan voi tulla 0.';}else{q('[data-answer-picture]').innerHTML=key==='ten'&&!revealed?tenSvg(t.known):partsSvg(t.known,t.whole-t.known,!revealed);q('[data-built]').textContent=revealed?`Avussa osat näkyvät: ${t.known} ja ${t.whole-t.known}.`:'Koko määrä ja tunnettu osa ovat näkyvissä. Kuvaa saa käyttää apuna.';}
 q('[data-model]').innerHTML=partitionSvg(t.whole,modelLeft);q('[data-model-caption]').textContent=`Sama koko määrä ${t.whole}: osat ${modelLeft} ja ${t.whole-modelLeft}.`;q('[data-action="left"]').disabled=paused||modelLeft===t.whole;q('[data-action="right"]').disabled=paused||modelLeft===0;
 }
 function sync(){const v=read(),sig=JSON.stringify([v.key,v.key==='free'?q('[data-whole]').value:null,v.key==='free'?q('[data-left]').value:null,q('[data-right]').value]);if(sig!==signature){signature=sig;report('neutral','Tarkista osat, kun olet valmis.');}if(v.key!==key||v.key==='free'&&v.n!==n){key=v.key;n=v.n;const t=task(key,n);modelLeft=t?Math.min(5,t.whole):0;revealed=false;}paint();return read();}
 function edit(e){if(disposed||paused||!e.target.matches('[data-task],[data-whole],[data-left],[data-right]'))return;sync();}
 function click(e){const b=e.target.closest('button[data-action]');if(!b||!root.contains(b)||disposed||paused)return;const v=sync(),t=task(v.key,v.n);if(b.dataset.action==='check'){const r=checkParts(v.key,v.n,v.answer);report(r.ok?'correct':'retry',r.message);}else if(t){if(b.dataset.action==='left')modelLeft=Math.min(t.whole,modelLeft+1);if(b.dataset.action==='right')modelLeft=Math.max(0,modelLeft-1);if(b.dataset.action==='reveal')revealed=!revealed;if(b.dataset.action==='model-reset')modelLeft=Math.min(5,t.whole);paint();}}
 function reset(){if(disposed)return;q('[data-task]').value='free';q('[data-whole]').value='7';q('[data-left]').value='';q('[data-right]').value='';key='free';n=7;modelLeft=5;revealed=false;signature='';sync();field.disabled=paused;}
 const contexts=lessonContexts(
  ()=>({key,n,modelLeft,revealed,signature,values:['[data-task]','[data-whole]','[data-left]','[data-right]'].map(s=>q(s).value),feedback:contextFeedback(feedback)}),
  state=>{[key,n,modelLeft,revealed,signature]=[state.key,state.n,state.modelLeft,state.revealed,state.signature];['[data-task]','[data-whole]','[data-left]','[data-right]'].forEach((s,i)=>{q(s).value=state.values[i];});paint();restoreContextFeedback(feedback,state.feedback);field.disabled=paused;},
  preset=>{if(preset!=='five')throw new RangeError('Unsupported parts context');q('[data-task]').value='free';q('[data-whole]').value='5';q('[data-left]').value=q('[data-right]').value='';key='free';n=5;modelLeft=5;revealed=false;signature='';sync();field.disabled=paused;}
 );
 root.addEventListener('input',edit);root.addEventListener('change',edit);root.addEventListener('click',click);
 const api={pause(){if(disposed)return;paused=true;field.disabled=true;paint();},resume(){if(disposed)return;paused=false;field.disabled=false;sync();},context(request){if(!disposed)contexts.change(request);},reset(){contexts.clear();reset();},dispose(){if(disposed)return;contexts.clear();disposed=true;root.removeEventListener('input',edit);root.removeEventListener('change',edit);root.removeEventListener('click',click);field.disabled=true;if(mounted.get(host)===api)mounted.delete(host);}};mounted.set(host,api);reset();return api;}
