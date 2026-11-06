import {h} from '../../ui/dom';
import type {Paint} from '../../engine/types';
import {parseMeasure} from '../models/spatial-measures';
import {decimalLedgerText,solutionDecimalLedger,type DecimalLedgerTask,type DecimalLedgerResponse} from '../models/decimal-ledger';
export function decimalLedgerBoard(task:DecimalLedgerTask,revealed=false):Paint{return host=>{
  const result=solutionDecimalLedger(task);
  host.replaceChildren(h('div',{style:'display:grid;gap:10px'},h('strong',{},`Alussa ${decimalLedgerText(task.startHundredths)} ${task.unit}`),...task.changes.map((change,i)=>h('p',{},`${i+1}. ${change.direction==='+'?'Saapuu':'Lähtee'} ${decimalLedgerText(change.hundredths)} ${task.unit}${revealed?` → ${result.balances[i]} ${task.unit}`:''}`))));
};}
export function mountDecimalLedger(task:DecimalLedgerTask,host:HTMLElement,submit:(response:DecimalLedgerResponse)=>void){
  const inputs=task.changes.map((change,i)=>{
    const input=h('input',{type:'text',inputmode:'decimal','aria-label':`Määrä tapahtuman ${i+1} jälkeen`,style:'min-height:46px;width:120px;max-width:40%;font:inherit;border:1px solid #789b8d;border-radius:9px;padding:6px;box-sizing:border-box'});
    return {input,row:h('label',{style:'display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #d1ded1'},h('span',{},h('strong',{},`${i+1}. ${change.direction==='+'?'Saapuu':'Lähtee'} ${decimalLedgerText(change.hundredths)} ${task.unit}`),h('small',{style:'display:block'},'Määrä tämän jälkeen')),input)};
  });
  host.append(h('div',{'data-decimal-ledger':'',style:'display:grid;gap:12px'},h('p',{},`Alussa ${decimalLedgerText(task.startHundredths)} ${task.unit}. Yksi kokonainen on 1 ${task.unit}.`),...inputs.map(i=>i.row),h('button',{type:'button',class:'btn primary wide',onclick:()=>submit({kind:'decimal-ledger',balances:inputs.map(({input})=>parseMeasure(input.value)?input.value.slice(0,50):'')})},'Tarkista koko varauskirja')));
  return {reveal(){const answer=solutionDecimalLedger(task);inputs.forEach(({input},i)=>{input.value=answer.balances[i]!;});}};
}
