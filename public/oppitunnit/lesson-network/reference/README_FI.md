# Solin tehtävä: 690 KC:n HTML5-oppituntiverkon pohja

Päiväys: 28.10.2026. Tämä on toteutustehtävän handover, ei valmis oppituntiverkko.

## Anna Solille

Liitä tämä paketti ja anna päätehtäväksi `SOL_PHASE1_PROMPT.txt`. Se sisältää koko toteutusohjeen. Solin pitää toteuttaa ensimmäinen vaihe valmiiksi kaikkien 690 KC:n osalta ja päättää työ ennen sisällöntuotantovaihetta.

**Uusi järjestys korvaa aiemman ohjeen jatkaa 690 KC:n opetussisältöjen tuotantoa heti.** Nyt rakennetaan sivut, navigaatio, opettajanäkymän pohja, tietosopimukset ja varmennettavien pelilinkkien rajapinta. Vertailu verkon oppimateriaaleihin ja varsinainen pedagoginen sisältö tulevat erillisessä seuraavan vaiheen handoverissa, jossa nimetään käytettävä katselmoitu Lite-versio.

## Linkkien suuntaa koskeva oletus

Käyttäjän viestissä sekä ylä- että alalinkit nimettiin lapsiksi. Tässä tehtävässä yläreunaan tulkitaan nykyistä KC:tä suoraan tukevat esitieto- ja tukiaiheet; alareunaan ne KC:t, joita nykyinen aihe suoraan tukee. Oletus on tehtävässä näkyvästi kirjattu. Riippuvuusverkko, taksonomia ja integraation osataitorakenne pysyvät erillisinä.

## Mitä valmistuu ensimmäisessä vaiheessa?

| Valmistuva asia | Sisältö |
| --- | --- |
| 690 HTML5-sivupohjaa | Yksi oikea, suoraan avattava `.html`-tiedosto kutakin kanonista KC:tä kohti. |
| Suorat ylä- ja alalinkit | Kanoniset suhteet molempiin suuntiin, tyypit, vahvuudet ja AND/OR-ryhmät säilyttäen. |
| Hakemisto | Haku ja suodatus KC-tunnuksella, nimellä, oppiaineella ja metatiedoilla. |
| Opettajanäkymä ja esitystilapohja | Sama KC ja sisältörakenne; tekniset tiedot erillisessä opettajan paneelissa. |
| Pelilinkkien sopimus | Lite ja täysi Sammakko erikseen, oikea saatavuus ja varmennuksen tila. |
| Jatkettava tuotantolooppi | Yhteinen malli, erilliset KC-tietueet, checkpointit, toistettava generointi ja koko joukon tarkistus. |
| Seuraavan vaiheen rakenteet | Tyhjät tutkimus-, sisältö-, tehtäväperhe- ja simulaatiopaikat. |

Sivupohjan valmistuminen ei merkitse opetussisällön, mikropelin, oppimistuloksen tai opettajan hyväksynnän valmistumista. Uuden oppituntisisällön tila jää `awaiting_reviewed_handover`, ja uusi sisältörunko on tyhjä. Kanoniset nimet ja olemassa oleva metatieto saavat näkyä. Aiemmat Sol-luonnokset säilytetään erillisinä viitteinä; niitä ei ylikirjoiteta tai nosteta automaattisesti hyväksytyksi sisällöksi.

## Tärkeät lähdehavainnot

Kanonisessa verkossa on 690 KC:tä ja 1 287 tyypitettyä suhdetta. Oppiainerajan ylittäviä suhteita on 127. Esitietoryhmiä on 599, joista 12 on OR-ryhmiä. Dynaamisia sääntöjä on 18.

Koko tukiverkkoa ei voi käsitellä yhtenä syklittömänä puuna. Alkuaineen ja atomin välillä on vastakkaissuuntaiset required- ja strong-suhteet. Molemmat säilytetään. Sol ei saa poistaa suhdetta vain saadakseen kaikki suhteet topologiseen järjestykseen.

Lite 181 ei vielä tue jaettavaa KC-kohtaista peliosoitetta. Täyden Sammakon toimitetussa lähteessä on tuoreella sivulatauksella toimiva `#journey/<KC-ID>`-sopimus, mutta vain runtimeen toteutetuille KC:ille. Tämän handoverin yhteydessä ei varmennettu julkaistua palveluosoitetta tai sen saatavilla olevia sisältöpaketteja.

Siksi oppituntiverkon omat linkit toteutetaan toimiviksi nyt. Pelilinkkien käyttöliittymä ja rajapinta toteutetaan, mutta puuttuvaa Lite-reittiä ei esitetä toimivana. Sen pieni runtime-muutos on erotettu tiedostoon `RUNTIME_BRIDGE_HANDOFF.txt`.

Paikallisen esikatselun linkki ja oppilaiden laitteilla toimiva osoite erotetaan myös toisistaan. `localhost`- tai `file:`-osoite saa olla kehittäjän esikatselulinkki, mutta sitä ei merkitä luokalle jaettavaksi osoitteeksi. Ensimmäinen vaihe voi valmistua paikallisena toteutuksena, vaikka julkaisuosoite ja peliyhteydet odottaisivat vielä integraatiota.

## Paketissa

- `SOL_PHASE1_PROMPT.txt`: täydellinen englanninkielinen toteutustehtävä.
- `PHASE_CONTROL.json`: tämän vaiheen sallitut ja myöhemmäksi jätetyt työt.
- `CONTRACT.json`: sivun, tilojen, navigaation ja myöhempien sisältöpaikkojen sopimus.
- `GRAPH_FACTS.json`: nykyisen kanonisen aineiston tarkistetut luvut ja erityistapaukset.
- `RUNTIME_LINKS.json`: todettujen ja vielä puuttuvien pelireittien erilliset tilat.
- `RUNTIME_BRIDGE_HANDOFF.txt`: Lite-reitin ja opettajanäkymän myöhempi integraatiotehtävä.
- `ACCEPTANCE_CASES.json`: ensimmäisen vaiheen hyväksymistarkistukset.
- `HANDOVER_MANIFEST.json`: lähteiden identiteetit ja tämän paketin tarkoitus.
- `inputs/`: kanoninen 690-graafi, Lite 181 -rajaus ja viime katselmoinnin löydökset.

## Seuraava handover

Nimeä siinä käytettävä katselmoitu Lite-lähdeversio, 181 KC:n materiaali- ja tehtäväperherajaukset, tarvittavat pelireitit ja erillinen tehtävä aloittaa vaihe 2. Silloin Solin tutkimus- ja sisällöntuotantolooppi tuottaa ikä- ja esitietotasoon sovitetut oppitunnit, havainnollistukset, animaatiot ja perustellut simulaatiot tämän verkon päälle. Kullekin 181 KC:lle tehdään näkyvä yhteensovitus kyseisen Lite-materiaalin kanssa.
