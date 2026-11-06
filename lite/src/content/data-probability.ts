import type { Rng } from '../engine/rng';
import type { Item,NodeSpec } from '../engine/types';
import { cases } from './kit';
import { compareChances,complementary,extremes,frequencies,modes,
  type DataAction,type DataBag,type DataBoard,type DataChart,type DataChartAction,type DataField,type DataOption,type DataProbabilityTask,type DataRow,
} from './models/data-probability';
import { dataProbabilityArt } from './scenes/data-probability';

type Draft=Omit<Item,'tag'|'task'>&{task:DataProbabilityTask};
type Family=(r:Rng)=>Draft;
interface Definition extends Omit<NodeSpec,'item'|'demo'|'rev'|'validRevs'|'produce'> {
  families:Record<string,Family>;transfer:Family;limit:string;edition?:1|2;
}
function define({families,transfer,limit,edition=1,...meta}:Definition){
  const tags=Object.keys(families),prefix=`exp690-data-${meta.id.toLowerCase()}`,rev=`${prefix}-v${edition}`;
  return {spec:{...meta,rev,validRevs:edition===2?[`${prefix}-v1`,rev]:[rev],item:cases(families,transfer),
    ...(meta.produceWhat?{produce:[...tags,'transfer']}:{}),
    demo:r=>tags.map(tag=>{const example=families[tag]!(r);return {say:example.explain!,scene:dataProbabilityArt(example.task,true)};}),
  } satisfies NodeSpec,evidence:{families:tags,limit}};
}
const opts=(values:Record<string,string>):DataOption[]=>Object.entries(values).map(([id,label])=>({id,label}));
const pick=(id:string,label:string,options:DataOption[],answer:string):DataField=>({kind:'choice',id,label,options,answer});
const number=(id:string,label:string,answer:number|string):DataField=>({kind:'number',id,label,answer:String(answer)});
const set=(id:string,label:string,options:readonly DataOption[],answer:readonly string[]):DataField=>({kind:'set',id,label,options,answer});
const rows=(labels:readonly string[],values:readonly number[]):DataRow[]=>labels.map((label,i)=>({id:String(i),label,value:values[i]!}));
const table=(data:DataRow[],column:string,unit:string,note?:string):DataBoard=>({kind:'table',rows:data,columns:[column,unit],note});
const words='Valinnat ja lasketut arvot kuvaavat annettua aineistoa. Vapaa selitys arvioidaan erikseen.';
const groupChoices=(data:readonly DataRow[])=>data.map(({id,label})=>({id,label}));
function question(board:DataBoard,fields:DataField[],say:string,hint:string,explain:string,action?:DataAction,why=hint):Draft {
  return {task:{kind:'data-probability',board,fields,action,why},say,hint,explain};
}
const fish=['Ahven','Särki','Hauki','Lahna'];
const shore=['Laituri','Poukama','Kallio','Ruovikko'];
const ticks=['9.00','10.00','11.00','12.00'];
const bars=(data:DataRow[],title:string,horizontalAxis:string,verticalAxis:string,step:number,top:number,horizontal=false):DataChart=>
  ({type:'bar',rows:data,title,horizontalAxis,verticalAxis,step,top,horizontal});

function readBar(r:Rng,horizontal:boolean,transfer=false):Draft {
  const step=transfer?5:horizontal?2:1;
  const data=rows(horizontal?shore:fish,r.shuffle([1,3,4,5]).map(n=>n*step));
  const target=r.pick(data);
  const chart=bars(data,horizontal?'Havainnot rannoilla':'Havaitut kalat',horizontal?'Rannat':'Kalalajit','Havaintoja (kpl)',step,6*step,horizontal);
  return question({kind:'chart',chart},[
    pick('axis','Luokkien akseli',opts({horizontal:'vaaka-akseli',vertical:'pystyakseli'}),horizontal?'vertical':'horizontal'),
    number('step','Asteikkoväli',step),
    number('value',`${target.label}: pylvään arvo`,target.value),
    pick('unit','Arvon yksikkö',opts({pieces:'kappaletta',metres:'metriä',time:'tuntia'}),'pieces'),
  ],`Tunnista luokka-akseli, asteikkoväli ja kohteen ${target.label} arvo yksikköineen.`,
  'Katso, kummalla akselilla ovat nimet ja kummalla luvut. Lue arvot nollasta alkaen.',
  `Asteikon askel on ${step}. Kohteen ${target.label} pylväs osoittaa ${target.value} havaintoa.`);
}
const read=define({
  id:'M-DATA-06',stop:'Pylvään korkeus kertoo',icon:'▥',
  intro:'Aava tuo pajan seinälle pylväitä. Loikka lukee luokat ja arvot eri akseleilta.',
  goal:'Tunnistat pylväsdiagrammin luokat, asteikon ja yksikön.',reward:'Havaintotaulu kertoo jokaisen pylvään merkityksen.',
  families:{'read-vertical-count-axis':r=>readBar(r,false),'read-horizontal-scale-step':r=>readBar(r,true)},
  transfer:r=>readBar(r,true,true),limit:words,
});

