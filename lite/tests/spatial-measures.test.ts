import { describe, expect, it } from 'vitest';
import { spatialMeasureEvidence, spatialMeasureSpecs } from '../src/content/spatial-measures';
import { checkSpatialMeasure, classifyOpening, hasRotation, parseMeasure, sameMeasure,
  type Cell, type Point, type SpatialMeasureResponse } from '../src/content/models/spatial-measures';
import { check, solution, wrongs } from '../src/engine/check';
import { rng } from '../src/engine/rng';

const ids = ['M-GEO-19','M-GEO-20','M-GEO-21','M-GEO-22','M-GEO-23','M-GEO-25','M-GEO-24',
  'M-GMEAS-02','M-GMEAS-04','M-GMEAS-03','M-SCALE-01','M-SCALE-02','M-SYM-02','M-SYM-03','M-GMEAS-06'];
const find = (id:string,seed:number,transfer=false) => {
  const task = spatialMeasureSpecs.find(node=>node.id===id)!.item(rng(seed),transfer?'transfer':'independent').task;
  if (task.kind!=='spatial-measures') throw new Error('Expected a spatial workbench');
  return task;
};
const response = (patch:Partial<SpatialMeasureResponse>):SpatialMeasureResponse =>
  ({kind:'spatial-measures',values:{},points:[],cells:[],degrees:null,tested:[],...patch});

