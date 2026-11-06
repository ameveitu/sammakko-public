import type { Item,NodeSpec } from '../engine/types';
import type { Rng } from '../engine/rng';
import { cases } from './kit';
import {
  geometryCriterion,lineRelation,pathClass,polygonAngleSum,
  type Criterion,type GeoFact,type GeoMark,type GeoPath,type GeoPoint,type GeoSector,type GeoShape,type GeometryRelationAction,
  type GeometryRelationField,type GeometryRelationsBoard,type GeometryRelationsTask,
} from './models/geometry-relations';
import { geometryRelationsExample } from './scenes/geometry-relations';

type Draft=Omit<Item,'tag'|'task'>&{task:GeometryRelationsTask};
type Author=(r:Rng)=>Draft;
interface Definition extends Omit<NodeSpec,'item'|'demo'|'rev'|'validRevs'|'produce'> {
  families:Record<string,Author>;transfer:Author;limit:string;
}
function define({families,transfer,limit,...meta}:Definition){
  const tags=Object.keys(families),rev=`exp690-geometry-${meta.id.toLowerCase()}-v1`;
  return {spec:{...meta,rev,validRevs:[rev],item:cases(families,transfer),
    ...(meta.produceWhat?{produce:[...tags,'transfer']}:{}),
    demo:r=>tags.map(tag=>{const demo=families[tag]!(r);return {say:demo.explain!,scene:geometryRelationsExample(demo.task)};}),
  } satisfies NodeSpec,evidence:{families:tags,limit}};
}
const p=(x:number,y:number):GeoPoint=>({x,y});
const mark=(id:string,x:number,y:number):GeoMark=>({id,x,y});
const opts=(record:Record<string,string>)=>Object.entries(record).map(([id,label])=>({id,label}));
const num=(id:string,label:string,answer:number|string):GeometryRelationField=>({kind:'number',id,label,answer:String(answer)});
const choice=(id:string,label:string,options:ReturnType<typeof opts>,answer:string):GeometryRelationField=>({kind:'choice',id,label,options,answer});
function article(board:GeometryRelationsBoard,fields:GeometryRelationField[],say:string,hint:string,explain:string,
  action?:GeometryRelationAction,why=hint):Draft{
  return {task:{kind:'geometry-relations',board,fields,action,why},say,hint,explain};
}
const yesNo=opts({yes:'Kyllä',no:'Ei'});
const shape=(id:string,label:string,points:readonly GeoPoint[],offset=0):GeoShape=>({
  id,label,vertices:points.map((v,i)=>({...v,id:String.fromCharCode(65+offset+i)})),
});
function shuffledLabels(figure:GeoShape,r:Rng):GeoShape {
  const labels=r.shuffle(figure.vertices.map(v=>v.id));
  return {...figure,vertices:figure.vertices.map((v,i)=>({...v,id:labels[i]!}))};
}
function turnPoint(point:GeoPoint,turn:number):GeoPoint{
  const {x,y}=point;
  return [p(x,y),p(-y,x),p(-x,-y),p(y,-x)][turn]!;
}
function transform(points:readonly GeoPoint[],turn:number,reflection=false,sx=1,sy=sx):GeoPoint[]{
  return points.map(({x,y})=>turnPoint(p((reflection?-x:x)*sx,y*sy),turn));
}
const asymmetric=[p(0,0),p(5,0),p(4,3),p(0,2)];
const asymTriangle=[p(0,0),p(5,0),p(1,3)];
const zigWindow=[p(0,0),p(5,1),p(4,3),p(2,4),p(0,2)];
function matchQuestion(r:Rng,invariant:'congruent'|'similar',reflection:boolean,transfer=false):Draft{
  const transferShape=invariant==='similar'?[p(0,0),p(6,1),p(4,4),p(-1,2)]:zigWindow;
  const points=transfer?transferShape:reflection?r.pick([asymTriangle,[p(0,0),p(6,0),p(2,3)]]):
    r.pick([asymmetric,[p(0,1),p(4,0),p(6,3),p(1,4)]]);
  const k=invariant==='similar'?(transfer?3:r.pick([2,3])):1;
  const turn=r.int(1,3);
  const good=transform(points,turn,reflection||transfer,k);
  const bad1=transform(points,(turn+1)%4,false,invariant==='similar'?k:2,invariant==='similar'?k+1:2);
  const bad2=transform(points,(turn+2)%4,true,k+1,k);
  const variants=r.shuffle([good,bad1,bad2]);
  const shapes=[shape('source','Alkuperäinen',points),...variants.map((points,i)=>shuffledLabels(shape(String(i+1),`Malli ${i+1}`,points,points.length*(i+1)),r))];
  const same=invariant==='congruent';
  return article({kind:'shapes',shapes,note:'Kaikissa kuvissa on sama piirrosmittakaava.'},[],
    same?'Valitse alkuperäisen kanssa yhtenevä malli. Yhdistä kaikki vastaavat kärjet ja sovita ääriviivoja.':
      'Valitse yhdenmuotoinen malli. Yhdistä kaikki vastaavat kärjet ja anna yhteinen pituuskerroin.',
    same?'Kierto, siirto ja peilaus säilyttävät pituudet. Sovita kärjet ilman venytystä.':
      'Vertaa vastaavia kulmia ja kaikkia sivuja. Suurennus käyttää samaa kerrointa jokaisessa suunnassa.',
    same?'Kun kaikki vastaavat etäisyydet säilyvät, peilikuvakin voidaan sovittaa alkuperäiseen.':
      'Yhdenmuotoisen mallin jokainen pituus kasvaa tai pienenee samalla kertoimella. Peilaus ei muuta suhteita.',
    {kind:'match',invariant});
}
const congruence=define({
  id:'M79-CONGRUENCE',stop:'Sama ikkuna eri asennossa',icon:'◇',
  intro:'Loikka etsii ikkunaan varaosaa. Aava kokeilee sopivuutta kääntämällä ja peilaamalla malleja.',
  goal:'Tunnistat yhtenevät kuviot myös siirrettyinä, kierrettyinä ja peilattuina.',
  reward:'Majan ikkuna saa kooltaan ja muodoltaan sopivan osan.',
  produceWhat:'vastaavien kärkien sovittamista ilman venytystä',
  families:{'congruence-rotated-window':r=>matchQuestion(r,'congruent',false),'congruence-reflected-triangle':r=>matchQuestion(r,'congruent',true)},
  transfer:r=>matchQuestion(r,'congruent',true,true),
  limit:'Vastaavuus tarkistetaan kaikista pisteiden välisistä etäisyyksistä. Tarkistus hyväksyy myös peilauksen ja kaikki aidot vastaavuudet.',
});
const similarity=define({
  id:'M79-SIMILARITY',stop:'Pieni kartta, suuri maja',icon:'◈',
  intro:'Pienen kartan ja majan ikkunoissa pitäisi olla sama muoto. Loikka vertaa kaikkia sivuja.',
  goal:'Tunnistat yhdenmuotoisen kuvion ja yhteisen pituuskertoimen.',
  reward:'Kartassa ja majassa on toisiinsa sopiva muoto.',
  produceWhat:'vastaavien kärkien ja yhteisen sivusuhteen tuottamista',
  families:{'similarity-scale-versus-stretch':r=>matchQuestion(r,'similar',false),'similarity-reflect-and-rescale-triangle':r=>matchQuestion(r,'similar',true)},
  transfer:r=>matchQuestion(r,'similar',true,true),
  limit:'Tarkistetaan yhteinen positiivinen kerroin ja kaikkien vastaavien etäisyyksien suhde. Peilaus kelpaa.',
});

