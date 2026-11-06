# Äänimaailma: suunnitelman katselmus ja toteutusraportti

> **181-julkaisun linjaus 2.11.2026:** omistaja sallii nykyisen äänenlaadun ja kuuntelemattoman pilotin. Puhemuotoja ei korjata nyt; ihmiskatselmointi tehdään 181-julkaisun jälkeen ja täysi ihmisbeta täyden Sammakon vaiheessa. `approved` kaikille raidoille tai `pilot: false` eivät ole 181-julkaisuportteja. [Päätös ja 690-korjaussuunnitelma](YLEISET_VIRHEET_JA_KORJAUKSET_690_FI.md).
>
> Tämä tiedosto säilyttää toteutuskierrosten historiallisen raportin. Sen eri kohdissa olevat määrät, testit ja hyväksyntätilat kuuluvat kyseiselle kierrokselle. Nykyinen äänitilanne on [AUDIO_FI.md](AUDIO_FI.md)-tiedostossa; raportin vanhat kohdat eivät korvaa myöhempää päätöstä tai tuoreita commitkohtaisia tarkistuksia.

Päivä 2.11.2026. Haara `sound/opus-20261102` lähtee `origin/main`ista (`25e4d2e`, sama kuin suunnitelman lähdecommit).

Visual polish -haaraa (`visual-polish/opus-20261102`) ei tarvita. Se muuttaa 18 tiedostoa, eikä yksikään niistä ole `lite/src`, nginx tai CI. Haarat voi siksi ottaa käyttöön toisistaan riippumatta.

Lähde: käyttäjän suunnitelma `Sammakko-aanimaailma-Opus-2026-11-02.md` (45 kt). Käyttöohje ja kuuntelulista ovat tiedostossa [AUDIO_FI.md](AUDIO_FI.md).

## 1. Tiivistelmä

Tilanne 2.11.2026 kolmannen kierroksen jälkeen (yksityiskohdat kohdassa 7).

- **Puhe (päivitys kierros 4: kaikki hyväksytty, manifesti ei ole enää pilotti):** kaikki 58 ydinrepliikkiä on tuotettu käyttäjän valitsemilla äänillä (Aava sage +3 puolisävelaskelta, Loikka alloy, kertoja ja Sulka echo; malli gpt-realtime-2.1-mini). Jokainen on tarkistettu sanatarkasti litteraatista. Ne ovat **väliaikaisia** (`provisional`): kukaan ei ole hyväksynyt niitä yksitellen, ja ne menevät sovellukseen vain pilottimanifestilla (`pack --pilot`).
- **Tehosteet:** 27 kpl. Loikan kurnaus ja ilahtuminen ovat nyt oikeaa puusammakon ääntä vapaasta kirjastosta (public domain), muut itse syntetisoituja. Kaikki ovat ehdokkaita, kunnes ne on kuunneltu.
- **Oma ääninäyttely:** äänitysstudio `tools/audiogen/studio.mjs`. Siinä äänitetään oma otto repliikki kerrallaan ja valitaan oma tai tekoälyotto. Valinnat viedään sovellukseen komennolla `takes`.
- **Tekoälyäänen ilmoitus** on Aikuiselle-sivulla.
- **Lähdesidonta** on päivitetty (kohta 5), ja portti `finalize-reviews.mjs` on läpi.
- **Kulut:** ääniprojekti yhteensä noin 1,17 $ (katto 20 $).

## 2. Suunnitelman katselmus

### Noudatettu sellaisenaan

- Ratkaisu on staattinen ja ennalta tuotettu. Dynaamista palvelinta ei tehty (vaihe D on myöhempi päätös).
- Ratkaisujärjestys: hyväksytty tiedosto, sitten selaimen suomenkielinen ääni, sitten näkyvä teksti. `say()`/`hush()`-rajapinta säilyy.
- Puhekanavia on yksi, ja `after`-jono on lyhyt. Näkymän vaihto peruu myös latautuvat ja jonossa olevat. Jokaisella toistolla on vahtiajastin, eikä puuttuva `ended` lukitse tehtävää. Vastaus kirjataan heti, ei äänen valmistuttua.
- Kehun odotus sidotaan toiston päättymiseen, enimmäisodotus on 2,6 s.
- Tarina merkitään kuulluksi vasta onnistuneen toiston jälkeen.
- Kuuntelutehtävän saatavuus riippuu siitä, voiko repliikin kuulla, ei pelkästä selainäänestä.
- Malli on `gpt-realtime-2.1-mini` Realtime-rajapinnan kautta. Poistuvaa `/v1/audio/speech`-rajapintaa ei käytetä.
- Avain on vain Keychainissa. CI ja build eivät tee puhekutsuja.
- Budjetti:
  - ääniprojektin katto 15 $;
  - kuuntelukokeen katto 2 $;
  - yhteinen kuukausikatto kuvageneraattorin kanssa;
  - kirjanpito varauksin (varaus, tilitys, vapautus tai epävarma).
