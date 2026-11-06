import type { Paint } from '../../engine/types';
import { h } from '../../ui/dom';
import { svg } from '../../ui/art';
import { runFerryProgram,type FerryCell,type FerryCommand,type FerryHeading,type FerryPose,type FerryRun } from '../models/ferry-program';
import {
  commandMark,commandName,expectedFerryCommands,ferryCellName,ferryCommands,ferryHeadings,ferryOutcome,
  freshProgrammingFerryResponse,headingName,programmingFerryScene,solutionProgrammingFerry,
  type FerryObservation,type FerryScenario,type ProgrammingFerryResponse,type ProgrammingFerryTask,
} from '../models/programming-ferries';

const horizontal='display:flex;gap:5px;flex-wrap:wrap;align-items:center';
const actionStyle='min-height:44px;min-width:44px;padding:4px 8px';
const inputStyle='min-height:44px;max-width:100%;border:1px solid #7e9d8e;border-radius:8px;background:#fffdf7;color:#214d43;padding:3px 6px;font:inherit';
const arrows:Record<FerryHeading,string>={north:'↑',east:'→',south:'↓',west:'←'};
const outcomes:Record<FerryObservation['status'],string>={complete:'Jono päättyi',rock:'Kari pysäytti',edge:'Kartan reuna pysäytti',limit:'Askelraja pysäytti'};
const turnDegrees:Record<FerryHeading,number>={north:0,east:90,south:180,west:270};
const commandText=(command:FerryCommand)=>`${commandMark[command]} ${commandName[command]}`;
const poseText=(pose:FerryPose)=>`${ferryCellName(pose)} · ${headingName[pose.heading]}`;
const action=(text:string,onclick:()=>void,label=text)=>h('button',{type:'button',class:'btn small',style:actionStyle,onclick,'aria-label':label},text);

function ferryMap(scenario:FerryScenario,pose:FerryPose,path:readonly FerryCell[],plan:readonly FerryCell[]=[],showGoal=true){
  const left=23,top=24,unit=26;
  const at=(p:FerryCell)=>[left+(p.x+.5)*unit,top+(p.y+.5)*unit];
  const {width,height,rocks,start}=scenario.board;
  const w=left+width*unit+5,h=top+height*unit+4;
  const txt=(x:number,y:number,t:string,size=10,fill='#224b44')=>
    `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" fill="${fill}" font-weight="700">${t}</text>`;
  const squares=Array.from({length:height},(_,y)=>Array.from({length:width},(_,x)=>
    `<rect data-ferry-cell="${ferryCellName({x,y})}" x="${left+x*unit}" y="${top+y*unit}" width="${unit}" height="${unit}" fill="${(x+y)%2?'#c9e1dc':'#dcece2'}" stroke="#82aaa1" stroke-width=".65"/>`).join('')).join('');
  const names=Array.from({length:width},(_,x)=>txt(at({x,y:0})[0]!,18,String.fromCharCode(65+x),12)).join('')+
    Array.from({length:height},(_,y)=>txt(14,at({x:0,y})[1]!+4,String(y+1),12)).join('');
  const markers=rocks.map(rock=>{
    const [x,y]=at(rock);
    return `<path d="M${x!-9} ${y!+7} l4 -12 10 -3 5 15 Z" fill="#596d67" stroke="#354f48"/>`;
  }).join('');
  const via=(showGoal?(scenario.goal.via??[]):[]).map((dock,i)=>{
    const [x,y]=at(dock);
    return `<rect x="${x!-9}" y="${y!-9}" width="18" height="18" rx="3" fill="#f0cb85" stroke="#765728"/>`+txt(x!,y!+4,String(i+1),11);
  }).join('');
  const [dx,dy]=at(scenario.goal.destination),[px,py]=at(pose);
  const dock=showGoal?`<rect x="${dx!-10}" y="${dy!-10}" width="20" height="20" rx="3" fill="#9dc89f" stroke="#356e48"/>`+
    txt(dx!,dy!+4,scenario.goal.heading?arrows[scenario.goal.heading]:'●',13):'';
  const course=(cells:readonly FerryCell[],color:string,dash:string)=>
    `<polyline points="${cells.map(p=>at(p).join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="${dash}" stroke-linecap="round"/>`;
  const [sx,sy]=at(start);
  const ferry=`<circle cx="${sx}" cy="${sy}" r="3.5" fill="#fff" stroke="#2e6459"/><g transform="translate(${px} ${py}) rotate(${turnDegrees[pose.heading]})">
    <path d="M0 -10 L8 1 L6 9 L-6 9 L-8 1 Z" fill="#387b70" stroke="#fff9e8" stroke-width="1.7"/>
    <path d="M0 -6 L3 -1 H-3 Z" fill="#fff4db"/>
  </g>`;
  const label=`Kartta. Sarakkeet A–${String.fromCharCode(64+width)}, rivit 1–${height}. Lähtö ${poseText(start)}. Nyt ${poseText(pose)}.
    Karit: ${rocks.map(ferryCellName).join(', ')||'ei'}.${showGoal?` Tavoite ${ferryCellName(scenario.goal.destination)}.`:''}
    Kuljetut ruudut: ${path.map(ferryCellName).join(', ')}.`;
  return svg(w,h,squares+`<g pointer-events="none">${names+markers+via+dock+course(path,'#2b7064','4 3')+course(plan,'#a46535','3 3')+ferry}</g>`,label);
}