const side=(a:number,b:number):GeoFact=>({kind:'side',a,b});
const angle=(at:number):GeoFact=>({kind:'angle',at});
const S=[side(0,1),side(1,2),side(0,2)];
const A=[angle(0),angle(1),angle(2)];
const enough:Record<Criterion,readonly GeoFact[]>={
  SSS:S,SAS:[S[0]!,S[2]!,A[0]!],ASA:[A[0]!,S[0]!,A[1]!],AAS:[A[0]!,A[1]!,S[2]!],
  AA:[A[0]!,A[1]!],ratioSSS:S,ratioSAS:[S[0]!,S[2]!,A[0]!],
};
const ambiguous=[p(0,0),p(25,0),p(8,6)],ambiguousSecond=[p(0,0),p(25,0),p(24,18)],almost=[p(0,0),p(25,0),p(12,9)];
function criterionQuestion(r:Rng,invariant:'congruent'|'similar',criterion:Criterion,weak:'AAA'|'SSA',transfer=false){
  const anglesOnly=weak==='AAA';
  const original=transfer&&invariant==='similar'?[p(0,0),p(6,1),p(2,4)]:asymTriangle;
  const target=transform(original,r.int(1,3),true,invariant==='similar'?(transfer?3:2):1);
  const scaled=transform(original,0,false,2);
  const others=r.shuffle(anglesOnly?[original,scaled,transform(original,0,false,2,3)]:[ambiguous,ambiguousSecond,almost]);
  const facts=enough[criterion],weakFacts=anglesOnly?A:[S[0]!,S[1]!,A[0]!];
  const shapes=[shape('source','Varaosa',original),shuffledLabels(shape('target','Uusi malli',target,3),r),
    ...others.map((vertices,i)=>shape(String(i+1),`Koe ${i+1}`,transform(vertices,r.int(0,3)),9+i*3))];
  const congruent=invariant==='congruent';
  return article({kind:'criterion',shapes,facts,weakFacts,
    note:congruent?'Varaosan ja uuden mallin merkityt sivut ja kulmat ovat pareittain yhtä suuria.':'Varaosan ja uuden mallin sivuparit ovat samassa suhteessa ja merkityt kulmat yhtä suuria.'},[],
    'Parita merkittyjen tietojen kärjet. Valitse riittävä kriteeri ja osoita heikomman tiedon vastaesimerkkipari.',
    anglesOnly?'Yhtä suuret kulmat voivat säilyä, vaikka kaikki sivut kasvavat. Etsi kaksi samaan kulmatietoon sopivaa eri kokoa.':
      'Kahden sivun ja kulman tiedossa kulman paikka ratkaisee. Vertaa merkittyä kulmaa juuri merkittyihin sivuihin.',
    congruent?'Riittävä kriteeri määrää koon ja muodon. Vastaesimerkissä samat heikot tiedot sallivat kaksi erilaista kolmiota.':
      'Riittävä yhdenmuotoisuustieto määrää muodon. Kulman pitää olla kahden suhteessa olevan sivun välissä, jos käytät niiden tietoja.',
    {kind:'criterion',invariant,expected:geometryCriterion(facts,invariant)!});
}
const congCrit=define({
  id:'M79-CONG-CRIT',stop:'Varaosan riittävät tiedot',icon:'≅',
  intro:'Ikkunasta on säilynyt vain osa mitoista. Loikka tarkistaa, takaavatko ne sopivan varaosan.',
  goal:'Perustelet yhtenevyyskriteerin vastaavuuksilla ja osoitat riittämättömän tiedon vastaesimerkillä.',
  reward:'Varaosapiirustukseen jäävät juuri riittävät mitat.',
  produceWhat:'vastaavuuksien ja vastaesimerkin tuottamista',
  families:{'three-sides-vs-three-angles':r=>criterionQuestion(r,'congruent','SSS','AAA'),
    'included-angle-vs-ssa':r=>criterionQuestion(r,'congruent','SAS','SSA')},
  transfer:r=>criterionQuestion(r,'congruent',r.chance(.5)?'ASA':'AAS','AAA'),
  limit:'Vastaavuuskartta, kriteeri ja oma vastaesimerkkipari muodostavat rajatun todisterakenteen. Vapaa todistus arvioidaan erikseen.',
});
const simCrit=define({
  id:'M79-SIM-CRIT',stop:'Varjon kelvollinen malli',icon:'∼',
  intro:'Aava tarvitsee samanmuotoisen mallin, vaikka varjon koko vaihtuu.',
  goal:'Tuotat vastaavuudet ja erotat riittävän yhdenmuotoisuustiedon riittämättömästä tiedosta.',
  reward:'Varjomalliin valitaan toimiva vertailuperuste.',
  produceWhat:'vastaavuuksien ja vastaesimerkin tuottamista',
  families:{'two-angle-correspondence':r=>criterionQuestion(r,'similar','AA','SSA'),
    'proportional-sides-with-or-without-included-angle':r=>criterionQuestion(r,'similar',r.chance(.5)?'ratioSSS':'ratioSAS','SSA')},
  transfer:r=>criterionQuestion(r,'similar','AA','SSA',true),
  limit:'Oppija tuottaa vastaavuuskartan ja vastaesimerkkiparin sekä tunnistaa kriteerin. Vapaa todistus arvioidaan erikseen.',
});

