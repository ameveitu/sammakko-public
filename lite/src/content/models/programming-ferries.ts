import type { Verdict } from '../../engine/types';
import { checkFerryGoal, firstFerryDifference, isFerryCommand, runFerryProgram,
  type FerryBoard, type FerryCell, type FerryCommand, type FerryGoal, type FerryHeading, type FerryPose, type FerryRun,
} from './ferry-program';

export const ferryCommands=['forward','left','right','wait'] as const;
export const ferryHeadings=['north','east','south','west'] as const;
export const commandName:Record<FerryCommand,string>={forward:'Eteen',left:'Vasemmalle',right:'Oikealle',wait:'Odota'};
export const headingName:Record<FerryHeading,string>={north:'pohjoinen',east:'itä',south:'etelä',west:'länsi'};
export const commandMark:Record<FerryCommand,string>={forward:'↑',left:'↶',right:'↷',wait:'•'};
export const ferryCellName=({x,y}:FerryCell)=>`${String.fromCharCode(65+x)}${y+1}`;
export interface FerryScenario { label:string; board:FerryBoard; goal:FerryGoal }
export interface FerryInstruction { text:string; commands:readonly FerryCommand[] }
export interface ProgrammingFerryTask {
  kind:'programming-ferries';
  activity:'follow'|'author'|'predict'|'plan'|'encode'|'repair'|'evaluate'|'test'|'integrate';
  cases:readonly FerryScenario[];
  script?:readonly FerryCommand[];
  reference?:readonly FerryCommand[];
  instruction?:readonly FerryInstruction[];
  planStops?:readonly FerryCell[];
}
type Outcome='complete'|'rock'|'edge'|'limit';
export interface FerryObservation {
  pose:FerryPose;
  status:Outcome;
  checks?:{destination:boolean;heading:boolean;via:boolean};
  difference?:number|null;
  executed:number;
}
export interface ProgrammingFerryResponse {
  kind:'programming-ferries';
  program:FerryCommand[];
  follow:FerryPose[];
  forecast:FerryObservation|null;
  plan:FerryCell[];
  observations:FerryObservation[];
  repair:FerryCommand[];
  preview?:{caseIndex:number;source:'primary'|'repair';step:number};
}
export interface ProgrammingFerryScene {
  kind:'programming-ferry';
  title:string;
  board:Pick<FerryBoard,'width'|'height'|'rocks'>;
  start:FerryPose;
  goal?:FerryGoal;
  pose:FerryPose;
  path:FerryCell[];
  step:number;
  stopped:boolean;
}
export const sameFerryCell=(a:FerryCell,b:FerryCell)=>a.x===b.x&&a.y===b.y;
const samePose=(a:FerryPose,b:FerryPose)=>sameFerryCell(a,b)&&a.heading===b.heading;
export const ferryOutcome=(run:FerryRun):Outcome=>run.status!=='blocked'?run.status:
  run.steps.at(-1)?.outcome==='edge'?'edge':'rock';
export const freshProgrammingFerryResponse=():ProgrammingFerryResponse=>({
  kind:'programming-ferries',program:[],follow:[],forecast:null,plan:[],observations:[],repair:[],
});
const safeProgram=(value:readonly FerryCommand[])=>value.length<=64&&Array.from(value).every(isFerryCommand);
const goalFor=(run:FerryRun,c: FerryScenario)=>checkFerryGoal(run,c.goal);
const fail=(why:string):Verdict=>({ok:false,why});
const ok:Verdict={ok:true};
const sameProgram=(actual:readonly FerryCommand[],expected:readonly FerryCommand[])=>
  actual.length===expected.length&&actual.every((command,i)=>command===expected[i]);

function goalFeedback(run:FerryRun,c:FerryScenario):Verdict {
  if(run.status==='blocked')return fail('Lautta pysähtyi ennen seuraavaa ruutua. Tarkista este ja kääntymiskohta.');
  const state=goalFor(run,c);
  if(!state.destination)return fail('Tarkista pääteruutu. Eteen-käsky seuraa lautan senhetkistä keulasuuntaa.');
  if(!state.heading)return fail('Pääteruutu täsmää. Vertaa vielä lautan keulasuuntaa tavoitesuuntaan.');
  if(!state.via)return fail('Tarkista välilaiturit ja niiden järjestys.');
  return state.ok?ok:fail('Tarkista, että ohjelma päättyy kaikkien ehtojen täyttyessä.');
}

export const expectedFerryCommands=(task:ProgrammingFerryTask)=>task.instruction?.flatMap(instruction=>instruction.commands)??task.script??[];

