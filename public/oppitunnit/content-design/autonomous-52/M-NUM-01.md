CURRENT B01: ENGINEERING_COMPLETE / HUMAN_REVIEW_PENDING; see actual implementation notes at end. Original design proposal below is retained as historical planning material.

# M-NUM-01 — Sanat ja kohteet kulkevat yhdessä

Versio 1.1, 2026-10-26; päätekijän uuden yleisvaltuutuksen nojalla valitsema kevyt paritarkistus. NEW52, alkuperäinen suomenkielinen sisältö. AUTHORED / SELF_REVIEWED; ei riippumatonta sisältöhyväksyntää tai toteutuksen vahvistusta.

## Rooli, esitiedot ja tarkka tavoite

Jäädytetty **integration / integration**. Required-esitiedot ovat M-NUM-1TO1 **JA** M-NUM-STABLE-ORDER, myös all_of-ryhmässä. Vanha required_root-merkintä ei tee tästä aloitussolmua: foundation_entry=false ja zero_required_indegree=false. Osataitojen hallinta ei korvaa integraationäyttöä; integraatio ei myönnä lapsi-KC:iden hallintaa takautuvasti.

Oppija tuottaa saman laskentajonon, jossa jokainen kohde saa yhden lukusanan käyttökerran ja sanat etenevät tavallisesti yhdestä alkaen. Alue 3–6 erillistä kohdetta; sanasto yksi–kymmenen. Ei pelkkää lopputuloksen valintaa, kardinaliteetin jäsenjoukkoraporttia, numeromerkkejä tai ääntämisen arviointia. Näyttö on koostettua laskemista tarjotulla sanastolla.

ADR-0011:n prerequisite-readiness-v1 edellyttää ajantasaista yhteensopivaa itsenäistä hankintaa siirtoineen, ei pakollista 24 h odotusta. Canonicalin retained-sanamuodot ovat vanhentuneita; niiden korjaus kuuluu päätekijälle. Tuettu esikatselu saa opettaa puuttuvaa taitoa, mutta ei ohita itsenäisen arvioinnin all_of-ehtoa.

OPS: OPH-POPS2014-MATH-VL1-2-S2; peruste 419550 / matematiikka 466344 / vuosiluokkakokonaisuus 466963 / S2 469266 / kuvaus.fi kappaleet 1–2, PROD01-OPH-MATH12-S2. Jäädytetty source_basis on direct_curriculum; juuri tämä atomijako ja integraatiokynnys eivät ole normitekstiä. Alue 1–2 ei määrää täsmäikää. Piiloriskejä ovat sanan tunnistus ja kahden valinnan käyttö; lukunopeutta ei arvioida.

## Loikan tarve ja konkreettinen esimerkki

Loikka ja Aava valmistelevat polun reittimerkkejä. ”Laske merkit niin, että jokainen saa oman laskusanan.” Oma laskenta tarkistaa valmistellun joukon; merkit siirtyvät valmiiksi reittitaulun viereen. Seuraus ei vielä väitä oppijan ymmärtävän viimeisen sanan koko joukon lukumääräksi. Tuettu työkin saa valmistaa merkit.

Mallissa on lehti, tähti ja ympyrä. Aava valitsee lehden ja **yksi**: ensimmäinen pari kirjautuu ja hetkellinen valinta tyhjenee. Tähti ja **kaksi**, ympyrä ja **kolme**. ”Yksi sana yhdelle merkille. Seuraavalle merkille seuraava sana.” Kohteiden käyntijärjestyksen saa vaihtaa, mutta sanajono pysyy yksi–kaksi–kolme. Malli näyttää teot, ei vain käyttöohjetta.

Vastaesimerkit: lehti–yksi, tähti–kaksi, lehti–kolme antaa oikean sanajonon mutta jättää ympyrän pois. Lehti–yksi, tähti–kolme, ympyrä–kaksi kattaa kohteet mutta rikkoo järjestyksen. Kumpikaan ei täytä yhteistä tavoitetta eikä yksin diagnosoi virheen syytä tai määrää lapsi-KC:n korjausreittiä.

## Tuki, häivytys ja oma parijono

Oletusopetus säilyy yhden kosketuksen automaattisena laskurina/sanana, kohteen häivytyksenä ja lukituksena: vain tuettu tutkiminen. Sitten näytetään yksi kohde–sana-pari yhdessä; oppija jatkaa mallin kanssa. Apu on saatavissa ennen epäonnistumista. Itsenäiseen tarkistukseen poistuvat malli, seuraavan sanan ehdotus, käyntivärit, lukitus ja laskuri.

Ohje: ”Valitse merkki, sitten sen laskusana. Jatka itse ja valitse lopuksi Valmis.” **Napauta yhtä kohdetta → napauta yhtä kymmenestä sanalaatasta → pari kirjautuu ja hetkellinen valinta tyhjenee automaattisesti.** Ei muotojen nimeämistä, erillistä Kuuntele/Käytä-pankkia, toistuvaa tyhjennystä tai lomaketta. Sanalaatat ovat sekoitettuja, neljässä sarakkeessa, noin 140 px:n suunnittelukorkeudella samassa työalueessa kohteiden kanssa; toteutunut 390 px:n sopivuus pitää näyttää.

