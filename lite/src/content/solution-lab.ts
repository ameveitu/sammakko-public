import type {Rng} from '../engine/rng';
import type {Item,NodeSpec} from '../engine/types';
import {cases} from './kit';
import {solutionLabPaint,solutionLabWorkedPaint} from './scenes/solution-lab';
import {solutionIndicators,type SolutionLabTask,type MassSample,type Acidity,type IndicatorId} from './models/solution-lab';

type Factory=(r:Rng)=>SolutionLabTask;
const kind='solution-lab' as const;
const sample=(id:string,solute:number,solvent:number):MassSample=>({id,label:`Näyte ${id.toUpperCase()}`,solute,solvent,unit:'g',basis:'mass-mass'});
function concentration(r:Rng,skill:'concept'|'calculate',action:'read'|'aliquot'|'dilute'|'transfer'):SolutionLabTask{
 const part=r.int(2,17),multiplier=r.int(3,12),whole=part*multiplier;
 const s=sample('a',part,whole-part);
 if(action==='transfer'){
  const factor=r.int(2,5);s.solute*=factor;s.solvent*=factor;
 }
 return {kind,mode:'concentration',title:skill==='concept'?'Pisaran osuus koko näytteestä':'Koostumusetiketin massaprosentti',skill,sample:s,
  show:action==='transfer'?'parts':'total',
  ...(action==='aliquot'?{operation:{kind:'aliquot' as const,amount:r.int(1,multiplier-1)*part}}:{}),
  ...(action==='dilute'?{operation:{kind:'dilute' as const,amount:r.int(2,10)*part}}:{})};
}
function compare(r:Rng,family:'same-ratio'|'same-part'|'transfer'):SolutionLabTask{
 const part=r.int(2,16),whole=part*r.int(3,8),factor=r.int(2,5);
 const a=sample('a',part,whole-part);
 const b=family==='same-ratio'?sample('b',part*factor,(whole-part)*factor):family==='same-part'?
  sample('b',part,whole*factor-part):sample('b',part*factor,whole*(factor+1)-part*factor);
 return {kind,mode:'compare',title:'Kaksi pulloa ja sama vertailuperusta',samples:r.chance(.5)?[a,b]:[b,a]};
}
function acidity(r:Rng,inverse=false,transfer=false):SolutionLabTask{
 const classes:Acidity[]=['acidic','neutral','basic'];
 if(inverse){
  const wanted=r.shuffle(classes),extra=r.pick(classes);
  return {kind,mode:'ph',title:'Rakenna kolme tutkimuspenkkiä',skill:'acidbase',activity:'construct',temperatureC:25,neutral10:70,
   samples:[wanted[0]!,wanted[1]!,extra].map((requested,i)=>({id:String(i+1),label:`Kortti ${i+1}`,requested}))};
 }
 const readings=transfer?[r.int(60,69),70,r.int(71,80)]:[r.int(0,69),70,r.int(71,140)];
 return {kind,mode:'ph',title:transfer?'Samannäköiset näytteet lähteellä':'Kolme tutkimuspenkkiä',skill:'acidbase',activity:'read',temperatureC:25,neutral10:70,
  samples:r.shuffle(readings).map((ph10,i)=>({id:String(i+1),label:`Kirkas näyte ${i+1}`,ph10}))};
}
function ph(r:Rng,activity:'read'|'log',transfer=false):SolutionLabTask{
 const a=r.int(1,10),gap=transfer?r.pick([0,2,3]):r.pick([1,2]),b=Math.min(14,a+gap);
 const readings=r.shuffle([a*10,b*10,r.int(0,14)*10]);
 return {kind,mode:'ph',title:transfer?'Uusi mittausviesti tutkimuspuutarhassa':'pH-asteikon järjestys ja askel',skill:'scale',activity,temperatureC:25,neutral10:70,
  samples:readings.map((ph10,i)=>({id:String(i+1),label:`Vesiliuos ${i+1}`,ph10})),pair:['1','2']};
}
const indicatorIds=Object.keys(solutionIndicators) as IndicatorId[];
function indicator(r:Rng,pair=false,transfer=false):SolutionLabTask{
 const first=r.pick(indicatorIds),second=r.pick(indicatorIds.filter(id=>id!==first));
 const band=()=>r.pick(['low','transition','high'] as const);
 return {kind,mode:'indicator',title:transfer?'Tuntemattoman näytteen tutkimusikkuna':'Indikaattorin sallima happamuusalue',temperatureC:25,neutral10:70,
  readings:[{indicator:first,band:band()},...(pair?[{indicator:second,band:band()}]:[])],
  review:{prompt:'Selitä aikuiselle, mitä juuri nämä värit sallivat päätellä ja mikä jää avoimeksi.',
   rubric:[{id:'legend',label:'Yhdistää havainnot selitteisiin',guide:'Selittää kunkin värin merkityksen juuri sen indikaattorin avulla.'},
    {id:'precision',label:'Perustelee tarkkuusrajan',guide:'Selittää sallitun alueen tai ristiriidan. Ei oleta tarkkaa pH:ta.'}],
   model:'Kunkin värin selite antaa oman pH-alueensa. Saman näytteen on kuuluttava kaikkiin alueisiin. Tyhjä yhteinen alue tarkoittaa ristiriitaisia havaintoja tässä mallissa.'}};
}
const instruction=(task:SolutionLabTask):string=>{
 switch(task.mode){
  case 'concentration':return task.operation?`Tuota ensin oma ennuste aineosan ja koko liuoksen massoista. Lukitse ennuste ja ${task.operation.kind==='aliquot'?'ota annettu tasakoosteinen osa':'lisää annettu liuottimen massa'} virtuaalisesti. ${task.skill==='calculate'?'Laske uuden näytteen massaprosentti.':'Muodosta tarkasteltavan näytteen aineosa/kokonaisuus-suhde.'}`:
   task.skill==='calculate'?'Aava tarvitsee etiketin. Tuota aineosan massa, koko liuoksen massa ja massaprosentti.':'Rajaa Sulan kanssa koko liuos ja tuota aineosan massan suhde siihen.';
  case 'compare':return 'Loikka katsoo pullon kokoa. Muodosta kummankin näytteen aineosa/koko liuos -suhde ja omat vertailutuotteet. Päätä, kumpi on väkevämpi, tai ovatko pitoisuudet samat.';
  case 'ph':return task.activity==='construct'?'Tuota jokaiselle kortille oma pH-lukema, joka sopii pyydetylle tutkimuspenkille. Luokittele omat lukemasi.':
   task.skill==='scale'?`Kohdista mittauskortit, luokittele ne ja järjestä kaikki happamimmasta alkaen.${task.activity==='log'?' Laske myös nimetyn parin oksoniumionien aktiivisuuksien suhde annetulla kymmenkertaisen askeleen säännöllä.':''}`:
    'Aava tarvitsee mittaustietoon perustuvat paikat kolmelle samannäköiselle näytteelle. Kohdista pH-lukemat ja luokittele ne.';
  case 'indicator':return 'Tuota näytteen koko pH-alue rajoineen ja mahdolliset happamuusluokat. Kerro aikuiselle, miten selitteet rajaavat päätelmää.';
 }
};
function item(factory:Factory,r:Rng):Omit<Item,'tag'>{
 const task=factory(r),say=instruction(task);
 return {task,scene:solutionLabPaint(task),say,hint:task.mode==='indicator'?'Yhteisen pH:n täytyy sopia jokaiseen juuri tämän näytteen selitteeseen. Tarkista myös avoimet ja suljetut rajat.':
  task.mode==='ph'?'Näiden 25 °C:n vesiliuosten neutraali pH on 7. Pienempi pH merkitsee suurempaa oksoniumionien aktiivisuutta.':'Nimeä aineosa ja koko tarkasteltava liuos. Aineosa kuuluu myös kokonaismassaan.',
  explain:task.mode==='indicator'?'Väri antaa indikaattorikohtaisen alueen. Alueiden yhteinen osa rajoittaa päätelmää. Ristiriitaisia havaintoja täytyy tarkistaa.':
   task.mode==='ph'?'Luokitus koskee annettuja vesiliuosmittauksia 25 °C:ssa. pH on logaritminen asteikko. Luokka ei yksin kerro näytteen turvallisuutta.':
    'Massapitoisuus on aineosan massa suhteessa saman näytteen koko massaan. Tasakoosteisen osan suhde säilyy. Pelkän liuottimen lisääminen kasvattaa kokonaismassaa ja pienentää suhdetta.'};
}
function spec(id:string,title:string,intro:string,goal:string,reward:string,a:[string,Factory],b:[string,Factory],transfer:Factory):NodeSpec{
 const rev=`solution-lab-${id.toLowerCase()}-v1`;
 return {id,stop:title,icon:'◒',intro,goal,reward,rev,validRevs:[rev],produce:[a[0],b[0]],produceWhat:'oma suhde, lasku, mittaustiedon luokitus tai rajattu vaihteluväli',
  demo:r=>{const d=item(a[1],r);return [{scene:d.scene!,say:goal},{scene:solutionLabWorkedPaint(d.task as SolutionLabTask),say:'Aava näyttää malliratkaisun. Kohdista jokainen merkintä juuri tämän näytteen annettuihin tietoihin.'}];},
  item:cases({[a[0]]:r=>item(a[1],r),[b[0]]:r=>item(b[1],r)},r=>item(transfer,r))};
}
export const solutionLabSpecs:NodeSpec[]=[
 spec('CHEM79-CONC-01','Pisaran osuus koko näytteestä','Sulka rajaa tutkimuspuutarhan näytteen kokonaisuuden. Aava etsii sille koostumuskorttia.','Muodosta aineosan massan suhde koko liuoksen massaan.','Näytteen koostumuskortti saa täsmällisen rajauksen.',
  ['part-whole',r=>concentration(r,'concept','read')],['homogeneous-aliquot',r=>concentration(r,'concept','aliquot')],r=>concentration(r,'concept','transfer')),
 spec('CHEM79-CONC-COMP','Kahden pullon vertailu','Loikka nimeäisi suuren pullon väkeväksi. Aava pyytää kummankin koostumustiedot.','Vertaa massapitoisuuksia myös erikokoisissa näytteissä.','Pullojen väliin avautuu perusteltu vertailumerkki.',
  ['equal-ratio-different-total',r=>compare(r,'same-ratio')],['equal-solute-different-total',r=>compare(r,'same-part')],r=>compare(r,'transfer')),
 spec('CHEM79-CONC-CALC','Koostumusetiketin prosentti','Tutkimusnäyttelyn etikettiaukko odottaa lukua, jonka vertailuperusta on nimetty.','Tuota massaprosentti jakamalla aineosan massa koko liuoksen massalla.','Aava sulkee etikettiaukon omalla laskullasi.',
  ['direct-total',r=>concentration(r,'calculate','read')],['virtual-dilution',r=>concentration(r,'calculate','dilute')],r=>concentration(r,'calculate','transfer')),
 spec('CHEM79-ACIDBASE','Kolme tutkimuspenkkiä','Aava asettaa kirkkaat vesiliuosnäytteet mittauskorttien viereen.','Erota hapan, neutraali ja emäksinen annetuissa 25 °C:n oloissa.','Puutarhan kolme penkkiä saavat mittaustietoihin perustuvat tunnisteet.',
  ['classify-measurements',r=>acidity(r)],['produce-class-reading',r=>acidity(r,true)],r=>acidity(r,false,true)),
 spec('CHEM79-PH','pH-asteikon tutkimusviesti','Sulka avaa asteikon, jonka askel muuttaa aktiivisuutta kymmenkertaisesti.','Järjestä pH-tietoja ja käytä ilmoitettua logaritmista askelsääntöä.','Aava lukee uuden tutkimusviestin oikeaan suuntaan.',
  ['order-measured-readings',r=>ph(r,'read')],['logarithmic-comparison',r=>ph(r,'log')],r=>ph(r,'log',true)),
 spec('CHEM79-INDICATOR','Tuntemattoman näytteen ikkuna','Tuntematon paikallinen mallinäyte odottaa kuvausta. Sen indikaattorilla on oma selitteensä.','Rajaa happamuus juuri annettujen indikaattorien perusteella ja selitä tarkkuus.','Lähteen heijastukseen avautuu oikein rajattu tutkimusikkuna.',
  ['single-legend',r=>indicator(r)],['two-legend-intersection',r=>indicator(r,true)],r=>indicator(r,true,true)),
];
export const solutionLabEvidence:Readonly<Record<string,{families:readonly string[];limit:string}>>=Object.fromEntries(solutionLabSpecs.map(s=>[s.id,{families:s.produce??[],limit:
 s.id==='CHEM79-INDICATOR'?'Automaattinen näyttö koskee nimettyjen malliselitteiden koko väliä ja luokkia. Oma tarkkuusperustelu vaatii aikuisen havainnon ja erillisen avun merkinnän. Suljetut siirtymärajat ovat tämän taulukkomallin sopimus. Ei kemikaalin fyysisen käsittelyn näyttöä.':
 s.id.includes('CONC')?'Näyttö koskee massa/massa-pitoisuutta ja täsmällistä virtuaalista massakirjaa. Tilavuuspitoisuus ja oikean liuoksen valmistaminen tarvitsevat erillisen näytön. Vertailutuotteet ovat rajattu suhdeperustelu, vapaa sanallinen perustelu arvioidaan erikseen.':
 'Näyttö koskee annettuja vesiliuosmittauksia 25 °C:ssa ja tehtävän 0–14-mallialuetta. Logaritminen vertailu käyttää annettua kymmenkertaisen askeleen sääntöä. Näytteen turvallisuutta tai hapon vahvuutta ei arvioida luokasta.'}]));
