import type { Verdict } from '../../engine/types';
import { parseMeasure,sameMeasure } from './spatial-measures';

export interface GeoPoint { x:number; y:number }
export interface GeoMark extends GeoPoint { id:string }
export interface GeoShape { id:string; label:string; vertices:readonly GeoMark[] }
export interface GeoOption { id:string; label:string }
export type GeoFact={kind:'side';a:number;b:number}|{kind:'angle';at:number};
export type Criterion='SSS'|'SAS'|'ASA'|'AAS'|'AA'|'ratioSSS'|'ratioSAS';
export type GeometryRelationField =
  | {kind:'number';id:string;label:string;answer:string}
  | {kind:'choice';id:string;label:string;options:readonly GeoOption[];answer:string}
  | {kind:'set';id:string;label:string;options:readonly GeoOption[];answer:readonly string[]};
type MeasureRow={label:string;source:string;target:string};
export type GeoPath =
  | {id:string;points:readonly GeoPoint[];closed:boolean;segments:'lines'}
  | {id:string;points:readonly [GeoPoint,GeoPoint,GeoPoint];closed:boolean;segments:'curve'};
export interface GeoSector { id:string;start:number;size:number;shown:boolean }
export type GeometryRelationsBoard =
  | {kind:'shapes';shapes:readonly GeoShape[]; note?:string}
  | {kind:'criterion';shapes:readonly GeoShape[];facts:readonly GeoFact[];weakFacts:readonly GeoFact[];note?:string}
  | {kind:'ray';marks:readonly GeoMark[];note?:string}
  | {kind:'construction';a:GeoMark;b:GeoMark;radii:readonly number[];initial?:readonly {center:string;radius:string}[];note?:string}
  | {kind:'paths';paths:readonly GeoPath[];note?:string}
  | {kind:'lines';lines:readonly [readonly [GeoPoint,GeoPoint],readonly [GeoPoint,GeoPoint]];note?:string}
  | {kind:'sectors';sectors:readonly GeoSector[];bearings:readonly number[];note?:string}
  | {kind:'triangle';angles:readonly [number,number,number];hide:number|null;rotation?:number;note?:string}
  | {kind:'polygon';shape:GeoShape;regular:false;note?:string}
  | {kind:'polygon';vertices:readonly string[];regular:true;rotation:number;note?:string}
  | {kind:'scale';rows:readonly MeasureRow[];note?:string};

export type GeometryRelationAction =
  | {kind:'ray';start:string;direction:string}
  | {kind:'construct'}
  | {kind:'triangulate'}
  | {kind:'angle-model'}
  | {kind:'match';invariant:'congruent'|'similar'}
  | {kind:'criterion';invariant:'congruent'|'similar';expected:Criterion};

export interface GeometryRelationsTask {
  kind:'geometry-relations';board:GeometryRelationsBoard;fields:readonly GeometryRelationField[];
  action?:GeometryRelationAction;why:string;
}
export interface GeometryRelationsResponse {
  kind:'geometry-relations';
  values:Record<string,string>;sets:Record<string,string[]>;
  points:string[];pairs:string[][];circles:{center:string;radius:string}[];intersections:string[];
}
export const emptyGeometryRelations=():GeometryRelationsResponse=>
  ({kind:'geometry-relations',values:{},sets:{},points:[],pairs:[],circles:[],intersections:[]});

export const vector=(a:GeoPoint,b:GeoPoint):GeoPoint=>({x:b.x-a.x,y:b.y-a.y});
export const cross=(a:GeoPoint,b:GeoPoint)=>a.x*b.y-a.y*b.x;
export const dot=(a:GeoPoint,b:GeoPoint)=>a.x*b.x+a.y*b.y;
export const squareDistance=(a:GeoPoint,b:GeoPoint)=>{const d=vector(a,b);return dot(d,d);};
export const turn=(a:GeoPoint,b:GeoPoint,c:GeoPoint)=>cross(vector(a,b),vector(a,c));
const equalPosition=(a:GeoPoint,b:GeoPoint)=>a.x===b.x&&a.y===b.y;

