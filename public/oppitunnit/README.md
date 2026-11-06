# Sammakon oppitunnit

Oppituntiverkko sisältää 181 oppituntiluonnosta ja 509 aihepohjaa. Oppitunnin muokattavat tiedostot ovat hakemistossa `lesson-network/packages/<KC>/`. Tekijä voi muokata tehtävänantoa, opettajan ohjeita, esityksen vaiheita ja kyseisen oppitunnin aineistoa. [Kirjoitusohje](lesson-network/AUTHORING.md)

## Paikallinen koonti

Aja nämä komennot hakemistossa `public/oppitunnit/`. Yhdistetty sivusto käyttää Sammakko Liten harjoittelureittejä.

```sh
npm ci
SAMMAKKO_SITE_PACKAGE=1 node lesson-network/build.mjs
SAMMAKKO_SITE_PACKAGE=1 node lesson-network/verify.mjs
```

Kaikkien 181 paketin lähdesidonnainen testi tallentaa uuden tarkistuskuitin. Käytä ajokohtaista nimeä. Osa SVG-testeistä tarvitsee ohjelman `xmllint`.

```sh
node lesson-network/check-package-tests.mjs B16 oma-tarkistus --current
node lesson-network/refresh-technical-receipts.mjs oma-tarkistus
node lesson-network/production-status.mjs
```
