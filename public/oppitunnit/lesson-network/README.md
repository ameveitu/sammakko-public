# Sammakon oppituntiverkko — nykyinen kehitystila

**Rajaus on tarkka 181 oppituntipaketin ja 181 yleisöesityksen joukko.** Kaikki valitut paketit käyttävät lähteeseen kirjoitettuja rooleja ja vaiheita (`audienceContract: 1`). Kanoninen verkko sisältää edelleen 690 aihetta; muut 509 ovat aihepohjia. LR03:n 11 aiheen kalibrointi ja 170 aiheen siirtojono ovat historiaa, eivät nykyinen toteutusraja.

Kehityshaaran nykyiset löydökset, korjaukset ja lopullisen yhteisajon tulos kirjataan [jatkokatselmuksen raporttiin](../../../docs/releases/launch/review-followup/FINAL_REVIEW_FI.md). Tämä README kuvaa nykyisen lähteen sopimukset ja niiden tarkistuskomennot; se ei nimeä vanhaa B16- tai LR03-ajokertaa nykyversion hyväksynnäksi. Alkuperäinen käyttäjän 8 %:n kiintiötilanteessa pyytämä pysäytys säilyy [HANDOFF_FI.md](../../../docs/releases/launch/HANDOFF_FI.md)- ja [EXECUTION_FI.md](../../../docs/releases/launch/EXECUTION_FI.md)-tiedostoissa historiallisena checkpointina.

`site/` generoidaan lähteistä eikä sitä seurata Gitissä. Koko julkaisun paketointi ja esikatselu kuvataan [osaprojektin ohjeessa](../README.md) ja [toimitusohjeessa](../../../docs/DELIVERY_FI.md). Muuttuneen lähteen tilanne lasketaan uudelleen `lesson-status.json`:iin. `technical_checked` tarkoittaa nykyiseen revisioon sidottua ohjelmiston teknistä tarkistusta; sisältö-/kohdistusarvio, oikea ihmisarvio ja live-julkaisu ovat erillisiä asioita.

## Opettajan valmistelu ja jaettava esitys

Valmistelusivun **Avaa esitys** avaa erillisen `site/presentations/<KC>.html`-dokumentin uuteen välilehteen. Jaa ryhmälle tämä välilehti tai sen ikkuna. Opettajamuistiinpanot, lähde-/KC-metatiedot ja valmistelun navigaatiot poistetaan yleisödokumentin rakenteesta; valmistelu säilyy alkuperäisessä välilehdessä.

Kaikki 181 esitystä näyttävät yhden lähteessä määritellyn opetuksen vaiheen kerrallaan. Lähdesopimus edellyttää, että tehtävään kuuluva annettu tieto, kuva, kysymys ja vastaustoiminto kuuluvat samaan näkyvään kokonaisuuteen. Vastaus tai lisäselitys avataan erikseen. Esityspalkissa ovat vaiheiden vaihto, tauko, alustus, linkin kopiointi ja koko näyttö. Pitkä vapaaehtoinen selitys saa vierittyä sisältöalueella, kun sisältö ja toiminnot ovat saavutettavissa ja esityspalkki pysyy näkyvissä.

Tarkat lähde-, revisio- ja näppäimistösopimukset ovat [AUDIENCE_AUTHORING.md](AUDIENCE_AUTHORING.md)-tiedostossa. Vanhan saman dokumentin `?mode=presentation`-CSS-tilan kuvaus tämän README:n historiaosassa ei ole nykyinen näytönjakotapa.

## Työkalut ja nykyiset tarkistuskomennot

Käytä repositorion [lite/.nvmrc](../../../lite/.nvmrc)-tiedoston mukaista Node.js 24.x -sarjaa ja lukittuja npm-riippuvuuksia. `package.json`:n 22.12-alaraja ei yksin kuvaa koko nykyistä tarkistusketjua. Selainkoe tarvitsee Playwright Chromiumin. XML-testit tarvitsevat aidon `xmllint`-ohjelman, Ubuntu-ympäristössä esimerkiksi `libxml2-utils`-paketista.