- Manifesti on kevyt indeksi. Tiedostonimissä on sisällön tiiviste. Mitään ei ladata ennen kuin ääntä tarvitaan.
- Tehosteilla on oma satunnaisuus. Tehtävien deterministinen satunnaislukujono pysyy koskemattomana.
- Lento ottaa arvokopiot ennen `stepFlight()`-kutsua, ja yksi muutos tuottaa yhden äänen.
- Koristeellinen animaatio ei laukaise ääniä.
- Kuuntelusivu on kehittäjän työkalu, ei lasten tuotevirta.
- Nginx: `audio/mpeg` ja `audio/wav`, `immutable` vain tiivistenimisille äänitiedostoille, ja `nosniff` toistetaan location-lohkossa.
- Item-manifestiin ei kosketa, eikä 181/509-valikoima muutu.

### Muutettu (perustelu)

- **Tehosteet syntetisoidaan proseduraalisesti** (`sfx-synth/1`) eikä generoida tai haeta CC0-kirjastoista. Oikeudet ovat yksiselitteiset, tiedostot toistuvat tavulleen samoina, kulut ovat 0 $, eikä riippuvuuksia ole. Suunnitelman generointikehotteet jäävät vaihtoehdoksi, jos synteesi ei kuuntelussa riitä.
- **Puheavain on puhuja + tarkka teksti** (FNV-1a 64, NFC ja välilyönnit normalisoituna) eikä lähdekoodin kohta. Koodin siirtely ei riko tiedostoja, ja tekstin muutos estää vanhan tiedoston toiston väärän tekstin kanssa.
- **Lisätty: piilotettu välilehti hiljentää kaiken.** Puhe ja tehosteet pysähtyvät ja `AudioContext` keskeytetään. Mitään ei jatketa itsestään, ja `pagehide` sulkee kontekstin ja vapauttaa puskurit. Suunnitelma ei ottanut tähän kantaa.
- **Lisätty: aikuisen rauhallisuusasetus koskee myös hahmojen ääniä.** Painike on nyt ”Pysäytä hahmojen liike ja äänet”, ja se hiljentää `aava.*`- ja `loikka.*`-koristeäänet. Palauteäänet ja puhe säilyvät.
- **Lisätty: tehosteäänten kytkin myös Aikuiselle-sivulle.**
- **Reduced-motion** käsitellään suunnitelman mukaan erillään ääniasetuksesta (§10). Järjestelmän liikeasetus ei mykistä ääntä.
  - *Riski:* käyttäjä, joka odottaa reduced-motionin hiljentävän myös hahmojen äänet, kuulee ne edelleen.
  - *Lievennys:* tehosteiden oma kytkin, hiljainen tila ja aikuisen rauhallisuusasetus.
- **MP3-pakkaus** vaatii `lame`-ohjelman, jota koneella ei ole. Ilman sitä puhe julkaistaan PCM16-WAV-muodossa. Tehosteet ovat suunnitelman mukaisesti WAV-muotoisia.

### Ei toteutettu tai ei järkevää nyt

- **Vaihe B:n kuuntelukoe ja äänten valinta** tarvitsevat Realtime-oikeudella varustetun avaimen, hyväksynnän enintään 2 $:n ajolle ja ihmisen kuuntelun. Kuuntelupalautetta ei keksitty. Työkalu ja kuuntelusivu ovat valmiina.
- **Vaihe C:n puhe:** 58 repliikin ydinkatalogi on koottu, mutta kattavuus on 0/58. Oppituntiverkon yhteisen kuoren lukutoiminto on suunnitelman mukaan erillinen muutos, eikä sitä tehty.
- **Aavan lennonaikaiset korkeusohjeet** näkyvät edelleen vain tekstinä. Niiden harvennettu luenta jää seuraavaan vaiheeseen.
- **Google-vertailutuotanto** jätettiin pois (suunnitelmassa valinnainen).
- **Lähdesidonnan päivitys** (”päivitä lähteeseen sidotut tarkistukset”, vaihe C): suunnitelman mukaan *”vanha katselmus ei ole uuden version hyväksyntä”*. Sidonnan uusiminen tarkoittaisi, että 181 aiheen ohjelmistokatselmus vahvistetaan uudelleen. Sitä ei tehdä kysymättä (ks. kohta 5).

## 3. Opetuksen suojaus

| Ääni | Milloin | Miksi ei vihjaa eikä palkitse |
|---|---|---|
| `ui.confirm` | vastaus on jo lähetetty ja kirjattu oikeaksi | toistaa näkyvän palautteen; ei ääntä valinnan tai hoverin aikana |
| `ui.retry` | vastaus on jo lähetetty ja kirjattu vääräksi | pehmeä, ei rangaistusta; näkyvä palaute on jo ruudulla |
| `ui.select` | vain tehostekytkimen päälle kytkeminen | ei koske tehtäviä |
| `aava.joy` | Pajan olemassa oleva juhlahetki | ei uutta palkintoa; sama hetki kuin ennen |
| `loikka.push`, `land.*` | Pajan hyppy, jonka käyttäjä itse käynnisti | kuvaa liikettä, ei tilaa |
| `aava.wing`, `water.splash`, `ui.confirm`, `land.dry` | lennossa käyttäjän painallus / näkyvä roiske / näkyvä rengas / laskeutuminen | peilaa näkyviä tapahtumia; ei paljasta piilotettua tilaa |
| `aava.notice`, `loikka.croak` | esittelykortin askel, jonka käyttäjä avasi | tervehdys ennen puhetta |

