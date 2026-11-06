import { describe,expect,it } from 'vitest';
import { planeMeasuresSpecs } from '../src/content/plane-measures';
import { checkPlaneMeasures,planeFaces,planeNumericInput,solutionPlaneMeasures,
  type AltitudeResponse,type PlaneMeasuresResponse,type PlaneMeasuresTask,type PlanePoint,type PlanePolygon,type PlaneSegment,
  type TriangleBoard } from '../src/content/models/plane-measures';
import { rng } from '../src/engine/rng';

const kind='plane-measures' as const;
const gcd=(x:number,y:number):number=>y?gcd(y,x%y):x;
const at=(polygon:PlanePolygon,id:string)=>polygon.find(v=>v.id===id)!;
const distance=(a:PlanePoint,b:PlanePoint)=>Math.hypot(a.x-b.x,a.y-b.y);
const cyclic=(polygon:PlanePolygon)=>polygon.map((point,i)=>[point,polygon[(i+1)%polygon.length]!] as const);
const fraction=(n:number,d=2)=>`${n*5}/${d*5}`;
const keys=(p:PlanePolygon)=>p.map(v=>v.id).sort().join('');

/** Pick's theorem with an independent lattice enumeration. */
function twiceLatticeArea(polygon:PlanePolygon){
  const sides=cyclic(polygon);
  const boundary=sides.reduce((n,[a,b])=>n+gcd(Math.abs(a.x-b.x),Math.abs(a.y-b.y)),0);
  let inner=0;
  const xs=polygon.map(p=>p.x),ys=polygon.map(p=>p.y);
  for(let x=Math.min(...xs)+1;x<Math.max(...xs);x++)for(let y=Math.min(...ys)+1;y<Math.max(...ys);y++){
    const hit=sides.some(([a,b])=>x>=Math.min(a.x,b.x)&&x<=Math.max(a.x,b.x)
      &&y>=Math.min(a.y,b.y)&&y<=Math.max(a.y,b.y)&&(x-a.x)*(b.y-a.y)===(y-a.y)*(b.x-a.x));
    if(hit)continue;
    const crossings=sides.filter(([a,b])=>(a.y>y)!==(b.y>y)&&a.x+(b.x-a.x)*(y-a.y)/(b.y-a.y)>x).length;
    if(crossings%2)inner++;
  }
  return 2*inner+boundary-2;
}
function altitude(polygon:PlanePolygon,line:TriangleBoard['lines'][number]){
  const a=at(polygon,line.base[0]),b=at(polygon,line.base[1]),apex=at(polygon,line.apex);
  const dx=b.x-a.x,dy=b.y-a.y;
  const t=((apex.x-a.x)*dx+(apex.y-a.y)*dy)/(dx*dx+dy*dy);
  const foot=[...polygon,...line.feet].find(p=>p.x===a.x+t*dx&&p.y===a.y+t*dy)!;
  const output:AltitudeResponse={base:[b.id,a.id],apex:apex.id,foot:foot.id};
  return {output,base:distance(a,b),height:distance(apex,foot),outside:t<0||t>1};
}
const taskAt=(id:string,seed:number,phase:'independent'|'transfer'='independent')=>planeMeasuresSpecs.find(s=>s.id===id)!
  .item(rng(seed),phase).task as unknown as PlaneMeasuresTask;

