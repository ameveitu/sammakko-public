import type { Paint } from '../../engine/types';
import { h } from '../../ui/dom';
import { svg } from '../../ui/art';
import { parseMeasure } from '../models/spatial-measures';
import {
  compassCuts,compassRadius,emptyGeometryRelations,polygonVertexIds,solutionGeometryRelations,squareDistance,turn,validTriangleAngles,
  type GeoFact,type GeoMark,type GeoOption,type GeoPoint,type GeoShape,type GeometryRelationsBoard,
  type GeometryRelationsResponse,type GeometryRelationsTask,
} from '../models/geometry-relations';

const ink='#24564a',dim='#9bb8a8',lineColor='#527f75',gold='#a66237',highlight='#bc7c42';
const row='display:flex;flex-wrap:wrap;align-items:end;gap:5px';
const fieldStyle='min-height:44px;max-width:100%;width:100%;min-width:0;border:1px solid #77998b;border-radius:7px;background:#fffefa;color:#244e45;padding:3px 6px;font:inherit';
const button=(text:string,run:()=>void)=>h('button',{type:'button',class:'btn small',style:'min-height:44px;min-width:44px',onclick:run},text);
const move=(x:number,y:number):GeoPoint=>({x,y});
const fix=(n:number)=>Math.round(n*1000)/1000;
const coords=(p:GeoPoint)=>`${fix(p.x)} ${fix(p.y)}`;
const text=(x:number,y:number,value:string,size=12,anchor='middle')=>
  `<text x="${fix(x)}" y="${fix(y)}" font-size="${size}" text-anchor="${anchor}" fill="${ink}" font-weight="700" paint-order="stroke" stroke="#eef3e9" stroke-width="1.3">${value}</text>`;
const line=(a:GeoPoint,b:GeoPoint,color=ink,width=2,dash='')=>
  `<path d="M${coords(a)} L${coords(b)}" fill="none" stroke="${color}" stroke-width="${width}" stroke-dasharray="${dash}"/>`;
const circ=(p:GeoPoint,r:number,color=ink,extra='')=>
  `<circle cx="${fix(p.x)}" cy="${fix(p.y)}" r="${fix(r)}" fill="${color}" ${extra}/>`;
