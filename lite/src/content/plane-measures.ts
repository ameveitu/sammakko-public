import type { Rng } from '../engine/rng';
import type { Item, NodeSpec, Task } from '../engine/types';
import { cases } from './kit';
import {
  areaUnitConversion, segmentName, solutionPlaneMeasures,
  type AreaUnit, type PlaneMeasuresTask, type PlanePoint, type PlanePolygon, type PlaneSegment, type TriangleBoard,
} from './models/plane-measures';
import { planeMeasuresPaint } from './scenes/plane-measures';

type Draft=Omit<Item,'tag'>;
type Family=readonly [string,(r:Rng)=>Draft];
const kind='plane-measures' as const;
const p=(id:string,x:number,y:number):PlanePoint=>({id,x,y});
const transform=(points:PlanePolygon,rotation:number):PlanePolygon=>points.map(({id,x,y})=>
  rotation===0?p(id,x,y):rotation===1?p(id,-y,x):rotation===2?p(id,-x,-y):p(id,y,-x));
const candidateFeet=(min:number,max:number,used:PlanePolygon,vertical=false)=>
  Array.from({length:max-min+1},(_,i)=>min+i)
    .filter(q=>!used.some(v=>v.x===(vertical?0:q)&&v.y===(vertical?q:0)))
    .map((q,i)=>p(`F${i+1}`,vertical?0:q,vertical?q:0));
function item(task:PlaneMeasuresTask,say:string,hint:string,explain:string):Draft {
  const scene=planeMeasuresPaint(task);
  return {task:task as unknown as Task,scene,say,hint,explain};
}
function spec(id:string,stop:string,intro:string,goal:string,reward:string,a:Family,b:Family,transfer:Family[1]):NodeSpec{
  const rev=`plane-measures-${id.toLowerCase()}-v1`;
  return {id,stop,icon:'▱',intro,goal,reward,rev,validRevs:[rev],produce:[a[0],b[0]],
    produceWhat:'oma reunareitti, kohtisuora korkeus, ositus tai muunnoslasku',
    demo(r){
      const sample=a[1](r),task=sample.task as unknown as PlaneMeasuresTask;
      return [{say:sample.explain,scene:planeMeasuresPaint(task,solutionPlaneMeasures(task))}];
    },
    item:cases({[a[0]]:a[1],[b[0]]:b[1]},transfer)};
}

function perimeter(r:Rng,variant:'corner'|'notch'|'transfer'):Draft{
  const w=r.int(8,14),h=r.int(6,11),inset=r.int(2,4),depth=r.int(2,4);
  const corner=variant==='corner';
  const right=r.int(2,3);
  const raw:PlanePolygon=corner?[p('A',0,0),p('B',w,0),p('C',w,h-depth),p('D',w-inset,h-depth),p('E',w-inset,h),p('F',0,h)]
    :[p('A',0,0),p('B',w,0),p('C',w,h),p('D',w-right,h),p('E',w-right,h-depth),p('F',inset,h-depth),p('G',inset,h),p('H',0,h)];
  const polygon=transform(raw,variant==='transfer'?r.int(1,3):r.int(0,3));
  const missing:PlaneSegment=corner?['C','D']:variant==='transfer'?['F','G']:['D','E'];
  const guide:PlaneSegment=corner?['A','D']:['A','F'];
  const task:PlaneMeasuresTask={kind,mode:'perimeter',title:corner?'Kulman kiertävä reunaköysi':'Uurteen reunaköysi',
    polygon,missing,guides:[guide],unit:variant==='transfer'?'m':'cm'};
  const answer=solutionPlaneMeasures(task);
  if(answer.mode!=='perimeter')throw Error('Expected perimeter');
  return item(task,`Rakenna suljettu reunareitti. Päättele sivun ${segmentName(missing)} mitta, laske piiri ja valitse yksikkö.`,
    'Seuraa pihan ulkoreunaa. Vertaile keskenään samansuuntaisia sivuja.',
    `Reitti kulkee ${answer.route.join('–')}. Puuttuva sivu on ${answer.missing} ${task.unit} ja piiri on ${answer.value} ${task.unit}.`);
}

