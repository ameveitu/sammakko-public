import type { Item, NodeSpec, Phase } from '../engine/types';
import type { Rng } from '../engine/rng';
import { safetyHarborBoard, safetyHarborExample } from './scenes/safety-harbor';
import { type SafetyHarborTask, type SafetyCase, type SafetyProcedure, type SafetyPictogram,
  type SafetyReview, type SafetyLabelClaim, safetyHarborScope } from './models/safety-harbor';
type Variant = 'build' | 'contrast' | 'transfer';
type Author = (r: Rng, variant: Variant) => SafetyCase[];
type SafetyItem = Omit<Item, 'task'> & { task: SafetyHarborTask };
const context = { title: 'Tämän kuvitteellisen tilanteen ohjeet ja vaarahavainnot', skills: [] as string[] };
const places = ['Retkitalon varasto', 'Tutkimusvajan pöytä', 'Laiturin huoltotila', 'Leirikeittiön eteinen'];
function procedure(r: Rng, variant: Variant, situation: SafetyProcedure['situation'], id = 'decision'): SafetyProcedure {
  const friendsNearby = r.chance(.5), foodNearby = situation === 'unknown' || situation === 'exposure' || situation === 'chemistry' ? r.chance(.5) : false;
  const labelled = situation === 'chemistry' ? variant !== 'contrast' : situation === 'unknown' ? r.chance(.5) : true;
  const protectionRequired = situation === 'physics' || situation === 'chemistry' ? r.chance(.5) : false;
  const machineRunning = situation === 'physics' && variant !== 'build';
  const lifeThreatening = situation === 'exposure' && variant === 'contrast';
  const fault = r.pick(['Johdon eristys on halki', 'Pistotulpan kuori on rikki', 'Vaurioitunut johdin on näkyvissä', 'Laitteen kotelo on rikkoutunut']);
  const place = variant === 'transfer' ? 'Uuden retkirakennuksen huoltotila' : places[situation === 'unknown' ? 0 : situation === 'electric' ? 2 : situation === 'exposure' ? 3 : 1]!;
  const facts = situation === 'electric' ? [fault + '.', variant === 'build' ? 'Vaurion vieressä on vettä. Laite on liitetty sähköverkkoon.' : 'Huone on kuiva. Laite on liitetty sähköverkkoon. Kuivuus ei korjaa vauriota.', 'Korjaamisen hoitaa sähköalan ammattilainen.'] :
    situation === 'exposure' ? [r.pick(['Juomapullon näköisessä astiassa on tuntematonta ainetta.', 'Eväspaikan lähellä on kemikaalipakkaus.', 'Lääkepakkaus on joutunut ruokailupaikalle.', 'Väärä pullo on ollut käden ulottuvilla.']),
      'Tässä kuvitteellisessa tilanteessa epäillään aineen joutuneen suuhun.', lifeThreatening ? 'Ystävä on tajuton tai hengittäminen on vaikeaa. Aikuinen on aivan vieressä. Hälytä apu heti 112:sta. Ruokailun järjestely voi odottaa.' : 'Ystävä on hereillä ja hengittää normaalisti. Aikuinen on aivan vieressä.',
      'Myrkytysepäily kuuluu ammattilaisen arvioon. Hoitoa ei kokeilla itse eikä okseteta. HUS Myrkytystietokeskus 0800 147 111. Henkeä uhkaavassa tilanteessa 112.'] :
    situation === 'physics' ? [variant === 'transfer' ? 'Virtuaalisen liikemittarin liukuva osa odottaa säätöä.' : 'Virtuaalisen tuulitunnelin liikkuva osa odottaa säätöä.',
      machineRunning ? 'Malli on käynnissä. Liikkuva osa pysäytetään ennen säätöä.' : 'Malli on jo pysäytetty. Tarkista tila ennen säätöä.',
      protectionRequired ? 'Annettu ohje vaatii suojan ja suojalasit ennen havainnointia.' : 'Annettu ohje vaatii kiinteän suojan takaa havainnoinnin. Lisäsuojaimia ei tässä mallissa vaadita.'] :
    situation === 'chemistry' ? [labelled ? 'Kaikilla virtuaalinäytteillä on alkuperäiset tunnisteet. Kohdista näytteet ennen toimintaa.' : 'Yhden virtuaalinäytteen tunniste puuttuu. Työ pysäytetään ja havainto kerrotaan aikuiselle.',
      protectionRequired ? 'Tämän virtuaalityön ohje vaatii suojalasit ja ohjeen mukaisen suojauksen.' : 'Ohjeen tässä kuivassa korttityössä lisäsuojaimia ei vaadita. Ohje ja tunnisteet tarkistetaan silti.',
      'Aikuinen vastaa varsinaisesta kemikaalityöstä.'] : [labelled ? 'Alkuperäisessä nimetyssä pakkauksessa on aikuisen käyttöön kuuluva kemikaali väärässä paikassa. Sen oma ohje on luettavissa.' : 'Pakkauksesta puuttuu aineen nimi ja käyttöohje. Sisältöä ei tunnisteta ulkonäöstä.',
      variant === 'transfer' ? 'Neste on houkuttelevan väristä. Väri ei osoita sitä ruoaksi tai turvalliseksi.' : 'Pakkaus on juomapullon näköinen. Muoto ei kerro sisällön turvallisuutta.'];
  return { id, mode: 'procedure', title: place, situation, friendsNearby, foodNearby, labelled, protectionRequired, machineRunning, lifeThreatening,
    facts: [...facts, friendsNearby ? 'Ystävät ovat lähellä vaarakohdetta. Varoita heitä.' : 'Ystävät ovat jo erossa vaarakohteesta.', ...(foodNearby ? ['Kemikaalipaikka ja ruokailu suunnitellaan erilleen.'] : [])] };
}
const codes: SafetyPictogram[] = ['ghs01', 'ghs02', 'ghs03', 'ghs04', 'ghs05', 'ghs06', 'ghs07', 'ghs08', 'ghs09'];
function label(r: Rng, variant: Variant, id = 'label'): SafetyCase {
  const selected = r.pick(codes), second = codes[(codes.indexOf(selected) + r.int(1, 8)) % codes.length]!;
  const symbols = variant === 'contrast' ? [selected, second] : [selected];
  const ventilation = symbols.includes('ghs04') || r.chance(.5), heatSeparation = symbols.some(id => ['ghs01', 'ghs02', 'ghs03', 'ghs04'].includes(id)) || r.chance(.5), waterProtection = symbols.includes('ghs09') || r.chance(.5), foodSeparation = r.chance(.5);
  const requirements = { ventilation, heatSeparation, waterProtection, foodSeparation };
  const instruction = ['Vain aikuisen huoltotyöhön. Säilytä alkuperäispakkauksessa lasten ulottumattomissa. Älä yhdistä muihin tuotteisiin.',
    ...(ventilation ? ['Tämä ohje vaatii riittävän ilmanvaihdon.'] : []), ...(heatSeparation ? ['Säilytä erossa lämmöstä ja sytytyslähteistä.'] : []),
    ...(waterProtection ? ['Estä aineen pääsy vesistöön ja viemäriin.'] : []), ...(foodSeparation ? ['Säilytä erillään elintarvikkeista.'] : [])].join(' ');
  const wrongMeaning = r.chance(.5);
  const proposal: SafetyLabelClaim[] = [{ id: 'meaning-proposal', kind: 'meaning', symbol: selected, meaning: wrongMeaning ? second : selected }, { id: 'handling-proposal', kind: 'action', action: wrongMeaning ? 'read-instruction' : 'mix' }];
  return { id, mode: 'label', ...(variant === 'contrast' ? { proposal } : {}), title: variant === 'transfer' ? 'Uuden huoltotilan oma pakkaus' : 'Pakkauksen viesti', product: 'Kuvitteellinen huoltopakkaus',
    pictograms: symbols, packageColor: variant === 'transfer' ? '#d4c4dd' : '#c8dce0', instruction, requirements,
    facts: ['Opetusetiketti. Lue tämän tuotteen oma ohje. Pakkauksen ulkoväri ei määritä vaaraa.'] };
}
function conditions(r: Rng, variant: Variant): SafetyCase {
  const factors = ['fuel', 'oxidizer', 'heat'] as const, factor = r.pick(factors);
  const present = { fuel: r.chance(.5), oxidizer: r.chance(.5), heat: r.chance(.5) };
  present[factor] = variant === 'build';
  const change = { factor, available: variant !== 'build' };
  const example = variant === 'build' ? 'paper-model' as const : variant === 'contrast' ? 'wax-model' as const : 'gas-card-model' as const;
  return { id: 'conditions', mode: 'fire-conditions', example, title: variant === 'transfer' ? 'Uuden suljetun mallin ehtotaulu' : 'Tulen ehtomalli', present, change,
    facts: [example === 'paper-model' ? 'Suljettu animaatiomalli rakennuspaperin palamisen ehdoista.' : example === 'wax-model' ? 'Erillinen vahakorttimalli palamisen ehdoista.' : 'Uusi polttoainekaasun tietokorttimalli. Kaasua ei käsitellä.', 'Tässä palaminen tarvitsee palavan aineen, hapettavan ympäristön ja riittävän lämpötilan.',
      'Muutos tehdään vain piirroksen tilaan. Oikeaa tulta tai kemikaalikoetta ei toteuteta.'] };
}
function evacuation(r: Rng, variant: Variant, id = 'map'): SafetyCase {
  const shelterInPlace = variant === 'contrast', blocked = r.int(0, 2), friendsNearby = r.chance(.5), closeDoor = variant !== 'build';
  const branchLabels = r.pick([['Rantapolku', 'Kivipolku', 'Metsäpolku'], ['Pohjoisovi', 'Eteläovi', 'Sivuovi'], ['Ikkunapiha', 'Puutarha', 'Takapiha']] as const);
  const nodes = [{ id: 'start', label: shelterInPlace ? 'Oma savuton huoneisto' : variant === 'transfer' ? 'Uuden rakennuksen aula' : 'Retkiryhmän lähtöpaikka', x: 30, y: 60, state: 'clear' as const, safe: shelterInPlace },
    ...branchLabels.map((label, i) => ({ id: `way${i}`, label, x: 145, y: 16 + i * 45, state: shelterInPlace || i === blocked ? 'smoke' as const : 'clear' as const, safe: false })),
    { id: 'meeting', label: 'Turvallinen kokoontumispaikka', x: 265, y: 60, state: 'clear' as const, safe: true }];
  return { id, mode: 'evacuation', title: shelterInPlace ? 'Savu naapurista porraskäytävään' : variant === 'transfer' ? 'Uuden rakennuksen poistumiskartta' : 'Savuviesti metsästä',
    start: 'start', shelterInPlace, closeDoor, friendsNearby, nodes, edges: branchLabels.flatMap((_, i) => [['start', `way${i}`], [`way${i}`, 'meeting']] as const),
    facts: [shelterInPlace ? 'Palo muualla talossa. Oma huoneisto on savuton eikä pala. Porraskäytävässä on savua. Pysy sisällä ja kerro sijaintisi 112:een.' :
      'Karttaan merkitty savuton reitti vie kokoontumispaikkaan. Savuiseen suuntaan ei mennä eikä tavaroita palata hakemaan.', closeDoor ? 'Suojaava ovi suljetaan annetun suunnitelman mukaan.' : 'Tässä ulkokartassa ei ole suljettavaa ovea.',
      friendsNearby ? 'Varoita lähellä olevaa ryhmää.' : 'Ryhmää on jo varoitettu.', 'Hätäilmoitus harjoitellaan turvallisesta paikasta. Aikuiset hoitavat vaarallisen pelastustyön. Paluuseen odotetaan lupa.'] };
}
function electric(r: Rng, variant: Variant): SafetyCase {
  const shock = variant !== 'contrast', topology = r.int(0, 3), wire = variant === 'transfer' ? 'Uuden laitteen johto' : 'Valaisimen johto';
  const routes = [['source', 'wire', 'body', 'return'], ['source', 'branch', 'body', 'return'], ['source', 'branch', 'wire', 'body', 'return'], ['source', 'wire', 'branch', 'body', 'return']][topology]!;
  const via = shock ? 'body' : 'resistance';
  return { id: 'circuit', mode: 'electric-path', title: variant === 'transfer' ? 'Toisen laitteen suojaeristys' : 'Mahdollinen virtareitti ja energiansiirto',
    source: 'source', returnNode: 'return', via, risk: shock ? 'shock' : 'heating', insulation: variant === 'transfer' ? 'intact' : 'damaged',
    nodes: [{ id: 'source', label: 'Jännitelähde', x: 25, y: 60 }, { id: 'wire', label: wire, x: 100, y: 25 },
      { id: via, label: shock ? 'Ihminen mahdollisella vikareitillä' : 'Vaurion kuumeneva kohta', x: 180, y: 60 },
      { id: 'return', label: 'Paluu lähteeseen', x: 275, y: 60 }, { id: 'branch', label: 'Kytkentäjohdin', x: 100, y: 100 }],
    edges: routes.slice(1).map((id, i) => [routes[i] === 'body' ? via : routes[i]!, id === 'body' ? via : id] as const),
    facts: [shock ? 'Kaavio esittää mahdollisen vikatilanteen. Kosketuksen kautta sulkeutuva virtareitti voi aiheuttaa sähköiskun.' : 'Kaavio esittää johtimen vauriokohtaa. Virtapiirissä siirtyvä energia voi kuumentaa kohtaa ja aiheuttaa palovaaran.',
      variant === 'transfer' ? 'Ehjä suojaeristys estää tahattoman kosketuksen. Rakenna malliin mahdollinen reitti, joka voisi syntyä eristyksen vaurioituessa.' : 'Eristys on vaurioitunut. Näkyvän kipinän puuttuminen ei tee vauriosta turvallista.',
      'Tämä on erillinen piirrosmalli. Vaurio jätetään rauhaan ja ilmoitetaan aikuiselle. Oikean sähkökorjauksen hoitaa sähköalan ammattilainen.'] };
}
const review: SafetyReview = { prompt: 'Kerro omin sanoin, miten tämän tilanteen tiedot johtivat päätökseesi ja mitä aikuinen hoitaa.',
  rubric: [{ id: 'link', label: 'Oma perustelu yhdistää havainnon toimintaan', guide: 'Kytkee jokaisen kysytyn päätöksen juuri tämän tilanteen annettuihin tietoihin. Eri tilanteet voivat tarvita eri toiminnan.' },
    { id: 'limit', label: 'Rajaa toiminnan turvallisesti', guide: 'Selittää avun tarpeen ja oman turvallisen paikan. Ei esitä vaaran lähestymistä tai omaa korjaus-, sammutus- tai hoitokokeilua.' }],
  model: 'Vaarahavainto, paikallinen ohje ja turvallinen paikka kuuluvat yhteen. Virtuaalinen suunnitelma antaa aikuiselle tiedon. Vaarallisen työn hoitaa siihen sopiva aikuinen tai ammattilainen.' };

