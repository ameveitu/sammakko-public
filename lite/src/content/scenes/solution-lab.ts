import type {Paint} from '../../engine/types';
import {mountObservedExplanation} from './observed-explanations';
import {solutionExplanation,solutionFormat,solutionIndicators,solutionMassState,solutionValue,solutionSolutionLab,
 type SolutionLabTask,type SolutionLabResponse,type Acidity,type SolutionRational,type MassSample} from '../models/solution-lab';

const kind='solution-lab' as const;
const grid='display:grid;grid-template-columns:repeat(auto-fit,minmax(min(110px,100%),1fr));gap:3px 6px';
const stack='display:grid;gap:4px';
const names:Record<Acidity,string>={acidic:'Hapan',neutral:'Neutraali',basic:'Emäksinen'};
function el<K extends keyof HTMLElementTagNameMap>(tag:K,text?:string){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;}
function note(text:string){const n=el('p',text);n.style.cssText='margin:0;font-size:13px;line-height:1.22';return n;}
function button(text:string,action:()=>void){const b=el('button',text);b.type='button';b.className='btn';b.style.minHeight='44px';b.onclick=action;return b;}
function field<T extends HTMLInputElement|HTMLSelectElement>(name:string,caption:string,input:T){
 const node=el('label',caption);node.style.cssText='display:grid;gap:1px;min-width:0;font-size:13px;line-height:1.15';
 input.setAttribute('aria-label',name);input.style.cssText='box-sizing:border-box;min-width:44px;max-width:100%;width:100%;min-height:44px;font:inherit;padding:3px 5px;color:#234e44;background:#fffdf4;border:1px solid #7c9c8a;border-radius:6px';node.append(input);return node;
}
function number(name:string,caption=name){const input=el('input');input.type='text';input.inputMode='decimal';input.autocomplete='off';input.maxLength=48;
 return {node:field(name,caption,input),input,get:()=>{const text=input.value.trim();return solutionValue(text)?text:'';}};}
