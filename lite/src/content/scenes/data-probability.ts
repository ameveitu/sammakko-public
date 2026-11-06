import type { Paint } from '../../engine/types';
import { h } from '../../ui/dom';
import { svg } from '../../ui/art';
import {
  solutionDataProbability, type DataBoard, type DataChart, type DataChartAction, type DataChartKind,
  type DataChartResponse, type DataOption, type DataProbabilityResponse, type DataProbabilityTask,
} from '../models/data-probability';

const ink = '#24514a', fill = '#80ae97', gridColor = '#9eb4a4';
const row = 'display:flex;flex-wrap:wrap;gap:.35rem;align-items:end';
const fieldStyle = 'min-height:44px;width:100%;min-width:0;border:1px solid #759285;border-radius:7px;background:#fffdf7;color:#24514a;padding:4px 6px;font:inherit';
const wrap = (html: string) => `<div class="data-probability-board" style="grid-column:1/-1;min-width:0;display:grid;gap:.35rem">${html}</div>`;
const labels: Record<DataChartKind,string> = {bar:'pylväsdiagrammi',line:'viivadiagrammi',picture:'kuvadiagrammi'};
const title = (x:number,y:number,value:string,size=13,anchor='middle') =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-weight="700" fill="${ink}">${value}</text>`;
const line = (x:number,y:number,x2:number,y2:number,color=ink,width=1.2) =>
  `<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"/>`;
const point = (x:number,y:number,r=3.8) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${ink}"/>`;

function chartDescription(chart:DataChart,type:string) {
  const scale=chart.type==='picture'?`Yksi kuva vastaa määrää ${chart.key}.`:`Asteikko nollasta arvoon ${chart.top}, väli ${chart.step}.`;
  const data=chart.rows.map(row=>`${row.label} ${row.value}`).join(', ');
  return `${chart.title}, ${type}. Luokat: ${chart.horizontalAxis}. Arvot: ${chart.verticalAxis}. ${scale} ${data}.`;
}

