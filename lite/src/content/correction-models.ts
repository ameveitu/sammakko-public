import type { Rng } from '../engine/rng';
import type { Task } from '../engine/types';
import { cases, choose, paint, txt } from './kit';
import { svg } from '../ui/art';
import { CHANNEL_OBSERVATIONS, type ChannelObservation, type RouteCase } from './models/channel-evidence';
import { diffuse } from './models/diffusion-model';
import type { ExpeditionSliceSpec } from './expedition-slice';

/** x and y are lengths in metres; the graph is a solution space, never a place map. */
export interface SystemGraphScene { kind: 'system-graph'; title: string; first: [number, number, number]; second: [number, number, number]; xMax: number; yMax: number }
export interface ChannelEvidenceScene { kind: 'channel-evidence'; title: string; observations: readonly ChannelObservation[]; target: RouteCase; oldModel?: ChannelObservation }
export interface DiffusionModelScene { kind: 'diffusion-model'; title: string; medium: 'liquid' | 'gas'; initial: readonly number[]; steps: number; accelerated: true }
export type CorrectionSceneModel = SystemGraphScene | ChannelEvidenceScene | DiffusionModelScene;
export type LinearSolution = { kind: 'unique'; x: number; y: number } | { kind: 'parallel' | 'same' };
export function solveLinear(first: readonly [number, number, number], second: readonly [number, number, number]): LinearSolution {
  const [a,b,c]=first, [d,e,f]=second, det=a*e-b*d;
  if (det !== 0) return { kind:'unique', x:(c*e-b*f)/det, y:(a*f-c*d)/det };
  return { kind: a*f===c*d && b*f===c*e ? 'same' : 'parallel' };
}