function chartAction(data:DataRow[],title:string,category:string,unit:string,step:number,top:number,
  types:DataChartAction['types'],reasons?:DataOption[]):DataChartAction{
  return {kind:'chart',rows:data,types,reasonOptions:reasons,
    titleOptions:opts({data:title,other:'Eilisen sää',none:'Pajan koristetaulu'}),
    categoryOptions:opts({categories:category,wrong:'Vuosi',none:'Värit'}),
    valueOptions:opts({counts:unit,distance:'Pituus (m)',duration:'Aika (min)'}),
    labels:{title:'data',category:'categories',value:'counts'},initialScale:{step,top,key:1}};
}
function buildBar(r:Rng,variable:boolean,transfer=false):Draft{
  const data=transfer?r.shuffle(rows(shore,[0,4,6,10])):variable?r.shuffle(rows(shore,[2,7,4,9])):rows(fish,[0,3,6,4]);
  const categories=variable||transfer?'Rannat':'Kalalajit',title=variable||transfer?'Laskenta rannoilla':'Kalojen havainnot';
  return question(table(data,categories,'Havaintoja (kpl)'),[],
  'Rakenna taulukosta pylväsdiagrammi. Valitse otsikko ja akselit, aseta nollasta alkava tasavälinen asteikko ja merkitse jokainen pylväs.',
  'Valitse yläraja, jolle suurinkin arvo mahtuu. Voit kirjoittaa pylvään arvon tai napauttaa kuvaa.',
  'Taulukon jokainen luku näkyy oman luokkansa pylväänä. Asteikon tasaväliset jaot tekevät vertailun mahdolliseksi.',
  chartAction(data,title,categories,'Havaintoja (kpl)',variable||transfer?2:1,variable||transfer?10:8,[{type:'bar',reasons:[]}]));
}
const build=define({
  id:'M-DATA-07',stop:'Havainnot nousevat pylväiksi',icon:'▤',
  intro:'Loikka tuo havaintolistan. Aava pyytää rakentamaan kuvan, josta määrät voi tarkistaa.',
  goal:'Rakennat aineiston pylväät ja merkitset otsikot sekä asteikon.',reward:'Majakan seinälle syntyy luettava havaintokuva.',
  produceWhat:'oman pylväsdiagrammin otsikoita, asteikkoa ja pylväitä',
  families:{'build-zero-valued-category':r=>buildBar(r,false),'build-different-tick-and-order':r=>buildBar(r,true)},
  transfer:r=>buildBar(r,true,true),limit:'Otsikko ja akselit valitaan. Oppija tuottaa tasavälisen nolla-asteikon sekä jokaisen pylvään arvon. Sopivat vaihtoehtoiset asteikot käyvät.',
});
function compareBars(r:Rng,readPair:boolean,transfer=false):Draft{
  const step=transfer?5:readPair?2:1;
  const data=rows(shore,r.shuffle([1,2,4,5]).map(n=>n*step));
  const [a,b]=data;
  const largest=[...data].sort((a,b)=>b.value-a.value)[0]!;
  const fields=readPair?[
    number('a',`${a!.label}: määrä`,a!.value),number('b',`${b!.label}: määrä`,b!.value),
    number('difference','Määrien erotus',Math.abs(a!.value-b!.value)),
  ]:[pick('largest','Eniten havaintoja',groupChoices(data),largest.id),number('value','Suurin määrä',largest.value)];
  return question({kind:'chart',chart:bars(data,'Tämän aamun havainnot','Paikka','Havaintoja (kpl)',step,6*step,transfer)},[
    ...fields,pick('claim','Mitä kuva tukee?',opts({today:'Näiden paikkojen vertailua tänä aamuna',every:'Samaa järjestystä kaikkina aamuina',cause:'Paikka aiheutti eron'}),'today'),
  ],readPair?`Lue kohteiden ${a!.label} ja ${b!.label} arvot. Laske erotus ja valitse perusteltu päätelmä.`
    :'Etsi suurin pylväs ja lue sen arvo. Valitse päätelmä, jonka kuva tukee.',
  'Lue luvut asteikolta. Otsikko kertoo, milloin havainnot tehtiin.',
  'Diagrammi kuvaa näitä havaintoja tänä aamuna. Tulevien aamujen arvoja tai eron syytä se ei osoita.');
}
const interpretation=define({
  id:'M-DATA-08',stop:'Mitä pylväät todella näyttävät?',icon:'🔎',
  intro:'Loikka haluaa ennustaa huomisen. Aava tutkii ensin, mitä tämän aamun kuva kertoo.',
  goal:'Luet arvoja, vertailet niitä ja rajaat päätelmän aineistoon.',reward:'Majakan havaintotaulu saa täsmällisen selitteen.',
  families:{'bars-maximum-with-bounded-claim':r=>compareBars(r,false),'bars-pair-difference':r=>compareBars(r,true)},
  transfer:r=>compareBars(r,true,true),limit:words,
});
function chooseChart(r:Rng,time:boolean,transfer=false):Draft{
  const data=time?rows(ticks,transfer?[41,29,37,52]:[21,34,27,43]):r.shuffle(rows(shore,[4,10,6,8]));
  const title=time?'Havainnot kellonaikoina':'Rantojen havaintomäärät';
  const category=time?'Kellonaika':'Ranta';
  const allowed:DataChartAction['types']=time?[
    {type:'bar',reasons:['ordered','changes']},{type:'line',reasons:['ordered','changes']},
  ]:[{type:'bar',reasons:['classes']},{type:'picture',reasons:['classes','pictures']}];
  const reasons=opts({ordered:'Järjestetyt ajankohdat voi vertailla',changes:'Peräkkäiset mittaukset näyttävät muutoksen',
    classes:'Erillisiä luokkia vertaillaan',pictures:'Samankokoiset kuvat voivat kertoa määrän',color:'Kuvan väri ratkaisee'});
  return question(table(data,category,'Havaintoja (kpl)',time?
    'Kellonajat järjestykseen. Enintään 18 kokonaista kuvamerkkiä riville.':
    'Vertaile rantoja erillisinä luokkina.'),[],
  'Valitse kysymykseen sopiva diagrammi ja sen peruste. Rakenna kuva oikeilla nimillä ja arvoilla.',
  'Luokkia voi verrata erillisinä. Ajassa peräkkäisten mittausten järjestyksellä on merkitys.',
  time?'Aikajärjestys säilyy sekä viivassa että järjestetyissä pylväissä. Näillä arvoilla kokonaiset kuvamerkit eivät mahdu annetuille riveille.':
    'Pylväät tai samanarvoiset kuvamerkit voivat näyttää luokkien erot. Viiva loisi rannoille keinotekoisen järjestyksen.',
  chartAction(data,title,category,'Havaintoja (kpl)',time?10:2,time?60:10,allowed,reasons));
}
const representation=define({
  id:'M-DATA-11',stop:'Kysymykseen sopiva kuva',icon:'◫',
  intro:'Aava tarvitsee toisinaan vertailukuvan ja toisinaan kuvan päivän muutoksesta.',
  goal:'Valitset aineistoon sopivan diagrammin ja rakennat sen.',reward:'Majakan ilmoitustaulu vastaa esitettyyn kysymykseen.',
  produceWhat:'valitun diagrammin ja sen esityssäännön tuottamista',
  families:{'choose-unordered-category-display':r=>chooseChart(r,false),'choose-ordered-time-display':r=>chooseChart(r,true)},
  transfer:r=>chooseChart(r,true,true),limit:'Useampi diagrammityyppi ja perustelu voi sopia samaan aineistoon. Valittu kuva, nimet, arvoasteikko tai kuvamerkin arvo sekä data tarkistetaan.',
});
function readTypes(r:Rng,trend:boolean,transfer=false):Draft{
  const step=transfer?4:trend?3:2;
  const data=rows(trend?ticks:shore,r.shuffle([1,2,3,4]).map(n=>n*step));
  const chart:DataChart=transfer?bars(data,'Rantahavainnot','Ranta','Havaintoja (kpl)',step,5*step,true):{
    type:trend?'line':'picture',rows:data,title:trend?'Rannan havaintohetket':'Rantahavainnot',
    horizontalAxis:trend?'Kellonaika':'Paikka',verticalAxis:'havaintoa',step,top:5*step,...(!trend?{key:step}:{}),
  };
  const [a,b]=data;
  return question({kind:'chart',chart,note:trend&&!transfer?'Viivan piste näyttää mitatun arvon kohdallaan. Luokka näkyy pisteen alla.':
    transfer?'Vaakapylväs ulottuu nollasta havaintojen määrään.':'Kuvat ovat samankokoisia. Selite kertoo yhden kuvan arvon.'},[
    number('a',`${a!.label}: arvo`,a!.value),number('b',`${b!.label}: arvo`,b!.value),
    number('difference','Arvojen erotus',Math.abs(a!.value-b!.value)),
  ],`Lue arvot kohdista ${a!.label} ja ${b!.label}. Kirjoita niiden erotus.`,
  trend||transfer?'Lue arvo asteikolta juuri merkityn kohdan kohdalla.':'Kerro kuvien lukumäärä selitteen antamalla arvolla.',
  'Kuvan esitystapa vaihtuu, mutta arvot luetaan sen omasta asteikosta tai selitteestä.');
}
const multiRead=define({
  id:'M-DATA-12',stop:'Majakan erilaiset ikkunat',icon:'▧',
  intro:'Sama havaintopaja käyttää sekä kuvia että pisteitä. Loikka tarkistaa aina esityksen selitteen.',
  goal:'Tulkitset diagrammin arvot sen omasta asteikosta.',reward:'Eri ikkunat kertovat samasta aineistosta selkeästi.',
  families:{'read-equal-size-pictograms':r=>readTypes(r,false),'read-time-line-points':r=>readTypes(r,true)},
  transfer:r=>readTypes(r,false,true),limit:'Lasketut arvot ja erotus arvioidaan annettujen kuvien avaimesta tai asteikolta. Kuvat ovat keskenään samankokoisia.',
});

