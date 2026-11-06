import type { Task, Response } from '../../engine/types';
import { check } from '../../engine/check';
import { parseMeasure } from './spatial-measures';
import { solutionMassState } from './solution-lab';

/** Ephemeral visual data, never evidence or a saved answer. No prose or adult observations. */
export type FamilyLessonSnapshot = { kind: 'family-lesson'; nodeId: string } & (
  | { activity: 'triangle-converse'; triangles: { vertices: number[][]; lengths: (number | null)[]; classification: 'acute' | 'right' | 'obtuse' }[] }
  | { activity: 'square-roots'; radicand: number; roots: number[]; principal: number | null }
  | { activity: 'system-graph'; equations: number[][]; relation: 'one' | 'none' | 'many'; points: number[][] }
  | { activity: 'combinations'; factors: string[][]; rows: string[][]; forbidden: string[][]; count: number }
  | { activity: 'chemical-balance'; left: string[]; right: string[]; coefficients: number[]; atoms: { element: string; left: number; right: number }[] }
  | { activity: 'concentration'; unit: 'g'; basis: 'mass-mass'; solute: number; total: number; percent: number; retainedSolute: number; retainedTotal: number; operation: 'none' | 'dilute' | 'aliquot' }
);
const ids = new Set(['M79-PYTH-CONVERSE','M79-QUAD-INCOMP-02','M79-SYSTEM-GRAPH','M79-COMB-01','CHEM79-BALANCE','CHEM79-CONC-CALC']);
const number = (value: string) => { const q = parseMeasure(value); return q ? Number(q[0])/Number(q[1]) : NaN; };
const rational = (q: readonly [bigint,bigint]) => Number(q[0])/Number(q[1]);

/** A fresh allowlisted projection only after a complete successful domain/adult check. */
export function checkedFamilyLessonSnapshot(nodeId: string, task: Task, response: Response): FamilyLessonSnapshot | undefined {
  if (!ids.has(nodeId) || !check(task, response).ok) return;
  const base = { kind: 'family-lesson' as const, nodeId };
  if (nodeId==='M79-PYTH-CONVERSE' && task.kind==='right-triangle' && response.kind==='right-triangle' && task.jobs.every(j=>j.kind==='converse')) {
    const triangles=task.jobs.map((job,i)=>{const diagram=task.diagrams[job.board]!;return {vertices:diagram.points.map(p=>[...p]),lengths:[0,1,2].map(i=>diagram.known[i as 0|1|2]??null),classification:response.work[i]!.judgment!};});
    return {...base,activity:'triangle-converse',triangles};
  }
  if (nodeId==='M79-QUAD-INCOMP-02' && task.kind==='equation-workshop' && task.activity==='square-roots' && response.kind==='equation-workshop' && response.activity==='square-roots') {
    const r=task.radicand;
    return {...base,activity:'square-roots',radicand:r,roots:r<0?[]:r===0?[0]:[-Math.sqrt(r),Math.sqrt(r)],principal:r<0?null:Math.sqrt(r)};
  }
  if (nodeId==='M79-SYSTEM-GRAPH' && task.kind==='relation-workshop' && task.mode==='system-graph' && response.kind==='relation-workshop' && response.mode==='system-graph')
    return {...base,activity:'system-graph',equations:task.equations.map(e=>[...e]),relation:response.type!,points:response.points.map(p=>[number(p.x),number(p.y)])};
  if (nodeId==='M79-COMB-01' && task.kind==='logic-workshop' && task.mode==='combinations' && response.kind==='logic-workshop' && response.mode==='combinations')
    return {...base,activity:'combinations',factors:task.factors.map(f=>f.options.map(o=>o.id)),rows:response.rows.map(row=>[...row]),forbidden:task.forbidden.map(row=>[...row]),count:response.rows.length};
  if (nodeId==='CHEM79-BALANCE' && task.kind==='chemical-notation' && task.mode==='balance' && response.kind==='chemical-notation' && response.mode==='balance')
    return {...base,activity:'chemical-balance',left:task.reaction.left.map(s=>s.formula),right:task.reaction.right.map(s=>s.formula),coefficients:[...response.coefficients],atoms:Object.keys(response.left).sort().map(element=>({element,left:response.left[element as keyof typeof response.left]!,right:response.right[element as keyof typeof response.right]!}))};
  if (nodeId==='CHEM79-CONC-CALC' && task.kind==='solution-lab' && task.mode==='concentration' && response.kind==='solution-lab' && response.mode==='concentration') {
    const state=solutionMassState(task.sample,response.operation);if(!state)return;
    return {...base,activity:'concentration',unit:'g',basis:'mass-mass',solute:rational(state.target.solute),total:rational(state.target.total),percent:number(response.percent),retainedSolute:rational(state.source.solute),retainedTotal:rational(state.source.total),operation:task.operation?.kind??'none'};
  }
  return undefined;
}
