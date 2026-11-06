import type {Rng} from '../engine/rng';
import type {Item,NodeSpec,Task} from '../engine/types';
import {cases} from './kit';
import {inquiryIslandsPaint,inquiryIslandsWorkedPaint,inquiryInstruction} from './scenes/inquiry-islands';
import {inquiryIslandsScene} from './models/inquiry-islands-scene';
import {
 inquiryRead,inquiryTerrainRoute,inquiryModelWitness,inquiryModelPath,inquiryMembership,validInquiryConfiguration,
 type InquiryIslandsTask,type InquiryReview,type InquiryImage,type InquiryFeature,type InquirySample,type InquiryProperty,type InquiryRule,
 type InquirySetup,type InquiryConfiguration,type InquiryVariable,type InquiryOutcome,type InquiryTerrain,type InquiryModelObservation,
 type InquiryModelTask,type InquiryModelBoard,type InquiryDataRow,type InquiryDirection,type InquiryStep,
} from './models/inquiry-islands';

type Draft=Omit<Item,'tag'>&{sceneModel?:ReturnType<typeof inquiryIslandsScene>};
type Factory=(r:Rng)=>InquiryIslandsTask;
const kind='inquiry-islands' as const;
const THREE_D=new Set(['ENV-PHY-CAUSE-MOTION-01','SCI-ENV-CAUSE-01','SCI-ENV-EXP-01','SCI-ENV-MODEL-01','SCI-ENV-MODEL-CREATE-01','SCI-ENV-MODEL-REVISE-01','SCI-ENV-MODEL-02']);

function review(prompt:string,model:string,evidence:string):InquiryReview{
 return {prompt,rubric:[{id:'evidence',label:'Käyttää omaa havaintoa tai tulosta',guide:evidence},{id:'limit',label:'Rajaa päätelmän tähän aineistoon',guide:'Erottaa havainnon arvauksesta ja kertoo, että päätelmä koskee tätä mallia, näitä näytteitä tai tätä kuvaa.'}],model};
}
/** The run id is derived from the scientific content, so equal situations share it and different ones never do. */
function finish<T extends InquiryIslandsTask>(task:T):T{
 const {run:_run,title:_title,review:_review,...scientific}=task;const text=JSON.stringify(scientific);let hash=2166136261;
 for(const c of text){hash^=c.charCodeAt(0);hash=Math.imul(hash,16777619);}
 return {...task,run:`inquiry-${(hash>>>0).toString(16)}`};
}

// ------------------------------------------------------------------ observing and describing (SCI01)
const imageWords:Record<InquiryImage['type'],{one:string;gen:string;many:string;shape:'circle'|'oval'|'line';guesses:readonly string[]}>={
 'sand-print':{one:'painauma',gen:'painauman',many:'painaumaa',shape:'oval',guesses:['Lokki kävi rannalla aamulla.','Loikka hyppi tästä ohi.','Joku halusi pelotella meitä.']},
 wave:{one:'aallonharja',gen:'aallonharjan',many:'aallonharjaa',shape:'line',guesses:['Vene ajoi juuri ohi.','Tuuli on vihainen.','Kala hyppäsi pinnalle.']},
 shadow:{one:'varjo',gen:'varjon',many:'varjoa',shape:'oval',guesses:['Pilvi on jäänyt paikalleen.','Kala ui lumpeen alla.','Joku piiloutui sinne.']},
 watermark:{one:'märkä läikkä',gen:'märän läikän',many:'märkää läikkää',shape:'circle',guesses:['Sade alkoi yöllä.','Sisi kantoi vettä.','Kivi on surullinen.']},
 'leaf-mark':{one:'lehden jälki',gen:'lehden jäljen',many:'lehden jälkeä',shape:'line',guesses:['Toukka söi lehteä.','Tuuli repi lehden.','Lehti halusi lähteä.']},
};
const placeWords={left:'kuvan vasemmassa reunassa',middle:'kuvan keskellä',right:'kuvan oikeassa reunassa'} as const;
const directionWords:Record<InquiryDirection,string>={left:'vasemmalle',right:'oikealle',straight:'suoraan ylöspäin',back:'alaspäin',stopped:'yhteen kohtaan'};
function observe(r:Rng,type:InquiryImage['type'],skill:'describe'|'observe-describe',required:number,title:string,explained=true):InquiryIslandsTask{
 const words=imageWords[type],count=r.int(2,5),place=r.pick(['left','middle','right'] as const),direction=r.pick(['left','right','straight'] as const),surface=r.pick(['smooth','rough'] as const),size=r.int(1,4);
 const x0=place==='left'?40:place==='middle'?120:200,step=direction==='left'?-14:direction==='right'?14:0;
 const marks=Array.from({length:count},(_,i)=>({id:`m${i+1}`,position:{x:x0+step*i,y:direction==='straight'?78-i*14:62-(i%2)*6},shape:words.shape,width:size*6,height:size*4,count,direction,surface}));
 const changed=type==='watermark'||type==='wave';
 const before=changed?marks.map(m=>({id:m.id,position:type==='wave'?{x:m.position.x-10,y:m.position.y}:m.position,width:Math.max(3,m.width-6),height:Math.max(2,m.height-4)})):undefined;
 const fact=(property:InquiryFeature['property'],value:string,label:string,observable=true):Omit<InquiryFeature,'id'>=>({mark:'m1',property,value,label,observable});
 const facts=[
  fact('position',place,`${words.one[0]!.toUpperCase()}${words.one.slice(1)} on ${placeWords[place]}.`),
  fact('count',String(count),`Kuvassa on ${count} ${words.many}.`),
  fact('size',String(size),`Jokainen ${words.one} on noin ${size} cm leveä.`),
  fact('direction',direction,`Rivi jatkuu ${directionWords[direction]}.`),
  fact('surface',surface,surface==='rough'?`${words.gen[0]!.toUpperCase()}${words.gen.slice(1)} reuna on karhea.`:`${words.gen[0]!.toUpperCase()}${words.gen.slice(1)} reuna on sileä.`),
  ...(changed?[fact('change',type==='wave'?'moved':'spread',type==='wave'?'Harjat siirtyivät oikealle ennen–jälkeen-kuvien välillä.':'Läikät kasvoivat ennen–jälkeen-kuvien välillä.')]:[]),
  // Guesses and wrong counts look like observations but cannot be seen in this picture.
  ...r.shuffle(words.guesses).slice(0,2).map(g=>fact('change','cause',g,false)),
  fact('count',String(count+1),`Kuvassa on ${count+1} ${words.many}.`,false),
  fact('surface',surface==='rough'?'smooth':'rough',surface==='rough'?`Reuna on täysin sileä.`:`Reuna on rosoinen kuin saha.`,false),
 ];
 const features:InquiryFeature[]=r.shuffle(facts).map((f,i)=>({...f,id:`F${i+1}`}));
 return finish({kind,mode:'observe',skill,title,run:'',image:{type,width:240,height:100,marks,...(before?{before}:{})},features,required,
  ...(explained?{review:review('Kerro aikuiselle omin sanoin, mitä kuvassa näkyy. Kerro myös, mitä kuvasta ei voi tietää.','Kuvassa näkyvät määrä, paikka, koko, suunta ja pinta. Jäljen tekijä tai tarkoitus ei näy kuvasta, joten se jää avoimeksi.','Kuvailee vähintään kaksi kuvassa näkyvää eri piirrettä niin, että toinen löytää saman kohteen.')}:{})});
}