function pictureChart(chart:DataChart) {
  const x0=85,dy=25, y0=49;
  const key=chart.key ?? 1;
  const count=Math.max(1,...chart.rows.map(r=>r.value/key)), distance=Math.min(19,251/count);
  const art=chart.rows.map(({label,value},i)=>{
    const y=y0+i*dy;
    return title(x0-9,y+4,label,12,'end')+Array.from({length:value/key},(_,j)=>
      `<rect x="${x0+j*distance}" y="${y-5}" width="10" height="10" rx="2" fill="${fill}" stroke="${ink}"/>`).join('');
  }).join('');
  const base=y0+chart.rows.length*dy+4;
  return svg(355,base,title(176,15,chart.title,14)+title(76,29,chart.horizontalAxis,11,'end')+art
    +title(176,base-10,`Yksi kuva vastaa määrää ${key} · ${chart.verticalAxis}`,12),chartDescription(chart,labels.picture));
}
const frame={left:53,right:337,top:27,bottom:132};
function verticalChart(chart:DataChart, editable:boolean) {
  const {left,right,top,bottom}=frame, width=(right-left)/chart.rows.length;
  const project=(value:number)=>bottom-(bottom-top)*value/chart.top;
  const guide=Array.from({length:chart.top/chart.step+1},(_,i)=>{
    const n=i*chart.step,y=project(n);
    const major=chart.top/chart.step<=7||i%2===0;
    return line(left,y,right,y,gridColor,major?.8:.45)+(major?title(left-8,y+4,String(n),12,'end'):'');
  }).join('');
  const points=chart.rows.map((r,i)=>[left+(i+.5)*width,project(r.value)] as const);
  const series=chart.type==='bar'?points.map(([x,y])=>
    `<rect x="${x-width*.28}" y="${y}" width="${width*.56}" height="${bottom-y}" fill="${fill}" stroke="${ink}"/>`).join('')
    : points.map(([x,y],i)=>point(x,y)+(i>0?line(...points[i-1]!,x,y,ink,2):'')).join('');
  const marks=chart.rows.map((r,i)=>title(points[i]![0],151,r.label,12)).join('');
  const hits=editable?chart.rows.map((r,i)=>`<rect data-data-column="${r.id}" x="${left+i*width}" y="${top}"
    width="${width}" height="${bottom-top+3}" fill="transparent" style="cursor:crosshair"/>`).join(''):'';
  return svg(355,183,title(178,16,chart.title,14)+guide+line(left,top,left,bottom)+line(left,bottom,right,bottom)
    +series+marks+title(10,21,chart.verticalAxis,10,'start')+title(177,175,chart.horizontalAxis,12)+hits,
    chartDescription(chart,labels[chart.type]));
}
function horizontalChart(chart:DataChart) {
  const left=81,right=334,top=29,bottom=141, height=(bottom-top)/chart.rows.length;
  const project=(value:number)=>left+(right-left)*value/chart.top;
  const guide=Array.from({length:chart.top/chart.step+1},(_,i)=>{
    const n=i*chart.step,x=project(n);
    return line(x,top,x,bottom,gridColor,.65)+title(x,bottom+15,String(n),12);
  }).join('');
  const data=chart.rows.map(({label,value},i)=>{
    const y=top+(i+.5)*height;
    return title(left-8,y+4,label,12,'end')+
      `<rect x="${left}" y="${y-height*.29}" width="${project(value)-left}" height="${height*.58}" fill="${fill}" stroke="${ink}"/>`;
  }).join('');
  return svg(355,184,title(177,17,chart.title,14)+guide+line(left,top,left,bottom)+line(left,bottom,right,bottom)+data
    +title(12,29,chart.horizontalAxis,10,'start')+title(208,176,chart.verticalAxis,12),chartDescription(chart,'vaakapylväät'));
}
function chartArt(chart:DataChart, editable=false) {
  const drawing=chart.type==='picture'?pictureChart(chart):chart.horizontal?horizontalChart(chart):verticalChart(chart,editable);
  return `<div style="max-width:390px;width:100%;margin:auto">${drawing.replace('<svg ','<svg style="max-height:191px" ')}</div>`;
}
const tokenColor = (s:string) => /sininen/i.test(s) ? '#92bdd7' : /punainen/i.test(s) ? '#e6a58a' : /vihreä/i.test(s) ? '#a9cba4' : '#edce86';
function sourceArt(board:DataBoard,compact=false) {
  let content:string;
  if (board.kind==='table') {
    const cell=compact?'padding:2px 3px;line-height:1.2':'';
    content=`<table style="width:100%;border-collapse:collapse"><thead><tr><th scope="col" style="${cell}">${board.columns[0]}</th><th scope="col" style="${cell}">${board.columns[1]}</th></tr></thead>
      <tbody>${board.rows.map(r=>`<tr><th scope="row" style="${cell}">${r.label}</th><td style="text-align:center;${cell}">${r.value}</td></tr>`).join('')}</tbody></table>`;
  } else if (board.kind==='chart') content=chartArt(board.chart);
  else if (board.kind==='product') content=`<div style="${row}">${board.groups.map((options,i)=>`<div style="flex:1 1 110px">
    <strong>${board.labels[i]}</strong><p>${options.map(o=>o.label).join(' · ')}</p></div>`).join('')}</div>`;
  else content=`<div style="${row}">${board.bags.map(bag=>`<section style="flex:1 1 110px;min-width:0;border:1px solid #a3bbac;border-radius:10px;padding:.25rem .4rem">
    <strong>${bag.name}</strong><div style="display:flex;gap:.2rem;flex-wrap:wrap">${bag.tokens.map(token=>
      `<span data-data-token="${token.id}" style="font-size:12px;padding:2px 4px;background:${tokenColor(token.label)};border:1px solid #4d7164;border-radius:6px">${token.label}</span>`).join('')}</div></section>`).join('')}</div>`;
  return wrap(content+(!compact&&board.note?`<p class="small">${board.note}</p>`:''));
}
export const dataProbabilityArt=(task:DataProbabilityTask,solved=false):Paint=>host=>{
  host.innerHTML=sourceArt(task.board);
  if(!solved)return;
  if(task.action?.kind==='chart'){
    const answer=solutionDataProbability(task).chart!;
    host.innerHTML+=chartArt(chartFrom(task.action,answer)!);
  }else{
    const answer=solutionDataProbability(task);
    const details=task.fields.map(field=>{
      const value=field.kind==='set'?(field.answer.map(id=>selected(field.options,id)).join(', ')||'Ei yhtään'):
        field.kind==='choice'?selected(field.options,field.answer):field.answer;
      return `<li><strong>${field.label}</strong> · ${value}</li>`;
    });
    if(task.action?.kind==='tuples'){
      const [a,b]=task.action.groups;
      details.unshift(`<li>${answer.tuples.map(([x,y])=>`${selected(a,x!)} + ${selected(b,y!)}`).join(' · ')}</li>`);
    }
    host.innerHTML+=`<ul style="padding-inline-start:1.1rem;margin:.35rem 0">${details.join('')}</ul>`;
  }
};

