export const INPUTS=Object.freeze([0,1,2]),OUTPUTS=Object.freeze([0,1,2]);
export const REPAIR_BOARD=Object.freeze([Object.freeze([0,2]),Object.freeze([1,1]),Object.freeze([1,2])]);
function canonicalPairs(record){
  if(!Array.isArray(record))return null;const unique=new Map();
  for(let i=0;i<record.length;i++){
    if(!Object.hasOwn(record,i))return null;const pair=record[i];
    if(!Array.isArray(pair)||pair.length!==2||!Object.hasOwn(pair,0)||!Object.hasOwn(pair,1)||!INPUTS.includes(pair[0])||!OUTPUTS.includes(pair[1]))return null;
    unique.set(pair.join(':'),[pair[0],pair[1]]);
  }
  return [...unique.values()];
}
export function checkMapping(record){
  const pairs=canonicalPairs(record);if(pairs===null)return {ok:false,reason:'data',text:'Taulun tiedoissa on puuttuva tai virheellinen pari. Käytössä ovat vain syötteet ja tulokset 0, 1 ja 2.'};
  for(const x of INPUTS){const ys=pairs.filter(p=>p[0]===x).map(p=>p[1]).sort();if(ys.length>1)return {ok:false,reason:'conflict',input:x,text:`Syöte ${x} antaa eri tulokset ${ys.join(' ja ')}. Poista ylimääräinen nuoli: yhdelle syötteelle kuuluu täsmälleen yksi tulos.`};}
  for(const x of INPUTS)if(!pairs.some(p=>p[0]===x))return {ok:false,reason:'missing',input:x,text:`Sallitulta syötteeltä ${x} puuttuu tulos. Lisää sille yksi nuoli. Taulun pitää kattaa kaikki kolme sallittua syötettä.`};
  return {ok:true,reason:'function',text:'Tämä taulu määrittää funktion syötteille 0, 1 ja 2: jokaisella on täsmälleen yksi tulos. Eri syötteet saavat osoittaa samaan tulokseen. Tämä ei ole väite muista syötteistä.'};
}
export function toggleArrow(record,x,y){const pairs=canonicalPairs(record);if(pairs===null||!INPUTS.includes(x)||!OUTPUTS.includes(y))throw new RangeError('Dense canonical pairs and permitted endpoints required');return pairs.some(p=>p[0]===x&&p[1]===y)?pairs.filter(p=>p[0]!==x||p[1]!==y):[...pairs,[x,y]];}
export function mappingScene(record,view){const pairs=canonicalPairs(record);if(pairs===null||!INPUTS.includes(view))throw new RangeError('Valid mapping data and viewed input required');
  const lines=pairs.map(([x,y])=>{const sy=54+x*58,ey=54+y*58,colour=x===view?'#a24c20':'#58786b';return `<path data-arrow="${x}:${y}" d="M78 ${sy} L242 ${ey}" stroke="${colour}" stroke-width="${x===view?4:2}"/><path d="M234 ${ey-5} L242 ${ey} L234 ${ey+5}" fill="none" stroke="${colour}" stroke-width="2"/>`;}).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 225" width="320" height="225" role="img" aria-label="Sallitut syötteet 0, 1 ja 2. Nuolitaulu: ${pairs.length?pairs.map(([x,y])=>`${x} antaa ${y}`).join('; '):'ei nuolia'}. Korostettu syöte ${view}."><rect width="320" height="225" fill="#fffdf6"/><text x="48" y="22" text-anchor="middle" font-size="16" fill="#183e36">Syöte</text><text x="272" y="22" text-anchor="middle" font-size="16" fill="#183e36">Tulos</text>${lines}${INPUTS.map(x=>`<circle cx="52" cy="${54+x*58}" r="22" fill="#e5eee8" stroke="#183e36"/><text x="52" y="${60+x*58}" text-anchor="middle" font-size="20" fill="#183e36">${x}</text><circle cx="268" cy="${54+x*58}" r="22" fill="#e5eee8" stroke="#183e36"/><text x="268" y="${60+x*58}" text-anchor="middle" font-size="20" fill="#183e36">${x}</text>`).join('')}<text x="160" y="211" text-anchor="middle" font-size="15" fill="#183e36">Vaatimus: yksi tulos kullekin</text></svg>`;
}
const mounts=new WeakMap();
export function mount(host){const root=host.closest('#lesson-body')?.querySelector('[data-function-lesson]');if(!root)throw new Error('Function lesson root missing');mounts.get(root)?.dispose();
  const area=root.querySelector('[data-practice]'),fieldset=area.querySelector('fieldset'),q=s=>area.querySelector(s);let record=[],view=0,paused=false,disposed=false;
  const feedback=(text,ok)=>{q('[data-feedback]').textContent=text;q('[data-feedback]').dataset.result=ok===undefined?'support':ok?'correct':'retry';};
  function render(){q('[data-scene]').innerHTML=mappingScene(record,view);area.querySelectorAll('[data-x]').forEach(b=>b.setAttribute('aria-pressed',String(record.some(p=>p[0]===Number(b.dataset.x)&&p[1]===Number(b.dataset.y)))));q('[data-view]').value=String(view);
    const ys=record.filter(p=>p[0]===view).map(p=>p[1]).sort();q('[data-view-text]').textContent=ys.length?`Syötteestä ${view} lähtevät nuolet tuloksiin: ${ys.join(', ')}.`:`Syötteestä ${view} ei lähde nuolta.`;fieldset.disabled=paused;
  }
  function reset(){record=REPAIR_BOARD.map(p=>[...p]);view=0;feedback('Tutki taulua ja korjaa sitä. Voit itse valita tulokset.');render();}
  function click(e){if(paused||disposed)return;const b=e.target.closest('button');if(!b||!area.contains(b))return;
    if(b.dataset.x!==undefined){record=toggleArrow(record,Number(b.dataset.x),Number(b.dataset.y));feedback('Nuolitaulu muuttui. Tarkista sen funktion ehto uudelleen.');}
    if(b.dataset.action==='check'){const r=checkMapping(record);feedback(r.text,r.ok);}
    if(b.dataset.action==='clear'){record=[];feedback('Nuolet poistettiin. Lisää jokaiselle sallitulle syötteelle yksi.');}
    if(b.dataset.action==='restore'){reset();return;}render();
  }
  function change(e){if(paused||disposed||!e.target.matches('[data-view]'))return;const next=Number(q('[data-view]').value);if(INPUTS.includes(next)){view=next;render();}}
  area.hidden=false;area.addEventListener('click',click);area.addEventListener('change',change);reset();
  const handle={pause(){if(!disposed){paused=true;fieldset.disabled=true;}},resume(){if(!disposed){paused=false;render();}},reset(){if(!disposed)reset();},dispose(){if(disposed)return;disposed=true;area.removeEventListener('click',click);area.removeEventListener('change',change);area.hidden=true;q('[data-scene]').replaceChildren();if(mounts.get(root)===handle)mounts.delete(root);}};mounts.set(root,handle);return handle;
}