function goals(scenario:FerryScenario){
  const {destination,heading,via}=scenario.goal;
  return [
    `Lähtö: ${poseText(scenario.board.start)}`,
    `Kohde: ${ferryCellName(destination)}${heading?` · keula ${headingName[heading]}`:''}`,
    ...(via?.length?[`Välilaiturit: ${via.map(ferryCellName).join(' → ')}`]:[]),
  ];
}
const compactList=(steps:readonly string[])=>h('ol',{style:'margin:2px 0;padding-left:1.3rem;font-size:13px;line-height:1.25'},
  ...steps.map(value=>h('li',{},value)));
function courseText(run:FerryRun){
  return run.steps.map(step=>`${step.index+1}. ${poseText(step.after)}${step.outcome!=='done'?` · ${outcomes[step.outcome]}`:''}`);
}

function menu(label:string,options:readonly (readonly [string,string])[]) {
  const field=h('select',{'aria-label':label,style:inputStyle},
    h('option',{value:''},'Valitse'),...options.map(([value,text])=>h('option',{value},text)));
  return {field,node:h('label',{style:'display:grid;gap:2px;font-size:13px;flex:1 1 85px;min-width:0'},label,field)};
}
const cells=(scenario:FerryScenario)=>Array.from({length:scenario.board.height},(_,y)=>
  Array.from({length:scenario.board.width},(_,x)=>({x,y}))).flat();
function poseEntry(scenario:FerryScenario,prefix=''){
  const board=cells(scenario);
  const cell=menu(prefix+'Ruutu',board.map(p=>[ferryCellName(p),ferryCellName(p)]));
  const heading=menu(prefix+'Keula',ferryHeadings.map(key=>[key,headingName[key]]));
  return {node:h('div',{style:horizontal},cell.node,heading.node),read:():FerryPose|undefined=>{
    const selected=board.find(p=>ferryCellName(p)===cell.field.value);
    return selected&&heading.field.value?{...selected,heading:heading.field.value as FerryHeading}:undefined;
  }};
}
function observationEntry(scenario:FerryScenario,run:FerryRun|undefined,requireChecks:boolean,differenceCount=0){
  const forecast=!run;
  const pose=poseEntry(scenario,forecast?'Ennuste · ':'Havainto · ');
  const status=menu(forecast?'Ennuste · Ajotulos':'Havainto · Ajotulos',Object.entries(outcomes));
  const yesNo=[['yes','Täyttyi'],['no','Jäi auki']] as const;
  const checks=requireChecks?{
    destination:menu('Kohderuutu',yesNo),
    ...(scenario.goal.heading?{heading:menu('Keulaehto',yesNo)}:{}),
    ...(scenario.goal.via?.length?{via:menu('Välilaiturit',yesNo)}:{}),
  }:undefined;
  const difference=differenceCount?menu('Ensimmäinen ero',[
    ['none','Ei eroa'],['start','Lähtötila'],...Array.from({length:differenceCount},(_,i)=>[String(i),`Askel ${i+1}`] as const),
  ]):undefined;
  pose.node.append(status.node);
  const checkEntries=Object.values(checks??{});
  const node=h('div',{class:'stack',style:'gap:4px'},pose.node,
    ...(checkEntries.length||difference?[h('div',{style:horizontal},...checkEntries.map(item=>item.node),difference?.node??null)]:[]));
  return {node,read:():FerryObservation|undefined=>{
    const placement=pose.read();
    if(!placement||!status.field.value||checkEntries.some(item=>!item.field.value)||(difference&&!difference.field.value))return;
    const diff=difference?.field.value;
    return {pose:placement,status:status.field.value as FerryObservation['status'],executed:run?.steps.length??0,
      ...(checks?{checks:{destination:checks.destination.field.value==='yes',heading:!checks.heading||checks.heading.field.value==='yes',
        via:!checks.via||checks.via.field.value==='yes'}}:{}),
      ...(diff?{difference:diff==='none'?null:diff==='start'?-1:Number(diff)}:{})};
  }};
}

