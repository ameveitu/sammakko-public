# M-NUM-1TO1: Lite-yhteensovitus

NodeSpec.id: `M-NUM-1TO1`. Lähde: `authority/production-181-v2/lite/`, rekisterin CONTENT_REV `lite181-2026-10-27`, todellinen tämän noodin rev `audit1-2026-10-28`. Tiedostokohtaiset SHA-256:t ovat lesson.json/alignment/sourceFiles-kentässä. Ne sitovat vertailun toimitettuun lähteeseen; vanha coverage ei ohita lähdekoodia.

Intro: Jokaiselle esineelle yksi sana.

Mallit: countAlong: neljä marjaa kerran; countAlong [[1],[2,3],[4]]: kolme esinettä, neljä sanaa; countAlong [[1],[],[2],[3]]: ohitus.

Todelliset perheet: tap, judge, transfer. Kit.cases poimii saman perheluettelon guided/independent/retrieval-vaiheissa; transfer käyttää erillistä generaattoria.

Siirto: 5–7 hajallaan olevaa, kolme esinetyyppiä, mode marking ja loppumäärä.

Vihjeet: tap: napauta kerran, merkki jää; judge: tarkastele kunkin saamat numerot; transfer ei erillistä hint-kenttää.

Selitykset: tap: jokainen saa yhden; judge erottaa kelvollisen, tuplan ja ohituksen vertaamalla sanojen määrää kohteisiin; transfer: kaikki esinetyypit lasketaan kerran.

Media: `countanim.ts` hopWords/countAlong on luettu. Tämä paketti käyttää omia matemaattisia piirroksia ja omaa vaiheistusta, supplied v2 rasterihahmoa, ei Liten geneeristä frog/duck-SVG:tä. Audio on tarpeeton. `engine/types.ts` erottaa tapcount mode total/marking ja build seq -tehtävät. `families.ts` antaa näille oletuskuvaukset; se ei todista laajaa oppimistulosta. PEDAGOGY_REFERENCES sisältää NCETM-viitteen, joka noudettiin tässä myös itsenäisesti.

Audit: LESSON_AUDIT:n alun neljä riviä ja yksityiskohtaiset neljä osiota on luettu: sanalorun ajallinen esitys ja rakentaminen; kohdistamisen teko ja virheen laji; ringin aloitus ja palaute; koko joukon kehys ja peittäminen. Aiemmat generaattori-/selainväitteet kuuluvat Liten historiaan, eivät tämän paketin tarkistusnäyttöön.

## Peritty, laajennettu ja korjattu

Säilyttää kertamerkinnän ja tuplan/ohituksen käsittelyn. Erottaa atomitaidon Lite tap -perheen pakollisesta loppumäärästä; uusi oppitunti ei vaadi sitä. Merkintä antaa sanat tukena.

## Opukselle kirjattu yhteensovitus, Liteä ei muokattu

Coverage mainitsee kaksi mallivaihetta ja count2-revision; lähteessä kolme mallia ja AUDIT_REV. Tap-perhe yhdistää kertakohdistamiseen loppumäärän: rajaa tulkinta erilliseksi. Päivitä Opuksen dokumentaatio.

Seed: ei satunnaisajoa eikä väitettyä satunnaista bugireproduktiota; yllä olevat erot ovat suorasta lähdeluvusta (numbers.ts/families.ts/COVERAGE.md). SOL_INTEGRATION.md:n kahdeksan tehtävätyypin lista on historiallinen; nykyinen types.ts on laajempi. Ei muutosta kanonisiin kaariin tai shared-resolveriin.

## Tulkitsemisen rajat

Merkintä osoittaa käyttöliittymän kertakohdistamisen. Ohjelma antaa sanat; se ei tarkista itsenäistä sanajonoa tai kokonaismäärän käsitettä. Kaikki palautteet ovat paikallisia harjoituspalautteita, eivät arviointia, mastery-tilaa tai oppimistapahtumia. Sisältötila draft; riippumaton katselmus ja ihmistestaus ovat avoinna. Ei väitettä toimivista julkaistuista peli-URL:eista.

## Tekniset tarkistukset

Aja `node lesson-network/packages/M-NUM-1TO1/tests.mjs` ja haluttaessa sama `--browser`-valinnalla. Selainkoe käyttää muistiin koostettua paketin omaa HTML:ää ja yhteistä CSS:ää, ei kirjoita shared/site/records/build-tilaa. Tulokset raportoidaan erikseen vasta suorittamisen jälkeen.

## Kirjoittajan rajattu tarkistus, 2026-10-29

Skeema, todelliset resurssitiivisteet ja kanoniset esitietoryhmät tarkistettu eristetyllä loadPackages-kutsulla; vain oma paketti, kopioitu mvp-scope ja tarvittavat shared-tavut väliaikaishakemistossa. Node-logiikkatestit ja moduulien/testien ESLint läpäisty. Selainharness ei rakenna verkkoa. Riippumaton sisältö-, pedagoginen ja ihmiskatselmus ovat avoinna; kirjoittajan tekninen tarkistus ei korvaa niitä.

Viimeinen paikallinen tarkennus: vain kuvapainikkeet ilman näkyviä kirjainnimiä; kosketus näyttää luvun marjan sisällä ja sanan palautteessa, estää saman painikkeen uudelleenlaskennan ja antaa valmistumispalautteen automaattisesti. Erillinen merkkien tarkistuspainike poistettiin. Merkkien nollaus avaa kaikki kohteet.

Selainharness läpäisty 390/1280 px: resurssit, >=44 px ohjaimet, ei vaakaylivuotoa, omat harjoitukset ja täsmäpalautteet, suora määrävaste asianomaisissa KC:issä, vaiheistus, tauko/alustus/dispose ja tekstin käyttö ilman JavaScriptiä. Kuvien käyttöliittymä tarkastettu ruutukuvista. Tämä on erillinen lähdeharness; tuotantokuoren build/integration-tarkistukset ovat pääajon vastuulla. Lähteet vakaat tätä ensimmäistä integraatioporttia varten.
