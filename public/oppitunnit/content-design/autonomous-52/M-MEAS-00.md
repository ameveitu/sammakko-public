CURRENT B01: ENGINEERING_COMPLETE / HUMAN_REVIEW_PENDING; see actual implementation notes at end. Original design proposal below is retained as historical planning material.

# M-MEAS-00 — Reilu pituusvertailu

Versio 1.0, 2026-10-26. NEW52-suunnittelutietue, alkuperäinen suomenkielinen sisältö. AUTHORED / SELF_REVIEWED; toteutuksen ja riippumattoman sisältökatselmuksen vahvistus puuttuu. Ei canonical-muutos.

## Tavoite, rooli ja esitiedot

Jäädytetty **atomic / foundation**, aloitussolmu ilman required-esitietoja. M-TH-01 on vain strong-tuki. Tavoite on kahden kohteen saman nimetyn ominaisuuden suora vertailu ja reilun asetelman perustelu. Nykyinen toteutusraja on pituus: pidempi, lyhyempi, yhtä pitkä sekä pituuden säilyminen siirrossa ja käännössä. Ei mittalukua, viivainta, numerovastausta, standardiyksiköitä tai yksikkömuunnoksia. Ei näyttöä kaikkien mitattavien ominaisuuksien hallinnasta.

OPS: OPH-POPS2014-MATH-VL1-2-S3; peruste 419550, matematiikka 466344, vuosiluokkakokonaisuus 466963, S3 469267, kuvaus.fi / mittaamista käsittelevä kappale 3. Paikannin on aiemmin tarkistettu PROVENANCE_AUDIT.md:ssa; erillinen KC ja graafi ovat pedagogista jäsennystä. Alue 1–2 ei määrää täsmäikää. Vertailusanat, kuvan hahmottaminen ja säätimien käyttö ovat piiloriskejä: käyttö näytetään ilman lukemiskoetta.

## Loikan tarve, teko ja seuraus

Loikka ja Aava valitsevat kahdesta suorasta nauhasta pidemmän retkiviirin ripustamiseen. Nauhat ovat pöydällä eri kohdissa. Oppija vertaa ja valitsee; valittu nauha siirtyy viirin sidontaan. Yhtä pitkien tapauksessa kumpikin kelpaa. Avustettu onnistuminenkin valmistaa viirin, mutta se ei myönnä hallintaa. Virhe ei pura aiempaa työtä.

## Työstetty esimerkki ja tuen vähennys

A alkaa oikeampaa ja sen kärki ulottuu aluksi B:tä kauemmas, vaikka B on pidempi. Aava sanoo: ”Vertaan pituutta. Siirrän toiset päät kohdakkain.” Näkyvä siirto säilyttää molempien pituudet. Nyt B ulottuu yhteisestä alusta kauemmas: ”B on pidempi.” Käännetään molemmat toiseen suuntaan: B on yhä pidempi. Mittalukuja ei näytetä.

Ohjauksessa oppija siirtää nauhoja tai valitsee **Kohdista päät**. Pyydetty apu näyttää yhteisen lähtökohdan ja mallin. Uudessa tapauksessa poistuvat lähtökohtaopaste ja ratkaisumalli; kohdistustoiminto jää. Yksi napautus saa tehdä valitun siirron: arvioitavana ovat vertailutavan päätös ja tuloksen tulkinta, eivät hienomotoriikka tai koordinaatin kirjoittaminen.

## Itsenäinen tarkistus, siirto ja virhestrategiat

Ohje antaa tavoitteen: ”Selvitä, kumpi nauha on pidempi.” Se ei kerro vastausta. Oppija saa kohdistaa, siirtää, perua ja lähettää väärän vastauksen. Itse valittu kohdistuskomento voi osoittaa yhteisen vertailukohdan menetelmän valintaa, ei vapaata käsin kohdistamista. Pelkkä automaattisesti kohdistetun kuvan avaaminen ei osoita menetelmävalintaa eikä ansaitse fair_alignment-tunnistetta.

Vaihtele pidempää puolta, vastauspaikkoja, yhtäsuuruutta ja molempien suuntaa 0/180 astetta. Eri alkukohdat suosivat välillä väärää päätepäätelmää; paksuus ja väri eivät ennusta tulosta. INDEP-SAME-pohjan ohje ei saa paljastaa, että vastaus on aina ”yhtä pitkät”. Ominaisuuden tunnistamiselle tarvitaan oma vastauspäätös, ei kohdistuksesta pääteltyä tunnistetta.

Palautteen esimerkki lähetyksen jälkeen: ”Kärjet olivat eri kohdissa jo alussa. Kokeile siirtää päät kohdakkain.” Tämä paljastaa menetelmän ja tekee yrityksestä tuetun. Älä väitä, ettei eri kohdissa olevien nauhojen pituuksia voisi koskaan päätellä. Yhteinen alku on riittävä vertailutapa, ei ainoa matemaattisesti mahdollinen.

