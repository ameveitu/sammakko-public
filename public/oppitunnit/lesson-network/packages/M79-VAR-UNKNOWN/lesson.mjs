export const TASKS = Object.freeze({
  cards: Object.freeze({letter:'x',part:5,total:17,solution:12,unit:'korttia',context:'Rasiassa on x korttia ja irrallaan 5. Yhteensä kortteja on 17.'}),
  ticket: Object.freeze({letter:'a',part:4,total:11,solution:7,unit:'euroa',context:'Lippu maksaa a euroa ja esite 4 euroa. Yhteensä maksetaan 11 euroa.'})
});
export function readWhole(value,max=20){
  if(typeof value==='string'){const text=value.trim();if(!/^\d+(?:[.,]0+)?$/.test(text))return null;value=Number(text.replace(',','.'));}
  return typeof value==='number'&&Number.isInteger(value)&&value>=0&&value<=max?value:null;
}
export function checkUnknown(key,value){
  if(typeof key!=='string'||!Object.hasOwn(TASKS,key))return {ok:false,reason:'task',text:'Valitse ensin annettu tilanne.'};
  const t=TASKS[key],n=readWhole(value);
  if(n===null)return {ok:false,reason:'input',text:'Kirjoita ehdotukseksi kokonaisluku 0–20. Tyhjä kohta ei vielä ole ehdotus.'};
  const sum=n+t.part;
  if(sum===t.total)return {ok:true,reason:'equal',text:`Ehdotus ${t.letter} = ${n} täyttää ehdon: ${n} + ${t.part} = ${t.total}. Kirjain kertoo tässä määrän lukuarvon, ei itse esinettä.`};
  return {ok:false,reason:sum<t.total?'small':'large',text:`Ehdotuksella ${t.letter} = ${n} saadaan ${n} + ${t.part} = ${sum}, ${sum<t.total?'vähemmän':'enemmän'} kuin ${t.total}. ${n===t.total?'Ehdotit koko määrää. Kirjain kertoo vain puuttuvan osan.':'Alkuperäinen kokonaismäärä säilyy. Muuta ehdotustasi ja kokeile uudelleen.'}`};
}
const mounts=new WeakMap();
export function mount(host){
  const root=host.closest('#lesson-body')?.querySelector('[data-unknown-lesson]');if(!root)throw new Error('Unknown lesson root missing');mounts.get(root)?.dispose();
  const area=root.querySelector('[data-practice]'),fieldset=area.querySelector('fieldset'),q=s=>area.querySelector(s);
  let key='cards',reversed=false,paused=false,disposed=false,last='';
  const feedback=(text,ok)=>{q('[data-feedback]').textContent=text;q('[data-feedback]').dataset.result=ok===undefined?'support':ok?'correct':'retry';};
  function render(){const t=TASKS[key],n=readWhole(q('[data-candidate]').value),left=`${n===null?t.letter:n} + ${t.part}`;
    q('[data-context]').textContent=t.context;q('[data-unit]').textContent=t.unit;
    q('[data-relation]').textContent=reversed?`${t.total} = ${left}`:`${left} = ${t.total}`;
    q('[data-trial]').textContent=n===null?'Kirjain odottaa ehdotusta. Kuvan alkuperäinen ehto säilyy.':`Kokeiltava luku on ${n}. Se ei muuta alkuperäistä tilannetta. Tarkista, täyttääkö se ehdon.`;
    q('[data-action="context"]').textContent=key==='cards'?'Kokeile hintatilannetta':'Palaa korttitilanteeseen';fieldset.disabled=paused;
  }
  function reset(){key='cards';reversed=false;q('[data-candidate]').value='';last='';feedback('Ehdota lukua. Tarkistus vertaa sitä alkuperäiseen ehtoon.');render();}
  function input(e){if(paused||disposed||!e.target.matches('[data-candidate]'))return;const next=q('[data-candidate]').value;if(next!==last){last=next;feedback('Ehdotus muuttui. Tarkista tämä luku uudelleen.');render();}}
  function click(e){if(paused||disposed)return;const b=e.target.closest('button');if(!b||!area.contains(b))return;
    if(b.dataset.action==='check'){const r=checkUnknown(key,q('[data-candidate]').value);feedback(r.text,r.ok);}
    if(b.dataset.action==='clear'){q('[data-candidate]').value='';last='';feedback('Ehdotus poistettiin. Voit kokeilla uutta lukua.');}
    if(b.dataset.action==='reverse')reversed=!reversed;
    if(b.dataset.action==='context'){key=key==='cards'?'ticket':'cards';reversed=false;q('[data-candidate]').value='';last='';feedback('Tilanne ja ehto vaihtuivat. Tee uusi ehdotus.');}
    render();
  }
  area.hidden=false;area.addEventListener('input',input);area.addEventListener('click',click);reset();
  const handle={pause(){if(!disposed){paused=true;fieldset.disabled=true;}},resume(){if(!disposed){paused=false;render();}},reset(){if(!disposed)reset();},dispose(){if(disposed)return;disposed=true;area.removeEventListener('input',input);area.removeEventListener('click',click);area.hidden=true;if(mounts.get(root)===handle)mounts.delete(root);}};
  mounts.set(root,handle);return handle;
}
