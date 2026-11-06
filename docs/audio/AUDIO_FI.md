# Sammakko Liten äänimaailma (staattinen, v1)

Tila 2.11.2026 (ilta): ydinkirjasto 58/58 repliikkiä hyväksytty kuuntelun jälkeen. Oppituntikirjasto (`lite-fi`) on tuotettu kokonaan: 3 465/3 479 repliikkiä on väliaikaisina pilottipaketissa (noin 76 Mt). Uusi otto korjasi 101 litterointipoikkeamaa 113:sta ja 36 tyhjää tai katkennutta ottoa 38:sta. Loput 14 soivat selaimen äänellä (ks. YLEISET_VIRHEET_JA_KORJAUKSET_690_FI.md, luvut 7–8). Ensimmäisen paketin oppituntitiedostot olivat pakkausvirheen takia hiljaisia; ne on pakattu uudelleen ja tarkistettu dekoodaamalla. Mitään oppituntiäänistä ei ole vielä kuunneltu.

## 181-julkaisun päätös 2.11.2026

Omistaja sallii nykyisen äänenlaadun, puhemuotojen tunnetut puutteet ja kuuntelemattoman äänipilotin 181-julkaisuun. Puhemuotoja ei korjata nyt. Ihmiskatselmointi ajoitetaan 181-julkaisun jälkeen; täysi ihmisbeta kuuluu täyden Sammakon vaiheeseen. Kaikkien raitojen `approved`-tila tai `pilot: false` eivät ole 181-julkaisun ennakkoehtoja. Nykyiset hyväksyntä- ja pilot-merkinnät säilyvät todenmukaisina.

Päätös, tunnetut virheet, tekninen korjausjono ja 690-vaiheen korjauserät ovat dokumentissa [Yleiset virheet ja korjaukset — 181:stä kohti 690:tä](YLEISET_VIRHEET_JA_KORJAUKSET_690_FI.md). Tämä linjaus täsmentää jäljempänä kuvattua yksittäisten äänten kuunteluhyväksyntää: myöhempi kuuntelutyö ei ole 181:n julkaisuportti.

## 1. Miten sovellus valitsee äänen

Jokainen `say()`-kutsu ratkaistaan tässä järjestyksessä:

1. **Julkaisumanifestissa oleva tiedosto** (181-pilotissa myös kuuntelematon `provisional`-tallenne), jos `lite/public/audio/manifest.json` sisältää täsmälleen saman puhujan ja tekstin. Avain on `puhuja|FNV-1a-64(puhuja + "\n" + NFC-normalisoitu teksti)`. Tekstin pienikin muutos tekee avaimesta eri avaimen, jolloin vanhaa tiedostoa ei koskaan lueta väärän tekstin päälle.
2. **Selaimen suomenkielinen ääni** (`speechSynthesis`), jos se on olemassa.
3. **Hiljaisuus.** Teksti pysyy näkyvissä. Kuuntelutehtävät arvotaan uudelleen vain, jos jotain niiden repliikkiä ei voi kuulla.

Puhekanavia on yksi. Uusi repliikki katkaisee edellisen. `after`-jono on enintään 3 repliikkiä. `hush()` (näkymän vaihto) tyhjentää jonon ja pysäyttää myös latautuvat tehosteet. Jokaisella toistolla on vahtiajastin, eikä puuttuva `ended`-tapahtuma pysäytä tehtävää. Tarina merkitään kuulluksi vasta onnistuneen toiston jälkeen.

Tehosteet ovat Web Audio -puskureita. Asetukset:

- oma kytkin (🔔/🔕 Pajassa ja ”Tehosteäänet pois/päälle” Aikuiselle-sivulla, `sammakko-lite-sfx`), ja hiljainen tila vaimentaa myös tehosteet;
- aikuisen ”Pysäytä hahmojen liike ja äänet” (`calm-chars`) hiljentää hahmojen koristeäänet (`aava.*`, `loikka.*`); palauteäänet ja puhe säilyvät;
- piilotettu välilehti pysäyttää puheen ja tehosteet ja keskeyttää `AudioContext`in; mikään ei jatku itsestään, vaan seuraava napautus avaa äänen; `pagehide` sulkee kontekstin ja vapauttaa puskurit;
- enintään 4 samanaikaista tehostetta, 16 Mt:n puskuribudjetti;
- yli 350 ms myöhästynyt dekoodaus jätetään soittamatta;
- variantti valitaan omalla satunnaisuudellaan, ei tehtävägeneraattorin siemenellä.

Ääni avataan vasta käyttäjän napautuksesta tai näppäimestä.

## 2. Tiedostot

| Polku | Sisältö | Repossa? |
|---|---|---|
| `audio/voices.json` | puhujaprofiilit (malli, ääni, tyyliversio, ohje) | kyllä |
| `audio/catalog/fi-FI/inventory.json` | AST-inventaario Liten lähteistä (laskuri, ei kattavuus) | kyllä |
| `audio/catalog/fi-FI/core.json` | v1-ydinkatalogi: näyttöteksti, puheteksti, tila | kyllä |
| `audio/catalog/fi-FI/audition.json` | kuunteluvertailun repliikit | kyllä |
| `audio/provenance/*.json` | jokaisen julkaistun tiedoston alkuperä ja tiivisteet | kyllä |
| `lite/public/audio/` | julkaistavat, tiivisteellä nimetyt tiedostot + manifest | kyllä |
| `~/Library/Application Support/sammakko-audiogen/` | kulukirjanpito, raakaehdokkaat, WAV-masterit, kuuntelusivu | **ei** |

## 3. Tuotantoketju

```bash
node tools/audiogen/cli.mjs inventory
```

```bash
node tools/audiogen/cli.mjs catalog
```

```bash
node tools/audiogen/cli.mjs plan --scope core-fi
```

```bash
node tools/audiogen/cli.mjs render --scope audition-fi
```

Komentojen toiminta:

- `render` on oletuksena dry-run: se ei lue avainta eikä lähetä mitään.
- Maksullinen ajo vaatii `--live --budget-usd N`.
- Ennen jokaista pyyntöä tarkistetaan kolme rajaa: erän budjetti, ääniprojektin katto 15 $ ja **yhteinen** OpenAI-kuukausikatto (kuvageneraattorin kuukauden kulut + ääni ≤ 80 $). Ääni ei siis saa omaa 80 $:n kiintiötä.
- Kirjanpito toimii varauksin:
  - ennen pyyntöä varataan arvio;
  - onnistunut pyyntö tilitetään vastauksen `usage`-luvuilla;
  - lähtemättä jäänyt pyyntö vapautetaan;
  - epäselvä pyyntö jää kuluksi.
- Malli on `gpt-realtime-2.1-mini` Realtime-WebSocketin kautta. Jokainen repliikki on oma `conversation: "none"` -vastauksensa, jossa on eksplisiittinen syöte. `/v1/audio/speech`-mallit poistuvat 6.1.2027, joten niitä ei käytetä.
- Raaka PCM (24 kHz) käsitellään näin: hiljaisuus trimmataan, RMS normalisoidaan −20 dB:iin, huipun katto on −1 dBFS ja reunoille tulee 5 ms:n liukumat. Tulos tallennetaan WAV-masteriksi tilakansioon. Litteraattia verrataan puhetekstiin. Numerot merkitään aina kuunneltaviksi.

```bash
node tools/audiogen/cli.mjs audition --scope audition-fi
```

```bash
node tools/audiogen/cli.mjs approve <id> --candidate <wav> --by <nimi>
```

```bash
node tools/audiogen/cli.mjs pack
```

```bash
node tools/audiogen/cli.mjs verify
```

