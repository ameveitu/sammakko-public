const mounted = new WeakMap();
export const tables = [
 {title:'Retkieväät',rows:['Aava','Loikka'],columns:['Juoma','Eväs'],values:[['Vesi','Omena'],['Vesi','Leipä']]},
 {title:'Tavaroiden paikat',rows:['Kirja','Peli'],columns:['Ennen','Jälkeen'],values:[['Hylly','Reppu'],['Kori','Hylly']]},
];
export const searches = [
 {table:0,row:1,column:1,text:'Etsi Loikan eväs.'},
 {table:0,row:0,column:0,text:'Etsi Aavan juoma.'},
 {table:1,row:0,column:1,text:'Etsi kirjan paikka retken jälkeen.'},
 {table:1,row:1,column:0,text:'Etsi pelin paikka ennen retkeä.'},
];
export function checkLookup(index,row,column,cellRow,cellColumn){
 const q=searches[index];if(!q)throw new RangeError('Invalid search');
 const t=tables[q.table];
 if(!Number.isInteger(cellRow)||!Number.isInteger(cellColumn)||!t.rows[cellRow]||!t.columns[cellColumn])throw new RangeError('Invalid cell');
 if(row===null||column===null)return{ok:false,code:'missing',message:'Merkitse myös rivin ja sarakkeen otsikot. Niistä näet, mitä valitsemasi ruutu tarkoittaa.'};
 if(row!==q.row)return{ok:false,code:'row',message:`Valitsit rivin ${t.rows[row]??'?'}. Kysymys koskee riviä ${t.rows[q.row]}. Vaihda rivin otsikkoa.`};
 if(column!==q.column)return{ok:false,code:'column',message:`Rivi sopii. Sarake ${t.columns[column]??'?'} kertoo eri tiedon. Etsi sarake ${t.columns[q.column]}.`};
 if(cellRow!==row||cellColumn!==column)return{ok:false,code:'intersection',message:'Otsikot sopivat kysymykseen. Valitse nyt juuri niiden risteys, jossa molemmat reitit kohtaavat.'};
 return{ok:true,code:'match',message:`Löytyi: rivi ${t.rows[row]}, sarake ${t.columns[column]}. Risteyksessä on ${t.values[row][column]}. Molemmat otsikot kertovat, mitä tämä tieto tarkoittaa.`};
}
export function tableMarkup(tableIndex,row=null,column=null){
 const t=tables[tableIndex];if(!t)throw new RangeError('Invalid table');
 return `<table><caption>${t.title}</caption><thead><tr><th scope="col">${tableIndex===0?'Kuka':'Tavara'}</th>${t.columns.map((v,c)=>`<th scope="col"><button type="button" data-table-column="${c}" aria-pressed="${column===c}">${column===c?'↓ ':''}${v}</button></th>`).join('')}</tr></thead><tbody>${t.rows.map((v,r)=>`<tr><th scope="row"><button type="button" data-table-row="${r}" aria-pressed="${row===r}">${row===r?'→ ':''}${v}</button></th>${t.columns.map((_,c)=>`<td><button type="button" data-table-cell="${r},${c}" aria-label="${t.values[r][c]}, rivi ${v}, sarake ${t.columns[c]}">${row===r&&column===c?'<strong>':row===r||column===c?'<mark>':''}${t.values[r][c]}${row===r&&column===c?'</strong>':row===r||column===c?'</mark>':''}</button></td>`).join('')}</tr>`).join('')}</tbody></table>${tableIndex===1?'<p>Ennen ja Jälkeen tarkoittavat tässä ennen retkeä ja retken jälkeen.</p>':''}`;
}
export function mount(host){
 const root=host.closest('#lesson-body');const scope=root?.querySelector('[data-table-work]');if(!scope)throw new Error('Missing table workspace');
  mounted.get(scope)?.dispose();
 let index=0,row=null,column=null,paused=false,disposed=false;
 const surface=scope.querySelector('[data-table-surface]'),feedback=scope.querySelector('[data-table-feedback]');
 function render(focusAttribute=null,focusValue=null){const q=searches[index],t=tables[q.table];surface.innerHTML=tableMarkup(q.table,row,column);scope.querySelector('[data-table-question]').textContent=q.text;scope.querySelector('[data-table-route]').textContent=`Rivi: ${row===null?'ei valittu':t.rows[row]}. Sarake: ${column===null?'ei valittu':t.columns[column]}.`;if(focusAttribute)surface.querySelector(`[${focusAttribute}="${focusValue}"]`)?.focus();}
 function click(event){const b=event.target.closest('button');if(!b||!scope.contains(b)||paused||disposed)return;
  if(b.hasAttribute('data-table-row')){row=Number(b.dataset.tableRow);feedback.textContent='Rivi merkitty. Seuraa myös saraketta.';render('data-table-row',row);}
  else if(b.hasAttribute('data-table-column')){column=Number(b.dataset.tableColumn);feedback.textContent='Sarake merkitty. Seuraa myös riviä.';render('data-table-column',column);}
  else if(b.hasAttribute('data-table-cell')){const [r,c]=b.dataset.tableCell.split(',').map(Number);feedback.textContent=checkLookup(index,row,column,r,c).message;}
  else if(b.hasAttribute('data-table-clear')){row=null;column=null;feedback.textContent='Merkinnät poistettu. Kysymys pysyy samana.';render();}
  else if(b.hasAttribute('data-table-next')){index=(index+1)%searches.length;row=null;column=null;feedback.textContent='Uusi haku. Etsi molemmat otsikot.';render();}
 }
 scope.addEventListener('click',click);render();
 const api = {pause(){paused=true;},resume(){if(!disposed)paused=false;},reset(){if(!disposed){index=0;row=null;column=null;feedback.textContent='Ensimmäinen haku. Etsi molemmat otsikot.';render();}},dispose(){disposed=true;scope.removeEventListener('click',click);if(mounted.get(scope)===api)mounted.delete(scope);}};
  mounted.set(scope,api);
  return api;
}
