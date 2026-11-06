import type { Rng } from '../engine/rng';
import type { Task } from '../engine/types';
import { cases, choose, paint, txt } from './kit';
import type { Paint } from '../engine/types';
import type { ExpeditionSliceSpec } from './expedition-slice';
import { nearData, scaleKey, solstice, type SpaceDayTask } from './models/space-observatory';

export interface ObservatoryDayScene {kind:'observatory-day';title:string;rotation:number;site:'A'|'B';siteOffset:0|180}
export interface ObservatorySeasonScene {kind:'observatory-season';title:string;latitude:number;month:'june'|'december'}
export interface ObservatoryNearScene {kind:'observatory-near';title:string;mode:'size'|'distance';pair:'earth'|'mars'}
export interface ObservatoryScaleScene {kind:'observatory-scale';title:string;mode:'planet'|'stars'|'galaxy'}
export interface ObservatoryStructureScene {kind:'observatory-structure';title:string;context:'solar'|'other'}
export type SpaceObservatoryScene = ObservatoryDayScene | ObservatorySeasonScene | ObservatoryNearScene | ObservatoryScaleScene | ObservatoryStructureScene;

const dateLabel=(m:'june'|'december')=>m==='june'?'kesäkuun seisaus':'joulukuun seisaus';
const siteLabel=(lat:number)=>`${Math.abs(lat)}° ${lat>0?'pohjoista':'eteläistä'} leveyttä`;
function dayScene(m:ObservatoryDayScene) {
  return paint(`<p>Paikka ${m.site}. Auringon suunta pysyy vasemmalla. Käännä alla olevaa mallia askelittain ja ennusta valoa.</p>`);
}
function dayQuestion(r:Rng,family:'home'|'opposite',transfer=false) {
  const site=(transfer||family==='opposite')?'B':'A',siteOffset=site==='A'?0:180;
  const task:SpaceDayTask={kind:'space-day',startRotation:r.pick([0,90,270]),targetRotation:180,site,siteOffset};
  const model:ObservatoryDayScene={kind:'observatory-day',title:'Kotisaaren valo',rotation:task.startRotation,site,siteOffset};
  return {sceneModel:model,scene:dayScene(model),task,say:`Käännä Maata tavoitekulmaan 180°. Ennusta sitten, onko paikassa ${site} päivä vai yö.`,hint:'Auringon suunta ei vaihdu. Kummalla puolella maapalloa valittu paikka on käännöksen jälkeen?',explain:`Maa pyörii akselinsa ympäri. Paikassa ${site} on tavoitekulmassa ${site==='A'?'yö':'päivä'}, koska paikka osoittaa ${site==='A'?'pois Auringosta':'Aurinkoa kohti'}.`};
}
const day:ExpeditionSliceSpec={id:'ENV-PHY-DAYNIGHT-01',stop:'Aavan ikkuna ja yön meri',icon:'🌍',intro:'Aava ja Loikka tutkivat kotisaaren valoa Sulan observatoriossa.',goal:'Opit yhdistämään päivän ja yön Maan pyörimiseen ja Auringon suuntaan.',reward:'Kotisaaren lyhty syttyy observatorion malliin.',rev:'observatory-day-v1',produce:['home','opposite'],produceWhat:'mallin kääntämistä ja valaistuksen ennustamista',demo:()=>{const m:ObservatoryDayScene={kind:'observatory-day',title:'Päivä ja yö',rotation:0,site:'A',siteOffset:0};return [{sceneModel:m,scene:dayScene(m),say:'Aurinko valaisee yhden puoliskon. Pyöriminen tuo saman paikan valoon ja myöhemmin varjoon.'}]},item:cases({home:r=>dayQuestion(r,'home'),opposite:r=>dayQuestion(r,'opposite')},r=>dayQuestion(r,'opposite',true)) as ExpeditionSliceSpec['item']};

