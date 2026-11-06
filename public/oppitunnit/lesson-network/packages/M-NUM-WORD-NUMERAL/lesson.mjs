export const PAIRS={2:'kaksi',6:'kuusi',9:'yhdeksän'};
export function assignPair(mapping,word,slot){
 if(!Object.values(PAIRS).includes(word)||!Object.hasOwn(PAIRS,slot))return {...mapping};
 const next={...mapping};for(const n of Object.keys(PAIRS))if(next[n]===word)next[n]=null;
 next[slot]=word;return next;
}
export function checkPairs(mapping){
 for(const [n,w] of Object.entries(PAIRS)){
  if(!mapping[n])return {ok:false,text:`Numerolappu ${n} tarvitsee vielä sanan.`};
  if(mapping[n]!==w)return {ok:false,text:n==='6'||n==='9'?`Tässä parissa ${n} luetaan ${w}. Katso, onko lenkki alhaalla vai ylhäällä. Vaihda sanalappu.`:`${n} luetaan ${w}. Valitse sana ${w} ja kosketa lappua ${n}.`};
 }
 return {ok:true,text:'Parit ovat kaksi — 2, kuusi — 6 ja yhdeksän — 9. Voit lukea kumpaankin suuntaan.'};
}
export function mount(host){
 const scope=host.closest('#lesson-body');const root=scope?.querySelector('[data-source-lesson="M-NUM-WORD-NUMERAL"]');if(!root)throw new Error('Teaching root missing');
 let mapping={},selected=null,paused=false,disposed=false;
 const out=(key,text,ok)=>{const e=root.querySelector(`[data-feedback="${key}"]`);e.textContent=text;e.dataset.result=ok===undefined?'support':ok?'correct':'retry';};
 const render=()=>{root.querySelectorAll('[data-word]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.word===selected)));root.querySelectorAll('[data-pair]').forEach(e=>e.textContent=mapping[e.dataset.pair]??'valitse sana');root.querySelector('[data-picked]').textContent=selected?`Valittu sana: ${selected}. Kosketa numerolappua.`:'Valitse sana.';};
 const reset=()=>{mapping={};selected=null;render();out('pairs','Rakenna jokaiselle numerolle sanapari.');out('reverse','Valitse numeron nimi.');};
 const click=e=>{if(paused||disposed)return;const b=e.target.closest('button');if(!b||!root.contains(b))return;
  if(b.dataset.word){selected=b.dataset.word;render();}
  if(b.dataset.slot){if(!selected){out('pairs','Valitse ensin sana.');return;}mapping=assignPair(mapping,selected,b.dataset.slot);selected=null;render();out('pairs','Pari on asetettu. Voit vaihtaa sitä tai tarkistaa.');}
  if(b.dataset.action==='clear')reset();
  if(b.dataset.action==='check-pairs'){const r=checkPairs(mapping);out('pairs',r.text,r.ok);}
  if(b.dataset.reverse){const ok=b.dataset.reverse==='viisi';out('reverse',ok?'Kyllä. 5 luetaan viisi myös oven lapussa.':`${b.dataset.reverse==='kuusi'?'Kuusi merkitään 6.':'Kaksi merkitään 2.'} Oven lapussa on 5. Sen nimi on viisi.`,ok);}
 };
 root.addEventListener('click',click);reset();root.dataset.moduleReady='true';
 return {pause(){paused=true;},resume(){if(!disposed)paused=false;},reset(){if(!disposed)reset();},dispose(){if(disposed)return;disposed=true;root.removeEventListener('click',click);delete root.dataset.moduleReady;}};
}