const empty=():DataProbabilityResponse=>({kind:'data-probability',values:{},sets:{},tuples:[],chart:null});
const option=(id:string,label:string):DataOption=>({id,label});
function select(label:string,options:readonly DataOption[]) {
  return h('select',{'aria-label':label,style:fieldStyle},
    h('option',{value:'',selected:true,disabled:true},'Valitse'),...options.map(o=>h('option',{value:o.id},o.label)));
}
const entry=(label:string,numeric=false)=>h('input',{type:numeric?'number':'text',inputmode:numeric?'numeric':'decimal',
  'aria-label':label,style:fieldStyle});
const label=(caption:string,input:HTMLElement,width=115)=>h('label',{class:'stack',style:`flex:1 1 ${width}px;min-width:0;gap:.2rem;font-size:14px`},caption,input);
const button=(text:string,onclick:()=>void)=>h('button',{type:'button',class:'btn small',style:'min-height:44px',onclick},text);
const whole=(input:HTMLInputElement)=>Number.isSafeInteger(input.valueAsNumber)?input.valueAsNumber:null;
const selected=(choices:readonly DataOption[],id:string)=>choices.find(o=>o.id===id)?.label??'';
function chartFrom(action:DataChartAction,answer:DataChartResponse):DataChart|undefined {
  const type=answer.type;
  if(!type)return;
  const rows=action.rows.map(row=>({...row,value:Math.max(0,Math.min(99,answer.heights[row.id]??0))}));
  if(type==='picture'){
    if(!answer.key||answer.key<1||rows.some(r=>r.value % answer.key! !== 0||r.value/answer.key!>18))return;
  }else if(answer.baseline!==0||!answer.step||!answer.top||answer.step<1||answer.top<1||
    answer.top/answer.step<2||answer.top/answer.step>12||answer.top%answer.step!==0||rows.some(r=>r.value>answer.top!))return;
  return {type,rows,title:selected(action.titleOptions,answer.title),horizontalAxis:selected(action.categoryOptions,answer.category),
    verticalAxis:selected(action.valueOptions,answer.value),step:answer.step??1,top:answer.top??10,key:answer.key??undefined};
}

