import { expect,it } from 'vitest';
import { geometryRelationsEvidence,geometryRelationsSpecs } from '../src/content/geometry-relations';
import {
  checkGeometryRelations,compassCuts,compassRadius,emptyGeometryRelations,geometryCriterion,lineRelation,pairGeometry,
  shapePairings,solutionGeometryRelations,strictConvex,validDiagonals,validTriangleAngles,wrongGeometryRelationsResponses,
  type GeoFact,type GeoPoint,type GeoShape,type GeometryRelationsResponse,type GeometryRelationsTask,
} from '../src/content/models/geometry-relations';
import { rng } from '../src/engine/rng';

const ids=['M79-CONGRUENCE','M79-CONG-CRIT','M79-CONSTRUCT','M79-CURVE','M79-LINEREL','M79-POLY-ANGLES','M79-RAY',
  'M79-SIMILARITY','M79-SIM-CRIT','M79-SIMILAR-SCALE','M79-SUPPLEMENTARY-ANGLES','M79-TRI-ANGLE-SUM','M79-VERTICAL-ANGLES','M79-ANGLE-REL'];
const node=(id:string)=>geometryRelationsSpecs.find(entry=>entry.id===id)!;
const p=(x:number,y:number):GeoPoint=>({x,y});
const reply=(patch:Partial<GeometryRelationsResponse>)=>({...emptyGeometryRelations(),...patch});
const vertices=(points:readonly GeoPoint[]):GeoShape=>({id:'a',label:'Kuvio',
  vertices:points.map((point,i)=>({...point,id:String.fromCharCode(65+i)}))});
const side=(a:number,b:number):GeoFact=>({kind:'side',a,b});
const angle=(at:number):GeoFact=>({kind:'angle',at});
function find(id:string,tag:string):GeometryRelationsTask{
  for(let seed=0;seed<64;seed++){
    const item=node(id).item(rng(seed),tag==='transfer'?'transfer':'independent');
    if(item.tag===tag&&item.task.kind==='geometry-relations')return item.task;
  }
  throw new Error(`Missing ${id} ${tag}`);
}
it('exports the exact 14 assignments with their own revisions, two families and authored examples',()=>{
  expect(geometryRelationsSpecs.map(n=>n.id)).toEqual(ids);
  expect(Object.keys(geometryRelationsEvidence)).toEqual(ids);
  for(const spec of geometryRelationsSpecs){
    expect(spec.validRevs).toEqual([spec.rev]);
    expect(spec.demo(rng(8))).toHaveLength(2);
    for(const example of spec.demo(rng(8))){
      const host={innerHTML:''} as HTMLElement;
      example.scene(host);
      expect(host.innerHTML).toContain('geometry-relations-board');
    }
  }
});
it.each(ids)('%s deterministically covers both families and transfer with meaningful wrong answers',id=>{
  const spec=node(id),tags=new Set<string>();
  for(const phase of ['guided','independent','retrieval','transfer'] as const)for(let seed=0;seed<32;seed++){
    const item=spec.item(rng(seed),phase);
    expect(item).toEqual(spec.item(rng(seed),phase));
    if(item.task.kind!=='geometry-relations')throw new Error('Wrong geometry kind');
    tags.add(item.tag);
    const solution=solutionGeometryRelations(item.task);
    expect(checkGeometryRelations(item.task,solution),JSON.stringify(item.task)).toMatchObject({ok:true});
    for(const wrong of wrongGeometryRelationsResponses(item.task))expect(checkGeometryRelations(item.task,wrong).ok).toBe(false);
  }
  expect(tags).toEqual(new Set([...geometryRelationsEvidence[id]!.families,'transfer']));
});

