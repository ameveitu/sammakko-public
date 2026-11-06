export const CONTEXTS=[{numbers:[3,2,5],operator:'+',initial:3,change:2,total:5,text:'Kolme ja kaksi kiveä yhdistetään. Rakenna näistä luvuista yhteenlasku ja näytä myös koko määrä.'},{numbers:[6,2,4],operator:'−',initial:6,change:2,total:4,text:'Kuusi nappia, kaksi pois ja neljä jäljellä. Kirjoita näiden määrien välinen vähennyslaskuyhtälö.'}];
const bag=xs=>[...xs].sort((a,b)=>a-b).join(',');
export function checkEquation(tokens,context){
 const ts=tokens.map(t=>t==='-'?'−':String(t));
 if(ts.length===1)return {ok:false,reason:'result',text:'Pelkkä luku ei vielä näytä osien yhteyttä. Lisää laskumerkki ja = sekä muut kuvan luvut.'};
 if(ts.length!==5||ts.filter(x=>x==='=').length!==1)return {ok:false,reason:'syntax',text:'Tee kokonainen merkintä, kuten luku + luku = luku. Myös puolet voi vaihtaa.'};
 const n=x=>/^\d+$/.test(x);let a,b,c,operator,lhs,rhs;
 if(n(ts[0])&&['+','−'].includes(ts[1])&&n(ts[2])&&ts[3]==='='&&n(ts[4])){a=Number(ts[0]);b=Number(ts[2]);c=Number(ts[4]);operator=ts[1];lhs=operator==='+'?a+b:a-b;rhs=c;}
 else if(n(ts[0])&&ts[1]==='='&&n(ts[2])&&['+','−'].includes(ts[3])&&n(ts[4])){c=Number(ts[0]);a=Number(ts[2]);b=Number(ts[4]);operator=ts[3];lhs=c;rhs=operator==='+'?a+b:a-b;}
 else return {ok:false,reason:'syntax',text:'Laita = kahden puolen väliin. Toisella puolella on lasku, toisella luku.'};
 if(bag([a,b,c])!==bag(context.numbers))return {ok:false,reason:'quantities',text:'Käytä jokaista kuvan kolmesta luvusta kerran. Yhdistä luvut näkyviin määriin.'};
 if(operator!==context.operator)return {ok:false,reason:'operation',text:context.operator==='+'?'Tämän kierroksen merkintä yhdistää osat plusmerkillä.':'Tällä kierroksella esitetään määrien yhteys miinusmerkillä.'};
 if(lhs!==rhs)return {ok:false,reason:'equality',text:`Vasemmalla on ${lhs}, oikealla ${rhs}. = tarvitsee saman arvon kummallekin puolelle. Voit korjata paloja.`};
 return {ok:true,reason:'valid',text:'Merkintäsi on tosi ja siinä ovat kuvan määrät. Samat puolet voi lukea myös päinvastaisessa järjestyksessä.'};
}
function dots(count,y,fill){return Array.from({length:count},(_,i)=>`<circle cx="${160+(i-(count-1)/2)*30}" cy="${y}" r="10" fill="${fill}"/>`).join('');}
export function mount(host){
 const root=host.closest('#lesson-body')?.querySelector('[data-b03="M-REP-04"]');if(!root)throw new Error('Teaching root missing');let contextIndex=0,tokens=[],phase=0,paused=false,disposed=false;
 const feedback=(text,ok)=>{const e=root.querySelector('[data-feedback]');e.textContent=text;e.dataset.result=ok===undefined?'support':ok?'correct':'retry';};
 function render(){const c=CONTEXTS[contextIndex];root.querySelector('[data-context]').textContent=c.text;root.querySelector('[data-palette]').innerHTML=[...new Set(c.numbers)].map(n=>`<button type="button" data-token="${n}">${n}</button>`).join('')+`<button type="button" data-token="${c.operator}">${c.operator}</button><button type="button" data-token="=">=</button>`;root.querySelector('[data-expression]').textContent=tokens.length?tokens.join(' '):'Oma merkintä odottaa.';root.querySelector('[data-action="context"]').textContent=contextIndex?'Kokeile yhdistämistä':'Kokeile pois ottamista';
 const count=phase===0?c.initial:phase===1?(c.operator==='+'?c.initial:c.total):c.total;
 const second=phase===1&&c.operator==='+'?dots(c.change,120,'#a34d13'):'';
 root.querySelector('[data-model]').innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="175" viewBox="0 0 320 175" role="img" aria-label="${phase===0?'Aluksi '+c.initial:phase===1?(c.operator==='+'?'Alkuperäinen osa ja '+c.change+' lisää':'Pois '+c.change+', jäljellä '+c.total):'Koko määrä nyt '+c.total}"><rect width="320" height="175" rx="12" fill="#fffdf7"/>${dots(count,60,'#315f53')}${second}<text x="160" y="158" text-anchor="middle" font-size="18" fill="#183e36">${phase===0?'Aluksi '+c.initial:phase===1?(c.operator==='+'?c.change+' tulee lisää':c.change+' pois'):'Nyt '+c.total}</text></svg>`;
 root.querySelector('[data-model-text]').textContent=phase===0?`Aluksi ${c.initial}.`:phase===1?(c.operator==='+'?`${c.change} tuli lisää. Vanha osa säilyy.`:`${c.change} otettiin pois. ${c.total} jäi.`):`Nyt ${c.total}. Yhdistä jokainen merkinnän luku kuvan määrään.`;
 root.querySelectorAll('button').forEach(b=>b.disabled=paused);root.querySelector('[data-action="undo"]').disabled=paused||tokens.length===0;
 }
 const reset=()=>{contextIndex=0;tokens=[];phase=0;render();feedback('Kokoa oma merkintä.');};
 function click(e){if(paused||disposed)return;const b=e.target.closest('button');if(!b||!root.contains(b))return;const a=b.dataset.action;
 if(b.dataset.token!==undefined){if(tokens.length<7){tokens.push(b.dataset.token);feedback('Merkintä muuttui. Voit jatkaa tai tarkistaa sen uudelleen.');}else feedback('Merkintä on pitkä. Poista viimeinen pala ja tarkista rakenne.');render();}
 if(a==='undo'){tokens.pop();render();feedback('Voit jatkaa tai tarkistaa.');}if(a==='clear'){tokens=[];render();feedback('Rakenna uusi merkintä.');}
 if(a==='check'){const r=checkEquation(tokens,CONTEXTS[contextIndex]);feedback(r.text,r.ok);}
 if(a==='context'){contextIndex=1-contextIndex;tokens=[];phase=0;render();feedback('Uusi tilanne. Tutki kuva ja rakenna sen merkintä.');}
 if(a==='step'){phase=Math.min(2,phase+1);render();}if(a==='model-reset'){phase=0;render();}
 }
 root.addEventListener('click',click);reset();root.dataset.moduleReady='true';return {pause(){if(disposed)return;paused=true;render();},resume(){if(disposed)return;paused=false;render();},reset(){if(!disposed)reset();},dispose(){if(disposed)return;disposed=true;root.removeEventListener('click',click);delete root.dataset.moduleReady;}};
}
