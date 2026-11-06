const mounted=new WeakMap();
export const CASES=Object.freeze({three:Object.freeze({name:'Kuusi merkkiä kolmelle alustalle',total:6,recipients:3}),two:Object.freeze({name:'Kahdeksan merkkiä kahdelle alustalle',total:8,recipients:2}),four:Object.freeze({name:'Kahdeksan merkkiä neljälle alustalle',total:8,recipients:4})});
const task=key=>{if(!Object.hasOwn(CASES,key))throw new RangeError('Unknown sharing');return CASES[key];};
export function validCounts(key,counts){const c=task(key);if(!Array.isArray(counts)||counts.length!==c.recipients||Object.keys(counts).length!==counts.length)return false;let sum=0;for(let i=0;i<counts.length;i++){if(!Object.hasOwn(counts,i)||!Number.isInteger(counts[i])||counts[i]<0||counts[i]>c.total)return false;sum+=counts[i];}return sum<=c.total;}
export function changeShare(key,counts,recipient,delta){const c=task(key);if(!validCounts(key,counts)||!Number.isInteger(recipient)||recipient<0||recipient>=c.recipients||![1,-1].includes(delta))throw new RangeError('Invalid sharing move');const next=[...counts];next[recipient]+=delta;if(!validCounts(key,next))return[...counts];return next;}
export function checkSharing(key,a){
 const c=task(key),fail=(code,text)=>({ok:false,code,text});
 if(!a||typeof a!=='object'||Array.isArray(a)||Object.keys(a).sort().join(',')!=='counts,reported'||!validCounts(key,a.counts)||(a.reported!==null&&(!Number.isInteger(a.reported)||a.reported<0||a.reported>12)))return fail('invalid','Käytä jokaista annettua alustaa ja kokonaisia merkkejä. Vastaus ei ole ehjä.');
 const left=c.total-a.counts.reduce((s,n)=>s+n,0);
 if(left>0)return fail('left',`Kasassa on vielä ${left} merkkiä. Jaa koko annettu määrä alustoille. Lopuksi jokaisella pitää olla yhtä monta.`);
 const other=a.counts.findIndex(n=>n!==a.counts[0]);
 if(other!==-1)return fail('unequal',`Kaikki merkit ovat alustoilla, mutta määrät eroavat: alustalla 1 on ${a.counts[0]} ja alustalla ${other+1} on ${a.counts[other]}. Siirrä merkkejä niin, että jokaisella on yhtä monta.`);
 if(a.reported===null)return fail('number-empty','Jako on tasan. Merkitse vielä, montako kukin sai.');
 const per=a.counts[0];
 if(a.reported!==per)return fail('number',a.reported===c.recipients?`${c.recipients} kertoo alustojen määrän. Kysyttiin yhden alustan osuutta: kullakin on ${per} merkkiä.`:`Yhdellä alustalla on ${per} merkkiä. Koko kasa on ${c.total}; sitä ei anneta jokaiselle uudelleen.`);
 return{ok:true,code:'match',text:`Koko ${c.total} merkin kasa on jaettu ${c.recipients} alustalle tasan: kukin sai ${per}. Merkintäsi vastaa mallia. Järjestyksen tai jakamistavan ei tarvitse olla sama kuin esimerkissä.`};
}
export function sharingKey(key,a){return JSON.stringify([key,a.counts,a.reported]);}
export function sharingSvg(key,counts){
 const c=task(key);if(!validCounts(key,counts))throw new RangeError('Invalid sharing picture');const left=c.total-counts.reduce((s,n)=>s+n,0),cols=c.recipients===3?3:2,rows=Math.ceil(c.recipients/cols),w=336/cols;
 const token=(x,y,where)=>`<circle data-token="${where}" cx="${x}" cy="${y}" r="7" fill="#bd654f" stroke="#653326" stroke-width="1.5"/>`;
 return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 ${115+rows*140}" role="img" aria-label="Kasassa ${left} merkkiä. ${counts.map((n,i)=>`Alustalla ${i+1}: ${n}`).join('. ')}."><title>Annettu kasa ja kiinteä määrä alustoja</title><rect width="360" height="${115+rows*140}" rx="10" fill="#fffdf7"/><text x="18" y="25" font-size="18" fill="#183e36">Kasassa vielä ${left}</text>${Array.from({length:left},(_,i)=>token(27+i%10*31,48+Math.floor(i/10)*23,'pool')).join('')}${counts.map((n,i)=>{const x=12+(i%cols)*w,y=105+Math.floor(i/cols)*140,itemCols=cols===3?3:4;return`<g data-recipient="${i}"><rect x="${x+3}" y="${y}" width="${w-6}" height="126" rx="9" fill="#e9efe3" stroke="#4e705d" stroke-width="2"/><text x="${x+w/2}" y="${y+24}" text-anchor="middle" font-size="17" fill="#183e36">Alusta ${i+1}</text>${Array.from({length:n},(_,j)=>token(x+20+j%itemCols*21,y+48+Math.floor(j/itemCols)*20,'r'+i)).join('')}<text x="${x+w/2}" y="${y+115}" text-anchor="middle" font-size="18" fill="#183e36">${n} merkkiä</text></g>`;}).join('')}</svg>`;
}
export function mount(host){
 const scope=(host.closest('#lesson-body')||host).querySelector('[data-sharing]');if(!scope)throw new Error('Missing sharing lesson');mounted.get(scope)?.dispose();
 const q=s=>scope.querySelector(s),fieldset=q('[data-controls]'),picker=q('[data-case]'),report=q('[data-reported]'),feedback=q('[data-feedback]');let key='three',counts=[],order=[],checked=null,paused=false,disposed=false;
 const answer=()=>({counts:[...counts],reported:report.value.trim()===''?null:Number(report.value)}),signature=()=>sharingKey(key,answer());
 const neutral=()=>{checked=null;feedback.textContent='Jakoa tai vastausta muokattiin. Tarkista nykyinen jako ja yhden alustan osuus uudelleen, kun haluat.';feedback.dataset.result='neutral';};
 function invalidate(){if(checked!==null&&checked!==signature())neutral();}
 function draw(){const c=CASES[key],left=c.total-counts.reduce((s,n)=>s+n,0);q('[data-picture]').innerHTML=sharingSvg(key,counts);q('[data-question]').textContent=`Jaa kaikki ${c.total} merkkiä ${c.recipients} alustalle tasan. Montako kukin saa?`;q('[data-recipient-controls]').innerHTML=order.map(i=>`<div class="share-recipient"><p>Alusta ${i+1}: ${counts[i]} merkkiä</p><button type="button" data-recipient="${i}" data-delta="1"${left===0?' disabled':''}>Lisää 1 alustalle ${i+1}</button><button type="button" data-recipient="${i}" data-delta="-1"${counts[i]===0?' disabled':''}>Palauta 1 alustalta ${i+1}</button></div>`).join('');q('[data-action="round"]').disabled=left<c.recipients;}
 function fresh(){counts=Array(CASES[key].recipients).fill(0);order=counts.map((_,i)=>i);report.value='';checked=null;feedback.textContent='Voit jakaa merkit haluamassasi järjestyksessä. Yhden kierroksen painike auttaa tarvittaessa.';feedback.dataset.result='neutral';draw();}
 function reset(){if(disposed)return;key='three';picker.value=key;fresh();fieldset.disabled=paused;}
 function click(e){if(paused||disposed)return;const b=e.target.closest('button');if(!b||!scope.contains(b))return;
  if(b.hasAttribute('data-delta')){const next=changeShare(key,counts,Number(b.dataset.recipient),Number(b.dataset.delta));counts=next;invalidate();draw();}
  else if(b.dataset.action==='round'){const c=CASES[key];if(c.total-counts.reduce((s,n)=>s+n,0)>=c.recipients){counts=counts.map(n=>n+1);invalidate();draw();}}
  else if(b.dataset.action==='reorder'){order.reverse();draw();}
  else if(b.dataset.action==='clear'){fresh();}
  else if(b.dataset.action==='check'){const r=checkSharing(key,answer());feedback.textContent=r.text;feedback.dataset.result=r.ok?'correct':'retry';checked=signature();}
 }
 function edit(e){if(paused||disposed||!scope.contains(e.target))return;if(e.target.matches('[data-case]')){if(Object.hasOwn(CASES,picker.value)&&picker.value!==key){key=picker.value;fresh();}else picker.value=key;}else if(e.target.matches('[data-reported]'))invalidate();}
 fieldset.disabled=false;scope.addEventListener('click',click);scope.addEventListener('input',edit);scope.addEventListener('change',edit);reset();scope.dataset.moduleReady='true';
 const api={pause(){if(disposed)return;paused=true;fieldset.disabled=true;},resume(){if(disposed)return;paused=false;fieldset.disabled=false;if(Object.hasOwn(CASES,picker.value)&&picker.value!==key){key=picker.value;fresh();}else{picker.value=key;invalidate();draw();}},reset,dispose(){if(disposed)return;disposed=true;fieldset.disabled=true;scope.removeEventListener('click',click);scope.removeEventListener('input',edit);scope.removeEventListener('change',edit);delete scope.dataset.moduleReady;if(mounted.get(scope)===api)mounted.delete(scope);}};mounted.set(scope,api);return api;
}
