/** Node-local visual epilogues. They do not assess or create evidence. */
export type ClimaxId='M-FRAC-13'|'M-GMEAS-05'|'M-SCALE-03'|'PHY79-FORCE-MOTION'|'PHY79-ACTIONPAIR'|'PHY79-PARALLEL'|'CHEM79-FIRE-SAFE'|'M-GEO-06'|'M-GEO-17'|'M79-POWER-POWER'|'PHY79-UNIVERSE-STRUCT'|'M-REP-02';
export type ClimaxFixture='channel'|'crate'|'map'|'brake'|'boat'|'circuit'|'safety'|'sail'|'lighthouse'|'tower'|'stars'|'notebook';
export interface ClimaxStory {id:ClimaxId; fixture:ClimaxFixture; character:'aava'|'loikka'|'sulka'; title:string; cause:string; middle:string; result:string; durationMs:10000; worldEffectId:string;}
const story=(id:ClimaxId,fixture:ClimaxFixture,character:ClimaxStory['character'],title:string,cause:string,middle:string,result:string):ClimaxStory=>({id,fixture,character,title,cause,middle,result,durationMs:10000,worldEffectId:`world.${id}.resolved`});
/** Concrete start → visible cause → persistent result storyboard for each leaf. */
export const authoredClimaxes:Readonly<Record<ClimaxId,ClimaxStory>>={
 'M-FRAC-13':story('M-FRAC-13','channel','aava','Yhteinen sivu-uoma','Kaksi osuutta asetetaan samaan jakoon.','Yhteisannos ohjataan sivu-uomaan.','Sovitun annoksen kanava on valmis majavan rakennusvuorolle.'),
 'M-GMEAS-05':story('M-GMEAS-05','crate','loikka','Varastolaatikko','Annettu laatikkomalli saa kerrokset.','Kerrokset täyttävät varastolaatikon.','Varastolaatikko on valmis retkipaikalle.'),
 'M-SCALE-03':story('M-SCALE-03','map','aava','Retkikartan reitti','Kartalle merkitty reitti opastaa ystäviä.','Polun merkki etenee havaintopaikkaan.','Havaintopaikka merkitään retkikarttaan.'),
 'PHY79-FORCE-MOTION':story('PHY79-FORCE-MOTION','brake','loikka','Vaunun pysäytys','Liikkuva vaunu lähestyy jarrua.','Erillinen vastakkaissuuntainen jarrutus hidastaa vaunua.','Vaunu pysähtyy hallitusti tasanteelle.'),
 'PHY79-ACTIONPAIR':story('PHY79-ACTIONPAIR','boat','loikka','Airo ja vesi','Airo työntää vettä taaksepäin.','Vesi vaikuttaa airoon vastakkaiseen suuntaan.','Mallivene irtoaa rannasta.'),
 'PHY79-PARALLEL':story('PHY79-PARALLEL','circuit','sulka','Kaksi valaistua rantaa','Kaksi rinnakkaista haaraa yhdistyy lähteeseen.','Kummankin rannan lamppu syttyy.','Ystävät löytävät toisensa vastakkaisilta laitureilta.'),
 'CHEM79-FIRE-SAFE':story('CHEM79-FIRE-SAFE','safety','sulka','Turvaniemen odotus','Kuvitteellisessa mallissa aikuiset hoitavat tilanteen.','Ystävät odottavat turvapaikalla aikuisten lupaa.','Suojeltu metsäsaareke näkyy rauhallisena. Tämä on kuvitteellinen tarina.'),
 'M-GEO-06':story('M-GEO-06','sail','aava','Mallipurje','Rakennettu purjemalli kohtaa veneen kiinnityspisteet.','Purje nostetaan mastoon.','Purje sopii veneen mallikiinnitykseen.'),
 'M-GEO-17':story('M-GEO-17','lighthouse','aava','Kartiokatto','Ympyräpohjainen kartio sovitetaan valohuoneeseen.','Kartio laskeutuu tornin päälle.','Kartiokatto suojaa majakan valohuonetta.'),
 'M79-POWER-POWER':story('M79-POWER-POWER','tower','sulka','Kerrostettu koetorni','Sama lyhtyryhmä toistuu ryhminä.','Ryhmiä asetetaan suunniteltuihin kerroksiin.','Koetorni asettuu suunnitelmaan.'),
 'PHY79-UNIVERSE-STRUCT':story('PHY79-UNIVERSE-STRUCT','stars','loikka','Tähden osoite','Kotisaari sijoitetaan planeettakunnan malliin.','Planeettakunta saa paikkansa galaksin arkistossa.','Ystävät katsovat yhteistä tähtitaivasta; mittakaavat ovat havainnollisia.'),
 'M-REP-02':story('M-REP-02','notebook','aava','Vihkon viesti','Vihkoon rakennettu kuva kertoo jaon.','Aava seuraa kuvan ryhmiä.','Kuvan mukainen paikallinen jako on valmis.')};
export const climaxIds=Object.keys(authoredClimaxes) as ClimaxId[];
export const AUTHORED_CLIMAX_IDS:readonly ClimaxId[]=climaxIds;
export function hasAuthoredClimax(id:string):id is ClimaxId {return Object.prototype.hasOwnProperty.call(authoredClimaxes,id);}
export function climaxPhase(elapsed:number):'start'|'action'|'end' {return elapsed<2500?'start':elapsed<8000?'action':'end';}
export function climaxPhaseText(story:ClimaxStory,elapsed:number):string {const p=climaxPhase(elapsed);return p==='start'?story.cause:p==='action'?story.middle:story.result;}
