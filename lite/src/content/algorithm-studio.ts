import type {Rng} from '../engine/rng';
import type {Item,NodeSpec,Task} from '../engine/types';
import {cases} from './kit';
import {algorithmStudioPaint} from './scenes/algorithm-studio';
import {makeStudioProgram,runStudioCase,type AlgorithmStudioTask,type StudioActivity,type StudioRequirement} from './models/algorithm-studio';
type Factory=(r:Rng)=>Omit<Item,'tag'>;
const review={criteria:[{id:'method',label:'Kuvaa oman toimintatavan tai työkalun valinnan'},{id:'evidence',label:'Perustelee havainnoilla, miten tulos tai muutos vastaa tehtävää'}]};
function item(r:Rng,activity:StudioActivity,rule:StudioRequirement['rule'],context:StudioRequirement['context'],extra?:{bug?:'off-by-one'|'omit-bonus';research?:'rectangle'|'triangular'|'square'}):Omit<Item,'tag'> {
 const requirement:StudioRequirement={rule,context,factor:r.int(2,5),offset:r.int(0,4),bonus:r.int(1,4),maxInput:r.int(4,8)};
 const question=activity==='research'?'Tutki mallia työkalulla ja perustele rajattu johtopäätös.':activity==='test'?'Ennusta, kokeile ja paikanna ero ohjelman ja vaatimuksen välillä.':activity==='decompose'?'Jaa ongelma vaiheisiin ja määritä niiden rajapinnat.':['refactor','practice','integrate'].includes(activity)?'Tee ohjelmasta selkeämpi ja varmista, että sen toiminta säilyy.':'Rakenna ohjelma, ennusta ja testaa, miten se toimii.';
 const hint='Tarkista annetut syötteet, toisto ja lopetusehto. Vertaa omaa ennustetta havaintoon.';
 const task:AlgorithmStudioTask={kind:'algorithm-studio',activity,requirement,question,hint,...(extra?.bug?{bug:extra.bug}:{}),...(extra?.research?{research:{kind:extra.research,max:r.int(5,10)}}:{}),...(['refactor','practice','integrate','research'].includes(activity)?{review}:{})};
 const explain='Ohjelman toimintaa voi tutkia syötteillä ja seuraamalla sen vaiheita. Tässä tarkistetaan vain annetut syötteet.';
 return {task:task as unknown as Task,scene:algorithmStudioPaint(task),say:question,hint,explain};
}
function spec(id:string,stop:string,goal:string,a:[string,Factory],b:[string,Factory],transfer:Factory):NodeSpec {const rev=`algorithm-studio-${id.toLowerCase()}-v1`;return {id,stop,icon:'⚙',intro:'Saariston viestiasemalla Aava ja Loikka tutkivat koneen askelia.',goal,reward:'Viestiaseman työkalut täydentyvät.',rev,validRevs:[rev],produce:[a[0],b[0]],produceWhat:'rajattujen ohjelmien rakentamista ja tutkimista',demo:r=>{const d=a[1](r),t=d.task as unknown as AlgorithmStudioTask;return [{scene:host=>{algorithmStudioPaint(t)(host);const p=document.createElement('p'),result=runStudioCase(makeStudioProgram(t.requirement),t.requirement,1);p.textContent=`Esimerkki: syötteellä 1 koneen tulos on ${result.output??result.status}.`;host.append(p);},say:'Tässä esimerkissä koneen tulos tarkistetaan yhdellä syötteellä.'}];},item:cases({[a[0]]:r=>a[1](r),[b[0]]:r=>b[1](r)},r=>transfer(r))};}
const f=(activity:StudioActivity,rule:StudioRequirement['rule'],context:StudioRequirement['context'],extra?:Parameters<typeof item>[4]):Factory=>r=>item(r,activity,rule,context,extra);
export const algorithmStudioSpecs:NodeSpec[]=[
 spec('M79-ALGTH-01','Viestiaseman osat','Jaa ongelma ja kuvaa osien rajapinnat.',['linear',f('decompose','linear','lantern')],['condition',f('decompose','even-bonus','samples')],f('decompose','linear','snacks')),
 spec('M79-PROG-01','Ensimmäinen viestikone','Rakenna toistuva ja ehdollinen ohjelma.',['linear',f('program','linear','lantern')],['condition',f('program','even-bonus','samples')],f('program','share','snacks')),
 spec('M79-PROG-TEST','Koneen jälkien tutkimus','Ennusta ja tutki ohjelman virheitä.',['loop',f('test','linear','lantern',{bug:'off-by-one'})],['branch',f('test','even-bonus','samples',{bug:'omit-bonus'})],f('test','share','snacks')),
 spec('M79-PROG-CLEAR','Selkeä viestikone','Nimeä ja ryhmitä toiminta säilyttäen.',['linear',f('refactor','linear','lantern')],['condition',f('refactor','even-bonus','samples')],f('refactor','even-bonus','snacks')),
 spec('M79-PROG-PRACTICE','Työpajan tarkistuskierros','Muokkaa ja kokeile omaa ohjelmaa.',['linear',f('practice','linear','lantern')],['condition',f('practice','even-bonus','samples')],f('practice','linear','snacks')),
 spec('M79-PROG-02','Ohjelman kokonaiskoe','Rakenna, selkeytä ja testaa rajattu ohjelma.',['linear',f('integrate','linear','lantern')],['condition',f('integrate','even-bonus','samples')],f('integrate','even-bonus','snacks')),
 spec('M79-TECH-01','Tutkimusvälineen valinta','Tutki rajattua matemaattista mallia ja perustele havaintosi.',['area',f('research','linear','lantern',{research:'rectangle'})],['triangular',f('research','linear','samples',{research:'triangular'})],f('research','linear','snacks',{research:'square'}))
];
export const algorithmStudioEvidence:Readonly<Record<string,{families:readonly string[];limit:string}>>=Object.fromEntries(algorithmStudioSpecs.map(s=>[s.id,{families:s.produce??[],limit:'Rajattu virtuaalinen ohjelma tai numeerinen tutkimus; oma perustelu havainnoidaan aikuisen kanssa sitä vaativissa tehtävissä. Ei osoita yleistä ohjelmointitaitoa.'}]));