function constructQuestion(r:Rng,vertical:boolean,transfer=false):Draft{
  const s=r.pick([1,2]),half=r.pick([8,10,12,14]),orientation=transfer?p(3,4):vertical?p(0,s):p(s,0);
  const a=mark('A',-half*orientation.x,-half*orientation.y),b=mark('B',half*orientation.x,half*orientation.y);
  const unit=transfer?5:s,radii=[0,2,4,8].map(n=>(half+n)*unit);
  return article({kind:'construction',a,b,radii,...(vertical?{initial:[{center:'A',radius:String(radii[1])},{center:'B',radius:String(radii[2])}]}:{}),note:'Kaaret ovat saman piirrosasteikon ympyröitä.'},[],
    vertical?'Korjaa luonnoksen eri säteet. Valitse kaksi leikkauspistettä ja tarkista keskinormaalin etäisyydet ja kulma.':
      'Piirrä kaksi kaarta, valitse molemmat leikkauspisteet ja muodosta niiden kautta keskinormaali. Tarkista etäisyydet ja kulma.',
    'Aseta kompassi vuorollaan kumpaankin päätepisteeseen. Valitse sama säde, joka ylittää janan puolikkaan.',
    'Kaarien molemmat leikkauspisteet ovat yhtä kaukana kummastakin päätepisteestä. Niiden kautta kulkeva suora on janan keskinormaali.',
    {kind:'construct'});
}
const construct=define({
  id:'M79-CONSTRUCT',stop:'Kompassin rauhallinen kaari',icon:'⦿',
  intro:'Aava tekee janalle keskinormaalin ja haluaa rakenteen, jonka toinen voi toistaa.',
  goal:'Rakennat keskinormaalin kahdesta kaaresta ja tarkistat sen ominaisuudet.',
  reward:'Työpöydän suora on rakennettu ja sen ominaisuudet tarkistettu.',
  produceWhat:'kompassikonstruktion työvaiheita ja ominaisuuksien tarkistamista',
  families:{'horizontal-compass-construction':r=>constructQuestion(r,false),'repair-unequal-compass-radii':r=>constructQuestion(r,true)},
  transfer:r=>constructQuestion(r,false,true),
  limit:'Piirto arvioi yhtä suuret sallitut säteet, oikeat kaksi leikkauspistettä ja oppijan ilmoittamat etäisyydet sekä suorakulman. Keskipisteiden järjestys on vapaa.',
});

