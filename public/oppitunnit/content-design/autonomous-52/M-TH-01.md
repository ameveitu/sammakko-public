# M-TH-01 — Sama tai eri pyydetyn ominaisuuden mukaan

Versio 1.0, 2026-10-26. **AUTHORED_DESIGN_PENDING_IMPLEMENTATION_REVIEW**. NEW52 / ADR-0019 / B02 PLAN. Alkuperäinen suomalainen suunnitelma, ei riippumaton sisältöhyväksyntä, ihmishyväksyntä, DONE tai toteutuskuitti. Rutiiniratkaisut ovat päätekijän yleisvaltuutuksen nojalla valitsemia tai tässä ehdotettuja, eivät käyttäjän erikseen hyväksymiä.

## Tavoite, rooli ja OPS

Jäädytetty **atomic / foundation**, entry_role foundation, ei suhteita tai prerequisite_groups-esitietoja. Tavoite on yhtäläisyyksien ja erojen havaitseminen. Ensimmäinen rajattu toteutus vertaa näkyviä kohteita **nimetyn ominaisuuden** mukaan: sama/eri muoto tai sama/eri koko suhteessa malliin. Se ei osoita yleistä loogista ajattelua, piilosäännön keksimistä, kaikkia luokittelutapoja tai kuvioiden nimeämistä. Tämä on laajan otsikon rajattu operationaalinen tulkinta, joka on vielä sisältöarvioitava.

OPS-luokat 1–6: OPH-POPS2014-MATH-VL1-2-S1 ja OPH-POPS2014-MATH-VL3-6-S1. Live-paikantimet perusteessa 419550 / matematiikka 466344: kokonaisuus 466963 / S1 469265 / kuvaus.fi sekä kokonaisuus 466962 / S1 469269 / kuvaus.fi. Molemmat käsittelevät yhtäläisyyksiä, eroja ja vertailua. Ne eivät määrää tämän tehtävän toimintoja tai täsmällistä opetusvuotta. Ohjeen ominaisuussanan ymmärtäminen ja kuvan erottaminen ovat piiloriskejä; varttuneemmalle rauhallinen esitys samalla matemaattisella totuudella.

## Aavan tarve ja näkyvä malli

Aava kokoaa reittitaulun merkkipareja. Tällä kertaa parien pitää olla samanmuotoiset; väri tai koko saa vaihdella. Mallina pieni vihreä kolmio: ehdokkaina suuri ruskea kolmio ja pieni vihreä ympyrä. Aava valitsee suuren kolmion ja näyttää ääriviivat: ”Muoto on sama, vaikka koko ja väri vaihtuvat.” Pari siirtyy reittitauluun. Seuraavassa mallissa kysymys vaihtuu kokoon: sama muoto ei enää yksin ratkaise.

Ohjauksessa yksi ominaisuus kerrallaan, ääriviivat tai kokovertaus näkyvät pyynnöstä. Oppija valitsee itse vertailukohteen; väärä kohde on sallittu. Häivytys poistaa päällekkäisen mallikuvan ja oikean ominaisuuden korostuksen mutta **säilyttää tehtävässä kerrotun vertailusäännön**. Nimetyllä säännöllä vertailu on tavoite; säännön kertominen ei anna oikeaa vastauskohdetta.

## Kevyt itsenäinen tarkistus ja väärät strategiat

Näkyvä mallimerkki ja kolme suurta ehdokasta samassa työalueessa. Ohje ”Valitse samanmuotoinen merkki” tai ”Valitse merkki, jonka koko on eri”. Oppija napauttaa kohdetta ja voi vaihtaa/perua ennen Valmis-toimintoa. Ei nimeämiskenttää, raahauspakkoa tai lukemisnopeuden arviointia. Käyttöliittymä antaa säännön ja kuvat; oppija ratkaisee vastaako ominaisuus sitä. Näytä sekä yhtäläisyyden että eron tapauksia, ei aina-sama-vastausperhettä.

Vaihtele häiritseviä värejä ja kokoja toisistaan riippumatta. Samanvärinen vääränmuotoinen ehdokas erottaa väristrategiaa; samankokoinen väärä muoto erottaa kokostrategiaa. Oikea vastaus ei saa olla aina vasemmalla tai ainoa suuri kuva. Muototehtävässä samat hahmot ovat aidosti samankaltaisia mittakaavaa lukuun ottamatta; kokotehtävässä muoto pidetään samana, jotta ”koko” ei tarkoita vuoroin korkeutta, pinta-alaa tai massaa. Värin nimeäminen ei ole itsenäinen tavoite eikä väri ainoa tiedon kantaja.

Lähetyksen jälkeinen apu: ”Etsimme nyt samaa muotoa. Väri saa olla eri. Katsotaan reunaa yhdessä.” Se paljastaa olennaisen vertailuvihjeen ja kirjaa avun. Yksittäinen värin seuraaminen on tehtäväkohtainen havainto, ei lapsen pysyvä ominaisuus.

## Soveltaminen, myöhempi paluu ja rajat

Soveltaminen vaihtaa merkit neutraaleihin tavarasiluetteihin ja pitää säännön näkyvissä: etsi samanmuotoinen, sitten eri kokoinen vastaavalla muodolla. Uusi koriste ei yksin ole siirtonäyttö; relevantin ja häiritsevän ominaisuuden yhdistelmän täytyy muuttua. Myöhemmin uusi itse ratkaistu sama/eri-sarja ilman mallia, molempia ominaisuuksia ja vastauskategorioita. Kattavuus ja viive ovat päätekijän projektipäätöksiä; yksi oikea pari tai pelkkä kalenteriaika ei osoita säilymistä.

Tuettu työ saa täydentää Aavan taulua; due review ei riko sitä. Kohteet, ominaisuudet ja suhteet tulevat tyypitetystä domainista, eivät kuvatekstin tai värin oletuksista. Säilytä näppäimistö, selkeät ääriviivat, peruminen, vähennetty liike ja ääni vapaaehtoisena/aluksi pois. Ei väitettä täydestä ei-visuaalisesta vastaavuudesta.

## Solmukohtainen lähdekartta

- [OPH JSON](https://eperusteet.opintopolku.fi/eperusteet-service/api/perusteet/419550/kaikki), live 2026-10-26: yllä olevat kaksi S1-osiota, OPS-alue. Tämän nimettyyn ominaisuuteen rajatun tehtävän kattavuus on projektitulkinta.
- [R01 / IES WWC 2021](https://ies.ed.gov/ncee/wwc/PracticeGuide/26), HTML 2026-10-26, suositukset 1–3: lyhyt kielellinen sääntö ja tarkoituksenmukainen vertailukuva, ei koko vuosiluokkien 1–6 polun validointi.
- [R03 / NCETM Measures](https://www.ncetm.org.uk/classroom-resources/ey-measures/), HTML 2026-10-26, Recognising attributes: nimettyjen ominaisuuksien erottelu. Sivua ei käytetä yleisen muotoluokittelun tutkimusnäyttönä.

Alkuperäiset suomalaiset tilanteet, ei lainattuja kuvia tai kysymyspankkia. Tarvitaan toteutuksen ominaisuustotuuden, säännönvaihdon, molempien vastauskategorioiden ja mobiilin tarkistus. Laajemman KC-otsikon kattavuuden hyväksyntä jää avoimeksi.
