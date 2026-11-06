import type { Rng } from '../engine/rng';
import type { Item, NodeSpec } from '../engine/types';
import type { ExpeditionSceneModel } from './expedition-slice';
import { cases } from './kit';
import {
  classifyOpening, hasRotation, scaled, translated,
  type AnglePicture, type Cell, type Point, type SpatialAction, type SpatialBoard, type SpatialField, type SpatialMeasureTask,
} from './models/spatial-measures';
import { spatialMeasureArt } from './scenes/spatial-measures';

type Draft = Omit<Item, 'tag' | 'task'> & { task: SpatialMeasureTask; sceneModel?: ExpeditionSceneModel };
type Family = (r: Rng) => Draft;
interface Definition extends Omit<NodeSpec, 'item' | 'demo' | 'rev' | 'validRevs' | 'produce'> {
  families: Record<string, Family>; transfer: Family; limit: string; edition?: 1|2;
}
function define({ families, transfer, limit, edition = 1, ...info }: Definition) {
  const tags = Object.keys(families), prefix = `exp690-spatial-${info.id.toLowerCase()}`, rev = `${prefix}-v${edition}`;
  return {
    spec: { ...info, rev, validRevs: edition === 2 ? [`${prefix}-v1`, rev] : [rev], item: cases(families, transfer),
      ...(info.produceWhat ? { produce: [...tags, 'transfer'] } : {}),
      demo: r => tags.map(tag => {
        const example = families[tag]!(r);
        return { say: example.explain!, scene: spatialMeasureArt(example.task, true), sceneModel: example.sceneModel };
      }),
    } satisfies NodeSpec, evidence: { families: tags, limit },
  };
}
const options = (labels: Record<string, string>) => Object.entries(labels).map(([id,label]) => ({ id,label }));
const choose = (id: string, label: string, labels: Record<string,string>, answer: string): SpatialField =>
  ({ id,label,kind:'choice',options:options(labels),answer });
const number = (id: string, label: string, answer: number | string): SpatialField =>
  ({ id,label,kind:'number',answer:String(answer) });
const locate = (expected: readonly Point[], ordered = false): SpatialAction => ({ kind:'points', expected, ordered, count:expected.length });
const grid = (size: number, shown: readonly Point[] = [], legend?: string): Extract<SpatialBoard,{kind:'grid'}> => ({ kind:'grid',size,shown,legend });
const picture = (opening: number, start = 0, clockwise = false, lengths: readonly [number,number] = [68,60], vertex: Point = [104,94]): AnglePicture =>
  ({ opening,start,clockwise,lengths,vertex });
const coord = ([x,y]: Point) => `(${x}, ${y})`;
const report = (board: SpatialBoard, fields: SpatialField[], action: SpatialAction | undefined,
  say: string, hint: string, explain: string, why = hint): Draft => {
  const task: SpatialMeasureTask = { kind:'spatial-measures', board, fields, action, why };
  return { task, say, hint, explain, scene: undefined };
};
const recognition = 'Vastaus osoittaa annettujen mallien tulkintaa ja ominaisuuksien erottamista. Vapaa selitys arvioidaan erikseen.';

