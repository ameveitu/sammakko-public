import type { Paint } from '../../engine/types';
import { h } from '../../ui/dom';
import { mountObservedExplanation } from './observed-explanations';
import { checkLogicStructure,runLogicTrough,solutionLogicWorkshop,type LogicWorkshopTask,type LogicWorkshopResponse,type Side } from '../models/logic-workshop';

const grid='display:grid;gap:5px',row='display:flex;align-items:center;flex-wrap:wrap;gap:5px';
const columns='display:grid;grid-template-columns:repeat(auto-fit,minmax(min(125px,100%),1fr));gap:5px';
const control='min-height:44px;min-width:0;width:100%;box-sizing:border-box;font:inherit;color:#244b43;background:#fffdf3;border:1px solid #92aa92;border-radius:7px;padding:5px 7px';
const kind='logic-workshop' as const;
type Mode=LogicWorkshopTask['mode'];
type T<M extends Mode>=Extract<LogicWorkshopTask,{mode:M}>;
type A<M extends Mode>=Extract<LogicWorkshopResponse,{mode:M}>;
interface Work {node:HTMLElement;read():LogicWorkshopResponse;show(a:LogicWorkshopResponse):void}
const note=(text:string)=>h('p',{style:'margin:0;font-size:14px;line-height:1.25'},text);
function button(label:string,action:()=>void){return h('button',{type:'button',class:'btn',style:'min-height:44px',onclick:action},label);}
function select(label:string,options:readonly (readonly [string,string])[]){
  const input=h('select',{'aria-label':label,style:control},h('option',{value:''},'Valitse'),...options.map(([value,text])=>h('option',{value},text)));
  return {input,node:h('label',{style:grid},h('span',{style:'font-size:13px'},label),input),get:()=>input.value,set:(s:string)=>{input.value=s;}};
}
function number(label:string,max=1000000){const input=h('input',{type:'number','aria-label':label,min:-max,max,step:1,style:control});return {input,node:h('label',{style:grid},label,input),get:()=>input.value.trim()===''?NaN:Number(input.value),set:(n:number)=>{input.value=String(n);}};}
const sideOptions=[['left','Vasen'],['right','Oikea']] as const;
function checks(label:string,options:readonly (readonly [string,string])[]){
  const inputs=options.map(([id,text])=>{const input=h('input',{type:'checkbox','aria-label':`${label}: ${text}`,style:'width:20px;height:20px;flex:none'});return {id,input,node:h('label',{style:'display:flex;gap:5px;align-items:center;min-height:44px;font-size:13px'},input,text)};});
  return {node:h('div',{'aria-label':label,style:row},...inputs.map(x=>x.node)),read:()=>inputs.filter(x=>x.input.checked).map(x=>x.id),show:(ids:readonly string[])=>inputs.forEach(x=>{x.input.checked=ids.includes(x.id);})};
}
function badge(text:string){return h('strong',{style:'padding:4px 7px;border-radius:5px;background:#e4ead8;color:#294e42'},text);}
function givens(task:LogicWorkshopTask):HTMLElement{
  const node=h('div',{'data-logic-givens':task.mode,style:grid});
  if(task.mode==='cause')node.append(note(`Vertailuajo: ${task.baseline.direction==='left'?'vasen':'oikea'} ${task.apparatus==='water'?'poukama':'päätepiste'}. ${task.apparatus==='water'?'Virtaus':'Lähtökorkeus'}: asetus ${task.baseline.release}. Rata ${task.length} m.`),note(task.apparatus==='water'?'Rajattu kourumalli: suunta määrää reitin.':'Kuiva siirtokoe: kitkaton liukuva mallipallo, kaltevuuden asetus 1–4.'));
  if(task.mode==='perspective')node.append(note(`Lähtönäkymä: ${task.start==='shore'?'Loikka rannassa':'Aava vedessä'}. Etsittävä: ${task.objects.find(o=>o.id===task.target)!.label}.`));
  if(task.mode==='question')node.append(...task.subjects.map(s=>note(s.label)));
  if(task.mode==='conclusion'||task.mode==='argument'||task.mode==='truth')node.append(note(task.sceneText),h('div',{style:`display:grid;grid-template-columns:repeat(${task.data.length},minmax(0,1fr));gap:4px`},...task.data.map(d=>h('div',{style:'display:grid;gap:1px;text-align:center;padding:3px;background:#e4ead8;border-radius:5px'},h('span',{style:'font-size:12px;overflow-wrap:anywhere'},d.label),h('strong',{style:'font-size:18px'},String(d.value))))));
  if(task.mode==='combinations'){
    node.append(note(task.factors.map(f=>`${f.label}: ${f.options.map(o=>o.label).join(', ')}`).join(' · ')));
    node.append(note(task.forbidden.length?`Kielletty: ${task.forbidden.map(pattern=>pattern.map((id,i)=>task.factors[i]!.options.find(o=>o.id===id)?.label??'kaikki').join(' + ')).join('; ')}.`:'Kaikki ensimmäisen ja toisen valinnan parit ovat sallittuja.'));
  }
  if(task.mode==='rule')node.append(note(`x on kokonaisluku 0–${task.domainMax}. Jokaista x:n yksikköä kohti tulee ${task.factor} ${task.unit}. Lisäksi tulee ${task.offset} ${task.unit}${task.threshold===undefined?'.':`, kun x ≤ ${task.threshold}; kun x > ${task.threshold}, lisä on ${task.aboveOffset} ${task.unit}.`}`),badge(`Uusi syöte x = ${task.input}`));
  if(task.mode==='proof')node.append(note(`Oletukset: ${task.assumptions.map(id=>task.facts[id]).join(' ')}`),badge(`Tavoite: ${task.facts[task.goal]}`));
  if(task.mode==='reading')node.append(note(task.sentence));
  if(task.mode==='writing')node.append(note(`${task.quantity}. ${task.operation==='groups'?`${task.factor} ryhmää, jokaisessa ${task.amount} ${task.unit}. Kuinka paljon yhteensä?`:`Jaetaan ${task.amount} ${task.unit} tasan ${task.factor} ryhmään. Kuinka paljon ryhmää kohti?`}`));
  return node;
}
export function logicWorkshopPaint(task:LogicWorkshopTask,answer?:LogicWorkshopResponse):Paint{
  return host=>{
    const board=givens(task);
    if(answer){
      const worked=h('div',{'data-logic-worked-model':'',style:'display:grid;gap:4px;border-left:3px solid #6c937b;padding-left:8px;max-height:260px;overflow:auto'},h('strong',{},'Yksi malliratkaisu'));
      if(answer.mode==='cause')worked.append(note(`Muuta suunta ${answer.settings.direction==='left'?'vasemmalle':'oikealle'}, pidä virtaus tai lähtökorkeus samana. Havainto päätyy ${answer.conclusion==='left'?'vasemmalle':'oikealle'}. Alkuennusteen ei tarvitse olla oikea.`));
      else if(answer.mode==='perspective')worked.append(note(`Nimetty kohde on toisesta suunnasta ${answer.position+1}. vasemmalta. Kohteet ja naapurit säilyvät; katsojan vasen ja oikea vaihtuvat.`));
      else if(answer.mode==='question'&&task.mode==='question')worked.append(note(`Kysyn määrää ${task.quantities.find(q=>q.id===answer.quantity)!.label}, kohteena ${answer.subjects.map(id=>task.subjects.find(s=>s.id===id)!.label).join(' ja ')}. Tutkin asian ${answer.method==='count'?'laskemalla':'mittaamalla'}.`));
      else if('judgements' in answer&&(task.mode==='conclusion'||task.mode==='argument'||task.mode==='truth'))for(const j of answer.judgements)worked.append(note(`${j.statement+1}. ${{true:'Tosi',false:'Epätosi',unknown:'Ei pääteltävissä',question:'Avoin kysymys'}[j.value]??j.value}. Havaintotuki: ${j.witnesses.map(id=>task.data.find(d=>d.id===id)!.label).join(', ')||'ei ratkaisevaa havaintoa'}.`));
      else if(answer.mode==='combinations'&&task.mode==='combinations')worked.append(...answer.rows.map(row=>note(row.map((id,i)=>task.factors[i]!.options.find(o=>o.id===id)!.label).join(' + '))));
      else if(answer.mode==='rule'&&task.mode==='rule')worked.append(note(`y = ${answer.expression}${task.threshold===undefined?'':` kun x ≤ ${answer.threshold}; y = ${answer.aboveExpression} kun x > ${answer.threshold}`}. Uudella syötteellä saadaan ${answer.output} ${task.unit}.`));
      else if(answer.mode==='proof'&&task.mode==='proof')worked.append(...answer.steps.map((id,i)=>{const rule=task.rules.find(r=>r.id===id)!;return note(`${i+1}. ${rule.label} ${rule.premises.map(p=>task.facts[p]).join(' + ')} ⇒ ${task.facts[rule.conclusion]}`);}));
      else if(answer.mode==='reading'&&task.mode==='reading')worked.append(...Object.entries(answer.roles).map(([role,id])=>note(`${{given:'Annettu',target:'Kysytty',condition:'Ehto'}[role]??role}: ${task.pieces.find(p=>p.id===id)!.label}`)));
      else if(answer.mode==='writing')worked.append(note(`${answer.result} ${answer.unit}`));
      if(task.review)worked.append(note(`Malliperustelu: ${task.review.model}`));
      board.append(worked);
    }
    host.replaceChildren(board);
  };
}
function causeWork(task:T<'cause'>,changed:(r:LogicWorkshopResponse)=>void):Work{
  const prediction=select('Oma ennuste määränpäästä',sideOptions),direction=select('Kourun suunta',sideOptions),release=select(task.apparatus==='water'?'Virtauksen asetus':'Lähtökorkeuden asetus',[1,2,3,4].map(n=>[String(n),String(n)]));
  direction.set(task.draft.direction);release.set(String(task.draft.release));
  const factor=select('Muutettu tekijä',[['direction','Suunta'],['release',task.apparatus==='water'?'Virtaus':'Lähtöasetus'],['colour','Väri']]);
  const held=select('Vakiona pidetty asia',[['release',task.apparatus==='water'?'Virtaus':'Lähtöasetus'],['direction','Suunta'],['none','Ei mitään']]);
  const destination=select('Havaittu määränpää',sideOptions),observation=note('Ennuste lukitaan ennen omaa koeajoa.');
  let locked=false,observed:A<'cause'>['observed'];
  const read=():A<'cause'>=>({kind,mode:'cause',prediction:prediction.get() as Side|'',locked,settings:{direction:direction.get() as Side,release:Number(release.get())},...(observed?{observed}:{}),changed:factor.get(),held:held.get(),conclusion:destination.get()});
  const run=button('Tee vertailukoe',()=>{observed=runLogicTrough(task,read().settings);update();changed(read());});
  const lock=button('Lukitse ennuste',()=>{if(!prediction.get())return;locked=true;update();changed(read());});
  const settings=h('div',{style:columns},direction.node,release.node);
  const update=()=>{
    prediction.input.disabled=locked;lock.hidden=locked;settings.hidden=!locked;run.hidden=!locked;
    observation.textContent=observed?`Vertailu: ${task.baseline.direction==='left'?'vasen':'oikea'} → havainto ${observed.side==='left'?'vasen':'oikea'}. Mallin matka-aika ${(observed.durationMs/1000).toFixed(2)} s.`:'Ennuste lukitaan ennen omaa koeajoa.';
  };
  for(const input of [direction.input,release.input])input.addEventListener('change',()=>{observed=undefined;update();changed(read());});
  const node=h('div',{style:grid},prediction.node,lock,settings,run,observation,h('div',{style:columns},factor.node,held.node,destination.node));update();
  return {node,read,show(a){if(a.mode!=='cause')return;prediction.set(a.prediction);direction.set(a.settings.direction);release.set(String(a.settings.release));locked=a.locked;observed=a.observed;factor.set(a.changed);held.set(a.held);destination.set(a.conclusion);update();changed(read());}};
}
function perspectiveWork(task:T<'perspective'>,changed:(r:LogicWorkshopResponse)=>void):Work{
  let view=task.start,seen=new Set<string>([view]);
  const position=select('Paikka toisessa näkymässä',task.objects.map((_,i)=>[String(i),`${i+1}. vasemmalta`]));
  const stable=select('Mikä säilyy?',[['identity','Kohteet ja naapurit'],['position','Paikka kuvan vasemmalta'],['none','Kaikki vaihtuu']]);
  const change=select('Mikä muuttuu?',[['left-right','Vasen ja oikea'],['identity','Kohteet'],['count','Kohteiden määrä']]);
  const picture=h('div',{style:row,'data-logic-view':''}),caption=note('');
  const read=():A<'perspective'>=>({kind,mode:'perspective',view,seen:[...seen],position:position.get()===''?-1:Number(position.get()),stable:stable.get(),change:change.get()});
  const draw=()=>{
    caption.textContent=view==='shore'?'Loikka rannassa':'Aava vedessä';
    const objects=view==='shore'?task.objects:[...task.objects].reverse();
    picture.replaceChildren(...objects.map((o,i)=>h('span',{style:'display:grid;gap:2px;text-align:center;min-width:90px;background:#e7eddc;border:1px solid #9bad94;border-radius:7px;padding:5px;font-size:12px'},
      h('b',{style:`font-size:24px;transform:scaleY(${o.heightScale??1});margin-block:${o.heightScale?6:0}px`},o.shape==='sphere'?'●':o.shape==='cube'?'■':'▲'),`${i+1}. ${o.label}`)));
  };
  const set=(value:'shore'|'water')=>{view=value;seen.add(view);draw();changed(read());};
  const node=h('div',{style:grid},h('div',{style:row},button('Loikka rannassa',()=>set('shore')),button('Aava vedessä',()=>set('water'))),caption,picture,position.node,h('div',{style:columns},stable.node,change.node));draw();
  return {node,read,show(a){if(a.mode!=='perspective')return;view=a.view;seen=new Set(a.seen);position.set(String(a.position));stable.set(a.stable);change.set(a.change);draw();changed(read());}};
}
function questionWork(task:T<'question'>):Work{
  const verb=select('Kysymyksen alku',[['count','Kuinka monta?'],['measure','Mikä on mitattu määrä?'],['compare','Miten kahden kohteen määrät eroavat?'],['like','Mikä on mukavin?']]);
  const quantity=select('Tutkittava määrä',task.quantities.map(q=>[q.id,q.label]));
  const subjects=checks('Kysymyksen kohteet',task.subjects.map(s=>[s.id,s.label]));
  const method=select('Miten kysymys tutkitaan?',[['count','Laskemalla'],['measure','Mittaamalla'],['guess','Arvaamalla mieluisin']]);
  const sentence=note('Muodosta oma kysymys osista.'),node=h('div',{style:grid},h('div',{style:columns},verb.node,quantity.node),subjects.node,sentence,method.node);
  const draw=()=>{const names=subjects.read().map(id=>task.subjects.find(s=>s.id===id)!.label),q=task.quantities.find(q=>q.id===quantity.get());sentence.textContent=names.length&&q?`${verb.get()==='compare'?'Miten eroavat':verb.get()==='count'?'Kuinka suuri on':'Mikä on'} ${names.join(' ja ')}: ${q.label}?`:'Muodosta oma kysymys osista.';};
  node.addEventListener('change',draw);
  return {node,read:()=>({kind,mode:'question',verb:verb.get(),quantity:quantity.get(),subjects:subjects.read(),method:method.get()}),show(a){if(a.mode!=='question')return;verb.set(a.verb);quantity.set(a.quantity);subjects.show(a.subjects);method.set(a.method);draw();}};
}
function claimsWork(task:T<'conclusion'|'argument'|'truth'>):Work{
  const fields=task.statements.map((statement,i)=>{
    const value=select(`Lause ${i+1}: arvio`,[['true','Tosi'],['false','Epätosi'],['unknown','Ei pääteltävissä'],['question','Avoin kysymys']]);
    const witnesses=checks(`Lause ${i+1}: havaintotuki`,task.data.map(d=>[d.id,d.label]));
    return {value,witnesses,node:h('div',{style:'display:grid;gap:2px;padding:5px 7px;background:#eef1e6;border-radius:7px'},note(`${i+1}. ${statement.label}`),value.node,witnesses.node)};
  });
  return {node:h('div',{style:grid},note('Valitse riittävä havaintotuki. Tuntemattomalle tai kysymykselle jätä havaintotuki tyhjäksi.'),...fields.map(f=>f.node)),read:()=>({kind,mode:task.mode,judgements:fields.map((f,i)=>({statement:i,value:f.value.get(),witnesses:f.witnesses.read()}))}),show(a){if(!('judgements' in a))return;for(const j of a.judgements){fields[j.statement]?.value.set(j.value);fields[j.statement]?.witnesses.show(j.witnesses);}}};
}
function combinationsWork(task:T<'combinations'>):Work{
  const body=h('div',{'data-logic-combinations':'',style:'display:grid;gap:3px;max-height:220px;overflow:auto;padding:2px'});
  const rows:ReturnType<typeof select>[][]=[];
  const add=(values?:readonly string[])=>{
    if(rows.length>=32)return;
    const fields=task.factors.map((f,i)=>select(`Rivi ${rows.length+1}: ${f.label}`,f.options.map(o=>[o.id,o.label])));
    fields.forEach((f,i)=>{if(values)f.set(values[i]??'');});rows.push(fields);
    const line=h('div',{style:'display:grid;grid-template-columns:1fr 1fr 44px;gap:3px'},...fields.map(f=>f.input));
    const remove=button('×',()=>{rows.splice(rows.indexOf(fields),1);line.remove();rows.forEach((fs,index)=>fs.forEach((f,j)=>f.input.setAttribute('aria-label',`Rivi ${index+1}: ${task.factors[j]!.label}`)));});remove.setAttribute('aria-label','Poista yhdistelmä');
    line.append(remove);body.append(line);line.scrollIntoView({block:'nearest'});
  };
  const node=h('div',{style:grid},note('Oma yhdistelmätaulukko. Rivien järjestyksellä ei ole väliä.'),body,button('Lisää yhdistelmä',()=>add()));add();
  return {node,read:()=>({kind,mode:'combinations',rows:rows.map(fields=>fields.map(f=>f.get()))}),show(a){if(a.mode!=='combinations')return;rows.splice(0);body.replaceChildren();for(const values of a.rows)add(values);}};
}
function expression(label:string){
  const input=h('input',{type:'text',maxlength:100,'aria-label':label,style:control,autocomplete:'off',spellcheck:false});
  return {input,node:h('label',{style:grid},label,input),get:()=>/^[0-9x()+*\-\s×−]{1,100}$/.test(input.value)?input.value:'',set:(text:string)=>{input.value=text;}};
}
function ruleWork(task:T<'rule'>):Work{
  const lower=expression(task.threshold===undefined?'Oma sääntö y =':'Kun x ≤ raja, y ='),upper=expression('Kun x > raja, y ='),boundary=number('Oma ehtoraja',task.domainMax),output=number('Tulos uudella syötteellä');
  let active=lower.input;lower.input.addEventListener('focus',()=>{active=lower.input;});upper.input.addEventListener('focus',()=>{active=upper.input;});
  const blocks=h('div',{style:row},...['x','+','−','*','(',')'].map(token=>button(token,()=>{if(active.value.length<100){active.setRangeText(token,active.selectionStart??active.value.length,active.selectionEnd??active.value.length,'end');active.focus();}})));
  const node=h('div',{style:grid},note('Kirjoita tai rakenna merkeistä. Kertomerkki on *. Samaa tarkoittava lauseke kelpaa.'),lower.node,...(task.threshold===undefined?[]:[h('div',{style:columns},boundary.node,upper.node)]),blocks,output.node);
  return {node,read:()=>({kind,mode:'rule',expression:lower.get(),aboveExpression:upper.get(),threshold:boundary.get(),output:output.get()}),show(a){if(a.mode!=='rule')return;lower.set(a.expression);upper.set(a.aboveExpression);boundary.set(a.threshold);output.set(a.output);}};
}
function proofWork(task:T<'proof'>):Work{
  let steps:string[]=[];
  const choice=select('Seuraava perusteluvaihe',task.rules.map(r=>[r.id,`${r.label} ⇒ ${task.facts[r.conclusion]}`]));
  const explained=select('Vaihe jonka selitän',task.rules.map(r=>[r.id,r.label]));
  const list=h('ol',{'data-logic-proof':'',style:'margin:0;padding-left:23px;max-height:130px;overflow:auto;font-size:14px'});
  const draw=()=>list.replaceChildren(...steps.map(id=>h('li',{},task.rules.find(r=>r.id===id)?.label??id)));
  const references=h('details',{},h('summary',{},'Vaiheiden käyttämät lähtötiedot'),...task.rules.map(r=>note(`${r.label} Tarvitsee: ${r.premises.map(p=>task.facts[p]).join(' / ')}`)));
  const node=h('div',{style:grid},choice.node,h('div',{style:row},button('Lisää vaihe',()=>{if(choice.get()&&steps.length<24){steps.push(choice.get());draw();}}),button('Poista viimeinen',()=>{steps.pop();draw();})),list,references,explained.node);
  return {node,read:()=>({kind,mode:'proof',steps:[...steps],explainedStep:explained.get()}),show(a){if(a.mode!=='proof')return;steps=[...a.steps];explained.set(a.explainedStep);draw();}};
}
function readingWork(task:T<'reading'>):Work{
  const roles=['given','target','condition'].map((id,i)=>({id,...select(['Annettu tieto','Kysytty asia','Ehtolause'][i]!,task.pieces.map(p=>[p.id,p.label]))}));
  const relation=select('Ehdon matemaattinen suhde',[['ge','Vähintään (≥)'],['le','Enintään (≤)'],['difference','Määrien erotus'],['double','Kaksinkertainen määrä']]);
  return {node:h('div',{style:grid},...roles.map(r=>r.node),relation.node),read:()=>({kind,mode:'reading',roles:Object.fromEntries(roles.map(r=>[r.id,r.get()])),relation:relation.get()}),show(a){if(a.mode!=='reading')return;roles.forEach(r=>r.set(a.roles[r.id]??''));relation.set(a.relation);}};
}
function writingWork(task:T<'writing'>):Work{
  const result=number('Viestini tulos'),unit=select('Viestini yksikkö',[['kpl','kpl'],['m','m'],['kg','kg'],['none','Ei yksikköä']]);
  return {node:h('div',{style:columns},result.node,unit.node),read:()=>({kind,mode:'writing',result:result.get(),unit:unit.get()}),show(a){if(a.mode!=='writing')return;result.set(a.result);unit.set(a.unit);}};
}
export function mountLogicWorkshop(task:LogicWorkshopTask,host:HTMLElement,submit:(a:LogicWorkshopResponse)=>void,onChange?:(a:LogicWorkshopResponse)=>void):{reveal():void}{
  const changed=(a:LogicWorkshopResponse)=>onChange?.(a);
  let work:Work;
  switch(task.mode){
    case 'cause':work=causeWork(task,changed);break;
    case 'perspective':work=perspectiveWork(task,changed);break;
    case 'question':work=questionWork(task);break;
    case 'conclusion':case 'argument':case 'truth':work=claimsWork(task);break;
    case 'combinations':work=combinationsWork(task);break;
    case 'rule':work=ruleWork(task);break;
    case 'proof':work=proofWork(task);break;
    case 'reading':work=readingWork(task);break;
    case 'writing':work=writingWork(task);break;
  }
  const reviewHost=h('div',{'data-logic-own-work':'',hidden:true}),status=note('');status.setAttribute('role','status');
  let revealed=false,corrected=false,observed:{reveal():void}|undefined;
  const check=button(task.review?'Jatka omaan perusteluun':'Tarkista merkinnät',()=>{
    const answer=work.read(),verdict=checkLogicStructure(task,answer);
    if(!task.review||!verdict.ok){if(task.review&&!verdict.ok)corrected=true;submit(answer);return;}
    editor.hidden=true;reviewHost.hidden=false;reviewHost.replaceChildren();
    const context=task.mode==='proof'&&answer.mode==='proof'?`Selitä vaihe: ${task.rules.find(r=>r.id===answer.explainedStep)!.label}`:'Kerro oma perustelusi juuri rakentamistasi merkinnöistä.';
    const temporary=h('div');logicWorkshopPaint({...task,review:undefined},answer)(temporary);
    const ownWork=temporary.querySelector<HTMLElement>('[data-logic-worked-model]')!;
    ownWork.querySelector('strong')!.textContent='Omat merkinnät';
    const back=button('Muokkaa merkintöjä',()=>{editor.hidden=false;reviewHost.hidden=true;reviewHost.replaceChildren();observed=undefined;});
    reviewHost.append(h('details',{'data-logic-own-summary':''},h('summary',{style:'min-height:44px;display:flex;align-items:center;cursor:pointer;font-weight:650'},'Omat merkinnät ja niiden muokkaus'),ownWork,back));
    if(task.mode==='proof')reviewHost.append(note(context));
    observed=mountObservedExplanation({kind:'observed-explanation',...task.review,prompt:context,givens:[]},reviewHost,r=>{
      // The text and optional free feedback stay in the DOM. Only observation metadata crosses the evidence boundary.
      submit({...answer,review:{channel:r.channel,produced:r.channel==='spoken'||!!r.text?.trim(),confirmedByAdult:r.confirmedByAdult,assistance:revealed||corrected?'helped':r.assistance,observations:r.observations as Record<string,'met'|'not-yet'|'unobserved'>}});
    });
    const adult=reviewHost.querySelector<HTMLFormElement>('[data-explanation-adult]')!;
    for(const select of adult.querySelectorAll('select')){
      select.style.minHeight='44px';
      for(const option of select.options){if(option.value==='met')option.textContent='Näkyi';if(option.value==='not-yet')option.textContent='Harjoitellaan';}
    }
    const assistance=adult.querySelector<HTMLSelectElement>('select[aria-label="Saiko oppija apua?"]')!,helpLabel=assistance.parentElement!,confirmation=adult.querySelector<HTMLInputElement>('input[type=checkbox]')!.parentElement!;
    if(corrected){assistance.value='helped';assistance.disabled=true;}
    helpLabel.firstChild!.textContent='Apu';helpLabel.style.gridTemplateColumns='auto minmax(0,1fr)';
    confirmation.style.minHeight='44px';
    const support=h('div',{style:'display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:8px;align-items:center'});
    helpLabel.before(support);support.append(helpLabel,confirmation);
    const footer=adult.querySelector('button[type=submit]')!.parentElement!;footer.style.cssText='display:grid;grid-template-columns:145px minmax(0,1fr);gap:5px';
    adult.querySelector('summary')!.style.cssText='min-height:44px;display:flex;align-items:center;cursor:pointer';
    if(revealed)observed.reveal();
  });
  const editor=h('div',{style:grid},work.node,check),node=h('div',{'data-logic-workshop':task.mode,style:grid},editor,reviewHost,status);host.append(node);
  return {reveal(){revealed=true;work.show(solutionLogicWorkshop(task));observed?.reveal();status.textContent='Mallimerkinnät ovat näkyvissä. Oma harjoitus kirjataan tuetuksi.';}};
}