it('preserves all Gram distances for any integer rotation/reflection/translation and rejects anisotropic stretch',()=>{
  const original=[p(0,0),p(5,0),p(4,3),p(0,2)];
  for(const [x,y] of [[1,0],[0,1],[3,4],[-4,3],[5,12]] as const)for(const reflection of [-1,1]){
    const scale=Math.hypot(x,y);
    const target=original.map(a=>p(71+x*a.x-reflection*y*a.y,-11+y*a.x+reflection*x*a.y));
    expect(pairGeometry(original,target,'similar')).toBe(true);
    expect(pairGeometry(original,target,'congruent')).toBe(scale===1);
    expect(shapePairings(vertices(original),vertices([...target].reverse()),'similar')).not.toHaveLength(0);
  }
  expect(pairGeometry(original,original.map(a=>p(2*a.x,3*a.y)),'similar')).toBe(false);
  expect(pairGeometry(original,[original[0]!,original[1]!,original[3]!,original[2]!],'congruent')).toBe(false);
});
it('distinguishes included angles and sides in exact congruence and similarity criteria',()=>{
  const ab=side(0,1),bc=side(1,2),ac=side(0,2);
  expect(geometryCriterion([ab,bc,ac],'congruent')).toBe('SSS');
  expect(geometryCriterion([ab,bc,angle(1)],'congruent')).toBe('SAS');
  expect(geometryCriterion([ab,bc,angle(0)],'congruent')).toBeUndefined();
  expect(geometryCriterion([angle(0),ab,angle(1)],'congruent')).toBe('ASA');
  expect(geometryCriterion([angle(0),ac,angle(1)],'congruent')).toBe('AAS');
  expect(geometryCriterion([angle(0),angle(1),angle(2)],'congruent')).toBeUndefined();
  expect(geometryCriterion([angle(0),angle(1)],'similar')).toBe('AA');
  expect(geometryCriterion([ab,bc,ac],'similar')).toBe('ratioSSS');
  expect(geometryCriterion([ab,bc,angle(1)],'similar')).toBe('ratioSAS');
  expect(geometryCriterion([ab,bc,angle(0)],'similar')).toBeUndefined();
});
it('accepts both compass orders and independently confirms equal lengths and a perpendicular chord',()=>{
  const task=find('M79-CONSTRUCT','transfer');
  if(task.board.kind!=='construction')throw new Error('Expected construction');
  const {a,b}=task.board;
  const segment=Math.hypot(b.x-a.x,b.y-a.y);
  for(const radius of task.board.radii){
    if(2*radius<=segment){
      expect(compassRadius(a,b,String(radius))).toBeUndefined();
      continue;
    }
    const [first,second]=compassCuts(a,b,radius);
    for(const point of [first,second]){
      expect(Math.hypot(point.x-a.x,point.y-a.y)).toBeCloseTo(radius);
      expect(Math.hypot(point.x-b.x,point.y-b.y)).toBeCloseTo(radius);
    }
    expect((second.x-first.x)*(b.x-a.x)+(second.y-first.y)*(b.y-a.y)).toBeCloseTo(0);
    const response=reply({circles:[{center:'B',radius:String(radius)},{center:'A',radius:String(radius)}],
      intersections:['Q','P'],values:{distanceA:String(radius),distanceB:String(radius),angle:'90'}});
    expect(checkGeometryRelations(task,response).ok).toBe(true);
    expect(checkGeometryRelations(task,{...response,circles:[response.circles[0]!,{center:'A',radius:String(radius+5)}]}).ok).toBe(false);
    expect(checkGeometryRelations(task,{...response,intersections:['P','P']}).ok).toBe(false);
  }
});
it('constructs an infinite ray from its endpoint with either forward reference, never an opposite one',()=>{
  const task=find('M79-RAY','transfer');
  const values={continuation:'one'};
  for(const point of ['B','C'])expect(checkGeometryRelations(task,reply({points:['A',point],values})).ok).toBe(true);
  for(const points of [['A','D'],['B','A'],['A','A']])expect(checkGeometryRelations(task,reply({points,values})).ok).toBe(false);
});
it('classifies infinite lines by exact algebra even if the visible portions do not meet',()=>{
  expect(lineRelation([[p(0,0),p(3,4)],[p(100,20),p(103,24)]])).toBe('parallel');
  expect(lineRelation([[p(0,0),p(3,4)],[p(100,20),p(104,17)]])).toBe('perpendicular');
  expect(lineRelation([[p(0,0),p(3,4)],[p(100,20),p(104,18)]])).toBe('intersecting');
  expect(lineRelation([[p(0,0),p(3,4)],[p(6,8),p(9,12)]])).toBe('coincident');
});
it('accepts alternative triangulations of a convex polygon and rejects crossing diagonals and boundary edges',()=>{
  const shape=vertices([p(0,0),p(4,0),p(6,2),p(5,5),p(2,6),p(-1,3)]);
  expect(strictConvex(shape.vertices)).toBe(true);
  expect(validDiagonals(shape,[['A','C'],['A','D'],['A','E']])).toBe(true);
  expect(validDiagonals(shape,[['D','B'],['E','B'],['B','F']])).toBe(true);
  expect(validDiagonals(shape,[['A','D'],['B','E'],['A','E']])).toBe(false);
  expect(validDiagonals(shape,[['A','B'],['A','D'],['A','E']])).toBe(false);
  expect(strictConvex(vertices([p(0,0),p(4,4),p(0,4),p(4,0)]).vertices)).toBe(false);
  expect(validTriangleAngles([0,90,90])).toBe(false);
  expect(validTriangleAngles([50,60,80])).toBe(false);
  expect(validTriangleAngles([89,90,1])).toBe(true);
});
it('uses different scale exponents for length, area and volume in the reverse problem',()=>{
  const task=find('M79-SIMILAR-SCALE','transfer');
  if(task.board.kind!=='scale')throw new Error('Expected scale');
  const [first,second]=task.board.rows,k=Number(first!.source)/Number(first!.target);
  const values={factor:`1/${k}`,area:`1/${k*k}`,volume:`1/${k**3}`,side:String(k*Number(second!.target))};
  expect(checkGeometryRelations(task,reply({values})).ok).toBe(true);
  expect(checkGeometryRelations(task,reply({values:{...values,volume:values.area}})).ok).toBe(false);
});

it.each(ids)('%s supplies enough distinct board givens for fresh repeated attempts',id=>{
  const givens=new Set<string>();
  for(let seed=0;seed<160;seed++){
    const {task}=node(id).item(rng(seed),'independent');
    if(task.kind!=='geometry-relations')throw new Error('Wrong geometry kind');
    givens.add(JSON.stringify(task.board));
  }
  expect(givens.size).toBeGreaterThanOrEqual(8);
});
