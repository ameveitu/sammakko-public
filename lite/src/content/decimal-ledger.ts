import {cases} from './kit';
import type {Rng} from '../engine/rng';
import type {NodeSpec} from '../engine/types';
import {decimalLedgerBalances,decimalLedgerText,type DecimalLedgerTask} from './models/decimal-ledger';
import {decimalLedgerBoard} from './scenes/decimal-ledger';
function item(r:Rng,first:'+'|'−',transfer=false){
  const start=r.int(45,240),incoming=r.int(13,95),outgoing=r.int(11,first==='−'?start-1:start+incoming-1);
  const changes:DecimalLedgerTask['changes']=first==='+'?[{direction:'+',hundredths:incoming},{direction:'−',hundredths:outgoing}]:[{direction:'−',hundredths:outgoing},{direction:'+',hundredths:incoming}];
  const task:DecimalLedgerTask={kind:'decimal-ledger',startHundredths:start,changes,unit:transfer?'m':'l'};
  return {task,say:'Päivitä sama varauskirja tapahtuma kerrallaan. Kirjaa kummankin tapahtuman jälkeinen määrä.',hint:'Kohdista samat lukupaikat. Käytä toisen tapahtuman alussa ensimmäisestä saamaasi määrää.',explain:decimalLedgerBalances(task).map((n,i)=>`${i+1}. tapahtuman jälkeen ${decimalLedgerText(n)} ${task.unit}`).join('. ')};
}
const rev='exp690-decimal-ledger-v2';
export const decimalLedgerSpec:NodeSpec={id:'M-DEC-07',stop:'Aseman varauskirja',icon:'📒',intro:'Aava vastaanottaa ja lähettää erät samasta varastosta. Molemmat muutokset jäävät omaan varauskirjaan.',goal:'Laske saman desimaalitilanteen yhteen- ja vähennyslasku sekä molemmat välitulokset.',reward:'Koko varauskirja täsmää saapuneisiin ja lähteneisiin eriin.',rev,validRevs:[rev],produce:['ledger-in-out','ledger-out-in'],produceWhat:'molempien omien välitulosten kirjoittamista',item:cases({'ledger-in-out':r=>item(r,'+'),'ledger-out-in':r=>item(r,'−')},r=>item(r,r.pick(['+','−'] as const),true)),demo:r=>{const q=item(r,'+');return [{scene:decimalLedgerBoard(q.task),say:`Alussa ${decimalLedgerText(q.task.startHundredths)} l. Saapuva erä lisätään, lähtevä vähennetään samasta varauksesta.`},{scene:decimalLedgerBoard(q.task,true),say:q.explain}];}};
export const decimalLedgerEvidence:Readonly<Record<string,{families:readonly string[];limit:string}>>={'M-DEC-07':{families:['ledger-in-out','ledger-out-in'],limit:'V2 edellyttää samassa uudessa tilanteessa molempia omia välituloksia. V1:n yksittäinen loppumäärä säilyy historiassa eikä täytä tätä laajennettua näyttöä.'}};
