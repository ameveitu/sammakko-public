import { expect,it } from 'vitest';
import { dataProbabilityEvidence,dataProbabilitySpecs } from '../src/content/data-probability';
import {
  checkDataProbability,compareChances,modes,solutionDataProbability,wrongDataProbabilityResponses,
  type DataChartAction,type DataChartResponse,type DataProbabilityResponse,
} from '../src/content/models/data-probability';
import { rng } from '../src/engine/rng';

const ids=['M-DATA-06','M-DATA-07','M-DATA-08','M-DATA-11','M-DATA-12','M-PROB-01','M-PROB-02','M-PROB-03',
  'M-PROB-04','M-PROB-05','M-PROB-06','M-STAT-01','M-STAT-02','M-STAT-03','M-STAT-05'];
const node=(id:string)=>dataProbabilitySpecs.find(spec=>spec.id===id)!;
function find(id:string,tag:string) {
  for(let seed=0;seed<64;seed++){
    const item=node(id).item(rng(seed),tag==='transfer'?'transfer':'independent');
    if(item.tag===tag&&item.task.kind==='data-probability')return item.task;
  }
  throw new Error(`Missing data task ${id}: ${tag}`);
}
const response=(patch:Partial<DataProbabilityResponse>={}):DataProbabilityResponse=>
  ({kind:'data-probability',values:{},sets:{},tuples:[],chart:null,...patch});
function buildChart(action:DataChartAction,patch:Partial<DataChartResponse>={}) {
  const chart:DataChartResponse={type:'bar',reason:'',title:'data',category:'categories',value:'counts',
    baseline:0,step:2,top:12,key:2,heights:Object.fromEntries(action.rows.map(row=>[row.id,row.value])),...patch};
  return response({chart});
}