// ------------------------------------------------------------------ comparing and classifying (SCI01)
const sampleKinds={stone:{colours:['grey','brown'] as const},leaf:{colours:['green','brown'] as const},shell:{colours:['grey','brown'] as const},material:{colours:['grey','green','brown'] as const}};
function sample(r:Rng,id:string,k:InquirySample['kind']):InquirySample{
 const material=k==='material';
 return {id,kind:k,length:r.int(2,11),width:r.int(1,5),colour:r.pick(sampleKinds[k].colours),surface:r.pick(['smooth','rough'] as const),floats:k==='leaf'?r.chance(.75):k==='stone'?r.chance(.15):r.chance(.5),bend:material?r.int(0,3):0,transparent:material?r.chance(.4):false};
}
function rulesFor(samples:readonly InquirySample[],properties:readonly InquiryProperty[]):InquiryRule[]{
 const rules:InquiryRule[]=[];
 for(const property of properties){
  const values=samples.map(s=>s[property]);
  if(typeof values[0]==='number'){
   const sorted=[...new Set(values as number[])].sort((a,b)=>a-b);if(sorted.length<2)continue;
   rules.push({property,operator:'at-least',value:String(sorted[Math.floor(sorted.length/2)])});
  }else{
   const first=String(values[0]);if(values.every(v=>String(v)===first))continue;
   rules.push({property,operator:'equal',value:property==='floats'||property==='transparent'?'true':first});
  }
 }
 return rules.filter(rule=>{const groups=samples.map(s=>inquiryMembership(s,rule));return groups.includes(0)&&groups.includes(1);});
}
function compare(r:Rng,skill:'compare'|'classify'|'compare-classify',k:InquirySample['kind'],title:string):InquiryIslandsTask{
 const properties:InquiryProperty[]=k==='material'?['length','bend','transparent','floats']:k==='stone'?['length','width','colour','surface','floats']:['length','width','colour','surface','floats'];
 for(let attempt=0;attempt<40;attempt++){
  const samples=Array.from({length:skill==='compare'?4:r.int(4,6)},(_,i)=>sample(r,String.fromCharCode(65+i),k)),boundary=sample(r,'U',k),rules=rulesFor(samples,properties);
  const pair:[string,string]=[samples[0]!.id,samples[r.int(1,samples.length-1)]!.id];
  if(skill!=='compare'&&rules.length<2)continue;
  if(new Set(samples.map(s=>JSON.stringify({...s,id:''}))).size<samples.length)continue;
  return finish({kind,mode:'compare',skill,title,run:'',samples,boundary,pair,properties,rules:skill==='compare'?[]:rules});
 }
 throw new Error('Inquiry samples need at least two dividing rules.');
}

