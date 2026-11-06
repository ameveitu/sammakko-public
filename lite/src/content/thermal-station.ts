import type { Rng } from '../engine/rng';
import type { Item,NodeSpec,Task } from '../engine/types';
import { cases } from './kit';
import { thermalScene,thermalPaint } from './scenes/thermal-station';
import { solutionThermalStation,type ThermalInput,type ThermalStationTask } from './models/thermal-station';
type Draft=Omit<Item,'tag'> & {sceneModel:ReturnType<typeof thermalScene>};type Factory=(r:Rng,transfer?:boolean)=>Draft;
const choose=(...pairs:[string,string][])=>pairs.map(([id,label])=>({id,label}));
const direction=choose(['a-to-b','A → B'],['b-to-a','B → A'],['none','Ei nettosiirtoa']);
const ab=choose(['a','A'],['b','B'],['equal','Yhtä suuri']);
function item(input:ThermalInput,question:string,choices:ThermalStationTask['choices'],hint:string,explain:string,review=false):Draft {
 const task:ThermalStationTask={kind:'thermal-station',input,question,choices,hint,...(review?{review:{criteria:[{id:'mechanisms',label:'Selittää kaikkien valittujen reittien mekanismit'},{id:'simultaneous',label:'Perustelee, miten mekanismit voivat vaikuttaa yhtä aikaa'}]}}:{})};
 return {task:task as unknown as Task,sceneModel:thermalScene(task),scene:thermalPaint(input),say:question,hint,explain,afterCorrect:host=>{thermalPaint(input)(host);const p=document.createElement('p');p.textContent=explain;host.append(p);}};
}
function spec(id:string,stop:string,goal:string,reward:string,a:[string,Factory],b:[string,Factory],transfer:Factory):NodeSpec {
 const rev=`thermal-station-${id.toLowerCase()}-v1`;return {id,stop,icon:'☼',intro:'Aava, Loikka ja Sulka tutkivat lämpöä vuoristoaseman malleilla.',goal,reward,rev,validRevs:[rev],produce:[a[0],b[0]],produceWhat:'lämpömallin ennustamista ja havaintojen vertaamista',demo:r=>{const v=a[1](r),task=v.task as unknown as ThermalStationTask;return [{scene:v.afterCorrect!,sceneModel:thermalScene(task,solutionThermalStation(task)),say:v.explain}];},item:cases({[a[0]]:r=>a[1](r),[b[0]]:r=>b[1](r)},r=>transfer(r,true))};
}
function energy(r:Rng,context:'sun-stone'|'cooling-cup'|'warm-water'):Draft {
 const incoming=context!=='cooling-cup', low=r.pick([10,15,20,25]),high=low+r.pick([15,20,25]);return item({kind:'energy',context,direction:incoming?'in':'out',sourceC:incoming?high:low,targetC:incoming?low:high},'Ennusta energian siirtymisen suunta tarkasteltavaan kohteeseen.',choose(['in','Energiaa siirtyy kohteeseen'],['out','Energiaa siirtyy kohteesta'],['none','Energiaa ei siirry']),'Katso lämpeneekö vai jäähtyykö kohde tässä annetussa mallissa.',incoming?'Mallissa energiaa siirtyy kohteeseen.':'Mallissa energiaa siirtyy lämpimästä kupista viileämpään ympäristöön.');
}
function probe(r:Rng,context:'water'|'air',target:'a'|'b'):Draft {
 const [aC,bC]=context==='air'?r.pick([[-8,4],[-10,0],[-4,6]] as const):r.pick([[20,40],[15,35],[10,30]] as const);
 return item({kind:'probe',aC,bC,target,context},'Ennusta, milloin virtuaalimittarin lukema sopii luettavaksi.',choose(['settled','Kun lukema on vakiintunut'],['moving','Heti ensimmäisestä muuttuvasta lukemasta']),'Vertaa vasta, kun mittari ja kohde ovat mallissa tasapainottuneet.','Virtuaalimittari luetaan vakiintuneena °C-asteikolta. Digitaalinen malli ei osoita oikean mittarin käyttötaitoa.');
}
function amount(r:Rng,first:'a'|'b'|'equal'):Draft {
 const small=r.pick([60,80,100,120]),large=small*2;const [massA,massB]=first==='a'?[large,small]:first==='b'?[small,large]:[small,small];
 return item({kind:'amount',massA,massB,temperatureC:r.pick([10,15,20,25]),riseC:r.pick([3,5,8]),specificHeat:4.2},'Ennusta, kumpaan veteen siirtyy enemmän energiaa samalla lämpötilan nousulla.',ab,'Sama aine ja sama lämpötilan muutos: vertaa vesimääriä.','Samalla aineella ja samalla nousulla suurempi määrä tarvitsee enemmän siirtynyttä energiaa. Lämpötila ei yksin kerro koko aine-erän sisäenergiaa; lämpö on lämpötilaeron vuoksi siirtyvää energiaa.');
}
function flow(r:Rng,which:'a'|'b'|'equal',context:'bottle'|'stone'):Draft {
 const low=r.pick([10,15,20,25]),high=low+r.pick([20,30,40]);const [aC,bC]=which==='a'?[high,low]:which==='b'?[low,high]:[low,low];return item({kind:'flow',aC,bC,capacityA:r.pick([80,100,120]),capacityB:r.pick([160,200,240]),conductance:20,seconds:r.pick([3,5,8]),context},'Ennusta energian nettosiirron suunta.',direction,'Vertaa annettuja lämpötiloja, älä kuvittele kylmyyttä virtaavaksi aineeksi.','Lämpötilaeron vuoksi nettosiirto kulkee lämpimämmästä kylmempään; samanlämpöisillä nettosiirto on nolla.');
}
function conduction(r:Rng,which:'a'|'b'|'equal',context:'bridge'|'wall'):Draft {
 const weak=r.pick([3,5,7]),strong=weak*4;const [aConductance,bConductance]=which==='a'?[strong,weak]:which==='b'?[weak,strong]:[weak,weak];
 return item({kind:'conduction',aConductance,bConductance,hotC:r.pick([50,60,70]),coldC:20,capacity:100,seconds:r.pick([3,4,6]),context},'Vain materiaali vaihtuu. Ennusta, kumman sillan viileä pää lämpenee enemmän samassa ajassa.',ab,'Kaikki muut mallitekijät ovat samoja. Vertaa annettuja mallijohtavuuksia.','Johtumisessa energia siirtyy paikallaan olevan aineen läpi; koko materiaalin ei tarvitse kulkea sillan päästä toiseen.');
}
function convection(r:Rng,medium:'air'|'water',question:'mechanism'|'circulation'='mechanism'):Draft {
 return item({kind:'convection',medium,context:medium==='air'?'cabin':'tank',question,warmC:r.pick([20,25,30,35]),coolC:10},question==='mechanism'?'Ennusta, mitä merkkihiukkasten mallireitti esittää.':'Ennusta lämpimän aineen suunta tässä kiertomallissa.',question==='mechanism'?choose(['matter-moves','Liikkuva aine kuljettaa energiaa'],['heat-is-matter','Lämpö itse on nousevaa ainetta'],['solid-moves','Kiinteä seinä kulkee virtauksen mukana']):choose(['warm-rises','Lämpimämpi aine nousee mallin lämpimällä puolella'],['warm-sinks','Lämpimämpi aine laskee mallin lämpimällä puolella']),'Seuraa aineen merkkihiukkasia ja sitä, missä ne liikkuvat.','Kuljettumisessa liikkuva neste tai kaasu kuljettaa energiaa. Merkkien reitti on havainnollinen malli.');
}
function radiation(r:Rng,medium:'air'|'vacuum',context:'sun'|'lamp',question:'shield'|'medium'='shield'):Draft {
 return item({kind:'radiation',medium,context,question,openPower:r.pick([8,10,12,16]),screenPower:0,seconds:r.pick([3,5,7])},question==='shield'?'Ennusta, kummassa mallissa kohde saa enemmän lähteen säteilyenergiaa.':'Ennusta, voiko lähteen säteily kulkea mallin tyhjiön läpi.',question==='shield'?choose(['open','Avoin näköyhteys'],['screen','Läpinäkymätön varjostin edessä'],['equal','Yhtä paljon']):choose(['vacuum-yes','Kyllä, säteily voi kulkea tyhjiössä'],['vacuum-no','Ei, säteily tarvitsee aineen']),'Pidä lähde, etäisyys ja aika samoina. Tarkastele, pääseekö säteily suoraan kohteeseen.','Säteily ei tarvitse aineellista väliainetta ja kulkee myös tyhjiössä. Tässä yksinkertaistetussa mallissa varjostin estää suoran reitin; todellisissa tilanteissa muitakin siirtoreittejä voi esiintyä.');
}
function integration(r:Rng,context:'cabin'|'greenhouse'|'tent'):Draft {
 return item({kind:'integration',context,warmC:r.pick([20,25,30,35]),coolC:r.pick([5,10,15]),mechanisms:['conduction','convection','radiation']},'Valitse kaikki mallissa kuvatut lämmönsiirtotavat. Perustele omin sanoin aikuiselle.',choose(['conduction','Johtuminen kiinteässä seinässä'],['convection','Kuljettuminen liikkuvan aineen mukana'],['radiation','Säteily lähteestä'],['cold-flow','Kylmyys virtaavana aineena']),'Samassa tilanteessa voi olla useita erillisiä energiansiirtoreittejä.','Johtuminen, kuljettuminen ja säteily voivat esiintyä samanaikaisesti. Oman perustelun arvioi aikuinen; sovellus ei tulkitse tekstiä.',true);
}
export const thermalStationSpecs:NodeSpec[]=[
 spec('ENV-PHY-THERMAL-01','Lämpöä eväskivelle','Tunnistat energian siirtymisen lämpenemisen ja jäähtymisen mallissa.','Eväskiven lämpöreitti selviää.',['warming',r=>energy(r,'sun-stone')],['cooling',r=>energy(r,'cooling-cup')],r=>energy(r,'warm-water')),
 spec('ENV-PHY-TEMP-01','Aamun kaksi vesikuppia','Asetat virtuaalimittarin, luet vakiintuneen Celsius-asteikon ja vertaat lämpötiloja.','Mittaustiedot merkitään retkivihkoon.',['water',r=>probe(r,'water','a')],['air',r=>probe(r,'air','a')],r=>probe(r,'air','b')),
 spec('PHY79-TEMP-HEAT','Sama lämpötila, kaksi vesimäärää','Erotat lämpötilan, sisäenergian ja lämpönä siirtyvän energian.','Vesimäärien vertailu selviää.',['different-masses',r=>amount(r,'b')],['equal-masses',r=>amount(r,'equal')],r=>amount(r,'a')),
 spec('PHY79-HEATFLOW','Kylmän mökin lämmin yllätys','Ennustat energian nettosiirron ja lämpötilojen lähentymisen.','Mökin lämpömalli selviää.',['hot-a',r=>flow(r,'a','bottle')],['equal',r=>flow(r,'equal','bottle')],r=>flow(r,'b','stone')),
 spec('PHY79-HEAT-CONDUCTION','Kahden sillan lämpöviesti','Tunnistat johtumisen paikallaan olevassa aineessa.','Lämpöviesti kulkee sillan mallissa.',['strong-a',r=>conduction(r,'a','bridge')],['equal-material',r=>conduction(r,'equal','bridge')],r=>conduction(r,'b','wall')),
 spec('PHY79-HEAT-CONVECTION','Vuoristomajan ilmankierto','Yhdistät energian kuljettumisen liikkuvaan aineeseen.','Majan kiertoreitti selviää.',['air',r=>convection(r,'air')],['circulation',r=>convection(r,'water','circulation')],r=>convection(r,'air','circulation')),
 spec('PHY79-HEAT-RADIATION','Aurinkoinen kallio kaukaa','Tunnistat säteilyn myös ilman väliainetta.','Kallion varjostusmalli selviää.',['air',r=>radiation(r,'air','sun')],['vacuum',r=>radiation(r,'vacuum','lamp','medium')],r=>radiation(r,'vacuum','sun')),
 spec('PHY79-HEAT-MECH','Kolmen lämmön mökki','Tunnistat useat samanaikaiset siirtoreitit ja perustelet oman selityksesi.','Mökin tutkimuskartta valmistuu.',['cabin',r=>integration(r,'cabin')],['greenhouse',r=>integration(r,'greenhouse')],r=>integration(r,'tent'))];
