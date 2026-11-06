CURRENT IMPLEMENTED ENGINEERING SCOPE — 2026-10-26: the original design below was implemented and independently source/render reviewed. ENGINEERING_COMPLETE / HUMAN_REVIEW_PENDING / NOT_RELEASE_READY. Evidence: reports/autonomous-52/B02/capability-validation-manifest.json, cardinality-rendered-review.md and journeys/M-NUM-02.json. Same-members/individual-report boundary preserved; no select-all or Give-N. Full1370/native69 green, no participant efficacy/access approval. Earlier pending design label below is historical.

# M-NUM-02 — Viimeinen sana tarkoittaa koko laskettua joukkoa

Versio 1.0, 2026-10-26. **AUTHORED_DESIGN_PENDING_IMPLEMENTATION_REVIEW**. NEW52 / ADR-0019 / B02 PLAN. Alkuperäinen suomalainen suunnitelma, ei riippumaton sisältöhyväksyntä, ihmishyväksyntä, DONE tai toteutuskuitti. Rutiiniratkaisut ovat päätekijän yleisvaltuutuksen nojalla valitsemia tai tässä ehdotettuja, eivät käyttäjän erikseen hyväksymiä.

## Rooli, esitieto ja täsmällinen raja

**Atomic / concept**, required M-NUM-01 ja all_of:[M-NUM-01]. Oppija käyttää oikein tehdyn oman laskennan viimeistä sanaa koko joukon määränä ja osoittaa sen tarkoittamat **samat todelliset jäsenet** uudelleenjärjestelyn jälkeen. Nykyinen alue 3–6 kohdetta, sanasto yksi–kymmenen. Ei Give-N-tehtävää, lisäystä/poistoa, yleistä määrän säilyvyystestiä, spontaania puhetta, numeromerkkejä tai lapsi-KC:iden hallinnan myöntämistä. Retained-sanamuodot eivät korvaa ADR-0011:n nykyistä hankintaan perustuvaa etenemistä.

OPS: OPH-POPS2014-MATH-VL1-2-S2, peruste 419550 / matematiikka 466344 / kokonaisuus 466963 / S2 469266 / kuvaus.fi kappaleet 1–2, PROD01-OPH-MATH12-S2, live tarkistettu. Kardinaliteetin operointi checkpointillä ja tuoreella jäsenraportilla on projektivalinta, ei normin määräämä protokolla. Alue 1–2; monivaiheisen syötön muistaminen ei saa peittää kokonaisuuden merkitystä.

## Aavan tarve ja työstetty malli

Aava pakkaa Loikan tarkistamat reittimerkit. Hänen pitää tietää montako merkkejä on ja mitä joukkoa vastaus tarkoittaa. Mallissa neljä merkkiä lasketaan pareina yksi, kaksi, kolme, neljä. Sen jälkeen kehystetään **kaikki neljä**, ei viimeistä merkkiä: ”Merkkejä on neljä. Sana kertoo tämän koko joukon määrän.” Tämä ryhmäkehys on mallin tukea, ei itsenäisen vastauksen esivalinta.

Aava levittää samat merkit uusiin paikkoihin. Hän ei lisää tai poista jäsentä. Sana **neljä** valitaan uudelleen ja Aava osoittaa jokaisen tähän vastaukseen kuuluvan merkin. Vastatapaus: neljä + vain viimeinen merkki ei näytä koko joukon merkitystä. Ohjauksessa tämä tehdään yhdessä vaihe kerrallaan. Häivytyksessä poistuvat ryhmäkehys, vastaussana ja automaattiset jäsenvalinnat; tutut pari-/sanalaatat jäävät.

## Tiivis oma lasku → tuore raportti

Ensin oppija tuottaa kohde–sana-parit samoilla kompakteilla toiminnoilla kuin M-NUM-01:ssa, ilman järjestelmän laskuria, käyntimerkkejä, lukitusta tai seuraavaa sanaa. **Lasku valmis** tekee checkpointin, ei oikeellisuusporttia tai onnistumisilmoitusta. Oppija saa käynnistää samojen jäsenten paikanvaihdon vääränkin laskun jälkeen; oikea määrä ei saa paljastua vaiheen avaamisesta.

