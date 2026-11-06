import type { Rng } from '../engine/rng';
import type { Item, NodeSpec, Task, Token } from '../engine/types';
import { cases } from './kit';
import { directionOf, frictionOpposing, horizontalMotion, slidingOnSurface, netOn, normalDirection, vectorLengthCm, weightNewtons, type Direction } from './models/force-workshop';
import { forcePaint, type ForceWorkshopScene } from './scenes/force-workshop';

type Draft=Omit<Item,'tag'> & {sceneModel:ForceWorkshopScene};
type Factory=(r:Rng,transfer?:boolean)=>Draft;
const words:Record<Direction,string>={left:'vasemmalle',right:'oikealle',up:'ylös',down:'alas','up-left':'yläviistoon vasemmalle','up-right':'yläviistoon oikealle','down-left':'alaviistoon vasemmalle',zero:'nolla'};
const scene=(body:string,context:ForceWorkshopScene['context'],given:string,title='Vuoriston koepöytä'):ForceWorkshopScene=>({kind:'force-workshop',title,body,context,given});
function place(r:Rng,slots:{id:string;text:string}[], tokens:Token[],answer:Record<string,string>):Task {return {kind:'place',slots,tokens:r.shuffle(tokens),answer};}
function item(m:ForceWorkshopScene, task:Task, say:string, hint:string, explain:string, after?:{direction:Direction;label:string;lengthCm?:number}[]):Draft {
  return {sceneModel:m,scene:forcePaint(m),task,say,hint,explain,afterCorrect:host=>{
    forcePaint(after?{...m,arrows:after,...(m.surfaceOptions?{surfaceOptions:false,surfaceView:'rough' as const}:{})}:m)(host);
    const note=document.createElement('p'); note.textContent=explain; host.append(note);
    if(m.inputs?.kind==='motion') {
      const v=horizontalMotion(m.inputs.initialVelocity,m.inputs.netForceN,m.inputs.massKg,m.inputs.durationS);
      const result=document.createElement('p');result.textContent=`Mallitarkistus ${m.inputs.durationS} s jälkeen: nopeus ${Math.abs(v.velocity)} m/s ${words[directionOf(v.velocity)]}; siirtymä ${Math.abs(v.displacement)} m ${words[directionOf(v.displacement)]}.`;host.append(result);
    } else if(m.inputs?.kind==='friction' && m.inputs.frictionN && m.inputs.massKg) {
      const initial=m.inputs.relativeSlip,mass=m.inputs.massKg,[smooth,rough]=m.inputs.frictionN;
      const result=document.createElement('p');result.textContent=`Mallitarkistus 0,5 s jälkeen: suhteellisen nopeuden itseisarvo sileällä ${Math.abs(slidingOnSurface(initial,smooth,mass,.5))} m/s, karkealla ${Math.abs(slidingOnSurface(initial,rough,mass,.5))} m/s. Karkea pinta pienentää eroa nopeammin.`;host.append(result);
    }
  }};
}
function spec(id:string,stop:string,intro:string,goal:string,reward:string,a:{tag:string;make:Factory},b:{tag:string;make:Factory},transfer:Factory):NodeSpec {
  return {id,stop,icon:'🧭',intro,goal,reward,rev:`force-workshop-${id.toLowerCase()}-v1`,validRevs:[`force-workshop-${id.toLowerCase()}-v1`],
    produce:[a.tag,b.tag],produceWhat:'voimia ja vuorovaikutuksia kuvaavien merkintöjen kokoamista',
    demo:r=>{const example=a.make(r);return [{scene:example.afterCorrect??example.scene!,sceneModel:example.sceneModel,say:example.explain} as ReturnType<NodeSpec['demo']>[number]];},
    item:cases({[a.tag]:r=>a.make(r),[b.tag]:r=>b.make(r)},r=>transfer(r,true))};
}
const A=(tag:string,make:Factory)=>({tag,make});
/** "lautta" → "lauttaan": the body as the target of a force. */
const ILL:Record<string,string>={pallo:'palloon',lautta:'lauttaan',rautanaula:'rautanaulaan',kuorma:'kuormaan',laatikko:'laatikkoon',vaunu:'vaunuun'};
const ill=(body:string)=>ILL[body]??`kappaleeseen ${body}`;

