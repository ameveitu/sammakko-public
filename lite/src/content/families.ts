// Activity-family registry. A family is one item generator branch of a lesson, named by
// the item's tag. For every family the registry says what the learner is shown to do
// (the observable outcome), which other skills the item relies on, which facts the
// item itself supplies, what its explanation co-teaches, and where relevant optional
// help lives. Families with nothing special get the defaults below; the declarations
// cover the rest.
//
// The coverage test (tests/families.test.ts) samples every family, reads the item with
// the feature detectors in features.ts and fails when a detected demand is explained
// neither by the lesson's own required/strong ancestry nor by a declaration here.
import { COVERAGE, kc, ORDER } from '../engine/graph';
import type { Task } from '../engine/types';
import type { Feature } from './features';

export interface FamilyDecl {
  /** What the response actually shows, when the task kind alone undersells or oversells it. */
  outcome?: string;
  /** Skills the item uses without teaching them (in-scope KC ids). */
  assumed?: string[];
  /** Facts the item states itself, so the learner need not know them. */
  supplied?: string[];
  /** Skills the demo or explanation teaches alongside the target. */
  coTaught?: { kc: string; where: string }[];
  /** A detected feature that is present but not demanded (e.g. a value only copied). */
  incidental?: Partial<Record<Feature, string>>;
  /** Limit on what the family evidences, when it is narrower than the canonical KC. */
  limit?: string;
  /** Optional help destinations, most relevant first (directly reachable lessons). */
  support?: string[];
  /** Dynamic rule from the canonical graph, instantiated for this family. */
  rule?: string;
}

export interface Family extends Required<Omit<FamilyDecl, 'outcome' | 'limit' | 'rule'>> {
  node: string; tag: string; outcome: string; limit?: string; rule?: string; source: string[];
}