function pieces(task:Extract<PlaneMeasuresTask,{mode:'partition'}>,alternate:boolean) {
  let cuts:PlaneSegment[],parts:string[];
  const p=task.polygon;
  if(task.shape==='composite'){
    const b=at(p,'B'),c=at(p,'C'),d=at(p,'D');
    const hx=c.x-b.x,hy=c.y-b.y;
    const sameDirection=(d.x-c.x)*hx+(d.y-c.y)*hy>0;
    if(sameDirection){
      cuts=alternate?[['A','C']]:[['C','E']];parts=alternate?['ABC','ACDE']:['ABCE','CDE'];
    }else{
      cuts=alternate?[['B','D']]:[['A','D']];parts=alternate?['ABD E','BCD']:['ABCD','ADE'];
    }
  }else{
    const a=at(p,'A'),b=at(p,'B'),c=at(p,'C'),d=at(p,'D');
    if(alternate){cuts=[['A','C']];parts=['ABC','ACD'];}
    else if(distance(a,b)===distance(d,c)&&distance(a,d)===distance(b,c)&&
      ((b.x-a.x)*(d.x-a.x)+(b.y-a.y)*(d.y-a.y))===0){
      cuts=[['P','Q']];parts=['APQD','PBCQ'];
    }else if(distance(a,b)===distance(d,c)){
      cuts=[['P','D']];parts=['APD','PBCD'];
    }else{
      cuts=[['P','D'],['Q','C']];parts=['APD','PQCD','QBC'];
    }
  }
  const shapes=parts.map(ids=>[...ids.replaceAll(' ','')].map(id=>at(p,id)));
  return {cuts,shapes};
}
function independentlySolve(task:PlaneMeasuresTask,alternate=false):PlaneMeasuresResponse {
  if(task.mode==='perimeter'){
    const route=task.polygon.map(p=>p.id).reverse();
    route.push(route[0]!);
    const missing=distance(at(task.polygon,task.missing[0]),at(task.polygon,task.missing[1]));
    const value=cyclic(task.polygon).reduce((n,[a,b])=>n+distance(a,b),0);
    return {kind,mode:'perimeter',route,missing:String(missing),value:String(value),unit:task.unit};
  }
  if(task.mode==='triangle')return {kind,mode:'triangle',unit:task.unit+'²',rows:task.boards.map(board=>{
    const h=altitude(board.polygon,board.lines[alternate?board.lines.length-1:0]!);
    return {...h.output,baseLength:String(h.base),height:String(h.height),area:fraction(twiceLatticeArea(board.polygon))};
  })};
  if(task.mode==='partition'){
    const {cuts,shapes}=pieces(task,alternate);
    const actual=planeFaces(task.polygon,cuts);
    expect(actual?.map(keys).sort()).toEqual(shapes.map(keys).sort());
    const h=task.altitude&&altitude(task.polygon,task.altitude);
    const hole=task.hole?twiceLatticeArea(task.hole):0;
    const computed=shapes.reduce((n,shape)=>n+twiceLatticeArea(shape),0);
    expect(computed).toBe(twiceLatticeArea(task.polygon));
    return {kind,mode:'partition',cuts,areas:Object.fromEntries(shapes.map(shape=>[keys(shape),fraction(twiceLatticeArea(shape))])),
      ...(h&&task.altitude?{altitude:h.output,lower:String(h.base),height:String(h.height),
        upper:String(distance(at(task.polygon,task.altitude.upper[0]),at(task.polygon,task.altitude.upper[1])))}:{}),
      ...(task.hole?{hole:fraction(hole)}:{}),value:fraction(computed-hole),unit:task.unit+'²'};
  }
  const units:Record<string,number>={'mm²':1,'cm²':10,'dm²':100,'m²':1000};
  const from=units[task.from]!,to=units[task.to]!,min=Math.min(from,to);
  const step=Math.max(from,to)/min,amount=Number(task.amount.replace(',','.'));
  return {kind,mode:'conversion',axes:[String(step),String(step)],factor:String(step**2),
    direction:from>to?'multiply':'divide',value:fraction(2*amount*(from/min)**2,2*(to/min)**2),unit:task.to};
}

