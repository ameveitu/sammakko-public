import type { PageText } from '../text';

/** SCI16 Pienten rakenteiden luolat: chemical models, scale, particles, atoms, elements and compounds. */
export const TEXT: Record<string, PageText> = {
  'CHEM79-ELEMENT': {
    beats: [
      { text: 'Näytteessä A on kolme argonatomia (Ar). Näytteessä B on argonatomeja ja yksi fluorimolekyyli F₂, näytteessä C kolme hiilidioksidimolekyyliä CO₂.', pic: 0, figure: false },
      { example: 'Mikä näytteistä on alkuaine?', text: 'Alkuaineessa on vain yhtä atomilajia. Näytteessä A on pelkkää argonia, joten se on alkuaine.', pic: 0, figure: false },
      { text: 'Alkuaineen atomit voivat olla myös pareina: fluorimolekyylissä F₂ on kaksi fluoriatomia. Fluori on silti alkuaine, koska atomilajeja on vain yksi.', more: 'Näyte B on seos: siinä on kahta alkuainetta erillään. Näyte C on yhdiste, koska hiili ja happi ovat sitoutuneet samaan molekyyliin.', pic: 0, figure: false },
    ],
    try: 'auto',
  },
  'CHEM79-PERIODIC-01': {
    beats: [
      { text: 'Jaksollisessa järjestelmässä jokaisella alkuaineella on järjestysluku. Vety on 1, helium 2, litium 3 ja niin edelleen.', pic: 0, figure: false },
      { example: 'Kortit ovat B (5), Ca (20), N (7), Na (11) ja Si (14). Missä järjestyksessä ne ovat taulukossa?', text: 'Kortit järjestetään luvun mukaan pienimmästä suurimpaan: B, N, Na, Si, Ca. Boori tulee ensimmäisenä, koska sen järjestysluku 5 on pienin.', pic: 0, figure: false },
      { text: 'Taulukossa järjestysluku kasvaa rivillä vasemmalta oikealle. Kun rivi loppuu, seuraava luku jatkuu alemman rivin alusta.', more: 'Järjestysluku kertoo, montako protonia alkuaineen atomin ytimessä on.', pic: 0, figure: false },
    ],
    try: 'auto',
  },
  'CHEM79-PERIOD-GROUP': {
    beats: [
      { text: 'Jaksollisen järjestelmän pystysarake on ryhmä ja vaakarivi on jakso. Ryhmiä on 18, ja ne numeroidaan vasemmalta oikealle.', pic: 0, figure: false },
      { example: 'Missä ryhmässä ja jaksossa vety (H) on?', text: 'Vety on taulukon vasemmassa yläkulmassa: ensimmäisessä sarakkeessa ja ylimmällä rivillä. Se on siis ryhmässä 1 ja jaksossa 1.', pic: 0, figure: false },
      { text: 'Natrium (Na) on ryhmässä 1 ja jaksossa 3. Samassa ryhmässä sen yläpuolella on litium (Li), joka on jaksossa 2.', more: 'Saman ryhmän alkuaineet muistuttavat toisiaan. Siksi ryhmä kertoo paljon alkuaineen ominaisuuksista.', pic: 0, figure: false },
    ],
    try: 'auto',
  },
  'CHEM79-ELEM-PROP': {
    beats: [
      { text: 'Ryhmän 1 sulamispisteitä: litium (jakso 2) 180,5 °C, natrium (jakso 3) 97,8 °C ja rubidium (jakso 5) 39,3 °C.', pic: 0, figure: false },
      { text: 'Ryhmässä 1 sulamispiste laskee, kun taulukossa mennään alaspäin. Toisessa ryhmässä tai toisella ominaisuudella suunta voi olla päinvastainen, joten se katsotaan taulukosta.', pic: 0, figure: false },
      { example: 'Kalium (K) on ryhmässä 1 ja jaksossa 4. Onko sen sulamispiste korkeampi vai matalampi kuin litiumin?', text: 'Kalium on litiumin alapuolella, joten ennuste on: matalampi. Mitattu arvo 63,5 °C tukee ennustetta, ja se on natriumin ja rubidiumin välissä.', more: 'Saman ryhmän alkuaineet ovat samankaltaisia, eivät samanlaisia. Ennuste kertoo suunnan, mutta tarkka arvo pitää mitata.', pic: 0, figure: false },
    ],
    try: 'auto',
  },
  'CHEM79-PARTICLE-MODEL-USE': {
    beats: [
      { text: 'Ohuen nesteen vasempaan reunaan on lisätty väriä. Neste on levossa, mutta väri leviää silti vähitellen oikealle ja jakautuu yhä tasaisemmin.', pic: 0 },
      { text: 'Hiukkasmallissa jokainen väriainehiukkanen liikkuu satunnaisesti, kumpaan suuntaan tahansa. Tiheästä kohdasta lähtee silti enemmän hiukkasia kuin sinne palaa, joten jakauma tasoittuu.', more: 'Tätä leviämistä kutsutaan diffuusioksi. Se tapahtuu ilman sekoittamista tai virtausta, eikä hiukkasten määrä muutu.', pic: 0 },
      { text: 'Mallin pallot ovat merkkejä, eivät valokuvia hiukkasista. Havainto on se, minkä silmä näkee, ja malli selittää sen.', pic: 0 },
    ],
    try: {
      say: 'Väri leviää liikkumattomassa vedessä. Mikä selittää sen hiukkasmallilla?',
      options: ['Hiukkaset liikkuvat satunnaisesti, ja jakauma tasoittuu.', 'Hiukkaset hakeutuvat tarkoituksella tyhjiin kohtiin.', 'Vesi virtaa ja kuljettaa värin mukanaan.', 'Väriainehiukkaset kasvavat ja täyttävät veden.'],
      answer: 0,
      explain: 'Jokainen hiukkanen liikkuu sattumanvaraisesti. Tiheästä kohdasta lähtee enemmän hiukkasia kuin sinne tulee, joten väri tasoittuu ilman virtausta.',
      why: [null, 'Hiukkaset eivät tiedä, missä on tyhjää. Niiden liike on sattumanvaraista.', 'Vesi on levossa, joten virtausta ei ole. Väri leviää silti.', 'Hiukkasten koko ei muutu. Ne vain jakautuvat laajemmalle.'],
    },
  },
  'CHEM79-STRUCTURE-MODEL-USE': {
    beats: [
      { text: 'Ruokasuolan eli natriumkloridin (NaCl) kiteessä on natriumioneja Na⁺ ja kloridi-ioneja Cl⁻. Rakennemallissa ne vuorottelevat kaikissa kolmessa suunnassa.', pic: 0, figure: false },
      { example: 'Mikä pitää suolakiteen koossa?', text: 'Jokaisen ionin lähimmät naapurit ovat vastakkaismerkkisiä. Plus ja miinus vetävät toisiaan puoleensa, ja tämä veto pitää kiteen koossa.', pic: 0, figure: false },
      { text: 'Samanmerkkiset varaukset taas hylkivät toisiaan: plus hylkii plussaa ja miinus miinusta. Rakennemallilla voi siis ennustaa, mitä kiteelle tapahtuu, jos järjestys muuttuu.', more: 'Rakennemalli näyttää osien järjestyksen, mutta ei hiukkasten liikettä. Liikkeen selittämiseen käytetään hiukkasmallia.', pic: 0, figure: false },
    ],
    try: 'auto',
    tryFigure: false,
  },
  'CHEM79-MODEL-01': {
    beats: [
      { text: 'Mallikammiossa on 12 argonatomia, aluksi kaikki väliseinän vasemmalla puolella. Kun väliseinä avataan, atomit leviävät molemmille puolille.', pic: 0, figure: false },
      { example: 'Hajuhiukkaset ovat aluksi huoneen nurkassa. Mitä niille tapahtuu ajan kuluessa?', text: 'Hiukkaset liikkuvat ja törmäilevät, joten ne leviävät vähitellen koko huoneeseen. Hiukkasia ei tule lisää eikä häviä, vaan samat hiukkaset jakautuvat laajemmalle.', more: 'Mitä lämpimämpää on, sitä nopeammin hiukkaset liikkuvat. Siksi tuoksu leviää lämpimässä nopeammin.', pic: 0, figure: false },
      { text: 'Suolakiteen rakennemalli kertoo osien järjestyksestä: Na⁺ ja Cl⁻ vuorottelevat. Rakennemalli selittää järjestystä, hiukkasmalli liikettä ja leviämistä.', more: 'Kumpikin malli näyttää vain osan aineesta. Siksi valitaan malli, joka sopii kysymykseen.', pic: 0, figure: false },
    ],
    try: 'auto',
    tryFigure: false,
  },
  'CHEM79-ATOM-01': {
    beats: [
      { text: 'Suljetussa astiassa on neonkaasua. Mallissa näytteestä on kuvattu 2 neonatomia, ja jokainen niistä on oma erillinen osansa.', pic: 0, figure: false },
      { text: 'Atomi on alkuaineen pienin rakenneosa. Jokaisessa neonatomissa on 10 protonia, natriumatomissa 11 ja rikkiatomissa 16.', pic: 0, figure: false },
      { text: 'Kaasumaisuus on koko näytteen ominaisuus, ei yksittäisen atomin. Yksi atomi ei ole kaasua, nestettä eikä kiinteää.', more: 'Kun molekyylissä on monta atomia, atomit lasketaan kertomalla. Esimerkiksi 3 happimolekyylissä O₂ on 3 · 2 = 6 atomia.', pic: 0, figure: false },
    ],
    try: 'auto',
    tryFigure: false,
  },
  'CHEM79-SCALE': {
    beats: [
      { text: 'Suolakide on 5 mm pitkä, ja sen näkee paljaalla silmällä. Silmällä nähtävää kokoa sanotaan makrotasoksi.', pic: 0, figure: false },
      { text: 'Suurennettu kuva näyttää kiteen pinnan portaan. Sekin on havainto, koska se perustuu oikeasta kiteestä tehtyyn kuvaan.', pic: 0, figure: false },
      { example: 'Mikä kuvista näyttää suolan hiukkastasolla?', text: 'Na⁺- ja Cl⁻-hiukkasten kuva on selitysmalli. Sitä ei saa kameralla suurentamalla, mutta se selittää, miksi kide on niin säännöllinen.', pic: 0, figure: false },
    ],
    try: {
      say: 'Mikä näistä on selitysmalli eikä havainto?',
      options: ['Kuva Na⁺- ja Cl⁻-hiukkasten järjestyksestä', '5 mm suolakide pöydällä', 'Suurennettu kuva kiteen pinnasta'],
      answer: 0,
      explain: 'Hiukkasten järjestystä ei näe silmällä eikä tavallisella kameralla. Kuva on malli, joka selittää havaintoja.',
      why: [null, 'Kiteen näet omin silmin: se on havainto makrotasolla.', 'Suurennettu kuva on tehty oikeasta kiteestä, joten se on havainto.'],
    },
  },
  'CHEM79-ATOM-NUCLEUS': {
    beats: [
      { text: 'Atomin keskellä on ydin, jossa ovat protonit ja neutronit. Ytimen ympärillä on elektroniverho, jossa elektronit liikkuvat.', more: 'Elektroniverholla ei ole terävää reunaa. Se kertoo, missä elektroni todennäköisesti on.', pic: 0, figure: false },
      { text: 'Ydin on hyvin pieni verrattuna koko atomiin. Jos atomi olisi jalkapallostadionin kokoinen, ydin olisi kuin herne keskellä kenttää.', more: 'Mallikuvissa ydin piirretään paljon suuremmaksi, jotta sen osat näkyvät. Kuva ei siis ole mittakaavassa.', pic: 0, figure: false },
      { text: 'Alkuaineen ratkaisee ytimen protonien määrä. Elektroneja voi irrota verhosta, mutta ydin ja alkuaine pysyvät samoina.', pic: 0, figure: false },
    ],
    try: {
      say: 'Natriumatomista irtoaa yksi elektroni. Mitä alkuainetta se on nyt?',
      options: ['Yhä natriumia', 'Neonia, koska elektroneja on nyt 10', 'Ei enää mitään alkuainetta'],
      answer: 0,
      explain: 'Alkuaineen ratkaisee ytimen protonien määrä. Natriumin ytimessä on yhä 11 protonia, vaikka verhosta lähti elektroni.',
      why: [null, 'Neonin ytimessä on 10 protonia. Natriumin ytimessä protoneja on yhä 11.', 'Atomin ydin ei muuttunut, joten alkuainekaan ei vaihtunut.'],
    },
  },
  'CHEM79-COMPOUND': {
    beats: [
      { text: 'Näytteessä C on kolme hiilidioksidimolekyyliä CO₂. Jokaisessa on yksi hiiliatomi ja kaksi happiatomia sitoutuneina toisiinsa.', pic: 0, figure: false },
      { example: 'Mikä näytteistä on yhdiste?', text: 'Yhdisteessä vähintään kahden alkuaineen atomit ovat sitoutuneet toisiinsa, ja kaikki osat ovat samanlaisia. Näyte C on yhdiste.', pic: 0, figure: false },
      { text: 'Näytteessä B on argonatomeja ja hiilidioksidia samassa astiassa, mutta argon ei ole sitoutunut niihin. Se on seos, ei yhdiste.', more: 'Näyte A on alkuaine, koska siinä on vain argonatomeja.', pic: 0, figure: false },
    ],
    try: 'auto',
  },
  'CHEM79-PROTON': {
    beats: [
      { text: 'Atomin ytimessä on protoneja. Jokaisen protonin varaus on +1, ja malleissa se merkitään plusmerkillä.', more: 'Varaukset on tässä ilmoitettu alkeisvarauksen yksiköissä: protoni +1, elektroni −1 ja neutroni 0.', pic: 0, figure: false },
      { text: 'Ytimessä on myös neutroneja, joiden varaus on 0. Ytimen ympärillä liikkuvien elektronien varaus on −1.', pic: 0, figure: false },
      { example: 'Fluoriatomin ytimessä on 9 protonia. Mikä on ytimen varaus?', text: 'Jokainen protoni tuo varauksen +1, eivätkä neutronit muuta varausta. Ytimen varaus on siis +9.', pic: 0, figure: false },
    ],
    try: 'auto',
    tryFigure: false,
  },
  'CHEM79-ELECTRON': {
    beats: [
      { text: 'Elektronit liikkuvat ytimen ympärillä elektroniverhossa. Jokaisen elektronin varaus on −1.', more: 'Varaukset on tässä ilmoitettu alkeisvarauksen yksiköissä: protoni +1, elektroni −1 ja neutroni 0.', pic: 0, figure: false },
      { text: 'Kokonaisessa atomissa on yhtä monta elektronia kuin protonia. Plussat ja miinukset kumoavat toisensa, joten koko atomin varaus on 0.', pic: 0, figure: false },
      { example: 'Fluoriatomissa on 9 protonia. Montako elektronia siinä on?', text: 'Elektroneja on yhtä monta kuin protoneja eli 9. Niiden yhteinen varaus −9 kumoaa ytimen varauksen +9.', pic: 0, figure: false },
    ],
    try: 'auto',
    tryFigure: false,
  },
  'CHEM79-NEUTRON': {
    beats: [
      { text: 'Ytimessä on protonien lisäksi neutroneja. Neutronin varaus on 0: se ei ole plus eikä miinus.', more: 'Varaukset on tässä ilmoitettu alkeisvarauksen yksiköissä: protoni +1, elektroni −1 ja neutroni 0.', pic: 0, figure: false },
      { text: 'Merkki 0 ei tarkoita, että hiukkanen puuttuisi. Neutronilla on massa, ja se on suunnilleen yhtä painava kuin protoni.', pic: 0, figure: false },
      { example: 'Hiiliatomin ytimessä on 6 protonia ja 6 neutronia. Mikä on ytimen varaus?', text: 'Vain protonit tuovat ytimeen varausta, joten ytimen varaus on +6. Neutronit lisäävät ytimen massaa mutta eivät varausta.', pic: 0, figure: false },
    ],
    try: 'auto',
    tryFigure: false,
  },
  'CHEM79-COMP-MODEL': {
    beats: [
      { text: 'Kaava CO₂ kertoo hiilidioksidimolekyylin rakenneosat. C tarkoittaa hiiltä ja O happea, ja pieni 2 hapen perässä kertoo, että happiatomeja on kaksi.', pic: 0, figure: false },
      { example: 'Montako atomia yhdessä CO₂-molekyylissä on?', text: 'Hiiliatomeja on 1 ja happiatomeja 2, eli yhteensä 3 atomia. Jos kirjaimen perässä ei ole numeroa, atomeja on yksi.', more: 'Mallissa hiili sitoutuu kumpaankin happiatomiin kaksoissidoksella. Sidostikut ovat mallimerkkejä, eivät oikeita sauvoja.', pic: 0, figure: false },
      { text: 'Kaikki yhdisteet eivät muodosta molekyylejä. Magnesiumoksidissa MgO magnesium- ja oksidi-ionit vuorottelevat hilassa, ja kaava kertoo, että niitä on yhtä monta.', pic: 0, figure: false },
    ],
    try: 'auto',
    tryFigure: false,
  },
  'CHEM79-STATE-01': {
    beats: [
      { text: 'Kolmessa salissa on samaa vettä, mallissa jokaisessa 13 vesimolekyyliä. Sali A on −21 °C, sali B 25 °C ja sali C 127 °C.', pic: 0, figure: false },
      { example: 'Missä salissa vesi on kiinteänä?', text: 'Vesi jäätyy 0 °C:ssa, joten −21 °C:ssa se on jäätä. Salissa A molekyylit pysyvät järjestyksessä ja värähtelevät paikallaan.', pic: 0, figure: false },
      { text: 'Salissa B vesi on nestettä: molekyylit ovat lähekkäin ja liukuvat toistensa ohi. Salissa C vesi on höyryä, ja molekyylit liikkuvat vapaasti kaukana toisistaan.', more: 'Molekyylien oma koko on kaikissa saleissa sama, vain liike ja välit muuttuvat. Jäässä molekyylit ovat avoimessa järjestyksessä, ja siksi jää kelluu vedessä.', pic: 0, figure: false },
    ],
    try: 'auto',
  },
  'CHEM79-ATOMICNUM': {
    beats: [
      { text: 'Jokaisella alkuaineella on oma järjestyslukunsa. Se kertoo, montako protonia alkuaineen atomin ytimessä on.', pic: 0, figure: false },
      { example: 'Ytimessä on 9 protonia. Mikä alkuaine se on?', text: 'Etsitään jaksollisesta järjestelmästä järjestysluku 9. Se on fluori (F), joten atomi on fluoria.', pic: 0, figure: false },
      { text: 'Neutronien ja elektronien määrä voi vaihdella, mutta alkuaine ei silloin vaihdu. Vain protonien määrä ratkaisee alkuaineen.', more: 'Saman alkuaineen atomeja, joissa on eri määrä neutroneja, sanotaan isotoopeiksi.', pic: 0, figure: false },
    ],
    try: 'auto',
  },
  'CHEM79-STATECHANGE': {
    beats: [
      { text: 'Mallissa on jäätä −21 °C:ssa, yhteensä 13 vesimolekyyliä. Jäätä lämmitetään, kunnes se on sulanut vedeksi ja lämpötila on 27 °C.', more: 'Sulamisen aikana jäätä ja nestettä voi olla yhtä aikaa.', pic: 0, figure: false },
      { example: 'Kun jää sulaa, mitä vesimolekyyleille tapahtuu?', text: 'Lopussakin on samat 13 vesimolekyyliä, eikä niiden koko muutu. Jään järjestys purkautuu, ja molekyylit alkavat liukua toistensa ohi.', pic: 0, figure: false },
      { text: 'Olomuodon muutos ei hajota molekyylejä eikä tee niistä suurempia. Muuttuvat vain molekyylien liike ja välimatkat.', pic: 0, figure: false },
    ],
    try: 'auto',
    tryFigure: false,
  },
};