XML-testien oletuspolku on `/usr/bin/xmllint`. Muussa sijainnissa oleva ohjelma voidaan osoittaa valinnaisella `XMLLINT_BIN`-ympäristömuuttujalla. Puuttuva työkalu on estynyt testi, ei läpäissyt tai ohitettava tarkistus. Se ei ole oppilassivuston ajonaikainen riippuvuus.

Seuraavat komennot suoritetaan hakemistossa `public/oppitunnit`:

```sh
npm ci
npx playwright install --with-deps chromium
# Tarvittaessa: export XMLLINT_BIN=/absoluuttinen/polku/xmllint
SAMMAKKO_SITE_PACKAGE=1 node lesson-network/build.mjs
SAMMAKKO_SITE_PACKAGE=1 node lesson-network/verify.mjs
node --test lesson-network/test-audience.mjs
node ../../.github/scripts/check-launch-presentations.mjs --output ../../.build/projector-local-review-01
```

Valitse selainajolle aina uusi tuloshakemisto. Koko 181:n wrapper käynnistää oman paikallisen palvelimen, tarkistaa esitysten ja Liten tarkan KC-joukon ja käy jokaisen nykyisen vaiheen läpi koossa 1280 × 720 ja 1024 × 768. Ajo tarkistaa myös avatut selitykset, alustuspolut, opettaja-aineiston puuttumisen, kuvien latauksen ja lähteiden muuttumattomuuden. HTTP:llä vastaanotetun HTML:n pitää vastata rakennettua tiedostoa. `LESSON_BROWSER_EXECUTABLE` voi osoittaa paikallisen Chromiumin; normaalisti käytetään Playwrightin asentamaa selainta.

Nykyisen yhteisen ohjelmistoarvion ja teknisten kuittien ketju on seuraava. Käytä samaa uutta ajotunnusta molemmissa kuittikomennoissa:

```sh
node ../../tools/launch/finalize-reviews.mjs
node lesson-network/check-package-tests.mjs B16 local-review-01 --current
node lesson-network/refresh-technical-receipts.mjs local-review-01
node lesson-network/production-status.mjs
node ../../.github/scripts/check-lessons.mjs
```

Ensimmäinen komento tarkistaa eksplisiittiset nykyrevisioiden sisältö-/kohdistuspäätökset eikä kirjoita metadataa. Puuttuva tai vanhentunut päätös estää portin. `B16 ... --current` käyttää B16:n täyttä 181 KC:n valintaa, mutta suorittaa testit ja lähdesidonnan **nykyiselle** lähteelle; ilman `--current`-valitsinta kyse on sinetöidyn checkpointin tarkistamisesta. Uusi kuitti ei korvaa vanhoja tiedostoja. `refresh-technical-receipts.mjs` hyväksyy vain nykyiseen lähteeseen täsmäävän koko 181:n onnistuneen testikuitin ja vaatii muuttuneille oppitunneille nykyiset sisältö- ja kohdistusarviot.

Saman lähteen CI-järjestys on [ci.yml](../../../.github/workflows/ci.yml)-tiedoston `lessons`-työssä. Älä päättele tämänhetkistä CI- tai julkaisutulosta pelkkien komentojen olemassaolosta. Jos ajat erikseen negatiivisen `check-behavior.mjs`-suojatestin, päätä sen jälkeen ketju uudella build/verify-ajolla: testi jättää tarkoituksella epäonnistuneen diagnostiikkatilan. Pelkkä `preview-audience-package.mjs`-kehitysesikatselu ei korvaa täyttä koontia tai hyväksyntäajoa.

## Nykyisen lähteen ja arvioiden sidonta