`pack` paketoi vain hyväksytyt. `pack --pilot` paketoi myös väliaikaiset `provisional`-puheet ja ehdokastehosteet sekä merkitsee manifestin `pilot: true`. Nykyinen pilotti on sallittu 181-julkaisuun yllä olevan omistajapäätöksen mukaisesti; paketointi ei muuta yksittäisten tallenteiden hyväksyntätilaa. MP3-pakkaus tehdään lamejs-kirjastolla tilakansiosta (`<state>/tools`). Bittinopeus määräytyy laajuuden mukaan: ydin 80 kbps, oppitunnit 32 kbps.

**Signaalitarkistus.** lamejs valitsee 32 kbps:llä 22,05 kHz:n näytteenottotaajuuden, ja sen oma 24 → 22,05 kHz -muunnos tuotti pelkkää hiljaisuutta. Siksi kaikki ensimmäisen laajennuksen oppituntitiedostot (3 467 kpl) olivat hiljaisia, vaikka koko ja tiiviste näyttivät oikeilta. Nyt `pack` muuntaa näytteenottotaajuuden itse (ikkunoitu sinc, `lib/wav.mjs: resample`) ennen lamejs:ää. Lisäksi se dekoodaa jokaisen valmiin MP3:n (macOS `afconvert`, muualla `ffmpeg`) ja keskeyttää ajon, jos tiedoston taso poikkeaa masterista yli 3 dB tai kesto yli 0,3 s. Mitattu taso tallentuu alkuperätietoon (`asset.decoded`). `verify` tarkistaa tallennetut mittaukset, ja `verify --signal` dekoodaa kaikki tiedostot uudelleen. `lite/tests/audio.test.ts` vaatii mittauksen jokaiselta manifestin puhetiedostolta.

### Avain

Avain on vain macOS Keychainissa (palvelu `sammakko-openai-audiogen`). Sitä ei saa olla repossa, `VITE_*`-muuttujissa, bundlessa tai lokeissa. CI ja build eivät koskaan kutsu puhemallia.

```bash
pbpaste | node tools/audiogen/cli.mjs key-set
```

Käytä omaa projektiavainta, jolla on Realtime-oikeus ja OpenAI-konsolissa oma kuukausiraja. Kuvageneraattorin avain on rajattu kuviin.

## 4. Tehosteet

Palettiin kuuluu 12 perhettä ja 27 varianttia: `aava.notice/joy/wing`, `loikka.croak/joy/push`, `land.dry/wet`, `water.splash`, `ui.select/confirm/retry`. Ne syntetisoidaan deterministisesti (`sfx-synth/1`, `tools/audiogen/lib/sfx.mjs`). Poikkeus: `loikka.croak` ja `loikka.joy` leikataan vapaan kirjaston tallenteesta, jonka määrittely on tiedostossa `audio/library/sfx.json`. Lähdetiedosto haetaan käsin ja tallennetaan polkuun `<tilakansio>/library/`. Sen SHA-256 tarkistetaan. Resepti ja siemen ovat master, ja sama versio tuottaa tavulleen saman tiedoston. Kaikki ovat **ehdokkaita**, kunnes ne on kuunneltu.

```bash
node tools/audiogen/cli.mjs sfx
```

| Tapahtuma | Tehoste |
|---|---|
| oikea vastaus | `ui.confirm`, sitten kehu |
| väärä vastaus | `ui.retry` (hiljainen, ei rangaistusääntä) |
| Pajan hyppy | `loikka.push` lähtiessä, `land.wet` (ranta) / `land.dry` perillä |
| Pajan juhla | `aava.joy` |
| esittelykortti | `aava.notice` / `loikka.croak`, puhe 450 ms myöhemmin |
| lento | `aava.wing` (enintään 300 ms välein), `water.splash`, `ui.confirm` renkaasta, `land.dry` laskeutuessa |

### Äänimaisema (tuuli ja liplatus, 4.11.2026)