// ------------------------------------------------------------------ investigation setups (SCI02, SCI03)
const keysOf=(c:InquiryConfiguration)=>Object.keys(c).filter(k=>k!=='kind') as InquiryVariable[];
function setup(name:string,initial:[InquiryConfiguration,InquiryConfiguration],variables:InquiryVariable[],outcomes:InquiryOutcome[],values:InquirySetup['values'],seconds:number,scope:string):InquirySetup{
 return {name,kind:initial[0].kind,initial,variables,controlVariables:keysOf(initial[0]),outcomes,values,seconds,scope};
}
function vary<T extends InquiryConfiguration>(r:Rng,base:T,variable:keyof T&InquiryVariable,options:readonly (string|number|boolean)[]):T{
 const other=options.filter(v=>v!==base[variable]);return {...base,[variable]:r.pick(other)};
}
function sailSetup(r:Rng,change?:'wind'|'area'):InquirySetup{
 const a={kind:'sail' as const,wind:r.int(0,2),area:r.int(1,2),mass:r.int(1,3),initialSpeed:r.int(1,2)},values={wind:[0,1,2,3],area:[1,2,3]};
 const b=change?vary(r,a,change,values[change]):{...a};
 return setup('Lehtivene ja koepuhallin',[a,b],['wind','area'],['side-displacement','turn'],values,r.int(2,4),'Annettu poikittaisen vakiotyönnön malli: x on eteenpäin ja y oikealle. Ei koske oikeaa tuulta tai aaltoja.');
}
function wheelSetup(r:Rng,change?:'gate'|'flow',confound=false):InquirySetup{
 const drag=r.int(1,2),a={kind:'wheel' as const,gate:true,flow:r.int(drag+1,4),drag},values={gate:[true,false],flow:[1,2,3,4],drag:[1,2,3]};
 let b=change?vary(r,a,change,values[change]):{...a};
 if(confound)b={...b,gate:false,flow:a.flow===4?3:a.flow+1};
 return setup('Sivu-uoman vesipyörä',[a,b],['gate','flow','drag'],['wheel-speed'],values,r.int(2,4),'Ilmoitettu vaimennettu pyörämalli, jota luetaan kokonaisina sekunteina. Ei kuvaa koko virtausfysiikkaa.');
}
function shadowSetup(r:Rng,change?:'lampX'|'height'):InquirySetup{
 const lampY=r.pick([5,7,9]),a={kind:'shadow' as const,height:r.int(1,3),lampX:r.pick([-6,-4,-2,2,4,6]),lampY},values={lampX:[-6,-4,-2,2,4,6],height:[1,2,3]};
 const b=change?vary(r,a,change,values[change]):{...a};
 return setup('Lyhty ja ruokokeppi',[a,b],['lampX','height'],['shadow-length'],values,0,'Pistemäisen lyhdyn suoran säteen malli tasaisella hiekalla.');
}
function absorbSetup(r:Rng,change?:'material'|'area'):InquirySetup{
 const seconds=r.int(3,6),a={kind:'absorb' as const,material:r.pick(['cloth','paper'] as const),area:r.int(1,2),water:r.int(6,12),seconds},values={material:['cloth','paper','plastic'],area:[1,2,3]};
 const b=change?vary(r,a,change,values[change]):{...a};
 return setup('Kaksi imupalaa',[a,b],['material','area'],['absorbed'],values,seconds,'Annettu imukykymalli: kangas 3 ml ja paperi 2 ml pinta-alaruutua kohden, enintään 1 ml sekunnissa.');
}
function motionSetup(r:Rng,change:'forceY'|'forceX'|'surface'|'none'):InquirySetup{
 const a={kind:'motion' as const,forceX:0,forceY:0,mass:r.int(1,3),initialVX:r.int(1,3),initialVY:0,surface:'smooth' as const,retardation:r.int(1,2)};
 const values={forceY:[-2,-1,0,1,2],forceX:[0,1,2],surface:['smooth','rough'],mass:[1,2,3]};
 let b:InquiryConfiguration={...a};
 if(change==='forceY')b={...a,forceY:r.pick([-2,-1,1,2])};
 else if(change==='forceX')b={...a,forceX:r.int(1,2)};
 else if(change==='surface')b={...a,surface:'rough'};
 else b={...a,mass:a.mass===3?2:a.mass+1};
 const seconds=change==='surface'?Math.ceil(a.initialVX/a.retardation)+r.int(0,1):r.int(2,4);
 return setup('Tuulen ja veden kelluva kiekko',[a,b],['forceY','forceX','surface','mass'],['forward-displacement','turn'],values,seconds,'Rajattu vaakatasomalli: sileällä vedellä ei ole kitkaa, karhealla kaislikolla on ilmoitettu tasainen jarrutus. Ei koske oikeita virtauksia.');
}
const readable=(s:InquirySetup)=>s.initial.every(c=>validInquiryConfiguration(c)&&!!inquiryRead(c,'A',s.seconds));
function question(r:Rng,make:(r:Rng)=>InquirySetup,title:string):InquiryIslandsTask{
 const s=make(r);
 return finish({kind,mode:'question',title,run:'',setup:s,questionContexts:s.variables.map(variable=>({variable,outcomes:s.outcomes}))});
}
function plan(r:Rng,make:(r:Rng)=>InquirySetup,title:string,repeats=2):InquiryIslandsTask{
 return finish({kind,mode:'plan',title,run:'',setup:make(r),minimumRepeats:repeats});
}
const experimentSequence:readonly InquiryStep[]=['configure','predict','place','start','observe','record','reset','repeat'];
function experiment(r:Rng,skill:'execute'|'cause'|'motion',activity:'guided'|'controlled'|'repair-confound',make:(r:Rng)=>InquirySetup,title:string,explained:boolean):InquiryIslandsTask{
 for(let attempt=0;attempt<20;attempt++){
  const s=make(r);if(!readable(s))continue;
  const repeats=skill==='execute'?2:1;
  return finish({kind,mode:'experiment',skill,activity,title,run:'',setup:s,minimumRepeats:repeats,...(skill==='execute'?{givenSequence:experimentSequence}:{}),
   ...(explained?{review:skill==='motion'
    ?review('Selitä aikuiselle, miksi kiekon liike pysyi samana tai muuttui.','Kun kokonaisvoima on nolla, liike jatkuu samalla vauhdilla ja suunnalla. Sivuttainen työntö muuttaa suuntaa, eteenpäin työntö vauhtia ja karhea pinta pysäyttää.','Yhdistää oman kokeen kahden kiekon havaitun eron yhteen muutettuun voimaan tai pintaan. Erottaa vauhdin ja suunnan muutoksen.')
    :review('Selitä aikuiselle, mikä muutos aiheutti eron tässä mallissa ja miten tiesit sen.','Kun vain yksi tekijä muuttuu ja muut pysyvät samoina, tuloksen ero voidaan liittää siihen tekijään tässä mallissa. Pelkkä samanaikaisuus ei riitä syyksi.','Nimeää oman vertailun ainoan muuttuneen tekijän ja käyttää molempien kokeiden havaintoja.')}:{})});
 }
 throw new Error('Inquiry experiment needs a readable setup.');
}

