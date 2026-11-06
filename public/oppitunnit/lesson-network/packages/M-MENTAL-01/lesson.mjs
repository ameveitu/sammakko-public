const int=(n,max=100)=>typeof n==='number'&&Number.isInteger(n)&&n>=0&&n<=max;
const own=(o,k)=>typeof k==='string'&&Object.hasOwn(o,k);
export const CASES=Object.freeze({add:Object.freeze({a:38,b:7,op:'+',first:2,text:'38 + 7: jaa lisättävä 7 kahteen osaan.'}),subtract:Object.freeze({a:53,b:8,op:'−',first:3,text:'53 − 8: jaa pois otettava 8 kahteen osaan.'}),tens:Object.freeze({a:46,b:24,op:'+',first:20,text:'46 + 24: jaa lisättävä 24 kahteen osaan.'}),transfer:Object.freeze({a:57,b:9,op:'−',first:7,text:'Uusi tilanne: naru on 57 palaa pitkä. Siitä leikataan yhteensä 9 palaa. Jaa pois otettava 9 kahteen osaan.'})});
export function readWhole(raw){return typeof raw==='string'&&/^\s*\d{1,3}\s*$/.test(raw)&&int(Number(raw.trim()))?Number(raw.trim()):NaN;}
function dense(a,n){return Array.isArray(a)&&a.length===n&&Reflect.ownKeys(a).length===n+1&&Array.from({length:n},(_,i)=>Object.hasOwn(a,i)).every(Boolean);}
export function route(a,b,op,p,q){
 if(!int(a)||!int(b)||!['+','−'].includes(op)||!int(p)||!int(q)||p+q!==b)return null;
 const sign=op==='+'?1:-1,mid=a+sign*p,end=a+sign*b;if(!int(mid)||!int(end))return null;
 return Object.freeze({a,b,op,p,q,mid,end,firstDecade:mid%10===0});
}
export function checkSplit(key,answer){
 if(!own(CASES,key)||!dense(answer,3))return{ok:false,message:'Kirjoita kaksi osaa ja lopputulos.'};
 const c=CASES[key],[p,q,total]=answer;if(!int(p)||!int(q)||!int(total))return{ok:false,message:'Kirjoita kaikki kolme lukua. Tyhjä ruutu ei ole nolla.'};
 if(p+q!==c.b)return{ok:false,message:`Osien pitää säilyttää luku ${c.b}. Nyt ${p} + ${q} = ${p+q}.`};
 const r=route(c.a,c.b,c.op,p,q);if(!r)return{ok:false,message:'Tämä reitti ei kuulu harjoituksen lukualueelle 0–100.'};
 if(total!==r.end)return{ok:false,message:`Hajotelma ${p} + ${q} säilyttää luvun ${c.b}. Laske vielä ${c.a} ${c.op} ${p} = ${r.mid}, sitten ${r.mid} ${c.op} ${q}.`};
 return{ok:true,firstDecade:r.firstDecade,message:`Toimiva hajotelma: ${c.b} = ${p} + ${q}. ${c.a} ${c.op} ${p} = ${r.mid}, ja ${r.mid} ${c.op} ${q} = ${total}. ${r.firstDecade?'Ensimmäinen askel päätyy tasakymppiin.':'Ensimmäinen askel ei päädy tasakymppiin, mutta lasku on silti oikein.'}${p===0||q===0?' Toinen osa on nolla; voit kokeilla myös kahta pienempää osaa.':''}`};
}
export function modelSvg(key,p,stage=2){
 if(!own(CASES,key)||!int(p,CASES[key].b)||!int(stage,2))return'';const c=CASES[key],r=route(c.a,c.b,c.op,p,c.b-p);if(!r)return'';
 let t=`<text x="180" y="25" text-anchor="middle" font-size="24">${c.a} ${c.op} ${c.b}</text>`;
 for(let i=0;i<c.b;i++)t+=`<circle data-part="${i<p?'first':'rest'}" cx="${45+(i%10)*29}" cy="${54+Math.floor(i/10)*26}" r="8" fill="${i<p?'#328372':'#d7aa5f'}" stroke="#234b40" stroke-width="1.3"/>`;
 t+=`<text x="180" y="145" text-anchor="middle" font-size="23">${c.b} = ${p} + ${c.b-p}</text>`;
 if(stage>=1)t+=`<text data-step="1" x="180" y="177" text-anchor="middle" font-size="22">${c.a} ${c.op} ${p} = ${r.mid}</text>`;
 if(stage>=2)t+=`<text data-step="2" x="180" y="208" text-anchor="middle" font-size="22">${r.mid} ${c.op} ${c.b-p} = ${r.end}</text>`;
 const lo=Math.min(c.a,r.end),hi=Math.max(c.a,r.end),x=n=>30+(n-lo)/(hi-lo)*300;
 t+=`<path d="M20 265 H340" stroke="#355d50" stroke-width="2"/><text x="30" y="290" text-anchor="middle" font-size="17">${lo}</text><text x="330" y="290" text-anchor="middle" font-size="17">${hi}</text>`;
 if(stage>=1&&p>0)t+=`<path data-hop="first" d="M${x(c.a)} 259 Q${(x(c.a)+x(r.mid))/2} 221 ${x(r.mid)} 259" fill="none" stroke="#328372" stroke-width="3"/>`;
 if(stage>=2&&r.q>0)t+=`<path data-hop="rest" d="M${x(r.mid)} 259 Q${(x(r.mid)+x(r.end))/2} 221 ${x(r.end)} 259" fill="none" stroke="#9c7229" stroke-width="3"/>`;
 for(const [name,n]of[['start',c.a],...(stage>=1?[['mid',r.mid]]:[]),...(stage>=2?[['end',r.end]]:[])])t+=`<circle data-point="${name}" cx="${x(n)}" cy="265" r="5" fill="#244e42"/>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 310" role="img" aria-label="${c.b} jaettuna osiin ${p} ja ${r.q}. Laskun ${c.a} ${c.op} ${c.b} kaksi askelta."><title>Osat säilyttävät määrän, kaksi askelta samalla lukusuoralla</title><g fill="#183e36" font-family="sans-serif">${t}</g></svg>`;
}
const mounted=new WeakMap();
export function mount(host){
 mounted.get(host)?.dispose();const root=host.closest('#lesson-body')?.querySelector('[data-mental-split]');if(!root)return{pause(){},resume(){},reset(){},dispose(){}};
 const q=x=>root.querySelector(x),fields=[...root.querySelectorAll('fieldset')];let disposed=false,paused=false,modelKey='add',stage=0,signature='';
 const report=(s,t)=>{q('[data-feedback]').dataset.verdict=s;q('[data-feedback]').textContent=t;};
 function model(reseed=false){const k=q('[data-model-case]').value;if(k!==modelKey){modelKey=k;stage=0;if(reseed)q('[data-model-first]').value=own(CASES,k)?String(CASES[k].first):'';}const c=own(CASES,k)?CASES[k]:null,p=readWhole(q('[data-model-first]').value);q('[data-model-picture]').innerHTML=modelSvg(k,p,stage)||'<p>Valitse tilanne ja siihen sopiva ensimmäinen osa.</p>';q('[data-model-note]').textContent=c?`Jaa luku ${c.b}. Ensimmäinen osa ${int(p,c.b)?p:'?'}; toinen osa ${int(p,c.b)?c.b-p:'?'}. Osien järjestystä saa kokeilla.`:'Valitse tilanne.';q('[data-action="step"]').disabled=paused||!c||!int(p,c.b)||stage===2;q('[data-action="all"]').disabled=paused||!c||!int(p,c.b)||stage===2;return{key:k,p,c};}
 function sync(){const key=q('[data-case]').value,raws=['first','rest','result'].map(k=>q('[data-'+k+']').value),sig=JSON.stringify([key,...raws]);if(sig!==signature){signature=sig;report('neutral','Tarkista hajotelmasi, kun olet valmis.');}q('[data-question]').textContent=own(CASES,key)?CASES[key].text:'Valitse tilanne.';q('[data-hint]').textContent=own(CASES,key)?`Voit kokeilla osia ${CASES[key].first} ja ${CASES[key].b-CASES[key].first}. Muutkin luvun ${CASES[key].b} säilyttävät osat voivat toimia.`:'Valitse tilanne.';return{key,answer:raws.map(readWhole)};}
 function edit(e){if(disposed||paused)return;if(e.target.matches('[data-model-case],[data-model-first]')){if(e.target.matches('[data-model-first]'))stage=0;model(e.target.matches('[data-model-case]'));}if(e.target.matches('[data-case],[data-first],[data-rest],[data-result]'))sync();}
 function click(e){const b=e.target.closest('button[data-action]');if(!b||!root.contains(b)||disposed||paused)return;const a=b.dataset.action;if(a==='check'){const v=sync(),r=checkSplit(v.key,v.answer);report(r.ok?'correct':'retry',r.message);}else{model();stage=a==='model-reset'?0:a==='all'?2:Math.min(2,stage+1);model();}}
 function reset(){if(disposed)return;modelKey='add';stage=0;signature='';q('[data-model-case]').value='add';q('[data-model-first]').value='2';q('[data-case]').value='add';for(const k of['first','rest','result'])q('[data-'+k+']').value='';sync();model();for(const f of fields)f.disabled=paused;}
 root.addEventListener('input',edit);root.addEventListener('change',edit);root.addEventListener('click',click);
 const api={pause(){if(disposed)return;paused=true;for(const f of fields)f.disabled=true;model();},resume(){if(disposed)return;paused=false;for(const f of fields)f.disabled=false;sync();model();},reset,dispose(){if(disposed)return;disposed=true;root.removeEventListener('input',edit);root.removeEventListener('change',edit);root.removeEventListener('click',click);for(const f of fields)f.disabled=true;if(mounted.get(host)===api)mounted.delete(host);}};mounted.set(host,api);reset();return api;
}
