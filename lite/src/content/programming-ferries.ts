import type { Item, NodeSpec } from '../engine/types';
import type { Rng } from '../engine/rng';
import { cases } from './kit';
import type { FerryCell,FerryCommand,FerryGoal,FerryHeading,FerryPose } from './models/ferry-program';
import { ferryHeadings,programmingFerryScene,
  type FerryInstruction,type FerryScenario,type ProgrammingFerryTask,type ProgrammingFerryScene,
} from './models/programming-ferries';
import { programmingFerryExample } from './scenes/programming-ferries';

type Draft=Omit<Item,'task'|'tag'>&{task:ProgrammingFerryTask;sceneModel:ProgrammingFerryScene};
type Author=(r:Rng)=>Draft;
interface Definition extends Omit<NodeSpec,'item'|'demo'|'rev'|'validRevs'|'produce'> {
  families:Record<string,Author>; transfer:Author; limit:string;
}
type Context=Pick<ProgrammingFerryTask,'activity'|'script'|'reference'|'instruction'|'planStops'>;
const point=(x:number,y:number):FerryCell=>({x,y});
const bow=(x:number,y:number,heading:FerryHeading):FerryPose=>({x,y,heading});
const F='forward',L='left',R='right',W='wait';
const stop=(label:string,start:FerryPose,goal:FerryGoal,rocks:readonly FerryCell[]=[]):FerryScenario=>
  ({label,board:{width:5,height:5,start,rocks},goal});
function rotated(c:FerryScenario,turns:number):FerryScenario {
  const move=(cell:FerryCell):FerryCell=>{
    const {x,y}=cell;
    return [point(x,y),point(4-y,x),point(4-x,4-y),point(y,4-x)][turns]!;
  };
  const turn=(heading:FerryHeading)=>ferryHeadings[(ferryHeadings.indexOf(heading)+turns)%4]!;
  return {label:c.label,board:{...c.board,start:{...move(c.board.start),heading:turn(c.board.start.heading)},rocks:c.board.rocks.map(move)},
    goal:{destination:move(c.goal.destination),heading:c.goal.heading?turn(c.goal.heading):undefined,via:c.goal.via?.map(move)}};
}
function article(r:Rng,scenarios:readonly FerryScenario[],details:Context,say:string,hint:string,explain:string):Draft{
  const turns=r.int(0,3);
  const rotatePoint=(p:FerryCell)=>rotated(stop('',bow(p.x,p.y,'north'),{destination:p}),turns).board.start;
  const task:ProgrammingFerryTask={kind:'programming-ferries',...details,cases:scenarios.map(c=>rotated(c,turns)),
    ...(details.planStops?{planStops:details.planStops.map(rotatePoint).map(({x,y})=>point(x,y))}:{})};
  return {task,sceneModel:programmingFerryScene(task),say,hint,explain};
}
function define({families,transfer,limit,...meta}:Definition){
  const tags=Object.keys(families),rev=`exp690-ferry-${meta.id.toLowerCase()}-v1`;
  return {spec:{...meta,rev,validRevs:[rev],item:cases(families,transfer),
    ...(meta.produceWhat?{produce:[...tags,'transfer']}:{}),
    demo:r=>tags.map(tag=>{const example=families[tag]!(r);return {say:example.explain!,scene:programmingFerryExample(example.task)};}),
  } satisfies NodeSpec,evidence:{families:tags,limit}};
}
const harbour=()=>stop('Kahden laiturin reitti',bow(1,3,'east'),
  {destination:point(3,1),heading:'north',via:[point(3,3)]},[point(2,2),point(1,2)]);
const crossing=()=>stop('Salmireitti',bow(0,4,'north'),
  {destination:point(4,2),heading:'east',via:[point(0,2),point(3,2)]},[point(1,4),point(2,3),point(2,1)]);
const shortDock=()=>stop('Läheinen laituri',bow(1,3,'east'),
  {destination:point(2,2),heading:'north',via:[point(2,3)]},[point(1,2),point(3,2)]);
const harbourPath=[point(3,3),point(3,1)],crossingPath=[point(0,2),point(4,2)],shortPath=[point(2,3),point(2,2)];