// ------------------------------------------------------------------ models (SCI02)
const correspondences={
 terrain:[{id:'mound',real:'Korkea hiekkakumpu',model:'high-cell'},{id:'hollow',real:'Matala kuoppa',model:'low-cell'},{id:'leaf',real:'Lehden kulkema matka',model:'path-line'}],
 'channel-map':[{id:'trough',real:'Läpinäkyvä kouru',model:'link'},{id:'dam',real:'Majavan risupato',model:'barrier'},{id:'pond',real:'Pesäallas',model:'terminal'}],
 'shadow-ray':[{id:'lamp',real:'Lyhty',model:'lamp'},{id:'pole',real:'Ruokokeppi',model:'pole'},{id:'tip',real:'Varjon kärki',model:'ground-point'}],
} as const;
const missing={terrain:['real-weather','water-amount'],'channel-map':['water-amount','real-weather'],'shadow-ray':['light-colour','real-weather']} as const;
const routeObservation=(id:string,start:string,terrain:InquiryTerrain,label:string):InquiryModelObservation|undefined=>{const path=inquiryTerrainRoute(terrain,start);return path&&path.length>=2?{id,query:{kind:'terrain',start},path,calm:null,feed:null,label}:undefined;};
function randomTerrain(r:Rng):InquiryTerrain{
 const width=4,height=3;
 return {width,height,cells:Array.from({length:width*height},(_,i)=>({id:`c${i+1}`,x:i%width,y:Math.floor(i/width),height:Math.min(6,Math.max(0,6-(i%width)-Math.floor(i/width)+r.int(-2,1))),blocked:false}))};
}
/** Every height assignment of the open cells that fits the evidence gives the same probe route; the probe is not a guess. */
function determined(board:Extract<InquiryModelBoard,{kind:'terrain'}>,constraints:readonly InquiryModelObservation[],probe:InquiryModelObservation,barrier?:string):boolean{
 const open=board.template.cells.filter(c=>!board.fixedHeights.some(f=>f.id===c.id));if(open.length>4)return false;
 let found=0;
 const assignment=new Map<string,number>();
 const visit=(i:number):boolean=>{
  if(i===open.length){
   const terrain:InquiryTerrain={...board.template,cells:board.template.cells.map(c=>({...c,blocked:c.id===barrier,height:board.fixedHeights.find(f=>f.id===c.id)?.height??assignment.get(c.id)!}))};
   if(!constraints.every(o=>o.query.kind==='terrain'&&JSON.stringify(inquiryTerrainRoute(terrain,o.query.start))===JSON.stringify(o.path)))return true;
   found++;return probe.query.kind==='terrain'&&JSON.stringify(inquiryTerrainRoute(terrain,probe.query.start))===JSON.stringify(probe.path);
  }
  for(let h=0;h<=6;h++){assignment.set(open[i]!.id,h);if(!visit(i+1))return false;}
  return true;
 };
 return visit(0)&&found>0;
}
function terrainModel(r:Rng,skill:'use'|'create'|'revise'|'integrate',title:string,explained:boolean):InquiryIslandsTask{
 for(let attempt=0;attempt<200;attempt++){
  const truth=randomTerrain(r),starts=r.shuffle(truth.cells.map(c=>c.id));
  const observations:InquiryModelObservation[]=[];
  for(const start of starts){
   const o=routeObservation(observations.length?'B':'A',start,truth,'Annettu lehden reitti');
   if(o&&o.path.length>=3&&!observations.some(p=>p.path.includes(start)))observations.push(o);
   if(observations.length===2)break;
  }
  if(observations.length<2)continue;
  const onPaths=[...new Set(observations.flatMap(o=>o.path.slice(1)))];
  const openCells=skill==='use'?[]:r.shuffle(onPaths).slice(0,skill==='create'?3:2);
  const template:InquiryTerrain={...truth,cells:truth.cells.map(c=>({...c,height:0}))};
  const board:Extract<InquiryModelBoard,{kind:'terrain'}>={kind:'terrain',template,fixedHeights:truth.cells.filter(c=>!openCells.includes(c.id)).map(c=>({id:c.id,height:c.height}))};
  let newFeature:string|undefined,newObservation:InquiryModelObservation|undefined,probe:InquiryModelObservation|undefined,world=truth;
  if(skill==='revise'||skill==='integrate'){
   // The stone falls outside the old routes, so the corrected model can still explain every old observation.
   const used=new Set(observations.flatMap(o=>o.path)),candidates=r.shuffle(truth.cells.map(c=>c.id).filter(id=>!used.has(id)));
   const moved=(o:InquiryModelObservation|undefined,changed:InquiryTerrain)=>!!o&&o.query.kind==='terrain'&&o.path.length>=2&&JSON.stringify(o.path)!==JSON.stringify(inquiryTerrainRoute(truth,o.query.start))&&!!inquiryTerrainRoute(changed,o.query.start);
   for(const blocked of candidates){
    const changed:InquiryTerrain={...truth,cells:truth.cells.map(c=>c.id===blocked?{...c,blocked:true}:c)};
    const fresh=starts.filter(s=>s!==blocked).map(s=>routeObservation('C',s,changed,'Uusi havainto: kivi on pudonnut uomaan')).find(o=>moved(o,changed));
    if(!fresh||fresh.query.kind!=='terrain')continue;
    const freshStart=fresh.query.start;
    const test=starts.filter(s=>s!==blocked&&s!==freshStart&&!observations.some(x=>x.query.kind==='terrain'&&x.query.start===s)).map(s=>routeObservation('P',s,changed,'Ennustettava uusi lähtöpaikka')).find(o=>moved(o,changed));
    if(!test)continue;
    newFeature=blocked;newObservation=fresh;probe=test;world=changed;break;
   }
   if(!newObservation||!probe||!determined(board,[...observations,newObservation],probe,newFeature))continue;
  }else{
   probe=starts.map(s=>routeObservation('P',s,truth,'Ennustettava uusi lähtöpaikka')).find(o=>o&&o.query.kind==='terrain'&&!observations.some(x=>x.query.kind==='terrain'&&o.query.kind==='terrain'&&(x.query.start===o.query.start||JSON.stringify(x.path)===JSON.stringify(o.path))));
   if(!probe||!determined(board,observations,probe))continue;
  }
  void world;
  const task:InquiryModelTask={mode:'model',skill,board,observations,...(newObservation?{newObservation,newFeature}:{}),correspondences:[...correspondences.terrain],missingFeatures:[...missing.terrain],probe:probe!,scope:'Lasilaatikon kuularadan ilmoitettu sääntö: lehti siirtyy aina matalimpaan viereiseen ruutuun; tasapelissä järjestys on itä, etelä, länsi, pohjoinen.'};
  if(!inquiryModelWitness(task,false)||(newObservation&&!inquiryModelWitness(task,true)))continue;
  return finish({kind,title,run:'',...task,...(explained?{review:modelReview(skill)}:{})});
 }
 throw new Error('No terrain model situation was found.');
}
function modelReview(skill:InquiryModelTask['skill']):InquiryReview{
 return review(skill==='use'?'Selitä aikuiselle mallin avulla, mihin uusi lehti kulkee ja miksi.':'Kerro aikuiselle, miten mallisi vastaa havaintoja ja mitä muutit uuden havainnon jälkeen.',
  'Malli kuvaa vain sen, mitä havainnot kertovat: korkeuserot, kourut tai suoran valonsäteen. Uusi havainto voi vaatia mallin korjaamista, mutta vanhat havainnot on edelleen selitettävä.',
  skill==='use'?'Näyttää oman mallin reitin ja nimeää todellisen asian, jota mallin osa vastaa.':'Vertaa vanhaa ennustetta uuteen havaintoon ja näyttää, mikä mallin muutos selittää molemmat.');
}
function channelModel(r:Rng,title:string,explained:boolean):InquiryIslandsTask{
 const ports=['S','A','B','C','D','P','F'].map((id,i)=>({id,x:[0,1,2,2,3,3,4][i]!,y:[1,1,0,2,1,0,2][i]!}));
 const dam=r.pick(['B','C'] as const),openPath=r.chance(.5)?['S','A','B','P']:['S','A','C','F'],closedPath=openPath.includes('B')?['S','A','C','F']:['S','A','B','P'];
 // After the dam the water either detours straight from the fork or through the other open channel; both need a different map revision.
 const viaOther=r.chance(.5),fresh=dam==='B'?(viaOther?['S','A','C','D','P']:['S','A','D','P']):(viaOther?['S','A','B','D','F']:['S','A','D','F']);
 const toPond=(path:readonly string[])=>path.at(-1)==='P';
 const observations:InquiryModelObservation[]=[
  {id:'A',query:{kind:'channel-map',condition:'open'},path:openPath,calm:!toPond(openPath),feed:!toPond(openPath),label:'Luukku auki'},
  {id:'B',query:{kind:'channel-map',condition:'closed'},path:closedPath,calm:!toPond(closedPath),feed:!toPond(closedPath),label:'Luukku kiinni'},
 ];
 // Calm and feed are given observation data on the cards, not derived from flow physics.
 const newObservation:InquiryModelObservation={id:'C',query:{kind:'channel-map',condition:'new'},path:fresh,calm:!toPond(fresh),feed:!toPond(fresh),label:`Majava rakensi padon kohtaan ${dam}`};
 const probe:InquiryModelObservation={id:'P',query:{kind:'channel-map',condition:'new'},path:fresh,calm:null,feed:null,label:'Ennustettava reitti padon jälkeen'};
 const task:InquiryModelTask={mode:'model',skill:'integrate',board:{kind:'channel-map',ports,start:'S',terminals:['P','F']},observations,newObservation,newFeature:dam,correspondences:[...correspondences['channel-map']],missingFeatures:[...missing['channel-map']],probe,scope:'Kahden uoman kourumalli: rauhallisuus ja veden saapuminen putoukselle ovat annettuja havaintotietoja.'};
 return finish({kind,title,run:'',...task,...(explained?{review:modelReview('integrate')}:{})});
}
function shadowModel(r:Rng,skill:InquiryModelTask['skill'],title:string,explained:boolean):InquiryIslandsTask{
 // Integer cases where the straight ray lands exactly on a marked ground point.
 const pool=[{lampX:-4,lampY:5,poleHeight:1},{lampX:-6,lampY:4,poleHeight:2},{lampX:-2,lampY:3,poleHeight:1},{lampX:4,lampY:5,poleHeight:1},{lampX:6,lampY:4,poleHeight:2},{lampX:2,lampY:3,poleHeight:1},{lampX:-3,lampY:4,poleHeight:1},{lampX:3,lampY:4,poleHeight:1},{lampX:-8,lampY:5,poleHeight:1},{lampX:8,lampY:5,poleHeight:1},{lampX:-6,lampY:3,poleHeight:1},{lampX:6,lampY:3,poleHeight:1}];
 const ground=(c:{lampX:number;lampY:number;poleHeight:number})=>-c.lampX*c.poleHeight/(c.lampY-c.poleHeight);
 for(let attempt=0;attempt<600;attempt++){
  const chosen=r.shuffle(pool).slice(0,4).map((c,i)=>({...c,id:`k${i+1}`}));
  const g=chosen.map(ground);if(new Set(g).size<3)continue;
  const revise=skill==='revise'||skill==='integrate';
  // Old evidence for a revision fits a single fixed length; the new case breaks it.
  if(revise&&g[0]!==g[1])continue;
  if(!revise&&g[0]===g[1])continue;
  const obs=(c:typeof chosen[number],id:string,label:string):InquiryModelObservation=>({id,query:{kind:'shadow-ray',caseId:c.id},path:[`lamp-${c.id}`,`pole-${c.id}`,`ground:${ground(c)}`],calm:null,feed:null,label});
  const observations=[obs(chosen[0]!,'A','Havaittu varjo'),obs(chosen[1]!,'B','Havaittu varjo')];
  const candidates=[...new Set([...g,0,...g.map(v=>-v)])].sort((a,b)=>a-b).filter(v=>v>=-16&&v<=16);
  const task:InquiryModelTask={mode:'model',skill,board:{kind:'shadow-ray',cases:chosen.map(({id,lampX,lampY,poleHeight})=>({id,lampX,lampY,poleHeight})),groundCandidates:candidates},observations,
   ...(revise?{newObservation:obs(chosen[2]!,'C','Uusi havainto: lyhty siirrettiin'),newFeature:'point-lamp'}:{}),correspondences:[...correspondences['shadow-ray']],missingFeatures:[...missing['shadow-ray']],probe:obs(chosen[3]!,'P','Ennustettava uusi lyhdyn paikka'),scope:'Pistemäinen lyhty, pystysuora keppi ja tasainen hiekka. Valo kulkee suoraan.'};
  if(!inquiryModelWitness(task,false)||(revise&&!inquiryModelWitness(task,true)))continue;
  if(revise){const old=inquiryModelWitness(task,false)!;if(JSON.stringify(inquiryModelPath(old,task.probe.query,task.board))===JSON.stringify(task.probe.path))continue;}
  return finish({kind,title,run:'',...task,...(explained?{review:modelReview(skill)}:{})});
 }
 throw new Error('No shadow model situation was found.');
}

