// Contexts borrow one live workbench; each preset keeps its own in-memory state.
// Returning restores the original work without submitting an answer or replaying motion.
function lessonContexts(read, write, start) {
  const saved = new Map(); let active = null, origin = null;
  return {
    change({action, key, preset}) {
      if (action === 'enter') {
        if (!preset || active === key) return;
        if (active !== null) throw new Error('Close the active lesson context first');
        const before = read();
        try { if (saved.has(key)) write(saved.get(key)); else start(preset); }
        catch (error) { write(before); throw error; }
        origin = before; active = key;
      } else if (action === 'leave' && active === key) {
        const state = read(), previous = origin;
        saved.set(key, state); active = null; origin = null; write(previous);
      }
    },
    clear() { saved.clear(); active = null; origin = null; }
  };
}
function contextFeedback(element) {
  return {text: element.textContent, attributes: ['data-result', 'data-verdict', 'data-code'].map(name => [name, element.getAttribute(name)])};
}
function restoreContextFeedback(element, state) {
  element.textContent = state.text;
  for (const [name, value] of state.attributes) if (value === null) element.removeAttribute(name); else element.setAttribute(name, value);
}

const mounted=new WeakMap();
export const cases=[
 {id:'bend',name:'Sama nauha mutkalle',answer:'same',why:'Nauhaa ei lisätty eikä otettu pois. Mutka lähentää päitä, mutta nauha on yhtä pitkä.'},
 {id:'width',name:'Leveä vai pitkä?',answer:'B',why:'B on pidempi. A on leveämpi, mutta sen pituus on lyhyempi. Alut ovat kohdakkain.'},
 {id:'route',name:'Kaksi eri reittiä',answer:'A',why:'A:n mutkat lisäävät kuljettavaa matkaa. Molempien reittien päät olivat yhtä kaukana, mutta reitit eivät ole yhtä pitkät.'},
 {id:'cut',name:'Kaksi palaa yhteensä',answer:'same',why:'B:n kaksi palaa yhteensä ovat yhtä pitkät kuin A:n koko nauha. Leikkaus ei tässä mallissa poista nauhaa.'},
 {id:'remove',name:'Pala otetaan pois',answer:'A',why:'B:stä otettiin pala pois. Jäljelle jäänyt B on nyt lyhyempi kuin alkuperäisen nauhan vertailukuva A.'}
];
const item=i=>{if(!Number.isInteger(i)||i<0||i>=cases.length)throw new RangeError('Invalid case');return cases[i];};
const step=s=>{if(!Number.isInteger(s)||s<0||s>4)throw new RangeError('Invalid progress');return s;};
export function ribbonPoints(progress){step(progress);let x=0,y=0;const points=[[x,y]];for(let i=0;i<24;i++){const a=1.1*progress/4*Math.sin(2*Math.PI*(i+.5)/24);x+=10*Math.cos(a);y+=10*Math.sin(a);points.push([x,y]);}return points;}
export function pathLength(points){if(!Array.isArray(points)||points.length<2||Array.from(points).some((p,i)=>!Object.hasOwn(points,i)||!Array.isArray(p)||p.length!==2||!Object.hasOwn(p,0)||!Object.hasOwn(p,1)||Array.from(p).some(v=>!Number.isFinite(v))))throw new RangeError('Invalid points');return points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p[0]-points[i][0],p[1]-points[i][1]),0);}
export function routePoints(progress){step(progress);let x=0,y=0;const points=[[0,0]];for(let i=0;i<8;i++){const a=(i%2?-1:1)*.75*(1-progress/4);x+=30*Math.cos(a);y+=30*Math.sin(a);points.push([x,y]);}return points;}
export function lengths(index){const c=item(index);return c.id==='width'?[160,240]:c.id==='route'?[240,240*Math.cos(.75)]:c.id==='remove'?[240,180]:[240,240];}
export function checkAnswer(index,answer){const c=item(index);if(!['A','B','same'].includes(answer))return{ok:false,code:'empty',message:'Valitse A, B tai yhtä pitkät. Voit tutkia kuvaa ensin.'};return answer===c.answer?{ok:true,code:'match',message:c.why}:{ok:false,code:'compare',message:c.id==='bend'?'Seuraa koko B-nauhaa. Oikaise se A:n rinnalle: lisättiinkö tai otettiinko nauhaa pois?':c.id==='width'?'Vertaa nauhojen pituutta samasta alusta. Leveys kulkee toiseen suuntaan.':c.id==='route'?'Seuraa reittiä pitkin, älä hyppää suoraan sen päiden välille. Oikaise A painikkeesta.':c.id==='cut'?'Vertaa B:n molempia paloja yhteensä. Niitä voi siirtää, mutta kumpaakaan ei poisteta.':'Katso jäljelle jäävää B:tä. Pois otettu pala ei kuulu siihen enää.'};}
const line=(pts,x,y,color)=>`<path d="${pts.map(([a,b],i)=>(i?'L':'M')+(x+a).toFixed(6)+' '+(y+b).toFixed(6)).join(' ')}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="butt" stroke-linejoin="round"/>`;
const bar=(x,y,w,h,color)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/>`;
export function modelSvg(index,progress=0,describeResult=true){const c=item(index);step(progress);let s='';const a='#315f53',b='#a34d13';
 if(c.id==='bend'){s=bar(45,52,240,10,a)+line(ribbonPoints(progress),45,125,b);}
 if(c.id==='width')s=bar(45,44,160,36,a)+bar(45,138,240,10,b);
 if(c.id==='route'){const end=45+240*Math.cos(.75);s=`<path d="M45 38 V155 M${end} 38 V155" fill="none" stroke="#81968b" stroke-dasharray="3 4"/>`+line(routePoints(progress),45,48,a)+bar(45,139,240*Math.cos(.75),10,b);}
 if(c.id==='cut'){const k=progress/4;s=bar(45,52,240,10,a)+bar(45,120,120,10,b)+bar(165-120*k,120+40*k,120,10,b);}
 if(c.id==='remove')s=bar(45,52,240,10,a)+bar(45,125,180,10,b)+`<rect x="245" y="170" width="60" height="10" fill="none" stroke="#81968b" stroke-dasharray="4 3"/><text x="140" y="206" font-size="22">pois otettu pala</text>`;
 const labels=c.id==='cut'?['A: koko nauha','B: palat yhteensä']:c.id==='bend'||c.id==='remove'?['A: ennen','B: nyt']:['A','B'];
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 220" width="330" height="220" role="img" aria-label="${c.name}. ${c.id==='cut'?'B:n molemmat palat säilyvät.':c.id==='bend'?(describeResult?'B:n päät voivat lähentyä, vaikka nauhan pituus säilyy.':'B:n nauha on taivutettu. Molemmat päät ovat merkittyjä.'):'Vertaa merkittyjen A:n ja B:n pituutta.'}"><text x="12" y="24" font-size="22" fill="#183e36">${labels[0]}</text><text x="12" y="108" font-size="22" fill="#183e36">${labels[1]}</text>${s}</svg>`;
}
export function mount(host){const root=host.closest('#lesson-body')?.querySelector('[data-length-lesson]');if(!root)throw new Error('Length root missing');mounted.get(root)?.dispose();let index=0,progress=0,answer=null,paused=false,disposed=false;const saved=new Map(),el=s=>root.querySelector(s);
 const tell=(message,result='neutral')=>{const f=el('[data-feedback]');f.textContent=message;f.dataset.result=result;};
 const freeze=()=>{for(const b of root.querySelectorAll('button,select')){if(!saved.has(b))saved.set(b,b.disabled);b.disabled=true;}};
 const restore=()=>{for(const[b,v]of saved)b.disabled=v;saved.clear();};
 function render(){el('[data-model]').innerHTML=modelSvg(index,progress,false);el('[data-case]').value=String(index);const c=cases[index];el('[data-question]').textContent=c.id==='cut'?'Vertaa B:n kahta palaa yhteensä A:han. Kumpi on pidempi?':'Kumpi on pidempi?';el('[data-model-note]').textContent=c.id==='bend'?'Taivuta ja oikaise sama nauha. A on vertailukuva, ei toinen lisätty nauha.':c.id==='route'?'Alussa reiteillä on samat päätekohdat. Oikaise A. Kummankin oman reitin pituus säilyy.':c.id==='cut'?'Siirrä B:n palat allekkain ja takaisin. Molemmat palat kuuluvat vertailuun.':c.id==='remove'?'Pois otettu pala näkyy erillään. Vertaa vain jäljelle jäävää B:tä A:han.':'Alut ovat samalla kohdalla. Tutki pituutta, älä leveyttä.';const dynamic=['bend','route','cut'].includes(c.id);el('[data-action="step"]').hidden=!dynamic;el('[data-action="straight"]').hidden=!dynamic;el('[data-action="step"]').textContent=c.id==='route'?'Oikaise vähän':c.id==='cut'?'Siirrä paloja vähän':'Taivuta vähän';el('[data-action="step"]').disabled=progress===4;el('[data-action="straight"]').textContent=c.id==='cut'?'Palat peräkkäin':c.id==='route'?'Reitit alkuun':'Oikaise';for(const b of root.querySelectorAll('[data-answer]'))b.setAttribute('aria-pressed',String(b.dataset.answer===answer));if(paused)freeze();}
 function reset(){if(disposed)return;restore();index=0;progress=0;answer=null;render();tell('Tutki, valitse ja tarkista rauhassa.');if(paused)freeze();}
 const click=e=>{const b=e.target.closest('button');if(!b||!root.contains(b)||paused||disposed)return;const a=b.dataset.action;if(b.hasAttribute('data-answer')){const v=b.dataset.answer;if(!['A','B','same'].includes(v))return;answer=answer===v?null:v;render();tell('Vastaus muuttui. Tarkista, kun haluat.');}if(a==='check'){const r=checkAnswer(index,answer);tell(r.message,r.ok?'correct':r.code==='empty'?'neutral':'retry');}if(a==='step'){progress=Math.min(4,progress+1);render();}if(a==='straight'){progress=0;render();}};
 const change=e=>{if(paused||disposed||!e.target.hasAttribute('data-case'))return;const v=Number(e.target.value);if(!Number.isInteger(v)||v<0||v>=cases.length)return;index=v;progress=0;answer=null;render();tell('Uusi vertailu. Valitse oma vastaus.');};const contexts=lessonContexts(
 ()=>({index,progress,answer,feedback:contextFeedback(el('[data-feedback]'))}),
 state=>{restore();index=state.index;progress=state.progress;answer=state.answer;render();restoreContextFeedback(el('[data-feedback]'),state.feedback);},
 preset=>{if(!['cut','remove'].includes(preset))throw new RangeError('Unsupported length context');restore();index=cases.findIndex(c=>c.id===preset);progress=0;answer=null;render();tell('Tutki tätä vertailua. Valitse oma vastaus ja tarkista, kun haluat.');}
);
root.addEventListener('click',click);root.addEventListener('change',change);reset();root.hidden=false;root.dataset.moduleReady='true';
 const api={pause(){if(disposed)return;paused=true;freeze();},resume(){if(disposed)return;paused=false;restore();},context(request){if(!disposed)contexts.change(request);},reset(){contexts.clear();reset();},dispose(){if(disposed)return;contexts.clear();disposed=true;restore();root.removeEventListener('click',click);root.removeEventListener('change',change);delete root.dataset.moduleReady;if(mounted.get(root)===api)mounted.delete(root);}};mounted.set(root,api);return api;
}