const uniform='Pussi sekoitetaan ja yksi merkki poimitaan katsomatta. Jokainen pussin yksittäinen merkki on yhtä todennäköinen.';
const possible='Mallissa nostetaan yksi merkki. Samannäköiset merkit ovat eri alkeistuloksia, kun niiden tunnukset ovat eri.';
const bags=(data:DataBag[],note=possible):DataBoard=>({kind:'bags',bags:data,note});
const marks=(letters:readonly string[],prefix='T'):DataOption[]=>letters.map((label,i)=>({id:`${prefix}${i+1}`,label:`${label} ${prefix}${i+1}`}));
const idsWhere=(tokens:readonly DataOption[],test:(label:string)=>boolean)=>tokens.filter(t=>test(t.label)).map(t=>t.id);
const eventWords=opts({impossible:'Mahdoton',possible:'Mahdollinen, mutta ei varma',certain:'Varma'});
const category=(count:number,total:number)=>count===0?'impossible':count===total?'certain':'possible';
const blue=(label:string)=>label.startsWith('Sininen');
const red=(label:string)=>label.startsWith('Punainen');
const numberFrom=(label:string)=>Number(label.split(' ')[0]);

function classifyEvents(r:Rng,numeric:boolean,transfer=false):Draft{
  const names=numeric?r.pick([
    ['1','2','2','4'],['2','3','4','4'],['2','4','6'],['1','3','5'],['5','6','7','7'],['1','3','3'],
  ]):transfer?['Vihreä','Vihreä','Keltainen','Vihreä']:r.pick([
    ['Sininen','Sininen','Punainen'],['Sininen','Sininen'],['Punainen','Punainen'],
    ['Vihreä','Sininen','Punainen'],['Sininen','Vihreä','Vihreä'],['Punainen','Vihreä','Punainen'],
  ]);
  const tokens=marks(names);
  const queries:{label:string;test:(label:string)=>boolean}[]=numeric?[
    {label:'Saadaan luku, joka on alle 5',test:s=>numberFrom(s)<5},
    {label:'Saadaan parillinen luku',test:s=>numberFrom(s)%2===0},
    {label:'Saadaan luku 6',test:s=>numberFrom(s)===6},
  ]:transfer?[
    {label:'Saadaan vihreä merkki',test:s=>s.startsWith('Vihreä')},
    {label:'Saadaan sininen merkki',test:blue},
    {label:'Saadaan vihreä tai keltainen merkki',test:s=>s.startsWith('Vihreä')||s.startsWith('Keltainen')},
  ]:[
    {label:'Saadaan sininen merkki',test:blue},{label:'Saadaan vihreä merkki',test:s=>s.startsWith('Vihreä')},
    {label:'Saadaan punainen tai sininen merkki',test:s=>red(s)||blue(s)},
  ];
  return question(bags([{name:'Pussi',tokens}]),queries.map((event,i)=>pick(String(i),event.label,eventWords,
    category(idsWhere(tokens,event.test).length,tokens.length))),
  'Luokittele jokainen tapahtuma pussin mahdollisten nostojen perusteella.',
  'Mahdotonta tapahtumaa ei tuota yksikään merkki. Varma tapahtuma toteutuu jokaisella merkillä.',
  'Mahdollinen mutta epävarma tapahtuma toteutuu joillakin merkeillä. Toive tai aiempi nosto ei muuta mallin mahdollisia tuloksia.');
}
const classify=define({
  id:'M-PROB-01',edition:2,stop:'Mitä läpinäkyvästä pussista voi tulla?',icon:'◌',
  intro:'Loikka toivoo sinistä merkkiä. Aava tutkii, mitä pussi oikeasti sisältää.',
  goal:'Erotat mahdottoman, mahdollisen ja varman tapahtuman.',reward:'Pussin kaikki mahdolliset nostot tunnetaan.',
  families:{'classify-colour-events':r=>classifyEvents(r,false),'classify-number-conditions':r=>classifyEvents(r,true)},
  transfer:r=>classifyEvents(r,false,true),limit:'Luokittelu perustuu ilmoitettuun tulosjoukkoon. Se ei arvioi todellisen poimintakokeen pitkäaikaista frekvenssiä.',
});
function listOutcomes(r:Rng,duplicates:boolean,transfer=false):Draft{
  const second=r.pick([
    opts({a:'Aamu',i:'Ilta'}),opts({s:'Sumu',k:'Kirkas'}),opts({a:'Aamu',i:'Ilta',y:'Yö'}),
    opts({l:'Lämmin',v:'Viileä',p:'Pakkanen'}),
  ]);
  const left=transfer?['Sininen','Sininen']:r.pick([
    ['Sininen','Sininen'],['Sininen','Sininen','Punainen'],['Vihreä','Vihreä'],['Punainen','Punainen','Vihreä'],
  ]);
  const right=transfer?['Punainen','Punainen','Vihreä']:left.length===3?
    r.pick([['Punainen','Vihreä'],['Keltainen','Keltainen']]):
    r.pick([['Punainen','Vihreä'],['Keltainen','Keltainen'],['Punainen','Vihreä','Keltainen']]);
  const groups=duplicates?[marks(left,'A'),marks(right,'B')]:
    [opts({l:'Laituri',p:'Poukama'}),second] as const;
  const pair=[groups[0]!,groups[1]!] as const;
  const labels=duplicates?['Ensimmäisen pussin merkki','Toisen pussin merkki'] as const:['Paikka','Viestin merkki'] as const;
  return question({kind:'product',groups:pair,labels,note:'Valitse yksi kummastakin ryhmästä. Kaikki nämä yhdistelmät ovat sallittuja.'},
    [number('total','Alkeistuloksia yhteensä',pair[0].length*pair[1].length)],
    'Kokoa jokainen mahdollinen yhdistelmä kerran ja laske alkeistulokset.',
    'Pidä ensin ensimmäinen valinta samana ja käy kaikki toiset valinnat läpi. Vaihda sitten ensimmäistä.',
    `Jokaisella ${pair[0].length} ensimmäisellä valinnalla on ${pair[1].length} mahdollista paria. Eri tunnukset tarkoittavat eri tuloksia.`,
    {kind:'tuples',groups:pair,labels},
    'Jokainen sallittu pari tulee listaan kerran. Erota myös samannäköiset merkit tunnuksen perusteella.');
}
const outcomes=define({
  id:'M-PROB-02',edition:2,stop:'Kaikki viestin mahdolliset muodot',icon:'⊗',
  intro:'Majakan viesti valitaan kahdesta osasta. Aava haluaa listan kaikista sallituista yhdistelmistä.',
  goal:'Luettelet alkeistulokset järjestelmällisesti ilman toistoa.',reward:'Viestikortti sisältää kaikki mahdolliset vaihtoehdot.',
  produceWhat:'oman täydellisen alkeistuloslistan rakentamista',
  families:{'enumerate-distinct-symbols':r=>listOutcomes(r,false),'enumerate-lookalike-identities':r=>listOutcomes(r,true)},
  transfer:r=>listOutcomes(r,true,true),limit:'Listan järjestys on vapaa. Jokaisessa tuloksessa on yksi valinta kummastakin nimetystä ryhmästä. Listasta ei päätellä tasatodennäköisyyttä.',
});
function favorableQuestion(r:Rng,numeric:boolean,transfer=false):Draft{
  const tokens=marks(numeric?r.pick([
    ['1','2','2','3','5'],['1','3','3','4','4'],['1','1','2','3'],['3','3','4','5'],['0','1','1','2'],
  ]):transfer?['Sininen','Punainen','Punainen','Vihreä','Sininen']:r.pick([
    ['Sininen','Sininen','Punainen','Vihreä'],['Sininen','Punainen','Punainen','Vihreä'],
    ['Punainen','Punainen','Vihreä','Keltainen'],['Sininen','Sininen','Sininen'],['Sininen','Punainen','Sininen','Vihreä','Sininen'],
  ]));
  const condition=numeric?'vähintään 3':transfer?'punainen tai vihreä':'sininen';
  const success=idsWhere(tokens,numeric?s=>numberFrom(s)>=3:transfer?s=>red(s)||s.startsWith('Vihreä'):blue);
  return question(bags([{name:'Merkit',tokens}]),[
    set('all','Kaikki mahdolliset alkeistulokset',tokens,tokens.map(t=>t.id)),
    set('favorable','Ehdon täyttävät alkeistulokset',tokens,success),
    number('n','Kaikkien määrä',tokens.length),number('k','Suotuisten määrä',success.length),
  ],`Merkitse kaikki alkeistulokset ja erikseen ne, joissa toteutuu ehto: ${condition}. Kirjoita kummankin joukon määrä.`,
  'Pidä jokainen tunnus omana tuloksenaan. Poimi suotuisiin kaikki ja vain ehdon toteuttavat tunnukset.',
  `Ehdon täyttää ${success.length} tunnusta kaikista ${tokens.length} mahdollisesta. Sama väri tai luku voi kuulua usealle eri tunnukselle.`);
}
const favorable=define({
  id:'M-PROB-03',edition:2,stop:'Toivotut merkit kaikkien joukossa',icon:'◎',
  intro:'Aava merkitsee, mitkä liput sopivat toivottuun viestiin. Loikka tarkistaa myös koko joukon.',
  goal:'Muodostat suotuisan joukon ja kaikkien alkeistulosten joukon.',reward:'Viestilapussa näkyvät suotuisat ja kaikki vaihtoehdot.',
  produceWhat:'suotuisan ja koko alkeistulosjoukon merkitsemistä',
  families:{'favorable-lookalike-colours':r=>favorableQuestion(r,false),'favorable-number-threshold':r=>favorableQuestion(r,true)},
  transfer:r=>favorableQuestion(r,false,true),limit:'Eri tunnukset ovat eri tuloksia. Kummankin joukon sisältö ja koko tarkistetaan, järjestys voi vaihdella.',
});
const colored=(id:string,total:number,wanted:number):DataBag=>({name:`Pussi ${id}`,
  tokens:marks([...Array<string>(wanted).fill('Sininen'),...Array<string>(total-wanted).fill('Punainen')],id)});
