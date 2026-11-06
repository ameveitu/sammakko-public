import type { Paint } from '../../engine/types';
import { MAX_CHEMICAL_ATOMS, chemicalElements, chemicalInventory, parseChemicalFormula, solutionChemicalNotation,
  type AtomInventory, type ChemicalElement, type ChemicalNotationResponse, type ChemicalNotationTask, type ChemicalSample } from '../models/chemical-notation';

type Mode=ChemicalNotationTask['mode'];
type Task<M extends Mode>=Extract<ChemicalNotationTask,{mode:M}>;
type Answer<M extends Mode>=Extract<ChemicalNotationResponse,{mode:M}>;
type Work<M extends Mode>={node:HTMLElement;read():Answer<M>;show(answer:Answer<M>):void};
const kind='chemical-notation' as const;
const stack='display:grid;gap:4px';
const grid='display:grid;grid-template-columns:repeat(auto-fit,minmax(min(112px,100%),1fr));gap:4px';
const row='display:flex;gap:4px 7px;align-items:center;flex-wrap:wrap';
function make<T extends keyof HTMLElementTagNameMap>(tag:T,text?:string){const element=document.createElement(tag);if(text!==undefined)element.textContent=text;return element;}
function note(text:string){const p=make('p',text);p.style.cssText='margin:0;font-size:14px;line-height:1.22';return p;}
function field<T extends HTMLInputElement|HTMLSelectElement>(name:string,caption:string,control:T){
  const label=make('label',caption);label.style.cssText='display:grid;gap:1px;font-size:13px;min-width:0';
  control.setAttribute('aria-label',name);control.style.cssText='width:100%;min-width:44px;min-height:44px;box-sizing:border-box;font:inherit;padding:3px 5px;color:#214d43;background:#fffdf3;border:1px solid #789b88;border-radius:6px';
  label.append(control);return label;
}
function integer(name:string,caption=name,max=1000){
  const input=make('input');input.type='number';input.min='0';input.max=String(max);input.step='1';input.autocomplete='off';
  return {node:field(name,caption,input),input,get:()=>{
    const n=input.value===''?-1:Number(input.value);return Number.isSafeInteger(n)&&n>=0&&n<=max?n:-1;
  },set:(n:number)=>{input.value=String(n);}};
}
function select(name:string,options:readonly (readonly [string,string])[],caption=name){
  const input=make('select');input.add(new Option('Valitse',''));
  for(const [value,label] of options)input.add(new Option(label,value));
  return {node:field(name,caption,input),input,get:()=>input.value,set:(value:string)=>{input.value=value;}};
}
function button(caption:string,act:()=>void){const b=make('button',caption);b.type='button';b.className='btn';b.style.minHeight='44px';b.onclick=act;return b;}
function formulaText(raw:string,target?:number){
  const span=make('span');span.style.cssText='font-size:23px;font-weight:750;white-space:nowrap;font-family:system-ui,sans-serif';
  span.dataset.chemicalFormula=raw;
  const token=target===undefined?undefined:parseChemicalFormula(raw)!.tokens[target];
  const active=token?make('u'):undefined;
  for(let i=0;i<raw.length;){
    const end=/[0-9]/.test(raw[i]!)?raw.slice(i).match(/^\d+/)![0].length:1;
    const part=make(/[0-9]/.test(raw[i]!)?'sub':'span',raw.slice(i,i+end));
    if(part.tagName==='SUB')part.style.fontSize='65%';
    if(active&&i>=token!.start&&i<token!.end){if(!active.parentNode)span.append(active);active.append(part);}else span.append(part);
    i+=end;
  }
  return span;
}
function reference(elements:readonly ChemicalElement[]){
  const ref=note(elements.map(element=>`${element} ${chemicalElements[element]}`).join(' · '));
  ref.dataset.chemicalReference='';return ref;
}
function model(atoms:AtomInventory,title:string,monochrome=false){
  const panel=make('div');panel.dataset.chemicalModel='';
  panel.style.cssText='padding:4px 6px;background:#edf1e4;border:1px solid #bed0b7;border-radius:7px';
  panel.append(note(title));
  const rows=make('div');rows.style.cssText='display:flex;gap:3px 8px;flex-wrap:wrap';
  for(const [symbol,count] of Object.entries(atoms)){
    if(count<=0)continue;
    const line=make('span');line.style.cssText='display:inline-flex;gap:2px;align-items:center;flex-wrap:wrap';
    line.setAttribute('aria-label',`${symbol}, ${count} atomia`);
    // Symbols carry identity. These tiles represent counts, without structural bonds or molecular geometry.
    line.append(make('strong',`${symbol} × ${count}`));
    const dots=make('span');dots.setAttribute('aria-hidden','true');dots.style.cssText='display:inline-flex;gap:2px;max-width:180px;flex-wrap:wrap';
    for(let i=0;i<Math.min(count,24);i++){
      const tile=make('span',symbol);tile.style.cssText=`display:inline-grid;place-items:center;min-width:18px;height:18px;font-size:10px;font-weight:700;color:#274d43;border:1px solid #688f7d;border-radius:50%;background:${monochrome?'#f6f4ea':'#dce9ce'}`;dots.append(tile);
    }
    if(count>24)dots.append(make('span','…'));
    line.append(dots);rows.append(line);
  }
  panel.append(rows);return panel;
}
function atomFields(elements:readonly ChemicalElement[],prefix:string,onChange?:()=>void){
  const node=make('div');node.style.cssText=grid;
  const fields=elements.map(element=>({element,...integer(`${prefix}, ${element}`,element,MAX_CHEMICAL_ATOMS)}));
  for(const f of fields){node.append(f.node);if(onChange)f.input.addEventListener('input',onChange);}
  return {node,fields,read:():AtomInventory=>Object.fromEntries(fields.map(f=>[f.element,f.get()])),show(atoms:AtomInventory){for(const f of fields)f.set(atoms[f.element]??0);}};
}
function speciesFields(elements:readonly ChemicalElement[]){
  const node=make('div');node.style.cssText='display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2px';
  const fields=elements.map(element=>{
    const label=make('label');label.style.cssText='display:flex;align-items:center;gap:5px;min-height:44px;font-size:14px';
    const input=make('input');input.type='checkbox';input.setAttribute('aria-label',`Atomilaji ${element}`);input.style.cssText='width:22px;height:22px';
    label.append(input,`${element} ${chemicalElements[element]}`);node.append(label);return {element,input};
  });
  return {node,fields,read:()=>fields.filter(f=>f.input.checked).map(f=>f.element),show(species:readonly string[]){for(const f of fields)f.input.checked=species.includes(f.element);}};
}
function formulaWork(task:Task<'formula'>):Work<'formula'>{
  const node=make('div');node.style.cssText=stack;
  const species=speciesFields(task.palette),picture=make('div');
  let modelFields:ReturnType<typeof atomFields>;
  const draw=()=>picture.replaceChildren(model(modelFields.read(),'Oma yhden kaavan koostumusmalli',task.monochrome));
  const ratio=atomFields(task.palette,'Lukusuhde');modelFields=atomFields(task.palette,'Koostumus',draw);
  if(task.draft){
    species.show(Object.keys(task.draft));ratio.show(task.draft);modelFields.show(task.draft);
    node.append(note('Korjaa luonnoksesta täytetyt merkinnät vastaamaan kaavaa.'));
  }
  if(task.objective==='both'){
    const table=make('table');table.style.cssText='width:100%;border-collapse:collapse';
    const head=make('thead'),heading=make('tr');
    for(const text of ['Atomilaji','Lukusuhde','Yhden kaavan malli'])heading.append(make('th',text));
    head.append(heading);table.append(head);
    const body=make('tbody');
    task.palette.forEach((element,i)=>{
      const line=make('tr'),identity=make('td'),quantity=make('td'),composition=make('td');
      const label=make('label');label.style.cssText='display:flex;gap:4px;align-items:center;min-height:44px';
      label.append(species.fields[i]!.input,element);identity.append(label);
      quantity.append(ratio.fields[i]!.input);composition.append(modelFields.fields[i]!.input);
      line.append(identity,quantity,composition);body.append(line);
    });
    table.append(body);node.append(note('Valitse lajit ja tuota molemmat määrät. Muut atomilajit 0.'),table,picture);
  }else if(task.objective==='species')node.append(species.node);
  else node.append(note('Oma lukusuhde. Sama kokonaislukukerrannainen kelpaa. Muut atomilajit 0.'),ratio.node);
  return {node,read:()=>({kind,mode:'formula',species:species.read(),atoms:ratio.read(),model:modelFields.read()}),show(a){species.show(a.species);ratio.show(a.atoms);modelFields.show(a.model);if(task.objective==='both')draw();}};
}
function subscriptWork(task:Task<'subscript'>):Work<'subscript'>{
  const element=select('Alaindeksin alkuaine',task.palette.map(symbol=>[symbol,`${symbol} ${chemicalElements[symbol]}`]),'Mihin merkkiin?');
  const count=integer('Paikallinen atomimäärä','Määrä tässä kohdassa',24);
  const implicit=select('Onko ykkönen jätetty kirjoittamatta',[['yes','Kyllä'],['no','Ei']],'Kirjoittamaton ykkönen?');
  const atoms=atomFields(task.palette,'Koko kaava'),node=make('div');node.style.cssText=stack;
  const top=make('div');top.style.cssText=grid;top.append(element.node,count.node,implicit.node);
  node.append(top,note('Koko kaavan atomimäärät, muut lajit 0.'),atoms.node);
  return {node,read:()=>({kind,mode:'subscript',element:element.get(),count:count.get(),implicit:implicit.get()==='yes'?true:implicit.get()==='no'?false:null,atoms:atoms.read()}),
    show(a){element.set(a.element);count.set(a.count);implicit.set(a.implicit?'yes':'no');atoms.show(a.atoms);}};
}
function wholeGroup(sample:ChemicalSample,groups:number,title:string){
  const panel=make('div');panel.style.cssText='display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:3px';panel.setAttribute('aria-label',title);
  for(let i=0;i<Math.min(groups,8);i++)panel.append(model(chemicalInventory(sample.formula)!,`${title} ${i+1}`));
  if(groups>8)panel.append(note(`Yhteensä ${groups} samanlaista ryhmää. Kuvassa ensimmäiset kahdeksan.`));
  return panel;
}
function groupsWork(task:Task<'groups'>):Work<'groups'>{
  const node=make('div');node.style.cssText=stack;
  const count=integer('Kokonaisten kaavaryhmien määrä','Oma kerroin',1000),picture=make('div');
  const draw=()=>picture.replaceChildren(wholeGroup(task.sample,Math.max(0,count.get()),'Oma ryhmä'));
  count.input.addEventListener('input',draw);
  const minus=button('Poista ryhmä',()=>{count.set(Math.max(0,count.get()-1));draw();});
  const plus=button('Lisää ryhmä',()=>{count.set(Math.min(1000,Math.max(0,count.get())+1));draw();});
  const controls=make('div');controls.style.cssText=row;controls.append(count.node,minus,plus);
  const atoms=atomFields(task.palette,'Atomit yhteensä');
  node.append(controls,picture,note('Kirjaa kaikkien ryhmien atomimäärät. Muut lajit 0.'),atoms.node);
  return {node,read:()=>({kind,mode:'groups',groups:count.get(),atoms:atoms.read()}),show(a){count.set(a.groups);atoms.show(a.atoms);draw();}};
}
function symbolsWork(task:Task<'symbols'>):Work<'symbols'>{
  const node=make('div');node.style.cssText=stack;
  const elements=Object.entries(chemicalElements).map(([symbol,name])=>[symbol,name] as const);
  const rows=task.samples.map(sample=>{
    const element=select(`Näytteen ${sample.id} alkuaine`,elements,'Alkuaine');
    const symbol=select(`Näytteen ${sample.id} tarkka merkki`,Object.keys(chemicalElements).map(s=>[s,s]),'Tarkka merkki');
    const row=make('div');row.style.cssText='display:grid;grid-template-columns:minmax(85px,.7fr) minmax(0,1fr) minmax(0,.7fr);gap:4px;align-items:center';
    row.append(note(`Näyte ${sample.id} · ${sample.shown}${sample.name?` (${sample.name})`:''}`),element.node,symbol.node);node.append(row);
    return {sample,element,symbol};
  });
  node.append(reference(Object.keys(chemicalElements) as ChemicalElement[]));
  return {node,read:()=>({kind,mode:'symbols',rows:rows.map(({sample,element,symbol})=>({id:sample.id,element:element.get(),symbol:symbol.get()}))}),show(a){for(const row of rows){const value=a.rows.find(value=>value.id===row.sample.id);if(value){row.element.set(value.element);row.symbol.set(value.symbol);}}}};
}
function rolesWork(task:Task<'roles'>):Work<'roles'>{
  const node=make('div');node.style.cssText=grid;
  const rows=[...task.reaction.left,...task.reaction.right].map((sample,i)=>{
    const role=select(`Aineen ${i+1} rooli`,[['reactant','Lähtöaine'],['product','Tuote']],sample.formula);
    if(task.draft?.[i])role.set(task.draft[i]!);
    node.append(role.node);return role;
  });
  const arrow=select('Reaktionuolen merkitys',[['change','Lähtöaineista muodostuu tuotteita'],['equals','Samat aineet molemmin puolin'],['mixture','Kaikki ovat samaa seosta']],'Nuoli');arrow.node.style.gridColumn='1 / -1';node.append(arrow.node);
  return {node,read:()=>({kind,mode:'roles',roles:rows.map(f=>f.get()),arrow:arrow.get() as Answer<'roles'>['arrow']}),show(a){rows.forEach((row,i)=>row.set(a.roles[i]!));arrow.set(a.arrow??'');}};
}
function balanceWork(task:Task<'balance'>):Work<'balance'>{
  const node=make('div');node.style.cssText=stack;
  const row=make('div');row.style.cssText=grid;
  const samples=[...task.reaction.left,...task.reaction.right],picture=make('div');
  const coefficients=samples.map((sample,i)=>integer(`Kaavan ${i+1} kerroin`,`${sample.formula} kerroin`,1000));
  const draw=()=>{
    const parts=samples.map((sample,i)=>{
      const item=make('span');item.style.cssText='display:inline-flex;gap:2px;align-items:baseline';
      item.append(make('strong',String(Math.max(0,coefficients[i]!.get()))),formulaText(sample.formula));return item;
    });
    picture.replaceChildren();picture.style.cssText='display:flex;align-items:center;gap:5px;flex-wrap:wrap';
    parts.forEach((part,i)=>{if(i)picture.append(make('strong',i===task.reaction.left.length?'→':'+'));picture.append(part);});
  };
  coefficients.forEach((entry,i)=>{entry.set(task.draft[i]??1);entry.input.addEventListener('input',draw);row.append(entry.node);});
  const elements=[...new Set(samples.flatMap(sample=>Object.keys(chemicalInventory(sample.formula)!)))] as ChemicalElement[];
  const left=atomFields(elements,'Vasen atomimäärä'),right=atomFields(elements,'Oikea atomimäärä');
  const ledger=make('div');ledger.style.cssText='display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px';
  const side=(caption:string,fields:ReturnType<typeof atomFields>)=>{const box=make('div');box.append(note(caption),fields.node);return box;};
  ledger.append(side('Vasemman rannan atomit',left),side('Oikean rannan atomit',right));
  node.append(picture,row,note(task.primitive?'Tässä pyydetään pienintä kokonaislukusuhdetta.':'Kertoimet 1–1000. Jokainen tämän alueen tasapainoinen kokonaiskerrannainen kelpaa.'),ledger);draw();
  return {node,read:()=>({kind,mode:'balance',coefficients:coefficients.map(f=>f.get()),left:left.read(),right:right.read()}),show(a){coefficients.forEach((f,i)=>f.set(a.coefficients[i]!));left.show(a.left);right.show(a.right);draw();}};
}
export function chemicalNotationPaint(task:ChemicalNotationTask,answer?:ChemicalNotationResponse):Paint{
  return host=>{
    const given=make('div');given.dataset.chemicalGivens='';given.style.cssText=stack;
    if(task.mode==='formula'||task.mode==='subscript'||task.mode==='groups'){
      const heading=make('div');heading.style.cssText=row;
      if(task.mode==='groups'&&task.source==='notation')heading.append(make('strong',String(task.coefficient)));
      heading.append(formulaText(task.sample.formula,task.mode==='subscript'?task.target:undefined),note(task.sample.name));
      given.append(heading,note(task.sample.form==='lattice'?'Hilayhdiste. Kaavayksikkö kuvaa pienintä ionien lukusuhdetta.':'Molekyylikaava. Alaindeksit kertovat atomien määrät yhdessä molekyylissä.'),reference(task.palette));
      if(task.sample.formula.includes('('))given.append(note('Sulun jälkeinen numero kertoo koko sulun sisällön määrän.'));
      if(task.mode==='groups'&&task.source==='groups')given.append(wholeGroup(task.sample,task.coefficient,'Annettu ryhmä'));
    }else if(task.mode==='roles'||task.mode==='balance'){
      const equation=make('div');equation.style.cssText=row;
      [...task.reaction.left,...task.reaction.right].forEach((sample,i)=>{
        if(i)equation.append(make('strong',i===task.reaction.left.length?'→':'+'));
        const group=make('span');group.style.cssText='display:inline-flex;gap:3px;align-items:baseline';
        if(task.mode==='roles')group.append(make('strong',String(task.coefficients[i])));
        group.append(formulaText(sample.formula));equation.append(group);
      });
      given.append(equation,note(task.reaction.condition),note('Kaavakortit ovat aineiden esityksiä. Tämä on merkintäpaja.'));
      if(task.mode==='roles'&&task.draft)given.append(note('Luonnoksen roolilaput ovat vaihtuneet. Tee jokaiselle aineelle oma korjattu lappu.'));
    }else given.append(note('Vertaa näytteen merkkiä alkuaineiden taulukkoon. Kirjainkoko säilyy.'));
    host.replaceChildren(given);
    if(answer){const sample=make('div');host.append(sample);mountChemicalNotation(task,sample,()=>{}).show(answer);}
  };
}
export function mountChemicalNotation(task:ChemicalNotationTask,host:HTMLElement,submit:(answer:ChemicalNotationResponse)=>void){
  function mount<M extends Mode>(work:Work<M>){
    const form=make('form');form.dataset.chemicalNotation=task.mode;form.style.cssText=stack;
    const done=make('button','Valmis');done.type='submit';done.className='btn primary wide';done.style.minHeight='44px';
    form.append(work.node,done);host.append(form);let frozen=false;
    const freeze=()=>{frozen=true;for(const control of form.querySelectorAll('input,select,button'))control.setAttribute('disabled','');};
    form.addEventListener('submit',event=>{event.preventDefault();if(frozen)return;const answer=work.read();freeze();submit(answer);});
    return {reveal(){work.show(solutionChemicalNotation(task) as Answer<M>);freeze();},show(answer:ChemicalNotationResponse){work.show(answer as Answer<M>);freeze();done.remove();}};
  }
  switch(task.mode){
    case 'symbols':return mount(symbolsWork(task));
    case 'formula':return mount(formulaWork(task));
    case 'subscript':return mount(subscriptWork(task));
    case 'groups':return mount(groupsWork(task));
    case 'roles':return mount(rolesWork(task));
    case 'balance':return mount(balanceWork(task));
  }
}
