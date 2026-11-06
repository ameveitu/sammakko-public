# M-FRAC-01 — Lite-yhteensovitus ja Opus-korjausehdotukset

Muuttumaton lähde: authority/production-181-v2/lite. NodeSpec M-FRAC-01, globaali sisältöversio lite181-2026-10-27, oma rev ja validRevs audit1-2026-10-28.

## Todelliset perheet

- `equal`: choice: equal pie vs unequal cuts, 3–6 parts
- `count`: choice: count actual pieces in pie/bar, 3–8 parts
- `fair`: choice: equal vs unequal portions for 3–5 people
- `sortfair`: sort: equal/unequal bars and pies, 3–6 parts; actual NodeSpec addition absent from stale COVERAGE.md snapshot
- `transfer`: choice: bar for 3–5 people, reject unequal size or extra part

## Rekisteri ja audit

index.ts luettu; tavoiteoverlay tarkistettu, SIMS ei kohdista tähän. families.ts käsittelee COVERAGE_DECL- ja DECL-ylikirjoitukset sekä graafin dynaamisen säännön. Näille neljälle ei ole omaa DECL- tai coverage-riviä. `dynamic` on None; oletus outcome on choice/sort/place/numeric-tehtävätyypin mukainen, muut oletuslistat tyhjiä. `entry=dynamic` ei itsessään luo dynaamista esitietosääntöä. Perhekohtainen rekisteriolettama ei oikeuta piilottamaan tehtävien todellisia lisävaatimuksia.

LESSON_AUDIT.md rivi 110 ilmoittaa tehty/korjattu ja uuden toiminnallisen perheen. COVERAGE.md:n perhetaulukko ei vielä sisällä tätä lisättyä perhettä. Luettelo yllä on todellisesta NodeSpecistä, ei vanhasta generoidusta listasta. Liteä ei ole muutettu.

## Korjausehdotukset / päätökset

- Lite equal-size pie overlay is useful and retained conceptually; source diagrams/code are not copied.
- Extend recognition/sort into actually constructing cut locations and checking the whole partition.
- Use two/three parts initially, not Lite count range through eight. No premature notation.
- Do not generalise congruent overlap to all equal-area partitions; diagonal square exploration uses congruent halves.

## Rajat ja näyttö

- Ruudulla rakennettu rajallinen suikalemalli ei osoita mielivaltaisen kuvion tasajakoa eikä fyysistä leikkaamistaitoa.
- Ei muodollista murtolukumerkintää, murtolukulaskua tai jakolaskualgoritmia.
- Ei pisteitä, tallennusta tai osaamispäätelmää; opettaja havainnoi erikseen.

Ei ihmiskatselmusta tai lapsihavaintoja. Riippumaton sisältö-, toimialue- ja UI-katselmus pääintegraattorilta odottaa. Käyttäjäreittejä ei ole tässä varmennettu; paketissa ei rakenneta oppilaspelilinkkejä.
