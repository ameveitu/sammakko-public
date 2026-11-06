# M-MEAS-01 — Sovittu pala kertoo pituuden

Versio 1.0, 2026-10-26. **AUTHORED_DESIGN_PENDING_IMPLEMENTATION_REVIEW**. NEW52 / ADR-0019 / B02 PLAN. Alkuperäinen suomalainen suunnitelma, ei riippumaton sisältöhyväksyntä, ihmishyväksyntä, DONE tai toteutuskuitti. Rutiiniratkaisut ovat päätekijän yleisvaltuutuksen nojalla valitsemia tai tässä ehdotettuja, eivät käyttäjän erikseen hyväksymiä.

## Tavoite ja olemassa olevan ytimen rajat

**Atomic / procedure**, required M-MEAS-00 **JA** M-NUM-01, sama all_of-ryhmä. Nykyinen tavoite: kokonainen suora pituus peitetään sovituilla samanpituisilla yksiköillä ilman rakoja/päällekkäisyyttä ja raportoidaan lukusana sekä yksikkö. Ei muiden suureiden mittaamista, murto-osia, asteikon lukemista tai yksikkömuunnoksia. ADR-0011:n ajantasainen hankinta on tavallisen etenemisen ehto; canonicalin retained-sanat ovat vanhaa tekstiä, eivät uuden kalenterigaten peruste.

OPS: OPH-POPS2014-MATH-VL1-2-S3; peruste 419550 / matematiikka 466344 / kokonaisuus 466963 / S3 469267 / kuvaus.fi kappale 3, rekisteri PROD01-OPH-MATH12-S3. Live tarkistettu; yksikköpalojen tarkka peittopredikaatti on projektiformalisaatio. Alue 1–2. Laskemisen ja yksikön tunnistamisen lisäksi täsmäsijoittelu/koordinaattilukutaito voi aiheuttaa piilovaatimuksen.

## Loikan tarve ja konkreettinen malli

Loikka tarvitsee Aavalta samanpituisen nauhan viirin reunaan. Viesti ”kaksi” ei riitä ilman tietoa palasta. Nykyistä tyypitettyä mallia vastaava työ: kuuden sisäisen pituusaskelen nauha peitetään kahdella kolmen askeleen mittapalalla. Oppijalle näytetään nauha, sovittu pala ja kaksi sijoitusta pää päähän; **sisäisiä lukuja 6/3 ei tarvitse näyttää**. ”Kaksi tällaista palaa täyttää nauhan.” Tulos on sana **kaksi** ja juuri kyseinen mittapala. Saumat, alku ja loppu näkyvät.

Vastaesimerkissä kaksi palaa on osittain päällekkäin: sama palamäärä ei täytä nauhaa. Malli korjaa sijainnin näkyvästi. Ohjauksessa oppija sijoittaa itse ensimmäisen palan ja jatkaa pyydettävällä aloitus-/saumatuella. Häivytys poistaa mallipeiton, paikkavihjeet ja automaattisen tuloksen, ei tuttuja sijoitus-/perumistoimintoja.

## Kevyt itsenäinen rakentaminen ja oppijan päätökset

Yksi tiivis nauhan, sovitun palan ja omien palojen työalue. Napauta/valitse pala, aseta se haluttuun paikkaan tai siirrä pienin näppäinaskelin; siirto ja poisto ovat mahdollisia. Ei koordinaattilomaketta, pakollista nimeämistä tai puhekuittausta. Väärä alku, väli, päällekkäisyys, liian monta/vähän palaa ja väärä yksikköraportti ovat oikeasti mahdollisia. Neutraali sijaintihila saa helpottaa syöttöä, mutta ei valita seuraavaa oikeaa saumaa. Ei oikeisiin paikkoihin rajoittavaa snappingia, automaattista jatkopalaa, täyttöä tai palamäärälaskuria itsenäiseksi näyttönä.

Oppija ratkaisee yksikkökoon säilymisen, oman peiton ja tuloksen. Järjestelmä antaa sovitun palan ja yhteisen mittakaavan; se saa kertoa tavoitteen ”peitä nauha”, mutta ei tarvittavaa palamäärää. Valitse lopuksi lukusanalaatta ja käytettyä palaa vastaava yksikkökuva samassa työalueessa. Yksikköä ei valita valmiiksi raporttiin. Nykyinen UnitDomain sisältää vain yhden geometrisen yksikön: väärän yksikön raportti on eri asia kuin toisenkokoisen palan rakentaminen. Jos main lisää väärän palan vaihtoehdon, sen todellinen geometria/identiteetti täytyy tukea tyypitetysti; virheellistä yksikkötunnistetta ei saa kuvittaa oikean kokoiseksi ja väittää väärän yksikön käsittelyä toteutetuksi.

## Säilytettävä variaatio, soveltaminen ja myöhempi tarkistus