export function mountProgrammingFerry(task:ProgrammingFerryTask,host:HTMLElement,
  submit:(answer:ProgrammingFerryResponse)=>void,onChange?:(answer:ProgrammingFerryResponse)=>void):{reveal():void}{
  let answer=freshProgrammingFerryResponse(),active=0,step=0,finished=false,observing=false,locked=false;
  let previousProjection='';
  const primary=()=>task.activity==='follow'?answer.program:task.script??answer.program;
  const current=()=>task.cases[active===0?0:1]!;
  const sequence=()=>active===2?answer.repair:primary();
  const executed=()=>runFerryProgram(current().board,sequence().slice(0,step));
  const map=h('div',{'data-ferry-map':'',style:'min-width:0;max-width:183px;width:100%;align-self:center'});
  const cards=h('div',{style:'font-size:13px;line-height:1.25;min-width:0'});
  const exact=h('div',{class:'exp-exact programming-ferry-board',style:'display:grid;grid-template-columns:minmax(106px,.83fr) minmax(0,1.17fr);gap:8px'},map,cards);
  const controls=h('div',{class:'stack',style:'gap:5px'});
  const note=h('p',{'aria-live':'polite',style:'font-size:13px;margin:0'});
  const root=h('div',{class:'stack',style:'gap:5px'},exact,controls,note);
  const finish=(value:ProgrammingFerryResponse)=>{
    if(locked)return;
    locked=true;submit(value);
  };
  function preview(){
    const scenario=current(),run=executed();
    map.innerHTML=ferryMap(scenario,run.final,run.visited,answer.plan.length?[scenario.board.start,...answer.plan]:[],task.activity!=='predict');
    const details=task.activity==='predict'?goals(scenario).slice(0,1):goals(scenario);
    cards.replaceChildren(h('strong',{},scenario.label),...details.map(text=>h('div',{},text)));
    if(task.instruction)cards.append(compactList(task.instruction.map(instruction=>instruction.text)));
    if(task.script&&active!==2){
      const given=task.script.map((command,index)=>h('span',{style:`display:inline-block;margin:2px 3px 0 0;padding:2px 4px;border-radius:5px;background:${task.activity==='follow'&&index===step-(observing?1:0)?'#f5d894':'#d9e9dc'}`},
        `${index+1}. ${commandText(command)}`));
      cards.append(h('div',{'aria-label':'Annettu käskyjono',style:'margin:3px 0'},...given));
    }
    if(task.reference)cards.append(h('div',{style:'margin-top:3px'},h('strong',{},'Odotettu jälki'),h('div',{'data-ferry-reference':''},
      courseText(runFerryProgram(scenario.board,task.reference)).join(' · '))));
    if(step>0){
      cards.append(h('div',{'data-ferry-result':'',style:'font-weight:700;margin-top:3px'},
        `Nyt ${poseText(run.final)}${run.status==='blocked'?` · ${outcomes[ferryOutcome(run)]}`:''}`));
      const trace=courseText(run);
      cards.append(h('details',{style:'margin-top:2px'},h('summary',{},`Askelloki (${trace.length})`),compactList(trace)));
    }
    if(answer.observations.length&&task.activity==='repair'){
      const labels=['Kohde','Keula','Laiturit'];
      const logged=answer.observations.map(observation=>{
        const checks=observation.checks?Object.values(observation.checks).map((ok,i)=>`${labels[i]} ${ok?'✓':'–'}`).join(', '):'';
        return `${poseText(observation.pose)} · ${outcomes[observation.status]} · ${checks}`;
      });
      cards.append(h('details',{style:'margin-top:2px'},h('summary',{},`Kirjatut testit (${logged.length})`),compactList(logged)));
    }
    if(answer.forecast)cards.append(h('div',{'data-ferry-forecast':'',style:'margin-top:3px'},
      `Lukittu ennuste: ${poseText(answer.forecast.pose)} · ${outcomes[answer.forecast.status]}`));
    const projection=JSON.stringify([active,step,run.final,run.visited,run.status]);
    if(projection!==previousProjection){
      previousProjection=projection;
      onChange?.({...answer,preview:{caseIndex:active===0?0:1,source:active===2?'repair':'primary',step}});
    }
  }
  function refocus(label:string){
    const next=Array.from(controls.querySelectorAll<HTMLElement>('button,select')).find(el=>
      el.getAttribute('aria-label')===label&&!el.hasAttribute('disabled'));
    next?.focus({preventScroll:true});
  }
  function rebuild(label?:string){
    preview();draw();
    if(label)refocus(label);
  }
  function checkButton(run:()=>void,text='Tarkista'){
    return h('button',{type:'button',class:'btn primary',style:actionStyle,onclick:run,'aria-label':text},text);
  }
  function record(entry:ReturnType<typeof observationEntry>,next:(value:FerryObservation)=>void,text='Tarkista'){
    return checkButton(()=>{
      const value=entry.read();
      if(value){note.textContent='';next(value);}
      else note.textContent='Täytä ensin kaikki tämän ajon havaintokentät.';
    },text);
  }
  function tray(edit:(command:FerryCommand)=>void,undo:()=>void,clear?:()=>void){
    return h('div',{style:horizontal,'aria-label':'Graafiset käskyt'},
      ...ferryCommands.map(command=>action(commandText(command),()=>edit(command),commandName[command])),
      action('Kumoa',undo),...(clear?[action('Tyhjennä',clear)]:[]));
  }
  function codeEditor(){
    const own=sequence();
    const line=h('div',{'data-ferry-program':'','aria-label':'Oma käskyjono',
      style:'max-height:53px;overflow:auto;font-size:13px;min-height:20px'},
    own.length?own.map((c,i)=>`${i+1}. ${commandText(c)}`).join(' · '):'Lisää käskyjä jonoon.');
    const update=(next:FerryCommand[],label:string)=>{
      if(next.length>64){note.textContent='Jonossa voi olla enintään 64 käskyä.';return;}
      if(active===2)answer.repair=next;
      else answer.program=next;
      step=0;finished=false;note.textContent='';rebuild(label);
    };
    return h('div',{class:'stack',style:'gap:3px'},line,
      tray(command=>update([...own,command],commandName[command]),()=>update(own.slice(0,-1),'Kumoa'),()=>update([],'Tyhjennä')));
  }
  function runButtons(){
    const move=(all:boolean)=>{
      const run=runFerryProgram(current().board,sequence());
      step=all?run.steps.length:Math.min(step+1,run.steps.length);
      finished=step===run.steps.length;
      note.textContent=finished?`Ajo päättyi · ${poseText(run.final)}.`:`Askellettu ${step}/${sequence().length}.`;
      rebuild(finished?(task.activity==='author'||task.activity==='encode'?'Tarkista':'Havainto · Ruutu'):all?'Aja ohjelma':'Askella');
    };
    return h('div',{style:horizontal},action('Askella',()=>move(false)),action('Aja ohjelma',()=>move(true)),
      action('Nollaa ajo',()=>{step=0;finished=false;note.textContent='Lautta palasi lähtöön.';rebuild('Nollaa ajo');}));
  }
  function drawFollow(){
    const canMove=!observing&&step<(task.script?.length??0)&&executed().status!=='blocked';
    if(canMove)controls.append(tray(command=>{
      answer.program.push(command);step++;observing=true;rebuild('Askel · Ruutu');
    },()=>{
      answer.program.pop();answer.follow.pop();step=answer.program.length;rebuild();
    }));
    if(observing){
      const choice=poseEntry(current(),'Askel · ');
      controls.append(choice.node,h('div',{style:horizontal},action('Kirjaa askel',()=>{
        const pose=choice.read();
        if(!pose){note.textContent='Valitse ruutu ja keula.';return;}
        answer.follow.push(pose);observing=false;note.textContent='';
        rebuild(step<(task.script?.length??0)&&executed().status!=='blocked'?'Eteen':'Tarkista');
      }),action('Kumoa askel',()=>{
        answer.program.pop();step--;observing=false;rebuild();
      })));
    }
    if(!canMove&&!observing)controls.append(h('div',{style:horizontal},
      checkButton(()=>finish(answer)),action('Kumoa askel',()=>{
        answer.program.pop();answer.follow.pop();step=answer.program.length;rebuild();
      })));
  }
  function drawPlan(){
    const choice=menu('Osuuden pääteruutu',cells(current()).map(cell=>[ferryCellName(cell),ferryCellName(cell)]));
    const add=(name:string)=>{
      const selected=cells(current()).find(p=>ferryCellName(p)===name);
      if(!selected||answer.plan.length>=12){note.textContent='Valitse kartalta enintään 12 pääteruutua.';return;}
      answer.plan.push(selected);note.textContent='';rebuild('Osuuden pääteruutu');
    };
    map.onclick=event=>{
      const chosen=(event.target as Element).closest('[data-ferry-cell]')?.getAttribute('data-ferry-cell');
      if(chosen&&!locked)add(chosen);
    };
    controls.append(h('p',{'data-ferry-plan':'',style:'margin:0;font-size:13px'},
      `Lähtö ${ferryCellName(current().board.start)}${answer.plan.map(p=>` → ${ferryCellName(p)}`).join('')}`),
      h('div',{style:horizontal},choice.node,action('Lisää osuus',()=>add(choice.field.value)),
        action('Kumoa osuus',()=>{answer.plan.pop();rebuild('Osuuden pääteruutu');}),checkButton(()=>finish(answer))));
  }
  function draw(){
    controls.replaceChildren();
    switch(task.activity){
      case 'follow': drawFollow();return;
      case 'plan': drawPlan();return;
      case 'predict': if(!answer.forecast){
        const forecast=observationEntry(current(),undefined,false);
        controls.append(forecast.node,record(forecast,value=>{answer.forecast=value;rebuild('Askella');},'Lukitse ennuste'));
        return;
      }break;
    }
    if(task.activity==='author'||task.activity==='encode'||(task.activity==='repair'&&(active===2||active===0&&!task.script)))controls.append(codeEditor());
    if(task.activity!=='evaluate')controls.append(runButtons());
    if(!finished)return;
    if(task.activity==='author'||task.activity==='encode'){
      controls.append(checkButton(()=>finish(answer)));return;
    }
    const run=executed(),needsChecks=['repair','evaluate','integrate'].includes(task.activity);
    const refCount=task.reference?Math.max(run.steps.length,task.reference.length):0;
    const entry=observationEntry(current(),run,needsChecks,refCount);
    controls.append(entry.node,record(entry,value=>{
      if(task.activity==='repair'&&active<2){
        answer.observations.push(value);
        active++;step=0;finished=false;
        if(active===2)answer.repair=[...primary()];
        note.textContent=active===2?'Muokkaa käskyjonoa toiseen lähtöön.':'Testaa sama käskyjono toisesta lähdöstä.';
        rebuild('Askella');
      }else finish({...answer,observations:[...answer.observations,value]});
    },task.activity==='repair'&&active<2?`Kirjaa ajo ${active+1}`:'Tarkista'));
  }
  if(task.activity==='evaluate'){step=expectedFerryCommands(task).length;finished=true;}
  host.append(root);
  rebuild();
  return {reveal(){
    locked=true;
    answer=solutionProgrammingFerry(task);
    if(task.activity==='repair')active=2;
    step=sequence().length;finished=true;
    preview();
    const summary=answer.observations.map(o=>`${poseText(o.pose)} · ${outcomes[o.status]}`);
    if(task.activity==='plan')summary.push(answer.plan.map(ferryCellName).join(' → '));
    if(sequence().length)summary.unshift(sequence().map(commandText).join(' · '));
    controls.replaceChildren(h('strong',{},'Esimerkkivastaus'),compactList(summary));
  }};
}

export function programmingFerryExample(task:ProgrammingFerryTask):Paint {
  const answer=solutionProgrammingFerry(task),scenario=task.cases[0]!;
  const sequence=task.script??answer.program;
  const model=programmingFerryScene(task,{...answer,preview:{caseIndex:0,source:'primary',step:sequence.length}});
  return host=>{
    const art=h('div',{class:'exp-exact',style:'display:grid;grid-template-columns:minmax(95px,.8fr) minmax(0,1.2fr);gap:8px'});
    const map=h('div',{},'');map.innerHTML=ferryMap(scenario,model.pose,model.path,answer.plan.length?[scenario.board.start,...answer.plan]:[],task.activity!=='predict');
    const run=runFerryProgram(scenario.board,sequence);
    art.append(map,h('div',{},...(task.activity==='predict'?goals(scenario).slice(0,1):goals(scenario)).map(text=>h('div',{},text)),
      sequence.length?compactList(run.steps.map(step=>`${commandText(step.command)} → ${poseText(step.after)}`)):
        h('p',{},answer.plan.map(ferryCellName).join(' → '))));
    host.replaceChildren(art);
  };
}
