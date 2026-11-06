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

const mounted=new WeakMap();
export const CASES=Object.freeze({ribbon:Object.freeze({name:'Nauha',length:4,start:Object.freeze([])}),gap:Object.freeze({name:'Nauha, jossa jäi väli mittapaloihin',length:4,start:Object.freeze([0,1,3])}),overlap:Object.freeze({name:'Nauha, jossa mittapalat ovat päällekkäin',length:4,start:Object.freeze([0,1,1,3])}),card:Object.freeze({name:'Pahvisuikale',length:3,start:Object.freeze([])})});
const task=key=>{if(!Object.hasOwn(CASES,key))throw new RangeError('Unknown measurement');return CASES[key];};
export function validStarts(key,starts){const c=task(key);if(!Array.isArray(starts)||starts.length>c.length+2||Object.keys(starts).length!==starts.length)return false;for(let i=0;i<starts.length;i++)if(!Object.hasOwn(starts,i)||!Number.isInteger(starts[i])||starts[i]<0||starts[i]>c.length+1)return false;return true;}
export function checkTiling(key,a){
 const c=task(key),fail=(code,text)=>({ok:false,code,text});
 if(!a||typeof a!=='object'||Array.isArray(a)||Object.keys(a).sort().join(',')!=='reported,starts'||!validStarts(key,a.starts)||(a.reported!==null&&(!Number.isInteger(a.reported)||a.reported<0||a.reported>12)))return fail('invalid','Vastaus ei ole ehjä. Käytä samanmittaisia paloja ja yhtä kokonaislukua.');
 const s=[...a.starts].sort((x,y)=>x-y);
 if(!s.length)return fail('empty','Lisää mittapaloja. Aloita esineen alkupäästä.');
 if(s[0]!==0)return fail('start','Ensimmäinen mittapala alkaa vasta esineen alkupään jälkeen. Siirrä se alkuviivalle.');
 for(let i=1;i<s.length;i++)if(s[i]<s[i-1]+1)return fail('overlap','Kaksi mittapalaa on samassa kohdassa. Mittapalat eivät saa olla päällekkäin. Valitse toinen niistä ja siirrä sitä.');
 for(let i=1;i<s.length;i++)if(s[i]>s[i-1]+1)return fail('gap','Mittapalojen väliin jäi rako. Siirrä pala edellisen viereen tai lisää puuttuva pala.');
 if(s.at(-1)+1<c.length)return fail('short','Esinettä jäi mittaamatta. Lisää yhtä pitkä pala seuraavaksi.');
 if(s.at(-1)+1>c.length)return fail('long','Mittapala ulottuu esineen lopun yli. Ota ylimääräinen pala pois tai siirrä paloja.');
 if(a.reported===null)return fail('number-empty','Palat peittävät koko pituuden. Laske ne ja merkitse pituuden luku.');
 if(a.reported!==s.length)return fail('number',`Tässä on ${s.length} yhtä pitkää mittapalaa. Laske palat, älä niiden rajaviivoja: esine on ${s.length} mittapalaa pitkä.`);
 return{ok:true,code:'match',text:`Malli on mitattu alkupäästä loppupäähän: ${s.length} samanmittaista palaa ilman rakoja tai päällekkäisyyttä. Merkintäsi ${a.reported} mittapalaa vastaa sitä. Tämä ei vielä osoita oikeiden mittapalojen käsittelyä.`};
}
export function tilingKey(key,a){return JSON.stringify([key,[...a.starts].sort((x,y)=>x-y),a.reported]);}
export function tilingSvg(key,starts,selected=-1,guide=false){
 const c=task(key);if(!validStarts(key,starts))throw new RangeError('Invalid measurement pieces');const u=42,x=v=>24+v*u;
 const pieces=starts.map((p,i)=>`<g data-piece-index="${i}" data-start="${p}"><rect x="${x(p)}" y="100" width="${u}" height="32" fill="${starts.filter(s=>s===p).length>1?'#dfa798':'#ebce7b'}" fill-opacity=".78" stroke="${selected===i?'#236051':'#655223'}" stroke-width="${selected===i?3:1.5}"/><text x="${x(p)+u/2}" y="${122+starts.slice(0,i).filter(s=>s===p).length*30}" text-anchor="middle" fill="#183e36" font-size="20">${i+1}</text></g>`).join('');
 return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 210" role="img" aria-label="${c.name}. ${starts.length} mittapalaa. Palat ovat samanpituisia. ${starts.map((p,i)=>`Palan ${i+1} alku on ${p} mittapalan päässä alkuviivasta`).join('. ')}. Valitse pala sen painikkeesta, jos haluat siirtää sitä."><title>Samanmittaisten mittapalojen sijoittelu</title><rect width="360" height="210" rx="10" fill="#fffdf7"/><text x="18" y="25" font-size="20" fill="#183e36">${c.name.split(',')[0]}</text><rect data-measured="true" x="24" y="47" width="${c.length*u}" height="30" fill="#a6c6d6" stroke="#183e36" stroke-width="2"/><path d="M24 38V170M${x(c.length)} 38V170" stroke="#183e36" stroke-dasharray="4 3" stroke-width="2"/>${guide?Array.from({length:c.length+1},(_,i)=>`<path d="M${x(i)} 85V140" stroke="#517566" stroke-dasharray="2 3"/>`).join(''):''}${pieces}<text x="24" y="195" fill="#183e36" font-size="17">Yksi mittapala on yksi yksikkö.</text></svg>`;
}
export function mount(host){
 const root=host.closest('#lesson-body')||host,scope=root.querySelector('[data-unit-measure]');if(!scope)throw new Error('Missing unit measurement');mounted.get(scope)?.dispose();
 const q=s=>scope.querySelector(s),fieldset=q('[data-controls]'),picker=q('[data-case]'),report=q('[data-reported]'),feedback=q('[data-feedback]');let key='ribbon',starts=[],selected=-1,checked=null,paused=false,disposed=false;
 const answer=()=>({starts:[...starts],reported:report.value.trim()===''?null:Number(report.value)}),signature=()=>tilingKey(key,answer());
 const neutral=()=>{feedback.textContent='Mittausta muokattiin. Tarkista nykyinen sijoittelu ja luku uudelleen, kun haluat.';feedback.dataset.result='neutral';checked=null;};
 function invalidate(){if(checked!==null&&checked!==signature())neutral();}
 function draw(){q('[data-picture]').innerHTML=tilingSvg(key,starts,selected,q('[data-guide]').checked);q('[data-piece-buttons]').innerHTML=starts.map((_,i)=>`<button type="button" data-piece="${i}" aria-pressed="${selected===i}">Pala ${i+1}</button>`).join('');q('[data-action="add"]').disabled=starts.length>=CASES[key].length+2;q('[data-action="remove"]').disabled=selected<0;q('[data-shift="-1"]').disabled=selected<0||starts[selected]===0;q('[data-shift="1"]').disabled=selected<0||starts[selected]>=CASES[key].length+1;}
 function fresh(){starts=[...CASES[key].start];selected=starts.length-1;report.value='';checked=null;feedback.textContent='Voit lisätä, siirtää ja ottaa pois mittapaloja. Tarkista lopuksi sijoittelu ja pituuden luku.';feedback.dataset.result='neutral';draw();}
 function reset(){if(disposed)return;key='ribbon';picker.value=key;q('[data-guide]').checked=false;fresh();fieldset.disabled=paused;}
 function edit(e){if(paused||disposed||!scope.contains(e.target))return;if(e.target.matches('[data-case]')){if(Object.hasOwn(CASES,picker.value)&&picker.value!==key){key=picker.value;fresh();}else picker.value=key;}else if(e.target.matches('[data-reported]'))invalidate();else if(e.target.matches('[data-guide]'))draw();}
 function click(e){if(paused||disposed)return;const b=e.target.closest('button');if(!b||!scope.contains(b))return;
  if(b.hasAttribute('data-piece')){selected=Number(b.dataset.piece);draw();return;}
  if(b.hasAttribute('data-shift')){if(selected>=0){const p=starts[selected]+Number(b.dataset.shift);if(p>=0&&p<=CASES[key].length+1){starts[selected]=p;invalidate();draw();}}return;}
  if(b.dataset.action==='add'&&starts.length<CASES[key].length+2){starts.push(starts.length?Math.min(CASES[key].length+1,starts.at(-1)+1):0);selected=starts.length-1;invalidate();draw();}
  else if(b.dataset.action==='remove'&&selected>=0){starts.splice(selected,1);selected=starts.length-1;invalidate();draw();}
  else if(b.dataset.action==='check'){const r=checkTiling(key,answer());feedback.textContent=r.text;feedback.dataset.result=r.ok?'correct':'retry';checked=signature();}
 }
 const contexts=lessonContexts(
  ()=>({key,starts:[...starts],selected,checked,report:report.value,guide:q('[data-guide]').checked,feedback:contextFeedback(feedback)}),
  state=>{key=state.key;picker.value=key;starts=[...state.starts];selected=state.selected;checked=state.checked;report.value=state.report;q('[data-guide]').checked=state.guide;draw();restoreContextFeedback(feedback,state.feedback);fieldset.disabled=paused;},
  preset=>{if(preset!=='card')throw new RangeError('Unsupported measurement context');key='card';picker.value=key;q('[data-guide]').checked=false;fresh();fieldset.disabled=paused;}
 );
 fieldset.disabled=false;scope.addEventListener('click',click);scope.addEventListener('input',edit);scope.addEventListener('change',edit);reset();scope.dataset.moduleReady='true';
 const api={pause(){if(disposed)return;paused=true;fieldset.disabled=true;},resume(){if(disposed)return;paused=false;fieldset.disabled=false;if(Object.hasOwn(CASES,picker.value)&&picker.value!==key){key=picker.value;fresh();}else{picker.value=key;invalidate();draw();}},context(request){if(!disposed)contexts.change(request);},reset(){contexts.clear();reset();},dispose(){if(disposed)return;contexts.clear();disposed=true;fieldset.disabled=true;scope.removeEventListener('click',click);scope.removeEventListener('input',edit);scope.removeEventListener('change',edit);delete scope.dataset.moduleReady;if(mounted.get(scope)===api)mounted.delete(scope);}};mounted.set(scope,api);return api;
}