Litessä on kaksi taustasilmukkaa: `amb.wind` (tuuli kaislikossa) ja `amb.lap` (järven liplatus). Ne ovat maailman äänipaketin (`tools/audiogen/lib/world.mjs`, `audio/library/world.json`) leikattuja, tasoitettuja ja saumattomiksi liimattuja CC0-äänitteitä. Omistaja kuunteli ehdokkaat studiossa ja valitsi 4.11.2026 kummastakin vaihtoehdon 2. Valinta ja hyväksyntä on kirjattu `audio/provenance/world.json`-tiedostoon.

| Perhe | Tiedosto | Pituus | Silmukka | Lähde |
|---|---|---|---|---|
| `amb.wind` | `amb/amb.wind-2.0823f03e7f.mp3` (137 kt) | 17,5 s | uusi kopio 16 s välein, ristihäivytys 1,5 s | *Juist-Hear-the-Gras, Sound of Reed in Wind*, the_very_Real_Horst, Freesound, CC0 |
| `amb.lap` | `amb/amb.lap-2.8ba7781cc0.mp3` (119 kt) | 15,2 s | uusi kopio 14 s välein, ristihäivytys 1,2 s | *Water waves lapping, lake, gentle, close*, TRP, Freesound, CC0 |

```bash
node tools/audiogen/cli.mjs ambient
```

Komento kopioi hyväksytyt silmukat tilakansiosta polkuun `lite/public/audio/amb/`, tarkistaa niiden SHA-256:n ja kirjoittaa manifestin `ambient`-kohdan. Puhe ja tehosteet jäävät ennalleen. `pack` tekee saman osana koko pakkausta, ja `verify` tarkistaa, että jokainen silmukka on hyväksytty maailman paketissa (sha, perhe, pituus, jakso ja ristihäivytys).

Soitto (`lite/src/audio/ambient.ts`):

- **Oletuksena pois.** Päälle sen saa Aikuiselle-sivun napista *Äänimaisema päälle* tai Pajan 🌊-napista. Valinta tallentuu avaimeen `sammakko-lite-ambient`. Tiedostoja ei haeta ennen kuin asetus on päällä.
- Ääni ei koskaan avaudu itsestään. Se alkaa vasta ensimmäisestä napautuksesta tai näppäilystä (sama sääntö kuin tehosteilla) ja voimistuu 2,5 sekunnin aikana.
- Ristihäivytys on tasatehoinen (sin sisään, cos ulos), sama jonka `audiogen` mittasi pakkauksen jälkeen. Jokainen kopio alkaa ensimmäisestä äänellisestä näytteestä, jolloin MP3-dekooderin viive ei näy saumassa. Silmukassa ei ole satunnaisuutta, eikä se lue oppimismallia eikä tehtävien satunnaislukuja.
- Äänimaisema kulkee tehosteiden väylän kautta, joten sen taso suhteessa tehosteisiin on sama kuin studiossa. Oppitunnilla taso on 0,55 ja puheen aikana 0,35 (pehmeä väistö).
- Hiljainen tila vaimentaa sen. Rauhalliset hahmot eivät vaimenna, koska äänimaisemalla on oma kytkimensä.
- Piilotettu välilehti pysäyttää sen, ja sivulta poistuminen vapauttaa kaiken. Takaisin palatessa soitto jatkuu seuraavasta napautuksesta.

## 5. Oikeudet ja tekoälyäänen ilmoitus

