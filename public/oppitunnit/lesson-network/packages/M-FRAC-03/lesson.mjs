const mounted=new WeakMap();
const names={4:'neljäsosaa',6:'kuudesosaa',8:'kahdeksasosaa'},single={4:'neljäsosa',6:'kuudesosa',8:'kahdeksasosa'};
export const tasks=Object.freeze([
 Object.freeze({before:Object.freeze([1,4]),after:Object.freeze([3,4]),question:'Nauha: 1/4 → 3/4. Mikä säilyi? Mikä muuttui?',answers:Object.freeze(['denominator','numerator'])}),
 Object.freeze({before:Object.freeze([3,4]),after:Object.freeze([3,8]),question:'Saman kokoinen nauha: 3/4 → 3/8. Mikä säilyi? Mikä muuttui?',answers:Object.freeze(['numerator','denominator'])}),
 Object.freeze({before:Object.freeze([1,6]),after:Object.freeze([4,6]),question:'Kokonainen on kuuden lipun joukko: 1/6 → 4/6. Mikä säilyi? Mikä muuttui?',answers:Object.freeze(['denominator','numerator']),set:true})
]);
function index(i){if(!Number.isInteger(i)||i<0||i>=tasks.length)throw new RangeError('Invalid role task');return tasks[i];}
export function model(n,d){if(!Number.isInteger(n)||!Number.isInteger(d)||d<1||d>12||n<0||n>d)throw new RangeError('Invalid part whole');return{numerator:n,denominator:d,unit:1/d,value:n/d};}
export function checkRoles(i,answers){const q=index(i);if(!Array.isArray(answers)||answers.length!==2||![0,1].every(k=>Object.hasOwn(answers,k)&&['numerator','denominator'].includes(answers[k])))return{ok:false,code:'incomplete',message:'Valitse kumpaankin kohtaan osoittaja tai nimittäjä. Voit katsoa kuvia.'};
 const ok=answers.every((a,k)=>a===q.answers[k]);return{ok,code:ok?'match':'roles',message:ok?(q.answers[0]==='denominator'?'Oikein: nimittäjä säilyi. Osan koko ja kokonaisen jako pysyivät samoina; osoittaja kertoi uuden valittujen osien määrän.':'Oikein: osoittaja säilyi. Valittuja osia oli yhä kolme, mutta nimittäjä vaihtui: saman kokonaisen osat pienenivät.'):(q.answers[0]==='denominator'?'Katso alalukua: jako pysyy samana. Yläluku muuttuu, koska valittujen osien määrä muuttuu.':'Katso ylälukua: valittuja osia on yhä kolme. Alaluku muuttuu, koska kokonainen jaetaan nyt kahdeksaan yhtä suureen osaan.')};}
