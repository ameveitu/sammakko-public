const mounted = new WeakMap();
export const instructions = [
 {term:'right',text:'Siirrä kiekko aivan laatikon oikealle puolelle, samalle hyllylle.',target:[2,1]},
 {term:'up',text:'Siirrä kiekko suoraan laatikon yläpuolelle.',target:[1,0]},
 {term:'left',text:'Siirrä kiekko aivan laatikon vasemmalle puolelle, samalle hyllylle.',target:[0,1]},
 {term:'down',text:'Siirrä kiekko suoraan laatikon alapuolelle.',target:[1,2]},
 {term:'between',text:'Siirrä kiekko kahden kirjan väliin alahyllylle.',target:[1,2]},
];
function validPosition(p){return Array.isArray(p)&&p.length===2&&p.every(x=>Number.isInteger(x)&&x>=0&&x<=2);}
export function movePosition(position,direction){
 const delta={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]}[direction];
 if(!validPosition(position)||!delta)throw new RangeError('Invalid move');
 return position.map((x,i)=>Math.min(2,Math.max(0,x+delta[i])));
}
export function checkPosition(position,index){
 const task=instructions[index];if(!validPosition(position)||!task)throw new RangeError('Invalid position');
 const [x,y]=position,[tx,ty]=task.target;
 if(x===tx&&y===ty)return{ok:true,message:`Paikka sopii. ${task.term==='between'?'Kiekko on alahyllyllä kirjojen välissä.':task.term==='up'?'Kiekko on ylempänä, suoraan laatikon kohdalla.':task.term==='down'?'Kiekko on alempana, suoraan laatikon kohdalla.':`Kiekko on samalla hyllyllä laatikon ${task.term==='right'?'oikealla':'vasemmalla'} puolella.`}`};
 if(task.term==='between')return{ok:false,message:y!==2?'Kirjat ovat alahyllyllä. Siirrä kiekko ensin samalle hyllylle.':'Kiekko on toisen kirjan kohdalla. Siirrä se kirjojen väliin.'};
 if(task.term==='right'||task.term==='left')return{ok:false,message:y!==1?'Kiekko on eri hyllyllä kuin laatikko. Siirrä se samalle hyllylle.':x===1?'Kiekko on laatikon kohdalla. Siirrä se laatikon viereen.':'Kiekko on vastakkaisella puolella. Katso suunta ruutua katsovan omasta suunnasta.'};
 return{ok:false,message:x!==1?'Kiekko on sivussa. Siirrä se ensin suoraan laatikon kohdalle.':y===1?'Kiekko on laatikon kohdalla. Siirrä se eri hyllylle ohjeen suuntaan.':'Kiekko on vastakkaisella hyllyllä. Tarkista: pyydettiinkö ylös vai alas?'};
}
export function shelfSvg(position){
 if(!validPosition(position))throw new RangeError('Invalid drawing position');
 const [x,y]=position;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 315" role="img" aria-label="Hylly edestä. Laatikko keskellä. Kaksi kirjaa alahyllyn reunoissa. Kiekko ${['vasemmalla','keskellä','oikealla'][x]}, ${['ylähyllyllä','keskihyllyllä','alahyllyllä'][y]}."><text x="30" y="24" font-size="17" fill="#203e48">← vasen</text><text x="240" y="24" font-size="17" fill="#203e48">oikea →</text><g stroke="#809399" stroke-width="2" fill="none">${[0,1,2].map(row=>`<path d="M25 ${112+row*85}h310"/>${[0,1,2].map(col=>`<rect x="${35+col*110}" y="${40+row*85}" width="70" height="70" rx="5" stroke-dasharray="3 5"/>`).join('')}`).join('')}</g><rect x="156" y="148" width="48" height="30" fill="#e6be83" stroke="#203e48" stroke-width="2"/><text x="180" y="196" text-anchor="middle" font-size="15" fill="#203e48">laatikko</text>${[0,2].map(c=>`<rect x="${46+c*110}" y="231" width="48" height="26" fill="#d5e2f1" stroke="#203e48" stroke-width="2"/><path d="M${51+c*110} 235h36m-36 7h36m-36 7h36" stroke="#203e48"/><text x="${70+c*110}" y="282" text-anchor="middle" font-size="15" fill="#203e48">kirja</text>`).join('')}<circle cx="${70+x*110}" cy="${65+y*85}" r="18" fill="#a44815" stroke="#fffdf4" stroke-width="4"/><text x="${70+x*110}" y="${71+y*85}" text-anchor="middle" font-size="17" fill="#fffdf4">●</text></svg>`;
}
export function mount(host){
 const root=host.closest('#lesson-body');const scope=root?.querySelector('[data-position-work]');if(!scope)throw new Error('Missing position workspace');
  mounted.get(scope)?.dispose();
 let position=[0,0],index=0,paused=false,disposed=false;
 const feedback=scope.querySelector('[data-position-feedback]');
 const render=()=>{scope.querySelector('[data-position-scene]').innerHTML=shelfSvg(position);scope.querySelector('[data-position-goal]').textContent=instructions[index].text;};
 function click(event){const b=event.target.closest('button');if(!b||!scope.contains(b)||paused||disposed)return;
  if(b.hasAttribute('data-position-move')){const next=movePosition(position,b.dataset.positionMove);feedback.textContent=next.every((v,i)=>v===position[i])?'Kiekko on reunassa. Valitse toinen suunta.':`Kiekko siirtyi ${ {left:'vasemmalle',right:'oikealle',up:'ylös',down:'alas'}[b.dataset.positionMove]}.`;position=next;render();}
  else if(b.hasAttribute('data-position-check'))feedback.textContent=checkPosition(position,index).message;
  else if(b.hasAttribute('data-position-next')){index=(index+1)%instructions.length;feedback.textContent='Uusi ohje. Kiekko jäi samaan paikkaan.';render();}
  else if(b.hasAttribute('data-position-start')){position=[0,0];feedback.textContent='Kiekko on taas vasemmassa yläkulmassa.';render();}
 }
 scope.addEventListener('click',click);render();
 const api = {pause(){paused=true;},resume(){if(!disposed)paused=false;},reset(){if(!disposed){position=[0,0];index=0;feedback.textContent='Aloita ensimmäisestä ohjeesta.';render();}},dispose(){disposed=true;scope.removeEventListener('click',click);if(mounted.get(scope)===api)mounted.delete(scope);}};
  mounted.set(scope,api);
  return api;
}