Kohteet eivät saa käyntimerkintää, järjestysnumeroa, himmennystä, laskurimerkkiä tai hyväksyntäväriä. Aiemman kohteen ja saman sanan voi valita uudelleen. Poisjättö, väärä sana ja aikainen **Valmis** sallitaan. Automaattinen tyhjennys helpottaa syöttöä; se ei valitse seuraavaa kohdetta, lukitse aiempaa tai korjaa jonoa. Puuttuva kohde ei saa täydentyä oikeaksi sanalaattaa painettaessa. Viimeisen parin voi perua. Loki ei saa tarjota itsenäisessä tarkistuksessa käytyjen kohteiden karttaa.

## Näytön kelpoisuus ja siirto

Arvioi todellinen yhteinen pari-/sanajono: yksi kohde per käyttökerta, jokainen kohde kerran ja sanat yksi–N samassa ajallisessa järjestyksessä. Sama kevyt syöttötapa kuin juuressa; **vain integraatiossa** arvioidaan myös sanajärjestys. Automaattinen sana osoittaisi korkeintaan kohdistusta, automaattinen kohde korkeintaan sanajärjestystä. Pelkkä tapahtumamäärä tai lopputulos ei riitä integraatioon.

Säilytä 3 itsenäistä onnistumista vähintään 2 pohjasta / count_integrated; 1 erillinen hajautettujen 3–6 merkin siirto; 2 myöhempää itsenäistä onnistumista aikaisintaan 24 h hankinnan jälkeen. Hajautus on asettelusiirto, ei kaiken laskemisen yleistymisen tai kardinaliteetin näyttö. Variaatio kattaa kohdemääriä ja kulkureittejä. Testaa toistettu kohde oikeilla sanoilla ja kaikki kohteet väärillä sanoilla: molempien on epäonnistuttava. Auto-clear ei saa poistaa virhettä tai lisätä puuttuvaa paria.

Lähetyksen jälkeinen palaute näyttää havaitun eron ja tarjoaa ohjatun parin. Saman korjatun vastauksen toisto pysyy tuettuna, eikä uusi siemen nollaa mallialtistusta. Myöhempi tuettu onnistuminen osoittaa vain tuettua muistamista. Kynnykset/viive ovat projektivalintoja.

## Lähdekartta ja pääsy

- [OPH/ePerusteet](https://eperusteet.opintopolku.fi/eperusteet-service/api/perusteet/419550/kaikki): yllä oleva aiemmin tarkistettu S2; ei projektin integraatiopolitiikan hyväksyntää.
- [NCETM Cardinality and Counting](https://www.ncetm.org.uk/classroom-resources/ey-cardinality-and-counting/), R02, HTML tarkistettu 2026-10-26, erilliset ”saying number words in sequence” ja ”tagging each object”: yhdistetään tässä. Viimeisen sanan kokonaismerkitys jää M-NUM-02:een.
- [IES/WWC 2021](https://ies.ed.gov/ncee/wwc/PracticeGuide/26), R01, suositukset 1–3, HTML tarkistettu 2026-10-26: näkyvä parimalli ja lyhyt toimintakieli tähän integraatioon.
- [IES/WWC 2007](https://ies.ed.gov/ncee/wwc/PracticeGuide/1), R04, suositukset 1–2, HTML tarkistettu 2026-10-26: malliparien jälkeen oma laskenta ja myöhempi tarkistus; ei digitaalisten hallintarajojen tutkimusvalidointia.

Domain määrää kohteet/sanaston molemmissa näkymissä. Näppäimistö tekee samat parit; ääni on vapaaehtoinen, aluksi pois, ei kuulokuittausta. Kohteiden nimiä ei tarvitse tunnistaa tehtävävastauksena. Rauhallinen näkymä, vähennetty liike, isot kohteet ja työn säilyminen näkymävaihdossa kuuluvat suunnitelmaan. Tekstit/esimerkit ovat alkuperäisiä, ulkoisia kuvia ei tuoda. Runtime-, renderöinti-, ei-visuaalinen ja viivetarkistus jäävät toteuttajan ja riippumattoman arvioijan todennettaviksi.


## Toteutettu B01-reitti — 2026-10-26

ENGINEERING_COMPLETE, HUMAN_REVIEW_PENDING / NOT_RELEASE_READY. Nykyinen hyväksytty rajaus: Integrated object coverage and conventional sequence in learner-composed pairs, both prerequisite roots evidence-earned, structural scatter application and actual later-check route.

Toteutuksessa käytetään yllä olevaa suunnitelmaa rajattuna: yhteinen valmisteltu rantakuva ja pysyvä solmukohtainen seurausteksti, ei kaikkia kortin ehdottamia esineiden pakkaus-/sovellusanimointeja. Nykyisen käyttöliittymän ohjeistus, virhepalaute ja esimerkit on katselmoitu erikseen; vanhan lomakkeen manuaalista tyhjennystä/kuuntelupainiketta ei tarjota uutena reittinä. Vrt. ADR-0021/0022 ja hyväksytyn reitin rajaukset AUTONOMOUS_52_STATE.json:ssa.

Todisteet: reports/autonomous-52/B01/final-validation-manifest.json (1094yksikkötestiä,67nativeE2E,190samatoteutussyötettä), riippumaton source-katselmus repair-feedback-architecture-review.md, aikuisen AI-avusteinen rendered-katselmus teaching-fixes-final-review.md ja M3-lisäys, nykyiset390/1280kuvat sekä oikeista teknisistä tapahtumista johdettu journeys/design-native02/M-NUM-01.json. Katselmukset eivät ole lapsi-/opettajatutkimus tai vaikuttavuustulos. Oppijan ymmärtäminen, täydellinen saavutettavuus ja julkaisuportit odottavat erillistä näyttöä.
