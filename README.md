# Sammakko™ — Aavan matkassa

Sammakon 3D-saaristossa voi tutkia 690 aihetta. Sisältötarkistus kattaa 181 aihetta. Mukana ovat myös Sammakko Lite, 181 oppituntiluonnosta, 509 aihepohjaa, oppimisverkko ja whitepaper. Opettajien ja oppilaiden arviointi on kesken.

## Rakentaminen ja oma palvelin

Asenna Node.js 24, npm ja Python 3.11 tai uudempi. Tuotantokoonti käyttää mukana olevia kuvia ja äänitteitä. Asenna Liten riippuvuudet ja rakenna peli komennolla `cd lite && npm ci && npm run build`. Oppituntien lähteet ovat polussa `public/oppitunnit/lesson-network/packages`. Saman lähdeversion julkaisutarkistukset ja palvelinpaketin koonti löytyvät [CI-työnkulusta](.github/workflows/ci.yml). Valmiin toimituspaketin käyttöohje on [palvelinohjeessa](ops/README_FI.md).

Lähdevedoksen versio on tiedostossa [SOURCE.json](SOURCE.json). Käytettävä palvelinkokonaisuus sisältää Nginxin asetukset ja `site/release.json`-tiedoston.

## Tekijä ja oikeudet

© 2026 Veikko Tuominen. Sammakko™. Kaikki oikeudet pidätetään. Kolmansien osapuolten aineistojen ja ohjelmistoriippuvuuksien omat lisenssit ja tekijämerkinnät ovat voimassa. [Oikeudet](RIGHTS.md)
