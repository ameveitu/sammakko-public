# Saaristo herää: mihin jäätiin (4.11.2026)

Haara: `kokeilu/saaristo-20261104`. Tätä ei ole vielä yhdistetty mainiin, koska käyttäjä halusi säätää ensin.

## Tehty tällä kierroksella
- **Otsikon tulikärpäset** (`src/text.js`)
  - Otsikko koostuu samannäköisistä keltavihreistä tulikärpäsistä kuin lammella.
  - Koskettaminen vapauttaa lähellä olevat kärpäset. Ne vaeltavat virtauskentässä 6–22 s ja palaavat sitten hitaasti paikoilleen.
  - Muutama kärpänen lähtee myös omia aikojaan.
- **Saari ja kaislat**
  - Saari jatkuu oikealle niemenkärkenä (`blender/island.py`, `headland()`). Regenerointi: `npm run island`.
  - Vesivarjostin piirtää matalikot ja rantavaahdon maakentän perusteella (`island.js` heightAt.landTex).
  - Neljä kaislanippua osmankäämeineen (`src/reeds.js`). Osoitin taivuttaa niitä.
- **Kivet** (`src/stones.js`)
  - Kovemmalla heitolla kivi pomppaa useammin.
  - Numerot saavat mennä päällekkäin. Viimeinen numero nousee ja häipyy viimeisenä (`.saaristo-pop.is-final`).
- **Heittoalue**
  - Kuvan vasemmassa laidassa on heittoalue (`[data-throwzone]`), josta pyyhkäistään ylös.
  - Kosketuksella pyyhkäisy toimii vain heittoalueelta, joten muualla sivu vierii normaalisti.
  - Hiirellä voi pyyhkäistä missä tahansa.
- **Aava**
  - Kortti kelluu vedessä, ja vesiraja leikkaa kuvan.
  - Aava vaihtelee itsestään kolmen tilan välillä: kelluu, sukeltaa (swim-kuva, kuplajälki veden alla, nousee pintaan muualla) ja pyrähtää lentoon (wave- ja idle-kuva vuorottelevat kaarilennon aikana).
  - Aavaa voi raahata. Kun napauttaa vettä lähellä Aavaa, hän ui katsomaan. Kivi lähellä säikäyttää hänet lentoon.
- **Loikka**
  - Klikkaa lummetta, niin Loikka hyppää sille. Loikan klikkaaminen saa sen hyppimään iloisesti paikallaan.
  - Jos kivi osuu lähelle, Loikka väistää kauemmas ja huudahtaa "hups!".
- **WebGPU-parvi** (`src/gpu-swarm.js`)
  - 65 536 tulikärpästä, mobiilissa 16 384, WGSL-laskentavarjostimessa.
  - Parvi seuraa osoitinta pyörteenä ja hajoaa kiven loiskeesta. Kun osoitin ei ole käytössä, parvi kiertää saarta.
  - Parvi on oma moduulinsa (`data-hulluttelu="parvi"`). Ilman WebGPU:ta moduuli on pois päältä ja näyttää selityksen.

## Tarkistukset
- `saaristo.spec.ts` ja `visual-polish-home.spec.ts` Chromiumissa ja Firefoxissa: 29 läpi, 1 ohitettu.
  - Ohitettu testi on Chromiumin elävä lampi, koska headless-Chromiumissa ei ole WebGL:ää ilman lippuja.
- `check-site.py` läpi.
- Ulkoasu tarkistettiin headless-Chromiumilla lipuilla `--enable-unsafe-webgpu --use-angle=metal`, jolloin sekä WebGL että WebGPU toimivat.

