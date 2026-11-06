import type { DemoStep, Item, NodeSpec, Phase } from '../engine/types';
import type { Rng } from '../engine/rng';
import { solutionChemicalInvestigation, type ChemicalInvestigationTask, type InvestigationInstrument, type InvestigationReview,
  type InvestigationSourceRow } from './models/chemical-investigation';
import { chemicalInvestigationScene, type ChemicalInvestigationScene } from './models/chemical-investigation-scene';
import { chemicalInvestigationBoard, chemicalInvestigationExample } from './scenes/chemical-investigation';

type InvestigationItem = Omit<Item, 'task' | 'sceneModel'> & { task: ChemicalInvestigationTask; sceneModel?: ChemicalInvestigationScene };
type Draft = Omit<InvestigationItem, 'tag'>;
type Variant = 'build' | 'contrast' | 'transfer';
type Author = (r: Rng, variant: Variant) => Draft;
type Definition = Pick<NodeSpec, 'id' | 'stop' | 'icon' | 'intro' | 'goal' | 'reward' | 'produceWhat'> & { author: Author; tags: readonly [string, string]; limit: string };
type Data = ChemicalInvestigationTask extends infer T ? T extends ChemicalInvestigationTask ? Omit<T, 'kind' | 'run' | 'context' | 'safety'> : never : never;
const ctx = (title: string, ...skills: string[]) => ({ title, skills });
const contexts = {
  tool: ctx('Annettu kertamittaus ja virtuaalisen välineen kalibrointi', 'SCI-ENV-TOOL-01'),
  measure: ctx('Massan tai tilavuuden yksikkö ja asteikon jakoväli', 'SCI-ENV-MEAS-01'),
  observe: ctx('Annettu havaintokuva ja väitteet', 'SCI-ENV-OBSERVE-01'),
  design: ctx('Annetun mallin vertailutekijät ja havaittava vaste', 'SCI-ENV-QUESTION-01'),
  data: ctx('Näytetunniste, olosuhde ja mittayksikkö', 'SCI-ENV-DATA-01', 'M-DATA-10'),
  conclude: ctx('Annetut tutkimustulokset ja toteutusmuistiinpanot'),
};
function draft(data: Data, say: string, hint: string, explain: string): Draft {
  let hash = 0xcbf29ce484222325n;
  for (const char of JSON.stringify(data)) hash = BigInt.asUintN(64, (hash ^ BigInt(char.charCodeAt(0))) * 0x100000001b3n);
  const task = { kind: 'chemical-investigation', run: `inquiry-${hash.toString(16)}`, context: contexts[data.mode],
    safety: data.mode === 'tool' || (data.mode === 'design' && data.objective === 'plan') ? ['CHEM79-SAFE-01'] : [], ...data } as ChemicalInvestigationTask;
  return { task, scene: chemicalInvestigationBoard(task), sceneModel: chemicalInvestigationScene(task), say, hint, explain };
}
function rubric(prompt: string, criteria: readonly (readonly [string, string, string])[], model: string): InvestigationReview {
  return { prompt, model, rubric: criteria.map(([id, label, guide]) => ({ id, label, guide })) };
}
function instruments(fineUl = 100): InvestigationInstrument[] {
  return [
    { id: 'pipette-small', label: 'Pieni mittapipetti', quantity: 'volume', capacity: 5000, division: fineUl, transferable: true },
    { id: 'pipette-large', label: 'Suurempi mittapipetti', quantity: 'volume', capacity: 10000, division: 500, transferable: true },
    { id: 'cylinder', label: 'Mittalasi', quantity: 'volume', capacity: 100000, division: 1000, transferable: true },
    { id: 'beaker', label: 'Karkea keitinlasi', quantity: 'volume', capacity: 150000, division: 10000, transferable: true },
    { id: 'balance', label: 'Virtuaalivaaka', quantity: 'mass', capacity: 100000, division: 10, transferable: false },
  ];
}
function tool(r: Rng, variant: Variant): Draft {
  const fine = variant === 'transfer' ? 500 : 100;
  const requested = variant === 'contrast' ? r.int(15, 70) * 1000 : r.int(2, variant === 'transfer' ? 14 : 35) * fine;
  return draft({ mode: 'tool', title: 'Näyte löytää oikean astian', requestedUl: requested, sourceUl: requested * r.int(3, 6),
    requiredDivisionUl: variant === 'contrast' ? 1000 : fine, instruments: instruments(fine), unit: variant === 'build' ? 'ul' : 'ml',
    protocol: 'Virtuaalinen vesinäyte. Valitse väline, johon koko pyydetty mitta mahtuu kerralla. Ota itse annos välineeseen ja siirrä se kokonaan vastaanottajaan.' },
  'Valitse tarkoitukseen sopiva väline ja siirrä pyydetty nestemäärä. Kirjaa lopuksi oma siirtosi.',
  'Vertaa tilavuutta välineen enimmäismittaan ja jakoväliin. Karkea asteikko ei lupaa pienen annoksen tarkkuutta.',
  'Tarkoitukseen sopiva väline ulottuu annokseen ja sen jakoväli on riittävän pieni. Lähdeastian, välineen ja vastaanottajan yhteinen tilavuus säilyy.');
}
function measure(r: Rng, variant: Variant): Draft {
  const mass = variant === 'build', amount = mass ? r.int(12, 85) * 100 : r.int(12, 75) * 1000;
  return draft({ mode: 'measure', title: mass ? 'Näyte ilman astian massaa' : 'Sama määrä eri astiassa', quantity: mass ? 'mass' : 'volume',
    amount, requiredDivision: mass ? 10 : 1000, containerMg: mass ? r.int(8, 32) * 100 : 0, offsetMg: mass ? r.int(-3, 3) * 10 : 0,
    instruments: instruments(), unit: mass ? r.pick(['mg', 'g'] as const) : 'ml', shape: variant === 'transfer' ? 'flared' : 'cylinder',
    protocol: mass ? 'Virtuaalinen vaaka. Aseta tyhjä näyteastia, taaraa se ja lisää vasta sitten näyte. Ota oma lukema.'
      : 'Virtuaalinen vesinäyte lasisessa mitta-astiassa. Aseta näyte mittaan, siirrä katse meniskin tasolle ja lue alin kohta.' },
  mass ? 'Mittaa näytteen oma massa. Astia kuuluu taaraan.' : 'Mittaa näytteen tilavuus oikeasta lukukohdasta.',
  mass ? 'Vaaka näyttää aluksi myös astian ja mahdollisen nollapoikkeaman. Taaraus tyhjällä astialla poistaa ne näytteen lukemasta.'
    : 'Valitse riittävä mitta-alue ja jakoväli. Astian korkeus ei ole sama asia kuin sen sisältämän veden tilavuus.',
  mass ? 'Näytteen massa saadaan tyhjän astian taarauksen jälkeen. Kirjattu yksikkö kulkee lukeman mukana.'
    : 'Veden meniskin alin kohta luetaan samalla korkeudella. Asteikko kuuluu juuri tämän muotoiselle mitta-astialle.');
}
function observe(r: Rng, variant: Variant): Draft {
  const n = r.int(3, 18), feature = variant === 'build' ? 'bubble' : variant === 'contrast' ? 'colour' : 'precipitate';
  const observed = feature === 'bubble' ? `Näytteessä näkyy ${n} piirrettyä kuplamerkkiä.` : feature === 'colour' ? `Mallinäytteen värilukema muuttuu ${n}:stä ${n + 3}:een.` : `Astian pohjalle tulee ${n} piirrettyä sakkamerkkiä.`;
  const temperatureC = r.int(18, 26);
  const cards = [
    { id: 'visible', text: observed, category: 'observation' as const },
    { id: 'temperature', text: `Mittari näyttää ${temperatureC} °C.`, category: 'observation' as const },
    { id: 'identity', text: feature === 'bubble' ? 'Kuplat ovat varmasti uutta happea.' : feature === 'colour' ? 'Värinmuutos todistaa tämän aineen nimen.' : 'Sakka on varmasti nimettyä ainetta ilman lisäanalyysia.', category: 'inference' as const },
    { id: 'cause', text: 'Pelkkä tämä näkymä todistaa varmasti tapahtuman kemiallisen syyn.', category: 'inference' as const },
  ];
  return draft({ mode: 'observe', title: 'Havainto saa oman paikkansa', observation: `${observed} Merkit ovat laadullinen havaintokuva. Ne eivät laske yksittäisiä molekyylejä.`, illustration: { feature, before: feature === 'colour' ? n : 0, after: feature === 'colour' ? n + 3 : n, temperatureC }, cards: r.shuffle(cards),
    evidenceNeeded: feature === 'bubble' ? ['analyse-gas', 'compare-control'] : feature === 'colour' ? ['compare-control', 'analyse-sample'] : ['analyse-sample', 'compare-control'] },
  'Järjestä suoraan kuvatut havainnot ja niistä tehdyt tulkinnat. Valitse hyödyllinen lisänäyttö.',
  'Havainto kertoo, mitä näkyi tai mitä mittari näytti. Aineen nimi ja muutoksen syy tarvitsevat muutakin näyttöä.',
  'Kupla, väri tai sakka on havainto. Kemiallinen identiteetti tai tapahtuman syy päätellään erillisistä havainnoista ja vertailuista.');
}
function design(r: Rng, objective: 'question' | 'plan', variant: Variant): Draft {
  const variable = variant === 'contrast' ? 'temperature' as const : 'solvent' as const;
  const low = r.int(12, 24), dose = r.int(3, 16) * 100;
  const levels: readonly [string, string] = variable === 'temperature' ? [`${low} °C`, `${low + r.int(10, 25)} °C`] :
    variant === 'transfer' ? ['Vesi', 'Nimetty malliliuotin B'] : ['Vesi', 'Annettu mallirasva'];
  const controls = [
    { id: 'dose', label: `Sama lisätty ainemäärä ${dose} mg`, required: true },
    { id: 'solvent-amount', label: `Sama liuotinmäärä ${r.int(5, 12)} g`, required: true },
    { id: 'time', label: 'Sama sekoitus- ja odotusmenettely', required: true },
    { id: variable === 'temperature' ? 'solvent' : 'temperature', label: variable === 'temperature' ? 'Sama liuotin' : 'Sama lämpötila', required: true },
    { id: 'changed', label: variable === 'temperature' ? 'Myös lämpötila samana' : 'Myös liuotin samana', required: false },
  ];
  return draft({ mode: 'design', title: objective === 'question' ? 'Aavan oma tutkittava kysymys' : 'Näytteiden reilu kohtaaminen', objective,
    variable, response: 'dissolved-mass', levels, controls: r.shuffle(controls),
    protocol: `Nimetty malliaine ${variant === 'transfer' ? 'B' : 'A'}. Käytössä on rajattu virtuaalinen liukenemismalli. Vasteena mitataan liuennutta massaa. Vertailutasot ovat ${levels.join(' ja ')}.`,
    review: rubric(objective === 'question' ? 'Muodosta omin sanoin rajattu tutkimuskysymys ja kerro, millainen havainto vastaisi siihen.' : 'Kerro omin sanoin suunnitelma, jolla vertailu olisi reilu ja toistettava annettujen virtuaaliohjeiden mukaan.',
      objective === 'question' ? [
        ['question', 'Oma kysymys rajaa vertailun', 'Nimeää tarkasteltavan aineen, liuottimen tai lämpötilan ja rajaa kysymyksen annettuihin kahteen tasoon.'],
        ['answer', 'Nimeää havaittavan vastauksen', 'Kertoo, mitä liuenneen massan tuloksia vertaamalla kysymykseen voisi vastata. Erottaa tutkittavan kysymyksen mieltymyksestä.'],
      ] : [
        ['control', 'Selittää reilun vertailun', 'Kertoo, mikä muuttuu ja miksi muut annetut tekijät pidetään samoina.'],
        ['repeat', 'Selittää toistot ja menettelyn', 'Nimeää toistot sekä annetun virtuaalisen menettelyn. Toistot eivät korvaa kontrolloituja oloja.'],
      ], `Vertaan malliaineen liuennutta massaa tasoilla ${levels.join(' ja ')}. Muut olot pidetään samoina. Oma kysymys ja suunnitelma koskevat tätä annettua mallia.`) },
  objective === 'question' ? 'Valmistele oman kysymyksesi osat ja kerro sitten itse kysymys.' : 'Rakenna suunnitelma ja perustele se omin sanoin.',
  'Vaihda yhtä vertailutekijää. Havaittava vaste kertoo, mihin kysymykseen aineistosta voidaan vastata.',
  'Valmistellut osat auttavat omaa kysymystä ja suunnitelmaa. Aikuinen havainnoi oppijan oman tuotoksen merkityksen.');
}
function sourceRows(r: Rng, variant: Variant): InvestigationSourceRow[] {
  const numeric = variant !== 'build', dose = r.int(7, 18) * 100, base = r.int(0, 7) * 100, temps = numeric ?
    variant === 'transfer' ? [12, 27, 58] : [20, 30, 40] : [20, 20, 20];
  const solvents = numeric ? ['Vesi', 'Vesi', 'Vesi'] : ['Vesi', 'Annettu mallirasva', 'Nimetty malliliuotin'];
  return r.shuffle(temps.map((temperatureC, i) => ({ id: String.fromCharCode(65 + i), sourceId: `M${r.int(10, 99)}-${i + 1}`,
    sample: `Malliaine ${variant === 'transfer' ? 'B' : 'A'}`, condition: numeric ? `${temperatureC} °C` : solvents[i]!, x: numeric ? temperatureC : null,
    solvent: solvents[i]!, temperatureC, solventMg: 10000, doseMg: dose,
    capacityMg: i === 1 && variant === 'contrast' ? Math.max(0, base - 100) : base + i * 300,
    missing: variant === 'transfer' && i === 1, note: i === 1 && variant === 'contrast' ? 'Poikkeava havainto säilytetään. Sen syytä ei oleteta ilman lisäselvitystä.' : variant === 'transfer' && i === 1 ? 'Mittarin lukema puuttuu. Näyte ja olosuhde tunnetaan.' : 'Näyte on tunnistettu.' })));
}
function data(r: Rng, objective: 'collect' | 'present' | 'both', variant: Variant): Draft {
  return draft({ mode: 'data', title: objective === 'collect' ? 'Jokaisen näytteen oma jälki' : objective === 'present' ? 'Tulokset näkyviksi' : 'Laboratorion avoin näyttely',
    objective, rows: sourceRows(r, variant), xKind: variant === 'build' ? 'solvent' : 'temperature', numericX: variant !== 'build',
    publicResults: objective === 'present', unit: variant === 'contrast' ? 'g' : 'mg',
    protocol: 'Annetun virtuaalimallin kokeessa näyte sekoitetaan ja odotetaan mallin tasapainoa. Liuennut määrä tulee tämän näytteen ja näiden olojen mallikapasiteetista. Liuennut ja jäännösaine säilyvät yhteensä lisätyn aineen massana. Luvut ovat opetusmallin tuloksia.' },
  objective === 'collect' ? 'Tee jokainen oma virtuaalikoe ja kirjaa sen havainto oikeaan näyteriviin.' : objective === 'present' ? 'Rakenna alkuperäisistä havainnoista oma taulukko tai diagrammi suureineen ja yksiköineen.' : 'Kerää oma aineisto, rakenna siitä diagrammi ja yhdistä yksi arvo alkuperäiseen mittaukseen.',
  'Pidä tunniste ja olosuhde lukeman yhteydessä. Säilytä poikkeava arvo. Puuttuva tulos merkitään puuttuvaksi.',
  'Esitys säilyttää alkuperäiset havainnot ja yksiköt. Katsoja voi seurata saman näytteen koko tietopolkua.');
}
function conclude(r: Rng, objective: 'conclusion' | 'evaluate' | 'both', variant: Variant): Draft {
  const a = r.int(3, 11) * 100, b = variant === 'contrast' ? a + r.int(-1, 1) * 10 : a + r.int(2, 7) * 100;
  const issue = objective === 'evaluate' ? variant === 'build' ? 'label' as const : 'temperature' as const :
    variant === 'transfer' ? 'temperature' as const : variant === 'contrast' ? 'overlap' as const : 'none' as const;
  const rows = [
    { id: 'A', sample: variant === 'transfer' ? 'Malliaine B' : 'Malliaine A', condition: 'Liuotin 1', massMg: a, note: 'Annetun vertailun ensimmäinen tulos.' },
    { id: 'B', sample: issue === 'label' ? 'Etiketissä Malliaine A' : variant === 'transfer' ? 'Malliaine B' : 'Malliaine A', condition: 'Liuotin 2', massMg: b,
      note: issue === 'label' ? 'Näytepullon etiketti on vaihtunut. Aineen identiteetti on epäselvä.' : issue === 'temperature' ? 'Tässä näytteessä lämpötila vaihtui myös. Liuottimen vaikutusta ei voi erottaa.'
        : issue === 'overlap' ? 'Molempien lukemien epävarmuus on ±50 mg. Välit menevät päällekkäin.' : 'Sama aine, lämpötila, annos ja menettely kuin ensimmäisessä näytteessä.' },
  ];
  return draft({ mode: 'conclude', title: objective === 'evaluate' ? 'Epävarma kohta näkyväksi' : objective === 'conclusion' ? 'Näytteiden kertoma vastaus' : 'Lasilaboratorion yhteinen päätös',
    objective, question: 'Kummassa annetussa liuottimessa juuri tämä malliaine liukeni enemmän vertailukelpoisissa oloissa?', rows,
    issue, issueRows: issue === 'none' ? [] : issue === 'overlap' ? ['A', 'B'] : ['B'],
    review: rubric(objective === 'evaluate' ? 'Arvioi toteutus ja ehdota oma perusteltu rajattu parannus.' : objective === 'conclusion' ? 'Kerro tulosten tukema oma johtopäätös ja sen rajaus.' : 'Kerro oma johtopäätös ja arvioi erikseen toteutuksen luotettavuutta.',
      [
        ...(objective !== 'evaluate' ? [['conclusion', 'Oma päätelmä käyttää todellisia havaintoja', 'Nimeää kysymykseen liittyvän vertailun ja rajaa päätelmän tähän aineeseen, liuottimiin ja oloihin. Epäselvä vertailu voi jäädä ratkaisematta.'] as const] : []),
        ...(objective !== 'conclusion' ? [['evaluation', 'Oma arvio selittää rajauksen ja parannuksen', 'Kytkee luotettavuusarvion annettuun toteutusmuistiinpanoon. Ehdottaa juuri siihen kohdistuvaa uutta mittausta tai kontrollia, säilyttäen alkuperäiset havainnot.'] as const] : []),
      ], issue === 'none' ? 'Näiden havaintojen lukemia voidaan verrata tässä kysymyksessä. Väite rajautuu annettuun malliaineeseen ja oloihin.'
        : 'Lukemien ero voidaan laskea, mutta kirjattu epävarmuus tai muuttunut olosuhde rajoittaa päätelmää. Korjataan tai toistetaan juuri epävarma osa ja säilytetään vanhat tiedot.') },
  objective === 'evaluate' ? 'Osoita epävarma kohta. Ehdota oma perusteltu parannus.' : 'Osoita molemmat vertailuhavainnot ja muodosta niihin rajattu oma päätelmä.',
  'Lukema ei yksin takaa reilua vertailua. Katso myös tunnisteita, lämpötilaa, puuttuvaa havaintoa ja annettua epävarmuutta.',
  'Tutkimusraportissa tulos ja tuloksen luotettavuus kulkevat rinnakkain. Perusteltu keskeneräisyys säilyttää havainnon arvon.');
}
const observedLimit = 'Oma kysymys, suunnitelma tai päätelmä edellyttää ihmisen erillistä rubric-havaintoa. Valmisteltujen osien valinta ei korvaa omaa selitystä. Puhetta ja omaa tekstiä ei tallenneta.';
const definitions: Definition[] = [
  { id: 'CHEM79-LAB-01', stop: 'Lasilaboratorion täsmälliset välineet', icon: '⚗', intro: 'Aava valitsee annokseen sopivan virtuaalivälineen. Loikka seuraa näytteen siirtymistä.', goal: 'Valitset tarkoitukseen sopivan välineen ja teet sen oikean virtuaalisen käyttövaiheen.', reward: 'Näyte päätyy tarkoituksenmukaisesti vastaanottajaan.', produceWhat: 'oman välinevalinnan ja säilyvän tilavuuden siirtotoimet', author: tool,
    tags: ['precise-small-pipette-transfer', 'larger-graduated-vessel-transfer'], limit: 'Näyttö koskee annetun virtuaalivälineen tarkoitusta, mitta-aluetta, jakoväliä ja siirtoa. Fyysinen laboratoriovälineen käsittely ja turvallisuus arvioidaan erikseen. CHEM79-SAFE-01 säilyy kanonisena safety_gate-suhteena.' },
  { id: 'CHEM79-MEAS-01', stop: 'Näytteen oikea määrä', icon: '⚖', intro: 'Sulan pöydällä näyte ja astia erotetaan mittauksessa toisistaan.', goal: 'Teet oman taara- tai meniskimittauksen ja kirjaat arvon yksikköineen.', reward: 'Oikein mitattu näyte saa vertailupaikan.', produceWhat: 'välineen käyttövaiheet ja oman lukeman', author: measure,
    tags: ['tare-container-and-read-net-mass', 'read-water-meniscus-at-eye-level'], limit: 'Virtuaalisen kalibroinnin mittausprosessi. Siirrossa astian muoto vaihtuu. Asteikon tarkkuus annetaan ja täsmällinen 2D-paneeli vastaa 3D-mallia.' },
  { id: 'CHEM79-OBS-01', stop: 'Kupla vai valmis selitys?', icon: '◌', intro: 'Loikka ehdottaa näytteelle nimeä. Aava erottaa näkyvän havainnon tulkinnasta.', goal: 'Erotat havainnon ja tulkinnan sekä tunnistat lisänäytön tarpeen.', reward: 'Näyttelykortti säilyttää havainnon ja avoimen kysymyksen.', produceWhat: 'havainto–tulkinta-luokitukset ja lisänäytön tunnistuksen', author: observe,
    tags: ['separate-bubble-observation-from-gas-identity', 'separate-colour-reading-from-causal-claim'], limit: 'Rakenteista havainto–tulkinta-erottelua annetusta kuvauksesta. Kuplamerkit ja värilukemat eivät yksin todista reaktiota tai aineen identiteettiä.' },
  { id: 'CHEM79-QUESTION-01', stop: 'Mikä liukenee ja mihin?', icon: '?', intro: 'Sulka antaa Aavalle kaksi vertailutasoa ja tilan omalle tutkittavalle kysymykselle.', goal: 'Muodostat oman rajatun kysymyksen ja nimeät havaittavan vastauksen.', reward: 'Oma kysymys saa juuri siihen kuuluvan havaintoikkunan.', produceWhat: 'oman tutkimuskysymyksen', author: (r, v) => design(r, 'question', v), tags: ['form-solvent-comparison-question', 'form-temperature-comparison-question'], limit: observedLimit },
  { id: 'CHEM79-PLAN-01', stop: 'Näytteiden reilu kohtaaminen', icon: '≋', intro: 'Aava pitää vertailussa muut olot samoina. Loikka lisää toistot oikeaan paikkaan.', goal: 'Tuotat reilun suunnitelman, toistot ja annetun virtuaalisen menettelyn.', reward: 'Tutkimuspöytä asettuu reiluun vertailuun.', produceWhat: 'oman kontrolloidun tutkimussuunnitelman', author: (r, v) => design(r, 'plan', v), tags: ['control-solvent-comparison', 'control-temperature-comparison'], limit: `${observedLimit} Turvallisuusehto säilyy lähteessä, ja tämän tehtävän menettely on virtuaalinen.` },
  { id: 'CHEM79-DATA-COLLECT', stop: 'Jokaisella näytteellä oma jälki', icon: '▤', intro: 'Aava tekee virtuaalikokeet. Loikka säilyttää myös odottamattoman tuloksen.', goal: 'Kirjaat omista virtuaalikokeista tunnisteellisen aineiston yksikköineen.', reward: 'Jokainen näyte saa jäljitettävän rivin.', produceWhat: 'omat koetoimet ja alkuperäisiin havaintoihin vastaavat rivit', author: (r, v) => data(r, 'collect', v), tags: ['collect-matched-solvent-runs', 'retain-unexpected-temperature-run'], limit: 'Laskennallisen mallin omat virtuaalikokeet ja muuttumaton havaintoloki. Tuloksia ei esitetä tosimaailman liukoisuustaulukon arvoina.' },
  { id: 'CHEM79-DATA-PRESENT', stop: 'Sulan selkeä havaintokuva', icon: '▥', intro: 'Sulka asettaa alkuperäiset havainnot näkyviin. Aava rakentaa niistä oman esityksen.', goal: 'Esität alkuperäiset tulokset sopivalla taulukolla tai diagrammilla.', reward: 'Retkeläiset voivat vertailla näytteiden tuloksia.', produceWhat: 'oman esityksen suureineen, arvoineen ja yksiköineen', author: (r, v) => data(r, 'present', v), tags: ['present-categorical-solvent-data', 'present-ordered-temperature-data'], limit: 'Oma taulukko tai tarkoitukseen sopiva diagrammi. Viivakuva yhdistää havaintopisteitä ja rajautuu annettuihin mittauksiin.' },
  { id: 'CHEM79-DATA-01', stop: 'Laboratorion avoin näyttely', icon: '▦', intro: 'Aava ja Loikka näyttävät koko tietopolun näytteestä omalle näyttelytaululle.', goal: 'Keräät aineiston, rakennat diagrammin ja osoitat arvon alkuperän.', reward: 'Näyttely avautuu jäljitettävällä aineistolla.', produceWhat: 'oman keruun ja esityksen samasta uudesta aineistosta', author: (r, v) => data(r, 'both', v), tags: ['collect-and-plot-solvent-runs', 'collect-and-plot-temperature-runs'], limit: 'Erillinen integraationäyttö samasta aineistosta. Atomisten keruu- ja esityssolmujen historia säilyy erillisenä.' },
  { id: 'CHEM79-CONCLUSION', stop: 'Näytteiden kertoma vastaus', icon: '∴', intro: 'Aava käyttää todellisia vertailulukemia ja kertoo, mihin väite rajautuu.', goal: 'Muodostat aineistosta oman rajatun johtopäätöksen.', reward: 'Tutkimusvihkon kysymys saa perustellun vastauksen.', produceWhat: 'oman havaintoihin sidotun päätelmän', author: (r, v) => conclude(r, 'conclusion', v), tags: ['compare-matched-observations-and-bound-claim', 'recognise-overlapping-uncertainty-and-bound-claim'], limit: observedLimit },
  { id: 'CHEM79-INVESTIGATION-EVAL', stop: 'Väärään pulloon vaihtunut etiketti', icon: '↻', intro: 'Loikka huomaa toteutuksen epävarman kohdan. Sulka säilyttää alkuperäisen havainnon.', goal: 'Arvioit epävarmuuden vaikutuksen ja ehdotat omaa rajattua parannusta.', reward: 'Epävarma kohta saa rehellisen merkinnän ja uusintasuunnitelman.', produceWhat: 'oman toteutuksen arvion ja parannuksen', author: (r, v) => conclude(r, 'evaluate', v), tags: ['evaluate-uncertain-sample-label', 'evaluate-uncontrolled-temperature'], limit: observedLimit },
  { id: 'CHEM79-CONCL-01', stop: 'Lasilaboratorion yhteinen päätös', icon: '✓', intro: 'Aava ja Sulka kokoavat tuloksen ja sen luotettavuuden samaan raporttiin.', goal: 'Tuotat samasta uudesta tapauksesta päätelmän ja erillisen toteutuksen arvion.', reward: 'Läpinäkyvä tutkimusraportti saa ystävien nimikirjoitukset.', produceWhat: 'oman päätelmän ja luotettavuusarvion integraation', author: (r, v) => conclude(r, 'both', v), tags: ['integrate-supported-claim-with-method-evaluation', 'integrate-inconclusive-claim-with-precision-evaluation'], limit: `Erillinen integraationäyttö. ${observedLimit}` },
];
type InvestigationDemo = Omit<DemoStep, 'sceneModel'> & { sceneModel?: ChemicalInvestigationScene };
type InvestigationSpec = Omit<NodeSpec, 'item' | 'demo'> & { item(r: Rng, phase: Phase): InvestigationItem; demo(r: Rng): InvestigationDemo[] };
export const chemicalInvestigationSpecs: InvestigationSpec[] = definitions.map(def => {
  const { author, tags, limit: _limit, ...meta } = def;
  const rev = `exp690-chemical-investigation-${def.id.toLowerCase()}-v1`;
  return { ...meta, rev, validRevs: [rev], produce: [...tags], demo(r) {
    const example = author(r, 'build');
    return [{ say: example.explain!, scene: chemicalInvestigationExample(example.task), sceneModel: chemicalInvestigationScene(example.task, solutionChemicalInvestigation(example.task)) }];
  }, item(r, phase) {
    const variant = phase === 'transfer' ? 'transfer' : r.pick(['build', 'contrast'] as const);
    return { ...author(r, variant), tag: variant === 'transfer' ? 'transfer' : tags[variant === 'build' ? 0 : 1] };
  } };
});
export const chemicalInvestigationEvidence: Readonly<Record<string, { families: readonly string[]; limit: string }>> =
  Object.fromEntries(definitions.map(def => [def.id, { families: def.tags, limit: def.limit }]));