function cause(r:Rng,kind:'push'|'pull',transfer=false):Draft {
  const body=transfer?'pallo':'lautta',source=transfer?'toinen pallo':kind==='push'?'käsi':'köysi',dir:Direction=kind==='push'?'right':'left';
  const m=scene(body,transfer?'box':'raft',`${source} vaikuttaa kappaleeseen ${words[dir]} voimalla 1 N kahden sekunnin ajan. Kappaleen massa on 1 kg ja alkunopeus 0 m/s; muita vaakavoimia ei mallissa ole.`);
  m.inputs={kind:'motion',from:source,netForceN:dir==='right'?1:-1,massKg:1,initialVelocity:0,durationS:2};
  const task=place(r,[{id:'source',text:`Voiman aiheuttaja ${ill(body)}`},{id:'change',text:'Nopeuden muutos'}],[{id:'source',text:source},{id:'self',text:`${body} itse ilman vuorovaikutusta`},{id:'dir',text:`Muutos ${words[dir]}`},{id:'other',text:`Muutos ${words[dir==='right'?'left':'right']}`}],{source:'source',change:'dir'});
  return item(m,task,`Yhdistä vuorovaikutus ja sen aiheuttaman nopeuden muutoksen suunta.`,`Etsi toinen osapuoli ja annetun voiman suunta.`,`Voima johtuu vuorovaikutuksesta: ${source} vaikuttaa ${ill(body)}. Nopeuden muutos on ${words[dir]}.`,[{direction:dir,label:'voima'}]);
}
const elementary=spec('ENV-PHY-FORCE-01','Lautan pieni työntö','Aava ohjaa pienoislautan laiturista.','Opit yhdistämään voiman vuorovaikutukseen ja liikkeen muutokseen.','Lautta pääsee rantasyvennykseen.',A('push',r=>cause(r,'push')),A('pull',r=>cause(r,'pull')),r=>cause(r,'push',true));

function interaction(r:Rng,kind:'contact'|'gravity',transfer=false):Draft {
  const body=transfer?'rautanaula':kind==='contact'?'kuorma':'laatikko',source=transfer?'magneetti':kind==='contact'?'köysi':'Maa',force=transfer?'magneettivoima':kind==='contact'?'köyden veto':'paino';
  const m=scene(body,transfer?'magnet':kind==='contact'?'cart':'box',`${source} ja ${body} vuorovaikuttavat.`);
  m.inputs={kind:'interaction',from:source,name:force};
  const task=place(r,[{id:'on',text:'Voiman kohde'},{id:'source',text:'Toinen osapuoli'},{id:'force',text:'Voima'}],[{id:'body',text:body},{id:'source',text:source},{id:'force',text:force},{id:'none',text:'Ei toista osapuolta'}],{on:'body',source:'source',force:'force'});
  return item(m,task,'Yhdistä voiman kohde, toinen osapuoli ja vuorovaikutuksen nimi.','Voima kohdistuu tarkasteltuun kappaleeseen; etsi sen aiheuttava toinen osapuoli.',`${source} vaikuttaa ${ill(body)}; ${force} on tämän vuorovaikutuksen voima.`);
}
const interact=spec('PHY79-INTERACT','Köysi tarvitsee kaksi päätä','Aava etsii hissin vuorovaikutusten osapuolet.','Opit nimeämään voiman kohteen ja aiheuttajan.','Hissin vuorovaikutuskartta valmistuu.',A('contact',r=>interaction(r,'contact')),A('gravity',r=>interaction(r,'gravity')),r=>interaction(r,'gravity',true));