function pointQuestion(r: Rng, crossing: boolean, transfer = false): Draft {
  const x = r.int(2,5), y = r.int(1,4);
  const target: Point = crossing ? [x, y] : [x + 1, y];
  const board = { ...grid(7, crossing ? [[x,0],[0,y]] : [[x,y]], crossing
    ? `Pystylinja x = ${x} ja vaakalinja y = ${y} risteävät.` : 'A on lähtömerkki. Yksi askel vastaa yhtä ruutuväliä.'), largePin: transfer || crossing };
  return report(board, [choose('meaning','Mitä piirretyn pisteen koko kertoo?', {
    position:'Merkki tekee paikan näkyväksi', size:'Pisteen halkaisija on matka kartalla', area:'Pisteen pinta-ala on mitattava kohde',
  },'position')], locate([target]),
  crossing ? `Merkitse linjojen x = ${x} ja y = ${y} risteys ja tulkitse näkyvä osoitin.` : 'Merkitse piste yksi askel A:sta oikealle ja tulkitse osoittimen koko.',
  'Pisteellä on paikka. Ruudun tai osoitinympyrän koko ei määrää sen matemaattista kokoa.',
  `Piste on kohdassa ${coord(target)}. Isompi osoitin voi näyttää saman paikan.`);
}
const point = define({
  id:'M-GEO-19',stop:'Kohta kallion kartassa',icon:'•',
  intro:'Aava löytää kartasta tarkan paikan. Loikka kokeilee saman kohdan osoittamiseen eri kokoista merkkiä.',
  goal:'Merkitset pisteen paikkaan ja tulkitset sen osoittimen.',reward:'Kartassa näkyy yksi tarkka kohtauspaikka.',
  produceWhat:'pisteen paikan merkitsemistä',families:{ 'point-offset-anchor':r=>pointQuestion(r,false), 'point-line-intersection':r=>pointQuestion(r,true) },
  transfer:r=>pointQuestion(r,false,true),limit:'Oppija merkitsee pisteen kokonaislukuruudukkoon ja valitsee osoittimen merkityksen. Pisteellä on paikka.',
});
function segmentQuestion(r: Rng, diagonal: boolean, transfer = false): Draft {
  const a: Point = [1,r.int(1,2)], b: Point = diagonal ? [r.int(4,6),r.int(4,6)] : [5,a[1]];
  const useCoordinates = diagonal && !transfer;
  return report(grid(7,useCoordinates ? [] : [a,b],useCoordinates ? `Päätepisteet A ${coord(a)} ja B ${coord(b)}.` : undefined),
    [choose('property','Rakennetun janan ominaisuus',{
    bounded:'suora yhteys, joka päättyy kumpaankin pisteeseen', curved:'kaari pisteiden välillä', unlimited:'jatkuu rajatta molempiin suuntiin',
  },'bounded')],locate([a,b]),
  transfer ? 'Rakenna vinossa olevien merkkien väliin jana. Osoita molemmat päätepisteet ja merkitse, mihin jana päättyy.'
    : useCoordinates ? 'Rakenna jana kirjoitetuista päätepisteistä. Valitse janan kuvaus.'
      : 'Rakenna jana osoittamalla merkit A ja B. Valitse janan kuvaus.',
  'Janan molemmat päätepisteet kuuluvat janaan. Reitti niiden välillä on suora.',
  `Janan päät ovat ${coord(a)} ja ${coord(b)}. Jana on niiden suora, äärellinen väli.`);
}
const segment = define({
  id:'M-GEO-20',stop:'Kahden merkin suora yhteys',icon:'╱',
  intro:'Loikan köysi voi kiertää, mutta karttapiirroksen jana yhdistää merkit suoraan.',
  goal:'Rakennat janan kahdesta päätepisteestä ja erotat sen kaaresta sekä suorasta.',reward:'Poukaman merkit yhdistyvät selkeällä janalla.',
  produceWhat:'janan molempien päätepisteiden sijoittamista',
  families:{ 'segment-horizontal-endpoints':r=>segmentQuestion(r,false), 'segment-diagonal-endpoints':r=>segmentQuestion(r,true) },
  transfer:r=>segmentQuestion(r,true,true),limit:'Oma jana määräytyy oppijan merkitsemistä päätepisteistä. Vapaakätinen piirrostarkkuus arvioidaan erikseen.',
});
function lineQuestion(r: Rng, rays: boolean, transfer = false): Draft {
  const styles = r.shuffle(rays ? ['line','ray','segment'] as const : ['arc','segment','line'] as const);
  const lines = styles.map((style,i)=>({ style,id:String.fromCharCode(65+i),bearing:transfer ? r.pick([45,90,135]) : rays ? 28 : 0 }));
  return report({ kind:'lines',lines },[
    choose('line','Koko suoran esitys',Object.fromEntries(lines.map(({id})=>[id,`Piirros ${id}`])),lines.find(l=>l.style==='line')!.id),
    choose('extent','Jatkuminen',{ both:'rajatta molempiin suuntiin', one:'rajatta yhteen suuntaan', finite:'päättyy kuvan reunaan' },'both'),
  ],undefined,'Valitse suoran esitys ja merkitse, miten se jatkuu kuvan ulkopuolella.',
  'Nuoli kertoo, mihin suuntaan viiva jatkuu näkyvän piirroksen ulkopuolelle.',
  'Suoralla ei ole päätepisteitä. Piirros näyttää vain osan molempiin suuntiin jatkuvasta suorasta.');
}
const straight = define({
  id:'M-GEO-21',stop:'Viiva joka jatkuu taulun yli',icon:'↔',
  intro:'Aavan karttataulu loppuu, vaikka karttaan piirretty suora jatkuu ajatuksessa sen ulkopuolelle.',
  goal:'Tunnistat suoran ja sen jatkumisen molempiin suuntiin.',reward:'Karttamerkki kertoo, että suora jatkuu piirroksen yli.',
  families:{ 'line-versus-arc-and-segment':r=>lineQuestion(r,false), 'line-versus-ray':r=>lineQuestion(r,true) },
  transfer:r=>lineQuestion(r,true,true),limit:recognition,
});