const midpoint=(a:GeoPoint,b:GeoPoint)=>move((a.x+b.x)/2,(a.y+b.y)/2);
const rad=(deg:number)=>deg*Math.PI/180;
const polar=(p:GeoPoint,r:number,degree:number)=>move(p.x+r*Math.cos(rad(degree)),p.y-r*Math.sin(rad(degree)));
const degrees=(a:GeoPoint,b:GeoPoint)=>Math.atan2(a.y-b.y,b.x-a.x)*180/Math.PI;
function extendFrom(start:GeoPoint,dx:number,dy:number,width:number,height:number,padding=8){
  const t=Math.min(dx>0?(width-padding-start.x)/dx:dx<0?(padding-start.x)/dx:Infinity,
    dy>0?(height-padding-start.y)/dy:dy<0?(padding-start.y)/dy:Infinity);
  return move(start.x+dx*t,start.y+dy*t);
}
const fmt=(n:number)=>String(Math.round(n*100)/100).replace('.',',');
function extent(points:readonly GeoPoint[]){
  const xs=points.map(p=>p.x),ys=points.map(p=>p.y);
  return Math.max(1,Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys));
}
function projection(points:readonly GeoPoint[],w:number,h:number,max=extent(points),margin=17){
  const xs=points.map(p=>p.x),ys=points.map(p=>p.y);
  const mx=(Math.min(...xs)+Math.max(...xs))/2,my=(Math.min(...ys)+Math.max(...ys))/2;
  const scale=(Math.min(w,h)-2*margin)/max;
  return {scale,at:(p:GeoPoint)=>move(w/2+(p.x-mx)*scale,h/2+(p.y-my)*scale)};
}
function sector(center:GeoPoint,r:number,start:number,size:number,fill:string){
  const a=polar(center,r,start),b=polar(center,r,start+size);
  return `<path d="M${coords(center)} L${coords(a)} A${r} ${r} 0 ${size>180?1:0} 0 ${coords(b)} Z" fill="${fill}" stroke="${lineColor}" stroke-width="1"/>`;
}
function arc(center:GeoPoint,r:number,start:number,size:number,color:string){
  const a=polar(center,r,start),b=polar(center,r,start+size);
  return `<path d="M${coords(a)} A${r} ${r} 0 ${size>180?1:0} 0 ${coords(b)}" fill="none" stroke="${color}" stroke-width="2"/>`;
}
function pin(point:GeoPoint,label:string,extra='',labelAt=move(point.x,point.y-6)){
  return `<g ${extra}>${circ(point,3)}${text(labelAt.x,labelAt.y,label,13)}${circ(point,10,'transparent')}</g>`;
}
const polygon=(points:readonly GeoPoint[],fill='#c9dfcc',stroke=ink,width=1.7)=>
  `<polygon points="${points.map(coords).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;

function shapeArt(shape:GeoShape,span:number,w=112,h=97,facts:readonly GeoFact[]=[]){
  const {at}=projection(shape.vertices,w,h,span,14),vertices=shape.vertices.map(at);
  const markings=facts.map((fact,i)=>{
    const color=[gold,'#437a9a','#7863a2'][i%3]!;
    if(fact.kind==='side'){
      const a=vertices[fact.a]!,b=vertices[fact.b]!,m=midpoint(a,b);
      const d=degrees(a,b)+90;
      return line(polar(m,5,d),polar(m,5,d+180),color,2.4)+line(a,b,color,2.2);
    }
    const c=vertices[fact.at]!,u=vertices[(fact.at+1)%3]!,v=vertices[(fact.at+2)%3]!;
    const a=degrees(c,u),b=degrees(c,v),separation=(b-a+360)%360;
    return arc(c,10,separation<=180?a:b,Math.min(separation,360-separation),color);
  }).join('');
  const labels=vertices.map((v,i)=>pin(v,shape.vertices[i]!.id)).join('');
  return svg(w,h,polygon(vertices)+markings+labels,`${shape.label}, kärjet ${shape.vertices.map(p=>p.id).join(', ')}`).replace('<svg ','<svg style="max-height:88px" ');
}
function figureFact(shape:GeoShape,facts:readonly GeoFact[]){
  return facts.map(fact=>{
    if(fact.kind==='side'){
      const a=shape.vertices[fact.a]!,b=shape.vertices[fact.b]!,d=squareDistance(a,b),sqrt=Math.sqrt(d);
      return `${a.id}${b.id} ${Number.isInteger(sqrt)?sqrt:`√${d}`}`;
    }
    const c=shape.vertices[fact.at]!,a=shape.vertices[(fact.at+1)%3]!,b=shape.vertices[(fact.at+2)%3]!;
    const separation=Math.abs(degrees(c,a)-degrees(c,b))%360;
    const amount=Math.min(separation,360-separation);
    return `∠${c.id} ${Number.isInteger(amount)?`= ${amount}`:`≈ ${fmt(amount)}`}°`;
  }).join(' · ');
}
function figures(shapes:readonly GeoShape[],facts:readonly GeoFact[]=[]){
  const span=Math.max(...shapes.map(shape=>extent(shape.vertices)));
  return `<div style="display:grid;grid-template-columns:repeat(${shapes.length},minmax(0,1fr));gap:4px;text-align:center">${shapes.map(shape=>
    `<figure style="margin:0;min-width:0"><figcaption style="font-weight:700;font-size:13px">${shape.label}</figcaption>${shapeArt(shape,span)}${facts.length?
      `<small style="display:block;line-height:1.15">${figureFact(shape,facts)}</small>`:''}</figure>`).join('')}</div>`;
}
function matchedReflection(board:Extract<GeometryRelationsBoard,{kind:'shapes'}>,r:GeometryRelationsResponse){
  const original=board.shapes[0]!,target=board.shapes.find(s=>s.id===r.values.target);
  if(!target)return false;
  const [a,b,c]=original.vertices;
  const matching=(p:GeoMark)=>target.vertices.find(v=>v.id===r.pairs.find(pair=>pair[0]===p.id)?.[1])!;
  return turn(a!,b!,c!)*turn(matching(a!),matching(b!),matching(c!))<0;
}
function rigidOverlay(board:Extract<GeometryRelationsBoard,{kind:'shapes'}>,r:GeometryRelationsResponse,reflect:boolean,resize:boolean){
  const original=board.shapes[0]!,target=board.shapes.find(shape=>shape.id===r.values.target);
  const [sourceA,sourceB]=original.vertices;
  const match=(v:GeoMark)=>target?.vertices.find(p=>p.id===r.pairs.find(pair=>pair[0]===v.id)?.[1]);
  const otherA=match(sourceA!),otherB=match(sourceB!);
  if(!target||!otherA||!otherB||otherA.id===otherB.id){
    return '<p class="small">Valitse malli ja merkitse kaksi eri vastinkärkeä A:lle ja B:lle, jotta sovitus näkyy.</p>';
  }
  const s=move(sourceB!.x-sourceA!.x,sourceB!.y-sourceA!.y);
  const a=move(otherB.x-otherA.x,(otherB.y-otherA.y)*(reflect?-1:1));
  const angle=Math.atan2(s.y,s.x)-Math.atan2(a.y,a.x);
  const value=parseMeasure(r.values.factor??'');
  const scale=resize&&value&&value[0]>0n?Number(value[1])/Number(value[0]):1;
  if(!Number.isFinite(scale)||scale>50||scale<=0)return '';
  const fit=target.vertices.map(p=>{
    const x=(p.x-otherA.x)*scale,y=(p.y-otherA.y)*scale*(reflect?-1:1);
    return move(sourceA!.x+x*Math.cos(angle)-y*Math.sin(angle),sourceA!.y+x*Math.sin(angle)+y*Math.cos(angle));
  });
  const {at}=projection([...original.vertices,...fit],262,104);
  return `<div style="max-width:330px;margin:auto" data-geo-overlay>${svg(262,104,polygon(original.vertices.map(at),'#cde3cd')+
    polygon(fit.map(at),'none',gold,2.2),`Sovitus, vihreä alkuperäinen ja ruskea ${target.label}`)}</div>`;
}

function rays(board:Extract<GeometryRelationsBoard,{kind:'ray'}>,r:GeometryRelationsResponse){
  const w=290,h=132,{at}=projection(board.marks,w,h,extent(board.marks)+2);
  const first=board.marks.find(p=>p.id===r.points[0]),second=board.marks.find(p=>p.id===r.points[1]);
  let drawn='';
  if(first&&second&&first.id!==second.id){
    const a=at(first),b=at(second),dx=b.x-a.x,dy=b.y-a.y;
    const end=extendFrom(a,dx,dy,w,h),heading=degrees(a,end);
    drawn=line(a,end,gold,2.4)+polygon([end,polar(end,10,heading+150),polar(end,10,heading-150)],gold,gold);
  }
  return svg(w,h,drawn+board.marks.map(p=>pin(at(p),p.id,`data-geo-point="${p.id}" style="cursor:pointer"`)).join(''),
    `Pistekartta ${board.marks.map(p=>p.id).join(', ')}${first?`. Alku ${first.id}`:''}${second?`, suunta kohti ${second.id}`:''}`);
}
function cutPoints(a:GeoPoint,b:GeoPoint,ra:number,rb:number){
  const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),x=(ra*ra-rb*rb+d*d)/(2*d),h2=ra*ra-x*x;
  if(!d||h2<=1e-8)return [];
  const mx=a.x+dx*x/d,my=a.y+dy*x/d,h=Math.sqrt(h2);
  return [-1,1].map(sign=>move(mx-sign*dy*h/d,my+sign*dx*h/d));
}
function constructArt(board:Extract<GeometryRelationsBoard,{kind:'construction'}>,r:GeometryRelationsResponse){
  const {a,b}=board,largest=Math.max(...board.radii);
  const all=[move(a.x-largest,a.y-largest),move(a.x+largest,a.y+largest),
    move(b.x-largest,b.y-largest),move(b.x+largest,b.y+largest)];
  const {at,scale}=projection(all,316,146,extent(all),7);
  const circles=r.circles.map(circle=>({center:circle.center===a.id?a:b,radius:Number(circle.radius)}));
  const aa=circles.find(circle=>circle.center.id===a.id),bb=circles.find(circle=>circle.center.id===b.id);
  const cuts=aa&&bb?(aa.radius===bb.radius&&compassRadius(a,b,String(aa.radius))?
    compassCuts(a,b,aa.radius):cutPoints(a,b,aa.radius,bb.radius)):[];
  const cutsIds=['P','Q'];
  const origin=at(a),end=at(b),centre=at(midpoint(a,b)),length=Math.hypot(end.x-origin.x,end.y-origin.y);
  const ux=(end.x-origin.x)/length,uy=(end.y-origin.y)/length;
  const offset=(point:GeoPoint,along:number,across:number)=>move(point.x+ux*along-uy*across,point.y+uy*along+ux*across+4);
  const markings=cuts.map((point,i)=>{
    const projected=at(point);
    return pin(projected,cutsIds[i]!,`data-geo-cut="${cutsIds[i]}" style="cursor:pointer"`,offset(projected,-5,i===0?-13:13));
  }).join('');
  const chosen=r.intersections.length===2&&r.intersections.includes('P')&&r.intersections.includes('Q')&&cuts.length===2;
  let join='';
  if(chosen){
    const p=at(cuts[0]!),q=at(cuts[1]!),dx=q.x-p.x,dy=q.y-p.y;
    join=line(extendFrom(p,-dx,-dy,316,146),extendFrom(q,dx,dy,316,146),gold,1.4,'4 3')+
      line(p,q,gold,2.6);
  }
  const arcs=circles.map(({center,radius},i)=>circ(at(center),radius*scale,'none',
    `stroke="${i?'#8769a0':'#4a8b9c'}" stroke-width="1.65"`)).join('');
  return svg(316,146,arcs+line(origin,end)+join+pin(origin,'A','',offset(origin,-14,3))+pin(end,'B','',offset(end,14,3))+
    pin(centre,'M','',offset(centre,8,7))+markings+
    text(17,140,`AB = ${fmt(Math.sqrt(squareDistance(a,b)))}`,12,'start'),
  `Jana A–B. ${circles.map(c=>`Keskus ${c.center.id}, säde ${c.radius}`).join('. ')}. ${cuts.length?'Leikkauspisteet P ja Q.':''}`);
}
function pathArt(board:Extract<GeometryRelationsBoard,{kind:'paths'}>){
  return `<div style="display:grid;grid-template-columns:repeat(${board.paths.length},minmax(0,1fr));gap:4px">${board.paths.map(path=>{
    const {at}=projection(path.points,106,78,extent(path.points)+1,10),points=path.points.map(at);
    const [a,b,c]=points;
    const d=path.segments==='curve'?`M${coords(a!)} Q${coords(b!)} ${coords(c!)}${path.closed?
      ` Q${coords(move(a!.x+c!.x-b!.x,a!.y+c!.y-b!.y))} ${coords(a!)} Z`:''}`:
      `M${points.map(coords).join(' L')}${path.closed?' Z':''}`;
    return `<div style="text-align:center"><strong>${path.id}</strong>${svg(106,78,
      `<path d="${d}" stroke="${ink}" stroke-width="2.8" fill="none"/>`+
      (!path.closed?circ(a!,3)+circ(points.at(-1)!,3):''),`Viiva ${path.id}`)}</div>`;
  }).join('')}</div>`;
}
function linesArt(board:Extract<GeometryRelationsBoard,{kind:'lines'}>,expanded:boolean){
  const [[a,b],[c,d]]=board.lines;
  const u=move(b.x-a.x,b.y-a.y),v=move(d.x-c.x,d.y-c.y);
  const det=u.x*v.y-u.y*v.x;
  const t=det?((c.x-a.x)*v.y-(c.y-a.y)*v.x)/det:0;
  const intersection=det?move(a.x+t*u.x,a.y+t*u.y):undefined;
  const base=[a,b,c,d],points=expanded&&intersection?[...base,intersection]:base;
  const {at}=projection(points,306,138,extent(points)+2,12);
  let content='';
  board.lines.forEach(([p,q],i)=>{
    const first=at(p),last=at(q),x=last.x-first.x,y=last.y-first.y,color=i?gold:ink;
    if(expanded){
      content+=line(extendFrom(first,-x,-y,306,138,11),extendFrom(last,x,y,306,138,11),color,1.5,'5 3');
    }
    content+=line(first,last,color,3)+text(first.x+4,first.y-7,i?'s':'r',13);
  });
  if(expanded&&intersection)content+=circ(at(intersection),3,highlight);
  return svg(306,138,content,expanded?'Suorat r ja s jatkettuina molempiin suuntiin':'Suorien r ja s näkyvät osat');
}
function angleArt(board:Extract<GeometryRelationsBoard,{kind:'sectors'}>){
  const center=move(143,71);
  const colours=['#c6dfc6','#e8cfab','#b8d5d8','#ddcce5'];
  const areas=board.sectors.map((s,i)=>sector(center,49,s.start,s.size,colours[i]!)).join('');
  const rays=board.bearings.map(deg=>line(center,polar(center,67,deg),ink,2)).join('');
  const labels=board.sectors.map(s=>{
    const label=polar(center,36,s.start+s.size/2);
    return text(label.x,label.y+3,s.shown?`${s.id} ${s.size}°`:s.id,12);
  }).join('');
  return svg(286,142,areas+rays+labels+circ(center,2.8),`Kulmakaavio. ${board.sectors.map(s=>s.shown?`${s.id} ${s.size} astetta`:s.id).join(', ')}`);
}
function triangleArt(board:Extract<GeometryRelationsBoard,{kind:'triangle'}>,r:GeometryRelationsResponse){
  const [a,b,c]=board.angles;
  if(!validTriangleAngles(board.angles))return `<p style="margin:0;text-align:center;font-size:20px">A ${a}° · B ${b}° · C ${c}°</p>`;
  const side=10*Math.sin(rad(b))/Math.sin(rad(c));
  const tilt=rad(board.rotation??0),cos=Math.cos(tilt),sin=Math.sin(tilt);
  const triangle=[move(0,0),move(10,0),move(side*Math.cos(rad(a)),-side*Math.sin(rad(a)))]
    .map(point=>move(point.x*cos-point.y*sin,point.x*sin+point.y*cos));
  const {at}=projection(triangle,282,123,extent(triangle),13),points=triangle.map(at);
  const labels=['A','B','C'],colours=['#c6dfc6','#f0d5ac','#bad9e1'];
  const markers=points.map((point,i)=>{
    const j=degrees(point,points[(i+1)%3]!),k=degrees(point,points[(i+2)%3]!);
    const start=(k-j+360)%360<=180?j:k;
    return sector(point,17,start,board.angles[i]!,colours[i]!)+
      text(point.x+9,point.y-6,`${labels[i]} ${board.hide===i?'?':`${board.angles[i]}°`}`,12);
  }).join('');
  let sum=0;
  const center=move(140,63),assembled=r.points.map(id=>{
    const i=labels.indexOf(id),size=board.angles[i]??0,part=sector(center,50,sum,size,colours[i]??dim);
    const tag=polar(center,33,sum+size/2);sum+=size;
    return part+text(tag.x,tag.y,id);
  }).join('');
  return `<div style="display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:4px">${svg(282,123,polygon(points)+markers,'Kolmion kolme kärkikulmaa')}${
    svg(280,80,line(move(26,63),move(255,63),ink)+assembled,`Suora ja sijoitetut kulmat ${r.points.join(', ')}`)}</div>`;
}
function polygonArt(board:Extract<GeometryRelationsBoard,{kind:'polygon'}>,r:GeometryRelationsResponse){
  const vertices=board.regular?board.vertices.map((id,i)=>({...polar(move(0,0),30,board.rotation+i*360/board.vertices.length),id})):
    board.shape.vertices;
  const {at}=projection(vertices,282,139);
  const pairs=r.pairs.map(([a,b])=>[vertices.find(v=>v.id===a),vertices.find(v=>v.id===b)] as const);
  const diagonals=pairs.map(([a,b])=>a&&b?line(at(a),at(b),gold,2):'').join('');
  return svg(282,139,polygon(vertices.map(at))+diagonals+vertices.map(v=>pin(at(v),v.id,
    `data-geo-point="${v.id}" style="cursor:pointer"`)).join(''),
    `${vertices.length}-kulmio. Lävistäjät: ${r.pairs.map(pair=>pair.join('–')).join(', ')||'ei vielä'}`);
}

function scaleArt(board:Extract<GeometryRelationsBoard,{kind:'scale'}>){
  return `<table style="width:100%;text-align:center"><thead><tr><th>Mittalappu</th><th>Alkuperäinen</th><th>Uusi malli</th></tr></thead>
    <tbody>${board.rows.map(r=>`<tr><th>${r.label}</th><td>${r.source}</td><td>${r.target}</td></tr>`).join('')}</tbody></table>`;
}
interface View {extended:boolean;overlay:boolean;reflection:boolean}
const initialView=():View=>({extended:false,overlay:false,reflection:false});
function drawing(task:GeometryRelationsTask,r:GeometryRelationsResponse,view:View){
  const board=task.board;
  let result:string;
  switch(board.kind){
    case 'shapes': result=figures(board.shapes)+(view.overlay?rigidOverlay(board,r,view.reflection,task.action?.kind==='match'&&task.action.invariant==='similar'):'');break;
    case 'criterion': result=`<strong>Riittävät tiedot</strong>${figures(board.shapes.slice(0,2),board.facts)}
      <strong>Heikomman tiedon kokeet</strong>${figures(board.shapes.slice(2),board.weakFacts)}`;break;
    case 'ray':result=rays(board,r);break;
    case 'construction':result=constructArt(board,r);break;
    case 'paths':result=pathArt(board);break;
    case 'lines':result=linesArt(board,view.extended);break;
    case 'sectors':result=angleArt(board);break;
    case 'triangle':result=triangleArt(board,r);break;
    case 'polygon':result=polygonArt(board,r);break;
    case 'scale':result=scaleArt(board);break;
  }
  return result+(board.note?`<p class="small" style="margin:3px 0 0">${board.note}</p>`:'');
}

const makeOption=(id:string,label=id):GeoOption=>({id,label});
const criteria:readonly GeoOption[]=[
  makeOption('SSS','SSS · kolme sivua'),makeOption('SAS','SAS · sivu, välikulma, sivu'),
  makeOption('ASA','ASA · kulma, välisivu, kulma'),makeOption('AAS','AAS · kaksi kulmaa, muu sivu'),
  makeOption('AA','AA · kaksi kulmaa'),makeOption('ratioSSS','SSS · kolme sivusuhdetta'),
  makeOption('ratioSAS','SAS · kaksi sivusuhdetta ja välikulma'),
  makeOption('AAA','AAA · kolme kulmaa'),makeOption('SSA','SSA · sivut ja niiden ulkopuolinen kulma'),
];

export function mountGeometryRelations(task:GeometryRelationsTask,host:HTMLElement,submit:(r:GeometryRelationsResponse)=>void):{reveal():void}{
  let answer=emptyGeometryRelations(),locked=false;
  const {board,action}=task,view=initialView();
  const art=h('div',{class:'exp-exact geometry-relations-board','data-geo-rel-board':board.kind,style:'display:block'});
  const controls=h('div',{style:row});
  const done=h('button',{type:'submit',class:'btn primary'},'Tarkista');
  const note=h('p',{'aria-live':'polite',style:'margin:0;font-size:13px'});
  const form=h('form',{class:'stack',style:'gap:5px'},art,controls,note);
  const switches:((r:GeometryRelationsResponse)=>void)[]=[];
  const numeric=new Set<string>();
  const redraw=()=>{art.innerHTML=drawing(task,answer,view);};
  const group=(...children:(HTMLElement|null)[])=>h('div',{style:`${row};width:100%`},...children);
  function select(label:string,options:readonly GeoOption[],change:(value:string)=>void,source:(r:GeometryRelationsResponse)=>string,width=112){
    const input=h('select',{'aria-label':label,style:fieldStyle},h('option',{value:''},'Valitse'),
      ...options.map(option=>h('option',{value:option.id},option.label)));
    input.addEventListener('change',()=>change(input.value));
    switches.push(r=>{input.value=source(r);});
    return {input,node:h('label',{style:`display:grid;gap:2px;font-size:13px;flex:1 1 ${width}px;min-width:0`},label,input)};
  }
  function number(id:string,label:string){
    numeric.add(id);
    const input=h('input',{type:'text',inputmode:'decimal','aria-label':label,style:fieldStyle});
    input.addEventListener('input',()=>{answer.values[id]=input.value;if(view.overlay)redraw();});
    switches.push(r=>{input.value=r.values[id]??'';});
    return h('label',{style:'display:grid;gap:2px;font-size:13px;flex:1 1 105px;min-width:0'},label,input);
  }
  function pick(id:string,label:string,options:readonly GeoOption[],width?:number){
    return select(label,options,value=>{answer.values[id]=value;},r=>r.values[id]??'',width).node;
  }
  function set(id:string,label:string,options:readonly GeoOption[],submitButton:HTMLElement|null=null){
    const toggles=options.map(o=>{
      const input=h('input',{type:'checkbox',value:o.id,'aria-label':o.label});
      input.addEventListener('change',()=>{answer.sets[id]=toggles.filter(item=>item.input.checked).map(item=>item.input.value);});
      return {input,node:h('label',{style:`${row};align-items:center;min-height:44px;min-width:44px;font-size:13px`},input,o.label)};
    });
    switches.push(r=>toggles.forEach(({input})=>{input.checked=r.sets[id]?.includes(input.value)??false;}));
    return h('fieldset',{style:'border:1px solid #a2b9aa;border-radius:8px;padding:0 5px;width:100%;min-width:0'},
      h('legend',{class:'small'},label),group(...toggles.map(item=>item.node),submitButton));
  }
  function viewButton(text:string,setting:keyof View,other=text){
    const element=button(text,()=>{
      view[setting]=!view[setting];element.textContent=view[setting]?other:text;
      element.setAttribute('aria-pressed',String(view[setting]));redraw();
    });
    element.setAttribute('aria-pressed',String(view[setting]));return element;
  }
  if(board.kind==='lines')controls.append(viewButton('Jatka suoria','extended','Näytä rajattu piirros'));
  if(action?.kind==='match'&&board.kind==='shapes'){
    const [original,...variants]=board.shapes;
    const updateOptions=(id:string)=>{
      const vertices=variants.find(shape=>shape.id===id)?.vertices??[];
      for(const field of mapping){
        const input=field.input;
        input.replaceChildren(h('option',{value:''},'Valitse'),...vertices.map(p=>h('option',{value:p.id},p.id)));
      }
    };
    const selected=select('Sovitettava malli',variants.map(v=>makeOption(v.id,v.label)),value=>{
      answer.values.target=value;answer.pairs=[];updateOptions(value);redraw();
    },r=>r.values.target??'',118);
    const mapping=original!.vertices.map(v=>select(`Kärjen ${v.id} vastine`,[],value=>{
      answer.pairs=answer.pairs.filter(pair=>pair[0]!==v.id);
      if(value)answer.pairs.push([v.id,value]);redraw();
    },r=>r.pairs.find(pair=>pair[0]===v.id)?.[1]??'',74));
    // Set target-dependent menu options before restoring individual correspondence values.
    switches.unshift(r=>updateOptions(r.values.target??''));
    controls.append(group(selected.node,action.invariant==='similar'?number('factor','Pituuskerroin'):null),
      group(...mapping.map(m=>m.node)),group(viewButton('Sovita ääriviivat','overlay','Piilota sovitus'),viewButton('Peilaa sovitus','reflection','Peru peilaus')));
  }
  if(action?.kind==='criterion'&&board.kind==='criterion'){
    const [left,right,...others]=board.shapes;
    const options=right!.vertices.map(v=>makeOption(v.id));
    const maps=left!.vertices.map(v=>select(`Kärjen ${v.id} vastine`,options,value=>{
      answer.pairs=answer.pairs.filter(pair=>pair[0]!==v.id);
      if(value)answer.pairs.push([v.id,value]);
    },r=>r.pairs.find(pair=>pair[0]===v.id)?.[1]??'',70).node);
    const visible=criteria.filter(o=>action.invariant==='similar'?['AA','ratioSSS','ratioSAS','SSA'].includes(o.id):
      ['SSS','SAS','ASA','AAS','AAA','SSA'].includes(o.id));
    controls.append(group(...maps,pick('criterion','Riittävä kriteeri',visible,160)));
    controls.append(set('counterexamples','Valitse kaksi vastaesimerkkiä, joissa heikko tieto täsmää',others.map(o=>makeOption(o.id,o.label)),done));
  }
  if(action?.kind==='ray'&&board.kind==='ray'){
    const points=board.marks.map(p=>makeOption(p.id));
    const first=select('Puolisuoran alkupiste',points,value=>{answer.points[0]=value;redraw();},r=>r.points[0]??'');
    const second=select('Suuntaa kohti pistettä',points,value=>{answer.points[1]=value;redraw();},r=>r.points[1]??'');
    art.addEventListener('click',event=>{
      if(locked)return;
      const id=(event.target as Element).closest('[data-geo-point]')?.getAttribute('data-geo-point');
      if(!id)return;
      if(!answer.points[0]||answer.points[1])answer.points=[id];
      else answer.points[1]=id;
      first.input.value=answer.points[0]??'';second.input.value=answer.points[1]??'';redraw();
    });
    controls.append(group(first.node,second.node));
  }
  if(action?.kind==='construct'&&board.kind==='construction'){
    answer.circles=board.initial?.map(circle=>({...circle}))??[];
    const centers=[makeOption(board.a.id),makeOption(board.b.id)];
    const center=select('Kaaren keskipiste',centers,()=>{},()=>'',90);
    const radius=select('Kaaren säde',board.radii.map(v=>makeOption(String(v))),()=>{},()=>'',85);
    const cutMenu=select('Lisää leikkauspiste', ['P','Q','A','B','M'].map(id=>makeOption(id)),()=>{},()=>'',99);
    const result=h('p',{'data-geo-cuts':'',style:'margin:0;font-size:13px'});
    const cutStatus=()=>{result.textContent=answer.intersections.length?`Valitut pisteet: ${answer.intersections.join(' ja ')}`:'Valitse kaksi leikkauspistettä.';};
    const addCut=(id:string)=>{
      if(!id)return;
      if(answer.intersections.includes(id))answer.intersections=answer.intersections.filter(v=>v!==id);
      else answer.intersections=[...answer.intersections.slice(-1),id];
      cutStatus();redraw();
    };
    art.addEventListener('click',event=>{
      if(locked)return;
      const id=(event.target as Element).closest('[data-geo-cut]')?.getAttribute('data-geo-cut');
      if(id)addCut(id);
    });
    controls.append(group(center.node,radius.node,button('Piirrä kaari',()=>{
      if(!center.input.value||!radius.input.value){note.textContent='Valitse keskipiste ja säde.';return;}
      answer.circles=answer.circles.filter(circle=>circle.center!==center.input.value);
      answer.circles.push({center:center.input.value,radius:radius.input.value});
      answer.intersections=[];note.textContent='';cutStatus();redraw();
    }),button('Poista kaaret',()=>{answer.circles=[];answer.intersections=[];cutStatus();redraw();})),
      group(cutMenu.node,button('Merkitse piste',()=>addCut(cutMenu.input.value)),result),
      group(number('distanceA','Pisteen etäisyys A:han'),number('distanceB','Pisteen etäisyys B:hen'),number('angle','Suorien kulma (°)')));
    cutStatus();switches.push(cutStatus);
  }
  if(action?.kind==='angle-model'){
    const result=h('p',{'data-geo-angles':'',style:'margin:0;font-size:13px'});
    const update=()=>{result.textContent=answer.points.length?`Suoralla: ${answer.points.join(' · ')}`:'Tuo kärkikulmat suoralle.';redraw();};
    controls.append(group(...['A','B','C'].map(id=>button(`Siirrä ${id}`,()=>{
      if(answer.points.length<3){answer.points.push(id);update();}
    })),button('Kumoa kulma',()=>{answer.points.pop();update();}),result));
    switches.push(update);update();
  }
  if(action?.kind==='triangulate'&&board.kind==='polygon'){
    const options=polygonVertexIds(board).map(id=>makeOption(id));
    const first=select('Lävistäjän alku',options,()=>{},()=>'',85),second=select('Lävistäjän loppu',options,()=>{},()=>'',85);
    const summary=h('p',{'data-geo-diagonals':'',style:'margin:0;font-size:13px'});
    const update=()=>{summary.textContent=answer.pairs.length?answer.pairs.map(pair=>pair.join('–')).join(' · '):'Lävistäjiä ei vielä ole.';redraw();};
    const add=()=>{
      const a=first.input.value,b=second.input.value;
      if(a&&b&&answer.pairs.length<8){answer.pairs.push([a,b]);first.input.value='';second.input.value='';update();}
    };
    art.addEventListener('click',event=>{
      if(locked)return;
      const id=(event.target as Element).closest('[data-geo-point]')?.getAttribute('data-geo-point');
      if(!id)return;
      if(!first.input.value)first.input.value=id;
      else{second.input.value=id;add();}
    });
    controls.append(group(first.node,second.node,button('Piirrä lävistäjä',add),button('Kumoa',()=>{answer.pairs.pop();update();})),summary);
    switches.push(update);update();
  }
  const numberFields=task.fields.filter(field=>field.kind==='number');
  const others=task.fields.filter(field=>field.kind!=='number');
  if(numberFields.length)controls.append(group(...numberFields.map(field=>number(field.id,field.label))));
  if(others.length)controls.append(group(...others.map(field=>field.kind==='choice'?pick(field.id,field.label,field.options):
    field.kind==='set'?set(field.id,field.label,field.options):null)));
  if(action?.kind!=='criterion')form.append(h('div',{},done));
  form.addEventListener('submit',event=>{
    event.preventDefault();
    if(locked)return;
    locked=true;
    const values={...answer.values};
    for(const id of numeric){
      const raw=values[id]??'';
      if(raw.length>40||!parseMeasure(raw))values[id]='';
    }
    submit({...answer,values});
  });
  host.append(form);redraw();
  return {reveal(){
    locked=true;answer=solutionGeometryRelations(task);
    view.extended=board.kind==='lines';
    if(action?.kind==='match'&&board.kind==='shapes'){view.overlay=true;view.reflection=matchedReflection(board,answer);}
    for(const apply of switches)apply(answer);
    redraw();
    form.querySelectorAll('input,button,select').forEach(el=>el.setAttribute('disabled',''));
  }};
}

export function geometryRelationsExample(task:GeometryRelationsTask):Paint {
  const answer=solutionGeometryRelations(task);
  const view=initialView();
  view.extended=task.board.kind==='lines';
  if(task.action?.kind==='match'&&task.board.kind==='shapes'){
    view.overlay=true;view.reflection=matchedReflection(task.board,answer);
  }
  return host=>{
    const result=task.fields.map(field=>{
      const value=field.kind==='number'?field.answer:field.kind==='choice'?field.options.find(o=>o.id===field.answer)?.label:
        field.answer.map(id=>field.options.find(o=>o.id===id)?.label).join(', ');
      return `<li><strong>${field.label}</strong> · ${value}</li>`;
    });
    if(answer.pairs.length)result.push(`<li>${answer.pairs.map(pair=>pair.join('–')).join(' · ')}</li>`);
    if(answer.values.criterion)result.push(`<li>${criteria.find(c=>c.id===answer.values.criterion)?.label}. Kokeet ${answer.sets.counterexamples?.join(' ja ')}.</li>`);
    if(task.action?.kind==='construct')result.push(`<li>PA ja PB ovat molemmat ${answer.values.distanceA}. Keskinormaali muodostaa 90° kulman janan kanssa.</li>`);
    if(answer.values.factor)result.push(`<li>Pituuskerroin ${answer.values.factor}</li>`);
    host.innerHTML=`<div class="exp-exact geometry-relations-board">${drawing(task,answer,view)}</div>`+
      (result.length?`<ul style="padding-inline-start:1.2rem;margin:.35rem 0">${result.join('')}</ul>`:'');
  };
}
