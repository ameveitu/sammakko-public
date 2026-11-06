# Sammakon kuvageneraattori (OpenAI)

Pieni komentorivityökalu, jolla tehdään Sammakon kuvia OpenAI:n kuvamallilla: hahmoja, spritejä, kuvakkeita, tekstuureja ja taustoja kotisivulle (`public/kotisivu/`), Sammakko Litelle (`lite/`) ja myöhemmin täydelle Sammakolle.

- **Ei riippuvuuksia.** Työkalu tarvitsee vain Noden (≥ 20) ja macOS:n. `npm install` ei ole tarpeen.
- **Oletuksena dry-run.** Ilman lippua `--live` työkalu ei lue avainta, ei ota yhteyttä OpenAI:hin eikä käytä rahaa.
- **Avain on vain macOS Keychainissa.** Avainta ei voi antaa komentorivillä, eikä sitä tulosteta tai kirjoiteta tiedostoon.
- **Budjettivahti.** Kuukausikatto (oletus 80 $) ja ajokohtainen katto (oletus 5 $) tarkistetaan ennen jokaista kutsua.
- **Provenienssi.** Jokaisen kuvan viereen tallentuu `.json`-tiedosto, jossa ovat prompti, malli, parametrit, hinta-arvio, todellinen hinta ja tarkisteet.
- **Hyväksytyt hahmokuvat on suojattu.** Työkalu kieltäytyy kirjoittamasta kansioon `lite/public/characters/`.

> **Miksi työkalu on repon juuressa `tools/imagegen/`?** Sitä käyttävät sekä kotisivu (`public/`) että Lite (`lite/`), joten se ei kuulu kummankaan sisään. Repossa se on versioitu ja varmuuskopioitu GitHubiin. Kulukirjanpito ja asetukset ovat repon ulkopuolella (`~/Library/Application Support/sammakko-imagegen/`), joten sama budjetti pätee, vaikka työkalua ajettaisiin toisesta kloonista tai täyden Sammakon reposta.

---

## 1. Nykyinen OpenAI-kuvamalli (tarkistettu 1.11.2026)