Muut takuut:

- Ääntä ei soiteta ennen käyttäjän elettä. `AudioContext` luodaan vasta `pointerdown`- tai `keydown`-tapahtumassa, eikä hover tai fokus käynnistä ääntä.
- Hiljainen tila hiljentää puheen ja tehosteet. Pakotettu kuuntelu (”Kuuntele”-painike) toimii kuten ennenkin.
- Ilman suomenkielistä ääntä ja ilman tiedostoja toiminta on ennallaan: teksti näkyy, ja kuuntelutehtävät vaihdetaan.

## 4. Äänilähteet ja provenienssi

- **Tehosteet:** 27 tiedostoa, 12 perhettä, yhteensä noin 790 kt. Muoto on PCM16-WAV mono 48 kHz, huiput −8…−17 dBFS.
  - Jokaisen tiedoston perhe, siemen, resepti, koko, kesto, taso, SHA-256 ja oikeusperuste ovat tiedostossa [`audio/provenance/sfx.json`](../../audio/provenance/sfx.json).
  - Tiedostonimessä on SHA-256:n 10 ensimmäistä merkkiä.
  - Oikeudet: 22 tiedostoa on omaa proseduraalista synteesiä. Loikan 5 kurnausta (`loikka.croak`, `loikka.joy`) on leikattu puusammakon soidinhuudosta: *Laubfrosch Balzruf*, Rabe19, Wikimedia Commons, public domain. Lähde, lataus-URL, SHA-256, leikkauskohdat ja käsittely ovat tiedostoissa [`audio/library/sfx.json`](../../audio/library/sfx.json) ja `sfx.json`.
  - Tila: `candidate`, kunnes tehoste on kuunneltu.
- **Puhe:** 58 tiedostoa (`audio/provenance/speech/*.json`). Provenienssi tallentaa mallin, äänen, tyyliversion, syötetiivisteen, vastauksen tunnisteen, litteraatin tarkistuksen, hyväksyjän ja päivämäärän.
- **Tekoälyäänen ilmoitus** on Aikuiselle-sivulla. Jos omia ottoja otetaan käyttöön, lausetta pitää tarkentaa (osa puheesta on silloin ihmisen lukemaa).
- Ajonaikaisia CDN- tai ulkoisia riippuvuuksia ei ole. Äänet tarjoillaan samasta lähteestä (`lite/public/audio`).

## 5. Suojattu raja: lähdesidonta

`tools/launch/source-bindings.mjs` laskee tiivisteen jokaisesta `lite/src`-tiedostosta. `finalize-reviews.mjs` vaatii, että katselmuspäätösten `liteGeneratorSha256` vastaa nykyistä lähdettä.

- `origin/main`: tulos `decisions_verified_only`, portti läpi.
- Tämä haara: `Missing/stale global binding: liteGeneratorSha256`, portti punaisena.

Äänikerros vaatii muutoksia `lite/src`:hen (`say()` on siellä), joten ristiriitaa ei voi välttää kokonaan. **Ehdotus käyttöönottoon:**

1. Ihminen kuuntelee ja hyväksyy tehosteet. Muussa tapauksessa manifestista poistetaan `sfx`, jolloin muutos on käytöksessä pelkkä peruutus- ja hiljaisuuskorjaus.
2. Uusi tekninen tarkistus ajetaan nykyisillä porteilla (kaikki 181 aihetta selaimessa).
3. Repon dokumentoidulla menettelyllä päivitetään katselmuspäätösten lähdesidonta ja kirjataan, että muutos koskee vain äänikerrosta (ei tehtäviä, sisältöä eikä oppijamallia).
4. Tämän jälkeen haara voidaan yhdistää.

**Päivitys 2.11.2026 (kierros 2):** kohdat 2–3 ajettiin käyttäjän valtuutuksella. `sync-current-sources.mjs --apply` sitoi lähteet uudelleen. Uusi työkalu `tools/launch/carry-forward-binding.mjs` siirsi päätökset vasta mekaanisten tarkistusten jälkeen: oppituntigeneraattori on muuttumaton, `lite/src/content` ja `engine` ovat muuttumattomat, ja oppituntitiedostoista muuttui vain sidonta. Todiste on tiedostossa `docs/releases/launch/rebind-659420f8c0fe.json`. Ihmisen validointi on yhä kesken. Kierros 3 ei muuttanut `lite/src`:tä, ja `finalize-reviews.mjs` antaa tuloksen `decisions_verified_only`.

## 6. Testitulokset

Ajettu paikallisesti tällä haaralla 2.11.2026, komennot `.github/workflows/ci.yml`:n mukaan:

| Portti | Tulos |
|---|---|
| `art/build.mjs --check`, `art/check-runtime.mjs` | läpi |
| `secret-scan.mjs --all` | läpi |
| imagegen-testit | 19/19 |
| audiogen-testit (uusi CI-askel; vale-WebSocket, ei verkkoa) | 15/15 |
| `tsc --noEmit` + `vitest run` (Lite) | 1 955 läpi, 1 ohitettu (ohitus on olemassa oleva) |
| `vite build` + `lite-runtime.json` muuttumaton | läpi |
| `playwright.launch.config.ts` | Chromium ja Firefox 22/22; **WebKit 11/11 ei ajettu**, selain puuttuu koneelta (asennus olisi lataus) |
| `playwright.scope.config.ts` (kaikki 181 aihetta, työpöytä ja mobiili) | läpi |
| `test-launch-review-gate.mjs` | 4/4 |
| `finalize-reviews.mjs` | kierros 1: hylkäsi; kierroksista 2–3 lähtien läpi (kohta 5) |
| `lesson-network/build.mjs`, `verify.mjs` | läpi |
| `test-audience.mjs` | 7/8: sama lähdesidontasyy (*global Lite boundary*) |
| `check-lessons.mjs` | läpi |
| julkaisun regressiot (`oppimisverkko`, `whitepaper`, metadata) | 31/31; whitepaper vastaa lähdettä |

Uudet testit:

- `lite/tests/audio.test.ts` (14 testiä):
  - avainten vastaavuus generaattorin kanssa ja lennon tapahtumakuvaus;
  - puhekanava: ei päällekkäisyyttä, jono, peruutus, estetty toisto;
  - pakatut tiedostot vastaavat tiivisteitä ja provenienssia, eikä irrallisia tiedostoja ole.
- `lite/tests/audio-lifecycle.test.ts` (13 testiä):
  - ei `AudioContext`ia ennen elettä, ja hover tai fokus ei avaa ääntä;
  - enintään 4 tehostetta kerralla, oma kytkin, myöhästynyt dekoodaus pudotetaan, näkymän sulkeminen pudottaa latautuvat;
  - piilotettu välilehti pysäyttää ja keskeyttää kaiken, eikä palaaminen jatka itsestään;
  - `pagehide` sulkee kontekstin ja vapauttaa puskurit;
  - vahtiajastimet eivät jää elämään;
  - hiljainen tila ja rauhallisuusasetus toimivat.
- `tools/audiogen/test/audiogen.test.mjs` (15 testiä):
  - Realtime-sovitin vale-WebSocketilla;
  - kirjanpito ja kolme budjettikattoa;
  - WAV ja tasot, tehosteiden determinismi;
  - dry-run, `--live`-vaatimukset ja vapautus, kun yhteys ei aukea;
  - avain ei päädy tulosteeseen eikä kirjanpitoon.

Selainajo tuotantobuildilla (`vite preview --base /lite/`):

- Ennen elettä ladataan vain `manifest.json`.
- Napautuksen jälkeen Loikan kurnutus soi (0,34 s).
- Kun rauhallisuusasetus on päällä, kurnutus ja ponnistusääni jäävät pois ja vain laskeutumisääni soi.
- Aikuiselle-sivun uudet painikkeet näkyvät, eikä konsolissa ole virheitä.

**Ei testattu:**

- julkaisupaketti Nginxin kautta (`package-site`, `check-site.py`, julkaisun Playwright Dockerissa);
- WebKit;
- todellinen kuuntelu kaiuttimesta tai kuulokkeista;
- toisto oikealla puhelimella;
- Realtime-rajapinnan todellinen vastausmuoto (vain dokumentaation mukaan mallinnettu ja vale-socketilla testattu).

## 7. Kierros 3: valitut äänet, uusi kurnaus, äänitysstudio

### Äänet

Käyttäjä valitsi kuuntelusivulta: **Aava** sage mini +3, **Loikka** alloy mini, **kertoja** echo mini (Sulka käyttää kertojan ääntä). Mitattu mediaanikorkeus on Aava noin 275 Hz siirron jälkeen, Loikka 144 Hz ja kertoja 124 Hz.

- `audio/voices.json`: profiilit `aava-v3`, `loikka-v3` ja `narrator-v3`, `choice: "user"`.
- Uusi kenttä `shiftSemitones` nostaa äänenkorkeutta ja formantteja renderöinnin jälkeen (`lib/voicefx.mjs`). Siirto on osa syötetiivistettä (`processing: shift3+finish/1`), joten sen muuttaminen tuottaa uuden tiedoston eikä korvaa vanhaa huomaamatta.
- 58 repliikkiä tuotettiin uudelleen (0,17 $). Yhdessä oli sanavirhe (”mittataan”), ja se tuotettiin uudelleen. Nyt 58/58 on sanatarkkoja.

### Kurnaus

Synteettinen kurnaus kuulosti lapsen korvaan pieruäänelle. Tilalle tuli **puusammakon (Hyla arborea) soidinhuuto**, *Laubfrosch Balzruf*, tekijä Rabe19, Wikimedia Commons, public domain.