function directionTask(r:Rng,kind:'pull'|'push',transfer=false):Draft {
  const dir:Direction=transfer?'left':kind==='pull'?'up-right':'down-left';
  const m=scene('vaunu',transfer?'cart':'ramp',transfer?'Käsi työntää vaunua vaakatasossa vasemmalle.':kind==='pull'?'Köysi vetää vaunua oikealle nousevan rampin suuntaan yläviistoon oikealle.':'Käsi työntää vaunua ramppia alas alaviistoon vasemmalle.');
  m.inputs={kind:'direct',from:kind==='pull'?'köysi':'käsi',direction:dir};
  const task=place(r,[{id:'body',text:'Nuolen alkukohta'},{id:'dir',text:'Voiman suunta vaunuun'}],[{id:'body',text:'Vaunu'},{id:'otherbody',text:'Köysi tai käsi'},{id:'left',text:'← vasemmalle'},{id:'right',text:'→ oikealle'},{id:'up-right',text:'↗ yläviistoon oikealle'},{id:'down-left',text:'↙ alaviistoon vasemmalle'}],{body:'body',dir});
  return item(m,task,'Aseta nuoli tarkasteltuun kappaleeseen ja valitse sen suunta.','Voimanuoli alkaa siitä kappaleesta, johon voima kohdistuu.',`Voima kohdistuu vaunuun ja osoittaa ${words[dir]}.`,[{direction:dir,label:'veto/työntö'}]);
}
const direction=spec('PHY79-FORCE-DIRECTION','Vedon oikea suunta','Aava kokeilee voiman suunnan vaihtamista.','Opit osoittamaan voiman suunnan ja vaikutuskohteen.','Vaunun vetolinja asettuu mallissa.',A('pull',r=>directionTask(r,'pull')),A('push',r=>directionTask(r,'push')),r=>directionTask(r,'push',true));

function magnitudeTask(r:Rng,kind:'length'|'compare',transfer=false):Draft {
  const n=r.pick([4,6,8]), other=n+2, selected=kind==='compare'?other:n, len=vectorLengthCm(selected,2);
  const m=scene(transfer?'iso laatikko':'vaunu','cart',kind==='compare'?`Veto A on ${n} N ja veto B ${other} N samaan suuntaan. Asteikko: 1 cm vastaa 2 N.`:transfer?`Pieneen vaunuun ja isoon laatikkoon kohdistetaan erikseen sama ${n} N veto oikealle. Asteikko: 1 cm vastaa 2 N.`:`Annettu veto ${n} N oikealle. Asteikko: 1 cm vastaa 2 N.`);
  m.inputs=kind==='compare'?{kind:'compare',from:'vetäjä',direction:'right',newtons:[n,other]}:{kind:'direct',from:'vetäjä',direction:'right',newtons:n};
  const task=place(r,[{id:'value',text:kind==='compare'?'Suuremman vedon arvo':'Voiman suuruus'},{id:'length',text:'Nuolen pituus asteikolla'}],[{id:'value',text:`${selected} N`},{id:'wrongunit',text:kind==='compare'?`${n} N`:`${n} kg`},{id:'length',text:`${len} cm`},{id:'wronglength',text:`${len+1} cm`}],{value:'value',length:'length'});
  return item(m,task,transfer?'Merkitse molempiin erikokoisiin kappaleisiin annetun saman voiman suuruus ja nuolipituus.':kind==='compare'?'Valitse suurempi veto ja sen nuolen pituus samalla asteikolla.':'Merkitse voiman suuruus ja sitä vastaavan nuolen pituus.','Lue newtonarvo ja jaa se sillä, montako newtonia yksi senttimetri on.',`${selected} N vastaa ${len} cm nuolta. Isompi kappale ei yksin määrää annetun voiman suuruutta.`,[{direction:'right',label:`${selected} N`,lengthCm:len}]);
}
const magnitude=spec('PHY79-FORCE-MAGNITUDE','Vedon verrattava pituus','Aava vertailee vetoja samalla nuoliasteikolla.','Opit lukemaan voiman newtoneina ja esittämään suuruuden nuolella.','Vetomittarin asteikko valmistuu.',A('length',r=>magnitudeTask(r,'length')),A('compare',r=>magnitudeTask(r,'compare')),r=>magnitudeTask(r,'length',true));

