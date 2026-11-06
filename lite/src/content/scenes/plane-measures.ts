import type { Paint } from '../../engine/types';
import { areaUnitConversion, faceKey, planeFaces, planeNumericInput, segmentName, shownPerimeterSides, solutionPlaneMeasures,
  type AltitudeResponse, type PlaneMeasuresResponse, type PlaneMeasuresTask, type PlanePoint, type PlanePolygon, type PlaneSegment,
  type TriangleBoard, type TriangleResponse } from '../models/plane-measures';

const ns='http://www.w3.org/2000/svg';
const kind='plane-measures' as const;
const colors=['#c7dfc6','#ecd2a1','#bcd9dc','#ddc7df','#d4e2ab'] as const;
const grid='display:grid;grid-template-columns:repeat(auto-fit,minmax(min(86px,100%),1fr));gap:4px';
const unitOptions=['cm','m','mm²','cm²','dm²','m²','cm³','m³'].map(unit=>[unit,unit] as const);
const fmt=(value:number)=>String(value).replace('.',',');
const make=<T extends keyof HTMLElementTagNameMap>(tag:T,text?:string)=>{
  const element=document.createElement(tag);if(text!==undefined)element.textContent=text;return element;
};
function svg<T extends keyof SVGElementTagNameMap>(tag:T,attrs:Record<string,string|number>) {
  const element=document.createElementNS(ns,tag);
  for(const [key,value] of Object.entries(attrs))element.setAttribute(key,String(value));
  return element;
}
function note(text:string){
  const p=make('p',text);p.style.cssText='margin:0;font-size:.85rem;line-height:1.25';return p;
}
function button(text:string,action:()=>void){
  const b=make('button',text);b.type='button';b.className='btn';b.style.minHeight='44px';b.onclick=action;return b;
}
function field<T extends HTMLInputElement|HTMLSelectElement>(name:string,caption:string,control:T) {
  const label=make('label',caption);label.style.cssText='display:grid;gap:1px;min-width:0;font-size:.82rem;align-content:end';
  control.setAttribute('aria-label',name);
  control.style.cssText='width:100%;min-width:0;min-height:44px;padding:3px 5px;box-sizing:border-box;font:inherit';
  label.append(control);return label;
}
function entry(name:string,caption=name){
  const input=make('input');input.type='text';input.inputMode='text';input.autocomplete='off';
  return {node:field(name,caption,input),input,read:()=>planeNumericInput(input.value)};
}
function choice<T extends string>(name:string,items:readonly (readonly [T,string])[],caption=name){
  const input=make('select');
  const set=(options:readonly (readonly [T,string])[])=>{
    input.replaceChildren(new Option('Valitse',''));
    for(const [value,label] of options)input.add(new Option(label,value));
  };
  set(items);
  return {node:field(name,caption,input),input,set,read:()=>input.value as T|''};
}
const pointOptions=(points:readonly PlanePoint[])=>points.map(p=>[p.id,`${p.id} (${p.x}, ${p.y})`] as const);

