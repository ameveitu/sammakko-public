CURRENT B01: ENGINEERING_COMPLETE / HUMAN_REVIEW_PENDING; see actual implementation notes at end. Original design proposal below is retained as historical planning material.

# M-NUM-1TO1 — Jokainen mukaan kerran

Versio 1.1, 2026-10-26; päätekijän uuden yleisvaltuutuksen nojalla valitsema kevyt kohde–sana-paritarkistus. NEW52, alkuperäinen suomenkielinen sisältö. AUTHORED / SELF_REVIEWED; ei riippumatonta sisältöhyväksyntää tai toteutuksen hyväksyntää.

## Tavoite ja jäädytetty raja

**Atomic / foundation**, ei required-, strong- eikä helpful-esitietoja. Oppija kohdistaa yhden itse valitun lukusanan käyttökerran kuhunkin laskettavaan kohteeseen. Sanajärjestys ei kuulu tämän KC:n arviointiin eikä ole esitieto. Ydin- ja siirtoalue 3–8 erillistä kohdetta; sanasto yksi–kymmenen. Ei numeromerkkejä, kardinaliteettia, integroidun laskemisen hallintaa tai spontaanin puheen arviointia.

OPS: OPH-POPS2014-MATH-VL1-2-S2; peruste 419550 / matematiikka 466344 / vuosiluokkakokonaisuus 466963 / S2 469266 / kuvaus.fi kappaleet 1–2, rekisteri PROD01-OPH-MATH12-S2. Atominen jako on pedagogisesti johdettu. Alue 1–2 ei määrää täsmäikää. Kohteiden erottaminen, oman etenemisen muistaminen ja sanan tunnistaminen ovat esitetyn reitin piiloriskejä; ohjausta saa harjoitella pisteyttämättä.

## Aavan tarve, oppijan teko ja seuraus

Aava on tuonut Loikalle reittipalikat ja haluaa, ettei yksikään jää tarkistamatta tai tule mukaan kahdesti. Oppija käy palikat läpi omaa reittiään. Tarkistuksen jälkeen palikat siirtyvät retkipussiin. Avustettukin työ valmistaa pussin; pussi ei todista itsenäistä osaamista.

## Näkyvä malli ja tuettu tutkiminen

Näytä kolme palikkaa. Aava koskettaa vasenta sanalla ”yksi”, keskimmäistä sanalla ”kaksi”, oikeaa sanalla ”kolme”. Mallissa jokaisella palikalla on oma sanan käyttökerta. Tavallinen laskujärjestys antaa mielekkään kokonaismallin, mutta tätä osataitoa ei pisteytetä juuressa.

Vastaesimerkki: vasen–yksi, keskimmäinen–kaksi, vasen–kolme jättää oikean pois. Oikea määrä sanoja ei takaa oikeaa kohdistusta. Arvioijalle erottava oikea tapaus on vasen–kaksi, keskimmäinen–kaksi, oikea–kaksi: kolme eri käyttökertaa kohdistuu kerran kuhunkin palikkaan, joten **kohdistus onnistuu**, vaikka tavanomainen laskeminen ei onnistu. Tätä ei esitellä oikean laskujonon mallina.

Oletusopetus säilyttää helpon yhden kosketuksen: automaattinen laskuri/sana, häivytys ja lukitus auttavat tutkimisessa. Se on aina tuettua. Kun siirrytään omaan tarkistukseen, pieni pisteyttämätön mallipari näyttää uuden syöttötavan. Sitten poistetaan mallipari, seuraavan kohteen osoitus, käyntijäljet, automaattinen sana ja laskuri. Kerro: ”Nyt valitset itse kohteen ja sanan.”

## Kevyt itsenäinen paritarkistus

Ohje: ”Valitse palikka, sitten sille lukusana. Ota jokainen mukaan kerran. Valitse lopuksi Valmis.” **Yksi kohteen napautus → yksi kymmenestä sanalaatasta → parin kirjaus ja hetkellisen valinnan automaattinen tyhjennys.** Ei nimenantamista, erillisiä Kuuntele/Käytä-pankkeja, toistuvaa tyhjennystä tai lomaketta. Neljän sarakkeen kymmenen sanalaatan alue on noin 140 px korkea suunnittelutavoite; oikea sopivuus pitää tarkistaa 390 px:n kuvasta. Kohteet ja sanalaatat pysyvät samassa tiiviissä työalueessa.

Juuressa **mikä tahansa sana ja sanan toistaminen sallitaan**. Kaikki kohteet pysyvät samannäköisinä ja valittavina: ei käyntinumeroita, laskuria, häivytystä tai lukitusta. Saman kohteen voi ottaa uudestaan, kohteen voi jättää pois ja vastauksen lähettää keskeneräisenä. Automaattinen tyhjennys ei valitse seuraavaa kohdetta eikä korjaa aiempaa paria. **Peru viimeinen** ja apu ovat saatavilla. Puuttuva kohde ei saa muuttua automaattisesti oikeaksi kohteeksi sanalaattaa painamalla.