function sameSet(actual:readonly string[],expected:readonly string[]){
  return actual.length===expected.length&&new Set(actual).size===actual.length&&expected.every(key=>actual.includes(key));
}
export function pairGeometry(source:readonly GeoPoint[],other:readonly GeoPoint[],invariant:'congruent'|'similar'){
  if(source.length!==other.length||source.length<3)return false;
  const a=squareDistance(source[0]!,source[1]!),b=squareDistance(other[0]!,other[1]!);
  if(a===0||b===0||(invariant==='congruent'&&a!==b))return false;
  // All pairwise squared distances preserve shape under translation, rotation and reflection.
  for(let i=0;i<source.length;i++)for(let j=i+1;j<source.length;j++){
    if(squareDistance(source[i]!,source[j]!)*b!==squareDistance(other[i]!,other[j]!)*a)return false;
  }
  return true;
}
export function shapePairings(a:GeoShape,b:GeoShape,invariant:'congruent'|'similar'){
  if(a.vertices.length!==b.vertices.length)return [];
  const n=b.vertices.length,solutions:string[][][]=[];
  for(let offset=0;offset<n;offset++)for(const direction of [1,-1]){
    const order=a.vertices.map((_,i)=>b.vertices[(offset+direction*i+n)%n]!);
    if(pairGeometry(a.vertices,order,invariant))solutions.push(a.vertices.map((p,i)=>[p.id,order[i]!.id]));
  }
  return solutions;
}
function pairedVertices(a:GeoShape,b:GeoShape,pairs:readonly string[][]){
  if(pairs.length!==a.vertices.length||pairs.some(pair=>pair.length!==2)||!sameSet(pairs.map(p=>p[0]!),a.vertices.map(v=>v.id)))return;
  const order=a.vertices.map(v=>b.vertices.find(target=>target.id===pairs.find(pair=>pair[0]===v.id)?.[1]));
  if(order.some(v=>!v)||new Set(order).size!==a.vertices.length)return;
  const matched=order as GeoMark[];
  const n=b.vertices.length;
  if(matched.some((v,i)=>{
    const step=Math.abs(b.vertices.indexOf(v)-b.vertices.indexOf(matched[(i+1)%n]!));
    return step!==1&&step!==n-1;
  }))return;
  return matched;
}
const twoSides=(facts:readonly GeoFact[])=>facts.filter((f):f is Extract<GeoFact,{kind:'side'}>=>f.kind==='side');
const twoAngles=(facts:readonly GeoFact[])=>facts.filter((f):f is Extract<GeoFact,{kind:'angle'}>=>f.kind==='angle');
export function geometryCriterion(facts:readonly GeoFact[],invariant:'congruent'|'similar'):Criterion|undefined {
  const sides=twoSides(facts),angles=twoAngles(facts);
  const sideKeys=new Set(sides.map(({a,b})=>[a,b].sort().join(',')));
  const angleKeys=new Set(angles.map(({at})=>at));
  const included=angles.some(angle=>sideKeys.size===2&&sides.every(side=>side.a===angle.at||side.b===angle.at));
  if(sideKeys.size===3)return invariant==='congruent'?'SSS':'ratioSSS';
  if(invariant==='similar')return angleKeys.size>=2?'AA':included?'ratioSAS':undefined;
  if(included)return 'SAS';
  if(angleKeys.size>=2&&sideKeys.size>=1){
    return sides.some(({a,b})=>angleKeys.has(a)&&angleKeys.has(b))?'ASA':'AAS';
  }
  return;
}
const anglesAt=(points:readonly GeoPoint[],i:number)=>{
  const p=points[i]!,a=vector(p,points[(i+1)%3]!),b=vector(p,points[(i+2)%3]!);
  return {cosSign:Math.sign(dot(a,b)),cosSquare:dot(a,b)**2,scale:dot(a,a)*dot(b,b)};
};
export function sameTriangleFacts(a:readonly GeoPoint[],b:readonly GeoPoint[],facts:readonly GeoFact[],invariant:'congruent'|'similar'){
  let sidePair:readonly [number,number]|undefined;
  return facts.every(fact=>{
    if(fact.kind==='side'){
      const aa=squareDistance(a[fact.a]!,a[fact.b]!),bb=squareDistance(b[fact.a]!,b[fact.b]!);
      if(invariant==='congruent')return aa===bb;
      if(!sidePair)sidePair=[aa,bb];
      return aa*sidePair[1]===bb*sidePair[0];
    }
    const aa=anglesAt(a,fact.at),bb=anglesAt(b,fact.at);
    return aa.cosSign===bb.cosSign&&aa.cosSquare*bb.scale===bb.cosSquare*aa.scale;
  });
}
export function pathClass(path:GeoPath){
  if(path.segments==='curve'&&turn(...path.points)!==0)return 'curved';
  return path.points.slice(2).some(point=>turn(path.points[0]!,path.points[1]!,point)!==0)?'polyline':'straight';
}
export function lineRelation(lines:Extract<GeometryRelationsBoard,{kind:'lines'}>['lines']){
  const [a,b]=lines.map(([start,end])=>vector(start,end));
  if(cross(a!,b!)===0)return turn(lines[0][0],lines[0][1],lines[1][0])===0?'coincident':'parallel';
  return dot(a!,b!)===0?'perpendicular':'intersecting';
}
export const validTriangleAngles=(a:readonly number[])=>a.length===3&&a.every(n=>Number.isInteger(n)&&n>0&&n<180)&&a.reduce((x,y)=>x+y,0)===180;
export const polygonAngleSum=(vertexCount:number)=>180*(vertexCount-2);