export function fractionSvg(n,d,set=false){model(n,d);if(typeof set!=='boolean')throw new RangeError('Invalid representation');let art='';for(let j=0;j<d;j++){const x=24+j*272/d,w=272/d,on=j<n;if(set)art+=`<line x1="${x+3}" y1="45" x2="${x+3}" y2="120" stroke="#183e36" stroke-width="2"/><path d="M${x+3} 45h${w-7}v42h-${w-7}z" fill="${on?'#245f4c':'#fffaf0'}" stroke="#183e36"/><text x="${x+w/2}" y="72" text-anchor="middle" fill="${on?'white':'#183e36'}" font-size="15">${on?'✓':'·'}</text>`;else art+=`<rect x="${x}" y="56" width="${w}" height="56" fill="${on?'#245f4c':'#fffaf0'}" stroke="#183e36"/><text x="${x+w/2}" y="91" text-anchor="middle" fill="${on?'white':'#183e36'}" font-size="18">${on?'✓':'·'}</text>`;}
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 170" role="img" aria-label="Yksi kokonainen: ${set?'koko '+d+' lipun joukko':'koko nauha'}. ${d} yhtä suurta osaa, ${n} valittu. ${n}/${d}."><text x="160" y="25" text-anchor="middle" fill="#183e36" font-size="16">Kokonainen: ${set?'kaikki liput':'koko nauha'}</text>${art}<text x="160" y="152" text-anchor="middle" fill="#183e36" font-size="20">${n}/${d}</text></svg>`;}
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

export function mount(host){const scope=host.closest('#lesson-body')?.querySelector('[data-role-lesson]');if(!scope)throw new Error('Missing roles lesson');mounted.get(scope)?.dispose();let n=3,d=4,task=0,paused=false,disposed=false;const disabled=new Map(),el=s=>scope.querySelector(s),out=el('[data-feedback]');
 const freeze=()=>{for(const b of scope.querySelectorAll('button,input,select')){if(!disabled.has(b))disabled.set(b,b.disabled);b.disabled=true;}};
 const restore=()=>{for(const[b,v]of disabled)b.disabled=v;disabled.clear();};
 const neutral=()=>{out.textContent='Tutki kuvia ja valitse. Tarkista halutessasi.';out.dataset.result='neutral';delete out.dataset.code;};
 function draw(){el('[data-model]').innerHTML=fractionSvg(n,d);el('[data-count]').textContent=`${n}/${d}: osoittaja ${n} kertoo valittujen osien määrän. Nimittäjä ${d} nimeää osan: 1/${d} kokonaisesta. Koko nauhassa on ${d} yhtä suurta osaa.`;el('[data-n]').textContent=String(n);el('[data-d]').value=String(d);el('[data-action="minus"]').disabled=n===0;el('[data-action="plus"]').disabled=n===4;el('[data-unit-name]').textContent=`${n} ${n===1?single[d]:names[d]}`;}
 function drawTask(){const q=tasks[task];el('[data-task]').textContent=q.question;el('[data-before]').innerHTML=fractionSvg(...q.before,!!q.set);el('[data-after]').innerHTML=fractionSvg(...q.after,!!q.set);for(const s of scope.querySelectorAll('[data-role-answer]'))s.value='';neutral();}
  const modelContext = createModelContext(
  () => ({n, d}),
  state => { restore(); n = state.n; d = state.d; draw(); if (paused) freeze(); },
  preset => { if (preset !== 'zero-quarters') throw new RangeError('Unsupported fraction context'); return {n: 0, d: 4}; }
 );
function reset(){if(disposed)return;modelContext.clear();restore();n=3;d=4;task=0;draw();drawTask();if(paused)freeze();}
 function click(e){const b=e.target.closest('button');if(!b||!scope.contains(b)||paused||disposed||b.disabled)return;switch(b.dataset.action){case'plus':n=Math.min(4,n+1);draw();break;case'minus':n=Math.max(0,n-1);draw();break;case'unit':n=1;draw();break;case'model-reset':n=3;d=4;draw();break;case'check':{const r=checkRoles(task,[el('[data-role-answer="same"]').value,el('[data-role-answer="change"]').value]);out.textContent=r.message;out.dataset.result=r.ok?'correct':'retry';out.dataset.code=r.code;break;}case'next':task=(task+1)%tasks.length;drawTask();break;case'clear':drawTask();break;}}
 function commit(e){if(paused||disposed)return;if(e.target.matches('[data-d]')){const next=Number(e.target.value);if([4,6,8].includes(next)){d=next;draw();}}else if(e.target.matches('[data-role-answer]'))neutral();}
 scope.addEventListener('click',click);scope.addEventListener('input',commit);scope.addEventListener('change',commit);reset();scope.dataset.moduleReady='true';const api={pause(){if(disposed)return;paused=true;freeze();},resume(){if(disposed)return;paused=false;restore();},reset,context(request){if(!disposed)modelContext.transition(request);},dispose(){if(disposed)return;modelContext.clear();disposed=true;restore();scope.removeEventListener('click',click);scope.removeEventListener('input',commit);scope.removeEventListener('change',commit);delete scope.dataset.moduleReady;if(mounted.get(scope)===api)mounted.delete(scope);}};mounted.set(scope,api);return api;
}