export const thermalStationEvidence:Readonly<Record<string,{families:readonly string[];limit:string}>>={
 'ENV-PHY-THERMAL-01':{families:['warming','cooling'],limit:'Ennuste valmiista vaihtoehdoista; avoin selitys erillinen näyttö.'},
 'ENV-PHY-TEMP-01':{families:['water','air'],limit:'Virtuaalisen asteikon ja kohteen käyttö; ei osoita fyysisen mittarin käyttöä.'},
 'PHY79-TEMP-HEAT':{families:['different-masses','equal-masses'],limit:'Annetun saman aineen mallin vertailu; ei yleistä sisäenergian mittausta tai vapaata perustelua.'},
 'PHY79-HEATFLOW':{families:['hot-a','equal'],limit:'Annettujen lämpötilojen mukainen nettosuunnan ennuste.'},
 'PHY79-HEAT-CONDUCTION':{families:['strong-a','equal-material'],limit:'Vakioitujen mallisiltojen vertailu ja valmiin vaihtoehdon ennuste.'},
 'PHY79-HEAT-CONVECTION':{families:['air','circulation'],limit:'Annetun virtausmallin merkkihiukkasten tulkinta; ei numeerinen luonnonennuste.'},
 'PHY79-HEAT-RADIATION':{families:['air','vacuum'],limit:'Ideaalisen varjostinmallin vertailu; ei väite kaikkien todellisten siirtotapojen poissulkemisesta.'},
 'PHY79-HEAT-MECH':{families:['cabin','greenhouse'],limit:'Kaikkien kuvattujen mekanismien valinta ja aikuisen havainnoima oma selitys; tekstiä ei tallenneta.'}};