function vectorTask(r:Rng,kind:'magnitude'|'direction',transfer=false):Draft {
  const dir:Direction=kind==='direction'?'left':'right',n=r.pick([4,6,8]),len=vectorLengthCm(n,2),body=transfer?'laatikko':'vaunu';
  const m=scene(body,transfer?'box':'cart',`Köysi kohdistaa ${ill(body)} voiman ${n} N ${words[dir]}. Asteikko 1 cm = 2 N.`);
  m.inputs={kind:'direct',from:'köysi',direction:dir,newtons:n};
  const task=place(r,[{id:'body',text:'Nuolen alkukohta'},{id:'dir',text:'Suunta'},{id:'length',text:'Pituus'}],[{id:'body',text:body},{id:'rope',text:'Köysi'},{id:'left',text:'← vasemmalle'},{id:'right',text:'→ oikealle'},{id:'length',text:`${len} cm`},{id:'wronglength',text:`${len+1} cm`}],{body:'body',dir,length:'length'});
  return item(m,task,`Rakenna voiman kuva: kohde, suunta ja pituus.`,`Tarkista jokainen osa: nuoli alkaa kohteesta, suunta seuraa annettua voimaa ja pituus asteikkoa.`,`${n} N ${words[dir]} kohdistuu ${ill(body)}; asteikolla pituus on ${len} cm.`,[{direction:dir,label:`${n} N`,lengthCm:len}]);
}
const vector=spec('PHY79-FORCE-01','Yksi nuoli, kaksi tietoa','Aava rakentaa vetovoiman nuolen.','Opit merkitsemään vaikutuskohteen, suunnan ja suuruuden.','Voimanuoli ohjaa pienoisvaunua.',A('magnitude',r=>vectorTask(r,'magnitude')),A('direction',r=>vectorTask(r,'direction')),r=>vectorTask(r,'direction',true));

function diagramTask(r:Rng,kind:'rest'|'motion',transfer=false):Draft {
  const body=transfer?'laatikko':'vaunu',m=scene(body,transfer?'box':'cart',`${body} ${kind==='rest'?'lepää':'liikkuu vaakatasossa tasaisella nopeudella'}. Vain Maa ja vaakasuora alusta vaikuttavat siihen; ilmanvastus ja kitka sivuutetaan.`);
  m.primary='2d'; m.inputs={kind:'diagram',surface:'alusta'};
  const task=place(r,[{id:'down',text:`Alaspäin ${ill(body)}`},{id:'up',text:`Ylöspäin ${ill(body)}`}],[{id:'weight',text:'Maa → kappale: paino'},{id:'normal',text:'Alusta → kappale: tukivoima'},{id:'reaction',text:'Kappale → alusta: voima'},{id:'movement',text:'Liikkeen oma voima'}],{down:'weight',up:'normal'});
  return item(m,task,'Kokoa vain tarkasteltuun kappaleeseen vaikuttavat voimat.','Paino tulee Maalta ja tuki alustalta. Kappaleen alustaan kohdistama voima kuuluu toiseen voimakuvaan.',`Maa vetää kappaletta alas ja alusta tukee sitä ylös. Kappaleen alustaan kohdistama voima on eri kohteeseen vaikuttava vastavoima.`,[{direction:'down',label:'paino'},{direction:'up',label:'tuki'}]);
}
const diagram=spec('PHY79-FORCE-DIAG','Yhden kappaleen voimakuva','Sulka valitsee yhden kappaleen voimakuvaan.','Opit kokoamaan kappaleeseen vaikuttavat voimat ja nimeämään aiheuttajat.','Yhden kappaleen voimakuva valmistuu.',A('rest',r=>diagramTask(r,'rest')),A('motion',r=>diagramTask(r,'motion')),r=>diagramTask(r,'rest',true));