Jokaisen paketin `contentRevision` sitoo sen metadataan, runkoon, moduuliin ja ilmoitettuihin resursseihin. `alignment.currentSource` kuvaa todellisen nykyisen Lite-lähteen KC-revision, sallitut revisiot ja lähdetiivisteet. Vanhan toimitussnapshotin `sourceFiles`-/`sourceHashes`-viitteet säilyvät sen ulkopuolella historiallisena alkuperätietona.

[tools/launch/source-bindings.mjs](../../../tools/launch/source-bindings.mjs) sitoo arvioon myös yhteiset oppituntigeneraattorit ja esitysruntimen sekä Gitissä seuratut Lite-lähteet. Pelkän pakettirungon muuttumattomuus ei siis riitä, jos yhteinen shell tai Lite on muuttunut. `sync-current-sources.mjs` päivittää tarvittaessa lähdesidonnan erikseen; se ei myönnä sisältö-, teknistä tai ihmisarviota. `finalize-reviews.mjs` tarkistaa kaikkien 181 päätöksen revisiot, globaalit sidonnat ja nimetyn näytön tiivisteet ennen mahdollista erikseen pyydettyä metadataan soveltamista.

**Oikean opettajan ja oppijan arvio pysyy `humanReview: pending` / `not_performed` -tilassa**, kunnes sellainen koe on oikeasti tehty. Agentin sisältöluku, kuvakatselmus tai onnistunut selainajo ei todenna oppimista, fyysistä projektoria tai opetuksen vaikuttavuutta.

## Peliyhteyden nykyinen sopimus

Lite-silta on toteutettu: nykyinen [lite-runtime.json](../../../lite/public/lite-runtime.json) määrittelee reitin `#kc/{encodedCanonicalKCId}`. Yhteisen sivustopaketin koonti (`SAMMAKKO_SITE_PACKAGE=1`) tarkistaa Liten ja oppituntien saman 181 KC:n joukon ja muodostaa linkin `/lite/#kc/<KC>`. Reititys ei kirjaa vastausta, päätelmää tai palkintoa pelkän linkin avaamisesta.

`runtime.mjs` erottaa `same_origin_package`-paketin, paikallisen esikatselun ja oikeasti varmennetun oppilasjakelun. Erillinen oppituntivienti ilman yhteisen sivustopaketin asetusta säilyttää konservatiivisen `deployment.json`-/`reference/RUNTIME_LINKS.json`-sopimuksen; siinä pelipainike voi olla estetty puuttuvan palvelinosoitteen tai saatavuuden vuoksi. Tämä ei tarkoita, että nykyisestä Litestä puuttuisi reittisilta. Laajan Sammakon `#journey/<KC>`-adapteri ja sen saatavuus arvioidaan erikseen.

`site/data/teacher-integration.json` kertoo sivukohtaisen saatavuuden. Sama origin -paketin `packageReady` ei ole väite julkisen palvelimen saavutettavuudesta tai live-julkaisun hyväksynnästä. Koko julkaisun konfigurointi ja kohdekohtaiset tarkistukset kuuluvat toimitusohjeeseen.

## Historialliset tuotanto- ja toimitusohjeet

Seuraavat merkinnät säilyttävät aiempien vaiheiden työjärjestyksen ja tulokset. B16:n testimäärät, vanhojen 175 selaintuloksen uudelleenkäyttö, LR03:n 11/170-jako, vaiheen 1 puuttuva Lite-silta ja vanhan ZIP:n manifestit koskevat omia tuolloisia lähteitään. Ne eivät hyväksy tämän kehityshaaran muuttunutta nykyistä lähdettä. Käytä yllä olevia nykykomentoja ja viimeisintä jatkokatselmusraporttia.