it('covers exactly the 15 assigned nodes with private revisions and authored examples',()=>{
  expect(dataProbabilitySpecs.map(spec=>spec.id)).toEqual(ids);
  expect(Object.keys(dataProbabilityEvidence)).toEqual(ids);
  expect(new Set(dataProbabilitySpecs.map(spec=>spec.rev)).size).toBe(ids.length);
  for(const spec of dataProbabilitySpecs){
    expect(spec.validRevs).toEqual(spec.rev?.endsWith('-v2')?[spec.rev.replace(/-v2$/,'-v1'),spec.rev]:[spec.rev]);
    expect(dataProbabilityEvidence[spec.id]!.limit.length).toBeGreaterThan(35);
    for(const demo of spec.demo(rng(7))){
      const host={innerHTML:''} as HTMLElement;
      demo.scene(host);
      expect(host.innerHTML).toContain('data-probability-board');
    }
  }
});
it.each(ids)('%s balances two deterministic families and transfer across seeds',id=>{
  const seen=new Set<string>(),spec=node(id);
  for(const phase of ['guided','independent','retrieval','transfer'] as const)for(let seed=0;seed<24;seed++){
    const item=spec.item(rng(seed),phase);
    expect(item).toEqual(spec.item(rng(seed),phase));
    if(item.task.kind!=='data-probability')throw new Error('Wrong kind');
    seen.add(item.tag);
    expect(checkDataProbability(item.task,solutionDataProbability(item.task)).ok).toBe(true);
    for(const wrong of wrongDataProbabilityResponses(item.task))expect(checkDataProbability(item.task,wrong).ok).toBe(false);
  }
  expect(seen).toEqual(new Set([...dataProbabilityEvidence[id]!.families,'transfer']));
});
it('accepts alternate zero-based scales, zero bars and intermediate heights but rejects misleading axes',()=>{
  const task=find('M-DATA-07','build-zero-valued-category'),action=task.action as DataChartAction;
  const valid=buildChart(action), alternate=buildChart(action,{step:1,top:8});
  expect(checkDataProbability(task,valid).ok).toBe(true);
  expect(checkDataProbability(task,alternate).ok).toBe(true);
  for(const edit of [{baseline:1},{step:2.5},{top:5},{step:5,top:12},{value:'distance'},
    {heights:{...valid.chart!.heights,'0':1}},{heights:{...valid.chart!.heights,'1':null}}]){
    expect(checkDataProbability(task,buildChart(action,edit)).ok).toBe(false);
  }
});
it('accepts every fitting diagram/reason pair and distinct valid same-size picture keys',()=>{
  const task=find('M-DATA-11','choose-unordered-category-display'),action=task.action as DataChartAction;
  expect(checkDataProbability(task,buildChart(action,{reason:'classes'})).ok).toBe(true);
  for(const key of [1,2])for(const reason of ['classes','pictures']){
    expect(checkDataProbability(task,buildChart(action,{type:'picture',reason,key})).ok).toBe(true);
  }
  expect(checkDataProbability(task,buildChart(action,{type:'picture',reason:'classes',key:4})).ok).toBe(false);
  expect(checkDataProbability(task,buildChart(action,{type:'line',reason:'classes'})).ok).toBe(false);
  const time=find('M-DATA-11','transfer'),timeAction=time.action as DataChartAction;
  for(const type of ['bar','line'] as const)for(const reason of ['ordered','changes']){
    expect(checkDataProbability(time,buildChart(timeAction,{type,reason,step:5,top:60})).ok).toBe(true);
  }
  expect(checkDataProbability(time,buildChart(timeAction,{type:'picture',reason:'pictures',key:1})).ok).toBe(false);
});
it('enumerates all physical pairs in arbitrary order while rejecting one dropped lookalike or a duplicate',()=>{
  const task=find('M-PROB-02','transfer');
  if(task.board.kind!=='product')throw new Error('Wrong source');
  const [a,b]=task.board.groups,tuples:string[][]=[];
  for(const y of [...b].reverse())for(const x of a)tuples.push([x.id,y.id]);
  expect(tuples).toHaveLength(6);
  const values={total:'6'};
  expect(checkDataProbability(task,response({values,tuples})).ok).toBe(true);
  for(const wrong of [tuples.slice(1),[tuples[1]!,...tuples.slice(1)],tuples.map(p=>[p[1]!,p[0]!])]){
    expect(checkDataProbability(task,response({values,tuples:wrong})).ok).toBe(false);
  }
});
it('requires event and complement to cover distinct identifiers without overlap',()=>{
  const task=find('M-PROB-06','transfer');
  if(task.board.kind!=='bags')throw new Error('Wrong source');
  const event:string[]=[],other:string[]=[];
  for(const token of task.board.bags[0]!.tokens){
    const label=token.label.split(' ')[0]!;
    (Number(label)>2?event:other).unshift(token.id);
  }
  const values={combined:String(event.length+other.length)};
  expect(checkDataProbability(task,response({values,sets:{event,other}})).ok).toBe(true);
  expect(checkDataProbability(task,response({values,sets:{event,other:[event[0]!,...other.slice(1)]}})).ok).toBe(false);
});
it('compares same favorable counts with different totals, admits ties and guards impossible draws',()=>{
  expect(compareChances(2,4,3,6)).toBe('equal');
  expect(compareChances(2,4,2,7)).toBe('a');
  expect(compareChances(1,8,1,4)).toBe('b');
  expect(compareChances(0,4,0,2)).toBe('equal');
  expect(compareChances(0,0,2,7)).toBeUndefined();
  expect(compareChances(5,4,2,7)).toBeUndefined();
  for(const tag of ['compare-equal-favorable-shares','transfer']){
    const task=find('M-PROB-04',tag);
    if(task.board.kind!=='bags')throw new Error('Wrong source');
    const [a,b]=task.board.bags.map(bag=>[bag.tokens.filter(token=>token.label.startsWith('Sininen')).length,bag.tokens.length]);
    const left=a![0]!/a![1]!,right=b![0]!/b![1]!;
    const values={aBlue:String(a![0]),aTotal:String(a![1]),bBlue:String(b![0]),bTotal:String(b![1]),
      order:left===right?'equal':left>right?'a':'b'};
    expect(checkDataProbability(task,response({values})).ok).toBe(true);
    expect(checkDataProbability(task,response({values:{...values,order:values.order==='equal'?'a':'equal'}})).ok).toBe(false);
  }
});
it('keeps repeated signed extrema and separates no mode from multiple modes',()=>{
  for(const [id,tag,expected] of [['M-STAT-01','minimum-signed-table',-4],['M-STAT-02','maximum-signed-table',2]] as const){
    const task=find(id,tag);
    if(task.board.kind!=='table')throw new Error('Wrong source');
    const locations=task.board.rows.filter(row=>row.value===expected).map(row=>row.id);
    const values={extreme:String(expected),unit:'deg'};
    expect(locations).toHaveLength(2);
    expect(checkDataProbability(task,response({values,sets:{locations}})).ok).toBe(true);
    expect(checkDataProbability(task,response({values,sets:{locations:locations.slice(1)}})).ok).toBe(false);
  }
  const observations=(values:number[])=>values.map((value,i)=>({id:String(i),label:String(i),value}));
  expect(modes(observations([2,2,3,3,8]))).toEqual([2,3]);
  expect(modes(observations([2,2,3,3]))).toEqual([]);
  expect(modes(observations([4,4,4]))).toEqual([4]);
});
it('accepts an exact fractional or decimal mean and rejects dividing by distinct values',()=>{
  const task=find('M-STAT-05','transfer');
  for(const mean of ['17/4','34/8','4,25']){
    expect(checkDataProbability(task,response({values:{sum:'17',count:'4',mean,meaning:'equal'}})).ok).toBe(true);
  }
  expect(checkDataProbability(task,response({values:{sum:'17',count:'3',mean:'17/3',meaning:'equal'}})).ok).toBe(false);
  expect(checkDataProbability(task,response({values:{sum:'17',count:'4',mean:'17/4',meaning:'same'}})).ok).toBe(false);
});

it.each(['M-PROB-01','M-PROB-02','M-PROB-03','M-PROB-06'])('%s has distinct givens for fresh attempts across many seeds',id=>{
  const datasets=new Set<string>();
  for(let seed=0;seed<160;seed++){
    const task=node(id).item(rng(seed),'independent').task;
    if(task.kind!=='data-probability')throw new Error('Wrong data kind');
    const groups=task.board.kind==='bags'?task.board.bags.map(bag=>bag.tokens):
      task.board.kind==='product'?task.board.groups:[];
    datasets.add(JSON.stringify(groups.map(group=>group.map(token=>token.label.replace(/ [A-Z]\d+$/,'')).sort())));
  }
  expect(datasets.size).toBeGreaterThanOrEqual(8);
});
