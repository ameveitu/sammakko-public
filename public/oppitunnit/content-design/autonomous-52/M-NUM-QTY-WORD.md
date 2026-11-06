# M-NUM-QTY-WORD — Joukolle sopiva lukusana

Versio 1.0, 2026-10-26. **AUTHORED_DESIGN_PENDING_IMPLEMENTATION_REVIEW**. NEW52 / ADR-0019 / B02 PLAN. Alkuperäinen suomalainen suunnitelma, ei riippumaton sisältöhyväksyntä, ihmishyväksyntä, DONE tai toteutuskuitti. Rutiiniratkaisut ovat päätekijän yleisvaltuutuksen nojalla valitsemia tai tässä ehdotettuja, eivät käyttäjän erikseen hyväksymiä.

## Process-rooli ja esitieto

Jäädytetty **process / representation**, entry_role none, required M-NUM-02 ja all_of:[M-NUM-02]. Tavoite on lukumäärän yhdistäminen sitä vastaavaan lukusanaan. Oppija saa tunnistaa määrän tai laskea itse; menetelmästä ei tehdä uutta oikeellisuusehtoa. Ei numeromerkkiä ensimmäiseksi välittäjäksi, sana→numeromerkki-tehtävää, spontaanin puheen arviointia tai M-NUM-03:n integraatiota.

OPS: OPH-POPS2014-MATH-VL1-2-S2, peruste 419550 / matematiikka 466344 / kokonaisuus 466963 / S2 469266 / kuvaus.fi kappaleet 1–2. Aiemman PROD01-OPH-MATH12-S2:n yhteysalue tarkistettiin live; rekisterin applies_to-laajennusta ei tehdä tässä. KC-jako on pedagogisesti johdettu. Alue 1–2; sanan lukeminen ja ryhmän erottaminen taustasta ovat reitin piiloriskejä.

## Loikan tarve ja näkyvä malli

Loikka tekee tavararyhmille sanalliset pakkauslaput, jotta Aava tunnistaa mitä ryhmän määrä tarkoittaa. Mallissa alustalla on neljä nappia. Aava käy ne tarvittaessa läpi ja liittää sanalaatan **neljä** koko ryhmän viereen: ”Tässä on neljä nappia.” Ei numeromerkkiä 4 väliaskelena. Ryhmän paikkoja vaihdetaan määrää muuttamatta; sama sana sopii yhä.

Ohjauksessa valmis ryhmä–sana-pari saa näkyä, ja apu osoittaa koko ryhmän. Seuraavassa tehtävässä oppija valitsee sanan itse. Häivytys poistaa mallisanan, lukumäärälaskurin, yksitellen syntyvät valmiit sanat ja ryhmään liitetyn oikean lapun. Laskemiseen ei pakoteta; automaattisesti sanaan päättyvä laskuri tekisi juuri tavoiteltavan vastaavuuspäätöksen oppijan puolesta.

## Yksi selvä oma vastaavuuspäätös

Näkyvä laskettava joukko ja suuret sekoitetut sanalaatat samassa kompaktissa työalueessa. ”Valitse sana, joka kertoo tämän ryhmän määrän.” Ehdotettu äärellinen määräalue on 1–10 sopimuksen tarkistuksen jälkeen; alkuesimerkit pieniä ja selvästi erottuvia. Ei kuvassa näkyvää numeromäärää, numerolaattoja tai alt-tekstiä, joka antaa summan valmiiksi. Oppija valitsee sanan, voi vaihtaa/perua ja lähettää väärän vastauksen. Ei nimetä esinemuotoja tai kirjoiteta lukusanaa.

Esimerkki suunnittelijalle: viisi hajallaan olevaa nappia → **viisi**, ei neljä tai kuusi; tätä totuusmäärää ei kirjoiteta oppijan kysymykseen. Käyttöliittymä antaa rajatun joukon ja koko sanaston, oppija ratkaisee määrän ja sen sanayhteyden. Jos oma laskemisen apureitti tuottaa sanat automaattisesti, se on tukea ja estää tämän saman vastauksen itsenäiseksi nimeämisen. Itse tuotettu laskenta ei ole järjestelmän antama vastaus.

## Prosessin kattavuus, väärät strategiat ja myöhempi paluu

Process ei muutu atomiseksi sillä, että yksittäinen vastaus on deterministinen. Tarvitaan useita määriä ja esityksiä sekä oikein ja väärin vastattavat mahdollisuudet. Jamesin rajatun tyypitetyn association/process-sopimuksen konsultti on **PENDING**; arvokattavuus, kontekstit, esitysmuodot ja prosessin hyväksymisrajat on vielä sovittava mainin kanssa. Tämä tietue ei korvaa sitä tai toteuta kehystä.