describe('Saariston mittapaja',()=>{
  it('exports the fifteen assigned skills with individual versions and limits',()=>{
    expect(spatialMeasureSpecs.map(n=>n.id)).toEqual(ids);
    expect(Object.keys(spatialMeasureEvidence)).toEqual(ids);
    expect(new Set(spatialMeasureSpecs.map(n=>n.rev)).size).toBe(ids.length);
    for (const spec of spatialMeasureSpecs) {
      expect(spec.validRevs).toEqual(spec.rev?.endsWith('-v2')?[spec.rev.replace(/-v2$/,'-v1'),spec.rev]:[spec.rev]);
      expect(spatialMeasureEvidence[spec.id]!.limit.length).toBeGreaterThan(40);
      for (const demo of spec.demo(rng(2))) {
        const host={innerHTML:''} as HTMLElement;
        demo.scene(host);
        expect(host.innerHTML).toContain('spatial-measure-board');
      }
    }
  });
  it.each(ids)('%s generates its two families and transfer deterministically',id=>{
    const node=spatialMeasureSpecs.find(n=>n.id===id)!;
    const tags=new Set<string>();
    for (const phase of ['guided','independent','retrieval','transfer'] as const) for (let seed=0;seed<24;seed++) {
      const item=node.item(rng(seed),phase);
      expect(item.task).toEqual(node.item(rng(seed),phase).task);
      expect(check(item.task,solution(item.task)).ok).toBe(true);
      for (const incorrect of wrongs(item.task)) expect(check(item.task,incorrect).ok).toBe(false);
      if (phase==='independent') tags.add(item.tag);
      if (phase==='transfer') expect(item.tag).toBe('transfer');
    }
    expect([...tags].sort()).toEqual([...spatialMeasureEvidence[id]!.families].sort());
  });
  it('accepts equivalent exact ratios and decimal comma, never a zero divisor',()=>{
    expect(sameMeasure('2:1600','1/800')).toBe(true);
    expect(sameMeasure('0,025','1:40')).toBe(true);
    expect(sameMeasure('−5/2','-2.50')).toBe(true);
    expect(sameMeasure('2:1600','1600:2')).toBe(false);
    expect(parseMeasure('1:0')).toBeUndefined();
  });
  it('requires both endpoints, accepts either direction and distinguishes a curve',()=>{
    const task=find('M-GEO-20',1,true);
    if (task.board.kind!=='grid') throw new Error('Expected endpoints on a grid');
    const points=[...task.board.shown].reverse();
    expect(check(task,response({points,values:{property:'bounded'}})).ok).toBe(true);
    expect(check(task,response({points,values:{property:'curved'}})).ok).toBe(false);
    expect(check(task,response({points:points.slice(1),values:{property:'bounded'}})).ok).toBe(false);
  });
  it('accepts only the visible drawing tolerance and the taught 0–180° classification',()=>{
    const task=find('M-GEO-23',3);
    if (task.board.kind!=='angles') throw new Error('Expected angle drawing');
    const target=Number(task.board.angles[0]!.opening);
    expect(check(task,response({degrees:target+1})).ok).toBe(true);
    expect(check(task,response({degrees:target-1})).ok).toBe(true);
    expect(check(task,response({degrees:target+2})).ok).toBe(false);
    expect([-1,0,1,89,90,91,179,180,181].map(classifyOpening)).toEqual(
      [undefined,'zero','acute','acute','right','obtuse','obtuse','straight',undefined]);
  });
  it('checks a protractor placement, alignment, scale and reading independently',()=>{
    for (const seed of [0,1,2,3]) {
      const task=find('M-GEO-24',seed);
      if (task.board.kind!=='angles') throw new Error('Expected protractor board');
      const {vertex,start,clockwise,opening}=task.board.angles[0]!;
      const degree=(start+(clockwise?0:180))%360, scale=clockwise?'a':'b';
      const full=response({points:[vertex],degrees:degree,values:{read:String(opening),scale}});
      expect(check(task,full).ok).toBe(true);
      expect(check(task,{...full,points:[[vertex[0]+1,vertex[1]]]}).ok).toBe(false);
      expect(check(task,{...full,degrees:(degree+180)%360}).ok).toBe(false);
      expect(check(task,{...full,values:{...full.values,scale:scale==='a'?'b':'a'}}).ok).toBe(false);
      expect(check(task,{...full,values:{...full.values,read:String(180-opening)}}).ok).toBe(false);
    }
  });
  it('checks one cube per required position in every layer and rejects a plausible surface count',()=>{
    const task=find('M-GMEAS-04',2,true);
    if(task.board.kind!=='cells') throw new Error('Expected layer maps');
    const target=[...task.board.cells].reverse();
    const full=response({cells:target,values:{volume:String(target.length),unit:'volume'}});
    expect(check(task,full).ok).toBe(true);
    expect(check(task,{...full,cells:target.filter(([, ,z])=>z===0)}).ok).toBe(false);
    expect(check(task,{...full,cells:[...target,target[0]!] as Cell[]}).ok).toBe(false);
    expect(check(task,{...full,values:{...full.values,unit:'area'}}).ok).toBe(false);
  });
  it('requires a fully enclosed interior cube, distinct from the outside shell',()=>{
    const task=find('M-GMEAS-04',0);
    if(task.board.kind!=='cells') throw new Error('Expected the rectangular layers');
    const all=task.board.cells;
    const offsets:Cell[]=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
    const shell=all.filter(([x,y,z])=>offsets.some(([a,b,c])=>!all.some(p=>p[0]===x+a&&p[1]===y+b&&p[2]===z+c)));
    expect(shell.length).toBeLessThan(all.length);
    expect(check(task,response({cells:[...all],values:{volume:String(all.length),unit:'volume'}})).ok).toBe(true);
    expect(check(task,response({cells:[...all],values:{volume:String(shell.length),unit:'volume'}})).ok).toBe(false);
    expect(check(task,response({cells:shell,values:{volume:String(shell.length),unit:'volume'}})).ok).toBe(false);
  });
  it('grades both geometrically valid partitions and excludes the demonstrated transfer cut',()=>{
    const task=find('M-GMEAS-03',0);
    if(task.action?.kind!=='partition') throw new Error('Expected a composite area');
    for (const cut of task.action.cuts.slice(0,2)) {
      const first=task.action.cells.reduce((n,p)=>n+Number(p[cut.axis]<cut.at),0), total=task.action.cells.length;
      const values={cut:cut.id,first:String(first),second:String(total-first),total:String(total),unit:'area'};
      expect(check(task,response({values})).ok).toBe(true);
      expect(check(task,response({values:{...values,total:String(total+1)}})).ok).toBe(false);
    }
    const transfer=find('M-GMEAS-03',1,true);
    if(transfer.action?.kind!=='partition') throw new Error('Expected a transfer partition');
    const cut=transfer.action.cuts[0]!, total=transfer.action.cells.length;
    const first=transfer.action.cells.filter(p=>p[cut.axis]<cut.at).length;
    expect(check(transfer,response({values:{cut:cut.id,first:String(first),second:String(total-first),total:String(total),unit:'area'}})).ok).toBe(false);
  });
  it('keeps the lengths of every pair in the scaled polygon at the same ratio',()=>{
    const task=find('M-SCALE-02',3,true);
    if(task.board.kind!=='grid') throw new Error('Expected a map grid');
    const points=task.board.shown.map(([x,y]):Point=>[8+(x-1)/3,8+(y-1)/3]);
    const length2=(a:Point,b:Point)=>(a[0]-b[0])**2+(a[1]-b[1])**2;
    expect(check(task,response({points})).ok).toBe(true);
    for(let i=0;i<points.length;i++) for(let j=0;j<i;j++)
      expect(9*length2(points[i]!,points[j]!)).toBe(length2(task.board.shown[i]!,task.board.shown[j]!));
    expect(check(task,response({points:points.map(([x,y],i)=>i===2?[x,y+1]:[x,y])})).ok).toBe(false);
  });
  it('uses a positive smaller-than-full turn and requires sufficient tests for no symmetry',()=>{
    expect(hasRotation([3,6,3,6,3,6],120)).toBe(true);
    expect(hasRotation([3,6,3,6,3,6],60)).toBe(false);
    expect(hasRotation([4,4,4,4],360)).toBe(false);
    const asymmetric=find('M-SYM-02',1);
    if(asymmetric.board.kind!=='rotation') throw new Error('Expected a rotation model');
    const {allowed,center}=asymmetric.board;
    const full=response({points:[center],tested:[...allowed],values:{same:'no'}});
    expect(checkSpatialMeasure(asymmetric,full).ok).toBe(true);
    expect(checkSpatialMeasure(asymmetric,{...full,tested:allowed.slice(1)}).ok).toBe(false);
  });
  it('requires a constant vector for each position and square conversion along both axes',()=>{
    const motif=find('M-SYM-03',0,true);
    if(motif.board.kind!=='grid') throw new Error('Expected a pattern');
    const source=motif.board.motifs![1]!;
    const points=source.map(([x,y]):Point=>[x+3,y+2]);
    expect(check(motif,response({points,values:{dx:'3',dy:'2'}})).ok).toBe(true);
    expect(check(motif,response({points,values:{dx:'3',dy:'0'}})).ok).toBe(false);
    const conversion=find('M-GMEAS-06',0,true);
    if(conversion.board.kind!=='measure') throw new Error('Expected unit diagram');
    const amount=Number(conversion.board.givens[0]!.value.split(' ')[0])/100;
    const values={x:'10',y:'10',factor:'100',area:String(amount).replace('.',','),unit:'sqm'};
    expect(check(conversion,response({values})).ok).toBe(true);
    expect(check(conversion,response({values:{...values,y:'1',factor:'10'}})).ok).toBe(false);
    expect(check(conversion,response({values:{...values,unit:'length'}})).ok).toBe(false);
  });
});

it.each(['M-GMEAS-02','M-GMEAS-04','M-SCALE-02','M-SYM-03'])('%s varies the geometry used by fresh attempts',id=>{
  const datasets=new Set<string>();
  for(let seed=0;seed<160;seed++){
    const task=find(id,seed);
    if(task.board.kind==='cells')datasets.add(JSON.stringify([task.board.grid,task.board.cells]));
    else if(task.board.kind==='grid')datasets.add(JSON.stringify([task.board.path,task.board.motifs]));
  }
  expect(datasets.size).toBeGreaterThanOrEqual(8);
});
