import { expect,it } from 'vitest';
import { programmingFerryEvidence,programmingFerrySpecs } from '../src/content/programming-ferries';
import { checkProgrammingFerry,freshProgrammingFerryResponse,programmingFerryScene,
  solutionProgrammingFerry,wrongProgrammingFerryResponses,
  type FerryObservation,type FerryScenario,type ProgrammingFerryResponse,type ProgrammingFerryTask } from '../src/content/models/programming-ferries';
import type { FerryCell,FerryCommand,FerryHeading,FerryPose } from '../src/content/models/ferry-program';
import { rng } from '../src/engine/rng';

const ids=['M-PROG-01','M-PROG-02','M-PROG-04','M-PROG-05','M-PROG-06','M-PROG-07','M-PROG-EVALUATE','M-PROG-TEST','M-PROG-03'];
const vec:Record<FerryHeading,[number,number]>={north:[0,-1],east:[1,0],south:[0,1],west:[-1,0]};
const name=(x:number,y:number)=>Object.entries(vec).find(([,v])=>v[0]===x&&v[1]===y)![0] as FerryHeading;
const same=(p:FerryCell,q:FerryCell)=>p.x===q.x&&p.y===q.y;
function simulate(scenario:FerryScenario,code:readonly FerryCommand[]) {
  const states:FerryPose[]=[],visited:FerryCell[]=[scenario.board.start];
  let {x,y,heading}=scenario.board.start;
  let status:FerryObservation['status']='complete';
  for(const command of code){
    const [a,b]=vec[heading];
    if(command==='left')heading=name(b,-a);
    if(command==='right')heading=name(-b,a);
    if(command==='forward'){
      const next={x:x+a,y:y+b};
      if(next.x<0||next.x>=scenario.board.width||next.y<0||next.y>=scenario.board.height)status='edge';
      else if(scenario.board.rocks.some(rock=>same(rock,next)))status='rock';
      else{x=next.x;y=next.y;visited.push(next);}
    }
    states.push({x,y,heading});
    if(status!=='complete')break;
  }
  return {states,visited,status,pose:{x,y,heading}};
}
function report(scenario:FerryScenario,program:readonly FerryCommand[],reference?:readonly FerryCommand[]):FerryObservation {
  const {states,visited,status,pose}=simulate(scenario,program);
  const firsts=scenario.goal.via??[];
  let previous=-1;
  const via=firsts.every(dock=>{
    const next=visited.findIndex((cell,index)=>index>previous&&same(cell,dock));
    previous=next;return next>=0;
  });
  const result:FerryObservation={pose,status,executed:states.length,checks:{
    destination:same(pose,scenario.goal.destination),heading:!scenario.goal.heading||scenario.goal.heading===pose.heading,via,
  }};
  if(reference){
    const other=simulate(scenario,reference);
    let deviation:null|number=null;
    for(let i=0;i<Math.max(other.states.length,states.length);i++){
      if(!states[i]||!other.states[i]||program[i]!==reference[i]||!same(states[i]!,other.states[i]!)||
        states[i]!.heading!==other.states[i]!.heading||i===states.length-1&&status!=='complete'&&other.status!==status){
        deviation=i;break;
      }
    }
    result.difference=deviation;
  }
  return result;
}
function findRoute(scenario:FerryScenario):FerryCommand[]{
  const queue:FerryCommand[][]=[[]],seen=new Set<string>();
  while(queue.length){
    const code=queue.shift()!,run=simulate(scenario,code);
    if(run.status!=='complete')continue;
    const conditions=report(scenario,code).checks!;
    if(conditions.destination&&conditions.heading&&conditions.via)return code;
    let visited=0;
    for(const point of run.visited)if(scenario.goal.via?.[visited]&&same(point,scenario.goal.via[visited]!))visited++;
    const key=`${run.pose.x}:${run.pose.y}:${run.pose.heading}:${visited}`;
    if(seen.has(key))continue;
    seen.add(key);
    for(const move of ['left','right','forward'] as const)queue.push([...code,move]);
  }
  throw new Error('Independent search could not reach the goal');
}
function find(id:string,tag:string):ProgrammingFerryTask {
  const spec=programmingFerrySpecs.find(entry=>entry.id===id)!;
  for(let seed=0;seed<64;seed++){
    const item=spec.item(rng(seed),tag==='transfer'?'transfer':'independent');
    if(item.tag===tag&&item.task.kind==='programming-ferries')return item.task;
  }
  throw new Error(`Missing ${id}: ${tag}`);
}
const reply=(patch:Partial<ProgrammingFerryResponse>)=>({...freshProgrammingFerryResponse(),...patch});