> **Julkaisun lähde ja koonti (30.10.2026):** `site/` generoidaan lähteistä, eikä sitä enää seurata Gitissä. Tämä dokumentti säilyttää myös aiempien vaiheiden selitykset. Nykyinen Aava-julkaisu ja palvelimelle vietävä artefakti kuvataan [osaprojektin ohjeessa](../README.md) ja [yhteisessä toimitusohjeessa](../../../docs/DELIVERY_FI.md).

### Historiallinen vaihe: 181 oppitunnin tuotanto ennen launch-jatkokorjauksia

Käyttäjä antoi sisältötuotantovaltuutuksen Phase1.1:n valmistuttua. Tarkka eteneminen on `lesson-status.json`:ssa ja `PRODUCTION_181_RESUME.md`:ssä. `technical_checked` tarkoittaa version sidottuja teknisiä ja synteettisiä katselmointitarkistuksia, ei ihmis- tai oppilasvalidointia. Muut509 KC:tä ovat edelleen sisällöttömiä pohjia;690 sivun suhteet säilyvät.

Lukitun koko tarkistus-/lint-työkaluketjun kanssa käytetään Node.js24.x:ää (testattu24.14); manifestin22.12-alaraja ei ole koko työkaluketjun todennus. Lisäksi tarvitaan Python 3 (`python3`) sekä joissakin SVG-testeissä `/usr/bin/xmllint` (libxml2). Tuolloin kiinteä Unix-polku oli testien tunnettu siirrettävyysraja; nykytestien valinnainen `XMLLINT_BIN` on kuvattu yllä. Kyse ei ole oppilassivuston ajonaikaisesta riippuvuudesta; Linux-/Windows-testikattavuutta ei väitetä. Selainajot tarvitsevat erikseen asennetun Playwright Chromiumin. Varmista nämä ennen koko testiajoa; puuttuva XML-työkalu on ympäristöltä estynyt testi, ei läpäissyt tarkistus.

Toimituksen juuresta: `npm ci`, `node lesson-network/build.mjs`, `node lesson-network/verify.mjs`, `node --test lesson-network/packages/*/tests.mjs`. Selain: `npx playwright install chromium`, sitten `python3 -m http.server 4191 --bind 127.0.0.1 --directory lesson-network` ja toisessa terminaalissa erän uudet/muuttuneet sivut rajaava ajo ohjeen `evidence/production/B13/BROWSER_SCOPE_FI.md` mukaan (muuttuja `SAMMAKKO_KC_IDS`). Ilman valintamuuttujaa työkalu tarkistaa tarkoituksella kaikki kirjoitetut sivut. Avaa http://127.0.0.1:4191/site/ . Moduulit tarvitsevat paikallisen HTTP-palvelimen; staattinen opetus ja navigaatio toimivat myös ilman JavaScriptiä. Tarkat181/690 rajat tarkistetaan generaattorissa.

Tuotantovaiheen historiallinen valmis tarkistuspiste oli B16:181/181 teknisesti tarkistettua oppituntiluonnosta; valittu joukko oli tuolloin valmis. 1033/1033 lähdesidottua testiä,690sivun koonti ja370691rakenne-/linkkitarkistusta. Viimeisen6:n tarkistuksen toisto: node lesson-network/check-package-tests.mjs B16 oma_uusi_ajonimi. Tarkka selaimen rajaus, riippuvuudet ja yksityiskohdat: evidence/production/B16/REPRODUCE_FI.md. Tuolloin vanhojen175:n toimitetut näkymät ja yhteiset riippuvuudet olivat ennallaan, joten niiden aiempaa selaintulosta käytettiin uudelleen. Kyse ei ollut uudesta koko181:n selaimen suorituksesta, eikä tätä uudelleenkäyttöä sovelleta launch-jatkossa muuttuneeseen lähteeseen. Koko690:n rakenne/linkit tarkistettu. Ihmisoppilaan ymmärtäminen ja julkaisuportit erillisiä, muut509edelleen pohjina.

