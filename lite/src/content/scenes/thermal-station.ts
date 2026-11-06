import type { Paint } from '../../engine/types';
import { thermalOutcome, type ThermalInput, type ThermalStationResponse, type ThermalStationTask } from '../models/thermal-station';
export interface ThermalScene {kind:'thermal-station';title:string;mode:ThermalInput['kind'];given:Record<string,unknown>;observed:boolean;outcome?:Record<string,unknown>}
/** Only initial givens enter model/debug; hidden probe readings and calculated results appear after observation. */
export function thermalScene(task:ThermalStationTask,response?:ThermalStationResponse):ThermalScene {
 const m=task.input,observed=!!response?.locked&&!!response.observed;
 let given:Record<string,unknown>;
 switch(m.kind){
  case 'probe':given={context:m.context,target:m.target};break;
  case 'energy':given={context:m.context,sourceC:m.sourceC,targetC:m.targetC};break;
  case 'amount':given={massA:m.massA,massB:m.massB,temperatureC:m.temperatureC,riseC:m.riseC,specificHeat:m.specificHeat};break;
  case 'flow':given={aC:m.aC,bC:m.bC,capacityA:m.capacityA,capacityB:m.capacityB,conductance:m.conductance,seconds:m.seconds,context:m.context};break;
  case 'conduction':given={aConductance:m.aConductance,bConductance:m.bConductance,hotC:m.hotC,coldC:m.coldC,capacity:m.capacity,seconds:m.seconds,context:m.context};break;
  case 'convection':given={medium:m.medium,context:m.context,question:m.question,warmC:m.warmC,coolC:m.coolC};break;
  case 'radiation':given={medium:m.medium,context:m.context,question:m.question,seconds:m.seconds};break;
  case 'integration':given={context:m.context,warmC:m.warmC,coolC:m.coolC};break;
 }
 return {kind:'thermal-station',title:'Lämpövuoren tutkimusasema',mode:m.kind,given,observed,...(observed?{outcome:thermalOutcome(m)}:{})};
}
function givens(m:ThermalInput):string {
 switch(m.kind){
  case 'probe':return `Virtuaalimittari: kohde ${m.target.toUpperCase()}, ${m.context==='air'?'ilma':'vesikupit'}. Asteikko °C. Mittaa myös vertailukohde.`;
  case 'energy':return `Lähde ${m.sourceC} °C, kohde ${m.targetC} °C. `+(m.context==='sun-stone'?'Auringon lämmittämä pinta lämmittää viereistä kiveä mallissa.':m.context==='cooling-cup'?'Lämmin kuppi jäähtyy viileämmässä ympäristössä.':'Lämpimämpi vesi lämmittää viileämpää kohdetta.');
  case 'amount':return `Sama aine ja olomuoto: A ${m.massA} g, B ${m.massB} g, molemmat aluksi ${m.temperatureC} °C. Kummankin lämpötila nousee ${m.riseC} °C. Mallissa ominaislämpökapasiteetti ${m.specificHeat} J/(g·°C).`;
  case 'flow':return `A ${m.aC} °C, B ${m.bC} °C; lämpökapasiteetit ${m.capacityA} ja ${m.capacityB} J/°C. Eristetty malli, vakio johtavuus ${m.conductance} W/°C, aika ${m.seconds} s.`;
  case 'conduction':return `Molemmissa silloissa samat alkulämpötilat ${m.hotC} °C ja ${m.coldC} °C, samat kapasiteetit ${m.capacity} J/°C ja aika ${m.seconds} s. Vain materiaalin mallijohtavuus vaihtuu: A ${m.aConductance}, B ${m.bConductance} W/°C.`;
  case 'convection':return `${m.medium==='air'?'Ilma':'Vesi'} kiertää suljetussa virtuaalimallissa. Lämpimän puolen lämpötila on ${m.warmC} °C ja viileän ${m.coolC} °C; veden mallissa molemmat ovat yli 4 °C. Merkkihiukkaset kuvaavat aineen liikettä, eivät lämpöä aineena.`;
  case 'radiation':return `Verrataan avointa näkymää ja ideaalista läpinäkymätöntä varjostinta. Lähde, etäisyys ja ${m.seconds} s aika pysyvät samoina; välissä ${m.medium==='vacuum'?'tyhjiö':'ilmaa'}.`;
  case 'integration':return `Lämmin kohta ${m.warmC} °C, viileä ${m.coolC} °C. `+(m.context==='cabin'?'Mökkimallissa energia siirtyy kiinteän seinän läpi, liikkuvan ilman mukana ja lähteestä ilman kosketusta.':m.context==='greenhouse'?'Kasvihuonemallissa energiaa siirtyy seinässä, liikkuvan veden mukana ja lähteestä ilman kosketusta.':'Telttamallissa energiaa siirtyy kiinteässä rakenteessa, liikkuvan ilman mukana ja lähteestä ilman kosketusta.');
 }
}
export const thermalPaint=(input:ThermalInput):Paint=>host=>{
 const p=document.createElement('p');p.textContent=givens(input);host.replaceChildren(p);
 if(!['probe','amount','flow'].includes(input.kind))return;
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 340 105');svg.setAttribute('role','img');svg.setAttribute('aria-label',input.kind==='probe'?'Kaksi mittauskohdetta A ja B; lukemat mitataan ennusteen jälkeen.':input.kind==='amount'?'Kaksi saman aineen erää; määrät ja yhteinen lämpötilan nousu on ilmoitettu tekstissä.':'Kaksi eristetyn lämpömallin kohdetta; alkulämpötilat on ilmoitettu tekstissä.');svg.style.cssText='display:block;width:100%;max-height:90px';
 for(const [i,x] of [60,220].entries()){const rect=document.createElementNS(ns,'rect');rect.setAttribute('x',String(x));const height=input.kind==='amount'?Math.max(10,56*(i?input.massB:input.massA)/Math.max(input.massA,input.massB)):56;rect.setAttribute('y',String(78-height));rect.setAttribute('width','60');rect.setAttribute('height',String(height));rect.setAttribute('rx','8');rect.setAttribute('fill',i?'#b7dfe3':'#e9c3a3');rect.setAttribute('stroke','#315b64');rect.setAttribute('stroke-width','3');svg.append(rect);const label=document.createElementNS(ns,'text');label.setAttribute('x',String(x+30));label.setAttribute('y','98');label.setAttribute('text-anchor','middle');label.setAttribute('font-size','16');label.textContent=i?'B':'A';svg.append(label);}
 if(input.kind==='flow'){const line=document.createElementNS(ns,'line');line.setAttribute('x1','120');line.setAttribute('y1','50');line.setAttribute('x2','220');line.setAttribute('y2','50');line.setAttribute('stroke','#806349');line.setAttribute('stroke-width','8');svg.append(line);}
 host.append(svg);
};
const round=(n:unknown)=>typeof n==='number'?String(Math.round(n*10)/10).replace('.',','):'';
function outcomeText(m:ThermalInput):string {
 const o=thermalOutcome(m);
 switch(m.kind){
  case 'probe':return `A ${m.aC} °C; B ${m.bC} °C. Lue mittarista pyydetty kohde.`;
  case 'energy':return m.direction==='in'?'Mallissa energiaa siirtyy kohteeseen.':'Mallissa energiaa siirtyy kohteesta ympäristöön.';
  case 'amount':return `Samaan nousuun siirtyy A:han ${round(o.aJ)} J ja B:hen ${round(o.bJ)} J. Sama lämpötila ei yksin määrää koko aine-erän sisäenergiaa.`;
  case 'flow':return `Mallissa ${m.seconds} s jälkeen A ${round(o.a)} °C, B ${round(o.b)} °C. Tasapainolämpötila ${round(o.equilibrium)} °C; siirtyneet energiat ovat yhtä suuret ja vastakkaismerkkiset.`;
  case 'conduction':{const a=o.a as {b:number},b=o.b as {b:number};return `Saman ajan kuluttua viileä pää A ${round(a.b)} °C, B ${round(b.b)} °C. Mallin aine pysyy paikallaan.`;}
  case 'convection':return `${m.medium==='air'?'Ilma':'Vesi'} kuljettaa energiaa liikkuessaan; lämpö ei ole omaa nousevaa ainetta.`;
  case 'radiation':return `Ideaalimallissa avoin reitti ${round(o.openJ)} J, varjostettu ${round(o.screenJ)} J. Säteily voi kulkea myös tyhjiössä.`;
  case 'integration':return 'Mallissa voi tapahtua johtumista, kuljettumista ja säteilyä samanaikaisesti.';
 }
}
function thermometer(temp:number):SVGSVGElement {
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 250 115');svg.setAttribute('role','img');svg.setAttribute('aria-label',`Virtuaalimittarin asteikko, lukema ${temp} celsiusastetta`);svg.style.cssText='display:block;width:100%;max-height:105px';
 const y=(v:number)=>95-(v+20)*1.05;
 const base=document.createElementNS(ns,'line');base.setAttribute('x1','85');base.setAttribute('x2','85');base.setAttribute('y1','95');base.setAttribute('y2','11');base.setAttribute('stroke','#315b64');base.setAttribute('stroke-width','8');svg.append(base);
 const bar=document.createElementNS(ns,'line');bar.setAttribute('x1','85');bar.setAttribute('x2','85');bar.setAttribute('y1','95');bar.setAttribute('y2',String(y(temp)));bar.setAttribute('stroke','#c5634d');bar.setAttribute('stroke-width','6');svg.append(bar);
 for(let v=-20;v<=60;v+=10){const t=document.createElementNS(ns,'text');t.setAttribute('x','48');t.setAttribute('y',String(y(v)+4));t.setAttribute('font-size','11');t.textContent=String(v);svg.append(t);const mark=document.createElementNS(ns,'line');mark.setAttribute('x1','93');mark.setAttribute('x2','102');mark.setAttribute('y1',String(y(v)));mark.setAttribute('y2',String(y(v)));mark.setAttribute('stroke','#315b64');svg.append(mark);}return svg;
}
/** The textarea never enters response, onChange, debug state or persistence. */
export function mountThermalStation(task:ThermalStationTask,host:HTMLElement,submit:(r:ThermalStationResponse)=>void,onChange?:(r:ThermalStationResponse)=>void):{reveal():void} {
 let selected:string[]=[],compared:string[]=[],locked=false,observed=false,sensor:'a'|'b'|undefined,comparison:'a'|'b'|'equal'|undefined;
 const wrap=document.createElement('div'),choices=document.createElement('div'),status=document.createElement('p'),reading=document.createElement('input');wrap.dataset.thermalStation='';
 const next=document.createElement('button'),measure=document.createElement('button'),finish=document.createElement('button');next.type=measure.type=finish.type='button';next.className=measure.className=finish.className='btn';next.textContent='Lukitse ennuste';measure.textContent='Näytä mallihavainto';finish.textContent='Valmis';measure.disabled=true;finish.disabled=true;
 const buttons=task.choices.map(choice=>{const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=choice.label;b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>{if(locked)return;selected=task.input.kind==='integration'?(selected.includes(choice.id)?selected.filter(x=>x!==choice.id):[...selected,choice.id]):[choice.id];for(const [i,x] of buttons.entries())x.setAttribute('aria-pressed',String(selected.includes(task.choices[i]!.id)));next.disabled=!selected.length;emit();});choices.append(b);return b;});
 next.disabled=true;const observation=document.createElement('div');observation.hidden=true;
 const spoken=document.createElement('input');spoken.type='checkbox';spoken.setAttribute('aria-label','Selitän suullisesti aikuiselle');const draft=document.createElement('textarea');draft.rows=2;draft.setAttribute('aria-label','Oma selitykseni');const adult=document.createElement('input');adult.type='checkbox';adult.setAttribute('aria-label','Aikuinen vahvistaa havainnon');
 const assistance=document.createElement('select');assistance.setAttribute('aria-label','Selityksen tuki');for(const [value,label] of [['','Valitse'],['none','Ilman apua'],['helped','Avustettuna']]){const o=document.createElement('option');o.value=value!;o.textContent=label!;assistance.append(o);}
 const assessments=new Map<string,HTMLSelectElement>();
 const response=():ThermalStationResponse=>({kind:'thermal-station',prediction:[...selected],locked,observed,...(compared.length?{compared:[...compared]}:{}),...(sensor?{sensor}:{}),...(reading.value!==''?{reading:Number(reading.value)}:{}),...(comparison?{comparison}:{}),...(task.review?{confirmedByAdult:adult.checked,...(['none','helped'].includes(assistance.value)?{assistance:assistance.value as 'none'|'helped'}:{}),observations:Object.fromEntries([...assessments].filter(([,el])=>el.value==='met'||el.value==='not-yet').map(([id,el])=>[id,el.value as 'met'|'not-yet']))}:{})});
 function emit(){onChange?.(response());}
 next.addEventListener('click',()=>{if(locked||!selected.length)return;locked=true;buttons.forEach(b=>b.disabled=true);choices.hidden=true;next.hidden=true;next.disabled=true;measure.disabled=task.input.kind==='conduction'||task.input.kind==='radiation';status.textContent=measure.disabled?'Ennuste lukittu. Valitse molemmat vertailumallit ennen havaintoa.':'Ennuste lukittu. Avaa nyt mallihavainto.';emit();});
 if(task.input.kind==='conduction'||task.input.kind==='radiation'){
  const controls=document.createElement('div');controls.setAttribute('aria-label','Vertailtavat mallit');
  for(const [id,label] of (task.input.kind==='conduction'?[['a','Valitse silta A'],['b','Valitse silta B']]:[['a','Valitse avoin reitti'],['b','Valitse varjostin']])){const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=label!;b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>{if(!locked||observed)return;if(!compared.includes(id!))compared.push(id!);b.setAttribute('aria-pressed','true');measure.disabled=compared.length<2;emit();});controls.append(b);}wrap.append(controls);
 }
 if(task.input.kind==='probe'){
  const sensorGroup=document.createElement('div');sensorGroup.setAttribute('aria-label','Virtuaalimittarin kohde');sensorGroup.dataset.thermalSensor='';
  for(const id of ['a','b'] as const){const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=`Kohde ${id.toUpperCase()}`;b.addEventListener('click',()=>{if(observed)return;sensor=id;for(const el of sensorGroup.querySelectorAll('button'))el.setAttribute('aria-pressed',String(el===b));emit();});sensorGroup.append(b);}
  wrap.append(sensorGroup);reading.type='number';reading.inputMode='decimal';reading.step='1';reading.setAttribute('aria-label','Vakiintunut lukema celsiusasteina');reading.addEventListener('input',emit);
  const compare=document.createElement('div');for(const [id,label] of [['a','A lämpimämpi'],['b','B lämpimämpi'],['equal','Yhtä lämpimät']] as const){const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=label;b.addEventListener('click',()=>{comparison=id;for(const el of compare.querySelectorAll('button'))el.setAttribute('aria-pressed',String(el===b));emit();});compare.append(b);}
  observation.append(reading,compare);
 }
 measure.addEventListener('click',()=>{if(!locked||observed)return;if(task.input.kind==='probe'&&!sensor){status.textContent='Valitse ensin mittarin kohde.';return;}observed=true;measure.hidden=true;measure.disabled=true;wrap.querySelector<HTMLElement>('[data-thermal-sensor]')?.setAttribute('hidden','');wrap.querySelector<HTMLElement>('[aria-label="Vertailtavat mallit"]')?.setAttribute('hidden','');status.textContent='Mallihavainto avattu lukitun ennusteen jälkeen.';observation.hidden=false;const note=document.createElement('p');if(task.input.kind==='probe'){const m=task.input,other=sensor==='a'?m.bC:m.aC;note.textContent=`Mittari on kohteessa ${sensor?.toUpperCase()}. Vertailukohteen tunnettu lukema on ${other} °C.`;const value=sensor==='a'?m.aC:m.bC;const display=document.createElement('strong');display.textContent=`Digitaalisen virtuaalimittarin lukema: ${value} °C`;observation.prepend(display,thermometer(value));}else note.textContent=outcomeText(task.input);observation.prepend(note);finish.disabled=false;emit();});
 if(task.review){
  const label=document.createElement('label');label.textContent='Kirjoita oma selityksesi aikuiselle (teksti pysyy vain tällä työpinnalla).';label.append(draft);const oralLabel=document.createElement('label');oralLabel.append(spoken,document.createTextNode(' Selitän suullisesti aikuiselle'));observation.append(oralLabel,label);
  for(const c of task.review.criteria){const l=document.createElement('label');l.textContent=c.label;const select=document.createElement('select');select.setAttribute('aria-label',c.label);for(const [v,t] of [['','Ei havaittu'],['met','Näkyi'],['not-yet','Harjoitellaan']]){const o=document.createElement('option');o.value=v!;o.textContent=t!;select.append(o);}l.append(select);observation.append(l);assessments.set(c.id,select);}
  const al=document.createElement('label');al.append(adult,document.createTextNode(' Aikuinen vahvistaa havainnon'));observation.append(al,assistance);
 }
 finish.addEventListener('click',()=>{if(!observed)return;if(task.review&&!spoken.checked&&!draft.value.trim()){status.textContent='Selitä aikuiselle suullisesti tai kirjoita oma selityksesi.';return;}submit(response());});
 wrap.prepend(choices,next,measure,status);wrap.append(observation,finish);host.append(wrap);return {reveal(){status.textContent='Tutki mallin lähtötietoja ja vertaa havaintoa ennusteeseen.';}};
}
