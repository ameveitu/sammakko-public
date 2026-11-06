export const LABELS = Object.freeze({read:'Koko ohje',permission:'Aikuisen lupa',place:'Paperi alustalle',look:'Katso pöydällä',return:'Paperi takaisin',rush:'Aloitus ennen lupaa',stop:'Pysähdy, älä koske',distance:'Pysy loitolla',tell:'Kerro aikuiselle',sweep:'Kerää sirpaleet itse'});
export const SCENARIOS = Object.freeze([
 Object.freeze({key:'paper', instruction:'Kuvan paperityön ohje: lue koko ohje. Odota aikuisen lupa. Pane paperi alustalle, katso sitä pöydällä ja palauta paperi.', bank:['look','permission','return','place','read','rush'], required:['read','permission','place','look','return']}),
 Object.freeze({key:'glass', instruction:'Kuvan purkki meni rikki. Ohje: pysähdy äläkä koske. Pysy loitolla ja kerro heti aikuiselle. Kokoa nämä teot. Niiden järjestyksen ei tarvitse olla sama.', bank:['tell','sweep','distance','stop'], required:['stop','distance','tell']})
]);
export function checkPlan(index, plan) {
 const s=SCENARIOS[index];
 if(!s || !Array.isArray(plan) || plan.some(x=>!s.bank.includes(x))) throw new RangeError('Invalid safety plan');
 if(new Set(plan).size!==plan.length) return {ok:false,text:'Sama kortti on kahdesti. Käytä kutakin tarvittavaa korttia kerran.'};
 if(plan.includes('rush')) return {ok:false,text:'Ennen lupaa ei aloiteta. Poista aloitus ennen lupaa ja katso ohjeen ensimmäisiä vaiheita.'};
 if(plan.includes('sweep')) return {ok:false,text:'Sirpaleet siivoaa aikuinen. Poista itse kerääminen. Pysy loitolla ja kerro heti aikuiselle.'};
 if(s.key==='paper') {
  const mismatch=plan.findIndex((x,i)=>x!==s.required[i]);
  if(mismatch>=0) return {ok:false,text:`Katso ohjeen järjestystä. Tässä kohdassa tarvitaan kortti: ${LABELS[s.required[mismatch]]}. Työ alkaa vasta luvan jälkeen.`};
 }
 const missing=s.required.filter(x=>!plan.includes(x));
 if(missing.length) return {ok:false,text:`Polusta puuttuu vielä: ${missing.map(x=>LABELS[x]).join(', ')}.`};
 return {ok:true,text:s.key==='paper'?'Polku vastaa annettua ohjetta. Koko ohje ja lupa tulevat ennen työtä. Oikean työn luvan antaa oma aikuinen.':'Valitsit kaikki ohjeen teot: et koske, pysyt loitolla ja kerrot heti aikuiselle. Aikuinen hoitaa sirpaleet.'};
}
export function mount(host) {
 const root=host.closest('#lesson-body')?.querySelector('[data-safety-lesson]');
 if(!root)throw new Error('Safety root missing');
 const area=root.querySelector('[data-safety-practice]'), controls=area.querySelector('[data-controls]'), bank=area.querySelector('[data-safety-bank]'), list=area.querySelector('[data-plan]'), result=area.querySelector('[data-feedback]');
 let index=0, plan=[], paused=false, disposed=false;
 function render(){
  area.querySelector('[data-instruction]').textContent=SCENARIOS[index].instruction;
  if(bank.dataset.scenario!==String(index)||!bank.children.length){
   bank.replaceChildren();bank.dataset.scenario=String(index);
   for(const key of SCENARIOS[index].bank){const b=root.ownerDocument.createElement('button');b.type='button';b.dataset.card=key;b.textContent=LABELS[key];bank.append(b);}
  }
  bank.querySelectorAll('[data-card]').forEach(b=>{b.disabled=plan.includes(b.dataset.card);});
  list.replaceChildren();for(const key of plan){const li=root.ownerDocument.createElement('li');li.textContent=LABELS[key];list.append(li);}
  controls.disabled=paused;
 }
 function onClick(event){if(paused||disposed)return;const b=event.target.closest('button');if(!b||!area.contains(b))return;
  if(b.dataset.card&&!plan.includes(b.dataset.card)){plan.push(b.dataset.card);render();result.textContent='Polkua voi vielä muuttaa.';}
  else if(b.dataset.action==='check')result.textContent=checkPlan(index,plan).text;
  else if(b.dataset.action==='undo'){plan.pop();render();result.textContent='Viimeinen kortti poistettiin.';}
  else if(b.dataset.action==='clear'){plan=[];render();result.textContent='Polku on tyhjä.';}
  else if(b.dataset.action==='scenario'){index=(index+1)%SCENARIOS.length;plan=[];render();result.textContent='Katso uuden tilanteen ohje.';}
 }
 area.hidden=false;area.addEventListener('click',onClick);render();
 return {pause(){if(!disposed){paused=true;controls.disabled=true;}},resume(){if(!disposed){paused=false;controls.disabled=false;}},reset(){if(!disposed){index=0;plan=[];render();result.textContent='Voit katsoa ohjetta koko ajan.';}},dispose(){if(disposed)return;disposed=true;area.removeEventListener('click',onClick);area.hidden=true;bank.replaceChildren();list.replaceChildren();}};
}