function rayQuestion(r:Rng,opposite:boolean,transfer=false):Draft{
  const turn=r.int(0,3),near=r.pick([1,2]),far=near+r.pick([1,2]);
  const coords=transfer?[p(0,0),p(2,1),p(4,2),p(-2,-1),p(0,2)]:opposite?
    [p(1,0),p(1-near,0),p(1-far,0),p(1+near,0),p(0,2)]:
    [p(0,0),p(near,0),p(far,0),p(-near,0),p(0,2)];
  const marks=coords.map((point,i)=>({...turnPoint(point,turn),id:String.fromCharCode(65+i)}));
  return article({kind:'ray',marks,note:'Merkitty toinen piste näyttää suunnan.'},[
    choice('continuation','Rakennetun viivan jatkuminen',opts({one:'Rajatta yhteen suuntaan',two:'Rajatta kumpaankin suuntaan',none:'Päättyy toiseen pisteeseen'}),'one'),
  ],opposite?'Rakenna A:sta alkava puolisuora samalla suoralla kuin B. Suuntaa B:stä poispäin.':
    'Rakenna puolisuora, joka alkaa A:sta ja kulkee B:n kautta. Aseta alkupiste ensin ja sitten suunta.',
  'Toinen piste määrää suunnan. Siinä puolisuora jatkuu eteenpäin ilman toista päätepistettä.',
  'A on ainoa päätepiste. B tai jokin toinen samalla etupuolella oleva piste määrää saman puolisuoran.',
  {kind:'ray',start:'A',direction:opposite?'D':'B'});
}
const ray=define({
  id:'M79-RAY',stop:'Näköalapaikan suuntamerkki',icon:'↗',
  intro:'Rannan suuntamerkki alkaa yhdestä pisteestä. Aava haluaa, että sen suunta jatkuu kartan reunan yli.',
  goal:'Rakennat puolisuoran lähtöpisteen ja suunnan avulla.',
  reward:'Näköalapaikan opaste osoittaa oikeaan suuntaan.',
  produceWhat:'puolisuoran alkupisteen ja suunnan rakentamista',
  families:{'ray-passes-through-many-points':r=>rayQuestion(r,false),'ray-excludes-opposite-side':r=>rayQuestion(r,true)},
  transfer:r=>rayQuestion(r,false,true),limit:'Kaikki oikeassa suunnassa olevat toiset pisteet kelpaavat. Näyttö erottaa puolisuoran janasta ja suorasta.',
});

function pathsQuestion(r:Rng,closed:boolean,transfer=false):Draft{
  const turn=r.int(0,3);
  const paths:GeoPath[]=[
    {id:'a',points:[p(0,0),p(3,2)],segments:'lines',closed:false},
    {id:'b',points:[p(0,0),p(2,2),p(4,0)],segments:'lines',closed},
    {id:'c',points:[p(0,0),p(2,3),p(4,0)],segments:'curve',closed:transfer||closed},
    ...(transfer?[{id:'d',points:[p(0,0),p(2,3),p(4,0)],segments:'curve',closed:false} as const]:[]),
  ];
  const art=r.shuffle(paths).map((path,i)=>({...path,points:path.points.map(point=>turnPoint(point,turn)),id:String.fromCharCode(65+i)} as GeoPath));
  const types=opts({straight:'Suora viiva',polyline:'Murtoviiva',curved:'Kaareva viiva'});
  return article({kind:'paths',paths:art,note:'Viiva on yläkäsite. Viiva voi olla suora, murtuva tai kaareva.'},[
    ...art.map(path=>choice(path.id,`Viiva ${path.id}`,types,pathClass(path))),
    ...(closed||transfer?art.filter(path=>path.segments==='curve').map(path=>choice('closed'+path.id,`Kaareva ${path.id} on`,opts({open:'avoin',closed:'suljettu'}),path.closed?'closed':'open')):[]),
  ],closed||transfer?'Luokittele jokainen viiva. Päättele kaarevista viivoista myös, onko niillä erilliset päätepisteet.':
    'Luokittele jokainen viiva. Vertaa, miten suunta muuttuu kullakin reitillä.',
  'Katso, muuttuvatko suunnat kulmissa vai tasaisesti. Kuvan kääntäminen ei muuta viivan laatua.',
  'Suora viiva pysyy samassa suunnassa. Murtoviiva vaihtaa suuntaa kulmissa. Kaareva viiva voi olla avoin tai suljettu.');
}
const curve=define({
  id:'M79-CURVE',stop:'Polkujen kolme luonnetta',icon:'⌇',
  intro:'Niemimaan polkukartalla näkyy suoria viivoja, taittuvia reittejä ja kaaria.',
  goal:'Erotat suorat viivat, murtoviivat ja kaarevat viivat eri asennoissa.',
  reward:'Polkukarttaan saadaan kolme selkeää viivamerkintää.',
  families:{'path-direction-changes':r=>pathsQuestion(r,false),'closed-curve-and-closed-polyline':r=>pathsQuestion(r,true)},
  transfer:r=>pathsQuestion(r,false,true),limit:'Näyttö koskee viivatyypin tunnistamista ja kaaren avoimuutta. Viiva on tyyppien yhteinen yläkäsite.',
});

