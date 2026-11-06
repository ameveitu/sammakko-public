const mounted=new WeakMap();
const names=Object.freeze({penkki:'Penkki',kivi:'Kiven vieri',alusta:'Pöytäalusta'});
const things=Object.freeze({lehti:'Lehti',kukka:'Kukka',kivi:'Kivi'});
const make=rows=>Object.freeze(rows.map(r=>Object.freeze(r)));
export const CASES=Object.freeze([
 make([{place:'penkki',item:'lehti'},{place:'kivi',item:'kukka'}]),
 make([{place:'penkki',item:'kukka'},{place:'kivi',item:'lehti'}]),
 make([{place:'alusta',item:'kivi'},{place:'kivi',item:'lehti'},{place:'penkki',item:'kukka'}])
]);
const task=i=>{if(!Number.isInteger(i)||i<0||i>=CASES.length)throw new RangeError('Unsupported record case');return CASES[i];};
export function checkRecord(index,rows){
 const expected=task(index);if(!Array.isArray(rows)||Array.from(rows).some(r=>!r||typeof r!=='object'||Array.isArray(r)||Object.keys(r).sort().join(',')!=='item,place'||!Object.hasOwn(names,r.place)||(r.item!==null&&!Object.hasOwn(things,r.item))))throw new RangeError('Unsupported notebook');
 if(rows.length!==expected.length)return{ok:false,code:'rows',message:`Tässä mallissa on ${expected.length} paikkaa. Tee yksi merkintä jokaiseen niistä.`};
 if(new Set(rows.map(r=>r.place)).size!==rows.length)throw new RangeError('Repeated place');
 for(const q of expected){const r=rows.find(r=>r.place===q.place);if(!r||r.item===null)return{ok:false,code:'missing',message:`Paikan ${names[q.place].toLowerCase()} merkintä puuttuu. Katso mallikuvaa ja valitse siinä näkyvä asia.`};if(r.item!==q.item)return{ok:false,code:'item',message:`Vertaa paikkaa ${names[q.place].toLowerCase()}. Mallissa siinä näkyy ${things[q.item].toLowerCase()}. Korjaa tämän paikan merkintä; muut sopivat merkinnät saavat jäädä.`};}
 return{ok:true,code:'match',message:'Jokaisen paikan merkintä vastaa näkyvää mallihavaintoa. Näytä yksi merkintä ja sen lähteenä oleva kohta. Tämä on harjoitusvihko, ei oikea retkikirjaus.'};
}
function icon(item){if(item==='lehti')return'<path d="M-18 13Q-22-19 20-15Q22 20-18 13Z" fill="#68936a" stroke="#183e36" stroke-width="2"/><path d="M-15 10L15-10" stroke="#183e36" stroke-width="2"/>';if(item==='kukka')return'<path d="M0 0v24" stroke="#3d7456" stroke-width="3"/><circle cx="0" cy="-8" r="14" fill="#d99c84" stroke="#183e36" stroke-width="2"/><circle cx="0" cy="-8" r="5" fill="#f0d57d"/>';return'<path d="M-20 12Q-23-16-3-17Q14-20 21 12Z" fill="#a7b0a4" stroke="#183e36" stroke-width="2"/>';}
export function observationSvg(index){const rows=task(index);return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 ${rows.length*90}" role="img" aria-label="Mallihavainnot: ${rows.map(r=>names[r.place]+': '+things[r.item]).join('. ')}.">${rows.map((r,i)=>`<rect x="8" y="${i*90+8}" width="304" height="76" rx="8" fill="#edf3ef"/><text x="20" y="${i*90+37}" font-size="18" fill="#183e36">${names[r.place]}</text><g transform="translate(258 ${i*90+42})">${icon(r.item)}</g>`).join('')}</svg>`;}
export function mount(host){
 const scope=host.closest('#lesson-body')?.querySelector('[data-record-data]');if(!scope)throw new Error('Missing recording lesson');mounted.get(scope)?.dispose();
 let index=0,rows=[],step=0,paused=false,disposed=false;const el=s=>scope.querySelector(s),disabled=new Map();
 const neutral=()=>{const o=el('[data-feedback]');o.textContent='Vertaa merkintöjä mallikuvaan ja tarkista, kun haluat.';o.dataset.result='neutral';delete o.dataset.code;};
 const captions=['Katso mallipaikkaa: penkillä on lehti.','Merkitse lehden kuva vihkon Penkki-riville.','Vertaa merkintää lähteeseen: sama paikka ja sama asia. Sitten toinen paikka.'];
 function render(){el('[data-observations]').innerHTML=observationSvg(index);el('[data-task]').textContent=index===1?'Korjaa mallivihkon kaksi vaihtunutta merkintää.':index===2?'Uusi tilanne: kolme paikkaa. Tee jokaisen paikan merkintä.':'Tee mallihavaintojen merkinnät.';el('[data-rows]').innerHTML=rows.map((r,i)=>`<label>${names[r.place]}<select data-row="${i}"><option value="">Valitse havaittu asia</option>${Object.entries(things).map(([key,name])=>`<option value="${key}"${r.item===key?' selected':''}>${name}</option>`).join('')}</select></label>`).join('');}
 function demo(){el('[data-demo-caption]').textContent=captions[step];el('[data-demo-mark]').textContent=step===0?'Penkki: merkintä odottaa':'Penkki: lehti';el('[data-action="demo-step"]').disabled=step===2;}
 function load(){rows=CASES[index].map((r,i)=>({place:r.place,item:index===1?CASES[index][(i+1)%2].item:null}));render();neutral();}
 function restore(){for(const[b,v]of disabled)b.disabled=v;disabled.clear();}
 function freeze(){for(const b of scope.querySelectorAll('button,select')){if(!disabled.has(b))disabled.set(b,b.disabled);b.disabled=true;}}
 function reset(){if(disposed)return;restore();index=0;step=0;load();demo();if(paused)freeze();}
 function click(e){const b=e.target.closest('button[data-action]');if(!b||!scope.contains(b)||paused||disposed)return;const a=b.dataset.action;if(a==='check'){const r=checkRecord(index,rows),o=el('[data-feedback]');o.textContent=r.message;o.dataset.result=r.ok?'correct':'retry';o.dataset.code=r.code;}else if(a==='next'){index=(index+1)%CASES.length;load();}else if(a==='clear'){rows=rows.map(r=>({...r,item:null}));render();neutral();}else if(a==='reorder'){rows.reverse();render();}else if(a==='demo-step'){step=Math.min(2,step+1);demo();}else if(a==='demo-reset'){step=0;demo();}}
 function change(e){if(paused||disposed||!e.target.matches('[data-row]'))return;rows[Number(e.target.dataset.row)].item=e.target.value||null;neutral();}
 scope.addEventListener('click',click);scope.addEventListener('change',change);reset();scope.dataset.moduleReady='true';
 const api={pause(){if(disposed)return;paused=true;freeze();},resume(){if(disposed)return;paused=false;restore();},reset,dispose(){if(disposed)return;disposed=true;restore();scope.removeEventListener('click',click);scope.removeEventListener('change',change);delete scope.dataset.moduleReady;if(mounted.get(scope)===api)mounted.delete(scope);}};mounted.set(scope,api);return api;
}
