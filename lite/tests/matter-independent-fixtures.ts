import type { MatterCyclesTask, MatterCyclesResponse, CycleProcess, CycleEdge, CycleReservoir, CycleProcessKind, ReservoirCard } from '../src/content/models/matter-cycles';

// Peer oracle: physical source/destination table and integer incidence accounting.
// Does not import the production endpoint, replay, solution or owner fixture functions.
function edge(p:CycleProcess,zones:readonly CycleReservoir[]):CycleEdge {
  const ambient=p.medium==='aquatic'?'water':'air';
  const pair:Partial<Record<CycleProcessKind,readonly [string,string]>>={
    evaporation:['sea','vapor'],condensation:['vapor','cloud'],rain:['cloud','river'],runoff:['river','sea'],infiltration:['river','groundwater'],'groundwater-flow':['groundwater','sea'],freezing:['cloud','snow'],melting:['snow','river'],store:['snow','snow'],
    photosynthesis:[ambient,'plant'],respiration:[p.subject??'plant',ambient],feeding:['plant','animal'],litter:[p.subject??'plant','soil'],decomposition:['soil',ambient],combustion:[p.fuel==='fossil'?'geological':'plant','air'],dissolution:['air','water'],release:['water','air'],
  };
  const [a,b]=pair[p.kind]!;
  return {process:p.id,from:zones.find(z=>z.kind===a)!.id,to:zones.find(z=>z.kind===b)!.id};
}
const assignments=(cards:readonly ReservoirCard[],zones:readonly CycleReservoir[])=>cards.map(c=>({card:c.id,reservoir:Object.entries(c.formula).some(([e,n])=>e==='C'&&n>0)?zones.find(z=>z.kind===c.location)!.id:null}));
export function matterPeerAnswer(t:MatterCyclesTask,waterReturn:'surface'|'ground'='ground'):MatterCyclesResponse {
  const kind='matter-cycles' as const,review=t.review?{channel:'spoken' as const,observations:Object.fromEntries(t.review.rubric.map(c=>[c.id,'met' as const])),confirmedByAdult:true,assistance:'none' as const}:undefined;
  if(t.mode==='conservation'){
    const total=Number(t.initial.reduce((n,p)=>n+BigInt(p.amountMg),0n));
    return {kind,mode:t.mode,predictedTotalMg:total,totalMg:total,targetMg:t.initial.filter(p=>p.reservoir===t.target).reduce((n,p)=>n+p.amountMg,0)+t.amountMg,locked:true,energyIsMatter:false,moves:[{run:t.run,id:'peer-transfer',process:t.operation.id,from:t.source,to:t.target,amountMg:t.amountMg}]};
  }
  if(t.mode==='water-path'){
    const edges=t.processes.map(p=>edge(p,t.reservoirs));
    const underground=t.requiredProcesses.includes('groundwater-flow')||!!t.mustStore&&waterReturn==='ground';
    const route:CycleProcessKind[]=['evaporation','condensation',...(t.mustStore?['freezing','store','melting'] as const:['rain'] as const),...(underground?['infiltration','groundwater-flow'] as const:['runoff'] as const)];
    return {kind,mode:t.mode,edges,locked:true,cloud:'droplets-or-ice',storedAt:t.mustStore,moves:route.map((k,i)=>{const p=t.processes.find(p=>p.kind===k)!;return {...edge(p,t.reservoirs),run:t.run,id:`peer-step-${i}`,amountMg:t.amountMg};})};
  }
  if(t.mode==='photosynthesis'){
    const roles={water:'input',co2:'input',organic:'output',oxygen:'output',light:'energy',soil:'not-main-carbon-source'} as const;
    return {kind,mode:t.mode,roles:t.cards.map(c=>({card:c.id,role:roles[c.material]})),trace:[t.cards.find(c=>c.material==='co2')!.id,t.plant,t.cards.find(c=>c.material==='organic')!.id],dayCarbonMg:t.carbonMg,darkPhotoCarbonMg:0,locked:true,observed:true,rejectedCard:t.variant==='repair-energy-as-matter'?t.cards.find(c=>c.material==='light')!.id:null};
  }
  if(t.mode==='reservoirs')return {kind,mode:t.mode,assignments:assignments(t.cards,t.reservoirs),totalCarbonMg:Number(t.cards.reduce((n,c)=>n+BigInt(c.carbonMg),0n))};
  const edges=t.processes.map(p=>edge(p,t.reservoirs));
  const delta=t.processes.reduce((n,p,i)=>n+BigInt(p.amountMg)*(BigInt(Number(edges[i]!.to===t.focus))-BigInt(Number(edges[i]!.from===t.focus))),0n);
  return {kind,mode:t.mode,edges,assignments:assignments(t.cards??[],t.reservoirs),returnPath:t.requireReturn?t.mustReturnVia.length?[t.focus,'plant','animal','soil',t.focus]:[t.focus,'plant',t.focus]:[],locked:true,moves:edges.map((e,i)=>({...e,run:t.run,id:`peer-flow-${i}`,amountMg:t.processes[i]!.amountMg})),focusChangeMg:Number(delta),longStore:t.goal==='burn'?'geological':null,...(t.goal==='burn-trace'?{energyIsMatter:false}:{}),...(review?{review}:{})};
}
