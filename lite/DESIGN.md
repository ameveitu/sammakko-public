# Sammakko Lite – suunnitteluperiaatteet

Kilpaileva, kevyt toteutus 181 noodin suljetusta aligraafista
(`reference/mvp-scope-181.json` = alkuperäinen 177 noodin `reference/mvp-scope.json` + neljän oppitunnin katselmointilisäys): aiemmat 107 noodia ja niiden pakollisten ja vahvojen
esitietojen rekursiivinen sulkeuma, turvallisuusohje mukaan lukien.
Tavoite: sama pedagoginen ydin (esitiedot, tuettu vs. itsenäinen näyttö,
siirtovaikutus, viivästetty muistihaku) mahdollisimman pienellä koodilla, ja
lapsen kokemus ensin.

## Kolme maailmaa
- **Rantaretki** (1.–2. lk, sammakko Loikka), **Aarresaaristo** (3.–6. lk,
  Kapteeni Loikka) ja **Lampilaboratorio** (7.–9. lk, tutkija Sulka: harmaasininen haikara,
  pyöreät lasit ja laboratoriotakki). Aava on pieni keltainen ankanpoikanen; hahmot eivät jaa kuvaa.
- Lapsi lukee lyhyttä suomenkielistä tekstiä. Ääneen lukeminen on lisätuki:
  tehtävänanto, painettu vastaus ja palaute luetaan, ellei hiljainen tila ole päällä. Painetun napin nimi luetaan
  (`labelOf`), ja palaute jonotetaan sen perään, joten kumpikaan ei katkaise
  toista.

## Kehystarina
- Maailmaa peittää sumu. Jokainen loistava taito valaisee yhden paikan ja ajaa
  sumua pois. Pelaaja auttaa hahmoa, jolla on konkreettinen tavoite:
  - Rantaretki: Loikka tarvitsee valaistun rannan rakentaakseen lautan
    saaristoon.
  - Aarresaaristo: pullopostin aarrekartta. Aarre odottaa tutkimusasemalla.
    Arkussa on kutsu Lampilaboratorioon.
  - Lampilaboratorio: Sulkan loikkakisan mittarit ovat sumussa. Jokainen
    taito kalibroi yhden laitteen, jotta kisa voidaan mitata reilusti.
- Ensikäynnillä kartan yläpuolella näkyy koko tarina, ja se luetaan ääneen.
  Myöhemmin näkyy tavoite ja jäljellä olevien sumupaikkojen määrä, ja
  tarinan voi kuunnella uudelleen. Maailman valmistuminen kertoo lopetuksen.
- Tarina on tarkoituksella kevyt kehys: se antaa syyn edetä, mutta ei vie
  aikaa tehtäviltä.
- Jokainen noodi kuuluu täsmälleen yhteen maailmaan ja lukuun (73 + 60 + 48).
- Aiemman maailman taidot, joita uusi maailma suoraan tarvitsee, ovat
  maailman alussa **pohjatarkistuksena**: Rantapohja (22) ja Pohjatarkistus
  (16). Pohjapaikat ovat aina auki, ja ne kuitataan pikatarkistuksella
  (2 oikein). Näin vanhempi oppilas ei joudu kulkemaan alakoulun polkua,
  eikä pohja lukitse mitään.

## Pelillisyys ja pysyvät seuraukset
- Jokaisella maailmalla on tehtävä (quest): ranta valaistaan lauttaa varten,
  aarrekartta seurataan tutkimusasemalle ja laboratorion laitteet kalibroidaan.
- Jokainen luku jättää **reppuun** löydön (esim. 🎵 laskuloru-pilli, 🛶 kaislalautta).
  Reppu näkyy kartan yläpuolella, ja tyhjät paikat ovat ?-merkkejä.
- Kartan yläpalkki kertoo loistavat paikat (✨ x/y) ja päätellyt (☆ n). Edistymispalkki
  erottaa loistavat ja päätellyt. Sumu väistyy pysyvästi.
