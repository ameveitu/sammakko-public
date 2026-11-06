import { parseMeasure } from './spatial-measures';

export type PlanePoint = { id:string; x:number; y:number };
export type PlaneSegment = readonly [string,string];
export type PlanePolygon = readonly PlanePoint[];
export type AreaUnit = 'mm²'|'cm²'|'dm²'|'m²';
type LengthUnit = 'cm'|'m';
type BaseLine = { base:PlaneSegment; apex:string; feet:readonly PlanePoint[] };
export type TriangleBoard = { name:string; polygon:PlanePolygon; lines:readonly BaseLine[] };
type PerimeterTask = {
  mode:'perimeter'; polygon:PlanePolygon; missing:PlaneSegment; guides:readonly PlaneSegment[]; unit:LengthUnit;
};
type TriangleTask = { mode:'triangle'; boards:readonly TriangleBoard[]; unit:LengthUnit };
type PartitionTask = {
  mode:'partition'; polygon:PlanePolygon; hole?:PlanePolygon; unit:LengthUnit; shape:'quad'|'composite';
  altitude?:BaseLine & { upper:PlaneSegment };
};
type ConvertTask = { mode:'conversion'; from:AreaUnit; to:AreaUnit; amount:string };
export type PlaneMeasuresTask = (PerimeterTask|TriangleTask|PartitionTask|ConvertTask) & {kind:'plane-measures'; title:string};

export type AltitudeResponse = { base?:PlaneSegment; apex?:string; foot?:string };
export type TriangleResponse = AltitudeResponse & { baseLength?:string; height?:string; area?:string };
export type PlaneMeasuresResponse =
  | {kind:'plane-measures';mode:'perimeter';route:readonly string[];missing?:string;value?:string;unit:string}
  | {kind:'plane-measures';mode:'triangle';rows:readonly TriangleResponse[];unit:string}
  | {kind:'plane-measures';mode:'partition';cuts:readonly PlaneSegment[];areas:Readonly<Record<string,string>>;
      altitude?:AltitudeResponse;lower?:string;upper?:string;height?:string;hole?:string;value?:string;unit:string}
  | {kind:'plane-measures';mode:'conversion';axes:readonly string[];factor?:string;direction?:'multiply'|'divide';
      value?:string;unit:string};

const kind = 'plane-measures' as const;
const key = (a:string,b:string) => [a,b].sort().join('–');
export const segmentName = (segment:PlaneSegment) => segment.join('–');
export const faceKey = (polygon:PlanePolygon) => polygon.map(point=>point.id).sort().join('');
const findPoint = (points:PlanePolygon,id:string|undefined) => points.find(point=>point.id===id);
const same = (a:unknown,b:PlaneSegment) => Array.isArray(a)&&a.length===2
  && ((a[0]===b[0]&&a[1]===b[1])||(a[0]===b[1]&&a[1]===b[0]));