export function strictConvex(vertices:readonly GeoPoint[]){
  if(vertices.length<3)return false;
  // Every nonincident vertex must be strictly on the same side of each edge.
  const winding=Math.sign(turn(vertices[0]!,vertices[1]!,vertices[2]!));
  return winding!==0&&vertices.every((p,i)=>vertices.every((r,j)=>
    j===i||j===(i+1)%vertices.length||Math.sign(turn(p,vertices[(i+1)%vertices.length]!,r))===winding));
}
type PolygonBoard=Extract<GeometryRelationsBoard,{kind:'polygon'}>;
export const polygonVertexIds=(board:PolygonBoard)=>board.regular?board.vertices:board.shape.vertices.map(point=>point.id);
function nonCrossingDiagonals(ids:readonly string[],pairs:readonly string[][]){
  const n=ids.length;
  if(n<3||new Set(ids).size!==n||pairs.length!==n-3||pairs.some(p=>p.length!==2))return false;
  const diagonals=pairs.map(p=>p.map(id=>ids.indexOf(id)).sort((a,b)=>a-b));
  if(diagonals.some(([a,b])=>a===-1||b!<=a!+1||b!-a===n-1))return false;
  if(new Set(diagonals.map(diagonal=>diagonal.join(','))).size!==diagonals.length)return false;
  return diagonals.every(([a,b],i)=>diagonals.slice(i+1).every(([c,d])=>
    !(a!<c!&&c!<b!&&b!<d!||c!<a!&&a!<d!&&d!<b!)));
}
export function validDiagonals(shape:GeoShape,pairs:readonly string[][]){
  return strictConvex(shape.vertices)&&nonCrossingDiagonals(shape.vertices.map(point=>point.id),pairs);
}
export function compassRadius(a:GeoPoint,b:GeoPoint,text:string){
  const ratio=parseMeasure(text);
  if(!ratio||ratio[0]<=0n||ratio[0]>1000n*ratio[1])return;
  const [n,d]=ratio;
  if(4n * n * n <= BigInt(squareDistance(a,b))*d*d)return;
  return Number(n)/Number(d);
}
export function compassCuts(a:GeoPoint,b:GeoPoint,radius:number):readonly [GeoPoint,GeoPoint] {
  const delta=vector(a,b),length=Math.hypot(delta.x,delta.y);
  const height=Math.sqrt(radius*radius-length*length/4);
  const m={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
  const normal={x:-delta.y*height/length,y:delta.x*height/length};
  return [{x:m.x-normal.x,y:m.y-normal.y},{x:m.x+normal.x,y:m.y+normal.y}];
}

const fail=(why:string):Verdict=>({ok:false,why});
const pass:Verdict={ok:true};
const corners=['A','B','C'];
const intersectIds=['P','Q'];
function checkAction(task:GeometryRelationsTask,r:GeometryRelationsResponse):Verdict {
  const {board,action}=task;
  if(!action)return pass;
  switch(action.kind){
    case 'ray': {
      if(board.kind!=='ray'||r.points.length!==2)return fail('Valitse alkupiste ja toinen piste, joka määrää suunnan.');
      const [a,b]=r.points.map(id=>board.marks.find(p=>p.id===id));
      const start=board.marks.find(p=>p.id===action.start)!,target=board.marks.find(p=>p.id===action.direction)!;
      if(!a||!b||!equalPosition(a,start))return fail('Puolisuoralla on yksi määrätty alkupiste.');
      const intended=vector(start,target),chosen=vector(a,b);
      return cross(intended,chosen)===0&&dot(intended,chosen)>0?pass:fail('Puolisuoran pitää jatkua alkupisteestä pyydettyyn suuntaan.');
    }
    case 'angle-model':
      return sameSet(r.points,corners)?pass:fail('Aseta kaikki kolme eri kärkeä samalle suoralle yhteen ilman päällekkäisyyksiä.');
    case 'triangulate':
      return board.kind==='polygon'&&(board.regular?nonCrossingDiagonals(board.vertices,r.pairs):validDiagonals(board.shape,r.pairs))?pass:
        fail('Jaa kupera kuvio kolmioihin lävistäjillä, jotka eivät risteä toisiaan.');
    case 'construct': {
      if(board.kind!=='construction'||r.circles.length!==2||!sameSet(r.circles.map(circle=>circle.center),[board.a.id,board.b.id])){
        return fail('Piirrä yksi kaari janan kummastakin päätepisteestä.');
      }
      const first=r.circles[0]!.radius,second=r.circles[1]!.radius;
      if(!compassRadius(board.a,board.b,first)||!sameMeasure(first,second)||!board.radii.some(radius=>sameMeasure(first,String(radius)))){
        return fail('Käytä samaa sädettä molemmille kaarille. Säteen pitää olla yli puolet janan pituudesta.');
      }
      if(!sameSet(r.intersections,intersectIds))return fail('Valitse molemmat kaarien leikkauspisteet ja yhdistä ne suoraksi.');
      if(!sameMeasure(r.values.distanceA??'',first)||!sameMeasure(r.values.distanceB??'',first)||!sameMeasure(r.values.angle??'','90')){
        return fail('Tarkista valitun leikkauspisteen etäisyydet A:han ja B:hen sekä suoran ja janan välinen kulma.');
      }
      return pass;
    }
    case 'match': {
      if(board.kind!=='shapes')return fail(task.why);
      const [source,...candidates]=board.shapes,target=candidates.find(shape=>shape.id===r.values.target);
      const correspondence=source&&target?pairedVertices(source,target,r.pairs):undefined;
      if(!correspondence||!pairGeometry(source!.vertices,correspondence,action.invariant))return fail(task.why);
      if(action.invariant==='similar'){
        const scale=parseMeasure(r.values.factor??'');
        if(!scale||scale[0]<=0n||BigInt(squareDistance(source!.vertices[0]!,source!.vertices[1]!))*scale[0]**2n !==
          BigInt(squareDistance(correspondence[0]!,correspondence[1]!))*scale[1]**2n)return fail('Sama pituuskerroin kuuluu jokaiselle vastaavalle sivuparille.');
      }
      return pass;
    }
    case 'criterion': {
      if(board.kind!=='criterion')return fail(task.why);
      const [source,target,...others]=board.shapes;
      const paired=pairedVertices(source!,target!,r.pairs);
      if(!paired||!sameTriangleFacts(source!.vertices,paired,board.facts,action.invariant)||
        r.values.criterion!==action.expected||geometryCriterion(board.facts,action.invariant)!==action.expected){
        return fail('Osoita vastaavat kärjet ja valitse annettujen sivujen ja kulmien yhdessä takaama kriteeri.');
      }
      const examples=r.sets.counterexamples??[],figures=examples.map(id=>others.find(s=>s.id===id));
      if(figures.length!==2||!figures[0]||!figures[1]||examples[0]===examples[1]||
        !sameTriangleFacts(figures[0].vertices,figures[1].vertices,board.weakFacts,action.invariant)||
        shapePairings(figures[0],figures[1],action.invariant).length!==0){
        return fail('Valitse kaksi eri kolmiota, joissa heikot tiedot täsmäävät, mutta vaadittu muoto tai koko ei säily.');
      }
      return pass;
    }
  }
}

export function checkGeometryRelations(task:GeometryRelationsTask,r:GeometryRelationsResponse):Verdict {
  const action=checkAction(task,r);
  if(!action.ok)return action;
  for(const field of task.fields){
    const value=r.values[field.id]??'';
    const valid=field.kind==='set'?sameSet(r.sets[field.id]??[],field.answer):field.kind==='number'?sameMeasure(value,field.answer):value===field.answer;
    if(!valid)return fail(task.why);
  }
  return pass;
}

export function solutionGeometryRelations(task:GeometryRelationsTask):GeometryRelationsResponse {
  const r=emptyGeometryRelations(),{board,action}=task;
  for(const field of task.fields){
    if(field.kind==='set')r.sets[field.id]=[...field.answer];
    else r.values[field.id]=field.answer;
  }
  switch(action?.kind){
    case 'ray':r.points=[action.start,action.direction];break;
    case 'angle-model':r.points=[...corners];break;
    case 'triangulate':if(board.kind==='polygon'){
      const [pivot,...rest]=polygonVertexIds(board);
      r.pairs=rest.slice(1,-1).map(v=>[pivot!,v]);
    }break;
    case 'construct':if(board.kind==='construction'){
      const radius=String(board.radii.find(value=>compassRadius(board.a,board.b,String(value)))!);
      r.circles=[{center:board.a.id,radius},{center:board.b.id,radius}];
      r.intersections=[...intersectIds];r.values={distanceA:radius,distanceB:radius,angle:'90'};
    }break;
    case 'match':if(board.kind==='shapes'){
      const [source,...candidates]=board.shapes;
      const target=candidates.find(s=>shapePairings(source!,s,action.invariant).length)!;
      r.pairs=shapePairings(source!,target,action.invariant)[0]!;
      r.values.target=target.id;
      if(action.invariant==='similar'){
        const match=pairedVertices(source!,target,r.pairs)!;
        r.values.factor=String(Math.sqrt(squareDistance(match[0]!,match[1]!)/squareDistance(source!.vertices[0]!,source!.vertices[1]!)));
      }
    }break;
    case 'criterion':if(board.kind==='criterion'){
      const [source,target,...others]=board.shapes;
      r.pairs=shapePairings(source!,target!,action.invariant)[0]!;
      r.values.criterion=action.expected;
      for(let i=0;i<others.length;i++)for(let j=i+1;j<others.length;j++){
        if(sameTriangleFacts(others[i]!.vertices,others[j]!.vertices,board.weakFacts,action.invariant)&&
          !shapePairings(others[i]!,others[j]!,action.invariant).length)r.sets.counterexamples=[others[i]!.id,others[j]!.id];
      }
    }break;
  }
  return r;
}

export function wrongGeometryRelationsResponses(task:GeometryRelationsTask):GeometryRelationsResponse[]{
  const answer=solutionGeometryRelations(task);
  if(task.action){
    switch(task.action.kind){
      case 'ray':case 'angle-model':return [{...answer,points:[]}];
      case 'construct':return [{...answer,intersections:[]}];
      case 'match':case 'criterion':case 'triangulate':return [{...answer,pairs:[]}];
    }
  }
  const field=task.fields[0]!;
  return field.kind==='set'?[{...answer,sets:{...answer.sets,[field.id]:['not-a-member']}}]:
    [{...answer,values:{...answer.values,[field.id]:''}}];
}
