import type { PageText } from '../text';

/** UM-17 Kuppelikaupungin rakennuslaatikko: cylinders, cones and spheres, their surface areas, volumes and volume units. */
export const TEXT: Record<string, PageText> = {
  'M79-CYLINDER-ID': {
    beats: [
      { text: 'Kuvassa on lieriö, kartio ja katkaistu kartio. Lieriö on joka kohdasta yhtä paksu, ja sen kaksi pohjaa ovat samanlaiset ympyrät.', pic: 0, figure: false },
      { text: 'Lieriöllä on kaksi yhtenevää ja yhdensuuntaista pohjaa. Asento ei muuta asiaa: kyljellään makaava lieriö on yhä lieriö.', more: 'Pohjan ei tarvitse olla ympyrä. Särmiö, esimerkiksi kolmiopohjainen, on myös lieriö.', pic: 0, figure: false },
      { text: 'Katkaistun kartion pohjat ovat yhdensuuntaiset mutta eri kokoiset. Siksi se ei ole lieriö.', pic: 0, figure: false },
    ],
    try: {
      say: 'Kappaleen ylä- ja alapohja ovat yhdensuuntaiset ympyrät, mutta yläpohja on pienempi. Onko kappale lieriö?',
      options: ['Ei, koska pohjat eivät ole yhtenevät', 'Kyllä, koska pohjat ovat yhdensuuntaiset', 'Kyllä, koska pohjat ovat ympyröitä'],
      answer: 0,
      explain: 'Lieriön pohjat ovat yhdensuuntaiset ja yhtenevät eli samanmuotoiset ja samankokoiset. Tämä kappale on katkaistu kartio.',
      why: [null, 'Yhdensuuntaisuus ei riitä. Lieriön pohjat ovat myös samankokoiset.', 'Pohjien muoto ei riitä. Lieriön pohjien pitää olla samankokoiset.'],
    },
  },
  'M79-CONE-ID': {
    beats: [
      { text: 'Kuvassa on kartio, katkaistu kartio ja litteä ympyrä. Vain kartio kapenee pohjastaan yhteen pisteeseen asti.', pic: 0, figure: false },
      { text: 'Kartiolla on yksi pohja, ja sen vaippa kokoontuu yhteen huippuun. Katkaistulta kartiolta huippu puuttuu, ja ympyrä on tasokuvio eikä kappale.', more: 'Kartion pohja voi olla myös monikulmio. Esimerkiksi pyramidi, jonka pohja on neliö, on kartio.', pic: 0, figure: false },
    ],
    try: {
      say: 'Kappaleen pohja on neliö, ja sen sivutahkot kokoontuvat yhteen huippuun. Onko kappale kartio?',
      options: ['Kyllä, pyramidi on kartio', 'Ei, koska kartion pohja on aina ympyrä', 'Ei, koska kappaleella on särmiä'],
      answer: 0,
      explain: 'Kartiolla on yksi pohja ja yksi huippu, johon vaippa kokoontuu. Pohja voi olla monikulmio, joten neliöpohjainen pyramidi on kartio.',
      why: [null, 'Kartion pohja voi olla mikä tahansa tasokuvio. Ratkaisevaa on yhteinen huippu.', 'Särmät eivät estä. Kartiolla on yksi pohja ja yksi huippu.'],
    },
  },
  'M79-SPHERE-ID': {
    beats: [
      { text: 'Kuvassa on pallo, litteä ympyrä ja pitkänomainen kappale. Yhdestä suunnasta katsottuna ne voivat kaikki näyttää ympyröiltä.', pic: 0, figure: false },
      { text: 'Pallon pinnan jokainen piste on yhtä kaukana keskipisteestä. Kun keskeltä mitataan pintaan kolmeen eri suuntaan, saadaan joka kerta sama säde.', pic: 0, figure: false },
      { text: 'Pitkänomaisen kappaleen mitat ovat eri suuntiin eri suuret, ja ympyrällä ei ole paksuutta lainkaan. Siksi kumpikaan ei ole pallo.', pic: 0, figure: false },
    ],
    try: {
      say: 'Kappaleen keskeltä pintaan on leveyssuunnassa 4 cm, korkeussuunnassa 4 cm ja syvyyssuunnassa 6 cm. Onko kappale pallo?',
      options: ['Ei, koska mitat eivät ole samat', 'Kyllä, koska kaksi mittaa on samat', 'Kyllä, jos se näyttää edestä ympyrältä'],
      answer: 0,
      explain: 'Pallon pinta on joka suuntaan yhtä kaukana keskipisteestä. Syvyyssuunnassa matka on 6 cm, joten kappale on pitkänomainen.',
      why: [null, 'Kaikkiin suuntiin matkan pitää olla sama. Syvyyssuunta on pidempi.', 'Yksi suunta ei riitä. Pitkänomainenkin kappale voi näyttää edestä ympyrältä.'],
    },
  },
  'M79-SOLID-01': {
    beats: [
      { text: 'Kokoelmassa on lieriö, kartio, pallo ja litteä ympyrä. Kappaleet tunnistetaan rakenteesta, ei asennosta.', pic: 0, figure: false },
      { text: 'Lieriöllä on kaksi yhtenevää ja yhdensuuntaista pohjaa, kartiolla yksi pohja ja huippu. Pallon pinta on joka kohdasta yhtä kaukana keskipisteestä.', pic: 0, figure: false },
      { text: 'Ympyrä on tasokuvio: sillä on pituus ja leveys mutta ei paksuutta. Siksi se ei ole kappale.', pic: 0, figure: false },
    ],
    try: {
      say: 'Kappaleella on kaksi yhtenevää ja yhdensuuntaista kolmiopohjaa. Mikä kappale se on?',
      options: ['Lieriö', 'Kartio', 'Ei mikään, koska pohjat eivät ole ympyröitä'],
      answer: 0,
      explain: 'Kaksi yhtenevää ja yhdensuuntaista pohjaa tekee kappaleesta lieriön. Kolmiopohjainen lieriö on särmiö.',
      why: [null, 'Kartiolla on vain yksi pohja ja yksi huippu.', 'Lieriön pohja voi olla myös monikulmio, esimerkiksi kolmio.'],
    },
  },
  'M79-CYL-V': {
    beats: [
      { example: 'Lieriön muotoisen säiliön pohjan säde on 5 cm ja korkeus 12 cm. Mikä on sen tilavuus?', text: 'Pohjan ala on π · 5² cm² = 25π cm². Tilavuus on pohjan ala kertaa korkeus: 25π cm² · 12 cm = 300π cm³ ≈ 942,48 cm³.', pic: 0, figure: false },
      { text: 'Säiliö täyttyy yhtä paksuina kerroksina, ja jokaisen kerroksen ala on pohjan ala. Siksi lieriön tilavuus on V = pohjan ala · korkeus.', more: 'Korkeus mitataan kohtisuoraan pohjaa vastaan. Jos tilavuus ja pohjan ala tunnetaan, korkeus saadaan jakamalla tilavuus pohjan alalla.', pic: 0, figure: false },
    ],
    try: {
      say: 'Lieriön pohjan ala on 20 cm² ja korkeus 6 cm. Mikä on lieriön tilavuus?',
      options: ['120 cm³', '26 cm³', '120 cm²'],
      answer: 0,
      explain: 'Tilavuus on pohjan ala kertaa korkeus: 20 cm² · 6 cm = 120 cm³.',
      why: [null, 'Pohjan ala ja korkeus kerrotaan, ei lasketa yhteen.', 'Tilavuuden yksikkö on kuutiosenttimetri, cm³.'],
    },
  },
  'M79-SPHERE-SA': {
    beats: [
      { example: 'Pallon säde on 7 cm. Kuinka paljon peitettä tarvitaan sen pintaan?', text: 'Pallon pinta-ala on A = 4πr² = 4 · π · 7² cm² = 196π cm². Likiarvona se on noin 615,75 cm².', pic: 0, figure: false },
      { text: 'Pallon pinta-ala on neljä kertaa sen ympyrän ala, joka kulkee pallon keskipisteen kautta. Säde on kaavassa neliönä, joten tulos on neliöyksiköissä.', more: 'Pallon pintaa ei voi levittää tasoon venyttämättä tai rypyttämättä, toisin kuin lieriön tai kartion vaipan. Siksi pinta-ala lasketaan kaavalla.', pic: 0, figure: false },
    ],
    try: {
      say: 'Pallon säde on 3 cm. Mikä on pallon pinta-ala?',
      options: ['36π cm²', '9π cm²', '12π cm²', '36π cm³'],
      answer: 0,
      explain: 'A = 4πr² = 4 · π · 3² cm² = 4 · 9π cm² = 36π cm².',
      why: [null, 'πr² on vain yhden ympyrän ala. Pallon pinta on neljä kertaa se.', 'Säde korotetaan toiseen: 3² = 9, ei 3.', 'Pinta-ala on neliöyksiköissä, cm².'],
    },
  },
  'M79-SPHERE-V': {
    beats: [
      { example: 'Läpinäkyvän pallon säde on 7 cm. Mikä on sen tilavuus?', text: 'Pallon tilavuus on V = 4πr³/3. Kun r = 7 cm, r³ = 343 cm³ ja V = 4 · 343π/3 cm³ = 1372π/3 cm³ ≈ 1436,76 cm³.', more: 'Jos tunnetaan halkaisija, laske ensin säde: halkaisija on kaksi sädettä.', pic: 0, figure: false },
      { text: 'Säde on kaavassa kuutiona, joten tulos on kuutioyksiköissä. Jos säde kaksinkertaistuu, tilavuus kasvaa 2³ = 8-kertaiseksi.', pic: 0, figure: false },
    ],
    try: {
      say: 'Pallon halkaisija on 6 cm. Mikä on pallon tilavuus?',
      options: ['36π cm³', '288π cm³', '12π cm³'],
      answer: 0,
      explain: 'Säde on 6 cm : 2 = 3 cm ja r³ = 27 cm³. V = 4 · 27π/3 cm³ = 36π cm³.',
      why: [null, 'Käytit halkaisijaa säteenä. Säde on 6 cm : 2 = 3 cm.', 'Säde korotetaan kolmanteen: 3³ = 27, ei 3² = 9.'],
    },
  },
  'M79-CYL-SA': {
    beats: [
      { example: 'Avonaisen säiliön pohjan säde on 6 cm ja korkeus 8 cm. Kuinka paljon materiaalia kuoreen tarvitaan?', text: 'Vaippa avautuu suorakulmioksi, jonka pituus on pohjan ympärysmitta 2π · 6 cm = 12π cm ja leveys 8 cm. Vaipan ala on 12π cm · 8 cm = 96π cm².', pic: 0, figure: false },
      { text: 'Säiliö on ylhäältä auki, joten mukaan tulee vain yksi pohja: π · 6² cm² = 36π cm². Kuoren ala on 96π cm² + 36π cm² = 132π cm² ≈ 414,69 cm².', pic: 0, figure: false },
      { text: 'Lieriön pinta-ala on vaipan ja pohjien alat yhteensä. Suljetussa lieriössä pohjia on kaksi, avonaisessa yksi.', pic: 0, figure: false },
    ],
    try: {
      say: 'Suljetun lieriön vaipan ala on 50 cm² ja yhden pohjan ala 12 cm². Mikä on lieriön pinta-ala?',
      options: ['74 cm²', '62 cm²', '600 cm²'],
      answer: 0,
      explain: 'Suljetulla lieriöllä on vaippa ja kaksi pohjaa: 50 cm² + 12 cm² + 12 cm² = 74 cm².',
      why: [null, 'Suljetulla lieriöllä on kaksi pohjaa, ei yksi.', 'Pinnan osien alat lasketaan yhteen, ei kerrota.'],
    },
  },
  'M79-CONE-SA': {
    beats: [
      { example: 'Teltan kangas on kartion vaippa. Pohjan säde on 8 cm, korkeus 15 cm ja sivujana 17 cm. Kuinka paljon kangasta tarvitaan?', text: 'Kartion vaipan ala on πrs, jossa s on sivujana. Kangasta tarvitaan π · 8 cm · 17 cm = 136π cm² ≈ 427,26 cm².', more: 'Teltan pohja on auki, joten pohjan alaa ei lasketa mukaan.', pic: 0, figure: false },
      { text: 'Sivujana kulkee pohjan reunalta huippuun, korkeus pohjan keskeltä suoraan huippuun. Vaipan alaan käytetään sivujanaa, ei korkeutta.', more: 'Sivujanan voi laskea Pythagoraan lauseella: s² = 8² + 15² = 64 + 225 = 289, joten s = 17 cm.', pic: 0, figure: false },
    ],
    try: {
      say: 'Kartion pohjan säde on 3 cm, korkeus 4 cm ja sivujana 5 cm. Mikä on kartion vaipan ala?',
      options: ['15π cm²', '12π cm²', '24π cm²'],
      answer: 0,
      explain: 'Vaipan ala on πrs = π · 3 cm · 5 cm = 15π cm². Siinä käytetään sivujanaa, ei korkeutta.',
      why: [null, 'Vaipan alaan käytetään sivujanaa 5 cm, ei korkeutta 4 cm.', 'Laskit mukaan myös pohjan 9π cm². Vaippa yksin on 15π cm².'],
    },
  },
  'M79-CONE-V': {
    beats: [
      { text: 'Kartiolla ja lieriöllä on sama pohja ja sama korkeus. Kartiollinen vettä täyttää lieriöstä vain kolmasosan, joten lieriö täyttyy kolmella kaadolla.', pic: 0, figure: false },
      { text: 'Kartion tilavuus on siis kolmasosa vastaavan lieriön tilavuudesta: V = pohjan ala · korkeus : 3.', pic: 0, figure: false },
      { example: 'Kartion pohjan säde on 6 cm ja korkeus 12 cm. Mikä on sen tilavuus?', text: 'Pohjan ala on π · 6² cm² = 36π cm². Tilavuus on 36π cm² · 12 cm : 3 = 144π cm³ ≈ 452,39 cm³.', pic: 0, figure: false },
    ],
    try: {
      say: 'Lieriön tilavuus on 900 cm³. Kartiolla on sama pohja ja sama korkeus. Mikä on kartion tilavuus?',
      options: ['300 cm³', '450 cm³', '2700 cm³'],
      answer: 0,
      explain: 'Kartio täyttää samanpohjaisesta ja yhtä korkeasta lieriöstä kolmasosan: 900 cm³ : 3 = 300 cm³.',
      why: [null, 'Kartio täyttää lieriöstä kolmasosan, ei puolta.', 'Kartio on pienempi kuin lieriö. Tilavuus jaetaan kolmella, ei kerrota.'],
    },
  },
  'M79-UNIT-VOL': {
    beats: [
      { text: 'Kuution särmä on 1 dm eli 10 cm. Yhteen kerrokseen mahtuu 10 · 10 = 100 pientä 1 cm³:n kuutiota, ja kerroksia on 10.', pic: 0, figure: false },
      { text: 'Siksi 1 dm³ = 10 · 10 · 10 cm³ = 1000 cm³. Kerroin 10 otetaan kolmesti, kerran jokaiselle suunnalle.', more: 'Sama pätee muihinkin tilavuusyksiköihin: 1 m³ = 1000 dm³. Lisäksi 1 dm³ on sama kuin 1 litra.', pic: 0, figure: false },
      { example: 'Paljonko 4,5 dm³ on kuutiosenttimetreinä?', text: 'Jokaisessa kuutiodesimetrissä on 1000 cm³. Siis 4,5 dm³ = 4,5 · 1000 cm³ = 4500 cm³.', pic: 0, figure: false },
    ],
    try: {
      say: 'Paljonko 2 dm³ on kuutiosenttimetreinä?',
      options: ['2000 cm³', '20 cm³', '200 cm³'],
      answer: 0,
      explain: 'Tilavuudessa kerroin 10 otetaan kolmesti: 1 dm³ = 1000 cm³. Siis 2 dm³ = 2000 cm³.',
      why: [null, 'Kerroin 10 koskee vain yhtä suuntaa. Tilavuudessa suuntia on kolme.', '100 on pinta-alan kerroin. Tilavuuden kerroin on 1000.'],
    },
  },
};
