import {parseMeasure} from './spatial-measures';
export interface DecimalLedgerTask {kind:'decimal-ledger';startHundredths:number;changes:readonly {direction:'+'|'−';hundredths:number}[];unit:'l'|'m'}
export interface DecimalLedgerResponse {kind:'decimal-ledger';balances:readonly string[]}
export const decimalLedgerText=(cents:number)=>`${Math.floor(cents/100)},${String(cents%100).padStart(2,'0')}`;
export function decimalLedgerBalances(task:DecimalLedgerTask):number[]{let n=task.startHundredths;return task.changes.map(change=>n+=change.direction==='+'?change.hundredths:-change.hundredths);}
export function checkDecimalLedger(task:DecimalLedgerTask,response:DecimalLedgerResponse):{ok:boolean;why?:string}{
  const fail={ok:false,why:'Kirjaa jokaisen tapahtuman jälkeinen määrä. Seuraava tapahtuma alkaa edellisestä omasta tuloksesta.'};
  if(!response||typeof response!=='object'||Object.getPrototypeOf(response)!==Object.prototype)return fail;
  const descriptors=Object.getOwnPropertyDescriptors(response);
  if(Reflect.ownKeys(descriptors).length!==2||!['kind','balances'].every(k=>descriptors[k]&&Object.hasOwn(descriptors[k]!,'value')))return fail;
  if(response.kind!=='decimal-ledger'||!Array.isArray(response.balances)||Object.getPrototypeOf(response.balances)!==Array.prototype||response.balances.length!==task.changes.length||Reflect.ownKeys(response.balances).length!==response.balances.length+1)return fail;
  const actual=Array.from({length:response.balances.length},(_,i)=>Object.getOwnPropertyDescriptor(response.balances,i));
  if(actual.some(d=>!d||!Object.hasOwn(d,'value')||typeof d.value!=='string'||d.value.length>50))return fail;
  const expected=decimalLedgerBalances(task);
  return {ok:actual.every((d,i)=>{const q=parseMeasure(d!.value);return !!q&&100n*q[0]===BigInt(expected[i]!)*q[1];}),why:fail.why};
}
export function solutionDecimalLedger(task:DecimalLedgerTask):DecimalLedgerResponse{return {kind:'decimal-ledger',balances:decimalLedgerBalances(task).map(decimalLedgerText)};}
export function wrongDecimalLedgerResponses(task:DecimalLedgerTask):DecimalLedgerResponse[]{const correct=solutionDecimalLedger(task);return [{...correct,balances:correct.balances.map((n,i)=>i?n:decimalLedgerText(decimalLedgerBalances(task)[0]!+1))}];}