Lähteet: OpenAI:n viralliset dokumentit ([kuvaopas](https://developers.openai.com/api/docs/guides/image-generation), [hinnasto](https://developers.openai.com/api/docs/pricing), [mallisivu](https://developers.openai.com/api/docs/models/gpt-image-2.5-flare), [edits-rajapinta](https://developers.openai.com/api/reference/resources/images/methods/edit)).

| Asia | Tilanne |
|---|---|
| Uusimmat mallit | `gpt-image-2.5-flare` (nopea arkikäyttö, **työkalun oletus**) ja `gpt-image-2.5-sunburst` (tarkin editointi). Molemmat julkaistiin 8.9.2026. |
| Vanhemmat | `gpt-image-2`, `gpt-image-1.5`, `gpt-image-1-mini`, `chatgpt-image-latest`. `gpt-image-1` suljettiin 23.10.2026. |
| Hinta | 2.5- ja 2-mallit: kuvan tuotto 30 $ / 1M tokenia, kuvasyöte 8 $ / 1M ja teksti 5 $ / 1M. Batch-API maksaa puolet. |
| Hinta per kuva (gpt-image-2, 1024×1024) | low ≈ 0,006 $, medium ≈ 0,053 $, high ≈ 0,211 $. 2.5-malleille OpenAI ei julkaise kiinteää taulukkoa, koska tokenimäärä vaihtelee. Työkalu arvioi siksi varovaisesti: `xhigh` = 2 × high ja `max` = 4 × high. Todellinen hinta luetaan vastauksen `usage`-kentästä. |
| Laatu | `low`, `medium`, `high`, `auto`. `xhigh` ja `max` toimivat vain 2.5-malleissa. |
| Koot | `1024x1024`, `1536x1024`, `1024x1536` tai oma `LxK`: sivut 16:n monikertoja, pisin sivu enintään 3840, kuvasuhde enintään 3:1 ja pikseleitä 655 360–8 294 400. Yli 2560×1440 on kokeellinen. |
| Läpinäkyvä tausta | `background: transparent` ja muoto `png` tai `webp`. Toimii 2.5-malleissa. `gpt-image-2`:ssa ominaisuus on esikatseluvaiheessa. |
| Editointi | `POST /v1/images/edits`: 1–16 syöte- tai referenssikuvaa. Inpainting tehdään maskilla (alfakanavallinen PNG, sama koko kuin ensimmäisellä kuvalla). 2.5-malleissa on lisäksi `markup` (piirros kuvan päälle). Maski on ohjeellinen, eikä malli noudata sen reunoja pikselintarkasti. |
| Muut | `n` 1–10, `moderation` `auto`/`low`, prompti enintään 32 000 merkkiä. Vastaus palautetaan aina base64-muodossa, ei URL:na. |
| Nopeusrajat (Build-taso) | 20 kuvaa minuutissa ja 250 000 tokenia minuutissa. Työkalu ajaa erät peräkkäin ja odottaa automaattisesti, jos raja (429) tulee vastaan. |

Mallit ja hinnat ovat tiedostossa [`models.json`](models.json). **Päivitä se, kun OpenAI muuttaa hintoja.** Tarkista hinnasto ennen isoja eräajoja.

---

## 2. API-avaimen tallennus (tee tämä itse)

Avain kuuluu **vain** macOS Keychainiin. Älä liitä sitä keskusteluun Clauden tai muun tekoälyn kanssa, älä tallenna sitä `.env`-tiedostoon tai muistiinpanoihin, äläkä kirjoita sitä komentoriville.

### 2.1 Luo rajattu projektiavain OpenAI:n hallintapaneelissa

1. Avaa <https://platform.openai.com/> ja kirjaudu.
2. Luo kohdassa **Settings → Projects** uusi projekti, esimerkiksi **"Sammakko-kuvat"**. Näin kuvien kulut ja oikeudet pysyvät erillään kaikesta muusta.
3. Aseta projektille **Limits**-kohdassa kuukausibudjetti, esimerkiksi 80 $, ja hälytys esimerkiksi 50 $:n kohdalle. Tämä on varsinainen raja. Työkalun oma vahti näkee vain työkalun omat kutsut.
4. Rajaa samassa projektissa käytettävät mallit, jos valikko sallii (esimerkiksi vain `gpt-image-2.5-flare` ja `gpt-image-2.5-sunburst`).
5. Valitse **API keys → Create new secret key**:
   - **Project:** Sammakko-kuvat
   - **Permissions:** *Restricted*. Anna kirjoitusoikeus vain kuville (**Images**) ja jätä muut kohtaan *None*. Jos haluat, että työkalu voi myöhemmin tarkistaa malleja, anna Models-kohtaan lukuoikeus (*Read*).
   - Nimeksi vaikkapa `imagegen-macbook`.
6. Kopioi avain. OpenAI näyttää sen vain kerran.

(Valikoiden nimet voivat vaihdella hieman. Tärkeintä on, että avain kuuluu omaan projektiinsa, sen oikeudet on rajattu ja projektilla on kuukausiraja.)

### 2.2 Tallenna avain Keychainiin

Kopioi avain OpenAI:n sivulta leikepöydälle ja aja Päätteessä repon juuressa alla oleva komento. **Kirjoita komento sellaisenaan, ilman avainta.** Komento lukee avaimen suoraan leikepöydältä, joten se ei näy ruudulla eikä päädy shellin historiaan. Työkalu tarkistaa avaimen muodon, tallentaa sen Keychainiin ja varmistaa ilmaisella kyselyllä, että OpenAI hyväksyy sen.

```bash
pbpaste | node tools/imagegen/imagegen.mjs key-set
```

Tyhjennä sen jälkeen leikepöytä, jotta avain ei jää sinne:

```bash
pbcopy < /dev/null
```

Onnistuneen tallennuksen tulos on `✔ Avain tallennettu Keychainiin …` ja `✔ Avain on voimassa …`. Voit tarkistaa avaimen myöhemmin uudelleen. Ilman `--verify`-lippua komento ei ota yhteyttä OpenAI:hin, eikä tarkistus kummassakaan tapauksessa maksa mitään:

```bash
node tools/imagegen/imagegen.mjs key-check --verify
```

macOS voi kysyä ensimmäisellä kerralla, saako `security` lukea avaimen. Valitse **Salli** (tai **Salli aina**).

> **Älä käytä komentoa `security add-generic-password … -w` ilman arvoa.** Sen piilotettu kehote katkaisee syötteen 128 merkkiin, ja OpenAI:n projektiavaimet ovat sitä pidempiä. Katkennut avain antaa virheen `401 invalid_api_key`. `key-check` varoittaa, jos tallennetun avaimen pituus on tasan 128 merkkiä.

### 2.3 Avaimen vaihto ja poisto

- Kun haluat vaihtaa avaimen, aja kohdan 2.2 komento uudelleen. Uusi avain korvaa vanhan.
- Poista avain Keychainista näin:

```bash
security delete-generic-password -s sammakko-openai-imagegen -a imagegen
```

- **Jos avain on vuotanut** (näkynyt keskustelussa, kuvakaappauksessa, commitissa tai GitHubissa), mitätöi se heti OpenAI:n hallintapaneelissa (**API keys → Revoke**). Luo sitten uusi avain ja tallenna se kohdan 2.2 mukaan. Pelkkä commitin poistaminen ei riitä.

### 2.4 Ympäristömuuttuja on vain varavaihtoehto

Jos Keychainista ei löydy avainta, työkalu lukee muuttujan `OPENAI_API_KEY` ja varoittaa siitä. Sitä ei suositella, koska muuttujat näkyvät helposti lapsiprosesseille ja lokeille. Älä missään tapauksessa kirjoita avainta `export`-komennolla komentoriville, koska se jää shellin historiaan.

### 2.5 Avain ei koskaan päädy selaimeen

Liten Vite-buildi, kotisivu ja oppituntisivut ovat **julkista koodia**: kaikki niissä oleva näkyy jokaiselle kävijälle. Siksi:

- Kuvia generoidaan vain tällä työkalulla omalla koneella. Valmiit PNG:t kopioidaan sivustoon.
- Kansioihin `lite/src/`, `lite/public/`, `lite/index.html` ja `public/` ei saa tulla viittauksia `api.openai.com`-osoitteeseen, `OPENAI_API_KEY`-muuttujaan tai `VITE_OPENAI*`-muuttujiin. Salaisuusskanneri estää tämän.
- Vite paljastaa selaimelle vain `VITE_`-alkuiset muuttujat. Älä koskaan nimeä avainmuuttujaa `VITE_`-alkuiseksi.

### 2.6 Suojaukset repossa

| Suoja | Mitä se tekee |
|---|---|
| `.gitignore` | Estää tiedostot `.env`, `.env.*` (paitsi `.env.example`), `*.pem`, `*.p12` ja `*.key` sekä luonnoskansion `tools/imagegen/out/`. |
| `tools/secret-scan.mjs` | Etsii OpenAI-avaimia (`sk-…`), avainmuuttujien sijoituksia, Bearer-otsakkeita, yksityisiä avaimia ja selainkoodin OpenAI-viittauksia. Osumien arvoja se ei tulosta. |
| Pre-commit-koukku `tools/git-hooks/pre-commit` | Ajaa skannauksen ennen jokaista commitia vain lavastetuille muutoksille. |
| CI-jobi `secrets` | Ajaa koko repon skannauksen ja työkalun testit jokaisessa pushissa. |

Ota koukku käyttöön kerran jokaisessa kloonissa:

```bash
git config core.hooksPath tools/git-hooks
```

Voit tarkistaa koko repon käsin:

```bash
node tools/secret-scan.mjs --all
```

---

## 3. Pikaopas

Aja komennot repon juuresta. Ilman lippua `--live` mikään ei maksa.

```bash
node tools/imagegen/imagegen.mjs help
node tools/imagegen/imagegen.mjs templates
node tools/imagegen/imagegen.mjs gen --preset sprite --character aava --prompt "Aava" --var pose="jumping happily" --name aava-jump
```

Dry-run näyttää mallin, parametrit, hinta-arvion, kohdetiedoston ja budjettitilanteen. Lisää `--json`, niin näet täsmälleen sen pyynnön rungon, joka lähetettäisiin. Kun kaikki näyttää oikealta, lisää `--live`:

```bash
node tools/imagegen/imagegen.mjs gen --preset sprite --character aava --prompt "Aava" --var pose="jumping happily" --name aava-jump --live
```

Kuva tallentuu kansioon `tools/imagegen/out/aava-jump-<aikaleima>.png`, ja sen vieressä on `….png.json` (provenienssi).

**Kokeile ensin halvalla.** Luonnokset kannattaa tehdä esiasetuksella `--preset draft` tai valinnalla `--quality low` (alle 1 sentti kuvalta). Kun sommitelma toimii, tee lopullinen versio laadulla `high`.

### Esiasetukset

| `--preset` | Koko | Laatu | Tausta | Käyttö |
|---|---|---|---|---|
| `sprite` | 1024×1024 | high | läpinäkyvä | Hahmon asento tai pelisprite |
| `character` | 1024×1536 | high | läpinäkyvä | Kokovartalohahmo |
| `icon` | 1024×1024 | medium | läpinäkyvä | Esineet ja palkinnot |
| `texture` | 1024×1024 | medium | peittävä | Saumaton tekstuuri |
| `background` | 1536×1024 | high | peittävä | Kotisivun tai pelin tausta |
| `draft` | 1024×1024 | low | auto | Halpa ideointi |

Valinnat `--size`, `--quality`, `--model` ja muut ohittavat esiasetuksen arvot.

### Editointi ja referenssikuvat

```bash
# Uusi asento olemassa olevan hahmon pohjalta (sunburst on tarkin editoinnissa)
node tools/imagegen/imagegen.mjs edit --model sunburst \
  --image lite/public/characters/aava/idle.png \
  --template edit-keep-character --var change="Aava is waving one wing" \
  --background transparent --size 1024x1024 --quality high --name aava-wave

# Inpainting: maskin läpinäkyvä alue muokataan
node tools/imagegen/imagegen.mjs edit --image tausta.png --mask maski.png \
  --prompt "add a small wooden pier on the shore" --name pier
```

Syötekuvat luetaan vain lukemista varten. Hyväksyttyjä hahmokuvia ei koskaan muuteta.

### Eräajo

```bash
node tools/imagegen/imagegen.mjs batch tools/imagegen/examples/batch.example.json
node tools/imagegen/imagegen.mjs batch tools/imagegen/examples/batch.example.json --only aava-wave,water-tile --live
```

Ennen ensimmäistäkään kutsua työkalu laskee koko erän hinta-arvion ja tarkistaa sen budjettia vasten. Jokainen kuva tarkistetaan lisäksi erikseen ajon aikana. Katso tiedostomuoto [esimerkistä](examples/batch.example.json). Työkalu ei käytä OpenAI:n Batch-API:a (puolet halvempi, mutta tulokset voivat tulla jopa vuorokauden viiveellä). Sen voi lisätä myöhemmin isoja ajoja varten.

---

## 4. Budjetti ja kuluseuranta

```bash
node tools/imagegen/imagegen.mjs spend
node tools/imagegen/imagegen.mjs spend --all
```

- Kirjanpito tallentuu tiedostoon `~/Library/Application Support/sammakko-imagegen/ledger.jsonl`. Sinne kirjataan jokainen oikea kutsu: aika, malli, arvio, todellinen hinta `usage`-tokeneista, OpenAI:n `request-id` ja tiedostot. Epäonnistuneet kutsut kirjataan 0 $:n hintaisina virheviestin kanssa.
- Asetukset ovat tiedostossa `~/Library/Application Support/sammakko-imagegen/config.json` (luo se tarvittaessa):

```json
{ "monthlyBudgetUsd": 80, "warnRatio": 0.8, "perRunMaxUsd": 5 }
```

- `monthlyBudgetUsd`: jos kuukauden kulut ja uuden ajon arvio ylittäisivät tämän, ajo pysähtyy (paluukoodi 3).
- `perRunMaxUsd`: yhden komennon tai erän katto. Voit nostaa sitä kerralla valinnalla `--max-usd 12`.
- Pro-tilauksen 100 $/kk kattaa myös muun API-käytön. Siksi oletus on 80 $, ja OpenAI:n projektiraja on se varsinainen lukko.

---

## 5. Tyyliohje: Aava ja Loikka

Hyväksytyt hahmokuvat ovat kansioissa `lite/public/characters/aava/` ja `lite/public/characters/loikka/` (idle, blink, curious, talk, swim, swim_blink ja map, 256×256 läpinäkyvää PNG:tä). Ne ovat tyylin mittapuu. **Niitä ei korvata generoiduilla kuvilla ilman käyttäjän erillistä lupaa.** Uudet kuvat täydentävät niitä esimerkiksi uusilla asennoilla, esineillä ja taustoilla.

**Yhteinen tyyli** ([`prompts/style-sammakko.txt`](prompts/style-sammakko.txt)):
- käsin piirretty lastenkirjakuvitus, jonka täytössä näkyy rakeinen väri- ja vahaliitujälki;
- paksu, pyöreä ja tasavahvuinen **tummansininen ääriviiva** jokaisen muodon ympärillä;
- yksinkertaiset ystävälliset kasvot: pyöreä musta silmä ja yksi valkoinen heijastus sekä vaaleanpunainen poskipuna;
- kirkkaat mutta pehmeät värit, tasainen valo, ei kovia varjoja, liukuvärejä, 3D-renderöintiä tai valokuvamaisuutta;
- selkeä siluetti, joka toimii 128–256 px:n koossa;
- ei tekstiä, kirjaimia eikä vesileimoja.

**Aava** on päähahmo ([`prompts/character-aava.txt`](prompts/character-aava.txt)): pieni, pyöreä, sitruunankeltainen ankanpoikanen. Nokka ja räpylät ovat oranssit, silmässä on heijastus ja poskessa vaaleanpunainen puna. Siipi on kyljellä ja pyrstössä pieni töyhtö. Mittasuhteet: iso pää, lyhyt vartalo ja lyhyet jalat. Aava on utelias ja ystävällinen, ja häntä kuvataan yleensä sivulta tai kolmen neljäsosan kulmasta.

**Loikka** on sivuhahmo ([`prompts/character-loikka.txt`](prompts/character-loikka.txt)): taivaansininen sammakko, jonka pinnassa on pilkullinen liitujälki. Pään päällä on kaksi isoa pyöreää silmää, suu on leveässä hymyssä ja molemmissa poskissa on puna. Vatsassa on vaaleansininen läikkä. Raajat ovat lyhyet ja varpaat pyöreät, ja Loikka seisoo pystyssä.

**Maailma:** vesi, maa ja saaret. Sävy on rauhallinen ja lämmin. Aava on julkaisuissa etualalla, ja Loikka on hänen rinnallaan.

### Vinkkejä yhdenmukaisuuteen

- Kun teet uuden asennon olemassa olevalle hahmolle, käytä `edit`-komentoa niin, että hahmon hyväksytty PNG on referenssinä (`--image …/idle.png`), ja pohjaa `edit-keep-character`. Pelkkä tekstikuvaus vaihtelee enemmän.
- Pidä prompti englanniksi. Malli noudattaa sitä tarkimmin, ja tyylilohkot ovat valmiiksi englanniksi.
- Pyydä aina tyhjää reunaa hahmon ympärille, jotta mikään ei leikkaudu. Työkalu varoittaa, jos kuvio koskettaa reunaa.
- Tee useampi vaihtoehto halvalla (`--n 4 --quality low`) ja tee lopullinen versio vasta sitten laadulla `high`.
- Kirjaa hyväksytyn kuvan provenienssitiedosto talteen (ks. kohta 7).

---

## 6. Promptipohjat

Pohjat ovat kansiossa [`prompts/`](prompts/). `{{muuttuja}}` täytetään valinnalla `--var muuttuja=arvo`. Valinnan `--prompt` arvo menee muuttujaan `{{subject}}`.

| Pohja | Muuttujat | Käyttö |
|---|---|---|
| `sprite` | subject, pose | Yksittäinen sprite, tyhjä reuna, ei maata tai varjoa |
| `character` | subject, pose | Kokovartalokuva |
| `icon` | subject | Esine tai kuvake, joka erottuu 64 px:n koossa |
| `texture` | subject, look | Saumaton tekstuuri ylhäältä päin |
| `background` | subject, space | Leveä tausta, johon jätetään rauhallinen alue tekstille |
| `edit-keep-character` | change | Hahmo pysyy samana, vain annettu asia muuttuu |
| `style-sammakko` | – | Yhteinen tyylilohko (`--style` tai esiasetus lisää sen) |
| `character-aava`, `character-loikka` | – | Hahmokuvaukset (`--character aava`) |

Lopullinen prompti kootaan järjestyksessä tyyli + hahmot + pohja. Se tallentuu kokonaisuudessaan ja osiin eriteltynä provenienssitiedostoon.

---

## 7. Jälkikäsittely

### Rajaus, koko ja optimointi

```bash
# Rajaa läpinäkyvät reunat, 8 px:n marginaali, neliökangas, pienennys 256 px:iin
node tools/imagegen/imagegen.mjs post tools/imagegen/out/aava-jump-….png \
  --trim --pad 8 --square --resize 256 --out tools/imagegen/out/aava-jump-256.png
```

- `--trim` rajaa näkyvien pikselien mukaan, `--pad` lisää marginaalin ja `--square` keskittää kuvion neliöön. Toteutus on omaa JavaScriptiä.
- `--resize` käyttää macOS:n `sips`-työkalua, ja alfakanava säilyy.
- Jos koneelta löytyvät `pngquant` tai `oxipng` (`brew install pngquant oxipng`), ne pakkaavat kuvan automaattisesti. Hahmo-PNG:t ovat nyt noin 40–50 kt, ja uusien kuvien kannattaa pysyä samassa kokoluokassa.
- Liten hahmot ovat 256×256. Pidä hahmo samankokoisena ja samassa kohdassa kuin vastaavat olemassa olevat kuvat, jotta animaatio ei hypi. Vertaa kuvia rinnakkain ennen käyttöönottoa.

### Saumattomat tekstuurit

```bash
node tools/imagegen/imagegen.mjs tile tools/imagegen/out/water-tile-….png
```

Komento tekee 2×2-esikatselun, jossa saumat näkyvät keskiristissä, ja laskee saumaluvun: noin 1 tarkoittaa saumatonta, ja jos luku on yli 2, sauma luultavasti näkyy. Vinkkejä:

- Pohja `texture` pyytää tasaista valoa ilman vinjettiä ja polttopistettä sekä kuviota, joka jatkuu reunojen yli.
- Malli ei takaa täydellistä saumattomuutta. Jos sauma näkyy, siirrä kuvaa puolikkaan verran (esim. kuvankäsittelyohjelman *Offset*-suodin). Korjaa sitten keskiristi `edit`-komennolla ja maskilla, jossa vain keskiristin alue on läpinäkyvä: `--prompt "blend the seam seamlessly, same texture"`.
- Pienet ja tasaiset kuviot toistuvat huomaamattomammin kuin isot yksittäiset muodot.
- Tekstuurille riittää usein `medium`-laatu ja pienennys esimerkiksi 512 px:iin.

### Spritet ja animaatio

- Tee jokainen ruutu omana kuvanaan ja käytä samaa referenssiä (`edit --image idle.png`). Isot sprite-arkit samassa kuvassa vaihtelevat ruudusta toiseen.
- Rajaa kaikki ruudut samalla `--pad`-arvolla ja samaan kokoon. Tarkista, että jalat ovat samalla korkeudella.

### Kuvan käyttöönotto

1. Valitse paras kuva kansiosta `tools/imagegen/out/`. Kansio on `.gitignore`ssa.
2. Jälkikäsittele kuva ja kopioi se kohteeseen, esimerkiksi `public/kotisivu/assets/…` tai `lite/public/…` (ei `characters/`-kansioon ilman lupaa).
3. Kopioi samalla provenienssitiedosto (`….png.json`) kansioon `tools/imagegen/provenance/` ja commitoi se kuvan kanssa. Työkalu tekee tämän itse, jos generoit suoraan `public/`-kansion alle. Näin selainpakettiin ei päädy prompteja, mutta kuvan alkuperä säilyy repossa.

---

### Hahmon uudet asennot: fit ja compare

Uusi Aava- tai Loikka-asento tehdään aina alkuperäisistä PNG:istä (`edit --model sunburst --image idle.png --image wave.png …`). Pelkkä teksti tuottaa eri hahmon. Generoinnin jälkeen:

```sh
node tools/imagegen/imagegen.mjs fit raw.png --match lite/public/characters/aava/idle.png --by area --out frame.png
node tools/imagegen/imagegen.mjs compare frame.png --ref lite/public/characters/aava/idle.png --ref lite/public/characters/aava/wave.png
```

`fit` sovittaa kuvan talon mittoihin:
- kangas 256 px
- jalat samalla linjalla kuin viitteessä (`--bottom N` ilmassa oleville asennoille)
- koko viitteen pinta-alan mukaan
- ääriviiva lukittu kaanonin siniseen ja rungon väri täsmätty viitteeseen.

`compare` antaa yhdenmukaisuuden 0–100. Viitearvot:

| Verrattavat | Pisteet |
|---|---|
| Aavan kaanonruudut | 86–97 |
| Loikan kaanonruudut | 78–94 |
| Aava vs. Loikka | noin 28 |
| Tekstistä tehty ”Aava” | 27 |

Mittari ei näe anatomiaa, ja esineet, kuten kirja, laskevat pisteitä. Katso siksi aina myös silmällä. Koko työnkulku on kuvattu grafiikkapaketin ohjeessa: [`art/README.md`](../../art/README.md).

## 8. Lisenssi- ja käyttöehtohuomiot

Tämä ei ole oikeudellinen neuvo. Tarkista ajantasaiset ehdot: [OpenAI Terms of Use](https://openai.com/policies/terms-of-use/), [Services Agreement](https://openai.com/policies/services-agreement/) ja [Usage Policies](https://openai.com/policies/usage-policies/).

- **Omistus:** OpenAI:n ehtojen mukaan käyttäjä omistaa tuotoksen siltä osin kuin laki sallii, ja OpenAI luovuttaa sille mahdollisesti kuuluvat oikeudet käyttäjälle. Kaupallinen käyttö on sallittua.
- **Tekijänoikeus ei ole varma.** Suomessa ja EU:ssa (kuten Yhdysvalloissakin) tekijänoikeus edellyttää ihmisen luovaa panosta. Pelkkä promptilla tuotettu kuva ei välttämättä ole suojattu, joten muut voivat periaatteessa käyttää sitä. Ihmisen tekemä valinta, muokkaus ja yhdistely vahvistavat suojaa. Siksi provenienssi kannattaa säilyttää.
- **Tuotokset eivät ole ainutlaatuisia.** Joku muu voi saada samankaltaisen kuvan.
- **Muiden oikeudet:** älä pyydä kuvia toisten tavaramerkeistä, tunnetuista hahmoista tai elävien taiteilijoiden nimetystä tyylistä. Lataa referenssiksi vain kuvia, joihin sinulla on oikeudet. Tarkista myös olemassa olevien Aava- ja Loikka-PNG:iden alkuperä ja oikeudet ennen kuin käytät niitä referensseinä laajasti.
- **Lapset ja yksityisyys:** älä lataa oikeiden ihmisten (etenkään lasten) kuvia syötteiksi. Kun palvelu on suunnattu lapsille, kuvitusten pitää olla neutraaleja ja turvallisia. Pidä `--moderation` oletusarvossa `auto`.
- **Tietojen käsittely:** OpenAI ei oletuksena käytä API:n syötteitä ja tuotoksia mallien koulutukseen. Niitä voidaan säilyttää väärinkäytösten valvontaa varten (tyypillisesti enintään 30 päivää). Älä laita prompteihin henkilötietoja.
- **Tekoälystä kertominen:** OpenAI:n kuvissa voi olla C2PA-alkuperämetatietoja. Tämän työkalun `post`-komento kirjoittaa PNG:n uudelleen, jolloin ne katoavat, mutta provenienssitiedosto säilyttää tiedon. Harkitse kotisivulle ja whitepaperiin mainintaa, esimerkiksi "osa kuvituksesta on tehty tekoälyn avulla". EU:n tekoälysäädöksen avoimuusvelvoitteet (artikla 50) koskevat etenkin aidolta näyttävää sisältöä. Tarkista niiden soveltuvuus ennen julkaisua.
- **Julkaisu:** repon `public/` ei ole lisenssilupa. Kuvien lisenssin valinta ja repon näkyvyyden muutokset ovat erillisiä päätöksiä (ks. `AGENTS.md`).

---

## 9. Vianetsintä

| Ilmoitus | Syy ja korjaus |
|---|---|
| `API-avainta ei löytynyt Keychainista` | Tallenna avain kohdan 2.2 mukaan ja tarkista komennolla `key-check`. |
| `OpenAI HTTP 401 invalid_api_key` | Avain on katkennut, väärin tallennettu tai mitätöity. Aja `key-check --verify`. Jos pituus on 128, tallenna avain uudelleen komennolla `key-set` (kohta 2.2). |
| `HTTP 403` | Avaimelta puuttuu oikeus kuviin (Restricted-oikeudet) tai projektilta malli. |
| `HTTP 429` | Nopeus- tai budjettiraja on tullut vastaan. Työkalu yrittää uudelleen kolme kertaa. Jos virhe jatkuu, tarkista projektin kuukausiraja. |
| `moderation_blocked` | Prompti tai kuva hylättiin. Vastauksessa kerrotaan luokka. Muotoile prompti uudelleen. |
| `kuukausibudjetti ylittyisi` | Työkalun oma vahti pysäytti ajon. Odota seuraavaa kuukautta tai muuta `config.json`-tiedostoa tietoisesti. |
| `Kansio … on suojattu` | Yritit kirjoittaa hyväksyttyjen hahmokuvien kansioon. Generoi muualle. |
| Edit-kutsu palauttaa virheen pyynnön muodosta | Työkalu lähettää editoinnit JSON-muodossa (`images: [{image_url}]`) nykyisen rajapintakuvauksen mukaisesti. Jos OpenAI muuttaa muotoa, päivitä `lib/core.mjs` → `requestBody`. |

## 10. Kehitys

```bash
node --test tools/imagegen/test/imagegen.test.mjs
```

Testit eivät tee verkkokutsuja. Oikean ajon polku testataan paikallista valepalvelinta vasten (`IMAGEGEN_API_BASE`), ja testit varmistavat, ettei avain päädy tulosteisiin, kirjanpitoon tai provenienssiin. Ympäristömuuttujat `IMAGEGEN_HOME`, `IMAGEGEN_KEYCHAIN_SERVICE` ja `IMAGEGEN_BUDGET_USD` on tarkoitettu testeille ja poikkeustilanteisiin.

| Tiedosto | Sisältö |
|---|---|
| `imagegen.mjs` | CLI-komennot |
| `lib/core.mjs` | Avain, promptit, hinnat, budjetti, kirjanpito, API |
| `lib/png.mjs` | PNG-luku ja -kirjoitus, rajaus, toisto, saumaluku |
| `models.json` | Mallit, hinnat ja rajat (päivitä OpenAI:n mukaan) |
| `presets.json` | Esiasetukset |
| `prompts/` | Tyyli-, hahmo- ja käyttöpohjat |
| `examples/` | Eräajon esimerkki |
| `provenance/` | Käyttöön otettujen kuvien provenienssi (commitoidaan) |