- Arvioin ehdokkaat: neljä public domain -tallennetta ja yhden CC0-tallenteen. Puusammakko valittiin, koska yksittäinen koiras on lähellä mikrofonia (taustakohina −37 dB, huiput −4 dB) ja huudot erottuvat selvästi toisistaan. CC BY-SA -tallenteet jätettiin pois, koska ne vaatisivat nimeämisen lisäksi jakamista samoin ehdoin.
- `loikka.croak`: 2–3 huutoa (0,5–0,7 s). `loikka.joy`: 3–4 nopeaa huutoa.
- Käsittely: mono 48 kHz, ylipäästö 180 Hz, 12 ms häivytykset ja huippu −12 dBFS. RMS on noin −24 dB, samaa luokkaa kuin muut tehosteet.
- Toistettava: `cli.mjs sfx` leikkaa klipit lähteestä `<tilakansio>/library/laubfrosch.mp3`. Lähde tarkistetaan SHA-256:lla, eikä työkalu lataa mitään itse. Kirjastoklippi korvaa saman perheen synteettisen reseptin.

### Kirjaston laajuus ja oma ääninäyttely

| Osa | Repliikkejä | Kesto valmiina |
|---|---|---|
| Ydinkatalogi (nyt tuotettu) | 58 | 5,6 min (mitattu) |
| Kiinteät toistuvat repliikit (inventaario, deduplikoitu) | 236 | noin 26 min |
| Kaikki oppituntien kiinteät tekstit (intro, kehu, ohje, vihje, selitys, tarina) | 1 805 | noin 3 h |
| Lasketut repliikit (numerot vaihtelevat) | 1 285 lähdekohtaa | ei voi äänittää kokonaisina |

Kestot on arvioitu mitatusta puhenopeudesta: 13 merkkiä sekunnissa, 4 394 merkkiä 338 sekunnissa.

- **Ydin ja inventaario** (noin 30 min valmista puhetta): realistinen äänittää itse. Aloittelijalle tyypillinen suhde on 4–6 minuuttia äänitystä valmista minuuttia kohti, joten työtä on noin 2–3 tuntia, esimerkiksi kahtena iltana.
- **Koko oppituntiteksti** (noin 3 h): 12–18 tuntia äänitystä. Mahdollista viikkojen aikana tunnin jaksoissa, mutta äänen tasaisuus (mikrofoni, huone, vire) on vaikea pitää samana. Lisäksi sisällön jokainen tekstimuutos vaatii uuden oton.
- **Lasketut repliikit** jäävät joka tapauksessa selaimen äänelle tai vaativat paloista kokoamisen (luvut erikseen). Kokoaminen on oma suunnittelutehtävänsä.
- Suositus: aloita ytimestä studiolla, vertaa ottoja tekoälyyn ja päätä vasta sitten, laajennetaanko.

### Äänitysstudio

`node tools/audiogen/studio.mjs`, sitten selaimessa http://localhost:5230.

- Näyttää 58 ydinrepliikkiä rooleittain. Jokaisella on tekoälyotto, äänitysnappi, tasomittari ja omat otot.
- Valinta tehdään radionapeilla: tekoäly, oma otto N tai ei vielä valintaa. Näppäimet: R äänittää ja pysäyttää, nuolet vaihtavat repliikkiä, välilyönti toistaa tekoälyoton.
- Otot tallentuvat vain koneelle (`<tilakansio>/takes/<id>/self-*.wav`, 24 kHz mono). Poistetut siirtyvät kansioon `_poistetut`. Palvelin kuuntelee vain osoitetta 127.0.0.1.
- `cli.mjs takes`: valinnasta tulee kuuntelupäätös. Tekoälyvalinta hyväksyy nykyisen tekoälyehdokkaan. Oma otto normalisoidaan ja hyväksytään (`provider: self-recorded`, `aiVoice: false`). Sen jälkeen `pack`.
- Testattu selaimessa synteettisellä otolla: tallennus, valinta ja `takes` toimivat (ottoa ei jätetty sovellukseen). Oikeaa mikrofoniäänitystä ei voinut testata tässä ympäristössä.
- Artifact-sivu ei saa mikrofonia käyttöönsä, siksi studio on paikallinen.

### Kulut

| Erä | Kulu |
|---|---|
| Koenäytteet (60 renderöintiä) | 0,29 $ |
| Ensimmäinen ydintuotanto (täysi malli) | noin 0,71 $ |
| Uusi ydintuotanto (mini, valitut äänet) | 0,17 $ |
| **Yhteensä** | **noin 1,17 $** |

Kurnauksen lähde oli maksuton.

## 8. Kierros 4: hyväksyntä, s-korjaus ja laajennuksen hinta

### Hyväksyntä

Käyttäjä kuunteli kirjaston 2.11.2026: ”Loikan kurnutus on nyt ihana. Kokonaisuus toimii.” ja ”Muuten hyväksyn nykyisen äänikirjaston.”

