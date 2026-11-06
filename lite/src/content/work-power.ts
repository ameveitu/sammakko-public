import type { Rng } from '../engine/rng';
import type { Item, NodeSpec, Task } from '../engine/types';
import { cases, choose, txt } from './kit';
import { workJ, powerW, type Lift } from './models/work-power';
import { workPowerPaint, type WorkPowerScene } from './scenes/work-power';
type Draft=Omit<Item,'tag'> & {sceneModel:WorkPowerScene};
type Factory=(r:Rng,transfer?:boolean)=>Draft;
const lift=(forceN:number,distanceM:number,durationS:number,direction:Lift['direction']='parallel'):Lift=>({forceN,distanceM,durationS,direction});
function item(lifts:Lift[], given:string,task:Task,say:string,hint:string,explain:string):Draft {
 const m:WorkPowerScene={kind:'work-power',title:'Sulan vinssilava',given,lifts,durationS:Math.max(...lifts.map(x=>x.durationS))};
 return {sceneModel:m,scene:workPowerPaint(m),task,say,hint,explain,afterCorrect:host=>{workPowerPaint(m)(host);const p=document.createElement('p');p.textContent=explain;host.append(p);}};
}
function spec(id:string,stop:string,goal:string,a:[string,Factory],b:[string,Factory],transfer:Factory):NodeSpec {
 const oldRev=`work-power-${id.toLowerCase()}-v1`,rev=id==='PHY79-POWER-CALC'?`work-power-${id.toLowerCase()}-v2`:oldRev;return {id,stop,icon:'⚙️',intro:'Aava ja Sulka tutkivat retkikorin liikettä vinssilavalla.',goal,reward:'Vinssin toimintakortti valmistuu ja kori saavuttaa tasanteen.',rev,validRevs:rev===oldRev?[rev]:[oldRev,rev],produce:[a[0],b[0]],produceWhat:'työn ja tehon suhteiden ratkaisemista',demo:r=>{const d=a[1](r);return [{scene:d.afterCorrect!,sceneModel:d.sceneModel,say:d.explain}];},item:cases({[a[0]]:r=>a[1](r),[b[0]]:r=>b[1](r)},r=>transfer(r,true))};
}
function workConcept(r:Rng,kind:'lift'|'hold'|'horizontal'|'pull'):Draft {
 const l=kind==='hold'?lift(10,0,2,'hold'):kind==='horizontal'?lift(10,2,2,'perpendicular'):kind==='pull'?lift(10,2,2,'horizontal'):lift(10,2,2),given=kind==='hold'?'Köysi kannattelee koria paikallaan: voima 10 N ylöspäin, siirtymä 0 m.':kind==='horizontal'?'Koria siirretään 2 m vaakasuoraan. Tarkasteltava kannatteluvoima on 10 N pystysuoraan ylöspäin.':kind==='pull'?'Köysi vetää retkikoria vaakasuoraan 2 m vakiovoimalla 10 N liikkeen suuntaan.':'Vinssi nostaa koria 2 m ylöspäin vakiovoimalla 10 N, voiman suuntaan.';
 const answer=(kind==='lift'||kind==='pull')?'Köyden voima tekee työtä koriin ja siirtää siihen energiaa.':'Tarkasteltava voima ei tee mekaanista työtä koriin.';
 return item([l],given,choose(r,txt(answer),[txt((kind==='lift'||kind==='pull')?'Köyden voima ei tee työtä koriin.':'Kannatteluvoima tekee aina työtä, jos se väsyttää.'),txt('Työ riippuu vain kuluneesta ajasta.')]),'Ennusta tarkasteltavan voiman työ.','Vertaa voiman suuntaa kuorman siirtymään.',(kind==='lift'||kind==='pull')?'Voima ja siirtymä ovat samansuuntaiset: köysi siirtää energiaa koriin mekaanisena työnä.':kind==='hold'?'Paikallaan siirtymä on 0 m, joten köyden työ koriin on 0 J. Ihminen voi silti väsyä.':'Pystysuora voima ja vaakasiirtymä ovat kohtisuorassa: tämän voiman työ on 0 J.');
}
function calcWork(r:Rng,kind:'small'|'large',transfer=false):Draft {
 const f=r.pick(kind==='small'?[4,6,8]:[12,15,20]),s=transfer?5:r.pick([2,3,4]),l=lift(f,s,2,kind==='large'?'horizontal':'parallel'),w=workJ(l);
 return item([l],`Vakio ${kind==='large'?'vaakasuora vetovoima':'nostovoima'} ${f} N ja samansuuntainen siirtymä ${s} m.`,{kind:'numeric',answer:w,unit:'J',label:'Työ jouleina'},'Laske voiman tekemä työ jouleina.','Kerro vakio voima ja sen suuntainen siirtymä.',`${f} N · ${s} m = ${w} J. 1 J = 1 N·m; aika ei ole työn kaavassa.`);
}
function conceptPower(r:Rng,kind:'same-work'|'same-power',transfer=false):Draft {
 const ls=kind==='same-work'?[lift(10,2,2),lift(10,2,4)]:transfer?[lift(10,3,3),lift(10,5,5)]:[lift(10,2,2),lift(10,4,4)];
 const given=kind==='same-work'?'Vinssit A ja B nostavat samanlaiset korit samalla 10 N voimalla 2 m. Aikaa kuluu A: 2 s, B: 4 s.':transfer?'Vinssi A tekee 30 J työtä 3 s:ssa ja B tekee 50 J työtä 5 s:ssa. Työarvot ovat tässä annetut.':'Vinssi A tekee 20 J työtä 2 s:ssa ja B tekee 40 J työtä 4 s:ssa. Työarvot ovat tässä annetut.';
 const correct=kind==='same-work'?'A:n teho on suurempi, vaikka työ on sama.':'Tehot ovat yhtä suuret, vaikka työt ovat eri suuret.';
 return item(ls,given,choose(r,txt(correct),[txt(kind==='same-work'?'B:n teho on suurempi, koska aika on pidempi.':'B:n teho on suurempi, koska työ on suurempi.'),txt('Teho on sama asia kuin voima.')]),transfer?'Vertaa eri töitä ja aikoja.':'Ennusta vinssien tehojen suhde.','Vertaa kummankin työtä ja siihen kuluvaa aikaa.',kind==='same-work'?'Sama 20 J työ lyhyemmässä ajassa antaa suuremman tehon: A 10 W ja B 5 W.':transfer?'30 J / 3 s = 10 W ja 50 J / 5 s = 10 W. Samalla teholla voidaan tehdä eri työ eri ajassa.':'20 J / 2 s = 10 W ja 40 J / 4 s = 10 W. Samalla teholla voidaan tehdä eri työ eri ajassa.');
}
function calcPower(r:Rng,kind:'short'|'long',transfer=false):Draft {
 const t=r.pick(kind==='short'?[2,3]:[4,5]),p=transfer?12:r.pick([6,12,18,24,30,36,42,48,54,60]),w=t*p,d=t===2?3:2,f=w/d,l=lift(f,d,t);
 return item([l],`Nostovoima ${f} N ja korkeus ${d} m: vinssin tekemä työ on ${w} J. Kesto ${t} s.`,{kind:'numeric',answer:powerW(w,t),unit:'W',label:'Teho watteina'},'Laske keskimääräinen teho watteina.','Jaa työ positiivisella ajalla.',`${w} J / ${t} s = ${p} W. Sama ${w} J työ puolessa ajassa antaisi ${2*p} W. Watti on joule sekunnissa (J/s), joule on työn yksikkö.`);
}
export const workPowerSpecs:NodeSpec[]=[
 spec('PHY79-WORK-CONCEPT','Hissikorin nousu','Erota mekaaninen työ kannattelusta.',['lift',r=>workConcept(r,'lift')],['hold',r=>workConcept(r,r.pick(['hold','horizontal']))],r=>workConcept(r,'pull')),
 spec('PHY79-WORK-CALC','Hissin nostotyön määrä','Laske vakion samansuuntaisen voiman työ.',['small',r=>calcWork(r,'small')],['large',r=>calcWork(r,'large')],r=>calcWork(r,'large',true)),
 spec('PHY79-POWER-CONCEPT','Kaksi nostajaa','Vertaa työtä ja aikaa tehon käsitteen avulla.',['same-work',r=>conceptPower(r,'same-work')],['same-power',r=>conceptPower(r,'same-power')],r=>conceptPower(r,'same-power',true)),
 spec('PHY79-POWER-CALC','Vinssin toimintakortti','Laske keskimääräinen teho työstä ja ajasta.',['short',r=>calcPower(r,'short')],['long',r=>calcPower(r,'long')],r=>calcPower(r,'long',true))];
export const workPowerEvidence:Readonly<Record<string,{families:readonly string[];limit:string}>>={
 'PHY79-WORK-CONCEPT':{families:['lift','hold'],limit:'Valmiiden vaihtoehtojen tunnistaminen; itsenäinen selitys vaatii erillisen näytön.'},
 'PHY79-WORK-CALC':{families:['small','large'],limit:'Oppija tuottaa numeerisen työn annetussa samansuuntaisen vakiovoiman mallissa.'},
 'PHY79-POWER-CONCEPT':{families:['same-work','same-power'],limit:'Annettujen vertailuvaihtoehtojen tunnistaminen; ei itsenäisen perustelun näyttö.'},
 'PHY79-POWER-CALC':{families:['short','long'],limit:'Oppija tuottaa numeerisen keskitehon annetusta työstä ja positiivisesta ajasta.'}};