- **Tehosteet:** omaa proseduraalista synteesiä. Poikkeus on Loikan kurnaus: puusammakon soidinhuuto *Laubfrosch Balzruf*, Rabe19, Wikimedia Commons, public domain (https://commons.wikimedia.org/wiki/File:Laubfrosch_Balzruf.OGG). Kirjastoista käytetään vain public domain- ja CC0-aineistoa.
- **Äänimaisema:** Freesoundin CC0-äänitteitä (CC0 1.0, https://creativecommons.org/publicdomain/zero/1.0/). Tuuli: *Juist-Hear-the-Gras, Sound of Reed in Wind*, the_very_Real_Horst (https://freesound.org/people/the_very_Real_Horst/sounds/250815/). Liplatus: *200906 Water waves lapping, lake, gentle, close*, TRP (https://freesound.org/people/TRP/sounds/568819/). CC0 ei vaadi mainintaa, mutta tekijät kiitetään silti, ja Aikuiselle-sivu kertoo, että äänet ovat vapaita luontoäänitteitä. Lähdetiedostojen tiivisteet ja hakupäivät ovat `audio/library/world.json`-tiedostossa.
- **Puhe:** OpenAI:n tuottamaa synteettistä puhetta. OpenAI:n käyttöehtojen mukaan tuotos kuuluu käyttäjälle. Ääni ei saa jäljitellä todellista henkilöä. Käyttäjille on kerrottava, että ääni on tekoälyn tuottama.
- Ennen kuin ensimmäinen puhetiedosto julkaistaan, Aikuiselle-sivulle lisätään lause: *”Hahmojen ja kertojan puhe on tekoälyllä tuotettua (OpenAI).”*
- Provenienssi tallentaa jokaisesta tiedostosta mallin, äänen, tyyliversion, syötetiivisteen, vastauksen tunnisteen, hyväksyjän ja päivämäärän.

## 6. Myöhempi kuuntelutarkistus (yksittäisen tallenteen hyväksyntä)

Tämä lista kuuluu 181-julkaisun jälkeiseen katselmointiin. Se ei ole nykyisen 181-julkaisun ennakkoehto. Jo kirjattuja ydinpuheiden ja tehosteiden hyväksyntöjä ei avata uudelleen pelkästään tämän listan vuoksi.

- [ ] Vertaa `marin`- ja `cedar`-ääntä kuuntelusivulla. Valitse ääni Aavalle, Loikalle ja kertojalle ja kirjaa valinnat `audio/voices.json`-tiedostoon.
- [ ] Jokainen repliikki: sanat täsmälleen oikein, ei lisättyjä tervehdyksiä tai vastauksia.
- [ ] Ääntäminen: ä/ö, pitkät vokaalit ja kaksoiskonsonantit (*tuulla/tulla, mutta/muta*), nimet *Aava, Loikka, Sulka, Paja*.
- [ ] Numerot ja matematiikka luetaan hyväksytyn puhemuodon mukaan (*kolme ja puoli, miinus viisi*).
- [ ] Tahti on rauhallinen, ei kiirettä. Tauko pilkun ja pisteen kohdalla. Ei katkennutta loppua.
- [ ] Tasot: puhe kuuluu tehosteiden yli puhelimen kaiuttimesta ja kuulokkeista. Ei säröä eikä naksahduksia.
- [ ] Tehosteet (27): sopiiko kukin tapahtumaansa, eikä mikään kuulosta rangaistukselta. `ui.retry` on pehmeä. Variantit eivät ärsytä toistuessaan.
- [ ] Hylätyt ehdokkaat merkitään `reject`-komennolla, eikä niitä julkaista.

## 7. Oma ääninäyttely (äänitysstudio)

```bash
node tools/audiogen/studio.mjs
```

Avaa http://localhost:5230.

1. Äänitä repliikki: R tai ● Äänitä. Pysäytä samalla tavalla.
2. Kuuntele oma otto ja tekoälyotto (▶). Valitse parempi radionapista.
3. Kun valinnat on tehty, vie ne sovellukseen:

```bash
node tools/audiogen/cli.mjs takes
```

```bash
node tools/audiogen/cli.mjs pack --pilot
```

```bash
node tools/audiogen/cli.mjs verify
```

Otot pysyvät koneella `<tilakansio>/takes/`-kansiossa. Repoon ja sovellukseen menevät vain valitut, normalisoidut tiedostot. Niiden provenienssiin kirjataan `provider: self-recorded`.

Vinkki: äänitä hiljaisessa, pehmeässä huoneessa, aina samalla mikrofonilla ja samalla etäisyydellä (noin 15–20 cm). Tasomittarin pitäisi käydä puolivälissä, ei punaisella.

## 8. Oppituntien puhe (`lite-fi`)

Oppituntien kiinteät repliikit tuotetaan omana laajuutenaan. Ydinkirjasto pysyy ennallaan.

```bash
SPEECH_SAMPLE=1600 SPEECH_OUT=/abs/polku/otos.json npx vitest run tests/zz-speech-sample.test.ts
```

```bash
node tools/audiogen/cli.mjs catalog-lite --sample /abs/polku/otos.json
```

```bash
node tools/audiogen/cli.mjs render --scope lite-fi --kind map.intro --live --budget-usd 2
```

```bash
node tools/audiogen/cli.mjs provisional --scope lite-fi
```

```bash
node tools/audiogen/cli.mjs pack --pilot
```

- Otostesti (ajetaan `lite/`-kansiossa) ajaa jokaisen tehtävägeneraattorin monella siemenellä ja kirjaa jokaisen repliikin. Tiedosto on suuri, eikä sitä viedä repoon.
- `catalog-lite` kirjoittaa `audio/catalog/fi-FI/lite.json`. Mukaan tulevat repliikit, jotka eivät vaihtele siemenen mukaan: karttaesittelyt, tuntien aloitukset, palkinnot, demot ja kiinteät vastausvaihtoehdot. Lisäksi mukana ovat lukusanat 0–100 ja ”Muistatko vielä?”.
- Luvut, murtoluvut, kellonajat, yksiköt ja merkit muutetaan puhemuotoon säännöillä (`tools/audiogen/lib/spoken.mjs`). Esimerkiksi 3/4 luetaan ”kolme neljäsosaa” ja 0–3 s luetaan ”nollasta kolmeen sekuntiin”. Käsin kirjoitetut poikkeukset ovat tiedostossa `spoken-overrides.json`. Repliikki, jota säännöt eivät osaa, merkitään `needs-review`-tilaan, eikä `render` tuota sitä.
- Litteraatin tarkistus hyväksyy numeroina kirjoitetun litteraatin, kun numerot sääntöjen mukaan luettuina vastaavat puhetekstiä (`via: digits-read`).
- `provisional` ottaa mukaan vain ehdokkaat, joiden litteraatti vastaa tekstiä. Ne ovat väliaikaisia, kunnes ne on kuunneltu ja hyväksytty.
- `render --kind` rajaa ajon yhteen repliikkilajiin. Lajit tuotetaan tässä järjestyksessä: karttaesittelyt, tuntien aloitukset, palkinnot, demot ja vastausvaihtoehdot.

**Paloista toistaminen.** Jos koko repliikille ei ole tiedostoa, soitin jakaa sen rivinvaihdoista ja virkkeiden lopuista. Se soittaa peräkkäin pisimmät palat, joille on tiedosto. Esimerkiksi ”Muistatko vielä? …” soi kahdesta tiedostosta. Jos yksikin pala puuttuu, koko repliikki menee selaimen äänelle. Samaan repliikkiin ei koskaan sekoiteta tiedostoa ja selaimen ääntä.

**Koko ja hinta (mitattu).**

| | Repliikkejä | Merkkejä | Arvio | Koko 32 kbps:llä |
|---|---|---|---|---|
| Koko `lite-fi` | 3 479 (pakettiin 3 465) | 231 544 | 9,20 $ (karttaesittelyt 0,60 $ + muut 8,10 $ + uusintaotot 0,38 $ + tyhjien ottojen uusinnat 0,12 $) | noin 76 Mt |

Tiedostot ladataan vasta, kun repliikki soi, joten käyttäjä ei lataa koko kirjastoa. Testi rajaa ytimen alle 8 Mt:n ja oppituntitiedostot alle 80 Mt:n.

Arvottujen tehtävien repliikit (luvut ja laskut) jäävät selaimen äänelle. Perustelut ja laskelmat ovat tiedostossa `REVIEW_FI.md`, luku 10.
