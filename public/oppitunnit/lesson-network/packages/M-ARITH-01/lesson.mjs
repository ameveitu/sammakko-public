const whole=n=>typeof n==='number'&&Number.isInteger(n)&&n>=0&&n<=20;
const own=(o,k)=>typeof k==='string'&&Object.hasOwn(o,k);
const family=(total,first,second)=>Object.freeze({total,first,second});
export const CASES=Object.freeze({arrival:Object.freeze({a:3,b:2,kind:'add',families:Object.freeze([family(5,3,2)]),text:'Kulhossa on 3 marjaa. Sinne laitetaan 2 marjaa lisää. Kirjoita määrien yhteyttä kuvaava laskulause.'}),remove:Object.freeze({a:6,b:2,kind:'remove',families:Object.freeze([family(6,2,4)]),text:'Korissa oli 6 omenaa. Niistä otettiin 2 pois. Kirjoita määrien yhteyttä kuvaava laskulause.'}),compare:Object.freeze({a:3,b:5,kind:'compare',families:Object.freeze([family(5,3,2)]),text:'Yhdessä rasiassa on 3 ja toisessa 5 nappia. Kuinka monta nappia toisessa on enemmän? Kirjoita määrien yhteys. Nappeja ei poisteta.'}),equal:Object.freeze({a:3,b:1,kind:'equal',families:Object.freeze([family(4,3,1),family(4,2,2)]),text:'Yhdessä joukossa on 3 ja 1 merkkiä, toisessa 2 ja 2. Kirjoita yhtäsuuruus. Voit ryhmitellä osat tai vaihtaa puolia.'}),transfer:Object.freeze({a:4,b:3,kind:'add',families:Object.freeze([family(7,4,3)]),text:'Uusi tilanne: kotelossa on 4 lyijykynää ja 3 värikynää. Kirjoita, miten määrät liittyvät toisiinsa.'})});
export function parseEquation(raw){
 if(typeof raw!=='string'||raw.length>80||!/^[\d\s()+−=-]+$/.test(raw))return null;
 const normal=raw.replace(/−/g,'-'),tokens=normal.match(/\d+|[()+\-=]/g);if(!tokens||tokens.length>36||tokens.filter(t=>t==='=').length!==1)return null;
 let i=0,numbers=0;
 function term(depth){if(depth>4)throw Error('depth');if(tokens[i]==='('){i++;const e=expression(depth+1);if(tokens[i++]!==')')throw Error('parenthesis');return e;}const token=tokens[i++];if(!/^\d{1,2}$/.test(token??'')||!whole(Number(token))||++numbers>12)throw Error('number');return{kind:'n',value:Number(token)};}
 function expression(depth){let left=term(depth);while(tokens[i]==='+'||tokens[i]==='-'){const op=tokens[i++],right=term(depth),value=op==='+'?left.value+right.value:left.value-right.value;if(!whole(value))throw Error('range');left={kind:op==='+'?'add':'sub',left,right,value};}return left;}
 try{const left=expression(0);if(tokens[i++]!=='=')return null;const right=expression(0);return i===tokens.length?{left,right,truth:left.value===right.value}:null;}catch{return null;}
}
function parts(t){if(t.kind==='n')return[t.value];if(t.kind!=='add')return null;const a=parts(t.left),b=parts(t.right);return a&&b?[...a,...b]:null;}
function groups(t,a,b){const xs=parts(t);if(!xs||xs.length<2||xs.length>6||xs.reduce((s,n)=>s+n,0)!==a+b)return false;for(let mask=1;mask<(1<<xs.length)-1;mask++){let sum=0;for(let i=0;i<xs.length;i++)if(mask&(1<<i))sum+=xs[i];if(sum===a)return true;}return false;}
function subtraction(t,a,b){return t.kind==='sub'&&t.left.value===a&&t.right.value===b;}
export function representsPartWhole(t,total,first,second){if(!t||!whole(total)||!whole(first)||!whole(second)||first+second!==total)return false;return t.value===total&&groups(t,first,second)||t.value===second&&subtraction(t,total,first)||t.value===first&&subtraction(t,total,second);}
const FAMILY_COUNTS=Object.freeze({add:1,remove:1,compare:1,equal:2});
function validFamilySet(kind,families){return own(FAMILY_COUNTS,kind)&&Array.isArray(families)&&families.length===FAMILY_COUNTS[kind]&&Reflect.ownKeys(families).length===families.length+1&&Array.from({length:families.length},(_,i)=>Object.hasOwn(families,i)&&families[i]&&typeof families[i]==='object'&&!Array.isArray(families[i])&&Reflect.ownKeys(families[i]).length===3&&['total','first','second'].every(k=>Object.hasOwn(families[i],k)&&whole(families[i][k]))&&families[i].first+families[i].second===families[i].total).every(Boolean)&&families.every(f=>f.total===families[0].total);}
export function representsFamilySet(t,kind,families){return validFamilySet(kind,families)&&families.some(f=>representsPartWhole(t,f.total,f.first,f.second));}
function containsMeaning(t,predicate,total=t.value){return t.value===total&&predicate(t)||t.kind!=='n'&&(containsMeaning(t.left,predicate,total)||containsMeaning(t.right,predicate,total));}
export function checkEquation(key,raw){
 if(!own(CASES,key))return{ok:false,message:'Valitse kuvan tilanne.'};const c=CASES[key],p=parseEquation(raw);
 if(!p)return{ok:false,message:'Kirjoita kaksi puolta ja yksi =. Voit käyttää kokonaislukuja 0–20, +, − ja sulkuja. Tyhjä vastaus ei ole laskulause.'};
 if(!p.truth)return{ok:false,message:`Määrät eivät täsmää: toisella puolella ${p.left.value}, toisella ${p.right.value}. Merkki = vaatii yhtä paljon kummallekin puolelle.`};
 const represented=[p.left,p.right].some(t=>containsMeaning(t,n=>representsFamilySet(n,c.kind,c.families)));
 if(!represented)return{ok:false,message:'Yhtäsuuruutesi on totta. Kirjoita mukaan myös kuvan osien tai muutoksen yhteys. Pelkkä sama tulos molemmilla puolilla ei vielä näytä sitä.'};
 return{ok:true,message:c.kind==='compare'?'Totta. Kirjoittamasi yhteys kuvaa suurempaa määrää, pienempää määrää ja niiden eroa. Vertailussa mitään ei oteta pois.':c.kind==='remove'?'Totta. Kirjoittamasi yhteys yhdistää alkuperäisen määrän, pois otetun osan ja jäljelle jäävän osan.':'Totta. Kuvaamasi osat ovat mukana ja merkin = molemmilla puolilla on yhtä paljon. Järjestystä ja ryhmittelyä saa vaihtaa määrän säilyessä.'};
}
const dot=(x,y,color,tag,i)=>`<circle data-${tag}="${i}" cx="${x}" cy="${y}" r="8" fill="${color}" stroke="#234b40" stroke-width="1.5"/>`;
export function picture(key,stage=0,reversed=false){
 if(!own(CASES,key)||!Number.isInteger(stage)||stage<0||stage>2||typeof reversed!=='boolean')return'';const c=CASES[key];let t='',sentence;
 if(c.kind==='add'){
  for(let i=0;i<c.a;i++)t+=dot(42+i*31,65,'#328372','original',i);
  for(let i=0;i<c.b;i++)t+=dot(stage?42+(c.a+i)*31:235+i*31,stage?65:106,'#d7aa5f','added',i);
  t+=`<text x="180" y="25" text-anchor="middle" font-size="18">${c.a} ja ${c.b}${c.kind==='add'&&key==='arrival'?' lisää':' yhdessä'}</text>`;sentence=`${c.a} + ${c.b} = ${c.a+c.b}`;
 }else if(c.kind==='remove'){
  for(let i=0;i<c.a;i++)t+=dot(45+i*38,72,'#328372','original',i);
  if(stage)for(let i=0;i<c.b;i++){const x=45+(c.a-1-i)*38;t+=`<path data-removed="${i}" d="M${x-11} 61 l22 22 m0 -22 l-22 22" stroke="#9b4538" stroke-width="3"/>`;}
  t+=`<text x="180" y="25" text-anchor="middle" font-size="18">Aluksi ${c.a}, pois ${c.b}</text>`;sentence=`${c.a} − ${c.b} = ${c.a-c.b}`;
 }else if(c.kind==='compare'){
  for(let i=0;i<c.a;i++)t+=dot(50+i*42,58,'#328372','upper',i);
  for(let i=0;i<c.b;i++)t+=dot(50+i*42,116,'#d7aa5f','lower',i);
  if(stage)for(let i=0;i<c.a;i++)t+=`<path data-pair="${i}" d="M${50+i*42} 68 V106" stroke="#668c7b" stroke-width="2"/>`;
  t+='<text x="180" y="24" text-anchor="middle" font-size="18">Kolme ja viisi. Tee pareja.</text>';sentence='5 − 3 = 2';
 }else if(c.kind==='equal'&&validFamilySet(c.kind,c.families)){
  const [left,right]=c.families;for(let i=0;i<left.total;i++){t+=dot(38+i*28,78,i<left.first?'#328372':'#d7aa5f','left',i);t+=dot(222+i*28,78,i<right.first?'#328372':'#d7aa5f','right',i);}
  t+=`<text x="180" y="25" text-anchor="middle" font-size="18">${left.first} ja ${left.second}. Toisessa ${right.first} ja ${right.second}.</text>`;sentence=`${left.first} + ${left.second} = ${right.first} + ${right.second}`;
 }else return'';
 if(stage===2){const halves=sentence.split(' = ');t+=`<text x="180" y="177" text-anchor="middle" font-size="24">${reversed?halves.reverse().join(' = '):sentence}</text>`;}
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 200" role="img" aria-label="${c.text}"><title>Tilanne, osat ja laskulause</title><g fill="#183e36" font-family="sans-serif">${t}</g></svg>`;
}
const mounted=new WeakMap();
export function mount(host){
 mounted.get(host)?.dispose();const root=host.closest('#lesson-body')?.querySelector('[data-arithmetic-sentence]');if(!root)return{pause(){},resume(){},reset(){},dispose(){}};
 const q=x=>root.querySelector(x),fields=[...root.querySelectorAll('fieldset')];let disposed=false,paused=false,modelKey='',stage=0,reversed=false,signature='';
 const report=(s,t)=>{q('[data-feedback]').dataset.verdict=s;q('[data-feedback]').textContent=t;};
 function model(){const key=q('[data-model-case]').value;if(key!==modelKey){modelKey=key;stage=0;reversed=false;}q('[data-model-picture]').innerHTML=picture(key,stage,reversed);q('[data-model-caption]').textContent=own(CASES,key)?CASES[key].text:'Valitse tilanne.';q('[data-action="step"]').disabled=paused||!own(CASES,key)||stage===2;q('[data-action="all"]').disabled=paused||!own(CASES,key)||stage===2;}
 function sync(){const key=q('[data-case]').value,raw=q('[data-equation]').value,sig=JSON.stringify([key,raw]);if(sig!==signature){signature=sig;report('neutral','Tarkista kirjoittamasi yhteys, kun olet valmis.');}const c=own(CASES,key)?CASES[key]:null;q('[data-question]').textContent=c?c.text:'Valitse tilanne.';q('[data-practice-picture]').innerHTML=picture(key,1);q('[data-hint]').textContent=c?c.kind==='compare'?'Vertaa suurempaa määrää pienempään. Ero löytyy ilman pois ottamista.':c.kind==='equal'?'Laske kumpikin kokonainen puoli. Molemmissa on neljä. Kirjoita myös osien yhteys.':c.kind==='remove'?'Alkuperäinen määrä koostuu pois otetusta ja jäljelle jäävästä osasta.':`Osat ovat ${c.a} ja ${c.b}. Plus yhdistää ne ja = kertoo yhtä suuret määrät.`:'Valitse tilanne.';const values=c&&validFamilySet(c.kind,c.families)?[...new Set([c.a,c.b,...c.families.flatMap(f=>[f.first,f.second]),...c.families.map(f=>f.total)])]:[];q('[data-token-pad]').innerHTML=[...values.map(String),'+','−','=','(',')'].map(t=>`<button type="button" data-action="token" data-token="${t}">${t}</button>`).join('');return{key,raw};}
 function edit(e){if(disposed||paused)return;if(e.target.matches('[data-model-case]'))model();if(e.target.matches('[data-case],[data-equation]'))sync();}
 function click(e){const b=e.target.closest('button[data-action]');if(!b||!root.contains(b)||disposed||paused)return;const a=b.dataset.action;if(a==='check'){const v=sync(),r=checkEquation(v.key,v.raw);report(r.ok?'correct':'retry',r.message);}else if(a==='token'||a==='clear'||a==='back'){const token=b.dataset.token;sync();const field=q('[data-equation]');field.value=a==='clear'?'':a==='back'?field.value.slice(0,-1):field.value.length<78?field.value+token:field.value;sync();field.focus();}else{model();if(a==='swap')reversed=!reversed;else stage=a==='model-reset'?0:a==='all'?2:Math.min(2,stage+1);model();}}
 function reset(){if(disposed)return;modelKey='';stage=0;reversed=false;signature='';q('[data-model-case]').value='arrival';q('[data-case]').value='arrival';q('[data-equation]').value='';sync();model();for(const f of fields)f.disabled=paused;}
 root.addEventListener('input',edit);root.addEventListener('change',edit);root.addEventListener('click',click);
 const api={pause(){if(disposed)return;paused=true;for(const f of fields)f.disabled=true;model();},resume(){if(disposed)return;paused=false;for(const f of fields)f.disabled=false;sync();model();},reset,dispose(){if(disposed)return;disposed=true;root.removeEventListener('input',edit);root.removeEventListener('change',edit);root.removeEventListener('click',click);for(const f of fields)f.disabled=true;if(mounted.get(host)===api)mounted.delete(host);}};mounted.set(host,api);reset();return api;
}
