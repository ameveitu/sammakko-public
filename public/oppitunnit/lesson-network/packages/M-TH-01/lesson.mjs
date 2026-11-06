export const ATTRIBUTES=['shape','color','size'];
export const CASES=[
 {left:{shape:'round',color:'blue',size:28},right:{shape:'round',color:'red',size:28},description:'Vasen lappu: sininen, kaareva reuna, korkeus 56 kuvayksikköä. Oikea lappu: punainen, kaareva reuna, korkeus 56 kuvayksikköä.'},
 {left:{shape:'round',color:'blue',size:28},right:{shape:'angular',color:'blue',size:28},description:'Vasen lappu: sininen, kaareva reuna, korkeus 56 kuvayksikköä. Oikea lappu: sininen, neljä kulmaa, korkeus 56 kuvayksikköä.'},
 {left:{shape:'round',color:'blue',size:34},right:{shape:'round',color:'blue',size:20},description:'Vasen lappu: sininen, kaareva reuna, korkeus 68 kuvayksikköä. Oikea lappu: sininen, kaareva reuna, korkeus 40 kuvayksikköä.'}
];
export function compareAttributes(left,right){return Object.fromEntries(ATTRIBUTES.map(k=>[k,left[k]===right[k]?'same':'different']));}
const LABEL={shape:'Muoto',color:'Väri',size:'Koko'};
export function checkComparison(left,right,answers){
 const target=compareAttributes(left,right);
 for(const k of ATTRIBUTES){if(!answers[k])return {ok:false,text:`Valitse vielä: ${LABEL[k].toLowerCase()} sama vai eri?`};if(answers[k]!==target[k])return {ok:false,text:`Katso ${{shape:'muotoa',color:'väriä',size:'kokoa'}[k]} uudestaan. ${LABEL[k]} on ${target[k]==='same'?'sama':'eri'}. Muut ominaisuudet voivat silti olla toisin.`};}
 return {ok:true,text:ATTRIBUTES.map(k=>`${LABEL[k]} on ${target[k]==='same'?'sama':'eri'}`).join('. ')+'. Jokainen vertailu kertoo oman asiansa.'};
}
function picture(item,x){const fill=item.color==='blue'?'#3576b8':'#b44564',r=item.size;return item.shape==='round'?`<circle cx="${x}" cy="48" r="${r}" fill="${fill}"/>`:`<rect x="${x-r}" y="${48-r}" width="${r*2}" height="${r*2}" fill="${fill}"/>`;}
export function mount(host){
 const scope=host.closest('#lesson-body');const root=scope?.querySelector('[data-source-lesson="M-TH-01"]');if(!root)throw new Error('Teaching root missing');
 let current=0,answers={},paused=false,disposed=false;
 const feedback=(text,ok)=>{const e=root.querySelector('[data-feedback]');e.textContent=text;e.dataset.result=ok===undefined?'support':ok?'correct':'retry';};
 const render=()=>{const c=CASES[current];root.querySelector('[data-comparison-view]').innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="96" viewBox="0 0 320 96" role="img" aria-label="${c.description}">${picture(c.left,80)}${picture(c.right,240)}</svg>`;root.querySelector('[data-pair-description]').textContent=`Pari ${current+1}: ${c.description}`;root.querySelectorAll('[data-attribute]').forEach(b=>{const chosen=answers[b.dataset.attribute]===b.dataset.value;b.setAttribute('aria-pressed',String(chosen));b.textContent=(chosen?'● ':'')+(b.dataset.value==='same'?'Sama ':'Eri ')+({shape:'muoto',color:'väri',size:'koko'}[b.dataset.attribute]);});};
 const reset=()=>{current=0;answers={};render();feedback('Valitse jokaiselle ominaisuudelle sama tai eri.');};
 const click=e=>{if(paused||disposed)return;const b=e.target.closest('button');if(!b||!root.contains(b))return;
  if(b.dataset.attribute){answers[b.dataset.attribute]=b.dataset.value;render();feedback('Voit korjata valintoja ja tarkistaa.');}
  if(b.dataset.action==='check'){const c=CASES[current],r=checkComparison(c.left,c.right,answers);feedback(r.text,r.ok);}
  if(b.dataset.action==='next'){current=(current+1)%CASES.length;answers={};render();feedback('Uusi pari. Tutki ominaisuudet uudestaan.');}
 };
 root.addEventListener('click',click);reset();root.dataset.moduleReady='true';
 return {pause(){paused=true;},resume(){if(!disposed)paused=false;},reset(){if(!disposed)reset();},dispose(){if(disposed)return;disposed=true;root.removeEventListener('click',click);delete root.dataset.moduleReady;}};
}
