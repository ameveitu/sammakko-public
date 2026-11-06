# M-NUM-STABLE-ORDER: Lite-yhteensovitus

NodeSpec.id: `M-NUM-STABLE-ORDER`. Lähde: `authority/production-181-v2/lite/`, rekisterin CONTENT_REV `lite181-2026-10-27`, todellinen tämän noodin rev `audit1-2026-10-28`. Tiedostokohtaiset SHA-256:t ovat lesson.json/alignment/sourceFiles-kentässä. Ne sitovat vertailun toimitettuun lähteeseen; vanha coverage ei ohita lähdekoodia.

Intro: Laskuloru Loikan retkelle.

Mallit: hopWords: oikea 1–5-jono; hopWords jumpOver: yksi, kaksi, neljä; kolme puuttuu.

Todelliset perheet: next, swap, spot, rhyme, transfer. Kit.cases poimii saman perheluettelon guided/independent/retrieval-vaiheissa; transfer käyttää erillistä generaattoria.

Siirto: s=3–7, kolmen sanan alku, seuraava s+3; valinnat s+4 ja s+1.

Vihjeet: Sano loru alusta (next); Vertaa hypättyä kohtaa (spot); Aloita yksi (rhyme); swap ohjaa kaiuttimeen; tekstin quiet-vastine on lähteessä; transfer ei erillistä hint-kenttää.

Selitykset: next nimeää seuraavan; swap näyttää oikean jonon; spot nimeää puuttuvan; rhyme näyttää kokonaisen jonon; transfer säilyttää järjestyksen keskeltä.

Media: `countanim.ts` hopWords/countAlong on luettu. Tämä paketti käyttää omia matemaattisia piirroksia ja omaa vaiheistusta, supplied v2 rasterihahmoa, ei Liten geneeristä frog/duck-SVG:tä. Audio on tarpeeton. `engine/types.ts` erottaa tapcount mode total/marking ja build seq -tehtävät. `families.ts` antaa näille oletuskuvaukset; se ei todista laajaa oppimistulosta. PEDAGOGY_REFERENCES sisältää NCETM-viitteen, joka noudettiin tässä myös itsenäisesti.

Audit: LESSON_AUDIT:n alun neljä riviä ja yksityiskohtaiset neljä osiota on luettu: sanalorun ajallinen esitys ja rakentaminen; kohdistamisen teko ja virheen laji; ringin aloitus ja palaute; koko joukon kehys ja peittäminen. Aiemmat generaattori-/selainväitteet kuuluvat Liten historiaan, eivät tämän paketin tarkistusnäyttöön.

## Peritty, laajennettu ja korjattu

Säilyttää next/rhyme ja keskeltä jatkamisen; kuva ja vaiheistus ovat omia. swap/spot eivät ole erillisiä testiperheitä täällä. Korjaa mahdollisen kivi–sana-sekaannuksen: nuoli esittää vain seuraavaa sanaa.

## Opukselle kirjattu yhteensovitus, Liteä ei muokattu

Coverage listaa skip,next,swap sekä vanhan rev:n, mutta numbers.ts sisältää next,swap,spot,rhyme ja AUDIT_REV:n. Päivitä coverage Opus-puolella; ei Lite-muutosta tässä. swap-hint painottaa ääntä, mutta uuden materiaalin tehtävät ovat tekstinäkin.

Seed: ei satunnaisajoa eikä väitettyä satunnaista bugireproduktiota; yllä olevat erot ovat suorasta lähdeluvusta (numbers.ts/families.ts/COVERAGE.md). SOL_INTEGRATION.md:n kahdeksan tehtävätyypin lista on historiallinen; nykyinen types.ts on laajempi. Ei muutosta kanonisiin kaariin tai shared-resolveriin.

## Tulkitsemisen rajat

Sanavalinta ja sanapalojen järjestys eivät tarkista ääneen lausumista eivätkä esineiden laskemista. Kaikki palautteet ovat paikallisia harjoituspalautteita, eivät arviointia, mastery-tilaa tai oppimistapahtumia. Sisältötila draft; riippumaton katselmus ja ihmistestaus ovat avoinna. Ei väitettä toimivista julkaistuista peli-URL:eista.

## Tekniset tarkistukset

Aja `node lesson-network/packages/M-NUM-STABLE-ORDER/tests.mjs` ja haluttaessa sama `--browser`-valinnalla. Selainkoe käyttää muistiin koostettua paketin omaa HTML:ää ja yhteistä CSS:ää, ei kirjoita shared/site/records/build-tilaa. Tulokset raportoidaan erikseen vasta suorittamisen jälkeen.

## Kirjoittajan rajattu tarkistus, 2026-10-29

Skeema, todelliset resurssitiivisteet ja kanoniset esitietoryhmät tarkistettu eristetyllä loadPackages-kutsulla; vain oma paketti, kopioitu mvp-scope ja tarvittavat shared-tavut väliaikaishakemistossa. Node-logiikkatestit ja moduulien/testien ESLint läpäisty. Selainharness ei rakenna verkkoa. Riippumaton sisältö-, pedagoginen ja ihmiskatselmus ovat avoinna; kirjoittajan tekninen tarkistus ei korvaa niitä.

Selainharness läpäisty 390/1280 px: resurssit, >=44 px ohjaimet, ei vaakaylivuotoa, omat harjoitukset ja täsmäpalautteet, suora määrävaste asianomaisissa KC:issä, vaiheistus, tauko/alustus/dispose ja tekstin käyttö ilman JavaScriptiä. Kuvien käyttöliittymä tarkastettu ruutukuvista. Tämä on erillinen lähdeharness; tuotantokuoren build/integration-tarkistukset ovat pääajon vastuulla. Lähteet vakaat tätä ensimmäistä integraatioporttia varten.
