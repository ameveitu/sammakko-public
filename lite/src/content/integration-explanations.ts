import type {ObservedExplanationTask} from './models/observed-explanations';
import {expeditionSliceSpecs,expeditionSliceEvidence,spaceArt,fireArt,type ExpeditionSliceSpec} from './expedition-slice';

export const integrationExplanationIds=['PHY79-PARALLEL','CHEM79-FIRE-SAFE','ENV-PHY-SPACE-01'] as const;
// The own-plan route view varies its map so independent explanations are distinct situations, not replays of one map.
const fireRouteMaps=[['Retkikatos','Laituripolku','Varastopolku'],['Saunamökki','Rantapolku','Puuvajan kuja'],['Nuotiopaikka','Niittypolku','Kuusikon oikopolku'],['Lintutorni','Pitkospuut','Kaislikon polku']] as const;
type Id=typeof integrationExplanationIds[number];
const revision:Record<Id,string>={'PHY79-PARALLEL':'exp690-parallel-own-explanation-v2','CHEM79-FIRE-SAFE':'exp690-fire-own-plan-v2','ENV-PHY-SPACE-01':'exp690-space-own-explanation-v2'};
export const integrationExplanationSpecs:ExpeditionSliceSpec[]=integrationExplanationIds.map(id=>{
  const original=expeditionSliceSpecs.find(s=>s.id===id)!;
  return {...original,rev:revision[id],validRevs:[revision[id]],produce:[...expeditionSliceEvidence[id]!.families],produceWhat:'oman havaintoihin sidotun selityksen tuottamista',item(r,phase){
    const q=original.item(r,phase),model=q.sceneModel;
    if(model.kind==='space'&&model.mode==='day'){
      model.sites=2;q.scene=spaceArt(model);
    }
    let prompt:string,rubric:ObservedExplanationTask['rubric'];
    if(id==='PHY79-PARALLEL'){
      prompt='Kirjoita tai kerro tästä samasta piiristä haarojen jännitteet ja pääjohdon virta. Perustele kummatkin piirroksen solmuilla ja annetuilla mittauksilla.';
      rubric=[{id:'voltage',label:'Haarojen jännitteet',guide:'Ilmoittaa molempien haarojen koko lähdejännitteen ja perustelee yhteisillä päätesolmuilla.'},{id:'current',label:'Pääjohdon oma virtatili',guide:'Laskee tämän tapauksen molemmat annetut haaravirrat yhteen. Sama jännite ei edellytä samoja haaravirtoja.'},{id:'connection',label:'Yhdistää samaan piiriin',guide:'Osoittaa omasta piirroksesta haarautumisen ja yhdistymisen; ei selitä sarjakytkentää.'}];
    }else if(id==='CHEM79-FIRE-SAFE'){
      const conditions=model?.kind==='fire-safety'&&model.view==='conditions';
      if(model.kind==='fire-safety'&&model.view==='route'&&phase!=='transfer'){
        const [place,safeExit,smokyRoute]=r.pick(fireRouteMaps);
        Object.assign(model,{place,safeExit,smokyRoute});q.scene=fireArt(model);
        q.explain=`Ryhmä siirtyy turvaan. Savuton reitti on ${safeExit.toLowerCase()}. Aava varmistaa turvasta, että apu saa tiedon. Aava kertoo hätänumeroon 112, mitä tapahtui ja missä. Pelastusryhmä hoitaa palon.`;
      }
      prompt=conditions?'Selitä palamisen kolme ehtoa ja puuttuva ehto. Kerro myös oma turvallinen toimintatapasi annetussa retkikatostilanteessa.':'Kerro tämän kartan oma toimintasuunnitelmasi: reitti turvaan, avun kutsuminen ja miksi et käytä savuista oikoreittiä.';
      if(conditions){const scene=q.scene;q.scene=host=>{scene?.(host);const context=document.createElement('p');context.textContent='Kuvitteellinen tilanne: retkikatoksella on savua. Aava on vieressäsi. Savuton laituripolku vie turvapaikalle.';host.append(context);};}
      rubric=conditions?[{id:'conditions',label:'Kolmen ehdon yhteys',guide:'Nimeää palavan aineen, hapen ja riittävän lämmön sekä tunnistaa juuri tämän mallin puuttuvan ehdon.'},{id:'safety',label:'Oma turvallinen toiminta',guide:'Siirtyy turvaan savuttomasti ja varmistaa avun kutsumisen. Ei ehdota lapselle palon kokeilemista tai sammuttamista.'}]:[{id:'route',label:'Oma reitti turvaan',guide:'Nimeää annetun kartan savuttoman reitin ja torjuu savuiseen tilaan menemisen.'},{id:'help',label:'Avun kutsuminen turvasta',guide:'Varmistaa ilmoituksen hätänumeroon112 sekä tiedon tapahtumasta ja paikasta. Ei jää odottamaan.'},{id:'reason',label:'Perustelee järjestyksen',guide:'Yhdistää nopean turvaan siirtymisen ja avun varmistamisen; ei palaa hakemaan tavaroita.'}];
    }else {
      const view=model?.kind==='space'?model.mode:'day';
      prompt=view==='size'?'Selitä taulukon avulla Kuun, Maan ja Auringon kokojärjestys. Erota halkaisija kohteiden välisestä etäisyydestä.':view==='distance'?'Vertaa taulukon keskimääräisiä Maa–Kuu- ja Maa–Aurinko-etäisyyksiä ja perustele oma päätelmäsi.':view==='seasons'?'Selitä tämän akselin suunnan avulla pohjoisen ja etelän vuodenajat. Miksi pelkkä etäisyys Aurinkoon ei selitä tätä mallia?':'Selitä tämän mallin paikan A ja vastakkaisen paikan B päivä ja yö. Kerro, miten tilanne muuttuu Maan pyöriessä.';
      rubric=view==='size'||view==='distance'?[{id:'comparison',label:'Oma vertailu',guide:view==='size'?'Järjestää Kuun, Maan ja Auringon halkaisijan avulla ja viittaa annettuihin lukuihin.':'Päättelee Kuun olevan keskimäärin lähempänä Maata ja käyttää annettuja etäisyyksiä.'},{id:'scale',label:'Erottelee mittakaavat',guide:'Erottaa kappaleen koon kohteiden välisestä etäisyydestä; ei tulkitse kuvan kaikkia välejä samaksi mittakaavaksi.'}]:[{id:'observation',label:'Oma havainto tästä asennosta',guide:view==='seasons'?'Nimeää tässä asennossa vastakkaiset vuodenajat pohjoisessa ja etelässä.':'Nimeää valaistun ja varjossa olevan paikan tästä mallista, myös toisella puolella olevan paikan.'},{id:'mechanism',label:'Ilmiön syy',guide:view==='seasons'?'Selittää akselin kallistuksen, valon tulokulman ja päivän pituuden. Etäisyys ei ole syy tässä mallissa.':'Yhdistää päivän ja yön Maan pyörimiseen oman akselinsa ympäri, ei vuotuiseen kiertoon.'},{id:'prediction',label:'Perusteltu muutos',guide:view==='seasons'?'Kuvaa, miten vastakkaisen kiertorata-asennon valotilanne vaihtuu.':'Ennakoi saman paikan siirtyvän valosta varjoon tai takaisin pyörimisen edetessä.'}];
    }
    const example=id==='CHEM79-FIRE-SAFE'&&model.kind==='fire-safety'&&model.view==='conditions'?`${q.explain} Tässä retkikatostilanteessa kuljen Aavan kanssa savutonta laituripolkua turvapaikalle. Aava varmistaa sieltä hätäilmoituksen numeroon 112. En mene savuun enkä palaa hakemaan tavaroita.`:q.explain;
    const task:ObservedExplanationTask={kind:'observed-explanation',channel:'spoken',allowEitherChannel:true,givens:[],prompt,rubric,model:example};
    return {...q,task,say:prompt};
  }};
});
export const integrationExplanationEvidence=Object.fromEntries(integrationExplanationIds.map(id=>[id,{families:integrationExplanationSpecs.find(s=>s.id===id)!.produce??[],limit:'V2 edellyttää omaa tapauskohtaista selitystä, jonka ihminen arvioi nimettyjen havaintojen avulla. V1:n valintanäyttö säilyy historiassa suppeampana. Puhetta, kirjoitettua selitystä tai vapaata palautetta ei tallenneta. Virtuaalinen turvallisuustehtävä ei todista fyysistä toimintaa hätätilanteessa.'}]));