Tuolloisen ZIP-toimituksen täsmällinen lähdecommit ja tiedostot: EXPORT_MANIFEST.json; ZIP-SHA sivutiedostosta. Sinetöinnin jälkeiset eristetyn rekonstruoinnin tulokset ovat erillistä postsealnäyttöä, eivät takautuvasti alkuperäisenZIPin sisältöä. Lähdekoodi/testit/lockfilet/valitut katselmukset toimitetaan; alkuperäisiä /tmp-hakemistoja ei tarvita normaaliin koontiin. Kaikkien Git-tiedostojen sisällyttämistä ei väitetä. Älä aloita509:n sisältötuotantoa ilman erillistä seuraavan vaiheen valtuutusta.

Negatiivinen authored-record-suojatesti jättää tarkoituksella `build-status.json`:iin failed-diagnostiikan. Päätä tarkistusjärjestys siksi aina komentoihin `node lesson-network/build.mjs` ja `node lesson-network/verify.mjs` behavior-testin jälkeen. Varmista viimeinen verified-tila. Fixture-esikatselu on erillinen: `LESSON_FIXTURES=1 node lesson-network/build.mjs`, sitten `SAMMAKKO_BATCH=B13 node lesson-network/browser-phase1_1.mjs`. Yleinen selaimen näkymätarkistus ei korvaa yksittäisten uusien mallien rajattuja sisältö-/matematiikka-/tehtäväpolkukatselmuksia.

B08:n tarkistustuloksen korjaus on dokumentoitu tiedostossa `evidence/production/B08/VERIFICATION_CORRIGENDUM.md`. Alkuperäinen suljettu ZIP ja epäonnistunut testi säilyvät. Uusi version sidottu testi tehdään komennolla `node lesson-network/check-package-tests.mjs B08 uusi_yksilollinen_ajonimi`. Ajo ottaa tarkistettavan KC-joukon B08:n `completion.json`-tiedostosta; myöhemmän erän keskeneräiset luonnokset eivät kuulu siihen. Komento palauttaa virhekoodin, elleivät kaikki testit läpäise ilman ohituksia ja lähteiden tiivisteet täsmää ennen ajoa ja sen jälkeen. Tositteen raakatulos ja SHA-256-lähdesidonta säilyvät erillisessä, ylikirjoittamattomassa ajohakemistossa. B08:sta alkaen tekninen tilanosto vaatii tämän kelvollisen tositteen. Aiemmat B01–B07-tositteet ovat säilytettyä historiaa, eivät uuden formaatin tarkistuksia.

Vienti Git-työhakemistosta käyttää **tallennettua HEAD-versiota** valituista osajärjestelmän poluista. Tallenna hyväksyttävä lähde ensin Git-committiin; keskeneräiset tai tallentamattomat tiedostot eivät kuulu vientiin. Puretun toimituksen vienti ilman Git-repositoriota on erikseen merkitty alkuperäisen manifestin varaan perustuvaksi vienniksi, ei uudeksi Git-todisteeksi.

`python3 lesson-network/export.py oma_uusi_katselmus` tekee uuden nimetyn lähde-/katselmointipaketin. Olemassa olevaa ZIP:iä ei korvata. `EXPORT_MANIFEST.json` sitoo sisällytetyt tiedostot ja lähdecommitin; `HISTORICAL_EVIDENCE_INDEX.json` luettelee pois jätetyt historialliset binäärihavainnot alkuperäispolkuineen ja tiivisteineen. Ne säilyvät repositoriossa, samoin kaikki teksti-/JSON-katselmushistoriat toimituksessa. Testisyötteitä ja käyttöresursseja ei rajata tällä säännöllä. Tarkat lähdesopimukset: AUTHORING.md.

Alla on historiallinen vaiheen1 tilanne, ei nykyinen tuotantovaltuutus.

### Phase 1.1:n historiallinen jatko-ohje

