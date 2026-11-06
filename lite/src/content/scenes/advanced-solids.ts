import type { Paint } from '../../engine/types';
import {
  advancedMeasurementPlan, comparisonFigure, orthogonalRadii, solidGroupLabel, solidGroups, solidNumericInput, volumeConversion,
  type AdvancedFigure, type AdvancedSolidsResponse, type AdvancedSolidsScene, type AdvancedSolidsTask,
  type Comparison, type MeasurementField, type SolidBase, type SolidGroup, type SolidView, type SolidWitness, type VolumeUnit,
} from '../models/advanced-solids';

type Measure = Extract<AdvancedSolidsTask,{mode:'measure'}>;
const ns='http://www.w3.org/2000/svg';
const fmt=(value:number)=>String(value).replace('.',',');
const columns='display:grid;grid-template-columns:repeat(auto-fit,minmax(min(106px,100%),1fr));gap:4px';
const styleControl='min-height:44px;min-width:0;width:100%;box-sizing:border-box;padding:3px 5px;font:inherit';
const unitLabels=['cm','cm²','cm³','m','m²','m³','mm³','dm³','l'] as const;
const make=<T extends keyof HTMLElementTagNameMap>(tag:T, text?:string)=>{
  const node=document.createElement(tag);
  if(text!==undefined)node.textContent=text;
  return node;
};
const svg=<T extends keyof SVGElementTagNameMap>(tag:T,attrs:Record<string,string|number>)=>{
  const node=document.createElementNS(ns,tag);
  for(const [name,value] of Object.entries(attrs))node.setAttribute(name,String(value));
  return node;
};
function note(value:string) {
  const p=make('p',value);
  p.style.cssText='font-size:.85rem;line-height:1.25;margin:0';
  return p;
}
function btn(name:string,action:()=>void) {
  const b=make('button',name);b.type='button';b.className='btn';b.style.minHeight='44px';b.onclick=action;
  return b;
}
function entry(name:string,caption=name) {
  const input=make('input');input.type='text';input.autocomplete='off';input.inputMode='text';
  input.setAttribute('aria-label',name);input.style.cssText=styleControl;
  const label=make('label',caption);label.style.cssText='display:grid;gap:1px;min-width:0;font-size:.82rem;align-content:end';
  label.append(input);
  return {node:label,input,value:()=>solidNumericInput(input.value)};
}
function select<T extends string>(name:string,options:readonly (readonly [T,string])[],caption=name) {
  const input=make('select');input.setAttribute('aria-label',name);input.style.cssText=styleControl;
  input.add(new Option('Valitse',''));
  for(const [value,label] of options)input.add(new Option(label,value));
  const label=make('label',caption);label.style.cssText='display:grid;gap:1px;min-width:0;font-size:.82rem;align-content:end';
  label.append(input);
  return {node:label,input,value:()=>input.value as T|''};
}
function baseGivens(base:SolidBase,unit:string,radiusGiven?:'radius'|'diameter'){
  if(base.kind==='circle')return radiusGiven==='diameter'?`Halkaisija ${fmt(2*base.radius)} ${unit}.`:`Säde ${fmt(base.radius)} ${unit}.`;
  return base.kind==='rectangle'?`Pohja ${base.width} ${unit} × ${base.depth} ${unit}.`
    :`Pohjan kateetit ${base.width} ${unit} ja ${base.depth} ${unit}, hypotenuusa ${base.diagonal} ${unit}.`;
}
function measureGivens(task:Measure):string {
  const {shape}=task.figure, u=task.unit;
  if(shape.kind==='sphere')return (task.radiusGiven==='diameter'?`Halkaisija ${fmt(shape.radius*2)} ${u}.`:`Säde ${fmt(shape.radius)} ${u}.`)
    +(task.target==='surface'?' Pallon pinta-ala A = 4πr².':' Pallon tilavuus V = 4πr³/3.')
    +(task.compare?.earlierRadius===undefined?'':` Entisen pallon säde ${fmt(task.compare.earlierRadius)} ${u}.`);
  const base=baseGivens(shape.base,u,task.radiusGiven);
  const height=task.target==='height'?`Kohtisuora korkeus tuntematon. Tarvittava tilavuus ${fmt(task.givenVolume!)}${shape.base.kind==='circle'?' × π':''} ${u}³.`
    :`Kohtisuora korkeus ${fmt(shape.height)} ${u}.`;
  const slant=shape.kind==='cone'&&task.target==='surface'?` Sivujana ${fmt(shape.slant!)} ${u}.`:'';
  const caps=task.target==='surface'?` Kuoreen kuuluu ${shape.caps===0?'vain vaippa':shape.caps===1?'vaippa ja yksi pohja':'vaippa ja molemmat pohjat'}.`:'';
  const compare=task.compare?.earlierRadius!==undefined?` Entinen säde ${fmt(task.compare.earlierRadius)} ${u}, sama korkeus.`
    :task.compare?.earlierHeight!==undefined?` Entinen korkeus ${fmt(task.compare.earlierHeight)} ${u}, sama pohja.`:'';
  return `${base} ${height}${slant}${caps}${compare}`+(task.demoFill==='cone-to-column'?' Kartiomitan ympyrä on sen aukko.':'');
}
const lengths:Readonly<Record<VolumeUnit,string>>={'mm³':'mm','cm³':'cm','dm³':'dm','m³':'m',l:'dm'};
const exponent=(unit:VolumeUnit)=>unit==='l'?'dm³':unit;