function angleMeaning(r: Rng, same: boolean, transfer = false): Draft {
  const start = transfer ? r.pick([70,140,215]) : 5;
  const first = same ? r.pick([45,60,75]) : r.pick([35,45,55]);
  const second = same ? first : first + 45;
  const names = r.shuffle(['P','Q','R']) as [string,string,string];
  const a = { ...picture(first,start,transfer,[71,62]), id:'A', names };
  const b = { ...picture(second,start+15,transfer,[44,37]), id:'B' };
  return report({ kind:'angles',angles:[a,b],legend:'Kulmassa A näkyvät pisteet P, Q ja R.' },[
    choose('vertex','Kulman A kärki',{ P:'P',Q:'Q',R:'R' },names[0]),
    choose('arms','Kulman A kyljet',Object.fromEntries(names.map((n,i)=>[n,`${n}${names[(i+1)%3]} ja ${n}${names[(i+2)%3]}`])),names[0]),
    choose('compare','Avautumisen vertailu',{ a:'A avautuu enemmän', b:'B avautuu enemmän', equal:'Avautuminen on sama' },same?'equal':'b'),
  ],undefined,'Osoita kulman A kärki ja molemmat kyljet. Vertaa sitten kulmien avautumista.',
  'Kyljet lähtevät yhteisestä kärjestä. Kyljen näkyvä pituus ei muuta avautumista.',
  `Kulman A kärki on ${names[0]}. ${same?'Kulmat aukeavat yhtä paljon.':'B aukeaa enemmän, vaikka sen kyljet on piirretty lyhyemmiksi.'}`);
}
const angleProperties = define({
  id:'M-GEO-22',stop:'Avautuvan merkin salaisuus',icon:'∠',
  intro:'Aava piirtää saman avautumisen eripituisilla viivoilla. Loikka tutkii, mikä kulmassa muuttui.',
  goal:'Tunnistat kulman kärjen ja kyljet ja vertaat avautumista.',reward:'Suuntamerkkien avautumiset erottuvat.',
  families:{ 'angle-parts-equal-opening':r=>angleMeaning(r,true), 'angle-short-arms-wider':r=>angleMeaning(r,false) },
  transfer:r=>angleMeaning(r,true,true),limit:recognition,
});
function drawAngle(r: Rng, wide: boolean, transfer = false): Draft {
  const amount = wide ? r.pick([110,125,140]) : r.pick([35,55,70]);
  const start = transfer ? r.pick([135,195,255]) : wide ? 155 : 0;
  const clockwise = wide || transfer;
  return report({ kind:'angles',tool:'draw',angles:[picture(amount,start,clockwise,[72,72])],
    legend:`Piirrä sinisestä alkukyljestä ${clockwise?'myötäpäivään':'vastapäivään'}. Hyväksyttävä ero pyydetystä on enintään 1°.` },
  [],{kind:'degree',opening:amount,tolerance:1},
  `Piirrä ${amount}° kulma annetusta kärjestä ja alkukyljestä. Säädä toista kylkeä.`,
  'Säädä kulman avautumista asteaskelilla tai kirjoita haluamasi asteluku.',
  `Toinen kylki on ${amount}° päässä sinisestä alkukyljestä. Kärki pysyy samassa kohdassa.`,
  'Vertaa rakennettua avautumista pyydettyyn astelukuun. Ero saa olla enintään yksi aste.');
}
const drawing = define({
  id:'M-GEO-23',stop:'Aavan piirretty kulma',icon:'✎',
  intro:'Aava piirtää suuntamerkin ensimmäisen kyljen. Loikka kääntää toisen kyljen oikeaan asentoon.',
  goal:'Piirrät pyydetyn kulman annetusta kärjestä ja alkusuunnasta.',reward:'Suuntamerkki aukeaa pyydettyyn suuntaan.',
  produceWhat:'oman kulman rakentamista annetusta alkukyljestä',
  families:{ 'draw-acute-counterclockwise':r=>drawAngle(r,false), 'draw-obtuse-clockwise':r=>drawAngle(r,true) },
  transfer:r=>drawAngle(r,r.chance(.5),true),limit:'Asteaskelmalli arvioi rakennetun avautumisen yhden asteen tarkkuudella. Vapaakätinen piirros arvioidaan erikseen.',
});
function measureAngle(r: Rng, reverse: boolean, transfer = false): Draft {
  const opening = reverse ? r.pick([105,120,135]) : r.pick([30,45,60]);
  const start = transfer ? r.pick([45,120,225,285]) : reverse ? r.pick([195,210,240]) : r.pick([15,30,45]);
  const vertex: Point = [r.pick([96,103,107]),r.pick([89,94,99])];
  const angle = picture(opening,start,!reverse,[66,62],vertex);
  const heading = reverse ? (start+180)%360 : start;
  return report({ kind:'angles',tool:'protractor',angles:[angle],
    legend:'Sininen kylki on alkukylki. Ulompi A-asteikko on sininen, sisempi B ruskea.' },[],
  { kind:'protractor',vertex,heading,opening,scale:reverse?'b':'a' },
  'Aseta kulmamitan keskipiste ja käännä pohjaviiva alkukyljelle. Valitse asteikko ja lue arvo toiselta kyljeltä.',
  'Valitse ensin kärjessä oleva kohdistusmerkki. Käännä kaari kulman aukeavalle puolelle. Lue asteikkoa sen nollasta.',
  `Kohdistetun mitan ${reverse?'sisempi B':'ulompi A'}-asteikko näyttää ${opening}° toisella kyljellä.`);
}
const protractor = define({
  id:'M-GEO-24',stop:'Mitta kärjen kohdalle',icon:'◔',
  intro:'Loikan mitta on aluksi irrallaan piirroksesta. Aava näyttää, miten mittari asetetaan ennen lukemista.',
  goal:'Kohdistat kulmamitan ja luet oikean asteikon.',reward:'Työohjeeseen tulee mitattu avautuminen.',
  produceWhat:'kulmamitan keskipisteen ja pohjaviivan kohdistamista sekä lukeman tuottamista',
  families:{ 'protractor-outer-scale':r=>measureAngle(r,false), 'protractor-inner-scale':r=>measureAngle(r,true) },
  transfer:r=>measureAngle(r,r.chance(.5),true),limit:'Oppijan kohdistus, suunta, asteikon valinta ja lukema arvioidaan yhdessä. Fyysisen mittarin käsittely arvioidaan erikseen.',
});
const angleClasses = { zero:'nollakulma',acute:'terävä kulma',right:'suora kulma',obtuse:'tylppä kulma',straight:'oikokulma' };
function angleClass(r: Rng, endpoints: boolean, transfer = false): Draft {
  const sizes = r.shuffle(endpoints ? [0,180,r.pick([30,120])] : [89,90,91]);
  const angles = sizes.map((opening,i)=>({ ...picture(opening,transfer ? 50+i*65 : 25+i*30,false,[64,60]),
    id:String.fromCharCode(65+i),showDegrees:true }));
  return report({ kind:'angles',angles,legend:'Tässä pajassa luokitellaan avautumiset välillä 0–180°.' },
  angles.map(a=>choose(a.id,`Kulma ${a.id}`,angleClasses,classifyOpening(a.opening)!)),undefined,
  'Luokittele kulmat niiden avautumisen mukaan. Tarkista myös täsmälliset rajatapaukset.',
  'Vertaa 90°:een ja tarkista erikseen 0° ja 180°.',
  '0° on nollakulma, 90° suora kulma ja 180° oikokulma. Terävä ja tylppä sijoittuvat niiden väleihin.');
}
const angles = define({
  id:'M-GEO-25',stop:'Kulmien omat nimet',icon:'⌟',
  intro:'Työpöydällä kulmat osoittavat eri suuntiin. Aava lajittelee ne avautumisen mukaan.',
  goal:'Tunnistat kulmaluokat ja rajatapaukset.',reward:'Kulmamerkit löytyvät oikeista lokeroista.',
  families:{ 'angles-near-right':r=>angleClass(r,false), 'angles-zero-and-straight':r=>angleClass(r,true) },
  transfer:r=>angleClass(r,r.chance(.5),true),limit:recognition,
});