Semantiikka sidotaan päätekijän eksplisiittiseen capabilityyn **correspondence_pairs_v1**, ei kohteen tekstinimeen. Domain arvioi todellisen sisäisen parijonon: yksi kohde per käyttökerta ja jokainen tehtävän kohde täsmälleen kerran; sanan arvoa/järjestystä ei pisteytetä. Pelkkä kohteen napautus ilman oppijan sanavalintaa ei osoita canonicalin koko sanakohdistustavoitetta. Tämä aiempi rajaus on ratkaistu suunnitelmassa parireitillä, ei tavoitetta kaventamalla. Runtime-vahvistus puuttuu.

## Erottavat ja myöhemmät tarkistukset

Kokeile toistettu kohde + puuttuva kohde mutta oikea parimäärä; liian lyhyt/pitkä jono; jokainen kerran väärässä sanajärjestyksessä. Kaksi ensimmäistä epäonnistuvat; viimeinen hyväksytään vain kohdistuksena. Rivissä vasemmalta oikealle kulkeminen on kelvollinen strategia. Siirrossa 3–8 palikkaa ovat hajallaan, ilman päällekkäisyyttä tai numerointia: se koettelee omaa seurantaa, ei yleistä säilyvyyskäsitettä.

Palautteen esimerkki vasta lähetyksen jälkeen: ”Tämä palikka tuli mukaan kahdesti, tämä jäi väliin. Kokeillaan yksi pari kerrallaan.” Näytetty kohdeapu tekee yrityksestä tuetun. Säilytä 3 itsenäistä onnistumista / vähintään 2 pohjaa, 1 hajautettu siirto ja 2 myöhempää onnistumista aikaisintaan 24 h hankinnan jälkeen; vain count_correspondence. Uusi siemen ei poista mallialtistusta. Ajan kuluminen tai tuettu myöhempi onnistuminen ei osoita itsenäistä säilymistä. Tarkat rajat ovat projektivalintoja.

## Lähdekartta ja pääsy

- [OPH/ePerusteet](https://eperusteet.opintopolku.fi/eperusteet-service/api/perusteet/419550/kaikki): yllä oleva aiemmin tarkistettu S2-kartoitus; ei normin määräämää atomijakoa.
- [NCETM Cardinality and Counting](https://www.ncetm.org.uk/classroom-resources/ey-cardinality-and-counting/), R02, HTML tarkistettu 2026-10-26, ”tagging each object with one number word”: kohteen ja käyttökerran yhteys. Ei digitaalisen parireitin validointia.
- [IES/WWC 2021](https://ies.ed.gov/ncee/wwc/PracticeGuide/26), R01, suositukset 1–3, HTML tarkistettu 2026-10-26: näkyvä laskumalli ja lyhyt kohdistuskieli tähän solmuun.
- [IES/WWC 2007](https://ies.ed.gov/ncee/wwc/PracticeGuide/1), R04, suositukset 1–2, HTML tarkistettu 2026-10-26: oma kohdistus mallin jälkeen ja myöhempi tarkistus; ei tarkkojen kynnysten tutkimusperustaa.

Ääni on vapaaehtoinen, aluksi pois; ei kuulokuittausta tai kuulemisen väitettä. Kosketus ja näppäimistö tekevät samat parit, nopeutta ei pisteytetä. Fokus ei saa ilmoittaa ”laskettu”. Domain määrää kohteet ja sanaston. Tekstit/esimerkit ovat alkuperäisiä; ei lainattuja kuvia tai tehtäviä. Todennettaviksi jäävät oikea mobiiliasettelu, no-audio, näppäimistö, virheparit ja avun jälkeisen näytön luokittelu. Täyttä ei-visuaalista vastaavuutta tai vaikuttavuutta ei väitetä.


## Toteutettu B01-reitti — 2026-10-26

ENGINEERING_COMPLETE, HUMAN_REVIEW_PENDING / NOT_RELEASE_READY. Nykyinen hyväksytty rajaus: One-to-one execution with learner-composed object/word pairs from supplied vocabulary; default tap/count support separate. No stable-order, cardinality or oral-production award.

Toteutuksessa käytetään yllä olevaa suunnitelmaa rajattuna: yhteinen valmisteltu rantakuva ja pysyvä solmukohtainen seurausteksti, ei kaikkia kortin ehdottamia esineiden pakkaus-/sovellusanimointeja. Nykyisen käyttöliittymän ohjeistus, virhepalaute ja esimerkit on katselmoitu erikseen; vanhan lomakkeen manuaalista tyhjennystä/kuuntelupainiketta ei tarjota uutena reittinä. Vrt. ADR-0021/0022 ja hyväksytyn reitin rajaukset AUTONOMOUS_52_STATE.json:ssa.

Todisteet: reports/autonomous-52/B01/final-validation-manifest.json (1094yksikkötestiä,67nativeE2E,190samatoteutussyötettä), riippumaton source-katselmus repair-feedback-architecture-review.md, aikuisen AI-avusteinen rendered-katselmus teaching-fixes-final-review.md ja M3-lisäys, nykyiset390/1280kuvat sekä oikeista teknisistä tapahtumista johdettu journeys/design-native02/M-NUM-1TO1.json. Katselmukset eivät ole lapsi-/opettajatutkimus tai vaikuttavuustulos. Oppijan ymmärtäminen, täydellinen saavutettavuus ja julkaisuportit odottavat erillistä näyttöä.
