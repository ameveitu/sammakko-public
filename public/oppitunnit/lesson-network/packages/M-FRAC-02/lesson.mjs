const mounted = new WeakMap();
export const buildCases = [
  {a:3,b:5,model:'bar',text:'Merkitse nauhasta kolme viidesosaa: 3/5.'},
  {a:1,b:4,model:'square',text:'Merkitse koko neliöstä yksi neljäsosa: 1/4.'},
  {a:2,b:6,model:'flags',text:'Kokonainen on kaikki kuusi lippua. Merkitse niistä kaksi kuudesosaa: 2/6.'}
];
export const readCases = [
  {a:3,b:5,model:'bar',selected:[0,2,4]},
  {a:1,b:4,model:'square',selected:[2]},
  {a:2,b:6,model:'flags',selected:[1,4]}
];
function chosenSet(selected,b) {
  if(!Array.isArray(selected)||Array.from(selected).some(x=>!Number.isInteger(x)||x<0||x>=b))throw new RangeError('Invalid selected parts');
  return [...new Set(selected)].sort((a,b)=>a-b);
}
export function checkSelection(selected,index) {
  if(!Number.isInteger(index)||index<0||index>=buildCases.length)throw new RangeError('Invalid construction');
  const task=buildCases[index];
  const chosen=chosenSet(selected,task.b), count=chosen.length;
  if(count!==task.a)return {ok:false,code:count<task.a?'few':'many',message:`Valitsit ${count} osaa. Tehtävä pyytää ${task.a} osaa kokonaisen ${task.b} yhtä suuresta osasta. ${count<task.a?'Lisää':'Poista'} valintoja; koko kokonainen pysyy samana.`};
  return {ok:true,code:'match',message:`Valitsit ${task.a} kokonaisen ${task.b} yhtä suuresta osasta: ${task.a}/${task.b}. Osien ei tarvitse olla vierekkäin.`};
}
function entry(value) {
  const s=String(value??'').trim();if(!s)return null;
  const n=Number(s.replace(',','.'));return Number.isSafeInteger(n)&&n>=0&&n<=64?n:NaN;
}
export function checkNotation(index,top,bottom) {
  if(!Number.isInteger(index)||index<0||index>=readCases.length)throw new RangeError('Invalid notation task');
  const q=readCases[index];
  const a=entry(top),b=entry(bottom);
  if(a===null||b===null)return {ok:false,code:'missing',message:'Kirjoita molemmat luvut. Ylös tulee valittujen määrä ja alas kaikkien yhtä suurten osien määrä.'};
  if(!Number.isInteger(a)||!Number.isInteger(b)||b<=0)return {ok:false,code:'invalid',message:'Käytä kokonaisia lukuja 0–64. Alaluvun täytyy olla vähintään 1: kokonaisessa on osia.'};
  if(a===q.a&&b===q.b)return {ok:true,code:'exact',message:`Kuvan jako: ${q.a} valittua osaa, ${q.b} osaa yhteensä. Merkintä ${a}/${b} vastaa tätä jakoa.`};
  if(a*q.b===q.a*b)return {ok:true,code:'equivalent',message:`Sama määrä, oikein: ${a}/${b} on samanarvoinen kuin ${q.a}/${q.b}. Kuvassa on ${q.b} yhtä suurta osaa ja ${q.a} niistä valittu, joten juuri tämän jaon merkintä on ${q.a}/${q.b}. Samanarvoista vastaustasi ei tarvitse vaihtaa.`};
  if(a===q.b&&b===q.a)return {ok:false,code:'swapped',message:`Luvut vaihtoivat paikkaa. Kokonaisen ${q.b} osaa merkitään alas ja ${q.a} valittua osaa ylös.`};
  if(b!==q.b)return {ok:false,code:'whole',message:`Tämä merkintä ei kuvaa samaa määrää. Laske koko kehyksen kaikki ${q.b} yhtä suurta osaa, myös värittämättömät. Valittuja on ${q.a}.`};
  return {ok:false,code:'selected',message:`Alaluku ${q.b} sopii kuvan jakoon. Vertaa ylälukua merkittyihin osiin: niitä on ${q.a}.`};
}
export function partsSvg(model,b,selected=[],describeCounts=true) {
  if(!['bar','square','flags'].includes(model)||!Number.isInteger(b)||b<2||b>8||(model==='square'&&b!==4))throw new RangeError('Invalid fraction drawing');
  const chosen=chosenSet(selected,b);
  const label=describeCounts?`Kokonainen: ${model==='flags'?'kaikki '+b+' lippua':model==='square'?'yksi neliö':'yksi nauha'}. ${b} yhtä suurta osaa, ${chosen.length} merkitty. Merkittyjen osien numerot ${chosen.map(i=>i+1).join(', ')||'ei valintoja'}.`:`Kokonainen: ${model==='flags'?'koko lipun joukko':model==='square'?'yksi neliö':'yksi nauha'}. Osat ovat yhtä suuria. Osakohtaiset havainnot: ${Array.from({length:b},(_,i)=>chosen.includes(i)?'osa merkitty':'osa vaalea').join('; ')}.`;
  let drawing='';
  for(let i=0;i<b;i++) {
    const on=chosen.includes(i),fill=on?'#245f4c':'#fffaf0',ink=on?'#ffffff':'#183e36';
    if(model==='bar') {const w=280/b,x=20+i*w;drawing+=`<rect x="${x}" y="46" width="${w}" height="68" fill="${fill}" stroke="#183e36" stroke-width="2"/><text x="${x+w/2}" y="88" text-anchor="middle" font-size="21" fill="${ink}">${on?'✓':i+1}</text>`;}
    else if(model==='square'){const x=90+(i%2)*70,y=20+Math.floor(i/2)*70;drawing+=`<rect x="${x}" y="${y}" width="70" height="70" fill="${fill}" stroke="#183e36" stroke-width="2"/><text x="${x+35}" y="${y+43}" text-anchor="middle" font-size="21" fill="${ink}">${on?'✓':i+1}</text>`;}
    else {const x=25+i*(270/b);drawing+=`<line x1="${x}" y1="40" x2="${x}" y2="124" stroke="#183e36" stroke-width="3"/><path d="M${x} 42h32v44h-32z" fill="${fill}" stroke="#183e36" stroke-width="2"/><text x="${x+16}" y="71" text-anchor="middle" font-size="19" fill="${ink}">${on?'✓':i+1}</text>`;}
  }
  if(model==='flags')drawing=`<rect x="10" y="24" width="300" height="120" rx="6" fill="none" stroke="#183e36" stroke-width="2" stroke-dasharray="5 4"/>${drawing}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" role="img" aria-label="${label}">${drawing}</svg>`;
}
export const demoCaptions=[
  'Kehys rajaa yhden kokonaisen nauhan. Merkittyjä kohtia voi olla eri puolilla.',
  'Laske kaikki osat, myös vaaleat: viisi yhtä suurta osaa. Valmiin merkinnän alaluku on 5.',
  'Merkittyjä osia on kolme. Valmiin merkinnän yläluku on 3. Koko nauhassa on edelleen viisi osaa.',
  'Kolme viidesosaa: 3/5. Ylös valittujen määrä, alas kaikkien yhtä suurten osien määrä.'
];
export function mount(host) {
  const scope=host.closest('#lesson-body')?.querySelector('[data-fraction-lesson]');if(!scope)throw new Error('Missing fraction lesson');
  mounted.get(scope)?.dispose();
  let build=0,read=0,selected=[],step=0,paused=false,disposed=false;
  const disabled=new Map();
  const el=s=>scope.querySelector(s);
  const freeze=()=>{for(const b of scope.querySelectorAll('button,input')){if(!disabled.has(b))disabled.set(b,b.disabled);b.disabled=true;}};
  const restore=()=>{for(const[b,value]of disabled)b.disabled=value;disabled.clear();};
  const feedback=(selector,result)=>{const out=el(selector);out.textContent=result.message;out.dataset.result=result.ok?'correct':'retry';out.dataset.code=result.code;};
  const neutral=(selector,message)=>{const out=el(selector);out.textContent=message;out.dataset.result='neutral';delete out.dataset.code;};
  function renderBuild(focus=null){const q=buildCases[build];el('[data-build-task]').textContent=q.text;el('[data-build-picture]').innerHTML=partsSvg(q.model,q.b,selected);el('[data-build-parts]').innerHTML=Array.from({length:q.b},(_,i)=>`<button type="button" data-build-part="${i}" aria-pressed="${selected.includes(i)}">Osa ${i+1}${selected.includes(i)?' ✓':''}</button>`).join('');if(focus!==null)el(`[data-build-part="${focus}"]`)?.focus();}
  function renderRead(){const q=readCases[read];el('[data-read-picture]').innerHTML=partsSvg(q.model,q.b,q.selected,false);el('[data-read-context]').textContent=q.model==='flags'?'Kokonainen on koko lipun joukko.':'Kokonainen on koko kehyksen '+(q.model==='square'?'neliö.':'nauha.');el('[data-read-top]').value='';el('[data-read-bottom]').value='';}
  function renderDemo(){el('[data-fraction-demo-picture]').innerHTML=partsSvg('bar',5,[0,2,4]);el('[data-fraction-demo-caption]').textContent=demoCaptions[step];el('[data-fraction-demo-notation]').textContent=step===3?'3/5':step===2?'3 / 5':step===1?'? / 5':'Kokonainen ensin';el('[data-fraction-demo-step]').disabled=step===3;}
  function reset(){if(disposed)return;restore();build=0;read=0;selected=[];step=0;renderBuild();renderRead();renderDemo();neutral('[data-build-feedback]','Valitse osat itse ja tarkista, kun haluat.');neutral('[data-read-feedback]','Kirjoita kuvan merkintä. Myös samanarvoinen merkintä hyväksytään.');if(paused)freeze();}
  function click(e){const b=e.target.closest('button');if(!b||!scope.contains(b)||paused||disposed)return;
    if(b.hasAttribute('data-build-part')){const n=Number(b.dataset.buildPart);selected=selected.includes(n)?selected.filter(x=>x!==n):[...selected,n];neutral('[data-build-feedback]','Valintaa muutettu. Tarkista halutessasi.');renderBuild(n);}
    else if(b.hasAttribute('data-build-check'))feedback('[data-build-feedback]',checkSelection(selected,build));
    else if(b.hasAttribute('data-build-clear')){selected=[];renderBuild();neutral('[data-build-feedback]','Valinnat poistettu. Sama tehtävä jatkuu.');}
    else if(b.hasAttribute('data-build-next')){build=(build+1)%buildCases.length;selected=[];renderBuild();neutral('[data-build-feedback]','Uusi kokonainen. Lue sen merkintä ja valitse osat.');}
    else if(b.hasAttribute('data-read-check'))feedback('[data-read-feedback]',checkNotation(read,el('[data-read-top]').value,el('[data-read-bottom]').value));
    else if(b.hasAttribute('data-read-next')){read=(read+1)%readCases.length;renderRead();neutral('[data-read-feedback]','Uusi kuva. Aloita kokonaisesta.');}
    else if(b.hasAttribute('data-fraction-demo-step')){step=Math.min(3,step+1);renderDemo();}
    else if(b.hasAttribute('data-fraction-demo-reset')){step=0;renderDemo();}
  }
  const input=()=>{if(!paused&&!disposed)neutral('[data-read-feedback]','Vastausta muutettu. Tarkista uudelleen.');};
  scope.addEventListener('click',click);scope.addEventListener('input',input);reset();scope.dataset.moduleReady='true';
  const api={pause(){if(disposed)return;paused=true;freeze();},resume(){if(disposed)return;paused=false;restore();},reset,dispose(){if(disposed)return;disposed=true;restore();scope.removeEventListener('click',click);scope.removeEventListener('input',input);delete scope.dataset.moduleReady;if(mounted.get(scope)===api)mounted.delete(scope);}};
  mounted.set(scope,api);return api;
}
