/* global document, requestAnimationFrame, cancelAnimationFrame */
const mounted=new WeakMap();
export const CASES=Object.freeze([
 Object.freeze({name:'Tapahtuma A',kind:'leaf',acts:Object.freeze(['drift','still'])}),
 Object.freeze({name:'Tapahtuma B',kind:'leaf',acts:Object.freeze(['back','colour'])}),
 Object.freeze({name:'Tapahtuma C: paperiveneet',kind:'boat',acts:Object.freeze(['still','back'])}),
 Object.freeze({name:'Tapahtuma D',kind:'leaf',acts:Object.freeze(['drift','back'])}),
 Object.freeze({name:'Tapahtuma E',kind:'leaf',acts:Object.freeze(['still','colour'])})
]);
const task=i=>{if(!Number.isInteger(i)||i<0||i>=CASES.length)throw new RangeError('Unsupported motion case');return CASES[i];};
export function advance(time,elapsed){if(!Number.isFinite(time)||time<0||time>6||!Number.isFinite(elapsed)||elapsed<0)throw new RangeError('Unsupported clock');return Math.min(6,time+elapsed);}
export function frameAt(index,time){
 const c=task(index);if(!Number.isFinite(time)||time<0||time>6)throw new RangeError('Unsupported time');
 const p=Math.max(0,Math.min(1,(time-1)/4));
 return c.acts.map((act,i)=>({x:70+(act==='drift'?125*p:act==='back'&&p>0&&p<1?125*Math.sin(Math.PI*p):0),y:62+i*100,colour:act==='colour'&&time>=3?'#c79832':'#4c8060',referenceX:270,referenceY:62+i*100}));
}
export function checkMotion(index,answers){
 const c=task(index);if(!Array.isArray(answers)||answers.length!==2||Array.from(answers).some(a=>a!==true&&a!==false&&a!==null))throw new RangeError('Expected two explicit movement answers');
 const missing=answers.indexOf(null);if(missing!==-1)return{ok:false,code:'missing',message:`Valitse vielä ${missing===0?'ylemmän':'alemman'} kohteen vastaus. Voit katsoa esityksen uudelleen.`};
 const at=answers.findIndex((a,i)=>a!==['drift','back'].includes(c.acts[i]));
 if(at!==-1){const act=c.acts[at],why=act==='back'?'Kohde kävi toisessa kohdassa ja palasi alkuun. Se liikkui.':act==='drift'?'Kohteen paikka kiinteään merkkiin nähden muuttuu. Se liikkui.':act==='colour'?'Mallissa vain väri vaihtuu. Paikka pysyy samana koko esityksen ajan.':'Kohde pysyy samassa kohdassa kiinteään merkkiin nähden koko esityksen ajan.';return{ok:false,code:'position',message:`Tutki ${at===0?'ylempää':'alempaa'} kohdetta. ${why} Katso tarvittaessa uudelleen.`};}
 return{ok:true,code:'match',message:'Vastaukset sopivat tämän malliesityksen tapahtumiin. Näytä kohta, jossa paikka muuttui, tai seuraa paikallaan pysyvää kohdetta koko esityksen ajan.'};
}
export function sceneSvg(index,time){
 const c=task(index),frames=frameAt(index,time);
 const objects=frames.map((f,i)=>`<g data-object="${i}" transform="translate(${f.x} ${f.y})">${c.kind==='boat'?'<path d="M-22 0h44l-9 15h-24z" fill="#c79832" stroke="#183e36" stroke-width="2"/><path d="M0 0v-27l18 24h-18" fill="#fffaf0" stroke="#183e36" stroke-width="2"/>':`<path d="M-21 13Q-22-23 22-15Q24 21-21 13Z" fill="${f.colour}" stroke="#183e36" stroke-width="2"/><path d="M-18 11L17-11" stroke="#183e36" stroke-width="2"/>`}</g><g data-reference="${i}" transform="translate(${f.referenceX} ${f.referenceY})">${c.kind==='boat'?'<path d="M-12-12h24v24h-24z" fill="#fffaf0" stroke="#183e36" stroke-width="3"/><path d="M-8 0h16M0-8v16" stroke="#183e36" stroke-width="2"/>':'<path d="M-18 12Q-24-17-4-18Q15-21 20 12Z" fill="#a7b0a4" stroke="#183e36" stroke-width="2"/>'}</g>`).join('');
 return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220" role="img" aria-label="Kaksi ${c.kind==='boat'?'paperivenettä ja paikallaan pysyvät pöytämerkit':'lehteä ja paikallaan pysyvät kivet'}. Nykyinen kuva; seuraa paikan muutosta esityksen aikana."><rect x="8" y="24" width="304" height="72" rx="8" fill="#edf3ef"/><rect x="8" y="124" width="304" height="72" rx="8" fill="#edf3ef"/>${objects}<text x="160" y="18" text-anchor="middle" fill="#183e36" font-size="15">Ylempi kohde</text><text x="160" y="118" text-anchor="middle" fill="#183e36" font-size="15">Alempi kohde</text><text x="270" y="216" text-anchor="middle" fill="#183e36" font-size="14">Kiinteät merkit</text></svg>`;
}
export function mount(host){
 const scope=host.closest('#lesson-body')?.querySelector('[data-motion-observe]');if(!scope)throw new Error('Missing motion lesson');mounted.get(scope)?.dispose();
 let index=0,time=0,answers=[null,null],running=false,last=null,raf=0,paused=false,disposed=false;
 const el=s=>scope.querySelector(s),disabled=new Map();
 const tell=r=>{const o=el('[data-feedback]');o.textContent=r.message;o.dataset.result=r.ok?'correct':'retry';o.dataset.code=r.code;};
 const neutral=()=>{const o=el('[data-feedback]');o.textContent='Valitse vastaus kummallekin kohteelle. Tarkista, kun haluat.';o.dataset.result='neutral';delete o.dataset.code;};
 function draw(){el('[data-scene]').innerHTML=sceneSvg(index,time);const caption=time===6?'Esitys päättyi. Voit katsoa uudelleen.':running?'Esitys käy. Seuraa kohteiden paikkaa.':time===0?'Alku. Käynnistä esitys tai etene pienin askelin.':'Esitys on pysäytetty. Jatka samasta kohdasta tai ota pieni askel.';if(el('[data-phase]').textContent!==caption)el('[data-phase]').textContent=caption;el('[data-action="play"]').textContent=running?'Esitys käynnissä':time===6?'Katso uudelleen':'Käynnistä / jatka';el('[data-action="play"]').disabled=running;el('[data-action="stop"]').disabled=!running;el('[data-action="step"]').disabled=time===6;}
 function stop(){running=false;last=null;cancelAnimationFrame(raf);raf=0;}
 function loop(now){if(paused||disposed||!running)return;time=advance(time,last===null?0:Math.max(0,(now-last)/1000));last=now;if(time===6)stop();draw();if(running)raf=requestAnimationFrame(loop);}
 function render(){el('[data-case]').textContent=CASES[index].name;for(let i=0;i<2;i++)el(`[data-answer="${i}"]`).value=answers[i]===null?'':answers[i]?'yes':'no';draw();}
 function restore(){for(const[b,v]of disabled)b.disabled=v;disabled.clear();}
 function freeze(){for(const b of scope.querySelectorAll('button,select')){if(!disabled.has(b))disabled.set(b,b.disabled);b.disabled=true;}}
 function reset(){if(disposed)return;stop();restore();index=0;time=0;answers=[null,null];render();neutral();if(paused)freeze();}
 function click(e){const b=e.target.closest('button[data-action]');if(!b||!scope.contains(b)||paused||disposed)return;
  const a=b.dataset.action;if(a==='play'){if(time===6)time=0;running=true;last=null;draw();raf=requestAnimationFrame(loop);}else if(a==='stop'){stop();draw();}else if(a==='rewind'){stop();time=0;draw();}else if(a==='step'){stop();time=advance(time,.5);draw();}else if(a==='next'){stop();index=(index+1)%CASES.length;time=0;answers=[null,null];render();neutral();}else if(a==='check')tell(checkMotion(index,answers));
 }
 function change(e){if(paused||disposed||!e.target.matches('[data-answer]'))return;answers[Number(e.target.dataset.answer)]=e.target.value===''?null:e.target.value==='yes';neutral();}
 const hidden=()=>{if(document.hidden){stop();draw();if(paused)freeze();}};
 scope.addEventListener('click',click);scope.addEventListener('change',change);document.addEventListener('visibilitychange',hidden);reset();scope.dataset.moduleReady='true';
 const api={pause(){if(disposed)return;stop();draw();paused=true;freeze();},resume(){if(disposed)return;paused=false;restore();},reset,dispose(){if(disposed)return;stop();disposed=true;restore();scope.removeEventListener('click',click);scope.removeEventListener('change',change);document.removeEventListener('visibilitychange',hidden);delete scope.dataset.moduleReady;if(mounted.get(scope)===api)mounted.delete(scope);}};mounted.set(scope,api);return api;
}
