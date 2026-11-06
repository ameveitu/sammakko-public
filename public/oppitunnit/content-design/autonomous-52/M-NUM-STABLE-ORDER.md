CURRENT B01: ENGINEERING_COMPLETE / HUMAN_REVIEW_PENDING; see actual implementation notes at end. Original design proposal below is retained as historical planning material.

# M-NUM-STABLE-ORDER — Sanat pysyvät järjestyksessä

Versio 1.0, 2026-10-26. NEW52, alkuperäinen suomenkielinen sisältö. AUTHORED / SELF_REVIEWED; riippumaton sisältökatselmus ja toteutuksen vahvistus puuttuvat.

## Tavoite ja rajaus

Jäädytetty **atomic / foundation**, ei esitietovaatimuksia. Oppija koostaa suomen lukusanat tavalliseen järjestykseen yhdestä kahdeksaan ilman esineiden seuraamista. Kymmenen sanan valikoima ei laajenna ydintavoitetta kymmeneen. Ei kohdistuksen, numeromerkkien, kardinaliteetin, ääntämisen tai spontaanin suullisen muistamisen väitettä. Sanan tunnistaminen on esitetyn reitin piiloriski; kirjoittamista tai lukunopeutta ei arvioida.

OPS: OPH-POPS2014-MATH-VL1-2-S2; peruste 419550 / matematiikka 466344 / vuosiluokkakokonaisuus 466963 / S2 469266 / kuvaus.fi kappaleet 1–2, PROD01-OPH-MATH12-S2. Alue 1–2 ei määrää täsmävuotta. Atominen erottelu on pedagoginen johdos.

## Aavan tarve ja työstetty esimerkki

Aava kokoaa Loikan kanssa retken laskulorun. Irralliset sanat palautetaan järjestykseen myöhempää laskemista varten. ”Rakenna laskusanat yhdestä kahdeksaan.” Oma jono tallentuu retkivihkon loruriviksi. Esinejoukkoa ei lasketa; valmis loru ei vielä tarkista retkitarvikkeita.

Aava painaa **yksi**, **kaksi**, **kolme**, **neljä**. ”Kolmen jälkeen tulee neljä.” Vertaa jonoon yksi–kaksi–neljä: kolme jäi väliin. Ohjatussa jatkossa lisätään viisi ja kuusi, lopuksi seitsemän ja kahdeksan sekä näytetään koko tavoitejono. Pyydetty apu näyttää ja haluttaessa lausuu lyhyen puuttuvan osan. Pelkkä väärän vastauksen hylkäys ei opeta puuttuvaa sanaa.

## Todellinen tuen vähennys ja vapaa koostaminen

Ohjatussa vaiheessa malli tai valmis alku voi näkyä: yritykset ovat tuettuja. Seuraavassa tehtävässä poistuvat mallijono, täytetty alku ja seuraavan sanan korostus. **Kymmenen kompaktia sekoitettua sanalaattaa**, sama tuttu työalue ja neutraali **Valmis**. Laatasta lisätään omaan jonoon yksi sana; sanat ovat uudelleen käytettäviä. **Peru viimeinen** säilyy. Väärä järjestys, toisto, poisjättö ja väärä lopetus ovat mahdollisia.

Ei valmiiden kokonaisten jonojen arvailua, oikein järjestettyä pankkia, vaihtoehtojen hupenemista tai seuraavan sanan automaattista täyttöä. Oppija valitsee jokaisen seuraajan. Tarjottu sanasto tukee tunnistamista, joten näyttö on rajattua omaa koostamista, ei spontaania puhetta. Oman keskeneräisen jonon tarkistus ja korjaus on sallittua työtä ilman järjestelmän järjestysvihjettä. Sanajonossa ei ole kohteiden valintatilaa tai tarpeetonta tyhjennystä.

Yksittäisen sanalaatan vapaaehtoinen nimiluku tarjoaa pääsyn sanaan, ei oikeaa seuraajaa. Ääni on pois aluksi eikä sitä kuitata kuulluksi. Mallijonon peräkkäinen kuuntelu tai täsmävastauksen näyttäminen on järjestysapua ja säilyttää altistustiedon. Tutkimisen automaattinen laskuri on tuettu, vaikka oppija itse painaisi kaikki askeleet.

## Erottavat tarkistukset, siirto ja viive

Adversaariset strategiat: paina kaikki kymmenen, seuraa ruudun paikkaa, toista edellinen sana, jätä kolme pois tai anna kahdeksan sanaa väärässä järjestyksessä. Näiden pitää voida epäonnistua. Vaihda laattojen sijainteja tapausten välillä, ei kesken näppäimistötoiminnan. Ei jatkuvaa oikein/väärin-palautetta, joka paljastaisi haettavan seuraajan.

