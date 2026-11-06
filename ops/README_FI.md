# Sammakon palvelinpaketti

Tämä paketti sisältää tarkistetun sivuston `site/`-hakemistossa sekä Nginx-palvelimen asetukset. Kotisivu, whitepaper, oppitunnit ja Lite tulevat samasta osoitteesta. Nginx palvelee tiedostot; Liten käyttöliittymä ja oppijamalli suoritetaan käyttäjän selaimessa. Palvelimelle ei perusteta oppijatietokantaa.

## Lataa ja käynnistä valittu julkaisu yhdellä komennolla

Repon juuresta Linux-palvelimella, jolla ovat GitHub CLI (`gh`), `jq` ja Docker Compose v2. Aseta `RUN` palvelinpaketin tuottaneen onnistuneen `main`-haaran `ci`-ajon numerotunnukseksi ja kirjaudu `gh`:lla repoon lukuoikeudella.

```sh
sh ops/install-release.sh "$RUN"
```

Komento tarkistaa ajon tilan, commitin ja julkaisutilan, lataa palvelinpaketin hakemistoon `sammakko-releases/<commit>` ja odottaa kontin terveystarkistusta. Esikatseluun käytä `sh ops/install-release.sh "$RUN" preview`. Asennin käyttää nykyisen GitHub-repon pakettia. Jos paketti on tallennuskiintiön vuoksi tallennettu GitHub Releases -luonnokseksi, asennin hakee sen samalle commitille. Voit määrittää toisen repon `GH_REPO`-muuttujalla, lataushakemiston `SAMMAKKO_RELEASE_DIR`-muuttujalla ja portin `SAMMAKKO_PORT`-muuttujalla. Rinnakkaiselle kokeilulle anna lisäksi oma `SAMMAKKO_PROJECT` ja eri portti. Edelliseen versioon voi palata samalla komennolla käyttäen sen ajotunnusta ja tallessa olevaa pakettia.

## Käynnistys omalla palvelimella

Lataa onnistuneen **main**-ajon `sammakko-server-<commit>`-artefakti GitHub Actionsista ja pura se uuteen, commitilla nimettyyn hakemistoon. Paketissa pitää olla `Dockerfile`, `nginx.conf`, `compose.yaml` ja `site/release.json`.

Suorita puretun paketin hakemistossa:

```sh
docker compose up --build -d
docker compose ps
curl --fail http://127.0.0.1:8080/release.json
```

Palvelin kuuntelee oletuksena tämän koneen osoitteessa `127.0.0.1:8080`. Liitä olemassa oleva HTTPS-välityspalvelin tähän osoitteeseen niin, että koko sivusto on verkkotunnuksen juuressa. Alipolut `/lite/`, `/oppitunnit/`, `/whitepaper/` ja `/tietoa/` säilyvät. HTTPS, verkkotunnus ja mahdollinen ulkoinen pääsynhallinta asetetaan oman palvelimen nykyisessä ympäristössä. Paketti ei päätä verkkotunnusta tai muuta DNS:ää.

Toisen paikallisen portin voi antaa käynnistyksen yhteydessä:

```sh
SAMMAKKO_PORT=8081 SAMMAKKO_RELEASE=oma-commit docker compose up --build -d
```

Kontti suoritetaan käyttäjällä 101 ilman kirjoitusta sivustotiedostoihin. Vain väliaikaistiedostot kirjoitetaan `/tmp`-muistitaltioon. Pyyntölokit tulevat kontin normaalilokiin; Compose kierrättää niitä enintään kolmeen 10 Mt:n lokitiedostoon.

## Julkaisun vaihtaminen ja palautus

Käynnistä uusi paketti ensin toisessa paikallisessa portissa. Tarkista etusivu, oppitunnista avautuva Lite, whitepaper ja `release.json`:n `sourceCommit`. Vaihda vasta sitten HTTPS-välityspalvelimen kohde uuteen porttiin. Säilytä edellinen paketti ja kontti, kunnes uusi toimii; palautus tehdään vaihtamalla välityspalvelin takaisin edelliseen kohteeseen.

Jos molempia versioita ajetaan rinnakkain, anna niille eri Compose-projektinimet (`docker compose -p sammakko-uusi ...`). Tuotantoliikenteen reititystä ei vaihdeta näillä tiedostoilla automaattisesti. GitHubin työnkulku testaa palvelinpaketin mutta ei tunne palvelimesi osoitetta tai tunnuksia.

Lite tallentaa harjoittelutiedot selaimen `localStorage`-tilaan. Saman HTTPS-alkuperän (protokolla, verkkotunnus ja portti) säilyttäminen säilyttää yhteyden samaan paikalliseen tallennustilaan. Verkkotunnuksen, protokollan tai ulkoisen portin muutos tuottaa selaimessa eri tallennusalueen. Aikuiselle-näkymästä voi viedä tiedot talteen ennen osoitteen vaihtoa.

## Sisällön muuttaminen

Muokkaa lähteitä repossa, vie valmis muutos mainiin ja käytä uuden onnistuneen CI-ajon pakettia. Älä muokkaa käytössä olevan paketin yksittäisiä tiedostoja, koska `release.json`:n tiivisteet eivät sen jälkeen vastaisi sisältöä.

Docker-kuvan pohja on virallinen `nginx:stable-alpine`. CI rakentaa ja koestaa sillä toimituspaketin. Kiinteän pohjaversion voi antaa `docker build --build-arg NGINX_IMAGE=nginx@sha256:<oikea-tiiviste> ...`; tiiviste haetaan käytetystä rekisteristä, sitä ei arvata. [Nginxin Docker-ohje](https://hub.docker.com/_/nginx) ja [Nginxin try_files-ohje](https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files) kuvaavat käytetyn palvelutavan.

## Ennen julkista käyttöönottoa

Tekijä on Veikko Tuominen. Verkkotunnus ja yhteysosoite ovat vielä avoinna. Kun `publicOrigin` puuttuu asetuksista, toimitusmanifestin `publication.mode` on `preview`. Kaikki HTML-sivut ovat tällöin noindex ja sitemap tyhjä. Tämä ei ole pääsynvalvonta eikä lupa levittää yksityistä aineistoa.

Aseta myöhemmin todellinen HTTPS-juuriosoite julkaisukonfiguraatioon (tai paketoinnin `SAMMAKKO_PUBLIC_ORIGIN`-ympäristömuuttujaan), täydennä oikeat julkaisijatiedot ja aja normaali koonti sekä tarkistukset uudelleen. Public-koonnin sitemapissa on187 URL:ää;509 sisällöttömälle pohjalle ei synny indeksointilupausta. Käytettävän main-artefaktin release.json yksilöi tämän konfiguraation. Palvelin-/DNS-/HTTPS-kohdetta tai käyttölisenssiä ei päätellä repoasetuksista.
