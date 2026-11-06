import { authoredClimaxes, climaxPhase, climaxPhaseText, hasAuthoredClimax } from '../authored-climaxes';
import type { ClimaxFixture } from '../authored-climaxes';
import type { Paint } from '../../engine/types';
import { brakingMotion, type ClimaxLessonModel } from '../../world/authored-climax';

/** Static SVGs use the same three semantic story states as the 3D timeline. */
function still(kind:ClimaxFixture,phase:'start'|'action'|'end',elapsed:number,model?:ClimaxLessonModel):string {
 const step=phase==='start'?0:phase==='action'?1:2;
 const solid='#284b55',water='#63aeb9',wood='#986a47',gold='#dca84e',paper='#f4edcf',green='#5b9778',red='#b45a48';
 const rect=(x:number,y:number,w:number,h:number,fill:string,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${fill}" ${extra}/>`;
 const line=(x1:number,y1:number,x2:number,y2:number,color=solid,width=4)=>`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
 const circle=(x:number,y:number,r:number,fill:string)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
 let body='';
 switch(kind){
 case 'channel': {
  const shares=model?.kind==='cake-shares'?[model.left,model.right]:null;
  body=rect(18,16,100,24,wood)+rect(18,51,100,24,wood)+rect(150,84,145,20,wood);
  for(let i=0;i<2;i++){const a=shares?.[i];const valid=a&&Number.isSafeInteger(a[0])&&Number.isSafeInteger(a[1])&&a[1]>0&&a[0]>=0&&a[0]<=a[1];const width=valid?Math.round(92*a[0]/a[1]):64;body+=rect(22,20+i*35,width,16,water);if(valid)for(let n=1;n<a[1]&&n<25;n++)body+=line(22+92*n/a[1],20+i*35,22+92*n/a[1],36+i*35,paper,1);}
  if(step)body+=line(119,29,150,94,water,6)+line(119,64,150,94,water,6)+rect(154,88,step===1?65:137,12,water);break;
 }
 case 'crate': {
  body=rect(47,91,226,12,wood);const d=model?.kind==='volume'?model.dimensions:null;
  if(d&&d.every(n=>Number.isInteger(n)&&n>0&&n<=5)){const [nx,,ny]=d;const cell=Math.min(24,170/nx,69/ny);for(let y=0;y<ny;y++)for(let x=0;x<nx;x++)if(step===2||(step===1&&y<Math.ceil(ny/2)))body+=rect(74+x*cell,88-(y+1)*cell,cell-2,cell-2,(x+y)%2?water:gold);body+=line(70,20,70,91)+line(70,91,250,91)+line(250,91,250,20);}else body+=rect(87,47,145,44,wood)+rect(83,[18,31,42][step]!,153,9,gold)+line(87,68,232,68,paper,2);break;
 }
 case 'map': body=rect(28,14,265,91,paper)+line(50,80,115,48,green,4)+line(115,48,185,68,green,4)+line(185,68,263,29,green,4)+circle(50,80,7,water)+circle(263,29,8,green)+circle(step===0?50:step===1?145:263,step===0?80:step===1?56:29,7,red);break;
 case 'brake': {const motion=brakingMotion((elapsed-2000)/6000),x=40+(motion.position+2)*46;body=line(20,93,295,93,solid,5)+rect(141,95,74,7,red)+rect(x,52,55,28,water)+circle(x+12,87,8,solid)+circle(x+43,87,8,solid)+rect(276,51,10,42,red);if(motion.braking)body+=line(x+35,44,x-7,44,red,4)+line(x-7,44,x+5,38,red,4)+line(x-7,44,x+5,50,red,4);break;}
 case 'boat': {const x=[55,145,220][step];body=rect(18,92,285,13,water)+rect(x,68,64,17,wood)+line(x+35,68,x+12,43,wood,5)+line(x+12,43,x+2,72,wood,5);if(step)body+=line(x-25,83,x-48,83,water,4)+line(x+78,59,x+101,59,gold,4);break;}
 case 'circuit': body=line(50,20,50,97)+line(270,20,270,97)+line(50,29,270,29)+line(50,88,270,88)+line(50,58,270,58)+rect(142,49,36,18,solid)+circle(160,29,12,step?gold:paper)+circle(160,88,12,step===2?gold:paper);break;
 case 'safety': body=rect(20,72,145,32,green)+line(64,72,64,35,wood,5)+circle(64,29,17,green)+line(114,72,114,42,wood,5)+circle(114,34,18,green)+rect(203,74,90,28,paper)+line(248,74,248,25,solid,3)+rect(226,17,45,20,water)+(step===2?circle(245,63,5,solid):circle(245,63,5,gold));break;
 case 'sail': {const y=[83,51,21][step];body=rect(67,91,181,15,wood)+line(138,93,138,13,solid,5)+`<path d="M144 ${y} L144 ${y+51} L214 ${y+51} Z" fill="${paper}" stroke="${solid}" stroke-width="2"/>`;break;}
 case 'lighthouse': {const y=[9,29,47][step];body=rect(117,65,90,44,paper)+rect(136,51,52,20,gold)+`<path d="M113 ${y+24} L162 ${y} L211 ${y+24} Z" fill="${red}" stroke="${solid}" stroke-width="2"/>`;break;}
 case 'tower': body=rect(90,99,144,9,wood);for(let y=0;y<3;y++){body+=rect(100,87-y*27,124,6,wood);if(step===2||(step===1&&y<2))body+=circle(127,73-y*27,10,gold)+circle(195,73-y*27,10,gold);}break;
 case 'stars': body=rect(25,12,270,98,solid)+circle(160,62,9,water);if(step)body+=`<ellipse cx="160" cy="62" rx="58" ry="24" fill="none" stroke="${gold}" stroke-width="2"/>`;if(step===2)body+=`<ellipse cx="160" cy="62" rx="112" ry="41" fill="none" stroke="${paper}" stroke-width="2"/>`+circle(78,44,3,paper)+circle(235,75,3,paper);break;
 case 'notebook': body=rect(35,13,250,95,paper)+line(160,20,160,100,wood,2)+rect(55,34,70,35,water)+(step?line(137,56,182,56,solid,3):'')+(step===2?rect(190,34,70,35,gold):'');break;
 }
 return `<svg viewBox="0 0 320 120" role="img" aria-label="${phase==='start'?'Alkutilanne':phase==='action'?'Tapahtuma':'Lopputilanne'}" style="display:block;width:100%;max-height:120px">${body}</svg>`;
}
/** Exact task workbench remains authoritative; never invent unprovided counts. */
export function authoredClimaxPaint(nodeId:string,elapsed:number,lessonModel?:ClimaxLessonModel):Paint {
 return host=>{
  host.replaceChildren();if(!hasAuthoredClimax(nodeId))return;
  const story=authoredClimaxes[nodeId],phase=climaxPhase(elapsed),section=document.createElement('section');section.className='authored-climax-fallback';
  const title=document.createElement('strong');title.textContent=story.title;
  const picture=document.createElement('div');picture.innerHTML=still(story.fixture,phase,elapsed,lessonModel);
  const line=document.createElement('p');line.textContent=climaxPhaseText(story,elapsed);
  const detail=document.createElement('p');detail.textContent='Pienoismalli havainnollistaa tapahtumaa. Tarkat tiedot ovat tehtävän työpinnalla.';
  if(lessonModel?.kind==='volume')detail.textContent=`Annettu laatikko: ${lessonModel.dimensions.join(' × ')} ${lessonModel.unit}. Syvyys näkyy tehtävän työpinnalla.`;
  else if(lessonModel?.kind==='map-scale')detail.textContent=`Kartan osuudet ${lessonModel.segmentsCm.join(' + ')} cm; annettu mittakaava ${lessonModel.metersPerCm} m/cm. Piirretty reitti on havainnollinen.`;
  else if(lessonModel?.kind==='cake-shares'){const {left,right}=lessonModel;detail.textContent=`Annetut osuudet ${left[0]}/${left[1]} ja ${right[0]}/${right[1]}; tarkka yhteisjako on tehtävän työpinnalla.`;if(phase==='end'&&[...left,...right].every(Number.isSafeInteger)&&left[1]>0&&right[1]>0&&Math.max(...left,...right)<1000)detail.textContent+=` Yhteensä ${left[0]*right[1]+right[0]*left[1]}/${left[1]*right[1]}.`; }
  const progress=document.createElement('p');progress.textContent=`Vaihe: ${phase==='start'?'alku':phase==='action'?'toiminta':'lopputilanne'}.`;
  section.append(title,picture,line,detail,progress);host.append(section);
 };
}
