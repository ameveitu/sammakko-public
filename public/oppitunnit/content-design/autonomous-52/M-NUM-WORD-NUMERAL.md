# M-NUM-WORD-NUMERAL — Sana löytää numeromerkin

Versio 1.0, 2026-10-26. **AUTHORED_DESIGN_PENDING_IMPLEMENTATION_REVIEW**. NEW52 / ADR-0019 / B02 PLAN. Alkuperäinen suomalainen suunnitelma, ei riippumaton sisältöhyväksyntä, ihmishyväksyntä, DONE tai toteutuskuitti. Rutiiniratkaisut ovat päätekijän yleisvaltuutuksen nojalla valitsemia tai tässä ehdotettuja, eivät käyttäjän erikseen hyväksymiä.

## Jäädytetty tavoite ja rajat

Rooli **process**, node_kind representation, entry_role dynamic; ei required-esitietoa tai prerequisite_groups-ryhmää. M-NUM-STABLE-ORDER on **strong**, ei hard gate. Tavoite on lukusanan yhdistäminen vastaavaan numeromerkintään. Nimetty sana → merkintä on ydinsuunta; kortin ehdottama käänteinen suunta on erillinen soveltamisehdotus, ei jäädytetyn tavoitteen automaattinen kaksisuuntaisuusvaatimus. Ei määrän laskemista, numeron kirjoittamista, spontaania puhetta tai koko M-NUM-03-integraation myöntämistä.

OPS: OPH-POPS2014-MATH-VL1-2-S2, peruste 419550 / matematiikka 466344 / kokonaisuus 466963 / S2 469266, kuvaus.fi kappaleet 1–2. Sama määrä–sana–merkintä-alue, jonka aiempi rekisteri PROD01-OPH-MATH12-S2 paikantaa. Tämän KC:n applies_to-laajennusta ei kirjoiteta rekisteriin; alla oleva live-tarkistus on lähdesivutieto. Vuosiluokka-alue 1–2; sanan lukeminen ja numeron visuaalinen erottaminen ovat reitin piiloriskejä.

## Tarve → malli → oma toiminta

Loikka tekee numeroidut säilytyspaikkalaput Aavan sanalistan mukaan. Mallissa Aava saa sanan **neljä**, katsoo merkkejä 2, 4 ja 7 ja valitsee **4**: ”Tämä merkintä tarkoittaa samaa lukua kuin sana neljä.” Oikea lappu siirtyy säilytyspaikkaan. Kyse ei ole laatikoiden määrän laskemisesta.

Ohjauksessa vastaava pari saa näkyä rinnakkain; seuraavassa tapauksessa oppija valitsee itse ja voi pyytää mallin ennen virhettä. Häivytyksessä poistuvat yhdistävä viiva, korostettu oikea merkki ja valmis pari. Jää yksi selvä sanavihje ja pieni joukko suuria numerolaattoja; yksi napautus valitsee vastauksen, vaihto/peruminen ja Valmis ovat neutraaleja. Ei erillistä nimeämistä, lomaketta tai puhekuittausta.

Itsenäinen esimerkki: vihje **kuusi**, ehdokkaat 9, 3, 6 vaihtuvissa paikoissa. Oppija tuottaa vastaavuuspäätöksen; käyttöliittymä antaa sanan ja ehdokkaat, ei oikeaa paria tai järjestettyä laskuriviä. Tavallisten pystyasentoisten 6/9-merkkien sekoittuminen on mahdollinen tehtävähavainto, ei diagnoosi. Väärä vastaus sallitaan. Lähettämisen jälkeinen apu: ”Sana kuusi liittyy merkintään 6. Katsotaan pari yhdessä.” Tämän jälkeen sama näytetty pari on avustettu.

## Process-näyttö, soveltaminen ja myöhempi paluu

Ehdotus on rajattu äärellinen vastaavuusprosessi suomen sanoilla ja merkinnöillä 1–10: useita arvoja ja vastauspaikkoja, valintaperuste samanarvoisuus. Process-rooli **säilyy**; yhden oikean monivalinnan deterministisyys ei tee solmusta atomista. Jamesin konsultti rajatusta tyypitetystä sopimuksesta on **PENDING**: toteuttajan on määriteltävä havaittavat päätökset, arvokattavuus, tuetut vihje-/vastausesitykset ja prosessin näyttörajat ennen hyväksyntää. Tämä tietue ei luo uutta sopimuskoodia tai väitä konsulttia suoritetuksi.