type Diagram = {
  polygon:PlanePolygon; title:string; unit:string; extra?:readonly PlanePoint[]; guides?:readonly PlaneSegment[];
  cuts?:readonly PlaneSegment[]; hole?:PlanePolygon; faces?:readonly PlanePolygon[]; route?:readonly string[];
  edgeLengths?:readonly {edge:PlaneSegment;length?:number}[]; altitude?:AltitudeResponse; onPick?:(id:string)=>void;
  compact?:boolean;
};
function mapDiagram({polygon,title,unit,extra=[],guides=[],cuts=[],hole,faces,route=[],edgeLengths,altitude,onPick,compact}:Diagram) {
  const points=[...polygon,...extra,...(hole??[])];
  const left=Math.min(...points.map(p=>p.x)),right=Math.max(...points.map(p=>p.x));
  const bottom=Math.min(...points.map(p=>p.y)),top=Math.max(...points.map(p=>p.y));
  const width=compact?176:320,height=compact?115:133;
  const scale=Math.min((width-70)/Math.max(1,right-left),(height-37)/Math.max(1,top-bottom));
  const project=(p:PlanePoint)=>[width/2+(p.x-(left+right)/2)*scale,height/2-(p.y-(bottom+top)/2)*scale] as const;
  const stroke=(a:PlanePoint,b:PlanePoint,color:string,weight:number,dash='')=>{
    const [x1,y1]=project(a),[x2,y2]=project(b);
    return svg('line',{x1,y1,x2,y2,stroke:color,'stroke-width':weight,'stroke-dasharray':dash,'stroke-linecap':'round'});
  };
  const list=(p:PlanePolygon)=>p.map(v=>project(v).join(',')).join(' ');
  const lookup=(id:string|undefined)=>points.find(p=>p.id===id);
  const canvas=svg('svg',{viewBox:`0 0 ${width} ${height}`,role:'img',
    'aria-label':`${title}. Ruudukon väli 1 ${unit}. ${polygon.map(p=>`${p.id} (${p.x}, ${p.y})`).join(', ')}.`});
  canvas.style.cssText=`display:block;width:100%;max-height:${height}px;background:#edf1e4;border-radius:8px`;
  const segment=(pair:PlaneSegment,color:string,weight:number,dash='')=>{
    const a=lookup(pair[0]),b=lookup(pair[1]);
    if(a&&b)canvas.append(stroke(a,b,color,weight,dash));
  };
  const label=(x:number,y:number,text:string,color='#244344',size=11)=>{
    const node=svg('text',{x,y,fill:color,'font-size':size,'text-anchor':'middle','dominant-baseline':'central',
      'font-weight':700,stroke:'#f4f5e9','stroke-width':2.5,'paint-order':'stroke'});
    node.textContent=text;canvas.append(node);
  };
  canvas.append(svg('polygon',{points:list(polygon),fill:'#d2e3c9',stroke:'#345c56','stroke-width':2.3}));
  const faceLabels:{x:number;y:number;key:string}[]=[];
  const blocked=[...polygon,...(hole??[])].map(project);
  const inOutline=(x:number,y:number,outline:PlanePolygon)=>{
    const ring=outline.map(project);
    return ring.filter(([ax,ay],i)=>{
      const [bx,by]=ring[(i+1)%ring.length]!;
      return (ay>y)!==(by>y)&&ax+(bx-ax)*(y-ay)/(by-ay)>x;
    }).length%2===1;
  };
  if(faces&&faces.length>1)for(const [index,face] of faces.entries()){
    canvas.append(svg('polygon',{points:list(face),fill:colors[index%colors.length]!,'fill-opacity':.83,stroke:'#456859','stroke-width':1.2}));
    const mid=face.reduce(({x,y},p)=>({x:x+p.x/face.length,y:y+p.y/face.length}),{x:0,y:0});
    const [x,y]=project({id:'',...mid});
    const candidate=[[0,0],[0,-13],[0,13],[-16,0],[16,0],[-13,-13],[13,-13],[-13,13],[13,13]]
      .map(([dx,dy])=>({x:x+dx,y:y+dy,key:faceKey(face)}))
      .find(p=>inOutline(p.x,p.y,face)&&(!hole||!inOutline(p.x,p.y,hole))
        &&blocked.every(([bx,by])=>Math.hypot(p.x-bx,p.y-by)>17)
        &&faceLabels.every(other=>Math.hypot(p.x-other.x,p.y-other.y)>19));
    if(candidate)faceLabels.push(candidate);
  }
  for(let x=left;x<=right;x++)canvas.append(stroke({id:'',x,y:bottom},{id:'',x,y:top},'#9bb6a4',.55));
  for(let y=bottom;y<=top;y++)canvas.append(stroke({id:'',x:left,y},{id:'',x:right,y},'#9bb6a4',.55));
  for(const {x,y,key} of faceLabels)label(x,y,key,'#31544a',9);
  for(const cut of guides)segment(cut,'#a5694c',1.5,'4 4');
  for(const cut of cuts)segment(cut,faces?'#8d6030':'#a74237',2.3,'4 3');
  if(hole){
    canvas.append(svg('polygon',{points:list(hole),fill:'#f7f3e5','fill-opacity':.7,stroke:'#9b593c','stroke-width':1.8,'stroke-dasharray':'4 2'}));
    const center=hole.reduce(({x,y},p)=>({x:x+p.x/hole.length,y:y+p.y/hole.length}),{x:0,y:0});
    const [x,y]=project({id:'',...center});label(x,y,'aukko','#834932',9);
  }
  for(let i=1;i<route.length;i++)segment([route[i-1]!,route[i]!],'#bc692f',3.5);
  if(altitude?.base)segment(altitude.base,'#536e98',2.8);
  if(altitude?.apex&&altitude.foot){
    const apex=lookup(altitude.apex),foot=lookup(altitude.foot);
    if(apex&&foot){
      canvas.append(stroke(apex,foot,'#bf6533',2.4,'4 3'));
      const a=lookup(altitude.base?.[0]),b=lookup(altitude.base?.[1]);
      if(a&&b){
        const baseX=b.x-a.x,baseY=b.y-a.y,upX=apex.x-foot.x,upY=apex.y-foot.y;
        const onLine=baseX*(foot.y-a.y)===baseY*(foot.x-a.x);
        const perpendicular=baseX*upX+baseY*upY===0;
        if(onLine&&perpendicular&&(upX!==0||upY!==0)){
          if((foot.x-a.x)*(foot.x-b.x)+(foot.y-a.y)*(foot.y-b.y)>0){
            const near=Math.hypot(foot.x-a.x,foot.y-a.y)<Math.hypot(foot.x-b.x,foot.y-b.y)?a:b;
            canvas.append(stroke(near,foot,'#536e98',1.4,'3 3'));
          }
          const [x,y]=project(foot),baseNorm=Math.hypot(baseX,baseY),upNorm=Math.hypot(upX,upY);
          const dx=8*baseX/baseNorm,dy=-8*baseY/baseNorm,ux=8*upX/upNorm,uy=-8*upY/upNorm;
          canvas.append(svg('polyline',{points:`${x+dx},${y+dy} ${x+dx+ux},${y+dy+uy} ${x+ux},${y+uy}`,
            fill:'none',stroke:'#6e422b','stroke-width':1.4}));
        }
      }
    }
  }
  if(edgeLengths)for(const {edge,length} of edgeLengths){
    const a=lookup(edge[0])!,b=lookup(edge[1])!,[x1,y1]=project(a),[x2,y2]=project(b);
    const size=Math.hypot(x2-x1,y2-y1);
    label((x1+x2)/2-11*(y2-y1)/size,(y1+y2)/2+11*(x2-x1)/size,length===undefined?'?':fmt(length),length===undefined?'#98402a':'#244344');
  }
  const center=polygon.reduce(({x,y},p)=>({x:x+p.x/polygon.length,y:y+p.y/polygon.length}),{x:0,y:0});
  const place=(p:PlanePoint,small:boolean)=>{
    const [x,y]=project(p),r=small?2.3:3.6;
    const mark=svg('g',{'data-plane-point':p.id,'data-plane-x':p.x,'data-plane-y':p.y});
    mark.append(svg('circle',{cx:x,cy:y,r,fill:small?'#789893':'#315a52'}));
    if(onPick){
      mark.style.cursor='pointer';
      mark.append(svg('circle',{cx:x,cy:y,r:small?6:9,fill:'transparent'}));
      mark.onclick=()=>onPick(p.id);
    }
    canvas.append(mark);
    if(!small||altitude?.foot===p.id){
      const dx=p.x-center.x,dy=center.y-p.y,d=Math.hypot(dx,dy)||1;
      label(x+10*dx/d,y+10*dy/d,p.id);
    }
  };
  extra.forEach(p=>place(p,true));
  polygon.forEach(p=>place(p,false));
  if(hole)hole.forEach(p=>place(p,false));
  label(width-40,height-9,`Väli 1 ${unit}`,'#3d6256',9);
  return canvas;
}