const occupied = (w:number,h:number,layers = 1): Cell[] =>
  Array.from({length:w*h*layers},(_,i)=>[i%w,Math.floor(i/w)%h,Math.floor(i/(w*h))]);
const cellBoard = (grid:readonly [number,number,number],cells:readonly Cell[],unit:string,legend?:string): SpatialBoard =>
  ({ kind:'cells',grid,cells,unit,legend });
const areaUnits = { area:'cm²', length:'cm', volume:'cm³' };
function coverArea(r:Rng, corner:boolean, transfer=false):Draft {
  const w=transfer?4:r.pick([3,4,5]), h=transfer?3:r.pick(corner?[3,4]:[2,3]);
  const target=occupied(w,h).filter(([x,y])=>transfer ? (y===0 || x===w-1) : !corner || y<2 || x===0);
  return report(cellBoard([w,h,1],target,'cm²','Vihreä alue on peitettävä. Yksi laatta peittää yhden 1 cm × 1 cm ruudun.'),[
    number('area','Peitetty pinta-ala',target.length),choose('unit','Pinta-alan yksikkö',areaUnits,'area'),
  ],{kind:'cells',expected:target},'Peitä koko vihreä alue yksikköruuduilla. Kirjoita pinta-ala ja valitse yksikkö.',
  'Peitä jokainen vihreä ruutu kerran. Reunan pituus on eri mitta.',
  `Alue peittyy ${target.length} yksikköruudulla. Sen pinta-ala on ${target.length} cm².`);
}
const cover = define({
  id:'M-GMEAS-02',edition:2,stop:'Kuivan paikan ruutumatto',icon:'▦',
  intro:'Aava peittää majan märän kohdan samanlaisilla laatoilla. Loikka laskee, montako laattaa pinta tarvitsee.',
  goal:'Peität pinnan yksikköruuduilla ja ilmoitat pinta-alan.',reward:'Koko kuiva alue saa ruutumaton.',
  produceWhat:'pinnan omaa peittämistä yksikköruuduilla',
  families:{ 'cover-rectangle':r=>coverArea(r,false), 'cover-corner':r=>coverArea(r,true) },
  transfer:r=>coverArea(r,true,true),limit:'Oppijan peitto, yksikköruutujen määrä ja neliöyksikkö arvioidaan. Peittämisjärjestys voi vaihdella.',
});
function volumeQuestion(r:Rng, steps:boolean, transfer=false):Draft {
  const w=transfer?4:r.pick([3,4]),h=transfer?3:r.pick([3,4]),l=transfer?2:3;
  const ledge=transfer?2:r.pick([1,2]), cap=transfer?1:r.pick([1,2]);
  const target=occupied(w,h,l).filter(([x,y,z])=>!steps || z===0 || (x<ledge && (z===1 || y<cap)));
  const question=report(cellBoard([w,h,l],target,'cm³',
    'Kaikki kerroskartat ovat näkyvissä. Vihreään paikkaan mahtuu yksi 1 cm × 1 cm × 1 cm kuutio.'),[
    number('volume','Tilavuus',target.length),choose('unit','Tilavuuden yksikkö',areaUnits,'volume'),
  ],{kind:'cells',expected:target},'Täytä kaikkien kerrosten vihreät paikat. Kirjoita yksikkökuutioiden määrä ja tilavuuden yksikkö.',
  'Vaihda muokattavaa kerrosta. Laske mukaan sisälle ja toisen kerroksen alle jäävät kuutiot.',
  `Kerrokset sisältävät yhteensä ${target.length} yksikkökuutiota. Tilavuus on ${target.length} cm³.`);
  question.sceneModel={kind:'spatial-volume',title:'Varaston yksikkökuutiot',grid:[w,h,l],cells:target};
  return question;
}
const volume = define({
  id:'M-GMEAS-04',edition:2,stop:'Varastotilan kuutiot',icon:'🧊',
  intro:'Varastoon mahtuu kuutioita myös näkyvän eturivin taakse. Aava avaa jokaisen kerroskartan.',
  goal:'Täytät tilan yksikkökuutioilla ja lasket kaikki kerrokset.',reward:'Varasto saa tarkan tilavuusmerkinnän.',
  produceWhat:'tilan täyttämistä yksikkökuutioilla',
  families:{ 'fill-rectangular-layers':r=>volumeQuestion(r,false), 'fill-unequal-layer-masks':r=>volumeQuestion(r,true) },
  transfer:r=>volumeQuestion(r,true,true),limit:'Vastaus muodostuu oppijan täyttämistä kerroksista, kuutioiden määrästä ja kuutioyksiköstä. Fyysinen rakentelutaito arvioidaan erikseen.',
});
function compositeArea(r:Rng, flipped:boolean, transfer=false):Draft {
  const w=transfer?5:4,h=transfer?4:3;
  const splitX=r.pick([1,2]),splitY=r.pick([1,2]);
  const target=occupied(w,h).filter(([x,y])=>flipped ? x>=splitX || y>=splitY : x<splitX || y<splitY);
  const cuts=[
    {id:`x${splitX}`,axis:0 as const,at:splitX,label:`Pystyviiva sarakkeen ${splitX} jälkeen`},
    {id:`y${splitY}`,axis:1 as const,at:splitY,label:`Vaakaviiva rivin ${splitY} jälkeen`},
    {id:'x0',axis:0 as const,at:0,label:'Alueen vasen ulkoreuna'},
  ];
  const avoid=transfer?cuts[0]!.id:undefined;
  return report(cellBoard([w,h,1],target,'cm²',transfer?
    'Vertailussa leikattiin pystyviivalla. Valitse nyt toinen ositus. Sininen osa lasketaan ensin.':
    'Sininen osa lasketaan ensin. Yksi ruutu on 1 cm².'),[
    choose('unit','Pinta-alan yksikkö',areaUnits,'area'),
  ],{kind:'partition',cells:target,cuts,avoid},'Osita alue kahdeksi suorakulmioksi. Laske kummankin ala ja yhteinen pinta-ala.',
  'Leikkaus jakaa jokaisen ruudun juuri yhteen osaan. Laske alojen summa, älä reunan pituutta.',
  `Kahden osan pinta-alat muodostavat yhteensä ${target.length} cm² ilman yhteisiä ruutuja.`);
}
function subtractHole(r:Rng):Draft {
  const [w,h]=r.pick([[5,4],[5,5],[4,4]] as const);
  const hole=occupied(w,h).filter(([x,y])=>y===1&&(x===1||x===2));
  const target=occupied(w,h).filter(p=>!hole.some(q=>p[0]===q[0]&&p[1]===q[1]));
  return report(cellBoard([w,h,1],target,'cm²','Yksi ruutu on 1 cm². Keskellä oleva valkoinen aukko jää pinta-alan ulkopuolelle.'),[
    number('outer','Koko ulkosuorakulmion ala',w*h),number('hole','Aukon ala',hole.length),
    number('total','Vihreän alueen ala',target.length),choose('unit','Pinta-alan yksikkö',areaUnits,'area'),
  ],undefined,'Laske vihreän yhdistelmäpinnan ala koko suorakulmiosta ja aukosta.',
  'Laske ensin koko ulkosuorakulmio. Vähennä sen sisältä valkoiseksi jäävä aukko kerran.',
  `Koko suorakulmio on ${w*h} cm². Aukon ${hole.length} cm² vähentämisen jälkeen jää ${target.length} cm².`);
}
const composite = define({
  id:'M-GMEAS-03',stop:'Mutkaisen rannan pinta',icon:'◧',
  intro:'Mutkainen rantapiha ei ole yksi suorakulmio. Loikka etsii kohdan, josta sen voi osittaa.',
  goal:'Lasket yhdistelmäpinnan alan päällekkäisyyttä välttäen.',reward:'Rantapihan pinta-ala saadaan tarkistuspiirrokseen.',
  produceWhat:'osituksen valitsemista ja molempien osien alan laskemista',
  families:{ 'area-inner-notch':r=>compositeArea(r,false), 'area-subtract-inner-opening':subtractHole },
  transfer:r=>compositeArea(r,true,true),limit:'Tarkistus hyväksyy soveltuvan kahden suorakulmion osituksen ja arvioi osien alat, summan ja yksikön.',
});

