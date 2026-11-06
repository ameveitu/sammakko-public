import type { Rng } from '../engine/rng';
import type { Item, NodeSpec, Phase } from '../engine/types';
import { lifecycleOptionTotals, solutionLifecycleHarbor, type ComparisonData, type EnergyData, type LifecycleHarborTask, type LifecycleReview, type MaterialData, type ResourceData, type StageData } from './models/lifecycle-harbor';
import { lifecycleHarborBoard, lifecycleHarborExample } from './scenes/lifecycle-harbor';

export type LifecycleVariant = 'build' | 'repair' | 'transfer';
type LifecycleItem = Omit<Item, 'task'> & { task: LifecycleHarborTask };
const context = (title: string, ...skills: string[]) => ({ title, skills });
const products = ['lainalyhty', 'retkijakkara', 'veneen säilytyslaatikko', 'korjauspöydän teline', 'laiturin opastin', 'retkikorin kehikko', 'kasvilavan kiinnike', 'saariston varaosakotelo'] as const;
function resourceData(r: Rng, variant: LifecycleVariant): ResourceData {
  const recipes = [
    ['Metsästä hankittu puu', 'Keitetty sellumassa', 'Muotoiltu kuitulevy', 'Puun kuituja erotetaan kemiallisessa keitossa.', 'Massan kuidut puristetaan levyksi.', 'Kuitujen kemiallinen erotus', 'Puristus ja kuivaus'],
    ['Bauksiittimalmi', 'Erotettu alumiinioksidi', 'Alumiinilevy', 'Malmin alumiiniyhdisteistä erotetaan alumiinioksidia.', 'Oksidista valmistetaan elektrolyysissä alumiinia, joka valssataan levyksi.', 'Alumiinioksidin kemiallinen erotus', 'Elektrolyysi, valu ja valssaus'],
    ['Rautamalmi', 'Puhdistettu rauta', 'Teräslevy', 'Rautaoksidin happi poistetaan pelkistyksessä. Saadaan jatkojalostettava rauta.', 'Raudan hiilipitoisuutta säädetään ja valmistetaan teräslevyä.', 'Raudan pelkistys malmista', 'Teräksen valmistus ja valssaus'],
    ['Kvartsihiekka', 'Sulatettu lasimassa', 'Lasilevy', 'Piidioksidia sisältävä hiekka sulatetaan annettujen sooda- ja kalkkipanosten kanssa.', 'Lasimassa muotoillaan ja jäähdytetään lasilevyksi.', 'Lasiraaka-aineiden sulatus', 'Muotoilu ja jäähdytys'],
    ['Raakaöljy', 'Erotettu ja krakattu eteeni', 'Polyeteenilevy', 'Öljyn jakeesta valmistetaan krakkauksessa eteeniä.', 'Eteenimolekyylejä liitetään polymeroinnissa polyeteeniksi ja muotoillaan levyksi.', 'Erotus ja krakkaus', 'Polymerointi ja levyn muotoilu'],
    ['Kalkkikiviesiintymä', 'Poltettu kalkki', 'Kalkkilaasti', 'Kalsiumkarbonaattia kuumentamalla saadaan kalkkioksidia ja hiilidioksidia.', 'Kalkkia sammutetaan vedellä ja sekoitetaan annettuun hiekkaan laastiksi.', 'Kalkin poltto', 'Sammutus ja laastin sekoitus'],
    ['Suolainen maanalainen liuos', 'Elektrolyysissä saatu natriumhydroksidiliuos', 'Natriumsaippuamassa', 'Suolaliuoksen elektrolyysissä valmistetaan natriumhydroksidia annetuissa tehdasoloissa.', 'Natriumhydroksidilla saippuoidaan annettu rasva. Seurataan tämän ketjun natriumpanosta.', 'Suolaliuoksen elektrolyysi', 'Saippuointi annetulla rasvapanoksella'],
    ['Kvartsiesiintymä', 'Puhdistettu alkuainepii', 'Piikiekko', 'Piidioksidista poistetaan happi pelkistyksessä ja saatu pii puhdistetaan.', 'Puhdistetusta piistä kasvatetaan kide ja leikataan kiekko.', 'Pelkistys ja piin puhdistus', 'Kiteen kasvatus ja leikkaus'],
  ] as const;
  const index = r.int(0, recipes.length - 1), recipe = recipes[index]!, product = index === 5 ? 'Laastilla korjattu seinäosa' : index === 6 ? 'Telakan saippuapala' : index === 7 ? 'Lyhdyn sähköisen osan piikiekko' : index === 3 ? 'Lyhdyn lasikupu' : index === 4 ? 'Vedenkestävä säilytyslaatikko' : index === 2 ? 'Veneen teräskiinnike' : index === 1 ? 'Lyhdyn alumiinirunko' : r.pick(products);
  const opaque = r.shuffle(['A', 'B', 'C', 'D', 'E', 'F']), [source, middle, material, object, otherMiddle, otherMaterial] = opaque as [string, string, string, string, string, string];
  const cards: { id: string; label: string; role: 'resource' | 'intermediate' | 'material' | 'object'; description: string }[] = [
    { id: source, label: recipe[0], role: 'resource' as const, description: 'Hankitaan luonnosta ennen tässä esitettyä jalostusta. Saatavuus on rajallinen.' },
    { id: middle, label: recipe[1], role: 'intermediate' as const, description: recipe[3] },
    { id: material, label: recipe[2], role: 'material' as const, description: recipe[4] },
    { id: object, label: product, role: 'object' as const, description: 'Nimetystä materiaalista tehdään tämä käyttötehtävän täyttävä esine tai rakennusosa.' },
  ];
  const connections = [{ from: source, to: middle, process: recipe[5] }, { from: middle, to: material, process: recipe[6] }, { from: material, to: object, process: 'Käyttöesineen tai osan valmistus' }];
  if (index === 0) {
    cards.push({ id: otherMiddle, label: 'Sahattu ja kuivattu puu', role: 'intermediate', description: 'Toinen sallittu reitti sahaa ja kuivaa rungon ennen liimausta.' }, { id: otherMaterial, label: 'Liimattu puulevy', role: 'material', description: 'Sahatusta puusta liimattu levy sopii samaan esineeseen annettujen lujuustietojen mukaan.' });
    connections.push({ from: source, to: otherMiddle, process: 'Sahaus ja kuivaus' }, { from: otherMiddle, to: otherMaterial, process: 'Liimaus ja puristus' }, { from: otherMaterial, to: object, process: 'Käyttöesineen valmistus' });
  }
  return { cards: r.shuffle(cards), connections, start: source, finish: object, direction: variant === 'repair' ? 'object-to-source' : 'source-to-object', limit: 'Ketju koskee nimettyä runko- tai ainepanosta. Muut reaktioaineet, lisäaineet ja energiat on annettu kuvauksissa. Tämä alkuperäpassi ei ole koko tuotteen massa- tai vaikutustase.' };
}
function stageData(r: Rng, variant: LifecycleVariant): StageData {
  const product = variant === 'transfer' ? r.pick(['huollettava retkitakki', 'vaihdettavan istuimen retkijakkara']) : r.pick(products);
  const maintenance = r.pick(['saranan vaihto', 'rikkoutuneen kiinnikkeen vaihto', 'repeämän paikkaus', 'kuluneen kahvan vaihto', 'liitoksen uudelleenkiinnitys', 'suojalasin vaihto', 'vaijerin vaihto', 'tiivisteen vaihto']);
  const repairMaterialG = r.int(2, 20) * (variant === 'transfer' ? 5 : 2);
  const events: StageData['events'] = [
    { id: 'raw', label: 'Alkuperäpassi', stage: 'extraction', description: 'Luonnonvaraa hankitaan ennen materiaalin jalostamista.' },
    { id: 'make', label: 'Telakan valmistamo', stage: 'manufacture', description: 'Materiaalista valmistetaan uusi käyttöesine.' },
    { id: 'ship', label: 'Rahtiveneen matka', stage: 'transport', description: `Valmis ${product} siirtyy valmistamolta käyttäjälle.` },
    { id: 'use', label: 'Retken palvelu', stage: 'use', description: 'Esine tekee suunniteltua tehtäväänsä käyttäjän luona.' },
    { id: 'repair', label: 'Varaosan vaihto', stage: 'maintenance', description: `${maintenance}. Rikkoutunut osa korvataan. Korjaus käyttää ${repairMaterialG} g uutta varaosamateriaalia ja palauttaa saman esineen tehtäväänsä.` },
    { id: 'reuse', label: 'Seuraavan retkeilijän vuoro', stage: 'reuse', description: 'Sama käyttökelpoinen esine siirtyy uudelle käyttäjälle ilman materiaaliksi hajottamista.' },
    { id: 'recycle', label: 'Materiaalin uusi alku', stage: 'recycling', description: 'Käytön jälkeen erotettu materiaali jalostetaan uuden tuotteen raaka-aineeksi. Saanto on rajallinen.' },
    { id: 'end', label: 'Jäännöksen käsittely', stage: 'disposal', description: 'Hyödyntämiseen kelpaamaton jäännös käsitellään annetun paikallisen suunnitelman mukaan.' },
  ];
  const transitions = [
    { id: 't1', from: 'raw', to: 'make', description: 'Hankittu raaka-aine kulkee uuden esineen valmistamiseen.' },
    { id: 't2', from: 'make', to: 'ship', description: 'Valmis esine lähtee rahtiveneeseen.' },
    { id: 't3', from: 'ship', to: 'use', description: 'Perille tullut esine alkaa palvella retkeä.' },
    { id: 't4', from: 'use', to: 'repair', description: 'Käytössä havaittu rikkoutuminen vie esineen varaosan vaihtoon.' },
    { id: 't5', from: 'repair', to: 'use', description: 'Korjattu sama esine palaa retken palveluun.' },
    { id: 't6', from: 'use', to: 'reuse', description: 'Käyttökelpoinen kokonainen esine annetaan toiselle retkeilijälle.' },
    { id: 't7', from: 'use', to: 'recycle', description: 'Käyttöön kelpaamattoman esineen hyödynnettävä materiaali erotetaan.' },
    { id: 't8', from: 'recycle', to: 'make', description: 'Jalostettu palautuva materiaali pääsee uuden esineen valmistukseen.' },
    { id: 't9', from: 'recycle', to: 'end', description: 'Jalostuksen hylätty jäännös kulkee loppukäsittelyyn.' },
  ];
  const selected = variant === 'build' ? transitions.slice(0, 5) : variant === 'repair' ? transitions.filter(t => !['t4', 't5'].includes(t.id)) : transitions;
  const names = r.shuffle(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
  const eventId = new Map(events.map((event, i) => [event.id, names[i]!]));
  return { product, repairMaterialG, focus: variant === 'build' ? 'repair-return' : variant === 'repair' ? 'end-options' : 'combined', events: r.shuffle(events.map(e => ({ ...e, id: eventId.get(e.id)! }))), transitions: selected.map(t => ({ ...t, from: eventId.get(t.from)!, to: eventId.get(t.to)! })) };
}
function materialData(r: Rng, variant: LifecycleVariant): MaterialData {
  const unit = r.int(2, 15), denominator = r.pick([2, 4, 5]), sortableG = denominator * unit * 4;
  const openingReturnedG = variant === 'transfer' ? r.int(2, 10) * 10 : r.int(0, 6) * 10;
  const recoveryNumerator = denominator - 1, qualityBound = variant === 'transfer' || variant === 'repair';
  return { substance: variant === 'transfer' ? 'Seostettu alumiini, jonka laatu rajaa palautusta' : variant === 'repair' ? 'Pinnoitteesta erotettu alumiini' : 'Puhdas alumiininen leikkuujäännös',
    batch: `${r.int(4, 14)} samanlaista telakan varaosaa`, freshG: sortableG + r.int(30, 80) * 10, openingReturnedG, sideG: r.int(1, 7) * 10, dustG: r.int(1, 8), sortableG,
    recoveryNumerator, recoveryDenominator: denominator, qualityLimitG: qualityBound ? unit * (denominator - 1) * 2 : sortableG,
    intervention: qualityBound ? 'quality-separation' : 'collect-offcuts' };
}
function energyData(r: Rng, variant: LifecycleVariant): EnergyData {
  const scale = r.int(2, 14), usefulKj = scale * 20, heat = scale * 40, electricKj = scale * 15;
  return { batch: `${r.int(4, 14)} samanlaista korjattua kiinnikettä`, source: 'Sähkö ja polttoaineen kemiallinen energia', electricKj, fuelKj: usefulKj + heat - electricKj, usefulKj,
    stage: variant === 'transfer' ? 'Materiaalin kuivaus' : variant === 'repair' ? 'Osien pesuvesi' : 'Muotoiluuuni', plan: variant === 'build' ? 'insulate' : 'recover', savedKj: scale * 10,
    recoveryNumerator: 1, recoveryDenominator: r.pick([2, 4, 5]), compatibleDemandKj: scale * 10 };
}
function comparisonData(r: Rng, variant: LifecycleVariant): ComparisonData {
  const uses = r.int(7, 18), lifeA = r.int(2, 5), lifeB = r.int(4, 8), scale = r.int(1, 5);
  const data: ComparisonData = { service: variant === 'transfer' ? 'Yhden retkiryhmän varusteen kuljetus' : r.pick(['Yhden retki-illan samanlainen valaistus', 'Yhden retkiryhmän samanlainen istuinpalvelu']), uses,
    period: `${uses} erillistä retkipäivää`, boundary: 'Mukana valmistus, kuljetus, tarvittavat korjaukset ja käyttöenergia. Palautus arvioidaan erikseen kaikkien hankittujen esineiden myöhemmän elinkaaren lopussa; se ei ole jakson aikana jo saatua materiaalia. Muut ympäristövaikutukset eivät ole mukana.',
    priority: variant === 'build' ? r.pick(['material', 'energy'] as const) : 'tradeoff', uncertainty: variant === 'transfer' ? 'Merialuksen tuleva kuljetusmatka voi muuttua.' : 'Todellinen käyttöikä voi poiketa annetusta mallikestosta.',
    options: r.shuffle([
      { id: 'a', label: 'Kevyt vaihdettava malli', baseLifeUses: lifeA, lifeUses: lifeA, newMaterialG: scale * 35, repairMaterialG: 0, makeEnergyKj: scale * 50, transportKj: variant === 'transfer' ? scale * 80 : scale * 10, repairEnergyKj: 0, useEnergyKj: r.int(1, 6), endReturnG: scale * 10 },
      { id: 'b', label: 'Huollettava malli', baseLifeUses: Math.max(1, lifeB - 2), lifeUses: lifeB, newMaterialG: scale * 65, repairMaterialG: scale * r.int(2, 7), makeEnergyKj: scale * 120, transportKj: scale * 10, repairEnergyKj: scale * 15, useEnergyKj: r.int(1, 6), endReturnG: scale * 20 },
    ]) };
  if (variant === 'transfer') {
    const a = data.options.find(o => o.id === 'a')!, b = data.options.find(o => o.id === 'b')!;
    b.newMaterialG = scale * 15; b.repairMaterialG = scale; b.endReturnG = scale * 5;
    b.makeEnergyKj = lifecycleOptionTotals(a, uses).energyKj! + scale * 50;
  }
  return data;
}
function sustainabilityTask(r: Rng, variant: LifecycleVariant): LifecycleHarborTask {
  const comparison = comparisonData(r, variant), reference = comparison.options.find(o => o.id === 'a')!, total = lifecycleOptionTotals(reference, comparison.uses);
  const material = materialData(r, variant), energy = energyData(r, variant);
  material.batch = `${total.units} vertailun A-esineen runkoa`;
  material.freshG = total.units! * reference.newMaterialG;
  material.openingReturnedG = Math.min(material.openingReturnedG, Math.floor(material.freshG / 4));
  material.sideG = Math.min(material.sideG, Math.floor(material.freshG / 10));
  material.dustG = Math.min(material.dustG, Math.max(1, Math.floor(material.freshG / 100)));
  const sortableUnit = material.recoveryDenominator * 4;
  material.sortableG = Math.max(sortableUnit, Math.min(material.sortableG, Math.floor(material.freshG / (3 * sortableUnit)) * sortableUnit));
  const manufacture = total.units! * reference.makeEnergyKj;
  energy.batch = material.batch; energy.electricKj = manufacture / 5; energy.fuelKj = manufacture * 4 / 5; energy.usefulKj = manufacture / 2; energy.savedKj = manufacture / 10; energy.recoveryDenominator = 5; energy.compatibleDemandKj = manufacture / 10;
  return { ...base('Saariston korjausjuhla'), mode: 'integration', scope: 'sustainability', material, energy, comparison, review: review('sustain') };
}
function lifecycleTask(r: Rng, variant: LifecycleVariant): LifecycleHarborTask {
  const stages = stageData(r, variant), material = materialData(r, variant);
  material.batch = `${stages.product}, yksi korjauksessa tarvittava ${stages.repairMaterialG} g varaosa`;
  material.openingReturnedG = Math.min(material.openingReturnedG, Math.floor(stages.repairMaterialG / 2));
  material.freshG = stages.repairMaterialG + material.sideG + material.dustG + material.sortableG - material.openingReturnedG;
  return { ...base('Korjattavan lyhdyn paluureitti'), mode: 'integration', scope: 'lifecycle', stages, material, review: review('repair') };
}
function review(scope: 'repair' | 'compare' | 'matter' | 'energy' | 'sustain'): LifecycleReview {
  const prompts = {
    repair: 'Selitä oman karttasi avulla, mihin korjaus palauttaa esineen ja miten varaosan tarve vaikuttaa tämän rajauksen materiaalivirtaan.',
    compare: 'Kerro oma suosituksesi. Käytä yhteisen palvelutarpeen lukuja, nimeä aineen ja energian mahdollinen vaihtokauppa sekä vertailun raja.',
    matter: 'Ehdota oman ainekirjasi perusteella hävikkiä vähentävää muutosta. Nimeä palautuksen laaturaja ja mitä edelleen tarvitaan.',
    energy: 'Selitä oman energiatilisi parannus samalla tuotantomäärällä. Nimeä ympäristöön siirtyvä energia ja talteenoton raja.',
    sustain: 'Esittele oma ratkaisu. Yhdistä sama palvelutarve, aine- ja energiakirja, vaihtoehtojen vaihtokauppa ja yksi epävarmuus.',
  };
  const rubric = scope === 'repair' ? [
    { id: 'return', label: 'Esineen paluu käyttöön', guide: 'Osoittaa omalta kartalta käytön, korjauksen ja saman esineen paluun.' },
    { id: 'boundary', label: 'Varaosa ja rajaus', guide: 'Sitoo varaosan määrän ja korvautuvan uuden esineen tarpeen annettuun rajaukseen. Ei väitä korjausta vaikutuksettomaksi.' },
  ] : scope === 'matter' ? [
    { id: 'change', label: 'Oma materiaalimuutos', guide: 'Ehdottaa tämän materiaalivirran talteenottoa tai hävikin ehkäisyä ja käyttää oman tilin määriä.' },
    { id: 'limit', label: 'Saannon ja laadun raja', guide: 'Nimeää jäännöksen, laaturajan ja edelleen tarvittavan uuden panoksen.' },
  ] : scope === 'energy' ? [
    { id: 'change', label: 'Sama tuotanto, oma parannus', guide: 'Vertaa oman tilin energiapainoksia samaan tuotantomäärään sidottuna.' },
    { id: 'limit', label: 'Energia siirtyy', guide: 'Nimeää lämpönä siirtyvän energian ja annetun eristyksen tai yhteensopivan talteenoton rajan.' },
  ] : [
    { id: 'service', label: 'Sama palvelutarve', guide: 'Perustelee tarvittavat kokonaiset esineet ja mahdolliset huollot samalle palvelumäärälle.' },
    { id: 'tradeoff', label: 'Oma perusteltu valinta', guide: 'Sitoo valintansa omiin aine- ja energialukuihin. Tunnistaa mahdollisen kompromissin tai osoittaa, jos samoilla tiedoilla toinen on molemmissa pienempi.' },
    { id: 'limit', label: 'Rajaus ja epävarmuus', guide: 'Nimeää mukana olevat vaikutukset ja yhden annetun tiedon epävarmuuden. Ei yleistä yhtä lukua kaikkeen kestävyyteen.' },
  ];
  return { prompt: prompts[scope], rubric, model: 'Sulka rajaa tarkastelun annettuun palveluun ja aikaan. Korjaus käyttää varaosia, mutta voi välttää uuden esineen. Palautuvan aineen määrä ja laatu ovat rajallisia. Energia siirtyy myös ympäristöön. Valinta tarvitsee kummankin tilin, tavoitteen ja tiedon epävarmuuden.' };
}
interface Definition { id: string; title: string; intro: string; goal: string; reward: string; families: readonly [string, string]; limit: string; author(r: Rng, variant: LifecycleVariant): LifecycleHarborTask }
const base = (title: string) => ({ kind: 'lifecycle-harbor' as const, title, context: context('Annettu telakkatapaus, kokonaiset esineet, g ja kJ', 'M-ADD-01', 'M-SUB-01', 'M-MUL-01', 'M-DIV-01') });
const definitions: Definition[] = [
  { id: 'CHEM79-RESOURCE', title: 'Telakan aineiden alkuperä', intro: 'Aava avaa telakan esineen alkuperäpassin. Sulka tarjoaa tiedot luonnonvarasta jalostuksen kautta materiaaliin.', goal: 'Rakenna alkuperäketju ja erota luonnonvara, välituote, materiaali ja käyttöesine.', reward: 'Esineen alkuperäpassi saa jäljitettävän reitin.', families: ['build-resource-to-object', 'trace-object-to-resource'], limit: 'Annetun runkomateriaalin ketju ja luokitus. Sallii kaikki annettuihin yhteyksiin sopivat reitit. Näyttö koskee nimettyä alkuperäpassia.', author: (r, v) => ({ ...base('Telakan aineiden alkuperä'), mode: 'resource-chain', resource: resourceData(r, v) }) },
  { id: 'CHEM79-LIFECYCLE-STAGES', title: 'Lyhdyn koko matka', intro: 'Aava avaa lainatun esineen elinkaarikansion. Loikka löytää korjauksen ja käytön jälkeiset eri reitit.', goal: 'Sijoita elinkaaren tapahtumat ja rakenna myös korjauksen paluureitti.', reward: 'Korjaustelakka löytää paikkansa esineen koko matkassa.', families: ['make-use-repair-map', 'separate-reuse-recycling-branches'], limit: 'Omien tapahtumasijoitusten ja kaikkien nimettyjen yhteyksien täsmällinen kartta. Ei vapaamuotoisen selityksen arvio.', author: (r, v) => ({ ...base('Lyhdyn koko matka'), mode: 'stage-network', stages: stageData(r, v) }) },
  { id: 'CHEM79-LIFECYCLE-FLOWS', title: 'Mitä telakan portista kulkee?', intro: 'Sulka avaa valmistuksen aineistot. Loikka seuraa tuotteen lisäksi sivuvirtaa, pölyä ja palautuvaa materiaalia.', goal: 'Rakenna ainevirrat, lukitse oma tili ja kokeile sitä rajatussa valmistusmallissa.', reward: 'Materiaalikartta näyttää myös aiemmin näkymättömät sivureitit.', families: ['balance-production-side-flows', 'bound-recovered-quality-stock'], limit: 'Yhden nimetyn materiaalin massatase ja suuntamalli. Saanto ja laaturaja annettu; muiden aineiden vaikutuksia ei päätellä.', author: (r, v) => ({ ...base('Mitä telakan portista kulkee?'), mode: 'material-flow', material: materialData(r, v) }) },
  { id: 'CHEM79-LIFECYCLE', title: 'Korjattavan lyhdyn paluureitti', intro: 'Aava tarkastelee lainalyhdyn koko elinkaarta. Loikka etsii varaosan paikan ja korjauksen vaikutuksen.', goal: 'Yhdistä uuden tapauksen vaiheet ja ainevirrat. Selitä oma korjauksen paluureitti.', reward: 'Korjattu lyhty palaa käyttöön telakan ikkunaan.', families: ['integrate-repair-and-material-map', 'integrate-alternate-end-route'], limit: 'Uuden tapauksen oma vaihe- ja materiaalikartta sekä aikuisen havaitsema oma korjausargumentti. Ei siirrä näyttöä atomisiin solmuihin.', author: lifecycleTask },
  { id: 'CHEM79-SUSTAIN-COMPARE', title: 'Kahden korjaussuunnitelman neuvosto', intro: 'Aava ja Loikka tuovat neuvostolle kaksi tapaa täyttää sama retkitarve. Sulka levittää yhteiset vertailutiedot.', goal: 'Laske sama palvelu molemmilla vaihtoehdoilla ja perustele oma valinta sekä sen rajat.', reward: 'Telakan neuvosto saa tilanteeseen perustellun suunnitelman.', families: ['normalize-service-to-stated-priority', 'explain-material-energy-tradeoff'], limit: 'Annettujen aine- ja energiatietojen palvelunormalisointi ja aidosti havaittu oma suositus. Ei kattava elinkaariarvio tai yleinen vihreysjärjestys.', author: (r, v) => ({ ...base('Kahden korjaussuunnitelman neuvosto'), mode: 'compare', comparison: comparisonData(r, v), review: review('compare') }) },
  { id: 'CHEM79-SUSTAIN-MATTER-FLOW', title: 'Materiaalin toinen mahdollisuus', intro: 'Aava etsii telakan materiaalikartalta käyttökelpoista paluuvirtaa. Sulka näyttää myös saannon ja laadun rajat.', goal: 'Rakenna ainekirja ja ehdota perusteltu hävikkiä vähentävä muutos.', reward: 'Talteen sopiva ainevirta saa reitin uuteen käyttöön.', families: ['recover-offcuts-with-residue', 'limit-mixed-material-recovery'], limit: 'Annetun materiaalin määrät, paluureitti ja oman ehdotuksen ihmishavainto. Kierrätystä ei oleteta häviöttömäksi tai laadultaan rajattomaksi.', author: (r, v) => ({ ...base('Materiaalin toinen mahdollisuus'), mode: 'material-flow', material: materialData(r, v), review: review('matter') }) },
  { id: 'CHEM79-SUSTAIN-ENERGY-FLOW', title: 'Telakan lämpö karkaa katosta', intro: 'Sulka näyttää valmistusvaiheen energiatiedot. Loikka seuraa hyödyllistä käyttöä ja ympäristöön siirtyvää lämpöä.', goal: 'Rakenna ennen–jälkeen-energiakirjat samalle tuotannolle ja perustele rajattu parannus.', reward: 'Telakka saa lukuun sidotun energiansäästön ja näkyvän rajauksen.', families: ['reduce-generated-loss-by-insulation', 'reuse-only-compatible-heat'], limit: 'Kahden nimetyn erän energiatase ja annettu eristys- tai lämmön talteenottomalli. Oma perustelu aikuisen havaitsema; lämpöä ei väitetä kokonaan työksi palautuvaksi.', author: (r, v) => ({ ...base('Telakan lämpö karkaa katosta'), mode: 'energy-flow', energy: energyData(r, v), review: review('energy') }) },
  { id: 'CHEM79-SUSTAIN', title: 'Saariston korjausjuhla', intro: 'Aava tuo neuvostolle kokonaisen paikallisen tapauksen. Loikka haluaa avata retkivarusteen uuteen käyttöön ymmärrettyjen rajojen kanssa.', goal: 'Rakenna oma aine- ja energiatili, vertaa sama palvelutarve ja perustele valinta sekä epävarmuus.', reward: 'Retkivaruste avautuu uuteen käyttöön saariston korjausjuhlassa.', families: ['integrate-shared-service-and-flows', 'integrate-competing-material-energy-gains'], limit: 'Uuden tapauksen erillinen palvelu-, aine- ja energiatuotanto sekä ihmisen havaitsema oma suositus. Ei peri atomien hallintaa tai yhdistä vaikutuksia yhdeksi pisteeksi.', author: sustainabilityTask },
];
export function makeLifecycleHarborTask(id: string, r: Rng, variant: LifecycleVariant): LifecycleHarborTask {
  const def = definitions.find(d => d.id === id); if (!def) throw Error('Unknown lifecycle node');
  const task = def.author(r, variant);
  if (task.mode === 'resource-chain' || task.mode === 'stage-network') task.context = context('Annetut alkuperä-, jalostus- ja elinkaaritapahtumat');
  return task;
}
function authored(def: Definition, r: Rng, phase: Phase): LifecycleItem {
  const variant = phase === 'transfer' ? 'transfer' : r.pick(['build', 'repair'] as const), task = makeLifecycleHarborTask(def.id, r, variant);
  return { task, tag: variant === 'transfer' ? 'transfer' : def.families[variant === 'build' ? 0 : 1], say: def.goal, hint: 'Pidä sama rajaus ja palvelumäärä. Seuraa jokaisen virran lähtöä, määrän yksikköä ja määränpäätä. Korjaus ja palautus käyttävät myös panoksia.', explain: 'Esine, aine ja energia kulkevat eri reittejä. Palautuva materiaali on rajallinen varasto. Samalle palvelutarpeelle voidaan tarvita monta lyhytikäistä esinettä. Perusteltu valinta nimeää tavoitteen, vaihtokaupan ja epävarmuuden.' };
}
export const lifecycleHarborSpecs: NodeSpec[] = definitions.map(def => {
  const rev = `lifecycle-harbor-${def.id.toLowerCase()}-v1`;
  return { id: def.id, stop: def.title, icon: '↺', intro: def.intro, goal: def.goal, reward: def.reward, rev, validRevs: [rev], produce: [...def.families], produceWhat: 'oman alkuperä-, vaihe-, aine- tai energiamallin rakentamista ja tarvittaessa aikuisen havaitsemaa omaa perustelua',
    demo: r => { const task = makeLifecycleHarborTask(def.id, r, 'build'); return [{ scene: lifecycleHarborBoard(task), say: def.goal }, { scene: lifecycleHarborExample(task, solutionLifecycleHarbor(task)), say: 'Sulka näyttää yhden rajatun esimerkin. Oma näyttö tehdään uudessa tilanteessa.' }]; },
    item: (r, phase) => authored(def, r, phase) as unknown as Item };
});
export const lifecycleHarborEvidence: Readonly<Record<string, { families: readonly string[]; limit: string }>> = Object.fromEntries(definitions.map(d => [d.id, { families: d.families, limit: `${d.limit} Täsmällinen 2D-malli käyttää annettuja g- ja kJ-arvoja. Virtuaalitoimi ei sertifioi fyysistä materiaalinkäsittelyä. Oma puhe ja teksti eivät tallennu; aikuisen havainto ja tuki tallentuvat.` }]));
