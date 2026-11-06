# M-GEO-02 — Lite-yhteensovitus ja Opus-korjausehdotukset

Muuttumaton lähde: authority/production-181-v2/lite. NodeSpec M-GEO-02, globaali sisältöversio lite181-2026-10-27, oma rev ja validRevs audit1-2026-10-28.

## Todelliset perheet

- `leftRight`: choice: immediate left/right neighbour relative to named object
- `aboveBelow`: choice: straight above/below, same column
- `between`: choice: object immediately between two named neighbours in five-item shelf
- `build`: place: construct L/M/R shelf from three clues and one extra object; actual branch absent from COVERAGE.md snapshot
- `transfer`: choice: start bottom-left, 1–2 right then 1–2 up in 3x3 shelf

## Rekisteri ja audit

index.ts luettu; tavoiteoverlay tarkistettu, SIMS ei kohdista tähän. families.ts käsittelee COVERAGE_DECL- ja DECL-ylikirjoitukset sekä graafin dynaamisen säännön. Näille neljälle ei ole omaa DECL- tai coverage-riviä. `dynamic` on None; oletus outcome on choice/sort/place/numeric-tehtävätyypin mukainen, muut oletuslistat tyhjiä. `entry=dynamic` ei itsessään luo dynaamista esitietosääntöä. Perhekohtainen rekisteriolettama ei oikeuta piilottamaan tehtävien todellisia lisävaatimuksia.

LESSON_AUDIT.md rivi 74 ilmoittaa tehty/korjattu ja uuden toiminnallisen perheen. COVERAGE.md:n perhetaulukko ei vielä sisällä tätä lisättyä perhettä. Luettelo yllä on todellisesta NodeSpecistä, ei vanhasta generoidusta listasta. Liteä ei ole muutettu.

## Korjausehdotukset / päätökset

- Extend Lite choice and place branches into actual one-place movements with positional feedback.
- Make own direction explicit as screen viewer; no unstated mascot viewpoint.
- Qualify the Lite demo claim that between means adjacent to both: true only for its chosen shelf arrangement, not a general definition.
- No mirror reversal, numeric coordinates or required left/right hand identification.

## Rajat ja näyttö

- Vasen/oikea tarkoittaa tässä aivan viereistä paikkaa samalla hyllyllä ja ylä/ala suoraan kohdalla olevaa paikkaa.
- Välissä tarkoittaa tässä kirjojen rajaamaa alahyllyn paikkaa; ei yleistä sääntöä että välissä on täsmälleen puolivälissä tai kummankin vieressä.
- Toiminta ei osoita suunnistusta, kaikkien katselukulmien hallintaa tai liikkumistaitoa oikeassa ympäristössä.

Ei ihmiskatselmusta tai lapsihavaintoja. Riippumaton sisältö-, toimialue- ja UI-katselmus pääintegraattorilta odottaa. Käyttäjäreittejä ei ole tässä varmennettu; paketissa ei rakenneta oppilaspelilinkkejä.
