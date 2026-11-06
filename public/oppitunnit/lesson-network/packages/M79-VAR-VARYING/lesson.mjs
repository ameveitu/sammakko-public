export const MODELS=Object.freeze({price:Object.freeze({max:6,title:'Varausmalli: h = 4 + 2n',unit:'euroa'}),remaining:Object.freeze({max:12,title:'Korttimalli: r = 12 − n',unit:'korttia'})});
export function whole(value,max){if(typeof value==='string'){const s=value.trim();if(!/^\d+(?:[.,]0+)?$/.test(s))return null;value=Number(s.replace(',','.'));}return typeof value==='number'&&Number.isInteger(value)&&value>=0&&value<=max?value:null;}
export function modelValue(key,n){if(typeof key!=='string'||!Object.hasOwn(MODELS,key))throw new RangeError('Known model required');const count=whole(n,MODELS[key].max);if(count===null)throw new RangeError('Whole count in model domain required');return key==='price'?4+2*count:12-count;}
export function modelDifference(key,from,to){return modelValue(key,to)-modelValue(key,from);}
export function checkPrediction(key,target,answer){
  if(typeof key!=='string'||!Object.hasOwn(MODELS,key)||whole(target,MODELS[key].max)===null)return {ok:false,reason:'target',text:'Valitse mallin sallittu määrä ensin.'};
  const n=whole(target,MODELS[key].max),a=whole(answer,30),expected=modelValue(key,n);
  if(a===null)return {ok:false,reason:'input',text:'Kirjoita ennusteeksi kokonaisluku 0–30. Tyhjä kohta ei tarkoita nollaa.'};
  const calculation=key==='price'?`4 + 2 × ${n} = ${expected}`:`12 − ${n} = ${expected}`;
  if(a===expected)return {ok:true,reason:'match',text:`Tällä määrällä n = ${n} ennusteesi sopii malliin: ${calculation}. ${key==='price'?'Varausosa 4 ja yhden tulosteen hinta 2 säilyvät saman mallin sisällä.':'Kun yksi kortti lisää käytetään, jäljellä olevien määrä pienenee yhdellä.'}`};
  let detail=key==='price'&&a===2*n?'Laskit tulosteiden osuuden, mutta varausosa 4 puuttuu. ':key==='price'&&a===Number(`2${n}`)+4?'2n tarkoittaa 2 × n, ei numeroiden kirjoittamista peräkkäin. ':'';
  detail+=`Valitulla määrällä n = ${n} mallin lasku on ${calculation}. Ehdotit ${a}. Vertaa ennustetta juuri tähän määrään, älä eri riviin.`;
  return {ok:false,reason:'value',text:detail};
}
export function modelScene(key,n){const value=modelValue(key,n);n=whole(n,MODELS[key].max);
  if(key==='price'){const blocks=Array.from({length:n},(_,i)=>`<rect x="${90+i*30}" y="55" width="28" height="44" fill="#b65e25"/><text x="${104+i*30}" y="83" text-anchor="middle" font-size="16" fill="#fff">2</text>`).join('');return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 155" width="320" height="155" role="img" aria-label="n = ${n}. Varausosa 4 euroa ja ${n} tulostetta, kukin 2 euroa. Yhteensä ${value} euroa."><rect width="320" height="155" fill="#fffdf6"/><text x="18" y="28" font-size="17" fill="#183e36">Varausosa säilyy</text><rect x="30" y="55" width="56" height="44" fill="#285e72"/><text x="58" y="83" text-anchor="middle" font-size="18" fill="#fff">4</text>${blocks}<text x="30" y="133" font-size="18" fill="#183e36">n = ${n}: 4 + 2 × ${n} = ${value} €</text></svg>`;}
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 155" width="320" height="155" role="img" aria-label="Alkuperäiset 12 korttia: ${n} käytetty, ${value} jäljellä."><rect width="320" height="155" fill="#fffdf6"/>${Array.from({length:12},(_,i)=>`<rect x="${20+i%6*48}" y="${20+Math.floor(i/6)*43}" width="36" height="32" fill="${i<n?'#c4c8c3':'#285e72'}" stroke="#183e36"/>${i<n?`<path d="M${23+i%6*48} ${23+Math.floor(i/6)*43} l30 26" stroke="#183e36" stroke-width="2"/>`:''}`).join('')}<text x="20" y="129" font-size="17" fill="#183e36">${n} käytetty · ${value} jäljellä: 12 − ${n}</text></svg>`;
}
const mounts=new WeakMap();
export function mount(host){const root=host.closest('#lesson-body')?.querySelector('[data-varying-lesson]');if(!root)throw new Error('Varying lesson root missing');mounts.get(root)?.dispose();
  const area=root.querySelector('[data-practice]'),fieldset=area.querySelector('fieldset'),q=s=>area.querySelector(s);let key='price',n=0,target=3,paused=false,disposed=false,last='';
  const feedback=(text,ok)=>{q('[data-feedback]').textContent=text;q('[data-feedback]').dataset.result=ok===undefined?'support':ok?'correct':'retry';};
  function render(){q('[data-model-title]').textContent=MODELS[key].title;q('[data-scene]').innerHTML=modelScene(key,n);q('[data-count]').textContent=String(n);q('[data-target-note]').textContent=`Ennustettava määrä on n = ${target}. Tutkimuskuvassa oleva määrä ei muuta tätä valintaa.`;
    q('[data-action="minus"]').disabled=n===0;q('[data-action="plus"]').disabled=n===MODELS[key].max;fieldset.disabled=paused;
    q('[data-calculation]').textContent=key==='price'?`4 + 2 × ${target} = ${modelValue(key,target)} euroa`:`12 − ${target} = ${modelValue(key,target)} korttia`;
    q('[data-action="context"]').textContent=key==='price'?'Tutki jäljellä olevia kortteja':'Tutki varausmallia';q('[data-answer-unit]').textContent=MODELS[key].unit;
  }
  function targets(){q('[data-target]').replaceChildren();for(let i=0;i<=MODELS[key].max;i++){const option=root.ownerDocument.createElement('option');option.value=String(i);option.textContent=`n = ${i}`;q('[data-target]').append(option);}q('[data-target]').value=String(target);}
  function reset(){key='price';n=0;target=3;last='';q('[data-answer]').value='';q('[data-calculation-help]').open=false;targets();feedback('Valitse ennustettava määrä ja kirjoita ennuste.');render();}
  function input(e){if(paused||disposed)return;if(e.target.matches('[data-answer]')){const v=q('[data-answer]').value;if(v!==last){last=v;feedback('Ennuste muuttui. Tarkista tämä ennuste uudelleen.');}}}
  function change(e){if(paused||disposed||!e.target.matches('[data-target]'))return;const next=whole(q('[data-target]').value,MODELS[key].max);if(next!==null&&next!==target){target=next;q('[data-calculation-help]').open=false;feedback('Ennustettava määrä vaihtui. Tarkista ennusteesi tätä määrää varten.');render();}}
  function click(e){if(paused||disposed)return;const b=e.target.closest('button');if(!b||!area.contains(b))return;
    if(b.dataset.action==='plus')n=Math.min(MODELS[key].max,n+1);if(b.dataset.action==='minus')n=Math.max(0,n-1);
    if(b.dataset.action==='check'){const r=checkPrediction(key,target,q('[data-answer]').value);feedback(r.text,r.ok);}
    if(b.dataset.action==='clear'){q('[data-answer]').value='';last='';feedback('Ennuste poistettiin.');}
    if(b.dataset.action==='context'){key=key==='price'?'remaining':'price';n=0;target=key==='price'?3:4;q('[data-answer]').value='';last='';q('[data-calculation-help]').open=false;targets();feedback('Malli vaihtui. Tee ennuste tämän säännön mukaan.');}
    render();
  }
  area.hidden=false;area.addEventListener('click',click);area.addEventListener('input',input);area.addEventListener('change',change);reset();
  const handle={pause(){if(!disposed){paused=true;fieldset.disabled=true;}},resume(){if(!disposed){paused=false;render();}},reset(){if(!disposed)reset();},dispose(){if(disposed)return;disposed=true;for(const [type,fn]of [['click',click],['input',input],['change',change]])area.removeEventListener(type,fn);area.hidden=true;if(mounts.get(root)===handle)mounts.delete(root);}};mounts.set(root,handle);return handle;
}