See [AUTHORING.md](AUTHORING.md) for the supported source-owned writing/update/build workflow and technical-fixture preview. The Phase 1 account below is historical; its no-content assertions apply to empty scaffolds, not explicitly loaded draft/test packages. `python3 lesson-network/export.py` now emits `Sammakko_690_Phase1_1.zip` and works from an extracted delivery.

### Sammakko — 690 KC:n oppituntiverkko, vaihe 1

Tämä on valmis paikallinen sivupohjaverkko. Opetussisältöä ei ole kirjoitettu eikä hyväksytty. Aiemmat oppituntiaineistot säilyvät omissa hakemistoissaan alkuperäisine tiloineen. Phase 2 vaatii erillisen käyttäjän handoverin.

#### Avaaminen

`site/index.html` avautuu suoraan selaimessa. Kaikki 690 sivua ja navigaatio ovat tavallista HTML:ää; JavaScript lisää suodatuksen, kopioinnin ja esitystilan. Leikepöydän puuttuessa kopioitava teksti annetaan valittavana kenttänä.

HTTP-esikatselu repositorion tai toimituspaketin juuresta (Python 3):

```sh
python3 -m http.server 4186 --bind 127.0.0.1 --directory lesson-network
```

Avaa `http://127.0.0.1:4186/site/`. Osoite on paikallinen esikatselu; oppilaiden saavutettavuutta ei ole varmennettu.

#### Rakennus ja tarkistus

Node.js vähintään 22.12, npm ja lukitut riippuvuudet `package-lock.json`-tiedostosta. Komennot toimituksen juuresta:

```sh
npm ci
node lesson-network/build.mjs
node lesson-network/verify.mjs
node lesson-network/check-behavior.mjs
npx playwright install chromium
# HTTP-palvelin yllä olevalla komennolla toisessa terminaalissa:
node lesson-network/browser-check.mjs
```

Generaattori tarvitsee mukana toimitetut `canonical/`, `content-design/`, `baseline/`, `CONTENT_STATUS.yaml` ja `AUTONOMOUS_52_STATE.json` aiempien aineistojen inventointiin. Avaa nämä vain lähteinä. Tietueen `existingDrafts.originalTaskStatus` säilyttää koko alkuperäisen tilan. `inventory.json` sitoo olemassa olevat lähteet SHA-256-tarkistussummiin.

`records/` sisältää 690 erillistä KC-tietuetta. `checkpoints/` sisältää vastaavat syöte-, malli-, lähdeviite- ja tulostetiivisteet. `site/` on itsenäinen julkaistava staattinen kokonaisuus. `coverage.json` erottaa pohjavalmiuden hyväksytyn sisällön määrästä (0).

Generointi kulkee kanoniset tietueet järjestyksessä; täysi tukiverkko saa sisältää syklejä. `LESSON_BATCH_LIMIT` on historiallinen sisäinen probe; osittaista verkkoa ei nykyisin saa julkaista. Tavallinen rakennus tarkistaa kaikki690: puuttuvat/vioittuneet sivut korjataan, samat tavut ja muuttumattomien tiedostojen ajat säilyvät. Tiedostot tallennetaan väliaikaistiedoston ja atomisen uudelleennimeämisen kautta. Sisältöä jo saaneen tietueen ylikirjoitus pysähtyy virheeseen. Tarkistimen virhe on aina este vaiheen valmistumiselle.

#### Opettaja- ja esitystila

**Historiallinen LR03-kalibrointisopimus (11 aihetta; nykyinen exact181-sopimus yllä):** Avaa esitys avaa saman lähteen erillisen yleisödokumentin uuteen välilehteen. Vain esitysvälilehti jaetaan. Opettajamuistiinpanot ja lähde-/KC-metatiedot puuttuvat siitä kokonaan; valmistelu säilyy alkuperäisessä välilehdessä. Kalibroiduissa 11 aiheessa esitetään yksi lähteeseen kirjoitettu vaihe kerrallaan ja kysymyksen vastaus paljastetaan erikseen. Muiden 170 aiheen semanttinen siirto jatkui tuolloin LR04-erissä. Tekniset testit eivät muuta ihmisarvion tilaa. Tarkka kirjoitus-, revisio- ja näppäimistösopimus on [AUDIENCE_AUTHORING.md](AUDIENCE_AUTHORING.md). Alla oleva saman dokumentin CSS-esitystilan kuvaus on historiallinen.