Variaatio erottaa koon ja tiheyden määrällisyydestä: harva pienten kohteiden kuuden joukko, tiivis suurten kolmen joukko, sama määrä uudessa muodossa ja eri määrä saman kokoisella alueella. Sama sanalaattapaikka, ryhmän leveys tai suurin esine ei ennusta vastausta. Pieni tuttu kuvio voidaan tunnistaa suoraan; se on sallittu, mutta pelkkää yhden noppakuvion tunnistamista ei yleistetä koko process-tavoitteeseen. Palautteen esimerkki: ”Valittu sana ei vielä vastaa tätä ryhmää. Katsotaan koko ryhmä yhdessä.” Mallin osoittama sana on apua.

Soveltaminen: merkkien sijasta eri kokoiset retkiesineet ilman numeraalivihjettä, vaihtuvat asettelut ja määrät. Sama sanavalinta uudesta joukosta on rajattua esityssiirtoa, ei todiste kaikista määrän esityksistä. Myöhempi itsenäinen ryhmä→sana-valinta uusilla joukoilla mallin poissa ollessa. Opittu vastaavuus ei ole ikuisesti kelvoton muistihakuun; nykyisen faktaretrieval-politiikan käyttö pitää sopia version mukaan. Viive/minimit ovat projektipäätöksiä; ajan kuluminen tai avustettu myöhempi vastaus eivät osoita itsenäistä säilymistä. Pakkauslappu saa valmistua tuetustakin työstä.

## Lähteet ja pääsy

- [OPH JSON](https://eperusteet.opintopolku.fi/eperusteet-service/api/perusteet/419550/kaikki), live 2026-10-26, yllä oleva S2: määrä–sana-yhteyden OPS-alue; ei äärellisen prosessisopimuksen hyväksyntää.
- [R02 / NCETM Cardinality and Counting](https://www.ncetm.org.uk/classroom-resources/ey-cardinality-and-counting/), HTML 2026-10-26, johdanto / tagging / Conservation: koko määrä ja erilaiset asettelut. Ei tämän suomalaisen sanalaattareitin validointia.
- [R01 / IES WWC 2021](https://ies.ed.gov/ncee/wwc/PracticeGuide/26), HTML 2026-10-26, suositukset 1–3: näkyvä määrä–sana-malli ja lyhyt kieli tähän tehtävään.

Tekstisanan tunnistus on rajattu reitti. Vapaaehtoinen yksittäisen sanalaatan nimiluku ei itse kerro mikä sana sopii joukkoon; ääni aluksi pois, ei kuulokuittausta. Ei väitettä spontaanista puheesta, kuulemisesta tai text/audio-reittien täydestä vastaavuudesta. Näppäimistö, vähennetty liike ja selkeät erotettavat kohteet säilyvät. Tekstit alkuperäisiä, ei lainattuja kuvia/tehtäväpankkeja. Toteutus-, kattavuus-, väärän strategian ja 390/1280-renderöintiarvio puuttuvat.

## Process-draftin rajattu tarkennus, 2026-10-26

Uusi päätekijän toimeksianto rajaa tämän nykyiseen esitietopolkuun sopivaan määräväliin **3–6**, molempiin suuntiin, yhteensä kahdeksan omaa vaadittua matching-tapausta. Yllä ollut 1–10-laajennusehdotus ei koske nyt kirjoitettua draftia. M-NUM-02 pysyy required-esitietona ja all_of-ryhmänä; ei Give-N-rakentamista, numerovälivastausta tai lapsitaitojen automaattista hyvitystä. Päätekijän ilmoituksen mukaan rajatun capability/deck-konsultin scoped-portti on suljettu; tämän kortin vanha PENDING säilyy historiallisena suunnittelumerkintänä.

Alkuperäinen kokonainen pakettiehdotus on M-NUM-QTY-WORD.draft.yaml ja lähde-/validointisivutieto B02-process-sources.draft.yaml. Mallikansi näyttää määrät kolme, neljä, viisi ja kuusi molempiin suuntiin. Soveltaminen vaatii ensimmäisen opetetun kolmen faktan aidon virheparin korjauksen molemmissa suunnissa kolmesta vaihtoehdosta. Delayed-näyte kattaa kolme/kuusi molempiin suuntiin, vähintään neljä uutta tuetonta havaintoa 24 h jälkeen. Näyte ei todista kaikkien neljän faktan säilymistä; 3 onnistumista / 2 pohjaa eivät korvaa kahdeksaa vaadittua tapausta. Fast path on pois.

Tila **AUTHORED_DESIGN_PENDING_IMPLEMENTATION_REVIEW**. Muistissa tehty käännös käyttää erikseen ilmoitettuja väliaikaisia lähdetietueita eikä aktivoi pakettia. Main omistaa lähteiden lisäyksen, canonical-admission ja henkilökohtaisen/renderöidyn/native-portin. Ei ihmishyväksyntää, kuulemis-/suullisen tuotannon väitettä, laajaa ei-visuaalista vastaavuutta tai node DONE -merkintää.