it('exports exactly nine authored lessons with two evidence families and distinct revisions',()=>{
  expect(programmingFerrySpecs.map(spec=>spec.id)).toEqual(ids);
  expect(Object.keys(programmingFerryEvidence)).toEqual(ids);
  expect(new Set(programmingFerrySpecs.map(spec=>spec.rev)).size).toBe(ids.length);
  for(const spec of programmingFerrySpecs)expect(spec.validRevs).toEqual([spec.rev]);
});
it.each(ids)('%s generates balanced families and correct deterministic examples',id=>{
  const tags=new Set<string>(),spec=programmingFerrySpecs.find(entry=>entry.id===id)!;
  for(const phase of ['guided','independent','transfer'] as const)for(let seed=0;seed<32;seed++){
    const item=spec.item(rng(seed),phase);
    expect(item).toEqual(spec.item(rng(seed),phase));
    if(item.task.kind!=='programming-ferries')throw new Error('Wrong task kind');
    tags.add(item.tag);
    const correct=solutionProgrammingFerry(item.task);
    expect(checkProgrammingFerry(item.task,correct),JSON.stringify(item.task)).toMatchObject({ok:true});
    for(const wrong of wrongProgrammingFerryResponses(item.task))expect(checkProgrammingFerry(item.task,wrong).ok).toBe(false);
  }
  expect(tags).toEqual(new Set([...programmingFerryEvidence[id]!.families,'transfer']));
});
it('checks every follow state and accepts arbitrary successful instructions only in the author task',()=>{
  const follow=find('M-PROG-01','follow-wait-and-heading'),script=[...follow.script!];
  const {states}=simulate(follow.cases[0]!,script);
  expect(checkProgrammingFerry(follow,reply({program:script,follow:states})).ok).toBe(true);
  expect(checkProgrammingFerry(follow,reply({program:Array<FerryCommand>(script.length),follow:states})).ok).toBe(false);
  const incorrect=[...states];incorrect[1]={...incorrect[1]!,heading:incorrect[0]!.heading};
  expect(checkProgrammingFerry(follow,reply({program:script,follow:incorrect})).ok).toBe(false);
  const author=find('M-PROG-02','transfer'),program=findRoute(author.cases[0]!);
  for(const variant of [program,['wait',...program],['left','right',...program]] as const){
    expect(checkProgrammingFerry(author,reply({program:[...variant]})).ok).toBe(true);
  }
  expect(checkProgrammingFerry(author,reply({program:[...program,'left']})).ok).toBe(false);
  expect(checkProgrammingFerry(author,reply({program:Array(65).fill('wait')})).ok).toBe(false);
});
it('checks command fidelity against given plan, even when a reordered variant has the same endpoint',()=>{
  const task=find('M-PROG-06','encode-wait-before-movement');
  expect(checkProgrammingFerry(task,reply({program:['wait','right','forward']})).ok).toBe(true);
  expect(checkProgrammingFerry(task,reply({program:['right','forward','wait']})).ok).toBe(false);
});
it('requires an own ordered plan with safe rectilinear legs, and accepts alternative stops',()=>{
  const task:ProgrammingFerryTask={kind:'programming-ferries',activity:'plan',cases:[{
    label:'Test harbour',board:{width:5,height:5,start:{x:0,y:3,heading:'east'},rocks:[{x:2,y:3}]},
    goal:{destination:{x:4,y:1}},
  }]};
  for(const path of [[{x:0,y:1},{x:4,y:1}],[{x:1,y:3},{x:1,y:1},{x:4,y:1}]]){
    expect(checkProgrammingFerry(task,reply({plan:path})).ok).toBe(true);
  }
  for(const path of [[{x:4,y:1}],[{x:4,y:3},{x:4,y:1}],[{x:1,y:1},{x:4,y:1}]]){
    expect(checkProgrammingFerry(task,reply({plan:path})).ok).toBe(false);
  }
});
it('distinguishes a locked forecast from correct observed rock stop',()=>{
  const task=find('M-PROG-04','predict-turn-then-block');
  const observation=report(task.cases[0]!,task.script!);
  expect(observation.status).toBe('rock');
  expect(observation.executed).toBe(2);
  const forecast={...observation,executed:0};
  expect(checkProgrammingFerry(task,reply({forecast,observations:[observation]})).ok).toBe(true);
  expect(checkProgrammingFerry(task,reply({forecast:{...forecast,status:'complete'},observations:[observation]})).ok).toBe(false);
  expect(checkProgrammingFerry(task,reply({forecast,observations:[{...observation,executed:1}]})).ok).toBe(false);
});
it('requires test deviation and all separate target conditions when integrating',()=>{
  for(const [id,tag] of [['M-PROG-TEST','test-first-collision'],['M-PROG-03','transfer'],['M-PROG-EVALUATE','evaluate-missed-dock']]){
    const task=find(id!,tag!),run=report(task.cases[0]!,task.script!,task.reference);
    expect(checkProgrammingFerry(task,reply({observations:[run]})).ok).toBe(true);
    if(task.reference)expect(checkProgrammingFerry(task,reply({observations:[{...run,difference:null}]})).ok).toBe(false);
    if(task.activity!=='test')expect(checkProgrammingFerry(task,reply({observations:[{...run,checks:{
      ...run.checks!,heading:!run.checks!.heading,via:!run.checks!.via,
    }}]})).ok).toBe(false);
  }
});
it('tests and repairs both entry paths independently from two starts',()=>{
  for(const family of ['verify-and-repair-given-program','verify-and-repair-self-authored-program','transfer']){
    const task=find('M-PROG-07',family),[first,second]=task.cases;
    const program=task.script?[...task.script]:findRoute(first!);
    const repair=findRoute(second!);
    const observations=[report(first!,program),report(second!,program),report(second!,repair)];
    expect(observations[0]!.checks).toEqual({destination:true,heading:true,via:true});
    expect(Object.values(observations[1]!.checks!).every(Boolean)&&observations[1]!.status==='complete').toBe(false);
    expect(checkProgrammingFerry(task,reply({program,repair,observations})).ok).toBe(true);
    expect(checkProgrammingFerry(task,reply({program,repair:program,observations})).ok).toBe(false);
    expect(checkProgrammingFerry(task,reply({program,repair,observations:observations.slice(1)})).ok).toBe(false);
  }
});
it('renders only played prefixes and never applies an unseen prediction or reveals an authored answer',()=>{
  const task=find('M-PROG-04','predict-turn-then-block'),scenario=task.cases[0]!,run=simulate(scenario,task.script!);
  const forecast=report(scenario,task.script!);
  const idle=programmingFerryScene(task,reply({forecast}));
  expect(idle.pose).toEqual(scenario.board.start);
  expect(idle.step).toBe(0);
  expect(idle.goal).toBeUndefined();
  expect(programmingFerryScene(task,reply({preview:{caseIndex:0,source:'primary',step:-1}}))).toEqual(idle);
  for(let i=1;i<=run.states.length;i++){
    const model=programmingFerryScene(task,reply({forecast,preview:{caseIndex:0,source:'primary',step:i}}));
    expect(model.pose).toEqual(run.states[i-1]);
    expect(model.stopped).toBe(i===run.states.length);
    expect(model).not.toHaveProperty('script');
    expect(model).not.toHaveProperty('forecast');
  }
});