function triangleBoard(name:string,width:number,height:number,tipX:number,rotation:number,alternate=false):TriangleBoard{
  const polygon=[p('A',0,0),p('B',width,0),p('C',tipX,height)];
  const feet=candidateFeet(Math.min(-1,tipX-1),Math.max(width+1,tipX+1),polygon);
  const lines:TriangleBoard['lines']=alternate?
    [{base:['A','C'],apex:'B',feet:transform(candidateFeet(-1,height+1,polygon,true),rotation)},
      {base:['A','B'],apex:'C',feet:transform(feet,rotation)}]:
    [{base:['A','B'],apex:'C',feet:transform(feet,rotation)}];
  return {name,polygon:transform(polygon,rotation),lines};
}
function triangle(r:Rng,variant:'inside'|'compare'|'transfer'):Draft{
  const width=r.int(4,11),height=r.int(3,8),rotation=r.int(0,3);
  const boards=variant==='inside'?[triangleBoard('Peitteen kolmio',width,height,r.int(1,width-1),rotation)]
    :variant==='compare'?[triangleBoard('Vasemmalle siirtynyt kärki',width,height,-r.int(1,3),rotation),
      triangleBoard('Kannan yläpuolella oleva kärki',width,height,r.int(1,width-1),rotation)]
      :[triangleBoard('Peite eri kannalta',width,height,0,(rotation+1)%4,true)];
  const task:PlaneMeasuresTask={kind,mode:'triangle',title:'Kolmion kanta ja kohtisuora korkeus',boards,unit:variant==='transfer'?'m':'cm'};
  const answer=solutionPlaneMeasures(task);
  if(answer.mode!=='triangle')throw Error('Expected triangle');
  return item(task,variant==='compare'
    ?'Rakenna molempiin kolmioihin kohtisuora korkeus. Laske ja vertaa pinta-aloja.'
    :'Valitse kanta ja rakenna sille kohtisuora korkeus kärjestä. Laske peitteen pinta-ala.',
  'Korkeus kohtaa kannan tai sen jatkeen suorassa kulmassa. Kannan pituus kertaa korkeus antaa kaksinkertaisen alan.',
  answer.rows.map((row,i)=>`${boards[i]!.name}. Kanta ${row.baseLength} ${task.unit}, korkeus ${row.height} ${task.unit}, ala ${row.area} ${task.unit}².`).join(' '));
}

function quad(r:Rng,shape:'rectangle'|'parallelogram'|'trapezoid'):Draft{
  const w=r.int(7,12),h=r.int(3,8),offset=r.int(2,3);
  let raw:PlanePolygon;
  if(shape==='rectangle'){
    const mid=Math.floor(w/2);
    raw=[p('A',0,0),p('P',mid,0),p('B',w,0),p('C',w,h),p('Q',mid,h),p('D',0,h)];
  }else if(shape==='parallelogram'){
    raw=[p('A',0,0),p('P',offset,0),p('B',w,0),p('C',w+offset,h),p('Q',w,h),p('D',offset,h)];
  }else{
    const right=w-r.int(1,2);
    raw=[p('A',0,0),p('P',offset,0),p('Q',right,0),p('B',w,0),p('C',right,h),p('D',offset,h)];
  }
  const turn=shape==='trapezoid'?r.int(1,3):r.int(0,3);
  const polygon=transform(raw,turn);
  const altitude={base:['A','B'] as const,upper:['D','C'] as const,apex:'D',
    feet:transform(candidateFeet(-1,w+1,raw),turn)};
  const task:PlaneMeasuresTask={kind,mode:'partition',title:shape==='rectangle'?'Suorakulmainen puutarha':shape==='parallelogram'?'Vino nelikulmainen puutarha':'Eri pituiset kannat',
    shape:'quad',polygon,altitude,unit:shape==='trapezoid'?'m':'cm'};
  return areaTask(task);
}
function composite(r:Rng,shape:'roof'|'notch'|'hole'):Draft{
  const w=r.int(8,14),h=r.int(6,11),depth=r.int(2,4);
  const positions=Array.from({length:w-3},(_,i)=>i+2);
  const tip=r.pick(shape==='notch'?positions.filter(x=>w*(h-depth)!==h*x&&w*(h-depth)!==h*(w-x)):positions);
  const raw=[p('A',0,0),p('B',w,0),p('C',w,h),p('D',tip,h+(shape==='notch'?-depth:depth)),p('E',0,h)];
  const turn=shape==='hole'?r.int(1,3):r.int(0,3);
  const gap=r.int(2,4);
  const hole=shape==='hole'?transform([p('I',2,1),p('J',2+gap,1),p('K',2+gap,3),p('L',2,3)],turn):undefined;
  const task:PlaneMeasuresTask={kind,mode:'partition',shape:'composite',title:shape==='hole'?'Peite ja istutusaukko':shape==='notch'?'Loven muotoinen leiripiha':'Leiripihan harjapeite',
    polygon:transform(raw,turn),hole,unit:shape==='hole'?'m':'cm'};
  return areaTask(task);
}
function areaTask(task:Extract<PlaneMeasuresTask,{mode:'partition'}>):Draft{
  const answer=solutionPlaneMeasures(task);
  if(answer.mode!=='partition')throw Error('Expected partition');
  const pieces=Object.entries(answer.areas).map(([name,a])=>`osa ${name} ${a} ${answer.unit}`).join(', ');
  const instruction=task.shape==='quad'
    ?'Rakenna kohtisuora korkeus ja merkitse kannat. Jaa alue omilla sisäisillä leikkauksilla ja laske osien alat.'
    :`Jaa ulkoalue ainakin yhteen kolmioon ja yhteen nelikulmioon. Laske jokaisen osan ala.${task.hole?' Vähennä sitten istutusaukko.':''}`;
  return item(task,instruction,
    'Pätevä leikkaus kulkee koko matkan alueen sisällä. Osat koskettavat toisiaan reunaa pitkin ja täyttävät yhteisen alueen.',
    `Yhdessä ratkaisussa ${pieces}.${answer.hole?` Aukon ala on ${answer.hole} ${answer.unit}.`:''} Alueen ala on ${answer.value} ${answer.unit}.`);
}
function conversion(r:Rng,variant:'multiply'|'divide'|'transfer'):Draft{
  const pairs=[['m²','dm²'],['dm²','cm²'],['cm²','mm²']] as const;
  const [big,small]=r.pick<readonly [AreaUnit,AreaUnit]>(variant==='transfer'?[['m²','cm²'],['dm²','mm²']]:pairs);
  const from=variant==='multiply'?big:small,to=variant==='multiply'?small:big;
  const amount=variant==='multiply'?String(r.int(2,18)/2).replace('.',','):String(r.int(5,140)*(variant==='transfer'?125:25));
  const task:PlaneMeasuresTask={kind,mode:'conversion',title:'Sama pinta kahdella yksiköllä',from,to,amount};
  const answer=solutionPlaneMeasures(task);
  if(answer.mode!=='conversion')throw Error('Expected conversion');
  const scale=areaUnitConversion(task);
  return item(task,'Anna pituuden kerroin leveyteen ja korkeuteen. Muunna sama pinta-ala uudeksi lukuarvoksi.',
    'Kerro pienen ruudun määrä yhdellä rivillä rivien määrällä. Pinta-alassa on kaksi mittasuuntaa.',
    `Kummankin suunnan kerroin on ${scale.step}. Pinta-alan kerroin on ${scale.factor}. ${amount} ${from} = ${answer.value} ${to}.`);
}