function followQuestion(r:Rng,waiting:boolean,transfer=false):Draft{
  const scenario=transfer?stop('Vastakkaisen rannan laituri',bow(3,1,'west'),{destination:point(2,2),heading:'south'}):
    waiting?stop('Lähtölupa ensin',bow(1,3,'north'),{destination:point(2,3),heading:'north'}):shortDock();
  const script:readonly FerryCommand[]|undefined=transfer?[F,L,F]:waiting?[W,R,F,L]:[F,L,F];
  return article(r,[scenario],{activity:'follow',script},
    'Tee ohjeen käskyt yksi kerrallaan. Kirjaa kunkin käskyn jälkeen lautan ruutu ja keulasuunta.',
    'Käänny lautan vasemmalle tai oikealle. Käännös ja odotus jättävät lautan samaan ruutuun.',
    'Aktiivinen askel määrää seuraavan teon. Kirjaa sijainti ja keula jokaisen käskyn jälkeen, myös kun sijainti pysyy.');
}
const follow=define({
  id:'M-PROG-01',stop:'Lautan ensimmäinen ohje',icon:'⇥',
  intro:'Loikka tuo lauttalaiturille valmiin ohjekortin. Aava seuraa, mitä kukin käsky muuttaa.',
  goal:'Noudatat annettua käskyjonoa ja tunnistat jokaisen käskyn jälkeisen lautan tilan.',
  reward:'Ensimmäisen lautan työvuoron ohjekortti on käyty läpi.',
  produceWhat:'annettujen askelten suorittamista ja niiden vaikutusten kirjaamista',
  families:{'follow-forward-and-turn':r=>followQuestion(r,false),'follow-wait-and-heading':r=>followQuestion(r,true)},
  transfer:r=>followQuestion(r,false,true),limit:'Tarkistus koskee annettua järjestystä ja jokaisen askeleen ruutua sekä keulaa. Virtuaalilautta ei mittaa fyysistä ohjaamista.',
});
function authorQuestion(r:Rng,via:boolean,transfer=false):Draft{
  const scenario=transfer?crossing():via?harbour():shortDock();
  return article(r,[scenario],{activity:'author',planStops:transfer?crossingPath:via?harbourPath:shortPath},
    'Rakenna lautan ohje käskyistä. Kokeile sitä lähtöruudusta ja saavuta kaikki kartan tavoite-ehdot.',
    'Eteen vie yhden ruudun keulan suuntaan. Käytä käännöstä ennen etenemistä uuteen suuntaan.',
    'Lautta tekee vain jonossa olevat käskyt. Toimivia reittejä voi olla useita, ja jokainen tavoite-ehdot täyttävä ohjelma käy.');
}
const author=define({
  id:'M-PROG-02',stop:'Loikan kirjoittama reitti',icon:'⇢',
  intro:'Kyyti on tilattu toiselle rannalle. Loikka tarvitsee tarkan ohjeen uudelle lauttavuorolle.',
  goal:'Tuotat yksiselitteisen vaiheohjeen ja varmistat, että se vie lautan tavoitteeseen.',
  reward:'Lautturi saa toteuttamiskelpoisen ohjeen.',
  produceWhat:'oman toimivan käskyjonon rakentamista',
  families:{'write-direct-instructions':r=>authorQuestion(r,false),'write-via-and-heading':r=>authorQuestion(r,true)},
  transfer:r=>authorQuestion(r,true,true),limit:'Kaikki enintään 64 käskyn ohjelmat hyväksytään, jos ajo päättyy ja kaikki annetut tavoite-ehdot toteutuvat.',
});
function predictQuestion(r:Rng,blocked:boolean,transfer=false):Draft{
  const scenario=transfer?stop('Uusi lähtöasento',bow(2,3,'west'),{destination:point(1,3)}):
    blocked?stop('Kahden käskyn koe',bow(2,3,'north'),{destination:point(2,2)},[point(1,3)]):
      stop('Yhden etenemisen lähtö',bow(2,3,'east'),{destination:point(3,3)});
  return article(r,[scenario],{activity:'predict',script:blocked?[L,F]:[F]},
    'Ennusta lautan ruutu, keula ja ajon päättyminen. Lukitse ennuste, aja ohjelma ja kirjaa havainto.',
    'Katso kartalla lautan lähtösuuntaa. Jos seuraava ruutu on kari, lautta pysähtyy nykyiseen ruutuun.',
    'Sama etenemiskäsky seuraa aina nykyistä keulaa. Ennuste kirjataan ennen ajoa ja havainto vasta sen jälkeen.');
}
const predict=define({
  id:'M-PROG-04',stop:'Mitä valmis käsky tekee?',icon:'⌖',
  intro:'Aava peittää ajopainikkeet hetkeksi. Loikka yrittää päätellä, mihin annettu käsky vie.',
  goal:'Ennustat valmiin ohjelman vaikutuksen lähtötilasta ja vertaat havaintoon.',
  reward:'Laiturin lokikirjassa on erilliset ennuste ja ajohavainto.',
  produceWhat:'lukittua ennustetta ja erikseen kirjattua ajohavaintoa',
  families:{'predict-relative-forward':r=>predictQuestion(r,false),'predict-turn-then-block':r=>predictQuestion(r,true)},
  transfer:r=>predictQuestion(r,false,true),limit:'Ennuste ja havainto tarkistetaan erikseen. Ajot eivät muuta lukittua ennustetta.',
});
function planQuestion(r:Rng,via:boolean,transfer=false):Draft{
  const scenario=transfer?crossing():via?harbour():
    stop('Reitti kahden karin sivuitse',bow(0,3,'east'),{destination:point(4,1)},[point(2,3),point(3,2)]);
  return article(r,[{...scenario,goal:{...scenario.goal,heading:undefined}}],
    {activity:'plan',planStops:transfer?crossingPath:via?harbourPath:[point(0,1),point(4,1)]},
    'Suunnittele vähintään kaksi matkan osaa. Lisää suorien osuuksien pääteruudut järjestyksessä. Rakenna ensin reittisuunnitelma.',
    'Seuraavan osatavoitteen on oltava samalla rivillä tai sarakkeessa. Valitse itse väli- ja käännöspisteet.',
    'Osatavoitteet jäsentävät reitin ennen käskyjä. Jokainen osuus kulkee suoraan ja ohittaa karit, ja suunnitelma käy sovituissa laitureissa.');
}
const plan=define({
  id:'M-PROG-05',stop:'Toimitus jaetaan vaiheisiin',icon:'⋯',
  intro:'Loikan kartalla näkyy päämäärä. Aava etsii paikat, joissa matkan osuus päättyy tai suunta vaihtuu.',
  goal:'Muodostat toteuttamiskelpoisen, järjestetyn osatavoitesuunnitelman ennen koodaamista.',
  reward:'Lautturilla on osiin jaettu reittisuunnitelma.',
  produceWhat:'omien osatavoitteiden ja suoraan kuljettavien osuuksien suunnittelemista',
  families:{'plan-own-detour-turns':r=>planQuestion(r,false),'plan-ordered-via':r=>planQuestion(r,true)},
  transfer:r=>planQuestion(r,true,true),limit:'Vastaus on oma järjestetty karttasuunnitelma suorine osuuksineen. Vapaa suunnitteluselostus arvioidaan erikseen.',
});
const instruction=(text:string,...commands:FerryCommand[]):FerryInstruction=>({text,commands});
function encodeQuestion(r:Rng,turnFirst:boolean,transfer=false):Draft{
  const scenario=transfer?stop('Vastaanoton suunta',bow(2,3,'west'),{destination:point(2,2),heading:'east'}):
    turnFirst?stop('Pysähdys ennen siirtoa',bow(1,3,'north'),{destination:point(2,3),heading:'east'}):harbour();
  const given=transfer?[instruction('Suuntaa oikealle ja kulje yksi ruutu.',R,F),instruction('Käännä keula vielä oikealle vastaanottoa varten.',R)]:
    turnFirst?[instruction('Odota lähtölupaa paikallasi.',W),instruction('Käännä keula oikealle ja kulje yksi ruutu.',R,F)]:
      [instruction('Kulje kaksi ruutua välilaiturille.',F,F),instruction('Käännä keula vasemmalle ja kulje kaksi ruutua.',L,F,F)];
  return article(r,[scenario],{activity:'encode',instruction:given},
    'Rakenna graafinen ohjelma suunnitelman vaiheista samassa järjestyksessä. Tarkista ohjelmasi ajamalla se.',
    'Pura jokainen vaihe pieniksi käskyiksi. Esimerkiksi kahden ruudun matkaan tarvitaan kaksi Eteen-käskyä.',
    'Graafiset lohkot toteuttavat suunnitelman tapahtumat järjestyksessä. Odota, käänny ja etene muuttavat tilaa eri tavoin.');
}
const encode=define({
  id:'M-PROG-06',stop:'Suunnitelma muuttuu lohkoiksi',icon:'▦',
  intro:'Lautturilla on sanallinen suunnitelma. Loikka tekee siitä lohkojonon.',
  goal:'Toteutat annetun suunnitelman graafisina komentoina.',
  reward:'Toimitussuunnitelma näkyy lautan toimivina lohkoina.',
  produceWhat:'graafisen ohjelman rakentamista vaiheittaisesta suunnitelmasta',
  families:{'encode-multiple-steps-per-phase':r=>encodeQuestion(r,false),'encode-wait-before-movement':r=>encodeQuestion(r,true)},
  transfer:r=>encodeQuestion(r,false,true),limit:'Tässä tarkistetaan annettujen vaiheiden uskollinen toteutus. Sama pääteruutu yksin ei osoita, että ohjelma vastaa suunnitelmaa.',
});