Säilytä nykyinen vähintään 3 itsenäistä onnistumista / 2 pohjaa; attribute_identified, fair_alignment, misleading_placement, length_invariant; 1 siirtotapaus; myöhemmin 2 onnistumista aikaisintaan 24 h hankinnan jälkeen ilman apua. Köysien suoristamistavan valinta on rajattua menetelmän siirtoa, ei fyysisen suoristamisen näyttöä. Myöhempi tarkistus käyttää uutta harhaanjohtavaa asettelua ja kohdistuspäätöstä. Ajan kuluminen yksin ei ole näyttö. Tarkat kynnykset ovat projektipolitiikkaa.

## Esitys, pääsy ja lähdekartta

Molemmat nauhat käyttävät samaa mittakaavaa ja domainin pituuksia/suuntia. Vasemmalle suunnattu vertailu ei saa käyttää oikeanpuoleisimman kärjen sääntöä. Napautus, näppäimistö, peruminen ja vähennetty liike säilyvät. Ääni on vapaaehtoinen / aluksi pois. Ei-visuaalinen vastaavuus on osoittamatta. Historiallinen M2:n mittapalojen ei-visuaalinen pääsy kuuluu M-MEAS-01:n yksikköreittiin: tämä vertailu ei ratkaise sitä eikä muutu sen vuoksi numerotehtäväksi.

- [OPH/ePerusteet](https://eperusteet.opintopolku.fi/eperusteet-service/api/perusteet/419550/kaikki): yllä oleva S3-paikannin, aiempi PROVENANCE_AUDIT.md:n tarkistus. PROD01-OPH-MATH12-S3:n applies_to on vain M-MEAS-01; sen hyväksyntää ei laajenneta tähän.
- [NCETM Measures](https://www.ncetm.org.uk/classroom-resources/ey-measures/), R03, HTML tarkistettu 2026-10-26, ”Comparing amounts of continuous quantities”: yhteinen alkukohta suorassa vertailussa. Opetusohje, ei vaikutuskoe.
- [IES/WWC 2021](https://ies.ed.gov/ncee/wwc/PracticeGuide/26), R01, suositukset 1–3, HTML tarkistettu 2026-10-26: konkreettinen vertailumalli ja täsmällinen kieli tässä tehtävässä; ei napautusreitin validointia.
- [IES/WWC 2007](https://ies.ed.gov/ncee/wwc/PracticeGuide/1), R04, suositukset 1–2, HTML tarkistettu 2026-10-26: mallin ja oman vertailun vuorottelu sekä myöhempi kertaus, ei täsmällistä 24 h -rajaa.

Tekstit/esimerkit ovat alkuperäisiä, ei kopioituja kuvia tai tehtäväpankkia. Kuvien lisenssejä ei hyväksytä tällä tietueella. Toteuttajan tarkistettavaksi jäävät mobiili-/työpöytäkuvat, väärä päätestrategia, kohdistuksen tapahtumajono ja domainvertailu. Näitä ei suoritettu sisältötyössä; oppimisvaikutusta ei väitetä.


## Toteutettu B01-reitti — 2026-10-26

ENGINEERING_COMPLETE, HUMAN_REVIEW_PENDING / NOT_RELEASE_READY. Nykyinen hyväksytty rajaus: Visual direct length comparison: selected reference operation, actual geometry/length, attribute identification, and text-only rope/delayed method choice. Not free fine-motor placement or all quantities.

Toteutuksessa käytetään yllä olevaa suunnitelmaa rajattuna: yhteinen valmisteltu rantakuva ja pysyvä solmukohtainen seurausteksti, ei kaikkia kortin ehdottamia esineiden pakkaus-/sovellusanimointeja. Nykyisen käyttöliittymän ohjeistus, virhepalaute ja esimerkit on katselmoitu erikseen; vanhan lomakkeen manuaalista tyhjennystä/kuuntelupainiketta ei tarjota uutena reittinä. Vrt. ADR-0021/0022 ja hyväksytyn reitin rajaukset AUTONOMOUS_52_STATE.json:ssa.

Todisteet: reports/autonomous-52/B01/final-validation-manifest.json (1094yksikkötestiä,67nativeE2E,190samatoteutussyötettä), riippumaton source-katselmus repair-feedback-architecture-review.md, aikuisen AI-avusteinen rendered-katselmus teaching-fixes-final-review.md ja M3-lisäys, nykyiset390/1280kuvat sekä oikeista teknisistä tapahtumista johdettu journeys/design-native02/M-MEAS-00.json. Katselmukset eivät ole lapsi-/opettajatutkimus tai vaikuttavuustulos. Oppijan ymmärtäminen, täydellinen saavutettavuus ja julkaisuportit odottavat erillistä näyttöä.