- Uusi komento `cli.mjs accept --by … --except …` muutti 57 puhetta ja 27 tehostetta tilaan `approved`. Hyväksyjänä on `käyttäjä (kuunneltu 2.11.2026)`.
- Äänen laadusta: artikulaatio ei ole natiivia suomea. Se johtuu OpenAI:n äänistä eikä tuotantoketjusta.

### Puuttuva s-äänne

Käyttäjä huomasi, että repliikin *”Kisataan! … Löydätkö rannalta jotain sopivaa?”* lopussa kuuluu ”popivaa”. Litteraatti oli silti sanatarkka, joten sanatarkistus ei voi havaita tällaista virhettä.

- Mittasin s-äänteen pituuden repliikin viimeiseltä 1,4 sekunnilta: osuus 10 ms:n kehyksistä, joissa korkeat taajuudet hallitsevat. Vanhassa otossa s-äännettä oli 10 ms, neljässä uudessa 40–90 ms. Vertailun vuoksi toisessa repliikissä mitattiin 90 ms.
- Sovellukseen vaihdettiin otto 3 (90 ms). Käyttäjä kuunteli sen ja hyväksyi (”Take 3 is fine”).
- **Lopullinen manifesti:** `pack` ilman `--pilot`-lippua. Kaikki 58 puhetta ja 27 tehostetta on hyväksytty, väliaikaisia ei ole ja `pilot: false`. Vitest 1 956 läpi, vite build läpi, Playwright launch (Chromium) 11/11.
- Kulu 0,01 $.

### Laajennuksen hinta

Hinta on laskettu toteutuneesta kulusta: 0,165 $ / 4 394 merkkiä eli noin 0,0000376 $ merkiltä (gpt-realtime-2.1-mini). Uusintaotoille on varattu noin 15 %.

| Laajennus | Repliikkejä | Merkkejä | Kesto | Hinta | Koko 80 kbps |
|---|---|---|---|---|---|
| Ydin → toistuvat kiinteät: kartan paikkojen esittelyt (”Paikka. Esittely.”) | +178 | 15 912 | noin 20 min | **noin 0,70 $** | noin 15 Mt |
| Kaikki Lite-noodien kiinteät tekstit (intro, tehtävän ohje, vihje, selitys, palkinto, tarina) | 1 798 | 138 303 | noin 3 h | **noin 6 $** (sisältää rivin yllä) | noin 135 Mt |

- **Numerot:** 286 Lite-tekstiä (27 023 merkkiä) sisältää numeroita tai matematiikkaa. Niille tarvitaan ensin tarkistettu puhuttu muoto (esim. ”3/4” → ”kolme neljäsosaa”), jotta ääni ei lue merkintää väärin.
- **Lasketut repliikit:** 1 285 lähdekohtaa, joissa luvut vaihtelevat. Ne jäävät selaimen äänelle.
- **Koko:** Liten testi rajaa puheen nyt 8 Mt:hen. Täysi kirjasto vaatisi pienemmän bittinopeuden (esim. 48 kbps, noin 80 Mt) ja rajan noston. Tiedostot ladataan vasta kun niitä tarvitaan, joten lapsen laite ei lataa kaikkea kerralla.

### Oppitunnit

Oppituntisivut (`public/oppitunnit`) jatkavat selaimen äänellä. Tarkistin päällekkäisyyden: Lite-noodeilla ja oppitunneilla on yhteisiä kokonaisia repliikkejä vain 9 (esim. ”Kumpi on pidempi?”). Yhteinen kirjasto ei siis säästäisi oppituntien puolella mitään.

## 9. Kierros 5: laajennus tehtäviin ja lukujen lukutapa

Käyttäjä pyysi 2.11.2026 laajentamaan kirjaston kartan esittelyihin ja koko kiinteään sisältöön. Murtoluvut luetaan suomen suositusten mukaan (”kolme neljäsosaa”), ja loppuosalle sopii pienempi bittinopeus.

### Uusi katalogi `lite.json`

`node tools/audiogen/cli.mjs catalog-lite --sample <näyte.json>` kokoaa repliikit, jotka eivät riipu satunnaisarvonnasta. Näyte syntyy komennolla `SPEECH_SAMPLE=1600 SPEECH_OUT=<polku> npx vitest run tests/zz-speech-sample.test.ts`; se ajaa jokaisen noodin generaattorit 1 600 siemenellä. Mukaan otetaan:

- kartan esittely (`Paikka. Esittely.`) ja oppitunnin kehys: esittely, pikatarkistus, harjoituksen aloitus, palkinto;
- demot;
- tehtävätekstit (ohje, selitys, vihje väärään vastaukseen, vastausvaihtoehto), jotka ovat sisällössä sellaisenaan merkkijonona;
- ”Muistatko vielä?” erillisenä palana sekä luvut 0–100 laskureita varten (`say(String(n))`).

Ydinkatalogissa jo olevat repliikit jätetään pois.

| Laji | Repliikkejä | Merkkejä |
|---|---|---|
| Kartan esittely | 181 | 16 290 |
| Oppitunnin kehys (esittely, pikatarkistus, harjoitus, palkinto) | 724 | 42 694 |
| Demot | 636 | 87 556 |
| Tehtävätekstit (ohje, selitys, vihje, vaihtoehto, kuuntelu) | 1 836 | 82 763 |
| Palat ja luvut 0–100 | 102 | 1 787 |
| **Yhteensä** | **3 479** | **231 544** |