/** Default outcome wording per interaction kind. */
export const OUTCOME: Record<Task['kind'], string> = {
  cake: 'jakaa alkuperäiset osuudet samankokoisiin osiin määrää muuttamatta ja tuottaa niiden summan',
  'fraction-subtract': 'valitsee kummallekin osuudelle yhteisen jaon ja tuottaa jäljelle jäävän murtoluvun',
  'space-day': 'kääntää Maan mallia ja ennustaa nimetyn paikan päivän tai yön Auringon suunnan perusteella',
  'rational-link': 'tuottaa saman nimetyn kokonaisen osuuden useassa lukuesityksessä ja korjaa ristiriitaiset merkinnät',
  'equation-workshop': 'tarkistaa yhtälön molemmat puolet tai tuottaa koko ratkaisujoukon tehtävän ehtojen perusteella',
  'observed-explanation': 'tuottaa oman selityksen, jonka kuullut tai lukenut aikuinen arvioi tehtävän kriteereillä',
  'measurement-station': 'Mittauspajan välineen käyttö ja oman mittauksen tarkistus',
  'data-probability': 'Aineiston oma kuvaaja, havaintojoukko tai mahdollisten tapahtumien malli',
  'programming-ferries': 'Laatii tai suorittaa käskyt, kirjaa ajohavainnot ja vertaa niitä tavoitteen ehtoihin',
  'root-workshop': 'Rakentaa juuren tai lukusuoran mallin ja erottaa tarkan arvon tarkoituksenmukaisesta likiarvosta',
  'geometry-relations': 'Rakentaa geometrisen mallin ja kohdistaa riittävät sivu- ja kulmatiedot',
  'statistics-harbor': 'Kerää ja jäsentää havaintoja sekä rakentaa aineistoon rajatun tilastollisen päätelmän',
  'electricity-harbor': 'Rakentaa virtuaalisen kytkennän ja vertaa sähkömallin ennustetta omaan mittaushavaintoon',
  'right-triangle': 'Suorakulmaisen kolmion oma sivusuhde, neliöala ja lasku valitusta kulmasta',
  'circle-observatory': 'Rakentaa ympyrän osat ja perustelee kaari-, kulma- tai mittasuhteen omilla merkinnöillä',
  'circuit-workshop': 'Ennustaa muutoksen, tekee virtuaalikokeen ja tuottaa virtapiirin mittaustiedoista oman laskun',
  'number-equivalences': 'Tuottaa etumerkin, paikkalaskun välivaiheet tai verrannon ja tarkistaa määrien vastaavuuden',
  'plane-measures': 'Rakentaa kuvion ulkoreunan, korkeuden tai osajaon ja laskee oman mitta- tai pinta-alatuloksen',
  'chemical-notation': 'Tuottaa kemiallisen merkinnän atomilajit, lukumäärät ja reaktion molempien puolten oman atomikirjanpidon',
  'solution-lab': 'Tuottaa liuoksen pitoisuuden omista ainemääristä sekä tulkitsee pH:n ja indikaattorin rajatun havaintovälin',
  'waves-observatory': 'Tutkii valon ja äänen rajattuja malleja ja perustelee annettuihin tietoihin sidotun säteilyhavainnon',
  'decimal-ledger': 'Kirjaa jokaisen saapuvan ja lähtevän erän jälkeisen desimaalimäärän',
  'lifecycle-harbor': 'Rakentaa aineen ja energian reitit sekä vertaa korjaamisen ja uudelleenkäytön vaikutuksia',
  'reaction-lab': 'Tutkii aineiden muuttumista, rakentaa säilyvät atomit ja perustelee oman vertailukokeensa',
  'inquiry-islands': 'Havainnoi, vertailee, suunnittelee ja tekee reiluja kokeita, rakentaa ja korjaa malleja sekä rajaa johtopäätöksensä aineistoon',
  'matter-cycles': 'Seuraa aineen säilymistä, rakentaa veden ja hiilen kiertoreittejä sekä perustelee omat havaintonsa',
  'carbon-kitchen': 'Rakentaa hiiliyhdisteitä ja ravintoaineiden malleja sekä tulkitsee nimettyä paikallista yhdisteryhmää',
  'atomic-world': 'Rakentaa ja tulkitsee atomi-, rakenne- ja hiukkasmalleja sekä erottaa havainnon ja mallin selityksen',
  'safety-harbor': 'Rakentaa turvallisen toimintajärjestyksen tai reitin annettujen olosuhteiden perusteella ja perustelee oman ratkaisunsa',
  'chemical-investigation': 'Käyttää virtuaalivälinettä ja rakentaa oman tutkimussuunnitelman, havaintotaulukon tai rajatun johtopäätöksen',
  'logic-workshop': 'Rakentaa oman kysymyksen, kattavan luettelon, täsmällisen säännön tai havaintoihin ja oletuksiin sidotun perustelun',
  'physics-investigation': 'Valitsee mittauksen asetukset, vertaa omaa ennustetta havaintoihin ja perustelee rajatun tutkimuksen johtopäätöksen',
  'materials-mixtures': 'Tutkii aineen ominaisuuksia ja seuraa oman erotus- tai liukenemiskokeensa aine-eriä ja niiden massan säilymistä',
  'algorithm-studio': 'Tuottaa rajatun ohjelman, ennustaa sen ajon ja testaa oman ratkaisunsa sekä sen rajaehdot',
  'function-garden': 'Tuottaa kuvaajan muutosvälit, paraabelin pisteet tai lukujonon säännön ja testaa mallin omilla arvoillaan',
  'advanced-solids': 'Tunnistaa kappaleen rakenteen ja tuottaa pinta-alan, tilavuuden tai yksikköskaalan omalla mallillaan',
  'energy-islands': 'Lukitsee ennusteen, muuttaa energiamallia ja perustelee varastojen tai siirtojen havainnot',
  'relation-workshop': 'Tuottaa suhteen, yhteisen ratkaisun tai nollakohdan ja tarkistaa sen alkuperäisistä tiedoista',
  'thermal-station': 'Lukitsee lämpömallin ennusteen ja vertaa sitä havaintoon; oman selityksen arvioi aikuinen',
  'spatial-measures': 'rakentaa geometrisen suhteen, kulman, peitteen tai mittakaavan ja tarkistaa oman mallinsa',
  'number-journey': 'rakentaa määrän, parituksen, lukureitin tai suunnan ja tuottaa sen matemaattisen tuloksen',
  'arithmetic-reasoning': 'rakentaa laskun, ryhmittelyn, arvion tai haun ja tarkistaa sen välivaiheet',
  'power-rules': 'tuottaa ja tarkistaa tekijähajotelman tai potenssin arvon ja sallitut sääntöaskeleet',
  'solid-construction': 'rakentaa avaruusmallin tai tuottaa merkityn osan geometrisen nimen',
  'solid-workshop': 'tunnistaa ja luokittelee avaruuskappaleen sekä sen osat useasta näkymästä',
  'sail-shapes': 'rakentaa, nimeää tai luokittelee tasokuvion täsmällisten geometristen ominaisuuksien avulla',
  'problem-workbench': 'toteuttaa suunnitelman tai oman määrämallin ja tarkistaa sen vastaavuuden annettuun pulmaan',
  choice: 'valitsee oikean vaihtoehdon',
  multi: 'valitsee kaikki oikeat vaihtoehdot eikä muita',
  tapcount: 'kertoo lukumäärän (merkintä vaaditaan vain merkintätehtävässä)',
  place: 'sijoittaa osat oikeille paikoille',
  ribbons: 'vertaa kahta pituutta',
  numeric: 'kirjoittaa luvun',
  plot: 'piirtää pisteet kuvaajaan',
  line: 'merkitsee kohdan lukusuoralle',
  build: 'rakentaa lausekkeen tai yhtälön merkkipaloista (samanarvoiset muodot hyväksytään)',
  tally: 'kirjaa jokaisen havainnon tukkimiehen merkiksi oikeaan luokkaan',
  combos: 'luettelee kaikki yhdistelmät kerran (puuttuvat ja toistot tarkistetaan)',
  frac: 'kirjoittaa murtoluvun (samanarvoiset murtoluvut hyväksytään)',
  sort: 'lajittelee jokaisen kuvan oikeaan laatikkoon',
  extend: 'jatkaa kuviota oikein jokaiseen tyhjään paikkaan',
  fill: 'kaataa desilitran mitalla kannuun desilitra kerrallaan, kunnes kannussa on pyydetty määrä',
  pourtest: 'kokeilee kaatamalla täyden astian toiseen kumpaankin suuntaan ja päättelee, kumpaan mahtuu enemmän',
  grams: 'kokoaa punnuksista vaa\'alle tilatun painon ja lukee grammat ja kilogrammat',
  weigh: 'punnitsee paketteja pareittain vaa\'alla ja päättelee punnituksista painavimman tai kevyimmän',
  grid: 'rakentaa kertolaskua vastaavan rivistön: oikea määrä rivejä ja oikea määrä jokaiseen riviin',
  cut: 'leikkaa luvun kahteen osaan niin, että ensimmäinen osa vie tasakymppiin',
  reeds: 'kokoaa tilatun luvun nipuista (kymmenet) ja irtokaisloista (ykköset) tai avaa nipun ykkösiksi',
  bundle: 'kerää kaisloja nippuun napauttamalla ja sitoo nipun, kun siinä on tasan kymmenen (kymmenen ykköstä = yksi kymppi)',
  balance: "lisää kiviä vaa'an toiselle puolelle, kunnes puolet ovat yhtä painavat (yhtäsuuruus tasapainona)",
  stack: 'rakentaa tornin, joka on annetun monta kertaa niin korkea (multiplikatiivinen vertailu)',
  bagup: 'pakkaa kasan pusseihin ryhmä kerrallaan ja laskee pussit (sisältöjako)',
  pack: 'pakkaa jokaiseen pussiin yhtä monta (yhtä suuret ryhmät)',
  deal: 'jakaa joukon itse vuorotellen kahdelle ja tarkistaa, että kumpikin saa yhtä monta',
  clock: 'asettaa kellon viisarit annettuun aikaan puolen tunnin askelin',
  iterate: 'mittaa latomalla yksikköpaloja peräkkäin nauhan loppuun asti',
};