function menu(name:string,options:readonly (readonly [string,string])[],caption=name){const input=el('select');input.add(new Option('Valitse',''));for(const [id,label] of options)input.add(new Option(label,id));return {node:field(name,caption,input),input,get:()=>input.value};}
function check(name:string){const input=el('input');input.type='checkbox';input.setAttribute('aria-label',name);input.style.cssText='width:20px;height:20px';const node=el('label');node.style.cssText='display:flex;gap:5px;align-items:center;min-height:44px;font-size:13px';node.append(input,document.createTextNode(name));return {node,input};}
const qNumber=([n,d]:SolutionRational)=>Number(n)/Number(d);
function massCard(sample:MassSample,max:number,state?:ReturnType<typeof solutionMassState>,show:'parts'|'total'='total'){
 const total=state?state.target.total:[BigInt(sample.solute+sample.solvent),1n] as const;
 const part=state?state.target.solute:[BigInt(sample.solute),1n] as const;
 const totalWidth=240*qNumber(total)/max,partWidth=240*qNumber(part)/max;
 const panel=el('div');panel.dataset.solutionSample=sample.id;panel.style.cssText='padding:4px 6px;border:1px solid #b9cdb6;border-radius:7px;background:#edf2e4';panel.append(note(sample.label));
 const picture=el('div');picture.innerHTML=`<svg viewBox="0 0 260 35" role="img" aria-label="Aineosa ja koko liuos yhteisellä massamittakaavalla" style="display:block;width:100%;height:34px"><rect x="6" y="3" width="${totalWidth}" height="26" fill="#e3d9ae" stroke="#375f52"/><rect x="6" y="3" width="${partWidth}" height="26" fill="#4d8573"/><path d="M6 32h${240}" stroke="#657c64"/></svg>`;
 panel.append(picture,note(state?`Havaittu aineosa ${solutionFormat(part)} g · koko liuos ${solutionFormat(total)} g`:
  show==='parts'?`Aineosa ${sample.solute} g · liuotin ${sample.solvent} g`:`Aineosa ${sample.solute} g · koko liuos ${sample.solute+sample.solvent} g`));
 return panel;
}
function phReference(){return note('Vesiliuokset 25 °C · mallialue 0–14. pH < 7 hapan, pH = 7 neutraali, pH > 7 emäksinen.');}
function reference(task:Extract<SolutionLabTask,{mode:'indicator'}>){
 const root=el('div');root.style.cssText=stack;
 root.append(phReference(),note('Taulukkomallissa värinvaihtoväli sisältää molemmat rajat. Viereiset värialueet ovat siirtymärajalta avoimia. Fyysinen värimuutos on asteittainen. Yhteinen pH voi puuttua.'));
 for(const reading of task.readings){
  const indicator=solutionIndicators[reading.indicator],index=['low','transition','high'].indexOf(reading.band),line=el('div');line.style.cssText='display:grid;gap:2px;padding:4px 6px;border-left:5px solid '+indicator.fills[index]+';background:#edf2e4';
  line.append(note(`${indicator.name} · näytteen havainto ${indicator.colors[index]}`),note(
   `${indicator.colors[0]} 0 ≤ pH < ${indicator.lower10/10} · ${indicator.colors[1]} ${indicator.lower10/10} ≤ pH ≤ ${indicator.upper10/10} · ${indicator.colors[2]} ${indicator.upper10/10} < pH ≤ 14`));root.append(line);
 }
 return root;
}
export const solutionLabPaint=(task:SolutionLabTask):Paint=>host=>{
 const root=el('div');root.dataset.solutionBoard='';root.dataset.mode=task.mode;root.style.cssText=stack;
 if(task.mode==='concentration'){
  const max=task.sample.solute+task.sample.solvent+(task.operation?.kind==='dilute'?task.operation.amount:0);
  root.append(note('Virtuaalinen mallinäyte · massapitoisuus m/m · kaikki massat grammoina. Tumma osa sisältyy koko liuokseen.'),massCard(task.sample,max,undefined,task.show));
  if(task.operation)root.append(note(task.operation.kind==='aliquot'?`Ota tasakoosteisesta liuoksesta ${task.operation.amount} g tarkasteltavaksi. Jäljelle jäävä lähdenäyte säilytetään.`:
   `Lisää ${task.operation.amount} g liuotinta. Aineosaa ei lisätä eikä poistu.`));
 }else if(task.mode==='compare'){
  root.append(note('Yhteinen massamittakaava · tumma aineosa sisältyy koko liuokseen · molemmissa sama m/m-perusta.'));
  const row=el('div');row.style.cssText=grid;const max=Math.max(...task.samples.map(s=>s.solute+s.solvent));
  for(const sample of task.samples)row.append(massCard(sample,max));root.append(row);
 }else if(task.mode==='ph'){
  root.append(phReference());
  const row=el('div');row.style.cssText=grid;
  for(const sample of task.samples){const card=el('div');card.dataset.solutionPhSample=sample.id;card.style.cssText='padding:4px 6px;background:#edf2e4;border-radius:6px';card.append(note(sample.label),note(sample.ph10!==undefined?`Mitattu pH ${sample.ph10/10}`:`Pyydetty luokka ${names[sample.requested!]}`));row.append(card);}root.append(row);
  if(task.skill==='scale'&&task.activity==='log')root.append(note(`Vertaa paria ${task.pair.join(' ja ')}. Yhden pH-yksikön pienennys vastaa kymmenkertaista oksoniumionien aktiivisuutta. Kahden yksikön ero vastaa 10 × 10 = satakertaista aktiivisuutta. Yhtä suuret pH:t antavat suhteen 1.`));
 }else root.append(reference(task));
 host.replaceChildren(root);
};
/** Worked examples are demonstration-only and never produce an assessment response. */
export const solutionLabWorkedPaint=(task:SolutionLabTask):Paint=>(host,context)=>{
 solutionLabPaint(task)(host,context);
 const answer=solutionSolutionLab(task),worked=el('div');worked.style.cssText=stack;worked.dataset.solutionWorked='';
 if(task.mode==='concentration'&&answer.mode==='concentration'){
  if(task.operation){const state=solutionMassState(task.sample,{kind:task.operation.kind,amount:String(task.operation.amount)})!;
   worked.append(massCard(task.sample,task.sample.solute+task.sample.solvent+(task.operation.kind==='dilute'?task.operation.amount:0),state));}
  worked.append(note(`Mallin suhde on (${answer.numerator} g) / (${answer.denominator} g).${task.skill==='calculate'?` Kun tämä suhde kerrotaan sadalla, massaprosentti on ${answer.percent} %.`:''}`));
 }else if(task.mode==='compare'&&answer.mode==='compare'){
  const [a,b]=answer.rows;worked.append(note(`Ensimmäisen suhde ${a!.numerator}/${a!.denominator}, toisen ${b!.numerator}/${b!.denominator}. Vertailutuotteet ${answer.cross.join(' ja ')}.`),note(answer.relation==='same'?'Suhteet ovat yhtä suuret.':`Suurempi pitoisuus on ${task.samples[answer.relation==='left'?0:1].label}.`));
 }else if(answer.mode==='ph'){
  worked.append(note(answer.rows.map(row=>`Kortti ${row.id}, pH ${row.ph}, ${names[row.classification as Acidity].toLowerCase()}`).join(' · ')));
  if(task.mode==='ph'&&task.skill==='scale')worked.append(note(`Järjestys ${answer.order.join(' → ')}.${task.activity==='log'?` Nimetyn parin aktiivisuuksien suhde on ${answer.factor}.`:''}`));
 }else if(answer.mode==='indicator'){
  worked.append(note(answer.consistent?`Yhteinen alue on ${answer.includeLower?'[':'('}${answer.lower}, ${answer.upper}${answer.includeUpper?']':')'}. Mahdolliset luokat ${answer.classes.map(c=>names[c as Acidity].toLowerCase()).join(', ')}.`:'Havaintojen sallimilla alueilla ei ole yhteistä pH-arvoa. Tämän mallin havainnot ovat ristiriidassa.'));
  if(task.mode==='indicator'&&task.review)worked.append(note('Aikuinen kuuntelee oppijan oman tarkkuusperustelun erikseen.'));
 }
 host.append(worked);
};
export function mountSolutionLab(task:SolutionLabTask,host:HTMLElement,submit:(response:SolutionLabResponse)=>void):{reveal():void}{
 const root=el('div');root.dataset.solutionLab='';root.style.cssText=stack;const controls=el('div');controls.style.cssText=grid;
 const status=note('');status.setAttribute('role','status');let read:()=>SolutionLabResponse,finished=false;
 const done=button('Tarkista tutkimusikkuna',()=>{
  if(finished)return;const response=read();
  if(task.mode==='indicator'&&task.review){
   done.hidden=true;done.style.display='none';controls.hidden=true;controls.style.display='none';adultHost.hidden=false;
   mountObservedExplanation(solutionExplanation(task),adultHost,observation=>{
    if(finished||response.mode!=='indicator')return;finished=true;
    submit({...response,review:{observations:observation.observations,confirmedByAdult:observation.confirmedByAdult,assistance:observation.assistance}});
   });
   const panel=adultHost.querySelector<HTMLElement>('[data-explanation-adult] > div');
   if(panel){
    panel.style.gridTemplateColumns='repeat(2,minmax(0,1fr))';panel.style.gap='4px';panel.style.padding='5px 7px';
    for(const child of Array.from(panel.children))if(child instanceof HTMLElement)child.style.gridColumn='1 / -1';
    for(const label of panel.querySelectorAll<HTMLLabelElement>(':scope > label'))
     if(label.querySelector('[aria-label="Saiko oppija apua?"],input[type=checkbox]'))label.style.gridColumn='auto';
    const heading=panel.querySelector<HTMLElement>('h3');
    if(heading){heading.style.gridColumn='auto';if(heading.nextElementSibling instanceof HTMLElement)heading.nextElementSibling.style.gridColumn='auto';}
   }
   for(const control of adultHost.querySelectorAll<HTMLElement>('select,button,summary,input:not([type=checkbox])'))control.style.minHeight='44px';
   const back=adultHost.querySelector<HTMLElement>('button.small');if(back)back.style.flex='0 0 160px';
   for(const label of adultHost.querySelectorAll<HTMLLabelElement>('label'))if(label.querySelector('input[type="checkbox"]'))label.style.minHeight='44px';
   return;
  }
  finished=true;submit(response);
 });
 const adultHost=el('div');adultHost.hidden=true;
 if(task.mode==='concentration'){
  const numerator=number('Aineosan massa','Aineosa g'),denominator=number('Koko liuoksen massa','Koko liuos g'),percent=number('Massaprosentti','Massaprosentti %');
  const basis=menu('Pitoisuuden perusta',[['mass-mass','Massa / massa'],['mass-solvent','Massa / liuottimen massa'],['volume-volume','Tilavuus / tilavuus']],'Vertailuperusta');
  controls.append(numerator.node,denominator.node,basis.node);if(task.skill==='calculate')controls.append(percent.node);
  let locked=false,applied=false;
  const operation=task.operation;
  if(operation){
   const observation=el('div');observation.style.cssText=stack;
   const act=button(operation.kind==='aliquot'?'Ota virtuaalinen osa':'Lisää virtuaalinen liuotin',()=>{
    if(!locked||applied)return;applied=true;act.disabled=true;
    const state=solutionMassState(task.sample,{kind:operation.kind,amount:String(operation.amount)})!;
    observation.replaceChildren(massCard(task.sample,task.sample.solute+task.sample.solvent+(operation.kind==='dilute'?operation.amount:0),state));
    if(operation.kind==='aliquot')observation.append(note(`Säilytetty lähde · aineosa ${solutionFormat(state.source.solute)} g, liuos yhteensä ${solutionFormat(state.source.total)} g.`));
    else observation.append(note(`Lisätty liuotin ${solutionFormat(state.addedSolvent)} g. Alkuperäinen aineosan massa säilyi.`));
    status.textContent='Muutos tehty. Vertaa lukittua ennustetta havaintoon.';done.disabled=false;
   });act.disabled=true;
   const lock=button('Lukitse massaennuste',()=>{
    if(locked)return;if(!numerator.get()||!denominator.get()||!basis.get()||task.skill==='calculate'&&!percent.get()){status.textContent='Tuota ensin oma massaennuste ja vertailuperusta.';return;}
    locked=true;for(const input of controls.querySelectorAll<HTMLInputElement|HTMLSelectElement>('input,select'))input.disabled=true;
    lock.disabled=true;act.disabled=false;status.textContent='Ennuste lukittu. Tee annettu virtuaalinen muutos.';
   });root.append(lock,act,observation);done.disabled=true;
  }
  read=()=>({kind,mode:'concentration',numerator:numerator.get(),denominator:denominator.get(),basis:basis.get(),percent:percent.get(),
   ...(operation?{operation:{kind:operation.kind,amount:String(operation.amount),locked,applied}}:{})});
 }else if(task.mode==='compare'){
  const rows=task.samples.map(sample=>({id:sample.id,numerator:number(`${sample.label}, aineosan massa`,'Aineosa g'),denominator:number(`${sample.label}, koko massa`,'Koko liuos g')}));
  for(const row of rows){const group=el('div');group.style.cssText=stack;group.append(note(task.samples.find(s=>s.id===row.id)!.label),row.numerator.node,row.denominator.node);controls.append(group);}
  const crossA=number('Aineosa A kertaa koko B','A × koko B'),crossB=number('Aineosa B kertaa koko A','B × koko A');
  const compare=menu('Väkevämpi näyte',[[task.samples[0].id,task.samples[0].label],[task.samples[1].id,task.samples[1].label],['same','Samat pitoisuudet']]);
  // A and B in the cross-products mean display positions, regardless of source IDs.
  crossA.input.setAttribute('aria-label','Ensimmäisen aineosa kertaa toisen kokonaismassa');crossB.input.setAttribute('aria-label','Toisen aineosa kertaa ensimmäisen kokonaismassa');
  crossA.node.firstChild!.textContent=`${task.samples[0].label} × koko ${task.samples[1].label}`;crossB.node.firstChild!.textContent=`${task.samples[1].label} × koko ${task.samples[0].label}`;
  controls.append(crossA.node,crossB.node,compare.node);
  read=()=>({kind,mode:'compare',rows:rows.map(r=>({id:r.id,numerator:r.numerator.get(),denominator:r.denominator.get()})),cross:[crossA.get(),crossB.get()],
   relation:compare.get()==='same'?'same':compare.get()===task.samples[0].id?'left':compare.get()===task.samples[1].id?'right':null});
 }else if(task.mode==='ph'){
  const rows=task.samples.map(sample=>({sample,ph:number(`${sample.label}, oma pH`,'Oma pH'),classification:menu(`${sample.label}, happamuusluokka`,Object.entries(names),'Luokka')}));
  for(const row of rows){const group=el('div');group.style.cssText=stack;group.append(note(row.sample.label),row.ph.node,row.classification.node);controls.append(group);}
  const order=task.skill==='scale'?task.samples.map((_,i)=>menu(`Järjestyksen paikka ${i+1}`,task.samples.map(s=>[s.id,s.label] as const),`Paikka ${i+1}`)):[];
  for(const field of order)controls.append(field.node);
  const more=menu('Vertailuparin happamampi',task.skill==='scale'?[...task.pair.map(id=>[id,task.samples.find(s=>s.id===id)!.label] as const),['same','Sama aktiivisuus']]:[]),factor=number('Aktiivisuuksien suhde','Kuinka moninkertainen?');
  if(task.skill==='scale'&&task.activity==='log')controls.append(more.node,factor.node);
  read=()=>({kind,mode:'ph',rows:rows.map(row=>({id:row.sample.id,ph:row.ph.get(),classification:row.classification.get()})),order:order.map(field=>field.get()),moreAcidic:more.get(),factor:factor.get()});
 }else{
  const consistent=menu('Havaintojen yhteensopivuus',[['yes','Yhteinen pH-alue löytyy'],['no','Havainnot ovat ristiriidassa']],'Yhteensopivuus'),lower=number('Sallitun alueen alaraja','Alaraja pH'),upper=number('Sallitun alueen yläraja','Yläraja pH');
  const includeLower=check('Alaraja kuuluu mukaan'),includeUpper=check('Yläraja kuuluu mukaan');
  const classes=(Object.entries(names) as [Acidity,string][]).map(([id,name])=>({id,...check(`Mahdollinen luokka ${name.toLowerCase()}`)}));
  controls.append(consistent.node,lower.node,upper.node,includeLower.node,includeUpper.node,...classes.map(c=>c.node));
  const update=()=>{const contradictory=consistent.get()==='no';lower.input.disabled=upper.input.disabled=includeLower.input.disabled=includeUpper.input.disabled=contradictory;for(const c of classes)c.input.disabled=contradictory;};consistent.input.onchange=update;
  read=()=>({kind,mode:'indicator',consistent:consistent.get()===''?null:consistent.get()==='yes',lower:lower.get(),upper:upper.get(),includeLower:includeLower.input.checked,includeUpper:includeUpper.input.checked,
   classes:consistent.get()==='no'?[]:classes.filter(c=>c.input.checked).map(c=>c.id)});
 }
 root.prepend(controls);root.append(status,done,adultHost);host.append(root);
 let shownModel:Element|undefined;
 return {reveal(){
  if(!shownModel){const staging=el('div');solutionLabWorkedPaint(task)(staging);shownModel=staging.lastElementChild!;root.append(shownModel);}
  status.textContent='Malliratkaisu on avattu. Vertaa sen rakennetta omiin merkintöihisi.';
 }};
}