export function programmingFerryScene(task:ProgrammingFerryTask,response?:ProgrammingFerryResponse):ProgrammingFerryScene {
  const view=response?.preview;
  const scenario=task.cases[view?.caseIndex??0]??task.cases[0]!;
  const {start,width,height,rocks}=scenario.board;
  const commands=view?.source==='repair'?(response?.repair??[]):task.activity==='follow'?(response?.program??[]):
    task.script??(task.activity==='evaluate'?expectedFerryCommands(task):response?.program??[]);
  const shownSteps=Number.isSafeInteger(view?.step)?Math.max(0,Math.min(64,view!.step)):0;
  const prefix=commands.slice(0,shownSteps);
  const run=runFerryProgram(scenario.board,safeProgram(prefix)?prefix:[]);
  return {kind:'programming-ferry',title:scenario.label,board:{width,height,rocks},start,...(task.activity==='predict'?{}:{goal:scenario.goal}),
    pose:run.final,path:[...run.visited],step:run.steps.length,stopped:run.status==='blocked'};
}

function observed(run:FerryRun,answer:FerryObservation|undefined,options:{
  scenario:FerryScenario; requireChecks?:boolean; reference?:readonly FerryCommand[]; forecast?:boolean;
}):Verdict {
  if(!answer||!answer.pose||(!options.forecast&&answer.executed!==run.steps.length)){
    return fail('Aja tai askella ohjelma loppuun ja kirjaa oma havaintosi.');
  }
  if(!samePose(answer.pose,run.final)||answer.status!==ferryOutcome(run)){
    return fail(options.forecast?'Vertaa ennustetta siihen, mihin lautta todella pysähtyi ja mihin se osoitti.':
      'Kirjaa lautan viimeinen ruutu, keulasuunta ja pysähtymisen syy ajon perusteella.');
  }
  if(options.requireChecks){
    const result=goalFor(run,options.scenario);
    if(!answer.checks||answer.checks.destination!==result.destination||answer.checks.heading!==result.heading||answer.checks.via!==result.via){
      return fail('Vertaa ruutua, keulaa ja välilaitureita tavoitteeseen kukin erikseen.');
    }
  }
  if(options.reference){
    const expected=runFerryProgram(options.scenario.board,options.reference);
    if(answer.difference!==firstFerryDifference(run,expected)){
      return fail('Vertaa ajon havaintoja odotettuihin askeliin alusta lähtien. Etsi ensimmäinen kohta, jossa ne eroavat.');
    }
  }
  return ok;
}

function pathPlan(board:FerryBoard,stops:readonly FerryCell[]):FerryCell[]|undefined {
  if(stops.length<2||stops.length>12)return;
  let cursor:FerryCell=board.start;
  const path=[cursor];
  for(const stop of stops){
    if(!Number.isInteger(stop.x)||!Number.isInteger(stop.y)||stop.x<0||stop.x>=board.width||stop.y<0||stop.y>=board.height)return;
    const dx=Math.sign(stop.x-cursor.x),dy=Math.sign(stop.y-cursor.y);
    if((dx===0)===(dy===0))return;
    while(!sameFerryCell(cursor,stop)){
      cursor={x:cursor.x+dx,y:cursor.y+dy};
      if(board.rocks.some(rock=>sameFerryCell(rock,cursor)))return;
      path.push(cursor);
    }
  }
  return path;
}

export function checkProgrammingFerry(task:ProgrammingFerryTask,response:ProgrammingFerryResponse):Verdict {
  if(!safeProgram(response.program)||!safeProgram(response.repair)||response.follow.length>64||
    response.observations.length>(task.activity==='repair'?3:1))return fail('Käytä enintään 64 näkyvää käskyä ja kirjaa vain tehtävän ajot.');
  const scenario=task.cases[0]!;
  const actual=runFerryProgram(scenario.board,task.activity==='follow'?response.program:task.script??response.program);
  switch(task.activity){
    case 'follow': {
      const given=runFerryProgram(scenario.board,task.script!);
      return sameProgram(response.program,task.script!)&&response.follow.length===given.steps.length&&
        given.steps.every((step,i)=>!!response.follow[i]&&samePose(step.after,response.follow[i]!))?ok:
        fail('Tee ohjeen käskyt järjestyksessä. Kirjaa jokaisen askeleen ruutu ja keula, myös kun lautta kääntyy paikallaan.');
    }
    case 'author': return goalFeedback(actual,scenario);
    case 'plan': {
      const path=pathPlan(scenario.board,response.plan);
      if(!path)return fail('Jaa matka vähintään kahteen suoraksi kuljettavaan osaan. Suunnittele käännöspaikat ja kierrä karit.');
      const goal=goalFor({...actual,final:{...path.at(-1)!,heading:scenario.board.start.heading},visited:path},scenario);
      return goal.destination&&goal.via?ok:fail('Suunnitelman tulee kulkea sovittujen laiturien kautta ja päättyä kohdelaituriin.');
    }
    case 'encode': return sameProgram(response.program,expectedFerryCommands(task))?goalFeedback(actual,scenario):
      fail('Vertaa käskyjä suunnitelman vaiheisiin. Käännös ja eteneminen ovat eri käskyjä.');
    case 'predict': {
      const outcome=observed(actual,response.forecast??undefined,{scenario,forecast:true});
      return outcome.ok?observed(actual,response.observations[0],{scenario}):outcome;
    }
    case 'evaluate': return observed(actual,response.observations[0],{scenario,requireChecks:true});
    case 'test': return observed(actual,response.observations[0],{scenario,reference:task.reference!});
    case 'integrate': return observed(actual,response.observations[0],{scenario,requireChecks:true,reference:task.reference!});
    case 'repair': {
      const second=task.cases[1]!,program=task.script??response.program;
      const initial=observed(actual,response.observations[0],{scenario,requireChecks:true});
      if(!initial.ok)return initial;
      const firstGoal=goalFeedback(actual,scenario);
      if(!firstGoal.ok)return firstGoal;
      const before=runFerryProgram(second.board,program);
      const trial=observed(before,response.observations[1],{scenario:second,requireChecks:true});
      if(!trial.ok)return trial;
      const after=runFerryProgram(second.board,response.repair);
      const repaired=observed(after,response.observations[2],{scenario:second,requireChecks:true});
      return repaired.ok?goalFeedback(after,second):repaired;
    }
  }
}