function frictionTask(r:Rng,kind:'sliding'|'belt',transfer=false):Draft {
  const slip=kind==='sliding'?1:-1,dir=frictionOpposing(slip),actual=transfer?'right':dir;
  const given=transfer?'Jalka pyrkii luistamaan taaksepäin suhteessa maahan; maan kitkavoima vaikuttaa jalkaan.':kind==='sliding'?'Laatikko liukuu oikealle 2 m/s. Massa 1 kg; ainoa vaakavoima on kitka: sileällä 1 N, karkealla 4 N.':'Laatikko 1 m/s ja hihna 3 m/s oikealle: laatikko liukuu hihnalla vasemmalle. Massa 1 kg, kitka sileällä 1 N ja karkealla 4 N. Hihnan nopeus on vakio; muita vaakavoimia ei ole.';
  const m=scene(transfer?'jalka':'laatikko',transfer?'foot':'box',given);
  m.inputs=transfer?{kind:'friction',relativeSlip:-1}:{kind:'friction',relativeSlip:kind==='sliding'?2:-2,massKg:1,surfaceVelocity:kind==='sliding'?0:3,frictionN:[1,4],durationS:2};
  if(!transfer) {m.surfaceOptions=true;m.surfaceView='smooth';}
  const slots=[{id:'dir',text:'Kitkan suunta'},{id:'against',text:'Kitka vastustaa'},...(!transfer?[{id:'surface',text:'Suurempi kitka'}]:[])];
  const tokens=[{id:'left',text:'Vasemmalle'},{id:'right',text:'Oikealle'},{id:'relative',text:transfer?'Jalan luistamispyrkimystä':'Pintojen suhteellista luistoa'},{id:'always',text:'Aina huonenopeutta'},...(!transfer?[{id:'rough',text:'Karkea, 4 N'},{id:'smooth',text:'Sileä, 1 N'}]:[])];
  const task=place(r,slots,tokens,{dir:actual,against:'relative',...(!transfer?{surface:'rough'}:{})});
  return item(m,task,transfer?'Yhdistä jalkaan vaikuttavan kitkan suunta ja sen vastustama pyrkimys.':'Vaihda vertailussa vain pintapari: valitse suuremman kitkan pinta ja kitkan suunta suhteessa liukumiseen.','Vertaa kappaleen liikettä kosketuspintaan, ei vain huoneeseen. Pidä alkunopeus ja kuorma samoina.',`Kitka vastustaa pintojen suhteellista liikettä tai sen pyrkimystä. Tässä se vaikuttaa ${words[actual]}.${transfer?'':' Annetussa vertailussa karkea pinta muuttaa suhteellista liikettä nopeammin.'}`, [{direction:actual,label:transfer?'kitka':'kitka alussa'}]);
}
const friction=spec('PHY79-FRICTION','Pinnan pitävä kosketus','Aava tutkii liukumista ja pitoa eri pinnoilla.','Opit määrittämään kitkan suunnan suhteellisen liikkeen tai sen pyrkimyksen perusteella.','Pito auttaa kuormaa etenemään.',A('sliding',r=>frictionTask(r,'sliding')),A('belt',r=>frictionTask(r,'belt')),r=>frictionTask(r,'belt',true));