function evaluateQuestion(r:Rng,missingDock:boolean,transfer=false):Draft{
  const c=shortDock();
  const scenario=transfer?stop('Vastaanottaja odottaa eri suunnassa',bow(1,3,'east'),
    {destination:point(3,2),heading:'north',via:[point(2,3)]}):
    missingDock?stop('Laituri jäi käymättä',bow(1,3,'east'),
      {destination:point(3,1),heading:'north',via:[point(2,2)]},[point(1,2)]):c;
  const script:readonly FerryCommand[]|undefined=transfer?[F,L,F,R]:missingDock?[F,F,L,F,F]:[F,L,F,R];
  return article(r,[scenario],{activity:'evaluate',script},
    'Katso annettu suoritus. Kirjaa lopputila ja vertaa sitä erikseen jokaiseen tavoite-ehtoon.',
    'Katso pääteruutu, keulasuunta ja kartalle jäävä jälki. Oikea pääteruutu voi silti jättää muun ehdon täyttymättä.',
    'Toimivuus edellyttää, että ohjelma päättyy ja kaikki ilmoitetut ehdot toteutuvat samassa ajossa.');
}
const evaluate=define({
  id:'M-PROG-EVALUATE',stop:'Saapuiko paketti oikeaan paikkaan?',icon:'≟',
  intro:'Lautta on ajanut reitin. Aava vertaa ajon jälkeä ja keulaa vastaanottajan ehtoihin.',
  goal:'Arvioit toteutunutta suoritusta ruudun, keulan ja laiturijärjestyksen perusteella.',
  reward:'Vastaanottaja näkee, mikä toimituksen ehto täyttyi tai jäi auki.',
  families:{'evaluate-correct-position-wrong-heading':r=>evaluateQuestion(r,false),'evaluate-missed-dock':r=>evaluateQuestion(r,true)},
  transfer:r=>evaluateQuestion(r,false,true),
  limit:'Tarkistus kattaa ilmoitetun lopputilan ja kuhunkin näkyvään ehtoon sidotun valinnan. Vapaa perustelu arvioidaan erikseen.',
});
function testQuestion(r:Rng,blocked:boolean,transfer=false):Draft{
  const c=shortDock();
  const scenario=transfer?stop('Sama ohje uudessa lähtöruudussa',bow(2,1,'west'),
    {destination:point(1,2),heading:'south',via:[point(1,1)]},[point(1,0)]):
    blocked?{...c,label:'Kari reitin toisella askeleella',board:{...c.board,rocks:[...c.board.rocks,point(3,3)]}}:c;
  const script:readonly FerryCommand[]|undefined=blocked?[F,F,L,F]:[F,R,F];
  return article(r,[scenario],{activity:'test',script,reference:[F,L,F]},
    'Testaa ohje askeltamalla tai ajamalla. Kirjaa lopputila ja ensimmäinen ero odotettuun reittiin.',
    'Katso toteutuneita askelia samassa järjestyksessä kuin odotettuja. Pysähdys näkyy siinä askeleessa, jossa lautta kohtasi esteen.',
    'Testi kertoo, mitä tästä lähtötilasta tapahtui. Ensimmäinen poikkeama on varhaisin askel, joka eroaa, vaikka myöhempiä eroja olisi enemmän.');
}
const test=define({
  id:'M-PROG-TEST',stop:'Kokeillaan askel kerrallaan',icon:'▷',
  intro:'Loikka tuo kokeiltavan ohjeen. Aavalla on karttakortti odotetuista askelista.',
  goal:'Testaat annetun ohjeen ja paikannat ensimmäisen poikkeaman.',
  reward:'Testikorttiin jää toteutunut lopputila ja poikkeaman kohta.',
  produceWhat:'ajohavainnon ja ensimmäisen poikkeaman kirjaamista',
  families:{'test-first-wrong-turn':r=>testQuestion(r,false),'test-first-collision':r=>testQuestion(r,true)},
  transfer:r=>testQuestion(r,false,true),limit:'Arviointi koskee testin lähtötilaa, havaittua lopputilaa ja ensimmäistä eroa näkyvään odotukseen.',
});
function repairQuestion(r:Rng,own:boolean,transfer=false):Draft{
  const c=transfer?crossing():harbour();
  const second={...c,label:'Toinen lähtötilanne',board:{...c.board,
    start:{...c.board.start,heading:transfer?'east' as const:'north' as const}}};
  const scenario={...c,label:'Ensimmäinen lähtötilanne'};
  const script:readonly FerryCommand[]|undefined=own?undefined:transfer?[F,F,R,F,F,F,F]:[F,F,L,F,F];
  return article(r,[scenario,second],{activity:'repair',script,planStops:transfer?crossingPath:harbourPath},
    own?'Rakenna ohjelma. Testaa sama jono molemmista lähdöistä, kirjaa jokainen ehto ja korjaa toisen lähdön ohjelma.':
      'Testaa annettu ohjelma molemmista lähdöistä, kirjaa jokainen ehto ja korjaa toisen lähdön ohjelma.',
    'Sama Eteen-käsky kulkee eri suuntiin eri lähtökeuloilla. Muuta toisen lähdön ohjelmaa ja testaa se uudelleen.',
    'Kirjaa kummankin lähtötilanteen havainnot erikseen. Korjattu käskyjono tarkistetaan toisen lähtötilanteen kaikista ehdoista.');
}
const repair=define({
  id:'M-PROG-07',stop:'Poukaman luotettava kuljetus',icon:'⚑',
  intro:'Poukaman lautta lähtee kahdessa työvuorossa eri suuntaan. Aava testaa, mitä sama ohje tekee kummassakin.',
  goal:'Testaat ohjelmaa kaikissa annetuissa lähtötilanteissa ja varmistat korjatun toiminnan.',
  reward:'Lautturin työvuoroille on testattu omat käskyjonot.',
  produceWhat:'ajojen ehtokohtaista arviointia sekä oman korjauksen rakentamista ja testaamista',
  families:{'verify-and-repair-given-program':r=>repairQuestion(r,false),'verify-and-repair-self-authored-program':r=>repairQuestion(r,true)},
  transfer:r=>repairQuestion(r,false,true),limit:'Annettu tai itse rakennettu jono käy lähtökohdaksi. Tarkistus kattaa annetut testit ja korjauksen, eikä päättele toimivuutta kaikissa tilanteissa.',
});
function integrationQuestion(r:Rng,wrongHeading:boolean,transfer=false):Draft{
  const scenario=transfer?stop('Pohjoisreunan rajatapaus',bow(1,1,'north'),
    {destination:point(2,0),heading:'east',via:[point(1,0)]}):shortDock();
  const reference:readonly FerryCommand[]=transfer?[F,R,F]:[F,L,F];
  const script:readonly FerryCommand[]|undefined=transfer?[...reference,L,F]:wrongHeading?[...reference,R]:reference;
  return article(r,[scenario],{activity:'integrate',script,reference},
    'Testaa ohje. Kirjaa havaittu lopputila ja ensimmäinen ero odotettuun. Tarkista myös jokainen tavoite-ehto.',
    'Testiajon päättyminen ja tavoitteen täyttyminen ovat eri havaintoja. Käy läpi sekä askeljälki että ehdot.',
    'Testi kertoo toteutuneen kulun. Toimivuusarvio vertaa sen lisäksi jokaista tavoite-ehtoa toteutuneeseen ajoon.');
}
const integrate=define({
  id:'M-PROG-03',stop:'Testistä perusteltuun päätökseen',icon:'✓',
  intro:'Viimeinen lauttavuoro tarvitsee testikortin ja perustellun toimituspäätöksen samasta ajosta.',
  goal:'Testaat ohjeen järjestelmällisesti ja arvioit sen toimivuuden tavoitteeseen nähden.',
  reward:'Laiturin työvuoro saa sekä testimerkinnän että ehtokohtaisen toimituspäätöksen.',
  produceWhat:'yhdistettyä ajohavaintoa, ensimmäisen eron paikantamista ja tavoiteehtojen arviointia',
  families:{'integrate-successful-test-and-goals':r=>integrationQuestion(r,false),'integrate-completed-test-wrong-heading':r=>integrationQuestion(r,true)},
  transfer:r=>integrationQuestion(r,false,true),limit:'Sama vastaus sisältää ajon havainnon, poikkeamakohdan ja kaikki tavoite-ehdot. Vapaata perustelua tai muiden tehtävien hallintaa ei johdeta tästä.',
});

const entries=[follow,author,predict,plan,encode,repair,evaluate,test,integrate];
export const programmingFerrySpecs:NodeSpec[]=entries.map(entry=>entry.spec);
export const programmingFerryEvidence:Readonly<Record<string,{families:readonly string[];limit:string}>>=
  Object.fromEntries(entries.map(entry=>[entry.spec.id,entry.evidence]));