Säilytä nykyinen 3 itsenäistä täyttä yksi–kahdeksan-jonoa vähintään 2 pohjasta, count_stable_order. Rajattu siirto **neljän jälkeen kahdeksaan** tuottaa viisi–kuusi–seitsemän–kahdeksan; annettua neljää ei kopioida. Tunniste count_stable_continuation ei todista puuttuvan alkuosan muistamista. Tarinanimen tai laattapaikan vaihto ei ole laaja siirtovaikutus.

Myöhemmin 2 itsenäistä täyttä jonoa aikaisintaan 24 h hankinnan jälkeen. Opetettu kiinteä jono saa myöhemmin olla muistihakutehtävä: sitä ei voi vaatia ikuisesti ennennäkemättömäksi. Nykyisen mallialtistuspolitiikan korjaus vaatii päätekijän versioidun päätöksen ja regressiotarkistuksen. Heti näkyvästä mallista kopioitu tai korjatusta vastauksesta toistettu jono ei muutu itsenäiseksi uudella siemenellä. Uusi oma suoritus on havaittava; ajan kuluminen ei yksin osoita säilymistä. Kynnykset ja 24 h ovat projektivalintoja.

## Lähdekartta ja avoin todentaminen

- [OPH/ePerusteet](https://eperusteet.opintopolku.fi/eperusteet-service/api/perusteet/419550/kaikki): yllä oleva rekisterissä tarkistettu S2; ei tarkkaa kahdeksan sanan tavoitetta.
- [NCETM Cardinality and Counting](https://www.ncetm.org.uk/classroom-resources/ey-cardinality-and-counting/), R02, HTML tarkistettu 2026-10-26, ”saying number words in sequence”: sanajono erotetaan esineiden laskemisesta. Ei suomenkielisen painiketehtävän validointia.
- [IES/WWC 2021](https://ies.ed.gov/ncee/wwc/PracticeGuide/26), R01, suositukset 1–2, HTML tarkistettu 2026-10-26: lyhyt sanajonomalli ja tarvittaessa opetettava jatko tässä solmussa.
- [IES/WWC 2007](https://ies.ed.gov/ncee/wwc/PracticeGuide/1), R04, suositukset 1–2 ja 5b, HTML tarkistettu 2026-10-26: myöhempi muistihaku sekä mallin ja oman järjestämisen vuorottelu. Ei sovelluksen vaikuttavuuden tai tarkkojen kynnysten validointia.

Domainin fi-1-10-v1-sanasto, ei numeromerkkejä sanalaattojen apuvihjeiksi. Näppäimistö, isot osumapinnat, vähennetty liike ja rauhallinen näkymä säilyvät. Tekstit ja esimerkit ovat alkuperäisiä; ei lähteiden kuvia tai tehtäväpankkeja. Todennettaviksi jäävät tyhjä itsenäinen alku, 390 px:n laattatyöalue, tuen poistuminen, oikeasti sallittu virhejono, opettava apu ja myöhempi kelpoinen tapahtuma. Näitä runtime-tarkistuksia ei suoritettu tässä työssä.


## Toteutettu B01-reitti — 2026-10-26

ENGINEERING_COMPLETE, HUMAN_REVIEW_PENDING / NOT_RELEASE_READY. Nykyinen hyväksytty rajaus: Learner-reconstructed conventional sequence from full reusable vocabulary, followed by unassisted after-word continuation and genuine later-check route. No spontaneous speech claim.

Toteutuksessa käytetään yllä olevaa suunnitelmaa rajattuna: yhteinen valmisteltu rantakuva ja pysyvä solmukohtainen seurausteksti, ei kaikkia kortin ehdottamia esineiden pakkaus-/sovellusanimointeja. Nykyisen käyttöliittymän ohjeistus, virhepalaute ja esimerkit on katselmoitu erikseen; vanhan lomakkeen manuaalista tyhjennystä/kuuntelupainiketta ei tarjota uutena reittinä. Vrt. ADR-0021/0022 ja hyväksytyn reitin rajaukset AUTONOMOUS_52_STATE.json:ssa.

Todisteet: reports/autonomous-52/B01/final-validation-manifest.json (1094yksikkötestiä,67nativeE2E,190samatoteutussyötettä), riippumaton source-katselmus repair-feedback-architecture-review.md, aikuisen AI-avusteinen rendered-katselmus teaching-fixes-final-review.md ja M3-lisäys, nykyiset390/1280kuvat sekä oikeista teknisistä tapahtumista johdettu journeys/design-native02/M-NUM-STABLE-ORDER.json. Katselmukset eivät ole lapsi-/opettajatutkimus tai vaikuttavuustulos. Oppijan ymmärtäminen, täydellinen saavutettavuus ja julkaisuportit odottavat erillistä näyttöä.