export const advancedSolidsPaint=(task:AdvancedSolidsTask):Paint=>host=>{
  if(task.mode==='identify'){
    host.replaceChildren(note('Tutki kappaleita kahdesta suunnasta. Lieriöllä on kaksi yhtenevää yhdensuuntaista pohjaa, kartio kokoontuu pohjasta yhteen huippuun. Pallon pinta on yhtä kaukana keskuksesta kaikkiin suuntiin.'));
  }else if(task.mode==='measure'){
    const plan=advancedMeasurementPlan(task);
    const result=plan.pi?(task.result==='approx'?' Kirjaa myös likiarvo kahteen desimaaliin. Käytä π ≈ 3,141592653589793.'
      :task.result==='either'?' Valitse tarkka π-muoto tai kahden desimaalin likiarvo.':' Anna tarkka kerroin piin eteen.'):'';
    host.replaceChildren(note(measureGivens(task)+result));
  }else{
    host.replaceChildren(note(`Sama tila: ${fmt(task.amount)} ${task.from} = ? ${task.to}. Särmien yksiköt ${lengths[task.from]} ja ${lengths[task.to]}.`
      +(task.from==='l'||task.to==='l'?' Tässä tehtävässä 1 l = 1 dm³.':'')));
  }
};

export function advancedSolidsScene(task:AdvancedSolidsTask,response?:AdvancedSolidsResponse):AdvancedSolidsScene {
  const view=response?.view??(task.mode==='identify'?task.firstView:task.mode==='convert'?'section':'body');
  const common={kind:'advanced-solids' as const,mode:task.mode,title:task.title,view};
  if(task.mode==='identify')return {...common,figures:task.figures};
  if(task.mode==='convert')return {...common,figures:[],grid:{subdivisions:volumeConversion(task).step,from:task.from,to:task.to}};
  const draft=response?.mode==='measure'?response:undefined;
  const opened=draft?.locked===true;
  const earlier=opened?comparisonFigure(task):undefined;
  const shape=task.figure.shape;
  const figures:AdvancedFigure[]=[task.figure];
  if(task.demoFill==='cone-to-column'&&shape.kind==='cone'){
    figures.push({id:'Vertailu',pose:task.figure.pose,color:'#54878f',shape:{kind:'column',base:shape.base,height:shape.height,caps:1}});
  }
  if(earlier)figures.unshift(earlier);
  const fill=draft?.fillStep;
  return {...common,figures,target:task.target,demoFill:task.demoFill,fillStep:Number.isInteger(fill)&&fill!>=0&&fill!<=3?fill:0,
    comparisonOpen:opened};
}

