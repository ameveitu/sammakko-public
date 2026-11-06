import type { Rng } from '../engine/rng';
import type { Item,NodeSpec } from '../engine/types';
import { cases } from './kit';
import { logicWorkshopScene,solutionLogicWorkshop,type LogicWorkshopTask,type LogicReviewTask,type LogicStatement,type PerspectiveObject } from './models/logic-workshop';
import { logicWorkshopPaint } from './scenes/logic-workshop';

type Factory=(r:Rng)=>Omit<Item,'tag'>;
const kind='logic-workshop' as const;
const review=(r:Rng,model:string,criteria:readonly (readonly [string,string,string])[]):LogicReviewTask=>({
  channel:r.pick(['spoken','written'] as const),model,rubric:criteria.map(([id,label,guide])=>({id,label,guide}))
});
function item(task:LogicWorkshopTask,say:string,hint:string,explain:string):Omit<Item,'tag'>{
  return {task,scene:logicWorkshopPaint(task),...(logicWorkshopScene(task)?{sceneModel:logicWorkshopScene(task)}:{}),say,hint,explain};
}
function cause(r:Rng,variant:'turn'|'repair'|'dry'){
  const target=r.pick(['left','right'] as const),release=r.int(1,4),length=r.int(2,6);
  const task:LogicWorkshopTask={kind,mode:'cause',title:'Kourun pieni koe',apparatus:variant==='dry'?'dry':'water',target,length,
    baseline:{direction:target==='left'?'right':'left',release},draft:{direction:target,release:variant==='repair'?release%4+1:release}};
  return item(task,`Vie ${variant==='dry'?'mallipallo':'lehtivene'} ${target==='left'?'vasempaan':'oikeaan'} ${variant==='dry'?'päätepisteeseen':'poukamaan'}. Ennusta, muuta vain suuntaa ja tee vertailukoe.`,
    'Suunnan vaikutusta varten lähtöasetus pidetään samana. Virheellinen ennuste saa muuttua havainnon perusteella.',
    'Tässä rajatussa mallissa kourun suunta määrää määränpään. Samanaikainen virtauksen tai lähtökorkeuden muutos ei ole yhden tekijän vertailu.');
}
function perspective(r:Rng,variant:'shore'|'water'|'blocks'){
  const objects:PerspectiveObject[]=r.shuffle([{id:'round',label:'Pyöreä kiinnitys',shape:'sphere' as const},{id:'square',label:'Kulmikas kiinnitys',shape:'cube' as const},{id:'point',label:'Suippo kiinnitys',shape:'cone' as const}]);
  if(variant==='blocks')objects.push({id:'extra',label:'Korkea raidallinen palikka',shape:'cube',heightScale:1.6});
  const target=r.pick(objects).id,start=variant==='water'?'water':'shore';
  const task:LogicWorkshopTask={kind,mode:'perspective',title:variant==='blocks'?'Sama palikkarakennelma':'Loikan ja Aavan sama laituri',objects,target,start,blocks:variant==='blocks'};
  return item(task,`Etsi ${objects.find(o=>o.id===target)!.label.toLocaleLowerCase('fi')}. Katso molemmilta puolilta ja kerro sen paikka toisesta katselupisteestä.`,
    'Nimetty kohde ja kohteiden määrä säilyvät. Vasen ja oikea nimetään aina valitun katsojan suunnasta.',
    'Näkökulman vaihtuminen ei siirrä kiinnityskohtia. Kaksi näkymää kuvaa samaa järjestystä vastakkaisilta puolilta.');
}
function question(r:Rng,variant:'count'|'measure'|'stones'){
  const n=r.int(2,9),m=r.int(2,9),count=variant==='count';
  const availability=()=>r.pick([['length'],['time'],['length','time']] as const);
  const qa=count?['number']:availability(),qb=count?['number']:availability();
  const measurable=(ids:readonly string[])=>ids.map(id=>id==='length'?(variant==='stones'?'pituus':'kulkumatka'):(variant==='stones'?'ympärysmitta':'kulkuaika')).join(' ja ');
  const task:LogicWorkshopTask={kind,mode:'question',title:'Aavan ensimmäinen kysymys',
    quantities:count?[{id:'number',label:'lukumäärä',method:'count'}]:[{id:'length',label:variant==='stones'?'pituus':'kulkumatka',method:'measure'},{id:'time',label:variant==='stones'?'ympärysmitta':'kulkuaika',method:'measure'}],
    subjects:[{id:'a',label:count?`Ryhmä A: ${n} lehtivenettä`:`${variant==='stones'?'Kivi':'Vene'} A: tutkittavissa ${measurable(qa)}`,quantities:qa},
      {id:'b',label:count?`Ryhmä B: ${m} lehtivenettä`:`${variant==='stones'?'Kivi':'Vene'} B: tutkittavissa ${measurable(qb)}`,quantities:qb}]};
  return item(task,'Rakenna osista oma matemaattinen kysymys. Osoita myös, miten sen voisi tutkia. Vastauksia voi olla useita.',
    'Kysymyksessä on tutkittava määrä ja kohde. Vertailuun tarvitaan kaksi kohdetta. Mieluisuus ei ole pituus tai lukumäärä.',
    'Oma kysymys muodostuu valitusta kysymyssanasta, määrästä ja kohteista. Tässä arvioidaan kysymyksen rakennetta, ei mittauksen tekemistä.');
}
function claims(r:Rng,mode:'conclusion'|'argument'|'truth',variant:'first'|'second'|'transfer'){
  const threshold=r.int(3,12),values=r.shuffle([threshold-r.int(1,2),threshold,threshold+r.int(1,3)]),data=values.map((value,i)=>({id:`d${i}`,label:`${variant==='transfer'?'Kuvio':mode==='conclusion'?'Havainto':'Tapaus'} ${i+1}`,value}));
  let statements:LogicStatement[]=[],sceneText='';
  if(mode==='conclusion'){
    sceneText=variant==='first'?'Kolmessa märän hiekan kuopassa näkyvät seuraavat jälkimäärät. Jäljet eivät kerro varmasti eläimen lajia.':`Kolmen laudan pituudet näkyvät senttimetreinä. Aukko on ${threshold} cm; vähintään sen pituinen lauta yltää aukon yli. Muita lautoja ei ole mitattu.`;
    statements=[{label:variant==='first'?`Jokaisessa näistä kuopista on vähintään ${threshold} jälkeä.`:`Jokainen näistä laudoista yltää ${threshold} cm aukon yli.`,quantifier:'all',predicate:{op:'ge',value:threshold},complete:true},
      {label:variant==='first'?'Näiden kolmen kuopan ulkopuolellakin on aina vähintään sama määrä jälkiä.':`Kaikki saaren muutkin laudat yltävät ${threshold} cm aukon yli.`,quantifier:'all',predicate:{op:'ge',value:0},complete:false}];
    // The second claim refers only to unobserved objects: it cannot borrow a visible counterexample.
    statements[1]={...statements[1]!,scope:[]};
  }else if(mode==='argument'){
    const divisor=r.int(2,5);data.splice(0,data.length,...Array.from({length:5},(_,i)=>({id:`d${i}`,label:`Laatta ${i+1}`,value:(threshold+i)*divisor})));
    const forward=variant==='first';
    sceneText='Kaikki sallitut laattapituudet näkyvät senttimetreinä. Jos A ⇒ B, ehto A riittää B:hen. Käänteinen B ⇒ A on eri väite.';
    statements=[{label:forward?`Jos pituus on jaollinen luvulla ${2*divisor}, se on jaollinen luvulla ${divisor}.`:`Jos pituus on jaollinen luvulla ${divisor}, se on jaollinen luvulla ${2*divisor}.`,
      quantifier:'all',condition:{op:'multiple',value:forward?2*divisor:divisor},predicate:{op:'multiple',value:forward?divisor:2*divisor},complete:true}];
    if(variant==='transfer'){
      const width=r.int(40,70),gap=r.int(5,12);
      data.splice(0,data.length,...r.shuffle([width-1,width,width+gap-1,width+gap,width+gap+1]).map((value,i)=>({id:`d${i}`,label:`Kolmiolaituri ${i+1}`,value})));
      sceneText='Toisen rannan kolmiolaiturit kapenevat. Taulukossa on kunkin sallitun mallin kapein kulkuleveys senttimetreinä. Tutki sopimuksen ehto näillä viidellä mallilla.';
      statements=[{label:`Jos kapein leveys on vähintään ${width} cm, se on vähintään ${width+gap} cm.`,quantifier:'all',condition:{op:'ge',value:width},predicate:{op:'ge',value:width+gap},complete:true}];
    }
  }else if(variant==='transfer'){
    data.splice(0,data.length,...r.shuffle([3,4,5,6,8]).slice(0,3).map((value,i)=>({id:`d${i}`,label:`Kuvio ${i+1}: ${value}-kulmio`,value})));
    sceneText='Kuviokortti ilmoittaa jokaisen kuvion kulmien määrän. Väitteet koskevat vain näitä kolmea kuviota.';
    statements=[{label:'Jokaisessa kuviossa on parillinen määrä kulmia.',quantifier:'all',predicate:{op:'multiple',value:2},complete:true},
      {label:'Ainakin yhdessä kuviossa on vähintään neljä kulmaa.',quantifier:'some',predicate:{op:'ge',value:4},complete:true}];
  }else{
    sceneText='Näkyvissä ovat tämän merkkikivijoukon kaikki luvut. Todisteeksi yksi tapaus riittää joskus; kaikkia koskeva myönteinen väite vaatii jokaisen tapauksen.';
    statements=[{label:`${variant==='first'?'Kaikki tämän joukon luvut ovat':'Ainakin yksi tämän joukon luvuista on'} vähintään ${threshold}.`,quantifier:variant==='first'?'all':'some',predicate:{op:'ge',value:threshold},complete:true},
      {label:'Mikä näistä kivistä olisi mukavin?',quantifier:'question',predicate:{op:'ge',value:threshold},complete:false}];
  }
  const task:LogicWorkshopTask={kind,mode,title:mode==='conclusion'?'Jälki märässä hiekassa':mode==='argument'?'Majavan kuultu perustelu':'Totuuden merkkikivet',data,statements,sceneText,
    ...(mode==='argument'?{review:review(r,'Viittaan sopimuksen ehtoon ja tapauksiin. Epätoden kaikki-väitteen kumoaa yksi ehdon täyttävä vastaesimerkki; tosi päätelmä rajataan tässä koko lueteltuun joukkoon.',[
      ['claim','Nimeää ehdon ja väitteen','Erottaa jos–niin-väitteen sen käänteisestä.'],
      ['evidence','Perustelee havaintotuella','Selittää vastaesimerkin tai koko joukon läpikäynnin.'],
      ['scope','Rajaa päätelmän','Erottaa tämän joukon kaikista mahdollisista luvuista.']])}:{})};
  return item(task,mode==='argument'?'Tutki sopimusta, merkitse havaintotuki ja tuota oma perustelusi.':'Arvioi jokainen lause ja liitä siihen riittävä havaintotuki.',
    'Epätoden kaikki-väitteen kumoaa yksi vastaesimerkki. Tuntematonta tapausta ei ratkaista arvaamalla.',
    'Tarkka väite kertoo, koskeeko se yhtä, joitakin vai kaikkia tapauksia. Avoimella kysymyksellä ei ole väitelauseen totuusarvoa.');
}
function combinations(r:Rng,variant:'product'|'restricted'|'menu'){
  const a=r.int(2,3),b=r.int(2,4),menu=variant==='menu';
  const factors=[{label:menu?'Ruokalaji':'Saapumisreitti',options:Array.from({length:a},(_,i)=>({id:`a${i}`,label:menu?`Ruoka ${i+1}`:`Reitti ${i+1}`}))},
    {label:menu?'Juoma':'Laituri',options:Array.from({length:b},(_,i)=>({id:`b${i}`,label:menu?`Juoma ${i+1}`:`Laituri ${i+1}`}))}];
  const forbidden=variant==='product'?[]:[[r.pick(factors[0]!.options).id,r.pick(factors[1]!.options).id]];
  const task:LogicWorkshopTask={kind,mode:'combinations',title:'Kaikki reitit juhlapöytään',factors,forbidden,
    review:review(r,'Käyn ensimmäisen valinnan vaihtoehdot yksi kerrallaan. Liitän jokaiseen kaikki sallitut toisen valinnan vaihtoehdot. Siksi jokainen sallittu pari on mukana kerran.',[
      ['complete','Perustelee kattavuuden','Osoittaa kaikki sallitut haarat ja huomioi kiellon.'],
      ['unique','Perustelee toistottomuuden','Sama pari on mukana kerran; rivijärjestys ei muuta paria.']])};
  return item(task,'Rakenna oma taulukko kaikista sallituista yhdistelmistä. Perustele lopuksi, miksi listasi on kattava.',
    'Pidä ensimmäinen valinta hetken samana ja käy toiset vaihtoehdot läpi. Lisää seuraava rivi itse.',
    'Pelkkä oikea yhteismäärä ei vielä osoita kattavaa luetteloa. Jokainen sallittu pari tarvitaan kerran, missä tahansa rivijärjestyksessä.');
}
function rule(r:Rng,variant:'linear'|'conditional'|'price'){
  const factor=r.int(2,7),offset=r.int(1,9),threshold=r.int(2,5),domainMax=9,input=r.int(6,9);
  const task:LogicWorkshopTask={kind,mode:'rule',title:'Majakan täsmällinen viesti',factor,offset,domainMax,input,unit:variant==='price'?'€':'lyhtyä',
    ...(variant==='linear'?{}:{threshold,aboveOffset:offset+r.int(1,6)})};
  return item(task,'Rakenna annetusta suhteesta oma lauseke muuttujalla x ja sovella sitä uuteen syötteeseen. Yhtäpitävät lausekkeet kelpaavat.',
    'Voit käyttää x:ää, kokonaislukuja, sulkuja sekä +, − ja * -merkkejä. Ehto tarkistetaan rajan molemmin puolin.',
    'Sääntö koskee kaikkia ilmoitetun alueen kokonaislukuja. Muutaman esimerkin sopivuus ei yksin määrää yleistä sääntöä.');
}
function proof(r:Rng,variant:'bridge'|'combined'|'numbers'){
  const n=r.int(3,11),m=r.int(2,8);
  let task:LogicWorkshopTask;
  if(variant==='numbers'){
    const d=r.int(2,9);
    task={kind,mode:'proof',title:'Sillan syyketju: lukujen silta',assumptions:['a','b','integers'],goal:'g',facts:{a:`n = ${d}k`,b:`m = ${d}l`,integers:'k ja l ovat kokonaislukuja',sum:`n + m = ${d}k + ${d}l`,factor:`n + m = ${d}(k + l)`,closed:'k + l on kokonaisluku',g:`n + m on jaollinen luvulla ${d}`},rules:[
      {id:'add',label:'Laske annetut yhtälöt yhteen.',premises:['a','b'],conclusion:'sum'},
      {id:'factor',label:`Ota yhteinen tekijä ${d} sulkujen eteen.`,premises:['sum'],conclusion:'factor'},
      {id:'closure',label:'Kokonaislukujen summa on kokonaisluku.',premises:['integers'],conclusion:'closed'},
      {id:'definition',label:'Käytä jaollisuuden määritelmää.',premises:['factor','closed'],conclusion:'g'},
      {id:'circle',label:'Oleta tavoite ja päättele siitä muoto.',premises:['g'],conclusion:'factor'}]};
  }else{
    task={kind,mode:'proof',title:'Sillan syyketju',assumptions:['length','load'],goal:'g',facts:{length:`Lauta on ${n+2} m, aukko ${n} m.`,load:`Tuen kantavuus on ${m+2} kg, kori ${m} kg.`,span:'Lauta yltää aukon yli.',holds:'Tuki kantaa korin.',g:'Tämän mallin silta yltää ja kantaa.'},rules:[
      {id:'span',label:'Vertaa laudan pituutta aukkoon.',premises:['length'],conclusion:'span'},
      {id:'holds',label:'Vertaa kantavuutta korin massaan.',premises:['load'],conclusion:'holds'},
      {id:'join',label:'Yhdistä molemmat tarkistetut ehdot.',premises:['span','holds'],conclusion:'g'},
      ...(variant==='combined'?[{id:'direct',label:'Tarkista molemmat lukuehdot samalla askeleella.',premises:['length','load'],conclusion:'g'}]:[]),
      {id:'circle',label:'Silta toimii, joten se varmasti yltää.',premises:['g'],conclusion:'span'}]};
  }
  task.rules=r.shuffle(task.rules);
  task.review=review(r,'Nimeän valitun vaiheen lähtötiedot ja selitän, miksi ne riittävät seuraavaan väitteeseen. En käytä tavoitetta omana oletuksenaan.',[
    ['premise','Nimeää vaiheen lähtötiedot','Osoittaa oletuksen tai aiemman tiedon omasta ketjusta.'],
    ['reason','Perustelee päättelyaskeleen','Selittää luvan päätelmään; ei oleta lopputulosta.']]);
  return item(task,'Rakenna pätevä ketju annetuista oletuksista tavoitteeseen. Selitä yksi käyttämäsi vaihe omin sanoin.',
    'Kaksi riippumatonta vaihetta voi vaihtaa paikkaa. Kehä ei anna uutta lähtötietoa.',
    'Tämä näyttö koskee annetun päättelyketjun rakentamista ja yhden vaiheen selittämistä. Se ei yksin osoita vapaan todistuksen keksimistä.');
}
function reading(r:Rng,variant:'minimum'|'double'|'transfer'){
  const n=r.int(3,16),extra=r.int(2,8),relation=variant==='minimum'?'ge':variant==='double'?'double':r.pick(['le','difference'] as const);
  const given=`Korissa on ${n} köyttä.`,target='Kuinka monta köyttä toiseen koriin tarvitaan?',condition=relation==='ge'?`Toisessa pitää olla vähintään ${n+extra} köyttä.`:relation==='le'?`Toisessa saa olla enintään ${n+extra} köyttä.`:relation==='double'?'Toisessa pitää olla kaksinkertainen määrä ensimmäiseen verrattuna.':`Ensimmäisen ja toisen korin määrien erotuksen pitää olla ${extra}.`;
  const task:LogicWorkshopTask={kind,mode:'reading',title:'Pullopostin tarkka pyyntö',sentence:`${given} ${condition} ${target}`,relation,
    pieces:r.shuffle([{id:'given',label:given},{id:'target',label:target},{id:'condition',label:condition}]),roles:{given:'given',target:'target',condition:'condition'}};
  return item(task,'Poimi viestin tieto, kysymys ja ehto. Yhdistä ehtolause oikeaan suhteeseen. Laskua ei tarvitse ratkaista.',
    'Lue koko ehtolause. Vähintään sallii rajan ja suuremmat, enintään rajan ja pienemmät.',
    'Matemaattinen lukeminen erottaa tunnetun, tavoitteen ja niiden välisen ehdon.');
}
function writing(r:Rng,variant:'groups'|'share'|'recipient'){
  const factor=r.int(2,8),part=r.int(3,12),operation=variant==='groups'?'groups':'share';
  const amount=operation==='groups'?part:part*factor,quantity=variant==='recipient'?'köyden pituus':'tarvikkeiden määrä',unit=variant==='recipient'?'m':'kpl';
  const task:LogicWorkshopTask={kind,mode:'writing',title:'Viesti seuraavalle retkelle',quantity,unit,amount,factor,operation,recipient:variant==='recipient'?'Sulka':'Aava',
    review:review(r,operation==='groups'?`${factor} ryhmässä on kussakin ${amount} ${unit}. Yhteensä tarvitaan ${factor*amount} ${unit}.`:`Jaetaan ${amount} ${unit} tasan ${factor} ryhmään. Jokaiseen tulee ${amount/factor} ${unit}.`,[
      ['quantity','Nimeää suureen ja yksikön','Kertoo, mitä annettu määrä kuvaa.'],
      ['relation','Selittää suhteen omin sanoin','Erottaa kokoamisen tasan jakamisesta.'],
      ['conclusion','Viestii perustellun tuloksen','Vastaa kysymykseen; pelkkä laskumerkkijono ei riitä.']])};
  return item(task,`Kirjoita tai kerro ${task.recipient}lle oma ratkaisuteksti. Liitä siihen suure, suhde, yksikkö ja johtopäätös.`,
    'Oma teksti voi olla lyhyt. Kerro mitä luvut tarkoittavat ja miksi valitsemasi lasku sopii tilanteeseen.',
    'Aikuinen arvioi oman viestin merkityksen. Valmista mallitekstiä käyttävä harjoitus kirjataan tuetuksi.');
}
function spec(id:string,stop:string,a:[string,Factory],b:[string,Factory],transfer:Factory):NodeSpec{
  const rev=`logic-workshop-${id.toLowerCase()}-v1`;
  return {id,stop,icon:'◇',intro:'Aava avaa havaintovihkon. Yhteinen päätös tarvitsee kysymyksen, havainnon ja syyn.',goal:stop,reward:'Oma havainto tai perusteltu viesti löytää paikkansa yhteisessä retkessä.',rev,validRevs:[rev],produce:[a[0],b[0]],produceWhat:'oman kysymyksen, luettelon, mallin tai perustellun päätelmän rakentaminen',
    demo:r=>{const d=a[1](r),task=d.task as LogicWorkshopTask,answer=solutionLogicWorkshop(task);return [{say:d.explain,scene:logicWorkshopPaint(task,answer),...(logicWorkshopScene(task,answer)?{sceneModel:logicWorkshopScene(task,answer)}:{})}];},item:cases({[a[0]]:a[1],[b[0]]:b[1]},transfer)};
}
export const logicWorkshopSpecs:NodeSpec[]=[
  spec('M-TH-05','Kourun pieni koe',['one-change',r=>cause(r,'turn')],['repair-confound',r=>cause(r,'repair')],r=>cause(r,'dry')),
  spec('M-TH-06','Loikan ja Aavan sama laituri',['shore-to-water',r=>perspective(r,'shore')],['water-to-shore',r=>perspective(r,'water')],r=>perspective(r,'blocks')),
  spec('M-WORK-02','Aavan ensimmäinen kysymys',['countable-collections',r=>question(r,'count')],['measurable-motion',r=>question(r,'measure')],r=>question(r,'stones')),
  spec('M-WORK-03','Jälki märässä hiekassa',['traces-and-limits',r=>claims(r,'conclusion','first')],['measured-fit',r=>claims(r,'conclusion','second')],r=>claims(r,'conclusion','transfer')),
  spec('M79-ARG-01','Majavan kuultu perustelu',['implication',r=>claims(r,'argument','first')],['converse-counterexample',r=>claims(r,'argument','second')],r=>claims(r,'argument','transfer')),
  spec('M79-COMB-01','Kaikki reitit juhlapöytään',['cartesian-tree',r=>combinations(r,'product')],['restricted-paths',r=>combinations(r,'restricted')],r=>combinations(r,'menu')),
  spec('M79-LOGIC-02','Majakan täsmällinen viesti',['affine-rule',r=>rule(r,'linear')],['conditional-rule',r=>rule(r,'conditional')],r=>rule(r,'price')),
  spec('M79-PROOF-01','Sillan syyketju',['parallel-reasons',r=>proof(r,'bridge')],['alternative-valid-chain',r=>proof(r,'combined')],r=>proof(r,'numbers')),
  spec('M79-TEXT-01','Pullopostin tarkka pyyntö',['minimum-condition',r=>reading(r,'minimum')],['double-relation',r=>reading(r,'double')],r=>reading(r,'transfer')),
  spec('M79-TEXT-02','Viesti seuraavalle retkelle',['grouping-message',r=>writing(r,'groups')],['sharing-message',r=>writing(r,'share')],r=>writing(r,'recipient')),
  spec('M79-TRUTH-01','Totuuden merkkikivet',['universal-and-question',r=>claims(r,'truth','first')],['existential-and-question',r=>claims(r,'truth','second')],r=>claims(r,'truth','transfer')),
];
export const logicWorkshopEvidence=Object.fromEntries(logicWorkshopSpecs.map(s=>[s.id,{families:s.produce??[],limit:
  s.id==='M79-PROOF-01'?'Annetun syyketjun rakentaminen ja yhden vaiheen oma selitys aikuisen havainnoimana; ei vapaan todistuksen keksimisen näyttö.':
  s.id==='M-WORK-02'?'Osista rakennetun matemaattisen kysymyksen ja tutkimistavan näyttö; useita valideja yhdistelmiä. Ei vapaan sanallisen kysymyksen tuottamisen arviointia.':
  ['M79-ARG-01','M79-TEXT-02','M79-COMB-01'].includes(s.id)?'Oma rakennelma ja tehtäväkohtaisesti havaittu oma perustelu. Puhetta tai tekstiä ei tallenneta.':
  s.id==='M-TH-05'?'Yhden tekijän virtuaalinen vertailukoe. Veden kulku on rajattu pelimalli, kuiva pallo kitkaton liukuvan kappaleen malli. Ei fyysisen kokeen suoritusnäyttö.':
  'Rajattu kysymyksen, väitteen, havainnon tai esityksen rakenne. Tunnistamista ei kirjata vapaamuotoiseksi perusteluksi.'}]));
