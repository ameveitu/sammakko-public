/* global document, requestAnimationFrame, cancelAnimationFrame */
const mounted=new WeakMap();
export const CASES=Object.freeze({
 stop:Object.freeze({label:'1. Lehti',kind:'leaf',question:'Miten liike jatkui loppupuolella?',options:Object.freeze(['stop','go']),answer:'stop',explanation:'Lehti liikkui aluksi, mutta jäi sitten samaan kohtaan kiveen nähden.'}),
 faster:Object.freeze({label:'2. Lehti',kind:'leaf',question:'Vertaa alun ja loppupuolen etenemistä yhtä pitkän ajan aikana.',options:Object.freeze(['faster','slower','steady']),answer:'faster',explanation:'Loppupuolella lehti etenee samassa ajassa pidemmälle kuin alussa. Se nopeutui.'}),
 turn:Object.freeze({label:'3. Lehti',kind:'leaf',question:'Miten kulkusuunta muuttui?',options:Object.freeze(['same','back']),answer:'back',explanation:'Lehti kulki ensin kiveä kohti ja lähti sitten takaisin. Kulkusuunta vaihtui.'}),
 slower:Object.freeze({label:'4. Lehti',kind:'leaf',question:'Vertaa alun ja loppupuolen etenemistä yhtä pitkän ajan aikana.',options:Object.freeze(['faster','slower','steady']),answer:'slower',explanation:'Loppupuolella lehti etenee samassa ajassa vähemmän kuin alussa. Se hidastui, mutta liikkui edelleen.'}),
 steady:Object.freeze({label:'5. Lehti',kind:'leaf',question:'Vertaa alun ja loppupuolen etenemistä yhtä pitkän ajan aikana.',options:Object.freeze(['faster','slower','steady']),answer:'steady',explanation:'Lehti kulkee samaan suuntaan ja etenee koko mallissa yhtä paljon yhtä pitkässä ajassa.'}),
 transfer:Object.freeze({label:'6. Paperivene',kind:'boat',question:'Mitä vene teki ensin, keskellä ja lopuksi?',options:Object.freeze(['go','stop','back']),answer:Object.freeze(['go','stop','back']),explanation:'Ensin vene kulki merkkiä kohti, keskellä se jäi paikalleen, ja lopuksi se lähti takaisin.'})
});
export const WORDS=Object.freeze({stop:'Pysähtyi ja jäi paikalleen',go:'Jatkoi liikkumista samaan suuntaan',faster:'Nopeutui',slower:'Hidastui',steady:'Eteni samalla tavalla',same:'Jatkoi samaan suuntaan',back:'Lähti takaisin'});
const task=key=>{if(typeof key!=='string'||!Object.hasOwn(CASES,key))throw new RangeError('Unsupported motion');return CASES[key];};
export function positionAt(key,t){
 task(key);if(!Number.isFinite(t)||t<0||t>6)throw new RangeError('Unsupported time');
 let x;if(key==='stop')x=60+30*Math.min(t,3);else if(key==='faster')x=60+15*Math.min(t,3)+45*Math.max(0,t-3);else if(key==='slower')x=60+45*Math.min(t,3)+15*Math.max(0,t-3);else if(key==='turn')x=60+30*Math.min(t,3)-30*Math.max(0,t-3);else if(key==='transfer')x=60+40*Math.min(t,2)-40*Math.max(0,t-4);else x=60+30*t;
 return{x,y:84,referenceX:285,referenceY:84};
}
export function advance(t,elapsed){if(!Number.isFinite(t)||t<0||t>6||!Number.isFinite(elapsed)||elapsed<0)throw new RangeError('Unsupported clock');return Math.min(6,t+elapsed);}
export function checkChange(key,answer){
 const c=task(key);
 if(key==='transfer'){
  if(!Array.isArray(answer)||answer.length!==3||Array.from(answer).some(a=>a!==null&&!c.options.includes(a)))throw new RangeError('Expected three dense supported stages');
  if(answer.includes(null))return{ok:false,code:'missing',message:'Valitse vastaus jokaiseen kolmesta kohdasta. Voit katsoa veneen tapahtuman uudelleen.'};
  const at=answer.findIndex((a,i)=>a!==c.answer[i]);if(at!==-1)return{ok:false,code:'stage',message:`Katso ${['alkua','keskiosaa','loppua'][at]} uudelleen. ${c.explanation}`};
 }else{
  if(answer===null||answer==='')return{ok:false,code:'missing',message:'Valitse vastaus kysymykseen. Saat katsoa ja pysäyttää esitystä.'};
  if(!c.options.includes(answer))throw new RangeError('Unsupported answer for question');
  if(answer!==c.answer)return{ok:false,code:'change',message:`Katso kysymyksessä mainittua asiaa uudelleen. ${c.explanation}`};
 }
 return{ok:true,code:'match',message:`Vastaus sopii malliin. ${c.explanation} Näytä kohta, johon vertailusi perustuu.`};
}
export function sceneSvg(key,t,help=false){const c=task(key),p=positionAt(key,t);return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 175" role="img" aria-label="Nykyinen mallikuva: ${c.kind==='boat'?'paperivene':'lehti'} ja kiinteä merkki. Seuraa muutosta toistossa."><rect x="8" y="27" width="304" height="106" rx="10" fill="#edf3ef"/><path d="M20 115H304" stroke="#93b5bd" stroke-width="3"/><g data-mover transform="translate(${p.x} ${p.y})">${c.kind==='boat'?'<path d="M-22 0h44l-10 15h-24z" fill="#c79832" stroke="#183e36" stroke-width="2"/><path d="M0 0v-26l17 24h-17" fill="#fffaf0" stroke="#183e36" stroke-width="2"/>':'<path d="M-19 12Q-22-21 21-14Q23 19-19 12Z" fill="#69926a" stroke="#183e36" stroke-width="2"/><path d="M-16 9L16-11" stroke="#183e36" stroke-width="2"/>'}</g><g data-reference transform="translate(285 84)"><path d="M-17 13Q-22-16-2-17Q16-17 19 13Z" fill="#a7b0a4" stroke="#183e36" stroke-width="2"/></g><text x="310" y="157" text-anchor="end" font-size="15" fill="#183e36">Kiinteä merkki</text>${help?`<path d="M60 40v65" stroke="#8d4314" stroke-dasharray="4 3" stroke-width="2"/><text x="15" y="20" font-size="15" fill="#183e36">Katkoviiva: lähtöpaikka</text>`:''}</svg>`;}
export function mount(host){
 const scope=host.closest('#lesson-body')?.querySelector('[data-motion-change]');if(!scope)throw new Error('Missing motion-change lesson');mounted.get(scope)?.dispose();
 let key='stop',t=0,answer=null,stages=[null,null,null],help=false,running=false,last=null,raf=0,paused=false,disposed=false;const el=s=>scope.querySelector(s),disabled=new Map();
 const neutral=()=>{const o=el('[data-feedback]');o.textContent='Katso tapahtumaa. Valitse vastauksesi ja tarkista, kun haluat.';o.dataset.result='neutral';delete o.dataset.code;};
 function draw(){el('[data-scene]').innerHTML=sceneSvg(key,t,help);const text=t===6?'Toisto päättyi. Näyttöön jäävä kuva ei ole uusi pysähdys mallissa.':running?'Esitys käy. Seuraa tapahtumaa.':t===0?'Käynnistä esitys tai etene pienin askelin.':'Toisto on pysäytetty katsomista varten.';if(el('[data-phase]').textContent!==text)el('[data-phase]').textContent=text;el('[data-action="play"]').disabled=running;el('[data-action="stop"]').disabled=!running;el('[data-action="step"]').disabled=t===6;}
 function render(){const c=CASES[key];el('[data-case]').value=key;el('[data-question]').textContent=c.question;el('[data-answer-area]').hidden=key==='transfer';el('[data-stages]').hidden=key!=='transfer';el('[data-answer]').innerHTML='<option value="">Valitse vastaus</option>'+c.options.map(v=>`<option value="${v}"${v===answer?' selected':''}>${WORDS[v]}</option>`).join('');for(let i=0;i<3;i++)el(`[data-stage="${i}"]`).value=stages[i]??'';el('[data-help]').checked=help;draw();}
 function stop(){running=false;last=null;cancelAnimationFrame(raf);raf=0;}
 function tick(now){if(!running||paused||disposed)return;t=advance(t,last===null?0:Math.max(0,(now-last)/1000));last=now;if(t===6)stop();draw();if(running)raf=requestAnimationFrame(tick);}
 function restore(){for(const[b,v]of disabled)b.disabled=v;disabled.clear();}
 function freeze(){for(const b of scope.querySelectorAll('button,select,input')){if(!disabled.has(b))disabled.set(b,b.disabled);b.disabled=true;}}
 function reset(){if(disposed)return;stop();restore();key='stop';t=0;answer=null;stages=[null,null,null];help=false;render();neutral();if(paused)freeze();}
 function change(e){if(paused||disposed)return;if(e.target.matches('[data-case]')){stop();key=e.target.value;t=0;answer=null;stages=[null,null,null];render();neutral();}else if(e.target.matches('[data-answer]')){answer=e.target.value||null;neutral();}else if(e.target.matches('[data-stage]')){stages[Number(e.target.dataset.stage)]=e.target.value||null;neutral();}else if(e.target.matches('[data-help]')){help=e.target.checked;draw();}}
 function click(e){const b=e.target.closest('button[data-action]');if(!b||!scope.contains(b)||paused||disposed)return;const a=b.dataset.action;if(a==='play'){if(t===6)t=0;running=true;last=null;draw();raf=requestAnimationFrame(tick);}else if(a==='stop'){stop();draw();}else if(a==='rewind'){stop();t=0;draw();}else if(a==='step'){stop();t=advance(t,.5);draw();}else if(a==='check'){answer=el('[data-answer]').value||null;stages=Array.from({length:3},(_,i)=>el(`[data-stage="${i}"]`).value||null);const r=checkChange(key,key==='transfer'?stages:answer),o=el('[data-feedback]');o.textContent=r.message;o.dataset.result=r.ok?'correct':'retry';o.dataset.code=r.code;}}
 const hidden=()=>{if(document.hidden){stop();draw();if(paused)freeze();}};scope.addEventListener('input',change);scope.addEventListener('change',change);scope.addEventListener('click',click);document.addEventListener('visibilitychange',hidden);reset();scope.dataset.moduleReady='true';
 const api={pause(){if(disposed)return;stop();draw();paused=true;freeze();},resume(){if(disposed)return;paused=false;restore();},reset,dispose(){if(disposed)return;stop();disposed=true;restore();scope.removeEventListener('input',change);scope.removeEventListener('change',change);scope.removeEventListener('click',click);document.removeEventListener('visibilitychange',hidden);delete scope.dataset.moduleReady;if(mounted.get(scope)===api)mounted.delete(scope);}};mounted.set(scope,api);return api;
}
