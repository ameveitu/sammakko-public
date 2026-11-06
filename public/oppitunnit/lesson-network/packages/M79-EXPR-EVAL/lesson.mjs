/* global document */
export const CASES = Object.freeze({
 linear: Object.freeze({given:4,expression:'3x + 2',substitution:'3 · 4 + 2',label:'Kertolaskun arvo 3 · 4',part:12,total:14,help:'3x tarkoittaa 3 · x. Laske ensin 3 · 4, sitten lisää 2.'}),
 paren: Object.freeze({given:3,expression:'2(a + 5)',substitution:'2 · (3 + 5)',label:'Sulkeiden arvo 3 + 5',part:8,total:16,help:'Sulut ovat yksi kokonaisuus. Laske ensin 3 + 5, sitten kerro koko summa kahdella.'}),
 signed: Object.freeze({given:-2,expression:'4x + 9',substitution:'4 · (−2) + 9',label:'Kertolaskun arvo 4 · (−2)',part:-8,total:1,help:'Sijoita koko luku miinusmerkkeineen. Neljä kertaa −2 on −8, ja −8 + 9 = 1.'}),
 fare: Object.freeze({given:5,expression:'3 + 2k',substitution:'3 + 2 · 5',label:'Matkaosan hinta 2 · 5',part:10,total:13,help:'Annettu aloitusmaksu on 3 euroa. Viiden kilometrin osa maksaa 2 · 5 euroa. Lisää aloitusmaksu kerran.'}),
});
export function getCase(key) { return typeof key==='string'&&Object.hasOwn(CASES,key)?CASES[key]:null; }
export function integer(value) { if(typeof value!=='string'||!/^[-−]?\d+(?:[.,]0+)?$/.test(value.trim()))return null;const n=Number(value.trim().replace('−','-').replace(',','.'));return Number.isSafeInteger(n)?n:null; }
export function checkStages(key,values) {
 const q=getCase(key);if(!q)return{ok:false,code:'case',message:'Valitse yksi annetuista laskuista.'};
 if(!Array.isArray(values)||values.length!==2||![0,1].every(i=>Object.hasOwn(values,i)&&Number.isSafeInteger(values[i])))return{ok:false,code:'incomplete',message:'Kirjoita kumpaankin laskuvaiheeseen kokonaisluku. Myös miinusmerkki saa olla mukana.'};
 if(values[0]!==q.part)return{ok:false,code:'part',message:`Katso osalaskua: ${q.label} on ${q.part}, ei ${values[0]}. ${q.help}`};
 if(values[1]!==q.total)return{ok:false,code:'total',message:`Osalasku ${q.part} on oikein. ${q.help} Koko lausekkeen arvo on ${q.total}.`};
 return{ok:true,code:'match',message:`Laskuketju sopii: osalaskun arvo on ${q.part} ja koko lausekkeen arvo ${q.total}. Annettu luku korvasi kirjaimen.`};
}
export function demoState(x,step) {
 if(!Number.isInteger(x)||x<2||x>6||!Number.isInteger(step)||step<0||step>3)return null;
 return{x,step,groups:3,extra:2,product:x+x+x,total:x+x+x+2,text:[`Kolme ${x} merkin ryhmää ja kaksi irtomerkkiä. x = ${x}.`,`3x + 2 → 3 · ${x} + 2. Annettu luku tuli x:n paikalle.`,`3 · ${x} + 2 = ${3*x} + 2. Kertolasku ensin.`,`${3*x} + 2 = ${3*x+2}. Tämä on lausekkeen arvo.`][step]};
}
const mounted=new WeakMap();
export function mount(host) {
 const root=(host.closest('#lesson-body')??host).querySelector('[data-evaluate]');if(!root)throw Error('Missing expression lesson');mounted.get(root)?.dispose();
 const el=s=>root.querySelector(s),controls=()=>root.querySelectorAll('button,input,select'),feedback=el('[data-feedback]'),disabled=new Map();let paused=false,disposed=false,step=0,taskKey='linear';
 const freeze=()=>{for(const c of controls()){if(!disabled.has(c))disabled.set(c,c.disabled);c.disabled=true;}};
 const restore=()=>{for(const[c,v]of disabled)c.disabled=v;disabled.clear();};
 const neutral=()=>{feedback.dataset.verdict='neutral';feedback.textContent='Laskua on muokattu. Katso nykyiset vaiheet ja kokeile uudelleen.';};
 const taskText=()=>{const q=getCase(el('[data-case]').value);if(!q)return;el('[data-expression]').textContent=`${q.expression}, kun ${el('[data-case]').value==='paren'?'a':el('[data-case]').value==='fare'?'k':'x'} = ${q.given}`;el('[data-substitution]').textContent=q.substitution;el('[data-part-label]').textContent=q.label;el('[data-help]').textContent=q.help;};
 const demo=()=>{const s=demoState(integer(el('[data-demo-x]').value),step);if(!s)return;const picture=el('[data-picture]');picture.replaceChildren();for(let group=0;group<3;group++){const box=document.createElement('div');box.className='eval-group';const label=document.createElement('strong');label.textContent=`${s.x} merkkiä`;const dots=document.createElement('span');dots.textContent=Array(s.x).fill('●').join(' ');dots.setAttribute('aria-hidden','true');box.append(label,dots);picture.append(box);}const extras=document.createElement('div');extras.className='eval-group';extras.textContent='+ 2 irtomerkkiä: ● ●';picture.append(extras);picture.setAttribute('aria-label',`Kolmessa ryhmässä kussakin ${s.x} merkkiä ja kaksi erillistä, yhteensä ${s.total}.`);el('[data-demo-text]').textContent=s.text;el('[data-next-step]').disabled=paused||step===3;};
 const commit=e=>{if(paused||disposed)return;if(e.target.matches('[data-part],[data-total]'))neutral();else if(e.target.matches('[data-case]')&&e.target.value!==taskKey){taskKey=e.target.value;taskText();el('[data-part]').value='';el('[data-total]').value='';neutral();}else if(e.target.matches('[data-demo-x]')){step=0;demo();}};
 const click=e=>{const b=e.target.closest('button');if(paused||disposed||!b||!root.contains(b)||b.disabled)return;if(b.hasAttribute('data-next-step')){step=Math.min(3,step+1);demo();}if(b.hasAttribute('data-demo-reset')){step=0;demo();}if(b.hasAttribute('data-check')){taskKey=el('[data-case]').value;taskText();const r=checkStages(el('[data-case]').value,[integer(el('[data-part]').value),integer(el('[data-total]').value)]);feedback.textContent=r.message;feedback.dataset.verdict=r.ok?'correct':'retry';}if(b.hasAttribute('data-clear')){el('[data-part]').value='';el('[data-total]').value='';neutral();}};
 root.addEventListener('input',commit);root.addEventListener('change',commit);root.addEventListener('click',click);
 const reset=()=>{if(disposed)return;restore();for(const c of controls())c.disabled=false;el('[data-case]').value='linear';taskKey='linear';el('[data-part]').value='';el('[data-total]').value='';el('[data-demo-x]').value='4';step=0;taskText();demo();feedback.textContent='Laske osalasku ja koko arvo. Voit käyttää vihjettä.';feedback.dataset.verdict='neutral';if(paused)freeze();};
 const api={pause(){if(disposed)return;paused=true;freeze();},resume(){if(disposed)return;paused=false;restore();},reset,dispose(){if(disposed)return;disposed=true;root.removeEventListener('input',commit);root.removeEventListener('change',commit);root.removeEventListener('click',click);for(const c of controls())c.disabled=true;if(mounted.get(root)===api)mounted.delete(root);}};
 mounted.set(root,api);reset();return api;
}