Väärät strategiat: aina keskimmäinen, pisin sana → suurin numero, opetetun yhden parin toisto tai vastaus muiden vaihtoehtojen poistuttua. Vaihtele arvoja, vaihtoehtojen järjestystä ja uskottavia naapurilukuja; älä pienennä valikoimaa oikein vastattaessa. Soveltaminen: sama vastaavuus reittivihkon erilaisessa mutta selkeässä painoasussa. Uusi fontti tai tarinanimi yksin ei osoita laajaa siirtoa. Käänteinen numerosta sanaan -tehtävä voidaan kirjata erilliseksi soveltamiseksi vain sopimuksen sitä tukiessa.

Myöhempi oma parivalinta tehdään ilman näkyvää mallia myöhemmässä istunnossa. Kiinteä opittu fakta saa tulla muistihakuna takaisin; apua ei pyyhitä siemenellä tai paikan vaihdolla. Viive, minimit ja kattavuus jäävät päätekijän versioitaviksi projektivalinnoiksi, eivät lähteiden tutkimusvakioiksi. Tuettukin onnistuminen saa kiinnittää tarinalapun; maailman muutos ei myönnä näyttöä.

## Lähteet ja pääsy

- [OPH JSON](https://eperusteet.opintopolku.fi/eperusteet-service/api/perusteet/419550/kaikki), live 2026-10-26: yllä oleva S2-paikannin, yhteyksien OPS-alue; ei prosessisopimusta tai 1–10-rajausta normina.
- [R02 / NCETM Cardinality and Counting](https://www.ncetm.org.uk/classroom-resources/ey-cardinality-and-counting/), HTML 2026-10-26, Numeral meanings: merkintöjen vaihtelevat esitykset. Ei suomen sana→numero-prosessin validointia; pääperusta yhteydelle on OPH, tämä vain viereinen opetussuunnittelun tuki.
- [R01 / IES WWC 2021](https://ies.ed.gov/ncee/wwc/PracticeGuide/26), HTML 2026-10-26, suositukset 1–3: näkyvä parimalli ja lyhyt toimintakieli. Ei sovelluksen vaikuttavuusnäyttöä.

Tekstivihjeen onnistuminen osoittaa tekstillä tuettua sanan tunnistusta. Vapaaehtoinen sanan nimiluku on eri pääsyreitti, ei spontaani suullinen vastaus tai todistettu kuuleminen; ääni aluksi pois, ei kuittausta. Samaa hyväksyntää ei siirretä automaattisesti kuuloreittiin. Ei kopioituja tehtäviä/kuvia. Tarvitaan vielä tyypitetyn sopimuksen arvio, 390/1280-kuvat, näppäimistö/no-audio sekä väärien parien ja avun jälkeisen historian tarkistus.

## Process-draftin rajattu tarkennus, 2026-10-26

Uusi päätekijän toimeksianto valitsee sana–numeromerkintä-prosessiin arvot 1–10 **molemmissa suunnissa**, yhteensä 20 omaa vaadittua matching-tapausta. Tämä täydentää yllä olevan alkuvaiheen suuntaehdotuksen; se ei ole väite OPH:n määräämästä kaksisuuntaisesta arvioinnista. Päätekijän ilmoituksen mukaan rajatun capability/deck-konsultin scoped-portti on nyt suljettu; vanha PENDING-merkintä on tämän suunnitteluvaiheen historiaa, ei uuden pack-draftin hyväksyntä.

Alkuperäinen kokonainen pakettiehdotus on M-NUM-WORD-NUMERAL.draft.yaml; sen lähdelisäykset ja rajatut validointikuitit ovat B02-process-sources.draft.yaml-tiedostossa. Mallikansi näyttää kaikki kymmenen faktaa molempiin suuntiin. Molempien suuntien pakollinen soveltaminen korjaa ensimmäisen opetetun yksi/1-faktan aidosti väärän parin kolmesta vaihtoehdosta. Delayed-näyte kattaa ensimmäisen ja viimeisen arvon molempiin suuntiin: neljä tuetonta havaintoa vähintään 24 h hankinnan jälkeen. Tämä ei todista kaikkien kymmenen faktan säilymistä. Fast path on pois; 3 onnistumista / 2 pohjaa eivät korvaa 20 tapauksen kokonaisuutta.

Tila **AUTHORED_DESIGN_PENDING_IMPLEMENTATION_REVIEW**. Draft ei ole canonical-rekisterissä eikä käytä tuotannon testifixturea. Lähderekisterin lisäys, canonical-admissio, aidot henkilökohtaiset reitit, renderöinti ja native-katselmus jäävät mainille. Ei ihmishyväksyntää, suullisen tuotannon väitettä tai node DONE -merkintää.