function graphScene(model: SystemGraphScene) {
  const {first,second,xMax,yMax}=model, x0=34, y0=198, w=220, h=165;
  const px=(x:number)=>x0+x*w/xMax, py=(y:number)=>y0-y*h/yMax;
  const grid=Array.from({length:xMax+1},(_,i)=>`<path d="M${px(i)} ${y0}V${y0-h}" stroke="#d6e5db"/><text x="${px(i)}" y="213" text-anchor="middle" font-size="11">${i}</text>`).join('')+
    Array.from({length:yMax+1},(_,i)=>`<path d="M${x0} ${py(i)}H${x0+w}" stroke="#d6e5db"/>${i%2===0?`<text x="28" y="${py(i)+3}" text-anchor="end" font-size="11">${i}</text>`:''}`).join('');
  const line=(v: [number,number,number],color:string)=>{const [a,b,c]=v; const pts: [number,number][]=[]; for(const x of [0,xMax]) {const y=(c-a*x)/b;if(y>=0&&y<=yMax)pts.push([x,y]);} for(const y of [0,yMax]) {const x=(c-b*y)/a;if(x>=0&&x<=xMax)pts.push([x,y]);} const [p,q]=pts; return p&&q?`<line x1="${px(p[0])}" y1="${py(p[1])}" x2="${px(q[0])}" y2="${py(q[1])}" stroke="${color}" stroke-width="3"/>`:'';};
  const equation=(v:[number,number,number])=>`${v[0]===1?'':v[0]}x + ${v[1]===1?'':v[1]}y = ${v[2]}`;
  return paint(svg(285,235,grid+line(first,'#237486')+line(second,'#b35b43')+`<text x="144" y="230" text-anchor="middle" font-size="11">x = laudan pituus (m)</text><text x="35" y="17" font-size="11">y = toisen laudan pituus (m)</text>`, 'Kaksi mittaehtoa koordinaatistossa.').replace('<svg ', '<svg class="system-graph" ')+`<p>Sininen: ${equation(first)}. Punainen: ${equation(second)}. Pisteen x ja y ovat kahden laudan pituudet, eivät karttapaikka.</p>`);
}
function graphModel(r:Rng, kind:'unique'|'parallel'|'same', transfer=false):SystemGraphScene {
  const x=transfer?r.pick([2,4,6]):r.pick([3,4,5]), y=transfer?r.pick([3,5,7]):r.pick([4,6,7]), sum=x+y;
  return {kind:'system-graph',title:'Kaksi laudan mittaehtoa',first:[1,1,sum],second:kind==='unique'?[2,1,2*x+y]:[2,2,2*sum+(kind==='parallel'?2:0)],xMax:12,yMax:16};
}
function graphQuestion(r:Rng, family:'intersection'|'relation', transfer=false) {
  const relation=family==='intersection'?'unique':r.pick(['parallel','same'] as const), m=graphModel(r,relation,transfer), answer=solveLinear(m.first,m.second);
  const task:Task=answer.kind==='unique'?{kind:'plot',xs:[answer.x],ys:[answer.y],xMax:m.xMax,yMax:m.yMax,xLabel:'x: lauta (m)',yLabel:'y: lauta (m)',xStep:1,yStep:1,referenceLines:[{a:m.first[0],b:m.first[1],c:m.first[2],style:'blue'},{a:m.second[0],b:m.second[1],c:m.second[2],style:'red'}]}:
    choose(r,txt(answer.kind==='parallel'?'Ei yhteistä lukuparia.':'Äärettömän monta yhteistä lukuparia.'),[txt(answer.kind==='parallel'?'Äärettömän monta yhteistä lukuparia.':'Ei yhteistä lukuparia.'),txt('Täsmälleen yksi yhteinen lukupari.')]);
  return {sceneModel:m,scene:answer.kind==='unique'?paint(`<p class="graph-givens">Sininen yhtenäinen: x + y = ${m.first[2]}. Punainen katkoviiva: 2x + y = ${m.second[2]}. Pisteen x ja y ovat kahden laudan pituudet, eivät karttapaikka.</p>`):graphScene(m),task,say:answer.kind==='unique'?'Merkitse suorien yhteinen piste: x ja y ovat kahden laudan pituudet metreinä.':'Mitä suorat kertovat ehtojen yhteisistä lukuparien määrästä?',hint:'Yhteisen ratkaisun pitää toteuttaa molemmat mittaehdot.',explain:answer.kind==='unique'?`Lukupari (${answer.x}, ${answer.y}) sopii molempiin mittaehtoihin. Laudat ovat ${answer.x} m ja ${answer.y} m. Piste ei ole sulun sijainti.`:answer.kind==='parallel'?'Yhdensuuntaisilla eri suorilla ei ole yhteistä pistettä.':'Sama suora kuvaa molemmat ehdot, joten yhteisiä pisteitä on äärettömän monta.'};
}
const graph:ExpeditionSliceSpec={id:'M79-SYSTEM-GRAPH',stop:'Kaksi mittaa, yhteinen ratkaisu',icon:'📐',intro:'Aava ja Loikka etsivät kahden laudan mitat kahden mittaehdon avulla.',goal:'Opit lukemaan yhteisen ratkaisun koordinaatistosta ja tarkistamaan ehtojen määrän.',reward:'Koesulun laudat voidaan mitata yhteisillä mitoilla.',rev:'correction-system-graph-v1',produce:['intersection'],produceWhat:'yhteisen lukuparin merkitsemistä',demo:()=>{const m:SystemGraphScene={kind:'system-graph',title:'Laudat',first:[1,1,12],second:[2,1,17],xMax:12,yMax:16};return [{sceneModel:m,scene:graphScene(m),say:'Yhteinen piste on (5, 7). Samat 5 ja 7 metriä toteuttavat kummankin mittaehdon.'}]},item:cases({'intersection':r=>graphQuestion(r,'intersection'),'relation':r=>graphQuestion(r,'relation')},r=>graphQuestion(r,'intersection',true)) as ExpeditionSliceSpec['item']};