// ------------------------------------------------------------------ data and conclusions (SCI02)
function conclusion(r:Rng,variant:'clear'|'overlap'|'few'|'mixed',quantity:'length'|'temperature',title:string):InquiryIslandsTask{
 const temp=quantity==='temperature',unit:InquiryDataRow['unit']=temp?'°C':'cm',base=temp?r.int(12,16):r.int(4,8),gap=r.int(2,4),high=r.chance(.5)?'A':'B';
 const values=(g:'A'|'B')=>Array.from({length:3},(_,i)=>variant==='overlap'?base+[0,gap,1][i]!+(g==='A'?i%2:1-i%2):base+(g===high?gap+1:0)+[0,1,0][i]!+r.int(0,1));
 const rows:InquiryDataRow[]=[];
 for(const g of ['A','B'] as const)for(const [i,v]of values(g).entries()){
  const mm=variant==='mixed'&&!temp&&i===1;
  rows.push({id:`${g}${i+1}`,group:g,value:mm?v*10:v,unit:mm?'mm':unit,sameMethod:!(variant==='few'&&g===high&&i===2)});
 }
 return finish({kind,mode:'evidence',skill:'conclusion',title,run:'',quantity,rangeUnit:temp?'°C':'cm',rows,minimumRepeats:3,expectedRange:temp?[0,30]:[0,20],scope:temp?'Kahden altaan kolme mittausta kummastakin, sama lämpömittari.':'Kuuden taimen pituudet kahdelta paikalta, samalla viivaimella mitattuna ellei toisin kerrota.',
  review:review('Kerro aikuiselle, mitä nämä mittaukset osoittavat ja miksi johtopäätöksesi on rajattu.','Johtopäätös tehdään kaikista samalla tavalla mitatuista tuloksista. Jos ryhmien tulokset menevät päällekkäin tai toistoja on liian vähän, tulos jää epävarmaksi.','Käyttää kaikkia samalla menetelmällä mitattuja rivejä ja huomioi päällekkäisyyden tai puuttuvat toistot.')});
}
function evaluate(r:Rng,variant:'error'|'outlier',quantity:'length'|'temperature',title:string):InquiryIslandsTask{
 const temp=quantity==='temperature',count=r.int(5,6),base=temp?r.int(13,17):r.int(18,30),suspect=`R${r.int(1,count)}`;
 const rows:InquiryDataRow[]=Array.from({length:count},(_,i)=>{
  const id=`R${i+1}`,v=base+r.int(-2,2);
  if(id!==suspect)return {id,group:'A',value:v,unit:temp?'°C':'mm',sameMethod:true,confirmed:v};
  const recorded=temp?(variant==='error'?Number(String(v).split('').reverse().join(''))+(String(v).split('').reverse().join('')===String(v)?20:0):v+r.int(8,11)):variant==='error'?v*10:v*2+r.int(2,6);
  return {id,group:'A',value:recorded,unit:temp?'°C':'mm',sameMethod:true,confirmed:variant==='error'?v:recorded};
 });
 return finish({kind,mode:'evidence',skill:'evaluate',title,run:'',quantity,rangeUnit:temp?'°C':'mm',rows,minimumRepeats:3,expectedRange:temp?[5,25]:[10,40],suspect,scope:temp?'Saman kalliolammikon pintaveden mittaukset samana iltapäivänä.':'Rantaviivalta kerättyjen pikkusimpukoiden pituudet.',
  review:review('Kerro aikuiselle, miksi tarkistit poikkeavan tuloksen ja miksi korjasit tai säilytit sen.','Poikkeava tulos tarkistetaan ennen kuin sitä korjataan. Kirjausvirhe korjataan tarkistettuun arvoon; tarkistuksessa vahvistunut poikkeama säilytetään aineistossa.','Nimeää poikkeavan rivin, vertaa sitä muihin ja perustelee korjauksen tai säilyttämisen uudelleenmittauksella.')});
}