export const planeMeasuresSpecs:NodeSpec[]=[
  spec('M79-POLY-PERIM','Retkipaikan reunaköysi','Aava vetää malliköyden leiripihan reunaa pitkin. Loikka etsii puuttuvaa lyhyttä mittaa.',
    'Rakenna suljettu reunareitti ja laske piiri.','Rajaköysi kohtaa alkupäänsä.',
    ['corner-edge-difference',r=>perimeter(r,'corner')],['concave-notch-trace',r=>perimeter(r,'notch')],r=>perimeter(r,'transfer')),
  spec('M79-TRI-AREA','Purjeen täsmällinen peite','Loikka sovittaa kolmiopurjeen peitteen leiripihalle. Aava tarkistaa, missä korkeus kohtaa kannan.',
    'Rakenna kanta ja kohtisuora korkeus ja laske kolmion ala.','Purjeen peite sopii paikalleen.',
    ['internal-altitude',r=>triangle(r,'inside')],['external-same-area',r=>triangle(r,'compare')],r=>triangle(r,'transfer')),
  spec('M79-QUAD-AREA','Neljän reunan puutarha','Aava jakaa peitteen osiin. Loikka vertaa samankorkuisia kohtia, vaikka sivu on vino.',
    'Rakenna korkeus ja jaa nelikulmio kelvollisiin osiin.','Puutarhan peite sopii neljään reunaan.',
    ['rectangle-cut',r=>quad(r,'rectangle')],['parallelogram-cut',r=>quad(r,'parallelogram')],r=>quad(r,'trapezoid')),
  spec('M79-POLY-AREA','Ystävien yhteinen leiripiha','Leiripihalle tarvitaan peite, jossa on tilaa eväille ja kasveille.',
    'Rakenna omat kolmio- ja nelikulmio-osat ja laske alueen ala.','Ystävien peite istuu leiripihaan ja kasvupaikka jää auki.',
    ['roof-and-yard',r=>composite(r,'roof')],['concave-yard',r=>composite(r,'notch')],r=>composite(r,'hole')),
  spec('M79-UNIT-AREA','Pieni ruutu suuren sisällä','Loikka laskee pieniä malliruutuja suuren ruudun sisällä.',
    'Johda pinta-alan kerroin kahdesta mittasuunnasta.','Peitteen tilaus kuvaa samaa aluetta uudessa yksikössä.',
    ['large-squares-to-small',r=>conversion(r,'multiply')],['small-squares-to-large',r=>conversion(r,'divide')],r=>conversion(r,'transfer')),
];
export const planeMeasuresEvidence=Object.fromEntries(planeMeasuresSpecs.map(s=>[s.id,{families:s.produce??[],
  limit:'Näyttö koostuu rakennetusta karttareitistä, kohtisuorasta korkeudesta, kelvollisesta osituksesta tai omasta tarkasta muunnoslaskusta. Vapaa sanallinen perustelu ja maastomittaus tarvitsevat erillisen näytön.'}]));