function ratioQuestion(r:Rng, model:boolean, transfer=false):Draft {
  const drawing = model ? r.pick([36,48,72]) : r.pick([3,4,6]);
  const actual = transfer ? drawing * 5 : model ? drawing * 3 : drawing * 8;
  const drawingCm = model ? `${drawing}/10` : String(drawing);
  const actualCm = model ? actual * 10 : actual * 100;
  const kind = model ? transfer?'Pienoismallin palkki':'Majakan pienoismalli' : 'Saaren kartta';
  return report({kind:'measure',givens:[
    {label:kind,value:`${drawing} ${model?'mm':'cm'}`},
    {label:'Todellinen pituus',value:`${actual} ${model?'dm':'m'}`},
    {label:'Muunnoksen apu',value:model?'10 mm = 1 cm ja 1 dm = 10 cm':'1 m = 100 cm'},
  ]},[
    number('shown','Kuvan pituus (cm)',drawingCm),number('actual','Todellinen pituus (cm)',actualCm),
    number('ratio','Suhde kuva : todellinen',`${drawing}/${model?actualCm*10:actualCm}`),
  ],undefined,'Muunna molemmat pituudet senttimetreiksi. Kirjoita mittakaavan suhde kuva : todellinen.',
  'Suhteen molemmat pituudet on ilmaistava samassa yksikössä. Suhteen voi kirjoittaa esimerkiksi muodossa 1:100.',
  `Suhde lasketaan kuvapituudesta ${model?String(drawing/10).replace('.',','):drawing} cm ja todellisesta pituudesta ${actualCm} cm. Samanarvoiset suhteet kuvaavat samaa mittakaavaa.`);
}
const ratio=define({
  id:'M-SCALE-01',stop:'Pieni kartta, suuri saari',icon:'⇔',
  intro:'Aava vertailee kartan ja pienoismallin mittoja todellisiin pituuksiin.',
  goal:'Muunnet samat yksiköt ja muodostat mittakaavan.',reward:'Kartta saa oikean mittakaavamerkinnän.',
  produceWhat:'yksikkömuunnosten ja mittakaavasuhteen tuottamista',
  families:{'scale-ratio-map-metres':r=>ratioQuestion(r,false),'scale-ratio-model-millimetres':r=>ratioQuestion(r,true)},
  transfer:r=>ratioQuestion(r,true,true),
  limit:'Molemmat pituudet ja mittakaavan arvo arvioidaan täsmällisesti. Samanarvoiset suhde- ja osamäärämerkinnät käyvät.',
});
function scaleDrawing(r:Rng, small:boolean, transfer=false):Draft {
  const d=transfer?3:small?2:1, n=small||transfer?1:2;
  const source:Point[]=transfer?[[1,1],[7,1],[4,7]]:small?r.pick([
    [[0,1],[4,1],[2,5],[0,3]],[[0,1],[6,1],[4,3]],[[0,1],[4,1],[4,5],[0,5]],[[2,1],[6,3],[2,5],[0,3]],
  ]):r.pick([
    [[1,1],[3,1],[2,3]],[[1,1],[3,1],[3,2],[1,3]],[[1,1],[4,2],[1,3]],[[1,1],[3,1],[3,4],[1,4]],
  ]);
  const start:Point=transfer?[8,8]:[6,5];
  const target=scaled(source,source[0]!,start,n,d);
  return report({...grid(12,source,`Sininen kuvio on alkuperäinen. Aloita uusi kuvio kohdasta ${coord(start)}.`),path:source},[],
    locate(target,true),
    `Tee ${small||transfer?'pienennös':'suurennos'} kertoimella ${n===d?n:d===1?n:`${n}/${d}`}. Lisää uuden kuvion kärjet samassa järjestyksessä kuin A, B, C${source.length===4?' ja D':''}. Säilytä alkuperäisen kuvion suunta.`,
    'Skaalaa jokainen askel vaakaan ja pystyyn samalla kertoimella. Säilytä sivujen järjestys.',
    `Uudet kärjet ovat ${target.map(coord).join(' · ')}. Kaikki vastaavat pituudet muuttuvat samalla kertoimella.`);
}
const scaling=define({
  id:'M-SCALE-02',edition:2,stop:'Saaren kuva vaihtaa kokoa',icon:'⤢',
  intro:'Loikan piirros on liian suuri yhteen karttaan ja liian pieni toiseen. Aava kopioi sen uuteen kokoon.',
  goal:'Rakennat suurennoksen tai pienennöksen, jossa kaikki pituudet muuttuvat samassa suhteessa.',
  reward:'Saaren piirros sopii uuteen karttaan.',produceWhat:'uuden kuvion kaikkien kärkipisteiden rakentamista',
  families:{'scale-draw-enlarge':r=>scaleDrawing(r,false),'scale-draw-reduce':r=>scaleDrawing(r,true)},
  transfer:r=>scaleDrawing(r,true,true),limit:'Tarkistus arvioi kaikki kärjet annetussa kiinnityskohdassa. Piirrosjäljen tarkkuus arvioidaan erikseen.',
});
function rotationQuestion(r:Rng, asymmetric:boolean, transfer=false):Draft {
  const spokes=transfer?[3,6,3,6,3,6]:asymmetric?r.pick([[5,2,6,4],[6,3,5,4]]):r.pick([[6,6,6,6],[5,3,5,3]]);
  const allowed=spokes.map((_,i)=>i*360/spokes.length).slice(1);
  const center:Point=[0,0];
  const matches=allowed.filter(a=>hasRotation(spokes,a));
  return report({kind:'rotation',center,spokes,allowed,labelOffset:r.int(0,2)},[
    choose('same','Onko alle täyden kierroksen sopiva kierto?',{yes:'On',no:'Ei ole'},matches.length?'yes':'no'),
  ],{kind:'rotation',center,spokes,allowed},'Valitse keskipiste. Kokeile alle 360° kiertoja ja tarkista, osuuko koko kuvio mallin päälle.',
  'Pidä keskipiste paikallaan. Jokaisen sakaran pitää osua samanpituisen sakaran kohdalle.',
  matches.length?`Kuvio osuu malliin esimerkiksi kierrolla ${matches[0]}°. Täyttä kierrosta pienempi kierto riittää.`
    :'Mikään kokeiltavista alle täyden kierroksen kierroista ei kohdista kaikkia sakaroita.',
  'Vertaa kaikkia sakaroita. Jos yhtään sopivaa kiertoa ei näy, kokeile kaikki mahdolliset annetut sakaravälit.');
}
const rotation=define({
  id:'M-SYM-02',stop:'Tuulimerkin palaava asento',icon:'⟳',
  intro:'Tuulimerkki kääntyy keskimmäisen kiinnityspisteen ympäri. Aava etsii asennon, jossa koko merkki näyttää samalta.',
  goal:'Testaat kiertosymmetrian alle täydellä kierroksella.',reward:'Tuulimerkin palaavat asennot tunnetaan.',
  families:{'rotation-same-spoke-pattern':r=>rotationQuestion(r,false),'rotation-asymmetric-counterexample':r=>rotationQuestion(r,true)},
  transfer:r=>rotationQuestion(r,false,true),limit:'Tarkistus kattaa määrätyn keskipisteen ja annetut sakaravälit. Muiden kuvioiden yleinen todistus arvioidaan erikseen.',
});
function patternQuestion(r:Rng, backward:boolean, transfer=false):Draft {
  const base:Point[]=r.pick([[[1,2],[1,3],[2,3]],[[1,2],[2,2],[2,3]],[[1,1],[1,3],[2,1]],[[1,1],[2,2],[1,3]]]);
  const shift:Point=transfer?[3,2]:backward?r.pick([[0,2],[0,3]]):r.pick([[3,0],[4,0]]);
  const second=translated(base,shift), third=translated(second,shift);
  const shown=backward?[second,third]:[base,second], target=backward?base:third;
  const vector:Point=backward?[-shift[0],-shift[1]]:shift;
  const position=backward?'edellinen':'seuraava';
  return report({...grid(10,[],'Ikkuna näyttää vain osan toistuvasta rantakaistasta.'),motifs:shown},[
    number('dx','Siirto x-suunnassa (ruutua)',vector[0]),number('dy','Siirto y-suunnassa (ruutua)',vector[1]),
  ],locate(target,true),`Rakenna ${position} kuvio. Lisää pisteet järjestyksessä 1–2–3 ja merkitse siirto molempiin suuntiin.`,
  'Vertaa numeroituja pisteitä. Oikealle ja ylös ovat positiiviset suunnat. Vasemmalle ja alas ovat negatiiviset.',
  `Jokainen piste siirtyy kohti ${position === 'edellinen' ? 'edellistä' : 'seuraavaa'} kuviota vektorilla ${coord(vector)}. Kuvion asento säilyy.`);
}