// ------------------------------------------------------------------ specs
function draft(id:string,factory:Factory,r:Rng):Draft{
 const task=factory(r),say=inquiryInstruction(task);
 return {task:task as unknown as Task,scene:inquiryIslandsPaint(task),...(THREE_D.has(id)?{sceneModel:inquiryIslandsScene(task)}:{}),say,
  hint:'Sulan apu: katso ensin, mitä todella näkyy tai mitä mittaus kertoo. Muuta kokeessa yhtä asiaa kerrallaan ja pidä muut samoina.',
  explain:'Havainto kertoo, mitä näkyy. Selitys ja malli tulevat vasta havaintojen jälkeen, ja ne koskevat tätä aineistoa tai tätä mallia.',
  afterCorrect:inquiryIslandsWorkedPaint(task)};
}
function spec(id:string,stop:string,icon:string,intro:string,goal:string,reward:string,a:readonly [string,Factory],b:readonly [string,Factory],transfer:Factory,rev=`inquiry-islands-${id.toLowerCase()}-v1`):NodeSpec{
 return {id,stop,icon,intro,goal,reward,rev,validRevs:[rev],produce:[a[0],b[0]],produceWhat:'oma havainto, vertailu, kysymys, koesuunnitelma, kokeen toteutus, malli tai aineistoon rajattu johtopäätös sekä tarvittaessa aikuisen havaitsema oma perustelu',
  demo:r=>{const task=a[1](r);return [{scene:inquiryIslandsPaint(task),...(THREE_D.has(id)?{sceneModel:inquiryIslandsScene(task)}:{}),say:goal},{scene:inquiryIslandsWorkedPaint(task),say:'Aava näyttää yhden mahdollisen ratkaisun. Oma tutkimuksesi tehdään uudessa tilanteessa.'}];},
  item:cases({[a[0]]:r=>draft(id,a[1],r),[b[0]]:r=>draft(id,b[1],r)},r=>draft(id,transfer,r))};
}
export const inquiryIslandsSpecs:NodeSpec[]=[
 spec('SCI-ENV-OBS-01','Kuka kävi rantapolulla?','👣','Loikka keksii heti, kuka rannalla kävi. Aava ehdottaa, että katsotaan ensin.','Tee havainto kuvasta ja kuvaile näkyvät piirteet ilman arvausta tekijästä.','Rantapolun jäljet saavat tarkan kuvauksen retkivihkoon.',['sand-prints',r=>observe(r,'sand-print','observe-describe',2,'Rantapolun painaumat')],['wet-marks',r=>observe(r,'watermark','observe-describe',2,'Kiven märät läikät')],r=>observe(r,'leaf-mark','observe-describe',3,'Lehden jäljet')),
 spec('SCI-ENV-DESCRIBE-01','Sanat pienelle aallolle','〰','Loikka näki aallon, mutta Aava katsoi samaan aikaan ruokoa.','Kuvaile havainto niin, että ystävä löytää saman kohdan.','Paperivene vie kuvauksen tutkimuslaiturille.',['waves',r=>observe(r,'wave','describe',2,'Pienet aallot')],['shadows',r=>observe(r,'shadow','describe',2,'Lumpeen varjot')],r=>observe(r,'sand-print','describe',3,'Uusi rantakuva')),
 spec('SCI-ENV-COMPARE-02','Kahden rannan kivet','🪨','Aava tarvitsee rantakivistä kaksi, jotka eroavat yhdellä tavalla.','Vertaa samaa ominaisuutta kahdesta näytteestä.','Kivipolku saa kaksi vertailtua kiveä.',['stones',r=>compare(r,'compare','stone','Kahden rannan kivet')],['shells',r=>compare(r,'compare','shell','Kahden simpukan vertailu')],r=>compare(r,'compare','material','Venevajan materiaalit')),
 spec('SCI-ENV-CLASSIFY-01','Ruokokorin salainen sääntö','🧺','Sulka lajittelee näytteet kahteen koriin, mutta sääntö puuttuu.','Valitse oma lajittelusääntö ja sovella sitä myös uuteen rajatapaukseen.','Ruokokorit saavat selkeät säännöt.',['leaves',r=>compare(r,'classify','leaf','Lehtikorin sääntö')],['stones',r=>compare(r,'classify','stone','Kivikorin sääntö')],r=>compare(r,'classify','material','Materiaalikorin sääntö')),
 spec('SCI-ENV-COMPARE-01','Laguunin pienoisnäyttely','🐚','Laguunin näyttelyyn tarvitaan vertailu ja lajittelu samasta aineistosta.','Vertaa kahta näytettä ja luokittele kaikki näytteet samalla säännöllä.','Pienoisnäyttely aukeaa laguunin rannalle.',['shells',r=>compare(r,'compare-classify','shell','Simpukkanäyttely')],['leaves',r=>compare(r,'compare-classify','leaf','Lehtinäyttely')],r=>compare(r,'compare-classify','material','Materiaalinäyttely')),
 spec('SCI-ENV-QUESTION-01','Miksi lehti kääntyy?','❓','Puron lehti kääntyy välillä. Loikka kysyy, onko lehti kaunis.','Muodosta kysymys, johon tutkimuspöydän välineillä voi vastata.','Tutkimusaseman taululle kirjoitetaan tutkittava kysymys.',['leaf-boat',r=>question(r,s=>sailSetup(s),'Lehtiveneen kysymys')],['water-wheel',r=>question(r,s=>wheelSetup(s),'Vesipyörän kysymys')],r=>question(r,s=>absorbSetup(s),'Imupalan kysymys')),
 spec('SCI-ENV-PLAN-01','Reilu koe kahdelle lehdelle','📋','Kaksi lehteä kilpailevat, mutta Loikka muutti kaikkea yhtä aikaa.','Suunnittele toistettava koe, jossa muuttuu vain yksi tekijä.','Sulan koepöytä saa reilun suunnitelman.',['sail',r=>plan(r,s=>sailSetup(s),'Lehtiveneiden reilu koe')],['absorb',r=>plan(r,s=>absorbSetup(s),'Imupalojen reilu koe')],r=>plan(r,s=>shadowSetup(s),'Varjokepin reilu koe')),
 spec('SCI-ENV-EXP-01','Tuulen pieni koepurje','⛵','Sulan suunnitelma on valmis. Nyt koe tehdään oikeasti.','Toteuta ohjattu koe: aseta, käynnistä, havainnoi ja kirjaa jokainen toisto.','Koepurje liukuu tutkimuslaiturille.',['sail-wind',r=>experiment(r,'execute','guided',s=>sailSetup(s,'wind'),'Koepurje ja puhallin',false)],['sail-area',r=>experiment(r,'execute','guided',s=>sailSetup(s,'area'),'Kaksi purjekokoa',false)],r=>experiment(r,'execute','guided',s=>absorbSetup(s,'material'),'Imupalojen koe',false)),
 spec('SCI-ENV-CAUSE-01','Vesipyörän pysähtynyt siipi','⚙','Pieni vesipyörä pysähtyy sivu-uomassa. Loikka kokeilee mallissa veden reittiä.','Tee vertailu, jossa vain yksi tekijä muuttuu, ja päättele syy tässä mallissa.','Tutkimusuoman pyörä alkaa pyöriä.',['gate',r=>experiment(r,'cause','controlled',s=>wheelSetup(s),'Veräjä ja pyörä',true)],['repair',r=>experiment(r,'cause','repair-confound',s=>wheelSetup(s,undefined,true),'Korjaa sekoittunut koe',true)],r=>experiment(r,'cause','controlled',s=>shadowSetup(s),'Lyhty ja varjo',true)),
 spec('ENV-PHY-CAUSE-MOTION-01','Tuulen ja veden kädenjälki','🍃','Kelluva kiekko liukuu. Joskus se jatkaa suoraan, joskus kääntyy tai pysähtyy.','Selvitä, mikä muutti liikettä: työntö sivulle, työntö eteen vai karhea pinta.','Kiekko löytää tiensä kaislikon satamaan.',['side-push',r=>experiment(r,'motion','controlled',s=>motionSetup(s,'forceY'),'Sivutyöntö',true)],['rough-stop',r=>experiment(r,'motion','controlled',s=>motionSetup(s,r.pick(['surface','none'] as const)),'Karhea kaislikko',true)],r=>experiment(r,'motion','controlled',s=>sailSetup(s,'wind'),'Purje sivutuulessa',true)),
 spec('SCI-ENV-MODEL-01','Puro lasisessa laatikossa','🧊','Lasilaatikon hiekkapuro on valmis malli. Sulka kysyy, mihin uusi lehti kulkee.','Käytä annettua mallia uuden tapauksen ennustamiseen ja testaa ennuste.','Lasilaatikon puro selittää lehden matkan.',['terrain',r=>terrainModel(r,'use','Lasilaatikon puro',true)],['terrain-tie',r=>terrainModel(r,'use','Kaksi samanlaista kuoppaa',true)],r=>shadowModel(r,'use','Lyhdyn varjomalli',true)),
 spec('SCI-ENV-MODEL-CREATE-01','Lehden reitti pienoispuroon','🗺','Kaksi lehteä kulki puron läpi. Niiden reitit ovat mallin ainoa tieto.','Rakenna havaintoja vastaava malli ja ennusta sillä uusi reitti.','Pienoispuroon syntyy havaintoihin perustuva malli.',['heights',r=>terrainModel(r,'create','Pienoispuron korkeudet',false)],['more-open',r=>terrainModel(r,'create','Puuttuvat hiekkakummut',false)],r=>shadowModel(r,'create','Oma varjomalli',false)),
 spec('SCI-ENV-MODEL-REVISE-01','Puro yllättää tutkijat','🪵','Malli ennusti lehden reitin, mutta puroon putosi kivi.','Säilytä vanha ennuste, vertaa uuteen havaintoon ja korjaa malli.','Korjattu puromalli selittää sekä vanhat että uudet havainnot.',['fallen-stone',r=>terrainModel(r,'revise','Uomaan pudonnut kivi',false)],['moved-lamp',r=>shadowModel(r,'revise','Siirretty lyhty',false)],r=>terrainModel(r,'revise','Toinen kivi uomassa',false)),
 spec('SCI-ENV-MODEL-02','Kahden uoman sopimusmalli','🦫','Majava tarvitsee rauhallisen altaan ja Aava vettä putoukselle. Kourujen havainnot ovat näkyvissä.','Rakenna havaintokartta, ennusta padon vaikutus ja korjaa kartta uuden havainnon perusteella.','Majavasopimus pitää: allas rauhoittuu ja putous saa vettä.',['channels',r=>channelModel(r,'Kahden uoman kartta',true)],['dam-map',r=>channelModel(r,'Majavan pato kartalla',true)],r=>terrainModel(r,'integrate','Kuularadan uusi este',true),'inquiry-islands-sci-env-model-02-v2'),
 spec('SCI-ENV-CONCL-01','Kenelle aurinkoinen paikka?','🌱','Taimet kasvoivat kahdella paikalla. Loikka päättelee jo yhdestä taimesta.','Tee johtopäätös koko aineistosta ja kerro, kun tulos jää epävarmaksi.','Taimikorit saavat perustellun paikan.',['clear',r=>conclusion(r,r.pick(['clear','mixed'] as const),'length','Taimien pituudet')],['uncertain',r=>conclusion(r,r.pick(['overlap','few'] as const),'length','Epävarmat taimitulokset')],r=>conclusion(r,r.pick(['clear','overlap','few'] as const),'temperature','Kahden altaan lämpötilat')),
 spec('SCI-ENV-EVAL-01','Liian pitkä pikkusimpukka','🐚','Yksi simpukka on taulukossa kymmenen kertaa muita pidempi.','Arvioi tuloksen järkevyys: tarkista poikkeama ennen korjausta tai säilytystä.','Simpukkataulukko on taas luotettava.',['typo',r=>evaluate(r,'error','length','Pilkkuvirhe simpukkataulukossa')],['real-outlier',r=>evaluate(r,'outlier','length','Iso mutta oikea simpukka')],r=>evaluate(r,r.pick(['error','outlier'] as const),'temperature','Lammikon lämpötilat')),
];
export const inquiryIslandsEvidence:Readonly<Record<string,{families:readonly string[];limit:string}>>=Object.fromEntries(inquiryIslandsSpecs.map(s=>[s.id,{families:s.produce??[],
 limit:s.id==='SCI-ENV-MODEL-02'
  ?'V2 edellyttää oman havaintokartan rakentamista, lukittua ennustetta, uuden havainnon jälkeistä korjausta ja omia testejä. V1:n valintamerkintä säilyy historiassa suppeampana. Rauhallisuus ja veden saapuminen ovat annettuja havaintotietoja, eivät virtausfysiikkaa.'
  :'Näyttö koskee oman havainnon, vertailun, kysymyksen, suunnitelman, virtuaalikokeen, mallin tai aineistoon rajatun päätelmän tuottamista. Oma selitys edellyttää aikuisen havaintoa ja avun merkintää. Puhetta tai kirjoitettua tekstiä ei tallenneta. Virtuaalikoe ei osoita oikean kokeen käsittelytaitoa eikä yleistä luonnonlakia.'}]));