const cross = (a:PlanePoint,b:PlanePoint,c:PlanePoint) => (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
const dot = (a:PlanePoint,b:PlanePoint,c:PlanePoint) => (b.x-a.x)*(c.x-a.x)+(b.y-a.y)*(c.y-a.y);
const span = (a:PlanePoint,b:PlanePoint) => Math.hypot(b.x-a.x,b.y-a.y);
const on = (a:PlanePoint,b:PlanePoint,p:PlanePoint) => cross(a,b,p)===0&&dot(p,a,b)<=0;
const edges = (polygon:PlanePolygon) => polygon.map((a,i)=>[a,polygon[(i+1)%polygon.length]!] as const);
export const polygonSides = (polygon:PlanePolygon):readonly PlaneSegment[] => edges(polygon).map(([a,b])=>[a.id,b.id]);
export const twicePlaneArea = (polygon:PlanePolygon) => Math.abs(edges(polygon).reduce((n,[a,b])=>n+a.x*b.y-a.y*b.x,0));
export function planeLength(polygon:PlanePolygon,segment:PlaneSegment) {
  return span(findPoint(polygon,segment[0])!,findPoint(polygon,segment[1])!);
}
export function shownPerimeterSides(task:PerimeterTask) {
  return polygonSides(task.polygon).map(edge=>({edge,length:same(edge,task.missing)?undefined:planeLength(task.polygon,edge)}));
}

function intersects(a:PlanePoint,b:PlanePoint,c:PlanePoint,d:PlanePoint) {
  const x=cross(a,b,c),y=cross(a,b,d),u=cross(c,d,a),v=cross(c,d,b);
  return x*y<0&&u*v<0||on(a,b,c)||on(a,b,d)||on(c,d,a)||on(c,d,b);
}
function inside(polygon:PlanePolygon,point:PlanePoint) {
  let contained=false;
  for(const [a,b] of edges(polygon)){
    if(on(a,b,point))return false;
    if((a.y>point.y)===(b.y>point.y))continue;
    if((cross(a,b,point)>0)===(b.y>a.y))contained=!contained;
  }
  return contained;
}
function actualChord(polygon:PlanePolygon,a:PlanePoint,b:PlanePoint) {
  for(const [c,d] of edges(polygon)){
    const shared=[c,d].filter(point=>point.id===a.id||point.id===b.id);
    if(shared.length===2)return false;
    if(shared.length===1){
      const endpoint=shared[0]!,other=endpoint.id===c.id?d:c;
      const inward=endpoint.id===a.id?b:a;
      if(cross(endpoint,other,inward)===0&&dot(endpoint,other,inward)>0)return false;
    }else if(intersects(a,b,c,d))return false;
  }
  return inside(polygon,{id:'mid',x:(a.x+b.x)/2,y:(a.y+b.y)/2});
}
function removeStraight(polygon:PlanePolygon):PlanePolygon {
  return polygon.filter((point,i)=>cross(polygon[(i-1+polygon.length)%polygon.length]!,point,polygon[(i+1)%polygon.length]!)!==0);
}

/** Sequential splitting enforces two simple disjoint faces per internal chord. */
export function planeFaces(polygon:PlanePolygon,cuts:unknown):readonly PlanePolygon[]|undefined {
  if(!Array.isArray(cuts)||cuts.length>Math.max(0,polygon.length-3))return;
  const parts:PlanePolygon[]=[polygon],used=new Set<string>();
  for(const cut of cuts){
    if(!Array.isArray(cut)||cut.length!==2||typeof cut[0]!=='string'||typeof cut[1]!=='string'||cut[0]===cut[1])return;
    const id=key(cut[0],cut[1]);
    if(used.has(id))return;
    const i=parts.findIndex(part=>{
      const a=findPoint(part,cut[0]),b=findPoint(part,cut[1]);
      return !!a&&!!b&&actualChord(part,a,b);
    });
    if(i<0)return;
    const part=parts[i]!;
    const sorted=[part.findIndex(p=>p.id===cut[0]),part.findIndex(p=>p.id===cut[1])].sort((a,b)=>a-b);
    const [a,b]=sorted as [number,number];
    parts.splice(i,1,part.slice(a,b+1),[...part.slice(b),...part.slice(0,a+1)]);
    used.add(id);
  }
  const normalized=parts.map(removeStraight);
  if(normalized.some(face=>face.length<3||twicePlaneArea(face)<=0)
    ||normalized.reduce((sum,face)=>sum+twicePlaneArea(face),0)!==twicePlaneArea(polygon))return;
  return normalized;
}
function altitude(points:PlanePolygon,line:BaseLine,given:AltitudeResponse|undefined) {
  if(!given||!same(given.base,line.base)||given.apex!==line.apex)return;
  const [a,b]=line.base.map(id=>findPoint(points,id)!) as [PlanePoint,PlanePoint];
  const tip=findPoint(points,line.apex)!;
  const foot=findPoint([...points,...line.feet],given.foot);
  if(!foot||cross(a,b,foot)!==0||(b.x-a.x)*(tip.x-foot.x)+(b.y-a.y)*(tip.y-foot.y)!==0)return;
  return {base:span(a,b),height:span(tip,foot)};
}
function sampleAltitude(points:PlanePolygon,line:BaseLine):AltitudeResponse {
  const base=line.base,apex=line.apex;
  const foot=[...points,...line.feet].find(({id})=>altitude(points,line,{base,apex,foot:id}))!.id;
  return {base,apex,foot};
}

const math=(raw:unknown)=>typeof raw==='string'&&raw.length<=32?parseMeasure(raw):undefined;
export const planeNumericInput=(text:string)=>math(text)?text.trim():'';
const exact=(raw:unknown,n:number|bigint,d:number|bigint=1) => {
  const value=math(raw);
  return !!value&&Number.isInteger(Number(n))&&value[0]*BigInt(d)===value[1]*BigInt(n);
};
const fraction=(n:number,d:number)=>n%d===0?String(n/d):`${n}/${d}`;
const millimetres:Readonly<Record<AreaUnit,number>>={'mm²':1,'cm²':10,'dm²':100,'m²':1000};
export function areaUnitConversion(task:ConvertTask) {
  const from=millimetres[task.from],to=millimetres[task.to];
  const step=Math.max(from,to)/Math.min(from,to),factor=step*step,up=from>to;
  const [n,d]=parseMeasure(task.amount)!;
  const answer=up?[n*BigInt(factor),d] as const:[n,d*BigInt(factor)] as const;
  return {step,factor,direction:up?'multiply' as const:'divide' as const,answer};
}

const pass={ok:true};
const fail=(why:string)=>({ok:false,why});
const own=(o:object,k:string)=>Object.prototype.hasOwnProperty.call(o,k);
function validRoute(polygon:PlanePolygon,route:readonly string[]) {
  if(!Array.isArray(route)||route.length!==polygon.length+1||route[0]!==route[polygon.length])return false;
  const start=polygon.findIndex(p=>p.id===route[0]),n=polygon.length;
  return start>=0&&[1,-1].some(dir=>polygon.every((_,i)=>route[i]===polygon[(start+dir*i+n)%n]!.id));
}
function validParts(task:PartitionTask,faces:readonly PlanePolygon[]|undefined) {
  if(!faces||faces.length<2||faces.some(face=>face.length!==3&&face.length!==4))return false;
  return task.shape==='quad'||faces.some(face=>face.length===3)&&faces.some(face=>face.length===4);
}
export function checkPlaneMeasures(task:PlaneMeasuresTask,r:PlaneMeasuresResponse):{ok:boolean;why?:string} {
  if(!r||r.kind!==kind||r.mode!==task.mode)return fail('Täydennä tämän kartan mittamerkinnät.');
  if(task.mode==='perimeter'&&r.mode==='perimeter'){
    if(!validRoute(task.polygon,r.route))return fail('Kulje kaikki ulkoreunat kerran ja palaa alkuun. Apuviiva kulkee pihan sisällä.');
    if(!exact(r.missing,planeLength(task.polygon,task.missing)))return fail('Päättele puuttuva mitta samansuuntaisista annetuista sivuista.');
    const sum=edges(task.polygon).reduce((total,[a,b])=>total+span(a,b),0);
    return exact(r.value,sum)&&r.unit===task.unit?pass:fail('Laske ulkoreunojen pituudet yhteen ja käytä pituusyksikköä.');
  }
  if(task.mode==='triangle'&&r.mode==='triangle'){
    if(!Array.isArray(r.rows)||r.rows.length!==task.boards.length)return fail('Rakenna jokaisen kolmion korkeus.');
    for(const [i,board] of task.boards.entries()){
      const row=r.rows[i];
      const line=board.lines.find(line=>same(row?.base,line.base));
      const measure=line&&altitude(board.polygon,line,row);
      if(!measure)return fail(`${board.name}. Korkeus kohtaa valitun kannan suoran kohtisuorasti, myös kannan jatkeella.`);
      if(!exact(row!.baseLength,measure.base)||!exact(row!.height,measure.height)||!exact(row!.area,twicePlaneArea(board.polygon),2))
        return fail('Kerro kannan pituus sen kohtisuoralla korkeudella ja jaa kahdella.');
    }
    return r.unit===task.unit+'²'?pass:fail('Kolmion pinta-ala tarvitsee neliöyksikön.');
  }
  if(task.mode==='partition'&&r.mode==='partition'){
    const faces=planeFaces(task.polygon,r.cuts);
    if(!validParts(task,faces))return fail(task.shape==='composite'
      ?'Jaa ulkoalue ainakin yhteen kolmioon ja yhteen nelikulmioon. Osat täyttävät alueen ilman päällekkäisyyttä.'
      :'Tee vähintään yksi alueen sisäinen leikkaus. Osat täyttävät koko nelikulmion ilman päällekkäisyyttä.');
    if(task.altitude){
      const measure=altitude(task.polygon,task.altitude,r.altitude);
      if(!measure||!exact(r.height,measure.height)||!exact(r.lower,measure.base)||!exact(r.upper,planeLength(task.polygon,task.altitude.upper)))
        return fail('Merkitse molemmat kannat ja niiden kohtisuora väli. Vinon sivun mitta voi olla eri.');
    }
    if(!r.areas||typeof r.areas!=='object'||Object.keys(r.areas).length!==faces!.length
      ||faces!.some(face=>!own(r.areas,faceKey(face))||!exact(r.areas[faceKey(face)],twicePlaneArea(face),2)))
      return fail('Kirjaa jokaisen itse rajatun osan pinta-ala erikseen.');
    const hole=task.hole?twicePlaneArea(task.hole):0;
    if(task.hole&&!exact(r.hole,hole,2))return fail('Laske myös peitteeseen jätettävä aukko ja vähennä se vain kerran.');
    return exact(r.value,twicePlaneArea(task.polygon)-hole,2)&&r.unit===task.unit+'²'?pass:
      fail('Yhdistä osien alat, vähennä mahdollinen aukko ja merkitse neliöyksikkö.');
  }
  if(task.mode==='conversion'&&r.mode==='conversion'){
    const {step,factor,direction,answer}=areaUnitConversion(task);
    if(!Array.isArray(r.axes)||r.axes.length!==2||!exact(r.axes[0],step)||!exact(r.axes[1],step))
      return fail('Merkitse pituuden muunnoskerroin erikseen leveyteen ja korkeuteen.');
    if(!exact(r.factor,factor)||r.direction!==direction)
      return fail('Kerro pituuden kerroin itsellään. Tarkista, kasvaako vai pieneneekö ruutujen lukumäärä.');
    return exact(r.value,answer[0],answer[1])&&r.unit===task.to?pass:fail('Muunna sama alue uudeksi lukuarvoksi ja neliöyksiköksi.');
  }
  return fail('Täydennä tämän kartan mittamerkinnät.');
}

function sampleCuts(task:PartitionTask):PlaneSegment[] {
  const candidates=task.polygon.flatMap((a,i)=>task.polygon.slice(i+1).map(b=>[a.id,b.id] as const));
  const single=candidates.find(cut=>validParts(task,planeFaces(task.polygon,[cut])));
  if(single)return [single];
  for(const [i,first] of candidates.entries())for(const second of candidates.slice(i+1))
    if(validParts(task,planeFaces(task.polygon,[first,second])))return [first,second];
  throw new Error('No partition for the authored polygon');
}
export function solutionPlaneMeasures(task:PlaneMeasuresTask):PlaneMeasuresResponse {
  if(task.mode==='perimeter')return {kind,mode:'perimeter',route:[...task.polygon.map(p=>p.id),task.polygon[0]!.id],
    missing:String(planeLength(task.polygon,task.missing)),value:String(edges(task.polygon).reduce((n,[a,b])=>n+span(a,b),0)),unit:task.unit};
  if(task.mode==='triangle')return {kind,mode:'triangle',unit:task.unit+'²',rows:task.boards.map(board=>{
    const line=board.lines[0]!,placed=sampleAltitude(board.polygon,line),m=altitude(board.polygon,line,placed)!;
    return {...placed,baseLength:String(m.base),height:String(m.height),area:fraction(twicePlaneArea(board.polygon),2)};
  })};
  if(task.mode==='partition'){
    const cuts=sampleCuts(task),faces=planeFaces(task.polygon,cuts)!;
    const placed=task.altitude&&sampleAltitude(task.polygon,task.altitude);
    const m=task.altitude&&altitude(task.polygon,task.altitude,placed);
    const hole=task.hole?twicePlaneArea(task.hole):0;
    return {kind,mode:'partition',cuts,areas:Object.fromEntries(faces.map(face=>[faceKey(face),fraction(twicePlaneArea(face),2)])),
      ...(placed&&m&&task.altitude?{altitude:placed,lower:String(m.base),upper:String(planeLength(task.polygon,task.altitude.upper)),height:String(m.height)}:{}),
      ...(task.hole?{hole:fraction(hole,2)}:{}),value:fraction(twicePlaneArea(task.polygon)-hole,2),unit:task.unit+'²'};
  }
  const {step,factor,direction,answer:[n,d]}=areaUnitConversion(task);
  return {kind,mode:'conversion',axes:[String(step),String(step)],factor:String(factor),direction,value:n%d===0n?String(n/d):`${n}/${d}`,unit:task.to};
}
export function wrongPlaneMeasuresResponses(task:PlaneMeasuresTask):PlaneMeasuresResponse[] {
  const answer=solutionPlaneMeasures(task);
  switch(answer.mode){
    case 'perimeter':return [{...answer,route:answer.route.slice(0,-1)},{...answer,value:'0'}];
    case 'triangle':return [{...answer,rows:[]},{...answer,rows:answer.rows.map(row=>({...row,height:'0'}))}];
    case 'partition':return [{...answer,cuts:[]},{...answer,areas:{}}];
    case 'conversion':return [{...answer,factor:'1'},{...answer,axes:['0','0']}];
  }
}