function chartControls(action:DataChartAction,controls:HTMLElement,preview:HTMLElement,done:HTMLButtonElement) {
  const single=action.types.length===1&&!action.reasonOptions;
  const kind=select('Diagrammityyppi',Object.entries(labels).map(([id,text])=>option(id,text)));
  const reason=action.reasonOptions?select('Valinnan peruste',action.reasonOptions):null;
  const titleInput=select('Diagrammin otsikko',action.titleOptions);
  const category=select('Vaaka-akselin nimi',action.categoryOptions), value=select('Pysty-akselin nimi ja yksikkö',action.valueOptions);
  const baseline=entry('Asteikon alku',true),step=entry('Asteikkoväli',true),top=entry('Asteikon yläraja',true),key=entry('Yhden kuvan arvo',true);
  const scaleGroup=h('div',{style:`${row};width:100%`},label('Asteikon alku',baseline,90),label('Asteikkoväli',step,90),label('Yläraja (2–12 väliä)',top,90));
  const keyGroup=label('Yhden kuvan arvo',key);
  const heights=action.rows.map(row=>({id:row.id,label:row.label,input:entry(`Arvo: ${row.label}`,true)}));
  const values=h('div',{'data-chart-heights':'',style:`${row};width:100%`},...heights.map(r=>label(r.label,r.input,66)),done);
  if(single) kind.value=action.types[0]!.type;
  controls.append(...(single?[]:[label('Diagrammityyppi',kind,140)]),...(reason?[label('Valinnan peruste',reason,180)]:[]),
    h('div',{style:`${row};width:100%`},label('Otsikko',titleInput),label('Vaaka-akseli',category),label('Pysty-akseli ja yksikkö',value)),
    scaleGroup,keyGroup,values);
  const read=():DataChartResponse=>({
    type:kind.value?(kind.value as DataChartKind):null,reason:reason?.value??'',title:titleInput.value,category:category.value,
    value:value.value,baseline:whole(baseline),step:whole(step),top:whole(top),key:whole(key),
    heights:Object.fromEntries(heights.map(row=>[row.id,whole(row.input)])),
  });
  const render=()=>{
    const current=read(), picture=current.type==='picture';
    scaleGroup.hidden=picture;scaleGroup.style.display=picture?'none':'flex';
    keyGroup.hidden=!picture;keyGroup.style.display=picture?'grid':'none';
    const chart=chartFrom(action,current);
    preview.innerHTML=chart?chartArt(chart,true):'<p class="small">Oma diagrammi näkyy tässä, kun asteikko tai kuvan arvo on asetettu.</p>';
  };
  for(const control of [kind,reason,titleInput,category,value,baseline,step,top,key,...heights.map(r=>r.input)]){
    if(control)control.addEventListener(control instanceof HTMLSelectElement?'change':'input',render);
  }
  preview.addEventListener('click',(event:MouseEvent)=>{
    const hit=(event.target as Element).closest<SVGRectElement>('[data-data-column]');
    const svg=hit?.ownerSVGElement,matrix=svg?.getScreenCTM();
    const current=read();
    const target=heights.find(row=>row.id===hit?.dataset.dataColumn);
    if(!svg||!matrix||!target||target.input.disabled||!current.top)return;
    const point=svg.createSVGPoint();point.x=event.clientX;point.y=event.clientY;
    const local=point.matrixTransform(matrix.inverse());
    target.input.value=String(Math.max(0,Math.min(current.top,Math.round((frame.bottom-local.y)*current.top/(frame.bottom-frame.top)))));
    render();
  });
  render();
  return {read,show(chart:DataChartResponse){
    kind.value=chart.type??'';if(reason)reason.value=chart.reason;
    titleInput.value=chart.title;category.value=chart.category;value.value=chart.value;
    for(const [input,n] of [[baseline,chart.baseline],[step,chart.step],[top,chart.top],[key,chart.key]] as const) input.value=n===null?'':String(n);
    heights.forEach(row=>{row.input.value=chart.heights[row.id]===null?'':String(chart.heights[row.id]);});
    render();
  }};
}