function linesQuestion(r:Rng,perpendicular:boolean,transfer=false):Draft{
  const turn=r.int(0,3),wide=r.pick([2,3,4]),gap=r.pick([1,2,3]);
  const second=transfer?[p(1,5),p(5,6)]:perpendicular?[p(gap,-2),p(gap,2)]:[p(-3,gap),p(3,gap)];
  const rotate=(pair:readonly GeoPoint[])=>pair.map(point=>turnPoint(point,turn)) as [GeoPoint,GeoPoint];
  const lines=[rotate([p(-wide,0),p(wide,0)]),rotate(second)] as const;
  const relation=lineRelation(lines);
  return article({kind:'lines',lines,note:'Tarkasteltavat suorat jatkuvat molempiin suuntiin.'},[
    choice('intersects','Suorat leikkaavat',yesNo,relation==='parallel'?'no':'yes'),
    choice('perpendicular','Suorat ovat kohtisuorassa',yesNo,relation==='perpendicular'?'yes':'no'),
    choice('parallel','Suorat ovat yhdensuuntaiset',yesNo,relation==='parallel'?'yes':'no'),
  ],'Tutki suoria myös näkyvien viivojen ulkopuolella. Merkitse, mitkä väitteet pitävät paikkansa.',
  'Jatka suoria molempiin suuntiin. Kohtisuorat suorat leikkaavat suorassa kulmassa.',
  'Leikkauspiste voi olla alkuperäisen näkymän ulkopuolella. Kohtisuoruus on leikkaavien suorien erikoistapaus.');
}
const lines=define({
  id:'M79-LINEREL',stop:'Risteyksen näkyvät suunnat',icon:'⊥',
  intro:'Kaksi reittiä on kartalla rajattu lyhyiksi. Aava jatkaa niiden suoria ja tutkii leikkausta.',
  goal:'Erotat yhdensuuntaiset, leikkaavat ja kohtisuorat suorat.',
  reward:'Risteyskartta näyttää suorien oikean suhteen.',
  families:{'separate-parallel-lines':r=>linesQuestion(r,false),'perpendicular-also-intersects':r=>linesQuestion(r,true)},
  transfer:r=>linesQuestion(r,false,true),limit:'Ehdot tarkistetaan suorille tasossa, myös piirrosrajan ulkopuolella. Kohtisuoruus ja leikkaaminen merkitään erikseen.',
});

const sectorNames=['A','B','C','D'];
function crossingSectors(acute:number,rotation:number,shown:number):GeometryRelationsBoard{
  const sectors:GeoSector[]=[acute,180-acute,acute,180-acute].map((size,i)=>({id:sectorNames[i]!,
    start:rotation+[0,acute,180,180+acute][i]!,size,shown:i===shown}));
  return {kind:'sectors',sectors,bearings:sectors.map(s=>s.start)};
}
function supplementaryQuestion(r:Rng,otherAdjacent:boolean,transfer=false):Draft{
  const theta=r.pick(transfer?[38,112,137]:[42,67,118]),turn=r.int(0,11)*15;
  const known=transfer?1:0;
  const sectors:GeoSector[]=[
    {id:'A',start:turn,size:theta,shown:known===0},{id:'B',start:turn+theta,size:180-theta,shown:known===1},
    {id:'C',start:turn+180,size:otherAdjacent?48:33,shown:true},
  ];
  const unknown=1-known;
  const baseOptions=opts({a:'A ja B',b:'B ja C',c:'A ja C'});
  return article({kind:'sectors',sectors,bearings:[...sectors.map(s=>s.start),turn+180+sectors[2]!.size]},
    [choice('pair','Yhdessä oikokulman muodostava pari',baseOptions,'a'),
      num('missing',`Kulma ${sectors[unknown]!.id} (°)`,sectors[unknown]!.size),
      ...(otherAdjacent?[num('adjacent','Kulmien B ja C summa (°)',sectors[1]!.size+48)]:[])],
    'Tunnista suoran kulman jakava pari. Laske sen puuttuva kulma.'+
      (otherAdjacent?' Laske myös toisen vierekkäisen parin summa.':''),
    'Vierekkäiset kulmat antavat yhteensä 180° silloin, kun parin uloimmat kyljet muodostavat suoran.',
    'Oikokulman jakavan parin summa on 180°. Pelkkä vierekkäisyys ei riitä.');
}
const supplementary=define({
  id:'M79-SUPPLEMENTARY-ANGLES',stop:'Suoran polun sivuhaara',icon:'∠',
  intro:'Sivuhaara jakaa suoran polun kohdalla oikokulman. Toisella puolella on myös muu viereinen pari.',
  goal:'Tunnistat oikokulman jakavan parin ja lasket puuttuvan kulman.',
  reward:'Sivuhaaran suunta saadaan merkittyä karttaan.',
  families:{'supplement-from-straight-line':r=>supplementaryQuestion(r,false),'compare-non-supplementary-adjacency':r=>supplementaryQuestion(r,true)},
  transfer:r=>supplementaryQuestion(r,false,true),limit:'Arviointi erottaa oikokulman jakavat kulmat muista vierekkäisistä pareista.',
});