function seasonScene(m:ObservatorySeasonScene) {
  const north=solstice(Math.abs(m.latitude),m.month),south=solstice(-Math.abs(m.latitude),m.month);
  return paint(`<p><strong>${dateLabel(m.month)} · sama leveysaste pohjoisessa ja etelässä</strong></p><table><thead><tr><th>Paikka</th><th>Päivän pituus</th><th>Auringon keskipäivän korkeus</th></tr></thead><tbody><tr><th>${siteLabel(Math.abs(m.latitude))}</th><td>${north.dayHours.toFixed(1)} h</td><td>${north.noonElevation.toFixed(1)}°</td></tr><tr><th>${siteLabel(-Math.abs(m.latitude))}</th><td>${south.dayHours.toFixed(1)} h</td><td>${south.noonElevation.toFixed(1)}°</td></tr></tbody></table><p>Maan akselin suunta avaruudessa pidetään samana. Laskennallinen malli: pallomainen Maa, ei maastoa tai ilmakehän taittumista.</p>`);
}
function seasonQuestion(r:Rng,family:'compare'|'reason',transfer=false) {
  const latitude=(transfer?30:r.pick([45,60]))*(r.chance(.5)?1:-1),month=r.pick(['june','december'] as const),m:ObservatorySeasonScene={kind:'observatory-season',title:'Valoa kahdella leveysasteella',latitude,month};
  const local=solstice(latitude,month),other=solstice(-latitude,month),summer=local.dayHours>other.dayHours;
  const task:Task=family==='compare'?choose(r,txt(`${siteLabel(latitude)}: ${summer?'kesä':'talvi'}, koska päivä on ${summer?'pidempi ja Auringon korkeus suurempi':'lyhyempi ja Auringon korkeus pienempi'}.`),[txt(`${siteLabel(latitude)}: ${summer?'talvi':'kesä'}, vaikka päivä ja tulokulma kertovat muuta.`),txt('Molemmilla pallonpuoliskoilla on samaan aikaan sama vuodenaika.')]):choose(r,txt('Akselin kallistus muuttaa päivän pituutta ja säteiden tulokulmaa; akseli osoittaa likimain samaan suuntaan.'),[txt('Kesä johtuu ensisijaisesti siitä, että Maa on silloin paljon lähempänä Aurinkoa.'),txt('Maan akseli kääntyy aina Aurinkoa kohti vuosikierroksen aikana.')]);
  return {sceneModel:m,scene:seasonScene(m),task,say:family==='compare'?`Vertaa taulukkoa: kumpi vuodenaika on paikassa ${siteLabel(latitude)}?`:'Mikä selittää taulukon valoeroa?',hint:'Vertaa saman leveysasteen päivän pituutta ja Auringon korkeutta.',explain:`Paikassa ${siteLabel(latitude)} päivän pituus on ${local.dayHours.toFixed(1)} h ja Auringon korkeus ${local.noonElevation.toFixed(1)}°. Vastakkaisella pallonpuoliskolla arvot ovat ${other.dayHours.toFixed(1)} h ja ${other.noonElevation.toFixed(1)}°. Kallistus muuttaa valaistusta.`};
}
const seasons:ExpeditionSliceSpec={id:'ENV-PHY-SEASONS-01',stop:'Talvipesän ja kesäniityn salaisuus',icon:'☀️',intro:'Loikka etsii vuodenaikojen syytä, ja Sulka vertaa samaa leveysastetta kahdella pallonpuoliskolla.',goal:'Opit yhdistämään akselin kallistuksen päivän pituuteen ja Auringon korkeuteen.',reward:'Observatorion seinälle avautuvat kotisaaren vuodenajat.',rev:'observatory-season-v1',demo:()=>{const m:ObservatorySeasonScene={kind:'observatory-season',title:'Kesäkuu',latitude:45,month:'june'};return [{sceneModel:m,scene:seasonScene(m),say:'Kesäkuussa pohjoinen pallonpuolisko kallistuu Aurinkoon päin; päivä on siellä pitempi kuin vastaavalla eteläisellä leveysasteella.'}]},item:cases({compare:r=>seasonQuestion(r,'compare'),reason:r=>seasonQuestion(r,'reason')},r=>seasonQuestion(r,'compare',true)) as ExpeditionSliceSpec['item']};