export function mountDataProbability(task:DataProbabilityTask,host:HTMLElement,submit:(answer:DataProbabilityResponse)=>void) {
  let answer=empty();
  const source=h('div',{class:'exp-exact'});
  source.innerHTML=sourceArt(task.board);
  const controls=h('div',{style:row});
  const form=h('form',{class:'stack',style:'gap:.45rem'},source,controls);
  const done=h('button',{type:'submit',class:'btn primary'},'Tarkista');
  const readers=new Map<string,HTMLInputElement|HTMLSelectElement>();
  const boxes=new Map<string,HTMLInputElement[]>();
  const action=task.action;
  const preview=h('div',{'data-chart-preview':'',style:'min-width:0'});
  let chart:ReturnType<typeof chartControls>|undefined;
  if(action?.kind==='chart'){
    const layout=h('div',{style:'display:grid;grid-template-columns:minmax(105px,.72fr) minmax(0,1.28fr);gap:.35rem;align-items:center'});
    source.replaceChildren(layout);
    const given=h('div',{style:'min-width:0'});given.innerHTML=sourceArt(task.board,true);
    layout.append(given,preview);
    if(task.board.note)layout.append(h('p',{class:'small',style:'grid-column:1/-1;margin:0'},task.board.note));
    chart=chartControls(action,controls,preview,done);
  }
  let showTuples=()=>{};
  if(action?.kind==='tuples'){
    const a=select(action.labels[0],action.groups[0]),b=select(action.labels[1],action.groups[1]);
    const list=h('p',{'data-outcome-list':'','aria-live':'polite',style:'width:100%'});
    showTuples=()=>{
      list.textContent=answer.tuples.length?answer.tuples.map(([x,y])=>
        `${selected(action.groups[0],x!)} + ${selected(action.groups[1],y!)}`).join(' · '):'Ei vielä merkittyjä alkeistuloksia.';
    };
    controls.append(label(action.labels[0],a),label(action.labels[1],b),button('Lisää alkeistulos',()=>{
      if(a.value&&b.value){answer.tuples=[...answer.tuples,[a.value,b.value]];showTuples();}
    }),button('Poista viimeinen',()=>{answer.tuples=answer.tuples.slice(0,-1);showTuples();}),list);
    showTuples();
  }
  for(const field of task.fields){
    if(field.kind==='set'){
      const list=h('div',{style:'display:flex;gap:.15rem .6rem;flex-wrap:wrap'});
      const inputs=field.options.map(o=>{
        const check=h('input',{type:'checkbox',value:o.id,'aria-label':o.label});
        check.addEventListener('change',()=>{
          answer.sets[field.id]=inputs.filter(input=>input.checked).map(input=>input.value);
        });
        list.append(h('label',{style:'display:flex;align-items:center;gap:.3rem;min-height:44px;font-size:14px'},check,o.label));
        return check;
      });
      boxes.set(field.id,inputs);
      controls.append(h('fieldset',{style:'width:100%;min-width:0;border:1px solid #a3bbac;border-radius:8px;padding:.2rem .4rem'},
        h('legend',{class:'small'},field.label),list));
    }else{
      const input=field.kind==='choice'?select(field.label,field.options):entry(field.label);
      input.addEventListener(field.kind==='choice'?'change':'input',()=>{answer.values[field.id]=input.value;});
      readers.set(field.id,input);
      controls.append(label(field.label,input));
    }
  }
  if(!chart)form.append(h('div',{},done));
  form.addEventListener('submit',event=>{
    event.preventDefault();
    if(!done.disabled)submit({...answer,chart:chart?.read()??null});
  });
  host.append(form);
  return {reveal(){
    answer=solutionDataProbability(task);
    for(const [id,input] of readers)input.value=answer.values[id]??'';
    for(const [id,inputs] of boxes)for(const input of inputs)input.checked=!!answer.sets[id]?.includes(input.value);
    if(answer.chart)chart?.show(answer.chart);
    showTuples();
    for(const input of form.querySelectorAll('button,input,select'))(input as HTMLButtonElement).disabled=true;
  }};
}
