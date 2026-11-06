# M-NUM-02: Lite-yhteensovitus

NodeSpec.id: `M-NUM-02`. Lähde: `authority/production-181-v2/lite/`, rekisterin CONTENT_REV `lite181-2026-10-27`, todellinen tämän noodin rev `lite181-2026-10-27`. Tiedostokohtaiset SHA-256:t ovat lesson.json/alignment/sourceFiles-kentässä. Ne sitovat vertailun toimitettuun lähteeseen; vanha coverage ei ohita lähdekoodia.

Intro: Viimeinen sana kertoo määrän.

Mallit: countAlong total: neljän marjan kehys; countAlong cover: peitetty neljän joukko.

Todelliset perheet: howmany, give, transfer. Kit.cases poimii saman perheluettelon guided/independent/retrieval-vaiheissa; transfer käyttää erillistä generaattoria.

Siirto: 4–8 oikein laskettua ja peitettyä kohdetta; vaihtoehdot n, 1, n−1.

Vihjeet: howmany: viimeinen sana; give: laske valitessa; transfer ei erillistä hint-kenttää.

Selitykset: howmany: viimeinen sana ja kokonaismäärä; give: pysähdy tilattuun määrään; transfer: peitetty määrä on viimeinen sana.

Media: `countanim.ts` hopWords/countAlong on luettu. Tämä paketti käyttää omia matemaattisia piirroksia ja omaa vaiheistusta, supplied v2 rasterihahmoa, ei Liten geneeristä frog/duck-SVG:tä. Audio on tarpeeton. `engine/types.ts` erottaa tapcount mode total/marking ja build seq -tehtävät. `families.ts` antaa näille oletuskuvaukset; se ei todista laajaa oppimistulosta. PEDAGOGY_REFERENCES sisältää NCETM-viitteen, joka noudettiin tässä myös itsenäisesti.

Audit: LESSON_AUDIT:n alun neljä riviä ja yksityiskohtaiset neljä osiota on luettu: sanalorun ajallinen esitys ja rakentaminen; kohdistamisen teko ja virheen laji; ringin aloitus ja palaute; koko joukon kehys ja peittäminen. Aiemmat generaattori-/selainväitteet kuuluvat Liten historiaan, eivät tämän paketin tarkistusnäyttöön.

## Peritty, laajennettu ja korjattu

Säilyttää koko joukon kehyksen, peittämisen ja give-idean. howmany-vastaus on suoraan sallittu. Antamistehtävän napautukset ovat itse valitsemista, eivät määrävalinnan edellytys.

## Opukselle kirjattu yhteensovitus, Liteä ei muokattu

Ei paikallista rev-kenttää: revOf käyttää CONTENT_REV-arvoa lite181-2026-10-27. Coverage on tältä osin sopiva; audit kertoo kaksi uudistettua mallia. Säilytä give- ja total-tulkintojen ero.

Seed: ei satunnaisajoa eikä väitettyä satunnaista bugireproduktiota; yllä olevat erot ovat suorasta lähdeluvusta (numbers.ts/families.ts/COVERAGE.md). SOL_INTEGRATION.md:n kahdeksan tehtävätyypin lista on historiallinen; nykyinen types.ts on laajempi. Ei muutosta kanonisiin kaariin tai shared-resolveriin.

## Tulkitsemisen rajat

Peitetyn joukon määrävalinta ja pyydetyn joukon rakentaminen ovat lyhyttä tuettua harjoittelua; eivät pysyvän tai itsenäisen osaamisen osoitus. Kaikki palautteet ovat paikallisia harjoituspalautteita, eivät arviointia, mastery-tilaa tai oppimistapahtumia. Sisältötila draft; riippumaton katselmus ja ihmistestaus ovat avoinna. Ei väitettä toimivista julkaistuista peli-URL:eista.

## Tekniset tarkistukset

Aja `node lesson-network/packages/M-NUM-02/tests.mjs` ja haluttaessa sama `--browser`-valinnalla. Selainkoe käyttää muistiin koostettua paketin omaa HTML:ää ja yhteistä CSS:ää, ei kirjoita shared/site/records/build-tilaa. Tulokset raportoidaan erikseen vasta suorittamisen jälkeen.

## Kirjoittajan rajattu tarkistus, 2026-10-29

Skeema, todelliset resurssitiivisteet ja kanoniset esitietoryhmät tarkistettu eristetyllä loadPackages-kutsulla; vain oma paketti, kopioitu mvp-scope ja tarvittavat shared-tavut väliaikaishakemistossa. Node-logiikkatestit ja moduulien/testien ESLint läpäisty. Selainharness ei rakenna verkkoa. Riippumaton sisältö-, pedagoginen ja ihmiskatselmus ovat avoinna; kirjoittajan tekninen tarkistus ei korvaa niitä.

Viimeinen paikallinen tarkennus: kuvapainikkeissa ei näkyviä kirjainnimiä. Valintamerkki piirretään kuvan sisään; määrävalinta on suora ilman pakollisia kohdekosketuksia.

Selainharness läpäisty 390/1280 px: resurssit, >=44 px ohjaimet, ei vaakaylivuotoa, omat harjoitukset ja täsmäpalautteet, suora määrävaste asianomaisissa KC:issä, vaiheistus, tauko/alustus/dispose ja tekstin käyttö ilman JavaScriptiä. Kuvien käyttöliittymä tarkastettu ruutukuvista. Tämä on erillinen lähdeharness; tuotantokuoren build/integration-tarkistukset ovat pääajon vastuulla. Lähteet vakaat tätä ensimmäistä integraatioporttia varten.