const MUL = 'M-MUL-01';
const NEUTRAL_DEC = 'Desimaaliluku on vain tunnistettava tai kopioitava mittaustulos; sillä ei lasketa.';
const UNITS_LISTED = 'Eri yksiköt ovat luokiteltavina vaihtoehtoina; mitään ei muunneta.';

/**
 * Declarations by `node`, `node/*` (every family of the node) or `node/tag`.
 * More specific keys win field by field.
 */
export const DECL: Record<string, FamilyDecl> = {
  'M-DATA-01/*': { outcome: 'kerää kaikki sovittuun aiheeseen kuuluvat annetut havaintokortit tai tunnistaa aiheeseen sopivan kysymyksen', limit: 'Keruu vaaditaan collect/transfer-perheessä; ei oikeaa maastotyötä, lukumäärää tai viivamerkintöjä.' },
  'M-DATA-03/transfer': { outcome: 'lukee nimetyn rivin Yhteensä-sarakkeen annetun arvon', supplied: ['Rivisummat on annettu valmiina.'], limit: 'Yhteenlaskua ei vaadita; merkinnät eivät tarkoita varmasti eri eläinyksilöitä.' },
  'M-DEC-04/*': { outcome: 'kokoaa annetuista korteista saman määrän numeron, sanallisen kuvauksen ja nimetyt lukuyksiköt', limit: 'Ei vapaata kirjoitusta, puhetta tai kaikkien atomisten osataitojen itsenäisen hallinnan näyttöä.' },
  'M-DEC-04/transfer': { supplied: ['Yksi kokonainen tarkoittaa yhtä metriä; muunnosta ei vaadita.'] },
  'M-NUM-1TO1/tap': { outcome: 'merkitsee jokaisen esineen täsmälleen kerran; loppumäärää ei vaadita', limit: 'Lukusanajono annetaan tarvittaessa tukena; itsenäistä loppumäärää tai sanajonon tuottamista ei arvioida.' },
  'M-NUM-1TO1/transfer': { outcome: 'merkitsee jokaisen erilaisen esineen täsmälleen kerran; loppumäärää ei vaadita', limit: 'Näyttö koskee kertamerkintää, ei kardinaliteettia tai itsenäistä lukusanajonoa.' },
  // Table construction supplies the source counts; five-groups and subtraction are optional.
  'M-DATA-04/fromTally': { outcome: 'sijoittaa annetun numeromäärän saman eläimen taulukkoriville', supplied: ['Jokaisen eläimen määrä annetaan numerona viivamerkintöjen vieressä.'], limit: 'Viisiryhmien lukemista ei vaadita; viivakuva on vapaaehtoinen rinnakkaisesitys.' },
  'M-DATA-04/total': { outcome: 'täydentää taulukon rivin keruuvihossa annetulla saman eläimen määrällä', supplied: ['Keruuvihon jokaiselle nimetylle eläimelle annetaan määrä.'], coTaught: [{ kc: 'M-SUB-01', where: 'vain vastauksen jälkeinen vapaaehtoinen summatarkistus' }], support: ['M-SUB-01'], limit: 'Puuttuvan rivin arvo kopioidaan lähdetiedosta; vähennyslasku ei ole ratkaisuehto.' },
  // ------------------------------------------------ dynamic rules (instantiated)
  'M-REP-04/*': { rule: 'requires_relevant_content_symbol_knowledge', assumed: ['M-SYM-PLUS', 'M-SYM-MINUS', 'M-SYM-EQUAL'], support: ['M-SYM-PLUS', 'M-SYM-MINUS'],
    limit: 'Tunnistaa tilannetta vastaavan merkinnän ja rakentaa sen merkkipaloista (perhe build); vapaata kirjoittamista ei havaita.' },
  'M-REP-04/transfer': { assumed: [MUL, 'M-MUL-02'], support: ['M-MUL-02', MUL] },
  'M-TH-08/mulAdd': { rule: 'requires_any_two_mastered_content_nodes', assumed: [MUL, 'M-ADD-01'], support: [MUL] },
  'M-TH-08/fracDiv': { rule: 'requires_any_two_mastered_content_nodes', assumed: ['M-FRAC-01', 'M-DIV-01'], support: ['M-FRAC-01', 'M-DIV-01'], incidental: { multiply: 'Kertolasku on vain väärä vaihtoehto.' } },
  'M-TH-08/areaMul': { rule: 'requires_any_two_mastered_content_nodes', assumed: [MUL, 'M-MULTAB-LOW'], support: ['M-MULTAB-LOW'] },
  'M-TH-08/transfer': { rule: 'requires_any_two_mastered_content_nodes', assumed: ['M-GMEAS-01', 'M-MULTAB-LOW'], support: ['M-GMEAS-01', 'M-MULTAB-LOW'] },
  'M-TH-08/pairs': { rule: 'requires_any_two_mastered_content_nodes', assumed: [MUL, 'M-FRAC-01', 'M-DIV-01', 'M-GMEAS-01'], support: [MUL, 'M-FRAC-01', 'M-GMEAS-01'] },
  'M-TH-08/*': { rule: 'requires_any_two_mastered_content_nodes' },
  'M-EXPR-01/*': { rule: 'requires_operation_knowledge_for_operations_present_in_item', assumed: ['M-ADD-01', 'M-SUB-01'], support: ['M-ADD-SUB-01'] },
  'M-EXPR-01/mulFirst': { assumed: ['M-MUL-02'], support: ['M-MUL-02'] },
  'M-EXPR-01/paren': { assumed: ['M-MUL-02'], support: ['M-MUL-02'] },
  'M-EXPR-01/sub': { assumed: ['M-MUL-02'], support: ['M-MUL-02'] },
  'M-EXPR-01/steps': { support: ['M-MUL-02', 'M-DIV-FACT-01'], limit: 'Valitaan laskutoimitusten järjestys; vastaus ei osoita laskutoimitusten numeerista suorittamista.' },
  'M-EXPR-01/transfer': { assumed: ['M-MUL-02'], support: ['M-MUL-02'], limit: 'Valitaan tilanteen laskulauseke; vastaus ei osoita kokonaishinnan itsenäistä laskemista.' },
  'M-UNIT-05/*': { rule: 'requires_multiplication_or_division_according_to_conversion_direction', assumed: [MUL, 'M-DIV-01'], support: ['M-MULTAB-ALL', 'M-DIV-01'] },
  'M-UNIT-05/transfer': { assumed: ['M-TIME-02'], support: ['M-TIME-02'] },
  'M-UNIT-05/hhmm': { rule: 'requires_multiplication_or_division_according_to_conversion_direction', assumed: [MUL, 'M-DIV-01'], support: ['M-MULTAB-ALL', 'M-DIV-01'], incidental: { decimal: 'Selitys nimeää ansan (1,5 h); tehtävä ratkeaa 60 minuutin paloilla ilman desimaalilaskua.' } },
  'PHY79-UNIT-CONV/*': { rule: 'requires_quantity_specific_unit_conversion_skill_for_item_instance', support: ['M-UNIT-02', 'M-UNIT-05'] },
  'PHY79-UNIT-CONV/kmM': { assumed: ['M-UNIT-02', 'M-DEC-08'], support: ['M-UNIT-02', 'M-DEC-08'] },
  'PHY79-UNIT-CONV/hMin': { assumed: ['M-UNIT-05', 'M-DEC-08'], support: ['M-UNIT-05', 'M-DEC-08'] },
  'PHY79-UNIT-CONV/minS': { assumed: ['M-UNIT-05'], support: ['M-UNIT-05'] },
  'PHY79-UNIT-CONV/transfer': { assumed: ['M-UNIT-02', 'M-DEC-08'], support: ['M-UNIT-02', 'M-DEC-08'] },
  'PHY79-UNIT-CONV/cmM': { assumed: ['M-UNIT-02', 'M-DEC-09'], support: ['M-DEC-09', 'M-UNIT-02'] },
  'PHY79-UNIT-CONV/match': { assumed: ['M-UNIT-02', 'M-UNIT-05', 'M-DEC-08'], support: ['M-UNIT-02', 'M-UNIT-05', 'M-DEC-08'] },
  'M79-EQ1-SOLVE/*': { rule: 'requires_arithmetic_operations_present_in_equation_item', assumed: ['M79-INT-ADD', 'M79-INT-SUB', 'M79-INT-DIV'], support: ['M79-INT-DIV', 'M79-INT-SUB'] },

  // ------------------------------------------------ context knowledge (scope addendum rows)
  'M79-EXPR-FORM/shape': { assumed: ['M-GMEAS-01'], support: ['M-GMEAS-01'] },
  'M79-EXPR-FORM/*': { limit: 'Valitsee lausekkeen tai rakentaa sen merkkipaloista (perhe build); vastaavat muodot hyväksytään.' },
  'M79-EQ1-FORM/*': { limit: 'Valitsee yhtälön tai rakentaa sen merkkipaloista (perhe build); vastaavat muodot hyväksytään.' },
  'M79-EQ1-FORM/transfer': { assumed: ['M-GMEAS-01'], support: ['M-GMEAS-01'] },
  'M-FRAC-11/transfer': { coTaught: [{ kc: 'M-FRAC-12', where: 'selitys: n/n − (a+b)/n' }], support: ['M-FRAC-12'],
    limit: 'Jäljelle jäävän osan voi laskea myös kuvan paloista; vastaus ei yksin näytä vähennyslaskutaitoa.' },
  'M-FRAC-03/*': { coTaught: [{ kc: 'M-FRAC-05', where: 'samannimisten vertailu' }, { kc: 'M-FRAC-11', where: 'siirtotehtävä: kaksi osaa yhteen' }] },
  'M79-FRAC-MUL/*': { coTaught: [{ kc: 'M-FRAC-08', where: 'malli: tulon supistaminen' }] },
  // Review L181-07: plotting a point by coordinates is a demand of its own, taught in M-COORD-PLOT-Q1.
  'M-SYM-01/transfer': { assumed: ['M-COORD-PLOT-Q1'], support: ['M-COORD-PLOT-Q1'] },
  'M79-FUNC-TABLE/transfer': { assumed: ['M-COORD-PLOT-Q1'], support: ['M-COORD-PLOT-Q1'] },
  'M-COORD-02/transfer': { coTaught: [{ kc: 'M-SYM-01', where: 'peilaus akselin yli' }], support: ['M-SYM-01'] },
  'PHY79-DATA-01/transfer': { assumed: ['M-DATA-05'], support: ['M-DATA-05'] },
  'M79-FUNC-01/*': { outcome: 'lukee annetun arvoparin tai tunnistaa yksi syöte–yksi arvo -ehdon annetulla äärellisellä joukolla', supplied: ['Kaikki syöte–arvoparit ja sallitut syötteet annetaan.'], limit: 'Ei lausekkeen arvon laskemista, vapaata funktion tuottamista tai tuntemattoman koneen yleisen toiminnan todistamista.' },

  // ------------------------------------------------ operations used inside other lessons
  'M-WORK-01/transfer': { assumed: [MUL], support: [MUL], outcome: 'valitsee tarvittavan tiedon; kertolasku näkyy vain vaihtoehdon tekstissä' },
  'M-TH-07/*': { coTaught: [{ kc: MUL, where: 'selitys: rivien lukumäärä × vaihtoehdot' }], support: [MUL],
    limit: 'Perheessä list kaikki yhdistelmät luetellaan ja puuttuvat tai toistuvat tarkistetaan; muissa perheissä vain tulos tai menetelmän tunnistus.' },
  'M79-LOGIC-01/*': { assumed: ['M-MULTAB-LOW', 'M79-EXPR-EVAL'], support: ['M79-EXPR-EVAL', 'M-MULTAB-LOW'] },
  'M-PLACE-04/*': { coTaught: [{ kc: MUL, where: 'selitys: numero × paikka-arvo' }] },
  'M-PLACE-05/regroup': { coTaught: [{ kc: MUL, where: 'selitys: 37 × 10' }] },
  'M-DEC-DECOMPOSE/transfer': { coTaught: [{ kc: MUL, where: 'selitys: kolikoiden määrä × arvo' }] },
  'M-ALG-04/*': { outcome: 'tunnistaa vielä tuntemattoman määrän tai luvun ja erottaa sen annetusta tiedosta', supplied: ['Kohde ja kaikki näkyvät luvut nimetään tehtävässä.'], limit: 'Ei yhtälönratkaisua tai tuntemattoman lukuarvon tuottamista; valmiiden kuvausten valinta ei todenna fyysistä peittämis- ja paljastamistoimintaa.' },
  'M-ALG-07/*': { assumed: ['M-MULTAB-ALL'], support: ['M-MULTAB-ALL'] },
  'M79-VAR-UNKNOWN/tags': { assumed: ['M-MULTAB-ALL'], support: ['M-MULTAB-ALL'] },
  'M79-VAR-VARYING/fill': { assumed: ['M79-EXPR-EVAL', 'M-MULTAB-ALL'], support: ['M79-EXPR-EVAL'] },
  'M79-VAR-01/classify': { supplied: ['Kaava piiri = 4s on annettu.'], support: ['M-GMEAS-01'] },
  'M79-VAR-01/transfer': { supplied: ['Kaava piiri = 4s on annettu.'], support: ['M-GMEAS-01'] },
  'M79-DEP-01/transfer': { outcome: 'yhdistää annetun ajan sille annettuun vesimäärään', supplied: ['Kysytty aika ja vesimäärä annetaan valmiina parina.'], limit: 'Ei kertolaskua tai taulukon ulkopuolelle ennustamista.' },
  'M79-EXPR-EVAL/neg': { assumed: ['M79-INT-MUL', 'M79-INT-ADD'], support: ['M79-INT-MUL'] },
  'M79-FUNC-01/run': { outcome: 'lukee sallitulle syötteelle annetun arvon', supplied: ['Koko äärellinen paritaulu on annettu.'] },
  'M79-FUNC-TABLE/fill': { assumed: ['M79-EXPR-EVAL', 'M79-INT-SUB', 'M-MULTAB-ALL'], support: ['M79-EXPR-EVAL', 'M79-INT-SUB'] },
  'M79-UNIT-LIN/*': { assumed: ['M-DEC-08', 'M-DEC-09', 'M-UNIT-02'], support: ['M-DEC-08', 'M-DEC-09', 'M-UNIT-02'] },
  'M79-PROP-01/transfer': { assumed: ['M-DEC-08'], support: ['M-DEC-08'] },
  'PHY79-SPEED-REARR/transfer': { assumed: ['M79-DEC-DIV'], support: ['M79-DEC-DIV'] },
  'M79-DEC-DIV/transfer': { supplied: ['Muuntokerroin 3,6 on annettu.'], support: ['PHY79-SPEED-UNIT'] },
  'M79-SLOPE/transfer': { coTaught: [{ kc: 'PHY79-SPEED-CONCEPT', where: 'selitys: kulmakerroin on nopeus' }] },
  'M-UNIT-02/*': { assumed: [MUL, 'M-DIV-01'], supplied: ['Yksikköportaat ja kerroin näkyvät tehtävässä.'], support: ['M-UNIT-01'] },
  'M-UNIT-03/*': { assumed: [MUL, 'M-DIV-01'], supplied: ['Yksikköportaat ja kerroin näkyvät tehtävässä.'], support: ['M-UNIT-01', 'M-MEAS-06'] },
  'M-UNIT-04/*': { assumed: [MUL, 'M-DIV-01'], supplied: ['Yksikköportaat ja kerroin näkyvät tehtävässä.'], support: ['M-UNIT-01', 'M-MEAS-09'] },
  'M-UNIT-01/*': { coTaught: [{ kc: MUL, where: 'kertoimet 10, 100, 1000' }] },
  'M-DEC-03/*': { supplied: ['Tehtävä kertoo, montako pientä yksikköä on isossa.'] },
  'M-DEC-WRITE/transfer': { supplied: ['1 cm = 0,01 m on kerrottu.'] },
  'M-DEC-09/transfer': { supplied: ['Metrissä on 100 senttiä on kerrottu.'] },

  // ------------------------------------------------ features present but not demanded
  'M-DATA-09/method': { incidental: { clock: 'Vaihtoehdossa mainitaan kellonaika; sitä ei lueta eikä lasketa.' } },
  'M79-RECIP-01/*': { incidental: { negative: 'Negatiivinen luku on vain väärä vaihtoehto.', decimal: 'Desimaaliluku on vain väärä vaihtoehto.' } },
  'M79-FRAC-DIV/bigger': { incidental: { decimal: 'Selityksen 2,5 havainnollistaa; vertailun voi tehdä ilman desimaalijakoa.' } },
  'PHY79-SPEED-CONCEPT/*': { incidental: { decimal: 'Selitys näyttää nopeudet; vastaus syntyy vertailemalla matkaa tai aikaa.' } },
  'PHY79-SPEED-CALC/transfer': { assumed: ['M-DEC-ADD'], support: ['M-DEC-ADD'] },
  'PHY79-QTY-CONCEPT/*': { incidental: { decimal: NEUTRAL_DEC } },
  'PHY79-NUMVALUE/*': { incidental: { decimal: NEUTRAL_DEC } },
  'PHY79-UNIT-CONCEPT/*': { incidental: { decimal: NEUTRAL_DEC, convertLength: 'Selitys mainitsee cm ja m; mitään ei muunneta.' } },
  'PHY79-QTY-01/*': { incidental: { decimal: NEUTRAL_DEC, speedUnit: 'Yksikkö m/s on vain sijoitettava osa.' } },
  'PHY79-DIST-TIME/*': { incidental: { decimal: NEUTRAL_DEC, convertLength: UNITS_LISTED, convertTime: UNITS_LISTED } },

  // ------------------------------------------------ bounded outcomes (P1)
  'M-DATA-02/*': { limit: 'Perheessä record havainnot kirjataan itse tukkimiehen kirjanpitoon; muut perheet lukevat valmista merkintää.' },
  'M-WRADD/*': { limit: 'Perheessä column ja perheessä transfer lapsi laskee summan itse: näkyy lopputulos, ei käytetty menetelmä eikä kirjoitettu muistinumero. Perheessä step muistinumero lisätään kymppeihin yhdessä numerossa; perheissä ones, where ja check muistinumeroon liittyvä kohta tunnistetaan valmiista laskusta.' },
  'M-WRSUB/*': { limit: 'Perheessä step tarkistetaan lainaus; muissa vain lopputulos.' },
  'M-WRMUL/*': { limit: 'Osatulot näkyvät; perheessä step tarkistetaan muistinumero, muissa vain lopputulos.' },
  'M-WRDIV/*': { limit: 'Perheessä step tarkistetaan ensimmäinen osamäärä ja jakojäännös; muissa vain lopputulos.' },
  'M79-FRAC-DIV/*': { limit: 'Perheessä calc lasketaan erinimisten murtolukujen osamäärä, ja samanarvoiset murtoluvut hyväksytään; käänteisluvun valinta on vain osataito.' },
};

