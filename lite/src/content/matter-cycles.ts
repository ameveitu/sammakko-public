import type { Rng } from '../engine/rng';
import type { Item, NodeSpec, Phase } from '../engine/types';
import { cycleProcessEndpoints, cycleProcessNames, solutionMatterCycles, type CarbonNetworkTask, type CycleParcel, type CycleProcess, type CycleReservoir, type CycleReservoirKind, type CycleReview, type MatterCyclesTask, type ReservoirCard } from './models/matter-cycles';
import { matterCyclesScene, type MatterCyclesScene } from './models/matter-cycles-scene';
import { matterCyclesBoard, matterCyclesExample } from './scenes/matter-cycles';

type Variant = 'build' | 'repair' | 'transfer';
type CycleItem = Omit<Item, 'task' | 'sceneModel'> & { task: MatterCyclesTask; sceneModel?: MatterCyclesScene };
type TaskData = MatterCyclesTask extends infer T ? T extends MatterCyclesTask ? Omit<T, 'kind' | 'run' | 'title'> : never : never;
const context = (title: string, ...skills: string[]) => ({ title, skills });
const zone = (id: string, label: string, kind: CycleReservoirKind, x: number, y: number, elevation: number, description: string): CycleReservoir => ({ id, label, kind, x, y, elevation, description });
function conservation(r: Rng, variant: Variant): TaskData {
  const transfer = variant === 'transfer', condense = variant === 'repair';
  const source = transfer ? 'solid' : condense ? 'gas' : 'liquid', target = transfer ? 'solution' : condense ? 'liquid' : 'gas';
  const total = r.int(15, 50), amount = r.int(2, total - 2), solvent = transfer ? r.int(20, 55) : 0;
  const reservoirs = [zone(source, transfer ? 'Suolakiteet' : condense ? 'Kammion vesihöyry' : 'Kammion nestevesi', source, 50, 55, .3, transfer ? 'Sama suola säilyy myös liuoksessa.' : 'Rajattu suljettu vesikammio.'),
    zone(target, transfer ? 'Vesi ja siihen liukeneva suola' : condense ? 'Tiivistynyt nestevesi' : 'Kammion vesihöyry', target, 235, 55, .8, target === 'gas' ? 'Vesihöyry on näkymätöntä. Mallimerkki osoittaa sen sijaintia.' : 'Aine ei poistu kammion ulkopuolelle.')];
  const initial: CycleParcel[] = [{ id: 'sample', root: 'sample', reservoir: source, material: transfer ? 'solute' : 'water', amountMg: total, form: source }];
  if (transfer) initial.push({ id: 'solvent', root: 'solvent', reservoir: target, material: 'water', amountMg: solvent, form: 'liquid' });
  const kind = transfer ? 'dissolve' : condense ? 'condensation' : 'evaporation';
  return { mode: 'conservation', reservoirs, initial, material: transfer ? 'solute' : 'water', source, target, amountMg: amount, boundary: 'closed',
    energy: transfer ? 'mixing' : condense ? 'out' : 'in', context: context('Suljetun mallin annetut massat milligrammoina', 'M-ADD-01'),
    operation: { id: 'p1', kind, label: cycleProcessNames[kind], amountMg: amount, timescale: 'Yksi annettu mallimuutos', description: transfer ? `Liuota ${amount} mg suolaa annettuun veteen. Liuenneen aineen kapasiteetti riittää tähän annokseen. Koko kammio pysyy suljettuna.` : `${condense ? 'Tiivistä kaasusta nesteeksi' : 'Haihduta nesteestä kaasuksi'} ${amount} mg vettä. Energiaa ${condense ? 'siirtyy ulos' : 'tuodaan sisään'}. Ainetta ei päästetä ulos.` } };
}
function water(r: Rng, variant: Variant): TaskData {
  const amountMg = r.int(2, 20), reservoirs = [
    zone('sea', 'Meri', 'sea', 20, 115, 0, 'Seurantaveden lähtövarasto ja mahdollinen paluupaikka.'),
    zone('vapor', 'Ilmakehän vesihöyry', 'vapor', 75, 15, 1.7, 'Kaasumainen näkymätön vesi. Katkoviivamerkki on mallimerkintä.'),
    zone('cloud', 'Pilven pisarat / jääkiteet', 'cloud', 180, 15, 1.8, 'Pilvessä näkyvät pisarat tai jääkiteet ovat tiivistynyttä vettä.'),
    zone('snow', 'Vuoren lumivarasto', 'snow', 275, 48, 1.3, 'Vesi voi viipyä kiinteänä pidempään ennen sulamista.'),
    zone('river', 'Rinteen puro', 'river', 180, 90, .65, 'Nestemäinen vesi virtaa alaspäin painovoiman vaikutuksesta.'),
    zone('groundwater', 'Pohjavesi huokosissa', 'groundwater', 90, 150, .15, 'Vesi voi imeytyä maahan ja viipyä siellä ennen hidasta virtausta mereen.'),
  ];
  const kinds = ['evaporation', 'condensation', 'rain', 'runoff', 'infiltration', 'groundwater-flow', 'freezing', 'melting', 'store'] as const;
  const descriptions = [
    'Auringon energia mahdollistaa nesteveden haihtumista merestä ilmakehän vesihöyryksi.', 'Ilmakehän vesihöyry luovuttaa lämpöä ja tiivistyy pilven pisaroiksi tai kiteiksi.', 'Pilven nestepisarat putoavat painovoiman vaikutuksesta sateena rinteen puroon.',
    'Puron pintavesi valuu painovoiman vaikutuksesta mereen.', 'Osa puron vedestä imeytyy maaperän huokosiin.', 'Tässä mallissa pohjaveden pinnan korkeus on merenpinnan yläpuolella. Vesi virtaa hitaasti kohti alempaa meren pintaa.',
    'Tämän mallireitin pilvivesi luovuttaa lämpöä, jäätyy ja putoaa vuorelle lumena. Tämä yhdistelmä sisältää olomuodon muutoksen ja kuljetuksen.', 'Lumivaraston vesi sulaa lämmön vaikutuksesta ja siirtyy rinteen puroon.', 'Seurantavesi viipyy lumivarastossa ennen jatkoa. Ainetta ei katoa eikä määrä muutu.',
  ];
  return { mode: 'water-path', reservoirs, amountMg, initial: [{ id: 'tracked-water', root: 'tracked-water', reservoir: 'sea', material: 'water', amountMg, form: 'liquid' }],
    start: 'sea', finish: 'sea', requiredProcesses: variant === 'build' ? ['runoff'] : variant === 'repair' ? ['groundwater-flow'] : ['store'], mustVisit: variant === 'repair' ? ['vapor', 'cloud', 'groundwater'] : variant === 'transfer' ? ['vapor', 'cloud', 'snow'] : ['vapor', 'cloud', 'river'], mustStore: variant === 'transfer' ? 'snow' : null,
    processes: kinds.map((kind, i) => ({ id: `p${i + 1}`, kind, label: kind === 'freezing' ? 'Jäätyminen ja lumisade' : cycleProcessNames[kind], amountMg, description: descriptions[i]!, timescale: kind === 'store' || kind === 'groundwater-flow' ? 'Varastoviive on tässä mallissa aikatiivistetty.' : 'Yksi havainnollistava siirtymä.' })),
    context: context('Olomuodot ja yhden merkityn vesimäärän mahdollinen reitti', 'ENV-CHEM-STATE-01') };
}
function photo(r: Rng, variant: Variant, focus: 'full-process' | 'carbon-path' = 'full-process'): TaskData {
  const aquatic = variant === 'transfer', carbonMg = r.int(2, 20);
  return { mode: 'photosynthesis', focus, carbonMg, medium: aquatic ? 'aquatic' : 'land', variant: variant === 'repair' ? 'repair-energy-as-matter' : 'roles-and-trace', plant: aquatic ? 'water-plant' : 'leaf', context: context('Vesi, hiilidioksidi ja valo annetussa yhteyttämismallissa'),
    conditions: `Valokokeen kokonaan toteutuva malliannos sisältää ${carbonMg} mg CO₂:n hiiltä, ja vettä riittää. Toinen samanlainen annos tutkitaan ilman valoa. Seuraamme vain yhteyttämistä; hengitys on erillinen prosessi.`,
    cards: ([
      { id: 'a', material: 'water', label: 'Vesi H₂O', description: 'Ainetta, jonka vety ja happi osallistuvat kasvin aineenvaihduntaan.' },
      { id: 'b', material: 'co2', label: aquatic ? 'Veteen liuennut CO₂' : 'Ilman hiilidioksidi CO₂', description: 'Tämän mallin hiilen lähde kasvin orgaaniseen aineeseen.' },
      { id: 'c', material: 'organic', label: 'Kasvin muodostama orgaaninen aine', description: 'Sisältää hiilidioksidista peräisin olevaa hiiltä.' },
      { id: 'd', material: 'oxygen', label: 'Happi O₂', description: 'Yhteyttämisen yhteydessä muodostuvaa ja ympäristöön vapautuvaa ainetta.' },
      { id: 'e', material: 'light', label: 'Auringon valo', description: 'Energiaa, joka mahdollistaa yhteyttämisen. Se ei ole hiiliatomien rakennusaine.' },
      { id: 'f', material: 'soil', label: 'Maaperän kivennäisaineet', description: 'Kasvi tarvitsee myös kivennäisaineita, mutta tästä ei tule tämän mallin orgaanisen aineen hiili.' },
    ] as Extract<MatterCyclesTask, { mode: 'photosynthesis' }>['cards']).filter(card => focus === 'full-process' || ['b', 'c', 'e'].includes(card.id)) };
}
function carbonZones(aquatic = false, transfer = false): CycleReservoir[] {
  return [zone('air', 'Ilmakehä · CO₂', 'air', 70, 15, 1.6, 'Ilman hiilidioksidi sisältää hiiltä.'),
    zone('plant', aquatic ? 'Vesikasvit / levät' : transfer ? 'Kasvit ja tuore bioetanoli' : 'Kasvit ja tuore puuaines', 'plant', 190, 45, .75, 'Eliöiden ja tuoreen eliöperäisen orgaanisen aineen hiilivarasto.'),
    zone('animal', aquatic ? 'Veden eläimet' : 'Metsän eläimet', 'animal', 280, 105, .55, 'Ravinnosta eliöön siirtynyttä orgaanista hiiltä.'),
    zone('soil', aquatic ? 'Pohjan kuollut orgaaninen aines' : 'Maaperän kuollut orgaaninen aines', 'soil', 195, 145, -.05, 'Hajottajat käyttävät osan kuolleesta aineesta. Osa jää varastoon.'),
    zone('water', 'Vesistö · liuennut hiili', 'water', 15, 100, 0, 'Veteen liuennut hiilidioksidi ja muu epäorgaaninen hiili.'),
    zone('geological', transfer ? 'Fossiilisen propaanin varasto' : 'Fossiilisen metaanin varasto', 'geological', 80, 170, -.65, 'Geologinen varasto sisältää erikseen fossiilisen orgaanisen aineen ja karbonaattikiven hiiltä. Fossiilisen polttoaineen muodostuminen on pitkä prosessi.'),
  ];
}
function reservoirCards(reservoirs: readonly CycleReservoir[], amounts: readonly number[], variant: Variant): ReservoirCard[] {
  const labels: Record<string, string> = { air: 'Ilmakehän CO₂-näyte', plant: variant === 'transfer' ? 'Tuoreen bioetanolin näyte' : 'Kasvin glukoosinäytteen hiili', animal: 'Eläimen glukoosinäytteen hiili', soil: 'Maaperän orgaanisen aineen glukoosimalli', water: 'Vesistöön liuenneen CO₂:n näyte', geological: variant === 'transfer' ? 'Fossiilisen propaanin näyte' : 'Fossiilisen metaanin näyte' };
  const cards: ReservoirCard[] = reservoirs.map<ReservoirCard>((reservoir, i) => ({ id: `card${i + 1}`, label: labels[reservoir.kind]!,
    formula: (reservoir.kind === 'air' || reservoir.kind === 'water' ? { C: 1, O: 2 } : reservoir.kind === 'geological' ? variant === 'transfer' ? { C: 3, H: 8 } : { C: 1, H: 4 } : reservoir.kind === 'plant' && variant === 'transfer' ? { C: 2, H: 6, O: 1 } : { C: 6, H: 12, O: 6 }) as Readonly<Record<string, number>>,
    location: reservoir.kind as ReservoirCard['location'], description: `Näyte on vain yksi annetun varaston aine-esimerkki. ${reservoir.description}`, carbonMg: reservoir.kind === 'geological' ? amounts[i]! - Math.floor(amounts[i]! / 3) : amounts[i]! }));
  return [...cards, { id: 'carbonate-rock', label: 'Karbonaattikiven hiili', formula: { Ca: 1, C: 1, O: 3 }, location: 'geological', description: 'Kalkkikiven kalsiumkarbonaatti kuuluu geologiseen hiilivarastoon. Se ei ole tämän palamismallin fossiilinen polttoaine.', carbonMg: Math.floor(amounts[reservoirs.findIndex(r => r.kind === 'geological')]! / 3) }, { id: 'water-only', label: 'Puhtaan veden H₂O-kortti', formula: { H: 2, O: 1 }, location: 'water', description: 'Tämä molekyylikortti sisältää vain vetyä ja happea. Erota se hiiltä sisältävästä vesistön näytteestä.', carbonMg: 0 },
    ...(variant === 'repair' ? [{ id: 'process-card', label: 'Yhteyttäminen', formula: {}, location: 'process' as const, description: 'Tapahtuma, jossa hiiltä siirtyy ympäristöstä kasvin orgaaniseen aineeseen.', carbonMg: 0 }] : [])];
}
function reservoirs(r: Rng, variant: Variant): TaskData {
  const zones = carbonZones(variant === 'transfer', variant === 'transfer');
  return { mode: 'reservoirs', reservoirs: zones, cards: reservoirCards(zones, zones.map(() => r.int(2, 16)), variant), context: context('Annetun näytteen koostumus, hiilen määrä ja ympäristöpaikka', 'CHEM79-CARBON') };
}
function review(goal: CarbonNetworkTask['goal']): CycleReview {
  return { prompt: goal === 'burn' ? 'Selitä omin sanoin kahden polttoaineen hiilen lähtövarasto ja siirtymä ilmaan. Vertaa varastojen aikajänteitä.' : goal === 'photo' ? 'Selitä hiilen reitti yhteyttämisessä ja tämän paikallisen hiilitilin muutos muiden virtojen rinnalla.' : 'Selitä oman uuden kiertokarttasi varastot, nimetyt siirtymät ja yhden annetun muutoksen vaikutus.',
    rubric: [
      { id: 'matter', label: 'Jäljittää saman hiilen', guide: 'Yhdistää lähtöaineen hiilen oikeaan vastaanottavaan varastoon. Ei hävitä kaasua tai muuta valoa aineeksi.' },
      { id: 'process', label: 'Yhdistää prosessin omaan karttaan', guide: goal === 'burn' ? 'Erottaa tuoreen eliöperäisen ja fossiilisen lähteen sekä vapautuvan energian hiilen ainevirrasta.' : 'Käyttää oman mallin nimettyjä virtoja ja annettuja määriä. Erottaa yhteyttämisen myös hengityksestä ja hajotuksesta.' },
      { id: 'boundary', label: 'Rajaa päätelmän aikaan ja aineistoon', guide: 'Kertoo mitä annettu jakso osoittaa. Kierto ei takaa välitöntä paluuta tai koko maapallon muuttumatonta hiilitasetta.' },
    ], model: 'Seuraan saman hiilen lähtövarastosta toiseen nimettyä prosessia pitkin. Kaasussa oleva hiili kuuluu tiliin. Valo on energiaa ja kasvin orgaanisen aineen hiili tulee CO₂:sta. Tämän jakson muutos riippuu annetuista virroista; eri varastot ja pitkät viiveet säilyvät.' };
}
function network(r: Rng, variant: Variant, goal: CarbonNetworkTask['goal'], advanced: boolean): TaskData {
  const aquatic = variant === 'transfer' && goal !== 'burn', allZones = carbonZones(aquatic, variant === 'transfer'), zones = goal === 'burn' && !advanced ? allZones.filter(r => ['plant', 'air', 'water'].includes(r.kind)) : allZones;
  const initial: CycleParcel[] = zones.flatMap(reservoir => {
    const amountMg = r.int(24, 65);
    if (reservoir.kind === 'geological') {
      const carbonate = Math.floor(amountMg / 3);
      return [{ id: 'root-fossil', root: 'root-fossil', reservoir: reservoir.id, material: 'carbon' as const, amountMg: amountMg - carbonate, form: 'organic-carbon' as const }, { id: 'root-carbonate', root: 'root-carbonate', reservoir: reservoir.id, material: 'carbon' as const, amountMg: carbonate, form: 'inorganic-carbon' as const }];
    }
    return [{ id: `root-${reservoir.id}`, root: `root-${reservoir.id}`, reservoir: reservoir.id, material: 'carbon' as const, amountMg, form: ['air', 'water'].includes(reservoir.kind) ? 'inorganic-carbon' as const : 'organic-carbon' as const }];
  });
  const process = (kind: CycleProcess['kind'], description: string, extras: Partial<CycleProcess> = {}): CycleProcess => ({ id: '', kind, label: cycleProcessNames[kind], amountMg: r.int(1, 8), description, medium: aquatic ? 'aquatic' : 'land', timescale: 'Annetun yhden mallijakson virta', ...extras });
  let processes: CycleProcess[];
  const photosynthesis = process('photosynthesis', aquatic ? 'Vesikasvi ottaa veteen liuenneen CO₂:n hiiltä orgaaniseen aineeseensa valossa.' : 'Kasvi ottaa ilman CO₂:n hiiltä orgaaniseen aineeseensa valossa. Vesi on mukana, valo tuo energiaa.');
  const respiration = process('respiration', aquatic ? 'Vesikasvin hengitys vapauttaa hiiltä liuenneena CO₂:na veteen.' : 'Kasvin hengitys vapauttaa orgaanisen aineen hiiltä ilman CO₂:ksi. Myös kasvi hengittää.', { subject: 'plant' });
  if (goal === 'burn') processes = [process('combustion', variant === 'transfer' ? 'Tallennettu bioetanolin palaminen siirtää tuoreen eliöperäisen varaston hiiltä ilman CO₂:ksi.' : 'Tallennettu tuoreen puuaineksen palaminen siirtää sen hiiltä ilman CO₂:ksi.', { fuel: 'recent', timescale: 'Eliöperäinen lähtövarasto · lyhyen kierron alkuperä' }),
    process('combustion', variant === 'transfer' ? 'Tallennettu fossiilisen propaanin palaminen siirtää geologisen varaston hiiltä ilman CO₂:ksi.' : 'Tallennettu fossiilisen metaanin palaminen siirtää geologisen varaston hiiltä ilman CO₂:ksi.', { fuel: 'fossil', timescale: 'Geologinen lähtövarasto · muodostuminen miljoonissa vuosissa' }), photosynthesis, respiration];
  else if (goal === 'photo') processes = [photosynthesis, respiration, process('decomposition', 'Hajottajien hengitys muuttaa osan kuolleen orgaanisen aineen hiilestä ympäristön CO₂:ksi. Osa jää varastoon.'), process('dissolution', 'Ilman CO₂:ta liukenee veteen. Tässä virta kulkee ilmasta veteen.'), process('release', 'Vedestä vapautuu CO₂:ta ilmaan. Tämä on erillinen vastakkaissuuntainen virta.')];
  else processes = [photosynthesis, process('feeding', 'Kasvin orgaanista hiiltä siirtyy ravintona eläimeen.'), process('litter', 'Kuolleen eläinaineksen hiiltä siirtyy maaperän tai pohjan orgaaniseen ainekseen.', { subject: 'animal' }), process('decomposition', 'Hajottajien hengitys vapauttaa vain annetun osan kuolleen aineen hiilestä ympäristön CO₂:ksi.'), respiration,
    ...(goal === 'integration' ? [process('combustion', 'Tallennettu tuoreen eliöaineksen palaminen vapauttaa sen hiiltä ilman CO₂:ksi.', { fuel: 'recent', medium: 'land' })] : []),
    ...(advanced && goal === 'integration' ? [process('combustion', 'Fossiilisen polttoaineen hiiltä siirtyy geologisesta varastosta ilman CO₂:ksi.', { fuel: 'fossil', medium: 'land', timescale: 'Vanhan varaston vapautuminen · uusi muodostuminen ei ole välitön vastavirta' }), process('dissolution', 'Osa ilman CO₂:sta liukenee vesistöön.')] : [])];
  if (goal === 'burn' && !advanced) processes = [processes[0]!, process('dissolution', 'Osa palamisen jälkeen ilmassa olevasta CO₂:sta liukenee vesistöön. Hiili säilyy siinäkin aineena.')];
  if (variant === 'repair') processes = processes.map((p, i) => ({ ...p, amountMg: i % 2 ? r.int(3, 8) : r.int(1, 3) }));
  processes = processes.map((p, i) => ({ ...p, id: `p${i + 1}` }));
  const focus = aquatic ? 'water' : 'air';
  const repairProcess = goal === 'matter-loop' ? processes.find(p => p.kind === 'decomposition')! : processes[0]!;
  const ownExplanation = goal === 'integration' || (advanced && ['burn', 'photo'].includes(goal));
  return { mode: 'carbon-network', goal: goal === 'burn' && !advanced ? 'burn-trace' : goal, reservoirs: zones, initial, processes, period: 'Paikallinen mallivuorokausi · harjoituksen annetut määrät. Ei maapallon mitattu hiilitili.', focus, mustReturnVia: goal === 'matter-loop' || goal === 'integration' ? ['soil'] : [], requireReturn: ['transfers', 'matter-loop', 'integration'].includes(goal),
    ...(goal === 'integration' ? { cards: reservoirCards(zones, zones.map(zone => initial.filter(p => p.reservoir === zone.id).reduce((sum, p) => sum + p.amountMg, 0)), variant) } : {}),
    ...(variant === 'repair' ? { proposal: [{ process: repairProcess.id, from: cycleProcessEndpoints(repairProcess, zones)![1], to: cycleProcessEndpoints(repairProcess, zones)![0] }],
      claim: goal === 'burn' ? advanced ? 'Ilmaan siirtynyt hiili palaa heti samaksi fossiiliseksi polttoaineeksi.' : 'Palaminen poistaa hiilen aineena ja muuttaa sen kokonaan energiaksi.' : goal === 'photo' ? 'Yksi yhteyttävä kasvi pitää koko maapallon hiilitilin muuttumattomana.' : goal === 'integration' ? 'Koska kartassa on kierto, kaikki varastot pysyvät aina muuttumattomina.' : 'Nuolet voi kääntää vapaasti; prosessi on silti sama.' } : {}),
    ...(ownExplanation ? { review: review(goal) } : {}), context: context('Annetun paikallisen jakson varastot ja mg seurattua hiiltä', 'M-ADD-01', 'M-SUB-01') };
}

