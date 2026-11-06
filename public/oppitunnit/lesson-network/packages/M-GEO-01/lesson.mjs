const mounted = new WeakMap();
export const situations = [
  { question:'Pidät oikeaa palloa käsissäsi. Onko puhe oikeasta esineestä vai piirroksesta?', answer:'object', feedback:'Oikea pallo vie tilaa. Sitä voi tunnustella ja kääntää. Ruudulla näet vain tehtävän tekstin.' },
  { question:'Paperille on piirretty varjostettu pallon kuva. Onko puhe oikeasta esineestä vai piirroksesta?', answer:'drawing', feedback:'Varjostus kuvaa pallon pyöreyttä. Paperilla on silti piirros, ei oikea pallo.' },
  { question:'Piirsit paperille ympyrän. Nyt katsot tätä piirrettyä ympyrää. Onko puhe oikeasta esineestä vai piirroksesta?', answer:'drawing', feedback:'Piirretty ympyrä esittää tasokuviota. Se on eri asia kuin paperi, jolle piirsit.' },
  { question:'Nostat oikean paperiarkin pöydältä. Onko puhe oikeasta esineestä vai piirroksesta?', answer:'object', feedback:'Paperiarkki on oikea esine. Silläkin on hieman paksuutta. Paperi ja sille piirretty kuvio ovat eri asioita.' },
];
export function checkSituation(index, answer) {
  const s=situations[index]; if(!s || !['object','drawing'].includes(answer)) throw new RangeError('Invalid situation');
  return {ok:s.answer===answer,message:(s.answer===answer?'Näin on. ':'Katso, mistä tehtävä puhuu. ')+s.feedback};
}
export function traceState(model, step) {
  if(!['cube','can'].includes(model)||!Number.isInteger(step)||step<0||step>2) throw new RangeError('Invalid trace state');
  return {model,step,outline:step===2?(model==='cube'?'square':'circle'):null,
    caption:[`Tässä malli esittää ${model==='cube'?'kuutiota':'tölkkiä'} paperin päällä. Oikeassa kokeilussa käytä oikeaa esinettä.`, 'Piirrä vain paperia koskettavan pohjan ympäri. Malli merkitsee pohjan reunan katkoviivalla.',`Nosta esine pois. Katso paperia suoraan ylhäältä: jälki esittää ${model==='cube'?'neliötä':'ympyrää'}.`][step]};
}
const solid = model => model==='cube'
  ? '<path d="M122 66l36-24 80 0-36 24z" fill="#c4dfe9"/><path d="M122 66h80v80h-80z" fill="#83b6ca"/><path d="M202 66l36-24v80l-36 24z" fill="#4e8299"/><path d="M122 66l36-24h80v80l-36 24h-80zM122 66h80v80M202 66l36-24" fill="none" stroke="#203e48" stroke-width="3"/>'
  : '<path d="M136 67v80a44 13 0 0 0 88 0V67" fill="#83b6ca" stroke="#203e48" stroke-width="3"/><ellipse cx="180" cy="67" rx="44" ry="13" fill="#c4dfe9" stroke="#203e48" stroke-width="3"/>';
export function traceSvg(model, step) {
  const s=traceState(model,step);
  const outline=model==='cube'?'<rect x="126" y="78" width="108" height="108" fill="none" stroke="#203e48" stroke-width="4"/>':'<circle cx="180" cy="132" r="54" fill="none" stroke="#203e48" stroke-width="4"/>';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 235" role="img" aria-label="${s.caption}">${step===2?`<rect x="70" y="40" width="220" height="170" fill="#fffbef" stroke="#758b91" stroke-width="2"/>${outline}`:'<path d="M56 166l62-48h172l-62 48z" fill="#fffbef" stroke="#758b91" stroke-width="2"/>'+solid(model)}${step===1?(model==='cube'?'<path d="M122 146h80l36-24h-80z"':'<ellipse cx="180" cy="147" rx="44" ry="13"')+' fill="none" stroke="#8a4c12" stroke-width="5" stroke-dasharray="7 4"/>':''}<text x="180" y="229" text-anchor="middle" font-size="16" fill="#203e48">${step===2?'Paperi ylhäältä katsottuna':'Esinettä kuvaava piirros'}</text></svg>`;
}
export function mount(host) {
  const root=host.closest('#lesson-body'); const scope=root?.querySelector('[data-geo-work]');
  if(!scope) throw new Error('Missing geometry workspace');
  mounted.get(scope)?.dispose();
  let model='cube', step=0, question=0, paused=false, disposed=false;
  const feedback=scope.querySelector('[data-geo-feedback]');
  function render(){scope.querySelector('[data-geo-scene]').innerHTML=traceSvg(model,step);scope.querySelector('[data-geo-caption]').textContent=traceState(model,step).caption;scope.querySelector('[data-geo-step]').disabled=step===2;scope.querySelector('[data-geo-question]').textContent=situations[question].question;}
  function click(event){const b=event.target.closest('button');if(!b||!scope.contains(b)||paused||disposed)return;
    if(b.hasAttribute('data-geo-model')){model=b.dataset.geoModel;step=0;render();}
    else if(b.hasAttribute('data-geo-step')){step=Math.min(2,step+1);render();}
    else if(b.hasAttribute('data-geo-start')){step=0;render();}
    else if(b.hasAttribute('data-geo-answer'))feedback.textContent=checkSituation(question,b.dataset.geoAnswer).message;
    else if(b.hasAttribute('data-geo-next')){question=(question+1)%situations.length;feedback.textContent='Uusi tilanne. Mistä siinä puhutaan?';render();}
  }
  scope.addEventListener('click',click);render();
  const api = {pause(){paused=true;},resume(){if(!disposed)paused=false;},reset(){if(!disposed){model='cube';step=0;question=0;feedback.textContent='Aloita tutkiminen uudelleen.';render();}},dispose(){disposed=true;scope.removeEventListener('click',click);if(mounted.get(scope)===api)mounted.delete(scope);}};
  mounted.set(scope,api);
  return api;
}