Nykyiset itsenäiset sisäiset suhteet 12/2 ja 12/3 tuottavat kuusi/neljä palaa; siirto 12/4 tuottaa kolme samalla nauhalla ja yhteisellä asteikolla. Yksikkö muuttuu oikeasti, ei vain nimi. Ne eivät ole OPS:n määräämiä lukuja. ADR-0015:n mallin/ohjauksen 2/5/7-vastausluokat jättävät 6/4/3-reitin kelpoiseksi vanhassa altistuspolitiikassa; älä tuo takaisin jo korjattua neljän vastauksen törmäystä tai väitä, että uudet siemenet poistavat apuhistorian.

Adversaariset vastaukset: oikea lukusana mutta väärä peitto; aukoton peitto väärästä alusta; hyvä peitto väärällä yksikköraportilla; oikea palamäärä päällekkäin. Palautteen esimerkki: ”Tähän jäi rako. Pala ei vielä jatka edellistä.” Sen paljastama korjaus kirjataan avuksi. Ei jokaisesta mittausvirheestä päätelmää puuttuvasta laskutaidosta.

Säilytä vähintään 3 itsenäistä onnistumista / 2 pohjaa, 1 aidosti muuttuneen yksikön siirto, myöhemmin 2 onnistumista aikaisintaan 24 h hankinnan jälkeen ja nykyinen viiveen kontekstikattavuus. Myöhempi tehtävä rakentaa jälleen peiton ja raportin; odottaminen ei ole havainto. Kynnykset ovat projektipolitiikkaa. Maailmassa nauha valmistuu viiriin, myös tuettuna, ilman hallinnan automaattista myöntämistä.

## Lähteet ja M2

- [OPH JSON](https://eperusteet.opintopolku.fi/eperusteet-service/api/perusteet/419550/kaikki), live 2026-10-26: S3:n mittaamisen periaate/yksiköt; ei kaikkia suureita kattavaa hyväksyntää.
- [R03 / NCETM Measures](https://www.ncetm.org.uk/classroom-resources/ey-measures/), HTML 2026-10-26, Beginning to use units / Common errors: samat yksiköt ja täysi peitto ilman aukkoja/päällekkäisyyksiä. Ei täsmäsijoitusmoottorin validointia.
- [R01 / IES WWC 2021](https://ies.ed.gov/ncee/wwc/PracticeGuide/26), HTML 2026-10-26, suositukset 1–3: näkyvä peittomalli ja täsmällinen yksikkökieli, ei sovelluksen vaikutuskoe.

**M2_NONVISUAL_HOLD säilyy**: tekstikoordinaatit voivat vaatia aritmetiikkaa yli esitietojen; näppäimistö tai kapea hila ei todista ei-visuaalista pituusvertailua. Ääni vapaaehtoinen/aluksi pois. Hyväksy vain todella tarkistettu visuaalinen/näppäimistöreitti; ei täyttä WCAG/VoiceOver-vastaavuutta. Teksti alkuperäistä, ei lainattuja kuvia. Tarkistettava peiton geometria, väärät sijoitukset/yksiköt, tuen poistuminen ja oikeat 390/1280-kuvat.

## Rajattu canonical-annotaatio, 2026-10-26

Lisätty vain learning_journey_v1 / unit_iteration_v1 ja tarkka v7_evidence_compatibility_v1-sidos arkiston 0b2a791918f472cf8ba61eede095a6a578adeab6 sisältöhashiin 755feb5c8274006d5bdb252d47d3f7dd6c975e1c152b2144deeaa1fe18048051. Tyypitetyn mallin annetut tiedot ovat targetLength 6, unitLength 3, unitId sovittu-mittapala ja workspace [0,24]; ratkaistu mallipeitto on kaksi palaa. conservative_situation_v1 säilyttää nykyisen altistusrajauksen, eikä annotaatio avaa yksiköille suljettua muistihakupoikkeusta.

Vanhat tehtävät, arviointiehdot, metadata, esitiedot, provenance ja alkuperäiset sanamuodot säilyvät. Malli/ohjausluokat ovat edelleen 2/5/7; itsenäinen 6/4 ja siirto 3 eivät ole saman vastauksen skaalauskopioita. Yhteensopivuusmerkintä sallii vain nykyisen tiukan historiallisten väitteiden vertailun, ei automaattista vanhan tai uuden näytön hyväksyntää. Historiarivejä ei kirjoiteta uudelleen. Vanhojen retained- ja äänitekstien modernisointia ei tehdä tässä append-only-muutoksessa.

Tila säilyy **AUTHORED_DESIGN_PENDING_IMPLEMENTATION_REVIEW**. Normaali henkilökohtainen oppijareitti, renderöinti, natiivi varmennus ja lopullinen solmuhyväksyntä kuuluvat päätekijän seuraavaan porttiin. Tämä annotaatio ei ole node DONE, ihmishyväksyntä tai M2:n korjaus. **M2_NONVISUAL_HOLD säilyy.**