const channelLabels: Record<RouteCase,string>={A:'A',B:'B',C:'C'};
function channelScene(m:ChannelEvidenceScene) {
  const rows=m.observations.map(o=>`<tr><th>${channelLabels[o.route]}</th><td>${o.nest==='quiet'?'rauhallinen':'häiriintynyt'}</td><td>${o.waterfall?'vettä saapui':'vettä ei saapunut'}</td></tr>`).join('');
  return paint(svg(300,100,'<path d="M20 50H80M80 50L150 20H260M80 50L150 80H260" stroke="#398f9c" stroke-width="7" fill="none"/><circle cx="80" cy="50" r="7" fill="#805d3c"/><text x="160" y="17" font-size="12">Pesäallas</text><text x="160" y="97" font-size="12">Putous</text>','Havaintokartta: lähde ja kaksi seurattavaa kohdetta.')+`<p>Nämä ovat saman koepöydän annettuja havaintoja. Reitin leveydestä ei päätellä virtaamaa.</p><table><thead><tr><th>Reitti</th><th>Pesäallas</th><th>Putous</th></tr></thead><tbody>${rows}</tbody></table>`+(m.oldModel?`<p>Vanha mallimerkintä reitille ${m.oldModel.route}: pesä ${m.oldModel.nest==='quiet'?'rauhallinen':'häiriintynyt'}, putoukseen ${m.oldModel.waterfall?'saapuu vettä':'ei saavu vettä'}.</p>`:''));
}
function channelQuestion(r:Rng, family:'build'|'revise', transfer=false) {
  const m:ChannelEvidenceScene={kind:'channel-evidence',title:'Koeuomien havainnot',observations:transfer?CHANNEL_OBSERVATIONS.slice(0,2):CHANNEL_OBSERVATIONS,target:transfer?'A':'C',...(family==='revise'&&!transfer?{oldModel:{route:'C',nest:'quiet',waterfall:false} as const}:{})};
  let task:Task;
  if(transfer) task=choose(r,txt('Pesä pysyy rauhallisena, eikä putoukselle saavu vettä.'),[txt('Pesä häiriintyy ja putoukselle saapuu vettä.'),txt('Pesä pysyy rauhallisena ja putoukselle saapuu vettä.')]);
  else task={kind:'place',slots:[{id:'nest',text:'Pesäallas reitillä C'},{id:'fall',text:'Putous reitillä C'}],tokens:r.shuffle([{id:'quiet',text:'Rauhallinen'},{id:'disturbed',text:'Häiriintynyt'},{id:'yes',text:'Vettä saapuu'},{id:'no',text:'Vettä ei saavu'}]),answer:{nest:'quiet',fall:'yes'},...(m.oldModel?{start:{nest:m.oldModel.nest==='quiet'?'quiet':'disturbed',fall:m.oldModel.waterfall?'yes':'no'}}:{})};
  return {sceneModel:m,scene:channelScene(m),task,say:transfer?'Ennusta taulukon avulla: jos koepöydän reitti vaihdetaan B:stä aiemmin havaittuun A:han, mitä havaitaan uudessa toistossa?':family==='build'?'Rakenna havaintotaulukkoa vastaava reitin C merkintä.':'Uusi havainto on taulukossa. Korjaa reitin C vanha mallimerkintä.',hint:`Lue molemmat reitin ${m.target} havainnot erikseen.`,explain:transfer?'Uusi havainto toistaa reitin A: pesäallas on rauhallinen eikä putoukselle saavu vettä. Ennuste perustuu annettuun aiempaan havaintoon.':'Havainnossa C pesäallas on rauhallinen ja putoukselle saapuu vettä. Malli perustuu annettuun havaintoon, ei uoman leveydestä pääteltyyn virtauslakiin.'};
}
const channel:ExpeditionSliceSpec={id:'SCI-ENV-MODEL-02',stop:'Kahden uoman havaintomalli',icon:'🦫',intro:'Majava tarvitsee rauhallisen pesäaltaan ja Aava vettä putoukselle. Sulka näyttää koepöydän havainnot.',goal:'Opit rakentamaan ja korjaamaan mallimerkinnän annettujen havaintojen perusteella.',reward:'Ystävät valitsevat havaitun koejärjestelyn molempien tarpeisiin.',rev:'correction-channel-evidence-v1',produce:['build','revise'],produceWhat:'havaintoihin vastaavan mallimerkinnän rakentamista',demo:()=>{const m:ChannelEvidenceScene={kind:'channel-evidence',title:'Havaintotaulukko',observations:CHANNEL_OBSERVATIONS,target:'C'};return [{sceneModel:m,scene:channelScene(m),say:'Reitillä C pesäallas oli rauhallinen ja putoukselle tuli vettä. Nämä ovat havaintoja, eivät pelkästä kuvasta arvattuja määriä.'}]},item:cases({'build':r=>channelQuestion(r,'build'),'revise':r=>channelQuestion(r,'revise')},r=>channelQuestion(r,'revise',true)) as ExpeditionSliceSpec['item']};