/** Activity-use rows (scope manifest) folded in as assumed/co-taught demands. */
const COVERAGE_DECL: Record<string, FamilyDecl> = {};
for (const c of COVERAGE) {
  // "kmM, hMin" or "run and transfer; related ..." name several families; "demo" means the lesson.
  const tags = c.family.split(/,|;| and /).map((x) => x.trim().split(/[ (]/)[0]!).filter(Boolean).map((x) => (x === 'demo' ? '*' : x));
  for (const tag of tags) {
    const d = (COVERAGE_DECL[`${c.target}/${tag}`] ??= {});
    if (c.role.startsWith('co')) (d.coTaught ??= []).push({ kc: c.uses, where: c.family });
    else (d.assumed ??= []).push(c.uses);
    (d.support ??= []).push(c.uses);
  }
}

const merge = (...ds: (FamilyDecl | undefined)[]): FamilyDecl => {
  const out: FamilyDecl = {};
  for (const d of ds) if (d) {
    for (const k of ['assumed', 'supplied', 'support'] as const) if (d[k]) out[k] = [...new Set([...(out[k] ?? []), ...d[k]!])];
    if (d.coTaught) out.coTaught = [...(out.coTaught ?? []), ...d.coTaught];
    if (d.incidental) out.incidental = { ...out.incidental, ...d.incidental };
    if (d.outcome) out.outcome = d.outcome;
    if (d.limit) out.limit = d.limit;
    if (d.rule) out.rule = d.rule;
  }
  return out;
};

/** The registry entry for one family (tag) of a lesson. */
export function family(node: string, tag: string, kind?: Task['kind']): Family {
  const keys = [node, `${node}/*`, `${node}/${tag}`];
  const d = merge(...keys.map((k) => COVERAGE_DECL[k]), ...keys.map((k) => DECL[k]));
  const source = keys.filter((k) => DECL[k] || COVERAGE_DECL[k]);
  return {
    node, tag,
    outcome: d.outcome ?? (kind ? OUTCOME[kind] : 'vastaa tehtävään'),
    assumed: d.assumed ?? [], supplied: d.supplied ?? [], coTaught: d.coTaught ?? [],
    incidental: d.incidental ?? {},
    // Most specific help first: this family, then the whole lesson.
    support: [...new Set([...keys].reverse().flatMap((k) => [...(DECL[k]?.support ?? []), ...(COVERAGE_DECL[k]?.support ?? [])]))],
    limit: d.limit, rule: d.rule ?? kc(node).dynamic ?? undefined,
    source: source.length ? source.map((k) => (DECL[k] ? `families.ts ${k}` : `scope manifest ${k}`)) : ['oletus'],
  };
}

/** Every KC id the registry names, for the in-scope check. */
export function namedKCs(): string[] {
  const out = new Set<string>();
  for (const d of [...Object.values(DECL), ...Object.values(COVERAGE_DECL)]) {
    for (const k of [...(d.assumed ?? []), ...(d.support ?? []), ...(d.coTaught ?? []).map((c) => c.kc)]) out.add(k);
  }
  return [...out];
}
export const inScope = (id: string) => ORDER.includes(id);