function areaGrid(step:number){
  const group=step>10?step/10:1,shown=step>10?10:step;
  const title=group>1?'Suuren ruudun lohkot ja yhden lohkon sisäruudut':'Suuren ruudun pienet rivit ja sarakkeet';
  const canvas=svg('svg',{viewBox:'0 0 320 98',role:'img','aria-label':title});
  canvas.style.cssText='display:block;width:100%;max-height:98px;background:#edf1e4;border-radius:8px';
  function squares(x:number,y:number,size:number,steps:number){
    canvas.append(svg('rect',{x,y,width:size,height:size,fill:'#e1ebce',stroke:'#426a59','stroke-width':1.5}));
    for(let n=1;n<steps;n++){
      const d=n*size/steps;
      canvas.append(svg('line',{x1:x+d,y1:y,x2:x+d,y2:y+size,stroke:'#78978b','stroke-width':.7}),
        svg('line',{x1:x,y1:y+d,x2:x+size,y2:y+d,stroke:'#78978b','stroke-width':.7}));
    }
  }
  squares(group>1?42:124,9,77,shown);
  if(group>1){
    canvas.append(svg('rect',{x:42,y:9,width:77/shown,height:77/shown,fill:'#e7ae72',stroke:'#8f5c30'}));
    canvas.append(svg('line',{x1:123,y1:48,x2:178,y2:48,stroke:'#a46d3d','stroke-width':2,'stroke-dasharray':'5 4'}));
    squares(182,9,77,group);
  }
  return canvas;
}