function compareBags(r:Rng,tie:boolean,transfer=false):Draft{
  const given=transfer?[[4,2],[7,2]]:tie?[[4,2],[6,3]]:r.pick([[[4,2],[6,4]],[[5,2],[6,3]]]);
  const [a,b]=r.shuffle(given);
  const data=[colored('A',a![0]!,a![1]!),colored('B',b![0]!,b![1]!)];
  const result=compareChances(a![1]!,a![0]!,b![1]!,b![0]!)!;
  return question(bags(data,uniform),[
    number('aBlue','Pussi A: sinisiä',a![1]!),number('aTotal','Pussi A: kaikki',a![0]!),
    number('bBlue','Pussi B: sinisiä',b![1]!),number('bTotal','Pussi B: kaikki',b![0]!),
    pick('order','Kummasta sininen todennäköisemmin?',opts({a:'Pussi A',b:'Pussi B',equal:'Yhtä todennäköistä'}),result),
  ],'Vertaa sinisen merkin mahdollisuutta. Laske siniset ja kaikki merkit kummastakin pussista. Vertaa sitten sinisten osuuksia.',
  'Suotuisten määrä ei yksin ratkaise. Vertaa sitä jokaisen pussin omaan kokonaismäärään.',
  result==='equal'?'Pusseissa on sama osuus sinisiä. Sininen on yhtä todennäköinen kummassakin.':
    `Pussissa ${result.toUpperCase()} sinisten osuus on suurempi. Yhden noston tulos voi silti olla punainen.`);
}
const probabilityComparison=define({
  id:'M-PROB-04',stop:'Kummasta pussista toivottu merkki löytyy helpommin?',icon:'⚖',
  intro:'Kaksi pussia sisältää sinisiä merkkejä. Aava vertaa määriä suhteessa pussien kokoon.',
  goal:'Vertaat todennäköisyyksiä laadullisesti suotuisien osuuksien avulla.',reward:'Pussien nostomahdollisuudet voi vertailla samassa pöydässä.',
  families:{'compare-different-favorable-shares':r=>compareBags(r,false),'compare-equal-favorable-shares':r=>compareBags(r,true)},
  transfer:r=>compareBags(r,false,true),limit:'Tarkistus kattaa kummankin pussin määrät ja laadullisen vertailun. Yhtäsuuret osuudet hyväksytään, eikä murtolukumuotoa vaadita.',
});
function bestBag(r:Rng,tie:boolean,transfer=false):Draft{
  const raw=transfer?[[5,3],[6,3],[7,5]]:tie?[[4,2],[6,3],[5,2]]:[[4,1],[6,3],[5,4]];
  const givens=r.shuffle(raw);
  const data=givens.map(([n,k],i)=>colored(String.fromCharCode(65+i),n!,k!));
  const best=givens.flatMap(([n,k],i)=>givens.every(([m,b])=>k!*m!>=b!*n!)?[String(i)]:[]);
  return question(bags(data,uniform),[
    ...givens.map(([n,k],i)=>number(String(i),`Pussi ${String.fromCharCode(65+i)}: sinisiä kaikista`,`${k}/${n}`)),
    set('best','Kaikki yhtä todennäköisimmät pussit',data.map((bag,i)=>({id:String(i),label:bag.name})),best),
  ],'Kirjoita sinisten osuus jokaiselle pussille. Valitse kaikki pussit, joista sininen on todennäköisin.',
  'Vertaa osuuksia ennen valintaa. Yksittäinen satunnainen nosto ei osoita parasta vaihtoehtoa.',
  'Suurin suotuisten osuus ratkaisee valinnan tässä mallissa. Jos suurin osuus on sama kahdessa pussissa, kumpikin sopii.');
}
const best=define({
  id:'M-PROB-05',stop:'Luodon perusteltu valinta',icon:'★',
  intro:'Majakan luodolle halutaan sininen viestimerkki. Loikka tarkistaa kolme eri pussia.',
  goal:'Valitset todennäköisimmät vaihtoehdot vertaamalla jakaumia.',reward:'Luodon viestivalinnalla on aineistoon sidottu perustelu.',
  produceWhat:'osuuksien ja niihin perustuvan valinnan tuottamista',
  families:{'choose-single-best-share':r=>bestBag(r,false),'choose-tied-best-shares':r=>bestBag(r,true)},
  transfer:r=>bestBag(r,false,true),limit:'Oppijan tuottamat osuudet ja kaikki parhaat vaihtoehdot tarkistetaan. Valinta ei takaa seuraavan noston tulosta.',
});
function complementQuestion(r:Rng,multiple:boolean,transfer=false):Draft{
  const names=transfer?r.pick([['1','2','3','3','5'],['2','2','4','5','6']])
    :multiple?r.pick([
      ['Sininen','Punainen','Vihreä','Sininen','Punainen'],['Sininen','Vihreä','Keltainen','Punainen'],
      ['Sininen','Sininen','Punainen'],['Vihreä','Vihreä','Keltainen'],['Punainen','Vihreä','Vihreä','Keltainen','Punainen'],
    ]):r.pick([
      ['Sininen','Sininen','Punainen','Vihreä'],['Sininen','Punainen','Punainen','Vihreä'],['Sininen','Sininen','Vihreä'],
      ['Sininen','Punainen','Keltainen','Sininen','Vihreä'],['Sininen','Sininen','Sininen'],
    ]);
  const tokens=marks(names);
  const event=transfer?'Luku on yli 2':multiple?'Merkki on sininen tai punainen':'Merkki on sininen';
  const selected=idsWhere(tokens,transfer?s=>numberFrom(s)>2:multiple?s=>blue(s)||red(s):blue);
  const opposite=complementary(tokens,selected);
  return question(bags([{name:'Pussi',tokens}]),[
    set('event','Annetun tapahtuman tulokset',tokens,selected),
    set('other','Vastatapahtuman tulokset',tokens,opposite),
    number('combined','Tuloksia kahdessa joukossa yhteensä',tokens.length),
  ],`Tapahtuma: ${event}. Merkitse sen tulokset ja kaikki tulokset, joissa ehto ei toteudu.`,
  'Käy koko pussi läpi. Kukin tunnus kuuluu juuri toiseen joukkoon.',
  'Tapahtuma ja sen vastatapahtuma kattavat yhdessä koko tulosjoukon. Niillä ei ole yhteisiä tuloksia.');
}
const complement=define({
  id:'M-PROB-06',edition:2,stop:'Mitä tapahtuu jos ei tätä?',icon:'◐',
  intro:'Aava kysyy, mitä kaikkia nostoja jää jäljelle, jos toivottu merkki ei tule.',
  goal:'Muodostat tapahtuman vastatapahtuman samassa tulosjoukossa.',reward:'Kaksi viestikorttia kattaa kaikki nostot ilman päällekkäisyyttä.',
  produceWhat:'kahden toisiaan täydentävän tulosjoukon muodostamista',
  families:{'complement-single-colour':r=>complementQuestion(r,false),'complement-colour-union':r=>complementQuestion(r,true)},
  transfer:r=>complementQuestion(r,true,true),limit:'Tarkistus arvioi molemmat joukkojäsenyydet ja niiden kokonaismäärän. Joukkojen merkintäjärjestys on vapaa.',
});