function netTask(r:Rng,kind:'balanced'|'unbalanced',transfer=false):Draft {
  const right=r.pick([4,6,8]),left=kind==='balanced'?right:right-2,third=transfer?2:0;
  const forces=[{from:'köysi A',on:'vaunu',signedN:right},{from:'köysi B',on:'vaunu',signedN:-left},...(transfer?[{from:'köysi C',on:'vaunu',signedN:-third}]:[])];
  const total=netOn('vaunu',forces),d=directionOf(total),result=total===0?'0 N, ei suuntaa':`${Math.abs(total)} N ${words[d]}`;
  const m=scene('vaunu','cart',`Vaunuun vaikuttavat: ${right} N oikealle, ${left} N vasemmalle${transfer?` ja ${third} N vasemmalle`:''}.`);
  m.primary='2d'; m.inputs={kind:'net',forces};
  const alternatives=[result,'0 N, ei suuntaa',`${Math.abs(total)||2} N ${words[d==='left'?'right':'left']}`,`${right+left+third} N oikealle`].filter((x,i,arr)=>arr.indexOf(x)===i);
  const task=place(r,[{id:'sum',text:'Vaunun kokonaisvoima'}],alternatives.map((text,i)=>({id:`v${i}`,text})),{sum:'v0'});
  return item(m,task,'Yhdistä vaunun voimien yhteistulos ja sen suunta.','Valitse oikealle positiivinen suunta ja vähennä vasemmalle vaikuttavat voimat.',`Vaunun kokonaisvoima on ${right} − ${left}${transfer?` − ${third}`:''} = ${total} N. ${total===0?'Nollalla ei ole suuntaa.':`Suunta on ${words[d]}.`}`,total===0?[]:[{direction:d,label:`${Math.abs(total)} N`}]);
}
const net=spec('PHY79-NETFORCE','Voimien yhteinen tulos','Sulan taululla vaunuun vaikuttaa useita voimia.','Opit yhdistämään samansuuntaiset ja vastakkaiset voimat.','Vaunun voimien yhteistulos selviää.',A('balanced',r=>netTask(r,'balanced')),A('unbalanced',r=>netTask(r,'unbalanced')),r=>netTask(r,'unbalanced',true));

function supportTask(r:Rng,kind:'flat'|'ramp',transfer=false):Draft {
  const surface=transfer?'wall-right':kind==='flat'?'flat':'ramp-right',dir=normalDirection(surface),body='laatikko';
  const m=scene(body,transfer?'wall':kind==='flat'?'box':'ramp',transfer?'Laatikkoa painetaan oikealla olevaa pystysuoraa seinää vasten.':kind==='flat'?'Laatikko lepää vaakasuoralla pöydällä.':'Laatikko koskettaa oikealle nousevaa kaltevaa pintaa.');
  m.inputs={kind:'support',surface};
  const task=place(r,[{id:'from',text:'Tukivoiman aiheuttaja'},{id:'dir',text:'Tukivoiman suunta laatikkoon'}],[{id:'surface',text:transfer?'Seinä':'Pinta'},{id:'earth',text:'Maa'},{id:'up',text:'Ylös'},{id:'up-left',text:'Yläviistoon vasemmalle'},{id:'left',text:'Vasemmalle'}],{from:'surface',dir});
  return item(m,task,'Yhdistä tukivoiman aiheuttaja ja sen suunta.','Tukivoima on kohtisuorassa kosketuspintaan ja osoittaa pinnasta kappaleeseen.',`Tässä kosketuspinta aiheuttaa laatikkoon tukivoiman ${words[dir]}. Se ei ole aina pystysuora.`,[{direction:dir,label:'tuki'}]);
}
const support=spec('PHY79-SUPPORT','Pinnan oma tuki','Loikka tutkii laatikon kosketusta.','Opit tunnistamaan kosketuspinnan tukivoiman suunnan.','Lepäävän laatikon voimakuva saa tukivoiman.',A('flat',r=>supportTask(r,'flat')),A('ramp',r=>supportTask(r,'ramp')),r=>supportTask(r,'flat',true));

