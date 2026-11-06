export const TABLES=Object.freeze([
 {key:'trip',title:'Keksitty leikkiretken tavaralista',rows:[{key:'bottles',label:'Vesipullot',value:4},{key:'boxes',label:'Rasiat',value:2},{key:'spoons',label:'Lusikat',value:0}],questions:['boxes','spoons','bottles']},
 {key:'class',title:'Keksitty luokan tarvikelista',rows:[{key:'notebooks',label:'Vihkot',value:3},{key:'folders',label:'Kansiot',value:null},{key:'books',label:'Kirjat',value:3}],questions:['folders','books','notebooks']}
]);
export function readValue(table,rowKey){const row=table.rows.find(r=>r.key===rowKey);if(!row)throw new RangeError('Unknown table row');return row.value;}
export function checkRead(table,rowKey,answer){
 if(answer!==null&&(!Number.isInteger(answer)||answer<0))throw new RangeError('Invalid table response');
 const row=table.rows.find(r=>r.key===rowKey);if(!row)throw new RangeError('Unknown table row');
 if(answer===row.value)return {ok:true,text:row.value===null?`Kyllä. Rivillä ${row.label} lukee Ei kirjattu. Määrää ei tiedetä tästä taulukosta.`:`Kyllä. Rivillä ${row.label}, Määrä-sarakkeessa, on ${row.value}.`};
 if(row.value===null)return {ok:false,text:`Riville ${row.label} ei ole kirjattu määrää. Tyhjä tieto ei tarkoita nollaa. Valitse Ei kirjattu.`};
 if(answer===null)return {ok:false,text:`Tälle riville on kirjattu määrä. Etsi ${row.label} ja lue samalta riviltä: ${row.value}.`};
 const other=table.rows.find(r=>r.key!==rowKey&&r.value===answer);
 return {ok:false,text:other?`${answer} kuuluu riville ${other.label}. Kysymys koskee riviä ${row.label}; sen määrä on ${row.value}.`:`Etsi rivi ${row.label}. Sen Määrä-sarakkeessa on ${row.value}. Lue samalta riviltä.`};
}
export function mount(host){
 const root=host.closest('#lesson-body')?.querySelector('[data-table-reader]');if(!root)throw new Error('Table reader root missing');
 const area=root.querySelector('[data-reader-practice]'),controls=area.querySelector('[data-controls]'),visual=area.querySelector('[data-reader-table]'),result=area.querySelector('[data-feedback]');
 let index=0,question=0,reversed=false,highlight='',paused=false,disposed=false;
 function render(){const table=TABLES[index];const key=table.questions[question],row=table.rows.find(r=>r.key===key);area.querySelector('[data-question]').textContent=`Mikä määrä riville ${row.label} on kirjattu?`;
  const rows=reversed?[...table.rows].reverse():table.rows;visual.innerHTML=`<table><caption>${table.title}</caption><thead><tr><th scope="col">Tavara</th><th scope="col">Määrä</th></tr></thead><tbody>${rows.map(r=>`<tr data-row-key="${r.key}" data-highlighted="${r.key===highlight}"><th scope="row"><button type="button" data-row="${r.key}" aria-pressed="${r.key===highlight}">${r.label}</button></th><td>${r.value===null?'Ei kirjattu':r.value}</td></tr>`).join('')}</tbody></table>`;
 }
 function onClick(event){if(paused||disposed)return;const b=event.target.closest('button');if(!b||!area.contains(b))return;
  if(b.dataset.row){highlight=highlight===b.dataset.row?'':b.dataset.row;render();visual.querySelector(`[data-row="${b.dataset.row}"]`)?.focus();return;}
  if(Object.hasOwn(b.dataset,'answer')){const answer=b.dataset.answer==='unknown'?null:Number(b.dataset.answer);result.textContent=checkRead(TABLES[index],TABLES[index].questions[question],answer).text;return;}
  if(b.dataset.action==='question'){question=(question+1)%TABLES[index].questions.length;highlight='';}
  else if(b.dataset.action==='reverse')reversed=!reversed;
  else if(b.dataset.action==='table'){index=(index+1)%TABLES.length;question=0;highlight='';reversed=false;}
  else return;render();result.textContent='Katso kysymystä ja taulukon nimiä.';
 }
 area.hidden=false;area.addEventListener('click',onClick);render();
 return {pause(){if(!disposed){paused=true;controls.disabled=true;}},resume(){if(!disposed){paused=false;controls.disabled=false;}},reset(){if(!disposed){index=0;question=0;reversed=false;highlight='';render();result.textContent='Katso kysymystä ja taulukon nimiä.';}},dispose(){if(disposed)return;disposed=true;area.removeEventListener('click',onClick);area.hidden=true;visual.replaceChildren();}};
}