function verticalQuestion(r:Rng,obtuse:boolean,transfer=false):Draft{
  const index=transfer?2:obtuse?1:0, opposite=(index+2)%4, neighbor=(index+1)%4;
  const acute=r.pick(transfer?[29,58,77]:[37,62,73]);
  const board=crossingSectors(acute,r.int(0,11)*15,index) as Extract<GeometryRelationsBoard,{kind:'sectors'}>;
  return article(board,[
    choice('vertical',`Kulman ${sectorNames[index]} ristikulma`,opts({A:'A',B:'B',C:'C',D:'D'}),sectorNames[opposite]!),
    num('value','Ristikulman suuruus (°)',board.sectors[opposite]!.size),
    ...(obtuse?[num('adjacent',`Viereinen kulma ${sectorNames[neighbor]} (°)`,board.sectors[neighbor]!.size)]:[]),
  ],'Etsi annetun kulman vastapäinen ristikulma ja anna sen suuruus.'+(obtuse?' Vertaa myös merkittyä viereistä kulmaa.':''),
  'Jatka annettua kulmaa rajaavia kylkiä risteyksen vastakkaiselle puolelle.',
  'Ristikulmat ovat yhtä suuret. Välissä oleva viereinen kulma voi olla erisuuruinen.');
}
const vertical=define({
  id:'M79-VERTICAL-ANGLES',stop:'Tuuliviirin vastapari',icon:'⋈',
  intro:'Tuuliviirin puomit muodostavat vastakkaiset kulmat. Loikka tarkistaa, mitkä niistä todella vastaavat toisiaan.',
  goal:'Tunnistat ja lasket ristikulman eri asennoissa.',
  reward:'Tuuliviirin vastakkaiset sektorit merkitään yhtä suuriksi.',
  families:{'vertical-from-acute':r=>verticalQuestion(r,false),'vertical-versus-adjacent-obtuse':r=>verticalQuestion(r,true)},
  transfer:r=>verticalQuestion(r,false,true),limit:'Oppija osoittaa vastakkaisen sektorin ja tuottaa sen suuruuden. Tehtävä erottaa viereisen sektorin ristikulmasta.',
});

function integratedQuestion(r:Rng,chain:boolean,transfer=false):Draft{
  const given=transfer?3:chain?1:0,acute=r.pick(transfer?[33,47,69]:[35,54,76]);
  const cross=crossingSectors(acute,r.int(0,11)*15,given) as Extract<GeometryRelationsBoard,{kind:'sectors'}>;
  const board=chain?{...cross,sectors:cross.sectors.map(s=>({...s,shown:false})),
    note:`B on ${180-2*acute}° suurempi kuin viereinen kulma A.`}:cross;
  const unknown=board.sectors.filter(s=>!s.shown);
  const opposite=sectorNames[(given+2)%4]!;
  const basis=opts({vertical:'Ristikulma annettuun',supplement:'Oikokulmapari annetun kanssa'});
  const fields=chain?[
    ...unknown.map(s=>num('v'+s.id,`${s.id} (°)`,s.size)),
    choice('sum','A:n ja B:n yhteinen sääntö',basis,'supplement'),
    choice('same','A:n ja C:n yhteinen sääntö',basis,'vertical'),
  ]:unknown.flatMap(s=>[num('v'+s.id,`${s.id} (°)`,s.size),
    choice('p'+s.id,`Miten ${s.id} liittyy annettuun?`,basis,s.id===opposite?'vertical':'supplement')]);
  return article(board,fields,chain?'Päättele A ja B niiden erosta ja yhteisestä summasta. Täydennä ristikulmat.':
    'Täydennä kaikki puuttuvat kulmat. Nimeä kunkin suhde annettuun kulmaan.',
  'Vastakkainen kulma on yhtä suuri. Kummallakin viereisellä on annetun kanssa oikokulma.',
  'Samassa vastauksessa tarvitaan sekä ristikulmien yhtäsuuruutta että oikokulman jakavien kulmien summaa.');
}
const integration=define({
  id:'M79-ANGLE-REL',stop:'Risteyksen koko salaisuus',icon:'✣',
  intro:'Risteykseen tarvitaan koko merkintäsarja. Aavalla on vasta yksi lähtötieto.',
  goal:'Yhdistät ristikulmien ja oikokulmaparien säännöt samassa risteyksessä.',
  reward:'Kaikki risteyksen suunnat saadaan samaan piirrokseen.',
  produceWhat:'kolmen puuttuvan kulman ja kummankin säännön soveltamista',
  families:{'derive-from-acute-sector':r=>integratedQuestion(r,false),'derive-from-adjacent-angle-difference':r=>integratedQuestion(r,true)},
  transfer:r=>integratedQuestion(r,false,true),
  limit:'Kaikki puuttuvat kulmat ja kummankin säännön kohdistus tarkistetaan samassa vastauksessa. Peruste nimetään annetuista käsitteistä.',
});

