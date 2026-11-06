export const SOURCES=Object.freeze([
 {key:'box',title:'Leikkilaatikko',diagram:'tray.svg',items:[{key:'cards',label:'Kortit',count:3},{key:'balls',label:'Pallot',count:3},{key:'pencils',label:'Kynät',count:1}]},
 {key:'shop',title:'Leikkikaupan tarkistettu hylly',diagram:'shop.svg',items:[{key:'cards',label:'Kortit',count:2},{key:'balls',label:'Pallot',count:0},{key:'pencils',label:'Kynät',count:4}]}
]);
export function checkTable(source,headers,rows){
 if(!source?.items||!headers||!Array.isArray(rows))throw new RangeError('Invalid table input');
 if(headers.kind!=='kind')return {ok:false,text:'Ensimmäisessä sarakkeessa ovat tavaroiden nimet. Valitse sille otsikko Tavara.'};
 if(headers.count!=='count')return {ok:false,text:'Toisessa sarakkeessa ovat lukumäärät, eivät pituudet. Valitse otsikko Määrä.'};
 if(rows.length!==source.items.length||rows.some(r=>!r.kind))return {ok:false,text:'Valitse jokaiselle riville tavaralaji. Jokainen sovittu tavaralaji tarvitsee oman rivin.'};
 if(new Set(rows.map(r=>r.kind)).size!==rows.length)return {ok:false,text:'Sama tavaralaji on kahdella rivillä. Tee jokaiselle tavaralajille yksi oma rivi.'};
 for(const item of source.items){const row=rows.find(r=>r.kind===item.key);if(!row)return {ok:false,text:`Taulukosta puuttuu rivi: ${item.label}.`};
  if(row.value===null||row.value==='')return {ok:false,text:`Rivin ${item.label} määrä puuttuu. Tyhjä ruutu ei ole sama kuin 0.`};
  if(!Number.isInteger(row.value)||row.value<0||row.value>9)return {ok:false,text:`Merkitse riville ${item.label} kokonainen lukumäärä 0–9.`};
  if(row.value!==item.count)return {ok:false,text:`Tarkista rivi ${item.label}: tässä aineistossa määrä on ${item.count}. Nimen ja määrän pitää pysyä yhdessä.`};
 }
 return {ok:true,text:'Taulukossa on sopivat otsikot ja jokaisen tavaralajin oikea määrä. Sama luku saa olla usealla rivillä. Rivien järjestys saa vaihdella.'};
}
export function tableFeedbackKey(sourceKey,headers,rows){
 const labelledRows=rows.map(row=>JSON.stringify([row.kind,row.value])).sort();
 return JSON.stringify([sourceKey,headers.kind,headers.count,labelledRows]);
}
export function mount(host){
 const root=host.closest('#lesson-body')?.querySelector('[data-table-maker]');if(!root)throw new Error('Table maker root missing');
 const area=root.querySelector('[data-maker-practice]'),controls=area.querySelector('[data-controls]'),tbody=area.querySelector('[data-maker-rows]'),result=area.querySelector('[data-feedback]');
 let index=0,paused=false,disposed=false,checkedKey=null;
 function rows(){return [...tbody.querySelectorAll('tr')].map(tr=>({kind:tr.querySelector('[data-kind]').value,value:tr.querySelector('[data-value]').value===''?null:Number(tr.querySelector('[data-value]').value)}));}
 function feedbackKey(){return tableFeedbackKey(SOURCES[index].key,{kind:area.querySelector('[data-heading="kind"]').value,count:area.querySelector('[data-heading="count"]').value},rows());}
 function invalidateEditedFeedback(){if(checkedKey!==null&&feedbackKey()!==checkedKey){checkedKey=null;result.textContent='Taulukkoa muutettiin. Tarkista muokattu taulukko uudelleen, kun haluat.';}}
 function onEdit(event){if(paused||disposed||!area.contains(event.target)||!event.target.matches('[data-heading],[data-kind],[data-value]'))return;invalidateEditedFeedback();}
 function drawRows(values=SOURCES[index].items.map(()=>({kind:'',value:null}))){tbody.replaceChildren();values.forEach((value,i)=>{const tr=root.ownerDocument.createElement('tr'),name=root.ownerDocument.createElement('th'),count=root.ownerDocument.createElement('td'),select=root.ownerDocument.createElement('select'),input=root.ownerDocument.createElement('input');name.scope='row';select.dataset.kind='';select.setAttribute('aria-label',`Tavaralaji rivillä ${i+1}`);select.innerHTML='<option value="">Valitse</option>'+SOURCES[index].items.map(x=>`<option value="${x.key}">${x.label}</option>`).join('');select.value=value.kind;input.type='number';input.min='0';input.max='9';input.step='1';input.inputMode='numeric';input.dataset.value='';input.setAttribute('aria-label',`Määrä rivillä ${i+1}`);input.value=value.value===null?'':String(value.value);name.append(select);count.append(input);tr.append(name,count);tbody.append(tr);});}
 function source(){checkedKey=null;const s=SOURCES[index];area.querySelector('[data-source-title]').textContent=s.title;const img=area.querySelector('[data-source-picture]');img.src=new URL(s.diagram,import.meta.url).href;img.alt=s.items.map(x=>`${x.label}: ${x.count}`).join('. ');area.querySelector('[data-source-help]').textContent=s.items.map(x=>`${x.label}: ${x.count}`).join('. ')+'. Tämä on apua määrien löytämiseen.';area.querySelectorAll('[data-heading]').forEach(s=>{s.value='';});drawRows();}
 function onClick(event){if(paused||disposed)return;const b=event.target.closest('button');if(!b||!area.contains(b))return;
  if(b.dataset.action==='check'){result.textContent=checkTable(SOURCES[index],{kind:area.querySelector('[data-heading="kind"]').value,count:area.querySelector('[data-heading="count"]').value},rows()).text;checkedKey=feedbackKey();}
  else if(b.dataset.action==='reverse'){drawRows(rows().reverse());if(checkedKey===null)result.textContent='Rivit vaihtoivat paikkaa. Nimet ja määrät pysyivät yhdessä.';}
  else if(b.dataset.action==='source'){index=(index+1)%SOURCES.length;source();result.textContent='Uusi aineisto. Rakenna sille oma taulukko.';}
 }
 area.hidden=false;area.addEventListener('click',onClick);area.addEventListener('input',onEdit);area.addEventListener('change',onEdit);source();
 return {pause(){if(!disposed){paused=true;controls.disabled=true;}},resume(){if(!disposed){paused=false;controls.disabled=false;invalidateEditedFeedback();}},reset(){if(!disposed){index=0;source();result.textContent='Otsikot ja rivit saavat vielä muuttua.';}},dispose(){if(disposed)return;disposed=true;area.removeEventListener('click',onClick);area.removeEventListener('input',onEdit);area.removeEventListener('change',onEdit);area.hidden=true;tbody.replaceChildren();}};
}