const stories: Record<string, { title: string; intro: string; goal: string; reward: string }> = {
  "CHEM79-CHEMICAL-SAFE": {
    "title": "Retkivaraston selkeä sopimus",
    "intro": "Aava huomaa pakkauksessa sekä varoitusmerkin että käyttöohjeen. Sulka pyytää kokoamaan niistä yhden turvallisen päätöksen, jonka huoltaja ymmärtää.",
    "goal": "Tulkitse merkintä ja sovella juuri kyseistä ohjetta samaan virtuaalitilanteeseen; kumpikin osa tarvitsee näkyvän perustelun.",
    "reward": "Huoltaja hyväksyy varaston järjestelyn, ja retkeläiset voivat käyttää muuta tilaa turvallisesti."
  },
  "CHEM79-CHEMICAL-USE-SAFE": {
    "title": "Ohje kuuluu aineelle",
    "intro": "Retkitalon huoltaja näyttää Aavalle kaksi samannäköistä puhdistusainepakkausta. Loikka oppii, ettei yhden pakkauksen ohjetta voi siirtää toiselle.",
    "goal": "Yhdistä kyseisen pakkauksen käyttöohje sopivaan virtuaaliseen toimintaan; hylkää sekoittaminen ja omat käyttötarkoitukset.",
    "reward": "Huoltosuunnitelma valmistuu aikuiselle, ja lasten retkitila pysyy erillään kemikaalityöstä."
  },
  "CHEM79-FIRE-ACTION": {
    "title": "Kaikki mukaan turvaniemeen",
    "intro": "Kuvitteellisen metsäpaloharjoituksen kartassa osa poluista suljetaan. Aava huolehtii ryhmän kokoontumisesta, kun aikuiset hoitavat vaarallisen pelastustyön.",
    "goal": "Valitse turvallinen poistuminen ja ilmoittaminen annetun ohjeen mukaan; perustele, miksi liekkejä ei lähestytä eikä tavaroita palata hakemaan.",
    "reward": "Kaikki retkeläiset näkyvät kokoontumispaikan kuvassa, ja aikuisten ryhmä saa tiedon."
  },
  "CHEM79-FIRE-CONDITIONS": {
    "title": "Tulen kolme ehtoa mallissa",
    "intro": "Sulka näyttää suljetun animaatiomallin palamisesta, ei sytytettävää koetta. Aava tutkii, miksi palaminen jatkuu vain tiettyjen edellytysten täyttyessä.",
    "goal": "Yhdistä palava aine, hapettava ympäristö ja riittävä lämpötila; ennusta mallin muutos yhden edellytyksen puuttuessa.",
    "reward": "Metsän tähystysaseman selitystaulu valmistuu aikuisten pelastusviestin tueksi."
  },
  "CHEM79-HAZARD-LABEL": {
    "title": "Varoitusmerkin viesti",
    "intro": "Sulka asettaa virallisia varoitusmerkkejä vastaavat tarkistetut kuvakkeet pöydälle. Aava haluaa tietää, mitä ne kertovat ennen kuin tekee mitään pakkaukselle.",
    "goal": "Yhdistä merkki sen vaaraan ja valitse ohjeeseen perustuva toimintaperiaate; merkkiä ei päätellä punaisen värin voimakkuudesta.",
    "reward": "Retkivaraston ohjetaulu saa ymmärrettävät merkitykset, ja väärä oletus väistyy."
  },
  "CHEM79-SAFE-01": {
    "title": "Sulan laboratorion ovella",
    "intro": "Aava haluaa tutkia aineita huolellisesti, ja Loikka yrittää kantaa liian monta näyteastiaa kerralla. Sulka kutsuu molemmat sopimaan työjärjestyksen.",
    "goal": "Valitse virtuaalityön suojaus, ohjeen lukeminen, näytteiden tunnistaminen ja häiriötilanteen ilmoittaminen; vaarallista koetta ei toteuteta.",
    "reward": "Laboratorion tutkimuspöytä avautuu valmiina, ja näytteet pysyvät tunnistettavina."
  },
  "ENV-CHEM-CHEMICAL-SAFE-01": {
    "title": "Pullo, jolla ei ole nimeä",
    "intro": "Retkivarastossa on merkitsemätön pullo, jota Aava ei tunnista. Sulka pysäyttää tutkimisen ennen kuin Loikka alkaa kokeilla sen sisältöä.",
    "goal": "Valitse tuntemattoman aineen jättäminen rauhaan ja aikuisen kutsuminen; tunnista alkuperäisen pakkauksen ja ohjeiden merkitys.",
    "reward": "Varasto saa turvallisen rajauksen ja aikuisen selvittämä pullo poistuu lasten tutkimuspöydältä."
  },
  "ENV-CHEM-FIRE-SAFE-01": {
    "title": "Savuviesti kaukaa",
    "intro": "Tähystyspaikalta näkyy kuvitteellinen savumerkki metsässä. Aava kutsuu ystävät turvalliselle kokoontumispaikalle, ja Sulka huolehtii aikuisen avun välittämisestä.",
    "goal": "Valitse etääntyminen, turvallinen paikka ja aikuiselle ilmoittaminen; tehtävä ei edellytä tulen lähestymistä tai sammuttamista.",
    "reward": "Retkeläiset löytyvät kokoontumispaikalta ja aikuisten pelastusryhmä saa tiedon."
  },
  "ENV-CHEM-HOMECHEM-SAFE-01": {
    "title": "Turvaniemen retkitalo",
    "intro": "Aava valmistelee retkitaloa vieraille ja huomaa kolme erilaista turvallisuuskysymystä. Loikka toimii yhteisten ohjeiden mukaan, eikä kaikkeen etsitä samaa ratkaisua.",
    "goal": "Ratkaise erilliset kemikaalin käyttöä, mahdollista altistusta ja palotilannetta kuvaavat virtuaaliset valinnat; perustele aikuisen avun tarve.",
    "reward": "Retkitalon pihalle kokoontuvat kaikki ystävät ja ovi avautuu turvalliseen yhteiseen iltaan."
  },
  "ENV-CHEM-POISON-SAFE-01": {
    "title": "Eväskorin väärä pullo",
    "intro": "Aava huomaa eväskorin lähellä pullon, joka ei kuulu ruokailuun. Loikka oppii, ettei pakkauksen tuttu muoto kerro sisällön turvallisuudesta.",
    "goal": "Erota ruoka ja tuntematon kemikaali; valitse välitön aikuisen apu epäillyssä altistuksessa, ilman omaa hoitokokeilua.",
    "reward": "Eväspaikka järjestyy turvalliseksi ja huoli siirtyy osaavan aikuisen hoidettavaksi."
  },
  "ENV-PHY-ELECSAFE-01": {
    "title": "Märkä laituri, ehjä valo",
    "intro": "Aava huomaa laiturin kuvassa viallisen johdon lähellä vettä. Loikka haluaisi korjata valon heti, mutta Sulka ohjaa jättämään sen aikuisen hoidettavaksi.",
    "goal": "Valitse kuvitteellisessa tilanteessa etäisyyden säilyttäminen ja aikuiselle ilmoittaminen; erota turvallinen virtuaaliparistomalli oikeasta sähköasennuksesta.",
    "reward": "Aikuinen huoltaja turvaa alueen ja laiturin kulkureitti voidaan avata."
  },
  "PHY79-ELEC-SAFE": {
    "title": "Miksi vaurioitunutta johtoa ei kosketa?",
    "intro": "Aava tarvitsee laiturin turvakyltille selityksen pelkän kiellon lisäksi. Sulka avaa erillisen mallin, jossa virtapiiri ja energiansiirto tekevät riskin ymmärrettäväksi.",
    "goal": "Liitä vaurio ja mahdollinen virtareitti sähköiskun tai kuumenemisen riskiin; valitse todellisessa tilanteessa aikuisen hoitama turvallinen toiminta.",
    "reward": "Aava välittää perustellun vaarahavainnon huoltajalle. Aikuinen korjaa kuvitteellisen laituritilanteen, ja ystävät pääsevät luvan saatuaan jatkamaan turvallista tutkimusvierailua."
  },
  "PHY79-SAFE-01": {
    "title": "Tuulitunnelin suojattu ikkuna",
    "intro": "Sulka esittelee virtuaalista tuulitunnelia, jonka liikkuvia osia katsotaan suojan takaa. Aava varmistaa, että tutkimus voidaan pysäyttää ennen säätöjä.",
    "goal": "Valitse tehtävän turvallinen valmistelu, suojattu havaintotapa ja pysäytyksen oikea käyttö; harjoittele niitä tekemällä.",
    "reward": "Tutkimuspaikan kuvitteelliset riskit on tunnistettu ja oikeat turvapäätökset tehty. Sulka avaa valmiin havaintoikkunan, ja ystävät voivat tutkia ilmiötä turvallisesti yhdessä."
  }
};
interface Definition { id: string; author: Author; families: readonly [string, string]; ownExplanation?: boolean; limit: string }
const definitions: Definition[] = [
  { id: 'ENV-CHEM-CHEMICAL-SAFE-01', author: (r, v) => [procedure(r, v, 'unknown')], families: ['unknown-original-identity', 'misplaced-labelled-package'], limit: 'Vaaran tunnistus ja toteutettu virtuaalinen avun hakeminen. Aineen identiteettiä ei päätellä ulkonäöstä.' },
  { id: 'ENV-CHEM-POISON-SAFE-01', author: (r, v) => [procedure(r, v, 'exposure')], families: ['suspected-exposure-professional-advice', 'life-threatening-emergency-help'], limit: 'Rajattu kuvitteellisen myrkytysepäilyn avunhakupolku. Omia hoitokokeita ei arvioida eikä ohjata.' },
  { id: 'ENV-CHEM-FIRE-SAFE-01', author: (r, v) => [evacuation(r, v)], families: ['smoke-free-escape', 'smoky-stairway-shelter'], limit: 'Oma savuton virtuaalikarttapolku ja paikallisiin ehtoihin sidottu ilmoittaminen.' },
  { id: 'ENV-CHEM-HOMECHEM-SAFE-01', author: (r, v) => [procedure(r, v, 'unknown', 'package'), procedure(r, v, 'exposure', 'exposure'), evacuation(r, v, 'fire')], families: ['three-situation-local-decisions', 'three-changed-condition-decisions'], ownExplanation: true, limit: 'Integraation kolme uutta tilannetta vaativat omat toteutetut vastauksensa ja oman aikuiselle tuotetun perustelun. Atomien hallintaa ei peritä tästä.' },
  { id: 'ENV-PHY-ELECSAFE-01', author: (r, v) => [procedure(r, v, 'electric')], families: ['damaged-device-near-water', 'damaged-device-dry-room'], limit: 'Vaurion turvallinen virtuaalinen käsittelypäätös sekä aikuiselle ilmoittaminen. Pieni tai kuiva laite ei tee vauriosta kosketusturvallista.' },
  { id: 'PHY79-ELEC-SAFE', author: (r, v) => [electric(r, v)], families: ['possible-shock-circuit', 'possible-heating-circuit'], ownExplanation: true, limit: 'Oma mahdollinen vikavirtareitti ja eristyksen tarkoituksen tunnistaminen. Oma syy–toiminta-perustelu vaatii aikuisen havainnon. Virtuaalipiirros ei arvioi sähköasennustaitoa.' },
  { id: 'PHY79-SAFE-01', author: (r, v) => [procedure(r, v, 'physics')], families: ['stopped-model-preparation', 'running-model-stop-before-adjustment'], limit: 'Ohjeeseen sidottu virtuaalinen valmistelu, pysäytys ja suojattu havainto. Fyysinen työskentely on erillinen näyttö.' },
  { id: 'CHEM79-SAFE-01', author: (r, v) => [procedure(r, v, 'chemistry')], families: ['identified-samples-and-protection', 'missing-label-stop-and-report'], limit: 'Virtuaalityön tunnisteiden, ohjeen, suojauksen ja häiriöilmoituksen ketju. Kanoniset safety_gate-suhteet säilyvät lähdetietona.' },
  { id: 'CHEM79-CHEMICAL-USE-SAFE', author: (r, v) => [label(r, v)], families: ['construct-product-specific-plan', 'repair-proposed-label-and-plan'], limit: 'Tämän annetun opetusetiketin ohjeeseen sidottu oma virtuaalinen käyttösuunnitelma. Piktogrammin merkitys on rajattu tunnistusnäyttö.' },
  { id: 'CHEM79-HAZARD-LABEL', author: (r, v) => [label(r, v)], families: ['construct-symbol-and-instruction-link', 'repair-proposed-symbol-or-use-claim'], limit: 'Virallisen GHS-symbolin tunnistus ja annetun tuotekohtaisen ohjeen soveltaminen. Luokitusmerkki ei yksin määritä altistumisriskiä eikä kaikkia käyttöehtoja.' },
  { id: 'CHEM79-CHEMICAL-SAFE', author: (r, v) => [label(r, v), procedure(r, v, 'chemistry', 'work')], families: ['construct-label-and-identified-work-plan', 'repair-label-and-interrupted-work-plan'], ownExplanation: true, limit: 'Integraation uusi etiketti, oma työvaiheketju ja aikuiselle tuotettu perustelu arvioidaan yhdessä. Aiempi atominen osaaminen ei korvaa tämän tilanteen näyttöä.' },
  { id: 'CHEM79-FIRE-CONDITIONS', author: (r, v) => [conditions(r, v)], families: ['remove-one-condition', 'supply-a-missing-condition'], limit: 'Ilmoitetun kolmen ehdon suljettu malli ja oma ennuste ennen havaintoa. Ei tulen sytyttämisen tai sammuttamisen tositoimintaa.' },
  { id: 'CHEM79-FIRE-ACTION', author: (r, v) => [evacuation(r, v)], families: ['own-smoke-free-escape-route', 'shelter-from-smoky-stairway'], ownExplanation: true, limit: 'Paikallisen ohjeen oma virtuaalinen reitti ja toimintaketju. Oma perustelu avun tarpeesta ja paluun rajasta arvioidaan aikuisen havainnolla.' },
];
function authored(def: Definition, r: Rng, phase: Phase): SafetyItem {
  const variant: Variant = phase === 'transfer' ? 'transfer' : r.pick(['build', 'contrast'] as const);
  const story = stories[def.id]!, cases = def.author(r, variant);
  // Families carry actual different supplied conditions, rather than a cosmetic tag.
  if ((def.id === 'ENV-CHEM-CHEMICAL-SAFE-01' || def.id === 'ENV-CHEM-HOMECHEM-SAFE-01') && cases[0]?.mode === 'procedure') {
    const item = cases[0]; item.labelled = variant === 'contrast';
    item.facts = [item.labelled ? 'Nimetty aikuisen kemikaalipakkaus on väärässä paikassa. Sen oma ohje on luettavissa.' : 'Pakkauksesta puuttuu nimi ja käyttöohje. Sisältöä ei tunnisteta ulkonäöstä.', ...item.facts.slice(1)];
  }
  let hash = 0xcbf29ce484222325n;
  for (const char of JSON.stringify(cases)) hash = BigInt.asUintN(64, (hash ^ BigInt(char.charCodeAt(0))) * 0x100000001b3n);
  const task: SafetyHarborTask = { kind: 'safety-harbor', title: story.title, run: `safety-${hash.toString(16)}`, context, cases, ...(def.ownExplanation ? { review } : {}) };
  const mode = cases[0]!.mode;
  const prompt = cases.length > 1 ? 'Ratkaise jokainen tilanne omalla turvapolulla. Perustele päätökset aikuiselle.' : mode === 'procedure' ? 'Kokoa ja toteuta tämän tilanteen turvallinen toimintaketju.' : mode === 'label' ? 'Tulkitse merkit. Korjaa mahdollinen luonnos ja kokoa pakkauksen oma suunnitelma.' : mode === 'fire-conditions' ? 'Tunnista kolme ehtoa. Ennusta muutos ennen mallihavaintoa.' : mode === 'electric-path' ? 'Rakenna mahdollinen virtareitti. Perustele riski ja eristyksen tehtävä aikuiselle.' : def.ownExplanation ? 'Rakenna turvapolku. Perustele turvallinen paikka ja avun tarve.' : 'Valitse tämän kartan turvallinen polku ja toteuta ilmoittaminen.';
  return { task, tag: variant === 'transfer' ? 'transfer' : def.families[variant === 'build' ? 0 : 1], scene: safetyHarborBoard(task), say: prompt,
    hint: 'Katso tämän tilanteen näkyvää ohjetta ja ehtoja. Suunnittele oma turvallinen toimintapolku ja toteuta se pöydällä.',
    explain: 'Paikallinen vaara, oma turvallinen paikka ja oikea apu kuuluvat yhteen. Erilaiset annetut olosuhteet voivat vaatia eri toimintaa.' };
}
export const safetyHarborSpecs: NodeSpec[] = definitions.map(def => {
  const story = stories[def.id]!, rev = `safety-harbor-${def.id.toLowerCase()}-v1`;
  return { id: def.id, stop: story.title, icon: '◈', intro: story.intro, goal: story.goal, reward: story.reward, rev, validRevs: [rev], produce: [...def.families],
    produceWhat: 'oma virtuaalinen toimintaketju, reitti, ehtomallin ennuste tai rajattu aikuishavainto',
    demo: r => { const item = authored(def, r, 'independent'); return [{ scene: item.scene!, say: story.goal }, { scene: safetyHarborExample(item.task), say: 'Sulka näyttää yhden tämän tilanteen mallipolun. Oma näyttö tehdään uudessa tilanteessa.' }]; },
    item: (r, phase) => authored(def, r, phase) as unknown as Item };
});
export const safetyHarborEvidence: Readonly<Record<string, { families: readonly string[]; limit: string }>> = Object.fromEntries(definitions.map(def => [def.id,
  { families: def.families, limit: `${def.limit} ${safetyHarborScope}` }]));