function triangleQuestion(r:Rng,invalid:boolean,transfer=false):Draft{
  const raw:readonly [number,number,number]=invalid?r.pick([[0,80,100],[65,75,45],[40,60,70]] as const):
    r.pick([[40,58,82],[115,35,30],[90,35,55]] as const);
  const angles=r.shuffle(raw) as [number,number,number];
  const hidden=invalid?null:transfer?1:r.int(0,2);
  const fields=invalid?[
    num('sum','Annettujen kulmien summa (°)',angles.reduce((a,b)=>a+b)),
    choice('possible','Voiko näistä syntyä kolmio?',yesNo,'no'),
    choice('reason','Mikä ehto estää?',opts({zero:'Kaikkien kulmien pitää olla positiivisia',total:'Kulmien summan pitää olla 180°'}),angles.includes(0)?'zero':'total'),
  ]:[
    num('missing',`Puuttuva kulma ${sectorNames[hidden!]} (°)`,angles[hidden!]!),
    num('straight','Kärkien muodostama kulma (°)',180),
  ];
  return article({kind:'triangle',angles,hide:hidden,...(transfer?{rotation:60}:{}),note:invalid?'Nämä ovat ehdotettuja kulmamittoja.':'Aseta kärkikulmat vierekkäin.'},fields,
    invalid?'Tarkista ehdotetut kulmat. Laske summa ja päättele, voiko niistä syntyä kolmio.':
      'Kokoa kolme kärkikulmaa samalle suoralle. Anna puuttuva kulma ja muodostunut kokonaiskulma.',
    invalid?'Kolmion jokaisen kulman täytyy olla positiivinen, ja niiden summan pitää olla 180°.':
      'Tuo jokainen kärki kerran samaan pisteeseen. Sektorit asettuvat vierekkäin oikokulmaksi.',
    invalid?'Summa 180° ei yksin riitä, jos yksi kulma on nolla.':
      'Kolme kärkikulmaa täyttävät yhdessä oikokulman. Puuttuva kulma saadaan vähentämällä kaksi tunnettua 180 asteesta.',
    invalid?undefined:{kind:'angle-model'});
}
const tri=define({
  id:'M79-TRI-ANGLE-SUM',stop:'Kolme kulmaa yhteen',icon:'△',
  intro:'Aava tuo kolmion kärjet samaan kohtaan. Loikka tarkistaa myös luonnoksen, jossa kolmea kulmaa ei voi toteuttaa.',
  goal:'Muodostat kolmion kulmasumman mallin ja tarkistat kelvolliset kulmat.',
  reward:'Kolmion kolme kulmalappua saadaan oikein.',
  produceWhat:'kärkikulmien yhdistämistä ja summan tai puuttuvan kulman laskemista',
  families:{'assemble-corners-on-straight-angle':r=>triangleQuestion(r,false),'reject-impossible-angle-triple':r=>triangleQuestion(r,true)},
  transfer:r=>triangleQuestion(r,false,true),
  limit:'Mallissa tuotetaan kolmen kärjen oikokulma ja puuttuva kulma. Kelpoisuustehtävässä tarkistetaan summa ja positiivisuus.',
});

const hex=[p(0,1),p(4,0),p(7,2),p(6,5),p(2,6),p(-1,4)];
const hept=[p(0,1),p(4,0),p(7,2),p(8,4),p(6,6),p(3,7),p(0,5)];
function polygonQuestion(r:Rng,regular:boolean,transfer=false):Draft{
  const points=transfer?hept:r.pick([asymmetric,zigWindow,hex,hept]);
  const count=regular?r.pick([4,5,6,7]):points.length,amount=polygonAngleSum(count);
  const board:GeometryRelationsBoard=regular?{kind:'polygon',regular:true,rotation:r.int(0,6)*13,
    vertices:Array.from({length:count},(_,i)=>String.fromCharCode(65+i)),note:'Säännöllisen kuvion sivut ovat yhtä pitkiä ja kulmat yhtä suuria.'}:
    {kind:'polygon',regular:false,shape:shape('roof','Kattokuvio',transform(points,r.int(0,3))),
      note:'Kuvio on kupera. Sen kulmat eivät ole kaikki yhtä suuria.'};
  return article(board,[
    num('triangles','Kolmioiden määrä',count-2),num('sum','Sisäkulmien summa (°)',amount),
    ...(regular?[num('one','Yksi sisäkulma (°)',`${amount}/${count}`)]:
      [choice('equal','Voiko jokaisen kulman päätellä jakamalla summan tasan?',yesNo,'no')]),
  ],'Piirrä lävistäjät, jotka jakavat kuvion kolmioihin. Laske sisäkulmien summa ja tutki yksittäistä kulmaa.'+
    (regular?' Anna kulma tarvittaessa tarkkana murtolukuna.':''),
  'Lävistäjät eivät saa risteytyä. Jokaisen muodostuvan kolmion kulmasumma on 180°.',
  'Kuperan monikulmion n kärkeä antaa n−2 kolmiota. Yksittäinen kulma saadaan jakamalla tasan vain, kun kulmat ovat yhtä suuret.',
  {kind:'triangulate'});
}
const poly=define({
  id:'M79-POLY-ANGLES',stop:'Monikulmaisen majan katto',icon:'⬡',
  intro:'Majan katto jaetaan kolmioihin. Aava tutkii, mitä jaosta voidaan päätellä kattokuvion kulmista.',
  goal:'Kolmioit kuperan monikulmion ja lasket sisäkulmien summan.',
  reward:'Kattokuvio saa oman kolmiojaon ja kulmamerkinnät.',
  produceWhat:'oman kolmiojaon ja kulmasumman laskemista',
  families:{'triangulate-irregular-convex-roof':r=>polygonQuestion(r,false),'regular-angle-after-triangulation':r=>polygonQuestion(r,true)},
  transfer:r=>polygonQuestion(r,false,true),
  limit:'Mikä tahansa risteämätön kolmiointi kelpaa. Yhden kulman tasajako hyväksytään vain säännöllisessä kuviossa.',
});