const stories: Record<string,{title:string;intro:string;goal:string;reward:string}> = {
  "CHEM79-CARBON-BURN": {
    "title": "Varastosta ilmaan",
    "intro": "Sulka antaa Aavalle kaksi tallennettua malliesimerkkiä hiilipitoisten aineiden palamisesta. Hiilen lähtövarasto ja siirtymä ilmaan pidetään erillään reaktion nopeudesta.",
    "goal": "Selitä palamisen hiilivirta lähtöaineesta ilmakehän tuotteisiin ja tunnista fossiilisen varaston siirtymän ero lyhyen kierron aineistoon.",
    "reward": "Metsäneuvosto jäljittää ilmaan päätyneen hiilen oikeaan lähtövarastoon. Kartan pitkä ja lyhyt aikajänne erottuvat, ja väärä väite välittömästä palautumisesta korjataan yhteisesti."
  },
  "CHEM79-CARBON-PHOTO": {
    "title": "Lehden hiilitili",
    "intro": "Aava vertaa kasviin tulevaa hiilidioksidia muodostuvan orgaanisen aineen hiileen. Sulka näyttää myös, miksi yhden lehden yhteyttäminen ei yksin ratkaise koko ilmakehän hiilitasetta.",
    "goal": "Yhdistä yhteyttäminen hiilen siirtymiseen ilmakehästä eliöihin ja tulkitse annettu paikallinen hiilivirta muiden siirtymien rinnalla.",
    "reward": "Lehden ja ilman väliin avautuu mallissa jäljitettävä hiilen reitti. Aava näkee kasvin uuden kasvun annetussa aikasiirrossa ja osaa kertoa, mistä sen hiili tuli."
  },
  "CHEM79-CARBON-RESERVOIRS": {
    "title": "Hiilen monet kodit",
    "intro": "Sulan saaristomallissa hiiltä löytyy ilmasta, eliöistä, maaperästä, vedestä ja geologisista varastoista. Aava etsii nämä myös paikoista, joissa hiiltä ei näy mustana aineena.",
    "goal": "Tunnista keskeiset hiilivarastot annetuista aine- ja ympäristötiedoista; erota varasto hiilen siirtymisprosessista.",
    "reward": "Saaristomallin hiilikarttaan syttyvät nimetyt varastopaikat."
  },
  "CHEM79-CARBON-TRANSFERS": {
    "title": "Hiilen matkaliput",
    "intro": "Aava seuraa merkittyä hiiltä Sulan valmiissa kiertomallissa. Nuoli kertoo aina, mistä varastosta hiili lähtee ja mihin se siirtyy.",
    "goal": "Yhdistä annetut prosessit, kuten yhteyttäminen, hengitys, hajotus ja palaminen, oikeansuuntaisiin varastojen välisiin siirtymiin.",
    "reward": "Hiilikartan puuttuvat reittikilvet valmistuvat ja yksi kokonainen paluureitti voidaan seurata."
  },
  "CHEM79-CARBONCYCLE": {
    "title": "Hiilen saarineuvosto",
    "intro": "Aava tuo neuvostoon Sulan kokonaisen tilannekuvan saariston hiilivarastoista ja virroista. Loikka etsii reitin, jolla sama hiili voi palata, mutta eri ajat ja varastot eivät katoa kartasta.",
    "goal": "Muodosta uusi hiilen kiertokokonaisuus varastoista ja suunnatuista prosesseista; selitä yhden muutoksen vaikutus annetun mallin rajoissa.",
    "reward": "Neuvosto avaa elävän hiilikartan, jossa metsä, meri ja ilma kuuluvat samaan ymmärrettävään maailmaan."
  },
  "ENV-CHEM-CYCLE-01": {
    "title": "Metsän muistama aine",
    "intro": "Aava yhdistää Sulan valmiit kuvat yhteyttämisestä, palamisesta ja muista aineen paluureiteistä. Loikka huomaa, että samat aineen rakenneosat voivat kuulua vuorollaan hyvin erilaisiin paikkoihin.",
    "goal": "Selitä uusi ainekiertotapaus yhdistämällä yhteyttäminen ja palaminen osaksi laajempaa aineverkkoa; pidä aineen säilyminen ja energian kulku erillään.",
    "reward": "Metsän suuri tutkimusmaalaus herää: hiilen polut ja lehtien kasvu tulevat ymmärrettäviksi yhdessä."
  },
  "ENV-CHEM-CYCLE-BURN-01": {
    "title": "Hiilen reitti tallennetusta nuotiosta",
    "intro": "Sulka näyttää virtuaalisen, valmiiksi tallennetun palamistilanteen ainevirrat. Aava seuraa puun hiiltä ilmaan ja erottaa sen vapautuvan energian kuvauksesta.",
    "goal": "Yhdistä hiiltä sisältävän aineen palaminen annettujen palamistuotteiden kautta aineen kiertoon; nimeä ilmaan siirtyvä hiili.",
    "reward": "Metsän tutkimustaulu näyttää, minne tallennetun esimerkin hiili siirtyi."
  },
  "ENV-CHEM-CYCLE-MATTER-01": {
    "title": "Metsän monet paluureitit",
    "intro": "Sulka tarjoaa Aavalle valmiin ainekiertokartan, jossa on kasveja, eläimiä, maaperää ja ilmaa. Loikka löytää myös hajottajien reitin, jota pelkkä ruokakuva ei näyttänyt.",
    "goal": "Yhdistä annetut aineensiirtymät varastojen välille ja osoita saman aineen mahdollinen paluureitti; kaikki reitit eivät ole pakollisia tai yhtä nopeita.",
    "reward": "Metsän aineverkkoon syntyy ehjä paikallinen kierto ja hajottajille löytyy oma näkyvä tehtävä."
  },
  "ENV-CHEM-CYCLE-PHOTO-01": {
    "title": "Ilman hiili saa lehden kodin",
    "intro": "Aava katsoo lehden mallia, jossa ilmasta tuleva hiili liittyy kasvin aineeseen. Loikka huomaa, että ilmaa ei tarvitse nähdä voidakseen seurata sen aineita.",
    "goal": "Osoita hiilidioksidin hiilen siirtyminen kasvin orgaaniseen aineeseen yhteyttämisessä ja erota valon energiarooli ainevirrasta.",
    "reward": "Lehden kasvumaalaukseen ilmestyy jäljitettävä yhteys ilman ja kasvin välille."
  },
  "ENV-CHEM-MATTERCONS-01": {
    "title": "Näkymätön ei ole poissa",
    "intro": "Sulka sulkee veden kiertoa kuvaavan virtuaalisen näytekammion. Aava etsii saman vesimäärän eri paikoista, vaikka osa ei näy tavallisessa kuvassa.",
    "goal": "Seuraa ainetta näkyvän ja mallissa esitetyn kaasumaisen muodon välillä; osoita, ettei suljetun järjestelmän kokonaismäärä katoa muutoksessa.",
    "reward": "Kadonneeksi luultu vesi löytyy mallista ja näytekammion tasapaino säilyy."
  },
  "ENV-CHEM-PHOTOSYN-01": {
    "title": "Lehden pieni ruokapaja",
    "intro": "Aava lepää lehden varjossa ja ihmettelee, mistä kasvin uusi aine tulee. Sulan kuvallinen malli näyttää veden, ilman hiilidioksidin ja valon erilaiset tehtävät.",
    "goal": "Yhdistä vesi ja hiilidioksidi kasvin muodostamaan orgaaniseen aineeseen valon avulla; erota valo energian lähteeksi ja aineet rakennusaineiksi.",
    "reward": "Lehden tutkimusikkunassa kasvin kasvun arvoitus saa näkyvän selityksen."
  },
  "ENV-CHEM-WATERCYCLE-01": {
    "title": "Vuoren pisaran retki",
    "intro": "Aava seuraa mallipisaraa mereltä ilmaan ja pilven kautta vuoristoon. Sulka erottaa näkymättömän vesihöyryn pilven pienistä vesipisaroista tai jääkiteistä.",
    "goal": "Yhdistä haihtuminen, tiivistyminen, sade ja valunta veden kierron paikkoihin; tunnista myös varastoituminen ja vaihtoehtoiset reitit.",
    "reward": "Pisaran reitti yhdistää meren, vuoren ja puron eläväksi kiertokuluksi."
  }
};
interface Definition { id: string; families: readonly [string, string]; author: (r: Rng, variant: Variant) => TaskData; limit: string }
const definitions: Definition[] = [
  { id: 'ENV-CHEM-PHOTOSYN-01', families: ['build-material-energy-roles', 'repair-light-as-carbon-source'], author: photo, limit: 'Annetun yhteyttämismallin aine- ja energiaroolit, oma hiilen reitti ja valon/pimeän yhteyttämisen vertailu. Piirros seuraa hiiltä eikä ratkaise happiatomien alkuperää pelkän nettoreaktion perusteella.' },
  { id: 'ENV-CHEM-MATTERCONS-01', families: ['liquid-to-invisible-vapor', 'vapor-to-liquid-chamber'], author: conservation, limit: 'Oma ennuste ennen suljetun kammion vaihe- tai liukenemismuutosta, toteutettu määrän siirto ja koko järjestelmän massatili. Kaasu ja liuennut aine sisältyvät kirjaan.' },
  { id: 'ENV-CHEM-WATERCYCLE-01', families: ['surface-return-route', 'groundwater-return-route'], author: water, limit: 'Oma suunnattu, vaiheiden ja painovoiman tietoihin sidottu seurantaveden reitti. Harjoiteltava pintavalunta-, pohjavesi- tai lumivarastoreitti ilmoitetaan; vaihtoehtoiset kelvolliset reitit sen ehdoissa sallitaan. Lumivaraston viipyminen ja pohjavesi eivät lupaa yhtä todellista kiertoaikaa kaikelle vedelle.' },
  { id: 'ENV-CHEM-CYCLE-01', families: ['construct-combined-matter-network', 'repair-changed-flow-network'], author: (r, v) => network(r, v, 'integration', false), limit: 'Uuden tilanteen yhteyttäminen, palaminen ja ravinto/hajotusverkko samassa omassa rakenteessa sekä oma aikuisen havaitsema selitys. Alitaitojen näyttöjä ei peritä tästä.' },
  { id: 'ENV-CHEM-CYCLE-BURN-01', families: ['trace-fuel-carbon-to-co2', 'repair-carbon-turned-to-energy'], author: (r, v) => network(r, v, 'burn', false), limit: 'Tallennettujen polttoaine-esimerkkien hiilen suunnatut ainevirrat ja oman jakson hiilitilin muutos. Vapaan sanallisen selityksen sisältöä ei väitetä automaattisesti arvioiduksi.' },
  { id: 'ENV-CHEM-CYCLE-PHOTO-01', families: ['trace-co2-carbon-into-plant', 'repair-light-as-plant-matter'], author: (r, v) => photo(r, v, 'carbon-path'), limit: 'Oma graafinen hiilen lähtö- ja vastaanottopolku sekä aineen ja energian erottelu. Kasvin hiili tulee CO₂:sta, myös vesikasvilla. Rakenne ei väitä arvioivansa vapaata puhetta.' },
  { id: 'ENV-CHEM-CYCLE-MATTER-01', families: ['construct-feeding-decomposer-return', 'repair-reversed-decomposer-route'], author: (r, v) => network(r, v, 'matter-loop', false), limit: 'Oma aineen paluureitti ravinnon ja hajottajien kautta. Kaikki reitit eivät ole pakollisia, yhtä nopeita tai aineistossa yhtä suuria. Tässä seurataan hiiltä yhtenä ainekierron esimerkkinä.' },
  { id: 'CHEM79-CARBONCYCLE', families: ['construct-stocks-and-flux-integration', 'repair-unequal-flux-integration'], author: (r, v) => network(r, v, 'integration', true), limit: 'Uuden aineiston omat varastojäsenyydet, prosessinuolet, siirrot, tase ja aikuisen havaitsema muutosperustelu. Varasto- ja siirtymäatomien hallintaa ei myönnetä automaattisesti.' },
  { id: 'CHEM79-CARBON-BURN', families: ['compare-biogenic-fossil-origins', 'repair-immediate-offset-account'], author: (r, v) => network(r, v, 'burn', true), limit: 'Kaksi annettua polttoainetta ja eri lähtövarastot, oma hiilitili ja oma aikajänteeseen rajattu aikuishavainto. Reaktion nopeus ei ole sama asia kuin fossiilisen varaston muodostumisaika.' },
  { id: 'CHEM79-CARBON-PHOTO', families: ['photosynthesis-with-other-fluxes', 'repair-one-leaf-global-balance'], author: (r, v) => network(r, v, 'photo', true), limit: 'Oma CO₂–kasvi-siirtymä muiden annettujen virtojen rinnalla ja oma aikuisen havaitsema paikallisen taseen tulkinta. Yksi kasvi ei määrää koko ilmakehän tasetta.' },
  { id: 'CHEM79-CARBON-RESERVOIRS', families: ['assign-composition-to-reservoir', 'distinguish-stocks-from-processes'], author: reservoirs, limit: 'Annetun koostumus- ja paikkatiedon hiilivarastot, puhtaan H₂O:n ja hiiltä sisältävän vesinäytteen ero sekä varasto/prosessi-erottelu. Atomien tai pallojen koko ei mittaa maapallon varastojen suuruutta.' },
  { id: 'CHEM79-CARBON-TRANSFERS', families: ['construct-directed-processes', 'repair-reversed-processes'], author: (r, v) => network(r, v, 'transfers', true), limit: 'Omat prosessisuunnat, toteutetut siirrot ja yksi kelvollinen hiilen paluureitti. Annettu reitti on mahdollinen paikallinen selitysmalli, ei kaikille hiiliatomeille pakollinen rata.' },
];
export function makeMatterCyclesTask(id: string, r: Rng, variant: Variant): MatterCyclesTask {
  const def = definitions.find(d => d.id === id); if (!def) throw Error('Unknown matter-cycle node');
  const data = def.author(r, variant); let hash = 0xcbf29ce484222325n;
  for (const char of JSON.stringify(data)) hash = BigInt.asUintN(64, (hash ^ BigInt(char.charCodeAt(0))) * 0x100000001b3n);
  return { kind: 'matter-cycles', run: `cycle-${hash.toString(16)}`, title: stories[id]!.title, ...data } as MatterCyclesTask;
}
function authored(def: Definition, r: Rng, phase: Phase): CycleItem {
  const variant = phase === 'transfer' ? 'transfer' : r.pick(['build', 'repair'] as const), task = makeMatterCyclesTask(def.id, r, variant);
  const say = task.mode === 'conservation' ? 'Ennusta koko kammion massa. Toteuta oma siirto ja tarkista sen jälkeen kaikki aine.' : task.mode === 'water-path' ? 'Rakenna veden prosessit. Kuljeta oma seurantavesi kelvollista paluureittiä.' : task.mode === 'photosynthesis' ? 'Rakenna aineiden ja energian roolit. Jäljitä hiili ja ennusta valo- ja pimeäkoe.' : task.mode === 'reservoirs' ? 'Etsi hiili koostumuksesta ja sijoita näytteet varastoihin. Prosessi ei ole varasto.' : 'Rakenna prosessinuolet ja lukitse ennuste. Toteuta siirrot ja tarkista oman jakson hiilitili.';
  return { task, tag: variant === 'transfer' ? 'transfer' : def.families[variant === 'build' ? 0 : 1], say, sceneModel: matterCyclesScene(task), hint: 'Katso tämän aineiston koostumus, varastopaikka, prosessin kuvaus ja järjestelmän rajaus. Nimeä mikä aine siirtyy ja mikä tuo energiaa.', explain: 'Aineen muoto ja paikka voivat muuttua. Kaasussa, liuoksessa ja pitkäaikaisessa varastossa oleva aine kuuluu edelleen tiliin. Energia ja aine kirjataan erikseen.' };
}
export const matterCyclesSpecs: NodeSpec[] = definitions.map(def => {
  const story = stories[def.id]!, rev = `matter-cycles-${def.id.toLowerCase()}-v1`;
  return { id: def.id, stop: story.title, icon: '↻', intro: story.intro, goal: story.goal, reward: story.reward, rev, validRevs: [rev], produce: [...def.families], produceWhat: 'oman ainevirta- tai massatilimallin rakentamista ja tarvittaessa aikuisen havaitsemaa omaa selitystä',
    demo: r => { const item = authored(def, r, 'independent'); return [{ scene: matterCyclesBoard(item.task), sceneModel: matterCyclesScene(item.task), say: story.goal }, { scene: matterCyclesExample(item.task), sceneModel: matterCyclesScene(item.task, solutionMatterCycles(item.task)), say: 'Sulka näyttää yhden rajatun mallin. Oma näyttö tehdään toisella aineistolla.' }]; },
    item: (r, phase) => authored(def, r, phase) as unknown as Item };
});
export const matterCyclesEvidence: Readonly<Record<string, { families: readonly string[]; limit: string }>> = Object.fromEntries(definitions.map(def => [def.id, { families: def.families, limit: `${def.limit} Seurantakirja säilyttää alkuperämerkinnät ja annetut määrät. Aikatiivistys ja yksiköt ovat näkyviä. Pelkkä animaatio ei tuota näyttöä eikä virtuaalimalli sertifioi fyysistä työskentelyä.` }]));
