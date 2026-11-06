// All browser access stays inside mount; the domain functions run without a DOM.
export const CASES = Object.freeze({
  strip: Object.freeze({kind:'length', name:'Paperiliuska', start:2, length:6, initialZero:1}),
  leaf: Object.freeze({kind:'length', name:'Lehden mallikuva', start:3, length:4, initialZero:2}),
  air: Object.freeze({kind:'temperature', name:'Ilman lämpötilan malli', min:0, max:30, step:2, labelEvery:10, value:18}),
});
export function scaleMarks(min,max,step,labelEvery) {
  if (![min,max,step,labelEvery].every(Number.isFinite) || step<=0 || labelEvery<step || max<=min || (max-min)/step>100 || !Number.isInteger((max-min)/step) || !Number.isInteger(labelEvery/step)) throw new RangeError('Invalid scale');
  return Array.from({length:(max-min)/step+1},(_,i)=>({value:min+i*step,labelled:i*step%labelEvery===0}));
}
export function rulerGeometry(caseKey,zero) {
  const c=Object.hasOwn(CASES,caseKey)?CASES[caseKey]:null;
  if (!c || c.kind!=='length' || !Number.isInteger(zero) || zero<c.start-1 || zero>c.start+1) throw new RangeError('Invalid ruler position');
  const x=v=>24+v*30;
  return {objectStart:x(c.start), objectEnd:x(c.start+c.length), zeroX:x(zero), unitPx:30, startReading:c.start-zero, endReading:c.start+c.length-zero};
}
const shape = a => a && typeof a==='object' && !Array.isArray(a) && Object.keys(a).sort().join(',')==='tool,unit,value,zero';
export function checkMeasurement(caseKey,a) {
  const c=Object.hasOwn(CASES,caseKey)?CASES[caseKey]:null, fail=(code,text)=>({ok:false,code,text});
  if (!c || !shape(a)) return fail('invalid','Vastaus ei ole ehjä. Valitse tilanne uudelleen ja täytä mittaustulos.');
  if (!['','ruler','thermometer','scale'].includes(a.tool) || !['','cm','mm','°C'].includes(a.unit) || (a.value!==null && !Number.isFinite(a.value))) return fail('invalid','Käytä harjoituksen välineitä ja kirjoita yksi luku.');
  if (c.kind==='length' ? !Number.isInteger(a.zero)||a.zero<c.start-1||a.zero>c.start+1 : a.zero!==null) return fail('invalid','Mittarin tila ei ole ehjä. Valitse tilanne uudelleen.');
  if (!a.tool) return fail('tool-empty','Valitse väline. Mitataanko pituutta vai lämpötilaa?');
  const tool=c.kind==='length'?'ruler':'thermometer';
  if (a.tool!==tool) return fail('tool',a.tool==='scale'?'Keittiövaaka mittaa massaa. Tässä tarvitaan toista suuretta mittaava väline.':c.kind==='length'?'Lämpömittari kertoo lämpötilan. Tähän pituusmittaukseen sopii viivotin.':'Viivotin mittaa pituutta. Ilman lämpötilaan tarvitaan lämpömittari.');
  if (!a.unit) return fail('unit-empty','Valitse myös yksikkö. Pelkkä luku ei kerro, mitä mittaus tarkoittaa.');
  if (c.kind==='length' ? !['cm','mm'].includes(a.unit) : a.unit!=='°C') return fail('unit',c.kind==='length'?'°C on lämpötilan yksikkö. Pituus voidaan ilmoittaa senttimetreinä tai millimetreinä.':'cm ja mm ovat pituuden yksiköitä. Lämpötila ilmoitetaan tässä celsiusasteina, °C.');
  if (c.kind==='length' && a.zero!==c.start) return fail('alignment','Tämän harjoituksen työohje on aloittaa nollasta. Siirrä viivottimen nollamerkki alkupäähän. Pituuden voi päätellä myös päätekohtien erotuksesta, mutta tässä harjoitellaan nollasta mittaamista.');
  if (a.value===null) return fail('empty','Lue asteikko ja kirjoita tuloksen luku. Tyhjä kenttä ei tarkoita nollaa.');
  const expected=c.kind==='length'?c.length*(a.unit==='mm'?10:1):c.value;
  if (a.value!==expected) {
    if (c.kind==='temperature') return fail('reading',a.value===14?'Lukema 14 syntyy, jos lasket neljä pientä väliä kymmenestä yhden asteen välein. Tässä viisi väliä vie luvusta 10 lukuun 20: yksi väli on 2 °C. 10 + 4 × 2 = 18 °C.':'Katso punaisen pylvään yläpää. Luvusta 10 on neljä väliä, kukin 2 °C: tulos on 18 °C.');
    if (a.unit==='mm' && a.value===c.length) return fail('conversion',`Asteikon väli on 1 cm. Yhdessä senttimetrissä on 10 mm, joten ${c.length} cm = ${c.length*10} mm.`);
    return fail('reading',`Laske alkupään ja loppupään väliset senttimetrivälit, älä rajaviivoja. Niitä on ${c.length}. Tulos on ${c.length} cm eli ${c.length*10} mm.`);
  }
  return {ok:true,code:'correct',text:c.kind==='length'?`Mallin nolla on alkupäässä. Pituus on ${c.length} cm eli ${c.length*10} mm: merkintäsi ${a.value} ${a.unit} vastaa kuvaa. Tämä ei vielä osoita oikean viivottimen käyttöä.`:'Mallin lukema 18 °C vastaa asteikkoa: 10 + 4 × 2 = 18. Tämä ei vielä osoita oikean lämpömittarin käyttöä.'};
}
export function feedbackKey(caseKey,a) {
  return JSON.stringify([caseKey,a.tool,a.unit,a.value,a.zero]);
}
export function sceneSvg(caseKey,zero,help=false) {
  const c=Object.hasOwn(CASES,caseKey)?CASES[caseKey]:null;
  if (!c) throw new RangeError('Invalid case');
  const top='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 260" role="img"';
  if(c.kind==='length') {
    const g=rulerGeometry(caseKey,zero), marks=scaleMarks(0,10,1,2), x=v=>g.zeroX+v*g.unitPx;
    return `${top} aria-label="${c.name}. Siirrettävä viivotin, asteikon väli yksi senttimetri."><title>${c.name}: nollan kohdistaminen</title><rect width="480" height="260" rx="12" fill="#fffdf7"/><text x="24" y="28" font-size="17" fill="#183e36">${c.name}</text>${caseKey==='leaf'?`<path data-object="leaf" d="M${g.objectStart} 98 Q${(g.objectStart+g.objectEnd)/2} 40 ${g.objectEnd} 98 Q${(g.objectStart+g.objectEnd)/2} 150 ${g.objectStart} 98Z" fill="#accb80" stroke="#285340" stroke-width="2"/><path d="M${g.objectStart} 98H${g.objectEnd}" stroke="#285340"/>`:`<rect data-object="strip" x="${g.objectStart}" y="78" width="${g.objectEnd-g.objectStart}" height="30" fill="#e5bd76" stroke="#634817" stroke-width="2"/>`}<path d="M${g.objectStart} 65V130M${g.objectEnd} 65V130" stroke="#285340" stroke-width="2" stroke-dasharray="4 3"/><rect x="${x(0)-12}" y="130" width="324" height="66" rx="5" fill="#f5e8b4" stroke="#634817" stroke-width="2"/>${marks.map(m=>`<line data-tick="${m.value}" x1="${x(m.value)}" x2="${x(m.value)}" y1="130" y2="${m.labelled?154:145}" stroke="#183e36" stroke-width="${m.value===0?3:1.5}"/>${m.labelled?`<text x="${x(m.value)}" y="179" text-anchor="middle" font-size="22" fill="#183e36">${m.value}</text>`:''}`).join('')}<text x="${x(9)}" y="218" font-size="18" fill="#183e36">cm</text>${help?`<circle cx="${g.zeroX}" cy="132" r="12" fill="none" stroke="#7b3c13" stroke-width="3"/><text x="24" y="245" font-size="16" fill="#183e36">Nollamerkki kohtaa vasemman katkoviivan.</text>`:''}</svg>`;
  }
  const y=v=>290-v*8, marks=scaleMarks(c.min,c.max,c.step,c.labelEvery);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360" role="img" aria-label="Ilman lämpötilan malli. Asteikon numerot 0, 10, 20 ja 30 celsiusastetta; kymmenen asteen välillä viisi yhtä suurta väliä."><title>Lämpömittarin asteikon lukeminen</title><rect width="360" height="360" rx="12" fill="#fffdf7"/><text x="18" y="25" font-size="18" fill="#183e36">Ilman lämpötilan malli</text><rect x="75" y="38" width="30" height="268" rx="14" fill="#edf3f5" stroke="#183e36" stroke-width="2"/><circle cx="90" cy="310" r="18" fill="#ae332f" stroke="#183e36" stroke-width="2"/><rect data-liquid="true" x="82" y="${y(c.value)}" width="16" height="${310-y(c.value)}" fill="#ae332f"/>${marks.map(m=>`<line data-tick="${m.value}" x1="110" x2="${m.labelled?140:125}" y1="${y(m.value)}" y2="${y(m.value)}" stroke="#183e36" stroke-width="2"/>${m.labelled?`<text x="150" y="${y(m.value)+7}" font-size="22" fill="#183e36">${m.value}</text>`:''}`).join('')}<text x="225" y="56" font-size="24" fill="#183e36">°C</text>${help?'<text x="210" y="145" font-size="18" fill="#183e36">10 → 20</text><text x="210" y="174" font-size="18" fill="#183e36">5 väliä</text><text x="210" y="203" font-size="18" fill="#183e36">Yksi väli: 2 °C</text>':''}</svg>`;
}
export function mount(host) {
  const root=host.closest('#lesson-body')||host, area=root.querySelector('[data-scimeasure]');
  if(!area) throw new Error('Missing measurement component');
  const q=s=>area.querySelector(s), field=q('[data-controls]'), picker=q('[data-case]'), tool=q('[data-tool]'), unit=q('[data-unit]'), value=q('[data-value]'), zero=q('[data-zero]'), guide=q('[data-guide]'), result=q('[data-result]'), drawing=q('[data-drawing]');
  let paused=false,disposed=false,checkedKey=null;
  const answer=()=>({tool:tool.value,unit:unit.value,value:value.value.trim()===''?null:Number(value.value),zero:CASES[picker.value].kind==='length'?Number(zero.value):null});
  const key=()=>feedbackKey(picker.value,answer());
  const neutral='Mittausta muutettiin. Tarkista nykyinen mittaus uudelleen, kun haluat.';
  function invalidate(){if(checkedKey!==null && key()!==checkedKey){checkedKey=null;result.textContent=neutral;result.dataset.verdict='neutral';}}
  function render(){
    const c=CASES[picker.value],length=c.kind==='length';
    q('[data-ruler-control]').hidden=!length;
    q('[data-task]').textContent=length?'Mittaa mallin pituus. Kohdista viivottimen nolla alkupäähän ja ilmoita luku sekä yksikkö.':'Lue mallin ilman lämpötila. Etsi ensin, kuinka paljon yksi pieni asteikkoväli tarkoittaa.';
    if(length){const z=Number(zero.value);zero.setAttribute('aria-valuetext',z<c.start?'Nollamerkki alkupään vasemmalla puolella':z>c.start?'Nollamerkki alkupään oikealla puolella':'Nollamerkki alkupään kohdalla');q('[data-position]').textContent=zero.getAttribute('aria-valuetext');}
    drawing.innerHTML=sceneSvg(picker.value,length?Number(zero.value):null,guide.checked);
  }
  function fresh(){const c=CASES[picker.value];if(c.kind==='length'){zero.min=String(c.start-1);zero.max=String(c.start+1);zero.value=String(c.initialZero);}tool.value='';unit.value='';value.value='';checkedKey=null;result.textContent='Voit kokeilla rauhassa. Tarkistus koskee vain tätä mallia.';result.dataset.verdict='neutral';render();}
  function onEdit(e){if(paused||disposed||!area.contains(e.target))return;
    if(e.target.matches('[data-case]')){fresh();return;}
    if(e.target.matches('[data-guide]')){render();return;}
    if(e.target.matches('[data-tool],[data-unit],[data-value],[data-zero]')){invalidate();if(e.target.matches('[data-zero]'))render();}
  }
  function onClick(e){if(paused||disposed)return;const b=e.target.closest('[data-action]');if(!b||!area.contains(b))return;
    if(b.dataset.action==='check'){const verdict=checkMeasurement(picker.value,answer());result.textContent=verdict.text;result.dataset.verdict=verdict.ok?'correct':'retry';checkedKey=key();}
    if(b.dataset.action==='reset'){picker.value='strip';guide.checked=false;fresh();}
  }
  field.disabled=false;fresh();area.addEventListener('click',onClick);area.addEventListener('input',onEdit);area.addEventListener('change',onEdit);
  return {pause(){if(disposed)return;paused=true;field.disabled=true;},resume(){if(disposed)return;paused=false;field.disabled=false;invalidate();render();},reset(){if(disposed)return;picker.value='strip';guide.checked=false;fresh();field.disabled=paused;},dispose(){if(disposed)return;disposed=true;field.disabled=true;area.removeEventListener('click',onClick);area.removeEventListener('input',onEdit);area.removeEventListener('change',onEdit);}};
}