type Extreme='min'|'max';
function extremeQuestion(r:Rng,direction:Extreme,graph:boolean,transfer=false):Draft{
  const minimum=direction==='min';
  const data=rows(shore,r.shuffle(graph
    ?(minimum?[2,2,6,8]:[2,4,8,8])
    :(minimum?[-4,-4,-1,3]:[-3,-1,2,2])));
  const {ids,value}=extremes(data,direction);
  const unit=graph?'senttimetriä':'celsiusastetta';
  const board:DataBoard=graph
    ?{kind:'chart',chart:bars(data,'Jälkien pituudet','Paikka','Pituus (cm)',2,10,transfer)}
    :table(data,'Paikka','Lämpötila (°C)','Mittaukset tehtiin samaan aikaan.');
  const word=minimum?'pienin':'suurin';
  return question(board,[
    number('extreme',`Aineiston ${word} arvo`,value),
    set('locations',`Paikat, joissa oli ${word} arvo`,groupChoices(data),ids),
    pick('unit','Yksikkö',opts({cm:'senttimetriä',deg:'celsiusastetta',count:'kappaletta'}),graph?'cm':'deg'),
  ],`Anna ${word} arvo ja yksikkö. Merkitse kaikki paikat, joissa se havaittiin.`,
  graph?'Lue pylvään pää asteikolta. Merkitse jokainen samalla ääriarvolla oleva havainto.':
    'Vertaa myös nollan alapuolella olevia lukuja. Sama ääriarvo voi esiintyä useassa paikassa.',
  `Tässä ${word} arvo on ${value} ${unit}. Se mitattiin kohdissa ${data.filter(row=>ids.includes(row.id)).map(row=>row.label).join(' ja ')}.`);
}
const minimum=define({
  id:'M-STAT-01',stop:'Kylmin lukema kartalla',icon:'↓',
  intro:'Loikka tutkii, missä yöpakkasen jälkeen on kylmintä. Pituushavainnoista etsitään puolestaan lyhyimmät jäljet.',
  goal:'Määrität aineiston pienimmän arvon ja löydät kaikki saman ääriarvon havainnot.',
  reward:'Pienimmät mittaukset merkitään retkipäiväkirjaan.',
  families:{'minimum-signed-table':r=>extremeQuestion(r,'min',false),'minimum-shortest-bars':r=>extremeQuestion(r,'min',true)},
  transfer:r=>extremeQuestion(r,'min',true,true),limit:words,
});
const maximum=define({
  id:'M-STAT-02',stop:'Suurin lukema kartalla',icon:'↑',
  intro:'Aava etsii päivän lämpimimmät paikat. Laiturin työtaulu näyttää myös pisimmät jäljet.',
  goal:'Määrität aineiston suurimman arvon ja löydät kaikki saman ääriarvon havainnot.',
  reward:'Suurimmat mittaukset saavat omat merkkinsä tauluun.',
  families:{'maximum-signed-table':r=>extremeQuestion(r,'max',false),'maximum-longest-bars':r=>extremeQuestion(r,'max',true)},
  transfer:r=>extremeQuestion(r,'max',true,true),limit:words,
});