function nearScene(m:ObservatoryNearScene):Paint {
  return (host,context)=>{
    let mode=m.mode;
    const render=()=>{
      const p=m.pair==='earth'?nearData.earth:nearData.mars, moon=m.pair==='earth'?nearData.moon:nearData.phobos, distance=m.pair==='earth'?nearData.earthMoonKm:nearData.marsPhobosKm;
      host.innerHTML=`<p><strong>${mode==='size'?'Kokojen vertailutila':'Etäisyyksien vertailutila'}</strong> · ${mode==='size'?'Pallojen halkaisijat ovat suhteessa, mutta niiden väli ei ole mittakaavassa.':'3D-kohteet on suurennettu ja sijoitettu kaavamaisesti; vertaa taulukon etäisyyslukuja.'}</p><div class="row"><button type="button" class="btn small" data-view="size" aria-pressed="${mode==='size'}">Koko</button><button type="button" class="btn small" data-view="distance" aria-pressed="${mode==='distance'}">Etäisyys</button></div><table><thead><tr><th>Kohde tai väli</th><th>Annettu arvo</th></tr></thead><tbody><tr><th>${p.name}</th><td>halkaisija noin ${p.diameterKm} km</td></tr><tr><th>${moon.name}</th><td>halkaisija noin ${moon.diameterKm} km</td></tr><tr><th>${p.name}–${moon.name}</th><td>keskietäisyys noin ${distance} km</td></tr></tbody></table><p>Aurinko on tähti, ${p.name} planeetta ja ${moon.name} sen kuu. Etäisyydet ovat likimääräisiä; paikat kiertoradoilla muuttuvat. Fobos on epäsäännöllinen, joten sille annetaan keskimääräinen halkaisija.</p>`;
      host.querySelectorAll<HTMLButtonElement>('[data-view]').forEach(button=>button.addEventListener('click',()=>{
        mode=button.dataset.view as ObservatoryNearScene['mode']; render();
        context?.onViewChange?.(mode);
        host.querySelector<HTMLButtonElement>(`[data-view="${mode}"]`)?.focus();
      }));
    }; render();
  };
}
function nearQuestion(r:Rng,family:'size'|'distance',transfer=false) {
  const pair=transfer?'mars':'earth',m:ObservatoryNearScene={kind:'observatory-near',title:'Lähikohteet',mode:family,pair},p=pair==='earth'?nearData.earth:nearData.mars,moon=pair==='earth'?nearData.moon:nearData.phobos;
  const task:Task=family==='size'?choose(r,txt(`${p.name} on suurempi: sen halkaisija on ${p.diameterKm} km ja kuun ${moon.name} ${moon.diameterKm} km.`),[txt(`${moon.name} on suurempi, koska se on kartalla lähempänä.`),txt('Kuvan koko näyttää samalla automaattisesti tarkan etäisyyden.')]):choose(r,txt(`${p.name}–${moon.name} on ${pair==='earth'?'384400':'9377'} km: etäisyyttä verrataan etäisyystilassa, ei pallojen koosta.`),[txt('Planeetan halkaisija kertoo suoraan kuun etäisyyden.'),txt('Kokokuvan pallojen väli näyttää automaattisesti todellisen etäisyyden.')]);
  return {sceneModel:m,scene:nearScene(m),task,say:family==='size'?'Valitse annettuihin halkaisijoihin perustuva vertailu.':'Mikä kertoo kuun ja planeetan etäisyyden?',hint:'Lue yksikkö ja se, onko arvo halkaisija vai kohteiden väli.',explain:`${p.name} ja ${moon.name} esitetään erillisissä koko- ja etäisyystiloissa. Numerot ovat annettuja likiarvoja; kiertoratapaikat muuttuvat.`};
}
const near:ExpeditionSliceSpec={id:'ENV-PHY-SPACE-NEAR-01',stop:'Rakettihytin karttapallo',icon:'🪐',intro:'Sulan lainattavan tutkimushytin kartassa koko ja etäisyys saavat omat tilansa.',goal:'Opit erottamaan planeetan ja kuun koon sekä niiden välisen etäisyyden.',reward:'Ystävät vertaavat Maan kuuta ja Marsin kuiden mallia.',rev:'observatory-near-v1',demo:()=>{const m:ObservatoryNearScene={kind:'observatory-near',title:'Maa ja Kuu',mode:'size',pair:'earth'};return [{sceneModel:m,scene:nearScene(m),say:'Maa on Kuuta suurempi. Kokoa ja niiden etäisyyttä tutkitaan eri mittakaavoissa.'}]},item:cases({size:r=>nearQuestion(r,'size'),distance:r=>nearQuestion(r,'distance')},r=>nearQuestion(r,r.pick(['size','distance'] as const),true)) as ExpeditionSliceSpec['item']};