- Palkintoruutu kertoo, mitä avautui ja mitä pääteltiin, ja nimeää luvun löydön.

## Lapsen kokemus (1.–2. lk)
- Ohjeet ovat lyhyttä pientä tekstiä, ja ne voi kuunnella (fi-FI). Toiston saa
  kaiutinpainikkeesta. Valinnat ovat kuvia, numeroita tai lyhyitä sanoja.
  Kuuntelu (pieni kaiutin) on eri painallus kuin vastaaminen.
- Kartan tiet ovat graafin pakollisia esitietosuhteita: tie kulkee
  esitiedosta paikkaan, joka sen varaan rakentuu.
  - Jokainen luku on oma alueensa: niitty, saari tai huone. Alueet ovat
    allekkain lukujen esitietojärjestyksessä.
  - Alueiden väliset tiet kulkevat yhteistä reunakaistaa pitkin: saaristossa
    lauttareittinä, rannalla pitkospuina ja labrassa putkina. Siksi teiden ei
    tarvitse ylittää toisiaan, eikä tunneleita tarvita yhdessäkään maailmassa.
  - Paikka, jolla ei ole pakollista tietä, saa askelkivipolun tukevasta
    esitiedosta. Kartalla ei ole irrallisia paikkoja, ja testi varmistaa tämän.
  - Osatut paikat hehkuvat lämpimästi. Tuntematon maa on pilvisen sumun
    peitossa, mutta tiet ja nimet näkyvät sumun läpi. Jokaisen oppimattoman
    paikan päällä leijuu puoliläpinäkyvä pilvi, joka on ohuempi avoimen
    paikan kohdalla. Seuraavan paikan päällä ei ole pilveä.
  - Lukujen nimet kartan yläpuolella ovat nappeja: painallus vierittää
    kartan luvun alueelle ja lukee luvun tarinarivin. Juuri valaistu paikka syttyy pienellä animaatiolla
    (ei, jos käyttäjä on rajoittanut liikettä).
  - Paikkojen nimet ovat tarinan pysähdyspaikkoja, eivät opetussuunnitelman
    termejä, ja jokaisella paikalla on eri nimi. Aikuisen näkymä (`#aikuiselle`) näyttää saman aligraafin
  teknisenä kaaviona (oppiaineen väri, suhteen tyyppi ja vahvuus) ja tähdet.
- Hiljainen tila ("En voi nyt kuunnella", 3 h): ohjeita ei lueta, ja
  kuuntelutehtävät vaihdetaan kirjoitettuihin. Jos selaimessa ei ole suomen
  puheääntä, hiljainen tila on aina päällä.
- Uusi paikka aukeaa palkintoruudulla nimeltä, ja luvun valmistuminen
  kerrotaan seuraavan luvun tarinarivin kanssa.
- Osaavalle nopea reitti: "Osaan jo" → 3 itsenäistä + 1 uusi tilanne.
  Tavoite on alle 15 painallusta noodia kohden.
- Oikea vastaus etenee automaattisesti. Väärä vastaus näyttää oikean
  päättelyn (ei pelkkää punaista ruksia).
- Yksi virhe saa vain paikallisen palautteen. Kahden peräkkäisen virheen jälkeen
  tarjotaan kolme valintaa: yritä uudelleen avun kanssa, **Harjoittele pohjaa**
  (tukiretki lähimpään esitietoon, joka ei vielä loista) tai **Myöhemmin**.
  Mitään korjauskierrosta ei pakoteta. Tukiretken jälkeen tulee nappi
  **Palaa: <alkuperäinen aihe>**.
- **Harjoittele lisää** aloittaa oikean harjoituksen: 5 uutta tehtävää, jotka
  kirjataan vaiheella `practice`.

## Näyttö ja eteneminen (engine/)
- Jokainen vastaus kirjataan: `{node, rev, phase, ok, tag, seed, resp, help, mode, sess, at}`.
  Vaiheet: `guided`, `independent`, `transfer`, `practice`, `retrieval`, `quick`.
  Testaajatilan vastaukset saavat `syn: true` -merkinnän, eivätkä ne vaikuta tiloihin.