const modeRule='Jos eri arvoja on useita ja kaikki ovat yhtä yleisiä, aineistolle ei tässä pajassa merkitä tyyppiarvoa. Jos muut arvot ovat harvinaisempia, merkitse kaikki yleisimmät.';
function modeQuestion(r:Rng,equal:boolean,transfer=false):Draft{
  const pool=transfer?[3,3,4,6,6,6]:equal?r.pick([[1,2,3,4],[2,2,3,3,5,5]]):
    r.pick([[2,2,3,3,5],[1,2,2,2,5]]);
  const sample=r.shuffle(pool),observations=rows(sample.map((_,i)=>`Rasia ${i+1}`),sample);
  const counts=frequencies(observations),answers=modes(observations);
  const data=counts.map(([value,count])=>({id:String(value),label:String(value),value:count}));
  const options=groupChoices(data);
  const board:DataBoard=transfer?{kind:'chart',chart:bars(data,'Helmimäärien yleisyys','Helmiä rasiassa (kpl)','Rasioita (kpl)',1,4),note:modeRule}:
    table(observations,'Rasia','Helmiä (kpl)',modeRule);
  return question(board,[
    pick('exists','Onko tyyppiarvoa?',opts({yes:'On, yksi tai useampi',no:'Ei merkitä tyyppiarvoa'}),answers.length?'yes':'no'),
    set('modes','Tyyppiarvot (jätä tyhjäksi, jos niitä ei ole)',options,answers.map(String)),
  ],'Selvitä, mitkä helmimäärät toistuvat useimmin. Merkitse työpajan määritelmän mukaiset tyyppiarvot.',
  'Laske esiintymiskerrat jokaiselle eri arvolle. Itse arvon suuruus ei kerro, kuinka usein se esiintyy.',
  answers.length?`Useimmin toistuvat arvot ovat ${answers.join(' ja ')}.`:
    'Kaikki eri arvot toistuvat yhtä usein. Tässä työpajassa ei silloin merkitä tyyppiarvoa.');
}
const mode=define({
  id:'M-STAT-03',stop:'Useimmin toistuva havainto',icon:'≋',
  intro:'Helmirasiat ovat erikokoisia. Loikka järjestää havainnot sen mukaan, miten usein kukin helmimäärä toistuu.',
  goal:'Määrität yleisimmät arvot ja tunnistat tilanteen, jossa paja jättää tyyppiarvon merkitsemättä.',
  reward:'Helmitaulu saa yleisyysmerkinnät.',
  families:{'mode-tied-or-unique-peak':r=>modeQuestion(r,false),'mode-all-frequencies-equal':r=>modeQuestion(r,true)},
  transfer:r=>modeQuestion(r,false,true),limit:'Tarkistus kattaa kaikki yleisimmät arvot ja ilmoitetun määritelmän, kun useampi eri arvo on yhtä yleinen.',
});