function maxSpan(figure:AdvancedFigure):number {
  const {shape}=figure;
  if(shape.kind==='sphere')return shape.radius*2;
  if(shape.kind==='ellipsoid')return Math.max(...shape.radii)*2;
  if(shape.kind==='frustum')return Math.max(shape.lower*2,shape.height);
  const base=shape.base.kind==='circle'?shape.base.radius*2:Math.max(shape.base.width,shape.base.depth);
  return shape.kind==='flat'?base:Math.max(shape.height,base);
}
function sideAndEnd(figure:AdvancedFigure,view:SolidView,measure?:Measure,fill=0,commonScale?:number):SVGSVGElement {
  const {id,shape,color}=figure;
  const canvas=svg('svg',{viewBox:'0 0 144 83',role:'img','aria-label':`Mallin ${id} sivu- ja päätykuva`});
  canvas.style.cssText='display:block;width:100%;max-height:83px';
  const line=(x1:number,y1:number,x2:number,y2:number,dash=false,color='#284d52')=>
    canvas.append(svg('line',{x1,y1,x2,y2,stroke:color,'stroke-width':1.4,...(dash?{'stroke-dasharray':'3 2'}:{})}));
  const label=(x:number,y:number,text:string,size=11)=>{
    const node=svg('text',{x,y,fill:'#173d46','text-anchor':'middle','font-size':size,'font-weight':650});
    node.textContent=text;canvas.append(node);
  };
  const point=(x:number,y:number)=>canvas.append(svg('circle',{cx:x,cy:y,r:2.5,fill:'#213f46'}));
  const outline=(points:string,solid=true)=>canvas.append(svg('polygon',{points,stroke:'#315a59','stroke-width':1.3,fill:solid?color:'#f7f2de','fill-opacity':solid?.42:1}));
  const base=(value:SolidBase,x:number,y:number,s=1)=>{
    if(value.kind==='circle')canvas.append(svg('circle',{cx:x,cy:y,r:13*s,fill:color,'fill-opacity':.35,stroke:'#315a59','stroke-width':1.4}));
    else {
      const k=12*s/Math.max(value.width,value.depth),w=value.width*k,d=value.depth*k;
      const lower=`${x-w},${y+d} ${x+w},${y+d}`;
      const upper=`${x-w},${y-d}`;
      outline(value.kind==='rectangle'?`${lower} ${x+w},${y-d} ${upper}`:`${lower} ${upper}`);
    }
  };
  const section=view==='section';
  label(72,11,id,12);
  if(shape.kind==='sphere'||shape.kind==='ellipsoid'){
    const r=orthogonalRadii(shape)!;
    const k=44/(commonScale??2*Math.max(...r)),cx=46,cy=43;
    canvas.append(svg('ellipse',{cx,cy,rx:r[0]*k,ry:r[1]*k,fill:color,'fill-opacity':section?.26:.5,stroke:'#315a59','stroke-width':1.6}));
    canvas.append(svg('ellipse',{cx:105,cy,rx:r[2]*k,ry:r[1]*k,fill:color,'fill-opacity':.22,stroke:'#315a59','stroke-width':1.3}));
    if(section){
      point(cx,cy);line(cx,cy,cx+r[0]*k,cy);line(cx,cy,cx,cy-r[1]*k);
      point(105,cy);line(105,cy,105+r[2]*k,cy);
      if(!measure)label(72,78,`X ${fmt(r[0])} · Y ${fmt(r[1])} · Z ${fmt(r[2])}`);
    }
  }else if(shape.kind==='frustum'){
    outline('20,61 72,61 61,23 31,23');base({kind:'circle',radius:shape.lower},106,46);
    if(section)line(46,23,46,61,true);
  }else if(shape.kind==='flat'){
    line(22,51,69,51);base(shape.base,105,43);
  }else{
    const cone=shape.kind==='cone';
    if(view==='net'&&measure?.target==='surface'){
      if(cone){
        const radius=shape.base.kind==='circle'?shape.base.radius:0;
        const sweep=2*Math.PI*radius/shape.slant!;
        const centre=[38,46],length=24;
        const start=-sweep/2-Math.PI/2,end=start+sweep;
        const [a,b]=[start,end].map(a=>[centre[0]!+length*Math.cos(a),centre[1]!+length*Math.sin(a)]);
        canvas.append(svg('path',{d:`M ${centre.join(' ')} L ${a!.join(' ')} A ${length} ${length} 0 ${sweep>Math.PI?1:0} 1 ${b!.join(' ')} Z`,
          fill:color,'fill-opacity':.5,stroke:'#315a59'}));
        if(shape.caps)base(shape.base,98,44);
        label(72,78,'Sektorivaippa ja mahdollinen pohja');
      }else{
        outline('18,27 100,27 100,56 18,56');
        if(shape.base.kind!=='circle'){
          const {width,depth}=shape.base;
          const faces=shape.base.kind==='rectangle'?[width,depth,width,depth]:[width,depth,shape.base.diagonal];
          const perimeter=faces.reduce((total,length)=>total+length,0);
          let position=18;
          for(const length of faces.slice(0,-1)){
            position+=82*length/perimeter;
            line(position,27,position,56,true);
          }
        }
        if(shape.caps>=1)base(shape.base,114,45,.63);
        if(shape.caps===2)base(shape.base,130,26,.63);
        label(72,77,'Vaipan kaista ja mukana olevat pohjat');
      }
    }else{
      const size=shape.base.kind==='circle'?shape.base.radius:Math.max(shape.base.width,shape.base.depth)/2;
      const max=commonScale??Math.max(2*size,shape.height),wide=48*2*size/max,tall=48*shape.height/max;
      const y0=63,y1=y0-tall,x1=47-wide/2,x2=47+wide/2;
      const points=cone?`${x1},${y0} 47,${y1} ${x2},${y0}`:`${x1},${y0} ${x1},${y1} ${x2},${y1} ${x2},${y0}`;
      const isHorizontal=figure.pose==='horizontal'&&!measure;
      const inverted=cone&&measure?.demoFill==='cone-to-column';
      const group=svg('g',isHorizontal?{transform:'rotate(90 47 43)'}:inverted?{transform:'rotate(180 47 40)'}:{});
      group.append(svg('polygon',{points,stroke:'#315a59','stroke-width':1.3,fill:color,'fill-opacity':section?.3:.53}));
      if(inverted&&figure.id==='Uusi'&&fill<3)
        group.append(svg('polygon',{points,fill:'#4b9caa','fill-opacity':.78,'data-solid-cone-water':''}));
      if(!cone&&fill)group.append(svg('rect',{x:x1,y:y0-tall*fill/3,width:wide,height:tall*fill/3,fill:'#4b9caa','fill-opacity':.78}));
      if(section||measure){
        group.append(svg('line',{x1:47,y1:y0,x2:47,y2:y1,stroke:'#315a59','stroke-width':1.3,'stroke-dasharray':'3 2'}));
        if(cone&&measure?.target==='surface')group.append(svg('line',{x1:47,y1:y1,x2,y2:y0,stroke:'#9c492f','stroke-width':2}));
      }
      canvas.append(group);
      base(shape.base,111,43,commonScale?2*size/commonScale:1);
      if(measure&&figure.id==='Uusi')label(72,78,measure.target==='height'?'Kohtisuora korkeus ?':cone&&measure.target==='surface'?'Sivujana korostettuna':'Katkoviiva näyttää korkeuden');
      else label(72,78,'Sivu ja pohjan suunta');
    }
  }
  return canvas;
}