### Lukujen lukutapa

`tools/audiogen/lib/spoken.mjs` kirjoittaa näkyvän tekstin puhuttavaksi. Kaikki kerrotut sanat taipuvat:

- Murtoluvut: 3/4 → ”kolme neljäsosaa”, 5/16 → ”viisi kuudestoistaosaa”.
- Taivutus seuraavan sanan mukaan: ”4 sekunnissa” → ”neljässä sekunnissa”, ”40 m radan” → ”neljänkymmenen metrin radan”. Kaksoispisteellä merkitty pääte: ”10:llä” → ”kymmenellä”.
- Yksiköt: m/s → ”metriä sekunnissa”, m/s² → ”metriä sekunnissa toiseen”. Muunnokset: ”m → cm” → ”metreistä senttimetreiksi”.
- Välit ja kellonajat: ”0–3 s” → ”nollasta kolmeen sekuntiin”, 9.45 → ”yhdeksän neljäkymmentäviisi”.
- Desimaaliluvut numero kerrallaan: 3,07 → ”kolme pilkku nolla seitsemän”. Tapa vastaa sitä, miten desimaalitunti itse puhuu.
- Merkinnät: ”=” → ”on”; jakolasku → ”jaettuna” ja jakaja adessiivissa. Verranto: 2 : 5 = 6 : 15 → ”kaksi suhteessa viiteen on kuusi suhteessa viiteentoista”.
- Kirjainmuuttujat: x → ”äks”, y:n → ”yyn”, kx → ”koo äks”, Δx → ”delta äks”. Pisteet: (2, 3) → ”piste kaksi, kolme”.

Tilat `lite.json`-katalogissa:

- `rules`: 815 repliikkiä, puhemuoto säännöistä.
- `manual`: 7 repliikkiä, joihin säännöt eivät yllä. Claude kirjoitti ne käsin tiedostoon `spoken-overrides.json`.
- `identity`: loput, luetaan sellaisenaan.

**Ihminen ei ole lukenut näitä puhemuotoja.** Ne ovat sääntöjen tulosta ja kuuluvat kuunneltaviin.

### Litterointitarkistus ymmärtää numerot

Realtime-palvelu palauttaa litteroinnissa luvut usein numeroina (”12 metriä”). Litterointi luetaan nyt samoilla säännöillä, ja kirjaimia verrataan ilman välilyöntejä. Osuma merkitään `via: 'digits-read'`, ja numerorepliikit on edelleen merkitty kuunneltaviksi.

### Paloista koottu repliikki

Väärän vastauksen palaute (`vihje\nselitys`) ja kertaus (`Muistatko vielä? esittely`) koostuvat kahdesta tekstistä. Jos koko repliikille ei ole tiedostoa, soitin pilkkoo sen rivinvaihdoista ja lauseiden lopuista. Se etsii ensin pisimmät peräkkäiset palat, joille on tiedosto, ja soittaa ne peräkkäin yhtenä repliikkinä: yksi alku, yksi loppu, yksi pysäytys.

Jos yksikin pala puuttuu, koko repliikki menee selaimen äänelle. Saman repliikin sisällä ääni ei koskaan vaihdu. Testit: `lite/tests/audio.test.ts` (kolme uutta).

### Koko ja bittinopeus

Uusi katalogi pakataan 32 kbps:n mono-MP3:ksi, ydinkirjasto pysyy 80 kbps:ssä. Todellinen bittinopeus kirjataan jokaisen tiedoston alkuperätietoon.

- Kestoarvio ensimmäisistä otoista: 76 ms/merkki eli noin 4,9 tuntia ja noin 70 Mt.
- Tiedostot ladataan vasta, kun repliikki soi. Lapsen laite ei siis lataa kirjastoa kerralla.

## 10. Vastaukset: vaihtuvat luvut

Lähtötieto on sama näyte, 1 600 siementä × 181 noodia × 4 vaihetta. Kiinteän katalogin ulkopuolelle jää **241 608 eri repliikkiä (13,1 miljoonaa merkkiä)**, ja määrä kasvaa yhä siemenmäärän mukana. Kun luvut peitetään, jäljelle jää 31 017 eri lausepohjaa. Eri lukuja on 13 004: kokonaislukuja 6 014 (−81…90 000) ja desimaalilukuja 6 990.

**1. Voiko tehdä API-putken, joka tallentaa tuotetun repliikin palvelimelle ja soittaa sen sieltä seuraavalla kerralla?**
Teknisesti voi. Tarvitaan palvelin, joka pitää avaimen: selain ei saa nähdä sitä. Lite on nyt staattinen sivusto, eikä käyttöönotto kuulu tähän työhön.