## Seuraavaksi kokeiltavaa
- Tarkista Chromessa parven kirkkaus suurella näytöllä. Sitä säätää `o.glow` tiedostossa `gpu-swarm.js`.
- Aavan sukellus voisi jättää kuplia myös lumpeiden alle. Lisäksi Aavan ja Loikan välille voisi tehdä pienen "hippaleikin".
- Parvi voisi muodostaa otsikon kirjaimet uudelleen, kun otsikko hajoaa. Laskentavarjostin tarvitsee tähän vain kohdetekstuurin.
- Mainiin yhdistetään vasta, kun käyttäjä hyväksyy.

## Kierros 2 (4.11.2026): parvi ja äänet
- **Parvi ei enää asetu viivaksi** (`src/gpu-swarm.js`, commit c0dd90b4)
  - Jokaisella kärpäsellä on oma ankkuripiste pilven sisällä, oma kallistettu pyörreakseli ja curl-kohina.
  - Parvessa on viisi alaparvea, jotka vaeltavat erikseen ja kokoontuvat osoittimen luo.
  - Nopea pyyhkäisy on "puuska": se hajottaa parven, taivuttaa kaislat ja soittaa tuulen huminan.
  - Mittari `__saaristo.swarmShape()` lukee sijainnit GPU:lta. Testi vaatii pilvimäisen muodon ja hajonnan puuskan jälkeen.
- **Äänet** (`src/sound.js`, `src/sound-kit.json`, commitit 33d69a8a ja 432811ee)
  - Lähteet ovat Freesoundin CC0-äänitteitä: ankanpoikasen piipitys Aavalle, sorsan siiveniskut, kivien pulahdukset, tuuli kaislikossa ja järven liplatus. Loikan kurnaus, ilo, ponnistus ja märkä laskeutuminen ovat Liten nykyiset äänet.
  - Lähdetiedot ja leikkaukset ovat tiedostossa `audio/library/world.json`. Paketti rakennetaan komennolla `node tools/audiogen/cli.mjs world`, ja se kirjoittaa MP3:t, `sound-kit.json`:n, manifestin rivit ja provenienssin (`audio/provenance/world.json`).
  - Pakkauksen jälkeen tarkistetaan taso (±1 LU kurnaukseen sovitetusta), tunnistettavuus (≥ 0,9) ja silmukoiden sauma. Jos jokin epäonnistuu, mitään ei julkaista.
  - Tehosteet soivat vasta ensimmäisen eleen jälkeen. **Äänimaisema**-nappi (oletuksena pois, valinta muistetaan) lisää tuulen ja liplatuksen.
  - **Kuuntelua ei ole vielä tehty.** Kaikki on tilassa `candidate`. Kuuntele: `node tools/audiogen/studio.mjs` → http://127.0.0.1:5230/world. Silmukoista on kaksi vaihtoehtoa (`amb.wind-2` ja `amb.lap-2` ovat vain kuunteluun). Vaihto tehdään `world.json`:n `audition`-merkinnällä.
- Tarkistukset: `saaristo.spec.ts` 15 läpi ja 1 ohitettu (Firefoxin WebGPU) chromium-gpu- ja Firefox-ajossa. `visual-polish-home` 18 läpi. `check-site.py` läpi. Audiogenin yksikkötestit 22 läpi.
  - Headless-Chromium tarvitsee lipuiksi `--use-angle=metal --enable-gpu --ignore-gpu-blocklist` (parveen lisäksi `--enable-unsafe-webgpu`). Ilman niitä elävän lammen testit ohitetaan.

## Palvelin sammuu lepotilassa
Claude-sovelluksen esikatselupalvelin on sovelluksen lapsiprosessi, ja sovellus pysäyttää sen lepotilassa. Pysyvän palvelimen saa omaan Terminal-ikkunaan:
```
cd /Users/aikuiset/Sammakko/sammakko-ux && caffeinate -i env PORT=5223 node .github/scripts/serve-site.mjs
```

## Ajaminen
```
cd tools/saaristo && npm run build
cd ../.. && node .github/scripts/package-site.mjs
cd lite && npx playwright test publication-tests/saaristo.spec.ts --config playwright.publication.launch.config.ts --project=chromium --project=firefox
```