const headings:Record<string,FerryHeading>={'1,0':'east','-1,0':'west','0,1':'south','0,-1':'north'};
function programFromRoute(board:FerryBoard,stops:readonly FerryCell[],finish?:FerryHeading):FerryCommand[] {
  let heading=board.start.heading,position:FerryCell=board.start;
  const program:FerryCommand[]=[];
  const turn=(to:FerryHeading)=>{
    const change=(ferryHeadings.indexOf(to)-ferryHeadings.indexOf(heading)+4)%4;
    if(change===3)program.push('left');
    else for(let i=0;i<change;i++)program.push('right');
    heading=to;
  };
  for(const stop of stops){
    const dx=stop.x-position.x,dy=stop.y-position.y;
    turn(headings[`${Math.sign(dx)},${Math.sign(dy)}`]!);
    for(let i=0;i<Math.abs(dx)+Math.abs(dy);i++)program.push('forward');
    position=stop;
  }
  if(finish)turn(finish);
  return program;
}

function recordRun(run:FerryRun,scenario:FerryScenario,reference?:readonly FerryCommand[]):FerryObservation {
  const {destination,heading,via}=goalFor(run,scenario);
  return {pose:run.final,status:ferryOutcome(run),executed:run.steps.length,checks:{destination,heading,via},
    ...(reference?{difference:firstFerryDifference(run,runFerryProgram(scenario.board,reference))}:{})};
}

export function solutionProgrammingFerry(task:ProgrammingFerryTask):ProgrammingFerryResponse {
  const answer=freshProgrammingFerryResponse(),c=task.cases[0]!;
  if(task.activity==='plan'){answer.plan=[...task.planStops!];return answer;}
  if(task.activity==='follow'){
    answer.program=[...task.script!];
    answer.follow=runFerryProgram(c.board,answer.program).steps.map(step=>step.after);
    return answer;
  }
  if(task.activity==='author'||task.activity==='encode'){
    answer.program=task.activity==='encode'?[...expectedFerryCommands(task)]:programFromRoute(c.board,task.planStops!,c.goal.heading);
    return answer;
  }
  const program=task.script??programFromRoute(c.board,task.planStops!,c.goal.heading);
  const run=runFerryProgram(c.board,program);
  answer.observations=[recordRun(run,c,task.reference)];
  if(task.activity==='predict')answer.forecast={...answer.observations[0]!,executed:0};
  if(task.activity==='repair'){
    const second=task.cases[1]!;
    if(!task.script)answer.program=[...program];
    // Authors provide a clear rectilinear demonstration itinerary for the changed case.
    answer.repair=programFromRoute(second.board,task.planStops!,second.goal.heading);
    answer.observations.push(recordRun(runFerryProgram(second.board,program),second),
      recordRun(runFerryProgram(second.board,answer.repair),second));
  }
  return answer;
}
export function wrongProgrammingFerryResponses(task:ProgrammingFerryTask):ProgrammingFerryResponse[] {
  const solution=solutionProgrammingFerry(task);
  switch(task.activity){
    case 'follow': return [{...solution,follow:[]}];
    case 'author': case 'encode': return [{...solution,program:[]}];
    case 'plan': return [{...solution,plan:[task.cases[0]!.goal.destination]}];
    case 'predict': return [{...solution,forecast:null}];
    case 'repair': return [{...solution,repair:[],observations:solution.observations.slice(0,2)}];
    case 'evaluate': case 'test': case 'integrate': return [{...solution,observations:[]}];
  }
}
