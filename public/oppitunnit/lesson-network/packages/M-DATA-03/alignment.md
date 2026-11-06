# M-DATA-03 — Lite-yhteensovitus ja Opus-korjausehdotukset

Muuttumaton lähde: authority/production-181-v2/lite. NodeSpec M-DATA-03, globaali sisältöversio lite181-2026-10-27, oma rev ja validRevs audit1-2026-10-28.

## Todelliset perheet

- `read`: choice: animal row lookup in quantity table, values2–12
- `twoWay`: choice: animal and day intersection in 2x2 numerical table
- `fewest`: choice: compare quantities2–15, adds numerical comparison demand
- `cells`: place: retrieve three of four values from row/day labels, actual branch absent from COVERAGE.md snapshot
- `transfer`: numeric: sum two day values in chosen row, values2–12 each; arithmetic beyond structure

## Rekisteri ja audit

index.ts luettu; tavoiteoverlay tarkistettu, SIMS ei kohdista tähän. families.ts käsittelee COVERAGE_DECL- ja DECL-ylikirjoitukset sekä graafin dynaamisen säännön. Näille neljälle ei ole omaa DECL- tai coverage-riviä. `dynamic` on None; oletus outcome on choice/sort/place/numeric-tehtävätyypin mukainen, muut oletuslistat tyhjiä. `entry=dynamic` ei itsessään luo dynaamista esitietosääntöä. Perhekohtainen rekisteriolettama ei oikeuta piilottamaan tehtävien todellisia lisävaatimuksia.

LESSON_AUDIT.md rivi 128 ilmoittaa tehty/korjattu ja uuden toiminnallisen perheen. COVERAGE.md:n perhetaulukko ei vielä sisällä tätä lisättyä perhettä. Luettelo yllä on todellisesta NodeSpecistä, ei vanhasta generoidusta listasta. Liteä ei ole muutettu.

## Korjausehdotukset / päätökset

- Keep row/column intersection from Lite demo; extend to selecting both headers and exact cell, accepting either header order.
- Correct task scope: Lite fewest and transfer demand comparison/addition absent from this canonical target; omit these demands and flag separately.
- Repeated value Vesi in two cells intentionally prevents matching the word alone from establishing the right location.
- Retain canonical process role rather than describing any single answer as table-building or data-collection mastery.

## Rajat ja näyttö

- Kanoninen process-rooli säilyy; tehtävä tarkistaa hakuprosessin, ei muodollista masteryä.
- Otsikoiden korostus on tukea, joten tulosta ei kutsuta itsenäiseksi näytöksi.
- Ei laskuja, havaintojen keräämistä, tukkimiehen merkkejä, taulukon tekemistä tai numerovaihtoehtojen tunnistamista.
- Valmiit retkisuunnitelmat ovat keksittyjä; niiden ei väitetä olevan lasten havaintoja.

Ei ihmiskatselmusta tai lapsihavaintoja. Riippumaton sisältö-, toimialue- ja UI-katselmus pääintegraattorilta odottaa. Käyttäjäreittejä ei ole tässä varmennettu; paketissa ei rakenneta oppilaspelilinkkejä.
