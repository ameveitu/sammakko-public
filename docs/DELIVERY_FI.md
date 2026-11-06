# Sivuston koonti ja toimitus

Asenna Node.js 24, npm, Python 3 ja `xmllint`. Projektin juuressa seuraavat komennot rakentavat Liten, oppitunnit ja palvelinpaketin.

```sh
(cd lite && npm ci && npm run build)
(cd public/oppitunnit && npm ci && SAMMAKKO_SITE_PACKAGE=1 node lesson-network/build.mjs)
node public/whitepaper/build.mjs --check
node .github/scripts/package-site.mjs
python3 .github/scripts/check-site.py
node .github/scripts/package-server.mjs
```

Hakemistossa `.build/server/` ovat Nginxin asetukset, Compose-tiedosto ja koottu sivusto. Tarkistetun toimituksen tunniste ja tiedostojen tiivisteet löytyvät tiedostosta `site/release.json`. Käytä oikeaa julkista osoitetta `SAMMAKKO_PUBLIC_ORIGIN`-muuttujassa, kun julkaiset oman verkkotunnuksen. [Palvelimen käynnistys ja versionvaihto](../ops/README_FI.md)

Tarkistusajon valinnat löytyvät [CI-työnkulusta](../.github/workflows/ci.yml). Laajennetut selainajot ja kohdennetut diagnostiikkakuvat voi valita erikseen.