function scaleScene(m:ObservatoryScaleScene):Paint {
  return (host,context)=>{
    let mode=m.mode;
    const render=()=>{
      host.innerHTML=`<p><strong>Mittakaava-avain</strong> · nyt tarkastellaan tasoa ${scaleKey.find(x=>x.id===mode)!.label}. Etäisyys ei ole matka-aika.</p><div class="row">${scaleKey.map(v=>`<button type="button" class="btn small" data-view="${v.id}" aria-pressed="${mode===v.id}">${v.unit}</button>`).join('')}</div><table><thead><tr><th>Taso</th><th>Esimerkki</th></tr></thead><tbody>${scaleKey.map(v=>`<tr><th>${v.label}</th><td>${v.example}</td></tr>`).join('')}</tbody></table>`;
      host.querySelectorAll<HTMLButtonElement>('[data-view]').forEach(button=>button.addEventListener('click',()=>{
        mode=button.dataset.view as ObservatoryScaleScene['mode']; render();
        context?.onViewChange?.(mode);
        host.querySelector<HTMLButtonElement>(`[data-view="${mode}"]`)?.focus();
      }));
    }; render();
  };
}
function scaleQuestion(r:Rng,family:'sort'|'unit',transfer=false) {
  const m:ObservatoryScaleScene={kind:'observatory-scale',title:'Mittakaavakaista',mode:r.pick(['planet','stars','galaxy'] as const)};
  const value=transfer?6:4;
  const task:Task=family==='sort'&&!transfer?{kind:'place',slots:[{id:'planet',text:'Planeettojen väli'},{id:'stars',text:'Tähtien väli'},{id:'galaxy',text:'Galaksin mitta'}],tokens:r.shuffle([{id:'au',text:'1 AU'},{id:'ly',text:'1 valovuosi'},{id:'kpc',text:'1 kpc'}]),answer:{planet:'au',stars:'ly',galaxy:'kpc'}}:choose(r,txt(`Tähtien välien mittakaava: ${value} valovuotta.`),[txt(`Planeettojen väli: ${value} valovuotta.`),txt(`Galaksin koko: ${value} valovuotta.`)]);
  return {sceneModel:m,scene:scaleScene(m),task,say:family==='sort'&&!transfer?'Yhdistä annettu mitta sopivaan mittakaavatasoon.':`Uusi annettu väli on ${value} valovuotta. Mille esimerkkiavaimen tasolle se sopii?`,hint:'Vertaa uutta arvoa annettuihin esimerkkitasoihin.',explain:'AU kuvaa tässä planeettavälin esimerkkiä, valovuosi tähtiväliä ja kiloparsek galaksimittaa. Rajat ovat tässä karkea vertailuavain, eivät kaikkien kohteiden tiukat luokkarajat.'};
}
const scale:ExpeditionSliceSpec={id:'PHY79-UNIVERSE-SCALE',stop:'Matka, jota kartta ei mahdu näyttämään',icon:'✨',intro:'Loikka ja Aava avaavat mittakaavakaistan tähtien välisille etäisyyksille.',goal:'Opit vertaamaan annettuja planeetta-, tähti- ja galaksimittakaavoja.',reward:'Karttapöytä avautuu tähtien mereksi ja Loikka jättää tutkimuskysymyksen.',rev:'observatory-scale-v1',produce:['sort'],produceWhat:'annettujen etäisyyksien sijoittamista mittakaavatasoihin',demo:()=>{const m:ObservatoryScaleScene={kind:'observatory-scale',title:'Mittakaavakaista',mode:'stars'};return [{sceneModel:m,scene:scaleScene(m),say:'AU, valovuosi ja kiloparsek ovat eri pituisia etäisyyden yksiköitä.'}]},item:cases({sort:r=>scaleQuestion(r,'sort'),unit:r=>scaleQuestion(r,'unit')},r=>scaleQuestion(r,'unit',true)) as ExpeditionSliceSpec['item']};