Sivun yläosassa ovat sen suorat esitieto-/tukilinkit, alaosassa suorat jatkoaiheet. Ryhmien välillä on JA, `any_of`-ryhmissä TAI. Esitystila piilottaa suunnittelupaneelin; sisältöä odottava ilmoitus säilyy. `?mode=presentation` avaa saman KC:n esitystilaan. Kopioitu oppituntilinkki ei sisällä tilaa, profiilia tai muuta kyselytietoa. Mitään oppimisevidenssiä tai tallennettua hallintaa ei synny.

#### Peliyhteydet

`runtime.mjs` on erillinen resolveri. `site/data/teacher-integration.json` yhdistää KC-tunnuksen HTML-sivuun, valmiustiloihin, Lite-rajaukseen ja kahden pelin erillisiin saatavuuksiin.

Vaiheen 1 toimituksessa Lite181:n reittisilta puuttui. Sen tuolloinen toteutustehtävä oli `reference/RUNTIME_BRIDGE_HANDOFF.txt`. Täysi Sammakko käyttää dokumentoitua `#journey/<KC>`-reittiä uudessa välilehdessä, mutta tässä toimituksessa palveluosoite ja kyseisen julkaisun saatavuusindeksi ovat määrittämättä. Pelipainikkeet ovat siksi pois käytöstä ja syy näkyy opettajapaneelissa.

Vaiheen 1 historiallinen integraatio-ohje: myöhempi integraattori voi kopioida `reference/RUNTIME_LINKS.json` tiedostoksi `lesson-network/deployment.json` ja asettaa adapterin `baseUrl`, varmennetun `routeSyntaxState: source_verified`, oikeasta käännöksestä `runtimeAvailability.ids` sekä `runtimeAvailability.state: verified_compiled_index`, `endpointVerification: verified`, `studentReachability: verified` ja `deploymentScope: classroom_network|public` vasta varmennuksen jälkeen. Tämä ei hyväksy pedagogiikkaa. Localhost ei koskaan muutu oppilasjakeluksi näillä lipuilla. Pelkän lähdesopimuksen URL näkyy korkeintaan kehittäjän testilinkkinä. Lite-syntaksia ei saa arvata: tässä resolverissa mahdollinen myöhemmin toteutettu `journey_hash`-silta vaatii myös `bridgeVerification: verified`. Muut reittisyntaksit hylätään, kunnes niille toteutetaan ja testataan oma sopimus. Oppitunnin jakamisvalmius pysyy konservatiivisesti varmentamattomana, kunnes erillinen julkaisuintegraatio tehdään.

Tutkimuksen, tehtäväperheen ja rendererien tulevat sopimukset ovat tietueissa tyhjinä/null-arvoisina. Null tarkoittaa ratkaisematta; tyhjä esitietolista ei sertifioi tulevaa tehtävää esitiedottomaksi. Raskaita renderereitä ei ladata.

#### Toimituksen luonti

```sh
python3 lesson-network/export.py
```

Paketti sisältää tämän osajärjestelmän koko lähteen, staattiset sivut, tarkistimet, lukitustiedoston, nykyiset kuvakaappaukset ja inventoinnin tarvitsemat alkuperäiset aineistot. Se ei ole koko historiallisen pelirepositorion vienti. Paketin sisäinen manifesti luettelee kaikki tiedostot ja SHA-256-tiivisteet. Historiallisia videoita, riippuvuuksia tai vanhoja vientipaketteja ei kopioida.