function gridDiagram(steps:number, view:SolidView):SVGSVGElement {
  const label=view==='section'?'Läpinäkyvä yksikkökuutio ja sisempi kerros':'Yksikkökuution etu-, ylä- ja sivutahko';
  const diagram=svg('svg',{viewBox:'0 0 145 90',role:'img','aria-label':`${label}. Jokaisella suunnalla ${steps} väliä.`});
  diagram.style.cssText='display:block;width:100%;max-height:90px';
  const segment=(x1:number,y1:number,x2:number,y2:number)=>diagram.append(svg('line',{x1,y1,x2,y2,stroke:'#39695d','stroke-width':.7}));
  const x=38,y=22,w=55,d=18;
  for(let i=0;i<=steps;i++){
    const a=w*i/steps,b=d*i/steps;
    segment(x+a,y,x+a,y+w);segment(x,y+a,x+w,y+a);
    segment(x+a,y,x+a+d,y-d);segment(x+b,y-b,x+w+b,y-b);
    segment(x+w+b,y-b,x+w+b,y+w-b);segment(x+w,y+a,x+w+d,y+a-d);
  }
  if(view==='section'&&steps>1){
    const cut=d*Math.floor(steps/2)/steps;
    diagram.append(svg('rect',{x:x+cut,y:y-cut,width:w,height:w,fill:'#64a5a0','fill-opacity':.14,stroke:'#226b68','stroke-width':1.1}));
    for(let i=1;i<steps;i++){
      const a=w*i/steps;
      segment(x+cut+a,y-cut,x+cut+a,y-cut+w);
      segment(x+cut,y-cut+a,x+cut+w,y-cut+a);
    }
  }
  return diagram;
}