function structureScene(m:ObservatoryStructureScene) {return paint(`<p><strong>Kohdekortit</strong>: ${m.context==='solar'?'Kuu, Maa, Aurinkokunta ja Linnunrata':'toisen tähden kuu, planeetta, planeettakunta ja galaksi'}. Kokoa kuulumissuhteet pienemmästä suurempaan.</p><p>Tähtijoukko on joukko tähtiä. Galaksi sisältää valtavan määrän tähtiä sekä muuta ainetta; tähtijoukko ja galaksi eivät tarkoita samaa.</p>`);}
function structureQuestion(r:Rng,family:'build'|'cluster',transfer=false) {
  const context=transfer?'other':'solar',m:ObservatoryStructureScene={kind:'observatory-structure',title:'Kodin osoite',context};
  const words=context==='solar'?['Kuu','Maa–Kuu-järjestelmä','Aurinkokunta','Linnunrata']:['Kuu','Planeetta–kuu-järjestelmä','Planeettakunta','Galaksi'];
  const task:Task=family==='build'?{kind:'build',mode:'seq',target:words.join(' '),tokens:r.shuffle(words),max:4}:choose(r,txt('Tähtijoukko on tähtien joukko; galaksi on laajempi rakenne.'),[txt('Tähtijoukko ja galaksi tarkoittavat aina samaa.'),txt('Aurinko on planeetta, ei tähti.')]);
  return {sceneModel:m,scene:structureScene(m),task,say:family==='build'?'Kokoa annettujen kohteiden kuulumisjärjestys pienemmästä suurempaan.':'Mikä kuvaa tähtijoukon ja galaksin eroa?',hint:'Kuu kiertää planeettaa; molemmat kuuluvat planeettakuntaan, joka kuuluu galaksiin.',explain:`${words.join(' → ')}. Aurinko on Aurinkokunnan tähti. Tähtijoukko ja galaksi ovat eri rakenteita.`};
}
const structure:ExpeditionSliceSpec={id:'PHY79-UNIVERSE-STRUCT',stop:'Tähden osoite',icon:'🌌',intro:'Aava kirjoittaa kodin kosmista osoitetta ja Loikka tutkii tähtijoukkoa.',goal:'Opit rakentamaan kohteiden kuulumisjärjestyksen ja erottamaan tähtijoukon galaksista.',reward:'Kodin osoite löytyy galaksin tutkimusarkistosta.',rev:'observatory-structure-v1',produce:['build'],produceWhat:'annettujen rakenteiden kuulumisjärjestyksen kokoamista',demo:()=>{const m:ObservatoryStructureScene={kind:'observatory-structure',title:'Kodin osoite',context:'solar'};return [{sceneModel:m,scene:structureScene(m),say:'Kuu kiertää Maata. Maa ja Kuu kuuluvat Aurinkokuntaan, joka on Linnunradassa.'}]},item:cases({build:r=>structureQuestion(r,'build'),cluster:r=>structureQuestion(r,'cluster')},r=>structureQuestion(r,'build',true)) as ExpeditionSliceSpec['item']};

export const spaceObservatorySpecs:ExpeditionSliceSpec[]=[day,seasons,near,scale,structure].map(s=>({...s,validRevs:[s.rev]}));
export const spaceObservatoryEvidence:Readonly<Record<string,{families:readonly string[];limit:string}>>={
 'ENV-PHY-DAYNIGHT-01':{families:['home','opposite'],limit:'Näyttö koskee askelittaista mallin kääntöä ja annetun paikan päivä/yö-ennustetta; oma sanallinen selitys vaatii erillisen havainnon.'},
 'ENV-PHY-SEASONS-01':{families:['compare','reason'],limit:'Näyttö koskee annettujen seisaustietojen vertailua ja valmiin selityksen valintaa lauhkeilla leveysasteilla.'},
 'ENV-PHY-SPACE-NEAR-01':{families:['size','distance'],limit:'Näyttö koskee annettujen lähiavaruuden arvojen lukua eri mittakaavatiloissa; oma perustelu arvioidaan erikseen.'},
 'PHY79-UNIVERSE-SCALE':{families:['sort','unit'],limit:'Näyttö koskee annetun esimerkkiavaimen käyttöä ja vertailua, ei universaaleja tiukkoja kokorajoja.'},
 'PHY79-UNIVERSE-STRUCT':{families:['build','cluster'],limit:'Näyttö koskee annettujen kuulumistasojen järjestämistä ja valmiin rakenne-eron tunnistamista.'},
};
