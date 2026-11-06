export const MAT=Object.freeze({x:80,y:80,width:310,height:150});
export const VISITS=Object.freeze([
 {key:'ma',label:'Maanantai',inside:[[105,115],[195,115],[285,115]],outside:[[455,60],[455,180]]},
 {key:'ti',label:'Tiistai',inside:[],outside:[[455,45],[455,105],[455,165],[455,245]]},
 {key:'ke',label:'Keskiviikko',inside:[[125,125],[245,180]],outside:[[455,150]]}
]);
export const QUESTIONS=Object.freeze([
 {area:'mat',text:'Miten irrallisten kynien määrä rajatulla työalustalla vaihtelee maanantaina, tiistaina ja keskiviikkona piirtämisen lopussa ennen siivousta?'},
 {area:'desk',text:'Miten irrallisten kynien määrä koko pöydällä vaihtelee maanantaina, tiistaina ja keskiviikkona piirtämisen lopussa ennen siivousta?'}
]);
export function visitCount(visit,area){if(!visit||!['mat','desk'].includes(area))throw new RangeError('Invalid observation scope');return visit.inside.length+(area==='desk'?visit.outside.length:0);}
export function checkProtocol(question,protocol){
 if(!question||!['mat','desk'].includes(question.area)||!protocol)throw new RangeError('Invalid protocol');
 if(protocol.area!==question.area)return {ok:false,text:`Kysymys koskee ${question.area==='mat'?'rajattua työalustaa':'koko pöytää'}. Valitse sama laskenta-alue suunnitelmaan.`};
 if(protocol.when!=='before')return {ok:false,text:'Kysymys koskee piirtämisen loppua ennen siivousta. Siivouksen jälkeinen määrä vastaisi eri kysymykseen.'};
 if(protocol.visits!=='all')return {ok:false,text:'Kysymys koskee kolmea sovittua päivää. Suunnitelmaan tarvitaan maanantai, tiistai ja keskiviikko.'};
 if(protocol.record!=='each')return {ok:false,text:'Kertojen vaihteluun tarvitaan jokaisen kerran oma luku. Pelkkä suurin määrä ei säilytä muiden kertojen tietoja.'};
 return {ok:true,text:'Suunnitelma vastaa tätä kysymystä: sovittu alue, sama sovittu vaihe ja jokaisen kerran oma kirjaus.'};
}
function validateRecordList(records){
 if(!Array.isArray(records))throw new RangeError('Invalid recorded visits');
 for(let i=0;i<records.length;i++){
  if(!Object.hasOwn(records,i))throw new RangeError('Sparse observation records unsupported');
  const record=records[i];
  if(!record||typeof record!=='object'||Array.isArray(record)||!Object.hasOwn(record,'visitKey')||!VISITS.some(v=>v.key===record.visitKey))throw new RangeError('Unknown recorded visit');
 }
}
export function recordVisit(records,visitKey,protocol,value){
 validateRecordList(records);
 if(!protocol||!VISITS.some(v=>v.key===visitKey)||!['mat','desk'].includes(protocol.area)||!['before','after'].includes(protocol.when)||!Number.isInteger(value)||value<0||value>9)throw new RangeError('Invalid observation record');
 return [...records.filter(r=>r.visitKey!==visitKey),{visitKey,area:protocol.area,when:protocol.when,value}];
}
export function checkNotebook(question,protocol,records){
 validateRecordList(records);
 const plan=checkProtocol(question,protocol);if(!plan.ok)return plan;
 if(new Set(records.map(r=>r.visitKey)).size!==records.length)return {ok:false,text:'Samalle havaintokerralle on kaksi kirjausta. Säilytä yksi tarkistettu kirjaus kustakin kerrasta.'};
 const missing=VISITS.filter(v=>!records.some(r=>r.visitKey===v.key));if(missing.length)return {ok:false,text:`Kirjaus puuttuu: ${missing.map(v=>v.label).join(', ')}. Merkitse myös 0, jos alue katsottiin ja määrä oli nolla.`};
 for(const visit of VISITS){const r=records.find(r=>r.visitKey===visit.key);
  if(r.area!==question.area)return {ok:false,text:`${visit.label}: kirjauksen alue ei vastaa nykyistä kysymystä. Tarkista rajaus ja kirjaa tämä kerta uudelleen.`};
  if(r.when!=='before')return {ok:false,text:`${visit.label}: kirjaus on eri havaintohetkeltä. Tarvitaan piirtämisen loppu ennen siivousta.`};
  if(r.value!==visitCount(visit,question.area))return {ok:false,text:`${visit.label}: tarkista valittu alue kuvasta. Sen määrä on ${visitCount(visit,question.area)}. Korjaa saman kerran kirjaus.`};
 }
 return {ok:true,text:'Vihkossa on jokaisen sovitun kerran oikea kuvahavainto samalla sovitulla tavalla. Tulos koskee näitä kuvia ja havaintohetkiä, ei koko päivää.'};
}
export function drawVisit(visit){
 const pencil=(x,y,zone,i)=>`<g data-pencil="${visit.key}-${zone}-${i}" data-area="${zone}" transform="translate(${x} ${y})"><rect width="56" height="12" fill="#e3b349" stroke="#5a472b" stroke-width="2"/><path d="M56 0 L68 6 L56 12Z" fill="#d9c4a0" stroke="#5a472b" stroke-width="2"/></g>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 330" width="600" height="330" role="img" aria-label="Keksitty kuvahavainto ${visit.label}. Työalustalla ${visit.inside.length} kynää, koko pöydällä ${visit.inside.length+visit.outside.length}. Ennen siivousta."><rect x="8" y="8" width="584" height="310" rx="10" fill="#eadfc8" stroke="#6d5b40" stroke-width="3"/><text x="20" y="38" font-size="26" fill="#183e36">${visit.label}: ennen siivousta</text><rect x="${MAT.x}" y="${MAT.y}" width="${MAT.width}" height="${MAT.height}" fill="#d9e8dc" stroke="#245f4c" stroke-width="4" stroke-dasharray="8 5"/><text x="90" y="72" font-size="26" fill="#183e36">Työalusta</text>${visit.inside.map(([x,y],i)=>pencil(x,y,'mat',i)).join('')}${visit.outside.map(([x,y],i)=>pencil(x,y,'outside',i)).join('')}<text x="95" y="277" font-size="25" fill="#183e36">Katso sovittu alue.</text><text x="433" y="308" font-size="23" fill="#183e36">Muu pöytä</text></svg>`;
}
export function collectionFeedbackKey(questionArea,protocol,records,draftValue){
 const observations=records.map(r=>JSON.stringify([r.visitKey,r.area,r.when,r.value])).sort();
 return JSON.stringify([questionArea,protocol.area,protocol.when,protocol.visits,protocol.record,observations,draftValue]);
}
export function mount(host){
 const root=host.closest('#lesson-body')?.querySelector('[data-systematic-collection]');if(!root)throw new Error('Systematic collection root missing');
 const area=root.querySelector('[data-systematic-practice]'),controls=area.querySelector('[data-controls]'),picture=area.querySelector('[data-visit-picture]'),notebook=area.querySelector('[data-notebook]'),result=area.querySelector('[data-feedback]'),input=area.querySelector('[data-observed-value]');
 let question=0,visitIndex=0,records=[],paused=false,disposed=false,checkedKey=null;
 function protocol(){return Object.fromEntries([...area.querySelectorAll('[data-protocol]')].map(s=>[s.dataset.protocol,s.value]));}
 function feedbackKey(){return collectionFeedbackKey(QUESTIONS[question].area,protocol(),records,input.value===''?null:Number(input.value));}
 function checkedFeedback(text){result.textContent=text;checkedKey=feedbackKey();}
 function invalidateEditedFeedback(){if(checkedKey!==null&&feedbackKey()!==checkedKey){checkedKey=null;result.textContent='Suunnitelmaa tai havaintoluvun luonnosta muutettiin. Kirjaa mahdollinen havaintomuutos ja tarkista uudelleen, kun haluat.';}}
 function onEdit(event){if(paused||disposed||!area.contains(event.target)||!event.target.matches('[data-protocol],[data-observed-value]'))return;invalidateEditedFeedback();}
 function render(){const visit=VISITS[visitIndex];area.querySelector('[data-study-question]').textContent=QUESTIONS[question].text;area.querySelector('[data-visit-title]').textContent=`Keksitty kuva: ${visit.label}`;picture.innerHTML=drawVisit(visit);area.querySelector('[data-count-help]').textContent=`Työalustalla ${visitCount(visit,'mat')}, koko pöydällä ${visitCount(visit,'desk')}. Teksti on tukea kuvan lukemiseen.`;
  notebook.innerHTML=`<table><caption>Oma havaintovihko</caption><thead><tr><th scope="col">Kerta</th><th scope="col">Alue</th><th scope="col">Määrä</th></tr></thead><tbody>${VISITS.filter(v=>records.some(r=>r.visitKey===v.key)).map(v=>{const r=records.find(r=>r.visitKey===v.key);return `<tr><th scope="row">${v.label}</th><td>${r.area==='mat'?'Työalusta':'Koko pöytä'}</td><td>${r.value}</td></tr>`;}).join('')}</tbody></table>`;controls.disabled=paused;
 }
 function resetState(){checkedKey=null;question=0;visitIndex=0;records=[];input.value='';area.querySelectorAll('[data-protocol]').forEach(s=>{s.value='';});render();}
 function onClick(event){if(paused||disposed)return;const b=event.target.closest('button');if(!b||!area.contains(b))return;const action=b.dataset.action;
  if(action==='protocol'){checkedFeedback(checkProtocol(QUESTIONS[question],protocol()).text);return;}
  if(action==='check'){checkedFeedback(checkNotebook(QUESTIONS[question],protocol(),records).text);return;}
  if(action==='record'){
   const plan=checkProtocol(QUESTIONS[question],protocol());if(!plan.ok){checkedFeedback(plan.text);return;}
   if(input.value===''||!Number.isInteger(Number(input.value))||Number(input.value)<0||Number(input.value)>9){checkedFeedback('Merkitse tämän kerran havaittu kokonainen määrä 0–9. Tyhjä ruutu ei ole nolla.');return;}
   checkedKey=null;const updated=records.some(r=>r.visitKey===VISITS[visitIndex].key);records=recordVisit(records,VISITS[visitIndex].key,protocol(),Number(input.value));render();result.textContent=updated?'Saman kerran kirjaus korjattiin. Vanhaa ja uutta ei lasketa yhteen.':'Havainto kirjattiin. Koko keruun voi vielä tarkistaa.';return;
  }
  if(action==='next')visitIndex=(visitIndex+1)%VISITS.length;
  else if(action==='previous')visitIndex=(visitIndex+VISITS.length-1)%VISITS.length;
  else if(action==='question'){question=(question+1)%QUESTIONS.length;records=[];visitIndex=0;area.querySelectorAll('[data-protocol]').forEach(s=>{s.value='';});}
  else return;checkedKey=null;input.value='';render();result.textContent=action==='question'?'Kysymys vaihtui. Tee sille oma suunnitelma ja uusi vihko.':'Katso tämän kerran kuva ja sovittu alue.';
 }
 area.hidden=false;area.addEventListener('click',onClick);area.addEventListener('input',onEdit);area.addEventListener('change',onEdit);resetState();
 return {pause(){if(!disposed){paused=true;controls.disabled=true;}},resume(){if(!disposed){paused=false;controls.disabled=false;invalidateEditedFeedback();}},reset(){if(!disposed){resetState();result.textContent='Suunnitelmaa ja kirjauksia voi korjata.';}},dispose(){if(disposed)return;disposed=true;area.removeEventListener('click',onClick);area.removeEventListener('input',onEdit);area.removeEventListener('change',onEdit);area.hidden=true;picture.replaceChildren();notebook.replaceChildren();}};
}