const pattern=define({
  id:'M-SYM-03',edition:2,stop:'Saman kuvion rantakaista',icon:'⇢',
  intro:'Aava löytää rantakaistan kuviosta saman merkin yhä uudelleen. Kuvasta näkyy vain pieni ikkuna.',
  goal:'Tuotat kuvion jatkon samalla siirtovektorilla.',reward:'Rantakaistan toistuva merkki jatkuu oikein.',
  produceWhat:'kuvion siirron ja molempien koordinaattimuutosten tuottamista',
  families:{'shift-horizontal-window':r=>patternQuestion(r,false),'shift-find-previous-motif':r=>patternQuestion(r,true)},
  transfer:r=>patternQuestion(r,false,true),limit:'Seuraavan merkin kärjet ja koordinaattien siirto arvioidaan. Äärellinen ikkuna kuvaa toistuvaa mallia.',
});
function areaConversion(r:Rng, smaller:boolean, transfer=false):Draft {
  const source=smaller?r.pick([2,3,4]):transfer?r.pick([250,650,950]):r.pick([150,350,450]);
  const from=smaller?'m²':transfer?'dm²':'cm²', to=transfer?'m²':'dm²';
  const result=smaller?String(source*100):`${source}/100`;
  return report({kind:'measure',divisions:10,givens:[
    {label:'Lähtöala',value:`${source} ${from}`},
    {label:'Yksi sivu',value:smaller||transfer?'1 m = 10 dm':'1 dm = 10 cm'},
    {label:'Tulosyksikkö',value:to},
  ],legend:'Kuvassa on yksi isompi yksikköneliö. Sen kaksi suuntaa jakautuvat yhtä suuriin väleihin.'},[
    number('x','Pieniä välejä vaakaan',10),number('y','Pieniä välejä pystyyn',10),
    number('factor','Pieniä ruutuja yhdessä isossa',100),number('area','Muunnettu pinta-ala',result),
    choose('unit','Vastauksen yksikkö',{sqm:'m²',sqdm:'dm²',sqcm:'cm²',length:'dm'},transfer?'sqm':'sqdm'),
  ],undefined,'Tarkista neliön jakautuminen kummassakin suunnassa. Kirjoita pinta-alakerroin, muunnettu arvo ja yksikkö.',
  'Yhden sivun kerroin näkyy myös toisessa suunnassa. Kerro ruudut yhteen: 10 kertaa 10.',
  `Isommassa neliössä on 100 pienempää ruutua. Tässä ${smaller?'kerrotaan':'jaetaan'} pinta-ala sadalla, joten tulos on ${(smaller?source*100:source/100).toString().replace('.',',')} ${to}.`);
}
const conversion=define({
  id:'M-GMEAS-06',stop:'Suuri ruutu, monta pientä',icon:'⊞',
  intro:'Loikka löytää suuresta ruudusta monta pienempää. Aava tutkii määrää sekä sivulla että koko pinnalla.',
  goal:'Muunna pinta-ala kahden akselin yksikköjaon avulla.',reward:'Sama pinta saa oikean merkinnän uudessa yksikössä.',
  produceWhat:'molempien akselien, pinta-alakertoimen ja tuloksen tuottamista',
  families:{'area-unit-smaller-units':r=>areaConversion(r,true),'area-unit-larger-units':r=>areaConversion(r,false)},
  transfer:r=>areaConversion(r,false,true),limit:'Tarkistus kattaa molemmat akselit, pinta-alakertoimen, tarkan muunnetun arvon ja yksikön.',
});

const entries=[point,segment,straight,angleProperties,drawing,angles,protractor,cover,volume,composite,ratio,scaling,rotation,pattern,conversion];
export const spatialMeasureSpecs: NodeSpec[]=entries.map(entry=>entry.spec);
export const spatialMeasureEvidence: Readonly<Record<string,{families:readonly string[];limit:string}>>=
  Object.fromEntries(entries.map(entry=>[entry.spec.id,entry.evidence]));
