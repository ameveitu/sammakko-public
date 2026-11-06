import {
 inquiryRead,replayInquiryExperiment,replayInquiryModel,validInquiryModel,
 type InquiryConfiguration,type InquiryConstructedModel,type InquiryDirection,type InquiryIslandsResponse,type InquiryIslandsTask,type InquiryModelBoard,
} from './inquiry-islands';

export interface InquirySceneTrial {
 id:'A'|'B';configuration:InquiryConfiguration;placed:boolean;started:boolean;timeS:number;repeat:number;
 /** Readings the learner observed or recorded in this model; empty until they act. */
 records:readonly {repeat:number;timeS:number;x:number;y:number;quantity:number;direction:InquiryDirection;unit:string}[];
 observed:{timeS:number;x:number;y:number;quantity:number;direction:InquiryDirection;unit:string}|null;
}
export interface InquirySceneTest {observation:string;path:readonly string[]}
export type InquiryIslandsScene=
 |{kind:'inquiry-islands';title:string;mode:'experiment';apparatus:InquiryConfiguration['kind'];seconds:number;locked:boolean;trials:readonly InquirySceneTrial[];legend:string}
 |{kind:'inquiry-islands';title:string;mode:'model';apparatus:InquiryModelBoard['kind'];board:InquiryModelBoard;model:InquiryConstructedModel|null;locked:boolean;revealed:boolean;tests:readonly InquirySceneTest[];
   /** Only observations the learner can see on the cards: given ones, and the new one after it was opened. */
   observations:readonly {id:string;path:readonly string[];label:string}[];newFeature:string|null;legend:string};

const n=(q:readonly [bigint,bigint])=>Number(q[0])/Number(q[1]);
const reading=(r:NonNullable<ReturnType<typeof inquiryRead>>)=>({timeS:r.timeS,x:n(r.x),y:n(r.y),quantity:n(r.quantity),direction:r.direction,unit:r.unit});

/** Given apparatus and learner-operated results only. No forecast, target answer, solution witness or adult text. */
export function inquiryIslandsScene(task:InquiryIslandsTask,response?:InquiryIslandsResponse):InquiryIslandsScene|undefined{
 if(task.mode==='experiment'){
  const actions=response?.mode==='experiment'&&Array.isArray(response.actions)?response.actions:[];
  let replay;try{replay=replayInquiryExperiment(task,actions);}catch{replay=undefined;}
  replay??=replayInquiryExperiment(task,[])!;
  const trials=(['A','B'] as const).map(id=>{const t=replay.trials[id];return {id,configuration:{...t.configuration},placed:t.placed,started:t.started,timeS:t.timeS,repeat:t.repeat,
   records:t.records.map(r=>({repeat:r.repeat,...reading(r.reading)})),observed:t.observed?reading(t.observed):null};});
  return {kind:'inquiry-islands',title:task.title,mode:'experiment',apparatus:task.setup.kind,seconds:task.setup.seconds,locked:replay.locked,trials,
   legend:`${task.setup.name}. ${task.setup.scope} Näkymä näyttää vain oppijan käynnistämät ja havainnoimat kokeet.`};
 }
 if(task.mode==='model'){
  const actions=response?.mode==='model'&&Array.isArray(response.actions)?response.actions:[];
  let replay;try{replay=replayInquiryModel(task,actions);}catch{replay=undefined;}
  const model=replay?.current&&validInquiryModel(replay.current,task.board)?replay.current:null;const revealed=!!replay?.revealed;
  const tests=(replay?.tests??[]).map(t=>({observation:t.observation,path:[...t.path]}));
  const observations=[...task.observations,...(revealed&&task.newObservation?[task.newObservation]:[])].map(o=>({id:o.id,path:[...o.path],label:o.label}));
  return {kind:'inquiry-islands',title:task.title,mode:'model',apparatus:task.board.kind,board:task.board,model:model?structuredClone(model):null,locked:!!replay?.locked,revealed,tests,observations,
   newFeature:revealed?task.newFeature??null:null,legend:task.scope};
 }
 return;
}