function viewButtons(active:SolidView,allowNet:boolean,change:(view:SolidView)=>void){
  const bar=make('div');bar.style.cssText='display:flex;gap:4px;flex-wrap:wrap';
  const buttons=new Map<SolidView,HTMLButtonElement>();
  const entries:readonly (readonly [SolidView,string])[]=allowNet?[['body','Kappale'],['section','Leikkaus'],['net','Avaa verkko']]
    :[['body','Kappale'],['section','Leikkaus']];
  for(const [value,label] of entries){
    const button=btn(label,()=>{
      for(const [id,b] of buttons)b.setAttribute('aria-pressed',String(id===value));
      change(value);
    });
    button.setAttribute('aria-pressed',String(active===value));
    buttons.set(value,button);bar.append(button);
  }
  return bar;
}
const predictionOptions:readonly (readonly [Comparison,string])[]=[['less','Pienenee'],['same','Pysyy samana'],['greater','Suurenee']];

export function mountAdvancedSolids(task:AdvancedSolidsTask,host:HTMLElement,submit:(response:AdvancedSolidsResponse)=>void,
  onChange?:(response:AdvancedSolidsResponse)=>void):{reveal():void} {
  const wrap=make('div');wrap.dataset.advancedSolids=task.mode;wrap.style.cssText='display:grid;gap:5px';
  const pictures=make('div');pictures.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(min(86px,100%),1fr));gap:5px;background:#eaf1e6;border-radius:10px';
  let view:SolidView=task.mode==='identify'?task.firstView:task.mode==='convert'?'section':'body';
  let response:()=>AdvancedSolidsResponse;
  let redrawWork=()=>{};
  const state=()=>advancedSolidsScene(task,response());
  const draw=()=>{
    const model=state();
    if(task.mode==='convert')pictures.replaceChildren(gridDiagram(model.grid!.subdivisions,view));
    else{
      const commonScale=task.mode==='measure'&&model.figures.length>1?Math.max(...model.figures.map(maxSpan)):undefined;
      pictures.replaceChildren(...model.figures.map(figure=>sideAndEnd(figure,view,task.mode==='measure'?task:undefined,
        figure.id==='Vertailu'||figure.id==='Uusi'?model.fillStep:0,commonScale)));
    }
  };
  const update=()=>{draw();onChange?.(response());};
  const allowNet=task.mode==='measure'&&task.target==='surface'&&task.figure.shape.kind!=='sphere';
  wrap.append(viewButtons(view,allowNet,next=>{view=next;update();}),pictures);
  const finish=btn('Valmis',()=>submit(response()));
  if(task.mode==='identify'){
    const entries=task.figures.map(figure=>{
      const groupOptions=task.target==='all'?solidGroups.map(key=>[key,solidGroupLabel[key]] as const)
        :[[task.target,solidGroupLabel[task.target]],['other','Muu malli']] as const;
      const group=select<SolidGroup>(`Mallin ${figure.id} luokka`,groupOptions,`Malli ${figure.id}`);
      const bases=entry(`Mallin ${figure.id} pohjien määrä`,'Pohjia');
      const tips=entry(`Mallin ${figure.id} huippujen määrä`,'Huippuja');
      const same=select(`Mallin ${figure.id} pohjat yhtenevät ja yhdensuuntaiset`,[['yes','Kyllä'],['no','Ei']],'Samat, yhdensuuntaiset?');
      const radii=(['X','Y','Z'] as const).map(axis=>entry(`Mallin ${figure.id} keskus–pinta ${axis}`,axis));
      const row=make('div');row.style.cssText=columns;
      const drawRow=()=>{
        const type=group.value();
        row.replaceChildren(group.node,
          ...(type==='cone'?[bases.node,tips.node]:type==='column'?[bases.node,same.node]:type==='sphere'?radii.map(r=>r.node):[]));
      };
      const read=():SolidWitness=>({group:group.value()||undefined,bases:bases.value(),tips:tips.value(),equalBases:same.value()===''?undefined:same.value()==='yes',
        radii:radii.map(r=>r.value())});
      group.input.onchange=drawRow;drawRow();wrap.append(row);
      return {id:figure.id,read};
    });
    response=()=>({kind:'advanced-solids',mode:'identify',view,choices:Object.fromEntries(entries.map(e=>[e.id,e.read()]))});
  }else if(task.mode==='measure'){
    const plan=advancedMeasurementPlan(task);
    const items=plan.requirements.map(req=>({key:req.key,field:entry(req.label,req.label+(req.pi?' × π':''))}));
    const unit=select('Tuloksen yksikkö',unitLabels.map(unit=>[unit,unit] as const),'Yksikkö');
    const notation=task.result==='either'&&plan.pi?select('Tuloksen esitystapa',[['exact','Tarkka π'],['approx','Likiarvo ≈']],'Esitystapa'):undefined;
    const rounded=entry('Pyöristetty likiarvo','≈ tulos');
    const prediction=task.compare?select('Tilavuuden tai pinta-alan ennuste',predictionOptions,'Ennuste'):undefined;
    let locked=false,fillStep=0;
    const work=make('div');work.style.cssText=columns;
    const status=make('p');status.style.cssText='margin:0;font-size:.85rem';status.setAttribute('aria-live','polite');
    const fill=task.demoFill?btn(task.demoFill==='cone-to-column'?'Kaada yksi täysi kartio':'Lisää yksi kerros',()=>{
      fillStep=Math.min(3,fillStep+1);redrawWork();update();
    }):undefined;
    const lock=prediction?btn('Lukitse ennuste',()=>{
      if(!prediction.value()){prediction.input.focus();return;}
      locked=true;prediction.input.disabled=true;redrawWork();update();
    }):undefined;
    const tools=make('div');tools.style.cssText='display:flex;gap:5px;align-items:end;flex-wrap:wrap';
    if(prediction&&lock){tools.append(prediction.node,lock);}
    if(fill)tools.append(fill,status);
    wrap.append(tools,work);
    const notationValue=()=>!plan.pi?undefined:notation?notation.value()||undefined:task.result==='approx'?'approx':'exact';
    redrawWork=()=>{
      const ready=!prediction||locked;
      if(lock)lock.style.display=locked?'none':'';
      if(fill){fill.style.display=ready?'':'none';fill.disabled=fillStep===3;}
      status.textContent=fill&&ready?`${fillStep} / 3 yhtä suurta täyttövaihetta.`+(task.demoFill==='cone-to-column'&&fillStep<3?' Seuraava kaato lähtee taas täydestä kartiomitasta.':''):'';
      work.style.display=ready?'grid':'none';
      work.replaceChildren(...items.map(i=>i.field.node),unit.node,...(notation?[notation.node]:[]),...(notationValue()==='approx'?[rounded.node]:[]));
      finish.disabled=!ready||!!fill&&fillStep!==3;
    };
    if(notation)notation.input.onchange=redrawWork;
    response=()=>({kind:'advanced-solids',mode:'measure',view,values:Object.fromEntries(items.map(i=>[i.key,i.field.value()])) as Partial<Record<MeasurementField,string>>,
      unit:unit.value(),notation:notationValue(),rounded:rounded.value(),prediction:prediction?.value()||undefined,locked,fillStep});
    redrawWork();
  }else{
    const axes=['Leveys','Syvyys','Korkeus'].map(axis=>entry(`Särmän kerroin: ${axis}`,axis));
    const factor=entry('Tilavuuden muunnoskerroin','Kuutioitu kerroin');
    const operation=select('Muunnoksen laskutoimitus',[['times','Kerro'],['divide','Jaa'],['same','Sama lukumäärä']],'Toimitus');
    const result=entry('Muunnettu tilavuus','Tilavuus');
    const unit=select('Uusi tilavuusyksikkö',unitLabels.filter(u=>u.endsWith('³')||u==='l').map(u=>[u,u] as const),'Yksikkö');
    const fields=make('div');fields.style.cssText=columns;
    fields.append(...axes.map(a=>a.node),factor.node,operation.node,result.node,unit.node);
    wrap.append(note(`Vertaa suurempaa yksikkökuutiota pienempään. Kuvan kolme mittasuuntaa ovat ${exponent(task.from)}- ja ${exponent(task.to)}-asteikon vertailua.`),fields);
    response=()=>({kind:'advanced-solids',mode:'convert',view,axes:axes.map(a=>a.value()),factor:factor.value(),
      operation:operation.value()||undefined,value:result.value(),unit:unit.value()});
  }
  wrap.append(finish);host.append(wrap);draw();
  return {reveal(){/* The authored worked example remains in the exact panel. */}};
}