- Kulku: sovellus kysyy palvelimelta tekstin tiivisteellä. Jos tiedosto on valmiina, se soi heti. Jos ei, palvelin tuottaa sen (1–3 s), tallentaa ja palauttaa.
- Jaettu välimuisti tekee hinnasta riippuvaisen eri repliikkien määrästä, ei käyttäjistä.
- Heikkoudet: kukaan ei ehdi kuunnella repliikkiä ennen kuin lapsi kuulee sen. Ensimmäinen kuulija odottaa. Palvelin, avain, kulukatto ja väärinkäytön esto ovat pysyvää ylläpitoa.

**2. Kuinka monta lukusanaa tarvitaan, jotta Sammakon luvut ja laskut katetaan?**

- **Kokonaisina lukuina:** 13 004 eri lukua, ja taivutettuina moninkertaisesti. Suomessa luku taipuu (”neljässä”, ”kahdeksastatoista”), joten sama luku tarvitaan jopa seitsemässä sijamuodossa.
- **Osista koottuna:** noin 40 perusosaa (0–19, kymmenet, sata, tuhat, ”pilkku”, ”miinus”) × 7 sijaa ≈ 300 klippiä.
- Liitetty luku kuulostaa kuitenkin katkonaiselta (”kaksi|tuhatta|neljä|sataa”). Lisäksi lausepohjia on 31 017, ja jokaisen lukujen väliset palat tarvitsisivat omat klippinsä.
- Liimaus on realistinen vain lyhyille laskuriäänille. Ne ovat nyt mukana: luvut 0–100.

**3. Onko tämä realistinen tapa, ja paljonko koko Sammakko Liten kulutus olisi käyttäjää kohden, jos kaikki lukusanat tuotetaan API:ssa?**

- **Ilman välimuistia:** keskimääräisessä tehtävässä puhutaan ohje (61 merkkiä) ja selitys (55), ja joka kolmannessa vihje (62). Yhteensä noin 135 merkkiä tehtävää kohden.
  - Koko Lite on 181 noodia × noin 9 tehtävää ≈ 1 600 tehtävää ≈ 220 000 merkkiä ≈ **noin 8 $ käyttäjää kohden** yhdellä läpikäynnillä (gpt-realtime-2.1-mini, toteutunut hinta). Kertaukset tulevat päälle.
- **Jaetulla välimuistilla:** hinta lähestyy kaikkien eri repliikkien summaa. Jo 1 600 siemenellä se on 13,1 M merkkiä ≈ **490 $**, eikä joukko ole sulkeutunut.
- Palvelinkulut tulevat molempien päälle.

Johtopäätös: mahdollinen, mutta käyttäjämäärästä riippumaton pohjahinta on satoja dollareita, eikä kukaan ehdi kuunnella repliikkejä etukäteen. Kiinteä katalogi (noin 9 $ kerran) kattaa ne repliikit, joissa ääni painaa eniten.

**4. Jos API ei vastaa ja luku luetaan selaimella, onko se heikkous?**
On. Ääni vaihtaa kesken tunnin kertojan äänestä laitteen ääneen, ja laitteen äänen laatu vaihtelee: iOS:ssa hyvä, osassa Android-laitteita kömpelö.

- Vaikutusta lievennetään jo nyt: yksi repliikki on aina kokonaan tiedostoa tai kokonaan selaimen ääntä, ei koskaan sekaisin.
- Tiedostoa ilman jäävä repliikki odottaa vain selaimen ääntä, ei verkkoa.
- Palvelinputkessa tilanne olisi huonompi: verkon viive tai katkos vaihtaisi äänen arvaamattomasti.

**5. Pitäisikö vaihtoehtoja ja lukuja vähentää tarkoituksella, eli tehdä tehtävistä staattisia generoinnin sijaan?**
Ei kannata tehdä äänen takia. Vaihtelevat luvut ovat osa opetusta: lapsi ei voi oppia vastausta ulkoa, ja kertaus näyttää uuden luvun. Opetussisältöä ei myöskään muuteta tässä työssä. Jos asiaa harkitaan, se on pedagoginen päätös, ja vaihtoehdot ovat:

- **Kiinteä siemenvarasto:** esim. 8 vaihtoehtoa vaihetta kohden. Tehtävät pysyvät samoina, mutta arvonta valitsee listalta. Arvio noin 13 000 repliikkiä, noin 30 $ ja noin 200 Mt 32 kbps:llä. Ulkoa oppimisen riski kasvaa.
- **Luku irti lauseesta:** esim. ”Paljonko on tässä?” ja luku näytöllä. Tämä muuttaa tehtävätekstejä, joten se vaatii sisällön tarkistuksen.
- **Nykyinen jako:** kiinteä teksti tiedostona, vaihtuva luku selaimen äänellä. Tämä on suositus.

Data näyttää, mitkä noodit ovat jo valmiiksi suljettuja: niiden repliikkimäärä ei kasva 400 → 1 600 siemenellä. Ohjetekstien noodi–laji-yhdistelmistä 105/181 on sulkeutunut, selityksistä 84 ja vaihtoehdoista 161. Näissä generointi ei tuota uutta ääntä, ja ne voi myöhemmin lisätä kiinteään katalogiin ilman sisällön muutosta.