- Tilat lasketaan aina vastaushistoriasta (`evidence.ts`, `nodeState`). Todennäköisyysmallia ei ole.
  - **Tarkistettu** ⭐ = 3 peräkkäistä oikeaa itsenäistä vastausta (independent/practice/retrieval),
    joissa vähintään kaksi eri perhettä (`tag`), ja *sen jälkeen* 1 oikea siirtotehtävä.
    Pikatarkistuksessa 2 oikein peräkkäin (`quick`, merkitään erikseen).
  - **Harjoiteltu avulla** 🤝 = vähintään 2 oikeaa ohjattua vastausta. Paikka loistaa
    ja kerryttää maailman edistymistä, mutta tila ei ole tarkistus, ja apu on kirjattu.
  - **Muistettu** ⭐⭐ = oikea muistihaku vähintään 20 tunnin tauon jälkeen,
    kun paikka on jo tarkistettu. Epäonnistunut muistihaku poistaa muistetun tilan
    ja jää näkyviin (`recallFailed`). Heti perään harjoiteltu ei ole muistamista:
    vain uusi, viivästetty muistihaku palauttaa tilan.
  - **Viime aikoina vaikeaa** ! = vähintään 2 väärää neljästä viimeisestä ei-ohjatusta
    vastauksesta tai epäonnistunut muistihaku, jota ei ole seurannut 3 peräkkäistä oikeaa.
    Aiempi tarkistus säilyy historiassa.
  - **Myöhemmäksi** 🕒 = Myöhemmin-valinta ilman myöhempää yritystä. Paikka siirtyy jonon
    loppuun, mutta ei katoa eikä saa heikkoa merkintää.
  - **Ei vielä tarkistettu** ≠ heikko.
- Noodi aukeaa, kun sen ryhmät toteutuvat: `all_of` vaatii kaikki ja `any_of` yhden.
  Tila "osattu" tarkoittaa loistavaa (tarkistettu tai avulla) tai päätelty.
  Turvallisuusohje ei ole lukko.
- **Hyppy**: lukittuun paikkaan saa hypätä vahvistuksen jälkeen. Kun myöhempi paikka on
  *tarkistettu*, sen `all_of`-esivanhemmat ovat **päätelty** ☆. Lähde nimetään
  ("päätelty: Laske nopeus"). Päätelty avaa polkuja, mutta ei loista eikä ole tarkistettu.
  `any_of`-jäseniä ja turvallisuusohjetta ei päätellä.
- Jono (**Jatka seikkailua**): ensin erääntyneet muistihaut, sitten luvun järjestyksessä
  ensimmäinen avoin paikka, ja viimeisinä myöhemmäksi jätetyt.

## Tehtävät
- Jokainen noodi = `NodeSpec`: tarina, malliesimerkki ja tehtävägeneraattori
  `item(rng, phase)`. Oikea vastaus tulee aina deterministisestä
  generaattorista, ei käsin kirjoitetusta avaimesta.
- Jokaisella tehtävällä on `check()` ja `solution`. Testit ajavat jokaisen
  noodin generaattorin satoja kertoja ja varmistavat, että ratkaisu läpäisee
  tarkistuksen, väärät vaihtoehdot eivät läpäise, ja vastausluokat ovat
  tasapainossa. Ohjeteksti ei saa paljastaa vastausluokkaa (Astra R01).
- Vuorovaikutustyypit ja niiden jakauma noodeittain ovat COVERAGE.md:ssä (generoitu). Liike- ja aikaoppitunneissa
  tehtävän kuva on yhteinen liikesoitin (ks. alla). Jokaisella noodilla
  on vähintään kaksi itsenäistä tehtäväperhettä. Luettelo noodeittain: COVERAGE.md.
