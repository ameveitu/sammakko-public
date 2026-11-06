export const OBJECTS=Object.freeze([
 Object.freeze({id:'f-left',asset:'flower-red.svg',kind:'flower',colour:'punainen',label:'Punainen kukka vasemmalla',fill:'#b84837'}),
 Object.freeze({id:'s-grey',asset:'stone-grey.svg',kind:'stone',colour:'harmaa',label:'Harmaa kivi',fill:'#7d858b'}),
 Object.freeze({id:'f-yellow',asset:'flower-yellow.svg',kind:'flower',colour:'keltainen',label:'Keltainen kukka keskellä',fill:'#e8b62f'}),
 Object.freeze({id:'can',asset:'watering-can.svg',kind:'can',colour:'sininen',label:'Sininen kastelukannu',fill:'#568bb5'}),
 Object.freeze({id:'f-right',asset:'flower-red.svg',kind:'flower',colour:'punainen',label:'Punainen kukka oikealla',fill:'#b84837'}),
 Object.freeze({id:'s-brown',asset:'stone-brown.svg',kind:'stone',colour:'ruskea',label:'Ruskea kivi',fill:'#947048'})
]);
export const TOPICS=Object.freeze([{kind:'flower',question:'Minkä värisiä kukkia tämän kuvan pihassa on? Kerää jokaisesta kukasta yksi kortti.'},{kind:'stone',question:'Minkä värisiä kiviä tämän kuvan pihassa on? Kerää jokaisesta kivestä yksi kortti.'}]);
export function toggleRecord(selected,id){if(!OBJECTS.some(o=>o.id===id))throw new RangeError('Unknown observation');return selected.includes(id)?selected.filter(x=>x!==id):[...selected,id];}
export function checkCollection(kind,selected){
 if(!TOPICS.some(t=>t.kind===kind)||!Array.isArray(selected)||selected.some(id=>!OBJECTS.some(o=>o.id===id)))throw new RangeError('Invalid data collection');
 if(new Set(selected).size!==selected.length)return {ok:false,text:'Sama kohde on kirjattu kahdesti. Jokaisesta kohteesta tarvitaan vain yksi kortti.'};
 const extra=OBJECTS.find(o=>selected.includes(o.id)&&o.kind!==kind);
 if(extra)return {ok:false,text:`Listalla on eri aiheesta: ${extra.label.toLowerCase()}. Katso kysymystä ja poista se kortti.`};
 const missing=OBJECTS.filter(o=>o.kind===kind&&!selected.includes(o.id));
 if(missing.length)return {ok:false,text:`Tietoa puuttuu vielä: ${missing.map(o=>o.label.toLowerCase()).join(', ')}. Käy koko kuvan alue läpi.`};
 return {ok:true,text:kind==='flower'?'Lista vastaa kysymykseen tämän kuvan kukista. Jokaisesta kukasta on yksi kortti, myös keltaisesta. Molemmat punaiset kukat saavat omat korttinsa.':'Lista vastaa kysymykseen tämän kuvan kivistä. Kummastakin kivestä on yksi kortti. Kukkien tiedot kuuluvat eri listaan.'};
}
export function objectArt(object){
 let shape;
 if(object.kind==='flower')shape=`<path d="M60 60 V115 M60 92 Q30 70 35 95 Q50 106 60 102" fill="#6d9654" stroke="#315b3d" stroke-width="4"/>`+[[60,30],[39,45],[47,68],[74,68],[82,45]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="17" fill="${object.fill}" stroke="#573e31" stroke-width="2"/>`).join('')+'<circle cx="60" cy="50" r="12" fill="#fff4c2" stroke="#573e31" stroke-width="2"/>';
 else if(object.kind==='stone')shape=`<path d="M20 95 Q12 65 44 49 Q79 25 102 78 L97 103 Q60 120 20 95Z" fill="${object.fill}" stroke="#3f4544" stroke-width="4"/>`;
 else shape='<path d="M27 49 H81 V107 H27Z M81 62 L107 41 L114 51 L81 93 M27 60 C0 35 0 105 27 94" fill="#568bb5" stroke="#264c72" stroke-width="4"/>';
 return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="70" viewBox="0 0 120 130" aria-hidden="true" focusable="false">${shape}</svg>`;
}
export function mount(host){
 const root=host.closest('#lesson-body')?.querySelector('[data-collection-lesson]');if(!root)throw new Error('Collection root missing');
 const area=root.querySelector('[data-collection-practice]'),controls=area.querySelector('[data-controls]'),items=area.querySelector('[data-items]'),records=area.querySelector('[data-records]'),result=area.querySelector('[data-feedback]');
 let topic=0,selected=[],paused=false,disposed=false;
 for(const object of OBJECTS){const b=root.ownerDocument.createElement('button');b.type='button';b.dataset.observation=object.id;const image=root.ownerDocument.createElement('img');image.src=new URL(object.asset,import.meta.url).href;image.alt='';image.width=64;image.height=70;b.append(image);const span=root.ownerDocument.createElement('span');span.textContent=object.label;b.append(span);b.setAttribute('aria-pressed','false');items.append(b);}
 function render(){area.querySelector('[data-topic]').textContent=TOPICS[topic].question;items.querySelectorAll('[data-observation]').forEach(b=>b.setAttribute('aria-pressed',String(selected.includes(b.dataset.observation))));records.replaceChildren();for(const id of selected){const o=OBJECTS.find(x=>x.id===id),li=root.ownerDocument.createElement('li');li.textContent=o.label;records.append(li);}area.querySelector('[data-empty]').hidden=selected.length>0;controls.disabled=paused;}
 function onClick(event){if(paused||disposed)return;const b=event.target.closest('button');if(!b||!area.contains(b))return;
  if(b.dataset.observation){selected=toggleRecord(selected,b.dataset.observation);render();result.textContent='Lista muuttui. Voit tarkistaa sen, kun haluat.';}
  else if(b.dataset.action==='check')result.textContent=checkCollection(TOPICS[topic].kind,selected).text;
  else if(b.dataset.action==='clear'){selected=[];render();result.textContent='Lista on tyhjä.';}
  else if(b.dataset.action==='topic'){topic=(topic+1)%TOPICS.length;selected=[];render();result.textContent='Aihe vaihtui. Kerätään eri aiheelle uusi lista.';}
 }
 area.hidden=false;area.addEventListener('click',onClick);render();
 return {pause(){if(!disposed){paused=true;controls.disabled=true;}},resume(){if(!disposed){paused=false;controls.disabled=false;}},reset(){if(!disposed){topic=0;selected=[];render();result.textContent='Kerää sovitulta alueelta. Voit muuttaa valintoja.';}},dispose(){if(disposed)return;disposed=true;area.removeEventListener('click',onClick);area.hidden=true;items.replaceChildren();records.replaceChildren();}};
}
