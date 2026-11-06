# M-GEO-01 — Lite-yhteensovitus ja Opus-korjausehdotukset

Muuttumaton lähde: authority/production-181-v2/lite. NodeSpec M-GEO-01, globaali sisältöversio lite181-2026-10-27, oma rev ja validRevs audit1-2026-10-28.

## Todelliset perheet

- `solid`: choice: depicted solid vs flat-shape drawings
- `flat`: choice: flat shape vs depicted solids
- `print`: choice: pressScene for cube/can/cone/ball; SOLID_PRINT selects flat shape
- `sort`: sort: three depicted solids and three flat shapes, original actual branch absent from COVERAGE.md snapshot
- `transfer`: choice: count depicted solids only, 3–5 plus two flat shapes

## Rekisteri ja audit

index.ts luettu; tavoiteoverlay tarkistettu, SIMS ei kohdista tähän. families.ts käsittelee COVERAGE_DECL- ja DECL-ylikirjoitukset sekä graafin dynaamisen säännön. Näille neljälle ei ole omaa DECL- tai coverage-riviä. `dynamic` on None; oletus outcome on choice/sort/place/numeric-tehtävätyypin mukainen, muut oletuslistat tyhjiä. `entry=dynamic` ei itsessään luo dynaamista esitietosääntöä. Perhekohtainen rekisteriolettama ei oikeuta piilottamaan tehtävien todellisia lisävaatimuksia.

LESSON_AUDIT.md rivi 59 ilmoittaa tehty/korjattu ja uuden toiminnallisen perheen. COVERAGE.md:n perhetaulukko ei vielä sisällä tätä lisättyä perhettä. Luettelo yllä on todellisesta NodeSpecistä, ei vanhasta generoidusta listasta. Liteä ei ole muutettu.

## Korjausehdotukset / päätökset

- Correct Lite hand-held test: a physical drawing card is also holdable; a pictured solid is not the solid itself.
- Correct unqualified demo sentence that every surface of a solid is a flat shape: cylinder side and sphere are curved.
- Replace ambiguous sphere-in-sand print with ideal flat cube/cylinder base tracing and explicit physical limits.
- Retain object/representation contrast; show original projected solids using 2D SVG, not copied Lite SOLID art.

## Rajat ja näyttö

- Malli ei ole todellinen kappale eikä korvaa tunnustelua tai eri suunnista katsomista.
- Kaikilla kappaleilla ei ole vain tasaisia pintoja; kaikki eivät mahdu käteen.
- Paperiarkin todellinen paksuus erotetaan piirroksen matemaattisesta tasomallista.
- Ei lupausta pallon täsmällisestä painaumasta tai hiekkajäljen muuttumattomuudesta.

Ei ihmiskatselmusta tai lapsihavaintoja. Riippumaton sisältö-, toimialue- ja UI-katselmus pääintegraattorilta odottaa. Käyttäjäreittejä ei ole tässä varmennettu; paketissa ei rakenneta oppilaspelilinkkejä.