- Kuvan lukemisen sääntö: oikean vastauksen pitää erottua vertailemalla
  (korkein, matalin, jyrkin), ei mittaamalla. Pylväskuvan väärät
  vaihtoehdot ovat samat pylväät eri järjestyksessä, ja kuvaajasta luettava
  arvo osuu aina apuviivalle.

## Liikesoitin (motion/time)
- `src/engine/motion.ts`: skenaario (`Run`: lähtöaika, nopeus tai kiihtyvyys, pysähdykset) ja yksi kello. Kaikki näkymät
  (rata, sekuntikello, viivain, taulukko, nopeusmittari, kierrokset, s,t- ja v,t-kuvaaja) lukevat saman ajan `frameAt(t)`.
- Näkymä näytetään vain, jos sen taito on opetettu (vahvat `all_of`-esivanhemmat, `VIEW_TAUGHT`). Testi tarkistaa jokaisen
  21 noodin. Kymmenesosasekunnit näkyvät vasta, kun ne on opetettu.
- Vastaus kirjaa skenaarion (`scn`: tehtävä, näkymät, katsotut kohdat), joten virheen voi toistaa. Jokainen siirretty noodi
  sai uuden version (`motion1-2026-10-27`); vanhat vastaukset jäävät historiaan tilaksi *aiemmassa versiossa tehty*.
- Simulaatio ei ole näyttöä yksinään: osuus tehtävistä (`SIM_SHARE`) käyttää soitinta, muut ovat ennallaan.

## Lentopaja (pelikaari)
- Neljä paikkaa (paja, ranta, mittausrata, näköalapaikka) yhdellä 360×210-näkymällä. Loikka hyppää napautettuun kohtaan;
  hahmoilla on asennot *idle, notice, move, carry/build, inspect, celebrate*. Liikkeen vähentäminen poistaa animaatiot.
- Kolme osaa: runko (ranta) on heti hyödyllinen pajassa, siivet ja potkuri (mittausrata) tekevät lennon mahdolliseksi.
  Sulka antaa mittanauhan ja sekuntikellon; reppu on käytettävä (avaa vihko, käytä työkalua, asenna osa).
- **Kolme erillistä kirjanpitoa**: pelin tila (`save.game`), oppituntien vastaukset ja niistä johdettu osaaminen.
  Peli ei kirjoita näyttöä, eikä osaaminen synny pelistä.
- Tehtävä antaa osan, kun tehtävän sisällä (`mission`-kenttä) on annettu: ohjattu reitti = 2 oikeaa ohjatusta oppitunnista,
  suora reitti = myöhemmän oppitunnin pikatarkistus kuitattu tehtävän sisällä. Sama osa, eri kirjaus (`route`, `node`).
  Myöntö on idempotentti (päivitys, uusinta tai tuonti ei anna toista). Uusinnat ja päätellyt esivanhemmat eivät anna mitään.
- Vanhan tallenteen löydöt kopioidaan kerran `prize:*`-merkinnöiksi lähteellä `legacy`; ne eivät keksi tehtäviä.
- Herkut: koko kasvaa enintään kaksi askelta (3 ja 6 herkkua), ei nälkää eikä pienenemistä. Pitkä loikka vain maailmassa;
  koe- ja liikeoppitunnit eivät lue pelin tilaa (testi: sama siemen → sama skenaario).
- Lento: pidä **Ylös** (tai välilyönti), päästä liukuaksesi. Vesi pomppauttaa takaisin, joten epäonnistua ei voi.
  Leveät siivet: korkea reitti Lokkikallion yli; kapeat: matala reitti Kivikaaren läpi. Raketti on vain piirustus.
- Testaajatila pelaa kaaren erillisessä `testerGame`-tilassa; **Nollaa testidata** poistaa sen.

## Mitä tarkoituksella jätetään pois
- Ei ADR-kansiota eikä pilvipalvelua. Tallennusmuoto on versioitu (v2) ja v1
  muunnetaan varovasti, mutta raskasta todistusaineistoarkistoa ei ole.
- Ei pilvipalvelua tai seurantaa: tila on selaimen localStoragessa.