function diffusionScene(m:DiffusionModelScene) {
  const macro=m.initial.map((n,i)=>`<rect x="${14+i*30}" y="32" width="30" height="62" fill="#467faf" opacity="${0.10+n/15*.85}"/>`).join('');
  const symbols=m.initial.map((n,i)=>Array.from({length:n},(_,j)=>`<circle cx="${166+i*30+(j%3)*6}" cy="${40+Math.floor(j/3)*12}" r="2.3" fill="#275c83"/>`).join('')).join('');
  return paint(svg(300,115,`<text x="16" y="18" font-size="11">Makrohavainto</text><text x="160" y="18" font-size="11">Hiukkasmalli</text><rect x="14" y="32" width="120" height="62" fill="#e8f0eb" stroke="#24536c"/>${macro}<rect x="160" y="32" width="120" height="62" fill="#e8f0eb" stroke="#24536c"/>${symbols}`, 'Alkuhetki: värihavainnon ja erikseen nimetyn hiukkasmallin ikkunat.')+`<p>${m.medium==='liquid'?'Ohut levossa pidetty neste':'Suljettu kahden tilan kaasumalli'}: makrohavainto ja erikseen hiukkasmalli. Kuvan merkit ovat mallia, eivät valokuvia hiukkasista. Ajan kulkua on nopeutettu; merkitty hiukkanen näyttää yhden mahdollisen simuloidun kulkureitin. Ei oleteta nesteen tai kaasun yhteistä virtausta.</p>`);
}
function diffusionQuestion(r:Rng,family:'predict'|'explain',transfer=false) {
  const m:DiffusionModelScene={kind:'diffusion-model',title:'Suljettu astia',medium:transfer?'gas':'liquid',initial:[12,4,0,0],steps:4,accelerated:true};
  const after=diffuse(m.initial,m.steps);
  const task:Task=family==='predict'?choose(r,txt('Joukko jakautuu vähitellen tasaisemmin suljettuun astiaan.'),[txt('Kaikki hiukkaset liikkuvat varmasti vain oikealle.'),txt('Hiukkasia katoaa astiasta.'),txt('Jakauma ei voi muuttua.')]):choose(r,txt('Yksittäiset hiukkaset liikkuvat satunnaisesti kumpaankin suuntaan; joukon jakauma tasoittuu.'),[txt('Jokainen hiukkanen tietää missä on tyhjää ja kulkee vain sinne.'),txt('Kuvassa olevat pallot ovat valokuvia oikeista hiukkasista.'),txt('Nesteen yhteinen virta on ainoa annettu selitys.')]);
  return {sceneModel:m,scene:diffusionScene(m),task,say:family==='predict'?'Ennusta, miten väriaineen joukon jakauma muuttuu myöhemmin.':'Mikä hiukkasmalli selittää havainnon ja erottaa mallimerkit valokuvasta?',hint:'Yhden merkityn hiukkasen suunta vaihtelee; tarkastele erikseen koko joukkoa.',explain:`Suljettu malli säilyttää ${m.initial.reduce((a,b)=>a+b,0)} yksikköä. Neljän malliaskeleen jälkeen alkuperäinen keskittymä on levinnyt (${after.map(n=>n.toFixed(2)).join(', ')}). Yksittäinen liike voi olla kumpaan suuntaan tahansa.`};
}
const diffusion:ExpeditionSliceSpec={id:'CHEM79-PARTICLE-MODEL-USE',stop:'Kaksi ikkunaa aineeseen',icon:'🧪',intro:'Sulka vertaa levossa olevan nesteen värimuutosta erikseen nimettyyn hiukkasmalliin.',goal:'Opit selittämään joukon leviämistä mallilla ja erottamaan mallin havainnosta.',reward:'Tutkimusikkunaan syttyy hiukkasmallin merkki.',rev:'correction-diffusion-model-v1',demo:()=>{const m:DiffusionModelScene={kind:'diffusion-model',title:'Väriaine suljetussa astiassa',medium:'liquid',initial:[12,4,0,0],steps:4,accelerated:true};return [{sceneModel:m,scene:diffusionScene(m),say:'Väriaineen jakauma tasoittuu levossa. Mallissa yksittäinen merkitty hiukkanen voi liikkua kumpaan tahansa suuntaan.'}]},item:cases({'predict':r=>diffusionQuestion(r,'predict'),'explain':r=>diffusionQuestion(r,'explain')},r=>diffusionQuestion(r,'explain',true)) as ExpeditionSliceSpec['item']};

export const correctionModelSpecs: ExpeditionSliceSpec[] = [graph,channel,diffusion].map(spec=>({...spec,validRevs:[spec.rev]}));
export const correctionModelEvidence: Readonly<Record<string,{families:readonly string[];limit:string}>> = {
  'M79-SYSTEM-GRAPH': {families:['intersection','relation'],limit:'Näyttö koskee annettuja mittaehtoja, yhteisen pisteen merkitsemistä ja suorien suhteen tunnistamista. Negatiivisen neljänneksen siirtoa ei tässä näytetä.'},
  'SCI-ENV-MODEL-02': {families:['build','revise'],limit:'Näyttö koskee annetuista havaintovaihtoehdoista rakennetun tai korjatun mallimerkinnän tekemistä, ei oman kokeen suunnittelua tai virtausfysiikan johtamista.'},
  'CHEM79-PARTICLE-MODEL-USE': {families:['predict','explain'],limit:'Näyttö koskee valmiin ennusteen ja hiukkasselityksen valintaa rajatussa mallissa. Itsenäinen selitys ja kokeellinen työ vaativat eri havainnon.'},
};