export const planeMeasuresPaint=(task:PlaneMeasuresTask,answer?:PlaneMeasuresResponse):Paint=>host=>{
  const nodes:Node[]=[];
  if(task.mode==='perimeter'){
    const givens=shownPerimeterSides(task);
    nodes.push(note(givens.map(({edge,length})=>`${segmentName(edge)} ${length===undefined?'?':fmt(length)+' '+task.unit}`).join(' · ')));
    nodes.push(note('Ruskea katkoviiva on pihan sisäinen apuviiva.'));
    if(answer?.mode==='perimeter')nodes.push(mapDiagram({polygon:task.polygon,title:task.title,unit:task.unit,guides:task.guides,edgeLengths:givens,route:answer.route}));
  }else if(task.mode==='triangle'){
    nodes.push(note(`Ruudukon väli on 1 ${task.unit}. Korkeuden jalkapiste voi osua kannan jatkeelle.`));
    if(answer?.mode==='triangle')for(const [i,board] of task.boards.entries()){
      const draft=answer.rows[i]!,line=board.lines.find(v=>v.apex===draft.apex)!;
      nodes.push(mapDiagram({polygon:board.polygon,title:board.name,unit:task.unit,extra:line.feet,altitude:draft}));
    }
  }else if(task.mode==='partition'){
    nodes.push(note(`Ruudukon väli on 1 ${task.unit}. ${task.hole?'Laske ensin koko ulkoalue. Vähennä merkitty aukko kerran.':'Valitse leikkauksen päät kartan reunamerkeistä.'}`));
    if(answer?.mode==='partition')nodes.push(note('Yksi mahdollinen ositus.'),mapDiagram({polygon:task.polygon,title:task.title,unit:task.unit,
      hole:task.hole,cuts:answer.cuts,faces:planeFaces(task.polygon,answer.cuts),extra:task.altitude?.feet,altitude:answer.altitude}));
  }else{
    const {step}=areaUnitConversion(task);
    nodes.push(note(`Muunna ${task.amount} ${task.from} yksikköön ${task.to}. Alueen koko säilyy.`));
    if(step>10)nodes.push(note('Vasen kuva näyttää suuret lohkot. Oikea näyttää yhden lohkon sisäruudut.'));
    if(answer?.mode==='conversion')nodes.push(areaGrid(step));
  }
  host.replaceChildren(...nodes);
};