function meanQuestion(r:Rng,fractional:boolean,transfer=false):Draft{
  const sample=r.shuffle(transfer?[2,2,5,8]:fractional?r.pick([[2,2,4,7],[1,1,4,5]]):
    r.pick([[2,4,6,8],[2,2,6,6]]));
  const sum=sample.reduce((total,value)=>total+value,0),count=sample.length;
  const data=rows(shore,sample);
  const board:DataBoard=transfer?{kind:'chart',chart:bars(data,'Vettä mitta-astioissa','Paikka','Tilavuus (l)',1,9,true)}:
    table(data,'Paikka','Vettä (l)','Litra voidaan jakaa pienempiin osiin.');
  return question(board,[
    number('sum','Yhteensä (l)',sum),number('count','Havaintojen lukumäärä',count),
    number('mean','Keskiarvo (l)',`${sum}/${count}`),
    pick('meaning','Mitä keskiarvo kuvaa tässä?',opts({equal:'Yhtä suurta vesimäärää astiaa kohti, kun kokonaismäärä säilyy',
      same:'Jokaisessa astiassa oli aluksi sama määrä',largest:'Suurimman astian vesimäärää'}),'equal'),
  ],'Laske yhteismäärä, havaintojen lukumäärä ja keskiarvo. Voit antaa keskiarvon murtolukuna tai desimaalina. Valitse sen merkitys.',
  'Ota mukaan jokainen astia, myös ne, joissa on yhtä paljon vettä. Jaa yhteismäärä astioiden lukumäärällä.',
  `Yhteensä on ${sum} litraa ja astioita on ${count}. Tasajaossa jokainen saa ${sum}/${count} litraa.`);
}
const mean=define({
  id:'M-STAT-05',stop:'Keskiarvo retkiastiassa',icon:'÷',
  intro:'Mitta-astioissa on eri määrä vettä. Aava käyttää niiden yhteismäärää ja lukumäärää kuvaamaan yhtä suurta osuutta.',
  goal:'Lasket ja tulkitset keskiarvon, myös kun se on murtoluku.',
  reward:'Retkiastioiden tauluun saadaan täsmällinen keskiarvo.',
  produceWhat:'havaintojen yhteismäärän, lukumäärän ja keskiarvon laskemista',
  families:{'mean-exact-whole-share':r=>meanQuestion(r,false),'mean-fraction-with-repeated-observations':r=>meanQuestion(r,true)},
  transfer:r=>meanQuestion(r,true,true),
  limit:'Tarkistus kattaa kaikki annetut havainnot, tarkan tuloksen ja tasajaon merkityksen valinnan. Vapaa perustelu arvioidaan erikseen.',
});

const entries=[read,build,interpretation,representation,multiRead,classify,outcomes,favorable,probabilityComparison,best,complement,minimum,maximum,mode,mean];
export const dataProbabilitySpecs:NodeSpec[]=entries.map(entry=>entry.spec);
export const dataProbabilityEvidence:Readonly<Record<string,{families:readonly string[];limit:string}>>=
  Object.fromEntries(entries.map(entry=>[entry.spec.id,entry.evidence]));