Paikat vaihtuvat aidosti. Sitten ”Montako merkkejä on? Näytä, mitä merkkejä sanasi tarkoittaa.” Valitse oma sanalaatta ja kunkin siihen kuuluvan jäsenen napautus. Raportin jäsenvalinnat näkyvät, jotta omaa vastausta voi tarkistaa; ne ovat eri asia kuin laskennan järjestelmän antamat käyntijäljet. Alku on tyhjä. Ei valitse-kaikki-oikotietä, yhtä oikein nimettyä ”koko joukko” -vastauspainiketta, valmista loppusanaa tai viimeisestä laskukohteesta kopioitua valintaa. Yksi vaihe kerrallaan samassa työalueessa, ei samanaikaista monikenttälomaketta tai puhekuittausta.

Käyttöliittymä antaa jäsenet ja muutoksen, oppija antaa laskennan, loppusanan ja viittausjoukon. count-vastauksen muuttaminen mitätöi checkpointin/raportin; asettelun vaihto mitätöi vanhan raportin. Mainin kompakti reitti säilyttää replayCardinality/gradeCardinality-kronologian eikä korvaa todellista muutosta layout-lipulla. Laskun viimeistä sanaa ei korosteta oikeaksi raporttivastaukseksi.

## Väärät strategiat ja näytön rajallisuus

Testattavat erot: oikea sana + vain viimeinen jäsen; kaikki jäsenet + väärä sana; oikea raportti väärän laskujonon jälkeen; vanha raportti ennen paikanvaihtoa; raportti vanhentuneesta checkpointistä. Niiden pitää epäonnistua. Oppija saa laskea uudelleen omalla strategiallaan: ei nopeus- tai laskematta-vastaamisen vaatimusta. Tässä tehtävässä kaikkien kohteiden mekaaninen naputtelu voi tuottaa oikean viittauksen; se on **tulkintaraja**, ei todiste laajasta käsitteellisestä kardinaliteetista. Erilaiset määrät ja viimeiset laskukohteet vähentävät yhden opitun kaavan peittävyyttä, eivät poista tätä rajaa.

Palautteen esimerkki lähetyksen jälkeen: ”Valitsit vain viimeisen merkin. Sana neljä kertoo kaikkien laskettujen merkkien määrän. Näytetään ne yhdessä.” Se on ryhmäapua ja pitää korjatun yrityksen tuettuna.

Säilytä 3 itsenäistä onnistumista / 2 pohjaa, count_cardinality ja count_same_set_rearranged, 1 hajautetusta alkuasettelusta lähtevä soveltaminen sekä 2 myöhempää onnistumista aikaisintaan 24 h hankinnan jälkeen. Myöhempi tehtävä sisältää koko lasku–muutos–tuore raportti -ketjun, ei pelkkää viimeisen sanan muistamista. Minimit ovat projektipolitiikkaa. Tarinassa merkkipussi valmistuu myös avustettuna; se ei myönnä lapsitaitoja tai retention-tilaa.

## Lähdekartta ja pääsy

- [OPH JSON](https://eperusteet.opintopolku.fi/eperusteet-service/api/perusteet/419550/kaikki), live 2026-10-26: yllä oleva S2-alue, ei tämän jäsenraportin hyväksyntää.
- [R02 / NCETM Cardinality and Counting](https://www.ncetm.org.uk/classroom-resources/ey-cardinality-and-counting/), HTML 2026-10-26, johdanto / last number / Conservation: viimeisen sanan koko joukkoa koskeva merkitys ja asettelun muutos. Sivun Give-N-ehdotusta **ei** oteta tähän sopimukseen.
- [R01 / IES WWC 2021](https://ies.ed.gov/ncee/wwc/PracticeGuide/26), HTML 2026-10-26, suositukset 1–3: vaiheittainen näkyvä malli ja selkeä kokonaisjoukon kieli, ei runtime-validointi.

Näppäimistö, peruminen, rauhallinen esitys ja vähennetty liike säilyvät; ääni vapaaehtoinen/aluksi pois ilman kuittausta. Teksti alkuperäistä; ei lainattuja kuvia. Tarkistettava kronologia, fresh report, sallittu väärä lasku, oikeat mobiilikuvat ja no-audio. Ei väitettä täydestä ei-visuaalisesta vastaavuudesta, ihmisen ymmärtämisestä tai vaikuttavuudesta.