function weightTask(r:Rng,kind:'units'|'direction',transfer=false):Draft {
  const mass=r.pick([2,3,5]),g=transfer?1.6:10,w=weightNewtons(mass,g),m=scene('kuorma',transfer?'moon':'box',`Massa ${mass} kg. ${transfer?'Annettu Kuun malli':'Maan laskulikiarvo'}: g = ${g} N/kg. Paino tarkoittaa gravitaatiovoimaa kuormaan.`);
  m.inputs={kind:'weight',massKg:mass,gravityNPerKg:g,source:transfer?'Kuu':'Maa'};
  const task=place(r,[{id:'mass',text:'Massa'},{id:'weight',text:'Paino'},{id:'dir',text:'Painon suunta'}],[{id:'mass',text:`${mass} kg`},{id:'weight',text:`${w} N`},{id:'wrongunit',text:`${mass} N`},{id:'down',text:'Kohti taivaankappaleen keskustaa'},{id:'up',text:'Poispäin keskustasta'}],{mass:'mass',weight:'weight',dir:'down'});
  const result=item(m,task,kind==='units'?'Yhdistä massa, paino ja painon suunta.':'Yhdistä painon suunta ja suureiden oikeat arvot.','Massa on kilogrammoina. Paino on Maan tai Kuun kappaleeseen kohdistama voima.',`Massa on ${mass} kg; paino on ${mass} · ${g} = ${w} N kohti ${transfer?'Kuun':'Maan'} keskustaa.`,[{direction:'down',label:`${w} N`}]);
  result.afterCorrect=host=>{ forcePaint({...m,arrows:[{direction:'down',label:`${w} N`}] })(host); const panel=document.createElement('div'); panel.innerHTML=`<table><thead><tr><th>Malli</th><th>Massa</th><th>Annettu g</th><th>Paino</th></tr></thead><tbody><tr><th>Maa</th><td>${mass} kg</td><td>10 N/kg, likiarvo</td><td>${weightNewtons(mass,10)} N</td></tr><tr><th>Kuu</th><td>${mass} kg</td><td>1,6 N/kg, malliarvo</td><td>${weightNewtons(mass,1.6)} N</td></tr></tbody></table><p>Massa pysyy samana. Molemmissa paino osoittaa kohti kyseisen taivaankappaleen keskustaa.</p>`; host.append(panel); };
  return result;
}
const weight=spec('PHY79-WEIGHT','Kuorman ja Maan yhteys','Aava erottaa kuorman massan ja siihen kohdistuvan painon.','Opit erottamaan massan ja gravitaatiovoiman yksiköt ja suunnan.','Maan ja Kuun mallin merkintäkortit valmistuvat.',A('units',r=>weightTask(r,'units')),A('direction',r=>weightTask(r,'direction')),r=>weightTask(r,'units',true));

export const forceWorkshopSpecs:NodeSpec[]=[elementary,interact,direction,magnitude,vector,diagram,friction,net,support,weight];
export const forceWorkshopEvidence:Readonly<Record<string,{families:readonly string[];limit:string}>>={
 'ENV-PHY-FORCE-01':{families:['push','pull'],limit:'Näyttö koskee annettujen vuorovaikutuskorttien ja ennusteen yhdistämistä; vapaa selitys arvioidaan erikseen.'},
 'PHY79-INTERACT':{families:['contact','gravity'],limit:'Näyttö koskee annettujen osapuoli- ja voimakorttien yhdistämistä.'},
 'PHY79-FORCE-DIRECTION':{families:['pull','push'],limit:'Näyttö koskee kohteen ja annettuun tilanteeseen sopivan suunnan rakentamista korteista.'},
 'PHY79-FORCE-MAGNITUDE':{families:['length','compare'],limit:'Näyttö koskee annetun newtonarvon ja nuolipituuden yhdistämistä annetulla asteikolla.'},
 'PHY79-FORCE-01':{families:['magnitude','direction'],limit:'Molemmat perheet vaativat kohteen, suunnan ja nuolipituuden; vapaa perustelu vaatii erillisen havainnon.'},
 'PHY79-FORCE-DIAG':{families:['rest','motion'],limit:'Näyttö koskee annetun yksinkertaistetun tilanteen kohteeseen vaikuttavien voimakorttien kokoamista.'},
 'PHY79-FRICTION':{families:['sliding','belt'],limit:'Näyttö koskee annetun suhteellisen liikkeen tai liukumispyrkimyksen perusteella tehtyä suunnan valintaa.'},
 'PHY79-NETFORCE':{families:['balanced','unbalanced'],limit:'Näyttö koskee samansuuntaisten voimien annetun asteikon mukaista merkillistä summaa.'},
 'PHY79-SUPPORT':{families:['flat','ramp'],limit:'Näyttö koskee annetun kosketuspinnan normaalisuunnan valintaa.'},
 'PHY79-WEIGHT':{families:['units','direction'],limit:'Näyttö koskee annetun massan ja painon arvojen, yksiköiden sekä suunnan yhdistämistä.'},
};