function scaleQuestion(r:Rng,volume:boolean,transfer=false):Draft{
  const k=r.pick([2,3]),a=r.int(2,5),b=r.int(3,7);
  const factor=transfer?`1/${k}`:String(k);
  const source=volume?a*3:a,scaled=source*k;
  const values=transfer?[{label:'Vertailusivu (cm)',source:String(scaled),target:String(source)},
    {label:'Toinen sivu (cm)',source:'?',target:String(b)}]:
    [{label:'Vertailusivu (cm)',source:String(source),target:String(scaled)},{label:'Toinen sivu (cm)',source:String(b),target:'?'}];
  if(volume&&!transfer)values.push({label:'Pinta-ala (cm²)',source:String(a*b),target:'?'},
    {label:'Tilavuus (cm³)',source:String(a*b*source),target:'?'});
  return article({kind:'scale',rows:values,note:volume?'Kaikki kappaleen kolme suuntaa muuttuvat samalla kertoimella.':
    'Kaikki vastaavat pituudet muuttuvat samalla kertoimella.'},[
    num('factor','Pituuskerroin',factor),num('side','Puuttuva sivu (cm)',b*k),
    num('area','Pinta-alakerroin',transfer?`1/${k*k}`:k*k),
    num('volume','Tilavuuskerroin',transfer?`1/${k*k*k}`:k*k*k),
    ...(volume&&!transfer?[num('areaValue','Uusi pinta-ala (cm²)',a*b*k*k),num('volumeValue','Uusi tilavuus (cm³)',a*b*source*k*k*k)]:[]),
  ],transfer?'Pienennä mallia. Päättele alkuperäinen sivu ja ilmoita pituuden, pinta-alan ja tilavuuden kertoimet.':
    volume?'Laske puuttuva pituus, pinta-ala ja tilavuus. Ilmoita myös jokaisen suureen kerroin.':
      'Laske puuttuva pituus ja ilmoita erikseen pituuden, pinta-alan ja tilavuuden kertoimet.',
  'Sama pituuskerroin vaikuttaa pinta-alaan kahdessa ja tilavuuteen kolmessa suunnassa.',
  'Pituuskerroin on k. Pinta-alakerroin on k² ja tilavuuskerroin k³. Pienennöksessä alkuperäinen pituus saadaan jakamalla kertoimella.');
}
const scale=define({
  id:'M79-SIMILAR-SCALE',stop:'Näköalapaviljongin suurennos',icon:'⤢',
  intro:'Paviljongin pienoismallista tehdään suurempi. Loikka vertailee mittoja, pintaa ja tilaa.',
  goal:'Lasket mittakaavan ja erotat pituuden, pinta-alan sekä tilavuuden kertoimet.',
  reward:'Rakennuslappuun saadaan oikeat kertoimet eri suureille.',
  produceWhat:'pituuden ja eri ulottuvuuksien mittakaavakertoimien laskemista',
  families:{'scale-window-and-painted-area':r=>scaleQuestion(r,false),'scale-three-dimensional-model':r=>scaleQuestion(r,true)},
  transfer:r=>scaleQuestion(r,true,true),
  limit:'Kertoimet ja puuttuva pituus tuotetaan tarkasti. Kertoimien arvot kuvaavat yhdenmuotoista suurennosta tai pienennöstä.',
});

const entries=[congruence,congCrit,construct,curve,lines,poly,ray,similarity,simCrit,scale,supplementary,tri,vertical,integration];
export const geometryRelationsSpecs:NodeSpec[]=entries.map(entry=>entry.spec);
export const geometryRelationsEvidence:Readonly<Record<string,{families:readonly string[];limit:string}>>=
  Object.fromEntries(entries.map(entry=>[entry.spec.id,entry.evidence]));