describe('Leiripihan independent plane geometry oracle',()=>{
  it('checks all five authored nodes, both families, transfer and alternate constructions',()=>{
    for(const spec of planeMeasuresSpecs){
      const families=new Set<string>(),situations=new Set<string>();
      for(const phase of ['independent','transfer'] as const)for(let seed=0;seed<96;seed++){
        const item=spec.item(rng(seed),phase),task=item.task as unknown as PlaneMeasuresTask;
        const response=independentlySolve(task);
        expect(checkPlaneMeasures(task,response),`${spec.id}/${phase}/${seed}`).toEqual({ok:true});
        expect(checkPlaneMeasures(task,solutionPlaneMeasures(task)).ok).toBe(true);
        if(task.mode==='triangle'||task.mode==='partition')expect(checkPlaneMeasures(task,independentlySolve(task,true)).ok).toBe(true);
        if(response.mode==='partition'&&response.cuts.length>1)
          expect(checkPlaneMeasures(task,{...response,cuts:[...response.cuts].reverse()}).ok).toBe(true);
        if(phase==='independent'){
          families.add(item.tag);
          situations.add(JSON.stringify(task));
        }
      }
      expect(families).toEqual(new Set(spec.produce));
      expect(situations.size).toBeGreaterThanOrEqual(8);
    }
  });

  it('rejects overlapping, duplicate and outside cuts even when the scalar area is correct',()=>{
    const spec=planeMeasuresSpecs.find(s=>s.id==='M79-POLY-AREA')!;
    const byTag=(wanted:string)=>{
      const item=Array.from({length:30},(_,i)=>spec.item(rng(i),'independent')).find(item=>item.tag===wanted)!;
      return item.task as unknown as Extract<PlaneMeasuresTask,{mode:'partition'}>;
    };
    const roof=byTag('roof-and-yard'),r=independentlySolve(roof);
    if(r.mode!=='partition')throw Error('Expected partition');
    for(const cuts of [[['A','C'],['B','E']],[['C','E'],['E','C']],[['A','B']],[['A','X']]] as PlaneSegment[][]){
      expect(planeFaces(roof.polygon,cuts)).toBeUndefined();
      expect(checkPlaneMeasures(roof,{...r,cuts}).ok).toBe(false);
    }
    const concave=byTag('concave-yard');
    expect(planeFaces(concave.polygon,[['C','E']])).toBeUndefined();
    const transfer=taskAt('M79-POLY-AREA',5,'transfer'),hole=independentlySolve(transfer);
    if(hole.mode!=='partition')throw Error('Expected hole');
    expect(checkPlaneMeasures(transfer,{...hole,hole:'0'}).ok).toBe(false);
    expect(checkPlaneMeasures(transfer,{...hole,areas:Object.create(hole.areas)}).ok).toBe(false);
  });

  it('uses the outside foot of an obtuse triangle and checks both axes of a nonadjacent conversion',()=>{
    const tri=planeMeasuresSpecs.find(s=>s.id==='M79-TRI-AREA')!;
    const item=Array.from({length:30},(_,i)=>tri.item(rng(i),'independent')).find(item=>item.tag==='external-same-area')!;
    const t=item.task as unknown as Extract<PlaneMeasuresTask,{mode:'triangle'}>;
    const board=t.boards[0]!,a=altitude(board.polygon,board.lines[0]!);
    expect(a.outside).toBe(true);
    const good=independentlySolve(t);
    if(good.mode!=='triangle')throw Error('Expected triangle');
    expect(checkPlaneMeasures(t,{...good,rows:[{...good.rows[0],foot:'A'},good.rows[1]!]}).ok).toBe(false);
    const conversion=taskAt('M79-UNIT-AREA',7,'transfer'),r=independentlySolve(conversion);
    if(r.mode!=='conversion')throw Error('Expected conversion');
    expect(r.factor).toBe('10000');
    expect(checkPlaneMeasures(conversion,{...r,factor:'100'}).ok).toBe(false);
    expect(checkPlaneMeasures(conversion,{...r,axes:['100','10']}).ok).toBe(false);
    expect(checkPlaneMeasures(conversion,{...r,unit:'m³'}).ok).toBe(false);
    expect(planeNumericInput('private text')).toBe('');
  });
});