type BaseLine=TriangleBoard['lines'][number];
function heightControls(name:string,polygon:PlanePolygon,lines:readonly BaseLine[],update:()=>void){
  const base=choice(name+'Kanta',lines.map((line,i)=>[String(i),segmentName(line.base)]),'Kanta');
  const tip=choice(name+'Kärki',pointOptions(polygon),'Kärki');
  const foot=choice<string>(name+'Korkeuden jalkapiste',[],'Jalkapiste');
  const line=()=>base.read()===''?undefined:lines[Number(base.read())];
  base.input.onchange=()=>{foot.set(pointOptions([...polygon,...(line()?.feet??[])]));update();};
  foot.set(pointOptions(polygon));
  tip.input.onchange=foot.input.onchange=update;
  const read=():AltitudeResponse=>({base:line()?.base,apex:tip.read()||undefined,foot:foot.read()||undefined});
  const pick=(id:string)=>{
    if(!tip.read()&&polygon.some(p=>p.id===id))tip.input.value=id;
    else if(Array.from(foot.input.options).some(o=>o.value===id))foot.input.value=id;
    update();
  };
  return {nodes:[base.node,tip.node,foot.node],line,read,pick};
}
export function mountPlaneMeasures(task:PlaneMeasuresTask,host:HTMLElement,submit:(r:PlaneMeasuresResponse)=>void):{reveal():void} {
  const wrap=make('div');wrap.dataset.planeMeasures=task.mode;wrap.style.cssText='display:grid;gap:5px';
  const unit=choice('Tuloksen yksikkö',unitOptions,'Yksikkö');
  let response:()=>PlaneMeasuresResponse;
  if(task.mode==='perimeter'){
    const pic=make('div'),route:string[]=[];
    const next=choice('Seuraava reunamerkki',pointOptions(task.polygon),'Reunamerkki');
    const status=make('output');status.style.cssText='font-size:.85rem';
    const add=(id:string)=>{
      if(id&&route.length<task.polygon.length+1)route.push(id);
      next.input.value='';draw();
    };
    const undo=button('Peru reunamerkki',()=>{route.pop();draw();});
    const draw=()=>{
      status.textContent=route.join(' → ');
      undo.disabled=route.length===0;
      pic.replaceChildren(mapDiagram({polygon:task.polygon,title:task.title,unit:task.unit,guides:task.guides,
        route,edgeLengths:shownPerimeterSides(task),onPick:add}));
    };
    const buttons=make('div');buttons.style.cssText=grid;
    buttons.append(next.node,button('Lisää reunamerkki',()=>add(next.read())),undo);
    const missing=entry('Puuttuvan sivun pituus','Puuttuva sivu'),value=entry('Piiri');
    const row=make('div');row.style.cssText=grid;row.append(missing.node,value.node,unit.node);
    wrap.append(pic,buttons,status,row);draw();
    response=()=>({kind,mode:'perimeter',route:[...route],missing:missing.read(),value:value.read(),unit:unit.read()});
  }else if(task.mode==='triangle'){
    const answers=task.boards.map((board,index)=>{
      const prefix=task.boards.length===1?'':`Kolmio ${index+1} · `;
      const row=make('div');row.style.cssText='display:grid;grid-template-columns:minmax(125px,.62fr) minmax(0,1.38fr);gap:5px;align-items:start';
      const picture=make('div'),controls=make('div');controls.style.cssText=grid;
      const draw=()=>picture.replaceChildren(mapDiagram({polygon:board.polygon,extra:height.line()?.feet,title:board.name,unit:task.unit,
        altitude:height.read(),onPick:height.pick,compact:true}));
      const height=heightControls(prefix,board.polygon,board.lines,draw);
      const baseLength=entry(prefix+'Kannan pituus','Kannan pituus'),value=entry(prefix+'Korkeus','Korkeus'),area=entry(prefix+'Pinta-ala','Pinta-ala');
      controls.append(...height.nodes,baseLength.node,value.node,area.node);row.append(picture,controls);
      if(task.boards.length>1)wrap.append(note(board.name));
      wrap.append(row);draw();
      return ():TriangleResponse=>({...height.read(),baseLength:baseLength.read(),height:value.read(),area:area.read()});
    });
    wrap.append(unit.node);
    response=()=>({kind,mode:'triangle',rows:answers.map(read=>read()),unit:unit.read()});
  }else if(task.mode==='partition'){
    const partTask=task;
    const picture=make('div'),areaRows=make('div');areaRows.style.cssText=grid;
    const cuts:PlaneSegment[]=[],controls=make('div');controls.style.cssText=grid;
    const a=choice('Leikkauksen alku',pointOptions(task.polygon),'Leikkaus alusta');
    const b=choice('Leikkauksen loppu',pointOptions(task.polygon),'Leikkaus loppuun');
    const fields=new Map<string,ReturnType<typeof entry>>();
    let active:string[]=[];
    const height=task.altitude?heightControls('',task.polygon,[task.altitude],draw):undefined;
    const lower=entry('Ensimmäisen kannan pituus',task.altitude?segmentName(task.altitude.base):'1. kanta');
    const upper=entry('Toisen kannan pituus',task.altitude?segmentName(task.altitude.upper):'2. kanta'),h=entry('Korkeus','Korkeus');
    const add=()=>{
      if(a.read()&&b.read()&&cuts.length<task.polygon.length-3){cuts.push([a.read(),b.read()]);a.input.value=b.input.value='';draw();}
    };
    const undo=button('Peru leikkaus',()=>{cuts.pop();draw();});
    const picked=(id:string)=>{
      if(!task.polygon.some(p=>p.id===id)){height?.pick(id);return;}
      if(!a.read()){a.input.value=id;return;}
      b.input.value=id;add();
    };
    function draw(){
      const faces=planeFaces(partTask.polygon,cuts);
      picture.replaceChildren(mapDiagram({polygon:partTask.polygon,unit:partTask.unit,title:partTask.title,extra:height?.line()?.feet,
        cuts,hole:partTask.hole,faces,altitude:height?.read(),onPick:picked}));
      active=faces&&faces.length>1?faces.map(faceKey):[];
      for(const id of active)if(!fields.has(id))fields.set(id,entry(`Osan ${id} pinta-ala`,`Osa ${id}`));
      areaRows.replaceChildren(...active.map(id=>fields.get(id)!.node));
      undo.disabled=cuts.length===0;
    }
    if(height){
      const row=make('div');row.style.cssText=grid;row.append(...height.nodes,lower.node,upper.node,h.node);
      wrap.append(row);
    }
    controls.append(a.node,b.node,button('Lisää leikkaus',add),undo);
    const value=entry('Koko pinta-ala','Koko pinta-ala'),hole=entry('Aukon pinta-ala','Aukon ala');
    const total=make('div');total.style.cssText=grid;total.append(...(task.hole?[hole.node]:[]),value.node,unit.node);
    wrap.prepend(picture);wrap.append(controls,areaRows,total);draw();
    response=()=>({kind,mode:'partition',cuts:[...cuts],areas:Object.fromEntries(active.map(id=>[id,fields.get(id)!.read()])),
      ...(height?{altitude:height.read(),lower:lower.read(),upper:upper.read(),height:h.read()}:{}),
      ...(task.hole?{hole:hole.read()}:{}),value:value.read(),unit:unit.read()});
  }else{
    const {step}=areaUnitConversion(task),axes=[entry('Pituuskerroin leveyteen','Leveyden kerroin'),entry('Pituuskerroin korkeuteen','Korkeuden kerroin')];
    const factor=entry('Pinta-alan muunnoskerroin','Alakerroin');
    const direction=choice('Muunnoksen laskutoimitus',[['multiply','Kerro'],['divide','Jaa']],'Toimitus');
    const value=entry('Muunnettu pinta-ala','Pinta-ala');
    const row=make('div');row.style.cssText=grid;
    row.append(...axes.map(a=>a.node),factor.node,direction.node,value.node,unit.node);
    wrap.append(areaGrid(step),row);
    response=()=>({kind,mode:'conversion',axes:axes.map(a=>a.read()),factor:factor.read(),direction:direction.read()||undefined,value:value.read(),unit:unit.read()});
  }
  wrap.append(button('Valmis',()=>submit(response())));host.append(wrap);
  return {reveal(){planeMeasuresPaint(task,solutionPlaneMeasures(task))(wrap);}};
}
